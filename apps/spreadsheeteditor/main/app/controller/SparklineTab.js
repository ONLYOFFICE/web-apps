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
 *  SparklineTab.js
 *
 *  Created on 15.10.2025
 *
 */

define([
    'core',
    'spreadsheeteditor/main/app/view/SparklineTab'
], function () {
    'use strict';

    SSE.Controllers.SparklineTab = Backbone.Controller.extend(_.extend({
        models : [],
        collections : [
        ],
        views : [
            'SparklineTab'
        ],
        sdkViewName : '#id_main',

        initialize: function () {
            this._state = {
                SparkType: -1,
                SparkStyle: 1,
                DisabledControls: false,
                SparkType: -1,
                SparkStyle: 1,
                LineWeight: 1,
                MarkersPoint: false,
                HighPoint: false,
                LowPoint: false,
                FirstPoint: false,
                LastPoint: false,
                NegativePoint: false,
                SparkColor: '000000',
                MarkersColor: this.defColor,
                HighColor: this.defColor,
                LowColor: this.defColor,
                FirstColor: this.defColor,
                LastColor: this.defColor,
                NegativeColor: this.defColor,
                SparkId: undefined
            };
            this._nRatio = 1;
            this.spinners = [];
            this.chPoints = [];
            this.lockedControls = [];
            this._locked = false;
            this.defColor = {color: '4f81bd', effectId: 24};
            this.isChart = true;
            
            this._noApply = false;
            this._originalProps = null;

            this.addListeners({
                'ChartTab': {
                },
            });
        },

        ShowHideElem: function(isChart, is3D) {
            // this.SparkTypesContainer.toggleClass('settings-hidden', isChart);
            // this.SparkPointsContainer.toggleClass('settings-hidden', isChart);
            this.fireEvent('updatescroller', this);
        },

        disableControls: function(disable) {
            if (this._initSettings) return;
            
            if (this._state.DisabledControls!==disable) {
                this._state.DisabledControls = disable;
                _.each(this.lockedControls, function(item) {
                    item.setDisabled(disable);
                });
                // this.view.btnAdvancedSettings.setDisabled(disable);
            }
        },

        ShowCombinedProps: function(type) {
            // this.view.chartStyles.setVisible(!(type===null || type==Asc.c_oAscChartTypeSettings.comboBarLine || type==Asc.c_oAscChartTypeSettings.comboBarLineSecondary ||
            //                                                            type==Asc.c_oAscChartTypeSettings.comboAreaBar || type==Asc.c_oAscChartTypeSettings.comboCustom));
        },

        setApi: function(api) {
            if (api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',_.bind(this.SetDisabled, this));
                Common.NotificationCenter.on('api:disconnect', _.bind(this.SetDisabled, this));
                this.api.asc_registerCallback('asc_onSelectionChanged',     _.bind(this.onSelectionChanged, this));
                Common.NotificationCenter.on('cells:range',                 _.bind(this.onCellsRange, this));
            }
            return this;
        },

        setMode: function(mode) {
            this.appConfig = mode;
            return this;
        },

        setConfig: function(config) {
            this.view = this.createView('SparklineTab', {
                toolbar: config.toolbar.toolbar
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

        onSelectionChanged: function(info) {
            if (this.rangeSelectionMode || !this.appConfig.isEdit || !this.view) return;
            var selectType = info.asc_getSelectionType();
            var selectedObjects = this.api.asc_getGraphicObjectProps();
            if ((selectType == Asc.c_oAscSelectionType.RangeChart || selectType == Asc.c_oAscSelectionType.RangeChartText) && selectedObjects)
                for (var i = 0; i < selectedObjects.length; i++) {
                    if (selectedObjects[i].asc_getObjectType() == Asc.c_oAscTypeSelectElement.Image) {
                        var elValue = selectedObjects[i].asc_getObjectValue();
                        if ( elValue.asc_getChartProperties() ) {
                            // this.ChangeSettings(this.api.asc_getGraphicObjectProps()[i].asc_getObjectValue());
                            break;
                        }
                    }
                }
        },

        onCellsRange: function(status) {
            this.rangeSelectionMode = (status != Asc.c_oAscSelectionDialogType.None);
        },

    }, SSE.Controllers.SparklineTab || {}));
});