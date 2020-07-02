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
 *  ChartDataRangeDialog.js
 *
 *  Created by Julia Radzhabova on 02.07.2020
 *  Copyright (c) 2020 Ascensio System SIA. All rights reserved.
 *
 */


if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/component/InputField',
    'common/main/lib/component/Window'
], function () { 'use strict';

    SSE.Views.ChartDataRangeDialog = Common.UI.Window.extend(_.extend({
        options: {
            type: 0, // 0 - category, 1 - series
            width   : 350,
            cls     : 'modal-dlg',
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            this.type = options.type || 0;

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
                        '<label id="id-dlg-chart-range-lbl1" style="width: 120px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-left: 5px;margin-top: 4px;">' + this.txtChoose + '</label>',
                    '</td>',
                '</tr>',
                '<% if (type==1) { %>',
                '<tr>',
                    '<td colspan="2">',
                        '<label>' + this.txtValues + '</label>',
                    '</td>',
                '</tr>',
                '<tr>',
                    '<td style="padding-bottom: 8px;width: 100%;">',
                        '<div id="id-dlg-chart-range-range2"></div>',
                    '</td>',
                    '<td style="padding-bottom: 8px;">',
                        '<label id="id-dlg-chart-range-lbl2" style="width: 120px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-left: 5px;margin-top: 4px;"></label>',
                    '</td>',
                '</tr>',
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
                textSelectData: 'Select data',
                validateOnChange: true,
                validateOnBlur: false
            }).on('changed:after', function(input, newValue, oldValue, e) {
            }).on('changing', function(input, newValue, oldValue, e) {
                if (newValue == oldValue) return;
                // me.onInputChanging(input, newValue, oldValue);
            }).on('button:click', _.bind(this.onSelectData, this));
            this.lblRange1 = $window.find('#id-dlg-chart-range-lbl1');

            me.inputRange2 = new Common.UI.InputFieldBtn({
                el: $('#id-dlg-chart-range-range2'),
                style: '100%',
                textSelectData: 'Select data',
                validateOnChange: true,
                validateOnBlur: false
            }).on('changed:after', function(input, newValue, oldValue, e) {
            }).on('changing', function(input, newValue, oldValue, e) {
                if (newValue == oldValue) return;
                // me.onInputChanging(input, newValue, oldValue);
            }).on('button:click', _.bind(this.onSelectData, this));
            this.lblRange2 = $window.find('#id-dlg-chart-range-lbl2');

            $window.find('.dlg-btn').on('click',     _.bind(this.onBtnClick, this));

           _.defer(function(){
               me.inputRange1.cmpEl.find('input').focus();
           }, 10);
        },

        onPrimary: function() {
            this._handleInput('ok');
            return false;
        },

        setSettings: function(settings) {
            var me = this;
            this.api = settings.api;
        },

        getSettings: function () {
            return {name: this.inputRange1.getValue(), value: this.inputRange2.getValue()};
        },

        onSelectData: function(input) {
            var me = this;
            if (me.api) {
                var changedValue = input.getValue();
                var handlerDlg = function(dlg, result) {
                    if (result == 'ok') {
                        changedValue = dlg.getSettings();
                    }
                };

                var win = new SSE.Views.CellRangeDialog({
                    allowBlank: true,
                    handler: handlerDlg
                }).on('close', function() {
                    input.setValue(changedValue);
                    // me.onInputChanging(input);
                    me.show();
                    _.delay(function(){
                        me._noApply = true;
                        input.cmpEl.find('input').focus();
                        me._noApply = false;
                    },1);
                });

                var xy = me.$window.offset();
                me.hide();
                win.show(xy.left + 65, xy.top + 77);
                win.setSettings({
                    api     : me.api,
                    range   : !_.isEmpty(input.getValue()) ? input.getValue() : '',
                    type    : Asc.c_oAscSelectionDialogType.Chart
                });
            }
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        _handleInput: function(state) {
            if (this.options.handler) {
                if (state == 'ok') {
                    if (this.inputRange1.checkValidate() !== true)
                        return;
                    if (type==1 && this.inputRange2.checkValidate() !== true)
                        return;
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
        txtAxisLabel: 'Axis label range',
        txtChoose: 'Choose range',
        textSelectData: 'Select data',
        txtEmpty    : 'This field is required',
        txtInvalidRange: 'ERROR! Invalid cells range'
    }, SSE.Views.ChartDataRangeDialog || {}))
});
