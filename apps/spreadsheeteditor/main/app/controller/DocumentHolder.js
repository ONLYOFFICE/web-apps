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
 *  Created on 3/28/14
 *
 */

var c_paragraphLinerule = {
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
    'common/main/lib/util/utils',
    'common/main/lib/util/Shortcuts',
    'spreadsheeteditor/main/app/view/DocumentHolder'
], function () {
    'use strict';

    SSE.Controllers.DocumentHolder = Backbone.Controller.extend(_.extend({
        models: [],
        collections: [],
        views: [
            'DocumentHolder'
        ],

        initialize: function() {
            var me = this;

            me.tooltips = {
                hyperlink: {},
                /** coauthoring begin **/
                comment:{},
                /** coauthoring end **/
                coauth: {
                    ttHeight: 20
                },
                row_column: {
                    ttHeight: 20
                },
                slicer: {
                    ttHeight: 20
                },
                filter: {ttHeight: 40},
                func_arg: {},
                input_msg: {},
                foreignSelect: {
                    ttHeight: 20
                },
                eyedropper: {
                    isHidden: true
                },
                placeholder: {}
            };
            me.mouse = {};
            me.popupmenu = false;
            me.rangeSelectionMode = false;
            me.namedrange_locked = false;
            me._currentMathObj = undefined;
            me._currentParaObjDisabled = false;
            me._isDisabled = false;
            me._state = {wsLock: false, wsProps: []};
            me.fastcoauthtips = [];
            me._TtHeight = 20;
            me.lastMathTrackBounds = [];
            me.showMathTrackOnLoad = false;

            /** coauthoring begin **/
            this.wrapEvents = {
                apiHideComment: _.bind(this.onApiHideComment, this),
                onKeyUp: _.bind(this.onKeyUp, this)
            };
            /** coauthoring end **/

            var keymap = {};
            this.hkComments = Common.Utils.isMac ? 'command+alt+a' : 'alt+h';
            keymap[this.hkComments] = function() {
                me.onAddComment();
                return false;
            };
            Common.util.Shortcuts.delegateShortcuts({shortcuts:keymap});

            Common.Utils.InternalSettings.set('sse-equation-toolbar-hide', Common.localStorage.getBool('sse-equation-toolbar-hide'));
        },

        onLaunch: function() {
            var me = this;

            me.documentHolder = this.createView('DocumentHolder');
            me.documentHolder._currentTranslateObj = this;

//            me.documentHolder.on('render:after', _.bind(me.onAfterRender, me));

            me.documentHolder.render();
            me.documentHolder.el.tabIndex = -1;

            $(document).on('mousedown',     _.bind(me.onDocumentRightDown, me));
            $(document).on('mouseup',       _.bind(me.onDocumentRightUp, me));
            $(document).on('keydown',       _.bind(me.onDocumentKeyDown, me));
            $(document).on('mousemove',     _.bind(me.onDocumentMouseMove, me));
            $(window).on('resize',          _.bind(me.onDocumentResize, me));
            var viewport = SSE.getController('Viewport').getView('Viewport');
            viewport.hlayout.on('layout:resizedrag', _.bind(me.onDocumentResize, me));

            Common.NotificationCenter.on({
                'window:show': function(e){
                    me.hideHyperlinkTip();
                    me.permissions && me.permissions.isDesktopApp && me.api && me.api.asc_onShowPopupWindow();
                },
                'modal:show': function(e){
                    me.hideCoAuthTips();
                    me.hideForeignSelectTips();
                },
                'layout:changed': function(e){
                    me.hideHyperlinkTip();
                    me.hideCoAuthTips();
                    me.hideForeignSelectTips();
                    me.onDocumentResize();
                    if (me.api && !me.tooltips.input_msg.isHidden && me.tooltips.input_msg.text) {
                        me.changeInputMessagePosition(me.tooltips.input_msg);
                    }
                },
                'cells:range': function(status){
                    me.onCellsRange(status);
                },
                'protect:wslock': _.bind(me.onChangeProtectSheet, me)
            });
            Common.Gateway.on('processmouse', _.bind(me.onProcessMouse, me));
            Common.NotificationCenter.on('script:loaded', _.bind(me.createPostLoadElements, me));
        },

        onCreateDelayedElements: function(view, type) {},

        createPostLoadElements: function() {
            var me = this;
            me.setEvents();
            me.permissions.isEdit ? me.documentHolder.createDelayedElements() : me.documentHolder.createDelayedElementsViewer();

            if (me.type !== 'edit') {
                return;
            }

            me.initExternalEditors();
            me.showMathTrackOnLoad && me.onShowMathTrack(me.lastMathTrackBounds);
        },

        loadConfig: function(data) {
            this.editorConfig = data.config;
        },

        setMode: function(permissions) {
            this.permissions = permissions;
            /** coauthoring begin **/
            !(this.permissions.canCoAuthoring && this.permissions.canComments)
                ? Common.util.Shortcuts.suspendEvents(this.hkComments)
                : Common.util.Shortcuts.resumeEvents(this.hkComments);
            /** coauthoring end **/
            this.documentHolder.setMode(permissions);
        },

        setApi: function(api) {
            this.api = api;
            if (this.api) {
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',_.bind(this.onApiCoAuthoringDisconnect, this));
                Common.NotificationCenter.on('api:disconnect',              _.bind(this.onApiCoAuthoringDisconnect, this));
                this.permissions && (this.permissions.isEdit===true) && this.api.asc_registerCallback('asc_onLockDefNameManager', _.bind(this.onLockDefNameManager, this));

            }
            return this;
        },

        resetApi: function(api) {
            /** coauthoring begin **/
            this.api.asc_unregisterCallback('asc_onHideComment',    this.wrapEvents.apiHideComment);
//            this.api.asc_unregisterCallback('asc_onShowComment',    this.wrapEvents.apiShowComment);
            this.api.asc_registerCallback('asc_onHideComment',      this.wrapEvents.apiHideComment);
//            this.api.asc_registerCallback('asc_onShowComment',      this.wrapEvents.apiShowComment);
            /** coauthoring end **/
        },

        onAddComment: function(item) {
            if (this._state.wsProps['Objects']) return;
            
            if (this.api && this.permissions.canCoAuthoring && this.permissions.canComments) {

                var controller = SSE.getController('Common.Controllers.Comments'),
                    cellinfo = this.api.asc_getCellInfo();
                if (controller) {
                    var comments = cellinfo.asc_getComments();
                    if (comments && !comments.length && this.permissions.canCoAuthoring) {
                        controller.addDummyComment();
                    }
                }
            }
        },

        onApiCoAuthoringDisconnect: function() {
            this.permissions.isEdit = false;
        },

        onLockDefNameManager: function(state) {
            this.namedrange_locked = (state == Asc.c_oAscDefinedNameReason.LockDefNameManager);
        },

        hideCoAuthTips: function() {
            if (this.tooltips.coauth.ref) {
                $(this.tooltips.coauth.ref).remove();
                this.tooltips.coauth.ref = undefined;
                this.tooltips.coauth.x_point = undefined;
                this.tooltips.coauth.y_point = undefined;
            }
        },

        hideForeignSelectTips: function() {
            if (this.tooltips.foreignSelect.ref) {
                $(this.tooltips.foreignSelect.ref).remove();
                this.tooltips.foreignSelect.ref = undefined;
                this.tooltips.foreignSelect.userId = undefined;
                this.tooltips.foreignSelect.x_point = undefined;
                this.tooltips.foreignSelect.y_point = undefined;
            }
        },

        hideHyperlinkTip: function() {
            if (!this.tooltips.hyperlink.isHidden && this.tooltips.hyperlink.ref) {
                this.tooltips.hyperlink.ref.hide();
                this.tooltips.hyperlink.ref = undefined;
                this.tooltips.hyperlink.text = '';
                this.tooltips.hyperlink.isHidden = true;
            }
        },

        hideEyedropperTip: function () {
            if (!this.tooltips.eyedropper.isHidden && this.tooltips.eyedropper.color) {
                this.tooltips.eyedropper.color.css({left: '-1000px', top: '-1000px'});
                if (this.tooltips.eyedropper.ref) {
                    this.tooltips.eyedropper.ref.hide();
                    this.tooltips.eyedropper.ref = undefined;
                }
                this.tooltips.eyedropper.isHidden = true;
            }
        },

        hidePlaceholderTip: function() {
            if (!this.tooltips.placeholder.isHidden && this.tooltips.placeholder.ref) {
                this.tooltips.placeholder.ref.hide();
                this.tooltips.placeholder.ref = undefined;
                this.tooltips.placeholder.text = '';
                this.tooltips.placeholder.isHidden = true;
            }
        },

        onApiHideComment: function() {
            this.tooltips.comment.viewCommentId =
                this.tooltips.comment.editCommentId =
                    this.tooltips.comment.moveCommentId = undefined;
        },

        onApiContextMenu: function(event, type) {
            if (Common.UI.HintManager.isHintVisible())
                Common.UI.HintManager.clearHints();
            var me = this;
            _.delay(function(){
                me.showObjectMenu.call(me, event, type);
            },10);
        },

        onAfterRender: function(view){
        },

        onDocumentResize: function(e){
            var me = this;
            if (me.documentHolder) {
                me.tooltips.coauth.XY = [
                    Common.Utils.getOffset(me.documentHolder.cmpEl).left - $(window).scrollLeft(),
                    Common.Utils.getOffset(me.documentHolder.cmpEl).top  - $(window).scrollTop()
                ];
                me.tooltips.coauth.apiHeight = me.documentHolder.cmpEl.height();
                me.tooltips.coauth.apiWidth = me.documentHolder.cmpEl.width();
                var rightMenu = $('#right-menu');
                me.tooltips.coauth.rightMenuWidth = rightMenu.is(':visible') ? rightMenu.width() : 0;
                me.tooltips.coauth.bodyWidth = Common.Utils.innerWidth();
                me.tooltips.coauth.bodyHeight = Common.Utils.innerHeight();
            }
        },

        onDocumentWheel: function(e) {
            if (this.api && !this.isEditCell) {
                var delta = (_.isUndefined(e.originalEvent)) ?  e.wheelDelta : e.originalEvent.wheelDelta;
                if (_.isUndefined(delta)) {
                    delta = e.deltaY;
                }

                if (e.ctrlKey && !e.altKey) {
                    var factor = this.api.asc_getZoom();
                    if (delta < 0) {
                        factor = Math.ceil(factor * 10)/10;
                        factor -= 0.1;
                        if (!(factor < .1)) {
                            this.api.asc_setZoom(factor);
                            this._handleZoomWheel = true;
                        }
                    } else if (delta > 0) {
                        factor = Math.floor(factor * 10)/10;
                        factor += 0.1;
                        if (factor > 0 && !(factor > 5.)) {
                            this.api.asc_setZoom(factor);
                            this._handleZoomWheel = true;
                        }
                    }

                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        },

        onDocumentKeyDown: function(event){
            if (this.api){
                var key = event.keyCode;
                if (this.hkSpecPaste) {
                    this._needShowSpecPasteMenu = !event.shiftKey && !event.altKey && event.keyCode == Common.UI.Keys.CTRL;
                }
                if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey){
                    if (key === Common.UI.Keys.NUM_PLUS || key === Common.UI.Keys.EQUALITY || (Common.Utils.isGecko && key === Common.UI.Keys.EQUALITY_FF) || (Common.Utils.isOpera && key == 43)){
                        if (!this.api.isCellEdited) {
                            var factor = Math.floor(this.api.asc_getZoom() * 10)/10;
                            factor += .1;
                            if (factor > 0 && !(factor > 5.)) {
                                this.api.asc_setZoom(factor);
                            }

                            event.preventDefault();
                            event.stopPropagation();
                            return false;
                        } else if (this.permissions.isEditMailMerge || this.permissions.isEditDiagram || this.permissions.isEditOle) {
                            event.preventDefault();
                            event.stopPropagation();
                            return false;
                        }
                    } else if (key === Common.UI.Keys.NUM_MINUS || key === Common.UI.Keys.MINUS || (Common.Utils.isGecko && key === Common.UI.Keys.MINUS_FF) || (Common.Utils.isOpera && key == 45)){
                        if (!this.api.isCellEdited) {
                            factor = Math.ceil(this.api.asc_getZoom() * 10)/10;
                            factor -= .1;
                            if (!(factor < .1)) {
                                this.api.asc_setZoom(factor);
                            }

                            event.preventDefault();
                            event.stopPropagation();
                            return false;
                        } else if (this.permissions.isEditMailMerge || this.permissions.isEditDiagram || this.permissions.isEditOle) {
                            event.preventDefault();
                            event.stopPropagation();
                            return false;
                        }
                    } else if (key === Common.UI.Keys.ZERO || key === Common.UI.Keys.NUM_ZERO) {// 0
                        if (!this.api.isCellEdited) {
                            this.api.asc_setZoom(1);
                            event.preventDefault();
                            event.stopPropagation();
                            return false;
                        }
                    }
                } else
                if (key == Common.UI.Keys.F10 && event.shiftKey) {
                    this.showObjectMenu(event);
                    event.preventDefault();
                    event.stopPropagation();
                    return false;
                } else if (key == Common.UI.Keys.ESC && !this.tooltips.input_msg.isHidden && this.tooltips.input_msg.text) {
                    this.onInputMessage();
                }
            }
        },

        onDocumentRightDown: function(event) {
            event.button == 0 && (this.mouse.isLeftButtonDown = true);
//            event.button == 2 && (this.mouse.isRightButtonDown = true);
        },

        onDocumentRightUp: function(event) {
            event.button == 0 && (this.mouse.isLeftButtonDown = false);
        },

        onProcessMouse: function(data) {
            (data.type == 'mouseup') && (this.mouse.isLeftButtonDown = false);
        },

        onDragEndMouseUp: function() {
            this.mouse.isLeftButtonDown = false;
        },

        onDocumentMouseMove: function(e) {
            if (e && e.target.localName !== 'canvas') {
                this.hideHyperlinkTip();
            }
        },

        showObjectMenu: function(event, type){
            if (this.api && !this.mouse.isLeftButtonDown && !this.rangeSelectionMode){
                if (type===Asc.c_oAscContextMenuTypes.changeSeries && this.permissions.isEdit && !this._isDisabled) {
                    this.fillSeriesMenuProps(this.api.asc_GetSeriesSettings(), event, type);
                    return;
                }
                (this.permissions.isEdit && !this._isDisabled) ? this.fillMenuProps(this.api.asc_getCellInfo(), true, event) : this.fillViewMenuProps(this.api.asc_getCellInfo(), true, event);
            }
        },

        onApiMouseMove: function(dataarray) {},

        fillMenuProps: function(cellinfo, showMenu, event) {},

        fillViewMenuProps: function(cellinfo, showMenu, event) {},

        showPopupMenu: function(menu, value, event, type){
            if (!_.isUndefined(menu) && menu !== null && event){
                Common.UI.Menu.Manager.hideAll();

                var me                  = this,
                    documentHolderView  = me.documentHolder,
                    showPoint           = [event.pageX*Common.Utils.zoom() - Common.Utils.getOffset(documentHolderView.cmpEl).left, event.pageY*Common.Utils.zoom() - Common.Utils.getOffset(documentHolderView.cmpEl).top],
                    menuContainer       = documentHolderView.cmpEl.find(Common.Utils.String.format('#menu-container-{0}', menu.id));

                if (!menu.rendered) {
                    // Prepare menu container
                    if (menuContainer.length < 1) {
                        menuContainer = $(Common.Utils.String.format('<div id="menu-container-{0}" style="position: absolute; z-index: 10000;"><div class="dropdown-toggle" data-toggle="dropdown"></div></div>', menu.id));
                        documentHolderView.cmpEl.append(menuContainer);
                    }

                    menu.render(menuContainer);
                    menu.cmpEl.attr({tabindex: "-1"});
                }

                if (/*!this.mouse.isRightButtonDown &&*/ event.button !== 2) {
                    var coord  = me.api.asc_getActiveCellCoord(),
                        offset = {left:0,top:0}/*documentHolderView.cmpEl.offset()*/;

                    showPoint[0] = coord.asc_getX() + coord.asc_getWidth() + offset.left;
                    showPoint[1] = (coord.asc_getY() < 0 ? 0 : coord.asc_getY()) + coord.asc_getHeight() + offset.top;
                }

                menuContainer.css({
                    left: showPoint[0],
                    top : showPoint[1]
                });

                if (_.isFunction(menu.options.initMenu)) {
                    menu.options.initMenu(value);
                    menu.alignPosition();
                }
                _.delay(function() {
                    menu.cmpEl.focus();
                }, 10);

                menu.show();
                me.currentMenu = menu;
                (type!==Asc.c_oAscContextMenuTypes.changeSeries) && me.api.onPluginContextMenuShow && me.api.onPluginContextMenuShow(event);
            }
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
            var pasteContainer = this.documentHolder.cmpEl.find('#special-paste-container');
            if (pasteContainer.length>0 && pasteContainer.is(':visible')) {
                this.btnSpecialPaste.setDisabled(!!this._isDisabled);
            }
        },

        onHideChartElementButton: function() {
            if (!this.documentHolder || !this.documentHolder.cmpEl) return;
            var chartContainer = this.documentHolder.cmpEl.find('#chart-element-container');
            if (chartContainer.is(':visible')) {
                chartContainer.hide();
                Common.UI.TooltipManager.closeTip('chartElements');
            }
        },

        disableChartElementButton: function() {
            var chartContainer = this.documentHolder.cmpEl.find('#chart-element-container'),
                disabled = this._isDisabled  || this._state.chartLocked;

            if (chartContainer.length>0 && chartContainer.is(':visible')) {
                this.btnChartElement.setDisabled(!!disabled);
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

        onChangeProtectSheet: function(props) {
            if (!props) {
                var wbprotect = this.getApplication().getController('WBProtection');
                props = wbprotect ? wbprotect.getWSProps() : null;
            }
            if (props) {
                this._state.wsProps = props.wsProps;
                this._state.wsLock = props.wsLock;
            }
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

        getUserName: function(id){
            var usersStore = SSE.getCollection('Common.Collections.Users');
            if (usersStore){
                var rec = usersStore.findUser(id);
                if (rec)
                    return AscCommon.UserInfoParser.getParsedName(rec.get('username'));
            }
            return this.guestText;
        },

        isUserVisible: function(id){
            var usersStore = SSE.getCollection('Common.Collections.Users');
            if (usersStore){
                var rec = usersStore.findUser(id);
                if (rec)
                    return !rec.get('hidden');
            }
            return true;
        },

        SetDisabled: function(state, canProtect) {
            this._isDisabled = state;
            this._canProtect = state ? canProtect : true;
            this.disableEquationBar();
            this.disableSpecialPaste();
            this.disableChartElementButton();
        },

        clearSelection: function() {
            this.onHideMathTrack();
            this.onHideSpecialPasteOptions();
            this.onHideChartElementButton();
        },

        onPluginContextMenu: function(data) {
            if (data && data.length>0 && this.documentHolder && this.currentMenu && (this.currentMenu !== this.documentHolder.copyPasteMenu) &&
                                                                (this.currentMenu !== this.documentHolder.fillMenu) && this.currentMenu.isVisible()){
                this.documentHolder.updateCustomItems(this.currentMenu, data);
            }
        }

    }, SSE.Controllers.DocumentHolder || {}));
});