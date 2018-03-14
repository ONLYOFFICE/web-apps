/*
 *
 * (c) Copyright Ascensio System Limited 2010-2018
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
 *  ChartSettings.js
 *
 *  Created by Julia Radzhabova on 3/28/14
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!spreadsheeteditor/main/app/template/ChartSettings.template',
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/component/Button',
    'common/main/lib/component/MetricSpinner',
    'common/main/lib/component/ComboDataView',
    'spreadsheeteditor/main/app/view/ChartSettingsDlg'
], function (menuTemplate, $, _, Backbone) {
    'use strict';

    SSE.Views.ChartSettings = Backbone.View.extend(_.extend({
        el: '#id-chart-settings',

        // Compile our stats template
        template: _.template(menuTemplate),

        // Delegated events for creating new items, and clearing completed ones.
        events: {
        },

        options: {
            alias: 'ChartSettings'
        },

        initialize: function () {
            this._initSettings = true;
            this.txtPt = Common.Utils.Metric.getMetricName(Common.Utils.Metric.c_MetricUnits.pt);

            this._state = {
                Width: 0,
                Height: 0,
                ChartStyle: 1,
                ChartType: -1,
                SeveralCharts: false,
                DisabledControls: false,
                keepRatio: false,
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

            this.render();

            this.ChartSizeContainer = $('#chart-panel-size');
            this.ChartTypesContainer = $('#chart-panel-types');
            this.SparkTypesContainer = $('#spark-panel-types');
            this.SparkPointsContainer = $('#spark-panel-points');
        },

        render: function () {
            var el = $(this.el);
            el.html(this.template({
                scope: this
            }));
        },

        setApi: function(api) {
            this.api = api;
            if (this.api) {
                this.api.asc_registerCallback('asc_onUpdateChartStyles', _.bind(this._onUpdateChartStyles, this));
            }
            return this;
        },

        ChangeSettings: function(props) {
            if (this._initSettings)
                this.createDelayedElements();

            this.ShowHideElem(!!(props && props.asc_getChartProperties && props.asc_getChartProperties()));
            this.disableControls(this._locked);

            if (this.api && props){
                if (props.asc_getChartProperties && props.asc_getChartProperties()) { // chart
                    this._originalProps = new Asc.asc_CImgProperty(props);
                    this.isChart = true;

                    this._noApply = true;
                    this.chartProps = props.asc_getChartProperties();

                    var value = props.asc_getSeveralCharts() || this._locked;
                    if (this._state.SeveralCharts!==value) {
                        this.linkAdvanced.toggleClass('disabled', value);
                        this._state.SeveralCharts=value;
                    }

                    value = props.asc_getSeveralChartTypes();
                    if (this._state.SeveralCharts && value) {
                        this.btnChartType.setIconCls('');
                        this._state.ChartType = null;
                    } else {
                        var type = this.chartProps.getType();
                        if (this._state.ChartType !== type) {
                            var record = this.mnuChartTypePicker.store.findWhere({type: type});
                            this.mnuChartTypePicker.selectRecord(record, true);
                            if (record) {
                                this.btnChartType.setIconCls('item-chartlist ' + record.get('iconCls'));
                            } else
                                this.btnChartType.setIconCls('');
                            this.updateChartStyles(this.api.asc_getChartPreviews(type));
                            this._state.ChartType = type;
                        }
                    }

                    value = props.asc_getSeveralChartStyles();
                    if (this._state.SeveralCharts && value) {
                        this.cmbChartStyle.fieldPicker.deselectAll();
                        this.cmbChartStyle.menuPicker.deselectAll();
                        this._state.ChartStyle = null;
                    } else {
                        value = this.chartProps.getStyle();
                        if (this._state.ChartStyle!==value || this._isChartStylesChanged) {
                            this.cmbChartStyle.suspendEvents();
                            var rec = this.cmbChartStyle.menuPicker.store.findWhere({data: value});
                            this.cmbChartStyle.menuPicker.selectRecord(rec);
                            this.cmbChartStyle.resumeEvents();

                            if (this._isChartStylesChanged) {
                                if (rec)
                                    this.cmbChartStyle.fillComboView(this.cmbChartStyle.menuPicker.getSelectedRec()[0],true);
                                else
                                    this.cmbChartStyle.fillComboView(this.cmbChartStyle.menuPicker.store.at(0), true);
                            }
                            this._state.ChartStyle=value;
                        }
                    }
                    this._isChartStylesChanged = false;

                    this._noApply = false;

                    value = props.asc_getWidth();
                    if ( Math.abs(this._state.Width-value)>0.001 ||
                        (this._state.Width===null || value===null)&&(this._state.Width!==value)) {
                        this.spnWidth.setValue((value!==null) ? Common.Utils.Metric.fnRecalcFromMM(value) : '', true);
                        this._state.Width = value;
                    }

                    value = props.asc_getHeight();
                    if ( Math.abs(this._state.Height-value)>0.001 ||
                        (this._state.Height===null || value===null)&&(this._state.Height!==value)) {
                        this.spnHeight.setValue((value!==null) ? Common.Utils.Metric.fnRecalcFromMM(value) : '', true);
                        this._state.Height = value;
                    }

                    if (props.asc_getHeight()>0)
                        this._nRatio = props.asc_getWidth()/props.asc_getHeight();

                    value = props.asc_getLockAspect();
                    if (this._state.keepRatio!==value) {
                        this.btnRatio.toggle(value);
                        this._state.keepRatio=value;
                    }
                } else { //sparkline
                    this._originalProps = props;
                    this.isChart = false;
                    this._state.SparkId = props.asc_getId();

                    var type = props.asc_getType(),
                        styleChanged = false;
                    if (this._state.SparkType !== type) {
                        var record = this.mnuSparkTypePicker.store.findWhere({type: type});
                        this.mnuSparkTypePicker.selectRecord(record, true);
                        if (record) {
                            this.btnSparkType.setIconCls('item-chartlist ' + record.get('iconCls'));
                        } else
                            this.btnSparkType.setIconCls('');
                        this._state.SparkType = type;
                        styleChanged = true;
                    }

                    var w = props.asc_getLineWeight(),
                        check_value = (Math.abs(this._state.LineWeight-w)<0.001) && !((new RegExp(this.txtPt + '\\s*$')).test(this.cmbBorderSize.getRawValue()));
                    if ( Math.abs(this._state.LineWeight-w)>0.001 || check_value ||
                        (this._state.LineWeight===null || w===null)&&(this._state.LineWeight!==w)) {
                        this._state.LineWeight = w;

                        var _selectedItem = (w===null) ? w : _.find(this.cmbBorderSize.store.models, function(item) {
                            if ( w<item.attributes.value+0.01 && w>item.attributes.value-0.01) {
                                return true;
                            }
                        });
                        if (_selectedItem)
                            this.cmbBorderSize.selectRecord(_selectedItem);
                        else {
                            this.cmbBorderSize.setValue((w!==null) ? parseFloat(w.toFixed(2)) + ' ' + this.txtPt : '');
                        }
                        this.BorderSize = w;
                    }
                    this.cmbBorderSize.setDisabled(this._locked || this._state.SparkType!==Asc.c_oAscSparklineType.Line);

                    var color = props.asc_getColorSeries();
                    if (color) {
                        this.SparkColor = (color.asc_getType() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) ?
                            {color: Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB()), effectValue: color.asc_getValue() } :
                            Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB());

                        var type1 = typeof(this.SparkColor),
                            type2 = typeof(this._state.SparkColor);
                        if ( (type1 !== type2) || (type1=='object' && (this.SparkColor.effectValue!==this._state.SparkColor.effectValue || this._state.SparkColor.color.indexOf(this.SparkColor.color)<0)) ||
                            (type1!='object' && (this._state.SparkColor.indexOf(this.SparkColor)<0 || typeof(this.btnSparkColor.color)=='object'))) {

                            this.btnSparkColor.setColor(this.SparkColor);
                            if ( typeof(this.SparkColor) == 'object' ) {
                                var isselected = false;
                                for (var i=0; i<10; i++) {
                                    if ( Common.Utils.ThemeColor.ThemeValues[i] == this.SparkColor.effectValue ) {
                                        this.colorsSpark.select(this.SparkColor,true);
                                        isselected = true;
                                        break;
                                    }
                                }
                                if (!isselected) this.colorsSpark.clearSelection();
                            } else
                                this.colorsSpark.select(this.SparkColor,true);

                            this._state.SparkColor = this.SparkColor;
                        }
                    }

                    var point = props.asc_getMarkersPoint();
                    color = props.asc_getColorMarkers();
                    if ( this._state.MarkersPoint!==point ) {
                        this.chMarkersPoint.setValue((point !== null && point !== undefined) ? point : 'indeterminate', true);
                        this._state.MarkersPoint=point;
                        styleChanged = true;
                    }
                    this.chMarkersPoint.setDisabled(this._locked || this._state.SparkType!==Asc.c_oAscSparklineType.Line);
                    this.btnMarkersColor.setDisabled(this._locked || this._state.SparkType!==Asc.c_oAscSparklineType.Line);

                    if (color) {
                        this.MarkersColor = (color.asc_getType() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) ?
                            {color: Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB()), effectValue: color.asc_getValue() } :
                            Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB());

                        var type1 = typeof(this.MarkersColor),
                            type2 = typeof(this._state.MarkersColor);
                        if ( (type1 !== type2) || (type1=='object' && (this.MarkersColor.effectValue!==this._state.MarkersColor.effectValue || this._state.MarkersColor.color.indexOf(this.MarkersColor.color)<0)) ||
                            (type1!='object' && (this._state.MarkersColor.indexOf(this.MarkersColor)<0 || typeof(this.btnMarkersColor.color)=='object'))) {

                            this.btnMarkersColor.setColor(this.MarkersColor);
                            if ( typeof(this.MarkersColor) == 'object' ) {
                                var isselected = false;
                                for (var i=0; i<10; i++) {
                                    if ( Common.Utils.ThemeColor.ThemeValues[i] == this.MarkersColor.effectValue ) {
                                        this.colorsMarkers.select(this.MarkersColor,true);
                                        isselected = true;
                                        break;
                                    }
                                }
                                if (!isselected) this.colorsMarkers.clearSelection();
                            } else
                                this.colorsMarkers.select(this.MarkersColor,true);

                            this._state.MarkersColor = this.MarkersColor;
                            styleChanged = true;
                        }
                    }

                    point = props.asc_getHighPoint();
                    color = props.asc_getColorHigh();
                    if ( this._state.HighPoint!==point ) {
                        this.chHighPoint.setValue((point !== null && point !== undefined) ? point : 'indeterminate', true);
                        this._state.HighPoint=point;
                        styleChanged = true;
                    }
                    if (color) {
                        this.HighColor = (color.asc_getType() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) ?
                            {color: Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB()), effectValue: color.asc_getValue() } :
                            Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB());

                        var type1 = typeof(this.HighColor),
                            type2 = typeof(this._state.HighColor);
                        if ( (type1 !== type2) || (type1=='object' && (this.HighColor.effectValue!==this._state.HighColor.effectValue || this._state.HighColor.color.indexOf(this.HighColor.color)<0)) ||
                            (type1!='object' && (this._state.HighColor.indexOf(this.HighColor)<0 || typeof(this.btnHighColor.color)=='object'))) {

                            this.btnHighColor.setColor(this.HighColor);
                            if ( typeof(this.HighColor) == 'object' ) {
                                var isselected = false;
                                for (var i=0; i<10; i++) {
                                    if ( Common.Utils.ThemeColor.ThemeValues[i] == this.HighColor.effectValue ) {
                                        this.colorsHigh.select(this.HighColor,true);
                                        isselected = true;
                                        break;
                                    }
                                }
                                if (!isselected) this.colorsHigh.clearSelection();
                            } else
                                this.colorsHigh.select(this.HighColor,true);

                            this._state.HighColor = this.HighColor;
                            styleChanged = true;
                        }
                    }

                    point = props.asc_getLowPoint();
                    color = props.asc_getColorLow();
                    if ( this._state.LowPoint!==point ) {
                        this.chLowPoint.setValue((point !== null && point !== undefined) ? point : 'indeterminate', true);
                        this._state.LowPoint=point;
                        styleChanged = true;
                    }
                    if (color) {
                        this.LowColor = (color.asc_getType() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) ?
                            {color: Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB()), effectValue: color.asc_getValue() } :
                            Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB());

                        var type1 = typeof(this.LowColor),
                            type2 = typeof(this._state.LowColor);
                        if ( (type1 !== type2) || (type1=='object' && (this.LowColor.effectValue!==this._state.LowColor.effectValue || this._state.LowColor.color.indexOf(this.LowColor.color)<0)) ||
                            (type1!='object' && (this._state.LowColor.indexOf(this.LowColor)<0 || typeof(this.btnLowColor.color)=='object'))) {

                            this.btnLowColor.setColor(this.LowColor);
                            if ( typeof(this.LowColor) == 'object' ) {
                                var isselected = false;
                                for (var i=0; i<10; i++) {
                                    if ( Common.Utils.ThemeColor.ThemeValues[i] == this.LowColor.effectValue ) {
                                        this.colorsLow.select(this.LowColor,true);
                                        isselected = true;
                                        break;
                                    }
                                }
                                if (!isselected) this.colorsLow.clearSelection();
                            } else
                                this.colorsLow.select(this.LowColor,true);

                            this._state.LowColor = this.LowColor;
                            styleChanged = true;
                        }
                    }

                    point = props.asc_getFirstPoint();
                    color = props.asc_getColorFirst();
                    if ( this._state.FirstPoint!==point ) {
                        this.chFirstPoint.setValue((point !== null && point !== undefined) ? point : 'indeterminate', true);
                        this._state.FirstPoint=point;
                        styleChanged = true;
                    }
                    if (color) {
                        this.FirstColor = (color.asc_getType() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) ?
                            {color: Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB()), effectValue: color.asc_getValue() } :
                            Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB());

                        var type1 = typeof(this.FirstColor),
                            type2 = typeof(this._state.FirstColor);
                        if ( (type1 !== type2) || (type1=='object' && (this.FirstColor.effectValue!==this._state.FirstColor.effectValue || this._state.FirstColor.color.indexOf(this.FirstColor.color)<0)) ||
                            (type1!='object' && (this._state.FirstColor.indexOf(this.FirstColor)<0 || typeof(this.btnFirstColor.color)=='object'))) {

                            this.btnFirstColor.setColor(this.FirstColor);
                            if ( typeof(this.FirstColor) == 'object' ) {
                                var isselected = false;
                                for (var i=0; i<10; i++) {
                                    if ( Common.Utils.ThemeColor.ThemeValues[i] == this.FirstColor.effectValue ) {
                                        this.colorsFirst.select(this.FirstColor,true);
                                        isselected = true;
                                        break;
                                    }
                                }
                                if (!isselected) this.colorsFirst.clearSelection();
                            } else
                                this.colorsFirst.select(this.FirstColor,true);

                            this._state.FirstColor = this.FirstColor;
                            styleChanged = true;
                        }
                    }

                    point = props.asc_getLastPoint();
                    color = props.asc_getColorLast();
                    if ( this._state.LastPoint!==point ) {
                        this.chLastPoint.setValue((point !== null && point !== undefined) ? point : 'indeterminate', true);
                        this._state.LastPoint=point;
                        styleChanged = true;
                    }
                    if (color) {
                        this.LastColor = (color.asc_getType() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) ?
                            {color: Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB()), effectValue: color.asc_getValue() } :
                            Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB());

                        var type1 = typeof(this.LastColor),
                            type2 = typeof(this._state.LastColor);
                        if ( (type1 !== type2) || (type1=='object' && (this.LastColor.effectValue!==this._state.LastColor.effectValue || this._state.LastColor.color.indexOf(this.LastColor.color)<0)) ||
                            (type1!='object' && (this._state.LastColor.indexOf(this.LastColor)<0 || typeof(this.btnLastColor.color)=='object'))) {

                            this.btnLastColor.setColor(this.LastColor);
                            if ( typeof(this.LastColor) == 'object' ) {
                                var isselected = false;
                                for (var i=0; i<10; i++) {
                                    if ( Common.Utils.ThemeColor.ThemeValues[i] == this.LastColor.effectValue ) {
                                        this.colorsLast.select(this.LastColor,true);
                                        isselected = true;
                                        break;
                                    }
                                }
                                if (!isselected) this.colorsLast.clearSelection();
                            } else
                                this.colorsLast.select(this.LastColor,true);

                            this._state.LastColor = this.LastColor;
                            styleChanged = true;
                        }
                    }

                    point = props.asc_getNegativePoint();
                    color = props.asc_getColorNegative();
                    if ( this._state.NegativePoint!==point ) {
                        this.chNegativePoint.setValue((point !== null && point !== undefined) ? point : 'indeterminate', true);
                        this._state.NegativePoint=point;
                        styleChanged = true;
                    }
                    if (color) {
                        this.NegativeColor = (color.asc_getType() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) ?
                            {color: Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB()), effectValue: color.asc_getValue() } :
                            Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB());

                        var type1 = typeof(this.NegativeColor),
                            type2 = typeof(this._state.NegativeColor);
                        if ( (type1 !== type2) || (type1=='object' && (this.NegativeColor.effectValue!==this._state.NegativeColor.effectValue || this._state.NegativeColor.color.indexOf(this.NegativeColor.color)<0)) ||
                            (type1!='object' && (this._state.NegativeColor.indexOf(this.NegativeColor)<0 || typeof(this.btnNegativeColor.color)=='object'))) {

                            this.btnNegativeColor.setColor(this.NegativeColor);
                            if ( typeof(this.NegativeColor) == 'object' ) {
                                var isselected = false;
                                for (var i=0; i<10; i++) {
                                    if ( Common.Utils.ThemeColor.ThemeValues[i] == this.NegativeColor.effectValue ) {
                                        this.colorsNegative.select(this.NegativeColor,true);
                                        isselected = true;
                                        break;
                                    }
                                }
                                if (!isselected) this.colorsNegative.clearSelection();
                            } else
                                this.colorsNegative.select(this.NegativeColor,true);

                            this._state.NegativeColor = this.NegativeColor;
                            styleChanged = true;
                        }
                    }

                    if (styleChanged)
                        this.updateSparkStyles(props.asc_getStyles());
                }
            }
        },

        updateMetricUnit: function() {
            if (this.spinners) {
                for (var i=0; i<this.spinners.length; i++) {
                    var spinner = this.spinners[i];
                    spinner.setDefaultUnit(Common.Utils.Metric.getCurrentMetricName());
                    spinner.setStep(Common.Utils.Metric.getCurrentMetric()==Common.Utils.Metric.c_MetricUnits.pt ? 1 : 0.1);
                }
            }
        },

        UpdateThemeColors: function() {
            var defValue;
            if (!this.btnSparkColor) {
                defValue = this.defColor;

                this.btnSparkColor = new Common.UI.ColorButton({
                    style: "width:45px;",
                    menu        : new Common.UI.Menu({
                        items: [
                            { template: _.template('<div id="spark-color-menu" style="width: 169px; height: 220px; margin: 10px;"></div>') },
                            { template: _.template('<a id="spark-color-new" style="padding-left:12px;">' + this.textNewColor + '</a>') }
                        ]
                    })
                });
                this.btnSparkColor.render( $('#spark-color-btn'));
                this.btnSparkColor.setColor('000000');
                this.lockedControls.push(this.btnSparkColor);
                this.colorsSpark = new Common.UI.ThemeColorPalette({
                    el: $('#spark-color-menu'),
                    value: '000000'
                });
                this.colorsSpark.on('select', _.bind(this.onColorsSparkSelect, this));
                $(this.el).on('click', '#spark-color-new', _.bind(this.addNewColor, this, this.colorsSpark, this.btnSparkColor));

                this.btnHighColor = new Common.UI.ColorButton({
                    style: "width:45px;",
                    menu        : new Common.UI.Menu({
                        items: [
                            { template: _.template('<div id="spark-high-color-menu" style="width: 169px; height: 220px; margin: 10px;"></div>') },
                            { template: _.template('<a id="spark-high-color-new" style="padding-left:12px;">' + this.textNewColor + '</a>') }
                        ]
                    })
                }).render( $('#spark-high-color-btn'));
                this.btnHighColor.setColor(this.defColor.color);
                this.lockedControls.push(this.btnHighColor);
                this.colorsHigh = new Common.UI.ThemeColorPalette({ el: $('#spark-high-color-menu') });
                this.colorsHigh.on('select', _.bind(this.onColorsPointSelect, this, 0, this.btnHighColor));
                $(this.el).on('click', '#spark-high-color-new', _.bind(this.addNewColor, this, this.colorsHigh, this.btnHighColor));

                this.btnLowColor = new Common.UI.ColorButton({
                    style: "width:45px;",
                    menu        : new Common.UI.Menu({
                        items: [
                            { template: _.template('<div id="spark-low-color-menu" style="width: 169px; height: 220px; margin: 10px;"></div>') },
                            { template: _.template('<a id="spark-low-color-new" style="padding-left:12px;">' + this.textNewColor + '</a>') }
                        ]
                    })
                }).render( $('#spark-low-color-btn'));
                this.btnLowColor.setColor(this.defColor.color);
                this.lockedControls.push(this.btnLowColor);
                this.colorsLow = new Common.UI.ThemeColorPalette({ el: $('#spark-low-color-menu') });
                this.colorsLow.on('select', _.bind(this.onColorsPointSelect, this, 1, this.btnLowColor));
                $(this.el).on('click', '#spark-low-color-new', _.bind(this.addNewColor, this, this.colorsLow, this.btnLowColor));

                this.btnNegativeColor = new Common.UI.ColorButton({
                    style: "width:45px;",
                    menu        : new Common.UI.Menu({
                        items: [
                            { template: _.template('<div id="spark-negative-color-menu" style="width: 169px; height: 220px; margin: 10px;"></div>') },
                            { template: _.template('<a id="spark-negative-color-new" style="padding-left:12px;">' + this.textNewColor + '</a>') }
                        ]
                    })
                }).render( $('#spark-negative-color-btn'));
                this.btnNegativeColor.setColor(this.defColor.color);
                this.lockedControls.push(this.btnNegativeColor);
                this.colorsNegative = new Common.UI.ThemeColorPalette({ el: $('#spark-negative-color-menu') });
                this.colorsNegative.on('select', _.bind(this.onColorsPointSelect, this, 2, this.btnNegativeColor));
                $(this.el).on('click', '#spark-negative-color-new', _.bind(this.addNewColor, this, this.colorsNegative, this.btnNegativeColor));

                this.btnFirstColor = new Common.UI.ColorButton({
                    style: "width:45px;",
                    menu        : new Common.UI.Menu({
                        items: [
                            { template: _.template('<div id="spark-first-color-menu" style="width: 169px; height: 220px; margin: 10px;"></div>') },
                            { template: _.template('<a id="spark-first-color-new" style="padding-left:12px;">' + this.textNewColor + '</a>') }
                        ]
                    })
                }).render( $('#spark-first-color-btn'));
                this.lockedControls.push(this.btnFirstColor);
                this.colorsFirst = new Common.UI.ThemeColorPalette({ el: $('#spark-first-color-menu') });
                this.colorsFirst.on('select', _.bind(this.onColorsPointSelect, this, 3, this.btnFirstColor));
                $(this.el).on('click', '#spark-first-color-new', _.bind(this.addNewColor, this, this.colorsFirst, this.btnFirstColor));
                this.btnFirstColor.setColor(this.defColor.color);

                this.btnLastColor = new Common.UI.ColorButton({
                    style: "width:45px;",
                    menu        : new Common.UI.Menu({
                        items: [
                            { template: _.template('<div id="spark-last-color-menu" style="width: 169px; height: 220px; margin: 10px;"></div>') },
                            { template: _.template('<a id="spark-last-color-new" style="padding-left:12px;">' + this.textNewColor + '</a>') }
                        ]
                    })
                }).render( $('#spark-last-color-btn'));
                this.btnLastColor.setColor(this.defColor.color);
                this.lockedControls.push(this.btnLastColor);
                this.colorsLast = new Common.UI.ThemeColorPalette({ el: $('#spark-last-color-menu') });
                this.colorsLast.on('select', _.bind(this.onColorsPointSelect, this, 4, this.btnLastColor));
                $(this.el).on('click', '#spark-last-color-new', _.bind(this.addNewColor, this, this.colorsLast, this.btnLastColor));

                this.btnMarkersColor = new Common.UI.ColorButton({
                    style: "width:45px;",
                    menu        : new Common.UI.Menu({
                        items: [
                            { template: _.template('<div id="spark-markers-color-menu" style="width: 169px; height: 220px; margin: 10px;"></div>') },
                            { template: _.template('<a id="spark-markers-color-new" style="padding-left:12px;">' + this.textNewColor + '</a>') }
                        ]
                    })
                }).render( $('#spark-markers-color-btn'));
                this.btnMarkersColor.setColor(this.defColor.color);
                this.lockedControls.push(this.btnMarkersColor);
                this.colorsMarkers = new Common.UI.ThemeColorPalette({ el: $('#spark-markers-color-menu') });
                this.colorsMarkers.on('select', _.bind(this.onColorsPointSelect, this, 5, this.btnMarkersColor));
                $(this.el).on('click', '#spark-markers-color-new', _.bind(this.addNewColor, this, this.colorsMarkers, this.btnMarkersColor));

            }
            this.colorsSpark.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
            this.colorsHigh.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors(), defValue);
            this.colorsLow.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors(), defValue);
            this.colorsNegative.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors(), defValue);
            this.colorsFirst.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors(), defValue);
            this.colorsLast.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors(), defValue);
            this.colorsMarkers.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors(), defValue);
            this.btnSparkColor.setColor(this.colorsSpark.getColor());
            this.btnHighColor.setColor(this.colorsHigh.getColor());
            this.btnLowColor.setColor(this.colorsLow.getColor());
            this.btnNegativeColor.setColor(this.colorsNegative.getColor());
            this.btnFirstColor.setColor(this.colorsFirst.getColor());
            this.btnLastColor.setColor(this.colorsLast.getColor());
            this.btnMarkersColor.setColor(this.colorsMarkers.getColor());
        },

        createDelayedControls: function() {
            var me = this;

            // charts
            this.btnChartType = new Common.UI.Button({
                cls         : 'btn-large-dataview',
                iconCls     : 'item-chartlist bar-normal',
                menu        : new Common.UI.Menu({
                    style: 'width: 435px; padding-top: 12px;',
                    items: [
                        { template: _.template('<div id="id-chart-menu-type" class="menu-insertchart"  style="margin: 5px 5px 5px 10px;"></div>') }
                    ]
                })
            });

            this.btnChartType.on('render:after', function(btn) {
                me.mnuChartTypePicker = new Common.UI.DataView({
                    el: $('#id-chart-menu-type'),
                    parentMenu: btn.menu,
                    restoreHeight: 421,
                    groups: new Common.UI.DataViewGroupStore([
                        { id: 'menu-chart-group-bar',     caption: me.textColumn },
                        { id: 'menu-chart-group-line',    caption: me.textLine },
                        { id: 'menu-chart-group-pie',     caption: me.textPie },
                        { id: 'menu-chart-group-hbar',    caption: me.textBar },
                        { id: 'menu-chart-group-area',    caption: me.textArea, inline: true },
                        { id: 'menu-chart-group-scatter', caption: me.textPoint, inline: true },
                        { id: 'menu-chart-group-stock',   caption: me.textStock, inline: true }
                        // { id: 'menu-chart-group-surface', caption: me.textSurface}
                    ]),
                    store: new Common.UI.DataViewStore([
                        { group: 'menu-chart-group-bar',     type: Asc.c_oAscChartTypeSettings.barNormal,          iconCls: 'column-normal', selected: true},
                        { group: 'menu-chart-group-bar',     type: Asc.c_oAscChartTypeSettings.barStacked,         iconCls: 'column-stack'},
                        { group: 'menu-chart-group-bar',     type: Asc.c_oAscChartTypeSettings.barStackedPer,      iconCls: 'column-pstack'},
                        { group: 'menu-chart-group-bar',     type: Asc.c_oAscChartTypeSettings.barNormal3d,        iconCls: 'column-3d-normal'},
                        { group: 'menu-chart-group-bar',     type: Asc.c_oAscChartTypeSettings.barStacked3d,       iconCls: 'column-3d-stack'},
                        { group: 'menu-chart-group-bar',     type: Asc.c_oAscChartTypeSettings.barStackedPer3d,    iconCls: 'column-3d-pstack'},
                        { group: 'menu-chart-group-bar',     type: Asc.c_oAscChartTypeSettings.barNormal3dPerspective,    iconCls: 'column-3d-normal-per'},
                        { group: 'menu-chart-group-line',    type: Asc.c_oAscChartTypeSettings.lineNormal,         iconCls: 'line-normal'},
                        { group: 'menu-chart-group-line',    type: Asc.c_oAscChartTypeSettings.lineStacked,        iconCls: 'line-stack'},
                        { group: 'menu-chart-group-line',    type: Asc.c_oAscChartTypeSettings.lineStackedPer,     iconCls: 'line-pstack'},
                        { group: 'menu-chart-group-line',    type: Asc.c_oAscChartTypeSettings.line3d,             iconCls: 'line-3d'},
                        { group: 'menu-chart-group-pie',     type: Asc.c_oAscChartTypeSettings.pie,                iconCls: 'pie-normal'},
                        { group: 'menu-chart-group-pie',     type: Asc.c_oAscChartTypeSettings.doughnut,           iconCls: 'pie-doughnut'},
                        { group: 'menu-chart-group-pie',     type: Asc.c_oAscChartTypeSettings.pie3d,              iconCls: 'pie-3d-normal'},
                        { group: 'menu-chart-group-hbar',    type: Asc.c_oAscChartTypeSettings.hBarNormal,         iconCls: 'bar-normal'},
                        { group: 'menu-chart-group-hbar',    type: Asc.c_oAscChartTypeSettings.hBarStacked,        iconCls: 'bar-stack'},
                        { group: 'menu-chart-group-hbar',    type: Asc.c_oAscChartTypeSettings.hBarStackedPer,     iconCls: 'bar-pstack'},
                        { group: 'menu-chart-group-hbar',    type: Asc.c_oAscChartTypeSettings.hBarNormal3d,       iconCls: 'bar-3d-normal'},
                        { group: 'menu-chart-group-hbar',    type: Asc.c_oAscChartTypeSettings.hBarStacked3d,      iconCls: 'bar-3d-stack'},
                        { group: 'menu-chart-group-hbar',    type: Asc.c_oAscChartTypeSettings.hBarStackedPer3d,   iconCls: 'bar-3d-pstack'},
                        { group: 'menu-chart-group-area',    type: Asc.c_oAscChartTypeSettings.areaNormal,         iconCls: 'area-normal'},
                        { group: 'menu-chart-group-area',    type: Asc.c_oAscChartTypeSettings.areaStacked,        iconCls: 'area-stack'},
                        { group: 'menu-chart-group-area',    type: Asc.c_oAscChartTypeSettings.areaStackedPer,     iconCls: 'area-pstack'},
                        { group: 'menu-chart-group-scatter', type: Asc.c_oAscChartTypeSettings.scatter,            iconCls: 'point-normal'},
                        { group: 'menu-chart-group-stock',   type: Asc.c_oAscChartTypeSettings.stock,              iconCls: 'stock-normal'}
                        // { group: 'menu-chart-group-surface', type: Asc.c_oAscChartTypeSettings.surfaceNormal,      iconCls: 'surface-normal'},
                        // { group: 'menu-chart-group-surface', type: Asc.c_oAscChartTypeSettings.surfaceWireframe,   iconCls: 'surface-wireframe'},
                        // { group: 'menu-chart-group-surface', type: Asc.c_oAscChartTypeSettings.contourNormal,      iconCls: 'contour-normal'},
                        // { group: 'menu-chart-group-surface', type: Asc.c_oAscChartTypeSettings.contourWireframe,   iconCls: 'contour-wireframe'}
                    ]),
                    itemTemplate: _.template('<div id="<%= id %>" class="item-chartlist <%= iconCls %>"></div>')
                });
            });
            this.btnChartType.render($('#chart-button-type'));
            this.mnuChartTypePicker.on('item:click', _.bind(this.onSelectType, this, this.btnChartType));
            this.lockedControls.push(this.btnChartType);

            this.spnWidth = new Common.UI.MetricSpinner({
                el: $('#chart-spin-width'),
                step: .1,
                width: 78,
                defaultUnit : "cm",
                value: '3 cm',
                maxValue: 55.88,
                minValue: 0
            });
            this.spinners.push(this.spnWidth);
            this.lockedControls.push(this.spnWidth);

            this.spnHeight = new Common.UI.MetricSpinner({
                el: $('#chart-spin-height'),
                step: .1,
                width: 78,
                defaultUnit : "cm",
                value: '3 cm',
                maxValue: 55.88,
                minValue: 0
            });
            this.spinners.push(this.spnHeight);
            this.lockedControls.push(this.spnHeight);

            this.spnWidth.on('change', _.bind(this.onWidthChange, this));
            this.spnHeight.on('change', _.bind(this.onHeightChange, this));

            this.btnRatio = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'advanced-btn-ratio',
                style: 'margin-bottom: 1px;',
                enableToggle: true,
                hint: this.textKeepRatio
            });
            this.btnRatio.render($('#chart-button-ratio')) ;
            this.lockedControls.push(this.btnRatio);

            this.btnRatio.on('click', _.bind(function(btn, e) {
                if (btn.pressed && this.spnHeight.getNumberValue()>0) {
                    this._nRatio = this.spnWidth.getNumberValue()/this.spnHeight.getNumberValue();
                }
                if (this.api)  {
                    var props = new Asc.asc_CImgProperty();
                    props.asc_putLockAspect(btn.pressed);
                    this.api.asc_setGraphicObjectProps(props);
                }
            }, this));

            // sparks
            this.btnSparkType = new Common.UI.Button({
                cls         : 'btn-large-dataview',
                iconCls     : 'item-chartlist spark-column',
                menu        : new Common.UI.Menu({
                    style: 'width: 200px; padding-top: 12px;',
                    items: [
                        { template: _.template('<div id="id-spark-menu-type" class="menu-insertchart"  style="margin: 5px 5px 0 10px;"></div>') }
                    ]
                })
            });
            this.btnSparkType.on('render:after', function(btn) {
                me.mnuSparkTypePicker = new Common.UI.DataView({
                    el: $('#id-spark-menu-type'),
                    parentMenu: btn.menu,
                    restoreHeight: 120,
                    allowScrollbar: false,
                    groups: new Common.UI.DataViewGroupStore([
                        { id: 'menu-chart-group-sparkcolumn', inline: true },
                        { id: 'menu-chart-group-sparkline', inline: true },
                        { id: 'menu-chart-group-sparkwin', inline: true }
                    ]),
                    store: new Common.UI.DataViewStore([
                        { group: 'menu-chart-group-sparkcolumn',   type: Asc.c_oAscSparklineType.Column,    allowSelected: true, iconCls: 'spark-column', tip: me.textColumnSpark},
                        { group: 'menu-chart-group-sparkline',     type: Asc.c_oAscSparklineType.Line,      allowSelected: true, iconCls: 'spark-line',   tip: me.textLineSpark},
                        { group: 'menu-chart-group-sparkwin',      type: Asc.c_oAscSparklineType.Stacked,   allowSelected: true, iconCls: 'spark-win',    tip: me.textWinLossSpark}
                    ]),
                    itemTemplate: _.template('<div id="<%= id %>" class="item-chartlist <%= iconCls %>"></div>')
                });
            });
            this.btnSparkType.render($('#spark-button-type'));
            this.mnuSparkTypePicker.on('item:click', _.bind(this.onSelectSparkType, this, this.btnSparkType));
            this.lockedControls.push(this.btnSparkType);

            this.cmbBorderSize = new Common.UI.ComboBorderSizeEditable({
                el          : $('#spark-combo-line-type'),
                style       : 'width: 90px;',
                allowNoBorders: false
            }).on('selected', _.bind(this.onBorderSizeSelect, this))
            .on('changed:before', _.bind(this.onBorderSizeChanged, this, true))
            .on('changed:after',  _.bind(this.onBorderSizeChanged, this, false));
            this.BorderSize = this.cmbBorderSize.store.at(1).get('value');
            this.cmbBorderSize.setValue(this.BorderSize);
            this.lockedControls.push(this.cmbBorderSize);

            this.chHighPoint = new Common.UI.CheckBox({
                el: $('#spark-checkbox-high'),
                labelText: this.textHighPoint
            });
            this.lockedControls.push(this.chHighPoint);
            this.chPoints.push(this.chHighPoint);
            this.chLowPoint = new Common.UI.CheckBox({
                el: $('#spark-checkbox-low'),
                labelText: this.textLowPoint
            });
            this.lockedControls.push(this.chLowPoint);
            this.chPoints.push(this.chLowPoint);
            this.chNegativePoint = new Common.UI.CheckBox({
                el: $('#spark-checkbox-negative'),
                labelText: this.textNegativePoint
            });
            this.lockedControls.push(this.chNegativePoint);
            this.chPoints.push(this.chNegativePoint);
            this.chFirstPoint = new Common.UI.CheckBox({
                el: $('#spark-checkbox-first'),
                labelText: this.textFirstPoint
            });
            this.lockedControls.push(this.chFirstPoint);
            this.chPoints.push(this.chFirstPoint);
            this.chLastPoint = new Common.UI.CheckBox({
                el: $('#spark-checkbox-last'),
                labelText: this.textLastPoint
            });
            this.lockedControls.push(this.chLastPoint);
            this.chPoints.push(this.chLastPoint);
            this.chMarkersPoint = new Common.UI.CheckBox({
                el: $('#spark-checkbox-markers'),
                labelText: this.textMarkers
            });
            this.lockedControls.push(this.chMarkersPoint);
            this.chPoints.push(this.chMarkersPoint);

            this.chHighPoint.on('change', _.bind(this.onCheckPointChange, this, 0));
            this.chLowPoint.on('change', _.bind(this.onCheckPointChange, this, 1));
            this.chNegativePoint.on('change', _.bind(this.onCheckPointChange, this, 2));
            this.chFirstPoint.on('change', _.bind(this.onCheckPointChange, this, 3));
            this.chLastPoint.on('change', _.bind(this.onCheckPointChange, this, 4));
            this.chMarkersPoint.on('change', _.bind(this.onCheckPointChange, this, 5));

            this.btnSelectData = new Common.UI.Button({
                el: $('#chart-btn-select-data')
            });
            this.btnSelectData.on('click', _.bind(this.onSelectData, this));
            this.lockedControls.push(this.btnSelectData);

            this.linkAdvanced = $('#chart-advanced-link');
            $(this.el).on('click', '#chart-advanced-link', _.bind(this.openAdvancedSettings, this));
        },

        createDelayedElements: function() {
            this.createDelayedControls();
            this.updateMetricUnit();
            this.UpdateThemeColors();
            this._initSettings = false;
        },

        ShowHideElem: function(isChart) {
            this.ChartSizeContainer.toggleClass('settings-hidden', !isChart);
            this.ChartTypesContainer.toggleClass('settings-hidden', !isChart);
            this.SparkTypesContainer.toggleClass('settings-hidden', isChart);
            this.SparkPointsContainer.toggleClass('settings-hidden', isChart);
        },

        onWidthChange: function(field, newValue, oldValue, eOpts){
            var w = field.getNumberValue();
            var h = this.spnHeight.getNumberValue();
            if (this.btnRatio.pressed) {
                h = w/this._nRatio;
                if (h>this.spnHeight.options.maxValue) {
                    h = this.spnHeight.options.maxValue;
                    w = h * this._nRatio;
                    this.spnWidth.setValue(w, true);
                }
                this.spnHeight.setValue(h, true);
            }
            if (this.api)  {
                var props = new Asc.asc_CImgProperty();
                props.asc_putWidth(Common.Utils.Metric.fnRecalcToMM(w));
                props.asc_putHeight(Common.Utils.Metric.fnRecalcToMM(h));
                this.api.asc_setGraphicObjectProps(props);
            }

            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onHeightChange: function(field, newValue, oldValue, eOpts){
            var h = field.getNumberValue(), w = this.spnWidth.getNumberValue();
            if (this.btnRatio.pressed) {
                w = h * this._nRatio;
                if (w>this.spnWidth.options.maxValue) {
                    w = this.spnWidth.options.maxValue;
                    h = w/this._nRatio;
                    this.spnHeight.setValue(h, true);
                }
                this.spnWidth.setValue(w, true);
            }
            if (this.api)  {
                var props = new Asc.asc_CImgProperty();
                props.asc_putWidth(Common.Utils.Metric.fnRecalcToMM(w));
                props.asc_putHeight(Common.Utils.Metric.fnRecalcToMM(h));
                this.api.asc_setGraphicObjectProps(props);
            }

            Common.NotificationCenter.trigger('edit:complete', this);
        },

        openAdvancedSettings:   function() {
            if (this.linkAdvanced.hasClass('disabled')) return;

            var me = this;
            var win, props;
            if (me.api){
                props = (me.isChart) ? me.api.asc_getChartObject() : me._originalProps;
                if (props) {
                    (new SSE.Views.ChartSettingsDlg(
                        {
                            chartSettings: props,
                            imageSettings: (me.isChart) ? me._originalProps : null,
                            sparklineStyles: me.sparklineStyles,
                            isChart: me.isChart,
                            api: me.api,
                            handler: function(result, value) {
                                if (result == 'ok') {
                                    if (me.api) {
                                        if (me.isChart) {
                                            me.api.asc_editChartDrawingObject(value.chartSettings);
                                            if (value.imageSettings)
                                                me.api.asc_setGraphicObjectProps(value.imageSettings);
                                        } else
                                            me.api.asc_setSparklineGroup(me._state.SparkId, value.chartSettings);
                                    }
                                }
                                Common.NotificationCenter.trigger('edit:complete', me);
                            }
                        })).show();
                }
            }
        },

        onSelectData: function() {
            var me = this;
            if (me.api) {
                var props = me.api.asc_getChartObject(),
                    handlerDlg = function(dlg, result) {
                        if (result == 'ok') {
                            props.putRange(dlg.getSettings());
                            me.api.asc_setSelectionDialogMode(Asc.c_oAscSelectionDialogType.None);
                            me.api.asc_editChartDrawingObject(props);
                        }

                        Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                    },
                    validation = function(value) {
                        var isvalid;
                        if (!_.isEmpty(value)) {
                            isvalid = me.api.asc_checkDataRange(Asc.c_oAscSelectionDialogType.Chart, value, true, !props.getInColumns(), me._state.ChartType);
                            if (isvalid == Asc.c_oAscError.ID.No)
                                return true;
                        } else return '';

                        if (isvalid == Asc.c_oAscError.ID.StockChartError) {
                            return this.errorStockChart;
                        } else if (isvalid == Asc.c_oAscError.ID.MaxDataSeriesError) {
                            return this.errorMaxRows;
                        }
                        return this.txtInvalidRange;
                    };

                var win = new SSE.Views.CellRangeDialog({
                    handler: handlerDlg
                });

                win.show();
                win.setSettings({
                    api     : me.api,
                    range   : props.getRange(),
                    validation: validation,
                    type    : Asc.c_oAscSelectionDialogType.Chart
                });
            }
        },
        
        onSelectType: function(btn, picker, itemView, record) {
            if (this._noApply) return;

            var rawData = {},
                isPickerSelect = _.isFunction(record.toJSON);

            if (isPickerSelect){
                if (record.get('selected')) {
                    rawData = record.toJSON();
                } else {
                    // record deselected
                    return;
                }
            } else {
                rawData = record;
            }

            this.btnChartType.setIconCls('item-chartlist ' + rawData.iconCls);
            this._state.ChartType = -1;

            if (this.api && !this._noApply && this.chartProps) {
                var props = new Asc.asc_CImgProperty();
                this.chartProps.changeType(rawData.type);
                props.asc_putChartProperties(this.chartProps);
                this.api.asc_setGraphicObjectProps(props);
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onSelectStyle: function(combo, record) {
            if (this._noApply) return;

            if (this.api && !this._noApply && this.chartProps) {
                var props = new Asc.asc_CImgProperty();
                this.chartProps.putStyle(record.get('data'));
                props.asc_putChartProperties(this.chartProps);
                this.api.asc_setGraphicObjectProps(props);
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        _onUpdateChartStyles: function() {
            if (this.api && this._state.ChartType!==null && this._state.ChartType>-1)
                this.updateChartStyles(this.api.asc_getChartPreviews(this._state.ChartType));
        },

        updateChartStyles: function(styles) {
            var me = this;
            this._isChartStylesChanged = true;

            if (!this.cmbChartStyle) {
                this.cmbChartStyle = new Common.UI.ComboDataView({
                    itemWidth: 50,
                    itemHeight: 50,
                    menuMaxHeight: 270,
                    enableKeyEvents: true,
                    cls: 'combo-chart-style'
                });
                this.cmbChartStyle.render($('#chart-combo-style'));
                this.cmbChartStyle.openButton.menu.cmpEl.css({
                    'min-width': 178,
                    'max-width': 178
                });
                this.cmbChartStyle.on('click', _.bind(this.onSelectStyle, this));
                this.cmbChartStyle.openButton.menu.on('show:after', function () {
                    me.cmbChartStyle.menuPicker.scroller.update({alwaysVisibleY: true});
                });
                this.lockedControls.push(this.cmbChartStyle);
            }

            if (styles && styles.length>0){
                var stylesStore = this.cmbChartStyle.menuPicker.store;
                if (stylesStore) {
                    var count = stylesStore.length;
                    if (count>0 && count==styles.length) {
                        var data = stylesStore.models;
                        _.each(styles, function(style, index){
                            data[index].set('imageUrl', style.asc_getImageUrl());
                        });
                    } else {
                        var stylearray = [],
                            selectedIdx = -1;
                        _.each(styles, function(item, index){
                            stylearray.push({
                                imageUrl: item.asc_getImageUrl(),
                                data    : item.asc_getStyle(),
                                tip     : me.textStyle + ' ' + item.asc_getStyle()
                            });
                        });
                        stylesStore.reset(stylearray, {silent: false});
                    }
                }
            }
        },
        
        updateSparkStyles: function(styles) {
            var me = this;

            if (!this.cmbSparkStyle) {
                this.cmbSparkStyle = new Common.UI.ComboDataView({
                    itemWidth: 50,
                    itemHeight: 50,
                    menuMaxHeight: 272,
                    enableKeyEvents: true,
                    cls: 'combo-spark-style'
                });
                this.cmbSparkStyle.render($('#spark-combo-style'));
                this.cmbSparkStyle.openButton.menu.cmpEl.css({
                    'min-width': 178,
                    'max-width': 178
                });
                this.cmbSparkStyle.on('click', _.bind(this.onSelectSparkStyle, this));
                this.cmbSparkStyle.openButton.menu.on('show:after', function () {
                    me.cmbSparkStyle.menuPicker.scroller.update({alwaysVisibleY: true});
                });
                this.lockedControls.push(this.cmbSparkStyle);
            }

            if (styles && styles.length>1){
                var stylesStore = this.cmbSparkStyle.menuPicker.store,
                    selectedIdx = styles[styles.length-1];
                this.sparklineStyles = styles;
                if (stylesStore.length == styles.length-1) {
                    var data = stylesStore.models;
                    for (var i=0; i<styles.length-1; i++) {
                        data[i].set('imageUrl', styles[i]);
                    }
                    if (selectedIdx<0) {
                        this.cmbSparkStyle.fillComboView(stylesStore.at(0), false);
                        this.cmbSparkStyle.fieldPicker.deselectAll();
                        this.cmbSparkStyle.menuPicker.deselectAll();
                    } else
                        this.cmbSparkStyle.menuPicker.selectRecord(stylesStore.at(selectedIdx));
                } else {
                    var stylearray = [];
                    for (var i=0; i<styles.length-1; i++) {
                        stylearray.push({
                            imageUrl: styles[i],
                            data    : i
                        });
                    }
                    stylesStore.reset(stylearray, {silent: false});
                    this.cmbSparkStyle.fillComboView(stylesStore.at(selectedIdx<0 ? 0 : selectedIdx), selectedIdx>-1);
                }
            }
        },

        onSelectSparkType: function(btn, picker, itemView, record) {
            var rawData = {},
                isPickerSelect = _.isFunction(record.toJSON);

            if (isPickerSelect){
                if (record.get('selected')) {
                    rawData = record.toJSON();
                } else {
                    // record deselected
                    return;
                }
            } else {
                rawData = record;
            }

            this.btnSparkType.setIconCls('item-chartlist ' + rawData.iconCls);
            this._state.SparkType = -1;

            if (this.api && !this._noApply && this._originalProps) {
                var props = new Asc.sparklineGroup();
                props.asc_setType(rawData.type);
                this.api.asc_setSparklineGroup(this._state.SparkId, props);
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onSelectSparkStyle: function(combo, record) {
            if (this._noApply) return;

            if (this.api && !this._noApply && this._originalProps) {
                var props = new Asc.sparklineGroup();
                props.asc_setStyle(record.get('data'));
                this.api.asc_setSparklineGroup(this._state.SparkId, props);
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },
        
        applyBorderSize: function(value) {
            value = parseFloat(value);
            value = isNaN(value) ? 1 : Math.max(0.01, Math.min(1584, value));

            this.BorderSize = value;
            if (this.api && !this._noApply && this._originalProps) {
                var props = new Asc.sparklineGroup();
                props.asc_setLineWeight(this.BorderSize);
                this.api.asc_setSparklineGroup(this._state.SparkId, props);
                Common.NotificationCenter.trigger('edit:complete', this);
            }
        },

        onBorderSizeChanged: function(before, combo, record, e) {
            var me = this;
            if (before) {
                var value = parseFloat(record.value),
                    expr = new RegExp('^\\s*(\\d*(\\.|,)?\\d+)\\s*(' + me.txtPt + ')?\\s*$');
                if (!(expr.exec(record.value)) || value<0.01 || value>1584) {
                    this._state.LineWeight = -1;
                    Common.UI.error({
                        msg: this.textBorderSizeErr,
                        callback: function() {
                            _.defer(function(btn) {
                                Common.NotificationCenter.trigger('edit:complete', me);
                            })
                        }
                    });
                }
            } else
                this.applyBorderSize(record.value);
        },

        onBorderSizeSelect: function(combo, record) {
            this.applyBorderSize(record.value);
        },

        onColorsSparkSelect: function(picker, color) {
            this.btnSparkColor.setColor(color);
            if (this.api && !this._noApply && this._originalProps) {
                var props = new Asc.sparklineGroup();
                props.asc_setColorSeries(Common.Utils.ThemeColor.getRgbColor(color));
                this.api.asc_setSparklineGroup(this._state.SparkId, props);
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        addNewColor: function(picker, btn) {
            picker.addNewColor((typeof(btn.color) == 'object') ? btn.color.color : btn.color);
        },

        onCheckPointChange: function(type, field, newValue, oldValue, eOpts) {
            if (this.api && !this._noApply && this._originalProps) {
                var props = new Asc.sparklineGroup();
                switch (type) {
                    case 0:
                        props.asc_setHighPoint(field.getValue()=='checked');
                    break;
                    case 1:
                        props.asc_setLowPoint(field.getValue()=='checked');
                    break;
                    case 2:
                        props.asc_setNegativePoint(field.getValue()=='checked');
                    break;
                    case 3:
                        props.asc_setFirstPoint(field.getValue()=='checked');
                    break;
                    case 4:
                        props.asc_setLastPoint(field.getValue()=='checked');
                    break;
                    case 5:
                        props.asc_setMarkersPoint(field.getValue()=='checked');
                    break;
                }
                this.api.asc_setSparklineGroup(this._state.SparkId, props);
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onColorsPointSelect: function(type, btn, picker, color) {
            btn.setColor(color);
            if (this.chPoints[type].getValue() !== 'checked')
                this.chPoints[type].setValue(true, true);
            if (this.api && !this._noApply && this._originalProps) {
                var props = new Asc.sparklineGroup();
                switch (type) {
                    case 0:
                        props.asc_setHighPoint(true);
                        props.asc_setColorHigh(Common.Utils.ThemeColor.getRgbColor(color));
                    break;
                    case 1:
                        props.asc_setLowPoint(true);
                        props.asc_setColorLow(Common.Utils.ThemeColor.getRgbColor(color));
                    break;
                    case 2:
                        props.asc_setNegativePoint(true);
                        props.asc_setColorNegative(Common.Utils.ThemeColor.getRgbColor(color));
                    break;
                    case 3:
                        props.asc_setFirstPoint(true);
                        props.asc_setColorFirst(Common.Utils.ThemeColor.getRgbColor(color));
                    break;
                    case 4:
                        props.asc_setLastPoint(true);
                        props.asc_setColorLast(Common.Utils.ThemeColor.getRgbColor(color));
                    break;
                    case 5:
                        props.asc_setMarkersPoint(true);
                        props.asc_setColorMarkers(Common.Utils.ThemeColor.getRgbColor(color));
                    break;
                }
                this.api.asc_setSparklineGroup(this._state.SparkId, props);
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },
        
        setLocked: function (locked) {
            this._locked = locked;
        },

        disableControls: function(disable) {
            if (this._initSettings) return;
            
            if (this._state.DisabledControls!==disable) {
                this._state.DisabledControls = disable;
                _.each(this.lockedControls, function(item) {
                    item.setDisabled(disable);
                });
                this.linkAdvanced.toggleClass('disabled', disable);
            }
        },

        textKeepRatio: 'Constant Proportions',
        textSize:       'Size',
        textWidth:      'Width',
        textHeight:     'Height',
        textEditData: 'Edit Data and Location',
        textChartType: 'Change Chart Type',
        textLine:           'Line',
        textColumn:         'Column',
        textBar:            'Bar',
        textArea:           'Area',
        textPie:            'Pie',
        textPoint:          'XY (Scatter)',
        textStock:          'Stock',
        textStyle:          'Style',
        textAdvanced:       'Show advanced settings',
        strSparkColor:      'Color',
        strLineWeight:      'Line Weight',
        textMarkers:        'Markers',
        textNewColor: 'Add New Custom Color',
        textLineSpark:      'Line',
        textColumnSpark:    'Column',
        textWinLossSpark:   'Win/Loss',
        textHighPoint: 'High Point',
        textLowPoint: 'Low Point',
        textNegativePoint: 'Negative Point',
        textFirstPoint: 'First Point',
        textLastPoint: 'Last Point',
        strTemplate: 'Template',
        textShow: 'Show',
        textType:           'Type',
        textSelectData: 'Select Data',
        textRanges: 'Data Range',
        textBorderSizeErr: 'The entered value is incorrect.<br>Please enter a value between 0 pt and 1584 pt.',
        textSurface: 'Surface'

    }, SSE.Views.ChartSettings || {}));
});