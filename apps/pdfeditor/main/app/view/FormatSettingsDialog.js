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
 *  FormatSettingsDialog.js
 *
 *  Created on 25.03.2025
 *
 */

define([
    'common/main/lib/view/AdvancedSettingsWindow',
], function () { 'use strict';

    PDFE.Views.FormatSettingsDialog = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 300,
            contentHeight: 345
        },

        initialize : function(options) {
            var me = this;

            this.api        = options.api;
            this.handler    = options.handler;
            this.props      = options.props;

            _.extend(this.options, {
                title: this.textTitle,
                contentHeight: 345,
                contentStyle: 'padding: 5px; position:relative;',
                contentTemplate: _.template([
                    '<div class="settings-panel active">',
                    '<div class="inner-content">',
                    '<table cols="2" style="width: 100%;">',
                        '<tr>',
                            '<td colspan="2" style="width:170px;" class="padding-large">',
                                '<label class="header">', me.textCategory,'</label>',
                                '<div id="format-settings-combo-format" class="input-group-nr"></div>',
                            '</td>',
                        '</tr>',
                        '<tr class="format-decimal">',
                            '<td colspan="2" class="padding-medium" style="vertical-align: bottom;">',
                                '<label class="header">', me.textDecimal,'</label>',
                                '<div id="format-settings-spin-decimal"></div>',
                            '</td>',
                        '</tr>',
                        '<tr class="format-separator">',
                            '<td colspan="2" class="padding-medium">',
                                '<label class="header">', me.textSeparator,'</label>',
                                '<div id="format-settings-combo-separator" class="input-group-nr"</div>',
                            '</td>',
                        '</tr>',
                        '<tr class="format-number">',
                            '<td class="padding-medium padding-right-5" style="width:50%;">',
                                '<label class="header">', me.textSymbol,'</label>',
                                '<div id="format-settings-combo-symbols" class="input-group-nr" ></div>',
                            '</td>',
                            '<td class="padding-medium padding-left-5">',
                                '<label class="header">', me.textLocation,'</label>',
                                '<div id="format-settings-combo-location" class="input-group-nr" ></div>',
                            '</td>',
                        '</tr>',
                        '<tr class="format-number">',
                            '<td colspan="2" class="padding-very-small">',
                                '<label class="header">', me.textNegative,'</label>',
                            '</td>',
                        '</tr>',
                        '<tr class="format-number">',
                            '<td colspan="2" class="padding-very-small">',
                                '<div id="format-settings-chk-parens"></div>',
                            '</td>',
                        '</tr>',
                        '<tr class="format-number">',
                            '<td colspan="2" >',
                                '<div id="format-settings-chk-red"></div>',
                            '</td>',
                        '</tr>',
                        '<tr class="form-special">',
                            '<td colspan="2" class="padding-small">',
                                '<div id="format-settings-special" style="width: 100%;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr class="form-special-mask">',
                            '<td colspan="2" class="padding-small">',
                                '<div id="format-settings-mask" style="width: 100%;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr class="format-date-time">',
                            '<td colspan="2" class="padding-large">',
                                '<label class="header">', me.textFormat,'</label>',
                                '<div id="format-settings-list-format" style="height: 116px;margin-bottom: 8px;"></div>',
                                '<div id="format-settings-txt-custom" class="input-group-nr"></div>',
                            '</td>',
                        '</tr>',
                    '</table>',
                    '<div class="format-example" style="white-space: nowrap;position:absolute; bottom: 4px;width:280px;">',
                        '<label class="format-sample margin-right-4" style="vertical-align: middle;">' + me.txtSample + '</label>',
                        '<label class="format-sample" id="format-settings-label-example" style="vertical-align: middle; max-width: 220px; overflow: hidden; text-overflow: ellipsis;">100</label>',
                    '</div>',
                    '</div></div>'
                ].join(''))({scope: this})
            }, options);

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);

            this._state = {DateFormatCustom: '', DateFormat: '', TimeFormat: 0, NegStyle: AscPDF.NegativeStyle.BLACK_MINUS, Mask: '*', RegExp: '.'};
            this.FormatType = AscPDF.FormatType.NONE;
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

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
                    { displayValue: this.textReg,  value: AscPDF.FormatType.REGULAR }],
                takeFocusOnClose: true
            });
            this.cmbFormat.setValue(this.FormatType);
            this.cmbFormat.on('selected', _.bind(this.onFormatSelect, this));

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
            this.spnDecimal.on('change', _.bind(this.updateFormatExample, this));

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
            this.cmbSeparator.on('selected', _.bind(this.updateFormatExample, this));

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
            this.cmbSymbols.on('selected', _.bind(this.onSymbolsSelect, this));

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
            this.cmbLocation.on('selected', _.bind(this.updateFormatExample, this));

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
                me._state[me.FormatType===AscPDF.FormatType.REGULAR ? 'RegExp' : 'Mask'] = value;
            });

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

            this.lblExample         = this.$window.find('#format-settings-label-example');

            this.afterRender();
        },

        getFocusedComponents: function() {
            return [this.cmbFormat, this.spnDecimal, this.cmbSeparator, this.cmbSymbols, this.cmbLocation, this.chParens, this.chRed, this.dateTimeList, this.inputCustomFormat,
                this.cmbSpecial, this.txtMask].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.cmbFormat;
        },

        afterRender: function() {
            this._setDefaults(this.props);
        },

        show: function() {
            Common.Views.AdvancedSettingsWindow.prototype.show.apply(this, arguments);
        },

        _setDefaults: function (specProps) {
            if (specProps) {
                let format = specProps.asc_getFormat();
                let val = format ? format.asc_getType() : AscPDF.FormatType.NONE;
                this.cmbFormat.setValue((val !== null && val !== undefined) ? val : AscPDF.FormatType.NONE, '');
                this.FormatType=val;
                if (this.FormatType===AscPDF.FormatType.SPECIAL) {
                    val = format.asc_getFormat();
                    this._state.SpecialType = (val===undefined) ? -1 : val;
                }
                this.onFormatSelect(this.cmbFormat, this.cmbFormat.getSelectedRecord());

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
                } if (this.FormatType===AscPDF.FormatType.REGULAR) {
                    this._state.RegExp = format.asc_getRegExp() || '';
                    this.txtMask.setValue(this._state.RegExp);
                } if (this.FormatType===AscPDF.FormatType.SPECIAL) {
                    this.cmbSpecial.setValue(this._state.SpecialType, '');
                    if (this._state.SpecialType===-1) {
                        this._state.Mask = format.asc_getMask() || '';
                        this.txtMask.setValue(this._state.Mask);
                    }
                }
                this.updateFormatExample();
            }
        },

        getSettings: function () {
            switch (this.FormatType) {
                case AscPDF.FormatType.NUMBER:
                    let location = this.cmbLocation.getValue(),
                        symbol = this.cmbSymbols.getValue();
                    if (symbol && (location===0 || location===2)) {
                        symbol = location===0 ? symbol + ' ' : ' ' + symbol;
                    }
                    return {FormatType: this.FormatType, decimal: this.spnDecimal.getNumberValue(), separator: this.cmbSeparator.getValue(), negative: this._state.NegStyle,
                            symbol: symbol || '', location: location<2};
                case AscPDF.FormatType.PERCENTAGE:
                    return {FormatType: this.FormatType, decimal: this.spnDecimal.getNumberValue(), separator: this.cmbSeparator.getValue()};
                case AscPDF.FormatType.DATE:
                    return {FormatType: this.FormatType, dateformat: this._state.DateFormat};
                case AscPDF.FormatType.TIME:
                    return {FormatType: this.FormatType, timeformat: this._state.TimeFormat};
                case AscPDF.FormatType.SPECIAL:
                    return {FormatType: this.FormatType, special: this.cmbSpecial.getValue(), mask: this.txtMask.getValue()};
                case AscPDF.FormatType.REGULAR:
                    return {FormatType: this.FormatType, regexp: this.txtMask.getValue()};
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
                    let location = this.cmbLocation.getValue(),
                        symbol = this.cmbSymbols.getValue();
                    if (symbol && (location===0 || location===2)) {
                        symbol = location===0 ? symbol + ' ' : ' ' + symbol;
                    }
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

        onSymbolsSelect: function(combo, record) {
            this.cmbLocation.setDisabled(record.value===null);
            this.updateFormatExample();
        },

        onNegativeChange: function(field, newValue, oldValue, eOpts){
            var isRed = this.chRed.getValue()==='checked',
                isParens = this.chParens.getValue()==='checked';
            this._state.NegStyle = isRed ? (isParens ? AscPDF.NegativeStyle.PARENS_RED : AscPDF.NegativeStyle.RED_MINUS) :
                                            isParens ? AscPDF.NegativeStyle.PARENS_BLACK : AscPDF.NegativeStyle.BLACK_MINUS;
            this.updateFormatExample();
        },

        onDateTimeListSelect: function(listView, itemView, record){
            if (!record) return;
            var isCustom = this.FormatType===AscPDF.FormatType.DATE && !!record.get('isCustom');
            this.inputCustomFormat.setVisible(isCustom);
            isCustom && this.inputCustomFormat.setValue(this._state.DateFormatCustom);
            this._state[this.FormatType===AscPDF.FormatType.DATE ? 'DateFormat' : 'TimeFormat'] = isCustom ? this.inputCustomFormat.getValue() : record.get('value');
            this.updateFormatExample();
        },

        onSpecialChanged: function(combo, record) {
            this._state.SpecialType = record.value;
            this._maskPanel.toggleClass('hidden', this._state.SpecialType!==-1);
            (this._state.SpecialType===-1) && this.txtMask.setValue(this._state.Mask);

            this.updateFormatExample();
        },

        onFormatSelect: function(combo, record, specProps) {
            if (!record) return;

            this.FormatType = record.value;

            var isNumber = this.FormatType === AscPDF.FormatType.NUMBER,
                isPercent = this.FormatType === AscPDF.FormatType.PERCENTAGE;

            this._decimalPanel.toggleClass('hidden', !(isNumber || isPercent));
            this._separatorPanel.toggleClass('hidden', !(isNumber || isPercent));
            this._numberPanel.toggleClass('hidden', !isNumber);
            this._specialPanel.toggleClass('hidden', this.FormatType!==AscPDF.FormatType.SPECIAL);
            this._maskPanel.toggleClass('hidden', !(this.FormatType===AscPDF.FormatType.REGULAR || this.FormatType===AscPDF.FormatType.SPECIAL && this._state.SpecialType===-1));
            if (this.FormatType===AscPDF.FormatType.REGULAR)
                this.txtMask.setValue(this._state.RegExp);
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
            this._examplePanel.toggleClass('hidden', this.FormatType===AscPDF.FormatType.SPECIAL || this.FormatType===AscPDF.FormatType.REGULAR || this.FormatType===AscPDF.FormatType.NONE);
            this.updateFormatExample();
        },

        textTitle: 'Format Settings',
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
        textAfter: 'After no space'

    }, PDFE.Views.FormatSettingsDialog || {}))
});