import { Language } from "../../components/LanguageDropdown";
import { en } from "./en";
import { vi } from "./vi";

// Combined translations object
export const translations = {
  en,
  vi,
} as const;

export type TranslationKey = keyof typeof en;
