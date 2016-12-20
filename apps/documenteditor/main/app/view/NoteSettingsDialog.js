/*
 *
 * (c) Copyright Ascensio System Limited 2010-2016
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
 *  Copyright (c) 2016 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/MetricSpinner',
    'common/main/lib/component/ComboBox',
    'common/main/lib/component/InputField',
    'common/main/lib/view/AdvancedSettingsWindow'
], function () { 'use strict';

    DE.Views.NoteSettingsDialog = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 300,
            height: 335
        },

        initialize : function(options) {
            var me = this;

            _.extend(this.options, {
                title: this.textTitle,
                template: [
                    '<div class="box" style="height:' + (me.options.height - 85) + 'px;">',
                        '<div class="content-panel" style="padding: 0;"><div class="inner-content">',
                            '<div class="settings-panel active">',
                                '<table cols="2" style="width: 100%;">',
                                    '<tr>',
                                        '<td colspan=2 class="padding-small">',
                                        '<label class="header">', me.textLocation,'</label>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-large" style="width: 50%;">',
                                            '<label class="input-label">', me.textFootnote,'</label>',
                                            // '<div id="note-settings-radio-footnote" class="padding-small" style="display: block;"></div>',
                                        '</td>',
                                        '<td class="padding-large">',
                                            '<div id="note-settings-combo-footnote" class="input-group-nr" style="width:100%;"></div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td colspan=2>',
                                            '<div class="separator horizontal padding-large text-only"></div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td colspan=2 class="padding-small">',
                                            '<label class="header">', me.textFormat,'</label>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-small">',
                                            '<label class="input-label">', me.textNumFormat,'</label>',
                                            '<div id="note-settings-combo-format" class="input-group-nr" style="width:100px;"></div>',
                                        '</td>',
                                        '<td class="padding-small">',
                                            '<label class="input-label">', me.textStart,'</label>',
                                            '<div id="note-settings-spin-start"></div>',
                                            // '<div id="note-settings-txt-start"></div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td colspan=2 class="padding-large">',
                                            '<label class="input-label">', me.textNumbering, '</label>',
                                            '<div id="note-settings-combo-numbering" class="input-group-nr" style="width:140px;"></div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td colspan=2>',
                                            '<div class="separator horizontal padding-large text-only"></div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-small">',
                                            '<label class="header">', me.textApplyTo,'</label>',
                                        '</td>',
                                        '<td class="padding-small">',
                                            '<div id="note-settings-combo-apply" class="input-group-nr" style="width:100%;"></div>',
                                        '</td>',
                                    '</tr>',
                                '</table>',
                            '</div></div>',
                        '</div>',
                    '</div>',
                    '<div class="footer center">',
                    '<button class="btn normal dlg-btn primary" result="insert" style="margin-right: 10px;  width: 86px;">' + me.textInsert + '</button>',
                    '<button class="btn normal dlg-btn primary" result="apply" style="margin-right: 10px;  width: 86px;">' + me.textApply + '</button>',
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
                menuStyle: 'min-width: 140px;',
                editable: false,
                data: [
                    { displayValue: this.textPageBottom,   value: Asc.c_oAscFootnotePos.section_footnote_PosPageBottom },
                    { displayValue: this.textTextBottom,   value: Asc.c_oAscFootnotePos.section_footnote_PosBeneathText }
                ]
            });
            this.cmbFootnote.setValue(Asc.c_oAscFootnotePos.section_footnote_PosPageBottom);

            this.cmbFormat = new Common.UI.ComboBox({
                el: $('#note-settings-combo-format'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100px;',
                editable: false,
                data: [
                    { displayValue: '1, 2, 3,...',      value: 1, maskExp: /[0-9]/, defValue: 1 },
                    { displayValue: 'a, b, c,...',      value: 5, maskExp: /[a-z]/, defValue: 'a' },
                    { displayValue: 'A, B, C,...',      value: 4, maskExp: /[A-Z]/, defValue: 'A' },
                    { displayValue: 'i, ii, iii,...',   value: 7, maskExp: /[ivxlcdm]/, defValue: 'i' },
                    { displayValue: 'I, II, III,...',   value: 3, maskExp: /[IVXLCDM]/, defValue: 'I' }
                ]
            });
            this.cmbFormat.setValue(this.FormatType);
            this.cmbFormat.on('selected', _.bind(this.onFormatSelect, this));

            this.spnStart = new Common.UI.MetricSpinner({
                el: $('#note-settings-spin-start'),
                step: 1,
                width: 100,
                defaultUnit : "",
                value: '1',
                maxValue: 16383,
                minValue: 1
            });
/*
            this.txtStart = new Common.UI.InputField({
                el          : $('#note-settings-txt-start'),
                allowBlank  : true,
                validateOnChange: false,
                style       : 'width: 100px; vertical-align: middle;',
                cls         : 'masked-field',
                maskExp     : /[a-z]/,
                value       : 'a',
                visible: false,
                validation  : function(value) {
                    if (this.options.maskExp.test(value)) {
                    } else
                        me.txtFieldNum.setValue('');

                    return true;
                }
            });
*/
            this.cmbNumbering = new Common.UI.ComboBox({
                el: $('#note-settings-combo-numbering'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 140px;',
                editable: false,
                data: [
                    { displayValue: this.textContinue,   value: Asc.c_oAscFootnoteRestart.section_footnote_RestartContinuous },
                    { displayValue: this.textEachSection,   value: Asc.c_oAscFootnoteRestart.section_footnote_RestartEachSect },
                    { displayValue: this.textEachPage,   value: Asc.c_oAscFootnoteRestart.section_footnote_RestartEachPage }
                ]
            });
            this.cmbNumbering.setValue(Asc.c_oAscFootnoteRestart.section_footnote_RestartContinuous);

            this.cmbApply = new Common.UI.ComboBox({
                el: $('#note-settings-combo-apply'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 140px;',
                editable: false,
                data: [
                    { displayValue: this.textDocument,   value: Asc.section_footnote_RestartContinuous },
                    { displayValue: this.textSection,   value: Asc.section_footnote_RestartEachSect }
                ]
            });
            this.cmbApply.setValue(Asc.section_footnote_RestartContinuous);

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
                // this.spnStart.setVisible(val==1);
                // this.txtStart.setVisible(val!=1);

                val = props.get_NumStart();
                this.spnStart.setValue(val);
                // this.txtStart.setValue(val);

                val = props.get_NumRestart();
                this.cmbNumbering.setValue(val);

                /*
                val = props.get_ApplyTo();
                this.cmbApply.setValue(val);
                */
            }
        },

        getSettings: function () {
            var props   = new Asc.CAscFootnotePr();

            props.put_Pos(this.cmbFootnote.getValue());
            props.put_NumRestart(this.cmbNumbering.getValue());

            var val = this.cmbFormat.getValue();

            props.put_NumFormat(val);
            // if (val==1)
                props.put_NumStart(this.spnStart.getNumberValue());
            // else
            //     props.put_NumStart(this.txtStart.getValue());

            // props.put_ApplyTo(this.cmbApply.getValue());

            return props;
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
            return;

            this.spnStart.setVisible(record.value == 1);
            this.txtStart.setVisible(record.value != 1);

            if (record.value !== 1)
                this.txtStart.setMask(record.maskExp);

            var value = 0;
            if (this.FormatType == 1) { // from 1,2,3,
                this.StartValue = value = this.spnStart.getNumberValue();

                if (record.value == 4 || record.value == 5) {
                    value = this._10toA(value);
                    this.txtStart.setValue((record.value == 5) ? value.toLocaleLowerCase() : value);
                } else if (this.FormatType !== record.value)
                    this.txtStart.setValue(record.defValue);
            } else if (this.FormatType == 4 || this.FormatType == 5) {
                if (this.FormatType == 4 && record.value == 5)
                    this.txtStart.setValue(this.txtStart.getValue().toLocaleLowerCase());
                else if (this.FormatType == 5 && record.value == 4)
                    this.txtStart.setValue(this.txtStart.getValue().toLocaleUpperCase());
                else if (record.value == 1) {
                    value = this._Ato10((record.value == 5) ? this.txtStart.getValue().toLocaleLowerCase() : this.txtStart.getValue());
                    this.spnStart.setValue(value);
                } else if (this.FormatType !== record.value)
                    this.txtStart.setValue(record.defValue);
            } else if (this.FormatType !== record.value){
                if (record.value==1)
                    this.spnStart.setValue(this.StartValue);
                else
                    this.txtStart.setValue(record.defValue);
            }

            this.FormatType = record.value;
        },

        _10toA: function(value) {
            var n = Math.ceil(value / 26),
                code = String.fromCharCode((value-1) % 26 + "A".charCodeAt(0)) ,
                result = '';

            for (var i=0; i<n; i++ ) {
                result += code;
            }
            return result;
        },

        _Ato10: function(str) {
            if ( (new RegExp('[^' + str.charAt(0) + ']')).test(str) ) return 1;

            var n = str.length-1,
                value = str.charCodeAt(0) - "A".charCodeAt(0) + 1;
            value += 26*n;

            return value;
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
        textCancel: 'Cancel'

    }, DE.Views.NoteSettingsDialog || {}))
});