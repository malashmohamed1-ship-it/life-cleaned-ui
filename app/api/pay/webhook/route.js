import { NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-07-30.basil",
});

// Next.js (app router) requires raw body for Stripe signature
export const config = {
  api: { bodyParser: false },
};

export async function POST(req) {
  // 1) Verify signature
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

  console.log("✅ Webhook received:", event.type);

  try {
    const type = event.type;

    // PaymentIntent events
    if (type === "payment_intent.created" || type === "payment_intent.succeeded") {
      const pi = event.data.object; // PaymentIntent

      // Reliable email extraction:
      // 1) receipt_email (if Stripe set/returned it)
      // 2) metadata.email (we sent this when creating the intent)
      // 3) charges.data[0].billing_details.email (some payment methods)
      const firstCharge = Array.isArray(pi.charges?.data) ? pi.charges.data[0] : undefined;

      const extractedEmail =
        pi.receipt_email ??
        pi.metadata?.email ??
        firstCharge?.billing_details?.email ??
        null;

      await adminDb.collection("payments").doc(pi.id).set(
        {
          status: pi.status,
          amount: pi.amount,
          currency: pi.currency,
          customer: pi.customer ?? null,
          email: extractedEmail,
          created: pi.created,
          lastEvent: type,
        },
        { merge: true }
      );
    }

    // Charge events (optional but nice to have)
    if (type === "charge.succeeded" || type === "charge.updated") {
      const ch = event.data.object; // Charge
      const billingEmail = ch.billing_details?.email ?? null;

      await adminDb.collection("charges").doc(ch.id).set(
        {
          status: ch.status,
          amount: ch.amount,
          currency: ch.currency,
          customer: ch.customer ?? null,
          payment_intent: ch.payment_intent ?? null,
          receipt_email: ch.receipt_email ?? billingEmail,
          created: ch.created,
          lastEvent: type,
        },
        { merge: true }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}