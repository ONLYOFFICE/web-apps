(function(window, document) {
    /*
    * config = {
    *   editorType: 'cell'/'slide'/'word'
    *   events: {
    *       onChangeValue // text in editor is changed
    *       onEditorReady // editor is ready for use
    *       onLoad // frame with editor is loaded
    *   }
    * }
    * */
    
    window.AceEditor = function(placeholderId, config) {
        var _self = this,
            _config = config || {},
            parentEl = document.getElementById(placeholderId),
            iframe;

        var _setValue = function(value, currentPos, readonly) {
            _postMessage(iframe.contentWindow, {
                command: 'setValue',
                referer: 'ace-editor',
                data: {
                    value: value,
                    readonly: readonly,
                    currentPos: currentPos
                }
            });
        };

        var _updateTheme = function(type, colors) {
            _postMessage(iframe.contentWindow, {
                command: 'setTheme',
                referer: 'ace-editor',
                data: {
                    type: type,
                    colors: colors
                }
            });
        };

        var _disableDrop = function(disable) {
            _postMessage(iframe.contentWindow, {
                command: 'disableDrop',
                referer: 'ace-editor',
                data: disable
            });
        };

        var _destroyEditor = function() {
            if (iframe) {
                _msgDispatcher && _msgDispatcher.unbindEvents();
                iframe.parentNode && iframe.parentNode.removeChild(iframe);
            }
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
                var events = _config.events || {},
                    handler;
                data = {};
                switch (cmd.command) {
                    case 'changeValue':
                        handler = events['onChangeValue'];
                        data = cmd.data;
                        break;
                    case 'aceEditorReady':
                        handler = events['onEditorReady'];
                        data = cmd.data;
                        break;
                }
                if (handler && typeof handler == "function") {
                    res = handler.call(_self, {target: _self, data: data});
                }
            }
        };


        var _onLoad = function() {
            var handler = (_config.events || {})['onLoad'];
            if (handler && typeof handler == "function") {
                res = handler.call(_self);
            }
        };

        if (parentEl) {
            iframe = createIframe(_config);
            iframe.onload = _onLoad;
            var _msgDispatcher = new MessageDispatcher(_onMessage, this);
            parentEl.appendChild(iframe);
        }

        return {
            setValue: _setValue, // string // set text to editor
            disableDrop: _disableDrop, // true/false // disable/enable drop elements to editor
            destroyEditor: _destroyEditor,
            updateTheme: _updateTheme // type: 'dark'/'light',
                                       // colors: {'text-normal': '', 'icon-normal': '', 'background-normal': '', 'background-toolbar': '', 'highlight-button-hover': '',
                                       // 'canvas-background': '', 'border-divider': '', 'canvas-scroll-thumb-pressed': '', 'canvas-scroll-thumb': ''}
        }
    }

    function getBasePath() {
        var scripts = document.getElementsByTagName('script'),
            match;

        for (var i = scripts.length - 1; i >= 0; i--) {
            match = scripts[i].src.match(/(.*)AceEditor.js/i);
            if (match) {
                return match[1];
            }
        }

        return "";
    }

    function createIframe(config) {
        iframe = document.createElement("iframe");
        iframe.width        = '100%';
        iframe.height       = '100%';
        iframe.align        = "top";
        iframe.frameBorder  = 0;
        iframe.scrolling    = "no";
        iframe.src = getBasePath() + 'AceEditor.html' + (config.editorType ? '?editorType=' + config.editorType : '');

        return iframe;
    }

    function _postMessage(wnd, msg) {
        if (wnd && wnd.postMessage && window.JSON) {
            wnd.postMessage(window.JSON.stringify(msg), "*");
        }
    }

    MessageDispatcher = function(fn, scope) {
        var _fn     = fn,
            _scope  = scope || window,
            eventFn = function(msg) {
                _fn.call(_scope, msg);
            };

        var _bindEvents = function() {
            if (window.addEventListener) {
                window.addEventListener("message", eventFn, false)
            }
            else if (window.attachEvent) {
                window.attachEvent("onmessage", eventFn);
            }
        };

        var _unbindEvents = function() {
            if (window.removeEventListener) {
                window.removeEventListener("message", eventFn, false)
            }
            else if (window.detachEvent) {
                window.detachEvent("onmessage", eventFn);
            }
        };

        _bindEvents.call(this);

        return {
            unbindEvents: _unbindEvents
        }
    };

})(window, document);
