/*
 *
 * (c) Copyright Ascensio System Limited 2010-2017
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
 *  FormatSettingsDialog.js
 *
 *  Created by Julia Radzhabova on 13.01.2017
 *  Copyright (c) 2017 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/MetricSpinner',
    'common/main/lib/component/ComboBox',
    'common/main/lib/view/AdvancedSettingsWindow'
], function () { 'use strict';

    SSE.Views.FormatSettingsDialog = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 330,
            height: 250
        },

        initialize : function(options) {
            var me = this;

            me.ascFormatOptions = {
                General     : 'General',
                Number      : '0.00',
                Currency    : '$#,##0.00',
                Accounting  : '_($* #,##0.00_);_($* (#,##0.00);_($* "-"??_);_(@_)',
                DateShort   : 'm/d/yyyy',
                DateLong    : '[$-F800]dddd, mmmm dd, yyyy',
                Time        : '[$-F400]h:mm:ss AM/PM',
                Percentage  : '0.00%',
                Percent     : '0%',
                Fraction    : '# ?/?',
                Scientific  : '0.00E+00',
                Text        : '@'
            };

            me.numFormatData = [
                { value: Asc.c_oAscNumFormatType.General,   format: this.ascFormatOptions.General,     displayValue: this.txtGeneral,      exampleval: '100' },
                { value: Asc.c_oAscNumFormatType.Number,    format: this.ascFormatOptions.Number,      displayValue: this.txtNumber,       exampleval: '100,00' },
                { value: Asc.c_oAscNumFormatType.Scientific,format: this.ascFormatOptions.Scientific,  displayValue: this.txtScientific,   exampleval: '1,00E+02' },
                { value: Asc.c_oAscNumFormatType.Accounting,format: this.ascFormatOptions.Accounting,  displayValue: this.txtAccounting,   exampleval: '100,00 $' },
                { value: Asc.c_oAscNumFormatType.Currency,  format: this.ascFormatOptions.Currency,    displayValue: this.txtCurrency,     exampleval: '100,00 $' },
                { value: Asc.c_oAscNumFormatType.Date,      format: 'MM-dd-yyyy',                      displayValue: this.txtDate,         exampleval: '04-09-1900' },
                { value: Asc.c_oAscNumFormatType.Time,      format: 'HH:MM:ss',                        displayValue: this.txtTime,         exampleval: '00:00:00' },
                { value: Asc.c_oAscNumFormatType.Percent,   format: this.ascFormatOptions.Percentage,  displayValue: this.txtPercentage,   exampleval: '100,00%' },
                { value: Asc.c_oAscNumFormatType.Fraction,  format: this.ascFormatOptions.Fraction,    displayValue: this.txtFraction,     exampleval: '100' },
                { value: Asc.c_oAscNumFormatType.Text,      format: this.ascFormatOptions.Text,        displayValue: this.txtText,         exampleval: '100' },
                { value: -1,                                format: '',                                displayValue: this.txtCustom,       exampleval: '100' }
            ];

            me.FractionData = [
                { displayValue: this.txtUpto1,      value: 0 },
                { displayValue: this.txtUpto2,      value: 1 },
                { displayValue: this.txtUpto3,      value: 2 },
                { displayValue: this.txtAs2,        value: 3 },
                { displayValue: this.txtAs4,        value: 4 },
                { displayValue: this.txtAs8,        value: 5 },
                { displayValue: this.txtAs16,       value: 6 },
                { displayValue: this.txtAs10,       value: 7 },
                { displayValue: this.txtAs100,      value: 8 }
            ];

            _.extend(this.options, {
                title: this.textTitle,
                template: [
                    '<div class="box" style="height:' + (me.options.height - 85) + 'px;">',
                    '<div class="content-panel" style="padding: 0 5px;"><div class="inner-content">',
                    '<div class="settings-panel active">',
                    '<table cols="2" style="width: 100%;">',
                        '<tr>',
                            '<td class="padding-small" style="width:170px;">',
                                '<label class="header">', me.textTitle,'</label>',
                                '<div id="format-settings-combo-format" class="input-group-nr" style="width:140px;"></div>',
                            '</td>',
                            '<td class="padding-small">',
                                '<label class="input-label" style="margin-bottom: -1px;">', me.textSample,'</label>',
                                '<label id="format-settings-label-example" style="display: block; font-size: 18px;">100</label>',
                            '</td>',
                        '</tr>',
                        '<tr class="format-decimal">',
                            '<td class="padding-large format-negative">',
                                '<label class="input-label">', me.textNegative,'</label>',
                                '<div id="format-settings-combo-negative" class="input-group-nr" style="width:140px;"></div>',
                            '</td>',
                            '<td class="padding-large" style="vertical-align: bottom;">',
                                '<label class="input-label" style="margin-right: 10px;">', me.textDecimal,'</label>',
                                '<div id="format-settings-spin-decimal" style="display: inline-block;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr class="format-separator">',
                            '<td class="padding-small"></td>',
                            '<td class="padding-small">',
                                '<div id="format-settings-checkbox-separator"></div>',
                            '</td>',
                        '</tr>',
                        '<tr class="format-type">',
                            '<td class="padding-small"></td>',
                            '<td class="padding-small">',
                                '<label class="input-label">', me.textType,'</label>',
                                '<div id="format-settings-combo-type" class="input-group-nr" style="width:140px;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr class="format-symbols">',
                            '<td class="padding-small"></td>',
                            '<td class="padding-small">',
                                '<label class="input-label">', me.textSymbols,'</label>',
                                '<div id="format-settings-combo-symbols" class="input-group-nr" style="width:140px;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr class="format-code">',
                            '<td colspan="2" class="padding-small">',
                                '<label class="input-label">', me.textCode,'</label>',
                                '<div id="format-settings-combo-code" class="input-group-nr" style=""></div>',
                            '</td>',
                        '</tr>',
                    '</table>',
                    '</div></div>',
                    '</div>',
                    '</div>',
                    '<div class="separator horizontal"/>',
                    '<div class="footer center">',
                        '<button class="btn normal dlg-btn primary" result="ok" style="margin-right: 10px;  width: 86px;">' + me.textOk + '</button>',
                        '<button class="btn normal dlg-btn" result="cancel" style="width: 86px;">' + me.textCancel + '</button>',
                    '</div>'
                ].join('')
            }, options);

            this.api        = options.api;
            this.handler    = options.handler;
            this.props      = options.props;

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);

            this.FormatType = Asc.c_oAscNumFormatType.General;
            this.Format = this.ascFormatOptions.General;
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this.cmbFormat = new Common.UI.ComboBox({
                el: $('#format-settings-combo-format'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 140px;',
                editable: false,
                data: this.numFormatData
            });
            this.cmbFormat.setValue(this.FormatType);
            this.cmbFormat.on('selected', _.bind(this.onFormatSelect, this));

            this.cmbNegative = new Common.UI.ComboBox({
                el: $('#format-settings-combo-negative'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 140px;max-height:210px;',
                editable: false,
                data: [],
                scrollAlwaysVisible: true
            });
            this.cmbNegative.on('selected', _.bind(this.onNegativeSelect, this));

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
            this.spnDecimal.on('change', _.bind(this.onDecimalChange, this));

            this.chSeparator = new Common.UI.CheckBox({
                el: $('#format-settings-checkbox-separator'),
                labelText: this.textSeparator
            });
            this.chSeparator.on('change', _.bind(this.onSeparatorChange, this));

            this.cmbSymbols = new Common.UI.ComboBox({
                el: $('#format-settings-combo-symbols'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 140px',
                editable: false,
                data: [
                    { displayValue: this.txtDollar,     value: 0 },
                    { displayValue: this.txtEuro,       value: 1 },
                    { displayValue: this.txtPound,      value: 2 },
                    { displayValue: this.txtRouble,     value: 3 },
                    { displayValue: this.txtYen,        value: 4 }
                ]
            });
            this.cmbSymbols.setValue(0);
            this.cmbSymbols.on('selected', _.bind(this.onSymbolsSelect, this));

            this.cmbType = new Common.UI.ComboBox({
                el: $('#format-settings-combo-type'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 140px;max-height:210px;',
                editable: false,
                data: [],
                scrollAlwaysVisible: true
            });
            this.cmbType.setValue(-1);
            this.cmbType.on('selected', _.bind(this.onTypeSelect, this));

            this.cmbCode = new Common.UI.ComboBox({
                el: $('#format-settings-combo-code'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 310px;max-height:210px;',
                editable: false,
                data: [],
                scrollAlwaysVisible: true
            });
            this.cmbCode.on('selected', _.bind(this.onCodeSelect, this));

            this._decimalPanel      = this.$window.find('.format-decimal');
            this._negativePanel     = this.$window.find('.format-negative');
            this._separatorPanel    = this.$window.find('.format-separator');
            this._typePanel         = this.$window.find('.format-type');
            this._symbolsPanel      = this.$window.find('.format-symbols');
            this._codePanel         = this.$window.find('.format-code');

            this.lblExample         = this.$window.find('#format-settings-label-example');

            this.afterRender();
        },

        afterRender: function() {
            this._setDefaults(this.props);
        },

        show: function() {
            Common.Views.AdvancedSettingsWindow.prototype.show.apply(this, arguments);
        },

        _setDefaults: function (props) {
            if (props) {
                // var val = props.get_NumFormat();
                // this.cmbFormat.setValue(val);
                this.onFormatSelect(this.cmbFormat, this.cmbFormat.getSelectedRecord());
            }
        },

        getSettings: function () {
            return {format: ''};
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
            return true;
        },

        onNegativeSelect: function(combo, record) {
            this.Format = record.value;
            this.lblExample.text(this.api.asc_getLocaleExample2(this.Format));
        },

        onSymbolsSelect: function(combo, record) {
            var info = new Asc.asc_CFormatCellsInfo();
            info.asc_setType(this.FormatType);
            info.asc_setDecimalPlaces(this.spnDecimal.getNumberValue());
            info.asc_setSeparator(false);
            info.asc_setSymbol(record.value);

            var format = this.api.asc_getFormatCells(info);
            if (this.FormatType == Asc.c_oAscNumFormatType.Currency) {
                var data = [];
                format.forEach(function(item) {
                    data.push({value: item, displayValue: item});
                });
                this.cmbNegative.setData(data);
                this.cmbNegative.selectRecord(this.cmbNegative.store.at(0));
                this.Format = format[0];
            } else {
                this.Format = format;
            }

            this.lblExample.text(this.api.asc_getLocaleExample2(this.Format));
        },

        onDecimalChange: function(field, newValue, oldValue, eOpts){
            var info = new Asc.asc_CFormatCellsInfo();
            info.asc_setType(this.FormatType);
            info.asc_setDecimalPlaces(field.getNumberValue());
            info.asc_setSeparator((this.FormatType == Asc.c_oAscNumFormatType.Number) ? this.chSeparator.getValue()=='checked' : false);
            info.asc_setSymbol((this.FormatType == Asc.c_oAscNumFormatType.Currency || this.FormatType == Asc.c_oAscNumFormatType.Accounting) ? this.cmbSymbols.getValue() : false);

            var format = this.api.asc_getFormatCells(info);
            if (this.FormatType == Asc.c_oAscNumFormatType.Number || this.FormatType == Asc.c_oAscNumFormatType.Currency) {
                var data = [];
                format.forEach(function(item) {
                    data.push({value: item, displayValue: item});
                });
                this.cmbNegative.setData(data);
                this.cmbNegative.selectRecord(this.cmbNegative.store.at(0));
                this.Format = format[0];
            } else {
                this.Format = format;
            }

            this.lblExample.text(this.api.asc_getLocaleExample2(this.Format));
        },

        onSeparatorChange: function(field, newValue, oldValue, eOpts){
            var info = new Asc.asc_CFormatCellsInfo();
            info.asc_setType(this.FormatType);
            info.asc_setDecimalPlaces(this.spnDecimal.getNumberValue());
            info.asc_setSeparator(field.getValue()=='checked');

            var format = this.api.asc_getFormatCells(info),
                data = [];
            format.forEach(function(item) {
                data.push({value: item, displayValue: item});
            });
            this.cmbNegative.setData(data);
            this.cmbNegative.selectRecord(this.cmbNegative.store.at(0));
            this.Format = format[0];

            this.lblExample.text(this.api.asc_getLocaleExample2(this.Format));
        },

        onTypeSelect: function(combo, record){
            var info = new Asc.asc_CFormatCellsInfo();
            info.asc_setType(this.FormatType);
            info.asc_setDecimalPlaces(0);
            info.asc_setSeparator(false);

            if (this.FormatType == Asc.c_oAscNumFormatType.Fraction) {
                info.asc_setFractionType(record.value);
                this.Format = this.api.asc_getFormatCells(info);
            } else {
                this.Format = record.value;
            }

            this.lblExample.text(this.api.asc_getLocaleExample2(this.Format));
        },

        onCodeSelect: function(combo, record){
            this.Format = record.value;
            this.lblExample.text(this.api.asc_getLocaleExample2(this.Format));
        },

        onFormatSelect: function(combo, record) {
            if (!record) return;

            this.FormatType = record.value;

            var hasDecimal = (record.value == Asc.c_oAscNumFormatType.Number || record.value == Asc.c_oAscNumFormatType.Scientific || record.value == Asc.c_oAscNumFormatType.Accounting ||
                             record.value == Asc.c_oAscNumFormatType.Currency || record.value == Asc.c_oAscNumFormatType.Percent),
                hasNegative = (record.value == Asc.c_oAscNumFormatType.Number || record.value == Asc.c_oAscNumFormatType.Currency),
                hasSeparator = (record.value == Asc.c_oAscNumFormatType.Number),
                hasType = (record.value == Asc.c_oAscNumFormatType.Date || record.value == Asc.c_oAscNumFormatType.Time || record.value == Asc.c_oAscNumFormatType.Fraction),
                hasSymbols = (record.value == Asc.c_oAscNumFormatType.Accounting || record.value == Asc.c_oAscNumFormatType.Currency),
                hasCode = (record.value == -1);

            if (record.value !== -1) {
                var info = new Asc.asc_CFormatCellsInfo();
                info.asc_setType(record.value);
                info.asc_setDecimalPlaces(hasDecimal ? this.spnDecimal.getNumberValue() : 0);
                info.asc_setSeparator(hasSeparator ? this.chSeparator.getValue()=='checked' : false);
                info.asc_setSymbol(hasSymbols ? this.cmbSymbols.getValue() : false);

                if (hasNegative || record.value == Asc.c_oAscNumFormatType.Date || record.value == Asc.c_oAscNumFormatType.Time) {
                    var formatsarr = this.api.asc_getFormatCells(info),
                        data = [];
                    formatsarr.forEach(function(item) {
                        data.push({value: item, displayValue: item});
                    });
                    if (hasNegative) {
                        this.cmbNegative.setData(data);
                        this.cmbNegative.selectRecord(this.cmbNegative.store.at(0));
                    } else {
                        this.cmbType.setData(data);
                        this.cmbType.selectRecord(this.cmbType.store.at(0));
                    }
                    this.Format = formatsarr[0];
                } else {
                    if (record.value == Asc.c_oAscNumFormatType.Fraction) {
                        this.cmbType.setData(this.FractionData);
                        this.cmbType.setValue(0);
                        info.asc_setFractionType(this.cmbType.getValue());
                    }
                    this.Format = this.api.asc_getFormatCells(info);
                }

            } else {
                var formatsarr = this.api.asc_getFormatCells(null),
                    data = [];
                formatsarr.forEach(function(item) {
                    data.push({value: item, displayValue: item});
                });
                this.cmbCode.setData(data);
                this.cmbCode.setValue(this.Format);
            }

            this.lblExample.text(this.api.asc_getLocaleExample2(this.Format));

            this._decimalPanel.toggleClass('hidden', !hasDecimal);
            this._negativePanel.css('visibility', hasNegative ? '' : 'hidden');
            this._separatorPanel.toggleClass('hidden', !hasSeparator);
            this._typePanel.toggleClass('hidden', !hasType);
            this._symbolsPanel.toggleClass('hidden', !hasSymbols);
            this._codePanel.toggleClass('hidden', !hasCode);
        },

        textTitle: 'Number Format',
        textSample: 'Sample',
        textDecimal: 'Decimal',
        textNegative: 'Negative numbers',
        textSeparator: 'Use 1000 separator',
        textType: 'Type',
        textSymbols: 'Symbols',
        textCode: 'Code',
        textCancel: 'Cancel',
        textOk: 'OK',
        txtGeneral:         'General',
        txtNumber:          'Number',
        txtCustom:          'Custom',
        txtCurrency:        'Currency',
        txtAccounting:      'Accounting',
        txtDate:            'Date',
        txtTime:            'Time',
        txtPercentage:      'Percentage',
        txtFraction:        'Fraction',
        txtScientific:      'Scientific',
        txtText:            'Text',
        txtDollar:          '$ Dollar',
        txtEuro:            '€ Euro',
        txtRouble:          'р. Rouble',
        txtPound:           '£ Pound',
        txtYen:             '¥ Yen',
        txtUpto1: 'Up to one digit',
        txtUpto2: 'Up to two digits',
        txtUpto3: 'Up to three digits',
        txtAs2:  'As halfs',
        txtAs8:  'As eighths',
        txtAs4:  'As fourths',
        txtAs16:  'As sixteenths',
        txtAs10:  'As tenths',
        txtAs100: 'As hundredths'


    }, SSE.Views.FormatSettingsDialog || {}))
});