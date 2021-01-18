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
 *  ParagraphSettings.js
 *
 *  Created by Julia Radzhabova on 1/23/14
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
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
    'documenteditor/main/app/view/ParagraphSettingsAdvanced'
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
                HideTextOnlySettings: false
            };
            this.spinners = [];
            this.lockedControls = [];
            this._locked = true;
            this.isChart = false;

            this._arrLineRule = [
                {displayValue: this.textAtLeast,defaultValue: 5, value: c_paragraphLinerule.LINERULE_LEAST, minValue: 0.03,   step: 0.01, defaultUnit: 'cm'},
                {displayValue: this.textAuto,   defaultValue: 1, value: c_paragraphLinerule.LINERULE_AUTO, minValue: 0.5,    step: 0.01, defaultUnit: ''},
                {displayValue: this.textExact,  defaultValue: 5, value: c_paragraphLinerule.LINERULE_EXACT, minValue: 0.03,   step: 0.01, defaultUnit: 'cm'}
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
                disabled: this._locked
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
                disabled: this._locked
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
                disabled: this._locked
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
                disabled: this._locked
            });
            this.spinners.push(this.numSpacingAfter);
            this.lockedControls.push(this.numSpacingAfter);

            this.chAddInterval = new Common.UI.CheckBox({
                el: $markup.findById('#paragraph-checkbox-add-interval'),
                labelText: this.strSomeParagraphSpace,
                disabled: this._locked
            });
            this.lockedControls.push(this.chAddInterval);

            this.btnColor = new Common.UI.ColorButton({
                parentEl: $markup.findById('#paragraph-color-btn'),
                disabled: this._locked,
                transparent: true,
                menu        : true
            });
            this.lockedControls.push(this.btnColor);

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

        ChangeSettings: function(prop) {
            if (this._initSettings)
                this.createDelayedElements();

            this.disableControls(this._locked);
            this.hideTextOnlySettings(this.isChart);

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
                    if ( typeof(this.BackColor) == 'object' ) {
                        var isselected = false;
                        for (var i=0; i<10; i++) {
                            if ( Common.Utils.ThemeColor.ThemeValues[i] == this.BackColor.effectValue ) {
                                this.mnuColorPicker.select(this.BackColor,true);
                                isselected = true;
                                break;
                            }
                        }
                        if (!isselected) this.mnuColorPicker.clearSelection();
                    } else
                        this.mnuColorPicker.select(this.BackColor,true);

                    this._state.BackColor = this.BackColor;
                }
            }
        },

        updateMetricUnit: function() {
            if (this.spinners) {
                for (var i=0; i<this.spinners.length; i++) {
                    var spinner = this.spinners[i];
                    spinner.setDefaultUnit(Common.Utils.Metric.getCurrentMetricName());
                    spinner.setStep(Common.Utils.Metric.getCurrentMetric()==Common.Utils.Metric.c_MetricUnits.pt ? 1 : 0.01);
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
                            (new DE.Views.ParagraphSettingsAdvanced(
                            {
                                tableStylerRows: 2,
                                tableStylerColumns: 1,
                                paragraphProps: elValue,
                                borderProps: me.borderAdvancedProps,
                                isChart: me.isChart,
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
        textBackColor:          'Background color'
    }, DE.Views.ParagraphSettings || {}));
});