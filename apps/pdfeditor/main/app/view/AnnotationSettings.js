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
 *  AnnotationSettings.js
 *
 *  Created on 26.01.2026
 *
 */

define([
    'text!pdfeditor/main/app/template/AnnotationSettings.template',
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/component/Button'
], function (menuTemplate, $, _, Backbone) {
    'use strict';

    PDFE.Views.AnnotationSettings = Backbone.View.extend(_.extend({
        el: '#id-annotation-settings',

        // Compile our stats template
        template: _.template(menuTemplate),

        // Delegated events for creating new items, and clearing completed ones.
        events: {
        },

        options: {
            alias: 'AnnotationSettings'
        },

        initialize: function () {
            this._initSettings = true;
            this._state = {
                DisabledControls: false
            };
            this._originalProps = null;
            this._locked = false;
            this.lockedControls = [];
            this.spinners = [];
            
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
                
            }
            return this;
        },

        setMode: function(mode) {
            this.mode = mode;
        },

        createDelayedControls: function() {
            const $markup = this.$el || $(this.el);
            const colorConfig = Common.UI.simpleColorsConfig;

            this.btnBorderColor = new Common.UI.ColorButton({
                parentEl: $markup.findById('#annotation-color-btn'),
                colors: colorConfig.colors,
                dynamiccolors: colorConfig.dynamiccolors,
                themecolors: colorConfig.themecolors,
                effects: colorConfig.effects,
                columns: colorConfig.columns,
                paletteCls: colorConfig.cls,
                paletteWidth: colorConfig.paletteWidth,
                dataHint: '1',
                colorHints: false,
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.mnuBorderColorPicker = this.btnBorderColor.getPicker();
            this.btnBorderColor.on('color:select', this.onBorderColorSelect.bind(this));
            this.lockedControls.push(this.btnBorderColor);

            this.cmbBorderStyle = new Common.UI.ComboBorderType({
                el: $markup.findById('#annotation-combo-line-style'),
                menuStyle: 'min-width: 100%;',
                data: [
                    { value: AscPDF.ANNOT_COMPLEX_BORDER_TYPES.solid, imgId: 'annotation-solid' },
                    { value: AscPDF.ANNOT_COMPLEX_BORDER_TYPES.dash1, imgId: 'annotation-dots' },
                    { value: AscPDF.ANNOT_COMPLEX_BORDER_TYPES.dash2, imgId: 'annotation-dots-dense' },
                    { value: AscPDF.ANNOT_COMPLEX_BORDER_TYPES.dash3, imgId: 'annotation-dashes' },
                    { value: AscPDF.ANNOT_COMPLEX_BORDER_TYPES.dash4, imgId: 'annotation-dashes-dense' },
                    { value: AscPDF.ANNOT_COMPLEX_BORDER_TYPES.dash5, imgId: 'annotation-dash-dot' },
                    { value: AscPDF.ANNOT_COMPLEX_BORDER_TYPES.dash6, imgId: 'annotation-dash-dot-wide' },
                    { value: AscPDF.ANNOT_COMPLEX_BORDER_TYPES.cloud1, imgId: 'annotation-wave' },
                    { value: AscPDF.ANNOT_COMPLEX_BORDER_TYPES.cloud2, imgId: 'annotation-wave' }
                ],
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.cmbBorderStyle.on('selected', this.onCmbBorderStyleChange.bind(this));
            this.lockedControls.push(this.cmbBorderStyle);

            this.numBorderWidth = new Common.UI.MetricSpinner({
                el: $('#annotation-spin-border-width'),
                step: 1,
                width: '100%',
                value: '1 pt',
                defaultUnit : "pt",
                maxValue: 12,
                minValue: 1,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.spinners.push(this.numBorderWidth);
            this.numBorderWidth.on('change', _.bind(this.onNumBorderWidthChange, this));
            this.numBorderWidth.on('inputleave', function(){ this.fireEvent('editcomplete', this);});
            this.lockedControls.push(this.numBorderWidth);

            this.btnBackgroundColor = new Common.UI.ColorButton({
                parentEl: $markup.findById('#annotation-background-color-btn'),
                additionalItemsBefore: [
                    this.mnuBackgroundColorTransparent = new Common.UI.MenuItem({
                        style: Common.UI.isRTL() ? 'padding-right:20px;' : 'padding-left:20px;',
                        caption: this.txtTransparent,
                        toggleGroup: 'form-settings-no-border',
                        checkable: true
                    }), 
                    {caption: '--'}
                ],
                colors: colorConfig.colors,
                dynamiccolors: colorConfig.dynamiccolors,
                themecolors: colorConfig.themecolors,
                effects: colorConfig.effects,
                columns: colorConfig.columns,
                paletteCls: colorConfig.cls,
                paletteWidth: colorConfig.paletteWidth,
                dataHint: '1',
                colorHints: false,
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.mnuBackgroundColorTransparent.on('click', _.bind(this.onBackgroundColorTransparentClick, this));
            this.mnuBackgroundColorPicker = this.btnBackgroundColor.getPicker();
            this.btnBackgroundColor.on('color:select', this.onBackgroundColorSelect.bind(this));
            this.lockedControls.push(this.btnBackgroundColor);


            this.sldrOpacity = new Common.UI.SingleSlider({
                el: $('#annotation-slider-opacity'),
                width: 75,
                minValue: 0,
                maxValue: 100,
                value: 100
            });
            this.sldrOpacity.on('change', _.bind(this.onOpacityChange, this));
            this.sldrOpacity.on('changecomplete', _.bind(this.onOpacityChangeComplete, this));
            this.lockedControls.push(this.sldrOpacity);

            this.lblOpacityStart = $(this.el).find('#annotation-lbl-opacity-start');
            this.lblOpacityEnd = $(this.el).find('#annotation-lbl-opacity-end');

            this.numOpacity = new Common.UI.MetricSpinner({
                el: $('#annotation-spin-opacity'),
                step: 1,
                width: 62,
                value: '100 %',
                defaultUnit : "%",
                maxValue: 100,
                minValue: 0,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.numOpacity.on('change', _.bind(this.onNumOpacityChange, this));
            this.numOpacity.on('inputleave', function(){ this.fireEvent('editcomplete', this);});
            this.lockedControls.push(this.numOpacity);


            const lineStyleOptions = [
                { displayValue: this.txtNone,   value: AscPDF.LINE_END_TYPE.none },
                { displayValue: this.txtOpen,   value: AscPDF.LINE_END_TYPE.openArrow },
                { displayValue: this.txtClosed,   value: AscPDF.LINE_END_TYPE.closedArrow },
                { displayValue: this.txtOpenReverse,   value: AscPDF.LINE_END_TYPE.rOpenArrow },
                { displayValue: this.txtClosedReverse,   value: AscPDF.LINE_END_TYPE.rClosedArrow },
                { displayValue: this.txtButt,   value: AscPDF.LINE_END_TYPE.butt },
                { displayValue: this.txtDiamond,   value: AscPDF.LINE_END_TYPE.diamond },
                { displayValue: this.txtCircle,   value: AscPDF.LINE_END_TYPE.circle },
                { displayValue: this.txtSquare,   value: AscPDF.LINE_END_TYPE.square },
                { displayValue: this.txtSlash,   value: AscPDF.LINE_END_TYPE.slash }
            ];         
            this.cmbLineStart = new Common.UI.ComboBox({
                el: $markup.findById('#annotation-combo-line-start'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: lineStyleOptions,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.cmbLineStart.on('selected', this.onLineStartChanged.bind(this));
            this.lockedControls.push(this.cmbLineStart);

            this.cmbLineEnd = new Common.UI.ComboBox({
                el: $markup.findById('#annotation-combo-line-end'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: lineStyleOptions,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.cmbLineEnd.on('selected', this.onLineEndChanged.bind(this));
            this.lockedControls.push(this.cmbLineEnd);
        },

        updateMetricUnit: function() {
            if (this.spinners) {
                for (var i=0; i<this.spinners.length; i++) {
                    const spinner = this.spinners[i];
                    spinner.setDefaultUnit(Common.Utils.Metric.getCurrentMetricName());
                    spinner.setStep(Common.Utils.Metric.getCurrentMetric()==Common.Utils.Metric.c_MetricUnits.pt ? 1 : 0.01);
                }
            }
        },
        
        createDelayedElements: function() {
            this.createDelayedControls();
            this.updateMetricUnit();
            this._initSettings = false;
        },

        ChangeSettings: function(props) {
            if (this._initSettings) {
                this.createDelayedElements();
            }

            this.disableControls(this._locked);

            if (props) {
                const getFormField = function(inputCmp) {
                    return inputCmp.$el.closest('.form-field');
                };
                let $formValue;
                let value;

                // If a property is not supported by this annotation type, 
                // then this property will not be present in asc_getAnnotProps.
                const annotProps = props.asc_getAnnotProps(); 
                this._originalProps = props;
                
                // Border color
                value = props.asc_getStroke ? props.asc_getStroke() : null; // null - property is not supported 
                $formValue = getFormField(this.btnBorderColor);
                if(value !== null) {
                    if (value) {
                        this._state.BorderColor = Common.Utils.ThemeColor.getHexColor(value.r, value.g, value.b);
                    } else {
                        this._state.BorderColor = 'transparent';
                    }
                    this.btnBorderColor.setColor(this._state.BorderColor);
                    this.mnuBorderColorPicker.clearSelection();
                    if(this._state.BorderColor != 'transparent') {
                        this.mnuBorderColorPicker.selectByRGB(this._state.BorderColor, true);
                    }
                    $formValue.show();
                } else {
                    $formValue.hide();
                }

                // Background color
                value = props.asc_getStroke ? props.asc_getFill() : null;   // null - property is not supported 
                $formValue = getFormField(this.btnBackgroundColor);
                if(value !== null) {
                    if (value) {
                        this._state.BackgroundColor = Common.Utils.ThemeColor.getHexColor(value.r, value.g, value.b);
                    } else {
                        this._state.BackgroundColor = 'transparent';
                    }
                    this.btnBackgroundColor.setColor(this._state.BackgroundColor);
                    this.mnuBackgroundColorTransparent.setChecked(this._state.BackgroundColor == 'transparent', true);
                    this.mnuBackgroundColorPicker.clearSelection();
                    if(this._state.BackgroundColor != 'transparent') {
                        this.mnuBackgroundColorPicker.selectByRGB(this._state.BackgroundColor, true);
                    }
                    $formValue.show();
                } else {
                    $formValue.hide();
                }
                

                //Border width
                $formValue = getFormField(this.numBorderWidth);
                if(annotProps?.asc_getBorderWidth) {
                    value = annotProps.asc_getBorderWidth();
                    if (
                        Math.abs(this._state.BorderWidth - value) > 0.001 || 
                        Math.abs(this.numBorderWidth.getNumberValue() - value) > 0.001 || 
                        (this._state.BorderWidth === null || value === null) && 
                        (this._state.BorderWidth !== value || this.numBorderWidth.getNumberValue() !== value)
                    ) {
                        if (value !== undefined) {
                            this.numBorderWidth.setValue(
                                (value !== null) ? Common.Utils.Metric.fnRecalcFromPt(value) : '', true
                            );
                        }
                        this._state.BorderWidth = value;
                    }
                    $formValue.show();
                } else {
                    $formValue.hide();
                }

                //Border style
                $formValue = getFormField(this.cmbBorderStyle);
                if(annotProps?.asc_getBorderStyle) {
                    value = annotProps.asc_getBorderStyle();
                    if (this._state.BorderStyle !== value) {
                        this.cmbBorderStyle.setValue(value, '');
                        this._state.BorderStyle = value;
                    }
                    $formValue.show();
                } else {
                    $formValue.hide();
                }

                //Line start
                $formValue = getFormField(this.cmbLineStart);
                if(annotProps?.asc_getLineStart) {
                    value = annotProps.asc_getLineStart();
                    if (this._state.LineStart !== value) {
                        this.cmbLineStart.setValue(value);
                        this._state.LineStart = value;
                    }
                    $formValue.show();
                } else {
                    $formValue.hide();
                }

                //Line end
                $formValue = getFormField(this.cmbLineEnd);
                if(annotProps?.asc_getLineEnd) {
                    value = annotProps.asc_getLineEnd();
                    if (this._state.LineEnd !== value) {
                        this.cmbLineEnd.setValue(value);
                        this._state.LineEnd = value;
                    }
                    $formValue.show();
                } else {
                    $formValue.hide();
                }

                // Opacity
                value = props.asc_getOpacity();
                if (
                    Math.abs(this._state.Opacity - value) > 0.001 || 
                    Math.abs(this.numOpacity.getNumberValue() - value) > 0.001 || 
                    (this._state.Opacity === null || value === null) && 
                    (this._state.Opacity !== value || this.numOpacity.getNumberValue() !== value)
                ) {
                    if (value !== undefined) {
                        this.sldrOpacity.setValue((value === null) ? 100 : value * 100, true);
                        this.numOpacity.setValue(this.sldrOpacity.getValue(), true);
                    }
                    this._state.Opacity = value;
                }

                this.showHideFormGroups();
            }
        },

        setLocked: function (locked) {
            this._locked = locked;
        },

        showHideFormGroups: function() {
            (this.$el || $(this.el)).find('.form-group').each(function (index, group) {
                $(group).show();
                const hasVisibleFields = $(group).find('.form-field:visible').length > 0;
                if(!hasVisibleFields) {
                    $(group).hide();
                }
            });
        },
        
        //Event handlers
        onBorderColorSelect: function(btn, color) {
            if (this.api) {
                this._state.BorderColor = undefined;
                if (color == 'transparent') {
                    this.api.SetAnnotStrokeColor();
                } else {
                    const clr = Common.Utils.ThemeColor.getRgbColor(color);
                    this.api.SetAnnotStrokeColor(clr.get_r(), clr.get_g(), clr.get_b());
                }
                this.fireEvent('editcomplete', this);
            }
        },
        
        onNumBorderWidthChange: function(field) {
            if (this.api)  {
                this._state.BorderWidth = undefined;
                const value = field.getNumberValue();
                this.api.SetAnnotStrokeWidth(Common.Utils.Metric.fnRecalcToPt(value));
                this.fireEvent('editcomplete', this);
            }
        },

        onCmbBorderStyleChange: function(cmb, record) {
            if (this.api)  {
                this._state.BorderStyle = undefined;
                this.api.SetAnnotStrokeStyle(record.value);
                this.fireEvent('editcomplete', this);
            }
        },

        onBackgroundColorSelect: function(btn, color) {
            if (this.api) {
                this._state.BackgroundColor = undefined;
                if (color == 'transparent') {
                    this.api.SetAnnotFillColor(undefined);
                } else {
                    const clr = Common.Utils.ThemeColor.getRgbColor(color);
                    this.api.SetAnnotFillColor(clr.get_r(), clr.get_g(), clr.get_b());
                }
                this.fireEvent('editcomplete', this);
            }
        },

        onBackgroundColorTransparentClick: function(btn) {
            this.onBackgroundColorSelect(btn, 'transparent');
        },

        onNumOpacityChange: function(field, newValue, oldValue, eOpts) {
            this.sldrOpacity.setValue(field.getNumberValue(), true);
            if (this.api)  {
                const num = field.getNumberValue();
                this.api.SetAnnotOpacity(num);
            }
        },
        onOpacityChange: function(field, newValue, oldValue) {
            this._sliderOpacityChanged = newValue;
            this.numOpacity.setValue(newValue, true);

            if (this._sendUndoPoint) {
                this.api.setStartPointHistory();
                this._sendUndoPoint = false;
                this.updateSliderOpacity = setInterval(_.bind(this._opacityApplyFunc, this), 100);
            }
        },
        onOpacityChangeComplete: function(field, newValue, oldValue) {
            clearInterval(this.updateSliderOpacity);
            this._sliderOpacityChanged = newValue;
            if (!this._sendUndoPoint) { 
                this.api.setEndPointHistory();
                this._opacityApplyFunc();
            }
            this._sendUndoPoint = true;
        },
        _opacityApplyFunc: function() {
            if (this._sliderOpacityChanged !== undefined) {
                this.api.SetAnnotOpacity(this._sliderOpacityChanged);
                this._sliderOpacityChanged = undefined;
            }
        },

        onLineStartChanged: function(combo, record) {
            if (this.api) {
                this.api.SetAnnotLineStart(record.value);
                this.fireEvent('editcomplete', this);
            }
        },

        onLineEndChanged: function(combo, record) {
            if (this.api ) {
                this.api.SetAnnotLineEnd(record.value);
                this.fireEvent('editcomplete', this);
            }
        },

        disableControls: function(disable) {
            if (this._initSettings) return;
            
            if (this._state.DisabledControls!==disable) {
                this._state.DisabledControls = disable;
                _.each(this.lockedControls, function(item) {
                    item.setDisabled(disable);
                });
            }
        }
    }, PDFE.Views.AnnotationSettings || {}));
});