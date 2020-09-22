/*
 *
 * (c) Copyright Ascensio System SIA 2010-2020
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
 *  CrossReferenceDialog.js
 *
 *  Created by Julia Radzhabova on 22.09.2020
 *  Copyright (c) 2020 Ascensio System SIA. All rights reserved.
 *
 */
define([
    'common/main/lib/component/Window',
    'common/main/lib/component/ComboBox'
], function () { 'use strict';

    DE.Views.CrossReferenceDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 400,
            height: 406,
            style: 'min-width: 240px;',
            cls: 'modal-dlg'
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.txtTitle,
                buttons: [{value: 'ok', caption: this.textInsert}, 'close']
            }, options || {});

            this.template = [
                '<div class="box">',
                    '<table cols="2" style="width: 100%;">',
                        '<tr>',
                            '<td style="padding-right: 5px;">',
                                '<label class="input-label">' + this.txtType + '</label>',
                                '<div id="id-dlg-cross-type" class="input-group-nr" style="width: 100%;margin-bottom: 10px;"></div>',
                            '</td>',
                            '<td style="padding-left: 5px;">',
                                '<label class="input-label">' + this.txtReference + '</label>',
                                '<div id="id-dlg-cross-ref" class="input-group-nr" style="width: 100%;margin-bottom: 10px;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td colspan="2" style="padding-bottom: 10px;">',
                                '<div id="id-dlg-cross-insert-as" style="width:100%;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td colspan="2" style="padding-bottom: 7px;">',
                                '<div id="id-dlg-cross-below-above" style="width:100%;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td colspan="2" style="padding-bottom: 10px;">',
                                '<div id="id-dlg-cross-separate" style="display: inline-block;vertical-align: middle;margin-right: 10px;"></div>',
                                '<div id="id-dlg-cross-separator" style="display: inline-block;vertical-align: middle;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td colspan="2" style="width: 100%;">',
                                '<label>' + this.textWhich + '</label>',
                                '<div id="id-dlg-cross-list" class="no-borders" style="width:100%; height:161px;margin-top: 2px; "></div>',
                            '</td>',
                        '</tr>',
                    '</table>',
                '</div>'
            ].join('');

            this.props = options.props;
            this.api = options.api;
            this.options.tpl = _.template(this.template)(this.options);

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var me = this,
                $window = this.getChild();
            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

            this.cmbType = new Common.UI.ComboBox({
                el          : $window.find('#id-dlg-cross-type'),
                menuStyle   : 'min-width: 100%;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [
                    { value: 0, displayValue: this.textParagraph },
                    { value: 1, displayValue: this.textHeading },
                    { value: 2, displayValue: this.textBookmark },
                    { value: 3, displayValue: this.textFootnote },
                    { value: 4, displayValue: this.textEndnote },
                    { value: 5, displayValue: this.textEquation },
                    { value: 6, displayValue: this.textFigure },
                    { value: 7, displayValue: this.textTable }
                ]
            });
            this.cmbType.on('selected', _.bind(this.onTypeSelected, this));

            this.cmbReference = new Common.UI.ComboBox({
                el          : $window.find('#id-dlg-cross-ref'),
                menuStyle   : 'min-width: 100%;max-height: 183px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : []
            });
            this.cmbReference.on('selected', _.bind(function (combo, record) {
                if (this._changedProps) {
                    if (!this._changedProps.get_TextPr()) this._changedProps.put_TextPr(new AscCommonWord.CTextPr());
                    this._changedProps.get_TextPr().put_FontSize((record.value>0) ? record.value : undefined);
                }
                if (this.api) {
                    this.api.SetDrawImagePreviewBullet('bulleted-list-preview', this.props, this.level, this.type==2);
                }
            }, this));

            this.chInsertAs = new Common.UI.CheckBox({
                el: $window.find('#id-dlg-cross-insert-as'),
                labelText: this.textInsertAs
            });

            this.chBelowAbove = new Common.UI.CheckBox({
                el: $window.find('#id-dlg-cross-below-above'),
                labelText: this.textIncludeAbove
            });

            this.chSeparator = new Common.UI.CheckBox({
                el: $window.find('#id-dlg-cross-separate'),
                labelText: this.textSeparate
            }).on('change', _.bind(function(field, newValue, oldValue, eOpts){
                var checked = field.getValue() === 'checked';
                this.inputSeparator.setDisabled(!checked);
            }, this));

            this.inputSeparator = new Common.UI.InputField({
                el: $window.findById('#id-dlg-cross-separator'),
                style: 'width: 35px;',
                validateOnBlur: false,
                disabled: true
            });

            this.refList = new Common.UI.ListView({
                el: $window.find('#id-dlg-cross-list'),
                store: new Common.UI.DataViewStore()
            });
            this.refList.on('item:select', _.bind(this.onSelectReference, this));

            this.afterRender();
        },

        afterRender: function() {
            this._setDefaults(this.props);
        },

        _handleInput: function(state) {
            if (this.options.handler) {
                this.options.handler.call(this, state, {});
            }
            if (state=='ok') {
                return;
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

        _setDefaults: function (props) {
            this.cmbType.setValue(0);
            this.onTypeSelected(this.cmbType, this.cmbType.getSelectedRecord());
            if (props) {
            }
        },

        onSelectReference: function(listView, itemView, record) {
            // record.get('value');
        },

        onTypeSelected: function (combo, record) {
            var arr = [];
            switch (record.value) {
                case 0: // paragraph
                    arr = [
                        { value: Asc.c_oAscDocumentRefenceToType.PageNum, displayValue: this.textPageNum },
                        { value: Asc.c_oAscDocumentRefenceToType.ParaNum, displayValue: this.textParaNum },
                        { value: Asc.c_oAscDocumentRefenceToType.ParaNumNoContext, displayValue: this.textParaNumNo },
                        { value: Asc.c_oAscDocumentRefenceToType.ParaNumFullContex, displayValue: this.textParaNumFull },
                        { value: Asc.c_oAscDocumentRefenceToType.Text, displayValue: this.textText },
                        { value: Asc.c_oAscDocumentRefenceToType.AboveBelow, displayValue: this.textAboveBelow }
                    ];
                    break;
                case 1: // heading
                    arr = [
                        { value: Asc.c_oAscDocumentRefenceToType.Text, displayValue: this.textHeadingText },
                        { value: Asc.c_oAscDocumentRefenceToType.PageNum, displayValue: this.textPageNum },
                        { value: Asc.c_oAscDocumentRefenceToType.ParaNum, displayValue: this.textHeadingNum },
                        { value: Asc.c_oAscDocumentRefenceToType.ParaNumNoContext, displayValue: this.textHeadingNumNo },
                        { value: Asc.c_oAscDocumentRefenceToType.ParaNumFullContex, displayValue: this.textHeadingNumFull },
                        { value: Asc.c_oAscDocumentRefenceToType.AboveBelow, displayValue: this.textAboveBelow }
                    ];
                    break;
                case 2: // bookmark
                    arr = [
                        { value: Asc.c_oAscDocumentRefenceToType.Text, displayValue: this.textBookmarkText },
                        { value: Asc.c_oAscDocumentRefenceToType.PageNum, displayValue: this.textPageNum },
                        { value: Asc.c_oAscDocumentRefenceToType.ParaNum, displayValue: this.textParaNum },
                        { value: Asc.c_oAscDocumentRefenceToType.ParaNumNoContext, displayValue: this.textParaNumNo },
                        { value: Asc.c_oAscDocumentRefenceToType.ParaNumFullContex, displayValue: this.textParaNumFull },
                        { value: Asc.c_oAscDocumentRefenceToType.AboveBelow, displayValue: this.textAboveBelow }
                    ];
                    break;
                case 3: // note
                    arr = [
                        { value: Asc.c_oAscDocumentRefenceToType.NoteNumber, displayValue: this.textNoteNum },
                        { value: Asc.c_oAscDocumentRefenceToType.PageNum, displayValue: this.textPageNum },
                        { value: Asc.c_oAscDocumentRefenceToType.AboveBelow, displayValue: this.textAboveBelow },
                        { value: Asc.c_oAscDocumentRefenceToType.NoteNumberFormatted, displayValue: this.textNoteNumForm }
                    ];
                    break;
                case 4: // end note
                    arr = [
                        { value: Asc.c_oAscDocumentRefenceToType.NoteNumber, displayValue: this.textEndNoteNum },
                        { value: Asc.c_oAscDocumentRefenceToType.PageNum, displayValue: this.textPageNum },
                        { value: Asc.c_oAscDocumentRefenceToType.AboveBelow, displayValue: this.textAboveBelow },
                        { value: Asc.c_oAscDocumentRefenceToType.NoteNumberFormatted, displayValue: this.textEndNoteNumForm }
                    ];
                    break;
                case 5: // Equation
                case 6: // Shape
                case 7: // Table
                    arr = [
                        { value: Asc.c_oAscDocumentRefenceToType.EntireCaption, displayValue: this.textCaption },
                        { value: Asc.c_oAscDocumentRefenceToType.OnlyLabelAndNumber, displayValue: this.textLabelNum },
                        { value: Asc.c_oAscDocumentRefenceToType.OnlyCaptionText, displayValue: this.textOnlyCaption },
                        { value: Asc.c_oAscDocumentRefenceToType.PageNum, displayValue: this.textPageNum },
                        { value: Asc.c_oAscDocumentRefenceToType.AboveBelow, displayValue: this.textAboveBelow }
                    ];
                    break;
            }
            this.cmbReference.setData(arr);
            this.cmbReference.setValue(arr[0].value);
        },

        txtTitle: 'Cross-reference',
        txtType: 'Reference type',
        txtReference: 'Insert reference to',
        textInsertAs: 'Insert as hyperlink',
        textSeparate: 'Separate numbers with',
        textIncludeAbove: 'Include above/below',
        textWhich: 'For which caption',
        textPageNum: 'Page number',
        textParaNum: 'Paragraph number',
        textParaNumNo: 'Paragraph number (no context)',
        textParaNumFull: 'Paragraph number (full context)',
        textText: 'Paragraph text',
        textAboveBelow: 'Above/below',
        textHeadingText: 'Heading text',
        textHeadingNum: 'Heading number',
        textHeadingNumNo: 'Heading number (no context)',
        textHeadingNumFull: 'Heading number (full context)',
        textBookmarkText: 'Bookmark text',
        textNoteNum: 'Footnote number',
        textNoteNumForm: 'Footnote number (formatted)',
        textEndNoteNum: 'Endnote number',
        textEndNoteNumForm: 'Endnote number (formatted)',
        textCaption: 'Entire caption',
        textLabelNum: 'Only label and number',
        textOnlyCaption: 'Only caption text',
        textParagraph: 'Paragraph',
        textHeading: 'Heading',
        textBookmark: 'Bookmark',
        textFootnote: 'Footnote',
        textEndnote: 'Endnote',
        textEquation: 'Equation',
        textFigure: 'Figure',
        textTable: 'Table',
        textInsert: 'Insert'

    }, DE.Views.CrossReferenceDialog || {}))
});