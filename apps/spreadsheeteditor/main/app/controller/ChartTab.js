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
 *  ChartTab.js
 *
 *  Created on 06.10.2025
 *
 */

define([
    'core',
    'spreadsheeteditor/main/app/view/ChartTab'
], function () {
    'use strict';

    SSE.Controllers.ChartTab = Backbone.Controller.extend(_.extend({
        models : [],
        collections : [
        ],
        views : [
            'ChartTab'
        ],
        sdkViewName : '#id_main',

        initialize: function () {
            this._state = {
                Width: 0,
                Height: 0,
                ChartStyle: 1,
                ChartType: -1,
                SeveralCharts: false,
                DisabledControls: false,
                keepRatio: false,
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
                    'charttab:advanced':                 _.bind(this.openAdvancedSettings, this),
                    'charttab:type':                     _.bind(this.onChangeType, this),
                    'charttab:selectdata':               _.bind(this.onSelectData, this),
                    'charttab:rowscols':                 _.bind(this.onSwitchRowsCols, this),
                    'charttab:widthchange':              _.bind(this.onWidthChange, this),
                    'charttab:heightchange':             _.bind(this.onHeightChange, this),
                    'charttab:ratio':                    _.bind(this.onToggleRatio, this),
                    'charttab:3dsettings':               _.bind(this.open3DSettings, this),
                },
            });
        },

        open3DSettings: function () {
            if (this.view.btn3DSettings.isDisabled() || !Common.Controllers.LaunchController.isScriptLoaded()) return;

            var me = this;
            var win, props;
            if (me.api){
                props = (me.isChart) ? me.api.asc_getChartSettings() : me._originalProps;
                if (props) {
                    var oView3D = props.getView3d();
                    (new SSE.Views.Charts3DDlg(
                        {
                            oView3D: oView3D,
                            chartProps: props,
                            X: me._state.X,
                            Y: me._state.Y,
                            RightAngle: me._state.RightAngle,
                            Perspective: me._state.Perspective,
                            Depth: me._state.Depth,
                            Height3d: me._state.Height3d,
                            api: me.api,
                            handler: function(result, obj, props) {
                                if (result == 'ok') {
                                    if (me.api) {
                                        if (props) {
                                            if (obj) {
                                                props.startEdit();
                                                props.setView3d(obj);
                                                props.endEdit();
                                            }
                                        }
                                        console.log(result)
                                    }
                                }
                                Common.NotificationCenter.trigger('edit:complete', me);
                            }
                        })).show();
                }
            }
        },

        onToggleRatio: function (value) {
            if (value && this.view.spnHeight.getNumberValue()>0) {
                this._nRatio = this.view.spnWidth.getNumberValue()/this.view.spnHeight.getNumberValue();
            }
            if (this.api)  {
                var props = new Asc.asc_CImgProperty();
                props.asc_putLockAspect(value);
                this.api.asc_setGraphicObjectProps(props);
            }
        },

        ChangeSettings: function(props) {
            if (this._initSettings) {
                this.updateMetricUnit();
                this.spinners.push(this.view.spnWidth);
                this.spinners.push(this.view.spnHeight);
            }

            if (this._isEditType) {
                this._props = props;
                return;
            }

            var isChart = !!(props && props.asc_getChartProperties && props.asc_getChartProperties()),
                chartSettings = isChart ? this.api.asc_getChartSettings(true) : null, // don't lock chart object
                props3d = chartSettings ? chartSettings.getView3d() : null;

            this._state.is3D=!!props3d;
            this.disableControls(this._locked);
            if (this.api && props){
                if (isChart) { // chart
                    this._originalProps = new Asc.asc_CImgProperty(props);
                    this.isChart = true;

                    this._noApply = true;
                    this.chartProps = props.asc_getChartProperties();

                    var value = props.asc_getSeveralCharts() || this._locked;
                    if (this._state.SeveralCharts!==value) {
                        this.view.btnAdvancedSettings.setDisabled(value)
                        this._state.SeveralCharts=value;
                    }

                    value = props.asc_getSeveralChartTypes();
                    var type = (this._state.SeveralCharts && value) ? null : this.chartProps.getType();
                    if (this._state.ChartType !== type) {
                        this.ShowCombinedProps(type);
                        !(type===null || type==Asc.c_oAscChartTypeSettings.comboBarLine || type==Asc.c_oAscChartTypeSettings.comboBarLineSecondary ||
                        type==Asc.c_oAscChartTypeSettings.comboAreaBar || type==Asc.c_oAscChartTypeSettings.comboCustom) && this.updateChartStyles(this.api.asc_getChartPreviews(type, undefined, true));
                        this._state.ChartType = type;
                    }

                    if (!(type==Asc.c_oAscChartTypeSettings.comboBarLine || type==Asc.c_oAscChartTypeSettings.comboBarLineSecondary ||
                          type==Asc.c_oAscChartTypeSettings.comboAreaBar || type==Asc.c_oAscChartTypeSettings.comboCustom)) {
                        value = props.asc_getSeveralChartStyles();
                        if (this._state.SeveralCharts && value) {
                            this.view.chartStyles.fieldPicker.deselectAll();
                            this.view.chartStyles.menuPicker.deselectAll();
                            this._state.ChartStyle = null;
                        } else {
                            value = this.chartProps.getStyle();
                            if (this._state.ChartStyle!==value || this._isChartStylesChanged) {
                                this._state.ChartStyle=value;
                                var arr = this.selectCurrentChartStyle();
                                this._isChartStylesChanged && this.api.asc_generateChartPreviews(this._state.ChartType, arr);
                            }
                        }
                        this._isChartStylesChanged = false;
                    }

                    this._noApply = false;

                    value = props.asc_getWidth();
                    if ( Math.abs(this._state.Width-value)>0.001 ||
                        (this._state.Width===null || value===null)&&(this._state.Width!==value)) {
                        this.view.spnWidth.setValue((value!==null) ? Common.Utils.Metric.fnRecalcFromMM(value) : '', true);
                        this._state.Width = value;
                    }

                    value = props.asc_getHeight();
                    if ( Math.abs(this._state.Height-value)>0.001 ||
                        (this._state.Height===null || value===null)&&(this._state.Height!==value)) {
                        this.view.spnHeight.setValue((value!==null) ? Common.Utils.Metric.fnRecalcFromMM(value) : '', true);
                        this._state.Height = value;
                    }

                    if (props.asc_getHeight()>0)
                        this._nRatio = props.asc_getWidth()/props.asc_getHeight();

                    value = props.asc_getLockAspect();
                    if (this._state.keepRatio!==value) {
                        this.view.chRatio.setValue(value, true);
                        this._state.keepRatio=value;
                    }

                    var series = chartSettings ? chartSettings.getSeries() : null;
                    this.view.btnSwitchRowsCols.setDisabled(this._locked || !series || series.length<1 || !chartSettings || !chartSettings.getRange());

                    if (props3d) {
                        value = props3d.asc_getRotX();
                        if ((this._state.X===undefined || value===undefined)&&(this._state.X!==value) ||
                            Math.abs(this._state.X-value)>0.001) {
                            this._state.X = value;
                        }

                        value = props3d.asc_getRotY();
                        if ( (this._state.Y===undefined || value===undefined)&&(this._state.Y!==value) ||
                            Math.abs(this._state.Y-value)>0.001) {
                            this._state.Y = value;
                        }

                        value = props3d.asc_getRightAngleAxes();
                        if ( this._state.RightAngle!==value ) {
                            this._state.RightAngle=value;
                        }

                        value = props3d.asc_getPerspective();
                        if ( (this._state.Perspective===undefined || value===undefined)&&(this._state.Perspective!==value) ||
                            Math.abs(this._state.Perspective-value)>0.001) {
                            this._state.Perspective = value;
                        }

                        value = props3d.asc_getDepth();
                        if ( Math.abs(this._state.Depth-value)>0.001 ||
                            (this._state.Depth===undefined || value===undefined)&&(this._state.Depth!==value)) {
                            this._state.Depth = value;
                        }

                        value = props3d.asc_getHeight();
                        if ( Math.abs(this._state.Height3d-value)>0.001 ||
                            (this._state.Height3d===undefined || this._state.Height3d===null || value===null)&&(this._state.Height3d!==value)) {
                            this._state.Height3d = value;
                        }
                    }
                    this.view.btn3DSettings.setVisible(props3d)
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
                this.view.spnWidth && this.view.spnWidth.setValue((this._state.Width!==null) ? Common.Utils.Metric.fnRecalcFromMM(this._state.Width) : '', true);
                this.view.spnHeight && this.view.spnHeight.setValue((this._state.Height!==null) ? Common.Utils.Metric.fnRecalcFromMM(this._state.Height) : '', true);
            }
        },

        openAdvancedSettings: function() {
            if (this.view.btnAdvancedSettings.isDisabled() || !Common.Controllers.LaunchController.isScriptLoaded()) return;

            var me = this;
            var win, props;
            if (me.api){
                props = (me.isChart) ? me.api.asc_getChartSettings() : me._originalProps;
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
                                            if (value.imageSettings) {
                                                value.imageSettings.asc_putChartProperties(value.chartSettings);
                                                me.api.asc_setGraphicObjectProps(value.imageSettings);
                                            } else
                                                me.api.asc_applyChartSettings(value.chartSettings);
                                        }
                                    }
                                }
                                Common.NotificationCenter.trigger('edit:complete', me);
                            }
                        })).show();
                }
            }
        },

        onChangeType: function() {
            var me = this;
            if (me.api){
                me._isEditType = true;
                var win = new SSE.Views.ChartWizardDialog({
                    api: me.api,
                    props: {recommended: me.api.asc_getRecommendedChartData()},
                    type: me._state.ChartType,
                    isEdit: true,
                    handler: function(result, value) {
                        if (result == 'ok') {
                            me._isEditType = false;
                            me.api && me.api.asc_addChartSpace(value);
                        }
                        Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                    }
                }).on('close', function() {
                    me._isEditType = false;
                });
                win.show();
            }
        },

        onSelectData:   function() {
            if (!Common.Controllers.LaunchController.isScriptLoaded()) {
                return;
            }

            var me = this;
            var props;
            if (me.api){
                props = me.api.asc_getChartSettings();
                if (props) {
                    me._isEditRanges = true;
                    props.startEdit();
                    var win = new SSE.Views.ChartDataDialog({
                        chartSettings: props,
                        api: me.api,
                        handler: function(result, value) {
                            if (result == 'ok') {
                                props.endEdit();
                                me._isEditRanges = false;
                            }
                            Common.NotificationCenter.trigger('edit:complete', me);
                        }
                    }).on('close', function() {
                        me._isEditRanges && props.cancelEdit();
                        me._isEditRanges = false;
                    });
                    win.show();
                }
            }
        },

        onSwitchRowsCols: function() {
            if (this.api){
                var props = this.api.asc_getChartSettings(true);
                if (props) {
                    props.startEdit();
                    var res = props.switchRowCol();
                    if (res === Asc.c_oAscError.ID.MaxDataSeriesError) {
                        props.cancelEdit();
                        Common.UI.warning({msg: this.errorMaxRows, maxwidth: 600});
                    } else
                        props.endEdit();
                }
            }
        },

        onWidthChange: function(field, newValue, oldValue, eOpts){
            var w = field.getNumberValue();
            var h = this.view.spnHeight.getNumberValue();
            if (this.view.chRatio.getValue()) {
                h = w/this._nRatio;
                if (h>this.view.spnHeight.options.maxValue) {
                    h = this.view.spnHeight.options.maxValue;
                    w = h * this._nRatio;
                    this.view.spnWidth.setValue(w, true);
                }
                this.view.spnHeight.setValue(h, true);
            }
            if (this.api)  {
                var props = new Asc.asc_CImgProperty();
                props.asc_putWidth(Common.Utils.Metric.fnRecalcToMM(w));
                props.asc_putHeight(Common.Utils.Metric.fnRecalcToMM(h));
                this.api.asc_setGraphicObjectProps(props);
            }
        },

        onHeightChange: function(field, newValue, oldValue, eOpts){
            var h = field.getNumberValue(), w = this.spnWidth.getNumberValue();
            if (this.view.chRatio.getValue()) {
                w = h * this._nRatio;
                if (w>this.view.spnWidth.options.maxValue) {
                    w = this.view.spnWidth.options.maxValue;
                    h = w/this._nRatio;
                    this.view.spnHeight.setValue(h, true);
                }
                this.view.spnWidth.setValue(w, true);
            }
            if (this.api)  {
                var props = new Asc.asc_CImgProperty();
                props.asc_putWidth(Common.Utils.Metric.fnRecalcToMM(w));
                props.asc_putHeight(Common.Utils.Metric.fnRecalcToMM(h));
                this.api.asc_setGraphicObjectProps(props);
            }
        },

        disableControls: function(disable) {
            if (this._initSettings) return;
            
            if (this._state.DisabledControls!==disable) {
                this._state.DisabledControls = disable;
                _.each(this.lockedControls, function(item) {
                    item.setDisabled(disable);
                });
                this.view.btnAdvancedSettings.setDisabled(disable);
            }
        },

        ShowCombinedProps: function(type) {
            this.view.chartStyles.setVisible(!(type===null || type==Asc.c_oAscChartTypeSettings.comboBarLine || type==Asc.c_oAscChartTypeSettings.comboBarLineSecondary ||
                                                                       type==Asc.c_oAscChartTypeSettings.comboAreaBar || type==Asc.c_oAscChartTypeSettings.comboCustom));
        },

        updateChartStyles: function(styles) {
            var me = this;
            this._isChartStylesChanged = true;

            this.view.chartStyles.render($('#chart-combo-style'));
            this.view.chartStyles.on('click', _.bind(this.onSelectStyle, this));
            this.view.chartStyles.openButton.menu.on('show:after', function () {
                me.view.chartStyles.menuPicker.scroller.update({alwaysVisibleY: true});
            });
            this.lockedControls.push(this.view.chartStyles);

            if (styles && styles.length>0){
                var stylesStore = this.view.chartStyles.menuPicker.store;
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
                this.view.chartStyles.menuPicker.store.reset();
                this.view.chartStyles.clearComboView();
            }
            this.view.chartStyles.setDisabled(!styles || styles.length<1 || this._locked);
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

        selectCurrentChartStyle: function() {
            if (!this.view.chartStyles) return;

            this.view.chartStyles.suspendEvents();
            var rec = this.view.chartStyles.menuPicker.store.findWhere({data: this._state.ChartStyle});
            this.view.chartStyles.menuPicker.selectRecord(rec);
            this.view.chartStyles.resumeEvents();

            if (this._isChartStylesChanged) {
                var currentRecords;
                if (rec)
                    currentRecords = this.view.chartStyles.fillComboView(this.view.chartStyles.menuPicker.getSelectedRec(), true);
                else
                    currentRecords = this.view.chartStyles.fillComboView(this.view.chartStyles.menuPicker.store.at(0), true);
                if (currentRecords && currentRecords.length>0) {
                    var arr = [];
                    _.each(currentRecords, function(style, index){
                        arr.push(style.get('data'));
                    });
                    return arr;
                }
            }
        },

        setApi: function(api) {
            if (api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',_.bind(this.SetDisabled, this));
                Common.NotificationCenter.on('api:disconnect', _.bind(this.SetDisabled, this));
                this.api.asc_registerCallback('asc_onSelectionChanged',     _.bind(this.onSelectionChanged, this));
                this.api.asc_registerCallback('asc_onAddChartStylesPreview', _.bind(this.onAddChartStylesPreview, this));
                this.api.asc_registerCallback('asc_onUpdateChartStyles', _.bind(this._onUpdateChartStyles, this));
                Common.NotificationCenter.on('cells:range',                 _.bind(this.onCellsRange, this));
            }
            return this;
        },

        onAddChartStylesPreview: function(styles){
            if (this._isEditType || !this.view.chartStyles) return;

            if (styles && styles.length>0){
                var stylesStore = this.view.chartStyles.menuPicker.store;
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

        setMode: function(mode) {
            this.appConfig = mode;
            return this;
        },

        setConfig: function(config) {
            this.view = this.createView('ChartTab', {
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
                            this.ChangeSettings(this.api.asc_getGraphicObjectProps()[i].asc_getObjectValue());
                            break;
                        }
                    }
                }
        },

        onCellsRange: function(status) {
            this.rangeSelectionMode = (status != Asc.c_oAscSelectionDialogType.None);
        },

    }, SSE.Controllers.ChartTab || {}));
});