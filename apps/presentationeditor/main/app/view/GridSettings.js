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
 *  GridSettings.js
 *
 *  Created on 09/30/22
 *
 */

define([
    'common/main/lib/component/Window',
    'common/main/lib/component/MetricSpinner',
    'common/main/lib/component/ComboBox'
], function () { 'use strict';

    PE.Views.GridSettings = Common.UI.Window.extend(_.extend({
        options: {
            width: 214,
            header: true,
            style: 'min-width: 315px;',
            cls: 'modal-dlg',
            id: 'window-grid-settings',
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.template = [
                '<div class="box">',
                    '<div class="input-row">',
                        '<label class="text">' + this.textSpacing + '</label>',
                    '</div>',
                    '<div id="grid-spacing-combo" class="input-group-nr" style="margin-bottom:10px;"></div>',
                    '<div id="grid-spacing-spin" class="margin-left-10" style="margin-bottom:10px;"></div>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var $window = this.getChild();
            var arr = Common.define.gridlineData.getGridlineData(Common.Utils.Metric.getCurrentMetric());
            this.arrSpacing = [];
            for (var i = 0; i < arr.length; i++) {
                this.arrSpacing.push({
                    displayValue: arr[i].caption,
                    value: i,
                    spacing: arr[i].value
                });
            }
            this.arrSpacing.push({ displayValue: this.textCustom, value: -1 });

            this.cmbGridSpacing = new Common.UI.ComboBox({
                el: $window.find('#grid-spacing-combo'),
                cls: 'input-group-nr',
                style: 'width: 100%;',
                menuStyle: 'min-width: 86px;max-height: 185px;',
                editable: false,
                takeFocusOnClose: true,
                data: this.arrSpacing
            });
            this.cmbGridSpacing.on('selected', _.bind(function(combo, record) {
                if (record.value<0) {
                } else {
                    this.spnSpacing.setValue(record.spacing, true);
                }
            }, this));

            var metric = Common.Utils.Metric.getCurrentMetric();
            this.spnSpacing = new Common.UI.MetricSpinner({
                el: $window.find('#grid-spacing-spin'),
                step: metric === Common.Utils.Metric.c_MetricUnits.pt ? 1 : .01,
                width: 86,
                defaultUnit: Common.Utils.Metric.getCurrentMetricName(),
                value: metric === Common.Utils.Metric.c_MetricUnits.inch ? "1 \"" : (metric === Common.Utils.Metric.c_MetricUnits.pt ? '36 pt' : '1 cm'),
                maxValue: metric === Common.Utils.Metric.c_MetricUnits.inch ? 2 : (metric === Common.Utils.Metric.c_MetricUnits.pt ? 145 : 5.08),
                minValue: metric === Common.Utils.Metric.c_MetricUnits.inch ? 0.04 : (metric === Common.Utils.Metric.c_MetricUnits.pt ? 3 : 0.1)
            });
            this.spnSpacing.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                var value = this.spnSpacing.getNumberValue(),
                    idx = -1;
                for (var i=0; i<this.arrSpacing.length; i++) {
                    var item = this.arrSpacing[i];
                    if (item.spacing<1 && Math.abs(item.spacing - value)<0.005 || item.spacing>=1 && Math.abs(item.spacing - value)<0.001) {
                        idx = i;
                        break;
                    }
                }
                this.cmbGridSpacing.setValue(idx);
            }, this));

            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
        },

        getFocusedComponents: function() {
            return [ this.cmbGridSpacing, this.spnSpacing ].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.cmbGridSpacing;
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

        setSettings: function (value) {
            value = Common.Utils.Metric.fnRecalcFromMM(value/36000);
            var idx = -1;
            for (var i=0; i<this.arrSpacing.length; i++) {
                var item = this.arrSpacing[i];
                if (item.spacing<1 && Math.abs(item.spacing - value)<0.005 || item.spacing>=1 && Math.abs(item.spacing - value)<0.001)
                    idx = i;
            }
            this.cmbGridSpacing.setValue(idx, -1);
            this.spnSpacing.setValue(value, true);
        },

        getSettings: function() {
            return this.spnSpacing.getNumberValue();
        },

        textTitle: 'Grid Settings',
        textSpacing: 'Spacing',
        textCm: 'cm',
        textCustom: 'Custom'
    }, PE.Views.GridSettings || {}))
});