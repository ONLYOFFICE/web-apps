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
/**
 * Date: 22.07.23
 */

if (Common === undefined)
    var Common = {};

Common.Views = Common.Views || {};

define([], function () {
    'use strict';

    Common.Views.PluginPanel = Common.UI.BaseView.extend(_.extend({
        template: _.template([
            '<div class="current-plugin-box layout-ct vbox">',
                '<div class="current-plugin-frame">',
                '</div>',
                '<div class="current-plugin-header">',
                    '<div class="tools">',
                        '<div class="plugin-close close"></div>',
                        '<div class="plugin-hide"></div>',
                    '</div>',
                    '<label></label>',
                '</div>',
            '</div>',
            '<div id="plugins-mask" style="display: none;">'
        ].join('')),

        initialize: function(options) {
            _.extend(this, options);
            this._state = {};
            if (!this.menu) {
                this.menu = 'left';
            }
            Common.UI.BaseView.prototype.initialize.call(this, arguments);
        },

        render: function(el) {
            el && (this.$el = $(el));
            this.$el.html(this.template({scope: this}));

            this.pluginName = $('.current-plugin-header label', this.$el);
            this.pluginsMask = $('#plugins-mask', this.$el);
            this.currentPluginPanel = $('.current-plugin-box', this.$el);
            this.currentPluginFrame = $('.current-plugin-frame', this.$el);

            this.pluginClose = new Common.UI.Button({
                parentEl: this.$el.find('.plugin-close'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-close',
                hint: this.textClosePanel
            });

            var xpadding = 1;
            if (this.sideMenuButton) {
                this.pluginHide = new Common.UI.Button({
                    parentEl: this.$el.find('.plugin-hide'),
                    cls: 'btn-toolbar' + (this.menu==='right' ^ Common.UI.isRTL() ? ' icon-mirrored' : ''),
                    iconCls: 'toolbar__icon btn-panel-left-collapse',
                    hint: this.textHidePanel
                });
                xpadding++;
            }

            if(this.isCanDocked) {
                this.showDockedButton();
                xpadding++;
            }
            this.pluginName.css(Common.UI.isRTL() ? 'padding-left' : 'padding-right', (parseInt(Common.UI.Themes.getThemeProps('small-btn-size')) * xpadding + 5) + 'px');

            this.trigger('render:after', this);
            return this;
        },

        showDockedButton: function() {
            var header = this.$el.find('.current-plugin-header .tools'),
                btnCls = 'plugin-undock',
                btn = header.find('.' + btnCls);
            if (btn.length < 1) {
                btn = $('<div class="' + btnCls + '"></div>');
                this.$el.find('.plugin-close').after(btn);
                var btnUndock = new Common.UI.Button({
                    parentEl: this.$el.find('.' + btnCls),
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-unpin',
                    hint: this.textUndock
                });
                btnUndock.on('click', _.bind(function() {
                    this.fireEvent('docked', this.iframePlugin.id);
                }, this));
            }
            btn.show();
            header.removeClass('hidden');
        },

        openInsideMode: function(name, url, frameId, guid) {
            if (!this.pluginName) this.render();

            this.pluginName.text(name);
            if (!this.iframePlugin) {
                this.iframePlugin = document.createElement("iframe");
                this.iframePlugin.id           = (frameId === undefined) ? 'plugin_iframe' : frameId;
                this.iframePlugin.name         = 'pluginFrameEditor';
                this.iframePlugin.width        = '100%';
                this.iframePlugin.height       = '100%';
                this.iframePlugin.align        = "top";
                this.iframePlugin.frameBorder  = 0;
                this.iframePlugin.scrolling    = "no";
                this.iframePlugin.allow = "camera; microphone; display-capture";
                this.iframePlugin.onload       = _.bind(this._onLoad,this);
                this.currentPluginFrame.append(this.iframePlugin);

                if (!this.loadMask)
                    this.loadMask = new Common.UI.LoadMask({owner: this.currentPluginFrame});
                this.loadMask.setTitle(this.textLoading);
                this.loadMask.show();

                this.iframePlugin.src = url;
            }
            this._state.insidePlugin = guid;
            return true;
        },

        closeInsideMode: function() {
            if (this.iframePlugin) {
                this.currentPluginFrame.empty();
                this.iframePlugin = null;
            }
            this._state.insidePlugin = undefined;
        },

        _onLoad: function() {
            if (this.loadMask)
                this.loadMask.hide();
        },

        hide: function () {
            Common.UI.BaseView.prototype.hide.call(this,arguments);
        },

        enablePointerEvents: function(enable) {
            this.iframePlugin && (this.iframePlugin.style.pointerEvents = enable ? "" : "none");
        },

        textClosePanel: 'Close plugin',
        textLoading: 'Loading',
        textUndock: 'Unpin plugin',
        textHidePanel: 'Collapse plugin',

    }, Common.Views.PluginPanel || {}));
});