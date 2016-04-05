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
                        { caption: this.selectRowText,      value:  c_oAscChangeSelectionFormatTable.row},
                        { caption: this.selectColumnText,   value: c_oAscChangeSelectionFormatTable.column},
                        { caption: this.selectDataText,     value: c_oAscChangeSelectionFormatTable.data},
                        { caption: this.selectTableText,    value: c_oAscChangeSelectionFormatTable.all}
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
                            value   : c_oAscInsertOptions.InsertCellsAndShiftRight
                        },{
                            caption : me.txtShiftDown,
                            value   : c_oAscInsertOptions.InsertCellsAndShiftDown
                        },{
                            caption : me.txtRow,
                            value   : c_oAscInsertOptions.InsertRows
                        },{
                            caption : me.txtColumn,
                            value   : c_oAscInsertOptions.InsertColumns
                        }
                    ]
                })
            });
            
            me.pmiInsertTable = new Common.UI.MenuItem({
                caption     : me.txtInsert,
                menu        : new Common.UI.Menu({
                    menuAlign   : 'tl-tr',
                    items: [
                        { caption: me.insertRowAboveText, value: c_oAscInsertOptions.InsertTableRowAbove},
                        { caption: me.insertRowBelowText, value: c_oAscInsertOptions.InsertTableRowBelow},
                        { caption: me.insertColumnLeftText,  value: c_oAscInsertOptions.InsertTableColLeft},
                        { caption: me.insertColumnRightText, value: c_oAscInsertOptions.InsertTableColRight}
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
                            value   : c_oAscDeleteOptions.DeleteCellsAndShiftLeft
                        },{
                            caption : me.txtShiftUp,
                            value   : c_oAscDeleteOptions.DeleteCellsAndShiftTop
                        },{
                            caption : me.txtRow,
                            value   : c_oAscDeleteOptions.DeleteRows
                        },{
                            caption : me.txtColumn,
                            value   : c_oAscDeleteOptions.DeleteColumns
                        }
                    ]
                })
            });

            me.pmiDeleteTable = new Common.UI.MenuItem({
                caption     : me.txtDelete,
                menu        : new Common.UI.Menu({
                    menuAlign   : 'tl-tr',
                    items: [
                        { caption: this.deleteRowText,      value: c_oAscDeleteOptions.DeleteRows},
                        { caption: this.deleteColumnText,   value: c_oAscDeleteOptions.DeleteColumns},
                        { caption: this.deleteTableText,    value: c_oAscDeleteOptions.DeleteTable}
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
                            value   : c_oAscCleanOptions.All
                        },
                        {
                            caption : me.txtClearText,
                            value   : c_oAscCleanOptions.Text
                        },
                        {
                            caption : me.txtClearFormat,
                            value   : c_oAscCleanOptions.Format
                        },
                        {
                            caption : me.txtClearComments,
                            value   : c_oAscCleanOptions.Comments
                        },
                        {
                            caption : me.txtClearHyper,
                            value   : c_oAscCleanOptions.Hyperlinks
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
                            value   : 'ascending'
                        },{
                            caption : me.txtDescending,
                            value   : 'descending'
                        }
                    ]
                })
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
                action: 'row-height'
            });

            me.pmiColumnWidth = new Common.UI.MenuItem({
                caption     : me.txtColumnWidth,
                action: 'column-width'
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
                    me.pmiSortCells,
                    {caption: '--'},
                    me.pmiAddComment,
                    me.pmiCellMenuSeparator,
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
                        value   : c_oAscDrawingLayerType.BringToFront
                    },{
                        caption : this.textArrangeBack,
                        iconCls : 'mnu-arrange-back',
                        type    : 'arrange',
                        value   : c_oAscDrawingLayerType.SendToBack
                    },{
                        caption : this.textArrangeForward,
                        iconCls : 'mnu-arrange-forward',
                        type    : 'arrange',
                        value   : c_oAscDrawingLayerType.BringForward
                    },{
                        caption: this.textArrangeBackward,
                        iconCls : 'mnu-arrange-backward',
                        type    : 'arrange',
                        value   : c_oAscDrawingLayerType.SendBackward
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
                            value       : c_oAscVerticalTextAlign.TEXT_ALIGN_TOP
                        }),
                        me.menuParagraphCenter = new Common.UI.MenuItem({
                            caption     : me.centerCellText,
                            checkable   : true,
                            toggleGroup : 'popupparagraphvalign',
                            value       : c_oAscVerticalTextAlign.TEXT_ALIGN_CTR
                        }),
                        this.menuParagraphBottom = new Common.UI.MenuItem({
                            caption     : me.bottomCellText,
                            checkable   : true,
                            toggleGroup : 'popupparagraphvalign',
                            value       : c_oAscVerticalTextAlign.TEXT_ALIGN_BOTTOM
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
                            direction      : c_oAscVertDrawingText.normal
                        }),
                        me.menuParagraphDirect90 = new Common.UI.MenuItem({
                            caption     : me.direct90Text,
                            iconCls     : 'mnu-direct-rdown',
                            checkable   : true,
                            checked     : false,
                            toggleGroup : 'popupparagraphdirect',
                            direction      : c_oAscVertDrawingText.vert
                        }),
                        me.menuParagraphDirect270 = new Common.UI.MenuItem({
                            caption     : me.direct270Text,
                            iconCls     : 'mnu-direct-rup',
                            checkable   : true,
                            checked     : false,
                            toggleGroup : 'popupparagraphdirect',
                            direction      : c_oAscVertDrawingText.vert270
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
                this.scroller = new Common.UI.Scroller({
                    el: $(this.el).find('.dropdown-menu '),
                    useKeyboard: this.enableKeyEvents && !this.handleSelect,
                    minScrollbarLength  : 40,
                    alwaysVisibleY: true
                });
            });

            me.fireEvent('createdelayedelements', [me]);
        },

        setMenuItemCommentCaptionMode: function (edit) {
            edit ? this.pmiAddComment.setCaption(this.txtEditComment, true) :
                this.pmiAddComment.setCaption(this.txtAddComment, true);
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
        txtColumnWidth:         'Column Width',
        txtRowHeight:           'Row Height',
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
        deleteTableText         : 'Delete Table'

    }, SSE.Views.DocumentHolder || {}));
});