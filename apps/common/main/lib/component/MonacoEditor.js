/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

if (Common === undefined)
    var Common = {};

define([], function () {
    'use strict';

    Common.UI.MonacoEditor = Common.UI.BaseView.extend({
        initialize : function(options) {
            Common.UI.BaseView.prototype.initialize.call(this, options);

            this.id = _.uniqueId();
            this.parentEl = options.parentEl;
            this.language = options.language || 'javascript';
            this.parentEl && this.render(this.parentEl);
        },

        render: function (parentEl) {
            this.parentEl = typeof parentEl === 'string' ? $(parentEl) : parentEl;

            this.iframe = document.createElement("iframe");
            this.iframe.width        = '100%';
            this.iframe.height       = '100%';
            this.iframe.align        = "top";
            this.iframe.frameBorder  = 0;
            this.iframe.scrolling    = "no";
            this.iframe.onload       = _.bind(this._onLoad,this);
            this.parentEl.append(this.iframe);

            this.loadMask = new Common.UI.LoadMask({owner: this.parentEl});
            this.loadMask.show();

            var src = '../../../vendor/monaco/MonacoEditor.html';
            src += '?editorType=' + (window.SSE ? 'cell' : window.PE ? 'slide' : window.PDFE ? 'pdf' : 'word');
            src += '&language=' + this.language;
            src += '&id=' + this.id;

            this.iframe.src = src;

            var me = this;
            this._eventfunc = function(msg) {
                me._onMessage(msg);
            };
            this._updatebind = function() {
                me.updateTheme();
            };
            this._bindWindowEvents.call(this);
        },

        _bindWindowEvents: function() {
            if (window.addEventListener) {
                window.addEventListener("message", this._eventfunc, false)
            } else if (window.attachEvent) {
                window.attachEvent("onmessage", this._eventfunc);
            }
            Common.NotificationCenter.on('uitheme:changed', this._updatebind);
        },

        _unbindWindowEvents: function() {
            if (window.removeEventListener) {
                window.removeEventListener("message", this._eventfunc)
            } else if (window.detachEvent) {
                window.detachEvent("onmessage", this._eventfunc);
            }
            Common.NotificationCenter.off('uitheme:changed', this._updatebind);
        },

        _postMessage: function(wnd, msg) {
            if (wnd && wnd.postMessage && window.JSON) {
                msg.referer = 'monaco-editor-' + this.id;
                wnd.postMessage(window.JSON.stringify(msg), "*");
            }
        },

        _onMessage: function(msg) {
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

            if (cmd && cmd.referer == 'monaco-editor-' + this.id) {
                switch (cmd.command) {
                    case 'changeValue':
                        data = cmd.data || {};
                        this.fireEvent('change', data.value, data.pos);
                        break;
                    case 'monacoEditorReady':
                        this.fireEvent('ready', cmd.data);
                        break;
                }
            }
        },

        _onLoad: function() {
            this.updateTheme();
            if (this.loadMask)
                this.loadMask.hide();
        },

        setValue: function(value, currentPos, readonly) {
            this._postMessage(this.iframe.contentWindow, {
                command: 'setValue',
                data: {
                    value: value,
                    readonly: readonly,
                    currentPos: currentPos
                }
            });
        },

        updateTheme: function() {
            this._postMessage(this.iframe.contentWindow, {
                command: 'setTheme',
                data: Common.UI.Themes.getThemeColors()
            });
        },

        disableDrop: function(disable) {
            this._postMessage(this.iframe.contentWindow, {
                command: 'disableDrop',
                data: disable
            });
        },

        revealPositionInCenter: function() {
            this._postMessage(this.iframe.contentWindow, {
                command: 'revealPositionInCenter',
                data: {}
            });
        },

        undo: function() {
            this._postMessage(this.iframe.contentWindow, {
                command: 'undo',
                data: {}
            });
        },

        redo: function() {
            this._postMessage(this.iframe.contentWindow, {
                command: 'redo',
                data: {}
            });
        },

        enablePointerEvents: function(enable) {
            this.iframe && (this.iframe.style.pointerEvents = enable ? "" : "none");
        },

        destroyEditor: function() {
            this._unbindWindowEvents();
        }
    });
});
