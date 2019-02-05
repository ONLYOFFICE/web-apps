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
 *  PageMarginsDialog.js
 *
 *  Created by Julia Radzhabova on 06/29/18
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/component/Window',
    'common/main/lib/component/MetricSpinner'
], function () { 'use strict';

    SSE.Views.PageMarginsDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 215,
            header: true,
            style: 'min-width: 216px;',
            cls: 'modal-dlg',
            id: 'window-page-margins'
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.template = [
                '<div class="box" style="height: 85px;">',
                    '<table cols="2" style="width: 100%;margin-bottom: 10px;">',
                        '<tr>',
                            '<td style="padding-right: 10px;padding-bottom: 8px;">',
                                '<label class="input-label">' + this.textTop + '</label>',
                                '<div id="page-margins-spin-top"></div>',
                            '</td>',
                            '<td style="padding-bottom: 8px;">',
                                '<label class="input-label">' + this.textBottom + '</label>',
                                '<div id="page-margins-spin-bottom"></div>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td class="padding-small" style="padding-right: 10px;">',
                                '<label class="input-label">' + this.textLeft + '</label>',
                                '<div id="page-margins-spin-left"></div>',
                            '</td>',
                            '<td class="padding-small">',
                                '<label class="input-label">' + this.textRight + '</label>',
                                '<div id="page-margins-spin-right"></div>',
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
            this.maxMarginsW = this.maxMarginsH = 0;

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            this.spnTop = new Common.UI.MetricSpinner({
                el: $('#page-margins-spin-top'),
                step: .1,
                width: 86,
                defaultUnit : "cm",
                value: '0',
                maxValue: 48.25,
                minValue: 0
            });
            this.spinners.push(this.spnTop);

            this.spnBottom = new Common.UI.MetricSpinner({
                el: $('#page-margins-spin-bottom'),
                step: .1,
                width: 86,
                defaultUnit : "cm",
                value: '0',
                maxValue: 48.25,
                minValue: 0
            });
            this.spinners.push(this.spnBottom);

            this.spnLeft = new Common.UI.MetricSpinner({
                el: $('#page-margins-spin-left'),
                step: .1,
                width: 86,
                defaultUnit : "cm",
                value: '0.19 cm',
                maxValue: 48.25,
                minValue: 0
            });
            this.spinners.push(this.spnLeft);

            this.spnRight = new Common.UI.MetricSpinner({
                el: $('#page-margins-spin-right'),
                step: .1,
                width: 86,
                defaultUnit : "cm",
                value: '0.19 cm',
                maxValue: 48.25,
                minValue: 0
            });
            this.spinners.push(this.spnRight);

            var $window = this.getChild();
            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
            $window.find('input').on('keypress', _.bind(this.onKeyPress, this));

            this.updateMetricUnit();
        },

        _handleInput: function(state) {
            if (this.options.handler)
                this.options.handler.call(this, this, state);

            this.close();
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        onKeyPress: function(event) {
            if (event.keyCode == Common.UI.Keys.RETURN) {
                this._handleInput('ok');
            }
        },

        setSettings: function (props) {
            if (props) {
                var margins = props.asc_getPageMargins();

                this.spnTop.setValue(Common.Utils.Metric.fnRecalcFromMM(margins.asc_getTop()), true);
                this.spnBottom.setValue(Common.Utils.Metric.fnRecalcFromMM(margins.asc_getBottom()), true);
                this.spnLeft.setValue(Common.Utils.Metric.fnRecalcFromMM(margins.asc_getLeft()), true);
                this.spnRight.setValue(Common.Utils.Metric.fnRecalcFromMM(margins.asc_getRight()), true);
            }
        },

        getSettings: function() {
            var props = new Asc.asc_CPageMargins();
            props.asc_setTop(Common.Utils.Metric.fnRecalcToMM(this.spnTop.getNumberValue()));
            props.asc_setBottom(Common.Utils.Metric.fnRecalcToMM(this.spnBottom.getNumberValue()));
            props.asc_setLeft(Common.Utils.Metric.fnRecalcToMM(this.spnLeft.getNumberValue()));
            props.asc_setRight(Common.Utils.Metric.fnRecalcToMM(this.spnRight.getNumberValue()));
            return props;
        },

        updateMetricUnit: function() {
            if (this.spinners) {
                for (var i=0; i<this.spinners.length; i++) {
                    var spinner = this.spinners[i];
                    spinner.setDefaultUnit(Common.Utils.Metric.getCurrentMetricName());
                }
            }
        },

        textTitle: 'Margins',
        textTop: 'Top',
        textLeft: 'Left',
        textBottom: 'Bottom',
        textRight: 'Right',
        cancelButtonText:   'Cancel',
        okButtonText:       'Ok'
    }, SSE.Views.PageMarginsDialog || {}))
});