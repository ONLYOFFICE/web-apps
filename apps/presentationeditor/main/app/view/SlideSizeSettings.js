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
 *  SlideSizeSettings.js
 *
 *  Created on 4/19/14
 *
 */

define([
    'common/main/lib/component/Window',
    'common/main/lib/component/ComboBox'
], function () { 'use strict';

    PE.Views.SlideSizeSettings = Common.UI.Window.extend(_.extend({
        options: {
            width: 250,
            header: true,
            style: 'min-width: 250px;',
            cls: 'modal-dlg',
            id: 'window-slide-size-settings',
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.template = [
                '<div class="box">',
                    '<div class="input-row">',
                        '<label class="text font-weight-bold">' + this.textSlideSize + '</label>',
                    '</div>',
                    '<div id="slide-size-combo" class="" style="margin-bottom: 10px;"></div>',
                    '<table cols="2" style="width: 100%;margin-bottom: 7px;">',
                        '<tr>',
                            '<td class="padding-small padding-right-10">',
                                '<label class="input-label font-weight-bold">' + this.textWidth + '</label>',
                                '<div id="slide-size-spin-width"></div>',
                            '</td>',
                            '<td class="padding-small padding-left-10">',
                                '<label class="input-label font-weight-bold">' + this.textHeight + '</label>',
                                '<div id="slide-size-spin-height"></div>',
                            '</td>',
                        '</tr>',
                    '</table>',
                    '<div class="input-row">',
                        '<label class="text font-weight-bold">' + this.textSlideOrientation + '</label>',
                    '</div>',
                    '<div id="slide-orientation-combo" class="" style="margin-bottom: 10px;"></div>',
                    '<div class="input-row">',
                        '<label class="text font-weight-bold">' + this.txtSlideNum + '</label>',
                    '</div>',
                    '<div id="slide-size-spin-slidenum" class="" style="margin-bottom: 5px;"></div>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);

            this.spinners = [];
            this._noApply = false;

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            this.cmbSlideSize = new Common.UI.ComboBox({
                el: $('#slide-size-combo'),
                cls: 'input-group-nr',
                style: 'width: 100%;',
                menuStyle: 'min-width: 218px;max-height: 185px;',
                editable: false,
                takeFocusOnClose: true,
                data: [
                    {value:Asc.c_oAscSlideSZType.SzScreen4x3,   displayValue: this.txtStandard , size: [9144000, 6858000]},
                    {value:Asc.c_oAscSlideSZType.SzScreen16x9,  displayValue: this.txtWidescreen + ' (16:9)', size: [9144000, 5143500]},
                    {value:Asc.c_oAscSlideSZType.SzScreen16x10, displayValue: this.txtWidescreen + ' (16:10)', size: [9144000, 5715000]},
                    {value:Asc.c_oAscSlideSZType.SzLetter,      displayValue: this.txtLetter , size: [9144000, 6858000]},
                    {value:Asc.c_oAscSlideSZType.SzLedger,      displayValue: this.txtLedger , size: [12179300, 9134475]},
                    {value:Asc.c_oAscSlideSZType.SzA3,          displayValue: this.txtA3 , size: [12801600, 9601200]},
                    {value:Asc.c_oAscSlideSZType.SzA4,          displayValue: this.txtA4 , size: [9906000, 6858000]},
                    {value:Asc.c_oAscSlideSZType.SzB4ISO,       displayValue: this.txtB4 , size: [10826750, 8120063]},
                    {value:Asc.c_oAscSlideSZType.SzB5ISO,       displayValue: this.txtB5 , size: [7169150, 5376863]},
                    {value:Asc.c_oAscSlideSZType.Sz35mm,        displayValue: this.txt35 , size: [10287000, 6858000]},
                    {value:Asc.c_oAscSlideSZType.SzOverhead,    displayValue: this.txtOverhead , size: [9144000, 6858000]},
                    {value:Asc.c_oAscSlideSZType.SzBanner,      displayValue: this.txtBanner , size: [7315200, 914400]},
                    {value:Asc.c_oAscSlideSZType.SzWidescreen,  displayValue: this.txtWidescreen , size: [12192000, 6858000]},
                    {value:Asc.c_oAscSlideSZType.SzCustom,      displayValue: this.txtCustom , size: [10058400, 7772400]}
                ]
            });
            this.cmbSlideSize.setValue(Asc.c_oAscSlideSZType.SzScreen4x3);
            this.cmbSlideSize.on('selected', _.bind(function(combo, record) {
                this._noApply = true;
                if (record.value<0) {
                    // set current slide size
                } else {
                    var w = record.size[0]/36000,
                        h = record.size[1]/36000,
                        orient = this.cmbSlideOrientation.getValue();
                    this.spnWidth.setValue(Common.Utils.Metric.fnRecalcFromMM(orient ? w : h), true);
                    this.spnHeight.setValue(Common.Utils.Metric.fnRecalcFromMM(orient ? h : w), true);
                }
                this._noApply = false;
            }, this));

            this.spnWidth = new Common.UI.MetricSpinner({
                el: $('#slide-size-spin-width'),
                step: .1,
                width: 98,
                defaultUnit : "cm",
                value: '25.4 cm',
                maxValue: 142.24,
                minValue: 2.54
            });
            this.spinners.push(this.spnWidth);
            this.spnWidth.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (!this._noApply) {
                    if (this.cmbSlideSize.getValue() !== Asc.c_oAscSlideSZType.SzCustom)
                        this.cmbSlideSize.setValue(Asc.c_oAscSlideSZType.SzCustom);
                    var w = this.spnWidth.getNumberValue(),
                        h = this.spnHeight.getNumberValue();
                    this.cmbSlideOrientation.setValue( h>w ? 0 : 1);
                }
            }, this));

            this.spnHeight = new Common.UI.MetricSpinner({
                el: $('#slide-size-spin-height'),
                step: .1,
                width: 98,
                defaultUnit : "cm",
                value: '19.05 cm',
                maxValue: 142.24,
                minValue: 2.54
            });
            this.spinners.push(this.spnHeight);
            this.spnHeight.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (!this._noApply) {
                    if (this.cmbSlideSize.getValue() !==Asc.c_oAscSlideSZType.SzCustom)
                        this.cmbSlideSize.setValue(Asc.c_oAscSlideSZType.SzCustom);
                    var w = this.spnWidth.getNumberValue(),
                        h = this.spnHeight.getNumberValue();
                    this.cmbSlideOrientation.setValue( h>w ? 0 : 1);
                }
            }, this));

            this.cmbSlideOrientation = new Common.UI.ComboBox({
                el: $('#slide-orientation-combo'),
                cls: 'input-group-nr',
                style: 'width: 100%;',
                menuStyle: 'min-width: 218px;',
                editable: false,
                takeFocusOnClose: true,
                data: [
                    {value:0, displayValue: this.strPortrait},
                    {value:1, displayValue: this.strLandscape}
                ]
            });
            this.cmbSlideOrientation.setValue(1);
            this.cmbSlideOrientation.on('selected', _.bind(function(combo, record) {
                this._noApply = true;
                var w = this.spnWidth.getNumberValue(),
                    h = this.spnHeight.getNumberValue();
                if (record.value==0 && w>h || record.value==1 && h>w) {
                    this.spnWidth.setValue(h, true);
                    this.spnHeight.setValue(w, true);
                }
                this._noApply = false;
            }, this));

            this.spnSlideNum = new Common.UI.MetricSpinner({
                el: $('#slide-size-spin-slidenum'),
                step: 1,
                width: 98,
                defaultUnit : "",
                value: '1',
                maxValue: 9999,
                minValue: 0,
                allowDecimal: false,
                maskExp: /[0-9]/
            });

            var $window = this.getChild();
            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

            this.updateMetricUnit();
        },

        getFocusedComponents: function() {
            return [this.cmbSlideSize, this.spnWidth, this.spnHeight, this.cmbSlideOrientation, this.spnSlideNum].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.cmbSlideSize;
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

        setSettings: function (type, pagewitdh, pageheight, slidenum) {
            this.spnWidth.setValue(Common.Utils.Metric.fnRecalcFromMM(pagewitdh/36000), true);
            this.spnHeight.setValue(Common.Utils.Metric.fnRecalcFromMM(pageheight/36000), true);
            this.cmbSlideOrientation.setValue((pageheight>pagewitdh) ? 0 : 1);
            var portrait = pageheight>pagewitdh,
                w = portrait ? pageheight : pagewitdh,
                h = portrait ? pagewitdh : pageheight,
                store = this.cmbSlideSize.store,
                arr = [],
                preset = Asc.c_oAscSlideSZType.SzCustom;
            for (var i=0; i<store.length; i++) {
                var item = store.at(i);
                if (Math.abs(item.get('size')[0] - w) < 0.001 && Math.abs(item.get('size')[1] - h) < 0.001)
                    arr.push(item.get('value'));
            }
            if (arr.length>1) {
                for (var i=0; i<arr.length; i++)
                    (arr[i]==type) && (preset = arr[i]);
            } else if (arr.length>0)
                preset = arr[0];
            this.cmbSlideSize.setValue(preset);
            this.spnSlideNum.setValue(slidenum, true);
        },

        getSettings: function() {
            var type = this.cmbSlideSize.getValue(),
                width, height;
            if (type==Asc.c_oAscSlideSZType.SzCustom) {
                width = Common.Utils.Metric.fnRecalcToMM(this.spnWidth.getNumberValue())*36000;
                height = Common.Utils.Metric.fnRecalcToMM(this.spnHeight.getNumberValue())*36000;
            } else {
                var record = this.cmbSlideSize.getSelectedRecord(),
                    orient = this.cmbSlideOrientation.getValue();
                width = record.size[orient ? 0 : 1];
                height = record.size[orient ? 1 : 0];
            }

            return [type,  width, height, this.spnSlideNum.getNumberValue()];
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

        textTitle:          'Slide Size Settings',
        textSlideSize:      'Slide Size',
        textWidth:          'Width',
        textHeight:         'Height',
        txtStandard:        'Standard (4:3)',
        txtWidescreen1:     'Widescreen (16:9)',
        txtWidescreen2:     'Widescreen (16:10)',
        txtLetter:          'Letter Paper (8.5x11 in)',
        txtLedger:          'Ledger Paper (11x17 in)',
        txtA3:              'A3 Paper (297x420 mm)',
        txtA4:              'A4 Paper (210x297 mm)',
        txtB4:              'B4 (ICO) Paper (250x353 mm)',
        txtB5:              'B5 (ICO) Paper (176x250 mm)',
        txt35:              '35 mm Slides',
        txtOverhead:        'Overhead',
        txtBanner:          'Banner',
        txtCustom:          'Custom',
        textSlideOrientation: 'Slide Orientation',
        strPortrait:        'Portrait',
        strLandscape:       'Landscape',
        txtWidescreen:     'Widescreen',
        txtSlideNum:        'Number slides from'
    }, PE.Views.SlideSizeSettings || {}))
});