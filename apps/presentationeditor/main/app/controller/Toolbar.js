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
 *  Toolbar controller
 *
 *  Created by Alexander Yuzhin on 4/16/14
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
    'common/main/lib/view/ListSettingsDialog',
    'common/main/lib/view/SymbolTableDialog',
    'common/main/lib/util/define',
    'presentationeditor/main/app/collection/SlideThemes',
    'presentationeditor/main/app/view/Toolbar',
    'presentationeditor/main/app/view/DateTimeDialog',
    'presentationeditor/main/app/view/HeaderFooterDialog',
    'presentationeditor/main/app/view/HyperlinkSettingsDialog',
    'presentationeditor/main/app/view/SlideSizeSettings',
    'presentationeditor/main/app/view/SlideshowSettings'
], function () { 'use strict';

    PE.Controllers.Toolbar = Backbone.Controller.extend(_.extend({
        models: [],
        collections: [
            'SlideThemes'
        ],
        views: [
            'Toolbar'
        ],

        initialize: function() {
            this._state = {
                activated: false,
                themeId: undefined,
                bullets: {type:undefined, subtype:undefined},
                prcontrolsdisable:undefined,
                slidecontrolsdisable:undefined,
                slidelayoutdisable:undefined,
                shapecontrolsdisable:undefined,
                no_paragraph: undefined,
                no_text: undefined,
                no_object: undefined,
                clrtext: undefined,
                linespace: undefined,
                pralign: undefined,
                valign: undefined,
                vtextalign: undefined,
                can_undo: undefined,
                can_redo: undefined,
                bold: undefined,
                italic: undefined,
                strike: undefined,
                underline: undefined,
                can_group: undefined,
                can_ungroup: undefined,
                lock_doc: undefined,
                changeslide_inited: false,
                no_slides:undefined,
                can_increase: undefined,
                can_decrease: undefined,
                can_hyper: undefined,
                zoom_type: undefined,
                zoom_percent: undefined,
                fontsize: undefined,
                in_equation: undefined,
                in_chart: false,
                no_columns: false,
                clrhighlight: undefined
            };
            this._isAddingShape = false;
            this.slideSizeArr = [
                { size: [9144000, 6858000], ratio: 6858000/9144000, type: Asc.c_oAscSlideSZType.SzScreen4x3},
                { size: [12192000, 6858000], ratio: 6858000/12192000, type: Asc.c_oAscSlideSZType.SzCustom} ];
            this.currentPageSize = {
                type: Asc.c_oAscSlideSZType.SzCustom,
                width: 0,
                height: 0
            };
            this.flg = {};
            this.diagramEditor = null;
            this.editMode = true;

            this.addListeners({
                'Toolbar': {
                    'insert:image'      : this.onInsertImageClick.bind(this),
                    'insert:text'       : this.onInsertText.bind(this),
                    'insert:textart'    : this.onInsertTextart.bind(this),
                    'insert:shape'      : this.onInsertShape.bind(this),
                    'add:slide'         : this.onAddSlide.bind(this),
                    'change:slide'      : this.onChangeSlide.bind(this),
                    'change:compact'    : this.onClickChangeCompact,
                    'add:chart'         : this.onSelectChart
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
                            _format = Asc.c_oAscFileType[ _file_type.toUpperCase() ];
                        }

                        var _supported = [
                            Asc.c_oAscFileType.PPTX,
                            Asc.c_oAscFileType.ODP,
                            Asc.c_oAscFileType.PDFA,
                            Asc.c_oAscFileType.POTX,
                            Asc.c_oAscFileType.OTP
                        ];

                        if ( !_format || _supported.indexOf(_format) < 0 )
                            _format = Asc.c_oAscFileType.PDF;

                        _main.api.asc_DownloadAs(new Asc.asc_CDownloadOptions(_format));
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
                    if ( me.toolbar.btnsInsertText.pressed() && !me.toolbar.btnsInsertText.contains(btn_id) ||
                            me.toolbar.btnsInsertShape.pressed() && !me.toolbar.btnsInsertShape.contains(btn_id) )
                    {
                        me._isAddingShape         = false;

                        me._addAutoshape(false);
                        me.toolbar.btnsInsertShape.toggle(false, true);
                        me.toolbar.btnsInsertText.toggle(false, true);
                        Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                    } else
                    if ( me.toolbar.btnsInsertShape.pressed() && me.toolbar.btnsInsertShape.contains(btn_id) ) {
                        _.defer(function(){
                            me.api.StartAddShape('', false);
                            Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                        }, 100);
                    }
                }
            };

            this.onApiEndAddShape = function() {
                this.toolbar.fireEvent('insertshape', this.toolbar);

                if ( this.toolbar.btnsInsertShape.pressed() )
                    this.toolbar.btnsInsertShape.toggle(false, true);

                if ( this.toolbar.btnsInsertText.pressed() )
                    this.toolbar.btnsInsertText.toggle(false, true);

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
        },

        onLaunch: function() {
            var me = this;

            // Create toolbar view
            me.toolbar = me.createView('Toolbar');

            Common.NotificationCenter.on('app:ready', me.onAppReady.bind(me));
            Common.NotificationCenter.on('app:face', me.onAppShowed.bind(me));

            PE.getCollection('ShapeGroups').bind({
                reset: me.onResetAutoshapes.bind(this)
            });

            PE.getCollection('SlideLayouts').bind({
                reset: me.onResetSlides.bind(this)
            });
        },

        setMode: function(mode) {
            this.mode = mode;
            this.toolbar.applyLayout(mode);
        },

        attachUIEvents: function(toolbar) {
            /**
             * UI Events
             */

            toolbar.btnPreview.on('click',                              _.bind(this.onPreviewBtnClick, this));
            toolbar.btnPreview.menu.on('item:click',                    _.bind(this.onPreviewItemClick, this));
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
            toolbar.mnuFontColorPicker.on('select',                     _.bind(this.onSelectFontColor, this));
            $('#id-toolbar-menu-new-fontcolor').on('click',             _.bind(this.onNewFontColor, this));
            toolbar.btnHighlightColor.on('click',                       _.bind(this.onBtnHighlightColor, this));
            toolbar.mnuHighlightColorPicker.on('select',                _.bind(this.onSelectHighlightColor, this));
            toolbar.mnuHighlightTransparent.on('click',                 _.bind(this.onHighlightTransparentClick, this));
            toolbar.btnLineSpace.menu.on('item:toggle',                 _.bind(this.onLineSpaceToggle, this));
            toolbar.btnColumns.menu.on('item:click',                    _.bind(this.onColumnsSelect, this));
            toolbar.btnColumns.menu.on('show:before',                   _.bind(this.onBeforeColumns, this));
            toolbar.btnShapeAlign.menu.on('item:click',                 _.bind(this.onShapeAlign, this));
            toolbar.btnShapeAlign.menu.on('show:before',                _.bind(this.onBeforeShapeAlign, this));
            toolbar.btnShapeArrange.menu.on('item:click',               _.bind(this.onShapeArrange, this));
            toolbar.btnInsertHyperlink.on('click',                      _.bind(this.onHyperlinkClick, this));
            toolbar.mnuTablePicker.on('select',                         _.bind(this.onTablePickerSelect, this));
            toolbar.btnInsertTable.menu.on('item:click',                _.bind(this.onInsertTableClick, this));
            toolbar.btnClearStyle.on('click',                           _.bind(this.onClearStyleClick, this));
            toolbar.btnCopyStyle.on('toggle',                           _.bind(this.onCopyStyleToggle, this));
            toolbar.btnColorSchemas.menu.on('item:click',               _.bind(this.onColorSchemaClick, this));
            toolbar.btnColorSchemas.menu.on('show:after',               _.bind(this.onColorSchemaShow, this));
            toolbar.btnSlideSize.menu.on('item:click',                  _.bind(this.onSlideSize, this));
            toolbar.listTheme.on('click',                               _.bind(this.onListThemeSelect, this));
            toolbar.btnInsertEquation.on('click',                       _.bind(this.onInsertEquationClick, this));
            toolbar.btnInsertSymbol.on('click',                         _.bind(this.onInsertSymbolClick, this));
            toolbar.btnEditHeader.on('click',                           _.bind(this.onEditHeaderClick, this, 'header'));
            toolbar.btnInsDateTime.on('click',                          _.bind(this.onEditHeaderClick, this, 'datetime'));
            toolbar.btnInsSlideNum.on('click',                          _.bind(this.onEditHeaderClick, this, 'slidenum'));
            Common.Gateway.on('insertimage',                            _.bind(this.insertImage, this));
            toolbar.btnInsAudio && toolbar.btnInsAudio.on('click',      _.bind(this.onAddAudio, this));
            toolbar.btnInsVideo && toolbar.btnInsVideo.on('click',      _.bind(this.onAddVideo, this));

            this.onSetupCopyStyleButton();
        },

        setApi: function(api) {
            this.api = api;

            if (this.mode.isEdit) {
                this.toolbar.setApi(api);

                this.api.asc_registerCallback('asc_onFontSize',             _.bind(this.onApiFontSize, this));
                this.api.asc_registerCallback('asc_onBold',                 _.bind(this.onApiBold, this));
                this.api.asc_registerCallback('asc_onItalic',               _.bind(this.onApiItalic, this));
                this.api.asc_registerCallback('asc_onUnderline',            _.bind(this.onApiUnderline, this));
                this.api.asc_registerCallback('asc_onStrikeout',            _.bind(this.onApiStrikeout, this));
                this.api.asc_registerCallback('asc_onVerticalAlign',        _.bind(this.onApiVerticalAlign, this));
                Common.NotificationCenter.on('fonts:change',                _.bind(this.onApiChangeFont, this));

                this.api.asc_registerCallback('asc_onCanUndo',              _.bind(this.onApiCanRevert, this, 'undo'));
                this.api.asc_registerCallback('asc_onCanRedo',              _.bind(this.onApiCanRevert, this, 'redo'));
                this.api.asc_registerCallback('asc_onPaintFormatChanged',   _.bind(this.onApiStyleChange, this));
                this.api.asc_registerCallback('asc_onListType',             _.bind(this.onApiBullets, this));
                this.api.asc_registerCallback('asc_canIncreaseIndent',      _.bind(this.onApiCanIncreaseIndent, this));
                this.api.asc_registerCallback('asc_canDecreaseIndent',      _.bind(this.onApiCanDecreaseIndent, this));
                this.api.asc_registerCallback('asc_onLineSpacing',          _.bind(this.onApiLineSpacing, this));
                this.api.asc_registerCallback('asc_onPrAlign',              _.bind(this.onApiParagraphAlign, this));
                this.api.asc_registerCallback('asc_onVerticalTextAlign',    _.bind(this.onApiVerticalTextAlign, this));
                this.api.asc_registerCallback('asc_onCanAddHyperlink',      _.bind(this.onApiCanAddHyperlink, this));
                this.api.asc_registerCallback('asc_onTextColor',            _.bind(this.onApiTextColor, this));
                this.api.asc_registerCallback('asc_onMarkerFormatChanged', _.bind(this.onApiStartHighlight, this));
                this.api.asc_registerCallback('asc_onTextHighLight',       _.bind(this.onApiHighlightColor, this));

                this.api.asc_registerCallback('asc_onUpdateThemeIndex',     _.bind(this.onApiUpdateThemeIndex, this));
                this.api.asc_registerCallback('asc_onEndAddShape',          _.bind(this.onApiEndAddShape, this));
                this.api.asc_registerCallback('asc_onCanGroup',             _.bind(this.onApiCanGroup, this));
                this.api.asc_registerCallback('asc_onCanUnGroup',           _.bind(this.onApiCanUnGroup, this));
                this.api.asc_registerCallback('asc_onPresentationSize',     _.bind(this.onApiPageSize, this));

                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',_.bind(this.onApiCoAuthoringDisconnect, this));
                Common.NotificationCenter.on('api:disconnect',              _.bind(this.onApiCoAuthoringDisconnect, this));
                this.api.asc_registerCallback('asc_onZoomChange',           _.bind(this.onApiZoomChange, this));
                this.api.asc_registerCallback('asc_onFocusObject',          _.bind(this.onApiFocusObject, this));
                this.api.asc_registerCallback('asc_onLockDocumentProps',    _.bind(this.onApiLockDocumentProps, this));
                this.api.asc_registerCallback('asc_onUnLockDocumentProps',  _.bind(this.onApiUnLockDocumentProps, this));
                this.api.asc_registerCallback('asc_onLockDocumentTheme',    _.bind(this.onApiLockDocumentTheme, this));
                this.api.asc_registerCallback('asc_onUnLockDocumentTheme',  _.bind(this.onApiUnLockDocumentTheme, this));
                this.api.asc_registerCallback('asc_onInitEditorStyles',     _.bind(this.onApiInitEditorStyles, this));

                this.api.asc_registerCallback('asc_onCountPages',           _.bind(this.onApiCountPages, this));
                this.api.asc_registerCallback('asc_onMathTypes',            _.bind(this.onApiMathTypes, this));
                this.api.asc_registerCallback('asc_onContextMenu',          _.bind(this.onContextMenu, this));
                this.api.asc_registerCallback('asc_onTextLanguage',         _.bind(this.onTextLanguage, this));
                Common.NotificationCenter.on('storage:image-load',          _.bind(this.openImageFromStorage, this));
                Common.NotificationCenter.on('storage:image-insert',        _.bind(this.insertImageFromStorage, this));
            } else if (this.mode.isRestrictedEdit) {
                this.api.asc_registerCallback('asc_onCountPages',           _.bind(this.onApiCountPagesRestricted, this));
            }
        },

        onChangeCompactView: function(view, compact) {
            this.toolbar.setFolded(compact);
            this.toolbar.fireEvent('view:compact', [this.toolbar, compact]);

            Common.localStorage.setBool('pe-compact-toolbar', compact);
            Common.NotificationCenter.trigger('layout:changed', 'toolbar');
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onClickChangeCompact: function (from) {
            if ( from != 'file' ) {
                var me = this;
                Common.Utils.asyncCall(function () {
                    me.onChangeCompactView(null, !me.toolbar.isCompact());
                });
            }
        },

        onContextMenu: function() {
            this.toolbar.collapse();
        },

        onApiChangeFont: function(font) {
            !Common.Utils.ModalWindow.isVisible() && this.toolbar.cmbFontName.onApiChangeFont(font);
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
                    this.toolbar.lockToolbar(PE.enumLock.undoLock, !can, {array: [this.toolbar.btnUndo]});
                    if (this._state.activated) this._state.can_undo = can;
                }
            } else {
                if (this._state.can_redo !== can) {
                    this.toolbar.lockToolbar(PE.enumLock.redoLock, !can, {array: [this.toolbar.btnRedo]});
                    if (this._state.activated) this._state.can_redo = can;
                }
            }
        },

        onApiCanIncreaseIndent: function(value) {
            if (this._state.can_increase !== value) {
                this.toolbar.lockToolbar(PE.enumLock.incIndentLock, !value, {array: [this.toolbar.btnIncLeftOffset]});
                if (this._state.activated) this._state.can_increase = value;
            }
        },

        onApiCanDecreaseIndent: function(value) {
            if (this._state.can_decrease !== value) {
                this.toolbar.lockToolbar(PE.enumLock.decIndentLock, !value, {array: [this.toolbar.btnDecLeftOffset]});
                if (this._state.activated) this._state.can_decrease = value;
            }
        },

        onApiBullets: function(v) {
            if (this._state.bullets.type != v.get_ListType() || this._state.bullets.subtype != v.get_ListSubType()) {
                this._state.bullets.type    = v.get_ListType();
                this._state.bullets.subtype = v.get_ListSubType();

                this._clearBullets();

                switch(this._state.bullets.type) {
                    case 0:
                        this.toolbar.btnMarkers.toggle(true, true);
                        if (this._state.bullets.subtype!==undefined)
                            this.toolbar.mnuMarkersPicker.selectByIndex(this._state.bullets.subtype, true);
                        else
                            this.toolbar.mnuMarkersPicker.deselectAll(true);
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
                }
            }
        },

        onApiParagraphAlign: function(v) {
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

        onApiCanAddHyperlink: function(value) {
            if (this._state.can_hyper !== value && this.editMode) {
                this.toolbar.lockToolbar(PE.enumLock.hyperlinkLock, !value, {array: [this.toolbar.btnInsertHyperlink]});
                if (this._state.activated) this._state.can_hyper = value;
            }
        },

        onApiPageSize: function(width, height, type) {
            if (Math.abs(this.currentPageSize.width - width) > 0.001 ||
                Math.abs(this.currentPageSize.height - height) > 0.001 ||
                this.currentPageSize.type !== type) {
                this.currentPageSize.width  = width;
                this.currentPageSize.height = height;
                this.currentPageSize.type   = type;

                var ratio = height/width;
                var idx = -1;
                for (var i = 0; i < this.slideSizeArr.length; i++) {
                    if (Math.abs(this.slideSizeArr[i].ratio - ratio) < 0.001 ) {
                        idx = i;
                        break;
                    }
                }

                this.toolbar.btnSlideSize.menu.items[0].setChecked(idx == 0);
                this.toolbar.btnSlideSize.menu.items[1].setChecked(idx == 1);
            }
        },

        onApiCountPages: function(count) {
            if (this._state.no_slides !== (count<=0)) {
                this._state.no_slides = (count<=0);
                this.toolbar.lockToolbar(PE.enumLock.noSlides, this._state.no_slides, {array: this.toolbar.paragraphControls});
                this.toolbar.lockToolbar(PE.enumLock.noSlides, this._state.no_slides, {array: [
                    this.toolbar.btnChangeSlide, this.toolbar.btnPreview, this.toolbar.btnPrint, this.toolbar.btnCopy, this.toolbar.btnPaste,
                    this.toolbar.btnCopyStyle, this.toolbar.btnInsertTable, this.toolbar.btnInsertChart,
                    this.toolbar.btnColorSchemas, this.toolbar.btnShapeAlign,
                    this.toolbar.btnShapeArrange, this.toolbar.btnSlideSize,  this.toolbar.listTheme, this.toolbar.btnEditHeader, this.toolbar.btnInsDateTime, this.toolbar.btnInsSlideNum
                ]});
                this.toolbar.lockToolbar(PE.enumLock.noSlides, this._state.no_slides,
                    { array:  this.toolbar.btnsInsertImage.concat(this.toolbar.btnsInsertText, this.toolbar.btnsInsertShape, this.toolbar.btnInsertEquation, this.toolbar.btnInsertTextArt, this.toolbar.btnInsAudio, this.toolbar.btnInsVideo) });
                if (this.btnsComment)
                    this.toolbar.lockToolbar(PE.enumLock.noSlides, this._state.no_slides, { array:  this.btnsComment });
            }
        },

        onApiCountPagesRestricted: function(count) {
            if (this._state.no_slides !== (count<=0)) {
                this._state.no_slides = (count<=0);
                if (this.btnsComment)
                    this.toolbar.lockToolbar(PE.enumLock.noSlides, this._state.no_slides, { array:  this.btnsComment });
            }
        },

        onApiFocusObject: function(selectedObjects) {
            if (!this.editMode) return;

            var me = this,
                pr, sh, i = -1,type,
                paragraph_locked = undefined,
                shape_locked = undefined,
                slide_deleted = undefined,
                slide_layout_lock = undefined,
                no_paragraph = true,
                no_text = true,
                no_object = true,
                in_equation = false,
                in_chart = false,
                layout_index = -1,
                no_columns = false;

            while (++i < selectedObjects.length) {
                type = selectedObjects[i].get_ObjectType();
                pr   = selectedObjects[i].get_ObjectValue();
                if (type == Asc.c_oAscTypeSelectElement.Paragraph) {
                    paragraph_locked = pr.get_Locked();
                    no_paragraph = false;
                    no_text = false;
                } else if (type == Asc.c_oAscTypeSelectElement.Slide) {
                    slide_deleted = pr.get_LockDelete();
                    slide_layout_lock = pr.get_LockLayout();
                    layout_index = pr.get_LayoutIndex();
                } else if (type == Asc.c_oAscTypeSelectElement.Image || type == Asc.c_oAscTypeSelectElement.Shape || type == Asc.c_oAscTypeSelectElement.Chart || type == Asc.c_oAscTypeSelectElement.Table) {
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
                        in_chart = true;
                        no_columns = true;
                    }
                    if (type == Asc.c_oAscTypeSelectElement.Shape) {
                        var shapetype = pr.asc_getType();
                        if (shapetype=='line' || shapetype=='bentConnector2' || shapetype=='bentConnector3'
                            || shapetype=='bentConnector4' || shapetype=='bentConnector5' || shapetype=='curvedConnector2'
                            || shapetype=='curvedConnector3' || shapetype=='curvedConnector4' || shapetype=='curvedConnector5'
                            || shapetype=='straightConnector1')
                            no_columns = true;
                    }
                    if (type == Asc.c_oAscTypeSelectElement.Image || type == Asc.c_oAscTypeSelectElement.Table)
                        no_columns = true;
                } else if (type === Asc.c_oAscTypeSelectElement.Math) {
                    in_equation = true;
                }
            }

            if (in_chart !== this._state.in_chart) {
                this.toolbar.btnInsertChart.updateHint(in_chart ? this.toolbar.tipChangeChart : this.toolbar.tipInsertChart);
                this._state.in_chart = in_chart;
            }

            if (this._state.prcontrolsdisable !== paragraph_locked) {
                if (this._state.activated) this._state.prcontrolsdisable = paragraph_locked;
                if (paragraph_locked!==undefined)
                    this.toolbar.lockToolbar(PE.enumLock.paragraphLock, paragraph_locked, {array: me.toolbar.paragraphControls});
                this.toolbar.lockToolbar(PE.enumLock.paragraphLock, paragraph_locked===true, {array: [me.toolbar.btnInsDateTime, me.toolbar.btnInsSlideNum]});
            }

            if (this._state.no_paragraph !== no_paragraph) {
                if (this._state.activated) this._state.no_paragraph = no_paragraph;
                this.toolbar.lockToolbar(PE.enumLock.noParagraphSelected, no_paragraph, {array: me.toolbar.paragraphControls});
                this.toolbar.lockToolbar(PE.enumLock.noParagraphSelected, no_paragraph, {array: [me.toolbar.btnCopyStyle]});
            }

            if (this._state.no_text !== no_text) {
                if (this._state.activated) this._state.no_text = no_text;
                this.toolbar.lockToolbar(PE.enumLock.noTextSelected, no_text, {array: me.toolbar.paragraphControls});
            }

            if (shape_locked!==undefined && this._state.shapecontrolsdisable !== shape_locked) {
                if (this._state.activated) this._state.shapecontrolsdisable = shape_locked;
                this.toolbar.lockToolbar(PE.enumLock.shapeLock, shape_locked, {array: me.toolbar.shapeControls.concat(me.toolbar.paragraphControls)});
            }

            if (this._state.no_object !== no_object ) {
                if (this._state.activated) this._state.no_object = no_object;
                this.toolbar.lockToolbar(PE.enumLock.noObjectSelected, no_object, {array: [me.toolbar.btnShapeAlign, me.toolbar.btnShapeArrange, me.toolbar.btnVerticalAlign ]});
            }

            if (slide_layout_lock !== undefined && this._state.slidelayoutdisable !== slide_layout_lock ) {
                if (this._state.activated) this._state.slidelayoutdisable = slide_layout_lock;
                this.toolbar.lockToolbar(PE.enumLock.slideLock, slide_layout_lock, {array: [me.toolbar.btnChangeSlide]});
            }

            if (slide_deleted !== undefined && this._state.slidecontrolsdisable !== slide_deleted) {
                if (this._state.activated) this._state.slidecontrolsdisable = slide_deleted;
                this.toolbar.lockToolbar(PE.enumLock.slideDeleted, slide_deleted, {array: me.toolbar.slideOnlyControls.concat(me.toolbar.paragraphControls)});
            }

            if (this._state.in_equation !== in_equation) {
                if (this._state.activated) this._state.in_equation = in_equation;
                this.toolbar.lockToolbar(PE.enumLock.inEquation, in_equation, {array: [me.toolbar.btnSuperscript, me.toolbar.btnSubscript]});
            }

            if (this._state.no_columns !== no_columns) {
                if (this._state.activated) this._state.no_columns = no_columns;
                this.toolbar.lockToolbar(PE.enumLock.noColumns, no_columns, {array: [me.toolbar.btnColumns]});
            }

            if (this.toolbar.btnChangeSlide) {
                if (this.toolbar.btnChangeSlide.mnuSlidePicker)
                    this.toolbar.btnChangeSlide.mnuSlidePicker.options.layout_index = layout_index;
                else
                    this.toolbar.btnChangeSlide.mnuSlidePicker = {options: {layout_index: layout_index}};
            }
        },

        onApiStyleChange: function(v) {
            this.toolbar.btnCopyStyle.toggle(v, true);
            this.modeAlwaysSetStyle = false;
        },

        onApiUpdateThemeIndex: function(v) {
            if (this._state.themeId !== v) {
                var listStyle = this.toolbar.listTheme,
                    listStylesVisible = (listStyle.rendered);

                if (listStylesVisible) {
                    listStyle.suspendEvents();

                    var styleRec = listStyle.menuPicker.store.findWhere({
                        themeId: v
                    });
                    this._state.themeId = (listStyle.menuPicker.store.length>0) ? v : undefined;

                    listStyle.menuPicker.selectRecord(styleRec);
                    listStyle.resumeEvents();
                }
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

        onApiLockDocumentProps: function() {
            if (this._state.lock_doc!==true) {
                this.toolbar.lockToolbar(PE.enumLock.docPropsLock, true, {array: [this.toolbar.btnSlideSize]});
                if (this._state.activated) this._state.lock_doc = true;
            }
        },

        onApiUnLockDocumentProps: function() {
            if (this._state.lock_doc!==false) {
                this.toolbar.lockToolbar(PE.enumLock.docPropsLock, false, {array: [this.toolbar.btnSlideSize]});
                if (this._state.activated) this._state.lock_doc = false;
            }
        },

        onApiLockDocumentTheme: function() {
            this.toolbar.lockToolbar(PE.enumLock.themeLock, true, {array: [this.toolbar.btnColorSchemas, this.toolbar.listTheme]});
        },

        onApiUnLockDocumentTheme: function() {
            this.toolbar.lockToolbar(PE.enumLock.themeLock, false, {array: [this.toolbar.btnColorSchemas, this.toolbar.listTheme]});
        },

        onApiCoAuthoringDisconnect: function(enableDownload) {
            this.toolbar.setMode({isDisconnected:true, enableDownload: !!enableDownload});
            this.editMode = false;
        },

        onApiZoomChange: function(percent, type) {},

        onApiInitEditorStyles: function(themes) {
            if (themes) {
                this._onInitEditorThemes(themes[0], themes[1]);
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

        onAddSlide: function(type) {
            if ( this.api) {
                this.api.AddSlide(type);

                Common.NotificationCenter.trigger('edit:complete', this.toolbar);
                Common.component.Analytics.trackEvent('ToolBar', 'Add Slide');
            }
        },

        onChangeSlide: function(type) {
            if (this.api) {
                this.api.ChangeLayout(type);

                Common.NotificationCenter.trigger('edit:complete', this.toolbar);
                Common.component.Analytics.trackEvent('ToolBar', 'Change Layout');
            }
        },

        onPreview: function(slidenum, presenter) {
            Common.NotificationCenter.trigger('preview:start', _.isNumber(slidenum) ? slidenum : 0, presenter);
        },

        onPreviewBtnClick: function(btn, e) {
            this.onPreview(this.api.getCurrentPage());
        },

        onPreviewItemClick: function(menu, item) {
            switch (item.value) {
                case 0:
                    this.onPreview(0);
                break;
                case 1:
                    this.onPreview(this.api.getCurrentPage());
                break;
                case 2:
                    this.onPreview(0, true);
                break;
                case 3:
                    var win,
                        me = this,
                        selectedElements = me.api.getSelectedElements(),
                        loop = false;
                    if (selectedElements && _.isArray(selectedElements)){
                        for (var i=0; i<selectedElements.length; i++) {
                            if (Asc.c_oAscTypeSelectElement.Slide == selectedElements[i].get_ObjectType()) {
                                var elValue = selectedElements[i].get_ObjectValue(),
                                    transition = elValue.get_transition();
                                if (transition)
                                    loop = transition.get_ShowLoop();
                            }
                        }
                    }

                    var handlerDlg = function(dlg, result) {
                        if (result == 'ok') {
                            loop = dlg.getSettings();
                            if (me.api) {
                                var props = new Asc.CAscSlideProps();
                                var transition = new Asc.CAscSlideTransition();
                                transition.put_ShowLoop(loop);
                                props.put_transition(transition);
                                me.api.SetSlideProps(props);
                            }
                        }
                        Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                    };

                    win = new PE.Views.SlideshowSettings({
                        handler: handlerDlg
                    });
                    win.show();
                    win.setSettings(loop);
                break;
            }
        },
        
        onPrint: function(e) {
            if (this.api)
                this.api.asc_Print(new Asc.asc_CDownloadOptions(null, Common.Utils.isChrome || Common.Utils.isSafari || Common.Utils.isOpera || Common.Utils.isGecko && Common.Utils.firefoxVersion>86)); // if isChrome or isSafari or isOpera == true use asc_onPrintUrl event

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);

            Common.component.Analytics.trackEvent('Print');
            Common.component.Analytics.trackEvent('ToolBar', 'Print');
        },

        onSave: function(e) {
            var toolbar = this.toolbar;
            if (this.api && this.api.asc_isDocumentCanSave) {
                var isModified = this.api.asc_isDocumentCanSave();
                var isSyncButton = toolbar.btnCollabChanges && toolbar.btnCollabChanges.cmpEl.hasClass('notify');
                if (!isModified && !isSyncButton && !this.toolbar.mode.forcesave)
                    return;

                this.api.asc_Save();
            }

            toolbar.btnSave.setDisabled(!toolbar.mode.forcesave);

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
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
            if (this.api) {
                this.api.Undo();
            }

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Undo');
        },

        onRedo: function(btn, e) {
            if (this.api) {
                this.api.Redo();
            }

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Redo');
        },

        onCopyPaste: function(copy, e) {
            var me = this;
            if (me.api) {
                var res = (copy) ? me.api.Copy() : me.api.Paste();
                if (!res) {
                    if (!Common.localStorage.getBool("pe-hide-copywarning")) {
                        (new Common.Views.CopyWarningDialog({
                            handler: function(dontshow) {
                                if (dontshow) Common.localStorage.setItem("pe-hide-copywarning", 1);
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
                    value = /^\+?(\d*(\.|,).?\d+)$|^\+?(\d+(\.|,)?\d*)$/.exec(record.value);

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
                arr.push(item.get('id'));
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
                btn.toggle(rawData.data.subtype > -1, true);
            }

            if (this.api)
                this.api.put_ListType(rawData.data.type, rawData.data.subtype);

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
                                var win = new PE.Views.ShapeSettingsAdvanced(
                                    {
                                        shapeProps: elValue,
                                        handler: function(result, value) {
                                            if (result == 'ok') {
                                                if (me.api) {
                                                    me.api.ShapeApply(value.shapeProps);
                                                }
                                            }
                                            me.fireEvent('editcomplete', me);
                                        }
                                    });
                                win.show();
                                win.setActiveCategory(4);
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

        onBeforeShapeAlign: function() {
            var value = this.api.asc_getSelectedDrawingObjectsCount(),
                slide_checked = Common.Utils.InternalSettings.get("pe-align-to-slide") || false;
            this.toolbar.mniAlignObjects.setDisabled(value<2);
            this.toolbar.mniAlignObjects.setChecked(value>1 && !slide_checked, true);
            this.toolbar.mniAlignToSlide.setChecked(value<2 || slide_checked, true);
            this.toolbar.mniDistribHor.setDisabled(value<3 && this.toolbar.mniAlignObjects.isChecked());
            this.toolbar.mniDistribVert.setDisabled(value<3 && this.toolbar.mniAlignObjects.isChecked());
        },

        onShapeAlign: function(menu, item) {
            if (this.api) {
                var value = this.toolbar.mniAlignToSlide.isChecked() ? Asc.c_oAscObjectsAlignType.Slide : Asc.c_oAscObjectsAlignType.Selected;
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

        onHyperlinkClick: function(btn) {
            var me = this,
                win, props, text;

            if (me.api){

                var handlerDlg = function(dlg, result) {
                    if (result == 'ok') {
                        props = dlg.getSettings();
                        (text!==false)
                            ? me.api.add_Hyperlink(props)
                            : me.api.change_Hyperlink(props);
                    }

                    Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                };

                text = me.api.can_AddHyperlink();

                var _arr = [];
                for (var i=0; i<me.api.getCountPages(); i++) {
                    _arr.push({
                        displayValue: i+1,
                        value: i
                    });
                }
                if (text !== false) {
                    props = new Asc.CHyperlinkProperty();
                    props.put_Text(text);
                } else {
                    var selectedElements = me.api.getSelectedElements();
                    if (selectedElements && _.isArray(selectedElements)){
                        _.each(selectedElements, function(el, i) {
                            if (selectedElements[i].get_ObjectType() == Asc.c_oAscTypeSelectElement.Hyperlink)
                                props = selectedElements[i].get_ObjectValue();
                        });
                    }
                }
                if (props) {
                    win = new PE.Views.HyperlinkSettingsDialog({
                        api: me.api,
                        handler: handlerDlg,
                        slides: _arr
                    });
                    win.show();
                    win.setSettings(props);
                }
            }

            Common.component.Analytics.trackEvent('ToolBar', 'Add Hyperlink');
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

        onInsertImageClick: function(opts, e) {
            var me = this;
            if (opts === 'file') {
                me.toolbar.fireEvent('insertimage', this.toolbar);

                setTimeout(function() {me.api.asc_addImage();}, 1);

                Common.NotificationCenter.trigger('edit:complete', this.toolbar);
                Common.component.Analytics.trackEvent('ToolBar', 'Image');
            } else if (opts === 'url') {
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
            } else if (opts === 'storage') {
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
                    me.insertImage(file);
                }).show();
            }
        },

        insertImageFromStorage: function(data) {
            if (data && data.url && (!data.c || data.c=='add')) {
                this.toolbar.fireEvent('insertimage', this.toolbar);
                this.api.AddImageUrl(data.url, undefined, data.token);// for loading from storage
                Common.component.Analytics.trackEvent('ToolBar', 'Image');
            }
        },

        insertImage: function(data) { // gateway
            Common.NotificationCenter.trigger('storage:image-insert', data);
        },

        onInsertText: function(status) {
            if ( status == 'begin' ) {
                this._addAutoshape(true, 'textRect');

                if ( !this.toolbar.btnsInsertText.pressed() )
                    this.toolbar.btnsInsertText.toggle(true, true);
            } else
                this._addAutoshape(false, 'textRect');

            if ( this.toolbar.btnsInsertShape.pressed() )
                this.toolbar.btnsInsertShape.toggle(false, true);

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Add Text');
        },

        onInsertShape: function (type) {
            var me = this;
            if ( type == 'menu:hide' ) {
                if ( me.toolbar.btnsInsertShape.pressed() && !me._isAddingShape ) {
                    me.toolbar.btnsInsertShape.toggle(false, true);
                }
                me._isAddingShape = false;

                Common.NotificationCenter.trigger('edit:complete', me.toolbar);
            } else {
                me._addAutoshape(true, type);
                me._isAddingShape = true;

                if ( me.toolbar.btnsInsertText.pressed() )
                    me.toolbar.btnsInsertText.toggle(false, true);

                Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                Common.component.Analytics.trackEvent('ToolBar', 'Add Shape');
            }
        },

        onInsertTextart: function (data) {
            var me = this;

            me.toolbar.fireEvent('inserttextart', me.toolbar);
            me.api.AddTextArt(data);

            if ( me.toolbar.btnsInsertShape.pressed() )
                me.toolbar.btnsInsertShape.toggle(false, true);

            Common.NotificationCenter.trigger('edit:complete', me.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Add Text Art');
        },

        onEditHeaderClick: function(type, e) {
            var selectedElements = this.api.getSelectedElements(),
                in_text = false;

            for (var i=0; i < selectedElements.length; i++) {
                if (selectedElements[i].get_ObjectType() == Asc.c_oAscTypeSelectElement.Paragraph) {
                    in_text = true;
                    break;
                }
            }
            if (in_text && type=='slidenum') {
                this.api.asc_addSlideNumber();
            } else if (in_text && type=='datetime') {
                //insert date time
                var me = this;
                (new PE.Views.DateTimeDialog({
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
            } else {
                //edit header/footer
                var me = this;
                (new PE.Views.HeaderFooterDialog({
                    api: this.api,
                    lang: this.api.asc_getDefaultLanguage(),
                    props: this.api.asc_getHeaderFooterProperties(),
                    handler: function(result, value) {
                        if (result == 'ok' || result == 'all') {
                            if (me.api) {
                                me.api.asc_setHeaderFooterProperties(value, result == 'all');
                            }
                        }
                        Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                    }
                })).show();
            }
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

        onSlideSize: function(menu, item) {
            if (item.value !== 'advanced') {
                var newwidth = (this.currentPageSize.height / this.slideSizeArr[item.value].ratio);
                this.currentPageSize = {
                    type    : this.slideSizeArr[item.value].type,
                    width   : newwidth,
                    height  : this.currentPageSize.height
                };

                if (this.api)
                    this.api.changeSlideSize(this.currentPageSize.width, this.currentPageSize.height, this.currentPageSize.type);

                Common.NotificationCenter.trigger('edit:complete', this.toolbar);
                Common.component.Analytics.trackEvent('ToolBar', 'Slide Size');
            } else {
                var win, props,
                    me = this;

                var handlerDlg = function(dlg, result) {
                    if (result == 'ok') {
                        props = dlg.getSettings();
                        me.currentPageSize = { type: props[0], width: props[1], height: props[2] };
                        var ratio = me.currentPageSize.height/me.currentPageSize.width,
                            idx = -1;
                        for (var i = 0; i < me.slideSizeArr.length; i++) {
                            if (Math.abs(me.slideSizeArr[i].ratio - ratio) < 0.001 ) {
                                idx = i;
                                break;
                            }
                        }

                        me.toolbar.btnSlideSize.menu.items[0].setChecked(idx == 0);
                        me.toolbar.btnSlideSize.menu.items[1].setChecked(idx == 1);
                        if (me.api)
                            me.api.changeSlideSize(props[1], props[2], props[0]);
                    }

                    Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                };

                win = new PE.Views.SlideSizeSettings({
                    handler: handlerDlg
                });
                win.show();
                win.setSettings(me.currentPageSize.type, me.currentPageSize.width, me.currentPageSize.height);

                Common.component.Analytics.trackEvent('ToolBar', 'Slide Size');
            }
        },

        onSelectChart: function(type) {
            var me      = this,
                chart = false;

            var selectedElements = me.api.getSelectedElements();
            if (selectedElements && _.isArray(selectedElements)) {
                for (var i = 0; i< selectedElements.length; i++) {
                    if (Asc.c_oAscTypeSelectElement.Chart == selectedElements[i].get_ObjectType()) {
                        chart = selectedElements[i].get_ObjectValue();
                        break;
                    }
                }
            }

            if (chart) {
                var isCombo = (type==Asc.c_oAscChartTypeSettings.comboBarLine || type==Asc.c_oAscChartTypeSettings.comboBarLineSecondary ||
                type==Asc.c_oAscChartTypeSettings.comboAreaBar || type==Asc.c_oAscChartTypeSettings.comboCustom);
                if (isCombo && chart.get_ChartProperties() && chart.get_ChartProperties().getSeries().length<2) {
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

        onListThemeSelect: function(combo, record) {
            this._state.themeId = undefined;
            if (this.api && record)
                this.api.ChangeTheme(record.get('themeId'));

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Style');
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

        onNewFontColor: function(picker, color) {
            this.toolbar.mnuFontColorPicker.addNewColor();
        },

        onSelectFontColor: function(picker, color) {
            this._state.clrtext = this._state.clrtext_asccolor  = undefined;

            this.toolbar.btnFontColor.currentColor = color;
            this.toolbar.btnFontColor.setColor((typeof(color) == 'object') ? color.color : color);

            this.toolbar.mnuFontColorPicker.currentColor = color;
            if (this.api)
                this.api.put_TextColor(Common.Utils.ThemeColor.getRgbColor(color));

            Common.component.Analytics.trackEvent('ToolBar', 'Text Color');
        },

        onBtnFontColor: function() {
            this.toolbar.mnuFontColorPicker.trigger('select', this.toolbar.mnuFontColorPicker, this.toolbar.mnuFontColorPicker.currentColor);
        },

        onApiTextColor: function(color) {
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

                if (typeof(clr) == 'object') {
                    var isselected = false;
                    for ( var i = 0; i < 10; i++) {
                        if (Common.Utils.ThemeColor.ThemeValues[i] == clr.effectValue) {
                            picker.select(clr, true);
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
            this._state.clrtext_asccolor = color;
        },

        onApiStartHighlight: function(pressed) {
            this.toolbar.btnHighlightColor.toggle(pressed, true);
        },

        onApiHighlightColor: function(c) {
            if (c) {
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

        _setMarkerColor: function(strcolor, h) {
            var me = this;

            if (h === 'menu') {
                me.toolbar.mnuHighlightTransparent.setChecked(false);

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

        onBtnHighlightColor: function(btn) {
            if (btn.pressed) {
                this._setMarkerColor(btn.currentColor);
                Common.component.Analytics.trackEvent('ToolBar', 'Highlight Color');
            }
            else {
                this.api.SetMarkerFormat(false);
            }
        },

        onSelectHighlightColor: function(picker, color) {
            this._setMarkerColor(color, 'menu');
        },

        onHighlightTransparentClick: function(item, e) {
            this._setMarkerColor('transparent', 'menu');
            item.setChecked(true, true);
            this.toolbar.btnHighlightColor.currentColor = 'transparent';
            this.toolbar.btnHighlightColor.setColor(this.toolbar.btnHighlightColor.currentColor);
        },

        onResetAutoshapes: function () {
            var me = this;
            var onShowBefore = function(menu) {
                me.toolbar.updateAutoshapeMenu(menu, PE.getCollection('ShapeGroups'));
                menu.off('show:before', onShowBefore);
            };
            me.toolbar.btnsInsertShape.forEach(function (btn, index) {
                btn.menu.on('show:before', onShowBefore);
            });
        },

        onResetSlides: function () {
            setTimeout(function () {
                this.toolbar.updateAddSlideMenu(PE.getCollection('SlideLayouts'));
            }.bind(this), 0);
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

                            if (me.toolbar.btnsInsertText.pressed()) {
                                me.toolbar.btnsInsertText.toggle(false, true);
                            }
                            if (me.toolbar.btnsInsertShape.pressed()) {
                                me.toolbar.btnsInsertShape.toggle(false, true);
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
                                '" class="menu-shape" style="width:' + (equationGroup.get('groupWidth') + 8) + 'px; ' +
                                equationGroup.get('groupHeight') + 'margin-left:5px;"></div>') }
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
            if (this.api) {
                var me = this,
                    selected = me.api.asc_GetSelectedText(),
                    win = new Common.Views.SymbolTableDialog({
                        api: me.api,
                        lang: me.toolbar.mode.lang,
                        type: 1,
                        special: true,
                        buttons: [{value: 'ok', caption: this.textInsert}, 'close'],
                        font: selected && selected.length>0 ? me.api.get_TextProps().get_TextPr().get_FontFamily().get_Name() : undefined,
                        symbol: selected && selected.length>0 ? selected.charAt(0) : undefined,
                        handler: function(dlg, result, settings) {
                            if (result == 'ok') {
                                me.api.asc_insertSymbol(settings.font ? settings.font : me.api.get_TextProps().get_TextPr().get_FontFamily().get_Name(), settings.code, settings.special);
                            } else
                                Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                        }
                    });
                win.show();
                win.on('symbol:dblclick', function(cmp, result, settings) {
                    me.api.asc_insertSymbol(settings.font ? settings.font : me.api.get_TextProps().get_TextPr().get_FontFamily().get_Name(), settings.code, settings.special);
                });
            }
        },

        onApiMathTypes: function(equation) {
            this._equationTemp = equation;
            var me = this;
            var onShowBefore = function(menu) {
                me.onMathTypes(me._equationTemp);
                me.toolbar.btnInsertEquation.menu.off('show:before', onShowBefore);
            };
            me.toolbar.btnInsertEquation.menu.on('show:before', onShowBefore);
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
                            model: PE.Models.EquationModel
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
                                groupHeight : c_oAscMathMainTypeStrings[id][2] ? ' height:'+ normHeight +'px!important; ' : ''
                            });
                        }
                    }
                    equationsStore.add(equationgrouparray);
                    this.fillEquations();
                }
            }
        },

        updateThemeColors: function() {
            if (Common.Utils.ThemeColor.getEffectColors()===undefined) return;
            
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
            if (this.toolbar.btnFontColor.currentColor===undefined) {
                this.toolbar.btnFontColor.currentColor = this.toolbar.mnuFontColorPicker.currentColor.color || this.toolbar.mnuFontColorPicker.currentColor;
                this.toolbar.btnFontColor.setColor(this.toolbar.btnFontColor.currentColor);
            }
            if (this._state.clrtext_asccolor!==undefined) {
                this._state.clrtext = undefined;
                this.onApiTextColor(this._state.clrtext_asccolor);
            }
            this._state.clrtext_asccolor = undefined;
        },

        _onInitEditorThemes: function(editorThemes/*array */, documentThemes) {
            var me = this;
            window.styles_loaded = false;

            if (!me.toolbar.listTheme) {
                me.themes = [
                    editorThemes,
                    documentThemes
                ];
                return;
            }

            var defaultThemes = editorThemes || [],
                docThemes     = documentThemes || [];

            me.toolbar.listTheme.menuPicker.store.reset([]); // remove all

            var themeStore = this.getCollection('SlideThemes'),
                mainController = this.getApplication().getController('Main');
            if (themeStore) {
                var arr1 = [], arr2 = [];
                _.each(defaultThemes, function(theme, index) {
                    var tip = mainController.translationTable[(theme.get_Name() || '').toLocaleLowerCase()] || theme.get_Name();
                    arr1.push(new Common.UI.DataViewModel({
                        uid     : Common.UI.getId(),
                        themeId : theme.get_Index(),
                        tip     : tip,
                        offsety     : index * 40
                    }));
                    arr2.push({
                        uid     : Common.UI.getId(),
                        themeId : theme.get_Index(),
                        tip     : tip,
                        offsety     : index * 40
                    });
                });
                _.each(docThemes, function(theme) {
                    var image = theme.get_Image(),
                        tip = mainController.translationTable[(theme.get_Name() || '').toLocaleLowerCase()] || theme.get_Name();
                    arr1.push(new Common.UI.DataViewModel({
                        imageUrl: image,
                        uid     : Common.UI.getId(),
                        themeId : theme.get_Index(),
                        tip     : tip,
                        offsety     : 0
                    }));
                    arr2.push({
                        imageUrl: image,
                        uid     : Common.UI.getId(),
                        themeId : theme.get_Index(),
                        tip     : tip,
                        offsety     : 0
                    });
                });
                themeStore.reset(arr1);
                me.toolbar.listTheme.menuPicker.store.reset(arr2);
            }

            if (me.toolbar.listTheme.menuPicker.store.length > 0 &&  me.toolbar.listTheme.rendered){
                me.toolbar.listTheme.fillComboView(me.toolbar.listTheme.menuPicker.store.at(0), true);

                Common.NotificationCenter.trigger('edit:complete', this);
            }

            window.styles_loaded = true;
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

        activateControls: function() {
            this.onApiPageSize(this.api.get_PresentationWidth(), this.api.get_PresentationHeight());
            this.toolbar.lockToolbar(PE.enumLock.disableOnStart, false, {array: this.toolbar.slideOnlyControls.concat(this.toolbar.shapeControls)});
            this._state.activated = true;
        },

        DisableToolbar: function(disable, viewMode) {
            if (viewMode!==undefined) this.editMode = !viewMode;
            disable = disable || !this.editMode;

            var mask = $('.toolbar-mask');
            if (disable && mask.length>0 || !disable && mask.length==0) return;

            var toolbar = this.toolbar;
            toolbar.$el.find('.toolbar').toggleClass('masked', disable);

            if (toolbar.btnsAddSlide) // toolbar buttons are rendered
                this.toolbar.lockToolbar(PE.enumLock.menuFileOpen, disable, {array: toolbar.btnsAddSlide.concat(toolbar.btnChangeSlide, toolbar.btnPreview)});
            if(disable) {
                mask = $("<div class='toolbar-mask'>").appendTo(toolbar.$el.find('.toolbar'));
                Common.util.Shortcuts.suspendEvents('command+k, ctrl+k, alt+h, command+f5, ctrl+f5');
            } else {
                mask.remove();
                Common.util.Shortcuts.resumeEvents('command+k, ctrl+k, alt+h, command+f5, ctrl+f5');
            }
        },

        createDelayedElements: function() {
            this.toolbar.createDelayedElements();
            this.attachUIEvents(this.toolbar);
        },

        onAppShowed: function (config) {
            var me = this;

            var compactview = !config.isEdit;
            if ( config.isEdit ) {
                if ( Common.localStorage.itemExists("pe-compact-toolbar") ) {
                    compactview = Common.localStorage.getBool("pe-compact-toolbar");
                } else
                if ( config.customization && config.customization.compactToolbar )
                    compactview = true;
            }

            me.toolbar.render(_.extend({compactview: compactview}, config));

            var tab = {action: 'review', caption: me.toolbar.textTabCollaboration};
            var $panel = me.getApplication().getController('Common.Controllers.ReviewChanges').createToolbarPanel();
            if ( $panel ) {
                me.toolbar.addTab(tab, $panel, 3);
                me.toolbar.setVisible('review', config.isEdit || config.canViewReview || config.canCoAuthoring && config.canComments);
            }

            if ( config.isEdit ) {
                me.toolbar.setMode(config);

                me.toolbar.btnSave.on('disabled', _.bind(me.onBtnChangeState, me, 'save:disabled'));

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
                    if ( config.canProtect ) { // don't add protect panel to toolbar
                        tab = {action: 'protect', caption: me.toolbar.textTabProtect};
                        $panel = me.getApplication().getController('Common.Controllers.Protection').createToolbarPanel();
                        if ($panel)
                            me.toolbar.addTab(tab, $panel, 4);
                    }
                }
            }
        },

        onAppReady: function (config) {
            var me = this;
            me.appOptions = config;

            this.btnsComment = [];
            if ( config.canCoAuthoring && config.canComments ) {
                var _set = PE.enumLock;
                this.btnsComment = Common.Utils.injectButtons(this.toolbar.$el.find('.slot-comment'), 'tlbtn-addcomment-', 'toolbar__icon btn-menu-comments', me.toolbar.capBtnComment, [_set.lostConnect, _set.noSlides]);

                if ( this.btnsComment.length ) {
                    var _comments = PE.getController('Common.Controllers.Comments').getView();
                    Array.prototype.push.apply(me.toolbar.lockControls, this.btnsComment);
                    this.btnsComment.forEach(function (btn) {
                        btn.updateHint( _comments.textHintAddComment );
                        btn.on('click', function (btn, e) {
                            Common.NotificationCenter.trigger('app:comment:add', 'toolbar');
                        });
                        if (btn.cmpEl.closest('#review-changes-panel').length>0)
                            btn.setCaption(me.toolbar.capBtnAddComment);
                    }, this);
                    this.toolbar.lockToolbar(PE.enumLock.noSlides, this._state.no_slides, { array: this.btnsComment });
                }
            }
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

        onAddAudio: function() {
            this.api && this.api.asc_AddAudio();
        },

        onAddVideo: function() {
            this.api && this.api.asc_AddVideo();
        },

        textEmptyImgUrl : 'You need to specify image URL.',
        textWarning     : 'Warning',
        textFontSizeErr : 'The entered value is incorrect.<br>Please enter a numeric value between 1 and 300',
        confirmAddFontName: 'The font you are going to save is not available on the current device.<br>The text style will be displayed using one of the device fonts, the saved font will be used when it is available.<br>Do you want to continue?',
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
        textInsert: 'Insert'

    }, PE.Controllers.Toolbar || {}));
});