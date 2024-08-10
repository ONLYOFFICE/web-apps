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
 *  DocumentHolder.js
 *
 *  DocumentHolder view
 *
 *  Created on 3/28/14
 *
 */

define([
    'jquery',
    'underscore',
    'backbone',
    'gateway',
    'common/main/lib/component/Menu',
    'common/main/lib/view/OpenDialog'
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
            me._currentTranslateObj = undefined;

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

        createDelayedElementsViewer: function() {},

        createDelayedElements: function() {},

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

        addEquationMenu: function() {},

        clearEquationMenu: function() {},

        equationCallback: function() {},

        initEquationMenu: function() {},

        updateCustomItems: function() {},

        clearCustomItems: function() {},

        parseIcons: function() {},

        txtSort:                'Sort',
        txtAscending:           'Ascending',
        txtDescending:          'Descending',
        txtFormula:             'Insert Function',
        txtInsHyperlink:        'Hyperlink',
        txtEditObject: 'Edit object',
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