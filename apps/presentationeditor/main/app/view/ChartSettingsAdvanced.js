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
 *  ChartSettingsAdvanced.js
 *
 *  Created on 1/18/17
 *
 */

define([
    'text!presentationeditor/main/app/template/ChartSettingsAdvanced.template',
    'text!common/main/lib/template/ChartVertAxis.template',
    'text!common/main/lib/template/ChartHorAxis.template',
    'common/main/lib/view/AdvancedSettingsWindow'
], function (contentTemplate, vertTemplate, horTemplate) {
    'use strict';

    PE.Views.ChartSettingsAdvanced = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 340,
            contentHeight: 450,
            toggleGroup: 'chart-adv-settings-group',
            properties: null,
            chartSettings: null,
            storageName: 'pe-chart-settings-adv-category',
            sizeMax: {width: 55.88, height: 55.88},
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle,
                items: [
                    {panelId: 'id-adv-chart-general',  panelCaption: this.textGeneral},
                    {panelId: 'id-chart-settings-dlg-layout',       panelCaption: this.textLayout},
                    {panelId: 'id-chart-settings-dlg-vert',         panelCaption: this.textVertAxis},
                    {panelId: 'id-chart-settings-dlg-vert-sec',     panelCaption: this.textVertAxisSec},
                    {panelId: 'id-chart-settings-dlg-hor',          panelCaption: this.textHorAxis},
                    {panelId: 'id-chart-settings-dlg-hor-sec',      panelCaption: this.textHorAxisSec},
                    {panelId: 'id-adv-chart-placement',  panelCaption: this.textPlacement},
                    {panelId: 'id-adv-chart-alttext',    panelCaption: this.textAlt}
                ],
                contentTemplate: _.template(contentTemplate)({
                    scope: this
                })
            }, options);
            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);

            this.spinners = [];

            this.currentChartType = Asc.c_oAscChartTypeSettings.barNormal;
            this.chartSettings = this.options.chartSettings;
            this.vertAxisProps = [];
            this.vertAxisPropsIndexes = [];
            this.horAxisProps = [];
            this.horAxisPropsIndexes = [];
            this.currentAxisProps = [];

            this.api = this.options.api;
            this._originalProps = this.options.chartProps;
            this.slideSize = this.options.slideSize;
            this._changedProps = null;
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);

            var me = this;

            // General

            this.inputChartName = new Common.UI.InputField({
                el          : $('#chart-advanced-name'),
                allowBlank  : true,
                validateOnBlur: false,
                style       : 'width: 100%;'
            }).on('changed:after', function() {
                me.isChartNameChanged = true;
            });

            // Placement

            this.spnWidth = new Common.UI.MetricSpinner({
                el: $('#chart-advanced-spin-width'),
                step: .1,
                width: 85,
                defaultUnit : "cm",
                value: '3 cm',
                maxValue: 55.88,
                minValue: 0
            });
            this.spnWidth.on('change', _.bind(function(field){
                if (this.btnRatio.pressed) {
                    var w = field.getNumberValue();
                    var h = w/this._nRatio;
                    if (h>this.sizeMax.height) {
                        h = this.sizeMax.height;
                        w = h * this._nRatio;
                        this.spnWidth.setValue(w, true);
                    }
                    this.spnHeight.setValue(h, true);
                }
                if (this._changedProps) {
                    this._changedProps.put_Width(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                    this._changedProps.put_Height(Common.Utils.Metric.fnRecalcToMM(this.spnHeight.getNumberValue()));
                }
            }, this));
            this.spinners.push(this.spnWidth);

            this.spnHeight = new Common.UI.MetricSpinner({
                el: $('#chart-advanced-spin-height'),
                step: .1,
                width: 85,
                defaultUnit : "cm",
                value: '3 cm',
                maxValue: 55.88,
                minValue: 0
            });
            this.spnHeight.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                var h = field.getNumberValue(), w = null;
                if (this.btnRatio.pressed) {
                    w = h * this._nRatio;
                    if (w>this.sizeMax.width) {
                        w = this.sizeMax.width;
                        h = w/this._nRatio;
                        this.spnHeight.setValue(h, true);
                    }
                    this.spnWidth.setValue(w, true);
                }
                if (this._changedProps) {
                    this._changedProps.put_Height(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                    this._changedProps.put_Width(Common.Utils.Metric.fnRecalcToMM(this.spnWidth.getNumberValue()));
                }
            }, this));
            this.spinners.push(this.spnHeight);

            this.btnRatio = new Common.UI.Button({
                parentEl: $('#chart-advanced-button-ratio'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-advanced-ratio',
                style: 'margin-bottom: 1px;',
                enableToggle: true,
                hint: this.textKeepRatio
            });
            this.btnRatio.on('click', _.bind(function(btn, e) {
                if (btn.pressed && this.spnHeight.getNumberValue()>0) {
                    this._nRatio = this.spnWidth.getNumberValue()/this.spnHeight.getNumberValue();
                }
                if (this._changedProps) {
                    this._changedProps.asc_putLockAspect(btn.pressed);
                }
            }, this));

            this.spnX = new Common.UI.MetricSpinner({
                el: $('#chart-advanced-spin-x'),
                step: .1,
                width: 85,
                defaultUnit : "cm",
                defaultValue : 0,
                value: '0 cm',
                maxValue: 55.87,
                minValue: -55.87
            });
            this.spinners.push(this.spnX);

            this.spnY = new Common.UI.MetricSpinner({
                el: $('#chart-advanced-spin-y'),
                step: .1,
                width: 85,
                defaultUnit : "cm",
                defaultValue : 0,
                value: '0 cm',
                maxValue: 55.87,
                minValue: -55.87
            });
            this.spinners.push(this.spnY);

            this.cmbFromX = new Common.UI.ComboBox({
                el: $('#chart-advanced-combo-from-x'),
                cls: 'input-group-nr',
                style: "width: 125px;",
                menuStyle: 'min-width: 125px;',
                data: [
                    { value: 'left', displayValue: this.textTopLeftCorner },
                    { value: 'center', displayValue: this.textCenter }
                ],
                editable: false,
                takeFocusOnClose: true
            });

            this.cmbFromY = new Common.UI.ComboBox({
                el: $('#chart-advanced-combo-from-y'),
                cls: 'input-group-nr',
                style: "width: 125px;",
                menuStyle: 'min-width: 125px;',
                data: [
                    { value: 'left', displayValue: this.textTopLeftCorner },
                    { value: 'center', displayValue: this.textCenter }
                ],
                editable: false,
                takeFocusOnClose: true
            });

            // Alt Text

            this.inputAltTitle = new Common.UI.InputField({
                el          : $('#chart-advanced-alt-title'),
                allowBlank  : true,
                validateOnBlur: false,
                style       : 'width: 100%;'
            }).on('changed:after', function() {
                me.isAltTitleChanged = true;
            });

            this.textareaAltDescription = this.$window.find('textarea');
            this.textareaAltDescription.keydown(function (event) {
                if (event.keyCode == Common.UI.Keys.RETURN) {
                    event.stopPropagation();
                }
                me.isAltDescChanged = true;
            });

            // Chart
            this.cmbChartTitle = new Common.UI.ComboBox({
                el: $('#chart-dlg-combo-chart-title'),
                menuStyle: 'min-width: 100%;',
                editable: false,
                cls: 'input-group-nr',
                data: [
                    {value: Asc.c_oAscChartTitleShowSettings.none, displayValue: this.textNone},
                    {value: Asc.c_oAscChartTitleShowSettings.overlay, displayValue: this.textOverlay},
                    {value: Asc.c_oAscChartTitleShowSettings.noOverlay, displayValue: this.textNoOverlay}
                ],
                takeFocusOnClose: true
            });

            this.cmbLegendPos = new Common.UI.ComboBox({
                el: $('#chart-dlg-combo-legend-pos'),
                menuStyle: 'min-width: 100%;',
                editable: false,
                cls: 'input-group-nr',
                data: [
                    {value: Asc.c_oAscChartLegendShowSettings.none, displayValue: this.textNone},
                    {value: Asc.c_oAscChartLegendShowSettings.bottom, displayValue: this.textLegendBottom},
                    {value: Asc.c_oAscChartLegendShowSettings.top, displayValue: this.textLegendTop},
                    {value: Asc.c_oAscChartLegendShowSettings.right, displayValue: this.textLegendRight},
                    {value: Asc.c_oAscChartLegendShowSettings.left, displayValue: this.textLegendLeft},
                    {value: Asc.c_oAscChartLegendShowSettings.leftOverlay, displayValue: this.textLeftOverlay},
                    {value: Asc.c_oAscChartLegendShowSettings.rightOverlay, displayValue: this.textRightOverlay}
                ],
                takeFocusOnClose: true
            });

            this.cmbDataLabels = new Common.UI.ComboBox({
                el: $('#chart-dlg-combo-data-labels'),
                menuStyle: 'min-width: 100%;',
                editable: false,
                cls: 'input-group-nr',
                data: [
                    {value: Asc.c_oAscChartDataLabelsPos.none, displayValue: this.textNone},
                    {value: Asc.c_oAscChartDataLabelsPos.ctr, displayValue: this.textCenter},
                    {value: Asc.c_oAscChartDataLabelsPos.inBase, displayValue: this.textInnerBottom},
                    {value: Asc.c_oAscChartDataLabelsPos.inEnd, displayValue: this.textInnerTop},
                    {value: Asc.c_oAscChartDataLabelsPos.outEnd, displayValue: this.textOuterTop}
                ],
                takeFocusOnClose: true
            });

            this.cmbDataLabels.on('selected', _.bind(me.onSelectDataLabels, this));

            this.txtSeparator = new Common.UI.InputField({
                el: $('#chart-dlg-txt-separator'),
                name: 'range',
                style: 'width: 100%;',
                allowBlank: true,
                blankError: this.txtEmpty
            });

            this.chSeriesName = new Common.UI.CheckBox({
                el: $('#chart-dlg-check-series'),
                labelText: this.textSeriesName
            });

            this.chCategoryName = new Common.UI.CheckBox({
                el: $('#chart-dlg-check-category'),
                labelText: this.textCategoryName
            });

            this.chValue = new Common.UI.CheckBox({
                el: $('#chart-dlg-check-value'),
                labelText: this.textValue
            });

            this.cmbLines = new Common.UI.ComboBox({
                el: $('#chart-dlg-combo-lines'),
                menuStyle: 'min-width: 100%;',
                editable: false,
                cls: 'input-group-nr',
                data: [
                    {value: 0, displayValue: this.textNone},
                    {value: 1, displayValue: this.textStraight},
                    {value: 2, displayValue: this.textSmooth}
                ],
                takeFocusOnClose: true
            }).on('selected', _.bind(function (combo, record) {
                if (this.chartSettings) {
                    this.chartSettings.putLine(record.value !== 0);
                    if (record.value > 0)
                        this.chartSettings.putSmooth(record.value == 2);
                }
            }, this));

            this.chMarkers = new Common.UI.CheckBox({
                el: $('#chart-dlg-check-markers'),
                labelText: this.textMarkers
            }).on('change', _.bind(function (checkbox, state) {
                if (this.chartSettings)
                    this.chartSettings.putShowMarker(state == 'checked');
            }, this));

            this.lblLines = $('#chart-dlg-label-lines');

            // Vertical Axis
            this.cmbMinType = [];
            this.spnMinValue = [];
            this.cmbMaxType = [];
            this.spnMaxValue = [];
            this.cmbVCrossType = [];
            this.spnVAxisCrosses = [];
            this.cmbUnits = [];
            this.chVReverse = [];
            this.cmbVMajorType = [];
            this.cmbVMinorType = [];
            this.cmbVLabelPos = [];
            this.cmbVertTitle = [];
            this.cmbVertGrid = [];
            this.chVertHide = [];
            this.btnVFormat = [];
            this.chVLogScale = [];
            this.spnBase = [];

            this._arrVertTitle = [
                {value: Asc.c_oAscChartVertAxisLabelShowSettings.none, displayValue: me.textNone},
                {value: Asc.c_oAscChartVertAxisLabelShowSettings.rotated, displayValue: me.textRotated},
                {value: Asc.c_oAscChartVertAxisLabelShowSettings.horizontal, displayValue: me.textHorizontal}
            ];

            // Horizontal Axis
            this.cmbHCrossType = [];
            this.cmbAxisPos = [];
            this.spnHAxisCrosses = [];
            this.chHReverse = [];
            this.cmbHMajorType = [];
            this.cmbHMinorType = [];
            this.spnMarksInterval = [];
            this.cmbHLabelPos = [];
            this.spnLabelDist = [];
            this.cmbLabelInterval = [];
            this.spnLabelInterval = [];
            this.cmbHorTitle = [];
            this.cmbHorGrid = [];
            this.chHorHide = [];
            this.btnHFormat = [];

            this._arrHorTitle = [
                {value: Asc.c_oAscChartHorAxisLabelShowSettings.none, displayValue: me.textNone},
                {value: Asc.c_oAscChartHorAxisLabelShowSettings.noOverlay, displayValue: me.textNoOverlay}
            ];

            this.afterRender();
        },

        afterRender: function() {
            this.updateMetricUnit();
            this._setDefaults(this._originalProps);
            if (this.storageName) {
                var value = Common.localStorage.getItem(this.storageName);
                this.setActiveCategory((value!==null) ? parseInt(value) : 0);
                value = this.getActiveCategory();
                if (value==2 || value==3) this.onVCategoryClick(value-2);
                else if (value==4 || value==5) this.onHCategoryClick(value-4);
            }
        },

        onCategoryClick: function(btn, index) {
            Common.Views.AdvancedSettingsWindow.prototype.onCategoryClick.call(this, btn, index);

            var me = this;
            setTimeout(function(){
                switch (index) {
                    case 0:
                        me.inputChartName.focus();
                        break;
                    case 1:
                        me.cmbChartTitle.focus();
                        break;
                    case 2:
                    case 3:
                        index -= 2;
                        var ctrlIndex = me.vertAxisPropsIndexes[index];
                        me.onVCategoryClick(index);
                        (me.vertAxisProps[index].getAxisType()===Asc.c_oAscAxisType.val) ? me.cmbMinType[ctrlIndex].focus() : (me.cmbHCrossType[ctrlIndex].isDisabled() ? me.btnHFormat[ctrlIndex].focus() : me.cmbHCrossType[ctrlIndex].focus() );
                        break;
                    case 4:
                    case 5:
                        index -= 4;
                        var ctrlIndex = me.horAxisPropsIndexes[index];
                        me.onHCategoryClick(index);
                        (me.horAxisProps[index].getAxisType()===Asc.c_oAscAxisType.val) ? me.cmbMinType[ctrlIndex].focus() : (me.cmbHCrossType[ctrlIndex].isDisabled() ? me.btnHFormat[ctrlIndex].focus() : me.cmbHCrossType[ctrlIndex].focus());
                        break;
                    case 6:
                        me.spnWidth.focus();
                        break;
                    case 7:
                        me.inputAltTitle.focus();
                        break;
                }
            }, 10);
        },

        _setDefaults: function(props) {
            Common.UI.FocusManager.add(this, this.btnsCategory);
            if (props ){
                var value = props.asc_getName();
                this.inputChartName.setValue(value ? value : '');

                this.spnWidth.setMaxValue(this.sizeMax.width);
                this.spnHeight.setMaxValue(this.sizeMax.height);

                this.spnWidth.setValue(Common.Utils.Metric.fnRecalcFromMM(props.asc_getWidth()).toFixed(2), true);
                this.spnHeight.setValue(Common.Utils.Metric.fnRecalcFromMM(props.asc_getHeight()).toFixed(2), true);

                if (props.asc_getHeight()>0)
                    this._nRatio = props.asc_getWidth()/props.asc_getHeight();

                value = props.asc_getLockAspect();
                this.btnRatio.toggle(value);

                this.cmbFromX.setValue('left');
                this.cmbFromY.setValue('left');

                if (props.asc_getPosition()) {
                    var Position = {X: props.asc_getPosition().get_X(), Y: props.asc_getPosition().get_Y()};
                    this.spnX.setValue((Position.X !== null && Position.X !== undefined) ? Common.Utils.Metric.fnRecalcFromMM(Position.X) : '', true);
                    this.spnY.setValue((Position.Y !== null && Position.Y !== undefined) ? Common.Utils.Metric.fnRecalcFromMM(Position.Y) : '', true);
                } else {
                    this.spnX.setValue('', true);
                    this.spnY.setValue('', true);
                }

                value = props.asc_getTitle();
                this.inputAltTitle.setValue(value ? value : '');

                value = props.asc_getDescription();
                this.textareaAltDescription.val(value ? value : '');

                Common.UI.FocusManager.add(this, [this.inputChartName]); // 0 tab

                this._setChartDefaults(this.chartSettings);

                this._changedProps = new Asc.CAscChartProp();

                Common.UI.FocusManager.add(this, [this.spnWidth, this.btnRatio, this.spnHeight, this.spnX, this.cmbFromX, this.spnY, this.cmbFromY, // 6 tab
                                                        this.inputAltTitle, this.textareaAltDescription ]); // 7 tab
            }
            Common.UI.FocusManager.add(this, this.getFooterButtons());
        },

        getSettings: function() {
            var Position = new Asc.CPosition();
            if (this.isChartNameChanged)
                this._changedProps.asc_putName(this.inputChartName.getValue());

            if (this.spnX.getValue() !== '') {
                var x = Common.Utils.Metric.fnRecalcToMM(this.spnX.getNumberValue());
                if (this.cmbFromX.getValue() === 'center') {
                    x = (this.slideSize.width/36000)/2 + x;
                }
                Position.put_X(x);
            }
            if (this.spnY.getValue() !== '') {
                var y = Common.Utils.Metric.fnRecalcToMM(this.spnY.getNumberValue());
                if (this.cmbFromY.getValue() === 'center') {
                    y = (this.slideSize.height/36000)/2 + y;
                }
                Position.put_Y(y);
            }
            this._changedProps.asc_putPosition(Position);

            if (this.isAltTitleChanged)
                this._changedProps.asc_putTitle(this.inputAltTitle.getValue());

            if (this.isAltDescChanged)
                this._changedProps.asc_putDescription(this.textareaAltDescription.val());

            var type = this.currentChartType;
            this.chartSettings.putType(type);

            this.chartSettings.putTitle(this.cmbChartTitle.getValue());
            this.chartSettings.putLegendPos(this.cmbLegendPos.getValue());

            this.chartSettings.putDataLabelsPos(this.cmbDataLabels.getValue());

            this.chartSettings.putShowSerName(this.chSeriesName.getValue()=='checked');
            this.chartSettings.putShowCatName(this.chCategoryName.getValue()=='checked');
            this.chartSettings.putShowVal(this.chValue.getValue()=='checked');

            this.chartSettings.putSeparator(_.isEmpty(this.txtSeparator.getValue()) ? ' ' : this.txtSeparator.getValue());

            this.chMarkers.isVisible() && this.chartSettings.putShowMarker(this.chMarkers.getValue()=='checked');

            var value = (type == Asc.c_oAscChartTypeSettings.lineNormal || type == Asc.c_oAscChartTypeSettings.lineStacked ||
                type == Asc.c_oAscChartTypeSettings.lineStackedPer || type == Asc.c_oAscChartTypeSettings.lineNormalMarker ||
                type == Asc.c_oAscChartTypeSettings.lineStackedMarker || type == Asc.c_oAscChartTypeSettings.lineStackedPerMarker ||
                type == Asc.c_oAscChartTypeSettings.scatter  || type == Asc.c_oAscChartTypeSettings.scatterSmoothMarker || type == Asc.c_oAscChartTypeSettings.scatterSmooth ||
                type == Asc.c_oAscChartTypeSettings.scatterLineMarker || type == Asc.c_oAscChartTypeSettings.scatterLine);
            if (value) {
                value = this.cmbLines.getValue();
                this.chartSettings.putLine(value!==0);
                if (value>0)
                    this.chartSettings.putSmooth(value==2);
            }
            this._changedProps.put_ChartProperties(this.chartSettings);

            return { chartProps: this._changedProps} ;
        },

        _setChartDefaults: function(props) {
            if (!props) return;

            this.currentChartType = props.getType();

            // Layout

            this.cmbChartTitle.setValue(props.getTitle());
            this.cmbLegendPos.setValue(props.getLegendPos());

            this.updateDataLabels(this.currentChartType, props.getDataLabelsPos());
            this.cmbDataLabels.setDisabled(this.currentChartType==Asc.c_oAscChartTypeSettings.surfaceNormal ||
                                           this.currentChartType == Asc.c_oAscChartTypeSettings.surfaceWireframe);

            this.chSeriesName.setValue(this.chartSettings.getShowSerName(), true);
            this.chCategoryName.setValue(this.chartSettings.getShowCatName(), true);
            this.chValue.setValue(this.chartSettings.getShowVal(), true);

            var value = props.getSeparator();
            this.txtSeparator.setValue((value) ? value : '');

            Common.UI.FocusManager.add(this, [this.cmbChartTitle, this.cmbLegendPos, this.cmbDataLabels, this.chSeriesName, this.chCategoryName, this.chValue, this.txtSeparator, this.cmbLines, this.chMarkers]);

            // Vertical Axis
            this.vertAxisProps = props.getVertAxesProps();
            if (this.vertAxisProps.length>0) {
                var el = this.$window.find('#id-chart-settings-dlg-vert');
                this.vertAxisPropsIndexes[0] = (this.vertAxisProps[0].getAxisType()===Asc.c_oAscAxisType.val) ? this.addControlsV(el) : this.addControlsH(el);
            }
            if (this.vertAxisProps.length>1) {
                var el = this.$window.find('#id-chart-settings-dlg-vert-sec');
                this.vertAxisPropsIndexes[1] = (this.vertAxisProps[1].getAxisType()===Asc.c_oAscAxisType.val) ? this.addControlsV(el) : this.addControlsH(el);
            }

            // Horizontal Axis
            this.horAxisProps = props.getHorAxesProps();
            if (this.horAxisProps.length>0) {
                var el = this.$window.find('#id-chart-settings-dlg-hor');
                this.horAxisPropsIndexes[0] = (this.horAxisProps[0].getAxisType()===Asc.c_oAscAxisType.val) ? this.addControlsV(el) : this.addControlsH(el);
            }
            if (this.horAxisProps.length>1) {
                var el = this.$window.find('#id-chart-settings-dlg-hor-sec');
                this.horAxisPropsIndexes[1] = (this.horAxisProps[1].getAxisType()===Asc.c_oAscAxisType.val) ? this.addControlsV(el) : this.addControlsH(el);
            }
            this.updateAxisProps(this.currentChartType);
        },

        addControlsV: function(parentEl) {
            var me = this,
                i = me.chVertHide.length,
                el = $(_.template(vertTemplate)({
                    scope: me,
                    idx: i
                }));
            parentEl.append(el);

            me.chVertHide[i] = new Common.UI.CheckBox({
                el: $('#chart-dlg-chk-vert-hide-' + i),
                labelText: me.textHideAxis
            }).on('change', _.bind(function (checkbox, state) {
                if (me.currentAxisProps[i])
                    me.currentAxisProps[i].putShow(state !== 'checked');
            }, me));
            Common.UI.FocusManager.add(this, me.chVertHide[i]);

            me.cmbVertTitle[i] = new Common.UI.ComboBox({
                el: $('#chart-dlg-combo-vert-title-' + i),
                menuStyle: 'min-width: 100%;',
                editable: false,
                cls: 'input-group-nr',
                data: me._arrVertTitle,
                takeFocusOnClose: true
            }).on('selected', _.bind(function (combo, record) {
                if (me.currentAxisProps[i])
                    me.currentAxisProps[i].putLabel(record.value);
            }, me));
            Common.UI.FocusManager.add(this, me.cmbVertTitle[i]);

            me.cmbVertGrid[i] = new Common.UI.ComboBox({
                el: $('#chart-dlg-combo-vert-grid-' + i),
                menuStyle: 'min-width: 100%;',
                editable: false,
                cls: 'input-group-nr',
                data: [
                    {value: Asc.c_oAscGridLinesSettings.none, displayValue: me.textNone},
                    {value: Asc.c_oAscGridLinesSettings.major, displayValue: me.textMajor},
                    {value: Asc.c_oAscGridLinesSettings.minor, displayValue: me.textMinor},
                    {value: Asc.c_oAscGridLinesSettings.majorMinor, displayValue: me.textMajorMinor}
                ],
                takeFocusOnClose: true
            }).on('selected', _.bind(function (combo, record) {
                if (me.currentAxisProps[i])
                    me.currentAxisProps[i].putGridlines(record.value);
            }, me));
            Common.UI.FocusManager.add(this, me.cmbVertGrid[i]);

            me.cmbMinType[i] = new Common.UI.ComboBox({
                el: $('#chart-dlg-combo-mintype-' + i),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: [
                    {displayValue: me.textAuto, value: Asc.c_oAscValAxisRule.auto},
                    {displayValue: me.textFixed, value: Asc.c_oAscValAxisRule.fixed}
                ],
                takeFocusOnClose: true
            }).on('selected', _.bind(function (combo, record) {
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putMinValRule(record.value);
                    if (record.value == Asc.c_oAscValAxisRule.auto) {
                        me.spnMinValue[i].setValue(me._originalAxisVValues[i].minAuto, true);
                    }
                }
            }, me));
            Common.UI.FocusManager.add(this, me.cmbMinType[i]);

            me.spnMinValue[i] = new Common.UI.MetricSpinner({
                el: $('#chart-dlg-input-min-value-' + i),
                maxValue: 1000000,
                minValue: -1000000,
                step: 0.1,
                defaultUnit: "",
                defaultValue: 0,
                value: ''
            }).on('change', _.bind(function (field, newValue, oldValue) {
                me.cmbMinType[i].suspendEvents();
                me.cmbMinType[i].setValue(Asc.c_oAscValAxisRule.fixed);
                me.cmbMinType[i].resumeEvents();
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putMinValRule(Asc.c_oAscValAxisRule.fixed);
                    me.currentAxisProps[i].putMinVal(field.getNumberValue());
                }
            }, me));
            Common.UI.FocusManager.add(this, me.spnMinValue[i]);

            me.cmbMaxType[i] = new Common.UI.ComboBox({
                el: $('#chart-dlg-combo-maxtype-' + i),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: [
                    {displayValue: me.textAuto, value: Asc.c_oAscValAxisRule.auto},
                    {displayValue: me.textFixed, value: Asc.c_oAscValAxisRule.fixed}
                ],
                takeFocusOnClose: true
            }).on('selected', _.bind(function (combo, record) {
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putMaxValRule(record.value);
                    if (record.value == Asc.c_oAscValAxisRule.auto) {
                        me.spnMaxValue[i].setValue(me._originalAxisVValues[i].maxAuto, true);
                    }
                }
            }, me));
            Common.UI.FocusManager.add(this, me.cmbMaxType[i]);

            me.spnMaxValue[i] = new Common.UI.MetricSpinner({
                el: $('#chart-dlg-input-max-value-' + i),
                maxValue: 1000000,
                minValue: -1000000,
                step: 0.1,
                defaultUnit: "",
                defaultValue: 0,
                value: ''
            }).on('change', _.bind(function (field, newValue, oldValue) {
                me.cmbMaxType[i].suspendEvents();
                me.cmbMaxType[i].setValue(Asc.c_oAscValAxisRule.fixed);
                me.cmbMaxType[i].resumeEvents();
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putMaxValRule(Asc.c_oAscValAxisRule.fixed);
                    me.currentAxisProps[i].putMaxVal(field.getNumberValue());
                }
            }, me));
            Common.UI.FocusManager.add(this, me.spnMaxValue[i]);

            me.cmbVCrossType[i] = new Common.UI.ComboBox({
                el: $('#chart-dlg-combo-v-crosstype-' + i),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: [
                    {displayValue: me.textAuto, value: Asc.c_oAscCrossesRule.auto},
                    {displayValue: me.textValue, value: Asc.c_oAscCrossesRule.value},
                    {displayValue: me.textMinValue, value: Asc.c_oAscCrossesRule.minValue},
                    {displayValue: me.textMaxValue, value: Asc.c_oAscCrossesRule.maxValue}
                ],
                takeFocusOnClose: true
            }).on('selected', _.bind(function (combo, record) {
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putCrossesRule(record.value);
                    var value;
                    switch (record.value) {
                        case Asc.c_oAscCrossesRule.minValue:
                            me.spnVAxisCrosses[i].setValue(me.spnMinValue[i].getNumberValue(), true);
                            break;
                        case Asc.c_oAscCrossesRule.maxValue:
                            me.spnVAxisCrosses[i].setValue(me.spnMaxValue[i].getNumberValue(), true);
                            break;
                        case Asc.c_oAscCrossesRule.auto:
                            me.spnVAxisCrosses[i].setValue(me._originalAxisVValues[i].crossesAuto, true);
                            break;
                    }
                }
            }, me));
            Common.UI.FocusManager.add(this, me.cmbVCrossType[i]);

            me.spnVAxisCrosses[i] = new Common.UI.MetricSpinner({
                el: $('#chart-dlg-input-v-axis-crosses-' + i),
                maxValue: 1000000,
                minValue: -1000000,
                step: 0.1,
                defaultUnit: "",
                defaultValue: 0,
                value: ''
            }).on('change', _.bind(function (field, newValue, oldValue) {
                me.cmbVCrossType[i].suspendEvents();
                me.cmbVCrossType[i].setValue(Asc.c_oAscCrossesRule.value);
                me.cmbVCrossType[i].resumeEvents();
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putCrossesRule(Asc.c_oAscCrossesRule.value);
                    me.currentAxisProps[i].putCrosses(field.getNumberValue());
                }
            }, me));
            Common.UI.FocusManager.add(this, me.spnVAxisCrosses[i]);

            me.cmbUnits[i] = new Common.UI.ComboBox({
                el: $('#chart-dlg-combo-units-' + i),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: [
                    {displayValue: me.textNone, value: Asc.c_oAscValAxUnits.none},
                    {displayValue: me.textHundreds, value: Asc.c_oAscValAxUnits.HUNDREDS},
                    {displayValue: me.textThousands, value: Asc.c_oAscValAxUnits.THOUSANDS},
                    {displayValue: me.textTenThousands, value: Asc.c_oAscValAxUnits.TEN_THOUSANDS},
                    {displayValue: me.textHundredThousands, value: Asc.c_oAscValAxUnits.HUNDRED_THOUSANDS},
                    {displayValue: me.textMillions, value: Asc.c_oAscValAxUnits.MILLIONS},
                    {displayValue: me.textTenMillions, value: Asc.c_oAscValAxUnits.TEN_MILLIONS},
                    {displayValue: me.textHundredMil, value: Asc.c_oAscValAxUnits.HUNDRED_MILLIONS},
                    {displayValue: me.textBillions, value: Asc.c_oAscValAxUnits.BILLIONS},
                    {displayValue: me.textTrillions, value: Asc.c_oAscValAxUnits.TRILLIONS}
                ],
                takeFocusOnClose: true
            }).on('selected', _.bind(function (combo, record) {
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putDispUnitsRule(record.value);
                }
            }, me));
            Common.UI.FocusManager.add(this, me.cmbUnits[i]);

            me.chVReverse[i] = new Common.UI.CheckBox({
                el: $('#chart-dlg-check-v-reverse-' + i),
                labelText: me.textReverse
            }).on('change', _.bind(function (checkbox, state) {
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putInvertValOrder(state == 'checked');
                }
            }, me));
            Common.UI.FocusManager.add(this, me.chVReverse[i]);

            me.cmbVMajorType[i] = new Common.UI.ComboBox({
                el: $('#chart-dlg-combo-v-major-type-' + i),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: [
                    {displayValue: me.textNone, value: Asc.c_oAscTickMark.TICK_MARK_NONE},
                    {displayValue: me.textCross, value: Asc.c_oAscTickMark.TICK_MARK_CROSS},
                    {displayValue: me.textIn, value: Asc.c_oAscTickMark.TICK_MARK_IN},
                    {displayValue: me.textOut, value: Asc.c_oAscTickMark.TICK_MARK_OUT}
                ],
                takeFocusOnClose: true
            }).on('selected', _.bind(function (combo, record) {
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putMajorTickMark(record.value);
                }
            }, me));
            Common.UI.FocusManager.add(this, me.cmbVMajorType[i]);

            me.cmbVMinorType[i] = new Common.UI.ComboBox({
                el: $('#chart-dlg-combo-v-minor-type-' + i),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: [
                    {displayValue: me.textNone, value: Asc.c_oAscTickMark.TICK_MARK_NONE},
                    {displayValue: me.textCross, value: Asc.c_oAscTickMark.TICK_MARK_CROSS},
                    {displayValue: me.textIn, value: Asc.c_oAscTickMark.TICK_MARK_IN},
                    {displayValue: me.textOut, value: Asc.c_oAscTickMark.TICK_MARK_OUT}
                ],
                takeFocusOnClose: true
            }).on('selected', _.bind(function (combo, record) {
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putMinorTickMark(record.value);
                }
            }, me));
            Common.UI.FocusManager.add(this, me.cmbVMinorType[i]);

            me.cmbVLabelPos[i] = new Common.UI.ComboBox({
                el: $('#chart-dlg-combo-v-label-pos-' + i),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: [
                    {displayValue: me.textNone, value: Asc.c_oAscTickLabelsPos.TICK_LABEL_POSITION_NONE},
                    {displayValue: me.textLow, value: Asc.c_oAscTickLabelsPos.TICK_LABEL_POSITION_LOW},
                    {displayValue: me.textHigh, value: Asc.c_oAscTickLabelsPos.TICK_LABEL_POSITION_HIGH},
                    {displayValue: me.textNextToAxis, value: Asc.c_oAscTickLabelsPos.TICK_LABEL_POSITION_NEXT_TO}
                ],
                takeFocusOnClose: true
            }).on('selected', _.bind(function (combo, record) {
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putTickLabelsPos(record.value);
                }
            }, me));
            Common.UI.FocusManager.add(this, me.cmbVLabelPos[i]);

            me.btnVFormat[i] = new Common.UI.Button({
                el: $('#chart-dlg-btn-v-format-' + i)
            }).on('click', _.bind(me.openFormat, me, i));
            Common.UI.FocusManager.add(this, me.btnVFormat[i]);

            me.chVLogScale[i] = new Common.UI.CheckBox({
                el: $('#chart-dlg-check-v-logscale-' + i),
                labelText: me.textLogScale
            }).on('change', _.bind(function (checkbox, state) {
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putLogScale(state == 'checked');
                    (state == 'checked') && me.currentAxisProps[i].putLogBase(me.spnBase[i].getNumberValue());
                }
                me.spnBase[i].setDisabled((state !== 'checked'));
            }, me));
            Common.UI.FocusManager.add(this, me.chVLogScale[i]);

            me.spnBase[i] = new Common.UI.MetricSpinner({
                el: $('#chart-dlg-input-base-' + i),
                maxValue: 1000,
                minValue: 2,
                step: 1,
                defaultUnit: "",
                value: 10
            }).on('change', _.bind(function (field, newValue, oldValue) {
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putLogBase(field.getNumberValue());
                }
            }, me));
            Common.UI.FocusManager.add(this, me.spnBase[i]);

            return i;
        },

        addControlsH: function(parentEl) {
            var me = this,
                i = me.chHorHide.length,
                el = $(_.template(horTemplate)({
                    scope: me,
                    idx: i
                }));
            parentEl.append(el);

            me.chHorHide[i] = new Common.UI.CheckBox({
                el: $('#chart-dlg-chk-hor-hide-' + i),
                labelText: me.textHideAxis
            }).on('change', _.bind(function (checkbox, state) {
                if (me.currentAxisProps[i])
                    me.currentAxisProps[i].putShow(state !== 'checked');
            }, me));
            Common.UI.FocusManager.add(this, me.chHorHide[i]);

            me.cmbHorTitle[i] = new Common.UI.ComboBox({
                el: $('#chart-dlg-combo-hor-title-' + i),
                menuStyle: 'min-width: 100%;',
                editable: false,
                cls: 'input-group-nr',
                data: me._arrHorTitle,
                takeFocusOnClose: true
            }).on('selected', _.bind(function (combo, record) {
                if (me.currentAxisProps[i])
                    me.currentAxisProps[i].putLabel(record.value);
            }, me));
            Common.UI.FocusManager.add(this, me.cmbHorTitle[i]);

            me.cmbHorGrid[i] = new Common.UI.ComboBox({
                el: $('#chart-dlg-combo-hor-grid-' + i),
                menuStyle: 'min-width: 100%;',
                editable: false,
                cls: 'input-group-nr',
                data: [
                    {value: Asc.c_oAscGridLinesSettings.none, displayValue: me.textNone},
                    {value: Asc.c_oAscGridLinesSettings.major, displayValue: me.textMajor},
                    {value: Asc.c_oAscGridLinesSettings.minor, displayValue: me.textMinor},
                    {value: Asc.c_oAscGridLinesSettings.majorMinor, displayValue: me.textMajorMinor}
                ],
                takeFocusOnClose: true
            }).on('selected', _.bind(function (combo, record) {
                if (me.currentAxisProps[i])
                    me.currentAxisProps[i].putGridlines(record.value);
            }, me));
            Common.UI.FocusManager.add(this, me.cmbHorGrid[i]);

            me.cmbHCrossType[i] = new Common.UI.ComboBox({
                el: $('#chart-dlg-combo-h-crosstype-' + i),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: [
                    {displayValue: me.textAuto, value: Asc.c_oAscCrossesRule.auto},
                    {displayValue: me.textValue, value: Asc.c_oAscCrossesRule.value},
                    {displayValue: me.textMinValue, value: Asc.c_oAscCrossesRule.minValue},
                    {displayValue: me.textMaxValue, value: Asc.c_oAscCrossesRule.maxValue}
                ],
                takeFocusOnClose: true
            }).on('selected', _.bind(function (combo, record) {
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putCrossesRule(record.value);
                    if (record.value == Asc.c_oAscCrossesRule.auto) {
                        me.spnHAxisCrosses[i].setValue(me._originalAxisHValues[i].crossesAuto, true);
                    } else if (record.value == Asc.c_oAscCrossesRule.minValue) {
                        me.spnHAxisCrosses[i].setValue(me._originalAxisHValues[i].minAuto, true);
                    } else if (record.value == Asc.c_oAscCrossesRule.maxValue) {
                        me.spnHAxisCrosses[i].setValue(me._originalAxisHValues[i].maxAuto, true);
                    }
                }
            }, me));
            Common.UI.FocusManager.add(this, me.cmbHCrossType[i]);

            me.spnHAxisCrosses[i] = new Common.UI.MetricSpinner({
                el: $('#chart-dlg-input-h-axis-crosses-' + i),
                maxValue: 1000000,
                minValue: -1000000,
                step: 0.1,
                defaultUnit: "",
                defaultValue: 0,
                value: ''
            }).on('change', _.bind(function (field, newValue, oldValue) {
                me.cmbHCrossType[i].suspendEvents();
                me.cmbHCrossType[i].setValue(Asc.c_oAscCrossesRule.value);
                me.cmbHCrossType[i].resumeEvents();
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putCrossesRule(Asc.c_oAscCrossesRule.value);
                    me.currentAxisProps[i].putCrosses(field.getNumberValue());
                }
            }, me));
            Common.UI.FocusManager.add(this, me.spnHAxisCrosses[i]);

            me.cmbAxisPos[i] = new Common.UI.ComboBox({
                el: $('#chart-dlg-combo-axis-pos-' + i),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: [
                    {displayValue: me.textOnTickMarks, value: Asc.c_oAscLabelsPosition.byDivisions},
                    {displayValue: me.textBetweenTickMarks, value: Asc.c_oAscLabelsPosition.betweenDivisions}
                ],
                takeFocusOnClose: true
            }).on('selected', _.bind(function (combo, record) {
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putLabelsPosition(record.value);
                }
            }, me));
            Common.UI.FocusManager.add(this, me.cmbAxisPos[i]);

            me.chHReverse[i] = new Common.UI.CheckBox({
                el: $('#chart-dlg-check-h-reverse-' + i),
                labelText: me.textReverse
            }).on('change', _.bind(function (checkbox, state) {
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putInvertCatOrder(state == 'checked');
                }
            }, me));
            Common.UI.FocusManager.add(this, me.chHReverse[i]);

            me.cmbHMajorType[i] = new Common.UI.ComboBox({
                el: $('#chart-dlg-combo-h-major-type-' + i),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: [
                    {displayValue: me.textNone, value: Asc.c_oAscTickMark.TICK_MARK_NONE},
                    {displayValue: me.textCross, value: Asc.c_oAscTickMark.TICK_MARK_CROSS},
                    {displayValue: me.textIn, value: Asc.c_oAscTickMark.TICK_MARK_IN},
                    {displayValue: me.textOut, value: Asc.c_oAscTickMark.TICK_MARK_OUT}
                ],
                takeFocusOnClose: true
            }).on('selected', _.bind(function (combo, record) {
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putMajorTickMark(record.value);
                }
            }, me));
            Common.UI.FocusManager.add(this, me.cmbHMajorType[i]);

            me.cmbHMinorType[i] = new Common.UI.ComboBox({
                el: $('#chart-dlg-combo-h-minor-type-' + i),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: [
                    {displayValue: me.textNone, value: Asc.c_oAscTickMark.TICK_MARK_NONE},
                    {displayValue: me.textCross, value: Asc.c_oAscTickMark.TICK_MARK_CROSS},
                    {displayValue: me.textIn, value: Asc.c_oAscTickMark.TICK_MARK_IN},
                    {displayValue: me.textOut, value: Asc.c_oAscTickMark.TICK_MARK_OUT}
                ],
                takeFocusOnClose: true
            }).on('selected', _.bind(function (combo, record) {
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putMinorTickMark(record.value);
                }
            }, me));
            Common.UI.FocusManager.add(this, me.cmbHMinorType[i]);

            me.spnMarksInterval[i] = new Common.UI.MetricSpinner({
                el: $('#chart-dlg-input-marks-interval-' + i),
                width: 'auto',
                maxValue: 1000000,
                minValue: 1,
                step: 1,
                defaultUnit: "",
                value: ''
            }).on('change', _.bind(function (field, newValue, oldValue) {
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putIntervalBetweenTick(field.getNumberValue());
                }
            }, me));
            Common.UI.FocusManager.add(this, me.spnMarksInterval[i]);

            me.cmbHLabelPos[i] = new Common.UI.ComboBox({
                el: $('#chart-dlg-combo-h-label-pos-' + i),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: [
                    {displayValue: me.textNone, value: Asc.c_oAscTickLabelsPos.TICK_LABEL_POSITION_NONE},
                    {displayValue: me.textLow, value: Asc.c_oAscTickLabelsPos.TICK_LABEL_POSITION_LOW},
                    {displayValue: me.textHigh, value: Asc.c_oAscTickLabelsPos.TICK_LABEL_POSITION_HIGH},
                    {displayValue: me.textNextToAxis, value: Asc.c_oAscTickLabelsPos.TICK_LABEL_POSITION_NEXT_TO}
                ],
                takeFocusOnClose: true
            }).on('selected', _.bind(function (combo, record) {
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putTickLabelsPos(record.value);
                }
            }, me));
            Common.UI.FocusManager.add(this, me.cmbHLabelPos[i]);

            me.spnLabelDist[i] = new Common.UI.MetricSpinner({
                el: $('#chart-dlg-input-label-dist-' + i),
                width: 'auto',
                maxValue: 1000,
                minValue: 0,
                step: 1,
                defaultUnit: "",
                value: ''
            }).on('change', _.bind(function (field, newValue, oldValue) {
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putLabelsAxisDistance(field.getNumberValue());
                }
            }, me));
            Common.UI.FocusManager.add(this, me.spnLabelDist[i]);

            me.spnLabelInterval[i] = new Common.UI.MetricSpinner({
                el: $('#chart-dlg-input-label-int-' + i),
                width: 60,
                maxValue: 1000000,
                minValue: 1,
                step: 1,
                defaultUnit: "",
                value: ''
            }).on('change', _.bind(function (field, newValue, oldValue) {
                me.cmbLabelInterval[i].suspendEvents();
                me.cmbLabelInterval[i].setValue(Asc.c_oAscBetweenLabelsRule.manual);
                me.cmbLabelInterval[i].resumeEvents();
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putIntervalBetweenLabelsRule(Asc.c_oAscBetweenLabelsRule.manual);
                    me.currentAxisProps[i].putIntervalBetweenLabels(field.getNumberValue());
                }
            }, me));
            Common.UI.FocusManager.add(this, me.spnLabelInterval[i]);

            me.cmbLabelInterval[i] = new Common.UI.ComboBox({
                el: $('#chart-dlg-combo-label-int-' + i),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: [
                    {displayValue: me.textAuto, value: Asc.c_oAscBetweenLabelsRule.auto},
                    {displayValue: me.textManual, value: Asc.c_oAscBetweenLabelsRule.manual}
                ],
                takeFocusOnClose: true
            }).on('selected', _.bind(function (combo, record) {
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putIntervalBetweenLabelsRule(record.value);
                    if (record.value == Asc.c_oAscBetweenLabelsRule.auto)
                        me.spnLabelInterval[i].setValue(1, true);
                }
            }, me));
            Common.UI.FocusManager.add(this, me.cmbLabelInterval[i]);

            me.btnHFormat[i] = new Common.UI.Button({
                el: $('#chart-dlg-btn-h-format-' + i)
            }).on('click', _.bind(me.openFormat, me, i));
            Common.UI.FocusManager.add(this, me.btnHFormat[i]);

            return i;
        },

        updateAxisProps: function(type, isDefault) {
            var value = (type == Asc.c_oAscChartTypeSettings.lineNormal || type == Asc.c_oAscChartTypeSettings.lineStacked ||
                type == Asc.c_oAscChartTypeSettings.lineStackedPer || type == Asc.c_oAscChartTypeSettings.lineNormalMarker ||
                type == Asc.c_oAscChartTypeSettings.lineStackedMarker || type == Asc.c_oAscChartTypeSettings.lineStackedPerMarker ||
                type == Asc.c_oAscChartTypeSettings.scatter || type == Asc.c_oAscChartTypeSettings.scatterSmoothMarker || type == Asc.c_oAscChartTypeSettings.scatterSmooth ||
                type == Asc.c_oAscChartTypeSettings.scatterLineMarker || type == Asc.c_oAscChartTypeSettings.scatterLine);
            this.chMarkers.setVisible(value);
            this.cmbLines.setVisible(value);
            this.lblLines.toggleClass('hidden', !value);

            if (value) {
                this.chMarkers.setValue(this.chartSettings.getShowMarker(), true);
                this.cmbLines.setValue(this.chartSettings.getLine() ? (this.chartSettings.getSmooth() ? 2 : 1) : 0);
            }

            value = (type == Asc.c_oAscChartTypeSettings.pie || type == Asc.c_oAscChartTypeSettings.doughnut || type == Asc.c_oAscChartTypeSettings.pie3d);
            this.btnsCategory[2].setDisabled(value);
            this.btnsCategory[3].setDisabled(value);
            this.btnsCategory[4].setDisabled(value);
            this.btnsCategory[5].setDisabled(value);
            this.btnsCategory[2].setVisible(this.vertAxisProps.length>0);
            this.btnsCategory[3].setVisible(this.vertAxisProps.length>1);
            this.btnsCategory[4].setVisible(this.horAxisProps.length>0);
            this.btnsCategory[5].setVisible(this.horAxisProps.length>1);

            value = (type == Asc.c_oAscChartTypeSettings.barNormal3d || type == Asc.c_oAscChartTypeSettings.barStacked3d || type == Asc.c_oAscChartTypeSettings.barStackedPer3d ||
                type == Asc.c_oAscChartTypeSettings.hBarNormal3d || type == Asc.c_oAscChartTypeSettings.hBarStacked3d || type == Asc.c_oAscChartTypeSettings.hBarStackedPer3d ||
                type == Asc.c_oAscChartTypeSettings.barNormal3dPerspective);
            for (var i=0; i<this.cmbAxisPos.length; i++)
                this.cmbAxisPos[i].setDisabled(value);
        },

        updateDataLabels: function(chartType, labelPos) {
            if (chartType !== this.currentChartType) {
                var data = [{ value: Asc.c_oAscChartDataLabelsPos.none, displayValue: this.textNone },
                    { value: Asc.c_oAscChartDataLabelsPos.ctr, displayValue: this.textCenter }];

                if (chartType == Asc.c_oAscChartTypeSettings.barNormal || chartType == Asc.c_oAscChartTypeSettings.hBarNormal)
                    data.push({ value: Asc.c_oAscChartDataLabelsPos.inBase, displayValue: this.textInnerBottom },
                        { value: Asc.c_oAscChartDataLabelsPos.inEnd, displayValue: this.textInnerTop },
                        { value: Asc.c_oAscChartDataLabelsPos.outEnd, displayValue: this.textOuterTop });
                else if ( chartType == Asc.c_oAscChartTypeSettings.barStacked || chartType == Asc.c_oAscChartTypeSettings.barStackedPer ||
                    chartType == Asc.c_oAscChartTypeSettings.hBarStacked || chartType == Asc.c_oAscChartTypeSettings.hBarStackedPer )
                    data.push({ value: Asc.c_oAscChartDataLabelsPos.inBase, displayValue: this.textInnerBottom },
                        { value: Asc.c_oAscChartDataLabelsPos.inEnd, displayValue: this.textInnerTop });
                else if (chartType == Asc.c_oAscChartTypeSettings.lineNormal || chartType == Asc.c_oAscChartTypeSettings.lineStacked || chartType == Asc.c_oAscChartTypeSettings.lineStackedPer ||
                    chartType == Asc.c_oAscChartTypeSettings.lineNormalMarker || chartType == Asc.c_oAscChartTypeSettings.lineStackedMarker || chartType == Asc.c_oAscChartTypeSettings.lineStackedPerMarker ||
                    chartType == Asc.c_oAscChartTypeSettings.stock || chartType == Asc.c_oAscChartTypeSettings.scatter  || chartType == Asc.c_oAscChartTypeSettings.scatterSmoothMarker ||
                    chartType == Asc.c_oAscChartTypeSettings.scatterSmooth || chartType == Asc.c_oAscChartTypeSettings.scatterLineMarker || chartType == Asc.c_oAscChartTypeSettings.scatterLine)
                    data.push({ value: Asc.c_oAscChartDataLabelsPos.l, displayValue: this.textLeft },
                        { value: Asc.c_oAscChartDataLabelsPos.r, displayValue: this.textRight },
                        { value: Asc.c_oAscChartDataLabelsPos.t, displayValue: this.textTop },
                        { value: Asc.c_oAscChartDataLabelsPos.b, displayValue: this.textBottom });
                else if (chartType == Asc.c_oAscChartTypeSettings.pie || chartType == Asc.c_oAscChartTypeSettings.pie3d)
                    data.push({ value: Asc.c_oAscChartDataLabelsPos.bestFit, displayValue: this.textFit },
                        { value: Asc.c_oAscChartDataLabelsPos.inEnd, displayValue: this.textInnerTop },
                        { value: Asc.c_oAscChartDataLabelsPos.outEnd, displayValue: this.textOuterTop });

                this.cmbDataLabels.setData(data);
            }

            if (labelPos!==undefined) {
                var rec = this.cmbDataLabels.store.findWhere({value: labelPos});
                if (!rec)
                    labelPos = Asc.c_oAscChartDataLabelsPos.ctr;
            } else
                labelPos = Asc.c_oAscChartDataLabelsPos.none;

            this.cmbDataLabels.setValue(labelPos);
            this.onSelectDataLabels(this.cmbDataLabels, {value:labelPos});
        },

        onVCategoryClick: function(index) {
            (this.vertAxisProps[index].getAxisType()==Asc.c_oAscAxisType.val) ? this.fillVProps(this.vertAxisProps[index], this.vertAxisPropsIndexes[index]) : this.fillHProps(this.vertAxisProps[index], this.vertAxisPropsIndexes[index], true);
        },

        onHCategoryClick: function(index) {
            (this.horAxisProps[index].getAxisType()==Asc.c_oAscAxisType.val) ? this.fillVProps(this.horAxisProps[index], this.horAxisPropsIndexes[index], true) : this.fillHProps(this.horAxisProps[index], this.horAxisPropsIndexes[index]);
        },

        fillVProps: function(props, index, hor) {
            if (props.getAxisType() !== Asc.c_oAscAxisType.val) return;
            if (this._originalAxisVValues==undefined)
                this._originalAxisVValues = [];
            if (this._originalAxisVValues[index]==undefined) {
                this._originalAxisVValues[index] = {
                    minAuto: (props.getMinVal()==null) ? 0 : props.getMinVal(),
                    maxAuto: (props.getMaxVal()==null) ? 10 : props.getMaxVal(),
                    crossesAuto: (props.getCrosses()==null) ? 0 : props.getCrosses()
                };
            }

            this.chVertHide[index].setValue(!props.getShow());
            this.cmbVertGrid[index].setValue(props.getGridlines());


            this.cmbVertTitle[index].setData(hor ? this._arrHorTitle : this._arrVertTitle);
            this.cmbVertTitle[index].setValue(props.getLabel());
            this.cmbVertTitle[index].setDisabled(!!props.isRadarAxis());

            this.cmbMinType[index].setValue(props.getMinValRule());
            var value = (props.getMinValRule()==Asc.c_oAscValAxisRule.auto) ? this._originalAxisVValues[index].minAuto : props.getMinVal();
            this.spnMinValue[index].setValue((value==null) ? '' : value, true);

            this.cmbMaxType[index].setValue(props.getMaxValRule());
            value = (props.getMaxValRule()==Asc.c_oAscValAxisRule.auto) ? this._originalAxisVValues[index].maxAuto : props.getMaxVal();
            this.spnMaxValue[index].setValue((value==null) ? '' : value, true);

            value = props.getCrossesRule();
            this.cmbVCrossType[index].setValue(value);
            switch (value) {
                case Asc.c_oAscCrossesRule.minValue:
                    value = this.spnMinValue[index].getNumberValue();
                    break;
                case Asc.c_oAscCrossesRule.maxValue:
                    value = this.spnMaxValue[index].getNumberValue();
                    break;
                case Asc.c_oAscCrossesRule.auto:
                    value = this._originalAxisVValues[index].crossesAuto;
                    break;
                default:
                    value = props.getCrosses();
                    break;
            }
            this.spnVAxisCrosses[index].setValue((value==null) ? '' : value, true);

            this.cmbUnits[index].setValue(props.getDispUnitsRule());
            this.chVReverse[index].setValue(props.getInvertValOrder(), true);
            this.cmbVMajorType[index].setValue(props.getMajorTickMark());
            this.cmbVMinorType[index].setValue(props.getMinorTickMark());
            this.cmbVLabelPos[index].setValue(props.getTickLabelsPos());
            value = props.getLogScale();
            this.chVLogScale[index].setValue(!!value, true);
            this.spnBase[index].setDisabled(!value);
            value && this.spnBase[index].setValue(props.getLogBase(), true);

            this.currentAxisProps[index] = props;
        },

        fillHProps: function(props, index, vert) {
            if (props.getAxisType() !== Asc.c_oAscAxisType.cat) return;
            if (this._originalAxisHValues==undefined)
                this._originalAxisHValues = [];
            if (this._originalAxisHValues[index]==undefined) {
                this._originalAxisHValues[index] = {
                    minAuto: (props.getCrossMinVal()==null) ? 0 : props.getCrossMinVal(),
                    maxAuto: (props.getCrossMaxVal()==null) ? 10 : props.getCrossMaxVal(),
                    crossesAuto: (props.getCrosses()==null) ? 0 : props.getCrosses()
                };
            }

            this.chHorHide[index].setValue(!props.getShow());
            this.cmbHorGrid[index].setValue(props.getGridlines());

            this.cmbHorTitle[index].setData(vert ? this._arrVertTitle : this._arrHorTitle);
            this.cmbHorTitle[index].setValue(props.getLabel());

            var value = props.getCrossesRule();
            this.cmbHCrossType[index].setValue(value);
            switch (value) {
                case Asc.c_oAscCrossesRule.minValue:
                    value = this._originalAxisHValues[index].minAuto;
                    break;
                case Asc.c_oAscCrossesRule.maxValue:
                    value = this._originalAxisHValues[index].maxAuto;
                    break;
                case Asc.c_oAscCrossesRule.auto:
                    value = this._originalAxisHValues[index].crossesAuto;
                    break;
                default:
                    value = props.getCrosses();
                    break;
            }
            this.spnHAxisCrosses[index].setValue((value==null) ? '' : value, true);

            this.cmbAxisPos[index].setValue(props.getLabelsPosition());
            this.chHReverse[index].setValue(props.getInvertCatOrder(), true);
            this.cmbHMajorType[index].setValue(props.getMajorTickMark());
            this.cmbHMinorType[index].setValue(props.getMinorTickMark());
            this.spnMarksInterval[index].setValue(props.getIntervalBetweenTick(), true);
            this.cmbHLabelPos[index].setValue(props.getTickLabelsPos());
            this.spnLabelDist[index].setValue(props.getLabelsAxisDistance(), true);

            value = props.getIntervalBetweenLabelsRule();
            this.cmbLabelInterval[index].setValue(value);
            this.spnLabelInterval[index].setValue((value===Asc.c_oAscBetweenLabelsRule.manual) ? props.getIntervalBetweenLabels(): 1, true);

            value = !!props.isRadarAxis();
            this.chHorHide[index].setDisabled(value);
            this.cmbHorTitle[index].setDisabled(value);
            this.cmbHorGrid[index].setDisabled(value);
            this.cmbHCrossType[index].setDisabled(value);
            this.spnHAxisCrosses[index].setDisabled(value);
            this.chHReverse[index].setDisabled(value);
            this.cmbHMajorType[index].setDisabled(value);
            this.cmbHMinorType[index].setDisabled(value);
            this.spnMarksInterval[index].setDisabled(value);
            this.cmbHLabelPos[index].setDisabled(value);
            this.spnLabelDist[index].setDisabled(value);
            this.cmbLabelInterval[index].setDisabled(value);
            this.spnLabelInterval[index].setDisabled(value);

            var type = this.currentChartType;
            value = !!props.isRadarAxis() || type == Asc.c_oAscChartTypeSettings.barNormal3d || type == Asc.c_oAscChartTypeSettings.barStacked3d || type == Asc.c_oAscChartTypeSettings.barStackedPer3d ||
                type == Asc.c_oAscChartTypeSettings.hBarNormal3d || type == Asc.c_oAscChartTypeSettings.hBarStacked3d || type == Asc.c_oAscChartTypeSettings.hBarStackedPer3d ||
                type == Asc.c_oAscChartTypeSettings.barNormal3dPerspective;
            this.cmbAxisPos[index].setDisabled(value);

            this.currentAxisProps[index] = props;
        },

        onSelectDataLabels: function(obj, rec, e) {
            var disable = rec.value == Asc.c_oAscChartDataLabelsPos.none;
            this.chSeriesName.setDisabled(disable);
            this.chCategoryName.setDisabled(disable);
            this.chValue.setDisabled(disable);
            this.txtSeparator.setDisabled(disable);
            if (!disable && this.chSeriesName.getValue()!=='checked' && this.chCategoryName.getValue()!=='checked'
                && this.chValue.getValue()!=='checked') {
                this.chValue.setValue('checked', true);
            }
        },

        openFormat: function(index, btn) {
            var me = this,
                props = me.currentAxisProps[index],
                fmt = props.getNumFmt(),
                lang = Common.Utils.InternalSettings.get("de-config-lang");

            var win = (new Common.Views.FormatSettingsDialog({
                api: me.api,
                handler: function(result, settings) {
                    if (result=='ok' && settings) {
                        fmt.putSourceLinked(settings.linked);
                        fmt.putFormatCode(settings.format);
                        me.chartSettings.endEditData();
                        me._isEditFormat = false;
                    }
                },
                linked: true,
                props   : {format: fmt.getFormatCode(), formatInfo: fmt.getFormatCellsInfo(), langId: lang, chartFormat: fmt}
            })).on('close', function() {
                me._isEditFormat && me.chartSettings.cancelEditData();
                me._isEditFormat = false;
                btn.focus();
            });
            me._isEditFormat = true;
            me.chartSettings.startEditData();
            win.show();
        },

        updateMetricUnit: function() {
            if (this.spinners) {
                for (var i=0; i<this.spinners.length; i++) {
                    var spinner = this.spinners[i];
                    spinner.setDefaultUnit(Common.Utils.Metric.getCurrentMetricName());
                    spinner.setStep(Common.Utils.Metric.getCurrentMetric()==Common.Utils.Metric.c_MetricUnits.pt ? 1 : 0.1);
                }
            }
            this.sizeMax = {
                width: Common.Utils.Metric.fnRecalcFromMM(this.options.sizeMax.width*10),
                height: Common.Utils.Metric.fnRecalcFromMM(this.options.sizeMax.height*10)
            };
        },

        close: function () {
            this.api && this.api.asc_onCloseFrameEditor();
            Common.Views.AdvancedSettingsWindow.prototype.close.apply(this, arguments);
        },

        textTitle:      'Chart - Advanced Settings',
        textAlt: 'Alternative Text',
        textAltTitle: 'Title',
        textAltDescription: 'Description',
        textAltTip: 'The alternative text-based representation of the visual object information, which will be read to the people with vision or cognitive impairments to help them better understand what information there is in the image, autoshape, chart or table.',
        textPlacement: 'Placement',
        textSize: 'Size',
        textWidth: 'Width',
        textHeight: 'Height',
        textPosition: 'Position',
        textHorizontal: 'Horizontal',
        textVertical: 'Vertical',
        textFrom: 'From',
        textTopLeftCorner: 'Top Left Corner',
        textCenter: 'Center',
        textKeepRatio: 'Constant Proportions',
        textGeneral: 'General',
        textChartName: 'Chart name',
        textLegendBottom:   'Bottom',
        textLegendTop:      'Top',
        textLegendRight:    'Right',
        textLegendLeft:     'Left',
        textChartTitle:     'Chart Title',
        textLayout: 'Layout',
        textLegendPos: 'Legend',
        textDataLabels: 'Data Labels',
        textSeparator: 'Data Labels Separator',
        textSeriesName: 'Series Name',
        textCategoryName: 'Category Name',
        textValue: 'Value',
        textMinValue: 'Minimum Value',
        textMaxValue: 'Maximum Value',
        textAxisCrosses: 'Axis Crosses',
        textUnits: 'Display Units',
        textTickOptions: 'Tick Options',
        textMajorType: 'Major Type',
        textMinorType: 'Minor Type',
        textLabelOptions: 'Label Options',
        textLabelPos: 'Label Position',
        textReverse: 'Values in reverse order',
        textVertAxis: 'Vertical Axis',
        textHorAxis: 'Horizontal Axis',
        textMarksInterval: 'Interval between Marks',
        textLabelDist: 'Axis Label Distance',
        textLabelInterval: 'Interval between Labels',
        textAxisPos: 'Axis Position',
        textLeftOverlay: 'Left Overlay',
        textRightOverlay: 'Right Overlay',
        textOverlay: 'Overlay',
        textNoOverlay: 'No Overlay',
        textRotated: 'Rotated',
        textInnerBottom: 'Inner Bottom',
        textInnerTop: 'Inner Top',
        textOuterTop: 'Outer Top',
        textNone: 'None',
        textFixed: 'Fixed',
        textAuto: 'Auto',
        textCross: 'Cross',
        textIn: 'In',
        textOut: 'Out',
        textLow: 'Low',
        textHigh: 'High',
        textNextToAxis: 'Next to axis',
        textHundreds: 'Hundreds',
        textThousands: 'Thousands',
        textTenThousands: '10 000',
        textHundredThousands: '100 000',
        textMillions: 'Millions',
        textTenMillions: '10 000 000',
        textHundredMil: '100 000 000',
        textBillions: 'Billions',
        textTrillions: 'Trillions',
        textCustom: 'Custom',
        textManual: 'Manual',
        textBetweenTickMarks: 'Between Tick Marks',
        textOnTickMarks: 'On Tick Marks',
        textLines: 'Lines',
        textMarkers: 'Markers',
        textMajor: 'Major',
        textMinor: 'Minor',
        textMajorMinor: 'Major and Minor',
        textStraight: 'Straight',
        textSmooth: 'Smooth',
        textGridLines: 'Gridlines',
        textFit: 'Fit Width',
        textVertAxisSec: 'Secondary Vertical Axis',
        textHorAxisSec: 'Secondary Horizontal Axis',
        textAxisTitle: 'Title',
        textHideAxis: 'Hide axis',
        textFormat: 'Label format',
        textBase: 'Base',
        textLogScale: 'Logarithmic Scale'
    }, PE.Views.ChartSettingsAdvanced || {}));
});