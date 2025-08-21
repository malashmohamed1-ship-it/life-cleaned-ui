import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";          // ensure Node runtime (not edge)
export const dynamic = "force-dynamic";   // avoid caching for API

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * POST /api/pay/create-intent
 * body: { amount: number, currency?: string }   // amount in cents
 */
export async function POST(req) {
  try {
    const { amount, currency = "usd" } = await req.json();

    if (!amount || amount < 50) {
      return NextResponse.json(
        { error: "Amount must be at least 50 (i.e., $0.50)" },
        { status: 400 }
      );
    }

    const intent = await stripe.paymentIntents.create({
      amount,                 // e.g., 199 = $1.99
      currency,               // 'usd'
      automatic_payment_methods: { enabled: true }, // Apple/Google Pay + cards
    });

    return NextResponse.json({ clientSecret: intent.client_secret });
  } catch (err) {
    console.error("Stripe create-intent error:", err);
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 });
  }
}
