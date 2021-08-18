
function checkScaling() {
    var matches = {
        'pixel-ratio__1_25': "screen and (-webkit-min-device-pixel-ratio: 1.25) and (-webkit-max-device-pixel-ratio: 1.49), " +
                                "screen and (min-resolution: 1.25dppx) and (max-resolution: 1.49dppx)",
        'pixel-ratio__1_5': "screen and (-webkit-min-device-pixel-ratio: 1.5) and (-webkit-max-device-pixel-ratio: 1.74), " +
                                "screen and (min-resolution: 1.5dppx) and (max-resolution: 1.74dppx)",
        'pixel-ratio__1_75': "screen and (-webkit-min-device-pixel-ratio: 1.75) and (-webkit-max-device-pixel-ratio: 1.99), " +
                                "screen and (min-resolution: 1.75dppx) and (max-resolution: 1.99dppx)",
    };

    for (var c in matches) {
        if ( window.matchMedia(matches[c]).matches ) {
            document.body.classList.add(c);
            break;
        }
    }

    if ( !window.matchMedia("screen and (-webkit-device-pixel-ratio: 1.5)," +
                            "screen and (-webkit-device-pixel-ratio: 1)," +
                            "screen and (-webkit-device-pixel-ratio: 2)").matches )
    {
        // don't add zoom for mobile devices
        // if (!(/android|avantgo|playbook|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od|ad)|iris|kindle|lge |maemo|midp|mmp|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent || navigator.vendor || window.opera)))
        //     document.getElementsByTagName('html')[0].setAttribute('style', 'zoom: ' + (1 / window.devicePixelRatio) + ';');
    }
}

checkScaling();

var params = (function() {
    var e,
        a = /\+/g,  // Regex for replacing addition symbol with a space
        r = /([^&=]+)=?([^&]*)/g,
        d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
        q = window.location.search.substring(1),
        urlParams = {};

    while (e = r.exec(q))
        urlParams[d(e[1])] = d(e[2]);

    return urlParams;
})();

var checkLocalStorage = (function () {
    try {
        var storage = window['localStorage'];
        return true;
    }
    catch(e) {
        return false;
    }
})();

if ( !!params.uitheme && checkLocalStorage && !localStorage.getItem("ui-theme-id") ) {
    // const _t = params.uitheme.match(/([\w-]+)/g);

    if ( params.uitheme == 'default-dark' )
        params.uitheme = 'theme-dark';
    else
    if ( params.uitheme == 'default-light' )
        params.uitheme = 'theme-classic-light';

    localStorage.setItem("ui-theme-id", params.uitheme);
}

var ui_theme_name = checkLocalStorage ? localStorage.getItem("ui-theme-id") : undefined;
if ( !ui_theme_name ) {
    if ( window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ) {
        ui_theme_name = 'theme-dark';
        checkLocalStorage && localStorage.setItem("ui-theme-id", ui_theme_name);
    }
}
if ( !!ui_theme_name ) {
    document.body.classList.add(ui_theme_name);
}
