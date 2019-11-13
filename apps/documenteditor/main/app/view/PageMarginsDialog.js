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
 *  Created by Julia Radzhabova on 2/12/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/component/Window',
    'common/main/lib/component/MetricSpinner'
], function () { 'use strict';

    DE.Views.PageMarginsDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 404,
            header: true,
            style: 'min-width: 404px;',
            cls: 'modal-dlg',
            id: 'window-page-margins',
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.template = [
                '<div class="box" style="height: 260px;">',
                    '<div style="float: left;>',
                        '<label class="input-label">' + this.textMultiplePages + '</label>',
                        '<div id="page-margins-cmb-multiple-pages"></div>',
                        '<div style="margin-top: 10px;">',
                            '<div style="display: inline-block;">',
                                '<label class="input-label">' + this.textTop + '</label>',
                                '<div id="page-margins-spin-top"></div>',
                            '</div>',
                            '<div style="display: inline-block; margin-left: 8px;">',
                                '<label class="input-label">' + this.textBottom + '</label>',
                                '<div id="page-margins-spin-bottom"></div>',
                            '</div>',
                        '</div>',
                        '<div style="margin-top: 10px;">',
                            '<div style="display: inline-block;">',
                                '<label class="input-label">' + this.textLeft + '</label>',
                                '<div id="page-margins-spin-left"></div>',
                            '</div>',
                            '<div style="display: inline-block; margin-left: 8px;">',
                                '<label class="input-label">' + this.textRight + '</label>',
                                '<div id="page-margins-spin-right"></div>',
                            '</div>',
                        '</div>',
                        '<div style="margin-top: 10px;">',
                            '<div style="display: inline-block;">',
                                '<label class="input-label">' + this.textGutter + '</label>',
                                '<div id="page-margins-spin-gutter"></div>',
                            '</div>',
                            '<div style="display: inline-block; margin-left: 8px;">',
                                '<label class="input-label">' + this.textGutterPosition + '</label>',
                                '<div id="page-margins-spin-gutter-position"></div>',
                            '</div>',
                        '</div>',
                        '<div style="margin-top: 10px;">',
                            '<label class="input-label">' + this.textOrientation + '</label>',
                            '<div id="page-margins-cmb-orientation"></div>',
                        '</div>',
                    '</div>',
                    '<div style="float: right;">',
                        '<label class="input-label">' + this.textPreview + '</label>',
                        '<div id="page-margins-preview" style="height: 93px; width: 160px;"></div>',
                    '</div>',
                '</div>',
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);

            this.spinners = [];
            this._noApply = false;
            this.maxMarginsW = this.maxMarginsH = 0;

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            this.cmbMultiplePages = new Common.UI.ComboBox({
                el          : $('#page-margins-cmb-multiple-pages'),
                menuStyle   : 'min-width: 180px;',
                style       : 'width: 180px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [
                    { value: 0, displayValue: this.textNormal },
                    { value: 1, displayValue: this.textMirrorMargins }
                ]
            });

            this.spnTop = new Common.UI.MetricSpinner({
                el: $('#page-margins-spin-top'),
                step: .1,
                width: 86,
                defaultUnit : "cm",
                value: '1 cm',
                maxValue: 55.88,
                minValue: -55.87
            });
            this.spinners.push(this.spnTop);

            this.spnBottom = new Common.UI.MetricSpinner({
                el: $('#page-margins-spin-bottom'),
                step: .1,
                width: 86,
                defaultUnit : "cm",
                value: '1 cm',
                maxValue: 55.88,
                minValue: -55.87
            });
            this.spinners.push(this.spnBottom);

            this.spnLeft = new Common.UI.MetricSpinner({
                el: $('#page-margins-spin-left'),
                step: .1,
                width: 86,
                defaultUnit : "cm",
                value: '1 cm',
                maxValue: 55.88,
                minValue: 0
            });
            this.spinners.push(this.spnLeft);

            this.spnRight = new Common.UI.MetricSpinner({
                el: $('#page-margins-spin-right'),
                step: .1,
                width: 86,
                defaultUnit : "cm",
                value: '1 cm',
                maxValue: 55.88,
                minValue: 0
            });
            this.spinners.push(this.spnRight);

            this.spnGutter = new Common.UI.MetricSpinner({
                el: $('#page-margins-spin-gutter'),
                step: .1,
                width: 86,
                defaultUnit : "cm",
                value: '1 cm',
                maxValue: 55.88,
                minValue: 0
            });
            this.spinners.push(this.spnLeft);

            this.cmbGutterPosition = new Common.UI.ComboBox({
                el          : $('#page-margins-spin-gutter-position'),
                menuStyle   : 'min-width: 86px;',
                style       : 'width: 86px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [
                    { value: 0, displayValue: this.textLeft },
                    { value: 1, displayValue: this.textTop }
                ]
            });

            this.cmbOrientation = new Common.UI.ComboBox({
                el          : $('#page-margins-cmb-orientation'),
                menuStyle   : 'min-width: 180px;',
                style       : 'width: 180px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [
                    { value: 0, displayValue: this.textPortrait },
                    { value: 1, displayValue: this.textLandscape }
                ]
            });

            var $window = this.getChild();
            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

            this.updateMetricUnit();
        },

        _handleInput: function(state) {
            if (this.options.handler) {
                if (state == 'ok') {
                    var errmsg = null;
                    if (this.spnLeft.getNumberValue() + this.spnRight.getNumberValue() > this.maxMarginsW )
                        errmsg = this.txtMarginsW;
                    else if (Math.abs(this.spnTop.getNumberValue() + this.spnBottom.getNumberValue()) > this.maxMarginsH )
                        errmsg = this.txtMarginsH;
                    if (errmsg) {
                        Common.UI.warning({
                            title: this.notcriticalErrorTitle,
                            msg  : errmsg
                        });
                        return;
                    }
                }
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
                this.maxMarginsH = Common.Utils.Metric.fnRecalcFromMM(props.get_H() - 2.6);
                this.maxMarginsW = Common.Utils.Metric.fnRecalcFromMM(props.get_W() - 12.7);
                this.spnTop.setMaxValue(this.maxMarginsH);
                this.spnBottom.setMaxValue(this.maxMarginsH);
                this.spnLeft.setMaxValue(this.maxMarginsW);
                this.spnRight.setMaxValue(this.maxMarginsW);

                this.spnTop.setValue(Common.Utils.Metric.fnRecalcFromMM(props.get_TopMargin()), true);
                this.spnBottom.setValue(Common.Utils.Metric.fnRecalcFromMM(props.get_BottomMargin()), true);
                this.spnLeft.setValue(Common.Utils.Metric.fnRecalcFromMM(props.get_LeftMargin()), true);
                this.spnRight.setValue(Common.Utils.Metric.fnRecalcFromMM(props.get_RightMargin()), true);
            }
        },

        getSettings: function() {
            var props = new Asc.CDocumentSectionProps();
            props.put_TopMargin(Common.Utils.Metric.fnRecalcToMM(this.spnTop.getNumberValue()));
            props.put_BottomMargin(Common.Utils.Metric.fnRecalcToMM(this.spnBottom.getNumberValue()));
            props.put_LeftMargin(Common.Utils.Metric.fnRecalcToMM(this.spnLeft.getNumberValue()));
            props.put_RightMargin(Common.Utils.Metric.fnRecalcToMM(this.spnRight.getNumberValue()));
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

        textTitle: 'Margins',
        textTop: 'Top',
        textLeft: 'Left',
        textBottom: 'Bottom',
        textRight: 'Right',
        notcriticalErrorTitle: 'Warning',
        txtMarginsW: 'Left and right margins are too high for a given page wight',
        txtMarginsH: 'Top and bottom margins are too high for a given page height',
        textMultiplePages: 'Multiple pages',
        textGutter: 'Gutter',
        textGutterPosition: 'Gutter position',
        textOrientation: 'Orientation',
        textPreview: 'Preview',
        textPortrait: 'Portrait',
        textLandscape: 'Landscape',
        textMirrorMargins: 'Mirror margins',
        textNormal: 'Normal'
    }, DE.Views.PageMarginsDialog || {}))
});