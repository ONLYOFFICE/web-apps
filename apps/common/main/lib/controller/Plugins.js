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
 * Date: 17.05.16
 */

define([
    'core',
    'common/main/lib/collection/Plugins',
    'common/main/lib/view/Plugins',
    'common/main/lib/component/Switcher'
], function () {
    'use strict';

    Common.Controllers.Plugins = Backbone.Controller.extend(_.extend({
        models: [],
        appOptions: {},
        configPlugins: {autostart:[]},// {config: 'from editor config', plugins: 'loaded plugins', UIplugins: 'loaded customization plugins', autostart: 'autostart guids'}
        serverPlugins: {autostart:[]},// {config: 'from editor config', plugins: 'loaded plugins', autostart: 'autostart guids'}
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

                        if ( !appOptions.isEditMailMerge && !appOptions.isEditDiagram && !appOptions.isEditOle ) {
                            var tab = {action: 'plugins', caption: me.viewPlugins.groupCaption, dataHintTitle: 'E', layoutname: 'toolbar-plugins'};
                            me.$toolbarPanelPlugins = me.viewPlugins.getPanel();
                            me.toolbar = toolbar;
                            toolbar.addTab(tab, me.$toolbarPanelPlugins, Common.UI.LayoutManager.lastTabIdx);     // TODO: clear plugins list in left panel
                        }
                    },
                    'tab:active': this.onActiveTab
                },
                'Common.Views.Plugins': {
                    'plugin:select': function(guid, type, isRun, closePanel) {
                        if (!this.viewPlugins.pluginPanels[guid] || (this.viewPlugins.pluginPanels[guid] && type > 0)) {
                            !isRun || type > 0 ? me.api.asc_pluginRun(guid, type, '') : me.api.asc_pluginStop(guid);
                        } else {
                            closePanel ? me.onToolClose(this.viewPlugins.pluginPanels[guid]) : me.openUIPlugin(guid);
                        }
                    }
                },
                'LeftMenu': {
                    'plugins:showpanel': function (guid) {
                        me.viewPlugins.showPluginPanel(true, guid);
                    },
                    'plugins:hidepanel': function (guid) {
                        me.viewPlugins.showPluginPanel(false, guid);
                    }
                },
                'RightMenu': {
                    'plugins:showpanel': function (guid) {
                        me.viewPlugins.showPluginPanel(true, guid);
                    },
                    'plugins:hidepanel': function (guid) {
                        me.viewPlugins.showPluginPanel(false, guid);
                    }
                }
            });
        },

        onLaunch: function() {
            var store = this.getApplication().getCollection('Common.Collections.Plugins');
            this.viewPlugins= this.createView('Common.Views.Plugins', {
                storePlugins: store
            });

            store.on({
                add: this.onAddPlugin.bind(this),
                reset: this.onResetPlugins.bind(this)
            });


            this._moveOffset = {x:0, y:0};
            this.autostart = [];
            this.customPluginsDlg = [];

            this.newInstalledBackgroundPlugins = [];

            Common.Gateway.on('init', this.loadConfig.bind(this));
            Common.NotificationCenter.on('app:face', this.onAppShowed.bind(this));
            Common.NotificationCenter.on('uitheme:changed', this.updatePluginsButtons.bind(this));
            Common.NotificationCenter.on('window:resize', this.updatePluginsButtons.bind(this));
            Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            Common.NotificationCenter.on('doc:mode-changed', this.onChangeDocMode.bind(this));
            Common.NotificationCenter.on('modal:close', this.onModalClose.bind(this));
        },

        loadConfig: function(data) {
            var me = this;
            me.configPlugins.config = data.config.plugins;
            me.editor = !!window.PDFE ? 'pdf' : !!window.DE ? 'word' : !!window.PE ? 'slide' : 'cell';
            me.isPDFEditor = !!window.PDFE;
        },

        loadPlugins: function() {
            this.configPlugins.plugins =
            this.serverPlugins.plugins = false;

            if (this.configPlugins.config) {
                this.getPlugins(this.configPlugins.config.pluginsData)
                    .then(function(loaded) {
                        me.configPlugins.plugins = loaded;
                        me.mergePlugins();
                    })
                    .catch(function(err) {
                        me.configPlugins.plugins = false;
                    });

                if (this.configPlugins.config.options)
                    this.api.setPluginsOptions(this.configPlugins.config.options);
            }

            if ( !Common.Controllers.Desktop.isActive() || !Common.Controllers.Desktop.isOffline() ) {
                var server_plugins_url = '../../../../plugins.json',
                    me = this;
                Common.Utils.loadConfig(server_plugins_url, function (obj) {
                    if (obj != 'error') {
                        me.serverPlugins.config = obj;
                        me.getPlugins(me.serverPlugins.config.pluginsData)
                            .then(function (loaded) {
                                me.serverPlugins.plugins = loaded;
                                me.mergePlugins();
                            })
                            .catch(function (err) {
                                me.serverPlugins.plugins = false;
                            });
                    }
                });
            }
        },

        onAppShowed: function (config) {
        },

        onAppReady: function (config) {
            var me = this;
            (new Promise(function (accept, reject) {
                accept();
            })).then(function(){
                me.onChangeProtectDocument();
                Common.NotificationCenter.on('protect:doclock', _.bind(me.onChangeProtectDocument, me));
            });
        },

        setApi: function(api) {
            this.api = api;

            if (!this.appOptions.customization || (this.appOptions.customization.plugins!==false)) {
                this.api.asc_registerCallback("asc_onPluginShow", _.bind(this.onPluginShow, this));
                this.api.asc_registerCallback("asc_onPluginClose", _.bind(this.onPluginClose, this));
                this.api.asc_registerCallback("asc_onPluginResize", _.bind(this.onPluginResize, this));
                this.api.asc_registerCallback("asc_onPluginMouseUp", _.bind(this.onPluginMouseUp, this));
                this.api.asc_registerCallback("asc_onPluginMouseMove", _.bind(this.onPluginMouseMove, this));
                this.api.asc_registerCallback('asc_onPluginsReset', _.bind(this.resetPluginsList, this));
                this.api.asc_registerCallback('asc_onPluginsInit', _.bind(this.onPluginsInit, this));
                this.api.asc_registerCallback('asc_onPluginShowButton', _.bind(this.onPluginShowButton, this));
                this.api.asc_registerCallback('asc_onPluginHideButton', _.bind(this.onPluginHideButton, this));

                this.api.asc_registerCallback("asc_onPluginWindowShow", _.bind(this.onPluginWindowShow, this));
                this.api.asc_registerCallback("asc_onPluginWindowClose", _.bind(this.onPluginWindowClose, this));
                this.api.asc_registerCallback("asc_onPluginWindowResize", _.bind(this.onPluginWindowResize, this));
                this.api.asc_registerCallback("asc_onPluginWindowMouseUp", _.bind(this.onPluginWindowMouseUp, this));
                this.api.asc_registerCallback("asc_onPluginWindowMouseMove", _.bind(this.onPluginWindowMouseMove, this));
                this.api.asc_registerCallback("asc_onPluginWindowActivate", _.bind(this.openUIPlugin, this));

                this.loadPlugins();
            }
            return this;
        },

        setMode: function(mode, api) {
            this.appOptions = mode;
            this.api = api;
            this.customPluginsComplete = !this.appOptions.canBrandingExt;
            if (this.appOptions.canBrandingExt)
                this.getAppCustomPlugins(this.configPlugins);
            return this;
        },

        onAfterRender: function(panel, guid) {
            var me = this;
            this.openUIPlugin(guid);
            panel.pluginClose.on('click', _.bind(this.onToolClose, this, panel));
            Common.NotificationCenter.on({
                'layout:resizestart': function(e) {
                    if (panel) {
                        var offset = panel.currentPluginFrame.offset();
                        me._moveOffset = {x: offset.left + parseInt(panel.currentPluginFrame.css('padding-left')),
                                            y: offset.top + parseInt(panel.currentPluginFrame.css('padding-top'))};
                        me.api.asc_pluginEnableMouseEvents(true);
                    }
                },
                'layout:resizestop': function(e){
                    if (panel) {
                        me.api.asc_pluginEnableMouseEvents(false);
                    }
                }
            });
        },

        refreshPluginsList: function() {
            var me = this;
            var storePlugins = this.getApplication().getCollection('Common.Collections.Plugins'),
                arr = [];
            storePlugins.each(function(item){
                var plugin = new Asc.CPlugin();
                plugin.deserialize(item.get('original'));
                item.set('pluginObj', plugin);
                arr.push(plugin);
            });
            this.api.asc_pluginsRegister('', arr);
            if (storePlugins.hasVisible())
                Common.NotificationCenter.trigger('tab:visible', 'plugins', Common.UI.LayoutManager.isElementVisible('toolbar-plugins'));
            Common.Gateway.pluginsReady();
        },

        onAddPlugin: function (model) {
            var me = this;
            if ( me.$toolbarPanelPlugins ) {
                var btn = me.viewPlugins.createPluginButton(model);
                if (!btn) return;

                var _group = $('> .group', me.$toolbarPanelPlugins);
                var $slot = $('<span class="btn-slot text x-huge"></span>').appendTo(_group);
                btn.render($slot);
                var docProtection = me.viewPlugins._state.docProtection;
                Common.Utils.lockControls(Common.enumLock.docLockView, docProtection.isReadOnly, {array: btn});
                Common.Utils.lockControls(Common.enumLock.docLockForms, docProtection.isFormsOnly, {array: btn});
                Common.Utils.lockControls(Common.enumLock.docLockComments, docProtection.isCommentsOnly, {array: btn});
            }
        },

        addBackgroundPluginsButton: function (group) {
            group.appendTo(this.$toolbarPanelPlugins); // append previous button (Plugin Manager)
            //$('<div class="separator long"></div>').appendTo(me.$toolbarPanelPlugins);
            group = $('<div class="group" style="' + (Common.UI.isRTL() ? 'padding-right: 0;' : 'padding-left: 0;') + '"></div>');
            this.viewPlugins.backgroundBtn = this.viewPlugins.createBackgroundPluginsButton();
            var $backgroundSlot = $('<span class="btn-slot text x-huge"></span>').appendTo(group);
            this.viewPlugins.backgroundBtn.render($backgroundSlot);
            this.viewPlugins.backgroundBtn.hide();

            return group;
        },

        turnOffBackgroundPlugin: function (guid) {
            if (this.backgroundPluginsSwitchers) {
                var switcher;
                this.backgroundPluginsSwitchers.forEach(function (item) {
                    if (item.options.pluginGuid === guid) {
                        switcher = item;
                    }
                });
                if (switcher) {
                    switcher.updateHint(this.viewPlugins.textStart);
                    switcher.setValue(false);
                    return true;
                }
                return false;
            }
        },

        onShowBeforeBackgroundPlugins: function (menu) {
            var me = this;
            me.clickInsideMenu = false;
            var hideActiveMenu = function () {
                var activeMenu = menu.cmpEl.find('.dropdown-toggle.active');
                for (var i=0; i<activeMenu.length; i++) {
                    var m = activeMenu[i],
                        b = $(m).parent();
                    b.toggleClass('open', false);
                    $(m).trigger($.Event('hide.bs.dropdown'));
                }
            };
            this.backgroundPluginsSwitchers = [];
            var usedPlugins = this.api.getUsedBackgroundPlugins();
            this.backgroundPlugins.forEach(function (model) {
                var modes = model.get('variations'),
                    icons = modes[model.get('currentVariation')].get('icons'),
                    parsedIcons = me.viewPlugins.parseIcons(icons),
                    icon_url = model.get('baseUrl') + parsedIcons['normal'],
                    guid = model.get('guid'),
                    isRun = _.indexOf(usedPlugins, guid) !== -1;
                model.set('parsedIcons', parsedIcons);
                var menuItem = new Common.UI.MenuItem({
                    value: guid,
                    caption: model.get('name'),
                    iconImg: icon_url,
                    template: _.template([
                        '<div id="<%= id %>" class="menu-item" <% if(!_.isUndefined(options.stopPropagation)) { %> data-stopPropagation="true" <% } %> >',
                            '<img class="menu-item-icon" src="<%= options.iconImg %>">',
                            '<div class="plugin-caption"><%= caption %></div>',
                            '<div class="plugin-tools">',
                                '<div class="plugin-toggle"></div>',
                                '<div class="plugin-settings"></div>',
                            '</span>',
                        '</a>'
                    ].join('')),
                    stopPropagation: true
                });
                menu.addItem(menuItem);
                model.set('backgroundPlugin', menuItem);
                var switcher = new Common.UI.Switcher({
                    el: menuItem.$el.find('.plugin-toggle')[0],
                    value: !!model.isSystem || isRun,
                    disabled: !!model.isSystem,
                    pluginGuid: guid,
                    hint: isRun ? me.viewPlugins.textStop : me.viewPlugins.textStart
                });
                switcher.on('change', function (element, value) {
                    switcher.updateHint(value ? me.viewPlugins.textStop : me.viewPlugins.textStart);
                    me.viewPlugins.fireEvent('plugin:select', [switcher.options.pluginGuid, 0, !value]);
                });
                me.backgroundPluginsSwitchers.push(switcher);
                var menuItems = [];
                _.each(modes, function(variation, index) {
                    if (index > 0 && variation.get('visible'))
                        menuItems.push({
                            caption: variation.get('description'),
                            value: parseInt(variation.get('index'))
                        });
                });
                if (menuItems.length > 0) {
                    var btn = new Common.UI.Button({
                        parentEl: menuItem.$el.find('.plugin-settings'),
                        cls: 'btn-toolbar',
                        iconCls: 'menu__icon btn-more',
                        menu: new Common.UI.Menu({
                            menuAlign: 'tl-bl',
                            items: menuItems,
                            pluginGuid: guid
                        }),
                        onlyIcon: true,
                        stopPropagation: true,
                        hint: me.viewPlugins.textSettings
                    });
                    btn.menu.on('item:click', function (menu, item, e) {
                        Common.UI.Menu.Manager.hideAll();
                        me.viewPlugins.fireEvent('plugin:select', [menu.options.pluginGuid, item.value, false]);
                        me.clickInsideMenu = false;
                    });
                    btn.menu.on('keydown:before', function (menu, e) {
                        if (e.keyCode == Common.UI.Keys.ESC) {
                            hideActiveMenu();
                            _.delay(function(){
                                btn.cmpEl.closest('.btn-group.open').find('[data-toggle=dropdown]:first').focus();
                            }, 10);
                        }
                    });
                    btn.menu.cmpEl.find('li').on('mousedown', function () {
                        me.clickInsideMenu = true;
                    });
                    btn.cmpEl.on('mousedown', function () {
                        me.clickInsideMenu = true;
                    });
                    btn.on('click', function () {
                        var btnGroup = btn.$el.find('.btn-group'),
                            isOpen = btnGroup.hasClass('open');
                        if (!isOpen) hideActiveMenu();
                        btnGroup.toggleClass('open', !isOpen);
                        $(btn.menu.el).trigger($.Event(!isOpen ? 'show.bs.dropdown' : 'hide.bs.dropdown'));
                        me.clickInsideMenu = false;
                    });
                }
            });
            menu.cmpEl.find('li').on('mousedown', function () {
                if (me.clickInsideMenu) return;
                hideActiveMenu();
            });
        },

        onResetPlugins: function (collection) {
            var me = this;
            me.appOptions.canPlugins = !collection.isEmpty();
            if ( me.$toolbarPanelPlugins ) {
                me.backgroundPlugins = [];
                me.$toolbarPanelPlugins.empty();
                me.toolbar && me.toolbar.clearMoreButton('plugins');

                var _group = $('<div class="group"></div>'),
                    rank = -1,
                    rank_plugins = 0,
                    isBackground = false;
                collection.each(function (model) {
                    var new_rank = model.get('groupRank'),
                        isBackgroundPlugin = model.get('isBackgroundPlugin');
                    if (isBackgroundPlugin) {
                        me.backgroundPlugins.push(model);
                        return;
                    }
                    if (model.get('tab')) {
                        me.toolbar && me.toolbar.addCustomItems(model.get('tab'), [me.viewPlugins.createPluginButton(model)]);
                        return;
                    }

                    //if (new_rank === 1 || new_rank === 2) return; // for test
                    if ((new_rank === 0 || new_rank === 2) && !isBackground) {
                        _group = me.addBackgroundPluginsButton(_group);
                        isBackground = true;
                        rank = 1.5;
                        rank_plugins++;
                    }
                    if (new_rank!==rank && rank>-1 && rank_plugins>0) {
                        _group.appendTo(me.$toolbarPanelPlugins);
                        $('<div class="separator long"></div>').appendTo(me.$toolbarPanelPlugins);
                        _group = $('<div class="group"></div>');
                        rank_plugins = 0;
                    } else {
                        _group.appendTo(me.$toolbarPanelPlugins);
                        $('<div class="separator long invisible"></div>').appendTo(me.$toolbarPanelPlugins);
                        _group = $('<div class="group" style="' + (Common.UI.isRTL() ? 'padding-right: 0;' : 'padding-left: 0;') + '"></div>');
                    }

                    var btn = me.viewPlugins.createPluginButton(model);
                    if (btn) {
                        var $slot = $('<span class="btn-slot text x-huge"></span>').appendTo(_group);
                        btn.render($slot);
                        rank_plugins++;
                    }
                    if (new_rank === 1 && !isBackground) {
                        _group = me.addBackgroundPluginsButton(_group);
                        isBackground = true;
                    }
                    rank = new_rank;
                });
                _group.appendTo(me.$toolbarPanelPlugins);
                if (me.backgroundPlugins.length > 0) {
                    me.viewPlugins.backgroundBtn.show();
                    var onShowBefore = function (menu) {
                        me.onShowBeforeBackgroundPlugins(menu);
                        menu.off('show:before', onShowBefore);
                    };
                    me.viewPlugins.backgroundBtn.menu.on('show:before', onShowBefore);
                    me.viewPlugins.backgroundBtn.on('click', function () {
                        if (me.backgroundPluginsTip) {
                            me.backgroundPluginsTip.close();
                            me.backgroundPluginsTip = undefined;
                            me.newInstalledBackgroundPlugins && (me.newInstalledBackgroundPlugins.length = 0);
                        }
                    });
                }

                me.toolbar && me.toolbar.isTabActive('plugins') && me.toolbar.processPanelVisible(null, true);
                var docProtection = me.viewPlugins._state.docProtection;
                Common.Utils.lockControls(Common.enumLock.docLockView, docProtection.isReadOnly, {array: me.viewPlugins.lockedControls});
                Common.Utils.lockControls(Common.enumLock.docLockForms, docProtection.isFormsOnly, {array: me.viewPlugins.lockedControls});
                Common.Utils.lockControls(Common.enumLock.docLockComments, docProtection.isCommentsOnly, {array: me.viewPlugins.lockedControls});
            } else {
                console.error('toolbar panel isnot created');
            }
        },

        updatePluginsButtons: function() {
            var storePlugins = this.getApplication().getCollection('Common.Collections.Plugins'),
                me = this,
                iconsInLeftMenu = [],
                iconsInRightMenu = [];
            storePlugins.each(function(item){
                me.viewPlugins.updatePluginIcons(item);
                var guid = item.get('guid');
                if (me.viewPlugins.pluginPanels[guid] && item.get('parsedIcons')) {
                    var menu = me.viewPlugins.pluginPanels[guid].menu === 'right' ? iconsInRightMenu : iconsInLeftMenu;
                    menu.push({
                        guid: guid,
                        baseUrl: item.get('baseUrl'),
                        parsedIcons: item.get('parsedIcons')
                    });
                }
            });
            for (var key in this.viewPlugins.customPluginPanels) {
                var panel = this.viewPlugins.customPluginPanels[key];
                if (panel.icons) {
                    var menu = panel.menu === 'right' ? iconsInRightMenu : iconsInLeftMenu;
                    menu.push({
                        guid: panel.frameId,
                        baseUrl: panel.baseUrl,
                        parsedIcons: this.viewPlugins.parseIcons(panel.icons)
                    });
                }
            }
            if (iconsInLeftMenu.length > 0) {
                me.viewPlugins.fireEvent('pluginsleft:updateicons', [iconsInLeftMenu]);
            }
            if (iconsInRightMenu.length > 0) {
                me.viewPlugins.fireEvent('pluginsright:updateicons', [iconsInRightMenu]);
            }
        },

        onSelectPlugin: function(picker, item, record, e){
            var btn = $(e.target);
            if (btn && btn.hasClass('plugin-caret')) {
                var menu = this.viewPlugins.pluginMenu;
                if (menu.isVisible()) {
                    menu.hide();
                    return;
                }

                var showPoint, me = this,
                    currentTarget = $(e.currentTarget),
                    parent = $(this.viewPlugins.el),
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
                                caption     : (i>0) ? variation.get('description') : me.viewPlugins.textStart,
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

        addPluginToSideMenu: function (plugin, langName, menu) {
            function createUniqueName (name) {
                var n = name.toLowerCase().replace(/[^a-z0-9\-_:\.]/g, '-'),
                    panelName = n;
                var index = 0;
                while(true) {
                    if ($('#' + 'panel-plugins-' + panelName).length < 1) break;
                    index++;
                    panelName = n + '-' + index;
                }
                return panelName;
            }
            var pluginGuid = plugin.get_Guid(),
                model = this.viewPlugins.storePlugins.findWhere({guid: pluginGuid}),
                name = createUniqueName(plugin.get_Name('en'));
            model.set({menu: menu});
            var icon_url, icon_cls;
            if (model.get('parsedIcons')) {
                icon_url = model.get('baseUrl') + model.get('parsedIcons')['normal'];
            } else {
                icon_cls = 'icon toolbar__icon btn-plugin-panel-default';
            }
            var $button = $('<div id="slot-btn-plugins' + name + '"></div>'),
                button = new Common.UI.Button({
                parentEl: $button,
                cls: 'btn-category plugin-buttons',
                hint: langName,
                enableToggle: true,
                toggleGroup: menu === 'right' ? 'tabpanelbtnsGroup' : 'leftMenuGroup',
                iconCls: icon_cls,
                iconImg: icon_url,
                onlyIcon: true,
                value: pluginGuid,
                type: 'plugin'
            });
            var $panel = $('<div id="panel-plugins-' + name + '" class="plugin-panel" style="height: 100%;"></div>');
            this.viewPlugins.fireEvent(menu === 'right' ? 'plugins:addtoright' : 'plugins:addtoleft', [button, $button, $panel]);
            this.viewPlugins.pluginPanels[pluginGuid] = new Common.Views.PluginPanel({
                el: '#panel-plugins-' + name,
                menu: menu
            });
            this.viewPlugins.pluginPanels[pluginGuid].on('render:after', _.bind(this.onAfterRender, this, this.viewPlugins.pluginPanels[pluginGuid], pluginGuid));
        },

        openUIPlugin: function (id) {
            var model = this.viewPlugins.storePlugins.findWhere({guid: id}),
                menu = model ? model.get('menu') : (this.viewPlugins.customPluginPanels[id] && this.viewPlugins.customPluginPanels[id].menu);
            this.viewPlugins.fireEvent(menu === 'right' ? 'pluginsright:open' : 'pluginsleft:open', [id]);
        },

        onPluginShow: function(plugin, variationIndex, frameId, urlAddition) {
            var variation = plugin.get_Variations()[variationIndex];
            if (variation.get_Visual()) {
                var lang = this.appOptions && this.appOptions.lang ? this.appOptions.lang.split(/[\-_]/)[0] : 'en';
                var url = variation.get_Url();
                url = ((plugin.get_BaseUrl().length == 0) ? url : plugin.get_BaseUrl()) + url;
                if (urlAddition)
                    url += urlAddition;
                if (variation.get_InsideMode()) {
                    var guid = plugin.get_Guid(),
                        langName = plugin.get_Name(lang),
                        menu = this.isPDFEditor ? 'left' : (variation.get_Type() == Asc.PluginType.PanelRight ? 'right' : 'left');
                        !menu && (menu = 'left');
                        this.addPluginToSideMenu(plugin, langName, menu);
                    if (!this.viewPlugins.pluginPanels[guid].openInsideMode(langName, url, frameId, plugin.get_Guid()))
                        this.api.asc_pluginButtonClick(-1, plugin.get_Guid());
                } else {
                    var me = this;
                    var createPluginDlg = function () {
                        var isCustomWindow = variation.get_CustomWindow(),
                            arrBtns = variation.get_Buttons(),
                            newBtns = [],
                            size = variation.get_Size(),
                            isModal = variation.get_Modal();
                        if (!size || size.length<2) size = [800, 600];

                        if (_.isArray(arrBtns)) {
                            _.each(arrBtns, function(b, index){
                                if (b.visible)
                                    newBtns[index] = {caption: b.text, value: index, primary: b.primary};
                            });
                        }

                        var help = variation.get_Help();
                        me.pluginDlg = new Common.Views.PluginDlg({
                            guid: plugin.get_Guid(),
                            cls: isCustomWindow ? 'plain' : '',
                            header: !isCustomWindow,
                            title: Common.Utils.String.htmlEncode(plugin.get_Name(lang)),
                            width: size[0], // inner width
                            height: size[1], // inner height
                            url: url,
                            frameId : frameId,
                            buttons: isCustomWindow ? undefined : newBtns,
                            toolcallback: function(event) {
                                me.api.asc_pluginButtonClick(-1, plugin.get_Guid());
                            },
                            help: !!help,
                            loader: plugin.get_Loader(),
                            modal: isModal!==undefined ? isModal : true
                        });
                        me.pluginDlg.on({
                            'render:after': function(obj){
                                obj.getChild('.footer .dlg-btn').on('click', function(event) {
                                    me.api.asc_pluginButtonClick(parseInt(event.currentTarget.attributes['result'].value), plugin.get_Guid());
                                });
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
                            },
                            'help': function(){
                                help && window.open(help, '_blank');
                            },
                            'header:click': function(type){
                                me.api.asc_pluginButtonClick(type, plugin.get_Guid());
                            }
                        });

                        me.pluginDlg.show();
                    };
                    if (this.pluginDlg) {
                        this.api.asc_pluginButtonClick(-1, this.pluginDlg.guid);
                        setTimeout(createPluginDlg, 10);
                    } else {
                        createPluginDlg();
                    }

                }
            }
            this.viewPlugins.openedPluginMode(plugin.get_Guid(), variation.get_InsideMode());
        },

        onPluginClose: function(plugin) {
            var isIframePlugin = false,
                guid = plugin.get_Guid();
            if (this.pluginDlg && this.pluginDlg.guid === guid)
                this.pluginDlg.close();
            else {
                var panel = this.viewPlugins.pluginPanels[guid];
                if (panel && panel.iframePlugin) {
                    isIframePlugin = true;
                    panel.closeInsideMode(guid);
                    this.viewPlugins.pluginPanels[guid].$el.remove();
                    delete this.viewPlugins.pluginPanels[guid];
                    var model = this.viewPlugins.storePlugins.findWhere({guid: guid});
                    this.viewPlugins.fireEvent(model.get('menu') === 'right' ? 'pluginsright:close' : 'pluginsleft:close', [guid]);
                }
            }
            !this.turnOffBackgroundPlugin(guid) && this.viewPlugins.closedPluginMode(guid, isIframePlugin);

            this.runAutoStartPlugins();
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

        onToolClose: function(panel) {
            this.api.asc_pluginButtonClick(-1, panel && panel._state.insidePlugin, panel && panel.frameId);
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

        onPluginsInit: function(pluginsdata, fromManager) {
            !(pluginsdata instanceof Array) && (pluginsdata = pluginsdata["pluginsData"]);
            this.parsePlugins(pluginsdata, false, true, fromManager);
        },

        onPluginShowButton: function(id, toRight) {
            this.pluginDlg && this.pluginDlg.showButton(id, toRight);
        },

        onPluginHideButton: function(id) {
            this.pluginDlg && this.pluginDlg.hideButton(id);
        },

        runAutoStartPlugins: function() {
            if (this.autostart && this.autostart.length > 0) {
                this.api.asc_pluginRun(this.autostart.shift(), 0, '');
            }
        },

        resetPluginsList: function() {
            this.getApplication().getCollection('Common.Collections.Plugins').reset();
        },

        applyUICustomization: function () {
            var me = this;
            return new Promise(function(resolve, reject) {
                var timer_sl = setInterval(function() {
                    if ( me.customPluginsComplete ) {
                        clearInterval(timer_sl);
                        try {
                            me.configPlugins.UIplugins && me.configPlugins.UIplugins.forEach(function (c) {
                                if ( c.code ) eval(c.code);
                            });
                        } catch (e) {}
                        resolve();
                    }
                }, 10);
            });
        },

        parsePlugins: function(pluginsdata, uiCustomize, forceUpdate, fromManager) {
            this.newInstalledBackgroundPlugins.length = 0;
            var me = this;
            var pluginStore = this.getApplication().getCollection('Common.Collections.Plugins'),
                isEdit = me.appOptions.isEdit && !me.isPDFEditor,
                editor = me.editor,
                apiVersion = me.api ? me.api.GetVersion() : undefined;
            if ( pluginsdata instanceof Array ) {
                var arr = [], arrUI = [],
                    lang = me.appOptions.lang.split(/[\-_]/)[0];
                pluginsdata.forEach(function(item){
                    var updatedItem;
                    if (forceUpdate) {
                        updatedItem = arr.find(function (i){
                            return i.get('baseUrl') == item.baseUrl || i.get('guid') == item.guid}
                        );
                        !updatedItem && (updatedItem = pluginStore.findWhere({baseUrl: item.baseUrl}));
                        !updatedItem && (updatedItem = pluginStore.findWhere({guid: item.guid}));
                    } else {
                        if ( arr.some(function(i) {
                            return (i.get('baseUrl') == item.baseUrl || i.get('guid') == item.guid);
                        }) || pluginStore.findWhere({baseUrl: item.baseUrl}) || pluginStore.findWhere({guid: item.guid}) )
                        {
                            return;
                        }
                    }

                    var variationsArr = [],
                        pluginVisible = false,
                        isDisplayedInViewer = false,
                        isBackgroundPlugin = false,
                        isSystem;
                    item.variations.forEach(function(itemVar, itemInd){
                        var variationType = Asc.PluginType.getType(itemVar.type);
                        isSystem = (true === itemVar.isSystem) || (Asc.PluginType.System === variationType);
                        var visible = (isEdit || itemVar.isViewer && (itemVar.isDisplayedInViewer!==false)) && _.contains(itemVar.EditorsSupport, editor) && !isSystem;
                        if ( visible ) pluginVisible = true;
                        if (itemVar.isViewer && (itemVar.isDisplayedInViewer!==false))
                            isDisplayedInViewer = true;

                        if (item.isUICustomizer ) {
                            visible && arrUI.push({
                                url: item.baseUrl + itemVar.url
                            });
                        } else {
                            var model = new Common.Models.PluginVariation(itemVar);
                            var description = itemVar.description;
                            if (typeof itemVar.descriptionLocale == 'object')
                                description = itemVar.descriptionLocale[lang] || itemVar.descriptionLocale['en'] || description || '';

                            _.each(itemVar.buttons, function(b, index){
                                if (typeof b.textLocale == 'object')
                                    b.text = b.textLocale[lang] || b.textLocale['en'] || b.text || '';
                                b.visible = (isEdit || b.isViewer !== false);
                            });

                            var icons = (typeof itemVar.icons === 'string' && itemVar.icons.indexOf('%') !== -1 || !itemVar.icons2) ? itemVar.icons : itemVar.icons2;
                            if (!icons) icons = '';

                            model.set({
                                description: description,
                                index: variationsArr.length,
                                url: itemVar.url,
                                icons: icons,
                                buttons: itemVar.buttons,
                                visible: visible,
                                help: itemVar.help
                            });

                            variationsArr.push(model);
                            if (itemInd === 0) {
                                isBackgroundPlugin = itemVar.type ? variationType === Asc.PluginType.Background : false;
                            }
                        }
                    });

                    if (variationsArr.length > 0 && !item.isUICustomizer) {
                        var name = item.name;
                        if (typeof item.nameLocale == 'object')
                            name = item.nameLocale[lang] || item.nameLocale['en'] || name || '';

                        if (pluginVisible)
                            pluginVisible = me.checkPluginVersion(apiVersion, item.minVersion);

                        var props = {
                            name : name,
                            guid: item.guid,
                            baseUrl : item.baseUrl,
                            variations: variationsArr,
                            currentVariation: 0,
                            visible: pluginVisible,
                            groupName: (item.group) ? item.group.name : '',
                            groupRank: (item.group) ? item.group.rank : 0,
                            minVersion: item.minVersion,
                            original: item,
                            isDisplayedInViewer: isDisplayedInViewer,
                            isBackgroundPlugin: pluginVisible && isBackgroundPlugin,
                            isSystem: isSystem,
                            tab: item.tab ? {action: item.tab.id, caption: ((typeof item.tab.text == 'object') ? item.tab.text[lang] || item.tab.text['en'] : item.tab.text) || ''} : undefined
                        };
                        updatedItem ? updatedItem.set(props) : arr.push(new Common.Models.Plugin(props));
                        if (fromManager && !updatedItem && props.isBackgroundPlugin) {
                            me.newInstalledBackgroundPlugins.push({
                                name: name,
                                guid: item.guid
                            });
                        }
                    }
                });

                if ( uiCustomize!==false )  // from ui customizer in editor config or desktop event
                    me.configPlugins.UIplugins = arrUI;

                if ( !uiCustomize && pluginStore)
                {
                    arr = pluginStore.models.concat(arr);
                    arr.sort(function(a, b){
                        var rank_a = a.get('groupRank'),
                            rank_b = b.get('groupRank');
                        if (rank_a < rank_b)
                            return (rank_a==0) ? 1 : -1;
                        if (rank_a > rank_b)
                            return (rank_b==0) ? -1 : 1;
                        return 0;
                    });
                    pluginStore.reset(arr);
                    this.appOptions.canPlugins = !pluginStore.isEmpty();
                }
            }
            else if (!uiCustomize){
                this.appOptions.canPlugins = false;
            }

            if (!uiCustomize)
                this.getApplication().getController('LeftMenu').enablePlugins();

            if (this.appOptions.canPlugins) {
                this.refreshPluginsList();
                this.runAutoStartPlugins();
            }
        },

        checkPluginVersion: function(apiVersion, pluginVersion) {
            if (apiVersion && apiVersion!=='develop' && pluginVersion && typeof pluginVersion == 'string') {
                var res = pluginVersion.match(/^([0-9]+)(?:.([0-9]+))?(?:.([0-9]+))?$/),
                    apires = apiVersion.match(/^([0-9]+)(?:.([0-9]+))?(?:.([0-9]+))?$/);
                if (res && res.length>1 && apires && apires.length>1) {
                    for (var i=0; i<3; i++) {
                        var pluginVer = res[i+1] ? parseInt(res[i+1]) : 0,
                            apiVer = apires[i+1] ? parseInt(apires[i+1]) : 0;
                        if (pluginVer>apiVer)
                            return false;
                        if (pluginVer<apiVer)
                            return true;
                    }
                }

            }
            return true;
        },

        getPlugins: function(pluginsData, fetchFunction) {
            if (!pluginsData || pluginsData.length<1)
                return Promise.resolve([]);

            fetchFunction = fetchFunction || function (url) {
                    return fetch(url)
                        .then(function(response) {
                            if ( response.ok ) return response.json();
                            else return Promise.reject(url);
                        }).then(function(json) {
                            json.baseUrl = url.substring(0, url.lastIndexOf("config.json"));
                            return json;
                        });
                };

            var loaded = [];
            return pluginsData.map(fetchFunction).reduce(function (previousPromise, currentPromise) {
                return previousPromise
                    .then(function()
                    {
                        return currentPromise;
                    })
                    .then(function(item)
                    {
                        loaded.push(item);
                        return Promise.resolve(item);
                    })
                    .catch(function(item)
                    {
                        return Promise.resolve(item);
                    });

            }, Promise.resolve())
                .then(function ()
                {
                    return Promise.resolve(loaded);
                });
        },

        mergePlugins: function() {
            if (this.serverPlugins.plugins !== undefined && this.configPlugins.plugins !== undefined) { // undefined - plugins are loading
                var autostart = [],
                    arr = [],
                    plugins = this.configPlugins,
                    warn = false;
                if (plugins.plugins && plugins.plugins.length>0)
                    arr = plugins.plugins;
                if (plugins && plugins.config) {
                    var val = plugins.config.autostart || plugins.config.autoStartGuid;
                    if (typeof (val) == 'string')
                        val = [val];
                    warn = !!plugins.config.autoStartGuid;
                    autostart = val || [];
                }

                plugins = this.serverPlugins;
                if (plugins.plugins && plugins.plugins.length>0)
                    arr = arr.concat(plugins.plugins);
                if (plugins && plugins.config) {
                    val = plugins.config.autostart || plugins.config.autoStartGuid;
                    if (typeof (val) == 'string')
                        val = [val];
                    (warn || plugins.config.autoStartGuid) && console.warn("Obsolete: The autoStartGuid parameter is deprecated. Please check the documentation for new plugin connection configuration.");
                    autostart = autostart.concat(val || []);
                }

                this.autostart = autostart;
                this.parsePlugins(arr, false);
            }
        },

        getAppCustomPlugins: function (plugins) {
            var me = this,
                funcComplete = function() {me.customPluginsComplete = true;};
            if ( plugins.config ) {
                this.getPlugins(plugins.config.UIpluginsData)
                    .then(function(loaded)
                    {
                        me.parsePlugins(loaded, true);
                        me.getPlugins(plugins.UIplugins, function(item) {
                            return fetch(item.url)
                                .then(function(response) {
                                    if ( response.ok ) return response.text();
                                    else return Promise.reject();
                                })
                                .then(function(text) {
                                    item.code = text;
                                    return text;
                                });
                        }).then(funcComplete, funcComplete);
                    }, funcComplete);
            } else
                funcComplete();
        },

        onChangeProtectDocument: function(props) {
            if (!props) {
                var docprotect = this.getApplication().getController('DocProtection');
                props = docprotect ? docprotect.getDocProps() : null;
            }
            if (props && this.viewPlugins) {
                this.viewPlugins._state.docProtection = props;
                Common.Utils.lockControls(Common.enumLock.docLockView, props.isReadOnly, {array: this.viewPlugins.lockedControls});
                Common.Utils.lockControls(Common.enumLock.docLockForms, props.isFormsOnly, {array: this.viewPlugins.lockedControls});
                Common.Utils.lockControls(Common.enumLock.docLockComments, props.isCommentsOnly, {array: this.viewPlugins.lockedControls});
            }
        },

        onChangeDocMode: function (type) {
            if (type === 'view' && this.pluginDlg) {
                this.api.asc_pluginButtonClick(-1, this.pluginDlg.guid);
            }
        },

        // Plugin can create windows
        onPluginWindowShow: function(frameId, variation) {
            if (variation.isVisual) {
                if (this.customPluginsDlg[frameId] || this.viewPlugins.customPluginPanels[frameId]) return;

                var lang = this.appOptions && this.appOptions.lang ? this.appOptions.lang.split(/[\-_]/)[0] : 'en';
                var variationType = Asc.PluginType.getType(variation.type);
                var url = variation.url, // full url
                    isSystem = (true === variation.isSystem) || (Asc.PluginType.System === variationType),
                    isPanel = variationType === Asc.PluginType.Panel || variationType === Asc.PluginType.PanelRight;
                var visible = (this.appOptions.isEdit || variation.isViewer && (variation.isDisplayedInViewer!==false)) && _.contains(variation.EditorsSupport, this.editor) && !isSystem;
                if (visible && isPanel) {
                    this.onPluginPanelShow(frameId, variation, lang);
                } else if (visible && !variation.isInsideMode) {
                    var me = this,
                        isCustomWindow = variation.isCustomWindow,
                        arrBtns = variation.buttons,
                        newBtns = [],
                        size = variation.size,
                        isModal = variation.isModal;
                    if (!size || size.length<2) size = [800, 600];

                    var description = variation.description;
                    if (typeof variation.descriptionLocale == 'object')
                        description = variation.descriptionLocale[lang] || variation.descriptionLocale['en'] || description || '';

                    _.isArray(arrBtns) && _.each(arrBtns, function(b, index){
                        if (typeof b.textLocale == 'object')
                            b.text = b.textLocale[lang] || b.textLocale['en'] || b.text || '';
                        if (me.appOptions.isEdit && !me.isPDFEditor || b.isViewer !== false)
                            newBtns[index] = {caption: b.text, value: index, primary: b.primary, frameId: frameId};
                    });

                    var help = variation.help;
                    me.customPluginsDlg[frameId] = new Common.Views.PluginDlg({
                        cls: isCustomWindow ? 'plain' : '',
                        header: !isCustomWindow,
                        title: description,
                        width: size[0], // inner width
                        height: size[1], // inner height
                        url: url,
                        frameId : frameId,
                        buttons: isCustomWindow ? undefined : newBtns,
                        toolcallback: function(event) {
                            me.api.asc_pluginButtonClick(-1, variation.guid, frameId);
                        },
                        help: !!help,
                        modal: isModal!==undefined ? isModal : true
                    });
                    me.customPluginsDlg[frameId].on({
                        'render:after': function(obj){
                            obj.getChild('.footer .dlg-btn').on('click', function(event) {
                                me.api.asc_pluginButtonClick(parseInt(event.currentTarget.attributes['result'].value), variation.guid, frameId);
                            });
                            me.customPluginsDlg[frameId].options.pluginContainer = me.customPluginsDlg[frameId].$window.find('#id-plugin-container');
                        },
                        'close': function(obj){
                            me.customPluginsDlg[frameId] = undefined;
                        },
                        'drag': function(args){
                            me.api.asc_pluginEnableMouseEvents(args[1]=='start', frameId);
                        },
                        'resize': function(args){
                            me.api.asc_pluginEnableMouseEvents(args[1]=='start', frameId);
                        },
                        'help': function(){
                            help && window.open(help, '_blank');
                        },
                        'header:click': function(type){
                            me.api.asc_pluginButtonClick(type, variation.guid, frameId);
                        }
                    });

                    me.customPluginsDlg[frameId].show();
                }
            }
        },

        onPluginWindowClose: function(frameId) {
            if (this.customPluginsDlg[frameId]) {
                this.customPluginsDlg[frameId].close();
            } else if (this.viewPlugins.customPluginPanels[frameId]) {
                var panel = this.viewPlugins.customPluginPanels[frameId];
                if (panel && panel.iframePlugin) {
                    panel.closeInsideMode();
                    panel.$el.remove();
                    delete this.viewPlugins.customPluginPanels[frameId];
                    this.viewPlugins.fireEvent(panel.menu === 'right' ? 'pluginsright:close' : 'pluginsleft:close', [frameId]);
                }
            }
        },

        onPluginWindowResize: function(frameId, size, minSize, maxSize, callback ) {
            if (this.customPluginsDlg[frameId]) {
                var resizable = (minSize && minSize.length>1 && maxSize && maxSize.length>1 && (maxSize[0] > minSize[0] || maxSize[1] > minSize[1] || maxSize[0]==0 || maxSize[1] == 0));
                this.customPluginsDlg[frameId].setResizable(resizable, minSize, maxSize);
                this.customPluginsDlg[frameId].setInnerSize(size[0], size[1]);
                if (callback)
                    callback.call();
            }
        },

        onPluginWindowMouseUp: function(frameId, x, y) {
            if (this.customPluginsDlg[frameId]) {
                if (this.customPluginsDlg[frameId].binding.dragStop) this.customPluginsDlg[frameId].binding.dragStop();
                if (this.customPluginsDlg[frameId].binding.resizeStop) this.customPluginsDlg[frameId].binding.resizeStop();
            } else
                Common.NotificationCenter.trigger('frame:mouseup', { pageX: x*Common.Utils.zoom()+this._moveOffset.x, pageY: y*Common.Utils.zoom()+this._moveOffset.y });
        },

        onPluginWindowMouseMove: function(frameId, x, y) {
            if (this.customPluginsDlg[frameId]) {
                var offset = this.customPluginsDlg[frameId].options.pluginContainer.offset();
                if (this.customPluginsDlg[frameId].binding.drag) this.customPluginsDlg[frameId].binding.drag({ pageX: x*Common.Utils.zoom()+offset.left, pageY: y*Common.Utils.zoom()+offset.top });
                if (this.customPluginsDlg[frameId].binding.resize) this.customPluginsDlg[frameId].binding.resize({ pageX: x*Common.Utils.zoom()+offset.left, pageY: y*Common.Utils.zoom()+offset.top });
            } else
                Common.NotificationCenter.trigger('frame:mousemove', { pageX: x*Common.Utils.zoom()+this._moveOffset.x, pageY: y*Common.Utils.zoom()+this._moveOffset.y });
        },

        onPluginPanelShow: function (frameId, variation, lang) {
            var guid = variation.guid,
                menu = this.isPDFEditor ? 'left' : (variation.type == 'panelRight' ? 'right' : 'left');
            !menu && (menu = 'left');

            var description = variation.description;
            if (typeof variation.descriptionLocale == 'object')
                description = variation.descriptionLocale[lang] || variation.descriptionLocale['en'] || description || '';

            var baseUrl = variation.baseUrl || "";
            var model = this.viewPlugins.storePlugins.findWhere({guid: guid});
            var icons = variation.icons;
            var icon_url, icon_cls;

            if (model) {
                if ("" === baseUrl)
                    baseUrl = model.get('baseUrl');
                if (!icons) {
                    var modes = model.get('variations');
                    icons = modes[model.get('currentVariation')].get('icons');
                }
            }

            if (!icons) {
                icon_cls = 'icon toolbar__icon btn-plugin-panel-default';
            } else {
                var parsedIcons = this.viewPlugins.parseIcons(icons);
                icon_url = baseUrl + parsedIcons['normal'];
            }

            var $button = $('<div id="slot-btn-plugins-' + frameId + '"></div>'),
                button = new Common.UI.Button({
                    parentEl: $button,
                    cls: 'btn-category plugin-buttons',
                    hint: description,
                    enableToggle: true,
                    toggleGroup: menu === 'right' ? 'tabpanelbtnsGroup' : 'leftMenuGroup',
                    iconCls: icon_cls,
                    iconImg: icon_url,
                    onlyIcon: true,
                    value: frameId,
                    type: 'plugin'
                });
            var $panel = $('<div id="panel-plugins-' + frameId + '" class="plugin-panel" style="height: 100%;"></div>');
            this.viewPlugins.fireEvent(menu === 'right' ? 'plugins:addtoright' : 'plugins:addtoleft', [button, $button, $panel]);
            this.viewPlugins.customPluginPanels[frameId] = new Common.Views.PluginPanel({
                el: '#panel-plugins-' + frameId,
                menu: menu,
                frameId: frameId,
                baseUrl: baseUrl,
                icons: icons
            });
            this.viewPlugins.customPluginPanels[frameId].on('render:after', _.bind(this.onAfterRender, this, this.viewPlugins.customPluginPanels[frameId], frameId));

            if (!this.viewPlugins.customPluginPanels[frameId].openInsideMode(description, variation.url, frameId, guid))
                this.api.asc_pluginButtonClick(-1, guid, frameId);
        },

        onModalClose: function () {
            var plugins = this.newInstalledBackgroundPlugins;
            if (plugins && plugins.length > 0) {
                var text = plugins.length > 1 ? this.textPluginsSuccessfullyInstalled :
                    Common.Utils.String.format(this.textPluginSuccessfullyInstalled, plugins[0].name);
                this.backgroundPluginsTip = new Common.UI.SynchronizeTip({
                    extCls: 'colored',
                    placement: 'bottom',
                    target: this.viewPlugins.backgroundBtn.$el,
                    text: text,
                    showLink: true,
                    textLink: plugins.length > 1 ? this.textRunInstalledPlugins : this.textRunPlugin
                });
                this.backgroundPluginsTip.on('dontshowclick', function() {
                    this.backgroundPluginsTip.close();
                    this.backgroundPluginsTip = undefined;
                    this.newInstalledBackgroundPlugins.forEach(_.bind(function (item) {
                        this.api.asc_pluginRun(item.guid, 0, '');
                    }, this));
                    this.newInstalledBackgroundPlugins.length = 0;
                }, this);
                this.backgroundPluginsTip.on('closeclick', function () {
                    this.backgroundPluginsTip.close();
                    this.backgroundPluginsTip = undefined;
                    this.newInstalledBackgroundPlugins.length = 0;
                }, this);
                this.backgroundPluginsTip.show();
            }
        },

        onActiveTab: function (tab) {
            if (tab !== 'plugins' && this.backgroundPluginsTip) {
                this.backgroundPluginsTip.close();
                this.backgroundPluginsTip = undefined;
                this.newInstalledBackgroundPlugins.length = 0;
            }
        },

        textRunPlugin: 'Run plugin',
        textRunInstalledPlugins: 'Run installed plugins',
        textPluginSuccessfullyInstalled: '<b>{0}</b> is successfully installed. You can access all background plugins here.',
        textPluginsSuccessfullyInstalled: 'Plugins are successfully installed. You can access all background plugins here.'

    }, Common.Controllers.Plugins || {}));
});
