// app/api/pay/webhook/route.js
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "../../../../lib/firebaseAdmin";

export const runtime = "nodejs";        // ensure Node runtime on Vercel
export const dynamic = "force-dynamic"; // always run at the edge of serverless

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

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
    console.error("❌ Webhook signature verify failed:", err.message);
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  console.log("✅ Webhook received:", event.type);

  try {
    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object;
      console.log("💰 PaymentIntent succeeded:", pi.id, pi.amount);

      // persist to Firestore (server/admin)
      await adminDb.collection("payments").add({
        stripeId: pi.id,
        amount: pi.amount,
        currency: pi.currency,
        status: pi.status,
        createdAt: new Date(),
        source: "vercel-webhook",
      });
    } else if (event.type === "payment_intent.payment_failed") {
      const pi = event.data.object;
      console.warn("⚠️ PaymentIntent failed:", pi.id);
    }
  } catch (e) {
    console.error("🔥 Webhook handler error:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

// Important: Next.js needs the raw body for Stripe verification
export const config = {
  api: {
    bodyParser: false,
  },
};
