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
 *  NumberingValueDialog.js
 *
 *  Created on 7/20/18
 *
 */

define([], function () { 'use strict';

    DE.Views.NumberingValueDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 214,
            header: true,
            style: 'min-width: 214px;',
            cls: 'modal-dlg',
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.template = [
                '<div class="box">',
                    '<div class="input-row">',
                        '<div id="id-spin-set-value"></div>',
                    '</div>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);
            this.props = this.options.props;

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            this.spnStart = new Common.UI.CustomSpinner({
                el: $('#id-spin-set-value'),
                step: 1,
                width: 182,
                defaultUnit : "",
                value: 1,
                maxValue: 16383,
                minValue: 0,
                allowDecimal: false,
                maskExp: /[0-9]/
            });

            var $window = this.getChild();
            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
            this.spnStart.on('entervalue', _.bind(this.onPrimary, this));
            this.spnStart.$el.find('input').focus();

            this.afterRender();
        },

        getFocusedComponents: function() {
            return [this.spnStart].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.spnStart;
        },

        afterRender: function() {
            this._setDefaults(this.props);
        },

        _setDefaults: function (props) {
            if (props) {
                this.spnStart.setValue(props.start);
                this.onFormatSelect(props.format);
            }
        },

        _handleInput: function(state) {
            if (this.options.handler) {
                this.options.handler.call(this, state, this.getSettings());
            }

            this.close();
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        getSettings: function() {
            return this.spnStart.getNumberValue();
        },

        onPrimary: function() {
            this._handleInput('ok');
            return false;
        },

        onFormatSelect: function(format) {
            var maskExp = /[0-9]/,
                me = this,
                toCustomFormat = function(value) {
                    return value!=='' ? AscCommon.IntToNumberFormat(parseInt(value), me.props.format) : value;
                },
                convertValue = function (value) { return value; },
                minValue = 1;

            switch (format) {
                case Asc.c_oAscNumberingFormat.UpperRoman: // I, II, III, ...
                case Asc.c_oAscNumberingFormat.LowerRoman: // i, ii, iii, ...
                    convertValue = function (value) {
                        return /\D/.test(value) ? AscCommon.RomanToInt(value) : parseInt(value);
                    };
                    maskExp = /[IVXLCDMivxlcdm0-9]/;
                    break;
                case Asc.c_oAscNumberingFormat.UpperLetter: // A, B, C, ...
                case Asc.c_oAscNumberingFormat.LowerLetter: // a, b, c, ...
                    convertValue = function (value) {
                        return /\D/.test(value) ? AscCommon.LatinNumberingToInt(value) : parseInt(value);
                    };
                    maskExp = /[A-Za-z0-9]/;
                    break;
                case Asc.c_oAscNumberingFormat.RussianLower: // а, б, в, ...
                case Asc.c_oAscNumberingFormat.RussianUpper: // А, Б, В, ...
                    convertValue = function (value) {
                        return /\D/.test(value) ? AscCommon.RussianNumberingToInt(value) : parseInt(value);
                    };
                    maskExp = /[А-Яа-я0-9]/;
                    break;
                default: // 1, 2, 3, ...
                    toCustomFormat = function(value) { return value; };
                    minValue = AscCommon.IntToNumberFormat(0, this.props.format)!=='' ? 0 : 1;
                    break;
            }

            this.spnStart.setMask(maskExp);
            this.spnStart.options.toCustomFormat = toCustomFormat;
            this.spnStart.options.fromCustomFormat = function(value) {
                var res = convertValue(value);
                return isNaN(res) ? '1' : res.toString();
            };
            this.spnStart.on('changing', function(cmp, newValue) {
                var res = convertValue(newValue);
                if (isNaN(res)) {
                    cmp.setValue(1);
                }
            });
            this.spnStart.setMinValue(minValue);
            this.spnStart.setValue(this.spnStart.getValue());
        }

    }, DE.Views.NumberingValueDialog || {}))
});