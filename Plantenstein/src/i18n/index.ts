import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as SecureStore from "expo-secure-store";
import * as Localization from "expo-localization";

import en from "./locales/en.json";
import hi from "./locales/hi.json";

const resources = {
  en: { translation: en },
  hi: { translation: hi },
};

const LANGUAGE_KEY = "user-language";

// Get initial language based on device settings
const locales = Localization.getLocales();
const deviceLocale = locales && locales.length > 0 ? locales[0].languageCode : "en";
const initialLanguage = resources[deviceLocale as keyof typeof resources] ? deviceLocale : "en";

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

// Asynchronously load the saved language
const loadSavedLanguage = async () => {
  try {
    const savedLanguage = await SecureStore.getItemAsync(LANGUAGE_KEY);
    if (savedLanguage && savedLanguage !== i18n.language) {
      await i18n.changeLanguage(savedLanguage);
    }
  } catch (error) {
    console.warn("SecureStore is unavailable, using default language");
  }
};

loadSavedLanguage();

export default i18n;
