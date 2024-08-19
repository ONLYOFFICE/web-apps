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
 *  ParagraphSettings.js
 *
 *  Created on 1/23/14
 *
 */

define([
    'text!documenteditor/main/app/template/ParagraphSettings.template',
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/component/ComboBox',
    'common/main/lib/component/MetricSpinner',
    'common/main/lib/component/CheckBox',
    'common/main/lib/component/ThemeColorPalette',
    'common/main/lib/component/ColorButton',
], function (menuTemplate, $, _, Backbone) {
    'use strict';

    DE.Views.ParagraphSettings = Backbone.View.extend(_.extend({
        el: '#id-paragraph-settings',

        // Compile our stats template
        template: _.template(menuTemplate),

        // Delegated events for creating new items, and clearing completed ones.
        events: {
        },

        options: {
            alias: 'ParagraphSettings'
        },

        initialize: function () {
            this._initSettings = true;

            this._state = {
                LineRuleIdx: null,
                LineHeight: null,
                LineSpacingBefore: null,
                LineSpacingAfter: null,
                AddInterval: false,
                BackColor: '#000000',
                DisabledControls: true,
                HideTextOnlySettings: false,
                LeftIndent: null,
                RightIndent: null,
                FirstLine: null,
                CurSpecial: undefined
            };
            this.spinners = [];
            this.lockedControls = [];
            this._locked = true;
            this.isChart = false;
            this.isSmartArtInternal = false;

            this._arrLineRule = [
                {displayValue: this.textAtLeast,defaultValue: 5, value: c_paragraphLinerule.LINERULE_LEAST, minValue: 0.03,   step: 0.01, defaultUnit: 'cm'},
                {displayValue: this.textAuto,   defaultValue: 1, value: c_paragraphLinerule.LINERULE_AUTO, minValue: 0.5,    step: 0.01, defaultUnit: ''},
                {displayValue: this.textExact,  defaultValue: 5, value: c_paragraphLinerule.LINERULE_EXACT, minValue: 0.03,   step: 0.01, defaultUnit: 'cm'}
            ];

            this._arrSpecial = [
                {displayValue: this.textNoneSpecial, value: c_paragraphSpecial.NONE_SPECIAL, defaultValue: 0},
                {displayValue: this.textFirstLine, value: c_paragraphSpecial.FIRST_LINE, defaultValue: 12.7},
                {displayValue: this.textHanging, value: c_paragraphSpecial.HANGING, defaultValue: 12.7}
            ];

            this.render();
        },

        render: function () {
            var $markup = $(this.template({
                scope: this
            }));

            var me = this;

            // Short Size
            this.cmbLineRule = new Common.UI.ComboBox({
                el: $markup.findById('#paragraph-combo-line-rule'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 85px;',
                editable: false,
                data: this._arrLineRule,
                disabled: this._locked,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                ariaLabel: this.strLineHeight
            });
            this.cmbLineRule.setValue('');
            this.lockedControls.push(this.cmbLineRule);

            this.numLineHeight = new Common.UI.MetricSpinner({
                el: $markup.findById('#paragraph-spin-line-height'),
                step: .01,
                width: 85,
                value: '',
                defaultUnit : "",
                maxValue: 132,
                minValue: 0.5,
                disabled: this._locked,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                ariaLabel: this.strLineHeight
            });
            this.lockedControls.push(this.numLineHeight);

            this.numSpacingBefore = new Common.UI.MetricSpinner({
                el: $markup.findById('#paragraph-spin-spacing-before'),
                step: .1,
                width: 85,
                value: '',
                defaultUnit : "cm",
                maxValue: 55.88,
                minValue: 0,
                allowAuto   : true,
                autoText    : this.txtAutoText,
                disabled: this._locked,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                ariaLabel: this.strParagraphSpacing + ' ' + this.strSpacingBefore
            });
            this.spinners.push(this.numSpacingBefore);
            this.lockedControls.push(this.numSpacingBefore);

            this.numSpacingAfter = new Common.UI.MetricSpinner({
                el: $markup.findById('#paragraph-spin-spacing-after'),
                step: .1,
                width: 85,
                value: '',
                defaultUnit : "cm",
                maxValue: 55.88,
                minValue: 0,
                allowAuto   : true,
                autoText    : this.txtAutoText,
                disabled: this._locked,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                ariaLabel: this.strParagraphSpacing + ' ' + this.strSpacingAfter
            });
            this.spinners.push(this.numSpacingAfter);
            this.lockedControls.push(this.numSpacingAfter);

            this.chAddInterval = new Common.UI.CheckBox({
                el: $markup.findById('#paragraph-checkbox-add-interval'),
                labelText: this.strSomeParagraphSpace,
                disabled: this._locked,
                dataHint: '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            this.lockedControls.push(this.chAddInterval);

            this.btnColor = new Common.UI.ColorButton({
                parentEl: $markup.findById('#paragraph-color-btn'),
                disabled: this._locked,
                transparent: true,
                menu: true,
                eyeDropper: true,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'medium'
            });
            this.lockedControls.push(this.btnColor);

            this.numIndentsLeft = new Common.UI.MetricSpinner({
                el: $markup.findById('#paragraph-spin-indent-left'),
                step: .1,
                width: 85,
                defaultUnit : "cm",
                defaultValue : 0,
                value: '0 cm',
                maxValue: 55.87,
                minValue: -55.87,
                disabled: this._locked,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                ariaLabel: this.strIndent + ' ' + this.strIndentsLeftText
            });
            this.spinners.push(this.numIndentsLeft);
            this.lockedControls.push(this.numIndentsLeft);

            this.numIndentsRight = new Common.UI.MetricSpinner({
                el: $markup.findById('#paragraph-spin-indent-right'),
                step: .1,
                width: 85,
                defaultUnit : "cm",
                defaultValue : 0,
                value: '0 cm',
                maxValue: 55.87,
                minValue: -55.87,
                disabled: this._locked,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                ariaLabel: this.strIndent + ' ' + this.strIndentsRightText
            });
            this.spinners.push(this.numIndentsRight);
            this.lockedControls.push(this.numIndentsRight);

            this.cmbSpecial = new Common.UI.ComboBox({
                el: $markup.findById('#paragraph-combo-special'),
                cls: 'input-group-nr',
                editable: false,
                data: this._arrSpecial,
                style: 'width: 85px;',
                menuStyle   : 'min-width: 85px;',
                disabled: this._locked,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                ariaLabel: this.strIndent + ' ' + this.strIndentsSpecial
            });
            this.cmbSpecial.setValue('');
            this.lockedControls.push(this.cmbSpecial);

            this.numSpecialBy = new Common.UI.MetricSpinner({
                el: $markup.findById('#paragraph-spin-special-by'),
                step: .1,
                width: 85,
                defaultUnit : "cm",
                defaultValue : 0,
                value: '0 cm',
                maxValue: 55.87,
                minValue: 0,
                disabled: this._locked,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                ariaLabel: this.strIndent + ' ' + this.strIndentsSpecial
            });
            this.spinners.push(this.numSpecialBy);
            this.lockedControls.push(this.numSpecialBy);

            this.numLineHeight.on('change', this.onNumLineHeightChange.bind(this));
            this.numSpacingBefore.on('change', this.onNumSpacingBeforeChange.bind(this));
            this.numSpacingAfter.on('change', this.onNumSpacingAfterChange.bind(this));
            this.numLineHeight.on('inputleave', function(){ me.fireEvent('editcomplete', me);});
            this.numSpacingBefore.on('inputleave', function(){ me.fireEvent('editcomplete', me);});
            this.numSpacingAfter.on('inputleave', function(){ me.fireEvent('editcomplete', me);});
            this.chAddInterval.on('change', this.onAddIntervalChange.bind(this));
            this.cmbLineRule.on('selected', this.onLineRuleSelect.bind(this));
            this.cmbLineRule.on('hide:after', this.onHideMenus.bind(this));
            this.btnColor.on('color:select', this.onColorPickerSelect.bind(this));
            this.btnColor.on('eyedropper:start', this.onEyedropperStart.bind(this));
            this.btnColor.on('eyedropper:end', this.onEyedropperEnd.bind(this));
            this.numIndentsLeft.on('change', this.onNumIndentsLeftChange.bind(this));
            this.numIndentsRight.on('change', this.onNumIndentsRightChange.bind(this));
            this.numSpecialBy.on('change', this.onFirstLineChange.bind(this));
            this.cmbSpecial.on('selected', _.bind(this.onSpecialSelect, this));
            this.numIndentsLeft.on('inputleave', function(){ me.fireEvent('editcomplete', me);});
            this.numIndentsRight.on('inputleave', function(){ me.fireEvent('editcomplete', me);});
            this.numSpecialBy.on('inputleave', function(){ me.fireEvent('editcomplete', me);});

            this.linkAdvanced = $markup.findById('#paragraph-advanced-link');
            this.linkAdvanced.toggleClass('disabled', this._locked);

            this.$el.on('click', '#paragraph-advanced-link', this.openAdvancedSettings.bind(this));
            this.$el.html($markup);

            this.TextOnlySettings = $('.text-only', this.$el);

            this.rendered = true;
        },

        setApi: function(api) {
            this.api = api;
            if (this.api) {
                this.api.asc_registerCallback('asc_onParaSpacingLine', _.bind(this._onLineSpacing, this));
            }
            return this;
        },

        onNumLineHeightChange: function(field, newValue, oldValue, eOpts){
            if ( this.cmbLineRule.getRawValue() === '' )
                return;
            var type = c_paragraphLinerule.LINERULE_AUTO;
            if (this.api)
                this.api.put_PrLineSpacing(this.cmbLineRule.getValue(), (this.cmbLineRule.getValue()==c_paragraphLinerule.LINERULE_AUTO) ? field.getNumberValue() : Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
        },

        onNumSpacingBeforeChange: function(field, newValue, oldValue, eOpts){
            if (this.api)  {
                var num = field.getNumberValue();
                this._state.LineSpacingBefore = (num<0) ? -1 : Common.Utils.Metric.fnRecalcToMM(num);
                this.api.put_LineSpacingBeforeAfter(0, this._state.LineSpacingBefore);
            }
        },

        onNumSpacingAfterChange: function(field, newValue, oldValue, eOpts){
            if (this.api){
                var num = field.getNumberValue();
                this._state.LineSpacingAfter = (num<0) ? -1 : Common.Utils.Metric.fnRecalcToMM(num);
                this.api.put_LineSpacingBeforeAfter(1, this._state.LineSpacingAfter);
            }
        },

        onAddIntervalChange: function(field, newValue, oldValue, eOpts){
            if (this.api)
                this.api.put_AddSpaceBetweenPrg((field.getValue()=='checked'));
            this.fireEvent('editcomplete', this);
        },

        onLineRuleSelect: function(combo, record) {
            if (this.api)
                this.api.put_PrLineSpacing(record.value, record.defaultValue);
            this.numLineHeight.setDefaultUnit(this._arrLineRule[record.value].defaultUnit);
            this.numLineHeight.setMinValue(this._arrLineRule[record.value].minValue);
            this.numLineHeight.setStep(this._arrLineRule[record.value].step);
            this.fireEvent('editcomplete', this);
        },

        _onLineSpacing: function(value) {
            var linerule = value.get_LineRule();
            var line = value.get_Line();

            if ( this._state.LineRuleIdx!==linerule ) {
                this.cmbLineRule.setValue((linerule !== null) ? this._arrLineRule[linerule].value : '');
                this.numLineHeight.setMinValue(this._arrLineRule[(linerule !== null) ? linerule : 1].minValue);
                this.numLineHeight.setDefaultUnit(this._arrLineRule[(linerule !== null) ? linerule : 1].defaultUnit);
                this.numLineHeight.setStep(this._arrLineRule[(linerule !== null) ? linerule : 1].step);

                this._state.LineRuleIdx=linerule;
            }

            if ( Math.abs(this._state.LineHeight-line)>0.001 ||
                (this._state.LineHeight===null || line===null)&&(this._state.LineHeight!==line)) {
                var val = '';
                if ( linerule == c_paragraphLinerule.LINERULE_AUTO ) {
                    val = line;
                } else if (linerule !== null && line !== null ) {
                    val = Common.Utils.Metric.fnRecalcFromMM(line);
                }
                this.numLineHeight.setValue((val !== null) ? val : '', true);

                this._state.LineHeight=line;
            }
        },

        onColorPickerSelect: function(btn, color) {
            this.BackColor = color;
            this._state.BackColor = this.BackColor;

            if (this.api) {
                if (color == 'transparent') {
                    this.api.put_ParagraphShade(false);
                } else {
                    this.api.put_ParagraphShade(true, Common.Utils.ThemeColor.getRgbColor(color));
                }
            }

            this.fireEvent('editcomplete', this);
        },

        onSpecialSelect: function(combo, record) {
            var special = record.value,
                specialBy = (special === c_paragraphSpecial.NONE_SPECIAL) ? 0 : this.numSpecialBy.getNumberValue();
            specialBy = Common.Utils.Metric.fnRecalcToMM(specialBy);
            if (specialBy === 0) {
                specialBy = this._arrSpecial[special].defaultValue;
            }
            if (special === c_paragraphSpecial.HANGING) {
                specialBy = -specialBy;
            }

            var props = new Asc.asc_CParagraphProperty();
            props.put_Ind(new Asc.asc_CParagraphInd());
            props.get_Ind().put_FirstLine(specialBy);
            if (specialBy<0 || this._state.FirstLine<0) {
                var left = this._state.LeftIndent;
                if (left !== undefined && left !== null) {
                    props.get_Ind().put_Left(specialBy<0 ? left-specialBy : left);
                }
            }

            if (this.api)
                this.api.paraApply(props);
            this.fireEvent('editcomplete', this);
        },

        onFirstLineChange: function(field, newValue, oldValue, eOpts){
            var specialBy = Common.Utils.Metric.fnRecalcToMM(field.getNumberValue());
            if (this._state.CurSpecial === c_paragraphSpecial.HANGING) {
                specialBy = -specialBy;
            }

            var props = new Asc.asc_CParagraphProperty();
            props.put_Ind(new Asc.asc_CParagraphInd());
            props.get_Ind().put_FirstLine(specialBy);
            if (specialBy<0 || this._state.FirstLine<0) {
                var left = this._state.LeftIndent;
                if (left !== undefined && left !== null) {
                    props.get_Ind().put_Left(specialBy<0 ? left-specialBy : left);
                }
            }

            if (this.api)
                this.api.paraApply(props);
        },

        onNumIndentsLeftChange: function(field, newValue, oldValue, eOpts){
            var left = Common.Utils.Metric.fnRecalcToMM(field.getNumberValue());
            if (this._state.FirstLine<0) {
                left = left-this._state.FirstLine;
            }
            var props = new Asc.asc_CParagraphProperty();
            props.put_Ind(new Asc.asc_CParagraphInd());
            props.get_Ind().put_Left(left);
            if (this.api)
                this.api.paraApply(props);
        },

        onNumIndentsRightChange: function(field, newValue, oldValue, eOpts){
            var props = new Asc.asc_CParagraphProperty();
            props.put_Ind(new Asc.asc_CParagraphInd());
            props.get_Ind().put_Right(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
            if (this.api)
                this.api.paraApply(props);
        },

        ChangeSettings: function(prop) {
            if (this._initSettings)
                this.createDelayedElements();

            this.disableControls(this._locked);
            this.hideTextOnlySettings(this.isChart || this.isSmartArtInternal);

            if (prop) {
                var Spacing = {
                    Line: prop.get_Spacing().get_Line(),
                    Before: prop.get_Spacing().get_Before(),
                    After: prop.get_Spacing().get_After(),
                    LineRule: prop.get_Spacing().get_LineRule()
                };

                var other = {
                    ContextualSpacing: prop.get_ContextualSpacing()
                };

                if ( this._state.LineRuleIdx!==Spacing.LineRule ) {
                    this.cmbLineRule.setValue((Spacing.LineRule !== null) ? this._arrLineRule[Spacing.LineRule].value : '');
                    this.numLineHeight.setMinValue(this._arrLineRule[(Spacing.LineRule !== null) ? Spacing.LineRule : 1].minValue);
                    this.numLineHeight.setDefaultUnit(this._arrLineRule[(Spacing.LineRule !== null) ? Spacing.LineRule : 1].defaultUnit);
                    this.numLineHeight.setStep(this._arrLineRule[(Spacing.LineRule !== null) ? Spacing.LineRule : 1].step);

                    this._state.LineRuleIdx=Spacing.LineRule;
                }

                if ( Math.abs(this._state.LineHeight-Spacing.Line)>0.001 ||
                    (this._state.LineHeight===null || Spacing.Line===null)&&(this._state.LineHeight!==Spacing.Line)) {
                    var val = '';
                    if ( Spacing.LineRule == c_paragraphLinerule.LINERULE_AUTO ) {
                        val = Spacing.Line;
                    } else if (Spacing.LineRule !== null && Spacing.Line !== null ) {
                        val = Common.Utils.Metric.fnRecalcFromMM(Spacing.Line);
                    }
                    this.numLineHeight.setValue((val !== null) ?  val : '', true);

                    this._state.LineHeight=Spacing.Line;
                }

                if ( Math.abs(this._state.LineSpacingBefore-Spacing.Before)>0.001 ||
                    (this._state.LineSpacingBefore===null || Spacing.Before===null)&&(this._state.LineSpacingBefore!==Spacing.Before)) {

                    this.numSpacingBefore.setValue((Spacing.Before !== null) ? ((Spacing.Before<0) ? Spacing.Before : Common.Utils.Metric.fnRecalcFromMM(Spacing.Before) ) : '', true);
                    this._state.LineSpacingBefore=Spacing.Before;
                }

                if ( Math.abs(this._state.LineSpacingAfter-Spacing.After)>0.001 ||
                    (this._state.LineSpacingAfter===null || Spacing.After===null)&&(this._state.LineSpacingAfter!==Spacing.After)) {

                    this.numSpacingAfter.setValue((Spacing.After !== null) ? ((Spacing.After<0) ? Spacing.After : Common.Utils.Metric.fnRecalcFromMM(Spacing.After) ) : '', true);
                    this._state.LineSpacingAfter=Spacing.After;
                }

                if ( this._state.AddInterval!==other.ContextualSpacing ) {
                    this.chAddInterval.setValue((other.ContextualSpacing !== null && other.ContextualSpacing !== undefined) ? other.ContextualSpacing : 'indeterminate', true);
                    this._state.AddInterval=other.ContextualSpacing;
                }

                var indents = prop.get_Ind(),
                    first = (indents !== null) ? indents.get_FirstLine() : null,
                    left = (indents !== null) ? indents.get_Left() : null;
                if (first<0 && left !== null)
                    left = left + first;
                if ( Math.abs(this._state.LeftIndent-left)>0.001 ||
                    (this._state.LeftIndent===null || left===null)&&(this._state.LeftIndent!==left)) {
                    this.numIndentsLeft.setValue(left!==null ? Common.Utils.Metric.fnRecalcFromMM(left) : '', true);
                    this._state.LeftIndent=left;
                }

                if ( Math.abs(this._state.FirstLine-first)>0.001 ||
                    (this._state.FirstLine===null || first===null)&&(this._state.FirstLine!==first)) {
                    this.numSpecialBy.setValue(first!==null ? Math.abs(Common.Utils.Metric.fnRecalcFromMM(first)) : '', true);
                    this._state.FirstLine=first;
                }

                var value = (indents !== null) ? indents.get_Right() : null;
                if ( Math.abs(this._state.RightIndent-value)>0.001 ||
                    (this._state.RightIndent===null || value===null)&&(this._state.RightIndent!==value)) {
                    this.numIndentsRight.setValue(value!==null ? Common.Utils.Metric.fnRecalcFromMM(value) : '', true);
                    this._state.RightIndent=value;
                }

                value = (first === 0) ? c_paragraphSpecial.NONE_SPECIAL : ((first > 0) ? c_paragraphSpecial.FIRST_LINE : c_paragraphSpecial.HANGING);
                if ( this._state.CurSpecial!==value ) {
                    this.cmbSpecial.setValue(value);
                    this._state.CurSpecial=value;
                }

                var shd = prop.get_Shade();
                if (shd!==null && shd!==undefined && shd.get_Value()===Asc.c_oAscShdClear) {
                    var color = shd.get_Color();
                    if (color) {
                        if (color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                            this.BackColor = {color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()), effectValue: color.get_value() };
                        } else {
                            this.BackColor = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
                        }
                    } else
                        this.BackColor = 'transparent';
                } else {
                    this.BackColor = 'transparent';
                }

                var type1 = typeof(this.BackColor),
                    type2 = typeof(this._state.BackColor);
                if ( (type1 !== type2) || (type1=='object' &&
                    (this.BackColor.effectValue!==this._state.BackColor.effectValue || this._state.BackColor.color.indexOf(this.BackColor.color)<0)) ||
                    (type1!='object' && this._state.BackColor.indexOf(this.BackColor)<0 )) {

                    this.btnColor.setColor(this.BackColor);
                    Common.Utils.ThemeColor.selectPickerColorByEffect(this.BackColor, this.mnuColorPicker);
                    this._state.BackColor = this.BackColor;
                }
            }
        },

        updateMetricUnit: function() {
            if (this.spinners) {
                for (var i=0; i<this.spinners.length; i++) {
                    var spinner = this.spinners[i];
                    spinner.setDefaultUnit(Common.Utils.Metric.getCurrentMetricName());
                    if (spinner.el.id == 'paragraphadv-spin-position' || spinner.el.id == 'paragraph-spin-spacing-before' || spinner.el.id == 'paragraph-spin-spacing-after')
                        spinner.setStep(Common.Utils.Metric.getCurrentMetric()==Common.Utils.Metric.c_MetricUnits.pt ? 1 : 0.01);
                    else
                        spinner.setStep(Common.Utils.Metric.getCurrentMetric()==Common.Utils.Metric.c_MetricUnits.pt ? 1 : 0.1);
                }
            }
            this._arrLineRule[2].defaultUnit =  this._arrLineRule[0].defaultUnit = Common.Utils.Metric.getCurrentMetricName();
            this._arrLineRule[2].minValue =  this._arrLineRule[0].minValue = parseFloat(Common.Utils.Metric.fnRecalcFromMM(0.3).toFixed(2));
            this._arrLineRule[2].step =  this._arrLineRule[0].step = (Common.Utils.Metric.getCurrentMetric()==Common.Utils.Metric.c_MetricUnits.pt) ? 1 : 0.01;
            if (this._state.LineRuleIdx !== null) {
                this.numLineHeight.setDefaultUnit(this._arrLineRule[this._state.LineRuleIdx].defaultUnit);
                this.numLineHeight.setStep(this._arrLineRule[this._state.LineRuleIdx].step);
                var val = '';
                if ( this._state.LineRuleIdx == c_paragraphLinerule.LINERULE_AUTO ) {
                    val = this._state.LineHeight;
                } else if (this._state.LineHeight !== null ) {
                    val = Common.Utils.Metric.fnRecalcFromMM(this._state.LineHeight);
                }
                this.numLineHeight && this.numLineHeight.setValue((val !== null) ?  val : '', true);
            }

            var val = this._state.LineSpacingBefore;
            this.numSpacingBefore && this.numSpacingBefore.setValue((val !== null) ? ((val<0) ? val : Common.Utils.Metric.fnRecalcFromMM(val) ) : '', true);
            val = this._state.LineSpacingAfter;
            this.numSpacingAfter && this.numSpacingAfter.setValue((val !== null) ? ((val<0) ? val : Common.Utils.Metric.fnRecalcFromMM(val) ) : '', true);
        },

        createDelayedElements: function() {
            this._initSettings = false;
            this.UpdateThemeColors();
            this.updateMetricUnit();
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
                        if (Asc.c_oAscTypeSelectElement.Paragraph == elType) {
                            if ( Common.Utils.checkComponentLoaded(DE.Views.ParagraphSettingsAdvanced) )
                                (new DE.Views.ParagraphSettingsAdvanced({
                                    tableStylerRows: 2,
                                    tableStylerColumns: 1,
                                    paragraphProps: elValue,
                                    borderProps: me.borderAdvancedProps,
                                    isChart: me.isChart,
                                    isSmartArtInternal: me.isSmartArtInternal,
                                    api: me.api,
                                    handler: function(result, value) {
                                        if (result == 'ok') {
                                            if (me.api) {
                                                me.borderAdvancedProps = value.borderProps;
                                                me.api.paraApply(value.paragraphProps);
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

        UpdateThemeColors: function() {
            if (!this.mnuColorPicker) {
                this.btnColor.setMenu();
                this.mnuColorPicker = this.btnColor.getPicker();
            }
            this.mnuColorPicker.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
        },

        onHideMenus: function(menu, e, isFromInputControl){
            if (!isFromInputControl) this.fireEvent('editcomplete', this);
        },

        setLocked: function (locked) {
            this._locked = locked;
        },

        disableControls: function(disable) {
            if (this._state.DisabledControls!==disable) {
                this._state.DisabledControls = disable;
                _.each(this.lockedControls, function(item) {
                    item.setDisabled(disable);
                });
                this.linkAdvanced.toggleClass('disabled', disable);
            }
        },

        hideTextOnlySettings: function(value) {
            if (this._state.HideTextOnlySettings !== value) {
                this._state.HideTextOnlySettings = value;
                this.TextOnlySettings.toggleClass('hidden', value==true);
            }
        },

        onEyedropperStart: function (btn) {
            this.api.asc_startEyedropper(_.bind(btn.eyedropperEnd, btn));
            this.fireEvent('eyedropper', true);
        },

        onEyedropperEnd: function () {
            this.fireEvent('eyedropper', false);
        },

        strParagraphSpacing:    'Paragraph Spacing',
        strSomeParagraphSpace:  'Don\'t add interval between paragraphs of the same style',
        strLineHeight:          'Line Spacing',
        strSpacingBefore:       'Before',
        strSpacingAfter:        'After',
        textAuto:               'Multiple',
        textAtLeast:            'At least',
        textExact:              'Exactly',
        textAdvanced:           'Show advanced settings',
        textAt:                 'At',
        txtAutoText:            'Auto',
        textBackColor:          'Background color',
        strIndent: 'Indents',
        strIndentsLeftText:     'Left',
        strIndentsRightText:    'Right',
        strIndentsSpecial: 'Special',
        textNoneSpecial: '(none)',
        textFirstLine: 'First line',
        textHanging: 'Hanging'
    }, DE.Views.ParagraphSettings || {}));
});