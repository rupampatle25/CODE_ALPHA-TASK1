import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { checkUserQuota, recordUsage } from "@/services/usage/tracker";
import { adaptTextTone } from "@/services/ai/toneAdapter";

const toneRequestSchema = z.object({
  text: z
    .string({ required_error: "Text is required" })
    .trim()
    .min(1, "Text cannot be empty")
    .max(5000, "Text exceeds the 5,000 character limit"),
  tone: z.enum(["formal", "casual", "professional", "simple"], {
    errorMap: () => ({ message: "Tone must be formal, casual, professional, or simple" }),
  }),
  targetLang: z.string({ required_error: "Target language code is required" }).min(2),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = toneRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.errors[0]?.message || "Invalid input data",
        },
        { status: 400 }
      );
    }

    const { text, tone, targetLang } = validation.data;
    const session = await getSession();

    // Enforce quota limits for authenticated accounts
    if (session) {
      const quota = await checkUserQuota(session.userId, text.length);
      if (!quota.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: `Monthly quota exceeded. You have used ${quota.currentUsage.toLocaleString()} / ${quota.limit.toLocaleString()} characters on your ${quota.planName} plan. Upgrade to Pro for 100,000 characters.`,
            quotaExceeded: true,
          },
          { status: 429 }
        );
      }
    } else {
      // Unauthenticated demo fair-use limit
      if (text.length > 1500) {
        return NextResponse.json(
          {
            success: false,
            error: "Unauthenticated trial limit is 1,500 characters. Please sign in for full 5,000 character limits.",
          },
          { status: 403 }
        );
      }
    }

    // Perform AI Tone Adaptation
    const result = await adaptTextTone({
      text,
      tone,
      targetLang,
    });

    // Record character usage if logged in
    if (session) {
      await recordUsage(session.userId, result.charCount, "BUSINESS_ASSISTANT");
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `Text adapted successfully to ${tone} tone.`,
    });
  } catch (error: any) {
    console.error("AI Tone Adaptation Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to adapt tone. Please try again.",
      },
      { status: 500 }
    );
  }
}
