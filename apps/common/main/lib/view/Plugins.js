/*
 *
 * (c) Copyright Ascensio System SIA 2010-2019
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
 * You can contact Ascensio System SIA at 20A-12 Ernesta Birznieka-Upisha
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
                DisabledControls: false
            };
            this.lockedControls = [];
            Common.UI.BaseView.prototype.initialize.call(this, arguments);

            Common.NotificationCenter.on('app:ready', function (mode) {
                Common.Utils.asyncCall(this._onAppReady, this, mode);
            }.bind(this));
        },

        render: function(el) {
            el && (this.$el = $(el));
            this.$el.html(this.template({scope: this}));

            this.viewPluginsList = new Common.UI.DataView({
                el: $('#plugins-list'),
                store: this.storePlugins,
                enableKeyEvents: false,
                itemTemplate: _.template([
                    '<div id="<%= id %>" class="item-plugins" style="display: <% if (visible) {%> block; <%} else {%> none; <% } %>">',
                        '<div class="plugin-icon" style="background-image: url(' + '<%= baseUrl %>' + '<%= variations[currentVariation].get("icons")[((window.devicePixelRatio > 1) ? 1 : 0) + (variations[currentVariation].get("icons").length>2 ? 2 : 0)] %>);"></div>',
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
            this.pluginsMask = $('#plugins-mask', this.$el);
            this.currentPluginPanel = $('#current-plugin-box');
            this.currentPluginFrame = $('#current-plugin-frame');

            this.pluginMenu = new Common.UI.Menu({
                menuAlign   : 'tr-br',
                items: []
            });

            this.trigger('render:after', this);
            return this;
        },

        getPanel: function () {
            var _panel = $('<section id="plugins-panel" class="panel" data-tab="plugins"></section>');
            var _group = $('<div class="group"></div>');
            if ( !this.storePlugins.isEmpty() ) {
                this.storePlugins.each(function (model) {
                    // var btn = new Common.UI.Button({
                    //     cls: 'btn-toolbar x-huge icon-top',
                    //     iconCls: 'img-commonctrl review-prev',
                    //     caption: model.get('name'),
                    //     value: model.get('guid'),
                    //     hint: model.get('name')
                    // });
                    //
                    // var $slot = $('<span class="slot"></span>').appendTo(_group);
                    // btn.render($slot);
                });
            }

            _group.appendTo(_panel);
            return _panel;
        },

        renderTo: function (parent) {
            if ( !this.storePlugins.isEmpty() ) {
                var me = this;
                var _group = $('<div class="group"></div>');
                this.storePlugins.each(function (model) {
                    if (model.get('visible')) {
                        var modes = model.get('variations'),
                            guid = model.get('guid'),
                            icons = modes[model.get('currentVariation')].get('icons'),
                            _icon_url = model.get('baseUrl') + icons[((window.devicePixelRatio > 1) ? 1 : 0) + (icons.length>2 ? 2 : 0)],
                            btn = new Common.UI.Button({
                                cls: 'btn-toolbar x-huge icon-top',
                                iconImg: _icon_url,
                                caption: model.get('name'),
                                menu: modes && modes.length > 1,
                                split: modes && modes.length > 1,
                                value: guid,
                                hint: model.get('name')
                            });

                        var $slot = $('<span class="slot"></span>').appendTo(_group);
                        btn.render($slot);

                        model.set('button', btn);
                        me.lockedControls.push(btn);
                    }
                });

                parent.html(_group);
                $('<div class="separator long"></div>').prependTo(parent);
            }
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

        openInsideMode: function(name, url, frameId) {
            if (!this.pluginsPanel) return false;

            this.pluginsPanel.toggleClass('hidden', true);
            this.currentPluginPanel.toggleClass('hidden', false);

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
                this.iframePlugin.onload       = _.bind(this._onLoad,this);
                this.currentPluginFrame.append(this.iframePlugin);

                if (!this.loadMask)
                    this.loadMask = new Common.UI.LoadMask({owner: this.currentPluginFrame});
                this.loadMask.setTitle(this.textLoading);
                this.loadMask.show();

                this.iframePlugin.src = url;
            }

            this.fireEvent('plugin:open', [this, 'onboard', 'open']);
            return true;
        },

        closeInsideMode: function() {
            if (!this.pluginsPanel) return;

            if (this.iframePlugin) {
                this.currentPluginFrame.empty();
                this.iframePlugin = null;
            }
            this.currentPluginPanel.toggleClass('hidden', true);
            // this.pluginsPanel.toggleClass('hidden', false);

            this.fireEvent('plugin:open', [this, 'onboard', 'close']);
        },

        openedPluginMode: function(pluginGuid) {
            // var rec = this.viewPluginsList.store.findWhere({guid: pluginGuid});
            // if ( rec ) {
            //     this.viewPluginsList.cmpEl.find('#' + rec.get('id')).parent().addClass('selected');
            // }

            var model = this.storePlugins.findWhere({guid: pluginGuid});
            if ( model ) {
                var _btn = model.get('button');
                if (_btn) {
                    _btn.toggle(true);
                    if (_btn.menu && _btn.menu.items.length>0) {
                        _btn.menu.items[0].setCaption(this.textStop);
                    }
                }
            }
        },

        closedPluginMode: function(guid) {
            // this.viewPluginsList.cmpEl.find('.selected').removeClass('selected');

            var model = this.storePlugins.findWhere({guid: guid});
            if ( model ) {
                var _btn = model.get('button');
                if (_btn) {
                    _btn.toggle(false);
                    if (_btn.menu && _btn.menu.items.length>0) {
                        _btn.menu.items[0].setCaption(this.textStart);
                    }
                }
            }
        },

        _onLoad: function() {
            if (this.loadMask)
                this.loadMask.hide();
        },

        _onAppReady: function (mode) {
        },

        createPluginButton: function (model) {
            if (!model.get('visible'))
                return null;

            var me = this;

            var modes = model.get('variations'),
                guid = model.get('guid'),
                icons = modes[model.get('currentVariation')].get('icons'),
                icon_url = model.get('baseUrl') + icons[((window.devicePixelRatio > 1) ? 1 : 0) + (icons.length > 2 ? 2 : 0)];

            var _menu_items = [];
            _.each(model.get('variations'), function(variation, index) {
                if (variation.get('visible'))
                    _menu_items.push({
                        caption     : index > 0 ? variation.get('description') : me.textStart,
                        value       : parseInt(variation.get('index'))
                    });
            });

            var btn = new Common.UI.Button({
                cls: 'btn-toolbar x-huge icon-top',
                iconImg: icon_url,
                caption: model.get('name'),
                menu: _menu_items.length > 1,
                split: _menu_items.length > 1,
                value: guid,
                hint: model.get('name')
            });

            if ( btn.split ) {
                btn.setMenu(
                    new Common.UI.Menu({
                        items: _menu_items,
                        pluginGuid: model.get('guid')
                    })
                );

                btn.menu.on('item:click', function(menu, item, e) {
                    me.fireEvent('plugin:select', [menu.options.pluginGuid, item.value]);
                });
            }

            btn.on('click', function(b, e) {
                me.fireEvent('plugin:select', [b.options.value, 0]);
            });

            model.set('button', btn);
            me.lockedControls.push(btn);
            return btn;
        },

        hide: function () {
            Common.UI.BaseView.prototype.hide.call(this,arguments);
            this.fireEvent('hide', this );
        },

        strPlugins: 'Plugins',
        textLoading: 'Loading',
        textStart: 'Start',
        textStop: 'Stop',
        groupCaption: 'Plugins'

    }, Common.Views.Plugins || {}));

    Common.Views.PluginDlg = Common.UI.Window.extend(_.extend({
        initialize : function(options) {
            var _options = {};
            _.extend(_options,  {
                header: true,
                enableKeyEvents: false
            }, options);

            var header_footer = (_options.buttons && _.size(_options.buttons)>0) ? 85 : 34;
            if (!_options.header) header_footer -= 34;
            this.bordersOffset = 40;
            _options.width = (Common.Utils.innerWidth()-this.bordersOffset*2-_options.width)<0 ? Common.Utils.innerWidth()-this.bordersOffset*2: _options.width;
            _options.height += header_footer;
            _options.height = (Common.Utils.innerHeight()-this.bordersOffset*2-_options.height)<0 ? Common.Utils.innerHeight()-this.bordersOffset*2: _options.height;
            _options.cls += ' advanced-settings-dlg';

            this.template = [
                '<div id="id-plugin-container" class="box" style="height:' + (_options.height-header_footer) + 'px;">',
                    '<div id="id-plugin-placeholder" style="width: 100%;height: 100%;"></div>',
                '</div>',
                '<% if ((typeof buttons !== "undefined") && _.size(buttons) > 0) { %>',
                    '<div class="separator horizontal"/>',
                    '<div class="footer" style="text-align: center;">',
                        '<% for(var bt in buttons) { %>',
                            '<button class="btn normal dlg-btn <%= buttons[bt].cls %>" result="<%= bt %>" style="margin-right: 10px;"><%= buttons[bt].text %></button>',
                        '<% } %>',
                    '</div>',
                '<% } %>'
            ].join('');

            _options.tpl = _.template(this.template)(_options);

            this.url = options.url || '';
            this.frameId = options.frameId || 'plugin_iframe';
            Common.UI.Window.prototype.initialize.call(this, _options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);
            this.$window.find('> .body').css({height: 'auto', overflow: 'hidden'});

            this.boxEl = this.$window.find('.body > .box');
            this._headerFooterHeight = (this.options.buttons && _.size(this.options.buttons)>0) ? 85 : 34;
            if (!this.options.header) this._headerFooterHeight -= 34;
            this._headerFooterHeight += ((parseInt(this.$window.css('border-top-width')) + parseInt(this.$window.css('border-bottom-width'))));

            var iframe = document.createElement("iframe");
            iframe.id           = this.frameId;
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

            var onMainWindowResize = function(){
                me.onWindowResize();
            };
            $(window).on('resize', onMainWindowResize);
            this.on('close', function() {
                $(window).off('resize', onMainWindowResize);
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
                borders_width = (parseInt(this.$window.css('border-left-width')) + parseInt(this.$window.css('border-right-width'))),
                bordersOffset = this.bordersOffset*2;
            if (maxHeight - bordersOffset<height + this._headerFooterHeight)
                height = maxHeight - bordersOffset - this._headerFooterHeight;
            if (maxWidth - bordersOffset<width + borders_width)
                width = maxWidth - bordersOffset - borders_width;

            this.boxEl.css('height', height);

            Common.UI.Window.prototype.setHeight.call(this, height + this._headerFooterHeight);
            Common.UI.Window.prototype.setWidth.call(this, width + borders_width);

            this.$window.css('left',(maxWidth - width - borders_width) / 2);
            this.$window.css('top',(maxHeight - height - this._headerFooterHeight) / 2);
        },

        onWindowResize: function() {
            var main_width  = Common.Utils.innerWidth(),
                main_height = Common.Utils.innerHeight(),
                win_width = this.getWidth(),
                win_height = this.getHeight(),
                bordersOffset = (this.resizable) ? 0 : this.bordersOffset;
            if (win_height<main_height-bordersOffset*2+0.1 && win_width<main_width-bordersOffset*2+0.1) {
                var left = this.getLeft(),
                    top = this.getTop();

                if (top<bordersOffset) this.$window.css('top', bordersOffset);
                else if (top+win_height>main_height-bordersOffset)
                    this.$window.css('top', main_height-bordersOffset - win_height);
                if (left<bordersOffset) this.$window.css('left', bordersOffset);
                else if (left+win_width>main_width-bordersOffset)
                    this.$window.css('left', main_width-bordersOffset-win_width);
            } else {
                if (win_height>main_height-bordersOffset*2) {
                    this.setHeight(Math.max(main_height-bordersOffset*2, this.initConfig.minheight));
                    this.boxEl.css('height', Math.max(main_height-bordersOffset*2, this.initConfig.minheight) - this._headerFooterHeight);
                    this.$window.css('top', bordersOffset);
                }
                if (win_width>main_width-bordersOffset*2) {
                    this.setWidth(Math.max(main_width-bordersOffset*2, this.initConfig.minwidth));
                    this.$window.css('left', bordersOffset);
                }
            }
        },

        textLoading : 'Loading'
    }, Common.Views.PluginDlg || {}));
});