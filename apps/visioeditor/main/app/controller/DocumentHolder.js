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
 *  Created on 11/07/24
 *
 */

define([
    'core',
    'visioeditor/main/app/view/DocumentHolder'
], function () {
    'use strict';

    VE.Controllers.DocumentHolder = Backbone.Controller.extend({
        models: [],
        collections: [],
        views: [
            'DocumentHolder'
        ],

        initialize: function() {
            //
            this.addListeners({
                'DocumentHolder': {
                    'createdelayedelements': this.createDelayedElements
                }
            });

            var me = this;

            me._TtHeight        = 20;
            me._isDisabled = false;
            me._state = {};
            me.mode = {};
            me.mouseMoveData = null;
            me.isTooltipHiding = false;

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
                    me.mode && me.mode.isDesktopApp && me.api && me.api.asc_onShowPopupWindow();

                },
                'modal:show': function(e){
                },
                'layout:changed': function(e){
                    me.screenTip.toolTip.hide();
                    me.screenTip.isVisible = false;
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
                }
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',        _.bind(this.onCoAuthoringDisconnect, this));
                Common.NotificationCenter.on('api:disconnect',                      _.bind(this.onCoAuthoringDisconnect, this));

                this.api.asc_registerCallback('asc_onFocusObject',                  _.bind(this.onFocusObject, this));
                this.api.asc_registerCallback('onPluginContextMenu',                _.bind(this.onPluginContextMenu, this));

                this.documentHolder.setApi(this.api);
            }

            return this;
        },

        setMode: function(m) {
            this.mode = m;
            this.documentHolder.setMode(m);
        },

        createPostLoadElements: function() {
        },

        createDelayedElements: function(view, type) {
            var me = this,
                view = me.documentHolder;

            if (type==='view') {
                view.menuViewCopy.on('click', _.bind(me.onCutCopyPaste, me));
            } else if (type==='edit') {
                view.menuEditCopy.on('click', _.bind(me.onCutCopyPaste, me));
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
            var documentHolder = this.documentHolder;
            if (!documentHolder.viewModeMenu)
                documentHolder.createDelayedElementsViewer();

            var menu_props = {};
            return {menu_to_show: documentHolder.viewModeMenu, menu_props: menu_props};
        },

        fillEditMenuProps: function(selectedElements) {
            var documentHolder = this.documentHolder;
            if (!documentHolder.editModeMenu)
                documentHolder.createDelayedElementsEditor();

            if (!selectedElements || !_.isArray(selectedElements) || selectedElements.length<1)
                return {menu_to_show: documentHolder.editModeMenu, menu_props: {}};

            var me = this,
                menu_props = {},
                menu_to_show = null;
            return {menu_to_show: menu_to_show, menu_props: menu_props};
        },

        applyEditorMode: function() {
            if (this.mode && this.mode.isEdit && !this.documentHolder.editModeMenu) {
                this.documentHolder.createDelayedElementsEditor();
            }
        },

        showObjectMenu: function(event, docElement, eOpts){
            return; // no getSelectedElements

            var me = this;
            if (me.api){
                var obj = me.mode && me.mode.isEdit ? me.fillEditMenuProps(me.api.getSelectedElements()) : me.fillViewMenuProps(me.api.getSelectedElements());
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
                if (event.get_Type() == Asc.c_oAscContextMenuTypes.Thumbnails) {
                } else {
                    me.showObjectMenu.call(me, event);
                }
            },10);
        },

        onFocusObject: function(selectedElements) {
            var me = this,
                currentMenu = me.documentHolder.currentMenu;
            if (currentMenu && currentMenu.isVisible()){
                var obj = me.mode && me.mode.isEdit ? me.fillEditMenuProps(selectedElements) : me.fillViewMenuProps(selectedElements);
                if (obj) {
                    if (obj.menu_to_show===currentMenu) {
                        currentMenu.options.initMenu(obj.menu_props);
                        currentMenu.alignPosition();
                    }
                }
            }
            if (this.mode && this.mode.isEdit) {
            }
        },

        handleDocumentWheel: function(event) {
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
                } else if (delta > 0) {
                    me.api.zoomIn();
                }

                event.preventDefault();
                event.stopPropagation();
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

        onDocumentHolderResize: function(e){
            var me = this;
            me._XY          = undefined;
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

        onHyperlinkClick: function(url) {
            if (url) {
                var type = this.api.asc_getUrlType(url);
                if (type===AscCommon.c_oAscUrlType.Http || type===AscCommon.c_oAscUrlType.Email)
                    window.open(url);
                else {
                    var me = this;
                    setTimeout(function() {
                        Common.UI.warning({
                            maxwidth: 500,
                            msg: Common.Utils.String.format(this.txtWarnUrl, url),
                            buttons: ['no', 'yes'],
                            primary: 'no',
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

        onMouseMoveStart: function() {
            this.screenTip.isHidden = true;
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
        },

        onMouseMove: function(moveData) {
            var me = this,
                cmpEl = me.documentHolder.cmpEl,
                screenTip = me.screenTip;
            if (_.isUndefined(me._XY)) {
                me._XY = [
                    Common.Utils.getOffset(cmpEl).left - $(window).scrollLeft(),
                    Common.Utils.getOffset(cmpEl).top - $(window).scrollTop()
                ];
                me._Width       = cmpEl.width();
                me._Height      = cmpEl.height();
                me._BodyWidth   = $('body').width();
            }

            if (moveData) {
                var showPoint, ToolTip,
                    type = moveData.get_Type();

                if (type==Asc.c_oAscMouseMoveDataTypes.Hyperlink) {
                    if (me.isTooltipHiding) {
                        me.mouseMoveData = moveData;
                        return;
                    }

                    var hyperProps = moveData.get_Hyperlink();
                    if (!hyperProps) return;
                    ToolTip = (_.isEmpty(hyperProps.get_ToolTip())) ? hyperProps.get_Value() : hyperProps.get_ToolTip();
                    if (ToolTip.length>256)
                        ToolTip = ToolTip.substr(0, 256) + '...';

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
                    showPoint[1] -= screenTip.tipHeight;
                    if (showPoint[1]<0)
                        showPoint[1] = 0;
                    if (showPoint[0] + screenTip.tipWidth > me._BodyWidth )
                        showPoint[0] = me._BodyWidth - screenTip.tipWidth;
                    screenTip.toolTip.getBSTip().$tip.css({top: showPoint[1] + 'px', left: showPoint[0] + 'px'});
                }
            }
        },

        onCoAuthoringDisconnect: function() {
            this.mode.isEdit = false;
        },

        SetDisabled: function(state) {
            this._isDisabled = state;
            this.documentHolder.SetDisabled(state);
        },

        changePosition: function() {
            var me = this,
                cmpEl = me.documentHolder.cmpEl;
            me._XY = [
                Common.Utils.getOffset(cmpEl).left - $(window).scrollLeft(),
                Common.Utils.getOffset(cmpEl).top  - $(window).scrollTop()
            ];
            me._Height = cmpEl.height();
            me._Width = cmpEl.width();
            me._BodyWidth = $('body').width();
            me.onMouseMoveStart();
        },

        onCutCopyPaste: function(item, e) {
            var me = this;
            if (me.api) {
                var res =  (item.value == 'cut') ? me.api.Cut() : ((item.value == 'copy') ? me.api.Copy() : me.api.Paste());
                if (!res) {
                    if (!Common.localStorage.getBool("ve-hide-copywarning")) {
                        (new Common.Views.CopyWarningDialog({
                            handler: function(dontshow) {
                                if (dontshow) Common.localStorage.setItem("ve-hide-copywarning", 1);
                                me.editComplete();
                            }
                        })).show();
                    }
                }
            }
            me.editComplete();
        },

        onPluginContextMenu: function(data) {
            if (data && data.length>0 && this.documentHolder && this.documentHolder.currentMenu && this.documentHolder.currentMenu.isVisible()){
                this.documentHolder.updateCustomItems(this.documentHolder.currentMenu, data);
            }
        },

        editComplete: function() {
            this.documentHolder && this.documentHolder.fireEvent('editcomplete', this.documentHolder);
        },

        clearSelection: function() {
        }
    });
});