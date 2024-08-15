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

var c_paragraphTextAlignment = {
    RIGHT: 0,
    LEFT: 1,
    CENTERED: 2,
    JUSTIFIED: 3
};

var c_paragraphSpecial = {
    NONE_SPECIAL: 0,
    FIRST_LINE: 1,
    HANGING: 2
};

define([
    'core',
    'pdfeditor/main/app/view/DocumentHolder'
], function () {
    'use strict';

    PDFE.Controllers.DocumentHolder = Backbone.Controller.extend({
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
                },
                'FileMenu': {
                    'settings:apply': _.bind(this.applySettings, this)
                },
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
            me.lastTextBarBounds = [];
            me.lastAnnotBarBounds = [];

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
                toolTip: new Common.UI.Tooltip({
                    owner: this,
                    html: true,
                    cls: 'eyedropper-tooltip'
                }),
                isHidden: true,
                isVisible: false,
                eyedropperColor: null,
                tipInterval: null,
                isTipVisible: false
            }
            me.userTooltip = true;
            me.wrapEvents = {
                userTipMousover: _.bind(me.userTipMousover, me),
                userTipMousout: _.bind(me.userTipMousout, me)
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
                }
            });
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
                    this.api.asc_registerCallback('asc_onHideEyedropper',               _.bind(this.hideEyedropper, this));
                    this.api.asc_registerCallback('asc_onShowPDFFormsActions',          _.bind(this.onShowFormsPDFActions, this));
                    this.api.asc_registerCallback('asc_onHidePdfFormsActions',          _.bind(this.onHidePdfFormsActions, this));
                    this.api.asc_registerCallback('asc_onCountPages',                   _.bind(this.onCountPages, this));
                    // for text
                    this.api.asc_registerCallback('asc_onShowAnnotTextPrTrack',         _.bind(this.onShowTextBar, this));
                    this.api.asc_registerCallback('asc_onHideAnnotTextPrTrack',         _.bind(this.onHideTextBar, this));
                    this.api.asc_registerCallback('asc_onShowTextSelectTrack',          _.bind(this.onShowAnnotBar, this));
                    this.api.asc_registerCallback('asc_onHideTextSelectTrack',          _.bind(this.onHideAnnotBar, this));
                }
                if (this.mode.isRestrictedEdit) {
                    this.api.asc_registerCallback('asc_onShowContentControlsActions', _.bind(this.onShowContentControlsActions, this));
                    this.api.asc_registerCallback('asc_onHideContentControlsActions', _.bind(this.onHideContentControlsActions, this));
                    Common.Gateway.on('insertimage',        _.bind(this.insertImage, this));
                    Common.NotificationCenter.on('storage:image-load', _.bind(this.openImageFromStorage, this)); // try to load image from storage
                    Common.NotificationCenter.on('storage:image-insert', _.bind(this.insertImageFromStorage, this)); // set loaded image to control
                }
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',        _.bind(this.onCoAuthoringDisconnect, this));
                Common.NotificationCenter.on('api:disconnect',                      _.bind(this.onCoAuthoringDisconnect, this));

                this.api.asc_registerCallback('asc_onShowForeignCursorLabel',       _.bind(this.onShowForeignCursorLabel, this));
                this.api.asc_registerCallback('asc_onHideForeignCursorLabel',       _.bind(this.onHideForeignCursorLabel, this));
                this.api.asc_registerCallback('asc_onFocusObject',                  _.bind(this.onFocusObject, this));
                this.api.asc_registerCallback('onPluginContextMenu',                _.bind(this.onPluginContextMenu, this));

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
            this.showMathTrackOnLoad && this.onShowMathTrack(this.lastMathTrackBounds);
        },

        createDelayedElements: function(view, type) {
            var me = this,
                view = me.documentHolder;

            if (type==='pdf') {
                view.menuPDFViewCopy.on('click', _.bind(me.onCutCopyPaste, me));
                view.menuAddComment.on('click', _.bind(me.addComment, me));
                view.menuRemoveComment.on('click', _.bind(me.removeComment, me));
            } else if (type==='forms') {
                view.menuPDFFormsUndo.on('click', _.bind(me.onUndo, me));
                view.menuPDFFormsRedo.on('click', _.bind(me.onRedo, me));
                view.menuPDFFormsClear.on('click', _.bind(me.onClear, me));
                view.menuPDFFormsCut.on('click', _.bind(me.onCutCopyPaste, me));
                view.menuPDFFormsCopy.on('click', _.bind(me.onCutCopyPaste, me));
                view.menuPDFFormsPaste.on('click', _.bind(me.onCutCopyPaste, me));
            } else if (type==='edit') {
                view.menuPDFEditCopy.on('click', _.bind(me.onCutCopyPaste, me));
                view.menuEditAddComment.on('click', _.bind(me.addComment, me));
                view.menuEditRemoveComment.on('click', _.bind(me.removeComment, me));
/*
                var diagramEditor = this.getApplication().getController('Common.Controllers.ExternalDiagramEditor').getView('Common.Views.ExternalDiagramEditor');
                if (diagramEditor) {
                    diagramEditor.on('internalmessage', _.bind(function(cmp, message) {
                        var command = message.data.command;
                        var data = message.data.data;
                        if (this.api) {
                            ( diagramEditor.isEditMode() )
                                ? this.api.asc_editChartDrawingObject(data)
                                : this.api.asc_addChartDrawingObject(data, diagramEditor.getPlaceholder());
                        }
                    }, this));
                    diagramEditor.on('hide', _.bind(function(cmp, message) {
                        if (this.api) {
                            this.api.asc_onCloseChartFrame();
                            this.api.asc_enableKeyEvents(true);
                        }
                        var me = this;
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
                        var me = this;
                        setTimeout(function(){
                            me.editComplete();
                        }, 10);
                    }, this));
                }
 */
                view.menuParaCopy.on('click', _.bind(me.onCutCopyPaste, me));
                view.menuParaPaste.on('click', _.bind(me.onCutCopyPaste, me));
                view.menuParaCut.on('click', _.bind(me.onCutCopyPaste, me));
                view.menuImgCopy.on('click', _.bind(me.onCutCopyPaste, me));
                view.menuImgPaste.on('click', _.bind(me.onCutCopyPaste, me));
                view.menuImgCut.on('click', _.bind(me.onCutCopyPaste, me));
                view.menuTableCopy.on('click', _.bind(me.onCutCopyPaste, me));
                view.menuTablePaste.on('click', _.bind(me.onCutCopyPaste, me));
                view.menuTableCut.on('click', _.bind(me.onCutCopyPaste, me));
                view.menuAddHyperlinkPara.on('click', _.bind(me.addHyperlink, me));
                view.menuAddHyperlinkTable.on('click', _.bind(me.addHyperlink, me));
                view.menuEditHyperlinkPara.on('click', _.bind(me.editHyperlink, me));
                view.menuEditHyperlinkTable.on('click', _.bind(me.editHyperlink, me));
                view.menuRemoveHyperlinkPara.on('click', _.bind(me.removeHyperlink, me));
                view.menuRemoveHyperlinkTable.on('click', _.bind(me.removeHyperlink, me));
                // view.menuChartEdit.on('click', _.bind(me.editChartClick, me, undefined));
                view.menuImgSaveAsPicture.on('click', _.bind(me.saveAsPicture, me));
                view.menuTableSaveAsPicture.on('click', _.bind(me.saveAsPicture, me));
                view.menuAddCommentPara.on('click', _.bind(me.addComment, me));
                view.menuAddCommentTable.on('click', _.bind(me.addComment, me));
                view.menuAddCommentImg.on('click', _.bind(me.addComment, me));
                view.mnuTableMerge.on('click', _.bind(me.onTableMerge, me));
                view.mnuTableSplit.on('click', _.bind(me.onTableSplit, me));
                view.menuTableCellAlign.menu.on('item:click', _.bind(me.tableCellsVAlign, me));
                view.menuTableDistRows.on('click', _.bind(me.onTableDistRows, me));
                view.menuTableDistCols.on('click', _.bind(me.onTableDistCols, me));
                view.menuTableAdvanced.on('click', _.bind(me.onTableAdvanced, me));
                view.menuImageAdvanced.on('click', _.bind(me.onImageAdvanced, me));
                view.menuImgOriginalSize.on('click', _.bind(me.onImgOriginalSize, me));
                view.menuImgShapeRotate.menu.items[0].on('click', _.bind(me.onImgRotate, me));
                view.menuImgShapeRotate.menu.items[1].on('click', _.bind(me.onImgRotate, me));
                view.menuImgShapeRotate.menu.items[3].on('click', _.bind(me.onImgFlip, me));
                view.menuImgShapeRotate.menu.items[4].on('click', _.bind(me.onImgFlip, me));
                view.menuImgCrop.menu.on('item:click', _.bind(me.onImgCrop, me));
                view.menuImgEditPoints.on('click', _.bind(me.onImgEditPoints, me));
                view.menuShapeAdvanced.on('click', _.bind(me.onShapeAdvanced, me));
                view.menuParagraphAdvanced.on('click', _.bind(me.onParagraphAdvanced, me));
                // view.menuChartAdvanced.on('click', _.bind(me.onChartAdvanced, me));
                view.mnuGroupImg.on('click', _.bind(me.onGroupImg, me));
                view.mnuUnGroupImg.on('click', _.bind(me.onUnGroupImg, me));
                view.mnuArrangeFront.on('click', _.bind(me.onArrangeFront, me));
                view.mnuArrangeBack.on('click', _.bind(me.onArrangeBack, me));
                view.mnuArrangeForward.on('click', _.bind(me.onArrangeForward, me));
                view.mnuArrangeBackward.on('click', _.bind(me.onArrangeBackward, me));
                view.menuImgShapeAlign.menu.on('item:click', _.bind(me.onImgShapeAlign, me));
                view.menuParagraphVAlign.menu.on('item:click', _.bind(me.onParagraphVAlign, me));
                view.menuParagraphDirection.menu.on('item:click', _.bind(me.onParagraphDirection, me));
                view.menuTableSelectText.menu.on('item:click', _.bind(me.tableSelectText, me));
                view.menuTableInsertText.menu.on('item:click', _.bind(me.tableInsertText, me));
                view.menuTableDeleteText.menu.on('item:click', _.bind(me.tableDeleteText, me));
                view.menuTableEquationSettings.menu.on('item:click', _.bind(me.convertEquation, me));
                view.menuParagraphEquation.menu.on('item:click', _.bind(me.convertEquation, me));
                view.mnuNewPageBefore.on('click', _.bind(me.onNewPage, me));
                view.mnuNewPageAfter.on('click', _.bind(me.onNewPage, me));
                view.mnuDeletePage.on('click', _.bind(me.onDeletePage, me));
                view.mnuRotatePageRight.on('click', _.bind(me.onRotatePage, me, 90));
                view.mnuRotatePageLeft.on('click', _.bind(me.onRotatePage, me, -90));
                view.menuImgReplace.menu.on('item:click', _.bind(me.onImgReplace, me));
            }
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

        fillViewMenuProps: function(selectedElements) {
            // if (!selectedElements || !_.isArray(selectedElements)) return;

            var documentHolder = this.documentHolder;
            if (!documentHolder.viewPDFModeMenu)
                documentHolder.createDelayedElementsPDFViewer();

            var menu_props = {};
            selectedElements && _.each(selectedElements, function(element, index) {
                if (Asc.c_oAscTypeSelectElement.Annot == element.get_ObjectType()) {
                    menu_props.annotProps = {};
                    menu_props.annotProps.value = element.get_ObjectValue();
                }
            });

            return {menu_to_show: documentHolder.viewPDFModeMenu, menu_props: menu_props};
        },

        fillPDFEditMenuProps: function(selectedElements) {
            var documentHolder = this.documentHolder;
            if (!documentHolder.editPDFModeMenu)
                documentHolder.createDelayedElementsPDFEditor();

            if (!selectedElements || !_.isArray(selectedElements) || selectedElements.length<1)
                return {menu_to_show: documentHolder.editPDFModeMenu, menu_props: {}}

            var me = this,
                menu_props = {},
                menu_to_show = null;
            _.each(selectedElements, function(element, index) {
                var elType  = element.get_ObjectType(),
                    elValue = element.get_ObjectValue();

                if (Asc.c_oAscTypeSelectElement.Image == elType) {
                    menu_to_show = documentHolder.pictureMenu;
                    menu_props.imgProps = {};
                    menu_props.imgProps.value = elValue;
                    menu_props.imgProps.locked = (elValue) ? elValue.get_Locked() : false;
                } else if (Asc.c_oAscTypeSelectElement.Table == elType) {
                    menu_to_show = documentHolder.tableMenu;
                    menu_props.tableProps = {};
                    menu_props.tableProps.value = elValue;
                    menu_props.tableProps.locked = (elValue) ? elValue.get_Locked() : false;
                } else if (Asc.c_oAscTypeSelectElement.Hyperlink == elType) {
                    menu_props.hyperProps = {};
                    menu_props.hyperProps.value = elValue;
                } else if (Asc.c_oAscTypeSelectElement.Shape == elType) { // shape
                    menu_props.shapeProps = {};
                    menu_props.shapeProps.value = elValue;
                    menu_props.shapeProps.locked = (elValue) ? elValue.get_Locked() : false;
                    if (elValue.get_FromChart())
                        menu_props.shapeProps.isChart = true;
                    if (menu_props.paraProps && menu_props.paraProps.value && elValue.asc_getCanEditText())  // text in shape, need to show paragraph menu with vertical align
                        menu_to_show = documentHolder.textMenu;
                    else
                        menu_to_show = documentHolder.pictureMenu;
                }
                // else if (Asc.c_oAscTypeSelectElement.Chart == elType) {
                //     menu_to_show = documentHolder.pictureMenu;
                //     menu_props.chartProps = {};
                //     menu_props.chartProps.value = elValue;
                //     menu_props.chartProps.locked = (elValue) ? elValue.get_Locked() : false;
                // }
                else if (Asc.c_oAscTypeSelectElement.Paragraph == elType) {
                    menu_props.paraProps = {};
                    menu_props.paraProps.value = elValue;
                    menu_props.paraProps.locked = (elValue) ? elValue.get_Locked() : false;
                    if (menu_props.shapeProps && menu_props.shapeProps.value && menu_props.shapeProps.value.asc_getCanEditText())  // text in shape, need to show paragraph menu with vertical align
                        menu_to_show = documentHolder.textMenu;
                } else if (Asc.c_oAscTypeSelectElement.Math == elType) {
                    menu_props.mathProps = {};
                    menu_props.mathProps.value = elValue;
                    documentHolder._currentMathObj = elValue;
                } else if (Asc.c_oAscTypeSelectElement.Annot == elType) {
                    menu_to_show = documentHolder.editPDFModeMenu;
                    menu_props.annotProps = {};
                    menu_props.annotProps.value = elValue;
                }
            });
            if (menu_to_show === null) {
                if (!_.isUndefined(menu_props.paraProps))
                    menu_to_show = documentHolder.textMenu;
            }

            return {menu_to_show: menu_to_show, menu_props: menu_props};
        },

        applyEditorMode: function() {
            if (this.mode && this.mode.isPDFEdit && !this.documentHolder.editPDFModeMenu) {
                this.documentHolder.createDelayedElementsPDFEditor();
                this.api.asc_registerCallback('asc_onShowMathTrack',            _.bind(this.onShowMathTrack, this));
                this.api.asc_registerCallback('asc_onHideMathTrack',            _.bind(this.onHideMathTrack, this));
                this.api.asc_registerCallback('asc_onDialogAddHyperlink',       _.bind(this.onDialogAddHyperlink, this));
                this.api.asc_registerCallback('asc_ChangeCropState',            _.bind(this.onChangeCropState, this));
            }
            if (this.mode)
                this.mode.isPDFEdit ? this.onHideTextBar() : this.onHideMathTrack();
        },

        fillFormsMenuProps: function(selectedElements) {
            if (!selectedElements || !_.isArray(selectedElements)) return;

            var documentHolder = this.documentHolder;
            if (!documentHolder.formsPDFMenu)
                documentHolder.createDelayedElementsPDFForms();

            var menu_props = {},
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

            return (!noobject) ? {menu_to_show: documentHolder.formsPDFMenu, menu_props: menu_props} : null;
        },

        showObjectMenu: function(event, docElement, eOpts){
            var me = this;
            if (me.api){
                var obj = me.mode && me.mode.isRestrictedEdit ? (event.get_Type() == 0 ? me.fillFormsMenuProps(me.api.getSelectedElements()) : null) : (me.mode && me.mode.isEdit && me.mode.isPDFEdit ? me.fillPDFEditMenuProps(me.api.getSelectedElements()) : me.fillViewMenuProps(me.api.getSelectedElements()));
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
                if (event.get_Type() == Asc.c_oAscPdfContextMenuTypes.Thumbnails) {
                    me.mode && me.mode.isEdit && me.mode.isPDFEdit && me.showPopupMenu.call(me, me.documentHolder.pageMenu, {isPageSelect: event.get_IsPageSelect(), pageNum: event.get_PageNum()}, event);
                } else
                    me.showObjectMenu.call(me, event);
            },10);
        },

        onFocusObject: function(selectedElements) {
            var me = this,
                currentMenu = me.documentHolder.currentMenu;
            if (currentMenu && currentMenu.isVisible()){
                var obj = me.mode && me.mode.isRestrictedEdit ? me.fillFormsMenuProps(selectedElements) : (me.mode && me.mode.isPDFEdit ? me.fillPDFEditMenuProps(selectedElements) : me.fillViewMenuProps(selectedElements));
                if (obj) {
                    if (obj.menu_to_show===currentMenu) {
                        currentMenu.options.initMenu(obj.menu_props);
                        currentMenu.alignPosition();
                    }
                }
            }
            if (this.mode && this.mode.isPDFEdit) {
                var i = -1,
                    in_equation = false,
                    locked = false;
                while (++i < selectedElements.length) {
                    var type = selectedElements[i].get_ObjectType();
                    if (type === Asc.c_oAscTypeSelectElement.Math) {
                        in_equation = true;
                    } else if (type === Asc.c_oAscTypeSelectElement.Paragraph) {
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
                    } else if (delta > 0) {
                        me.api.zoomIn();
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
                if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey){
                    if (key === Common.UI.Keys.NUM_PLUS || key === Common.UI.Keys.EQUALITY || (Common.Utils.isGecko && key === Common.UI.Keys.EQUALITY_FF) || (Common.Utils.isOpera && key == 43)){
                        me.api.zoomIn();
                        event.preventDefault();
                        event.stopPropagation();
                        return false;
                    }
                    else if (key === Common.UI.Keys.NUM_MINUS || key === Common.UI.Keys.MINUS || (Common.Utils.isGecko && key === Common.UI.Keys.MINUS_FF) || (Common.Utils.isOpera && key == 45)){
                        me.api.zoomOut();
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
                    if (e.target.localName == 'canvas' && $(e.target).closest('[type=menuitem]').length<1)
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
            var usersStore = PDFE.getCollection('Common.Collections.Users');
            if (usersStore){
                var rec = usersStore.findUser(id);
                if (rec)
                    return AscCommon.UserInfoParser.getParsedName(rec.get('username'));
            }
            return this.documentHolder.guestText;
        },

        isUserVisible: function(id){
            var usersStore = PDFE.getCollection('Common.Collections.Users');
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
            var win, props, text;
            var me = this;
            if (me.api && me.mode.isEdit && !me._isDisabled && !PDFE.getController('LeftMenu').leftMenu.menuFile.isVisible()){
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

                var _arr = [];
                for (var i=0; i<me.api.getCountPages(); i++) {
                    _arr.push({
                        displayValue: i+1,
                        value: i
                    });
                }
                if (text !== false) {
                    win = new PDFE.Views.HyperlinkSettingsDialog({
                        api: me.api,
                        appOptions: me.mode,
                        handler: handlerDlg,
                        slides: _arr
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
                        win = new PDFE.Views.HyperlinkSettingsDialog({
                            api: me.api,
                            appOptions: me.mode,
                            handler: handlerDlg,
                            slides: _arr
                        });
                        win.show();
                        win.setSettings(props);
                    }
                }
            }
            Common.component.Analytics.trackEvent('DocumentHolder', 'Add Hyperlink');
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

                if (type==Asc.c_oAscMouseMoveDataTypes.Hyperlink || type==Asc.c_oAscMouseMoveDataTypes.Eyedropper || type==Asc.c_oAscMouseMoveDataTypes.Form) {
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
                    } else if (type==Asc.c_oAscMouseMoveDataTypes.Form) {
                        ToolTip = moveData.get_FormHelpText();
                        if (ToolTip.length>1000)
                            ToolTip = ToolTip.substr(0, 1000) + '...';
                    } else if (type==Asc.c_oAscMouseMoveDataTypes.Eyedropper) {
                        if (me.eyedropperTip.isTipVisible) {
                            me.eyedropperTip.isTipVisible = false;
                            me.eyedropperTip.toolTip.hide();
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
                                ToolTip = '<div>RGB(' + r + ',' + g + ',' + b + ')</div>' +
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

        onCoAuthoringDisconnect: function() {
            this.mode.isEdit = false;
        },

        SetDisabled: function(state, canProtect, fillFormMode) {
            this._isDisabled = state;
            this.documentHolder.SetDisabled(state, canProtect, fillFormMode);
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

        addComment: function(item, e, eOpt){
            if (this.api && this.mode.canCoAuthoring && this.mode.canComments) {
                this.documentHolder.suppressEditComplete = true;

                var controller = PDFE.getController('Common.Controllers.Comments');
                if (controller) {
                    controller.addDummyComment();
                    item && item.isFromBar && this.api.SetShowTextSelectPanel(false);
                }
            }
        },

        removeComment: function(item, e, eOpt){
            this.api && this.api.asc_remove();
        },

        onCutCopyPaste: function(item, e) {
            var me = this;
            if (me.api) {
                var res =  (item.value == 'cut') ? me.api.Cut() : ((item.value == 'copy') ? me.api.Copy() : me.api.Paste());
                if (!res) {
                    if (!Common.localStorage.getBool("pdfe-hide-copywarning")) {
                        (new Common.Views.CopyWarningDialog({
                            handler: function(dontshow) {
                                if (dontshow) Common.localStorage.setItem("pdfe-hide-copywarning", 1);
                                me.editComplete();
                            }
                        })).show();
                    }
                }
                item.isFromBar && me.api.SetShowTextSelectPanel(false);
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

        saveAsPicture: function() {
            if(this.api) {
                this.api.asc_SaveDrawingAsPicture();
            }
        },

        onPluginContextMenu: function(data) {
            if (data && data.length>0 && this.documentHolder && this.documentHolder.currentMenu && this.documentHolder.currentMenu.isVisible()){
                this.documentHolder.updateCustomItems(this.documentHolder.currentMenu, data);
            }
        },

        onHidePdfFormsActions: function() {
            this.listControlMenuPdf && this.listControlMenuPdf.isVisible() && this.listControlMenuPdf.hide();
            var controlsContainer = this.documentHolder.cmpEl.find('#calendar-control-container-pdf');
            if (controlsContainer.is(':visible'))
                controlsContainer.hide();
        },

        onShowFormsPDFActions: function(obj, x, y) {
            switch (obj.type) {
                case AscPDF.FIELD_TYPES.combobox:
                    this.onShowListActionsPDF(obj, x, y);
                    break;
                case AscPDF.FIELD_TYPES.text:
                    this.onShowDateActionsPDF(obj, x, y);
                    break;
            }
        },

        onShowListActionsPDF: function(obj) {
            var isForm = true,
                cmpEl = this.documentHolder.cmpEl,
                menu = this.listControlMenuPdf,
                menuContainer = menu ? cmpEl.find(Common.Utils.String.format('#menu-container-{0}', menu.id)) : null,
                me = this;

            me._listObjPdf = obj;
            this._fromShowContentControls = true;
            Common.UI.Menu.Manager.hideAll();

            if (!menu) {
                this.listControlMenuPdf = menu = new Common.UI.Menu({
                    maxHeight: 207,
                    menuAlign: 'tr-bl',
                    items: []
                });
                menu.on('item:click', function(menu, item) {
                    setTimeout(function(){
                        (item.value!==-1) && me.api.asc_SelectPDFFormListItem(item.value);
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
                    me.listControlMenuPdf.removeAll();
                    if (!me._fromShowContentControls)
                        me.api.asc_UncheckContentControlButtons();
                });
            }

            var options = obj.getOptions(),
                count = options.length;
            for (var i=0; i<count; i++) {
                menu.addItem(new Common.UI.MenuItem({
                    caption     : Array.isArray(options[i]) ? options[i][0] : options[i],
                    value       : i,
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

            var pagepos = obj.getPagePos(),
                oGlobalCoords = AscPDF.GetGlobalCoordsByPageCoords(pagepos.x + pagepos.w, pagepos.y + pagepos.h, obj.getPage(), true);

            menuContainer.css({left: oGlobalCoords.X, top : oGlobalCoords.Y});
            menuContainer.attr('data-value', 'prevent-canvas-click');
            this._preventClick = true;
            menu.show();

            _.delay(function() {
                menu.cmpEl.focus();
            }, 10);
            this._fromShowContentControls = false;
        },

        onShowDateActionsPDF: function(obj, x, y) {
            var cmpEl = this.documentHolder.cmpEl,
                controlsContainer = cmpEl.find('#calendar-control-container-pdf'),
                me = this;

            this._dateObjPdf = obj;

            if (controlsContainer.length < 1) {
                controlsContainer = $('<div id="calendar-control-container-pdf" style="position: absolute;z-index: 1000;"><div id="id-document-calendar-control-pdf" style="position: fixed; left: -1000px; top: -1000px;"></div></div>');
                cmpEl.append(controlsContainer);
            }

            Common.UI.Menu.Manager.hideAll();

            var pagepos = obj.getPagePos(),
                oGlobalCoords = AscPDF.GetGlobalCoordsByPageCoords(pagepos.x + pagepos.w, pagepos.y + pagepos.h, obj.getPage(), true);

            controlsContainer.css({left: oGlobalCoords.X, top : oGlobalCoords.Y});
            controlsContainer.show();

            if (!this.cmpCalendarPdf) {
                this.cmpCalendarPdf = new Common.UI.Calendar({
                    el: cmpEl.find('#id-document-calendar-control-pdf'),
                    enableKeyEvents: true,
                    firstday: 1
                });
                this.cmpCalendarPdf.on('date:click', function (cmp, date) {
                    var specProps = new AscCommon.CSdtDatePickerPr();
                    specProps.put_FullDate(new  Date(date));
                    me.api.asc_SetTextFormDatePickerDate(specProps);
                    controlsContainer.hide();
                });
                this.cmpCalendarPdf.on('calendar:keydown', function (cmp, e) {
                    if (e.keyCode==Common.UI.Keys.ESC) {
                        controlsContainer.hide();
                    }
                });
                $(document).on('mousedown', function(e) {
                    if (e.target.localName !== 'canvas' && controlsContainer.is(':visible') && controlsContainer.find(e.target).length==0) {
                        controlsContainer.hide();
                    }
                });

            }
            var val = this._dateObjPdf ? this._dateObjPdf.asc_GetValue() : undefined;
            if (val) {
                val = new Date(val);
                if (Object.prototype.toString.call(val) !== '[object Date]' || isNaN(val))
                    val = undefined;
            }
            !val && (val = new Date());
            this.cmpCalendarPdf.setDate(val);

            // align
            var offset  = controlsContainer.offset(),
                docW    = Common.Utils.innerWidth(),
                docH    = Common.Utils.innerHeight() - 10, // Yep, it's magic number
                menuW   = this.cmpCalendarPdf.cmpEl.outerWidth(),
                menuH   = this.cmpCalendarPdf.cmpEl.outerHeight(),
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
            this.cmpCalendarPdf.cmpEl.css({left: left, top : top});

            this._preventClick = true;
        },

        onShowContentControlsActions: function(obj, x, y) {
            if (this._isDisabled) return;

            var me = this;
            switch (obj.type) {
                case Asc.c_oAscContentControlSpecificType.DateTime:
                    this.onShowDateActions(obj, x, y);
                    break;
                case Asc.c_oAscContentControlSpecificType.Picture:
                    if (obj.pr && obj.pr.get_Lock) {
                        var lock = obj.pr.get_Lock();
                        if (lock == Asc.c_oAscSdtLockType.SdtContentLocked || lock==Asc.c_oAscSdtLockType.ContentLocked)
                            return;
                    }
                    this.onShowImageActions(obj, x, y);
                    break;
                case Asc.c_oAscContentControlSpecificType.DropDownList:
                case Asc.c_oAscContentControlSpecificType.ComboBox:
                    this.onShowListActions(obj, x, y);
                    break;
            }
        },

        onHideContentControlsActions: function() {
            this.listControlMenu && this.listControlMenu.isVisible() && this.listControlMenu.hide();
            var controlsContainer = this.documentHolder.cmpEl.find('#calendar-control-container');
            if (controlsContainer.is(':visible'))
                controlsContainer.hide();
        },

        onShowImageActions: function(obj, x, y) {
            var cmpEl = this.documentHolder.cmpEl,
                menu = this.imageControlMenu,
                menuContainer = menu ? cmpEl.find(Common.Utils.String.format('#menu-container-{0}', menu.id)) : null,
                me = this;

            this.internalFormObj = obj && obj.pr ? obj.pr.get_InternalId() : null;
            this._fromShowContentControls = true;
            Common.UI.Menu.Manager.hideAll();

            if (!menu) {
                this.imageControlMenu = menu = new Common.UI.Menu({
                    maxHeight: 207,
                    menuAlign: 'tl-bl',
                    items: [
                        {caption: this.documentHolder.mniImageFromFile, value: 'file'},
                        {caption: this.documentHolder.mniImageFromUrl, value: 'url'},
                        {caption: this.documentHolder.mniImageFromStorage, value: 'storage', visible: this.mode.canRequestInsertImage || this.mode.fileChoiceUrl && this.mode.fileChoiceUrl.indexOf("{documentType}")>-1}
                    ]
                });
                menu.on('item:click', function(menu, item) {
                    setTimeout(function(){
                        me.onImageSelect(menu, item);
                    }, 1);
                    setTimeout(function(){
                        me.api.asc_UncheckContentControlButtons();
                    }, 500);
                });

                // Prepare menu container
                if (!menuContainer || menuContainer.length < 1) {
                    menuContainer = $(Common.Utils.String.format('<div id="menu-container-{0}" style="position: absolute; z-index: 10000;"><div class="dropdown-toggle" data-toggle="dropdown"></div></div>', menu.id));
                    cmpEl.append(menuContainer);
                }

                menu.render(menuContainer);
                menu.cmpEl.attr({tabindex: "-1"});
                menu.on('hide:after', function(){
                    if (!me._fromShowContentControls)
                        me.api.asc_UncheckContentControlButtons();
                });
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

        onImageSelect: function(menu, item) {
            if (item.value=='url') {
                var me = this;
                (new Common.Views.ImageFromUrlDialog({
                    handler: function(result, value) {
                        if (result == 'ok') {
                            if (me.api) {
                                var checkUrl = value.replace(/ /g, '');
                                if (!_.isEmpty(checkUrl)) {
                                    me.setImageUrl(checkUrl);
                                }
                            }
                        }
                    }
                })).show();
            } else if (item.value=='storage') {
                Common.NotificationCenter.trigger('storage:image-load', 'control');
            } else {
                if (this._isFromFile) return;
                this._isFromFile = true;
                this.api.asc_addImage(this.internalFormObj);
                this._isFromFile = false;
            }
        },

        openImageFromStorage: function(type) {
            var me = this;
            if (this.mode.canRequestInsertImage) {
                Common.Gateway.requestInsertImage(type);
            } else {
                (new Common.Views.SelectFileDlg({
                    fileChoiceUrl: this.mode.fileChoiceUrl.replace("{fileExt}", "").replace("{documentType}", "ImagesOnly")
                })).on('selectfile', function(obj, file){
                    file && (file.c = type);
                    !file.images && (file.images = [{fileType: file.fileType, url: file.url}]); // SelectFileDlg uses old format for inserting image
                    file.url = null;
                    me.insertImage(file);
                }).show();
            }
        },

        setImageUrl: function(url, token) {
            this.api.asc_SetContentControlPictureUrl(url, this.internalFormObj && this.internalFormObj.pr ? this.internalFormObj.pr.get_InternalId() : null, token);
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

        insertImageFromStorage: function(data) {
            if (data && data._urls && data.c=='control') {
                this.setImageUrl(data._urls[0], data.token);
            }
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

        onShowMathTrack: function(bounds) {
            if (this.mode && !(this.mode.isPDFEdit && this.mode.isEdit)) return;

            this.lastMathTrackBounds = bounds;
            if (!Common.Controllers.LaunchController.isScriptLoaded()) {
                this.showMathTrackOnLoad = true;
                return;
            }
            if (bounds[3] < 0 || Common.Utils.InternalSettings.get('pdfe-equation-toolbar-hide')) {
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

                me.getApplication().getController('InsTab').onMathTypes(me.getApplication().getController('Toolbar')._equationTemp);

                me.equationBtns = [];
                for (var i = 0; i < equationsStore.length; ++i) {
                    eqStr += '<span id="id-document-holder-btn-equation-' + i + '"></span>';
                }
                eqStr += '<div class="separator"></div>';
                eqStr += '<span id="id-document-holder-btn-equation-settings"></span>';
                eqStr += '</div>';
                eqContainer = $(eqStr);
                documentHolder.cmpEl.append(eqContainer);
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
                        isEqToolbarHide = Common.Utils.InternalSettings.get('pdfe-equation-toolbar-hide');

                    menu.items[5].setChecked(eq===Asc.c_oAscMathInputType.Unicode);
                    menu.items[6].setChecked(eq===Asc.c_oAscMathInputType.LaTeX);
                    menu.items[8].options.isToolbarHide = isEqToolbarHide;
                    menu.items[8].setCaption(isEqToolbarHide ? me.documentHolder.showEqToolbar : me.documentHolder.hideEqToolbar, true);
                };
                me.equationSettingsBtn.menu.on('item:click', _.bind(me.convertEquation, me));
                me.equationSettingsBtn.menu.on('show:before', function(menu) {
                    bringForward();
                    menu.options.initMenu();
                });
                me.equationSettingsBtn.menu.on('hide:after', sendBackward);
            }

            var showPoint = [(bounds[0] + bounds[2])/2 - eqContainer.outerWidth()/2, bounds[1] - eqContainer.outerHeight() - 10];
            (showPoint[0]<0) && (showPoint[0] = 0);
            if (showPoint[1]<0) {
                showPoint[1] = bounds[3] + 10;
            }
            showPoint[1] = Math.min(me._Height - eqContainer.outerHeight(), Math.max(0, showPoint[1]));
            eqContainer.css({left: showPoint[0], top : showPoint[1]});

            if (_.isUndefined(me._XY)) {
                me._XY = [
                    documentHolder.cmpEl.offset().left - $(window).scrollLeft(),
                    documentHolder.cmpEl.offset().top - $(window).scrollTop()
                ];
                me._Width       = documentHolder.cmpEl.width();
                me._Height      = documentHolder.cmpEl.height();
                me._BodyWidth   = $('body').width();
            }

            var diffDown = me._Height - showPoint[1] - eqContainer.outerHeight(),
                diffUp = me._XY[1] + showPoint[1],
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
                disabled = this._isDisabled || this._state.equationLocked;

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
                    Common.localStorage.setBool("pdfe-equation-input-latex", item.value === Asc.c_oAscMathInputType.LaTeX)
                } else if (item.options.type=='view')
                    this.api.asc_ConvertMathView(item.value.linear, item.value.all);
                else if(item.options.type=='hide') {
                    item.options.isToolbarHide = !item.options.isToolbarHide;
                    Common.Utils.InternalSettings.set('pdfe-equation-toolbar-hide', item.options.isToolbarHide);
                    Common.localStorage.setBool('pdfe-equation-toolbar-hide', item.options.isToolbarHide);
                    if(item.options.isToolbarHide) this.onHideMathTrack();
                    else this.onShowMathTrack(this.lastMathTrackBounds);
                }
            }
        },

        equationCallback: function(eqObj) {
            eqObj && this.api.asc_SetMathProps(eqObj);
            this.editComplete();
        },

        onChangeCropState: function(state) {
            this.documentHolder.menuImgCrop && this.documentHolder.menuImgCrop.menu.items[0].setChecked(state, true);
        },

        addHyperlink: function(item){
            var win, me = this;
            if (me.api) {
                var _arr = [];
                for (var i=0; i<me.api.getCountPages(); i++) {
                    _arr.push({
                        displayValue: i+1,
                        value: i
                    });
                }
                win = new PDFE.Views.HyperlinkSettingsDialog({
                    api: me.api,
                    appOptions: me.mode,
                    handler: function(dlg, result) {
                        if (result == 'ok') {
                            me.api.add_Hyperlink(dlg.getSettings());
                        }
                        me.editComplete();
                    },
                    slides: _arr
                });

                win.show();
                win.setSettings(item.hyperProps.value);

                Common.component.Analytics.trackEvent('DocumentHolder', 'Add Hyperlink');
            }
        },

        editHyperlink: function(item, e){
            var win, me = this;
            if (me.api){
                var _arr = [];
                for (var i=0; i<me.api.getCountPages(); i++) {
                    _arr.push({
                        displayValue: i+1,
                        value: i
                    });
                }
                win = new PDFE.Views.HyperlinkSettingsDialog({
                    api: me.api,
                    appOptions: me.mode,
                    handler: function(dlg, result) {
                        if (result == 'ok') {
                            me.api.change_Hyperlink(win.getSettings());
                        }
                        me.editComplete();
                    },
                    slides: _arr
                });
                win.show();
                win.setSettings(item.hyperProps.value);

                Common.component.Analytics.trackEvent('DocumentHolder', 'Edit Hyperlink');
            }
        },

        removeHyperlink: function(item) {
            if (this.api){
                this.api.remove_Hyperlink();
            }

            this.editComplete();
            Common.component.Analytics.trackEvent('DocumentHolder', 'Remove Hyperlink');
        },

        onInsertImageUrl: function(placeholder, obj, x, y) {
            var me = this;
            (new Common.Views.ImageFromUrlDialog({
                handler: function(result, value) {
                    if (result == 'ok') {
                        if (me.api) {
                            var checkUrl = value.replace(/ /g, '');
                            if (!_.isEmpty(checkUrl)) {
                                var props = new Asc.asc_CImgProperty();
                                props.put_ImageUrl(checkUrl);
                                me.api.ImgApply(props, obj);
                            }
                        }
                    }
                    me.editComplete();
                }
            })).show();
        },

        onImgReplace: function(menu, item, e) {
            var me = this;
            if (item.value==1) {
                me.onInsertImageUrl(false);
            } else if (item.value==2) {
                Common.NotificationCenter.trigger('storage:image-load', 'change');
            } else {
                setTimeout(function(){
                    me.api.ChangeImageFromFile();
                }, 10);
            }
        },

        onTableMerge: function () {
            this.api && this.api.MergeCells();
        },

        onTableSplit: function () {
            var me = this;
            if (me.api) {
                (new Common.Views.InsertTableDialog({
                    split: true,
                    handler: function(result, value) {
                        if (result == 'ok') {
                            if (me.api) {
                                me.api.SplitCell(value.columns, value.rows);
                            }
                            Common.component.Analytics.trackEvent('DocumentHolder', 'Table Split');
                        }
                        me.editComplete();
                    }
                })).show();
            }
        },

        tableCellsVAlign: function(menu, item, e) {
            if (this.api) {
                var properties = new Asc.CTableProp();
                properties.put_CellsVAlign(item.value);
                this.api.tblApply(properties);
            }

            this.editComplete();
            Common.component.Analytics.trackEvent('DocumentHolder', 'Table Cell Align');
        },

        onTableDistRows: function () {
            this.api && this.api.asc_DistributeTableCells(false);
            this.editComplete();
        },

        onTableDistCols: function () {
            this.api && this.api.asc_DistributeTableCells(true);
            this.editComplete();
        },

        onTableAdvanced: function(item, e){
            var me = this;
            if (me.api) {
                var selectedElements = me.api.getSelectedElements();

                if (selectedElements && selectedElements.length > 0){
                    var elType, elValue;
                    for (var i = selectedElements.length - 1; i >= 0; i--) {
                        elType  = selectedElements[i].get_ObjectType();
                        elValue = selectedElements[i].get_ObjectValue();

                        if (Asc.c_oAscTypeSelectElement.Table == elType) {
                            (new PDFE.Views.TableSettingsAdvanced(
                                {
                                    tableProps: elValue,
                                    slideSize: {width: me.api.get_PageWidth(), height: me.api.get_PageHeight()},
                                    handler: function(result, value) {
                                        if (result == 'ok') {
                                            if (me.api) {
                                                me.api.tblApply(value.tableProps);
                                            }
                                        }
                                        me.editComplete();
                                        Common.component.Analytics.trackEvent('DocumentHolder', 'Table Settings Advanced');
                                    }
                                })).show();
                            break;
                        }
                    }
                }
            }
        },

        onImageAdvanced: function(item) {
            var me = this;
            if (me.api){
                var selectedElements = me.api.getSelectedElements();
                if (selectedElements && selectedElements.length>0){
                    var elType, elValue;

                    for (var i = selectedElements.length - 1; i >= 0; i--) {
                        elType  = selectedElements[i].get_ObjectType();
                        elValue = selectedElements[i].get_ObjectValue();

                        if (Asc.c_oAscTypeSelectElement.Image == elType) {
                            var imgsizeOriginal;

                            if (!me.documentHolder.menuImgOriginalSize.isDisabled()) {
                                imgsizeOriginal = me.api.get_OriginalSizeImage();
                                if (imgsizeOriginal)
                                    imgsizeOriginal = {width:imgsizeOriginal.get_ImageWidth(), height:imgsizeOriginal.get_ImageHeight()};
                            }

                            (new PDFE.Views.ImageSettingsAdvanced(
                                {
                                    imageProps: elValue,
                                    sizeOriginal: imgsizeOriginal,
                                    slideSize: {width: me.api.get_PageWidth(), height: me.api.get_PageHeight()},
                                    handler: function(result, value) {
                                        if (result == 'ok') {
                                            if (me.api) {
                                                me.api.ImgApply(value.imageProps);
                                            }
                                        }
                                        me.editComplete();
                                        Common.component.Analytics.trackEvent('DocumentHolder', 'Image Settings Advanced');
                                    }
                                })).show();
                            break;
                        }
                    }
                }
            }
        },

        onImgOriginalSize: function(item){
            var me = this;
            if (me.api){
                var originalImageSize = me.api.get_OriginalSizeImage();

                if (originalImageSize) {
                    var properties = new Asc.asc_CImgProperty();

                    properties.put_Width(originalImageSize.get_ImageWidth());
                    properties.put_Height(originalImageSize.get_ImageHeight());
                    properties.put_ResetCrop(true);
                    properties.put_Rot(0);
                    me.api.ImgApply(properties);
                }

                me.editComplete();
                Common.component.Analytics.trackEvent('DocumentHolder', 'Set Image Original Size');
            }
        },

        onImgRotate: function(item) {
            var properties = new Asc.asc_CShapeProperty();
            properties.asc_putRotAdd((item.value==1 ? 90 : 270) * 3.14159265358979 / 180);
            this.api.ShapeApply(properties);
            this.editComplete();
        },

        onImgFlip: function(item) {
            var properties = new Asc.asc_CShapeProperty();
            if (item.value==1)
                properties.asc_putFlipHInvert(true);
            else
                properties.asc_putFlipVInvert(true);
            this.api.ShapeApply(properties);
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

        onImgEditPoints: function(item) {
            this.api && this.api.asc_editPointsGeometry();
        },

        onShapeAdvanced: function(item) {
            var me = this;
            if (me.api){
                var selectedElements = me.api.getSelectedElements();
                if (selectedElements && selectedElements.length>0){
                    var elType, elValue;
                    for (var i = selectedElements.length - 1; i >= 0; i--) {
                        elType = selectedElements[i].get_ObjectType();
                        elValue = selectedElements[i].get_ObjectValue();
                        if (Asc.c_oAscTypeSelectElement.Shape == elType) {
                            (new PDFE.Views.ShapeSettingsAdvanced(
                                {
                                    shapeProps: elValue,
                                    slideSize: {width: me.api.get_PageWidth(), height: me.api.get_PageHeight()},
                                    handler: function(result, value) {
                                        if (result == 'ok') {
                                            if (me.api) {
                                                me.api.ShapeApply(value.shapeProps);
                                            }
                                        }
                                        me.editComplete();
                                        Common.component.Analytics.trackEvent('DocumentHolder', 'Image Shape Advanced');
                                    }
                                })).show();
                            break;
                        }
                    }
                }
            }
        },

        onParagraphAdvanced: function(item) {
            var me = this;
            if (me.api){
                var selectedElements = me.api.getSelectedElements();

                if (selectedElements && selectedElements.length > 0){
                    var elType, elValue;
                    for (var i = selectedElements.length - 1; i >= 0; i--) {
                        elType  = selectedElements[i].get_ObjectType();
                        elValue = selectedElements[i].get_ObjectValue();

                        if (Asc.c_oAscTypeSelectElement.Paragraph == elType) {
                            (new PDFE.Views.ParagraphSettingsAdvanced(
                                {
                                    paragraphProps: elValue,
                                    api: me.api,
                                    handler: function(result, value) {
                                        if (result == 'ok') {
                                            if (me.api) {
                                                me.api.paraApply(value.paragraphProps);
                                            }
                                        }
                                        me.editComplete();
                                        Common.component.Analytics.trackEvent('DocumentHolder', 'Image Paragraph Advanced');
                                    }
                                })).show();
                            break;
                        }
                    }
                }
            }
        },

        onGroupImg: function(item) {
            this.api && this.api.groupShapes();
            this.editComplete();
            Common.component.Analytics.trackEvent('DocumentHolder', 'Group Image');
        },

        onUnGroupImg: function(item) {
            this.api && this.api.unGroupShapes();
            this.editComplete();
            Common.component.Analytics.trackEvent('DocumentHolder', 'UnGroup Image');
        },

        onArrangeFront: function(item) {
            this.api && this.api.shapes_bringToFront();
            this.editComplete();
            Common.component.Analytics.trackEvent('DocumentHolder', 'Bring To Front');
        },

        onArrangeBack: function(item) {
            this.api && this.api.shapes_bringToBack();
            this.editComplete();
            Common.component.Analytics.trackEvent('DocumentHolder', 'Bring To Back');
        },

        onArrangeForward: function(item) {
            this.api && this.api.shapes_bringForward();
            this.editComplete();
            Common.component.Analytics.trackEvent('DocumentHolder', 'Send Forward');
        },

        onArrangeBackward: function(item) {
            this.api && this.api.shapes_bringBackward();
            this.editComplete();
            Common.component.Analytics.trackEvent('DocumentHolder', 'Send Backward');
        },

        onImgShapeAlign: function (menu, item) {
            var me = this;
            if (me.api) {
                var value = me.api.asc_getSelectedDrawingObjectsCount()<2 || Common.Utils.InternalSettings.get("pdfe-align-to-slide");
                value = value ? Asc.c_oAscObjectsAlignType.Page : Asc.c_oAscObjectsAlignType.Selected;
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
                me.editComplete();
            }
        },

        onParagraphVAlign: function (menu, item) {
            var me = this;
            if (me.api) {
                var properties = new Asc.asc_CShapeProperty();
                properties.put_VerticalTextAlign(item.value);

                me.api.ShapeApply(properties);
            }

            me.editComplete();
            Common.component.Analytics.trackEvent('DocumentHolder', 'Text Vertical Align');
        },

        onParagraphDirection: function(menu, item) {
            var me = this;
            if (me.api) {
                var properties = new Asc.asc_CShapeProperty();
                properties.put_Vert(item.options.direction);
                me.api.ShapeApply(properties);
            }
            me.editComplete();
            Common.component.Analytics.trackEvent('DocumentHolder', 'Text Direction');
        },

        tableSelectText: function(menu, item) {
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

        tableInsertText: function(menu, item) {
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
                }
            }
        },

        tableDeleteText: function(menu, item) {
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
                }
            }
        },

        onShowTextBar: function(bounds) {
            if (this.mode && !(!this.mode.isPDFEdit && this.mode.isEdit)) return;

            if (_.isUndefined(this._XY)) {
                this._XY = [
                    this.documentHolder.cmpEl.offset().left - $(window).scrollLeft(),
                    this.documentHolder.cmpEl.offset().top - $(window).scrollTop()
                ];
                this._Width       = this.documentHolder.cmpEl.width();
                this._Height      = this.documentHolder.cmpEl.height();
                this._BodyWidth   = $('body').width();
            }

            this.lastTextBarBounds = bounds;
            if (bounds[3] < 0 || bounds[1] > this._Height) {
                this.onHideTextBar();
                return;
            }
            var me = this,
                documentHolder = me.documentHolder,
                textContainer = documentHolder.cmpEl.find('#text-bar-container');

            // Prepare menu container
            if (textContainer.length < 1) {
                me.textBarBtns = [];
                textContainer = documentHolder.createTextBar(me.textBarBtns);
                documentHolder.cmpEl.append(textContainer);
                documentHolder.cmbFontSize.options.menuAlignEl = documentHolder.cmbFontName.options.menuAlignEl = documentHolder.cmpEl;

                var bringForward = function (menu) {
                    textContainer.addClass('has-open-menu');
                };
                var sendBackward = function (menu) {
                    textContainer.removeClass('has-open-menu');
                };
                me.textBarBtns.forEach(function(item){
                    if (item && item.menu) {
                        item.menu.on('show:before', bringForward);
                        item.menu.on('hide:after', sendBackward);
                    }
                });
                // annotation text bar
                this.api.asc_registerCallback('asc_onFontSize',             _.bind(this.onApiFontSize, this));
                this.api.asc_registerCallback('asc_onBold',                 _.bind(this.onApiBold, this));
                this.api.asc_registerCallback('asc_onItalic',               _.bind(this.onApiItalic, this));
                this.api.asc_registerCallback('asc_onUnderline',            _.bind(this.onApiUnderline, this));
                this.api.asc_registerCallback('asc_onStrikeout',            _.bind(this.onApiStrikeout, this));
                this.api.asc_registerCallback('asc_onVerticalAlign',        _.bind(this.onApiVerticalAlign, this));
                Common.NotificationCenter.on('fonts:change',                _.bind(this.onApiChangeFont, this));
                this.api.asc_registerCallback('asc_onTextColor',            _.bind(this.onApiTextColor, this));

                documentHolder.btnBold.on('click',                         _.bind(this.onBold, this));
                documentHolder.btnItalic.on('click',                       _.bind(this.onItalic, this));
                documentHolder.btnTextUnderline.on('click',                _.bind(this.onTextUnderline, this));
                documentHolder.btnTextStrikeout.on('click',                _.bind(this.onTextStrikeout, this));
                documentHolder.btnSuperscript.on('click',                  _.bind(this.onSuperscript, this));
                documentHolder.btnSubscript.on('click',                    _.bind(this.onSubscript, this));
                documentHolder.btnFontColor.on('click',                    _.bind(this.onBtnFontColor, this));
                documentHolder.btnFontColor.on('color:select',             _.bind(this.onSelectFontColor, this));
                documentHolder.cmbFontSize.on('selected',                  _.bind(this.onFontSizeSelect, this));
                documentHolder.cmbFontSize.on('changed:before',            _.bind(this.onFontSizeChanged, this, true));
                documentHolder.cmbFontSize.on('changed:after',             _.bind(this.onFontSizeChanged, this, false));
                documentHolder.cmbFontSize.on('show:after',                _.bind(this.onComboOpen, this, true));
                documentHolder.cmbFontSize.on('hide:after',                _.bind(this.onHideMenus, this));
                documentHolder.cmbFontSize.on('combo:blur',                _.bind(this.onComboBlur, this));
                documentHolder.cmbFontSize.on('combo:focusin',             _.bind(this.onComboOpen, this, false));
                documentHolder.cmbFontName.on('selected',                  _.bind(this.onFontNameSelect, this));
                documentHolder.cmbFontName.on('show:after',                _.bind(this.onComboOpen, this, true));
                documentHolder.cmbFontName.on('hide:after',                _.bind(this.onHideMenus, this));
                documentHolder.cmbFontName.on('combo:blur',                _.bind(this.onComboBlur, this));
                documentHolder.cmbFontName.on('combo:focusin',             _.bind(this.onComboOpen, this, false));

                this.api.UpdateInterfaceState();
            }

            var showPoint = [(bounds[0] + bounds[2])/2 - textContainer.outerWidth()/2, bounds[1] - textContainer.outerHeight() - 10];
            (showPoint[0]<0) && (showPoint[0] = 0);
            if (showPoint[1]<0) {
                showPoint[1] = (bounds[3] > me._Height) ? 0 : bounds[3] + 10;
            }
            showPoint[1] = Math.min(me._Height - textContainer.outerHeight(), Math.max(0, showPoint[1]));
            textContainer.css({left: showPoint[0], top : showPoint[1]});

            var diffDown = me._Height - showPoint[1] - textContainer.outerHeight(),
                diffUp = me._XY[1] + showPoint[1],
                menuAlign = (diffDown < 220 && diffDown < diffUp*0.9) ? 'bl-tl' : 'tl-bl';
            if (Common.UI.isRTL()) {
                menuAlign = menuAlign === 'bl-tl' ? 'br-tr' : 'tr-br';
            }
            me.textBarBtns.forEach(function(item){
                item && item.menu && (item.menu.menuAlign = menuAlign);
            });
            if (!textContainer.is(':visible')) {
                textContainer.show();
            }
            me.disableTextBar();
        },

        onHideTextBar: function() {
            if (!this.documentHolder || !this.documentHolder.cmpEl) return;
            var textContainer = this.documentHolder.cmpEl.find('#text-bar-container');
            if (textContainer.is(':visible')) {
                textContainer.hide();
            }
        },

        disableTextBar: function() {
            var textContainer = this.documentHolder.cmpEl.find('#text-bar-container'),
                disabled = this._isDisabled;

            if (textContainer.length>0 && textContainer.is(':visible')) {
                this.textBarBtns.forEach(function(item){
                    item && item.setDisabled(!!disabled);
                });
            }
        },

        onApiChangeFont: function(font) {
            if (!this.mode.isPDFAnnotate) return;
            this._state.fontname = font;
            !Common.Utils.ModalWindow.isVisible() && this.documentHolder.cmbFontName.onApiChangeFont(font);
        },

        onApiFontSize: function(size) {
            if (!this.mode.isPDFAnnotate) return;
            if (this._state.fontsize !== size) {
                this.documentHolder.cmbFontSize.setValue(size);
                this._state.fontsize = size;
            }
        },

        onApiBold: function(on) {
            if (!this.mode.isPDFAnnotate) return;
            if (this._state.bold !== on) {
                this.documentHolder.btnBold.toggle(on === true, true);
                this._state.bold = on;
            }
        },

        onApiItalic: function(on) {
            if (!this.mode.isPDFAnnotate) return;
            if (this._state.italic !== on) {
                this.documentHolder.btnItalic.toggle(on === true, true);
                this._state.italic = on;
            }
        },

        onApiUnderline: function(on) {
            if (!this.mode.isPDFAnnotate) return;
            if (this._state.underline !== on) {
                this.documentHolder.btnTextUnderline.toggle(on === true, true);
                this._state.underline = on;
            }
        },

        onApiStrikeout: function(on) {
            if (!this.mode.isPDFAnnotate) return;
            if (this._state.strike !== on) {
                this.documentHolder.btnTextStrikeout.toggle(on === true, true);
                this._state.strike = on;
            }
        },

        onApiVerticalAlign: function(typeBaseline) {
            if (!this.mode.isPDFAnnotate) return;
            if (this._state.valign !== typeBaseline) {
                this.documentHolder.btnSuperscript.toggle(typeBaseline==Asc.vertalign_SuperScript, true);
                this.documentHolder.btnSubscript.toggle(typeBaseline==Asc.vertalign_SubScript, true);
                this._state.valign = typeBaseline;
            }
        },

        onApiTextColor: function(color) {
            if (!this.mode.isPDFAnnotate) return;
            var clr;
            var picker = this.documentHolder.mnuFontColorPicker;

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

        onBold: function(btn, e) {
            this._state.bold = undefined;
            if (this.api)
                this.api.put_TextPrBold(btn.pressed);

            Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
        },

        onItalic: function(btn, e) {
            this._state.italic = undefined;
            if (this.api)
                this.api.put_TextPrItalic(btn.pressed);

            Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
        },

        onTextUnderline: function(btn, e) {
            this._state.underline = undefined;
            if (this.api)
                this.api.put_TextPrUnderline(btn.pressed);

            Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
        },

        onTextStrikeout: function(btn, e) {
            this._state.strike = undefined;
            if (this.api)
                this.api.put_TextPrStrikeout(btn.pressed);

            Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
        },

        onSuperscript: function(btn, e) {
            if (!this.documentHolder.btnSubscript.pressed) {
                this._state.valign = undefined;
                if (this.api)
                    this.api.put_TextPrBaseline(btn.pressed ? Asc.vertalign_SuperScript : Asc.vertalign_Baseline);

                Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
            }
        },

        onSubscript: function(btn, e) {
            if (!this.documentHolder.btnSuperscript.pressed) {
                this._state.valign = undefined;
                if (this.api)
                    this.api.put_TextPrBaseline(btn.pressed ? Asc.vertalign_SubScript : Asc.vertalign_Baseline);

                Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
            }
        },

        onSelectFontColor: function(btn, color) {
            this._state.clrtext = this._state.clrtext_asccolor  = undefined;

            this.documentHolder.btnFontColor.currentColor = color;
            this.documentHolder.btnFontColor.setColor((typeof(color) == 'object') ? color.color : color);

            this.documentHolder.mnuFontColorPicker.currentColor = color;
            if (this.api)
                this.api.put_TextColor(Common.Utils.ThemeColor.getRgbColor(color));
        },

        onBtnFontColor: function() {
            this.documentHolder.mnuFontColorPicker.trigger('select', this.documentHolder.mnuFontColorPicker, this.documentHolder.mnuFontColorPicker.currentColor  || this.documentHolder.btnFontColor.currentColor);
        },

        onComboBlur: function() {
            Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
        },

        onHideMenus: function(e){
            Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
        },

        onFontNameSelect: function(combo, record) {
            if (this.api) {
                if (record.isNewFont) {
                    !Common.Utils.ModalWindow.isVisible() &&
                    Common.UI.warning({
                        width: 500,
                        msg: this.documentHolder.confirmAddFontName,
                        buttons: ['yes', 'no'],
                        primary: 'yes',
                        callback: _.bind(function(btn) {
                            if (btn == 'yes') {
                                this.api.put_TextPrFontName(record.name);
                            } else {
                                this.documentHolder.cmbFontName.setValue(this.api.get_TextProps().get_TextPr().get_FontFamily().get_Name());
                            }
                            Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
                        }, this)
                    });
                } else {
                    this.api.put_TextPrFontName(record.name);
                }
            }
            Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
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

            Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
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

                Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
            }
        },

        onCountPages: function(count) {
            this.documentHolder && (this.documentHolder._pagesCount = count);
        },

        onNewPage: function(item) {
            this.api && this.api.asc_AddPage(item.value);

            Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
        },

        onDeletePage: function() {
            this.api && this.api.asc_RemovePage();

            Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
        },

        onRotatePage: function(angle, item) {
            this.api && this.api.asc_RotatePage(this.api.asc_GetPageRotate(item.options.value) + angle);

            Common.NotificationCenter.trigger('edit:complete', this.documentHolder);
        },

        onShowAnnotBar: function(bounds) {
            if (this.mode && !this.mode.isEdit) return;

            if (_.isUndefined(this._XY)) {
                this._XY = [
                    this.documentHolder.cmpEl.offset().left - $(window).scrollLeft(),
                    this.documentHolder.cmpEl.offset().top - $(window).scrollTop()
                ];
                this._Width       = this.documentHolder.cmpEl.width();
                this._Height      = this.documentHolder.cmpEl.height();
                this._BodyWidth   = $('body').width();
            }

            this.lastAnnotBarBounds = bounds;
            if (bounds[3] < 0 || bounds[1] > this._Height || !Common.Utils.InternalSettings.get('pdfe-settings-annot-bar')) {
                this.onHideAnnotBar();
                return;
            }
            var me = this,
                documentHolder = me.documentHolder,
                textContainer = documentHolder.cmpEl.find('#annot-bar-container');

            // Prepare menu container
            if (textContainer.length < 1) {
                me.annotBarBtns = [];
                textContainer = documentHolder.createAnnotBar(me.annotBarBtns);
                documentHolder.cmpEl.append(textContainer);

                var bringForward = function (menu) {
                    textContainer.addClass('has-open-menu');
                };
                var sendBackward = function (menu) {
                    textContainer.removeClass('has-open-menu');
                };
                me.annotBarBtns.forEach(function(item){
                    if (item && item.menu) {
                        item.menu.on('show:before', bringForward);
                        item.menu.on('hide:after', sendBackward);
                    }
                });
                // annotation text bar
                documentHolder.btnCopy.on('click',                _.bind(this.onCutCopyPaste, this, {value: 'copy', isFromBar: true}));
                documentHolder.btnAddComment.on('click',          _.bind(this.addComment, this, {isFromBar: true}));
                documentHolder.btnEditText.on('click',            _.bind(this.editText, this));

                this.api.UpdateInterfaceState();
            }

            var showPoint = [(bounds[0] + bounds[2])/2 - textContainer.outerWidth()/2, bounds[1] - textContainer.outerHeight() - 10];
            (showPoint[0]<0) && (showPoint[0] = 0);
            if (showPoint[1]<0) {
                showPoint[1] = (bounds[3] > me._Height) ? 0 : bounds[3] + 10;
            }
            showPoint[1] = Math.min(me._Height - textContainer.outerHeight(), Math.max(0, showPoint[1]));
            textContainer.css({left: showPoint[0], top : showPoint[1]});

            var diffDown = me._Height - showPoint[1] - textContainer.outerHeight(),
                diffUp = me._XY[1] + showPoint[1],
                menuAlign = (diffDown < 220 && diffDown < diffUp*0.9) ? 'bl-tl' : 'tl-bl';
            if (Common.UI.isRTL()) {
                menuAlign = menuAlign === 'bl-tl' ? 'br-tr' : 'tr-br';
            }
            me.annotBarBtns.forEach(function(item){
                item && item.menu && (item.menu.menuAlign = menuAlign);
            });
            if (!textContainer.is(':visible')) {
                textContainer.show();
            }
            me.disableAnnotBar();
        },

        onHideAnnotBar: function() {
            if (!this.documentHolder || !this.documentHolder.cmpEl) return;
            var textContainer = this.documentHolder.cmpEl.find('#annot-bar-container');
            if (textContainer.is(':visible')) {
                textContainer.hide();
            }
        },

        disableAnnotBar: function() {
            var textContainer = this.documentHolder.cmpEl.find('#annot-bar-container'),
                disabled = this._isDisabled;

            if (textContainer.length>0 && textContainer.is(':visible')) {
                this.annotBarBtns.forEach(function(item){
                    item && item.setDisabled(!!disabled);
                });
                this.documentHolder.btnCopy && this.documentHolder.btnCopy.setDisabled(!this.api.can_CopyCut() || !!disabled);
            }
        },

        editText: function() {
            this.mode && !this.mode.isPDFEdit && Common.NotificationCenter.trigger('pdf:mode-apply', 'edit');
            this.api && this.api.asc_EditPage();
        },

        clearSelection: function() {
            this.onHideMathTrack();
            this.onHideTextBar();
            this.onHideAnnotBar();
        },

        editComplete: function() {
            this.documentHolder && this.documentHolder.fireEvent('editcomplete', this.documentHolder);
        },

        applySettings: function() {
            !Common.Utils.InternalSettings.get('pdfe-settings-annot-bar') && this.onHideAnnotBar();
        }
    });
});