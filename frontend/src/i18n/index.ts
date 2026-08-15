import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import common from "./locales/fr/common.json";
import user from "./locales/fr/user.json";
import series from "./locales/fr/series.json";
import episode from "./locales/fr/episode.json";
import errors from "./locales/fr/errors.json";

await i18n.use(initReactI18next).init({
  resources: {
    fr: { common, user, series, episode, errors }
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
