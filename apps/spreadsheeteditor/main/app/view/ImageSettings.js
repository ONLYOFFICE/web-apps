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
 *  ImageSettings.js
 *
 *  Created on 3/28/14
 *
 */

define([
    'text!spreadsheeteditor/main/app/template/ImageSettings.template',
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/component/Button',
    'common/main/lib/component/MetricSpinner',
], function (menuTemplate, $, _, Backbone) {
    'use strict';

    SSE.Views.ImageSettings = Backbone.View.extend(_.extend({
        el: '#id-image-settings',

        // Compile our stats template
        template: _.template(menuTemplate),

        // Delegated events for creating new items, and clearing completed ones.
        events: {
        },

        options: {
            alias: 'ImageSettings'
        },

        initialize: function () {
            this._initSettings = true;

            this._nRatio = 1;
            this._state = {
                Width: 0,
                Height: 0,
                DisabledControls: false,
                keepRatio: false,
                isOleObject: false,
                cropMode: false
            };
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

            this.linkAdvanced = $('#image-advanced-link');
            this.ResetCrop = el.find('#image-button-reset-crop').closest('tr');
        },

        setApi: function(api) {
            if ( api == undefined ) return;
            this.api = api;
            if (this.api) {
                this.api.asc_registerCallback('asc_ChangeCropState', _.bind(this._changeCropState, this));
            }
            Common.NotificationCenter.on('storage:image-insert', _.bind(this.insertImageFromStorage, this));
            return this;
        },

        setMode: function(mode) {
            this.mode = mode;
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
            this.spnWidth = new Common.UI.MetricSpinner({
                el: $('#image-spin-width'),
                step: .1,
                width: 78,
                defaultUnit : "cm",
                value: '3 cm',
                maxValue: 55.88,
                minValue: 0,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                ariaLabel: this.textWidth
            });
            this.spinners.push(this.spnWidth);
            this.lockedControls.push(this.spnWidth);

            this.spnHeight = new Common.UI.MetricSpinner({
                el: $('#image-spin-height'),
                step: .1,
                width: 78,
                defaultUnit : "cm",
                value: '3 cm',
                maxValue: 55.88,
                minValue: 0,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                ariaLabel: this.textHeight
            });
            this.spinners.push(this.spnHeight);
            this.lockedControls.push(this.spnHeight);

            this.btnRatio = new Common.UI.Button({
                parentEl: $('#image-button-ratio'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-advanced-ratio',
                style: 'margin-bottom: 1px;',
                enableToggle: true,
                hint: this.textKeepRatio,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
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

            this.btnOriginalSize = new Common.UI.Button({
                el: $('#image-button-original-size')
            });
            this.lockedControls.push(this.btnOriginalSize);

            this.btnSelectImage = new Common.UI.Button({
                parentEl: $('#image-button-replace'),
                cls: 'btn-text-menu-default',
                caption: this.textInsert,
                style: "width:100%;",
                menu: new Common.UI.Menu({
                    style: 'min-width: 194px;',
                    maxHeight: 200,
                    items: [
                        {caption: this.textFromFile, value: 0},
                        {caption: this.textFromUrl, value: 1},
                        {caption: this.textFromStorage, value: 2}
                    ]
                }),
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.lockedControls.push(this.btnSelectImage);
            this.btnSelectImage.menu.on('item:click', _.bind(this.onImageSelect, this));
            this.btnSelectImage.menu.items[2].setVisible(this.mode.canRequestInsertImage || this.mode.fileChoiceUrl && this.mode.fileChoiceUrl.indexOf("{documentType}")>-1);

            this.btnEditObject = new Common.UI.Button({
                el: $('#image-button-edit-object')
            });
            this.lockedControls.push(this.btnEditObject);

            this.spnWidth.on('change', _.bind(this.onWidthChange, this));
            this.spnHeight.on('change', _.bind(this.onHeightChange, this));
            this.spnWidth.on('inputleave', function(){ Common.NotificationCenter.trigger('edit:complete', me);});
            this.spnHeight.on('inputleave', function(){ Common.NotificationCenter.trigger('edit:complete', me);});
            this.btnOriginalSize.on('click', _.bind(this.setOriginalSize, this));
            this.btnEditObject.on('click', _.bind(function(btn){
                if (!Common.Controllers.LaunchController.isScriptLoaded()) return;
                if (this.api) {
                    var oleobj = this.api.asc_canEditTableOleObject();
                    if (oleobj) {
                        this.api.asc_editOleTableInFrameEditor();
                    } else
                        this.api.asc_startEditCurrentOleObject();
                }
                Common.NotificationCenter.trigger('edit:complete', this);
            }, this));

            var w = this.btnOriginalSize.cmpEl.outerWidth();
            this.btnCrop = new Common.UI.Button({
                parentEl: $('#image-button-crop'),
                cls: 'btn-text-split-default',
                caption: this.textCrop,
                split: true,
                enableToggle: true,
                allowDepress: true,
                pressed: this._state.cropMode,
                width: w,
                menu        : new Common.UI.Menu({
                    style       : 'min-width:' + w + 'px;',
                    items: [
                        {
                            caption: this.textCrop,
                            checkable: true,
                            allowDepress: true,
                            checked: this._state.cropMode,
                            value: 0
                        },
                        {
                            caption:  this.textCropToShape,
                            menu: new Common.UI.Menu({
                                menuAlign: 'tl-tl',
                                cls: 'menu-shapes menu-change-shape',
                                items: []
                            })
                        },
                        {
                            caption: this.textCropFill,
                            value: 1
                        },
                        {
                            caption: this.textCropFit,
                            value: 2
                        }]
                }),
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                ariaLabel: this.textCrop
            });
            this.btnCrop.on('click', _.bind(this.onCrop, this));
            this.btnCrop.menu.on('item:click', _.bind(this.onCropMenu, this));
            this.lockedControls.push(this.btnCrop);
            this.btnChangeShape= this.btnCrop.menu.items[1];

            this.btnResetCrop = new Common.UI.Button({
                parentEl: $('#image-button-reset-crop'),
                cls: 'btn-toolbar align-left',
                caption: this.textResetCrop,
                iconCls: 'toolbar__icon btn-reset',
                style: "min-width:100px",     
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                ariaLabel: this.textResetCrop
            });
            this.btnResetCrop.on('click', _.bind(this.onResetCrop, this));
            this.lockedControls.push(this.btnResetCrop);

            this.numTransparency = new Common.UI.MetricSpinner({
                el: $('#image-spin-transparency'),
                step: 1,
                width: 62,
                value: '100 %',
                defaultUnit : "%",
                maxValue: 100,
                minValue: 0,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                ariaLabel: this.strTransparency
            });
            this.numTransparency.on('change', _.bind(this.onNumTransparencyChange, this));
            this.numTransparency.on('inputleave', function(){ this.fireEvent('editcomplete', this);});
            this.lockedControls.push(this.numTransparency);

            this.sldrTransparency = new Common.UI.SingleSlider({
                el: $('#image-slider-transparency'),
                width: 75,
                minValue: 0,
                maxValue: 100,
                value: 100
            });
            this.sldrTransparency.on('change', _.bind(this.onTransparencyChange, this));
            this.sldrTransparency.on('changecomplete', _.bind(this.onTransparencyChangeComplete, this));
            this.lockedControls.push(this.sldrTransparency);

            this.lblTransparencyStart = $(this.el).find('#image-lbl-transparency-start');
            this.lblTransparencyEnd = $(this.el).find('#image-lbl-transparency-end');

            this.btnRotate270 = new Common.UI.Button({
                parentEl: $('#image-button-270', me.$el),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-rotate-270',
                value: 0,
                hint: this.textHint270,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'small'
            });
            this.btnRotate270.on('click', _.bind(this.onBtnRotateClick, this));
            this.lockedControls.push(this.btnRotate270);

            this.btnRotate90 = new Common.UI.Button({
                parentEl: $('#image-button-90', me.$el),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-rotate-90',
                value: 1,
                hint: this.textHint90,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'small'
            });
            this.btnRotate90.on('click', _.bind(this.onBtnRotateClick, this));
            this.lockedControls.push(this.btnRotate90);

            this.btnFlipV = new Common.UI.Button({
                parentEl: $('#image-button-flipv', me.$el),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-flip-vert',
                value: 0,
                hint: this.textHintFlipV,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'small'
            });
            this.btnFlipV.on('click', _.bind(this.onBtnFlipClick, this));
            this.lockedControls.push(this.btnFlipV);

            this.btnFlipH = new Common.UI.Button({
                parentEl: $('#image-button-fliph', me.$el),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-flip-hor',
                value: 1,
                hint: this.textHintFlipH,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'small'
            });
            this.btnFlipH.on('click', _.bind(this.onBtnFlipClick, this));
            this.lockedControls.push(this.btnFlipH);

            $(this.el).on('click', '#image-advanced-link', _.bind(this.openAdvancedSettings, this));
        },

        createDelayedElements: function() {
            this.createDelayedControls();
            this.updateMetricUnit();
            this.onApiAutoShapes();
            this._initSettings = false;
        },

        openAdvancedSettings: function(e) {
            if (this.linkAdvanced.hasClass('disabled')) return;

            var me = this;
            var win;
            if (me.api && !this._locked){
                var selectedElements = me.api.asc_getGraphicObjectProps();
                if (selectedElements && selectedElements.length>0){
                    var elType, elValue;
                    for (var i = selectedElements.length - 1; i >= 0; i--) {
                        elType = selectedElements[i].asc_getObjectType();
                        elValue = selectedElements[i].asc_getObjectValue();
                        if (Asc.c_oAscTypeSelectElement.Image == elType) {
                            (new SSE.Views.ImageSettingsAdvanced(
                                {
                                    imageProps: elValue,
                                    api: me.api,
                                    handler: function(result, value) {
                                        if (result == 'ok') {
                                            if (me.api) {
                                                me.api.asc_setGraphicObjectProps(value.imageProps);
                                            }
                                        }

                                        Common.NotificationCenter.trigger('edit:complete', me);
                                    }
                                })).show();
                            break;
                        }
                    }
                }
            }
        },

        onApiAutoShapes: function() {
            var me = this;
            var onShowBefore = function(menu) {
                me.fillAutoShapes();
                menu.off('show:before', onShowBefore);
            };
            me.btnChangeShape.menu.on('show:before', onShowBefore);
        },

        fillAutoShapes: function() {
            var me = this,
                recents = Common.localStorage.getItem('sse-recent-shapes');

            var menuitem = new Common.UI.MenuItem({
                template: _.template('<div id="id-img-change-shape-menu" class="menu-insertshape"></div>'),
                index: 0
            });
            me.btnChangeShape.menu.addItem(menuitem);

            var shapePicker = new Common.UI.DataViewShape({
                el: $('#id-img-change-shape-menu'),
                itemTemplate: _.template('<div class="item-shape" id="<%= id %>"><svg width="20" height="20" class=\"icon uni-scale\"><use xlink:href=\"#svg-icon-<%= data.shapeType %>\"></use></svg></div>'),
                groups: me.application.getCollection('ShapeGroups'),
                parentMenu: me.btnChangeShape.menu,
                restoreHeight: 652,
                textRecentlyUsed: me.textRecentlyUsed,
                recentShapes: recents ? JSON.parse(recents) : null,
                hideTextRect: true,
                hideLines: true
            });
            shapePicker.on('item:click', function(picker, item, record, e) {
                if (me.api) {
                    me.api.asc_changeShapeType(record.get('data').shapeType);
                    Common.NotificationCenter.trigger('edit:complete', me);
                }
                if (e.type !== 'click')
                    me.btnCrop.menu.hide();
            });
        },

        ChangeSettings: function(props) {
            if (this._initSettings)
                this.createDelayedElements();

            this.disableControls(this._locked);

            if (props ){
                this._originalProps = new Asc.asc_CImgProperty(props);
                
                var value = props.asc_getWidth();
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

                this.ResetCrop.toggleClass('hidden', !props.asc_getIsCrop());
                this.btnResetCrop.setDisabled(!props.asc_getIsCrop() || this._locked);
                this.btnOriginalSize.setDisabled(props.asc_getImageUrl()===null || props.asc_getImageUrl()===undefined || this._locked);

                var pluginGuid = props.asc_getPluginGuid();
                value = (pluginGuid !== null && pluginGuid !== undefined);
                if (this._state.isOleObject!==value) {
                    this.btnSelectImage.setVisible(!value);
                    this.btnEditObject.setVisible(value);
                    this._state.isOleObject=value;
                }
                this.btnRotate270.setDisabled(value || this._locked);
                this.btnRotate90.setDisabled(value || this._locked);
                this.btnFlipV.setDisabled(value || this._locked);
                this.btnFlipH.setDisabled(value || this._locked);
                this.numTransparency.setDisabled(value || this._locked);
                this.sldrTransparency.setDisabled(value || this._locked);

                if (this._state.isOleObject) {
                    var plugin = SSE.getCollection('Common.Collections.Plugins').findWhere({guid: pluginGuid});
                    this.btnEditObject.setDisabled(!this.api.asc_canEditTableOleObject() && (plugin===null || plugin ===undefined) || this._locked);
                } else {
                    this.btnSelectImage.setDisabled(pluginGuid===null || this._locked);
                }

                var transparency = props.asc_getTransparent();
                if (Math.abs(this._state.Transparency - transparency) > 0.001 || 
                    Math.abs(this.numTransparency.getNumberValue() - transparency) > 0.001 || 
                    (this._state.Transparency === null || transparency === null) && 
                    (this._state.Transparency !== transparency || this.numTransparency.getNumberValue() !== transparency)) {
        
                    if (transparency !== undefined) {
                        this.sldrTransparency.setValue((transparency === null) ? 100 : transparency / 255 * 100, true);
                        this.numTransparency.setValue(this.sldrTransparency.getValue(), true);
                    }
                    this._state.Transparency = transparency;
                }
            }
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
        },

        setOriginalSize:  function() {
            if (this.api) {
                var imgsize = this.api.asc_getCropOriginalImageSize();
                var w = imgsize.asc_getImageWidth();
                var h = imgsize.asc_getImageHeight();

                var properties = new Asc.asc_CImgProperty();
                properties.asc_putWidth(w);
                properties.asc_putHeight(h);
                properties.put_Rot(0);
                this.api.asc_setGraphicObjectProps(properties);
                Common.NotificationCenter.trigger('edit:complete', this);
            }
        },

        setImageUrl: function(url, token) {
            var props = new Asc.asc_CImgProperty();
            props.asc_putImageUrl(url, token);
            this.api.asc_setGraphicObjectProps(props);
        },
        
        insertImageFromStorage: function(data) {
            if (data && data._urls && data.c=='change') {
                this.setImageUrl(data._urls[0], data.token);
            }
        },

        onImageSelect: function(menu, item) {
            if (item.value==1) {
                var me = this;
                (new Common.Views.ImageFromUrlDialog({
                    handler: function(result, value) {
                        if (result == 'ok') {
                            if (me.api) {
                                var checkUrl = value.replace(/ /g, '');
                                if (!_.isEmpty(checkUrl)) {
                                    me.setImageUrl(checkUrl);
                                }
                            }
                        }
                        Common.NotificationCenter.trigger('edit:complete', me);
                    }
                })).show();
            } else if (item.value==2) {
                Common.NotificationCenter.trigger('storage:image-load', 'change');
            } else {
                if (this._isFromFile) return;
                this._isFromFile = true;
                if (this.api) this.api.asc_changeImageFromFile();
                Common.NotificationCenter.trigger('edit:complete', this);
                this._isFromFile = false;
            }
        },

        _changeCropState: function(state) {
            this._state.cropMode = state;

            if (!this.btnCrop) return;
            this.btnCrop.toggle(state, true);
            this.btnCrop.menu.items[0].setChecked(state, true);
        },

        onCrop: function(btn, e) {
            if (this.api) {
                btn.pressed ? this.api.asc_startEditCrop() : this.api.asc_endEditCrop();
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onCropMenu: function(menu, item) {
            if (this.api) {
                if (item.value == 1) {
                    this.api.asc_cropFill();
                } else if (item.value == 2) {
                    this.api.asc_cropFit();
                } else {
                    item.checked ? this.api.asc_startEditCrop() : this.api.asc_endEditCrop();
                }
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onBtnRotateClick: function(btn) {
            var properties = new Asc.asc_CImgProperty();
            properties.asc_putRotAdd((btn.options.value==1 ? 90 : 270) * 3.14159265358979 / 180);
            this.api.asc_setGraphicObjectProps(properties);
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onBtnFlipClick: function(btn) {
            var properties = new Asc.asc_CImgProperty();
            if (btn.options.value==1)
                properties.asc_putFlipHInvert(true);
            else
                properties.asc_putFlipVInvert(true);
            this.api.asc_setGraphicObjectProps(properties);
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onResetCrop: function() {
            if (this.api) {
                var properties = new Asc.asc_CImgProperty();
                properties.put_ResetCrop(true);
                this.api.asc_setGraphicObjectProps(properties);
                Common.NotificationCenter.trigger('edit:complete', this);
            }
        },

        onNumTransparencyChange: function(field, newValue, oldValue, eOpts){
            this.sldrTransparency.setValue(field.getNumberValue(), true);
            if (this.api)  {
                var num = field.getNumberValue();
                var properties = new Asc.asc_CImgProperty();
                properties.asc_putTransparent(num * 2.55); 
                this.api.asc_setGraphicObjectProps(properties);
            }
        },

        onTransparencyChange: function(field, newValue, oldValue){
            this._sliderChanged = newValue;
            this.numTransparency.setValue(newValue, true);

            if (this._sendUndoPoint) {
                this.api.setStartPointHistory();
                this._sendUndoPoint = false;
                this.updateslider = setInterval(_.bind(this._transparencyApplyFunc, this), 100);
            }
        },

        onTransparencyChangeComplete: function(field, newValue, oldValue){
            clearInterval(this.updateslider);
            this._sliderChanged = newValue;
            if (!this._sendUndoPoint) { 
                this.api.setEndPointHistory();
                this._transparencyApplyFunc();
            }
            this._sendUndoPoint = true;
        },

         _transparencyApplyFunc: function() {
            if (this._sliderChanged!==undefined) {
                var properties = new Asc.asc_CImgProperty();
                properties.asc_putTransparent(this._sliderChanged * 2.55);
                this.api.asc_setGraphicObjectProps(properties);
                this._sliderChanged = undefined;
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
            this.btnCrop.setDisabled(disable || !this.api.asc_canEditCrop());
        },

        textKeepRatio: 'Constant Proportions',
        textSize:       'Size',
        textWidth:      'Width',
        textHeight:     'Height',
        textOriginalSize: 'Actual Size',
        textInsert:     'Replace Image',
        textFromUrl:    'From URL',
        textFromFile:   'From File',
        textEditObject: 'Edit Object',
        textEdit:       'Edit',
        textAdvanced:   'Show advanced settings',
        textRotation: 'Rotation',
        textRotate90: 'Rotate 90°',
        textFlip: 'Flip',
        textHint270: 'Rotate 90° Counterclockwise',
        textHint90: 'Rotate 90° Clockwise',
        textHintFlipV: 'Flip Vertically',
        textHintFlipH: 'Flip Horizontally',
        textCrop: 'Crop',
        textCropFill: 'Fill',
        textCropFit: 'Fit',
        textCropToShape: 'Crop to shape',
        textFromStorage: 'From Storage',
        textRecentlyUsed: 'Recently Used'
    }, SSE.Views.ImageSettings || {}));
});