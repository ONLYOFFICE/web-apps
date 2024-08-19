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
 *  DocumentHolder controller
 *
 *  Created on 1/15/14
 *
 */

var c_paragraphLinerule = {
    LINERULE_LEAST: 0,
    LINERULE_AUTO: 1,
    LINERULE_EXACT: 2
};

var c_paragraphSpecial = {
    NONE_SPECIAL: 0,
    FIRST_LINE: 1,
    HANGING: 2
};

var c_paragraphTextAlignment = {
    RIGHT: 0,
    LEFT: 1,
    CENTERED: 2,
    JUSTIFIED: 3
};

var c_pageNumPosition = {
    PAGE_NUM_POSITION_TOP: 0x01,
    PAGE_NUM_POSITION_BOTTOM: 0x02,
    PAGE_NUM_POSITION_RIGHT: 0,
    PAGE_NUM_POSITION_LEFT: 1,
    PAGE_NUM_POSITION_CENTER: 2
};

var c_tableWrap = {
    TABLE_WRAP_NONE: 0,
    TABLE_WRAP_PARALLEL: 1
};

var c_tableAlign = {
    TABLE_ALIGN_LEFT: 0,
    TABLE_ALIGN_CENTER: 1,
    TABLE_ALIGN_RIGHT: 2
};

var c_tableBorder = {
    BORDER_VERTICAL_LEFT: 0,
    BORDER_HORIZONTAL_TOP: 1,
    BORDER_VERTICAL_RIGHT: 2,
    BORDER_HORIZONTAL_BOTTOM: 3,
    BORDER_VERTICAL_CENTER: 4,
    BORDER_HORIZONTAL_CENTER: 5,
    BORDER_INNER: 6,
    BORDER_OUTER: 7,
    BORDER_ALL: 8,
    BORDER_NONE: 9,
    BORDER_ALL_TABLE: 10, // table border and all cell borders
    BORDER_NONE_TABLE: 11, // table border and no cell borders
    BORDER_INNER_TABLE: 12, // table border and inner cell borders
    BORDER_OUTER_TABLE: 13 // table border and outer cell borders
};

define([
    'core',
    'documenteditor/main/app/view/DocumentHolder'
], function () {
    'use strict';

    DE.Controllers.DocumentHolder = Backbone.Controller.extend({
        models: [],
        collections: [],
        views: [
            'DocumentHolder'
        ],

        initialize: function() {
            //
            this.addListeners({
                'DocumentHolder': {
                    'createdelayedelements': this.createDelayedElements,
                    'equation:callback': this.equationCallback
                }
            });

            var me = this;

            me._TtHeight        = 20;
            me.usertips = [];
            me.fastcoauthtips = [];
            me._isDisabled = false;
            me._state = {};
            me.mode = {};
            me.mouseMoveData = null;
            me.isTooltipHiding = false;
            me.lastMathTrackBounds = [];
            me.showMathTrackOnLoad = false;

            me.screenTip = {
                toolTip: new Common.UI.Tooltip({
                    owner: this,
                    html: true,
                    title: '<br><b>Press Ctrl and click link</b>',
                    cls: 'link-tooltip'
//                    style: 'word-wrap: break-word;'
                }),
                strTip: '',
                isHidden: true,
                isVisible: false
            };
            me.eyedropperTip = {
                isHidden: true,
                isVisible: false,
                eyedropperColor: null,
                tipInterval: null,
                isTipVisible: false
            }
            me.userTooltip = true;
            me.wrapEvents = {
                userTipMousover: _.bind(me.userTipMousover, me),
                userTipMousout: _.bind(me.userTipMousout, me),
                onKeyUp: _.bind(me.onKeyUp, me)
            };

            var keymap = {};
            me.hkComments = Common.Utils.isMac ? 'command+alt+a' : 'alt+h';
            keymap[me.hkComments] = function() {
                if (me.api.can_AddQuotedComment()!==false) {
                    me.addComment();
                }
                return false;
            };
            Common.util.Shortcuts.delegateShortcuts({shortcuts:keymap});

            Common.Utils.InternalSettings.set('de-equation-toolbar-hide', Common.localStorage.getBool('de-equation-toolbar-hide'));
        },

        onLaunch: function() {
            this.documentHolder = this.createView('DocumentHolder').render();
            this.documentHolder.el.tabIndex = -1;
            this.onAfterRender();

            var me = this;
            Common.NotificationCenter.on({
                'window:show': function(e){
                    me.screenTip.toolTip.hide();
                    me.screenTip.isVisible = false;
                    /** coauthoring begin **/
                    me.userTipHide();
                    /** coauthoring end **/
                    me.hideEyedropper();
                    me.mode && me.mode.isDesktopApp && me.api && me.api.asc_onShowPopupWindow();

                },
                'modal:show': function(e){
                    me.hideTips();
                },
                'layout:changed': function(e){
                    me.screenTip.toolTip.hide();
                    me.screenTip.isVisible = false;
                    /** coauthoring begin **/
                    me.userTipHide();
                    /** coauthoring end **/
                    me.hideTips();
                    me.hideEyedropper();
                    me.onDocumentHolderResize();
                },
            });
            Common.NotificationCenter.on('protect:doclock', _.bind(me.onChangeProtectDocument, me));
            Common.NotificationCenter.on('script:loaded', _.bind(me.createPostLoadElements, me));
        },

        setApi: function(o) {
            this.api = o;

            if (this.api) {
                this.api.asc_registerCallback('asc_onContextMenu',                  _.bind(this.onContextMenu, this));
                this.api.asc_registerCallback('asc_onMouseMoveStart',               _.bind(this.onMouseMoveStart, this));
                this.api.asc_registerCallback('asc_onMouseMoveEnd',                 _.bind(this.onMouseMoveEnd, this));

                //hyperlink
                this.api.asc_registerCallback('asc_onHyperlinkClick',               _.bind(this.onHyperlinkClick, this));
                this.api.asc_registerCallback('asc_onMouseMove',                    _.bind(this.onMouseMove, this));

                if (this.mode.isEdit === true) {
                    this.api.asc_registerCallback('asc_onImgWrapStyleChanged',      _.bind(this.onImgWrapStyleChanged, this));
                    this.api.asc_registerCallback('asc_onDialogAddHyperlink',       _.bind(this.onDialogAddHyperlink, this));
                    this.api.asc_registerCallback('asc_doubleClickOnChart',         _.bind(this.onDoubleClickOnChart, this));
                    this.api.asc_registerCallback('asc_doubleClickOnTableOleObject', _.bind(this.onDoubleClickOnTableOleObject, this));
                    this.api.asc_registerCallback('asc_onSpellCheckVariantsFound',  _.bind(this.onSpellCheckVariantsFound, this));
                    this.api.asc_registerCallback('asc_onRulerDblClick',            _.bind(this.onRulerDblClick, this));
                    this.api.asc_registerCallback('asc_ChangeCropState',            _.bind(this.onChangeCropState, this));
                    this.api.asc_registerCallback('asc_onLockDocumentProps',        _.bind(this.onApiLockDocumentProps, this));
                    this.api.asc_registerCallback('asc_onUnLockDocumentProps',      _.bind(this.onApiUnLockDocumentProps, this));
                    this.api.asc_registerCallback('asc_onShowMathTrack',            _.bind(this.onShowMathTrack, this));
                    this.api.asc_registerCallback('asc_onHideMathTrack',            _.bind(this.onHideMathTrack, this));
                    this.api.asc_registerPlaceholderCallback(AscCommon.PlaceholderButtonType.Image, _.bind(this.onInsertImage, this));
                    this.api.asc_registerPlaceholderCallback(AscCommon.PlaceholderButtonType.ImageUrl, _.bind(this.onInsertImageUrl, this));
                    this.api.asc_registerCallback('asc_onHideEyedropper',           _.bind(this.hideEyedropper, this));
                    this.api.asc_SetMathInputType(Common.localStorage.getBool("de-equation-input-latex") ? Asc.c_oAscMathInputType.LaTeX : Asc.c_oAscMathInputType.Unicode);
                }
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',        _.bind(this.onCoAuthoringDisconnect, this));
                Common.NotificationCenter.on('api:disconnect',                      _.bind(this.onCoAuthoringDisconnect, this));
                this.api.asc_registerCallback('asc_onTextLanguage',                 _.bind(this.onTextLanguage, this));
                this.api.asc_registerCallback('asc_onParaStyleName',                _.bind(this.onApiParagraphStyleChange, this));

                this.api.asc_registerCallback('asc_onShowForeignCursorLabel',       _.bind(this.onShowForeignCursorLabel, this));
                this.api.asc_registerCallback('asc_onHideForeignCursorLabel',       _.bind(this.onHideForeignCursorLabel, this));
                this.api.asc_registerCallback('asc_onFocusObject',                  _.bind(this.onFocusObject, this));
                this.api.asc_registerCallback('asc_onShowSpecialPasteOptions',      _.bind(this.onShowSpecialPasteOptions, this));
                this.api.asc_registerCallback('asc_onHideSpecialPasteOptions',      _.bind(this.onHideSpecialPasteOptions, this));
                if (this.mode.isEdit || this.mode.isRestrictedEdit && this.mode.canFillForms) {
                    this.api.asc_registerCallback('asc_onShowContentControlsActions',_.bind(this.onShowContentControlsActions, this));
                    this.api.asc_registerCallback('asc_onHideContentControlsActions',_.bind(this.onHideContentControlsActions, this));
                }
                this.api.asc_registerCallback('onPluginContextMenu',                 _.bind(this.onPluginContextMenu, this));
                this.documentHolder.setApi(this.api);
            }

            return this;
        },

        setMode: function(m) {
            this.mode = m;
            /** coauthoring begin **/
            !(this.mode.canCoAuthoring && this.mode.canComments)
                ? Common.util.Shortcuts.suspendEvents(this.hkComments)
                : Common.util.Shortcuts.resumeEvents(this.hkComments);
            /** coauthoring end **/
            this.documentHolder.setMode(m);
        },

        createPostLoadElements: function() {
            var me = this;

            me.mode.isEdit ? me.documentHolder.createDelayedElements() : me.documentHolder.createDelayedElementsViewer();

            if (!me.mode.isEdit) {
                return;
            }

            var diagramEditor = this.getApplication().getController('Common.Controllers.ExternalDiagramEditor').getView('Common.Views.ExternalDiagramEditor');
            if (diagramEditor) {
                diagramEditor.on('internalmessage', _.bind(function(cmp, message) {
                    var command = message.data.command;
                    var data = message.data.data;
                    if (this.api) {
                        (diagramEditor.isEditMode())
                            ? this.api.asc_editChartDrawingObject(data)
                            : this.api.asc_addChartDrawingObject(data);
                    }
                }, this));
                diagramEditor.on('hide', _.bind(function(cmp, message) {
                    if (this.api) {
                        this.api.asc_onCloseChartFrame();
                        this.api.asc_enableKeyEvents(true);
                    }
                    setTimeout(function(){
                        me.editComplete();
                    }, 10);
                }, this));
            }

            var mergeEditor = this.getApplication().getController('Common.Controllers.ExternalMergeEditor').getView('Common.Views.ExternalMergeEditor');
            if (mergeEditor) {
                mergeEditor.on('internalmessage', _.bind(function(cmp, message) {
                    var command = message.data.command;
                    var data = message.data.data;
                    if (this.api)
                        this.api.asc_setMailMergeData(data);
                }, this));
                mergeEditor.on('hide', _.bind(function(cmp, message) {
                    if (this.api) {
                        this.api.asc_enableKeyEvents(true);
                    }
                    setTimeout(function(){
                        me.editComplete();
                    }, 10);
                }, this));
            }

            var oleEditor = this.getApplication().getController('Common.Controllers.ExternalOleEditor').getView('Common.Views.ExternalOleEditor');
            if (oleEditor) {
                oleEditor.on('internalmessage', _.bind(function(cmp, message) {
                    var command = message.data.command;
                    var data = message.data.data;
                    if (this.api) {
                        oleEditor.isEditMode()
                            ? this.api.asc_editTableOleObject(data)
                            : this.api.asc_addTableOleObject(data);
                    }
                }, this));
                oleEditor.on('hide', _.bind(function(cmp, message) {
                    if (this.api) {
                        this.api.asc_enableKeyEvents(true);
                        this.api.asc_onCloseChartFrame();
                    }
                    setTimeout(function(){
                        me.editComplete();
                    }, 10);
                }, this));
            }

            me.showMathTrackOnLoad && me.onShowMathTrack(me.lastMathTrackBounds);
        },

        createDelayedElements: function(view, type) {
            var me = this, view = me.documentHolder;

            if (type==='view') {
                view.menuViewCopy.on('click', _.bind(me.onCutCopyPaste, me));
                view.menuViewPaste.on('click', _.bind(me.onCutCopyPaste, me));
                view.menuViewCut.on('click', _.bind(me.onCutCopyPaste, me));
                view.menuViewUndo.on('click', _.bind(me.onUndo, me));
                view.menuViewAddComment.on('click', _.bind(me.addComment, me));
                view.menuSignatureViewSign.on('click', _.bind(me.onSignatureClick, me));
                view.menuSignatureDetails.on('click', _.bind(me.onSignatureClick, me));
                view.menuSignatureViewSetup.on('click', _.bind(me.onSignatureClick, me));
                view.menuSignatureRemove.on('click', _.bind(me.onSignatureClick, me));
                view.menuViewPrint.on('click', _.bind(me.onPrintSelection, me));
                return;
            } else if (type==='pdf') {
                view.menuPDFViewCopy.on('click', _.bind(me.onCutCopyPaste, me));
                return;
            } else if (type==='forms') {
                view.menuPDFFormsUndo.on('click', _.bind(me.onUndo, me));
                view.menuPDFFormsRedo.on('click', _.bind(me.onRedo, me));
                view.menuPDFFormsClear.on('click', _.bind(me.onClear, me));
                view.menuPDFFormsCut.on('click', _.bind(me.onCutCopyPaste, me));
                view.menuPDFFormsCopy.on('click', _.bind(me.onCutCopyPaste, me));
                view.menuPDFFormsPaste.on('click', _.bind(me.onCutCopyPaste, me));
                return;
            }
        

            // type == 'edit'

            view.menuEditObject.on('click', _.bind(me.onEditObject, me));
            view.menuInsertCaption.on('click', _.bind(me.onInsertCaption, me));
            view.menuEquationInsertCaption.on('click', _.bind(me.onInsertCaption, me));
            view.menuTableInsertCaption.on('click', _.bind(me.onInsertCaption, me));
            view.menuChartEdit.on('click', _.bind(me.editChartClick, me));
            view.menuImgCopy.on('click', _.bind(me.onCutCopyPaste, me));
            view.menuImgPaste.on('click', _.bind(me.onCutCopyPaste, me));
            view.menuImgCut.on('click', _.bind(me.onCutCopyPaste, me));
            view.menuTableCopy.on('click', _.bind(me.onCutCopyPaste, me));
            view.menuTablePaste.on('click', _.bind(me.onCutCopyPaste, me));
            view.menuTableCut.on('click', _.bind(me.onCutCopyPaste, me));
            view.menuParaCopy.on('click', _.bind(me.onCutCopyPaste, me));
            view.menuParaPaste.on('click', _.bind(me.onCutCopyPaste, me));
            view.menuParaCut.on('click', _.bind(me.onCutCopyPaste, me));
            view.menuImgAccept.on('click', _.bind(me.onAcceptRejectChange, me));
            view.menuImgReject.on('click', _.bind(me.onAcceptRejectChange, me));
            view.menuTableAccept.on('click', _.bind(me.onAcceptRejectChange, me));
            view.menuTableReject.on('click', _.bind(me.onAcceptRejectChange, me));
            view.menuParaAccept.on('click', _.bind(me.onAcceptRejectChange, me));
            view.menuParaReject.on('click', _.bind(me.onAcceptRejectChange, me));
            view.menuImgPrint.on('click', _.bind(me.onPrintSelection, me));
            view.menuTablePrint.on('click', _.bind(me.onPrintSelection, me));
            view.menuParaPrint.on('click', _.bind(me.onPrintSelection, me));
            view.menuSignatureEditSign.on('click', _.bind(me.onSignatureClick, me));
            view.menuSignatureEditSetup.on('click', _.bind(me.onSignatureClick, me));
            view.menuImgRotate.menu.items[0].on('click', _.bind(me.onImgRotate, me));
            view.menuImgRotate.menu.items[1].on('click', _.bind(me.onImgRotate, me));
            view.menuImgRotate.menu.items[3].on('click', _.bind(me.onImgFlip, me));
            view.menuImgRotate.menu.items[4].on('click', _.bind(me.onImgFlip, me));
            view.menuImgCrop.menu.on('item:click', _.bind(me.onImgCrop, me));
            view.menuImgRemoveControl.on('click', _.bind(me.onControlsSelect, me));
            view.menuImgControlSettings.on('click', _.bind(me.onControlsSelect, me));
            view.menuTableRemoveForm.on('click', _.bind(me.onControlsSelect, me));
            view.menuTableRemoveControl.on('click', _.bind(me.onControlsSelect, me));
            view.menuTableControlSettings.on('click', _.bind(me.onControlsSelect, me));
            view.menuParaRemoveControl.on('click', _.bind(me.onControlsSelect, me));
            view.menuParaControlSettings.on('click', _.bind(me.onControlsSelect, me));
            view.menuTableCellAlign.menu.on('item:click', _.bind(me.tableCellsVAlign, me));
            view.menuTableAdvanced.on('click', _.bind(me.advancedTableClick, me));
            view.menuParagraphAdvancedInTable.on('click', _.bind(me.advancedParagraphClick, me));
            view.menuParagraphAdvanced.on('click', _.bind(me.advancedParagraphClick, me));
            view.menuEditHyperlinkTable.on('click', _.bind(me.editHyperlink, me));
            view.menuEditHyperlinkPara.on('click', _.bind(me.editHyperlink, me));
            view.menuRemoveHyperlinkTable.on('click', _.bind(me.onRemoveHyperlink, me));
            view.menuRemoveHyperlinkPara.on('click', _.bind(me.onRemoveHyperlink, me));
            view.menuAddHyperlinkTable.on('click', _.bind(me.addHyperlink, me));
            view.menuAddHyperlinkPara.on('click', _.bind(me.addHyperlink, me));
            view.menuAddCommentTable.on('click', _.bind(me.addComment, me));
            view.menuAddCommentPara.on('click', _.bind(me.addComment, me));
            view.menuTableFollow.on('click', _.bind(me.onFollowMove, me));
            view.menuParaFollow.on('click', _.bind(me.onFollowMove, me));
            view.menuTableStartNewList.on('click', _.bind(me.onStartNumbering, me, 1));
            view.menuParaStartNewList.on('click', _.bind(me.onStartNumbering, me, 1));
            view.menuTableStartNumberingFrom.on('click', _.bind(me.onStartNumbering, me, 'advanced'));
            view.menuParaStartNumberingFrom.on('click', _.bind(me.onStartNumbering, me, 'advanced'));
            view.menuTableContinueNumbering.on('click', _.bind(me.onContinueNumbering, me));
            view.menuParaContinueNumbering.on('click', _.bind(me.onContinueNumbering, me));
            view.menuFrameAdvanced.on('click', _.bind(me.advancedFrameClick, me, true));
            view.menuDropCapAdvanced.on('click', _.bind(me.advancedFrameClick, me, false));
            view.menuStyleSave.on('click', _.bind(me.onMenuSaveStyle, me));
            view.menuStyleUpdate.on('click', _.bind(me.onMenuUpdateStyle, me));
            view.menuTableSelectText.menu.on('item:click', _.bind(me.tableSelectText, me));
            view.menuTableInsertText.menu.on('item:click', _.bind(me.tableInsertText, me));
            view.menuTableDeleteText.menu.on('item:click', _.bind(me.tableDeleteText, me));
            view.menuImageAlign.menu.on('item:click', _.bind(me.onImgAlign, me));
            view.menuImageArrange.menu.on('item:click', _.bind(me.onImgArrange, me));
            view.mnuGroup.on('click', _.bind(me.onImgGroup, me));
            view.mnuUnGroup.on('click', _.bind(me.onImgUnGroup, me));
            view.menuWrapPolygon.on('click', _.bind(me.onImgWrapPolygon, me));
            view.menuImageWrap.menu.on('item:click', _.bind(me.onImgWrap, me));
            view.menuImageAdvanced.on('click', _.bind(me.onImgAdvanced, me));
            view.menuOriginalSize.on('click', _.bind(me.onImgOriginalSize, me));
            view.menuImgReplace.menu.on('item:click', _.bind(me.onImgReplace, me));
            view.menuImgEditPoints.on('click', _.bind(me.onImgEditPoints, me));
            view.mnuTableMerge.on('click', _.bind(me.onTableMerge, me));
            view.mnuTableSplit.on('click', _.bind(me.onTableSplit, me));
            view.menuIgnoreSpellTable.on('click', _.bind(me.onIgnoreSpell, me));
            view.menuIgnoreSpellPara.on('click', _.bind(me.onIgnoreSpell, me));
            view.menuIgnoreAllSpellTable.on('click', _.bind(me.onIgnoreSpell, me));
            view.menuIgnoreAllSpellPara.on('click', _.bind(me.onIgnoreSpell, me));
            view.menuToDictionaryTable.on('click', _.bind(me.onToDictionary, me));
            view.menuToDictionaryPara.on('click', _.bind(me.onToDictionary, me));
            view.menuTableDistRows.on('click', _.bind(me.onTableDist, me));
            view.menuTableDistCols.on('click', _.bind(me.onTableDist, me));
            view.menuTableDirection.menu.on('item:click', _.bind(me.tableDirection, me));
            view.menuTableRefreshField.on('click', _.bind(me.onRefreshField, me));
            view.menuParaRefreshField.on('click', _.bind(me.onRefreshField, me));
            view.menuTableEditField.on('click', _.bind(me.onEditField, me));
            view.menuParaEditField.on('click', _.bind(me.onEditField, me));
            view.menuParagraphBreakBefore.on('click', _.bind(me.onParagraphBreakBefore, me));
            view.menuParagraphKeepLines.on('click', _.bind(me.onParagraphKeepLines, me));
            view.menuParagraphVAlign.menu.on('item:click', _.bind(me.paragraphVAlign, me));
            view.menuParagraphDirection.menu.on('item:click', _.bind(me.paragraphDirection, me));
            view.langParaMenu.menu.on('item:click', _.bind(me.onLangMenu, me, 'para'));
            view.langTableMenu.menu.on('item:click', _.bind(me.onLangMenu, me, 'table'));
            view.menuTableTOC.menu.on('item:click', _.bind(me.onTOCMenu, me));
            view.menuParaTOCRefresh.menu.on('item:click', _.bind(me.onTOCMenu, me));
            view.menuParaTOCSettings.on('click', _.bind(me.onParaTOCSettings, me));
            view.menuTableEquation.menu.on('item:click', _.bind(me.convertEquation, me));
            view.menuParagraphEquation.menu.on('item:click', _.bind(me.convertEquation, me));
            view.menuTableListIndents.on('click', _.bind(me.onListIndents, me));
            view.menuParaListIndents.on('click', _.bind(me.onListIndents, me));
            view.menuSaveAsPicture.on('click', _.bind(me.saveAsPicture, me));
            me.onChangeProtectDocument();
        },

        getView: function (name) {
            return !name ?
                this.documentHolder : Backbone.Controller.prototype.getView.call()
        },

        showPopupMenu: function(menu, value, event, docElement, eOpts){
            var me = this;
            if (!_.isUndefined(menu)  && menu !== null){
                Common.UI.Menu.Manager.hideAll();

                var showPoint = [event.get_X(), event.get_Y()],
                    menuContainer = $(me.documentHolder.el).find(Common.Utils.String.format('#menu-container-{0}', menu.id));

                if (!menu.rendered) {
                    // Prepare menu container
                    if (menuContainer.length < 1) {
                        menuContainer = $(Common.Utils.String.format('<div id="menu-container-{0}" style="position: absolute; z-index: 10000;"><div class="dropdown-toggle" data-toggle="dropdown"></div></div>', menu.id));
                        $(me.documentHolder.el).append(menuContainer);
                    }

                    menu.render(menuContainer);
                    menu.cmpEl.attr({tabindex: "-1"});
                }

                menuContainer.css({
                    left: showPoint[0],
                    top : showPoint[1]
                });

                menu.show();

                if (_.isFunction(menu.options.initMenu)) {
                    menu.options.initMenu(value);
                    menu.alignPosition();
                }
                _.delay(function() {
                    menu.cmpEl.focus();
                }, 10);

                me.documentHolder.currentMenu = menu;
                me.api.onPluginContextMenuShow && me.api.onPluginContextMenuShow(event);
            }
        },

        fillMenuProps: function(selectedElements) {
            if (!selectedElements || !_.isArray(selectedElements)) return;
            var me = this,
                documentHolder = this.documentHolder;
            var menu_props = {},
                menu_to_show = documentHolder.textMenu,
                noobject = true;
            for (var i = 0; i <selectedElements.length; i++) {
                var elType = selectedElements[i].get_ObjectType();
                var elValue = selectedElements[i].get_ObjectValue();
                if (Asc.c_oAscTypeSelectElement.Image == elType) {
                    //image
                    menu_to_show = documentHolder.pictureMenu;
                    if (menu_props.imgProps===undefined)
                        menu_props.imgProps = {};
                    var shapeprops = elValue.get_ShapeProperties();
                    var chartprops = elValue.get_ChartProperties();
                    if (shapeprops) {
                        if (shapeprops.get_FromChart())
                            menu_props.imgProps.isChart = true;
                        else if (shapeprops.get_FromImage())
                            menu_props.imgProps.isOnlyImg = true;
                        else {
                            if (shapeprops.get_FromSmartArt())
                                menu_props.imgProps.isSmartArt = true;
                            if (shapeprops.get_FromSmartArtInternal())
                                menu_props.imgProps.isSmartArtInternal = true;
                            menu_props.imgProps.isShape = true;
                        }
                    } else if ( chartprops )
                        menu_props.imgProps.isChart = true;
                    else
                        menu_props.imgProps.isImg = true;

                    menu_props.imgProps.value = elValue;
                    menu_props.imgProps.locked = (elValue) ? elValue.get_Locked() : false;

                    noobject = false;
                    if ( (shapeprops===undefined || shapeprops===null) && (chartprops===undefined || chartprops===null) )  // not shape and chart
                        break;
                } else if (Asc.c_oAscTypeSelectElement.Table == elType)
                {
                    menu_to_show = documentHolder.tableMenu;
                    menu_props.tableProps = {};
                    menu_props.tableProps.value = elValue;
                    menu_props.tableProps.locked = (elValue) ? elValue.get_Locked() : false;
                    noobject = false;
                } else if (Asc.c_oAscTypeSelectElement.Paragraph == elType)
                {
                    menu_props.paraProps = {};
                    menu_props.paraProps.value = elValue;
                    menu_props.paraProps.locked = (elValue) ? elValue.get_Locked() : false;
                    if ( menu_props.imgProps && (menu_props.imgProps.isChart || menu_props.imgProps.isShape) && // text in shape, need to show paragraph menu with vertical align
                        menu_props.tableProps===undefined )
                        menu_to_show = documentHolder.textMenu;
                    noobject = false;
                } else if (Asc.c_oAscTypeSelectElement.Hyperlink == elType) {
                    if (menu_props.hyperProps)
                        menu_props.hyperProps.isSeveralLinks = true;
                    else
                        menu_props.hyperProps = {};
                    menu_props.hyperProps.value = elValue;
                } else if (Asc.c_oAscTypeSelectElement.Header == elType) {
                    menu_props.headerProps = {};
                    menu_props.headerProps.locked = (elValue) ? elValue.get_Locked() : false;
                } else if (Asc.c_oAscTypeSelectElement.SpellCheck == elType) {
                    menu_props.spellProps = {};
                    menu_props.spellProps.value = elValue;
                    me.documentHolder._currentSpellObj = elValue;
                } else if (Asc.c_oAscTypeSelectElement.Math == elType) {
                    menu_props.mathProps = {};
                    menu_props.mathProps.value = elValue;
                    me.documentHolder._currentMathObj = elValue;
                }
            }
            return (!noobject) ? {menu_to_show: menu_to_show, menu_props: menu_props} : null;
        },

        fillViewMenuProps: function(selectedElements) {
            if (!selectedElements || !_.isArray(selectedElements)) return;

            var documentHolder = this.documentHolder;
            if (!documentHolder.viewModeMenu)
                documentHolder.createDelayedElementsViewer();
            var menu_props = {},
                menu_to_show = documentHolder.viewModeMenu,
                noobject = true;
            for (var i = 0; i <selectedElements.length; i++) {
                var elType = selectedElements[i].get_ObjectType();
                var elValue = selectedElements[i].get_ObjectValue();
                if (Asc.c_oAscTypeSelectElement.Image == elType) {
                    //image
                    menu_props.imgProps = {};
                    menu_props.imgProps.value = elValue;
                    noobject = false;
                } else if (Asc.c_oAscTypeSelectElement.Paragraph == elType)
                {
                    menu_props.paraProps = {};
                    menu_props.paraProps.value = elValue;
                    menu_props.paraProps.locked = (elValue) ? elValue.get_Locked() : false;
                    noobject = false;
                } else if (Asc.c_oAscTypeSelectElement.Text == elType)
                {
                    if (!documentHolder.viewPDFModeMenu)
                        documentHolder.createDelayedElementsPDFViewer();
                    menu_to_show = documentHolder.viewPDFModeMenu;
                    noobject = false;
                }
            }
            return (!noobject) ? {menu_to_show: menu_to_show, menu_props: menu_props} : null;
        },

        fillFormsMenuProps: function(selectedElements) {
            if (!selectedElements || !_.isArray(selectedElements)) return;

            var documentHolder = this.documentHolder;
            if (!documentHolder.formsPDFMenu)
                documentHolder.createDelayedElementsPDFForms();
            var menu_props = {},
                menu_to_show = documentHolder.formsPDFMenu,
                noobject = true;
            for (var i = 0; i <selectedElements.length; i++) {
                var elType = selectedElements[i].get_ObjectType();
                var elValue = selectedElements[i].get_ObjectValue();
                if (Asc.c_oAscTypeSelectElement.Image == elType) {
                    //image
                    menu_props.imgProps = {};
                    menu_props.imgProps.value = elValue;
                    menu_props.imgProps.locked = (elValue) ? elValue.get_Locked() : false;

                    var control_props = this.api.asc_IsContentControl() ? this.api.asc_GetContentControlProperties() : null,
                        lock_type = (control_props) ? control_props.get_Lock() : Asc.c_oAscSdtLockType.Unlocked;
                    menu_props.imgProps.content_locked = lock_type==Asc.c_oAscSdtLockType.SdtContentLocked || lock_type==Asc.c_oAscSdtLockType.ContentLocked;

                    noobject = false;
                } else if (Asc.c_oAscTypeSelectElement.Paragraph == elType) {
                    menu_props.paraProps = {};
                    menu_props.paraProps.value = elValue;
                    menu_props.paraProps.locked = (elValue) ? elValue.get_Locked() : false;
                    noobject = false;
                } else if (Asc.c_oAscTypeSelectElement.Header == elType) {
                    menu_props.headerProps = {};
                    menu_props.headerProps.locked = (elValue) ? elValue.get_Locked() : false;
                }
            }
            return (!noobject) ? {menu_to_show: menu_to_show, menu_props: menu_props} : null;
        },

        showObjectMenu: function(event, docElement, eOpts){
            var me = this;
            if (me.api){
                var docProtection = me.documentHolder._docProtection,
                    disableEditing = me._isDisabled || docProtection.isReadOnly || docProtection.isFormsOnly || docProtection.isCommentsOnly,
                    obj = me.mode.isEdit && !disableEditing ? me.fillMenuProps(me.api.getSelectedElements()) :
                          me.mode.isPDFForm && me.mode.canFillForms && me.mode.isRestrictedEdit && !disableEditing ? me.fillFormsMenuProps(me.api.getSelectedElements()) :
                            me.fillViewMenuProps(me.api.getSelectedElements());
                if (obj) me.showPopupMenu(obj.menu_to_show, obj.menu_props, event, docElement, eOpts);
            }
        },

        onContextMenu: function(event){
            if (Common.UI.HintManager.isHintVisible())
                Common.UI.HintManager.clearHints();
            if (!event) {
                Common.UI.Menu.Manager.hideAll();
                return;
            }

            var me = this;
            _.delay(function(){
                if (event.get_Type() == 0) {
                    me.showObjectMenu.call(me, event);
                } else {
                    me.showPopupMenu.call(me, me.documentHolder.hdrMenu, {Header: event.is_Header(), PageNum: event.get_PageNum()}, event);
                }
            },10);
        },

        onFocusObject: function(selectedElements) {
            var me = this,
                currentMenu = me.documentHolder.currentMenu;
            if (currentMenu && currentMenu.isVisible() && currentMenu !== me.documentHolder.hdrMenu){
                var docProtection = me.documentHolder._docProtection,
                    disableEditing = me._isDisabled || docProtection.isReadOnly || docProtection.isFormsOnly || docProtection.isCommentsOnly,
                    obj = me.mode.isEdit && !disableEditing ? me.fillMenuProps(selectedElements) :
                          me.mode.isPDFForm && me.mode.canFillForms && me.mode.isRestrictedEdit && !disableEditing ? me.fillFormsMenuProps(selectedElements) :
                          me.fillViewMenuProps(selectedElements);
                if (obj) {
                    if (obj.menu_to_show===currentMenu) {
                        currentMenu.options.initMenu(obj.menu_props);
                        currentMenu.alignPosition();
                    }
                }
            }

            if (this.mode && this.mode.isEdit) {
                var i = -1,
                    in_equation = false,
                    locked = false;
                while (++i < selectedElements.length) {
                    var type = selectedElements[i].get_ObjectType();
                    if (type === Asc.c_oAscTypeSelectElement.Math) {
                        in_equation = true;
                    } else if (type === Asc.c_oAscTypeSelectElement.Paragraph || type === Asc.c_oAscTypeSelectElement.Table || type === Asc.c_oAscTypeSelectElement.Header) {
                        var value = selectedElements[i].get_ObjectValue();
                        value && (locked = locked || value.get_Locked());
                    }
                }
                if (in_equation) {
                    this._state.equationLocked = locked;
                    this.disableEquationBar();
                }
            }
        },

        handleDocumentWheel: function(event) {
            var me = this;
            if (me.api) {
                var delta = (_.isUndefined(event.originalEvent)) ? event.wheelDelta : event.originalEvent.wheelDelta;
                if (_.isUndefined(delta)) {
                    delta = event.deltaY;
                }

                if (event.ctrlKey && !event.altKey) {
                    if (delta < 0) {
                        me.api.zoomOut();
                        me._handleZoomWheel = true;
                    } else if (delta > 0) {
                        me.api.zoomIn();
                        me._handleZoomWheel = true;
                    }

                    event.preventDefault();
                    event.stopPropagation();
                }
            }
        },

        handleDocumentKeyDown: function(event){
            var me = this;
            if (me.api){
                var key = event.keyCode;
                if (me.hkSpecPaste) {
                    me._needShowSpecPasteMenu = !event.shiftKey && !event.altKey && event.keyCode == Common.UI.Keys.CTRL;
                }
                if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey){
                    if (key === Common.UI.Keys.NUM_PLUS || key === Common.UI.Keys.EQUALITY || (Common.Utils.isGecko && key === Common.UI.Keys.EQUALITY_FF) || (Common.Utils.isOpera && key == 43)){
                        me.api.zoomIn();
                        event.preventDefault();
                        event.stopPropagation();
                        return false;
                    }
                    else if (key === Common.UI.Keys.NUM_MINUS || key === Common.UI.Keys.MINUS || (Common.Utils.isGecko && key === Common.UI.Keys.MINUS_FF) || (Common.Utils.isOpera && key == 45)){
                        (key !== Common.UI.Keys.NUM_MINUS || !me.mode.isEdit) && me.api.zoomOut();
                        event.preventDefault();
                        event.stopPropagation();
                        return false;
                    } else if (key === Common.UI.Keys.ZERO || key === Common.UI.Keys.NUM_ZERO) {// 0
                        me.api.zoom(100);
                        event.preventDefault();
                        event.stopPropagation();
                        return false;
                    }
                }
                if (me.documentHolder.currentMenu && me.documentHolder.currentMenu.isVisible()) {
                    if (key == Common.UI.Keys.UP ||
                        key == Common.UI.Keys.DOWN) {
                        $('ul.dropdown-menu', me.documentHolder.currentMenu.el).focus();
                    }
                }

                if (key == Common.UI.Keys.ESC) {
                    Common.UI.Menu.Manager.hideAll();
                }
            }
        },

        onDocumentHolderResize: function(e){
            var me = this;
            me._XY = [
                me.documentHolder.cmpEl.offset().left - $(window).scrollLeft(),
                me.documentHolder.cmpEl.offset().top - $(window).scrollTop()
            ];
            me._Height = me.documentHolder.cmpEl.height();
            me._Width = me.documentHolder.cmpEl.width();
            me._BodyWidth = $('body').width();
        },

        onAfterRender: function(ct){
            var me = this;
            var meEl = me.documentHolder.cmpEl;
            if (meEl) {
                meEl.on('contextmenu', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                });
                meEl.on('click', function(e){
                    if (e.target.localName == 'canvas') {
                        if (me._preventClick)
                            me._preventClick = false;
                        else
                            meEl.focus();
                    }
                });
                meEl.on('mousedown', function(e){
                    if (e.target.localName == 'canvas')
                        Common.UI.Menu.Manager.hideAll();
                });
                meEl.on('touchstart', function(e){
                    if (e.target.localName == 'canvas')
                        Common.UI.Menu.Manager.hideAll();
                });

                //NOTE: set mouse wheel handler

                var addEvent = function( elem, type, fn ) {
                    elem.addEventListener ? elem.addEventListener( type, fn, false ) : elem.attachEvent( "on" + type, fn );
                };

                var eventname=(/Firefox/i.test(navigator.userAgent))? 'DOMMouseScroll' : 'mousewheel';
                addEvent(me.documentHolder.el, eventname, _.bind(me.handleDocumentWheel, me));
            }

            !Common.Utils.isChrome ? $(document).on('mousewheel', _.bind(me.handleDocumentWheel, me)) :
                document.addEventListener('mousewheel', _.bind(me.handleDocumentWheel, me), {passive: false});
            $(document).on('keydown', _.bind(me.handleDocumentKeyDown, me));

            $(window).on('resize', _.bind(me.onDocumentHolderResize, me));
            var viewport = me.getApplication().getController('Viewport').getView('Viewport');
            viewport.hlayout.on('layout:resizedrag', _.bind(me.onDocumentHolderResize, me));
        },

        getUserName: function(id){
            var usersStore = DE.getCollection('Common.Collections.Users');
            if (usersStore){
                var rec = usersStore.findUser(id);
                if (rec)
                    return AscCommon.UserInfoParser.getParsedName(rec.get('username'));
            }
            return this.documentHolder.guestText;
        },

        isUserVisible: function(id){
            var usersStore = DE.getCollection('Common.Collections.Users');
            if (usersStore){
                var rec = usersStore.findUser(id);
                if (rec)
                    return !rec.get('hidden');
            }
            return true;
        },

        userTipMousover: function (evt, el, opt) {
            var me = this;
            if (me.userTooltip===true) {
                me.userTooltip = new Common.UI.Tooltip({
                    owner: evt.currentTarget,
                    title: me.documentHolder.tipIsLocked
                });

                me.userTooltip.show();
            }
        },

        userTipHide: function () {
            var me = this;
            if (typeof me.userTooltip == 'object') {
                me.userTooltip.hide();
                me.userTooltip = undefined;

                for (var i=0; i<me.usertips.length; i++) {
                    me.usertips[i].off('mouseover', me.wrapEvents.userTipMousover);
                    me.usertips[i].off('mouseout', me.wrapEvents.userTipMousout);
                }
            }
        },

        userTipMousout: function (evt, el, opt) {
            var me = this;
            if (typeof me.userTooltip == 'object') {
                if (me.userTooltip.$element && evt.currentTarget === me.userTooltip.$element[0]) {
                    me.userTipHide();
                }
            }
        },

        hideTips: function() {
            var me = this;
            /** coauthoring begin **/
            if (typeof me.userTooltip == 'object') {
                me.userTooltip.hide();
                me.userTooltip = true;
            }
            _.each(me.usertips, function(item) {
                item.remove();
            });
            me.usertips = [];
            me.usertipcount = 0;
            /** coauthoring end **/
        },

        onHyperlinkClick: function(url) {
            if (url) {
                var type = this.api.asc_getUrlType(url);
                if (type===AscCommon.c_oAscUrlType.Http || type===AscCommon.c_oAscUrlType.Email)
                    window.open(url);
                else {
                    var me = this;
                    setTimeout(function() {
                        Common.UI.warning({
                            msg: me.documentHolder.txtWarnUrl,
                            buttons: ['yes', 'no'],
                            primary: 'yes',
                            callback: function(btn) {
                                try {
                                    (btn == 'yes') && window.open(url);
                                } catch (err) {
                                    err && console.log(err.stack);
                                }
                            }
                        });
                    }, 1);
                }
            }
        },

        onDialogAddHyperlink: function() {
            var me = this;
            var win, props, text;
            var docProtection = me.documentHolder._docProtection;
            if (me.api && me.mode.isEdit && !(me._isDisabled || docProtection.isReadOnly || docProtection.isFormsOnly || docProtection.isCommentsOnly) && !me.getApplication().getController('LeftMenu').leftMenu.menuFile.isVisible()){
                var handlerDlg = function(dlg, result) {
                    if (result == 'ok') {
                        props = dlg.getSettings();
                        (text!==false)
                            ? me.api.add_Hyperlink(props)
                            : me.api.change_Hyperlink(props);
                    }

                    me.editComplete();
                };

                text = me.api.can_AddHyperlink();

                if (text !== false) {
                    win = new DE.Views.HyperlinkSettingsDialog({
                        api: me.api,
                        appOptions: me.mode,
                        handler: handlerDlg
                    });

                    props = new Asc.CHyperlinkProperty();
                    props.put_Text(text);

                    win.show();
                    win.setSettings(props);
                } else {
                    var selectedElements = me.api.getSelectedElements();
                    if (selectedElements && _.isArray(selectedElements)){
                        _.each(selectedElements, function(el, i) {
                            if (selectedElements[i].get_ObjectType() == Asc.c_oAscTypeSelectElement.Hyperlink)
                                props = selectedElements[i].get_ObjectValue();
                        });
                    }
                    if (props) {
                        win = new DE.Views.HyperlinkSettingsDialog({
                            api: me.api,
                            appOptions: me.mode,
                            handler: handlerDlg
                        });
                        win.show();
                        win.setSettings(props);
                    }
                }
                Common.component.Analytics.trackEvent('DocumentHolder', 'Add Hyperlink');
            }
        },

        onShowForeignCursorLabel: function(UserId, X, Y, color) {
            if (!this.isUserVisible(UserId)) return;

            /** coauthoring begin **/
            var me = this;
            var src;
            for (var i=0; i<me.fastcoauthtips.length; i++) {
                if (me.fastcoauthtips[i].attr('userid') == UserId) {
                    src = me.fastcoauthtips[i];
                    break;
                }
            }

            if (!src) {
                src = $(document.createElement("div"));
                src.addClass('username-tip');
                src.attr('userid', UserId);
                src.css({height: me._TtHeight + 'px', position: 'absolute', zIndex: '900', display: 'none', 'pointer-events': 'none',
                    'background-color': '#'+Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b())});
                src.text(me.getUserName(UserId));
                $('#id_main_view').append(src);
                me.fastcoauthtips.push(src);
                src.fadeIn(150);
            }
            src.css({top: (Y-me._TtHeight) + 'px', left: X + 'px'});
            /** coauthoring end **/
        },

        onHideForeignCursorLabel: function(UserId) {
            /** coauthoring begin **/
            var me = this;
            for (var i=0; i<me.fastcoauthtips.length; i++) {
                if (me.fastcoauthtips[i].attr('userid') == UserId) {
                    var src = me.fastcoauthtips[i];
                    me.fastcoauthtips[i].fadeOut(150, function(){src.remove()});
                    me.fastcoauthtips.splice(i, 1);
                    break;
                }
            }
            /** coauthoring end **/
        },

        hideEyedropper: function () {
            if (this.eyedropperTip.isVisible) {
                this.eyedropperTip.isVisible = false;
                this.eyedropperTip.eyedropperColor.css({left: '-1000px', top: '-1000px'});
            }
            if (this.eyedropperTip.isTipVisible) {
                this.eyedropperTip.isTipVisible = false;
                this.eyedropperTip.toolTip.hide();
            }
        },

        onMouseMoveStart: function() {
            var me = this;
            me.screenTip.isHidden = true;
            /** coauthoring begin **/
            if (me.usertips.length>0) {
                if (typeof me.userTooltip == 'object') {
                    me.userTooltip.hide();
                    me.userTooltip = true;
                }
                _.each(me.usertips, function(item) {
                    item.remove();
                });
            }
            me.usertips = [];
            me.usertipcount = 0;
            /** coauthoring end **/
        },

        onMouseMoveEnd: function() {
            var me = this;
            if (me.screenTip.isHidden && me.screenTip.isVisible) {
                me.screenTip.isVisible = false;
                me.isTooltipHiding = true;
                me.screenTip.toolTip.hide(function(){
                    me.isTooltipHiding = false;
                    if (me.mouseMoveData) me.onMouseMove(me.mouseMoveData);
                    me.mouseMoveData = null;
                });
            }
            if (me.eyedropperTip.isHidden) {
                me.hideEyedropper();
            }
        },

        onMouseMove: function(moveData) {
            var me = this,
                cmpEl = me.documentHolder.cmpEl,
                screenTip = me.screenTip;
            if (me._XY === undefined) {
                me._XY = [
                    cmpEl.offset().left - $(window).scrollLeft(),
                    cmpEl.offset().top - $(window).scrollTop()
                ];
                me._Height = cmpEl.height();
                me._Width = cmpEl.width();
                me._BodyWidth = $('body').width();
            }

            if (moveData) {
                var showPoint, ToolTip,
                    type = moveData.get_Type();

                if (type==Asc.c_oAscMouseMoveDataTypes.Hyperlink || type==Asc.c_oAscMouseMoveDataTypes.Footnote || type==Asc.c_oAscMouseMoveDataTypes.Form ||
                    type==Asc.c_oAscMouseMoveDataTypes.Review && me.mode.reviewHoverMode || type==Asc.c_oAscMouseMoveDataTypes.Eyedropper || type===Asc.c_oAscMouseMoveDataTypes.Placeholder) {
                    if (me.isTooltipHiding) {
                        me.mouseMoveData = moveData;
                        return;
                    }

                    if (type==Asc.c_oAscMouseMoveDataTypes.Hyperlink) {
                        var hyperProps = moveData.get_Hyperlink();
                        if (!hyperProps) return;
                        ToolTip = (_.isEmpty(hyperProps.get_ToolTip())) ? hyperProps.get_Value() : hyperProps.get_ToolTip();
                        if (ToolTip.length>256)
                            ToolTip = ToolTip.substr(0, 256) + '...';
                    } else if (type == Asc.c_oAscMouseMoveDataTypes.Footnote) {
                        ToolTip = moveData.get_FootnoteText();
                        if (ToolTip.length>1000)
                            ToolTip = ToolTip.substr(0, 1000) + '...';
                    } else if (type==Asc.c_oAscMouseMoveDataTypes.Form) {
                        ToolTip = moveData.get_FormHelpText();
                        if (ToolTip.length>1000)
                            ToolTip = ToolTip.substr(0, 1000) + '...';
                    } else if (type==Asc.c_oAscMouseMoveDataTypes.Review && moveData.get_ReviewChange()) {
                        var changes = me.getApplication().getController("Common.Controllers.ReviewChanges").readSDKChange([moveData.get_ReviewChange()]);
                        if (changes && changes.length>0)
                            changes = changes[0];
                        if (changes) {
                            ToolTip = '<b>'+ Common.Utils.String.htmlEncode(AscCommon.UserInfoParser.getParsedName(changes.get('username'))) +'  </b>';
                            ToolTip += '<span class="review-date">'+ changes.get('date') +'</span><br>';
                            ToolTip += changes.get('changetext');
                            if (ToolTip.length>1000)
                                ToolTip = ToolTip.substr(0, 1000) + '...';
                        }
                    } else if (type===Asc.c_oAscMouseMoveDataTypes.Placeholder) {
                        switch (moveData.get_PlaceholderType()) {
                            case AscCommon.PlaceholderButtonType.Image:
                                ToolTip = me.documentHolder.txtInsImage;
                                break;
                            case AscCommon.PlaceholderButtonType.ImageUrl:
                                ToolTip = me.documentHolder.txtInsImageUrl;
                                break;
                        }
                    } else if (type==Asc.c_oAscMouseMoveDataTypes.Eyedropper) {
                        if (me.eyedropperTip.isTipVisible) {
                            me.eyedropperTip.isTipVisible = false;
                            me.eyedropperTip.toolTip.hide();
                        }

                        if (!me.eyedropperTip.toolTip) {
                            var tipEl = $('<div id="tip-container-eyedroppertip" style="position: absolute; z-index: 10000;"></div>');
                            me.documentHolder.cmpEl.append(tipEl);
                            me.eyedropperTip.toolTip = new Common.UI.Tooltip({
                                owner: tipEl,
                                html: true,
                                cls: 'eyedropper-tooltip'
                            });
                        }

                        var color = moveData.get_EyedropperColor().asc_getColor(),
                            r = color.get_r(),
                            g = color.get_g(),
                            b = color.get_b(),
                            hex = Common.Utils.ThemeColor.getHexColor(r,g,b);
                        if (!me.eyedropperTip.eyedropperColor) {
                            var colorEl = $(document.createElement("div"));
                            colorEl.addClass('eyedropper-color');
                            colorEl.appendTo(document.body);
                            me.eyedropperTip.eyedropperColor = colorEl;
                            $('#id_main_view').on('mouseleave', _.bind(me.hideEyedropper, me));
                        }
                        me.eyedropperTip.eyedropperColor.css({
                            backgroundColor: '#' + hex,
                            left: (moveData.get_X() + me._XY[0] + 23) + 'px',
                            top: (moveData.get_Y() + me._XY[1] - 53) + 'px'
                        });
                        me.eyedropperTip.isVisible = true;

                        if (me.eyedropperTip.tipInterval) {
                            clearInterval(me.eyedropperTip.tipInterval);
                        }
                        me.eyedropperTip.tipInterval = setInterval(function () {
                            clearInterval(me.eyedropperTip.tipInterval);
                            if (me.eyedropperTip.isVisible) {
                                ToolTip = '<div>RGB (' + r + ',' + g + ',' + b + ')</div>' +
                                    '<div>' + moveData.get_EyedropperColor().asc_getName() + '</div>';
                                me.eyedropperTip.toolTip.setTitle(ToolTip);
                                me.eyedropperTip.isTipVisible = true;
                                me.eyedropperTip.toolTip.show([-10000, -10000]);
                                me.eyedropperTip.tipWidth = me.eyedropperTip.toolTip.getBSTip().$tip.width();
                                showPoint = [moveData.get_X(), moveData.get_Y()];
                                showPoint[1] += (me._XY[1] - 57);
                                showPoint[0] += (me._XY[0] + 58);
                                if (showPoint[0] + me.eyedropperTip.tipWidth > me._BodyWidth ) {
                                    showPoint[0] = showPoint[0] - me.eyedropperTip.tipWidth - 40;
                                }
                                me.eyedropperTip.toolTip.getBSTip().$tip.css({
                                    top: showPoint[1] + 'px',
                                    left: showPoint[0] + 'px'
                                });
                            }
                        }, 800);
                        me.eyedropperTip.isHidden = false;
                        return;
                    }

                    var recalc = false;
                    screenTip.isHidden = false;

                    if (type!==Asc.c_oAscMouseMoveDataTypes.Review && type!==Asc.c_oAscMouseMoveDataTypes.Placeholder)
                        ToolTip = Common.Utils.String.htmlEncode(ToolTip);

                    if (screenTip.tipType !== type || screenTip.tipLength !== ToolTip.length || screenTip.strTip.indexOf(ToolTip)<0 ) {
                        screenTip.toolTip.setTitle((type==Asc.c_oAscMouseMoveDataTypes.Hyperlink) ? (ToolTip + '<br><b>' + Common.Utils.String.platformKey('Ctrl', me.documentHolder.txtPressLink) + '</b>') : ToolTip);
                        screenTip.tipLength = ToolTip.length;
                        screenTip.strTip = ToolTip;
                        screenTip.tipType = type;
                        recalc = true;
                    }

                    showPoint = [moveData.get_X(), moveData.get_Y()];
                    showPoint[1] += (me._XY[1]-15);
                    showPoint[0] += (me._XY[0]+5);

                    if (!screenTip.isVisible || recalc) {
                        screenTip.isVisible = true;
                        screenTip.toolTip.show([-10000, -10000]);
                    }

                    if ( recalc ) {
                        screenTip.tipHeight = screenTip.toolTip.getBSTip().$tip.height();
                        screenTip.tipWidth = screenTip.toolTip.getBSTip().$tip.width();
                    }

                    recalc = false;
                    if (showPoint[0] + screenTip.tipWidth > me._BodyWidth ) {
                        showPoint[0] = me._BodyWidth - screenTip.tipWidth;
                        recalc = true;
                    }
                    if (showPoint[1] - screenTip.tipHeight < 0) {
                        showPoint[1] = (recalc) ? showPoint[1]+30 : 0;
                    } else
                        showPoint[1] -= screenTip.tipHeight;

                    screenTip.toolTip.getBSTip().$tip.css({top: showPoint[1] + 'px', left: showPoint[0] + 'px'});
                }
                /** coauthoring begin **/
                else if (moveData.get_Type()==Asc.c_oAscMouseMoveDataTypes.LockedObject && me.mode.isEdit && me.isUserVisible(moveData.get_UserId())) { // 2 - locked object
                    var src;
                    if (me.usertipcount >= me.usertips.length) {
                        src = $(document.createElement("div"));
                        src.addClass('username-tip');
                        src.css({height: me._TtHeight + 'px', position: 'absolute', zIndex: '900', visibility: 'visible'});
                        $(document.body).append(src);
                        if (me.userTooltip) {
                            src.on('mouseover', me.wrapEvents.userTipMousover);
                            src.on('mouseout', me.wrapEvents.userTipMousout);
                        }

                        me.usertips.push(src);
                    }
                    src = me.usertips[me.usertipcount];
                    me.usertipcount++;

                    ToolTip = me.getUserName(moveData.get_UserId());

                    showPoint = [moveData.get_X()+me._XY[0], moveData.get_Y()+me._XY[1]];
                    var maxwidth = showPoint[0];
                    showPoint[0] = me._BodyWidth - showPoint[0];
                    showPoint[1] -= ((moveData.get_LockedObjectType()==2) ? me._TtHeight : 0);

                    if (showPoint[1] > me._XY[1] && showPoint[1]+me._TtHeight < me._XY[1]+me._Height)  {
                        src.text(ToolTip);
                        src.css({visibility: 'visible', top: showPoint[1] + 'px', right: showPoint[0] + 'px', 'max-width': maxwidth + 'px'});
                    } else {
                        src.css({visibility: 'hidden'});
                    }
                }
                /** coauthoring end **/
            }
        },

        onShowSpecialPasteOptions: function(specialPasteShowOptions) {
            if (this.mode && !this.mode.isEdit) return;

            var me = this,
                documentHolder = me.documentHolder;
            var coord  = specialPasteShowOptions.asc_getCellCoord(),
                pasteContainer = documentHolder.cmpEl.find('#special-paste-container'),
                pasteItems = specialPasteShowOptions.asc_getOptions();
            if (!pasteItems) return;

            // Prepare menu container
            if (pasteContainer.length < 1) {
                me._arrSpecialPaste = [];
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.paste] = documentHolder.textPaste;
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.sourceformatting] = documentHolder.txtPasteSourceFormat;
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.keepTextOnly] = documentHolder.txtKeepTextOnly;
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.insertAsNestedTable] = documentHolder.textNest;
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.overwriteCells] = documentHolder.txtOverwriteCells;

                pasteContainer = $('<div id="special-paste-container" style="position: absolute;"><div id="id-document-holder-btn-special-paste"></div></div>');
                documentHolder.cmpEl.find('#id_main_view').append(pasteContainer);

                me.btnSpecialPaste = new Common.UI.Button({
                    parentEl: $('#id-document-holder-btn-special-paste'),
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-paste',
                    caption     : Common.Utils.String.format('({0})', Common.Utils.String.textCtrl),
                    menu        : new Common.UI.Menu({items: []})
                });
                me.initSpecialPasteEvents();
            }

            if (pasteItems.length>0) {
                var menu = me.btnSpecialPaste.menu;
                for (var i = 0; i < menu.items.length; i++) {
                    menu.removeItem(menu.items[i]);
                    i--;
                }

                var group_prev = -1;
                _.each(pasteItems, function(menuItem, index) {
                    var mnu = new Common.UI.MenuItem({
                        caption: me._arrSpecialPaste[menuItem] + ' (' + me.hkSpecPaste[menuItem] + ')',
                        value: menuItem,
                        checkable: true,
                        toggleGroup : 'specialPasteGroup'
                    }).on('click', _.bind(me.onSpecialPasteItemClick, me));
                    menu.addItem(mnu);
                });
                (menu.items.length>0) && menu.items[0].setChecked(true, true);
            }

            var showPoint = [coord.asc_getX() + coord.asc_getWidth() + 3, coord.asc_getY() + coord.asc_getHeight() + 3];
            if (coord.asc_getX()<0 || coord.asc_getY()<0 || showPoint[0]>me._Width || showPoint[1]>me._Height) {
                if (pasteContainer.is(':visible')) pasteContainer.hide();
                $(document).off('keyup', this.wrapEvents.onKeyUp);
                return;
            }
            if (showPoint[1] + pasteContainer.height()>me._Height)
                showPoint[1] = me._Height - pasteContainer.height();
            if (showPoint[0] + pasteContainer.width()>me._Width)
                showPoint[0] = me._Width - pasteContainer.width();

            if (!Common.Utils.InternalSettings.get("de-hidden-rulers")) {
                showPoint = [showPoint[0] - 19, showPoint[1] - 26];
            }
            pasteContainer.css({left: showPoint[0], top : showPoint[1]});
            pasteContainer.show();
            setTimeout(function() {
                $(document).on('keyup', me.wrapEvents.onKeyUp);
            }, 10);
            this.disableSpecialPaste();
        },

        onHideSpecialPasteOptions: function() {
            if (!this.documentHolder || !this.documentHolder.cmpEl) return;
            var pasteContainer = this.documentHolder.cmpEl.find('#special-paste-container');
            if (pasteContainer.is(':visible')) {
                pasteContainer.hide();
                $(document).off('keyup', this.wrapEvents.onKeyUp);
            }
        },

        disableSpecialPaste: function() {
            var pasteContainer = this.documentHolder.cmpEl.find('#special-paste-container'),
                docProtection = this.documentHolder._docProtection,
                disabled = this._isDisabled || docProtection.isReadOnly || docProtection.isCommentsOnly;

            if (pasteContainer.length>0 && pasteContainer.is(':visible')) {
                this.btnSpecialPaste.setDisabled(!!disabled);
            }
        },

        onKeyUp: function (e) {
            if (e.keyCode == Common.UI.Keys.CTRL && this._needShowSpecPasteMenu && !this._handleZoomWheel && !this.btnSpecialPaste.menu.isVisible() && /area_id/.test(e.target.id)) {
                $('button', this.btnSpecialPaste.cmpEl).click();
                e.preventDefault();
            }
            this._handleZoomWheel = false;
            this._needShowSpecPasteMenu = false;
        },

        initSpecialPasteEvents: function() {
            var me = this;
            me.hkSpecPaste = [];
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.paste] = 'P';
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.sourceformatting] = 'K';
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.keepTextOnly] = 'T';
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.insertAsNestedTable] = 'N';
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.overwriteCells] = 'O';
            for(var key in me.hkSpecPaste){
                if(me.hkSpecPaste.hasOwnProperty(key)){
                    var keymap = {};
                    keymap[me.hkSpecPaste[key]] = _.bind(me.onSpecialPasteItemClick, me, {value: parseInt(key)});
                    Common.util.Shortcuts.delegateShortcuts({shortcuts:keymap});
                    Common.util.Shortcuts.suspendEvents(me.hkSpecPaste[key], undefined, true);
                }
            }

            me.btnSpecialPaste.menu.on('show:after', function(menu) {
                for (var i = 0; i < menu.items.length; i++) {
                    me.hkSpecPaste[menu.items[i].value] && Common.util.Shortcuts.resumeEvents(me.hkSpecPaste[menu.items[i].value]);
                }
            }).on('hide:after', function(menu) {
                for (var i = 0; i < menu.items.length; i++) {
                    me.hkSpecPaste[menu.items[i].value] && Common.util.Shortcuts.suspendEvents(me.hkSpecPaste[menu.items[i].value], undefined, true);
                }
            });
        },

        onEditObject: function() {
            if (!Common.Controllers.LaunchController.isScriptLoaded()) return;

            if (this.api) {
                var oleobj = this.api.asc_canEditTableOleObject(true);
                if (oleobj) {
                    var oleEditor = DE.getController('Common.Controllers.ExternalOleEditor').getView('Common.Views.ExternalOleEditor');
                    if (oleEditor) {
                        oleEditor.setEditMode(true);
                        oleEditor.show();
                        oleEditor.setOleData(Asc.asc_putBinaryDataToFrameFromTableOleObject(oleobj));
                    }
                } else {
                    this.api.asc_startEditCurrentOleObject();
                }
            }
        },

        onDoubleClickOnChart: function(chart) {
            if (!Common.Controllers.LaunchController.isScriptLoaded()) return;

            var docProtection = this.documentHolder._docProtection;
            if (this.mode.isEdit && !(this._isDisabled || docProtection.isReadOnly || docProtection.isFormsOnly || docProtection.isCommentsOnly)) {
                var diagramEditor = this.getApplication().getController('Common.Controllers.ExternalDiagramEditor').getView('Common.Views.ExternalDiagramEditor');
                if (diagramEditor && chart) {
                    diagramEditor.setEditMode(true);
                    diagramEditor.show();
                    diagramEditor.setChartData(new Asc.asc_CChartBinary(chart));
                }
            }
        },

        onDoubleClickOnTableOleObject: function(chart) {
            if (!Common.Controllers.LaunchController.isScriptLoaded()) return;

            var docProtection = this.documentHolder._docProtection;
            if (this.mode.isEdit && !(this._isDisabled || docProtection.isReadOnly || docProtection.isFormsOnly || docProtection.isCommentsOnly)) {
                var oleEditor = this.getApplication().getController('Common.Controllers.ExternalOleEditor').getView('Common.Views.ExternalOleEditor');
                if (oleEditor && chart) {
                    oleEditor.setEditMode(true);
                    oleEditor.show();
                    oleEditor.setOleData(Asc.asc_putBinaryDataToFrameFromTableOleObject(chart));
                }
            }
        },

        onImgWrapStyleChanged: function(type){
            var menuImageWrap = this.documentHolder.menuImageWrap;
            switch (type) {
                case Asc.c_oAscWrapStyle2.Inline:
                    menuImageWrap.menu.items[0].setChecked(true);
                    break;
                case Asc.c_oAscWrapStyle2.Square:
                    menuImageWrap.menu.items[2].setChecked(true);
                    break;
                case Asc.c_oAscWrapStyle2.Tight:
                    menuImageWrap.menu.items[3].setChecked(true);
                    break;
                case Asc.c_oAscWrapStyle2.Through:
                    menuImageWrap.menu.items[4].setChecked(true);
                    break;
                case Asc.c_oAscWrapStyle2.TopAndBottom:
                    menuImageWrap.menu.items[5].setChecked(true);
                    break;
                case Asc.c_oAscWrapStyle2.Behind:
                    menuImageWrap.menu.items[8].setChecked(true);
                    break;
                case Asc.c_oAscWrapStyle2.InFront:
                    menuImageWrap.menu.items[7].setChecked(true);
                    break;
            }
        },

        onChangeCropState: function(state) {
            this.documentHolder.menuImgCrop && this.documentHolder.menuImgCrop.menu.items[0].setChecked(state, true);
        },

        onRulerDblClick: function(type) {
            Common.UI.Menu.Manager.hideAll();

            var win, me = this;
            if (type == 'tables') {
                win = this.advancedTableClick();
                if (win)
                    win.setActiveCategory(4);
            } else if (type == 'indents' || type == 'tabs') {
                win = this.advancedParagraphClick({isChart: false});
                if (win)
                    win.setActiveCategory(type == 'indents' ? 0 : 4);
            } else if (type == 'margins') {
                if (me._state.lock_doc) return;
                win = new DE.Views.PageMarginsDialog({
                    api: me.api,
                    handler: function(dlg, result) {
                        if (result == 'ok') {
                            var props = dlg.getSettings();
                            Common.localStorage.setItem("de-pgmargins-top", props.get_TopMargin());
                            Common.localStorage.setItem("de-pgmargins-left", props.get_LeftMargin());
                            Common.localStorage.setItem("de-pgmargins-bottom", props.get_BottomMargin());
                            Common.localStorage.setItem("de-pgmargins-right", props.get_RightMargin());
                            Common.NotificationCenter.trigger('margins:update', props);

                            me.api.asc_SetSectionProps(props);
                            me.editComplete();
                        }
                    }
                });
                win.show();
                win.setSettings(me.api.asc_GetSectionProps());
            } else if (type == 'columns') {
                win = new DE.Views.CustomColumnsDialog({
                    handler: function(dlg, result) {
                        if (result == 'ok') {
                            me.api.asc_SetColumnsProps(dlg.getSettings());
                            me.editComplete();
                        }
                    }
                });
                win.show();
                win.setSettings(me.api.asc_GetColumnsProps());
            }
        },

        onApiParagraphStyleChange: function(name) {
            window.currentStyleName = name;
        },

        onHideContentControlsActions: function() {
            this.listControlMenu && this.listControlMenu.isVisible() && this.listControlMenu.hide();
            var controlsContainer = this.documentHolder.cmpEl.find('#calendar-control-container');
            if (controlsContainer.is(':visible'))
                controlsContainer.hide();
        },

        onShowDateActions: function(obj, x, y) {
            var props = obj.pr,
                specProps = props.get_DateTimePr(),
                cmpEl = this.documentHolder.cmpEl,
                controlsContainer = cmpEl.find('#calendar-control-container'),
                me = this;

            this._dateObj = props;

            if (controlsContainer.length < 1) {
                controlsContainer = $('<div id="calendar-control-container" style="position: absolute;z-index: 1000;"><div id="id-document-calendar-control" style="position: fixed; left: -1000px; top: -1000px;"></div></div>');
                cmpEl.append(controlsContainer);
            }

            Common.UI.Menu.Manager.hideAll();

            controlsContainer.css({left: x, top : y});
            controlsContainer.show();

            if (!this.cmpCalendar) {
                this.cmpCalendar = new Common.UI.Calendar({
                    el: cmpEl.find('#id-document-calendar-control'),
                    enableKeyEvents: true,
                    firstday: 1
                });
                this.cmpCalendar.on('date:click', function (cmp, date) {
                    var specProps = me._dateObj.get_DateTimePr();
                    specProps.put_FullDate(new  Date(date));
                    me.api.asc_SetContentControlDatePickerDate(specProps);
                    controlsContainer.hide();
                    me.api.asc_UncheckContentControlButtons();
                    me.editComplete();
                });
                this.cmpCalendar.on('calendar:keydown', function (cmp, e) {
                    if (e.keyCode==Common.UI.Keys.ESC) {
                        controlsContainer.hide();
                        me.api.asc_UncheckContentControlButtons();
                    }
                });
                $(document).on('mousedown', function(e) {
                    if (e.target.localName !== 'canvas' && controlsContainer.is(':visible') && controlsContainer.find(e.target).length==0) {
                        controlsContainer.hide();
                        me.api.asc_UncheckContentControlButtons();
                    }
                });

            }
            var val = specProps ? specProps.get_FullDate() : undefined;
            this.cmpCalendar.setDate(val ? new Date(val) : new Date());

            // align
            var offset  = controlsContainer.offset(),
                docW    = Common.Utils.innerWidth(),
                docH    = Common.Utils.innerHeight() - 10, // Yep, it's magic number
                menuW   = this.cmpCalendar.cmpEl.outerWidth(),
                menuH   = this.cmpCalendar.cmpEl.outerHeight(),
                buttonOffset = 22,
                left = offset.left - menuW,
                top  = offset.top;
            if (top + menuH > docH) {
                top = docH - menuH;
                left -= buttonOffset;
            }
            if (top < 0)
                top = 0;
            if (left + menuW > docW)
                left = docW - menuW;
            this.cmpCalendar.cmpEl.css({left: left, top : top});

            this._preventClick = true;
        },

        onShowListActions: function(obj, x, y) {
            var type = obj.type,
                props = obj.pr,
                specProps = (type == Asc.c_oAscContentControlSpecificType.ComboBox) ? props.get_ComboBoxPr() : props.get_DropDownListPr(),
                isForm = !!props.get_FormPr(),
                cmpEl = this.documentHolder.cmpEl,
                menu = this.listControlMenu,
                menuContainer = menu ? cmpEl.find(Common.Utils.String.format('#menu-container-{0}', menu.id)) : null,
                me = this;

            this._listObj = props;

            this._fromShowContentControls = true;
            Common.UI.Menu.Manager.hideAll();

            if (!menu) {
                this.listControlMenu = menu = new Common.UI.Menu({
                    maxHeight: 207,
                    menuAlign: 'tr-bl',
                    items: []
                });
                menu.on('item:click', function(menu, item) {
                    setTimeout(function(){
                        (item.value!==-1) && me.api.asc_SelectContentControlListItem(item.value, me._listObj.get_InternalId());
                    }, 1);
                });

                // Prepare menu container
                if (!menuContainer || menuContainer.length < 1) {
                    menuContainer = $(Common.Utils.String.format('<div id="menu-container-{0}" style="position: absolute; z-index: 10000;"><div class="dropdown-toggle" data-toggle="dropdown"></div></div>', menu.id));
                    cmpEl.append(menuContainer);
                }

                menu.render(menuContainer);
                menu.cmpEl.attr({tabindex: "-1"});
                menu.on('hide:after', function(){
                    me.listControlMenu.removeAll();
                    if (!me._fromShowContentControls)
                        me.api.asc_UncheckContentControlButtons();
                });
            }
            if (specProps) {
                if (isForm){ // for dropdown and combobox form control always add placeholder item
                    var text = props.get_PlaceholderText();
                    menu.addItem(new Common.UI.MenuItem({
                        caption     : (text.trim()!=='') ? text : this.documentHolder.txtEmpty,
                        value       : '',
                        template    : _.template([
                            '<a id="<%= id %>" tabindex="-1" type="menuitem" style="<% if (options.value=="") { %> opacity: 0.6 <% } %>">',
                            '<%= Common.Utils.String.htmlEncode(caption) %>',
                            '</a>'
                        ].join(''))
                    }));
                }
                var count = specProps.get_ItemsCount();
                for (var i=0; i<count; i++) {
                    (specProps.get_ItemValue(i)!=='' || !isForm) && menu.addItem(new Common.UI.MenuItem({
                        caption     : specProps.get_ItemDisplayText(i),
                        value       : specProps.get_ItemValue(i),
                        template    : _.template([
                            '<a id="<%= id %>" style="<%= style %>" tabindex="-1" type="menuitem">',
                            '<%= Common.Utils.String.htmlEncode(caption) %>',
                            '</a>'
                        ].join(''))
                    }));
                }
                if (!isForm && menu.items.length<1) {
                    menu.addItem(new Common.UI.MenuItem({
                        caption     : this.documentHolder.txtEmpty,
                        value       : -1
                    }));
                }
            }

            menuContainer.css({left: x, top : y});
            menuContainer.attr('data-value', 'prevent-canvas-click');
            this._preventClick = true;
            menu.show();

            _.delay(function() {
                menu.cmpEl.focus();
            }, 10);
            this._fromShowContentControls = false;
        },

        onShowContentControlsActions: function(obj, x, y) {
            var type = obj.type;
            switch (type) {
                case Asc.c_oAscContentControlSpecificType.DateTime:
                    this.onShowDateActions(obj, x, y);
                    break;
                case Asc.c_oAscContentControlSpecificType.Picture:
                    if (obj.pr && obj.pr.get_Lock) {
                        var lock = obj.pr.get_Lock();
                        if (lock == Asc.c_oAscSdtLockType.SdtContentLocked || lock==Asc.c_oAscSdtLockType.ContentLocked)
                            return;
                    }
                    this.api.asc_addImage(obj);
                    var me = this;
                    setTimeout(function(){
                        me.api.asc_UncheckContentControlButtons();
                    }, 500);
                    break;
                case Asc.c_oAscContentControlSpecificType.DropDownList:
                case Asc.c_oAscContentControlSpecificType.ComboBox:
                    this.onShowListActions(obj, x, y);
                    break;
            }
        },

        onApiLockDocumentProps: function() {
            this._state.lock_doc = true;
        },

        onApiUnLockDocumentProps: function() {
            this._state.lock_doc = false;
        },

        onCoAuthoringDisconnect: function() {
            this.mode.isEdit = false;
        },

        SetDisabled: function(state, canProtect, fillFormMode) {
            this._isDisabled = state;
            this.documentHolder.SetDisabled(state, canProtect, fillFormMode);
            this.disableEquationBar();
            this.disableSpecialPaste();
        },

        clearSelection: function() {
            this.onHideMathTrack();
            this.onHideSpecialPasteOptions();
        },

        onTextLanguage: function(langid) {
            this.documentHolder._currLang.id = langid;
        },

        onSpellCheckVariantsFound: function() {
            var me = this;
            var selectedElements = me.api.getSelectedElements(true);
            var props;
            if (selectedElements && _.isArray(selectedElements)){
                for (var i = 0; i <selectedElements.length; i++) {
                    if ( selectedElements[i].get_ObjectType() == Asc.c_oAscTypeSelectElement.SpellCheck) {
                        props = selectedElements[i].get_ObjectValue();
                        me.documentHolder._currentSpellObj = props;
                        break;
                    }
                }
            }
            if (props && props.get_Checked()===false && props.get_Variants() !== null && props.get_Variants() !== undefined) {
                me.documentHolder.addWordVariants();
                if (me.documentHolder.textMenu && me.documentHolder.textMenu.isVisible()) {
                    me.documentHolder.textMenu.alignPosition();
                }
            }
        },

        equationCallback: function(eqObj) {
            eqObj && this.api.asc_SetMathProps(eqObj);
            this.editComplete();
        },

        changePosition: function() {
            var me = this,
                cmpEl = me.documentHolder.cmpEl;
            me._XY = [
                cmpEl.offset().left - $(window).scrollLeft(),
                cmpEl.offset().top  - $(window).scrollTop()
            ];
            me._Height = cmpEl.height();
            me._Width = cmpEl.width();
            me._BodyWidth = $('body').width();
            me.onMouseMoveStart();
        },

        addHyperlink: function(item, e, eOpt){
            var win, me = this;
            if (me.api){
                win = new DE.Views.HyperlinkSettingsDialog({
                    api: me.api,
                    appOptions: me.mode,
                    handler: function(dlg, result) {
                        if (result == 'ok') {
                            me.api.add_Hyperlink(dlg.getSettings());
                        }
                        me.editComplete();
                    }
                });

                win.show();
                win.setSettings(item.hyperProps.value);

                Common.component.Analytics.trackEvent('DocumentHolder', 'Add Hyperlink');
            }
        },

        editHyperlink: function(item, e, eOpt){
            var win, me = this;
            if (me.api){
                win = new DE.Views.HyperlinkSettingsDialog({
                    api: me.api,
                    appOptions: me.mode,
                    handler: function(dlg, result) {
                        if (result == 'ok') {
                            me.api.change_Hyperlink(win.getSettings());
                        }
                        me.editComplete();
                    }
                });
                win.show();
                win.setSettings(item.hyperProps.value);
            }
        },

        onRemoveHyperlink: function(item, e){
            this.api && this.api.remove_Hyperlink(item.hyperProps.value);
            this.editComplete();
        },

        editChartClick: function(){
            if (!Common.Controllers.LaunchController.isScriptLoaded()) return;

            var diagramEditor = DE.getController('Common.Controllers.ExternalDiagramEditor').getView('Common.Views.ExternalDiagramEditor');
            if (diagramEditor) {
                diagramEditor.setEditMode(true);
                diagramEditor.show();

                var chart = this.api.asc_getChartObject();
                if (chart) {
                    diagramEditor.setChartData(new Asc.asc_CChartBinary(chart));
                }
            }
        },

        advancedParagraphClick: function(item, e, eOpt){
            var win, me = this;
            if (me.api){
                var selectedElements = me.api.getSelectedElements();
                if (selectedElements && _.isArray(selectedElements)){
                    for (var i = selectedElements.length - 1; i >= 0; i--) {
                        var elType, elValue;
                        elType  = selectedElements[i].get_ObjectType();
                        elValue = selectedElements[i].get_ObjectValue();

                        if (Asc.c_oAscTypeSelectElement.Paragraph == elType) {
                            win = new DE.Views.ParagraphSettingsAdvanced({
                                tableStylerRows     : 2,
                                tableStylerColumns  : 1,
                                paragraphProps      : elValue,
                                borderProps         : me.borderAdvancedProps,
                                isChart             : (item.isChart===true),
                                isSmartArtInternal  : (item.isSmartArtInternal===true),
                                api             : me.api,
                                handler: function(result, value) {
                                    if (result == 'ok') {
                                        if (me.api) {
                                            me.borderAdvancedProps = value.borderProps;
                                            me.api.paraApply(value.paragraphProps);
                                        }
                                    }
                                    me.editComplete();
                                }
                            });
                            break;
                        }
                    }
                }
            }

            if (win) {
                win.show();
                return win;
            }
        },

        advancedFrameClick: function(isFrame, item, e, eOpt){
            Common.NotificationCenter.trigger('dropcap:settings', isFrame);
        },

        advancedTableClick: function(item, e, eOpt){
            var win, me = this;
            if (me.api){
                var selectedElements = me.api.getSelectedElements();

                if (selectedElements && _.isArray(selectedElements)){
                    for (var i = selectedElements.length - 1; i >= 0; i--) {
                        var elType, elValue;

                        elType  = selectedElements[i].get_ObjectType();
                        elValue = selectedElements[i].get_ObjectValue();

                        if (Asc.c_oAscTypeSelectElement.Table == elType) {
                            win = new DE.Views.TableSettingsAdvanced({
                                tableStylerRows     : (elValue.get_CellBorders().get_InsideH()===null && elValue.get_CellSelect()==true) ? 1 : 2,
                                tableStylerColumns  : (elValue.get_CellBorders().get_InsideV()===null && elValue.get_CellSelect()==true) ? 1 : 2,
                                tableProps          : elValue,
                                borderProps         : me.borderAdvancedProps,
                                sectionProps        : me.api.asc_GetSectionProps(),
                                handler             : function(result, value) {
                                    if (result == 'ok') {
                                        if (me.api) {
                                            me.borderAdvancedProps = value.borderProps;
                                            me.api.tblApply(value.tableProps);
                                        }
                                    }
                                    me.editComplete();
                                }
                            });
                            break;
                        }
                    }
                }
            }

            if (win) {
                win.show();
                return win;
            }
        },

        onMenuSaveStyle:function(item, e, eOpt){
            var me = this;
            if (me.api) {
                Common.NotificationCenter.trigger('style:commitsave', me.api.asc_GetStyleFromFormatting());
            }
        },

        onMenuUpdateStyle:function(item, e, eOpt){
            var me = this;
            if (me.api) {
                Common.NotificationCenter.trigger('style:commitchange', me.api.asc_GetStyleFromFormatting());
            }
        },

        addComment: function(item, e, eOpt){
            if (this.api && this.mode.canCoAuthoring && this.mode.canComments) {
                this.documentHolder.suppressEditComplete = true;

                var controller = DE.getController('Common.Controllers.Comments');
                if (controller) {
                    controller.addDummyComment();
                }
            }
        },

        onCutCopyPaste: function(item, e) {
            var me = this;
            if (me.api) {
                var res =  (item.value == 'cut') ? me.api.Cut() : ((item.value == 'copy') ? me.api.Copy() : me.api.Paste());
                if (!res) {
                    if (!Common.localStorage.getBool("de-hide-copywarning")) {
                        (new Common.Views.CopyWarningDialog({
                            handler: function(dontshow) {
                                if (dontshow) Common.localStorage.setItem("de-hide-copywarning", 1);
                                me.editComplete();
                            }
                        })).show();
                    }
                }
            }
            me.editComplete();
        },

        onUndo: function () {
            this.api && this.api.Undo();
        },

        onRedo: function () {
            this.api && this.api.Redo();
        },

        onClear: function () {
            if (this.api) {
                var props = this.api.asc_IsContentControl() ? this.api.asc_GetContentControlProperties() : null;
                if (props) {
                    this.api.asc_ClearContentControl(props.get_InternalId());
                }
            }
        },

        onAcceptRejectChange: function(item, e) {
            if (this.api) {
                if (item.value == 'accept')
                    this.api.asc_AcceptChangesBySelection(false);
                else if (item.value == 'reject')
                    this.api.asc_RejectChangesBySelection(false);
            }
            this.editComplete();
        },

        onPrintSelection: function(item){
            if (this.api){
                var printopt = new Asc.asc_CAdjustPrint();
                printopt.asc_setPrintType(Asc.c_oAscPrintType.Selection);
                var opts = new Asc.asc_CDownloadOptions(null, Common.Utils.isChrome || Common.Utils.isOpera || Common.Utils.isGecko && Common.Utils.firefoxVersion>86); // if isChrome or isOpera == true use asc_onPrintUrl event
                opts.asc_setAdvancedOptions(printopt);
                this.api.asc_Print(opts);
                this.editComplete();
                Common.component.Analytics.trackEvent('DocumentHolder', 'Print Selection');
            }
        },

        onControlsSelect: function(item, e) {
            var me = this;
            var props = this.api.asc_GetContentControlProperties();
            if (props) {
                if (item.value == 'settings') {
                    (new DE.Views.ControlSettingsDialog({
                        props: props,
                        api: me.api,
                        handler: function (result, value) {
                            if (result == 'ok') {
                                me.api.asc_SetContentControlProperties(value, props.get_InternalId());
                            }

                            me.editComplete();
                        }
                    })).show();
                } else if (item.value == 'remove') {
                    props.get_FormPr() ? this.api.asc_RemoveContentControl(props.get_InternalId()) : this.api.asc_RemoveContentControlWrapper(props.get_InternalId());
                }
            }
            me.editComplete();
        },

        onInsertCaption: function() {
            this.documentHolder.fireEvent('links:caption');
        },

        onContinueNumbering: function(item, e) {
            this.api.asc_ContinueNumbering();
            this.editComplete();
        },

        onStartNumbering: function(startfrom, item, e) {
            if (startfrom == 1)
                this.api.asc_RestartNumbering(item.value.start);
            else {
                var me = this;
                (new DE.Views.NumberingValueDialog({
                    title: me.documentHolder.textNumberingValue,
                    props: item.value,
                    handler: function (result, value) {
                        if (result == 'ok')
                            me.api.asc_RestartNumbering(value);
                        me.editComplete();
                    }
                })).show();
            }
            this.editComplete();
        },

        onCellsRemove: function() {
            var me = this;
            (new Common.Views.OptionsDialog({
                title: me.documentHolder.textTitleCellsRemove,
                items: [
                    {caption: this.documentHolder.textLeft, value: 'left'},
                    {caption: this.documentHolder.textRow, value: 'row'},
                    {caption: this.documentHolder.textCol, value: 'col'}
                ],
                handler: function (dlg, result) {
                    if (result=='ok') {
                        var value = dlg.getSettings();
                        if (value == 'row')
                            me.api.remRow();
                        else if (value == 'col')
                            me.api.remColumn();
                        else
                            me.api.asc_RemoveTableCells();
                    }
                    me.editComplete();
                }
            })).show();
            this.editComplete();
        },

        onCellsAdd: function() {
            var me = this;
            (new DE.Views.CellsAddDialog({
                handler: function (result, settings) {
                    if (result == 'ok') {
                        if (settings.row) {
                            settings.before ? me.api.addRowAbove(settings.count) : me.api.addRowBelow(settings.count);
                        } else {
                            settings.before ? me.api.addColumnLeft(settings.count) : me.api.addColumnRight(settings.count);
                        }
                    }
                    me.editComplete();
                }
            })).show();
            this.editComplete();
        },

        onSignatureClick: function(item) {
            var datavalue = item.cmpEl.attr('data-value');
            switch (item.value) {
                case 0:
                    Common.NotificationCenter.trigger('protect:sign', datavalue); //guid
                    break;
                case 1:
                    this.api.asc_ViewCertificate(datavalue); //certificate id
                    break;
                case 2:
                    var docProtection = this.documentHolder._docProtection;
                    Common.NotificationCenter.trigger('protect:signature', 'visible', this._isDisabled || docProtection.isReadOnly || docProtection.isFormsOnly || docProtection.isCommentsOnly, datavalue);//guid, can edit settings for requested signature
                    break;
                case 3:
                    var me = this;
                    Common.UI.warning({
                        title: this.documentHolder.notcriticalErrorTitle,
                        msg: this.documentHolder.txtRemoveWarning,
                        buttons: ['ok', 'cancel'],
                        primary: 'ok',
                        callback: function(btn) {
                            if (btn == 'ok') {
                                me.api.asc_RemoveSignature(datavalue);
                            }
                        }
                    });
                    break;
            }
        },

        onImgRotate: function(item) {
            var properties = new Asc.asc_CImgProperty();
            properties.asc_putRotAdd((item.value==1 ? 90 : 270) * 3.14159265358979 / 180);
            this.api.ImgApply(properties);
            this.editComplete();
        },

        onImgFlip: function(item) {
            var properties = new Asc.asc_CImgProperty();
            if (item.value==1)
                properties.asc_putFlipHInvert(true);
            else
                properties.asc_putFlipVInvert(true);
            this.api.ImgApply(properties);
            this.editComplete();
        },

        onImgCrop: function(menu, item) {
            if (item.value == 1) {
                this.api.asc_cropFill();
            } else if (item.value == 2) {
                this.api.asc_cropFit();
            } else {
                item.checked ? this.api.asc_startEditCrop() : this.api.asc_endEditCrop();
            }
            this.editComplete();
        },

        onFollowMove: function(item) {
            if (this.api) {
                this.api.asc_FollowRevisionMove(item.value);
            }
            this.editComplete();
        },

        tableCellsVAlign: function(menu, item, e) {
            if (this.api) {
                var properties = new Asc.CTableProp();
                properties.put_CellsVAlign(item.options.valign);
                this.api.tblApply(properties);
            }
        },

        tableSelectText: function(menu, item, e) {
            if (this.api) {
                switch (item.value) {
                    case 0:
                        this.api.selectRow();
                        break;
                    case 1:
                        this.api.selectColumn();
                        break;
                    case 2:
                        this.api.selectCell();
                        break;
                    case 3:
                        this.api.selectTable();
                        break;
                }
            }
        },

        tableInsertText: function(menu, item, e) {
            if (this.api) {
                switch (item.value) {
                    case 0:
                        this.api.addColumnLeft();
                        break;
                    case 1:
                        this.api.addColumnRight();
                        break;
                    case 2:
                        this.api.addRowAbove();
                        break;
                    case 3:
                        this.api.addRowBelow();
                        break;
                    case 4:
                        this.onCellsAdd();
                        break;
                }
            }
        },

        tableDeleteText: function(menu, item, e) {
            if (this.api) {
                switch (item.value) {
                    case 0:
                        this.api.remRow();
                        break;
                    case 1:
                        this.api.remColumn();
                        break;
                    case 2:
                        this.api.remTable();
                        break;
                    case 3:
                        this.onCellsRemove();
                        break;
                }
            }
        },

        onImgAlign: function(menu, item, e) {
            var me = this;
            if (me.api) {
                var alignto = Common.Utils.InternalSettings.get("de-img-align-to"),
                    value = (alignto==1) ? Asc.c_oAscObjectsAlignType.Page : ((me.api.asc_getSelectedDrawingObjectsCount()<2 && !alignto || alignto==2) ? Asc.c_oAscObjectsAlignType.Margin : Asc.c_oAscObjectsAlignType.Selected);
                if (item.value < 6) {
                    me.api.put_ShapesAlign(item.value, value);
                    Common.component.Analytics.trackEvent('DocumentHolder', 'Shape Align');
                } else if (item.value == 6) {
                    me.api.DistributeHorizontally(value);
                    Common.component.Analytics.trackEvent('DocumentHolder', 'Distribute Horizontally');
                } else if (item.value == 7){
                    me.api.DistributeVertically(value);
                    Common.component.Analytics.trackEvent('DocumentHolder', 'Distribute Vertically');
                }
            }
            me.editComplete();
        },

        onImgArrange: function(menu, item, e) {
            var me = this;
            if (me.api && item.options.valign!==undefined) {
                var properties = new Asc.asc_CImgProperty();
                properties.put_ChangeLevel(item.options.valign);
                me.api.ImgApply(properties);
            }
            me.editComplete();
        },

        onImgGroup: function(item) {
            var me = this;
            if (me.api) {
                var properties = new Asc.asc_CImgProperty();
                properties.put_Group(1);
                me.api.ImgApply(properties);
            }
            me.editComplete();
        },

        onImgUnGroup: function(item) {
            var me = this;
            if (me.api) {
                var properties = new Asc.asc_CImgProperty();
                properties.put_Group(-1);
                me.api.ImgApply(properties);
            }
            me.editComplete();
        },

        onImgWrapPolygon: function(item) {
            this.api && this.api.StartChangeWrapPolygon();
            this.editComplete();
        },

        onImgWrap: function (menu, item, e) {
            var me = this;
            if (me.api && item.options.wrapType!==undefined) {
                var properties = new Asc.asc_CImgProperty();
                properties.put_WrappingStyle(item.options.wrapType);

                if (me.documentHolder.menuImageWrap._originalProps.get_WrappingStyle() === Asc.c_oAscWrapStyle2.Inline && item.wrapType !== Asc.c_oAscWrapStyle2.Inline ) {
                    properties.put_PositionH(new Asc.CImagePositionH());
                    properties.get_PositionH().put_UseAlign(false);
                    properties.get_PositionH().put_RelativeFrom(Asc.c_oAscRelativeFromH.Column);
                    var val = me.documentHolder.menuImageWrap._originalProps.get_Value_X(Asc.c_oAscRelativeFromH.Column);
                    properties.get_PositionH().put_Value(val);

                    properties.put_PositionV(new Asc.CImagePositionV());
                    properties.get_PositionV().put_UseAlign(false);
                    properties.get_PositionV().put_RelativeFrom(Asc.c_oAscRelativeFromV.Paragraph);
                    val = me.documentHolder.menuImageWrap._originalProps.get_Value_Y(Asc.c_oAscRelativeFromV.Paragraph);
                    properties.get_PositionV().put_Value(val);
                }
                me.api.ImgApply(properties);
            }
            me.editComplete();
        },

        onImgAdvanced: function(item, e) {
            var elType, elValue;
            var me = this;
            if (me.api){
                var selectedElements = me.api.getSelectedElements();

                if (selectedElements && _.isArray(selectedElements)) {
                    for (var i = selectedElements.length - 1; i >= 0; i--) {
                        elType  = selectedElements[i].get_ObjectType();
                        elValue = selectedElements[i].get_ObjectValue();

                        if (Asc.c_oAscTypeSelectElement.Image == elType) {
                            var imgsizeOriginal;
                            if ( !elValue.get_ChartProperties() && !elValue.get_ShapeProperties() && !me.documentHolder.menuOriginalSize.isDisabled() && me.documentHolder.menuOriginalSize.isVisible()) {
                                imgsizeOriginal = me.api.get_OriginalSizeImage();
                                if (imgsizeOriginal)
                                    imgsizeOriginal = {width:imgsizeOriginal.get_ImageWidth(), height:imgsizeOriginal.get_ImageHeight()};
                            }

                            var win = new DE.Views.ImageSettingsAdvanced({
                                imageProps  : elValue,
                                sizeOriginal: imgsizeOriginal,
                                api         : me.api,
                                sectionProps: me.api.asc_GetSectionProps(),
                                handler     : function(result, value) {
                                    if (result == 'ok') {
                                        if (me.api) {
                                            me.api.ImgApply(value.imageProps);
                                        }
                                    }
                                    me.editComplete();
                                }
                            });
                            win.show();
                            win.btnOriginalSize.setVisible(me.documentHolder.menuOriginalSize.isVisible());
                            break;
                        }
                    }
                }
            }
        },

        onImgOriginalSize: function(item, e) {
            var me = this;
            if (me.api){
                var originalImageSize = me.api.get_OriginalSizeImage();

                var properties = new Asc.asc_CImgProperty();
                properties.put_Width(originalImageSize.get_ImageWidth());
                properties.put_Height(originalImageSize.get_ImageHeight());
                properties.put_ResetCrop(true);
                properties.put_Rot(0);
                me.api.ImgApply(properties);

                me.editComplete();
            }
        },

        onImgReplace: function(menu, item, e) {
            var me = this;
            if (item.value==1) {
                (new Common.Views.ImageFromUrlDialog({
                    handler: function(result, value) {
                        if (result == 'ok') {
                            if (me.api) {
                                var checkUrl = value.replace(/ /g, '');
                                if (!_.isEmpty(checkUrl)) {
                                    var props = new Asc.asc_CImgProperty();
                                    props.put_ImageUrl(checkUrl);
                                    me.api.ImgApply(props);
                                }
                            }
                        }
                        me.editComplete();
                    }
                })).show();
            } else if (item.value==2) {
                Common.NotificationCenter.trigger('storage:image-load', 'change');
            } else {
                setTimeout(function(){
                    if (me.api) me.api.ChangeImageFromFile();
                    me.editComplete();
                }, 10);
            }
        },

        onImgEditPoints: function(item) {
            this.api && this.api.asc_editPointsGeometry();
        },

        onTableMerge: function(item) {
            this.api && this.api.MergeCells();
        },

        onTableSplit: function(item) {
            var me = this;
            if (me.api){
                (new Common.Views.InsertTableDialog({
                    split: true,
                    handler: function(result, value) {
                        if (result == 'ok') {
                            if (me.api) {
                                me.api.SplitCell(value.columns, value.rows);
                            }
                            Common.component.Analytics.trackEvent('DocumentHolder', 'Table');
                        }
                        me.editComplete();
                    }
                })).show();
            }
        },

        onIgnoreSpell: function(item, e){
            this.api && this.api.asc_ignoreMisspelledWord(this.documentHolder._currentSpellObj, !!item.value);
            this.editComplete();
        },

        onToDictionary: function(item, e){
            this.api && this.api.asc_spellCheckAddToDictionary(this.documentHolder._currentSpellObj);
            this.editComplete();
        },

        onTableDist: function(item, e){
            this.api && this.api.asc_DistributeTableCells(!!item.value);
            this.editComplete();
        },

        tableDirection: function(menu, item, e) {
            var me = this;
            if (me.api) {
                var properties = new Asc.CTableProp();
                properties.put_CellsTextDirection(item.options.direction);
                me.api.tblApply(properties);
            }
        },

        onRefreshField: function(item, e){
            this.api && this.api.asc_UpdateFields(true);
            this.editComplete();
        },

        onEditField: function(item, e){
            this.documentHolder.fireEvent('field:edit', ['edit']);
        },

        onParagraphBreakBefore: function(item, e){
            this.api && this.api.put_PageBreak(item.checked);
        },

        onParagraphKeepLines: function(item, e){
            this.api && this.api.put_KeepLines(item.checked);
        },

        paragraphVAlign: function(menu, item, e) {
            var me = this;
            if (me.api) {
                var properties = new Asc.asc_CImgProperty();
                properties.put_VerticalTextAlign(item.options.valign);
                me.api.ImgApply(properties);
            }
        },

        paragraphDirection: function(menu, item, e) {
            var me = this;
            if (me.api) {
                var properties = new Asc.asc_CImgProperty();
                properties.put_Vert(item.options.direction);
                me.api.ImgApply(properties);
            }
        },

        onLangMenu: function(type, menu, item){
            var me = this;
            if (me.api){
                if (!_.isUndefined(item.langid))
                    me.api.put_TextPrLang(item.langid);

                (type==='para') ? (me.documentHolder._currLang.paraid = item.langid) : (me.documentHolder._currLang.tableid = item.langid);
                me.editComplete();
            }
        },

        onTOCMenu: function(menu, item, e) {
            this.documentHolder.fireEvent((item.value==='settings') ? 'links:contents' : 'links:update', [item.value, true]);
        },

        onParaTOCSettings: function(item, e) {
            this.documentHolder.fireEvent('links:contents', [item.value, true]);
        },

        onSpecialPasteItemClick: function(item, e) {
            if (this.api) {
                this.api.asc_SpecialPaste(item.value);
                var menu = this.btnSpecialPaste.menu;
                if (!item.cmpEl) {
                    for (var i = 0; i < menu.items.length; i++) {
                        menu.items[i].setChecked(menu.items[i].value===item.value, true);
                    }
                }
                setTimeout(function(){
                    menu.hide();
                }, 100);
            }
            return false;
        },

        onShowMathTrack: function(bounds) {
            if (this.mode && !this.mode.isEdit) return;

            this.lastMathTrackBounds = bounds;
            if (!Common.Controllers.LaunchController.isScriptLoaded()) {
                this.showMathTrackOnLoad = true;
                return;
            }

            if (bounds[3] < 0 || Common.Utils.InternalSettings.get('de-equation-toolbar-hide')) {
                this.onHideMathTrack();
                return;
            }
            var me = this,
                documentHolder = me.documentHolder,
                eqContainer = documentHolder.cmpEl.find('#equation-container');

            // Prepare menu container
            if (eqContainer.length < 1) {
                var equationsStore = me.getApplication().getCollection('EquationGroups'),
                    eqStr = '<div id="equation-container" style="position: absolute;">';

                me.getApplication().getController('Toolbar').onMathTypes();

                me.equationBtns = [];
                for (var i = 0; i < equationsStore.length; ++i) {
                    eqStr += '<span id="id-document-holder-btn-equation-' + i + '"></span>';
                }
                eqStr += '<div class="separator"></div>';
                eqStr += '<span id="id-document-holder-btn-equation-settings"></span>';
                eqStr += '</div>';
                eqContainer = $(eqStr);
                documentHolder.cmpEl.find('#id_main_view').append(eqContainer);
                var onShowBefore = function (menu) {
                    var index = menu.options.value,
                        group = equationsStore.at(index);
                    var equationPicker = new Common.UI.DataViewSimple({
                        el: $('#id-document-holder-btn-equation-menu-' + index, menu.cmpEl),
                        parentMenu: menu,
                        store: group.get('groupStore'),
                        scrollAlwaysVisible: true,
                        showLast: false,
                        restoreHeight: 450,
                        itemTemplate: _.template(
                            '<div class="item-equation" style="" >' +
                            '<div class="equation-icon" style="background-position:<%= posX %>px <%= posY %>px;width:<%= width %>px;height:<%= height %>px;" id="<%= id %>"></div>' +
                            '</div>')
                    });
                    equationPicker.on('item:click', function(picker, item, record, e) {
                        if (me.api) {
                            if (record)
                                me.api.asc_AddMath(record.get('data').equationType);
                        }
                    });
                    menu.off('show:before', onShowBefore);
                };
                var bringForward = function (menu) {
                    eqContainer.addClass('has-open-menu');
                };
                var sendBackward = function (menu) {
                    eqContainer.removeClass('has-open-menu');
                };
                for (var i = 0; i < equationsStore.length; ++i) {
                    var equationGroup = equationsStore.at(i);
                    var btn = new Common.UI.Button({
                        parentEl: $('#id-document-holder-btn-equation-' + i, documentHolder.cmpEl),
                        cls         : 'btn-toolbar no-caret',
                        iconCls     : 'svgicon ' + equationGroup.get('groupIcon'),
                        hint        : equationGroup.get('groupName'),
                        menu        : new Common.UI.Menu({
                            cls: 'menu-shapes',
                            value: i,
                            items: [
                                { template: _.template('<div id="id-document-holder-btn-equation-menu-' + i +
                                '" class="menu-shape margin-left-5" style="width:' + (equationGroup.get('groupWidth') + 8) + 'px; ' +
                                equationGroup.get('groupHeightStr') + '"></div>') }
                            ]
                        })
                    });
                    btn.menu.on('show:before', onShowBefore);
                    btn.menu.on('show:before', bringForward);
                    btn.menu.on('hide:after', sendBackward);
                    me.equationBtns.push(btn);
                }

                me.equationSettingsBtn = new Common.UI.Button({
                    parentEl: $('#id-document-holder-btn-equation-settings', documentHolder.cmpEl),
                    cls         : 'btn-toolbar no-caret',
                    iconCls     : 'toolbar__icon btn-more-vertical',
                    hint        : me.documentHolder.advancedEquationText,
                    menu        : me.documentHolder.createEquationMenu('popuptbeqinput', 'tl-bl')
                });
                me.equationSettingsBtn.menu.options.initMenu = function() {
                    var eq = me.api.asc_GetMathInputType(),
                        menu = me.equationSettingsBtn.menu,
                        isInlineMath = me.api.asc_IsInlineMath(),
                        isEqToolbarHide = Common.Utils.InternalSettings.get('de-equation-toolbar-hide');

                    menu.items[5].setChecked(eq===Asc.c_oAscMathInputType.Unicode);
                    menu.items[6].setChecked(eq===Asc.c_oAscMathInputType.LaTeX);
                    menu.items[8].options.isEquationInline = isInlineMath;
                    menu.items[8].setCaption(isInlineMath ? me.documentHolder.eqToDisplayText : me.documentHolder.eqToInlineText, true);
                    menu.items[9].options.isToolbarHide = isEqToolbarHide;
                    menu.items[9].setCaption(isEqToolbarHide ? me.documentHolder.showEqToolbar : me.documentHolder.hideEqToolbar, true);
                };
                me.equationSettingsBtn.menu.on('item:click', _.bind(me.convertEquation, me));
                me.equationSettingsBtn.menu.on('show:before', function(menu) {
                    bringForward();
                    menu.options.initMenu();
                });
                me.equationSettingsBtn.menu.on('hide:after', sendBackward);
            }

            var showPoint = [(bounds[0] + bounds[2])/2 - eqContainer.outerWidth()/2, bounds[1] - eqContainer.outerHeight() - 10];
            if (!Common.Utils.InternalSettings.get("de-hidden-rulers")) {
                showPoint = [showPoint[0] - 19, showPoint[1] - 26];
            }
            (showPoint[0]<0) && (showPoint[0] = 0);
            if (showPoint[1]<0) {
                showPoint[1] = bounds[3] + 10;
                !Common.Utils.InternalSettings.get("de-hidden-rulers") && (showPoint[1] -= 26);
            }
            showPoint[1] = Math.min(me._Height - eqContainer.outerHeight(), Math.max(0, showPoint[1]));
            eqContainer.css({left: showPoint[0], top : showPoint[1]});

            if (me._XY === undefined) {
                me._XY = [
                    documentHolder.cmpEl.offset().left - $(window).scrollLeft(),
                    documentHolder.cmpEl.offset().top - $(window).scrollTop()
                ];
                me._Height = documentHolder.cmpEl.height();
                me._Width = documentHolder.cmpEl.width();
                me._BodyWidth = $('body').width();
            }

            var diffDown = me._Height - showPoint[1] - eqContainer.outerHeight(),
                diffUp = me._XY[1] + (!Common.Utils.InternalSettings.get("de-hidden-rulers") ? 26 : 0) + showPoint[1],
                menuAlign = (diffDown < 220 && diffDown < diffUp*0.9) ? 'bl-tl' : 'tl-bl';
            if (Common.UI.isRTL()) {
                menuAlign = menuAlign === 'bl-tl' ? 'br-tr' : 'tr-br';
            }
            me.equationBtns.forEach(function(item){
                item && (item.menu.menuAlign = menuAlign);
            });
            me.equationSettingsBtn.menu.menuAlign = menuAlign;
            if (eqContainer.is(':visible')) {
                if (me.equationSettingsBtn.menu.isVisible()) {
                    me.equationSettingsBtn.menu.options.initMenu();
                    me.equationSettingsBtn.menu.alignPosition();
                }
            } else {
                eqContainer.show();
            }
            me.disableEquationBar();
        },

        onHideMathTrack: function() {
            if (!this.documentHolder || !this.documentHolder.cmpEl) return;
            if (!Common.Controllers.LaunchController.isScriptLoaded()) {
                this.showMathTrackOnLoad = false;
                return;
            }
            var eqContainer = this.documentHolder.cmpEl.find('#equation-container');
            if (eqContainer.is(':visible')) {
                eqContainer.hide();
            }
        },

        disableEquationBar: function() {
            var eqContainer = this.documentHolder.cmpEl.find('#equation-container'),
                docProtection = this.documentHolder._docProtection,
                disabled = this._isDisabled || this._state.equationLocked || docProtection.isReadOnly || docProtection.isFormsOnly || docProtection.isCommentsOnly;

            if (eqContainer.length>0 && eqContainer.is(':visible')) {
                this.equationBtns.forEach(function(item){
                    item && item.setDisabled(!!disabled);
                });
                this.equationSettingsBtn.setDisabled(!!disabled);
            }
        },

        convertEquation: function(menu, item, e) {
            if (this.api) {
                if (item.options.type=='input') {
                    this.api.asc_SetMathInputType(item.value);
                    Common.localStorage.setBool("de-equation-input-latex", item.value===Asc.c_oAscMathInputType.LaTeX)
                } else if (item.options.type=='view')
                    this.api.asc_ConvertMathView(item.value.linear, item.value.all);
                else if (item.options.type=='mode'){
                    item.options.isEquationInline = !item.options.isEquationInline;
                    this.api.asc_ConvertMathDisplayMode(item.options.isEquationInline);
                }
                else if(item.options.type=='hide') {
                    item.options.isToolbarHide = !item.options.isToolbarHide; 
                    Common.Utils.InternalSettings.set('de-equation-toolbar-hide', item.options.isToolbarHide);
                    Common.localStorage.setBool('de-equation-toolbar-hide', item.options.isToolbarHide);
                    if(item.options.isToolbarHide) this.onHideMathTrack();
                    else this.onShowMathTrack(this.lastMathTrackBounds);
                }
            }
        },

        onListIndents: function(item, e) {
            if (this.api && !this.api.asc_IsShowListIndentsSettings()) {
                this.documentHolder.fireEvent('list:settings', [2]); // multilevel list
                return;
            }

            var me = this;
            me.api && (new DE.Views.ListIndentsDialog({
                api: me.api,
                props: item.value.props,
                isBullet: item.value.format === Asc.c_oAscNumberingFormat.Bullet,
                handler: function(result, value) {
                    if (result == 'ok') {
                        if (me.api) {
                            me.api.asc_ChangeNumberingLvl(item.value.listId, value, item.value.level);
                        }
                    }
                    me.editComplete();
                }
            })).show();
        },

        saveAsPicture: function() {
            if(this.api) {
                this.api.asc_SaveDrawingAsPicture();
            }
        },

        onChangeProtectDocument: function(props) {
            if (!props) {
                var docprotect = this.getApplication().getController('DocProtection');
                props = docprotect ? docprotect.getDocProps() : null;
            }
            if (props && this.documentHolder) {
                this.documentHolder._docProtection = props;
                this.disableEquationBar();
                this.disableSpecialPaste();
            }
        },

        onInsertImage: function(obj, x, y) {
            if (!this.documentHolder || this.documentHolder._docProtection.isReadOnly || this.documentHolder._docProtection.isFormsOnly || this.documentHolder._docProtection.isCommentsOnly)
                return;

            if (this.api)
                this.api.asc_addImage(obj);
            this.editComplete();
        },

        onInsertImageUrl: function(obj, x, y) {
            if (!this.documentHolder || this.documentHolder._docProtection.isReadOnly || this.documentHolder._docProtection.isFormsOnly || this.documentHolder._docProtection.isCommentsOnly)
                return;

            var me = this;
            (new Common.Views.ImageFromUrlDialog({
                handler: function(result, value) {
                    if (result == 'ok') {
                        if (me.api) {
                            var checkUrl = value.replace(/ /g, '');
                            if (!_.isEmpty(checkUrl)) {
                                me.api.AddImageUrl([checkUrl], undefined, undefined, obj);
                            }
                        }
                    }
                    me.editComplete();
                }
            })).show();
        },

        onPluginContextMenu: function(data) {
            if (data && data.length>0 && this.documentHolder && this.documentHolder.currentMenu && this.documentHolder.currentMenu.isVisible()){
                this.documentHolder.updateCustomItems(this.documentHolder.currentMenu, data);
            }
        },

        editComplete: function() {
            this.documentHolder && this.documentHolder.fireEvent('editcomplete', this.documentHolder);
        }
    });
});