import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import common from "@/i18n/locales/fr/common.json";
import episode from "@/i18n/locales/fr/episode.json";
import errors from "@/i18n/locales/fr/errors.json";
import genre from "@/i18n/locales/fr/genre.json";
import series from "@/i18n/locales/fr/series.json";
import user from "@/i18n/locales/fr/user.json";

await i18n.use(initReactI18next).init({
  resources: {
    fr: { common, user, series, episode, errors, genre }
  },
  lng: "fr",
  fallbackLng: "fr",
  supportedLngs: ["fr"],
  defaultNS: "common",
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
