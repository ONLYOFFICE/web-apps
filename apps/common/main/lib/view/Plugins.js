/*
 *
 * (c) Copyright Ascensio System Limited 2010-2016
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
            '</div>'
        ].join('')),

        initialize: function(options) {
            _.extend(this, options);
            this.pluginsPath = '../../../../sdkjs-plugins/';
            Common.UI.BaseView.prototype.initialize.call(this, arguments);
        },

        render: function(el) {
            el = el || this.el;
            $(el).html(this.template({scope: this}));

            this.viewPluginsList = new Common.UI.DataView({
                el: $('#plugins-list'),
                store: this.storePlugins,
                enableKeyEvents: false,
                itemTemplate: _.template('<div id="<%= id %>" class="item-plugins" style="background-image: url(' + '<% if (baseUrl !=="") { %>' + '<%= baseUrl %>'  + '<% } else { %>' + this.pluginsPath + '<% } %>' + '<%= variations[currentVariation].get("icons")[(window.devicePixelRatio > 1) ? 1 : 0] %>); background-position: 0 0;"></div>')
            });

            this.trigger('render:after', this);
            return this;
        },

        strPlugins: 'Plugins'

    }, Common.Views.Plugins || {}));

    Common.Views.PluginDlg = Common.UI.Window.extend(_.extend({
        initialize : function(options) {
            var _options = {};
            _.extend(_options,  {
                width: 800,
                height: (window.innerHeight-600)<0 ? window.innerHeight: 600,
                cls: 'advanced-settings-dlg',
                header: true
            }, options);

            var header_footer = (_options.buttons && _.size(_options.buttons)>0) ? 85 : 34;
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

            var iframe = document.createElement("iframe");
            iframe.id           = 'plugin_iframe';
            iframe.name         = 'pluginFrameEditor',
            iframe.width        = '100%';
            iframe.height       = '100%';
            iframe.align        = "top";
            iframe.frameBorder  = 0;
            iframe.scrolling    = "no";
            iframe.onload       = _.bind(this._onLoad,this);
            $('#id-plugin-placeholder').append(iframe);

            this.loadMask = new Common.UI.LoadMask({owner: $('#id-plugin-placeholder')});
            this.loadMask.setTitle(this.textLoading);
            this.loadMask.show();

            iframe.src = this.url;

            var me = this;

            this.on('close', function(obj){
            });

            this.on('show', function(obj){
                var h = me.getHeight();
                if (window.innerHeight>h && h<600 || window.innerHeight<h) {
                    h = Math.min(window.innerHeight, 600);
                    me.setHeight(h);
                }
            });
        },

        _onLoad: function() {
            if (this.loadMask)
                this.loadMask.hide();
        },

        setHeight: function(height) {
            if (height >= 0) {
                var min = parseInt(this.$window.css('min-height'));
                height < min && (height = min);
                this.$window.height(height);

                var header_height = (this.initConfig.header) ? parseInt(this.$window.find('> .header').css('height')) : 0;

                this.$window.find('> .body').css('height', height-header_height);
                this.$window.find('> .body > .box').css('height', height-85);

                var top  = ((parseInt(window.innerHeight) - parseInt(height)) / 2) * 0.9;
                var left = (parseInt(window.innerWidth) - parseInt(this.initConfig.width)) / 2;

                this.$window.css('left',left);
                this.$window.css('top',top);
            }
        },

        textLoading : 'Loading'
    }, Common.Views.PluginDlg || {}));
});