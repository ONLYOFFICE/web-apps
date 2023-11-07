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
 *  FillSeriesDialog.js
 *
 *  Created by Julia Radzhabova on 07.11.2023
 *  Copyright (c) 2023 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/RadioBox',
    'common/main/lib/component/CheckBox',
    'common/main/lib/component/InputField',
    'common/main/lib/view/AdvancedSettingsWindow'
], function () { 'use strict';

    SSE.Views.FillSeriesDialog = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 350,
            separator: false
        },

        initialize : function(options) {
            var me = this;

            _.extend(this.options, {
                title: this.textTitle,
                contentStyle: 'padding: 0 5px;',
                contentTemplate: _.template([
                    '<div class="settings-panel active">',
                    '<div class="inner-content">',
                        '<table cols="3" style="width: 100%;">',
                            '<tr>',
                                '<td class="padding-small">',
                                    '<label class="header">', me.textSeries,'</label>',
                                '</td>',
                                '<td class="padding-small">',
                                    '<label class="header">', me.textType,'</label>',
                                '</td>',
                                '<td class="padding-small">',
                                    '<label class="header">', me.textDateUnit,'</label>',
                                '</td>',
                            '</tr>',
                            '<tr>',
                                '<td class="padding-small">',
                                    '<div id="fill-radio-cols"></div>',
                                '</td>',
                                '<td class="padding-small">',
                                    '<div id="fill-radio-linear"></div>',
                                '</td>',
                                '<td class="padding-small">',
                                    '<div id="fill-radio-day"></div>',
                                '</td>',
                            '</tr>',
                            '<tr>',
                                '<td class="padding-small">',
                                    '<div id="fill-radio-rows"></div>',
                                '</td>',
                                '<td class="padding-small">',
                                    '<div id="fill-radio-growth"></div>',
                                '</td>',
                                '<td class="padding-small">',
                                    '<div id="fill-radio-weekday"></div>',
                                '</td>',
                            '</tr>',
                            '<tr>',
                                '<td class="padding-small">',
                                '</td>',
                                '<td class="padding-small">',
                                    '<div id="fill-radio-date"></div>',
                                '</td>',
                                '<td class="padding-small">',
                                    '<div id="fill-radio-month"></div>',
                                '</td>',
                            '</tr>',
                            '<tr>',
                                '<td class="padding-large">',
                                '</td>',
                                '<td class="padding-large">',
                                    '<div id="fill-radio-autofill"></div>',
                                '</td>',
                                '<td class="padding-large">',
                                    '<div id="fill-radio-year"></div>',
                                '</td>',
                            '</tr>',
                            '<tr>',
                                '<td colspan=3 class="padding-small">',
                                    '<div id="fill-chb-trend"></div>',
                                '</td>',
                            '</tr>',
                            '<tr>',
                                '<td class="padding-small">',
                                    '<label className="input-label">', me.textStep, '</label>',
                                    '<div id="fill-input-step-value"></div>',
                                '</td>',
                                '<td class="padding-small">',
                                    '<label className="input-label">', me.textStop, '</label>',
                                    '<div id="fill-input-stop-value"></div>',
                                '</td>',
                                '<td class="padding-small">',
                                '</td>',
                            '</tr>',
                        '</table>',
                    '</div></div>'
                ].join(''))()
            }, options);

            this.handler    = options.handler;
            this.props      = options.props;

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this,
                $window = this.getChild();

            this.radioCols = new Common.UI.RadioBox({
                el: $window.find('#fill-radio-cols'),
                name: 'asc-radio-series',
                labelText: this.textCols,
                value: Asc.c_oSpecialPasteProps.paste
            });
            this.radioCols.on('change', _.bind(this.onRadioSeriesChange, this));

            this.radioRows = new Common.UI.RadioBox({
                el: $window.find('#fill-radio-rows'),
                name: 'asc-radio-series',
                labelText: this.textRows,
                value: Asc.c_oSpecialPasteProps.paste
            });
            this.radioRows.on('change', _.bind(this.onRadioSeriesChange, this));

            this.radioLinear = new Common.UI.RadioBox({
                el: $window.find('#fill-radio-linear'),
                name: 'asc-radio-type',
                labelText: this.textLinear,
                value: Asc.c_oSpecialPasteProps.paste
            });
            this.radioLinear.on('change', _.bind(this.onRadioTypeChange, this));

            this.radioGrowth = new Common.UI.RadioBox({
                el: $window.find('#fill-radio-growth'),
                name: 'asc-radio-type',
                labelText: this.textGrowth,
                value: Asc.c_oSpecialPasteProps.paste
            });
            this.radioGrowth.on('change', _.bind(this.onRadioTypeChange, this));

            this.radioDate = new Common.UI.RadioBox({
                el: $window.find('#fill-radio-date'),
                name: 'asc-radio-type',
                labelText: this.textDate,
                value: Asc.c_oSpecialPasteProps.paste
            });
            this.radioDate.on('change', _.bind(this.onRadioTypeChange, this));

            this.radioAuto = new Common.UI.RadioBox({
                el: $window.find('#fill-radio-autofill'),
                name: 'asc-radio-type',
                labelText: this.textAuto,
                value: Asc.c_oSpecialPasteProps.paste
            });
            this.radioAuto.on('change', _.bind(this.onRadioTypeChange, this));

            this.radioDay = new Common.UI.RadioBox({
                el: $window.find('#fill-radio-day'),
                name: 'asc-radio-date',
                labelText: this.textDay,
                value: Asc.c_oSpecialPasteProps.paste
            });
            this.radioDay.on('change', _.bind(this.onRadioDateChange, this));

            this.radioWeek = new Common.UI.RadioBox({
                el: $window.find('#fill-radio-weekday'),
                name: 'asc-radio-date',
                labelText: this.textWeek,
                value: Asc.c_oSpecialPasteProps.paste
            });
            this.radioWeek.on('change', _.bind(this.onRadioDateChange, this));

            this.radioMonth = new Common.UI.RadioBox({
                el: $window.find('#fill-radio-month'),
                name: 'asc-radio-date',
                labelText: this.textMonth,
                value: Asc.c_oSpecialPasteProps.paste
            });
            this.radioMonth.on('change', _.bind(this.onRadioDateChange, this));

            this.radioYear = new Common.UI.RadioBox({
                el: $window.find('#fill-radio-year'),
                name: 'asc-radio-date',
                labelText: this.textYear,
                value: Asc.c_oSpecialPasteProps.paste
            });
            this.radioYear.on('change', _.bind(this.onRadioDateChange, this));

            this.chTrend = new Common.UI.CheckBox({
                el: $window.find('#fill-chb-trend'),
                labelText: this.textTrend
            });

            this.inputStep = new Common.UI.InputField({
                el               : $window.find('#fill-input-step-value'),
                style            : 'width: 85px;',
                allowBlank       : true,
                validateOnBlur   : false
            });

            this.inputStop = new Common.UI.InputField({
                el               : $window.find('#fill-input-stop-value'),
                style            : 'width: 85px;',
                allowBlank       : true,
                validateOnBlur   : false
            });

            this.afterRender();
        },

        getFocusedComponents: function() {
            return [this.radioCols, this.radioRows, this.radioLinear, this.radioGrowth, this.radioDate, this.radioAuto,
                this.radioDay, this.radioWeek, this.radioMonth, this.radioYear, this.chTrend, this.inputStep, this.inputStop].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.radioCols;
        },

        afterRender: function() {
            this._setDefaults(this.props);
        },

        show: function() {
            Common.Views.AdvancedSettingsWindow.prototype.show.apply(this, arguments);
        },

        _setDefaults: function (props) {
            var me = this;
            if (props) {
                this.radioCols.setValue(true, true);
                this.radioLinear.setValue(true, true);
                this.radioDay.setValue(true, true);
            }
        },

        getSettings: function () {
        },

        onDlgBtnClick: function(event) {
            this._handleInput((typeof(event) == 'object') ? event.currentTarget.attributes['result'].value : event);
        },

        onPrimary: function() {
            this._handleInput('ok');
            return false;
        },

        _handleInput: function(state) {
            this.handler && this.handler.call(this, state,  (state == 'ok') ? this.getSettings() : undefined);
            this.close();
        },

        onRadioTypeChange: function(field, newValue, eOpts) {
            if (newValue && this._changedProps) {
                // this._changedProps.asc_setProps(field.options.value);
                var isDate = field.options.value == Asc.c_oSpecialPasteProps.Date,
                    isAuto = field.options.value == Asc.c_oSpecialPasteProps.Auto;
                this.radioDay.setDisabled(!isDate);
                this.radioMonth.setDisabled(!isDate);
                this.radioWeek.setDisabled(!isDate);
                this.radioYear.setDisabled(!isDate);
                this.inputStep.setDisabled(isAuto);
                this.inputStop.setDisabled(isAuto);
            }
        },

        onRadioSeriesChange: function(field, newValue, eOpts) {
            if (newValue && this._changedProps) {
                // this._changedProps.asc_setOperation(field.options.value);
            }
        },

        onRadioDateChange: function(field, newValue, eOpts) {
            if (newValue && this._changedProps) {
                // this._changedProps.asc_setOperation(field.options.value);
            }
        },

        textTitle: 'Series',
        textSeries: 'Series in',
        textType: 'Type',
        textDateUnit: 'Date unit',
        textStep: 'Step value',
        textStop: 'Stop value',
        textCols: 'Columns',
        textRows: 'Rows',
        textLinear: 'Linear',
        textGrowth: 'Growth',
        textDate: 'Date',
        textAuto: 'AutoFill',
        textDay: 'Day',
        textWeek: 'Weekday',
        textMonth: 'Month',
        textYear: 'Year',
        textTrend: 'Trend'

    }, SSE.Views.FillSeriesDialog || {}))
});