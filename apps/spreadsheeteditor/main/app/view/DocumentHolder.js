/*
 *
 * (c) Copyright Ascensio System Limited 2010-2017
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
 *  DocumentHolder.js
 *
 *  DocumentHolder view
 *
 *  Created by Julia Radzhabova on 3/28/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'jquery',
    'underscore',
    'backbone',
    'gateway',
    'common/main/lib/component/Menu'
//    'spreadsheeteditor/main/app/view/HyperlinkSettingsDialog',
//    'spreadsheeteditor/main/app/view/ParagraphSettingsAdvanced',
//    'spreadsheeteditor/main/app/view/TableSettingsAdvanced'
], function ($, _, Backbone, gateway) { 'use strict';

    SSE.Views.DocumentHolder =  Backbone.View.extend(_.extend({
        el: '#editor_sdk',

        // Compile our stats template
        template: null,

        // Delegated events for creating new items, and clearing completed ones.
        events: {
        },

        initialize: function() {
            var me = this;

            this.setApi = function(api) {
                me.api = api;
                return me;
            };
        },

        render: function() {
            this.fireEvent('render:before', this);

            this.cmpEl = $(this.el);

            this.fireEvent('render:after', this);
            return this;
        },

        focus: function() {
            var me = this;
            _.defer(function(){
                me.cmpEl.focus();
            }, 50);
        },

        createDelayedElements: function() {
            var me = this;

            me.pmiCut = new Common.UI.MenuItem({
                caption     : me.txtCut,
                value       : 'cut'
            });

            me.pmiCopy = new Common.UI.MenuItem({
                caption     : me.txtCopy,
                value       : 'copy'
            });

            me.pmiPaste = new Common.UI.MenuItem({
                caption     : me.txtPaste,
                value       : 'paste'
            });

            me.pmiSelectTable = new Common.UI.MenuItem({
                caption     : me.txtSelect,
                menu        : new Common.UI.Menu({
                    menuAlign   : 'tl-tr',
                    items: [
                        { caption: this.selectRowText,      value:  Asc.c_oAscChangeSelectionFormatTable.row},
                        { caption: this.selectColumnText,   value: Asc.c_oAscChangeSelectionFormatTable.column},
                        { caption: this.selectDataText,     value: Asc.c_oAscChangeSelectionFormatTable.data},
                        { caption: this.selectTableText,    value: Asc.c_oAscChangeSelectionFormatTable.all}
                    ]
                })
            });

            me.pmiInsertEntire = new Common.UI.MenuItem({
                caption     : me.txtInsert
            });

            me.pmiInsertCells = new Common.UI.MenuItem({
                caption     : me.txtInsert,
                menu        : new Common.UI.Menu({
                    menuAlign   : 'tl-tr',
                    items: [
                        {
                            caption : me.txtShiftRight,
                            value   : Asc.c_oAscInsertOptions.InsertCellsAndShiftRight
                        },{
                            caption : me.txtShiftDown,
                            value   : Asc.c_oAscInsertOptions.InsertCellsAndShiftDown
                        },{
                            caption : me.txtRow,
                            value   : Asc.c_oAscInsertOptions.InsertRows
                        },{
                            caption : me.txtColumn,
                            value   : Asc.c_oAscInsertOptions.InsertColumns
                        }
                    ]
                })
            });
            
            me.pmiInsertTable = new Common.UI.MenuItem({
                caption     : me.txtInsert,
                menu        : new Common.UI.Menu({
                    menuAlign   : 'tl-tr',
                    items: [
                        { caption: me.insertRowAboveText, value: Asc.c_oAscInsertOptions.InsertTableRowAbove},
                        { caption: me.insertRowBelowText, value: Asc.c_oAscInsertOptions.InsertTableRowBelow},
                        { caption: me.insertColumnLeftText,  value: Asc.c_oAscInsertOptions.InsertTableColLeft},
                        { caption: me.insertColumnRightText, value: Asc.c_oAscInsertOptions.InsertTableColRight}
                    ]
                })
            });

            me.pmiDeleteEntire = new Common.UI.MenuItem({
                caption     : me.txtDelete
            });

            me.pmiDeleteCells = new Common.UI.MenuItem({
                caption     : me.txtDelete,
                menu        : new Common.UI.Menu({
                    menuAlign   : 'tl-tr',
                    items: [
                        {
                            caption : me.txtShiftLeft,
                            value   : Asc.c_oAscDeleteOptions.DeleteCellsAndShiftLeft
                        },{
                            caption : me.txtShiftUp,
                            value   : Asc.c_oAscDeleteOptions.DeleteCellsAndShiftTop
                        },{
                            caption : me.txtRow,
                            value   : Asc.c_oAscDeleteOptions.DeleteRows
                        },{
                            caption : me.txtColumn,
                            value   : Asc.c_oAscDeleteOptions.DeleteColumns
                        }
                    ]
                })
            });

            me.pmiDeleteTable = new Common.UI.MenuItem({
                caption     : me.txtDelete,
                menu        : new Common.UI.Menu({
                    menuAlign   : 'tl-tr',
                    items: [
                        { caption: this.deleteRowText,      value: Asc.c_oAscDeleteOptions.DeleteRows},
                        { caption: this.deleteColumnText,   value: Asc.c_oAscDeleteOptions.DeleteColumns},
                        { caption: this.deleteTableText,    value: Asc.c_oAscDeleteOptions.DeleteTable}
                    ]
                })
            });

            me.pmiClear = new Common.UI.MenuItem({
                caption     : me.txtClear,
                menu        : new Common.UI.Menu({
                    menuAlign   : 'tl-tr',
                    items: [
                        {
                            caption : me.txtClearAll,
                            value   : Asc.c_oAscCleanOptions.All
                        },
                        {
                            caption : me.txtClearText,
                            value   : Asc.c_oAscCleanOptions.Text
                        },
                        {
                            caption : me.txtClearFormat,
                            value   : Asc.c_oAscCleanOptions.Format
                        },
                        {
                            caption : me.txtClearComments,
                            value   : Asc.c_oAscCleanOptions.Comments
                        },
                        {
                            caption : me.txtClearHyper,
                            value   : Asc.c_oAscCleanOptions.Hyperlinks
                        }
                    ]
                })
            });

            me.pmiSortCells = new Common.UI.MenuItem({
                caption     : me.txtSort,
                menu        : new Common.UI.Menu({
                    menuAlign   : 'tl-tr',
                    items: [
                        {
                            caption : me.txtAscending,
                            value   : Asc.c_oAscSortOptions.Ascending
                        },{
                            caption : me.txtDescending,
                            value   : Asc.c_oAscSortOptions.Descending
                        },{
                            caption : me.txtSortCellColor,
                            value   : Asc.c_oAscSortOptions.ByColorFill
                        },{
                            caption : me.txtSortFontColor,
                            value   : Asc.c_oAscSortOptions.ByColorFont
                        }
                    ]
                })
            });

            me.pmiFilterCells = new Common.UI.MenuItem({
                caption     : me.txtFilter,
                menu        : new Common.UI.Menu({
                    menuAlign   : 'tl-tr',
                    items: [
                        {
                            caption : me.txtFilterValue,
                            value   : 0
                        },{
                            caption : me.txtFilterCellColor,
                            value   : 1
                        },{
                            caption : me.txtFilterFontColor,
                            value   : 2
                        }
                    ]
                })
            });
            
            me.pmiReapply = new Common.UI.MenuItem({
                caption     : me.txtReapply
            });

            me.pmiInsFunction = new Common.UI.MenuItem({
                caption     : me.txtFormula
            });

            me.menuAddHyperlink = new Common.UI.MenuItem({
                caption     : me.txtInsHyperlink,
                inCell      : true
            });

            me.menuEditHyperlink = new Common.UI.MenuItem({
                caption     : me.editHyperlinkText,
                inCell      : true
            });

            me.menuRemoveHyperlink = new Common.UI.MenuItem({
                caption     : me.removeHyperlinkText
            });

            me.menuHyperlink = new Common.UI.MenuItem({
                caption     : me.txtInsHyperlink,
                menu        : new Common.UI.Menu({
                    menuAlign: 'tl-tr',
                    items   : [
                        me.menuEditHyperlink,
                        me.menuRemoveHyperlink
                    ]
                })
            });

            me.pmiRowHeight = new Common.UI.MenuItem({
                caption     : me.txtRowHeight,
                menu        : new Common.UI.Menu({
                    menuAlign: 'tl-tr',
                    items   : [
                        { caption: me.txtAutoRowHeight, value: 'auto-row-height' },
                        { caption: me.txtCustomRowHeight, value: 'row-height' }
                    ]
                })
            });

            me.pmiColumnWidth = new Common.UI.MenuItem({
                caption     : me.txtColumnWidth,
                menu        : new Common.UI.Menu({
                    menuAlign: 'tl-tr',
                    items   : [
                        { caption: me.txtAutoColumnWidth, value: 'auto-column-width' },
                        { caption: me.txtCustomColumnWidth, value: 'column-width' }
                    ]
                })
            });

            me.pmiEntireHide = new Common.UI.MenuItem({
                caption     : me.txtHide
            });

            me.pmiEntireShow = new Common.UI.MenuItem({
                caption     : me.txtShow
            });

            me.pmiAddComment = new Common.UI.MenuItem({
                id          : 'id-context-menu-item-add-comment',
                caption     : me.txtAddComment
            });

            me.pmiCellMenuSeparator =  new Common.UI.MenuItem({
                caption     : '--'
            });

            me.pmiAddNamedRange = new Common.UI.MenuItem({
                id          : 'id-context-menu-item-add-named-range',
                caption     : me.txtAddNamedRange
            });

            me.pmiFreezePanes = new Common.UI.MenuItem({
                caption     : me.textFreezePanes
            });

            me.pmiEntriesList = new Common.UI.MenuItem({
                caption     : me.textEntriesList
            });

            me.pmiSparklines = new Common.UI.MenuItem({
                caption     : me.txtSparklines,
                menu        : new Common.UI.Menu({
                    menuAlign: 'tl-tr',
                    items   : [
                        { caption: me.txtClearSparklines, value: Asc.c_oAscCleanOptions.Sparklines },
                        { caption: me.txtClearSparklineGroups, value: Asc.c_oAscCleanOptions.SparklineGroups }
                    ]
                })
            });

            me.ssMenu = new Common.UI.Menu({
                id          : 'id-context-menu-cell',
                items       : [
                    me.pmiCut,
                    me.pmiCopy,
                    me.pmiPaste,
                    {caption: '--'},
                    me.pmiSelectTable,
                    me.pmiInsertEntire,
                    me.pmiInsertCells,
                    me.pmiInsertTable,
                    me.pmiDeleteEntire,
                    me.pmiDeleteCells,
                    me.pmiDeleteTable,
                    me.pmiClear,
                    {caption: '--'},
                    me.pmiSparklines,
                    me.pmiSortCells,
                    me.pmiFilterCells,
                    me.pmiReapply,
                    {caption: '--'},
                    me.pmiAddComment,
                    me.pmiCellMenuSeparator,
                    me.pmiEntriesList,
                    me.pmiAddNamedRange,
                    me.pmiInsFunction,
                    me.menuAddHyperlink,
                    me.menuHyperlink,
                    me.pmiRowHeight,
                    me.pmiColumnWidth,
                    me.pmiEntireHide,
                    me.pmiEntireShow,
                    me.pmiFreezePanes
                ]
            });

            me.mnuGroupImg = new Common.UI.MenuItem({
                caption     : this.txtGroup,
                iconCls     : 'mnu-group',
                type        : 'group',
                value       : 'grouping'
            });

            me.mnuUnGroupImg = new Common.UI.MenuItem({
                caption     : this.txtUngroup,
                iconCls     : 'mnu-ungroup',
                type        : 'group',
                value       : 'ungrouping'
            });

            me.mnuShapeSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            me.mnuShapeAdvanced = new Common.UI.MenuItem({
                caption : me.advancedShapeText
            });

            me.mnuChartEdit = new Common.UI.MenuItem({
                caption : me.chartText
            });

            me.pmiImgCut = new Common.UI.MenuItem({
                caption     : me.txtCut,
                value       : 'cut'
            });

            me.pmiImgCopy = new Common.UI.MenuItem({
                caption     : me.txtCopy,
                value       : 'copy'
            });

            me.pmiImgPaste = new Common.UI.MenuItem({
                caption     : me.txtPaste,
                value       : 'paste'
            });

            this.imgMenu = new Common.UI.Menu({
                items: [
                    me.pmiImgCut,
                    me.pmiImgCopy,
                    me.pmiImgPaste,
                    {caption: '--'},
                    {
                        caption : this.textArrangeFront,
                        iconCls : 'mnu-arrange-front',
                        type    : 'arrange',
                        value   : Asc.c_oAscDrawingLayerType.BringToFront
                    },{
                        caption : this.textArrangeBack,
                        iconCls : 'mnu-arrange-back',
                        type    : 'arrange',
                        value   : Asc.c_oAscDrawingLayerType.SendToBack
                    },{
                        caption : this.textArrangeForward,
                        iconCls : 'mnu-arrange-forward',
                        type    : 'arrange',
                        value   : Asc.c_oAscDrawingLayerType.BringForward
                    },{
                        caption: this.textArrangeBackward,
                        iconCls : 'mnu-arrange-backward',
                        type    : 'arrange',
                        value   : Asc.c_oAscDrawingLayerType.SendBackward
                    },
                    {caption: '--'},
                    me.mnuGroupImg,
                    me.mnuUnGroupImg,
                    me.mnuShapeSeparator,
                    me.mnuChartEdit,
                    me.mnuShapeAdvanced
                ]
            });

            this.menuParagraphVAlign = new Common.UI.MenuItem({
                caption     : this.vertAlignText,
                menu        : new Common.UI.Menu({
                    menuAlign   : 'tl-tr',
                    items: [
                        me.menuParagraphTop = new Common.UI.MenuItem({
                            caption     : me.topCellText,
                            checkable   : true,
                            toggleGroup : 'popupparagraphvalign',
                            value       : Asc.c_oAscVAlign.Top
                        }),
                        me.menuParagraphCenter = new Common.UI.MenuItem({
                            caption     : me.centerCellText,
                            checkable   : true,
                            toggleGroup : 'popupparagraphvalign',
                            value       : Asc.c_oAscVAlign.Center
                        }),
                        this.menuParagraphBottom = new Common.UI.MenuItem({
                            caption     : me.bottomCellText,
                            checkable   : true,
                            toggleGroup : 'popupparagraphvalign',
                            value       : Asc.c_oAscVAlign.Bottom
                        })
                    ]
                })
            });

            me.menuParagraphDirection = new Common.UI.MenuItem({
                caption     : me.directionText,
                menu        : new Common.UI.Menu({
                    menuAlign: 'tl-tr',
                    items   : [
                        me.menuParagraphDirectH = new Common.UI.MenuItem({
                            caption     : me.directHText,
                            iconCls     : 'mnu-direct-horiz',
                            checkable   : true,
                            checked     : false,
                            toggleGroup : 'popupparagraphdirect',
                            direction      : Asc.c_oAscVertDrawingText.normal
                        }),
                        me.menuParagraphDirect90 = new Common.UI.MenuItem({
                            caption     : me.direct90Text,
                            iconCls     : 'mnu-direct-rdown',
                            checkable   : true,
                            checked     : false,
                            toggleGroup : 'popupparagraphdirect',
                            direction      : Asc.c_oAscVertDrawingText.vert
                        }),
                        me.menuParagraphDirect270 = new Common.UI.MenuItem({
                            caption     : me.direct270Text,
                            iconCls     : 'mnu-direct-rup',
                            checkable   : true,
                            checked     : false,
                            toggleGroup : 'popupparagraphdirect',
                            direction      : Asc.c_oAscVertDrawingText.vert270
                        })
                    ]
                })
            });

            me.menuAddHyperlinkShape = new Common.UI.MenuItem({
                caption     : me.txtInsHyperlink
            });

            me.menuEditHyperlinkShape = new Common.UI.MenuItem({
                caption     : me.editHyperlinkText
            });

            me.menuRemoveHyperlinkShape = new Common.UI.MenuItem({
                caption     : me.removeHyperlinkText
            });

            me.menuHyperlinkShape = new Common.UI.MenuItem({
                caption     : me.txtInsHyperlink,
                menu        : new Common.UI.Menu({
                    menuAlign: 'tl-tr',
                    items   : [
                        me.menuEditHyperlinkShape,
                        me.menuRemoveHyperlinkShape
                    ]
                })
            });

            this.pmiTextAdvanced = new Common.UI.MenuItem({
                caption     : me.txtTextAdvanced
            });

            me.pmiTextCut = new Common.UI.MenuItem({
                caption     : me.txtCut,
                value       : 'cut'
            });

            me.pmiTextCopy = new Common.UI.MenuItem({
                caption     : me.txtCopy,
                value       : 'copy'
            });

            me.pmiTextPaste = new Common.UI.MenuItem({
                caption     : me.txtPaste,
                value       : 'paste'
            });

            this.textInShapeMenu = new Common.UI.Menu({
                items: [
                    me.pmiTextCut,
                    me.pmiTextCopy,
                    me.pmiTextPaste,
                    {caption: '--'},
                    me.menuParagraphVAlign,
                    me.menuParagraphDirection,
                    me.menuAddHyperlinkShape,
                    me.menuHyperlinkShape,
                    {caption: '--'},
                    me.pmiTextAdvanced
                ]
            });

            this.entriesMenu = new Common.UI.Menu({
                maxHeight: 200,
                cyclic: false,
                items: []
            }).on('render:after', function(mnu) {
                this.scroller = new Common.UI.Scroller({
                    el: $(this.el).find('.dropdown-menu '),
                    useKeyboard: this.enableKeyEvents && !this.handleSelect,
                    minScrollbarLength  : 40,
                    alwaysVisibleY: true
                });
            }).on('show:after', function () {
                this.scroller.update({alwaysVisibleY: true});
            });

            this.funcMenu = new Common.UI.Menu({
                maxHeight: 200,
                cyclic: false,
                items: []
            }).on('render:after', function(mnu) {
                mnu.cmpEl.removeAttr('oo_editor_input').attr('oo_editor_keyboard', true);
                this.scroller = new Common.UI.Scroller({
                    el: $(this.el).find('.dropdown-menu '),
                    useKeyboard: this.enableKeyEvents && !this.handleSelect,
                    minScrollbarLength  : 40,
                    alwaysVisibleY: true
                });
            });

            me.fireEvent('createdelayedelements', [me]);
        },

        setMenuItemCommentCaptionMode: function (add, editable) {
            this.pmiAddComment.setCaption(add ? this.txtAddComment : (editable ? this.txtEditComment : this.txtShowComment), true);
        },

        txtSort:                'Sort',
        txtAscending:           'Ascending',
        txtDescending:          'Descending',
        txtFormula:             'Insert Function',
        txtInsHyperlink:        'Hyperlink',
        txtCut:                 'Cut',
        txtCopy:                'Copy',
        txtPaste:               'Paste',
        txtInsert:              'Insert',
        txtDelete:              'Delete',
        txtClear:               'Clear',
        txtClearAll:            'All',
        txtClearText:           'Text',
        txtClearFormat:         'Format',
        txtClearHyper:          'Hyperlink',
        txtClearComments:       'Comments',
        txtShiftRight:          'Shift cells right',
        txtShiftLeft:           'Shift cells left',
        txtShiftUp:             'Shift cells up',
        txtShiftDown:           'Shift cells down',
        txtRow:                 'Entire Row',
        txtColumn:              'Entire Column',
        txtColumnWidth:         'Set Column Width',
        txtRowHeight:           'Set Row Height',
        txtWidth:               'Width',
        txtHide:                'Hide',
        txtShow:                'Show',
        textArrangeFront:       'Bring To Front',
        textArrangeBack:        'Send To Back',
        textArrangeForward:     'Bring Forward',
        textArrangeBackward:    'Send Backward',
        txtArrange:             'Arrange',
        txtAddComment:          'Add Comment',
        txtEditComment:         'Edit Comment',
        txtUngroup:             'Ungroup',
        txtGroup:               'Group',
        topCellText:            'Align Top',
        centerCellText:         'Align Center',
        bottomCellText:         'Align Bottom',
        vertAlignText:          'Vertical Alignment',
        txtTextAdvanced:        'Text Advanced Settings',
        editHyperlinkText:      'Edit Hyperlink',
        removeHyperlinkText:    'Remove Hyperlink',
        editChartText:          'Edit Data',
        advancedShapeText:      'Shape Advanced Settings',
        chartText:              'Chart Advanced Settings',
        directionText:          'Text Direction',
        directHText:            'Horizontal',
        direct90Text:           'Rotate at 90°',
        direct270Text:          'Rotate at 270°',
        txtAddNamedRange:       'Define Name',
        textFreezePanes:        'Freeze Panes',
        textUnFreezePanes:      'Unfreeze Panes',
        txtSelect:              'Select',
        selectRowText           : 'Select Row',
        selectColumnText        : 'Select Entire Column',
        selectDataText          : 'Select Column Data',
        selectTableText         : 'Select Table',
        insertRowAboveText      : 'Insert Row Above',
        insertRowBelowText      : 'Insert Row Below',
        insertColumnLeftText    : 'Insert Column Left',
        insertColumnRightText   : 'Insert Column Right',
        deleteRowText           : 'Delete Row',
        deleteColumnText        : 'Delete Column',
        deleteTableText         : 'Delete Table',
        txtFilter: 'Filter',
        txtFilterValue: 'Filter by Selected cell\'s value',
        txtFilterCellColor: 'Filter by cell\'s color',
        txtFilterFontColor: 'Filter by font color',
        txtReapply: 'Reapply',
        txtSortCellColor: 'Selected Cell Color on top',
        txtSortFontColor: 'Selected Font Color on top',
        txtAutoColumnWidth: 'Auto Fit Column Width',
        txtAutoRowHeight: 'Auto Fit Row Height',
        txtCustomColumnWidth: 'Custom Column Width',
        txtCustomRowHeight: 'Custom Row Height',
        textEntriesList: 'Select from drop-down list',
        txtSparklines: 'Sparklines',
        txtClearSparklines: 'Clear Selected Sparklines',
        txtClearSparklineGroups: 'Clear Selected Sparkline Groups',
        txtShowComment: 'Show Comment'

    }, SSE.Views.DocumentHolder || {}));
});