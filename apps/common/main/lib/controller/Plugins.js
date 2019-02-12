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

define([
    'core',
    'common/main/lib/collection/Plugins',
    'common/main/lib/view/Plugins'
], function () {
    'use strict';

    Common.Controllers.Plugins = Backbone.Controller.extend(_.extend({
        models: [],
        collections: [
            'Common.Collections.Plugins'
        ],
        views: [
            'Common.Views.Plugins'
        ],

        initialize: function() {
            var me = this;
            this.addListeners({
                'Toolbar': {
                    'render:before' : function (toolbar) {
                        var appOptions = me.getApplication().getController('Main').appOptions;

                        if ( !appOptions.isEditMailMerge && !appOptions.isEditDiagram ) {
                            var tab = {action: 'plugins', caption: me.panelPlugins.groupCaption};
                            me.$toolbarPanelPlugins = me.panelPlugins.getPanel();

                            toolbar.addTab(tab, me.$toolbarPanelPlugins, 10);     // TODO: clear plugins list in left panel
                        }
                    }
                },
                'Common.Views.Plugins': {
                    'plugin:select': function(guid, type) {
                        me.api.asc_pluginRun(guid, type, '');
                    }
                }
            });
        },

        events: function() {
            return {
                'click #id-plugin-close':_.bind(this.onToolClose,this)
            };
        },

        onLaunch: function() {
            var store = this.getApplication().getCollection('Common.Collections.Plugins');
            this.panelPlugins= this.createView('Common.Views.Plugins', {
                storePlugins: store
            });
            this.panelPlugins.on('render:after', _.bind(this.onAfterRender, this));

            store.on({
                add: this.onAddPlugin.bind(this),
                reset: this.onResetPlugins.bind(this)
            });


            this._moveOffset = {x:0, y:0};
            this.autostart = null;
        },

        setApi: function(api) {
            this.api = api;

            this.api.asc_registerCallback("asc_onPluginShow", _.bind(this.onPluginShow, this));
            this.api.asc_registerCallback("asc_onPluginClose", _.bind(this.onPluginClose, this));
            this.api.asc_registerCallback("asc_onPluginResize", _.bind(this.onPluginResize, this));
            this.api.asc_registerCallback("asc_onPluginMouseUp", _.bind(this.onPluginMouseUp, this));
            this.api.asc_registerCallback("asc_onPluginMouseMove", _.bind(this.onPluginMouseMove, this));

            return this;
        },

        setMode: function(mode) {
            if (mode.canPlugins) {
                this.updatePluginsList();
            }
            return this;
        },

        onAfterRender: function(panelPlugins) {
            panelPlugins.viewPluginsList.on('item:click', _.bind(this.onSelectPlugin, this));
            this.bindViewEvents(this.panelPlugins, this.events);
            var me = this;
            Common.NotificationCenter.on({
                'layout:resizestart': function(e){
                    if (me.panelPlugins.isVisible()) {
                        var offset = me.panelPlugins.currentPluginFrame.offset();
                        me._moveOffset = {x: offset.left + parseInt(me.panelPlugins.currentPluginFrame.css('padding-left')),
                                            y: offset.top + parseInt(me.panelPlugins.currentPluginFrame.css('padding-top'))};
                        me.api.asc_pluginEnableMouseEvents(true);
                    }
                },
                'layout:resizestop': function(e){
                    if (me.panelPlugins.isVisible()) {
                        me.api.asc_pluginEnableMouseEvents(false);
                    }
                }
            });
        },

        updatePluginsList: function() {
            var me = this;
            var storePlugins = this.getApplication().getCollection('Common.Collections.Plugins'),
                arr = [];
            storePlugins.each(function(item){
                var plugin = new Asc.CPlugin();
                plugin.set_Name(item.get('name'));
                plugin.set_Guid(item.get('guid'));
                plugin.set_BaseUrl(item.get('baseUrl'));
                var variations = item.get('variations'),
                    variationsArr = [];
                variations.forEach(function(itemVar){
                    var variation = new Asc.CPluginVariation();
                    variation.set_Description(itemVar.get('description'));
                    variation.set_Url(itemVar.get('url'));
                    variation.set_Icons(itemVar.get('icons'));
                    variation.set_Visual(itemVar.get('isVisual'));
                    variation.set_CustomWindow(itemVar.get('isCustomWindow'));
                    variation.set_System(itemVar.get('isSystem'));
                    variation.set_Viewer(itemVar.get('isViewer'));
                    variation.set_EditorsSupport(itemVar.get('EditorsSupport'));
                    variation.set_Modal(itemVar.get('isModal'));
                    variation.set_InsideMode(itemVar.get('isInsideMode'));
                    variation.set_InitDataType(itemVar.get('initDataType'));
                    variation.set_InitData(itemVar.get('initData'));
                    variation.set_UpdateOleOnResize(itemVar.get('isUpdateOleOnResize'));
                    variation.set_Buttons(itemVar.get('buttons'));
                    variation.set_Size(itemVar.get('size'));
                    variation.set_InitOnSelectionChanged(itemVar.get('initOnSelectionChanged'));
                    variation.set_Events(itemVar.get('events'));
                    variationsArr.push(variation);
                });
                plugin.set_Variations(variationsArr);
                item.set('pluginObj', plugin);
                arr.push(plugin);
            });
            this.api.asc_pluginsRegister('', arr);
            if (storePlugins.hasVisible())
                Common.NotificationCenter.trigger('tab:visible', 'plugins', true);
        },

        onAddPlugin: function (model) {
            var me = this;
            if ( me.$toolbarPanelPlugins ) {
                var btn = me.panelPlugins.createPluginButton(model);
                if (!btn) return;

                var _group = $('> .group', me.$toolbarPanelPlugins);
                var $slot = $('<span class="slot"></span>').appendTo(_group);
                btn.render($slot);
            }
        },

        onResetPlugins: function (collection) {
            var me = this;
            if ( me.$toolbarPanelPlugins ) {
                me.$toolbarPanelPlugins.empty();

                var _group = $('<div class="group"></div>'),
                    rank = -1,
                    rank_plugins = 0;
                collection.each(function (model) {
                    var new_rank = model.get('groupRank');
                    if (new_rank!==rank && rank>-1 && rank_plugins>0) {
                        _group.appendTo(me.$toolbarPanelPlugins);
                        $('<div class="separator long"></div>').appendTo(me.$toolbarPanelPlugins);
                        _group = $('<div class="group"></div>');
                        rank_plugins = 0;
                    }

                    var btn = me.panelPlugins.createPluginButton(model);
                    if (btn) {
                        var $slot = $('<span class="slot"></span>').appendTo(_group);
                        btn.render($slot);
                        rank_plugins++;
                    }
                    rank = new_rank;
                });
                _group.appendTo(me.$toolbarPanelPlugins);
            }
        },

        onSelectPlugin: function(picker, item, record, e){
            var btn = $(e.target);
            if (btn && btn.hasClass('plugin-caret')) {
                var menu = this.panelPlugins.pluginMenu;
                if (menu.isVisible()) {
                    menu.hide();
                    return;
                }

                var showPoint, me = this,
                    currentTarget = $(e.currentTarget),
                    parent = $(this.panelPlugins.el),
                    offset = currentTarget.offset(),
                    offsetParent = parent.offset();

                showPoint = [offset.left - offsetParent.left + currentTarget.width(), offset.top - offsetParent.top + currentTarget.height()/2];

                if (record != undefined) {
                    for (var i = 0; i < menu.items.length; i++) {
                        menu.removeItem(menu.items[i]); i--;
                    }
                    menu.removeAll();

                    var variations = record.get('variations');
                    for (var i=0; i<variations.length; i++) {
                        var variation = variations[i],
                            mnu = new Common.UI.MenuItem({
                                caption     : (i>0) ? variation.get('description') : me.panelPlugins.textStart,
                                value       : parseInt(variation.get('index'))
                            }).on('click', function(item, e) {
                                if (me.api) {
                                    me.api.asc_pluginRun(record.get('guid'), item.value, '');
                                }
                        });
                        menu.addItem(mnu);
                    }
                }

                var menuContainer = parent.find('#menu-plugin-container');
                if (!menu.rendered) {
                    if (menuContainer.length < 1) {
                        menuContainer = $('<div id="menu-plugin-container" style="position: absolute; z-index: 10000;"><div class="dropdown-toggle" data-toggle="dropdown"></div></div>', menu.id);
                        parent.append(menuContainer);
                    }
                    menu.render(menuContainer);
                    menu.cmpEl.attr({tabindex: "-1"});

                    menu.on({
                        'show:after': function(cmp) {
                            if (cmp && cmp.menuAlignEl)
                                cmp.menuAlignEl.toggleClass('over', true);
                        },
                        'hide:after': function(cmp) {
                            if (cmp && cmp.menuAlignEl)
                                cmp.menuAlignEl.toggleClass('over', false);
                        }
                    });
                }

                menuContainer.css({left: showPoint[0], top: showPoint[1]});

                menu.menuAlignEl = currentTarget;
                menu.setOffset(-20, -currentTarget.height()/2 - 3);
                menu.show();
                _.delay(function() {
                    menu.cmpEl.focus();
                }, 10);
                e.stopPropagation();
                e.preventDefault();
            } else
                this.api.asc_pluginRun(record.get('guid'), 0, '');
        },

        onPluginShow: function(plugin, variationIndex, frameId, urlAddition) {
            var variation = plugin.get_Variations()[variationIndex];
            if (variation.get_Visual()) {
                var url = variation.get_Url();
                url = ((plugin.get_BaseUrl().length == 0) ? url : plugin.get_BaseUrl()) + url;
                if (urlAddition)
                    url += urlAddition;
                if (variation.get_InsideMode()) {
                    if (!this.panelPlugins.openInsideMode(plugin.get_Name(), url, frameId))
                        this.api.asc_pluginButtonClick(-1);
                } else {
                    var me = this,
                        isCustomWindow = variation.get_CustomWindow(),
                        arrBtns = variation.get_Buttons(),
                        newBtns = {},
                        size = variation.get_Size();
                        if (!size || size.length<2) size = [800, 600];

                    if (_.isArray(arrBtns)) {
                        _.each(arrBtns, function(b, index){
                            if (b.visible)
                                newBtns[index] = {text: b.text, cls: 'custom' + ((b.primary) ? ' primary' : '')};
                        });
                    }

                    me.pluginDlg = new Common.Views.PluginDlg({
                        cls: isCustomWindow ? 'plain' : '',
                        header: !isCustomWindow,
                        title: plugin.get_Name(),
                        width: size[0], // inner width
                        height: size[1], // inner height
                        url: url,
                        frameId : frameId,
                        buttons: isCustomWindow ? undefined : newBtns,
                        toolcallback: _.bind(this.onToolClose, this)
                    });
                    me.pluginDlg.on({
                        'render:after': function(obj){
                            obj.getChild('.footer .dlg-btn').on('click', _.bind(me.onDlgBtnClick, me));
                            me.pluginContainer = me.pluginDlg.$window.find('#id-plugin-container');
                        },
                        'close': function(obj){
                            me.pluginDlg = undefined;
                        },
                        'drag': function(args){
                            me.api.asc_pluginEnableMouseEvents(args[1]=='start');
                        },
                        'resize': function(args){
                            me.api.asc_pluginEnableMouseEvents(args[1]=='start');
                        }
                    });

                    me.pluginDlg.show();
                }
            }
            this.panelPlugins.openedPluginMode(plugin.get_Guid());
        },

        onPluginClose: function(plugin) {
            if (this.pluginDlg)
                this.pluginDlg.close();
            else if (this.panelPlugins.iframePlugin)
                this.panelPlugins.closeInsideMode();
            this.panelPlugins.closedPluginMode(plugin.get_Guid());
            this.runAutoStartPlugins(this.autostart);
        },

        onPluginResize: function(size, minSize, maxSize, callback ) {
            if (this.pluginDlg) {
                var resizable = (minSize && minSize.length>1 && maxSize && maxSize.length>1 && (maxSize[0] > minSize[0] || maxSize[1] > minSize[1] || maxSize[0]==0 || maxSize[1] == 0));
                this.pluginDlg.setResizable(resizable, minSize, maxSize);
                this.pluginDlg.setInnerSize(size[0], size[1]);
                if (callback)
                    callback.call();
            }
        },
        
        onDlgBtnClick: function(event) {
            var state = event.currentTarget.attributes['result'].value;
            this.api.asc_pluginButtonClick(parseInt(state));
        },

        onToolClose: function() {
            this.api.asc_pluginButtonClick(-1);
        },

        onPluginMouseUp: function(x, y) {
            if (this.pluginDlg) {
                if (this.pluginDlg.binding.dragStop) this.pluginDlg.binding.dragStop();
                if (this.pluginDlg.binding.resizeStop) this.pluginDlg.binding.resizeStop();
            } else
                Common.NotificationCenter.trigger('frame:mouseup', { pageX: x*Common.Utils.zoom()+this._moveOffset.x, pageY: y*Common.Utils.zoom()+this._moveOffset.y });
        },
        
        onPluginMouseMove: function(x, y) {
            if (this.pluginDlg) {
                var offset = this.pluginContainer.offset();
                if (this.pluginDlg.binding.drag) this.pluginDlg.binding.drag({ pageX: x*Common.Utils.zoom()+offset.left, pageY: y*Common.Utils.zoom()+offset.top });
                if (this.pluginDlg.binding.resize) this.pluginDlg.binding.resize({ pageX: x*Common.Utils.zoom()+offset.left, pageY: y*Common.Utils.zoom()+offset.top });
            } else
                Common.NotificationCenter.trigger('frame:mousemove', { pageX: x*Common.Utils.zoom()+this._moveOffset.x, pageY: y*Common.Utils.zoom()+this._moveOffset.y });
        },

        runAutoStartPlugins: function(autostart) {
            if (autostart && autostart.length>0) {
                var guid = autostart.shift();
                this.autostart = autostart;
                this.api.asc_pluginRun(guid, 0, '');
            }
        }

    }, Common.Controllers.Plugins || {}));
});
