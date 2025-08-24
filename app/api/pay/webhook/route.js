import { NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-07-30.basil",
});

export async function POST(req) {
  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log("✅ Webhook received:", event.type);
  const type = event.type;

  try {
    if (type === "payment_intent.succeeded" || type === "payment_intent.created") {
      const pi = event.data.object; // PaymentIntent
      await adminDb.collection("payments").doc(pi.id).set(
        {
          status: pi.status,
          amount: pi.amount,
          currency: pi.currency,
          customer: pi.customer ?? null,
          // Try PI first; may still be empty until the charge event arrives
          email: pi.receipt_email ?? pi.metadata?.email ?? null,
          created: pi.created,
          lastEvent: type,
        },
        { merge: true }
      );
    }

    if (type === "charge.succeeded" || type === "charge.updated") {
      const ch = event.data.object; // Charge
      const chargeEmail = ch.billing_details?.email ?? ch.receipt_email ?? null;

      // 1) Write/merge the charge document
      await adminDb.collection("charges").doc(ch.id).set(
        {
          status: ch.status,
          amount: ch.amount,
          currency: ch.currency,
          customer: ch.customer ?? null,
          payment_intent: ch.payment_intent ?? null,
          receipt_email: ch.receipt_email ?? null,
          created: ch.created,
          lastEvent: type,
        },
        { merge: true }
      );

      // 2) Also backfill email onto the related Payment doc (this is the key bit)
      if (ch.payment_intent && chargeEmail) {
        await adminDb.collection("payments").doc(ch.payment_intent).set(
          {
            email: chargeEmail,
            lastEvent: type, // optional: reflects latest source of truth
          },
          { merge: true }
        );
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

// Keep raw body for Stripe verification
export const config = { api: { bodyParser: false } };
