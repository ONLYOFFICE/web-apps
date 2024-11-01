/*
 * (c) Copyright Ascensio System SIA 2010-2024
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation. In accordance with
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at 20A-6 Ernesta Birznieka-Upish
 * street, Riga, Latvia, EU, LV-1050.
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product
 * logo when distributing the program. Pursuant to Section 7(e) we decline to
 * grant you any rights under trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 */
window.initCounter = 0;

function on_init_server(type)
{
    if (type === (window.initCounter & type))
        return;
    window.initCounter |= type;
    if (window.initCounter === 3)
    {
        load_library("onlyoffice", "../libs/" + window.editorType + "/api.js");
        _postMessage({
            command: 'aceEditorReady',
            referer: 'ace-editor'
        });
    }
}

function load_library(name, url)
{
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState == 4)
        {
            var EditSession = ace.require("ace/edit_session").EditSession;
            var editDoc = new EditSession(xhr.responseText, "ace/mode/javascript");
            editor.ternServer.addDoc(name, editDoc);
        }
    };
    xhr.send();
}

var editor = ace.edit("editor");
editor.session.setMode("ace/mode/javascript");
editor.container.style.lineHeight = "20px";
editor.setValue("");

editor.getSession().setUseWrapMode(true);
editor.getSession().setWrapLimitRange(null, null);
editor.setShowPrintMargin(false);
editor.$blockScrolling = Infinity;

ace.config.loadModule('ace/ext/tern', function () {
    editor.setOptions({
        enableTern: {
            defs: ['browser', 'ecma5'],
            plugins: { doc_comment: { fullDocs: true } },
            useWorker: !!window.Worker,
            switchToDoc: function (name, start) {},
            startedCb: function () {
                on_init_server(1);
            },
        },
        enableSnippets: false,
        // tooltipContainer: '#code-editor'
    });
});

if (!window.isIE) {
    ace.config.loadModule('ace/ext/language_tools', function () {
        editor.setOptions({
            enableBasicAutocompletion: false,
            enableLiveAutocompletion: true
        });
    });
}

ace.config.loadModule('ace/ext/html_beautify', function (beautify) {
    editor.setOptions({
        autoBeautify: true,
        htmlBeautify: true,
    });
    window.beautifyOptions = beautify.options;
});

var _postMessage = function(msg) {
    window.parent && window.JSON && window.parent.postMessage(window.JSON.stringify(msg), "*");
};

(function (window, undefined) {

    editor.getSession().on('change', function() {
        if (window.isDisable) return;
        _postMessage({
            command: 'changeValue',
            data: editor.getValue(),
            referer: 'ace-editor'
        });
    });

    on_init_server(2);

    var editorSetValue = function(data) {
        window.isDisable = true;
        editor.setValue(data.value || '');
        editor.setReadOnly(!!data.readonly);
        if (!data.readonly) {
            editor.focus();
            editor.selection.clearSelection();
            editor.scrollToRow(0);
        }
        window.isDisable = false;
    };

    var onThemeChanged = function(data) {
        try {
            data = window.JSON.parse(data)
        } catch(e) {
            data = {};
        }

        if (!data.colors) return;

        let styles = document.querySelectorAll("style"),
            i = 0;
        if (styles) {
            while (i < styles.length) {
                if (styles[i].id === 'ace-chrome') {
                    styles[i].parentNode.removeChild(styles[i]);
                    break;
                }
                i++;
            }
        }

        var theme_type = data.type || 'light',
            colors = data.colors;
        if ( !!colors ) {
            var _css_array = [':root ', '{'];
            for (var c in colors) {
                _css_array.push('--', c, ':', colors[c], ';');
            }
            _css_array.push('}');
            var _css = _css_array.join('');

            var style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = _css;
            document.getElementsByTagName('head')[0].appendChild(style);
        }

        if (theme_type === 'dark')
            editor.setTheme("ace/theme/vs-dark");
        else
            editor.setTheme("ace/theme/vs-light");

    };

    var _onMessage = function(msg) {
        var data = msg.data;
        if (Object.prototype.toString.apply(data) !== '[object String]' || !window.JSON) {
            return;
        }
        var cmd, handler;

        try {
            cmd = window.JSON.parse(data)
        } catch(e) {
            cmd = '';
        }

        if (cmd && cmd.referer == "ace-editor") {
            if (cmd.command==='setValue') {
                editorSetValue(cmd.data);
            } else if (cmd.command==='setTheme') {
                onThemeChanged(cmd.data);
            }
        }
    };

    var fn = function(e) { _onMessage(e); };

    if (window.attachEvent) {
        window.attachEvent('onmessage', fn);
    } else {
        window.addEventListener('message', fn, false);
    }
})(window, undefined);