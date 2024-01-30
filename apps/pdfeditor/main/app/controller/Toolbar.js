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
    'common/main/lib/util/define',
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
                pageCount: 1
            };
            this.editMode = true;
            this.binding = {};

            this.addListeners({
                'Toolbar': {
                    'change:compact'    : this.onClickChangeCompact,
                    'home:open'         : this.onHomeOpen,
                    'tab:active'        : this.onActiveTab
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
                }
            });

            var me = this;

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
        },

        attachUIEvents: function(toolbar) {
            /**
             * UI Events
             */
            var me = this;
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
            toolbar.fieldPages.on('inputleave', function(){ Common.NotificationCenter.trigger('edit:complete', me.toolbar);});
            toolbar.fieldPages.cmpEl && toolbar.fieldPages.cmpEl.on('focus', 'input.form-control', function() {
                setTimeout(function(){toolbar.fieldPages._input && toolbar.fieldPages._input.select();}, 1);
            });
            toolbar.btnFirstPage.on('click',                            _.bind(this.onGotoPage, this, 'first'));
            toolbar.btnLastPage.on('click',                             _.bind(this.onGotoPage, this, 'last'));
            toolbar.btnPrevPage.on('click',                             _.bind(this.onGotoPage, this, 'prev'));
            toolbar.btnNextPage.on('click',                             _.bind(this.onGotoPage, this, 'next'));

            this.onBtnChangeState('undo:disabled', toolbar.btnUndo, toolbar.btnUndo.isDisabled());
            this.onBtnChangeState('redo:disabled', toolbar.btnRedo, toolbar.btnRedo.isDisabled());

            if (this.mode && this.mode.isEdit) {
                toolbar.btnSave.on('click',                                 _.bind(this.tryToSave, this));
                toolbar.btnSelectAll.on('click',                            _.bind(this.onSelectAll, this));
                toolbar.btnAddComment.on('click', function (btn, e) {
                    Common.NotificationCenter.trigger('app:comment:add', 'toolbar');
                });
                toolbar.btnStrikeout.on('click',                            _.bind(this.onBtnStrikeout, this));
                toolbar.mnuStrikeoutColorPicker.on('select',                _.bind(this.onSelectStrikeoutColor, this));
                toolbar.mnuStrikeoutTransparent.on('click',                 _.bind(this.onStrikeoutTransparentClick, this));
                toolbar.btnUnderline.on('click',                            _.bind(this.onBtnUnderline, this));
                toolbar.mnuUnderlineColorPicker.on('select',                _.bind(this.onSelectUnderlineColor, this));
                toolbar.mnuUnderlineTransparent.on('click',                 _.bind(this.onUnderlineTransparentClick, this));
                toolbar.btnHighlight.on('click',                            _.bind(this.onBtnHighlight, this));
                toolbar.mnuHighlightColorPicker.on('select',                _.bind(this.onSelectHighlightColor, this));
                toolbar.mnuHighlightTransparent.on('click',                 _.bind(this.onHighlightTransparentClick, this));
                toolbar.chShowComments.on('change',                         _.bind(this.onShowCommentsChange, this));
                // toolbar.btnRotate.on('click',                               _.bind(this.onRotateClick, this));
                Common.NotificationCenter.on('leftmenu:save', _.bind(this.tryToSave, this));
                Common.NotificationCenter.on('draw:start', _.bind(this.onDrawStart, this));
            }
            if (this.mode && this.mode.isRestrictedEdit) {
                toolbar.btnClear.on('click', _.bind(this.onClearClick, this));
                toolbar.btnPrevForm.on('click', _.bind(this.onGoToForm, this, 'prev'));
                toolbar.btnNextForm.on('click', _.bind(this.onGoToForm, this, 'next'));
                toolbar.btnSubmit && toolbar.btnSubmit.on('click', _.bind(this.onSubmitClick, this));
                toolbar.btnSaveForm && toolbar.btnSaveForm.on('click', _.bind(this.onSaveFormClick, this));
            }
        },

        setApi: function(api) {
            this.api = api;

            if (this.mode.isEdit || this.mode.isRestrictedEdit) {
                this.api.asc_registerCallback('asc_onCanUndo', _.bind(this.onApiCanRevert, this, 'undo'));
                this.api.asc_registerCallback('asc_onCanRedo', _.bind(this.onApiCanRevert, this, 'redo'));
                this.api.asc_registerCallback('asc_onZoomChange', _.bind(this.onApiZoomChange, this));
                Common.NotificationCenter.on('api:disconnect', _.bind(this.onApiCoAuthoringDisconnect, this));
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect', _.bind(this.onApiCoAuthoringDisconnect, this));
                this.api.asc_registerCallback('asc_onCanCopyCut', _.bind(this.onApiCanCopyCut, this));
            }

            if (this.mode.isEdit) {
                this.toolbar.setApi(api);
                this.api.asc_registerCallback('asc_onFocusObject', _.bind(this.onApiFocusObject, this));
                this.api.asc_registerCallback('asc_onContextMenu', _.bind(this.onContextMenu, this));
                this.api.asc_registerCallback('asc_onMarkerFormatChanged', _.bind(this.onApiStartHighlight, this));
            }
            if (this.mode.isRestrictedEdit) {
                this.api.asc_registerCallback('asc_onStartAction', _.bind(this.onLongActionBegin, this));
                this.api.asc_registerCallback('asc_onEndAction', _.bind(this.onLongActionEnd, this));
                this.api.asc_registerCallback('asc_onError', _.bind(this.onError, this));
                this.api.asc_registerCallback('sync_onAllRequiredFormsFilled', _.bind(this.onFillRequiredFields, this));
            }
            this.api.asc_registerCallback('asc_onCountPages',   _.bind(this.onCountPages, this));
            this.api.asc_registerCallback('asc_onCurrentPage',  _.bind(this.onCurrentPage, this));
            this.api.asc_registerCallback('asc_onDownloadUrl',  _.bind(this.onDownloadUrl, this));
        },

        onChangeCompactView: function(view, compact) {
            this.toolbar.setFolded(compact);
            this.toolbar.fireEvent('view:compact', [this, compact]);

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
        },

        onCurrentPage: function(value) {
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
            if (!this.editMode) return;

            var pr, sh, i = -1, type,
                paragraph_locked = false,
                image_locked = false,
                shape_pr = undefined,
                toolbar = this.toolbar,
                in_image = false,
                in_para = false;

            while (++i < selectedObjects.length) {
                type = selectedObjects[i].get_ObjectType();
                pr   = selectedObjects[i].get_ObjectValue();

                if (type === Asc.c_oAscTypeSelectElement.Paragraph) {
                    paragraph_locked = pr.get_Locked();
                    sh = pr.get_Shade();
                    in_para = true;
                } else if (type === Asc.c_oAscTypeSelectElement.Image) {
                    in_image = true;
                    image_locked = pr.get_Locked();
                    if (pr && pr.get_ShapeProperties())
                        shape_pr = pr.get_ShapeProperties();
                }
            }

            this.toolbar.lockToolbar(Common.enumLock.paragraphLock, paragraph_locked,   {array: this.toolbar.paragraphControls});
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
            if (!mode.isPDFAnnotate && !mode.isPDFEdit) {
                var canDownload = mode.canDownload && (!mode.isDesktopApp || !mode.isOffline),
                    saveSopy = (mode.canDownload && (!mode.isDesktopApp || !mode.isOffline)) && (mode.canRequestSaveAs || mode.saveAsUrl),
                    saveAs = mode.canDownload && mode.isDesktopApp && mode.isOffline,
                    buttons = (saveSopy || saveAs ? [{value: 'copy', caption: this.txtSaveCopy}] : []).concat(canDownload ? [{value: 'download', caption: this.txtDownload}] : []),
                    primary = saveSopy || saveAs ? 'copy' : (canDownload ? 'download' : 'ok');

                Common.UI.info({
                    maxwidth: 500,
                    buttons: (mode.canPDFAnnotate || mode.canPDFEdit || !mode.canDownload) ? ['ok'] : buttons.concat(['cancel']),
                    primary: (mode.canPDFAnnotate || mode.canPDFEdit || !mode.canDownload) ? 'ok' : primary,
                    msg: (mode.canPDFAnnotate || mode.canPDFEdit) ? this.txtNeedCommentMode : (mode.canDownload ? this.txtNeedDownload : this.errorAccessDeny),
                    callback: function(btn) {
                        if (saveAs && btn==='copy')
                            me.api.asc_DownloadAs();
                        else if (btn==='copy' || btn==='download') {
                            me._state.isFromToolbarDownloadAs = (btn==='copy');
                            me.api.asc_DownloadOrigin(btn==='copy');
                        }
                        Common.NotificationCenter.trigger('edit:complete', toolbar);
                    }
                });
            } else if (this.api) {
                // var isModified = this.api.asc_isDocumentCanSave();
                // var isSyncButton = toolbar.btnCollabChanges && toolbar.btnCollabChanges.cmpEl.hasClass('notify');
                // if (!isModified && !isSyncButton && !toolbar.mode.forcesave)
                //     return;

                this.api.asc_Save();
                toolbar.btnSave && toolbar.btnSave.setDisabled(!toolbar.mode.forcesave && !toolbar.mode.saveAlwaysEnabled);
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
                this.api.asc_setViewerTargetType(type);
                this.mode.isEdit && this.api.asc_StopInkDrawer();
                Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            }
        },

        turnOnSelectTool: function() {
            if ((this.mode.isEdit || this.mode.isRestrictedEdit) && this.toolbar && this.toolbar.btnSelectTool && !this.toolbar.btnSelectTool.isActive()) {
                this.api.asc_setViewerTargetType('select');
                this.toolbar.btnSelectTool.toggle(true, true);
                this.toolbar.btnHandTool.toggle(false, true);
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
            if (h === 'menu') {
                me._state.clrstrike = undefined;
                // me.onApiHighlightColor();

                me.toolbar.btnStrikeout.currentColor = strcolor;
                me.toolbar.btnStrikeout.setColor(me.toolbar.btnStrikeout.currentColor);
                me.toolbar.btnStrikeout.toggle(true, true);
            }

            strcolor = strcolor || 'transparent';

            if (strcolor == 'transparent') {
                me.api.SetMarkerFormat(me.toolbar.btnStrikeout.options.type, true, 0);
                me.toolbar.mnuStrikeoutColorPicker && me.toolbar.mnuStrikeoutColorPicker.clearSelection();
                me.toolbar.mnuStrikeoutTransparent.setChecked(true, true);
            } else {
                var r = strcolor[0] + strcolor[1],
                    g = strcolor[2] + strcolor[3],
                    b = strcolor[4] + strcolor[5];
                me.api.SetMarkerFormat(me.toolbar.btnStrikeout.options.type, true, 100, parseInt(r, 16), parseInt(g, 16), parseInt(b, 16));
                me.toolbar.mnuStrikeoutTransparent.setChecked(false, true);
            }
            me.api.asc_StopInkDrawer();
            Common.NotificationCenter.trigger('edit:complete', me.toolbar, me.toolbar.btnStrikeout);
        },

        onBtnUnderline: function(btn) {
            if (btn.pressed) {
                this._setUnderlineColor(btn.currentColor);
            }
            else {
                this.api.SetMarkerFormat(btn.options.type, false);
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
            if (h === 'menu') {
                me._state.clrunderline = undefined;
                // me.onApiHighlightColor();

                me.toolbar.btnUnderline.currentColor = strcolor;
                me.toolbar.btnUnderline.setColor(me.toolbar.btnUnderline.currentColor);
                me.toolbar.btnUnderline.toggle(true, true);
            }

            strcolor = strcolor || 'transparent';

            if (strcolor == 'transparent') {
                me.api.SetMarkerFormat(me.toolbar.btnUnderline.options.type, true, 0);
                me.toolbar.mnuUnderlineColorPicker && me.toolbar.mnuUnderlineColorPicker.clearSelection();
                me.toolbar.mnuUnderlineTransparent.setChecked(true, true);
            } else {
                var r = strcolor[0] + strcolor[1],
                    g = strcolor[2] + strcolor[3],
                    b = strcolor[4] + strcolor[5];
                me.api.SetMarkerFormat(me.toolbar.btnUnderline.options.type, true, 100, parseInt(r, 16), parseInt(g, 16), parseInt(b, 16));
                me.toolbar.mnuUnderlineTransparent.setChecked(false, true);
            }
            me.api.asc_StopInkDrawer();
            Common.NotificationCenter.trigger('edit:complete', me.toolbar, me.toolbar.btnUnderline);
        },

        onBtnHighlight: function(btn) {
            if (btn.pressed) {
                this._setHighlightColor(btn.currentColor);
            }
            else {
                this.api.SetMarkerFormat(btn.options.type, false);
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
            if (h === 'menu') {
                me._state.clrhighlight = undefined;
                // me.onApiHighlightColor();

                me.toolbar.btnHighlight.currentColor = strcolor;
                me.toolbar.btnHighlight.setColor(me.toolbar.btnHighlight.currentColor);
                me.toolbar.btnHighlight.toggle(true, true);
            }

            strcolor = strcolor || 'transparent';

            if (strcolor == 'transparent') {
                me.api.SetMarkerFormat(me.toolbar.btnHighlight.options.type, true, 0);
                me.toolbar.mnuHighlightColorPicker && me.toolbar.mnuHighlightColorPicker.clearSelection();
                me.toolbar.mnuHighlightTransparent.setChecked(true, true);
            } else {
                var r = strcolor[0] + strcolor[1],
                    g = strcolor[2] + strcolor[3],
                    b = strcolor[4] + strcolor[5];
                me.api.SetMarkerFormat(me.toolbar.btnHighlight.options.type, true, 100, parseInt(r, 16), parseInt(g, 16), parseInt(b, 16));
                me.toolbar.mnuHighlightTransparent.setChecked(false, true);
            }
            me.api.asc_StopInkDrawer();
            Common.NotificationCenter.trigger('edit:complete', me.toolbar, me.toolbar.btnHighlight);
        },

        onApiStartHighlight: function(type, pressed) {
            if (type === this.toolbar.btnHighlight.options.type)
                this.toolbar.btnHighlight.toggle(pressed, true);
            else if (type === this.toolbar.btnStrikeout.options.type)
                this.toolbar.btnStrikeout.toggle(pressed, true);
            else if (type === this.toolbar.btnUnderline.options.type)
                this.toolbar.btnUnderline.toggle(pressed, true);
            else {
                this.toolbar.btnHighlight.toggle(false, true);
                this.toolbar.btnStrikeout.toggle(false, true);
                this.toolbar.btnUnderline.toggle(false, true);
            }
        },

        onDrawStart: function() {
            this.api && this.api.SetMarkerFormat(undefined, false);
            this.onApiStartHighlight();
            this.turnOnShowComments();
        },

        onShowCommentsChange: function(checkbox, state) {
            var value = state === 'checked';
            Common.Utils.InternalSettings.set("pdfe-settings-livecomment", value);
            (value) ? this.api.asc_showComments(Common.Utils.InternalSettings.get("pdfe-settings-resolvedcomment")) : this.api.asc_hideComments();
        },

        onRotateClick: function(btn, e) {
            // this.api && this.api.asc_Rotate();
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
                    this.api.asc_DownloadAs(new Asc.asc_CDownloadOptions(Asc.c_oAscFileType.PDF, this._state.isFromToolbarDownloadAs));
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
            this.api && this.toolbar.btnSave && this.toolbar.btnSave.setDisabled(!this.mode.saveAlwaysEnabled && !this.api.isDocumentModified());
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
                if (!(config.customization && config.customization.compactHeader)) {
                    // hide 'print' and 'save' buttons group and next separator
                    me.toolbar.btnPrint.$el.parents('.group').hide().next().hide();

                    // hide 'undo' and 'redo' buttons and retrieve parent container
                    var $box = me.toolbar.btnUndo.$el.hide().next().hide().parent();

                    // move 'paste' button to the container instead of 'undo' and 'redo'
                    me.toolbar.btnPaste.$el.detach().appendTo($box);
                    me.toolbar.btnPaste.$el.find('button').attr('data-hint-direction', 'bottom');
                    me.toolbar.btnCopy.$el.removeClass('split');
                    me.toolbar.processPanelVisible(null, true, true);
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
            }

            var tab = {caption: me.toolbar.textTabView, action: 'view', extcls: config.isEdit ? 'canedit' : '', layoutname: 'toolbar-view', dataHintTitle: 'W'};
            var viewtab = me.getApplication().getController('ViewTab');
            viewtab.setApi(me.api).setConfig({toolbar: me, mode: config});
            var $panel = viewtab.createToolbarPanel();
            if ($panel) {
                me.toolbar.addTab(tab, $panel, 8);
                me.toolbar.setVisible('view', Common.UI.LayoutManager.isElementVisible('toolbar-view'));
            }
        },

        onAppReady: function (config) {
            var me = this;
            me.appOptions = config;

            this.btnsComment = [];
            // if ( config.canCoAuthoring && config.canComments ) {
            //     this.btnsComment = Common.Utils.injectButtons(this.toolbar.$el.find('.slot-comment'), 'tlbtn-addcomment-', 'toolbar__icon btn-menu-comments', this.toolbar.capBtnComment,
            //                 [  Common.enumLock.paragraphLock, Common.enumLock.headerLock, Common.enumLock.richEditLock, Common.enumLock.plainEditLock, Common.enumLock.richDelLock, Common.enumLock.plainDelLock,
            //                         Common.enumLock.cantAddQuotedComment, Common.enumLock.imageLock, Common.enumLock.inSpecificForm, Common.enumLock.inImage, Common.enumLock.lostConnect, Common.enumLock.disableOnStart,
            //                         Common.enumLock.previewReviewMode, Common.enumLock.viewFormMode, Common.enumLock.docLockView, Common.enumLock.docLockForms ],
            //                      undefined, undefined, undefined, '1', 'bottom');
            //     if ( this.btnsComment.length ) {
            //         var _comments = PDFE.getController('Common.Controllers.Comments').getView();
            //         this.btnsComment.forEach(function (btn) {
            //             btn.updateHint( _comments.textHintAddComment );
            //             btn.on('click', function (btn, e) {
            //                 Common.NotificationCenter.trigger('app:comment:add', 'toolbar');
            //             });
            //         }, this);
            //     }
            //     Array.prototype.push.apply(this.toolbar.paragraphControls, this.btnsComment);
            //     Array.prototype.push.apply(this.toolbar.lockControls, this.btnsComment);
            // }

            (new Promise(function(accept) {
                accept();
            })).then(function () {
                (config.isEdit || config.isRestrictedEdit) && me.toolbar && me.toolbar.btnHandTool.toggle(true, true);
                me.api && me.api.asc_setViewerTargetType('hand');
                if (config.isRestrictedEdit && me.toolbar && me.toolbar.btnSubmit && me.api && !me.api.asc_IsAllRequiredFormsFilled()) {
                    me.toolbar.lockToolbar(Common.enumLock.requiredNotFilled, true, {array: [me.toolbar.btnSubmit]});
                    if (!Common.localStorage.getItem("pdfe-embed-hide-submittip")) {
                        me.requiredTooltip = new Common.UI.SynchronizeTip({
                            extCls: 'colored',
                            placement: 'bottom-right',
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
        },

        applySettings: function() {
            this.toolbar && this.toolbar.chShowComments && this.toolbar.chShowComments.setValue(Common.Utils.InternalSettings.get("pdfe-settings-livecomment"), true);
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
        textSubmited: '<b>Form submitted successfully</b><br>Click to close the tip.'

    }, PDFE.Controllers.Toolbar || {}));
});
