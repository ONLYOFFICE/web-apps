
if ( window.AscDesktopEditor ) {
    window.desktop = window.AscDesktopEditor;
    desktop.features = {};
    window.native_message_cmd = [];

    window.on_native_message = function (cmd, param) {
        if ( /window:features/.test(cmd) ) {
            var obj = JSON.parse(param);
            if ( obj.singlewindow !== undefined ) {
                desktop.features.singlewindow = obj.singlewindow;
            }
        } else
            window.native_message_cmd[cmd] = param;
    }

    if ( !!window.RendererProcessVariable ) {
        desktop.theme = window.RendererProcessVariable.theme;
    }

    window.desktop.execCommand('webapps:entry', (window.features && JSON.stringify(window.features)) || '');
}
