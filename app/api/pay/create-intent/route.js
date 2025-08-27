import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-07-30.basil",
});

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { amount, currency = "usd", email } = body || {};

    // 🔎 Log what the client actually sent
    console.log("[create-intent] body:", JSON.stringify(body));

    if (!amount || amount < 50) {
      return NextResponse.json({ error: "Amount must be at least 50" }, { status: 400 });
    }

    const intent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
      // Store email in both places so the webhook can read one of them:
      receipt_email: email || undefined,
      metadata: { email: email || "" },
    });

    // 🔎 Log what Stripe stored on the PI
    console.log("[create-intent] PI:", {
      id: intent.id,
      receipt_email: intent.receipt_email,
      metadata_email: intent.metadata?.email,
    });

    return NextResponse.json({
      clientSecret: intent.client_secret,
      debug: {
        receivedEmailFromClient: email || null,
        storedReceiptEmail: intent.receipt_email || null,
        storedMetadataEmail: intent.metadata?.email || null,
      },
    });
  } catch (err) {
    console.error("Stripe create-intent error:", err);
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 });
  }
}
