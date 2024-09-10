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