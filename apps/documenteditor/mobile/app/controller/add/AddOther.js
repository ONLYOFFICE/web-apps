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
 *  AddOther.js
 *  Document Editor
 *
 *  Created by Alexander Yuzhin on 10/17/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'documenteditor/mobile/app/view/add/AddOther',
    'jquery',
    'underscore',
    'backbone'
], function (core, view, $, _, Backbone) {
    'use strict';

    DE.Controllers.AddOther = Backbone.Controller.extend(_.extend((function() {
        var c_pageNumPosition = {
            PAGE_NUM_POSITION_TOP: 0x01,
            PAGE_NUM_POSITION_BOTTOM: 0x02,
            PAGE_NUM_POSITION_RIGHT: 0,
            PAGE_NUM_POSITION_LEFT: 1,
            PAGE_NUM_POSITION_CENTER: 2
        };

        return {
            models: [],
            collections: [],
            views: [
                'AddOther'
            ],

            initialize: function () {
                Common.NotificationCenter.on('addcontainer:show', _.bind(this.initEvents, this));

                this.addListeners({
                    'AddOther': {
                        'page:show' : this.onPageShow
                    }
                });
                this.toCustomFormat;
                this.fromCustomFormat;
            },

            setApi: function (api) {
                var me = this;
                me.api = api;
            },

            setMode: function (mode) {
                this.view = this.getView('AddOther');
                this.view.canViewComments = mode.canViewComments;
            },

            onLaunch: function () {
                this.createView('AddOther').render();
            },

            initEvents: function () {
                this.setDisableMenuItem();
            },

            setDisableMenuItem: function() {
                var isDisableComment = true,
                    isDisableBreak = false,
                    isDisableFootnote = false;
                var stack = this.api.getSelectedElements();
                var isText = false,
                    isTable = false,
                    isImage = false,
                    isChart = false,
                    isShape = false,
                    isLink = false,
                    lockedText = false,
                    lockedTable = false,
                    lockedImage = false,
                    lockedHeader = false;
                _.each(stack, function (item) {
                    var objectType = item.get_ObjectType(),
                        objectValue = item.get_ObjectValue();
                    if (objectType == Asc.c_oAscTypeSelectElement.Header) {
                        lockedHeader = objectValue.get_Locked();
                    }
                    if (objectType == Asc.c_oAscTypeSelectElement.Paragraph) {
                        isText = true;
                        lockedText = objectValue.get_Locked();
                    } else if (objectType == Asc.c_oAscTypeSelectElement.Image) {
                        lockedImage = objectValue.get_Locked();
                        if (objectValue && objectValue.get_ChartProperties()) {
                            isChart = true;
                        } else if (objectType && objectValue.get_ShapeProperties()) {
                            isShape = true;
                        } else {
                            isImage = true;
                        }
                    } else if (objectType == Asc.c_oAscTypeSelectElement.Table) {
                        isTable = true;
                        lockedTable = objectValue.get_Locked();
                    } else if (objectType == Asc.c_oAscTypeSelectElement.Hyperlink) {
                        isLink = true;
                    }
                });
                if (stack.length > 0) {
                    var isObject = isShape || isChart || isImage || isTable;
                    isDisableComment = (this.api.can_AddQuotedComment() === false || lockedText || lockedTable || lockedImage || lockedHeader || (!isText && isObject));
                    if (isShape && isText) {
                        isDisableBreak = isDisableFootnote = true;
                    }
                }
                this.view.isDisableComment = isDisableComment;
                this.view.isDisableBreak = isDisableBreak;
                this.view.isDisableFootnote = isDisableFootnote;
            },

            onPageShow: function (view, pageId) {
                var me = this;

                $('.page[data-page=addother-sectionbreak] li a').single('click',    _.buffered(me.onInsertSectionBreak, 100, me));
                $('.page[data-page=addother-pagenumber] li a').single('click',      _.buffered(me.onInsertPageNumber, 100, me));
                $('#add-link-insert').single('click',                               _.buffered(me.onInsertLink, 100, me));


                if (pageId == '#addother-link') {
                    if ($('#addother-link-view')) {
                        _.defer(function () {
                            var text = me.api.can_AddHyperlink();
                            $('#add-link-display input').val(_.isString(text) ? text : '');
                        });
                    }
                } else if (pageId == '#addother-insert-footnote') {
                    me.initInsertFootnote();
                } else if (pageId === "#addother-insert-comment") {
                    me.initInsertComment(false);
                } else if (pageId === "#addother-insert-break") {
                    $('#add-other-pagebreak').single('click',   _.bind(me.onPageBreak, me));
                    $('#add-other-columnbreak').single('click', _.bind(me.onColumnBreak, me));
                }
            },

            // Handlers
            initInsertComment: function (documentFlag) {
                var comment = DE.getController('Common.Controllers.Collaboration').getCommentInfo();
                if (comment) {
                    this.getView('AddOther').renderComment(comment);
                    $('#done-comment').single('click', _.bind(this.onDoneComment, this, documentFlag));
                    $('.back-from-add-comment').single('click', _.bind(function () {
                        if ($('#comment-text').val().length > 0) {
                            uiApp.modal({
                                title: '',
                                text: this.textDeleteDraft,
                                buttons: [
                                    {
                                        text: this.textCancel
                                    },
                                    {
                                        text: this.textDelete,
                                        bold: true,
                                        onClick: function () {
                                            DE.getController('AddContainer').rootView.router.back();
                                        }
                                    }]
                            })
                        } else {
                            DE.getController('AddContainer').rootView.router.back();
                        }
                    }, this));
                }
            },

            onDoneComment: function(documentFlag) {
                var value = $('#comment-text').val().trim();
                if (value.length > 0) {
                    DE.getController('Common.Controllers.Collaboration').onAddNewComment(value, documentFlag);
                    DE.getController('AddContainer').hideModal();
                }
            },

            initInsertFootnote: function () {
                var me = this,
                    dataFormatFootnote = [
                        { text: '1, 2, 3,...', value: Asc.c_oAscNumberingFormat.Decimal },
                        { text: 'a, b, c,...', value: Asc.c_oAscNumberingFormat.LowerLetter },
                        { text: 'A, B, C,...', value: Asc.c_oAscNumberingFormat.UpperLetter },
                        { text: 'i, ii, iii,...', value: Asc.c_oAscNumberingFormat.LowerRoman },
                        { text: 'I, II, III,...', value: Asc.c_oAscNumberingFormat.UpperRoman }
                    ],
                    dataPosFootnote = [
                        {value: Asc.c_oAscFootnotePos.PageBottom, displayValue: this.textBottomOfPage },
                        {value: Asc.c_oAscFootnotePos.BeneathText, displayValue: this.textBelowText }
                    ],
                    props = me.api.asc_GetFootnoteProps(),
                    propsFormat = props.get_NumFormat(),
                    propsPos = props.get_Pos();

                me.onFormatFootnoteChange(propsFormat);

                var view = me.getView('AddOther');
                view.renderNumFormat(dataFormatFootnote, propsFormat);
                view.renderFootnotePos(dataPosFootnote, propsPos);

                $('#start-at-footnote .button').single('click', _.bind(me.onStartAt, me));
                $('.page[data-page=addother-insert-footnote] input:radio[name=doc-footnote-format]').single('change', _.bind(me.onFormatFootnoteChange, me));
                $('#footnote-insert').single('click', _.bind(this.onClickInsertFootnote, this));
            },

            onClickInsertFootnote: function() {
                DE.getController('AddContainer').hideModal();
            },

            onFormatFootnoteChange: function(e) {
                var me = this;
                var value = e.currentTarget ? $(e.currentTarget).data('value') : e;
                var startAt = $('#start-at-footnote .item-after label'),
                    currValue;
                    if(e.currentTarget) {
                        currValue = me.fromCustomFormat(startAt.text());
                    } else {
                        currValue = me.api.asc_GetFootnoteProps().get_NumStart();
                    }
                switch (value) {
                    case Asc.c_oAscNumberingFormat.UpperRoman: // I, II, III, ...
                        me.toCustomFormat = me._10toRome;
                        me.fromCustomFormat = me._Rometo10;
                        break;
                    case Asc.c_oAscNumberingFormat.LowerRoman: // i, ii, iii, ...
                        me.toCustomFormat = function(value) { return me._10toRome(value).toLocaleLowerCase(); };
                        me.fromCustomFormat = function(value) { return me._Rometo10(value.toLocaleUpperCase()); };
                        break;
                    case Asc.c_oAscNumberingFormat.UpperLetter: // A, B, C, ...
                        me.toCustomFormat = me._10toS;
                        me.fromCustomFormat = me._Sto10;
                        break;
                    case Asc.c_oAscNumberingFormat.LowerLetter: // a, b, c, ...
                        me.toCustomFormat = function(value) { return me._10toS(value).toLocaleLowerCase(); };
                        me.fromCustomFormat = function(value) { return me._Sto10(value.toLocaleUpperCase()); };
                        break;
                    default: // 1, 2, 3, ...
                        me.toCustomFormat = function(value) { return value; };
                        me.fromCustomFormat = function(value) { return value; };
                        break;
                }
                    var newValue = me.toCustomFormat(currValue);
                        startAt.text(newValue);
            },

            onStartAt: function(e) {
                var $button = $(e.currentTarget),
                    value = $('#start-at-footnote .item-after label').text(),
                    intValue,
                    step = 1,
                    maxValue = 16383,
                    me = this;
                if(me.fromCustomFormat) {
                    intValue = parseInt(me.fromCustomFormat(value));
                } else {
                    intValue = me.api.asc_GetFootnoteProps().get_NumStart();
                }
                if ($button.hasClass('decrement')) {
                    intValue = Math.max(1, intValue - step);
                } else {
                    intValue = Math.min(maxValue, intValue + step);
                }
                var newValue = me.toCustomFormat(intValue);
                $('#start-at-footnote .item-after label').text(newValue);
            },

            onInsertLink: function (e) {
                DE.getController('AddContainer').hideModal();
            },

            onPageBreak: function (e) {
                this.api && this.api.put_AddPageBreak();
                DE.getController('AddContainer').hideModal();
            },

            onColumnBreak: function () {
                this.api && this.api.put_AddColumnBreak();
                DE.getController('AddContainer').hideModal();
            },

            onInsertSectionBreak: function (e) {
                var $target = $(e.currentTarget);

                if ($target && this.api) {
                    var type = $target.data('type'),
                        value;

                    if ('next' == type) {
                        value = Asc.c_oAscSectionBreakType.NextPage;
                    } else if ('continuous' == type) {
                        value = Asc.c_oAscSectionBreakType.Continuous;
                    } else if ('even' == type) {
                        value = Asc.c_oAscSectionBreakType.EvenPage;
                    } else if ('odd' == type) {
                        value = Asc.c_oAscSectionBreakType.OddPage;
                    }

                    this.api.add_SectionBreak(value);
                }

                DE.getController('AddContainer').hideModal();
            },

            onInsertPageNumber: function (e) {
                var $target = $(e.currentTarget);

                if ($target && this.api) {
                    var value = -1,
                        type = $target.data('type');

                    if (2 == type.length) {
                        value = {};

                        if (type[0] == 'l') {
                            value.subtype = c_pageNumPosition.PAGE_NUM_POSITION_LEFT;
                        } else if (type[0] == 'c') {
                            value.subtype = c_pageNumPosition.PAGE_NUM_POSITION_CENTER;
                        } else if (type[0] == 'r') {
                            value.subtype = c_pageNumPosition.PAGE_NUM_POSITION_RIGHT;
                        }

                        if (type[1] == 't') {
                            value.type = c_pageNumPosition.PAGE_NUM_POSITION_TOP;
                        } else if (type[1] == 'b') {
                            value.type = c_pageNumPosition.PAGE_NUM_POSITION_BOTTOM;
                        }

                        this.api.put_PageNum(value.type, value.subtype);
                    } else {
                        this.api.put_PageNum(value);
                    }
                }

                DE.getController('AddContainer').hideModal();
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
                    prev = Math.abs(val);
                }

                return result;
            },

            txtNotUrl: 'This field should be a URL in the format \"http://www.example.com\"',
            textBottomOfPage: 'Bottom Of Page',
            textBelowText: 'Below Text',
            textDeleteDraft: 'Do you really want to delete draft?',
            textCancel: 'Cancel',
            //textContinue: 'Continue',
            textDelete: 'Delete',
            notcriticalErrorTitle: 'Warning'
        }
    })(), DE.Controllers.AddOther || {}))
});