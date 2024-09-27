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
 *  Created on 13.01.2017
 *
 */

define([
    'common/main/lib/view/AdvancedSettingsWindow',
], function () { 'use strict';

    SSE.Views.FormatSettingsDialog = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 284,
            contentHeight: 255
        },

        initialize : function(options) {
            var me = this;

            me.numFormatData = [
                { value: Asc.c_oAscNumFormatType.General,   displayValue: this.txtGeneral },
                { value: Asc.c_oAscNumFormatType.Number,    displayValue: this.txtNumber },
                { value: Asc.c_oAscNumFormatType.Scientific,displayValue: this.txtScientific },
                { value: Asc.c_oAscNumFormatType.Accounting,displayValue: this.txtAccounting },
                { value: Asc.c_oAscNumFormatType.Currency,  displayValue: this.txtCurrency },
                { value: Asc.c_oAscNumFormatType.Date,      displayValue: this.txtDate },
                { value: Asc.c_oAscNumFormatType.Time,      displayValue: this.txtTime },
                { value: Asc.c_oAscNumFormatType.Percent,   displayValue: this.txtPercentage },
                { value: Asc.c_oAscNumFormatType.Fraction,  displayValue: this.txtFraction },
                { value: Asc.c_oAscNumFormatType.Text,      displayValue: this.txtText },
                { value: Asc.c_oAscNumFormatType.Custom,    displayValue: this.txtCustom }
            ];

            me.FractionData = [
                { displayValue: this.txtUpto1,      value: "# ?/?" },
                { displayValue: this.txtUpto2,      value: "# ??/??" },
                { displayValue: this.txtUpto3,      value: "# ???/???" },
                { displayValue: this.txtAs2,        value: "# ?/2" },
                { displayValue: this.txtAs4,        value: "# ?/4" },
                { displayValue: this.txtAs8,        value: "# ?/8" },
                { displayValue: this.txtAs16,       value: "# ??/16" },
                { displayValue: this.txtAs10,       value: "# ?/10" },
                { displayValue: this.txtAs100,      value: "# ??/100" }
            ];

            me.CurrencySymbolsData = null;
            me.langId = 0x0409;

            this.api        = options.api;
            this.handler    = options.handler;
            this.props      = options.props;
            this.linked     = options.linked || false;

            var height = this.linked ? 275 : 255;
            _.extend(this.options, {
                title: this.textTitle,
                contentHeight: height,
                contentStyle: 'padding: 0 10px;',
                contentTemplate: _.template([
                    '<div class="settings-panel active">',
                    '<div class="inner-content">',
                    '<table cols="1" style="width: 100%;">',
                        '<tr>',
                            '<td style="width:170px;padding-bottom: 3px;">',
                                '<label class="header">', me.textCategory,'</label>',
                                '<div id="format-settings-combo-format" class="input-group-nr" style="width:264px;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td class="padding-large" style="white-space: nowrap;">',
                                '<label class="format-sample margin-right-4" style="vertical-align: middle;">' + me.txtSample + '</label>',
                                '<label class="format-sample" id="format-settings-label-example" style="vertical-align: middle; max-width: 220px; overflow: hidden; text-overflow: ellipsis;">100</label>',
                            '</td>',
                        '</tr>',
                        '<tr class="format-no-code">',
                            '<td class="padding-small">',
                            '</td>',
                        '</tr>',
                        '<tr class="format-decimal">',
                            '<td class="padding-large" style="vertical-align: bottom;">',
                                '<label class="header">', me.textDecimal,'</label>',
                                '<div id="format-settings-spin-decimal"></div>',
                            '</td>',
                        '</tr>',
                        '<tr class="format-separator">',
                            '<td class="padding-large">',
                                '<div id="format-settings-checkbox-separator"></div>',
                            '</td>',
                        '</tr>',
                        '<tr class="format-symbols">',
                            '<td class="padding-large">',
                                '<label class="header">', me.textSymbols,'</label>',
                                '<div id="format-settings-combo-symbols" class="input-group-nr" style="width:264px;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr class="format-decimal">',
                            '<td class="padding-large format-negative">',
                                '<label class="header">', me.textFormat,'</label>',
                                '<div id="format-settings-combo-negative" class="input-group-nr" style="width:264px;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr class="format-type">',
                            '<td class="padding-large">',
                                '<label class="header">', me.textFormat,'</label>',
                                '<div id="format-settings-combo-type" class="input-group-nr" style="width:264px;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr class="format-code">',
                            '<td colspan="1" class="padding-large">',
                                '<label class="header">', me.textFormat,'</label>',
                                '<div id="format-settings-txt-code" class="input-group-nr" style="height:22px;width:264px;margin-bottom: 8px;"></div>',
                                '<div id="format-settings-list-code" style="width:264px; height: 116px;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td colspan="1">',
                                '<div id="format-settings-chk-linked"></div>',
                            '</td>',
                        '</tr>',
                    '</table>',
                    '</div></div>'
                ].join(''))({scope: this})
            }, options);

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);

            this._state = {hasDecimal: false, hasNegative: false, hasSeparator: false, hasType: false, hasSymbols: false, hasCode: false};
            this.FormatType = Asc.c_oAscNumFormatType.General;
            this.Format = "General";
            this.FormatInfo =  new Asc.asc_CFormatCellsInfo();
            this.CustomFormat = null;
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this.cmbFormat = new Common.UI.ComboBox({
                el: $('#format-settings-combo-format'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 264px;',
                editable: false,
                data: this.numFormatData,
                takeFocusOnClose: true
            });
            this.cmbFormat.setValue(this.FormatType);
            this.cmbFormat.on('selected', _.bind(this.onFormatSelect, this));

            this.cmbNegative = new Common.UI.ComboBox({
                el: $('#format-settings-combo-negative'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 264px;max-height:235px;',
                editable: false,
                data: [],
                scrollAlwaysVisible: true,
                takeFocusOnClose: true
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
                menuStyle: 'min-width: 264px;max-height:235px;',
                editable: false,
                data: [],
                scrollAlwaysVisible: true,
                takeFocusOnClose: true,
                search: true
            });
            this.cmbSymbols.on('selected', _.bind(this.onSymbolsSelect, this));

            this.cmbType = new Common.UI.ComboBox({
                el: $('#format-settings-combo-type'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 264px;max-height:235px;',
                editable: false,
                data: [],
                scrollAlwaysVisible: true,
                takeFocusOnClose: true
            });
            this.cmbType.on('selected', _.bind(this.onTypeSelect, this));

            this.codesList = new Common.UI.ListView({
                el: $('#format-settings-list-code'),
                store: new Common.UI.DataViewStore(),
                tabindex: 1,
                itemTemplate: _.template('<div id="<%= id %>" class="list-item" style="pointer-events:none;overflow: hidden; text-overflow: ellipsis;"><%= Common.Utils.String.htmlEncode(value) %></div>')
            });
            this.codesList.on('item:select', _.bind(this.onCodeSelect, this));
            this.codesList.on('entervalue', _.bind(this.onPrimary, this));

            this.inputCustomFormat = new Common.UI.InputField({
                el               : $('#format-settings-txt-code'),
                allowBlank       : true,
                validateOnChange : true,
                validation       : function () { return true; }
            }).on ('changing', function (input, value) {
                me.codesList.deselectAll();
                me.Format = me.api.asc_convertNumFormatLocal2NumFormat(value);
                me.lblExample.text(me.api.asc_getLocaleExample(me.Format));
                me.chLinked.setValue(false, true);
                if (!me._state.warning) {
                    input.showWarning([me.txtCustomWarning]);
                    me._state.warning = true;
                }
            });

            this.chLinked = new Common.UI.CheckBox({
                el: $('#format-settings-chk-linked'),
                labelText: this.textLinked
            }).on ('change', function (field, newValue, oldValue, eOpts) {
                me.props.linked = (field.getValue()=='checked');
                if (me.props.linked) {
                    me.props.chartFormat.putSourceLinked(true);
                    me.props.format = me.props.chartFormat.getFormatCode();
                    me.props.formatInfo = me.props.chartFormat.getFormatCellsInfo();
                    me._setDefaults(me.props);
                }
            });
            this.chLinked.setVisible(this.linked);

            this._decimalPanel      = this.$window.find('.format-decimal');
            this._negativePanel     = this.$window.find('.format-negative');
            this._separatorPanel    = this.$window.find('.format-separator');
            this._typePanel         = this.$window.find('.format-type');
            this._symbolsPanel      = this.$window.find('.format-symbols');
            this._codePanel         = this.$window.find('.format-code');
            this._nocodePanel       = this.$window.find('.format-no-code');
            this.$window.find('.format-sample').toggleClass('hidden', this.linked);

            this.lblExample         = this.$window.find('#format-settings-label-example');

            this.afterRender();
        },

        getFocusedComponents: function() {
            return [this.cmbFormat, this.spnDecimal, this.chSeparator, this.cmbSymbols, this.cmbNegative, this.cmbType, this.inputCustomFormat, this.codesList, this.chLinked].concat(this.getFooterButtons());
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

        _setDefaults: function (props) {
            if (props && props.formatInfo) {
                if (this.langId)
                    this.langId = props.langId;
                this.cmbFormat.setValue(props.formatInfo.asc_getType(), this.txtCustom);

                this.FormatInfo = props.formatInfo;
                if ((props.formatInfo.asc_getType() == Asc.c_oAscNumFormatType.Custom) && props.format)
                    this.CustomFormat = this.Format = props.format;

                this.onFormatSelect(this.cmbFormat, this.cmbFormat.getSelectedRecord(), null, props.formatInfo);
                if (this._state.hasDecimal)
                    this.spnDecimal.setValue(props.formatInfo.asc_getDecimalPlaces());
                if (this._state.hasSeparator)
                    this.chSeparator.setValue(props.formatInfo.asc_getSeparator());
                if (this._state.hasSymbols)
                    this.cmbSymbols.setValue(props.formatInfo.asc_getSymbol() || props.formatInfo.asc_getCurrencySymbol());

                if (props.format) {
                    if (this._state.hasNegative) {
                        var selectedItem = this.cmbNegative.store.findWhere({value: props.format});
                        if (selectedItem)
                            this.cmbNegative.selectRecord(selectedItem);
                        else
                            this.cmbNegative.setValue(this.api.asc_getLocaleExample(props.format));
                    } else if (this._state.hasType) {
                        var selectedItem = this.cmbType.store.findWhere({value: props.format});
                        if (selectedItem)
                            this.cmbType.selectRecord(selectedItem);
                        else if (props.formatInfo.asc_getType() == Asc.c_oAscNumFormatType.Fraction)
                            this.cmbType.setValue(this.txtCustom);
                        else if (props.formatInfo.asc_getType() == Asc.c_oAscNumFormatType.Time)
                            this.cmbType.setValue(this.api.asc_getLocaleExample(props.format, 1.534));
                        else
                            this.cmbType.setValue(this.api.asc_getLocaleExample(props.format, 38822));
                    }
                    this.Format = props.format;
                    this.lblExample.text(this.api.asc_getLocaleExample(this.Format));
                }
                // for fraction - if props.format not in cmbType - setValue(this.txtCustom)
                // for date/time - if props.format not in cmbType - setValue(this.api.asc_getLocaleExample(props.format, 38822))
                // for cmbNegative - if props.format not in cmbNegative - setValue(this.api.asc_getLocaleExample(props.format))
            }
            if (props && props.chartFormat) {
                this.chLinked.setValue(!!props.chartFormat.getSourceLinked(), true);
            }
        },

        getSettings: function () {
            return {format: this.Format, formatInfo: this.FormatInfo, linked: this.chLinked.getValue()==='checked'};
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

        onNegativeSelect: function(combo, record) {
            this.Format = record.value;
            this.lblExample.text(this.api.asc_getLocaleExample(this.Format));
            this.chLinked.setValue(false, true);
        },

        onSymbolsSelect: function(combo, record) {
            var me = this,
                info = new Asc.asc_CFormatCellsInfo();
            info.asc_setType(this.FormatType);
            info.asc_setDecimalPlaces(this.spnDecimal.getNumberValue());
            info.asc_setSeparator(false);
            (typeof record.value === 'string') ? info.asc_setCurrencySymbol(record.value) : info.asc_setSymbol(record.value);

            var format = this.api.asc_getFormatCells(info),
                data = [];
            format.forEach(function(item) {
                data.push({value: item, displayValue: me.api.asc_getLocaleExample(item, -1234.12345678901234567890)});
            });
            this.cmbNegative.setData(data);
            this.cmbNegative.selectRecord(this.cmbNegative.store.at(0));
            this.cmbNegative.cmpEl.find('li:nth-child(2) a, li:nth-child(4) a').css({color: '#ff0000'});
            this.Format = format[0];
            this.FormatInfo = info;

            this.lblExample.text(this.api.asc_getLocaleExample(this.Format));
            this.chLinked.setValue(false, true);
        },

        onDecimalChange: function(field, newValue, oldValue, eOpts){
            var me = this,
                info = new Asc.asc_CFormatCellsInfo();
            info.asc_setType(this.FormatType);
            info.asc_setDecimalPlaces(field.getNumberValue());
            info.asc_setSeparator((this.FormatType == Asc.c_oAscNumFormatType.Number) ? this.chSeparator.getValue()=='checked' : false);
            if (this.FormatType == Asc.c_oAscNumFormatType.Currency || this.FormatType == Asc.c_oAscNumFormatType.Accounting) {
                var value = this.cmbSymbols.getValue();
                (typeof value === 'string') ? info.asc_setCurrencySymbol(value) : info.asc_setSymbol(value);
            } else
                info.asc_setSymbol(false);

            var format = this.api.asc_getFormatCells(info);
            if (this.FormatType == Asc.c_oAscNumFormatType.Number || this.FormatType == Asc.c_oAscNumFormatType.Currency || this.FormatType == Asc.c_oAscNumFormatType.Accounting) {
                var data = [];
                format.forEach(function(item) {
                    data.push({value: item, displayValue: me.api.asc_getLocaleExample(item, -1234.12345678901234567890)});
                });
                this.cmbNegative.setData(data);
                this.cmbNegative.selectRecord(this.cmbNegative.store.at(0));
                this.cmbNegative.cmpEl.find('li:nth-child(2) a, li:nth-child(4) a').css({color: '#ff0000'});
                this.Format = format[0];
            } else {
                this.Format = format[0];
            }
            this.FormatInfo = info;

            this.lblExample.text(this.api.asc_getLocaleExample(this.Format));
            this.chLinked.setValue(false, true);
        },

        onSeparatorChange: function(field, newValue, oldValue, eOpts){
            var me = this,
                info = new Asc.asc_CFormatCellsInfo();
            info.asc_setType(this.FormatType);
            info.asc_setDecimalPlaces(this.spnDecimal.getNumberValue());
            info.asc_setSeparator(field.getValue()=='checked');

            var format = this.api.asc_getFormatCells(info),
                data = [];
            format.forEach(function(item) {
                data.push({value: item, displayValue: me.api.asc_getLocaleExample(item, -1234.12345678901234567890)});
            });
            this.cmbNegative.setData(data);
            this.cmbNegative.selectRecord(this.cmbNegative.store.at(0));
            this.cmbNegative.cmpEl.find('li:nth-child(2) a, li:nth-child(4) a').css({color: '#ff0000'});
            this.Format = format[0];
            this.FormatInfo = info;

            this.lblExample.text(this.api.asc_getLocaleExample(this.Format));
            this.chLinked.setValue(false, true);
        },

        onTypeSelect: function(combo, record){
            this.Format = record.value;
            this.lblExample.text(this.api.asc_getLocaleExample(this.Format));
            this.chLinked.setValue(false, true);
        },

        onCodeSelect: function(listView, itemView, record){
            if (!record) return;

            this.Format = record.get('format');
            this.lblExample.text(this.api.asc_getLocaleExample(this.Format));
            this.inputCustomFormat.setValue(record.get('value'));
            this.chLinked.setValue(false, true);
            this.inputCustomFormat.showWarning();
            this._state.warning = false;
        },

        onFormatSelect: function(combo, record, e, initFormatInfo) {
            if (!record) return;

            this.FormatType = record.value;

            var hasDecimal = (record.value == Asc.c_oAscNumFormatType.Number || record.value == Asc.c_oAscNumFormatType.Scientific || record.value == Asc.c_oAscNumFormatType.Accounting ||
                             record.value == Asc.c_oAscNumFormatType.Currency || record.value == Asc.c_oAscNumFormatType.Percent),
                hasNegative = (record.value == Asc.c_oAscNumFormatType.Number || record.value == Asc.c_oAscNumFormatType.Currency || record.value == Asc.c_oAscNumFormatType.Accounting),
                hasSeparator = (record.value == Asc.c_oAscNumFormatType.Number),
                hasType = (record.value == Asc.c_oAscNumFormatType.Date || record.value == Asc.c_oAscNumFormatType.Time || record.value == Asc.c_oAscNumFormatType.Fraction),
                hasSymbols = (record.value == Asc.c_oAscNumFormatType.Accounting || record.value == Asc.c_oAscNumFormatType.Currency),
                hasCode = (record.value == Asc.c_oAscNumFormatType.Custom),
                me = this,
                valDecimal = (initFormatInfo) ? initFormatInfo.asc_getDecimalPlaces() : this.spnDecimal.getNumberValue(),
                valSeparator = (initFormatInfo) ? initFormatInfo.asc_getSeparator() : (this.chSeparator.getValue()=='checked'),
                valSymbol = (initFormatInfo) ? (initFormatInfo.asc_getSymbol() || initFormatInfo.asc_getCurrencySymbol()) : this.langId;

            if (record.value !== Asc.c_oAscNumFormatType.Custom) {
                var info = new Asc.asc_CFormatCellsInfo();
                info.asc_setType(record.value);
                info.asc_setDecimalPlaces(hasDecimal ? valDecimal : 0);
                info.asc_setSeparator(hasSeparator ? valSeparator : false);

                if (hasNegative || record.value == Asc.c_oAscNumFormatType.Date || record.value == Asc.c_oAscNumFormatType.Time) {
                    if (hasSymbols) {
                        if (!me.CurrencySymbolsData) {
                            me.CurrencySymbolsData = [];
                            var symbolssarr = this.api.asc_getCurrencySymbols();
                            for (var code in symbolssarr) {
                                if (symbolssarr.hasOwnProperty(code)) {
                                    me.CurrencySymbolsData.push({value: parseInt(code), displayValue: symbolssarr[code] + ' ' + Common.util.LanguageInfo.getLocalLanguageName(code)[1]});
                                }
                            }
                            me.CurrencySymbolsData.sort(function(a, b){
                                if (a.displayValue < b.displayValue) return -1;
                                if (a.displayValue > b.displayValue) return 1;
                                return 0;
                            });
                            me.CurrencySymbolsData.unshift({value: null, displayValue: me.txtNone});
                            symbolssarr = this.api.asc_getAdditionalCurrencySymbols();
                            symbolssarr.forEach(function(item) {
                                me.CurrencySymbolsData.push({value: item, displayValue: item});
                            });
                            this.cmbSymbols.setData(this.CurrencySymbolsData);
                            this.cmbSymbols.setValue(valSymbol);
                        }
                        info.asc_setSymbol(this.cmbSymbols.getValue());
                    }

                    var formatsarr = this.api.asc_getFormatCells(info),
                        data = [],
                        exampleVal = (record.value == Asc.c_oAscNumFormatType.Date) ? 38822 : ((record.value == Asc.c_oAscNumFormatType.Time) ? 1.534 : parseFloat("-1234.12345678901234567890"));
                    formatsarr.forEach(function(item) {
                        data.push({value: item, displayValue: me.api.asc_getLocaleExample(item, exampleVal)});
                    });
                    if (hasNegative) {
                        this.cmbNegative.setData(data);
                        this.cmbNegative.selectRecord(this.cmbNegative.store.at(0));
                        this.cmbNegative.cmpEl.find('li:nth-child(2) a, li:nth-child(4) a').css({color: '#ff0000'});
                    } else {
                        this.cmbType.setData(data);
                        this.cmbType.selectRecord(this.cmbType.store.at(0));
                    }
                    this.Format = formatsarr[0];
                } else if (record.value == Asc.c_oAscNumFormatType.Fraction) {
                    this.cmbType.setData(this.FractionData);
                    this.cmbType.selectRecord(this.cmbType.store.at(0));
                    this.Format = this.cmbType.getValue();
                } else {
                    this.Format = this.api.asc_getFormatCells(info)[0];
                }
                this.FormatInfo = info;
            } else {
                var info = new Asc.asc_CFormatCellsInfo();
                info.asc_setType(Asc.c_oAscNumFormatType.Custom);
                info.asc_setSymbol(valSymbol);
                this.FormatInfo = info;

                var formatsarr = this.api.asc_getFormatCells(info),
                    data = [],
                    isCustom = (this.CustomFormat) ? true : false;
                formatsarr.forEach(function(item) {
                    var rec = new Common.UI.DataViewModel();
                    rec.set({
                        value: me.api.asc_convertNumFormat2NumFormatLocal(item),
                        format: item
                    });
                    data.push(rec);
                    if (me.CustomFormat == item)
                        isCustom = false;
                });
                if (isCustom) {
                    var rec = new Common.UI.DataViewModel();
                    rec.set({
                        value: me.api.asc_convertNumFormat2NumFormatLocal(this.CustomFormat),
                        format: this.CustomFormat
                    });
                    data.push(rec);
                }
                this.codesList.store.reset(data, {silent: false});
                var rec = this.codesList.store.findWhere({value: this.Format});
                rec && this.codesList.selectRecord(rec);
                rec && this.codesList.scrollToRecord(rec);
                this.inputCustomFormat.setValue(me.api.asc_convertNumFormat2NumFormatLocal(this.Format));
            }

            this.lblExample.text(this.api.asc_getLocaleExample(this.Format));

            this._decimalPanel.toggleClass('hidden', !hasDecimal);
            this._negativePanel.toggleClass('hidden', !hasNegative);
            this._separatorPanel.toggleClass('hidden', !hasSeparator);
            this._typePanel.toggleClass('hidden', !hasType);
            this._symbolsPanel.toggleClass('hidden', !hasSymbols);
            this._codePanel.toggleClass('hidden', !hasCode);
            this._nocodePanel.toggleClass('hidden', hasCode);
            this._state = { hasDecimal: hasDecimal, hasNegative: hasNegative, hasSeparator: hasSeparator, hasType: hasType, hasSymbols: hasSymbols, hasCode: hasCode};

            !initFormatInfo && this.chLinked.setValue(false, true);
        },

        textTitle: 'Number Format',
        textCategory: 'Category',
        textDecimal: 'Decimal',
        textSeparator: 'Use 1000 separator',
        textFormat: 'Format',
        textSymbols: 'Symbols',
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
        txtUpto1: 'Up to one digit (1/3)',
        txtUpto2: 'Up to two digits (12/25)',
        txtUpto3: 'Up to three digits (131/135)',
        txtAs2:  'As halfs (1/2)',
        txtAs8:  'As eighths (4/8)',
        txtAs4:  'As fourths (2/4)',
        txtAs16:  'As sixteenths (8/16)',
        txtAs10:  'As tenths (5/10)',
        txtAs100: 'As hundredths (50/100)',
        txtSample: 'Sample:',
        txtNone: 'None',
        textLinked: 'Linked to source',
        txtCustomWarning: 'Please enter the custom number format carefully. Spreadsheet Editor does not check custom formats for errors that may affect the xlsx file.'

    }, SSE.Views.FormatSettingsDialog || {}))
});