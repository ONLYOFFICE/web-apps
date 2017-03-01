/*
 *
 * (c) Copyright Ascensio System Limited 2010-2017
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
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia,
 * EU, LV-1021.
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
 * User: Julia.Radzhabova
 * Date: 17.05.16
 * Time: 15:38
 */

if (Common === undefined)
    var Common = {};

Common.Views = Common.Views || {};

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Layout',
    'common/main/lib/component/Window'
], function (template) {
    'use strict';

    Common.Views.Plugins = Common.UI.BaseView.extend(_.extend({
        el: '#left-panel-plugins',

        storePlugins: undefined,
        template: _.template([
            '<div id="plugins-box" class="layout-ct vbox">',
                '<label id="plugins-header"><%= scope.strPlugins %></label>',
                '<div id="plugins-list" class="">',
                '</div>',
            '</div>',
            '<div id="current-plugin-box" class="layout-ct vbox hidden">',
                '<div id="current-plugin-header">',
                    '<label></label>',
                    '<div id="id-plugin-close" class="plugin-close img-commonctrl"></div>',
                '</div>',
                '<div id="current-plugin-frame" class="">',
                '</div>',
            '</div>',
            '<div id="plugins-mask" style="display: none;">'
        ].join('')),

        initialize: function(options) {
            _.extend(this, options);
            this._locked = false;
            this._state = {
                DisabledControls: true
            };
            this.lockedControls = [];
            Common.UI.BaseView.prototype.initialize.call(this, arguments);
        },

        render: function(el) {
            el = el || this.el;
            $(el).html(this.template({scope: this}));
            this.$el = $(el);

            this.viewPluginsList = new Common.UI.DataView({
                el: $('#plugins-list'),
                store: this.storePlugins,
                enableKeyEvents: false,
                itemTemplate: _.template([
                    '<div id="<%= id %>" class="item-plugins" style="display: block;">',
                        '<div class="plugin-icon" style="background-image: url(' + '<%= baseUrl %>' + '<%= variations[currentVariation].get("icons")[(window.devicePixelRatio > 1) ? 1 : 0] %>);"></div>',
                        '<% if (variations.length>1) { %>',
                        '<div class="plugin-caret img-commonctrl"></div>',
                        '<% } %>',
                        '<%= name %>',
                    '</div>'
                ].join(''))
            });
            this.lockedControls.push(this.viewPluginsList);
            this.viewPluginsList.cmpEl.off('click');

            this.pluginName = $('#current-plugin-header label');
            this.pluginsPanel = $('#plugins-box');
            this.pluginsMask = $('#plugins-mask');
            this.currentPluginPanel = $('#current-plugin-box');
            this.currentPluginFrame = $('#current-plugin-frame');

            this.pluginMenu = new Common.UI.Menu({
                menuAlign   : 'tr-br',
                items: []
            });

            this.trigger('render:after', this);
            return this;
        },

        setLocked: function (locked) {
            this._locked = locked;
        },

        ChangeSettings: function(props) {
            this.disableControls(this._locked);
        },

        disableControls: function(disable) {
            if (this._state.DisabledControls!==disable) {
                this._state.DisabledControls = disable;
                _.each(this.lockedControls, function(item) {
                    item.setDisabled(disable);
                });

                this.pluginsMask.css('display', disable ? 'block' : 'none');
            }
        },

        openInsideMode: function(name, url) {
            if (!this.pluginsPanel) return false;

            this.pluginsPanel.toggleClass('hidden', true);
            this.currentPluginPanel.toggleClass('hidden', false);

            this.pluginName.text(name);
            if (!this.iframePlugin) {
                this.iframePlugin = document.createElement("iframe");
                this.iframePlugin.id           = 'plugin_iframe';
                this.iframePlugin.name         = 'pluginFrameEditor',
                this.iframePlugin.width        = '100%';
                this.iframePlugin.height       = '100%';
                this.iframePlugin.align        = "top";
                this.iframePlugin.frameBorder  = 0;
                this.iframePlugin.scrolling    = "no";
                this.iframePlugin.onload       = _.bind(this._onLoad,this);
                this.currentPluginFrame.append(this.iframePlugin);

                if (!this.loadMask)
                    this.loadMask = new Common.UI.LoadMask({owner: this.currentPluginFrame});
                this.loadMask.setTitle(this.textLoading);
                this.loadMask.show();

                this.iframePlugin.src = url;
            }
            return true;
        },

        closeInsideMode: function() {
            if (!this.pluginsPanel) return;

            if (this.iframePlugin) {
                this.currentPluginFrame.empty();
                this.iframePlugin = null;
            }
            this.currentPluginPanel.toggleClass('hidden', true);
            this.pluginsPanel.toggleClass('hidden', false);
        },

        openNotVisualMode: function(pluginGuid) {
            var rec = this.viewPluginsList.store.findWhere({guid: pluginGuid});
            if (rec)
                this.viewPluginsList.cmpEl.find('#' + rec.get('id')).parent().addClass('selected');
        },

        closeNotVisualMode: function() {
            this.viewPluginsList.cmpEl.find('.selected').removeClass('selected');
        },

        _onLoad: function() {
            if (this.loadMask)
                this.loadMask.hide();
        },

        strPlugins: 'Plugins',
        textLoading: 'Loading',
        textStart: 'Start'

    }, Common.Views.Plugins || {}));

    Common.Views.PluginDlg = Common.UI.Window.extend(_.extend({
        initialize : function(options) {
            var _options = {};
            _.extend(_options,  {
                cls: 'advanced-settings-dlg',
                header: true,
                enableKeyEvents: false
            }, options);

            var header_footer = (_options.buttons && _.size(_options.buttons)>0) ? 85 : 34;
            _options.width = (Common.Utils.innerWidth()-_options.width)<0 ? Common.Utils.innerWidth(): _options.width,
            _options.height += header_footer;
            _options.height = (Common.Utils.innerHeight()-_options.height)<0 ? Common.Utils.innerHeight(): _options.height;

            this.template = [
                '<div id="id-plugin-container" class="box" style="height:' + (_options.height-header_footer) + 'px;">',
                    '<div id="id-plugin-placeholder" style="width: 100%;height: 100%;"></div>',
                '</div>',
                '<% if (_.size(buttons) > 0) { %>',
                    '<div class="separator horizontal"/>',
                    '<div class="footer" style="text-align: center;">',
                        '<% for(var bt in buttons) { %>',
                            '<button class="btn normal dlg-btn <%= buttons[bt].cls %>" result="<%= bt %>" style="margin-right: 10px;"><%= buttons[bt].text %></button>',
                        '<% } %>',
                    '</div>',
                '<% } %>'
            ].join('');

            _options.tpl = _.template(this.template, _options);

            this.url = options.url || '';
            Common.UI.Window.prototype.initialize.call(this, _options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);
            this.$window.find('> .body').css({height: 'auto', overflow: 'hidden'});

            this.boxEl = this.$window.find('.body > .box');
            this._headerFooterHeight = (this.options.buttons && _.size(this.options.buttons)>0) ? 85 : 34;
            this._headerFooterHeight += ((parseInt(this.$window.css('border-top-width')) + parseInt(this.$window.css('border-bottom-width'))));

            var iframe = document.createElement("iframe");
            iframe.id           = 'plugin_iframe';
            iframe.name         = 'pluginFrameEditor';
            iframe.width        = '100%';
            iframe.height       = '100%';
            iframe.align        = "top";
            iframe.frameBorder  = 0;
            iframe.scrolling    = "no";
            iframe.onload       = _.bind(this._onLoad,this);

            var me = this;
            setTimeout(function(){
                if (me.isLoaded) return;
                me.loadMask = new Common.UI.LoadMask({owner: $('#id-plugin-placeholder')});
                me.loadMask.setTitle(me.textLoading);
                me.loadMask.show();
                if (me.isLoaded) me.loadMask.hide();
            }, 500);

            iframe.src = this.url;
            $('#id-plugin-placeholder').append(iframe);

            this.on('resizing', function(args){
                me.boxEl.css('height', parseInt(me.$window.css('height')) - me._headerFooterHeight);
            });
        },

        _onLoad: function() {
            this.isLoaded = true;
            if (this.loadMask)
                this.loadMask.hide();
        },

        setInnerSize: function(width, height) {
            var maxHeight = Common.Utils.innerHeight(),
                maxWidth = Common.Utils.innerWidth(),
                borders_width = (parseInt(this.$window.css('border-left-width')) + parseInt(this.$window.css('border-right-width')));
            if (maxHeight<height + this._headerFooterHeight)
                height = maxHeight - this._headerFooterHeight;
            if (maxWidth<width + borders_width)
                width = maxWidth - borders_width;

            this.boxEl.css('height', height);

            Common.UI.Window.prototype.setHeight.call(this, height + this._headerFooterHeight);
            Common.UI.Window.prototype.setWidth.call(this, width + borders_width);

            this.$window.css('left',(maxWidth - width - borders_width) / 2);
            this.$window.css('top',((maxHeight - height - this._headerFooterHeight) / 2) * 0.9);
        },

        textLoading : 'Loading'
    }, Common.Views.PluginDlg || {}));
});