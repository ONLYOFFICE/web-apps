import i18n from 'i18next'
import {initReactI18next} from 'react-i18next'
import Fetch from 'i18next-fetch-backend'

i18n.use(initReactI18next)
    .use(Fetch)
    .init({
        lng: Common.Locale.currentLang,
        fallbackLng: Common.Locale.defaultLang,
        escapeValue: false,
        backend: {
            loadPath: './locale/{{lng}}.json'
        },
        interpolation: { escapeValue: false },
        react: {
            useSuspense: false,
        },
    }).then(() => {
        console.log("i18next is ready");
    })
    .catch((error) => {
        console.error("i18next initialization error:", error);
    });

i18n.on('failedLoading', (lng, ns, msg) => {
    console.log(msg);
});

export default i18n;