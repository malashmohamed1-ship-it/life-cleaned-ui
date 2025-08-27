import { NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-07-30.basil",
});

export async function POST(req) {
  // Stripe requires the raw body for signature verification
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
    console.error("❌ Invalid Stripe signature:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const type = event.type;
  console.log("✅ Webhook received:", type);

  try {
    // Helper to upsert a document
    const upsert = (col, id, data) =>
      adminDb.collection(col).doc(id).set(data, { merge: true });

    if (type === "payment_intent.succeeded" || type === "payment_intent.created") {
      // The event's object may not include all fields we want, so re-fetch with expansions
      const evtPI = event.data.object; // may be partial
      const intent = await stripe.paymentIntents.retrieve(evtPI.id, {
        expand: ["latest_charge", "latest_charge.billing_details"],
      });

      // Try every possible source of email in priority order
      const email =
        intent.receipt_email ||
        (intent.metadata && intent.metadata.email) ||
        intent.latest_charge?.billing_details?.email ||
        null;

      await upsert("payments", intent.id, {
        status: intent.status,
        amount: intent.amount,
        currency: intent.currency,
        customer: intent.customer ?? null,
        email, // <-- now robust
        created: intent.created,
        lastEvent: type,
      });
    }

    if (type === "charge.succeeded" || type === "charge.updated") {
      const ch = event.data.object; // Charge
      const email =
        ch.receipt_email ||
        ch.billing_details?.email ||
        null;

      await upsert("charges", ch.id, {
        status: ch.status,
        amount: ch.amount,
        currency: ch.currency,
        customer: ch.customer ?? null,
        payment_intent: ch.payment_intent ?? null,
        receipt_email: email, // <-- use receipt or billing_details
        created: ch.created,
        lastEvent: type,
      });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

// Keep raw body for Stripe signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};