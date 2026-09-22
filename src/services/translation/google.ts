import { ITranslationProvider, Language, TranslationResult } from "./types";
import { SUPPORTED_LANGUAGES } from "./languages";

export class GoogleCloudTranslationProvider implements ITranslationProvider {
  readonly name = "Google Cloud Translation";
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GOOGLE_TRANSLATE_API_KEY || "";
  }

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

    if (!this.apiKey) {
      throw new Error(
        "Google Cloud Translation API key is not configured. Set GOOGLE_TRANSLATE_API_KEY in your .env file or use TRANSLATION_PROVIDER=mymemory."
      );
    }

    const url = `https://translation.googleapis.com/language/translate/v2?key=${this.apiKey}`;
    const requestBody: Record<string, any> = {
      q: trimmed,
      target: targetLang,
      format: "text",
    };

    if (sourceLang && sourceLang !== "auto") {
      requestBody.source = sourceLang;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data?.error?.message || `Google Translate error HTTP ${res.status}`;
        throw new Error(errorMsg);
      }

      const translation = data?.data?.translations?.[0];
      if (!translation) {
        throw new Error("No translation returned by Google Cloud Translation");
      }

      return {
        translatedText: translation.translatedText,
        detectedSourceLanguage: translation.detectedSourceLanguage || sourceLang,
        provider: this.name,
        charCount: trimmed.length,
      };
    } catch (err: any) {
      if (err.name === "AbortError") {
        throw new Error("Google Cloud Translation request timed out after 10 seconds.");
      }
      throw new Error(`Google Cloud Translation error: ${err.message}`);
    }
  }
}
