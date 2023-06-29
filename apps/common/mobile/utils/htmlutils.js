
const load_stylesheet = reflink => {
    let link = document.createElement( "link" );
    link.href = reflink;
    // link.type = "text/css";
    link.rel = "stylesheet";

    document.getElementsByTagName("head")[0].appendChild(link);
};

if ( !!window.Android && window.Android.editorConfig ) {
    window.native = {editorConfig: window.Android.editorConfig()}
}

if ( localStorage && localStorage.getItem('mobile-mode-direction') === 'rtl' ) {
    load_stylesheet('./css/framework7-rtl.css')
    document.body.classList.add('rtl');
} else {
    load_stylesheet('./css/framework7.css')
}

let obj = !localStorage ? {id: 'theme-light', type: 'light'} : JSON.parse(localStorage.getItem("mobile-ui-theme"));
if ( !obj ) {
    if ( window.native && window.native.theme ) {
        if ( window.native.theme.type == 'dark' ) obj = {id: 'theme-dark', type: 'dark'};
        else if ( window.native.theme.type == 'light' ) obj = {id: 'theme-light', type: 'light'};
    }

    if ( !obj )
        obj = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ?
            {id: 'theme-dark', type: 'dark'} : {id: 'theme-light', type: 'light'};

    localStorage && localStorage.setItem("mobile-ui-theme", JSON.stringify(obj));
}

document.body.classList.add(`theme-type-${obj.type}`, `${window.asceditor}-editor`);
