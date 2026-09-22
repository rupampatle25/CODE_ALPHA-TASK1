import { ITranslationProvider, Language, TranslationResult } from "./types";
import { SUPPORTED_LANGUAGES } from "./languages";

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export class MyMemoryTranslationProvider implements ITranslationProvider {
  readonly name = "MyMemory (Translated.net)";

  getSupportedLanguages(): Language[] {
    return SUPPORTED_LANGUAGES;
  }

  async translate(text: string, sourceLang: string, targetLang: string): Promise<TranslationResult> {
    const trimmed = text.trim();
    if (!trimmed) {
      return {
        translatedText: "",
        provider: this.name,
        charCount: 0,
      };
    }

    const pairSource = sourceLang === "auto" ? "autodetect" : sourceLang;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      trimmed
    )}&langpair=${pairSource}|${targetLang}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`MyMemory API returned HTTP status ${res.status}`);
      }

      const data = await res.json();

      if (data.responseStatus !== 200 && data.responseStatus !== "200") {
        const errorMsg = data.responseDetails || "Translation failed";
        throw new Error(errorMsg);
      }

      const translated = decodeHtmlEntities(data.responseData?.translatedText || "");
      const detectedSource = data.responseData?.detectedLanguage || (sourceLang !== "auto" ? sourceLang : "en");

      return {
        translatedText: translated,
        detectedSourceLanguage: detectedSource,
        provider: this.name,
        charCount: trimmed.length,
      };
    } catch (err: any) {
      if (err.name === "AbortError") {
        throw new Error("Translation request timed out after 10 seconds. Please try again.");
      }
      throw new Error(`Translation error: ${err.message || "Failed to reach translation service"}`);
    }
  }
}
