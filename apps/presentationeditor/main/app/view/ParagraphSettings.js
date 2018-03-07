/*
 *
 * (c) Copyright Ascensio System Limited 2010-2018
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
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia,
 * EU, LV-1021.
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
 *  Created by Julia Radzhabova on 4/11/14
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!presentationeditor/main/app/template/ParagraphSettings.template',
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/component/ComboBox',
    'common/main/lib/component/MetricSpinner',
    'presentationeditor/main/app/view/ParagraphSettingsAdvanced'
], function (menuTemplate, $, _, Backbone) {
    'use strict';

    PE.Views.ParagraphSettings = Backbone.View.extend(_.extend({
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
                LineRule: c_paragraphLinerule.LINERULE_AUTO,
                LineHeight: 1.5,
                LineSpacingBefore: 0,
                LineSpacingAfter: 0.35,
                DisabledControls: false
            };
            this.spinners = [];
            this.lockedControls = [];
            this._locked = false;

            this.render();
        },

        render: function () {
            var el = $(this.el);
            el.html(this.template({
                scope: this
            }));

            this.linkAdvanced = $('#paragraph-advanced-link');
        },

        setApi: function(api) {
            this.api = api;
            if (this.api)
                this.api.asc_registerCallback('asc_onParaSpacingLine', _.bind(this._onLineSpacing, this));
            return this;
        },

        onNumLineHeightChange: function(field, newValue, oldValue, eOpts){
            if ( this.cmbLineRule.getRawValue() === '' )
                return;
            if (this.api)
                this.api.put_PrLineSpacing(this.cmbLineRule.getValue(), (this.cmbLineRule.getValue()==c_paragraphLinerule.LINERULE_AUTO) ? field.getNumberValue() : Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
            this.fireEvent('editcomplete', this);
        },

        onNumSpacingBeforeChange: function(field, newValue, oldValue, eOpts){
            if (this.api)  {
                var num = field.getNumberValue();
                if (num<0)
                    this.api.put_LineSpacingBeforeAfter(0, -1);
                else
                    this.api.put_LineSpacingBeforeAfter(0, Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
            }

            this.fireEvent('editcomplete', this);
        },

        onNumSpacingAfterChange: function(field, newValue, oldValue, eOpts){
            if (this.api){
                var num = field.getNumberValue();
                if (num<0)
                    this.api.put_LineSpacingBeforeAfter(1, -1);
                else
                    this.api.put_LineSpacingBeforeAfter(1, Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
            }
            this.fireEvent('editcomplete', this);
        },

        onLineRuleSelect: function(combo, record) {
            if (this.api)
                this.api.put_PrLineSpacing(record.value, record.defaultValue);
            this.numLineHeight.setDefaultUnit(record.defaultUnit);
            this.numLineHeight.setMinValue(record.minValue);
            this.numLineHeight.setStep(record.step);
            this.fireEvent('editcomplete', this);
        },

        _onLineSpacing: function(value) {
            if (this._initSettings) return;
            
            var linerule = value.get_LineRule();
            var line = value.get_Line();

            if ( this._state.LineRule!==linerule ) {
                var obj,
                    rec = this.cmbLineRule.store.findWhere((obj={}, obj['value']=linerule, obj));
                if (!rec) rec = this.cmbLineRule.store.at(0);
                this.cmbLineRule.setValue((linerule !== null) ? linerule : '');
                this.numLineHeight.setMinValue(rec.get('minValue'));
                this.numLineHeight.setDefaultUnit(rec.get('defaultUnit'));
                this.numLineHeight.setStep(rec.get('step'));
                this._state.LineRule=linerule;
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

        ChangeSettings: function(prop) {
            if (this._initSettings)
                this.createDelayedElements();

            this.disableControls(this._locked);

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

                if ( this._state.LineRule!==Spacing.LineRule ) {
                    var obj,
                        rec = this.cmbLineRule.store.findWhere((obj={}, obj['value']=Spacing.LineRule, obj));
                    if (!rec) rec = this.cmbLineRule.store.at(0);
                    this.cmbLineRule.setValue((Spacing.LineRule !== null) ? Spacing.LineRule : '');
                    this.numLineHeight.setMinValue(rec.get('minValue'));
                    this.numLineHeight.setDefaultUnit(rec.get('defaultUnit'));
                    this.numLineHeight.setStep(rec.get('step'));

                    this._state.LineRule=Spacing.LineRule;
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
            if (this.cmbLineRule) {
                var rec = this.cmbLineRule.store.at(1);
                rec.set({defaultUnit: Common.Utils.Metric.getCurrentMetricName(),
                        minValue: parseFloat(Common.Utils.Metric.fnRecalcFromMM(0.3).toFixed(2)),
                        step: (Common.Utils.Metric.getCurrentMetric()==Common.Utils.Metric.c_MetricUnits.pt) ? 1 : 0.01});

                if (this._state.LineRule !== null) {
                    var obj;
                    rec = this.cmbLineRule.store.findWhere((obj={}, obj['value']=this._state.LineRule, obj));
                    if (!rec) rec = this.cmbLineRule.store.at(0);
                    this.numLineHeight.setDefaultUnit(rec.get('defaultUnit'));
                    this.numLineHeight.setStep(rec.get('step'));
                }
            }
        },

        createDelayedControls: function() {
            var me = this;
            this._arrLineRule = [
                {displayValue: this.textAuto,   defaultValue: 1, value: c_paragraphLinerule.LINERULE_AUTO, minValue: 0.5,    step: 0.01, defaultUnit: ''},
                {displayValue: this.textExact,  defaultValue: 5, value: c_paragraphLinerule.LINERULE_EXACT, minValue: 0.03,   step: 0.01, defaultUnit: 'cm'}
            ];

            // Short Size
            this.cmbLineRule = new Common.UI.ComboBox({
                el: $('#paragraph-combo-line-rule'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 85px;',
                editable: false,
                data: this._arrLineRule
            });
            this.cmbLineRule.setValue(c_paragraphLinerule.LINERULE_AUTO);
            this.lockedControls.push(this.cmbLineRule);

            this.numLineHeight = new Common.UI.MetricSpinner({
                el: $('#paragraph-spin-line-height'),
                step: .01,
                width: 85,
                value: '1.5',
                defaultUnit : "",
                maxValue: 132,
                minValue: 0.5
            });
            this.lockedControls.push(this.numLineHeight);

            this.numSpacingBefore = new Common.UI.MetricSpinner({
                el: $('#paragraph-spin-spacing-before'),
                step: .1,
                width: 85,
                value: '0 cm',
                defaultUnit : "cm",
                maxValue: 55.88,
                minValue: 0,
                allowAuto   : true,
                autoText    : this.txtAutoText
            });
            this.spinners.push(this.numSpacingBefore);
            this.lockedControls.push(this.numSpacingBefore);

            this.numSpacingAfter = new Common.UI.MetricSpinner({
                el: $('#paragraph-spin-spacing-after'),
                step: .1,
                width: 85,
                value: '0.35 cm',
                defaultUnit : "cm",
                maxValue: 55.88,
                minValue: 0,
                allowAuto   : true,
                autoText    : this.txtAutoText
            });
            this.spinners.push(this.numSpacingAfter);
            this.lockedControls.push(this.numSpacingAfter);

            this.numLineHeight.on('change', _.bind(this.onNumLineHeightChange, this));
            this.numSpacingBefore.on('change', _.bind(this.onNumSpacingBeforeChange, this));
            this.numSpacingAfter.on('change', _.bind(this.onNumSpacingAfterChange, this));
            this.cmbLineRule.on('selected', _.bind(this.onLineRuleSelect, this));
            this.cmbLineRule.on('hide:after', _.bind(this.onHideMenus, this));
            $(this.el).on('click', '#paragraph-advanced-link', _.bind(this.openAdvancedSettings, this));

        },

        createDelayedElements: function() {
            this.createDelayedControls();
            this.updateMetricUnit();
            this._initSettings = false;
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
                            (new PE.Views.ParagraphSettingsAdvanced(
                            {
                                paragraphProps: elValue,
                                api: me.api,
                                handler: function(result, value) {
                                    if (result == 'ok') {
                                        if (me.api) {
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

        onHideMenus: function(menu, e, isFromInputControl){
            if (!isFromInputControl) this.fireEvent('editcomplete', this);
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
        },

        strParagraphSpacing:    'Paragraph Spacing',
        strLineHeight:          'Line Spacing',
        strSpacingBefore:       'Before',
        strSpacingAfter:        'After',
        textAuto:               'Multiple',
        textAtLeast:            'At least',
        textExact:              'Exactly',
        textAdvanced:           'Show advanced settings',
        textAt:                 'At',
        txtAutoText:            'Auto'
    }, PE.Views.ParagraphSettings || {}));
});