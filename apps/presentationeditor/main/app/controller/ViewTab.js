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
 *  Created on 07.12.2021
 *
 */

define([
    'core',
    'presentationeditor/main/app/view/ViewTab',
    'presentationeditor/main/app/view/GridSettings'
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
                zoom_percent: undefined,
                unitsChanged: true,
                lock_viewProps: false,
                slideMasterMode: false
            };
            Common.NotificationCenter.on('uitheme:changed', this.onThemeChanged.bind(this));
            Common.NotificationCenter.on('document:ready', _.bind(this.onDocumentReady, this));
            Common.NotificationCenter.on('settings:unitschanged', _.bind(this.unitsChanged, this));
            Common.NotificationCenter.on('tabstyle:changed', this.onTabStyleChange.bind(this));
        },

        setApi: function (api) {
            if (api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onZoomChange', _.bind(this.onZoomChange, this));
                this.api.asc_registerCallback('asc_onNotesShow', _.bind(this.onNotesShow, this));
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect', _.bind(this.onCoAuthoringDisconnect, this));
                Common.NotificationCenter.on('api:disconnect', _.bind(this.onCoAuthoringDisconnect, this));
                this.api.asc_registerCallback('asc_onLockViewProps', _.bind(this.onLockViewProps, this, true));
                this.api.asc_registerCallback('asc_onUnLockViewProps', _.bind(this.onLockViewProps, this, false));
                this.api.asc_registerCallback('asc_onChangeViewMode', _.bind(this.onApiChangeViewMode, this));
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
                    'mode:normal': _.bind(this.onChangeViewMode, this, 'normal'),
                    'mode:master': _.bind(this.onChangeViewMode, this, 'master'),
                    'zoom:selected': _.bind(this.onSelectedZoomValue, this),
                    'zoom:changedbefore': _.bind(this.onZoomChanged, this),
                    'zoom:changedafter': _.bind(this.onZoomChanged, this),
                    'zoom:toslide': _.bind(this.onBtnZoomTo, this, 'toslide'),
                    'zoom:towidth': _.bind(this.onBtnZoomTo, this, 'towidth'),
                    'rulers:change': _.bind(this.onChangeRulers, this),
                    'notes:change': _.bind(this.onChangeNotes, this),
                    'guides:show': _.bind(this.onGuidesShow, this),
                    'guides:aftershow': _.bind(this.onGuidesAfterShow, this),
                    'guides:add': _.bind(this.onGuidesAdd, this),
                    'guides:clear': _.bind(this.onGuidesClear, this),
                    'guides:smart': _.bind(this.onGuidesSmartShow, this),
                    'gridlines:show': _.bind(this.onGridlinesShow, this),
                    'gridlines:snap': _.bind(this.onGridlinesSnap, this),
                    'gridlines:spacing': _.bind(this.onGridlinesSpacing, this),
                    'gridlines:custom': _.bind(this.onGridlinesCustom, this),
                    'gridlines:aftershow': _.bind(this.onGridlinesAfterShow, this)
                },
                'Toolbar': {
                    'view:compact': _.bind(function (toolbar, state) {
                        this.view.chToolbar.setValue(!state, true);
                    }, this),
                    'close:slide-master': _.bind(function () {
                        this.onChangeViewMode('normal');
                    }, this)
                },
                'Statusbar': {
                    'view:hide': _.bind(function (statusbar, state) {
                        this.view.chStatusbar.setValue(!state, true);
                    }, this)
                },
                'DocumentHolder': {
                    'guides:show': _.bind(this.onGuidesShow, this),
                    'guides:add': _.bind(this.onGuidesAdd, this),
                    'guides:delete': _.bind(this.onGuidesDelete, this),
                    'guides:clear': _.bind(this.onGuidesClear, this),
                    'guides:smart': _.bind(this.onGuidesSmartShow, this),
                    'gridlines:show': _.bind(this.onGridlinesShow, this),
                    'gridlines:snap': _.bind(this.onGridlinesSnap, this),
                    'gridlines:spacing': _.bind(this.onGridlinesSpacing, this),
                    'gridlines:custom': _.bind(this.onGridlinesCustom, this),
                    'rulers:change': _.bind(this.onChangeRulers, this)
                },
                'LeftMenu': {
                    'view:hide': _.bind(function (leftmenu, state) {
                        this.view.chLeftMenu.setValue(!state, true);
                    }, this)
                },
                'RightMenu': {
                    'view:hide': _.bind(function (leftmenu, state) {
                        this.view.chRightMenu.setValue(!state, true);
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

        onBtnZoomTo: function (type, btn) {
            this._state.zoom_type = undefined;
            this._state.zoom_percent = undefined;
            if (!btn.pressed)
                this.api.zoomCustomMode();
            else
                this.api[type === 'toslide' ? 'zoomFitToPage' : 'zoomFitToWidth']();
            Common.NotificationCenter.trigger('edit:complete', this.view);
        },

        onChangeRulers: function (checked) {
            this.api.asc_SetViewRulers(checked);
            this.view.chRulers.setValue(checked, true);
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
        },

        onGuidesShow: function(state) {
            this.api.asc_setShowGuides(state);
            this.view.btnGuides.toggle(state, true);
            Common.localStorage.setBool('pe-settings-showguides', state);
            Common.NotificationCenter.trigger('edit:complete', this.view);
        },

        onGuidesAfterShow: function() {
            if (this.view) {
                this.view.btnGuides.menu.items[2].setDisabled(this._state.lock_viewProps); // add v guides
                this.view.btnGuides.menu.items[3].setDisabled(this._state.lock_viewProps); // add h guides
                this.view.btnGuides.menu.items[6].setDisabled(this._state.lock_viewProps || !this.api.asc_canClearGuides()); // clear guides

                this.view.btnGuides.menu.items[0].setChecked(this.api.asc_getShowGuides(), true);
                this.view.btnGuides.menu.items[5].setChecked(this.api.asc_getShowSmartGuides(), true);
            }
        },

        onGuidesAdd: function(type) {
            if (type==='add-vert')
                this.api.asc_addVerticalGuide();
            else
                this.api.asc_addHorizontalGuide();

            !this.api.asc_getShowGuides() && this.onGuidesShow(true);

            Common.NotificationCenter.trigger('edit:complete', this.view);
        },

        onGuidesDelete: function(id) {
            this.api.asc_deleteGuide(id);
            this.api.asc_getShowGuides() && (this.api.asc_getGuidesCount()<1) && this.onGuidesShow(false);

            Common.NotificationCenter.trigger('edit:complete', this.view);
        },

        onGuidesClear: function() {
            this.api.asc_clearGuides();
            this.api.asc_getShowGuides() && this.onGuidesShow(false);

            Common.NotificationCenter.trigger('edit:complete', this.view);
        },

        onGuidesSmartShow: function(state) {
            this.api.asc_setShowSmartGuides(state);
            Common.localStorage.setBool('pe-settings-showsnaplines', state);
            Common.Utils.InternalSettings.set("pe-settings-showsnaplines", state);
            Common.NotificationCenter.trigger('edit:complete', this.view);
        },

        onGridlinesShow: function(state) {
            this.api.asc_setShowGridlines(state);
            this.view.btnGridlines.toggle(state, true);
            Common.localStorage.setBool('pe-settings-showgrid', state);
            Common.NotificationCenter.trigger('edit:complete', this.view);
        },

        onGridlinesSnap: function(state) {
            this.api.asc_setSnapToGrid(state);
            Common.NotificationCenter.trigger('edit:complete', this.view);
        },

        onGridlinesSpacing: function(value) {
            this.api.asc_setGridSpacing(Common.Utils.Metric.fnRecalcToMM(value) * 36000);
            Common.NotificationCenter.trigger('edit:complete', this.view);
        },

        onGridlinesCustom: function(state) {
            var win, props,
                me = this;
            win = new PE.Views.GridSettings({
                handler: function(dlg, result) {
                    if (result == 'ok') {
                        props = dlg.getSettings();
                        me.api.asc_setGridSpacing(Common.Utils.Metric.fnRecalcToMM(props) * 36000);
                        Common.NotificationCenter.trigger('edit:complete', me.view);
                    }
                }
            });
            win.show();
            win.setSettings(me.api.asc_getGridSpacing());
        },

        onGridlinesAfterShow: function() {
            if (this.view) {
                var menu = this.view.btnGridlines.menu;
                if (this._state.unitsChanged) {
                    for (var i = 3; i < menu.items.length-2; i++) {
                        menu.removeItem(menu.items[i]);
                        i--;
                    }
                    var arr = Common.define.gridlineData.getGridlineData(Common.Utils.Metric.getCurrentMetric());
                    for (var i = 0; i < arr.length; i++) {
                        var menuItem = new Common.UI.MenuItem({
                            caption: arr[i].caption,
                            value: arr[i].value,
                            checkable: true,
                            toggleGroup: 'tb-gridlines'
                        });
                        menu.insertItem(3+i, menuItem);
                    }
                    this._state.unitsChanged = false;
                }

                menu.items[0].setChecked(this.api.asc_getShowGridlines(), true);
                menu.items[1].setChecked(this.api.asc_getSnapToGrid(), true);

                var value = Common.Utils.Metric.fnRecalcFromMM(this.api.asc_getGridSpacing()/36000),
                    items = menu.items;
                for (var i=3; i<items.length-2; i++) {
                    var item = items[i];
                    if (item.value<1 && Math.abs(item.value - value)<0.005)
                        item.setChecked(true);
                    else if (item.value>=1 && Math.abs(item.value - value)<0.001)
                        item.setChecked(true);
                    else
                        item.setChecked(false);
                    item.setDisabled(this._state.lock_viewProps);
                }
                menu.items[1].setDisabled(this._state.lock_viewProps); // snap to grid
                menu.items[items.length-1].setDisabled(this._state.lock_viewProps); // custom
            }
        },

        onLockViewProps: function(lock) {
            this._state.lock_viewProps = lock;
            Common.Utils.InternalSettings.set("pe-lock-view-props", lock);
            if (this.view) {
                if (this.view.btnGridlines && (typeof this.view.btnGridlines.menu === 'object') && this.view.btnGridlines.menu.isVisible())
                    this.onGridlinesAfterShow();
                if (this.view.btnGuides && (typeof this.view.btnGuides.menu === 'object') && this.view.btnGuides.menu.isVisible())
                    this.onGuidesAfterShow();
            }
        },

        unitsChanged: function(m) {
            this._state.unitsChanged = true;
        },

        changeViewMode: function (mode) {
            var isMaster = mode === 'master';
            this.view.btnSlideMaster.toggle(isMaster, true);
            this.view.btnNormal.toggle(!isMaster, true);
            if (this._state.slideMasterMode !== isMaster) {
                this._state.slideMasterMode = isMaster;
                this.view.fireEvent('viewmode:change', [isMaster ? 'master' : 'normal']);
                this.api.asc_changePresentationViewMode(isMaster ? Asc.c_oAscPresentationViewMode.masterSlide : Asc.c_oAscPresentationViewMode.normal);
            } // Asc.c_oAscPresentationViewMode.sorter;
        },

        onApiChangeViewMode: function (mode) {
            var isMaster = mode === Asc.c_oAscPresentationViewMode.masterSlide;
            this.changeViewMode(isMaster ? 'master' : 'normal');
        },

        onChangeViewMode: function (mode) {
            Common.UI.TooltipManager.closeTip('slideMaster');
            this.changeViewMode(mode);
        },

        onTabStyleChange: function () {
            if (this.view && this.view.menuTabStyle) {
                _.each(this.view.menuTabStyle.items, function(item){
                    item.setChecked(Common.Utils.InternalSettings.get("settings-tab-style")===item.value, true);
                });
            }
        }

    }, PE.Controllers.ViewTab || {}));
});