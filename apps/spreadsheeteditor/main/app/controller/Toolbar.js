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
 *  Created on 3/31/14
 *
 */

define([
    'core',
    'common/main/lib/component/Window',
    'common/main/lib/view/SearchBar',
    'spreadsheeteditor/main/app/view/define',
    'spreadsheeteditor/main/app/view/Toolbar',
    'spreadsheeteditor/main/app/collection/TableTemplates',
    'spreadsheeteditor/main/app/controller/PivotTable',
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
                    'change:compact': this.onClickChangeCompact.bind(me),
                    'add:chart'     : this.onSelectChart,
                    'add:spark'     : this.onSelectSpark,
                    'insert:textart': this.onInsertTextart,
                    'change:scalespn': this.onClickChangeScaleInMenu.bind(me),
                    'click:customscale': this.onScaleClick.bind(me),
                    'home:open'        : this.onHomeOpen,
                    'insert:smartart'   : this.onInsertSmartArt,
                    'smartart:mouseenter': this.mouseenterSmartArt,
                    'smartart:mouseleave': this.mouseleaveSmartArt,
                    'tab:active': this.onActiveTab,
                    'tab:collapse': this.onTabCollapse
                },
                'FileMenu': {
                    'menu:hide': me.onFileMenu.bind(me, 'hide'),
                    'menu:show': me.onFileMenu.bind(me, 'show')
                },
                'Statusbar': {
                    'sheet:changed': _.bind(this.onApiSheetChanged, this)
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
                            Asc.c_oAscFileType.OTS,
                            Asc.c_oAscFileType.XLSB,
                            Asc.c_oAscFileType.XLSM
                        ];

                        if ( !_format || _supported.indexOf(_format) < 0 )
                            _format = Asc.c_oAscFileType.PDF;

                        if (_format == Asc.c_oAscFileType.PDF || _format == Asc.c_oAscFileType.PDFA)
                            Common.NotificationCenter.trigger('download:settings', this.toolbar, _format);
                        else
                            _main.api.asc_DownloadAs(new Asc.asc_CDownloadOptions(_format));
                    },
                    'go:editor': function() {
                        Common.Gateway.requestEditRights();
                    }
                },
                'DataTab': {
                    'data:sort': this.onSortType,
                    'data:setfilter': this.onAutoFilter,
                    'data:clearfilter': this.onClearFilter
                },
                'FormulaTab': {
                    'function:namedrange': this.onNamedRangeMenu,
                    'function:namedrange-open': this.onNamedRangeMenuOpen
                },
                'CellSettings': {
                    'cf:init': this.onShowBeforeCondFormat
                },
                'ViewTab': {
                    'viewtab:showtoolbar': this.onChangeViewMode.bind(this)
                },
                'LeftMenu': {
                    'search:show': this.searchShow.bind(this)
                }
            });
            Common.NotificationCenter.on('page:settings', _.bind(this.onApiSheetChanged, this));
            Common.NotificationCenter.on('formula:settings', _.bind(this.applyFormulaSettings, this));
            Common.NotificationCenter.on('toolbar:collapse', _.bind(function () {
                this.toolbar.collapse();
            }, this));
            Common.NotificationCenter.on('oleedit:close', _.bind(this.onOleEditClose, this));

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
                lock_doc: undefined,
                cf_locked: [],
                selectedCells: 0,
                wsLock: false,
                wsProps: [],
                is_lockText: false,
                is_lockShape: false,
                isUserProtected: false
            };
            this.binding = {};

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
                if (this.toolbar.btnInsertText.pressed) {
                    this.toolbar.btnInsertText.toggle(false, true);
                    this.toolbar.btnInsertText.menu.clearAll();
                }
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
            Common.UI.TooltipManager.addTips({
                'protectRange' : {name: 'sse-help-tip-protect-range', placement: 'bottom-left', text: this.helpProtectRange, header: this.helpProtectRangeHeader, target: '#slot-btn-protect-range', automove: true}
            });
        },

        attachUIEvents: function(toolbar) {
            var me = this;

            /**
             * UI Events
             */
            if ( me.appConfig.isEditDiagram ) {
                toolbar.btnUndo.on('click',                                 _.bind(this.onUndo, this));
                toolbar.btnRedo.on('click',                                 _.bind(this.onRedo, this));
                toolbar.btnCopy.on('click',                                 _.bind(this.onCopyPaste, this, 'copy'));
                toolbar.btnPaste.on('click',                                _.bind(this.onCopyPaste, this, 'paste'));
                toolbar.btnInsertFormula.on('click',                        _.bind(this.onInsertFormulaMenu, this));
                toolbar.btnInsertFormula.menu.on('item:click',              _.bind(this.onInsertFormulaMenu, this));
                toolbar.btnDecDecimal.on('click',                           _.bind(this.onDecrement, this));
                toolbar.btnIncDecimal.on('click',                           _.bind(this.onIncrement, this));
                toolbar.cmbNumberFormat.on('selected',                      _.bind(this.onNumberFormatSelect, this));
                toolbar.cmbNumberFormat.on('show:before',                   _.bind(this.onNumberFormatOpenBefore, this, true));
                if (toolbar.cmbNumberFormat.cmpEl)
                    toolbar.cmbNumberFormat.cmpEl.on('click', '#id-toolbar-mnu-item-more-formats a', _.bind(this.onNumberFormatSelect, this));
                toolbar.btnEditChart.on('click',                            _.bind(this.onEditChart, this));
                toolbar.btnEditChartData.on('click',                        _.bind(this.onEditChartData, this));
                toolbar.btnEditChartType.on('click',                        _.bind(this.onEditChartType, this));
            } else
            if ( me.appConfig.isEditMailMerge ) {
                toolbar.btnUndo.on('click',                                 _.bind(this.onUndo, this));
                toolbar.btnRedo.on('click',                                 _.bind(this.onRedo, this));
                toolbar.btnCopy.on('click',                                 _.bind(this.onCopyPaste, this, 'copy'));
                toolbar.btnPaste.on('click',                                _.bind(this.onCopyPaste, this, 'paste'));
                toolbar.btnSearch.on('toggle',                              _.bind(this.onSearch, this));
                toolbar.btnSortDown.on('click',                             _.bind(this.onSortType, this, Asc.c_oAscSortOptions.Ascending));
                toolbar.btnSortUp.on('click',                               _.bind(this.onSortType, this, Asc.c_oAscSortOptions.Descending));
                toolbar.btnSetAutofilter.on('click',                        _.bind(this.onAutoFilter, this));
                toolbar.btnClearAutofilter.on('click',                      _.bind(this.onClearFilter, this));
            } else
            if ( me.appConfig.isEditOle ) {
                toolbar.btnUndo.on('click',                                 _.bind(this.onUndo, this));
                toolbar.btnRedo.on('click',                                 _.bind(this.onRedo, this));
                toolbar.btnCopy.on('click',                                 _.bind(this.onCopyPaste, this, 'copy'));
                toolbar.btnPaste.on('click',                                _.bind(this.onCopyPaste, this, 'paste'));
                toolbar.btnSearch.on('toggle',                              _.bind(this.onSearch, this));
                toolbar.btnInsertFormula.on('click',                        _.bind(this.onInsertFormulaMenu, this));
                toolbar.btnInsertFormula.menu.on('item:click',              _.bind(this.onInsertFormulaMenu, this));
                toolbar.cmbNumberFormat.on('selected',                      _.bind(this.onNumberFormatSelect, this));
                toolbar.cmbNumberFormat.on('show:before',                   _.bind(this.onNumberFormatOpenBefore, this, true));
                if (toolbar.cmbNumberFormat.cmpEl)
                    toolbar.cmbNumberFormat.cmpEl.on('click', '#id-toolbar-mnu-item-more-formats a', _.bind(this.onNumberFormatSelect, this));
                toolbar.btnWrap.on('click',                                 _.bind(this.onWrap, this));
                toolbar.btnTextColor.on('click',                            _.bind(this.onTextColor, this));
                toolbar.btnTextColor.on('color:select',                     _.bind(this.onTextColorSelect, this));
                toolbar.btnTextColor.on('auto:select',                      _.bind(this.onAutoFontColor, this));
                toolbar.btnTextColor.on('eyedropper:start',                 _.bind(this.onEyedropperStart, this));
                toolbar.btnTextColor.on('eyedropper:end',                   _.bind(this.onEyedropperEnd, this));
                toolbar.btnBackColor.on('click',                            _.bind(this.onBackColor, this));
                toolbar.btnBackColor.on('color:select',                     _.bind(this.onBackColorSelect, this));
                toolbar.btnBackColor.on('eyedropper:start',                 _.bind(this.onEyedropperStart, this));
                toolbar.btnBackColor.on('eyedropper:end',                  _.bind(this.onEyedropperEnd, this));
                toolbar.btnBorders.on('click',                              _.bind(this.onBorders, this));
                if (toolbar.btnBorders.rendered) {
                    toolbar.btnBorders.menu.on('item:click',                    _.bind(this.onBordersMenu, this));
                    toolbar.mnuBorderWidth.on('item:toggle',                    _.bind(this.onBordersWidth, this));
                    toolbar.mnuBorderColorPicker.on('select',                   _.bind(this.onBordersColor, this));
                    $('#id-toolbar-menu-auto-bordercolor').on('click',          _.bind(this.onAutoBorderColor, this));
                }
                toolbar.btnMerge.on('click',                                _.bind(this.onMergeCellsMenu, this, toolbar.btnMerge.menu, toolbar.btnMerge.menu.items[0]));
                toolbar.btnMerge.menu.on('item:click',                      _.bind(this.onMergeCellsMenu, this));
                toolbar.btnTableTemplate.menu.on('show:after',              _.bind(this.onTableTplMenuOpen, this));
                toolbar.btnCellStyle.menu.on('show:after',                  _.bind(this.onCellStyleMenuOpen, this));
                toolbar.btnVisibleArea.menu.on('item:click',              _.bind(this.onVisibleAreaMenu, this));
                toolbar.btnVisibleAreaClose.on('click',                   _.bind(this.onVisibleAreaClose, this));
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
                toolbar.btnTextFormatting.menu.on('item:click',             _.bind(this.onTextFormattingMenu, this));
                toolbar.btnHorizontalAlign.menu.on('item:click',            _.bind(this.onHorizontalAlignMenu, this));
                toolbar.btnVerticalAlign.menu.on('item:click',              _.bind(this.onVerticalAlignMenu, this));
            } else {
                toolbar.btnPrint.on('click',                                _.bind(this.onPrint, this));
                toolbar.btnPrint.on('disabled',                             _.bind(this.onBtnChangeState, this, 'print:disabled'));
                toolbar.btnPrint.menu && toolbar.btnPrint.menu.on('item:click', _.bind(this.onPrintMenu, this));
                toolbar.btnSave.on('click',                                 _.bind(this.onSave, this));
                toolbar.btnSave.on('disabled',                              _.bind(this.onBtnChangeState, this, 'save:disabled'));
                toolbar.btnUndo.on('click',                                 _.bind(this.onUndo, this));
                toolbar.btnUndo.on('disabled',                              _.bind(this.onBtnChangeState, this, 'undo:disabled'));
                toolbar.btnRedo.on('click',                                 _.bind(this.onRedo, this));
                toolbar.btnRedo.on('disabled',                              _.bind(this.onBtnChangeState, this, 'redo:disabled'));
                toolbar.btnCopy.on('click',                                 _.bind(this.onCopyPaste, this, 'copy'));
                toolbar.btnPaste.on('click',                                _.bind(this.onCopyPaste, this, 'paste'));
                toolbar.btnCut.on('click',                                  _.bind(this.onCopyPaste, this, 'cut'));
                toolbar.btnSelectAll.on('click',                            _.bind(this.onSelectAll, this));
                toolbar.btnReplace.on('click',                              _.bind(this.onReplace, this));
                toolbar.btnIncFontSize.on('click',                          _.bind(this.onIncreaseFontSize, this));
                toolbar.btnDecFontSize.on('click',                          _.bind(this.onDecreaseFontSize, this));
                toolbar.mnuChangeCase.on('item:click',                      _.bind(this.onChangeCase, this));
                toolbar.btnBold.on('click',                                 _.bind(this.onBold, this));
                toolbar.btnItalic.on('click',                               _.bind(this.onItalic, this));
                toolbar.btnUnderline.on('click',                            _.bind(this.onUnderline, this));
                toolbar.btnStrikeout.on('click',                            _.bind(this.onStrikeout, this));
                toolbar.btnSubscript.on('click',                            _.bind(this.onSubscript, this));
                toolbar.btnSubscript.menu.on('item:click',                  _.bind(this.onSubscriptMenu, this));
                toolbar.btnTextColor.on('click',                            _.bind(this.onTextColor, this));
                toolbar.btnTextColor.on('color:select',                     _.bind(this.onTextColorSelect, this));
                toolbar.btnTextColor.on('auto:select',                      _.bind(this.onAutoFontColor, this));
                toolbar.btnTextColor.on('eyedropper:start',                 _.bind(this.onEyedropperStart, this));
                toolbar.btnTextColor.on('eyedropper:end',                  _.bind(this.onEyedropperEnd, this));
                toolbar.btnBackColor.on('click',                            _.bind(this.onBackColor, this));
                toolbar.btnBackColor.on('color:select',                     _.bind(this.onBackColorSelect, this));
                toolbar.btnBackColor.on('eyedropper:start',                 _.bind(this.onEyedropperStart, this));
                toolbar.btnBackColor.on('eyedropper:end',                  _.bind(this.onEyedropperEnd, this));
                toolbar.mnuFormatCellFill && toolbar.mnuFormatCellFill.on('click', _.bind(this.onFormatCellFill, this));
                this.mode.isEdit && Common.NotificationCenter.on('eyedropper:start', _.bind(this.eyedropperStart, this));
                toolbar.btnBorders.on('click',                              _.bind(this.onBorders, this));
                if (toolbar.btnBorders.rendered) {
                    toolbar.btnBorders.menu.on('item:click',                    _.bind(this.onBordersMenu, this));
                    toolbar.mnuBorderWidth.on('item:toggle',                    _.bind(this.onBordersWidth, this));
                    toolbar.mnuBorderColorPicker.on('select',                   _.bind(this.onBordersColor, this));
                    $('#id-toolbar-menu-auto-bordercolor').on('click',          _.bind(this.onAutoBorderColor, this));
                }
                toolbar.btnAlignLeft.on('click',                            _.bind(this.onHorizontalAlign, this, AscCommon.align_Left));
                toolbar.btnAlignCenter.on('click',                          _.bind(this.onHorizontalAlign, this, AscCommon.align_Center));
                toolbar.btnAlignRight.on('click',                           _.bind(this.onHorizontalAlign, this, AscCommon.align_Right));
                toolbar.btnAlignJust.on('click',                            _.bind(this.onHorizontalAlign, this, AscCommon.align_Justify));
                toolbar.btnMerge.on('click',                                _.bind(this.onMergeCellsMenu, this, toolbar.btnMerge.menu, toolbar.btnMerge.menu.items[0]));
                toolbar.btnMerge.menu.on('item:click',                      _.bind(this.onMergeCellsMenu, this));
                toolbar.btnAlignTop.on('click',                             _.bind(this.onVerticalAlign, this, Asc.c_oAscVAlign.Top));
                toolbar.btnAlignMiddle.on('click',                          _.bind(this.onVerticalAlign, this, Asc.c_oAscVAlign.Center));
                toolbar.btnAlignBottom.on('click',                          _.bind(this.onVerticalAlign, this, Asc.c_oAscVAlign.Bottom));
                toolbar.btnWrap.on('click',                                 _.bind(this.onWrap, this));
                toolbar.btnTextOrient.menu.on('item:click',                 _.bind(this.onTextOrientationMenu, this));
                toolbar.btnInsertTable.on('click',                          _.bind(this.onBtnInsertTableClick, this));
                toolbar.btnInsertImage.menu.on('item:click',                _.bind(this.onInsertImageMenu, this));
                toolbar.btnInsertHyperlink.on('click',                      _.bind(this.onHyperlink, this));
                toolbar.btnInsertText.on('click',                           _.bind(this.onBtnInsertTextClick, this));
                toolbar.btnInsertText.menu.on('item:click',                 _.bind(this.onMenuInsertTextClick, this));
                toolbar.btnInsertShape.menu.on('hide:after',                _.bind(this.onInsertShapeHide, this));
                toolbar.btnInsertEquation.on('click',                       _.bind(this.onInsertEquationClick, this));
                toolbar.btnInsertSymbol.menu.items[2].on('click',           _.bind(this.onInsertSymbolClick, this));
                toolbar.mnuInsertSymbolsPicker.on('item:click',             _.bind(this.onInsertSymbolItemClick, this));
                toolbar.btnInsertSlicer.on('click',                         _.bind(this.onInsertSlicerClick, this));
                toolbar.btnTableTemplate.menu.on('show:after',              _.bind(this.onTableTplMenuOpen, this));
                toolbar.btnPercentStyle.on('click',                         _.bind(this.onNumberFormat, this));
                toolbar.btnCommaStyle.on('click',                           _.bind(this.onNumberFormat, this));
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
                toolbar.btnColorSchemas.menu.on('show:after',               _.bind(this.onColorSchemaShow, this));
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
                $('#id-toolbar-menu-new-bordercolor').on('click',           _.bind(this.onNewBorderColor, this));
                toolbar.btnPageOrient.menu.on('item:click',                 _.bind(this.onPageOrientSelect, this));
                toolbar.btnPageMargins.menu.on('item:click',                _.bind(this.onPageMarginsSelect, this));
                toolbar.mnuPageSize.on('item:click',                        _.bind(this.onPageSizeClick, this));
                toolbar.mnuScale.on('item:click',                           _.bind(this.onScaleClick, this, 'scale'));
                toolbar.menuWidthScale.on('item:click',                     _.bind(this.onScaleClick, this, 'width'));
                toolbar.menuHeightScale.on('item:click',                    _.bind(this.onScaleClick, this, 'height'));
                toolbar.btnPrintArea.menu.on('item:click',                  _.bind(this.onPrintAreaClick, this));
                toolbar.btnPrintArea.menu.on('show:after',                  _.bind(this.onPrintAreaMenuOpen, this));
                toolbar.btnPageBreak.menu.on('item:click',                  _.bind(this.onPageBreakClick, this));
                toolbar.btnPageBreak.menu.on('show:after',                  _.bind(this.onPageBreakMenuOpen, this));
                toolbar.btnImgGroup.menu.on('item:click',                   _.bind(this.onImgGroupSelect, this));
                toolbar.btnImgBackward.menu.on('item:click',                _.bind(this.onImgArrangeSelect, this));
                toolbar.btnImgForward.menu.on('item:click',                 _.bind(this.onImgArrangeSelect, this));
                toolbar.btnImgAlign.menu.on('item:click',                   _.bind(this.onImgAlignSelect, this));
                toolbar.btnImgForward.on('click',                           this.onImgArrangeSelect.bind(this, 'forward'));
                toolbar.btnImgBackward.on('click',                          this.onImgArrangeSelect.bind(this, 'backward'));
                toolbar.btnsEditHeader.forEach(function(button) {
                    button.on('click', _.bind(me.onEditHeaderClick, me, undefined));
                });
                toolbar.btnPrintTitles.on('click',                          _.bind(this.onPrintTitlesClick, this));
                toolbar.chPrintGridlines.on('change',                        _.bind(this.onPrintGridlinesChange, this));
                toolbar.chPrintHeadings.on('change',                         _.bind(this.onPrintHeadingsChange, this));
                if (toolbar.btnCondFormat.rendered) {
                    toolbar.btnCondFormat.menu.on('show:before',            _.bind(this.onShowBeforeCondFormat, this, this.toolbar, 'toolbar'));
                }
                toolbar.btnInsertChartRecommend.on('click',                 _.bind(this.onChartRecommendedClick, this));
                toolbar.btnFillNumbers.menu.on('item:click',                _.bind(this.onFillNumMenu, this));
                toolbar.btnFillNumbers.menu.on('show:before',               _.bind(this.onShowBeforeFillNumMenu, this));
                Common.Gateway.on('insertimage',                      _.bind(this.insertImage, this));

                this.onSetupCopyStyleButton();
                this.onBtnChangeState('undo:disabled', toolbar.btnUndo, toolbar.btnUndo.isDisabled());
                this.onBtnChangeState('redo:disabled', toolbar.btnRedo, toolbar.btnRedo.isDisabled());
            }
        },

        setApi: function(api) {
            this.api = api;

            var config = SSE.getController('Main').appOptions;
            if (config.isEdit) {
                if ( !config.isEditDiagram  && !config.isEditMailMerge  && !config.isEditOle ) {
                    this.api.asc_registerCallback('asc_onSendThemeColors',      _.bind(this.onSendThemeColors, this));
                    this.api.asc_registerCallback('asc_onMathTypes',            _.bind(this.onApiMathTypes, this));
                    this.api.asc_registerCallback('asc_onContextMenu',          _.bind(this.onContextMenu, this));
                    Common.NotificationCenter.on('storage:image-load',          _.bind(this.openImageFromStorage, this));
                    Common.NotificationCenter.on('storage:image-insert',        _.bind(this.insertImageFromStorage, this));
                    this.api.asc_registerCallback('asc_onSelectionMathChanged',   _.bind(this.onApiMathChanged, this));
                }
                this.api.asc_registerCallback('asc_onInitEditorStyles',     _.bind(this.onApiInitEditorStyles, this));
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',_.bind(this.onApiCoAuthoringDisconnect, this));
                Common.NotificationCenter.on('api:disconnect',              _.bind(this.onApiCoAuthoringDisconnect, this));
                this.api.asc_registerCallback('asc_onLockDefNameManager',   _.bind(this.onLockDefNameManager, this));
                this.api.asc_registerCallback('asc_onLockCFManager',        _.bind(this.onLockCFManager, this));
                this.api.asc_registerCallback('asc_onUnLockCFManager',      _.bind(this.onUnLockCFManager, this));
                this.api.asc_registerCallback('asc_onZoomChanged',          _.bind(this.onApiZoomChange, this));
                Common.NotificationCenter.on('fonts:change',                _.bind(this.onApiChangeFont, this));
                this.api.asc_registerCallback('asc_onBeginSmartArtPreview', _.bind(this.onApiBeginSmartArtPreview, this));
                this.api.asc_registerCallback('asc_onAddSmartArtPreview', _.bind(this.onApiAddSmartArtPreview, this));
                this.api.asc_registerCallback('asc_onEndSmartArtPreview', _.bind(this.onApiEndSmartArtPreview, this));
            } else if (config.isEditOle) {
                Common.NotificationCenter.on('fonts:change',                _.bind(this.onApiChangeFont, this));
            } else if (config.isRestrictedEdit) {
                this.api.asc_registerCallback('asc_onSelectionChanged',     _.bind(this.onApiSelectionChangedRestricted, this));
                Common.NotificationCenter.on('protect:wslock',              _.bind(this.onChangeProtectSheet, this));
            }
            if ( !config.isEditDiagram  && !config.isEditMailMerge  && !config.isEditOle )
                this.api.asc_registerCallback('onPluginToolbarMenu', _.bind(this.onPluginToolbarMenu, this));
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

        onApiChangeFont: function(font) {
            !Common.Utils.ModalWindow.isVisible() && this.toolbar.cmbFontName.onApiChangeFont(font);
        },

        onContextMenu: function() {
            this.toolbar.collapse();
        },

        onPrint: function(e) {
            if (this.toolbar.btnPrint.options.printType == 'print') {
                Common.NotificationCenter.trigger('print', this.toolbar);
            } else {
                var _main = this.getApplication().getController('Main');
                _main.onPrintQuick();
            }
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

        onSave: function(e) {
            if (this.api) {
                var isModified = this.api.asc_isDocumentCanSave();
                var isSyncButton = this.toolbar.btnCollabChanges && this.toolbar.btnCollabChanges.cmpEl.hasClass('notify');
                if (!isModified && !isSyncButton && !this.toolbar.mode.forcesave && !this.toolbar.mode.canSaveDocumentToBinary)
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

        onCopyPaste: function(type, e) {
            var me = this;
            if (me.api) {
                var res = (type === 'cut') ? me.api.asc_Cut() : ((type === 'copy') ? me.api.asc_Copy() : me.api.asc_Paste());
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

        onSelectAll: function(e) {
            if (this.api)
                this.api.asc_EditSelectAll();

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Select All');
        },

        onReplace: function(e) {
            this.getApplication().getController('LeftMenu').onShortcut('replace');
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

        onChangeCase: function(menu, item, e) {
            if (this.api)
                this.api.asc_ChangeTextCase(item.value);
            Common.NotificationCenter.trigger('edit:complete', this.toolbar, {restorefocus:true});
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

            Common.NotificationCenter.trigger('edit:complete', this.toolbar, {restorefocus:true});
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

            Common.NotificationCenter.trigger('edit:complete', this.toolbar, {restorefocus:true});
            Common.component.Analytics.trackEvent('ToolBar', (subscript) ? 'Subscript' : 'Superscript');
        },

        onTextColor: function() {
            this.toolbar.mnuTextColorPicker.trigger('select', this.toolbar.mnuTextColorPicker, this.toolbar.mnuTextColorPicker.currentColor);
        },

        onBackColor: function() {
            this.toolbar.mnuBackColorPicker.trigger('select', this.toolbar.mnuBackColorPicker, this.toolbar.mnuBackColorPicker.currentColor);
        },

        onTextColorSelect: function(btn, color) {
            this._state.clrtext_asccolor = this._state.clrtext = undefined;

            this.toolbar.btnTextColor.currentColor = color;

            this.toolbar.mnuTextColorPicker.currentColor = color;
            if (this.api) {
                this.api.asc_setCellTextColor(color.isAuto ? color.color : Common.Utils.ThemeColor.getRgbColor(color));
            }

            Common.NotificationCenter.trigger('edit:complete', this.toolbar, {restorefocus:true});
            Common.component.Analytics.trackEvent('ToolBar', 'Text Color');
        },

        onBackColorSelect: function(btn, color) {
            this._state.clrshd_asccolor = this._state.clrback = undefined;

            this.toolbar.btnBackColor.currentColor = color;

            this.toolbar.mnuBackColorPicker.currentColor = color;
            if (this.api) {
                this.api.asc_setCellBackgroundColor(color == 'transparent' ? null : Common.Utils.ThemeColor.getRgbColor(color));
            }

            Common.component.Analytics.trackEvent('ToolBar', 'Background Color');
        },

        onFormatCellFill: function(picker, color) {
            this.getApplication().getController('RightMenu').onRightMenuOpen(Common.Utils.documentSettingsType.Cell);
        },

        onNewBorderColor: function(picker, color) {
            this.toolbar.btnBorders.menu.hide();
            this.toolbar.btnBorders.toggle(false, true);
            this.toolbar.mnuBorderColorPicker.addNewColor();
        },

        onAutoFontColor: function(e) {
            this._state.clrtext_asccolor = this._state.clrtext = undefined;

            var color = new Asc.asc_CColor();
            color.put_auto(true);

            this.toolbar.btnTextColor.currentColor = {color: color, isAuto: true};
            this.toolbar.mnuTextColorPicker.currentColor = {color: color, isAuto: true};
            if (this.api) {
                this.api.asc_setCellTextColor(color);
            }

            Common.NotificationCenter.trigger('edit:complete', this.toolbar, {restorefocus:true});
            Common.component.Analytics.trackEvent('ToolBar', 'Text Color');
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
            } else if (item.value==='options')
                this.getApplication().getController('RightMenu').onRightMenuOpen(Common.Utils.documentSettingsType.Cell);
        },

        onBordersWidth: function(menu, item, state) {
            if (state) {
                this.toolbar.btnBorders.options.borderswidth = item.value;

                Common.NotificationCenter.trigger('edit:complete', this.toolbar);
                Common.component.Analytics.trackEvent('ToolBar', 'Border Width');
            }
        },

        onBordersColor: function(picker, color) {
            $('#id-toolbar-mnu-item-border-color > a .menu-item-icon').css('border-color', '#' + ((typeof(color) == 'object') ? color.color : color));
            this.toolbar.mnuBorderColor.onUnHoverItem();
            this.toolbar.btnBorders.options.borderscolor = Common.Utils.ThemeColor.getRgbColor(color);
            this.toolbar.mnuBorderColorPicker.currentColor = color;
            var clr_item = this.toolbar.btnBorders.menu.$el.find('#id-toolbar-menu-auto-bordercolor > a');
            clr_item.hasClass('selected') && clr_item.removeClass('selected');

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Border Color');
        },

        onAutoBorderColor: function(e) {
            $('#id-toolbar-mnu-item-border-color > a .menu-item-icon').css('border-color', '#000');
            this.toolbar.mnuBorderColor.onUnHoverItem();
            var color = new Asc.asc_CColor();
            color.put_auto(true);
            this.toolbar.btnBorders.options.borderscolor = color;
            this.toolbar.mnuBorderColorPicker.clearSelection();
            this.toolbar.mnuBorderColorPicker.currentColor = {color: color, isAuto: true};
            var clr_item = this.toolbar.btnBorders.menu.$el.find('#id-toolbar-menu-auto-bordercolor > a');
            !clr_item.hasClass('selected') && clr_item.addClass('selected');

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
                var merged = me.api.asc_getCellInfo().asc_getMerge();
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
                var angle = 0;

                if (item.value==='options') {
                    this.getApplication().getController('RightMenu').onRightMenuOpen(Common.Utils.documentSettingsType.Cell);
                    return;
                }

                switch (item.value) {
                    case 'countcw':     angle =  45;    break;
                    case 'clockwise':   angle = -45;    break;
                    case 'vertical':    angle =  255;    break;
                    case 'rotateup':    angle =  90;    break;
                    case 'rotatedown':  angle = -90;    break;
                }

                this._state.angle = undefined;
                if (this.api)
                    this.api.asc_setCellAngle(angle);

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Text orientation');
        },

        onBtnInsertTableClick: function(btn, e) {
            if (this.api)
                this._setTableFormat(this.api.asc_getDefaultTableStyle());
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Table');
        },

        onInsertImageMenu: function(menu, item, e) {
            var me = this;
            if (item.value === 'file') {
                this.toolbar.fireEvent('insertimage', this.toolbar);

                if (this.api)
                    setTimeout(function() {me.api.asc_addImage();}, 1);

                Common.NotificationCenter.trigger('edit:complete', this.toolbar);
                Common.component.Analytics.trackEvent('ToolBar', 'Image');
            } else if (item.value === 'url') {
                (new Common.Views.ImageFromUrlDialog({
                    handler: function(result, value) {
                        if (result == 'ok') {
                            if (me.api) {
                                var checkUrl = value.replace(/\s/g, '');
                                if (!_.isEmpty(checkUrl)) {
                                    me.toolbar.fireEvent('insertimage', me.toolbar);
                                    me.api.asc_addImageDrawingObject([checkUrl]);

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
                (data._urls.length>0) && this.api.asc_addImageDrawingObject(data._urls, undefined, data.token);// for loading from storage
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

        onHyperlink: function(btn) {
            Common.NotificationCenter.trigger('protect:check', this.onHyperlinkCallback, this, [btn]);
        },

        onHyperlinkCallback: function(btn) {
            var me = this;
            var win,
                props;

            if (me.api) {
                var wc = me.api.asc_getWorksheetsCount(),
                    i = -1,
                    items = [];

                while (++i < wc) {
                    items.push({name: me.api.asc_getWorksheetName(i), hidden: me.api.asc_isWorksheetHidden(i)});
                }

                var handlerDlg = function(dlg, result) {
                    if (result == 'ok') {
                        props = dlg.getSettings();
                        me.api.asc_insertHyperlink(props);
                    }

                    Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                };

                var cell = me.api.asc_getCellInfo(),
                    seltype = cell.asc_getSelectionType();
                props = cell.asc_getHyperlink();
                win = new SSE.Views.HyperlinkSettingsDialog({
                    api: me.api,
                    appOptions: me.appOptions,
                    handler: handlerDlg
                });

                win.show();
                win.setSettings({
                    sheets  : items,
                    ranges  : me.api.asc_getDefinedNames(Asc.c_oAscGetDefinedNamesList.All, true),
                    currentSheet: me.api.asc_getActiveWorksheetIndex(),
                    props   : props,
                    text    : cell.asc_getText(),
                    isLock  : cell.asc_getLockText(),
                    allowInternal: (seltype!==Asc.c_oAscSelectionType.RangeImage && seltype!==Asc.c_oAscSelectionType.RangeShape &&
                                    seltype!==Asc.c_oAscSelectionType.RangeShapeText && seltype!==Asc.c_oAscSelectionType.RangeChart &&
                                    seltype!==Asc.c_oAscSelectionType.RangeChartText && seltype!==Asc.c_oAscSelectionType.RangeSlicer )
                });
            }

            Common.component.Analytics.trackEvent('ToolBar', 'Add Hyperlink');
        },

        onEditChart: function(btn) {
            if (!this.editMode || !Common.Controllers.LaunchController.isScriptLoaded()) return;
            var me = this, info = me.api.asc_getCellInfo();
            var selectType = info.asc_getSelectionType();
            if (selectType !== Asc.c_oAscSelectionType.RangeImage) {
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
                        var ischartedit = ( me.toolbar.mode.isEditDiagram || selectType === Asc.c_oAscSelectionType.RangeChart || selectType === Asc.c_oAscSelectionType.RangeChartText);

                        (new SSE.Views.ChartSettingsDlg(
                            {
                                chartSettings: props,
                                imageSettings: imageSettings,
                                // isDiagramMode: me.toolbar.mode.isEditDiagram,
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

        onEditChartData: function(btn) {
            if (!this.editMode) return;

            var me = this;
            var props;
            if (me.api){
                props = me.api.asc_getChartObject();
                if (props) {
                    me._isEditRanges = true;
                    props.startEdit();
                    var win = new SSE.Views.ChartDataDialog({
                        chartSettings: props,
                        api: me.api,
                        handler: function(result, value) {
                            if (result == 'ok') {
                                props.endEdit();
                                me._isEditRanges = false;
                            }
                            Common.NotificationCenter.trigger('edit:complete', me);
                        }
                    }).on('close', function() {
                        me._isEditRanges && props.cancelEdit();
                        me._isEditRanges = false;
                    });
                    win.show();
                }
            }
        },

        onEditChartType: function(btn) {
            if (!this.editMode || !Common.Controllers.LaunchController.isScriptLoaded()) return;

            var me = this;
            var props;
            if (me.api){
                props = me.api.asc_getChartObject();
                if (props) {
                    me._isEditType = true;
                    props.startEdit();
                    var win = new SSE.Views.ChartTypeDialog({
                        chartSettings: props,
                        api: me.api,
                        handler: function(result, value) {
                            if (result == 'ok') {
                                props.endEdit();
                                me._isEditType = false;
                            }
                            Common.NotificationCenter.trigger('edit:complete', me);
                        }
                    }).on('close', function() {
                        me._isEditType && props.cancelEdit();
                        me._isEditType = false;
                    });
                    win.show();
                }
            }
        },

        onSelectChart: function(group, type) {
            if (!this.editMode) return;
            var me = this,
                info = me.api.asc_getCellInfo(),
                seltype = info.asc_getSelectionType();

            if (me.api) {
                var win, props;
                var ischartedit = ( seltype == Asc.c_oAscSelectionType.RangeChart || seltype == Asc.c_oAscSelectionType.RangeChartText);
                props = me.api.asc_getChartObject(true); // don't lock chart object
                if (props) {
                    if (ischartedit)
                        props.changeType(type);
                    else {
                        props.putType(type);
                        var range = props.getRange(),
                            isvalid = (!_.isEmpty(range)) ? me.api.asc_checkDataRange(Asc.c_oAscSelectionDialogType.Chart, range, true, props.getInRows(), props.getType()) : Asc.c_oAscError.ID.No;
                        if (isvalid == Asc.c_oAscError.ID.No) {
                            me.api.asc_addChartDrawingObject(props);
                        } else {
                            var msg = me.txtInvalidRange;
                            switch (isvalid) {
                                case Asc.c_oAscError.ID.StockChartError:
                                    msg = me.errorStockChart;
                                    break;
                                case Asc.c_oAscError.ID.MaxDataSeriesError:
                                    msg = me.errorMaxRows;
                                    break;
                                case Asc.c_oAscError.ID.ComboSeriesError:
                                    msg = me.errorComboSeries;
                                    break;
                                case Asc.c_oAscError.ID.MaxDataPointsError:
                                    msg = me.errorMaxPoints;
                                    break;
                            }
                            Common.UI.warning({
                                msg: msg,
                                callback: function () {
                                    _.defer(function (btn) {
                                        Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                                    })
                                }
                            });
                        }
                    }
                }
            }
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onSelectSpark: function(type) {
            if (!this.editMode) return;
            var me = this,
                info = me.api.asc_getCellInfo(),
                seltype = info.asc_getSelectionType();

            if (me.api) {
                if (seltype==Asc.c_oAscSelectionType.RangeCells || seltype==Asc.c_oAscSelectionType.RangeCol ||
                    seltype==Asc.c_oAscSelectionType.RangeRow || seltype==Asc.c_oAscSelectionType.RangeMax) {
                    var sparkLineInfo = info.asc_getSparklineInfo();
                    if (!!sparkLineInfo) {
                        var props = new Asc.sparklineGroup();
                        props.asc_setType(type);
                        this.api.asc_setSparklineGroup(sparkLineInfo.asc_getId(), props);
                    } else {
                        var me = this;
                        (new SSE.Views.CreateSparklineDialog(
                            {
                                api: me.api,
                                props: {selectedCells: me._state.selectedCells},
                                handler: function(result, settings) {
                                    if (result == 'ok' && settings) {
                                        me.view && me.view.fireEvent('insertspark', me.view);
                                        if (settings.destination)
                                            me.api.asc_addSparklineGroup(type, settings.source, settings.destination);
                                    }
                                    Common.NotificationCenter.trigger('edit:complete', me);
                                }
                            })).show();
                    }
                }
            }
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onApiMathChanged: function(info) {
            this._state.selectedCells = info.asc_getCount(); // not empty cells
        },

        onInsertTextart: function (data) {
            if (this.api) {
                this.toolbar.fireEvent('inserttextart', this.toolbar);
                this.api.asc_addTextArt(data);

                if (this.toolbar.btnInsertShape.pressed)
                    this.toolbar.btnInsertShape.toggle(false, true);

                Common.NotificationCenter.trigger('edit:complete', this.toolbar, this.toolbar.btnInsertTextArt);
                Common.component.Analytics.trackEvent('ToolBar', 'Add Text Art');
            }
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
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onSortType: function(type, btn) {
            Common.NotificationCenter.trigger('protect:check', this.onSortTypeCallback, this, [type, btn]);
        },

        onSortTypeCallback: function(type, btn) {
            if (this.api) {
                if (this.api.asc_getCellInfo().asc_getSelectionType()==Asc.c_oAscSelectionType.RangeSlicer) {
                    var selectedObjects = this.api.asc_getGraphicObjectProps();
                    for (var i = 0; i < selectedObjects.length; i++) {
                        if (selectedObjects[i].asc_getObjectType() == Asc.c_oAscTypeSelectElement.Image) {
                            var elValue = selectedObjects[i].asc_getObjectValue();
                            if ( elValue.asc_getSlicerProperties() ) {
                                elValue.asc_getSlicerProperties().asc_setSortOrder(type==Asc.c_oAscSortOptions.Ascending ? Asc.ST_tabularSlicerCacheSortOrder.Ascending : Asc.ST_tabularSlicerCacheSortOrder.Descending);
                                this.api.asc_setGraphicObjectProps(elValue);
                                break;
                            }
                        }
                    }
                    Common.NotificationCenter.trigger('edit:complete', this.toolbar);
                } else {
                    var me = this;
                    var res = this.api.asc_sortCellsRangeExpand();
                    switch (res) {
                        case Asc.c_oAscSelectionSortExpand.showExpandMessage:
                            var config = {
                                width: 500,
                                title: this.txtSorting,
                                msg: this.txtExpandSort,
                                buttons: [  {caption: this.txtExpand, primary: true, value: 'expand'},
                                    {caption: this.txtSortSelected, value: 'sort'},
                                    'cancel'],
                                callback: function(btn){
                                    if (btn == 'expand' || btn == 'sort') {
                                        me.api.asc_sortColFilter(type, '', undefined, undefined, btn == 'expand')
                                    }
                                }
                            };
                            Common.UI.alert(config);
                            break;
                        case Asc.c_oAscSelectionSortExpand.showLockMessage:
                            var config = {
                                width: 500,
                                title: this.txtSorting,
                                msg: this.txtLockSort,
                                buttons: ['yes', 'no'],
                                primary: 'yes',
                                callback: function(btn){
                                    (btn == 'yes') && me.api.asc_sortColFilter(type, '', undefined, undefined, false);
                                }
                            };
                            Common.UI.alert(config);
                            break;
                        case Asc.c_oAscSelectionSortExpand.expandAndNotShowMessage:
                        case Asc.c_oAscSelectionSortExpand.notExpandAndNotShowMessage:
                            this.api.asc_sortColFilter(type, '', undefined, undefined, res === Asc.c_oAscSelectionSortExpand.expandAndNotShowMessage);
                            break;
                    }
                }
            }
        },

        searchShow: function () {
            if (this.toolbar.btnSearch) {
                if (this.searchBar && this.searchBar.isVisible()) {
                    this.searchBar.focus();
                    return;
                }
                this.toolbar.btnSearch.toggle(true);
            }
        },

        onSearch: function(type, btn) {
            if (!this.searchBar) {
                this.searchBar = new Common.UI.SearchBar({
                    showOpenPanel: false,
                    width: 303
                });
                this.searchBar.on('hide', _.bind(function () {
                    this.toolbar.btnSearch.toggle(false, true);
                }, this));
            }
            if (this.toolbar.btnSearch.pressed) {
                this.searchBar.show(this.api.asc_GetSelectedText());
            } else {
                this.searchBar.hide();
            }
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
                if (item.value == -1) {
                    // show more formats
                    if (this._state.numformatinfo && this._state.numformatinfo.asc_getType()==Asc.c_oAscNumFormatType.Accounting)
                        this.onCustomNumberFormat();
                    else {
                        var value = this.api.asc_getLocale();
                        (!value) && (value = ((this.toolbar.mode.lang) ? parseInt(Common.util.LanguageInfo.getLocalLanguageCode(this.toolbar.mode.lang)) : 0x0409));

                        var info = new Asc.asc_CFormatCellsInfo();
                        info.asc_setType(Asc.c_oAscNumFormatType.Accounting);
                        info.asc_setSeparator(false);
                        info.asc_setSymbol(value);
                        var format = this.api.asc_getFormatCells(info);
                        this.onCustomNumberFormat((format && format.length>0) ? format[0] : undefined, info);
                    }
                } else {
                    var info = new Asc.asc_CFormatCellsInfo();
                    info.asc_setType(Asc.c_oAscNumFormatType.Accounting);
                    info.asc_setSeparator(false);
                    info.asc_setSymbol(item.value);
                    var format = this.api.asc_getFormatCells(info);
                    if (format && format.length>0)
                        this.api.asc_setCellFormat(format[0]);
                }
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

        onCustomNumberFormat: function(format, formatInfo) {
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
                props   : {format: format ? format : me._state.numformat, formatInfo: formatInfo ? formatInfo : me._state.numformatinfo, langId: value}
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
                    this.toolbar.fireEvent('function:apply', [{name: this.api.asc_getFormulaLocaleName(item.value), origin: item.value}, true]);

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
                                me.api.asc_insertInCell(settings.asc_getName(true), (settings.asc_getType()===Asc.c_oAscDefNameType.table) ? Asc.c_oAscPopUpSelectorType.Table : Asc.c_oAscPopUpSelectorType.Range, false);
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

        onNamedRangeMenuOpen: function(menu) {
            if (this.api && menu) {
                var names = this.api.asc_getDefinedNames(Asc.c_oAscGetDefinedNamesList.WorksheetWorkbook);
                menu.items[2].setDisabled(names.length<1 || this._state.isUserProtected);
            }
        },

        onClearStyleMenu: function(menu, item, e) {
            if (item.value == Asc.c_oAscCleanOptions.Format && (!this._state.wsProps['FormatCells'] || !this.api.asc_checkLockedCells()) ||
                item.value == Asc.c_oAscCleanOptions.All && !this.api.asc_checkLockedCells())
                this.onClearStyleMenuCallback(menu, item);
            else if (item.value == Asc.c_oAscCleanOptions.Comments) {
                this._state.wsProps['Objects'] ? Common.NotificationCenter.trigger('showerror', Asc.c_oAscError.ID.ChangeOnProtectedSheet, Asc.c_oAscError.Level.NoCritical) : this.onClearStyleMenuCallback(menu, item);
            } else
                Common.NotificationCenter.trigger('protect:check', this.onClearStyleMenuCallback, this, [menu, item]);
        },

        onClearStyleMenuCallback: function(menu, item, e) {
            if (this.api) {
                if (item.value == Asc.c_oAscCleanOptions.Comments) {
                    this.api.asc_RemoveAllComments(!this.mode.canDeleteComments, true);// 1 param = true if remove only my comments, 2 param - remove current comments
                } else
                    this.api.asc_emptyCells(item.value, item.value == Asc.c_oAscCleanOptions.All && !this.mode.canDeleteComments);
            }

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
                                this.api.asc_setCellFontName(record.name);
                                Common.component.Analytics.trackEvent('ToolBar', 'Font Name');
                            } else {
                                this.toolbar.cmbFontName.setValue(this.api.asc_getCellInfo().asc_getXfs().asc_getFontName());
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

        onShowBeforeCondFormat: function(cmp, id) {
            if (cmp.mnuDataBars.menu.items.length>0) // menu is inited
                return;

            cmp.btnCondFormat.menu.on('item:click', _.bind(this.onCondFormatMenu, this));
            for (var i=0; i<7; i++) {
                cmp.btnCondFormat.menu.items[i].menu.on('item:click', _.bind(this.onCondFormatMenu, this));
            }
            cmp.btnCondFormat.menu.items[15].menu.on('item:click', _.bind(this.onCondFormatMenu, this));

            var collectionPresets = SSE.getCollection('ConditionalFormatIconsPresets');
            if (collectionPresets.length<1)
                SSE.getController('Main').fillCondFormatIconsPresets(this.api.asc_getCFIconsByType());

            var collectionIcons = SSE.getCollection('ConditionalFormatIcons');
            if (collectionIcons.length<1)
                SSE.getController('Main').fillCondFormatIcons(this.api.asc_getFullCFIcons());


            var me = this;
            var menuItem = cmp.mnuDataBars;
            menuItem.menu.addItem(new Common.UI.MenuItem({
                template: _.template('<div id="id-' + id + '-menu-databar" class="menu-shapes margin-left-5" style="width: 203px;"></div>')
            }));
            var picker = new Common.UI.DataViewSimple({
                el: $('#id-' + id + '-menu-databar', menuItem.$el),
                parentMenu: menuItem.menu,
                itemTemplate: _.template('<div class="item-databar" id="<%= id %>"><svg width="25" height="25" class=\"icon uni-scale\"><use xlink:href=\"#bar-<%= data.name %>\"></use></svg></div>')
            });
            picker.on('item:click', function(picker, item, record, e) {
                if (me.api) {
                    if (record) {
                        me.api.asc_setCF([], [], [Asc.c_oAscCFRuleTypeSettings.dataBar, record.get('data').index]);
                    }
                    if (e.type !== 'click')
                        cmp.btnCondFormat.menu.hide();
                    Common.NotificationCenter.trigger('edit:complete', cmp, cmp.btnCondFormat);
                }
            });
            var arr = [
                { data: {name: 'gradient-blue', index: 0} },
                { data: {name: 'gradient-green', index: 1} },
                { data: {name: 'gradient-red', index: 2} },
                { data: {name: 'gradient-yellow', index: 3} },
                { data: {name: 'gradient-lightblue', index: 4} },
                { data: {name: 'gradient-purple', index: 5} },
                { data: {name: 'solid-blue', index: 6} },
                { data: {name: 'solid-green', index: 7} },
                { data: {name: 'solid-red', index: 8} },
                { data: {name: 'solid-yellow', index: 9} },
                { data: {name: 'solid-lightblue', index: 10} },
                { data: {name: 'solid-purple', index: 11} }
            ];
            picker.setStore(new Common.UI.DataViewStore(arr));

            menuItem = cmp.mnuColorScales;
            menuItem.menu.addItem(new Common.UI.MenuItem({
                template: _.template('<div id="id-' + id + '-menu-colorscales" class="menu-shapes margin-left-5" style="width: 136px;"></div>')
            }));
            picker = new Common.UI.DataViewSimple({
                el: $('#id-' + id + '-menu-colorscales', menuItem.$el),
                parentMenu: menuItem.menu,
                itemTemplate: _.template('<div class="item-colorscale" id="<%= id %>"><svg width="25" height="25" class=\"icon uni-scale\"><use xlink:href=\"#color-scale-<%= data.name %>\"></use></svg></div>')
            });
            picker.on('item:click', function(picker, item, record, e) {
                if (me.api) {
                    if (record) {
                        me.api.asc_setCF([], [], [Asc.c_oAscCFRuleTypeSettings.colorScale, record.get('data').index]);
                    }
                    if (e.type !== 'click')
                        cmp.btnCondFormat.menu.hide();
                    Common.NotificationCenter.trigger('edit:complete', cmp, cmp.btnCondFormat);
                }
            });
            arr = [
                { data: {name: 'green-yellow-red', index: 0} },
                { data: {name: 'red-yellow-green', index: 1} },
                { data: {name: 'green-white-red', index: 2} },
                { data: {name: 'red-white-green', index: 3} },
                { data: {name: 'blue-white-red', index: 4} },
                { data: {name: 'red-white-blue', index: 5} },
                { data: {name: 'white-red', index: 6} },
                { data: {name: 'red-white', index: 7} },
                { data: {name: 'green-white', index: 8} },
                { data: {name: 'white-green', index: 9} },
                { data: {name: 'green-yellow', index: 10} },
                { data: {name: 'yellow-green', index: 11} }
            ];
            picker.setStore(new Common.UI.DataViewStore(arr));

            menuItem = cmp.mnuIconSets;
            menuItem.menu.addItem(new Common.UI.MenuItem({
                template: _.template('<div id="id-' + id + '-menu-iconsets" class="menu-iconsets" style="width: 227px;"></div>')
            }));
            arr = [];
            var indexes = [Asc.EIconSetType.Arrows3, Asc.EIconSetType.Arrows3Gray, Asc.EIconSetType.Triangles3, Asc.EIconSetType.Arrows4Gray, Asc.EIconSetType.Arrows4, Asc.EIconSetType.Arrows5Gray, Asc.EIconSetType.Arrows5];
            for (var i=0; i<indexes.length; i++) {
                arr.push({group: 'menu-iconset-group-direct', data: {index: indexes[i], iconSet: collectionPresets.at([indexes[i]]).get('icons'), icons: collectionIcons}});
            }
            indexes = [Asc.EIconSetType.Traffic3Lights1, Asc.EIconSetType.Traffic3Lights2, Asc.EIconSetType.Signs3, Asc.EIconSetType.Traffic4Lights, Asc.EIconSetType.RedToBlack4];
            for (var i=0; i<indexes.length; i++) {
                arr.push({group: 'menu-iconset-group-shape', data: {index: indexes[i], iconSet: collectionPresets.at([indexes[i]]).get('icons'), icons: collectionIcons}});
            }
            indexes = [Asc.EIconSetType.Symbols3, Asc.EIconSetType.Symbols3_2, Asc.EIconSetType.Flags3];
            for (var i=0; i<indexes.length; i++) {
                arr.push({group: 'menu-iconset-group-indicator', data: {index: indexes[i], iconSet: collectionPresets.at([indexes[i]]).get('icons'), icons: collectionIcons}});
            }
            indexes = [Asc.EIconSetType.Stars3, Asc.EIconSetType.Rating4, Asc.EIconSetType.Quarters5, Asc.EIconSetType.Rating5, Asc.EIconSetType.Boxes5];
            for (var i=0; i<indexes.length; i++) {
                arr.push({group: 'menu-iconset-group-rating', data: {index: indexes[i], iconSet: collectionPresets.at([indexes[i]]).get('icons'), icons: collectionIcons}});
            }
            picker = new Common.UI.DataView({
                el: $('#id-' + id + '-menu-iconsets', menuItem.$el),
                parentMenu: menuItem.menu,
                groups: new Common.UI.DataViewGroupStore([
                    {id: 'menu-iconset-group-direct', caption: this.textDirectional},
                    {id: 'menu-iconset-group-shape', caption: this.textShapes},
                    {id: 'menu-iconset-group-indicator', caption: this.textIndicator},
                    {id: 'menu-iconset-group-rating', caption: this.textRating}
                ]),
                store: new Common.UI.DataViewStore(arr),
                showLast: false,
                itemTemplate: _.template('<div class="item-iconset" id="<%= id %>">' +
                                            '<% _.each(data.iconSet, function(icon) { %>' +
                                                '<img src="<%= data.icons.at(icon-1).get(\'icon\') %>" style="width:16px;height:16px;">' +
                                            '<% }) %>' +
                                        '</div>')
            });
            picker.on('item:click', function(picker, item, record, e) {
                if (me.api) {
                    if (record) {
                        me.api.asc_setCF([], [], [Asc.c_oAscCFRuleTypeSettings.icons, record.get('data').index]);
                    }
                    if (e.type !== 'click')
                        cmp.btnCondFormat.menu.hide();
                    Common.NotificationCenter.trigger('edit:complete', cmp, cmp.btnCondFormat);
                }
            });
        },

        onCondFormatMenu: function(menu, item) {
            var me = this;
            var value = this.api.asc_getLocale();
            (!value) && (value = ((this.toolbar.mode.lang) ? parseInt(Common.util.LanguageInfo.getLocalLanguageCode(this.toolbar.mode.lang)) : 0x0409));

            if (item.value == 'manage') {
                (new SSE.Views.FormatRulesManagerDlg({
                    api: me.api,
                    langId: value,
                    locked: !!me._state.cf_locked[this.api.asc_getActiveWorksheetIndex()],
                    handler: function (result, settings) {
                        if (me && me.api && result=='ok') {
                            me.api.asc_setCF(settings.rules, settings.deleted);
                        }
                    }
                })).show();
            } else if (item.value == 'clear') {
                me.api.asc_clearCF(item.options.type);
            } else {
                (new SSE.Views.FormatRulesEditDlg({
                    api: me.api,
                    props   : null,
                    type    : item.options.type,
                    subtype : item.value,
                    percent : item.options.percent,
                    isEdit  : false,
                    langId  : value,
                    handler : function(result, settings) {
                        if (result == 'ok' && settings) {
                            me.api.asc_setCF([settings], []);
                        }
                    }
                })).show();
            }
        },

        createDelayedElements: function() {
            var me = this;

            this.toolbar.createDelayedElements();
            this.attachUIEvents(this.toolbar);

            if ( !this.appConfig.isEditDiagram && !this.appConfig.isEditMailMerge && !this.appConfig.isEditOle ) {
                this.api.asc_registerCallback('asc_onSheetsChanged',            _.bind(this.onApiSheetChanged, this));
                this.api.asc_registerCallback('asc_onUpdateSheetViewSettings',  _.bind(this.onApiSheetChanged, this));
                this.api.asc_registerCallback('asc_onEndAddShape',              _.bind(this.onApiEndAddShape, this));
                this.api.asc_registerCallback('asc_onEditorSelectionChanged',   _.bind(this.onApiEditorSelectionChanged, this));
                this.api.asc_registerCallback('asc_onUpdateDocumentProps',      _.bind(this.onUpdateDocumentProps, this));
                this.api.asc_registerCallback('asc_onLockDocumentProps',        _.bind(this.onApiLockDocumentProps, this));
                this.api.asc_registerCallback('asc_onUnLockDocumentProps',      _.bind(this.onApiUnLockDocumentProps, this));
                Common.NotificationCenter.on('protect:wslock',                  _.bind(this.onChangeProtectSheet, this));
            }
            if ( this.appConfig.isEditOle ) {
                this.api.asc_registerCallback('asc_onEditorSelectionChanged',   _.bind(this.onApiEditorSelectionChanged_OleEditor, this));
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

            var shortcuts = {
                    'command+l,ctrl+l': function(e) {
                        if ( me.editMode && !me._state.multiselect && me.appConfig.canModifyFilter && !me._state.wsLock) {
                            var cellinfo = me.api.asc_getCellInfo(),
                                filterinfo = cellinfo.asc_getAutoFilterInfo(),
                                formattableinfo = cellinfo.asc_getFormatTableInfo();
                            filterinfo = (filterinfo) ? filterinfo.asc_getIsAutoFilter() : null;
                            if (filterinfo!==null && !formattableinfo) {
                                me._setTableFormat(me.api.asc_getDefaultTableStyle());
                            }
                        }

                        return false;
                    },
                    'command+shift+l,ctrl+shift+l': function(e) {
                        if (me.editMode && me.api && !me._state.multiselect && me.appConfig.canModifyFilter && !me._state.wsLock) {
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
                        if (me.editMode && !me.toolbar.mode.isEditMailMerge && !me.toolbar.mode.isEditDiagram && !me.toolbar.mode.isEditOle && !me.api.isCellEdited && !me._state.multiselect && !me._state.inpivot &&
                            !me.getApplication().getController('LeftMenu').leftMenu.menuFile.isVisible() && !me._state.wsProps['InsertHyperlinks']) {
                            var cellinfo = me.api.asc_getCellInfo(),
                                selectionType = cellinfo.asc_getSelectionType();
                            if (selectionType !== Asc.c_oAscSelectionType.RangeShapeText || me.api.asc_canAddShapeHyperlink()!==false)
                                me.onHyperlink();
                        }
                        e.preventDefault();
                    },
                    'command+1,ctrl+1': function(e) {
                        if (me.editMode && !me.toolbar.mode.isEditMailMerge && !me.toolbar.mode.isEditOle && !me.api.isCellEdited && !me.toolbar.cmbNumberFormat.isDisabled()) {
                            me.onCustomNumberFormat();
                        }

                        return false;
                    },
                    'shift+f3': function(e) {
                        if (me.editMode && !me.toolbar.btnInsertFormula.isDisabled()) {
                            var controller = me.getApplication().getController('FormulaDialog');
                            if (controller) {
                                controller.showDialog();
                            }
                        }

                        return false;
                    }
            };
            shortcuts['command+shift+=,ctrl+shift+=,command+shift+numplus,ctrl+shift+numplus' + (Common.Utils.isGecko ? ',command+shift+ff=,ctrl+shift+ff=' : '') +
                    (Common.Utils.isMac ? ',command+shift+0,ctrl+shift+0' : '')] = function(e) {
                        if (Common.Utils.isMac && e.keyCode === Common.UI.Keys.ZERO && e.key!=='=') return false;
                        if (me.editMode && !me.toolbar.mode.isEditMailMerge && !me.toolbar.mode.isEditDiagram && !me.toolbar.mode.isEditOle && !me.toolbar.btnAddCell.isDisabled()) {
                            var cellinfo = me.api.asc_getCellInfo(),
                                selectionType = cellinfo.asc_getSelectionType();
                            if (selectionType === Asc.c_oAscSelectionType.RangeRow || selectionType === Asc.c_oAscSelectionType.RangeCol) {
                                (selectionType === Asc.c_oAscSelectionType.RangeRow) && !me.toolbar.btnAddCell.menu.items[2].isDisabled() && me.api.asc_insertCells(Asc.c_oAscInsertOptions.InsertRows);
                                (selectionType === Asc.c_oAscSelectionType.RangeCol) && !me.toolbar.btnAddCell.menu.items[3].isDisabled() && me.api.asc_insertCells(Asc.c_oAscInsertOptions.InsertColumns);
                                Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                            } else {
                                var items = me.toolbar.btnAddCell.menu.items,
                                    arr = [],
                                    enabled = false;
                                for (var i=0; i<4; i++) {
                                    arr.push({caption: items[i].caption, value: items[i].value, disabled: items[i].isDisabled()});
                                    !items[i].isDisabled() && (enabled = true);
                                }
                                enabled && (new Common.Views.OptionsDialog({
                                    title: me.txtInsertCells,
                                    items: arr,
                                    handler: function (dlg, result) {
                                        if (result=='ok') {
                                            me.api.asc_insertCells(dlg.getSettings());
                                        }
                                        Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                                    }
                                })).show();
                            }
                        }

                        return false;
                    };
            shortcuts['command+shift+-,ctrl+shift+-,command+shift+numminus,ctrl+shift+numminus' + (Common.Utils.isGecko ? ',command+shift+ff-,ctrl+shift+ff-' : '')] = function(e) {
                        if (me.editMode && !me.toolbar.mode.isEditMailMerge && !me.toolbar.mode.isEditDiagram && !me.toolbar.mode.isEditOle && !me.toolbar.btnDeleteCell.isDisabled()) {
                            var cellinfo = me.api.asc_getCellInfo(),
                                selectionType = cellinfo.asc_getSelectionType();
                            if (selectionType === Asc.c_oAscSelectionType.RangeRow || selectionType === Asc.c_oAscSelectionType.RangeCol) {
                                me.api.asc_deleteCells(selectionType === Asc.c_oAscSelectionType.RangeRow ? Asc.c_oAscDeleteOptions.DeleteRows :Asc.c_oAscDeleteOptions.DeleteColumns );
                                Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                            } else {
                                var items = me.toolbar.btnDeleteCell.menu.items,
                                    arr = [],
                                    enabled = false;
                                for (var i=0; i<4; i++) {
                                    arr.push({caption: items[i].caption, value: items[i].value, disabled: items[i].isDisabled()});
                                    !items[i].isDisabled() && (enabled = true);
                                }
                                enabled && (new Common.Views.OptionsDialog({
                                    title: me.txtDeleteCells,
                                    items: arr,
                                    handler: function (dlg, result) {
                                        if (result=='ok') {
                                            me.api.asc_deleteCells(dlg.getSettings());
                                        }
                                        Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                                    }
                                })).show();
                            }
                        }

                        return false;
                    };
            Common.util.Shortcuts.delegateShortcuts({shortcuts: shortcuts});
            Common.Utils.injectSvgIcons();

            this.onChangeProtectSheet();
            this.attachToControlEvents();
            this.onApiSheetChanged();

            Common.NotificationCenter.on('cells:range', _.bind(this.onCellsRange, this));
        },

        onChangeViewMode: function(item, compact) {
            this.toolbar.setFolded(compact);
            this.toolbar.fireEvent('view:compact', [this, compact]);
            compact && this.onTabCollapse();

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
                    groups: new Common.UI.DataViewGroupStore(),
                    style: 'max-height: 300px;',
                    cls: 'classic',
                    store: me.getCollection('TableTemplates'),
                    itemTemplate: _.template('<div class="item-template"><img src="<%= imageUrl %>" id="<%= id %>" style="width:60px;height:44px;"></div>'),
                    delayRenderTips: true
                });

                picker.on('item:click', function(picker, item, record) {
                    if (me.api) {
                        me._state.tablestylename = null;
                        me._setTableFormat(record ? record.get('name') : me.api.asc_getDefaultTableStyle());

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

        onTableTplMenuOpen: function(menu) {
            this.onApiInitTableTemplates(this.api.asc_getTablePictures(this.api.asc_getCellInfo().asc_getFormatTableInfo()));

            if (menu && this.toolbar.mnuTableTemplatePicker) {
                var picker = this.toolbar.mnuTableTemplatePicker,
                    columnCount = 7;

                if (picker.cmpEl) {
                    var itemEl = $(picker.cmpEl.find('.dataview.inner .item-template').get(0)).parent(),
                        itemMargin = 8,
                        itemWidth = itemEl.is(':visible') ? parseFloat(itemEl.css('width')) : 60;

                    var menuWidth = columnCount * (itemMargin + itemWidth) + 11, // for scroller
                        menuMargins = parseFloat(picker.cmpEl.css('margin-left')) + parseFloat(picker.cmpEl.css('margin-right'));
                    if (menuWidth + menuMargins>Common.Utils.innerWidth())
                        menuWidth = Math.max(Math.floor((Common.Utils.innerWidth()-menuMargins-11)/(itemMargin + itemWidth)), 2) * (itemMargin + itemWidth) + 11;
                    picker.cmpEl.css({
                        'width': menuWidth
                    });
                    menu.alignPosition();
                }
            }

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
            var me = this;
            var store = this.getCollection('TableTemplates');
            this.fillTableTemplates();

            if (store) {
                var templates = [];
                var groups = [
                    {id: 'menu-table-group-custom',    caption: me.txtGroupTable_Custom, templates: []},
                    {id: 'menu-table-group-light',     caption: me.txtGroupTable_Light,  templates: []},
                    {id: 'menu-table-group-medium',    caption: me.txtGroupTable_Medium, templates: []},
                    {id: 'menu-table-group-dark',      caption: me.txtGroupTable_Dark,   templates: []},
                    {id: 'menu-table-group-no-name',   caption: '&nbsp',                 templates: []},
                ];
                _.each(images, function(item) {
                    var tip = item.asc_getDisplayName(),
                        groupItem = '',
                        lastWordInTip = null;

                    if (item.asc_getType()==0) {
                        var arr = tip.split(' ');
                        lastWordInTip = arr.pop();
                           
                        if(item.asc_getName() === null){
                            groupItem = 'menu-table-group-light';
                        }
                        else {
                            if(arr.length > 0){
                                groupItem = 'menu-table-group-' + arr[arr.length - 1].toLowerCase();
                            }
                            if(groups.some(function(item) {return item.id === groupItem;}) == false) {
                                groupItem = 'menu-table-group-no-name';
                            }
                        }
                        arr = 'txtTable_' + arr.join('');
                        tip = me[arr] ? me[arr] + ' ' + lastWordInTip : tip;
                        lastWordInTip = parseInt(lastWordInTip);
                    }
                    else {
                        groupItem = 'menu-table-group-custom'
                    }
                    groups.filter(function(item){ return item.id == groupItem; })[0].templates.push({
                        name        : item.asc_getName(),
                        caption     : item.asc_getDisplayName(),
                        type        : item.asc_getType(),
                        imageUrl    : item.asc_getImage(),
                        group       : groupItem,  
                        allowSelected : true,
                        selected    : false,
                        tip         : tip,
                        numInGroup  : (lastWordInTip != null && !isNaN(lastWordInTip) ? lastWordInTip : null)
                    });
                });

                var sortFunc = function(a, b) {
                    var aNum = a.numInGroup,
                        bNum = b.numInGroup;
                    return aNum - bNum;
                };

                
                groups[1].templates.sort(sortFunc);
                groups[2].templates.sort(sortFunc);
                groups[3].templates.sort(sortFunc);

                groups = groups.filter(function(item, index){
                    return item.templates.length > 0
                });
                
                groups.forEach(function(item){
                    templates = templates.concat(item.templates);
                    delete item.templates;
                });

                me.toolbar.mnuTableTemplatePicker.groups.reset(groups);
                store.reset(templates);
            }
        },


        onCellStyleMenuOpen: function(menu) {
            if (menu && this.toolbar.mnuCellStylePicker) {
                var picker = this.toolbar.mnuCellStylePicker,
                    columnCount = 6;

                if (picker.cmpEl) {
                    var itemEl = $(picker.cmpEl.find('.dataview.inner .item').get(0)),
                        itemMargin = parseFloat(itemEl.css('margin-left')) + parseFloat(itemEl.css('margin-right')),
                        itemWidth = itemEl.is(':visible') ? parseFloat(itemEl.css('width')) : 106;

                    var menuWidth = columnCount * (itemMargin + itemWidth) + 15, // for scroller
                        menuMargins = parseFloat(picker.cmpEl.css('margin-left')) + parseFloat(picker.cmpEl.css('margin-right'));
                    if (menuWidth + menuMargins>Common.Utils.innerWidth())
                        menuWidth = Math.max(Math.floor((Common.Utils.innerWidth()-menuMargins-11)/(itemMargin + itemWidth)), 2) * (itemMargin + itemWidth) + 11;
                    picker.cmpEl.css({
                        'width': menuWidth
                    });
                    menu.alignPosition();
                }
            }

            var scroller = this.toolbar.mnuCellStylePicker.scroller;
            if (scroller) {
                scroller.update({alwaysVisibleY: true});
                scroller.scrollTop(0);
            }

            var val = this.toolbar.mnuCellStylePicker.store.findWhere({name: this._state.prstyle});
            if (val)
                this.toolbar.mnuCellStylePicker.selectRecord(val);
            else
                this.toolbar.mnuCellStylePicker.deselectAll();
        },

        onApiInitEditorStyles: function(styles){
            window.styles_loaded = false;

            if(this.toolbar.mode.isEditOle) {
                var me = this;
                function createPicker(element, menu) {
                    var picker = new Common.UI.DataView({
                        el: element,
                        parentMenu  : menu,
                        restoreHeight: 380,
                        groups: new Common.UI.DataViewGroupStore(),
                        store : new Common.UI.DataViewStore(),
                        style: 'max-height: 380px;',
                        itemTemplate: _.template('<div class="style"><img src="<%= imageUrl %>" id="<%= id %>" style="width:100px;height:20px;"></div>'),
                        delayRenderTips: true
                    });
    
                    picker.on('item:click', function(picker, item, record) {
                        me.onListStyleSelect(picker, record);
                    });
    
                    if (picker.scroller) {
                        picker.scroller.update({alwaysVisibleY: true});
                    }
    
                    return picker;
                }
    
                if (_.isUndefined(this.toolbar.mnuCellStylePicker)) {
                    this.toolbar.mnuCellStylePicker = createPicker($('#id-toolbar-menu-cell-styles'), this.toolbar.btnCellStyle.menu);
                }
            }

            var self = this,
                listStyles = this.toolbar.mode.isEditOle ? self.toolbar.mnuCellStylePicker: self.toolbar.listStyles;

            if (!listStyles) {
                self.styles = styles;
                return;
            }
        
            var menuPicker = this.toolbar.mode.isEditOle ? listStyles: listStyles.menuPicker;
            var mainController = this.getApplication().getController('Main');
            var count = menuPicker.store.length;
            var rec = menuPicker.getSelectedRec();
            var groupStore = [
                {id: 'menu-style-group-custom',     caption: this.txtGroupCell_Custom},
                {id: 'menu-style-group-color',      caption: this.txtGroupCell_GoodBadAndNeutral},
                {id: 'menu-style-group-model',      caption: this.txtGroupCell_DataAndModel},
                {id: 'menu-style-group-title',      caption: this.txtGroupCell_TitlesAndHeadings},
                {id: 'menu-style-group-themed',     caption: this.txtGroupCell_ThemedCallStyles}, 
                {id: 'menu-style-group-number',     caption: this.txtGroupCell_NumberFormat},
                {id: 'menu-style-group-no-name',    caption: this.txtGroupCell_NoName}
            ];
            var groups = [];
            for (var i = 0; i < 4; i++) { groups.push('menu-style-group-color'); }
            for (var i = 0; i < 8; i++) { groups.push('menu-style-group-model'); }
            for (var i = 0; i < 6; i++) { groups.push('menu-style-group-title'); }
            for (var i = 0; i < 24; i++) { groups.push('menu-style-group-themed'); }
            for (var i = 0; i < 5; i++) { groups.push('menu-style-group-number'); }
            
            if (count>0 && count==styles.length) {
                var data = menuPicker.dataViewItems;
                data && _.each(styles, function(style, index){
                    var img = style.asc_getImage();
                    data[index].model.set('imageUrl', img, {silent: true});
                    data[index].model.set({
                        name    : style.asc_getName(),
                        tip     : mainController.translationTable[style.get_Name()] || style.get_Name()
                    });
                    $(data[index].el).find('img').attr('src', img);
                });
            } else {
                var arr = [];
                var countCustomStyles = 0;
                var hasNoNameGroup = false;
                _.each(styles, function(style, index){
                    var styleGroup;
                    if(style.asc_getType() == 0) {
                        if(index - countCustomStyles < groups.length){
                            styleGroup = groups[index - countCustomStyles];
                        }
                        else {
                            styleGroup = 'menu-style-group-no-name';
                            hasNoNameGroup = true;
                        }
                    }
                    else {
                        styleGroup = 'menu-style-group-custom';
                    }
                    
                    arr.push({
                        imageUrl: style.asc_getImage(),
                        name    : style.asc_getName(),
                        group   : styleGroup,
                        tip     : mainController.translationTable[style.get_Name()] || style.get_Name(),
                        uid     : Common.UI.getId()
                    });
                    if(style.asc_getType() == 1){
                        countCustomStyles += 1;
                    }
                });

                if(countCustomStyles == 0){
                    groupStore = groupStore.filter(function(item) { return item.id != 'menu-style-group-custom'; });
                }
                if(hasNoNameGroup === false){
                    groupStore = groupStore.filter(function(item) { return item.id != 'menu-style-group-no-name'; });
                }
                
                menuPicker.groups.reset(groupStore);
                menuPicker.store.reset(arr);
            }
            if (!this.toolbar.mode.isEditOle && menuPicker.store.length > 0 && listStyles.rendered) {
                rec = rec ? menuPicker.store.findWhere({name: rec.get('name')}) : null;
                listStyles.fillComboView(rec ? rec : menuPicker.store.at(0), true, true);
            }
            window.styles_loaded = true;
        },

        onHomeOpen: function() {
            var listStyles = this.toolbar.listStyles;
            if (listStyles && listStyles.needFillComboView &&  listStyles.menuPicker.store.length > 0 && listStyles.rendered){
                var styleRec;
                if (this._state.prstyle) styleRec = listStyles.menuPicker.store.findWhere({name: this._state.prstyle});
                listStyles.fillComboView((styleRec) ? styleRec : listStyles.menuPicker.store.at(0), true);
            }
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
            if ($('.asc-window.enable-key-events:visible').length>0) return;

            var toolbar = this.toolbar;
            if (toolbar.mode.isEditDiagram || toolbar.mode.isEditMailMerge) {
                var is_cell_edited = (state == Asc.c_oAscCellEditorState.editStart);
                toolbar.lockToolbar(Common.enumLock.editCell, state == Asc.c_oAscCellEditorState.editStart, {array: [toolbar.btnDecDecimal,toolbar.btnIncDecimal,toolbar.cmbNumberFormat, toolbar.btnEditChartData, toolbar.btnEditChartType]});
            } else if (toolbar.mode.isEditOle) {
                if (state == Asc.c_oAscCellEditorState.editStart || state == Asc.c_oAscCellEditorState.editEnd) {
                    var is_cell_edited = (state == Asc.c_oAscCellEditorState.editStart);
                    toolbar.lockToolbar(Common.enumLock.editCell, state == Asc.c_oAscCellEditorState.editStart, {array: [toolbar.cmbNumberFormat, toolbar.btnWrap, toolbar.btnMerge, toolbar.btnBackColor,
                                        toolbar.btnBorders, toolbar.btnTableTemplate, toolbar.btnHorizontalAlign, toolbar.btnVerticalAlign],
                                        merge: true,
                                        clear: [Common.enumLock.editFormula, Common.enumLock.editText]});
                    (is_cell_edited) ? Common.util.Shortcuts.suspendEvents('command+l, ctrl+l, command+shift+l, ctrl+shift+l') :
                                       Common.util.Shortcuts.resumeEvents('command+l, ctrl+l, command+shift+l, ctrl+shift+l');
                } else {
                    if (state == Asc.c_oAscCellEditorState.editText) var is_text = true, is_formula = false; else
                    if (state == Asc.c_oAscCellEditorState.editFormula) is_text = !(is_formula = true); else
                    if (state == Asc.c_oAscCellEditorState.editEmptyCell) is_text = is_formula = false;

                    toolbar.lockToolbar(Common.enumLock.editFormula, is_formula, { array: [toolbar.cmbFontName, toolbar.cmbFontSize, toolbar.btnTextFormatting, toolbar.btnTextColor]});
                    toolbar.lockToolbar(Common.enumLock.editText, is_text, {array: [toolbar.btnInsertFormula]});
                }
            } else
            if (state == Asc.c_oAscCellEditorState.editStart || state == Asc.c_oAscCellEditorState.editEnd) {
                toolbar.lockToolbar(Common.enumLock.editCell, state == Asc.c_oAscCellEditorState.editStart, {
                        array: [
                            toolbar.btnClearStyle.menu.items[1],
                            toolbar.btnClearStyle.menu.items[2],
                            toolbar.btnClearStyle.menu.items[3],
                            toolbar.btnClearStyle.menu.items[4],
                            toolbar.btnNamedRange.menu.items[0],
                            toolbar.btnNamedRange.menu.items[1]
                        ].concat(toolbar.itemsNamedRange),
                        merge: true,
                        clear: [Common.enumLock.editFormula, Common.enumLock.editText]
                });

                var hkComments = Common.Utils.isMac ? 'command+alt+a' : 'alt+h';
                var is_cell_edited = (state == Asc.c_oAscCellEditorState.editStart);
                (is_cell_edited) ? Common.util.Shortcuts.suspendEvents('command+l, ctrl+l, command+shift+l, ctrl+shift+l, command+k, ctrl+k, command+1, ctrl+1, ' + hkComments) :
                                   Common.util.Shortcuts.resumeEvents('command+l, ctrl+l, command+shift+l, ctrl+shift+l, command+k, ctrl+k, command+1, ctrl+1, ' + hkComments);

                if (is_cell_edited) {
                    toolbar.listStyles.suspendEvents();
                    toolbar.listStyles.menuPicker.selectRecord(null);
                    toolbar.listStyles.resumeEvents();
                    this._state.prstyle = undefined;
                }

                if ( this.appConfig.isDesktopApp && (this.appConfig.isSignatureSupport || this.appConfig.isPasswordSupport) ) {
                    this.getApplication().getController('Common.Controllers.Protection').SetDisabled(is_cell_edited, false);
                }
            } else {
                if (state == Asc.c_oAscCellEditorState.editText) var is_text = true, is_formula = false; else
                if (state == Asc.c_oAscCellEditorState.editFormula) is_text = !(is_formula = true); else
                if (state == Asc.c_oAscCellEditorState.editEmptyCell) is_text = is_formula = false;

                toolbar.lockToolbar(Common.enumLock.editFormula, is_formula,
                        { array: [toolbar.cmbFontName, toolbar.cmbFontSize, toolbar.btnIncFontSize, toolbar.btnDecFontSize, toolbar.btnChangeCase,
                            toolbar.btnBold, toolbar.btnItalic, toolbar.btnUnderline, toolbar.btnStrikeout, toolbar.btnSubscript, toolbar.btnTextColor]});
                toolbar.lockToolbar(Common.enumLock.editText, is_text, {array: [toolbar.btnInsertFormula].concat(toolbar.btnsFormula)});
            }
            this._state.coauthdisable = undefined;
            this._state.selection_type = undefined;
            this.checkInsertAutoshape({action:'cancel'});
        },

        onApiZoomChange: function(zf, type){},


        onApiSheetChanged: function() {
            if (!this.toolbar.mode || !this.toolbar.mode.isEdit || this.toolbar.mode.isEditDiagram || this.toolbar.mode.isEditMailMerge || this.toolbar.mode.isEditOle) return;

            var currentSheet = this.api.asc_getActiveWorksheetIndex(),
                props = this.api.asc_getPageOptions(currentSheet),
                opt = props.asc_getPageSetup();

            this.onApiPageOrient(opt.asc_getOrientation());
            this.onApiPageSize(opt.asc_getWidth(), opt.asc_getHeight());
            this.onApiPageMargins(props.asc_getPageMargins());
            this.onChangeScaleSettings(opt.asc_getFitToWidth(),opt.asc_getFitToHeight(),opt.asc_getScale());
            this.onApiGridLines(props.asc_getGridLines());
            this.onApiHeadings(props.asc_getHeadings());

            this.api.asc_isLayoutLocked(currentSheet) ? this.onApiLockDocumentProps(currentSheet) : this.onApiUnLockDocumentProps(currentSheet);
            this.toolbar.lockToolbar(Common.enumLock.printAreaLock, this.api.asc_isPrintAreaLocked(currentSheet), {array: [this.toolbar.btnPrintArea]});
            this.toolbar.lockToolbar(Common.enumLock.pageBreakLock, this.api.asc_GetPageBreaksDisableType(currentSheet)===Asc.c_oAscPageBreaksDisableType.all, {array: [this.toolbar.btnPageBreak]});
        },

        onUpdateDocumentProps: function(nIndex) {
            if (nIndex == this.api.asc_getActiveWorksheetIndex())
                this.onApiSheetChanged();
        },

        onApiGridLines: function (checked) {
            this.toolbar.chPrintGridlines.setValue(checked, true);
        },

        onApiHeadings: function (checked) {
            this.toolbar.chPrintHeadings.setValue(checked, true);
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

        onChangeScaleSettings: function(width, height, scale) {
            if (this.toolbar.btnScale.menu) {
                if (width !== undefined) {
                    var isWidth = false,
                        isHeight = false;
                    var width = width || 0,
                        height = height || 0;
                    if (scale !== undefined) {
                        this.toolbar.setValueCustomScale(scale);
                    } else {
                        this.toolbar.setValueCustomScale(this.api.asc_getPageOptions().asc_getPageSetup().asc_getScale());
                    }
                    this.toolbar.menuWidthScale.clearAll();
                    this.toolbar.menuWidthScale.items.forEach(function (item) {
                        if (item.value === width) {
                            item.setChecked(true);
                            isWidth = true;
                            return false;
                        }
                    });
                    if (!isWidth) {
                        this.toolbar.menuWidthScale.items[11].setChecked(true);
                    }
                    this.toolbar.menuHeightScale.clearAll();
                    this.toolbar.menuHeightScale.items.forEach(function (item) {
                        if (item.value === height) {
                            item.setChecked(true);
                            isHeight = true;
                            return false;
                        }
                    });
                    if (!isHeight) {
                        this.toolbar.menuHeightScale.items[11].setChecked(true);
                    }
                    if (this.toolbar.mnuScalePicker) {
                        this.toolbar.mnuScalePicker.setDisabled(!(!width && !height));
                        this.toolbar.mnuCustomScale.setDisabled(!(!width && !height));
                    }
                    this._state.scaleWidth = width;
                    this._state.scaleHeight = height;
                    this._state.scale = scale;
                } else {
                    if (this.toolbar.mnuScalePicker) {
                        this.toolbar.mnuScalePicker.setDisabled(!(!this._state.scaleWidth && !this._state.scaleHeight));
                        this.toolbar.mnuCustomScale.setDisabled(!(!this._state.scaleWidth && !this._state.scaleHeight));
                    }
                }
            }
        },

        onApiLockDocumentProps: function(nIndex) {
            if (this._state.lock_doc!==true && nIndex == this.api.asc_getActiveWorksheetIndex()) {
                this.toolbar.lockToolbar(Common.enumLock.docPropsLock, true, {array: [this.toolbar.btnPageSize, this.toolbar.btnPageMargins, this.toolbar.btnPageOrient,
                                                                                      this.toolbar.btnPageBreak, this.toolbar.btnScale, this.toolbar.btnPrintTitles]});
                this._state.lock_doc = true;
            }
        },

        onApiUnLockDocumentProps: function(nIndex) {
            if (this._state.lock_doc!==false && nIndex == this.api.asc_getActiveWorksheetIndex()) {
                this.toolbar.lockToolbar(Common.enumLock.docPropsLock, false, {array: [this.toolbar.btnPageSize, this.toolbar.btnPageMargins, this.toolbar.btnPageOrient,
                                                                                       this.toolbar.btnPageBreak, this.toolbar.btnScale, this.toolbar.btnPrintTitles]});
                this._state.lock_doc = false;
            }
        },

        onApiEditorSelectionChanged: function(fontobj) {
            if (!this.editMode || $('.asc-window.enable-key-events:visible').length>0) return;

            var toolbar = this.toolbar,
                val;

            /* read font name */
            Common.NotificationCenter.trigger('fonts:change', fontobj);

            /* read font params */
            if (!toolbar.mode.isEditMailMerge && !toolbar.mode.isEditDiagram && !toolbar.mode.isEditOle) {
                val = fontobj.asc_getFontBold();
                if (this._state.bold !== val) {
                    toolbar.btnBold.toggle(val === true, true);
                    this._state.bold = val;
                }
                val = fontobj.asc_getFontItalic();
                if (this._state.italic !== val) {
                    toolbar.btnItalic.toggle(val === true, true);
                    this._state.italic = val;
                }
                val = fontobj.asc_getFontUnderline();
                if (this._state.underline !== val) {
                    toolbar.btnUnderline.toggle(val === true, true);
                    this._state.underline = val;
                }
                val = fontobj.asc_getFontStrikeout();
                if (this._state.strikeout !== val) {
                    toolbar.btnStrikeout.toggle(val === true, true);
                    this._state.strikeout = val;
                }

                var subsc = fontobj.asc_getFontSubscript(),
                    supersc = fontobj.asc_getFontSuperscript();

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
            var str_size = fontobj.asc_getFontSize();
            if (this._state.fontsize !== str_size) {
                toolbar.cmbFontSize.setValue((str_size!==undefined) ? str_size : '');
                this._state.fontsize = str_size;
            }

            /* read font color */
            var clr,
                color,
                fontColorPicker      = this.toolbar.mnuTextColorPicker;

            if (!fontColorPicker.isDummy) {
                color = fontobj.asc_getFontColor();
                if (color) {
                    if (color.get_auto()) {
                        if (this._state.clrtext !== 'auto') {
                            fontColorPicker.clearSelection();
                            this.toolbar.btnTextColor.setAutoColor(true);
                            this._state.clrtext = 'auto';
                        }
                    } else {
                        if (color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                            clr = {color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()), effectValue: color.get_value() };
                        } else {
                            clr = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
                        }
                        var type1 = typeof(clr),
                            type2 = typeof(this._state.clrtext);
                        if ( (this._state.clrtext == 'auto') || (type1 !== type2) || (type1=='object' &&
                            (clr.effectValue!==this._state.clrtext.effectValue || this._state.clrtext.color.indexOf(clr.color)<0)) ||
                            (type1!='object' && this._state.clrtext!==undefined && this._state.clrtext.indexOf(clr)<0 )) {

                            this.toolbar.btnTextColor.setAutoColor(false);
                            Common.Utils.ThemeColor.selectPickerColorByEffect(clr, fontColorPicker);
                            this._state.clrtext = clr;
                        }
                    }
                }
                this._state.clrtext_asccolor = color;
            }

        },

        onApiSelectionChanged: function(info) {
            if (!this.editMode || $('.asc-window.enable-key-events:visible').length>0 || !info) return;
            if ( this.toolbar.mode.isEditDiagram )
                return this.onApiSelectionChanged_DiagramEditor(info); else
            if ( this.toolbar.mode.isEditMailMerge )
                return this.onApiSelectionChanged_MailMergeEditor(info); else
            if ( this.toolbar.mode.isEditOle )
                return this.onApiSelectionChanged_OleEditor(info);

            var selectionType = info.asc_getSelectionType(),
                coauth_disable = (!this.toolbar.mode.isEditMailMerge && !this.toolbar.mode.isEditDiagram && !this.toolbar.mode.isEditOle) ? (info.asc_getLocked()===true || info.asc_getLockedTable()===true || info.asc_getLockedPivotTable()===true) : false,
                editOptionsDisabled = this._disableEditOptions(selectionType, coauth_disable),
                me = this,
                toolbar = this.toolbar,
                xfs = info.asc_getXfs(),
                val, need_disable = false;

            /* read font name */
            Common.NotificationCenter.trigger('fonts:change', xfs);

            /* read font size */
            var str_size = xfs.asc_getFontSize();
            if (this._state.fontsize !== str_size) {
                toolbar.cmbFontSize.setValue((str_size !== undefined) ? str_size : '');
                this._state.fontsize = str_size;
            }

            toolbar.lockToolbar(Common.enumLock.cantHyperlink, (selectionType === Asc.c_oAscSelectionType.RangeShapeText) && (this.api.asc_canAddShapeHyperlink()===false), { array: [toolbar.btnInsertHyperlink]});

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

            need_disable = (selectionType === Asc.c_oAscSelectionType.RangeCells || selectionType === Asc.c_oAscSelectionType.RangeCol ||
                selectionType === Asc.c_oAscSelectionType.RangeRow || selectionType === Asc.c_oAscSelectionType.RangeMax);
            toolbar.lockToolbar(Common.enumLock.selRange, need_disable, { array: [toolbar.btnImgAlign, toolbar.btnImgBackward, toolbar.btnImgForward, toolbar.btnImgGroup]});

            var cangroup = this.api.asc_canGroupGraphicsObjects(),
                canungroup = this.api.asc_canUnGroupGraphicsObjects();
            toolbar.lockToolbar(Common.enumLock.cantGroupUngroup, !cangroup && !canungroup, { array: [toolbar.btnImgGroup]});
            toolbar.btnImgGroup.menu.items[0].setDisabled(!cangroup);
            toolbar.btnImgGroup.menu.items[1].setDisabled(!canungroup);
            toolbar.lockToolbar(Common.enumLock.cantGroup, !cangroup, { array: [toolbar.btnImgAlign]});

            var objcount = this.api.asc_getSelectedDrawingObjectsCount();
            toolbar.btnImgAlign.menu.items[7].setDisabled(objcount<3);
            toolbar.btnImgAlign.menu.items[8].setDisabled(objcount<3);

            // disable on protected sheet
            // lock formatting controls in cell with FormatCells protection or in shape and Objects protection
            need_disable = (selectionType === Asc.c_oAscSelectionType.RangeImage || selectionType === Asc.c_oAscSelectionType.RangeChart || selectionType === Asc.c_oAscSelectionType.RangeChartText ||
                            selectionType === Asc.c_oAscSelectionType.RangeShape || selectionType === Asc.c_oAscSelectionType.RangeShapeText || selectionType === Asc.c_oAscSelectionType.RangeSlicer);
            toolbar.lockToolbar(Common.enumLock.wsLockFormat, need_disable && !!this._state.wsProps['Objects'] && !!this._state.is_lockText || !need_disable && !!this._state.wsProps['FormatCells']);
            toolbar.lockToolbar(Common.enumLock.wsLockFormatFill, need_disable && !!this._state.wsProps['Objects'] && !!this._state.is_lockShape || !need_disable && !!this._state.wsProps['FormatCells']);

            toolbar.lockToolbar(Common.enumLock['Objects'], !!this._state.wsProps['Objects']);
            toolbar.lockToolbar(Common.enumLock['FormatCells'], !!this._state.wsProps['FormatCells']);

            // info.asc_getComments()===null - has comment, but no permissions to view it
            toolbar.lockToolbar(Common.enumLock.commentLock, 
                (selectionType == Asc.c_oAscSelectionType.RangeCells) && (!info.asc_getComments() || info.asc_getComments().length>0 || info.asc_getLocked()) 
                || selectionType != Asc.c_oAscSelectionType.RangeCells,
                { array: this.btnsComment });

            toolbar.lockToolbar(Common.enumLock.pageBreakLock, this.api.asc_GetPageBreaksDisableType(this.api.asc_getActiveWorksheetIndex())===Asc.c_oAscPageBreaksDisableType.all, {array: [toolbar.btnPageBreak]});

            if (editOptionsDisabled) return;

            /* read font params */
            if (!toolbar.mode.isEditMailMerge && !toolbar.mode.isEditDiagram && !toolbar.mode.isEditOle) {
                val = xfs.asc_getFontBold();
                if (this._state.bold !== val) {
                    toolbar.btnBold.toggle(val === true, true);
                    this._state.bold = val;
                }
                val = xfs.asc_getFontItalic();
                if (this._state.italic !== val) {
                    toolbar.btnItalic.toggle(val === true, true);
                    this._state.italic = val;
                }
                val = xfs.asc_getFontUnderline();
                if (this._state.underline !== val) {
                    toolbar.btnUnderline.toggle(val === true, true);
                    this._state.underline = val;
                }
                val = xfs.asc_getFontStrikeout();
                if (this._state.strikeout !== val) {
                    toolbar.btnStrikeout.toggle(val === true, true);
                    this._state.strikeout = val;
                }

                var subsc = xfs.asc_getFontSubscript(),
                    supersc = xfs.asc_getFontSuperscript();

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

            if (!fontColorPicker.isDummy) {
                color = xfs.asc_getFontColor();
                if (color) {
                    if (color.get_auto()) {
                        if (this._state.clrtext !== 'auto') {
                            fontColorPicker.clearSelection();
                            toolbar.btnTextColor.setAutoColor(true);
                            this._state.clrtext = 'auto';
                        }
                    } else {
                        if (color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                            clr = {color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()), effectValue: color.get_value() };
                        } else {
                            clr = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
                        }
                        var type1 = typeof(clr),
                            type2 = typeof(this._state.clrtext);
                        if ( (this._state.clrtext == 'auto') || (type1 !== type2) || (type1=='object' &&
                            (clr.effectValue!==this._state.clrtext.effectValue || this._state.clrtext.color.indexOf(clr.color)<0)) ||
                            (type1!='object' && this._state.clrtext!==undefined && this._state.clrtext.indexOf(clr)<0 )) {

                            toolbar.btnTextColor.setAutoColor(false);
                            Common.Utils.ThemeColor.selectPickerColorByEffect(clr, fontColorPicker);
                            this._state.clrtext = clr;
                        }
                    }
                }
                this._state.clrtext_asccolor = color;
            }

            /* read cell background color */
            if (!paragraphColorPicker.isDummy) {
                color = xfs.asc_getFillColor();
                if (color && !color.get_auto()) {
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

                    Common.Utils.ThemeColor.selectPickerColorByEffect(clr, paragraphColorPicker);
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
                    var fontparam = xfs.asc_getHorAlign();
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
                        } else if (index == -255) {
                            toolbar.btnAlignRight.toggle(false, true);
                            toolbar.btnAlignLeft.toggle(false, true);
                            toolbar.btnAlignCenter.toggle(false, true);
                            toolbar.btnAlignJust.toggle(false, true);
                        }
                        toolbar.btnWrap.allowDepress = (fontparam !== AscCommon.align_Justify);
                    }

                    need_disable = (fontparam == AscCommon.align_Justify || selectionType == Asc.c_oAscSelectionType.RangeShapeText || selectionType == Asc.c_oAscSelectionType.RangeShape);
                    toolbar.btnTextOrient.menu.items[1].setDisabled(need_disable);
                    toolbar.btnTextOrient.menu.items[2].setDisabled(need_disable);
                    toolbar.btnTextOrient.menu.items[3].setDisabled(need_disable);

                    /* read cell vertical align */
                    fontparam = xfs.asc_getVertAlign();

                    if (this._state.valign !== fontparam) {
                        this._state.valign = fontparam;

                        index = -1;   align = '';
                        switch (fontparam) {
                            case Asc.c_oAscVAlign.Top:    index = 0; align = 'btn-valign-top';     break;
                            case Asc.c_oAscVAlign.Center: index = 1; align = 'btn-valign-middle';  break;
                            case Asc.c_oAscVAlign.Bottom: index = 2; align = 'btn-valign-bottom';  break;
                        }

                        toolbar.btnAlignTop.toggle(index===0, true);
                        toolbar.btnAlignMiddle.toggle(index===1, true);
                        toolbar.btnAlignBottom.toggle(index===2, true);
                    }

                    need_disable =  this._state.controlsdisabled.filters || formatTableInfo!==null || filterInfo && filterInfo.asc_getIsAutoFilter()===null;
//                (need_disable !== toolbar.btnMerge.isDisabled()) && toolbar.btnMerge.setDisabled(need_disable);
                    toolbar.lockToolbar(Common.enumLock.ruleMerge, need_disable, {array:[toolbar.btnMerge, toolbar.btnInsertTable]});

                    val = info.asc_getMerge();
                    if (this._state.merge !== val) {
                        toolbar.btnMerge.toggle(val===Asc.c_oAscMergeOptions.Merge, true);
                        this._state.merge = val;
                    }

                    /* read cell text wrapping */
                    if (!toolbar.btnWrap.isDisabled()) {
                        val = xfs.asc_getWrapText();
                        if (this._state.wrap !== val) {
                            toolbar.btnWrap.toggle(val===true, true);
                            this._state.wrap = val;
                        }
                    }
                }

                val = (filterInfo) ? filterInfo.asc_getIsAutoFilter() : null;
                if (this._state.filter !== val) {
                    toolbar.btnsSetAutofilter.toggle(val===true, true);
                    this._state.filter = val;
                }
                need_disable =  this._state.controlsdisabled.filters || (val===null);
                toolbar.lockToolbar(Common.enumLock.ruleFilter, need_disable,
                            { array: toolbar.btnsSetAutofilter.concat(toolbar.btnCustomSort, toolbar.btnTableTemplate, toolbar.btnInsertTable, toolbar.btnRemoveDuplicates, toolbar.btnDataValidation) });

                toolbar.lockToolbar(Common.enumLock.tableHasSlicer, filterInfo && filterInfo.asc_getIsSlicerAdded(), { array: toolbar.btnsSetAutofilter });

                need_disable = (selectionType !== Asc.c_oAscSelectionType.RangeSlicer) && (this._state.controlsdisabled.filters || (val===null));
                toolbar.lockToolbar(Common.enumLock.cantSort, need_disable, { array: toolbar.btnsSortDown.concat(toolbar.btnsSortUp) });

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
                toolbar.lockToolbar(Common.enumLock.ruleDelFilter, need_disable, {array: toolbar.btnsClearAutofilter});

                var old_name = this._state.tablename;
                this._state.tablename = (formatTableInfo) ? formatTableInfo.asc_getTableName() : undefined;

                var old_applied = this._state.filterapplied;
                this._state.filterapplied = this._state.filter && filterInfo.asc_getIsApplyAutoFilter();

                if (this._state.tablename !== old_name || this._state.filterapplied !== old_applied)
                    this.getApplication().getController('Statusbar').onApiFilterInfo(!need_disable);

                this._state.multiselect = info.asc_getMultiselect();
                toolbar.lockToolbar(Common.enumLock.multiselect, this._state.multiselect, { array: [toolbar.btnTableTemplate, toolbar.btnInsertHyperlink, toolbar.btnInsertTable]});

                var inpivot = !!info.asc_getPivotTableInfo();
                if (this._state.inpivot !== inpivot) {
                    if ( !inpivot && this.toolbar.isTabActive('pivot') )
                        this.toolbar.setTab('home');
                    this.toolbar.setVisible('pivot', !!inpivot);
                    this._state.inpivot = inpivot;
                }
                toolbar.lockToolbar(Common.enumLock.editPivot, this._state.inpivot, { array: toolbar.btnsSetAutofilter.concat(toolbar.btnMerge, toolbar.btnInsertHyperlink, toolbar.btnInsertTable, toolbar.btnRemoveDuplicates, toolbar.btnDataValidation)});
                toolbar.lockToolbar(Common.enumLock.noSlicerSource, !(this._state.inpivot || formatTableInfo), { array: [toolbar.btnInsertSlicer]});

                need_disable = !this.appConfig.canModifyFilter;
                toolbar.lockToolbar(Common.enumLock.cantModifyFilter, need_disable, { array: toolbar.btnsSetAutofilter.concat(toolbar.btnsSortDown, toolbar.btnsSortUp, toolbar.btnCustomSort, toolbar.btnTableTemplate,
                                                                                          toolbar.btnClearStyle.menu.items[0], toolbar.btnClearStyle.menu.items[2], toolbar.btnInsertTable, toolbar.btnRemoveDuplicates, toolbar.btnDataValidation)});

            }

            val = xfs.asc_getNumFormatInfo();
            if (val) {
				this._state.numformat = xfs.asc_getNumFormat();
				this._state.numformatinfo = val;
				val = val.asc_getType();
				if (this._state.numformattype !== val) {
                    toolbar.cmbNumberFormat.setValue(val, toolbar.txtCustom);
                    this._state.numformattype = val;
				}
            }

            val = xfs.asc_getAngle();
            if (this._state.angle !== val) {
                toolbar.btnTextOrient.menu.clearAll();
                switch(val) {
                    case 45:    toolbar.btnTextOrient.menu.items[1].setChecked(true, true); break;
                    case -45:   toolbar.btnTextOrient.menu.items[2].setChecked(true, true); break;
                    case 255:   toolbar.btnTextOrient.menu.items[3].setChecked(true, true); break;
                    case 90:    toolbar.btnTextOrient.menu.items[4].setChecked(true, true); break;
                    case -90:   toolbar.btnTextOrient.menu.items[5].setChecked(true, true); break;
                    case 0:     toolbar.btnTextOrient.menu.items[0].setChecked(true, true); break;
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

            var selCol = selectionType==Asc.c_oAscSelectionType.RangeCol,
                selRow = selectionType==Asc.c_oAscSelectionType.RangeRow,
                selMax = selectionType==Asc.c_oAscSelectionType.RangeMax;

            need_disable = selRow || selMax && this._state.wsLock || this._state.wsProps['InsertColumns'];
            toolbar.btnAddCell.menu.items[3].setDisabled(need_disable);

            need_disable = selRow || selMax && this._state.wsLock || !selCol && this._state.wsLock || this._state.wsProps['DeleteColumns'];
            toolbar.btnDeleteCell.menu.items[3].setDisabled(need_disable);

            need_disable = selCol || selMax && this._state.wsLock || this._state.wsProps['InsertRows'];
            toolbar.btnAddCell.menu.items[2].setDisabled(need_disable);

            need_disable = selCol || selMax && this._state.wsLock || !selRow && this._state.wsLock || this._state.wsProps['DeleteRows'];
            toolbar.btnDeleteCell.menu.items[2].setDisabled(need_disable);

            val = filterInfo && filterInfo.asc_getIsApplyAutoFilter();
            need_disable = selRow || val || !(selCol || selMax) && this._state.wsLock || selCol && this._state.wsProps['InsertColumns'] || selMax && this._state.wsProps['InsertColumns'] && this._state.wsProps['InsertRows'];
            toolbar.btnAddCell.menu.items[0].setDisabled(need_disable);

            need_disable = selRow || val || !(selCol || selMax) && this._state.wsLock || selCol && this._state.wsProps['DeleteColumns'] || selMax && this._state.wsProps['DeleteColumns'] && this._state.wsProps['DeleteRows'];
            toolbar.btnDeleteCell.menu.items[0].setDisabled(need_disable);

            need_disable = selCol || val || !(selRow || selMax) && this._state.wsLock || selRow && this._state.wsProps['InsertRows'] || selMax && this._state.wsProps['InsertColumns'] && this._state.wsProps['InsertRows'];
            toolbar.btnAddCell.menu.items[1].setDisabled(need_disable);

            need_disable = selCol || val || !(selRow || selMax) && this._state.wsLock || selRow && this._state.wsProps['DeleteRows'] || selMax && this._state.wsProps['DeleteColumns'] && this._state.wsProps['DeleteRows'];
            toolbar.btnDeleteCell.menu.items[1].setDisabled(need_disable);

            var items = toolbar.btnAddCell.menu.items,
                enabled = false;
            for (var i=0; i<4; i++) {
                !items[i].isDisabled() && (enabled = true);
            }
            toolbar.lockToolbar(Common.enumLock.itemsDisabled, !enabled, {array: [toolbar.btnAddCell]});

            items = me.toolbar.btnDeleteCell.menu.items;
            enabled = false;
            for (var i=0; i<4; i++) {
                !items[i].isDisabled() && (enabled = true);
            }
            toolbar.lockToolbar(Common.enumLock.itemsDisabled, !enabled, {array: [toolbar.btnDeleteCell]});

            toolbar.lockToolbar(Common.enumLock.headerLock, info.asc_getLockedHeaderFooter(), {array: this.toolbar.btnsEditHeader});

            this._state.isUserProtected = info.asc_getUserProtected();
            toolbar.lockToolbar(Common.enumLock.userProtected, this._state.isUserProtected);
        },

        onApiSelectionChangedRestricted: function(info) {
            if (!this.appConfig.isRestrictedEdit || !info) return;

            var selectionType = info.asc_getSelectionType();
            this.toolbar.lockToolbar(Common.enumLock.commentLock, 
                (selectionType == Asc.c_oAscSelectionType.RangeCells) && (!info.asc_getComments() || info.asc_getComments().length>0 || info.asc_getLocked())
                || selectionType != Asc.c_oAscSelectionType.RangeCells,
                { array: this.btnsComment });
            this.toolbar.lockToolbar(Common.enumLock['Objects'], !!this._state.wsProps['Objects'], { array: this.btnsComment });
        },

        onApiSelectionChanged_DiagramEditor: function(info) {
            if ( !this.editMode || this.api.isCellEdited || this.api.isRangeSelection || !info) return;

            var me = this;
            var _disableEditOptions = function(seltype, coauth_disable) {
                var is_chart_text = seltype == Asc.c_oAscSelectionType.RangeChartText,
                    is_chart = seltype == Asc.c_oAscSelectionType.RangeChart,
                    is_shape_text = seltype == Asc.c_oAscSelectionType.RangeShapeText,
                    is_shape = seltype == Asc.c_oAscSelectionType.RangeShape,
                    is_image = seltype == Asc.c_oAscSelectionType.RangeImage || seltype == Asc.c_oAscSelectionType.RangeSlicer,
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

                var _set = Common.enumLock;
                var type = seltype;
                switch ( seltype ) {
                case Asc.c_oAscSelectionType.RangeSlicer:
                case Asc.c_oAscSelectionType.RangeImage: type = _set.selImage; break;
                case Asc.c_oAscSelectionType.RangeShape: type = _set.selShape; break;
                case Asc.c_oAscSelectionType.RangeShapeText: type = _set.selShapeText; break;
                case Asc.c_oAscSelectionType.RangeChart: type = _set.selChart; break;
                case Asc.c_oAscSelectionType.RangeChartText: type = _set.selChartText; break;
                }

                me.toolbar.lockToolbar(type, type != seltype, {
                    clear: [_set.selImage, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.coAuth]
                });

                me.toolbar.lockToolbar(Common.enumLock.coAuthText, is_objLocked);

                return is_image;
            };

            var selectionType = info.asc_getSelectionType(),
                xfs = info.asc_getXfs(),
                coauth_disable = false;

            if ( _disableEditOptions(selectionType, coauth_disable) ) return;

            var need_disable = (selectionType === Asc.c_oAscSelectionType.RangeCells || selectionType === Asc.c_oAscSelectionType.RangeCol ||
                                selectionType === Asc.c_oAscSelectionType.RangeRow || selectionType === Asc.c_oAscSelectionType.RangeMax);
            this.toolbar.lockToolbar( Common.enumLock.selRange, need_disable, {array:[this.toolbar.btnEditChartData, this.toolbar.btnEditChartType]} );

            if (selectionType == Asc.c_oAscSelectionType.RangeChart || selectionType == Asc.c_oAscSelectionType.RangeChartText)
                return;

            var val = xfs.asc_getNumFormatInfo();
            if ( val ) {
                this._state.numformat = xfs.asc_getNumFormat();
                this._state.numformatinfo = val;
                val = val.asc_getType();
                if (this._state.numformattype !== val) {
                    me.toolbar.cmbNumberFormat.setValue(val, me.toolbar.txtCustom);
                    this._state.numformattype = val;
                }
            }
        },

        onApiSelectionChanged_MailMergeEditor: function(info) {
            if ( !this.editMode || this.api.isCellEdited || this.api.isRangeSelection || !info) return;

            var me = this;
            var _disableEditOptions = function(seltype, coauth_disable) {
                var is_chart_text = seltype == Asc.c_oAscSelectionType.RangeChartText,
                    is_chart = seltype == Asc.c_oAscSelectionType.RangeChart,
                    is_shape_text = seltype == Asc.c_oAscSelectionType.RangeShapeText,
                    is_shape = seltype == Asc.c_oAscSelectionType.RangeShape,
                    is_image = seltype == Asc.c_oAscSelectionType.RangeImage || seltype == Asc.c_oAscSelectionType.RangeSlicer,
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

                me.toolbar.lockToolbar(Common.enumLock.coAuthText, is_objLocked);

                return is_image;
            };

            var selectionType = info.asc_getSelectionType(),
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
                    this._state.filter = val;
                }

                need_disable =  this._state.controlsdisabled.filters || (val===null);
                me.toolbar.lockToolbar(Common.enumLock.ruleFilter, need_disable,
                    { array: [me.toolbar.btnSetAutofilter, me.toolbar.btnSortDown, me.toolbar.btnSortUp] });

                need_disable =  this._state.controlsdisabled.filters || !filterInfo || (filterInfo.asc_getIsApplyAutoFilter()!==true);
                me.toolbar.lockToolbar(Common.enumLock.ruleDelFilter, need_disable, {array: [me.toolbar.btnClearAutofilter]});
            }
        },

        onApiSelectionChanged_OleEditor: function(info) {
            if ( !this.editMode || this.api.isCellEdited || this.api.isRangeSelection || !info) return;

            var me = this;
            var _disableEditOptions = function(seltype, coauth_disable) {
                var is_chart_text = seltype == Asc.c_oAscSelectionType.RangeChartText,
                    is_chart = seltype == Asc.c_oAscSelectionType.RangeChart,
                    is_shape_text = seltype == Asc.c_oAscSelectionType.RangeShapeText,
                    is_shape = seltype == Asc.c_oAscSelectionType.RangeShape,
                    is_image = seltype == Asc.c_oAscSelectionType.RangeImage || seltype == Asc.c_oAscSelectionType.RangeSlicer,
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

                var _set = Common.enumLock;
                var type = seltype;
                switch ( seltype ) {
                    case Asc.c_oAscSelectionType.RangeSlicer:
                    case Asc.c_oAscSelectionType.RangeImage: type = _set.selImage; break;
                    case Asc.c_oAscSelectionType.RangeShape: type = _set.selShape; break;
                    case Asc.c_oAscSelectionType.RangeShapeText: type = _set.selShapeText; break;
                    case Asc.c_oAscSelectionType.RangeChart: type = _set.selChart; break;
                    case Asc.c_oAscSelectionType.RangeChartText: type = _set.selChartText; break;
                }

                me.toolbar.lockToolbar(type, type != seltype, {
                    clear: [_set.selImage, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.coAuth]
                });

                me.toolbar.lockToolbar(Common.enumLock.coAuthText, is_objLocked);

                me._state.controlsdisabled.filters = is_image || is_mode_2;

                return is_image;
            };

            var selectionType = info.asc_getSelectionType(),
                xfs = info.asc_getXfs(),
                toolbar = this.toolbar,
                coauth_disable = false,
                editOptionsDisabled = _disableEditOptions(selectionType, coauth_disable),
                val, need_disable = false;

            if (editOptionsDisabled) return;
            if (selectionType == Asc.c_oAscSelectionType.RangeChart || selectionType == Asc.c_oAscSelectionType.RangeChartText)
                return;

            Common.NotificationCenter.trigger('fonts:change', xfs);

            /* read font size */
            var str_size = xfs.asc_getFontSize();
            if (this._state.fontsize !== str_size) {
                toolbar.cmbFontSize.setValue((str_size !== undefined) ? str_size : '');
                this._state.fontsize = str_size;
            }

            val = xfs.asc_getFontBold();
            if (this._state.bold !== val) {
                toolbar.btnTextFormatting.menu.items[0].setChecked(val === true);
                this._state.bold = val;
            }
            val = xfs.asc_getFontItalic();
            if (this._state.italic !== val) {
                toolbar.btnTextFormatting.menu.items[1].setChecked(val === true);
                this._state.italic = val;
            }
            val = xfs.asc_getFontUnderline();
            if (this._state.underline !== val) {
                toolbar.btnTextFormatting.menu.items[2].setChecked(val === true);
                this._state.underline = val;
            }
            val = xfs.asc_getFontStrikeout();
            if (this._state.strikeout !== val) {
                toolbar.btnTextFormatting.menu.items[3].setChecked(val === true);
                this._state.strikeout = val;
            }

            val = xfs.asc_getFontSuperscript();
            if (this._state.superscript !== val) {
                toolbar.btnTextFormatting.menu.items[4].setChecked(val === true);
                this._state.superscript = val;
            }

            val = xfs.asc_getFontSubscript();
            if (this._state.subscript !== val) {
                toolbar.btnTextFormatting.menu.items[5].setChecked(val === true);
                this._state.subscript = val;
            }

            /* read font color */
            var clr,
                color,
                fontColorPicker      = toolbar.mnuTextColorPicker,
                paragraphColorPicker = toolbar.mnuBackColorPicker;

            if (!fontColorPicker.isDummy) {
                color = xfs.asc_getFontColor();
                if (color) {
                    if (color.get_auto()) {
                        if (this._state.clrtext !== 'auto') {
                            fontColorPicker.clearSelection();
                            toolbar.btnTextColor.setAutoColor(true);
                            this._state.clrtext = 'auto';
                        }
                    } else {
                        if (color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                            clr = {color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()), effectValue: color.get_value() };
                        } else {
                            clr = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
                        }
                        var type1 = typeof(clr),
                            type2 = typeof(this._state.clrtext);
                        if ( (this._state.clrtext == 'auto') || (type1 !== type2) || (type1=='object' &&
                                (clr.effectValue!==this._state.clrtext.effectValue || this._state.clrtext.color.indexOf(clr.color)<0)) ||
                            (type1!='object' && this._state.clrtext!==undefined && this._state.clrtext.indexOf(clr)<0 )) {

                            toolbar.btnTextColor.setAutoColor(false);
                            Common.Utils.ThemeColor.selectPickerColorByEffect(clr, fontColorPicker);
                            this._state.clrtext = clr;
                        }
                    }
                }
                this._state.clrtext_asccolor = color;
            }

            /* read cell background color */
            if (!paragraphColorPicker.isDummy) {
                color = xfs.asc_getFillColor();
                if (color && !color.get_auto()) {
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

                    Common.Utils.ThemeColor.selectPickerColorByEffect(clr, paragraphColorPicker);
                    this._state.clrback = clr;
                }
                this._state.clrshd_asccolor = color;
            }

            var filterInfo = info.asc_getAutoFilterInfo(),
                formatTableInfo = info.asc_getFormatTableInfo();

            /* read cell horizontal align */

            var fontparam = xfs.asc_getHorAlign();
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
                    toolbar.btnHorizontalAlign.menu.items[index].setChecked(true);
                } else if (index == -255) {
                    toolbar.btnHorizontalAlign.menu.clearAll();
                }
                if ( toolbar.btnHorizontalAlign.rendered && toolbar.btnHorizontalAlign.$icon ) {
                    toolbar.btnHorizontalAlign.$icon.removeClass(toolbar.btnHorizontalAlign.options.icls).addClass(align);
                    toolbar.btnHorizontalAlign.options.icls = align;
                }
                toolbar.btnWrap.allowDepress = (fontparam !== AscCommon.align_Justify);
            }

             // read cell vertical align
            fontparam = xfs.asc_getVertAlign();

            if (this._state.valign !== fontparam) {
                this._state.valign = fontparam;

                index = -1;   align = '';
                switch (fontparam) {
                    case Asc.c_oAscVAlign.Top:    index = 0; align = 'btn-align-top';     break;
                    case Asc.c_oAscVAlign.Center: index = 1; align = 'btn-align-middle';  break;
                    case Asc.c_oAscVAlign.Bottom: index = 2; align = 'btn-align-bottom';  break;
                }
                if (!(index < 0)) {
                    toolbar.btnVerticalAlign.menu.items[index].setChecked(true);
                } else if (index == -255) {
                    toolbar.btnVerticalAlign.menu.clearAll();
                }
                if ( toolbar.btnVerticalAlign.rendered && toolbar.btnVerticalAlign.$icon ) {
                    toolbar.btnVerticalAlign.$icon.removeClass(toolbar.btnVerticalAlign.options.icls).addClass(align);
                    toolbar.btnVerticalAlign.options.icls = align;
                }
            }

            need_disable =  this._state.controlsdisabled.filters || formatTableInfo!==null || filterInfo && filterInfo.asc_getIsAutoFilter()===null;
            toolbar.lockToolbar(Common.enumLock.ruleMerge, need_disable, {array:[toolbar.btnMerge]});

            val = info.asc_getMerge();
            if (this._state.merge !== val) {
                toolbar.btnMerge.toggle(val===Asc.c_oAscMergeOptions.Merge, true);
                this._state.merge = val;
            }

            /* read cell text wrapping */
            if (!toolbar.btnWrap.isDisabled()) {
                val = xfs.asc_getWrapText();
                if (this._state.wrap !== val) {
                    toolbar.btnWrap.toggle(val===true, true);
                    this._state.wrap = val;
                }
            }

            val = (filterInfo) ? filterInfo.asc_getIsAutoFilter() : null;
            this._state.filter = val;
            need_disable =  this._state.controlsdisabled.filters || (val===null);
            toolbar.lockToolbar(Common.enumLock.ruleFilter, need_disable, { array: [toolbar.btnTableTemplate] });

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

            val = info.asc_getStyleName();
            if (this._state.prstyle != val && this.toolbar.mnuCellStylePicker) {

                val = this.toolbar.mnuCellStylePicker.store.findWhere({name: val});
                if (val) {
                    this.toolbar.mnuCellStylePicker.selectRecord(val);
                    this._state.prstyle = val.get('name');
                } else {
                    this.toolbar.mnuCellStylePicker.deselectAll();
                    this._state.prstyle = null;
                }
            }

            var old_name = this._state.tablename;
            this._state.tablename = (formatTableInfo) ? formatTableInfo.asc_getTableName() : undefined;

            var old_applied = this._state.filterapplied;
            this._state.filterapplied = this._state.filter && filterInfo.asc_getIsApplyAutoFilter();

            if (this._state.tablename !== old_name || this._state.filterapplied !== old_applied)
                this.getApplication().getController('Statusbar').onApiFilterInfo(!need_disable);

            this._state.multiselect = info.asc_getMultiselect();
            toolbar.lockToolbar(Common.enumLock.multiselect, this._state.multiselect, { array: [toolbar.btnTableTemplate]});

            this._state.inpivot = !!info.asc_getPivotTableInfo();
            toolbar.lockToolbar(Common.enumLock.editPivot, this._state.inpivot, { array: [toolbar.btnMerge]});

            need_disable = !this.appConfig.canModifyFilter;
            toolbar.lockToolbar(Common.enumLock.cantModifyFilter, need_disable, { array: [toolbar.btnTableTemplate]});

            val = xfs.asc_getNumFormatInfo();
            if ( val ) {
                this._state.numformat = xfs.asc_getNumFormat();
                this._state.numformatinfo = val;
                val = val.asc_getType();
                if (this._state.numformattype !== val) {
                    me.toolbar.cmbNumberFormat.setValue(val, me.toolbar.txtCustom);
                    this._state.numformattype = val;
                }
            }
        },

        onApiEditorSelectionChanged_OleEditor: function(fontobj) {
            if (!this.editMode || $('.asc-window.enable-key-events:visible').length>0) return;

            var toolbar = this.toolbar,
                val;

            /* read font name */
            Common.NotificationCenter.trigger('fonts:change', fontobj);

            /* read font params */
            val = fontobj.asc_getFontBold();
            if (this._state.bold !== val) {
                toolbar.btnTextFormatting.menu.items[0].setChecked(val === true);
                this._state.bold = val;
            }
            val = fontobj.asc_getFontItalic();
            if (this._state.italic !== val) {
                toolbar.btnTextFormatting.menu.items[1].setChecked(val === true);
                this._state.italic = val;
            }
            val = fontobj.asc_getFontUnderline();
            if (this._state.underline !== val) {
                toolbar.btnTextFormatting.menu.items[2].setChecked(val === true);
                this._state.underline = val;
            }
            val = fontobj.asc_getFontStrikeout();
            if (this._state.strikeout !== val) {
                toolbar.btnTextFormatting.menu.items[3].setChecked(val === true);
                this._state.strikeout = val;
            }

            val = fontobj.asc_getFontSubscript();
            if (this._state.subscript !== val) {
                toolbar.btnTextFormatting.menu.items[4].setChecked(val === true);
                this._state.subscript = val;
            }

            val = fontobj.asc_getFontSuperscript();
            if (this._state.superscript !== val) {
                toolbar.btnTextFormatting.menu.items[5].setChecked(val === true);
                this._state.superscript = val;
            }

            /* read font size */
            var str_size = fontobj.asc_getFontSize();
            if (this._state.fontsize !== str_size) {
                toolbar.cmbFontSize.setValue((str_size!==undefined) ? str_size : '');
                this._state.fontsize = str_size;
            }

            /* read font color */
            var clr,
                color,
                fontColorPicker      = this.toolbar.mnuTextColorPicker;

            if (!fontColorPicker.isDummy) {
                color = fontobj.asc_getFontColor();
                if (color) {
                    if (color.get_auto()) {
                        if (this._state.clrtext !== 'auto') {
                            fontColorPicker.clearSelection();
                            this.toolbar.btnTextColor.setAutoColor(true);
                            this._state.clrtext = 'auto';
                        }
                    } else {
                        if (color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                            clr = {color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()), effectValue: color.get_value() };
                        } else {
                            clr = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
                        }
                        var type1 = typeof(clr),
                            type2 = typeof(this._state.clrtext);
                        if ( (this._state.clrtext == 'auto') || (type1 !== type2) || (type1=='object' &&
                                (clr.effectValue!==this._state.clrtext.effectValue || this._state.clrtext.color.indexOf(clr.color)<0)) ||
                            (type1!='object' && this._state.clrtext!==undefined && this._state.clrtext.indexOf(clr)<0 )) {

                            this.toolbar.btnTextColor.setAutoColor(false);
                            Common.Utils.ThemeColor.selectPickerColorByEffect(clr, fontColorPicker);
                            this._state.clrtext = clr;
                        }
                    }
                }
                this._state.clrtext_asccolor = color;
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
            if (this.toolbar.btnTextColor.currentColor === undefined || !this.toolbar.btnTextColor.currentColor.isAuto) {
                this.toolbar.btnTextColor.currentColor=Common.Utils.ThemeColor.getStandartColors()[1];
                this.toolbar.btnTextColor.setColor(this.toolbar.btnTextColor.currentColor);
            }

            updateColors(this.toolbar.mnuBackColorPicker, Common.Utils.ThemeColor.getStandartColors()[3]);
            if (this.toolbar.btnBackColor.currentColor === undefined) {
                this.toolbar.btnBackColor.currentColor=Common.Utils.ThemeColor.getStandartColors()[3];
            } else
                this.toolbar.btnBackColor.currentColor = this.toolbar.mnuBackColorPicker.currentColor.color || this.toolbar.mnuBackColorPicker.currentColor;
            this.toolbar.btnBackColor.setColor(this.toolbar.btnBackColor.currentColor);

            if (this._state.clrtext_asccolor!==undefined || this._state.clrshd_asccolor!==undefined) {
                this._state.clrtext = undefined;
                this._state.clrback = undefined;
                this.onApiSelectionChanged(this.api.asc_getCellInfo());
            }

            this._state.clrtext_asccolor = undefined;
            this._state.clrshd_asccolor = undefined;

            if (this.toolbar.mnuBorderColorPicker) {
                updateColors(this.toolbar.mnuBorderColorPicker, {color: '000', isAuto: true});
                var currentColor = this.toolbar.mnuBorderColorPicker.currentColor;
                if (currentColor && currentColor.isAuto) {
                    var clr_item = this.toolbar.btnBorders.menu.$el.find('#id-toolbar-menu-auto-bordercolor > a');
                    !clr_item.hasClass('selected') && clr_item.addClass('selected');
                }
                this.toolbar.btnBorders.options.borderscolor = currentColor.color || currentColor;
                $('#id-toolbar-mnu-item-border-color > a .menu-item-icon').css('border-color', '#' + this.toolbar.btnBorders.options.borderscolor);
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

            var recents = Common.localStorage.getItem('sse-recent-shapes');

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
                        el: $('#id-toolbar-menu-equationgroup' + i),
                        parentMenu: menu.items[i].menu,
                        store: equationsStore.at(i).get('groupStore'),
                        scrollAlwaysVisible: true,
                        itemTemplate: _.template(
                            '<div class="item-equation">' +
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
            if (this.api) {
                this.api.asc_AddMath();
                Common.component.Analytics.trackEvent('ToolBar', 'Add Equation');
            }
            Common.NotificationCenter.trigger('edit:complete', this.toolbar, this.toolbar.btnInsertEquation);
        },

        onInsertSymbolClick: function() {
            Common.NotificationCenter.trigger('protect:check', this.onInsertSymbolClickCallback, this, []);
        },

        onInsertSymbolClickCallback: function() {
            if (this.api) {
                console.log('init')
                var me = this,
                    selected = me.api.asc_GetSelectedText(),
                    win = new Common.Views.SymbolTableDialog({
                        api: me.api,
                        lang: me.toolbar.mode.lang,
                        type: 1,
                        special: true,
                        buttons: [{value: 'ok', caption: this.textInsert}, 'close'],
                        font: selected && selected.length>0 ? me.api.asc_getCellInfo().asc_getXfs().asc_getFontName() : undefined,
                        symbol: selected && selected.length>0 ? selected.charAt(0) : undefined,
                        handler: function(dlg, result, settings) {
                            if (result == 'ok') {
                                me.insertSymbol(settings.font, settings.code, settings.special, settings.speccharacter);
                            } else
                                Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                        }
                    });
                win.show();
                win.on('symbol:dblclick', function(cmp, result, settings) {
                    me.insertSymbol(settings.font, settings.code, settings.special, settings.speccharacter);
                });
            }
        },

        onInsertSymbolItemClick: function(picker, item, record, e) {
            if (this.api && record)
                this.insertSymbol(record.get('font'), record.get('symbol'), record.get('special'));
        },

        insertSymbol: function(fontRecord, symbol, special, specCharacter){
            var font = fontRecord ? fontRecord: this.api.asc_getCellInfo().asc_getXfs().asc_getFontName();
            this.api.asc_insertSymbol(font, symbol, special);
            !specCharacter && this.toolbar.saveSymbol(symbol, font);
        },

        onInsertSlicerClick: function() {
            var me = this,
                props = me.api.asc_beforeInsertSlicer();
            if (props) {
                (new SSE.Views.SlicerAddDialog({
                    props: props,
                    handler: function (result, settings) {
                        if (me && me.api && result == 'ok') {
                            me.api.asc_insertSlicer(settings);
                        }
                        Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                    }
                })).show();
            }
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
                            model: SSE.Models.EquationModel
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
                is_slicer       = seltype == Asc.c_oAscSelectionType.RangeSlicer,
                is_mode_2       = is_shape_text || is_shape || is_chart_text || is_chart || is_slicer,
                is_objLocked    = false,
                is_smartart_internal = false,
                is_lockShape    = false,
                is_lockText = false;

            if (!(is_mode_2 || is_image) && this._state.selection_type===seltype && this._state.coauthdisable===coauth_disable) return (seltype===Asc.c_oAscSelectionType.RangeImage);

            if (is_mode_2) {
                var SelectedObjects = this.api.asc_getGraphicObjectProps();
                for (var i=0; i<SelectedObjects.length; ++i)
                {
                    if (SelectedObjects[i].asc_getObjectType() == Asc.c_oAscTypeSelectElement.Image) {
                        var value = SelectedObjects[i].asc_getObjectValue(),
                            shapeProps = value ? value.asc_getShapeProperties() : null;
                        if (shapeProps) {
                            is_smartart_internal = shapeProps.asc_getFromSmartArtInternal();
                        }
                        is_objLocked = is_objLocked || value.asc_getLocked();
                        is_lockText = is_lockText || value.asc_getProtectionLockText();
                        is_lockShape = is_lockShape || value.asc_getProtectionLocked();
                    }
                }
                this._state.is_lockText = is_lockText;
                this._state.is_lockShape = is_lockShape;
            }

            if ( coauth_disable ) {
                toolbar.lockToolbar(Common.enumLock.coAuth, coauth_disable);
            } else {
                var _set = Common.enumLock;
                var type = seltype;
                switch (seltype) {
                case Asc.c_oAscSelectionType.RangeImage:        type = _set.selImage; break;
                case Asc.c_oAscSelectionType.RangeShape:        type = _set.selShape; break;
                case Asc.c_oAscSelectionType.RangeShapeText:    type = _set.selShapeText; break;
                case Asc.c_oAscSelectionType.RangeChart:        type = _set.selChart; break;
                case Asc.c_oAscSelectionType.RangeChartText:    type = _set.selChartText; break;
                case Asc.c_oAscSelectionType.RangeSlicer:       type = _set.selSlicer; break;
                }

                if ( !this.appConfig.isEditDiagram && !this.appConfig.isEditMailMerge && !this.appConfig.isEditOle )
                    toolbar.lockToolbar(type, type != seltype, {
                        array: [
                            toolbar.btnClearStyle.menu.items[1],
                            toolbar.btnClearStyle.menu.items[2],
                            toolbar.btnClearStyle.menu.items[3],
                            toolbar.btnClearStyle.menu.items[4]
                        ],
                        merge: true,
                        clear: [_set.selImage, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selSlicer, _set.coAuth]
                    });

                toolbar.lockToolbar(Common.enumLock.coAuthText, is_objLocked);
                toolbar.lockToolbar(Common.enumLock.coAuthText, is_objLocked && (seltype==Asc.c_oAscSelectionType.RangeChart || seltype==Asc.c_oAscSelectionType.RangeChartText), { array: [toolbar.btnInsertChart, toolbar.btnInsertChartRecommend] } );
                toolbar.lockToolbar(Common.enumLock.inSmartartInternal, is_smartart_internal);
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
            return cellInfo ? cellInfo.asc_getXfs().asc_getFontSize() : 12;
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
                        selectionType: me.api.asc_getCellInfo().asc_getSelectionType()
                    });
                } else {
                    me._state.filter = undefined;
                    if (me._state.tablename)
                        me.api.asc_changeAutoFilter(me._state.tablename, Asc.c_oAscChangeFilterOptions.style, fmtname);
                    else {
                        var selectionType = me.api.asc_getCellInfo().asc_getSelectionType();
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
                'edit:complete': function (cmp) {
                    if (me.api && me.modeAlwaysSetStyle && cmp!=='tab') {
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
            toolbar.lockToolbar(Common.enumLock.selRangeEdit, this.api.isRangeSelection);

            this.setDisabledComponents([toolbar.btnUndo], this.api.isRangeSelection || !this.api.asc_getCanUndo());
            this.setDisabledComponents([toolbar.btnRedo], this.api.isRangeSelection || !this.api.asc_getCanRedo());

            this.onApiSelectionChanged(this.api.asc_getCellInfo());
        },

        onLockDefNameManager: function(state) {
            this._state.namedrange_locked = (state == Asc.c_oAscDefinedNameReason.LockDefNameManager);

            this.toolbar.lockToolbar(Common.enumLock.printAreaLock, this.api.asc_isPrintAreaLocked(this.api.asc_getActiveWorksheetIndex()), {array: [this.toolbar.btnPrintArea]});
            this.toolbar.lockToolbar(Common.enumLock.namedRangeLock, this._state.namedrange_locked, {array: [this.toolbar.btnPrintArea.menu.items[0], this.toolbar.btnPrintArea.menu.items[2]]});
        },

        onLockCFManager: function(index) {
            this._state.cf_locked[index] = true;
        },

        onUnLockCFManager: function(index) {
            this._state.cf_locked[index] = false;
        },

        activateControls: function() {
            this.toolbar.lockToolbar(Common.enumLock.disableOnStart, false, {array: [this.toolbar.btnPrint]});
            this._state.activated = true;
        },

        DisableToolbar: function(disable, viewMode) {
            if (viewMode!==undefined) this.editMode = !viewMode;
            disable = disable || !this.editMode;

            var mask = $('.toolbar-mask');
            if (disable && mask.length>0 || !disable && mask.length==0) return;

            var toolbar = this.toolbar;
            toolbar.hideMoreBtns();
            toolbar.$el.find('.toolbar').toggleClass('masked', disable);

            this.toolbar.lockToolbar(Common.enumLock.menuFileOpen, disable);

            var hkComments = Common.Utils.isMac ? 'command+alt+a' : 'alt+h';
            if(disable) {
                mask = $("<div class='toolbar-mask'>").appendTo(toolbar.$el.find('.toolbar'));
                Common.util.Shortcuts.suspendEvents('command+l, ctrl+l, command+shift+l, ctrl+shift+l, command+k, ctrl+k, command+1, ctrl+1, ' + hkComments);
            } else {
                mask.remove();
                Common.util.Shortcuts.resumeEvents('command+l, ctrl+l, command+shift+l, ctrl+shift+l, command+k, ctrl+k, command+1, ctrl+1, ' + hkComments);
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
            if ( config.isEdit && !config.isEditDiagram && !config.isEditMailMerge && !config.isEditOle ) {
                if ( Common.localStorage.itemExists("sse-compact-toolbar") ) {
                    compactview = Common.localStorage.getBool("sse-compact-toolbar");
                } else
                if ( config.customization && config.customization.compactToolbar )
                    compactview = true;
            }

            me.toolbar.render(_.extend({isCompactView: compactview}, config));

            if ( !config.isEditDiagram && !config.isEditMailMerge && !config.isEditOle ) {
                var tab = {action: 'review', caption: me.toolbar.textTabCollaboration, layoutname: 'toolbar-collaboration', dataHintTitle: 'U'};
                var $panel = me.getApplication().getController('Common.Controllers.ReviewChanges').createToolbarPanel();
                if ($panel) {
                    me.toolbar.addTab(tab, $panel, 6);
                    me.toolbar.setVisible('review', (config.isEdit || config.canViewReview || config.canCoAuthoring && config.canComments) && Common.UI.LayoutManager.isElementVisible('toolbar-collaboration'));
                }
            }

            if ( config.isEdit ) {
                me.toolbar.setMode(config);

                me.toolbar.btnSave && me.toolbar.btnSave.on('disabled', _.bind(me.onBtnChangeState, me, 'save:disabled'));
                me.toolbar.btnUndo && me.toolbar.btnUndo.on('disabled', _.bind(me.onBtnChangeState, me, 'undo:disabled'));
                me.toolbar.btnRedo && me.toolbar.btnRedo.on('disabled', _.bind(me.onBtnChangeState, me, 'redo:disabled'));
                me.toolbar.btnPrint && me.toolbar.btnPrint.on('disabled', _.bind(me.onBtnChangeState, me, 'print:disabled'));
                me.toolbar.setApi(me.api);

                if ( !config.isEditDiagram && !config.isEditMailMerge && !config.isEditOle ) {
                    var drawtab = me.getApplication().getController('Common.Controllers.Draw');
                    drawtab.setApi(me.api).setMode(config);
                    $panel = drawtab.createToolbarPanel();
                    if ($panel) {
                        tab = {action: 'draw', caption: me.toolbar.textTabDraw, extcls: 'canedit', layoutname: 'toolbar-draw', dataHintTitle: 'C'};
                        me.toolbar.addTab(tab, $panel, 2);
                        me.toolbar.setVisible('draw', Common.UI.LayoutManager.isElementVisible('toolbar-draw'));
                        Array.prototype.push.apply(me.toolbar.lockControls, drawtab.getView().getButtons());
                    }

                    var datatab = me.getApplication().getController('DataTab');
                    datatab.setApi(me.api).setConfig({toolbar: me});

                    datatab = datatab.getView('DataTab');
                    Array.prototype.push.apply(me.toolbar.lockControls, datatab.getButtons());
                    me.toolbar.btnsSortDown = datatab.getButtons('sort-down');
                    me.toolbar.btnsSortUp = datatab.getButtons('sort-up');
                    me.toolbar.btnsSetAutofilter = datatab.getButtons('set-filter');
                    me.toolbar.btnsClearAutofilter = datatab.getButtons('clear-filter');
                    me.toolbar.btnCustomSort = datatab.getButtons('sort-custom');
                    me.toolbar.btnRemoveDuplicates = datatab.getButtons('rem-duplicates');
                    me.toolbar.btnDataValidation = datatab.getButtons('data-validation');

                    var formulatab = me.getApplication().getController('FormulaDialog');
                    formulatab.setConfig({toolbar: me});
                    formulatab = formulatab.getView('FormulaTab');
                    me.toolbar.btnsFormula = formulatab.getButtons('formula');
                    var namedRange = formulatab.getButtons('range');
                    me.toolbar.itemsNamedRange = (namedRange && namedRange.menu && namedRange.menu.items) ? [namedRange.menu.items[0], namedRange.menu.items[1]] : [];
                    Array.prototype.push.apply(me.toolbar.lockControls, formulatab.getButtons());

                    if ( config.canFeaturePivot ) {
                        tab = {action: 'pivot', caption: me.textPivot, dataHintTitle: 'B'};
                        var pivottab = me.getApplication().getController('PivotTable');
                        pivottab.setApi(me.api).setConfig({toolbar: me});
                        $panel = pivottab.createToolbarPanel();
                        if ($panel) {
                            me.toolbar.addTab(tab, $panel, Common.UI.LayoutManager.lastTabIdx+1);
                            me._state.inpivot && me.toolbar.setVisible('pivot', true);
                            Array.prototype.push.apply(me.toolbar.lockControls, pivottab.getView('PivotTable').getButtons());
                        }
                    }

                    if (!config.compactHeader) {
                        // hide 'print' and 'save' buttons group and next separator
                        me.toolbar.btnPrint.$el.parents('.group').hide().next().hide();

                        // hide 'undo' and 'redo' buttons and get container
                        var $box = me.toolbar.btnUndo.$el.hide().next().hide().parent();

                        // move 'paste' button to the container instead of 'undo' and 'redo'
                        me.toolbar.btnPaste.$el.detach().appendTo($box);
                        me.toolbar.btnPaste.$el.find('button').attr('data-hint-direction', 'bottom');
                        me.toolbar.btnCopy.$el.removeClass('split');
                        me.toolbar.processPanelVisible(null, true);
                    }

                    if ( config.canProtect ) {
                        var tab = {action: 'protect', caption: me.toolbar.textTabProtect, layoutname: 'toolbar-protect', dataHintTitle: 'T'};
                        var $panel = me.getApplication().getController('Common.Controllers.Protection').createToolbarPanel();
                        if ($panel) {
                            (config.isSignatureSupport || config.isPasswordSupport) && $panel.append($('<div class="separator long"></div>'));
                            var wbtab = me.getApplication().getController('WBProtection');
                            $panel.append(wbtab.createToolbarPanel());
                            me.toolbar.addTab(tab, $panel, 7);
                            me.toolbar.setVisible('protect', Common.UI.LayoutManager.isElementVisible('toolbar-protect'));
                            Array.prototype.push.apply(me.toolbar.lockControls, wbtab.getView('WBProtection').getButtons());
                        }
                    }
                }
            }
            if ( !config.isEditDiagram && !config.isEditMailMerge && !config.isEditOle ) {
                var tab = {caption: me.toolbar.textTabView, action: 'view', extcls: config.isEdit ? 'canedit' : '', layoutname: 'toolbar-view', dataHintTitle: 'W'};
                var viewtab = me.getApplication().getController('ViewTab');
                viewtab.setApi(me.api).setConfig({toolbar: me, mode: config});
                var $panel = viewtab.createToolbarPanel();
                if ($panel) {
                    me.toolbar.addTab(tab, $panel, 8);
                    me.toolbar.setVisible('view', Common.UI.LayoutManager.isElementVisible('toolbar-view'));
                }
                config.isEdit && Array.prototype.push.apply(me.toolbar.lockControls, viewtab.getView('ViewTab').getButtons());
            }
        },

        onAppReady: function (config) {
            var me = this;
            me.appOptions = config;

            this.btnsComment = [];
            if ( config.canCoAuthoring && config.canComments ) {
                var _set = Common.enumLock;
                this.btnsComment = Common.Utils.injectButtons(this.toolbar.$el.find('.slot-comment'), 'tlbtn-addcomment-', 'toolbar__icon btn-big-add-comment', this.toolbar.capBtnComment,
                                                            [_set.lostConnect, _set.commentLock, _set.editCell, _set['Objects']], undefined, undefined, undefined, '1', 'bottom', 'small');

                if ( this.btnsComment.length ) {
                    var _comments = SSE.getController('Common.Controllers.Comments').getView();
                    this.btnsComment.forEach(function (btn) {
                        btn.updateHint( _comments.textHintAddComment );
                        btn.on('click', function (btn, e) {
                            Common.NotificationCenter.trigger('app:comment:add', 'toolbar', me.api.asc_getCellInfo().asc_getSelectionType() != Asc.c_oAscSelectionType.RangeCells);
                        });
                        if (btn.cmpEl.closest('#review-changes-panel').length>0)
                            btn.setCaption(me.toolbar.capBtnAddComment);
                    }, this);
                    if (_comments.buttonAddNew) {
                        _comments.buttonAddNew.options.lock = [ _set.lostConnect, _set.commentLock, _set.editCell, _set['Objects'] ];
                        this.btnsComment.add(_comments.buttonAddNew);
                    }
                    Array.prototype.push.apply(me.toolbar.lockControls, this.btnsComment);
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
                Common.component.Analytics.trackEvent('ToolBar', 'Page Size');
            }

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onPageMarginsSelect: function(menu, item) {
            if (this.api) {
                this._state.pgmargins = undefined;
                if (item.value !== 'advanced') {
                    var props = new Asc.asc_CPageMargins();
                    props.asc_setTop(item.value[0]);
                    props.asc_setBottom(item.value[2]);
                    props.asc_setLeft(item.value[1]);
                    props.asc_setRight(item.value[3]);
                    this.api.asc_changePageMargins(props, undefined, undefined, undefined, undefined, this.api.asc_getActiveWorksheetIndex());
                } else {
                    var win, props,
                        me = this;
                    win = new SSE.Views.PageMarginsDialog({
                        handler: function(dlg, result) {
                            if (result == 'ok') {
                                props = dlg.getSettings();
                                var margins = props.margins;
                                Common.localStorage.setItem("sse-pgmargins-top", margins.asc_getTop());
                                Common.localStorage.setItem("sse-pgmargins-left", margins.asc_getLeft());
                                Common.localStorage.setItem("sse-pgmargins-bottom", margins.asc_getBottom());
                                Common.localStorage.setItem("sse-pgmargins-right", margins.asc_getRight());
                                Common.NotificationCenter.trigger('margins:update', margins);
                                me.toolbar.btnPageMargins.menu.items[0].setChecked(true);

                                me.api.asc_changePageMargins( margins, props.horizontal, props.vertical, undefined, undefined, me.api.asc_getActiveWorksheetIndex());
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

        onPageBreakClick: function(menu, item) {
            if (this.api) {
                if (item.value==='ins')
                    this.api.asc_InsertPageBreak();
                else if (item.value==='del')
                    this.api.asc_RemovePageBreak();
                else if (item.value==='reset')
                    this.api.asc_ResetAllPageBreaks();
                Common.component.Analytics.trackEvent('ToolBar', 'Page Break');
            }

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onPageBreakMenuOpen: function() {
            if (this.api) {
                var type = this.api.asc_GetPageBreaksDisableType(this.api.asc_getActiveWorksheetIndex());
                this.toolbar.btnPageBreak.menu.items[0].setDisabled(type===Asc.c_oAscPageBreaksDisableType.insertRemove);
                this.toolbar.btnPageBreak.menu.items[1].setDisabled(type===Asc.c_oAscPageBreaksDisableType.insertRemove);
                this.toolbar.btnPageBreak.menu.items[2].setDisabled(type===Asc.c_oAscPageBreaksDisableType.reset);
            }
        },

        onEditHeaderClick: function(pageSetup, btn) {
            var me = this;
            if (_.isUndefined(me.fontStore)) {
                me.fontStore = new Common.Collections.Fonts();
                var fonts = me.toolbar.cmbFontName.store.toJSON();
                var arr = [];
                _.each(fonts, function(font, index){
                    if (!font.cloneid) {
                        arr.push(_.clone(font));
                    }
                });
                me.fontStore.add(arr);
            }

            var win = new SSE.Views.HeaderFooterDialog({
                api: me.api,
                fontStore: me.fontStore,
                pageSetup: pageSetup,
                handler: function(dlg, result) {
                    if (result === 'ok') {
                        me.getApplication().getController('Print').updatePreview();
                    }
                    Common.NotificationCenter.trigger('edit:complete');
                }
            });
            win.show();

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onClickChangeScaleInMenu: function(type, curScale) {
            if (this.api) {
                var scale;
                if (type === 'up') {
                    if (curScale % 5 > 0.001) {
                        scale = Math.ceil(curScale / 5) * 5;
                    } else {
                        scale = curScale + 5;
                    }
                } else {
                    if (curScale % 5 > 0.001) {
                        scale = Math.floor(curScale / 5) * 5;
                    } else {
                        scale = curScale - 5;
                    }
                }
                if (scale > 400) {
                    scale = 400;
                } else if (scale < 10) {
                    scale = 10;
                }
                this.onChangeScaleSettings(0, 0, scale);
            }
        },

        onScaleClick: function(type, menu, item, event, scale) {
            var me = this;
            if (me.api) {
                if (type === 'width' && item.value !== 'more') {
                    if (me._state.scaleHeight === undefined || me._state.scaleHeight === null) {
                        me._state.scaleHeight = 0;
                    }
                    me.api.asc_SetPrintScale(item.value, me._state.scaleHeight, 100);
                    me.onChangeScaleSettings(item.value, me._state.scaleHeight, 100);
                } else if (type === 'height' && item.value !== 'more') {
                    if (me._state.scaleWidth === undefined || me._state.scaleWidth === null) {
                        me._state.scaleWidth = 0;
                    }
                    me.api.asc_SetPrintScale(me._state.scaleWidth, item.value, 100);
                    me.onChangeScaleSettings(me._state.scaleWidth, item.value, 100);
                } else if (type === 'scale' && scale !== undefined) {
                    me.api.asc_SetPrintScale(0, 0, scale);
                } else if (item.value === 'custom' || item.value === 'more') {
                    var win = new SSE.Views.ScaleDialog({
                        api: me.api,
                        props: null,
                        handler: function (dlg, result) {
                            if (dlg == 'ok') {
                                if (me.api && result) {
                                    me.api.asc_SetPrintScale(result.width, result.height, result.scale);
                                    me.onChangeScaleSettings(result.width, result.height, result.scale);
                                }
                            } else {
                                me.onChangeScaleSettings(me._state.scaleWidth, me._state.scaleHeight, me._state.scale);
                            }
                            Common.NotificationCenter.trigger('edit:complete');
                        }
                    });
                    win.show();
                }
            }

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onPrintTitlesClick: function(btn) {
            if (this.api) {
                var win, props,
                    me = this;
                win = new SSE.Views.PrintTitlesDialog({
                    api: me.api,
                    sheet: me.api.asc_getActiveWorksheetIndex(),
                    handler: function(dlg, result) {
                        if (result == 'ok') {
                            props = dlg.getSettings();
                            me.api.asc_changePrintTitles(props.width, props.height, me.api.asc_getActiveWorksheetIndex());
                            Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                        }
                    }
                });
                win.show();

                Common.component.Analytics.trackEvent('ToolBar', 'Print Titles');
            }

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onChangeProtectSheet: function(props) {
            if (!props) {
                var wbprotect = this.getApplication().getController('WBProtection');
                props = wbprotect ? wbprotect.getWSProps() : null;
            }
            if (props) {
                this._state.wsProps = props.wsProps;
                this._state.wsLock = props.wsLock;
                
                this.toolbar.lockToolbar(Common.enumLock.wsLock, this._state.wsLock);
                this.toolbar.lockToolbar(Common.enumLock['InsertHyperlinks'], this._state.wsProps['InsertHyperlinks'], {array: [this.toolbar.btnInsertHyperlink]});
                this.appConfig && this.appConfig.isEdit ? this.onApiSelectionChanged(this.api.asc_getCellInfo()) : this.onApiSelectionChangedRestricted(this.api.asc_getCellInfo());
            }
        },

        onPrintGridlinesChange: function (field, value) {
            this.api.asc_SetPrintGridlines(value === 'checked');
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onPrintHeadingsChange: function (field, value) {
            this.api.asc_SetPrintHeadings(value === 'checked');
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onVisibleAreaClose: function(btn) {
            if (this.api)
                this.api.asc_toggleChangeVisibleAreaOleEditor(false);
            this.toolbar.lockToolbar(Common.enumLock.editVisibleArea, false);
            this.toolbar.btnVisibleArea.setVisible(true);
            this.toolbar.btnVisibleAreaClose.setVisible(false);
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onVisibleAreaMenu: function(menu, item, e) {
            if (this.api) {
                if (item.value === 'edit') {
                    this.api.asc_toggleChangeVisibleAreaOleEditor(true);
                    this.toolbar.btnVisibleArea.setVisible(false);
                    this.toolbar.btnVisibleAreaClose.setVisible(true);
                    this.toolbar.lockToolbar(Common.enumLock.editVisibleArea, true);
                } else { // show or hide
                    this.api.asc_toggleShowVisibleAreaOleEditor(item.value === 'show');
                    this.toolbar.btnVisibleArea.menu.items[0].setVisible(item.value !== 'show');
                    this.toolbar.btnVisibleArea.menu.items[1].setVisible(item.value === 'show');
                }
            }
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onOleEditClose: function() {
            if (this.api) {
                this.api.asc_toggleChangeVisibleAreaOleEditor(false);
                this.toolbar.btnVisibleArea.setVisible(true);
                this.toolbar.btnVisibleAreaClose.setVisible(false);
                this.toolbar.lockToolbar(Common.enumLock.editVisibleArea, false);

                this.api.asc_toggleShowVisibleAreaOleEditor(false);
                this.toolbar.btnVisibleArea.menu.items[0].setVisible(true);
                this.toolbar.btnVisibleArea.menu.items[1].setVisible(false);
            }
        },

        onTextFormattingMenu: function(menu, item) {
            if (this.api) {
                switch (item.value) {
                    case 'bold':
                        this._state.bold = undefined;
                        this.api.asc_setCellBold(item.checked);
                        break;
                    case 'italic':
                        this._state.italic = undefined;
                        this.api.asc_setCellItalic(item.checked);
                        break;
                    case 'underline':
                        this._state.underline = undefined;
                        this.api.asc_setCellUnderline(item.checked);
                        break;
                    case 'strikeout':
                        this._state.strikeout = undefined;
                        this.api.asc_setCellStrikeout(item.checked);
                        break;
                    case 'subscript':
                        this._state.subscript = undefined;
                        this.api.asc_setCellSubscript(item.checked);
                        break;
                    case 'superscript':
                        this._state.superscript = undefined;
                        this.api.asc_setCellSuperscript(item.checked);
                        break;
                }
            }

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Text Formatting');
        },

        onHorizontalAlignMenu: function(menu, item) {
            this._state.pralign = undefined;
            if (this.api) {
                this.api.asc_setCellAlign(!item.checked ? null : item.value);
                this.toolbar.btnWrap.allowDepress = !(item.value == AscCommon.align_Justify);
            }

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Horizontal align');
        },

        onVerticalAlignMenu: function(menu, item) {
            this._state.valign = undefined;
            if (this.api) {
                this.api.asc_setCellVertAlign(!item.checked ? Asc.c_oAscVAlign.Bottom : item.value);
            }

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Vertical align');
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

        eyedropperStart: function () {
            if (this.toolbar.btnCopyStyle.pressed) {
                this.toolbar.btnCopyStyle.toggle(false, true);
                this.api.asc_formatPainter(AscCommon.c_oAscFormatPainterState.kOff);
                this.modeAlwaysSetStyle = false;
            }
        },

        onEyedropperStart: function (btn) {
            this.toolbar._isEyedropperStart = true;
            this.api.asc_startEyedropper(_.bind(btn.eyedropperEnd, btn));
        },

        onEyedropperEnd: function () {
            this.toolbar._isEyedropperStart = false;
        },

        onChartRecommendedClick: function() {
            var me = this,
                recommended = me.api.asc_getRecommendedChartData();
            if (!recommended) {
                Common.UI.warning({
                    msg: me.warnNoRecommended,
                    maxwidth: 600,
                    callback: function(btn) {
                        Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                    }
                });
                return;
            }

            var seltype = me.api.asc_getCellInfo().asc_getSelectionType();
            (new SSE.Views.ChartWizardDialog({
                api: me.api,
                props: {recommended: recommended},
                isEdit: (seltype == Asc.c_oAscSelectionType.RangeChart || seltype == Asc.c_oAscSelectionType.RangeChartText),
                handler: function(result, value) {
                    if (result == 'ok') {
                        me.api && me.api.asc_addChartSpace(value);
                    }
                    Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                }
            })).show();
        },

        onFillNumMenu: function(menu, item, e) {
            if (this.api) {
                var me = this;
                if (item.value === Asc.c_oAscFillType.series) {
                    (new SSE.Views.FillSeriesDialog({
                        handler: function(result, settings) {
                            if (result == 'ok' && settings) {
                                me.api.asc_FillCells(Asc.c_oAscFillType.series, settings);
                            }
                            Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                        },
                        props: me.api.asc_GetSeriesSettings()
                    })).show();
                } else {
                    me.api.asc_FillCells(item.value);
                }
            }
        },

        onShowBeforeFillNumMenu: function() {
            if (this.api) {
                var items = this.toolbar.btnFillNumbers.menu.items,
                    props = this.api.asc_GetSeriesSettings().asc_getToolbarMenuAllowedProps();

                for (var i = 0; i < items.length; i++) {
                    items[i].setDisabled(!props[items[i].value]);
                }
            }
        },

        onPluginToolbarMenu: function(data) {
            this.toolbar && Array.prototype.push.apply(this.toolbar.lockControls, Common.UI.LayoutManager.addCustomItems(this.toolbar, data));
        },

        onActiveTab: function(tab) {
            (tab === 'protect') ? Common.UI.TooltipManager.showTip('protectRange') : Common.UI.TooltipManager.closeTip('protectRange');
            (tab !== 'home') && Common.UI.TooltipManager.closeTip('quickAccess');
        },

        onTabCollapse: function(tab) {
            Common.UI.TooltipManager.closeTip('protectRange');
        }
    }, SSE.Controllers.Toolbar || {}));
});