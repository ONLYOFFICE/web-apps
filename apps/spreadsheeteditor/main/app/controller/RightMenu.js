/*
 *
 * (c) Copyright Ascensio System Limited 2010-2017
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
 *  RightMenu.js
 *
 *  Created by Julia Radzhabova on 3/27/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
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
            this._state = {};

            this.addListeners({
                'RightMenu': {
                    'rightmenuclick': this.onRightMenuClick
                }
            });
        },

        onLaunch: function() {
            this.rightmenu = this.createView('RightMenu');

            this.rightmenu.on('render:after', _.bind(this.onRightMenuAfterRender, this));
        },

        onRightMenuAfterRender: function(rightMenu) {
            rightMenu.shapeSettings.application = rightMenu.textartSettings.application = this.getApplication();

            this._settings = [];
            this._settings[Common.Utils.documentSettingsType.Paragraph] = {panelId: "id-paragraph-settings",  panel: rightMenu.paragraphSettings,btn: rightMenu.btnText,        hidden: 1, locked: false};
            this._settings[Common.Utils.documentSettingsType.Image] =     {panelId: "id-image-settings",      panel: rightMenu.imageSettings,    btn: rightMenu.btnImage,       hidden: 1, locked: false};
            this._settings[Common.Utils.documentSettingsType.Shape] =     {panelId: "id-shape-settings",      panel: rightMenu.shapeSettings,    btn: rightMenu.btnShape,       hidden: 1, locked: false};
            this._settings[Common.Utils.documentSettingsType.TextArt] =   {panelId: "id-textart-settings",    panel: rightMenu.textartSettings,  btn: rightMenu.btnTextArt,     hidden: 1, locked: false};
            this._settings[Common.Utils.documentSettingsType.Chart] =     {panelId: "id-chart-settings",      panel: rightMenu.chartSettings,    btn: rightMenu.btnChart,       hidden: 1, locked: false};
            this._settings[Common.Utils.documentSettingsType.Table] =     {panelId: "id-table-settings",      panel: rightMenu.tableSettings,    btn: rightMenu.btnTable,       hidden: 1, locked: false};
        },

        setApi: function(api) {
            this.api = api;
            this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',_.bind(this.onCoAuthoringDisconnect, this));
            Common.NotificationCenter.on('api:disconnect',              _.bind(this.onCoAuthoringDisconnect, this));
            Common.NotificationCenter.on('cells:range',                 _.bind(this.onCellsRange, this));
        },

        setMode: function(mode) {
            this.editMode = mode.isEdit;
        },

        onRightMenuClick: function(menu, type, minimized) {
            if (!minimized && this.editMode) {
                var panel = this._settings[type].panel;
                var props = this._settings[type].props;
                if (props && panel)
                    panel.ChangeSettings.call(panel, props);
            }
            Common.NotificationCenter.trigger('layout:changed', 'rightmenu');
            Common.NotificationCenter.trigger('edit:complete', this.rightmenu);
        },

        onSelectionChanged: function(info) {
            if (this.rangeSelectionMode) return;
            
            var SelectedObjects = [],
                selectType = info.asc_getFlags().asc_getSelectionType(),
                formatTableInfo = info.asc_getFormatTableInfo(),
                sparkLineInfo = info.asc_getSparklineInfo();

            if (selectType == Asc.c_oAscSelectionType.RangeImage || selectType == Asc.c_oAscSelectionType.RangeShape ||
                selectType == Asc.c_oAscSelectionType.RangeChart || selectType == Asc.c_oAscSelectionType.RangeChartText || selectType == Asc.c_oAscSelectionType.RangeShapeText) {
                SelectedObjects = this.api.asc_getGraphicObjectProps();
            }
            
            if (SelectedObjects.length<=0 && !formatTableInfo && !sparkLineInfo && !this.rightmenu.minimizedMode) {
                this.rightmenu.clearSelection();
                this._openRightMenu = true;
            }

            var need_disable = info.asc_getLocked(),
                need_disable_table = (info.asc_getLockedTable()===true),
                need_disable_spark = (info.asc_getLockedSparkline()===true);

            this.onFocusObject(SelectedObjects, formatTableInfo, sparkLineInfo, need_disable, need_disable_table, need_disable_spark);
        },

        onFocusObject: function(SelectedObjects, formatTableInfo, sparkLineInfo, isCellLocked, isTableLocked, isSparkLocked) {
            if (!this.editMode)
                return;

            for (var i=0; i<this._settings.length; ++i) {
                if (this._settings[i]) {
                    this._settings[i].hidden = 1;
                    this._settings[i].locked = false;
                }
            }

            for (i=0; i<SelectedObjects.length; ++i)
            {
                var eltype = SelectedObjects[i].asc_getObjectType(),
                    settingsType = this.getDocumentSettingsType(eltype);
                if (settingsType===undefined || settingsType>=this._settings.length || this._settings[settingsType]===undefined)
                    continue;

                var value = SelectedObjects[i].asc_getObjectValue();
                if (settingsType == Common.Utils.documentSettingsType.Image) {
                    if (value.asc_getChartProperties() !== null) {
                        settingsType = Common.Utils.documentSettingsType.Chart;
                        this._settings[settingsType].btn.updateHint(this.rightmenu.txtChartSettings);
                    } else if (value.asc_getShapeProperties() !== null) {
                        settingsType = Common.Utils.documentSettingsType.Shape;
                        if (value.asc_getShapeProperties().asc_getTextArtProperties()) {
                            this._settings[Common.Utils.documentSettingsType.TextArt].props = value;
                            this._settings[Common.Utils.documentSettingsType.TextArt].hidden = 0;
                            this._settings[Common.Utils.documentSettingsType.TextArt].locked = value.asc_getLocked();
                        }
                    }
                }

                this._settings[settingsType].props = value;
                this._settings[settingsType].hidden = 0;
                this._settings[settingsType].locked = value.asc_getLocked();
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

            var lastactive = -1, currentactive, priorityactive = -1,
                activePane = this.rightmenu.GetActivePane();
            for (i=0; i<this._settings.length; ++i) {
                var pnl = this._settings[i];
                if (pnl===undefined) continue;

                if ( pnl.hidden ) {
                    if ( !pnl.btn.isDisabled() )
                        pnl.btn.setDisabled(true);
                    if (activePane == pnl.panelId)
                        currentactive = -1;
                } else {
                    if ( pnl.btn.isDisabled() )
                        pnl.btn.setDisabled(false);
                    lastactive = i;
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

                if (priorityactive>-1) active = priorityactive;
                else if (lastactive>=0 && currentactive<0) active = lastactive;
                else if (currentactive>=0) active = currentactive;

                if (active == undefined && this._openRightMenu && lastactive>=0)
                    active = lastactive;

                if (active !== undefined) {
                    this.rightmenu.SetActivePane(active, this._openRightMenu);
                    this._settings[active].panel.ChangeSettings.call(this._settings[active].panel, this._settings[active].props);
                    this._openRightMenu = false;
                }
            }

            this._settings[Common.Utils.documentSettingsType.Image].needShow = false;
            this._settings[Common.Utils.documentSettingsType.Chart].needShow = false;
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
        
        UpdateThemeColors:  function() {
            this.rightmenu.shapeSettings.UpdateThemeColors();
            this.rightmenu.textartSettings.UpdateThemeColors();
            this.rightmenu.chartSettings.UpdateThemeColors();
        },

        updateMetricUnit: function() {
            this.rightmenu.paragraphSettings.updateMetricUnit();
            this.rightmenu.chartSettings.updateMetricUnit();
            this.rightmenu.imageSettings.updateMetricUnit();
        },

        fillTextArt:  function() {
            this.rightmenu.textartSettings.fillTextArt();
        },

        createDelayedElements: function() {
            var me = this;
            if (this.api) {
                 var open = Common.localStorage.getItem("sse-hide-right-settings");
                this._openRightMenu = (open===null || parseInt(open) == 0);
                
                this.api.asc_registerCallback('asc_onFocusObject', _.bind(this.onFocusObject, this));
                this.api.asc_registerCallback('asc_onSelectionChanged', _.bind(this.onSelectionChanged, this));
                this.api.asc_registerCallback('asc_doubleClickOnObject', _.bind(this.onDoubleClickOnObject, this));
                this.rightmenu.shapeSettings.createDelayedElements();
                this.onSelectionChanged(this.api.asc_getCellInfo());
            }
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
                this._settings[settingsType].panel.ChangeSettings.call(this._settings[settingsType].panel, this._settings[settingsType].props);
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

        SetDisabled: function(disabled) {
            if (this.rightmenu) {
                this.rightmenu.paragraphSettings.disableControls(disabled);
                this.rightmenu.shapeSettings.disableControls(disabled);
                this.rightmenu.imageSettings.disableControls(disabled);
                this.rightmenu.chartSettings.disableControls(disabled);
                this.rightmenu.tableSettings.disableControls(disabled);

                if (disabled) {
                    this.rightmenu.btnText.setDisabled(disabled);
                    this.rightmenu.btnTable.setDisabled(disabled);
                    this.rightmenu.btnImage.setDisabled(disabled);
                    this.rightmenu.btnShape.setDisabled(disabled);
                    this.rightmenu.btnTextArt.setDisabled(disabled);
                    this.rightmenu.btnChart.setDisabled(disabled);
                } else {
                    this.onSelectionChanged(this.api.asc_getCellInfo());
                }
            }
        },

        onCellsRange: function(status) {
            this.rangeSelectionMode = (status != Asc.c_oAscSelectionDialogType.None);
        }
    });
});