import { ITranslationProvider } from "./types";
import { MyMemoryTranslationProvider } from "./mymemory";
import { GoogleCloudTranslationProvider } from "./google";
import { MockTranslationProvider } from "./mock";

export function getTranslationProvider(providerName?: string): ITranslationProvider {
  const chosen = providerName || process.env.TRANSLATION_PROVIDER || "mymemory";

  switch (chosen.toLowerCase()) {
    case "google":
      return new GoogleCloudTranslationProvider();
    case "mock":
      return new MockTranslationProvider();
    case "mymemory":
    default:
      return new MyMemoryTranslationProvider();
  }
}
