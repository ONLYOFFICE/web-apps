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
 *  HyphenationDialog.js
 *
 *  Created on 24/08/23
 *
 */

define([], function () { 'use strict';

    DE.Views.HyphenationDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 290,
            header: true,
            style: 'min-width: 290px;',
            cls: 'modal-dlg',
            id: 'window-hyphenation-dlg',
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.template = [
                '<div class="box">',
                    '<table cols="2" style="width: 100%;">',
                        '<tr>',
                            '<td colspan="2" style="padding-bottom: 15px;">',
                                '<div id="hyphenation-chk-auto"></div>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td colspan="2" style="padding-bottom: 15px;">',
                                '<div id="hyphenation-chk-caps"></div>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td style="padding-bottom: 10px;">',
                                '<label class="margin-right-5">' + this.textZone + '</label>',
                            '</td>',
                            '<td style="padding-bottom: 10px;">',
                                '<div id="hyphenation-num-zone" style="display: inline-block;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td style="padding-bottom: 5px;">',
                                '<label class="margin-right-5">' + this.textLimit + '</label>',
                            '</td>',
                            '<td style="padding-bottom: 5px;">',
                                '<div id="hyphenation-num-limit" style="display: inline-block;"></div>',
                            '</td>',
                        '</tr>',
                    '</table>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);
            this._changedProps = null;
            this._noApply = false;

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);
            var $window = this.getChild();

            this.chAuto = new Common.UI.CheckBox({
                el: $window.find('#hyphenation-chk-auto'),
                labelText: this.textAuto
            }).on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps)
                    this._changedProps.setAutoHyphenation(field.getValue()==='checked');
            }, this));

            this.chCaps = new Common.UI.CheckBox({
                el: $window.find('#hyphenation-chk-caps'),
                labelText: this.textCaps
            }).on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps)
                    this._changedProps.setHyphenateCaps(field.getValue()==='checked');
            }, this));

            this.spnLimit = new Common.UI.MetricSpinner({
                el: $window.find('#hyphenation-num-limit'),
                step: 1,
                width: 80,
                defaultUnit : '',
                value: -1,
                autoText: this.textNoLimit,
                allowAuto: true,
                maxValue: 32767,
                minValue: 1
            });
            this.spnLimit.setValue(-1);
            this.spnLimit.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                 if (this._changedProps) {
                    var value = field.getNumberValue();
                    this._changedProps.setHyphenationLimit(value<0 ? 0 : value);
                 }
            }, this));
            this.spnLimit.on('changing', _.bind(function(field, newValue, oldValue, eOpts){
                if (parseInt(newValue)===0) field.setValue(-1);
            }, this));

            this.spnZone = new Common.UI.MetricSpinner({
                el: $window.find('#hyphenation-num-zone'),
                step: 0.1,
                width: 80,
                defaultUnit : 'cm',
                value: '1 cm',
                maxValue: 55.87,
                minValue: 0
            });
            this.spnZone.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    var value = field.getNumberValue();
                    this._changedProps.setHyphenationZone(parseInt(Common.Utils.Metric.fnRecalcToMM(value) * 72 * 20 / 25.4));
                }
            }, this));

            this.getChild().find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

            this.updateMetricUnit();
        },

        getFocusedComponents: function() {
            return [this.chAuto, this.chCaps, this.spnZone, this.spnLimit].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.chAuto;
        },

        afterRender: function() {
        },

        setSettings: function (props) {
            if (props) {
                this.chAuto.setValue(!!props.isAutoHyphenation(), true);
                this.chCaps.setValue(!!props.isHyphenateCaps(), true);
                var value = props.getHyphenationLimit() || 0;
                this.spnLimit.setValue(value!==null && value!==undefined ? (value===0 ? -1 : value) : '', true);
                value = props.getHyphenationZone();
                this.spnZone.setValue(value!==null && value!==undefined ? Common.Utils.Metric.fnRecalcFromMM(value * 25.4 / 20 / 72.0) : '', true);
            }
            this._changedProps = props || new AscCommon.AutoHyphenationSettings();
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

        onPrimary: function() {
            this._handleInput('ok');
            return false;
        },

        getSettings: function() {
            return this._changedProps;
        },

        updateMetricUnit: function() {
            this.spnZone.setDefaultUnit(Common.Utils.Metric.getCurrentMetricName());
            this.spnZone.setStep(Common.Utils.Metric.getCurrentMetric()==Common.Utils.Metric.c_MetricUnits.pt ? 1 : 0.1);
        },

        textTitle: 'Hyphenation',
        textAuto: 'Automatically hyphenate document',
        textCaps: 'Hyphenate words in CAPS',
        textLimit: 'Limit consecutive hyphens to',
        textNoLimit: 'No limit',
        textZone: 'Hyphenation zone'
    }, DE.Views.HyphenationDialog || {}))
});