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
 *  DocumentHolder.js
 *
 *  DocumentHolder controller
 *
 *  Created by Alexander Yuzhin on 1/15/14
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

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

        createDelayedElements: function(view, type) {
            var me = this;

            me.documentHolder.menuPDFViewCopy.on('click', _.bind(me.onCutCopyPaste, me));
            me.documentHolder.menuAddComment.on('click', _.bind(me.addComment, me));
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
                me.api.onPluginContextMenuShow && me.api.onPluginContextMenuShow();
            }
        },

        fillViewMenuProps: function(selectedElements) {
            // if (!selectedElements || !_.isArray(selectedElements)) return;

            var documentHolder = this.documentHolder;
            if (!documentHolder.viewPDFModeMenu)
                documentHolder.createDelayedElementsPDFViewer();
            return {menu_to_show: documentHolder.viewPDFModeMenu, menu_props: {}};
        },

        showObjectMenu: function(event, docElement, eOpts){
            var me = this;
            if (me.api){
                var obj = me.fillViewMenuProps();
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
                me.showObjectMenu.call(me, event);
            },10);
        },

        onFocusObject: function(selectedElements) {
            var me = this,
                currentMenu = me.documentHolder.currentMenu;
            if (currentMenu && currentMenu.isVisible()){
                var obj = me.fillViewMenuProps(selectedElements);
                if (obj) {
                    if (obj.menu_to_show===currentMenu) {
                        currentMenu.options.initMenu(obj.menu_props);
                        currentMenu.alignPosition();
                    }
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
                    if (!Common.UI.HintManager.isHintVisible())
                        Common.NotificationCenter.trigger('leftmenu:change', 'hide');
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

                if (type==Asc.c_oAscMouseMoveDataTypes.Hyperlink || type==Asc.c_oAscMouseMoveDataTypes.Eyedropper) {
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
                }
            }
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
            }
            me.editComplete();
        },

        onUndo: function () {
            this.api.Undo();
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

        onShowFormsPDFActions: function(obj, x, y) {
            switch (obj.type) {
                case AscPDF.FIELD_TYPES.combobox:
                    this.onShowListActionsPDF(obj, x, y);
                    break;
            }
        },

        onShowListActionsPDF: function(obj) {
            var isForm = true,
                cmpEl = this.documentHolder.cmpEl,
                menu = this.listControlMenu,
                menuContainer = menu ? cmpEl.find(Common.Utils.String.format('#menu-container-{0}', menu.id)) : null,
                me = this;

            me._listObj = obj;
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
                    me.listControlMenu.removeAll();
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

        editComplete: function() {
            this.documentHolder && this.documentHolder.fireEvent('editcomplete', this.documentHolder);
        }
    });
});