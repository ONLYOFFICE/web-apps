/*
 * (c) Copyright Ascensio System SIA 2010-2023
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
 *  ChartSettings.js
 *
 *  Created on 4/11/14
 *
 */

define([
    'text!pdfeditor/main/app/template/ChartSettings.template',
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/component/Button',
    'common/main/lib/component/ComboDataView',
    // 'pdfeditor/main/app/view/ChartSettingsAdvanced'
], function (menuTemplate, $, _, Backbone) {
    'use strict';

    PDFE.Views.ChartSettings = Backbone.View.extend(_.extend({
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

            this._state = {
                Width: 0,
                Height: 0,
                ChartStyle: 1,
                ChartType: -1,
                SeveralCharts: false,
                DisabledControls: false,
                keepRatio: false
            };
            this._nRatio = 1;
            this.spinners = [];
            this.lockedControls = [];
            this._locked = false;

            this._noApply = false;
            this._originalProps = null;

            this.render();
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
                this.api.asc_registerCallback('asc_onAddChartStylesPreview', _.bind(this.onAddChartStylesPreview, this));
            }
            return this;
        },

        ChangeSettings: function(props) {
            if (this._initSettings)
                this.createDelayedElements();

            this.disableControls(this._locked);

            if (props){
                this._originalProps = props;
                this._noApply = true;
                this.chartProps = props.get_ChartProperties();

                var value = props.get_SeveralCharts() || this._locked;
                this.btnEditData.setDisabled(value);
                this._state.SeveralCharts=value;

                value = props.get_SeveralChartTypes();
                if (this._state.SeveralCharts && value) {
                    this.btnChartType.setIconCls('svgicon');
                    this._state.ChartType = null;
                } else {
                    var type = props.getType();
                    if (this._state.ChartType !== type) {
                        var record = this.mnuChartTypePicker.store.findWhere({type: type});
                        this.mnuChartTypePicker.selectRecord(record, true);
                        if (record) {
                            this.btnChartType.setIconCls('svgicon ' + 'chart-' + record.get('iconCls'));
                        } else
                            this.btnChartType.setIconCls('svgicon');
                        this.ShowCombinedProps(type);
                        !(type===null || type==Asc.c_oAscChartTypeSettings.comboBarLine || type==Asc.c_oAscChartTypeSettings.comboBarLineSecondary ||
                        type==Asc.c_oAscChartTypeSettings.comboAreaBar || type==Asc.c_oAscChartTypeSettings.comboCustom) && this.updateChartStyles(this.api.asc_getChartPreviews(type, undefined, true));
                        this._state.ChartType = type;
                    }
                }

                if (!(type==Asc.c_oAscChartTypeSettings.comboBarLine || type==Asc.c_oAscChartTypeSettings.comboBarLineSecondary ||
                    type==Asc.c_oAscChartTypeSettings.comboAreaBar || type==Asc.c_oAscChartTypeSettings.comboCustom)) {
                    value = props.get_SeveralChartStyles();
                    if (this._state.SeveralCharts && value) {
                        this.cmbChartStyle.fieldPicker.deselectAll();
                        this.cmbChartStyle.menuPicker.deselectAll();
                        this._state.ChartStyle = null;
                    } else {
                        value = props.getStyle();
                        if (this._state.ChartStyle !== value || this._isChartStylesChanged) {
                            this._state.ChartStyle = value;
                            var arr = this.selectCurrentChartStyle();
                            this._isChartStylesChanged && this.api.asc_generateChartPreviews(this._state.ChartType, arr);
                        }
                    }
                    this._isChartStylesChanged = false;
                }

                this._noApply = false;

                value = props.get_Width();
                if ( Math.abs(this._state.Width-value)>0.001 ||
                    (this._state.Width===null || value===null)&&(this._state.Width!==value)) {
                    this.spnWidth.setValue((value!==null) ? Common.Utils.Metric.fnRecalcFromMM(value) : '', true);
                    this._state.Width = value;
                }

                value = props.get_Height();
                if ( Math.abs(this._state.Height-value)>0.001 ||
                    (this._state.Height===null || value===null)&&(this._state.Height!==value)) {
                    this.spnHeight.setValue((value!==null) ? Common.Utils.Metric.fnRecalcFromMM(value) : '', true);
                    this._state.Height = value;
                }

                if (props.get_Height()>0)
                    this._nRatio = props.get_Width()/props.get_Height();

                value = props.asc_getLockAspect();
                if (this._state.keepRatio!==value) {
                    this.btnRatio.toggle(value);
                    this._state.keepRatio=value;
                }

                var props3d = this.chartProps ? this.chartProps.getView3d() : null;
                if ( this._state.is3D!==!!props3d ) {
                    this._state.is3D=!!props3d;
                    this.ShowHideElem(this._state.is3D);
                }
                if (props3d) {
                    value = props3d.asc_getRotX();
                    if ((this._state.X===undefined || value===undefined)&&(this._state.X!==value) ||
                        Math.abs(this._state.X-value)>0.001) {
                        this.spnX.setValue((value!==null && value !== undefined) ? value : '', true);
                        this._state.X = value;
                    }

                    value = props3d.asc_getRotY();
                    if ( (this._state.Y===undefined || value===undefined)&&(this._state.Y!==value) ||
                        Math.abs(this._state.Y-value)>0.001) {
                        this.spnY.setValue((value!==null && value !== undefined) ? value : '', true);
                        this._state.Y = value;
                    }

                    value = props3d.asc_getRightAngleAxes();
                    if ( this._state.RightAngle!==value ) {
                        this.chRightAngle.setValue((value !== null && value !== undefined) ? value : 'indeterminate', true);
                        this._state.RightAngle=value;
                    }

                    value = props3d.asc_getPerspective();
                    if ( (this._state.Perspective===undefined || value===undefined)&&(this._state.Perspective!==value) ||
                        Math.abs(this._state.Perspective-value)>0.001) {
                        this.spnPerspective.setMinValue((value!==null && value !== undefined) ? 0.1 : 0);
                        this.spnPerspective.setValue((value!==null && value !== undefined) ? value : 0, true);
                        this._state.Perspective = value;
                    }
                    this.spnPerspective.setDisabled(this._locked || !!this._state.RightAngle);
                    this.btnNarrow.setDisabled(this._locked || !!this._state.RightAngle);
                    this.btnWiden.setDisabled(this._locked || !!this._state.RightAngle);

                    value = props3d.asc_getDepth();
                    if ( Math.abs(this._state.Depth-value)>0.001 ||
                        (this._state.Depth===undefined || value===undefined)&&(this._state.Depth!==value)) {
                        this.spn3DDepth.setValue((value!==null && value !== undefined) ? value : '', true);
                        this._state.Depth = value;
                    }

                    value = props3d.asc_getHeight();
                    if ( Math.abs(this._state.Height3d-value)>0.001 ||
                        (this._state.Height3d===undefined || this._state.Height3d===null || value===null)&&(this._state.Height3d!==value)) {
                        (value!==null) && this.spn3DHeight.setValue(value, true);
                        this.chAutoscale.setValue(value===null, true);
                        this._state.Height3d = value;
                    }
                    this.spn3DHeight.setDisabled(this._locked || value===null);
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
                this.spnWidth && this.spnWidth.setValue((this._state.Width!==null) ? Common.Utils.Metric.fnRecalcFromMM(this._state.Width) : '', true);
                this.spnHeight && this.spnHeight.setValue((this._state.Height!==null) ? Common.Utils.Metric.fnRecalcFromMM(this._state.Height) : '', true);
            }
        },

        createDelayedControls: function() {
            var me = this;
            this.btnChartType = new Common.UI.Button({
                cls         : 'btn-large-dataview',
                iconCls     : 'svgicon chart-bar-normal',
                menu        : new Common.UI.Menu({
                    style: 'width: 364px;',
                    items: [
                        { template: _.template('<div id="id-chart-menu-type" class="menu-insertchart"></div>') }
                    ]
                }),
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.btnChartType.on('render:after', function(btn) {
                me.mnuChartTypePicker = new Common.UI.DataView({
                    el: $('#id-chart-menu-type'),
                    parentMenu: btn.menu,
                    restoreHeight: 535,
                    groups: new Common.UI.DataViewGroupStore(Common.define.chartData.getChartGroupData()),
                    store: new Common.UI.DataViewStore(Common.define.chartData.getChartData()),
                    itemTemplate: _.template('<div id="<%= id %>" class="item-chartlist"><svg width="40" height="40" class=\"icon uni-scale\"><use xlink:href=\"#chart-<%= iconCls %>\"></use></svg></div>'),
                    delayRenderTips: true,
                    delaySelect: Common.Utils.isSafari
                });
            });
            this.btnChartType.render($('#chart-button-type'));
            this.mnuChartTypePicker.on('item:click', _.bind(this.onSelectType, this, this.btnChartType));
            this.lockedControls.push(this.btnChartType);

            this.btnEditData = new Common.UI.Button({
                el: $('#chart-button-edit-data')
            });
            this.btnEditData.on('click', _.bind(this.setEditData, this));
            this.lockedControls.push(this.btnEditData);

            this.spnWidth = new Common.UI.MetricSpinner({
                el: $('#chart-spin-width'),
                step: .1,
                width: 78,
                defaultUnit : "cm",
                value: '3 cm',
                maxValue: 55.88,
                minValue: 0,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
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
                minValue: 0,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.spinners.push(this.spnHeight);
            this.lockedControls.push(this.spnHeight);

            this.spnWidth.on('change', _.bind(this.onWidthChange, this));
            this.spnHeight.on('change', _.bind(this.onHeightChange, this));
            this.spnWidth.on('inputleave', function(){ me.fireEvent('editcomplete', me);});
            this.spnHeight.on('inputleave', function(){ me.fireEvent('editcomplete', me);});

            this.btnRatio = new Common.UI.Button({
                parentEl: $('#chart-button-ratio'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-advanced-ratio',
                style: 'margin-bottom: 1px;',
                enableToggle: true,
                hint: this.textKeepRatio
            });
            this.lockedControls.push(this.btnRatio);

            this.btnRatio.on('click', _.bind(function(btn, e) {
                if (btn.pressed && this.spnHeight.getNumberValue()>0) {
                    this._nRatio = this.spnWidth.getNumberValue()/this.spnHeight.getNumberValue();
                }
                if (this.api)  {
                    var props = new Asc.CAscChartProp();
                    props.asc_putLockAspect(btn.pressed);
                    this.api.ChartApply(props);
                }
                this.fireEvent('editcomplete', this);
            }, this));

            // 3d rotation
            this.spnX = new Common.UI.MetricSpinner({
                el: $('#chart-spin-x'),
                step: 10,
                width: 57,
                defaultUnit : "°",
                value: '20 °',
                maxValue: 359.9,
                minValue: 0,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.lockedControls.push(this.spnX);
            this.spnX.on('change', _.bind(this.onXRotation, this));
            this.spnX.on('inputleave', function(){ me.fireEvent('editcomplete', me);});

            this.btnLeft = new Common.UI.Button({
                parentEl: $('#chart-btn-x-left', me.$el),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-rotate-270',
                hint: this.textLeft,
                dataHint: '1',
                dataHintDirection: 'top'
            });
            this.lockedControls.push(this.btnLeft);
            this.btnLeft.on('click', _.bind(function() {
                this.spnX.setValue(Math.ceil((this.spnX.getNumberValue() - 10)/10)*10);
            }, this));

            this.btnRight= new Common.UI.Button({
                parentEl: $('#chart-btn-x-right', me.$el),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-rotate-90',
                hint: this.textRight,
                dataHint: '1',
                dataHintDirection: 'top'
            });
            this.lockedControls.push(this.btnRight);
            this.btnRight.on('click', _.bind(function() {
                this.spnX.setValue(Math.floor((this.spnX.getNumberValue() + 10)/10)*10);
            }, this));

            this.spnY = new Common.UI.MetricSpinner({
                el: $('#chart-spin-y'),
                step: 10,
                width: 57,
                defaultUnit : "°",
                value: '15 °',
                maxValue: 90,
                minValue: -90,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.lockedControls.push(this.spnY);
            this.spnY.on('change', _.bind(this.onYRotation, this));
            this.spnY.on('inputleave', function(){ me.fireEvent('editcomplete', me);});

            this.btnUp = new Common.UI.Button({
                parentEl: $('#chart-btn-y-up', me.$el),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-rotate-y-clockwise',
                hint: this.textUp,
                dataHint: '1',
                dataHintDirection: 'top'
            });
            this.lockedControls.push(this.btnUp);
            this.btnUp.on('click', _.bind(function() {
                this.spnY.setValue(Math.ceil((this.spnY.getNumberValue() - 10)/10)*10);
            }, this));

            this.btnDown= new Common.UI.Button({
                parentEl: $('#chart-btn-y-down', me.$el),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-rotate-y-counterclockwise',
                hint: this.textDown,
                dataHint: '1',
                dataHintDirection: 'top'
            });
            this.lockedControls.push(this.btnDown);
            this.btnDown.on('click', _.bind(function() {
                this.spnY.setValue(Math.floor((this.spnY.getNumberValue() + 10)/10)*10);
            }, this));

            this.spnPerspective = new Common.UI.MetricSpinner({
                el: $('#chart-spin-persp'),
                step: 5,
                width: 57,
                defaultUnit : "°",
                value: '0 °',
                maxValue: 100,
                minValue: 0.1,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.lockedControls.push(this.spnPerspective);
            this.spnPerspective.on('change', _.bind(this.onPerspective, this));
            this.spnPerspective.on('inputleave', function(){ me.fireEvent('editcomplete', me);});

            this.btnNarrow = new Common.UI.Button({
                parentEl: $('#chart-btn-narrow', me.$el),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-rotate-up',
                hint: this.textNarrow,
                dataHint: '1',
                dataHintDirection: 'top'
            });
            this.lockedControls.push(this.btnNarrow);
            this.btnNarrow.on('click', _.bind(function() {
                this.spnPerspective.setValue(Math.ceil((this.spnPerspective.getNumberValue() - 5)/5)*5);
            }, this));

            this.btnWiden= new Common.UI.Button({
                parentEl: $('#chart-btn-widen', me.$el),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-rotate-down',
                hint: this.textWiden,
                dataHint: '1',
                dataHintDirection: 'top'
            });
            this.lockedControls.push(this.btnWiden);
            this.btnWiden.on('click', _.bind(function() {
                this.spnPerspective.setValue(Math.floor((this.spnPerspective.getNumberValue() + 5)/5)*5);
            }, this));

            this.chRightAngle = new Common.UI.CheckBox({
                el: $('#chart-checkbox-right-angle'),
                labelText: this.textRightAngle
            });
            this.lockedControls.push(this.chRightAngle);
            this.chRightAngle.on('change', _.bind(function(field, newValue, oldValue, eOpts) {
                if (this._noApply) return;
                if (this.api){
                    if (this.chartProps) {
                        var props = new Asc.CAscChartProp();
                        var oView3D = this.chartProps.getView3d();
                        if (oView3D) {
                            oView3D.asc_setRightAngleAxes(field.getValue()=='checked');
                            this.chartProps.putView3d(oView3D);
                            props.put_ChartProperties(this.chartProps);
                            this.api.ChartApply(props);
                        }
                    }
                }
            }, this));

            this.chAutoscale = new Common.UI.CheckBox({
                el: $('#chart-checkbox-autoscale'),
                labelText: this.textAutoscale
            });
            this.lockedControls.push(this.chAutoscale);
            this.chAutoscale.on('change', _.bind(function(field, newValue, oldValue, eOpts) {
                if (this._noApply) return;
                if (this.api){
                    if (this.chartProps) {
                        var props = new Asc.CAscChartProp();
                        var oView3D = this.chartProps.getView3d();
                        if (oView3D) {
                            oView3D.asc_setHeight(field.getValue()=='checked' ? null : this.spn3DHeight.getNumberValue());
                            this.chartProps.putView3d(oView3D);
                            props.put_ChartProperties(this.chartProps);
                            this.api.ChartApply(props);
                        }
                    }
                }
            }, this));

            this.spn3DDepth = new Common.UI.MetricSpinner({
                el: $('#chart-spin-3d-depth'),
                step: 10,
                width: 70,
                defaultUnit : "%",
                value: '0 %',
                maxValue: 2000,
                minValue: 0,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.lockedControls.push(this.spn3DDepth);
            this.spn3DDepth.on('change', _.bind(this.on3DDepth, this));
            this.spn3DDepth.on('inputleave', function(){ me.fireEvent('editcomplete', me);});

            this.spn3DHeight = new Common.UI.MetricSpinner({
                el: $('#chart-spin-3d-height'),
                step: 10,
                width: 70,
                defaultUnit : "%",
                value: '50 %',
                maxValue: 500,
                minValue: 5,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.lockedControls.push(this.spn3DHeight);
            this.spn3DHeight.on('change', _.bind(this.on3DHeight, this));
            this.spn3DHeight.on('inputleave', function(){ me.fireEvent('editcomplete', me);});

            this.linkDefRotation = $('#chart-def-rotate-link');
            $(this.el).on('click', '#chart-def-rotate-link', _.bind(this.onDefRotation, this));

            this.linkAdvanced = $('#chart-advanced-link');
            $(this.el).on('click', '#chart-advanced-link', _.bind(this.openAdvancedSettings, this));

            this.NotCombinedSettings = $('.not-combined');
            this.Chart3DContainer = $('#chart-panel-3d-rotate');
        },

        createDelayedElements: function() {
            this.createDelayedControls();
            this.updateMetricUnit();
            this._initSettings = false;
        },

        setEditData:   function() {
            if (!Common.Controllers.LaunchController.isScriptLoaded()) return;
            var diagramEditor = PE.getController('Common.Controllers.ExternalDiagramEditor').getView('Common.Views.ExternalDiagramEditor');
            if (diagramEditor) {
                diagramEditor.setEditMode(true);
                diagramEditor.show();

                var chart = this.api.asc_getChartObject();
                if (chart) {
                    diagramEditor.setChartData(new Asc.asc_CChartBinary(chart));
                }
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

            if (this.api && !this._noApply) {
                var isCombo = (rawData.type==Asc.c_oAscChartTypeSettings.comboBarLine || rawData.type==Asc.c_oAscChartTypeSettings.comboBarLineSecondary ||
                               rawData.type==Asc.c_oAscChartTypeSettings.comboAreaBar || rawData.type==Asc.c_oAscChartTypeSettings.comboCustom);

                if (isCombo && this.chartProps.getSeries().length<2) {
                    Common.NotificationCenter.trigger('showerror', Asc.c_oAscError.ID.ComboSeriesError, Asc.c_oAscError.Level.NoCritical);
                    this.mnuChartTypePicker.selectRecord(this.mnuChartTypePicker.store.findWhere({type: this._originalProps.getType()}), true);
                } else {
                    this.btnChartType.setIconCls('svgicon ' + 'chart-' + rawData.iconCls);
                    this._state.ChartType = -1;
                    this._originalProps.changeType(rawData.type);
                }
            }
            this.fireEvent('editcomplete', this);
        },

        onSelectStyle: function(combo, record) {
            if (this._noApply) return;

            if (this.api && !this._noApply) {
                var props = new Asc.CAscChartProp();
                this.chartProps.putStyle(record.get('data'));
                props.put_ChartProperties(this.chartProps);
                this.api.ChartApply(props);
            }
            this.fireEvent('editcomplete', this);
        },

        selectCurrentChartStyle: function() {
            if (!this.cmbChartStyle) return;

            this.cmbChartStyle.suspendEvents();
            var rec = this.cmbChartStyle.menuPicker.store.findWhere({data: this._state.ChartStyle});
            this.cmbChartStyle.menuPicker.selectRecord(rec);
            this.cmbChartStyle.resumeEvents();

            if (this._isChartStylesChanged) {
                var currentRecords;
                if (rec)
                    currentRecords = this.cmbChartStyle.fillComboView(this.cmbChartStyle.menuPicker.getSelectedRec(), true);
                else
                    currentRecords = this.cmbChartStyle.fillComboView(this.cmbChartStyle.menuPicker.store.at(0), true);
                if (currentRecords && currentRecords.length>0) {
                    var arr = [];
                    _.each(currentRecords, function(style, index){
                        arr.push(style.get('data'));
                    });
                    return arr;
                }
            }
        },

        onAddChartStylesPreview: function(styles){
            if (!this.cmbChartStyle) return;

            var me = this;
            if (styles && styles.length>0){
                var stylesStore = this.cmbChartStyle.menuPicker.store;
                if (stylesStore) {
                    _.each(styles, function(item, index){
                        var rec = stylesStore.findWhere({
                            data: item.asc_getName()
                        });
                        rec && rec.set('imageUrl', item.asc_getImage());
                    });
                }
            }
        },

        _onUpdateChartStyles: function() {
            if (this.api && this._state.ChartType!==null && this._state.ChartType>-1 &&
                !(this._state.ChartType==Asc.c_oAscChartTypeSettings.comboBarLine || this._state.ChartType==Asc.c_oAscChartTypeSettings.comboBarLineSecondary ||
                  this._state.ChartType==Asc.c_oAscChartTypeSettings.comboAreaBar || this._state.ChartType==Asc.c_oAscChartTypeSettings.comboCustom)) {
                this.updateChartStyles(this.api.asc_getChartPreviews(this._state.ChartType, undefined, true));
                this.api.asc_generateChartPreviews(this._state.ChartType, this.selectCurrentChartStyle());
            }
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
                    cls: 'combo-chart-style',
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'big',
                    delayRenderTips: true,
                    fillOnChangeVisibility: true
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
                    var stylearray = [];
                    _.each(styles, function(item, index){
                        stylearray.push({
                            imageUrl: item.asc_getImage(),
                            data    : item.asc_getName(),
                            tip     : me.textStyle + ' ' + item.asc_getName()
                        });
                    });
                    stylesStore.reset(stylearray, {silent: false});
                }
            } else {
                this.cmbChartStyle.menuPicker.store.reset();
                this.cmbChartStyle.clearComboView();
            }
            this.cmbChartStyle.setDisabled(!styles || styles.length<1 || this._locked);
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
                var props = new Asc.CAscChartProp();
                props.put_Width(Common.Utils.Metric.fnRecalcToMM(w));
                props.put_Height(Common.Utils.Metric.fnRecalcToMM(h));
                this.api.ChartApply(props);
            }
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
                var props = new Asc.CAscChartProp();
                props.put_Width(Common.Utils.Metric.fnRecalcToMM(w));
                props.put_Height(Common.Utils.Metric.fnRecalcToMM(h));
                this.api.ChartApply(props);
            }
        },

        openAdvancedSettings: function(e) {
            if (this.linkAdvanced.hasClass('disabled')) return;

            var me = this;
            var win;
            if (me.api && !this._locked){
                var selectedElements = me.api.getSelectedElements();
                if (selectedElements && selectedElements.length>0){
                    var elType, elValue;
                    for (var i = selectedElements.length - 1; i >= 0; i--) {
                        elType = selectedElements[i].get_ObjectType();
                        elValue = selectedElements[i].get_ObjectValue();
                        if (Asc.c_oAscTypeSelectElement.Chart == elType) {
                            (new PDFE.Views.ChartSettingsAdvanced(
                                {
                                    chartProps: elValue,
                                    slideSize: {width: me.api.get_PageWidth(), height: me.api.get_PageHeight()},
                                    handler: function(result, value) {
                                        if (result == 'ok') {
                                            if (me.api) {
                                                me.api.ChartApply(value.chartProps);
                                            }
                                        }
                                        me.fireEvent('editcomplete', me);
                                    }
                                })).show();
                            break;
                        }
                    }
                }
            }
        },

        ShowCombinedProps: function(type) {
            this.NotCombinedSettings.toggleClass('settings-hidden', type===null || type==Asc.c_oAscChartTypeSettings.comboBarLine || type==Asc.c_oAscChartTypeSettings.comboBarLineSecondary ||
                type==Asc.c_oAscChartTypeSettings.comboAreaBar || type==Asc.c_oAscChartTypeSettings.comboCustom);
        },

        ShowHideElem: function(is3D) {
            this.Chart3DContainer.toggleClass('settings-hidden', !is3D);
            this.fireEvent('updatescroller', this);
        },

        onXRotation: function(field, newValue, oldValue, eOpts){
            if (this._noApply) return;
            if (this.api){
                if (this.chartProps) {
                    var props = new Asc.CAscChartProp();
                    var oView3D = this.chartProps.getView3d();
                    if (oView3D) {
                        oView3D.asc_setRotX(field.getNumberValue());
                        this.chartProps.putView3d(oView3D);
                        props.put_ChartProperties(this.chartProps);
                        this.api.ChartApply(props);
                    }
                }
            }
        },

        onYRotation: function(field, newValue, oldValue, eOpts){
            if (this._noApply) return;
            if (this.api){
                if (this.chartProps) {
                    var props = new Asc.CAscChartProp();
                    var oView3D = this.chartProps.getView3d();
                    if (oView3D) {
                        oView3D.asc_setRotY(field.getNumberValue());
                        this.chartProps.putView3d(oView3D);
                        props.put_ChartProperties(this.chartProps);
                        this.api.ChartApply(props);
                    }
                }
            }

        },

        onPerspective: function(field, newValue, oldValue, eOpts){
            if (this._noApply) return;
            if (this.api){
                if (this.chartProps) {
                    var props = new Asc.CAscChartProp();
                    var oView3D = this.chartProps.getView3d();
                    if (oView3D) {
                        oView3D.asc_setPerspective(field.getNumberValue());
                        this.chartProps.putView3d(oView3D);
                        props.put_ChartProperties(this.chartProps);
                        this.api.ChartApply(props);
                    }
                }
            }
        },

        on3DDepth: function(field, newValue, oldValue, eOpts){
            if (this._noApply) return;
            if (this.api){
                if (this.chartProps) {
                    var props = new Asc.CAscChartProp();
                    var oView3D = this.chartProps.getView3d();
                    if (oView3D) {
                        oView3D.asc_setDepth(field.getNumberValue());
                        this.chartProps.putView3d(oView3D);
                        props.put_ChartProperties(this.chartProps);
                        this.api.ChartApply(props);
                    }
                }
            }
        },

        on3DHeight: function(field, newValue, oldValue, eOpts){
            if (this._noApply) return;
            if (this.api){
                if (this.chartProps) {
                    var props = new Asc.CAscChartProp();
                    var oView3D = this.chartProps.getView3d();
                    if (oView3D) {
                        oView3D.asc_setHeight(field.getNumberValue());
                        this.chartProps.putView3d(oView3D);
                        props.put_ChartProperties(this.chartProps);
                        this.api.ChartApply(props);
                    }
                }
            }
        },

        onDefRotation: function() {
            if (this._noApply) return;
            if (this.api){
                if (this.chartProps) {
                    var props = new Asc.CAscChartProp();
                    var oView3D = this.chartProps.getView3d();
                    if (oView3D) {
                        oView3D.asc_setRotX(20);
                        oView3D.asc_setRotY(15);
                        this.chartProps.putView3d(oView3D);
                        props.put_ChartProperties(this.chartProps);
                        this.api.ChartApply(props);
                    }
                }
            }
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
        textEditData: 'Edit Data',
        textChartType: 'Change Chart Type',
        textStyle:          'Style',
        textAdvanced:   'Show advanced settings',
        text3dRotation: '3D Rotation',
        textX: 'X rotation',
        textY: 'Y rotation',
        textPerspective: 'Perspective',
        text3dDepth: 'Depth (% of base)',
        text3dHeight: 'Height (% of base)',
        textLeft: 'Left',
        textRight: 'Right',
        textUp: 'Up',
        textDown: 'Down',
        textNarrow: 'Narrow field of view',
        textWiden: 'Widen field of view',
        textRightAngle: 'Right Angle Axes',
        textAutoscale: 'Autoscale',
        textDefault: 'Default Rotation'
    }, PDFE.Views.ChartSettings || {}));
});