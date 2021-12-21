/*
 *
 * (c) Copyright Ascensio System SIA 2010-2020
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
 *  ViewTab.js
 *
 *  Created by Julia Svinareva on 06.12.2021
 *  Copyright (c) 2021 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'documenteditor/main/app/view/ViewTab'
], function () {
    'use strict';

    DE.Controllers.ViewTab = Backbone.Controller.extend(_.extend({
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
        },

        setApi: function (api) {
            if (api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onZoomChange', _.bind(this.onZoomChange, this));
            }
            return this;
        },

        setConfig: function(config) {
            this.toolbar = config.toolbar;
            this.view = this.createView('ViewTab', {
                toolbar: this.toolbar.toolbar,
                mode: config.mode,
                compactToolbar: this.toolbar.toolbar.isCompactView
            });
            this.addListeners({
                'ViewTab': {
                    'zoom:topage': _.bind(this.onBtnZoomTo, this, 'topage'),
                    'zoom:towidth': _.bind(this.onBtnZoomTo, this, 'towidth'),
                    'rulers:change': _.bind(this.onChangeRulers, this),
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
                'Common.Views.Header': {
                    'rulers:hide': _.bind(function (isChecked) {
                        this.view.chRulers.setValue(!isChecked, true);
                    }, this)
                }
            });
        },

        SetDisabled: function(state) {
            this.view && this.view.SetDisabled(state);
        },

        getView: function(name) {
            return !name && this.view ?
                this.view : Backbone.Controller.prototype.getView.call(this, name);
        },

        onCoAuthoringDisconnect: function() {
            this.SetDisabled(true);
        },

        onAppReady: function (config) {
            var me = this;
            if (me.view) {
                (new Promise(function (accept, reject) {
                    accept();
                })).then(function(){
                    me.view.setEvents();

                    me.view.cmbZoom.on('selected', _.bind(me.onSelectedZoomValue, me))
                        .on('changed:before',_.bind(me.onZoomChanged, me, true))
                        .on('changed:after', _.bind(me.onZoomChanged, me, false))
                        .on('combo:blur',    _.bind(me.onComboBlur, me, false));

                    me.getApplication().getController('LeftMenu').leftMenu.btnNavigation.on('toggle', function (btn, state) {
                        if (state !== me.view.btnNavigation.pressed)
                            me.view.turnNavigation(state);
                    });

                    var menuItems = [],
                        currentTheme = Common.UI.Themes.currentThemeId() || Common.UI.Themes.defaultThemeId();
                    for (var t in Common.UI.Themes.map()) {
                        menuItems.push({
                            value: t,
                            caption: Common.UI.Themes.get(t).text,
                            checked: t === currentTheme,
                            checkable: true,
                            toggleGroup: 'interface-theme'
                        });
                    }

                    if (menuItems.length) {
                        me.view.btnInterfaceTheme.setMenu(new Common.UI.Menu({items: menuItems}));
                        me.view.btnInterfaceTheme.menu.on('item:click', _.bind(function (menu, item) {
                            var value = item.value;
                            Common.UI.Themes.setTheme(value);
                            me.view.btnDarkDocument.setDisabled(!Common.UI.Themes.isDarkTheme());
                        }, me));

                        setTimeout(function () {
                            me.onContentThemeChangedToDark(Common.UI.Themes.isContentThemeDark());
                            me.view.btnDarkDocument.setDisabled(!Common.UI.Themes.isDarkTheme());
                        }, 0);
                    }
                });
            }
        },

        onZoomChange: function (percent, type) {
            this.view.btnFitToPage.toggle(type == 2, true);
            this.view.btnFitToWidth.toggle(type == 1, true);

            this.view.cmbZoom.setValue(percent, percent + '%');

            this._state.zoomValue = percent;
        },

        applyZoom: function (value) {
            var val = Math.max(25, Math.min(500, value));
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
                    this.view.cmbZoom.setValue(this._state.zoomValue, this._state.zoomValue + '%');
                    Common.NotificationCenter.trigger('edit:complete', this.view);
                }
            } else {
                if (this._state.zoomValue !== value && !isNaN(value)) {
                    this.applyZoom(value);
                } else if (record.value !== this._state.zoomValue + '%') {
                    this.view.cmbZoom.setValue(this._state.zoomValue, this._state.zoomValue + '%');
                }
            }
        },

        onBtnZoomTo: function(type) {
            var btn, func;
            if ( type === 'topage' ) {
                btn = 'btnFitToPage';
                func = 'zoomFitToPage';
            } else {
                btn = 'btnFitToWidth';
                func = 'zoomFitToWidth';
            }
            if ( !this.view[btn].pressed )
                this.api.zoomCustomMode();
            else
                this.api[func]();
            Common.NotificationCenter.trigger('edit:complete', this.view);
        },

        onChangeRulers: function (btn, checked) {
            this.api.asc_SetViewRulers(checked);
            Common.localStorage.setBool('de-hidden-rulers', !checked);
            Common.Utils.InternalSettings.set("de-hidden-rulers", !checked);
            this.view.fireEvent('rulers:hide', [!checked]);
            Common.NotificationCenter.trigger('layout:changed', 'rulers');
            Common.NotificationCenter.trigger('edit:complete', this.view);
        },

        onChangeDarkMode: function () {
            Common.UI.Themes.toggleContentTheme();
        },

        onContentThemeChangedToDark: function (isdark) {
            this.view && this.view.btnDarkDocument.toggle(isdark, true);
        },

        onThemeChanged: function () {
            if (this.view) {
                var current_theme = Common.UI.Themes.currentThemeId() || Common.UI.Themes.defaultThemeId(),
                    menu_item = _.findWhere(this.view.btnInterfaceTheme.menu.items, {value: current_theme});
                this.view.btnInterfaceTheme.menu.clearAll();
                menu_item.setChecked(true, true);
                this.view.btnDarkDocument.setDisabled(!Common.UI.Themes.isDarkTheme());
            }
        },

        onComboBlur: function() {
            Common.NotificationCenter.trigger('edit:complete', this.view);
        }

    }, DE.Controllers.ViewTab || {}));
});