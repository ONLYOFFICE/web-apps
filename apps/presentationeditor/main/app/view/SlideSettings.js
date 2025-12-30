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
 *  SlideSettings.js
 *
 *  Created on 4/14/14
 *
 */

define([
    'text!presentationeditor/main/app/template/SlideSettings.template',
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/component/ComboBox',
    'common/main/lib/component/MetricSpinner',
    'common/main/lib/component/ThemeColorPalette',
    'common/main/lib/component/ColorButton',
    'common/main/lib/component/ComboDataView',
    'common/main/lib/component/MultiSliderGradient'
], function (menuTemplate, $, _, Backbone) {
    'use strict';

    PE.Views.SlideSettings = Backbone.View.extend(_.extend({
        el: '#id-slide-settings',

        // Compile our stats template
        template: _.template(menuTemplate),

        // Delegated events for creating new items, and clearing completed ones.
        events: {
        },

        options: {
            alias: 'SlideSettings'
        },

        initialize: function () {
            this._initSettings = true;
            this._originalProps = null;
            this._noApply = true;
            this._sendUndoPoint = true;
            this._sliderChanged = false;
            this._texturearray = null;

            this.FillItems = [];

            this._locked = {
                background: false,
                header: false
            };
            this._stateDisabled = {
                inMaster: false
            };
            this._slideMaster = {
                inMasterMode: false,
                inMaster: false // not layout
            };

            this._state = {
                Transparency: null,
                FillType:undefined,
                SlideColor: 'ffffff',
                BlipFillType: Asc.c_oAscFillBlipType.STRETCH,
                FGColor: '000000',
                BGColor: 'ffffff',
                GradColor: '000000',
                GradFillType: Asc.c_oAscFillGradType.GRAD_LINEAR
            };

            this.OriginalFillType = undefined;
            this.SlideColor = {Value: 1, Color: 'ffffff'};  // value=1 - цвет определен - прозрачный или другой, value=0 - цвет не определен, рисуем прозрачным
            this.BlipFillType = Asc.c_oAscFillBlipType.STRETCH;
            this.Effect = Asc.c_oAscSlideTransitionTypes.None;
            this.EffectType = undefined;
            this.GradFillType = Asc.c_oAscFillGradType.GRAD_LINEAR;
            this.GradColor = { values: [0, 100], colors: ['000000', 'ffffff'], currentIdx: 0};
            this.GradRadialDirectionIdx = 0;
            this.GradLinearDirectionType = 0;
            this.PatternFillType = 0;
            this.FGColor = {Value: 1, Color: '000000'};  // value=1 - цвет определен - прозрачный или другой, value=0 - цвет не определен, рисуем прозрачным
            this.BGColor = {Value: 1, Color: 'ffffff'};  // value=1 - цвет определен - прозрачный или другой, value=0 - цвет не определен, рисуем прозрачным

            this.textureNames = [this.txtCanvas, this.txtCarton, this.txtDarkFabric, this.txtGrain, this.txtGranite, this.txtGreyPaper,
                this.txtKnit, this.txtLeather, this.txtBrownPaper, this.txtPapyrus, this.txtWood];

            this.gradientColorsStr="#000, #fff";
            this.typeGradient = 90;

            this.render();

            var me = this;
            this._arrFillSrc = [
                {displayValue: this.textColor,          value: Asc.c_oAscFill.FILL_TYPE_SOLID},
                {displayValue: this.textGradientFill,   value: Asc.c_oAscFill.FILL_TYPE_GRAD},
                {displayValue: this.textImageTexture,   value: Asc.c_oAscFill.FILL_TYPE_BLIP},
                {displayValue: this.textPatternFill,    value: Asc.c_oAscFill.FILL_TYPE_PATT}
            ];

            this.cmbFillSrc = new Common.UI.ComboBox({
                el: $('#slide-combo-fill-src'),
                cls: 'input-group-nr',
                style: 'width: 100%;',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: this._arrFillSrc,
                disabled: true,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                ariaLabel: this.strFill
            });
            this.cmbFillSrc.setValue(Asc.c_oAscFill.FILL_TYPE_SOLID);
            this.cmbFillSrc.on('selected', _.bind(this.onFillSrcSelect, this));

            this.btnBackColor = new Common.UI.ColorButton({
                parentEl: $('#slide-back-color-btn'),
                disabled: true,
                transparent: false,
                menu: true,
                color: 'ffffff',
                eyeDropper: true,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                ariaLabel: this.strColor
            });
            this.FillItems.push(this.btnBackColor);

            this.numTransparency = new Common.UI.MetricSpinner({
                el: $('#slide-spin-transparency'),
                step: 1,
                width: 62,
                value: '100 %',
                defaultUnit : "%",
                maxValue: 100,
                minValue: 0,
                disabled: true,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                ariaLabel: this.strTransparency
            });
            this.numTransparency.on('change', _.bind(this.onNumTransparencyChange, this));
            this.numTransparency.on('inputleave', function(){ me.fireEvent('editcomplete', me);});
            this.FillItems.push(this.numTransparency);

            this.sldrTransparency = new Common.UI.SingleSlider({
                el: $('#slide-slider-transparency'),
                width: 75,
                minValue: 0,
                maxValue: 100,
                value: 100
            });
            this.sldrTransparency.setDisabled(true);
            this.sldrTransparency.on('change', _.bind(this.onTransparencyChange, this));
            this.sldrTransparency.on('changecomplete', _.bind(this.onTransparencyChangeComplete, this));
            this.FillItems.push(this.sldrTransparency);

            this.lblTransparencyStart = $(this.el).find('#slide-lbl-transparency-start');
            this.lblTransparencyEnd = $(this.el).find('#slide-lbl-transparency-end');

            this.FillColorContainer = $('#slide-panel-color-fill');
            this.FillImageContainer = $('#slide-panel-image-fill');
            this.FillPatternContainer = $('#slide-panel-pattern-fill');
            this.FillGradientContainer = $('#slide-panel-gradient-fill');
            this.TransparencyContainer = $('#slide-panel-transparent-fill');

            this.btnBackgroundReset = new Common.UI.Button({
                parentEl: $('#slide-btn-background-reset'),
                cls: 'btn-toolbar align-left',
                caption: this.strBackgroundReset,
                iconCls: 'toolbar__icon btn-reset',
                style: "width:100%;",
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.btnBackgroundReset.on('click', _.bind(this.onClickBackgroundReset, this));

            this.btnApplyAllSlides = new Common.UI.Button({
                parentEl: $('#slide-btn-apply-all-slides'),
                cls: 'btn-toolbar align-left',
                caption: this.strApplyAllSlides,
                iconCls: 'toolbar__icon btn-transition-apply-all',
                style: "width:100%;",
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.btnApplyAllSlides.on('click', _.bind(this.onClickApplyAllSlides, this));

            this.chBackgroundGraphics = new Common.UI.CheckBox({
                el: $('#slide-checkbox-background-graphics'),
                labelText: this.strBackgroundGraphics,
                disabled: true,
                dataHint: '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            this.chBackgroundGraphics.on('change', _.bind(this.onBackgroundGraphicsChange, this));
            
            this.chSlideNum = new Common.UI.CheckBox({
                el: $('#slide-checkbox-slidenum'),
                labelText: this.strSlideNum,
                disabled: true,
                dataHint: '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            this.chSlideNum.on('change', _.bind(this.onHeaderChange, this, 'slidenum'));

            this.chDateTime = new Common.UI.CheckBox({
                el: $('#slide-checkbox-datetime'),
                labelText: this.strDateTime,
                disabled: true,
                dataHint: '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            this.chDateTime.on('change', _.bind(this.onHeaderChange, this, 'datetime'));
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
                this.api.SetInterfaceDrawImagePlaceSlide('slide-texture-img');
                this.api.asc_registerCallback('asc_onInitStandartTextures', _.bind(this.onInitStandartTextures, this));
            }
            Common.NotificationCenter.on('storage:image-insert', _.bind(this.insertImageFromStorage, this));
            return this;
        },

        setMode: function(mode) {
            this.mode = mode;
        },

        onFillSrcSelect: function(combo, record) {
            this.ShowHideElem(record.value);
            switch (record.value){
                case Asc.c_oAscFill.FILL_TYPE_SOLID:
                    this._state.FillType = Asc.c_oAscFill.FILL_TYPE_SOLID;
                    if (!this._noApply) {
                        var props = new Asc.CAscSlideProps();
                        var fill = new Asc.asc_CShapeFill();
                        fill.put_type(Asc.c_oAscFill.FILL_TYPE_SOLID);
                        fill.put_fill( new Asc.asc_CFillSolid());
                        fill.get_fill().put_color(Common.Utils.ThemeColor.getRgbColor((this.SlideColor.Color=='transparent') ? {color: '4f81bd', effectId: 24} : this.SlideColor.Color));
                        props.put_background(fill);
                        this.api.SetSlideProps(props);
                    }
                    break;
                case Asc.c_oAscFill.FILL_TYPE_GRAD:
                    this._state.FillType = Asc.c_oAscFill.FILL_TYPE_GRAD;
                    if (!this._noApply) {
                        var props = new Asc.CAscSlideProps();
                        var fill = new Asc.asc_CShapeFill();
                        fill.put_type(Asc.c_oAscFill.FILL_TYPE_GRAD);
                        fill.put_fill( new Asc.asc_CFillGrad());
                        fill.get_fill().put_grad_type(this.GradFillType);
                        if (this.GradFillType == Asc.c_oAscFillGradType.GRAD_LINEAR) {
                            fill.get_fill().put_linear_angle(this.GradLinearDirectionType * 60000);
                            fill.get_fill().put_linear_scale(true);
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

                            fill.get_fill().put_positions([this.GradColor.values[0]*1000, this.GradColor.values[1]*1000]);
                            fill.get_fill().put_colors([Common.Utils.ThemeColor.getRgbColor(HexColor0), Common.Utils.ThemeColor.getRgbColor(this.GradColor.colors[1])]);
                        }
                        props.put_background(fill);
                        this.api.SetSlideProps(props);
                    }
                    break;
                case Asc.c_oAscFill.FILL_TYPE_BLIP:
                    if (this._state.FillType !== Asc.c_oAscFill.FILL_TYPE_BLIP && !this._noApply && this._texturearray && this._texturearray.length>0) {
                        this._state.FillType = Asc.c_oAscFill.FILL_TYPE_BLIP
                        var props = new Asc.CAscSlideProps();
                        var fill = new Asc.asc_CShapeFill();
                        fill.put_type(Asc.c_oAscFill.FILL_TYPE_BLIP);
                        fill.put_fill( new Asc.asc_CFillBlip());
                        fill.get_fill().put_type(Asc.c_oAscFillBlipType.TILE);
                        fill.get_fill().put_texture_id(this._texturearray[0].type);
                        props.put_background(fill);
                        this.api.SetSlideProps(props);
                    }
                    break;
                case Asc.c_oAscFill.FILL_TYPE_PATT:
                    this._state.FillType = Asc.c_oAscFill.FILL_TYPE_PATT;
                    if (!this._noApply) {
                        var props = new Asc.CAscSlideProps();
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
                        props.put_background(fill);
                        this.api.SetSlideProps(props);
                    }
                    break;
            }
            this.fireEvent('editcomplete', this);
        },

        onColorsBackSelect: function(btn, color) {
            this.SlideColor = {Value: 1, Color: color};

            if (this.api && !this._noApply) {
                var props = new Asc.CAscSlideProps();
                var fill = new Asc.asc_CShapeFill();
                fill.put_type(Asc.c_oAscFill.FILL_TYPE_SOLID);
                fill.put_fill( new Asc.asc_CFillSolid());
                fill.get_fill().put_color(Common.Utils.ThemeColor.getRgbColor(this.SlideColor.Color));
                props.put_background(fill);
                this.api.SetSlideProps(props);
            }
            this.fireEvent('editcomplete', this);
        },

        onPatternSelect: function(combo, record){
            if (this.api && !this._noApply) {
                this.PatternFillType = record.get('type');
                var props = new Asc.CAscSlideProps();
                var fill = new Asc.asc_CShapeFill();
                fill.put_type(Asc.c_oAscFill.FILL_TYPE_PATT);
                fill.put_fill( new Asc.asc_CFillHatch());
                fill.get_fill().put_pattern_type(this.PatternFillType);
                if (this.OriginalFillType !== Asc.c_oAscFill.FILL_TYPE_PATT) {
                    fill.get_fill().put_color_fg(Common.Utils.ThemeColor.getRgbColor(this.FGColor.Color));
                    fill.get_fill().put_color_bg(Common.Utils.ThemeColor.getRgbColor(this.BGColor.Color));
                }
                props.put_background(fill);
                this.api.SetSlideProps(props);
            }
            this.fireEvent('editcomplete', this);
        },

        onColorsFGSelect: function(btn, color) {
            this.FGColor = {Value: 1, Color: color};
            if (this.api && !this._noApply) {
                var props = new Asc.CAscSlideProps();
                var fill = new Asc.asc_CShapeFill();
                fill.put_type(Asc.c_oAscFill.FILL_TYPE_PATT);
                fill.put_fill( new Asc.asc_CFillHatch());
                fill.get_fill().put_color_fg(Common.Utils.ThemeColor.getRgbColor(this.FGColor.Color));
                if (this.OriginalFillType !== Asc.c_oAscFill.FILL_TYPE_PATT) {
                    fill.get_fill().put_pattern_type(this.PatternFillType);
                    fill.get_fill().put_color_bg(Common.Utils.ThemeColor.getRgbColor(this.BGColor.Color));
                }
                props.put_background(fill);
                this.api.SetSlideProps(props);
            }
            this.fireEvent('editcomplete', this);
        },

        onColorsBGSelect: function(btn, color) {
            this.BGColor = {Value: 1, Color: color};
            if (this.api && !this._noApply) {
                var props = new Asc.CAscSlideProps();
                var fill = new Asc.asc_CShapeFill();
                fill.put_type(Asc.c_oAscFill.FILL_TYPE_PATT);
                fill.put_fill( new Asc.asc_CFillHatch());
                if (this.OriginalFillType !== Asc.c_oAscFill.FILL_TYPE_PATT) {
                    fill.get_fill().put_pattern_type(this.PatternFillType);
                    fill.get_fill().put_color_fg(Common.Utils.ThemeColor.getRgbColor(this.FGColor.Color));
                }
                fill.get_fill().put_color_bg(Common.Utils.ThemeColor.getRgbColor(this.BGColor.Color));
                props.put_background(fill);
                this.api.SetSlideProps(props);
            }
            this.fireEvent('editcomplete', this);
        },

        onFillTypeSelect: function(combo, record) {
            this.BlipFillType = record.value;

            if (this.api && this._fromTextureCmb !== true && this.OriginalFillType == Asc.c_oAscFill.FILL_TYPE_BLIP) {
                var props = new Asc.CAscSlideProps();
                var fill = new Asc.asc_CShapeFill();
                fill.put_type(Asc.c_oAscFill.FILL_TYPE_BLIP);
                fill.put_fill( new Asc.asc_CFillBlip());

                fill.get_fill().put_type(this.BlipFillType);

                props.put_background(fill);
                this.api.SetSlideProps(props);
            }
            this.fireEvent('editcomplete', this);
        },

        onNumTransparencyChange: function(field, newValue, oldValue, eOpts){
            this.sldrTransparency.setValue(field.getNumberValue(), true);
            if (this.api)  {
                var num = field.getNumberValue();
                var props = new Asc.CAscSlideProps();
                var fill = new Asc.asc_CShapeFill();
                fill.put_transparent(num * 2.55);
                props.put_background(fill);
                this.api.SetSlideProps(props);
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
                var props = new Asc.CAscSlideProps();
                var fill = new Asc.asc_CShapeFill();
                fill.put_transparent(this._sliderChanged * 2.55);
                props.put_background(fill);
                this.api.SetSlideProps(props);
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
                if(record)
                    this.typeGradient = this.GradLinearDirectionType +90;
                else
                    this.typeGradient= -1;
                this.numGradientAngle.setValue(this.GradLinearDirectionType, true);
                this.numGradientAngle.setDisabled(this._locked.background);
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
                var props = new Asc.CAscSlideProps();
                var fill = new Asc.asc_CShapeFill();
                fill.put_type(Asc.c_oAscFill.FILL_TYPE_GRAD);
                fill.put_fill( new Asc.asc_CFillGrad());
                fill.get_fill().put_grad_type(this.GradFillType);
                if (this.GradFillType == Asc.c_oAscFillGradType.GRAD_LINEAR) {
                    fill.get_fill().put_linear_angle(this.GradLinearDirectionType * 60000);
                    fill.get_fill().put_linear_scale(true);
                }
                props.put_background(fill);
                this.api.SetSlideProps(props);
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

            if (this.GradFillType === Asc.c_oAscFillGradType.GRAD_LINEAR) {
                this.GradLinearDirectionType = rawData.type;
                this.typeGradient = rawData.type + 90;
            } else {
                this.GradRadialDirectionIdx = 0;
                this.typeGradient = rawData.type;
            }
            if (this.api) {
                if (this.GradFillType == Asc.c_oAscFillGradType.GRAD_LINEAR) {
                    this.numGradientAngle.setValue(rawData.type, true);

                    var props = new Asc.CAscSlideProps();
                    var fill = new Asc.asc_CShapeFill();
                    fill.put_type(Asc.c_oAscFill.FILL_TYPE_GRAD);
                    fill.put_fill( new Asc.asc_CFillGrad());
                    fill.get_fill().put_grad_type(this.GradFillType);
                    fill.get_fill().put_linear_angle(rawData.type * 60000);
                    fill.get_fill().put_linear_scale(true);

                    props.put_background(fill);
                    this.api.SetSlideProps(props);
                }
            }

            this.fireEvent('editcomplete', this);
        },

        onColorsGradientSelect: function(btn, color) {
            this.GradColor.colors[this.GradColor.currentIdx] = color;
            this.sldrGradient.setColorValue(Common.Utils.String.format('#{0}', (typeof(color) == 'object') ? color.color : color));

            if (this.api && !this._noApply) {
                var props = new Asc.CAscSlideProps();
                var fill = new Asc.asc_CShapeFill();
                fill.put_type(Asc.c_oAscFill.FILL_TYPE_GRAD);
                fill.put_fill( new Asc.asc_CFillGrad());
                fill.get_fill().put_grad_type(this.GradFillType);
                var arr = [];
                this.GradColor.colors.forEach(function(item){
                    arr.push(Common.Utils.ThemeColor.getRgbColor(item));
                });
                fill.get_fill().put_colors(arr);

                if (this.OriginalFillType !== Asc.c_oAscFill.FILL_TYPE_GRAD) {
                    if (this.GradFillType == Asc.c_oAscFillGradType.GRAD_LINEAR) {
                        fill.get_fill().put_linear_angle(this.GradLinearDirectionType * 60000);
                        fill.get_fill().put_linear_scale(true);
                    }
                    arr = [];
                    this.GradColor.values.forEach(function(item){
                        arr.push(item*1000);
                    });
                    fill.get_fill().put_positions(arr);
                }
                props.put_background(fill);
                this.api.SetSlideProps(props);
            }
            this.fireEvent('editcomplete', this);
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

            var arrGrCollors=[];
            var scale=(this.GradFillType == Asc.c_oAscFillGradType.GRAD_LINEAR)?1:0.7;
            for (var index=0; index < slider.thumbs.length; index++) {
                arrGrCollors.push(slider.getColorValue(index)+ ' '+ slider.getValue(index)*scale +'%');
            }
            this.btnDirectionRedraw(slider, arrGrCollors.join(', '));

            this._sendUndoPoint = true;
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

        _gradientApplyFunc: function() {
            if (this._sliderChanged) {
                var props = new Asc.CAscSlideProps();
                var fill = new Asc.asc_CShapeFill();
                fill.put_type(Asc.c_oAscFill.FILL_TYPE_GRAD);
                fill.put_fill( new Asc.asc_CFillGrad());
                fill.get_fill().put_grad_type(this.GradFillType);
                var arr = [];
                this.GradColor.values.forEach(function(item){
                    arr.push(item*1000);
                });
                fill.get_fill().put_positions(arr);

                if (this.OriginalFillType !== Asc.c_oAscFill.FILL_TYPE_GRAD) {
                    if (this.GradFillType == Asc.c_oAscFillGradType.GRAD_LINEAR) {
                        fill.get_fill().put_linear_angle(this.GradLinearDirectionType * 60000);
                        fill.get_fill().put_linear_scale(true);
                    }
                    arr = [];
                    this.GradColor.colors.forEach(function(item){
                        arr.push(Common.Utils.ThemeColor.getRgbColor(item));
                    });
                    fill.get_fill().put_colors(arr);
                }
                props.put_background(fill);
                this.api.SetSlideProps(props);
                this._sliderChanged = false;
            }
        },

        setImageUrl: function(url, token) {
            if (this.BlipFillType !== null) {
                var props = new Asc.CAscSlideProps();
                var fill = new Asc.asc_CShapeFill();
                fill.put_type(Asc.c_oAscFill.FILL_TYPE_BLIP);
                fill.put_fill( new Asc.asc_CFillBlip());
                fill.get_fill().put_type(this.BlipFillType);
                fill.get_fill().put_url(url, token);

                props.put_background(fill);
                this.api.SetSlideProps(props);
            }
        },

        insertImageFromStorage: function(data) {
            if (data && data._urls && data.c=='slide') {
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
                        me.fireEvent('editcomplete', me);
                    }
                })).show();
            } else if (item.value==2) {
                Common.NotificationCenter.trigger('storage:image-load', 'slide');
            } else {
                if (this.api) this.api.ChangeSlideImageFromFile(this.BlipFillType);
                this.fireEvent('editcomplete', this);
            }
        },

        createDelayedControls: function() {
            var me = this;

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
            this.cmbPattern.render($('#slide-combo-pattern'));
            this.cmbPattern.on('click', _.bind(this.onPatternSelect, this));
            this.FillItems.push(this.cmbPattern);

            this.btnSelectImage = new Common.UI.Button({
                parentEl: $('#slide-button-replace'),
                cls: 'btn-text-menu-default',
                caption: this.textSelectImage,
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
            this.FillItems.push(this.btnSelectImage);
            this.btnSelectImage.menu.on('item:click', _.bind(this.onImageSelect, this));
            this.btnSelectImage.menu.items[2].setVisible(this.mode.canRequestInsertImage || this.mode.fileChoiceUrl && this.mode.fileChoiceUrl.indexOf("{documentType}")>-1);

            this._arrFillType = [
                {displayValue: this.textStretch, value: Asc.c_oAscFillBlipType.STRETCH},
                {displayValue: this.textTile,    value: Asc.c_oAscFillBlipType.TILE}
            ];

            this.cmbFillType = new Common.UI.ComboBox({
                el: $('#slide-combo-fill-type'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 90px;',
                editable: false,
                data: this._arrFillType,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.cmbFillType.setValue(this._arrFillType[0].value);
            this.cmbFillType.on('selected', _.bind(this.onFillTypeSelect, this));
            this.FillItems.push(this.cmbFillType);

            this._arrGradType = [
                {displayValue: this.textLinear, value: Asc.c_oAscFillGradType.GRAD_LINEAR},
                {displayValue: this.textRadial, value: Asc.c_oAscFillGradType.GRAD_PATH}
            ];

            this.cmbGradType = new Common.UI.ComboBox({
                el: $('#slide-combo-grad-type'),
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
            this.FillItems.push(this.cmbGradType);

            this._viewDataLinear = [
                { type:45,  subtype:-1},
                { type:90,  subtype:4},
                { type:135, subtype:5},
                { type:0,   subtype:6,  cls: 'item-gradient-separator', selected: true},
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
                        { template: _.template('<div id="id-slide-menu-direction" style="width: 175px; margin: 0 5px;"></div>') }
                    ]
                }),
                dataHint    : '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                ariaLabel: this.textDirection
            });
            this.btnDirection.on('render:after', function(btn) {
                me.mnuDirectionPicker = new Common.UI.DataView({
                    el: $('#id-slide-menu-direction'),
                    parentMenu: btn.menu,
                    restoreHeight: 174,
                    store: new Common.UI.DataViewStore(me._viewDataLinear),
                    itemTemplate: _.template('<div id="<%= id %>" class="item-gradient" style="background: '
                        +'<% if(type!=2) {%>linear-gradient(<%= type + 90 %>deg,<%= gradientColorsStr %>)'
                        +' <%} else {%> radial-gradient(<%= gradientColorsStr %>) <%}%>;"></div>')
                });
            });
            this.btnDirection.render($('#slide-button-direction'));
            this.mnuDirectionPicker.on('item:click', _.bind(this.onSelectGradient, this, this.btnDirection));
            this.FillItems.push(this.btnDirection);

            this.sldrGradient = new Common.UI.MultiSliderGradient({
                el: $('#slide-slider-gradient'),
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
            this.FillItems.push(this.sldrGradient);

            this.spnGradPosition = new Common.UI.MetricSpinner({
                el: $('#slide-gradient-position'),
                step: 1,
                width: 60,
                defaultUnit : "%",
                value: '50 %',
                allowDecimal: false,
                maxValue: 100,
                minValue: 0,
                disabled: this._locked.background,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                ariaLabel: this.textPosition
            });
            this.FillItems.push(this.spnGradPosition);
            this.spnGradPosition.on('change', _.bind(this.onPositionChange, this));
            this.spnGradPosition.on('inputleave', function(){ me.fireEvent('editcomplete', me);});

            this.btnAddGradientStep = new Common.UI.Button({
                parentEl: $('#slide-gradient-add-step'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-add-breakpoint',
                disabled: this._locked.background,
                hint: this.tipAddGradientPoint,
                dataHint: '1',
                dataHintDirection: 'bottom',
            });
            this.btnAddGradientStep.on('click', _.bind(this.onAddGradientStep, this));
            this.FillItems.push(this.btnAddGradientStep);

            this.btnRemoveGradientStep = new Common.UI.Button({
                parentEl: $('#slide-gradient-remove-step'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-remove-breakpoint',
                disabled: this._locked.background,
                hint: this.tipRemoveGradientPoint,
                dataHint: '1',
                dataHintDirection: 'bottom',
            });
            this.btnRemoveGradientStep.on('click', _.bind(this.onRemoveGradientStep, this));
            this.FillItems.push(this.btnRemoveGradientStep);

            this.numGradientAngle = new Common.UI.MetricSpinner({
                el: $('#slide-spin-gradient-angle'),
                step: 10,
                width: 60,
                defaultUnit : "°",
                value: '0 °',
                allowDecimal: true,
                maxValue: 359.9,
                minValue: 0,
                disabled: this._locked.background,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                ariaLabel: this.textAngle
            });
            this.FillItems.push(this.numGradientAngle);
            this.numGradientAngle.on('change', _.bind(this.onGradientAngleChange, this));
            this.numGradientAngle.on('inputleave', function(){ me.fireEvent('editcomplete', me);});
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

            this.onInitStandartTextures();
            this.UpdateThemeColors();
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
                    el: $('#slide-combo-fill-texture'),
                    template: _.template([
                        '<div class="input-group combobox combo-dataview-menu input-group-nr dropdown-toggle" tabindex="0" data-toggle="dropdown">',
                        '<div class="form-control text" style="width: 90px;" data-hint="1" data-hint-direction="bottom" data-hint-offset="big">' + this.textSelectTexture + '</div>',
                        '<div style="display: table-cell;"></div>',
                        '<button type="button" class="btn btn-default">',
                            '<span class="caret"></span>',
                        '</button>',
                        '</div>'
                    ].join('')),
                    ariaLabel: this.textTexture
                });
                this.textureMenu = new Common.UI.Menu({
                    items: [
                        { template: _.template('<div id="id-slide-menu-texture" style="width: 233px; margin: 0 5px;"></div>') }
                    ]
                });
                this.textureMenu.render($('#slide-combo-fill-texture'));
                this.FillItems.push(this.btnTexture);

                var onShowBefore = function(menu) {
                    var mnuTexturePicker = new Common.UI.DataView({
                        el: $('#id-slide-menu-texture'),
                        restoreHeight: 174,
                        parentMenu: menu,
                        showLast: false,
                        delayRenderTips: true,
                        store: new Common.UI.DataViewStore(me._texturearray || []),
                        itemTemplate: _.template('<div class="item-texture"><img src="<%= imageUrl %>" id="<%= id %>"></div>')
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
                var props = new Asc.CAscSlideProps();
                var fill = new Asc.asc_CShapeFill();
                fill.put_type(Asc.c_oAscFill.FILL_TYPE_BLIP);
                fill.put_fill( new Asc.asc_CFillBlip());
                fill.get_fill().put_type(Asc.c_oAscFillBlipType.TILE);
                fill.get_fill().put_texture_id(record.get('type'));
                props.put_background(fill);
                this.api.SetSlideProps(props);
            }
            // $(this.btnTexture.el).find('.form-control').prop('innerHTML', record.get('name'));
            this.fireEvent('editcomplete', this);
        },

        onClickBackgroundReset: function() {
            if (this.api) {
                var props = new Asc.CAscSlideProps();
                props.put_ResetBackground(true);
                this.api.SetSlideProps(props);
            }
        },

        onClickApplyAllSlides: function() {
            if (this.api) {
                var props = new Asc.CAscSlideProps();
                props.put_ApplyBackgroundToAll(true);
                this.api.SetSlideProps(props);
            }
        },

        onBackgroundGraphicsChange: function(field) {
            if (this.api) {
                var props = new Asc.CAscSlideProps();
                props.put_ShowMasterSp(field.getValue() == 'checked');
                this.api.SetSlideProps(props);
            }
        },

        onHeaderChange: function(type, field, newValue, oldValue, eOpts){
            if (this.api && !this._noApply)   {
                var props = this.api.asc_getHeaderFooterProperties();
                props.get_Slide()[(type=='slidenum') ? 'put_ShowSlideNum' : 'put_ShowDateTime'](field.getValue()=='checked');
                this.api.asc_setHeaderFooterProperties(props);
            }
            this.fireEvent('editcomplete', this);
        },

        UpdateThemeColors: function() {
            if (this._initSettings) return;
            if (!this.colorsBack) {
                this.btnBackColor.setMenu();
                this.btnBackColor.on('color:select', _.bind(this.onColorsBackSelect, this));
                this.btnBackColor.on('eyedropper:start', _.bind(this.onEyedropperStart, this));
                this.btnBackColor.on('eyedropper:end', _.bind(this.onEyedropperEnd, this));
                this.colorsBack = this.btnBackColor.getPicker();

                this.btnFGColor = new Common.UI.ColorButton({
                    parentEl: $('#slide-foreground-color-btn'),
                    color: '000000',
                    eyeDropper: true,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'big',
                    ariaLabel: this.strForeground
                });
                this.FillItems.push(this.btnFGColor);
                this.colorsFG = this.btnFGColor.getPicker();
                this.btnFGColor.on('color:select', _.bind(this.onColorsFGSelect, this));
                this.btnFGColor.on('eyedropper:start', _.bind(this.onEyedropperStart, this));
                this.btnFGColor.on('eyedropper:end', _.bind(this.onEyedropperEnd, this));

                this.btnBGColor = new Common.UI.ColorButton({
                    parentEl: $('#slide-background-color-btn'),
                    color: 'ffffff',
                    eyeDropper: true,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'big',
                    ariaLabel: this.strBackground
                });
                this.FillItems.push(this.btnBGColor);
                this.colorsBG = this.btnBGColor.getPicker();
                this.btnBGColor.on('color:select', _.bind(this.onColorsBGSelect, this));
                this.btnBGColor.on('eyedropper:start', _.bind(this.onEyedropperStart, this));
                this.btnBGColor.on('eyedropper:end', _.bind(this.onEyedropperEnd, this));

                this.btnGradColor = new Common.UI.ColorButton({
                    parentEl: $('#slide-gradient-color-btn'),
                    color: '000000',
                    eyeDropper: true,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'big',
                    ariaLabel: this.strColor
                });
                this.FillItems.push(this.btnGradColor);
                this.colorsGrad = this.btnGradColor.getPicker();
                this.btnGradColor.on('color:select', _.bind(this.onColorsGradientSelect, this));
                this.btnGradColor.on('eyedropper:start', _.bind(this.onEyedropperStart, this));
                this.btnGradColor.on('eyedropper:end', _.bind(this.onEyedropperEnd, this));
            }
            
            this.colorsBack.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
            this.colorsFG.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
            this.colorsBG.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
            this.colorsGrad.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
        },

        ShowHideElem: function(value) {
            this.FillColorContainer.toggleClass('settings-hidden', value !== Asc.c_oAscFill.FILL_TYPE_SOLID);
            this.FillImageContainer.toggleClass('settings-hidden', value !== Asc.c_oAscFill.FILL_TYPE_BLIP);
            this.FillPatternContainer.toggleClass('settings-hidden', value !== Asc.c_oAscFill.FILL_TYPE_PATT);
            this.FillGradientContainer.toggleClass('settings-hidden', value !== Asc.c_oAscFill.FILL_TYPE_GRAD);
            this.TransparencyContainer.toggleClass('settings-hidden', (value === Asc.c_oAscFill.FILL_TYPE_NOFILL || value === null));
        },

        ChangeSettings: function(props) {
            if (this._initSettings)
                this.createDelayedElements();
            this.SetSlideDisabled(this._locked.background, this._locked.header, props);

            if (props)
            {
                this._originalProps = props;
                this._noApply = true;

                // background colors
                var rec = null;
                var fill = props.get_background();
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

                if (fill===null || fill_type===null || fill_type==Asc.c_oAscFill.FILL_TYPE_NOFILL) { // заливки нет или не совпадает у неск. фигур
                    this.OriginalFillType = null;
                } else if (fill_type==Asc.c_oAscFill.FILL_TYPE_SOLID) {
                    fill = fill.get_fill();
                    color = fill.get_color();
                    if (color) {
                        if (color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                            this.SlideColor = {Value: 1, Color: {color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()), effectValue: color.get_value() }};
                        } else {
                            this.SlideColor = {Value: 1, Color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b())};
                        }

                    } else
                        this.SlideColor = {Value: 0, Color: 'transparent'};
                    this.OriginalFillType = Asc.c_oAscFill.FILL_TYPE_SOLID;
                    this.FGColor = (this.SlideColor.Color!=='transparent') ? {Value: 1, Color: Common.Utils.ThemeColor.colorValue2EffectId(this.SlideColor.Color)} : {Value: 1, Color: '000000'};
                    this.BGColor = {Value: 1, Color: 'ffffff'};
                    this.GradColor.colors[0] = (this.SlideColor.Color!=='transparent') ? Common.Utils.ThemeColor.colorValue2EffectId(this.SlideColor.Color) : '000000';
                    this.GradColor.colors[this.GradColor.colors.length-1] = 'ffffff';
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
                    this.SlideColor = {Value: 1, Color: Common.Utils.ThemeColor.colorValue2EffectId(this.FGColor.Color)};
                    this.GradColor.colors[0] = Common.Utils.ThemeColor.colorValue2EffectId(this.FGColor.Color);
                    this.GradColor.colors[this.GradColor.colors.length-1] = 'ffffff';
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
                            this.typeGradient = -1;
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
                                this.typeGradient = value + 90;
                            else
                                this.typeGradient= -1;
                            this.numGradientAngle.setValue(value, true);
                        }
                    } else
                        this.numGradientAngle.setValue(0, true);

                    var me = this;
                    var colors = fill.get_colors(),
                        positions = fill.get_positions(),
                        length = colors ? colors.length : this.GradColor.colors.length;
                    this.sldrGradient.setThumbs(length);
                    if (this.GradColor.colors.length>length) {
                        this.GradColor.colors.splice(length, this.GradColor.colors.length - length);
                        this.GradColor.values.splice(length, this.GradColor.colors.length - length);
                        this.GradColor.currentIdx = 0;
                    }
                    colors && colors.forEach(function(color, index) {
                        if (color) {
                            if (color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                                me.GradColor.colors[index] = {color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()), effectValue: color.get_value()};
                                Common.Utils.ThemeColor.colorValue2EffectId(me.GradColor.colors[index]);
                            } else {
                                me.GradColor.colors[index] = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
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
                    var curValue = this.GradColor.values[this.GradColor.currentIdx];
                    this.spnGradPosition.setValue(Common.UI.isRTL() ? this.sldrGradient.maxValue - curValue : curValue);
                    this.OriginalFillType = Asc.c_oAscFill.FILL_TYPE_GRAD;
                    this.FGColor = {Value: 1, Color: this.GradColor.colors[0]};
                    this.BGColor = {Value: 1, Color: 'ffffff'};
                    this.SlideColor = {Value: 1, Color: this.GradColor.colors[0]};
                }

                if ( this._state.FillType!==this.OriginalFillType ) {
                    this.cmbFillSrc.setValue(this.OriginalFillType);
                    this._state.FillType=this.OriginalFillType;
                    this.ShowHideElem(this.OriginalFillType);
                }

                $(this.btnTexture.el).find('.form-control').prop('innerHTML', this.textSelectTexture);

                var type1 = typeof(this.SlideColor.Color),
                    type2 = typeof(this._state.SlideColor);

                if ( (type1 !== type2) || (type1=='object' &&
                    (this.SlideColor.Color.effectValue!==this._state.SlideColor.effectValue || this._state.SlideColor.color.indexOf(this.SlideColor.Color.color)<0)) ||
                    (type1!='object' && this._state.SlideColor.indexOf(this.SlideColor.Color)<0 )) {

                    this.btnBackColor.setColor(this.SlideColor.Color);
                    Common.Utils.ThemeColor.selectPickerColorByEffect(this.SlideColor.Color, this.colorsBack);
                    this._state.SlideColor = this.SlideColor.Color;
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

                this.chBackgroundGraphics.setValue(!!props.get_ShowMasterSp(), true);

                value = this.api.asc_getHeaderFooterProperties();
                if (value) {
                    var slideprops = value.get_Slide() || new AscCommonSlide.CAscHFProps();
                    this.chSlideNum.setValue(!!slideprops.get_ShowSlideNum(), true);
                    this.chDateTime.setValue(!!slideprops.get_ShowDateTime(), true);
                }

                this._noApply = false;
            }
        },

        setSlideMasterMode: function (isMaster) {
            this._slideMaster.inMasterMode = isMaster;
        },

        setLocked: function (background, header, inMaster) {
            this._locked = {
                background: background, header: header
            };
            this._slideMaster.inMaster = inMaster;
        },

        SetSlideDisabled: function(background, header, props) {
            this._locked = {
                background: background, header: header
            };
            if (this._initSettings) return;

            if(props) {
                this.btnBackgroundReset.setDisabled(!!props.get_LockResetBackground() || background || this._slideMaster.inMaster);
                this.btnApplyAllSlides.setDisabled(!!props.get_LockApplyBackgroundToAll() || this._slideMaster.inMasterMode);
            }

            if (background !== this._stateDisabled.background) {
                this.cmbFillSrc.setDisabled(background);
                for (var i=0; i<this.FillItems.length; i++) {
                    this.FillItems[i].setDisabled(background);
                }
                this.lblTransparencyStart.toggleClass('disabled', background);
                this.lblTransparencyEnd.toggleClass('disabled', background);
                this.numGradientAngle.setDisabled(background || this.GradFillType !== Asc.c_oAscFillGradType.GRAD_LINEAR);
                this.chBackgroundGraphics.setDisabled(!!background);
                this._stateDisabled.background = background;
            }
            if (header !== this._stateDisabled.header) {
                this.chSlideNum.setDisabled(header);
                this.chDateTime.setDisabled(header);
                this._stateDisabled.header = header;
            }

            if (this._slideMaster.inMaster !== this._stateDisabled.inMaster) {
                this.chBackgroundGraphics.setDisabled(!!this._stateDisabled.background || this._slideMaster.inMaster);
                this._stateDisabled.inMaster = this._slideMaster.inMaster;
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
                var props = new Asc.CAscSlideProps();
                var fill = new Asc.asc_CShapeFill();
                fill.put_type(Asc.c_oAscFill.FILL_TYPE_GRAD);
                fill.put_fill( new Asc.asc_CFillGrad());
                fill.get_fill().put_grad_type(this.GradFillType);
                var arr = [];
                this.GradColor.values.forEach(function(item){
                    arr.push(item*1000);
                });
                fill.get_fill().put_positions(arr);
                props.put_background(fill);
                this.api.SetSlideProps(props);

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
                var props = new Asc.CAscSlideProps();
                var fill = new Asc.asc_CShapeFill();
                fill.put_type(Asc.c_oAscFill.FILL_TYPE_GRAD);
                fill.put_fill( new Asc.asc_CFillGrad());
                fill.get_fill().put_grad_type(this.GradFillType);
                fill.get_fill().put_linear_angle(field.getNumberValue() * 60000);
                fill.get_fill().put_linear_scale(true);
                props.put_background(fill);
                this.api.SetSlideProps(props);
            }
        },

        onEyedropperStart: function (btn) {
            this.api.asc_startEyedropper(_.bind(btn.eyedropperEnd, btn));
            this.fireEvent('eyedropper', true);
        },

        onEyedropperEnd: function () {
            this.fireEvent('eyedropper', false);
        }

    }, PE.Views.SlideSettings || {}));
});
