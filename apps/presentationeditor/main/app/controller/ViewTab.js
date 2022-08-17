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
 *  Created by Julia Svinareva on 07.12.2021
 *  Copyright (c) 2021 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'presentationeditor/main/app/view/ViewTab'
], function () {
    'use strict';

    PE.Controllers.ViewTab = Backbone.Controller.extend(_.extend({
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
            this._state = {
                zoom_type: undefined,
                zoom_percent: undefined
            };
            Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            Common.NotificationCenter.on('uitheme:changed', this.onThemeChanged.bind(this));
            Common.NotificationCenter.on('document:ready', _.bind(this.onDocumentReady, this));
        },

        setApi: function (api) {
            if (api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onZoomChange', _.bind(this.onZoomChange, this));
                this.api.asc_registerCallback('asc_onNotesShow', _.bind(this.onNotesShow, this));
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect', _.bind(this.onCoAuthoringDisconnect, this));
                Common.NotificationCenter.on('api:disconnect', _.bind(this.onCoAuthoringDisconnect, this));
            }
            return this;
        },

        setConfig: function(config) {
            var mode = config.mode;
            this.toolbar = config.toolbar;
            this.view = this.createView('ViewTab', {
                toolbar: this.toolbar.toolbar,
                mode: mode,
                compactToolbar: this.toolbar.toolbar.isCompactView
            });
            this.addListeners({
                'ViewTab': {
                    'zoom:toslide': _.bind(this.onBtnZoomTo, this, 'toslide'),
                    'zoom:towidth': _.bind(this.onBtnZoomTo, this, 'towidth'),
                    'rulers:change': _.bind(this.onChangeRulers, this),
                    'notes:change': _.bind(this.onChangeNotes, this)
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
            this.SetDisabled(true);
        },

        onDocumentReady: function() {
            Common.Utils.lockControls(Common.enumLock.disableOnStart, false, {array: this.view.lockedControls});
        },

        onZoomChange: function (percent, type) {
            if (this._state.zoom_type !== type) {
                this.view.btnFitToSlide.toggle(type == 2, true);
                this.view.btnFitToWidth.toggle(type == 1, true);
                this._state.zoom_type = type;
            }
            if (this._state.zoom_percent !== percent) {
                this.view.cmbZoom.setValue(percent, percent + '%');
                this._state.zoom_percent = percent;
            }
        },

        onNotesShow: function(bIsShow) {
            this.view.chNotes.setValue(bIsShow, true);
            Common.localStorage.setBool('pe-hidden-notes', !bIsShow);
        },

        onAppReady: function (config) {
            var me = this;
            if (me.view) {
                (new Promise(function (accept, reject) {
                    accept();
                })).then(function () {
                    me.view.setEvents();

                    if (!Common.UI.Themes.available()) {
                        me.view.btnInterfaceTheme.$el.closest('.group').remove();
                        me.view.$el.find('.separator-theme').remove();
                    }
                    if (config.canBrandingExt && config.customization && config.customization.statusBar === false || !Common.UI.LayoutManager.isElementVisible('statusBar')) {
                        me.view.chStatusbar.$el.remove();

                        if (!config.isEdit) {
                            var slotChkNotes = me.view.chNotes.$el,
                                groupRulers = slotChkNotes.closest('.group'),
                                groupToolbar = me.view.chToolbar.$el.closest('.group');
                            groupToolbar.find('.elset')[1].append(slotChkNotes[0]);
                            groupRulers.remove();
                            me.view.$el.find('.separator-rulers').remove();
                        }
                    } else if (!config.isEdit) {
                        me.view.chRulers.hide();
                    }

                    me.view.cmbZoom.on('selected', _.bind(me.onSelectedZoomValue, me))
                        .on('changed:before',_.bind(me.onZoomChanged, me, true))
                        .on('changed:after', _.bind(me.onZoomChanged, me, false))
                        .on('combo:blur',    _.bind(me.onComboBlur, me, false));
                });

                if (Common.UI.Themes.available()) {
                    function _fill_themes() {
                        var btn = this.view.btnInterfaceTheme;
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
                    }

                    Common.NotificationCenter.on('uitheme:countchanged', _fill_themes.bind(me));
                    _fill_themes.call(me);

                    if (me.view.btnInterfaceTheme.menu.items.length) {
                        this.view.btnInterfaceTheme.menu.on('item:click', _.bind(function (menu, item) {
                            var value = item.value;
                            Common.UI.Themes.setTheme(value);
                        }, this));
                    }
                }
            }
        },

        onBtnZoomTo: function (type, btn) {
            this._state.zoom_type = undefined;
            this._state.zoom_percent = undefined;
            if (!btn.pressed)
                this.api.zoomCustomMode();
            else
                this.api[type === 'toslide' ? 'zoomFitToPage' : 'zoomFitToWidth']();
            Common.NotificationCenter.trigger('edit:complete', this.view);
        },

        onChangeRulers: function (btn, checked) {
            this.api.asc_SetViewRulers(checked);
            Common.localStorage.setBool('pe-hidden-rulers', !checked);
            Common.Utils.InternalSettings.set("pe-hidden-rulers", !checked);
            Common.NotificationCenter.trigger('layout:changed', 'rulers');
            Common.NotificationCenter.trigger('edit:complete', this.view);
        },

        onChangeNotes: function (btn, checked) {
            this.api.asc_ShowNotes(checked);
            Common.localStorage.setBool('pe-hidden-notes', !checked);
            Common.NotificationCenter.trigger('edit:complete', this.view);
        },

        onThemeChanged: function () {
            if (this.view && Common.UI.Themes.available()) {
                var current_theme = Common.UI.Themes.currentThemeId() || Common.UI.Themes.defaultThemeId(),
                    menu_item = _.findWhere(this.view.btnInterfaceTheme.menu.items, {value: current_theme});
                if ( !!menu_item ) {
                    this.view.btnInterfaceTheme.menu.clearAll();
                    menu_item.setChecked(true, true);
                }
            }
        },

        applyZoom: function (value) {
            this._state.zoom_percent = undefined;
            this._state.zoom_type = undefined;
            var val = Math.max(10, Math.min(500, value));
            if (this._state.zoomValue === val)
                this.view.cmbZoom.setValue(this._state.zoomValue, this._state.zoomValue + '%');
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
                    this.view.cmbZoom.setValue(this._state.zoom_percent, this._state.zoom_percent + '%');
                    Common.NotificationCenter.trigger('edit:complete', this.view);
                }
            } else {
                if (this._state.zoom_percent !== value && !isNaN(value)) {
                    this.applyZoom(value);
                } else if (record.value !== this._state.zoom_percent + '%') {
                    this.view.cmbZoom.setValue(this._state.zoom_percent, this._state.zoom_percent + '%');
                }
            }
        },

        onComboBlur: function() {
            Common.NotificationCenter.trigger('edit:complete', this.view);
        }

    }, PE.Controllers.ViewTab || {}));
});