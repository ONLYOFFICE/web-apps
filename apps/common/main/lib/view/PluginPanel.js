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
                    '<label></label>',
                    '<div class="plugin-close close"></div>',
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

            this.trigger('render:after', this);
            return this;
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

        textClosePanel: 'Close plugin',
        textLoading: 'Loading'

    }, Common.Views.PluginPanel || {}));
});