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
 *  TextArtSettings.js
 *
 *  Created on 7/10/15
 *
 */

define([
    'text!spreadsheeteditor/main/app/template/TextArtSettings.template',
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
], function (menuTemplate, $, _, Backbone) {
    'use strict';

    SSE.Views.TextArtSettings = Backbone.View.extend(_.extend({
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
            this._texturearray = null;

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
                FormId: null,
                DisabledControls: false,
                applicationPixelRatio: Common.Utils.applicationPixelRatio(),
                isFromSmartArtInternal: false,
                HideTransformSettings: false
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

            this.render();

            this.FillColorContainer = $('#textart-panel-color-fill');
            this.FillImageContainer = $('#textart-panel-image-fill');
            this.FillPatternContainer = $('#textart-panel-pattern-fill');
            this.FillGradientContainer = $('#textart-panel-gradient-fill');
            this.TransparencyContainer = $('#textart-panel-transparent-fill');

            this.TransformSettings = $('.textart-transform');

            this.gradientColorsStr="#000, #fff";
            this.typeGradient = 90 ;
            SSE.getCollection('Common.Collections.TextArt').bind({
                reset: this.fillTextArt.bind(this)
            });
        },

        render: function () {
            var el = $(this.el);
            el.html(this.template({
                scope: this
            }));
            $(window).on('resize', _.bind(this.onWindowResize, this));
        },

        setApi: function(api) {
            this.api = api;
            if (this.api) {
                this.api.asc_setInterfaceDrawImagePlaceTextArt('textart-texture-img');
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
                        var props = new Asc.asc_TextArtProperties();
                        var fill = new Asc.asc_CShapeFill();
                        fill.asc_putType(Asc.c_oAscFill.FILL_TYPE_SOLID);
                        fill.asc_putFill( new Asc.asc_CFillSolid());
                        fill.asc_getFill().asc_putColor(Common.Utils.ThemeColor.getRgbColor((this.ShapeColor.Color=='transparent') ? {color: '4f81bd', effectId: 24} : this.ShapeColor.Color));
                        props.asc_putFill(fill);
                        this.shapeprops.put_TextArtProperties(props);
                        this.api.asc_setGraphicObjectProps(this.imgprops);
                    }
                    break;
                case Asc.c_oAscFill.FILL_TYPE_GRAD:
                    this._state.FillType = Asc.c_oAscFill.FILL_TYPE_GRAD;
                    if (!this._noApply) {
                        var props = new Asc.asc_TextArtProperties();
                        var fill = new Asc.asc_CShapeFill();
                        fill.asc_putType(Asc.c_oAscFill.FILL_TYPE_GRAD);
                        fill.asc_putFill( new Asc.asc_CFillGrad());
                        fill.asc_getFill().asc_putGradType(this.GradFillType);
                        if (this.GradFillType == Asc.c_oAscFillGradType.GRAD_LINEAR) {
                            fill.asc_getFill().asc_putLinearAngle(this.GradLinearDirectionType * 60000);
                            fill.asc_getFill().asc_putLinearScale(true);
                        }
                        if (this.OriginalFillType !== Asc.c_oAscFill.FILL_TYPE_GRAD) {
                            this.GradColor.values = [0, 100];
                            this.GradColor.colors = [this.GradColor.colors[0], this.GradColor.colors[this.GradColor.colors.length - 1]];
                            this.GradColor.currentIdx = 0;
                            var HexColor0 = Common.Utils.ThemeColor.getRgbColor(this.GradColor.colors[0]).get_color().get_hex(),
                                HexColor1 = Common.Utils.ThemeColor.getRgbColor(this.GradColor.colors[1]).get_color().get_hex();

                            if (HexColor0 === 'ffffff' && HexColor1 === 'ffffff') {
                                HexColor0 = {color: '4f81bd', effectId: 24};    // color accent1
                            } else {
                                HexColor0 = this.GradColor.colors[0];
                            }

                            fill.asc_getFill().asc_putPositions([this.GradColor.values[0]*1000, this.GradColor.values[1]*1000]);
                            fill.asc_getFill().asc_putColors([Common.Utils.ThemeColor.getRgbColor(HexColor0), Common.Utils.ThemeColor.getRgbColor(this.GradColor.colors[1])]);
                        }
                        props.asc_putFill(fill);
                        this.shapeprops.put_TextArtProperties(props);
                        this.api.asc_setGraphicObjectProps(this.imgprops);
                    }
                    break;
                case Asc.c_oAscFill.FILL_TYPE_BLIP:
                    if (this._state.FillType !== Asc.c_oAscFill.FILL_TYPE_BLIP && !this._noApply && this._texturearray && this._texturearray.length>0) {
                        this._state.FillType = Asc.c_oAscFill.FILL_TYPE_BLIP
                        var props = new Asc.asc_TextArtProperties();
                        var fill = new Asc.asc_CShapeFill();
                        fill.asc_putType(Asc.c_oAscFill.FILL_TYPE_BLIP);
                        fill.asc_putFill( new Asc.asc_CFillBlip());
                        fill.asc_getFill().asc_putType(Asc.c_oAscFillBlipType.TILE);
                        fill.asc_getFill().asc_putTextureId(this._texturearray[0].type);
                        props.asc_putFill(fill);
                        this.shapeprops.put_TextArtProperties(props);
                        this.api.asc_setGraphicObjectProps(this.imgprops);
                    }
                    break;
                case Asc.c_oAscFill.FILL_TYPE_PATT:
                    this._state.FillType = Asc.c_oAscFill.FILL_TYPE_PATT;
                    if (!this._noApply) {
                        var props = new Asc.asc_TextArtProperties();
                        var fill = new Asc.asc_CShapeFill();
                        fill.asc_putType(Asc.c_oAscFill.FILL_TYPE_PATT);
                        fill.asc_putFill( new Asc.asc_CFillHatch());
                        fill.asc_getFill().asc_putPatternType(this.PatternFillType);

                        var fHexColor = Common.Utils.ThemeColor.getRgbColor(this.FGColor.Color).get_color().get_hex();
                        var bHexColor = Common.Utils.ThemeColor.getRgbColor(this.BGColor.Color).get_color().get_hex();

                        if (bHexColor === 'ffffff' && fHexColor === 'ffffff') {
                            fHexColor = {color: '4f81bd', effectId: 24};    // color accent1
                        } else {
                            fHexColor = this.FGColor.Color;
                        }

                        fill.asc_getFill().asc_putColorFg(Common.Utils.ThemeColor.getRgbColor(fHexColor));
                        fill.asc_getFill().asc_putColorBg(Common.Utils.ThemeColor.getRgbColor(this.BGColor.Color));
                        props.asc_putFill(fill);
                        this.shapeprops.put_TextArtProperties(props);
                        this.api.asc_setGraphicObjectProps(this.imgprops);
                    }
                    break;
                case Asc.c_oAscFill.FILL_TYPE_NOFILL:
                    this._state.FillType = Asc.c_oAscFill.FILL_TYPE_NOFILL;
                    if (!this._noApply) {
                        var props = new Asc.asc_TextArtProperties();
                        var fill = new Asc.asc_CShapeFill();
                        fill.asc_putType(Asc.c_oAscFill.FILL_TYPE_NOFILL);
                        fill.asc_putFill(null);
                        props.asc_putFill(fill);
                        this.shapeprops.put_TextArtProperties(props);
                        this.api.asc_setGraphicObjectProps(this.imgprops);
                    }
                    break;
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onColorsBackSelect: function(btn, color) {
            this.ShapeColor = {Value: 1, Color: color};

            if (this.api && !this._noApply) {
                var props = new Asc.asc_TextArtProperties();
                var fill = new Asc.asc_CShapeFill();

                if (this.ShapeColor.Color=='transparent') {
                    fill.asc_putType(Asc.c_oAscFill.FILL_TYPE_NOFILL);
                    fill.asc_putFill(null);
                } else {
                    fill.asc_putType(Asc.c_oAscFill.FILL_TYPE_SOLID);
                    fill.asc_putFill( new Asc.asc_CFillSolid());
                    fill.asc_getFill().asc_putColor(Common.Utils.ThemeColor.getRgbColor(this.ShapeColor.Color));
                }

                props.asc_putFill(fill);
                this.shapeprops.put_TextArtProperties(props);
                this.api.asc_setGraphicObjectProps(this.imgprops);
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onPatternSelect: function(combo, record){
            if (this.api && !this._noApply) {
                this.PatternFillType = record.get('type');
                var props = new Asc.asc_TextArtProperties();
                var fill = new Asc.asc_CShapeFill();
                fill.asc_putType(Asc.c_oAscFill.FILL_TYPE_PATT);
                fill.asc_putFill( new Asc.asc_CFillHatch());
                fill.asc_getFill().asc_putPatternType(this.PatternFillType);
                if (this.OriginalFillType !== Asc.c_oAscFill.FILL_TYPE_PATT) {
                    fill.asc_getFill().asc_putColorFg(Common.Utils.ThemeColor.getRgbColor(this.FGColor.Color));
                    fill.asc_getFill().asc_putColorBg(Common.Utils.ThemeColor.getRgbColor(this.BGColor.Color));
                }
                props.asc_putFill(fill);
                this.shapeprops.put_TextArtProperties(props);
                this.api.asc_setGraphicObjectProps(this.imgprops);
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onColorsFGSelect: function(btn, color) {
            this.FGColor = {Value: 1, Color: color};
            if (this.api && !this._noApply) {
                var props = new Asc.asc_TextArtProperties();
                var fill = new Asc.asc_CShapeFill();
                fill.asc_putType(Asc.c_oAscFill.FILL_TYPE_PATT);
                fill.asc_putFill( new Asc.asc_CFillHatch());
                fill.asc_getFill().asc_putColorFg(Common.Utils.ThemeColor.getRgbColor(this.FGColor.Color));
                if (this.OriginalFillType !== Asc.c_oAscFill.FILL_TYPE_PATT) {
                    fill.asc_getFill().asc_putPatternType(this.PatternFillType);
                    fill.asc_getFill().asc_putColorBg(Common.Utils.ThemeColor.getRgbColor(this.BGColor.Color));
                }
                props.asc_putFill(fill);
                this.shapeprops.put_TextArtProperties(props);
                this.api.asc_setGraphicObjectProps(this.imgprops);
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onColorsBGSelect: function(btn, color) {
            this.BGColor = {Value: 1, Color: color};
            if (this.api && !this._noApply) {
                var props = new Asc.asc_TextArtProperties();
                var fill = new Asc.asc_CShapeFill();
                fill.asc_putType(Asc.c_oAscFill.FILL_TYPE_PATT);
                fill.asc_putFill( new Asc.asc_CFillHatch());
                if (this.OriginalFillType !== Asc.c_oAscFill.FILL_TYPE_PATT) {
                    fill.asc_getFill().asc_putPatternType(this.PatternFillType);
                    fill.asc_getFill().asc_putColorFg(Common.Utils.ThemeColor.getRgbColor(this.FGColor.Color));
                }
                fill.asc_getFill().asc_putColorBg(Common.Utils.ThemeColor.getRgbColor(this.BGColor.Color));
                props.asc_putFill(fill);
                this.shapeprops.put_TextArtProperties(props);
                this.api.asc_setGraphicObjectProps(this.imgprops);
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onFillTypeSelect: function(combo, record) {
            this.BlipFillType = record.value;

            if (this.api && this._fromTextureCmb !== true && this.OriginalFillType == Asc.c_oAscFill.FILL_TYPE_BLIP) {
                var props = new Asc.asc_TextArtProperties();
                var fill = new Asc.asc_CShapeFill();
                fill.asc_putType(Asc.c_oAscFill.FILL_TYPE_BLIP);
                fill.asc_putFill( new Asc.asc_CFillBlip());

                fill.asc_getFill().asc_putType(this.BlipFillType);

                props.asc_putFill(fill);
                this.shapeprops.put_TextArtProperties(props);
                this.api.asc_setGraphicObjectProps(this.imgprops);
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onNumTransparencyChange: function(field, newValue, oldValue, eOpts){
            this.sldrTransparency.setValue(field.getNumberValue(), true);
            if (this.api)  {
                var num = field.getNumberValue();
                var props = new Asc.asc_TextArtProperties();
                var fill = new Asc.asc_CShapeFill();
                fill.asc_putTransparent(num * 2.55);
                props.asc_putFill(fill);
                this.shapeprops.put_TextArtProperties(props);
                this.api.asc_setGraphicObjectProps(this.imgprops);
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
                fill.asc_putTransparent(this._sliderChanged * 2.55);
                props.asc_putFill(fill);
                this.shapeprops.put_TextArtProperties(props);
                this.api.asc_setGraphicObjectProps(this.imgprops);
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
                this.typeGradient = (record) ? this.GradLinearDirectionType + 90 : -1;
                this.numGradientAngle.setValue(this.GradLinearDirectionType, true);
                this.numGradientAngle.setDisabled(this._locked);
            } else if (this.GradFillType == Asc.c_oAscFillGradType.GRAD_PATH) {
                this.mnuDirectionPicker.store.reset(this._viewDataRadial);
                this.mnuDirectionPicker.cmpEl.width(60);
                this.mnuDirectionPicker.restoreHeight = 58;
                this.mnuDirectionPicker.selectByIndex(this.GradRadialDirectionIdx, true);
                if (this.GradRadialDirectionIdx>=0)
                    this.typeGradient = this._viewDataRadial[this.GradRadialDirectionIdx].type;
                else
                    this.typeGradient= -1;
                this.numGradientAngle.setValue(0, true);
                this.numGradientAngle.setDisabled(true);
            }

            if (this.api && !this._noApply) {
                var props = new Asc.asc_TextArtProperties();
                var fill = new Asc.asc_CShapeFill();
                fill.asc_putType(Asc.c_oAscFill.FILL_TYPE_GRAD);
                fill.asc_putFill( new Asc.asc_CFillGrad());
                fill.asc_getFill().asc_putGradType(this.GradFillType);
                if (this.GradFillType == Asc.c_oAscFillGradType.GRAD_LINEAR) {
                    fill.asc_getFill().asc_putLinearAngle(this.GradLinearDirectionType * 60000);
                    fill.asc_getFill().asc_putLinearScale(true);
                }
                props.asc_putFill(fill);
                this.shapeprops.put_TextArtProperties(props);
                this.api.asc_setGraphicObjectProps(this.imgprops);
            }

            Common.NotificationCenter.trigger('edit:complete', this);
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

            //this.btnDirection.setIconCls('item-gradient ' + rawData.iconcls);
            if (this.GradFillType === Asc.c_oAscFillGradType.GRAD_LINEAR) {
                this.GradLinearDirectionType = rawData.type;
                this.typeGradient = rawData.type + 90;
            } else {
                this.GradRadialDirectionIdx = 0;
                this.typeGradient = rawData.type;
            }
            (this.GradFillType == Asc.c_oAscFillGradType.GRAD_LINEAR) ? this.GradLinearDirectionType = rawData.type : this.GradRadialDirectionIdx = 0;
            if (this.api) {
                if (this.GradFillType == Asc.c_oAscFillGradType.GRAD_LINEAR) {
                    this.numGradientAngle.setValue(rawData.type, true);

                    var props = new Asc.asc_TextArtProperties();
                    var fill = new Asc.asc_CShapeFill();
                    fill.asc_putType(Asc.c_oAscFill.FILL_TYPE_GRAD);
                    fill.asc_putFill( new Asc.asc_CFillGrad());
                    fill.asc_getFill().asc_putGradType(this.GradFillType);
                    fill.asc_getFill().asc_putLinearAngle(rawData.type * 60000);
                    fill.asc_getFill().asc_putLinearScale(true);

                    props.asc_putFill(fill);
                    this.shapeprops.put_TextArtProperties(props);
                    this.api.asc_setGraphicObjectProps(this.imgprops);
                }
            }

            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onColorsGradientSelect: function(btn, color) {
            this.GradColor.colors[this.GradColor.currentIdx] = color;
            this.sldrGradient.setColorValue(Common.Utils.String.format('#{0}', (typeof(color) == 'object') ? color.color : color));

            if (this.api && !this._noApply) {
                var props = new Asc.asc_TextArtProperties();
                var fill = new Asc.asc_CShapeFill();
                fill.asc_putType(Asc.c_oAscFill.FILL_TYPE_GRAD);
                fill.asc_putFill( new Asc.asc_CFillGrad());
                fill.asc_getFill().asc_putGradType(this.GradFillType);
                var arr = [];
                this.GradColor.colors.forEach(function(item){
                    arr.push(Common.Utils.ThemeColor.getRgbColor(item));
                });
                fill.asc_getFill().asc_putColors(arr);

                if (this.OriginalFillType !== Asc.c_oAscFill.FILL_TYPE_GRAD) {
                    if (this.GradFillType == Asc.c_oAscFillGradType.GRAD_LINEAR) {
                        fill.asc_getFill().asc_putLinearAngle(this.GradLinearDirectionType * 60000);
                        fill.asc_getFill().asc_putLinearScale(true);
                    }
                    arr = [];
                    this.GradColor.values.forEach(function(item){
                        arr.push(item*1000);
                    });
                    fill.asc_getFill().asc_putPositions(arr);
                }
                props.asc_putFill(fill);
                this.shapeprops.put_TextArtProperties(props);
                this.api.asc_setGraphicObjectProps(this.imgprops);
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onGradientChange: function(slider, newValue, oldValue){
            this.GradColor.values = slider.getValues();
            var curValue = this.GradColor.values[this.GradColor.currentIdx];
            this.spnGradPosition.setValue(Common.UI.isRTL() ? this.sldrGradient.maxValue - curValue : curValue, true);
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
                fill.asc_putType(Asc.c_oAscFill.FILL_TYPE_GRAD);
                fill.asc_putFill( new Asc.asc_CFillGrad());
                fill.asc_getFill().asc_putGradType(this.GradFillType);
                var arr = [];
                this.GradColor.values.forEach(function(item){
                    arr.push(item*1000);
                });
                fill.asc_getFill().asc_putPositions(arr);

                if (this.OriginalFillType !== Asc.c_oAscFill.FILL_TYPE_GRAD) {
                    if (this.GradFillType == Asc.c_oAscFillGradType.GRAD_LINEAR) {
                        fill.asc_getFill().asc_putLinearAngle(this.GradLinearDirectionType * 60000);
                        fill.asc_getFill().asc_putLinearScale(true);
                    }
                    arr = [];
                    this.GradColor.colors.forEach(function(item){
                        arr.push(Common.Utils.ThemeColor.getRgbColor(item));
                    });
                    fill.asc_getFill().asc_putColors(arr);
                }
                props.asc_putFill(fill);
                this.shapeprops.put_TextArtProperties(props);
                this.api.asc_setGraphicObjectProps(this.imgprops);
                this._sliderChanged = false;
            }
        },

        applyBorderSize: function(value) {
            value = Common.Utils.String.parseFloat(value);
            value = isNaN(value) ? 0 : Math.max(0, Math.min(1584, value));

            this.BorderSize = value;
            if (this.api && !this._noApply) {
                var props = new Asc.asc_TextArtProperties();
                var stroke = new Asc.asc_CStroke();
                if (this.BorderSize<0.00001) {
                    stroke.asc_putType( Asc.c_oAscStrokeType.STROKE_NONE);
                    this._state.StrokeType = this._state.StrokeWidth = -1;
                } else {
                    stroke.asc_putType( Asc.c_oAscStrokeType.STROKE_COLOR);
                    if (this.BorderColor.Color == 'transparent' || this.BorderColor.Color.color == 'transparent')
                        stroke.asc_putColor(Common.Utils.ThemeColor.getRgbColor({color: '000000', effectId: 29}));
                    else if (this._state.StrokeType == Asc.c_oAscStrokeType.STROKE_NONE || this._state.StrokeType === null)
                        stroke.asc_putColor(Common.Utils.ThemeColor.getRgbColor(Common.Utils.ThemeColor.colorValue2EffectId(this.BorderColor.Color)));
                    stroke.asc_putPrstDash(this.BorderType);
                    stroke.asc_putWidth(this._pt2mm(this.BorderSize));
                    stroke.asc_putTransparent(this._state.LineTransparency);
                }
                props.asc_putLine(stroke);
                this.shapeprops.put_TextArtProperties(props);
                this.api.asc_setGraphicObjectProps(this.imgprops);
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onComboBlur: function() {
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onBorderSizeChanged: function(before, combo, record, e) {
            var me = this;
            if (before) {
                var value = parseFloat(record.value),
                    expr = new RegExp('^\\s*(\\d*(\\.|,)?\\d+)\\s*(' + me.txtPt + ')?\\s*$');
                if (!(expr.exec(record.value)) || value<0 || value>1584) {
                    this._state.StrokeType = this._state.StrokeWidth = -1;
                    setTimeout( function() {
                        Common.UI.error({
                            msg: me.textBorderSizeErr,
                            callback: function() {
                                _.defer(function(btn) {
                                    Common.NotificationCenter.trigger('edit:complete', me);
                                })
                            }
                        });
                    }, 10);
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
                    stroke.asc_putTransparent(this._state.LineTransparency);
                }
                props.asc_putLine(stroke);
                this.shapeprops.put_TextArtProperties(props);
                this.api.asc_setGraphicObjectProps(this.imgprops);
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onColorsBorderSelect: function(btn, color) {
            this.BorderColor = {Value: 1, Color: color};
            if (this.api && this.BorderSize>0 && !this._noApply) {
                var props = new Asc.asc_TextArtProperties();
                var stroke = new Asc.asc_CStroke();
                if (this.BorderSize<0.00001) {
                    stroke.asc_putType( Asc.c_oAscStrokeType.STROKE_NONE);
                } else {
                    stroke.asc_putType( Asc.c_oAscStrokeType.STROKE_COLOR);
                    stroke.asc_putColor(Common.Utils.ThemeColor.getRgbColor(this.BorderColor.Color));
                    stroke.asc_putWidth(this._pt2mm(this.BorderSize));
                    stroke.asc_putPrstDash(this.BorderType);
                    stroke.asc_putTransparent(this._state.LineTransparency);
                }
                props.asc_putLine(stroke);
                this.shapeprops.put_TextArtProperties(props);
                this.api.asc_setGraphicObjectProps(this.imgprops);
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onNumLineTransparencyChange: function(field, newValue, oldValue, eOpts){
            this.sldrLineTransparency.setValue(field.getNumberValue(), true);
            this._state.LineTransparency = field.getNumberValue() * 2.55;
            if (this.api && this.BorderSize>0 && !this._noApply)  {
                var props = new Asc.asc_TextArtProperties();
                var stroke = new Asc.asc_CStroke();
                stroke.asc_putTransparent(this._state.LineTransparency);
                props.asc_putLine(stroke);
                this.shapeprops.put_TextArtProperties(props);
                this.api.asc_setGraphicObjectProps(this.imgprops);
            }
        },

        onLineTransparencyChange: function(field, newValue, oldValue){
            this._sliderChangedLine = newValue;
            this.numLineTransparency.setValue(newValue, true);
            if (this._sendUndoPoint) {
                this.api.setStartPointHistory();
                this._sendUndoPoint = false;
                this.updatesliderline = setInterval(_.bind(this._transparencyLineApplyFunc, this), 100);
            }
        },

        onLineTransparencyChangeComplete: function(field, newValue, oldValue){
            clearInterval(this.updatesliderline);
            this._sliderChangedLine = newValue;
            if (!this._sendUndoPoint) { // start point was added
                this.api.setEndPointHistory();
                this._transparencyLineApplyFunc();
            }
            this._sendUndoPoint = true;
        },

        _transparencyLineApplyFunc: function() {
            if (this._sliderChangedLine!==undefined) {
                this._state.LineTransparency = this._sliderChangedLine * 2.55;
                var props = new Asc.asc_TextArtProperties();
                var stroke = new Asc.asc_CStroke();
                stroke.asc_putTransparent(this._state.LineTransparency);
                props.asc_putLine(stroke);
                this.shapeprops.put_TextArtProperties(props);
                this.api.asc_setGraphicObjectProps(this.imgprops);
                this._sliderChangedLine = undefined;
            }
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
                                    var props = new Asc.asc_TextArtProperties();
                                    var fill = new Asc.asc_CShapeFill();
                                    fill.asc_putType(Asc.c_oAscFill.FILL_TYPE_BLIP);
                                    fill.asc_putFill( new Asc.asc_CFillBlip());
                                    fill.asc_getFill().asc_putType(me.BlipFillType);
                                    fill.asc_getFill().asc_putUrl(checkUrl);

                                    props.asc_putFill(fill);
                                    me.shapeprops.put_TextArtProperties(props);
                                    me.api.asc_setGraphicObjectProps(me.imgprops);
                                }
                            }
                        }
                    }
                    Common.NotificationCenter.trigger('edit:complete', me);
                }
            })).show();
        },

        ChangeSettings: function(props) {
            if (this.imgprops==null) {
                this.imgprops = new Asc.asc_CImgProperty();
                this.imgprops.asc_putShapeProperties(new Asc.asc_CShapeProperty());
                this.shapeprops = this.imgprops.asc_getShapeProperties();
            }

            if (this._initSettings)
                this.createDelayedElements();

            this._state.isFromSmartArtInternal = props.asc_getShapeProperties() && props.asc_getShapeProperties().asc_getFromSmartArtInternal();
            this.hideTransformSettings(this._state.isFromSmartArtInternal);

            if (props && props.asc_getShapeProperties() && props.asc_getShapeProperties().get_TextArtProperties())
            {
                var shapeprops = props.asc_getShapeProperties().get_TextArtProperties();

                this._noApply = true;

                this.disableControls(this._locked);

                // background colors
                var rec = null,
                    fill = shapeprops.asc_getFill(),
                    fill_type = (fill) ? fill.asc_getType() : null,
                    color = null;

                if (fill) {
                    var transparency = fill.asc_getTransparent();
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
                    fill = fill.asc_getFill();
                    color = fill.asc_getColor();
                    if (color) {
                        if (color.asc_getType() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                            this.ShapeColor = {Value: 1, Color: {color: Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB()), effectValue: color.asc_getValue() }};
                        } else {
                            this.ShapeColor = {Value: 1, Color: Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB())};
                        }

                    } else
                        this.ShapeColor = {Value: 0, Color: 'transparent'};
                    this.OriginalFillType = Asc.c_oAscFill.FILL_TYPE_SOLID;
                    this.FGColor = (this.ShapeColor.Color!=='transparent') ? {Value: 1, Color: Common.Utils.ThemeColor.colorValue2EffectId(this.ShapeColor.Color)} : {Value: 1, Color: '000000'};
                    this.BGColor = {Value: 1, Color: 'ffffff'};
                    this.GradColor.colors[0] = (this.ShapeColor.Color!=='transparent') ? Common.Utils.ThemeColor.colorValue2EffectId(this.ShapeColor.Color) : '000000';
                    this.GradColor.colors[this.GradColor.colors.length-1] = 'ffffff';
                }  else if (fill_type==Asc.c_oAscFill.FILL_TYPE_BLIP) {
                    fill = fill.asc_getFill();
                    this.BlipFillType = fill.asc_getType(); // null - не совпадают у нескольких фигур
                    if (this._state.BlipFillType !== this.BlipFillType) {
                        if (this.BlipFillType == Asc.c_oAscFillBlipType.STRETCH || this.BlipFillType == Asc.c_oAscFillBlipType.TILE) {
                            this.cmbFillType.setValue(this.BlipFillType);
                        } else
                            this.cmbFillType.setValue('');
                        this._state.BlipFillType = this.BlipFillType;
                    }
                    this.OriginalFillType = Asc.c_oAscFill.FILL_TYPE_BLIP;
                } else if (fill_type==Asc.c_oAscFill.FILL_TYPE_PATT) {
                    fill = fill.asc_getFill();
                    this.PatternFillType = fill.asc_getPatternType(); // null - не совпадают у нескольких фигур
                    if (this._state.PatternFillType !== this.PatternFillType) {
                        this.cmbPattern.suspendEvents();
                        var rec = this.cmbPattern.menuPicker.store.findWhere({
                            type: this.PatternFillType
                        });
                        this.cmbPattern.menuPicker.selectRecord(rec);
                        this.cmbPattern.resumeEvents();
                        this._state.PatternFillType = this.PatternFillType;
                    }

                    color = fill.asc_getColorFg();
                    if (color) {
                        if (color.asc_getType() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                            this.FGColor = {Value: 1, Color: {color: Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB()), effectValue: color.asc_getValue() }};
                        } else {
                            this.FGColor = {Value: 1, Color: Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB())};
                        }
                    } else
                        this.FGColor = {Value: 1, Color: '000000'};

                    color = fill.asc_getColorBg();
                    if (color) {
                        if (color.asc_getType() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                            this.BGColor = {Value: 1, Color: {color: Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB()), effectValue: color.asc_getValue() }};
                        } else {
                            this.BGColor = {Value: 1, Color: Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB())};
                        }
                    } else
                        this.BGColor = {Value: 1, Color: 'ffffff'};

                    this.OriginalFillType = Asc.c_oAscFill.FILL_TYPE_PATT;
                    this.ShapeColor = {Value: 1, Color: Common.Utils.ThemeColor.colorValue2EffectId(this.FGColor.Color)};
                    this.GradColor.colors[0] = Common.Utils.ThemeColor.colorValue2EffectId(this.FGColor.Color);
                    this.GradColor.colors[this.GradColor.colors.length-1] = 'ffffff';
                } else if (fill_type==Asc.c_oAscFill.FILL_TYPE_GRAD) {
                    fill = fill.asc_getFill();
                    var gradfilltype = fill.asc_getGradType();  // null - не совпадают у нескольких фигур
                    if (this._state.GradFillType !== gradfilltype || this.GradFillType !== gradfilltype) {
                        this.GradFillType = gradfilltype;
                        rec = undefined;
                        if (this.GradFillType == Asc.c_oAscFillGradType.GRAD_LINEAR || this.GradFillType == Asc.c_oAscFillGradType.GRAD_PATH) {
                            this.cmbGradType.setValue(this.GradFillType);
                            rec = this.cmbGradType.store.findWhere({value: this.GradFillType});
                            this.onGradTypeSelect(this.cmbGradType, rec.attributes);
                        } else {
                            this.cmbGradType.setValue('');
                            this.typeGradient = -1;
                        }
                        this._state.GradFillType = this.GradFillType;
                    }

                    if (this.GradFillType == Asc.c_oAscFillGradType.GRAD_LINEAR ) {
                        var value = Math.floor(fill.asc_getLinearAngle()/60000);
                        if (Math.abs(this.GradLinearDirectionType-value)>0.001) {
                            this.GradLinearDirectionType=value;
                            var record = this.mnuDirectionPicker.store.findWhere({type: value});
                            this.mnuDirectionPicker.selectRecord(record, true);
                            this.typeGradient = (record)? value + 90 : -1;
                            this.numGradientAngle.setValue(value, true);
                        }
                    } else
                        this.numGradientAngle.setValue(0, true);

                    var me = this;
                    var colors = fill.asc_getColors(),
                        positions = fill.asc_getPositions(),
                        length = colors ? colors.length : this.GradColor.colors.length;
                    this.sldrGradient.setThumbs(length);
                    if (this.GradColor.colors.length>length) {
                        this.GradColor.colors.splice(length, this.GradColor.colors.length - length);
                        this.GradColor.values.splice(length, this.GradColor.colors.length - length);
                        this.GradColor.currentIdx = 0;
                    }
                    colors && colors.forEach(function(color, index) {
                        if (color) {
                            if (color.asc_getType() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                                me.GradColor.colors[index] = {color: Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB()), effectValue: color.asc_getValue()};
                                Common.Utils.ThemeColor.colorValue2EffectId(me.GradColor.colors[index]);
                            } else {
                                me.GradColor.colors[index] = Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB());
                            }
                        } else
                            me.GradColor.colors[index] = '000000';

                        var position = positions[index];
                        if (position!==null)       {
                            position = position/1000;
                            me.GradColor.values[index] = position;
                        }
                    });

                    var arrGrCollors=[];
                    var scale=(this.GradFillType == Asc.c_oAscFillGradType.GRAD_LINEAR)?1:0.7;
                    for (var index=0; index<length; index++) {

                        me.sldrGradient.setColorValue(Common.Utils.String.format('#{0}', (typeof(me.GradColor.colors[index]) == 'object') ? me.GradColor.colors[index].color : me.GradColor.colors[index]), index);
                        me.sldrGradient.setValue(index, me.GradColor.values[index]);
                        arrGrCollors.push(me.sldrGradient.getColorValue(index)+ ' '+ me.sldrGradient.getValue(index)*scale +'%');
                    }
                    this.btnDirectionRedraw(me.sldrGradient, arrGrCollors.join(', '));

                    if (_.isUndefined(me.GradColor.currentIdx) || me.GradColor.currentIdx >= this.GradColor.colors.length) {
                        me.GradColor.currentIdx = 0;
                    }
                    me.sldrGradient.setActiveThumb(me.GradColor.currentIdx);
                    var curValue = me.GradColor.values[me.GradColor.currentIdx];
                    this.spnGradPosition.setValue(Common.UI.isRTL() ? me.sldrGradient.maxValue - curValue : curValue);
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
                    Common.Utils.ThemeColor.selectPickerColorByEffect(this.ShapeColor.Color, this.colorsBack);
                    this._state.ShapeColor = this.ShapeColor.Color;
                }

                // border colors
                var stroke = shapeprops.asc_getLine(),
                    strokeType = (stroke) ? stroke.asc_getType() : null,
                    borderType,
                    update = (this._state.StrokeColor == 'transparent' && this.BorderColor.Color !== 'transparent'); // border color was changed for shape without line and then shape was reselected (or apply other settings)

                if (stroke) {
                    var transparency = stroke.asc_getTransparent();
                    if ( Math.abs(this._state.LineTransparency-transparency)>0.001 || Math.abs(this.numLineTransparency.getNumberValue()-transparency)>0.001 ||
                        (this._state.LineTransparency===null || transparency===null)&&(this._state.LineTransparency!==transparency || this.numLineTransparency.getNumberValue()!==transparency)) {

                        if (transparency !== undefined) {
                            this.sldrLineTransparency.setValue((transparency===null) ? 100 : transparency/255*100, true);
                            this.numLineTransparency.setValue(this.sldrLineTransparency.getValue(), true);
                        }
                        this._state.LineTransparency=transparency;
                    }
                    if ( strokeType == Asc.c_oAscStrokeType.STROKE_COLOR ) {
                        color = stroke.asc_getColor();
                        if (color) {
                            if (color.asc_getType() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                                this.BorderColor = {Value: 1, Color: {color: Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB()), effectValue: color.asc_getValue() }};
                            }
                            else
                                this.BorderColor = {Value: 1, Color: Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB())};
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
                    Common.Utils.ThemeColor.selectPickerColorByEffect(this.BorderColor.Color, this.colorsBorder);
                    this._state.StrokeColor = this.BorderColor.Color;
                }

                if (this._state.StrokeType !== strokeType || strokeType == Asc.c_oAscStrokeType.STROKE_COLOR) {
                    if ( strokeType == Asc.c_oAscStrokeType.STROKE_COLOR ) {
                        var w = stroke.asc_getWidth();
                        var check_value = (Math.abs(this._state.StrokeWidth-w)<0.00001) && !((new RegExp(this.txtPt + '\\s*$')).test(this.cmbBorderSize.getRawValue()));
                        if ( Math.abs(this._state.StrokeWidth-w)>0.00001 || check_value ||
                            (this._state.StrokeWidth===null || w===null)&&(this._state.StrokeWidth!==w)) {
                            this._state.StrokeWidth = w;

                            if (w!==null) w = this._mm2pt(w);
                            var _selectedItem = (w===null) ? w : _.find(this.cmbBorderSize.store.models, function(item) {
                                if ( w<item.attributes.value+0.0001 && w>item.attributes.value-0.0001) {
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
                    Common.Utils.ThemeColor.selectPickerColorByEffect(this.FGColor.Color, this.colorsFG);
                    this._state.FGColor = this.FGColor.Color;
                }

                type1 = typeof(this.BGColor.Color);
                type2 = typeof(this._state.BGColor);

                if ( (type1 !== type2) || (type1=='object' &&
                    (this.BGColor.Color.effectValue!==this._state.BGColor.effectValue || this._state.BGColor.color.indexOf(this.BGColor.Color.color)<0)) ||
                    (type1!='object' && this._state.BGColor.indexOf(this.BGColor.Color)<0 )) {

                    this.btnBGColor.setColor(this.BGColor.Color);
                    Common.Utils.ThemeColor.selectPickerColorByEffect(this.BGColor.Color, this.colorsBG);
                    this._state.BGColor = this.BGColor.Color;
                }

                color = this.GradColor.colors[this.GradColor.currentIdx];
                type1 = typeof(color);
                type2 = typeof(this._state.GradColor);

                if ( (type1 !== type2) || (type1=='object' &&
                    (color.effectValue!==this._state.GradColor.effectValue || this._state.GradColor.color.indexOf(color.color)<0)) ||
                    (type1!='object' && this._state.GradColor.indexOf(color)<0 )) {

                    this.btnGradColor.setColor(color);
                    Common.Utils.ThemeColor.selectPickerColorByEffect(color, this.colorsGrad);
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

        btnDirectionRedraw: function(slider, gradientColorsStr) {
            this.gradientColorsStr = gradientColorsStr;
            _.each(this._viewDataLinear, function(item){
                item.gradientColorsStr = gradientColorsStr;
            });
            this._viewDataRadial.gradientColorsStr = this.gradientColorsStr;
            this.mnuDirectionPicker.store.each(function(item){
                item.set('gradientColorsStr', gradientColorsStr);
            }, this);

            if (this.typeGradient == -1)
                this.btnDirection.$icon.css({'background': 'none'});
            else if (this.typeGradient == 2)
                this.btnDirection.$icon.css({'background': ('radial-gradient(' + gradientColorsStr + ')')});
            else
                this.btnDirection.$icon.css({
                    'background': ('linear-gradient(' + this.typeGradient + 'deg, ' + gradientColorsStr + ')')
                });
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
                el: $('#textart-combo-fill-src'),
                cls: 'input-group-nr',
                style: 'width: 100%;',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: this._arrFillSrc,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                ariaLabel: this.strFill
            });
            this.cmbFillSrc.setValue(this._arrFillSrc[0].value);
            this.cmbFillSrc.on('selected', _.bind(this.onFillSrcSelect, this));
            this.lockedControls.push(this.cmbFillSrc);

            var itemWidth = 28,
                itemHeight = 28;
            this.cmbPattern = new Common.UI.ComboDataView({
                itemWidth: itemWidth,
                itemHeight: itemHeight,
                menuMaxHeight: 300,
                enableKeyEvents: true,
                cls: 'combo-pattern',
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                fillOnChangeVisibility: true,
                itemTemplate: _.template([
                    '<div class="style" id="<%= id %>">',
                        '<img src="data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" class="combo-pattern-item" ',
                        'width="' + itemWidth + '" height="' + itemHeight + '" ',
                        'style="background-position: -<%= offsetx %>px -<%= offsety %>px;"/>',
                    '</div>'
                ].join('')),
                ariaLabel: this.strPattern
            });
            this.cmbPattern.render($('#textart-combo-pattern'));
            this.cmbPattern.openButton.menu.cmpEl.css({
                'min-width': 178,
                'max-width': 178
            });
            this.cmbPattern.on('click', _.bind(this.onPatternSelect, this));
            this.cmbPattern.openButton.menu.on('show:after', function () {
                me.cmbPattern.menuPicker.scroller.update({alwaysVisibleY: true});
            });

            this.lockedControls.push(this.cmbPattern);

            this.btnInsertFromFile = new Common.UI.Button({
                el: $('#textart-button-from-file')
            });
            this.lockedControls.push(this.btnInsertFromFile);

            this.btnInsertFromUrl = new Common.UI.Button({
                el: $('#textart-button-from-url')
            });
            this.lockedControls.push(this.btnInsertFromUrl);

            this.btnInsertFromFile.on('click', _.bind(function(btn){
                if (this.api) this.api.asc_changeArtImageFromFile(this.BlipFillType);
                Common.NotificationCenter.trigger('edit:complete', this);
            }, this));
            this.btnInsertFromUrl.on('click', _.bind(this.insertFromUrl, this));

            this._arrFillType = [
                {displayValue: this.textStretch, value: Asc.c_oAscFillBlipType.STRETCH},
                {displayValue: this.textTile,    value: Asc.c_oAscFillBlipType.TILE}
            ];

            this.cmbFillType = new Common.UI.ComboBox({
                el: $('#textart-combo-fill-type'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 90px;',
                editable: false,
                data: this._arrFillType,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                ariaLabel: this.strType
            });
            this.cmbFillType.setValue(this._arrFillType[0].value);
            this.cmbFillType.on('selected', _.bind(this.onFillTypeSelect, this));
            this.lockedControls.push(this.cmbFillType);

            this.numTransparency = new Common.UI.MetricSpinner({
                el: $('#textart-spin-transparency'),
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
            this.numTransparency.on('inputleave', function(){ Common.NotificationCenter.trigger('edit:complete', me);});
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
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: this._arrGradType,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                ariaLabel: this.textStyle
            });
            this.cmbGradType.setValue(this._arrGradType[0].value);
            this.cmbGradType.on('selected', _.bind(this.onGradTypeSelect, this));
            this.lockedControls.push(this.cmbGradType);

            this._viewDataLinear = [
                { type:45,  subtype:-1},
                { type:90,  subtype:4},
                { type:135, subtype:5},
                { type:0,   subtype:6, cls: 'item-gradient-separator', selected: true},
                { type:180, subtype:1},
                { type:315, subtype:2},
                { type:270, subtype:3},
                { type:225, subtype:7}
            ];
            _.each(this._viewDataLinear, function(item){
                item.gradientColorsStr = me.gradientColorsStr;
            });

            this._viewDataRadial = [
                { type:2, subtype:5, gradientColorsStr: this.gradientColorsStr}
            ];

            this.btnDirection = new Common.UI.Button({
                cls         : 'btn-large-dataview',
                scaling     : false,
                iconCls     : 'item-gradient gradient-left',
                menu        : new Common.UI.Menu({
                    style: 'min-width: 60px;',
                    menuAlign: 'tr-br',
                    items: [
                        { template: _.template('<div id="id-textart-menu-direction" style="width: 175px; margin: 0 5px;"></div>') }
                    ]
                }),
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                ariaLabel: this.textDirection
            });
            this.btnDirection.on('render:after', function(btn) {
                me.mnuDirectionPicker = new Common.UI.DataView({
                    el: $('#id-textart-menu-direction'),
                    parentMenu: btn.menu,
                    restoreHeight: 174,
                    store: new Common.UI.DataViewStore(me._viewDataLinear),
                    itemTemplate: _.template('<div id="<%= id %>" class="item-gradient" style="background: '
                        +'<% if(type!=2) {%>linear-gradient(<%= type + 90 %>deg,<%= gradientColorsStr %>)'
                        +' <%} else {%> radial-gradient(<%= gradientColorsStr %>) <%}%>;"></div>')
                });
            });
            this.btnDirection.render($('#textart-button-direction'));
            this.mnuDirectionPicker.on('item:click', _.bind(this.onSelectGradient, this, this.btnDirection));
            this.lockedControls.push(this.btnDirection);

            this.sldrGradient = new Common.UI.MultiSliderGradient({
                el: $('#textart-slider-gradient'),
                width: 192,
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
                var pos = me.GradColor.values[me.GradColor.currentIdx];
                me.spnGradPosition.setValue(Common.UI.isRTL() ? me.sldrGradient.maxValue - pos : pos, true);
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
            this.sldrGradient.on('addthumb', function(cmp, index, pos){
                me.GradColor.colors[index] = me.GradColor.colors[me.GradColor.currentIdx];
                me.GradColor.currentIdx = index;
                var color = me.sldrGradient.addNewThumb(index, pos);
                me.GradColor.colors[me.GradColor.currentIdx] = color;
            });
            this.sldrGradient.on('removethumb', function(cmp, index){
                me.sldrGradient.removeThumb(index);
                me.GradColor.values.splice(index, 1);
                me.sldrGradient.changeGradientStyle();
                if (_.isUndefined(me.GradColor.currentIdx) || me.GradColor.currentIdx >= me.GradColor.colors.length) {
                    var newIndex = index > 0 ? index - 1 : index;
                    newIndex = (newIndex === 0 && me.GradColor.values.length > 2) ? me.GradColor.values.length - 2 : newIndex;
                    me.GradColor.currentIdx = newIndex;
                }
                me.sldrGradient.setActiveThumb(me.GradColor.currentIdx);
            });
            this.lockedControls.push(this.sldrGradient);

            this.spnGradPosition = new Common.UI.MetricSpinner({
                el: $('#textart-gradient-position'),
                step: 1,
                width: 60,
                defaultUnit : "%",
                value: '50 %',
                allowDecimal: false,
                maxValue: 100,
                minValue: 0,
                disabled: this._locked,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                ariaLabel: this.textPosition
            });
            this.lockedControls.push(this.spnGradPosition);
            this.spnGradPosition.on('change', _.bind(this.onPositionChange, this));
            this.spnGradPosition.on('inputleave', function(){ Common.NotificationCenter.trigger('edit:complete', me);});

            this.btnAddGradientStep = new Common.UI.Button({
                parentEl: $('#textart-gradient-add-step'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-add-breakpoint',
                disabled: this._locked,
                hint: this.tipAddGradientPoint,
                dataHint: '1',
                dataHintDirection: 'bottom'
            });
            this.btnAddGradientStep.on('click', _.bind(this.onAddGradientStep, this));
            this.lockedControls.push(this.btnAddGradientStep);

            this.btnRemoveGradientStep = new Common.UI.Button({
                parentEl: $('#textart-gradient-remove-step'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-remove-breakpoint',
                disabled: this._locked,
                hint: this.tipRemoveGradientPoint,
                dataHint: '1',
                dataHintDirection: 'bottom'
            });
            this.btnRemoveGradientStep.on('click', _.bind(this.onRemoveGradientStep, this));
            this.lockedControls.push(this.btnRemoveGradientStep);

            this.numGradientAngle = new Common.UI.MetricSpinner({
                el: $('#textart-spin-gradient-angle'),
                step: 10,
                width: 60,
                defaultUnit : "°",
                value: '0 °',
                allowDecimal: true,
                maxValue: 359.9,
                minValue: 0,
                disabled: this._locked,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                ariaLabel: this.textAngle
            });
            this.lockedControls.push(this.numGradientAngle);
            this.numGradientAngle.on('change', _.bind(this.onGradientAngleChange, this));
            this.numGradientAngle.on('inputleave', function(){ Common.NotificationCenter.trigger('edit:complete', me);});

            this.cmbBorderSize = new Common.UI.ComboBorderSizeEditable({
                el: $('#textart-combo-border-size'),
                style: "width: 93px;",
                txtNoBorders: this.txtNoBorders,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                ariaLabel: this.strStroke + ' ' + this.strSize
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
                menuStyle: 'min-width: 93px;',
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                ariaLabel: this.strStroke + ' ' + this.strType
            }).on('selected', _.bind(this.onBorderTypeSelect, this))
            .on('combo:blur',    _.bind(this.onComboBlur, this, false));
            this.BorderType = Asc.c_oDashType.solid;
            this.cmbBorderType.setValue(this.BorderType);
            this.lockedControls.push(this.cmbBorderType);

            this.numLineTransparency = new Common.UI.MetricSpinner({
                el: $('#textart-line-spin-transparency'),
                step: 1,
                width: 62,
                value: '100 %',
                defaultUnit : "%",
                maxValue: 100,
                minValue: 0,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                ariaLabel: this.strStroke + ' ' + this.strTransparency
            });
            this.numLineTransparency.on('change', _.bind(this.onNumLineTransparencyChange, this));
            this.numLineTransparency.on('inputleave', function(){ Common.NotificationCenter.trigger('edit:complete', me);});
            this.lockedControls.push(this.numLineTransparency);

            this.sldrLineTransparency = new Common.UI.SingleSlider({
                el: $('#textart-line-slider-transparency'),
                width: 75,
                minValue: 0,
                maxValue: 100,
                value: 100
            });
            this.sldrLineTransparency.on('change', _.bind(this.onLineTransparencyChange, this));
            this.sldrLineTransparency.on('changecomplete', _.bind(this.onLineTransparencyChangeComplete, this));
            this.lockedControls.push(this.sldrLineTransparency);

            this.lblLineTransparencyStart = $(this.el).find('#textart-line-lbl-transparency-start');
            this.lblLineTransparencyEnd = $(this.el).find('#textart-line-lbl-transparency-end');

            this.cmbTransform = new Common.UI.ComboDataView({
                itemWidth: 50,
                itemHeight: 50,
                menuMaxHeight: 300,
                enableKeyEvents: true,
                cls: 'combo-textart',
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                ariaLabel: this.textTransform,
                fillOnChangeVisibility: true
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
            this._initSettings = false;
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

            this.UpdateThemeColors();
            this.onInitStandartTextures();
            this.fillTextArt();
            this.fillTransform(this.api.asc_getPropertyEditorTextArts());
        },

        onInitStandartTextures: function(texture) {
            var me = this;
            if (texture && texture.length>0){
                me._texturearray = [];
                _.each(texture, function(item){
                    me._texturearray.push({
                        imageUrl: item.get_image(),
                        name   : me.textureNames[item.get_id()],
                        tip   : me.textureNames[item.get_id()],
                        type    : item.get_id(),
//                        allowSelected : false,
                        selected: false
                    });
                });
            }

            if (!me._texturearray || me._texturearray.length<1) return;
            if (!this._initSettings && !this.btnTexture) {
                this.btnTexture = new Common.UI.ComboBox({
                    el: $('#textart-combo-fill-texture'),
                    template: _.template([
                        '<div class="input-group combobox combo-dataview-menu input-group-nr dropdown-toggle" tabindex="0" data-toggle="dropdown">',
                            '<div class="form-control text" style="width: 90px;" data-hint="1" data-hint-direction="bottom" data-hint-offset="big">' + this.textSelectTexture + '</div>',
                            '<div style="display: table-cell;"></div>',
                            '<button type="button" class="btn btn-default">',
                                '<span class="caret" />',
                            '</button>',
                        '</div>'
                    ].join('')),
                    ariaLabel: this.textTexture
                });
                this.textureMenu = new Common.UI.Menu({
                    items: [
                        { template: _.template('<div id="id-textart-menu-texture" style="width: 233px; margin: 0 5px;"></div>') }
                    ]
                });
                this.textureMenu.render($('#textart-combo-fill-texture'));
                this.lockedControls.push(this.btnTexture);

                var onShowBefore = function(menu) {
                    var mnuTexturePicker = new Common.UI.DataView({
                        el: $('#id-textart-menu-texture'),
                        restoreHeight: 174,
                        parentMenu: menu,
                        showLast: false,
                        delayRenderTips: true,
                        store: new Common.UI.DataViewStore(me._texturearray || []),
                        itemTemplate: _.template('<div><img src="<%= imageUrl %>" id="<%= id %>"></div>')
                    });
                    mnuTexturePicker.on('item:click', _.bind(me.onSelectTexture, me));
                    menu.off('show:before', onShowBefore);
                };
                this.textureMenu.on('show:before', onShowBefore);
            }
        },

        onSelectTexture: function(picker, view, record){
            this._fromTextureCmb = true;
            this.cmbFillType.setValue(this._arrFillType[1].value);
            this._fromTextureCmb = false;

            if (this.api) {
                var props = new Asc.asc_TextArtProperties();
                var fill = new Asc.asc_CShapeFill();
                fill.asc_putType(Asc.c_oAscFill.FILL_TYPE_BLIP);
                fill.asc_putFill( new Asc.asc_CFillBlip());
                fill.asc_getFill().asc_putType(Asc.c_oAscFillBlipType.TILE);
                fill.asc_getFill().asc_putTextureId(record.get('type'));
                props.asc_putFill(fill);
                this.shapeprops.put_TextArtProperties(props);
                this.api.asc_setGraphicObjectProps(this.imgprops);
            }
            $(this.btnTexture.el).find('.form-control').prop('innerHTML', record.get('name'));
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        fillTextArt: function() {
            if (this._initSettings) return;
            var me = this;
            if (!this.cmbTextArt) {
                this.cmbTextArt = new Common.UI.ComboDataView({
                    itemWidth: 50,
                    itemHeight: 50,
                    menuMaxHeight: 300,
                    enableKeyEvents: true,
                    showLast: false,
                    cls: 'combo-textart',
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'big',
                    ariaLabel: this.textTemplate,
                    fillOnChangeVisibility: true
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
            if (models.length<1) {
                SSE.getController('Main').fillTextArt(this.api.asc_getTextArtPreviews());
                return;
            }
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
                this.api.asc_setGraphicObjectProps(this.imgprops);
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        fillTransform: function(transforms) {
            if (transforms){
                var artStore = [];
                for (var i=0; i<transforms.length; i++) {
                    var item = transforms[i];
                    artStore.push({
                        imageUrl: item.Image,
                        type    : item.Type,
                        selected: false
                    });
                }
                this.cmbTransform.menuPicker.store.reset(artStore);
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
                this.api.asc_setGraphicObjectProps(this.imgprops);
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        UpdateThemeColors: function() {
            if (this._initSettings) return;
            if (!this.btnBackColor) {
                this.btnBorderColor = new Common.UI.ColorButton({
                    parentEl: $('#textart-border-color-btn'),
                    color: '000000',
                    eyeDropper: true,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'big',
                    ariaLabel: this.strStroke + ' ' + this.strColor
                });
                this.lockedControls.push(this.btnBorderColor);
                this.colorsBorder = this.btnBorderColor.getPicker();
                this.btnBorderColor.on('color:select', _.bind(this.onColorsBorderSelect, this));
                this.btnBorderColor.on('eyedropper:start', _.bind(this.onEyedropperStart, this));
                this.btnBorderColor.on('eyedropper:end', _.bind(this.onEyedropperEnd, this));

                this.btnBackColor = new Common.UI.ColorButton({
                    parentEl: $('#textart-back-color-btn'),
                    transparent: true,
                    color: 'transparent',
                    eyeDropper: true,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'medium',
                    ariaLabel: this.strColor
                });
                this.lockedControls.push(this.btnBackColor);
                this.colorsBack = this.btnBackColor.getPicker();
                this.btnBackColor.on('color:select', _.bind(this.onColorsBackSelect, this));
                this.btnBackColor.on('eyedropper:start', _.bind(this.onEyedropperStart, this));
                this.btnBackColor.on('eyedropper:end', _.bind(this.onEyedropperEnd, this));

                this.btnFGColor = new Common.UI.ColorButton({
                    parentEl: $('#textart-foreground-color-btn'),
                    color: '000000',
                    eyeDropper: true,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'big',
                    ariaLabel: this.strForeground
                });
                this.lockedControls.push(this.btnFGColor);
                this.colorsFG = this.btnFGColor.getPicker();
                this.btnFGColor.on('color:select', _.bind(this.onColorsFGSelect, this));
                this.btnFGColor.on('eyedropper:start', _.bind(this.onEyedropperStart, this));
                this.btnFGColor.on('eyedropper:end', _.bind(this.onEyedropperEnd, this));

                this.btnBGColor = new Common.UI.ColorButton({
                    parentEl: $('#textart-background-color-btn'),
                    color: 'ffffff',
                    eyeDropper: true,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'big',
                    ariaLabel: this.strBackground
                });
                this.lockedControls.push(this.btnBGColor);
                this.colorsBG = this.btnBGColor.getPicker();
                this.btnBGColor.on('color:select', _.bind(this.onColorsBGSelect, this));
                this.btnBGColor.on('eyedropper:start', _.bind(this.onEyedropperStart, this));
                this.btnBGColor.on('eyedropper:end', _.bind(this.onEyedropperEnd, this));

                this.btnGradColor = new Common.UI.ColorButton({
                    parentEl: $('#textart-gradient-color-btn'),
                    color: '000000',
                    eyeDropper: true,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'big',
                    ariaLabel: this.strColor
                });
                this.lockedControls.push(this.btnGradColor);
                this.colorsGrad = this.btnGradColor.getPicker();
                this.btnGradColor.on('color:select', _.bind(this.onColorsGradientSelect, this));
                this.btnGradColor.on('eyedropper:start', _.bind(this.onEyedropperStart, this));
                this.btnGradColor.on('eyedropper:end', _.bind(this.onEyedropperEnd, this));
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

        ShowHideElem: function(value) {
            this.FillColorContainer.toggleClass('settings-hidden', value !== Asc.c_oAscFill.FILL_TYPE_SOLID);
            this.FillImageContainer.toggleClass('settings-hidden', value !== Asc.c_oAscFill.FILL_TYPE_BLIP);
            this.FillPatternContainer.toggleClass('settings-hidden', value !== Asc.c_oAscFill.FILL_TYPE_PATT);
            this.FillGradientContainer.toggleClass('settings-hidden', value !== Asc.c_oAscFill.FILL_TYPE_GRAD);
            this.TransparencyContainer.toggleClass('settings-hidden', (value === Asc.c_oAscFill.FILL_TYPE_NOFILL || value === null));
            this.fireEvent('updatescroller', this);
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
                this.numGradientAngle.setDisabled(disable || this.GradFillType !== Asc.c_oAscFillGradType.GRAD_LINEAR);
                this.lblLineTransparencyStart.toggleClass('disabled', disable);
                this.lblLineTransparencyEnd.toggleClass('disabled', disable);
            }
        },

        onPositionChange: function(btn) {
            var pos = btn.getNumberValue();
            if (Common.UI.isRTL()) {
                pos = this.sldrGradient.maxValue - pos;
            }
            var minValue = (this.GradColor.currentIdx-1<0) ? 0 : this.GradColor.values[this.GradColor.currentIdx-1],
                maxValue = (this.GradColor.currentIdx+1<this.GradColor.values.length) ? this.GradColor.values[this.GradColor.currentIdx+1] : 100,
                needSort = pos < minValue || pos > maxValue;
            if (this.api) {
                this.GradColor.values[this.GradColor.currentIdx] = pos;
                var props = new Asc.asc_TextArtProperties();
                var fill = new Asc.asc_CShapeFill();
                fill.asc_putType(Asc.c_oAscFill.FILL_TYPE_GRAD);
                fill.asc_putFill( new Asc.asc_CFillGrad());
                fill.asc_getFill().asc_putGradType(this.GradFillType);
                var arr = [];
                this.GradColor.values.forEach(function(item){
                    arr.push(item*1000);
                });
                fill.asc_getFill().asc_putPositions(arr);
                props.asc_putFill(fill);
                this.shapeprops.put_TextArtProperties(props);
                this.api.asc_setGraphicObjectProps(this.imgprops);
                if (needSort) {
                    this.sldrGradient.sortThumbs();
                    this.sldrGradient.trigger('change', this.sldrGradient);
                    this.sldrGradient.trigger('changecomplete', this.sldrGradient);
                }
            }
        },

        onAddGradientStep: function() {
            if (this.GradColor.colors.length > 9) return;
            var curIndex = this.GradColor.currentIdx;
            var pos = (this.GradColor.values[curIndex] + this.GradColor.values[curIndex < this.GradColor.colors.length - 1 ? curIndex + 1 : curIndex - 1]) / 2;

            this.GradColor.colors[this.GradColor.colors.length] = this.GradColor.colors[curIndex];
            this.GradColor.currentIdx = this.GradColor.colors.length - 1;
            var color = this.sldrGradient.addNewThumb(undefined, pos, curIndex);
            this.GradColor.colors[this.GradColor.currentIdx] = color;

            this.sldrGradient.trigger('change', this.sldrGradient);
            this.sldrGradient.trigger('changecomplete', this.sldrGradient);
        },

        onRemoveGradientStep: function() {
            if (this.GradColor.values.length < 3) return;
            var index = this.GradColor.currentIdx;
            this.GradColor.values.splice(this.GradColor.currentIdx, 1);
            this.sldrGradient.removeThumb(this.GradColor.currentIdx);
            if (_.isUndefined(this.GradColor.currentIdx) || this.GradColor.currentIdx >= this.GradColor.colors.length) {
                var newIndex = index > 0 ? index - 1 : index;
                newIndex = (newIndex === 0 && this.GradColor.values.length > 2) ? this.GradColor.values.length - 2 : newIndex;
                this.GradColor.currentIdx = newIndex;
            }
            this.sldrGradient.setActiveThumb(this.GradColor.currentIdx);
            this.sldrGradient.trigger('change', this.sldrGradient);
            this.sldrGradient.trigger('changecomplete', this.sldrGradient);
        },

        onGradientAngleChange: function(field, newValue, oldValue, eOpts) {
            if (this.api && !this._noApply) {
                var props = new Asc.asc_TextArtProperties();
                var fill = new Asc.asc_CShapeFill();
                fill.asc_putType(Asc.c_oAscFill.FILL_TYPE_GRAD);
                fill.asc_putFill( new Asc.asc_CFillGrad());
                fill.asc_getFill().asc_putGradType(this.GradFillType);
                fill.asc_getFill().asc_putLinearAngle(field.getNumberValue() * 60000);
                fill.asc_getFill().asc_putLinearScale(true);
                props.asc_putFill(fill);
                this.shapeprops.put_TextArtProperties(props);
                this.api.asc_setGraphicObjectProps(this.imgprops);
            }
        },

        onWindowResize: function() {
            if (!this._initSettings && this._state.applicationPixelRatio !== Common.Utils.applicationPixelRatio())
                this.fillTransform(this.api.asc_getPropertyEditorTextArts());

            this._state.applicationPixelRatio = Common.Utils.applicationPixelRatio();
        },

        hideTransformSettings: function(value) {
            if (this._state.HideTransformSettings !== value) {
                this._state.HideTransformSettings = value;
                this.TransformSettings.toggleClass('hidden', value === true);
            }
        },

        onEyedropperStart: function (btn) {
            this.api.asc_startEyedropper(_.bind(btn.eyedropperEnd, btn));
            this.fireEvent('eyedropper', true);
        },

        onEyedropperEnd: function () {
            this.fireEvent('eyedropper', false);
        },

        txtNoBorders            : 'No Line',
        strStroke               : 'Stroke',
        strColor                : 'Color',
        strSize                 : 'Size',
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
        textGradient: 'Gradient Points',
        textBorderSizeErr: 'The entered value is incorrect.<br>Please enter a value between 0 pt and 1584 pt.',
        textTransform: 'Transform',
        textTemplate: 'Template',
        strType: 'Type',
        textPosition: 'Position',
        tipAddGradientPoint: 'Add gradient point',
        tipRemoveGradientPoint: 'Remove gradient point',
        textAngle: 'Angle'
    }, SSE.Views.TextArtSettings || {}));
});
