export interface Language {
  code: string;
  name: string;
  nativeName?: string;
  flag?: string;
}

export interface TranslationResult {
  translatedText: string;
  detectedSourceLanguage?: string;
  provider: string;
  charCount: number;
}

export interface ITranslationProvider {
  readonly name: string;
  translate(text: string, sourceLang: string, targetLang: string): Promise<TranslationResult>;
  getSupportedLanguages(): Language[];
}
