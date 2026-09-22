import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const provider = req.headers.get("x-payment-provider") || "RAZORPAY";
    const razorpaySignature = req.headers.get("x-razorpay-signature");
    const stripeSignature = req.headers.get("stripe-signature");

    let eventId = "";
    let eventType = "";
    let userId = "";
    let planSlug = "pro";

    // 1. Signature Verification (if production webhook secret configured)
    if (provider === "RAZORPAY" && process.env.RAZORPAY_WEBHOOK_SECRET && razorpaySignature) {
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== razorpaySignature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody || "{}");
    eventId = payload.id || payload.event_id || `evt_${Date.now()}`;
    eventType = payload.event || payload.type || "subscription.activated";
    userId = payload.userId || payload.notes?.userId || "";

    // 2. IDEMPOTENCY CHECK: Prevent duplicate processing
    const existingEvent = await db.paymentEvent.findUnique({
      where: { eventId },
    });

    if (existingEvent) {
      console.log(`[Webhook] Duplicate event received and ignored: ${eventId}`);
      return NextResponse.json({
        received: true,
        idempotent: true,
        message: "Event already processed.",
      });
    }

    // 3. Record the Payment Event
    await db.paymentEvent.create({
      data: {
        provider,
        eventId,
        eventType,
        status: "PROCESSED",
        payload: rawBody.slice(0, 1000), // store snippet
      },
    });

    // 4. Update Entitlement if user is present
    if (userId) {
      const proPlan = await db.plan.findUnique({ where: { slug: planSlug } });
      if (proPlan) {
        const existingSub = await db.subscription.findFirst({ where: { userId } });
        if (existingSub) {
          await db.subscription.update({
            where: { id: existingSub.id },
            data: { planId: proPlan.id, status: "ACTIVE", provider },
          });
        }
      }
    }

    return NextResponse.json({
      received: true,
      status: "success",
      eventId,
    });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook handling failed", details: error.message },
      { status: 500 }
    );
  }
}
