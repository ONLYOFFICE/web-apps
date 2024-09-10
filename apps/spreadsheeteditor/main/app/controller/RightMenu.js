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
 *  RightMenu.js
 *
 *  Created on 3/27/14
 *
 */


define([
    'core',
    'spreadsheeteditor/main/app/view/RightMenu'
], function () {
    'use strict';

    SSE.Controllers.RightMenu = Backbone.Controller.extend({
        models: [],
        collections: [],
        views: [
            'RightMenu'
        ],

        initialize: function() {
            this.editMode = true;
            this._state = {wsLock: false, wsProps: []};

            this.addListeners({
                'Toolbar': {
                    'insertimage': this.onInsertImage.bind(this),
                    'insertshape': this.onInsertShape.bind(this),
                    'insertchart':  this.onInsertChart.bind(this),
                    'inserttextart': this.onInsertTextArt.bind(this),
                    'inserttable': this.onInsertTable.bind(this)
                },
                'RightMenu': {
                    'rightmenuclick': this.onRightMenuClick,
                    'button:click':  _.bind(this.onBtnCategoryClick, this)
                },
                'PivotTable': {
                    'insertpivot': this.onInsertPivot
                },
                'ViewTab': {
                    'rightmenu:hide': this.onRightMenuHide.bind(this)
                },
                'Common.Views.Plugins': {
                    'plugins:addtoright': _.bind(this.addNewPlugin, this),
                    'pluginsright:open': _.bind(this.openPlugin, this),
                    'pluginsright:close': _.bind(this.closePlugin, this),
                    'pluginsright:hide': _.bind(this.onHidePlugins, this),
                    'pluginsright:updateicons': _.bind(this.updatePluginButtonsIcons, this)
                }
            });

            Common.Utils.InternalSettings.set("sse-rightpanel-active-table", 1);
            Common.Utils.InternalSettings.set("sse-rightpanel-active-pivot", 1);
            Common.Utils.InternalSettings.set("sse-rightpanel-active-spark", 1);
        },

        onLaunch: function() {
            this.rightmenu = this.createView('RightMenu');
            this.rightmenu.on('render:after', _.bind(this.onRightMenuAfterRender, this));
        },

        onRightMenuAfterRender: function(rightMenu) {
            rightMenu.imageSettings.application = rightMenu.shapeSettings.application = rightMenu.textartSettings.application = this.getApplication();

            this._settings = [];
            this._settings[Common.Utils.documentSettingsType.Paragraph] = {panelId: "id-paragraph-settings",  panel: rightMenu.paragraphSettings,btn: rightMenu.btnText,        hidden: 1, locked: false};
            this._settings[Common.Utils.documentSettingsType.Image] =     {panelId: "id-image-settings",      panel: rightMenu.imageSettings,    btn: rightMenu.btnImage,       hidden: 1, locked: false};
            this._settings[Common.Utils.documentSettingsType.Shape] =     {panelId: "id-shape-settings",      panel: rightMenu.shapeSettings,    btn: rightMenu.btnShape,       hidden: 1, locked: false};
            this._settings[Common.Utils.documentSettingsType.TextArt] =   {panelId: "id-textart-settings",    panel: rightMenu.textartSettings,  btn: rightMenu.btnTextArt,     hidden: 1, locked: false};
            this._settings[Common.Utils.documentSettingsType.Chart] =     {panelId: "id-chart-settings",      panel: rightMenu.chartSettings,    btn: rightMenu.btnChart,       hidden: 1, locked: false};
            this._settings[Common.Utils.documentSettingsType.Table] =     {panelId: "id-table-settings",      panel: rightMenu.tableSettings,    btn: rightMenu.btnTable,       hidden: 1, locked: false};
            this._settings[Common.Utils.documentSettingsType.Pivot] =     {panelId: "id-pivot-settings",      panel: rightMenu.pivotSettings,    btn: rightMenu.btnPivot,       hidden: 1, locked: false};
            this._settings[Common.Utils.documentSettingsType.Signature] = {panelId: "id-signature-settings",  panel: rightMenu.signatureSettings, btn: rightMenu.btnSignature,  hidden: 1, props: {}, locked: false};
            this._settings[Common.Utils.documentSettingsType.Cell] =      {panelId: "id-cell-settings",       panel: rightMenu.cellSettings,     btn: rightMenu.btnCell,        hidden: 1, locked: false};
            this._settings[Common.Utils.documentSettingsType.Slicer] =    {panelId: "id-slicer-settings",     panel: rightMenu.slicerSettings,   btn: rightMenu.btnSlicer,      hidden: 1, locked: false};
        },

        setApi: function(api) {
            this.api = api;
            this.api.asc_registerCallback('asc_onUpdateSignatures',     _.bind(this.onApiUpdateSignatures, this));
            this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',_.bind(this.onCoAuthoringDisconnect, this));
            Common.NotificationCenter.on('api:disconnect',              _.bind(this.onCoAuthoringDisconnect, this));
            Common.NotificationCenter.on('cells:range',                 _.bind(this.onCellsRange, this));
            Common.NotificationCenter.on('protect:wslock',              _.bind(this.onChangeProtectSheet, this));
        },

        setMode: function(mode) {
            this.editMode = mode.isEdit;
        },

        onRightMenuClick: function(menu, type, minimized, event) {
            if (!minimized && this.editMode) {
                if (event) { // user click event
                    if (type == Common.Utils.documentSettingsType.Table) {
                        Common.Utils.InternalSettings.set("sse-rightpanel-active-table", 2);
                        if (!this._settings[Common.Utils.documentSettingsType.Chart].hidden) {
                            Common.Utils.InternalSettings.set("sse-rightpanel-active-spark", Math.min(Common.Utils.InternalSettings.get("sse-rightpanel-active-spark"), 1));
                        }
                    } else if (type == Common.Utils.documentSettingsType.Pivot)
                        Common.Utils.InternalSettings.set("sse-rightpanel-active-pivot", 1);
                    else if (type == Common.Utils.documentSettingsType.Chart && !this._settings[Common.Utils.documentSettingsType.Cell].hidden) {//sparkline
                        Common.Utils.InternalSettings.set("sse-rightpanel-active-spark", 2);
                        if (!this._settings[Common.Utils.documentSettingsType.Table].hidden) {
                            Common.Utils.InternalSettings.set("sse-rightpanel-active-table", Math.min(Common.Utils.InternalSettings.get("sse-rightpanel-active-table"), 1));
                        }
                    } else if (Common.Utils.documentSettingsType.Cell) {
                        if (!this._settings[Common.Utils.documentSettingsType.Table].hidden)
                            Common.Utils.InternalSettings.set("sse-rightpanel-active-table", 0);
                        if (!this._settings[Common.Utils.documentSettingsType.Pivot].hidden)
                            Common.Utils.InternalSettings.set("sse-rightpanel-active-pivot", 0);
                        if (!this._settings[Common.Utils.documentSettingsType.Chart].hidden)
                            Common.Utils.InternalSettings.set("sse-rightpanel-active-spark", 0);
                    }
                }

                var panel = this._settings[type].panel;
                var props = this._settings[type].props;
                if (props && panel) {
                    panel.ChangeSettings.call(panel, (type==Common.Utils.documentSettingsType.Signature) ? undefined : props, this._state.wsLock, this._state.wsProps);
                    this.rightmenu.updateScroller();
                }
            }
            Common.NotificationCenter.trigger('layout:changed', 'rightmenu');
            Common.NotificationCenter.trigger('edit:complete', this.rightmenu);
        },

        onSelectionChanged: function(info) {
            if (this.rangeSelectionMode || !info) return;
            
            var SelectedObjects = [],
                selectType = info.asc_getSelectionType(),
                formatTableInfo = info.asc_getFormatTableInfo(),
                sparkLineInfo = info.asc_getSparklineInfo(),
                cellInfo = info,
                pivotInfo = info.asc_getPivotTableInfo();

            if (selectType == Asc.c_oAscSelectionType.RangeImage || selectType == Asc.c_oAscSelectionType.RangeShape || selectType == Asc.c_oAscSelectionType.RangeSlicer ||
                selectType == Asc.c_oAscSelectionType.RangeChart || selectType == Asc.c_oAscSelectionType.RangeChartText || selectType == Asc.c_oAscSelectionType.RangeShapeText) {
                SelectedObjects = this.api.asc_getGraphicObjectProps();
            }
            
            if (SelectedObjects.length<=0 && !cellInfo && !formatTableInfo && !sparkLineInfo && !pivotInfo && !this.rightmenu.minimizedMode &&
                this.rightmenu.GetActivePane() !== 'id-signature-settings') {
                this.rightmenu.clearSelection();
                this._openRightMenu = true;
            }

            this.onFocusObject(SelectedObjects, cellInfo, formatTableInfo, sparkLineInfo, pivotInfo);
        },

        onFocusObject: function(SelectedObjects, cellInfo, formatTableInfo, sparkLineInfo, pivotInfo, forceSignature) {
            if (!this.editMode && !forceSignature)
                return;

            var isCellLocked = cellInfo && cellInfo.asc_getLocked() || this._state.wsProps['FormatCells'],
                isTableLocked = (cellInfo && cellInfo.asc_getLockedTable()===true || !this.rightmenu.mode.canModifyFilter) || this._state.wsProps['FormatCells'],
                isSparkLocked = (cellInfo && cellInfo.asc_getLockedSparkline()===true) || this._state.wsLock,
                isPivotLocked = (cellInfo && cellInfo.asc_getLockedPivotTable()===true) || this._state.wsProps['PivotTables'],
                isUserProtected = cellInfo && cellInfo.asc_getUserProtected()===true;

            for (var i=0; i<this._settings.length; ++i) {
                if (i==Common.Utils.documentSettingsType.Signature) continue;
                if (this._settings[i]) {
                    this._settings[i].hidden = 1;
                    this._settings[i].locked = false;
                }
            }
            this._settings[Common.Utils.documentSettingsType.Signature].locked = false;

            var locktext = false;
            for (i=0; i<SelectedObjects.length; ++i)
            {
                var eltype = SelectedObjects[i].asc_getObjectType(),
                    settingsType = this.getDocumentSettingsType(eltype);
                if (settingsType===undefined || settingsType>=this._settings.length || this._settings[settingsType]===undefined)
                    continue;

                var value = SelectedObjects[i].asc_getObjectValue();
                if (settingsType == Common.Utils.documentSettingsType.Image) {
                    locktext = locktext || value.asc_getProtectionLockText();
                    if (value.asc_getChartProperties() !== null) {
                        settingsType = Common.Utils.documentSettingsType.Chart;
                        this._settings[settingsType].btn.updateHint(this.rightmenu.txtChartSettings);
                    } else if (value.asc_getShapeProperties() !== null) {
                        settingsType = Common.Utils.documentSettingsType.Shape;
                        if (value.asc_getShapeProperties().asc_getTextArtProperties()) {
                            this._settings[Common.Utils.documentSettingsType.TextArt].props = value;
                            this._settings[Common.Utils.documentSettingsType.TextArt].hidden = 0;
                            this._settings[Common.Utils.documentSettingsType.TextArt].locked = value.asc_getLocked() || this._state.wsProps['Objects'] && value.asc_getProtectionLockText();
                        }
                    } else if (value.asc_getSlicerProperties() !== null) {
                        settingsType = Common.Utils.documentSettingsType.Slicer;
                    }
                    this._settings[settingsType].locked = value.asc_getLocked() || this._state.wsProps['Objects'] && value.asc_getProtectionLocked();
                } else {
                    this._settings[settingsType].locked = value.asc_getLocked();
                }

                this._settings[settingsType].props = value;
                this._settings[settingsType].hidden = 0;

                if (!this._settings[Common.Utils.documentSettingsType.Signature].locked) // lock Signature, если хотя бы один объект locked
                    this._settings[Common.Utils.documentSettingsType.Signature].locked = value.asc_getLocked();
                if (!this._settings[Common.Utils.documentSettingsType.Paragraph].locked) // lock Paragraph, если хотя бы у одной автофигуры заблокирован текст
                    this._settings[Common.Utils.documentSettingsType.Paragraph].locked = this._state.wsProps['Objects'] && locktext;
            }

            if (formatTableInfo) {
                settingsType = Common.Utils.documentSettingsType.Table;
                this._settings[settingsType].props = formatTableInfo;
                this._settings[settingsType].locked = isTableLocked;
                this._settings[settingsType].hidden = 0;
            }

            if (sparkLineInfo) {
                settingsType = Common.Utils.documentSettingsType.Chart;
                this._settings[settingsType].props = sparkLineInfo;
                this._settings[settingsType].locked = isSparkLocked;
                this._settings[settingsType].hidden = 0;
                this._settings[settingsType].btn.updateHint(this.rightmenu.txtSparklineSettings);
            }

            if (pivotInfo && this.rightmenu.mode.canFeaturePivot) {
                settingsType = Common.Utils.documentSettingsType.Pivot;
                this._settings[settingsType].props = pivotInfo;
                this._settings[settingsType].locked = isPivotLocked; // disable pivot settings
                this._settings[settingsType].hidden = 0;
            }

            if (SelectedObjects.length<=0 && cellInfo) { // cell is selected
                settingsType = Common.Utils.documentSettingsType.Cell;
                this._settings[settingsType].props = cellInfo;
                this._settings[settingsType].locked = isCellLocked || isUserProtected;
                this._settings[settingsType].hidden = 0;
            }

            var lastactive = -1, currentactive, priorityactive = -1,
                activePane = this.rightmenu.GetActivePane();
            for (i=0; i<this._settings.length; ++i) {
                var pnl = this._settings[i];
                if (pnl===undefined || pnl.btn===undefined || pnl.panel===undefined) continue;

                if ( pnl.hidden ) {
                    if (!pnl.btn.isDisabled()) {
                        pnl.btn.setDisabled(true);
                        this.rightmenu.setDisabledMoreMenuItem(pnl.btn, true);
                    }
                    if (activePane == pnl.panelId)
                        currentactive = -1;
                } else {
                    if (pnl.btn.isDisabled()) {
                        pnl.btn.setDisabled(false);
                        this.rightmenu.setDisabledMoreMenuItem(pnl.btn, false);
                    }
                    if (i!=Common.Utils.documentSettingsType.Signature) lastactive = i;
                    if ( pnl.needShow ) {
                        pnl.needShow = false;
                        priorityactive = i;
                    } else if (activePane == pnl.panelId)
                        currentactive = i;
                    pnl.panel.setLocked(pnl.locked);
                }
            }

            if (!this.rightmenu.minimizedMode || this._openRightMenu) {
                var active;

                if (priorityactive<0 && this._lastVisibleSettings!==undefined) {
                    var pnl = this._settings[this._lastVisibleSettings];
                    if (pnl!==undefined && pnl.btn!==undefined && pnl.panel!==undefined && !pnl.hidden)
                        priorityactive = this._lastVisibleSettings;
                }

                if (priorityactive<0 && !this._settings[Common.Utils.documentSettingsType.Cell].hidden &&
                                        (!this._settings[Common.Utils.documentSettingsType.Table].hidden || !this._settings[Common.Utils.documentSettingsType.Pivot].hidden ||
                                         !this._settings[Common.Utils.documentSettingsType.Chart].hidden)) {
                    var tableactive = Common.Utils.InternalSettings.get("sse-rightpanel-active-table"),
                        pivotactive = Common.Utils.InternalSettings.get("sse-rightpanel-active-pivot"),
                        sparkactive = Common.Utils.InternalSettings.get("sse-rightpanel-active-spark");
                    if (!this._settings[Common.Utils.documentSettingsType.Table].hidden && !this._settings[Common.Utils.documentSettingsType.Chart].hidden) {
                        if (tableactive == sparkactive)
                            priorityactive = (tableactive===0) ? Common.Utils.documentSettingsType.Cell : Common.Utils.documentSettingsType.Chart;
                        else
                            priorityactive = (tableactive > sparkactive) ? Common.Utils.documentSettingsType.Table : Common.Utils.documentSettingsType.Chart;
                    } else if (!this._settings[Common.Utils.documentSettingsType.Table].hidden) {
                        priorityactive = (tableactive===0) ? Common.Utils.documentSettingsType.Cell : Common.Utils.documentSettingsType.Table;
                    } else if (!this._settings[Common.Utils.documentSettingsType.Chart].hidden) {
                        priorityactive = (sparkactive===0) ? Common.Utils.documentSettingsType.Cell : Common.Utils.documentSettingsType.Chart;
                    }
                    if (!this._settings[Common.Utils.documentSettingsType.Pivot].hidden)
                        priorityactive = (pivotactive===0) ? Common.Utils.documentSettingsType.Cell : Common.Utils.documentSettingsType.Pivot;
                }

                if (priorityactive>-1) active = priorityactive;
                else if (lastactive>=0 && currentactive<0) active = lastactive;
                else if (currentactive>=0) active = currentactive;
                else if (forceSignature && !this._settings[Common.Utils.documentSettingsType.Signature].hidden) active = Common.Utils.documentSettingsType.Signature;

                if (active == undefined && this._openRightMenu && lastactive>=0)
                    active = lastactive;

                if (active !== undefined) {
                    this.rightmenu.SetActivePane(active, this._openRightMenu);
                    if (active!=Common.Utils.documentSettingsType.Signature)
                        this._settings[active].panel.ChangeSettings.call(this._settings[active].panel, this._settings[active].props, this._state.wsLock, this._state.wsProps);
                    else
                        this._settings[active].panel.ChangeSettings.call(this._settings[active].panel);
                    this._openRightMenu = false;
                    (active !== currentactive) && this.rightmenu.updateScroller();
                }
            }

            this._settings[Common.Utils.documentSettingsType.Image].needShow = false;
            this._settings[Common.Utils.documentSettingsType.Chart].needShow = false;
            this._settings[Common.Utils.documentSettingsType.Table].needShow = false;
            pivotInfo && (this._settings[Common.Utils.documentSettingsType.Pivot].needShow = false);
        },

        onCoAuthoringDisconnect: function() {
            this.SetDisabled(true);
            this.setMode({isEdit: false});
        },

        onInsertImage:  function() {
            this._settings[Common.Utils.documentSettingsType.Image].needShow = true;
        },

        onInsertChart:  function() {
            this._settings[Common.Utils.documentSettingsType.Chart].needShow = true;
        },

        onInsertShape:  function() {
            this._settings[Common.Utils.documentSettingsType.Shape].needShow = true;
        },

        onInsertTextArt:  function() {
            this._settings[Common.Utils.documentSettingsType.TextArt].needShow = true;
        },

        onInsertTable:  function() {
            // this._settings[Common.Utils.documentSettingsType.Table].needShow = true;
        },

        onInsertPivot:  function() {
            this._settings[Common.Utils.documentSettingsType.Pivot].needShow = true;
            Common.Utils.InternalSettings.set("sse-rightpanel-active-pivot", 1);
            this._openRightMenu = true;
        },

        UpdateThemeColors:  function() {
            this.rightmenu.shapeSettings.UpdateThemeColors();
            this.rightmenu.textartSettings.UpdateThemeColors();
            this.rightmenu.chartSettings.UpdateThemeColors();
            this.rightmenu.cellSettings.UpdateThemeColors();
        },

        updateMetricUnit: function() {
            this.rightmenu.paragraphSettings.updateMetricUnit();
            this.rightmenu.chartSettings.updateMetricUnit();
            this.rightmenu.imageSettings.updateMetricUnit();
            this.rightmenu.slicerSettings.updateMetricUnit();
        },

        createDelayedElements: function() {
            var me = this;
            if (this.api) {
                this._openRightMenu = !Common.localStorage.getBool("sse-hide-right-settings", this.rightmenu.defaultHideRightMenu);
                Common.Utils.InternalSettings.set("sse-hide-right-settings", !this._openRightMenu);

                this.api.asc_registerCallback('asc_onSelectionChanged', _.bind(this.onSelectionChanged, this));
                this.api.asc_registerCallback('asc_doubleClickOnObject', _.bind(this.onDoubleClickOnObject, this));
                // this.rightmenu.shapeSettings.createDelayedElements();
                this.onChangeProtectSheet();
            }
            this.rightmenu.setButtons();
            this.rightmenu.setMoreButton();
        },

        onDoubleClickOnObject: function(obj) {
            if (!this.editMode) return;

            var eltype = obj.asc_getObjectType(),
                settingsType = this.getDocumentSettingsType(eltype);
            if (settingsType===undefined || settingsType>=this._settings.length || this._settings[settingsType]===undefined)
                return;

            var value = obj.asc_getObjectValue();
            if (settingsType == Common.Utils.documentSettingsType.Image) {
                if (value.asc_getChartProperties() !== null) {
                    settingsType = Common.Utils.documentSettingsType.Chart;
                } else if (value.asc_getShapeProperties() !== null) {
                    settingsType = Common.Utils.documentSettingsType.Shape;
                }
            }

            if (settingsType !== Common.Utils.documentSettingsType.Paragraph) {
                this.rightmenu.SetActivePane(settingsType, true);
                this._settings[settingsType].panel.ChangeSettings.call(this._settings[settingsType].panel, this._settings[settingsType].props, this._state.wsLock, this._state.wsProps);
                this.rightmenu.updateScroller();
            }
        },

        getDocumentSettingsType: function(type) {
            switch (type) {
                case Asc.c_oAscTypeSelectElement.Paragraph:
                    return Common.Utils.documentSettingsType.Paragraph;
                case Asc.c_oAscTypeSelectElement.Image:
                    return Common.Utils.documentSettingsType.Image;
            }
        },

        onApiUpdateSignatures: function(valid, requested){
            if (!this.rightmenu.signatureSettings) return;

            var disabled = (!valid || valid.length<1) && (!requested || requested.length<1),
                type = Common.Utils.documentSettingsType.Signature;
            this._settings[type].hidden = disabled ? 1 : 0;
            this._settings[type].btn.setDisabled(disabled);
            this.rightmenu.setDisabledMoreMenuItem(this._settings[type].btn, disabled);
            this._settings[type].panel.setLocked(this._settings[type].locked);
        },

        SetDisabled: function(disabled, allowSignature) {
            this.setMode({isEdit: !disabled});
            if (this.rightmenu && this.rightmenu.paragraphSettings) {
                this.rightmenu.paragraphSettings.disableControls(disabled);
                this.rightmenu.shapeSettings.disableControls(disabled);
                this.rightmenu.imageSettings.disableControls(disabled);
                this.rightmenu.chartSettings.disableControls(disabled);
                this.rightmenu.tableSettings.disableControls(disabled);
                this.rightmenu.pivotSettings.disableControls(disabled);
                this.rightmenu.cellSettings.disableControls(disabled);
                this.rightmenu.slicerSettings.disableControls(disabled);

                if (this.rightmenu.signatureSettings) {
                    !allowSignature && this.rightmenu.btnSignature.setDisabled(disabled);
                    allowSignature && disabled && this.onFocusObject([], undefined, undefined, undefined, undefined, true); // force press signature button
                }

                if (disabled) {
                    this.rightmenu.btnText.setDisabled(disabled);
                    this.rightmenu.btnTable.setDisabled(disabled);
                    this.rightmenu.btnImage.setDisabled(disabled);
                    this.rightmenu.btnShape.setDisabled(disabled);
                    this.rightmenu.btnTextArt.setDisabled(disabled);
                    this.rightmenu.btnChart.setDisabled(disabled);
                    this.rightmenu.btnPivot.setDisabled(disabled);
                    this.rightmenu.btnCell.setDisabled(disabled);
                    this.rightmenu.btnSlicer.setDisabled(disabled);
                    this.rightmenu.setDisabledAllMoreMenuItems(disabled);
                } else {
                    this.onSelectionChanged(this.api.asc_getCellInfo());
                }
            }
        },

        onCellsRange: function(status) {
            this.rangeSelectionMode = (status != Asc.c_oAscSelectionDialogType.None);
        },

        onChangeProtectSheet: function(props) {
            if (!props) {
                var wbprotect = this.getApplication().getController('WBProtection');
                props = wbprotect ? wbprotect.getWSProps() : null;
            }
            if (props) {
                this._state.wsProps = props.wsProps;
                this._state.wsLock = props.wsLock;
            }
            this.onSelectionChanged(this.api.asc_getCellInfo());
        },

        onRightMenuHide: function (view, status) {
            if (this.rightmenu) {
                if (!status)  { // remember last active pane
                    var active = this.rightmenu.GetActivePane(),
                        type;
                    if (active) {
                        for (var i=0; i<this._settings.length; i++) {
                            if (this._settings[i] && this._settings[i].panelId === active) {
                                type = i;
                                break;
                            }
                        }
                        this._lastVisibleSettings = type;
                    }
                    this.rightmenu.clearSelection();
                    this.rightmenu.hide();
                    this.rightmenu.signatureSettings && this.rightmenu.signatureSettings.hideSignatureTooltip();
                } else {
                    this.rightmenu.show();
                    this._openRightMenu = !Common.Utils.InternalSettings.get("sse-hide-right-settings");
                    this.onSelectionChanged(this.api.asc_getCellInfo());
                    this._lastVisibleSettings = undefined;
                }
                !view && this.rightmenu.fireEvent('view:hide', [this, !status]);
                Common.localStorage.setBool('sse-hidden-rightmenu', !status);
            }

            Common.NotificationCenter.trigger('layout:changed', 'main');
            Common.NotificationCenter.trigger('edit:complete', this.rightmenu);
        },

        onRightMenuOpen: function(type) {
            if (this._settings[type]===undefined || this._settings[type].hidden || this._settings[type].btn.isDisabled() || this._settings[type].panelId===this.rightmenu.GetActivePane()) return;

            this.tryToShowRightMenu();
            this.rightmenu.SetActivePane(type, true);
            this._settings[type].panel.ChangeSettings.call(this._settings[type].panel, this._settings[type].props);
            this.rightmenu.updateScroller();
        },

        tryToShowRightMenu: function() {
            if (this.rightmenu && this.rightmenu.mode && (!this.rightmenu.mode.canBrandingExt || !this.rightmenu.mode.customization || this.rightmenu.mode.customization.rightMenu !== false) && Common.UI.LayoutManager.isElementVisible('rightMenu'))
                this.onRightMenuHide(null, true);
        },

        addNewPlugin: function (button, $button, $panel) {
            this.rightmenu.insertButton(button, $button);
            this.rightmenu.insertPanel($panel);
        },

        openPlugin: function (guid) {
            this.rightmenu.openPlugin(guid);
        },

        closePlugin: function (guid) {
            this.rightmenu.closePlugin(guid);
            this.rightmenu.onBtnMenuClick();
            Common.NotificationCenter.trigger('layout:changed', 'rightmenu');
            this.rightmenu.fireEvent('editcomplete', this.rightmenu);
        },

        onHidePlugins: function() {
            Common.NotificationCenter.trigger('layout:changed', 'rightmenu');
        },

        updatePluginButtonsIcons: function (icons) {
            this.rightmenu.updatePluginButtonsIcons(icons);
        },

        onBtnCategoryClick: function (btn) {
            if (btn.options.type === 'plugin' && !btn.isDisabled()) {
                this.rightmenu.onBtnMenuClick(btn);
                if (btn.pressed) {
                    this.rightmenu.fireEvent('plugins:showpanel', [btn.options.value]); // show plugin panel
                } else {
                    this.rightmenu.fireEvent('plugins:hidepanel', [btn.options.value]);
                }
                Common.NotificationCenter.trigger('layout:changed', 'rightmenu');
                this.rightmenu.fireEvent('editcomplete', this.rightmenu);
            }
        },
    });
});