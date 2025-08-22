import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { amount, currency = "usd" } = await req.json();
    if (!amount || amount < 50) {
      return NextResponse.json({ error: "Amount must be at least 50" }, { status: 400 });
    }
    const intent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
    });
    return NextResponse.json({ clientSecret: intent.client_secret });
  } catch (err) {
    console.error("Stripe create-intent error:", err);
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 });
  }
}
