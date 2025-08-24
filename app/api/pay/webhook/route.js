import { NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// IMPORTANT: Vercel → Project Settings → Environment Variables must include:
// STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, FIREBASE_* (admin creds)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY /*, { apiVersion: "2025-07-30.basil" }*/);

// ⚠️ keep raw body for Stripe signature verification
export const config = { api: { bodyParser: false } };

export async function POST(req) {
  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature check failed:", err?.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const type = event.type;
  console.log("✅ Webhook received:", type);

  try {
    // ---- Handle PaymentIntent events ---------------------------------------
    if (type === "payment_intent.created" || type === "payment_intent.succeeded") {
      const pi = event.data.object; // PaymentIntent

      // Find email in several places
      let email =
        pi.receipt_email ||
        (pi.metadata && pi.metadata.email) ||
        null;

      // If still missing, and there is a customer, fetch the customer’s email
      if (!email && pi.customer) {
        try {
          const cust = await stripe.customers.retrieve(pi.customer);
          if (!cust.deleted && cust.email) email = cust.email;
        } catch (e) {
          console.warn("Could not retrieve customer for email:", e.message);
        }
      }

      await adminDb.collection("payments").doc(pi.id).set(
        {
          status: pi.status,
          amount: pi.amount,
          currency: pi.currency,
          customer: pi.customer ?? null,
          email: email ?? null,
          created: pi.created,
          lastEvent: type,
        },
        { merge: true }
      );
    }

    // ---- Handle Charge events ----------------------------------------------
    if (type === "charge.succeeded" || type === "charge.updated") {
      const ch = event.data.object; // Charge

      // Charges often contain email directly
      let receiptEmail =
        ch.receipt_email ||
        (ch.billing_details && ch.billing_details.email) ||
        null;

      // If still missing, try to pull from the customer record
      if (!receiptEmail && ch.customer) {
        try {
          const cust = await stripe.customers.retrieve(ch.customer);
          if (!cust.deleted && cust.email) receiptEmail = cust.email;
        } catch (e) {
          console.warn("Could not retrieve customer for charge email:", e.message);
        }
      }

      await adminDb.collection("charges").doc(ch.id).set(
        {
          status: ch.status,
          amount: ch.amount,
          currency: ch.currency,
          customer: ch.customer ?? null,
          payment_intent: ch.payment_intent ?? null,
          receipt_email: receiptEmail ?? null,
          created: ch.created,
          lastEvent: type,
        },
        { merge: true }
      );
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
