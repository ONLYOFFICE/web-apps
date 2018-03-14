/*
 *
 * (c) Copyright Ascensio System Limited 2010-2018
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
 *  CustomColumnsDialog.js
 *
 *  Created by Julia Radzhabova on 6/23/17
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/component/Window',
    'common/main/lib/component/MetricSpinner',
    'common/main/lib/component/CheckBox'
], function () { 'use strict';

    DE.Views.CustomColumnsDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 300,
            header: true,
            style: 'min-width: 216px;',
            cls: 'modal-dlg'
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.template = [
                '<div class="box" style="height: 90px;">',
                    '<div class="input-row" style="margin: 10px 0;">',
                        '<label class="input-label">' + this.textColumns + '</label><div id="custom-columns-spin-num" style="float: right;"></div>',
                    '</div>',
                    '<div class="input-row" style="margin: 10px 0;">',
                        '<label class="input-label">' + this.textSpacing + '</label><div id="custom-columns-spin-spacing" style="float: right;"></div>',
                    '</div>',
                    '<div class="input-row" style="margin: 10px 0;">',
                        '<div id="custom-columns-separator"></div>',
                    '</div>',
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

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            this.spnColumns = new Common.UI.MetricSpinner({
                el: $('#custom-columns-spin-num'),
                step: 1,
                allowDecimal: false,
                width: 100,
                defaultUnit : "",
                value: '1',
                maxValue: 12,
                minValue: 1
            });

            this.spnSpacing = new Common.UI.MetricSpinner({
                el: $('#custom-columns-spin-spacing'),
                step: .1,
                width: 100,
                defaultUnit : "cm",
                value: '0 cm',
                maxValue: 40.64,
                minValue: 0
            });
            this.spinners.push(this.spnSpacing);

            this.chSeparator = new Common.UI.CheckBox({
                el: $('#custom-columns-separator'),
                labelText: this.textSeparator
            });

            this.getChild().find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

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

        onPrimary: function() {
            this._handleInput('ok');
            return false;
        },

        setSettings: function (props) {
            if (props) {
                var equal = props.get_EqualWidth(),
                    num = (equal) ? props.get_Num() : props.get_ColsCount(),
                    space = (equal) ? props.get_Space() : (num>1 ? props.get_Col(0).get_Space() : 12.5);

                this.spnColumns.setValue(num, true);
                this.spnSpacing.setValue(Common.Utils.Metric.fnRecalcFromMM(space), true);
                this.chSeparator.setValue(props.get_Sep());
            }
        },

        getSettings: function() {
            var props = new Asc.CDocumentColumnsProps();
            props.put_EqualWidth(true);
            props.put_Num(this.spnColumns.getNumberValue());
            props.put_Space(Common.Utils.Metric.fnRecalcToMM(this.spnSpacing.getNumberValue()));
            props.put_Sep(this.chSeparator.getValue()=='checked');
            return props;
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

        textTitle: 'Columns',
        textSpacing: 'Spacing between columns',
        textColumns: 'Number of columns',
        textSeparator: 'Column divider',
        cancelButtonText:   'Cancel',
        okButtonText:       'Ok'
    }, DE.Views.CustomColumnsDialog || {}))
});