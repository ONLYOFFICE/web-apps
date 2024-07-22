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
 *  ChartDataRangeDialog.js
 *
 *  Created on 02.07.2020
 *
 */


if (Common === undefined)
    var Common = {};

define([], function () { 'use strict';

    SSE.Views.ChartDataRangeDialog = Common.UI.Window.extend(_.extend({
        options: {
            type: 0, // 0 - category, 1 - series
            width   : 350,
            cls     : 'modal-dlg',
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            this.type = options.type || 0;
            this.isScatter = options.isScatter;

            _.extend(this.options, {
                title: this.type==1 ? this.txtTitleSeries : this.txtTitleCategory
            }, options);

            this.template = [
                '<div class="box">',
                '<table cols="2" style="width: 100%;">',
                '<tr>',
                    '<td colspan="2">',
                        '<label>' + (this.type==1 ? this.txtSeriesName : this.txtAxisLabel) + '</label>',
                    '</td>',
                '</tr>',
                '<tr>',
                    '<td style="padding-bottom: 8px;width: 100%;">',
                        '<div id="id-dlg-chart-range-range1"></div>',
                    '</td>',
                    '<td style="padding-bottom: 8px;">',
                        '<label id="id-dlg-chart-range-lbl1" class="margin-left-5" style="width: 120px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 4px;">' + this.txtChoose + '</label>',
                    '</td>',
                '</tr>',
                '<% if (type==1) { %>',
                '<tr>',
                    '<td colspan="2">',
                        '<label>' + (this.isScatter ? this.txtXValues : this.txtValues) + '</label>',
                    '</td>',
                '</tr>',
                '<tr>',
                    '<td style="padding-bottom: 8px;width: 100%;">',
                        '<div id="id-dlg-chart-range-range2"></div>',
                    '</td>',
                    '<td style="padding-bottom: 8px;">',
                        '<label id="id-dlg-chart-range-lbl2" class="margin-left-5" style="width: 120px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 4px;"></label>',
                    '</td>',
                '</tr>',
                '<% if (isScatter) { %>',
                '<tr>',
                    '<td colspan="2">',
                        '<label>' + this.txtYValues + '</label>',
                    '</td>',
                '</tr>',
                '<tr>',
                    '<td style="padding-bottom: 8px;width: 100%;">',
                        '<div id="id-dlg-chart-range-range3"></div>',
                    '</td>',
                    '<td style="padding-bottom: 8px;">',
                        '<label id="id-dlg-chart-range-lbl3" class="margin-left-5" style="width: 120px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 4px;"></label>',
                    '</td>',
                '</tr>',
                '<% } %>',
                '<% } %>',
                '</table>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var $window = this.getChild(),
                me = this;

            me.inputRange1 = new Common.UI.InputFieldBtn({
                el: $('#id-dlg-chart-range-range1'),
                style: '100%',
                btnHint: this.textSelectData,
                // validateOnChange: true,
                validateOnBlur: false
            }).on('changed:after', function(input, newValue, oldValue, e) {
                if (newValue == oldValue) return;
                me.updateRangeData(1, newValue);
            }).on('changing', function(input, newValue, oldValue, e) {
                if (newValue == oldValue) return;
                // me.onInputChanging(input, newValue, oldValue);
            }).on('button:click', _.bind(this.onSelectData, this, 1));
            this.lblRange1 = $window.find('#id-dlg-chart-range-lbl1');

            me.inputRange2 = new Common.UI.InputFieldBtn({
                el: $('#id-dlg-chart-range-range2'),
                style: '100%',
                btnHint: this.textSelectData,
                // validateOnChange: true,
                validateOnBlur: false
            }).on('changed:after', function(input, newValue, oldValue, e) {
                if (newValue == oldValue) return;
                me.updateRangeData(2, newValue);
            }).on('changing', function(input, newValue, oldValue, e) {
                if (newValue == oldValue) return;
                // me.onInputChanging(input, newValue, oldValue);
            }).on('button:click', _.bind(this.onSelectData, this, 2));
            this.lblRange2 = $window.find('#id-dlg-chart-range-lbl2');

            me.inputRange3 = new Common.UI.InputFieldBtn({
                el: $('#id-dlg-chart-range-range3'),
                style: '100%',
                btnHint: this.textSelectData,
                // validateOnChange: true,
                validateOnBlur: false
            }).on('changed:after', function(input, newValue, oldValue, e) {
                if (newValue == oldValue) return;
                me.updateRangeData(3, newValue);
            }).on('changing', function(input, newValue, oldValue, e) {
                if (newValue == oldValue) return;
                // me.onInputChanging(input, newValue, oldValue);
            }).on('button:click', _.bind(this.onSelectData, this, 3));
            this.lblRange3 = $window.find('#id-dlg-chart-range-lbl3');

            $window.find('.dlg-btn').on('click',     _.bind(this.onBtnClick, this));
        },

        getFocusedComponents: function() {
            return [this.inputRange1, this.inputRange2, this.inputRange3].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            if (this._alreadyRendered) return; // focus only at first show
            this._alreadyRendered = true;
            return this.inputRange1;
        },

        onPrimary: function() {
            this._handleInput('ok');
            return false;
        },

        setSettings: function(settings) {
            var me = this;
            this.api = settings.api;
            this.props = settings.props;
            this.chartSettings = settings.chartSettings;

            if (this.type==1) {
                if (this.props.series) {
                    var series = this.props.series;
                    this.inputRange1.setValue(series.asc_getName());
                    this.lblRange1.text((this.inputRange1.getValue()!=='') ? ('= ' + (series.asc_getNameVal() || '')) : this.txtChoose);
                    if (this.props.isScatter) {
                        var arr = series.asc_getXValuesArr();
                        this.inputRange2.setValue(series.asc_getXValues());
                        this.lblRange2.text((this.inputRange2.getValue()!=='') ? ('= ' + (arr ? arr.join('; ') : '')) : this.txtChoose);

                        this.inputRange3.setValue(series.asc_getYValues());
                        arr = series.asc_getYValuesArr();
                        this.lblRange3.text((this.inputRange3.getValue()!=='') ? ('= ' + (arr ? arr.join('; ') : '')) : this.txtChoose);
                    } else {
                        var arr = series.asc_getValuesArr();
                        this.inputRange2.setValue(series.asc_getValues());
                        this.lblRange2.text((this.inputRange2.getValue()!=='') ? ('= ' + (arr ? arr.join('; ') : '')) : this.txtChoose);
                    }
                }
            } else {
                var arr = this.props.values;
                this.inputRange1.setValue(this.props.category || '');
                this.lblRange1.text((this.inputRange1.getValue()!=='') ? ('= ' + (arr ? arr.join('; ') : '')) : this.txtChoose);
            }
        },

        getSettings: function () {
            return {name: this.inputRange1.getValue(), valuesX: this.inputRange2.getValue(), valuesY: this.inputRange3.getValue()};
        },

        onSelectData: function(type, input) {
            var me = this;
            if (me.api) {
                var handlerDlg = function(dlg, result) {
                    if (result == 'ok') {
                        input.setValue(dlg.getSettings());
                        _.delay(function(){
                            me.updateRangeData(type, dlg.getSettings());
                        },10);
                    }
                };

                var win = new SSE.Views.CellRangeDialog({
                    allowBlank: true,
                    handler: handlerDlg
                }).on('close', function() {
                    // me.onInputChanging(input);
                    me.show();
                    _.delay(function(){
                        me._noApply = true;
                        input.focus();
                        me._noApply = false;
                    },1);
                });

                var xy = me.$window.offset();
                me.hide();
                win.show(xy.left + 65, xy.top + 77);
                win.setSettings({
                    api     : me.api,
                    range   : !_.isEmpty(input.getValue()) ? input.getValue() : '',
                    type    : Asc.c_oAscSelectionDialogType.Chart,
                    validation: function() {return true;}
                });
            }
        },

        isRangeValid: function(type, value) {
            var isvalid;
            switch (type) {
                case 1:
                    if (this.props.series) {
                        isvalid = this.props.series.asc_IsValidName(value);
                    } else {
                        isvalid = this.chartSettings.isValidCatFormula(value);
                    }
                    break;
                case 2:
                    if (this.props.isScatter) {
                        isvalid = this.props.series.asc_IsValidXValues(value);
                    } else {
                        isvalid = this.props.series.asc_IsValidValues(value);
                    }
                    break;
                case 3:
                    isvalid = this.props.series.asc_IsValidYValues(value);
                    break;
            }
            if (isvalid === true || isvalid == Asc.c_oAscError.ID.No)
                return true;

            var error = this.textInvalidRange;
            switch (isvalid) {
                case Asc.c_oAscError.ID.StockChartError:
                    error = this.errorStockChart;
                    break;
                case Asc.c_oAscError.ID.MaxDataSeriesError:
                    error = this.errorMaxRows;
                    break;
                case Asc.c_oAscError.ID.MaxDataPointsError:
                    error = this.errorMaxPoints;
                    break;
                case Asc.c_oAscError.ID.ErrorInFormula:
                    error = this.errorInFormula;
                    break;
                case Asc.c_oAscError.ID.InvalidReference:
                    error = this.errorInvalidReference;
                    break;
                case Asc.c_oAscError.ID.NoSingleRowCol:
                    error = this.errorNoSingleRowCol;
                    break;
                case Asc.c_oAscError.ID.NoValues:
                    error = this.errorNoValues;
                    break;
            }
            Common.UI.warning({msg: error, maxwidth: 600});
            return false;
        },

        updateRangeData: function(type, value) {
            if (!this.isRangeValid(type, value)) return;

            if (this.props.series) {
                var series = this.props.series;
                switch (type) {
                    case 1:
                        series.asc_setName(value);
                        this.lblRange1.text((this.inputRange1.getValue()!=='') ? ('= ' + (series.asc_getNameVal() || '')) : this.txtChoose);
                        break;
                    case 2:
                        if (this.isScatter) {
                            var arr = series.asc_getXValuesArr();
                            series.asc_setXValues(value);
                            this.lblRange2.text((this.inputRange2.getValue()!=='') ? ('= ' + (arr ? arr.join('; ') : '')) : this.txtChoose);
                        } else {
                            var arr = series.asc_getValuesArr();
                            series.asc_setValues(value);
                            this.lblRange2.text((this.inputRange2.getValue()!=='') ? ('= ' + (arr ? arr.join('; ') : '')) : this.txtChoose);
                        }
                        break;
                    case 3:
                        var arr = series.asc_getYValuesArr();
                        series.asc_setYValues(value);
                        this.lblRange3.text((this.inputRange3.getValue()!=='') ? ('= ' + (arr ? arr.join('; ') : '')) : this.txtChoose);
                        break;
                }
            } else {
                this.chartSettings.setCatFormula(value);
                var arr = this.chartSettings.getCatValues();
                this.lblRange1.text((this.inputRange1.getValue()!=='') ? ('= ' + (arr ? arr.join('; ') : '')) : this.txtChoose);
            }
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        _handleInput: function(state) {
            if (this.options.handler) {
                if (state == 'ok') {
                    if (!this.isRangeValid(1, this.inputRange1.getValue())) return;
                    if (this.type==1 && !this.isRangeValid(2, this.inputRange2.getValue())) return;
                    if (this.type==1 && this.isScatter && !this.isRangeValid(3, this.inputRange3.getValue())) return;
                }
                if (this.options.handler.call(this, this, state))
                    return;
            }

            this.close();
        },

        txtTitleSeries: 'Edit Series',
        txtTitleCategory: 'Axis Labels',
        txtSeriesName: 'Series name',
        txtValues: 'Values',
        txtXValues: 'X Values',
        txtYValues: 'Y Values',
        txtAxisLabel: 'Axis label range',
        txtChoose: 'Choose range',
        textSelectData: 'Select data',
        textInvalidRange:   'Invalid cells range',
        errorMaxRows: 'The maximum number of data series per chart is 255.',
        errorStockChart: 'Incorrect row order. To build a stock chart place the data on the sheet in the following order:<br> opening price, max price, min price, closing price.',
        errorMaxPoints: 'The maximum number of points in series per chart is 4096.',
        errorInFormula: "There's an error in formula you entered.",
        errorInvalidReference: 'The reference is not valid. Reference must be to an open worksheet.',
        errorNoSingleRowCol: 'The reference is not valid. References for titles, values, sizes, or data labels must be a single cell, row, or column.',
        errorNoValues: 'To create a chart, the series must contain at least one value.'

    }, SSE.Views.ChartDataRangeDialog || {}))
});
