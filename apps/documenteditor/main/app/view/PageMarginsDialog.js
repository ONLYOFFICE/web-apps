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
 *  PageMarginsDialog.js
 *
 *  Created on 2/12/16
 *
 */

define([], function () { 'use strict';

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
                '<div class="box" style="height: 245px;">',
                    '<div class="float-left">',
                        '<label class="font-weight-bold">' + this.textTitle + '</label>',
                        '<div style="margin-top: 2px;">',
                            '<div style="display: inline-block;">',
                                '<label class="input-label">' + this.textTop + '</label>',
                                '<div id="page-margins-spin-top"></div>',
                            '</div>',
                            '<div class="margin-left-8" style="display: inline-block;">',
                                '<label class="input-label">' + this.textBottom + '</label>',
                                '<div id="page-margins-spin-bottom"></div>',
                            '</div>',
                        '</div>',
                        '<div style="margin-top: 4px;">',
                            '<div style="display: inline-block;">',
                                '<label class="input-label" id="margin-left-label">' + this.textLeft + '</label>',
                                '<div id="page-margins-spin-left"></div>',
                            '</div>',
                            '<div class="margin-left-8" style="display: inline-block;">',
                                '<label class="input-label" id="margin-right-label">' + this.textRight + '</label>',
                                '<div id="page-margins-spin-right"></div>',
                            '</div>',
                        '</div>',
                        '<div style="margin-top: 10px;">',
                            '<label class="font-weight-bold">' + this.textGutterPosition + '</label>',
                            '<div>',
                                '<div style="display: inline-block;" id="page-margins-spin-gutter"></div>',
                                '<div style="display: inline-block;" id="page-margins-spin-gutter-position" class="margin-left-8"></div>',
                            '</div>',
                        '</div>',
                        '<div style="margin-top: 10px;">',
                            '<label class="font-weight-bold">' + this.textOrientation + '</label>',
                            '<div id="page-margins-cmb-orientation"></div>',
                        '</div>',
                        '<div style="margin-top: 10px;">',
                            '<label class="font-weight-bold">' + this.textMultiplePages + '</label>',
                            '<div id="page-margins-cmb-multiple-pages"></div>',
                        '</div>',
                    '</div>',
                    '<div class="float-right">',
                        '<label class="font-weight-bold">' + this.textPreview + '</label>',
                        '<div id="page-margins-preview" style="margin-top: 2px; height: 120px; width: 162px;"></div>',
                    '</div>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);

            this.spinners = [];
            this._noApply = false;
            this.maxMarginsW = this.maxMarginsH = 0;
            this.api = this.options.api;

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            this.spnTop = new Common.UI.MetricSpinner({
                el: $('#page-margins-spin-top'),
                step: .1,
                width: 86,
                defaultUnit : "cm",
                value: '1 cm',
                maxValue: 55.88,
                minValue: -55.87
            });
            this.spnTop.on('change', _.bind(function (field, newValue, oldValue) {
                if (this.api) {
                    this.properties = (this.properties) ? this.properties : new Asc.CDocumentSectionProps();
                    this.properties.put_TopMargin(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                    this.api.SetDrawImagePreviewMargins('page-margins-preview', this.properties);
                }
            }, this));
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
            this.spnBottom.on('change', _.bind(function (field, newValue, oldValue) {
                if (this.api) {
                    this.properties = (this.properties) ? this.properties : new Asc.CDocumentSectionProps();
                    this.properties.put_BottomMargin(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                    this.api.SetDrawImagePreviewMargins('page-margins-preview', this.properties);
                }
            }, this));
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
            this.spnLeft.on('change', _.bind(function (field, newValue, oldValue) {
                if (this.api) {
                    this.properties = (this.properties) ? this.properties : new Asc.CDocumentSectionProps();
                    this.properties.put_LeftMargin(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                    this.api.SetDrawImagePreviewMargins('page-margins-preview', this.properties);
                }
            }, this));
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
            this.spnRight.on('change', _.bind(function (field, newValue, oldValue) {
                if (this.api) {
                    this.properties = (this.properties) ? this.properties : new Asc.CDocumentSectionProps();
                    this.properties.put_RightMargin(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                    this.api.SetDrawImagePreviewMargins('page-margins-preview', this.properties);
                }
            }, this));
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
            this.spnGutter.on('change', _.bind(function (field, newValue, oldValue) {
                if (this.api) {
                    this.properties = (this.properties) ? this.properties : new Asc.CDocumentSectionProps();
                    this.properties.put_Gutter(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                    this.api.SetDrawImagePreviewMargins('page-margins-preview', this.properties);
                }
            }, this));
            this.spinners.push(this.spnGutter);

            this.cmbGutterPosition = new Common.UI.ComboBox({
                el          : $('#page-margins-spin-gutter-position'),
                menuStyle   : 'min-width: 86px;',
                style       : 'width: 86px;',
                editable    : false,
                takeFocusOnClose: true,
                cls         : 'input-group-nr',
                data        : [
                    { value: 0, displayValue: this.textLeft },
                    { value: 1, displayValue: this.textTop }
                ]
            });
            this.cmbGutterPosition.on('selected', _.bind(function (combo, record) {
                if (this.api) {
                    this.properties = (this.properties) ? this.properties : new Asc.CDocumentSectionProps();
                    this.properties.put_GutterAtTop(record.value);
                    this.api.SetDrawImagePreviewMargins('page-margins-preview', this.properties);
                }
            }, this));

            this.cmbOrientation = new Common.UI.ComboBox({
                el          : $('#page-margins-cmb-orientation'),
                menuStyle   : 'min-width: 180px;',
                style       : 'width: 180px;',
                editable    : false,
                takeFocusOnClose: true,
                cls         : 'input-group-nr',
                data        : [
                    { value: 0, displayValue: this.textPortrait },
                    { value: 1, displayValue: this.textLandscape }
                ]
            });
            this.cmbOrientation.on('selected', _.bind(function (combo, record) {
                if (this.api) {
                    this.properties = (this.properties) ? this.properties : new Asc.CDocumentSectionProps();

                    if (this.properties.get_Orientation() !== record.value) {
                        this.properties.put_TopMargin(Common.Utils.Metric.fnRecalcToMM(record.value ? this.spnLeft.getNumberValue() : this.spnRight.getNumberValue()));
                        this.properties.put_BottomMargin(Common.Utils.Metric.fnRecalcToMM(record.value ? this.spnRight.getNumberValue() : this.spnLeft.getNumberValue()));
                        this.properties.put_LeftMargin(Common.Utils.Metric.fnRecalcToMM(record.value ? this.spnBottom.getNumberValue() : this.spnTop.getNumberValue()));
                        this.properties.put_RightMargin(Common.Utils.Metric.fnRecalcToMM(record.value ? this.spnTop.getNumberValue() : this.spnBottom.getNumberValue()));

                        var h = this.properties.get_H();
                        this.properties.put_H(this.properties.get_W());
                        this.properties.put_W(h);
                        this.properties.put_Orientation(record.value);

                        this.maxMarginsH = Common.Utils.Metric.fnRecalcFromMM(this.properties.get_H() - 2.6);
                        this.maxMarginsW = Common.Utils.Metric.fnRecalcFromMM(this.properties.get_W() - 12.7);
                        this.spnTop.setMaxValue(this.maxMarginsH);
                        this.spnBottom.setMaxValue(this.maxMarginsH);
                        this.spnLeft.setMaxValue(this.maxMarginsW);
                        this.spnRight.setMaxValue(this.maxMarginsW);

                        this.spnTop.setValue(Common.Utils.Metric.fnRecalcFromMM(this.properties.get_TopMargin()), true);
                        this.spnBottom.setValue(Common.Utils.Metric.fnRecalcFromMM(this.properties.get_BottomMargin()), true);
                        this.spnLeft.setValue(Common.Utils.Metric.fnRecalcFromMM(this.properties.get_LeftMargin()), true);
                        this.spnRight.setValue(Common.Utils.Metric.fnRecalcFromMM(this.properties.get_RightMargin()), true);

                        this.api.SetDrawImagePreviewMargins('page-margins-preview', this.properties);
                    }
                }
            }, this));

            this.cmbMultiplePages = new Common.UI.ComboBox({
                el          : $('#page-margins-cmb-multiple-pages'),
                menuStyle   : 'min-width: 180px;',
                style       : 'width: 180px;',
                editable    : false,
                takeFocusOnClose: true,
                cls         : 'input-group-nr',
                data        : [
                    { value: 0, displayValue: this.textNormal },
                    { value: 1, displayValue: this.textMirrorMargins }
                ]
            });
            this.cmbMultiplePages.on('selected', _.bind(function(combo, record) {
                if (record.value === 0) {
                    this.window.find('#margin-left-label').html(this.textLeft);
                    this.window.find('#margin-right-label').html(this.textRight);
                    this.cmbGutterPosition.setDisabled(false);
                } else {
                    this.window.find('#margin-left-label').html(this.textInside);
                    this.window.find('#margin-right-label').html(this.textOutside);
                    this.cmbGutterPosition.setValue(0);
                    this.cmbGutterPosition.setDisabled(true);
                }
                if (this.api) {
                    this.properties = (this.properties) ? this.properties : new Asc.CDocumentSectionProps();
                    this.properties.put_MirrorMargins(record.value);
                    this.api.SetDrawImagePreviewMargins('page-margins-preview', this.properties);
                }
            }, this));

            this.window = this.getChild();
            this.window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

            this.on('animate:after', _.bind(this.onAnimateAfter, this));

            this.updateMetricUnit();
        },

        getFocusedComponents: function() {
            return [this.spnTop, this.spnBottom, this.spnLeft, this.spnRight, this.spnGutter, this.cmbGutterPosition, this.cmbOrientation, this.cmbMultiplePages].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.spnTop;
        },

        onAnimateAfter: function() {
            if (this.api && this.properties) {
                this.api.SetDrawImagePreviewMargins('page-margins-preview', this.properties);
            }
        },

        _handleInput: function(state) {
            if (this.options.handler) {
                if (state == 'ok') {
                    var errmsg = null;
                    if (this.spnLeft.getNumberValue() + this.spnRight.getNumberValue() + (this.cmbGutterPosition.getValue() ? 0 : this.spnGutter.getNumberValue()) > this.maxMarginsW )
                        errmsg = this.txtMarginsW;
                    else if (Math.abs(this.spnTop.getNumberValue() + this.spnBottom.getNumberValue() + (this.cmbGutterPosition.getValue() ? this.spnGutter.getNumberValue() : 0)) > this.maxMarginsH )
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
                this.properties = props;
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
                this.cmbOrientation.setValue(props.get_Orientation());

                this.spnGutter.setValue(Common.Utils.Metric.fnRecalcFromMM(props.get_Gutter()), true);
                this.cmbGutterPosition.setValue(props.get_GutterAtTop() ? 1 : 0);
                var mirrorMargins = props.get_MirrorMargins();
                this.cmbMultiplePages.setValue(mirrorMargins ? 1 : 0);

                if (mirrorMargins) {
                    this.window.find('#margin-left-label').html(this.textInside);
                    this.window.find('#margin-right-label').html(this.textOutside);
                    this.cmbGutterPosition.setValue(0);
                }
                this.cmbGutterPosition.setDisabled(mirrorMargins);
            }
        },

        getSettings: function() {
            var props = new Asc.CDocumentSectionProps();
            props.put_TopMargin(Common.Utils.Metric.fnRecalcToMM(this.spnTop.getNumberValue()));
            props.put_BottomMargin(Common.Utils.Metric.fnRecalcToMM(this.spnBottom.getNumberValue()));
            props.put_LeftMargin(Common.Utils.Metric.fnRecalcToMM(this.spnLeft.getNumberValue()));
            props.put_RightMargin(Common.Utils.Metric.fnRecalcToMM(this.spnRight.getNumberValue()));
            props.put_Orientation(this.cmbOrientation.getValue());
            props.put_Gutter(Common.Utils.Metric.fnRecalcToMM(this.spnGutter.getNumberValue()));
            props.put_GutterAtTop(this.cmbGutterPosition.getValue() ? true : false);
            props.put_MirrorMargins(this.cmbMultiplePages.getValue() ? true : false);
            props.put_H(this.properties.get_H());
            props.put_W(this.properties.get_W());
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
        textNormal: 'Normal',
        textInside: 'Inside',
        textOutside: 'Outside'
    }, DE.Views.PageMarginsDialog || {}))
});