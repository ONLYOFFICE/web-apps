/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/**
 *  ExportAnimatedDialog.js
 *
 *  Created on 24/08/26
 *
 */

define([
    'common/main/lib/component/Window',
    'common/main/lib/component/Button',
    'common/main/lib/component/ComboBox',
    'common/main/lib/component/MetricSpinner',
    'common/main/lib/component/CheckBox',
    'common/main/lib/component/InputField'
], function () { 'use strict';

    PE.Views.ExportAnimatedDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 300,
            header: true,
            style: 'min-width: 300px;',
            cls: 'modal-dlg',
            id: 'window-export-animated'
        },

        initialize: function (options) {
            options = options || {};
            this.api = options.api;
            this.mode = options.mode;
            this.format = options.format;
            this.presets = [];
            this.supportedFormats = options.supportedFormats;

            _.extend(this.options, {
                title: this.textExport,
                buttons: [
                    {value: 'ok', caption: this.textExport, primary: true},
                    {value: 'cancel', caption: this.textCancel}
                ]
            }, options);

            this.template = [
                '<div class="box" style="height: 350px;">',
                    '<div style="padding-bottom:15px;">',
                        '<button type="button" class="btn btn-text-default auto" id="export-btn-gif">', this.textGif, '</button>',
                        '<button type="button" class="btn btn-text-default auto" id="export-btn-video">', this.textVideo, '</button>',
                    '</div>',
                    '<table cols="1" style="width:100%;">',
                        '<tr>',
                            '<td class="font-weight-bold" style="padding-bottom:5px;">', this.textExportRange, '</td>',
                        '</tr>',
                        '<tr>',
                            '<td style="display:flex; justify-content:space-between; padding-bottom:15px;">',
                                '<div id="export-combo-range" style="width:180px;"></div>',
                                '<div id="export-txt-range" style="width:80px;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr class="export-gif">',
                            '<td style="display:flex; justify-content:space-between; align-items:center; padding-bottom:15px;">',
                                '<label class="font-weight-bold">', this.textFormat, '</label>',
                                '<div id="export-combo-image-format" style="width:80px;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr class="export-video">',
                            '<td style="display:flex; justify-content:space-between; align-items:center; padding-bottom:15px;">',
                                '<label class="font-weight-bold">', this.textFormat, '</label>',
                                '<div id="export-combo-format" style="width:80px;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td class="font-weight-bold" style="padding-bottom:5px;">', this.textResolution, '</td>',
                        '</tr>',
                        '<tr>',
                            '<td style="padding-bottom:15px;">',
                                '<div id="export-combo-resolution" style="width:100%;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr class="export-fps-row">',
                            '<td style="display:flex; justify-content:space-between; align-items:center; padding-bottom:15px;">',
                                '<label class="font-weight-bold">', this.textFrameRate, '</label>',
                                '<div id="export-spin-fps" style="width:80px;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td style="display:flex; justify-content:space-between; align-items:center; padding-bottom:5px;">',
                                '<label class="font-weight-bold">', this.textTiming, '</label>',
                                '<div id="export-spin-timing" style="width:80px;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td style="padding-bottom:15px; font-size:12px;">', this.textTimingHint, '</td>',
                        '</tr>',
                        '<tr class="export-transparent">',
                            '<td style="padding-bottom:15px;">',
                                '<div id="export-chb-transparent"></div>',
                            '</td>',
                        '</tr>',
                    '</table>',
                '</div>',
                '<div class="separator horizontal"></div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function () {
            Common.UI.Window.prototype.render.call(this);

            var $window = this.getChild();

            this.btnGif = new Common.UI.Button({
                el: $window.find('#export-btn-gif'),
                enableToggle: true,
                allowDepress: false,
                toggleGroup: 'export-animated-mode',
                pressed: this.mode === 'gif'
            });
            this.btnVideo = new Common.UI.Button({
                el: $window.find('#export-btn-video'),
                enableToggle: true,
                allowDepress: false,
                toggleGroup: 'export-animated-mode',
                pressed: this.mode === 'video'
            });
            Common.UI.GroupedButtons([this.btnGif, this.btnVideo]);
            this.btnGif.on('click', function (btn, e) {
                if (btn.pressed) {
                    this.mode = 'gif';
                    this.updateMode();
                }
            }.bind(this));
            this.btnVideo.on('click', function (btn, e) {
                if (btn.pressed) {
                    this.mode = 'video';
                    this.updateMode();
                }
            }.bind(this));

            this.cmbRange = new Common.UI.ComboBox({
                el: $window.find('#export-combo-range'),
                cls: 'input-group-nr',
                style: 'width: 100%;',
                menuStyle: 'width: 100%;',
                editable: false,
                takeFocusOnClose: true,
                data: [
                    { value: Asc.c_oAscPresentationRangeType.AllSlides, displayValue: this.txtAllSlides },
                    { value: Asc.c_oAscPresentationRangeType.ActiveSlide, displayValue: this.txtCurrentSlide },
                    { value: Asc.c_oAscPresentationRangeType.SelectedSlides, displayValue: this.txtSelectedSlides },
                    { value: Asc.c_oAscPresentationRangeType.CustomRange, displayValue: this.txtCustomSlides }
                ]
            });
            this.cmbRange.setValue(Asc.c_oAscPresentationRangeType.AllSlides);
            this.cmbRange.on('selected', this.onRangeChange.bind(this));

            this.inputPages = new Common.UI.InputField({
                el: $window.find('#export-txt-range'),
                allowBlank: true,
                validateOnChange: true,
                validateOnBlur: false,
                maskExp: /[0-9,\-]/,
                placeHolder: '1-5',
                validation: this.validateRange.bind(this)
            });
            this.inputPages.setDisabled(true);

            var isSupported = function (value) { return this.supportedFormats.includes(value); }.bind(this);

            var imageFormatData = [
                { value: Asc.c_oAscAnimatedExportFormat.Gif, displayValue: 'GIF' },
                { value: Asc.c_oAscAnimatedExportFormat.WebP, displayValue: 'WEBP' }
            ].filter(function (item) { return isSupported(item.value); });

            this.cmbImageFormat = new Common.UI.ComboBox({
                el: $window.find('#export-combo-image-format'),
                cls: 'input-group-nr',
                style: 'width: 100%;',
                menuStyle: 'min-width: 80px;',
                editable: false,
                takeFocusOnClose: true,
                data: imageFormatData
            });
            var imageFormatItem = imageFormatData.find(function (item) { return item.value === this.format; }, this);
            this.cmbImageFormat.setValue(imageFormatItem ? imageFormatItem.value : imageFormatData[0].value);
            this.cmbImageFormat.on('selected', function () { this.loadPresets(); }.bind(this));

            var videoFormatData = [
                { value: Asc.c_oAscAnimatedExportFormat.Mp4, displayValue: 'MP4' },
                { value: Asc.c_oAscAnimatedExportFormat.WebM, displayValue: 'WEBM' }
            ].filter(function (item) { return isSupported(item.value); });

            this.cmbFormat = new Common.UI.ComboBox({
                el: $window.find('#export-combo-format'),
                cls: 'input-group-nr',
                style: 'width: 100%;',
                menuStyle: 'min-width: 80px;',
                editable: false,
                takeFocusOnClose: true,
                data: videoFormatData
            });
            var videoFormatItem = videoFormatData.find(function (item) { return item.value === this.format; }, this);
            this.cmbFormat.setValue(videoFormatItem ? videoFormatItem.value : videoFormatData[0].value);
            this.cmbFormat.on('selected', function () { this.loadPresets(); }.bind(this));

            this.cmbResolution = new Common.UI.ComboBox({
                el: $window.find('#export-combo-resolution'),
                cls: 'input-group-nr',
                style: 'width: 100%;',
                menuStyle: 'width: 100%;',
                editable: false,
                takeFocusOnClose: true,
                data: []
            });

            this.spnFps = new Common.UI.MetricSpinner({
                el: $window.find('#export-spin-fps'),
                step: 1,
                width: 80,
                defaultUnit: this.textFps,
                value: '15 ' + this.textFps,
                maxValue: 30,
                minValue: 1,
                allowDecimal: false
            });

            this.spnTiming = new Common.UI.MetricSpinner({
                el: $window.find('#export-spin-timing'),
                step: 1,
                width: 80,
                defaultUnit: this.textSec,
                value: '1 ' + this.textSec,
                maxValue: 300,
                minValue: 0,
                allowDecimal: false
            });

            this.chTransparent = new Common.UI.CheckBox({
                el: $window.find('#export-chb-transparent'),
                labelText: this.textTransparent,
                value: false
            });

            this.videoRows = $window.find('.export-video');
            this.gifRows = $window.find('.export-gif, .export-fps-row, .export-transparent');

            this.updateMode();

            $window.find('.dlg-btn').on('click', this.onBtnClick.bind(this));
        },

        updateMode: function () {
            var isGif = this.mode === 'gif';
            this.videoRows.toggleClass('hidden', isGif);
            this.gifRows.toggleClass('hidden', !isGif);
            this.loadPresets();
        },

        isImageFormat: function (format) {
            return format === Asc.c_oAscAnimatedExportFormat.Gif || format === Asc.c_oAscAnimatedExportFormat.WebP;
        },

        getCurrentFormat: function () {
            return this.mode === 'gif' ? this.cmbImageFormat.getValue() : this.cmbFormat.getValue();
        },

        loadPresets: function () {
            if (!this.api) return;

            var format = this.getCurrentFormat(),
                isVideo = !this.isImageFormat(format),
                presets = this.api.asc_getAnimatedExportPresets(format) || [];

            this.presets = presets;

            var data = presets.map(function (info) {
                return { value: info.asc_getPreset(), displayValue: this.getPresetLabel(info.asc_getPreset(), isVideo) };
            }.bind(this));
            this.cmbResolution.setData(data);

            var defaultPreset = isVideo ? Asc.c_oAscAnimatedExportPreset.P1080 : Asc.c_oAscAnimatedExportPreset.P480,
                hasDefault = data.some(function (item) { return item.value === defaultPreset; });
            this.cmbResolution.setValue(hasDefault ? defaultPreset : (data.length ? data[0].value : null));
        },

        getPresetLabel: function (preset, isVideo) {
            var P = Asc.c_oAscAnimatedExportPreset;
            switch (preset) {
                case P.P240:  return this.textSmall;
                case P.P480:  return isVideo ? this.textStandard : this.textMedium;
                case P.P720:  return isVideo ? this.textHD : this.textLarge;
                case P.P1080: return isVideo ? this.textFullHD : this.textExtraLarge;
                case P.P2160: return this.textUltraHD;
                default:      return '';
            }
        },

        onRangeChange: function (combo, record) {
            var isCustom = record.value === Asc.c_oAscPresentationRangeType.CustomRange;
            this.inputPages.setDisabled(!isCustom);
            if (isCustom) setTimeout(function () { this.inputPages.focus(); }.bind(this), 50);
            else this.inputPages.setValue('');
        },

        validateRange: function (value) {
            var count = this.api ? this.api.getCountPages() : 0;
            if (_.isEmpty(value)) return this.txtRangeInvalid;

            var ranges = value.split(',');
            for (var i = 0; i < ranges.length; i++) {
                var range = ranges[i].split('-');
                if (!ranges[i] || range.length > 2) return this.txtRangeInvalid;

                for (var j = 0; j < range.length; j++) {
                    var num = parseInt(range[j]);
                    if (isNaN(num) || num < 1 || num > count) return this.txtRangeInvalid;
                }
            }
            return true;
        },

        getFocusedComponents: function () {
            return [this.btnGif, this.btnVideo, this.cmbRange, this.inputPages, this.cmbImageFormat, this.cmbFormat, this.cmbResolution, this.spnFps, this.spnTiming, this.chTransparent].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.cmbRange;
        },

        _handleInput: function (state) {
            if (state === 'ok' && this.cmbRange.getValue() === Asc.c_oAscPresentationRangeType.CustomRange && this.inputPages.checkValidate() !== true) {
                this.inputPages.focus();
                return;
            }

            if (this.options.handler) this.options.handler.call(this, state, this.getSettings());
            this.close();
        },

        onBtnClick: function (event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        onPrimary: function () {
            this._handleInput('ok');
            return false;
        },

        getSettings: function () {
            var record = this.cmbResolution.getSelectedRecord(),
                format = this.getCurrentFormat(),
                isImage = this.isImageFormat(format);
            return {
                format: format,
                preset: record.value,
                timing: this.spnTiming.getNumberValue() * 1000,
                fps: isImage ? this.spnFps.getNumberValue() : undefined,
                transparent: isImage && this.chTransparent.isChecked(),
                rangeType: this.cmbRange.getValue(),
                customRange: this.inputPages.getValue()
            };
        },

        textExport: 'Export',
        textCancel: 'Cancel',
        textGif: 'GIF',
        textVideo: 'Video',
        textExportRange: 'Export range',
        txtAllSlides: 'All slides',
        txtCurrentSlide: 'Current slide',
        txtSelectedSlides: 'Selected slides',
        txtCustomSlides: 'Custom slides',
        txtRangeInvalid: 'Slide number invalid',
        textFormat: 'Format',
        textResolution: 'Resolution',
        textFrameRate: 'Frame rate',
        textTiming: 'Timing',
        textTimingHint: 'Seconds to spend on each slide without a set timing',
        textTransparent: 'Export with transparent background',
        textSec: 's',
        textFps: 'fps',
        textSmall: 'Small (240p)',
        textMedium: 'Medium (480p)',
        textLarge: 'Large (720p)',
        textExtraLarge: 'Extra Large (1080p)',
        textStandard: 'Standard (480p)',
        textHD: 'HD (720p)',
        textFullHD: 'Full HD (1080p)',
        textUltraHD: 'Ultra HD (4K)'
    }, PE.Views.ExportAnimatedDialog || {}))
});