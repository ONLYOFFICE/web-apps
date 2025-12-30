
const load_stylesheet = reflink => {
    let link = document.createElement( "link" );
    link.href = reflink;
    // link.type = "text/css";
    link.rel = "stylesheet";

    document.getElementsByTagName("head")[0].appendChild(link);
};

if(!!window.Android && window.Android.editorConfig) {
    window.native = {editorConfig: window.Android.editorConfig()}
}

function isLocalStorageAvailable() {
    try {
        const testKey = 'test';
        localStorage.setItem(testKey, '1');
        localStorage.removeItem(testKey);

        return true;
    } catch (e) {
        return false;
    }
}

{
    let lang = (/(?:&|^)lang=([^&]+)&?/i).exec(window.location.search.substring(1));
    lang = ((lang && lang[1]) || window.Common.Locale.defaultLang).split(/[\-\_]/)[0];
    Common.Locale.currentLang = lang;
    Common.Locale.isCurrentLangRtl = lang && (/^(ar|he|ur)$/i.test(lang));
}

{
    if (Common.Locale.isCurrentLangRtl) {
        load_stylesheet('./css/framework7-rtl.css');
        document.body.classList.add('rtl');
    } else {
        load_stylesheet('./css/framework7.css')
    }
}

function getUrlParam(param) {
    const url = new URL(window.location.href);
    return url.searchParams.get(param);
}

const uithemeParam = getUrlParam('uitheme');

const supportedThemes = {
    'theme-light': 'light',
    'theme-dark': 'dark',
    'default-light': 'light',
    'default-dark': 'dark'
};

let obj;
isLocalStorageAvailable() && (obj = JSON.parse(localStorage.getItem("mobile-ui-theme-client")));

if (!obj) {
    if (uithemeParam && supportedThemes[uithemeParam]) {
        obj = {
            id: uithemeParam,
            type: supportedThemes[uithemeParam]
        };
    } else {
        let theme_type = window.native?.editorConfig?.theme?.type;
        if (!theme_type && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) theme_type = 'dark';

        const id = theme_type === 'dark' ? 'theme-dark' : 'theme-light';
        obj = {
            id,
            type: supportedThemes[id]
        }
    }
}

window.mobileUiTheme = obj;
document.body.classList.add(`theme-type-${obj.type}`, `${window.asceditor}-editor`);
