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
 *  CrossReferenceDialog.js
 *
 *  Created on 22.09.2020
 *
 */
define([], function () { 'use strict';

    DE.Views.CrossReferenceDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 400,
            style: 'min-width: 240px;',
            cls: 'modal-dlg',
            modal: false,
            id: 'window-cross-ref'
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
                            '<td class="padding-right-5">',
                                '<label class="input-label">' + this.txtType + '</label>',
                                '<div id="id-dlg-cross-type" class="input-group-nr" style="width: 100%;margin-bottom: 10px;"></div>',
                            '</td>',
                            '<td class="padding-left-5">',
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
                                '<div id="id-dlg-cross-separate" class="margin-right-10" style="display: inline-block;vertical-align: middle;"></div>',
                                '<div id="id-dlg-cross-separator" style="display: inline-block;vertical-align: middle;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td colspan="2" style="width: 100%;">',
                                '<label id="id-dlg-cross-which">' + this.textWhich + '</label>',
                                '<div id="id-dlg-cross-list" class="no-borders" style="width:368px; height:161px;margin-top: 2px; "></div>',
                            '</td>',
                        '</tr>',
                    '</table>',
                '</div>'
            ].join('');

            this.crossRefProps = options.crossRefProps;
            this.api = options.api;
            this.options.tpl = _.template(this.template)(this.options);
            this._locked = false;

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var me = this,
                $window = this.getChild();
            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

            var arr = Common.Utils.InternalSettings.get("de-settings-captions");
            if (arr==null || arr==undefined) {
                arr = Common.localStorage.getItem("de-settings-captions") || '';
                Common.Utils.InternalSettings.set("de-settings-captions", arr);
            }
            arr = arr ? JSON.parse(arr) : [];

            // 0 - not removable
            arr = arr.concat([{ value: 5, displayValue: this.textEquation },
                              { value: 6, displayValue: this.textFigure },
                              { value: 7, displayValue: this.textTable }
                             ]);
            arr.sort(function(a,b){
                var sa = a.displayValue.toLowerCase(),
                    sb = b.displayValue.toLowerCase();
                return sa>sb ? 1 : (sa<sb ? -1 : 0);
            });

            this.cmbType = new Common.UI.ComboBox({
                el          : $window.find('#id-dlg-cross-type'),
                menuStyle   : 'min-width: 100%;max-height: 233px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [
                    { value: 0, displayValue: this.textParagraph },
                    { value: 1, displayValue: this.textHeading },
                    { value: 2, displayValue: this.textBookmark },
                    { value: 3, displayValue: this.textFootnote },
                    { value: 4, displayValue: this.textEndnote }
                ].concat(arr)
            });
            this.cmbType.on('selected', _.bind(this.onTypeSelected, this));

            this.cmbReference = new Common.UI.ComboBox({
                el          : $window.find('#id-dlg-cross-ref'),
                menuStyle   : 'min-width: 100%;max-height: 233px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : []
            });
            this.cmbReference.on('selected', _.bind(this.onReferenceSelected, this));

            this.chInsertAs = new Common.UI.CheckBox({
                el: $window.find('#id-dlg-cross-insert-as'),
                labelText: this.textInsertAs,
                value: true
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
                store: new Common.UI.DataViewStore(),
                cls: 'dbl-clickable',
                itemTemplate: _.template('<div id="<%= id %>" class="list-item" style="overflow: hidden; text-overflow: ellipsis;white-space: pre;"><%= Common.Utils.String.htmlEncode(value) %></div>')
            });
            this.refList.on('entervalue', _.bind(this.onPrimary, this))
                        .on('item:dblclick', _.bind(this.onPrimary, this));

            this.lblWhich = $window.find('#id-dlg-cross-which');

            this.btnInsert = new Common.UI.Button({
                el: $window.find('.primary'),
                disabled: true
            });

            this.afterRender();
        },

        afterRender: function() {
            this._setDefaults();

            var me = this;
            var onApiEndCalculate = function() {
                me.refreshReferences(me.cmbType.getSelectedRecord(), true);
            };
            this.api.asc_registerCallback('asc_onEndCalculate', onApiEndCalculate);
            this.on('close', function(obj){
                me.api.asc_unregisterCallback('asc_onEndCalculate', onApiEndCalculate);
            });
        },

        _handleInput: function(state, fromButton) {
            if (this.options.handler) {
                this.options.handler.call(this, state);
            }
            if (state=='ok') {
                if(!fromButton && document.activeElement && document.activeElement.localName == 'textarea' && /area_id/.test(document.activeElement.id)){
                    return;
                }
                !this.btnInsert.isDisabled() && this.insertReference();
                return;
            }
            this.close();
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value, true);
        },

        onPrimary: function(event) {
            this._handleInput('ok');
            return false;
        },

        getSettings: function() {
            return {type: this.cmbType.getValue(), refType: this.cmbReference.getValue()};
        },

        _setDefaults: function () {
            var rec,
                currentRef;
            if (this.crossRefProps) {
                rec = this.cmbType.store.findWhere({value: this.crossRefProps.type});
                rec && (currentRef = this.crossRefProps.refType);
            }
            rec ? this.cmbType.selectRecord(rec) : this.cmbType.setValue(0);
            this.refreshReferenceTypes(this.cmbType.getSelectedRecord(), currentRef);
        },

        insertReference: function() {
            var record = this.refList.getSelectedRec(),
                typeRec = this.cmbType.getSelectedRecord(),
                type = (typeRec.type==1 || typeRec.value>4) ? 5 : typeRec.value,
                reftype = this.cmbReference.getValue(),
                link = this.chInsertAs.getValue()=='checked',
                below = this.chBelowAbove.getValue()=='checked',
                separator = (this.chSeparator.getValue()=='checked') ? this.inputSeparator.getValue() : undefined;

            switch (type) {
                case 0: // paragraph
                case 1: // heading
                    this.api.asc_AddCrossRefToParagraph(record.get('para'), reftype, link, below, separator);
                    break;
                case 2: // bookmark
                    this.api.asc_AddCrossRefToBookmark(record.get('value'), reftype, link, below, separator);
                    break;
                case 3: // footnote
                case 4: // endnote
                    this.api.asc_AddCrossRefToNote(record.get('para'), reftype, link, below);
                    break;
                case 5: // caption
                    if (reftype==Asc.c_oAscDocumentRefenceToType.OnlyCaptionText && record.get('para').asc_canAddRefToCaptionText(typeRec.displayValue)===false) {
                        Common.UI.warning({
                            msg  : this.textEmpty
                        });
                    } else
                        this.api.asc_AddCrossRefToCaption(typeRec.displayValue, record.get('para'), reftype, link, below);
                    break;
            }
        },

        onTypeSelected: function (combo, record) {
            this.refreshReferenceTypes(record);
        },

        refreshReferenceTypes: function(record, currentRef) {
            var arr = [],
                str = this.textWhich;
            if (record.type==1 || record.value > 4) {
                // custom labels from caption dialog and Equation, Figure, Table
                arr = [
                    { value: Asc.c_oAscDocumentRefenceToType.Text, displayValue: this.textCaption },
                    { value: Asc.c_oAscDocumentRefenceToType.OnlyLabelAndNumber, displayValue: this.textLabelNum },
                    { value: Asc.c_oAscDocumentRefenceToType.OnlyCaptionText, displayValue: this.textOnlyCaption },
                    { value: Asc.c_oAscDocumentRefenceToType.PageNum, displayValue: this.textPageNum },
                    { value: Asc.c_oAscDocumentRefenceToType.AboveBelow, displayValue: this.textAboveBelow }
                ];
            } else {
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
                        str = this.textWhichPara;
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
                        str = this.textWhichHeading;
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
                        str = this.textWhichBookmark;
                        break;
                    case 3: // note
                        arr = [
                            { value: Asc.c_oAscDocumentRefenceToType.NoteNumber, displayValue: this.textNoteNum },
                            { value: Asc.c_oAscDocumentRefenceToType.PageNum, displayValue: this.textPageNum },
                            { value: Asc.c_oAscDocumentRefenceToType.AboveBelow, displayValue: this.textAboveBelow },
                            { value: Asc.c_oAscDocumentRefenceToType.NoteNumberFormatted, displayValue: this.textNoteNumForm }
                        ];
                        str = this.textWhichNote;
                        break;
                    case 4: // end note
                        arr = [
                            { value: Asc.c_oAscDocumentRefenceToType.NoteNumber, displayValue: this.textEndNoteNum },
                            { value: Asc.c_oAscDocumentRefenceToType.PageNum, displayValue: this.textPageNum },
                            { value: Asc.c_oAscDocumentRefenceToType.AboveBelow, displayValue: this.textAboveBelow },
                            { value: Asc.c_oAscDocumentRefenceToType.NoteNumberFormatted, displayValue: this.textEndNoteNumForm }
                        ];
                        str = this.textWhichEndnote;
                        break;
                }
            }
            this.cmbReference.setData(arr);

            var rec = this.cmbReference.store.findWhere({value: currentRef});
            this.cmbReference.setValue(rec ? currentRef : arr[0].value);
            this.onReferenceSelected(this.cmbReference, this.cmbReference.getSelectedRecord());
            this.lblWhich.text(str);
            this.refreshReferences(record);
        },

        refreshReferences: function(record, reselect) {
            if (!record) return;

            var store = this.refList.store,
                type = (record.type==1 || record.value > 4) ? 5 : record.value,
                arr = [],
                props,
                oldlength = store.length,
                oldidx = _.indexOf(store.models, this.refList.getSelectedRec());

            switch (type) {
                case 0: // paragraph
                    props = this.api.asc_GetAllNumberedParagraphs();
                    break;
                case 1: // heading
                    props = this.api.asc_GetAllHeadingParagraphs();
                    break;
                case 2: // bookmark
                    props = this.api.asc_GetBookmarksManager();
                    break;
                case 3: // footnote
                    props = this.api.asc_GetAllFootNoteParagraphs();
                    break;
                case 4: // endnote
                    props = this.api.asc_GetAllEndNoteParagraphs();
                    break;
                case 5: // caption
                    props = this.api.asc_GetAllCaptionParagraphs(this.cmbType.getSelectedRecord().displayValue);
                    break;
            }
            if (type==2) { // bookmark
                var count = props.asc_GetCount();
                for (var i=0; i<count; i++) {
                    var name = props.asc_GetName(i);
                    if (!props.asc_IsInternalUseBookmark(name) && !props.asc_IsHiddenBookmark(name)) {
                        arr.push({value: name});
                    }
                }
            } else if (props) {
                for (var i=0; i<props.length; i++) {
                    arr.push({value: props[i].asc_getText(), para: props[i]});
                }
            }

            store.reset(arr);
            if (store.length>0) {
                var rec = (reselect && store.length == oldlength && oldidx>=0 && oldidx<store.length) ? store.at(oldidx) : store.at(0);
                this.refList.selectRecord(rec);
                this.refList.scrollToRecord(rec);
            }
            this.btnInsert.setDisabled(arr.length<1 || this._locked);
        },

        onReferenceSelected: function(combo, record) {
            if (!record) return;
            
            var refType = record.value,
                typeRec = this.cmbType.getSelectedRecord(),
                type = (typeRec.type==1 || typeRec.value>4) ? 5 : typeRec.value;
            var disable = (type==5 && refType!==Asc.c_oAscDocumentRefenceToType.PageNum) || (type<5) && (refType==Asc.c_oAscDocumentRefenceToType.Text || refType==Asc.c_oAscDocumentRefenceToType.AboveBelow);
            this.chBelowAbove.setDisabled(disable);
            disable = !(type==0 || type==2) || (refType!==Asc.c_oAscDocumentRefenceToType.ParaNumFullContex);
            this.chSeparator.setDisabled(disable);
            this.inputSeparator.setDisabled(disable || this.chSeparator.getValue()!=='checked');
        },

        setLocked: function(locked){
            this._locked = locked;
            this.btnInsert.setDisabled(this.refList.store.length<1 || this._locked);
        },

        txtTitle: 'Cross-reference',
        txtType: 'Reference type',
        txtReference: 'Insert reference to',
        textInsertAs: 'Insert as hyperlink',
        textSeparate: 'Separate numbers with',
        textIncludeAbove: 'Include above/below',
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
        textParagraph: 'Numbered item',
        textHeading: 'Heading',
        textBookmark: 'Bookmark',
        textFootnote: 'Footnote',
        textEndnote: 'Endnote',
        textEquation: 'Equation',
        textFigure: 'Figure',
        textTable: 'Table',
        textInsert: 'Insert',
        textWhich: 'For which caption',
        textWhichHeading: 'For which heading',
        textWhichBookmark: 'For which bookmark',
        textWhichNote: 'For which footnote',
        textWhichEndnote: 'For which endnote',
        textWhichPara: 'For which numbered item',
        textEmpty: 'The request reference is empty.'

    }, DE.Views.CrossReferenceDialog || {}))
});