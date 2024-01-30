
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

if(isLocalStorageAvailable()) {
    if(localStorage.getItem('mobile-mode-direction') === 'rtl') {
        load_stylesheet('./css/framework7-rtl.css');
        document.body.classList.add('rtl');
    } else {
        load_stylesheet('./css/framework7.css')
    }
} else {
    load_stylesheet('./css/framework7.css')
}

let obj = !isLocalStorageAvailable() ? {id: 'theme-light', type: 'light'} : JSON.parse(localStorage.getItem("mobile-ui-theme"));

if ( !obj ) {
    let theme_type = window.native?.editorConfig?.theme?.type;
    if ( !theme_type && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches )
        theme_type = "dark";

    obj = theme_type == 'dark' ?
        {id: 'theme-dark', type: 'dark'} : {id: 'theme-light', type: 'light'};
    // localStorage && localStorage.setItem("mobile-ui-theme", JSON.stringify(obj));

    if(isLocalStorageAvailable()) {
        localStorage.setItem("mobile-ui-theme", JSON.stringify(obj));
    }
}

document.body.classList.add(`theme-type-${obj.type}`, `${window.asceditor}-editor`);
