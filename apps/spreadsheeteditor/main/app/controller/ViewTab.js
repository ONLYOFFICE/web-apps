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
 *  Created on 08.07.2020
 *
 */

define([
    'core',
    'spreadsheeteditor/main/app/view/ViewTab'
], function () {
    'use strict';

    SSE.Controllers.ViewTab = Backbone.Controller.extend(_.extend({
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
            Common.NotificationCenter.on('uitheme:changed', this.onThemeChanged.bind(this));
            Common.NotificationCenter.on('tabstyle:changed', this.onTabStyleChange.bind(this));
        },

        setApi: function (api) {
            if (api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onZoomChanged',              this.onApiZoomChange.bind(this));
                this.api.asc_registerCallback('asc_onSelectionChanged',     _.bind(this.onSelectionChanged, this));
                this.api.asc_registerCallback('asc_onWorksheetLocked',      _.bind(this.onWorksheetLocked, this));
                this.api.asc_registerCallback('asc_onSheetsChanged',            this.onApiSheetChanged.bind(this));
                this.api.asc_registerCallback('asc_onUpdateSheetViewSettings',  this.onApiSheetChanged.bind(this));
                this.api.asc_registerCallback('asc_updateSheetViewType',    this.onApiUpdateSheetViewType.bind(this));
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',_.bind(this.onCoAuthoringDisconnect, this));
                Common.NotificationCenter.on('api:disconnect', _.bind(this.onCoAuthoringDisconnect, this));
            }
            return this;
        },

        setConfig: function(config) {
            this.toolbar = config.toolbar;
            var mode = config.mode;
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
                    'viewtab:freeze': this.onFreeze,
                    'viewtab:freezeshadow': this.onFreezeShadow,
                    'viewtab:formula': this.onViewSettings,
                    'viewtab:headings': this.onViewSettings,
                    'viewtab:gridlines': this.onViewSettings,
                    'viewtab:zeros': this.onViewSettings,
                    'viewtab:zoom': this.onZoom,
                    'viewtab:showview': this.onShowView,
                    'viewtab:openview': this.onOpenView,
                    'viewtab:createview': this.onCreateView,
                    'viewtab:manager': this.onOpenManager,
                    'viewtab:viewmode': this.onPreviewMode
                },
                'Statusbar': {
                    'sheet:changed': this.onApiSheetChanged.bind(this),
                    'view:compact': _.bind(function (statusbar, state) {
                        this.view.chStatusbar.setValue(state, true);
                    }, this)
                },
                'Toolbar': {
                    'view:compact': _.bind(function (toolbar, state) {
                        this.view.chToolbar.setValue(!state, true);
                    }, this)
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
            Common.NotificationCenter.on('layout:changed', _.bind(this.onLayoutChanged, this));
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

        onSelectionChanged: function(info) {
            if (!this.toolbar.editMode || !this.view) return;

            Common.Utils.lockControls(Common.enumLock.sheetView, this.api.asc_getActiveNamedSheetView && !this.api.asc_getActiveNamedSheetView(this.api.asc_getActiveWorksheetIndex()),
                                      {array: [this.view.btnCloseView]});
        },

        onFreeze: function(type) {
            if (this.api) {
                this.api.asc_freezePane(type);
            }
            Common.NotificationCenter.trigger('edit:complete', this.view);
        },

        onFreezeShadow: function (checked) {
            this.api.asc_setFrozenPaneBorderType(checked ? Asc.c_oAscFrozenPaneBorderType.shadow : Asc.c_oAscFrozenPaneBorderType.line);
            Common.localStorage.setBool('sse-freeze-shadow', checked);
            Common.NotificationCenter.trigger('edit:complete', this.view);
        },

        applyZoom: function (value) {
            var val = Math.max(10, Math.min(500, value));
            if (this._state.zoomValue === val)
                this.view.cmbZoom.setValue(this._state.zoomValue, this._state.zoomValue + '%');
            this.api.asc_setZoom(val/100);
            Common.NotificationCenter.trigger('edit:complete', this.view);
        },

        onSelectedZoomValue: function (combo, record) {
            this.applyZoom(record.value);
        },

        onZoomChanged: function (before, combo, record, e) {
            var value = parseFloat(record.value);
            if (this._state.zoomValue === undefined) {
                this._state.zoomValue = 100;
            }
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

        onViewSettings: function(type, value){
            if (this.api) {
                switch (type) {
                    case 1: this.api.asc_setDisplayHeadings(value); break;
                    case 2: this.api.asc_setDisplayGridlines(value); break;
                    case 3: this.api.asc_setShowZeros(value); break;
                }
            }
            Common.NotificationCenter.trigger('edit:complete', this.view);
        },

        onShowView: function() {
            var views = this.api.asc_getNamedSheetViews(),
                menu = this.view.btnSheetView.menu._innerMenu,
                active = false;

            menu.removeItems(1, menu.items.length-1);
            _.each(views, function(item, index) {
                menu.addItem(new Common.UI.MenuItem({
                    caption : item.asc_getName(),
                    checkable: true,
                    allowDepress: false,
                    checked : item.asc_getIsActive(),
                    template    : _.template([
                        '<a id="<%= id %>" style="<%= style %>" tabindex="-1" type="menuitem">',
                        '<%= Common.Utils.String.htmlEncode(caption) %>',
                        '</a>'
                    ].join(''))
                }));
                if (item.asc_getIsActive())
                    active = true;
            });
            menu.items[0].setChecked(!active, true);
        },

        onOpenView: function(item) {
            this.api && this.api.asc_setActiveNamedSheetView((item.value == 'default') ? null : item.name);
        },

        onCreateView: function(item) {
            this.api && this.api.asc_addNamedSheetView(null, true);
        },

        onOpenManager: function(item) {
            var me = this;
            (new SSE.Views.ViewManagerDlg({
                api: this.api,
                handler: function(result, value) {
                    if (result == 'ok' && value) {
                        if (me.api) {
                            me.api.asc_setActiveNamedSheetView(value);
                        }
                    }
                    Common.NotificationCenter.trigger('edit:complete', me.view);
                },
                views: this.api.asc_getNamedSheetViews()
            })).on('close', function(win){
            }).show();
        },

        onWorksheetLocked: function(index,locked) {
            if (index == this.api.asc_getActiveWorksheetIndex()) {
                Common.Utils.lockControls(Common.enumLock.sheetLock, locked, {array: [this.view.chHeadings, this.view.chGridlines, this.view.btnFreezePanes, this.view.chZeros,
                                                                                            this.view.btnViewNormal, this.view.btnViewPageBreak]});
            }
        },

        onApiSheetChanged: function() {
            if (!this.toolbar.mode || !this.toolbar.mode.isEdit || this.toolbar.mode.isEditDiagram || this.toolbar.mode.isEditMailMerge || this.toolbar.mode.isEditOle) return;

            var params  = this.api.asc_getSheetViewSettings();
            this.view.chHeadings.setValue(!!params.asc_getShowRowColHeaders(), true);
            this.view.chGridlines.setValue(!!params.asc_getShowGridLines(), true);
            this.view.btnFreezePanes.menu.items && this.view.btnFreezePanes.menu.items[0].setCaption(!!params.asc_getIsFreezePane() ? this.view.textUnFreeze : this.view.capBtnFreeze);
            this.view.chZeros.setValue(!!params.asc_getShowZeros(), true);

            var currentSheet = this.api.asc_getActiveWorksheetIndex();
            this.onWorksheetLocked(currentSheet, this.api.asc_isWorksheetLockedOrDeleted(currentSheet));
            this.onApiUpdateSheetViewType(currentSheet);
        },

        onLayoutChanged: function(area) {
            if (area=='celleditor' && arguments[1]) {
                this.view.chFormula.setValue(arguments[1]=='showed', true);
            }
        },

        onApiZoomChange: function(zf, type){
            var value = Math.floor((zf + .005) * 100);
            this.view.cmbZoom.setValue(value, value + '%');
            this._state.zoomValue = value;
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

        onTabStyleChange: function () {
            if (this.view && this.view.menuTabStyle) {
                _.each(this.view.menuTabStyle.items, function(item){
                    item.setChecked(Common.Utils.InternalSettings.get("settings-tab-style")===item.value, true);
                });
            }
        },

        onPreviewMode: function(value) {
            this.api && this.api.asc_SetSheetViewType(value);
        },

        onApiUpdateSheetViewType: function(index) {
            if (this.view && this.api && index === this.api.asc_getActiveWorksheetIndex()) {
                var value = this.api.asc_GetSheetViewType(index);
                this.view.btnViewPageBreak && this.view.btnViewPageBreak.toggle(value===Asc.c_oAscESheetViewType.pageBreakPreview, true);
                this.view.btnViewNormal && this.view.btnViewNormal.toggle(value===Asc.c_oAscESheetViewType.normal, true);
            }
        }


    }, SSE.Controllers.ViewTab || {}));
});