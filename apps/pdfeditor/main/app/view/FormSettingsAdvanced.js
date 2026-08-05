/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 *  FormSettingsAdvanced.js
 *
 *  Created on 25.03.2025
 *
 */

define([
    'text!pdfeditor/main/app/template/FormSettingsAdvanced.template',
    'common/main/lib/view/AdvancedSettingsWindow'
], function (contentTemplate) { 'use strict';

    PDFE.Views.FormSettingsAdvanced = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 300,
            contentHeight: 345
        },

        initialize : function(options) {
            this.api        = options.api;
            this.handler    = options.handler;
            this.props      = options.props;
            this.actionsProps = options.actionsProps;

            this._changedProps = new Asc.asc_CFieldActionsProperty();

            let panels = [];
            if(options.fieldType == AscPDF.FIELD_TYPES.combobox || options.fieldType == AscPDF.FIELD_TYPES.text) {
                panels.push(
                    {panelId: 'id-adv-form-format',    panelCaption: this.textFormat},
                    {panelId: 'id-adv-form-validate',    panelCaption: this.textValidate},
                    {panelId: 'id-adv-form-calculate',    panelCaption: this.textCalculate}
                );
            }
            panels.push({panelId: 'id-adv-form-actions',    panelCaption: this.textActions});
            
            _.extend(this.options, {
                title: this.textTitle,
                items: panels,
                contentHeight: 345,
                contentStyle: 'padding: 5px; position:relative;',
                contentTemplate: _.template(contentTemplate)({
                    scope: this
                })
            }, options);

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);

            this._state = {DateFormatCustom: '', DateFormat: '', TimeFormat: 0, NegStyle: AscPDF.NegativeStyle.BLACK_MINUS, SpecialType: AscPDF.SpecialFormatType.PHONE, Mask: '*', RegExp: '.'};
            this.FormatType = AscPDF.FormatType.NONE;
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            // Format
            this.cmbFormat = new Common.UI.ComboBox({
                el: $('#format-settings-combo-format'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: [{ displayValue: this.textNone,  value: AscPDF.FormatType.NONE },
                    { displayValue: this.textNumber,  value: AscPDF.FormatType.NUMBER },
                    { displayValue: this.textPercent,  value: AscPDF.FormatType.PERCENTAGE },
                    { displayValue: this.textDate,  value: AscPDF.FormatType.DATE },
                    { displayValue: this.textTime,  value: AscPDF.FormatType.TIME },
                    { displayValue: this.textSpecial,  value: AscPDF.FormatType.SPECIAL },
                    { displayValue: this.textCustom,  value: AscPDF.FormatType.CUSTOM },
                ],
                takeFocusOnClose: true
            });
            this.cmbFormat.setValue(this.FormatType);
            this.cmbFormat.on('selected', _.bind(function(combo, record) {
                this.onFormatSelect(combo, record);
                this.updateChangedProps();
            }, this));

            this.spnDecimal = new Common.UI.MetricSpinner({
                el: $('#format-settings-spin-decimal'),
                step: 1,
                width: 45,
                defaultUnit : "",
                value: 2,
                maxValue: 30,
                minValue: 0,
                allowDecimal: false
            });
            this.spnDecimal.on('change', _.bind(function(field, newValue, oldValue, eOpts) {
                this.putFormatPropValue('asc_putDecimals', field.getNumberValue());
                this.updateFormatExample();
            }, this));

            this.cmbSeparator = new Common.UI.ComboBox({
                el: $('#format-settings-combo-separator'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;max-height:235px;',
                editable: false,
                data: [
                    { displayValue: "1,234.56",  value: AscPDF.SeparatorStyle.COMMA_DOT },
                    { displayValue: "1234.56",  value: AscPDF.SeparatorStyle.NO_SEPARATOR },
                    { displayValue: "1.234,56",  value: AscPDF.SeparatorStyle.DOT_COMMA },
                    { displayValue: "1234,56",  value: AscPDF.SeparatorStyle.NO_SEPARATOR_COMMA },
                    { displayValue: "1'234.56",  value: AscPDF.SeparatorStyle.APOSTROPHE_DOT }
                ],
                scrollAlwaysVisible: true,
                takeFocusOnClose: true,
                search: true
            });
            this.cmbSeparator.setValue(AscPDF.SeparatorStyle.COMMA_DOT);
            this.cmbSeparator.on('selected', _.bind(function(combo, record) {
                this.putFormatPropValue('asc_putSepStyle', record.value);
                this.updateFormatExample();
            }, this));

            let currencySymbolsData = [];
            this.api.asc_getNumberFormatCurrencySymbols().forEach(function(item){
                currencySymbolsData.push({
                    value: item,
                    displayValue: item
                });
            });
            currencySymbolsData.unshift({value: null, displayValue: me.textNone});
            this.cmbSymbols = new Common.UI.ComboBox({
                el: $('#format-settings-combo-symbols'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;max-height:235px;',
                editable: false,
                data: currencySymbolsData,
                scrollAlwaysVisible: true,
                takeFocusOnClose: true,
                search: true
            });
            this.cmbSymbols.setValue(null);
            this.cmbSymbols.on('selected', _.bind(function(combo, record) {
                this.putFormatPropValue('asc_putCurrency', this.getSymbolValue());
                this.cmbLocation.setDisabled(record.value===null);
                this.updateFormatExample();
            }, this));

            this.cmbLocation = new Common.UI.ComboBox({
                el: $('#format-settings-combo-location'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;max-height:235px;',
                editable: false,
                data: [
                    { displayValue: this.textBeforeSpace,  value: 0 },
                    { displayValue: this.textBefore,  value: 1 },
                    { displayValue: this.textAfterSpace,  value: 2 },
                    { displayValue: this.textAfter,  value: 3 }
                ],
                scrollAlwaysVisible: true,
                takeFocusOnClose: true
            });
            this.cmbLocation.setValue(0);
            this.cmbLocation.setDisabled(true);
            this.cmbLocation.on('selected', _.bind(function(combo, record) {
                this.putFormatPropValue('asc_putCurrencyPrepend', record.value < 2);
                this.putFormatPropValue('asc_putCurrency', this.getSymbolValue());
                this.updateFormatExample();
            }, this));

            this.chParens = new Common.UI.CheckBox({
                el: $('#format-settings-chk-parens'),
                labelText: this.textParens
            });
            this.chParens.on('change', _.bind(this.onNegativeChange, this));

            this.chRed = new Common.UI.CheckBox({
                el: $('#format-settings-chk-red'),
                labelText: this.textRed
            });
            this.chRed.on('change', _.bind(this.onNegativeChange, this));

            this.dateTimeList = new Common.UI.ListView({
                el: $('#format-settings-list-format'),
                store: new Common.UI.DataViewStore(),
                tabindex: 1,
                itemTemplate: _.template('<div id="<%= id %>" class="list-item" style="pointer-events:none;overflow: hidden; text-overflow: ellipsis;"><%= Common.Utils.String.htmlEncode(displayValue) %></div>')
            });
            this.dateTimeList.on('item:select', _.bind(this.onDateTimeListSelect, this));
            this.dateTimeList.on('entervalue', _.bind(this.onPrimary, this));

            this.inputCustomFormat = new Common.UI.InputField({
                el               : $('#format-settings-txt-custom'),
                allowBlank       : true,
                validateOnChange : true,
                validation       : function () { return true; }
            }).on ('changing', function (input, value) {
                me._state.DateFormat = value;
                me.lblExample.text(me.api.asc_getFieldDateTimeFormatExample(value));
                me.putFormatPropValue('asc_putFormat', value);
            });

            this.cmbSpecial = new Common.UI.ComboBox({
                el: $('#format-settings-special'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;max-height:235px;',
                editable: false,
                data: [
                    { displayValue: this.textZipCode,  value: AscPDF.SpecialFormatType.ZIP_CODE },
                    { displayValue: this.textZipCode4,  value: AscPDF.SpecialFormatType.ZIP_PLUS_4 },
                    { displayValue: this.textPhone,  value: AscPDF.SpecialFormatType.PHONE },
                    { displayValue: this.textSSN,  value: AscPDF.SpecialFormatType.SSN },
                    { displayValue: this.textMask, value: -1 }],
                scrollAlwaysVisible: true,
                takeFocusOnClose: true
            });
            this.cmbSpecial.setValue(AscPDF.SpecialFormatType.PHONE);
            this.cmbSpecial.on('selected', this.onSpecialChanged.bind(this));

            this.txtMask = new Common.UI.InputField({
                el          : $('#format-settings-mask'),
                allowBlank  : true,
                validateOnChange : true,
                validateOnBlur: false,
                style       : 'width: 100%;',
                value       : '',
                dataHint    : '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            }).on ('changing', function (input, value) {
                me._state.Mask = value;
                me.putFormatPropValue('asc_putMask', me._state.Mask);
            });

            this.textareaFormat = new Common.UI.TextareaField({
                el: $('#format-settings-textarea-format'),
                rows: 5
            });
            this.textareaFormat.$el.find('textarea').attr('readonly', '');

            this.btnFormatScript = new Common.UI.Button({
                el: $('#format-settings-btn-format-script')
            });
            this.btnFormatScript.on('click', function() {
                const format = me._changedProps.asc_getFormat();
                const win = new PDFE.Views.FormSettingsCodeEditor({
                    defaultValue: format && format.asc_getScript() || '',
                    handler: function(state, result) {
                        if(state == 'ok') {
                            me.putFormatPropValue('asc_putScript', result, 'format');
                            me.textareaFormat.setValue(result);
                        }
                    }
                });
                me.openExtraWindow(win, me.btnFormatScript);
            });

            this.textareaKeystroke = new Common.UI.TextareaField({
                el: $('#format-settings-textarea-keystroke'),
                rows: 5
            });
            this.textareaKeystroke.$el.find('textarea').attr('readonly', '');

            this.btnKeystrokeScript = new Common.UI.Button({
                el: $('#format-settings-btn-keystroke-script')
            });
            this.btnKeystrokeScript.on('click', function() {
                const keystroke = me._changedProps.asc_getKeystroke();
                const win = new PDFE.Views.FormSettingsCodeEditor({
                    defaultValue: keystroke && keystroke.asc_getScript() || '',
                    handler: function(state, result) {
                        if(state == 'ok') {
                            me.putFormatPropValue('asc_putScript', result, 'keystroke');
                            me.textareaKeystroke.setValue(result);
                        }
                    }
                });
                me.openExtraWindow(win, me.btnKeystrokeScript);
            });


            //Validate
            this.radioValidateNone = new Common.UI.RadioBox({
                el: $('#format-settings-radio-validate-none'),
                name: 'form-settings-validate',
                labelText: this.textValidateNone,
            });
            this.radioValidateNone.on('change', _.bind(this.onValidateTypeChange, this, 'none'));

            this.radioValidateRange = new Common.UI.RadioBox({
                el: $('#format-settings-radio-validate-range'),
                name: 'form-settings-validate',
                labelText: this.textValidateRange
            });
            this.radioValidateRange.on('change', _.bind(this.onValidateTypeChange, this, 'range'));

            this.spnValidateMin = new Common.UI.MetricSpinner({
                el: $('#format-settings-spin-validate-min'),
                step: 1,
                width: 80,
                defaultUnit : "",
                allowBlank: true,
                value: '',
                maxValue: 999999,
                minValue: -999999
            });
            this.spnValidateMin.on('change', _.bind(this.onValidateRangeChange, this));

            this.spnValidateMax = new Common.UI.MetricSpinner({
                el: $('#format-settings-spin-validate-max'),
                step: 1,
                width: 80,
                defaultUnit : "",
                allowBlank: true,
                value: '',
                maxValue: 999999,
                minValue: -999999
            });
            this.spnValidateMax.on('change', _.bind(this.onValidateRangeChange, this));

            this.radioValidateScript = new Common.UI.RadioBox({
                el: $('#format-settings-radio-validate-script'),
                name: 'form-settings-validate',
                labelText: this.textValidateScript
            });
            this.radioValidateScript.on('change', _.bind(this.onValidateTypeChange, this, 'script'));

            this.textareaValidateScript = new Common.UI.TextareaField({
                el: $('#format-settings-textarea-validate-script'),
                rows: 5
            });
            this.textareaValidateScript.$el.find('textarea').attr('readonly', '');

            this.btnValidateScript = new Common.UI.Button({
                el: $('#format-settings-btn-validate-script')
            });
            this.btnValidateScript.on('click', function() {
                const validate = me._changedProps.asc_getValidate();
                const win = new PDFE.Views.FormSettingsCodeEditor({
                    defaultValue: validate && validate.asc_getScript() || '',
                    handler: function(state, result) {
                        if(state == 'ok') {
                            validate && validate.asc_putScript(result);
                            me.textareaValidateScript.setValue(result);
                        }
                    }
                });
                me.openExtraWindow(win, me.btnValidateScript);
            });

            //Calculate
            this.radioCalculateNone = new Common.UI.RadioBox({
                el: $('#format-settings-radio-calculate-none'),
                name: 'form-settings-calculate',
                labelText: this.textCalculateNone,
            });
            this.radioCalculateNone.on('change', _.bind(this.onCalculateTypeChange, this, 'none'));

            this.radioCalculateOperation = new Common.UI.RadioBox({
                el: $('#format-settings-radio-calculate-operation'),
                name: 'form-settings-calculate',
                labelText: this.textCalculateOperation
            });
            this.radioCalculateOperation.on('change', _.bind(this.onCalculateTypeChange, this, 'operation'));
            
            this.cmbCalculateOperation = new Common.UI.ComboBox({
                el: $('#format-settings-cmb-operation'),
                cls: 'input-group-nr',
                style: 'width: 50%;',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: [
                    { displayValue: this.textSum + ' (+)',  value: AscPDF.CalculateOperation.SUM },
                    { displayValue: this.textProduct + ' (x)',  value: AscPDF.CalculateOperation.PRD },
                    { displayValue: this.textAverage,  value: AscPDF.CalculateOperation.AVG },
                    { displayValue: this.textMinimum,  value: AscPDF.CalculateOperation.MIN },
                    { displayValue: this.textMaximum,  value: AscPDF.CalculateOperation.MAX },
                ],
                takeFocusOnClose: true
            });
            this.cmbCalculateOperation.setValue(AscPDF.CalculateOperation.SUM, true);
            this.cmbCalculateOperation.on('selected', function(cmb, record) {
                const calculate = me._changedProps.asc_getCalculate();
                calculate && calculate.asc_putType(record.value);
            });
                        
            this.textareaCalculateOperation = new Common.UI.TextareaField({
                el: $('#format-settings-textarea-calculate-operation'),
                rows: 2
            });
            this.textareaCalculateOperation.$el.find('textarea').attr('readonly', '');
            this.textareaCalculateOperation.getFields = function() {
                return me.textareaCalculateOperation._fields || [];
            };
            this.textareaCalculateOperation.setFields = function(fields) {
                !fields && (fields = []);
                me.textareaCalculateOperation._fields = fields;
                me.textareaCalculateOperation.setValue(fields.join(', '));

                const calculate = me._changedProps.asc_getCalculate();
                calculate && calculate.asc_putNames(fields);
            };

            this.btnCalculateSelectFields = new Common.UI.Button({
                el: $('#format-settings-btn-calculate-select-fields')
            });
            this.btnCalculateSelectFields.on('click', function() {
                const win = new PDFE.Views.FormSettingsSelectFields({
                    description: me.textSelectFieldsForCalc,
                    items: me.api.GetAllFieldsNames(),
                    defaultCheckedItems: me.textareaCalculateOperation.getFields(),
                    handler: function(state, result) {
                        if(state == 'ok' && result) {
                            me.textareaCalculateOperation.setFields(result.selectedFields);
                        }
                    }
                });
                me.openExtraWindow(win, me.btnCalculateSelectFields);
            })

            this.radioCalculateScript = new Common.UI.RadioBox({
                el: $('#format-settings-radio-calculate-script'),
                name: 'form-settings-calculate',
                labelText: this.textCalculateScript
            });
            this.radioCalculateScript.on('change', _.bind(this.onCalculateTypeChange, this, 'script'));

            this.textareaCalculateScript = new Common.UI.TextareaField({
                el: $('#format-settings-textarea-calculate-script'),
                rows: 5
            });
            this.textareaCalculateScript.$el.find('textarea').attr('readonly', '');

            this.btnCalculateScript = new Common.UI.Button({
                el: $('#format-settings-btn-calculate-script')
            });
            this.btnCalculateScript.on('click', function() {
                const calculate = me._changedProps.asc_getCalculate();
                const win = new PDFE.Views.FormSettingsCodeEditor({
                    defaultValue: calculate && calculate.asc_getScript() || '',
                    handler: function(state, result) {
                        if(state == 'ok') {
                            calculate && calculate.asc_putScript(result);
                            me.textareaCalculateScript.setValue(result);
                        }
                    }
                });
                me.openExtraWindow(win, me.btnCalculateScript);
            });

            //Actions
            this.cmbActionsTriggers = new Common.UI.ComboBox({
                el: $('#format-settings-cmb-actions-triggers'),
                cls: 'input-group-nr',
                style: 'width: 100%;',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: _.map(this.getActionTriggersNames(), function(name, key) {
                    return {displayValue: name, value: +key}
                }),
                takeFocusOnClose: true
            });
            this.cmbActionsTriggers.setValue(AscPDF.PDF_TRIGGERS_TYPES.mouseUp, true);

            this.cmbActions = new Common.UI.ComboBox({
                el: $('#format-settings-cmb-actions'),
                cls: 'input-group-nr',
                style: 'width: 100%;',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: _.map(this.getActionsNames(), function(name, key) {
                    return {displayValue: name, value: +key}
                }),
                takeFocusOnClose: true
            });
            this.cmbActions.setValue(AscPDF.ACTIONS_TYPES.GoTo, true);

            this.btnActionsAdd = new Common.UI.Button({
                el: $('#format-settings-btn-actions-add')
            });
            this.btnActionsAdd.on('click', _.bind(this.onActionsListAdd, this));

            this.btnActionsUp = new Common.UI.Button({
                parentEl: $('#format-settings-btn-actions-up', this.$window),
                cls: 'btn-toolbar bg-white',
                iconCls: 'caret-up',
                disabled: true,
                scaling: false
            });
            this.btnActionsUp.on('click', _.bind(this.onActionsListMove, this, -1));
            
            this.btnActionsDown = new Common.UI.Button({
                parentEl: $('#format-settings-btn-actions-down', this.$window),
                cls: 'btn-toolbar bg-white',
                iconCls: 'caret-down',
                disabled: true,
                scaling: false
            });
            this.btnActionsDown.on('click', _.bind(this.onActionsListMove, this, 1));

            this.btnActionsEdit = new Common.UI.Button({
                el: $('#format-settings-btn-actions-edit'),
                disabled: true
            });
            this.btnActionsEdit.on('click', _.bind(this.onActionsListEdit, this));
            
            this.btnActionsDelete = new Common.UI.Button({
                el: $('#format-settings-btn-actions-delete'),
                disabled: true
            });
            this.btnActionsDelete.on('click', _.bind(this.onActionsListDelete, this));

            this.actionsList = new Common.UI.TreeView({
                el: $('#format-settings-list-actions'),
                store: new Common.UI.TreeViewStore(),
                enableKeyEvents: true,
                tabindex: 1
            });
            this.actionsList.on('item:select', _.bind(this.onActionsListSelect, this));

            var arr = [];
            this.api.asc_getFieldDateFormatOptions().forEach(function(item){
                arr.push({
                    value: item,
                    displayValue: item
                });
            });
            this.dateFormats = arr.concat({value: '', displayValue: this.txtCustom, isCustom: true});

            arr = [];
            var timearr = this.api.asc_getFieldTimeFormatOptions(),
                valarr = [];
            for (let str in timearr) {
                if(timearr.hasOwnProperty(str)) {
                    arr.push({
                        value: timearr[str],
                        displayValue: str
                    });
                    valarr[timearr[str]] = str;
                }
            }
            this.timeFormats = arr;
            this.timeVal2Str = valarr;

            this._decimalPanel      = this.$window.find('.format-decimal');
            this._numberPanel     = this.$window.find('.format-number');
            this._separatorPanel    = this.$window.find('.format-separator');
            this._specialPanel         = this.$window.find('.form-special');
            this._maskPanel      = this.$window.find('.form-special-mask');
            this._datePanel         = this.$window.find('.format-date-time');
            this._examplePanel       = this.$window.find('.format-example');
            this._customPanel       = this.$window.find('.format-custom');

            this.lblExample         = this.$window.find('#format-settings-label-example');

            this.afterRender();
            this.setActiveCategory(0);
        },

        getFocusedComponents: function() {
            return this.btnsCategory.concat([
                //Format tab
                this.cmbFormat, this.spnDecimal, this.cmbSeparator, this.cmbSymbols, this.cmbLocation, 
                this.chParens, this.chRed, this.dateTimeList, this.inputCustomFormat, this.cmbSpecial, this.txtMask, 
                this.textareaFormat, this.btnFormatScript, this.textareaKeystroke, this.btnKeystrokeScript,

                //Validate tab
                this.radioValidateNone, this.radioValidateRange, this.spnValidateMin, this.spnValidateMax, 
                this.radioValidateScript, this.textareaValidateScript, this.btnValidateScript,

                //Calculate tab
                this.radioCalculateNone, this.radioCalculateOperation, this.cmbCalculateOperation, 
                this.textareaCalculateOperation, this.btnCalculateSelectFields, 
                this.radioCalculateScript, this.textareaCalculateScript, this.btnCalculateScript,

                //Actions tab
                this.cmbActionsTriggers, this.cmbActions, this.btnActionsAdd, 
                this.btnActionsUp, this.btnActionsDown, this.btnActionsEdit, this.btnActionsDelete, this.actionsList
            ]).concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            const firstPanel = this.options.items[0]; 
            if(!firstPanel) return null;

            if(firstPanel.panelId == 'id-adv-form-format') return this.cmbFormat;
            else if(firstPanel.panelId == 'id-adv-form-validate') return this.radioValidateNone;
            else if(firstPanel.panelId == 'id-adv-form-calculate') return this.radioCalculateNone;
            else if(firstPanel.panelId == 'id-adv-form-actions') return this.cmbActionsTriggers;
            else return null;
        },

        afterRender: function() {
            this._setDefaults(this.props, this.actionsProps);
        },

        show: function() {
            Common.Views.AdvancedSettingsWindow.prototype.show.apply(this, arguments);
        },

        _setDefaults: function (specProps, actionsProps) {
            if (specProps) {
                const me = this;
                // Format
                let format = actionsProps.asc_getFormat();
                !format && (format = actionsProps.asc_getKeystroke());
                let val = format ? format.asc_getType() : AscPDF.FormatType.NONE;
                this.cmbFormat.setValue((val !== null && val !== undefined) ? val : AscPDF.FormatType.NONE, '');
                this.FormatType=val;
                this.onFormatSelect(this.cmbFormat, this.cmbFormat.getSelectedRecord());
                
                if (this.FormatType===AscPDF.FormatType.SPECIAL) {
                    val = format.asc_getFormat();
                    this._state.SpecialType = (val===undefined) ? -1 : val;
                }

                if (this.FormatType===AscPDF.FormatType.DATE || this.FormatType===AscPDF.FormatType.TIME) {
                    val = format.asc_getFormat();
                    var selectedItem = this.dateTimeList.store.findWhere({value: val});
                    this.inputCustomFormat.setVisible(this.FormatType===AscPDF.FormatType.DATE && !selectedItem);
                    if(this.FormatType===AscPDF.FormatType.DATE && !selectedItem) {
                        selectedItem = this.dateTimeList.store.findWhere({isCustom: true});
                        selectedItem && selectedItem.set({value: val});
                        this.inputCustomFormat.setValue(val);
                        this._state.DateFormatCustom = val;
                    }
                    if(selectedItem) {
                        this.dateTimeList.selectRecord(selectedItem);
                        this.dateTimeList.scrollToRecord(selectedItem);
                    }
                    this._state[this.FormatType===AscPDF.FormatType.DATE ? 'DateFormat' : 'TimeFormat'] = val;
                } else if (this.FormatType===AscPDF.FormatType.NUMBER || this.FormatType===AscPDF.FormatType.PERCENTAGE) {
                    this.spnDecimal.setValue(format.asc_getDecimals());
                    this.cmbSeparator.setValue(format.asc_getSepStyle(), '');
                    if (this.FormatType===AscPDF.FormatType.NUMBER) {
                        val = format.asc_getCurrency();
                        this.cmbSymbols.setValue(val ? val.trim() : null, '');
                        this.cmbLocation.setDisabled(!val);
                        if (val && val.indexOf(' ')===-1)
                            this.cmbLocation.setValue(format.asc_getCurrencyPrepend() ? 1 : 3);
                        else
                            this.cmbLocation.setValue(format.asc_getCurrencyPrepend() ? 0 : 2);
                        val = format.asc_getNegStyle();
                        this._state.NegStyle = val;
                        this.chParens.setValue(val===AscPDF.NegativeStyle.PARENS_BLACK || val===AscPDF.NegativeStyle.PARENS_RED, true);
                        this.chRed.setValue(val===AscPDF.NegativeStyle.RED_MINUS || val===AscPDF.NegativeStyle.PARENS_RED, true);
                    }
                } if (this.FormatType===AscPDF.FormatType.SPECIAL) {
                    this.cmbSpecial.setValue(this._state.SpecialType, '');
                    if (this._state.SpecialType===-1) {
                        this._state.Mask = format.asc_getMask() || '';
                        this.txtMask.setValue(this._state.Mask);
                    }
                } if(this.FormatType===AscPDF.FormatType.CUSTOM) {
                    const origFormat = actionsProps.asc_getFormat();
                    const origKeystroke = actionsProps.asc_getKeystroke();
                    origFormat && this.textareaFormat.setValue(origFormat.asc_getScript());
                    origKeystroke && this.textareaKeystroke.setValue(origKeystroke.asc_getScript());
                }
                this.updateChangedProps();
                this.updateFormatExample();

                // Validate
                const validate = actionsProps.asc_getValidate();
                let radioField = this.radioValidateNone; 
                if(validate) {
                    val = validate.asc_getGreaterThen();
                    if(val != null) {
                        this.spnValidateMin.setValue(val, true);
                        radioField = this.radioValidateRange;
                    }

                    val = validate.asc_getLessThen();
                    if(val != null) {
                        this.spnValidateMax.setValue(val, true);
                        radioField = this.radioValidateRange;
                    }

                    val = validate.asc_getScript();
                    if(val != null) {
                        this.textareaValidateScript.setValue(val, true);
                        radioField = this.radioValidateScript;
                    }
                }
                radioField.setValue(true);

                //Calculate
                const calculate = actionsProps.asc_getCalculate();
                radioField = this.radioCalculateNone; 
                if(calculate) {
                    val = calculate.asc_getType();
                    this.cmbCalculateOperation.setValue(val);

                    val = calculate.asc_getNames();
                    if(val && val.length > 0) {
                        this.textareaCalculateOperation.setFields(val);
                        radioField = this.radioCalculateOperation;
                    }

                    val = calculate.asc_getScript();
                    if(val != null) {
                        this.textareaCalculateScript.setValue(val, true);
                        radioField = this.radioCalculateScript;
                    }
                }
                radioField.setValue(true);

                //Actinos
                this.getActionTriggers().forEach(function(item) {
                    const trigger = me.actionsProps[item.getter]();
                    if(trigger) {
                        const copyCollection = new Asc.asc_CPdfActionCollectionProperty();
                        const copyActions = [];
                        (trigger.asc_getActions() || []).forEach(function(action) {
                            const copyAction = me._copyAction(action);
                            copyAction && copyActions.push(copyAction);
                        });
                        copyCollection.asc_putActions(copyActions);
                        me._changedProps[item.setter](copyCollection);
                    }
                });
                this.updateActionsList();
            }
        },

        setFormatType: function(type) {
            this.cmbFormat.setValue(type);
            this.onFormatSelect(this.cmbFormat, this.cmbFormat.getSelectedRecord());
            this.updateChangedProps();
        },

        getSettings: function () {
            return {FormatType: this.FormatType, actionsProps: this._changedProps};
        },

        getSymbolValue: function() {
            let symbol = this.cmbSymbols.getValue();
            const location = this.cmbLocation.getValue();
            if (symbol && (location===0 || location===2)) {
                symbol = location===0 ? symbol + ' ' : ' ' + symbol;
            }
            return symbol || '';
        },

        getActionTriggers: function() {
            return [{type: AscPDF.PDF_TRIGGERS_TYPES.mouseDown, getter: 'asc_getMouseDown', setter: 'asc_putMouseDown'},
                {type: AscPDF.PDF_TRIGGERS_TYPES.mouseEnter, getter: 'asc_getMouseEnter', setter: 'asc_putMouseEnter'},
                {type: AscPDF.PDF_TRIGGERS_TYPES.mouseExit, getter: 'asc_getMouseExit', setter: 'asc_putMouseExit'},
                {type: AscPDF.PDF_TRIGGERS_TYPES.mouseUp, getter: 'asc_getMouseUp', setter: 'asc_putMouseUp'},
                {type: AscPDF.PDF_TRIGGERS_TYPES.onBlur, getter: 'asc_getOnBlur', setter: 'asc_putOnBlur'},
                {type: AscPDF.PDF_TRIGGERS_TYPES.onFocus, getter: 'asc_getOnFocus', setter: 'asc_putOnFocus'}
            ];
        },

        getActionTriggersNames: function() {
            return {
                [AscPDF.PDF_TRIGGERS_TYPES.mouseUp]: this.textMouseUp,
                [AscPDF.PDF_TRIGGERS_TYPES.mouseDown]: this.textMouseDown,
                [AscPDF.PDF_TRIGGERS_TYPES.mouseEnter]: this.textMouseEnter,
                [AscPDF.PDF_TRIGGERS_TYPES.mouseExit]: this.textMouseExit,
                [AscPDF.PDF_TRIGGERS_TYPES.onFocus]: this.textOnFocus,
                [AscPDF.PDF_TRIGGERS_TYPES.onBlur]: this.textOnBlur
            }
        },

        getActionsNames: function() {
            return {
                [AscPDF.ACTIONS_TYPES.Named]: this.textNavigation,
                [AscPDF.ACTIONS_TYPES.GoTo]: this.textGoToPageView,
                [AscPDF.ACTIONS_TYPES.URI]: this.textOpenWebLink,
                [AscPDF.ACTIONS_TYPES.ResetForm]: this.textResetForm,
                [AscPDF.ACTIONS_TYPES.HideShow]: this.textShowHideField,
                [AscPDF.ACTIONS_TYPES.JavaScript]: this.textRunJavaScript,
            }
        },

        onDlgBtnClick: function(event) {
            var me = this;
            var state = (typeof(event) == 'object') ? event.currentTarget.attributes['result'].value : event;
            if (state == 'ok') {
                this.handler && this.handler.call(this, state,  (state == 'ok') ? this.getSettings() : undefined);
            }

            this.close();
        },

        onPrimary: function() {
            this.onDlgBtnClick('ok');
            return false;
        },

        updateFormatExample: function() {
            let str = '';
            switch (this.FormatType) {
                case AscPDF.FormatType.NUMBER:
                    const location = this.cmbLocation.getValue();
                    const symbol = this.getSymbolValue();
                    str = this.api.asc_getFieldNumberFormatExample(this.spnDecimal.getNumberValue(), this.cmbSeparator.getValue(), this._state.NegStyle, symbol || '', location<2);
                    break;
                case AscPDF.FormatType.PERCENTAGE:
                    str = this.api.asc_getFieldPercentFormatExample(this.spnDecimal.getNumberValue(), this.cmbSeparator.getValue());
                    break;
                case AscPDF.FormatType.DATE:
                    str = this.api.asc_getFieldDateTimeFormatExample(this._state.DateFormat);
                    break;
                case AscPDF.FormatType.TIME:
                    str = this.api.asc_getFieldDateTimeFormatExample(this.timeVal2Str[this._state.TimeFormat]);
                    break;
            }
            this.lblExample.toggleClass('red-color', this.FormatType===AscPDF.FormatType.NUMBER && (this._state.NegStyle===AscPDF.NegativeStyle.PARENS_RED || this._state.NegStyle===AscPDF.NegativeStyle.RED_MINUS));
            this.lblExample.text(str);
        },

        putFormatPropValue: function(methodName, value, type) {
            const format = this._changedProps.asc_getFormat();
            const keystroke = this._changedProps.asc_getKeystroke();
            if((!type || type == 'format') && format && format[methodName]) {
                format[methodName](value);
            }
            if((!type || type == 'keystroke') && keystroke && keystroke[methodName]) {
                keystroke[methodName](value);
            }
        },

        updateChangedProps: function() {
            let format, keystroke;
            switch(this.FormatType) {
                case AscPDF.FormatType.NONE:
                    format = undefined;
                    keystroke = undefined;
                    break;
                case AscPDF.FormatType.NUMBER:
                    format = new Asc.asc_CFieldNumberFormatProperty();
                    keystroke = new Asc.asc_CFieldNumberFormatProperty();
                    break;
                case AscPDF.FormatType.PERCENTAGE:
                    format = new Asc.asc_CFieldPercentageFormatProperty();
                    keystroke = new Asc.asc_CFieldPercentageFormatProperty();
                    break;
                case AscPDF.FormatType.DATE:
                    format = new Asc.asc_CFieldDateFormatProperty();
                    keystroke = new Asc.asc_CFieldDateFormatProperty();
                    break;
                case AscPDF.FormatType.TIME:
                    format = new Asc.asc_CFieldTimeFormatProperty();
                    keystroke = new Asc.asc_CFieldTimeFormatProperty();
                    break;
                case AscPDF.FormatType.SPECIAL:
                    format = new Asc.asc_CFieldSpecialFormatProperty();
                    keystroke = new Asc.asc_CFieldSpecialFormatProperty();
                    break;
                case AscPDF.FormatType.CUSTOM:
                    format = new Asc.asc_CFieldCustomFormatProperty();
                    keystroke = new Asc.asc_CFieldCustomFormatProperty();
                    break;
            }
            this._changedProps.asc_putFormat(format);
            this._changedProps.asc_putKeystroke(keystroke);

            this.putFormatPropValue('asc_putDecimals', this.spnDecimal.getNumberValue());
            this.putFormatPropValue('asc_putSepStyle', this.cmbSeparator.getValue());
            this.putFormatPropValue('asc_putCurrency', this.getSymbolValue());
            this.putFormatPropValue('asc_putCurrencyPrepend', this.cmbLocation.getValue() < 2);
            this.putFormatPropValue('asc_putScript', this.textareaFormat.getValue(), 'format');
            this.putFormatPropValue('asc_putScript', this.textareaKeystroke.getValue(), 'keystroke');
            this.putFormatPropValue('asc_putNegStyle', this._state.NegStyle);
            if(this.FormatType===AscPDF.FormatType.DATE) {
                this.putFormatPropValue('asc_putFormat', this._state.DateFormat);
            } else if(this.FormatType===AscPDF.FormatType.TIME) {
                this.putFormatPropValue('asc_putFormat', this._state.TimeFormat);
            } else if(this.FormatType===AscPDF.FormatType.SPECIAL) {
                this.putFormatPropValue('asc_putFormat', this._state.SpecialType);
                this.putFormatPropValue('asc_putMask', this._state.SpecialType == -1 ? this._state.Mask : undefined);
                this._maskPanel.toggleClass('hidden', this._state.SpecialType!==-1);
            }
        },

        updateActionsList: function() {
            const me = this;
            const actionTreeItems = [];
            let index = 0;
            this.getActionTriggers().forEach(function(item) {
                const trigger = me._changedProps[item.getter]();
                const actions = (trigger ? trigger.asc_getActions() : null);
                if(actions && actions.length > 0) {
                    actionTreeItems.push(new Common.UI.TreeViewModel({
                        name : me.getActionTriggersNames()[item.type] || '',
                        level: 0,
                        hasParent: false,
                        hasSubItems: true,
                        isTrigger: true,
                        trigger: trigger,
                        index: index
                    }));
                    index += 1;
                    actions.forEach(function(action, i) {
                        actionTreeItems.push(new Common.UI.TreeViewModel({
                            name : me.getActionsNames()[action.asc_getType()] || '',
                            level: 1,
                            hasParent: true,
                            hasSubItems: false,
                            isFirstAtParent: i == 0,
                            isLastAtParent: i == (actions.length - 1),
                            isAction: true,
                            trigger: trigger,
                            action: action,
                            index: index
                        }));
                        index += 1;
                    });
                }
            });

            this.actionsList.store.reset(actionTreeItems);
        },

        openExtraWindow: function(win, elementToFocus) {
            const me = this;
            const windowsRect = {
                main: Common.Utils.getBoundingClientRect(this.$window[0]),
                new: null
            };
            win.show();
            
            //Windows may have a scale value due to a fade-in animation
            const getScaleFromMatrix = function($el) {
                const transform = $el.css('transform');
                if (!transform || transform === 'none') return { x: 1, y: 1 };

                const m = transform.match(/matrix\((.+)\)/);
                const values = !!m ? m[1].split(', ').map(parseFloat) : null;
                if (!values) return { x: 1, y: 1 };

                return {
                    x: values[0],
                    y: values[3],
                };
            };

            // Move the new window to the position of the main window
            const newWinScale = getScaleFromMatrix(win.$window);
            windowsRect.new = Common.Utils.getBoundingClientRect(win.$window[0]);

            const winW = windowsRect.new.width / newWinScale.x;
            const winH = windowsRect.new.height / newWinScale.y;

            let left = windowsRect.main.left + (windowsRect.main.width - winW) / 2;
            let top  = windowsRect.main.top  + (windowsRect.main.height - winH) / 2;

            // Clamp to browser viewport bounds
            const vpW = window.innerWidth;
            const vpH = window.innerHeight;

            left = Math.max(0, Math.min(left, vpW - winW));
            top  = Math.max(0, Math.min(top,  vpH - winH));

            win.setPosition(left, top);

            win.on('close', function() {
                me.show();
                elementToFocus && setTimeout(function(){ elementToFocus.focus(); }, 100);
            });

            this.hide();
        },

        applyActionEdit: function(action, callback) {
            const isEdit = (typeof action == 'object');
            const actionType = (isEdit ? action.asc_getType() : action);
            const me = this;

            switch(actionType) {
                case AscPDF.ACTIONS_TYPES.Named: {
                    !isEdit && (action = new Asc.asc_CPdfActionNamedProperty());

                    const win = new PDFE.Views.FormSettingsSelectNamedAction({
                        defaultSelectedItem: action.asc_getName(),
                        handler: function(state, selectedField) {
                            if(state == 'ok') {
                                action.asc_putName(selectedField);
                                callback && callback(action);
                            }
                        }
                    });
                    me.openExtraWindow(win, (isEdit ? me.btnActionsEdit : me.btnActionsAdd));
                    break;
                }
                case AscPDF.ACTIONS_TYPES.GoTo: {
                    !isEdit && (action = new Asc.asc_CPdfActionGoToProperty());

                    const statusbarController = PDFE.getController('Statusbar');
                    const stateBeforeOpenDlg = {
                        zoom: statusbarController.getZoom(),
                        scroll: this.api.getCurScroll()
                    };

                    this.hide();
                    Common.NotificationCenter.trigger('editing:disable', true, {
                        viewMode: true,
                        allowSignature: false,
                        statusBar: true,
                        rightMenu: {clear: true, disable: true},
                        leftMenu: {disable: true, previewMode: true},
                        fileMenu: {protect: true},
                        navigation: {disable: true, previewMode: true},
                        comments: {disable: true, previewMode: true},
                        chat: true,
                        viewport: true,
                        documentHolder: {clear: true, disable: true},
                        toolbar: true,
                        plugins: false,
                        header: {docmode: true, search: true},
                        shortcuts: true
                    }, 'setlink');
                    Common.UI.alert({
                        modal: false,
                        maxwidth: 400,
                        title: this.textCreateGoToView,
                        msg: this.textCreateGoToViewDesc,
                        buttons: [  
                            {caption: this.textSetLink, primary: true, value: 'ok'},
                            'cancel'
                        ],
                        callback: function(btn){
                            if (btn === 'ok') {
                                const goToActionProps = me.api.asc_getCurGoToActionProps();
                                goToActionProps && me._copyAction(goToActionProps, action);
                                callback && callback(action);
                            }
                            Common.NotificationCenter.trigger('editing:disable', false, {
                                viewMode: false,
                                allowSignature: false,
                                statusBar: true,
                                rightMenu: {clear: true, disable: true},
                                leftMenu: {disable: true, previewMode: true},
                                fileMenu: {protect: true},
                                navigation: {disable: true, previewMode: true},
                                comments: {disable: true, previewMode: true},
                                chat: true,
                                viewport: true,
                                documentHolder: {clear: true, disable: true},
                                toolbar: true,
                                plugins: false,
                                header: {docmode: true, search: true},
                                shortcuts: true
                            }, 'setlink');

                            //Restore zoom and scroll state 
                            const currentScroll = me.api.getCurScroll();
                            if(statusbarController.getZoom() != stateBeforeOpenDlg.zoom) {
                                me.api.zoom(stateBeforeOpenDlg.zoom);
                            }
                            if (Math.abs(currentScroll.x - stateBeforeOpenDlg.scroll.x) > 1 || 
                                Math.abs(currentScroll.y - stateBeforeOpenDlg.scroll.y) > 1) 
                            {
                                me.api.scrollToXY(stateBeforeOpenDlg.scroll.x, stateBeforeOpenDlg.scroll.y);
                            }

                            me.show();
                            setTimeout(function(){ (isEdit ? me.btnActionsEdit : me.btnActionsAdd).focus(); }, 100);
                        }
                    });
                    break;
                }
                case AscPDF.ACTIONS_TYPES.URI: {
                    !isEdit && (action = new Asc.asc_CPdfActionUriProperty());

                    const win = new Common.Views.TextInputDialog({
                        title: me.textEditUrl,
                        label: me.textUrlForThisLink,
                        value: action.asc_getUri(),
                        width: 400,
                        height: 'auto',
                        inputConfig: {
                            allowBlank  : false,
                            validation: function(value) {
                                return value.trim().length > 0 ? true : '';
                            }
                        },
                        handler: function(result, value) {
                            if (result == 'ok') {
                                action.asc_putUri(value.trim());
                                callback && callback(action);
                            }
                        }
                    });
                    me.openExtraWindow(win, (isEdit ? me.btnActionsEdit : me.btnActionsAdd));
                    break;
                }
                case AscPDF.ACTIONS_TYPES.ResetForm: {
                    if(!isEdit) {
                        action = new Asc.asc_CPdfActionResetProperty();
                        action.asc_putIsAllExcept(true);
                    }

                    const items = me.api.GetAllFieldsNames();
                    let defaultCheckedItems = action.asc_getNames();
                    if(action.asc_getIsAllExcept()) {
                        defaultCheckedItems = items.filter(function(field) {
                            return !defaultCheckedItems.includes(field);
                        });
                    }
                    const win = new PDFE.Views.FormSettingsSelectFields({
                        description: me.textSelectFieldsToReset,
                        items: items,
                        defaultCheckedItems: defaultCheckedItems || [],
                        handler: function(state, result) {
                            if(state == 'ok' && result) {
                                if(action.asc_getIsAllExcept()) {
                                    action.asc_putNames(items.filter(function(field) {
                                        return !result.selectedFields.includes(field);
                                    }));
                                } else {
                                    action.asc_putNames(result.selectedFields);
                                }
                                callback && callback(action);
                            }
                        }
                    });
                    me.openExtraWindow(win, (isEdit ? me.btnActionsEdit : me.btnActionsAdd));
                    break;
                }
                case AscPDF.ACTIONS_TYPES.HideShow: {
                    !isEdit && (action = new Asc.asc_CPdfActionHideShowProperty());

                    const win = new PDFE.Views.FormSettingsSelectFields({
                        description: me.textSelectFieldsToShowHide,
                        items: me.api.GetAllFieldsNames(),
                        defaultCheckedItems: action.asc_getNames() || [],
                        defaultRadioValue: !isEdit || action.asc_getIsHide() ? 'hide' : 'show',
                        showRadio: true,
                        handler: function(state, result) {
                            if(state == 'ok' && result) {
                                action.asc_putNames(result.selectedFields);
                                action.asc_putIsHide(result.radioValue == 'hide');
                                callback && callback(action);
                            }
                        }
                    });
                    me.openExtraWindow(win, (isEdit ? me.btnActionsEdit : me.btnActionsAdd));
                    break;
                }
                case AscPDF.ACTIONS_TYPES.JavaScript: {
                    !isEdit && (action = new Asc.asc_CPdfActionJsProperty());

                    const win = new PDFE.Views.FormSettingsCodeEditor({
                        defaultValue: action.asc_getScript() || '',
                        handler: function(state, value) {
                            if(state == 'ok') {
                                action.asc_putScript(value);
                                callback && callback(action);
                            }
                        }
                    });
                    me.openExtraWindow(win, (isEdit ? me.btnActionsEdit : me.btnActionsAdd));
                    break;
                }
            }
        },

        _copyAction: function(sourceAction, targetAction) {
            const needCreateTarget = !targetAction || sourceAction.asc_getType() != targetAction.asc_getType();

            switch(sourceAction.asc_getType()) {
                case AscPDF.ACTIONS_TYPES.Named: {
                    needCreateTarget && (targetAction = new Asc.asc_CPdfActionNamedProperty());
                    targetAction.asc_putName(sourceAction.asc_getName());
                    break;
                }
                case AscPDF.ACTIONS_TYPES.GoTo: {
                    needCreateTarget && (targetAction = new Asc.asc_CPdfActionGoToProperty());
                    targetAction.asc_putGoToType(sourceAction.asc_getGoToType());
                    targetAction.asc_putPage(sourceAction.asc_getPage());
                    targetAction.asc_putZoom(sourceAction.asc_getZoom());
                    targetAction.asc_putRect(sourceAction.asc_getRect());
                    break;
                }
                case AscPDF.ACTIONS_TYPES.URI: {
                    needCreateTarget && (targetAction = new Asc.asc_CPdfActionUriProperty());
                    targetAction.asc_putUri(sourceAction.asc_getUri());
                    break;
                }
                case AscPDF.ACTIONS_TYPES.ResetForm: {
                    needCreateTarget && (targetAction = new Asc.asc_CPdfActionResetProperty());
                    targetAction.asc_putIsAllExcept(sourceAction.asc_getIsAllExcept());
                    targetAction.asc_putNames(sourceAction.asc_getNames());
                    break;
                }
                case AscPDF.ACTIONS_TYPES.HideShow: {
                    needCreateTarget && (targetAction = new Asc.asc_CPdfActionHideShowProperty());
                    targetAction.asc_putIsHide(sourceAction.asc_getIsHide());
                    targetAction.asc_putNames(sourceAction.asc_getNames());
                    break;
                }
                case AscPDF.ACTIONS_TYPES.JavaScript: {
                    needCreateTarget && (targetAction = new Asc.asc_CPdfActionJsProperty());
                    targetAction.asc_putScript(sourceAction.asc_getScript());
                    break;
                }
            }
            return targetAction;
        },

        onNegativeChange: function(field, newValue, oldValue, eOpts){
            var isRed = this.chRed.getValue()==='checked',
                isParens = this.chParens.getValue()==='checked';
            this._state.NegStyle = isRed ? (isParens ? AscPDF.NegativeStyle.PARENS_RED : AscPDF.NegativeStyle.RED_MINUS) :
                                            isParens ? AscPDF.NegativeStyle.PARENS_BLACK : AscPDF.NegativeStyle.BLACK_MINUS;
            this.putFormatPropValue('asc_putNegStyle', this._state.NegStyle);
            this.updateFormatExample();
        },

        onDateTimeListSelect: function(listView, itemView, record){
            if (!record) return;
            const isDate = this.FormatType===AscPDF.FormatType.DATE;
            const isCustom = isDate && !!record.get('isCustom');
            const value = isCustom ? this.inputCustomFormat.getValue() : record.get('value');

            this.inputCustomFormat.setVisible(isCustom);
            isCustom && this.inputCustomFormat.setValue(this._state.DateFormatCustom);
            this._state[this.FormatType===AscPDF.FormatType.DATE ? 'DateFormat' : 'TimeFormat'] = value;
            this.putFormatPropValue('asc_putFormat', value);
            this.updateFormatExample();
        },

        onSpecialChanged: function(combo, record) {
            this._state.SpecialType = record.value;
            this._maskPanel.toggleClass('hidden', this._state.SpecialType!==-1);
            if(this._state.SpecialType===-1) {
                this.txtMask.setValue(this._state.Mask);
                this.putFormatPropValue('asc_putMask', this._state.Mask);
            } else {
                this.putFormatPropValue('asc_putMask', undefined);
            }
            this.putFormatPropValue('asc_putFormat', this._state.SpecialType);
            this.updateFormatExample();
        },

        onValidateTypeChange: function(type, field, newValue) {
            let min, max, script;
            let validate = this._changedProps.asc_getValidate();
            if(!validate) {
                this._changedProps.asc_putValidate(new Asc.asc_CFieldValidateProperty());
                validate = this._changedProps.asc_getValidate();
            }
            
            if(type == 'range') {
                let val = this.spnValidateMin.getNumberValue();
                min = Number.isNaN(val) ? undefined : val;
                
                val = this.spnValidateMax.getNumberValue();
                max = Number.isNaN(val) ? undefined : val;
                
                if(min != null && max != null) {
                    const tempMin = min;
                    min = Math.min(min, max);
                    max = Math.max(tempMin, max);
                }

                script = undefined;
            } else if(type == 'script') {
                script = this.textareaValidateScript.getValue();
            }
            validate.asc_putGreaterThen(min);
            validate.asc_putLessThen(max);
            validate.asc_putScript(script);

            this.spnValidateMin.setDisabled(type != 'range');
            this.spnValidateMax.setDisabled(type != 'range');
            this.textareaValidateScript.setDisabled(type != 'script');
        },

        onValidateRangeChange: function() {
            const validate = this._changedProps.asc_getValidate();
            if(validate) {
                let val = this.spnValidateMin.getNumberValue();
                let min = Number.isNaN(val) ? undefined : val;
                
                val = this.spnValidateMax.getNumberValue();
                let max = Number.isNaN(val) ? undefined : val;
    
                if(min != null && max != null) {
                    const tempMin = min;
                    min = Math.min(min, max);
                    max = Math.max(tempMin, max);
                }
    
                validate.asc_putGreaterThen(min);
                validate.asc_putLessThen(max);
            }
        },

        onCalculateTypeChange: function(type, field, newValue) {
            let operation, names, script;
            let calculate = this._changedProps.asc_getCalculate();
            if(!calculate) {
                this._changedProps.asc_putCalculate(new Asc.asc_CFieldCalculateProperty());
                calculate = this._changedProps.asc_getCalculate();
            }
            
            if(type == 'operation') {
                operation = this.cmbCalculateOperation.getValue();
                names = this.textareaCalculateOperation.getFields();
                script = undefined;
            } else if(type == 'script') {
                script = this.textareaCalculateScript.getValue();
            }
            calculate.asc_putType(operation);
            calculate.asc_putNames(names || []);
            calculate.asc_putScript(script);

            this.cmbCalculateOperation.setDisabled(type != 'operation');
            this.textareaCalculateOperation.setDisabled(type != 'operation');
            this.btnCalculateSelectFields.setDisabled(type != 'operation');
            this.textareaCalculateScript.setDisabled(type != 'script');
            this.btnCalculateScript.setDisabled(type != 'script');
        },
        
        onFormatSelect: function(combo, record) {
            if (!record) return;

            this.FormatType = record.value;

            var isNumber = this.FormatType === AscPDF.FormatType.NUMBER,
                isPercent = this.FormatType === AscPDF.FormatType.PERCENTAGE,
                isNumeric = isNumber || isPercent;

            this._decimalPanel.toggleClass('hidden', !(isNumber || isPercent));
            this._separatorPanel.toggleClass('hidden', !(isNumber || isPercent));
            this._numberPanel.toggleClass('hidden', !isNumber);
            this._specialPanel.toggleClass('hidden', this.FormatType!==AscPDF.FormatType.SPECIAL);
            this._customPanel.toggleClass('hidden', this.FormatType!==AscPDF.FormatType.CUSTOM);
            this._maskPanel.toggleClass('hidden', !(this.FormatType===AscPDF.FormatType.SPECIAL && this._state.SpecialType===-1));
            if (this.FormatType===AscPDF.FormatType.SPECIAL && this._state.SpecialType===-1)
                this.txtMask.setValue(this._state.Mask);

            this._datePanel.toggleClass('hidden', !(this.FormatType===AscPDF.FormatType.DATE || this.FormatType===AscPDF.FormatType.TIME));
            if (this.FormatType===AscPDF.FormatType.DATE || this.FormatType===AscPDF.FormatType.TIME) {
                this.dateTimeList.$el[0].style.height = this.FormatType===AscPDF.FormatType.DATE ? "184px" : "116px";
                this.dateTimeList.store.reset(this.FormatType===AscPDF.FormatType.DATE ? this.dateFormats : this.timeFormats);
                this.dateTimeList.selectRecord(this.dateTimeList.store.at(this.FormatType===AscPDF.FormatType.DATE ? 1 : 0));
                this.dateTimeList.scrollToRecord(this.dateTimeList.store.at(0));
                this.inputCustomFormat.setVisible(false);
            }
            this._examplePanel.toggleClass('hidden', this.FormatType===AscPDF.FormatType.SPECIAL || this.FormatType===AscPDF.FormatType.NONE || this.FormatType===AscPDF.FormatType.CUSTOM);
            this.updateFormatExample();

            
            if(!isNumeric && this.radioValidateRange.getValue()) {
                this.radioValidateNone.setValue(true);
            }
            this.radioValidateRange.setDisabled(!isNumeric);
        },

        onActionsListMove: function(direction) {
            const selectedItem = this.actionsList.getSelectedRec();
            if(!selectedItem) return;

            const trigger = selectedItem.get('trigger');
            const actions = trigger.asc_getActions();
            const action = selectedItem.get('action');
            const index = _.findIndex(actions, function(item) {
                return item == action;
            });
            const newIndex = index + direction;

            if(index != -1 && newIndex != -1 && newIndex != actions.length) {
                actions.splice(index, 1);
                actions.splice(newIndex, 0, action);
                
                trigger.asc_putActions(actions);
                this.updateActionsList();
                const selectedRec = this.actionsList.store.findWhere({action: action});
                this.actionsList.selectRecord(selectedRec);
                this.actionsList.scrollToRecord(selectedRec);
            }
        },

        onActionsListAdd: function() {
            const me = this;
            const triggerType = this.cmbActionsTriggers.getValue();
            const actionType = this.cmbActions.getValue();
            if(triggerType == null || actionType == null) return;
            
            const addActionInTrigger = function(action) {
                const items = me.getActionTriggers();
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    let trigger;
                    if(triggerType == item.type) {
                        trigger = me._changedProps[item.getter]();
                        if(!trigger) {
                            trigger = new Asc.asc_CPdfActionCollectionProperty()
                            me._changedProps[item.setter](trigger);
                        }
                        const actions = trigger.asc_getActions() || [];
                        actions.push(action);
                        trigger.asc_putActions(actions);
                        break;
                    }
                }
                me.updateActionsList();
                const selectedRec = me.actionsList.store.findWhere({action: action});
                me.actionsList.selectRecord(selectedRec);
                me.actionsList.scrollToRecord(selectedRec);
            };

            this.applyActionEdit(actionType, addActionInTrigger);
        },

        onActionsListEdit: function() {
            const selectedItem = this.actionsList.getSelectedRec();
            const action = selectedItem && selectedItem.get('action');
            if(!action) return;

            this.applyActionEdit(action);
        },
        
        onActionsListDelete: function() {
            const selectedItem = this.actionsList.getSelectedRec();
            if(!selectedItem) return;

            const indexInActionsList = _.indexOf(this.actionsList.store.models, selectedItem);
            const trigger = selectedItem.get('trigger');
            if(selectedItem.get('isTrigger')) {
                trigger.asc_putActions([]);
                this.updateActionsList();
            } else if(selectedItem.get('isAction')) {
                const actions = trigger.asc_getActions();
                const action = selectedItem.get('action');
                const index = _.findIndex(actions, function(item) {
                    return item == action;
                });
    
                if(index != -1) {
                    actions.splice(index, 1);
                    this.updateActionsList();
                }
            }

            let selectedRec;
            if(indexInActionsList < this.actionsList.store.length) {
                selectedRec = this.actionsList.store.at(indexInActionsList);
            } else if(this.actionsList.store.length > 0) {
                selectedRec = this.actionsList.store.at(this.actionsList.store.length - 1)
            }

            if(selectedRec) this.actionsList.selectRecord(selectedRec);
            else this.onActionsListSelect(this.actionsList, null, null);
        },

        onActionsListSelect: function(list, view, record) {
            const isTrigger = record && record.get('isTrigger');
            
            this.btnActionsDelete.setDisabled(!record);
            this.btnActionsEdit.setDisabled(!record || isTrigger);
            this.btnActionsUp.setDisabled(!record || isTrigger || (record && record.get('isFirstAtParent')));
            this.btnActionsDown.setDisabled(!record || isTrigger || (record && record.get('isLastAtParent')));
        },

        textTitle: 'Advanced Settings',
        textCategory: 'Category',
        textDecimal: 'Decimal places',
        textSeparator: 'Separator style',
        textSymbol: 'Currency symbol',
        textLocation: 'Symbol location',
        textNegative: 'Negative number style',
        textParens: 'Show parentheses',
        textRed: 'Use red text',
        textFormat: 'Format',
        textReg: "Regular expression",
        textMask: "Arbitrary Mask",
        textPhone: "Phone Number",
        textZipCode: "ZIP Code",
        textZipCode4: "ZIP Code + 4",
        textSSN: "Social Security Number",
        textNumber: 'Number',
        txtCustom: 'Custom',
        textDate: 'Date',
        textTime: 'Time',
        textPercent: 'Percentage',
        textSpecial: 'Special',
        txtSample: 'Example:',
        textNone: 'None',
        textBeforeSpace: 'Before with space',
        textAfterSpace: 'After with space',
        textBefore: 'Before no space',
        textAfter: 'After no space',
        textCustom: 'Custom',
        textValidate: 'Validate',
        textCalculate: 'Calculate',
        textCustomFormatScript: 'Custom format script',
        textCustomKeystrokeScript: 'Custom keystroke script',
        textValidateNone: 'Field value is not validated',
        textValidateRange: 'Field value is in range',
        textValidateScript: 'Run custom validation script',
        textFrom: 'From',
        textTo: 'To',
        textCalculateNone: 'Value is not calculated',
        textCalculateOperation: 'Value from fields',
        textOperation: 'Operation',
        textFields: 'Fields',
        textPick: 'Pick',
        textCalculateScript: 'Custom calculation script',
        textEdit: 'Edit',
        textSum: 'sum',
        textProduct: 'product',
        textAverage: 'average',
        textMinimum: 'minimum',
        textMaximum: 'maximum',
        textActions: 'Actions',
        textAddAnAction: 'Add an action',
        textSelectTrigger: 'Select trigger',
        textSelectAction: 'Select action',
        textAdd: 'Add',
        textDelete: 'Delete',
        textMouseUp: 'Mouse up',
        textMouseDown: 'Mouse down',
        textMouseEnter: 'Mouse enter',
        textMouseExit: 'Mouse exit',
        textOnFocus: 'On focus',
        textOnBlur: 'On blur',
        textGoToPageView: 'Go to a page view',
        textOpenWebLink: 'Open a web link',
        textShowHideField: 'Show/hide a field',
        textResetForm: 'Reset a form',
        textRunJavaScript: 'Run a JavaScript',
        textNavigation: 'Navigation',
        textSelectFieldsForCalc: 'Select fields for calculation',
        textSelectFieldsToReset: 'Select fields to reset',
        textSelectFieldsToShowHide: 'Select fields to show/hide',
        textEditUrl: 'Edit URL',
        textUrlForThisLink: 'Enter a URL for this link:',
        textCreateGoToView: 'Create Go to view',
        textCreateGoToViewDesc: 'Use the scrollbars, mouse, and zoom to select the target view, then press Set link to create the link destination.',
        textSetLink: 'Set link',

    }, PDFE.Views.FormSettingsAdvanced || {}));

    PDFE.Views.FormSettingsCodeEditor = Common.UI.Window.extend(_.extend({
        options: {
            id: 'form-settings-code-editor-dialog',
            minwidth: 400,
            width: 600,
            minheight: 300,
            height: 600,
            resizable: true,
            cls: 'modal-dlg invisible-borders',
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.txtTitle,
                defaultValue: ''
            }, options || {});

            this.template = [
                '<div id="format-settings-code-editor"></div>',
                '<div class="separator horizontal"></div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);

            this.on('resize', _.bind(this.onWindowResize, this));

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var me = this;

            this.codeEditor = new Common.UI.MonacoEditor({
                parentEl: '#format-settings-code-editor',
                language: 'javascript-clear'
            });
            this.codeEditor.on('ready', function() {
                me.codeEditor.updateTheme();
                me.codeEditor.setValue(me.options.defaultValue || '', {row: 0, column: 0});
            });
            this.codeEditor.on('change', function(value, pos) {
                me._codeEditorValue = value;
            });

            // Force codeEditor to recalculate its dimensions to fill the entire window
            const size = me.getSize();
            this.setSize(size[0], size[1]);

            this.getChild().find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
        },

        getFocusedComponents: function() {
            return [].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return null;
        },

        _handleInput: function(state) {
            if (this.options.handler) {
                let value;
                if (state == 'ok') {
                    value = this._codeEditorValue;
                }
                this.options.handler.call(this, state, value);
            }

            this.close();
        },

        onWindowResize: function (args) {
            if(!args) return;

            // Disable iframe mouse events during resize to prevent resize interruption when cursor enters it
            if (args[1] == 'start') {
                $(this.codeEditor.iframe).css('pointer-events', 'none');
            } else if (args[1] == 'end') {
                $(this.codeEditor.iframe).css('pointer-events', 'auto');
            }
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        onPrimary: function() {
            this._handleInput('ok');
            return false;
        },

        txtTitle: 'JavaScript Editor'
        
    }, PDFE.Views.FormSettingsCodeEditor || {}));


    PDFE.Views.FormSettingsSelectNamedAction = Common.UI.Window.extend(_.extend({
        options: {
            width: 300,
            cls: 'modal-dlg',
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.txtTitle,
                defaultSelectedItem: null,
            }, options || {});

            this.template = [
                '<div class="box" style="margin-bottom: 15px">',
                    '<div id="format-settings-list-named-actions" style="width:100%; height: 200px;"></div>',
                '</div>',
                '<div class="separator horizontal"></div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            const me = this;
            this.namedActionsList = new Common.UI.ListView({
                el: $('#format-settings-list-named-actions', this.$window),
                store: new Common.UI.DataViewStore(_.map(AscPDF.ACTION_NAMED_TYPES, function(value, key) {
                    return { value: me['txtAction' + key], key: key };
                })),
                tabindex: 1
            });
            const selectedRec = this.options.defaultSelectedItem && 
                this.namedActionsList.store.findWhere({key: this.options.defaultSelectedItem});
            if(selectedRec) {
                this.namedActionsList.selectRecord(selectedRec);
            } else {
                this.namedActionsList.selectByIndex(0);
            }

            this.getChild().find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
        },

        getFocusedComponents: function() {
            return [this.namedActionsList].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.namedActionsList;
        },

        _handleInput: function(state) {
            if (this.options.handler) {
                let selectedField;
                if (state == 'ok') {
                    selectedField = this.namedActionsList.getSelectedRec();
                    selectedField && (selectedField = selectedField.get('key'));
                }
                this.options.handler.call(this, state, selectedField);
            }

            this.close();
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        onPrimary: function() {
            this._handleInput('ok');
            return false;
        },

        txtTitle: 'Menu item',
        txtActionNextPage: 'Next page',
        txtActionPrevPage: 'Prev page',
        txtActionFirstPage: 'First page',
        txtActionLastPage: 'Last page',
        
    }, PDFE.Views.FormSettingsSelectNamedAction || {}));

    PDFE.Views.FormSettingsSelectFields = Common.UI.Window.extend(_.extend({
        options: {
            width: 300,
            cls: 'modal-dlg',
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.txtTitle,
                items: [],
                defaultCheckedItems: [],
                defaultRadioValue: 'hide',   //'show' | 'hide' 
                showRadio: false,
                description: '',
            }, options || {});

            this.template = [
                '<div class="settings-panel active">',
                    '<div class="box" style="margin-bottom: 15px">',
                        '<label class="padding-very-small"><%= scope.options.description %></label>',
                        '<div class="padding-small">',
                            '<button type="button" class="btn btn-text-default auto" id="select-fields-btn-select" style="min-width: 86px;"><%= scope.txtSelectAll %></button>',
                            '<button type="button" class="btn btn-text-default auto margin-left-5" id="select-fields-btn-deselect" style="min-width: 86px;"><%= scope.txtDeselectAll %></button>',
                        '</div>',
                        '<div id="select-fields-list" class="padding-small" style="width:100%; height: 208px;"></div>',
                        '<% if(scope.options.showRadio) { %>',
                            '<div style="display: flex;">',
                                '<div id="format-settings-rb-show-field"></div>',
                                '<div id="format-settings-rb-hide-field" class="margin-left-20"></div>',
                            '</div>',
                        '<% } %>',
                    '</div>',
                    '<div class="separator horizontal"></div>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)({
                scope: this
            });

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var me = this,
                $window = me.getChild();

            this.btnSelectAll = new Common.UI.Button({
                el: $window.find('#select-fields-btn-select'),
                disabled: this.options.items.length == 0
            });
            this.btnSelectAll.on('click', _.bind(this.selectAll, this, true));

            this.btnDeselectAll = new Common.UI.Button({
                el: $window.find('#select-fields-btn-deselect'),
                disabled: this.options.items.length == 0
            });
            this.btnDeselectAll.on('click', _.bind(this.selectAll, this, false));

            const listItemTemplate = [
                '<div id="<%= id %>" class="list-item" style="display: flex; align-items: center;" role="listitem">',
                    Common.UI.CheckBoxTemplate,
                    '<div style="overflow: hidden; text-overflow: ellipsis;"><%= value %></div>',
                '</div>',
            ].join('');
            this.fieldsList = new Common.UI.ListView({
                el: $window.find('#select-fields-list'),
                store: new Common.UI.DataViewStore(),
                scrollAlwaysVisible: true,
                itemTemplate: _.template(listItemTemplate),
                tabindex: 1
            });
            this.fieldsList.on({
                'item:change': this.onItemChanged.bind(this),
                'item:add': this.onItemChanged.bind(this),
                'item:click': this.onItemClick.bind(this)
            });

            const fieldsNames = this.options.items;
            this.fieldsList.store.reset(fieldsNames.map(function(fieldName) {
                return {
                    value: fieldName,
                    displayName: fieldName,
                    check: me.options.defaultCheckedItems.includes(fieldName)
                }
            }));


            if(this.options.showRadio) {
                this.rbShowFields = new Common.UI.RadioBox({
                    el          : $window.find('#format-settings-rb-show-field'),
                    name        : 'show-or-hide',
                    labelText   : this.txtShowFields,
                    checked     : this.options.defaultRadioValue == 'show'
                });
    
                this.rbHideFields = new Common.UI.RadioBox({
                    el          : $window.find('#format-settings-rb-hide-field'),
                    name        : 'show-or-hide',
                    labelText   : this.txtHideFields,
                    checked     : this.options.defaultRadioValue == 'hide'
                });
            }

            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
        },
        
        selectAll: function(status) {
            this.fieldsList.store.each(function(item) {
                item.set('check', status);
            });
        },

        getFocusedComponents: function() {
            const items = [this.btnSelectAll, this.btnDeselectAll, this.fieldsList];
            if(this.options.showRadio) items.push(this.rbShowFields, this.rbHideFields);
            return items.concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.fieldsList;
        },

        _handleInput: function(state) {
            if (this.options.handler) {
                let result;
                if (state == 'ok') {
                    result = { selectedFields: [] };
                    this.fieldsList.store.each(function(item) {
                        if(item.get('check')) {
                            result.selectedFields.push(item.get('value'));
                        }
                    });
                    if(this.options.showRadio) {
                        if(this.rbShowFields.getValue()) result.radioValue = 'show';
                        else if(this.rbHideFields.getValue()) result.radioValue = 'hide';
                        else result.radioValue = null;
                    }
                }
                this.options.handler.call(this, state, result);
            }

            this.close();
        },

        onItemClick: function (listView, itemView, record) {
            const event = window.event ? window.event : window._event;
            if(event) {
                record.set('check', !record.get('check'));
            }
        },

        onItemChanged: function (view, record) {
            var state = record.model.get('check');
            if ( state == 'indeterminate' )
                $('input[type=checkbox]', record.$el).prop('indeterminate', true);
            else $('input[type=checkbox]', record.$el).prop({checked: state, indeterminate: false});
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        onPrimary: function() {
            this._handleInput('ok');
            return false;
        },

        txtTitle: 'Field selection',
        txtSelectAll: 'Select all',
        txtDeselectAll: 'Deselect all',
        txtShowFields: 'Show fields',
        txtHideFields: 'Hide fields'

    }, PDFE.Views.FormSettingsSelectFields || {}))
});