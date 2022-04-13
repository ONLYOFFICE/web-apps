
+function init_themes() {
    if ( localStorage.getItem("ui-theme-use-system") == '1' ) {
        localStorage.removeItem("ui-theme-id");
    }

    var objtheme = localStorage.getItem("ui-theme");
    if ( typeof(objtheme) == 'string' &&
            objtheme.startsWith("{") && objtheme.endsWith("}") )
    {
        objtheme = JSON.parse(objtheme);
    }

    var ui_theme_name = objtheme && typeof(objtheme) == 'object' ? objtheme.id :
        typeof(objtheme) == 'string' ? objtheme : localStorage.getItem("ui-theme-id");

    if ( !!ui_theme_name ) {
        if ( !!objtheme && !!objtheme.colors ) {
            var colors = [];
            for ( var c in objtheme.colors ) {
                colors.push('--' + c + ':' + objtheme.colors[c]);
            }

            var style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = '.' + ui_theme_name + '{'+ colors.join(';') +';}';
            document.getElementsByTagName('head')[0].appendChild(style);

            window.currentLoaderTheme = objtheme;
        }
    }
}();