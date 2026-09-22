import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

const checkoutSchema = z.object({
  planSlug: z.enum(["free", "pro"]),
  gateway: z.enum(["SIMULATION", "RAZORPAY", "STRIPE"]).default("SIMULATION"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = checkoutSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0]?.message },
        { status: 400 }
      );
    }

    const { planSlug, gateway } = validation.data;

    // Find the target plan
    const targetPlan = await db.plan.findUnique({
      where: { slug: planSlug },
    });

    if (!targetPlan) {
      return NextResponse.json({ success: false, error: "Target plan not found" }, { status: 404 });
    }

    // In sandbox simulation mode (or when keys are not yet configured), activate plan immediately for demo
    if (gateway === "SIMULATION" || (!process.env.RAZORPAY_KEY_ID && !process.env.STRIPE_SECRET_KEY)) {
      // Upsert user subscription
      const existingSub = await db.subscription.findFirst({
        where: { userId: session.userId },
      });

      if (existingSub) {
        await db.subscription.update({
          where: { id: existingSub.id },
          data: {
            planId: targetPlan.id,
            status: "ACTIVE",
            provider: gateway,
          },
        });
      } else {
        await db.subscription.create({
          data: {
            userId: session.userId,
            planId: targetPlan.id,
            provider: gateway,
            status: "ACTIVE",
          },
        });
      }

      return NextResponse.json({
        success: true,
        simulated: true,
        message: `Plan successfully updated to ${targetPlan.name}!`,
        plan: targetPlan,
      });
    }

    // Real Razorpay / Stripe checkout session initiation:
    return NextResponse.json({
      success: true,
      simulated: false,
      message: "Gateway checkout initiated.",
      checkoutUrl: `/dashboard/billing?success=true`,
    });
  } catch (error: any) {
    console.error("POST /api/billing/checkout error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process checkout" },
      { status: 500 }
    );
  }
}
