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
    'common/main/lib/component/TextareaField',
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
            this.internalId = null;
            this._locked = true;
            this._originalTextFormProps = null;
            this._originalFormProps = null;
            this._originalProps = null;
            this._lockedControl = false;

            this.render();
        },

        render: function () {
            var el = this.$el || $(this.el);
            el.html(this.template({
                scope: this
            }));

            this.textFieldContainer = el.find('.form-panel-textfield');
        },

        createDelayedElements: function() {
            this._initSettings = false;

            var $markup = this.$el || $(this.el);

            var me = this;

            this.labelFormName = $markup.findById('#form-settings-name');

            // Short Size
            this.cmbKey = new Common.UI.ComboBox({
                el: $markup.findById('#form-combo-key'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: true,
                data: [],
                disabled: this._locked
            });
            this.cmbKey.setValue('');
            this.lockedControls.push(this.cmbKey);
            this.cmbKey.on('selected', this.onKeyChanged.bind(this));
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
            this.txtPlaceholder.on('inputleave', function(){ me.fireEvent('editcomplete', me);});

            this.textareaHelp = new Common.UI.TextareaField({
                el          : $markup.findById('#form-txt-help'),
                style       : 'width: 100%; height: 90px;',
                value       : ''
            });
            this.lockedControls.push(this.textareaHelp);
            this.textareaHelp.on('changed:after', this.onHelpChanged.bind(this));
            this.textareaHelp.on('inputleave', function(){ me.fireEvent('editcomplete', me);});

            this.chMaxChars = new Common.UI.CheckBox({
                el: $markup.findById('#form-chb-max-chars'),
                labelText: this.textMaxChars
            });
            this.chMaxChars.on('change', this.onChMaxCharsChanged.bind(this));
            this.lockedControls.push(this.chMaxChars);

            this.spnMaxChars = new Common.UI.MetricSpinner({
                el: $markup.findById('#form-spin-max-chars'),
                step: 1,
                width: 48,
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
                width: 64,
                defaultUnit : "cm",
                value: 'Auto',
                allowAuto: true,
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
                style       : 'text-align: left;'
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
                style       : 'text-align: left;'
            });
            this.btnLockForm.on('click', _.bind(function(btn){
                if (this.api  && !this._noApply) {
                    var props   = this._originalProps || new AscCommon.CContentControlPr();
                    props.put_Lock(!this._lockedControl ? Asc.c_oAscSdtLockType.SdtContentLocked : Asc.c_oAscSdtLockType.Unlocked);
                    this.api.asc_SetContentControlProperties(props, this.internalId);
                }
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

        onKeyChanged: function(combo, record) {
            if (this.api && !this._noApply) {
                var props   = this._originalProps || new AscCommon.CContentControlPr();
                var formPr = this._originalFormProps || new AscCommon.CSdtFormPr();
                formPr.put_Key(record.value);
                props.put_FormPr(formPr);
                this.api.asc_SetContentControlProperties(props, this.internalId);
                this.fireEvent('editcomplete', this);
            }
        },

        onPlaceholderChanged: function(input, newValue, oldValue, e) {
            if (this.api && !this._noApply) {
                var props   = this._originalProps || new AscCommon.CContentControlPr();
                props.put_PlaceholderText(newValue);
                this.api.asc_SetContentControlProperties(props, this.internalId);
                this.fireEvent('editcomplete', this);
            }
        },

        onHelpChanged: function(input, newValue, oldValue, e) {
            if (this.api && !this._noApply) {
                var props   = this._originalProps || new AscCommon.CContentControlPr();
                var formPr = this._originalFormProps || new AscCommon.CSdtFormPr();
                formPr.put_HelpText(newValue);
                props.put_FormPr(formPr);
                this.api.asc_SetContentControlProperties(props, this.internalId);
                this.fireEvent('editcomplete', this);
            }
        },

        onChMaxCharsChanged: function(field, newValue, oldValue, eOpts){
            this.spnMaxChars.setDisabled(field.getValue()!='checked');
            if (this.api && !this._noApply) {
                var props   = this._originalProps || new AscCommon.CContentControlPr();
                var formTextPr = this._originalTextFormProps || new AscCommon.CSdtTextFormPr();
                var checked = (field.getValue()=='checked' || this.chComb.getValue()=='checked');
                formTextPr.put_MaxCharacters(checked ? (this.spnMaxChars.getNumberValue() || 10) : checked);
                props.put_TextFormPr(formTextPr);
                this.api.asc_SetContentControlProperties(props, this.internalId);
                this.fireEvent('editcomplete', this);
            }
        },

        onMaxCharsChange: function(field, newValue, oldValue, eOpts){
            if (this.api && !this._noApply) {
                var props   = this._originalProps || new AscCommon.CContentControlPr();
                var formTextPr = this._originalTextFormProps || new AscCommon.CSdtTextFormPr();
                var checked = (this.chMaxChars.getValue()=='checked' || this.chComb.getValue()=='checked');
                formTextPr.put_MaxCharacters(checked ? (field.getNumberValue() || 10) : checked);
                props.put_TextFormPr(formTextPr);
                this.api.asc_SetContentControlProperties(props, this.internalId);
                this.fireEvent('editcomplete', this);
            }
        },

        onChCombChanged: function(field, newValue, oldValue, eOpts){
            var checked = (field.getValue()=='checked');
            if (checked) {
                this.chMaxChars.setValue(true, true);
                this.spnMaxChars.setDisabled(false);
            }
            this.spnWidth.setDisabled(!checked);
            if (this.api && !this._noApply) {
                var props   = this._originalProps || new AscCommon.CContentControlPr();
                var formTextPr = this._originalTextFormProps || new AscCommon.CSdtTextFormPr();
                formTextPr.put_Comb(checked);
                if (checked) {
                    formTextPr.put_MaxCharacters(this.spnMaxChars.getNumberValue() || 10);
                    if (this.spnWidth.getValue()) {
                        var value = this.spnWidth.getNumberValue();
                        formTextPr.put_Width(value<=0 ? 0 : parseInt(Common.Utils.Metric.fnRecalcToMM(value) * 72 * 20 / 25.4));
                    } else
                        formTextPr.put_Width(0);
                }
                props.put_TextFormPr(formTextPr);
                this.api.asc_SetContentControlProperties(props, this.internalId);
                this.fireEvent('editcomplete', this);
            }
        },

        onWidthChange: function(field, newValue, oldValue, eOpts){
            if (this.api && !this._noApply) {
                var props   = this._originalProps || new AscCommon.CContentControlPr();
                var formTextPr = this._originalTextFormProps || new AscCommon.CSdtTextFormPr();
                if (this.spnWidth.getValue()) {
                    var value = this.spnWidth.getNumberValue();
                    formTextPr.put_Width(value<=0 ? 0 : parseInt(Common.Utils.Metric.fnRecalcToMM(value) * 72 * 20 / 25.4));
                } else
                    formTextPr.put_Width(0);

                props.put_TextFormPr(formTextPr);
                this.api.asc_SetContentControlProperties(props, this.internalId);
                this.fireEvent('editcomplete', this);
            }
        },

        ChangeSettings: function(props) {
            if (this._initSettings)
                this.createDelayedElements();

            this.disableControls(this._locked);

            if (props) {
                this._originalProps = props;

                this._noApply = true;

                this.internalId = props.get_InternalId();

                var val = props.get_PlaceholderText();
                if (this._state.placeholder !== val) {
                    this.txtPlaceholder.setValue(val ? val : '');
                    this._state.placeholder = val;
                }

                val = props.get_Lock();
                (val===undefined) && (val = Asc.c_oAscSdtLockType.Unlocked);
                if (this._lockedControl !== val) {
                    this._lockedControl = (val==Asc.c_oAscSdtLockType.SdtContentLocked || val==Asc.c_oAscSdtLockType.SdtLocked || val==Asc.c_oAscSdtLockType.ContentLocked);
                    this.btnLockForm.setCaption(this._lockedControl ? this.textUnlock : this.textLock);
                    this.btnRemForm.setDisabled(this._lockedControl || this._locked);
                }

                var type = props.get_SpecificType();
                var specProps;
                //for list controls
                if (type == Asc.c_oAscContentControlSpecificType.ComboBox || type == Asc.c_oAscContentControlSpecificType.DropDownList) {
                    this.labelFormName.text(type == Asc.c_oAscContentControlSpecificType.ComboBox ? this.textCombobox : this.textDropDown);
                    specProps = (type == Asc.c_oAscContentControlSpecificType.ComboBox) ? props.get_ComboBoxPr() : props.get_DropDownListPr();
                    if (specProps) {
                        this._originalListProps = specProps;
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
                } else if (type == Asc.c_oAscContentControlSpecificType.CheckBox) {
                    specProps = props.get_CheckBoxPr();
                    this._originalCheckProps = specProps;
                }

                this.type = type;

                // form settings
                var formPr = props.get_FormPr();
                if (formPr) {
                    this._originalFormProps = formPr;

                    val = formPr.get_Key();
                    if (this._state.key!==val) {
                        this.cmbKey.setValue(val ? val : '');
                        this._state.key = val;
                    }

                    val = formPr.get_HelpText();
                    if (this._state.help!==val) {
                        this.textareaHelp.setValue(val ? val : '');
                        this._state.help=val;
                    }

                    var hidden = true;
                    if (type == Asc.c_oAscContentControlSpecificType.CheckBox && specProps) {
                        val = specProps.get_GroupKey();
                        if (this._state.groupkey!==val) {
                            this.txtGroupKey.setValue(val ? val : '');
                            this._state.groupkey=val;
                        }
                        hidden = (typeof val !== 'string');
                        this.labelFormName.text(hidden ? this.textCheckbox : this.textRadiobox);
                    }
                    this.$el.find('.group-key').toggleClass('hidden', hidden);
                }

                var formTextPr = props.get_TextFormPr();
                if (formTextPr) {
                    this._originalTextFormProps = formTextPr;

                    this.labelFormName.text(this.textField);
                    val = formTextPr.get_Comb();
                    if ( this._state.Comb!==val ) {
                        this.chComb.setValue(!!val, true);
                        this._state.Comb=val;
                    }

                    this.spnWidth.setDisabled(!val);
                    val = formTextPr.get_Width();
                    if ( (val===undefined || this._state.Width===undefined)&&(this._state.Width!==val) || Math.abs(this._state.Width-val)>0.1) {
                        this.spnWidth.setValue(val!==0 && val!==undefined ? Common.Utils.Metric.fnRecalcFromMM(val * 25.4 / 20 / 72.0) : -1, true);
                        this._state.Width=val;
                    }

                    val = formTextPr.get_MaxCharacters();
                    this.chMaxChars.setValue(val && val>=0);
                    this.spnMaxChars.setDisabled(!val || val<0);
                    this.spnMaxChars.setValue(val && val>=0 ? val : 10);
                }
                this._noApply = false;
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
            }
            this.btnRemForm.setDisabled(this._lockedControl || disable);
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
        textLock: 'Lock',
        textUnlock: 'Unlock',
        textRadiobox: 'Radio button',
        textCheckbox: 'Checkbox',
        textCombobox: 'Combo box',
        textDropDown: 'Dropdown',
        textImage: 'Image'

    }, DE.Views.FormSettings || {}));
});