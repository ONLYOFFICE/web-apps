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
 *  Created on 1/11/14
 *
 */

define([
    'jquery',
    'underscore',
    'backbone',
    'gateway',
    'common/main/lib/util/utils',
    'common/main/lib/component/Menu',
    'common/main/lib/component/Calendar'
], function ($, _, Backbone, gateway) { 'use strict';

    PDFE.Views.DocumentHolder =  Backbone.View.extend(_.extend({
        el: '#editor_sdk',

        // Compile our stats template
        template: null,

        // Delegated events for creating new items, and clearing completed ones.
        events: {
        },

        initialize: function () {
            this._isDisabled = false;
            this._preventCustomClick = null;
            this._hasCustomItems = false;
            this._pagesCount = 0;
            this._currentTranslateObj = this;
        },

        render: function () {
            this.fireEvent('render:before', this);

            this.cmpEl = $(this.el);

            this.fireEvent('render:after', this);
            return this;
        },

        setApi: function(o) {
            this.api = o;
            return this;
        },

        setMode: function(m) {
            this.mode = m;
            return this;
        },

        createDelayedElementsPDFViewer: function() {},

        createDelayedElementsPDFEditor: function() {},

        createDelayedElementsPDFForms: function() {},

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

        createTextBar: function(textBarBtns) {
            var container = $('<div id="text-bar-container" style="position: absolute;">' +
                                '<div id="text-bar-fonts" style="display:inline-block;" class="margin-right-2"></div>' +
                                '<div id="text-bar-font-size" style="display:inline-block;" class="margin-right-4"></div>' +
                                '<div id="text-bar-bold" style="display:inline-block;" class="margin-right-4"></div>' +
                                '<div id="text-bar-italic" style="display:inline-block;" class="margin-right-4"></div>' +
                                '<div id="text-bar-underline" style="display:inline-block;" class="margin-right-4"></div>' +
                                '<div id="text-bar-strikeout" style="display:inline-block;" class="margin-right-4"></div>' +
                                '<div id="text-bar-super" style="display:inline-block;" class="margin-right-4"></div>' +
                                '<div id="text-bar-sub" style="display:inline-block;" class="margin-right-4"></div>' +
                                '<div id="text-bar-textcolor" style="display:inline-block;"></div>' +
                            '</div>'),
                toolbarController = PDFE.getController('Toolbar'),
                toolbar = toolbarController.getView('Toolbar');

            this.cmbFontName = new Common.UI.ComboBoxFonts({
                el: $('#text-bar-fonts', container),
                cls         : 'input-group-nr',
                style       : 'width: 100px;',
                menuCls     : 'scrollable-menu menu-absolute',
                menuStyle   : 'min-width: 100%;max-height: 270px;',
                restoreMenuHeightAndTop: 220,
                store       : new Common.Collections.Fonts(),
                hint        : toolbar.tipFontName
            });
            textBarBtns.push(this.cmbFontName);
            toolbarController.fillFontsStore(this.cmbFontName);

            this.cmbFontSize = new Common.UI.ComboBox({
                el: $('#text-bar-font-size', container),
                cls: 'input-group-nr',
                style: 'width: 45px;',
                menuCls     : 'scrollable-menu menu-absolute',
                menuStyle: 'min-width: 45px;max-height: 270px;',
                restoreMenuHeightAndTop: 220,
                hint: toolbar.tipFontSize,
                data: [
                    {value: 8, displayValue: "8"},
                    {value: 9, displayValue: "9"},
                    {value: 10, displayValue: "10"},
                    {value: 11, displayValue: "11"},
                    {value: 12, displayValue: "12"},
                    {value: 14, displayValue: "14"},
                    {value: 16, displayValue: "16"},
                    {value: 18, displayValue: "18"},
                    {value: 20, displayValue: "20"},
                    {value: 22, displayValue: "22"},
                    {value: 24, displayValue: "24"},
                    {value: 26, displayValue: "26"},
                    {value: 28, displayValue: "28"},
                    {value: 36, displayValue: "36"},
                    {value: 48, displayValue: "48"},
                    {value: 72, displayValue: "72"},
                    {value: 96, displayValue: "96"}
                ]
            });
            this.cmbFontSize.setValue('');
            textBarBtns.push(this.cmbFontSize);

            this.btnBold = new Common.UI.Button({
                parentEl: $('#text-bar-bold', container),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-bold',
                enableToggle: true,
                hint: toolbar.textBold
            });
            textBarBtns.push(this.btnBold);

            this.btnItalic = new Common.UI.Button({
                parentEl: $('#text-bar-italic', container),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-italic',
                enableToggle: true,
                hint: toolbar.textItalic
            });
            textBarBtns.push(this.btnItalic);

            this.btnTextUnderline = new Common.UI.Button({
                parentEl: $('#text-bar-underline', container),
                cls         : 'btn-toolbar',
                iconCls     : 'toolbar__icon btn-underline',
                enableToggle: true,
                hint: toolbar.textUnderline
            });
            textBarBtns.push(this.btnTextUnderline);

            this.btnTextStrikeout = new Common.UI.Button({
                parentEl: $('#text-bar-strikeout', container),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-strikeout',
                enableToggle: true,
                hint: toolbar.textStrikeout
            });
            textBarBtns.push(this.btnTextStrikeout);

            this.btnSuperscript = new Common.UI.Button({
                parentEl: $('#text-bar-super', container),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-superscript',
                enableToggle: true,
                toggleGroup: 'superscriptGroup',
                hint: toolbar.textSuperscript
            });
            textBarBtns.push(this.btnSuperscript);

            this.btnSubscript = new Common.UI.Button({
                parentEl: $('#text-bar-sub', container),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-subscript',
                enableToggle: true,
                toggleGroup: 'superscriptGroup',
                hint: toolbar.textSubscript
            });
            textBarBtns.push(this.btnSubscript);

            var config = Common.define.simpleColorsConfig;
            this.btnFontColor = new Common.UI.ButtonColored({
                parentEl: $('#text-bar-textcolor', container),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-fontcolor',
                split: true,
                menu: true,
                colors: config.colors,
                color: '000000',
                dynamiccolors: config.dynamiccolors,
                themecolors: config.themecolors,
                effects: config.effects,
                columns: config.columns,
                paletteCls: config.cls,
                paletteWidth: config.paletteWidth,
                hint: toolbar.tipFontColor
            });
            textBarBtns.push(this.btnFontColor);
            this.btnFontColor.setMenu();
            this.mnuFontColorPicker = this.btnFontColor.getPicker();
            this.btnFontColor.currentColor = this.btnFontColor.color;

            return container;
        },

        createAnnotBar: function(annotBarBtns) {
            var container = $('<div id="annot-bar-container" style="position: absolute;">' +
                    '<div id="annot-bar-copy" style="display:inline-block;" class=""></div>' +
                    '<div class="separator margin-left-6"></div>' +
                    '<div id="annot-bar-add-comment" style="display:inline-block;" class="margin-left-13"></div>' +
                    '<div id="annot-bar-highlight" style="display:inline-block;" class="margin-left-4"></div>' +
                    '<div id="annot-bar-underline" style="display:inline-block;" class="margin-left-4"></div>' +
                    '<div id="annot-bar-strikeout" style="display:inline-block;" class="margin-left-4"></div>' +
                    '<div class="separator margin-left-6"></div>' +
                    '<div id="annot-bar-edit-text" class="margin-left-13" style="display:inline-block;"></div>' +
                    '</div>'),
                toolbarController = PDFE.getController('Toolbar'),
                toolbar = toolbarController.getView('Toolbar');

            this.btnCopy = new Common.UI.Button({
                parentEl: $('#annot-bar-copy', container),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-copy',
                hint: toolbar.tipCopy
            });
            annotBarBtns.push(this.btnCopy);

            this.btnAddComment = new Common.UI.Button({
                parentEl: $('#annot-bar-add-comment', container),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-add-comment',
                hint: toolbar.tipAddComment
            });
            annotBarBtns.push(this.btnAddComment);

            var config = Common.define.simpleColorsConfig;
            this.btnUnderline = new Common.UI.ButtonColored({
                parentEl: $('#annot-bar-underline', container),
                cls         : 'btn-toolbar',
                iconCls     : 'toolbar__icon btn-underline',
                enableToggle: true,
                allowDepress: true,
                split: true,
                menu: true,
                hideColorLine: true,
                colors: config.colors,
                color: '3D8A44',
                dynamiccolors: config.dynamiccolors,
                themecolors: config.themecolors,
                effects: config.effects,
                columns: config.columns,
                paletteCls: config.cls,
                paletteWidth: config.paletteWidth,
                storageSuffix: '-draw',
                hint: toolbar.textUnderline,
                type: AscPDF.ANNOTATIONS_TYPES.Underline
            });
            annotBarBtns.push(this.btnUnderline);
            this.btnUnderline.setMenu();
            this.mnuUnderlineColorPicker = this.btnUnderline.getPicker();
            this.btnUnderline.currentColor = this.btnUnderline.color;

            this.btnStrikeout = new Common.UI.ButtonColored({
                parentEl: $('#annot-bar-strikeout', container),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-strikeout',
                enableToggle: true,
                allowDepress: true,
                split: true,
                menu: true,
                hideColorLine: true,
                colors: config.colors,
                color: 'D43230',
                dynamiccolors: config.dynamiccolors,
                themecolors: config.themecolors,
                effects: config.effects,
                columns: config.columns,
                paletteCls: config.cls,
                paletteWidth: config.paletteWidth,
                storageSuffix: '-draw',
                hint: toolbar.textStrikeout,
                type: AscPDF.ANNOTATIONS_TYPES.Strikeout
            });
            annotBarBtns.push(this.btnStrikeout);
            this.btnStrikeout.setMenu();
            this.mnuStrikeoutColorPicker = this.btnStrikeout.getPicker();
            this.btnStrikeout.currentColor = this.btnStrikeout.color;

            this.btnHighlight = new Common.UI.ButtonColored({
                parentEl: $('#annot-bar-highlight', container),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-highlight',
                enableToggle: true,
                allowDepress: true,
                split: true,
                menu: true,
                colors: [
                    'FFFC54', '72F54A', '74F9FD', 'EB51F7', 'A900F9', 'EF8B3A', '7272FF', 'FF63A4', '1DFF92', '03DA18',
                    '249B01', 'C504D2', '0633D1', 'FFF7A0', 'FF0303', 'FFFFFF', 'D3D3D4', '969696', '606060', '000000'
                ],
                color: 'FFFC54',
                dynamiccolors: config.dynamiccolors,
                themecolors: config.themecolors,
                effects: config.effects,
                columns: config.columns,
                paletteCls: config.cls,
                paletteWidth: config.paletteWidth,
                storageSuffix: '-draw',
                hint: toolbar.textHighlight,
                type: AscPDF.ANNOTATIONS_TYPES.Highlight
            });
            annotBarBtns.push(this.btnHighlight);
            this.btnHighlight.setMenu();
            this.mnuHighlightColorPicker = this.btnHighlight.getPicker();
            this.btnHighlight.currentColor = this.btnHighlight.color;

            this.btnEditText = new Common.UI.Button({
                parentEl: $('#annot-bar-edit-text', container),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-magic-wand',
                caption: this.textRecognize,
                hint: this.tipRecognize
            });
            annotBarBtns.push(this.btnEditText);
            this.fireEvent('annotbar:create', [this.btnStrikeout, this.mnuStrikeoutColorPicker, this.btnUnderline, this.mnuUnderlineColorPicker, this.btnHighlight, this.mnuHighlightColorPicker]);

            return container;
        },

        focus: function() {
            var me = this;
            _.defer(function(){  me.cmpEl.focus(); }, 50);
        },

        SetDisabled: function(state, canProtect, fillFormMode) {
            this._isDisabled = state;
        },

        addEquationMenu: function() {},

        clearEquationMenu: function() {},

        equationCallback: function() {},

        initEquationMenu: function() {},

        updateCustomItems: function() {},

        clearCustomItems: function() {},

        parseIcons: function() {},

        textCopy: 'Copy',
        addCommentText: 'Add Comment',
        txtWarnUrl: 'Clicking this link can be harmful to your device and data.<br>Are you sure you want to continue?',
        mniImageFromFile: 'Image from File',
        mniImageFromUrl: 'Image from URL',
        mniImageFromStorage: 'Image from Storage',
        textUndo: 'Undo',
        textRedo: 'Redo',
        textCut: 'Cut',
        textPaste: 'Paste',
        textClearField: 'Clear field',
        advancedEquationText: 'Equation Settings',
        unicodeText: 'Unicode',
        latexText: 'LaTeX',
        currProfText: 'Current - Professional',
        currLinearText: 'Current - Linear',
        allProfText: 'All - Professional',
        allLinearText: 'All - Linear',
        hideEqToolbar: 'Hide Equation Toolbar',
        showEqToolbar: 'Show Equation Toolbar',
        insertRowAboveText      : 'Row Above',
        insertRowBelowText      : 'Row Below',
        insertColumnLeftText    : 'Column Left',
        insertColumnRightText   : 'Column Right',
        deleteText              : 'Delete',
        deleteRowText           : 'Delete Row',
        deleteColumnText        : 'Delete Column',
        deleteTableText         : 'Delete Table',
        mergeCellsText          : 'Merge Cells',
        splitCellsText          : 'Split Cell...',
        splitCellTitleText      : 'Split Cell',
        originalSizeText        : 'Actual Size',
        advancedImageText       : 'Image Advanced Settings',
        hyperlinkText           : 'Hyperlink',
        editHyperlinkText       : 'Edit Hyperlink',
        removeHyperlinkText     : 'Remove Hyperlink',
        txtPressLink            : 'Press {0} and click link',
        selectText              : 'Select',
        insertRowText           : 'Insert Row',
        insertColumnText        : 'Insert Column',
        rowText                 : 'Row',
        columnText              : 'Column',
        cellText                : 'Cell',
        tableText               : 'Table',
        aboveText               : 'Above',
        belowText               : 'Below',
        advancedTableText       : 'Table Advanced Settings',
        txtSelectAll            : 'Select All',
        textShapeAlignLeft      : 'Align Left',
        textShapeAlignRight     : 'Align Right',
        textShapeAlignCenter    : 'Align Center',
        textShapeAlignTop       : 'Align Top',
        textShapeAlignBottom    : 'Align Bottom',
        textShapeAlignMiddle    : 'Align Middle',
        textArrangeFront        : 'Bring To Front',
        textArrangeBack         : 'Send To Back',
        textArrangeForward      : 'Bring Forward',
        textArrangeBackward     : 'Send Backward',
        txtGroup                : 'Group',
        txtUngroup              : 'Ungroup',
        txtArrange              : 'Arrange',
        txtAlign                : 'Align',
        txtDistribHor           : 'Distribute Horizontally',
        txtDistribVert          : 'Distribute Vertically',
        cellAlignText           : 'Cell Vertical Alignment',
        advancedShapeText       : 'Shape Advanced Settings',
        textSaveAsPicture       : 'Save as picture',
        vertAlignText           : 'Vertical Alignment',
        advancedParagraphText   : 'Text Advanced Settings',
        insertText: 'Insert',
        directionText: 'Text Direction',
        directHText: 'Horizontal',
        direct90Text: 'Rotate Text Down',
        direct270Text: 'Rotate Text Up',
        txtRemoveAccentChar: 'Remove accent character',
        txtBorderProps: 'Borders property',
        txtHideTop: 'Hide top border',
        txtHideBottom: 'Hide bottom border',
        txtHideLeft: 'Hide left border',
        txtHideRight: 'Hide right border',
        txtHideHor: 'Hide horizontal line',
        txtHideVer: 'Hide vertical line',
        txtHideLT: 'Hide left top line',
        txtHideLB: 'Hide left bottom line',
        txtAddTop: 'Add top border',
        txtAddBottom: 'Add bottom border',
        txtAddLeft: 'Add left border',
        txtAddRight: 'Add right border',
        txtAddHor: 'Add horizontal line',
        txtAddVer: 'Add vertical line',
        txtAddLT: 'Add left top line',
        txtAddLB: 'Add left bottom line',
        txtRemoveBar: 'Remove bar',
        txtOverbar: 'Bar over text',
        txtUnderbar: 'Bar under text',
        txtRemScripts: 'Remove scripts',
        txtRemSubscript: 'Remove subscript',
        txtRemSuperscript: 'Remove superscript',
        txtScriptsAfter: 'Scripts after text',
        txtScriptsBefore: 'Scripts before text',
        txtFractionStacked: 'Change to stacked fraction',
        txtFractionSkewed: 'Change to skewed fraction',
        txtFractionLinear: 'Change to linear fraction',
        txtRemFractionBar: 'Remove fraction bar',
        txtAddFractionBar: 'Add fraction bar',
        txtRemLimit: 'Remove limit',
        txtLimitOver: 'Limit over text',
        txtLimitUnder: 'Limit under text',
        txtHidePlaceholder: 'Hide placeholder',
        txtShowPlaceholder: 'Show placeholder',
        txtMatrixAlign: 'Matrix alignment',
        txtColumnAlign: 'Column alignment',
        txtTop: 'Top',
        txtBottom: 'Bottom',
        txtInsertEqBefore: 'Insert equation before',
        txtInsertEqAfter: 'Insert equation after',
        txtDeleteEq: 'Delete equation',
        txtLimitChange: 'Change limits location',
        txtHideTopLimit: 'Hide top limit',
        txtShowTopLimit: 'Show top limit',
        txtHideBottomLimit: 'Hide bottom limit',
        txtShowBottomLimit: 'Show bottom limit',
        txtInsertArgBefore: 'Insert argument before',
        txtInsertArgAfter: 'Insert argument after',
        txtDeleteArg: 'Delete argument',
        txtHideOpenBracket: 'Hide opening bracket',
        txtShowOpenBracket: 'Show opening bracket',
        txtHideCloseBracket: 'Hide closing bracket',
        txtShowCloseBracket: 'Show closing bracket',
        txtStretchBrackets: 'Stretch brackets',
        txtMatchBrackets: 'Match brackets to argument height',
        txtGroupCharOver: 'Char over text',
        txtGroupCharUnder: 'Char under text',
        txtDeleteGroupChar: 'Delete char',
        txtHideDegree: 'Hide degree',
        txtShowDegree: 'Show degree',
        txtIncreaseArg: 'Increase argument size',
        txtDecreaseArg: 'Decrease argument size',
        txtInsertBreak: 'Insert manual break',
        txtDeleteBreak: 'Delete manual break',
        txtAlignToChar: 'Align to character',
        txtDeleteRadical: 'Delete radical',
        txtDeleteChars: 'Delete enclosing characters',
        txtDeleteCharsAndSeparators: 'Delete enclosing characters and separators',
        alignmentText: 'Alignment',
        leftText: 'Left',
        rightText: 'Right',
        centerText: 'Center',
        textDistributeRows: 'Distribute rows',
        textDistributeCols: 'Distribute columns',
        textReplace:    'Replace image',
        textFromUrl:    'From URL',
        textFromFile:   'From File',
        textRotate270: 'Rotate 90° Counterclockwise',
        textRotate90: 'Rotate 90° Clockwise',
        textFlipV: 'Flip Vertically',
        textFlipH: 'Flip Horizontally',
        textRotate: 'Rotate',
        textCrop: 'Crop',
        textCropFill: 'Fill',
        textCropFit: 'Fit',
        textFromStorage: 'From Storage',
        textEditPoints: 'Edit Points',
        confirmAddFontName: 'The font you are going to save is not available on the current device.<br>The text style will be displayed using one of the device fonts, the saved font will be used when it is available.<br>Do you want to continue?',
        txtDeletePage: 'Delete page',
        txtRotateRight: 'Rotate page right',
        txtRotateLeft: 'Rotate page left',
        removeCommentText: 'Remove',
        textRecognize: 'Recognize text',
        tipRecognize: 'Recognize text',
        txtNewPageBefore: 'Insert blank page before',
        txtNewPageAfter: 'Insert blank page after',

    }, PDFE.Views.DocumentHolder || {}));
});