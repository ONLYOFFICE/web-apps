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
 *  NumberingValueDialog.js
 *
 *  Created by Julia Radzhabova on 7/20/18
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/component/Window',
    'common/main/lib/component/MetricSpinner'
], function () { 'use strict';

    DE.Views.NumberingValueDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 214,
            header: true,
            style: 'min-width: 214px;',
            cls: 'modal-dlg'
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
                '<div class="footer center">',
                '<button class="btn normal dlg-btn primary" result="ok" style="margin-right: 10px;">' + this.okButtonText + '</button>',
                '<button class="btn normal dlg-btn" result="cancel">' + this.cancelButtonText + '</button>',
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
                minValue: 1,
                allowDecimal: false,
                maskExp: /[0-9]/
            });

            var $window = this.getChild();
            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
            this.spnStart.on('entervalue', _.bind(this.onPrimary, this));
            this.spnStart.$el.find('input').focus();

            this.afterRender();
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
            var maskExp = /[0-9]/;
            var me = this;
            switch (format) {
                case Asc.c_oAscNumberingFormat.UpperRoman: // I, II, III, ...
                    this.spnStart.options.toCustomFormat = this._10toRome;
                    this.spnStart.options.fromCustomFormat = this._Rometo10;
                    maskExp = /[IVXLCDM]/;
                    break;
                case Asc.c_oAscNumberingFormat.LowerRoman: // i, ii, iii, ...
                    this.spnStart.options.toCustomFormat = function(value) { return me._10toRome(value).toLocaleLowerCase(); };
                    this.spnStart.options.fromCustomFormat = function(value) { return me._Rometo10(value.toLocaleUpperCase()); };
                    maskExp = /[ivxlcdm]/;
                    break;
                case Asc.c_oAscNumberingFormat.UpperLetter: // A, B, C, ...
                    this.spnStart.options.toCustomFormat = this._10toS;
                    this.spnStart.options.fromCustomFormat = this._Sto10;
                    maskExp = /[A-Z]/;
                    break;
                case Asc.c_oAscNumberingFormat.LowerLetter: // a, b, c, ...
                    this.spnStart.options.toCustomFormat = function(value) { return me._10toS(value).toLocaleLowerCase(); };
                    this.spnStart.options.fromCustomFormat = function(value) { return me._Sto10(value.toLocaleUpperCase()); };
                    maskExp = /[a-z]/;
                    break;
                default: // 1, 2, 3, ...
                    this.spnStart.options.toCustomFormat = function(value) { return value; };
                    this.spnStart.options.fromCustomFormat = function(value) { return value; };
                    break;
            }

            this.spnStart.setMask(maskExp);
            this.spnStart.setValue(this.spnStart.getValue());
        },

        _10toS: function(value) {
            value = parseInt(value);
            var n = Math.ceil(value / 26),
                code = String.fromCharCode((value-1) % 26 + "A".charCodeAt(0)) ,
                result = '';

            for (var i=0; i<n; i++ ) {
                result += code;
            }
            return result;
        },

        _Sto10: function(str) {
            if ( str.length<1 || (new RegExp('[^' + str.charAt(0) + ']')).test(str) || !/[A-Z]/.test(str)) return 1;

            var n = str.length-1,
                result = str.charCodeAt(0) - "A".charCodeAt(0) + 1;
            result += 26*n;

            return result;
        },

        _10toRome: function(value) {
            value = parseInt(value);
            var result = '',
                digits = [
                    ['M',  1000],
                    ['CM', 900],
                    ['D',  500],
                    ['CD', 400],
                    ['C',  100],
                    ['XC', 90],
                    ['L',  50],
                    ['XL', 40],
                    ['X',  10],
                    ['IX', 9],
                    ['V',  5],
                    ['IV', 4],
                    ['I',  1]
                ];

            var val = digits[0][1],
                div = Math.floor(value / val),
                n = 0;

            for (var i=0; i<div; i++)
                result += digits[n][0];
            value -= div * val;
            n++;

            while (value>0) {
                val = digits[n][1];
                div = value - val;
                if (div>=0) {
                    result += digits[n][0];
                    value = div;
                } else
                    n++;
            }

            return result;
        },

        _Rometo10: function(str) {
            if ( !/[IVXLCDM]/.test(str) || str.length<1 ) return 1;

            var digits = {
                'I': 1,
                'V': 5,
                'X': 10,
                'L': 50,
                'C': 100,
                'D': 500,
                'M': 1000
            };

            var n = str.length-1,
                result = digits[str.charAt(n)],
                prev = result;

            for (var i=n-1; i>=0; i-- ) {
                var val = digits[str.charAt(i)];
                if (val<prev) {
                    if (prev/val>10) return 1;
                    val *= -1;
                }

                result += val;
            }

            return result;
        },

        cancelButtonText: 'Cancel',
        okButtonText:   'Ok'
    }, DE.Views.NumberingValueDialog || {}))
});