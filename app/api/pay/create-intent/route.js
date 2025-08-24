import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY /*, { apiVersion: "2025-07-30.basil" }*/);

export async function POST(req) {
  try {
    const { amount, currency = "usd", email } = await req.json();

    if (!amount || amount < 50) {
      return NextResponse.json({ error: "Amount must be at least 50" }, { status: 400 });
    }

    // Attach a customer if we have an email (helps receipts + webhooks)
    let customerId;
    if (email && typeof email === "string") {
      const customer = await stripe.customers.create({ email });
      customerId = customer.id;
    }

    const intent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
      customer: customerId,                   // 👈 tie to a customer when we have an email
      receipt_email: email || undefined,      // 👈 ask Stripe to send a receipt
      metadata: { email: email || "" },       // 👈 fallback for our own logs
      // setup_future_usage: "off_session",   // optional: helps future one-click payments
    });

    return NextResponse.json({ clientSecret: intent.client_secret });
  } catch (err) {
    console.error("Stripe create-intent error:", err);
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 });
  }
}

