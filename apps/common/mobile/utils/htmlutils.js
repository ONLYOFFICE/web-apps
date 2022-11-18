
const load_stylesheet = reflink => {
    let link = document.createElement( "link" );
    link.href = reflink;
    // link.type = "text/css";
    link.rel = "stylesheet";

    document.getElementsByTagName("head")[0].appendChild(link);
};

if ( localStorage && localStorage.getItem('mobile-mode-direction') === 'rtl' ) {
    load_stylesheet('./css/framework7-rtl.css')
    document.body.classList.add('rtl');
} else {
    load_stylesheet('./css/framework7.css')
}

let obj = !localStorage ? {id: 'theme-light', type: 'light'} : JSON.parse(localStorage.getItem("mobile-ui-theme"));
if ( !obj ) {
    obj = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ?
        {id: 'theme-dark', type: 'dark'} : {id: 'theme-light', type: 'light'};
    localStorage && localStorage.setItem("mobile-ui-theme", JSON.stringify(obj));
}

document.body.classList.add(`theme-type-${obj.type}`, `${window.asceditor}-editor`);
