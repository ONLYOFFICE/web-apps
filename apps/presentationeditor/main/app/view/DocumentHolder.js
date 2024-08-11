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
define([
    'jquery',
    'underscore',
    'backbone',
    'gateway',
    'common/main/lib/util/utils',
    'common/main/lib/component/Menu',
//    'common/main/lib/view/InsertTableDialog',
], function ($, _, Backbone, gateway) { 'use strict';

    PE.Views.DocumentHolder =  Backbone.View.extend(_.extend({
        el: '#editor_sdk',

        // Compile our stats template
        template: null,

        // Delegated events for creating new items, and clearing completed ones.
        events: {
        },

        initialize: function () {
            var me = this;

            me.slidesCount = 0;
            me._currentMathObj = undefined;
            me._currentParaObjDisabled = false;
            me._currentSpellObj = undefined;
            me._currentTranslateObj = this;
            me._currLang        = {};
            me._state = {unitsChanged: true};
            me._isDisabled = false;
            me._preventCustomClick = null;
            me._hasCustomItems = false;

            Common.NotificationCenter.on('settings:unitschanged', _.bind(this.unitsChanged, this));
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

        focus: function() {
            var me = this;
            _.defer(function(){  me.cmpEl.focus(); }, 50);
        },

        changeLanguageMenu: function(menu) {
            var me = this;
            if (me._currLang.id===null || me._currLang.id===undefined) {
                menu.clearAll();
            } else {
                var index = _.findIndex(menu.items, {langid: me._currLang.id});
                (index>-1) && !menu.items[index].checked && menu.setChecked(index, true);
            }
        },

        addWordVariants: function(isParagraph) {
            var me = this;
            if (!me.textMenu || !me.textMenu.isVisible() && !me.tableMenu.isVisible()) return;

            if (_.isUndefined(isParagraph)) {
                isParagraph = me.textMenu.isVisible();
            }

            me.clearWordVariants(isParagraph);

            var moreMenu  = (isParagraph) ? me.menuSpellMorePara : me.menuSpellMoreTable;
            var spellMenu = (isParagraph) ? me.menuSpellPara : me.menuSpellTable;
            var arr = [],
                arrMore = [];
            var variants = me._currentSpellObj.get_Variants();

            if (variants.length > 0) {
                moreMenu.setVisible(variants.length > 3);
                moreMenu.setDisabled(me._currentParaObjDisabled);

                _.each(variants, function(variant, index) {
                    var mnu = new Common.UI.MenuItem({
                        caption     : variant,
                        spellword   : true,
                        disabled    : me._currentParaObjDisabled
                    }).on('click', function(item, e) {
                        if (me.api) {
                            me.api.asc_replaceMisspelledWord(item.caption, me._currentSpellObj);
                            me.fireEvent('editcomplete', me);
                        }
                    });

                    (index < 3) ? arr.push(mnu) : arrMore.push(mnu);
                });

                if (arr.length > 0) {
                    if (isParagraph) {
                        _.each(arr, function(variant, index){
                            me.textMenu.insertItem(index, variant);
                        })
                    } else {
                        _.each(arr, function(variant, index){
                            me.menuSpellCheckTable.menu.insertItem(index, variant);
                        })
                    }
                }

                if (arrMore.length > 0) {
                    _.each(arrMore, function(variant, index){
                        moreMenu.menu.addItem(variant);
                    });
                }

                spellMenu.setVisible(false);
            } else {
                moreMenu.setVisible(false);
                spellMenu.setVisible(true);
                spellMenu.setCaption(me.noSpellVariantsText);
            }
        },

        clearWordVariants: function(isParagraph) {
            var me = this;
            var spellMenu = (isParagraph) ? me.textMenu : me.menuSpellCheckTable.menu;

            for (var i = 0; i < spellMenu.items.length; i++) {
                if (spellMenu.items[i].options.spellword) {
                    if (spellMenu.checkeditem == spellMenu.items[i]) {
                        spellMenu.checkeditem = undefined;
                        spellMenu.activeItem  = undefined;
                    }

                    spellMenu.removeItem(spellMenu.items[i]);
                    i--;
                }
            }
            (isParagraph) ? me.menuSpellMorePara.menu.removeAll() : me.menuSpellMoreTable.menu.removeAll();

            me.menuSpellMorePara.menu.checkeditem   = undefined;
            me.menuSpellMorePara.menu.activeItem    = undefined;
            me.menuSpellMoreTable.menu.checkeditem  = undefined;
            me.menuSpellMoreTable.menu.activeItem   = undefined;
        },

        onSlidePickerShowAfter: function(picker) {
            if (!picker._needRecalcSlideLayout) return;

            if (picker.cmpEl && picker.dataViewItems.length>0) {
                var dataViewItems = picker.dataViewItems,
                    el = $(dataViewItems[0].el),
                    itemW = el.outerWidth() + parseInt(el.css('margin-left')) + parseInt(el.css('margin-right')),
                    columnCount = Math.floor(picker.options.restoreWidth / itemW + 0.5) || 1, // try to use restore width
                    col = 0, maxHeight = 0;

                picker.cmpEl.width(itemW * columnCount + 11);

                for (var i=0; i<dataViewItems.length; i++) {
                    var div = $(dataViewItems[i].el).find('.title'),
                        height = div.height();

                    if (height>maxHeight)
                        maxHeight = height;
                    else
                       div.css({'height' : maxHeight });

                    col++;
                    if (col>columnCount-1) { col = 0; maxHeight = 0;}
                }
                picker._needRecalcSlideLayout = false;
            }
        },

        createDelayedElementsViewer: function() {},

        createDelayedElements: function() {},

        setLanguages: function(langs){
            var me = this;
            if (langs && langs.length > 0 && me.langParaMenu && me.langTableMenu) {
                var arrPara = [], arrTable = [];
                _.each(langs, function(lang) {
                    var item = {
                        caption     : lang.displayValue,
                        value       : lang.value,
                        checkable   : true,
                        langid      : lang.code,
                        spellcheck   : lang.spellcheck
                    };
                    arrPara.push(item);
                    arrTable.push(_.clone(item));
                });
                me.langParaMenu.menu.resetItems(arrPara);
                me.langTableMenu.menu.resetItems(arrTable);
            }
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

        unitsChanged: function(m) {
            this._state.unitsChanged = true;
        },

        SetDisabled: function(state) {
            this._isDisabled = state;
        },

        addEquationMenu: function() {},

        clearEquationMenu: function() {},

        equationCallback: function() {},

        initEquationMenu: function() {},

        updateCustomItems: function() {},

        clearCustomItems: function() {},

        parseIcons: function() {},

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
        txtNewSlide             : 'New Slide',
        txtDuplicateSlide       : 'Duplicate Slide',
        txtDeleteSlide          : 'Delete Slide',
        txtBackground           : 'Background',
        txtChangeLayout         : 'Change Layout',
        txtPreview              : 'Start slideshow',
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
        txtSlide                : 'Slide',
        cellAlignText           : 'Cell Vertical Alignment',
        advancedShapeText       : 'Shape Advanced Settings',
        textSaveAsPicture       : 'Save as picture',
        /** coauthoring begin **/
        addCommentText          : 'Add Comment',
        /** coauthoring end **/
        editChartText           : 'Edit Data',
        vertAlignText           : 'Vertical Alignment',
        advancedParagraphText   : 'Text Advanced Settings',
        tipIsLocked             : "This element is currently being edited by another user.",
        textNextPage            : 'Next Slide',
        textPrevPage            : 'Previous Slide',
        insertText: 'Insert',
        textCopy: 'Copy',
        textPaste: 'Paste',
        textCut: 'Cut',
        textEditObject: 'Edit object',
        textSlideSettings: 'Slide Settings',
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
        loadSpellText: 'Loading variants...',
        ignoreAllSpellText: 'Ignore All',
        ignoreSpellText: 'Ignore',
        noSpellVariantsText: 'No variants',
        moreText: 'More variants...',
        spellcheckText: 'Spellcheck',
        langText: 'Select Language',
        textUndo: 'Undo',
        txtSlideHide: 'Hide Slide',
        txtChangeTheme: 'Change Theme',
        txtKeepTextOnly: 'Keep text only',
        txtPastePicture: 'Picture',
        txtPasteSourceFormat: 'Keep source formatting',
        txtPasteDestFormat: 'Use destination theme',
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
        toDictionaryText: 'Add to Dictionary',
        txtPrintSelection: 'Print Selection',
        addToLayoutText: 'Add to Layout',
        txtResetLayout: 'Reset Slide',
        mniCustomTable: 'Insert Custom Table',
        textFromStorage: 'From Storage',
        txtWarnUrl: 'Clicking this link can be harmful to your device and data.<br>Are you sure you want to continue?',
        textEditPoints: 'Edit Points',
        txtMoveSlidesToEnd: 'Move Slide to End',
        txtMoveSlidesToStart: 'Move Slide to Beginning',
        advancedChartText   : 'Chart Advanced Settings',
        textGuides: 'Guides',
        tipGuides: 'Show guides',
        textShowGuides: 'Show Guides',
        textAddVGuides: 'Add Vertical Guide',
        textAddHGuides: 'Add Horizontal Guide',
        textSmartGuides: 'Smart Guides',
        textClearGuides: 'Clear Guides',
        textGridlines: 'Gridlines',
        textShowGridlines: 'Show Gridlines',
        textSnapObjects: 'Snap Object to Grid',
        textCm: 'cm',
        textCustom: 'Custom',
        textRulers: 'Rulers',
        textDeleteGuide: 'Delete Guide',
        advancedEquationText: 'Equation Settings',
        unicodeText: 'Unicode',
        latexText: 'LaTeX',
        currProfText: 'Current - Professional',
        currLinearText: 'Current - Linear',
        allProfText: 'All - Professional',
        allLinearText: 'All - Linear',
        hideEqToolbar: 'Hide Equation Toolbar',
        showEqToolbar: 'Show Equation Toolbar',
        txtInsImage: 'Insert image from File',
        txtInsImageUrl: 'Insert image from URL',
        txtInsChart: 'Insert chart',
        txtInsTable: 'Insert table',
        txtInsVideo: 'Insert video',
        txtInsAudio: 'Insert audio',
        txtInsSmartArt: 'Insert SmartArt',
        textStartOnClick: 'Start On Click',
        textStartWithPrevious: 'Start With Previous',
        textStartAfterPrevious: 'Start After Previous',
        textRemove: 'Remove',
        textInsertSlideMaster: 'Insert Slide Master',
        textInsertLayout: 'Insert Layout',
        textDuplicateSlideMaster: 'Duplicate Slide Master',
        textDeleteMaster: 'Delete Master',
        textDuplicateLayout: 'Duplicate Layout',
        textDeleteLayout: 'Delete Layout'

    }, PE.Views.DocumentHolder || {}));
});