/*
 * (c) Copyright Ascensio System SIA 2010-2023
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
 *  DocumentHolder.js
 *
 *  DocumentHolder view
 *
 *  Created by Julia Radzhabova on 3/28/14
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'jquery',
    'underscore',
    'backbone',
    'gateway',
    'common/main/lib/component/Menu'
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
            me._preventCustomClick = null;
            me._hasCustomItems = false;

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

        setMode: function(m) {
            this.mode = m;
            return this;
        },

        focus: function() {
            var me = this;
            _.defer(function(){
                me.cmpEl && me.cmpEl.focus();
            }, 50);
        },

        createDelayedElementsViewer: function() {
            var me = this;

            me.menuViewCopy = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-copy',
                caption: me.txtCopy,
                value: 'copy'
            });

            me.menuViewUndo = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-undo',
                caption: me.textUndo
            });

            me.menuViewCopySeparator = new Common.UI.MenuItem({
                caption: '--'
            });

            me.menuViewAddComment = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-add-comment',
                id: 'id-context-menu-item-view-add-comment',
                caption: me.txtAddComment
            });

            me.pmiViewGetRangeList = new Common.UI.MenuItem({
                caption     : me.txtGetLink
            });

            me.menuSignatureViewSign   = new Common.UI.MenuItem({caption: this.strSign,      value: 0 });
            me.menuSignatureDetails    = new Common.UI.MenuItem({caption: this.strDetails,   value: 1 });
            me.menuSignatureViewSetup  = new Common.UI.MenuItem({caption: this.strSetup,     value: 2 });
            me.menuSignatureRemove     = new Common.UI.MenuItem({caption: this.strDelete,    value: 3 });
            me.menuViewSignSeparator   = new Common.UI.MenuItem({caption: '--' });
            me.menuViewCommentSeparator   = new Common.UI.MenuItem({caption: '--' });

            this.viewModeMenu = new Common.UI.Menu({
                cls: 'shifted-right',
                items: [
                    me.menuViewCopy,
                    me.menuViewUndo,
                    me.menuViewCopySeparator,
                    me.menuSignatureViewSign,
                    me.menuSignatureDetails,
                    me.menuSignatureViewSetup,
                    me.menuSignatureRemove,
                    me.menuViewSignSeparator,
                    me.menuViewAddComment,
                    me.menuViewCommentSeparator,
                    me.pmiViewGetRangeList
                ]
            }).on('hide:after', function(menu, e, isFromInputControl) {
                me.clearCustomItems(menu);
            });

            me.fireEvent('createdelayedelements', [me, 'view']);
        },

        createDelayedElements: function() {
            var me = this;

            me.pmiCut = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-cut',
                caption     : me.txtCut,
                value       : 'cut'
            });

            me.pmiCopy = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-copy',
                caption     : me.txtCopy,
                value       : 'copy'
            });

            me.pmiPaste = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-paste',
                caption     : me.txtPaste,
                value       : 'paste'
            });

            me.pmiSelectTable = new Common.UI.MenuItem({
                caption     : me.txtSelect,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
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
                iconCls: 'menu__icon btn-addcell',
                caption     : me.txtInsert,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
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
                iconCls: 'menu__icon btn-addcell',
                caption     : me.txtInsert,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
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
                iconCls: 'menu__icon btn-delcell',
                caption     : me.txtDelete,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
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
                iconCls: 'menu__icon btn-delcell',
                caption     : me.txtDelete,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign   : 'tl-tr',
                    items: [
                        { caption: this.deleteRowText,      value: Asc.c_oAscDeleteOptions.DeleteRows},
                        { caption: this.deleteColumnText,   value: Asc.c_oAscDeleteOptions.DeleteColumns},
                        { caption: this.deleteTableText,    value: Asc.c_oAscDeleteOptions.DeleteTable}
                    ]
                })
            });

            me.pmiClear = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-clearstyle',
                caption     : me.txtClear,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
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
                    cls: 'shifted-right',
                    menuAlign   : 'tl-tr',
                    items: [
                        {
                            iconCls: 'menu__icon btn-sort-down',
                            caption : me.txtAscending,
                            value   : Asc.c_oAscSortOptions.Ascending
                        },{
                            iconCls: 'menu__icon btn-sort-up',
                            caption : me.txtDescending,
                            value   : Asc.c_oAscSortOptions.Descending
                        },{
                            caption : me.txtSortCellColor,
                            value   : Asc.c_oAscSortOptions.ByColorFill
                        },{
                            caption : me.txtSortFontColor,
                            value   : Asc.c_oAscSortOptions.ByColorFont
                        },{
                            caption : me.txtCustomSort,
                            value   : 'advanced'
                        }
                    ]
                })
            });

            me.pmiFilterCells = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-autofilter',
                caption     : me.txtFilter,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
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

            me.mnuRefreshPivot = new Common.UI.MenuItem({
                caption     : me.txtRefresh
            });

            me.mnuExpandCollapsePivot = new Common.UI.MenuItem({
                caption     : this.txtExpandCollapse,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign   : 'tl-tr',
                    items: [
                        {
                            caption : this.txtExpand,
                            value   : {
                                visible: true,
                                isAll: false
                            }
                        },{
                            caption : this.txtCollapse,
                            value   : {
                                visible: false,
                                isAll: false
                            }
                        },{
                            caption : this.txtExpandEntire,
                            value   : {
                                visible: true,
                                isAll: true
                            }
                        },{
                            caption : this.txtCollapseEntire,
                            value   : {
                                visible: false,
                                isAll: true
                            }
                        }
                    ]
                })
            });

            me.mnuGroupPivot = new Common.UI.MenuItem({
                caption     : this.txtGroup,
                value       : 'grouping'
            });

            me.mnuUnGroupPivot = new Common.UI.MenuItem({
                caption     : this.txtUngroup,
                value       : 'ungrouping'
            });

            me.mnuPivotSettings = new Common.UI.MenuItem({
                caption     : this.txtPivotSettings
            });

            me.mnuFieldSettings = new Common.UI.MenuItem({
                caption     : this.txtFieldSettings
            });

            me.mnuPivotFilter = new Common.UI.MenuItem({
                caption     : this.txtFilter,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign   : 'tl-tr',
                    items: [
                        {
                            caption : me.txtClear,
                            value   : 'clear'
                        },{
                            caption : '--'
                        },{
                            caption : me.txtTop10,
                            value   : 'top10'
                        },{
                            caption : me.txtValueFilter,
                            value   : 'value'
                        },{
                            caption : me.txtLabelFilter,
                            value   : 'label'
                        }
                    ]
                })
            });

            me.mnuPivotSort = new Common.UI.MenuItem({
                caption     : this.txtSort,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign   : 'tl-tr',
                    items: [
                        {
                            iconCls: 'menu__icon btn-sort-down',
                            caption : me.txtAscending,
                            value   : Asc.c_oAscSortOptions.Ascending
                        },{
                            iconCls: 'menu__icon btn-sort-up',
                            caption : me.txtDescending,
                            value   : Asc.c_oAscSortOptions.Descending
                        },{
                            caption : me.txtSortOption,
                            value   : 'advanced'
                        }
                    ]
                })
            });

            me.mnuDeleteField = new Common.UI.MenuItem({
                caption     : this.txtDelField
            });

            me.mnuSubtotalField = new Common.UI.MenuItem({
                caption     : this.txtSubtotalField,
                checkable: true,
                allowDepress: true
            });

            me.mnuSummarize = new Common.UI.MenuItem({
                caption     : this.txtSummarize,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign   : 'tl-tr',
                    items: [
                        {
                            caption : me.txtSum,
                            value   : Asc.c_oAscDataConsolidateFunction.Sum,
                            checkable: true
                        },{
                            caption : me.txtCount,
                            value   : Asc.c_oAscDataConsolidateFunction.Count,
                            checkable: true
                        },{
                            caption : me.txtAverage,
                            value   : Asc.c_oAscDataConsolidateFunction.Average,
                            checkable: true
                        },{
                            caption : me.txtMax,
                            value   : Asc.c_oAscDataConsolidateFunction.Max,
                            checkable: true
                        },{
                            caption : me.txtMin,
                            value   : Asc.c_oAscDataConsolidateFunction.Min,
                            checkable: true
                        },{
                            caption : me.txtProduct,
                            value   : Asc.c_oAscDataConsolidateFunction.Product,
                            checkable: true
                        },{
                            caption : '--'
                        },{
                            caption : me.txtMoreOptions,
                            value: -1
                        }
                    ]
                })
            });

            me.mnuShowAs = new Common.UI.MenuItem({
                caption     : this.txtShowAs,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign   : 'tl-tr',
                    items: [
                        {
                            caption : me.txtNormal,
                            value   : Asc.c_oAscShowDataAs.Normal,
                            numFormat: Asc.c_oAscNumFormatType.General,
                            checkable: true
                        },{
                            caption : me.txtPercentOfGrand,
                            value   : Asc.c_oAscShowDataAs.PercentOfTotal,
                            numFormat: Asc.c_oAscNumFormatType.Percent,
                            checkable: true
                        },{
                            caption : me.txtPercentOfCol,
                            value   : Asc.c_oAscShowDataAs.PercentOfCol,
                            numFormat: Asc.c_oAscNumFormatType.Percent,
                            checkable: true
                        },{
                            caption : me.txtPercentOfTotal,
                            value   : Asc.c_oAscShowDataAs.PercentOfRow,
                            numFormat: Asc.c_oAscNumFormatType.Percent,
                            checkable: true
                        },{
                            caption : me.txtPercent,
                            value   : Asc.c_oAscShowDataAs.Percent,
                            numFormat: Asc.c_oAscNumFormatType.Percent,
                            showMore: true,
                            checkable: true
                        },{
                            caption : me.txtPercentOfParentRow,
                            value   : Asc.c_oAscShowDataAs.PercentOfParentRow,
                            numFormat: Asc.c_oAscNumFormatType.Percent,
                            checkable: true
                        },{
                            caption : me.txtPercentOfParentCol,
                            value   : Asc.c_oAscShowDataAs.PercentOfParentCol,
                            numFormat: Asc.c_oAscNumFormatType.Percent,
                            checkable: true
                        },{
                            caption : me.txtPercentOfParent,
                            value   : Asc.c_oAscShowDataAs.PercentOfParent,
                            numFormat: Asc.c_oAscNumFormatType.Percent,
                            showMore: true,
                            checkable: true
                        },{
                            caption : me.txtDifference,
                            value   : Asc.c_oAscShowDataAs.Difference,
                            numFormat: Asc.c_oAscNumFormatType.General,
                            showMore: true,
                            checkable: true
                        },{
                            caption : me.txtPercentDiff,
                            value   : Asc.c_oAscShowDataAs.PercentDiff,
                            numFormat: Asc.c_oAscNumFormatType.Percent,
                            showMore: true,
                            checkable: true
                        },{
                            caption : me.txtRunTotal,
                            value   : Asc.c_oAscShowDataAs.RunTotal,
                            numFormat: Asc.c_oAscNumFormatType.General,
                            showMore: true,
                            checkable: true
                        },{
                            caption : me.txtPercentOfRunTotal,
                            value   : Asc.c_oAscShowDataAs.PercentOfRunningTotal,
                            numFormat: Asc.c_oAscNumFormatType.Percent,
                            showMore: true,
                            checkable: true
                        },{
                            caption : me.txtRankAscending,
                            value   : Asc.c_oAscShowDataAs.RankAscending,
                            numFormat: Asc.c_oAscNumFormatType.General,
                            showMore: true,
                            checkable: true
                        },{
                            caption : me.txtRankDescending,
                            value   : Asc.c_oAscShowDataAs.RankDescending,
                            numFormat: Asc.c_oAscNumFormatType.General,
                            showMore: true,
                            checkable: true
                        },{
                            caption : me.txtIndex,
                            value   : Asc.c_oAscShowDataAs.Index,
                            numFormat: Asc.c_oAscNumFormatType.General,
                            checkable: true
                        },{
                            caption : '--'
                        },{
                            caption : me.txtMoreOptions,
                            value: -1
                        }
                    ]
                })
            });

            me.mnuShowDetails = new Common.UI.MenuItem({
                caption     : me.txtShowDetails
            });

            me.mnuPivotRefreshSeparator = new Common.UI.MenuItem({caption: '--'});
            me.mnuPivotSubtotalSeparator = new Common.UI.MenuItem({caption: '--'});
            me.mnuPivotExpandCollapseSeparator = new Common.UI.MenuItem({caption: '--'});
            me.mnuPivotGroupSeparator = new Common.UI.MenuItem({caption: '--'});
            me.mnuPivotDeleteSeparator = new Common.UI.MenuItem({caption: '--'});
            me.mnuPivotValueSeparator = new Common.UI.MenuItem({caption: '--'});
            me.mnuPivotFilterSeparator = new Common.UI.MenuItem({caption: '--'});
            me.mnuShowDetailsSeparator = new Common.UI.MenuItem({caption: '--'});

            me.pmiInsFunction = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-function',
                caption     : me.txtFormula
            });

            me.menuAddHyperlink = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-inserthyperlink',
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
                iconCls: 'menu__icon btn-inserthyperlink',
                caption     : me.txtInsHyperlink,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
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
                    cls: 'shifted-right',
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
                    cls: 'shifted-right',
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
                iconCls: 'menu__icon btn-add-comment',
                id          : 'id-context-menu-item-add-comment',
                caption     : me.txtAddComment
            });

            me.pmiAddCommentSeparator =  new Common.UI.MenuItem({
                caption     : '--'
            });

            me.pmiCellMenuSeparator =  new Common.UI.MenuItem({
                caption     : '--'
            });

            me.pmiFunctionSeparator =  new Common.UI.MenuItem({
                caption     : '--'
            });

            me.pmiFreezeSeparator =  new Common.UI.MenuItem({
                caption     : '--'
            });

            me.pmiCellSeparator =  new Common.UI.MenuItem({
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
                    cls: 'shifted-right',
                    menuAlign: 'tl-tr',
                    items   : [
                        { caption: me.txtClearSparklines, value: Asc.c_oAscCleanOptions.Sparklines },
                        { caption: me.txtClearSparklineGroups, value: Asc.c_oAscCleanOptions.SparklineGroups }
                    ]
                })
            });

            var numFormatTemplate = _.template('<a id="<%= id %>" tabindex="-1" type="menuitem">'+
                '<div style="position: relative;">'+
                    '<div class="display-value"><%= caption %></div>' +
                    '<label class="example-val" style="cursor: pointer;"><%= options.exampleval ? options.exampleval : "" %></label>' +
                '</div></a>');

            me.pmiNumFormat = new Common.UI.MenuItem({
                caption: me.txtNumFormat,
                menu: new Common.UI.Menu({
                    cls: 'shifted-right format-num-cls',
                    menuAlign: 'tl-tr',
                    items: [
                        {
                            caption: this.txtGeneral,
                            template: numFormatTemplate,
                            format: 'General',
                            exampleval: '100',
                            value: Asc.c_oAscNumFormatType.General
                        },
                        {
                            caption: this.txtNumber,
                            template: numFormatTemplate,
                            format: '0.00',
                            exampleval: '100,00',
                            value: Asc.c_oAscNumFormatType.Number
                        },
                        {
                            caption: this.txtScientific,
                            template: numFormatTemplate,
                            format: '0.00E+00',
                            exampleval: '1,00E+02',
                            value: Asc.c_oAscNumFormatType.Scientific
                        },
                        {
                            caption: this.txtAccounting,
                            template: numFormatTemplate,
                            format: '_($* #,##0.00_);_($* (#,##0.00);_($* "-"??_);_(@_)',
                            exampleval: '100,00 $',
                            value: Asc.c_oAscNumFormatType.Accounting
                        },
                        {
                            caption: this.txtCurrency,
                            template: numFormatTemplate,
                            format: '$#,##0.00',
                            exampleval: '100,00 $',
                            value: Asc.c_oAscNumFormatType.Currency
                        },
                        {
                            caption: this.txtDateShort,
                            template: numFormatTemplate,
                            format: 'MM-dd-yyyy',
                            exampleval: '04-09-1900',
                            value: Asc.c_oAscNumFormatType.Date
                        },
                        {
                            caption: this.txtDateLong,
                            template: numFormatTemplate,
                            format: 'MMMM d yyyy',
                            exampleval: 'April 9 1900',
                            value: Asc.c_oAscNumFormatType.Date
                        },
                        {
                            caption: this.txtTime,
                            template: numFormatTemplate,
                            format: 'HH:MM:ss',
                            exampleval: '00:00:00',
                            value: Asc.c_oAscNumFormatType.Time
                        },
                        {
                            caption: this.txtPercentage,
                            template: numFormatTemplate,
                            format: '0.00%',
                            exampleval: '100,00%',
                            value: Asc.c_oAscNumFormatType.Percent
                        },
                        {
                            caption: this.txtFraction,
                            template: numFormatTemplate,
                            format: '# ?/?',
                            exampleval: '100',
                            value: Asc.c_oAscNumFormatType.Fraction
                        },
                        {
                            caption: this.txtText,
                            template: numFormatTemplate,
                            format: '@',
                            exampleval: '100',
                            value: Asc.c_oAscNumFormatType.Text
                        },
                        {caption: '--'},
                        me.pmiAdvancedNumFormat = new Common.UI.MenuItem({
                            caption: me.textMoreFormats,
                            value: 'advanced'
                        })
                    ]
                })
            });

            me.pmiCellFormat = new Common.UI.MenuItem({
                caption     : me.txtCellFormat
            });

            me.pmiCondFormat = new Common.UI.MenuItem({
                caption     : me.txtCondFormat
            });

            me.pmiGetRangeList = new Common.UI.MenuItem({
                caption     : me.txtGetLink
            });

            me.ssMenu = new Common.UI.Menu({
                cls: 'shifted-right',
                restoreHeightAndTop: true,
                scrollToCheckedItem: false,
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
                    me.pmiCellSeparator,
                    me.pmiSparklines,
                    me.pmiSortCells,
                    me.pmiFilterCells,
                    me.pmiReapply,
                    me.mnuRefreshPivot,
                    me.mnuPivotRefreshSeparator,
                    me.mnuPivotSort,
                    me.mnuPivotFilter,
                    me.mnuPivotFilterSeparator,
                    me.mnuSubtotalField,
                    me.mnuPivotSubtotalSeparator,
                    me.mnuExpandCollapsePivot,
                    me.mnuPivotExpandCollapseSeparator,
                    me.mnuGroupPivot,
                    me.mnuUnGroupPivot,
                    me.mnuPivotGroupSeparator,
                    me.mnuDeleteField,
                    me.mnuPivotDeleteSeparator,
                    me.mnuSummarize,
                    me.mnuShowAs,
                    me.mnuPivotValueSeparator,
                    me.mnuShowDetails,
                    me.mnuShowDetailsSeparator,
                    me.mnuFieldSettings,
                    me.mnuPivotSettings,
                    me.pmiAddCommentSeparator,
                    me.pmiAddComment,
                    me.pmiCellMenuSeparator,
                    me.pmiCellFormat,
                    me.pmiNumFormat,
                    me.pmiCondFormat,
                    me.pmiEntriesList,
                    me.pmiGetRangeList,
                    me.pmiAddNamedRange,
                    me.pmiFunctionSeparator,
                    me.pmiInsFunction,
                    me.menuAddHyperlink,
                    me.menuHyperlink,
                    me.pmiRowHeight,
                    me.pmiColumnWidth,
                    me.pmiEntireHide,
                    me.pmiEntireShow,
                    me.pmiFreezeSeparator,
                    me.pmiFreezePanes
                ]
            }).on('hide:after', function(menu, e, isFromInputControl) {
                me.clearCustomItems(menu);
            });

            me.mnuGroupImg = new Common.UI.MenuItem({
                caption     : this.txtGroup,
                iconCls     : 'menu__icon btn-shape-group',
                type        : 'group',
                value       : 'grouping'
            });

            me.mnuUnGroupImg = new Common.UI.MenuItem({
                caption     : this.txtUngroup,
                iconCls     : 'menu__icon btn-shape-ungroup',
                type        : 'group',
                value       : 'ungrouping'
            });

            me.mnuShapeSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            me.mnuShapeAdvanced = new Common.UI.MenuItem({
                iconCls     : 'menu__icon btn-menu-shape',
                caption : me.advancedShapeText
            });

            me.mnuImgAdvanced = new Common.UI.MenuItem({
                iconCls     : 'menu__icon btn-menu-image',
                caption : me.advancedImgText
            });

            me.mnuSlicerSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            me.mnuSlicerAdvanced = new Common.UI.MenuItem({
                iconCls     : 'menu__icon btn-slicer',
                caption : me.advancedSlicerText
            });

            me.mnuChartEdit = new Common.UI.MenuItem({
                iconCls     : 'menu__icon btn-menu-chart',
                caption : me.chartText
            });

             me.mnuChartData = new Common.UI.MenuItem({
                iconCls     : 'menu__icon btn-select-range',
                caption : me.chartDataText
            });

             me.mnuChartType = new Common.UI.MenuItem({
                caption : me.chartTypeText
            });

            me.pmiImgCut = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-cut',
                caption     : me.txtCut,
                value       : 'cut'
            });

            me.pmiImgCopy = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-copy',
                caption     : me.txtCopy,
                value       : 'copy'
            });

            me.pmiImgPaste = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-paste',
                caption     : me.txtPaste,
                value       : 'paste'
            });

            me.menuSignatureEditSign   = new Common.UI.MenuItem({caption: this.strSign,      value: 0 });
            me.menuSignatureEditSetup  = new Common.UI.MenuItem({caption: this.strSetup,     value: 2 });
            me.menuEditSignSeparator   = new Common.UI.MenuItem({ caption: '--' });

            me.menuImgOriginalSize = new Common.UI.MenuItem({
                caption     : me.originalSizeText
            });

            me.menuImgReplace = new Common.UI.MenuItem({
                caption     : me.textReplace,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign: 'tl-tr',
                    items: [
                        new Common.UI.MenuItem({caption     : this.textFromFile, value: 'file'}),
                        new Common.UI.MenuItem({caption     : this.textFromUrl, value: 'url'}),
                        new Common.UI.MenuItem({caption     : this.textFromStorage, value: 'storage'})
                    ]
                })
            });

            me.menuImgCrop = new Common.UI.MenuItem({
                caption     : me.textCrop,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign: 'tl-tr',
                    items: [
                        new Common.UI.MenuItem({
                            caption: me.textCrop,
                            checkable: true,
                            allowDepress: true,
                            value  : 0
                        }),
                        new Common.UI.MenuItem({
                            caption: me.textCropFill,
                            value  : 1
                        }),
                        new Common.UI.MenuItem({
                            caption: me.textCropFit,
                            value  : 2
                        })
                    ]
                })
            });

            me.mnuBringToFront = new Common.UI.MenuItem({
                caption : this.textArrangeFront,
                iconCls : 'menu__icon btn-arrange-front',
                type    : 'arrange',
                value   : Asc.c_oAscDrawingLayerType.BringToFront
            });
            me.mnuSendToBack = new Common.UI.MenuItem({
                caption : this.textArrangeBack,
                iconCls : 'menu__icon btn-arrange-back',
                type    : 'arrange',
                value   : Asc.c_oAscDrawingLayerType.SendToBack
            });
            me.mnuBringForward = new Common.UI.MenuItem({
                caption : this.textArrangeForward,
                iconCls : 'menu__icon btn-arrange-forward',
                type    : 'arrange',
                value   : Asc.c_oAscDrawingLayerType.BringForward
            });
            me.mnuSendBackward = new Common.UI.MenuItem({
                caption: this.textArrangeBackward,
                iconCls : 'menu__icon btn-arrange-backward',
                type    : 'arrange',
                value   : Asc.c_oAscDrawingLayerType.SendBackward
            });

            me.menuImageArrange = new Common.UI.MenuItem({
                caption : me.textArrange,
                menu    : new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign: 'tl-tr',
                    items: [
                        me.mnuBringToFront,
                        me.mnuSendToBack,
                        me.mnuBringForward,
                        me.mnuSendBackward,
                        { caption: '--' },
                        me.mnuGroupImg,
                        me.mnuUnGroupImg
                    ]
                })
            });

            me.menuImageAlign = new Common.UI.MenuItem({
                caption     : me.textAlign,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign: 'tl-tr',
                    items: [{
                        caption : me.textShapeAlignLeft,
                        iconCls : 'menu__icon btn-shape-align-left',
                        value   : 0
                    }, {
                        caption : me.textShapeAlignCenter,
                        iconCls : 'menu__icon btn-shape-align-center',
                        value   : 4
                    }, {
                        caption : me.textShapeAlignRight,
                        iconCls : 'menu__icon btn-shape-align-right',
                        value   : 1
                    }, {
                        caption : me.textShapeAlignTop,
                        iconCls : 'menu__icon btn-shape-align-top',
                        value   : 3
                    }, {
                        caption : me.textShapeAlignMiddle,
                        iconCls : 'menu__icon btn-shape-align-middle',
                        value   : 5
                    }, {
                        caption : me.textShapeAlignBottom,
                        iconCls : 'menu__icon btn-shape-align-bottom',
                        value   : 2
                    },
                    {caption: '--'},
                    {
                        caption: me.txtDistribHor,
                        iconCls: 'menu__icon btn-shape-distribute-hor',
                        value: 6
                    },
                    {
                        caption: me.txtDistribVert,
                        iconCls: 'menu__icon btn-shape-distribute-vert',
                        value: 7
                    }]
                })
            });

            me.menuImgRotate = new Common.UI.MenuItem({
                caption     : me.textRotate,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign: 'tl-tr',
                    items: [
                        new Common.UI.MenuItem({
                            iconCls: 'menu__icon btn-rotate-90',
                            caption: me.textRotate90,
                            type   : 'rotate',
                            value  : 1
                        }),
                        new Common.UI.MenuItem({
                            iconCls: 'menu__icon btn-rotate-270',
                            caption: me.textRotate270,
                            type   : 'rotate',
                            value  : 0
                        }),
                        { caption: '--' },
                        new Common.UI.MenuItem({
                            iconCls: 'menu__icon btn-flip-hor',
                            caption: me.textFlipH,
                            type   : 'flip',
                            value  : 1
                        }),
                        new Common.UI.MenuItem({
                            iconCls: 'menu__icon btn-flip-vert',
                            caption: me.textFlipV,
                            type   : 'flip',
                            value  : 0
                        })
                    ]
                })
            });

            me.menuImgMacro = new Common.UI.MenuItem({
                caption: me.textMacro
            });

            me.menuSaveAsPicture = new Common.UI.MenuItem({
                caption     : me.textSaveAsPicture
            });

            var menuSaveAsPictureSeparator = new Common.UI.MenuItem({ caption: '--'});

            me.menuImgEditPoints = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-edit-points',
                caption: me.textEditPoints
            });

            this.imgMenu = new Common.UI.Menu({
                cls: 'shifted-right',
                restoreHeightAndTop: true,
                scrollToCheckedItem: false,
                items: [
                    me.pmiImgCut,
                    me.pmiImgCopy,
                    me.pmiImgPaste,
                    {caption: '--'},
                    me.menuSignatureEditSign,
                    me.menuSignatureEditSetup,
                    me.menuEditSignSeparator,
                    me.menuImageArrange,
                    me.menuImageAlign,
                    me.menuImgRotate,
                    me.menuImgMacro,
                    menuSaveAsPictureSeparator,
                    me.menuSaveAsPicture,
                    me.mnuShapeSeparator,
                    me.menuImgCrop,
                    me.mnuChartData,
                    me.mnuChartType,
                    me.mnuChartEdit,
                    me.menuImgEditPoints,
                    me.mnuShapeAdvanced,
                    me.menuImgOriginalSize,
                    me.menuImgReplace,
                    me.mnuImgAdvanced,
                    me.mnuSlicerSeparator,
                    me.mnuSlicerAdvanced
                ]
            }).on('hide:after', function(menu, e, isFromInputControl) {
                me.clearCustomItems(menu);
            });

            this.menuParagraphVAlign = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-align-top',
                caption     : this.vertAlignText,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign   : 'tl-tr',
                    items: [
                        me.menuParagraphTop = new Common.UI.MenuItem({
                            iconCls: 'menu__icon btn-align-top',
                            caption     : me.topCellText,
                            checkable   : true,
                            checkmark   : false,
                            toggleGroup : 'popupparagraphvalign',
                            value       : Asc.c_oAscVAlign.Top
                        }),
                        me.menuParagraphCenter = new Common.UI.MenuItem({
                            iconCls: 'menu__icon btn-align-middle',
                            caption     : me.centerCellText,
                            checkable   : true,
                            checkmark   : false,
                            toggleGroup : 'popupparagraphvalign',
                            value       : Asc.c_oAscVAlign.Center
                        }),
                        this.menuParagraphBottom = new Common.UI.MenuItem({
                            iconCls: 'menu__icon btn-align-bottom',
                            caption     : me.bottomCellText,
                            checkable   : true,
                            checkmark   : false,
                            toggleGroup : 'popupparagraphvalign',
                            value       : Asc.c_oAscVAlign.Bottom
                        })
                    ]
                })
            });

            me.menuParagraphDirection = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-text-orient-hor',
                caption     : me.directionText,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign: 'tl-tr',
                    items   : [
                        me.menuParagraphDirectH = new Common.UI.MenuItem({
                            caption     : me.directHText,
                            iconCls     : 'menu__icon btn-text-orient-hor',
                            checkable   : true,
                            checkmark   : false,
                            checked     : false,
                            toggleGroup : 'popupparagraphdirect',
                            direction      : Asc.c_oAscVertDrawingText.normal
                        }),
                        me.menuParagraphDirect90 = new Common.UI.MenuItem({
                            caption     : me.direct90Text,
                            iconCls     : 'menu__icon btn-text-orient-rdown',
                            checkable   : true,
                            checkmark   : false,
                            checked     : false,
                            toggleGroup : 'popupparagraphdirect',
                            direction      : Asc.c_oAscVertDrawingText.vert
                        }),
                        me.menuParagraphDirect270 = new Common.UI.MenuItem({
                            caption     : me.direct270Text,
                            iconCls     : 'menu__icon btn-text-orient-rup',
                            checkable   : true,
                            checkmark   : false,
                            checked     : false,
                            toggleGroup : 'popupparagraphdirect',
                            direction      : Asc.c_oAscVertDrawingText.vert270
                        })
                    ]
                })
            });

            me.menuParagraphBullets = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-setmarkers',
                caption     : me.bulletsText,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign: 'tl-tr',
                    items   : [
                        { template: _.template('<div id="id-docholder-menu-bullets" class="menu-layouts" style="width: 376px;"></div>') },
                        {caption: '--'},
                        me.menuParagraphBulletNone = new Common.UI.MenuItem({
                            caption     : me.textNone,
                            checkable   : true,
                            checked     : false,
                            value       : -1
                        }),
                        me.mnuListSettings = new Common.UI.MenuItem({
                            caption: me.textListSettings,
                            value: 'settings'
                        })
                    ]
                })
            });

            me._markersArr = [
                '{"bulletTypeface":{"type":"bufont","typeface":"Symbol"},"bulletType":{"type":"char","char":"·","startAt":null}}',
                '{"bulletTypeface":{"type":"bufont","typeface":"Courier New"},"bulletType":{"type":"char","char":"o","startAt":null}}',
                '{"bulletTypeface":{"type":"bufont","typeface":"Wingdings"},"bulletType":{"type":"char","char":"§","startAt":null}}',
                '{"bulletTypeface":{"type":"bufont","typeface":"Wingdings"},"bulletType":{"type":"char","char":"v","startAt":null}}',
                '{"bulletTypeface":{"type":"bufont","typeface":"Wingdings"},"bulletType":{"type":"char","char":"Ø","startAt":null}}',
                '{"bulletTypeface":{"type":"bufont","typeface":"Wingdings"},"bulletType":{"type":"char","char":"ü","startAt":null}}',
                '{"bulletTypeface":{"type":"bufont","typeface":"Symbol"},"bulletType":{"type":"char","char":"¨","startAt":null}}',
                '{"bulletTypeface":{"type":"bufont","typeface":"Arial"},"bulletType":{"type":"char","char":"–","startAt":null}}'
            ];
            me._numbersArr = [
                '{"bulletTypeface":{"type":"bufont","typeface":"Arial"},"bulletType":{"type":"autonum","char":null,"autoNumType":"alphaUcPeriod","startAt":null}}',
                '{"bulletTypeface":{"type":"bufont","typeface":"Arial"},"bulletType":{"type":"autonum","char":null,"autoNumType":"alphaLcParenR","startAt":null}}',
                '{"bulletTypeface":{"type":"bufont","typeface":"Arial"},"bulletType":{"type":"autonum","char":null,"autoNumType":"alphaLcPeriod","startAt":null}}',
                '{"bulletTypeface":{"type":"bufont","typeface":"Arial"},"bulletType":{"type":"autonum","char":null,"autoNumType":"arabicPeriod","startAt":null}}',
                '{"bulletTypeface":{"type":"bufont","typeface":"Arial"},"bulletType":{"type":"autonum","char":null,"autoNumType":"arabicParenR","startAt":null}}',
                '{"bulletTypeface":{"type":"bufont","typeface":"Arial"},"bulletType":{"type":"autonum","char":null,"autoNumType":"romanUcPeriod","startAt":null}}',
                '{"bulletTypeface":{"type":"bufont","typeface":"Arial"},"bulletType":{"type":"autonum","char":null,"autoNumType":"romanLcPeriod","startAt":null}}'
            ];
            me.paraBulletsPicker = {
                conf: {rec: null},
                delayRenderTips: true,
                store       : new Common.UI.DataViewStore([
                    {group: 'menu-list-bullet-group', id: 'id-markers-' + Common.UI.getId(), type: 0, subtype: 1, numberingInfo: me._markersArr[0], skipRenderOnChange: true, tip: this.tipMarkersFRound},
                    {group: 'menu-list-bullet-group', id: 'id-markers-' + Common.UI.getId(), type: 0, subtype: 2, numberingInfo: me._markersArr[1], skipRenderOnChange: true, tip: this.tipMarkersHRound},
                    {group: 'menu-list-bullet-group', id: 'id-markers-' + Common.UI.getId(), type: 0, subtype: 3, numberingInfo: me._markersArr[2], skipRenderOnChange: true, tip: this.tipMarkersFSquare},
                    {group: 'menu-list-bullet-group', id: 'id-markers-' + Common.UI.getId(), type: 0, subtype: 4, numberingInfo: me._markersArr[3], skipRenderOnChange: true, tip: this.tipMarkersStar},
                    {group: 'menu-list-bullet-group', id: 'id-markers-' + Common.UI.getId(), type: 0, subtype: 5, numberingInfo: me._markersArr[4], skipRenderOnChange: true, tip: this.tipMarkersArrow},
                    {group: 'menu-list-bullet-group', id: 'id-markers-' + Common.UI.getId(), type: 0, subtype: 6, numberingInfo: me._markersArr[5], skipRenderOnChange: true, tip: this.tipMarkersCheckmark},
                    {group: 'menu-list-bullet-group', id: 'id-markers-' + Common.UI.getId(), type: 0, subtype: 7, numberingInfo: me._markersArr[6], skipRenderOnChange: true, tip: this.tipMarkersFRhombus},
                    {group: 'menu-list-bullet-group', id: 'id-markers-' + Common.UI.getId(), type: 0, subtype: 8, numberingInfo: me._markersArr[7], skipRenderOnChange: true, tip: this.tipMarkersDash},
                    {group: 'menu-list-number-group', id: 'id-numbers-' + Common.UI.getId(), type: 1, subtype: 4, numberingInfo: me._numbersArr[0], skipRenderOnChange: true, tip: this.tipNumCapitalLetters},
                    {group: 'menu-list-number-group', id: 'id-numbers-' + Common.UI.getId(), type: 1, subtype: 5, numberingInfo: me._numbersArr[1], skipRenderOnChange: true, tip: this.tipNumLettersParentheses},
                    {group: 'menu-list-number-group', id: 'id-numbers-' + Common.UI.getId(), type: 1, subtype: 6, numberingInfo: me._numbersArr[2], skipRenderOnChange: true, tip: this.tipNumLettersPoints},
                    {group: 'menu-list-number-group', id: 'id-numbers-' + Common.UI.getId(), type: 1, subtype: 1, numberingInfo: me._numbersArr[3], skipRenderOnChange: true, tip: this.tipNumNumbersPoint},
                    {group: 'menu-list-number-group', id: 'id-numbers-' + Common.UI.getId(), type: 1, subtype: 2, numberingInfo: me._numbersArr[4], skipRenderOnChange: true, tip: this.tipNumNumbersParentheses},
                    {group: 'menu-list-number-group', id: 'id-numbers-' + Common.UI.getId(), type: 1, subtype: 3, numberingInfo: me._numbersArr[5], skipRenderOnChange: true, tip: this.tipNumRoman},
                    {group: 'menu-list-number-group', id: 'id-numbers-' + Common.UI.getId(), type: 1, subtype: 7, numberingInfo: me._numbersArr[6], skipRenderOnChange: true, tip: this.tipNumRomanSmall}
                ]),
                groups: new Common.UI.DataViewGroupStore([
                    {id: 'menu-list-bullet-group', caption: this.textBullets},
                    {id: 'menu-list-number-group', caption: this.textNumbering}
                ]),
                selectRecord: function (rec) {
                    this.conf.rec = rec;
                }
            };

            me.menuAddHyperlinkShape = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-inserthyperlink',
                caption     : me.txtInsHyperlink
            });

            me.menuEditHyperlinkShape = new Common.UI.MenuItem({
                caption     : me.editHyperlinkText
            });

            me.menuRemoveHyperlinkShape = new Common.UI.MenuItem({
                caption     : me.removeHyperlinkText
            });

            me.menuHyperlinkShape = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-inserthyperlink',
                caption     : me.txtInsHyperlink,
                menu        : new Common.UI.Menu({
                    cls: 'shifted-right',
                    menuAlign: 'tl-tr',
                    items   : [
                        me.menuEditHyperlinkShape,
                        me.menuRemoveHyperlinkShape
                    ]
                })
            });

            this.pmiTextAdvanced = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-paragraph',
                caption     : me.txtTextAdvanced
            });

            me.pmiTextCut = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-cut',
                caption     : me.txtCut,
                value       : 'cut'
            });

            me.pmiTextCopy = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-copy',
                caption     : me.txtCopy,
                value       : 'copy'
            });

            me.pmiTextPaste = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-paste',
                caption     : me.txtPaste,
                value       : 'paste'
            });

            me.menuParagraphEquation = new Common.UI.MenuItem({
                caption     : me.advancedEquationText,
                iconCls     : 'menu__icon btn-equation',
                menu        : me.createEquationMenu('popupparaeqinput', 'tl-tr')
            });

            this.textInShapeMenu = new Common.UI.Menu({
                cls: 'shifted-right',
                scrollToCheckedItem: false,
                items: [
                    me.pmiTextCut,
                    me.pmiTextCopy,
                    me.pmiTextPaste,
                    {caption: '--'},
                    me.menuParagraphVAlign,
                    me.menuParagraphDirection,
                    me.menuParagraphBullets,
                    me.menuAddHyperlinkShape,
                    me.menuHyperlinkShape,
                    {caption: '--'},
                    me.pmiTextAdvanced,
                    me.menuParagraphEquation
                ]
            }).on('hide:after', function(menu, e, isFromInputControl) {
                me.clearCustomItems(menu);
            });

            me.pmiCommonCut = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-cut',
                caption     : me.txtCut,
                value       : 'cut'
            });

            me.pmiCommonCopy = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-copy',
                caption     : me.txtCopy,
                value       : 'copy'
            });

            me.pmiCommonPaste = new Common.UI.MenuItem({
                iconCls: 'menu__icon btn-paste',
                caption     : me.txtPaste,
                value       : 'paste'
            });

            me.copyPasteMenu = new Common.UI.Menu({
                cls: 'shifted-right',
                items: [
                    me.pmiCommonCut,
                    me.pmiCommonCopy,
                    me.pmiCommonPaste
                ]
            }).on('hide:after', function(menu, e, isFromInputControl) {
                me.clearCustomItems(menu);
            });

            this.entriesMenu = new Common.UI.Menu({
                maxHeight: 200,
                cyclic: false,
                items: []
            }).on('show:after', function () {
                this.scroller.update({alwaysVisibleY: true});
            }).on('keydown:before', function (menu, e) {
                if (e.altKey && e.keyCode == Common.UI.Keys.DOWN) {
                    var li = $(e.target).closest('li');
                    if (li.length>0)
                        li.click();
                    else
                        menu.hide();
                }
            });

            this.funcMenu = new Common.UI.Menu({
                maxHeight: 200,
                cyclic: false,
                items: []
            }).on('render:after', function(mnu) {
                mnu.cmpEl.removeAttr('oo_editor_input').attr('oo_editor_keyboard', true);
            });

            this.tableTotalMenu = new Common.UI.Menu({
                maxHeight: 160,
                menuAlign: 'tr-br',
                cyclic: false,
                cls: 'lang-menu',
                items: [
                    {caption: this.textNone, value: Asc.ETotalsRowFunction.totalrowfunctionNone, checkable: true},
                    {caption: this.textAverage, value: Asc.ETotalsRowFunction.totalrowfunctionAverage, checkable: true },
                    {caption: this.textCount, value: Asc.ETotalsRowFunction.totalrowfunctionCount, checkable: true },
                    {caption: this.textMax, value: Asc.ETotalsRowFunction.totalrowfunctionMax, checkable: true },
                    {caption: this.textMin, value: Asc.ETotalsRowFunction.totalrowfunctionMin, checkable: true },
                    {caption: this.textSum, value: Asc.ETotalsRowFunction.totalrowfunctionSum, checkable: true },
                    {caption: this.textStdDev, value: Asc.ETotalsRowFunction.totalrowfunctionStdDev, checkable: true },
                    {caption: this.textVar, value: Asc.ETotalsRowFunction.totalrowfunctionVar, checkable: true },
                    {caption: this.textMore, value: Asc.ETotalsRowFunction.totalrowfunctionCustom, checkable: true }
                ]
            });

            me.fillMenu = new Common.UI.Menu({
                restoreHeightAndTop: true,
                items: [
                    {caption: this.textCopyCells, value: Asc.c_oAscFillType.copyCells},
                    {caption: this.textFillSeries, value: Asc.c_oAscFillType.fillSeries},
                    {caption: this.textFillFormatOnly, value: Asc.c_oAscFillType.fillFormattingOnly},
                    {caption: this.textFillWithoutFormat, value: Asc.c_oAscFillType.fillWithoutFormatting},
                    {caption: '--'},
                    {caption: this.textFillDays, value: Asc.c_oAscFillType.fillDays},
                    {caption: this.textFillWeekdays, value: Asc.c_oAscFillType.fillWeekdays},
                    {caption: this.textFillMonths, value: Asc.c_oAscFillType.fillMonths},
                    {caption: this.textFillYears, value: Asc.c_oAscFillType.fillYears},
                    {caption: '--'},
                    {caption: this.textLinearTrend, value: Asc.c_oAscFillType.linearTrend},
                    {caption: this.textGrowthTrend, value: Asc.c_oAscFillType.growthTrend},
                    {caption: this.textFlashFill, value: Asc.c_oAscFillType.flashFill},
                    {caption: this.textSeries, value: Asc.c_oAscFillType.series}
                ]
            });

            me.fireEvent('createdelayedelements', [me, 'edit']);
        },

        setMenuItemCommentCaptionMode: function (item, add, editable) {
            item.setCaption(add ? this.txtAddComment : (editable ? this.txtEditComment : this.txtShowComment), true);
        },

        createEquationMenu: function(toggleGroup, menuAlign) {
            return new Common.UI.Menu({
                cls: 'ppm-toolbar shifted-right',
                menuAlign: menuAlign,
                items   : [
                    new Common.UI.MenuItem({
                        caption     : this.currProfText,
                        iconCls     : 'menu__icon btn-professional-equation',
                        type        : 'view',
                        value       : {all: false, linear: false}
                    }),
                    new Common.UI.MenuItem({
                        caption     : this.currLinearText,
                        iconCls     : 'menu__icon btn-linear-equation',
                        type        : 'view',
                        value       : {all: false, linear: true}
                    }),
                    new Common.UI.MenuItem({
                        caption     : this.allProfText,
                        iconCls     : 'menu__icon btn-professional-equation',
                        type        : 'view',
                        value       : {all: true, linear: false}
                    }),
                    new Common.UI.MenuItem({
                        caption     : this.allLinearText,
                        iconCls     : 'menu__icon btn-linear-equation',
                        type        : 'view',
                        value       : {all: true, linear: true}
                    }),
                    { caption     : '--' },
                    new Common.UI.MenuItem({
                        caption     : this.unicodeText,
                        checkable   : true,
                        checked     : false,
                        toggleGroup : toggleGroup,
                        type        : 'input',
                        value       : Asc.c_oAscMathInputType.Unicode
                    }),
                    new Common.UI.MenuItem({
                        caption     : this.latexText,
                        checkable   : true,
                        checked     : false,
                        toggleGroup : toggleGroup,
                        type        : 'input',
                        value       : Asc.c_oAscMathInputType.LaTeX
                    }),
                    { caption     : '--' },
                    new Common.UI.MenuItem({
                        caption     : this.hideEqToolbar,
                        isToolbarHide: false,
                        type        : 'hide',
                    })
                ]
            });
        },

        updateCustomItems: function(menu, data) {
            if (!menu || !data || data.length<1) return;

            var me = this,
                lang = me.mode && me.mode.lang ? me.mode.lang.split(/[\-_]/)[0] : 'en';

            me._preventCustomClick && clearTimeout(me._preventCustomClick);
            me._hasCustomItems && (me._preventCustomClick = setTimeout(function () {
                me._preventCustomClick = null;
            },500)); // set delay only on update existing items
            me._hasCustomItems = true;

            var findCustomItem = function(guid, id) {
                if (menu && menu.items.length>0) {
                    for (var i = menu.items.length-1; i >=0 ; i--) {
                        if (menu.items[i].options.isCustomItem && (id===undefined && menu.items[i].options.guid === guid || menu.items[i].options.guid === guid && menu.items[i].value === id)) {
                            return menu.items[i];
                        }
                    }
                }
            }

            var getMenu = function(items, guid, toMenu) {
                if (toMenu)
                    toMenu.removeAll();
                else {
                    toMenu = new Common.UI.Menu({
                        cls: 'shifted-right',
                        menuAlign: 'tl-tr',
                        items: []
                    });
                    toMenu.on('item:click', function(menu, item, e) {
                        !me._preventCustomClick && me.api && me.api.onPluginContextMenuItemClick && me.api.onPluginContextMenuItemClick(item.options.guid, item.value);
                    });
                    toMenu.on('menu:click', function(menu, e) {
                        me._preventCustomClick && e.stopPropagation();
                    });
                }
                items.forEach(function(item) {
                    item.separator && toMenu.addItem({
                        caption: '--',
                        isCustomItem: true,
                        guid: guid
                    });
                    item.text && toMenu.addItem({
                        caption: ((typeof item.text == 'object') ? item.text[lang] || item.text['en'] : item.text) || '',
                        isCustomItem: true,
                        value: item.id,
                        guid: guid,
                        menu: item.items ? getMenu(item.items, guid) : false,
                        iconImg: me.parseIcons(item.icons),
                        disabled: !!item.disabled
                    });
                });
                return toMenu;
            }

            var focused;
            data.forEach(function(plugin) {
                var isnew = !findCustomItem(plugin.guid);
                if (plugin && plugin.items && plugin.items.length>0) {
                    plugin.items.forEach(function(item) {
                        if (item.separator && isnew) {// add separator only to new plugins menu
                            menu.addItem({
                                caption: '--',
                                isCustomItem: true,
                                guid: plugin.guid
                            });
                        }

                        if (!item.text) return;
                        var mnu = findCustomItem(plugin.guid, item.id),
                            caption = ((typeof item.text == 'object') ? item.text[lang] || item.text['en'] : item.text) || '';
                        if (mnu) {
                            mnu.setCaption(caption);
                            mnu.setDisabled(!!item.disabled);
                            if (item.items) {
                                if (mnu.menu) {
                                    if (mnu.menu.isVisible() && mnu.menu.cmpEl.find(' > li:not(.divider):not(.disabled):visible').find('> a').filter(':focus').length>0) {
                                        mnu.menu.isOver = true;
                                        focused = mnu.cmpEl;
                                    }
                                    getMenu(item.items, plugin.guid, mnu.menu);
                                } else
                                    mnu.setMenu(getMenu(item.items, plugin.guid));
                            }
                        } else {
                            var mnu = new Common.UI.MenuItem({
                                caption     : caption,
                                isCustomItem: true,
                                value: item.id,
                                guid: plugin.guid,
                                menu: item.items && item.items.length>=0 ? getMenu(item.items, plugin.guid) : false,
                                iconImg: me.parseIcons(item.icons),
                                disabled: !!item.disabled
                            }).on('click', function(item, e) {
                                !me._preventCustomClick && me.api && me.api.onPluginContextMenuItemClick && me.api.onPluginContextMenuItemClick(item.options.guid, item.value);
                            });
                            menu.addItem(mnu);
                        }
                    });
                }
            });

            if (focused) {
                var $subitems = $('> [role=menu]', focused).find('> li:not(.divider):not(.disabled):visible > a');
                ($subitems.length>0) && $subitems.eq(0).focus();
            }
            menu.alignPosition();
        },

        clearCustomItems: function(menu) {
            if (menu && menu.items.length>0) {
                for (var i = 0; i < menu.items.length; i++) {
                    if (menu.items[i].options.isCustomItem) {
                        menu.removeItem(menu.items[i]);
                        i--;
                    }
                }
            }
            this._hasCustomItems = false;
        },

        parseIcons: function(icons) {
            var plugins = SSE.getController('Common.Controllers.Plugins').getView('Common.Views.Plugins');
            if (icons && icons.length && plugins && plugins.parseIcons) {
                icons = plugins.parseIcons(icons);
                return icons ? icons['normal'] : undefined;
            }
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
        txtExpandCollapse:      'Expand/Collapse',
        txtExpand:              'Expand',
        txtCollapse:            'Collapse',
        txtExpandEntire:        'Expand Entire Field',
        txtCollapseEntire:      'Collapse Entire Field',
        txtUngroup:             'Ungroup',
        txtGroup:               'Group',
        topCellText:            'Align Top',
        centerCellText:         'Align Middle',
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
        direct90Text:           'Rotate Text Down',
        direct270Text:          'Rotate Text Up',
        txtAddNamedRange:       'Define Name',
        textFreezePanes:        'Freeze Panes',
        textUnFreezePanes:      'Unfreeze Panes',
        txtSelect:              'Select',
        selectRowText           : 'Row',
        selectColumnText        : 'Entire Column',
        selectDataText          : 'Column Data',
        selectTableText         : 'Table',
        insertRowAboveText      : 'Row Above',
        insertRowBelowText      : 'Row Below',
        insertColumnLeftText    : 'Column Left',
        insertColumnRightText   : 'Column Right',
        deleteRowText           : 'Row',
        deleteColumnText        : 'Column',
        deleteTableText         : 'Table',
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
        txtShowComment: 'Show Comment',
        advancedImgText: 'Image Advanced Settings',
        textNone: 'None',
        bulletsText: 'Bullets and Numbering',
        textUndo: 'Undo',
        strSign: 'Sign',
        strDetails: 'Signature Details',
        strSetup: 'Signature Setup',
        strDelete: 'Remove Signature',
        originalSizeText: 'Actual Size',
        textReplace: 'Replace image',
        textFromUrl: 'From URL',
        textFromFile: 'From File',
        txtNumFormat:       'Number Format',
        txtGeneral:         'General',
        txtNumber:          'Number',
        txtScientific:      'Scientific',
        txtAccounting:      'Accounting',
        txtCurrency:        'Currency',
        txtDateShort:       'Short Date',
        txtDateLong:        'Long Date',
        txtTime:            'Time',
        txtPercentage:      'Percentage',
        txtFraction:        'Fraction',
        txtText:            'Text',
        textMoreFormats: 'More formats',
        textShapeAlignLeft      : 'Align Left',
        textShapeAlignRight     : 'Align Right',
        textShapeAlignCenter    : 'Align Center',
        textShapeAlignTop       : 'Align Top',
        textShapeAlignBottom    : 'Align Bottom',
        textShapeAlignMiddle    : 'Align Middle',
        txtDistribHor: 'Distribute Horizontally',
        txtDistribVert: 'Distribute Vertically',
        textRotate270: 'Rotate 90° Counterclockwise',
        textRotate90: 'Rotate 90° Clockwise',
        textFlipV: 'Flip Vertically',
        textFlipH: 'Flip Horizontally',
        textRotate: 'Rotate',
        textArrange: 'Arrange',
        textAlign: 'Align',
        textCrop: 'Crop',
        textCropFill: 'Fill',
        textCropFit: 'Fit',
        textListSettings: 'List Settings',
        textFromStorage: 'From Storage',
        advancedSlicerText: 'Slicer Advanced Settings',
        textAverage: 'Average',
        textMax: 'Max',
        textMin: 'Min',
        textCount: 'Count',
        textSum: 'Sum',
        textStdDev: 'StdDev',
        textVar: 'Var',
        textMore: 'More functions',
        txtCustomSort: 'Custom sort',
        txtCondFormat: 'Conditional Formatting',
        textBullets: 'Bullets',
        textNumbering: 'Numbering',
        textMacro: 'Assign Macro',
        textSaveAsPicture: 'Save as picture',
        textEditPoints: 'Edit Points',
        tipNumCapitalLetters: 'A. B. C.',
        tipNumLettersParentheses: 'a) b) c)',
        tipNumLettersPoints: 'a. b. c.',
        tipNumNumbersPoint: '1. 2. 3.',
        tipNumNumbersParentheses: '1) 2) 3)',
        tipNumRoman: 'I. II. III.',
        tipNumRomanSmall: 'i. ii. iii.',
        tipMarkersFRound: 'Filled round bullets',
        tipMarkersHRound: 'Hollow round bullets',
        tipMarkersFSquare: 'Filled square bullets',
        tipMarkersStar: 'Star bullets',
        tipMarkersArrow: 'Arrow bullets',
        tipMarkersCheckmark: 'Checkmark bullets',
        tipMarkersFRhombus: 'Filled rhombus bullets',
        tipMarkersDash: 'Dash bullets',
        chartDataText: 'Select Chart Data',
        chartTypeText: 'Change Chart Type',
        txtGetLink: 'Get link to this range',
        txtRefresh: 'Refresh',
        advancedEquationText: 'Equation Settings',
        unicodeText: 'Unicode',
        latexText: 'LaTeX',
        currProfText: 'Current - Professional',
        currLinearText: 'Current - Linear',
        allProfText: 'All - Professional',
        allLinearText: 'All - Linear',
        hideEqToolbar: 'Hide Equation Toolbar',
        showEqToolbar: 'Show Equation Toolbar',
        txtPivotSettings: 'Pivot Table settings',
        txtFieldSettings: 'Field settings',
        txtValueFieldSettings: 'Value field settings',
        txtDelField: 'Remove',
        txtSubtotalField: 'Subtotal',
        txtGrandTotal: 'Grand total',
        txtSummarize: 'Summarize values by',
        txtShowAs: 'Show values as',
        txtMoreOptions: 'More options',
        txtSum: 'Sum',
        txtAverage: 'Average',
        txtCount: 'Count',
        txtMax: 'Max',
        txtMin: 'Min',
        txtProduct: 'Product',
        txtNormal: 'No calculation',
        txtDifference: 'The difference from',
        txtPercent: '% of',
        txtPercentDiff: '% difference from',
        txtRunTotal: 'Running total in',
        txtPercentOfRunTotal: '% running total in',
        txtPercentOfCol: '% of column total',
        txtPercentOfTotal: '% of row total',
        txtPercentOfGrand: '% of grand total',
        txtIndex: 'Index',
        txtPercentOfParentRow: '% of parent row total',
        txtPercentOfParentCol: '% of parent column total',
        txtPercentOfParent: '% of parent total',
        txtRankAscending: 'Rank smallest to largest',
        txtRankDescending: 'Rank largest to smallest',
        txtValueFilter: 'Value filters',
        txtLabelFilter: 'Label filters',
        txtTop10: 'Top 10',
        txtClearPivotField: 'Clear filter from {0}',
        txtSortOption: 'More sort options',
        txtShowDetails: 'Show details',
        txtInsImage: 'Insert image from File',
        txtInsImageUrl: 'Insert image from URL',
        textCopyCells: 'Copy cells',
        textFillSeries: 'Fill series',
        textFillFormatOnly: 'Fill formatting only',
        textFillWithoutFormat: 'Fill without formatting',
        textFillDays: 'Fill days',
        textFillWeekdays: 'Fill weekdays',
        textFillMonths: 'Fill months',
        textFillYears: 'Fill years',
        textLinearTrend: 'Linear trend',
        textGrowthTrend: 'Growth trend',
        textFlashFill: 'Flash fill',
        textSeries: 'Series',
        txtCellFormat: 'Format cells'

    }, SSE.Views.DocumentHolder || {}));
});