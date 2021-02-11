
function checkScaling() {
    var str_mq_150 = "screen and (-webkit-min-device-pixel-ratio: 1.5) and (-webkit-max-device-pixel-ratio: 1.9), " +
        "screen and (min-resolution: 1.5dppx) and (max-resolution: 1.9dppx)";
    if ( window.matchMedia(str_mq_150).matches ) {
        document.body.classList.add('pixel-ratio__1_5');
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

var ui_theme_name = params.uitheme || localStorage.getItem("ui-theme");
if ( !!ui_theme_name ) {
    document.body.classList.add(ui_theme_name);
}
