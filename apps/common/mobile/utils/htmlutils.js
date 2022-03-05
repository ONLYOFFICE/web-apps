
let obj = !localStorage ? {id: 'theme-light', type: 'light'} : JSON.parse(localStorage.getItem("ui-theme"));
if ( !obj ) {
    obj = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ?
                {id: 'theme-dark', type: 'dark'} : {id: 'theme-light', type: 'light'};
    localStorage && localStorage.setItem("ui-theme", JSON.stringify(obj));
}

document.body.classList.add(`theme-type-${obj.type}`);
