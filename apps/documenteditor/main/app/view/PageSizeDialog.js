/*
 *
 * (c) Copyright Ascensio System SIA 2010-2019
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
 *  PageSizeDialog.js
 *
 *  Created by Julia Radzhabova on 2/16/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/component/Window',
    'common/main/lib/component/MetricSpinner'
], function () { 'use strict';

    DE.Views.PageSizeDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 215,
            header: true,
            style: 'min-width: 216px;',
            cls: 'modal-dlg',
            id: 'window-page-size'
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.template = [
                '<div class="box" style="height: 85px;">',
                    '<table cols="2" style="width: 100%;">',
                        '<tr>',
                            '<td colspan="2">',
                                '<label class="input-label">' + this.textPreset + '</label>',
                                '<div id="page-size-combo-preset" class="input-group-nr" style="margin-bottom: 10px;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td style="padding-right: 10px;">',
                                '<label class="input-label">' + this.textWidth + '</label>',
                                '<div id="page-size-spin-width"></div>',
                            '</td>',
                            '<td>',
                                '<label class="input-label">' + this.textHeight + '</label>',
                                '<div id="page-size-spin-height"></div>',
                            '</td>',
                        '</tr>',
                    '</table>',
                '</div>',
                '<div class="separator horizontal"/>',
                '<div class="footer center">',
                    '<button class="btn normal dlg-btn primary" result="ok" style="margin-right: 10px;">' + this.okButtonText + '</button>',
                    '<button class="btn normal dlg-btn" result="cancel">' + this.cancelButtonText + '</button>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);

            this.spinners = [];
            this._noApply = false;
            this.isOrientPortrait = true;

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            this.spnWidth = new Common.UI.MetricSpinner({
                el: $('#page-size-spin-width'),
                step: .1,
                width: 86,
                defaultUnit : "cm",
                value: '10 cm',
                maxValue: 118.9,
                minValue: 0
            });
            this.spinners.push(this.spnWidth);
            this.spnWidth.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (!this._noApply && this.cmbPreset.getValue() >-1)
                    this.cmbPreset.setValue(-1);
            }, this));

            this.spnHeight = new Common.UI.MetricSpinner({
                el: $('#page-size-spin-height'),
                step: .1,
                width: 86,
                defaultUnit : "cm",
                value: '20 cm',
                maxValue: 118.9,
                minValue: 0
            });
            this.spinners.push(this.spnHeight);
            this.spnHeight.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (!this._noApply && this.cmbPreset.getValue() >-1)
                    this.cmbPreset.setValue(-1);
            }, this));

            this.cmbPreset = new Common.UI.ComboBox({
                el: $('#page-size-combo-preset'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 183px;max-height: 208px;',
                editable: false,
                scrollAlwaysVisible: true,
                data: [
                    { value: 0, displayValue: 'US Letter', size: [215.9, 279.4]},
                    { value: 1, displayValue: 'US Legal', size: [215.9, 355.6]},
                    { value: 2, displayValue: 'A4', size: [210, 297]},
                    { value: 3, displayValue: 'A5', size: [148, 210]},
                    { value: 4, displayValue: 'B5', size: [176, 250]},
                    { value: 5, displayValue: 'Envelope #10', size: [104.8, 241.3]},
                    { value: 6, displayValue: 'Envelope DL', size: [110, 220]},
                    { value: 7, displayValue: 'Tabloid', size: [279.4, 431.8]},
                    { value: 8, displayValue: 'A3', size: [297, 420]},
                    { value: 9, displayValue: 'Tabloid Oversize', size: [304.8, 457.1]},
                    { value: 10, displayValue: 'ROC 16K', size: [196.8, 273]},
                    { value: 11, displayValue: 'Envelope Choukei 3', size: [119.9, 234.9]},
                    { value: 12, displayValue: 'Super B/A3', size: [330.2, 482.5]},
                    { value: 13, displayValue: 'A0', size: [841, 1189]},
                    { value: 14, displayValue: 'A1', size: [594, 841]},
                    { value: 16, displayValue: 'A2', size: [420, 594]},
                    { value: 17, displayValue: 'A6', size: [105, 148]},
                    { value: -1, displayValue: this.txtCustom, size: []}
                ]
            });
            this.cmbPreset.setValue(-1);
            this.cmbPreset.on('selected', _.bind(function(combo, record) {
                this._noApply = true;
                if (record.value<0) {
                } else {
                    this.spnWidth.setValue(Common.Utils.Metric.fnRecalcFromMM(this.isOrientPortrait ? record.size[0] : record.size[1]), true);
                    this.spnHeight.setValue(Common.Utils.Metric.fnRecalcFromMM(this.isOrientPortrait ? record.size[1] : record.size[0]), true);
                }
                this._noApply = false;
            }, this));

            var $window = this.getChild();
            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

            this.updateMetricUnit();
        },

        _handleInput: function(state) {
            if (this.options.handler) {
                this.options.handler.call(this, this, state);
            }

            this.close();
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        onPrimary: function(event) {
            this._handleInput('ok');
            return false;
        },

        setSettings: function (props) {
            if (props) {
                this.isOrientPortrait = (props.get_W() < props.get_H());
                this.spnWidth.setMinValue(Common.Utils.Metric.fnRecalcFromMM(props.get_LeftMargin() + props.get_RightMargin() + 12.7));
                this.spnWidth.setValue(Common.Utils.Metric.fnRecalcFromMM(props.get_W()), true);
                this.spnHeight.setMinValue(Common.Utils.Metric.fnRecalcFromMM(props.get_TopMargin() + props.get_BottomMargin() + 2.6));
                this.spnHeight.setValue(Common.Utils.Metric.fnRecalcFromMM(props.get_H()), true);
                var width = this.isOrientPortrait ? props.get_W() : props.get_H(),
                    height = this.isOrientPortrait ? props.get_H() : props.get_W();
                var rec = this.cmbPreset.store.find(function(item){
                    var size = item.get('size');
                    return (Math.abs(size[0] - width) < 0.1 && Math.abs(size[1] - height) < 0.1);
                });
                this.cmbPreset.setValue((rec) ? rec.get('value') : -1);
            }
        },

        getSettings: function() {
            return [Common.Utils.Metric.fnRecalcToMM(this.spnWidth.getNumberValue()), Common.Utils.Metric.fnRecalcToMM(this.spnHeight.getNumberValue())];
        },

        updateMetricUnit: function() {
            if (this.spinners) {
                for (var i=0; i<this.spinners.length; i++) {
                    var spinner = this.spinners[i];
                    spinner.setDefaultUnit(Common.Utils.Metric.getCurrentMetricName());
                    spinner.setStep(Common.Utils.Metric.getCurrentMetric()==Common.Utils.Metric.c_MetricUnits.pt ? 1 : 0.1);
                }
            }

        },

        textTitle: 'Page Size',
        textWidth: 'Width',
        textHeight: 'Height',
        cancelButtonText:   'Cancel',
        okButtonText:       'Ok',
        textPreset: 'Preset',
        txtCustom: 'Custom'
    }, DE.Views.PageSizeDialog || {}))
});