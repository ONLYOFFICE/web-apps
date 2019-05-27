/*
 *
 * (c) Copyright Ascensio System SIA 2010-2019
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
 * You can contact Ascensio System SIA at 20A-12 Ernesta Birznieka-Upisha
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
 *  ShapeSettings.js
 *
 *  Created by Julia Radzhabova on 2/12/14
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!documenteditor/main/app/template/ShapeSettings.template',
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/component/ComboBox',
    'common/main/lib/component/ComboBorderSize',
    'common/main/lib/component/MetricSpinner',
    'common/main/lib/component/ThemeColorPalette',
    'common/main/lib/component/ColorButton',
    'common/main/lib/component/ComboDataView',
    'common/main/lib/component/Slider',
    'common/main/lib/component/MultiSliderGradient',
    'common/main/lib/view/ImageFromUrlDialog',
    'documenteditor/main/app/view/ImageSettingsAdvanced'
], function (menuTemplate, $, _, Backbone) {
    'use strict';

    DE.Views.ShapeSettings = Backbone.View.extend(_.extend({
        el: '#id-shape-settings',

        // Compile our stats template
        template: _.template(menuTemplate),

        // Delegated events for creating new items, and clearing completed ones.
        events: {
        },

        options: {
            alias: 'ShapeSettings'
        },

        initialize: function () {

            this._initSettings = true;
            this._originalProps = null;
            this._noApply = true;
            this.imgprops = null;
            this._sendUndoPoint = true;
            this._sliderChanged = false;

            this.txtPt = Common.Utils.Metric.getMetricName(Common.Utils.Metric.c_MetricUnits.pt);

            this._state = {
                Transparency: null,
                FillType: Asc.c_oAscFill.FILL_TYPE_SOLID,
                ShapeColor: 'transparent',
                BlipFillType: Asc.c_oAscFillBlipType.STRETCH,
                StrokeType: Asc.c_oAscStrokeType.STROKE_COLOR,
                StrokeWidth: this._pt2mm(1),
                StrokeColor: '000000',
                StrokeBorderType: Asc.c_oDashType.solid,
                FGColor: '000000',
                BGColor: 'ffffff',
                GradColor: '000000',
                GradFillType: Asc.c_oAscFillGradType.GRAD_LINEAR,
                WrappingStyle: Asc.c_oAscWrapStyle2.Inline,
                CanBeFlow: true,
                FromGroup: false,
                DisabledFillPanels: false,
                DisabledControls: false,
                HideShapeOnlySettings: false,
                HideChangeTypeSettings: false
            };
            this.lockedControls = [];
            this._locked = false;

            this.OriginalFillType = Asc.c_oAscFill.FILL_TYPE_SOLID;
            this.ShapeColor = {Value: 1, Color: 'transparent'};  // value=1 - цвет определен - прозрачный или другой, value=0 - цвет не определен, рисуем прозрачным
            this.BlipFillType = Asc.c_oAscFillBlipType.STRETCH;
            this.GradFillType = Asc.c_oAscFillGradType.GRAD_LINEAR;
            this.GradColor = { values: [0, 100], colors: ['000000', 'ffffff'], currentIdx: 0};
            this.GradRadialDirectionIdx = 0;
            this.GradLinearDirectionType = 0;
            this.PatternFillType = 0;
            this.FGColor = {Value: 1, Color: '000000'};  // value=1 - цвет определен - прозрачный или другой, value=0 - цвет не определен, рисуем прозрачным
            this.BGColor = {Value: 1, Color: 'ffffff'};  // value=1 - цвет определен - прозрачный или другой, value=0 - цвет не определен, рисуем прозрачным

            this.BorderColor = {Value: 1, Color: 'transparent'};  // value=1 - цвет определен - прозрачный или другой, value=0 - цвет не определен, рисуем прозрачным
            this.BorderSize = 0;
            this.BorderType = Asc.c_oDashType.solid;

            this.textureNames = [this.txtCanvas, this.txtCarton, this.txtDarkFabric, this.txtGrain, this.txtGranite, this.txtGreyPaper,
                this.txtKnit, this.txtLeather, this.txtBrownPaper, this.txtPapyrus, this.txtWood];

            this.fillControls = [];

            this.render();

            this.FillColorContainer = $('#shape-panel-color-fill');
            this.FillImageContainer = $('#shape-panel-image-fill');
            this.FillPatternContainer = $('#shape-panel-pattern-fill');
            this.FillGradientContainer = $('#shape-panel-gradient-fill');
            this.TransparencyContainer = $('#shape-panel-transparent-fill');
            this.ShapeOnlySettings = $('.shape-only');
            this.CanChangeType = $('.change-type');
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
                this.api.asc_registerCallback('asc_onImgWrapStyleChanged', _.bind(this._ImgWrapStyleChanged, this));
                this.api.asc_setInterfaceDrawImagePlaceShape('shape-texture-img');
                this.api.asc_registerCallback('asc_onInitStandartTextures', _.bind(this.onInitStandartTextures, this));
            }
            return this;
        },

        onFillSrcSelect: function(combo, record) {
            this.ShowHideElem(record.value);
            switch (record.value){
                case Asc.c_oAscFill.FILL_TYPE_SOLID:
                    this._state.FillType = Asc.c_oAscFill.FILL_TYPE_SOLID;
                    if (!this._noApply) {
                        var props = new Asc.asc_CShapeProperty();
                        var fill = new Asc.asc_CShapeFill();
                        fill.put_type(Asc.c_oAscFill.FILL_TYPE_SOLID);
                        fill.put_fill( new Asc.asc_CFillSolid());
                        fill.get_fill().put_color(Common.Utils.ThemeColor.getRgbColor((this.ShapeColor.Color=='transparent') ? {color: '4f81bd', effectId: 24} : this.ShapeColor.Color));
                        props.put_fill(fill);
                        this.imgprops.put_ShapeProperties(props);
                        this.api.ImgApply(this.imgprops);
                    }
                    break;
                case Asc.c_oAscFill.FILL_TYPE_GRAD:
                    this._state.FillType = Asc.c_oAscFill.FILL_TYPE_GRAD;
                    if (!this._noApply) {
                        var props = new Asc.asc_CShapeProperty();
                        var fill = new Asc.asc_CShapeFill();
                        fill.put_type(Asc.c_oAscFill.FILL_TYPE_GRAD);
                        fill.put_fill( new Asc.asc_CFillGrad());
                        fill.get_fill().put_grad_type(this.GradFillType);
                        if (this.GradFillType == Asc.c_oAscFillGradType.GRAD_LINEAR) {
                            fill.get_fill().put_linear_angle(this.GradLinearDirectionType * 60000);
                            fill.get_fill().put_linear_scale(true);
                        }
                        if (this.OriginalFillType !== Asc.c_oAscFill.FILL_TYPE_GRAD) {
                            var HexColor0 = Common.Utils.ThemeColor.getRgbColor(this.GradColor.colors[0]).get_color().get_hex(),
                                HexColor1 = Common.Utils.ThemeColor.getRgbColor(this.GradColor.colors[1]).get_color().get_hex();

                            if (HexColor0 === 'ffffff' && HexColor1 === 'ffffff') {
                                HexColor0 = {color: '4f81bd', effectId: 24};    // color accent1
                            } else {
                                HexColor0 = this.GradColor.colors[0];
                            }

                            fill.get_fill().put_positions([this.GradColor.values[0]*1000, this.GradColor.values[1]*1000]);
                            fill.get_fill().put_colors([Common.Utils.ThemeColor.getRgbColor(HexColor0), Common.Utils.ThemeColor.getRgbColor(this.GradColor.colors[1])]);
                        }
                        props.put_fill(fill);
                        this.imgprops.put_ShapeProperties(props);
                        this.api.ImgApply(this.imgprops);
                    }
                    break;
                case Asc.c_oAscFill.FILL_TYPE_BLIP:
                    this._state.FillType = Asc.c_oAscFill.FILL_TYPE_BLIP;
                    break;
                case Asc.c_oAscFill.FILL_TYPE_PATT:
                    this._state.FillType = Asc.c_oAscFill.FILL_TYPE_PATT;
                    if (!this._noApply) {
                        var props = new Asc.asc_CShapeProperty();
                        var fill = new Asc.asc_CShapeFill();
                        fill.put_type(Asc.c_oAscFill.FILL_TYPE_PATT);
                        fill.put_fill( new Asc.asc_CFillHatch());
                        fill.get_fill().put_pattern_type(this.PatternFillType);

                        var fHexColor = Common.Utils.ThemeColor.getRgbColor(this.FGColor.Color).get_color().get_hex();
                        var bHexColor = Common.Utils.ThemeColor.getRgbColor(this.BGColor.Color).get_color().get_hex();

                        if (bHexColor === 'ffffff' && fHexColor === 'ffffff') {
                            fHexColor = {color: '4f81bd', effectId: 24};    // color accent1
                        } else {
                            fHexColor = this.FGColor.Color;
                        }

                        fill.get_fill().put_color_fg(Common.Utils.ThemeColor.getRgbColor(fHexColor));
                        fill.get_fill().put_color_bg(Common.Utils.ThemeColor.getRgbColor(this.BGColor.Color));
                        props.put_fill(fill);
                        this.imgprops.put_ShapeProperties(props);
                        this.api.ImgApply(this.imgprops);
                    }
                    break;
                case Asc.c_oAscFill.FILL_TYPE_NOFILL:
                    this._state.FillType = Asc.c_oAscFill.FILL_TYPE_NOFILL;
                    if (!this._noApply) {
                        var props = new Asc.asc_CShapeProperty();
                        var fill = new Asc.asc_CShapeFill();
                        fill.put_type(Asc.c_oAscFill.FILL_TYPE_NOFILL);
                        fill.put_fill(null);
                        props.put_fill(fill);
                        this.imgprops.put_ShapeProperties(props);
                        this.api.ImgApply(this.imgprops);
                    }
                    break;
            }
            this.fireEvent('editcomplete', this);
        },

        onColorsBackSelect: function(picker, color) {
            this.btnBackColor.setColor(color);
            this.ShapeColor = {Value: 1, Color: color};

            if (this.api && !this._noApply) {
                var props = new Asc.asc_CShapeProperty();
                var fill = new Asc.asc_CShapeFill();

                if (this.ShapeColor.Color=='transparent') {
                    fill.put_type(Asc.c_oAscFill.FILL_TYPE_NOFILL);
                    fill.put_fill(null);
                } else {
                    fill.put_type(Asc.c_oAscFill.FILL_TYPE_SOLID);
                    fill.put_fill( new Asc.asc_CFillSolid());
                    fill.get_fill().put_color(Common.Utils.ThemeColor.getRgbColor(this.ShapeColor.Color));
                }

                props.put_fill(fill);
                this.imgprops.put_ShapeProperties(props);
                this.api.ImgApply(this.imgprops);
            }
            this.fireEvent('editcomplete', this);
        },

        addNewColor: function(picker, btn) {
            picker.addNewColor((typeof(btn.color) == 'object') ? btn.color.color : btn.color);
        },

        onPatternSelect: function(combo, record){
            if (this.api && !this._noApply) {
                this.PatternFillType = record.get('type');
                var props = new Asc.asc_CShapeProperty();
                var fill = new Asc.asc_CShapeFill();
                fill.put_type(Asc.c_oAscFill.FILL_TYPE_PATT);
                fill.put_fill( new Asc.asc_CFillHatch());
                fill.get_fill().put_pattern_type(this.PatternFillType);
                if (this.OriginalFillType !== Asc.c_oAscFill.FILL_TYPE_PATT) {
                    fill.get_fill().put_color_fg(Common.Utils.ThemeColor.getRgbColor(this.FGColor.Color));
                    fill.get_fill().put_color_bg(Common.Utils.ThemeColor.getRgbColor(this.BGColor.Color));
                }
                props.put_fill(fill);
                this.imgprops.put_ShapeProperties(props);
                this.api.ImgApply(this.imgprops);
            }
            this.fireEvent('editcomplete', this);
        },

        onColorsFGSelect: function(picker, color) {
            this.btnFGColor.setColor(color);
            this.FGColor = {Value: 1, Color: color};
            if (this.api && !this._noApply) {
                var props = new Asc.asc_CShapeProperty();
                var fill = new Asc.asc_CShapeFill();
                fill.put_type(Asc.c_oAscFill.FILL_TYPE_PATT);
                fill.put_fill( new Asc.asc_CFillHatch());
                fill.get_fill().put_color_fg(Common.Utils.ThemeColor.getRgbColor(this.FGColor.Color));
                if (this.OriginalFillType !== Asc.c_oAscFill.FILL_TYPE_PATT) {
                    fill.get_fill().put_pattern_type(this.PatternFillType);
                    fill.get_fill().put_color_bg(Common.Utils.ThemeColor.getRgbColor(this.BGColor.Color));
                }
                props.put_fill(fill);
                this.imgprops.put_ShapeProperties(props);
                this.api.ImgApply(this.imgprops);
            }
            this.fireEvent('editcomplete', this);
        },

        onColorsBGSelect: function(picker, color) {
            this.btnBGColor.setColor(color);
            this.BGColor = {Value: 1, Color: color};
            if (this.api && !this._noApply) {
                var props = new Asc.asc_CShapeProperty();
                var fill = new Asc.asc_CShapeFill();
                fill.put_type(Asc.c_oAscFill.FILL_TYPE_PATT);
                fill.put_fill( new Asc.asc_CFillHatch());
                if (this.OriginalFillType !== Asc.c_oAscFill.FILL_TYPE_PATT) {
                    fill.get_fill().put_pattern_type(this.PatternFillType);
                    fill.get_fill().put_color_fg(Common.Utils.ThemeColor.getRgbColor(this.FGColor.Color));
                }
                fill.get_fill().put_color_bg(Common.Utils.ThemeColor.getRgbColor(this.BGColor.Color));
                props.put_fill(fill);
                this.imgprops.put_ShapeProperties(props);
                this.api.ImgApply(this.imgprops);
            }
            this.fireEvent('editcomplete', this);
        },

        onFillTypeSelect: function(combo, record) {
            this.BlipFillType = record.value;

            if (this.api && this._fromTextureCmb !== true && this.OriginalFillType == Asc.c_oAscFill.FILL_TYPE_BLIP) {
                var props = new Asc.asc_CShapeProperty();
                var fill = new Asc.asc_CShapeFill();
                fill.put_type(Asc.c_oAscFill.FILL_TYPE_BLIP);
                fill.put_fill( new Asc.asc_CFillBlip());

                fill.get_fill().put_type(this.BlipFillType);

                props.put_fill(fill);
                this.imgprops.put_ShapeProperties(props);
                this.api.ImgApply(this.imgprops);
            }
            this.fireEvent('editcomplete', this);
        },

        onNumTransparencyChange: function(field, newValue, oldValue, eOpts){
            this.sldrTransparency.setValue(field.getNumberValue(), true);
            if (this.api)  {
                var num = field.getNumberValue();
                var props = new Asc.asc_CShapeProperty();
                var fill = new Asc.asc_CShapeFill();
                fill.put_transparent(num * 2.55);
                props.put_fill(fill);
                this.imgprops.put_ShapeProperties(props);
                this.api.ImgApply(this.imgprops);
            }
            this.fireEvent('editcomplete', this);
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
            if (!this._sendUndoPoint) { // start point was added
                this.api.setEndPointHistory();
                this._transparencyApplyFunc();
            }
            this._sendUndoPoint = true;
        },

         _transparencyApplyFunc: function() {
            if (this._sliderChanged!==undefined) {
                var props = new Asc.asc_CShapeProperty();
                var fill = new Asc.asc_CShapeFill();
                fill.put_transparent(this._sliderChanged * 2.55);
                props.put_fill(fill);
                this.imgprops.put_ShapeProperties(props);
                this.api.ImgApply(this.imgprops);
                this._sliderChanged = undefined;
            }
        },

        onGradTypeSelect: function(combo, record){
            this.GradFillType = record.value;

            if (this.GradFillType == Asc.c_oAscFillGradType.GRAD_LINEAR) {
                this.mnuDirectionPicker.store.reset(this._viewDataLinear);
                this.mnuDirectionPicker.cmpEl.width(175);
                this.mnuDirectionPicker.restoreHeight = 174;
                var record = this.mnuDirectionPicker.store.findWhere({type: this.GradLinearDirectionType});
                this.mnuDirectionPicker.selectRecord(record, true);
                if (record)
                    this.btnDirection.setIconCls('item-gradient ' + record.get('iconcls'));
                else
                    this.btnDirection.setIconCls('');
            } else if (this.GradFillType == Asc.c_oAscFillGradType.GRAD_PATH) {
                this.mnuDirectionPicker.store.reset(this._viewDataRadial);
                this.mnuDirectionPicker.cmpEl.width(60);
                this.mnuDirectionPicker.restoreHeight = 58;
                this.mnuDirectionPicker.selectByIndex(this.GradRadialDirectionIdx, true);
                if (this.GradRadialDirectionIdx>=0)
                    this.btnDirection.setIconCls('item-gradient ' + this._viewDataRadial[this.GradRadialDirectionIdx].iconcls);
                else
                    this.btnDirection.setIconCls('');
            }

            if (this.api && !this._noApply) {
                var props = new Asc.asc_CShapeProperty();
                var fill = new Asc.asc_CShapeFill();
                fill.put_type(Asc.c_oAscFill.FILL_TYPE_GRAD);
                fill.put_fill( new Asc.asc_CFillGrad());
                fill.get_fill().put_grad_type(this.GradFillType);
                if (this.GradFillType == Asc.c_oAscFillGradType.GRAD_LINEAR) {
                    fill.get_fill().put_linear_angle(this.GradLinearDirectionType * 60000);
                    fill.get_fill().put_linear_scale(true);
                }
                props.put_fill(fill);
                this.imgprops.put_ShapeProperties(props);
                this.api.ImgApply(this.imgprops);
            }

            this.fireEvent('editcomplete', this);
        },

        onSelectGradient: function(btn, picker, itemView, record) {
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

            this.btnDirection.setIconCls('item-gradient ' + rawData.iconcls);
            (this.GradFillType == Asc.c_oAscFillGradType.GRAD_LINEAR) ? this.GradLinearDirectionType = rawData.type : this.GradRadialDirectionIdx = 0;
            if (this.api) {
                if (this.GradFillType == Asc.c_oAscFillGradType.GRAD_LINEAR) {
                    var props = new Asc.asc_CShapeProperty();
                    var fill = new Asc.asc_CShapeFill();
                    fill.put_type(Asc.c_oAscFill.FILL_TYPE_GRAD);
                    fill.put_fill( new Asc.asc_CFillGrad());
                    fill.get_fill().put_grad_type(this.GradFillType);
                    fill.get_fill().put_linear_angle(rawData.type * 60000);
                    fill.get_fill().put_linear_scale(true);

                    props.put_fill(fill);
                    this.imgprops.put_ShapeProperties(props);
                    this.api.ImgApply(this.imgprops);
                }
            }

            this.fireEvent('editcomplete', this);
        },

        onColorsGradientSelect: function(picker, color) {
            this.btnGradColor.setColor(color);
            this.GradColor.colors[this.GradColor.currentIdx] = color;
            this.sldrGradient.setColorValue(Common.Utils.String.format('#{0}', (typeof(color) == 'object') ? color.color : color));

            if (this.api && !this._noApply) {
                var props = new Asc.asc_CShapeProperty();
                var fill = new Asc.asc_CShapeFill();
                fill.put_type(Asc.c_oAscFill.FILL_TYPE_GRAD);
                fill.put_fill( new Asc.asc_CFillGrad());
                fill.get_fill().put_grad_type(this.GradFillType);
                fill.get_fill().put_colors([Common.Utils.ThemeColor.getRgbColor(this.GradColor.colors[0]), Common.Utils.ThemeColor.getRgbColor(this.GradColor.colors[1])]);

                if (this.OriginalFillType !== Asc.c_oAscFill.FILL_TYPE_GRAD) {
                    if (this.GradFillType == Asc.c_oAscFillGradType.GRAD_LINEAR) {
                        fill.get_fill().put_linear_angle(this.GradLinearDirectionType * 60000);
                        fill.get_fill().put_linear_scale(true);
                    }
                    fill.get_fill().put_positions([this.GradColor.values[0]*1000, this.GradColor.values[1]*1000]);
                }
                props.put_fill(fill);
                this.imgprops.put_ShapeProperties(props);
                this.api.ImgApply(this.imgprops);
            }
            this.fireEvent('editcomplete', this);
        },

        onGradientChange: function(slider, newValue, oldValue){
            this.GradColor.values = slider.getValues();
            this._sliderChanged = true;
            if (this.api && !this._noApply) {
                if (this._sendUndoPoint)  {
                    this.api.setStartPointHistory();
                    this._sendUndoPoint = false;
                    this.updateslider = setInterval(_.bind(this._gradientApplyFunc, this), 100);
                }
            }
        },

        onGradientChangeComplete: function(slider, newValue, oldValue){
            clearInterval(this.updateslider);
            this._sliderChanged = true;
            if (!this._sendUndoPoint) { // start point was added
                this.api.setEndPointHistory();
                this._gradientApplyFunc();
            }
            this._sendUndoPoint = true;
        },

        _gradientApplyFunc: function() {
            if (this._sliderChanged) {
                var props = new Asc.asc_CShapeProperty();
                var fill = new Asc.asc_CShapeFill();
                fill.put_type(Asc.c_oAscFill.FILL_TYPE_GRAD);
                fill.put_fill( new Asc.asc_CFillGrad());
                fill.get_fill().put_grad_type(this.GradFillType);
                fill.get_fill().put_positions([this.GradColor.values[0]*1000, this.GradColor.values[1]*1000]);

                if (this.OriginalFillType !== Asc.c_oAscFill.FILL_TYPE_GRAD) {
                    if (this.GradFillType == Asc.c_oAscFillGradType.GRAD_LINEAR) {
                        fill.get_fill().put_linear_angle(this.GradLinearDirectionType * 60000);
                        fill.get_fill().put_linear_scale(true);
                    }
                    fill.get_fill().put_colors([Common.Utils.ThemeColor.getRgbColor(this.GradColor.colors[0]), Common.Utils.ThemeColor.getRgbColor(this.GradColor.colors[1])]);
                }
                props.put_fill(fill);
                this.imgprops.put_ShapeProperties(props);
                this.api.ImgApply(this.imgprops);
                this._sliderChanged = false;
            }
        },

        applyBorderSize: function(value) {
            value = parseFloat(value);
            value = isNaN(value) ? 0 : Math.max(0, Math.min(1584, value));

            this.BorderSize = value;
            if (this.api && !this._noApply) {
                var props = new Asc.asc_CShapeProperty();
                var stroke = new Asc.asc_CStroke();
                if (this.BorderSize<0.00001) {
                    stroke.put_type( Asc.c_oAscStrokeType.STROKE_NONE);
                    this._state.StrokeType = this._state.StrokeWidth = -1;
                } else {
                    stroke.put_type( Asc.c_oAscStrokeType.STROKE_COLOR);
                    if (this.BorderColor.Color == 'transparent' || this.BorderColor.Color.color == 'transparent')
                        stroke.put_color(Common.Utils.ThemeColor.getRgbColor({color: '000000', effectId: 29}));
                    else if (this._state.StrokeType == Asc.c_oAscStrokeType.STROKE_NONE || this._state.StrokeType === null)
                        stroke.put_color(Common.Utils.ThemeColor.getRgbColor(Common.Utils.ThemeColor.colorValue2EffectId(this.BorderColor.Color)));
                    stroke.asc_putPrstDash(this.BorderType);
                    stroke.put_width(this._pt2mm(this.BorderSize));
                }
                props.put_stroke(stroke);
                this.imgprops.put_ShapeProperties(props);
                this.api.ImgApply(this.imgprops);
            }
            this.fireEvent('editcomplete', this);
        },

        onComboBlur: function() {
            this.fireEvent('editcomplete', this);
        },

        onBorderSizeChanged: function(before, combo, record, e) {
            var me = this;
            if (before) {
                var value = parseFloat(record.value),
                    expr = new RegExp('^\\s*(\\d*(\\.|,)?\\d+)\\s*(' + me.txtPt + ')?\\s*$');
                if (!(expr.exec(record.value)) || value<0 || value>1584) {
                    this._state.StrokeType = this._state.StrokeWidth = -1;
                    Common.UI.error({
                        msg: this.textBorderSizeErr,
                        callback: function() {
                            _.defer(function(btn) {
                                me.fireEvent('editcomplete', me);
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

        onBorderTypeSelect: function(combo, record) {
            this.BorderType = record.value;
            if (this.api && !this._noApply) {
                var props = new Asc.asc_CShapeProperty();
                var stroke = new Asc.asc_CStroke();
                if (this.BorderSize<0.00001) {
                    stroke.put_type( Asc.c_oAscStrokeType.STROKE_NONE);
                } else {
                    stroke.put_type( Asc.c_oAscStrokeType.STROKE_COLOR);
                    stroke.put_color(Common.Utils.ThemeColor.getRgbColor(this.BorderColor.Color));
                    stroke.put_width(this._pt2mm(this.BorderSize));
                    stroke.asc_putPrstDash(this.BorderType);
                }
                props.put_stroke(stroke);
                this.imgprops.put_ShapeProperties(props);
                this.api.ImgApply(this.imgprops);
            }
            this.fireEvent('editcomplete', this);
        },

        onColorsBorderSelect: function(picker, color) {
            this.btnBorderColor.setColor(color);
            this.BorderColor = {Value: 1, Color: color};
            if (this.api && this.BorderSize>0 && !this._noApply) {
                var props = new Asc.asc_CShapeProperty();
                var stroke = new Asc.asc_CStroke();
                if (this.BorderSize<0.00001) {
                    stroke.put_type( Asc.c_oAscStrokeType.STROKE_NONE);
                } else {
                    stroke.put_type( Asc.c_oAscStrokeType.STROKE_COLOR);
                    stroke.put_color(Common.Utils.ThemeColor.getRgbColor(this.BorderColor.Color));
                    stroke.put_width(this._pt2mm(this.BorderSize));
                    stroke.asc_putPrstDash(this.BorderType);
                }
                props.put_stroke(stroke);
                this.imgprops.put_ShapeProperties(props);
                this.api.ImgApply(this.imgprops);
            }
            this.fireEvent('editcomplete', this);
        },

        _ImgWrapStyleChanged: function(style) {
            if (!this.cmbWrapType) return;
            if (this._state.WrappingStyle!==style) {
                this.cmbWrapType.suspendEvents();
                var rec = this.cmbWrapType.menuPicker.store.findWhere({
                    data: style
                });
                this.cmbWrapType.menuPicker.selectRecord(rec);
                this.cmbWrapType.resumeEvents();
                this._state.WrappingStyle=style;
            }
        },

        onSelectWrap: function(combo, record) {
            if (this.api) {
                var props = new Asc.asc_CImgProperty(),
                    data = record.get('data');
                props.put_WrappingStyle(data);
                if (this._state.WrappingStyle===Asc.c_oAscWrapStyle2.Inline && data!==Asc.c_oAscWrapStyle2.Inline ) {
                    props.put_PositionH(new Asc.CImagePositionH());
                    props.get_PositionH().put_UseAlign(false);
                    props.get_PositionH().put_RelativeFrom(Asc.c_oAscRelativeFromH.Column);
                    var val = this._originalProps.get_Value_X(Asc.c_oAscRelativeFromH.Column);
                    props.get_PositionH().put_Value(val);

                    props.put_PositionV(new Asc.CImagePositionV());
                    props.get_PositionV().put_UseAlign(false);
                    props.get_PositionV().put_RelativeFrom(Asc.c_oAscRelativeFromV.Paragraph);
                    val = this._originalProps.get_Value_Y(Asc.c_oAscRelativeFromV.Paragraph);
                    props.get_PositionV().put_Value(val);
                }

                this.api.ImgApply(props);
            }
            this.fireEvent('editcomplete', this);
        },

        insertFromUrl: function() {
            var me = this;
            (new Common.Views.ImageFromUrlDialog({
                handler: function(result, value) {
                    if (result == 'ok') {
                        if (me.api) {
                            var checkUrl = value.replace(/ /g, '');
                            if (!_.isEmpty(checkUrl)) {
                                if (me.BlipFillType !== null) {
                                    var props = new Asc.asc_CShapeProperty();
                                    var fill = new Asc.asc_CShapeFill();
                                    fill.put_type(Asc.c_oAscFill.FILL_TYPE_BLIP);
                                    fill.put_fill( new Asc.asc_CFillBlip());
                                    fill.get_fill().put_type(me.BlipFillType);
                                    fill.get_fill().put_url(checkUrl);

                                    props.put_fill(fill);
                                    me.imgprops.put_ShapeProperties(props);
                                    me.api.ImgApply(me.imgprops);
                                }
                            }
                        }
                    }
                    me.fireEvent('editcomplete', me);
                }
            })).show();
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
                        if (Asc.c_oAscTypeSelectElement.Image == elType) {
                            (new DE.Views.ImageSettingsAdvanced(
                                {
                                    imageProps: elValue,
                                    sectionProps: me.api.asc_GetSectionProps(),
                                    handler: function(result, value) {
                                        if (result == 'ok') {
                                            if (me.api) {
                                                me.api.ImgApply(value.imageProps);
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

        ChangeSettings: function(props) {
            if (this.imgprops==null)
                this.imgprops = new Asc.asc_CImgProperty();
            else
                this.imgprops.put_ImageUrl(null);

            if (this._initSettings)
                this.createDelayedElements();

            if (props && props.get_ShapeProperties())
            {
                var shapeprops = props.get_ShapeProperties(),
                    shapetype = shapeprops.asc_getType();
                this._originalProps = new Asc.asc_CImgProperty(props);

                this._noApply = true;

                this.disableControls(this._locked, !shapeprops.get_CanFill());
                this.hideShapeOnlySettings(shapeprops.get_FromChart() || shapeprops.get_FromImage());

                var hidechangetype = shapeprops.get_FromChart() || shapetype=='line' || shapetype=='bentConnector2' || shapetype=='bentConnector3'
                    || shapetype=='bentConnector4' || shapetype=='bentConnector5' || shapetype=='curvedConnector2'
                    || shapetype=='curvedConnector3' || shapetype=='curvedConnector4' || shapetype=='curvedConnector5'
                    || shapetype=='straightConnector1';
                this.hideChangeTypeSettings(hidechangetype);
                if (!hidechangetype) {
                    this.btnChangeShape.menu.items[0].setVisible(shapeprops.get_FromImage());
                    this.btnChangeShape.menu.items[1].setVisible(!shapeprops.get_FromImage());
                }

                var value = props.get_WrappingStyle();
                if (this._state.WrappingStyle!==value) {
                    this.cmbWrapType.suspendEvents();
                    var rec = this.cmbWrapType.menuPicker.store.findWhere({
                        data: value
                    });
                    this.cmbWrapType.menuPicker.selectRecord(rec);
                    this.cmbWrapType.resumeEvents();
                    this._state.WrappingStyle=value;
                }

                value = props.get_CanBeFlow() && !this._locked;
                var fromgroup = props.get_FromGroup() || this._locked;
                if (this._state.CanBeFlow!==value || this._state.FromGroup!==fromgroup) {
                    this.cmbWrapType.setDisabled(!value || fromgroup);
                    this._state.CanBeFlow=value;
                    this._state.FromGroup=fromgroup;
                }

                // background colors
                var rec = null;
                var fill = shapeprops.get_fill();
                var fill_type = fill.get_type();
                var color = null;
                var transparency = fill.get_transparent();
                if ( Math.abs(this._state.Transparency-transparency)>0.001 || Math.abs(this.numTransparency.getNumberValue()-transparency)>0.001 ||
                    (this._state.Transparency===null || transparency===null)&&(this._state.Transparency!==transparency || this.numTransparency.getNumberValue()!==transparency)) {

                    if (transparency !== undefined) {
                        this.sldrTransparency.setValue((transparency===null) ? 100 : transparency/255*100, true);
                        this.numTransparency.setValue(this.sldrTransparency.getValue(), true);
                    }
                    this._state.Transparency=transparency;
                }

                if (fill===null || fill_type===null) { // заливка не совпадает у неск. фигур
                    this.OriginalFillType = null;
                } else if (fill_type==Asc.c_oAscFill.FILL_TYPE_NOFILL) { // заливки нет
                    this.OriginalFillType = Asc.c_oAscFill.FILL_TYPE_NOFILL;
                } else if (fill_type==Asc.c_oAscFill.FILL_TYPE_SOLID) {
                    fill = fill.get_fill();
                    color = fill.get_color();
                    if (color) {
                        if (color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                            this.ShapeColor = {Value: 1, Color: {color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()), effectValue: color.get_value() }};
                        } else {
                            this.ShapeColor = {Value: 1, Color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b())};
                        }

                    } else
                        this.ShapeColor = {Value: 0, Color: 'transparent'};
                    this.OriginalFillType = Asc.c_oAscFill.FILL_TYPE_SOLID;
                    this.FGColor = (this.ShapeColor.Color!=='transparent') ? {Value: 1, Color: Common.Utils.ThemeColor.colorValue2EffectId(this.ShapeColor.Color)} : {Value: 1, Color: '000000'};
                    this.BGColor = {Value: 1, Color: 'ffffff'};
                    this.GradColor.colors[0] = (this.ShapeColor.Color!=='transparent') ? Common.Utils.ThemeColor.colorValue2EffectId(this.ShapeColor.Color) : '000000';
                    this.GradColor.colors[1] = 'ffffff';
                }  else if (fill_type==Asc.c_oAscFill.FILL_TYPE_BLIP) {
                    fill = fill.get_fill();
                    this.BlipFillType = fill.get_type(); // null - не совпадают у нескольких фигур
                    if (this._state.BlipFillType !== this.BlipFillType) {
                        if (this.BlipFillType == Asc.c_oAscFillBlipType.STRETCH || this.BlipFillType == Asc.c_oAscFillBlipType.TILE) {
                            this.cmbFillType.setValue(this.BlipFillType);
                        } else
                            this.cmbFillType.setValue('');
                        this._state.BlipFillType = this.BlipFillType;
                    }
                    this.OriginalFillType = Asc.c_oAscFill.FILL_TYPE_BLIP;
                } else if (fill_type==Asc.c_oAscFill.FILL_TYPE_PATT) {
                    fill = fill.get_fill();
                    this.PatternFillType = fill.get_pattern_type(); // null - не совпадают у нескольких фигур
                    if (this._state.PatternFillType !== this.PatternFillType) {
                        this.cmbPattern.suspendEvents();
                        var rec = this.cmbPattern.menuPicker.store.findWhere({
                            type: this.PatternFillType
                        });
                        this.cmbPattern.menuPicker.selectRecord(rec);
                        this.cmbPattern.resumeEvents();
                        this._state.PatternFillType = this.PatternFillType;
                    }

                    color = fill.get_color_fg();
                    if (color) {
                        if (color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                            this.FGColor = {Value: 1, Color: {color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()), effectValue: color.get_value() }};
                        } else {
                            this.FGColor = {Value: 1, Color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b())};
                        }
                    } else
                        this.FGColor = {Value: 1, Color: '000000'};

                    color = fill.get_color_bg();
                    if (color) {
                        if (color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                            this.BGColor = {Value: 1, Color: {color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()), effectValue: color.get_value() }};
                        } else {
                            this.BGColor = {Value: 1, Color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b())};
                        }
                    } else
                        this.BGColor = {Value: 1, Color: 'ffffff'};

                    this.OriginalFillType = Asc.c_oAscFill.FILL_TYPE_PATT;
                    this.ShapeColor = {Value: 1, Color: Common.Utils.ThemeColor.colorValue2EffectId(this.FGColor.Color)};
                    this.GradColor.colors[0] = Common.Utils.ThemeColor.colorValue2EffectId(this.FGColor.Color);
                    this.GradColor.colors[1] = 'ffffff';
                } else if (fill_type==Asc.c_oAscFill.FILL_TYPE_GRAD) {
                    fill = fill.get_fill();
                    var gradfilltype = fill.get_grad_type();  // null - не совпадают у нескольких фигур
                    if (this._state.GradFillType !== gradfilltype || this.GradFillType !== gradfilltype) {
                        this.GradFillType = gradfilltype;
                        rec = undefined;
                        if (this.GradFillType == Asc.c_oAscFillGradType.GRAD_LINEAR || this.GradFillType == Asc.c_oAscFillGradType.GRAD_PATH) {
                            this.cmbGradType.setValue(this.GradFillType);
                            rec = this.cmbGradType.store.findWhere({value: this.GradFillType});
                            this.onGradTypeSelect(this.cmbGradType, rec.attributes);
                        } else {
                            this.cmbGradType.setValue('');
                            this.btnDirection.setIconCls('');
                        }
                        this._state.GradFillType = this.GradFillType;
                    }

                    if (this.GradFillType == Asc.c_oAscFillGradType.GRAD_LINEAR ) {
                        var value = Math.floor(fill.get_linear_angle()/60000);
                        if (Math.abs(this.GradLinearDirectionType-value)>0.001) {
                            this.GradLinearDirectionType=value;
                            var record = this.mnuDirectionPicker.store.findWhere({type: value});
                            this.mnuDirectionPicker.selectRecord(record, true);
                            if (record)
                                this.btnDirection.setIconCls('item-gradient ' + record.get('iconcls'));
                            else
                                this.btnDirection.setIconCls('');
                        }
                    }

                    var colors = fill.get_colors();
                    if (colors && colors.length>0) {
                        color = colors[0];
                        if (color) {
                            if (color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                                this.GradColor.colors[0] = {color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()), effectValue: color.get_value()};
                                Common.Utils.ThemeColor.colorValue2EffectId(this.GradColor.colors[0]);
                            } else {
                                this.GradColor.colors[0] = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
                            }
                        } else
                            this.GradColor.colors[0] = '000000';

                        color = colors[1];
                        if (color) {
                            if (color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                                this.GradColor.colors[1] = {color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()), effectValue: color.get_value()};
                                Common.Utils.ThemeColor.colorValue2EffectId(this.GradColor.colors[1]);
                            } else {
                                this.GradColor.colors[1] = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
                            }
                        } else
                            this.GradColor.colors[1] = 'ffffff';

                    }
                    var positions = fill.get_positions();
                    if (positions && positions.length>0) {
                        var position = positions[0];
                        if (position!==null)       {
                            position = position/1000;
                            this.GradColor.values[0] = position;
                        }

                        position = positions[1];
                        if (position!==null)       {
                            position = position/1000;
                            this.GradColor.values[1] = position;
                        }
                    }
                    this.sldrGradient.setColorValue(Common.Utils.String.format('#{0}', (typeof(this.GradColor.colors[0]) == 'object') ? this.GradColor.colors[0].color : this.GradColor.colors[0]), 0);
                    this.sldrGradient.setColorValue(Common.Utils.String.format('#{0}', (typeof(this.GradColor.colors[1]) == 'object') ? this.GradColor.colors[1].color : this.GradColor.colors[1]), 1);
                    this.sldrGradient.setValue(0, this.GradColor.values[0]);
                    this.sldrGradient.setValue(1, this.GradColor.values[1]);
                    this.OriginalFillType = Asc.c_oAscFill.FILL_TYPE_GRAD;
                    this.FGColor = {Value: 1, Color: this.GradColor.colors[0]};
                    this.BGColor = {Value: 1, Color: 'ffffff'};
                    this.ShapeColor = {Value: 1, Color: this.GradColor.colors[0]};
                }

                if ( this._state.FillType!==this.OriginalFillType ) {
                    this.cmbFillSrc.setValue((this.OriginalFillType===null) ? '' : this.OriginalFillType);
                    this._state.FillType=this.OriginalFillType;
                    this.ShowHideElem(this.OriginalFillType);
                }

                $(this.btnTexture.el).find('.form-control').prop('innerHTML', this.textSelectTexture);

                var type1 = typeof(this.ShapeColor.Color),
                    type2 = typeof(this._state.ShapeColor);

                if ( (type1 !== type2) || (type1=='object' &&
                    (this.ShapeColor.Color.effectValue!==this._state.ShapeColor.effectValue || this._state.ShapeColor.color.indexOf(this.ShapeColor.Color.color)<0)) ||
                    (type1!='object' && this._state.ShapeColor.indexOf(this.ShapeColor.Color)<0 )) {

                    this.btnBackColor.setColor(this.ShapeColor.Color);
                    if ( typeof(this.ShapeColor.Color) == 'object' ) {
                        var isselected = false;
                        for (var i=0; i<10; i++) {
                            if ( Common.Utils.ThemeColor.ThemeValues[i] == this.ShapeColor.Color.effectValue ) {
                                this.colorsBack.select(this.ShapeColor.Color,true);
                                isselected = true;
                                break;
                            }
                        }
                        if (!isselected) this.colorsBack.clearSelection();
                    } else
                        this.colorsBack.select(this.ShapeColor.Color,true);

                    this._state.ShapeColor = this.ShapeColor.Color;
                }

                // border colors
                var stroke = shapeprops.get_stroke(),
                    strokeType = stroke.get_type(),
                    borderType,
                    update = (this._state.StrokeColor == 'transparent' && this.BorderColor.Color !== 'transparent'); // border color was changed for shape without line and then shape was reselected (or apply other settings)

                if (stroke) {
                    if ( strokeType == Asc.c_oAscStrokeType.STROKE_COLOR ) {
                        color = stroke.get_color();
                        if (color) {
                            if (color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                                this.BorderColor = {Value: 1, Color: {color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()), effectValue: color.get_value() }};
                            }
                            else
                                this.BorderColor = {Value: 1, Color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b())};
                        }
                        else
                            this.BorderColor = {Value: 1, Color: 'transparent'};
                    } else {
                        this.BorderColor = {Value: 1, Color: 'transparent'};
                    }
                    borderType = stroke.asc_getPrstDash();
                } else  { // no stroke
                    strokeType = null;
                    this.BorderColor = {Value: 0, Color: 'transparent'};
                }

                type1 = typeof(this.BorderColor.Color);
                type2 = typeof(this._state.StrokeColor);

                if ( update || (type1 !== type2) || (type1=='object' &&
                    (this.BorderColor.Color.effectValue!==this._state.StrokeColor.effectValue || this._state.StrokeColor.color.indexOf(this.BorderColor.Color.color)<0)) ||
                    (type1!='object' && (this._state.StrokeColor.indexOf(this.BorderColor.Color)<0 || typeof(this.btnBorderColor.color)=='object'))) {

                    this.btnBorderColor.setColor(this.BorderColor.Color);
                    if ( typeof(this.BorderColor.Color) == 'object' ) {
                        var isselected = false;
                        for (var i=0; i<10; i++) {
                            if ( Common.Utils.ThemeColor.ThemeValues[i] == this.BorderColor.Color.effectValue ) {
                                this.colorsBorder.select(this.BorderColor.Color,true);
                                isselected = true;
                                break;
                            }
                        }
                        if (!isselected) this.colorsBorder.clearSelection();
                    } else
                        this.colorsBorder.select(this.BorderColor.Color,true);

                    this._state.StrokeColor = this.BorderColor.Color;
                }

                if (this._state.StrokeType !== strokeType || strokeType == Asc.c_oAscStrokeType.STROKE_COLOR) {
                    if ( strokeType == Asc.c_oAscStrokeType.STROKE_COLOR ) {
                        var w = stroke.get_width();
                        var check_value = (Math.abs(this._state.StrokeWidth-w)<0.00001) && !((new RegExp(this.txtPt + '\\s*$')).test(this.cmbBorderSize.getRawValue()));
                        if ( Math.abs(this._state.StrokeWidth-w)>0.00001 || check_value ||
                            (this._state.StrokeWidth===null || w===null)&&(this._state.StrokeWidth!==w)) {
                            this._state.StrokeWidth = w;

                            if (w!==null) w = this._mm2pt(w);
                            var _selectedItem = (w===null) ? w : _.find(this.cmbBorderSize.store.models, function(item) {
                                if ( w<item.attributes.value+0.00001 && w>item.attributes.value-0.00001) {
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
                    } else if (strokeType == Asc.c_oAscStrokeType.STROKE_NONE) {
                        this._state.StrokeWidth = 0;
                        this.BorderSize = this.cmbBorderSize.store.at(0).get('value');
                        this.cmbBorderSize.setValue(this.BorderSize);
                    } else {
                        this._state.StrokeWidth = null;
                        this.BorderSize = -1;
                        this.cmbBorderSize.setValue(null);
                    }
                    this._state.StrokeType = strokeType;
                }

                if (this._state.StrokeBorderType !== borderType) {
                    this.BorderType = this._state.StrokeBorderType = borderType;
                    this.cmbBorderType.setValue(borderType);
                }

                // pattern colors
                type1 = typeof(this.FGColor.Color);
                type2 = typeof(this._state.FGColor);

                if ( (type1 !== type2) || (type1=='object' &&
                    (this.FGColor.Color.effectValue!==this._state.FGColor.effectValue || this._state.FGColor.color.indexOf(this.FGColor.Color.color)<0)) ||
                    (type1!='object' && this._state.FGColor.indexOf(this.FGColor.Color)<0 )) {

                    this.btnFGColor.setColor(this.FGColor.Color);
                    if ( typeof(this.FGColor.Color) == 'object' ) {
                        var isselected = false;
                        for (var i=0; i<10; i++) {
                            if ( Common.Utils.ThemeColor.ThemeValues[i] == this.FGColor.Color.effectValue ) {
                                this.colorsFG.select(this.FGColor.Color,true);
                                isselected = true;
                                break;
                            }
                        }
                        if (!isselected) this.colorsFG.clearSelection();
                    } else
                        this.colorsFG.select(this.FGColor.Color,true);

                    this._state.FGColor = this.FGColor.Color;
                }

                type1 = typeof(this.BGColor.Color);
                type2 = typeof(this._state.BGColor);

                if ( (type1 !== type2) || (type1=='object' &&
                    (this.BGColor.Color.effectValue!==this._state.BGColor.effectValue || this._state.BGColor.color.indexOf(this.BGColor.Color.color)<0)) ||
                    (type1!='object' && this._state.BGColor.indexOf(this.BGColor.Color)<0 )) {

                    this.btnBGColor.setColor(this.BGColor.Color);
                    if ( typeof(this.BGColor.Color) == 'object' ) {
                        var isselected = false;
                        for (var i=0; i<10; i++) {
                            if ( Common.Utils.ThemeColor.ThemeValues[i] == this.BGColor.Color.effectValue ) {
                                this.colorsBG.select(this.BGColor.Color,true);
                                isselected = true;
                                break;
                            }
                        }
                        if (!isselected) this.colorsBG.clearSelection();
                    } else
                        this.colorsBG.select(this.BGColor.Color,true);

                    this._state.BGColor = this.BGColor.Color;
                }

                color = this.GradColor.colors[this.GradColor.currentIdx];
                type1 = typeof(color);
                type2 = typeof(this._state.GradColor);

                if ( (type1 !== type2) || (type1=='object' &&
                    (color.effectValue!==this._state.GradColor.effectValue || this._state.GradColor.color.indexOf(color.color)<0)) ||
                    (type1!='object' && this._state.GradColor.indexOf(color)<0 )) {

                    this.btnGradColor.setColor(color);
                    if ( typeof(color) == 'object' ) {
                        var isselected = false;
                        for (var i=0; i<10; i++) {
                            if ( Common.Utils.ThemeColor.ThemeValues[i] == color.effectValue ) {
                                this.colorsGrad.select(color,true);
                                isselected = true;
                                break;
                            }
                        }
                        if (!isselected) this.colorsGrad.clearSelection();
                    } else
                        this.colorsGrad.select(color,true);

                    this._state.GradColor = color;
                }

                this._noApply = false;
            }
        },

        createDelayedControls: function() {
            var me = this;

            this._arrFillSrc = [
                {displayValue: this.textColor,          value: Asc.c_oAscFill.FILL_TYPE_SOLID},
                {displayValue: this.textGradientFill,   value: Asc.c_oAscFill.FILL_TYPE_GRAD},
                {displayValue: this.textImageTexture,   value: Asc.c_oAscFill.FILL_TYPE_BLIP},
                {displayValue: this.textPatternFill,    value: Asc.c_oAscFill.FILL_TYPE_PATT},
                {displayValue: this.textNoFill,         value: Asc.c_oAscFill.FILL_TYPE_NOFILL}
            ];

            this.cmbFillSrc = new Common.UI.ComboBox({
                el: $('#shape-combo-fill-src'),
                cls: 'input-group-nr',
                style: 'width: 100%;',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: this._arrFillSrc
            });
            this.cmbFillSrc.setValue(this._arrFillSrc[0].value);
            this.cmbFillSrc.on('selected', _.bind(this.onFillSrcSelect, this));
            this.fillControls.push(this.cmbFillSrc);

            this.cmbPattern = new Common.UI.ComboDataView({
                itemWidth: 28,
                itemHeight: 28,
                menuMaxHeight: 300,
                enableKeyEvents: true,
                cls: 'combo-pattern'
            });
            this.cmbPattern.menuPicker.itemTemplate = this.cmbPattern.fieldPicker.itemTemplate = _.template([
                    '<div class="style" id="<%= id %>">',
                        '<img src="data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" class="combo-pattern-item" ',
                        'width="' + this.cmbPattern.itemWidth + '" height="' + this.cmbPattern.itemHeight + '" ',
                        'style="background-position: -<%= offsetx %>px -<%= offsety %>px;"/>',
                    '</div>'
                ].join(''));
            this.cmbPattern.render($('#shape-combo-pattern'));
            this.cmbPattern.openButton.menu.cmpEl.css({
                'min-width': 178,
                'max-width': 178
            });
            this.cmbPattern.on('click', _.bind(this.onPatternSelect, this));
            this.cmbPattern.openButton.menu.on('show:after', function () {
                me.cmbPattern.menuPicker.scroller.update({alwaysVisibleY: true});
            });
            this.fillControls.push(this.cmbPattern);

            this.btnInsertFromFile = new Common.UI.Button({
                el: $('#shape-button-from-file')
            });
            this.fillControls.push(this.btnInsertFromFile);

            this.btnInsertFromUrl = new Common.UI.Button({
                el: $('#shape-button-from-url')
            });
            this.fillControls.push(this.btnInsertFromUrl);

            this.btnInsertFromFile.on('click', _.bind(function(btn){
                if (this.api) this.api.ChangeShapeImageFromFile(this.BlipFillType);
                this.fireEvent('editcomplete', this);
            }, this));
            this.btnInsertFromUrl.on('click', _.bind(this.insertFromUrl, this));

            this._arrFillType = [
                {displayValue: this.textStretch, value: Asc.c_oAscFillBlipType.STRETCH},
                {displayValue: this.textTile,    value: Asc.c_oAscFillBlipType.TILE}
            ];

            this.cmbFillType = new Common.UI.ComboBox({
                el: $('#shape-combo-fill-type'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 90px;',
                editable: false,
                data: this._arrFillType
            });
            this.cmbFillType.setValue(this._arrFillType[0].value);
            this.cmbFillType.on('selected', _.bind(this.onFillTypeSelect, this));
            this.fillControls.push(this.cmbFillType);

            this.numTransparency = new Common.UI.MetricSpinner({
                el: $('#shape-spin-transparency'),
                step: 1,
                width: 62,
                value: '100 %',
                defaultUnit : "%",
                maxValue: 100,
                minValue: 0
            });
            this.numTransparency.on('change', _.bind(this.onNumTransparencyChange, this));
            this.fillControls.push(this.numTransparency);

            this.sldrTransparency = new Common.UI.SingleSlider({
                el: $('#shape-slider-transparency'),
                width: 75,
                minValue: 0,
                maxValue: 100,
                value: 100
            });
            this.sldrTransparency.on('change', _.bind(this.onTransparencyChange, this));
            this.sldrTransparency.on('changecomplete', _.bind(this.onTransparencyChangeComplete, this));
            this.fillControls.push(this.sldrTransparency);

            this.lblTransparencyStart = $(this.el).find('#shape-lbl-transparency-start');
            this.lblTransparencyEnd = $(this.el).find('#shape-lbl-transparency-end');

            this._arrGradType = [
                {displayValue: this.textLinear, value: Asc.c_oAscFillGradType.GRAD_LINEAR},
                {displayValue: this.textRadial, value: Asc.c_oAscFillGradType.GRAD_PATH}
            ];

            this.cmbGradType = new Common.UI.ComboBox({
                el: $('#shape-combo-grad-type'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 90px;',
                editable: false,
                data: this._arrGradType
            });
            this.cmbGradType.setValue(this._arrGradType[0].value);
            this.cmbGradType.on('selected', _.bind(this.onGradTypeSelect, this));
            this.fillControls.push(this.cmbGradType);

            this._viewDataLinear = [
                { offsetx: 0,   offsety: 0,   type:45,  subtype:-1, iconcls:'gradient-left-top' },
                { offsetx: 50,  offsety: 0,   type:90,  subtype:4,  iconcls:'gradient-top'},
                { offsetx: 100, offsety: 0,   type:135, subtype:5,  iconcls:'gradient-right-top'},
                { offsetx: 0,   offsety: 50,  type:0,   subtype:6,  iconcls:'gradient-left', cls: 'item-gradient-separator', selected: true},
                { offsetx: 100, offsety: 50,  type:180, subtype:1,  iconcls:'gradient-right'},
                { offsetx: 0,   offsety: 100, type:315, subtype:2,  iconcls:'gradient-left-bottom'},
                { offsetx: 50,  offsety: 100, type:270, subtype:3,  iconcls:'gradient-bottom'},
                { offsetx: 100, offsety: 100, type:225, subtype:7,  iconcls:'gradient-right-bottom'}
            ];

            this._viewDataRadial = [
                { offsetx: 100, offsety: 150, type:2, subtype:5, iconcls:'gradient-radial-center'}
            ];

            this.btnDirection = new Common.UI.Button({
                cls         : 'btn-large-dataview',
                iconCls     : 'item-gradient gradient-left',
                menu        : new Common.UI.Menu({
                    style: 'min-width: 60px;',
                    menuAlign: 'tr-br',
                    items: [
                        { template: _.template('<div id="id-shape-menu-direction" style="width: 175px; margin: 0 5px;"></div>') }
                    ]
                })
            });
            this.btnDirection.on('render:after', function(btn) {
                me.mnuDirectionPicker = new Common.UI.DataView({
                    el: $('#id-shape-menu-direction'),
                    parentMenu: btn.menu,
                    restoreHeight: 174,
                    allowScrollbar: false,
                    store: new Common.UI.DataViewStore(me._viewDataLinear),
                    itemTemplate: _.template('<div id="<%= id %>" class="item-gradient" style="background-position: -<%= offsetx %>px -<%= offsety %>px;"></div>')
                });
            });
            this.btnDirection.render($('#shape-button-direction'));
            this.mnuDirectionPicker.on('item:click', _.bind(this.onSelectGradient, this, this.btnDirection));
            this.fillControls.push(this.btnDirection);

            this.sldrGradient = new Common.UI.MultiSliderGradient({
                el: $('#shape-slider-gradient'),
                width: 125,
                minValue: 0,
                maxValue: 100,
                values: [0, 100]
            });
            this.sldrGradient.on('change', _.bind(this.onGradientChange, this));
            this.sldrGradient.on('changecomplete', _.bind(this.onGradientChangeComplete, this));
            this.sldrGradient.on('thumbclick', function(cmp, index){
                me.GradColor.currentIdx = index;
                var color = me.GradColor.colors[me.GradColor.currentIdx];
                me.btnGradColor.setColor(color);
                me.colorsGrad.select(color,false);
            });
            this.sldrGradient.on('thumbdblclick', function(cmp){
                me.btnGradColor.cmpEl.find('button').dropdown('toggle');
            });
            this.sldrGradient.on('sortthumbs', function(cmp, recalc_indexes){
                var colors = [],
                    currentIdx;
                _.each (recalc_indexes, function(recalc_index, index) {
                    colors.push(me.GradColor.colors[recalc_index]);
                    if (me.GradColor.currentIdx == recalc_index)
                        currentIdx = index;
                });
                me.OriginalFillType = null;
                me.GradColor.colors = colors;
                me.GradColor.currentIdx = currentIdx;
            });
            this.fillControls.push(this.sldrGradient);

            this.cmbBorderSize = new Common.UI.ComboBorderSizeEditable({
                el: $('#shape-combo-border-size'),
                style: "width: 93px;",
                txtNoBorders: this.txtNoBorders
            })
            .on('selected', _.bind(this.onBorderSizeSelect, this))
            .on('changed:before',_.bind(this.onBorderSizeChanged, this, true))
            .on('changed:after', _.bind(this.onBorderSizeChanged, this, false))
            .on('combo:blur',    _.bind(this.onComboBlur, this, false));
            this.BorderSize = this.cmbBorderSize.store.at(2).get('value');
            this.cmbBorderSize.setValue(this.BorderSize);
            this.lockedControls.push(this.cmbBorderSize);

            this.cmbBorderType = new Common.UI.ComboBorderType({
                el: $('#shape-combo-border-type'),
                style: "width: 93px;",
                menuStyle: 'min-width: 93px;'
            }).on('selected', _.bind(this.onBorderTypeSelect, this))
            .on('combo:blur',    _.bind(this.onComboBlur, this, false));
            this.BorderType = Asc.c_oDashType.solid;
            this.cmbBorderType.setValue(this.BorderType);
            this.lockedControls.push(this.cmbBorderType);

            this.btnRotate270 = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'rotate-270',
                value: 0,
                hint: this.textHint270
            });
            this.btnRotate270.render( $('#shape-button-270', me.$el));
            this.btnRotate270.on('click', _.bind(this.onBtnRotateClick, this));
            this.lockedControls.push(this.btnRotate270);

            this.btnRotate90 = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'rotate-90',
                value: 1,
                hint: this.textHint90
            });
            this.btnRotate90.render( $('#shape-button-90', me.$el));
            this.btnRotate90.on('click', _.bind(this.onBtnRotateClick, this));
            this.lockedControls.push(this.btnRotate90);

            this.btnFlipV = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'flip-vert',
                value: 0,
                hint: this.textHintFlipV
            });
            this.btnFlipV.render( $('#shape-button-flipv', me.$el));
            this.btnFlipV.on('click', _.bind(this.onBtnFlipClick, this));
            this.lockedControls.push(this.btnFlipV);

            this.btnFlipH = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'flip-hor',
                value: 1,
                hint: this.textHintFlipH
            });
            this.btnFlipH.render( $('#shape-button-fliph', me.$el));
            this.btnFlipH.on('click', _.bind(this.onBtnFlipClick, this));
            this.lockedControls.push(this.btnFlipH);

            var viewData = [
                { offsetx: 0, data: Asc.c_oAscWrapStyle2.Inline,    tip: this.txtInline, selected: true },
                { offsetx: 50, data: Asc.c_oAscWrapStyle2.Square,   tip: this.txtSquare },
                { offsetx: 100, data: Asc.c_oAscWrapStyle2.Tight,   tip: this.txtTight },
                { offsetx: 150, data: Asc.c_oAscWrapStyle2.Through, tip: this.txtThrough },
                { offsetx: 200, data: Asc.c_oAscWrapStyle2.TopAndBottom, tip: this.txtTopAndBottom },
                { offsetx: 250, data: Asc.c_oAscWrapStyle2.InFront, tip: this.txtInFront },
                { offsetx: 300, data: Asc.c_oAscWrapStyle2.Behind,  tip: this.txtBehind }
            ];


            this.cmbWrapType = new Common.UI.ComboDataView({
                itemWidth: 50,
                itemHeight: 50,
                menuMaxHeight: 300,
                enableKeyEvents: true,
                store: new Common.UI.DataViewStore(viewData),
                cls: 'combo-chart-style'
            });
            this.cmbWrapType.menuPicker.itemTemplate = this.cmbWrapType.fieldPicker.itemTemplate = _.template([
                '<div class="style" id="<%= id %>">',
                '<img src="data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" class="combo-wrap-item" ',
                'width="' + this.cmbWrapType.itemWidth + '" height="' + this.cmbWrapType.itemHeight + '" ',
                'style="background-position: -<%= offsetx %>px 0;"/>',
                '</div>'
            ].join(''));
            this.cmbWrapType.render($('#shape-combo-wrap'));
            this.cmbWrapType.openButton.menu.cmpEl.css({
                'min-width': 178,
                'max-width': 178
            });
            this.cmbWrapType.on('click', _.bind(this.onSelectWrap, this));
            this.cmbWrapType.openButton.menu.on('show:after', function () {
                me.cmbWrapType.menuPicker.scroller.update({alwaysVisibleY: true});
            });
            this.lockedControls.push(this.cmbWrapType);

            this.btnChangeShape = new Common.UI.Button({
                cls: 'btn-icon-default',
                iconCls: 'btn-change-shape',
                menu        : new Common.UI.Menu({
                    menuAlign: 'tr-br',
                    cls: 'menu-shapes',
                    items: []
                })
            });
            this.btnChangeShape.render( $('#shape-btn-change')) ;
            this.lockedControls.push(this.btnChangeShape);

            this.linkAdvanced = $('#shape-advanced-link');
            $(this.el).on('click', '#shape-advanced-link', _.bind(this.openAdvancedSettings, this));
        },

        createDelayedElements: function() {
            this.createDelayedControls();
            
            var global_hatch_menu_map = [
                0,1,3,2,4,
                53,5,6,7,8,
                9,10,11,12,13,
                14,15,16,17,18,
                19,20,22,23,24,
                25,27,28,29,30,
                31,32,33,34,35,
                36,37,38,39,40,
                41,42,43,44,45,
                46,49,50,51,52
            ];

            this.patternViewData = [];
            for (var i=0; i<13; i++) {
                for (var j=0; j<4; j++) {
                    var num = i*4+j;
                    this.patternViewData[num] = {offsetx: j*28, offsety: i*28, type: global_hatch_menu_map[num]};
                }
            }
            this.patternViewData.splice(this.patternViewData.length-2, 2);

            for ( var i=0; i<this.patternViewData.length; i++ ) {
                this.patternViewData[i].id = Common.UI.getId();
            }
            this.cmbPattern.menuPicker.store.add(this.patternViewData);
            if (this.cmbPattern.menuPicker.store.length > 0) {
                this.cmbPattern.fillComboView(this.cmbPattern.menuPicker.store.at(0),true);
                this.PatternFillType = this.patternViewData[0].type;
            }

            this.fillAutoShapes();
            this.UpdateThemeColors();
            this._initSettings = false;
        },

        onInitStandartTextures: function(texture) {
            var me = this;
            if (texture && texture.length>0){
                if (!this.btnTexture) {
                    this.btnTexture = new Common.UI.ComboBox({
                        el: $('#shape-combo-fill-texture'),
                        template: _.template([
                            '<div class="input-group combobox combo-dataview-menu input-group-nr dropdown-toggle" tabindex="0" data-toggle="dropdown">',
                                '<div class="form-control text" style="width: 90px;">' + this.textSelectTexture + '</div>',
                                '<div style="display: table-cell;"></div>',
                                '<button type="button" class="btn btn-default"><span class="caret img-commonctrl"></span></button>',
                            '</div>'
                        ].join(''))
                    });
                    this.textureMenu = new Common.UI.Menu({
                        items: [
                            { template: _.template('<div id="id-shape-menu-texture" style="width: 233px; margin: 0 5px;"></div>') }
                        ]
                    });
                    this.textureMenu.render($('#shape-combo-fill-texture'));
                    this.fillControls.push(this.btnTexture);
                }

                var texturearray = [];
                _.each(texture, function(item){
                    texturearray.push({
                        imageUrl: item.get_image(),
                        name   : me.textureNames[item.get_id()],
                        type    : item.get_id(),
//                        allowSelected : false,
                        selected: false
                    });
                });
                var mnuTexturePicker = new Common.UI.DataView({
                    el: $('#id-shape-menu-texture'),
                    restoreHeight: 174,
                    parentMenu: me.textureMenu,
                    showLast: false,
                    store: new Common.UI.DataViewStore(texturearray),
                    itemTemplate: _.template('<div class="item-shape"><img src="<%= imageUrl %>" id="<%= id %>"></div>')
                });
                mnuTexturePicker.on('item:click', _.bind(this.onSelectTexture, this));
            }
        },

        onSelectTexture: function(picker, view, record){
            this._fromTextureCmb = true;
            this.cmbFillType.setValue(this._arrFillType[1].value);
            this._fromTextureCmb = false;

            if (this.api) {
                var props = new Asc.asc_CShapeProperty();
                var fill = new Asc.asc_CShapeFill();
                fill.put_type(Asc.c_oAscFill.FILL_TYPE_BLIP);
                fill.put_fill( new Asc.asc_CFillBlip());
                fill.get_fill().put_type(Asc.c_oAscFillBlipType.TILE);
                fill.get_fill().put_texture_id(record.get('type'));
                props.put_fill(fill);
                this.imgprops.put_ShapeProperties(props);
                this.api.ImgApply(this.imgprops);
            }
            $(this.btnTexture.el).find('.form-control').prop('innerHTML', record.get('name'));
            this.fireEvent('editcomplete', this);
        },

        onBtnRotateClick: function(btn) {
            var properties = new Asc.asc_CImgProperty();
            properties.asc_putRotAdd((btn.options.value==1 ? 90 : 270) * 3.14159265358979 / 180);
            this.api.ImgApply(properties);
            this.fireEvent('editcomplete', this);
        },

        onBtnFlipClick: function(btn) {
            var properties = new Asc.asc_CImgProperty();
            if (btn.options.value==1)
                properties.asc_putFlipHInvert(true);
            else
                properties.asc_putFlipVInvert(true);
            this.api.ImgApply(properties);
            this.fireEvent('editcomplete', this);
        },

        fillAutoShapes: function() {
            var me = this,
                shapesStore = this.application.getCollection('ShapeGroups');

            var count = shapesStore.length;
            for (var i=-1; i<count-1 && count>0; i++) {
                var shapeGroup = shapesStore.at(i>-1 ? i : i+1);
                var menuItem = new Common.UI.MenuItem({
                    caption: shapeGroup.get('groupName'),
                    menu: new Common.UI.Menu({
                        menuAlign: 'tr-tl',
                        items: [
                            { template: _.template('<div id="id-shape-menu-shapegroup' + (i+1) + '" class="menu-shape" style="width: ' + (shapeGroup.get('groupWidth') - 8) + 'px; margin-left: 5px;"></div>') }
                        ]
                    })
                });
                me.btnChangeShape.menu.addItem(menuItem);

                var store = shapeGroup.get('groupStore');
                if (i<0) {
                    store = store.clone();
                    store.shift();
                }
                var shapePicker = new Common.UI.DataView({
                    el: $('#id-shape-menu-shapegroup' + (i+1)),
                    store: store,
                    parentMenu: menuItem.menu,
                    showLast: false,
                    itemTemplate: _.template('<div class="item-shape"><img src="<%= imageUrl %>" id="<%= id %>"></div>')
                });

                shapePicker.on('item:click', function(picker, item, record, e) {
                    if (me.api) {
                        me.api.ChangeShapeType(record.get('data').shapeType);
                        me.fireEvent('editcomplete', me);
                    }
                    if (e.type !== 'click')
                        me.btnChangeShape.menu.hide();
                });
            }
        },

        UpdateThemeColors: function() {
            if (!this.btnBackColor) {
                // create color buttons
                this.btnBackColor = new Common.UI.ColorButton({
                    style: "width:45px;",
                    menu        : new Common.UI.Menu({
                        items: [
                            { template: _.template('<div id="shape-back-color-menu" style="width: 169px; height: 220px; margin: 10px;"></div>') },
                            { template: _.template('<a id="shape-back-color-new" style="padding-left:12px;">' + this.textNewColor + '</a>') }
                        ]
                    })
                });
                this.btnBackColor.render( $('#shape-back-color-btn'));
                this.btnBackColor.setColor('transparent');
                this.fillControls.push(this.btnBackColor);
                this.colorsBack = new Common.UI.ThemeColorPalette({
                    el: $('#shape-back-color-menu'),
                    value: 'transparent',
                    transparent: true
                });
                this.colorsBack.on('select', _.bind(this.onColorsBackSelect, this));
                this.btnBackColor.menu.items[1].on('click',  _.bind(this.addNewColor, this, this.colorsBack, this.btnBackColor));

                this.btnFGColor = new Common.UI.ColorButton({
                    style: "width:45px;",
                    menu        : new Common.UI.Menu({
                        items: [
                            { template: _.template('<div id="shape-foreground-color-menu" style="width: 169px; height: 220px; margin: 10px;"></div>') },
                            { template: _.template('<a id="shape-foreground-color-new" style="padding-left:12px;">' + this.textNewColor + '</a>') }
                        ]
                    })
                });
                this.btnFGColor.render( $('#shape-foreground-color-btn'));
                this.btnFGColor.setColor('000000');
                this.fillControls.push(this.btnFGColor);
                this.colorsFG = new Common.UI.ThemeColorPalette({
                    el: $('#shape-foreground-color-menu'),
                    value: '000000'
                });
                this.colorsFG.on('select', _.bind(this.onColorsFGSelect, this));
                this.btnFGColor.menu.items[1].on('click',  _.bind(this.addNewColor, this, this.colorsFG, this.btnFGColor));

                this.btnBGColor = new Common.UI.ColorButton({
                    style: "width:45px;",
                    menu        : new Common.UI.Menu({
                        items: [
                            { template: _.template('<div id="shape-background-color-menu" style="width: 169px; height: 220px; margin: 10px;"></div>') },
                            { template: _.template('<a id="shape-background-color-new" style="padding-left:12px;">' + this.textNewColor + '</a>') }
                        ]
                    })
                });
                this.btnBGColor.render( $('#shape-background-color-btn'));
                this.btnBGColor.setColor('ffffff');
                this.fillControls.push(this.btnBGColor);
                this.colorsBG = new Common.UI.ThemeColorPalette({
                    el: $('#shape-background-color-menu'),
                    value: 'ffffff'
                });
                this.colorsBG.on('select', _.bind(this.onColorsBGSelect, this));
                this.btnBGColor.menu.items[1].on('click',  _.bind(this.addNewColor, this, this.colorsBG, this.btnBGColor));

                this.btnGradColor = new Common.UI.ColorButton({
                    style: "width:45px;",
                    menu        : new Common.UI.Menu({
                        items: [
                            { template: _.template('<div id="shape-gradient-color-menu" style="width: 169px; height: 220px; margin: 10px;"></div>') },
                            { template: _.template('<a id="shape-gradient-color-new" style="padding-left:12px;">' + this.textNewColor + '</a>') }
                        ]
                    })
                });
                this.btnGradColor.render( $('#shape-gradient-color-btn'));
                this.btnGradColor.setColor('000000');
                this.fillControls.push(this.btnGradColor);
                this.colorsGrad = new Common.UI.ThemeColorPalette({
                    el: $('#shape-gradient-color-menu'),
                    value: '000000'
                });
                this.colorsGrad.on('select', _.bind(this.onColorsGradientSelect, this));
                this.btnGradColor.menu.items[1].on('click',  _.bind(this.addNewColor, this, this.colorsGrad, this.btnGradColor));

                this.btnBorderColor = new Common.UI.ColorButton({
                    style: "width:45px;",
                    menu        : new Common.UI.Menu({
                        items: [
                            { template: _.template('<div id="shape-border-color-menu" style="width: 169px; height: 220px; margin: 10px;"></div>') },
                            { template: _.template('<a id="shape-border-color-new" style="padding-left:12px;">' + this.textNewColor + '</a>') }
                        ]
                    })
                });
                this.btnBorderColor.render( $('#shape-border-color-btn'));
                this.btnBorderColor.setColor('000000');
                this.lockedControls.push(this.btnBorderColor);
                this.colorsBorder = new Common.UI.ThemeColorPalette({
                    el: $('#shape-border-color-menu'),
                    value: '000000'
                });
                this.colorsBorder.on('select', _.bind(this.onColorsBorderSelect, this));
                this.btnBorderColor.menu.items[1].on('click',  _.bind(this.addNewColor, this, this.colorsBorder, this.btnBorderColor));
            }
            
            this.colorsBorder.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
            this.colorsBack.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
            this.colorsFG.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
            this.colorsBG.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
            this.colorsGrad.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
        },

        _pt2mm: function(value) {
            return (value * 25.4 / 72.0);
        },

        _mm2pt: function(value) {
            return (value * 72.0 / 25.4);
        },

        disableFillPanels: function(disable) {
            if (this._state.DisabledFillPanels!==disable) {
                this._state.DisabledFillPanels = disable;
                _.each(this.fillControls, function(item) {
                    item.setDisabled(disable);
                });
                this.lblTransparencyStart.toggleClass('disabled', disable);
                this.lblTransparencyEnd.toggleClass('disabled', disable);
            }
        },

        ShowHideElem: function(value) {
            this.FillColorContainer.toggleClass('settings-hidden', value !== Asc.c_oAscFill.FILL_TYPE_SOLID);
            this.FillImageContainer.toggleClass('settings-hidden', value !== Asc.c_oAscFill.FILL_TYPE_BLIP);
            this.FillPatternContainer.toggleClass('settings-hidden', value !== Asc.c_oAscFill.FILL_TYPE_PATT);
            this.FillGradientContainer.toggleClass('settings-hidden', value !== Asc.c_oAscFill.FILL_TYPE_GRAD);
            this.TransparencyContainer.toggleClass('settings-hidden', (value === Asc.c_oAscFill.FILL_TYPE_NOFILL || value === null));
        },

        setLocked: function (locked) {
            this._locked = locked;
        },

        disableControls: function(disable, disableFill) {
            if (this._initSettings) return;
            
            this.disableFillPanels(disable || disableFill);
            if (this._state.DisabledControls!==disable) {
                this._state.DisabledControls = disable;
                _.each(this.lockedControls, function(item) {
                    item.setDisabled(disable);
                });
                this.linkAdvanced.toggleClass('disabled', disable);
            }
        },

        hideShapeOnlySettings: function(value) {
            if (this._state.HideShapeOnlySettings !== value) {
                this._state.HideShapeOnlySettings = value;
                this.ShapeOnlySettings.toggleClass('hidden', value==true);
            }
        },

        hideChangeTypeSettings: function(value) {
            if (this._state.HideChangeTypeSettings !== value) {
                this._state.HideChangeTypeSettings = value;
                this.CanChangeType.toggleClass('hidden', value==true);
            }
        },

        txtNoBorders            : 'No Line',
        strStroke               : 'Stroke',
        strColor                : 'Color',
        strSize                 : 'Size',
        strChange               : 'Change Autoshape',
        strFill                 : 'Fill',
        textColor               : 'Color Fill',
        textImageTexture        : 'Picture or Texture',
        textTexture             : 'From Texture',
        textFromUrl             : 'From URL',
        textFromFile            : 'From File',
        textStretch             : 'Stretch',
        textTile                : 'Tile',
        txtCanvas               : 'Canvas',
        txtCarton               : 'Carton',
        txtDarkFabric           : 'Dark Fabric',
        txtGrain                : 'Grain',
        txtGranite              : 'Granite',
        txtGreyPaper            : 'Grey Paper',
        txtKnit                 : 'Knit',
        txtLeather              : 'Leather',
        txtBrownPaper           : 'Brown Paper',
        txtPapyrus              : 'Papyrus',
        txtWood                 : 'Wood',
        textNewColor            : 'Add New Custom Color',
        textAdvanced            : 'Show advanced settings',
        strTransparency         : 'Opacity',
        textNoFill              : 'No Fill',
        textSelectTexture       : 'Select',
        textGradientFill: 'Gradient Fill',
        textPatternFill: 'Pattern',
        strBackground: 'Background color',
        strForeground: 'Foreground color',
        strPattern: 'Pattern',
        textEmptyPattern: 'No Pattern',
        textLinear: 'Linear',
        textRadial: 'Radial',
        textDirection: 'Direction',
        textStyle: 'Style',
        textGradient: 'Gradient',
        textWrap:  'Wraping Style',
        txtInline: 'Inline',
        txtSquare: 'Square',
        txtTight: 'Tight',
        txtThrough: 'Through',
        txtTopAndBottom: 'Top and bottom',
        txtBehind: 'Behind',
        txtInFront: 'In front',
        textBorderSizeErr: 'The entered value is incorrect.<br>Please enter a value between 0 pt and 1584 pt.',
        strType: 'Type',
        textRotation: 'Rotation',
        textRotate90: 'Rotate 90°',
        textFlip: 'Flip',
        textHint270: 'Rotate Left 90°',
        textHint90: 'Rotate Right 90°',
        textHintFlipV: 'Flip Vertically',
        textHintFlipH: 'Flip Horizontally'
    }, DE.Views.ShapeSettings || {}));
});
