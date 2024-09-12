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
 *  ViewTab.js
 *
 *  Created on 06.12.2021
 *
 */

define([
    'core',
    'pdfeditor/main/app/view/ViewTab'
], function () {
    'use strict';

    PDFE.Controllers.ViewTab = Backbone.Controller.extend(_.extend({
        models : [],
        collections : [
        ],
        views : [
            'ViewTab'
        ],
        sdkViewName : '#id_main',

        initialize: function () {
        },
        onLaunch: function () {
            this._state = {};
            Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            Common.NotificationCenter.on('contenttheme:dark', this.onContentThemeChangedToDark.bind(this));
            Common.NotificationCenter.on('uitheme:changed', this.onThemeChanged.bind(this));
            Common.NotificationCenter.on('document:ready', _.bind(this.onDocumentReady, this));
            Common.NotificationCenter.on('tabstyle:changed', this.onTabStyleChange.bind(this));
        },

        setApi: function (api) {
            if (api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onZoomChange', _.bind(this.onZoomChange, this));
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect', _.bind(this.onCoAuthoringDisconnect, this));
                Common.NotificationCenter.on('api:disconnect', _.bind(this.onCoAuthoringDisconnect, this));
            }
            return this;
        },

        setConfig: function(config) {
            this.mode = config.mode;
            this.toolbar = config.toolbar;
            this.view = this.createView('ViewTab', {
                toolbar: this.toolbar.toolbar,
                mode: this.mode,
                compactToolbar: this.toolbar.toolbar.isCompactView
            });
            this.addListeners({
                'ViewTab': {
                    'zoom:topage': _.bind(this.onBtnZoomTo, this, 'topage'),
                    'zoom:towidth': _.bind(this.onBtnZoomTo, this, 'towidth'),
                    'darkmode:change': _.bind(this.onChangeDarkMode, this)
                },
                'Toolbar': {
                    'view:compact': _.bind(function (toolbar, state) {
                        this.view.chToolbar.setValue(!state, true);
                    }, this)
                },
                'Statusbar': {
                    'view:hide': _.bind(function (statusbar, state) {
                        this.view.chStatusbar.setValue(!state, true);
                    }, this)
                },
                'LeftMenu': {
                    'view:hide': _.bind(function (leftmenu, state) {
                        this.view.chLeftMenu.setValue(!state, true);
                    }, this)
                }
            });
        },

        SetDisabled: function(state) {
            this.view && this.view.SetDisabled(state);
        },

        createToolbarPanel: function() {
            return this.view.getPanel();
        },

        getView: function(name) {
            return !name && this.view ?
                this.view : Backbone.Controller.prototype.getView.call(this, name);
        },

        onCoAuthoringDisconnect: function() {
            Common.Utils.lockControls(Common.enumLock.lostConnect, true, {array: this.view.lockedControls});
        },

        onAppReady: function (config) {
            var me = this;
            if (me.view) {
                (new Promise(function (accept, reject) {
                    accept();
                })).then(function(){
                    me.view.setEvents();

                    if (!Common.UI.Themes.available()) {
                        me.view.btnInterfaceTheme.$el.closest('.group').remove();
                        me.view.$el.find('.separator-theme').remove();
                    }
                    var emptyGroup = [];
                    if (config.canBrandingExt && config.customization && config.customization.statusBar === false || !Common.UI.LayoutManager.isElementVisible('statusBar')) {
                        emptyGroup.push(me.view.chStatusbar.$el.closest('.elset'));
                        me.view.chStatusbar.$el.remove();
                    }

                    if (config.canBrandingExt && config.customization && config.customization.leftMenu === false || !Common.UI.LayoutManager.isElementVisible('leftMenu')) {
                        emptyGroup.push(me.view.chLeftMenu.$el.closest('.elset'));
                        me.view.chLeftMenu.$el.remove();
                    } else if (emptyGroup.length>0) {
                        emptyGroup.push(me.view.chLeftMenu.$el.closest('.elset'));
                        emptyGroup.shift().append(me.view.chLeftMenu.$el[0]);
                    }

                    if (!config.canPDFEdit || config.canBrandingExt && config.customization && config.customization.rightMenu === false || !Common.UI.LayoutManager.isElementVisible('rightMenu')) {
                        emptyGroup.push(me.view.chRightMenu.$el.closest('.elset'));
                        me.view.chRightMenu.$el.remove();
                    } else if (emptyGroup.length>0) {
                        emptyGroup.push(me.view.chRightMenu.$el.closest('.elset'));
                        emptyGroup.shift().append(me.view.chRightMenu.$el[0]);
                    }
                    config.canPDFEdit && me.applyEditorMode(config);

                    if (emptyGroup.length>1) { // remove empty group
                        emptyGroup[emptyGroup.length-1].closest('.group').remove();
                    }

                    me.view.cmbsZoom.forEach(function (cmb) {
                        cmb.on('selected', _.bind(me.onSelectedZoomValue, me))
                            .on('changed:before',_.bind(me.onZoomChanged, me, true))
                            .on('changed:after', _.bind(me.onZoomChanged, me, false))
                            .on('combo:blur',    _.bind(me.onComboBlur, me, false));
                    });

                    if (me.view.btnNavigation) {
                        me.getApplication().getController('LeftMenu').leftMenu.btnNavigation.on('toggle', function (btn, state) {
                            if (state !== me.view.btnNavigation.pressed)
                                me.view.turnNavigation(state);
                        });
                    } else {
                        me.view.$el.find('.separator-navigation').hide().prev('.group').hide();
                    }

                    if (Common.UI.Themes.available()) {
                        function _add_tab_styles() {
                            let btn = me.view.btnInterfaceTheme;
                            if ( typeof(btn.menu) === 'object' )
                                btn.menu.addItem({caption: '--'});
                            else
                                btn.setMenu(new Common.UI.Menu());
                            let mni = new Common.UI.MenuItem({
                                value: -1,
                                caption: me.view.textTabStyle,
                                menu: new Common.UI.Menu({
                                    menuAlign: 'tl-tr',
                                    items: [
                                        {value: 'fill', caption: me.view.textFill, checkable: true, toggleGroup: 'tabstyle'},
                                        {value: 'line', caption: me.view.textLine, checkable: true, toggleGroup: 'tabstyle'}
                                    ]
                                })
                            });
                            _.each(mni.menu.items, function(item){
                                item.setChecked(Common.Utils.InternalSettings.get("settings-tab-style")===item.value, true);
                            });
                            mni.menu.on('item:click', _.bind(function (menu, item) {
                                Common.UI.TabStyler.setStyle(item.value);
                            }, me));
                            btn.menu.addItem(mni);
                            me.view.menuTabStyle = mni.menu;
                        }
                        function _fill_themes() {
                            let btn = this.view.btnInterfaceTheme;
                            if ( typeof(btn.menu) == 'object' ) btn.menu.removeAll();
                            else btn.setMenu(new Common.UI.Menu());

                            var currentTheme = Common.UI.Themes.currentThemeId() || Common.UI.Themes.defaultThemeId();
                            for (var t in Common.UI.Themes.map()) {
                                btn.menu.addItem({
                                    value: t,
                                    caption: Common.UI.Themes.get(t).text,
                                    checked: t === currentTheme,
                                    checkable: true,
                                    toggleGroup: 'interface-theme'
                                });
                            }
                            // Common.UI.FeaturesManager.canChange('tabStyle', true) && _add_tab_styles();
                        }

                        Common.NotificationCenter.on('uitheme:countchanged', _fill_themes.bind(me));
                        _fill_themes.call(me);

                        if (me.view.btnInterfaceTheme.menu.items.length) {
                            // me.view.btnInterfaceTheme.setMenu(new Common.UI.Menu({items: menuItems}));
                            me.view.btnInterfaceTheme.menu.on('item:click', _.bind(function (menu, item) {
                                var value = item.value;
                                Common.UI.Themes.setTheme(value);
                                Common.Utils.lockControls(Common.enumLock.inLightTheme, !Common.UI.Themes.isDarkTheme(), {array: [me.view.btnDarkDocument]});
                            }, me));

                            setTimeout(function () {
                                me.onContentThemeChangedToDark(Common.UI.Themes.isContentThemeDark());
                                Common.Utils.lockControls(Common.enumLock.inLightTheme, !Common.UI.Themes.isDarkTheme(), {array: [me.view.btnDarkDocument]});
                            }, 0);
                        }
                    }
                });
            }
        },

        onDocumentReady: function() {
            Common.Utils.lockControls(Common.enumLock.disableOnStart, false, {array: this.view.lockedControls});
        },

        onZoomChange: function (percent, type) {
            this.view.btnsFitToPage.forEach(function (btn) {
                btn.toggle(type === 2, true);
            });
            this.view.btnsFitToWidth.forEach(function (btn) {
                btn.toggle(type === 1, true);
            });

            this.setZoomValue(percent);

            this._state.zoomValue = percent;
        },

        applyZoom: function (value) {
            var val = Math.max(10, Math.min(500, value));
            if (this._state.zoomValue === val)
                this.setZoomValue(this._state.zoomValue);
            this.api.zoom(val);
            Common.NotificationCenter.trigger('edit:complete', this.view);
        },

        onSelectedZoomValue: function (combo, record) {
            this.applyZoom(record.value);
        },

        onZoomChanged: function (before, combo, record, e) {
            var value = parseFloat(record.value);
            if (before) {
                var expr = new RegExp('^\\s*(\\d*(\\.|,)?\\d+)\\s*(%)?\\s*$');
                if (!expr.exec(record.value)) {
                    this.setZoomValue(this._state.zoomValue);
                    Common.NotificationCenter.trigger('edit:complete', this.view);
                }
            } else {
                if (this._state.zoomValue !== value && !isNaN(value)) {
                    this.applyZoom(value);
                } else if (record.value !== this._state.zoomValue + '%') {
                    this.setZoomValue(this._state.zoomValue);
                }
            }
        },

        setZoomValue: function(value) {
            this.view && this.view.cmbsZoom && this.view.cmbsZoom.forEach(function (cmb) {
                cmb.setValue(value, value + '%');
            });
        },

        onBtnZoomTo: function(type, btn) {
            var func;
            if ( type === 'topage' ) {
                func = 'zoomFitToPage';
            } else {
                func = 'zoomFitToWidth';
            }
            if ( btn && !btn.pressed )
                this.api.zoomCustomMode();
            else
                this.api[func]();
            Common.NotificationCenter.trigger('edit:complete', this.view);
        },

        onChangeDarkMode: function (isdarkmode) {
            if (!this._darkModeTimer) {
                var me = this;
                me._darkModeTimer = setTimeout(function() {
                    me._darkModeTimer = undefined;
                }, 500);
                Common.UI.Themes.setContentTheme(isdarkmode?'dark':'light');
            } else
                this.onContentThemeChangedToDark(Common.UI.Themes.isContentThemeDark());
        },

        onContentThemeChangedToDark: function (isdark) {
            this.view && this.view.btnDarkDocument.toggle(isdark, true);
        },

        onThemeChanged: function () {
            if (this.view && Common.UI.Themes.available()) {
                var current_theme = Common.UI.Themes.currentThemeId() || Common.UI.Themes.defaultThemeId(),
                    menu_item = _.findWhere(this.view.btnInterfaceTheme.menu.items, {value: current_theme});
                if ( menu_item ) {
                    this.view.btnInterfaceTheme.menu.clearAll();
                    menu_item.setChecked(true, true);
                }
                Common.Utils.lockControls(Common.enumLock.inLightTheme, !Common.UI.Themes.isDarkTheme(), {array: [this.view.btnDarkDocument]});
            }
        },

        onTabStyleChange: function () {
            if (this.view && this.view.menuTabStyle) {
                _.each(this.view.menuTabStyle.items, function(item){
                    item.setChecked(Common.Utils.InternalSettings.get("settings-tab-style")===item.value, true);
                });
            }
        },

        onComboBlur: function() {
            Common.NotificationCenter.trigger('edit:complete', this.view);
        },

        applyEditorMode: function(config) {
            this.view && this.view.chRightMenu && this.view.chRightMenu.setVisible((config || this.mode)['isPDFEdit']);
        }

    }, PDFE.Controllers.ViewTab || {}));
});