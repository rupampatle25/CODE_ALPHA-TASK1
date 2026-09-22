import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getTranslationProvider } from "@/services/translation/factory";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkUserQuota, recordUsage } from "@/services/usage/tracker";

const translateRequestSchema = z.object({
  text: z
    .string({ required_error: "Text is required" })
    .trim()
    .min(1, "Text cannot be empty")
    .max(5000, "Text exceeds the 5,000 character limit"),
  sourceLang: z.string().default("auto"),
  targetLang: z.string({ required_error: "Target language is required" }).min(2),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = translateRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.errors[0]?.message || "Invalid input data",
        },
        { status: 400 }
      );
    }

    const { text, sourceLang, targetLang } = validation.data;
    const session = await getSession();

    // If user is logged in, check quota
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
    }

    // Handle identical source and target
    if (sourceLang !== "auto" && sourceLang === targetLang) {
      return NextResponse.json({
        success: true,
        data: {
          translatedText: text,
          detectedSourceLanguage: sourceLang,
          provider: "Identity Check",
          charCount: text.length,
        },
      });
    }

    const provider = getTranslationProvider();
    const result = await provider.translate(text, sourceLang, targetLang);

    // If logged in, save to translation history & record usage
    if (session) {
      await db.translation.create({
        data: {
          userId: session.userId,
          sourceLang: result.detectedSourceLanguage || sourceLang,
          targetLang,
          sourceText: text,
          translatedText: result.translatedText,
          provider: result.provider,
          charCount: result.charCount,
        },
      });

      await recordUsage(session.userId, result.charCount, "TRANSLATE");
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("API /api/translate error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unexpected error occurred during translation.",
      },
      { status: 500 }
    );
  }
}
