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
 *  Toolbar Controller
 *
 *  Created by Alexander Yuzhin on 1/15/14
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'common/main/lib/component/Window',
    'common/main/lib/view/CopyWarningDialog',
    'common/main/lib/view/ImageFromUrlDialog',
    'common/main/lib/view/InsertTableDialog',
    'common/main/lib/view/SelectFileDlg',
    'common/main/lib/util/define',
    'documenteditor/main/app/view/Toolbar',
    'documenteditor/main/app/view/DropcapSettingsAdvanced',
    'documenteditor/main/app/view/StyleTitleDialog',
    'documenteditor/main/app/view/PageMarginsDialog',
    'documenteditor/main/app/view/PageSizeDialog',
    'documenteditor/main/app/controller/PageLayout',
    'documenteditor/main/app/view/CustomColumnsDialog',
    'documenteditor/main/app/view/ControlSettingsDialog'
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
                    type: undefined,
                    subtype: undefined
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
                in_equation: false,
                in_chart: false
            };
            this.flg = {};
            this.diagramEditor = null;
            this._isAddingShape = false;
            this.editMode = true;

            this.addListeners({
                'Toolbar': {
                    'insert:break'      : this.onClickPageBreak,
                    'change:compact'    : this.onClickChangeCompact,
                    'home:open'         : this.onHomeOpen
                },
                'FileMenu': {
                    'menu:hide': this.onFileMenu.bind(this, 'hide'),
                    'menu:show': this.onFileMenu.bind(this, 'show')
                },
                'Common.Views.Header': {
                    'toolbar:setcompact': this.onChangeCompactView.bind(this),
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
                        var _file_type = _main.document.fileType,
                            _format;
                        if ( !!_file_type ) {
                            if ( /^pdf|xps|djvu/i.test(_file_type) ) {
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
                            Asc.c_oAscFileType.OTT
                        ];

                        if ( !_format || _supported.indexOf(_format) < 0 )
                            _format = Asc.c_oAscFileType.PDF;

                        _main.api.asc_DownloadAs(_format);
                    },
                    'go:editor': function() {
                        Common.Gateway.requestEditRights();
                    }
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

                if (this.toolbar.btnInsertText.pressed)
                    this.toolbar.btnInsertText.toggle(false, true);

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
        },

        attachUIEvents: function(toolbar) {
            /**
             * UI Events
             */

            toolbar.btnPrint.on('click',                                _.bind(this.onPrint, this));
            toolbar.btnPrint.on('disabled',                             _.bind(this.onBtnChangeState, this, 'print:disabled'));
            toolbar.btnSave.on('click',                                 _.bind(this.onSave, this));
            toolbar.btnUndo.on('click',                                 _.bind(this.onUndo, this));
            toolbar.btnUndo.on('disabled',                              _.bind(this.onBtnChangeState, this, 'undo:disabled'));
            toolbar.btnRedo.on('click',                                 _.bind(this.onRedo, this));
            toolbar.btnRedo.on('disabled',                              _.bind(this.onBtnChangeState, this, 'redo:disabled'));
            toolbar.btnCopy.on('click',                                 _.bind(this.onCopyPaste, this, true));
            toolbar.btnPaste.on('click',                                _.bind(this.onCopyPaste, this, false));
            toolbar.btnIncFontSize.on('click',                          _.bind(this.onIncrease, this));
            toolbar.btnDecFontSize.on('click',                          _.bind(this.onDecrease, this));
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
            toolbar.btnHorizontalAlign.menu.on('item:click',            _.bind(this.onMenuHorizontalAlignSelect, this));
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
            toolbar.btnHighlightColor.on('click',                       _.bind(this.onBtnHighlightColor, this));
            toolbar.btnFontColor.on('click',                            _.bind(this.onBtnFontColor, this));
            toolbar.btnParagraphColor.on('click',                       _.bind(this.onBtnParagraphColor, this));
            toolbar.mnuHighlightColorPicker.on('select',                _.bind(this.onSelectHighlightColor, this));
            toolbar.mnuFontColorPicker.on('select',                     _.bind(this.onSelectFontColor, this));
            toolbar.mnuParagraphColorPicker.on('select',                _.bind(this.onParagraphColorPickerSelect, this));
            toolbar.mnuHighlightTransparent.on('click',                 _.bind(this.onHighlightTransparentClick, this));
            $('#id-toolbar-menu-auto-fontcolor').on('click',            _.bind(this.onAutoFontColor, this));
            $('#id-toolbar-menu-new-fontcolor').on('click',             _.bind(this.onNewFontColor, this));
            $('#id-toolbar-menu-new-paracolor').on('click',             _.bind(this.onNewParagraphColor, this));
            toolbar.mnuLineSpace.on('item:toggle',                      _.bind(this.onLineSpaceToggle, this));
            toolbar.mnuNonPrinting.on('item:toggle',                    _.bind(this.onMenuNonPrintingToggle, this));
            toolbar.btnShowHidenChars.on('toggle',                      _.bind(this.onNonPrintingToggle, this));
            toolbar.mnuTablePicker.on('select',                         _.bind(this.onTablePickerSelect, this));
            toolbar.mnuInsertTable.on('item:click',                     _.bind(this.onInsertTableClick, this));
            toolbar.mnuInsertImage.on('item:click',                     _.bind(this.onInsertImageClick, this));
            toolbar.btnInsertText.on('click',                           _.bind(this.onBtnInsertTextClick, this));
            toolbar.btnInsertShape.menu.on('hide:after',                _.bind(this.onInsertShapeHide, this));
            toolbar.btnDropCap.menu.on('item:click',                    _.bind(this.onDropCapSelect, this));
            toolbar.btnContentControls.menu.on('item:click',            _.bind(this.onControlsSelect, this));
            toolbar.mnuDropCapAdvanced.on('click',                      _.bind(this.onDropCapAdvancedClick, this));
            toolbar.btnColumns.menu.on('item:click',                    _.bind(this.onColumnsSelect, this));
            toolbar.btnPageOrient.menu.on('item:click',                 _.bind(this.onPageOrientSelect, this));
            toolbar.btnPageMargins.menu.on('item:click',                _.bind(this.onPageMarginsSelect, this));
            toolbar.btnClearStyle.on('click',                           _.bind(this.onClearStyleClick, this));
            toolbar.btnCopyStyle.on('toggle',                           _.bind(this.onCopyStyleToggle, this));
            toolbar.mnuPageSize.on('item:click',                        _.bind(this.onPageSizeClick, this));
            toolbar.mnuColorSchema.on('item:click',                     _.bind(this.onColorSchemaClick, this));
            toolbar.btnMailRecepients.on('click',                       _.bind(this.onSelectRecepientsClick, this));
            toolbar.mnuInsertChartPicker.on('item:click',               _.bind(this.onSelectChart, this));
            toolbar.mnuPageNumberPosPicker.on('item:click',             _.bind(this.onInsertPageNumberClick, this));
            toolbar.btnEditHeader.menu.on('item:click',                 _.bind(this.onEditHeaderFooterClick, this));
            toolbar.mnuPageNumCurrentPos.on('click',                    _.bind(this.onPageNumCurrentPosClick, this));
            toolbar.mnuInsertPageCount.on('click',                      _.bind(this.onInsertPageCountClick, this));
            toolbar.btnBlankPage.on('click',                            _.bind(this.onBtnBlankPageClick, this));
            toolbar.listStyles.on('click',                              _.bind(this.onListStyleSelect, this));
            toolbar.listStyles.on('contextmenu',                        _.bind(this.onListStyleContextMenu, this));
            toolbar.styleMenu.on('hide:before',                         _.bind(this.onListStyleBeforeHide, this));
            toolbar.btnInsertEquation.on('click',                       _.bind(this.onInsertEquationClick, this));
            toolbar.mnuNoControlsColor.on('click',                      _.bind(this.onNoControlsColor, this));
            toolbar.mnuControlsColorPicker.on('select',                 _.bind(this.onSelectControlsColor, this));
            $('#id-toolbar-menu-new-control-color').on('click',         _.bind(this.onNewControlsColor, this));

            $('#id-save-style-plus, #id-save-style-link', toolbar.$el).on('click', this.onMenuSaveStyle.bind(this));

            this.onSetupCopyStyleButton();
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
                this.api.asc_registerCallback('asc_onListType', _.bind(this.onApiBullets, this));
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
                this.api.asc_registerCallback('asc_onMathTypes', _.bind(this.onMathTypes, this));
                this.api.asc_registerCallback('asc_onColumnsProps', _.bind(this.onColumnsProps, this));
                this.api.asc_registerCallback('asc_onSectionProps', _.bind(this.onSectionProps, this));
                this.api.asc_registerCallback('asc_onContextMenu', _.bind(this.onContextMenu, this));
                this.api.asc_registerCallback('asc_onShowParaMarks', _.bind(this.onShowParaMarks, this));
                this.api.asc_registerCallback('asc_onChangeSdtGlobalSettings', _.bind(this.onChangeSdtGlobalSettings, this));
            } else if (this.mode.isRestrictedEdit) {
                this.api.asc_registerCallback('asc_onFocusObject', _.bind(this.onApiFocusObjectRestrictedEdit, this));
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect', _.bind(this.onApiCoAuthoringDisconnect, this));
                Common.NotificationCenter.on('api:disconnect', _.bind(this.onApiCoAuthoringDisconnect, this));
            }
        },

        onChangeCompactView: function(view, compact) {
            this.toolbar.setFolded(compact);
            this.toolbar.fireEvent('view:compact', [this, compact]);

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

        onApiFontSize: function(size) {
            if (this._state.fontsize !== size) {
                this.toolbar.cmbFontSize.setValue(size);
                this._state.fontsize = size;
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
                this.toolbar.btnSuperscript.toggle(typeBaseline==1, true);
                this.toolbar.btnSubscript.toggle(typeBaseline==2, true);
                this._state.valign = typeBaseline;
            }
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

        onApiCanCopyCut: function(can) {
            if (this._state.can_copycut !== can) {
                this.toolbar.btnCopy.setDisabled(!can);
                this._state.can_copycut = can;
            }
        },

        onApiBullets: function(v) {
            var type = v.get_ListType();
            if (this._state.bullets.type != type || this._state.bullets.subtype != v.get_ListSubType() ||
                this.toolbar.btnMarkers.pressed && (type!==0) || this.toolbar.btnNumbers.pressed && (type!==1) || this.toolbar.btnMultilevels.pressed && (type!==2) ) {
                this._state.bullets.type = type;
                this._state.bullets.subtype = v.get_ListSubType();

                this._clearBullets();

                switch(this._state.bullets.type) {
                    case 0:
                        this.toolbar.btnMarkers.toggle(true, true);
                        this.toolbar.mnuMarkersPicker.selectByIndex(this._state.bullets.subtype, true);
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
                        break;
                    case 2:
                        this.toolbar.btnMultilevels.toggle(true, true);
                        this.toolbar.mnuMultilevelPicker.selectByIndex(this._state.bullets.subtype, true);
                        break;
                }
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
                if (!(index < 0)) {
                    this.toolbar.btnHorizontalAlign.menu.items[index].setChecked(true);
                } else if (index == -255) {
                    this.toolbar.btnHorizontalAlign.menu.clearAll();
                }

                var btnHorizontalAlign = this.toolbar.btnHorizontalAlign;

                if ( btnHorizontalAlign.rendered && btnHorizontalAlign.$icon ) {
                    btnHorizontalAlign.$icon.removeClass(btnHorizontalAlign.options.icls).addClass(align);
                    btnHorizontalAlign.options.icls = align;
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
                image_locked = false;

            while (++i < selectedObjects.length) {
                type = selectedObjects[i].get_ObjectType();

                if (type === Asc.c_oAscTypeSelectElement.Paragraph) {
                    paragraph_locked = selectedObjects[i].get_ObjectValue().get_Locked();
                } else if (type === Asc.c_oAscTypeSelectElement.Header) {
                    header_locked = selectedObjects[i].get_ObjectValue().get_Locked();
                } else if (type === Asc.c_oAscTypeSelectElement.Image) {
                    image_locked = selectedObjects[i].get_ObjectValue().get_Locked();
                }
            }

            var need_disable = !this.api.can_AddQuotedComment() || paragraph_locked || header_locked || image_locked;
            if ( this.btnsComment && this.btnsComment.length > 0 )
                this.btnsComment.setDisabled(need_disable);
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
                toolbar = this.toolbar,
                in_header = false,
                in_chart = false,
                in_equation = false,
                btn_eq_state = false,
                in_image = false,
                in_control = false;

            while (++i < selectedObjects.length) {
                type = selectedObjects[i].get_ObjectType();
                pr   = selectedObjects[i].get_ObjectValue();

                if (type === Asc.c_oAscTypeSelectElement.Paragraph) {
                    paragraph_locked = pr.get_Locked();
                    can_add_table = pr.get_CanAddTable();
                    can_add_image = pr.get_CanAddImage();
                    frame_pr = pr;
                    sh = pr.get_Shade();
                } else if (type === Asc.c_oAscTypeSelectElement.Header) {
                    header_locked = pr.get_Locked();
                    in_header = true;
                } else if (type === Asc.c_oAscTypeSelectElement.Image) {
                    in_image = true;
                    image_locked = pr.get_Locked();
                    if (pr && pr.get_ChartProperties())
                        in_chart = true;
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

            var need_disable = paragraph_locked || header_locked;

            if (this._state.prcontrolsdisable != need_disable) {
                if (this._state.activated) this._state.prcontrolsdisable = need_disable;
                _.each (toolbar.paragraphControls, function(item){
                    item.setDisabled(need_disable);
                }, this);
            }

            in_control = this.api.asc_IsContentControl();
            var control_props = in_control ? this.api.asc_GetContentControlProperties() : null,
                lock_type = (in_control&&control_props) ? control_props.get_Lock() : Asc.c_oAscSdtLockType.Unlocked,
                control_plain = (in_control&&control_props) ? (control_props.get_ContentControlType()==Asc.c_oAscSdtLevelType.Inline) : false;
            (lock_type===undefined) && (lock_type = Asc.c_oAscSdtLockType.Unlocked);

            if (!paragraph_locked && !header_locked) {
                toolbar.btnContentControls.menu.items[0].setDisabled(control_plain || lock_type==Asc.c_oAscSdtLockType.SdtContentLocked || lock_type==Asc.c_oAscSdtLockType.ContentLocked);
                toolbar.btnContentControls.menu.items[1].setDisabled(control_plain || lock_type==Asc.c_oAscSdtLockType.SdtContentLocked || lock_type==Asc.c_oAscSdtLockType.ContentLocked);
                toolbar.btnContentControls.menu.items[3].setDisabled(!in_control || lock_type==Asc.c_oAscSdtLockType.SdtContentLocked || lock_type==Asc.c_oAscSdtLockType.SdtLocked);
                toolbar.btnContentControls.menu.items[5].setDisabled(!in_control);
            }

            var need_text_disable = paragraph_locked || header_locked || in_chart;
            if (this._state.textonlycontrolsdisable != need_text_disable) {
                if (this._state.activated) this._state.textonlycontrolsdisable = need_text_disable;
                if (!need_disable) {
                    _.each (toolbar.textOnlyControls, function(item){
                        item.setDisabled(need_text_disable);
                    }, this);
                }
                toolbar.btnCopyStyle.setDisabled(need_text_disable);
                toolbar.btnClearStyle.setDisabled(need_text_disable);
            }

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

            need_disable = need_disable || !enable_dropcap || in_equation || control_plain;
            toolbar.btnDropCap.setDisabled(need_disable);

            if ( !toolbar.btnDropCap.isDisabled() )
                toolbar.mnuDropCapAdvanced.setDisabled(disable_dropcapadv);

            need_disable = !can_add_table || header_locked || in_equation || control_plain;
            toolbar.btnInsertTable.setDisabled(need_disable);

            need_disable = toolbar.mnuPageNumCurrentPos.isDisabled() && toolbar.mnuPageNumberPosPicker.isDisabled() || control_plain;
            toolbar.mnuInsertPageNum.setDisabled(need_disable);

            var in_footnote = this.api.asc_IsCursorInFootnote();
            need_disable = paragraph_locked || header_locked || in_header || in_image || in_equation && !btn_eq_state || in_footnote || in_control;
            toolbar.btnsPageBreak.setDisabled(need_disable);
            toolbar.btnBlankPage.setDisabled(need_disable);

            need_disable = paragraph_locked || header_locked || in_equation || control_plain;
            toolbar.btnInsertShape.setDisabled(need_disable);
            toolbar.btnInsertText.setDisabled(need_disable);

            need_disable = paragraph_locked || header_locked || !can_add_image || in_equation || control_plain;
            toolbar.btnInsertImage.setDisabled(need_disable);
            toolbar.btnInsertTextArt.setDisabled(need_disable || in_image || in_footnote);

            if (in_chart !== this._state.in_chart) {
                toolbar.btnInsertChart.updateHint(in_chart ? toolbar.tipChangeChart : toolbar.tipInsertChart);
                this._state.in_chart = in_chart;
            }

            need_disable = in_chart && image_locked || !in_chart && need_disable || control_plain;
            toolbar.btnInsertChart.setDisabled(need_disable);

            need_disable = paragraph_locked || header_locked || in_chart || !can_add_image&&!in_equation || control_plain;
            toolbar.btnInsertEquation.setDisabled(need_disable);

            need_disable = paragraph_locked || header_locked || in_equation;
            toolbar.btnSuperscript.setDisabled(need_disable);
            toolbar.btnSubscript.setDisabled(need_disable);

            toolbar.btnEditHeader.setDisabled(in_equation);

            need_disable = paragraph_locked || header_locked || in_image || control_plain;
            if (need_disable != toolbar.btnColumns.isDisabled())
                toolbar.btnColumns.setDisabled(need_disable);

            if (toolbar.listStylesAdditionalMenuItem && (frame_pr===undefined) !== toolbar.listStylesAdditionalMenuItem.isDisabled())
                toolbar.listStylesAdditionalMenuItem.setDisabled(frame_pr===undefined);

            need_disable = !this.api.can_AddQuotedComment() || paragraph_locked || header_locked || image_locked;
            if ( this.btnsComment && this.btnsComment.length > 0 )
                this.btnsComment.setDisabled(need_disable);

            this._state.in_equation = in_equation;
        },

        onApiStyleChange: function(v) {
            this.toolbar.btnCopyStyle.toggle(v, true);
            this.modeAlwaysSetStyle = false;
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
                this.toolbar.btnPageOrient.setDisabled(true);
                this.toolbar.btnPageSize.setDisabled(true);
                if (this._state.activated) this._state.lock_doc = true;
            }
        },

        onApiUnLockDocumentProps: function() {
            if (this._state.lock_doc!==false) {
                this.toolbar.btnPageOrient.setDisabled(false);
                this.toolbar.btnPageSize.setDisabled(false);
                if (this._state.activated) this._state.lock_doc = false;
            }
        },

        onApiLockDocumentSchema: function() {
            this.toolbar.btnColorSchemas.setDisabled(true);
        },

        onApiUnLockDocumentSchema: function() {
            this.toolbar.btnColorSchemas.setDisabled(false);
        },

        onApiLockHeaderFooters: function() {
            this.toolbar.mnuPageNumberPosPicker.setDisabled(true);
            this.toolbar.mnuInsertPageNum.setDisabled(this.toolbar.mnuPageNumCurrentPos.isDisabled());
        },

        onApiUnLockHeaderFooters: function() {
            this.toolbar.mnuPageNumberPosPicker.setDisabled(false);
            this.toolbar.mnuInsertPageNum.setDisabled(false);
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

                        if (this.toolbar.mnuHighlightColorPicker.cmpEl) {
                            this._state.clrhighlight = -1;
                            this.toolbar.mnuHighlightColorPicker.select(null, true);
                        }
                    }
                } else if (c !== null) {
                    if (this._state.clrhighlight != c.get_hex().toUpperCase()) {
                        this.toolbar.mnuHighlightTransparent.setChecked(false);
                        this._state.clrhighlight = c.get_hex().toUpperCase();

                        if ( _.contains(this.toolbar.mnuHighlightColorPicker.colors, this._state.clrhighlight) )
                            this.toolbar.mnuHighlightColorPicker.select(this._state.clrhighlight, true);
                    }
                }  else {
                    if ( this._state.clrhighlight !== c) {
                        this.toolbar.mnuHighlightTransparent.setChecked(false, true);
                        this.toolbar.mnuHighlightColorPicker.select(null, true);
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
            this.toolbar.mnuNoControlsColor.setChecked(!show, true);
            this.toolbar.mnuControlsColorPicker.clearSelection();
            if (show){
                var clr = this.api.asc_GetGlobalContentControlHighlightColor();
                if (clr) {
                    clr = Common.Utils.ThemeColor.getHexColor(clr.get_r(), clr.get_g(), clr.get_b());
                    this.toolbar.mnuControlsColorPicker.selectByRGB(clr, true);
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
            if (this.api)
                this.api.asc_Print(Common.Utils.isChrome || Common.Utils.isSafari || Common.Utils.isOpera); // if isChrome or isSafari or isOpera == true use asc_onPrintUrl event

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);

            Common.component.Analytics.trackEvent('Print');
            Common.component.Analytics.trackEvent('ToolBar', 'Print');
        },

        onSave: function(e) {
            var toolbar = this.toolbar;
            if (this.api) {
                var isModified = this.api.asc_isDocumentCanSave();
                var isSyncButton = toolbar.btnCollabChanges && toolbar.btnCollabChanges.$icon.hasClass('btn-synch');
                if (!isModified && !isSyncButton && !toolbar.mode.forcesave)
                    return;

                this.api.asc_Save();
            }

            toolbar.btnSave.setDisabled(!toolbar.mode.forcesave);

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

        onCopyPaste: function(copy, e) {
            var me = this;
            if (me.api) {
                var res = (copy) ? me.api.Copy() : me.api.Paste();
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
                    this.api.put_TextPrBaseline(btn.pressed ? 1 : 0);

                Common.NotificationCenter.trigger('edit:complete', this.toolbar);
                Common.component.Analytics.trackEvent('ToolBar', 'Superscript');
            }
        },

        onSubscript: function(btn, e) {
            if (!this.toolbar.btnSuperscript.pressed) {
                this._state.valign = undefined;
                if (this.api)
                    this.api.put_TextPrBaseline(btn.pressed ? 2 : 0);

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
            if (this.api)
                this.api.put_PrAlign(type);

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Align');
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
                value = value > 100
                    ? 100
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
                btn.toggle(rawData.data.subtype > -1, true);
            }

            this._state.bullets.type = rawData.data.type;
            this._state.bullets.subtype = rawData.data.subtype;
            if (this.api)
                this.api.put_ListType(rawData.data.type, rawData.data.subtype);

            Common.component.Analytics.trackEvent('ToolBar', 'List Type');
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

        onInsertTableClick: function(menu, item, e) {
            if (item.value === 'custom') {
                var me = this;

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
            }
        },

        onInsertImageClick: function(menu, item, e) {
            var me = this;
            if (item.value === 'file') {
                this.toolbar.fireEvent('insertimage', this.toolbar);

                if (this.api)
                    this.api.asc_addImage();

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
                                    me.api.AddImageUrl(checkUrl);

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
                (new Common.Views.SelectFileDlg({
                    fileChoiceUrl: this.toolbar.mode.fileChoiceUrl.replace("{fileExt}", "").replace("{documentType}", "ImagesOnly")
                })).on('selectfile', function(obj, file){
                    me.toolbar.fireEvent('insertimage', me.toolbar);
                    me.api.AddImageUrl(file.url, undefined, true);// for loading from storage
                    Common.component.Analytics.trackEvent('ToolBar', 'Image');
                }).show();
            }
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
                if (item.value !== 'advanced')
                    this.api.change_DocSize(item.value[0], item.value[1]);
                else {
                    var win, props,
                        me = this;
                    win = new DE.Views.PageSizeDialog({
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
                    var section = this.api.asc_GetSectionProps(),
                        errmsg = null,
                        me = this;
                    if (item.value[1] + item.value[3] > parseFloat(section.get_W().toFixed(4))-12.7 )
                        errmsg = this.txtMarginsW;
                    else if (item.value[0] + item.value[2] > parseFloat(section.get_H().toFixed(4))-2.6 )
                        errmsg = this.txtMarginsH;
                    if (errmsg) {
                        Common.UI.warning({
                            title: this.notcriticalErrorTitle,
                            msg  : errmsg,
                            callback: function() {
                                Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                            }
                        });
                        this.onSectionProps(section);
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
                        handler: function(dlg, result) {
                            if (result == 'ok') {
                                props = dlg.getSettings();
                                var mnu = me.toolbar.btnPageMargins.menu.items[0];
                                mnu.setVisible(true);
                                mnu.setChecked(true);
                                mnu.options.value = mnu.value = [props.get_TopMargin(), props.get_LeftMargin(), props.get_BottomMargin(), props.get_RightMargin()];
                                $(mnu.el).html(mnu.template({id: Common.UI.getId(), caption : mnu.caption, options : mnu.options}));
                                Common.localStorage.setItem("de-pgmargins-top", props.get_TopMargin());
                                Common.localStorage.setItem("de-pgmargins-left", props.get_LeftMargin());
                                Common.localStorage.setItem("de-pgmargins-bottom", props.get_BottomMargin());
                                Common.localStorage.setItem("de-pgmargins-right", props.get_RightMargin());

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

        onColorSchemaClick: function(menu, item) {
            if (this.api) {
                this.api.ChangeColorScheme(item.value);

                Common.component.Analytics.trackEvent('ToolBar', 'Color Scheme');
            }

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
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

        onDropCapAdvancedClick: function() {
            var win, props, text,
                me = this;

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
                        fontStore: me.fontstore,
                        paragraphProps: props,
                        borderProps: me.borderAdvancedProps,
                        api: me.api,
                        isFrame: false,
                        handler: function(result, value) {
                            if (result == 'ok') {
                                me.borderAdvancedProps = value.borderProps;
                                if (value.paragraphProps && value.paragraphProps.get_DropCap() === Asc.c_oAscDropCap.None) {
                                    me.api.removeDropcap(true);
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
                this.api.asc_AddContentControl(item.value);
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
                    var win, props = this.api.asc_GetSectionProps(),
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

        onSelectChart: function(picker, item, record) {
            if (!record) return;

            var me      = this,
                type    = record.get('type'),
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
                var props = new Asc.asc_CImgProperty();
                chart.changeType(type);
                props.put_ChartProperties(chart);
                this.api.ImgApply(props);

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

        onInsertPageNumberClick: function(picker, item, record) {
            if (this.api)
                this.api.put_PageNum(record.get('data').type, record.get('data').subtype);

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

        _clearBullets: function() {
            this.toolbar.btnMarkers.toggle(false, true);
            this.toolbar.btnNumbers.toggle(false, true);
            this.toolbar.btnMultilevels.toggle(false, true);

            this.toolbar.mnuMarkersPicker.selectByIndex(0, true);
            this.toolbar.mnuNumbersPicker.selectByIndex(0, true);
            this.toolbar.mnuMultilevelPicker.selectByIndex(0, true);
        },

        _getApiTextSize: function () {
            var out_value   = 12,
                textPr      = this.api.get_TextProps();

            if (textPr && textPr.get_TextPr) {
                out_value = textPr.get_TextPr().get_FontSize();
            }

            return out_value;
        },

        onNewFontColor: function(picker, color) {
            this.toolbar.mnuFontColorPicker.addNewColor();
        },

        onAutoFontColor: function(e) {
            this._state.clrtext = this._state.clrtext_asccolor = undefined;

            var color = new Asc.asc_CColor();
            color.put_auto(true);
            this.api.put_TextColor(color);

            this.toolbar.btnFontColor.currentColor = {color: color, isAuto: true};
            $('.btn-color-value-line', this.toolbar.btnFontColor.cmpEl).css('background-color', '#000');

            this.toolbar.mnuFontColorPicker.clearSelection();
            this.toolbar.mnuFontColorPicker.currentColor = {color: color, isAuto: true};
        },

        onNewParagraphColor: function(picker, color) {
            this.toolbar.mnuParagraphColorPicker.addNewColor();
        },

        onSelectHighlightColor: function(picker, color) {
            this._setMarkerColor(color, 'menu');
        },

        onSelectFontColor: function(picker, color) {
            this._state.clrtext = this._state.clrtext_asccolor = undefined;

            var clr = (typeof(color) == 'object') ? (color.isAuto ? '#000' : color.color) : color;

            this.toolbar.btnFontColor.currentColor = color;
            $('.btn-color-value-line', this.toolbar.btnFontColor.cmpEl).css('background-color', '#' + clr);

            this.toolbar.mnuFontColorPicker.currentColor = color;
            if (this.api)
                this.api.put_TextColor(color.isAuto ? color.color : Common.Utils.ThemeColor.getRgbColor(color));

            Common.component.Analytics.trackEvent('ToolBar', 'Text Color');
        },

        onParagraphColorPickerSelect: function(picker, color) {
            this._state.clrback = this._state.clrshd_asccolor = undefined;

            var clr = (typeof(color) == 'object') ? color.color : color;

            this.toolbar.btnParagraphColor.currentColor = color;
            $('.btn-color-value-line', this.toolbar.btnParagraphColor.cmpEl).css('background-color', color!='transparent'?'#'+clr:clr);

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
            item.setChecked(true, true);
            this.toolbar.btnHighlightColor.currentColor = 'transparent';
            $('.btn-color-value-line', this.toolbar.btnHighlightColor.cmpEl).css('background-color', 'transparent');
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

                if ( typeof(clr) == 'object' ) {
                    var isselected = false;
                    for (var i=0; i<10; i++) {
                        if ( Common.Utils.ThemeColor.ThemeValues[i] == clr.effectValue ) {
                            picker.select(clr,true);
                            isselected = true;
                            break;
                        }
                    }
                    if (!isselected) picker.clearSelection();
                } else
                    picker.select(clr,true);

                this._state.clrback = clr;
            }
            this._state.clrshd_asccolor = shd;
        },

        onApiTextColor: function(color) {
            if (color.get_auto()) {
                if (this._state.clrtext !== 'auto') {
                    this.toolbar.mnuFontColorPicker.clearSelection();
                    var clr_item = this.toolbar.btnFontColor.menu.$el.find('#id-toolbar-menu-auto-fontcolor > a');
                    !clr_item.hasClass('selected') && clr_item.addClass('selected');
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

                    var clr_item = this.toolbar.btnFontColor.menu.$el.find('#id-toolbar-menu-auto-fontcolor > a');
                    clr_item.hasClass('selected') && clr_item.removeClass('selected');
                    if ( typeof(clr) == 'object' ) {
                        var isselected = false;
                        for (var i=0; i<10; i++) {
                            if ( Common.Utils.ThemeColor.ThemeValues[i] == clr.effectValue ) {
                                picker.select(clr,true);
                                isselected = true;
                                break;
                            }
                        }
                        if (!isselected) picker.clearSelection();
                    } else {
                        picker.select(clr,true);
                    }
                    this._state.clrtext = clr;
                }
            }
            this._state.clrtext_asccolor = color;
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
            if (this.api && !this._state.in_equation) {
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
                            model: DE.Models.EquationModel
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

        fillTextArt: function() {
            if (!this.toolbar.btnInsertTextArt.rendered) return;
            
            var me = this;
            if (this.toolbar.mnuTextArtPicker) {
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

                this.toolbar.mnuTextArtPicker.on('item:click', function(picker, item, record, e) {
                    if (me.api) {
                        if (record) {
                            me.toolbar.fireEvent('inserttextart', me.toolbar);
                            me.api.AddTextArt(record.get('data'));
                        }

                        if (me.toolbar.btnInsertShape.pressed)
                            me.toolbar.btnInsertShape.toggle(false, true);

                         if (e.type !== 'click')
                             me.toolbar.btnInsertTextArt.menu.hide();
                        Common.NotificationCenter.trigger('edit:complete', me.toolbar, me.toolbar.btnInsertTextArt);
                        Common.component.Analytics.trackEvent('ToolBar', 'Add Text Art');
                    }
                });
            }
        },

        activateControls: function() {
            _.each(this.toolbar.toolbarControls, function(item){
                item.setDisabled(false);
            }, this);
            this.toolbar.btnUndo.setDisabled(this._state.can_undo!==true);
            this.toolbar.btnRedo.setDisabled(this._state.can_redo!==true);
            this.toolbar.btnCopy.setDisabled(this._state.can_copycut!==true);
            this.toolbar.btnPrint.setDisabled(!this.toolbar.mode.canPrint);
            if (this.toolbar.mode.fileChoiceUrl)
                this.toolbar.btnMailRecepients.setDisabled(false);
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
                $('.btn-color-value-line', this.toolbar.btnFontColor.cmpEl).css('background-color', '#' + this.toolbar.btnFontColor.currentColor);
            }
            if (this._state.clrtext_asccolor!==undefined) {
                this._state.clrtext = undefined;
                this.onApiTextColor(this._state.clrtext_asccolor);
            }
            this._state.clrtext_asccolor = undefined;

            updateColors(this.toolbar.mnuParagraphColorPicker, 0);
            this.toolbar.btnParagraphColor.currentColor = this.toolbar.mnuParagraphColorPicker.currentColor.color || this.toolbar.mnuParagraphColorPicker.currentColor;
            $('.btn-color-value-line', this.toolbar.btnParagraphColor.cmpEl).css('background-color', '#' + this.toolbar.btnParagraphColor.currentColor);
            if (this._state.clrshd_asccolor!==undefined) {
                this._state.clrback = undefined;
                this.onParagraphColor(this._state.clrshd_asccolor);
            }
            this._state.clrshd_asccolor = undefined;

            updateColors(this.toolbar.mnuControlsColorPicker, 1);
            this.onChangeSdtGlobalSettings();
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

            listStyles.menuPicker.store.reset([]); // remove all

            var mainController = this.getApplication().getController('Main');
            _.each(styles.get_MergedStyles(), function(style){
                listStyles.menuPicker.store.add({
                    imageUrl: style.asc_getImage(),
                    title   : style.get_Name(),
                    tip     : mainController.translationTable[style.get_Name()] || style.get_Name(),
                    id      : Common.UI.getId()
                });
            });

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
                me.toolbar.mnuHighlightTransparent.setChecked(false);

                me.toolbar.btnHighlightColor.currentColor = strcolor;
                $('.btn-color-value-line', me.toolbar.btnHighlightColor.cmpEl).css('background-color', '#' + strcolor);

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

        DisableToolbar: function(disable, viewMode, reviewmode) {
            if (viewMode!==undefined) this.editMode = !viewMode;
            disable = disable || !this.editMode;

            var toolbar_mask = $('.toolbar-mask'),
                group_mask = $('.toolbar-group-mask'),
                mask = reviewmode ? group_mask : toolbar_mask;
            if (disable && mask.length>0 || !disable && mask.length==0) return;

            var toolbar = this.toolbar;
            if(disable) {
                if (reviewmode) {
                    mask = $("<div class='toolbar-group-mask'>").appendTo(toolbar.$el.find('.toolbar section.panel .group:not(.no-mask):not(.no-group-mask)'));
                } else
                    mask = $("<div class='toolbar-mask'>").appendTo(toolbar.$el.find('.toolbar'));
            } else {
                mask.remove();
            }
            $('.no-group-mask').css('opacity', (reviewmode || !disable) ? 1 : 0.4);

            disable = disable || (reviewmode ? toolbar_mask.length>0 : group_mask.length>0);
            toolbar.$el.find('.toolbar').toggleClass('masked', disable);
            if ( toolbar.synchTooltip )
                toolbar.synchTooltip.hide();

            toolbar._state.previewmode = reviewmode && disable;
            if (reviewmode) {
                toolbar._state.previewmode && toolbar.btnSave && toolbar.btnSave.setDisabled(true);

                if (toolbar.needShowSynchTip) {
                    toolbar.needShowSynchTip = false;
                    toolbar.onCollaborativeChanges();
                }
            }
            disable ? Common.util.Shortcuts.suspendEvents('alt+h') : Common.util.Shortcuts.resumeEvents('alt+h');
        },

        onSelectRecepientsClick: function() {
            if (this._mailMergeDlg) return;

            var me = this;
            me._mailMergeDlg = new Common.Views.SelectFileDlg({
                            fileChoiceUrl: this.toolbar.mode.fileChoiceUrl.replace("{fileExt}", "xlsx").replace("{documentType}", "")
                        });
            me._mailMergeDlg.on('selectfile', function(obj, recepients){
                me.api.asc_StartMailMerge(recepients);
                if (!me.mergeEditor)
                    me.mergeEditor = me.getApplication().getController('Common.Controllers.ExternalMergeEditor').getView('Common.Views.ExternalMergeEditor');
                if (me.mergeEditor)
                    me.mergeEditor.setEditMode(false);

            }).on('close', function(obj){
                me._mailMergeDlg = undefined;
            });

            me._mailMergeDlg.show();
        },

        createDelayedElements: function() {
            this.toolbar.createDelayedElements();
            this.attachUIEvents(this.toolbar);
        },

        onAppShowed: function (config) {
            var me = this;

            var compactview = !config.isEdit;
            if ( config.isEdit ) {
                if ( Common.localStorage.itemExists("de-compact-toolbar") ) {
                    compactview = Common.localStorage.getBool("de-compact-toolbar");
                } else
                if ( config.customization && config.customization.compactToolbar )
                    compactview = true;
            }

            me.toolbar.render(_.extend({isCompactView: compactview}, config));

            var tab = {action: 'review', caption: me.toolbar.textTabCollaboration};
            var $panel = this.getApplication().getController('Common.Controllers.ReviewChanges').createToolbarPanel();
            if ( $panel )
                me.toolbar.addTab(tab, $panel, 4);

            if ( config.isEdit ) {
                me.toolbar.setMode(config);

                me.toolbar.btnSave.on('disabled', _.bind(me.onBtnChangeState, me, 'save:disabled'));

                if (!(config.customization && config.customization.compactHeader)) {
                    // hide 'print' and 'save' buttons group and next separator
                    me.toolbar.btnPrint.$el.parents('.group').hide().next().hide();

                    // hide 'undo' and 'redo' buttons and retrieve parent container
                    var $box = me.toolbar.btnUndo.$el.hide().next().hide().parent();

                    // move 'paste' button to the container instead of 'undo' and 'redo'
                    me.toolbar.btnPaste.$el.detach().appendTo($box);
                    me.toolbar.btnCopy.$el.removeClass('split');
                }

                if ( config.isDesktopApp ) {
                    if ( config.canProtect ) {
                        tab = {action: 'protect', caption: me.toolbar.textTabProtect};
                        $panel = me.getApplication().getController('Common.Controllers.Protection').createToolbarPanel();

                        if ($panel) me.toolbar.addTab(tab, $panel, 5);
                    }
                }

                var links = me.getApplication().getController('Links');
                links.setApi(me.api).setConfig({toolbar: me});
                Array.prototype.push.apply(me.toolbar.toolbarControls, links.getView('Links').getButtons());
            }
        },

        onAppReady: function (config) {
            var me = this;
            me.appOptions = config;

            if ( config.canCoAuthoring && config.canComments ) {
                this.btnsComment = createButtonSet();
                var slots = me.toolbar.$el.find('.slot-comment');
                slots.each(function(index, el) {
                    var _cls = 'btn-toolbar';
                    /x-huge/.test(el.className) && (_cls += ' x-huge icon-top');

                    var button = new Common.UI.Button({
                        id: 'tlbtn-addcomment-' + index,
                        cls: _cls,
                        iconCls: 'btn-menu-comments',
                        caption: me.toolbar.capBtnComment
                    }).render( slots.eq(index) );

                    me.btnsComment.add(button);
                });

                if ( this.btnsComment.length ) {
                    var _comments = DE.getController('Common.Controllers.Comments').getView();
                    this.btnsComment.forEach(function (btn) {
                        btn.updateHint( _comments.textHintAddComment );
                        btn.on('click', function (btn, e) {
                            Common.NotificationCenter.trigger('app:comment:add', 'toolbar');
                        });
                    }, this);
                }
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
                }
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

        textEmptyImgUrl                            : 'You need to specify image URL.',
        textWarning                                : 'Warning',
        textFontSizeErr                            : 'The entered value is incorrect.<br>Please enter a numeric value between 1 and 100',
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
        confirmAddFontName: 'The font you are going to save is not available on the current device.<br>The text style will be displayed using one of the device fonts, the saved font will be used when it is available.<br>Do you want to continue?',
        notcriticalErrorTitle: 'Warning',
        txtMarginsW: 'Left and right margins are too high for a given page wight',
        txtMarginsH: 'Top and bottom margins are too high for a given page height'

    }, DE.Controllers.Toolbar || {}));
});