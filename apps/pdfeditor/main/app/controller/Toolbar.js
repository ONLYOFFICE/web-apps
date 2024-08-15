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
    'pdfeditor/main/app/view/Toolbar'
], function () {
    'use strict';

    PDFE.Controllers.Toolbar = Backbone.Controller.extend(_.extend({
        models: [],
        collections: [],
        controllers: [],
        views: [
            'Toolbar'
        ],

        initialize: function() {
            this._state = {
                activated: false,
                prcontrolsdisable:undefined,
                can_undo: undefined,
                can_redo: undefined,
                lock_doc: undefined,
                can_copy: undefined,
                can_cut: undefined,
                clrstrike: undefined,
                clrunderline: undefined,
                clrhighlight: undefined,
                pageCount: 1,
                currentPage: 0,
                bullets: {type:undefined, subtype:undefined},
                linespace: undefined,
                pralign: undefined,
                valign: undefined,
                vtextalign: undefined,
                bold: undefined,
                italic: undefined,
                strike: undefined,
                underline: undefined,
                can_increase: undefined,
                can_decrease: undefined,
                fontsize: undefined,
                textclrhighlight: undefined,
                initEditing: true
            };
            this.editMode = true;
            this.binding = {};

            this.addListeners({
                'Toolbar': {
                    'change:compact'    : this.onClickChangeCompact,
                    'home:open'         : this.onHomeOpen,
                    'tab:active'        : this.onActiveTab,
                    'tab:collapse'      : this.onTabCollapse
                },
                'FileMenu': {
                    'menu:hide': this.onFileMenu.bind(this, 'hide'),
                    'menu:show': this.onFileMenu.bind(this, 'show'),
                    'settings:apply': this.applySettings.bind(this),
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
                            if ( /^pdf|xps|oxps|djvu/i.test(_file_type) ) {
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
                    'annotbar:create': this.onCreateAnnotBar.bind(this)
                }
            });

            Common.NotificationCenter.on('toolbar:collapse', _.bind(function () {
                this.toolbar.collapse();
            }, this));
            Common.NotificationCenter.on('comments:tryshowcomments', _.bind(this.turnOnShowComments, this));
        },

        onLaunch: function() {
            // Create toolbar view
            this.toolbar = this.createView('Toolbar');
            this.toolbar.on('render:before', function (cmp) {
            });

            Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            Common.NotificationCenter.on('app:face', this.onAppShowed.bind(this));
        },

        setMode: function(mode) {
            this.mode = mode;
            this.toolbar.applyLayout(mode);
            Common.UI.TooltipManager.addTips({
                'editPdf' : {name: 'pdfe-help-tip-edit-pdf', placement: 'bottom-right', text: this.helpEditPdf, header: this.helpEditPdfHeader, target: '#slot-btn-tb-edit-mode'},
                'textComment' : {name: 'pdfe-help-tip-text-comment', placement: 'bottom-right', text: this.helpTextComment, header: this.helpTextCommentHeader, target: '#slot-btn-text-comment'}
            });
        },

        attachCommonUIEvents: function(toolbar) {
            toolbar.btnPrint.on('click',                                _.bind(this.onPrint, this));
            toolbar.btnPrint.on('disabled',                             _.bind(this.onBtnChangeState, this, 'print:disabled'));
            toolbar.btnUndo.on('click',                                 _.bind(this.onUndo, this));
            toolbar.btnUndo.on('disabled',                              _.bind(this.onBtnChangeState, this, 'undo:disabled'));
            toolbar.btnRedo.on('click',                                 _.bind(this.onRedo, this));
            toolbar.btnRedo.on('disabled',                              _.bind(this.onBtnChangeState, this, 'redo:disabled'));
            toolbar.btnCopy.on('click',                                 _.bind(this.onCopyPaste, this, 'copy'));
            toolbar.btnPaste.on('click',                                _.bind(this.onCopyPaste, this, 'paste'));
            toolbar.btnCut.on('click',                                  _.bind(this.onCopyPaste, this, 'cut'));
            toolbar.btnSelectTool.on('toggle',                          _.bind(this.onSelectTool, this, 'select'));
            toolbar.btnHandTool.on('toggle',                            _.bind(this.onSelectTool, this, 'hand'));
            toolbar.fieldPages.on('changed:after',                      _.bind(this.onPagesChanged, this));
            toolbar.fieldPages.on('inputleave', function(){ Common.NotificationCenter.trigger('edit:complete', toolbar);});
            toolbar.fieldPages.cmpEl && toolbar.fieldPages.cmpEl.on('focus', 'input.form-control', function() {
                setTimeout(function(){toolbar.fieldPages._input && toolbar.fieldPages._input.select();}, 1);
            });
            toolbar.btnFirstPage.on('click',                            _.bind(this.onGotoPage, this, 'first'));
            toolbar.btnLastPage.on('click',                             _.bind(this.onGotoPage, this, 'last'));
            toolbar.btnPrevPage.on('click',                             _.bind(this.onGotoPage, this, 'prev'));
            toolbar.btnNextPage.on('click',                             _.bind(this.onGotoPage, this, 'next'));

            this.onBtnChangeState('undo:disabled', toolbar.btnUndo, toolbar.btnUndo.isDisabled());
            this.onBtnChangeState('redo:disabled', toolbar.btnRedo, toolbar.btnRedo.isDisabled());
        },

        attachRestrictedEditUIEvents: function(toolbar) {
            if (this.mode && this.mode.isRestrictedEdit) {
                toolbar.btnClear.on('click', _.bind(this.onClearClick, this));
                toolbar.btnPrevForm.on('click', _.bind(this.onGoToForm, this, 'prev'));
                toolbar.btnNextForm.on('click', _.bind(this.onGoToForm, this, 'next'));
                toolbar.btnSubmit && toolbar.btnSubmit.on('click', _.bind(this.onSubmitClick, this));
                toolbar.btnSaveForm && toolbar.btnSaveForm.on('click', _.bind(this.onSaveFormClick, this));
            }
        },

        attachPDFAnnotateUIEvents: function(toolbar) {
            if (!this.mode || !this.mode.isEdit) return;

            toolbar.btnSave.on('click',                                 _.bind(this.tryToSave, this));
            toolbar.btnSelectAll.on('click',                            _.bind(this.onSelectAll, this));
            toolbar.btnAddComment.on('click', function (btn, e) {
                Common.NotificationCenter.trigger('app:comment:add', 'toolbar');
            });
            toolbar.btnEditMode.on('click', function (btn, e) {
                Common.NotificationCenter.trigger('pdf:mode-apply', btn.pressed ? 'edit' : 'comment');
            });
            Common.NotificationCenter.on('pdf:mode-changed', _.bind(this.changePDFMode, this));
            toolbar.btnStrikeout.on('click',                            _.bind(this.onBtnStrikeout, this));
            toolbar.mnuStrikeoutColorPicker.on('select',                _.bind(this.onSelectStrikeoutColor, this));
            // toolbar.mnuStrikeoutTransparent.on('click',                 _.bind(this.onStrikeoutTransparentClick, this));
            toolbar.btnUnderline.on('click',                            _.bind(this.onBtnUnderline, this));
            toolbar.mnuUnderlineColorPicker.on('select',                _.bind(this.onSelectUnderlineColor, this));
            // toolbar.mnuUnderlineTransparent.on('click',                 _.bind(this.onUnderlineTransparentClick, this));
            toolbar.btnHighlight.on('click',                            _.bind(this.onBtnHighlight, this));
            toolbar.mnuHighlightColorPicker.on('select',                _.bind(this.onSelectHighlightColor, this));
            // toolbar.mnuHighlightTransparent.on('click',                 _.bind(this.onHighlightTransparentClick, this));
            toolbar.chShowComments.on('change',                         _.bind(this.onShowCommentsChange, this));
            toolbar.btnTextComment.on('click',                          _.bind(this.onBtnTextCommentClick, this));
            toolbar.btnTextComment.menu.on('item:click',                _.bind(this.onMenuTextCommentClick, this));
            toolbar.btnTextComment.menu.on('show:before',               _.bind(this.onBeforeTextComment, this));
            // toolbar.btnRotate.on('click',                               _.bind(this.onRotateClick, this));
            Common.NotificationCenter.on('leftmenu:save', _.bind(this.tryToSave, this));
            Common.NotificationCenter.on('draw:start', _.bind(this.onDrawStart, this));
            Common.NotificationCenter.on('draw:stop', _.bind(this.onDrawStop, this));

        },

        onCreateAnnotBar: function(btnStrikeout, mnuStrikeoutColorPicker, btnUnderline, mnuUnderlineColorPicker, btnHighlight, mnuHighlightColorPicker) {
            var toolbar = this.toolbar;
            btnStrikeout.currentColor = toolbar.btnStrikeout.currentColor;
            btnStrikeout.setColor(btnStrikeout.currentColor);
            btnStrikeout.toggle(toolbar.btnStrikeout.pressed, true);
            toolbar.btnsStrikeout.push(btnStrikeout);
            toolbar.mnusStrikeoutColorPicker.push(mnuStrikeoutColorPicker);
            btnUnderline.currentColor = toolbar.btnUnderline.currentColor;
            btnUnderline.setColor(btnUnderline.currentColor);
            btnUnderline.toggle(toolbar.btnUnderline.pressed, true);
            toolbar.btnsUnderline.push(btnUnderline);
            toolbar.mnusUnderlineColorPicker.push(mnuUnderlineColorPicker);
            btnHighlight.currentColor = toolbar.btnHighlight.currentColor;
            btnHighlight.setColor(btnHighlight.currentColor);
            btnHighlight.toggle(toolbar.btnHighlight.pressed, true);
            toolbar.btnsHighlight.push(btnHighlight);
            toolbar.mnusHighlightColorPicker.push(mnuHighlightColorPicker);
            btnStrikeout.on('click',                            _.bind(this.onBtnStrikeout, this));
            mnuStrikeoutColorPicker.on('select',                _.bind(this.onSelectStrikeoutColor, this));
            btnUnderline.on('click',                            _.bind(this.onBtnUnderline, this));
            mnuUnderlineColorPicker.on('select',                _.bind(this.onSelectUnderlineColor, this));
            btnHighlight.on('click',                            _.bind(this.onBtnHighlight, this));
            mnuHighlightColorPicker.on('select',                _.bind(this.onSelectHighlightColor, this));
        },

        attachPDFEditUIEvents: function(toolbar) {
            if (!this.mode || !this.mode.isPDFEdit) return;

            toolbar.btnEditText.on('click',                             _.bind(this.onEditTextClick, this));
            toolbar.btnIncFontSize.on('click',                          _.bind(this.onIncrease, this));
            toolbar.btnDecFontSize.on('click',                          _.bind(this.onDecrease, this));
            toolbar.btnBold.on('click',                                 _.bind(this.onBold, this));
            toolbar.btnItalic.on('click',                               _.bind(this.onItalic, this));
            toolbar.btnTextUnderline.on('click',                        _.bind(this.onTextUnderline, this));
            toolbar.btnTextStrikeout.on('click',                        _.bind(this.onTextStrikeout, this));
            toolbar.btnSuperscript.on('click',                          _.bind(this.onSuperscript, this));
            toolbar.btnSubscript.on('click',                            _.bind(this.onSubscript, this));
            toolbar.btnHorizontalAlign.menu.on('item:click',            _.bind(this.onMenuHorizontalAlignSelect, this));
            toolbar.btnVerticalAlign.menu.on('item:click',              _.bind(this.onMenuVerticalAlignSelect, this));
            toolbar.btnDecLeftOffset.on('click',                        _.bind(this.onDecOffset, this));
            toolbar.btnIncLeftOffset.on('click',                        _.bind(this.onIncOffset, this));
            toolbar.mnuChangeCase.on('item:click',                      _.bind(this.onChangeCase, this));
            toolbar.btnMarkers.on('click',                              _.bind(this.onMarkers, this));
            toolbar.btnNumbers.on('click',                              _.bind(this.onNumbers, this));
            toolbar.mnuMarkerSettings.on('click',                         _.bind(this.onMarkerSettingsClick, this, 0));
            toolbar.mnuNumberSettings.on('click',                         _.bind(this.onMarkerSettingsClick, this, 1));
            toolbar.cmbFontName.on('selected',                          _.bind(this.onFontNameSelect, this));
            toolbar.cmbFontName.on('show:after',                        _.bind(this.onComboOpen, this, true));
            toolbar.cmbFontName.on('hide:after',                        _.bind(this.onHideMenus, this));
            toolbar.cmbFontName.on('combo:blur',                        _.bind(this.onComboBlur, this));
            toolbar.cmbFontName.on('combo:focusin',                     _.bind(this.onComboOpen, this, false));
            toolbar.cmbFontSize.on('selected',                          _.bind(this.onFontSizeSelect, this));
            toolbar.cmbFontSize.on('changed:before',                    _.bind(this.onFontSizeChanged, this, true));
            toolbar.cmbFontSize.on('changed:after',                     _.bind(this.onFontSizeChanged, this, false));
            toolbar.cmbFontSize.on('show:after',                        _.bind(this.onComboOpen, this, true));
            toolbar.cmbFontSize.on('hide:after',                        _.bind(this.onHideMenus, this));
            toolbar.cmbFontSize.on('combo:blur',                        _.bind(this.onComboBlur, this));
            toolbar.cmbFontSize.on('combo:focusin',                     _.bind(this.onComboOpen, this, false));
            toolbar.mnuMarkersPicker.on('item:click',                   _.bind(this.onSelectBullets, this, toolbar.btnMarkers));
            toolbar.mnuNumbersPicker.on('item:click',                   _.bind(this.onSelectBullets, this, toolbar.btnNumbers));
            toolbar.btnMarkers.menu.on('show:after',                    _.bind(this.onListShowAfter, this, 0, toolbar.mnuMarkersPicker));
            toolbar.btnNumbers.menu.on('show:after',                    _.bind(this.onListShowAfter, this, 1, toolbar.mnuNumbersPicker));
            toolbar.btnFontColor.on('click',                            _.bind(this.onBtnFontColor, this));
            toolbar.btnFontColor.on('color:select',                     _.bind(this.onSelectFontColor, this));
            toolbar.btnTextHighlightColor.on('click',                   _.bind(this.onBtnTextHighlightColor, this));
            toolbar.mnuTextHighlightColorPicker.on('select',            _.bind(this.onSelectTextHighlightColor, this));
            toolbar.mnuTextHighlightTransparent.on('click',             _.bind(this.onTextHighlightTransparentClick, this));
            toolbar.btnLineSpace.menu.on('item:toggle',                 _.bind(this.onLineSpaceToggle, this));
            toolbar.btnColumns.menu.on('item:click',                    _.bind(this.onColumnsSelect, this));
            toolbar.btnColumns.menu.on('show:before',                   _.bind(this.onBeforeColumns, this));
            toolbar.btnClearStyle.on('click',                           _.bind(this.onClearStyleClick, this));
            toolbar.btnShapeAlign.menu.on('item:click',                 _.bind(this.onShapeAlign, this));
            toolbar.btnShapeAlign.menu.on('show:before',                _.bind(this.onBeforeShapeAlign, this));
            toolbar.btnShapeArrange.menu.on('item:click',               _.bind(this.onShapeArrange, this));
            toolbar.btnRotatePage.menu.on('item:click',                 _.bind(this.onRotatePageMenu, this));
            toolbar.btnRotatePage.on('click',                           _.bind(this.onRotatePage, this));
            toolbar.btnDelPage.on('click',                              _.bind(this.onDelPage, this));

        },

        attachUIEvents: function(toolbar) {
            /**
             * UI Events
             */
            this.attachCommonUIEvents(toolbar);
            if (this.mode.isEdit) {
                this.attachPDFAnnotateUIEvents(toolbar);
                this.mode.isPDFEdit && this.attachPDFEditUIEvents(toolbar);
            } else if (this.mode.isRestrictedEdit)
                this.attachRestrictedEditUIEvents(toolbar);
        },

        attachCommonApiEvents: function() {
            this.api.asc_registerCallback('asc_onCountPages',   _.bind(this.onCountPages, this));
            this.api.asc_registerCallback('asc_onCurrentPage',  _.bind(this.onCurrentPage, this));
            this.api.asc_registerCallback('asc_onDownloadUrl',  _.bind(this.onDownloadUrl, this));
            this.api.asc_registerCallback('onPluginToolbarMenu', _.bind(this.onPluginToolbarMenu, this));
        },

        attachRestrictedEditApiEvents: function() {
            if (!this.mode.isRestrictedEdit) return;

            this.api.asc_registerCallback('asc_onCanUndo', _.bind(this.onApiCanRevert, this, 'undo'));
            this.api.asc_registerCallback('asc_onCanRedo', _.bind(this.onApiCanRevert, this, 'redo'));
            this.api.asc_registerCallback('asc_onZoomChange', _.bind(this.onApiZoomChange, this));
            Common.NotificationCenter.on('api:disconnect', _.bind(this.onApiCoAuthoringDisconnect, this));
            this.api.asc_registerCallback('asc_onCoAuthoringDisconnect', _.bind(this.onApiCoAuthoringDisconnect, this));
            this.api.asc_registerCallback('asc_onCanCopyCut', _.bind(this.onApiCanCopyCut, this));

            this.api.asc_registerCallback('asc_onStartAction', _.bind(this.onLongActionBegin, this));
            this.api.asc_registerCallback('asc_onEndAction', _.bind(this.onLongActionEnd, this));
            this.api.asc_registerCallback('asc_onError', _.bind(this.onError, this));
            this.api.asc_registerCallback('sync_onAllRequiredFormsFilled', _.bind(this.onFillRequiredFields, this));
        },

        attachPDFAnnotateApiEvents: function() {
            if (!this.mode.isEdit) return;

            this.toolbar.setApi(this.api);

            this.api.asc_registerCallback('asc_onCanUndo', _.bind(this.onApiCanRevert, this, 'undo'));
            this.api.asc_registerCallback('asc_onCanRedo', _.bind(this.onApiCanRevert, this, 'redo'));
            this.api.asc_registerCallback('asc_onZoomChange', _.bind(this.onApiZoomChange, this));
            Common.NotificationCenter.on('api:disconnect', _.bind(this.onApiCoAuthoringDisconnect, this));
            this.api.asc_registerCallback('asc_onCoAuthoringDisconnect', _.bind(this.onApiCoAuthoringDisconnect, this));
            this.api.asc_registerCallback('asc_onCanCopyCut', _.bind(this.onApiCanCopyCut, this));

            this.api.asc_registerCallback('asc_onContextMenu', _.bind(this.onContextMenu, this));
            this.api.asc_registerCallback('asc_onMarkerFormatChanged', _.bind(this.onApiStartHighlight, this));
            this.getApplication().getController('Common.Controllers.Fonts').setApi(this.api);

            if (this.mode.canPDFEdit) {
                this.api.asc_registerCallback('asc_onMathTypes', _.bind(this.onApiMathTypes, this));
                this.api.asc_registerCallback('asc_onInitStandartTextures', _.bind(this.onInitStandartTextures, this));
            }
        },

        attachPDFEditApiEvents: function() {
            if (!this.mode.isPDFEdit) return;

            this.api.asc_registerCallback('asc_onFocusObject',          _.bind(this.onApiFocusObject, this));
            this.api.asc_registerCallback('asc_onFontSize',             _.bind(this.onApiFontSize, this));
            this.api.asc_registerCallback('asc_onBold',                 _.bind(this.onApiBold, this));
            this.api.asc_registerCallback('asc_onItalic',               _.bind(this.onApiItalic, this));
            this.api.asc_registerCallback('asc_onUnderline',            _.bind(this.onApiUnderline, this));
            this.api.asc_registerCallback('asc_onStrikeout',            _.bind(this.onApiStrikeout, this));
            this.api.asc_registerCallback('asc_onVerticalAlign',        _.bind(this.onApiVerticalAlign, this));
            Common.NotificationCenter.on('fonts:change',                _.bind(this.onApiChangeFont, this));
            this.api.asc_registerCallback('asc_onListType',             _.bind(this.onApiBullets, this));
            this.api.asc_registerCallback('asc_canIncreaseIndent',      _.bind(this.onApiCanIncreaseIndent, this));
            this.api.asc_registerCallback('asc_canDecreaseIndent',      _.bind(this.onApiCanDecreaseIndent, this));
            this.api.asc_registerCallback('asc_onLineSpacing',          _.bind(this.onApiLineSpacing, this));
            this.api.asc_registerCallback('asc_onPrAlign',              _.bind(this.onApiParagraphAlign, this));
            this.api.asc_registerCallback('asc_onVerticalTextAlign',    _.bind(this.onApiVerticalTextAlign, this));
            this.api.asc_registerCallback('asc_onTextColor',            _.bind(this.onApiTextColor, this));
            this.api.asc_registerCallback('asc_onTextHighLight',       _.bind(this.onApiTextHighlightColor, this));
            // this.api.asc_registerCallback('asc_onCanGroup',             _.bind(this.onApiCanGroup, this));
            // this.api.asc_registerCallback('asc_onCanUnGroup',           _.bind(this.onApiCanUnGroup, this));
        },

        setApi: function(api) {
            this.api = api;
            this.attachCommonApiEvents();

            if (this.mode.isEdit) {
                this.attachPDFAnnotateApiEvents();
                this.mode.isPDFEdit && this.attachPDFEditApiEvents();
            } else if (this.mode.isRestrictedEdit)
                this.attachRestrictedEditApiEvents();
        },

        onChangeCompactView: function(view, compact) {
            this.toolbar.setFolded(compact);
            this.toolbar.fireEvent('view:compact', [this, compact]);

            compact && this.onTabCollapse();

            Common.localStorage.setBool('pdfe-compact-toolbar', compact);
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

        onCountPages: function(count) {
            this._state.pageCount = count;
            this.toolbar && this.toolbar.fieldPages && this.toolbar.fieldPages.setFixedValue('/ ' + count);
            this.toolbar.lockToolbar(Common.enumLock.singlePage, count<2, {array: [this.toolbar.btnDelPage]});
            this.toolbar.lockToolbar(Common.enumLock.firstPage, this._state.currentPage<1, {array: [this.toolbar.btnFirstPage, this.toolbar.btnPrevPage]});
            this.toolbar.lockToolbar(Common.enumLock.lastPage, this._state.currentPage>=this._state.pageCount-1, {array: [this.toolbar.btnLastPage, this.toolbar.btnNextPage]});
        },

        onCurrentPage: function(value) {
            this._state.currentPage = value;
            if (this.toolbar) {
                this.toolbar.fieldPages && this.toolbar.fieldPages.setValue(value + 1);
                this.toolbar.lockToolbar(Common.enumLock.firstPage, value<1, {array: [this.toolbar.btnFirstPage, this.toolbar.btnPrevPage]});
                this.toolbar.lockToolbar(Common.enumLock.lastPage, value>=this._state.pageCount-1, {array: [this.toolbar.btnLastPage, this.toolbar.btnNextPage]});
            }
        },

        onPagesChanged: function() {
            var value = parseInt(this.toolbar.fieldPages.getValue());
            if (value>this._state.pageCount)
                value = this._state.pageCount;
            this.api && this.api.goToPage(value-1);
        },

        onGotoPage: function (type, btn, e) {
            if (!this.api) return;

            if (type==='first')
                this.api.goToPage(0);
            else if (type==='last')
                this.api.goToPage(this._state.pageCount-1);
            else
                this.api.goToPage(this.api.getCurrentPage() + (type==='next' ? 1 : -1));
        },

        onApiCanRevert: function(which, can) {
            if (which=='undo') {
                if (this._state.can_undo !== can) {
                    this.toolbar.lockToolbar(Common.enumLock.undoLock, !can, {array: [this.toolbar.btnUndo]});
                    this._state.can_undo = can;
                }
            } else {
                if (this._state.can_redo !== can) {
                    this.toolbar.lockToolbar(Common.enumLock.redoLock, !can, {array: [this.toolbar.btnRedo]});
                    this._state.can_redo = can;
                }
            }
        },

        onApiCanCopyCut: function(cancopy, cancut) {
            if (this._state.can_copy !== cancopy) {
                this.toolbar.lockToolbar(Common.enumLock.copyLock, !cancopy, {array: [this.toolbar.btnCopy]});
                this._state.can_copy = cancopy;
            }
            (cancut===undefined) && (cancut = cancopy);
            if (this._state.can_cut !== cancut) {
                this.toolbar.lockToolbar(Common.enumLock.cutLock, !cancut, {array: [this.toolbar.btnCut]});
                this._state.can_cut = cancut;
            }
        },

        onApiFocusObject: function(selectedObjects) {
            if (!this.editMode || !this.mode.isPDFEdit) return;

            var pr, i = -1, type,
                paragraph_locked = false,
                shape_locked = undefined,
                no_paragraph = true,
                no_text = true,
                no_object = true,
                in_equation = false,
                toolbar = this.toolbar,
                no_columns = false,
                in_smartart = false,
                in_smartart_internal = false,
                in_annot = false,
                annot_lock = false;

            while (++i < selectedObjects.length) {
                type = selectedObjects[i].get_ObjectType();
                pr   = selectedObjects[i].get_ObjectValue();

                if (type === Asc.c_oAscTypeSelectElement.Paragraph) {
                    paragraph_locked = pr.get_Locked();
                    no_paragraph = false;
                    no_text = false;
                }  else if (type == Asc.c_oAscTypeSelectElement.Image || type == Asc.c_oAscTypeSelectElement.Shape || type == Asc.c_oAscTypeSelectElement.Chart || type == Asc.c_oAscTypeSelectElement.Table) {
                    shape_locked = pr.get_Locked();
                    no_object = false;
                    if (type == Asc.c_oAscTypeSelectElement.Table ||
                        type == Asc.c_oAscTypeSelectElement.Shape && !pr.get_FromImage()) {
                        no_text = false;
                    }
                    if (type == Asc.c_oAscTypeSelectElement.Table ||
                        type == Asc.c_oAscTypeSelectElement.Shape && !pr.get_FromImage() && !pr.get_FromChart()) {
                        no_paragraph = false;
                    }
                    if (type == Asc.c_oAscTypeSelectElement.Chart) {
                        no_columns = true;
                    }
                    if (type == Asc.c_oAscTypeSelectElement.Shape) {
                        var shapetype = pr.asc_getType();
                        if (shapetype=='line' || shapetype=='bentConnector2' || shapetype=='bentConnector3'
                            || shapetype=='bentConnector4' || shapetype=='bentConnector5' || shapetype=='curvedConnector2'
                            || shapetype=='curvedConnector3' || shapetype=='curvedConnector4' || shapetype=='curvedConnector5'
                            || shapetype=='straightConnector1')
                            no_columns = true;
                        if (pr.get_FromSmartArt())
                            in_smartart = true;
                        if (pr.get_FromSmartArtInternal())
                            in_smartart_internal = true;
                    }
                    if (type == Asc.c_oAscTypeSelectElement.Image || type == Asc.c_oAscTypeSelectElement.Table)
                        no_columns = true;
                } else if (type === Asc.c_oAscTypeSelectElement.Math) {
                    in_equation = true;
                } else if (type === Asc.c_oAscTypeSelectElement.Annot) {
                    in_annot = true;
                    if (pr.asc_getCanEditText())
                        no_text = false;
                }
            }

            if (this._state.prcontrolsdisable !== paragraph_locked) {
                if (this._state.activated) this._state.prcontrolsdisable = paragraph_locked;
                if (paragraph_locked!==undefined)
                    this.toolbar.lockToolbar(Common.enumLock.paragraphLock, paragraph_locked, {array: toolbar.paragraphControls});
            }

            if (this._state.no_paragraph !== no_paragraph) {
                if (this._state.activated) this._state.no_paragraph = no_paragraph;
                this.toolbar.lockToolbar(Common.enumLock.noParagraphSelected, no_paragraph, {array: toolbar.paragraphControls});
                // this.toolbar.lockToolbar(Common.enumLock.noParagraphSelected, no_paragraph, {array: [toolbar.btnCopyStyle]});
            }

            if (this._state.no_text !== no_text) {
                if (this._state.activated) this._state.no_text = no_text;
                this.toolbar.lockToolbar(Common.enumLock.noTextSelected, no_text, {array: toolbar.paragraphControls});
            }

            if (this._state.in_annot !== in_annot) {
                if (this._state.activated) this._state.in_annot = in_annot;
                this.toolbar.lockToolbar(Common.enumLock.inAnnotation, in_annot, {array: toolbar.paragraphControls});
            }

            if (this._state.no_object !== no_object ) {
                if (this._state.activated) this._state.no_object = no_object;
                this.toolbar.lockToolbar(Common.enumLock.noObjectSelected, no_object, {array: [toolbar.btnVerticalAlign ]});
            }

            var no_drawing_objects = this.api.asc_getSelectedDrawingObjectsCount()<1;
            if (this._state.no_drawing_objects !== no_drawing_objects ) {
                if (this._state.activated) this._state.no_drawing_objects = no_drawing_objects;
                this.toolbar.lockToolbar(Common.enumLock.noDrawingObjects, no_drawing_objects, {array: [toolbar.btnShapeAlign, toolbar.btnShapeArrange]});
            }

            if (shape_locked!==undefined && this._state.shapecontrolsdisable !== shape_locked) {
                if (this._state.activated) this._state.shapecontrolsdisable = shape_locked;
                this.toolbar.lockToolbar(Common.enumLock.shapeLock, shape_locked, {array: toolbar.shapeControls.concat(toolbar.paragraphControls)});
            }

            if (shape_locked===undefined && !this._state.no_drawing_objects) { // several tables selected
                this.toolbar.lockToolbar(Common.enumLock.shapeLock, false, {array: toolbar.shapeControls});
            }

            if (this._state.in_equation !== in_equation) {
                if (this._state.activated) this._state.in_equation = in_equation;
                this.toolbar.lockToolbar(Common.enumLock.inEquation, in_equation, {array: [toolbar.btnSuperscript, toolbar.btnSubscript]});
            }

            if (this._state.no_columns !== no_columns) {
                if (this._state.activated) this._state.no_columns = no_columns;
                this.toolbar.lockToolbar(Common.enumLock.noColumns, no_columns, {array: [toolbar.btnColumns]});
            }

            if (this._state.in_smartart !== in_smartart) {
                this.toolbar.lockToolbar(Common.enumLock.inSmartart, in_smartart, {array: toolbar.paragraphControls});
                this._state.in_smartart = in_smartart;
            }

            if (this._state.in_smartart_internal !== in_smartart_internal) {
                this.toolbar.lockToolbar(Common.enumLock.inSmartartInternal, in_smartart_internal, {array: toolbar.paragraphControls});
                this._state.in_smartart_internal = in_smartart_internal;

                toolbar.mnuArrangeFront.setDisabled(in_smartart_internal);
                toolbar.mnuArrangeBack.setDisabled(in_smartart_internal);
                toolbar.mnuArrangeForward.setDisabled(in_smartart_internal);
                toolbar.mnuArrangeBackward.setDisabled(in_smartart_internal);
            }
        },

        onApiZoomChange: function(percent, type) {},

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

        tryToSave: function () {
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
                    // buttons: (mode.canPDFAnnotate || mode.canPDFEdit || !mode.canDownload) ? ['ok'] : buttons.concat(['cancel']),
                    // primary: (mode.canPDFAnnotate || mode.canPDFEdit || !mode.canDownload) ? 'ok' : primary,
                    // msg: (mode.canPDFAnnotate || mode.canPDFEdit) ? this.txtNeedCommentMode : (mode.canDownload ? this.txtNeedDownload : this.errorAccessDeny),
                    buttons: mode.canDownload ? buttons.concat(['cancel']) : ['ok'],
                    primary: mode.canDownload ? primary : 'ok' ,
                    msg: mode.canDownload ? this.txtNeedDownload : this.errorAccessDeny,
                    callback: function(btn) {
                        if (saveAs && btn==='copy')
                            me.api.asc_DownloadAs();
                        else if (btn==='copy' || btn==='download') {
                            me._state.isFromToolbarDownloadAs = (btn==='copy');
                            var options = new Asc.asc_CDownloadOptions();
                            options.asc_setIsDownloadEvent(me._state.isFromToolbarDownloadAs);
                            options.asc_setIsSaveAs(me._state.isFromToolbarDownloadAs);
                            me.api.asc_DownloadOrigin(options);
                        }
                        Common.NotificationCenter.trigger('edit:complete', toolbar);
                    }
                });
            } else if (this.api) {
                // var isModified = this.api.asc_isDocumentCanSave();
                // var isSyncButton = toolbar.btnCollabChanges && toolbar.btnCollabChanges.cmpEl.hasClass('notify');
                // if (!isModified && !isSyncButton && !toolbar.mode.forcesave && !toolbar.mode.canSaveDocumentToBinary)
                //     return;

                this.api.asc_Save();
                toolbar.btnSave && toolbar.btnSave.setDisabled(!toolbar.mode.forcesave && toolbar.mode.canSaveToFile && !toolbar.mode.canSaveDocumentToBinary);
                Common.component.Analytics.trackEvent('Save');
                Common.component.Analytics.trackEvent('ToolBar', 'Save');
            }
        },

        onDownloadUrl: function(url, fileType) {
            if (this._state.isFromToolbarDownloadAs) {
                var me = this,
                    defFileName = this.getApplication().getController('Viewport').getView('Common.Views.Header').getDocumentCaption();
                !defFileName && (defFileName = me.txtUntitled);

                if (me.toolbar.mode.canRequestSaveAs) {
                    Common.Gateway.requestSaveAs(url, defFileName, fileType);
                } else {
                    me._saveCopyDlg = new Common.Views.SaveAsDlg({
                        saveFolderUrl: me.toolbar.mode.saveAsUrl,
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
            this._state.isFromToolbarDownloadAs = false;
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
                    if (!Common.localStorage.getBool("pdfe-hide-copywarning")) {
                        (new Common.Views.CopyWarningDialog({
                            handler: function(dontshow) {
                                if (dontshow) Common.localStorage.setItem("pdfe-hide-copywarning", 1);
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

        onSelectTool: function (type, btn, state, e) {
            if (this.api && state) {
                this._state.select_tool = type==='select';
                this.api.asc_setViewerTargetType(type);
                this.mode.isEdit && this.api.asc_StopInkDrawer();
                Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            }
        },

        turnOnSelectTool: function() {
            if ((this.mode.isEdit || this.mode.isRestrictedEdit) && this.toolbar && this.toolbar.btnSelectTool && !this.toolbar.btnSelectTool.isActive()) {
                this._state.select_tool = true;
                this.api.asc_setViewerTargetType('select');
                this.toolbar.btnSelectTool.toggle(true, true);
                this.toolbar.btnHandTool.toggle(false, true);
            }
        },

        clearSelectTools: function() {
            if (this.toolbar && this.toolbar.btnSelectTool && (this.toolbar.btnSelectTool.pressed || this.toolbar.btnHandTool.pressed)) {
                this._state.select_tool = this.toolbar.btnSelectTool.pressed;
                this.toolbar.btnSelectTool.toggle(false, true);
                this.toolbar.btnHandTool.toggle(false, true);
            }
        },

        updateSelectTools: function() {
            if (this.toolbar && this.toolbar.btnSelectTool) {
                this.toolbar.btnSelectTool.toggle(!!this._state.select_tool, true);
                this.toolbar.btnHandTool.toggle(!this._state.select_tool, true);
            }
        },

        turnOnShowComments: function() {
            this.toolbar && !this.toolbar.chShowComments.isChecked() && this.toolbar.chShowComments.setValue(true);
        },

        onBtnStrikeout: function(btn) {
            if (btn.pressed) {
                this._setStrikeoutColor(btn.currentColor);
            }
            else {
                this.api.SetMarkerFormat(btn.options.type, false);
                this.toolbar.btnsStrikeout.forEach(function(button) {
                    button.toggle(false, true);
                });
                this.updateSelectTools();
            }
        },

        onStrikeoutTransparentClick: function(item, e) {
            this._setStrikeoutColor('transparent', 'menu');
        },

        onSelectStrikeoutColor: function(picker, color) {
            this._setStrikeoutColor(color, 'menu');
        },

        _setStrikeoutColor: function(strcolor, h) {
            var me = this;
            me.turnOnSelectTool();
            me.turnOnShowComments();
            me.api.asc_StopInkDrawer();
            me.clearSelectTools();

            if (h === 'menu') {
                me._state.clrstrike = undefined;
                // me.onApiHighlightColor();

                me.toolbar.btnsStrikeout.forEach(function(button) {
                    button.currentColor = strcolor;
                    button.setColor(button.currentColor);
                    button.getPicker().select(button.currentColor, true);
                });
            }
            me.toolbar.btnsStrikeout.forEach(function(button) { // press all strikeout buttons
                button.toggle(true, true);
            });

            strcolor = strcolor || 'transparent';

            if (strcolor == 'transparent') {
                me.api.SetMarkerFormat(me.toolbar.btnStrikeout.options.type, true, 0);
                me.toolbar.mnusStrikeoutColorPicker.forEach(function(picker) {
                    picker && picker.clearSelection();
                });
                // me.toolbar.mnuStrikeoutTransparent.setChecked(true, true);
            } else {
                var r = strcolor[0] + strcolor[1],
                    g = strcolor[2] + strcolor[3],
                    b = strcolor[4] + strcolor[5];
                me.api.SetMarkerFormat(me.toolbar.btnStrikeout.options.type, true, 100, parseInt(r, 16), parseInt(g, 16), parseInt(b, 16));
                // me.toolbar.mnuStrikeoutTransparent.setChecked(false, true);
            }
            Common.NotificationCenter.trigger('edit:complete', me.toolbar, me.toolbar.btnStrikeout);
        },

        onBtnUnderline: function(btn) {
            if (btn.pressed) {
                this._setUnderlineColor(btn.currentColor);
            }
            else {
                this.api.SetMarkerFormat(btn.options.type, false);
                this.toolbar.btnsUnderline.forEach(function(button) {
                    button.toggle(false, true);
                });
                this.updateSelectTools();
            }
        },

        onUnderlineTransparentClick: function(item, e) {
            this._setUnderlineColor('transparent', 'menu');
        },

        onSelectUnderlineColor: function(picker, color) {
            this._setUnderlineColor(color, 'menu');
        },

        _setUnderlineColor: function(strcolor, h) {
            var me = this;
            me.turnOnSelectTool();
            me.turnOnShowComments();
            me.api.asc_StopInkDrawer();
            me.clearSelectTools();

            if (h === 'menu') {
                me._state.clrunderline = undefined;
                // me.onApiHighlightColor();

                me.toolbar.btnsUnderline.forEach(function(button) {
                    button.currentColor = strcolor;
                    button.setColor(button.currentColor);
                    button.getPicker().select(button.currentColor, true);
                });
            }
            me.toolbar.btnsUnderline.forEach(function(button) { // press all strikeout buttons
                button.toggle(true, true);
            });

            strcolor = strcolor || 'transparent';

            if (strcolor == 'transparent') {
                me.api.SetMarkerFormat(me.toolbar.btnUnderline.options.type, true, 0);
                me.toolbar.mnusUnderlineColorPicker.forEach(function(picker) {
                    picker && picker.clearSelection();
                });
                // me.toolbar.mnuUnderlineTransparent.setChecked(true, true);
            } else {
                var r = strcolor[0] + strcolor[1],
                    g = strcolor[2] + strcolor[3],
                    b = strcolor[4] + strcolor[5];
                me.api.SetMarkerFormat(me.toolbar.btnUnderline.options.type, true, 100, parseInt(r, 16), parseInt(g, 16), parseInt(b, 16));
                // me.toolbar.mnuUnderlineTransparent.setChecked(false, true);
            }
            Common.NotificationCenter.trigger('edit:complete', me.toolbar, me.toolbar.btnUnderline);
        },

        onBtnHighlight: function(btn) {
            if (btn.pressed) {
                this._setHighlightColor(btn.currentColor);
            }
            else {
                this.api.SetMarkerFormat(btn.options.type, false);
                this.toolbar.btnsHighlight.forEach(function(button) {
                    button.toggle(false, true);
                });
                this.updateSelectTools();
            }
        },

        onHighlightTransparentClick: function(item, e) {
            this._setHighlightColor('transparent', 'menu');
        },

        onSelectHighlightColor: function(picker, color) {
            this._setHighlightColor(color, 'menu');
        },

        _setHighlightColor: function(strcolor, h) {
            var me = this;
            me.turnOnSelectTool();
            me.turnOnShowComments();
            me.api.asc_StopInkDrawer();
            me.clearSelectTools();

            if (h === 'menu') {
                me._state.clrhighlight = undefined;
                // me.onApiHighlightColor();

                me.toolbar.btnsHighlight.forEach(function(button) {
                    button.currentColor = strcolor;
                    button.setColor(button.currentColor);
                    button.getPicker().select(button.currentColor, true);
                });
            }
            me.toolbar.btnsHighlight.forEach(function(button) { // press all strikeout buttons
                button.toggle(true, true);
            });

            strcolor = strcolor || 'transparent';

            if (strcolor == 'transparent') {
                me.api.SetMarkerFormat(me.toolbar.btnHighlight.options.type, true, 0);
                me.toolbar.mnusHighlightColorPicker.forEach(function(picker) {
                    picker && picker.clearSelection();
                });
                // me.toolbar.mnuHighlightTransparent.setChecked(true, true);
            } else {
                var r = strcolor[0] + strcolor[1],
                    g = strcolor[2] + strcolor[3],
                    b = strcolor[4] + strcolor[5];
                me.api.SetMarkerFormat(me.toolbar.btnHighlight.options.type, true, 100, parseInt(r, 16), parseInt(g, 16), parseInt(b, 16));
                // me.toolbar.mnuHighlightTransparent.setChecked(false, true);
            }
            Common.NotificationCenter.trigger('edit:complete', me.toolbar, me.toolbar.btnHighlight);
        },

        onApiStartHighlight: function(type, pressed) {
            if (type === this.toolbar.btnHighlight.options.type)
                this.toolbar.btnsHighlight.forEach(function(button) {
                    button.toggle(pressed, true);
                });
            else if (type === this.toolbar.btnStrikeout.options.type)
                this.toolbar.btnsStrikeout.forEach(function(button) {
                    button.toggle(pressed, true);
                });
            else if (type === this.toolbar.btnUnderline.options.type)
                this.toolbar.btnsUnderline.forEach(function(button) {
                    button.toggle(pressed, true);
                });
            else if (type===undefined)
                this.toolbar.btnTextHighlightColor && this.toolbar.btnTextHighlightColor.toggle(pressed, true);
            if (type!==undefined) {
                pressed ? this.clearSelectTools() : this.updateSelectTools();
            }
        },

        onDrawStart: function() {
            this.api && this.api.SetMarkerFormat(undefined, false);
            this.onClearHighlight();
            this.turnOnShowComments();
            this.clearSelectTools();
        },

        onDrawStop: function() {
            this.onClearHighlight();
            this.turnOnShowComments();
            this.updateSelectTools();
        },

        onClearHighlight: function() {
            this.toolbar.btnsHighlight.concat(this.toolbar.btnsStrikeout).concat(this.toolbar.btnsUnderline).forEach(function(button) {
                button.toggle(false, true);
            });
            this.toolbar.btnTextHighlightColor && this.toolbar.btnTextHighlightColor.toggle(false, true);
        },

        onShowCommentsChange: function(checkbox, state) {
            var value = state === 'checked';
            Common.Utils.InternalSettings.set("pdfe-settings-livecomment", value);
            (value) ? this.api.asc_showComments(Common.Utils.InternalSettings.get("pdfe-settings-resolvedcomment")) : this.api.asc_hideComments();
        },

        onRotateClick: function(btn, e) {
            // this.api && this.api.asc_Rotate();
        },

        onBeforeTextComment: function(btn, e) {
            Common.UI.TooltipManager.closeTip('textComment');
        },

        onBtnTextCommentClick: function(btn, e) {
            Common.UI.TooltipManager.closeTip('textComment');
            this.onInsertTextComment(btn.options.textboxType, btn, e);
        },

        onMenuTextCommentClick: function(btn, e) {
            var oldType = this.toolbar.btnTextComment.options.textboxType;
            var newType = e.value;

            if(newType !== oldType){
                this.toolbar.btnTextComment.changeIcon({
                    next: e.options.iconClsForMainBtn,
                    curr: this.toolbar.btnTextComment.menu.items.filter(function(item){return item.value == oldType})[0].options.iconClsForMainBtn
                });
                // this.toolbar.btnTextComment.updateHint([e.caption, this.toolbar.tipInsertText]);
                this.toolbar.btnTextComment.updateHint(e.caption);
                this.toolbar.btnTextComment.setCaption(e.options.captionForMainBtn);
                this.toolbar.btnTextComment.options.textboxType = newType;
            }
            this.onInsertTextComment(newType, btn, e);
        },

        onInsertTextComment: function(type, btn, e) {
            this.api && this.api.AddFreeTextAnnot(type);

            Common.NotificationCenter.trigger('edit:complete', this.toolbar, this.toolbar.btnTextComment);
            Common.component.Analytics.trackEvent('ToolBar', 'Add Text');
        },

        onFillRequiredFields: function(isFilled) {
            this.toolbar && this.toolbar.btnSubmit && this.toolbar.lockToolbar(Common.enumLock.requiredNotFilled, !isFilled, {array: [this.toolbar.btnSubmit]});
        },

        onClearClick: function() {
            this.api && this.api.asc_ClearAllSpecialForms();
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onGoToForm: function(type) {
            this.api && this.api.asc_MoveToFillingForm(type=='next');
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onSubmitClick: function() {
            this.api && this.api.asc_SendForm();
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onSaveFormClick: function() {
            if (this.api && this.mode && this.mode.canDownload) {
                if (this.mode.isOffline)
                    this.api.asc_DownloadAs(new Asc.asc_CDownloadOptions(Asc.c_oAscFileType.PDF));
                else {
                    this._state.isFromToolbarDownloadAs = this.mode.canRequestSaveAs || !!this.mode.saveAsUrl;
                    var options = new Asc.asc_CDownloadOptions(Asc.c_oAscFileType.PDF, this._state.isFromToolbarDownloadAs);
                    options.asc_setIsSaveAs(this._state.isFromToolbarDownloadAs);
                    this.api.asc_DownloadAs(options);
                }
            }
        },

        onLongActionBegin: function(type, id) {
            if (id==Asc.c_oAscAsyncAction['Submit'] && this.toolbar.btnSubmit) {
                this._submitFail = false;
                this.submitedTooltip && this.submitedTooltip.hide();
                this.toolbar.lockToolbar(Common.enumLock.submit, true, {array: [this.toolbar.btnSubmit]})
            }
        },

        onLongActionEnd: function(type, id) {
            if (id==Asc.c_oAscAsyncAction['Submit'] && this.toolbar.btnSubmit) {
                this.toolbar.lockToolbar(Common.enumLock.submit, false, {array: [this.toolbar.btnSubmit]})
                if (!this.submitedTooltip) {
                    this.submitedTooltip = new Common.UI.SynchronizeTip({
                        text: this.textSubmited,
                        extCls: 'no-arrow',
                        showLink: false,
                        target: $('.toolbar'),
                        placement: 'bottom'
                    });
                    this.submitedTooltip.on('closeclick', function () {
                        this.submitedTooltip.hide();
                    }, this);
                }
                !this._submitFail && this.submitedTooltip.show();
            }
        },

        onError: function(id, level, errData) {
            if (id==Asc.c_oAscError.ID.Submit) {
                this._submitFail = true;
                this.submitedTooltip && this.submitedTooltip.hide();
            }
        },

        activateControls: function() {
            this.toolbar.lockToolbar(Common.enumLock.disableOnStart, false);
            this.toolbar.lockToolbar(Common.enumLock.undoLock, this._state.can_undo!==true, {array: [this.toolbar.btnUndo]});
            this.toolbar.lockToolbar(Common.enumLock.redoLock, this._state.can_redo!==true, {array: [this.toolbar.btnRedo]});
            this.toolbar.lockToolbar(Common.enumLock.copyLock, this._state.can_copy!==true, {array: [this.toolbar.btnCopy]});
            this.toolbar.lockToolbar(Common.enumLock.cutLock, this._state.can_cut!==true, {array: [this.toolbar.btnCut]});
            this.api && this.toolbar.btnSave && this.toolbar.btnSave.setDisabled(this.mode.canSaveToFile && !this.api.isDocumentModified());
            this._state.activated = true;
        },

        onHomeOpen: function() {
        },

        onHideMenus: function(e){
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onApiCoAuthoringDisconnect: function(enableDownload) {
            (this.mode.isEdit || this.mode.isRestrictedEdit) && this.toolbar.setMode({isDisconnected:true, enableDownload: !!enableDownload});
            this.editMode = false;
            this.DisableToolbar(true, true);
        },

        DisableToolbar: function(disable, viewMode) {
            if (viewMode!==undefined) this.editMode = !viewMode;
            disable = disable || !this.editMode;

            var mask = $('.toolbar-mask');
            if (disable && mask.length>0 || !disable && mask.length==0) return;

            var toolbar = this.toolbar;
            toolbar.hideMoreBtns();

            if(disable) {
                mask = $("<div class='toolbar-mask'>").appendTo(toolbar.$el.find('.toolbar'));
            } else {
                mask.remove();
            }
            toolbar.$el.find('.toolbar').toggleClass('masked', $('.toolbar-mask').length>0);
            if ( toolbar.synchTooltip )
                toolbar.synchTooltip.hide();

            var hkComments = Common.Utils.isMac ? 'command+alt+a' : 'alt+h';
            disable ? Common.util.Shortcuts.suspendEvents(hkComments) : Common.util.Shortcuts.resumeEvents(hkComments);
        },

        createDelayedElements: function() {
            this.toolbar.createDelayedElements();
            this.attachUIEvents(this.toolbar);
            Common.Utils.injectSvgIcons();
        },

        onAppShowed: function (config) {
            var me = this;

            var compactview = !(config.isEdit || config.isRestrictedEdit);
            if ( config.isEdit || config.isRestrictedEdit) {
                if ( Common.localStorage.itemExists("pdfe-compact-toolbar") ) {
                    compactview = Common.localStorage.getBool("pdfe-compact-toolbar");
                } else
                if ( config.customization && config.customization.compactToolbar )
                    compactview = true;
            }

            me.toolbar.render(_.extend({isCompactView: compactview}, config));

            if ( config.isEdit || config.isRestrictedEdit) {
                me.toolbar.setMode(config);
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
            if ( config.isEdit ) {
                me.toolbar.btnSave.on('disabled', _.bind(me.onBtnChangeState, me, 'save:disabled'));

                var drawtab = me.getApplication().getController('Common.Controllers.Draw');
                drawtab.setApi(me.api).setMode(config);
                $panel = drawtab.createToolbarPanel(true);
                if ($panel) {
                    me.toolbar.$el.find('.draw-groups').after($panel);
                    Array.prototype.push.apply(me.toolbar.lockControls, drawtab.getView().getButtons());
                    Array.prototype.push.apply(me.toolbar.paragraphControls, drawtab.getView().getButtons());
                }

                !config.canViewComments && me.toolbar.setVisible('comment', false);
            }

            var tab = {caption: me.toolbar.textTabView, action: 'view', extcls: config.isEdit ? 'canedit' : '', layoutname: 'toolbar-view', dataHintTitle: 'W'};
            var viewtab = me.getApplication().getController('ViewTab');
            viewtab.setApi(me.api).setConfig({toolbar: me, mode: config});
            var $panel = viewtab.createToolbarPanel();
            if ($panel) {
                me.toolbar.addTab(tab, $panel, 8);
                me.toolbar.setVisible('view', Common.UI.LayoutManager.isElementVisible('toolbar-view'));
            }

            if (config.isPDFEdit) {
                me._state.initEditing = false;
                tab = {caption: me.toolbar.textTabInsert, action: 'ins', extcls: config.isEdit ? 'canedit' : '', layoutname: 'toolbar-insert', dataHintTitle: 'I'};
                var instab = me.getApplication().getController('InsTab');
                instab.setApi(me.api).setConfig({toolbar: me, mode: config});
                $panel = instab.createToolbarPanel();
                if ($panel) {
                    me.toolbar.addTab(tab, $panel, 1);
                    me.toolbar.setVisible('ins', true);
                }
            }
        },

        applyMode: function() {
            var me = this,
                toolbar = this.toolbar,
                $host = $(toolbar.$layout);
            if (this.mode.isPDFEdit && this._state.initEditing) {
                Array.prototype.push.apply(me.toolbar.lockControls, toolbar.applyLayoutPDFEdit(this.mode));
                toolbar.rendererComponentsPDFEdit($host);

                setTimeout(function(){
                    toolbar.createDelayedElementsPDFEdit();
                    me.attachPDFEditApiEvents();
                    me.attachPDFEditUIEvents(toolbar);
                    me.fillFontsStore(toolbar.cmbFontName, me._state.fontname);
                    toolbar.lockToolbar(Common.enumLock.disableOnStart, false);
                    me.onCountPages(me._state.pageCount);
                    me.onApiFocusObject([]);
                    me.api.UpdateInterfaceState();
                }, 50);

                var tab = {caption: toolbar.textTabInsert, action: 'ins', extcls: this.mode.isEdit ? 'canedit' : '', layoutname: 'toolbar-insert', dataHintTitle: 'I'};
                var instab = this.getApplication().getController('InsTab');
                instab.setApi(this.api).setConfig({toolbar: this, mode: this.mode});
                toolbar.addTab(tab, instab.createToolbarPanel(), 1);
                instab.onAppReady(this.mode);
                setTimeout(function(){
                    instab.onDocumentReady();
                }, 50);

                this._state.initEditing = false;
            }
            if (this.mode.isPDFEdit || toolbar.isTabActive('ins'))
                toolbar.setTab('home');
            toolbar.setVisible('ins', this.mode.isPDFEdit);
            $host.find('.annotate').toggleClass('hidden', this.mode.isPDFEdit);
            $host.find('.pdfedit').toggleClass('hidden', !this.mode.isPDFEdit);
        },
        
        onAppReady: function (config) {
            var me = this;
            me.appOptions = config;

            (new Promise(function(accept) {
                accept();
            })).then(function () {
                var hand = !config.isEdit;
                me.toolbar && me.toolbar.btnHandTool && me.toolbar[hand ? 'btnHandTool' : 'btnSelectTool'].toggle(true, true);
                me.api && me.api.asc_setViewerTargetType(hand ? 'hand' : 'select');
                if (config.isRestrictedEdit && me.toolbar && me.toolbar.btnSubmit && me.api && !me.api.asc_IsAllRequiredFormsFilled()) {
                    me.toolbar.lockToolbar(Common.enumLock.requiredNotFilled, true, {array: [me.toolbar.btnSubmit]});
                    if (!Common.localStorage.getItem("pdfe-embed-hide-submittip")) {
                        me.requiredTooltip = new Common.UI.SynchronizeTip({
                            extCls: 'colored',
                            placement: Common.UI.isRTL() ? 'bottom-left' : 'bottom-right',
                            target: me.toolbar.btnSubmit.$el,
                            text: me.textRequired,
                            showLink: false,
                            closable: false,
                            showButton: true,
                            textButton: me.textGotIt
                        });
                        var onclose = function () {
                            me.requiredTooltip.hide();
                            me.api.asc_MoveToFillingForm(true, true, true);
                            me.toolbar.btnSubmit.updateHint(me.textRequired);
                        };
                        me.requiredTooltip.on('buttonclick', function () {
                            onclose();
                            Common.localStorage.setItem("pdfe-embed-hide-submittip", 1);
                        });
                        me.requiredTooltip.on('closeclick', onclose);
                        me.requiredTooltip.show();
                    } else {
                        me.toolbar.btnSubmit.updateHint(me.textRequired);
                    }
                }
                config.isEdit && Common.UI.TooltipManager.showTip('editPdf');
            });
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

        onActiveTab: function(tab) {
            if (tab !== 'file' && tab !== 'home' && this.requiredTooltip) {
                this.requiredTooltip.close();
                this.requiredTooltip = undefined;
            }
            (tab !== 'home') && Common.UI.TooltipManager.closeTip('editPdf');
            (tab === 'comment') ? Common.UI.TooltipManager.showTip('textComment') : Common.UI.TooltipManager.closeTip('textComment');
        },

        onTabCollapse: function(tab) {
            Common.UI.TooltipManager.closeTip('editPdf');
            Common.UI.TooltipManager.closeTip('textComment');
        },

        applySettings: function() {
            this.toolbar && this.toolbar.chShowComments && this.toolbar.chShowComments.setValue(Common.Utils.InternalSettings.get("pdfe-settings-livecomment"), true);
        },

        onApiMathTypes: function(equation) {
            this._equationTemp = equation;
        },

        onInitStandartTextures: function(texture) {
            this._textureTemp = texture;
        },

        fillFontsStore: function(combo, name) {
            if (combo.store.length===0) {
                var fontstore = new Common.Collections.Fonts(),
                    fonts = this.getCollection('Common.Collections.Fonts').toJSON();
                var arr = [];
                _.each(fonts, function(font, index){
                    if (!font.cloneid) {
                        arr.push(_.clone(font));
                    }
                });
                fontstore.add(arr);
                combo.fillFonts(fontstore);
                name && combo.onApiChangeFont(name);
            }
        },

        onApiChangeFont: function(font) {
            if (!this.mode.isPDFEdit) return;
            this._state.fontname = font;
            !Common.Utils.ModalWindow.isVisible() && this.toolbar.cmbFontName.onApiChangeFont(font);
        },

        onApiFontSize: function(size) {
            if (!this.mode.isPDFEdit) return;
            if (this._state.fontsize !== size) {
                this.toolbar.cmbFontSize.setValue(size);
                this._state.fontsize = size;
            }
        },

        onApiBold: function(on) {
            if (!this.mode.isPDFEdit) return;
            if (this._state.bold !== on) {
                this.toolbar.btnBold.toggle(on === true, true);
                this._state.bold = on;
            }
        },

        onApiItalic: function(on) {
            if (!this.mode.isPDFEdit) return;
            if (this._state.italic !== on) {
                this.toolbar.btnItalic.toggle(on === true, true);
                this._state.italic = on;
            }
        },

        onApiUnderline: function(on) {
            if (!this.mode.isPDFEdit) return;
            if (this._state.underline !== on) {
                this.toolbar.btnTextUnderline.toggle(on === true, true);
                this._state.underline = on;
            }
        },

        onApiStrikeout: function(on) {
            if (!this.mode.isPDFEdit) return;
            if (this._state.strike !== on) {
                this.toolbar.btnTextStrikeout.toggle(on === true, true);
                this._state.strike = on;
            }
        },

        onApiVerticalAlign: function(typeBaseline) {
            if (!this.mode.isPDFEdit) return;
            if (this._state.valign !== typeBaseline) {
                this.toolbar.btnSuperscript.toggle(typeBaseline==Asc.vertalign_SuperScript, true);
                this.toolbar.btnSubscript.toggle(typeBaseline==Asc.vertalign_SubScript, true);
                this._state.valign = typeBaseline;
            }
        },

        onApiCanIncreaseIndent: function(value) {
            if (!this.mode.isPDFEdit) return;
            if (this._state.can_increase !== value) {
                this.toolbar.lockToolbar(Common.enumLock.incIndentLock, !value, {array: [this.toolbar.btnIncLeftOffset]});
                if (this._state.activated) this._state.can_increase = value;
            }
        },

        onApiCanDecreaseIndent: function(value) {
            if (!this.mode.isPDFEdit) return;
            if (this._state.can_decrease !== value) {
                this.toolbar.lockToolbar(Common.enumLock.decIndentLock, !value, {array: [this.toolbar.btnDecLeftOffset]});
                if (this._state.activated) this._state.can_decrease = value;
            }
        },

        updateBulletTip: function(view, title) {
            if (view) {
                var tip = $(view.el).data('bs.tooltip');
                if (tip) {
                    tip.options.title = title;
                    tip.$tip.find('.tooltip-inner').text(title);
                }
            }
        },

        onApiBullets: function(v) {
            if (!this.mode.isPDFEdit) return;
            if (!(this.toolbar.mnuMarkersPicker && this.toolbar.mnuMarkersPicker.store)) {
                this._state.needCallApiBullets = v;
                return;
            }
            this._state.needCallApiBullets = undefined;

            if (this._state.bullets.type !== v.get_ListType() || this._state.bullets.subtype !== v.get_ListSubType() || v.get_ListType()===0 && v.get_ListSubType()===0x1000) {
                this._state.bullets.type    = v.get_ListType();
                this._state.bullets.subtype = v.get_ListSubType();

                var rec = this.toolbar.mnuMarkersPicker.store.at(8),
                    drawDefBullet = (rec.get('data').subtype===0x1000) && (this._state.bullets.type===1 || this._state.bullets.subtype!==0x1000);

                this._clearBullets();

                switch(this._state.bullets.type) {
                    case 0:
                        var idx;
                        if (this._state.bullets.subtype!==0x1000)
                            idx = this._state.bullets.subtype;
                        else { // custom
                            var bullet = v.asc_getListCustom();
                            if (bullet) {
                                var type = bullet.asc_getType();
                                if (type == Asc.asc_PreviewBulletType.char) {
                                    var symbol = bullet.asc_getChar();
                                    if (symbol) {
                                        var custombullet = new Asc.asc_CBullet();
                                        custombullet.asc_putSymbol(symbol);
                                        custombullet.asc_putFont(bullet.asc_getSpecialFont());

                                        rec.get('data').subtype = 0x1000;
                                        rec.set('customBullet', custombullet);
                                        rec.set('numberingInfo', JSON.stringify(custombullet.asc_getJsonBullet()));
                                        rec.set('tip', '');
                                        this.toolbar.mnuMarkersPicker.dataViewItems && this.updateBulletTip(this.toolbar.mnuMarkersPicker.dataViewItems[8], '');
                                        drawDefBullet = false;
                                        idx = 8;
                                    }
                                } else if (type == Asc.asc_PreviewBulletType.image) {
                                    var id = bullet.asc_getImageId();
                                    if (id) {
                                        var custombullet = new Asc.asc_CBullet();
                                        custombullet.asc_fillBulletImage(id);

                                        rec.get('data').subtype = 0x1000;
                                        rec.set('customBullet', custombullet);
                                        rec.set('numberingInfo', JSON.stringify(custombullet.asc_getJsonBullet()));
                                        rec.set('tip', '');
                                        this.toolbar.mnuMarkersPicker.dataViewItems && this.updateBulletTip(this.toolbar.mnuMarkersPicker.dataViewItems[8], '');
                                        drawDefBullet = false;
                                        idx = 8;
                                    }
                                }
                            }
                        }
                        (idx!==undefined) ? this.toolbar.mnuMarkersPicker.selectByIndex(idx, true) :
                            this.toolbar.mnuMarkersPicker.deselectAll(true);

                        this.toolbar.btnMarkers.toggle(true, true);
                        this.toolbar.mnuNumbersPicker.deselectAll(true);
                        break;
                    case 1:
                        var idx = 0;
                        switch(this._state.bullets.subtype) {
                            case 1:
                                idx = 4;
                                break;
                            case 2:
                                idx = 5;
                                break;
                            case 3:
                                idx = 6;
                                break;
                            case 4:
                                idx = 1;
                                break;
                            case 5:
                                idx = 2;
                                break;
                            case 6:
                                idx = 3;
                                break;
                            case 7:
                                idx = 7;
                                break;
                        }
                        this.toolbar.btnNumbers.toggle(true, true);
                        this.toolbar.mnuNumbersPicker.selectByIndex(idx, true);
                        this.toolbar.mnuMarkersPicker.deselectAll(true);
                        break;
                }
                if (drawDefBullet) {
                    rec.get('data').subtype = 8;
                    rec.set('numberingInfo', this.toolbar._markersArr[8]);
                    rec.set('tip', this.toolbar.tipMarkersDash);
                    this.toolbar.mnuMarkersPicker.dataViewItems && this.updateBulletTip(this.toolbar.mnuMarkersPicker.dataViewItems[8], this.toolbar.tipMarkersDash);
                }
            }
        },

        onApiParagraphAlign: function(v) {
            if (!this.mode.isPDFEdit) return;
            if (this._state.pralign !== v) {
                this._state.pralign = v;

                var index = -1,
                    align,
                    btnHorizontalAlign = this.toolbar.btnHorizontalAlign;

                switch (v) {
                    case 0: index = 2; align = 'btn-align-right'; break;
                    case 1: index = 0; align = 'btn-align-left'; break;
                    case 2: index = 1; align = 'btn-align-center'; break;
                    case 3: index = 3; align = 'btn-align-just'; break;
                    default:  index = -255; align = 'btn-align-left'; break;
                }
                if (!(index < 0)) {
                    btnHorizontalAlign.menu.items[index].setChecked(true);
                } else if (index == -255) {
                    btnHorizontalAlign.menu.clearAll();
                }

                if ( btnHorizontalAlign.rendered && btnHorizontalAlign.$icon ) {
                    btnHorizontalAlign.$icon.removeClass(btnHorizontalAlign.options.icls).addClass(align);
                    btnHorizontalAlign.options.icls = align;
                }
            }
        },

        onApiVerticalTextAlign: function(v) {
            if (!this.mode.isPDFEdit) return;
            if (this._state.vtextalign !== v) {
                this._state.vtextalign = v;

                var index = -1,
                    align = '',
                    btnVerticalAlign = this.toolbar.btnVerticalAlign;

                switch (v) {
                    case Asc.c_oAscVAlign.Top:    index = 0; align = 'btn-align-top';    break;
                    case Asc.c_oAscVAlign.Center:    index = 1; align = 'btn-align-middle'; break;
                    case Asc.c_oAscVAlign.Bottom: index = 2; align = 'btn-align-bottom'; break;
                    default:  index = -255; align = 'btn-align-middle'; break;
                }

                if (!(index < 0)) {
                    btnVerticalAlign.menu.items[index].setChecked(true);
                } else if (index == -255) {
                    btnVerticalAlign.menu.clearAll();
                }

                if ( btnVerticalAlign.rendered && btnVerticalAlign.$icon ) {
                    btnVerticalAlign.$icon.removeClass(btnVerticalAlign.options.icls).addClass(align);
                    btnVerticalAlign.options.icls = align;
                }
            }
        },

        onApiLineSpacing: function(vc) {
            if (!this.mode.isPDFEdit) return;
            var line = (vc.get_Line() === null || vc.get_LineRule() === null || vc.get_LineRule() != 1) ? -1 : vc.get_Line();

            if (this._state.linespace !== line) {
                this._state.linespace = line;

                var mnuLineSpace = this.toolbar.btnLineSpace.menu;
                _.each(mnuLineSpace.items, function(item){
                    item.setChecked(false, true);
                });
                if (line<0) return;

                if ( Math.abs(line-1.)<0.0001 )
                    mnuLineSpace.items[0].setChecked(true, true);
                else if ( Math.abs(line-1.15)<0.0001 )
                    mnuLineSpace.items[1].setChecked(true, true);
                else if ( Math.abs(line-1.5)<0.0001 )
                    mnuLineSpace.items[2].setChecked(true, true);
                else if ( Math.abs(line-2)<0.0001 )
                    mnuLineSpace.items[3].setChecked(true, true);
                else if ( Math.abs(line-2.5)<0.0001 )
                    mnuLineSpace.items[4].setChecked(true, true);
                else if ( Math.abs(line-3)<0.0001 )
                    mnuLineSpace.items[5].setChecked(true, true);
            }
        },

        onApiCanGroup: function(value) {
            if (this._state.can_group!==value) {
                this.toolbar.mnuGroupShapes.setDisabled(!value);
                if (this._state.activated) this._state.can_group = value;
            }
        },

        onApiCanUnGroup: function(value) {
            if (this._state.can_ungroup!==value) {
                this.toolbar.mnuUnGroupShapes.setDisabled(!value);
                if (this._state.activated) this._state.can_ungroup = value;
            }
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

        onTextUnderline: function(btn, e) {
            this._state.underline = undefined;
            if (this.api)
                this.api.put_TextPrUnderline(btn.pressed);

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Underline');
        },

        onTextStrikeout: function(btn, e) {
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

        onChangeCase: function(menu, item, e) {
            if (this.api)
                this.api.asc_ChangeTextCase(item.value);
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onMenuHorizontalAlignSelect: function(menu, item) {
            this._state.pralign = undefined;
            var btnHorizontalAlign = this.toolbar.btnHorizontalAlign;

            btnHorizontalAlign.$icon.removeClass(btnHorizontalAlign.options.icls);
            btnHorizontalAlign.options.icls = !item.checked ? 'btn-align-left' : item.options.icls;
            btnHorizontalAlign.$icon.addClass(btnHorizontalAlign.options.icls);

            if (this.api && item.checked)
                this.api.put_PrAlign(item.value);

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Horizontal Align');
        },

        onMenuVerticalAlignSelect: function(menu, item) {
            var btnVerticalAlign = this.toolbar.btnVerticalAlign;

            btnVerticalAlign.$icon.removeClass(btnVerticalAlign.options.icls);
            btnVerticalAlign.options.icls = !item.checked ? 'btn-align-middle' : item.options.icls;
            btnVerticalAlign.$icon.addClass(btnVerticalAlign.options.icls);

            this._state.vtextalign = undefined;
            if (this.api && item.checked)
                this.api.setVerticalAlign(item.value);

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Vertical Align');
        },

        onMarkers: function(btn, e) {
            var record = {
                data: {
                    type: 0,
                    subtype: btn.pressed ? 0: -1
                }
            };

            this.onSelectBullets(null, null, null, record);

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onNumbers: function(btn, e) {
            var record = {
                data: {
                    type: 1,
                    subtype: btn.pressed ? 0: -1
                }
            };
            this.onSelectBullets(null, null, null, record);

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onMarkerSettingsClick: function(type) {
            var me      = this,
                props;

            var selectedElements = me.api.getSelectedElements();
            if (selectedElements && _.isArray(selectedElements)) {
                for (var i = 0; i< selectedElements.length; i++) {
                    if (Asc.c_oAscTypeSelectElement.Paragraph == selectedElements[i].get_ObjectType()) {
                        props = selectedElements[i].get_ObjectValue();
                        break;
                    }
                }
            }
            if (props) {
                (new Common.Views.ListSettingsDialog({
                    api: me.api,
                    props: props,
                    type: type,
                    colorConfig: Common.UI.simpleColorsConfig,
                    storage: me.mode.canRequestInsertImage || me.mode.fileChoiceUrl && me.mode.fileChoiceUrl.indexOf("{documentType}")>-1,
                    interfaceLang: me.toolbar.mode.lang,
                    handler: function(result, value) {
                        if (result == 'ok') {
                            if (me.api) {
                                props.asc_putBullet(value);
                                me.api.paraApply(props);
                            }
                        }
                        Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                    }
                })).show();
            }
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
            if (this.api)
                this.api.put_TextPrFontSize(record.value);

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

                if (!item) {
                    value = /^\+?(\d*(\.|,).?\d+)$|^\+?(\d+(\.|,)?\d*)$/.exec(record.value);

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
                value = value > 300 ? 300 :
                    value < 1 ? 1 : Math.floor((value+0.4)*2)/2;

                combo.setRawValue(value);

                this._state.fontsize = undefined;
                if (this.api) {
                    this.api.put_TextPrFontSize(value);
                }

                Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            }
        },

        onListShowAfter: function(type, picker) {
            var store = picker.store;
            var arr = [];
            store.each(function(item){
                arr.push({
                    numberingInfo: {bullet: item.get('numberingInfo')==='undefined' ? undefined : JSON.parse(item.get('numberingInfo'))},
                    divId: item.get('id')
                });
            });
            if (this.api && this.api.SetDrawImagePreviewBulletForMenu) {
                this.api.SetDrawImagePreviewBulletForMenu(arr, type);
            }
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

            if (btn) {
                btn.toggle(rawData.data.subtype !== -1, true);
            }

            if (this.api){
                if (rawData.data.type===0 && rawData.data.subtype===0x1000) {// custom bullet
                    var bullet = rawData.customBullet;
                    if (bullet) {
                        var selectedElements = this.api.getSelectedElements();
                        if (selectedElements && _.isArray(selectedElements)) {
                            for (var i = 0; i< selectedElements.length; i++) {
                                if (Asc.c_oAscTypeSelectElement.Paragraph == selectedElements[i].get_ObjectType()) {
                                    var props = selectedElements[i].get_ObjectValue();
                                    props.asc_putBullet(bullet);
                                    this.api.paraApply(props);
                                    break;
                                }
                            }
                        }
                    }
                } else
                    this.api.put_ListType(rawData.data.type, rawData.data.subtype);
            }

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'List Type');
        },

        onLineSpaceToggle: function(menu, item, state, e) {
            if (!!state) {
                this._state.linespace = undefined;
                if (this.api)
                    this.api.put_PrLineSpacing(c_paragraphLinerule.LINERULE_AUTO, item.value);

                Common.NotificationCenter.trigger('edit:complete', this.toolbar);
                Common.component.Analytics.trackEvent('ToolBar', 'Line Spacing');
            }
        },

        onColumnsSelect: function(menu, item) {
            if (_.isUndefined(item.value))
                return;

            this._state.columns = undefined;

            if (this.api) {
                if (item.value == 'advanced') {
                    var win,
                        me = this;
                    var selectedElements = me.api.getSelectedElements();
                    if (selectedElements && selectedElements.length>0){
                        var elType, elValue;
                        for (var i = selectedElements.length - 1; i >= 0; i--) {
                            elType = selectedElements[i].get_ObjectType();
                            elValue = selectedElements[i].get_ObjectValue();
                            if (Asc.c_oAscTypeSelectElement.Shape == elType) {
                                var win = new PDFE.Views.ShapeSettingsAdvanced(
                                    {
                                        shapeProps: elValue,
                                        slideSize: {width: me.api.get_PageWidth(), height: me.api.get_PageHeight()},
                                        handler: function(result, value) {
                                            if (result == 'ok') {
                                                if (me.api) {
                                                    me.api.ShapeApply(value.shapeProps);
                                                }
                                            }
                                            Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                                        }
                                    });
                                win.show();
                                win.setActiveCategory(5);
                                break;
                            }
                        }
                    }
                } else if (item.checked) {
                    var props = new Asc.asc_CShapeProperty(),
                        cols = item.value;
                    props.asc_putColumnNumber(cols+1);
                    this.api.ShapeApply(props);
                }
            }

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Insert Columns');
        },

        onBeforeColumns: function() {
            var index = -1;
            var selectedElements = this.api.getSelectedElements();
            if (selectedElements && selectedElements.length>0){
                var elType, elValue;
                for (var i = selectedElements.length - 1; i >= 0; i--) {
                    if (Asc.c_oAscTypeSelectElement.Shape == selectedElements[i].get_ObjectType()) {
                        var value = selectedElements[i].get_ObjectValue().asc_getColumnNumber();
                        if (value<4)
                            index = value-1;
                        break;
                    }
                }
            }
            if (this._state.columns === index)
                return;

            if (index < 0)
                this.toolbar.btnColumns.menu.clearAll();
            else
                this.toolbar.btnColumns.menu.items[index].setChecked(true);
            this._state.columns = index;
        },

        onClearStyleClick: function(btn, e) {
            if (this.api)
                this.api.ClearFormating();

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onBeforeShapeAlign: function() {
            var value = this.api.asc_getSelectedDrawingObjectsCount(),
                slide_checked = Common.Utils.InternalSettings.get("pdfe-align-to-slide") || false;
            this.toolbar.mniAlignObjects.setDisabled(value<2);
            this.toolbar.mniAlignObjects.setChecked(value>1 && !slide_checked, true);
            this.toolbar.mniAlignToSlide.setChecked(value<2 || slide_checked, true);
            this.toolbar.mniDistribHor.setDisabled(value<3 && this.toolbar.mniAlignObjects.isChecked());
            this.toolbar.mniDistribVert.setDisabled(value<3 && this.toolbar.mniAlignObjects.isChecked());
        },

        onShapeAlign: function(menu, item) {
            if (this.api) {
                var value = this.toolbar.mniAlignToSlide.isChecked() ? Asc.c_oAscObjectsAlignType.Page : Asc.c_oAscObjectsAlignType.Selected;
                if (item.value>-1 && item.value < 6) {
                    this.api.put_ShapesAlign(item.value, value);
                    Common.component.Analytics.trackEvent('ToolBar', 'Shape Align');
                } else if (item.value == 6) {
                    this.api.DistributeHorizontally(value);
                    Common.component.Analytics.trackEvent('ToolBar', 'Distribute');
                } else if (item.value == 7){
                    this.api.DistributeVertically(value);
                    Common.component.Analytics.trackEvent('ToolBar', 'Distribute');
                }
                Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            }
        },

        onShapeArrange: function(menu, item) {
            if (this.api) {
                switch (item.value) {
                    case 1:
                        this.api.shapes_bringToFront();
                        Common.component.Analytics.trackEvent('ToolBar', 'Shape Arrange');
                        break;
                    case 2:
                        this.api.shapes_bringToBack();
                        Common.component.Analytics.trackEvent('ToolBar', 'Shape Arrange');
                        break;
                    case 3:
                        this.api.shapes_bringForward();
                        Common.component.Analytics.trackEvent('ToolBar', 'Shape Arrange');
                        break;
                    case 4:
                        this.api.shapes_bringBackward();
                        Common.component.Analytics.trackEvent('ToolBar', 'Shape Arrange');
                        break;
                    case 5:
                        this.api.groupShapes();
                        Common.component.Analytics.trackEvent('ToolBar', 'Shape Group');
                        break;
                    case 6:
                        this.api.unGroupShapes();
                        Common.component.Analytics.trackEvent('ToolBar', 'Shape UnGroup');
                        break;
                }
                Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            }
        },

        onDelPage: function() {
            this.api && this.api.asc_RemovePage();
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onRotatePage: function() {
            this.api && this.api.asc_RotatePage(this.api.asc_GetPageRotate(this._state.currentPage) + 90);
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onRotatePageMenu: function(menu, item) {
            this.api && this.api.asc_RotatePage(this.api.asc_GetPageRotate(this._state.currentPage) + item.value);
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        _clearBullets: function() {
            this.toolbar.btnMarkers.toggle(false, true);
            this.toolbar.btnNumbers.toggle(false, true);

            this.toolbar.mnuMarkersPicker.selectByIndex(0, true);
            this.toolbar.mnuNumbersPicker.selectByIndex(0, true);
        },

        _getApiTextSize: function () {
            var out_value   = 12,
                textPr      = this.api.get_TextProps();

            if (textPr && textPr.get_TextPr) {
                out_value = textPr.get_TextPr().get_FontSize();
            }

            return out_value;
        },

        onSelectFontColor: function(btn, color) {
            this._state.clrtext = this._state.clrtext_asccolor  = undefined;

            this.toolbar.btnFontColor.currentColor = color;
            this.toolbar.btnFontColor.setColor((typeof(color) == 'object') ? color.color : color);

            this.toolbar.mnuFontColorPicker.currentColor = color;
            if (this.api)
                this.api.put_TextColor(Common.Utils.ThemeColor.getRgbColor(color));

            Common.component.Analytics.trackEvent('ToolBar', 'Text Color');
        },

        onBtnFontColor: function() {
            this.toolbar.mnuFontColorPicker.trigger('select', this.toolbar.mnuFontColorPicker, this.toolbar.mnuFontColorPicker.currentColor || this.toolbar.btnFontColor.currentColor);
        },

        onEditTextClick: function() {
            this.api && this.api.asc_EditPage();
        },

        onApiTextColor: function(color) {
            if (!this.mode.isPDFEdit) return;
            var clr;
            var picker = this.toolbar.mnuFontColorPicker;

            if (color) {
                if (color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                    clr = {color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()), effectValue: color.get_value() };
                } else
                    clr = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
            }

            var type1 = typeof(clr),
                type2 = typeof(this._state.clrtext);

            if ((type1 !== type2) || (type1 == 'object' &&
                    (clr.effectValue !== this._state.clrtext.effectValue || this._state.clrtext.color.indexOf(clr.color) < 0)) ||
                (type1 != 'object' && this._state.clrtext.indexOf(clr) < 0)) {

                Common.Utils.ThemeColor.selectPickerColorByEffect(clr, picker);
                this._state.clrtext = clr;
            }
            this._state.clrtext_asccolor = color;
        },

        onApiTextHighlightColor: function(c) {
            if (!this.mode.isPDFEdit) return;
            if (c) {
                if (c == -1) {
                    if (this._state.textclrhighlight != -1) {
                        this.toolbar.mnuTextHighlightTransparent.setChecked(true, true);

                        if (this.toolbar.mnuTextHighlightColorPicker) {
                            this._state.textclrhighlight = -1;
                            this.toolbar.mnuTextHighlightColorPicker.clearSelection();
                        }
                    }
                } else if (c !== null) {
                    if (this._state.textclrhighlight != c.get_hex().toUpperCase()) {
                        this.toolbar.mnuTextHighlightTransparent.setChecked(false);
                        this._state.textclrhighlight = c.get_hex().toUpperCase();

                        if ( this.toolbar.mnuTextHighlightColorPicker && _.contains(this.toolbar.mnuTextHighlightColorPicker.colors, this._state.textclrhighlight) )
                            this.toolbar.mnuTextHighlightColorPicker.selectByRGB(this._state.textclrhighlight, true);
                    }
                }  else {
                    if ( this._state.textclrhighlight !== c) {
                        this.toolbar.mnuTextHighlightTransparent.setChecked(false, true);
                        this.toolbar.mnuTextHighlightColorPicker && this.toolbar.mnuTextHighlightColorPicker.clearSelection();
                        this._state.textclrhighlight = c;
                    }
                }
            }
        },

        _setMarkerColor: function(strcolor, h) {
            var me = this;
            me.api.asc_StopInkDrawer();

            if (h === 'menu') {
                me._state.textclrhighlight = undefined;
                me.onApiTextHighlightColor();

                me.toolbar.btnTextHighlightColor.currentColor = strcolor;
                me.toolbar.btnTextHighlightColor.setColor(me.toolbar.btnTextHighlightColor.currentColor);
                me.toolbar.btnTextHighlightColor.toggle(true, true);
            }

            strcolor = strcolor || 'transparent';

            if (strcolor == 'transparent') {
                me.api.SetMarkerFormat(undefined, true, false);
            } else {
                var r = strcolor[0] + strcolor[1],
                    g = strcolor[2] + strcolor[3],
                    b = strcolor[4] + strcolor[5];
                me.api.SetMarkerFormat(undefined, true, true, parseInt(r, 16), parseInt(g, 16), parseInt(b, 16));
            }
            Common.NotificationCenter.trigger('edit:complete', me.toolbar, me.toolbar.btnTextHighlightColor);
            Common.component.Analytics.trackEvent('ToolBar', 'Highlight Color');
        },

        onBtnTextHighlightColor: function(btn) {
            if (btn.pressed) {
                this._setMarkerColor(btn.currentColor);
                Common.component.Analytics.trackEvent('ToolBar', 'Highlight Color');
            }
            else {
                this.api.SetMarkerFormat(undefined, false);
            }
        },

        onSelectTextHighlightColor: function(picker, color) {
            this._setMarkerColor(color, 'menu');
        },

        onTextHighlightTransparentClick: function(item, e) {
            this._setMarkerColor('transparent', 'menu');
        },

        changePDFMode: function(data) {
            this.toolbar && this.toolbar.btnEditMode && this.toolbar.btnEditMode.toggle(!!this.mode.isPDFEdit, true);
        },

        onPluginToolbarMenu: function(data) {
            this.toolbar && Array.prototype.push.apply(this.toolbar.lockControls, Common.UI.LayoutManager.addCustomItems(this.toolbar, data));
        },

        textWarning: 'Warning',
        notcriticalErrorTitle: 'Warning',
        txtNeedCommentMode: 'To save changes to the file, switch to Сommenting mode. Or you can download a copy of the modified file.',
        txtNeedDownload: 'At the moment, PDF viewer can only save new changes in separate file copies. It doesn\'t support co-editing and other users won\'t see your changes unless you share a new file version.',
        txtDownload: 'Download',
        txtSaveCopy: 'Save copy',
        errorAccessDeny: 'You are trying to perform an action you do not have rights for.<br>Please contact your Document Server administrator.',
        txtUntitled: 'Untitled',
        textRequired: 'Fill all required fields to send form.',
        textGotIt: 'Got it',
        textSubmited: '<b>Form submitted successfully</b><br>Click to close the tip.',
        confirmAddFontName: 'The font you are going to save is not available on the current device.<br>The text style will be displayed using one of the device fonts, the saved font will be used when it is available.<br>Do you want to continue?',
        helpTextComment: 'Insert a text comment or text callout in your PDF file.',
        helpTextCommentHeader: 'Text Comment',
        helpEditPdf: 'Edit text, add, delete, and rotate pages, insert images, tables, etc.',
        helpEditPdfHeader: 'Edit PDF'

    }, PDFE.Controllers.Toolbar || {}));
});
