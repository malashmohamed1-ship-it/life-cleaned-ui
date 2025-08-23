// app/api/pay/webhook/route.js
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  // Stripe sends a raw body. In the App Router, req.text() gives the raw string.
  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  try {
    const event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log("✅ Webhook received:", event.type);

    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object;
      console.log("💰 PaymentIntent succeeded:", pi.id, pi.amount);
      // (Optional) Write to DB here with Admin SDK later
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("❌ Webhook signature verify failed:", err.message);
    return new NextResponse("Bad signature", { status: 400 });
  }
}
