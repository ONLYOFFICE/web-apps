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
 *  Created on 11/07/24
 *
 */

define([
    'core',
    'visioeditor/main/app/view/ViewTab'
], function () {
    'use strict';

    VE.Controllers.ViewTab = Backbone.Controller.extend(_.extend({
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
            var mode = config.mode;
            this.toolbar = config.toolbar;
            this.view = this.createView('ViewTab', {
                toolbar: this.toolbar.toolbar,
                mode: mode,
                compactToolbar: this.toolbar.toolbar.isCompactView
            });
            this.addListeners({
                'ViewTab': {
                    'zoom:selected': _.bind(this.onSelectedZoomValue, this),
                    'zoom:changedbefore': _.bind(this.onZoomChanged, this),
                    'zoom:changedafter': _.bind(this.onZoomChanged, this),
                    'zoom:toslide': _.bind(this.onBtnZoomTo, this, 'toslide'),
                    'zoom:towidth': _.bind(this.onBtnZoomTo, this, 'towidth')
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

        onBtnZoomTo: function (type, btn) {
            this._state.zoom_type = undefined;
            this._state.zoom_percent = undefined;
            if (!btn.pressed)
                this.api.zoomCustomMode();
            else
                this.api[type === 'toslide' ? 'zoomFitToPage' : 'zoomFitToWidth']();
            Common.NotificationCenter.trigger('edit:complete', this.view);
        },

        onThemeChanged: function () {
            if (this.view && Common.UI.Themes.available() && this.view.btnInterfaceTheme.menu && (typeof (this.view.btnInterfaceTheme.menu) === 'object')) {
                var current_theme = Common.UI.Themes.currentThemeId() || Common.UI.Themes.defaultThemeId(),
                    menu_item = _.findWhere(this.view.btnInterfaceTheme.menu.getItems(true), {value: current_theme});
                if ( !!menu_item ) {
                    this.view.btnInterfaceTheme.menu.clearAll(true);
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

        onTabStyleChange: function () {
            if (this.view && this.view.menuTabStyle) {
                _.each(this.view.menuTabStyle.items, function(item){
                    item.setChecked(Common.Utils.InternalSettings.get("settings-tab-style")===item.value, true);
                });
            }
        }

    }, VE.Controllers.ViewTab || {}));
});