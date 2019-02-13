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
 *  TextArtSettings.js
 *
 *  Created by Julia Radzhabova on 7/10/15
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!documenteditor/main/app/template/TextArtSettings.template',
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
    'common/main/lib/component/MultiSliderGradient'
], function (menuTemplate, $, _, Backbone) {
    'use strict';

    DE.Views.TextArtSettings = Backbone.View.extend(_.extend({
        el: '#id-textart-settings',

        // Compile our stats template
        template: _.template(menuTemplate),

        // Delegated events for creating new items, and clearing completed ones.
        events: {
        },

        options: {
            alias: 'TextArtSettings'
        },

        initialize: function () {
            this._initSettings = true;
            this._noApply = true;
            this.imgprops = null;
            this.shapeprops = null;
            this._sendUndoPoint = true;
            this._sliderChanged = false;

            this.txtPt = Common.Utils.Metric.getMetricName(Common.Utils.Metric.c_MetricUnits.pt);
            
            this._state = {
                Transparency: null,
                FillType: Asc.c_oAscFill.FILL_TYPE_SOLID,
                ShapeColor: 'transparent',
                StrokeType: Asc.c_oAscStrokeType.STROKE_COLOR,
                StrokeWidth: this._pt2mm(1),
                StrokeColor: '000000',
                StrokeBorderType: Asc.c_oDashType.solid,
                GradColor: '000000',
                GradFillType: Asc.c_oAscFillGradType.GRAD_LINEAR,
                FormId: null,
                DisabledControls: false
            };
            this.lockedControls = [];
            this._locked = false;

            this.OriginalFillType = Asc.c_oAscFill.FILL_TYPE_SOLID;
            this.ShapeColor = {Value: 1, Color: 'transparent'};  // value=1 - цвет определен - прозрачный или другой, value=0 - цвет не определен, рисуем прозрачным
            this.GradFillType = Asc.c_oAscFillGradType.GRAD_LINEAR;
            this.GradColor = { values: [0, 100], colors: ['000000', 'ffffff'], currentIdx: 0};
            this.GradRadialDirectionIdx = 0;
            this.GradLinearDirectionType = 0;

            this.BorderColor = {Value: 1, Color: 'transparent'};  // value=1 - цвет определен - прозрачный или другой, value=0 - цвет не определен, рисуем прозрачным
            this.BorderSize = 0;
            this.BorderType = Asc.c_oDashType.solid;

            this.render();

            this.FillColorContainer = $('#textart-panel-color-fill');
            this.FillGradientContainer = $('#textart-panel-gradient-fill');
            this.TransparencyContainer = $('#textart-panel-transparent-fill');
        },

        render: function () {
            var el = $(this.el);
            el.html(this.template({
                scope: this
            }));
        },

        setApi: function(api) {
            this.api = api;
            return this;
        },

        onFillSrcSelect: function(combo, record) {
            this.ShowHideElem(record.value);
            switch (record.value){
                case Asc.c_oAscFill.FILL_TYPE_SOLID:
                    this._state.FillType = Asc.c_oAscFill.FILL_TYPE_SOLID;
                    if (!this._noApply) {
                        var props = new Asc.asc_TextArtProperties();
                        var fill = new Asc.asc_CShapeFill();
                        fill.put_type(Asc.c_oAscFill.FILL_TYPE_SOLID);
                        fill.put_fill( new Asc.asc_CFillSolid());
                        fill.get_fill().put_color(Common.Utils.ThemeColor.getRgbColor((this.ShapeColor.Color=='transparent') ? {color: '4f81bd', effectId: 24} : this.ShapeColor.Color));
                        props.asc_putFill(fill);
                        this.shapeprops.put_TextArtProperties(props);
                        this.api.ImgApply(this.imgprops);
                    }
                    break;
                case Asc.c_oAscFill.FILL_TYPE_GRAD:
                    this._state.FillType = Asc.c_oAscFill.FILL_TYPE_GRAD;
                    if (!this._noApply) {
                        var props = new Asc.asc_TextArtProperties();
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
                        props.asc_putFill(fill);
                        this.shapeprops.put_TextArtProperties(props);
                        this.api.ImgApply(this.imgprops);
                    }
                    break;
                case Asc.c_oAscFill.FILL_TYPE_NOFILL:
                    this._state.FillType = Asc.c_oAscFill.FILL_TYPE_NOFILL;
                    if (!this._noApply) {
                        var props = new Asc.asc_TextArtProperties();
                        var fill = new Asc.asc_CShapeFill();
                        fill.put_type(Asc.c_oAscFill.FILL_TYPE_NOFILL);
                        fill.put_fill(null);
                        props.asc_putFill(fill);
                        this.shapeprops.put_TextArtProperties(props);
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
                var props = new Asc.asc_TextArtProperties();
                var fill = new Asc.asc_CShapeFill();

                if (this.ShapeColor.Color=='transparent') {
                    fill.put_type(Asc.c_oAscFill.FILL_TYPE_NOFILL);
                    fill.put_fill(null);
                } else {
                    fill.put_type(Asc.c_oAscFill.FILL_TYPE_SOLID);
                    fill.put_fill( new Asc.asc_CFillSolid());
                    fill.get_fill().put_color(Common.Utils.ThemeColor.getRgbColor(this.ShapeColor.Color));
                }

                props.asc_putFill(fill);
                this.shapeprops.put_TextArtProperties(props);
                this.api.ImgApply(this.imgprops);
            }
            this.fireEvent('editcomplete', this);
        },

        addNewColor: function(picker, btn) {
            picker.addNewColor((typeof(btn.color) == 'object') ? btn.color.color : btn.color);
        },

        onNumTransparencyChange: function(field, newValue, oldValue, eOpts){
            this.sldrTransparency.setValue(field.getNumberValue(), true);
            if (this.api)  {
                var num = field.getNumberValue();
                var props = new Asc.asc_TextArtProperties();
                var fill = new Asc.asc_CShapeFill();
                fill.put_transparent(num * 2.55);
                props.asc_putFill(fill);
                this.shapeprops.put_TextArtProperties(props);
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
                var props = new Asc.asc_TextArtProperties();
                var fill = new Asc.asc_CShapeFill();
                fill.put_transparent(this._sliderChanged * 2.55);
                props.asc_putFill(fill);
                this.shapeprops.put_TextArtProperties(props);
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
                var props = new Asc.asc_TextArtProperties();
                var fill = new Asc.asc_CShapeFill();
                fill.put_type(Asc.c_oAscFill.FILL_TYPE_GRAD);
                fill.put_fill( new Asc.asc_CFillGrad());
                fill.get_fill().put_grad_type(this.GradFillType);
                if (this.GradFillType == Asc.c_oAscFillGradType.GRAD_LINEAR) {
                    fill.get_fill().put_linear_angle(this.GradLinearDirectionType * 60000);
                    fill.get_fill().put_linear_scale(true);
                }
                props.asc_putFill(fill);
                this.shapeprops.put_TextArtProperties(props);
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
                    var props = new Asc.asc_TextArtProperties();
                    var fill = new Asc.asc_CShapeFill();
                    fill.put_type(Asc.c_oAscFill.FILL_TYPE_GRAD);
                    fill.put_fill( new Asc.asc_CFillGrad());
                    fill.get_fill().put_grad_type(this.GradFillType);
                    fill.get_fill().put_linear_angle(rawData.type * 60000);
                    fill.get_fill().put_linear_scale(true);

                    props.asc_putFill(fill);
                    this.shapeprops.put_TextArtProperties(props);
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
                var props = new Asc.asc_TextArtProperties();
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
                props.asc_putFill(fill);
                this.shapeprops.put_TextArtProperties(props);
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
                var props = new Asc.asc_TextArtProperties();
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
                props.asc_putFill(fill);
                this.shapeprops.put_TextArtProperties(props);
                this.api.ImgApply(this.imgprops);
                this._sliderChanged = false;
            }
        },

        applyBorderSize: function(value) {
            value = parseFloat(value);
            value = isNaN(value) ? 0 : Math.max(0, Math.min(1584, value));

            this.BorderSize = value;
            if (this.api && !this._noApply) {
                var props = new Asc.asc_TextArtProperties();
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
                props.asc_putLine(stroke);
                this.shapeprops.put_TextArtProperties(props);
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
                var props = new Asc.asc_TextArtProperties();
                var stroke = new Asc.asc_CStroke();
                if (this.BorderSize<0.00001) {
                    stroke.put_type( Asc.c_oAscStrokeType.STROKE_NONE);
                } else {
                    stroke.put_type( Asc.c_oAscStrokeType.STROKE_COLOR);
                    stroke.put_color(Common.Utils.ThemeColor.getRgbColor(this.BorderColor.Color));
                    stroke.put_width(this._pt2mm(this.BorderSize));
                    stroke.asc_putPrstDash(this.BorderType);
                }
                props.asc_putLine(stroke);
                this.shapeprops.put_TextArtProperties(props);
                this.api.ImgApply(this.imgprops);
            }
            this.fireEvent('editcomplete', this);
        },

        onColorsBorderSelect: function(picker, color) {
            this.btnBorderColor.setColor(color);
            this.BorderColor = {Value: 1, Color: color};
            if (this.api && this.BorderSize>0 && !this._noApply) {
                var props = new Asc.asc_TextArtProperties();
                var stroke = new Asc.asc_CStroke();
                if (this.BorderSize<0.00001) {
                    stroke.put_type( Asc.c_oAscStrokeType.STROKE_NONE);
                } else {
                    stroke.put_type( Asc.c_oAscStrokeType.STROKE_COLOR);
                    stroke.put_color(Common.Utils.ThemeColor.getRgbColor(this.BorderColor.Color));
                    stroke.put_width(this._pt2mm(this.BorderSize));
                    stroke.asc_putPrstDash(this.BorderType);
                }
                props.asc_putLine(stroke);
                this.shapeprops.put_TextArtProperties(props);
                this.api.ImgApply(this.imgprops);
            }
            this.fireEvent('editcomplete', this);
        },

        ChangeSettings: function(props) {
            if (this.imgprops==null) {
                this.imgprops = new Asc.asc_CImgProperty();
                this.imgprops.put_ShapeProperties(new Asc.asc_CShapeProperty());
                this.shapeprops = this.imgprops.get_ShapeProperties();
            } else
                this.imgprops.put_ImageUrl(null);

            if (this._initSettings)
                this.createDelayedElements();

            if (props && props.get_ShapeProperties() && props.get_ShapeProperties().get_TextArtProperties())
            {
                var shapeprops = props.get_ShapeProperties().get_TextArtProperties();

                this._noApply = true;

                this.disableControls(this._locked);

                // background colors
                var rec = null,
                    fill = shapeprops.asc_getFill(),
                    fill_type = (fill) ? fill.get_type() : null,
                    color = null;

                if (fill) {
                    var transparency = fill.get_transparent();
                    if ( Math.abs(this._state.Transparency-transparency)>0.001 || Math.abs(this.numTransparency.getNumberValue()-transparency)>0.001 ||
                        (this._state.Transparency===null || transparency===null)&&(this._state.Transparency!==transparency || this.numTransparency.getNumberValue()!==transparency)) {

                        if (transparency !== undefined) {
                            this.sldrTransparency.setValue((transparency===null) ? 100 : transparency/255*100, true);
                            this.numTransparency.setValue(this.sldrTransparency.getValue(), true);
                        }
                        this._state.Transparency=transparency;
                    }
                }

                if (fill===null || fill===undefined || fill_type===null) { // заливка не совпадает у неск. фигур
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
                    this.GradColor.colors[0] = (this.ShapeColor.Color!=='transparent') ? Common.Utils.ThemeColor.colorValue2EffectId(this.ShapeColor.Color) : '000000';
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
                    this.ShapeColor = {Value: 1, Color: this.GradColor.colors[0]};
                }

                if ( this._state.FillType!==this.OriginalFillType ) {
                    this.cmbFillSrc.setValue((this.OriginalFillType===null) ? '' : this.OriginalFillType);
                    this._state.FillType=this.OriginalFillType;
                    this.ShowHideElem(this.OriginalFillType);
                }

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
                var stroke = shapeprops.asc_getLine(),
                    strokeType = (stroke) ? stroke.get_type() : null,
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

                var form = shapeprops.asc_getForm();
                if (this._state.FormId!==form) {
                    this.cmbTransform.suspendEvents();
                    var rec = this.cmbTransform.menuPicker.store.findWhere({
                        type: form
                    });
                    this.cmbTransform.menuPicker.selectRecord(rec);
                    this.cmbTransform.resumeEvents();
                    this._state.FormId=form;
                }

                this._noApply = false;
            }
        },

        createDelayedControls: function() {
            var me = this;

            this._arrFillSrc = [
                {displayValue: this.textColor,          value: Asc.c_oAscFill.FILL_TYPE_SOLID},
                {displayValue: this.textGradientFill,   value: Asc.c_oAscFill.FILL_TYPE_GRAD},
                {displayValue: this.textNoFill,         value: Asc.c_oAscFill.FILL_TYPE_NOFILL}
            ];

            this.cmbFillSrc = new Common.UI.ComboBox({
                el: $('#textart-combo-fill-src'),
                cls: 'input-group-nr',
                style: 'width: 100%;',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: this._arrFillSrc
            });
            this.cmbFillSrc.setValue(this._arrFillSrc[0].value);
            this.cmbFillSrc.on('selected', _.bind(this.onFillSrcSelect, this));
            this.lockedControls.push(this.cmbFillSrc);

            this.numTransparency = new Common.UI.MetricSpinner({
                el: $('#textart-spin-transparency'),
                step: 1,
                width: 62,
                value: '100 %',
                defaultUnit : "%",
                maxValue: 100,
                minValue: 0
            });
            this.numTransparency.on('change', _.bind(this.onNumTransparencyChange, this));
            this.lockedControls.push(this.numTransparency);

            this.sldrTransparency = new Common.UI.SingleSlider({
                el: $('#textart-slider-transparency'),
                width: 75,
                minValue: 0,
                maxValue: 100,
                value: 100
            });
            this.sldrTransparency.on('change', _.bind(this.onTransparencyChange, this));
            this.sldrTransparency.on('changecomplete', _.bind(this.onTransparencyChangeComplete, this));
            this.lockedControls.push(this.sldrTransparency);

            this.lblTransparencyStart = $(this.el).find('#textart-lbl-transparency-start');
            this.lblTransparencyEnd = $(this.el).find('#textart-lbl-transparency-end');

            this._arrGradType = [
                {displayValue: this.textLinear, value: Asc.c_oAscFillGradType.GRAD_LINEAR},
                {displayValue: this.textRadial, value: Asc.c_oAscFillGradType.GRAD_PATH}
            ];

            this.cmbGradType = new Common.UI.ComboBox({
                el: $('#textart-combo-grad-type'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 90px;',
                editable: false,
                data: this._arrGradType
            });
            this.cmbGradType.setValue(this._arrGradType[0].value);
            this.cmbGradType.on('selected', _.bind(this.onGradTypeSelect, this));
            this.lockedControls.push(this.cmbGradType);

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
                        { template: _.template('<div id="id-textart-menu-direction" style="width: 175px; margin: 0 5px;"></div>') }
                    ]
                })
            });
            this.btnDirection.on('render:after', function(btn) {
                me.mnuDirectionPicker = new Common.UI.DataView({
                    el: $('#id-textart-menu-direction'),
                    parentMenu: btn.menu,
                    restoreHeight: 174,
                    store: new Common.UI.DataViewStore(me._viewDataLinear),
                    itemTemplate: _.template('<div id="<%= id %>" class="item-gradient" style="background-position: -<%= offsetx %>px -<%= offsety %>px;"></div>')
                });
            });
            this.btnDirection.render($('#textart-button-direction'));
            this.mnuDirectionPicker.on('item:click', _.bind(this.onSelectGradient, this, this.btnDirection));
            this.lockedControls.push(this.btnDirection);

            this.sldrGradient = new Common.UI.MultiSliderGradient({
                el: $('#textart-slider-gradient'),
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
            this.lockedControls.push(this.sldrGradient);

            this.cmbBorderSize = new Common.UI.ComboBorderSizeEditable({
                el: $('#textart-combo-border-size'),
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
                el: $('#textart-combo-border-type'),
                style: "width: 93px;",
                menuStyle: 'min-width: 93px;'
            }).on('selected', _.bind(this.onBorderTypeSelect, this))
            .on('combo:blur',    _.bind(this.onComboBlur, this, false));
            this.BorderType = Asc.c_oDashType.solid;
            this.cmbBorderType.setValue(this.BorderType);
            this.lockedControls.push(this.cmbBorderType);

            this.cmbTransform = new Common.UI.ComboDataView({
                itemWidth: 50,
                itemHeight: 50,
                menuMaxHeight: 300,
                enableKeyEvents: true,
                cls: 'combo-textart'
            });
            this.cmbTransform.render($('#textart-combo-transform'));
            this.cmbTransform.openButton.menu.cmpEl.css({
                'min-width': 178,
                'max-width': 178
            });
            this.cmbTransform.on('click', _.bind(this.onTransformSelect, this));
            this.cmbTransform.openButton.menu.on('show:after', function () {
                me.cmbTransform.menuPicker.scroller.update({alwaysVisibleY: true});
            });
            this.lockedControls.push(this.cmbTransform);
        },

        createDelayedElements: function() {
            this.createDelayedControls();
            this.UpdateThemeColors();
            this.fillTransform(this.api.asc_getPropertyEditorTextArts());
            this._initSettings = false;
        },

        fillTextArt: function() {
            var me = this;
            
            if (!this.cmbTextArt) {
                this.cmbTextArt = new Common.UI.ComboDataView({
                    itemWidth: 50,
                    itemHeight: 50,
                    menuMaxHeight: 300,
                    enableKeyEvents: true,
                    showLast: false,
                    cls: 'combo-textart'
                });
                this.cmbTextArt.render($('#textart-combo-template'));
                this.cmbTextArt.openButton.menu.cmpEl.css({
                    'min-width': 178,
                    'max-width': 178
                });
                this.cmbTextArt.on('click', _.bind(this.onTextArtSelect, this));
                this.cmbTextArt.openButton.menu.on('show:after', function () {
                    me.cmbTextArt.menuPicker.scroller.update({alwaysVisibleY: true});
                });
                this.lockedControls.push(this.cmbTextArt);
            }

            var models = this.application.getCollection('Common.Collections.TextArt').models,
                count = this.cmbTextArt.menuPicker.store.length;
            if (count>0 && count==models.length) {
                var data = this.cmbTextArt.menuPicker.store.models;
                _.each(models, function(template, index){
                    data[index].set('imageUrl', template.get('imageUrl'));
                });
            } else {
                this.cmbTextArt.menuPicker.store.reset(models);
                if (this.cmbTextArt.menuPicker.store.length > 0)
                    this.cmbTextArt.fillComboView(this.cmbTextArt.menuPicker.store.at(0));
            }
        },

        onTextArtSelect: function(combo, record){
            if (this.api && !this._noApply) {
                var props = new Asc.asc_TextArtProperties();
                props.asc_putStyle(record.get('data'));
                this.shapeprops.put_TextArtProperties(props);
                this.api.ImgApply(this.imgprops);
            }
            this.fireEvent('editcomplete', this);
        },

        fillTransform: function(transforms) {
            if (transforms && transforms.length>1 && transforms[1]){
                var me = this,
                    artStore = [],
                    arrTransforms = transforms[1];
                for (var i=0; i<arrTransforms.length; i++) {
                    var arr = arrTransforms[i];
                    if (arr && arr.length>0)
                        _.each(arr, function(item){
                            artStore.push({
                                imageUrl: item.Image,
                                type    : item.Type,
                                selected: false
                            });
                        });
                }
                this.cmbTransform.menuPicker.store.add(artStore);
                if (this.cmbTransform.menuPicker.store.length > 0) {
                    this.cmbTransform.fillComboView(this.cmbTransform.menuPicker.store.at(0),true);
                }
            }
        },

        onTransformSelect: function(combo, record){
            if (this.api && !this._noApply) {
                var props = new Asc.asc_TextArtProperties();
                props.asc_putForm(record.get('type'));
                this.shapeprops.put_TextArtProperties(props);
                this.api.ImgApply(this.imgprops);
            }
            this.fireEvent('editcomplete', this);
        },

        UpdateThemeColors: function() {
            if (!this.btnBackColor) {
                this.btnBorderColor = new Common.UI.ColorButton({
                    style: "width:45px;",
                    menu        : new Common.UI.Menu({
                        items: [
                            { template: _.template('<div id="textart-border-color-menu" style="width: 169px; height: 220px; margin: 10px;"></div>') },
                            { template: _.template('<a id="textart-border-color-new" style="padding-left:12px;">' + this.textNewColor + '</a>') }
                        ]
                    })
                });
                this.btnBorderColor.render( $('#textart-border-color-btn'));
                this.btnBorderColor.setColor('000000');
                this.lockedControls.push(this.btnBorderColor);
                this.colorsBorder = new Common.UI.ThemeColorPalette({
                    el: $('#textart-border-color-menu'),
                    value: '000000'
                });
                this.colorsBorder.on('select', _.bind(this.onColorsBorderSelect, this));
                this.btnBorderColor.menu.items[1].on('click',  _.bind(this.addNewColor, this, this.colorsBorder, this.btnBorderColor));

                this.btnGradColor = new Common.UI.ColorButton({
                    style: "width:45px;",
                    menu        : new Common.UI.Menu({
                        items: [
                            { template: _.template('<div id="textart-gradient-color-menu" style="width: 169px; height: 220px; margin: 10px;"></div>') },
                            { template: _.template('<a id="textart-gradient-color-new" style="padding-left:12px;">' + this.textNewColor + '</a>') }
                        ]
                    })
                });
                this.btnGradColor.render( $('#textart-gradient-color-btn'));
                this.btnGradColor.setColor('000000');
                this.lockedControls.push(this.btnGradColor);
                this.colorsGrad = new Common.UI.ThemeColorPalette({
                    el: $('#textart-gradient-color-menu'),
                    value: '000000'
                });
                this.colorsGrad.on('select', _.bind(this.onColorsGradientSelect, this));
                this.btnGradColor.menu.items[1].on('click',  _.bind(this.addNewColor, this, this.colorsGrad, this.btnGradColor));

                this.btnBackColor = new Common.UI.ColorButton({
                    style: "width:45px;",
                    menu        : new Common.UI.Menu({
                        items: [
                            { template: _.template('<div id="textart-back-color-menu" style="width: 169px; height: 220px; margin: 10px;"></div>') },
                            { template: _.template('<a id="textart-back-color-new" style="padding-left:12px;">' + this.textNewColor + '</a>') }
                        ]
                    })
                });
                this.btnBackColor.render( $('#textart-back-color-btn'));
                this.btnBackColor.setColor('transparent');
                this.lockedControls.push(this.btnBackColor);
                this.colorsBack = new Common.UI.ThemeColorPalette({
                    el: $('#textart-back-color-menu'),
                    value: 'transparent',
                    transparent: true
                });
                this.colorsBack.on('select', _.bind(this.onColorsBackSelect, this));
                this.btnBackColor.menu.items[1].on('click',  _.bind(this.addNewColor, this, this.colorsBack, this.btnBackColor));
            }

            this.colorsBorder.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
            this.colorsBack.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
            this.colorsGrad.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
        },

        _pt2mm: function(value) {
            return (value * 25.4 / 72.0);
        },

        _mm2pt: function(value) {
            return (value * 72.0 / 25.4);
        },

        ShowHideElem: function(value) {
            this.FillColorContainer.toggleClass('settings-hidden', value !== Asc.c_oAscFill.FILL_TYPE_SOLID);
            this.FillGradientContainer.toggleClass('settings-hidden', value !== Asc.c_oAscFill.FILL_TYPE_GRAD);
            this.TransparencyContainer.toggleClass('settings-hidden', (value === Asc.c_oAscFill.FILL_TYPE_NOFILL || value === null));
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
            }
        },

        txtNoBorders            : 'No Line',
        strStroke               : 'Stroke',
        strColor                : 'Color',
        strSize                 : 'Size',
        strFill                 : 'Fill',
        textColor               : 'Color Fill',
        textNewColor            : 'Add New Custom Color',
        strTransparency         : 'Opacity',
        textNoFill              : 'No Fill',
        textSelectTexture       : 'Select',
        textGradientFill: 'Gradient Fill',
        textLinear: 'Linear',
        textRadial: 'Radial',
        textDirection: 'Direction',
        textStyle: 'Style',
        textGradient: 'Gradient',
        textBorderSizeErr: 'The entered value is incorrect.<br>Please enter a value between 0 pt and 1584 pt.',
        textTransform: 'Transform',
        textTemplate: 'Template',
        strType: 'Type'
    }, DE.Views.TextArtSettings || {}));
});
