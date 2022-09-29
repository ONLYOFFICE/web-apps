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
 *  DocumentHolder.js
 *
 *  DocumentHolder controller
 *
 *  Created by Alexander Yuzhin on 1/15/14
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

var c_paragraphLinerule = {
    LINERULE_LEAST: 0,
    LINERULE_AUTO: 1,
    LINERULE_EXACT: 2
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
    'presentationeditor/main/app/view/DocumentHolder'
], function () {
    'use strict';

    PE.Controllers.DocumentHolder = Backbone.Controller.extend({
        models: [],
        collections: [],
        views: [
            'DocumentHolder'
        ],

        initialize: function() {
            this.addListeners({
                'DocumentHolder': {
                    'createdelayedelements': this.createDelayedElements,
                    'equation:callback': this.equationCallback,
                    'layout:change': this.onLayoutChange,
                    'theme:change': this.onThemeChange
                }
            });

            var me = this;
            me.usertips = [];
            me._TtHeight = 20;
            me.fastcoauthtips = [];
            me._state = {};
            me.mode = {};
            me._isDisabled = false;

            me.screenTip = {
                toolTip: new Common.UI.Tooltip({
                    owner: this,
                    html: true,
                    title: '<br><b>Press Ctrl and click link</b>'
//                    style: 'word-wrap: break-word;'
                }),
                strTip: '',
                isHidden: true,
                isVisible: false
            };

            me.userTooltip = true;
            me.wrapEvents = {
                userTipMousover: _.bind(me.userTipMousover, me),
                userTipMousout: _.bind(me.userTipMousout, me),
                onKeyUp: _.bind(me.onKeyUp, me)
            };

            // Hotkeys
            // ---------------------
            var keymap = {};
            me.hkComments = 'alt+h';
            keymap[me.hkComments] = function() {
                if (me.api.can_AddQuotedComment()!==false && me.documentHolder.slidesCount>0) {
                    me.addComment();
                }
            };

            me.hkPreview = 'command+f5,ctrl+f5';
            keymap[me.hkPreview] = function(e) {
                var isResized = false;
                e.preventDefault();
                e.stopPropagation();
                if (me.documentHolder.slidesCount>0) {
                    Common.NotificationCenter.trigger('preview:start', 0);
                }
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
                    me.onDocumentHolderResize();
                },
                'preview:show': function(e){
                    me.isPreviewVisible = true;
                    me.screenTip && (me.screenTip.tipLength = -1); // redraw link tip
                },
                'preview:hide': function(e){
                    me.isPreviewVisible = false;
                    me.screenTip && (me.screenTip.tipLength = -1);  // redraw link tip
                }
            });
        },

        setApi: function(api) {
            this.api = api;

            var me = this;
            if (me.api) {
                me.api.asc_registerCallback('asc_onContextMenu',        _.bind(me.onContextMenu, me));
                me.api.asc_registerCallback('asc_onMouseMoveStart',     _.bind(me.onMouseMoveStart, me));
                me.api.asc_registerCallback('asc_onMouseMoveEnd',       _.bind(me.onMouseMoveEnd, me));
                me.api.asc_registerCallback('asc_onPaintSlideNum',      _.bind(me.onPaintSlideNum, me));
                me.api.asc_registerCallback('asc_onEndPaintSlideNum',   _.bind(me.onEndPaintSlideNum, me));
                me.api.asc_registerCallback('asc_onCountPages',         _.bind(me.onApiCountPages, me));
                me.api.asc_registerCallback('asc_onCurrentPage',        _.bind(me.onApiCurrentPages, me));
                me.documentHolder.slidesCount = me.api.getCountPages();

                //hyperlink
                me.api.asc_registerCallback('asc_onHyperlinkClick',     _.bind(me.onHyperlinkClick, me));
                me.api.asc_registerCallback('asc_onMouseMove',          _.bind(me.onMouseMove, me));

                if (me.mode.isEdit===true) {
                    me.api.asc_registerCallback('asc_onDialogAddHyperlink', _.bind(me.onDialogAddHyperlink, me));
                    me.api.asc_registerCallback('asc_doubleClickOnChart', _.bind(me.editChartClick, me));
                    me.api.asc_registerCallback('asc_doubleClickOnTableOleObject', _.bind(me.onDoubleClickOnTableOleObject, me));
                    me.api.asc_registerCallback('asc_onSpellCheckVariantsFound',  _.bind(me.onSpellCheckVariantsFound, me));
                    me.api.asc_registerCallback('asc_onShowSpecialPasteOptions',  _.bind(me.onShowSpecialPasteOptions, me));
                    me.api.asc_registerCallback('asc_onHideSpecialPasteOptions',  _.bind(me.onHideSpecialPasteOptions, me));
                    me.api.asc_registerCallback('asc_ChangeCropState',            _.bind(me.onChangeCropState, me));
                    me.api.asc_registerCallback('asc_onHidePlaceholderActions',   _.bind(me.onHidePlaceholderActions, me));
                    me.api.asc_registerPlaceholderCallback(AscCommon.PlaceholderButtonType.Image, _.bind(me.onInsertImage, me, true));
                    me.api.asc_registerPlaceholderCallback(AscCommon.PlaceholderButtonType.ImageUrl, _.bind(me.onInsertImageUrl, me, true));
                    me.api.asc_registerPlaceholderCallback(AscCommon.PlaceholderButtonType.Chart, _.bind(me.onClickPlaceholderChart, me));
                    me.api.asc_registerPlaceholderCallback(AscCommon.PlaceholderButtonType.Table, _.bind(me.onClickPlaceholderTable, me));
                    me.api.asc_registerPlaceholderCallback(AscCommon.PlaceholderButtonType.Video, _.bind(me.onClickPlaceholder, me, AscCommon.PlaceholderButtonType.Video));
                    me.api.asc_registerPlaceholderCallback(AscCommon.PlaceholderButtonType.Audio, _.bind(me.onClickPlaceholder, me, AscCommon.PlaceholderButtonType.Audio));
                }
                me.api.asc_registerCallback('asc_onCoAuthoringDisconnect',  _.bind(me.onCoAuthoringDisconnect, me));
                Common.NotificationCenter.on('api:disconnect',              _.bind(me.onCoAuthoringDisconnect, me));
                me.api.asc_registerCallback('asc_onTextLanguage',           _.bind(me.onTextLanguage, me));

                me.api.asc_registerCallback('asc_onShowForeignCursorLabel', _.bind(me.onShowForeignCursorLabel, me));
                me.api.asc_registerCallback('asc_onHideForeignCursorLabel', _.bind(me.onHideForeignCursorLabel, me));
                me.api.asc_registerCallback('asc_onFocusObject',            _.bind(me.onFocusObject, me));
                me.api.asc_registerCallback('asc_onUpdateThemeIndex',       _.bind(me.onApiUpdateThemeIndex, me));
                me.api.asc_registerCallback('asc_onLockDocumentTheme',      _.bind(me.onApiLockDocumentTheme, me));
                me.api.asc_registerCallback('asc_onUnLockDocumentTheme',    _.bind(me.onApiUnLockDocumentTheme, me));
                me.api.asc_registerCallback('asc_onStartDemonstration',     _.bind(me.onApiStartDemonstration, me));

                me.documentHolder.setApi(me.api);
            }

            return me;
        },

        setMode: function(mode) {
            var me = this;
            me.mode = mode;
            /** coauthoring begin **/
            !(me.mode.canCoAuthoring && me.mode.canComments)
                ? Common.util.Shortcuts.suspendEvents(me.hkComments)
                : Common.util.Shortcuts.resumeEvents(me.hkComments);
            /** coauthoring end **/

            me.editorConfig = {user: mode.user};
            me.documentHolder.setMode(mode);
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

        createDelayedElements: function(view, type) {
            var me = this,
                view = me.documentHolder;

            if (type=='view') {
                view.menuViewCopy.on('click', _.bind(me.onCutCopyPaste, me));
                view.menuViewAddComment.on('click', _.bind(me.addComment, me));
                view.menuViewUndo.on('click', _.bind(me.onUndo, me));
                view.mnuPreview.on('click', _.bind(me.onPreview, me));
                view.mnuSelectAll.on('click', _.bind(me.onSelectAll, me));
                view.mnuPrintSelection.on('click', _.bind(me.onPrintSelection, me));
                return;
            }

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

            view.menuSlidePaste.on('click', _.bind(me.onCutCopyPaste, me));
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
            view.menuChartEdit.on('click', _.bind(me.editChartClick, me, undefined));
            view.menuAddCommentPara.on('click', _.bind(me.addComment, me));
            view.menuAddCommentTable.on('click', _.bind(me.addComment, me));
            view.menuAddCommentImg.on('click', _.bind(me.addComment, me));
            view.menuAddToLayoutImg.on('click', _.bind(me.addToLayout, me));
            view.menuAddToLayoutTable.on('click', _.bind(me.addToLayout, me));
            view.menuImgReplace.menu.on('item:click', _.bind(me.onImgReplace, me));
            view.langParaMenu.menu.on('item:click', _.bind(me.onLangMenu, me, 'para'));
            view.langTableMenu.menu.on('item:click', _.bind(me.onLangMenu, me, 'table'));
            view.mnuPreview.on('click', _.bind(me.onPreview, me));
            view.mnuSelectAll.on('click', _.bind(me.onSelectAll, me));
            view.mnuPrintSelection.on('click', _.bind(me.onPrintSelection, me));
            view.mnuNewSlide.on('click', _.bind(me.onNewSlide, me));
            view.mnuDuplicateSlide.on('click', _.bind(me.onDuplicateSlide, me));
            view.mnuDeleteSlide.on('click', _.bind(me.onDeleteSlide, me));
            view.mnuResetSlide.on('click', _.bind(me.onResetSlide, me));
            view.mnuMoveSlideToStart.on('click', _.bind(me.onMoveSlideToStart, me));
            view.mnuMoveSlideToEnd.on('click', _.bind(me.onMoveSlideToEnd, me));
            view.menuSlideSettings.on('click', _.bind(me.onSlideSettings, me));
            view.mnuSlideHide.on('click', _.bind(me.onSlideHide, me));
            view.mnuTableMerge.on('click', _.bind(me.onTableMerge, me));
            view.mnuTableSplit.on('click', _.bind(me.onTableSplit, me));
            view.menuTableCellAlign.menu.on('item:click', _.bind(me.tableCellsVAlign, me));
            view.menuTableDistRows.on('click', _.bind(me.onTableDistRows, me));
            view.menuTableDistCols.on('click', _.bind(me.onTableDistCols, me));
            view.menuIgnoreSpellTable.on('click', _.bind(me.onIgnoreSpell, me));
            view.menuIgnoreSpellPara.on('click', _.bind(me.onIgnoreSpell, me));
            view.menuIgnoreAllSpellTable.on('click', _.bind(me.onIgnoreSpell, me));
            view.menuIgnoreAllSpellPara.on('click', _.bind(me.onIgnoreSpell, me));
            view.menuToDictionaryTable.on('click', _.bind(me.onToDictionary, me));
            view.menuToDictionaryPara.on('click', _.bind(me.onToDictionary, me));
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
        },

        getView: function (name) {
            return !name ?
                this.documentHolder : Backbone.Controller.prototype.getView.call()
        },

        showPopupMenu: function(menu, value, event, docElement, eOpts){
            var me = this;
            if (!_.isUndefined(menu) && menu !== null){
                Common.UI.Menu.Manager.hideAll();

                var showPoint = [event.get_X(), event.get_Y()],
                    menuContainer = $(me.documentHolder.el).find(Common.Utils.String.format('#menu-container-{0}', menu.id));

                if (event.get_Type() == Asc.c_oAscContextMenuTypes.Thumbnails) {
                    showPoint[0] -= 3;
                    showPoint[1] -= 3;
                }

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
            }
        },

        fillMenuProps: function(selectedElements) {
            if (!selectedElements || !_.isArray(selectedElements)) return;
            var me = this,
                documentHolder = this.documentHolder;
            var menu_props = {},
                menu_to_show = null;
            _.each(selectedElements, function(element, index) {
                var elType  = element.get_ObjectType(),
                    elValue = element.get_ObjectValue();

                if (Asc.c_oAscTypeSelectElement.Image == elType) {
                    menu_to_show = documentHolder.pictureMenu;
                    menu_props.imgProps = {};
                    menu_props.imgProps.value = elValue;
                    menu_props.imgProps.locked = (elValue) ? elValue.get_Locked() : false;
                } else if (Asc.c_oAscTypeSelectElement.Table == elType)
                {
                    menu_to_show = documentHolder.tableMenu;
                    menu_props.tableProps = {};
                    menu_props.tableProps.value = elValue;
                    menu_props.tableProps.locked = (elValue) ? elValue.get_Locked() : false;
                } else if (Asc.c_oAscTypeSelectElement.Hyperlink == elType) {
                    menu_props.hyperProps = {};
                    menu_props.hyperProps.value = elValue;
                } else if (Asc.c_oAscTypeSelectElement.Shape == elType) { // shape
                    menu_to_show = documentHolder.pictureMenu;
                    menu_props.shapeProps = {};
                    menu_props.shapeProps.value = elValue;
                    menu_props.shapeProps.locked = (elValue) ? elValue.get_Locked() : false;
                    if (elValue.get_FromChart())
                        menu_props.shapeProps.isChart = true;
                }
                else if (Asc.c_oAscTypeSelectElement.Chart == elType) {
                    menu_to_show = documentHolder.pictureMenu;
                    menu_props.chartProps = {};
                    menu_props.chartProps.value = elValue;
                    menu_props.chartProps.locked = (elValue) ? elValue.get_Locked() : false;
                }
                else if (Asc.c_oAscTypeSelectElement.Slide == elType) {
                    menu_props.slideProps = {};
                    menu_props.slideProps.value = elValue;
                    menu_props.slideProps.locked = (elValue) ? elValue.get_LockDelete() : false;
                } else if (Asc.c_oAscTypeSelectElement.Paragraph == elType) {
                    menu_props.paraProps = {};
                    menu_props.paraProps.value = elValue;
                    menu_props.paraProps.locked = (elValue) ? elValue.get_Locked() : false;
                    if ( (menu_props.shapeProps && menu_props.shapeProps.value || menu_props.chartProps && menu_props.chartProps.value)&& // text in shape, need to show paragraph menu with vertical align
                        _.isUndefined(menu_props.tableProps))
                        menu_to_show = documentHolder.textMenu;
                } else if (Asc.c_oAscTypeSelectElement.SpellCheck == elType) {
                    menu_props.spellProps = {};
                    menu_props.spellProps.value = elValue;
                    documentHolder._currentSpellObj = elValue;
                } else if (Asc.c_oAscTypeSelectElement.Math == elType) {
                    menu_props.mathProps = {};
                    menu_props.mathProps.value = elValue;
                    documentHolder._currentMathObj = elValue;
                }
            });
            if (menu_to_show === null) {
                if (!_.isUndefined(menu_props.paraProps))
                    menu_to_show = documentHolder.textMenu;
                else if (!_.isUndefined(menu_props.slideProps)) {
                    menu_to_show = documentHolder.slideMenu;
                }
            }

            return {menu_to_show: menu_to_show, menu_props: menu_props};
        },

        fillViewMenuProps: function(selectedElements) {
            if (!selectedElements || !_.isArray(selectedElements)) return;

            var me = this,
                documentHolder = this.documentHolder;
            if (!documentHolder.viewModeMenu)
                documentHolder.createDelayedElementsViewer();

            var menu_props = {},
                menu_to_show = null;
            _.each(selectedElements, function(element, index) {
                var elType  = element.get_ObjectType(),
                    elValue = element.get_ObjectValue();

                if (Asc.c_oAscTypeSelectElement.Image == elType || Asc.c_oAscTypeSelectElement.Table == elType || Asc.c_oAscTypeSelectElement.Shape == elType ||
                    Asc.c_oAscTypeSelectElement.Chart == elType || Asc.c_oAscTypeSelectElement.Paragraph == elType) {
                    menu_to_show = documentHolder.viewModeMenu;
                    menu_props.locked = menu_props.locked || ((elValue) ? elValue.get_Locked() : false);
                    if (Asc.c_oAscTypeSelectElement.Chart == elType)
                        menu_props.isChart = true;
                }
                else if (Asc.c_oAscTypeSelectElement.Slide == elType) {
                    menu_props.locked = menu_props.locked || ((elValue) ? elValue.get_LockDelete() : false);
                }
            });

            return (menu_to_show) ? {menu_to_show: menu_to_show, menu_props: menu_props} : null;
        },

        showObjectMenu: function(event, docElement, eOpts){
            var me = this;
            if (me.api){
                var obj = (me.mode.isEdit && !me._isDisabled) ? me.fillMenuProps(me.api.getSelectedElements()) : me.fillViewMenuProps(me.api.getSelectedElements());
                if (obj) me.showPopupMenu(obj.menu_to_show, obj.menu_props, event, docElement, eOpts);
            }
        },

        onContextMenu: function(event){
            if (Common.UI.HintManager.isHintVisible())
                Common.UI.HintManager.clearHints();
            var me = this;
            _.delay(function(){
                if (event.get_Type() == Asc.c_oAscContextMenuTypes.Thumbnails) {
                    me.showPopupMenu.call(me, (me.mode.isEdit && !me._isDisabled) ? me.documentHolder.slideMenu : me.documentHolder.viewModeMenuSlide, {isSlideSelect: event.get_IsSlideSelect(), isSlideHidden: event.get_IsSlideHidden(), fromThumbs: true}, event);
                } else {
                    me.showObjectMenu.call(me, event);
                }
            },10);
        },

        onFocusObject: function(selectedElements) {
            var me = this,
                currentMenu = me.documentHolder.currentMenu;
            if (currentMenu && currentMenu.isVisible()){
                if (me.api.asc_getCurrentFocusObject() === 0 ){ // thumbnails
                    if (me.documentHolder.slideMenu===currentMenu && !me._isDisabled) {
                        var isHidden = false;
                        _.each(selectedElements, function(element, index) {
                            if (Asc.c_oAscTypeSelectElement.Slide == element.get_ObjectType()) {
                                isHidden = element.get_ObjectValue().get_IsHidden();
                            }
                        });

                        currentMenu.options.initMenu({isSlideSelect: me.documentHolder.slideMenu.items[2].isVisible(), isSlideHidden: isHidden, fromThumbs: true});
                        currentMenu.alignPosition();
                    }
                } else {
                    var obj = (me.mode.isEdit && !me._isDisabled) ? me.fillMenuProps(selectedElements) : me.fillViewMenuProps(selectedElements);
                    if (obj) {
                        if (obj.menu_to_show===currentMenu) {
                            currentMenu.options.initMenu(obj.menu_props);
                            currentMenu.alignPosition();
                        }
                    }
                }
            }
        },

        handleDocumentWheel: function(event){
            var me = this;
            if (me.api) {
                var delta = (_.isUndefined(event.originalEvent)) ? event.wheelDelta : event.originalEvent.wheelDelta;
                if (_.isUndefined(delta)) {
                    delta = event.deltaY;
                }

                if (event.ctrlKey && !event.altKey){
                    if (delta < 0)
                        me.api.zoomOut();
                    else if (delta > 0)
                        me.api.zoomIn();

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
                        me.api.zoomOut();
                        event.preventDefault();
                        event.stopPropagation();
                        return false;
                    } else if (key === 48 || key === 96) {// 0
                        me.api.zoomFitToPage();
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
                    if (!Common.UI.HintManager.isHintVisible())
                        Common.NotificationCenter.trigger('leftmenu:change', 'hide');
                }
            }
        },

        onDocumentHolderResize: function(){
            var me = this;
            me._Height      = me.documentHolder.cmpEl.height();
            me._Width       = me.documentHolder.cmpEl.width();
            me._BodyWidth   = $('body').width();
            me._XY          = undefined;

            if (me.slideNumDiv) {
                me.slideNumDiv.remove();
                me.slideNumDiv = undefined;
            }
        },

        getUserName: function(id){
            var usersStore = PE.getCollection('Common.Collections.Users');
            if (usersStore){
                var rec = usersStore.findUser(id);
                if (rec)
                    return AscCommon.UserInfoParser.getParsedName(rec.get('username'));
            }
            return this.documentHolder.guestText;
        },

        isUserVisible: function(id){
            var usersStore = PE.getCollection('Common.Collections.Users');
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
            if (typeof me.userTooltip == 'object') {
                me.userTooltip.hide();
                me.userTooltip = true;
            }
            _.each(me.usertips, function(item) {
                item.remove();
            });
            me.usertips = [];
            me.usertipcount = 0;
        },

        onHyperlinkClick: function(url) {
            if (url) {
                var type = this.api.asc_getUrlType(url);
                if (type===AscCommon.c_oAscUrlType.Http || type===AscCommon.c_oAscUrlType.Email)
                    window.open(url);
                else
                    Common.UI.warning({
                        msg: this.documentHolder.txtWarnUrl,
                        buttons: ['yes', 'no'],
                        primary: 'yes',
                        callback: function(btn) {
                            (btn == 'yes') && window.open(url);
                        }
                    });
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
            if (this.screenTip.isHidden && this.screenTip.isVisible) {
                this.screenTip.isVisible = false;
                this.screenTip.toolTip.hide();
            }
        },

        onMouseMove: function(moveData) {
            var me = this,
                cmpEl = me.documentHolder.cmpEl,
                screenTip = me.screenTip;
            if (_.isUndefined(me._XY)) {
                me._XY = [
                    cmpEl.offset().left - $(window).scrollLeft(),
                    cmpEl.offset().top - $(window).scrollTop()
                ];
                me._Width       = cmpEl.width();
                me._Height      = cmpEl.height();
                me._BodyWidth   = $('body').width();
            }

            if (moveData) {
                var showPoint, ToolTip;

                if (moveData.get_Type()==1) { // 1 - hyperlink
                    var hyperProps = moveData.get_Hyperlink();
                    var recalc = false;
                    if (hyperProps) {
                        screenTip.isHidden = false;

                        ToolTip = (_.isEmpty(hyperProps.get_ToolTip())) ? hyperProps.get_Value() : hyperProps.get_ToolTip();
                        ToolTip = Common.Utils.String.htmlEncode(ToolTip);
                        if (ToolTip.length>256)
                            ToolTip = ToolTip.substr(0, 256) + '...';

                        if (screenTip.tipLength !== ToolTip.length || screenTip.strTip.indexOf(ToolTip)<0 ) {
                            screenTip.toolTip.setTitle(ToolTip + (me.isPreviewVisible ? '' : '<br><b>' + Common.Utils.String.platformKey('Ctrl', me.documentHolder.txtPressLink) + '</b>'));
                            screenTip.tipLength = ToolTip.length;
                            screenTip.strTip = ToolTip;
                            recalc = true;
                        }

                        showPoint = [moveData.get_X(), moveData.get_Y()];
                        showPoint[1] += ((me.isPreviewVisible ? 0 : me._XY[1])-15);
                        showPoint[0] += ((me.isPreviewVisible ? 0 : me._XY[0])+5);

                        if (!screenTip.isVisible || recalc) {
                            screenTip.isVisible = true;
                            screenTip.toolTip.show([-10000, -10000]);
                        }

                        if ( recalc ) {
                            screenTip.tipHeight = screenTip.toolTip.getBSTip().$tip.height();
                            screenTip.tipWidth = screenTip.toolTip.getBSTip().$tip.width();
                        }
                        showPoint[1] -= screenTip.tipHeight;
                        if (showPoint[1]<0)
                            showPoint[1] = 0;
                        if (showPoint[0] + screenTip.tipWidth > me._BodyWidth )
                            showPoint[0] = me._BodyWidth - screenTip.tipWidth;
                        screenTip.toolTip.getBSTip().$tip.css({top: showPoint[1] + 'px', left: showPoint[0] + 'px'});
                    }
                }
                /** coauthoring begin **/
                else if (moveData.get_Type()==2 && me.mode.isEdit && me.isUserVisible(moveData.get_UserId())) { // 2 - locked object
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
                    }
                }
                /** coauthoring end **/
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
                $('#id_main_parent').append(src);
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

        onDialogAddHyperlink: function() {
            var win, props, text;
            var me = this;
            if (me.api && me.mode.isEdit && !me._isDisabled && !PE.getController('LeftMenu').leftMenu.menuFile.isVisible()){
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
                    win = new PE.Views.HyperlinkSettingsDialog({
                        api: me.api,
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
                        win = new PE.Views.HyperlinkSettingsDialog({
                            api: me.api,
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

        onPaintSlideNum: function (slideNum) {
            var me = this;
            if (_.isUndefined(me._XY)) {
                me._XY = [
                    me.documentHolder.cmpEl.offset().left - $(window).scrollLeft(),
                    me.documentHolder.cmpEl.offset().top - $(window).scrollTop()
                ];
                me._Width       = me.documentHolder.cmpEl.width();
                me._Height      = me.documentHolder.cmpEl.height();
                me._BodyWidth   = $('body').width();
            }

            if (_.isUndefined(me.slideNumDiv)) {
                me.slideNumDiv = $(document.createElement("div"));
                me.slideNumDiv.addClass('slidenum-div');
                me.slideNumDiv.css({
                    position    : 'absolute',
                    display     : 'block',
                    zIndex      : '900',
                    top         : me._XY[1] + me._Height / 2 + 'px',
                    right       : (me._BodyWidth - me._XY[0] - me._Width + 22) + 'px'
                });
                $(document.body).append(me.slideNumDiv);
            }

            me.slideNumDiv.html(me.documentHolder.txtSlide + ' ' + (slideNum + 1));
            me.slideNumDiv.show();
        },

        onEndPaintSlideNum: function () {
            if (this.slideNumDiv)
                this.slideNumDiv.hide();
        },

        onCoAuthoringDisconnect: function() {
            this.mode.isEdit = false;
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

        equationCallback: function(eqProps) {
            if (eqProps) {
                var eqObj;
                switch (eqProps.type) {
                    case Asc.c_oAscMathInterfaceType.Accent:
                        eqObj = new CMathMenuAccent();
                        break;
                    case Asc.c_oAscMathInterfaceType.BorderBox:
                        eqObj = new CMathMenuBorderBox();
                        break;
                    case Asc.c_oAscMathInterfaceType.Box:
                        eqObj = new CMathMenuBox();
                        break;
                    case Asc.c_oAscMathInterfaceType.Bar:
                        eqObj = new CMathMenuBar();
                        break;
                    case Asc.c_oAscMathInterfaceType.Script:
                        eqObj = new CMathMenuScript();
                        break;
                    case Asc.c_oAscMathInterfaceType.Fraction:
                        eqObj = new CMathMenuFraction();
                        break;
                    case Asc.c_oAscMathInterfaceType.Limit:
                        eqObj = new CMathMenuLimit();
                        break;
                    case Asc.c_oAscMathInterfaceType.Matrix:
                        eqObj = new CMathMenuMatrix();
                        break;
                    case Asc.c_oAscMathInterfaceType.EqArray:
                        eqObj = new CMathMenuEqArray();
                        break;
                    case Asc.c_oAscMathInterfaceType.LargeOperator:
                        eqObj = new CMathMenuNary();
                        break;
                    case Asc.c_oAscMathInterfaceType.Delimiter:
                        eqObj = new CMathMenuDelimiter();
                        break;
                    case Asc.c_oAscMathInterfaceType.GroupChar:
                        eqObj = new CMathMenuGroupCharacter();
                        break;
                    case Asc.c_oAscMathInterfaceType.Radical:
                        eqObj = new CMathMenuRadical();
                        break;
                    case Asc.c_oAscMathInterfaceType.Common:
                        eqObj = new CMathMenuBase();
                        break;
                }
                if (eqObj) {
                    eqObj[eqProps.callback](eqProps.value);
                    this.api.asc_SetMathProps(eqObj);
                }
            }
            this.editComplete();
        },

        changePosition: function() {
            var me = this,
                cmpEl = me.documentHolder.cmpEl;
            me._XY = [
                cmpEl.offset().left - $(window).scrollLeft(),
                cmpEl.offset().top  - $(window).scrollTop()
            ];
            me.onMouseMoveStart();
        },

        onApiStartDemonstration: function() {
            if (this.documentHolder.slidesCount>0) {
                Common.NotificationCenter.trigger('preview:start', 0, null, true);
            }
        },

        onApiCountPages: function(count) {
            this.documentHolder.slidesCount = count;
        },

        onApiCurrentPages: function(number) {
            var me = this;
            if (me.documentHolder.currentMenu && me.documentHolder.currentMenu.isVisible() && me._isFromSlideMenu !== true && me._isFromSlideMenu !== number)
                setTimeout(function() {
                    me.documentHolder.currentMenu && me.documentHolder.currentMenu.hide();
                }, 1);

            me._isFromSlideMenu = number;
        },

        onApiUpdateThemeIndex: function(v) {
            this._state.themeId = v;
        },

        onApiLockDocumentTheme: function() {
            this.documentHolder && (this.documentHolder._state.themeLock = true);
        },

        onApiUnLockDocumentTheme: function() {
            this.documentHolder && (this.documentHolder._state.themeLock = false);
        },

        onShowSpecialPasteOptions: function(specialPasteShowOptions) {
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
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.keepTextOnly] = documentHolder.txtKeepTextOnly;
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.picture] = documentHolder.txtPastePicture;
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.sourceformatting] = documentHolder.txtPasteSourceFormat;
                me._arrSpecialPaste[Asc.c_oSpecialPasteProps.destinationFormatting] = documentHolder.txtPasteDestFormat;


                pasteContainer = $('<div id="special-paste-container" style="position: absolute;"><div id="id-document-holder-btn-special-paste"></div></div>');
                documentHolder.cmpEl.find('#id_main_view').append(pasteContainer);

                me.btnSpecialPaste = new Common.UI.Button({
                    parentEl: $('#id-document-holder-btn-special-paste'),
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-paste',
                    caption     : Common.Utils.String.platformKey('Ctrl', '({0})'),
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
            if (coord.asc_getX()<0 || coord.asc_getY()<0) {
                if (pasteContainer.is(':visible')) pasteContainer.hide();
                $(document).off('keyup', this.wrapEvents.onKeyUp);
            } else {
                var offsetLeft = 0;
                var sdkPanelLeft = documentHolder.cmpEl.find('#id_panel_left');
                if (sdkPanelLeft.length)
                    offsetLeft += (sdkPanelLeft.css('display') !== 'none') ? sdkPanelLeft.width() : 0;

                var sdkPanelThumbs = documentHolder.cmpEl.find('#id_panel_thumbnails');
                if (sdkPanelThumbs.length)
                    offsetLeft += (sdkPanelThumbs.css('display') !== 'none') ? sdkPanelThumbs.width() : 0;

                var showPoint = [Math.max(0, coord.asc_getX() + coord.asc_getWidth() + 3 - offsetLeft), coord.asc_getY() + coord.asc_getHeight() + 3];
                pasteContainer.css({left: showPoint[0], top : showPoint[1]});
                pasteContainer.show();
                setTimeout(function() {
                    $(document).on('keyup', me.wrapEvents.onKeyUp);
                }, 10);
            }
        },

        onHideSpecialPasteOptions: function() {
            var pasteContainer = this.documentHolder.cmpEl.find('#special-paste-container');
            if (pasteContainer.is(':visible')) {
                pasteContainer.hide();
                $(document).off('keyup', this.wrapEvents.onKeyUp);
            }
        },

        onKeyUp: function (e) {
            if (e.keyCode == Common.UI.Keys.CTRL && this._needShowSpecPasteMenu && !this.btnSpecialPaste.menu.isVisible() && /area_id/.test(e.target.id)) {
                $('button', this.btnSpecialPaste.cmpEl).click();
                e.preventDefault();
            }
            this._needShowSpecPasteMenu = false;
        },

        initSpecialPasteEvents: function() {
            var me = this;
            me.hkSpecPaste = [];
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.paste] = 'P';
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.keepTextOnly] = 'T';
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.picture] = 'U';
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.sourceformatting] = 'K';
            me.hkSpecPaste[Asc.c_oSpecialPasteProps.destinationFormatting] = 'H';
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

        onChangeCropState: function(state) {
            this.documentHolder.menuImgCrop.menu.items[0].setChecked(state, true);
        },

        onDoubleClickOnTableOleObject: function(chart) {
            if (this.mode.isEdit && !this._isDisabled) {
                var oleEditor = PE.getController('Common.Controllers.ExternalOleEditor').getView('Common.Views.ExternalOleEditor');
                if (oleEditor && chart) {
                    oleEditor.setEditMode(true);
                    oleEditor.show();
                    oleEditor.setOleData(Asc.asc_putBinaryDataToFrameFromTableOleObject(chart));
                }
            }
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
                win = new PE.Views.HyperlinkSettingsDialog({
                    api: me.api,
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
                win = new PE.Views.HyperlinkSettingsDialog({
                    api: me.api,
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


        /** coauthoring begin **/
        addComment: function(item, e, eOpt){
            if (this.api && this.mode.canCoAuthoring && this.mode.canComments) {
                this.documentHolder.suppressEditComplete = true;

                var controller = PE.getController('Common.Controllers.Comments');
                if (controller) {
                    controller.addDummyComment();
                }
            }
        },
        /** coauthoring end **/
        editChartClick: function(chart, placeholder){
            if (this.mode.isEdit && !this._isDisabled) {
                var diagramEditor = PE.getController('Common.Controllers.ExternalDiagramEditor').getView('Common.Views.ExternalDiagramEditor');

                if (diagramEditor) {
                    diagramEditor.setEditMode(chart===undefined || typeof chart == 'object'); //edit from doubleclick or context menu
                    diagramEditor.show();
                    if (typeof chart !== 'object')
                        chart = this.api.asc_getChartObject(chart, placeholder);
                    diagramEditor.setChartData(new Asc.asc_CChartBinary(chart));
                    diagramEditor.setPlaceholder(placeholder);
                }
            }
        },

        onCutCopyPaste: function(item, e) {
            var me = this;
            if (me.api) {
                var res =  (item.value == 'cut') ? me.api.Cut() : ((item.value == 'copy') ? me.api.Copy() : me.api.Paste());
                if (!res) {
                    if (!Common.localStorage.getBool("pe-hide-copywarning")) {
                        (new Common.Views.CopyWarningDialog({
                            handler: function(dontshow) {
                                if (dontshow) Common.localStorage.setItem("pe-hide-copywarning", 1);
                                me.editComplete();
                            }
                        })).show();
                    }
                }
            }
            me.editComplete();
        },

        addToLayout: function() {
            if (this.api)
                this.api.asc_AddToLayout();
        },

        onInsertImage: function(placeholder, obj, x, y) {
            if (this.api)
                (placeholder) ? this.api.asc_addImage(obj) : this.api.ChangeImageFromFile();
            this.editComplete();
        },

        onInsertImageUrl: function(placeholder, obj, x, y) {
            var me = this;
            (new Common.Views.ImageFromUrlDialog({
                handler: function(result, value) {
                    if (result == 'ok') {
                        if (me.api) {
                            var checkUrl = value.replace(/ /g, '');
                            if (!_.isEmpty(checkUrl)) {
                                if (placeholder)
                                    me.api.AddImageUrl([checkUrl], undefined, undefined, obj);
                                else {
                                    var props = new Asc.asc_CImgProperty();
                                    props.put_ImageUrl(checkUrl);
                                    me.api.ImgApply(props, obj);
                                }
                            }
                        }
                    }
                    me.editComplete();
                }
            })).show();
        },

        onClickPlaceholderChart: function(obj, x, y) {
            if (!this.api) return;

            this._state.placeholderObj = obj;
            var menu = this.placeholderMenuChart,
                menuContainer = menu ? this.documentHolder.cmpEl.find(Common.Utils.String.format('#menu-container-{0}', menu.id)) : null,
                me = this;
            this._fromShowPlaceholder = true;
            Common.UI.Menu.Manager.hideAll();

            if (!menu) {
                this.placeholderMenuChart = menu = new Common.UI.Menu({
                    style: 'width: 364px;padding-top: 12px;',
                    items: [
                        {template: _.template('<div id="id-placeholder-menu-chart" class="menu-insertchart"></div>')}
                    ]
                });
                // Prepare menu container
                menuContainer = $(Common.Utils.String.format('<div id="menu-container-{0}" style="position: absolute; z-index: 10000;"><div class="dropdown-toggle" data-toggle="dropdown"></div></div>', menu.id));
                this.documentHolder.cmpEl.append(menuContainer);
                menu.render(menuContainer);
                menu.cmpEl.attr({tabindex: "-1"});
                menu.on('hide:after', function(){
                    if (!me._fromShowPlaceholder)
                        me.api.asc_uncheckPlaceholders();
                });

                var picker = new Common.UI.DataView({
                    el: $('#id-placeholder-menu-chart'),
                    parentMenu: menu,
                    showLast: false,
                    // restoreHeight: 421,
                    groups: new Common.UI.DataViewGroupStore(Common.define.chartData.getChartGroupData()),
                    store: new Common.UI.DataViewStore(Common.define.chartData.getChartData()),
                    itemTemplate: _.template('<div id="<%= id %>" class="item-chartlist"><svg width="40" height="40" class=\"icon\"><use xlink:href=\"#chart-<%= iconCls %>\"></use></svg></div>')
                });
                picker.on('item:click', function (picker, item, record, e) {
                    me.editChartClick(record.get('type'), me._state.placeholderObj);
                });
            }
            menuContainer.css({left: x, top : y});
            menuContainer.attr('data-value', 'prevent-canvas-click');
            this._preventClick = true;
            menu.show();

            menu.alignPosition();
            _.delay(function() {
                menu.cmpEl.find('.dataview').focus();
            }, 10);
            this._fromShowPlaceholder = false;
        },

        onClickPlaceholderTable: function(obj, x, y) {
            if (!this.api) return;

            this._state.placeholderObj = obj;
            var menu = this.placeholderMenuTable,
                menuContainer = menu ? this.documentHolder.cmpEl.find(Common.Utils.String.format('#menu-container-{0}', menu.id)) : null,
                me = this;
            this._fromShowPlaceholder = true;
            Common.UI.Menu.Manager.hideAll();

            if (!menu) {
                this.placeholderMenuTable = menu = new Common.UI.Menu({
                    cls: 'shifted-left',
                    items: [
                        {template: _.template('<div id="id-placeholder-menu-tablepicker" class="dimension-picker" style="margin: 5px 10px;"></div>')},
                        {caption: me.mniCustomTable, value: 'custom'}
                    ]
                });
                // Prepare menu container
                menuContainer = $(Common.Utils.String.format('<div id="menu-container-{0}" style="position: absolute; z-index: 10000;"><div class="dropdown-toggle" data-toggle="dropdown"></div></div>', menu.id));
                this.documentHolder.cmpEl.append(menuContainer);
                menu.render(menuContainer);
                menu.cmpEl.attr({tabindex: "-1"});
                menu.on('hide:after', function(){
                    if (!me._fromShowPlaceholder)
                        me.api.asc_uncheckPlaceholders();
                });

                var picker = new Common.UI.DimensionPicker({
                    el: $('#id-placeholder-menu-tablepicker'),
                    minRows: 8,
                    minColumns: 10,
                    maxRows: 8,
                    maxColumns: 10
                });
                picker.on('select', function(picker, columns, rows){
                    me.api.put_Table(columns, rows, me._state.placeholderObj);
                    me.editComplete();
                });
                menu.on('item:click', function(menu, item, e){
                    if (item.value === 'custom') {
                        (new Common.Views.InsertTableDialog({
                            handler: function(result, value) {
                                if (result == 'ok')
                                    me.api.put_Table(value.columns, value.rows, me._state.placeholderObj);
                                me.editComplete();
                            }
                        })).show();
                    }
                });
            }
            menuContainer.css({left: x, top : y});
            menuContainer.attr('data-value', 'prevent-canvas-click');
            this._preventClick = true;
            menu.show();

            menu.alignPosition();
            _.delay(function() {
                menu.cmpEl.focus();
            }, 10);
            this._fromShowPlaceholder = false;
        },

        onHidePlaceholderActions: function() {
            this.placeholderMenuChart && this.placeholderMenuChart.hide();
            this.placeholderMenuTable && this.placeholderMenuTable.hide();
        },

        onClickPlaceholder: function(type, obj, x, y) {
            if (!this.api) return;
            if (type == AscCommon.PlaceholderButtonType.Video) {
                this.api.asc_AddVideo(obj);
            } else if (type == AscCommon.PlaceholderButtonType.Audio) {
                this.api.asc_AddAudio(obj);
            }
            this.editComplete();
        },

        onImgReplace: function(menu, item, e) {
            var me = this;
            if (item.value==1) {
                me.onInsertImageUrl(false);
            } else if (item.value==2) {
                Common.NotificationCenter.trigger('storage:image-load', 'change');
            } else {
                setTimeout(function(){
                    me.onInsertImage();
                }, 10);
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

        onUndo: function () {
            this.api.Undo();
        },

        onPreview: function () {
            var current = this.api.getCurrentPage();
            Common.NotificationCenter.trigger('preview:start', _.isNumber(current) ? current : 0);
        },

        onSelectAll: function () {
            if (this.api){
                this.api.SelectAllSlides();

                this.editComplete();
                Common.component.Analytics.trackEvent('DocumentHolder', 'Select All Slides');
            }
        },

        onPrintSelection: function () {
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

        onNewSlide: function () {
            if (this.api){
                this._isFromSlideMenu = true;
                this.api.AddSlide();

                this.editComplete();
                Common.component.Analytics.trackEvent('DocumentHolder', 'Add Slide');
            }
        },

        onDuplicateSlide: function () {
            if (this.api){
                this._isFromSlideMenu = true;
                this.api.DublicateSlide();

                this.editComplete();
                Common.component.Analytics.trackEvent('DocumentHolder', 'Dublicate Slide');
            }
        },

        onDeleteSlide: function () {
            if (this.api){
                this._isFromSlideMenu = true;
                this.api.DeleteSlide();

                this.editComplete();
                Common.component.Analytics.trackEvent('DocumentHolder', 'Delete Slide');
            }
        },

        onResetSlide: function () {
            if (this.api){
                this.api.ResetSlide();

                this.editComplete();
                Common.component.Analytics.trackEvent('DocumentHolder', 'Reset Slide');
            }
        },

        onMoveSlideToStart: function () {
            if (this.api){
                this.api.asc_moveSelectedSlidesToStart();

                this.editComplete();
                Common.component.Analytics.trackEvent('DocumentHolder', 'Move Slide to Start');
            }
        },

        onMoveSlideToEnd: function () {
            if (this.api){
                this.api.asc_moveSelectedSlidesToEnd();

                this.editComplete();
                Common.component.Analytics.trackEvent('DocumentHolder', 'Move Slide to End');
            }
        },

        onSlideSettings: function (item) {
            PE.getController('RightMenu').onDoubleClickOnObject(item.options.value);
        },

        onSlideHide: function (item) {
            if (this.api){
                this.api.asc_HideSlides(item.checked);

                this.editComplete();
                Common.component.Analytics.trackEvent('DocumentHolder', 'Hide Slides');
            }
        },

        onLayoutChange: function (record) {
            if (this.api) {
                this.api.ChangeLayout(record.get('data').idx);
                this.editComplete();
                Common.component.Analytics.trackEvent('DocumentHolder', 'Change Layout');
            }
        },

        onThemeChange: function (record) {
            if (this.api) {
                this.api.ChangeTheme(record.get('themeId'), true);
                this.editComplete();
                Common.component.Analytics.trackEvent('DocumentHolder', 'Change Layout');
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

        onIgnoreSpell: function(item, e){
            this.api && this.api.asc_ignoreMisspelledWord(this.documentHolder._currentSpellObj, !!item.value);
            this.editComplete();
        },

        onToDictionary: function(item, e){
            this.api && this.api.asc_spellCheckAddToDictionary(this.documentHolder._currentSpellObj);
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
                            (new PE.Views.TableSettingsAdvanced(
                                {
                                    tableProps: elValue,
                                    slideSize: PE.getController('Toolbar').currentPageSize,
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

                            (new PE.Views.ImageSettingsAdvanced(
                                {
                                    imageProps: elValue,
                                    sizeOriginal: imgsizeOriginal,
                                    slideSize: PE.getController('Toolbar').currentPageSize,
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
                            (new PE.Views.ShapeSettingsAdvanced(
                                {
                                    shapeProps: elValue,
                                    slideSize: PE.getController('Toolbar').currentPageSize,
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
                            (new PE.Views.ParagraphSettingsAdvanced(
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
                var value = me.api.asc_getSelectedDrawingObjectsCount()<2 || Common.Utils.InternalSettings.get("pe-align-to-slide");
                value = value ? Asc.c_oAscObjectsAlignType.Slide : Asc.c_oAscObjectsAlignType.Selected;
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

        SetDisabled: function(state) {
            this._isDisabled = state;
            this.documentHolder.SetDisabled(state);
        },

        editComplete: function() {
            this.documentHolder && this.documentHolder.fireEvent('editcomplete', this.documentHolder);
        }
    });
});