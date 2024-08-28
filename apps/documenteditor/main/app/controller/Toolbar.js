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
 *  Toolbar.js
 *
 *  Toolbar Controller
 *
 *  Created on 1/15/14
 *
 */

define([
    'core',
    'common/main/lib/component/Window',
    'documenteditor/main/app/view/Toolbar',
    'documenteditor/main/app/controller/PageLayout',
], function () {
    'use strict';

    DE.Controllers.Toolbar = Backbone.Controller.extend(_.extend({
        models: [],
        collections: [],
        controllers: [],
        views: [
            'Toolbar'
        ],

        initialize: function() {
            this._state = {
                activated: false,
                bullets: {
                    format: Asc.c_oAscNumberingFormat.None,
                    numberingInfo: ''
                },
                prstyle: undefined,
                prcontrolsdisable:undefined,
                dropcap: Asc.c_oAscDropCap.None,
                clrhighlight: undefined,
                clrtext: undefined,
                pgsize: [0, 0],
                linespace: undefined,
                pralign: undefined,
                clrback: undefined,
                valign: undefined,
                can_undo: undefined,
                can_redo: undefined,
                bold: undefined,
                italic: undefined,
                strike: undefined,
                underline: undefined,
                pgorient: undefined,
                lock_doc: undefined,
                can_copycut: undefined,
                pgmargins: undefined,
                fontsize: undefined,
                type_fontsize: undefined,
                in_equation: false,
                in_chart: false,
                linenum_apply: Asc.c_oAscSectionApplyType.All,
                suppress_num: undefined
            };
            this.flg = {};
            this.diagramEditor = null;
            this._isAddingShape = false;
            this.editMode = true;
            this.binding = {};

            this.addListeners({
                'Toolbar': {
                    'insert:break'      : this.onClickPageBreak,
                    'change:compact'    : this.onClickChangeCompact,
                    'home:open'         : this.onHomeOpen,
                    'add:chart'         : this.onSelectChart,
                    'insert:textart'    : this.onInsertTextart,
                    'insert:smartart'   : this.onInsertSmartArt,
                    'smartart:mouseenter': this.mouseenterSmartArt,
                    'smartart:mouseleave': this.mouseleaveSmartArt,
                    'tab:active': this.onActiveTab,
                    'tab:collapse': this.onTabCollapse
                },
                'FileMenu': {
                    'menu:hide': this.onFileMenu.bind(this, 'hide'),
                    'menu:show': this.onFileMenu.bind(this, 'show')
                },
                'Common.Views.Header': {
                    'print': function (opts) {
                        var _main = this.getApplication().getController('Main');
                        _main.onPrint();
                    },
                    'print-quick': function (opts) {
                        var _main = this.getApplication().getController('Main');
                        _main.onPrintQuick();
                    },
                    'save': function (opts) {
                        this.tryToSave();
                    },
                    'undo': this.onUndo,
                    'redo': this.onRedo,
                    'downloadas': function (opts) {
                        var _main = this.getApplication().getController('Main');
                        var _file_type = _main.document.fileType,
                            _format;
                        if ( !!_file_type ) {
                            if ( /^pdf|xps|oxps|djvu/i.test(_file_type) && !_main.appOptions.isPDFForm ) {
                                _main.api.asc_DownloadOrigin();
                                return;
                            } else {
                                _format = Asc.c_oAscFileType[ _file_type.toUpperCase() ];
                            }
                        }

                        var _supported = [
                            Asc.c_oAscFileType.TXT,
                            Asc.c_oAscFileType.RTF,
                            Asc.c_oAscFileType.ODT,
                            Asc.c_oAscFileType.DOCX,
                            Asc.c_oAscFileType.HTML,
                            Asc.c_oAscFileType.PDFA,
                            Asc.c_oAscFileType.DOTX,
                            Asc.c_oAscFileType.OTT,
                            Asc.c_oAscFileType.FB2,
                            Asc.c_oAscFileType.EPUB,
                            Asc.c_oAscFileType.DOCM
                        ];
                        if (_main.appOptions.canFeatureForms) {
                            _supported = _supported.concat([Asc.c_oAscFileType.DOCXF]);
                        }

                        if ( !_format || _supported.indexOf(_format) < 0 )
                            _format = Asc.c_oAscFileType.PDF;

                        _main.api.asc_DownloadAs(new Asc.asc_CDownloadOptions(_format));
                    },
                    'go:editor': function() {
                        Common.Gateway.requestEditRights();
                    }
                },
                'ViewTab': {
                    'toolbar:setcompact': this.onChangeCompactView.bind(this)
                },
                'DocumentHolder': {
                    'list:settings': this.onMarkerSettingsClick.bind(this),
                    'field:edit': this.onInsFieldClick.bind(this, 'edit')
                },
                'Common.Views.ReviewChanges': {
                    'collaboration:mailmerge':  _.bind(this.onSelectRecepientsClick, this)
                }
            });

            var me = this;

            var checkInsertAutoshape =  function(e) {
                var cmp = $(e.target),
                    cmp_sdk = cmp.closest('#editor_sdk'),
                    btn_id = cmp.closest('button').attr('id');
                if (btn_id===undefined)
                    btn_id = cmp.closest('.btn-group').attr('id');

                if (cmp.attr('id') != 'editor_sdk' && cmp_sdk.length<=0) {
                    if ( me.toolbar.btnInsertText.pressed && btn_id != me.toolbar.btnInsertText.id ||
                        me.toolbar.btnInsertShape.pressed && btn_id != me.toolbar.btnInsertShape.id) {
                        me._isAddingShape   = false;

                        me._addAutoshape(false);
                        me.toolbar.btnInsertShape.toggle(false, true);
                        me.toolbar.btnInsertText.toggle(false, true);

                        Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                    } else if ( me.toolbar.btnInsertShape.pressed && btn_id == me.toolbar.btnInsertShape.id) {
                        _.defer(function(){
                            me.api.StartAddShape('', false);
                            Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                        }, 100);
                    }
                }
            };

            this.onApiEndAddShape = function() {
                this.toolbar.fireEvent('insertshape', this.toolbar);

                if (this.toolbar.btnInsertShape.pressed)
                    this.toolbar.btnInsertShape.toggle(false, true);

                if (this.toolbar.btnInsertText.pressed) {
                    this.toolbar.btnInsertText.toggle(false, true);
                    this.toolbar.btnInsertText.menu.clearAll();
                }

                $(document.body).off('mouseup', checkInsertAutoshape);
            };

            this._addAutoshape =  function(isstart, type) {
                if (this.api) {
                    if (isstart) {
                        this.api.StartAddShape(type, true);
                        $(document.body).on('mouseup', checkInsertAutoshape);
                    } else {
                        this.api.StartAddShape('', false);
                        $(document.body).off('mouseup', checkInsertAutoshape);
                    }
                }
            };

//            Common.NotificationCenter.on('menu:afterkeydown', _.bind(this.onAfterKeydownMenu, this));
            Common.NotificationCenter.on('style:commitsave', _.bind(this.onSaveStyle, this));
            Common.NotificationCenter.on('style:commitchange', _.bind(this.onUpdateStyle, this));
            Common.NotificationCenter.on('toolbar:collapse', _.bind(function () {
                this.toolbar.collapse();
            }, this));
        },

        onLaunch: function() {
            var me = this;

            // Create toolbar view
            this.toolbar = this.createView('Toolbar');

            me.toolbar.on('render:before', function (cmp) {
            });

            Common.NotificationCenter.on('app:ready', me.onAppReady.bind(me));
            Common.NotificationCenter.on('app:face', me.onAppShowed.bind(me));
        },

        setMode: function(mode) {
            this.mode = mode;
            this.toolbar.applyLayout(mode);
            !this.mode.isPDFForm && Common.UI.TooltipManager.addTips({
                'pageColor' : {name: 'de-help-tip-page-color', placement: 'bottom-left', text: this.helpPageColor, header: this.helpPageColorHeader, target: '#slot-btn-pagecolor', automove: true}
            });
        },

        attachRestrictedEditFormsUIEvents: function(toolbar) {
            toolbar.btnPrint.on('click',                                _.bind(this.onPrint, this));
            toolbar.btnPrint.on('disabled',                             _.bind(this.onBtnChangeState, this, 'print:disabled'));
            toolbar.btnSave.on('click',                                 _.bind(this.tryToSave, this));
            toolbar.btnUndo.on('click',                                 _.bind(this.onUndo, this));
            toolbar.btnUndo.on('disabled',                              _.bind(this.onBtnChangeState, this, 'undo:disabled'));
            toolbar.btnRedo.on('click',                                 _.bind(this.onRedo, this));
            toolbar.btnRedo.on('disabled',                              _.bind(this.onBtnChangeState, this, 'redo:disabled'));
            toolbar.btnCopy.on('click',                                 _.bind(this.onCopyPaste, this, 'copy'));
            toolbar.btnPaste.on('click',                                _.bind(this.onCopyPaste, this, 'paste'));
            toolbar.btnCut.on('click',                                  _.bind(this.onCopyPaste, this, 'cut'));
            toolbar.btnSelectAll.on('click',                            _.bind(this.onSelectAll, this));
            toolbar.btnSelectTool.on('toggle',                          _.bind(this.onSelectTool, this, 'select'));
            toolbar.btnHandTool.on('toggle',                            _.bind(this.onSelectTool, this, 'hand'));
            toolbar.btnEditMode.on('click', function (btn, e) {
                Common.Gateway.requestEditRights();
            });
            Common.NotificationCenter.on('leftmenu:save',               _.bind(this.tryToSave, this));
            this.onBtnChangeState('undo:disabled', toolbar.btnUndo, toolbar.btnUndo.isDisabled());
            this.onBtnChangeState('redo:disabled', toolbar.btnRedo, toolbar.btnRedo.isDisabled());
        },

        attachUIEvents: function(toolbar) {
            /**
             * UI Events
             */

            toolbar.btnPrint.on('click',                                _.bind(this.onPrint, this));
            toolbar.btnPrint.on('disabled',                             _.bind(this.onBtnChangeState, this, 'print:disabled'));
            toolbar.btnSave.on('click',                                 _.bind(this.tryToSave, this));
            toolbar.btnUndo.on('click',                                 _.bind(this.onUndo, this));
            toolbar.btnUndo.on('disabled',                              _.bind(this.onBtnChangeState, this, 'undo:disabled'));
            toolbar.btnRedo.on('click',                                 _.bind(this.onRedo, this));
            toolbar.btnRedo.on('disabled',                              _.bind(this.onBtnChangeState, this, 'redo:disabled'));
            toolbar.btnCopy.on('click',                                 _.bind(this.onCopyPaste, this, 'copy'));
            toolbar.btnPaste.on('click',                                _.bind(this.onCopyPaste, this, 'paste'));
            toolbar.btnCut.on('click',                                  _.bind(this.onCopyPaste, this, 'cut'));
            toolbar.btnSelectAll.on('click',                            _.bind(this.onSelectAll, this));
            toolbar.btnReplace.on('click',                              _.bind(this.onReplace, this));
            toolbar.btnIncFontSize.on('click',                          _.bind(this.onIncrease, this));
            toolbar.btnDecFontSize.on('click',                          _.bind(this.onDecrease, this));
            toolbar.mnuChangeCase.on('item:click',                      _.bind(this.onChangeCase, this));
            toolbar.btnBold.on('click',                                 _.bind(this.onBold, this));
            toolbar.btnItalic.on('click',                               _.bind(this.onItalic, this));
            toolbar.btnUnderline.on('click',                            _.bind(this.onUnderline, this));
            toolbar.btnStrikeout.on('click',                            _.bind(this.onStrikeout, this));
            toolbar.btnSuperscript.on('click',                          _.bind(this.onSuperscript, this));
            toolbar.btnSubscript.on('click',                            _.bind(this.onSubscript, this));
            toolbar.btnAlignLeft.on('click',                            _.bind(this.onHorizontalAlign, this, 1));
            toolbar.btnAlignCenter.on('click',                          _.bind(this.onHorizontalAlign, this, 2));
            toolbar.btnAlignRight.on('click',                           _.bind(this.onHorizontalAlign, this, 0));
            toolbar.btnAlignJust.on('click',                            _.bind(this.onHorizontalAlign, this, 3));
            toolbar.btnDecLeftOffset.on('click',                        _.bind(this.onDecOffset, this));
            toolbar.btnIncLeftOffset.on('click',                        _.bind(this.onIncOffset, this));
            toolbar.btnMarkers.on('click',                              _.bind(this.onMarkers, this));
            toolbar.btnNumbers.on('click',                              _.bind(this.onNumbers, this));
            toolbar.cmbFontName.on('selected',                          _.bind(this.onFontNameSelect, this));
            toolbar.cmbFontName.on('show:after',                        _.bind(this.onComboOpen, this, true));
            toolbar.cmbFontName.on('hide:after',                        _.bind(this.onHideMenus, this));
            toolbar.cmbFontName.on('combo:blur',                        _.bind(this.onComboBlur, this));
            toolbar.cmbFontName.on('combo:focusin',                     _.bind(this.onComboOpen, this, false));
            toolbar.cmbFontSize.on('selected',                          _.bind(this.onFontSizeSelect, this));
            toolbar.cmbFontSize.on('changed:before',                    _.bind(this.onFontSizeChanged, this, true));
            toolbar.cmbFontSize.on('changed:after',                     _.bind(this.onFontSizeChanged, this, false));
            toolbar.cmbFontSize.on('combo:blur',                        _.bind(this.onComboBlur, this));
            toolbar.cmbFontSize.on('combo:focusin',                     _.bind(this.onComboOpen, this, false));
            toolbar.cmbFontSize.on('show:after',                        _.bind(this.onComboOpen, this, true));
            toolbar.cmbFontSize.on('hide:after',                        _.bind(this.onHideMenus, this));
            toolbar.mnuMarkersPicker.on('item:click',                   _.bind(this.onSelectBullets, this, toolbar.btnMarkers));
            toolbar.mnuNumbersPicker.on('item:click',                   _.bind(this.onSelectBullets, this, toolbar.btnNumbers));
            toolbar.mnuMultilevelPicker.on('item:click',                _.bind(this.onSelectBullets, this, toolbar.btnMultilevels));
            toolbar.btnMarkers.menu.on('show:after',                    _.bind(this.onListShowAfter, this, 0, toolbar.mnuMarkersPicker));
            toolbar.btnNumbers.menu.on('show:after',                    _.bind(this.onListShowAfter, this, 1, toolbar.mnuNumbersPicker));
            toolbar.btnMultilevels.menu.on('show:after',                _.bind(this.onListShowAfter, this, 2, toolbar.mnuMultilevelPicker));
            toolbar.mnuMarkerSettings.on('click',                       _.bind(this.onMarkerSettingsClick, this, 0));
            toolbar.mnuNumberSettings.on('click',                       _.bind(this.onMarkerSettingsClick, this, 1));
            toolbar.mnuMultilevelSettings.on('click',                   _.bind(this.onMarkerSettingsClick, this, 2));
            toolbar.mnuMarkerChangeLevel && toolbar.mnuMarkerChangeLevel.menu &&
            toolbar.mnuMarkerChangeLevel.menu.on('show:after',          _.bind(this.onChangeLevelShowAfter, this, 0));
            toolbar.mnuMarkerChangeLevel.menu.on('item:click',          _.bind(this.onChangeLevelClick, this, 0));
            toolbar.mnuNumberChangeLevel && toolbar.mnuNumberChangeLevel.menu &&
            toolbar.mnuNumberChangeLevel.menu.on('show:after',          _.bind(this.onChangeLevelShowAfter, this, 1));
            toolbar.mnuNumberChangeLevel.menu.on('item:click',          _.bind(this.onChangeLevelClick, this, 1));
            toolbar.mnuMultiChangeLevel && toolbar.mnuMultiChangeLevel.menu &&
            toolbar.mnuMultiChangeLevel.menu.on('show:after',           _.bind(this.onChangeLevelShowAfter, this, 2));
            toolbar.mnuMultiChangeLevel.menu.on('item:click',           _.bind(this.onChangeLevelClick, this, 2));
            toolbar.btnHighlightColor.on('click',                       _.bind(this.onBtnHighlightColor, this));
            toolbar.btnFontColor.on('click',                            _.bind(this.onBtnFontColor, this));
            toolbar.btnFontColor.on('color:select',                     _.bind(this.onSelectFontColor, this));
            toolbar.btnFontColor.on('auto:select',                      _.bind(this.onAutoFontColor, this));
            toolbar.btnFontColor.on('eyedropper:start',                 _.bind(this.onEyedropperStart, this));
            toolbar.btnFontColor.on('eyedropper:end',                   _.bind(this.onEyedropperEnd, this));
            toolbar.btnParagraphColor.on('click',                       _.bind(this.onBtnParagraphColor, this));
            toolbar.btnParagraphColor.on('color:select',                _.bind(this.onParagraphColorPickerSelect, this));
            toolbar.btnParagraphColor.on('eyedropper:start',            _.bind(this.onEyedropperStart, this));
            toolbar.btnParagraphColor.on('eyedropper:end',              _.bind(this.onEyedropperEnd, this));
            this.mode.isEdit && Common.NotificationCenter.on('eyedropper:start', _.bind(this.eyedropperStart, this));
            toolbar.mnuHighlightColorPicker.on('select',                _.bind(this.onSelectHighlightColor, this));
            toolbar.mnuHighlightTransparent.on('click',                 _.bind(this.onHighlightTransparentClick, this));
            toolbar.mnuLineSpace.on('item:toggle',                      _.bind(this.onLineSpaceToggle, this));
            toolbar.mnuLineSpace.on('item:click',                       _.bind(this.onLineSpaceClick, this));
            toolbar.mnuLineSpace.on('show:after',                       _.bind(this.onLineSpaceShow, this));
            toolbar.mnuNonPrinting.on('item:toggle',                    _.bind(this.onMenuNonPrintingToggle, this));
            toolbar.btnShowHidenChars.on('toggle',                      _.bind(this.onNonPrintingToggle, this));
            toolbar.mnuTablePicker.on('select',                         _.bind(this.onTablePickerSelect, this));
            toolbar.mnuInsertTable.on('item:click',                     _.bind(this.onInsertTableClick, this));
            toolbar.mnuInsertTable.on('show:after',                     _.bind(this.onInsertTableShow, this));
            toolbar.mnuInsertImage.on('item:click',                     _.bind(this.onInsertImageClick, this));
            toolbar.btnInsertText.on('click',                           _.bind(this.onBtnInsertTextClick, this));
            toolbar.btnInsertText.menu.on('item:click',                 _.bind(this.onMenuInsertTextClick, this));
            toolbar.btnInsertShape.menu.on('hide:after',                _.bind(this.onInsertShapeHide, this));
            toolbar.btnDropCap.menu.on('item:click',                    _.bind(this.onDropCapSelect, this));
            toolbar.btnContentControls.menu.on('item:click',            _.bind(this.onControlsSelect, this));
            toolbar.mnuDropCapAdvanced.on('click',                      _.bind(this.onDropCapAdvancedClick, this, false));
            toolbar.btnColumns.menu.on('item:click',                    _.bind(this.onColumnsSelect, this));
            toolbar.btnPageOrient.menu.on('item:click',                 _.bind(this.onPageOrientSelect, this));
            toolbar.btnPageMargins.menu.on('item:click',                _.bind(this.onPageMarginsSelect, this));
            toolbar.btnWatermark.menu.on('item:click',                  _.bind(this.onWatermarkSelect, this));
            toolbar.btnClearStyle.on('click',                           _.bind(this.onClearStyleClick, this));
            toolbar.btnCopyStyle.on('toggle',                           _.bind(this.onCopyStyleToggle, this));
            toolbar.mnuPageSize.on('item:click',                        _.bind(this.onPageSizeClick, this));
            toolbar.mnuColorSchema.on('item:click',                     _.bind(this.onColorSchemaClick, this));
            toolbar.mnuColorSchema.on('show:after',                     _.bind(this.onColorSchemaShow, this));
            toolbar.mnuPageNumberPosPicker.on('item:click',             _.bind(this.onInsertPageNumberClick, this));
            toolbar.btnEditHeader.menu.on('item:click',                 _.bind(this.onEditHeaderFooterClick, this));
            toolbar.btnInsDateTime.on('click',                          _.bind(this.onInsDateTimeClick, this));
            toolbar.btnInsField.on('click',                             _.bind(this.onInsFieldClick, this, 'add'));
            toolbar.mnuPageNumCurrentPos.on('click',                    _.bind(this.onPageNumCurrentPosClick, this));
            toolbar.mnuInsertPageCount.on('click',                      _.bind(this.onInsertPageCountClick, this));
            toolbar.btnBlankPage.on('click',                            _.bind(this.onBtnBlankPageClick, this));
            toolbar.listStyles.on('click',                              _.bind(this.onListStyleSelect, this));
            toolbar.listStyles.on('contextmenu',                        _.bind(this.onListStyleContextMenu, this));
            toolbar.styleMenu.on('hide:before',                         _.bind(this.onListStyleBeforeHide, this));
            toolbar.btnInsertEquation.on('click',                       _.bind(this.onInsertEquationClick, this));
            toolbar.btnInsertSymbol.menu.items[2].on('click',           _.bind(this.onInsertSymbolClick, this));
            toolbar.mnuInsertSymbolsPicker.on('item:click',             _.bind(this.onInsertSymbolItemClick, this));
            toolbar.mnuNoControlsColor.on('click',                      _.bind(this.onNoControlsColor, this));
            toolbar.mnuControlsColorPicker.on('select',                 _.bind(this.onSelectControlsColor, this));
            toolbar.btnLineNumbers.menu.on('item:click',                _.bind(this.onLineNumbersSelect, this));
            toolbar.btnLineNumbers.menu.on('show:after',                _.bind(this.onLineNumbersShow, this));
            toolbar.btnHyphenation.menu.on('item:click',                _.bind(this.onHyphenationSelect, this));
            toolbar.btnHyphenation.menu.on('show:after',                _.bind(this.onHyphenationShow, this));
            Common.Gateway.on('insertimage',                      _.bind(this.insertImage, this));
            Common.Gateway.on('setmailmergerecipients',           _.bind(this.setMailMergeRecipients, this));
            Common.Gateway.on('setrequestedspreadsheet',          _.bind(this.setRequestedSpreadsheet, this));
            Common.NotificationCenter.on('storage:spreadsheet-load',    _.bind(this.openSpreadsheetFromStorage, this));
            Common.NotificationCenter.on('storage:spreadsheet-insert',  _.bind(this.insertSpreadsheetFromStorage, this));
            $('#id-toolbar-menu-new-control-color').on('click',         _.bind(this.onNewControlsColor, this));
            toolbar.listStylesAdditionalMenuItem.on('click', this.onMenuSaveStyle.bind(this));
            toolbar.btnPrint.menu && toolbar.btnPrint.menu.on('item:click', _.bind(this.onPrintMenu, this));
            toolbar.btnPageColor.menu.on('show:after',                  _.bind(this.onPageColorShowAfter, this));
            toolbar.btnPageColor.on('color:select',                     _.bind(this.onSelectPageColor, this));
            toolbar.mnuPageNoFill.on('click',                           _.bind(this.onPageNoFillClick, this));
            toolbar.btnTextFromFile.menu.on('item:click', _.bind(this.onTextFromFileClick, this));
            Common.NotificationCenter.on('leftmenu:save',               _.bind(this.tryToSave, this));
            this.onSetupCopyStyleButton();
            this.onBtnChangeState('undo:disabled', toolbar.btnUndo, toolbar.btnUndo.isDisabled());
            this.onBtnChangeState('redo:disabled', toolbar.btnRedo, toolbar.btnRedo.isDisabled());            
        },

        setApi: function(api) {
            this.api = api;

            if (this.mode.isEdit) {
                this.toolbar.setApi(api);

                this.api.asc_registerCallback('asc_onFontSize', _.bind(this.onApiFontSize, this));
                this.api.asc_registerCallback('asc_onBold', _.bind(this.onApiBold, this));
                this.api.asc_registerCallback('asc_onItalic', _.bind(this.onApiItalic, this));
                this.api.asc_registerCallback('asc_onUnderline', _.bind(this.onApiUnderline, this));
                this.api.asc_registerCallback('asc_onStrikeout', _.bind(this.onApiStrikeout, this));
                this.api.asc_registerCallback('asc_onVerticalAlign', _.bind(this.onApiVerticalAlign, this));
                this.api.asc_registerCallback('asc_onCanUndo', _.bind(this.onApiCanRevert, this, 'undo'));
                this.api.asc_registerCallback('asc_onCanRedo', _.bind(this.onApiCanRevert, this, 'redo'));
                this.api.asc_registerCallback('asc_onPrAlign', _.bind(this.onApiParagraphAlign, this));
                this.api.asc_registerCallback('asc_onTextColor', _.bind(this.onApiTextColor, this));
                this.api.asc_registerCallback('asc_onParaSpacingLine', _.bind(this.onApiLineSpacing, this));
                this.api.asc_registerCallback('asc_onFocusObject', _.bind(this.onApiFocusObject, this));
                this.api.asc_registerCallback('asc_onDocSize', _.bind(this.onApiPageSize, this));
                this.api.asc_registerCallback('asc_onPaintFormatChanged', _.bind(this.onApiStyleChange, this));
                this.api.asc_registerCallback('asc_onParaStyleName', _.bind(this.onApiParagraphStyleChange, this));
                this.api.asc_registerCallback('asc_onEndAddShape', _.bind(this.onApiEndAddShape, this)); //for shapes
                this.api.asc_registerCallback('asc_onPageOrient', _.bind(this.onApiPageOrient, this));
                this.api.asc_registerCallback('asc_onLockDocumentProps', _.bind(this.onApiLockDocumentProps, this));
                this.api.asc_registerCallback('asc_onUnLockDocumentProps', _.bind(this.onApiUnLockDocumentProps, this));
                this.api.asc_registerCallback('asc_onLockDocumentSchema', _.bind(this.onApiLockDocumentSchema, this));
                this.api.asc_registerCallback('asc_onUnLockDocumentSchema', _.bind(this.onApiUnLockDocumentSchema, this));
                this.api.asc_registerCallback('asc_onLockHeaderFooters', _.bind(this.onApiLockHeaderFooters, this));
                this.api.asc_registerCallback('asc_onUnLockHeaderFooters', _.bind(this.onApiUnLockHeaderFooters, this));
                this.api.asc_registerCallback('asc_onZoomChange', _.bind(this.onApiZoomChange, this));
                this.api.asc_registerCallback('asc_onMarkerFormatChanged', _.bind(this.onApiStartHighlight, this));
                this.api.asc_registerCallback('asc_onTextHighLight', _.bind(this.onApiHighlightColor, this));
                this.api.asc_registerCallback('asc_onInitEditorStyles', _.bind(this.onApiInitEditorStyles, this));
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect', _.bind(this.onApiCoAuthoringDisconnect, this));
                Common.NotificationCenter.on('api:disconnect', _.bind(this.onApiCoAuthoringDisconnect, this));
                this.api.asc_registerCallback('asc_onCanCopyCut', _.bind(this.onApiCanCopyCut, this));
                this.api.asc_registerCallback('asc_onMathTypes', _.bind(this.onApiMathTypes, this));
                this.api.asc_registerCallback('asc_onColumnsProps', _.bind(this.onColumnsProps, this));
                this.api.asc_registerCallback('asc_onSectionProps', _.bind(this.onSectionProps, this));
                this.api.asc_registerCallback('asc_onLineNumbersProps', _.bind(this.onLineNumbersProps, this));
                this.api.asc_registerCallback('asc_onContextMenu', _.bind(this.onContextMenu, this));
                this.api.asc_registerCallback('asc_onShowParaMarks', _.bind(this.onShowParaMarks, this));
                this.api.asc_registerCallback('asc_onChangeSdtGlobalSettings', _.bind(this.onChangeSdtGlobalSettings, this));
                this.api.asc_registerCallback('asc_onTextLanguage',         _.bind(this.onTextLanguage, this));
                Common.NotificationCenter.on('fonts:change',                _.bind(this.onApiChangeFont, this));
                this.api.asc_registerCallback('asc_onTableDrawModeChanged', _.bind(this.onTableDraw, this));
                this.api.asc_registerCallback('asc_onTableEraseModeChanged', _.bind(this.onTableErase, this));
                Common.NotificationCenter.on('storage:image-load', _.bind(this.openImageFromStorage, this));
                Common.NotificationCenter.on('storage:image-insert', _.bind(this.insertImageFromStorage, this));
                Common.NotificationCenter.on('dropcap:settings', _.bind(this.onDropCapAdvancedClick, this));
                this.api.asc_registerCallback('asc_onBeginSmartArtPreview', _.bind(this.onApiBeginSmartArtPreview, this));
                this.api.asc_registerCallback('asc_onAddSmartArtPreview', _.bind(this.onApiAddSmartArtPreview, this));
                this.api.asc_registerCallback('asc_onEndSmartArtPreview', _.bind(this.onApiEndSmartArtPreview, this));
                this.api.asc_registerCallback('asc_updateListPatterns', _.bind(this.onApiUpdateListPatterns, this));
            } else if (this.mode.isRestrictedEdit) {
                this.api.asc_registerCallback('asc_onFocusObject', _.bind(this.onApiFocusObjectRestrictedEdit, this));
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect', _.bind(this.onApiCoAuthoringDisconnect, this));
                Common.NotificationCenter.on('api:disconnect', _.bind(this.onApiCoAuthoringDisconnect, this));
                if (this.mode.isPDFForm && this.mode.canFillForms) {
                    this.api.asc_registerCallback('asc_onCanUndo', _.bind(this.onApiCanRevert, this, 'undo'));
                    this.api.asc_registerCallback('asc_onCanRedo', _.bind(this.onApiCanRevert, this, 'redo'));
                    this.api.asc_registerCallback('asc_onCanCopyCut', _.bind(this.onApiCanCopyCut, this));
                    this.api.asc_registerCallback('asc_onChangeViewerTargetType', _.bind(this.onChangeViewerTargetType, this));
                }
            }
            this.api.asc_registerCallback('onPluginToolbarMenu', _.bind(this.onPluginToolbarMenu, this));
            this.api.asc_registerCallback('asc_onDownloadUrl', _.bind(this.onDownloadUrl, this));
            Common.NotificationCenter.on('protect:doclock', _.bind(this.onChangeProtectDocument, this));
        },

        onChangeCompactView: function(view, compact) {
            this.toolbar.setFolded(compact);
            this.toolbar.fireEvent('view:compact', [this, compact]);
            compact && this.onTabCollapse();

            Common.localStorage.setBool('de-compact-toolbar', compact);
            Common.NotificationCenter.trigger('layout:changed', 'toolbar');
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onClickChangeCompact: function (from) {
            if ( from != 'file' ) {
                var me = this;
                setTimeout(function () {
                    me.onChangeCompactView(null, !me.toolbar.isCompact());
                }, 0);
            }
        },

        onContextMenu: function() {
            this.toolbar.collapse();
        },

        onApiChangeFont: function(font) {
            !Common.Utils.ModalWindow.isVisible() && this.toolbar.cmbFontName.onApiChangeFont(font);
        },

        onApiFontSize: function(size) {
            var type = this._state.type_fontsize;
            if (this.toolbar.cmbFontSize && this._state.type_fontsize === 'string') {
                var strValue = size + '_str',
                    rec = this.toolbar.cmbFontSize.store.findWhere({
                    value: strValue
                });
                if (!rec) {
                    type = 'number';
                }
            }
            var val = type === 'string' ? size + '_str' : size;
            if (this._state.fontsize !== val) {
                this.toolbar.cmbFontSize.setValue(val);
                this._state.fontsize = val;
            }
        },

        onApiBold: function(on) {
            if (this._state.bold !== on) {
                this.toolbar.btnBold.toggle(on === true, true);
                this._state.bold = on;
            }
        },

        onApiItalic: function(on) {
            if (this._state.italic !== on) {
                this.toolbar.btnItalic.toggle(on === true, true);
                this._state.italic = on;
            }
        },

        onApiUnderline: function(on) {
            if (this._state.underline !== on) {
                this.toolbar.btnUnderline.toggle(on === true, true);
                this._state.underline = on;
            }
        },

        onApiStrikeout: function(on) {
            if (this._state.strike !== on) {
                this.toolbar.btnStrikeout.toggle(on === true, true);
                this._state.strike = on;
            }
        },

        onApiVerticalAlign: function(typeBaseline) {
            if (this._state.valign !== typeBaseline) {
                this.toolbar.btnSuperscript.toggle(typeBaseline==Asc.vertalign_SuperScript, true);
                this.toolbar.btnSubscript.toggle(typeBaseline==Asc.vertalign_SubScript, true);
                this._state.valign = typeBaseline;
            }
        },

        onApiCanRevert: function(which, can) {
            if (which=='undo') {
                if (this._state.can_undo !== can) {
                    this.toolbar.btnUndo ? this.toolbar.lockToolbar(Common.enumLock.undoLock, !can, {array: [this.toolbar.btnUndo]}) : this.onBtnChangeState('undo:disabled', null, !can);
                    this._state.can_undo = can;
                }
            } else {
                if (this._state.can_redo !== can) {
                    this.toolbar.btnRedo ? this.toolbar.lockToolbar(Common.enumLock.redoLock, !can, {array: [this.toolbar.btnRedo]}) : this.onBtnChangeState('redo:disabled', null, !can);
                    this._state.can_redo = can;
                }
            }
        },

        onApiCanCopyCut: function(can) {
            if (this._state.can_copycut !== can) {
                this.toolbar.lockToolbar(Common.enumLock.copyLock, !can, {array: [this.toolbar.btnCopy, this.toolbar.btnCut]});
                this._state.can_copycut = can;
            }
        },

        onApiParagraphAlign: function(v) {
            if (this._state.pralign !== v) {
                this._state.pralign = v;

                var index = -1,
                    align,
                    toolbar = this.toolbar;

                switch (v) {
                    case 0: index = 2; align = 'btn-align-right'; break;
                    case 1: index = 0; align = 'btn-align-left'; break;
                    case 2: index = 1; align = 'btn-align-center'; break;
                    case 3: index = 3; align = 'btn-align-just'; break;
                    default:  index = -255; align = 'btn-align-left'; break;
                }

                if (v === null || v===undefined) {
                    toolbar.btnAlignRight.toggle(false, true);
                    toolbar.btnAlignLeft.toggle(false, true);
                    toolbar.btnAlignCenter.toggle(false, true);
                    toolbar.btnAlignJust.toggle(false, true);
                    return;
                }

                toolbar.btnAlignRight.toggle(v===0, true);
                toolbar.btnAlignLeft.toggle(v===1, true);
                toolbar.btnAlignCenter.toggle(v===2, true);
                toolbar.btnAlignJust.toggle(v===3, true);
            }
        },

        onApiLineSpacing: function(vc) {
            var line = (vc.get_Line() === null || vc.get_LineRule() === null || vc.get_LineRule() != 1) ? -1 : vc.get_Line();

            if (this._state.linespace !== line) {
                this._state.linespace = line;
                _.each(this.toolbar.mnuLineSpace.items, function(item){
                    item.setChecked(false, true);
                });
                if (line<0) return;

                if ( Math.abs(line-1.)<0.0001 )
                    this.toolbar.mnuLineSpace.items[0].setChecked(true, true);
                else if ( Math.abs(line-1.15)<0.0001 )
                    this.toolbar.mnuLineSpace.items[1].setChecked(true, true);
                else if ( Math.abs(line-1.5)<0.0001 )
                    this.toolbar.mnuLineSpace.items[2].setChecked(true, true);
                else if ( Math.abs(line-2)<0.0001 )
                    this.toolbar.mnuLineSpace.items[3].setChecked(true, true);
                else if ( Math.abs(line-2.5)<0.0001 )
                    this.toolbar.mnuLineSpace.items[4].setChecked(true, true);
                else if ( Math.abs(line-3)<0.0001 )
                    this.toolbar.mnuLineSpace.items[5].setChecked(true, true);
            }
        },

        onApiPageSize: function(w, h) {
            if (this._state.pgorient===undefined) return;

            var width = this._state.pgorient ? w : h,
                height = this._state.pgorient ? h : w;
            if (Math.abs(this._state.pgsize[0] - w) > 0.1 ||
                Math.abs(this._state.pgsize[1] - h) > 0.1) {
                this._state.pgsize = [w, h];
                if (this.toolbar.mnuPageSize) {
                    this.toolbar.mnuPageSize.clearAll();
                    _.each(this.toolbar.mnuPageSize.items, function(item){
                        if (item.value && typeof(item.value) == 'object' &&
                            Math.abs(item.value[0] - width) < 0.1 && Math.abs(item.value[1] - height) < 0.1) {
                            item.setChecked(true);
                            return false;
                        }
                    }, this);
                }
            }
        },

        onSectionProps: function(props) {
            if (props) {
                var left = props.get_LeftMargin(),
                    top = props.get_TopMargin(),
                    right = props.get_RightMargin(),
                    bottom = props.get_BottomMargin();

                if (!this._state.pgmargins || Math.abs(this._state.pgmargins[0] - top) > 0.1 ||
                    Math.abs(this._state.pgmargins[1] - left) > 0.1 || Math.abs(this._state.pgmargins[2] - bottom) > 0.1 ||
                    Math.abs(this._state.pgmargins[3] - right) > 0.1) {
                    this._state.pgmargins = [top, left, bottom, right];
                    if (this.toolbar.btnPageMargins.menu) {
                        this.toolbar.btnPageMargins.menu.clearAll();
                        _.each(this.toolbar.btnPageMargins.menu.items, function(item){
                            if (item.value && typeof(item.value) == 'object' &&
                                Math.abs(item.value[0] - top) < 0.1 && Math.abs(item.value[1] - left) < 0.1 &&
                                Math.abs(item.value[2] - bottom) < 0.1 && Math.abs(item.value[3] - right) < 0.1) {
                                item.setChecked(true);
                                return false;
                            }
                        }, this);
                    }
                }
            }
        },

        onShowParaMarks: function(v) {
            this.toolbar.mnuNonPrinting.items[0].setChecked(v, true);
            this.toolbar.btnShowHidenChars.toggle(v, true);
            Common.localStorage.setItem("de-show-hiddenchars", v);
        },

        onApiFocusObjectRestrictedEdit: function(selectedObjects) {
            if (!this.editMode) return;

            var i = -1, type,
                paragraph_locked = false,
                header_locked = false,
                image_locked = false,
                in_image = false,
                frame_pr = undefined;

            while (++i < selectedObjects.length) {
                type = selectedObjects[i].get_ObjectType();

                if (type === Asc.c_oAscTypeSelectElement.Paragraph) {
                    frame_pr = selectedObjects[i].get_ObjectValue();
                    paragraph_locked = selectedObjects[i].get_ObjectValue().get_Locked();
                } else if (type === Asc.c_oAscTypeSelectElement.Header) {
                    header_locked = selectedObjects[i].get_ObjectValue().get_Locked();
                } else if (type === Asc.c_oAscTypeSelectElement.Image) {
                    in_image = true;
                    image_locked = selectedObjects[i].get_ObjectValue().get_Locked();
                }
            }

            var rich_del_lock = (frame_pr) ? !frame_pr.can_DeleteBlockContentControl() : false,
                rich_edit_lock = (frame_pr) ? !frame_pr.can_EditBlockContentControl() : false,
                plain_del_lock = (frame_pr) ? !frame_pr.can_DeleteInlineContentControl() : false,
                plain_edit_lock = (frame_pr) ? !frame_pr.can_EditInlineContentControl() : false;

            if (this.btnsComment) {
                this.toolbar.lockToolbar(Common.enumLock.cantAddQuotedComment, !this.api.can_AddQuotedComment(), {array: this.btnsComment});
                this.toolbar.lockToolbar(Common.enumLock.imageLock, image_locked, {array: this.btnsComment});
                this.mode.compatibleFeatures && this.toolbar.lockToolbar(Common.enumLock.inImage, in_image,      {array: this.btnsComment});
                if (this.api.asc_IsContentControl()) {
                    var control_props = this.api.asc_GetContentControlProperties(),
                        spectype = control_props ? control_props.get_SpecificType() : Asc.c_oAscContentControlSpecificType.None;
                    this.toolbar.lockToolbar(Common.enumLock.inSpecificForm, spectype==Asc.c_oAscContentControlSpecificType.CheckBox || spectype==Asc.c_oAscContentControlSpecificType.Picture ||
                        spectype==Asc.c_oAscContentControlSpecificType.ComboBox || spectype==Asc.c_oAscContentControlSpecificType.DropDownList || spectype==Asc.c_oAscContentControlSpecificType.DateTime,   {array: this.btnsComment});
                } else
                    this.toolbar.lockToolbar(Common.enumLock.inSpecificForm, false, {array: this.btnsComment});
                this.toolbar.lockToolbar(Common.enumLock.paragraphLock, paragraph_locked,   {array: this.btnsComment});
                this.toolbar.lockToolbar(Common.enumLock.headerLock,    header_locked,      {array: this.btnsComment});
                this.toolbar.lockToolbar(Common.enumLock.richEditLock,  rich_edit_lock,     {array: this.btnsComment});
                this.toolbar.lockToolbar(Common.enumLock.plainEditLock, plain_edit_lock,    {array: this.btnsComment});
                this.toolbar.lockToolbar(Common.enumLock.richDelLock, rich_del_lock,        {array: this.btnsComment});
                this.toolbar.lockToolbar(Common.enumLock.plainDelLock, plain_del_lock,      {array: this.btnsComment});
            }
        },

        onApiFocusObject: function(selectedObjects) {
            if (!this.editMode) return;

            var pr, sh, i = -1, type,
                paragraph_locked = false,
                header_locked = false,
                image_locked = false,
                can_add_table = false,
                can_add_image = false,
                enable_dropcap = undefined,
                disable_dropcapadv = true,
                frame_pr = undefined,
                shape_pr = undefined,
                toolbar = this.toolbar,
                in_header = false,
                in_chart = false,
                in_equation = false,
                btn_eq_state = false,
                in_image = false,
                in_control = false,
                in_para = false,
                in_footnote = this.api.asc_IsCursorInFootnote() || this.api.asc_IsCursorInEndnote();

            while (++i < selectedObjects.length) {
                type = selectedObjects[i].get_ObjectType();
                pr   = selectedObjects[i].get_ObjectValue();

                if (type === Asc.c_oAscTypeSelectElement.Paragraph) {
                    paragraph_locked = pr.get_Locked();
                    can_add_table = pr.get_CanAddTable();
                    can_add_image = pr.get_CanAddImage();
                    frame_pr = pr;
                    sh = pr.get_Shade();
                    in_para = true;
                } else if (type === Asc.c_oAscTypeSelectElement.Header) {
                    header_locked = pr.get_Locked();
                    in_header = true;
                } else if (type === Asc.c_oAscTypeSelectElement.Image) {
                    in_image = true;
                    image_locked = pr.get_Locked();
                    if (pr && pr.get_ChartProperties())
                        in_chart = true;
                    if (pr && pr.get_ShapeProperties())
                        shape_pr = pr.get_ShapeProperties();
                } else if (type === Asc.c_oAscTypeSelectElement.Math) {
                    in_equation = true;
                    if (Asc.c_oAscMathInterfaceType.Common === pr.get_Type())
                        btn_eq_state = true;
                }

                if (type === Asc.c_oAscTypeSelectElement.Table || type === Asc.c_oAscTypeSelectElement.Header || type === Asc.c_oAscTypeSelectElement.Image) {
                    enable_dropcap = false;
                }

                if (enable_dropcap!==false && type == Asc.c_oAscTypeSelectElement.Paragraph)
                    enable_dropcap = true;
            }

            if (sh)
                this.onParagraphColor(sh);

            var rich_del_lock = (frame_pr) ? !frame_pr.can_DeleteBlockContentControl() : false,
                rich_edit_lock = (frame_pr) ? !frame_pr.can_EditBlockContentControl() : false,
                plain_del_lock = (frame_pr) ? !frame_pr.can_DeleteInlineContentControl() : false,
                plain_edit_lock = (frame_pr) ? !frame_pr.can_EditInlineContentControl() : false,
                in_smart_art = shape_pr && shape_pr.asc_getFromSmartArt(),
                in_smart_art_internal = shape_pr && shape_pr.asc_getFromSmartArtInternal();

            this.toolbar.lockToolbar(Common.enumLock.paragraphLock, paragraph_locked,   {array: this.toolbar.paragraphControls.concat([toolbar.btnContentControls, toolbar.btnClearStyle])});
            this.toolbar.lockToolbar(Common.enumLock.headerLock,    header_locked,      {array: this.toolbar.paragraphControls.concat([toolbar.btnContentControls, toolbar.btnClearStyle, toolbar.btnWatermark])});
            this.toolbar.lockToolbar(Common.enumLock.richEditLock,  rich_edit_lock,     {array: this.toolbar.paragraphControls.concat([toolbar.btnClearStyle])});
            this.toolbar.lockToolbar(Common.enumLock.plainEditLock, plain_edit_lock,    {array: this.toolbar.paragraphControls.concat([toolbar.btnClearStyle])});

            this.toolbar.lockToolbar(Common.enumLock.richDelLock, rich_del_lock,        {array: toolbar.btnsPageBreak.concat(this.btnsComment).concat([toolbar.btnInsertTable, toolbar.btnInsertImage, toolbar.btnInsertChart, toolbar.btnInsertTextArt,
                                                                                    toolbar.btnInsDateTime, toolbar.btnBlankPage, toolbar.btnInsertEquation, toolbar.btnInsertSymbol, toolbar.btnInsField ])});
            this.toolbar.lockToolbar(Common.enumLock.plainDelLock, plain_del_lock,      {array: toolbar.btnsPageBreak.concat(this.btnsComment).concat([toolbar.btnInsertTable, toolbar.btnInsertImage, toolbar.btnInsertChart, toolbar.btnInsertTextArt,
                                                                                    toolbar.btnInsDateTime, toolbar.btnBlankPage, toolbar.btnInsertEquation, toolbar.btnInsertSymbol, toolbar.btnInsField ])});

            this.toolbar.lockToolbar(Common.enumLock.inChart,       in_chart,           {array: toolbar.textOnlyControls.concat([toolbar.btnClearStyle, toolbar.btnInsertEquation])});
            this.toolbar.lockToolbar(Common.enumLock.inSmartart,    in_smart_art,       {array: toolbar.textOnlyControls.concat([toolbar.btnClearStyle, toolbar.btnContentControls])});
            this.toolbar.lockToolbar(Common.enumLock.inSmartartInternal, in_smart_art_internal,    {array: toolbar.textOnlyControls.concat([toolbar.btnClearStyle, toolbar.btnDecLeftOffset, toolbar.btnIncLeftOffset, toolbar.btnContentControls])});
            this.toolbar.lockToolbar(Common.enumLock.inEquation,    in_equation,        {array: toolbar.btnsPageBreak.concat([toolbar.btnDropCap, toolbar.btnInsertTable, toolbar.btnBlankPage, toolbar.btnInsertShape,
                    toolbar.btnInsertText, toolbar.btnInsertTextArt, toolbar.btnInsertImage, toolbar.btnInsertSmartArt, toolbar.btnSuperscript, toolbar.btnSubscript, toolbar.btnEditHeader])});

            in_control = this.api.asc_IsContentControl();
            var control_props = in_control ? this.api.asc_GetContentControlProperties() : null,
                lock_type = (in_control&&control_props) ? control_props.get_Lock() : Asc.c_oAscSdtLockType.Unlocked,
                control_plain = (in_control&&control_props) ? (control_props.get_ContentControlType()==Asc.c_oAscSdtLevelType.Inline) : false;
            (lock_type===undefined) && (lock_type = Asc.c_oAscSdtLockType.Unlocked);
            var content_locked = lock_type==Asc.c_oAscSdtLockType.SdtContentLocked || lock_type==Asc.c_oAscSdtLockType.ContentLocked;
            var if_form = control_props && control_props.get_FormPr();

            if (!toolbar.btnContentControls.isDisabled()) {
                var control_disable = control_plain || content_locked;
                for (var i=0; i<7; i++)
                    toolbar.btnContentControls.menu.items[i].setDisabled(control_disable);
                toolbar.btnContentControls.menu.items[8].setDisabled(!in_control || lock_type==Asc.c_oAscSdtLockType.SdtContentLocked || lock_type==Asc.c_oAscSdtLockType.SdtLocked || if_form);
                toolbar.btnContentControls.menu.items[10].setDisabled(!in_control || if_form);
            }

            this.toolbar.lockToolbar(Common.enumLock.fixedForm, if_form && if_form.get_Fixed(), {array: [
                toolbar.btnAlignLeft, toolbar.btnAlignCenter, toolbar.btnAlignRight, toolbar.btnAlignJust,
                toolbar.btnMarkers, toolbar.btnNumbers, toolbar.btnMultilevels,
                toolbar.btnDecLeftOffset, toolbar.btnIncLeftOffset,
                toolbar.btnLineSpace
            ]});  
            this.toolbar.lockToolbar(Common.enumLock.controlPlain, control_plain, {array: [toolbar.btnInsertTable, toolbar.btnInsertImage,  toolbar.btnInsertChart,  toolbar.btnInsertText, toolbar.btnInsertTextArt,
                                                                                toolbar.btnInsertShape, toolbar.btnInsertSmartArt, toolbar.btnInsertEquation, toolbar.btnDropCap, toolbar.btnColumns, toolbar.mnuInsertPageNum ]});
            if (enable_dropcap && frame_pr) {
                var value = frame_pr.get_FramePr(),
                    drop_value = Asc.c_oAscDropCap.None;

                if (value!==undefined) {
                    drop_value = value.get_DropCap();
                    enable_dropcap = ( drop_value === Asc.c_oAscDropCap.Drop || drop_value === Asc.c_oAscDropCap.Margin);
                    disable_dropcapadv = false;
                } else {
                    enable_dropcap = frame_pr.get_CanAddDropCap();
                }

                if (enable_dropcap)
                    this.onDropCap(drop_value);
            }
            this.toolbar.lockToolbar(Common.enumLock.dropcapLock, !enable_dropcap, {array: [toolbar.btnDropCap]});
            if ( !toolbar.btnDropCap.isDisabled() )
                toolbar.mnuDropCapAdvanced.setDisabled(disable_dropcapadv);

            this.toolbar.lockToolbar(Common.enumLock.cantAddTable, !can_add_table, {array: [toolbar.btnInsertTable]});
            this.toolbar.lockToolbar(Common.enumLock.cantAddPageNum, toolbar.mnuPageNumCurrentPos.isDisabled() && toolbar.mnuPageNumberPosPicker.isDisabled(), {array: [toolbar.mnuInsertPageNum]});
            this.toolbar.lockToolbar(Common.enumLock.inHeader, in_header, {array: toolbar.btnsPageBreak.concat([toolbar.btnBlankPage])});
            this.toolbar.lockToolbar(Common.enumLock.inControl, in_control, {array: toolbar.btnsPageBreak.concat([toolbar.btnBlankPage])});
            this.toolbar.lockToolbar(Common.enumLock.cantPageBreak, in_image && !btn_eq_state, {array: toolbar.btnsPageBreak.concat([toolbar.btnBlankPage])});
            this.toolbar.lockToolbar(Common.enumLock.contentLock, content_locked, {array: [toolbar.btnInsertShape, toolbar.btnInsertText, toolbar.btnInsertImage, toolbar.btnInsertTextArt, toolbar.btnInsertChart, toolbar.btnInsertSmartArt ]});
            this.toolbar.lockToolbar(Common.enumLock.inFootnote, in_footnote, {array: toolbar.btnsPageBreak.concat([toolbar.btnBlankPage, toolbar.btnInsertShape, toolbar.btnInsertText, toolbar.btnInsertTextArt, toolbar.btnInsertSmartArt ])});
            this.toolbar.lockToolbar(Common.enumLock.cantAddImagePara, in_para && !can_add_image, {array: [toolbar.btnInsertImage, toolbar.btnInsertTextArt]});

            if (in_chart !== this._state.in_chart) {
                toolbar.btnInsertChart.updateHint(in_chart ? toolbar.tipChangeChart : toolbar.tipInsertChart);
                this._state.in_chart = in_chart;
            }
            var need_disable = paragraph_locked || header_locked || in_equation || control_plain || rich_del_lock || plain_del_lock  || content_locked || in_para && !can_add_image;
            need_disable = !in_chart && need_disable;
            this.toolbar.lockToolbar(Common.enumLock.cantAddChart, need_disable, {array: [toolbar.btnInsertChart]});
            this.toolbar.lockToolbar(Common.enumLock.chartLock, in_chart && image_locked, {array: [toolbar.btnInsertChart]});

            this.toolbar.lockToolbar(Common.enumLock.cantAddEquation, !can_add_image&&!in_equation, {array: [toolbar.btnInsertEquation]});
            this.toolbar.lockToolbar(Common.enumLock.noParagraphSelected, !in_para, {array: [toolbar.btnInsertSymbol, toolbar.btnInsDateTime, toolbar.btnLineSpace, toolbar.btnInsField]});
            this.toolbar.lockToolbar(Common.enumLock.inImage, in_image, {array: [toolbar.btnColumns]});
            this.toolbar.lockToolbar(Common.enumLock.inImagePara, in_image && in_para, {array: [toolbar.btnLineNumbers]});

            if (toolbar.listStylesAdditionalMenuItem && (frame_pr===undefined) !== toolbar.listStylesAdditionalMenuItem.isDisabled())
                toolbar.listStylesAdditionalMenuItem.setDisabled(frame_pr===undefined);

            if (this.btnsComment) {
                // comments
                this.toolbar.lockToolbar(Common.enumLock.cantAddQuotedComment, !this.api.can_AddQuotedComment(), {array: this.btnsComment});
                this.toolbar.lockToolbar(Common.enumLock.imageLock, image_locked, {array: this.btnsComment});
                this.mode.compatibleFeatures && this.toolbar.lockToolbar(Common.enumLock.inImage, in_image,      {array: this.btnsComment});
                if (control_props) {
                    var spectype = control_props.get_SpecificType();
                    this.toolbar.lockToolbar(Common.enumLock.inSpecificForm, spectype==Asc.c_oAscContentControlSpecificType.CheckBox || spectype==Asc.c_oAscContentControlSpecificType.Picture ||
                        spectype==Asc.c_oAscContentControlSpecificType.ComboBox || spectype==Asc.c_oAscContentControlSpecificType.DropDownList || spectype==Asc.c_oAscContentControlSpecificType.DateTime,
                        {array: this.btnsComment});
                } else
                    this.toolbar.lockToolbar(Common.enumLock.inSpecificForm, false, {array: this.btnsComment});
            }
            if (frame_pr) {
                this._state.suppress_num = !!frame_pr.get_SuppressLineNumbers();
            }
            this._state.in_equation = in_equation;

            var listId = this.api.asc_GetCurrentNumberingId(),
                numformat = (listId !== null) ? this.api.asc_GetNumberingPr(listId).get_Lvl(this.api.asc_GetCurrentNumberingLvl()).get_Format() : Asc.c_oAscNumberingFormat.None;
            this.toolbar.btnMarkers.toggle(numformat===Asc.c_oAscNumberingFormat.Bullet || numformat===Asc.c_oAscNumberingFormat.None && (listId !== null), true);
            this.toolbar.btnNumbers.toggle(numformat!==Asc.c_oAscNumberingFormat.None && numformat!==Asc.c_oAscNumberingFormat.Bullet, true);
        },

        onApiStyleChange: function(v) {
            this.toolbar.btnCopyStyle.toggle(v, true);
            this.modeAlwaysSetStyle = false;
        },

        onTableDraw: function(v) {
            this.toolbar.mnuInsertTable && this.toolbar.mnuInsertTable.items[2].setChecked(!!v, true);
        },
        onTableErase: function(v) {
            this.toolbar.mnuInsertTable && this.toolbar.mnuInsertTable.items[3].setChecked(!!v, true);
        },

        onApiParagraphStyleChange: function(name) {
            if (this._state.prstyle != name) {
                var listStyle = this.toolbar.listStyles,
                    listStylesVisible = (listStyle.rendered);

                if (listStylesVisible) {
                    listStyle.suspendEvents();
                    var styleRec = listStyle.menuPicker.store.findWhere({
                        title: name
                    });
                    this._state.prstyle = (listStyle.menuPicker.store.length>0 || window.styles_loaded) ? name : undefined;

                    listStyle.menuPicker.selectRecord(styleRec);
                    listStyle.resumeEvents();
                }
            }
        },

        onApiPageOrient: function(isportrait) {
            if (this._state.pgorient !== isportrait) {
                this.toolbar.btnPageOrient.menu.items[isportrait ? 0 : 1].setChecked(true);
                this._state.pgorient = isportrait;
            }
        },

        onApiLockDocumentProps: function() {
            if (this._state.lock_doc!==true) {
                this.toolbar.lockToolbar(Common.enumLock.docPropsLock, true, {array: [this.toolbar.btnPageOrient, this.toolbar.btnPageSize, this.toolbar.btnPageMargins,
                                                                                      this.toolbar.btnColumns, this.toolbar.btnLineNumbers, this.toolbar.btnHyphenation, this.toolbar.btnPageColor]});
                if (this._state.activated) this._state.lock_doc = true;
            }
        },

        onApiUnLockDocumentProps: function() {
            if (this._state.lock_doc!==false) {
                this.toolbar.lockToolbar(Common.enumLock.docPropsLock, false, {array: [this.toolbar.btnPageOrient, this.toolbar.btnPageSize, this.toolbar.btnPageMargins,
                                                                                       this.toolbar.btnColumns, this.toolbar.btnLineNumbers, this.toolbar.btnHyphenation, this.toolbar.btnPageColor]});
                if (this._state.activated) this._state.lock_doc = false;
            }
        },

        onApiLockDocumentSchema: function() {
            this.toolbar.lockToolbar(Common.enumLock.docSchemaLock, true, {array: [this.toolbar.btnColorSchemas]});
        },

        onApiUnLockDocumentSchema: function() {
            this.toolbar.lockToolbar(Common.enumLock.docSchemaLock, false, {array: [this.toolbar.btnColorSchemas]});
        },

        onApiLockHeaderFooters: function() {
            this.toolbar.lockToolbar(Common.enumLock.headerFooterLock, true, {array: [this.toolbar.mnuPageNumberPosPicker]});
            this.toolbar.lockToolbar(Common.enumLock.cantAddPageNum, this.toolbar.mnuPageNumCurrentPos.isDisabled(), {array: [this.toolbar.mnuInsertPageNum]});
        },

        onApiUnLockHeaderFooters: function() {
            this.toolbar.lockToolbar(Common.enumLock.headerFooterLock, false, {array: [this.toolbar.mnuPageNumberPosPicker]});
            this.toolbar.lockToolbar(Common.enumLock.cantAddPageNum, false, {array: [this.toolbar.mnuInsertPageNum]});
        },

        onApiZoomChange: function(percent, type) {},

        onApiStartHighlight: function(pressed) {
            this.toolbar.btnHighlightColor.toggle(pressed, true);
        },

        onApiHighlightColor: function(c) {
            var textpr = this.api.get_TextProps().get_TextPr();
            if (textpr) {
                c = textpr.get_HighLight();
                if (c == -1) {
                    if (this._state.clrhighlight != -1) {
                        this.toolbar.mnuHighlightTransparent.setChecked(true, true);

                        if (this.toolbar.mnuHighlightColorPicker) {
                            this._state.clrhighlight = -1;
                            this.toolbar.mnuHighlightColorPicker.clearSelection();
                        }
                    }
                } else if (c !== null) {
                    if (this._state.clrhighlight != c.get_hex().toUpperCase()) {
                        this.toolbar.mnuHighlightTransparent.setChecked(false);
                        this._state.clrhighlight = c.get_hex().toUpperCase();

                        if ( this.toolbar.mnuHighlightColorPicker && _.contains(this.toolbar.mnuHighlightColorPicker.colors, this._state.clrhighlight) )
                            this.toolbar.mnuHighlightColorPicker.selectByRGB(this._state.clrhighlight, true);
                    }
                }  else {
                    if ( this._state.clrhighlight !== c) {
                        this.toolbar.mnuHighlightTransparent.setChecked(false, true);
                        this.toolbar.mnuHighlightColorPicker && this.toolbar.mnuHighlightColorPicker.clearSelection();
                        this._state.clrhighlight = c;
                    }
                }
            }
        },

        onApiInitEditorStyles: function(styles) {
            this._onInitEditorStyles(styles);
        },

        onChangeSdtGlobalSettings: function() {
            var show = this.api.asc_GetGlobalContentControlShowHighlight();
            this.toolbar.mnuNoControlsColor && this.toolbar.mnuNoControlsColor.setChecked(!show, true);
            this.toolbar.mnuControlsColorPicker && this.toolbar.mnuControlsColorPicker.clearSelection();
            if (show){
                var clr = this.api.asc_GetGlobalContentControlHighlightColor();
                if (clr) {
                    clr = Common.Utils.ThemeColor.getHexColor(clr.get_r(), clr.get_g(), clr.get_b());
                    this.toolbar.mnuControlsColorPicker && this.toolbar.mnuControlsColorPicker.selectByRGB(clr, true);
                }
            }
        },

        onNewDocument: function(btn, e) {
            if (this.api)
                this.api.OpenNewDocument();

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'New Document');
        },

        onOpenDocument: function(btn, e) {
            if (this.api)
                this.api.LoadDocumentFromDisk();

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Open Document');
        },

        onPrint: function(e) {
            if (this.toolbar.btnPrint.options.printType == 'print') {
                Common.NotificationCenter.trigger('file:print', this.toolbar);
                Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            } else {
                var _main = this.getApplication().getController('Main');
                _main.onPrintQuick();
            }
            Common.component.Analytics.trackEvent('Print');
            Common.component.Analytics.trackEvent('ToolBar', 'Print');

        },

        onPrintMenu: function (btn, e){
            var oldType = this.toolbar.btnPrint.options.printType;
            var newType = e.value;

            if(newType != oldType) {
                this.toolbar.btnPrint.changeIcon({
                    next: e.options.iconClsForMainBtn,
                    curr: this.toolbar.btnPrint.menu.items.filter(function(item){return item.value == oldType;})[0].options.iconClsForMainBtn
                });
                this.toolbar.btnPrint.updateHint([e.caption + e.options.platformKey]);
                this.toolbar.btnPrint.options.printType = newType;
            }
            this.onPrint(e);
        },

        tryToSave: function(e) {
            var toolbar = this.toolbar,
                mode = toolbar.mode,
                me = this;
            if (!mode.canSaveToFile) {
                var canDownload = mode.canDownload && (!mode.isDesktopApp || !mode.isOffline),
                    saveSopy = (mode.canDownload && (!mode.isDesktopApp || !mode.isOffline)) && (mode.canRequestSaveAs || mode.saveAsUrl),
                    saveAs = mode.canDownload && mode.isDesktopApp && mode.isOffline,
                    buttons = (saveSopy || saveAs ? [{value: 'copy', caption: this.txtSaveCopy}] : []).concat(canDownload ? [{value: 'download', caption: this.txtDownload}] : []),
                    primary = saveSopy || saveAs ? 'copy' : (canDownload ? 'download' : 'ok');

                Common.UI.info({
                    maxwidth: 500,
                    buttons: !mode.canDownload ? ['ok'] : buttons.concat(['cancel']),
                    primary: !mode.canDownload ? 'ok' : primary,
                    msg: mode.canDownload ? this.txtNeedDownload : this.errorAccessDeny,
                    callback: function(btn) {
                        if (saveAs && btn==='copy')
                            me.api.asc_DownloadAs();
                        else if (btn==='copy' || btn==='download') {
                            me.isFromFormSaveAs = (btn==='copy');
                            var options = new Asc.asc_CDownloadOptions(Asc.c_oAscFileType.PDF, me.isFromFormSaveAs);
                            options.asc_setIsSaveAs(me.isFromFormSaveAs);
                            me.api.asc_DownloadAs(options);
                        }
                        Common.NotificationCenter.trigger('edit:complete', toolbar);
                    }
                });
            } else if (this.api) {
                var isModified = this.api.asc_isDocumentCanSave();
                var isSyncButton = toolbar.btnCollabChanges && toolbar.btnCollabChanges.cmpEl.hasClass('notify');
                if (!isModified && !isSyncButton && !mode.forcesave && !mode.canSaveDocumentToBinary)
                    return;

                this.api.asc_Save();
            }

            toolbar.btnSave.setDisabled(!mode.forcesave && !mode.canSaveDocumentToBinary && mode.canSaveToFile || !mode.showSaveButton);

            Common.NotificationCenter.trigger('edit:complete', toolbar);

            Common.component.Analytics.trackEvent('Save');
            Common.component.Analytics.trackEvent('ToolBar', 'Save');
        },

        onBtnChangeState: function(prop) {
            if ( /\:disabled$/.test(prop) ) {
                var _is_disabled = arguments[2];
                this.toolbar.fireEvent(prop, [_is_disabled]);
            }
        },

        onUndo: function(btn, e) {
            if (this.api)
                this.api.Undo();

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);

            Common.component.Analytics.trackEvent('ToolBar', 'Undo');
        },

        onRedo: function(btn, e) {
            if (this.api)
                this.api.Redo();

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);

            Common.component.Analytics.trackEvent('ToolBar', 'Redo');
        },

        onCopyPaste: function(type, e) {
            var me = this;
            if (me.api) {
                var res = (type === 'cut') ? me.api.Cut() : ((type === 'copy') ? me.api.Copy() : me.api.Paste());
                if (!res) {
                    if (!Common.localStorage.getBool("de-hide-copywarning")) {
                        (new Common.Views.CopyWarningDialog({
                            handler: function(dontshow) {
                                if (dontshow) Common.localStorage.setItem("de-hide-copywarning", 1);
                                Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                            }
                        })).show();
                    }
                } else
                    Common.component.Analytics.trackEvent('ToolBar', 'Copy Warning');
            }
            Common.NotificationCenter.trigger('edit:complete', me.toolbar);
        },

        onSelectAll: function(e) {
            if (this.api)
                this.api.asc_EditSelectAll();

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Select All');
        },

        onReplace: function(e) {
            this.getApplication().getController('LeftMenu').onShortcut('replace');
        },

        onIncrease: function(e) {
            if (this.api)
                this.api.FontSizeIn();

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Font Size');
        },

        onDecrease: function(e) {
            if (this.api)
                this.api.FontSizeOut();

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Font Size');
        },

        onBold: function(btn, e) {
            this._state.bold = undefined;
            if (this.api)
                this.api.put_TextPrBold(btn.pressed);

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Bold');
        },

        onItalic: function(btn, e) {
            this._state.italic = undefined;
            if (this.api)
                this.api.put_TextPrItalic(btn.pressed);

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Italic');
        },

        onUnderline: function(btn, e) {
            this._state.underline = undefined;
            if (this.api)
                this.api.put_TextPrUnderline(btn.pressed);

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Underline');
        },

        onStrikeout: function(btn, e) {
            this._state.strike = undefined;
            if (this.api)
                this.api.put_TextPrStrikeout(btn.pressed);

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Strikeout');
        },

        onSuperscript: function(btn, e) {
            if (!this.toolbar.btnSubscript.pressed) {
                this._state.valign = undefined;
                if (this.api)
                    this.api.put_TextPrBaseline(btn.pressed ? Asc.vertalign_SuperScript : Asc.vertalign_Baseline);

                Common.NotificationCenter.trigger('edit:complete', this.toolbar);
                Common.component.Analytics.trackEvent('ToolBar', 'Superscript');
            }
        },

        onSubscript: function(btn, e) {
            if (!this.toolbar.btnSuperscript.pressed) {
                this._state.valign = undefined;
                if (this.api)
                    this.api.put_TextPrBaseline(btn.pressed ? Asc.vertalign_SubScript : Asc.vertalign_Baseline);

                Common.NotificationCenter.trigger('edit:complete', this.toolbar);
                Common.component.Analytics.trackEvent('ToolBar', 'Subscript');
            }
        },

        onDecOffset: function(btn, e) {
            if (this.api)
                this.api.DecreaseIndent();

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Indent');
        },

        onIncOffset: function(btn, e) {
            if (this.api)
                this.api.IncreaseIndent();

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Indent');
        },

        onHorizontalAlign: function(type, btn, e) {
            this._state.pralign = undefined;
            if (this.api) {
                if (!btn.pressed) {
                    type = (type==1) ? 3 : 1;
                }
                this.api.put_PrAlign(type);
            }

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Align');
        },


        onMarkers: function(btn, e) {
            var record = {
                numberingInfo: btn.pressed ? '{"Type":"bullet"}' : '{"Type":"remove"}'
            };

            this.onSelectBullets(null, this.toolbar.mnuMarkersPicker, null, record);

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onNumbers: function(btn, e) {
            var record = {
                numberingInfo: btn.pressed ? '{"Type":"number"}' : '{"Type":"remove"}'
            };
            this.onSelectBullets(null,  this.toolbar.mnuNumbersPicker, null, record);

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onComboBlur: function() {
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onFontNameSelect: function(combo, record) {
            if (this.api) {
                if (record.isNewFont) {
                    !Common.Utils.ModalWindow.isVisible() &&
                    Common.UI.warning({
                        width: 500,
                        msg: this.confirmAddFontName,
                        buttons: ['yes', 'no'],
                        primary: 'yes',
                        callback: _.bind(function(btn) {
                            if (btn == 'yes') {
                                this.api.put_TextPrFontName(record.name);
                                Common.component.Analytics.trackEvent('ToolBar', 'Font Name');
                            } else {
                                this.toolbar.cmbFontName.setValue(this.api.get_TextProps().get_TextPr().get_FontFamily().get_Name());
                            }
                            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
                        }, this)
                    });
                } else {
                    this.api.put_TextPrFontName(record.name);
                    Common.component.Analytics.trackEvent('ToolBar', 'Font Name');
                }
            }
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onComboOpen: function(needfocus, combo, e, params) {
            if (params && params.fromKeyDown) return;
            _.delay(function() {
                var input = $('input', combo.cmpEl).select();
                if (needfocus) input.focus();
                else if (!combo.isMenuOpen()) input.one('mouseup', function (e) { e.preventDefault(); });
            }, 10);
        },

        onFontSizeSelect: function(combo, record) {
            this._state.fontsize = undefined;
            this._state.type_fontsize = typeof record.value;
            if (this.api)
                this.api.put_TextPrFontSize(this._state.type_fontsize === 'string' ? parseFloat(record.value) : record.value);

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Font Size');
        },

        onFontSizeChanged: function(before, combo, record, e) {
            var value,
                me = this;

            if (before) {
                var item = combo.store.findWhere({
                    displayValue: record.value
                });

                if (!item || isNaN(Common.Utils.String.parseFloat(record.value))) {
                    me._state.type_fontsize = 'number';
                    value = /^\+?(\d*(\.|,)?\d+)$|^\+?(\d+(\.|,)?\d*)$/.exec(record.value);

                    if (!value) {
                        value = this._getApiTextSize();
                        setTimeout(function(){
                            Common.UI.warning({
                                msg: me.textFontSizeErr,
                                callback: function() {
                                    _.defer(function(btn) {
                                        $('input', combo.cmpEl).focus();
                                    })
                                }
                            });
                        }, 1);
                        combo.setRawValue(value);
                        e.preventDefault();
                        return false;
                    }
                }
            } else {
                value = Common.Utils.String.parseFloat(record.value);
                value = value > 300
                    ? 300
                    : value < 1
                        ? 1
                        : Math.floor((value+0.4)*2)/2;

                combo.setRawValue(value);

                this._state.fontsize = undefined;
                if (this.api)
                    this.api.put_TextPrFontSize(value);

                Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            }
        },

        onChangeCase: function(menu, item, e) {
            if (this.api)
                this.api.asc_ChangeTextCase(item.value);
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        showSelectedBulletOnOpen: function(type, picker) {
            var listId = this.api.asc_GetCurrentNumberingId(),
                format = (listId !== null) ? this.api.asc_GetNumberingPr(listId).get_Lvl(this.api.asc_GetCurrentNumberingLvl()).get_Format() : Asc.c_oAscNumberingFormat.None;

            picker.deselectAll(true);
            var store = picker.store;
            for (var i=0; i<store.length; i++) {
                var item = store.at(i);
                if (item.get('type')>0 && this.api.asc_IsCurrentNumberingPreset(item.get('numberingInfo'), type!==2)) {
                    picker.selectByIndex(i, true);
                    break;
                }
            }

            if (type===2) { // multilevel
                this.toolbar.mnuMultiChangeLevel && this.toolbar.mnuMultiChangeLevel.setDisabled(format === Asc.c_oAscNumberingFormat.None);
            } else if (type===0) {
                this.toolbar.mnuMarkerChangeLevel && this.toolbar.mnuMarkerChangeLevel.setDisabled(!(format === Asc.c_oAscNumberingFormat.Bullet || format===Asc.c_oAscNumberingFormat.None && (listId !== null)));
            } else {
                this.toolbar.mnuNumberChangeLevel && this.toolbar.mnuNumberChangeLevel.setDisabled(format === Asc.c_oAscNumberingFormat.Bullet || format === Asc.c_oAscNumberingFormat.None);
            }
        },

        onListShowAfter: function(type, picker, menu, e) {
            if (!(e && e.target===e.currentTarget))
                return;

            this.fillDocListPatterns(type, picker);

            var store = picker.store;
            var arr = [];
            store.each(function(item){
                arr.push({
                    numberingInfo: JSON.parse(item.get('numberingInfo')),
                    divId: item.get('id')
                });
            });
            if (this.api) {
                this.api.SetDrawImagePreviewBulletForMenu(arr, type);
            }
            this.showSelectedBulletOnOpen(type, picker);
        },

        onPageColorShowAfter: function(menu, e) {
            if (!(e && e.target===e.currentTarget))
                return;

            Common.UI.TooltipManager.closeTip('pageColor');

            var picker = this.toolbar.mnuPageColorPicker,
                color = this.api.asc_getPageColor();

            this.toolbar.mnuPageNoFill.setChecked(!color, true);
            if (color) {
                color = color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME ? {
                    color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()),
                    effectValue: color.get_value()
                } : Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
            }
            Common.Utils.ThemeColor.selectPickerColorByEffect(color, picker);
        },

        onApiUpdateListPatterns: function(data) {
            if (!data) return;
            this._listPatterns = [data.singleBullet, data.singleNumbering, data.multiLevel];
        },

        fillDocListPatterns: function(type, picker) {
            if (!this._listPatterns) return;

            var patterns = this._listPatterns[type];
            if (!patterns) return;

            picker.store.remove(picker.store.where({type: 2}));

            var rec = picker.groups.findWhere({type: 2});
            if (!rec && patterns.length>0)
                picker.groups.add({id: picker.options.listSettings.docGroup, caption: picker.options.listSettings.docName, type: 2});
            else if (rec && patterns.length===0)
                picker.groups.remove(rec);

            for (var i=0; i<patterns.length; i++) {
                var item = patterns[i];
                picker.store.add({
                    id: 'id-doc-list-' + Common.UI.getId(),
                    numberingInfo: typeof item === 'string' ? item : JSON.stringify(item),
                    skipRenderOnChange: true,
                    group : picker.options.listSettings.docGroup,
                    type: 2
                });
            }
            if (picker.scroller) {
                picker.scroller.update();
                picker.scroller.scrollTop(0);
            }
            this._listPatterns[type] = null;
        },

        onSelectBullets: function(btn, picker, itemView, record) {
            var rawData = {},
                isPickerSelect = _.isFunction(record.toJSON);

            if (isPickerSelect){
                if (record.get('selected')) {
                    rawData = record.toJSON();
                } else {
                    // record deselected
                    return;
                }
            } else {
                rawData = record;
            }

            if (this.api) {
                var res = this.api.put_ListTypeCustom(JSON.parse(rawData.numberingInfo));
                if (res) {
                    var me = this;
                    res.then(function (data) {
                        if (data) {
                            data = typeof data === 'string' ? data : JSON.stringify(data);
                            me.addListTypeToRecent(picker, {numberingInfo: data});
                        }
                    });
                }
            }

            Common.component.Analytics.trackEvent('ToolBar', 'List Type');
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        addListTypeToRecent: function(picker, data) {
            if (!picker || !data || this.api.asc_CompareNumberingPresets('{"Type":"remove"}', data.numberingInfo))
                return;

            var rec = picker.groups.findWhere({type: 0});
            if (!rec) {
                picker.groups.add({id: picker.options.listSettings.recentGroup, caption: this.toolbar.txtGroupRecent, type: 0}, {at: 0});
            }
            var recents = picker.store.where({type: 0}),
                numberingInfo = data.numberingInfo;
            for (var i=0; i<recents.length; i++) {
                var item = recents[i];
                if (this.api.asc_CompareNumberingPresets(item.get('numberingInfo'), numberingInfo)) {
                    picker.store.remove(item);
                    break;
                }
            }
            picker.store.add({
                id: 'id-recent-list-' + Common.UI.getId(),
                numberingInfo: typeof data.numberingInfo === 'string' ? data.numberingInfo : JSON.stringify(data.numberingInfo),
                skipRenderOnChange: true,
                group : picker.options.listSettings.recentGroup,
                type: 0}, {at: 0});
            recents = picker.store.where({type: 0});
            if (recents && recents.length>picker.options.listSettings.recentCount)
                picker.store.remove(recents.slice(picker.options.listSettings.recentCount, recents.length));
            this.toolbar.saveListPresetToStorage(picker);
        },

        onTextFromFileClick: function(menu, item, e) {
            var me = this, type = item.value;
            if (type === "file") {
                this.api.asc_insertTextFromFile();
            } else if (type === "url") {
                (new Common.Views.ImageFromUrlDialog({
                    label: me.fileUrl,
                    handler: function(result, value) {
                        if (result === 'ok') {
                            if (me.api) {
                                var checkUrl = value.replace(/ /g, '');
                                if (!_.isEmpty(checkUrl)) {
                                    me.api.asc_insertTextFromUrl(checkUrl);
                                }
                            }

                            Common.NotificationCenter.trigger('edit:complete', me.view);
                        }
                    }
                })).show();
            } else if (type === 'storage') {
                Common.NotificationCenter.trigger('storage:document-load', 'insert-text');
            }
        },

        onMarkerSettingsClick: function(type) {
            var me      = this;
            var listId = me.api.asc_GetCurrentNumberingId(),
                level = me.api.asc_GetCurrentNumberingLvl(),
                levelProps = (listId === null) ? null : me.api.asc_GetNumberingPr(listId),
                format = (listId === null) ? Asc.c_oAscNumberingFormat.None : levelProps.get_Lvl(level).get_Format(),
                isNew = listId === null || type===0 && !(format===Asc.c_oAscNumberingFormat.Bullet || format===Asc.c_oAscNumberingFormat.None) ||
                        type===1 && format===Asc.c_oAscNumberingFormat.Bullet,
                props = isNew ? new Asc.CAscNumbering() : levelProps,
                picker = (type===0) ? me.toolbar.mnuMarkersPicker : (type===1 ? me.toolbar.mnuNumbersPicker : me.toolbar.mnuMultilevelPicker);
            if (isNew && picker && picker.store.length>1) {
                var recent = picker.store.findWhere({type: 0}); // find first recent
                !recent && (recent = picker.store.at(1)); // get from library, not None
                recent && props.put_FromJSON(recent.get('numberingInfo'));
            }
            if (props) {
                var me = this;
                if (_.isUndefined(me.fontstore)) {
                    me.fontstore = new Common.Collections.Fonts();
                    var fonts = me.toolbar.cmbFontName.store.toJSON();
                    var arr = [];
                    _.each(fonts, function(font, index){
                        if (!font.cloneid) {
                            arr.push(_.clone(font));
                        }
                    });
                    me.fontstore.add(arr);
                }

                (new DE.Views.ListSettingsDialog({
                    api: me.api,
                    props: props,
                    level: isNew ? 0 : level,
                    type: type,
                    fontStore: me.fontstore,
                    interfaceLang: me.mode.lang,
                    handler: function(result, value) {
                        if (result == 'ok') {
                            if (me.api) {
                                var numberingInfo = props.get_JSONNumbering(type!==2);
                                isNew ? me.api.put_ListTypeCustom(numberingInfo) : me.api.asc_ChangeNumberingLvl(listId, value.props, value.num);
                                me.addListTypeToRecent(picker, {numberingInfo: JSON.stringify(numberingInfo)});
                            }
                        }
                        Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                    }
                })).show();
            }
        },

        onChangeLevelShowAfter: function(type, menu) {
            var me      = this;
            var listId = me.api.asc_GetCurrentNumberingId(),
                level = me.api.asc_GetCurrentNumberingLvl(),
                props = (listId !== null) ? me.api.asc_GetNumberingPr(listId) : null;
            var item = _.find(menu.items, function(item) { return item.options.level == level; });
            menu.clearAll();
            item && item.setChecked(true);
            if (props) {
                this.api.SetDrawImagePreviewBulletChangeListLevel(menu.options.previewIds, props);
            }
        },

        onChangeLevelClick: function(type, menu, item) {
            if (this.api) {
                this.api.asc_SetNumberingLvl(item.options.level);
            }

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onLineSpaceToggle: function(menu, item, state, e) {
            if (!!state) {
                this._state.linespace = undefined;
                if (this.api)
                    this.api.put_PrLineSpacing(c_paragraphLinerule.LINERULE_AUTO, item.value);

                Common.component.Analytics.trackEvent('ToolBar', 'Line Spacing');
                Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            }
        },

        onLineSpaceClick: function(menu, item) {
            if (item.value==='options') {
                this.getApplication().getController('RightMenu').onRightMenuOpen(Common.Utils.documentSettingsType.Paragraph);
                Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            } else if (item.value==='before') {
                item.options.action === 'add' ? this.api.asc_addSpaceBeforeParagraph() : this.api.asc_removeSpaceBeforeParagraph();
            } else if (item.value==='after') {
                item.options.action === 'add' ? this.api.asc_addSpaceAfterParagraph() : this.api.asc_removeSpaceAfterParagraph();
            }
        },

        onLineSpaceShow: function(menu) {
            if (this.api) {
                var toolbar = this.toolbar,
                    before = this.api.asc_haveSpaceBeforeParagraph(),
                    after = this.api.asc_haveSpaceAfterParagraph();
                toolbar.mnuLineSpaceBefore.setCaption(before ? toolbar.textRemSpaceBefore : toolbar.textAddSpaceBefore);
                toolbar.mnuLineSpaceBefore.options.action = before ? 'remove' : 'add';
                toolbar.mnuLineSpaceAfter.setCaption(after ? toolbar.textRemSpaceAfter : toolbar.textAddSpaceAfter);
                toolbar.mnuLineSpaceAfter.options.action = after ? 'remove' : 'add';

            }
        },

        onMenuNonPrintingToggle: function(menu, item, state, e) {
            var me = this;
            if (item.value === 'characters') {
                Common.localStorage.setItem("de-show-hiddenchars", state);
                me.toolbar.btnShowHidenChars.toggle(state, true);

                if (me.api)
                    me.api.put_ShowParaMarks(state);

                Common.NotificationCenter.trigger('edit:complete', me);
                Common.component.Analytics.trackEvent('ToolBar', 'Hidden Characters');
            } else if (item.value === 'table') {
                Common.localStorage.setItem("de-show-tableline", state);
                me.api && me.api.put_ShowTableEmptyLine(state);
                Common.NotificationCenter.trigger('edit:complete', me);
            }
        },

        onNonPrintingToggle: function(btn, state) {
            var me = this;
            if (state) {
                me.toolbar.mnuNonPrinting.items[0].setChecked(true, true);

                Common.component.Analytics.trackEvent('ToolBar', 'Hidden Characters');
            } else {
                me.toolbar.mnuNonPrinting.items[0].setChecked(false, true);
            }

            if (me.api)
                me.api.put_ShowParaMarks(state);

            Common.localStorage.setItem("de-show-hiddenchars", state);
            Common.NotificationCenter.trigger('edit:complete', me);
        },

        onClickPageBreak: function(value, e) {
            if ( value === 'column' ) {
                this.api.put_AddColumnBreak();
                Common.component.Analytics.trackEvent('ToolBar', 'Column Break');
            } else
            if ( value == 'page' ) {
                this.api.put_AddPageBreak();
                Common.component.Analytics.trackEvent('ToolBar', 'Page Break');
            } else {
                this.api.add_SectionBreak( value );
                Common.component.Analytics.trackEvent('ToolBar', 'Section Break');
            }

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onTablePickerSelect: function(picker, columns, rows, e) {
            if (this.api) {
                this.toolbar.fireEvent('inserttable', this.toolbar);
                this.api.put_Table(columns, rows);
            }

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Table');
        },

        onInsertTableShow: function(menu) {
            var selected = this.api.asc_GetSelectedText();
            menu.items[4].setDisabled(!selected || selected.length<1);
        },

        onInsertTableClick: function(menu, item, e) {
            var me = this;
            if (item.value === 'custom') {
                (new Common.Views.InsertTableDialog({
                    handler: function(result, value) {
                        if (result == 'ok') {
                            if (me.api) {
                                me.toolbar.fireEvent('inserttable', me.toolbar);

                                me.api.put_Table(value.columns, value.rows);
                            }

                            Common.component.Analytics.trackEvent('ToolBar', 'Table');
                        }
                        Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                    }
                })).show();
            } else if (item.value == 'draw') {
                item.isChecked() && menu.items[3].setChecked(false, true);
                this.api.SetTableDrawMode(item.isChecked());
            } else if (item.value == 'erase') {
                item.isChecked() && menu.items[2].setChecked(false, true);
                this.api.SetTableEraseMode(item.isChecked());
            } else if (item.value == 'convert') {
                (new DE.Views.TextToTableDialog({
                    props: this.api.asc_PreConvertTextToTable(),
                    handler: function(result, value) {
                        if (result == 'ok' && me.api) {
                            me.api.asc_ConvertTextToTable(value);
                        }
                        Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                    }
                })).show();
            } else if (item.value == 'sse') {
                var oleEditor = this.getApplication().getController('Common.Controllers.ExternalOleEditor').getView('Common.Views.ExternalOleEditor');
                if (oleEditor) {
                    oleEditor.setEditMode(false);
                    oleEditor.show();
                    oleEditor.setOleData("empty");
                }
            }
        },

        onInsertImageClick: function(menu, item, e) {
            var me = this;
            if (item.value === 'file') {
                this.toolbar.fireEvent('insertimage', this.toolbar);

                if (this.api)
                    setTimeout(function() {me.api.asc_addImage();}, 1);

                Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                Common.component.Analytics.trackEvent('ToolBar', 'Image');
            } else if (item.value === 'url') {
                (new Common.Views.ImageFromUrlDialog({
                    handler: function(result, value) {
                        if (result == 'ok') {
                            if (me.api) {
                                var checkUrl = value.replace(/ /g, '');
                                if (!_.isEmpty(checkUrl)) {
                                    me.toolbar.fireEvent('insertimage', me.toolbar);
                                    me.api.AddImageUrl([checkUrl]);

                                    Common.component.Analytics.trackEvent('ToolBar', 'Image');
                                }
                            }

                            Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                        }
                    }
                })).show();
            } else if (item.value === 'storage') {
                Common.NotificationCenter.trigger('storage:image-load', 'add');
            }
        },

        openImageFromStorage: function(type) {
            var me = this;
            if (this.toolbar.mode.canRequestInsertImage) {
                Common.Gateway.requestInsertImage(type);
            } else {
                (new Common.Views.SelectFileDlg({
                    fileChoiceUrl: this.toolbar.mode.fileChoiceUrl.replace("{fileExt}", "").replace("{documentType}", "ImagesOnly")
                })).on('selectfile', function(obj, file){
                    file && (file.c = type);
                    !file.images && (file.images = [{fileType: file.fileType, url: file.url}]); // SelectFileDlg uses old format for inserting image
                    file.url = null;
                    me.insertImage(file);
                }).show();
            }
        },

        insertImageFromStorage: function(data) {
            if (data && data._urls && (!data.c || data.c=='add')) {
                this.toolbar.fireEvent('insertimage', this.toolbar);
                (data._urls.length>0) && this.api.AddImageUrl(data._urls, undefined, data.token);// for loading from storage
                Common.component.Analytics.trackEvent('ToolBar', 'Image');
            }
        },

        insertImage: function(data) { // gateway
            if (data && (data.url || data.images)) {
                data.url && console.log("Obsolete: The 'url' parameter of the 'insertImage' method is deprecated. Please use 'images' parameter instead.");

                var arr = [];
                if (data.images && data.images.length>0) {
                    for (var i=0; i<data.images.length; i++) {
                        data.images[i] && data.images[i].url && arr.push( data.images[i].url);
                    }
                } else
                    data.url && arr.push(data.url);
                data._urls = arr;
            }
            Common.NotificationCenter.trigger('storage:image-insert', data);
        },

        onBtnInsertTextClick: function(btn, e) {
            btn.menu.items.forEach(function(item) {
                if(item.value == btn.options.textboxType) 
                item.setChecked(true);
            });
            if(!this.toolbar.btnInsertText.pressed) {
                this.toolbar.btnInsertText.menu.clearAll();
            } 
            this.onInsertText(btn.options.textboxType, btn, e);
        },

        onMenuInsertTextClick: function(btn, e) {
            var oldType = this.toolbar.btnInsertText.options.textboxType;
            var newType = e.value;
            this.toolbar.btnInsertText.toggle(true);

            if(newType != oldType){
                this.toolbar.btnInsertText.changeIcon({
                    next: e.options.iconClsForMainBtn,
                    curr: this.toolbar.btnInsertText.menu.items.filter(function(item){return item.value == oldType})[0].options.iconClsForMainBtn
                });
                this.toolbar.btnInsertText.updateHint([e.caption, this.views.Toolbar.prototype.tipInsertText]);
                this.toolbar.btnInsertText.options.textboxType = newType;
            }
            this.onInsertText(newType, btn, e);
        },

        onInsertText: function(type, btn, e) {
            if (this.api)
                this._addAutoshape(this.toolbar.btnInsertText.pressed, type);

            if (this.toolbar.btnInsertShape.pressed)
                this.toolbar.btnInsertShape.toggle(false, true);

            Common.NotificationCenter.trigger('edit:complete', this.toolbar, this.toolbar.btnInsertShape);
            Common.component.Analytics.trackEvent('ToolBar', 'Add Text');
        },

        onInsertShapeHide: function(btn, e) {
            if (this.toolbar.btnInsertShape.pressed && !this._isAddingShape) {
                this.toolbar.btnInsertShape.toggle(false, true);
            }
            this._isAddingShape = false;

            Common.NotificationCenter.trigger('edit:complete', this.toolbar, this.toolbar.btnInsertShape);
        },

        onPageOrientSelect: function(menu, item) {
            this._state.pgorient = undefined;
            if (this.api && item.checked) {
                this.api.change_PageOrient(item.value);
            }

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Page Orientation');
        },

        onClearStyleClick: function(btn, e) {
            if (this.api)
                this.api.ClearFormating();

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onCopyStyleToggle: function(btn, state, e) {
            if (this.api)
                this.api.SetPaintFormat(state ? 1 : 0);
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            this.modeAlwaysSetStyle = state;
        },

        onPageSizeClick: function(menu, item, state) {
            if (this.api && state) {
                this._state.pgsize = [0, 0];
                if (item.value !== 'advanced') {
                    if (this.checkPageSize(item.value[0], item.value[1])) {
                        var section = this.api.asc_GetSectionProps();
                        this.onApiPageSize(section.get_W(), section.get_H());
                        return;
                    } else
                        this.api.change_DocSize(item.value[0], item.value[1]);
                } else {
                    var win, props,
                        me = this;
                    win = new DE.Views.PageSizeDialog({
                        checkPageSize: _.bind(this.checkPageSize, this),
                        handler: function(dlg, result) {
                            if (result == 'ok') {
                                props = dlg.getSettings();
                                me.api.change_DocSize(props[0], props[1]);
                                Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                            }
                        }
                    });
                    win.show();
                    win.setSettings(me.api.asc_GetSectionProps());
                }

                Common.component.Analytics.trackEvent('ToolBar', 'Page Size');
            }

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onPageMarginsSelect: function(menu, item) {
            if (this.api) {
                this._state.pgmargins = undefined;
                if (item.value !== 'advanced') {
                    if (this.checkPageSize(undefined, undefined, item.value[1], item.value[3], item.value[0], item.value[2])) {
                        this.onSectionProps(this.api.asc_GetSectionProps());
                        return;
                    } else {
                        var props = new Asc.CDocumentSectionProps();
                        props.put_TopMargin(item.value[0]);
                        props.put_LeftMargin(item.value[1]);
                        props.put_BottomMargin(item.value[2]);
                        props.put_RightMargin(item.value[3]);
                        this.api.asc_SetSectionProps(props);
                    }
                } else {
                    var win, props,
                        me = this;
                    win = new DE.Views.PageMarginsDialog({
                        api: me.api,
                        handler: function(dlg, result) {
                            if (result == 'ok') {
                                props = dlg.getSettings();
                                Common.localStorage.setItem("de-pgmargins-top", props.get_TopMargin());
                                Common.localStorage.setItem("de-pgmargins-left", props.get_LeftMargin());
                                Common.localStorage.setItem("de-pgmargins-bottom", props.get_BottomMargin());
                                Common.localStorage.setItem("de-pgmargins-right", props.get_RightMargin());
                                Common.NotificationCenter.trigger('margins:update', props);

                                me.api.asc_SetSectionProps(props);
                                Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                            }
                        }
                    });
                    win.show();
                    win.setSettings(me.api.asc_GetSectionProps());
                }

                Common.component.Analytics.trackEvent('ToolBar', 'Page Margins');
            }

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        checkPageSize: function(width, height, left, right, top, bottom) {
            var section = this.api.asc_GetSectionProps();
            (width===undefined) && (width = parseFloat(section.get_W().toFixed(4)));
            (height===undefined) && (height = parseFloat(section.get_H().toFixed(4)));
            (left===undefined) && (left = parseFloat(section.get_LeftMargin().toFixed(4)));
            (right===undefined) && (right = parseFloat(section.get_RightMargin().toFixed(4)));
            (top===undefined) && (top = parseFloat(section.get_TopMargin().toFixed(4)));
            (bottom===undefined) && (bottom = parseFloat(section.get_BottomMargin().toFixed(4)));
            var gutterLeft = section.get_GutterAtTop() ? 0 : parseFloat(section.get_Gutter().toFixed(4)),
                gutterTop = section.get_GutterAtTop() ? parseFloat(section.get_Gutter().toFixed(4)) : 0;

            var errmsg = null;
            if (left + right + gutterLeft > width-12.7 )
                errmsg = this.txtMarginsW;
            else if (top + bottom + gutterTop > height-2.6 )
                errmsg = this.txtMarginsH;
            if (errmsg) {
                Common.UI.warning({
                    title: this.notcriticalErrorTitle,
                    msg  : errmsg,
                    callback: function() {
                        Common.NotificationCenter.trigger('edit:complete', this.toolbar);
                    }
                });
                return true;
            }
        },

        onLineNumbersSelect: function(menu, item) {
            if (_.isUndefined(item.value))
                return;

            switch (item.value) {
                case 0:
                    this._state.linenum = undefined;
                    this.api.asc_SetLineNumbersProps(Asc.c_oAscSectionApplyType.Current, null);
                    break;
                case 1:
                case 2:
                case 3:
                    this._state.linenum = undefined;
                    if (this.api && item.checked) {
                        var props = new Asc.CSectionLnNumType();
                        props.put_Restart(item.value==1 ? Asc.c_oAscLineNumberRestartType.Continuous : (item.value==2 ? Asc.c_oAscLineNumberRestartType.NewPage : Asc.c_oAscLineNumberRestartType.NewSection));
                        !!this.api.asc_GetLineNumbersProps() && props.put_CountBy(undefined); 
                        this.api.asc_SetLineNumbersProps(Asc.c_oAscSectionApplyType.Current, props);
                    }
                    break;
                case 4:
                    this.api && this.api.asc_SetParagraphSuppressLineNumbers(item.checked);
                    break;
                case 5:
                    var win,
                        me = this;
                    win = new DE.Views.LineNumbersDialog({
                        applyTo: me._state.linenum_apply,
                        handler: function(dlg, result) {
                            if (result == 'ok') {
                                var settings = dlg.getSettings();
                                me.api.asc_SetLineNumbersProps(settings.type, settings.props);
                                me._state.linenum_apply = settings.type;
                                Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                            }
                        }
                    });
                    win.show();
                    win.setSettings(me.api.asc_GetLineNumbersProps());
                    break;
            }
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onLineNumbersProps: function(props) {
            var index = 0;
            if (props) {
                switch (props.get_Restart()) {
                    case Asc.c_oAscLineNumberRestartType.Continuous:   index = 1; break;
                    case Asc.c_oAscLineNumberRestartType.NewPage:   index = 2; break;
                    case Asc.c_oAscLineNumberRestartType.NewSection: index = 3; break;
                }
            }
            if (this._state.linenum === index)
                return;
            this.toolbar.btnLineNumbers.menu.items[index].setChecked(true);
            this._state.linenum = index;
        },

        onLineNumbersShow: function(menu) {
            menu.items[4].setChecked(this._state.suppress_num);
        },

        onHyphenationSelect: function(menu, item) {
            if (_.isUndefined(item.value))
                return;

            if (item.value==='custom') {
                var win,
                    me = this;
                win = new DE.Views.HyphenationDialog({
                    handler: function(dlg, result) {
                        if (result == 'ok') {
                            me.api.asc_setAutoHyphenationSettings(dlg.getSettings());
                            Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                        }
                    }
                });
                win.show();
                me.api && win.setSettings(me.api.asc_getAutoHyphenationSettings());
            } else {
                this.api && this.api.asc_setAutoHyphenation(!!item.value);
            }
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onHyphenationShow: function(menu) {
            this.api && menu.items[this.api.asc_isAutoHyphenation() ? 1 : 0].setChecked(true);
        },

        onColorSchemaClick: function(menu, item) {
            if (this.api) {
                this.api.asc_ChangeColorSchemeByIdx(item.value);

                Common.component.Analytics.trackEvent('ToolBar', 'Color Scheme');
            }

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onColorSchemaShow: function(menu) {
            if (this.api) {
                var value = this.api.asc_GetCurrentColorSchemeIndex();
                var item = _.find(menu.items, function(item) { return item.value == value; });
                (item) ? item.setChecked(true) : menu.clearAll();
            }
        },

        onDropCapSelect: function(menu, item) {
            if (_.isUndefined(item.value))
                return;

            this._state.dropcap = undefined;
            if (this.api && item.checked) {
                if (item.value === Asc.c_oAscDropCap.None) {
                    this.api.removeDropcap(true);
                } else {
                    var SelectedObjects = this.api.getSelectedElements(),
                        i = -1;
                    while (++i < SelectedObjects.length) {
                        if (SelectedObjects[i].get_ObjectType() == Asc.c_oAscTypeSelectElement.Paragraph) {
                            var pr = SelectedObjects[i].get_ObjectValue();
                            var value = pr.get_FramePr();
                            if (!_.isUndefined(value)) {
                                value = new Asc.asc_CParagraphFrame();
                                value.put_FromDropCapMenu(true);
                                value.put_DropCap(item.value);
                                this.api.put_FramePr(value);
                            } else {
                                this.api.asc_addDropCap((item.value === Asc.c_oAscDropCap.Drop));
                            }
                            break;
                        }
                    }
                }
            }

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Drop Cap');
        },

        onDropCap: function(v) {
            if (this._state.dropcap === v)
                return;

            var index = -1;
            switch (v) {
                case Asc.c_oAscDropCap.None:   index = 0; break;
                case Asc.c_oAscDropCap.Drop:   index = 1; break;
                case Asc.c_oAscDropCap.Margin: index = 2; break;
            }
            if (index < 0)
                this.toolbar.btnDropCap.menu.clearAll();
            else
                this.toolbar.btnDropCap.menu.items[index].setChecked(true);

            this._state.dropcap = v;
        },

        onDropCapAdvancedClick: function(isFrame) {
            var win, props, text,
                me = this;

            if (!isFrame && _.isUndefined(me.fontstore)) {
                me.fontstore = new Common.Collections.Fonts();
                var fonts = me.toolbar.cmbFontName.store.toJSON();
                var arr = [];
                _.each(fonts, function(font, index){
                    if (!font.cloneid) {
                        arr.push(_.clone(font));
                    }
                });
                me.fontstore.add(arr);
            }

            if (me.api){
                var selectedElements = me.api.getSelectedElements(),
                    selectedElementsLenght = selectedElements.length;

                if (selectedElements && _.isArray(selectedElements)){
                    for (var i = 0; i < selectedElementsLenght; i++) {
                        if (selectedElements[i].get_ObjectType() == Asc.c_oAscTypeSelectElement.Paragraph) {
                            props = selectedElements[i].get_ObjectValue();
                            break;
                        }

                    }
                }

                if (props) {
                    (new DE.Views.DropcapSettingsAdvanced({
                        tableStylerRows: 2,
                        tableStylerColumns: 1,
                        fontStore: !isFrame ? me.fontstore : null,
                        paragraphProps: props,
                        borderProps: me.borderAdvancedProps,
                        api: me.api,
                        isFrame: !!isFrame,
                        handler: function(result, value) {
                            if (result == 'ok') {
                                me.borderAdvancedProps = value.borderProps;
                                if (value.paragraphProps &&
                                    ( !isFrame && value.paragraphProps.get_DropCap() === Asc.c_oAscDropCap.None ||
                                      isFrame && value.paragraphProps.get_Wrap() === c_oAscFrameWrap.None)) {
                                    me.api.removeDropcap(!isFrame);
                                } else
                                    me.api.put_FramePr(value.paragraphProps);
                            }

                            Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                        }
                    })).show();
                }
            }
        },

        onControlsSelect: function(menu, item) {
            if (!(this.mode && this.mode.canFeatureContentControl)) return;

            if (item.value == 'settings' || item.value == 'remove') {
                if (this.api.asc_IsContentControl()) {
                    var props = this.api.asc_GetContentControlProperties();
                    if (props) {
                        var id = props.get_InternalId();
                        if (item.value == 'settings') {
                            var me = this;
                            (new DE.Views.ControlSettingsDialog({
                                props: props,
                                api: me.api,
                                controlLang: me._state.lang,
                                interfaceLang: me.mode.lang,
                                handler: function(result, value) {
                                    if (result == 'ok') {
                                        me.api.asc_SetContentControlProperties(value, id);
                                    }

                                    Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                                }
                            })).show();

                        } else {
                            this.api.asc_RemoveContentControlWrapper(id);
                            Common.component.Analytics.trackEvent('ToolBar', 'Remove Content Control');
                        }
                    }
                }
            } else {
                var isnew = (item.value.indexOf('new-')==0),
                    oPr, oFormPr;
                if (isnew) {
                    oFormPr = new AscCommon.CSdtFormPr();
                    this.toolbar.fireEvent('insertcontrol', this.toolbar);
                }
                if (item.value == 'plain' || item.value == 'rich')
                    this.api.asc_AddContentControl((item.value=='plain') ? Asc.c_oAscSdtLevelType.Inline : Asc.c_oAscSdtLevelType.Block);
                else if (item.value.indexOf('picture')>=0)
                    this.api.asc_AddContentControlPicture(oFormPr);
                else if (item.value.indexOf('checkbox')>=0 || item.value.indexOf('radiobox')>=0) {
                    if (isnew) {
                        oPr = new AscCommon.CSdtCheckBoxPr();
                        (item.value.indexOf('radiobox')>=0) && oPr.put_GroupKey(this.textGroup + ' 1');
                    }
                    this.api.asc_AddContentControlCheckBox(oPr, oFormPr);
                } else if (item.value == 'date')
                    this.api.asc_AddContentControlDatePicker();
                else if (item.value.indexOf('combobox')>=0 || item.value.indexOf('dropdown')>=0)
                    this.api.asc_AddContentControlList(item.value.indexOf('combobox')>=0, oPr, oFormPr);
                else if (item.value == 'new-field') {
                    var props   = new AscCommon.CContentControlPr();
                    oPr = new AscCommon.CSdtTextFormPr();
                    props.put_TextFormPr(oPr);
                    props.put_FormPr(oFormPr);
                    this.api.asc_AddContentControlTextForm(props);
                }

                Common.component.Analytics.trackEvent('ToolBar', 'Add Content Control');
            }

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onNewControlsColor: function(picker, color) {
            this.toolbar.mnuControlsColorPicker.addNewColor();
        },

        onNoControlsColor: function(item) {
            if (!item.isChecked())
                this.api.asc_SetGlobalContentControlShowHighlight(true, 220, 220, 220);
            else
                this.api.asc_SetGlobalContentControlShowHighlight(false);
        },

        onSelectControlsColor: function(picker, color) {
            var clr = Common.Utils.ThemeColor.getRgbColor(color);
            if (this.api) {
                this.api.asc_SetGlobalContentControlShowHighlight(true, clr.get_r(), clr.get_g(), clr.get_b());
            }

            Common.component.Analytics.trackEvent('ToolBar', 'Content Controls Color');
        },

        onColumnsSelect: function(menu, item) {
            if (_.isUndefined(item.value))
                return;

            this._state.columns = undefined;

            if (this.api) {
                if (item.value == 'advanced') {
                    var win,
                        me = this;
                    win = new DE.Views.CustomColumnsDialog({
                        handler: function(dlg, result) {
                            if (result == 'ok') {
                                props = dlg.getSettings();
                                me.api.asc_SetColumnsProps(props);
                                Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                            }
                        }
                    });
                    win.show();
                    win.setSettings(me.api.asc_GetColumnsProps());
                } else if (item.checked) {
                    var props = new Asc.CDocumentColumnsProps(),
                        cols = item.value,
                        def_space = 12.5;
                    props.put_EqualWidth(cols<3);

                    if (cols<3) {
                        props.put_Num(cols+1);
                        props.put_Space(def_space);
                    } else {
                        var total = this.api.asc_GetColumnsProps().get_TotalWidth(),
                            left = (total - def_space*2)/3,
                            right = total - def_space - left;
                        props.put_ColByValue(0, (cols == 3) ? left : right, def_space);
                        props.put_ColByValue(1, (cols == 3) ? right : left, 0);
                    }
                    this.api.asc_SetColumnsProps(props);
                }
            }

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Insert Columns');
        },

        onColumnsProps: function(props) {
            if (props) {
                var equal = props.get_EqualWidth(),
                    num = (equal) ? props.get_Num() : props.get_ColsCount(),
                    def_space = 12.5,
                    index = -1;

                if (equal && num<4 && (num==1 ||  Math.abs(props.get_Space() - def_space)<0.1))
                    index = (num-1);
                else if (!equal && num==2) {
                    var left = props.get_Col(0).get_W(),
                        space = props.get_Col(0).get_Space(),
                        right = props.get_Col(1).get_W(),
                        total = props.get_TotalWidth();
                    if (Math.abs(space - def_space)<0.1) {
                        var width = (total - space*2)/3;
                        if ( left<right && Math.abs(left - width)<0.1 )
                            index = 3;
                        else if (left>right && Math.abs(right - width)<0.1)
                            index = 4;
                    }
                }
                if (this._state.columns === index)
                    return;

                if (index < 0)
                    this.toolbar.btnColumns.menu.clearAll();
                else
                    this.toolbar.btnColumns.menu.items[index].setChecked(true);
                this._state.columns = index;
            }
        },

        onSelectChart: function(type) {
            var me      = this,
                chart = false;

            var selectedElements = me.api.getSelectedElements();
            if (selectedElements && _.isArray(selectedElements)) {
                for (var i = 0; i< selectedElements.length; i++) {
                    if (Asc.c_oAscTypeSelectElement.Image == selectedElements[i].get_ObjectType()) {
                        var elValue = selectedElements[i].get_ObjectValue().get_ChartProperties();
                        if (elValue) {
                            chart = elValue;
                            break;
                        }
                    }
                }
            }

            if (chart) {
                var isCombo = (type==Asc.c_oAscChartTypeSettings.comboBarLine || type==Asc.c_oAscChartTypeSettings.comboBarLineSecondary ||
                               type==Asc.c_oAscChartTypeSettings.comboAreaBar || type==Asc.c_oAscChartTypeSettings.comboCustom);
                if (isCombo && chart.getSeries().length<2) {
                    Common.NotificationCenter.trigger('showerror', Asc.c_oAscError.ID.ComboSeriesError, Asc.c_oAscError.Level.NoCritical);
                } else
                    chart.changeType(type);
                Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            } else {
                if (!this.diagramEditor)
                    this.diagramEditor = this.getApplication().getController('Common.Controllers.ExternalDiagramEditor').getView('Common.Views.ExternalDiagramEditor');

                if (this.diagramEditor && me.api) {
                    this.diagramEditor.setEditMode(false);
                    this.diagramEditor.show();

                    chart = me.api.asc_getChartObject(type);
                    if (chart) {
                        this.diagramEditor.setChartData(new Asc.asc_CChartBinary(chart));
                    }
                    me.toolbar.fireEvent('insertchart', me.toolbar);
                }
            }
        },

        onInsertTextart: function (data) {
            if (this.api) {
                this.toolbar.fireEvent('inserttextart', this.toolbar);
                this.api.AddTextArt(data);

                if (this.toolbar.btnInsertShape.pressed)
                    this.toolbar.btnInsertShape.toggle(false, true);

                Common.NotificationCenter.trigger('edit:complete', this.toolbar, this.toolbar.btnInsertTextArt);
                Common.component.Analytics.trackEvent('ToolBar', 'Add Text Art');
            }
        },

        onInsertPageNumberClick: function(picker, item, record, e) {
            if (this.api)
                this.api.put_PageNum(record.get('data').type, record.get('data').subtype);

            if (e.type !== 'click')
                this.toolbar.btnEditHeader.menu.hide();

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Page Number');
        },
        
        onInsertPageCountClick: function(item, e) {
            if (this.api)
                this.api.asc_AddPageCount();

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Pages Count');
        },

        onEditHeaderFooterClick: function(menu, item) {
            if (this.api) {
                if (item.value == 'header')
                    this.api.GoToHeader(this.api.getCurrentPage());
                else if (item.value == 'footer')
                    this.api.GoToFooter(this.api.getCurrentPage());
                else if (item.value == 'header-remove')
                    this.api.asc_RemoveHeader(this.api.getCurrentPage());
                else if (item.value == 'footer-remove')
                    this.api.asc_RemoveFooter(this.api.getCurrentPage());
                else
                    return;

                Common.NotificationCenter.trigger('edit:complete', this.toolbar);
                Common.component.Analytics.trackEvent('ToolBar', 'Edit ' + item.value);
            }
        },

        onPageNumCurrentPosClick: function(item, e) {
            if (this.api)
                this.api.put_PageNum(-1);

            if (e.type !== 'click')
                this.toolbar.btnEditHeader.menu.hide();
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Page Number');
        },

        onBtnBlankPageClick: function(btn) {
            if (this.api)
                this.api.asc_AddBlankPage();

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Blank Page');
        },

        onWatermarkSelect: function(menu, item) {
            if (this.api) {
                if (item.value == 'remove')
                    this.api.asc_WatermarkRemove();
                else {
                    var me = this;
                    if (_.isUndefined(me.fontstore)) {
                        me.fontstore = new Common.Collections.Fonts();
                        var fonts = me.toolbar.cmbFontName.store.toJSON();
                        var arr = [];
                        _.each(fonts, function(font, index){
                            if (!font.cloneid) {
                                arr.push(_.clone(font));
                            }
                        });
                        me.fontstore.add(arr);
                    }

                    (new DE.Views.WatermarkSettingsDialog({
                        props: me.api.asc_GetWatermarkProps(),
                        api: me.api,
                        lang: me.mode.lang,
                        disableNetworkFunctionality: me.mode.disableNetworkFunctionality,
                        storage: me.mode.canRequestInsertImage || me.mode.fileChoiceUrl && me.mode.fileChoiceUrl.indexOf("{documentType}")>-1,
                        fontStore: me.fontstore,
                        handler: function(result, value) {
                            if (result == 'ok') {
                                me.api.asc_SetWatermarkProps(value);
                            }
                            Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                        }
                    })).show();
                }
                Common.NotificationCenter.trigger('edit:complete', this.toolbar);
                Common.component.Analytics.trackEvent('ToolBar', 'Edit ' + item.value);
            }
        },

        onListStyleSelect: function(combo, record) {
            this._state.prstyle = undefined;
            if (this.api)
                this.api.put_Style(record.get('title'));

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Style');
        },

        onListStyleBeforeHide: function(item, e) {
            this.toolbar.listStyles.isStylesNotClosable = false;
        },

        onListStyleContextMenu: function (combo, record, e) {
            if (!this.toolbar.mode.canEditStyles)
             return;

            var showPoint;
            var menu = this.toolbar.styleMenu;
            var api = this.api;

            var isAllCustomDeleted = true;
            var isAllDefailtNotModifaed = true;
            _.each(window.styles.get_MergedStyles(), function (style) {
                var isDefault = api.asc_IsStyleDefault(style.get_Name());
                if (isDefault) {
                    if (api.asc_IsDefaultStyleChanged(style.get_Name())) {
                        isAllDefailtNotModifaed = false;
                    }
                } else {
                    isAllCustomDeleted = false;
                }
            });
            menu.items[3].setDisabled(isAllDefailtNotModifaed);
            menu.items[4].setDisabled(isAllCustomDeleted);

            var parentOffset = this.toolbar.$el.offset(),
                top = e.clientY*Common.Utils.zoom();
            if ($('#header-container').is(":visible")) {
                top -= $('#header-container').height()
            }
            showPoint = [e.clientX*Common.Utils.zoom(), top - parentOffset.top];

            if (record != undefined) {
                //itemMenu
                var isDefault = this.api.asc_IsStyleDefault(record.get("title"));
                menu.items[0].setVisible(true);
                menu.items[1].setVisible(!isDefault);
                menu.items[2].setVisible(isDefault);
                menu.items[3].setVisible(isDefault);
                menu.items[4].setVisible(!isDefault);

                menu.items[2].setDisabled(!this.api.asc_IsDefaultStyleChanged(record.get("title")));

                for (var i in menu.items) {
                    menu.items[i].styleTitle = record.get("title");
                }

                var selectedElements = api.getSelectedElements(),
                    isParagraph = false;
                if (selectedElements && _.isArray(selectedElements)){
                    for (var i = 0; i <selectedElements.length; i++) {
                        if (Asc.c_oAscTypeSelectElement.Paragraph == selectedElements[i].get_ObjectType()) {
                            isParagraph = true; break;
                        }
                    }
                }
                menu.items[0].setDisabled(!isParagraph);
            } else {
                //comboMenu
                menu.items[0].setVisible(false);
                menu.items[1].setVisible(false);
                menu.items[2].setVisible(false);
                menu.items[3].setVisible(true);
                menu.items[4].setVisible(true);
            }

            if (showPoint != undefined) {
                var menuContainer = this.toolbar.$el.find('#menu-style-container');
                if (!menu.rendered) {
                    if (menuContainer.length < 1) {
                        menuContainer = $('<div id="menu-style-container" style="position: absolute; z-index: 10000;"><div class="dropdown-toggle" data-toggle="dropdown"></div></div>', menu.id);
                        $(this.toolbar.el).append(menuContainer);
                    }
                    menu.render(menuContainer);
                    menu.cmpEl.attr({tabindex: "-1"});
                }

                menuContainer.css({
                    left: showPoint[0],
                    top: showPoint[1]
                });

                var parent = $(menu.el);
                parent.trigger($.Event('show.bs.dropdown'));
                parent.trigger($.Event('hide.bs.dropdown'));
                if (menu.isVisible()) {
                    $(menu).toggleClass('open').trigger('shown.bs.dropdown');
                }


                this.toolbar.listStyles.isStylesNotClosable = true;
                menu.show();
            }
        },

        onSaveStyle: function (style) {
            window.styles_loaded = false;
            var me = this, win;

            if (me.api) {
                var handlerDlg = function (dlg, result) {
                    if (result == 'ok') {
                        var title = dlg.getTitle(),
                            nextStyle = dlg.getNextStyle(),
                            characterStyle = style.get_Link();
                        me._state.prstyle = title;
                        style.put_Name(title);
                        characterStyle.put_Name(title + '_character');
                        style.put_Next((nextStyle) ? nextStyle.asc_getName() : null);
                        me.api.asc_AddNewStyle(style);
                    }
                    Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                };

                var formats = [],
                    mainController = me.getApplication().getController('Main');
                _.each(window.styles.get_MergedStyles(), function (style) {
                    formats.push({value: style, displayValue: mainController.translationTable[style.get_Name()] || style.get_Name()})
                });

                win = new DE.Views.StyleTitleDialog({
                    handler: handlerDlg,
                    formats: formats
                });
                win.show();
            }

            Common.component.Analytics.trackEvent('ToolBar', 'Save as Style');
        },

        onMenuSaveStyle: function(item, e) {
            var me = this;
            if (me.api && !me.toolbar.listStylesAdditionalMenuItem.isDisabled()) {
                me.onSaveStyle(me.api.asc_GetStyleFromFormatting());
            }
        },

//        onAfterKeydownMenu: function (e) {
//            if (e.keyCode == Common.UI.Keys.ESC)  {
//                if ($('#menu-style-container').hasClass("open")) {
//                    $('#menu-style-container').removeClass('open').trigger('hidden.bs.dropdown');
//                } else if ($(e.currentTarget).hasClass("open")) {
//                    $(e.currentTarget).removeClass('open').trigger('hidden.bs.dropdown');
//                }
//            }
//        },

        onUpdateStyle: function(newStyle) {
            if (this.api) {
                newStyle.put_Name(this._state.prstyle);
                this.api.asc_AddNewStyle(newStyle);
            }
        },

        _getApiTextSize: function () {
            var out_value   = 12,
                textPr      = this.api.get_TextProps();

            if (textPr && textPr.get_TextPr) {
                out_value = textPr.get_TextPr().get_FontSize();
            }

            return out_value;
        },

        onAutoFontColor: function(e) {
            this._state.clrtext = this._state.clrtext_asccolor = undefined;

            var color = new Asc.asc_CColor();
            color.put_auto(true);
            this.api.put_TextColor(color);

            this.toolbar.btnFontColor.currentColor = {color: color, isAuto: true};
            this.toolbar.mnuFontColorPicker.currentColor = {color: color, isAuto: true};
        },

        onSelectHighlightColor: function(picker, color) {
            this._setMarkerColor(color, 'menu');
        },

        onSelectFontColor: function(btn, color) {
            this._state.clrtext = this._state.clrtext_asccolor = undefined;

            this.toolbar.btnFontColor.currentColor = color;
            this.toolbar.btnFontColor.setColor((typeof(color) == 'object') ? (color.isAuto ? '000' : color.color) : color);

            this.toolbar.mnuFontColorPicker.currentColor = color;
            if (this.api)
                this.api.put_TextColor(color.isAuto ? color.color : Common.Utils.ThemeColor.getRgbColor(color));

            Common.component.Analytics.trackEvent('ToolBar', 'Text Color');
        },

        onParagraphColorPickerSelect: function(btn, color) {
            this._state.clrback = this._state.clrshd_asccolor = undefined;

            this.toolbar.btnParagraphColor.currentColor = color;
            this.toolbar.btnParagraphColor.setColor(color);

            this.toolbar.mnuParagraphColorPicker.currentColor = color;
            if (this.api) {
                if (color == 'transparent') {
                    this.api.put_ParagraphShade(false);
                } else {
                    this.api.put_ParagraphShade(true, Common.Utils.ThemeColor.getRgbColor(color));
                }
            }

            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onSelectPageColor: function(btn, color) {
            if (this.api)
                this.api.asc_putPageColor(Common.Utils.ThemeColor.getRgbColor(color));

            Common.component.Analytics.trackEvent('ToolBar', 'Page Color');
        },

        onPageNoFillClick: function(item) {
            if (this.api && item.checked)
                this.api.asc_putPageColor(null);

            Common.component.Analytics.trackEvent('ToolBar', 'Page Color');
        },

        eyedropperStart: function () {
            if (this.toolbar.btnCopyStyle.pressed) {
                this.toolbar.btnCopyStyle.toggle(false, true);
                this.api.SetPaintFormat(AscCommon.c_oAscFormatPainterState.kOff);
                this.modeAlwaysSetStyle = false;
            }
            if (this.toolbar.btnHighlightColor.pressed)
                this.toolbar.btnHighlightColor.toggle(false, true);
        },

        onEyedropperStart: function (btn) {
            this.toolbar._isEyedropperStart = true;
            this.api.asc_startEyedropper(_.bind(btn.eyedropperEnd, btn));
        },

        onEyedropperEnd: function () {
            this.toolbar._isEyedropperStart = false;
        },

        onBtnHighlightColor: function(btn) {
            if (btn.pressed) {
                this._setMarkerColor(btn.currentColor);
                Common.component.Analytics.trackEvent('ToolBar', 'Highlight Color');
            }
            else {
                this.api.SetMarkerFormat(false);
            }
        },

        onBtnFontColor: function() {
            this.toolbar.mnuFontColorPicker.trigger('select', this.toolbar.mnuFontColorPicker, this.toolbar.mnuFontColorPicker.currentColor);
        },

        onBtnParagraphColor: function() {
            this.toolbar.mnuParagraphColorPicker.trigger('select', this.toolbar.mnuParagraphColorPicker, this.toolbar.mnuParagraphColorPicker.currentColor);
        },

        onHighlightTransparentClick: function(item, e) {
            this._setMarkerColor('transparent', 'menu');
        },

        onParagraphColor: function(shd) {
            var picker = this.toolbar.mnuParagraphColorPicker, clr;
            if (shd!==null && shd!==undefined && shd.get_Value()===Asc.c_oAscShdClear) {
                var color = shd.get_Color();
                if (color) {
                    if (color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                        clr = {color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()), effectValue: color.get_value() };
                    } else {
                        clr = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
                    }
                } else
                    clr= 'transparent';
            } else {
                clr = 'transparent';
            }

            var type1 = typeof(clr),
                type2 = typeof(this._state.clrback);
            if ( (type1 !== type2) || (type1=='object' &&
                (clr.effectValue!==this._state.clrback.effectValue || this._state.clrback.color.indexOf(clr.color)<0)) ||
                (type1!='object' && this._state.clrback.indexOf(clr)<0 )) {
                Common.Utils.ThemeColor.selectPickerColorByEffect(clr, picker);
                this._state.clrback = clr;
            }
            this._state.clrshd_asccolor = shd;
        },

        onApiTextColor: function(color) {
            if (color.get_auto()) {
                if (this._state.clrtext !== 'auto') {
                    this.toolbar.btnFontColor.setAutoColor(true);
                    this.toolbar.mnuFontColorPicker.clearSelection();
                    this._state.clrtext = 'auto';
                }
            } else {
                var picker = this.toolbar.mnuFontColorPicker, clr;

                if (color) {
                    color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME ?
                        clr = {color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()), effectValue: color.get_value()} :
                        clr = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
                }

                var type1 = typeof(clr),
                    type2 = typeof(this._state.clrtext);

                if ( (this._state.clrtext == 'auto') || (type1 !== type2) || (type1=='object' &&
                    (clr.effectValue!==this._state.clrtext.effectValue || this._state.clrtext.color.indexOf(clr.color)<0)) ||
                    (type1!='object' && this._state.clrtext.indexOf(clr)<0 )) {

                    this.toolbar.btnFontColor.setAutoColor(false);
                    Common.Utils.ThemeColor.selectPickerColorByEffect(clr, picker);
                    this._state.clrtext = clr;
                }
            }
            this._state.clrtext_asccolor = color;
        },

        onApiAutoShapes: function() {
            var me = this;
            var onShowBefore = function(menu) {
                me.fillAutoShapes();
                menu.off('show:before', onShowBefore);
            };
            me.toolbar.btnInsertShape.menu.on('show:before', onShowBefore);
        },

        fillAutoShapes: function() {
            var me = this;

            var menuitem = new Common.UI.MenuItem({
                template: _.template('<div id="id-toolbar-menu-insertshape" class="menu-insertshape"></div>')
            });
            me.toolbar.btnInsertShape.menu.addItem(menuitem);

            var recents = Common.localStorage.getItem('de-recent-shapes');

            var shapePicker = new Common.UI.DataViewShape({
                el: $('#id-toolbar-menu-insertshape'),
                itemTemplate: _.template('<div class="item-shape" id="<%= id %>"><svg width="20" height="20" class=\"icon uni-scale\"><use xlink:href=\"#svg-icon-<%= data.shapeType %>\"></use></svg></div>'),
                groups: me.getApplication().getCollection('ShapeGroups'),
                parentMenu: me.toolbar.btnInsertShape.menu,
                restoreHeight: 652,
                textRecentlyUsed: me.textRecentlyUsed,
                recentShapes: recents ? JSON.parse(recents) : null
            });
            shapePicker.on('item:click', function(picker, item, record, e) {
                if (me.api) {
                    if (record) {
                        me._addAutoshape(true, record.get('data').shapeType);
                        me._isAddingShape = true;
                    }

                    if (me.toolbar.btnInsertText.pressed) {
                        me.toolbar.btnInsertText.toggle(false, true);
                    }

                    if (e.type !== 'click')
                        me.toolbar.btnInsertShape.menu.hide();
                    Common.NotificationCenter.trigger('edit:complete', me.toolbar, me.toolbar.btnInsertShape);
                    Common.component.Analytics.trackEvent('ToolBar', 'Add Shape');
                }
            });
        },

        fillEquations: function() {
            if (!this.toolbar.btnInsertEquation.rendered || this.toolbar.btnInsertEquation.menu.items.length>0) return;

            var me = this, equationsStore = this.getApplication().getCollection('EquationGroups');

            me.toolbar.btnInsertEquation.menu.removeAll();
            var onShowAfter = function(menu) {
                for (var i = 0; i < equationsStore.length; ++i) {
                    var equationPicker = new Common.UI.DataViewSimple({
                        el: $('#id-toolbar-menu-equationgroup' + i, menu.items[i].$el),
                        parentMenu: menu.items[i].menu,
                        store: equationsStore.at(i).get('groupStore'),
                        scrollAlwaysVisible: true,
                        itemTemplate: _.template(
                            '<div class="item-equation" style="" >' +
                                '<div class="equation-icon" style="background-position:<%= posX %>px <%= posY %>px;width:<%= width %>px;height:<%= height %>px;" id="<%= id %>"></div>' +
                            '</div>')
                    });
                    equationPicker.on('item:click', function(picker, item, record, e) {
                        if (me.api) {
                            if (record)
                                me.api.asc_AddMath(record.get('data').equationType);

                            if (me.toolbar.btnInsertText.pressed) {
                                me.toolbar.btnInsertText.toggle(false, true);
                            }
                            if (me.toolbar.btnInsertShape.pressed) {
                                me.toolbar.btnInsertShape.toggle(false, true);
                            }

                            if (e.type !== 'click')
                                me.toolbar.btnInsertEquation.menu.hide();
                            Common.NotificationCenter.trigger('edit:complete', me.toolbar, me.toolbar.btnInsertEquation);
                            Common.component.Analytics.trackEvent('ToolBar', 'Add Equation');
                        }
                    });
                }
                menu.off('show:after', onShowAfter);
            };
            me.toolbar.btnInsertEquation.menu.on('show:after', onShowAfter);

            for (var i = 0; i < equationsStore.length; ++i) {
                var equationGroup = equationsStore.at(i);
                var menuItem = new Common.UI.MenuItem({
                    caption: equationGroup.get('groupName'),
                    menu: new Common.UI.Menu({
                        menuAlign: 'tl-tr',
                        items: [
                            { template: _.template('<div id="id-toolbar-menu-equationgroup' + i +
                                '" class="menu-shape margin-left-5" style="width:' + (equationGroup.get('groupWidth') + 8) + 'px; ' +
                                equationGroup.get('groupHeightStr') + '"></div>') }
                        ]
                    })
                });
                me.toolbar.btnInsertEquation.menu.addItem(menuItem);
            }
        },

        onInsertEquationClick: function() {
            if (this.api && !this._state.in_equation) {
                this.api.asc_AddMath();
                Common.component.Analytics.trackEvent('ToolBar', 'Add Equation');
            }
            Common.NotificationCenter.trigger('edit:complete', this.toolbar, this.toolbar.btnInsertEquation);
        },

        onInsertSymbolClick: function() {
            if (this.dlgSymbolTable && this.dlgSymbolTable.isVisible()) return;

            if (this.api) {
                var me = this,
                    selected = me.api.asc_GetSelectedText();
                me.dlgSymbolTable = new Common.Views.SymbolTableDialog({
                    api: me.api,
                    lang: me.mode.lang,
                    modal: false,
                    type: 1,
                    special: true,
                    showShortcutKey: true,
                    font: selected && selected.length>0 ? this.api.get_TextProps().get_TextPr().get_FontFamily().get_Name() : undefined,
                    symbol: selected && selected.length>0 ? selected.charAt(0) : undefined,
                    buttons: [{value: 'ok', caption: this.textInsert}, 'close'],
                    handler: function(dlg, result, settings) {
                        if (result == 'ok') {
                            me.insertSymbol(settings.font, settings.code, settings.special, settings.speccharacter);
                        } else
                            Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                    }
                });
                me.dlgSymbolTable.show();
                me.dlgSymbolTable.on('symbol:dblclick', function(cmp, result, settings) {
                    me.insertSymbol(settings.font, settings.code, settings.special, settings.speccharacter);
                });
                me.dlgSymbolTable.on('close', function(obj){
                    Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                });
            }
        },

        onInsertSymbolItemClick: function(picker, item, record, e) {
            if (this.api && record)
                this.insertSymbol(record.get('font'), record.get('symbol'), record.get('special'));
        },

        insertSymbol: function(fontRecord, symbol, special, specCharacter){
            var font = fontRecord ? fontRecord: this.api.get_TextProps().get_TextPr().get_FontFamily().get_Name();
            this.api.asc_insertSymbol(font, symbol, special);
            !specCharacter && this.toolbar.saveSymbol(symbol, font);
        },

        onApiMathTypes: function(equation) {
            this._equationTemp = equation;
            var me = this;
            var onShowBefore = function(menu) {
                me.onMathTypes(me._equationTemp);
                if (me._equationTemp && me._equationTemp.get_Data().length>0)
                    me.fillEquations();
                me.toolbar.btnInsertEquation.menu.off('show:before', onShowBefore);
            };
            me.toolbar.btnInsertEquation.menu.on('show:before', onShowBefore);
        },

        onMathTypes: function(equation) {
            equation = equation || this._equationTemp;

            var equationgrouparray = [],
                equationsStore = this.getCollection('EquationGroups');

            if (equationsStore.length>0)
                return;

            // equations groups

            var c_oAscMathMainTypeStrings = {};

            // [translate, count cells, scroll]

            c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.Symbol       ] = [this.textSymbols, 11, false, 'svg-icon-symbols'];
            c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.Fraction     ] = [this.textFraction, 4, false, 'svg-icon-fraction'];
            c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.Script       ] = [this.textScript, 4, false, 'svg-icon-script'];
            c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.Radical      ] = [this.textRadical, 4, false, 'svg-icon-radical'];
            c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.Integral     ] = [this.textIntegral, 3, true, 'svg-icon-integral'];
            c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.LargeOperator] = [this.textLargeOperator, 5, true, 'svg-icon-largeOperator'];
            c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.Bracket      ] = [this.textBracket, 4, true, 'svg-icon-bracket'];
            c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.Function     ] = [this.textFunction, 3, true, 'svg-icon-function'];
            c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.Accent       ] = [this.textAccent, 4, false, 'svg-icon-accent'];
            c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.LimitLog     ] = [this.textLimitAndLog, 3, false, 'svg-icon-limAndLog'];
            c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.Operator     ] = [this.textOperator, 4, false, 'svg-icon-operator'];
            c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.Matrix       ] = [this.textMatrix, 4, true, 'svg-icon-matrix'];

            // equations sub groups

            // equations types

            var translationTable = {}, name = '', translate = '';
            for (name in Common.define.c_oAscMathType) {
                if (Common.define.c_oAscMathType.hasOwnProperty(name)) {
                    var arr = name.split('_');
                    if (arr.length==2 && arr[0]=='Symbol') {
                        translate = 'txt' + arr[0] + '_' + arr[1].toLocaleLowerCase();
                    } else
                        translate = 'txt' + name;
                    translationTable[Common.define.c_oAscMathType[name]] = this[translate];
                }
            }
            var i,id = 0, count = 0, length = 0, width = 0, height = 0, store = null, list = null, eqStore = null, eq = null, data;

            if (equation) {
                data = equation.get_Data();
                count = data.length;
                if (count) {
                    for (var j = 0; j < count; ++j) {
                        var group = data[j];
                        id = group.get_Id();
                        width = group.get_W();
                        height = group.get_H();

                        store = new Backbone.Collection([], {
                            model: DE.Models.EquationModel
                        });

                        if (store) {
                            var allItemsCount = 0, itemsCount = 0, ids = 0, arr = [];
                            length = group.get_Data().length;
                            for (i = 0; i < length; ++i) {
                                eqStore = group.get_Data()[i];
                                itemsCount = eqStore.get_Data().length;
                                for (var p = 0; p < itemsCount; ++p) {
                                    eq = eqStore.get_Data()[p];
                                    ids = eq.get_Id();

                                    translate = '';

                                    if (translationTable.hasOwnProperty(ids)) {
                                        translate = translationTable[ids];
                                    }
                                    arr.push({
                                        data            : {equationType: ids},
                                        tip             : translate,
                                        allowSelected   : true,
                                        selected        : false,
                                        width           : eqStore.get_W(),
                                        height          : eqStore.get_H(),
                                        posX            : -eq.get_X(),
                                        posY            : -eq.get_Y()
                                    });
                                }

                                allItemsCount += itemsCount;
                            }
                            store.add(arr);
                            width = c_oAscMathMainTypeStrings[id][1] * (width + 10);  // 4px margin + 4px margin + 1px border + 1px border

                            var normHeight = parseInt(370 / (height + 10)) * (height + 10);
                            equationgrouparray.push({
                                groupName   : c_oAscMathMainTypeStrings[id][0],
                                groupStore  : store,
                                groupWidth  : width,
                                groupHeight : normHeight,
                                groupHeightStr : c_oAscMathMainTypeStrings[id][2] ? ' height:'+ normHeight +'px!important; ' : '',
                                groupIcon: c_oAscMathMainTypeStrings[id][3]
                            });
                        }
                    }
                    equationsStore.add(equationgrouparray);
                    // this.fillEquations();
                }
            }
        },

        activateControls: function() {
            this.toolbar.lockToolbar(Common.enumLock.disableOnStart, false);
            this.toolbar.lockToolbar(Common.enumLock.undoLock, this._state.can_undo!==true, {array: [this.toolbar.btnUndo]});
            this.toolbar.lockToolbar(Common.enumLock.redoLock, this._state.can_redo!==true, {array: [this.toolbar.btnRedo]});
            this.toolbar.lockToolbar(Common.enumLock.copyLock, this._state.can_copycut!==true, {array: [this.toolbar.btnCopy, this.toolbar.btnCut]});
            this._state.activated = true;

            var props = this.api.asc_GetSectionProps();
            this.onApiPageSize(props.get_W(), props.get_H());
        },

        updateThemeColors: function() {
            var updateColors = function(picker, defaultColorIndex) {
                if (picker) {
                    var clr;

                    var effectcolors = Common.Utils.ThemeColor.getEffectColors();
                    for (var i = 0; i < effectcolors.length; i++) {
                        if (typeof(picker.currentColor) == 'object' &&
                            clr === undefined &&
                            picker.currentColor.effectId == effectcolors[i].effectId)
                            clr = effectcolors[i];
                    }

                    picker.updateColors(effectcolors, Common.Utils.ThemeColor.getStandartColors());
                    if (picker.currentColor === undefined) {
                        picker.currentColor = effectcolors[defaultColorIndex];
                    } else if ( clr!==undefined ) {
                        picker.currentColor = clr;
                    }
                }
            };

            updateColors(this.toolbar.mnuFontColorPicker, 1);
            if (this.toolbar.btnFontColor.currentColor===undefined || !this.toolbar.btnFontColor.currentColor.isAuto) {
                this.toolbar.btnFontColor.currentColor = this.toolbar.mnuFontColorPicker.currentColor.color || this.toolbar.mnuFontColorPicker.currentColor;
                this.toolbar.btnFontColor.setColor(this.toolbar.btnFontColor.currentColor);
            }
            if (this._state.clrtext_asccolor!==undefined) {
                this._state.clrtext = undefined;
                this.onApiTextColor(this._state.clrtext_asccolor);
            }
            this._state.clrtext_asccolor = undefined;

            updateColors(this.toolbar.mnuParagraphColorPicker, 0);
            this.toolbar.btnParagraphColor.currentColor = this.toolbar.mnuParagraphColorPicker.currentColor.color || this.toolbar.mnuParagraphColorPicker.currentColor;
            this.toolbar.btnParagraphColor.setColor(this.toolbar.btnParagraphColor.currentColor);
            if (this._state.clrshd_asccolor!==undefined) {
                this._state.clrback = undefined;
                this.onParagraphColor(this._state.clrshd_asccolor);
            }
            this._state.clrshd_asccolor = undefined;

            updateColors(this.toolbar.mnuPageColorPicker, 1);
        },

        _onInitEditorStyles: function(styles) {
            window.styles_loaded = false;

            var self = this,
                listStyles = self.toolbar.listStyles;

            window.styles = styles;
            if (!listStyles) {
                self.styles = styles;
                return;
            }

            var arr = [];
            var mainController = this.getApplication().getController('Main');
            _.each(styles.get_MergedStyles(), function(style){
                arr.push({
                    imageUrl: style.asc_getImage(),
                    title   : style.get_Name(),
                    tip     : mainController.translationTable[style.get_Name()] || style.get_Name(),
                    id      : Common.UI.getId()
                });
            });
            listStyles.menuPicker.store.reset(arr); // remove all

            if (listStyles.menuPicker.store.length > 0 && listStyles.rendered){
                var styleRec;
                if (self._state.prstyle) styleRec = listStyles.menuPicker.store.findWhere({title: self._state.prstyle});
                listStyles.fillComboView((styleRec) ? styleRec : listStyles.menuPicker.store.at(0), true);
                Common.NotificationCenter.trigger('edit:complete', this);
            } else if (listStyles.rendered)
                listStyles.clearComboView();
            window.styles_loaded = true;
        },

        onHomeOpen: function() {
            var listStyles = this.toolbar.listStyles;
            if (listStyles && listStyles.needFillComboView &&  listStyles.menuPicker.store.length > 0 && listStyles.rendered){
                var styleRec;
                if (this._state.prstyle) styleRec = listStyles.menuPicker.store.findWhere({title: this._state.prstyle});
                listStyles.fillComboView((styleRec) ? styleRec : listStyles.menuPicker.store.at(0), true);
            }
        },

        _setMarkerColor: function(strcolor, h) {
            var me = this;

            if (h === 'menu') {
                me._state.clrhighlight = undefined;
                me.onApiHighlightColor();

                me.toolbar.btnHighlightColor.currentColor = strcolor;
                me.toolbar.btnHighlightColor.setColor(me.toolbar.btnHighlightColor.currentColor);
                me.toolbar.btnHighlightColor.toggle(true, true);
            }

            strcolor = strcolor || 'transparent';

            if (strcolor == 'transparent') {
                me.api.SetMarkerFormat(true, false);
            } else {
                var r = strcolor[0] + strcolor[1],
                    g = strcolor[2] + strcolor[3],
                    b = strcolor[4] + strcolor[5];
                me.api.SetMarkerFormat(true, true, parseInt(r, 16), parseInt(g, 16), parseInt(b, 16));
            }

            Common.NotificationCenter.trigger('edit:complete', me.toolbar, me.toolbar.btnHighlightColor);
            Common.component.Analytics.trackEvent('ToolBar', 'Highlight Color');
        },

        onHideMenus: function(e){
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onSetupCopyStyleButton: function () {
            this.modeAlwaysSetStyle = false;

            var me = this;

            Common.NotificationCenter.on({
                'edit:complete': function () {
                    if (me.api && me.modeAlwaysSetStyle) {
                        me.api.SetPaintFormat(AscCommon.c_oAscFormatPainterState.kOff);
                        me.toolbar.btnCopyStyle.toggle(false, true);
                        me.modeAlwaysSetStyle = false;
                    }
                }
            });

            $(me.toolbar.btnCopyStyle.cmpEl).dblclick(function () {
                if (me.api) {
                    me.modeAlwaysSetStyle = true;
                    me.toolbar.btnCopyStyle.toggle(true, true);
                    me.api.SetPaintFormat(AscCommon.c_oAscFormatPainterState.kMultiple);
                }
            });
        },

        onApiCoAuthoringDisconnect: function(enableDownload) {
            this.mode.isEdit && this.toolbar.setMode({isDisconnected:true, enableDownload: !!enableDownload});
            this.editMode = false;
            this.DisableToolbar(true, true);
        },

        DisableToolbar: function(disable, viewMode, reviewmode, fillformmode, viewDocMode) {
            if (viewMode!==undefined) this.editMode = !viewMode;
            disable = disable || !this.editMode;

            var toolbar_mask = $('.toolbar-mask'),
                group_mask = $('.toolbar-group-mask'),
                mask = (reviewmode || fillformmode || viewDocMode) ? group_mask : toolbar_mask;
            if (disable && mask.length>0 || !disable && mask.length==0) return;

            var toolbar = this.toolbar;
            toolbar.hideMoreBtns();
            if (reviewmode)
                toolbar.lockToolbar(Common.enumLock.previewReviewMode, disable);
            else if (fillformmode)
                toolbar.lockToolbar(Common.enumLock.viewFormMode, disable);
            else if (viewDocMode)
                toolbar.lockToolbar(Common.enumLock.viewMode, disable);

            if(disable) {
                if (reviewmode || fillformmode || viewDocMode)
                    mask = $("<div class='toolbar-group-mask'>").appendTo(toolbar.$el.find('.toolbar'));
                else
                    mask = $("<div class='toolbar-mask'>").appendTo(toolbar.$el.find('.toolbar'));
            } else {
                mask.remove();
            }
            toolbar.$el.find('.toolbar').toggleClass('masked', $('.toolbar-mask').length>0);
            disable = disable || ((reviewmode || fillformmode || viewDocMode) ? toolbar_mask.length>0 : group_mask.length>0);
            if ( toolbar.synchTooltip )
                toolbar.synchTooltip.hide();

            toolbar._state.previewmode = (reviewmode || viewDocMode) && disable;
            if (reviewmode || viewDocMode) {
                toolbar._state.previewmode && toolbar.btnSave && toolbar.btnSave.setDisabled(true);

                if (toolbar.needShowSynchTip) {
                    toolbar.needShowSynchTip = false;
                    toolbar.onCollaborativeChanges();
                }
            }
            var hkComments = Common.Utils.isMac ? 'command+alt+a' : 'alt+h';
            disable ? Common.util.Shortcuts.suspendEvents(hkComments) : Common.util.Shortcuts.resumeEvents(hkComments);
        },

        onSelectRecepientsClick: function(type) {
            if (this._mailMergeDlg) return;

            var me = this;
            if (type === 'file') {
                this.api && this.api.asc_StartMailMerge();
            } else if (type === 'url') {
                (new Common.Views.ImageFromUrlDialog({
                    label: me.dataUrl,
                    handler: function(result, value) {
                        if (result == 'ok') {
                            if (me.api) {
                                var checkUrl = value.replace(/ /g, '');
                                if (!_.isEmpty(checkUrl)) {
                                    me.api.asc_StartMailMerge({ fileType: "csv", url: checkUrl });
                                } else {
                                    Common.UI.warning({
                                        msg: me.textEmptyMMergeUrl
                                    });
                                }
                            }

                            Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                        }
                    }
                })).show();
            } else if (type === 'storage') {
                Common.NotificationCenter.trigger('storage:spreadsheet-load', 'mailmerge');
            }
        },

        setMailMergeRecipients: function(recepients) {
            recepients && (recepients.c = 'mailmerge');
            this.setRequestedSpreadsheet(recepients);
        },

        openSpreadsheetFromStorage: function(type) {
            var me = this;
            if (this.toolbar.mode.canRequestSelectSpreadsheet) {
                Common.Gateway.requestSelectSpreadsheet(type);
            } else if (this.toolbar.mode.canRequestMailMergeRecipients) {
                console.log("Obsolete: The 'onRequestMailMergeRecipients' event is deprecated. Please use 'onRequestSelectSpreadsheet' event instead.");
                Common.Gateway.requestMailMergeRecipients();
            } else {
                me._mailMergeDlg = new Common.Views.SelectFileDlg({
                    fileChoiceUrl: this.toolbar.mode.fileChoiceUrl.replace("{fileExt}", "xlsx").replace("{documentType}", "")
                });
                me._mailMergeDlg.on('selectfile', function(obj, recepients){
                    recepients && (recepients.c = type);
                    me.setRequestedSpreadsheet(recepients);
                }).on('close', function(obj){
                    me._mailMergeDlg = undefined;
                });
                me._mailMergeDlg.show();
            }
        },

        setRequestedSpreadsheet: function(data) { // gateway
            Common.NotificationCenter.trigger('storage:spreadsheet-insert', data);
        },

        insertSpreadsheetFromStorage: function(data) {
            if (data && (data.c==='mailmerge')) {
                this.api.asc_StartMailMerge(data);
                if (!this.mergeEditor)
                    this.mergeEditor = this.getApplication().getController('Common.Controllers.ExternalMergeEditor').getView('Common.Views.ExternalMergeEditor');
                if (this.mergeEditor)
                    this.mergeEditor.setEditMode(false);
            }
        },

        createDelayedElements: function() {
            this.toolbar.createDelayedElements();
            this.attachUIEvents(this.toolbar);
            this.onChangeProtectDocument();

            Common.Utils.injectSvgIcons();
        },

        createDelayedElementsRestrictedEditForms: function() {
            this.toolbar.createDelayedElementsRestrictedEditForms();
            this.attachRestrictedEditFormsUIEvents(this.toolbar);
        },

        createDelayedElementsViewer: function() {
            this.onBtnChangeState('print:disabled', null, !this.mode.canPrint);
        },

        onAppShowed: function (config) {
            var me = this,
                application = this.getApplication();

            var compactview = !(config.isEdit || config.isRestrictedEdit && config.canFillForms && config.isFormCreator);
            if ( config.isEdit || config.isRestrictedEdit && config.canFillForms && config.isFormCreator) {
                if ( Common.localStorage.itemExists("de-compact-toolbar") ) {
                    compactview = Common.localStorage.getBool("de-compact-toolbar");
                } else
                if ( config.customization && config.customization.compactToolbar )
                    compactview = true;
            }

            me.toolbar.render(_.extend({isCompactView: compactview}, config));

            var tab = {action: 'review', caption: me.toolbar.textTabCollaboration, dataHintTitle: 'U', layoutname: 'toolbar-collaboration'};
            var $panel = me.application.getController('Common.Controllers.ReviewChanges').createToolbarPanel();
            if ( $panel ) {
                me.toolbar.addTab(tab, $panel, 6);
                me.toolbar.setVisible('review', (config.isEdit || config.canCoAuthoring && config.canComments) && Common.UI.LayoutManager.isElementVisible('toolbar-collaboration') ); // use config.canViewReview in review controller. set visible review tab in view mode only when asc_HaveRevisionsChanges
            }

            if ( config.isEdit ) {
                me.toolbar.setMode(config);

                me.toolbar.btnSave.on('disabled', _.bind(me.onBtnChangeState, me, 'save:disabled'));

                if (!config.compactHeader) {
                    // hide 'print' and 'save' buttons group and next separator
                    me.toolbar.btnPrint.$el.parents('.group').hide().next().hide();

                    // hide 'undo' and 'redo' buttons and retrieve parent container
                    var $box = me.toolbar.btnUndo.$el.hide().next().hide().parent();

                    // move 'paste' button to the container instead of 'undo' and 'redo'
                    me.toolbar.btnPaste.$el.detach().appendTo($box);
                    me.toolbar.btnPaste.$el.find('button').attr('data-hint-direction', 'bottom');
                    me.toolbar.btnCopy.$el.removeClass('split');
                    me.toolbar.processPanelVisible(null, true);
                }

                // if ( config.isDesktopApp ) {
                //     if ( config.canProtect ) {
                //         tab = {action: 'protect', caption: me.toolbar.textTabProtect, dataHintTitle: 'T', layoutname: 'toolbar-protect'};
                //         $panel = application.getController('Common.Controllers.Protection').createToolbarPanel();
                //
                //         if ($panel) me.toolbar.addTab(tab, $panel, 6);
                //     }
                // }
                var drawtab = application.getController('Common.Controllers.Draw');
                drawtab.setApi(me.api).setMode(config);
                $panel = drawtab.createToolbarPanel();
                if ($panel) {
                    tab = {action: 'draw', caption: me.toolbar.textTabDraw, extcls: 'canedit', layoutname: 'toolbar-draw', dataHintTitle: 'C'};
                    me.toolbar.addTab(tab, $panel, 2);
                    me.toolbar.setVisible('draw', Common.UI.LayoutManager.isElementVisible('toolbar-draw'));
                    Array.prototype.push.apply(me.toolbar.lockControls, drawtab.getView().getButtons());
                    Array.prototype.push.apply(me.toolbar.paragraphControls, drawtab.getView().getButtons());
                }

                if ( config.canProtect ) {
                    tab = {action: 'protect', caption: me.toolbar.textTabProtect, layoutname: 'toolbar-protect', dataHintTitle: 'T'};
                    $panel = application.getController('Common.Controllers.Protection').createToolbarPanel();
                    if ($panel) {
                        (config.isSignatureSupport || config.isPasswordSupport) && $panel.append($('<div class="separator long"></div>'));
                        var doctab = application.getController('DocProtection');
                        $panel.append(doctab.createToolbarPanel());
                        me.toolbar.addTab(tab, $panel, 7);
                        me.toolbar.setVisible('protect', Common.UI.LayoutManager.isElementVisible('toolbar-protect'));
                        Array.prototype.push.apply(me.toolbar.lockControls, doctab.getView('DocProtection').getButtons());
                    }
                }

                var links = application.getController('Links');
                links.setApi(me.api).setConfig({toolbar: me});
                Array.prototype.push.apply(me.toolbar.lockControls, links.getView('Links').getButtons());

                me.toolbar.lockControls.push(application.getController('Viewport').getView('Common.Views.Header').getButton('mode'));
            } else if (config.isRestrictedEdit && config.canFillForms && config.isPDFForm) {
                me.toolbar.setMode(config);

                me.toolbar.btnSave.on('disabled', _.bind(me.onBtnChangeState, me, 'save:disabled'));

                if (!(me.mode.canRequestEditRights && me.mode.isPDFForm && me.mode.canFillForms && me.mode.isRestrictedEdit))
                    me.toolbar.btnEditMode && me.toolbar.btnEditMode.cmpEl.parents('.group').hide().next('.separator').hide();

                if (!config.compactHeader) {
                    // hide 'print' and 'save' buttons group and next separator
                    me.toolbar.btnPrint.$el.parents('.group').hide().next().hide();

                    // hide 'undo' and 'redo' buttons and retrieve parent container
                    var $box = me.toolbar.btnUndo.$el.hide().next().hide().parent();

                    // move 'paste' button to the container instead of 'undo' and 'redo'
                    me.toolbar.btnPaste.$el.detach().appendTo($box);
                    me.toolbar.btnPaste.$el.find('button').attr('data-hint-direction', 'bottom');
                    me.toolbar.btnCopy.$el.removeClass('split');
                    me.toolbar.processPanelVisible(null, true);
                }
            }

            if ( config.isEdit && config.canFeatureContentControl && config.canFeatureForms || config.isRestrictedEdit && config.canFillForms ) {
                if (config.isFormCreator) {
                    tab = {caption: config.isRestrictedEdit && config.canFillForms && config.isPDFForm ? me.toolbar.textTabHome : me.textTabForms, action: 'forms', dataHintTitle: 'M'};
                    var forms = application.getController('FormsTab');
                    forms.setApi(me.api).setConfig({toolbar: me, config: config});
                    $panel = forms.createToolbarPanel();
                    if ($panel) {
                        me.toolbar.addTab(tab, $panel, 5);
                        me.toolbar.setVisible('forms', true);
                        Array.prototype.push.apply(me.toolbar.lockControls, forms.getView('FormsTab').getButtons());
                        !compactview && (config.isFormCreator || config.isRestrictedEdit && config.canFillForms) && me.toolbar.setTab('forms');
                    }
                }
            }
            config.isEdit && config.canFeatureContentControl && me.onChangeSdtGlobalSettings();

            tab = {caption: me.toolbar.textTabView, action: 'view', extcls: config.isEdit ? 'canedit' : '', layoutname: 'toolbar-view', dataHintTitle: 'W'};
            var viewtab = application.getController('ViewTab');
            viewtab.setApi(me.api).setConfig({toolbar: me, mode: config});
            $panel = viewtab.createToolbarPanel();
            if ($panel) {
                me.toolbar.addTab(tab, $panel, 8);
                me.toolbar.setVisible('view', Common.UI.LayoutManager.isElementVisible('toolbar-view'));
            }
        },

        onAppReady: function (config) {
            var me = this;
            me.appOptions = config;

            var lang = config.lang ? config.lang.toLowerCase() : 'en',
                langPrefix = lang.split(/[\-_]/)[0];
            if (langPrefix === 'zh' && lang !== 'zh-tw' && lang !== 'zh_tw') {
                me._state.type_fontsize = 'string';
            }

            this.btnsComment = [];
            if ( config.canCoAuthoring && config.canComments ) {
                this.btnsComment = Common.Utils.injectButtons(this.toolbar.$el.find('.slot-comment'), 'tlbtn-addcomment-', 'toolbar__icon btn-big-add-comment', this.toolbar.capBtnComment,
                            [  Common.enumLock.paragraphLock, Common.enumLock.headerLock, Common.enumLock.richEditLock, Common.enumLock.plainEditLock, Common.enumLock.richDelLock, Common.enumLock.plainDelLock,
                                    Common.enumLock.cantAddQuotedComment, Common.enumLock.imageLock, Common.enumLock.inSpecificForm, Common.enumLock.inImage, Common.enumLock.lostConnect, Common.enumLock.disableOnStart,
                                    Common.enumLock.previewReviewMode, Common.enumLock.viewFormMode, Common.enumLock.docLockView, Common.enumLock.docLockForms, Common.enumLock.viewMode ],
                                 undefined, undefined, undefined, '1', 'bottom');
                if ( this.btnsComment.length ) {
                    var _comments = DE.getController('Common.Controllers.Comments').getView();
                    this.btnsComment.forEach(function (btn) {
                        btn.updateHint( _comments.textHintAddComment );
                        btn.on('click', function (btn, e) {
                            Common.NotificationCenter.trigger('app:comment:add', 'toolbar');
                        });
                        if (btn.cmpEl.closest('#review-changes-panel').length>0)
                            btn.setCaption(me.toolbar.capBtnAddComment);
                    }, this);
                    if (_comments.buttonAddNew) {
                        _comments.buttonAddNew.options.lock = [ Common.enumLock.paragraphLock, Common.enumLock.headerLock, Common.enumLock.richEditLock, Common.enumLock.plainEditLock, Common.enumLock.richDelLock, Common.enumLock.plainDelLock,
                                                                Common.enumLock.cantAddQuotedComment, Common.enumLock.imageLock, Common.enumLock.inSpecificForm, Common.enumLock.inImage, Common.enumLock.lostConnect, Common.enumLock.disableOnStart,
                                                                Common.enumLock.previewReviewMode, Common.enumLock.viewFormMode, Common.enumLock.docLockView, Common.enumLock.docLockForms, Common.enumLock.viewMode ];
                        this.btnsComment.add(_comments.buttonAddNew);
                    }
                }
                Array.prototype.push.apply(this.toolbar.paragraphControls, this.btnsComment);
                Array.prototype.push.apply(this.toolbar.lockControls, this.btnsComment);
            }

            (new Promise(function(accept) {
                accept();
            })).then(function () {
                if ( config.isEdit ) {
                    me.controllers.pageLayout = new DE.Controllers.PageLayout({
                        id: 'ImageLayout',
                        application: me.getApplication()
                    });

                    me.controllers.pageLayout.onLaunch(me.toolbar)
                        .setApi(me.api)
                        .onAppReady(config);
                } else if (config.isRestrictedEdit && config.canFillForms && config.isPDFForm) {
                    if (me.toolbar.btnHandTool) {
                        me.api.asc_setViewerTargetType('hand');
                    }
                }

                config.isOForm && config.canDownload && Common.UI.warning({
                    msg  : config.canRequestSaveAs || !!config.saveAsUrl || config.isOffline ? me.textConvertFormSave : me.textConvertFormDownload,
                    buttons: [{value: 'ok', caption: config.canRequestSaveAs || !!config.saveAsUrl || config.isOffline ? me.textSavePdf : me.textDownloadPdf}, 'cancel'],
                    callback: function(btn){
                        if (btn==='ok') {
                            me.isFromFormSaveAs = config.canRequestSaveAs || !!config.saveAsUrl;
                            var options = new Asc.asc_CDownloadOptions(Asc.c_oAscFileType.PDF, me.isFromFormSaveAs);
                            options.asc_setIsSaveAs(me.isFromFormSaveAs);
                            me.api.asc_DownloadAs(options);
                        }
                        Common.NotificationCenter.trigger('edit:complete');
                    }
                });
            });
        },

        onDownloadUrl: function(url, fileType) {
            if (this.isFromFormSaveAs) {
                var me = this,
                    defFileName = this.getApplication().getController('Viewport').getView('Common.Views.Header').getDocumentCaption();
                !defFileName && (defFileName = me.txtUntitled);

                var idx = defFileName.lastIndexOf('.');
                if (idx>0)
                    defFileName = defFileName.substring(0, idx) + '.pdf';

                if (me.mode.canRequestSaveAs) {
                    Common.Gateway.requestSaveAs(url, defFileName, fileType);
                } else {
                    me._saveCopyDlg = new Common.Views.SaveAsDlg({
                        saveFolderUrl: me.mode.saveAsUrl,
                        saveFileUrl: url,
                        defFileName: defFileName
                    });
                    me._saveCopyDlg.on('saveaserror', function(obj, err){
                        Common.UI.warning({
                            closable: false,
                            msg: err,
                            callback: function(btn){
                                Common.NotificationCenter.trigger('edit:complete', me);
                            }
                        });
                    }).on('close', function(obj){
                        me._saveCopyDlg = undefined;
                    });
                    me._saveCopyDlg.show();
                }
            }
            this.isFromFormSaveAs = false;
        },

        getView: function (name) {
            return !name ? this.toolbar : Backbone.Controller.prototype.getView.apply(this, arguments);
        },

        onFileMenu: function (opts) {
            if ( opts == 'show' ) {
                if ( !this.toolbar.isTabActive('file') )
                    this.toolbar.setTab('file');
            } else {
                if ( this.toolbar.isTabActive('file') )
                    this.toolbar.setTab();
            }
        },

        onTextLanguage: function(langId) {
            this._state.lang = langId;
        },

        onInsDateTimeClick: function() {
            //insert date time
            var me = this;
            (new DE.Views.DateTimeDialog({
                api: this.api,
                lang: this._state.lang,
                handler: function(result, value) {
                    if (result == 'ok') {
                        if (me.api) {
                            me.api.asc_addDateTime(value);
                        }
                    }
                    Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                }
            })).show();
        },

        onInsFieldClick: function(type) {
            var me = this;
            (new Common.Views.TextInputDialog({
                width: 450,
                title: me.textFieldTitle,
                label: me.textFieldLabel,
                description: me.textFieldExample,
                value: type==='edit' ? me.api.asc_GetComplexFieldInstruction() : '',
                handler: function(result, value) {
                    if (result == 'ok') {
                        if (me.api) {
                            type==='edit' ? me.api.asc_EditComplexFieldInstruction(value) : me.api.asc_AddComplexFieldWithInstruction(value);
                        }
                    }
                    Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                }
            })).show();
        },

        mouseenterSmartArt: function (groupName) {
            if (this.smartArtGenerating === undefined) {
                this.generateSmartArt(groupName);
            } else {
                this.delayedSmartArt = groupName;
            }
        },

        mouseleaveSmartArt: function (groupName) {
            if (this.delayedSmartArt === groupName) {
                this.delayedSmartArt = undefined;
            }
        },

        generateSmartArt: function (groupName) {
            this.api.asc_generateSmartArtPreviews(groupName);
        },

        onApiBeginSmartArtPreview: function (type) {
            this.smartArtGenerating = type;
            this.smartArtGroups = this.toolbar.btnInsertSmartArt.menu.items;
            var menuPicker = _.findWhere(this.smartArtGroups, {value: type}).menuPicker;
            menuPicker.loaded = true;
            this.smartArtData = Common.define.smartArt.getSmartArtData();
        },

        onApiAddSmartArtPreview: function (previews) {
            previews.forEach(_.bind(function (preview) {
                var image = preview.asc_getImage(),
                    sectionId = preview.asc_getSectionId(),
                    section = _.findWhere(this.smartArtData, {sectionId: sectionId}),
                    item = _.findWhere(section.items, {type: image.asc_getName()}),
                    menu = _.findWhere(this.smartArtGroups, {value: sectionId}),
                    menuPicker = menu.menuPicker,
                    pickerItem = menuPicker.store.findWhere({isLoading: true});
                if (pickerItem) {
                    pickerItem.set('isLoading', false, {silent: true});
                    pickerItem.set('value', item.type, {silent: true});
                    pickerItem.set('imageUrl', image.asc_getImage(), {silent: true});
                    pickerItem.set('tip', item.tip);
                }
                this.currentSmartArtMenu = menu;
            }, this));
        },

        onApiEndSmartArtPreview: function () {
            this.smartArtGenerating = undefined;
            if (this.currentSmartArtMenu) {
                this.currentSmartArtMenu.menu.alignPosition();
            }
            if (this.delayedSmartArt !== undefined) {
                var delayedSmartArt = this.delayedSmartArt;
                this.delayedSmartArt = undefined;
                this.generateSmartArt(delayedSmartArt);
            }
        },

        onInsertSmartArt: function (value) {
            if (this.api) {
                this.api.asc_createSmartArt(value);
            }
        },
        
        onChangeProtectDocument: function(props) {
            if (!props) {
                var docprotect = this.getApplication().getController('DocProtection');
                props = docprotect ? docprotect.getDocProps() : null;
            }
            if (props) {
                this._state.docProtection = props;
                this.toolbar.lockToolbar(Common.enumLock.docLockView, props.isReadOnly);
                this.toolbar.lockToolbar(Common.enumLock.docLockForms, props.isFormsOnly);
                this.toolbar.lockToolbar(Common.enumLock.docLockReview, props.isReviewOnly);
                this.toolbar.lockToolbar(Common.enumLock.docLockComments, props.isCommentsOnly);
                Common.NotificationCenter.trigger('doc:mode-changed', undefined, props.isReviewOnly);
            }
        },

        onSelectTool: function (type, btn, state, e) {
            if (this.api && state) {
                this.api.asc_setViewerTargetType(type);
                Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            }
        },

        onChangeViewerTargetType: function(isHandMode) {
            if (this.toolbar && this.toolbar.btnHandTool) {
                this.toolbar.btnHandTool.toggle(isHandMode, true);
                this.toolbar.btnSelectTool.toggle(!isHandMode, true);
            }
        },

        onPluginToolbarMenu: function(data) {
            this.toolbar && Array.prototype.push.apply(this.toolbar.lockControls, Common.UI.LayoutManager.addCustomItems(this.toolbar, data));
        },

        onActiveTab: function(tab) {
            (tab === 'layout') ? Common.UI.TooltipManager.showTip('pageColor') : Common.UI.TooltipManager.closeTip('pageColor');
            (tab !== 'home') && Common.UI.TooltipManager.closeTip('docMode');
        },

        onTabCollapse: function(tab) {
            Common.UI.TooltipManager.closeTip('pageColor');
        }

    }, DE.Controllers.Toolbar || {}));
});
