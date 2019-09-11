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
 *  CaptionDialog.js
 *
 *  Created by Julia Radzhabova on 10.09.2019
 *  Copyright (c) 2019 Ascensio System SIA. All rights reserved.
 *
 */
define([
    'common/main/lib/util/utils',
    'common/main/lib/component/MetricSpinner',
    'common/main/lib/component/ComboBox',
    'common/main/lib/view/AdvancedSettingsWindow'
], function () { 'use strict';

    DE.Views.CaptionDialog = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 351,
            height: 330
        },

        initialize : function(options) {
            var me = this;

            _.extend(this.options, {
                title: this.textTitle,
                template: [
                    '<div class="box" style="height:' + (me.options.height - 85) + 'px;">',
                        '<div class="content-panel" style="padding: 0 5px;"><div class="inner-content">',
                            '<div class="settings-panel active">',
                                '<table cols="4" style="width: auto;">',
                                    '<tr>',
                                        '<td colspan="3" class="padding-small">',
                                            '<label class="input-label">', me.textCaption,'</label>',
                                            '<div id="caption-txt-caption" style="margin-right: 10px;"></div>',
                                        '</td>',
                                        '<td class="padding-small">',
                                            '<label class="input-label">', me.textInsert,'</label>',
                                            '<div id="caption-combo-position" class="input-group-nr" style="width:75px;"></div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td colspan="2" class="padding-small">',
                                            '<label class="input-label">', me.textLabel,'</label>',
                                            '<div id="caption-combo-label" class="input-group-nr" style="width:160px;margin-right: 10px;"></div>',
                                        '</td>',
                                        '<td class="padding-small" style="vertical-align: bottom;">',
                                            '<button type="button" result="add" class="btn btn-text-default" id="caption-btn-add" style="margin-right: 10px;">', me.textAdd,'</button>',
                                        '</td>',
                                        '<td class="padding-small" style="vertical-align: bottom;">',
                                            '<button type="button" result="add" class="btn btn-text-default" id="caption-btn-delete">', me.textDelete,'</button>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td colspan="2" class="padding-large">',
                                            '<label class="input-label" >', me.textNumbering,'</label>',
                                            '<div id="caption-combo-numbering" class="input-group-nr" style="width:160px;"></div>',
                                        '</td>',
                                        '<td class="padding-large">',
                                        '</td>',
                                        '<td class="padding-large">',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td colspan="4" class="padding-small">',
                                            '<div id="caption-checkbox-chapter"></div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td colspan="2" class="padding-small">',
                                            '<label class="input-label">', me.textChapter,'</label>',
                                            '<div id="caption-combo-chapter" class="input-group-nr" style="width:160px;margin-right: 10px;"></div>',
                                        '</td>',
                                        '<td colspan="2" class="padding-small">',
                                            '<label class="input-label" >', me.textSeparator,'</label>',
                                            '<div id="caption-combo-separator" class="input-group-nr" style="width:160px;"></div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td colspan="4" class="padding-small">',
                                            '<label class="input-label" id="caption-label-example">', me.textExamples,'</label>',
                                        '</td>',
                                    '</tr>',
                                '</table>',
                            '</div>',
                        '</div></div>',
                    '</div>',
                    '<div class="footer center">',
                    '<button class="btn normal dlg-btn primary" result="ok" style="margin-right: 10px;">' + this.okButtonText + '</button>',
                    '<button class="btn normal dlg-btn" result="cancel">' + this.cancelButtonText + '</button>',
                    '</div>'
                ].join('')
            }, options);

            this.api        = options.api;
            this.handler    = options.handler;
            this.props      = options.props;

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this.txtCaption = new Common.UI.InputField({
                el          : $('#caption-txt-caption'),
                allowBlank  : false,
                value       : ''
            });

            this.cmbPosition = new Common.UI.ComboBox({
                el: $('#caption-combo-position'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 75px;',
                editable: false,
                data: [
                    { displayValue: this.textBefore,   value: Asc.c_oAscFootnotePos.PageBottom },
                    { displayValue: this.textAfter,   value: Asc.c_oAscFootnotePos.BeneathText }
                ]
            });
            this.cmbPosition.setValue(Asc.c_oAscFootnotePos.PageBottom);

            this.cmbLabel = new Common.UI.ComboBox({
                el: $('#caption-combo-label'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 150px;',
                editable: true,
                data: []
            });

            this.btnAdd = new Common.UI.Button({
                el: $('#caption-btn-add'),
                disabled: true
            });
            // this.btnAdd.on('click', _.bind(this.addLabel, this));

            this.btnDelete = new Common.UI.Button({
                el: $('#caption-btn-delete'),
                disabled: true
            });
            // this.btnDelete.on('click', _.bind(this.deleteLabel, this));

            this.cmbNumbering = new Common.UI.ComboBox({
                el: $('#caption-combo-numbering'),
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
            this.cmbNumbering.setValue(Asc.c_oAscNumberingFormat.Decimal);
            // this.cmbNumbering.on('selected', _.bind(this.onFormatSelect, this));

            this.chChapter = new Common.UI.CheckBox({
                el: $('#caption-checkbox-chapter'),
                labelText: this.textChapterInc
            });
            this.chChapter.on('change', function(field, newValue, oldValue) {
                me.cmbChapter.setDisabled(newValue!=='checked');
                me.cmbSeparator.setDisabled(newValue!=='checked');
            });

            this.cmbChapter = new Common.UI.ComboBox({
                el: $('#caption-combo-chapter'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 150px;',
                editable: false,
                disabled: true,
                data: []
            });
            // this.cmbChapter.setValue(0);
            // this.cmbChapter.on('selected', _.bind(this.onFormatSelect, this));

            this.cmbSeparator = new Common.UI.ComboBox({
                el: $('#caption-combo-separator'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 150px;',
                editable: false,
                disabled: true,
                data: [
                    { displayValue: '-   (' + this.textHyphen + ')',      value: Asc.c_oAscTabLeader.Hyphen },
                    { displayValue: '.   (' + this.textPeriod + ')',      value: Asc.c_oAscTabLeader.Dot },
                    { displayValue: ':   (' + this.textColon + ')',       value: Asc.c_oAscTabLeader.Hyphen },
                    { displayValue: '--  (' + this.textLongDash + ')',   value: Asc.c_oAscTabLeader.Hyphen },
                    { displayValue: '--  (' + this.textDash + ')',       value: Asc.c_oAscTabLeader.Hyphen }
                ]
            });
            // this.cmbSeparator.setValue(Asc.c_oAscNumberingFormat.Decimal);
            // this.cmbSeparator.on('selected', _.bind(this.onFormatSelect, this));

            this.lblExample = this.$window.find('#caption-label-example');

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
            }
        },

        getSettings: function () {
            return {};
        },

        onDlgBtnClick: function(event) {
            this._handleInput((typeof(event) == 'object') ? event.currentTarget.attributes['result'].value : event);
        },

        onPrimary: function() {
            this._handleInput('insert');
            return false;
        },

        _handleInput: function(state) {
            this.handler && this.handler.call(this, state,  (state == 'ok') ? this.getSettings() : undefined);
            this.close();
        },

        textTitle:    'Insert Caption',
        textCaption: 'Caption',
        textInsert: 'Insert',
        textLabel: 'Label',
        textAdd: 'Add label',
        textDelete: 'Delete label',
        textNumbering: 'Numbering',
        textChapterInc: 'Include chapter number',
        textChapter: 'Chapter starts with style',
        textSeparator: 'Use separator',
        textExamples: 'Examples: Table 2-A, Image 1.IV',
        textBefore: 'Before',
        textAfter: 'After',
        textHyphen: 'hyphen',
        textPeriod: 'period',
        textColon: 'colon',
        textLongDash: 'em-dash',
        textDash: 'en-dash'

    }, DE.Views.CaptionDialog || {}))
});