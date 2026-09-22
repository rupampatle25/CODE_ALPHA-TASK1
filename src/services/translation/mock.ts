import { ITranslationProvider, Language, TranslationResult } from "./types";
import { SUPPORTED_LANGUAGES } from "./languages";

export class MockTranslationProvider implements ITranslationProvider {
  readonly name = "Mock Offline Provider";

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

    // Deterministic simulation for tests without internet
    const translatedText = `[${targetLang.toUpperCase()}] ${trimmed}`;
    return {
      translatedText,
      detectedSourceLanguage: sourceLang === "auto" ? "en" : sourceLang,
      provider: this.name,
      charCount: trimmed.length,
    };
  }
}
