import { NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const sig = req.headers.get("stripe-signature");
    const rawBody = await req.text(); // IMPORTANT: read raw text
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, secret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json({ error: "Bad signature" }, { status: 400 });
    }

    // Handle a few useful events
    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object; // PaymentIntent
      console.log("✅ Webhook received: payment_intent.succeeded", pi.id, pi.amount);
      await adminDb
        .collection("payments")
        .doc(pi.id)
        .set(
          {
            status: pi.status,
            amount: pi.amount,
            currency: pi.currency,
            customer: pi.customer ?? null,
            created: pi.created,
            updatedAt: Date.now(),
            source: "webhook",
          },
          { merge: true }
        );
    } else if (event.type === "payment_intent.created") {
      const pi = event.data.object;
      console.log("✅ Webhook received: payment_intent.created", pi.id);
      await adminDb
        .collection("payments")
        .doc(pi.id)
        .set(
          {
            status: pi.status,
            amount: pi.amount,
            currency: pi.currency,
            created: pi.created,
            updatedAt: Date.now(),
            source: "webhook",
          },
          { merge: true }
        );
    } else if (event.type === "charge.succeeded") {
      const ch = event.data.object;
      console.log("✅ Webhook received: charge.succeeded", ch.id);
      await adminDb
        .collection("charges")
        .doc(ch.id)
        .set(
          {
            status: ch.status,
            amount: ch.amount,
            currency: ch.currency,
            payment_intent: ch.payment_intent ?? null,
            created: ch.created,
            updatedAt: Date.now(),
            source: "webhook",
          },
          { merge: true }
        );
    }

    return new NextResponse(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Tell Next to give us the raw body for this route (needed for Stripe signatures)
export const config = {
  api: {
    bodyParser: false,
  },
};
