/*
 *
 * (c) Copyright Ascensio System SIA 2010-2020
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
 *  FormSettings.js
 *
 *  Created by Julia Radzhabova on 28/09/20
 *  Copyright (c) 2020 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!documenteditor/main/app/template/FormSettings.template',
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/component/ComboBox',
    'common/main/lib/component/MetricSpinner',
    'common/main/lib/component/CheckBox'
], function (menuTemplate, $, _, Backbone) {
    'use strict';

    DE.Views.FormSettings = Backbone.View.extend(_.extend({
        el: '#id-form-settings',

        // Compile our stats template
        template: _.template(menuTemplate),

        // Delegated events for creating new items, and clearing completed ones.
        events: {
        },

        options: {
            alias: 'FormSettings'
        },

        initialize: function () {
            this._initSettings = true;

            this._state = {
                DisabledControls: true
            };
            this.spinners = [];
            this.lockedControls = [];
            this._locked = true;

            this.render();
        },

        render: function () {
            var el = this.$el || $(this.el);
            el.html(this.template({
                scope: this
            }));

            this.FillColorContainer = $('#shape-panel-color-fill');
            this.FillImageContainer = $('#shape-panel-image-fill');
            this.FillPatternContainer = $('#shape-panel-pattern-fill');
            this.FillGradientContainer = $('#shape-panel-gradient-fill');
            this.TransparencyContainer = $('#shape-panel-transparent-fill');
            this.ShapeOnlySettings = $('.shape-only');
            this.CanChangeType = $('.change-type');
        },

        createDelayedElements: function() {
            var $markup = this.$el || $(this.el);

            var me = this;

            this.labelFormName = $markup.findById('#form-settings-name');

            // Short Size
            this.cmbKey = new Common.UI.ComboBox({
                el: $markup.findById('#form-combo-key'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 85px;',
                editable: true,
                data: [],
                disabled: this._locked
            });
            this.cmbKey.setValue('');
            this.lockedControls.push(this.cmbKey);
            this.cmbKey.on('selected', this.onKeySelect.bind(this));
            this.cmbKey.on('changed:after', this.onKeyChanged.bind(this));
            this.cmbKey.on('hide:after', this.onHideMenus.bind(this));

            this.txtPlaceholder = new Common.UI.InputField({
                el          : $markup.findById('#form-txt-pholder'),
                allowBlank  : true,
                validateOnChange: false,
                validateOnBlur: false,
                style       : 'width: 100%;',
                value       : ''
            });
            this.lockedControls.push(this.txtPlaceholder);
            this.txtPlaceholder.on('changed:after', this.onPlaceholderChanged.bind(this));

            this.textareaHelp = $markup.findById('#form-txt-help');
            this.textareaHelp.keydown(function (event) {
                if (event.keyCode == Common.UI.Keys.RETURN) {
                    event.stopPropagation();
                }
                me.isHelpChanged = true;
            });

            this.chMaxChars = new Common.UI.CheckBox({
                el: $markup.findById('#form-chb-max-chars'),
                labelText: this.textMaxChars
            });
            this.chMaxChars.on('change', this.onChMaxCharsChanged.bind(this));
            this.lockedControls.push(this.chMaxChars);

            this.spnMaxChars = new Common.UI.MetricSpinner({
                el: $markup.findById('#form-spin-max-chars'),
                step: 1,
                width: 53,
                defaultUnit : "",
                value: '10',
                maxValue: 1000000,
                minValue: 1
            });
            this.lockedControls.push(this.spnMaxChars);
            this.spnMaxChars.on('change', this.onMaxCharsChange.bind(this));
            this.spnMaxChars.on('inputleave', function(){ me.fireEvent('editcomplete', me);});

            this.chComb = new Common.UI.CheckBox({
                el: $markup.findById('#form-chb-comb'),
                labelText: this.textComb
            });
            this.chComb.on('change', this.onChCombChanged.bind(this));
            this.lockedControls.push(this.chComb);

            this.spnWidth = new Common.UI.MetricSpinner({
                el: $markup.findById('#form-spin-width'),
                step: .1,
                width: 80,
                defaultUnit : "cm",
                value: '3 cm',
                maxValue: 55.88,
                minValue: 0.1
            });
            this.lockedControls.push(this.spnWidth);
            this.spnWidth.on('change', this.onWidthChange.bind(this));
            this.spnWidth.on('inputleave', function(){ me.fireEvent('editcomplete', me);});

            this.btnRemForm = new Common.UI.Button({
                parentEl: $markup.findById('#form-btn-delete'),
                cls         : 'btn-toolbar',
                iconCls     : 'toolbar__icon btn-remove-duplicates',
                caption     : this.textDelete,
                style       : 'width: 100%;text-align: left;'
            });
            this.btnRemForm.on('click', _.bind(function(btn){
                this.api.asc_RemoveContentControlWrapper(this._state.id);
            }, this));
            this.lockedControls.push(this.btnRemForm);

            this.btnLockForm = new Common.UI.Button({
                parentEl: $markup.findById('#form-btn-lock'),
                cls         : 'btn-toolbar',
                iconCls     : 'toolbar__icon btn-remove-duplicates',
                caption     : this.textLock,
                style       : 'width: 100%;text-align: left;'
            });
            this.btnLockForm.on('click', _.bind(function(btn){

            }, this));
            this.lockedControls.push(this.btnLockForm);

            this.updateMetricUnit();
        },

        setApi: function(api) {
            this.api = api;
            if (this.api) {
                // this.api.asc_registerCallback('asc_onParaSpacingLine', _.bind(this._onLineSpacing, this));
            }
            return this;
        },

        onKeySelect: function(combo, record) {
            if (this.api)
                this.api.put_PrLineSpacing(record.value, record.defaultValue);
            this.numLineHeight.setDefaultUnit(this._arrLineRule[record.value].defaultUnit);
            this.numLineHeight.setMinValue(this._arrLineRule[record.value].minValue);
            this.numLineHeight.setStep(this._arrLineRule[record.value].step);
            this.fireEvent('editcomplete', this);
        },

        onKeyChanged: function(combo, record) {
            if (me._changedProps) {
                me._changedProps.put_XAlign(undefined);
                me._changedProps.put_X(Common.Utils.Metric.fnRecalcToMM(Common.Utils.String.parseFloat(record.value)));
            }
            this.fireEvent('editcomplete', this);
        },

        onPlaceholderChanged: function(input, newValue, oldValue, e) {
            var val = parseInt(me.txtFieldNum.getValue());
            if (val !== parseInt(oldValue)) {
                me.api.asc_PreviewMailMergeResult(val-1);
                me.fireEvent('editcomplete', me);
            }
        },

        onChMaxCharsChanged: function(field, newValue, oldValue, eOpts){
            this.spnMaxChars.setDisabled(field.getValue()!='checked');
        },

        onMaxCharsChange: function(field, newValue, oldValue, eOpts){
            if ( this.cmbLineRule.getRawValue() === '' )
                return;
            var type = c_paragraphLinerule.LINERULE_AUTO;
            if (this.api)
                this.api.put_PrLineSpacing(this.cmbLineRule.getValue(), (this.cmbLineRule.getValue()==c_paragraphLinerule.LINERULE_AUTO) ? field.getNumberValue() : Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
        },

        onChCombChanged: function(field, newValue, oldValue, eOpts){
            var checked = (field.getValue()=='checked');
            if (checked) {
                this.chMaxChars.setValue(true);
            }
            this.spnWidth.setDisabled(!checked);
            if (this.api)
                this.api.put_AddSpaceBetweenPrg((field.getValue()=='checked'));
            this.fireEvent('editcomplete', this);
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

        ChangeSettings: function(props) {
            if (this._initSettings)
                this.createDelayedElements();

            this.disableControls(this._locked);

            if (props) {
                var val = props.get_PlaceholderText();
                this.txtPlaceholder.setValue(val ? val : '');

                val = props.get_Lock();
                (val===undefined) && (val = Asc.c_oAscSdtLockType.Unlocked);
                // this.btnLock.setValue(val==Asc.c_oAscSdtLockType.SdtContentLocked || val==Asc.c_oAscSdtLockType.SdtLocked || val==Asc.c_oAscSdtLockType.ContentLocked);

                var type = props.get_SpecificType();
                var specProps;
                //for list controls
                if (type == Asc.c_oAscContentControlSpecificType.ComboBox || type == Asc.c_oAscContentControlSpecificType.DropDownList) {
                    this.labelFormName.text(type == Asc.c_oAscContentControlSpecificType.ComboBox ? this.textCombobox : this.textDropDown);
                    specProps = (type == Asc.c_oAscContentControlSpecificType.ComboBox) ? props.get_ComboBoxPr() : props.get_DropDownListPr();
                    if (specProps) {
                        var count = specProps.get_ItemsCount();
                        var arr = [];
                        for (var i=0; i<count; i++) {
                            arr.push({
                                value: specProps.get_ItemValue(i),
                                name: specProps.get_ItemDisplayText(i)
                            });
                        }
                        this.list.store.reset(arr);
                    }
                    this.disableListButtons();
                }

                if (type == Asc.c_oAscContentControlSpecificType.CheckBox) {
                    specProps = props.get_CheckBoxPr();
                }

                this.type = type;

                // form settings
                var formPr = props.get_FormPr();
                if (formPr) {
                    val = formPr.get_Key();
                    this.cmbKey.setValue(val ? val : '');

                    val = formPr.get_HelpText();
                    this.textareaHelp.val(val ? val : '');

                    var hidden = true;
                    if (type == Asc.c_oAscContentControlSpecificType.CheckBox && specProps) {
                        val = specProps.get_GroupKey();
                        this.txtGroupKey.setValue(val ? val : '');
                        hidden = (typeof val !== 'string');
                        this.labelFormName.text(hidden ? this.textCheckBox : this.textRadiobox);
                    }
                    this.$el.find('.group-key').toggleClass('hidden', hidden);
                }

                var formTextPr = props.get_TextFormPr();
                if (formTextPr) {
                    this.labelFormName.text(this.textField);
                    val = formTextPr.get_Comb();
                    if ( this._state.Comb!==val ) {
                        this.chComb.setValue(!!val, true);
                        this._state.Comb=val;
                    }

                    this.spnWidth.setDisabled(!val);
                    val = formTextPr.get_Width();
                    if ( Math.abs(this._state.Width-val)>0.1) {
                        this.spnWidth.setValue(val ? val : '', true);
                        this._state.Width=val;
                    }

                    val = formTextPr.get_MaxCharacters();
                    if ( Math.abs(this._state.MaxChars-val)>0.1) {
                        this.chMaxChars.setValue(val && val>=0, true);
                        this.spnMaxChars.setDisabled(!val || val<0);
                        this.spnMaxChars.setValue(val && val>=0 ? val : 10, true);
                        this._state.MaxChars=val;
                    }
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
                this.textTip.toggleClass('disabled', disable);
            }
        },

        hideTextOnlySettings: function(value) {
            if (this._state.HideTextOnlySettings !== value) {
                this._state.HideTextOnlySettings = value;
                this.TextOnlySettings.toggleClass('hidden', value==true);
            }
        },

        textField: 'Text field',
        textKey: 'Key',
        textPlaceholder: 'Placeholder',
        textTip: 'Tip',
        textMaxChars: 'Characters limit',
        textComb: 'Comb of characters',
        textWidth: 'Width',
        textDelete: 'Delete',
        textLock: 'Lock'

    }, DE.Views.FormSettings || {}));
});