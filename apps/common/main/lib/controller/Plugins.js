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
        },

        events: function() {
            return {
                'click #id-plugin-close':_.bind(this.onToolClose,this)
            };
        },

        onLaunch: function() {
            this.panelPlugins= this.createView('Common.Views.Plugins', {
                storePlugins: this.getApplication().getCollection('Common.Collections.Plugins')
            });
            this.panelPlugins.on('render:after', _.bind(this.onAfterRender, this));
        },

        setApi: function(api) {
            this.api = api;

            this.api.asc_registerCallback("asc_onPluginShow", _.bind(this.onPluginShow, this));
            this.api.asc_registerCallback("asc_onPluginClose", _.bind(this.onPluginClose, this));

            return this;
        },

        setMode: function(mode) {
            if (mode.canPlugins) {
                this.panelPlugins.pluginsPath = mode.pluginsPath;
                this.updatePluginsList();
            }
        },

        onAfterRender: function(panelPlugins) {
            panelPlugins.viewPluginsList.on('item:click', _.bind(this.onSelectPlugin, this));
            this.bindViewEvents(this.panelPlugins, this.events);
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
                    variation.set_Viewer(itemVar.get('isViewer'));
                    variation.set_EditorsSupport(itemVar.get('EditorsSupport'));
                    variation.set_Modal(itemVar.get('isModal'));
                    variation.set_InsideMode(itemVar.get('isInsideMode'));
                    variation.set_InitDataType(itemVar.get('initDataType'));
                    variation.set_InitData(itemVar.get('initData'));
                    variation.set_UpdateOleOnResize(itemVar.get('isUpdateOleOnResize'));
                    variation.set_Buttons(itemVar.get('buttons'));
                    variationsArr.push(variation);
                });
                plugin.set_Variations(variationsArr);
                item.set('pluginObj', plugin);
                arr.push(plugin);
            });
            this.api.asc_pluginsRegister(this.panelPlugins.pluginsPath, arr);
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

                    menu.on('show:after', function(cmp) {
                        if (cmp && cmp.menuAlignEl)
                            cmp.menuAlignEl.toggleClass('over', true);
                    }).on('hide:after', function(cmp) {
                        if (cmp && cmp.menuAlignEl)
                            cmp.menuAlignEl.toggleClass('over', false);
                    });
                }

                menuContainer.css({left: showPoint[0], top: showPoint[1]});

                menu.menuAlignEl = currentTarget;
                menu.setOffset(-11, -currentTarget.height()/2 + 2);
                menu.show();
                _.delay(function() {
                    menu.cmpEl.focus();
                }, 10);
                e.stopPropagation();
                e.preventDefault();
            } else
                this.api.asc_pluginRun(record.get('guid'), 0, '');
        },

        onPluginShow: function(plugin) {
            var variation = plugin.get_Variations()[0];
            if (!variation.get_Visual()) return;
            
            if (variation.get_InsideMode()) {
                this.panelPlugins.openInsideMode(plugin.get_Name(), ((plugin.get_BaseUrl().length == 0) ? this.panelPlugins.pluginsPath : plugin.get_BaseUrl()) + variation.get_Url());
            } else {
                var me = this,
                    arrBtns = variation.get_Buttons(),
                    newBtns = {};

                if (_.isArray(arrBtns)) {
                    _.each(arrBtns, function(b, index){
                        newBtns[index] = {text: b.text, cls: 'custom' + ((b.primary) ? ' primary' : '')};
                    });
                }

                var _baseUrl = (plugin.get_BaseUrl().length == 0) ? me.panelPlugins.pluginsPath : plugin.get_BaseUrl();
                me.pluginDlg = new Common.Views.PluginDlg({
                    title: plugin.get_Name(),
                    url: _baseUrl + variation.get_Url(),
                    buttons: newBtns,
                    toolcallback: _.bind(this.onToolClose, this)
                });
                me.pluginDlg.on('render:after', function(obj){
                    obj.getChild('.footer .dlg-btn').on('click', _.bind(me.onDlgBtnClick, me));
                }).on('close', function(obj){
                    me.pluginDlg = undefined;
                });
                me.pluginDlg.show();
            }
        },

        onPluginClose: function() {
            if (this.pluginDlg)
                this.pluginDlg.close();
            else
                this.panelPlugins.closeInsideMode();
        },

        onDlgBtnClick: function(event) {
            var state = event.currentTarget.attributes['result'].value;
            this.api.asc_pluginButtonClick(parseInt(state));
        },

        onToolClose: function() {
            this.api.asc_pluginButtonClick(-1);
        }

    }, Common.Controllers.Plugins || {}));
});
