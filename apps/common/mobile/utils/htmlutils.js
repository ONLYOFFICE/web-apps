
let obj = !localStorage ? {id: 'theme-light', type: 'light'} : JSON.parse(localStorage.getItem("ui-theme"));
if ( !obj ) {
    if ( window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ) {
        obj = {id: 'theme-dark', type: 'dark'};
        localStorage && localStorage.setItem("ui-theme", JSON.stringify(obj));
    }
}

document.body.classList.add(`theme-type-${obj.type}`);
