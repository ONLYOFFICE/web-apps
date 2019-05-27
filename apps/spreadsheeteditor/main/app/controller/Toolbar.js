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
 *  Toolbar.js
 *
 *  Created by Alexander Yuzhin on 3/31/14
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'common/main/lib/component/Window',
    'common/main/lib/view/CopyWarningDialog',
    'common/main/lib/view/ImageFromUrlDialog',
    'common/main/lib/view/SelectFileDlg',
    'common/main/lib/util/define',
    'spreadsheeteditor/main/app/view/Toolbar',
    'spreadsheeteditor/main/app/collection/TableTemplates',
    'spreadsheeteditor/main/app/controller/PivotTable',
    'spreadsheeteditor/main/app/view/HyperlinkSettingsDialog',
    'spreadsheeteditor/main/app/view/TableOptionsDialog',
    'spreadsheeteditor/main/app/view/NamedRangeEditDlg',
    'spreadsheeteditor/main/app/view/NamedRangePasteDlg',
    'spreadsheeteditor/main/app/view/NameManagerDlg',
    'spreadsheeteditor/main/app/view/FormatSettingsDialog',
    'spreadsheeteditor/main/app/view/PageMarginsDialog'
], function () { 'use strict';

    SSE.Controllers.Toolbar = Backbone.Controller.extend(_.extend({
        models: [],
        collections: [],
        views: [
            'Toolbar'
        ],

        initialize: function() {
            var me = this;

            this.addListeners({
                'Toolbar': {
                    'change:compact': this.onClickChangeCompact.bind(me)
                },
                'FileMenu': {
                    'menu:hide': me.onFileMenu.bind(me, 'hide'),
                    'menu:show': me.onFileMenu.bind(me, 'show')
                },
                'Statusbar': {
                    'sheet:changed': _.bind(this.onApiSheetChanged, this)
                },
                'LeftMenu': {
                    'settings:apply': _.bind(this.applyFormulaSettings, this)
                },
                'Common.Views.Header': {
                    'toolbar:setcompact': this.onChangeViewMode.bind(this),
                    'print': function (opts) {
                        var _main = this.getApplication().getController('Main');
                        _main.onPrint();
                    },
                    'save': function (opts) {
                        this.api.asc_Save();
                    },
                    'undo': this.onUndo,
                    'redo': this.onRedo,
                    'downloadas': function (opts) {
                        var _main = this.getApplication().getController('Main');
                        var _file_type = _main.appOptions.spreadsheet.fileType,
                            _format;
                        if ( !!_file_type ) {
                            _format = Asc.c_oAscFileType[ _file_type.toUpperCase() ];
                        }

                        var _supported = [
                            Asc.c_oAscFileType.XLSX,
                            Asc.c_oAscFileType.ODS,
                            Asc.c_oAscFileType.CSV,
                            Asc.c_oAscFileType.PDFA,
                            Asc.c_oAscFileType.XLTX,
                            Asc.c_oAscFileType.OTS
                        ];

                        if ( !_format || _supported.indexOf(_format) < 0 )
                            _format = Asc.c_oAscFileType.PDF;

                        if (_format == Asc.c_oAscFileType.PDF || _format == Asc.c_oAscFileType.PDFA)
                            Common.NotificationCenter.trigger('download:settings', this.toolbar, _format);
                        else
                            _main.api.asc_DownloadAs(_format);
                    },
                    'go:editor': function() {
                        Common.Gateway.requestEditRights();
                    }
                }
            });
            Common.NotificationCenter.on('page:settings', _.bind(this.onApiSheetChanged, this));

            this.editMode = true;
            this._isAddingShape = false;
            this._state = {
                activated: false,
                prstyle: undefined,
                clrtext: undefined,
                pralign: undefined,
                clrback: undefined,
                valign: undefined,
                can_undo: undefined,
                can_redo: undefined,
                bold: undefined,
                italic: undefined,
                underline: undefined,
                strikeout: undefined,
                subscript: undefined,
                superscript: undefined,
                wrap: undefined,
                merge: undefined,
                angle: undefined,
                controlsdisabled: {
                    rows: undefined,
                    cols: undefined,
                    cells_right: undefined,
                    cells_down: undefined,
                    filters: undefined
                },
                selection_type: undefined,
                filter: undefined,
                filterapplied: false,
                tablestylename: undefined,
                tablename: undefined,
                namedrange_locked: false,
                fontsize: undefined,
                multiselect: false,
                sparklines_disabled: false,
                numformatinfo: undefined,
                numformattype: undefined,
                numformat: undefined,
                langId: undefined,
                pgsize: [0, 0],
                pgmargins: undefined,
                pgorient: undefined,
                lock_doc: undefined
            };

            var checkInsertAutoshape =  function(e, action) {
                var cmp = $(e.target),
                    cmp_sdk = cmp.closest('#editor_sdk'),
                    btn_id = cmp.closest('button').attr('id');
                if (btn_id===undefined)
                    btn_id = cmp.closest('.btn-group').attr('id');

                if (me.api && me.api.asc_isAddAutoshape() ) {
                    if (cmp_sdk.length <=0 || action == 'cancel') {
                        if ( me.toolbar.btnInsertText.pressed && btn_id != me.toolbar.btnInsertText.id ||
                            me.toolbar.btnInsertShape.pressed && btn_id != me.toolbar.btnInsertShape.id ) {
                            me._isAddingShape         = false;

                            me._addAutoshape(false);
                            me.toolbar.btnInsertShape.toggle(false, true);
                            me.toolbar.btnInsertText.toggle(false, true);
                            Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                        } else if ( me.toolbar.btnInsertShape.pressed && btn_id == me.toolbar.btnInsertShape.id) {
                            _.defer(function(){
                                me.api.asc_endAddShape();
                                Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                            }, 100);
                        }
                    }
                }
            };

            this.checkInsertAutoshape = function(cmp) {
                checkInsertAutoshape({}, cmp.action);
            };

            this._addAutoshape = function(isstart, type) {
                if (this.api) {
                    if (isstart) {
                        this.api.asc_startAddShape(type);
                        $(document.body).on('mouseup', checkInsertAutoshape);
                    } else {
                        this.api.asc_endAddShape();
                        $(document.body).off('mouseup', checkInsertAutoshape);
                    }
                }
            };


            this.onApiEndAddShape = function() {
                if (this.toolbar.btnInsertShape.pressed) this.toolbar.btnInsertShape.toggle(false, true);
                if (this.toolbar.btnInsertText.pressed)  this.toolbar.btnInsertText.toggle(false, true);
                $(document.body).off('mouseup', checkInsertAutoshape);
            };
        },

        onLaunch: function() {
            // Create toolbar view
            this.toolbar = this.createView('Toolbar');

            Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            Common.NotificationCenter.on('app:face', this.onAppShowed.bind(this));
        },

        setMode: function(mode) {
            this.mode = mode;
            this.toolbar.applyLayout(mode);
        },

        attachUIEvents: function(toolbar) {
            var me = this;

            /**
             * UI Events
             */
            if ( me.appConfig.isEditDiagram ) {
                toolbar.btnUndo.on('click',                                 _.bind(this.onUndo, this));
                toolbar.btnRedo.on('click',                                 _.bind(this.onRedo, this));
                toolbar.btnCopy.on('click',                                 _.bind(this.onCopyPaste, this, true));
                toolbar.btnPaste.on('click',                                _.bind(this.onCopyPaste, this, false));
                toolbar.btnInsertFormula.on('click',                        _.bind(this.onInsertFormulaMenu, this));
                toolbar.btnInsertFormula.menu.on('item:click',              _.bind(this.onInsertFormulaMenu, this));
                toolbar.btnDecDecimal.on('click',                           _.bind(this.onDecrement, this));
                toolbar.btnIncDecimal.on('click',                           _.bind(this.onIncrement, this));
                toolbar.cmbNumberFormat.on('selected',                      _.bind(this.onNumberFormatSelect, this));
                toolbar.cmbNumberFormat.on('show:before',                   _.bind(this.onNumberFormatOpenBefore, this, true));
                if (toolbar.cmbNumberFormat.cmpEl)
                    toolbar.cmbNumberFormat.cmpEl.on('click', '#id-toolbar-mnu-item-more-formats a', _.bind(this.onNumberFormatSelect, this));
                toolbar.btnEditChart.on('click',                            _.bind(this.onEditChart, this));
            } else
            if ( me.appConfig.isEditMailMerge ) {
                toolbar.btnUndo.on('click',                                 _.bind(this.onUndo, this));
                toolbar.btnRedo.on('click',                                 _.bind(this.onRedo, this));
                toolbar.btnCopy.on('click',                                 _.bind(this.onCopyPaste, this, true));
                toolbar.btnPaste.on('click',                                _.bind(this.onCopyPaste, this, false));
                toolbar.btnSearch.on('click',                               _.bind(this.onSearch, this));
                toolbar.btnSortDown.on('click',                             _.bind(this.onSortType, this, Asc.c_oAscSortOptions.Ascending));
                toolbar.btnSortUp.on('click',                               _.bind(this.onSortType, this, Asc.c_oAscSortOptions.Descending));
                toolbar.btnSetAutofilter.on('click',                        _.bind(this.onAutoFilter, this));
                toolbar.btnClearAutofilter.on('click',                      _.bind(this.onClearFilter, this));
            } else {
                toolbar.btnPrint.on('click',                                _.bind(this.onPrint, this));
                toolbar.btnPrint.on('disabled',                             _.bind(this.onBtnChangeState, this, 'print:disabled'));
                toolbar.btnSave.on('click',                                 _.bind(this.onSave, this));
                toolbar.btnSave.on('disabled',                              _.bind(this.onBtnChangeState, this, 'save:disabled'));
                toolbar.btnUndo.on('click',                                 _.bind(this.onUndo, this));
                toolbar.btnUndo.on('disabled',                              _.bind(this.onBtnChangeState, this, 'undo:disabled'));
                toolbar.btnRedo.on('click',                                 _.bind(this.onRedo, this));
                toolbar.btnRedo.on('disabled',                              _.bind(this.onBtnChangeState, this, 'redo:disabled'));
                toolbar.btnCopy.on('click',                                 _.bind(this.onCopyPaste, this, true));
                toolbar.btnPaste.on('click',                                _.bind(this.onCopyPaste, this, false));
                toolbar.btnIncFontSize.on('click',                          _.bind(this.onIncreaseFontSize, this));
                toolbar.btnDecFontSize.on('click',                          _.bind(this.onDecreaseFontSize, this));
                toolbar.btnBold.on('click',                                 _.bind(this.onBold, this));
                toolbar.btnItalic.on('click',                               _.bind(this.onItalic, this));
                toolbar.btnUnderline.on('click',                            _.bind(this.onUnderline, this));
                toolbar.btnStrikeout.on('click',                            _.bind(this.onStrikeout, this));
                toolbar.btnSubscript.on('click',                            _.bind(this.onSubscript, this));
                toolbar.btnSubscript.menu.on('item:click',                  _.bind(this.onSubscriptMenu, this));
                toolbar.btnTextColor.on('click',                            _.bind(this.onTextColor, this));
                toolbar.btnBackColor.on('click',                            _.bind(this.onBackColor, this));
                toolbar.mnuTextColorPicker.on('select',                     _.bind(this.onTextColorSelect, this));
                toolbar.mnuBackColorPicker.on('select',                     _.bind(this.onBackColorSelect, this));
                toolbar.btnBorders.on('click',                              _.bind(this.onBorders, this));
                if (toolbar.btnBorders.rendered) {
                    toolbar.btnBorders.menu.on('item:click',                    _.bind(this.onBordersMenu, this));
                    toolbar.mnuBorderWidth.on('item:toggle',                    _.bind(this.onBordersWidth, this));
                    toolbar.mnuBorderColorPicker.on('select',                   _.bind(this.onBordersColor, this));
                }
                toolbar.btnAlignLeft.on('click',                            _.bind(this.onHorizontalAlign, this, AscCommon.align_Left));
                toolbar.btnAlignCenter.on('click',                          _.bind(this.onHorizontalAlign, this, AscCommon.align_Center));
                toolbar.btnAlignRight.on('click',                           _.bind(this.onHorizontalAlign, this, AscCommon.align_Right));
                toolbar.btnAlignJust.on('click',                            _.bind(this.onHorizontalAlign, this, AscCommon.align_Justify));
                toolbar.btnHorizontalAlign.menu.on('item:click',            _.bind(this.onHorizontalAlignMenu, this));
                toolbar.btnVerticalAlign.menu.on('item:click',              _.bind(this.onVerticalAlignMenu, this));
                toolbar.btnMerge.on('click',                                _.bind(this.onMergeCellsMenu, this, toolbar.btnMerge.menu, toolbar.btnMerge.menu.items[0]));
                toolbar.btnMerge.menu.on('item:click',                      _.bind(this.onMergeCellsMenu, this));
                toolbar.btnAlignTop.on('click',                             _.bind(this.onVerticalAlign, this, Asc.c_oAscVAlign.Top));
                toolbar.btnAlignMiddle.on('click',                          _.bind(this.onVerticalAlign, this, Asc.c_oAscVAlign.Center));
                toolbar.btnAlignBottom.on('click',                          _.bind(this.onVerticalAlign, this, Asc.c_oAscVAlign.Bottom));
                toolbar.btnWrap.on('click',                                 _.bind(this.onWrap, this));
                toolbar.btnTextOrient.menu.on('item:click',                 _.bind(this.onTextOrientationMenu, this));
                toolbar.btnInsertImage.menu.on('item:click',                _.bind(this.onInsertImageMenu, this));
                toolbar.btnInsertHyperlink.on('click',                      _.bind(this.onHyperlink, this));
                toolbar.mnuInsertChartPicker.on('item:click',               _.bind(this.onSelectChart, this));
                toolbar.btnInsertText.on('click',                           _.bind(this.onBtnInsertTextClick, this));
                toolbar.btnInsertShape.menu.on('hide:after',                _.bind(this.onInsertShapeHide, this));
                toolbar.btnInsertEquation.on('click',                       _.bind(this.onInsertEquationClick, this));
                toolbar.btnSortDown.on('click',                             _.bind(this.onSortType, this, Asc.c_oAscSortOptions.Ascending));
                toolbar.btnSortUp.on('click',                               _.bind(this.onSortType, this, Asc.c_oAscSortOptions.Descending));
                toolbar.mnuitemSortAZ.on('click',                           _.bind(this.onSortType, this, Asc.c_oAscSortOptions.Ascending));
                toolbar.mnuitemSortZA.on('click',                           _.bind(this.onSortType, this, Asc.c_oAscSortOptions.Descending));
                toolbar.btnSetAutofilter.on('click',                        _.bind(this.onAutoFilter, this));
                toolbar.mnuitemAutoFilter.on('click',                       _.bind(this.onAutoFilter, this));
                toolbar.btnClearAutofilter.on('click',                      _.bind(this.onClearFilter, this));
                toolbar.mnuitemClearFilter.on('click',                      _.bind(this.onClearFilter, this));
                toolbar.btnTableTemplate.menu.on('show:after',              _.bind(this.onTableTplMenuOpen, this));
                toolbar.btnPercentStyle.on('click',                         _.bind(this.onNumberFormat, this));
                toolbar.btnCurrencyStyle.on('click',                        _.bind(this.onNumberFormat, this));
                toolbar.btnDecDecimal.on('click',                           _.bind(this.onDecrement, this));
                toolbar.btnIncDecimal.on('click',                           _.bind(this.onIncrement, this));
                toolbar.btnInsertFormula.on('click',                        _.bind(this.onInsertFormulaMenu, this));
                toolbar.btnInsertFormula.menu.on('item:click',              _.bind(this.onInsertFormulaMenu, this));
                toolbar.btnNamedRange.menu.on('item:click',                 _.bind(this.onNamedRangeMenu, this));
                toolbar.btnNamedRange.menu.on('show:after',                 _.bind(this.onNamedRangeMenuOpen, this));
                toolbar.btnClearStyle.menu.on('item:click',                 _.bind(this.onClearStyleMenu, this));
                toolbar.btnAddCell.menu.on('item:click',                    _.bind(this.onCellInsertMenu, this));
                toolbar.btnCopyStyle.on('toggle',                           _.bind(this.onCopyStyleToggle, this));
                toolbar.btnDeleteCell.menu.on('item:click',                 _.bind(this.onCellDeleteMenu, this));
                toolbar.btnColorSchemas.menu.on('item:click',               _.bind(this.onColorSchemaClick, this));
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
                toolbar.listStyles.on('click',                              _.bind(this.onListStyleSelect, this));
                toolbar.cmbNumberFormat.on('selected',                      _.bind(this.onNumberFormatSelect, this));
                toolbar.cmbNumberFormat.on('show:before',                   _.bind(this.onNumberFormatOpenBefore, this, true));
                if (toolbar.cmbNumberFormat.cmpEl)
                    toolbar.cmbNumberFormat.cmpEl.on('click', '#id-toolbar-mnu-item-more-formats a', _.bind(this.onNumberFormatSelect, this));
                toolbar.btnCurrencyStyle.menu.on('item:click',              _.bind(this.onNumberFormatMenu, this));
                $('#id-toolbar-menu-new-fontcolor').on('click',             _.bind(this.onNewTextColor, this));
                $('#id-toolbar-menu-new-paracolor').on('click',             _.bind(this.onNewBackColor, this));
                $('#id-toolbar-menu-new-bordercolor').on('click',           _.bind(this.onNewBorderColor, this));
                toolbar.btnPageOrient.menu.on('item:click',                 _.bind(this.onPageOrientSelect, this));
                toolbar.btnPageMargins.menu.on('item:click',                _.bind(this.onPageMarginsSelect, this));
                toolbar.mnuPageSize.on('item:click',                        _.bind(this.onPageSizeClick, this));
                toolbar.btnPrintArea.menu.on('item:click',                  _.bind(this.onPrintAreaClick, this));
                toolbar.btnPrintArea.menu.on('show:after',                  _.bind(this.onPrintAreaMenuOpen, this));
                toolbar.btnImgGroup.menu.on('item:click',                   _.bind(this.onImgGroupSelect, this));
                toolbar.btnImgBackward.menu.on('item:click',                _.bind(this.onImgArrangeSelect, this));
                toolbar.btnImgForward.menu.on('item:click',                 _.bind(this.onImgArrangeSelect, this));
                toolbar.btnImgAlign.menu.on('item:click',                   _.bind(this.onImgAlignSelect, this));
                toolbar.btnImgForward.on('click',                           this.onImgArrangeSelect.bind(this, 'forward'));
                toolbar.btnImgBackward.on('click',                          this.onImgArrangeSelect.bind(this, 'backward'));

                this.onSetupCopyStyleButton();
            }
        },

        setApi: function(api) {
            this.api = api;

            var config = SSE.getController('Main').appOptions;
            if ( !config.isEditDiagram  && !config.isEditMailMerge ) {
                this.api.asc_registerCallback('asc_onSendThemeColors',      _.bind(this.onSendThemeColors, this));
                this.api.asc_registerCallback('asc_onMathTypes',            _.bind(this.onMathTypes, this));
                this.api.asc_registerCallback('asc_onContextMenu',          _.bind(this.onContextMenu, this));
            }

            this.api.asc_registerCallback('asc_onInitEditorStyles',     _.bind(this.onApiInitEditorStyles, this));
            this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',_.bind(this.onApiCoAuthoringDisconnect, this));
            Common.NotificationCenter.on('api:disconnect',              _.bind(this.onApiCoAuthoringDisconnect, this));
            this.api.asc_registerCallback('asc_onLockDefNameManager',   _.bind(this.onLockDefNameManager, this));
            this.api.asc_registerCallback('asc_onZoomChanged',          _.bind(this.onApiZoomChange, this));
        },

        // onNewDocument: function(btn, e) {
        //     this.api.asc_openNewDocument();
        //
        //     Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        //     Common.component.Analytics.trackEvent('ToolBar', 'New Document');
        // },
        //
        // onOpenDocument: function(btn, e) {
        //     this.api.asc_loadDocumentFromDisk();
        //
        //     Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        //     Common.component.Analytics.trackEvent('ToolBar', 'Open Document');
        // },

        onContextMenu: function() {
            this.toolbar.collapse();
        },

        onPrint: function(e) {
            Common.NotificationCenter.trigger('print', this.toolbar);
        },

        onSave: function(e) {
            if (this.api) {
                var isModified = this.api.asc_isDocumentCanSave();
                var isSyncButton = this.toolbar.btnCollabChanges && this.toolbar.btnCollabChanges.$icon.hasClass('btn-synch');
                if (!isModified && !isSyncButton && !this.toolbar.mode.forcesave)
                    return;

                this.api.asc_Save();
            }

//            Common.NotificationCenter.trigger('edit:complete', this.toolbar);

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
                this.api.asc_Undo();

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Undo');
        },

        onRedo: function(btn, e) {
            if (this.api)
                this.api.asc_Redo();

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Redo');
        },

        onCopyPaste: function(copy, e) {
            var me = this;
            if (me.api) {
                var res = (copy) ? me.api.asc_Copy() : me.api.asc_Paste();
                if (!res) {
                    var value = Common.localStorage.getItem("sse-hide-copywarning");
                    if (!(value && parseInt(value) == 1)) {
                        (new Common.Views.CopyWarningDialog({
                            handler: function(dontshow) {
                                if (dontshow) Common.localStorage.setItem("sse-hide-copywarning", 1);
                                Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                            }
                        })).show();
                    }
                } else
                    Common.component.Analytics.trackEvent('ToolBar', 'Copy Warning');
            }
            Common.NotificationCenter.trigger('edit:complete', me.toolbar);
        },

        onIncreaseFontSize: function(e) {
            if (this.api)
                this.api.asc_increaseFontSize();

            Common.NotificationCenter.trigger('edit:complete', this.toolbar, {restorefocus:true});
            Common.component.Analytics.trackEvent('ToolBar', 'Font Size');
        },

        onDecreaseFontSize: function(e) {
            if (this.api)
                this.api.asc_decreaseFontSize();

            Common.NotificationCenter.trigger('edit:complete', this.toolbar, {restorefocus:true});
            Common.component.Analytics.trackEvent('ToolBar', 'Font Size');
        },

        onBold: function(btn, e) {
            this._state.bold = undefined;
            if (this.api)
                this.api.asc_setCellBold(btn.pressed);

            Common.NotificationCenter.trigger('edit:complete', this.toolbar, {restorefocus:true});
            Common.component.Analytics.trackEvent('ToolBar', 'Bold');
        },

        onItalic: function(btn, e) {
            this._state.italic = undefined;
            if (this.api)
                this.api.asc_setCellItalic(btn.pressed);

            Common.NotificationCenter.trigger('edit:complete', this.toolbar, {restorefocus:true});
            Common.component.Analytics.trackEvent('ToolBar', 'Italic');
        },

        onUnderline: function(btn, e) {
            this._state.underline = undefined;
            if (this.api)
                this.api.asc_setCellUnderline(btn.pressed);

            Common.NotificationCenter.trigger('edit:complete', this.toolbar, {restorefocus:true});
            Common.component.Analytics.trackEvent('ToolBar', 'Underline');
        },

        onStrikeout: function(btn, e) {
            this._state.strikeout = undefined;
            if (this.api)
                this.api.asc_setCellStrikeout(btn.pressed);

            Common.NotificationCenter.trigger('edit:complete', this.toolbar, {restorefocus:true});
            Common.component.Analytics.trackEvent('ToolBar', 'Strikeout');
        },

        onSubscriptMenu: function(menu, item) {
            var btnSubscript = this.toolbar.btnSubscript;

            if (item.value == 'sub') {
                this._state.subscript = undefined;
                this.api.asc_setCellSubscript(item.checked);
            } else {
                this._state.superscript = undefined;
                this.api.asc_setCellSuperscript(item.checked);
            }
            if (item.checked) {
                btnSubscript.$icon.removeClass(btnSubscript.options.icls).addClass(item.options.icls);
                btnSubscript.options.icls = item.options.icls;
            }

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', (item.value == 'sub') ? 'Subscript' : 'Superscript');
        },

        onSubscript: function(btn, e) {
            var subscript = (btn.options.icls == 'btn-subscript');

            if (subscript) {
                this._state.subscript = undefined;
                this.api.asc_setCellSubscript(btn.pressed);
            } else {
                this._state.superscript = undefined;
                this.api.asc_setCellSuperscript(btn.pressed);
            }

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', (subscript) ? 'Subscript' : 'Superscript');
        },

        onTextColor: function() {
            this.toolbar.mnuTextColorPicker.trigger('select', this.toolbar.mnuTextColorPicker, this.toolbar.mnuTextColorPicker.currentColor, true);
        },

        onBackColor: function() {
            this.toolbar.mnuBackColorPicker.trigger('select', this.toolbar.mnuBackColorPicker, this.toolbar.mnuBackColorPicker.currentColor, true);
        },

        onTextColorSelect: function(picker, color, fromBtn) {
            this._state.clrtext_asccolor = this._state.clrtext = undefined;

            var clr = (typeof(color) == 'object') ? color.color : color;

            this.toolbar.btnTextColor.currentColor = color;
            $('.btn-color-value-line', this.toolbar.btnTextColor.cmpEl).css('background-color', '#' + clr);

            this.toolbar.mnuTextColorPicker.currentColor = color;
            if (this.api) {
                this.toolbar.btnTextColor.ischanged = (fromBtn!==true);
                this.api.asc_setCellTextColor(Common.Utils.ThemeColor.getRgbColor(color));
                this.toolbar.btnTextColor.ischanged = false;
            }

            Common.NotificationCenter.trigger('edit:complete', this.toolbar, {restorefocus:true});
            Common.component.Analytics.trackEvent('ToolBar', 'Text Color');
        },

        onBackColorSelect: function(picker, color, fromBtn) {
            this._state.clrshd_asccolor = this._state.clrback = undefined;

            var clr = (typeof(color) == 'object') ? color.color : color;

            this.toolbar.btnBackColor.currentColor = color;
            $('.btn-color-value-line', this.toolbar.btnBackColor.cmpEl).css('background-color', clr == 'transparent' ? 'transparent' : '#' + clr);

            this.toolbar.mnuBackColorPicker.currentColor = color;
            if (this.api) {
                this.toolbar.btnBackColor.ischanged = (fromBtn!==true);
                this.api.asc_setCellBackgroundColor(color == 'transparent' ? null : Common.Utils.ThemeColor.getRgbColor(color));
                this.toolbar.btnBackColor.ischanged = false;
            }

            Common.component.Analytics.trackEvent('ToolBar', 'Background Color');
        },

        onNewTextColor: function(picker, color) {
            this.toolbar.mnuTextColorPicker.addNewColor();
        },

        onNewBackColor: function(picker, color) {
            this.toolbar.mnuBackColorPicker.addNewColor();
        },

        onNewBorderColor: function(picker, color) {
            this.toolbar.btnBorders.menu.hide();
            this.toolbar.btnBorders.toggle(false, true);
            this.toolbar.mnuBorderColorPicker.addNewColor();
        },

        onBorders: function(btn) {
            var menuItem;

            _.each(btn.menu.items, function(item) {
                if (btn.options.borderId == item.options.borderId) {
                    menuItem = item;
                    return false;
                }
            });

            if (menuItem) {
                this.onBordersMenu(btn.menu, menuItem);
            }
        },

        onBordersMenu: function(menu, item) {
            var me = this;
            if (me.api && !_.isUndefined(item.options.borderId)) {
                var btnBorders = me.toolbar.btnBorders,
                    new_borders = [],
                    bordersWidth = btnBorders.options.borderswidth,
                    bordersColor = btnBorders.options.borderscolor;

                if ( btnBorders.rendered ) {
                    btnBorders.$icon.removeClass(btnBorders.options.icls).addClass(item.options.icls);
                    btnBorders.options.icls = item.options.icls;
                }

                btnBorders.options.borderId = item.options.borderId;

                if (item.options.borderId == 'inner') {
                    new_borders[Asc.c_oAscBorderOptions.InnerV] = new Asc.asc_CBorder(bordersWidth, bordersColor);
                    new_borders[Asc.c_oAscBorderOptions.InnerH] = new Asc.asc_CBorder(bordersWidth, bordersColor);
                } else if (item.options.borderId == 'all') {
                    new_borders[Asc.c_oAscBorderOptions.InnerV] = new Asc.asc_CBorder(bordersWidth, bordersColor);
                    new_borders[Asc.c_oAscBorderOptions.InnerH] = new Asc.asc_CBorder(bordersWidth, bordersColor);
                    new_borders[Asc.c_oAscBorderOptions.Left]   = new Asc.asc_CBorder(bordersWidth, bordersColor);
                    new_borders[Asc.c_oAscBorderOptions.Top]    = new Asc.asc_CBorder(bordersWidth, bordersColor);
                    new_borders[Asc.c_oAscBorderOptions.Right]  = new Asc.asc_CBorder(bordersWidth, bordersColor);
                    new_borders[Asc.c_oAscBorderOptions.Bottom] = new Asc.asc_CBorder(bordersWidth, bordersColor);
                } else if (item.options.borderId == 'outer') {
                    new_borders[Asc.c_oAscBorderOptions.Left]   = new Asc.asc_CBorder(bordersWidth, bordersColor);
                    new_borders[Asc.c_oAscBorderOptions.Top]    = new Asc.asc_CBorder(bordersWidth, bordersColor);
                    new_borders[Asc.c_oAscBorderOptions.Right]  = new Asc.asc_CBorder(bordersWidth, bordersColor);
                    new_borders[Asc.c_oAscBorderOptions.Bottom] = new Asc.asc_CBorder(bordersWidth, bordersColor);
                } else if (item.options.borderId != 'none') {
                    new_borders[item.options.borderId]   = new Asc.asc_CBorder(bordersWidth, bordersColor);
                }

                me.api.asc_setCellBorders(new_borders);

                Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                Common.component.Analytics.trackEvent('ToolBar', 'Borders');
            }
        },

        onBordersWidth: function(menu, item, state) {
            if (state) {
                this.toolbar.btnBorders.options.borderswidth = item.value;

                Common.NotificationCenter.trigger('edit:complete', this.toolbar);
                Common.component.Analytics.trackEvent('ToolBar', 'Border Width');
            }
        },

        onBordersColor: function(picker, color) {
            $('#id-toolbar-mnu-item-border-color .menu-item-icon').css('border-color', '#' + ((typeof(color) == 'object') ? color.color : color));
            this.toolbar.mnuBorderColor.onUnHoverItem();
            this.toolbar.btnBorders.options.borderscolor = Common.Utils.ThemeColor.getRgbColor(color);
            this.toolbar.mnuBorderColorPicker.currentColor = color;

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Border Color');
        },

        onHorizontalAlign: function(type, btn, e) {
            this._state.pralign = undefined;
            if (this.api) {
                this.api.asc_setCellAlign(!btn.pressed ? null : type);
                this.toolbar.btnWrap.allowDepress = !(type == AscCommon.align_Justify);
            }

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Horizontal align');
        },

        onHorizontalAlignMenu: function(menu, item) {
            var btnHorizontalAlign = this.toolbar.btnHorizontalAlign;

            btnHorizontalAlign.$icon.removeClass(btnHorizontalAlign.options.icls);
            btnHorizontalAlign.options.icls = !item.checked ? 'btn-align-left' : item.options.icls;
            btnHorizontalAlign.$icon.addClass(btnHorizontalAlign.options.icls);

            this._state.pralign = undefined;
            if (this.api)
                this.api.asc_setCellAlign(!item.checked ? null : item.value);

            this.toolbar.btnWrap.allowDepress = !(item.value == AscCommon.align_Justify);

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Horizontal Align');
        },

        onVerticalAlignMenu: function(menu, item) {
            var btnVerticalAlign = this.toolbar.btnVerticalAlign;

            btnVerticalAlign.$icon.removeClass(btnVerticalAlign.options.icls);
            btnVerticalAlign.options.icls = !item.checked ? 'btn-valign-bottom' : item.options.icls;
            btnVerticalAlign.$icon.addClass(btnVerticalAlign.options.icls);

            this._state.valign = undefined;
            if (this.api)
                this.api.asc_setCellVertAlign(!item.checked ? Asc.c_oAscVAlign.Bottom : item.value);

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Vertical Align');
        },

        onVerticalAlign: function(type, btn, e) {
            this._state.valign = undefined;
            if (this.api) {
                this.api.asc_setCellVertAlign(!btn.pressed ? Asc.c_oAscVAlign.Bottom : type);
            }

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Vertical align');
        },

        onMergeCellsMenu: function(menu, item) {
            var me = this;

            function doMergeCells(how) {
                me._state.merge = undefined;
                me.api.asc_mergeCells(how);
                Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                Common.component.Analytics.trackEvent('ToolBar', 'Merge');
            }

            if (me.api) {
                var merged = me.api.asc_getCellInfo().asc_getFlags().asc_getMerge();
                if ((merged !== Asc.c_oAscMergeOptions.Merge) && me.api.asc_mergeCellsDataLost(item.value)) {
                    Common.UI.warning({
                        msg: me.warnMergeLostData,
                        buttons: ['yes', 'no'],
                        primary: 'yes',
                        callback: function(btn) {
                            if (btn == 'yes') {
                                doMergeCells(item.value);
                            } else {
                                me.toolbar.btnMerge.toggle(false, true);
                                Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                                Common.component.Analytics.trackEvent('ToolBar', 'Merge');
                            }
                        }
                    });
                } else {
                    doMergeCells(item.value);
                }
            }

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Merge cells');
        },

        onWrap: function(btn, e) {
            this._state.wrap = undefined;
            if (this.api)
                this.api.asc_setCellTextWrap(btn.pressed);

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Wrap');
        },

        onTextOrientationMenu: function(menu, item) {
            if (this.api.asc_getCellInfo().asc_getFlags().asc_getSelectionType() == Asc.c_oAscSelectionType.RangeShapeText) {
                var angle = Asc.c_oAscVertDrawingText.normal;
                switch (item.value) {
                    case 'rotateup':    angle =  Asc.c_oAscVertDrawingText.vert270;    break;
                    case 'rotatedown':  angle = Asc.c_oAscVertDrawingText.vert;    break;
                }

                var properties = new Asc.asc_CImgProperty();
                properties.asc_putVert(angle);
                this.api.asc_setGraphicObjectProps(properties);
            } else {
                var angle = 0;

                switch (item.value) {
                    case 'countcw':     angle =  45;    break;
                    case 'clockwise':   angle = -45;    break;
                    case 'rotateup':    angle =  90;    break;
                    case 'rotatedown':  angle = -90;    break;
                }

                this._state.angle = undefined;
                if (this.api)
                    this.api.asc_setCellAngle(angle);
            }

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Text orientation');
        },

        onInsertImageMenu: function(menu, item, e) {
            if (item.value === 'file') {
                this.toolbar.fireEvent('insertimage', this.toolbar);

                if (this.api)
                    this.api.asc_addImage();

                Common.NotificationCenter.trigger('edit:complete', this.toolbar);
                Common.component.Analytics.trackEvent('ToolBar', 'Image');
            } else if (item.value === 'url') {
                var me = this;

                (new Common.Views.ImageFromUrlDialog({
                    handler: function(result, value) {
                        if (result == 'ok') {
                            if (me.api) {
                                var checkUrl = value.replace(/\s/g, '');
                                if (!_.isEmpty(checkUrl)) {
                                    me.toolbar.fireEvent('insertimage', me.toolbar);
                                    me.api.asc_addImageDrawingObject(checkUrl);

                                    Common.component.Analytics.trackEvent('ToolBar', 'Image');
                                } else {
                                    Common.UI.warning({
                                        msg: this.textEmptyImgUrl
                                    });
                                }
                            }

                            Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                        }
                    }
                })).show();
            } else if (item.value === 'storage') {
                var me = this;
                (new Common.Views.SelectFileDlg({
                    fileChoiceUrl: me.toolbar.mode.fileChoiceUrl.replace("{fileExt}", "").replace("{documentType}", "ImagesOnly")
                })).on('selectfile', function(obj, file){
                    me.toolbar.fireEvent('insertimage', me.toolbar);
                    me.api.asc_addImageDrawingObject(file.url, undefined, true);// for loading from storage;
                    Common.component.Analytics.trackEvent('ToolBar', 'Image');
                }).show();
            }
        },

        onHyperlink: function(btn) {
            var me = this;
            var win,
                props;

            if (me.api) {
                var wc = me.api.asc_getWorksheetsCount(),
                    i = -1,
                    items = [];

                while (++i < wc) {
                    if (!this.api.asc_isWorksheetHidden(i)) {
                        items.push({displayValue: me.api.asc_getWorksheetName(i), value: me.api.asc_getWorksheetName(i)});
                    }
                }

                var handlerDlg = function(dlg, result) {
                    if (result == 'ok') {
                        props = dlg.getSettings();
                        me.api.asc_insertHyperlink(props);
                    }

                    Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                };

                var cell = me.api.asc_getCellInfo(),
                    seltype = cell.asc_getFlags().asc_getSelectionType();
                props = cell.asc_getHyperlink();
                win = new SSE.Views.HyperlinkSettingsDialog({
                    api: me.api,
                    handler: handlerDlg
                });

                win.show();
                win.setSettings({
                    sheets  : items,
                    currentSheet: me.api.asc_getWorksheetName(me.api.asc_getActiveWorksheetIndex()),
                    props   : props,
                    text    : cell.asc_getText(),
                    isLock  : cell.asc_getFlags().asc_getLockText(),
                    allowInternal: (seltype!==Asc.c_oAscSelectionType.RangeImage && seltype!==Asc.c_oAscSelectionType.RangeShape &&
                                    seltype!==Asc.c_oAscSelectionType.RangeShapeText && seltype!==Asc.c_oAscSelectionType.RangeChart &&
                                    seltype!==Asc.c_oAscSelectionType.RangeChartText)
                });
            }

            Common.component.Analytics.trackEvent('ToolBar', 'Add Hyperlink');
        },

        onEditChart: function(btn) {
            if (!this.editMode) return;
            var me = this, info = me.api.asc_getCellInfo();
            if (info.asc_getFlags().asc_getSelectionType()!=Asc.c_oAscSelectionType.RangeImage) {
                var win, props;
                if (me.api){
                    props = me.api.asc_getChartObject();
                    var selectedObjects = me.api.asc_getGraphicObjectProps(),
                        imageSettings = null;
                    for (var i = 0; i < selectedObjects.length; i++) {
                        if (selectedObjects[i].asc_getObjectType() == Asc.c_oAscTypeSelectElement.Image) {
                            var elValue = selectedObjects[i].asc_getObjectValue();
                            if ( elValue.asc_getChartProperties() )
                                imageSettings = elValue;
                        }
                    }
                    if (props) {
                        var ischartedit = ( me.toolbar.mode.isEditDiagram || info.asc_getFlags().asc_getSelectionType() == Asc.c_oAscSelectionType.RangeChart || info.asc_getFlags().asc_getSelectionType() == Asc.c_oAscSelectionType.RangeChartText);

                        (new SSE.Views.ChartSettingsDlg(
                            {
                                chartSettings: props,
                                imageSettings: imageSettings,
                                isChart: true,
                                api: me.api,
                                handler: function(result, value) {
                                    if (result == 'ok') {
                                        if (me.api) {
                                            (ischartedit) ? me.api.asc_editChartDrawingObject(value.chartSettings) : me.api.asc_addChartDrawingObject(value.chartSettings);
                                            if (value.imageSettings)
                                                me.api.asc_setGraphicObjectProps(value.imageSettings);
                                        }
                                    }
                                    Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                                }
                            })).show();
                    }
                }
            }
        },

        onSelectChart: function(picker, item, record, e) {
            if (!this.editMode || !record) return;
            var me = this,
                info = me.api.asc_getCellInfo(),
                type = info.asc_getFlags().asc_getSelectionType(),
                group = record.get('group'),
                isSpark = (group == 'menu-chart-group-sparkcolumn' || group == 'menu-chart-group-sparkline' || group == 'menu-chart-group-sparkwin');

            if (type!=Asc.c_oAscSelectionType.RangeImage && me.api) {
                var win, props;
                if (isSpark && (type==Asc.c_oAscSelectionType.RangeCells || type==Asc.c_oAscSelectionType.RangeCol ||
                                type==Asc.c_oAscSelectionType.RangeRow || type==Asc.c_oAscSelectionType.RangeMax)) {
                    var sparkLineInfo = info.asc_getSparklineInfo();
                    if (!!sparkLineInfo) {
                        var props = new Asc.sparklineGroup();
                        props.asc_setType(record.get('type'));
                        this.api.asc_setSparklineGroup(sparkLineInfo.asc_getId(), props);
                    } else {
                        // add sparkline
                    }
                } else if (!isSpark) {
                    var ischartedit = ( type == Asc.c_oAscSelectionType.RangeChart || type == Asc.c_oAscSelectionType.RangeChartText);
                    props = me.api.asc_getChartObject(true); // don't lock chart object
                    if (props) {
                        (ischartedit) ? props.changeType(record.get('type')) : props.putType(record.get('type'));
                        var range = props.getRange(),
                            isvalid = me.api.asc_checkDataRange(Asc.c_oAscSelectionDialogType.Chart, range, true, !props.getInColumns(), props.getType());
                        if (isvalid == Asc.c_oAscError.ID.No) {
                            (ischartedit) ? me.api.asc_editChartDrawingObject(props) : me.api.asc_addChartDrawingObject(props);
                        } else {
                            Common.UI.warning({
                                msg: (isvalid == Asc.c_oAscError.ID.StockChartError) ? me.errorStockChart : ((isvalid == Asc.c_oAscError.ID.MaxDataSeriesError) ? me.errorMaxRows : me.txtInvalidRange),
                                callback: function() {
                                    _.defer(function(btn) {
                                        Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                                    })
                                }
                            });
                        }
                    }
                }
            }
            if (e.type !== 'click')
                me.toolbar.btnInsertChart.menu.hide();
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onBtnInsertTextClick: function(btn, e) {
            if (this.api)
                this._addAutoshape(btn.pressed, 'textRect');

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
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onSortType: function(type, btn) {
            if (this.api) {
                var res = this.api.asc_sortCellsRangeExpand();
                if (res) {
                    var config = {
                        width: 500,
                        title: this.txtSorting,
                        msg: this.txtExpandSort,

                        buttons: [  {caption: this.txtExpand, primary: true, value: 'expand'},
                                    {caption: this.txtSortSelected, primary: true, value: 'sort'},
                                    'cancel'],
                        callback: _.bind(function(btn){
                            if (btn == 'expand' || btn == 'sort') {
                                this.api.asc_sortColFilter(type, '', undefined, undefined, btn == 'expand');
                            }
                        }, this)
                    };
                    Common.UI.alert(config);
                } else
                    this.api.asc_sortColFilter(type, '', undefined, undefined, res !== null);
            }
        },

        onSearch: function(type, btn) {
            this.getApplication().getController('LeftMenu').showSearchDlg(true);
        },

        onAutoFilter: function(btn) {
            var state = this._state.filter;
            this._state.filter = undefined;
            if (this.api){
                if (this._state.tablename || state)
                    this.api.asc_changeAutoFilter(this._state.tablename, Asc.c_oAscChangeFilterOptions.filter, !state);
                else
                    this.api.asc_addAutoFilter();
            }

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Auto filter');
        },

        onClearFilter: function(btn) {
            if (this.api)
                this.api.asc_clearFilter();

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Clear filter');
        },

        onNumberFormat: function(btn) {
            if (this.api) 
                this.api.asc_setCellStyle(btn.options.styleName);

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Number Format');
        },

        onNumberFormatMenu: function(menu, item) {
            if (this.api) {
                var info = new Asc.asc_CFormatCellsInfo();
                info.asc_setType(Asc.c_oAscNumFormatType.Accounting);
                info.asc_setSeparator(false);
                info.asc_setSymbol(item.value);
                var format = this.api.asc_getFormatCells(info);
                if (format && format.length>0)
                    this.api.asc_setCellFormat(format[0]);
            }

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Number Format');
        },

        onNumberFormatSelect: function(combo, record) {
            if (record) {
                if (this.api)
                    this.api.asc_setCellFormat(record.format);
            } else {
                this.onCustomNumberFormat();
            }
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Number Format');
        },

        onCustomNumberFormat: function() {
            var me = this,
                value = me.api.asc_getLocale();
            (!value) && (value = ((me.toolbar.mode.lang) ? parseInt(Common.util.LanguageInfo.getLocalLanguageCode(me.toolbar.mode.lang)) : 0x0409));

            (new SSE.Views.FormatSettingsDialog({
                api: me.api,
                handler: function(result, settings) {
                    if (settings) {
                        me.api.asc_setCellFormat(settings.format);
                    }
                    Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                },
                props   : {format: me._state.numformat, formatInfo: me._state.numformatinfo, langId: value}
            })).show();
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Number Format');
        },

        onNumberFormatOpenBefore: function(combo) {
            if (this.api) {
                var me = this,
                    value = me.api.asc_getLocale();
                (!value) && (value = ((me.toolbar.mode.lang) ? parseInt(Common.util.LanguageInfo.getLocalLanguageCode(me.toolbar.mode.lang)) : 0x0409));

                if (this._state.langId !== value) {
                    this._state.langId = value;

                    var info = new Asc.asc_CFormatCellsInfo();
                    info.asc_setType(Asc.c_oAscNumFormatType.None);
                    info.asc_setSymbol(this._state.langId);
                    var arr = this.api.asc_getFormatCells(info); // all formats
                    me.toolbar.numFormatData.forEach( function(item, index) {
                        me.toolbar.numFormatData[index].format = arr[index];
                    });
                }

                me.toolbar.numFormatData.forEach( function(item, index) {
                    item.exampleval = me.api.asc_getLocaleExample(item.format);
                });
                me.toolbar.cmbNumberFormat.setData(me.toolbar.numFormatData);
                me.toolbar.cmbNumberFormat.setValue(me._state.numformattype, me.toolbar.txtCustom);
            }
        },

        onDecrement: function(btn) {
            if (this.api)
                this.api.asc_decreaseCellDigitNumbers();

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Decrement');
        },

        onIncrement: function(btn) {
            if (this.api)
                this.api.asc_increaseCellDigitNumbers();

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Increment');
        },

        onInsertFormulaMenu: function(menu, item, e) {
            if (this.api) {
                if (item.value === 'more') {
                    var controller = this.getApplication().getController('FormulaDialog');
                    if (controller) {
                        controller.showDialog();
                    }
                } else {

                    item.value = item.value || 'SUM';

                    this.api.asc_insertFormula(this.api.asc_getFormulaLocaleName(item.value), Asc.c_oAscPopUpSelectorType.Func, true);

                    Common.NotificationCenter.trigger('edit:complete', this.toolbar);
                    Common.component.Analytics.trackEvent('ToolBar', 'Insert formula');
                }
            }
        },

        onNamedRangeMenu: function(menu, item, e) {
            if (this.api) {
                var me = this;
                if (item.value === 'paste') {
                    (new SSE.Views.NamedRangePasteDlg({
                        handler: function(result, settings) {
                            if (result == 'ok' && settings) {
                                me.api.asc_insertFormula(settings.asc_getName(true), settings.asc_getIsTable() ? Asc.c_oAscPopUpSelectorType.Table : Asc.c_oAscPopUpSelectorType.Range, false);
                                Common.component.Analytics.trackEvent('ToolBar', 'Paste Named Range');
                            }
                            Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                        },
                        ranges: me.api.asc_getDefinedNames(Asc.c_oAscGetDefinedNamesList.WorksheetWorkbook) // names only for current sheet and workbook
                    })).show();
                    Common.component.Analytics.trackEvent('ToolBar', 'Paste Named Range');
                } else {
                    var wc = me.api.asc_getWorksheetsCount(),
                        i = -1,
                        items = [], sheetNames = [];

                    if (item.value === 'new') {
                        if (this._state.namedrange_locked) {
                            Common.NotificationCenter.trigger('namedrange:locked');
                            return;
                        }
                        while (++i < wc) {
                            if (!this.api.asc_isWorksheetHidden(i)) {
                                items.push({displayValue: me.api.asc_getWorksheetName(i), value: i});
                            }
                        }

                        (new SSE.Views.NamedRangeEditDlg({
                            api: me.api,
                            handler: function(result, settings) {
                                if (result == 'ok' && settings) {
                                    me.api.asc_setDefinedNames(settings);
                                    Common.component.Analytics.trackEvent('ToolBar', 'New Named Range');
                                }
                                Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                            },
                            sheets  : items,
                            props   : me.api.asc_getDefaultDefinedName(),
                            isEdit  : false
                        })).show();
                    } else {
                        var cellEditor  = this.getApplication().getController('CellEditor');

                        while (++i < wc) {
                            if (!this.api.asc_isWorksheetHidden(i)) {
                                sheetNames[i] = me.api.asc_getWorksheetName(i);
                                items.push({displayValue: sheetNames[i], value: i});
                            }
                        }

                        (new SSE.Views.NameManagerDlg({
                            api: me.api,
                            handler: function(result) {
                                Common.component.Analytics.trackEvent('ToolBar', 'Name Manager');
                                Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                            },
                            locked: me._state.namedrange_locked,
                            sheets: items,
                            sheetNames: sheetNames,
                            ranges: me.api.asc_getDefinedNames(Asc.c_oAscGetDefinedNamesList.All),
                            props : me.api.asc_getDefaultDefinedName(),
                            sort  : cellEditor.rangeListSort
                        })).on('close', function(win){
                            cellEditor.rangeListSort = win.getSettings();
                        }).show();
                    }
                }
            }
        },

        onNamedRangeMenuOpen: function() {
            if (this.api) {
                var names = this.api.asc_getDefinedNames(Asc.c_oAscGetDefinedNamesList.WorksheetWorkbook);
                this.toolbar.btnNamedRange.menu.items[2].setDisabled(names.length<1);
            }
        },

        onClearStyleMenu: function(menu, item, e) {
            if (this.api)
                this.api.asc_emptyCells(item.value);

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Clear');
        },

        onCopyStyleToggle: function(btn, state, e) {
            if (this.api)
                this.api.asc_formatPainter(state ? 1 : 0);
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            this.modeAlwaysSetStyle = state;
        },

        onCellInsertMenu: function(menu, item, e) {
            if (this.api)
                this.api.asc_insertCells(item.value);

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Cell insert');
        },

        onCellDeleteMenu: function(menu, item, e) {
            if (this.api)
                this.api.asc_deleteCells(item.value);

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Cell delete');
        },

        onColorSchemaClick: function(menu, item) {
            if (this.api) {
                this.api.asc_ChangeColorScheme(item.value);

                Common.component.Analytics.trackEvent('ToolBar', 'Color Scheme');
            }

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onComboBlur: function() {
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onFontNameSelect: function(combo, record) {
            if (this.api) {
                if (record.isNewFont) {
                    !this.getApplication().getController('Main').isModalShowed &&
                    Common.UI.warning({
                        width: 500,
                        closable: false,
                        msg: this.confirmAddFontName,
                        buttons: ['yes', 'no'],
                        primary: 'yes',
                        callback: _.bind(function(btn) {
                            if (btn == 'yes') {
                                this.api.asc_setCellFontName(record.name);
                                Common.component.Analytics.trackEvent('ToolBar', 'Font Name');
                            } else {
                                this.toolbar.cmbFontName.setValue(this.api.asc_getCellInfo().asc_getFont().asc_getName());
                            }
                            Common.NotificationCenter.trigger('edit:complete', this.toolbar, {restorefocus:true});
                        }, this)
                    });
                } else {
                    this.api.asc_setCellFontName(record.name);
                    Common.component.Analytics.trackEvent('ToolBar', 'Font Name');
                }
            }
            Common.NotificationCenter.trigger('edit:complete', this.toolbar, {restorefocus:true});
        },

        onComboOpen: function(needfocus, combo) {
            _.delay(function() {
                var input = $('input', combo.cmpEl).select();
                if (needfocus) input.focus();
                else if (!combo.isMenuOpen()) input.one('mouseup', function (e) { e.preventDefault(); });
            }, 10);
        },

        onFontSizeSelect: function(combo, record) {
            this._state.fontsize = undefined;
            if (this.api)
                this.api.asc_setCellFontSize(record.value);

            Common.NotificationCenter.trigger('edit:complete', this.toolbar, {restorefocus:true});
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
                    value = /^\+?(\d*\.?\d+)$|^\+?(\d+\.?\d*)$/.exec(record.value);

                    if (!value) {
                        value = this._getApiTextSize();

                        Common.UI.warning({
                            msg: this.textFontSizeErr,
                            callback: function() {
                                _.defer(function(btn) {
                                    $('input', combo.cmpEl).focus();
                                })
                            }
                        });

                        combo.setRawValue(value);

                        e.preventDefault();
                        return false;
                    }
                }
            } else {
                value = parseFloat(record.value);
                value = value > 409 ? 409 :
                    value < 1 ? 1 : Math.floor((value+0.4)*2)/2;

                combo.setRawValue(value);

                this._state.fontsize = undefined;
                if (this.api)
                    this.api.asc_setCellFontSize(value);

                Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            }
        },

        onListStyleSelect: function(combo, record) {
            this._state.prstyle = undefined;
            if (this.api) {
                this.api.asc_setCellStyle(record.get('name'));

                Common.NotificationCenter.trigger('edit:complete', this.toolbar);
                Common.component.Analytics.trackEvent('ToolBar', 'Style');
            }
        },

        createDelayedElements: function() {
            var me = this;

            this.toolbar.createDelayedElements();
            this.attachUIEvents(this.toolbar);

            if ( !this.appConfig.isEditDiagram && !this.appConfig.isEditMailMerge ) {
                this.api.asc_registerCallback('asc_onSheetsChanged',            _.bind(this.onApiSheetChanged, this));
                this.api.asc_registerCallback('asc_onUpdateSheetViewSettings',  _.bind(this.onApiSheetChanged, this));
                this.api.asc_registerCallback('asc_onEndAddShape',              _.bind(this.onApiEndAddShape, this));
                this.api.asc_registerCallback('asc_onEditorSelectionChanged',   _.bind(this.onApiEditorSelectionChanged, this));
                this.api.asc_registerCallback('asc_onUpdateDocumentProps',      _.bind(this.onUpdateDocumentProps, this));
                this.api.asc_registerCallback('asc_onLockDocumentProps',        _.bind(this.onApiLockDocumentProps, this));
                this.api.asc_registerCallback('asc_onUnLockDocumentProps',      _.bind(this.onApiUnLockDocumentProps, this));
            }

            if ( !this.appConfig.isEditMailMerge ) {
                this.applyFormulaSettings();
            }

            this.api.asc_registerCallback('asc_onShowChartDialog',          _.bind(this.onApiChartDblClick, this));
            this.api.asc_registerCallback('asc_onCanUndoChanged',           _.bind(this.onApiCanRevert, this, 'undo'));
            this.api.asc_registerCallback('asc_onCanRedoChanged',           _.bind(this.onApiCanRevert, this, 'redo'));
            this.api.asc_registerCallback('asc_onEditCell',                 _.bind(this.onApiEditCell, this));
            this.api.asc_registerCallback('asc_onStopFormatPainter',        _.bind(this.onApiStyleChange, this));
            this.api.asc_registerCallback('asc_onSelectionChanged',         _.bind(this.onApiSelectionChanged, this));

            Common.util.Shortcuts.delegateShortcuts({
                shortcuts: {
                    'command+l,ctrl+l': function(e) {
                        if ( me.editMode && !me._state.multiselect && me.appConfig.canModifyFilter) {
                            var cellinfo = me.api.asc_getCellInfo(),
                                filterinfo = cellinfo.asc_getAutoFilterInfo(),
                                formattableinfo = cellinfo.asc_getFormatTableInfo();
                            filterinfo = (filterinfo) ? filterinfo.asc_getIsAutoFilter() : null;
                            if (filterinfo!==null && !formattableinfo) {
                                if (_.isUndefined(me.toolbar.mnuTableTemplatePicker))
                                    me.onApiInitTableTemplates(me.api.asc_getTablePictures(formattableinfo));
                                var store = me.getCollection('TableTemplates');
                                me._setTableFormat(store.at(23).get('name'));
                            }
                        }

                        return false;
                    },
                    'command+shift+l,ctrl+shift+l': function(e) {
                        if (me.editMode && me.api && !me._state.multiselect && me.appConfig.canModifyFilter) {
                            var state = me._state.filter;
                            me._state.filter = undefined;

                            if (me._state.tablename || state)
                                me.api.asc_changeAutoFilter(me._state.tablename, Asc.c_oAscChangeFilterOptions.filter, !state);
                            else
                                me.api.asc_addAutoFilter();
                        }

                        return false;
                    },
                    'command+s,ctrl+s': function (e) {
                        me.onSave();
                        e.preventDefault();
                        e.stopPropagation();
                    },
                    'command+k,ctrl+k': function (e) {
                        if (me.editMode && !me.toolbar.mode.isEditMailMerge && !me.toolbar.mode.isEditDiagram && !me.api.isCellEdited && !me._state.multiselect && !me._state.inpivot &&
                            !me.getApplication().getController('LeftMenu').leftMenu.menuFile.isVisible())
                            me.onHyperlink();
                        e.preventDefault();
                    },
                    'command+1,ctrl+1': function(e) {
                        if (me.editMode && !me.toolbar.mode.isEditMailMerge && !me.api.isCellEdited && !me.toolbar.cmbNumberFormat.isDisabled()) {
                            me.onCustomNumberFormat();
                        }

                        return false;
                    }
                }
            });

            this.onApiSelectionChanged(this.api.asc_getCellInfo());
            this.attachToControlEvents();
            this.onApiSheetChanged();

            Common.NotificationCenter.on('cells:range', _.bind(this.onCellsRange, this));
        },

        onChangeViewMode: function(item, compact) {
            this.toolbar.setFolded(compact);
            this.toolbar.fireEvent('view:compact', [this, compact]);

            Common.localStorage.setBool('sse-compact-toolbar', compact);
            Common.NotificationCenter.trigger('layout:changed', 'toolbar');
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onClickChangeCompact: function (from) {
            if ( from != 'file' ) {
                Common.Utils.asyncCall(function () {
                    this.onChangeViewMode(null, !this.toolbar.isCompact());
                }, this);
            }
        },

        fillTableTemplates: function() {
            if (!this.toolbar.btnTableTemplate.rendered) return;

            var me = this;
            function createPicker(element, menu) {
                var picker = new Common.UI.DataView({
                    el: element,
                    parentMenu  : menu,
                    restoreHeight: 300,
                    style: 'max-height: 300px;',
                    store: me.getCollection('TableTemplates'),
                    itemTemplate: _.template('<div class="item-template"><img src="<%= imageUrl %>" id="<%= id %>" style="width:61px;height:46px;"></div>')
                });

                picker.on('item:click', function(picker, item, record) {
                    if (me.api) {
                        me._state.tablestylename = null;
                        if (!record)
                            record = picker.store.at(23);
                        me._setTableFormat(record.get('name'));

                        Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                        Common.component.Analytics.trackEvent('ToolBar', 'Table Templates');
                    }
                });

                if (picker.scroller) {
                    picker.scroller.update({alwaysVisibleY: true});
                }

                return picker;
            }

            if (_.isUndefined(this.toolbar.mnuTableTemplatePicker)) {
                this.toolbar.mnuTableTemplatePicker = createPicker($('#id-toolbar-menu-table-templates'), this.toolbar.btnTableTemplate.menu);
            }
//            if (_.isUndefined(this.toolbar.mnuTableTemplatePickerShort)) {
//                this.toolbar.mnuTableTemplatePickerShort = createPicker($('#id-toolbar-short-menu-table-templates'));
//            }
        },

        onTableTplMenuOpen: function(cmp) {
            this.onApiInitTableTemplates(this.api.asc_getTablePictures(this.api.asc_getCellInfo().asc_getFormatTableInfo()));

            var scroller = this.toolbar.mnuTableTemplatePicker.scroller;
            if (scroller) {
                scroller.update({alwaysVisibleY: true});
                scroller.scrollTop(0);
            }

            var val = this.toolbar.mnuTableTemplatePicker.store.findWhere({name: this._state.tablestylename});
            if (val)
                this.toolbar.mnuTableTemplatePicker.selectRecord(val);
            else
                this.toolbar.mnuTableTemplatePicker.deselectAll();
        },

        onSendThemeColors: function() {
            // get new table templates
            if (this.toolbar.btnTableTemplate.rendered && this.toolbar.btnTableTemplate.cmpEl.hasClass('open'))
                this.onTableTplMenuOpen();
        },

        onApiInitTableTemplates: function(images) {
            var store = this.getCollection('TableTemplates');
            if (store) {
                var templates = [];
                _.each(images, function(item) {
                    templates.push({
                        name        : item.asc_getName(),
                        caption     : item.asc_getDisplayName(),
                        type        : item.asc_getType(),
                        imageUrl    : item.asc_getImage(),
                        allowSelected : true,
                        selected    : false,
                        tip         : item.asc_getDisplayName()
                    });
                });

                store.reset();
                store.add(templates);
            }

            this.fillTableTemplates();
        },

        onApiInitEditorStyles: function(styles){
            window.styles_loaded = false;

            var self = this,
                listStyles = self.toolbar.listStyles;

            if (!listStyles) {
                self.styles = styles;
                return;
            }

            listStyles.menuPicker.store.reset([]); // remove all

            var mainController = this.getApplication().getController('Main');
            var merged_array = styles.asc_getDocStyles().concat(styles.asc_getDefaultStyles());
            _.each(merged_array, function(style){
                listStyles.menuPicker.store.add({
                    imageUrl: style.asc_getImage(),
                    name    : style.asc_getName(),
                    tip     : mainController.translationTable[style.get_Name()] || style.get_Name(),
                    uid     : Common.UI.getId()
                });
            });

            if (listStyles.menuPicker.store.length > 0 && listStyles.rendered) {
                listStyles.fillComboView(listStyles.menuPicker.store.at(0), true);
                listStyles.selectByIndex(0);
            }

            window.styles_loaded = true;
        },

        onApiCoAuthoringDisconnect: function(enableDownload) {
            this.toolbar.setMode({isDisconnected:true, enableDownload: !!enableDownload});
            this.editMode = false;
        },

        onApiChartDblClick: function() {
            this.onEditChart(this.btnInsertChart);
        },

        onApiCanRevert: function(which, can) {
            if (which=='undo') {
                if (this._state.can_undo !== can) {
                    this.toolbar.btnUndo.setDisabled(!can);
                    this._state.can_undo = can;
                }
            } else {
                if (this._state.can_redo !== can) {
                    this.toolbar.btnRedo.setDisabled(!can);
                    this._state.can_redo = can;
                }
            }
        },

        setDisabledComponents: function(components, disable) {
            _.each([].concat(components), function(component){
                if (component.isDisabled()!==disable) component.setDisabled(disable)
            });
        },

        onApiEditCell: function(state) {
            var toolbar = this.toolbar;
            if (toolbar.mode.isEditDiagram || toolbar.mode.isEditMailMerge) {
                is_cell_edited = (state == Asc.c_oAscCellEditorState.editStart);
                toolbar.lockToolbar(SSE.enumLock.editCell, state == Asc.c_oAscCellEditorState.editStart, {array: [toolbar.btnDecDecimal,toolbar.btnIncDecimal,toolbar.cmbNumberFormat]});
            } else
            if (state == Asc.c_oAscCellEditorState.editStart || state == Asc.c_oAscCellEditorState.editEnd) {
                toolbar.lockToolbar(SSE.enumLock.editCell, state == Asc.c_oAscCellEditorState.editStart, {
                        array: [
                            toolbar.btnClearStyle.menu.items[1],
                            toolbar.btnClearStyle.menu.items[2],
                            toolbar.btnClearStyle.menu.items[3],
                            toolbar.btnClearStyle.menu.items[4],
                            toolbar.mnuitemClearFilter,
                            toolbar.btnNamedRange.menu.items[0],
                            toolbar.btnNamedRange.menu.items[1]
                        ],
                        merge: true,
                        clear: [SSE.enumLock.editFormula, SSE.enumLock.editText]
                });

                var is_cell_edited = (state == Asc.c_oAscCellEditorState.editStart);
                (is_cell_edited) ? Common.util.Shortcuts.suspendEvents('command+l, ctrl+l, command+shift+l, ctrl+shift+l, command+k, ctrl+k, alt+h, command+1, ctrl+1') :
                                   Common.util.Shortcuts.resumeEvents('command+l, ctrl+l, command+shift+l, ctrl+shift+l, command+k, ctrl+k, alt+h, command+1, ctrl+1');

                if (is_cell_edited) {
                    toolbar.listStyles.suspendEvents();
                    toolbar.listStyles.menuPicker.selectRecord(null);
                    toolbar.listStyles.resumeEvents();
                    this._state.prstyle = undefined;
                }
            } else {
                if (state == Asc.c_oAscCellEditorState.editText) var is_text = true, is_formula = false; else
                if (state == Asc.c_oAscCellEditorState.editFormula) is_text = !(is_formula = true); else
                if (state == Asc.c_oAscCellEditorState.editEmptyCell) is_text = is_formula = false;

                toolbar.lockToolbar(SSE.enumLock.editFormula, is_formula,
                        { array: [toolbar.cmbFontName, toolbar.cmbFontSize, toolbar.btnIncFontSize, toolbar.btnDecFontSize,
                            toolbar.btnBold, toolbar.btnItalic, toolbar.btnUnderline, toolbar.btnStrikeout, toolbar.btnSubscript, toolbar.btnTextColor]});
                toolbar.lockToolbar(SSE.enumLock.editText, is_text, {array:[toolbar.btnInsertFormula]});
            }
            this._state.coauthdisable = undefined;
            this._state.selection_type = undefined;
            this.checkInsertAutoshape({action:'cancel'});
        },

        onApiZoomChange: function(zf, type){},


        onApiSheetChanged: function() {
            if (!this.toolbar.mode || !this.toolbar.mode.isEdit || this.toolbar.mode.isEditDiagram || this.toolbar.mode.isEditMailMerge) return;

            var currentSheet = this.api.asc_getActiveWorksheetIndex(),
                props = this.api.asc_getPageOptions(currentSheet),
                opt = props.asc_getPageSetup();

            this.onApiPageOrient(opt.asc_getOrientation());
            this.onApiPageSize(opt.asc_getWidth(), opt.asc_getHeight());
            this.onApiPageMargins(props.asc_getPageMargins());

            this.api.asc_isLayoutLocked(currentSheet) ? this.onApiLockDocumentProps(currentSheet) : this.onApiUnLockDocumentProps(currentSheet);
            this.toolbar.lockToolbar(SSE.enumLock.printAreaLock, this.api.asc_isPrintAreaLocked(currentSheet), {array: [this.toolbar.btnPrintArea]});
        },

        onUpdateDocumentProps: function(nIndex) {
            if (nIndex == this.api.asc_getActiveWorksheetIndex())
                this.onApiSheetChanged();
        },

        onApiPageSize: function(w, h) {
            if (this._state.pgorient===undefined) return;

            if (Math.abs(this._state.pgsize[0] - w) > 0.1 ||
                Math.abs(this._state.pgsize[1] - h) > 0.1) {
                this._state.pgsize = [w, h];
                if (this.toolbar.mnuPageSize) {
                    this.toolbar.mnuPageSize.clearAll();
                    _.each(this.toolbar.mnuPageSize.items, function(item){
                        if (item.value && typeof(item.value) == 'object' &&
                            Math.abs(item.value[0] - w) < 0.1 && Math.abs(item.value[1] - h) < 0.1) {
                            item.setChecked(true);
                            return false;
                        }
                    }, this);
                }
            }
        },

        onApiPageMargins: function(props) {
            if (props) {
                var left = props.asc_getLeft(),
                    top = props.asc_getTop(),
                    right = props.asc_getRight(),
                    bottom = props.asc_getBottom();

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

        onApiPageOrient: function(orient) {
            if (this._state.pgorient !== orient) {
                this.toolbar.btnPageOrient.menu.items[orient == Asc.c_oAscPageOrientation.PagePortrait ? 0 : 1].setChecked(true);
                this._state.pgorient = orient;
            }
        },

        onApiLockDocumentProps: function(nIndex) {
            if (this._state.lock_doc!==true && nIndex == this.api.asc_getActiveWorksheetIndex()) {
                this.toolbar.lockToolbar(SSE.enumLock.docPropsLock, true, {array: [this.toolbar.btnPageSize, this.toolbar.btnPageMargins, this.toolbar.btnPageOrient]});
                this._state.lock_doc = true;
            }
        },

        onApiUnLockDocumentProps: function(nIndex) {
            if (this._state.lock_doc!==false && nIndex == this.api.asc_getActiveWorksheetIndex()) {
                this.toolbar.lockToolbar(SSE.enumLock.docPropsLock, false, {array: [this.toolbar.btnPageSize, this.toolbar.btnPageMargins, this.toolbar.btnPageOrient]});
                this._state.lock_doc = false;
            }
        },

        onApiEditorSelectionChanged: function(fontobj) {
            if (!this.editMode) return;

            var toolbar = this.toolbar,
                val;

            /* read font name */
            var fontparam = fontobj.asc_getName();
            if (fontparam != toolbar.cmbFontName.getValue()) {
                Common.NotificationCenter.trigger('fonts:change', fontobj);
            }

            /* read font params */
            if (!toolbar.mode.isEditMailMerge && !toolbar.mode.isEditDiagram) {
                val = fontobj.asc_getBold();
                if (this._state.bold !== val) {
                    toolbar.btnBold.toggle(val === true, true);
                    this._state.bold = val;
                }
                val = fontobj.asc_getItalic();
                if (this._state.italic !== val) {
                    toolbar.btnItalic.toggle(val === true, true);
                    this._state.italic = val;
                }
                val = fontobj.asc_getUnderline();
                if (this._state.underline !== val) {
                    toolbar.btnUnderline.toggle(val === true, true);
                    this._state.underline = val;
                }
                val = fontobj.asc_getStrikeout();
                if (this._state.strikeout !== val) {
                    toolbar.btnStrikeout.toggle(val === true, true);
                    this._state.strikeout = val;
                }

                var subsc = fontobj.asc_getSubscript(),
                    supersc = fontobj.asc_getSuperscript();

                if (this._state.subscript !== subsc || this._state.superscript !== supersc) {
                    var index = (supersc) ? 0 : (subsc ? 1 : -1),
                        btnSubscript = toolbar.btnSubscript;

                    btnSubscript.toggle(index>-1, true);
                    if (index < 0) {
                        btnSubscript.menu.clearAll();
                    } else {
                        btnSubscript.menu.items[index].setChecked(true);
                        if ( btnSubscript.rendered && btnSubscript.$icon ) {
                            btnSubscript.$icon.removeClass(btnSubscript.options.icls);
                            btnSubscript.options.icls = btnSubscript.menu.items[index].options.icls;
                            btnSubscript.$icon.addClass(btnSubscript.options.icls);
                        }
                    }

                    this._state.subscript = subsc;
                    this._state.superscript = supersc;
                }
            }

            /* read font size */
            var str_size = fontobj.asc_getSize();
            if (this._state.fontsize !== str_size) {
                toolbar.cmbFontSize.setValue((str_size!==undefined) ? str_size : '');
                this._state.fontsize = str_size;
            }

            /* read font color */
            var clr,
                color,
                fontColorPicker      = this.toolbar.mnuTextColorPicker;

            if (!toolbar.btnTextColor.ischanged && !fontColorPicker.isDummy) {
                color = fontobj.asc_getColor();
                if (color) {
                    if (color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                        clr = {color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()), effectValue: color.get_value() };
                    } else {
                        clr = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
                    }
                }
                var type1 = typeof(clr),
                    type2 = typeof(this._state.clrtext);
                if ( (type1 !== type2) || (type1=='object' &&
                    (clr.effectValue!==this._state.clrtext.effectValue || this._state.clrtext.color.indexOf(clr.color)<0)) ||
                    (type1!='object' && this._state.clrtext!==undefined && this._state.clrtext.indexOf(clr)<0 )) {

                    if (_.isObject(clr)) {
                        var isselected = false;
                        for (var i = 0; i < 10; i++) {
                            if (Common.Utils.ThemeColor.ThemeValues[i] == clr.effectValue) {
                                fontColorPicker.select(clr, true);
                                isselected = true;
                                break;
                            }
                        }
                        if (!isselected) fontColorPicker.clearSelection();
                    } else {
                        fontColorPicker.select(clr, true);
                    }
                    this._state.clrtext = clr;
                }
                this._state.clrtext_asccolor = color;
            }

        },

        onApiSelectionChanged: function(info) {
            if (!this.editMode) return;
            if ( this.toolbar.mode.isEditDiagram )
                return this.onApiSelectionChanged_DiagramEditor(info); else
            if ( this.toolbar.mode.isEditMailMerge )
                return this.onApiSelectionChanged_MailMergeEditor(info);

            var selectionType = info.asc_getFlags().asc_getSelectionType(),
                coauth_disable = (!this.toolbar.mode.isEditMailMerge && !this.toolbar.mode.isEditDiagram) ? (info.asc_getLocked()===true || info.asc_getLockedTable()===true) : false,
                editOptionsDisabled = this._disableEditOptions(selectionType, coauth_disable),
                me = this,
                toolbar = this.toolbar,
                fontobj = info.asc_getFont(),
                val, need_disable = false;

            /* read font name */
            var fontparam = fontobj.asc_getName();
            if (fontparam != toolbar.cmbFontName.getValue()) {
                Common.NotificationCenter.trigger('fonts:change', fontobj);
            }

            /* read font size */
            var str_size = fontobj.asc_getSize();
            if (this._state.fontsize !== str_size) {
                toolbar.cmbFontSize.setValue((str_size !== undefined) ? str_size : '');
                this._state.fontsize = str_size;
            }

            toolbar.lockToolbar(SSE.enumLock.cantHyperlink, (selectionType == Asc.c_oAscSelectionType.RangeShapeText) && (this.api.asc_canAddShapeHyperlink()===false), { array: [toolbar.btnInsertHyperlink]});

            /*
            need_disable = selectionType != Asc.c_oAscSelectionType.RangeCells && selectionType != Asc.c_oAscSelectionType.RangeCol &&
                                selectionType != Asc.c_oAscSelectionType.RangeRow && selectionType != Asc.c_oAscSelectionType.RangeMax;
            if (this._state.sparklines_disabled !== need_disable) {
                this._state.sparklines_disabled = need_disable;
                var len = toolbar.mnuInsertChartPicker.store.length;
                for (var i = 0; i < 3; i++) {
                    toolbar.mnuInsertChartPicker.store.at(len-i-1).set({disabled: need_disable});
                }
            }
            */

            need_disable = (selectionType == Asc.c_oAscSelectionType.RangeCells || selectionType == Asc.c_oAscSelectionType.RangeCol ||
                selectionType == Asc.c_oAscSelectionType.RangeRow || selectionType == Asc.c_oAscSelectionType.RangeMax);
            toolbar.lockToolbar(SSE.enumLock.selRange, need_disable, { array: [toolbar.btnImgAlign, toolbar.btnImgBackward, toolbar.btnImgForward, toolbar.btnImgGroup]});

            var cangroup = this.api.asc_canGroupGraphicsObjects(),
                canungroup = this.api.asc_canUnGroupGraphicsObjects();
            toolbar.lockToolbar(SSE.enumLock.cantGroupUngroup, !cangroup && !canungroup, { array: [toolbar.btnImgGroup]});
            toolbar.btnImgGroup.menu.items[0].setDisabled(!cangroup);
            toolbar.btnImgGroup.menu.items[1].setDisabled(!canungroup);
            toolbar.lockToolbar(SSE.enumLock.cantGroup, !cangroup, { array: [toolbar.btnImgAlign]});

            var objcount = this.api.asc_getSelectedDrawingObjectsCount();
            toolbar.btnImgAlign.menu.items[7].setDisabled(objcount<3);
            toolbar.btnImgAlign.menu.items[8].setDisabled(objcount<3);

            if (editOptionsDisabled) return;

            /* read font params */
            if (!toolbar.mode.isEditMailMerge && !toolbar.mode.isEditDiagram) {
                val = fontobj.asc_getBold();
                if (this._state.bold !== val) {
                    toolbar.btnBold.toggle(val === true, true);
                    this._state.bold = val;
                }
                val = fontobj.asc_getItalic();
                if (this._state.italic !== val) {
                    toolbar.btnItalic.toggle(val === true, true);
                    this._state.italic = val;
                }
                val = fontobj.asc_getUnderline();
                if (this._state.underline !== val) {
                    toolbar.btnUnderline.toggle(val === true, true);
                    this._state.underline = val;
                }
                val = fontobj.asc_getStrikeout();
                if (this._state.strikeout !== val) {
                    toolbar.btnStrikeout.toggle(val === true, true);
                    this._state.strikeout = val;
                }

                var subsc = fontobj.asc_getSubscript(),
                    supersc = fontobj.asc_getSuperscript();

                if (this._state.subscript !== subsc || this._state.superscript !== supersc) {
                    var index = (supersc) ? 0 : (subsc ? 1 : -1),
                        btnSubscript = toolbar.btnSubscript;

                    btnSubscript.toggle(index>-1, true);
                    if (index < 0) {
                        btnSubscript.menu.clearAll();
                    } else {
                        btnSubscript.menu.items[index].setChecked(true);
                        if ( btnSubscript.rendered ) {
                            btnSubscript.$icon.removeClass(btnSubscript.options.icls);
                            btnSubscript.options.icls = btnSubscript.menu.items[index].options.icls;
                            btnSubscript.$icon.addClass(btnSubscript.options.icls);
                        }
                    }

                    this._state.subscript = subsc;
                    this._state.superscript = supersc;
                }
            }

            /* read font color */
            var clr,
                color,
                fontColorPicker      = this.toolbar.mnuTextColorPicker,
                paragraphColorPicker = this.toolbar.mnuBackColorPicker;

            if (!toolbar.btnTextColor.ischanged && !fontColorPicker.isDummy) {
                color = fontobj.asc_getColor();
                if (color) {
                    if (color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                        clr = {color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()), effectValue: color.get_value() };
                    } else {
                        clr = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
                    }
                }
                var type1 = typeof(clr),
                    type2 = typeof(this._state.clrtext);
                if ( (type1 !== type2) || (type1=='object' &&
                    (clr.effectValue!==this._state.clrtext.effectValue || this._state.clrtext.color.indexOf(clr.color)<0)) ||
                    (type1!='object' && this._state.clrtext!==undefined && this._state.clrtext.indexOf(clr)<0 )) {

                    if (_.isObject(clr)) {
                        var isselected = false;
                        for (var i = 0; i < 10; i++) {
                            if (Common.Utils.ThemeColor.ThemeValues[i] == clr.effectValue) {
                                fontColorPicker.select(clr, true);
                                isselected = true;
                                break;
                            }
                        }
                        if (!isselected) fontColorPicker.clearSelection();
                    } else {
                        fontColorPicker.select(clr, true);
                    }
                    this._state.clrtext = clr;
                }
                this._state.clrtext_asccolor = color;
            }

            /* read cell background color */
            if (!toolbar.btnBackColor.ischanged && !paragraphColorPicker.isDummy) {
                color = info.asc_getFill().asc_getColor();
                if (color) {
                    if (color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                        clr = {color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()), effectValue: color.get_value() };
                    } else {
                        clr = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
                    }
                } else {
                    clr = 'transparent';
                }

                type1 = typeof(clr);
                type2 = typeof(this._state.clrback);
                if ( (type1 !== type2) || (type1=='object' &&
                    (clr.effectValue!==this._state.clrback.effectValue || this._state.clrback.color.indexOf(clr.color)<0)) ||
                    (type1!='object' && this._state.clrback!==undefined && this._state.clrback.indexOf(clr)<0 )) {

                    if (_.isObject(clr)) {
                        var isselected = false;
                        for (i = 0; i < 10; i++) {
                            if (Common.Utils.ThemeColor.ThemeValues[i] == clr.effectValue) {
                                paragraphColorPicker.select(clr, true);
                                isselected = true;
                                break;
                            }
                        }
                        if (!isselected) paragraphColorPicker.clearSelection();
                    } else {
                        paragraphColorPicker.select(clr, true);
                    }
                    this._state.clrback = clr;
                }
                this._state.clrshd_asccolor = color;
            }

            var in_chart = (selectionType == Asc.c_oAscSelectionType.RangeChart || selectionType == Asc.c_oAscSelectionType.RangeChartText);
            if (in_chart !== this._state.in_chart) {
                toolbar.btnInsertChart.updateHint(in_chart ? toolbar.tipChangeChart : toolbar.tipInsertChart);
                this._state.in_chart = in_chart;
            }
            if (in_chart) return;

            if (!toolbar.mode.isEditDiagram)
            {
//                (coauth_disable !== toolbar.btnClearStyle.isDisabled()) && toolbar.btnClearStyle.setDisabled(coauth_disable);
//                (coauth_disable !== toolbar.btnCopyStyle.isDisabled()) && toolbar.btnCopyStyle.setDisabled(coauth_disable);

                var filterInfo = info.asc_getAutoFilterInfo(),
                    formatTableInfo = info.asc_getFormatTableInfo();
                if (!toolbar.mode.isEditMailMerge) {
                    /* read cell horizontal align */
                    fontparam = info.asc_getHorAlign();
                    if (this._state.pralign !== fontparam) {
                        this._state.pralign = fontparam;

                        var index = -1, align;
                        switch (fontparam) {
                            case AscCommon.align_Left:    index = 0;      align = 'btn-align-left';      break;
                            case AscCommon.align_Center:  index = 1;      align = 'btn-align-center';    break;
                            case AscCommon.align_Right:   index = 2;      align = 'btn-align-right';     break;
                            case AscCommon.align_Justify: index = 3;      align = 'btn-align-just';      break;
                            default:        index = -255;   align = 'btn-align-left';      break;
                        }
                        if (!(index < 0)) {
                            toolbar.btnAlignRight.toggle(index===2, true);
                            toolbar.btnAlignLeft.toggle(index===0, true);
                            toolbar.btnAlignCenter.toggle(index===1, true);
                            toolbar.btnAlignJust.toggle(index===3, true);
                            toolbar.btnHorizontalAlign.menu.items[index].setChecked(true, false);
                        } else if (index == -255) {
                            toolbar.btnAlignRight.toggle(false, true);
                            toolbar.btnAlignLeft.toggle(false, true);
                            toolbar.btnAlignCenter.toggle(false, true);
                            toolbar.btnAlignJust.toggle(false, true);

                            toolbar.btnHorizontalAlign.menu.clearAll();
                        }

                        var btnHorizontalAlign = this.toolbar.btnHorizontalAlign;
                        if ( btnHorizontalAlign.rendered ) {
                            btnHorizontalAlign.$icon.removeClass(btnHorizontalAlign.options.icls).addClass(align);
                            btnHorizontalAlign.options.icls = align;
                        }
                    }

                    need_disable = (fontparam == AscCommon.align_Justify || selectionType == Asc.c_oAscSelectionType.RangeShapeText);
                    toolbar.btnTextOrient.menu.items[1].setDisabled(need_disable);
                    toolbar.btnTextOrient.menu.items[2].setDisabled(need_disable);

                    /* read cell vertical align */
                    fontparam = info.asc_getVertAlign();

                    if (this._state.valign !== fontparam) {
                        this._state.valign = fontparam;

                        index = -1;   align = '';
                        switch (fontparam) {
                            case Asc.c_oAscVAlign.Top:    index = 0; align = 'btn-valign-top';     break;
                            case Asc.c_oAscVAlign.Center: index = 1; align = 'btn-valign-middle';  break;
                            case Asc.c_oAscVAlign.Bottom: index = 2; align = 'btn-valign-bottom';  break;
                        }

                        if (index > -1) {
                            toolbar.btnAlignTop.toggle(index===0, true);
                            toolbar.btnAlignMiddle.toggle(index===1, true);
                            toolbar.btnAlignBottom.toggle(index===2, true);
                            toolbar.btnVerticalAlign.menu.items[index].setChecked(true, false);

                            var btnVerticalAlign = this.toolbar.btnVerticalAlign;
                            if ( btnVerticalAlign.rendered ) {
                                btnVerticalAlign.$icon.removeClass(btnVerticalAlign.options.icls).addClass(align);
                                btnVerticalAlign.options.icls = align;
                            }
                        }
                    }

                    need_disable =  this._state.controlsdisabled.filters || formatTableInfo!==null || filterInfo && filterInfo.asc_getIsAutoFilter()===null;
//                (need_disable !== toolbar.btnMerge.isDisabled()) && toolbar.btnMerge.setDisabled(need_disable);
                    toolbar.lockToolbar(SSE.enumLock.ruleMerge, need_disable, {array:[toolbar.btnMerge]});

                    val = info.asc_getFlags().asc_getMerge();
                    if (this._state.merge !== val) {
                        toolbar.btnMerge.toggle(val===Asc.c_oAscMergeOptions.Merge, true);
                        this._state.merge = val;
                    }

                    /* read cell text wrapping */
                    if (!toolbar.btnWrap.isDisabled()) {
                        val = info.asc_getFlags().asc_getWrapText();
                        if (this._state.wrap !== val) {
                            toolbar.btnWrap.toggle(val===true, true);
                            this._state.wrap = val;
                        }
                    }
                }

                val = (filterInfo) ? filterInfo.asc_getIsAutoFilter() : null;
                if (this._state.filter !== val) {
                    toolbar.btnSetAutofilter.toggle(val===true, true);
                    toolbar.mnuitemAutoFilter.setChecked(val===true, true);
                    this._state.filter = val;
                }
                need_disable =  this._state.controlsdisabled.filters || (val===null);
                toolbar.lockToolbar(SSE.enumLock.ruleFilter, need_disable,
                            { array: [toolbar.btnSortDown, toolbar.btnSortUp, toolbar.mnuitemSortAZ, toolbar.mnuitemSortZA,
                                toolbar.btnTableTemplate,toolbar.btnSetAutofilter,toolbar.mnuitemAutoFilter,toolbar.btnAutofilter] });

                val = (formatTableInfo) ? formatTableInfo.asc_getTableStyleName() : null;
                if (this._state.tablestylename !== val && this.toolbar.mnuTableTemplatePicker) {
                    val = this.toolbar.mnuTableTemplatePicker.store.findWhere({name: val});
                    if (val) {
                        this.toolbar.mnuTableTemplatePicker.selectRecord(val);
                        this._state.tablestylename = val.get('name');
                    } else {
                        toolbar.mnuTableTemplatePicker.deselectAll();
                        this._state.tablestylename = null;
                    }
                }

                need_disable =  this._state.controlsdisabled.filters || !filterInfo || (filterInfo.asc_getIsApplyAutoFilter()!==true);
                toolbar.lockToolbar(SSE.enumLock.ruleDelFilter, need_disable, {array:[toolbar.btnClearAutofilter,toolbar.mnuitemClearFilter]});

                var old_name = this._state.tablename;
                this._state.tablename = (formatTableInfo) ? formatTableInfo.asc_getTableName() : undefined;

                var old_applied = this._state.filterapplied;
                this._state.filterapplied = this._state.filter && filterInfo.asc_getIsApplyAutoFilter();

                if (this._state.tablename !== old_name || this._state.filterapplied !== old_applied)
                    this.getApplication().getController('Statusbar').onApiFilterInfo(!need_disable);

                this._state.multiselect = info.asc_getFlags().asc_getMultiselect();
                toolbar.lockToolbar(SSE.enumLock.multiselect, this._state.multiselect, { array: [toolbar.btnTableTemplate, toolbar.btnInsertHyperlink]});

                this._state.inpivot = !!info.asc_getPivotTableInfo();
                toolbar.lockToolbar(SSE.enumLock.editPivot, this._state.inpivot, { array: [toolbar.btnMerge, toolbar.btnInsertHyperlink, toolbar.btnSetAutofilter, toolbar.btnClearAutofilter, toolbar.btnSortDown, toolbar.btnSortUp, toolbar.btnAutofilter]});

                need_disable = !this.appConfig.canModifyFilter;
                toolbar.lockToolbar(SSE.enumLock.cantModifyFilter, need_disable, { array: [toolbar.btnSortDown, toolbar.btnSortUp, toolbar.mnuitemSortAZ, toolbar.mnuitemSortZA, toolbar.btnSetAutofilter,
                                                                                   toolbar.btnAutofilter, toolbar.btnTableTemplate, toolbar.btnClearStyle.menu.items[0], toolbar.btnClearStyle.menu.items[2] ]});

            }

            val = info.asc_getNumFormatInfo();
            if (val) {
				this._state.numformat = info.asc_getNumFormat();
				this._state.numformatinfo = val;
				val = val.asc_getType();
				if (this._state.numformattype !== val) {
					toolbar.cmbNumberFormat.setValue(val, toolbar.txtCustom);
					this._state.numformattype = val;
				}
            }

            if (selectionType == Asc.c_oAscSelectionType.RangeShapeText) {
                var SelectedObjects = this.api.asc_getGraphicObjectProps();
                for (var i=0; i<SelectedObjects.length; ++i)
                {
                    if (SelectedObjects[i].asc_getObjectType() == Asc.c_oAscTypeSelectElement.Image)
                        val = SelectedObjects[i].asc_getObjectValue().asc_getVert();
                }
            } else
                val = info.asc_getAngle();
            if (this._state.angle !== val) {
                toolbar.btnTextOrient.menu.clearAll();
                switch(val) {
                    case 45:    toolbar.btnTextOrient.menu.items[1].setChecked(true, true); break;
                    case -45:   toolbar.btnTextOrient.menu.items[2].setChecked(true, true); break;
                    case 90: case Asc.c_oAscVertDrawingText.vert270:    toolbar.btnTextOrient.menu.items[3].setChecked(true, true); break;
                    case -90: case Asc.c_oAscVertDrawingText.vert:   toolbar.btnTextOrient.menu.items[4].setChecked(true, true); break;
                    default:    toolbar.btnTextOrient.menu.items[0].setChecked(true, true); break;
                }
                this._state.angle = val;
            }

            val = info.asc_getStyleName();
            if (this._state.prstyle != val && !this.toolbar.listStyles.isDisabled()) {
                var listStyle = this.toolbar.listStyles,
                    listStylesVisible = (listStyle.rendered);

                if (listStylesVisible) {
                    listStyle.suspendEvents();
                    var styleRec = listStyle.menuPicker.store.findWhere({
                        name: val
                    });
                    this._state.prstyle = (listStyle.menuPicker.store.length>0) ? val : undefined;

                    listStyle.menuPicker.selectRecord(styleRec);
                    listStyle.resumeEvents();
                }
            }

            val = (selectionType==Asc.c_oAscSelectionType.RangeRow);
            if ( this._state.controlsdisabled.rows!==val ) {
                this._state.controlsdisabled.rows=val;
                toolbar.btnAddCell.menu.items[3].setDisabled(val);
                toolbar.btnDeleteCell.menu.items[3].setDisabled(val);
            }
            val = (selectionType==Asc.c_oAscSelectionType.RangeCol);
            if ( this._state.controlsdisabled.cols!==val ) {
                this._state.controlsdisabled.cols=val;
                toolbar.btnAddCell.menu.items[2].setDisabled(val);
                toolbar.btnDeleteCell.menu.items[2].setDisabled(val);
            }

            val = filterInfo && filterInfo.asc_getIsApplyAutoFilter();
            if ( this._state.controlsdisabled.cells_right!==(this._state.controlsdisabled.rows || val) ) {
                this._state.controlsdisabled.cells_right = (this._state.controlsdisabled.rows || val);
                toolbar.btnAddCell.menu.items[0].setDisabled(this._state.controlsdisabled.cells_right);
                toolbar.btnDeleteCell.menu.items[0].setDisabled(this._state.controlsdisabled.cells_right);
            }
            if ( this._state.controlsdisabled.cells_down!==(this._state.controlsdisabled.cols || val) ) {
                this._state.controlsdisabled.cells_down = (this._state.controlsdisabled.cols || val);
                toolbar.btnAddCell.menu.items[1].setDisabled(this._state.controlsdisabled.cells_down);
                toolbar.btnDeleteCell.menu.items[1].setDisabled(this._state.controlsdisabled.cells_down);
            }

            toolbar.lockToolbar(SSE.enumLock.commentLock, (selectionType == Asc.c_oAscSelectionType.RangeCells) && (info.asc_getComments().length>0 || info.asc_getLocked()),
                                { array: this.btnsComment });
        },

        onApiSelectionChanged_DiagramEditor: function(info) {
            if ( !this.editMode || this.api.isCellEdited || this.api.isRangeSelection) return;

            var me = this;
            var _disableEditOptions = function(seltype, coauth_disable) {
                var is_chart_text = seltype == Asc.c_oAscSelectionType.RangeChartText,
                    is_chart = seltype == Asc.c_oAscSelectionType.RangeChart,
                    is_shape_text = seltype == Asc.c_oAscSelectionType.RangeShapeText,
                    is_shape = seltype == Asc.c_oAscSelectionType.RangeShape,
                    is_image = seltype == Asc.c_oAscSelectionType.RangeImage,
                    is_mode_2 = is_shape_text || is_shape || is_chart_text || is_chart,
                    is_objLocked = false;

                if ( !(is_mode_2 || is_image) &&
                        me._state.selection_type === seltype &&
                            me._state.coauthdisable === coauth_disable )
                    return (seltype === Asc.c_oAscSelectionType.RangeImage);

                if ( is_mode_2 ) {
                    var selectedObjects = me.api.asc_getGraphicObjectProps();
                    is_objLocked = selectedObjects.some( function(object) {
                        return object.asc_getObjectType() == Asc.c_oAscTypeSelectElement.Image && object.asc_getObjectValue().asc_getLocked();
                    } );
                }

                var _set = SSE.enumLock;
                var type = seltype;
                switch ( seltype ) {
                case Asc.c_oAscSelectionType.RangeImage: type = _set.selImage; break;
                case Asc.c_oAscSelectionType.RangeShape: type = _set.selShape; break;
                case Asc.c_oAscSelectionType.RangeShapeText: type = _set.selShapeText; break;
                case Asc.c_oAscSelectionType.RangeChart: type = _set.selChart; break;
                case Asc.c_oAscSelectionType.RangeChartText: type = _set.selChartText; break;
                }

                me.toolbar.lockToolbar(type, type != seltype, {
                    clear: [_set.selImage, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.coAuth]
                });

                me.toolbar.lockToolbar(SSE.enumLock.coAuthText, is_objLocked);

                return is_image;
            };

            var selectionType = info.asc_getFlags().asc_getSelectionType(),
                coauth_disable = false;

            if ( _disableEditOptions(selectionType, coauth_disable) ) return;

            if (selectionType == Asc.c_oAscSelectionType.RangeChart || selectionType == Asc.c_oAscSelectionType.RangeChartText)
                return;

            var val = info.asc_getNumFormatInfo();
            if ( val ) {
                this._state.numformat = info.asc_getNumFormat();
                this._state.numformatinfo = val;
                val = val.asc_getType();
                if (this._state.numformattype !== val) {
                    me.toolbar.cmbNumberFormat.setValue(val, me.toolbar.txtCustom);
                    this._state.numformattype = val;
                }
            }
        },

        onApiSelectionChanged_MailMergeEditor: function(info) {
            if ( !this.editMode || this.api.isCellEdited || this.api.isRangeSelection) return;

            var me = this;
            var _disableEditOptions = function(seltype, coauth_disable) {
                var is_chart_text = seltype == Asc.c_oAscSelectionType.RangeChartText,
                    is_chart = seltype == Asc.c_oAscSelectionType.RangeChart,
                    is_shape_text = seltype == Asc.c_oAscSelectionType.RangeShapeText,
                    is_shape = seltype == Asc.c_oAscSelectionType.RangeShape,
                    is_image = seltype == Asc.c_oAscSelectionType.RangeImage,
                    is_mode_2 = is_shape_text || is_shape || is_chart_text || is_chart,
                    is_objLocked = false;

                if (!(is_mode_2 || is_image) &&
                        me._state.selection_type === seltype &&
                            me._state.coauthdisable === coauth_disable)
                    return seltype === Asc.c_oAscSelectionType.RangeImage;

                if ( is_mode_2 ) {
                    var selectedObjects = me.api.asc_getGraphicObjectProps();
                    is_objLocked = selectedObjects.some(function (object) {
                        return object.asc_getObjectType() == Asc.c_oAscTypeSelectElement.Image && object.asc_getObjectValue().asc_getLocked();
                    });
                }

                me.toolbar.lockToolbar(SSE.enumLock.coAuthText, is_objLocked);

                return is_image;
            };

            var selectionType = info.asc_getFlags().asc_getSelectionType(),
                coauth_disable = false,
                editOptionsDisabled = _disableEditOptions(selectionType, coauth_disable),
                val, need_disable = false;

            if (editOptionsDisabled) return;
            if (selectionType == Asc.c_oAscSelectionType.RangeChart || selectionType == Asc.c_oAscSelectionType.RangeChartText)
                return;

            if ( !me.toolbar.mode.isEditDiagram ) {
                var filterInfo = info.asc_getAutoFilterInfo();

                val = filterInfo ? filterInfo.asc_getIsAutoFilter() : null;
                if ( this._state.filter !== val ) {
                    me.toolbar.btnSetAutofilter.toggle(val===true, true);
                    // toolbar.mnuitemAutoFilter.setChecked(val===true, true);
                    this._state.filter = val;
                }

                need_disable =  this._state.controlsdisabled.filters || (val===null);
                me.toolbar.lockToolbar(SSE.enumLock.ruleFilter, need_disable,
                    { array: [me.toolbar.btnSortDown, me.toolbar.btnSortUp, me.toolbar.btnSetAutofilter] });

                need_disable =  this._state.controlsdisabled.filters || !filterInfo || (filterInfo.asc_getIsApplyAutoFilter()!==true);
                me.toolbar.lockToolbar(SSE.enumLock.ruleDelFilter, need_disable, {array:[me.toolbar.btnClearAutofilter]});
            }
        },

        onApiStyleChange: function() {
            this.toolbar.btnCopyStyle.toggle(false, true);
            this.modeAlwaysSetStyle = false;
        },

        updateThemeColors: function() {
            var updateColors = function(picker, defaultColor) {
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
                        picker.currentColor = defaultColor;
                    } else if ( clr!==undefined ) {
                        picker.currentColor = clr;
                    }
                }
            };

            updateColors(this.toolbar.mnuTextColorPicker, Common.Utils.ThemeColor.getStandartColors()[1]);
            if (this.toolbar.btnTextColor.currentColor === undefined) {
                this.toolbar.btnTextColor.currentColor=Common.Utils.ThemeColor.getStandartColors()[1];
            } else
                this.toolbar.btnTextColor.currentColor = this.toolbar.mnuTextColorPicker.currentColor.color || this.toolbar.mnuTextColorPicker.currentColor;
            $('.btn-color-value-line', this.toolbar.btnTextColor.cmpEl).css('background-color', '#' + this.toolbar.btnTextColor.currentColor);

            updateColors(this.toolbar.mnuBackColorPicker, Common.Utils.ThemeColor.getStandartColors()[3]);
            if (this.toolbar.btnBackColor.currentColor === undefined) {
                this.toolbar.btnBackColor.currentColor=Common.Utils.ThemeColor.getStandartColors()[3];
            } else
                this.toolbar.btnBackColor.currentColor = this.toolbar.mnuBackColorPicker.currentColor.color || this.toolbar.mnuBackColorPicker.currentColor;
            $('.btn-color-value-line', this.toolbar.btnBackColor.cmpEl).css('background-color', this.toolbar.btnBackColor.currentColor == 'transparent' ? 'transparent' : '#' + this.toolbar.btnBackColor.currentColor);

            if (this._state.clrtext_asccolor!==undefined || this._state.clrshd_asccolor!==undefined) {
                this._state.clrtext = undefined;
                this._state.clrback = undefined;
                this.onApiSelectionChanged(this.api.asc_getCellInfo());
            }

            this._state.clrtext_asccolor = undefined;
            this._state.clrshd_asccolor = undefined;

            if (this.toolbar.mnuBorderColorPicker) {
                updateColors(this.toolbar.mnuBorderColorPicker, Common.Utils.ThemeColor.getEffectColors()[1]);
                this.toolbar.btnBorders.options.borderscolor = this.toolbar.mnuBorderColorPicker.currentColor.color || this.toolbar.mnuBorderColorPicker.currentColor;
                $('#id-toolbar-mnu-item-border-color .menu-item-icon').css('border-color', '#' + this.toolbar.btnBorders.options.borderscolor);
            }
        },

        hideElements: function(opts) {
            if (!_.isUndefined(opts.compact)) {
                this.onChangeViewMode(opts.compact);
            }

            if (!_.isUndefined(opts.formula)) {
                var cellEditor  = this.getApplication().getController('CellEditor').getView('CellEditor');
                cellEditor && cellEditor.setVisible(!opts.formula);

                Common.NotificationCenter.trigger('layout:changed', 'celleditor', opts.formula?'hidden':'showed');
            }

            if (!_.isUndefined(opts.headings)) {
                if (this.api) {
                    this.api.asc_setDisplayHeadings(!opts.headings);
                }
            }

            if (!_.isUndefined(opts.gridlines)) {
                if (this.api) {
					this.api.asc_setDisplayGridlines(!opts.gridlines);
                }
            }

            if (!_.isUndefined(opts.freezepanes)) {
                if (this.api) {
                    this.api.asc_freezePane();
                }
            }

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        fillAutoShapes: function() {
            var me = this,
                shapesStore = this.getApplication().getCollection('ShapeGroups');

            for (var i = 0; i < shapesStore.length; i++) {
                var shapeGroup = shapesStore.at(i);

                var menuItem = new Common.UI.MenuItem({
                    caption: shapeGroup.get('groupName'),
                    menu: new Common.UI.Menu({
                        menuAlign: 'tl-tr',
                        items: [
                            { template: _.template('<div id="id-toolbar-menu-shapegroup' + i + '" class="menu-shape" style="width: ' + (shapeGroup.get('groupWidth') - 8) + 'px; margin-left: 5px;"></div>') }
                        ]
                    })
                });

                me.toolbar.btnInsertShape.menu.addItem(menuItem);

                var shapePicker = new Common.UI.DataView({
                    el: $('#id-toolbar-menu-shapegroup' + i),
                    store: shapeGroup.get('groupStore'),
                    parentMenu: menuItem.menu,
                    showLast: false,
                    itemTemplate: _.template('<div class="item-shape"><img src="<%= imageUrl %>" id="<%= id %>"></div>')
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
            }
        },

        fillTextArt: function() {
            if (!this.toolbar.btnInsertTextArt.rendered) return;

            var me = this;

            if ( this.toolbar.mnuTextArtPicker ) {
                var models = this.getApplication().getCollection('Common.Collections.TextArt').models,
                    count = this.toolbar.mnuTextArtPicker.store.length;
                if (count>0 && count==models.length) {
                    var data = this.toolbar.mnuTextArtPicker.store.models;
                    _.each(models, function(template, index){
                        data[index].set('imageUrl', template.get('imageUrl'));
                    });
                } else {
                    this.toolbar.mnuTextArtPicker.store.reset(models);
                }
            } else {
                this.toolbar.mnuTextArtPicker = new Common.UI.DataView({
                    el: $('#id-toolbar-menu-insart'),
                    store: this.getApplication().getCollection('Common.Collections.TextArt'),
                    parentMenu: this.toolbar.btnInsertTextArt.menu,
                    showLast: false,
                    itemTemplate: _.template('<div class="item-art"><img src="<%= imageUrl %>" id="<%= id %>" style="width:50px;height:50px;"></div>')
                });

                this.toolbar.mnuTextArtPicker.on('item:click',
                    function(picker, item, record, e) {
                        if (record) {
                            me.toolbar.fireEvent('inserttextart', me.toolbar);
                            me.api.asc_addTextArt(record.get('data'));
                        }
                        if ( me.toolbar.btnInsertShape.pressed )
                            me.toolbar.btnInsertShape.toggle(false, true);

                         if ( e.type !== 'click' )
                             me.toolbar.btnInsertTextArt.menu.hide();

                        Common.NotificationCenter.trigger('edit:complete', me.toolbar, me.toolbar.btnInsertTextArt);
                        Common.component.Analytics.trackEvent('ToolBar', 'Add Text Art');
                    }
                );
            }
        },

        fillEquations: function() {
            if (!this.toolbar.btnInsertEquation.rendered || this.toolbar.btnInsertEquation.menu.items.length>0) return;

            var me = this, equationsStore = this.getApplication().getCollection('EquationGroups');

            me.equationPickers = [];
            me.toolbar.btnInsertEquation.menu.removeAll();

            for (var i = 0; i < equationsStore.length; ++i) {
                var equationGroup = equationsStore.at(i);

                var menuItem = new Common.UI.MenuItem({
                    caption: equationGroup.get('groupName'),
                    menu: new Common.UI.Menu({
                        menuAlign: 'tl-tr',
                        items: [
                            { template: _.template('<div id="id-toolbar-menu-equationgroup' + i +
                                '" class="menu-shape" style="width:' + (equationGroup.get('groupWidth') + 8) + 'px; ' +
                                equationGroup.get('groupHeight') + 'margin-left:5px;"></div>') }
                        ]
                    })
                });

                me.toolbar.btnInsertEquation.menu.addItem(menuItem);

                var equationPicker = new Common.UI.DataView({
                    el: $('#id-toolbar-menu-equationgroup' + i),
                    store: equationGroup.get('groupStore'),
                    parentMenu: menuItem.menu,
                    showLast: false,
                    itemTemplate: _.template('<div class="item-equation" '+
                        'style="background-position:<%= posX %>px <%= posY %>px;" >' +
                        '<div style="width:<%= width %>px;height:<%= height %>px;" id="<%= id %>">')
                });
                if (equationGroup.get('groupHeight').length) {

                    me.equationPickers.push(equationPicker);
                    me.toolbar.btnInsertEquation.menu.on('show:after', function () {

                        if (me.equationPickers.length) {
                            var element = $(this.el).find('.over').find('.menu-shape');
                            if (element.length) {
                                for (var i = 0; i < me.equationPickers.length; ++i) {
                                    if (element[0].id == me.equationPickers[i].el.id) {
                                        me.equationPickers[i].scroller.update({alwaysVisibleY: true});
                                        me.equationPickers.splice(i, 1);
                                        return;
                                    }
                                }
                            }
                        }
                    });
                }

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
        },

        onInsertEquationClick: function() {
            if (this.api) {
                this.api.asc_AddMath();
                Common.component.Analytics.trackEvent('ToolBar', 'Add Equation');
            }
            Common.NotificationCenter.trigger('edit:complete', this.toolbar, this.toolbar.btnInsertEquation);
        },

        onMathTypes: function(equation) {
            var equationgrouparray = [],
                equationsStore = this.getCollection('EquationGroups');

            equationsStore.reset();

            // equations groups

            var c_oAscMathMainTypeStrings = {};

            // [translate, count cells, scroll]

            c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.Symbol       ] = [this.textSymbols, 11];
            c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.Fraction     ] = [this.textFraction, 4];
            c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.Script       ] = [this.textScript, 4];
            c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.Radical      ] = [this.textRadical, 4];
            c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.Integral     ] = [this.textIntegral, 3, true];
            c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.LargeOperator] = [this.textLargeOperator, 5, true];
            c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.Bracket      ] = [this.textBracket, 4, true];
            c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.Function     ] = [this.textFunction, 3, true];
            c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.Accent       ] = [this.textAccent, 4];
            c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.LimitLog     ] = [this.textLimitAndLog, 3];
            c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.Operator     ] = [this.textOperator, 4];
            c_oAscMathMainTypeStrings[Common.define.c_oAscMathMainType.Matrix       ] = [this.textMatrix, 4, true];

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

            var i,id = 0, count = 0, length = 0, width = 0, height = 0, store = null, list = null, eqStore = null, eq = null;

            if (equation) {

                count = equation.get_Data().length;

                if (count) {
                    for (var j = 0; j < count; ++j) {
                        id = equation.get_Data()[j].get_Id();
                        width = equation.get_Data()[j].get_W();
                        height = equation.get_Data()[j].get_H();

                        store = new Backbone.Collection([], {
                            model: SSE.Models.EquationModel
                        });

                        if (store) {

                            var allItemsCount = 0, itemsCount = 0, ids = 0;

                            length = equation.get_Data()[j].get_Data().length;

                            for (i = 0; i < length; ++i) {
                                eqStore = equation.get_Data()[j].get_Data()[i];

                                itemsCount = eqStore.get_Data().length;
                                for (var p = 0; p < itemsCount; ++p) {

                                    eq = eqStore.get_Data()[p];
                                    ids = eq.get_Id();

                                    translate = '';

                                    if (translationTable.hasOwnProperty(ids)) {
                                        translate = translationTable[ids];
                                    }

                                    store.add({
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

                            width = c_oAscMathMainTypeStrings[id][1] * (width + 10);  // 4px margin + 4px margin + 1px border + 1px border

                            var normHeight = parseInt(370 / (height + 10)) * (height + 10);
                            equationgrouparray.push({
                                groupName   : c_oAscMathMainTypeStrings[id][0],
                                groupStore  : store,
                                groupWidth  : width,
                                groupHeight : c_oAscMathMainTypeStrings[id][2] ? ' height:'+ normHeight +'px!important; ' : ''
                            });
                        }
                    }

                    equationsStore.add(equationgrouparray);

                    this.fillEquations();
                }
            }
        },

        attachToControlEvents: function() {
//            this.control({
//                'menu[action=table-templates]':{
//                    select: this._onMenuTableTemplate,
//                    itemmouseenter: function(obj, record, item, index, event, eOpts) {
//                        if (obj.tooltip) obj.tooltip.close();
//                        obj.tooltip = Ext.create('Ext.tip.ToolTip', {
//                            closeAction     : 'destroy',
//                            dismissDelay    : 2000,
//                            html            : record.get('caption')
//                        });
//                        var xy = event.getXY();
//                        obj.tooltip.showAt([xy[0]+10,xy[1]+10]);
//                    },
//                    itemmouseleave: function(obj, record, item, index, e, eOpts) {
//                        if (obj.tooltip) obj.tooltip.close();
//                    },
//                    hide: function() {
//                        this.getToolbar().fireEvent('editcomplete', this.getToolbar());
//                    }
//                },
//                'menu[action=number-format]': {
//                    click: this._handleNumberFormatMenu
//                }
//            });
        },

        _disableEditOptions: function(seltype, coauth_disable) {
            if (this.api.isCellEdited) return true;
            if (this.api.isRangeSelection) return true;

            var toolbar = this.toolbar,
                is_chart_text   = seltype == Asc.c_oAscSelectionType.RangeChartText,
                is_chart        = seltype == Asc.c_oAscSelectionType.RangeChart,
                is_shape_text   = seltype == Asc.c_oAscSelectionType.RangeShapeText,
                is_shape        = seltype == Asc.c_oAscSelectionType.RangeShape,
                is_image        = seltype == Asc.c_oAscSelectionType.RangeImage,
                is_mode_2       = is_shape_text || is_shape || is_chart_text || is_chart,
                is_objLocked    = false;

            if (!(is_mode_2 || is_image) && this._state.selection_type===seltype && this._state.coauthdisable===coauth_disable) return (seltype===Asc.c_oAscSelectionType.RangeImage);

            if (is_mode_2) {
                var SelectedObjects = this.api.asc_getGraphicObjectProps();
                for (var i=0; i<SelectedObjects.length; ++i)
                {
                    if (SelectedObjects[i].asc_getObjectType() == Asc.c_oAscTypeSelectElement.Image)
                        is_objLocked = is_objLocked || SelectedObjects[i].asc_getObjectValue().asc_getLocked();
                }
            }

            if ( coauth_disable ) {
                toolbar.lockToolbar(SSE.enumLock.coAuth, coauth_disable);
            } else {
                var _set = SSE.enumLock;
                var type = seltype;
                switch (seltype) {
                case Asc.c_oAscSelectionType.RangeImage:        type = _set.selImage; break;
                case Asc.c_oAscSelectionType.RangeShape:        type = _set.selShape; break;
                case Asc.c_oAscSelectionType.RangeShapeText:    type = _set.selShapeText; break;
                case Asc.c_oAscSelectionType.RangeChart:        type = _set.selChart; break;
                case Asc.c_oAscSelectionType.RangeChartText:    type = _set.selChartText; break;
                }

                if ( !this.appConfig.isEditDiagram && !this.appConfig.isEditMailMerge )
                    toolbar.lockToolbar(type, type != seltype, {
                        array: [
                            toolbar.btnClearStyle.menu.items[1],
                            toolbar.btnClearStyle.menu.items[2],
                            toolbar.btnClearStyle.menu.items[3],
                            toolbar.btnClearStyle.menu.items[4],
                            toolbar.mnuitemSortAZ,
                            toolbar.mnuitemSortZA,
                            toolbar.mnuitemAutoFilter,
                            toolbar.mnuitemClearFilter
                        ],
                        merge: true,
                        clear: [_set.selImage, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.coAuth]
                    });

                toolbar.lockToolbar(SSE.enumLock.coAuthText, is_objLocked);
                toolbar.lockToolbar(SSE.enumLock.coAuthText, is_objLocked && (seltype==Asc.c_oAscSelectionType.RangeChart || seltype==Asc.c_oAscSelectionType.RangeChartText), { array: [toolbar.btnInsertChart] } );
            }

            this._state.controlsdisabled.filters = is_image || is_mode_2 || coauth_disable;

            if (is_image || is_mode_2 || coauth_disable) {
                if ( toolbar.listStyles ) {
                    toolbar.listStyles.suspendEvents();
                    toolbar.listStyles.menuPicker.selectRecord(null);
                    toolbar.listStyles.resumeEvents();
                }

                this._state.prstyle = undefined;
            }

            this._state.selection_type = seltype;
            this._state.coauthdisable = coauth_disable; // need to redisable coAuthControls
            return is_image;
        },

        _getApiTextSize: function() {
            var cellInfo = this.api.asc_getCellInfo();
            return cellInfo ? cellInfo.asc_getFont().asc_getSize() : 12;
        },

        _setTableFormat: function(fmtname) {
            var me = this;

            if (me.api.isRangeSelection !== true) {
                if (!me.api.asc_getCellInfo().asc_getFormatTableInfo()) {
                    var handlerDlg = function(dlg, result) {
                        if (result == 'ok') {
                            me._state.filter = undefined;
                            me.api.asc_setSelectionDialogMode(Asc.c_oAscSelectionDialogType.None);

                            if (me._state.tablename)
                                me.api.asc_changeAutoFilter(me._state.tablename, Asc.c_oAscChangeFilterOptions.style, fmtname);
                            else {
                                var settings = dlg.getSettings();
                                if (settings.selectionType == Asc.c_oAscSelectionType.RangeMax || settings.selectionType == Asc.c_oAscSelectionType.RangeRow ||
                                    settings.selectionType == Asc.c_oAscSelectionType.RangeCol)
                                    Common.UI.warning({
                                        title: me.textLongOperation,
                                        msg: me.warnLongOperation,
                                        buttons: ['ok', 'cancel'],
                                        callback: function(btn) {
                                            if (btn == 'ok')
                                                setTimeout(function() {
                                                    me.toolbar.fireEvent('inserttable', me.toolbar);
                                                    me.api.asc_addAutoFilter(fmtname, settings.range);
                                                }, 1);
                                            Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                                        }
                                    });
                                else {
                                    me.toolbar.fireEvent('inserttable', me.toolbar);
                                    me.api.asc_addAutoFilter(fmtname, settings.range);
                                }
                            }
                        }

                        Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                    };

                    var win = new SSE.Views.TableOptionsDialog({
                        handler: handlerDlg
                    });

                    win.show();
                    win.setSettings({
                        api     : me.api,
                        selectionType: me.api.asc_getCellInfo().asc_getFlags().asc_getSelectionType()
                    });
                } else {
                    me._state.filter = undefined;
                    if (me._state.tablename)
                        me.api.asc_changeAutoFilter(me._state.tablename, Asc.c_oAscChangeFilterOptions.style, fmtname);
                    else {
                        var selectionType = me.api.asc_getCellInfo().asc_getFlags().asc_getSelectionType();
                        if (selectionType == Asc.c_oAscSelectionType.RangeMax || selectionType == Asc.c_oAscSelectionType.RangeRow ||
                            selectionType == Asc.c_oAscSelectionType.RangeCol)
                            Common.UI.warning({
                                title: me.textLongOperation,
                                msg: me.warnLongOperation,
                                buttons: ['ok', 'cancel'],
                                callback: function(btn) {
                                    if (btn == 'ok')
                                        setTimeout(function() {
                                            me.toolbar.fireEvent('inserttable', me.toolbar);
                                            me.api.asc_addAutoFilter(fmtname);
                                        }, 1);
                                    Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                                }
                            });
                        else {
                            me.toolbar.fireEvent('inserttable', me.toolbar);
                            me.api.asc_addAutoFilter(fmtname);
                        }
                    }
                }
            }
        },

        onHideMenus: function(e){
            Common.NotificationCenter.trigger('edit:complete', this.toolbar, {restorefocus:true});
        },

        onSetupCopyStyleButton: function () {
            this.modeAlwaysSetStyle = false;

            var me = this;

            Common.NotificationCenter.on({
                'edit:complete': function () {
                    if (me.api && me.modeAlwaysSetStyle) {
                        me.api.asc_formatPainter(AscCommon.c_oAscFormatPainterState.kOff);
                        me.toolbar.btnCopyStyle.toggle(false, true);
                        me.modeAlwaysSetStyle = false;
                    }
                }
            });

            $(me.toolbar.btnCopyStyle.cmpEl).dblclick(function () {
                if (me.api) {
                    me.modeAlwaysSetStyle = true;
                    me.toolbar.btnCopyStyle.toggle(true, true);
                    me.api.asc_formatPainter(AscCommon.c_oAscFormatPainterState.kMultiple);
                }
            });
        },

        onCellsRange: function(status) {
            this.api.isRangeSelection = (status != Asc.c_oAscSelectionDialogType.None);
            this.onApiEditCell(this.api.isRangeSelection ? Asc.c_oAscCellEditorState.editStart : Asc.c_oAscCellEditorState.editEnd);

            var toolbar = this.toolbar;
            toolbar.lockToolbar(SSE.enumLock.selRangeEdit, this.api.isRangeSelection);

            this.setDisabledComponents([toolbar.btnUndo], this.api.isRangeSelection || !this.api.asc_getCanUndo());
            this.setDisabledComponents([toolbar.btnRedo], this.api.isRangeSelection || !this.api.asc_getCanRedo());

            this.onApiSelectionChanged(this.api.asc_getCellInfo());
        },

        onLockDefNameManager: function(state) {
            this._state.namedrange_locked = (state == Asc.c_oAscDefinedNameReason.LockDefNameManager);

            this.toolbar.lockToolbar(SSE.enumLock.printAreaLock, this.api.asc_isPrintAreaLocked(this.api.asc_getActiveWorksheetIndex()), {array: [this.toolbar.btnPrintArea]});
            this.toolbar.lockToolbar(SSE.enumLock.namedRangeLock, this._state.namedrange_locked, {array: [this.toolbar.btnPrintArea.menu.items[0], this.toolbar.btnPrintArea.menu.items[2]]});
        },

        activateControls: function() {
            this.toolbar.lockToolbar(SSE.enumLock.disableOnStart, false, {array: [this.toolbar.btnPrint]});
            this._state.activated = true;
        },

        DisableToolbar: function(disable, viewMode) {
            if (viewMode!==undefined) this.editMode = !viewMode;
            disable = disable || !this.editMode;

            var mask = $('.toolbar-mask');
            if (disable && mask.length>0 || !disable && mask.length==0) return;

            var toolbar = this.toolbar;
            toolbar.$el.find('.toolbar').toggleClass('masked', disable);

            this.toolbar.lockToolbar(SSE.enumLock.menuFileOpen, disable);
            if(disable) {
                mask = $("<div class='toolbar-mask'>").appendTo(toolbar.$el.find('.toolbar'));
                Common.util.Shortcuts.suspendEvents('command+l, ctrl+l, command+shift+l, ctrl+shift+l, command+k, ctrl+k, command+alt+h, ctrl+alt+h, command+1, ctrl+1');
            } else {
                mask.remove();
                Common.util.Shortcuts.resumeEvents('command+l, ctrl+l, command+shift+l, ctrl+shift+l, command+k, ctrl+k, command+alt+h, ctrl+alt+h, command+1, ctrl+1');
            }
        },

        applyFormulaSettings: function() {
            if (this.toolbar.btnInsertFormula && this.toolbar.btnInsertFormula.rendered) {
                var formulas = this.toolbar.btnInsertFormula.menu.items;
                for (var i=0; i<Math.min(4,formulas.length); i++) {
                    formulas[i].setCaption(this.api.asc_getFormulaLocaleName(formulas[i].value));
                }
            }
        },

        onAppShowed: function (config) {
            var me = this;
            me.appConfig = config;

            var compactview = !config.isEdit;
            if ( config.isEdit && !config.isEditDiagram && !config.isEditMailMerge ) {
                if ( Common.localStorage.itemExists("sse-compact-toolbar") ) {
                    compactview = Common.localStorage.getBool("sse-compact-toolbar");
                } else
                if ( config.customization && config.customization.compactToolbar )
                    compactview = true;
            }

            me.toolbar.render(_.extend({isCompactView: compactview}, config));

            Common.Utils.asyncCall(function () {
                if ( config.isEdit ) {
                    me.toolbar.setMode(config);

                    me.toolbar.btnSave && me.toolbar.btnSave.on('disabled', _.bind(me.onBtnChangeState, me, 'save:disabled'));
                    me.toolbar.btnUndo && me.toolbar.btnUndo.on('disabled', _.bind(me.onBtnChangeState, me, 'undo:disabled'));
                    me.toolbar.btnRedo && me.toolbar.btnRedo.on('disabled', _.bind(me.onBtnChangeState, me, 'redo:disabled'));
                    me.toolbar.btnPrint && me.toolbar.btnPrint.on('disabled', _.bind(me.onBtnChangeState, me, 'print:disabled'));
                    me.toolbar.setApi(me.api);

                    if ( !config.isEditDiagram && !config.isEditMailMerge ) {
                        if ( !config.isOffline ) {
                            tab = {action: 'pivot', caption: me.textPivot};
                            $panel = me.getApplication().getController('PivotTable').createToolbarPanel();
                            if ($panel) {
                                me.toolbar.addTab(tab, $panel, 3);
                                me.toolbar.setVisible('pivot', true);
                            }
                        }

                        var tab = {action: 'review', caption: me.toolbar.textTabCollaboration};
                        var $panel = me.getApplication().getController('Common.Controllers.ReviewChanges').createToolbarPanel();
                        if ( $panel )
                            me.toolbar.addTab(tab, $panel, 4);

                        if (!(config.customization && config.customization.compactHeader)) {
                            // hide 'print' and 'save' buttons group and next separator
                            me.toolbar.btnPrint.$el.parents('.group').hide().next().hide();

                            // hide 'undo' and 'redo' buttons and get container
                            var $box = me.toolbar.btnUndo.$el.hide().next().hide().parent();

                            // move 'paste' button to the container instead of 'undo' and 'redo'
                            me.toolbar.btnPaste.$el.detach().appendTo($box);
                            me.toolbar.btnCopy.$el.removeClass('split');
                        }

                        if ( config.isDesktopApp ) {
                            if ( config.canProtect ) {
                                tab = {action: 'protect', caption: me.toolbar.textTabProtect};
                                $panel = me.getApplication().getController('Common.Controllers.Protection').createToolbarPanel();
                                if ($panel)
                                    me.toolbar.addTab(tab, $panel, 5);
                            }
                        }
                    }
                }
            });
        },

        onAppReady: function (config) {
            var me = this;
            me.appOptions = config;

            this.btnsComment = [];
            if ( config.canCoAuthoring && config.canComments ) {
                var _set = SSE.enumLock;
                var slots = me.toolbar.$el.find('.slot-comment');
                slots.each(function(index, el) {
                    var _cls = 'btn-toolbar';
                    /x-huge/.test(el.className) && (_cls += ' x-huge icon-top');

                    var button = new Common.UI.Button({
                        id: 'tlbtn-addcomment-' + index,
                        cls: _cls,
                        iconCls: 'btn-menu-comments',
                        lock: [_set.lostConnect, _set.commentLock],
                        caption: me.toolbar.capBtnComment
                    }).render( slots.eq(index) );

                    me.btnsComment.push(button);
                });

                if ( this.btnsComment.length ) {
                    var _comments = SSE.getController('Common.Controllers.Comments').getView();
                    Array.prototype.push.apply(me.toolbar.lockControls, this.btnsComment);
                    this.btnsComment.forEach(function (btn) {
                        btn.updateHint( _comments.textHintAddComment );
                        btn.on('click', function (btn, e) {
                            Common.NotificationCenter.trigger('app:comment:add', 'toolbar', me.api.asc_getCellInfo().asc_getFlags().asc_getSelectionType() != Asc.c_oAscSelectionType.RangeCells);
                        });
                    }, this);
                }
            }

            Common.Utils.asyncCall(function () {
                if ( config.isEdit ) {
                    me.toolbar.onAppReady(config);
                }
            });
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

        onPageSizeClick: function(menu, item, state) {
            if (this.api && state) {
                this._state.pgsize = [0, 0];
                this.api.asc_changeDocSize(item.value[0], item.value[1], this.api.asc_getActiveWorksheetIndex());
                Common.NotificationCenter.trigger('page:settings');
                Common.component.Analytics.trackEvent('ToolBar', 'Page Size');
            }

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onPageMarginsSelect: function(menu, item) {
            if (this.api) {
                this._state.pgmargins = undefined;
                if (item.value !== 'advanced') {
                    this.api.asc_changePageMargins(item.value[1], item.value[3], item.value[0], item.value[2], this.api.asc_getActiveWorksheetIndex());
                    Common.NotificationCenter.trigger('page:settings');
                } else {
                    var win, props,
                        me = this;
                    win = new SSE.Views.PageMarginsDialog({
                        handler: function(dlg, result) {
                            if (result == 'ok') {
                                props = dlg.getSettings();
                                var mnu = me.toolbar.btnPageMargins.menu.items[0];
                                mnu.setVisible(true);
                                mnu.setChecked(true);
                                mnu.options.value = mnu.value = [props.asc_getTop(), props.asc_getLeft(), props.asc_getBottom(), props.asc_getRight()];
                                $(mnu.el).html(mnu.template({id: Common.UI.getId(), caption : mnu.caption, options : mnu.options}));
                                Common.localStorage.setItem("sse-pgmargins-top", props.asc_getTop());
                                Common.localStorage.setItem("sse-pgmargins-left", props.asc_getLeft());
                                Common.localStorage.setItem("sse-pgmargins-bottom", props.asc_getBottom());
                                Common.localStorage.setItem("sse-pgmargins-right", props.asc_getRight());

                                me.api.asc_changePageMargins( props.asc_getLeft(), props.asc_getRight(), props.asc_getTop(), props.asc_getBottom(), me.api.asc_getActiveWorksheetIndex());
                                Common.NotificationCenter.trigger('page:settings');
                                Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                            }
                        }
                    });
                    win.show();
                    win.setSettings(me.api.asc_getPageOptions(me.api.asc_getActiveWorksheetIndex()));
                }

                Common.component.Analytics.trackEvent('ToolBar', 'Page Margins');
            }

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onPageOrientSelect: function(menu, item) {
            this._state.pgorient = undefined;
            if (this.api && item.checked) {
                this.api.asc_changePageOrient(item.value==Asc.c_oAscPageOrientation.PagePortrait, this.api.asc_getActiveWorksheetIndex());
                Common.NotificationCenter.trigger('page:settings');
            }

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Page Orientation');
        },

        onImgGroupSelect: function(menu, item) {
            if (this.api)
                this.api[(item.value == 'grouping') ? 'asc_groupGraphicsObjects' : 'asc_unGroupGraphicsObjects']();
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Objects Group');
        },

        onImgArrangeSelect: function(menu, item) {
            if (this.api) {
                if ( menu == 'forward' )
                    this.api.asc_setSelectedDrawingObjectLayer(Asc.c_oAscDrawingLayerType.BringForward);
                else if ( menu == 'backward' )
                    this.api.asc_setSelectedDrawingObjectLayer(Asc.c_oAscDrawingLayerType.SendBackward);
                else
                    this.api.asc_setSelectedDrawingObjectLayer(item.value);
            }
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Objects Arrange');
        },

        onImgAlignSelect: function(menu, item) {
            if (this.api) {
                if (item.value>-1 && item.value < 6) {
                    this.api.asc_setSelectedDrawingObjectAlign(item.value);
                    Common.component.Analytics.trackEvent('ToolBar', 'Objects Align');
                } else if (item.value == 6) {
                    this.api.asc_DistributeSelectedDrawingObjectHor();
                    Common.component.Analytics.trackEvent('ToolBar', 'Distribute');
                } else if (item.value == 7){
                    this.api.asc_DistributeSelectedDrawingObjectVer();
                    Common.component.Analytics.trackEvent('ToolBar', 'Distribute');
                }
            }
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onPrintAreaClick: function(menu, item) {
            if (this.api) {
                this.api.asc_ChangePrintArea(item.value);
                Common.component.Analytics.trackEvent('ToolBar', 'Print Area');
            }

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onPrintAreaMenuOpen: function() {
            if (this.api)
                this.toolbar.btnPrintArea.menu.items[2].setVisible(this.api.asc_CanAddPrintArea());
        },

        textEmptyImgUrl     : 'You need to specify image URL.',
        warnMergeLostData   : 'Operation can destroy data in the selected cells.<br>Continue?',
        textWarning         : 'Warning',
        textFontSizeErr     : 'The entered value is incorrect.<br>Please enter a numeric value between 1 and 409',
        textCancel          : 'Cancel',
        confirmAddFontName  : 'The font you are going to save is not available on the current device.<br>The text style will be displayed using one of the device fonts, the saved font will be used when it is available.<br>Do you want to continue?',
        textSymbols                                : 'Symbols',
        textFraction                               : 'Fraction',
        textScript                                 : 'Script',
        textRadical                                : 'Radical',
        textIntegral                               : 'Integral',
        textLargeOperator                          : 'Large Operator',
        textBracket                                : 'Bracket',
        textFunction                               : 'Function',
        textAccent                                 : 'Accent',
        textLimitAndLog                            : 'Limit And Log',
        textOperator                               : 'Operator',
        textMatrix                                 : 'Matrix',

        txtSymbol_pm                               : 'Plus Minus',
        txtSymbol_infinity                         : 'Infinity',
        txtSymbol_equals                           : 'Equal',
        txtSymbol_neq                              : 'Not Equal To',
        txtSymbol_about                            : 'Approximately',
        txtSymbol_times                            : 'Multiplication Sign',
        txtSymbol_div                              : 'Division Sign',
        txtSymbol_factorial                        : 'Factorial',
        txtSymbol_propto                           : 'Proportional To',
        txtSymbol_less                             : 'Less Than',
        txtSymbol_ll                               : 'Much Less Than',
        txtSymbol_greater                          : 'Greater Than',
        txtSymbol_gg                               : 'Much Greater Than',
        txtSymbol_leq                              : 'Less Than or Equal To',
        txtSymbol_geq                              : 'Greater Than or Equal To',
        txtSymbol_mp                               : 'Minus Plus',
        txtSymbol_cong                             : 'Approximately Equal To',
        txtSymbol_approx                           : 'Almost Equal To',
        txtSymbol_equiv                            : 'Identical To',
        txtSymbol_forall                           : 'For All',
        txtSymbol_additional                       : 'Complement',
        txtSymbol_partial                          : 'Partial Differential',
        txtSymbol_sqrt                             : 'Radical Sign',
        txtSymbol_cbrt                             : 'Cube Root',
        txtSymbol_qdrt                             : 'Fourth Root',
        txtSymbol_cup                              : 'Union',
        txtSymbol_cap                              : 'Intersection',
        txtSymbol_emptyset                         : 'Empty Set',
        txtSymbol_percent                          : 'Percentage',
        txtSymbol_degree                           : 'Degrees',
        txtSymbol_fahrenheit                       : 'Degrees Fahrenheit',
        txtSymbol_celsius                          : 'Degrees Celsius',
        txtSymbol_inc                              : 'Increment',
        txtSymbol_nabla                            : 'Nabla',
        txtSymbol_exists                           : 'There Exist',
        txtSymbol_notexists                        : 'There Does Not Exist',
        txtSymbol_in                               : 'Element Of',
        txtSymbol_ni                               : 'Contains as Member',
        txtSymbol_leftarrow                        : 'Left Arrow',
        txtSymbol_uparrow                          : 'Up Arrow',
        txtSymbol_rightarrow                       : 'Right Arrow',
        txtSymbol_downarrow                        : 'Down Arrow',
        txtSymbol_leftrightarrow                   : 'Left-Right Arrow',
        txtSymbol_therefore                        : 'Therefore',
        txtSymbol_plus                             : 'Plus',
        txtSymbol_minus                            : 'Minus',
        txtSymbol_not                              : 'Not Sign',
        txtSymbol_ast                              : 'Asterisk Operator',
        txtSymbol_bullet                           : 'Bulet Operator',
        txtSymbol_vdots                            : 'Vertical Ellipsis',
        txtSymbol_cdots                            : 'Midline Horizontal Ellipsis',
        txtSymbol_rddots                           : 'Up Right Diagonal Ellipsis',
        txtSymbol_ddots                            : 'Down Right Diagonal Ellipsis',
        txtSymbol_aleph                            : 'Alef',
        txtSymbol_beth                             : 'Bet',
        txtSymbol_qed                              : 'End of Proof',
        txtSymbol_alpha                            : 'Alpha',
        txtSymbol_beta                             : 'Beta',
        txtSymbol_gamma                            : 'Gamma',
        txtSymbol_delta                            : 'Delta',
        txtSymbol_varepsilon                       : 'Epsilon Variant',
        txtSymbol_epsilon                          : 'Epsilon',
        txtSymbol_zeta                             : 'Zeta',
        txtSymbol_eta                              : 'Eta',
        txtSymbol_theta                            : 'Theta',
        txtSymbol_vartheta                         : 'Theta Variant',
        txtSymbol_iota                             : 'Iota',
        txtSymbol_kappa                            : 'Kappa',
        txtSymbol_lambda                           : 'Lambda',
        txtSymbol_mu                               : 'Mu',
        txtSymbol_nu                               : 'Nu',
        txtSymbol_xsi                              : 'Xi',
        txtSymbol_o                                : 'Omicron',
        txtSymbol_pi                               : 'Pi',
        txtSymbol_varpi                            : 'Pi Variant',
        txtSymbol_rho                              : 'Rho',
        txtSymbol_varrho                           : 'Rho Variant',
        txtSymbol_sigma                            : 'Sigma',
        txtSymbol_varsigma                         : 'Sigma Variant',
        txtSymbol_tau                              : 'Tau',
        txtSymbol_upsilon                          : 'Upsilon',
        txtSymbol_varphi                           : 'Phi Variant',
        txtSymbol_phi                              : 'Phi',
        txtSymbol_chi                              : 'Chi',
        txtSymbol_psi                              : 'Psi',
        txtSymbol_omega                            : 'Omega',

        txtFractionVertical                        : 'Stacked Fraction',
        txtFractionDiagonal                        : 'Skewed Fraction',
        txtFractionHorizontal                      : 'Linear Fraction',
        txtFractionSmall                           : 'Small Fraction',
        txtFractionDifferential_1                  : 'Differential',
        txtFractionDifferential_2                  : 'Differential',
        txtFractionDifferential_3                  : 'Differential',
        txtFractionDifferential_4                  : 'Differential',
        txtFractionPi_2                            : 'Pi Over 2',

        txtScriptSup                               : 'Superscript',
        txtScriptSub                               : 'Subscript',
        txtScriptSubSup                            : 'Subscript-Superscript',
        txtScriptSubSupLeft                        : 'Left Subscript-Superscript',
        txtScriptCustom_1                          : 'Script',
        txtScriptCustom_2                          : 'Script',
        txtScriptCustom_3                          : 'Script',
        txtScriptCustom_4                          : 'Script',

        txtRadicalSqrt                             : 'Square Root',
        txtRadicalRoot_n                           : 'Radical With Degree',
        txtRadicalRoot_2                           : 'Square Root With Degree',
        txtRadicalRoot_3                           : 'Cubic Root',
        txtRadicalCustom_1                         : 'Radical',
        txtRadicalCustom_2                         : 'Radical',

        txtIntegral                                : 'Integral',
        txtIntegralSubSup                          : 'Integral',
        txtIntegralCenterSubSup                    : 'Integral',
        txtIntegralDouble                          : 'Double Integral',
        txtIntegralDoubleSubSup                    : 'Double Integral',
        txtIntegralDoubleCenterSubSup              : 'Double Integral',
        txtIntegralTriple                          : 'Triple Integral',
        txtIntegralTripleSubSup                    : 'Triple Integral',
        txtIntegralTripleCenterSubSup              : 'Triple Integral',
        txtIntegralOriented                        : 'Contour Integral',
        txtIntegralOrientedSubSup                  : 'Contour Integral',
        txtIntegralOrientedCenterSubSup            : 'Contour Integral',
        txtIntegralOrientedDouble                  : 'Surface Integral',
        txtIntegralOrientedDoubleSubSup            : 'Surface Integral',
        txtIntegralOrientedDoubleCenterSubSup      : 'Surface Integral',
        txtIntegralOrientedTriple                  : 'Volume Integral',
        txtIntegralOrientedTripleSubSup            : 'Volume Integral',
        txtIntegralOrientedTripleCenterSubSup      : 'Volume Integral',
        txtIntegral_dx                             : 'Differential x',
        txtIntegral_dy                             : 'Differential y',
        txtIntegral_dtheta                         : 'Differential theta',

        txtLargeOperator_Sum                       : 'Summation',
        txtLargeOperator_Sum_CenterSubSup          : 'Summation',
        txtLargeOperator_Sum_SubSup                : 'Summation',
        txtLargeOperator_Sum_CenterSub             : 'Summation',
        txtLargeOperator_Sum_Sub                   : 'Summation',
        txtLargeOperator_Prod                      : 'Product',
        txtLargeOperator_Prod_CenterSubSup         : 'Product',
        txtLargeOperator_Prod_SubSup               : 'Product',
        txtLargeOperator_Prod_CenterSub            : 'Product',
        txtLargeOperator_Prod_Sub                  : 'Product',
        txtLargeOperator_CoProd                    : 'Co-Product',
        txtLargeOperator_CoProd_CenterSubSup       : 'Co-Product',
        txtLargeOperator_CoProd_SubSup             : 'Co-Product',
        txtLargeOperator_CoProd_CenterSub          : 'Co-Product',
        txtLargeOperator_CoProd_Sub                : 'Co-Product',
        txtLargeOperator_Union                     : 'Union',
        txtLargeOperator_Union_CenterSubSup        : 'Union',
        txtLargeOperator_Union_SubSup              : 'Union',
        txtLargeOperator_Union_CenterSub           : 'Union',
        txtLargeOperator_Union_Sub                 : 'Union',
        txtLargeOperator_Intersection              : 'Intersection',
        txtLargeOperator_Intersection_CenterSubSup : 'Intersection',
        txtLargeOperator_Intersection_SubSup       : 'Intersection',
        txtLargeOperator_Intersection_CenterSub    : 'Intersection',
        txtLargeOperator_Intersection_Sub          : 'Intersection',
        txtLargeOperator_Disjunction               : 'Vee',
        txtLargeOperator_Disjunction_CenterSubSup  : 'Vee',
        txtLargeOperator_Disjunction_SubSup        : 'Vee',
        txtLargeOperator_Disjunction_CenterSub     : 'Vee',
        txtLargeOperator_Disjunction_Sub           : 'Vee',
        txtLargeOperator_Conjunction               : 'Wedge',
        txtLargeOperator_Conjunction_CenterSubSup  : 'Wedge',
        txtLargeOperator_Conjunction_SubSup        : 'Wedge',
        txtLargeOperator_Conjunction_CenterSub     : 'Wedge',
        txtLargeOperator_Conjunction_Sub           : 'Wedge',
        txtLargeOperator_Custom_1                  : 'Summation',
        txtLargeOperator_Custom_2                  : 'Summation',
        txtLargeOperator_Custom_3                  : 'Summation',
        txtLargeOperator_Custom_4                  : 'Product',
        txtLargeOperator_Custom_5                  : 'Union',

        txtBracket_Round                           : 'Brackets',
        txtBracket_Square                          : 'Brackets',
        txtBracket_Curve                           : 'Brackets',
        txtBracket_Angle                           : 'Brackets',
        txtBracket_LowLim                          : 'Brackets',
        txtBracket_UppLim                          : 'Brackets',
        txtBracket_Line                            : 'Brackets',
        txtBracket_LineDouble                      : 'Brackets',
        txtBracket_Square_OpenOpen                 : 'Brackets',
        txtBracket_Square_CloseClose               : 'Brackets',
        txtBracket_Square_CloseOpen                : 'Brackets',
        txtBracket_SquareDouble                    : 'Brackets',

        txtBracket_Round_Delimiter_2               : 'Brackets with Separators',
        txtBracket_Curve_Delimiter_2               : 'Brackets with Separators',
        txtBracket_Angle_Delimiter_2               : 'Brackets with Separators',
        txtBracket_Angle_Delimiter_3               : 'Brackets with Separators',
        txtBracket_Round_OpenNone                  : 'Single Bracket',
        txtBracket_Round_NoneOpen                  : 'Single Bracket',
        txtBracket_Square_OpenNone                 : 'Single Bracket',
        txtBracket_Square_NoneOpen                 : 'Single Bracket',
        txtBracket_Curve_OpenNone                  : 'Single Bracket',
        txtBracket_Curve_NoneOpen                  : 'Single Bracket',
        txtBracket_Angle_OpenNone                  : 'Single Bracket',
        txtBracket_Angle_NoneOpen                  : 'Single Bracket',
        txtBracket_LowLim_OpenNone                 : 'Single Bracket',
        txtBracket_LowLim_NoneNone                 : 'Single Bracket',
        txtBracket_UppLim_OpenNone                 : 'Single Bracket',
        txtBracket_UppLim_NoneOpen                 : 'Single Bracket',
        txtBracket_Line_OpenNone                   : 'Single Bracket',
        txtBracket_Line_NoneOpen                   : 'Single Bracket',
        txtBracket_LineDouble_OpenNone             : 'Single Bracket',
        txtBracket_LineDouble_NoneOpen             : 'Single Bracket',
        txtBracket_SquareDouble_OpenNone           : 'Single Bracket',
        txtBracket_SquareDouble_NoneOpen           : 'Single Bracket',
        txtBracket_Custom_1                        : 'Case (Two Conditions)',
        txtBracket_Custom_2                        : 'Cases (Three Conditions)',
        txtBracket_Custom_3                        : 'Stack Object',
        txtBracket_Custom_4                        : 'Stack Object',
        txtBracket_Custom_5                        : 'Cases Example',
        txtBracket_Custom_6                        : 'Binomial Coefficient',
        txtBracket_Custom_7                        : 'Binomial Coefficient',

        txtFunction_Sin                            : 'Sine Function',
        txtFunction_Cos                            : 'Cosine Function',
        txtFunction_Tan                            : 'Tangent Function',
        txtFunction_Csc                            : 'Cosecant Function',
        txtFunction_Sec                            : 'Secant Function',
        txtFunction_Cot                            : 'Cotangent Function',
        txtFunction_1_Sin                          : 'Inverse Sine Function',
        txtFunction_1_Cos                          : 'Inverse Cosine Function',
        txtFunction_1_Tan                          : 'Inverse Tangent Function',
        txtFunction_1_Csc                          : 'Inverse Cosecant Function',
        txtFunction_1_Sec                          : 'Inverse Secant Function',
        txtFunction_1_Cot                          : 'Inverse Cotangent Function',
        txtFunction_Sinh                           : 'Hyperbolic Sine Function',
        txtFunction_Cosh                           : 'Hyperbolic Cosine Function',
        txtFunction_Tanh                           : 'Hyperbolic Tangent Function',
        txtFunction_Csch                           : 'Hyperbolic Cosecant Function',
        txtFunction_Sech                           : 'Hyperbolic Secant Function',
        txtFunction_Coth                           : 'Hyperbolic Cotangent Function',
        txtFunction_1_Sinh                         : 'Hyperbolic Inverse Sine Function',
        txtFunction_1_Cosh                         : 'Hyperbolic Inverse Cosine Function',
        txtFunction_1_Tanh                         : 'Hyperbolic Inverse Tangent Function',
        txtFunction_1_Csch                         : 'Hyperbolic Inverse Cosecant Function',
        txtFunction_1_Sech                         : 'Hyperbolic Inverse Secant Function',
        txtFunction_1_Coth                         : 'Hyperbolic Inverse Cotangent Function',
        txtFunction_Custom_1                       : 'Sine theta',
        txtFunction_Custom_2                       : 'Cos 2x',
        txtFunction_Custom_3                       : 'Tangent formula',

        txtAccent_Dot                              : 'Dot',
        txtAccent_DDot                             : 'Double Dot',
        txtAccent_DDDot                            : 'Triple Dot',
        txtAccent_Hat                              : 'Hat',
        txtAccent_Check                            : 'Check',
        txtAccent_Accent                           : 'Acute',
        txtAccent_Grave                            : 'Grave',
        txtAccent_Smile                            : 'Breve',
        txtAccent_Tilde                            : 'Tilde',
        txtAccent_Bar                              : 'Bar',
        txtAccent_DoubleBar                        : 'Double Overbar',
        txtAccent_CurveBracketTop                  : 'Overbrace',
        txtAccent_CurveBracketBot                  : 'Underbrace',
        txtAccent_GroupTop                         : 'Grouping Character Above',
        txtAccent_GroupBot                         : 'Grouping Character Below',
        txtAccent_ArrowL                           : 'Leftwards Arrow Above',
        txtAccent_ArrowR                           : 'Rightwards Arrow Above',
        txtAccent_ArrowD                           : 'Right-Left Arrow Above',
        txtAccent_HarpoonL                         : 'Leftwards Harpoon Above',
        txtAccent_HarpoonR                         : 'Rightwards Harpoon Above',
        txtAccent_BorderBox                        : 'Boxed Formula (With Placeholder)',
        txtAccent_BorderBoxCustom                  : 'Boxed Formula (Example)',
        txtAccent_BarTop                           : 'Overbar',
        txtAccent_BarBot                           : 'Underbar',
        txtAccent_Custom_1                         : 'Vector A',
        txtAccent_Custom_2                         : 'ABC With Overbar',
        txtAccent_Custom_3                         : 'x XOR y With Overbar',

        txtLimitLog_LogBase                        : 'Logarithm',
        txtLimitLog_Log                            : 'Logarithm',
        txtLimitLog_Lim                            : 'Limit',
        txtLimitLog_Min                            : 'Minimum',
        txtLimitLog_Max                            : 'Maximum',
        txtLimitLog_Ln                             : 'Natural Logarithm',
        txtLimitLog_Custom_1                       : 'Limit Example',
        txtLimitLog_Custom_2                       : 'Maximum Example',

        txtOperator_ColonEquals                    : 'Colon Equal',
        txtOperator_EqualsEquals                   : 'Equal Equal',
        txtOperator_PlusEquals                     : 'Plus Equal',
        txtOperator_MinusEquals                    : 'Minus Equal',
        txtOperator_Definition                     : 'Equal to By Definition',
        txtOperator_UnitOfMeasure                  : 'Measured By',
        txtOperator_DeltaEquals                    : 'Delta Equal To',
        txtOperator_ArrowL_Top                     : 'Leftwards Arrow Above',
        txtOperator_ArrowR_Top                     : 'Rightwards Arrow Above',
        txtOperator_ArrowL_Bot                     : 'Leftwards Arrow Below',
        txtOperator_ArrowR_Bot                     : 'Rightwards Arrow Below',
        txtOperator_DoubleArrowL_Top               : 'Leftwards Arrow Above',
        txtOperator_DoubleArrowR_Top               : 'Rightwards Arrow Above',
        txtOperator_DoubleArrowL_Bot               : 'Leftwards Arrow Below',
        txtOperator_DoubleArrowR_Bot               : 'Rightwards Arrow Below',
        txtOperator_ArrowD_Top                     : 'Right-Left Arrow Above',
        txtOperator_ArrowD_Bot                     : 'Right-Left Arrow Above',
        txtOperator_DoubleArrowD_Top               : 'Right-Left Arrow Below',
        txtOperator_DoubleArrowD_Bot               : 'Right-Left Arrow Below',
        txtOperator_Custom_1                       : 'Yileds',
        txtOperator_Custom_2                       : 'Delta Yields',

        txtMatrix_1_2                              : '1x2 Empty Matrix',
        txtMatrix_2_1                              : '2x1 Empty Matrix',
        txtMatrix_1_3                              : '1x3 Empty Matrix',
        txtMatrix_3_1                              : '3x1 Empty Matrix',
        txtMatrix_2_2                              : '2x2 Empty Matrix',
        txtMatrix_2_3                              : '2x3 Empty Matrix',
        txtMatrix_3_2                              : '3x2 Empty Matrix',
        txtMatrix_3_3                              : '3x3 Empty Matrix',
        txtMatrix_Dots_Center                      : 'Midline Dots',
        txtMatrix_Dots_Baseline                    : 'Baseline Dots',
        txtMatrix_Dots_Vertical                    : 'Vertical Dots',
        txtMatrix_Dots_Diagonal                    : 'Diagonal Dots',
        txtMatrix_Identity_2                       : '2x2 Identity Matrix',
        txtMatrix_Identity_2_NoZeros               : '3x3 Identity Matrix',
        txtMatrix_Identity_3                       : '3x3 Identity Matrix',
        txtMatrix_Identity_3_NoZeros               : '3x3 Identity Matrix',
        txtMatrix_2_2_RoundBracket                 : 'Empty Matrix with Brackets',
        txtMatrix_2_2_SquareBracket                : 'Empty Matrix with Brackets',
        txtMatrix_2_2_LineBracket                  : 'Empty Matrix with Brackets',
        txtMatrix_2_2_DLineBracket                 : 'Empty Matrix with Brackets',
        txtMatrix_Flat_Round                       : 'Sparse Matrix',
        txtMatrix_Flat_Square                      : 'Sparse Matrix',
        txtExpandSort: 'The data next to the selection will not be sorted. Do you want to expand the selection to include the adjacent data or continue with sorting the currently selected cells only?',
        txtExpand: 'Expand and sort',
        txtSorting: 'Sorting',
        txtSortSelected: 'Sort selected',
        textLongOperation: 'Long operation',
        warnLongOperation: 'The operation you are about to perform might take rather much time to complete.<br>Are you sure you want to continue?',
        txtInvalidRange: 'ERROR! Invalid cells range',
        errorMaxRows: 'ERROR! The maximum number of data series per chart is 255.',
        errorStockChart: 'Incorrect row order. To build a stock chart place the data on the sheet in the following order:<br> opening price, max price, min price, closing price.',
        textPivot: 'Pivot Table'

    }, SSE.Controllers.Toolbar || {}));
});