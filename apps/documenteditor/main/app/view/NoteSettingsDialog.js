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
 *  NoteSettingsDialog.js.js
 *
 *  Created by Julia Radzhabova on 18.12.2016
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/MetricSpinner',
    'common/main/lib/component/ComboBox',
    'common/main/lib/view/AdvancedSettingsWindow'
], function () { 'use strict';

    DE.Views.NoteSettingsDialog = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 300,
            height: 380
        },

        initialize : function(options) {
            var me = this;

            _.extend(this.options, {
                title: this.textTitle,
                template: [
                    '<div class="box" style="height:' + (me.options.height - 85) + 'px;">',
                        '<div class="content-panel" style="padding: 0 5px;"><div class="inner-content">',
                            '<div class="settings-panel active">',
                                '<table cols="1" style="width: 100%;">',
                                    '<tr>',
                                        '<td class="padding-small">',
                                        '<label class="header">', me.textLocation,'</label>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-large">',
                                            '<label class="input-label" style="margin-top: 4px;">', me.textFootnote,'</label>',
                                            '<div id="note-settings-combo-footnote" class="input-group-nr" style="display: inline-block; width:150px;float:right;"></div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td>',
                                            '<div class="padding-large"></div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-small">',
                                            '<label class="header">', me.textFormat,'</label>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-small">',
                                            '<div style="display: inline-block; margin-right: 10px; vertical-align: middle;">',
                                                '<label class="input-label">', me.textNumFormat,'</label>',
                                                '<div id="note-settings-combo-format" class="input-group-nr" style="width:150px;"></div>',
                                            '</div>','<div style="display: inline-block; vertical-align: middle;">',
                                                '<label class="input-label">', me.textStart,'</label>',
                                                '<div id="note-settings-spin-start"></div>',
                                            '</div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-small">',
                                            '<label class="input-label">', me.textNumbering, '</label>',
                                            '<div id="note-settings-combo-numbering" class="input-group-nr" style="width:150px;"></div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-large">',
                                            '<label class="input-label">', me.textCustom, '</label>',
                                            '<div id="note-settings-txt-custom"></div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td>',
                                            '<div class="padding-large"></div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-small">',
                                            '<label class="header" style="margin-top: 4px;">', me.textApplyTo,'</label>',
                                            '<div id="note-settings-combo-apply" class="input-group-nr" style="display: inline-block; width:150px;float:right;"></div>',
                                        '</td>',
                                    '</tr>',
                                '</table>',
                            '</div></div>',
                        '</div>',
                    '</div>',
                    '<div class="footer center">',
                    '<button class="btn normal dlg-btn primary" result="insert" style="margin-right: 10px;  width: 86px;">' + me.textInsert + '</button>',
                    '<button id="note-settings-btn-apply" class="btn normal dlg-btn primary" result="apply" style="margin-right: 10px;  width: 86px;">' + me.textApply + '</button>',
                    '<button class="btn normal dlg-btn" result="cancel" style="width: 86px;">' + me.textCancel + '</button>',
                    '</div>'
                ].join('')
            }, options);

            this.api        = options.api;
            this.handler    = options.handler;
            this.props      = options.props;

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);

            this.FormatType = 1;
            this.StartValue = 1;
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this.cmbFootnote = new Common.UI.ComboBox({
                el: $('#note-settings-combo-footnote'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 150px;',
                editable: false,
                data: [
                    { displayValue: this.textPageBottom,   value: Asc.c_oAscFootnotePos.PageBottom },
                    { displayValue: this.textTextBottom,   value: Asc.c_oAscFootnotePos.BeneathText }
                ]
            });
            this.cmbFootnote.setValue(Asc.c_oAscFootnotePos.PageBottom);

            this.cmbFormat = new Common.UI.ComboBox({
                el: $('#note-settings-combo-format'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 150px;',
                editable: false,
                data: [
                    { displayValue: '1, 2, 3,...',      value: Asc.c_oAscNumberingFormat.Decimal, maskExp: /[0-9]/, defValue: 1 },
                    { displayValue: 'a, b, c,...',      value: Asc.c_oAscNumberingFormat.LowerLetter, maskExp: /[a-z]/, defValue: 'a' },
                    { displayValue: 'A, B, C,...',      value: Asc.c_oAscNumberingFormat.UpperLetter, maskExp: /[A-Z]/, defValue: 'A' },
                    { displayValue: 'i, ii, iii,...',   value: Asc.c_oAscNumberingFormat.LowerRoman, maskExp: /[ivxlcdm]/, defValue: 'i' },
                    { displayValue: 'I, II, III,...',   value: Asc.c_oAscNumberingFormat.UpperRoman, maskExp: /[IVXLCDM]/, defValue: 'I' }
                ]
            });
            this.cmbFormat.setValue(this.FormatType);
            this.cmbFormat.on('selected', _.bind(this.onFormatSelect, this));

            // this.spnStart = new Common.UI.MetricSpinner({
            this.spnStart = new Common.UI.CustomSpinner({
                el: $('#note-settings-spin-start'),
                step: 1,
                width: 85,
                defaultUnit : "",
                value: 1,
                maxValue: 16383,
                minValue: 1,
                allowDecimal: false,
                maskExp: /[0-9]/
            });

            this.cmbNumbering = new Common.UI.ComboBox({
                el: $('#note-settings-combo-numbering'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 150px;',
                editable: false,
                data: [
                    { displayValue: this.textContinue,   value: Asc.c_oAscFootnoteRestart.Continuous },
                    { displayValue: this.textEachSection,   value: Asc.c_oAscFootnoteRestart.EachSect },
                    { displayValue: this.textEachPage,   value: Asc.c_oAscFootnoteRestart.EachPage }
                ]
            });
            this.cmbNumbering.setValue(Asc.c_oAscFootnoteRestart.Continuous);

            this.txtCustom = new Common.UI.InputField({
                el          : $('#note-settings-txt-custom'),
                allowBlank  : true,
                validateOnChange: true,
                validateOnBlur: false,
                style       : 'width: 85px; vertical-align: middle;',
                value       : ''
            }).on ('changing', function (input, value) {
                me.cmbFormat.setDisabled(value.length>0);
                me.spnStart.setDisabled(value.length>0);
                me.btnApply.setDisabled(value.length>0);
            });

            this.cmbApply = new Common.UI.ComboBox({
                el: $('#note-settings-combo-apply'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 150px;',
                editable: false,
                data: [
                    { displayValue: this.textDocument,   value: 1 },
                    { displayValue: this.textSection,   value: 0 }
                ]
            });
            this.cmbApply.setValue(1);

            this.btnApply = new Common.UI.Button({
                el: $('#note-settings-btn-apply')
            });

            this.afterRender();
        },

        afterRender: function() {
            this._setDefaults(this.props);
        },

        show: function() {
            Common.Views.AdvancedSettingsWindow.prototype.show.apply(this, arguments);
        },

        _setDefaults: function (props) {
            if (props) {
                var val = props.get_Pos();
                this.cmbFootnote.setValue(val);

                val = props.get_NumFormat();
                this.cmbFormat.setValue(val);
                this.onFormatSelect(this.cmbFormat, this.cmbFormat.getSelectedRecord());

                val = props.get_NumStart();
                this.spnStart.setValue(val);

                val = props.get_NumRestart();
                this.cmbNumbering.setValue(val);
            }
        },

        getSettings: function () {
            var props   = new Asc.CAscFootnotePr();

            props.put_Pos(this.cmbFootnote.getValue());
            props.put_NumRestart(this.cmbNumbering.getValue());

            var val = this.txtCustom.getValue();
            if (_.isEmpty(val)) {
                val = this.cmbFormat.getValue();
                props.put_NumFormat(val);
                props.put_NumStart(this.spnStart.getNumberValue());
            }

            return {props: props, applyToAll: (this.cmbApply.getValue()==1), custom: _.isEmpty(val) ? undefined : val};
        },

        onDlgBtnClick: function(event) {
            var me = this;
            var state = (typeof(event) == 'object') ? event.currentTarget.attributes['result'].value : event;
            if (state == 'insert' || state == 'apply') {
                this.handler && this.handler.call(this, state,  (state == 'insert' || state == 'apply') ? this.getSettings() : undefined);
            }

            this.close();
        },

        onPrimary: function() {
            return true;
        },

        onFormatSelect: function(combo, record) {
            if (!record) return;

            this.spnStart.setMask(record.maskExp);

            var me = this;
            switch (record.value) {
                case Asc.c_oAscNumberingFormat.UpperRoman: // I, II, III, ...
                    this.spnStart.options.toCustomFormat = this._10toRome;
                    this.spnStart.options.fromCustomFormat = this._Rometo10;
                    break;
                case Asc.c_oAscNumberingFormat.LowerRoman: // i, ii, iii, ...
                    this.spnStart.options.toCustomFormat = function(value) { return me._10toRome(value).toLocaleLowerCase(); };
                    this.spnStart.options.fromCustomFormat = function(value) { return me._Rometo10(value.toLocaleUpperCase()); };
                    break;
                case Asc.c_oAscNumberingFormat.UpperLetter: // A, B, C, ...
                    this.spnStart.options.toCustomFormat = this._10toS;
                    this.spnStart.options.fromCustomFormat = this._Sto10;
                    break;
                case Asc.c_oAscNumberingFormat.LowerLetter: // a, b, c, ...
                    this.spnStart.options.toCustomFormat = function(value) { return me._10toS(value).toLocaleLowerCase(); };
                    this.spnStart.options.fromCustomFormat = function(value) { return me._Sto10(value.toLocaleUpperCase()); };
                    break;
                default: // 1, 2, 3, ...
                    this.spnStart.options.toCustomFormat = function(value) { return value; };
                    this.spnStart.options.fromCustomFormat = function(value) { return value; };
                    break;
            }

            this.spnStart.setValue(this.spnStart.getValue());
            this.FormatType = record.value;
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

        textTitle:    'Notes Settings',
        textLocation: 'Location',
        textFootnote: 'Footnote',
        textPageBottom: 'Bottom of page',
        textTextBottom: 'Below text',
        textFormat: 'Format',
        textNumFormat: 'Number Format',
        textStart: 'Start at',
        textNumbering: 'Numbering',
        textContinue: 'Continuous',
        textEachPage: 'Restart each page',
        textEachSection: 'Restart each section',
        textApplyTo: 'Apply changes to',
        textDocument: 'Whole document',
        textSection: 'Current section',
        textApply: 'Apply',
        textInsert: 'Insert',
        textCancel: 'Cancel',
        textCustom: 'Custom Mark'

    }, DE.Views.NoteSettingsDialog || {}))
});