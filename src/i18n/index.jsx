import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { th } from "./th";
import { en } from "./en";

const DICTIONARIES = { th, en };
const LANG_KEY = "app_lang";
const DEFAULT_LANG = "th";

const LangContext = createContext(null);

/**
 * Two-language UI (th/en) with no external i18n dependency. The choice lives in
 * localStorage so it survives reloads, and <html lang> follows along for the
 * browser's benefit. Components read strings with `t("key.name")` from useI18n();
 * `t("key", { count: 5 })` fills {count} placeholders in the dictionary value.
 */
export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem(LANG_KEY);
    return saved === "en" || saved === "th" ? saved : DEFAULT_LANG;
  });

  const setLang = useCallback((next) => {
    localStorage.setItem(LANG_KEY, next);
    setLangState(next);
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === "th" ? "en" : "th");
  }, [lang, setLang]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => {
    const dict = DICTIONARIES[lang] || DICTIONARIES[DEFAULT_LANG];
    const t = (key, vars) => {
      let text = dict[key] ?? en[key] ?? key;
      if (vars) {
        for (const [name, val] of Object.entries(vars)) {
          text = text.replaceAll(`{${name}}`, String(val));
        }
      }
      return text;
    };
    return { lang, setLang, toggleLang, t };
  }, [lang, setLang, toggleLang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LangContext);
  if (!ctx) {
    throw new Error("useI18n must be used inside <LanguageProvider>");
  }
  return ctx;
}
