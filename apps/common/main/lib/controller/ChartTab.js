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
    'common/main/lib/view/ChartTab'
], function () {
    'use strict';
    Common.Controllers.ChartTab = Backbone.Controller.extend(_.extend({
        models : [],
        collections : [
        ],
        views : [
            'Common.Views.ChartTab'
        ],
        sdkViewName : '#id_main',
        initialize: function () {
            this._state = {
                Width: 0,
                Height: 0,
                ChartStyle: 1,
                ChartType: -1,
                CanBeFlow: true,
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
                'Common.Views.ChartTab': {
                    'charttab:3dsettings':               _.bind(this.open3DSettings, this),
                    'charttab:widthchange':              _.bind(this.onWidthChange, this),
                    'charttab:heightchange':             _.bind(this.onHeightChange, this),
                    'charttab:ratio':                    _.bind(this.onToggleRatio, this),
                    'charttab:advanced':                 _.bind(this.openAdvancedSettings, this),
                    'charttab:editdata':                 _.bind(this.setEditData, this),
                    'charttab:updatedata':               _.bind(this.onUpdateData, this),
                    'charttab:editdataext':              _.bind(this.onEditDataExt, this),
                },
            });
        },

        onEditDataExt: function (menu, item, e) {
            if (item.value === 'data') {
                if (!Common.Controllers.LaunchController.isScriptLoaded()) return;
                this.api.asc_editChartInFrameEditor();
            } else if (item.value === 'links') {
                if (!Common.Controllers.LaunchController.isScriptLoaded()) return;
                Common.NotificationCenter.trigger('data:externallinks');
            } else if (item.value === 'file') {
                Common.NotificationCenter.trigger('data:openlink', this.chartProps.getExternalReference());
            }
        },

        onUpdateData: function() {
            if (!Common.Controllers.LaunchController.isScriptLoaded()) return;
            Common.NotificationCenter.trigger('data:updatereferences', [this.chartProps.getExternalReference()]);
        },

        setEditData: function() {
            if (!Common.Controllers.LaunchController.isScriptLoaded()) return;
            this.api.asc_editChartInFrameEditor();
        },

        openAdvancedSettings: function(e) {
            if (this.view.btnAdvancedSettings.isDisabled()) return;

            var me = this;
            var win;
            if (me.api){
                var selectedElements = me.api.getSelectedElements();
                if (selectedElements && selectedElements.length>0){
                    var elType, elValue;
                    for (var i = selectedElements.length - 1; i >= 0; i--) {
                        elType = selectedElements[i].get_ObjectType();
                        elValue = selectedElements[i].get_ObjectValue();
                        var isChart = !!(elValue && elValue.get_ChartProperties());
                        if (Asc.c_oAscTypeSelectElement.Image == elType) {
                            (new DE.Views.ImageSettingsAdvanced(
                                {
                                    imageProps: elValue,
                                    chartSettings: isChart ? me.api.asc_getChartSettings() : null,
                                    sectionProps: me.api.asc_GetSectionProps(),
                                    api         : me.api,
                                    handler: function(result, value) {
                                        if (result == 'ok') {
                                            if (me.api) {
                                                me.api.ImgApply(value.imageProps);
                                            }
                                        }
                                        me.view.fireEvent('editcomplete', me);
                                    }
                            })).show();
                            break;
                        }
                    }
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
                this.api.ImgApply(props);
            }
        },

        onWidthChange: function(field, newValue, oldValue, eOpts){
            var w = field.getNumberValue();
            var h = this.view.spnHeight.getNumberValue();
            if (this.view.chRatio.getValue() === 'checked') {
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
                props.put_ResetCrop(false);
                this.api.ImgApply(props);
            }
        },

        onHeightChange: function(field, newValue, oldValue, eOpts){
            var h = field.getNumberValue(), w = this.view.spnWidth.getNumberValue();
            if (this.view.chRatio.getValue() === 'checked') {
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
                props.put_ResetCrop(false);
                this.api.ImgApply(props);
            }
        },

        open3DSettings: function () {
            if (this.view.btn3DSettings.isDisabled() || !Common.Controllers.LaunchController.isScriptLoaded()) return;

            var me = this;
            var win;
            if (me.api){
                var props = new Asc.asc_CImgProperty();
                if (props) {
                    var oView3D = me.chartProps.getView3d();
                    (new Common.Views.Charts3DDlg(
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
                                                me.chartProps.putView3d(obj);
                                                props.put_ChartProperties(me.chartProps);
                                                me.api.ImgApply(props);
                                            }
                                        }
                                    }
                                }
                                Common.NotificationCenter.trigger('edit:complete', me);
                            }
                        })).show();
                }
            }
        },

        setApi: function(api) {
            if (api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',_.bind(this.SetDisabled, this));
                Common.NotificationCenter.on('api:disconnect', _.bind(this.SetDisabled, this));
                this.api.asc_registerCallback('asc_onFocusObject',       _.bind(this.onApiFocusObject, this));
                this.api.asc_registerCallback('asc_onAddChartStylesPreview', _.bind(this.onAddChartStylesPreview, this));
                this.api.asc_registerCallback('asc_onUpdateChartStyles', _.bind(this._onUpdateChartStyles, this));
                this.api.asc_registerCallback('asc_onStartUpdateExternalReference', _.bind(this.onStartUpdateExternalReference, this));
                Common.NotificationCenter.on('cells:range',                 _.bind(this.onCellsRange, this));
            }
            return this;
        },

        onStartUpdateExternalReference: function(status) {
            this._state.isUpdatingReference = status;
            // if (this._initSettings) return;
            
            // var externalRef = this.chartProps.getExternalReference();
            // this.btnEditData.setDisabled(this._locked || externalRef && this._state.isUpdatingReference);
            // this.btnUpdateData.setDisabled(this._locked || this._state.isUpdatingReference);
            // this.linkExternalSrc.toggleClass('disabled', this._locked || !!this._state.isUpdatingReference);
        },

        onAddChartStylesPreview: function(styles){
            if (!this.view.chartStyles) return;

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

        createDelayedElements: function () {
            if (this.spinners.length === 0) {
                this.spinners.push(this.view.spnHeight);
                this.spinners.push(this.view.spnWidth);
            }
            this.updateMetricUnit();
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

        ChangeSettings: function(props) {
            var me = this;
            this.createDelayedElements();

            if (props  && props.get_ChartProperties()){
                this._originalProps = new Asc.asc_CImgProperty(props);

                this._noApply = true;
                var value = props.get_WrappingStyle();
                if (this._state.WrappingStyle!==value) {
                    this._state.WrappingStyle=value;
                }

                this.chartProps = props.get_ChartProperties();

                var externalRef = this.chartProps.getExternalReference();
                // this.lblLinkData.text(externalRef ? this.textLinkedData : this.textData);
                // this.btnEditData.setCaption(externalRef ? this.textSelectData : this.textEditData);
                // this.ExternalOnlySettings.toggleClass('settings-hidden', !externalRef);
                var text = externalRef ? (externalRef.asc_getSource() || '').replace(new RegExp("%20",'g')," ") : '';
                // this.linkExternalSrc.text(text);
                // this.OpenLinkSettings.toggleClass('settings-hidden', !text || !(this.mode.canRequestOpen || this.mode.isOffline));

                value = props.get_SeveralCharts();
                // this.btnEditData.setDisabled(value || externalRef && this._state.isUpdatingReference);
                // this.view.btnUpdateData.setDisabled(value || this._state.isUpdatingReference);
                // this.btnEditLinks.setDisabled(this._locked);
                this._state.SeveralCharts=value;

                this.view.btnUpdateData.setVisible(externalRef);
                this.view.btnEditDataExt.setVisible(externalRef);
                this.view.btnEditData.setVisible(!externalRef);
                this.view.btnEditDataExt.menu.items[2].setCaption(me.menuCapOpen + ` ${text}`);
                value = props.asc_getSeveralChartTypes();
                var type = (this._state.SeveralCharts && value) ? null : this.chartProps.getType();
                if (this._state.ChartType !== type) {
                    var isCombo =
                        type === null ||
                        type === Asc.c_oAscChartTypeSettings.comboBarLine ||
                        type === Asc.c_oAscChartTypeSettings.comboBarLineSecondary ||
                        type === Asc.c_oAscChartTypeSettings.comboAreaBar ||
                        type === Asc.c_oAscChartTypeSettings.comboCustom;
                    this.ShowCombinedProps(type);
                    if (!isCombo) {
                        this.updateChartStyles(this.api.asc_getChartPreviews(type, undefined, true));
                    }
                    this.view.$el.find('.separator-chart-styles')[isCombo ? 'hide' : 'show']();
                    this._state.ChartType = type;
                }

                if (!(type==Asc.c_oAscChartTypeSettings.comboBarLine || type==Asc.c_oAscChartTypeSettings.comboBarLineSecondary ||
                    type==Asc.c_oAscChartTypeSettings.comboAreaBar || type==Asc.c_oAscChartTypeSettings.comboCustom)) {
                    value = props.get_SeveralChartStyles();
                    if (this._state.SeveralCharts && value) {
                        this.view.chartStyles.fieldPicker.deselectAll();
                        this.view.chartStyles.menuPicker.deselectAll();
                        this._state.ChartStyle = null;
                    } else {
                        value = this.chartProps.getStyle();
                        if (this._state.ChartStyle !== value || this._isChartStylesChanged) {
                            this._state.ChartStyle = value;
                            var arr = this.selectCurrentChartStyle();
                            this._isChartStylesChanged && this.api.asc_generateChartPreviews(this._state.ChartType, arr);
                        }
                    }
                    this._isChartStylesChanged = false;
                }

                this._noApply = false;

                value = props.get_CanBeFlow();
                var fromgroup = props.get_FromGroup();
                this._state.CanBeFlow=value;
                this._state.FromGroup=fromgroup;

                value = props.get_Width();
                if ( Math.abs(this._state.Width-value)>0.001 ||
                    (this._state.Width===null || value===null)&&(this._state.Width!==value)) {
                    this.view.spnWidth.setValue((value!==null) ? Common.Utils.Metric.fnRecalcFromMM(value) : '', true);
                    this._state.Width = value;
                }

                value = props.get_Height();
                if ( Math.abs(this._state.Height-value)>0.001 ||
                    (this._state.Height===null || value===null)&&(this._state.Height!==value)) {
                    this.view.spnHeight.setValue((value!==null) ? Common.Utils.Metric.fnRecalcFromMM(value) : '', true);
                    this._state.Height = value;
                }

                if (props.get_Height()>0)
                    this._nRatio = props.get_Width()/props.get_Height();

                value = props.asc_getLockAspect();
                if (this._state.keepRatio!==value) {
                    this.view.chRatio.setValue(value, true);
                    this._state.keepRatio=value;
                }

                var props3d = this.chartProps ? this.chartProps.getView3d() : null;

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
                this.view.$el.find('.separator-chart-3d')[props3d ? 'show' : 'hide']();
                this.view.btn3DSettings.setVisible(props3d)
            }
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

        updateChartStyles: function(styles) {
            var me = this;
            this._isChartStylesChanged = true;

            this.view.chartStyles.on('click', _.bind(this.onSelectStyle, this));
            this.view.chartStyles.openButton.menu.on('show:after', function () {
                me.view.chartStyles.menuPicker.scroller.update({alwaysVisibleY: true});
            });
            this.view.lockedControls.push(this.view.chartStyles);

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
            Common.Utils.lockControls(Common.enumLock.noStyles, !styles || styles.length<1, {array: [this.view.chartStyles]});
        },

        onSelectStyle: function(combo, record) {
            if (this._noApply) return;

            if (this.api && !this._noApply && this.chartProps) {
                var props = new Asc.asc_CImgProperty();
                this.chartProps.putStyle(record.get('data'));
                props.put_ChartProperties(this.chartProps);
                this.api.ImgApply(props);
            }
            this.view.fireEvent('editcomplete', this);
        },

        ShowCombinedProps: function(type) {
            this.view.chartStyles.setVisible(!(type===null || type==Asc.c_oAscChartTypeSettings.comboBarLine || type==Asc.c_oAscChartTypeSettings.comboBarLineSecondary ||
                                                                       type==Asc.c_oAscChartTypeSettings.comboAreaBar || type==Asc.c_oAscChartTypeSettings.comboCustom));
        },

        setMode: function(mode) {
            this.appConfig = mode;
            return this;
        },

        setConfig: function(config) {
            this.view = this.createView('Common.Views.ChartTab', {
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

        onApiFocusObject: function (selected) {
            var header_locked = undefined;
            var frame_pr = undefined;
            var islocked = false;
            var paragraph_locked = undefined;
            var in_control = false;

            for (var i = 0; i < selected.length; i++) {
                var pr = selected[i].get_ObjectValue();
                if (selected[i].asc_getObjectType() === Asc.c_oAscTypeSelectElement.Image) {
                    islocked = pr.get_Locked();
                    if (pr && pr.get_ChartProperties())
                        this.ChangeSettings(selected[i].asc_getObjectValue());
                }
            };

            in_control = this.api.asc_IsContentControl();
            var control_props = in_control ? this.api.asc_GetContentControlProperties() : null,
                lock_type = (in_control&&control_props) ? control_props.get_Lock() : Asc.c_oAscSdtLockType.Unlocked;

            (lock_type===undefined) && (lock_type = Asc.c_oAscSdtLockType.Unlocked);
            var content_locked = lock_type==Asc.c_oAscSdtLockType.SdtContentLocked || lock_type==Asc.c_oAscSdtLockType.ContentLocked;

            Common.Utils.lockControls(Common.enumLock.paragraphLock, paragraph_locked,   {array: this.view.lockedControls});
            Common.Utils.lockControls(Common.enumLock.headerLock, header_locked,   {array: this.view.lockedControls});
            Common.Utils.lockControls(Common.enumLock.imageLock, islocked,   {array: this.view.lockedControls});
            Common.Utils.lockControls(Common.enumLock.contentLock, content_locked,   {array: this.view.lockedControls});
        },

        onCellsRange: function(status) {
            this.rangeSelectionMode = (status != Asc.c_oAscSelectionDialogType.None);
        },

    }, Common.Controllers.ChartTab || {}));
});