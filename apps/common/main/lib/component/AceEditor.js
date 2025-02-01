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

if (Common === undefined)
    var Common = {};

define([], function () {
    'use strict';

    Common.UI.AceEditor = Common.UI.BaseView.extend({
        initialize : function(options) {
            Common.UI.BaseView.prototype.initialize.call(this, options);

            this.parentEl = options.parentEl;
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

            this.iframe.src = '../../../vendor/ace/component/AceEditor.html?editorType=' + (window.SSE ? 'cell' : window.PE ? 'slide' : 'word');

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

            if (cmd && cmd.referer == "ace-editor") {
                switch (cmd.command) {
                    case 'changeValue':
                        data = cmd.data || {};
                        this.fireEvent('change', data.value, data.pos);
                        break;
                    case 'aceEditorReady':
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
                referer: 'ace-editor',
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
                referer: 'ace-editor',
                data: Common.UI.Themes.getThemeColors()
            });
        },

        disableDrop: function(disable) {
            this._postMessage(this.iframe.contentWindow, {
                command: 'disableDrop',
                referer: 'ace-editor',
                data: disable
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
