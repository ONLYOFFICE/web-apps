
function checkScaling() {
    var str_mq_150 = "screen and (-webkit-min-device-pixel-ratio: 1.5) and (-webkit-max-device-pixel-ratio: 1.9), " +
        "screen and (min-resolution: 1.5dppx) and (max-resolution: 1.9dppx)";
    if ( window.matchMedia(str_mq_150).matches ) {
        document.body.classList.add('pixel-ratio__1_5');
    }

    if ( !window.matchMedia("screen and (-webkit-device-pixel-ratio: 1.5)," +
                            "screen and (-webkit-device-pixel-ratio: 1)," +
                            "screen and (-webkit-device-pixel-ratio: 2)").matches )
    {
        // don't add zoom for mobile devices
        if (!(/android|avantgo|playbook|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od|ad)|iris|kindle|lge |maemo|midp|mmp|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent || navigator.vendor || window.opera)))
            document.getElementsByTagName('html')[0].setAttribute('style', 'zoom: ' + (1 / window.devicePixelRatio) + ';');
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

if ( !!params.uitheme && localStorage.getItem("ui-theme") != params.uitheme)
    localStorage.setItem("ui-theme", params.uitheme);

var ui_theme_name = localStorage.getItem("ui-theme");
if ( !!ui_theme_name ) {
    document.body.classList.add(ui_theme_name);
}
