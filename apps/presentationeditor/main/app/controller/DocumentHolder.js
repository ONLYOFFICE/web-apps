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

var c_oHyperlinkType = {
    InternalLink:0,
    WebLink: 1
};

define([
    'core',
    'presentationeditor/main/app/view/DocumentHolder'
], function () {
    'use strict';

    PE.Controllers.DocumentHolder = Backbone.Controller.extend(_.extend({
        models: [],
        collections: [],
        views: [
            'DocumentHolder'
        ],

        initialize: function() {
            var me = this;
            me.usertips = [];
            me._TtHeight = 20;
            me.fastcoauthtips = [];
            me._state = {};
            me.mode = {};
            me._isDisabled = false;
            me.lastMathTrackBounds = [];
            me.showMathTrackOnLoad = false;
            me.mouseMoveData = null;
            me.isTooltipHiding = false;

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
            me.eyedropperTip = {
                isHidden: true,
                isVisible: false,
                eyedropperColor: null,
                tipInterval: null,
                isTipVisible: false
            };

            me.userTooltip = true;
            me.wrapEvents = {
                userTipMousover: _.bind(me.userTipMousover, me),
                userTipMousout: _.bind(me.userTipMousout, me),
                onKeyUp: _.bind(me.onKeyUp, me)
            };

            me.guideTip = { ttHeight: 20 };
            // Hotkeys
            // ---------------------
            var keymap = {};
            me.hkComments = Common.Utils.isMac ? 'command+alt+a' : 'alt+h';
            keymap[me.hkComments] = function() {
                if (me.api.can_AddQuotedComment()!==false && me.documentHolder.slidesCount>0) {
                    me.addComment();
                }
                return false;
            };

            me.hkPreview = Common.Utils.isMac ? 'command+shift+enter' : 'ctrl+f5';
            keymap[me.hkPreview] = function(e) {
                var isResized = false;
                e.preventDefault();
                e.stopPropagation();
                if (me.documentHolder.slidesCount>0) {
                    Common.NotificationCenter.trigger('preview:start', 0);
                }
            };
            Common.util.Shortcuts.delegateShortcuts({shortcuts:keymap});

            Common.Utils.InternalSettings.set('pe-equation-toolbar-hide', Common.localStorage.getBool('pe-equation-toolbar-hide'));
        },

        onLaunch: function() {
            this.documentHolder = this.createView('DocumentHolder').render();
            this.documentHolder.el.tabIndex = -1;
            this.onAfterRender();

            var me = this;
            Common.NotificationCenter.on({
                'window:show': function(e){
                    me.hideScreenTip();
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
                    me.hideScreenTip();
                    /** coauthoring begin **/
                    me.userTipHide();
                    /** coauthoring end **/
                    me.hideTips();
                    me.hideEyedropper();
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
            Common.NotificationCenter.on('script:loaded', _.bind(me.createPostLoadElements, me));
        },

        setApi: function(api) {
            this.api = api;

            var me = this;
            if (me.api) {
                me.api.asc_registerCallback('asc_onCountPages',         _.bind(me.onApiCountPages, me));
                me.api.asc_registerCallback('asc_onStartDemonstration',     _.bind(me.onApiStartDemonstration, me));
                me.api.asc_registerCallback('asc_onCoAuthoringDisconnect',  _.bind(me.onCoAuthoringDisconnect, me));
                Common.NotificationCenter.on('api:disconnect',              _.bind(me.onCoAuthoringDisconnect, me));
                me.api.asc_registerCallback('asc_onTextLanguage',           _.bind(me.onTextLanguage, me));
                me.api.asc_registerCallback('asc_onUpdateThemeIndex',       _.bind(me.onApiUpdateThemeIndex, me));
                me.api.asc_registerCallback('asc_onLockDocumentTheme',      _.bind(me.onApiLockDocumentTheme, me));
                me.api.asc_registerCallback('asc_onUnLockDocumentTheme',    _.bind(me.onApiUnLockDocumentTheme, me));
                me.documentHolder.slidesCount = me.api.getCountPages();
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
                        else {
                            if (e.target.getAttribute && e.target.getAttribute("oo_no_focused"))
                                return;
                            meEl.focus();
                        }
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

        createPostLoadElements: function() {
            var me = this;
            me.setEvents();
            me.mode.isEdit ? me.getView().createDelayedElements() : me.getView().createDelayedElementsViewer();

            if (!me.mode.isEdit) {
                return;
            }

            me.initExternalEditors();
            me.showMathTrackOnLoad && me.onShowMathTrack(me.lastMathTrackBounds);
            me.documentHolder && me.documentHolder.setLanguages();
        },

        createDelayedElements: function(view, type) {},

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
                } else {
                    value && (value.guide = {guideId: event.get_Guide()});
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

                if (event.get_Type() == Asc.c_oAscContextMenuTypes.AnimEffect) {
                    if (event.get_ButtonWidth()) {
                        showPoint[0] += event.get_ButtonWidth() + 2;
                        showPoint[1] += event.get_ButtonHeight() + 2;
                        menu.menuAlign = 'tr-br';
                        if (Common.Utils.getOffset(me.documentHolder.cmpEl).top + showPoint[1] + menu.menuRoot.outerHeight() > Common.Utils.innerHeight() - 10) {
                            showPoint[1] -= event.get_ButtonHeight() + 4;
                            menu.menuAlign = 'br-tr';
                        }
                    } else {
                        menu.menuAlign = 'tl-tr';
                    }
                    me.hideScreenTip();
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

        fillMenuProps: function(selectedElements) {},

        fillViewMenuProps: function(selectedElements) {},

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
                } else if (event.get_Type() == Asc.c_oAscContextMenuTypes.AnimEffect) {
                    me.showPopupMenu.call(me, me.documentHolder.animEffectMenu, {effect: event.get_EffectStartType()}, event);
                } else if (event.get_Type() == Asc.c_oAscContextMenuTypes.Master) {
                    me.showPopupMenu.call(me, me.documentHolder.slideMasterMenu, {isMaster: true, isPreserve: event.get_IsSlidePreserve() }, event);
                } else if (event.get_Type() == Asc.c_oAscContextMenuTypes.Layout) {
                    me.showPopupMenu.call(me, me.documentHolder.slideMasterMenu, {isMaster: false}, event);
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

            if (this.mode && this.mode.isEdit) {
                var i = -1,
                    in_equation = false,
                    in_chart = false,
                    locked = false;
                while (++i < selectedElements.length) {
                    var type = selectedElements[i].get_ObjectType();
                    if (type === Asc.c_oAscTypeSelectElement.Math) {
                        in_equation = true;
                    } else if (type === Asc.c_oAscTypeSelectElement.Slide) {
                        var value = selectedElements[i].get_ObjectValue();
                        value && (locked = locked || value.get_LockDelete());
                    } else if (type === Asc.c_oAscTypeSelectElement.Paragraph) {
                        var value = selectedElements[i].get_ObjectValue();
                        value && (locked = locked || value.get_Locked());
                    } else if (type === Asc.c_oAscTypeSelectElement.Chart) {
                        in_chart = true;
                        var value = selectedElements[i].get_ObjectValue();
                        value && (locked = locked || value.get_Locked());
                    }
                }
                if (in_equation) {
                    this._state.equationLocked = locked;
                    this.disableEquationBar();
                }
                if (in_chart) {
                    this._state.chartLocked = locked;
                    this.disableChartElementButton();
                }
            }
        },

        handleDocumentWheel: function(event){
            var me = this;
            if (!me.api) return;

            if (!me._isScrolling) {
                me._isScrolling = true;
                me._ctrlPressedAtScrollStart = event.ctrlKey;
            }

            clearTimeout(me._scrollEndTimeout);
            me._scrollEndTimeout = setTimeout(function () {
                me._isScrolling = false;
            }, 100);

            var delta = (_.isUndefined(event.originalEvent)) ? event.wheelDelta : event.originalEvent.wheelDelta;
            if (_.isUndefined(delta)) {
                delta = event.deltaY;
            }

            if (me._ctrlPressedAtScrollStart && !event.altKey) {
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
                    } else if (key === Common.UI.Keys.ZERO || key === Common.UI.Keys.NUM_ZERO) {// 0
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

        hideScreenTip: function() {
            this.screenTip.toolTip.hide();
            this.screenTip.isVisible = false;
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
            if (this.screenTip.isHidden && this.screenTip.isVisible) {
                me.screenTip.isVisible = false;
                me.isTooltipHiding = true;
                me.screenTip.toolTip.hide(function(){
                    me.isTooltipHiding = false;
                    if (me.mouseMoveData) me.onMouseMove(me.mouseMoveData);
                    me.mouseMoveData = null;
                });
            }
            if (this.eyedropperTip.isHidden) {
                this.hideEyedropper();
            }
        },

        onMouseMove: function(moveData) {},
        
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

        onCoAuthoringDisconnect: function() {
            this.mode.isEdit = false;
        },

        changePosition: function() {
            var me = this,
                cmpEl = me.documentHolder.cmpEl;
            me._XY = [
                Common.Utils.getOffset(cmpEl).left - $(window).scrollLeft(),
                Common.Utils.getOffset(cmpEl).top  - $(window).scrollTop()
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

        onTextLanguage: function(langid) {
            this.documentHolder._currLang.id = langid;
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

        onKeyUp: function (e) {
            if (e.keyCode == Common.UI.Keys.CTRL && this._needShowSpecPasteMenu && !this._handleZoomWheel && !this.btnSpecialPaste.menu.isVisible() && /area_id/.test(e.target.id)) {
                $('button', this.btnSpecialPaste.cmpEl).click();
                e.preventDefault();
            }
            this._handleZoomWheel = false;
            this._needShowSpecPasteMenu = false;
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

        SetDisabled: function(state) {
            this._isDisabled = state;
            this.documentHolder.SetDisabled(state);
            this.disableEquationBar();
            this.disableSpecialPaste();
            this.disableChartElementButton();
        },

        clearSelection: function() {
            this.onHideMathTrack();
            this.onHideSpecialPasteOptions();
            this.onHideChartElementButton();
        },

        onHideMathTrack: function() {},

        onHideSpecialPasteOptions: function() {},

        onHideChartElementButton: function() {},

        disableEquationBar: function() {},

        disableSpecialPaste: function() {},

        disableChartElementButton: function() {},

        editComplete: function() {
            this.documentHolder && this.documentHolder.fireEvent('editcomplete', this.documentHolder);
        }

    },PE.Controllers.DocumentHolder || {}));
});