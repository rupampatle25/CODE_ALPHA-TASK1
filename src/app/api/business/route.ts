import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { getTranslationProvider } from "@/services/translation/factory";
import { checkUserQuota, recordUsage } from "@/services/usage/tracker";

const businessRequestSchema = z.object({
  productName: z.string().min(2, "Product name is required").max(120),
  features: z.string().min(10, "Please provide at least 10 characters of product details").max(2000),
  sourceLang: z.string().default("en"),
  targetLang: z.string().min(2),
  tone: z.enum(["professional", "persuasive", "casual"]).default("professional"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const validation = businessRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0]?.message },
        { status: 400 }
      );
    }

    const { productName, features, sourceLang, targetLang, tone } = validation.data;

    // Check quota
    const totalInputChars = productName.length + features.length;
    const quota = await checkUserQuota(session.userId, totalInputChars);
    if (!quota.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Monthly quota exceeded (${quota.currentUsage.toLocaleString()} / ${quota.limit.toLocaleString()} chars). Upgrade to Pro to continue.`,
        },
        { status: 429 }
      );
    }

    // Generate localized marketing text structure based on tone
    let headlinePrefix = "Discover";
    let bodyIntro = "Introducing the all-new";
    let bulletPrefix = "Key Feature:";

    if (tone === "persuasive") {
      headlinePrefix = "Upgrade your lifestyle with";
      bodyIntro = "Experience superior quality and effortless performance with";
      bulletPrefix = "Why you will love it:";
    } else if (tone === "casual") {
      headlinePrefix = "Meet your new favorite";
      bodyIntro = "Say goodbye to ordinary and say hello to";
      bulletPrefix = "Highlights:";
    }

    const compiledSource = `${headlinePrefix} ${productName}.\n\n${bodyIntro} ${productName}. Designed with premium materials and built for lasting satisfaction.\n\n${bulletPrefix}\n${features}`;

    const provider = getTranslationProvider();
    const translationResult = await provider.translate(compiledSource, sourceLang, targetLang);

    // Record usage
    await recordUsage(session.userId, translationResult.charCount, "BUSINESS_ASSISTANT");

    return NextResponse.json({
      success: true,
      data: {
        productName,
        tone,
        targetLang,
        localizedListing: translationResult.translatedText,
        provider: translationResult.provider,
        charCount: translationResult.charCount,
      },
    });
  } catch (error: any) {
    console.error("POST /api/business error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate localized description" },
      { status: 500 }
    );
  }
}
