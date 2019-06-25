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
 *  DocumentHolder view
 *
 *  Created by Alexander Yuzhin on 1/11/14
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'jquery',
    'underscore',
    'backbone',
    'gateway',
    'common/main/lib/util/utils',
    'common/main/lib/component/Menu',
    'common/main/lib/view/InsertTableDialog',
    'common/main/lib/view/CopyWarningDialog',
    'documenteditor/main/app/view/DropcapSettingsAdvanced',
    'documenteditor/main/app/view/HyperlinkSettingsDialog',
    'documenteditor/main/app/view/ParagraphSettingsAdvanced',
    'documenteditor/main/app/view/TableSettingsAdvanced',
    'documenteditor/main/app/view/ControlSettingsDialog',
    'documenteditor/main/app/view/NumberingValueDialog'
], function ($, _, Backbone, gateway) { 'use strict';

    DE.Views.DocumentHolder =  Backbone.View.extend(_.extend({
        el: '#editor_sdk',

        // Compile our stats template
        template: null,

        // Delegated events for creating new items, and clearing completed ones.
        events: {
        },

        initialize: function () {
            var me = this;

            /** coauthoring begin **/
            var usersStore = DE.getCollection('Common.Collections.Users');
            /** coauthoring end **/

            me._TtHeight        = 20;
            me._currentSpellObj = undefined;
            me._currLang        = {};
            me.usertips = [];
            me.fastcoauthtips = [];
            me._currentMathObj = undefined;
            me._currentParaObjDisabled = false;
            me._isDisabled = false;

            var showPopupMenu = function(menu, value, event, docElement, eOpts){
                if (!_.isUndefined(menu)  && menu !== null){
                    Common.UI.Menu.Manager.hideAll();

                    var showPoint = [event.get_X(), event.get_Y()],
                        menuContainer = $(me.el).find(Common.Utils.String.format('#menu-container-{0}', menu.id));

                    if (!menu.rendered) {
                        // Prepare menu container
                        if (menuContainer.length < 1) {
                            menuContainer = $(Common.Utils.String.format('<div id="menu-container-{0}" style="position: absolute; z-index: 10000;"><div class="dropdown-toggle" data-toggle="dropdown"></div></div>', menu.id));
                            $(me.el).append(menuContainer);
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

                    me.currentMenu = menu;
                }
            };

            var fillMenuProps = function(selectedElements) {
                if (!selectedElements || !_.isArray(selectedElements)) return;
                var menu_props = {},
                    menu_to_show = me.textMenu,
                    noobject = true;
                for (var i = 0; i <selectedElements.length; i++) {
                    var elType = selectedElements[i].get_ObjectType();
                    var elValue = selectedElements[i].get_ObjectValue();
                    if (Asc.c_oAscTypeSelectElement.Image == elType) {
                        //image
                        menu_to_show = me.pictureMenu;
                        if (menu_props.imgProps===undefined)
                            menu_props.imgProps = {};
                        var shapeprops = elValue.get_ShapeProperties();
                        var chartprops = elValue.get_ChartProperties();
                        if (shapeprops) {
                            if (shapeprops.get_FromChart())
                                menu_props.imgProps.isChart = true;
                            else if (shapeprops.get_FromImage())
                                menu_props.imgProps.isOnlyImg = true;
                            else
                                menu_props.imgProps.isShape = true;
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
                        menu_to_show = me.tableMenu;
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
                            menu_to_show = me.textMenu;
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
                        me._currentSpellObj = elValue;
                    } else if (Asc.c_oAscTypeSelectElement.Math == elType) {
                        menu_props.mathProps = {};
                        menu_props.mathProps.value = elValue;
                        me._currentMathObj = elValue;
                    }
                }
                return (!noobject) ? {menu_to_show: menu_to_show, menu_props: menu_props} : null;
            };

            var fillViewMenuProps = function(selectedElements) {
                if (!selectedElements || !_.isArray(selectedElements)) return;

                if (!me.viewModeMenu)
                    me.createDelayedElementsViewer();
                var menu_props = {},
                    menu_to_show = me.viewModeMenu,
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
                    }
                }
                return (!noobject) ? {menu_to_show: menu_to_show, menu_props: menu_props} : null;
            };

            var showObjectMenu = function(event, docElement, eOpts){
                if (me.api){
                    var obj = (me.mode.isEdit && !me._isDisabled) ? fillMenuProps(me.api.getSelectedElements()) : fillViewMenuProps(me.api.getSelectedElements());
                    if (obj) showPopupMenu(obj.menu_to_show, obj.menu_props, event, docElement, eOpts);
                }
            };

            var onContextMenu = function(event){
                _.delay(function(){
                    if (event.get_Type() == 0) {
                        showObjectMenu.call(me, event);
                    } else {
                        showPopupMenu.call(me, me.hdrMenu, {Header: event.is_Header(), PageNum: event.get_PageNum()}, event);
                    }
                },10);
            };

            var onFocusObject = function(selectedElements) {
                if (me.currentMenu && me.currentMenu.isVisible() && me.currentMenu !== me.hdrMenu){
                    var obj = (me.mode.isEdit && !me._isDisabled) ? fillMenuProps(selectedElements) : fillViewMenuProps(selectedElements);
                    if (obj) {
                        if (obj.menu_to_show===me.currentMenu) {
                            me.currentMenu.options.initMenu(obj.menu_props);
                            me.currentMenu.alignPosition();
                        }
                    }
                }
            };
            
            var handleDocumentWheel = function(event) {
                if (me.api) {
                    var delta = (_.isUndefined(event.originalEvent)) ? event.wheelDelta : event.originalEvent.wheelDelta;
                    if (_.isUndefined(delta)) {
                        delta = event.deltaY;
                    }

                    if ((event.ctrlKey || event.metaKey) && !event.altKey) {
                        if (delta < 0) {
                            me.api.zoomOut();
                        } else if (delta > 0) {
                            me.api.zoomIn();
                        }

                        event.preventDefault();
                        event.stopPropagation();
                    }
                }
            };

            var handleDocumentKeyDown = function(event){
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
                        }
                    }
                    if (me.currentMenu && me.currentMenu.isVisible()) {
                        if (key == Common.UI.Keys.UP ||
                            key == Common.UI.Keys.DOWN) {
                            $('ul.dropdown-menu', me.currentMenu.el).focus();
                        }
                    }

                    if (key == Common.UI.Keys.ESC) {
                        Common.UI.Menu.Manager.hideAll();
                        Common.NotificationCenter.trigger('leftmenu:change', 'hide');
                    }
                }
            };

            var onDocumentHolderResize = function(e){
                me._XY = [
                    me.cmpEl.offset().left - $(window).scrollLeft(),
                    me.cmpEl.offset().top - $(window).scrollTop()
                ];
                me._Height = me.cmpEl.height();
                me._BodyWidth = $('body').width();
            };

            var onAfterRender = function(ct){
                var meEl = me.cmpEl;
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
                    addEvent(me.el, eventname, handleDocumentWheel);
                }

                $(document).on('mousewheel', handleDocumentWheel);
                $(document).on('keydown', handleDocumentKeyDown);

                $(window).on('resize', onDocumentHolderResize);
                var viewport = DE.getController('Viewport').getView('Viewport');
                viewport.hlayout.on('layout:resizedrag', onDocumentHolderResize);
            };

            /** coauthoring begin **/
            var getUserName = function(id){
                if (usersStore){
                    var rec = usersStore.findUser(id);
                    if (rec)
                        return rec.get('username');
                }
                return me.guestText;
            };
            /** coauthoring end **/


            var screenTip = {
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

            /** coauthoring begin **/
            var userTooltip = true;

            var userTipMousover = function (evt, el, opt) {
                if (userTooltip===true) {
                    userTooltip = new Common.UI.Tooltip({
                        owner: evt.currentTarget,
                        title: me.tipIsLocked
                    });

                    userTooltip.show();
                }
            };

            var userTipHide = function () {
                if (typeof userTooltip == 'object') {
                    userTooltip.hide();
                    userTooltip = undefined;

                    for (var i=0; i<me.usertips.length; i++) {
                        me.usertips[i].off('mouseover', userTipMousover);
                        me.usertips[i].off('mouseout', userTipMousout);
                    }
                }
            };

            var userTipMousout = function (evt, el, opt) {
                if (typeof userTooltip == 'object') {
                    if (userTooltip.$element && evt.currentTarget === userTooltip.$element[0]) {
                        userTipHide();
                    }
                }
            };

            /** coauthoring end **/

            Common.NotificationCenter.on({
                'window:show': function(e){
                    screenTip.toolTip.hide();
                    screenTip.isVisible = false;
                    /** coauthoring begin **/
                    userTipHide();
                    /** coauthoring end **/
                },
                'modal:show': function(e){
                    me.hideTips();
                },
                'layout:changed': function(e){
                    screenTip.toolTip.hide();
                    screenTip.isVisible = false;
                    /** coauthoring begin **/
                    userTipHide();
                    /** coauthoring end **/
                    me.hideTips();
                    onDocumentHolderResize();
                }
            });

            var onHyperlinkClick = function(url) {
                if (url && me.api.asc_getUrlType(url)>0) {
                    window.open(url);
                }
            };

            var onMouseMoveStart = function() {
                screenTip.isHidden = true;
                /** coauthoring begin **/
                if (me.usertips.length>0) {
                    if (typeof userTooltip == 'object') {
                        userTooltip.hide();
                        userTooltip = true;
                    }
                    _.each(me.usertips, function(item) {
                        item.remove();
                    });
                }
                me.usertips = [];
                me.usertipcount = 0;
                /** coauthoring end **/
            };

            var mouseMoveData = null,
                isTooltipHiding = false;

            var onMouseMoveEnd = function() {
                if (screenTip.isHidden && screenTip.isVisible) {
                    screenTip.isVisible = false;
                    isTooltipHiding = true;
                    screenTip.toolTip.hide(function(){
                        isTooltipHiding = false;
                        if (mouseMoveData) onMouseMove(mouseMoveData);
                        mouseMoveData = null;
                    });
                }
            };

            var onMouseMove = function(moveData) {
                if (me._XY === undefined) {
                    me._XY = [
                        me.cmpEl.offset().left - $(window).scrollLeft(),
                        me.cmpEl.offset().top - $(window).scrollTop()
                    ];
                    me._Height = me.cmpEl.height();
                    me._BodyWidth = $('body').width();
                }

                if (moveData) {
                    var showPoint, ToolTip,
                        type = moveData.get_Type();

                    if (type==1 || type==3) { // 1 - hyperlink, 3 - footnote
                        if (isTooltipHiding) {
                            mouseMoveData = moveData;
                            return;
                        }

                        if (type==1) {
                            var hyperProps = moveData.get_Hyperlink();
                            if (!hyperProps) return;
                            ToolTip = (_.isEmpty(hyperProps.get_ToolTip())) ? hyperProps.get_Value() : hyperProps.get_ToolTip();
                        } else {
                            ToolTip = moveData.get_FootnoteText();
                            if (ToolTip.length>1000)
                                ToolTip = ToolTip.substr(0, 1000) + '...';
                        }

                        var recalc = false;
                        screenTip.isHidden = false;

                        ToolTip = Common.Utils.String.htmlEncode(ToolTip);

                        if (screenTip.tipType !== type || screenTip.tipLength !== ToolTip.length || screenTip.strTip.indexOf(ToolTip)<0 ) {
                            screenTip.toolTip.setTitle((type==1) ? (ToolTip + '<br><b>' + me.txtPressLink + '</b>') : ToolTip);
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
                    else if (moveData.get_Type()==2 && me.mode.isEdit) { // 2 - locked object
                        var src;
                        if (me.usertipcount >= me.usertips.length) {
                            src = $(document.createElement("div"));
                            src.addClass('username-tip');
                            src.css({height: me._TtHeight + 'px', position: 'absolute', zIndex: '900', visibility: 'visible'});
                            $(document.body).append(src);
                            if (userTooltip) {
                                src.on('mouseover', userTipMousover);
                                src.on('mouseout', userTipMousout);
                            }

                            me.usertips.push(src);
                        }
                        src = me.usertips[me.usertipcount];
                        me.usertipcount++;

                        ToolTip = getUserName(moveData.get_UserId());

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
            };

            var onShowForeignCursorLabel = function(UserId, X, Y, color) {
                /** coauthoring begin **/
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
                    src.text(getUserName(UserId));
                    $('#id_main_view').append(src);
                    me.fastcoauthtips.push(src);
                    src.fadeIn(150);
                }
                src.css({top: (Y-me._TtHeight) + 'px', left: X + 'px'});
                /** coauthoring end **/
            };

            var onHideForeignCursorLabel = function(UserId) {
                /** coauthoring begin **/
                for (var i=0; i<me.fastcoauthtips.length; i++) {
                    if (me.fastcoauthtips[i].attr('userid') == UserId) {
                        var src = me.fastcoauthtips[i];
                        me.fastcoauthtips[i].fadeOut(150, function(){src.remove()});
                        me.fastcoauthtips.splice(i, 1);
                        break;
                    }
                }
                /** coauthoring end **/
            };

            var onShowSpecialPasteOptions = function(specialPasteShowOptions) {
                var coord  = specialPasteShowOptions.asc_getCellCoord(),
                    pasteContainer = me.cmpEl.find('#special-paste-container'),
                    pasteItems = specialPasteShowOptions.asc_getOptions();
                if (!pasteItems) return;

                // Prepare menu container
                if (pasteContainer.length < 1) {
                    me._arrSpecialPaste = [];
                    me._arrSpecialPaste[Asc.c_oSpecialPasteProps.paste] = me.textPaste;
                    me._arrSpecialPaste[Asc.c_oSpecialPasteProps.sourceformatting] = me.txtPasteSourceFormat;
                    me._arrSpecialPaste[Asc.c_oSpecialPasteProps.keepTextOnly] = me.txtKeepTextOnly;
                    me._arrSpecialPaste[Asc.c_oSpecialPasteProps.insertAsNestedTable] = me.textNest;
                    me._arrSpecialPaste[Asc.c_oSpecialPasteProps.overwriteCells] = me.txtOverwriteCells;

                    pasteContainer = $('<div id="special-paste-container" style="position: absolute;"><div id="id-document-holder-btn-special-paste"></div></div>');
                    me.cmpEl.append(pasteContainer);

                    me.btnSpecialPaste = new Common.UI.Button({
                        cls         : 'btn-toolbar',
                        iconCls     : 'btn-paste',
                        menu        : new Common.UI.Menu({items: []})
                    });
                    me.btnSpecialPaste.render($('#id-document-holder-btn-special-paste')) ;
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
                            caption: me._arrSpecialPaste[menuItem],
                            value: menuItem,
                            checkable: true,
                            toggleGroup : 'specialPasteGroup'
                        }).on('click', function(item, e) {
                            me.api.asc_SpecialPaste(item.value);
                            setTimeout(function(){menu.hide();}, 100);
                        });
                        menu.addItem(mnu);
                    });
                    (menu.items.length>0) && menu.items[0].setChecked(true, true);
                }
                if (coord.asc_getX()<0 || coord.asc_getY()<0) {
                    if (pasteContainer.is(':visible')) pasteContainer.hide();
                } else {
                    var showPoint = [coord.asc_getX() + coord.asc_getWidth() + 3, coord.asc_getY() + coord.asc_getHeight() + 3];
                    pasteContainer.css({left: showPoint[0], top : showPoint[1]});
                    pasteContainer.show();
                }
            };

            var onHideSpecialPasteOptions = function() {
                var pasteContainer = me.cmpEl.find('#special-paste-container');
                if (pasteContainer.is(':visible'))
                    pasteContainer.hide();
            };

            var onDialogAddHyperlink = function() {
                var win, props, text;
                if (me.api && me.mode.isEdit && !me._isDisabled && !DE.getController('LeftMenu').leftMenu.menuFile.isVisible()){
                    var handlerDlg = function(dlg, result) {
                        if (result == 'ok') {
                            props = dlg.getSettings();
                            (text!==false)
                                ? me.api.add_Hyperlink(props)
                                : me.api.change_Hyperlink(props);
                        }

                        me.fireEvent('editcomplete', me);
                    };

                    text = me.api.can_AddHyperlink();

                    if (text !== false) {
                        win = new DE.Views.HyperlinkSettingsDialog({
                            api: me.api,
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
                                handler: handlerDlg
                            });
                            win.show();
                            win.setSettings(props);
                        }
                    }
                    Common.component.Analytics.trackEvent('DocumentHolder', 'Add Hyperlink');
                }
            };

            var onDoubleClickOnChart = function(chart) {
                if (me.mode.isEdit && !me._isDisabled) {
                    var diagramEditor = DE.getController('Common.Controllers.ExternalDiagramEditor').getView('Common.Views.ExternalDiagramEditor');
                    if (diagramEditor && chart) {
                        diagramEditor.setEditMode(true);
                        diagramEditor.show();
                        diagramEditor.setChartData(new Asc.asc_CChartBinary(chart));
                    }
                }
            };

            var onCoAuthoringDisconnect= function() {
                me.mode.isEdit = false;
            };

            var onTextLanguage = function(langid) {
                me._currLang.id = langid;
            };

            this.changeLanguageMenu = function(menu) {
                var i;
                if (me._currLang.id===null || me._currLang.id===undefined) {
                    for (i=0; i<menu.items.length; i++)
                        menu.items[i].setChecked(false);
                    menu.currentCheckedItem = undefined;
                } else {
                    for (i=0; i<menu.items.length; i++) {
                        if (menu.items[i].options.langid === me._currLang.id) {
                            menu.currentCheckedItem = menu.items[i];
                            if (!menu.items[i].checked)
                                menu.items[i].setChecked(true);
                            break;
                        } else if (menu.items[i].checked)
                            menu.items[i].setChecked(false);
                    }
                }
            };

            var onSpellCheckVariantsFound = function() {
                var selectedElements = me.api.getSelectedElements(true);
                var props;
                if (selectedElements && _.isArray(selectedElements)){
                    for (var i = 0; i <selectedElements.length; i++) {
                        if ( selectedElements[i].get_ObjectType() == Asc.c_oAscTypeSelectElement.SpellCheck) {
                            props = selectedElements[i].get_ObjectValue();
                            me._currentSpellObj = props;
                            break;
                        }
                    }
                }
                if (props && props.get_Checked()===false && props.get_Variants() !== null && props.get_Variants() !== undefined) {
                    me.addWordVariants();
                    if (me.textMenu && me.textMenu.isVisible()) {
                        me.textMenu.alignPosition();
                    }
                }
            };

            this.addWordVariants = function(isParagraph) {
                if (!me.textMenu) return;

                if (_.isUndefined(isParagraph)) {
                    isParagraph = me.textMenu.isVisible();
                }

                me.clearWordVariants(isParagraph);

                var moreMenu  = (isParagraph) ? me.menuSpellMorePara : me.menuSpellMoreTable;
                var spellMenu = (isParagraph) ? me.menuSpellPara : me.menuSpellTable;
                var arr = [],
                    arrMore = [];
                var variants = me._currentSpellObj.get_Variants();

                if (variants.length > 0) {
                    moreMenu.setVisible(variants.length > 3);
                    moreMenu.setDisabled(me._currentParaObjDisabled);

                    _.each(variants, function(variant, index) {
                        var mnu = new Common.UI.MenuItem({
                            caption     : variant,
                            spellword   : true,
                            disabled    : me._currentParaObjDisabled
                        }).on('click', function(item, e) {
                            if (me.api) {
                                me.api.asc_replaceMisspelledWord(item.caption, me._currentSpellObj);
                                me.fireEvent('editcomplete', me);
                            }
                        });

                        (index < 3) ? arr.push(mnu) : arrMore.push(mnu);
                    });

                    if (arr.length > 0) {
                        if (isParagraph) {
                            _.each(arr, function(variant, index){
                                me.textMenu.insertItem(index, variant);
                            })
                        } else {
                            _.each(arr, function(variant, index){
                                me.menuSpellCheckTable.menu.insertItem(index, variant);
                            })
                        }
                    }

                    if (arrMore.length > 0) {
                        _.each(arrMore, function(variant, index){
                            moreMenu.menu.addItem(variant);
                        });
                    }

                    spellMenu.setVisible(false);
                } else {
                    moreMenu.setVisible(false);
                    spellMenu.setVisible(true);
                    spellMenu.setCaption(me.noSpellVariantsText, true);
                }
            };

            this.clearWordVariants  = function(isParagraph) {
                var spellMenu = (isParagraph) ? me.textMenu : me.menuSpellCheckTable.menu;

                for (var i = 0; i < spellMenu.items.length; i++) {
                    if (spellMenu.items[i].options.spellword) {
                        if (spellMenu.checkeditem == spellMenu.items[i]) {
                            spellMenu.checkeditem = undefined;
                            spellMenu.activeItem  = undefined;
                        }

                        spellMenu.removeItem(spellMenu.items[i]);
                        i--;
                    }
                }
                (isParagraph) ? me.menuSpellMorePara.menu.removeAll() : me.menuSpellMoreTable.menu.removeAll();

                me.menuSpellMorePara.menu.checkeditem   = undefined;
                me.menuSpellMorePara.menu.activeItem    = undefined;
                me.menuSpellMoreTable.menu.checkeditem  = undefined;
                me.menuSpellMoreTable.menu.activeItem   = undefined;
            };

            this.initEquationMenu = function() {
                if (!me._currentMathObj) return;
                var type = me._currentMathObj.get_Type(),
                    value = me._currentMathObj,
                    mnu, arr = [];

                switch (type) {
                    case Asc.c_oAscMathInterfaceType.Accent:
                        mnu = new Common.UI.MenuItem({
                            caption     : me.txtRemoveAccentChar,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'remove_AccentCharacter'}
                        });
                        arr.push(mnu);
                        break;
                    case Asc.c_oAscMathInterfaceType.BorderBox:
                        mnu = new Common.UI.MenuItem({
                            caption     : me.txtBorderProps,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            menu        : new Common.UI.Menu({
                                menuAlign: 'tl-tr',
                                items   : [
                                    {
                                        caption: value.get_HideTop() ? me.txtAddTop : me.txtHideTop,
                                        equationProps: {type: type, callback: 'put_HideTop', value: !value.get_HideTop()}
                                    },
                                    {
                                        caption: value.get_HideBottom() ? me.txtAddBottom : me.txtHideBottom,
                                        equationProps: {type: type, callback: 'put_HideBottom', value: !value.get_HideBottom()}
                                    },
                                    {
                                        caption: value.get_HideLeft() ? me.txtAddLeft : me.txtHideLeft,
                                        equationProps: {type: type, callback: 'put_HideLeft', value: !value.get_HideLeft()}
                                    },
                                    {
                                        caption: value.get_HideRight() ? me.txtAddRight : me.txtHideRight,
                                        equationProps: {type: type, callback: 'put_HideRight', value: !value.get_HideRight()}
                                    },
                                    {
                                        caption: value.get_HideHor() ? me.txtAddHor : me.txtHideHor,
                                        equationProps: {type: type, callback: 'put_HideHor', value: !value.get_HideHor()}
                                    },
                                    {
                                        caption: value.get_HideVer() ? me.txtAddVer : me.txtHideVer,
                                        equationProps: {type: type, callback: 'put_HideVer', value: !value.get_HideVer()}
                                    },
                                    {
                                        caption: value.get_HideTopLTR() ? me.txtAddLT : me.txtHideLT,
                                        equationProps: {type: type, callback: 'put_HideTopLTR', value: !value.get_HideTopLTR()}
                                    },
                                    {
                                        caption: value.get_HideTopRTL() ? me.txtAddLB : me.txtHideLB,
                                        equationProps: {type: type, callback: 'put_HideTopRTL', value: !value.get_HideTopRTL()}
                                    }
                                ]
                            })
                        });
                        arr.push(mnu);
                        break;
                    case Asc.c_oAscMathInterfaceType.Bar:
                        mnu = new Common.UI.MenuItem({
                            caption     : me.txtRemoveBar,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'remove_Bar'}
                        });
                        arr.push(mnu);
                        mnu = new Common.UI.MenuItem({
                            caption     : (value.get_Pos()==Asc.c_oAscMathInterfaceBarPos.Top) ? me.txtUnderbar : me.txtOverbar,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'put_Pos', value: (value.get_Pos()==Asc.c_oAscMathInterfaceBarPos.Top) ? Asc.c_oAscMathInterfaceBarPos.Bottom : Asc.c_oAscMathInterfaceBarPos.Top}
                        });
                        arr.push(mnu);
                        break;
                    case Asc.c_oAscMathInterfaceType.Script:
                        var scripttype = value.get_ScriptType();
                        if (scripttype == Asc.c_oAscMathInterfaceScript.PreSubSup) {
                            mnu = new Common.UI.MenuItem({
                                caption     : me.txtScriptsAfter,
                                equation    : true,
                                disabled    : me._currentParaObjDisabled,
                                equationProps: {type: type, callback: 'put_ScriptType', value: Asc.c_oAscMathInterfaceScript.SubSup}
                            });
                            arr.push(mnu);
                            mnu = new Common.UI.MenuItem({
                                caption     : me.txtRemScripts,
                                equation    : true,
                                disabled    : me._currentParaObjDisabled,
                                equationProps: {type: type, callback: 'put_ScriptType', value: Asc.c_oAscMathInterfaceScript.None}
                            });
                            arr.push(mnu);
                        } else {
                            if (scripttype == Asc.c_oAscMathInterfaceScript.SubSup) {
                                mnu = new Common.UI.MenuItem({
                                    caption     : me.txtScriptsBefore,
                                    equation    : true,
                                    disabled    : me._currentParaObjDisabled,
                                    equationProps: {type: type, callback: 'put_ScriptType', value: Asc.c_oAscMathInterfaceScript.PreSubSup}
                                });
                                arr.push(mnu);
                            }
                            if (scripttype == Asc.c_oAscMathInterfaceScript.SubSup || scripttype == Asc.c_oAscMathInterfaceScript.Sub ) {
                                mnu = new Common.UI.MenuItem({
                                    caption     : me.txtRemSubscript,
                                    equation    : true,
                                    disabled    : me._currentParaObjDisabled,
                                    equationProps: {type: type, callback: 'put_ScriptType', value: (scripttype == Asc.c_oAscMathInterfaceScript.SubSup) ? Asc.c_oAscMathInterfaceScript.Sup : Asc.c_oAscMathInterfaceScript.None }
                                });
                                arr.push(mnu);
                            }
                            if (scripttype == Asc.c_oAscMathInterfaceScript.SubSup || scripttype == Asc.c_oAscMathInterfaceScript.Sup ) {
                                mnu = new Common.UI.MenuItem({
                                    caption     : me.txtRemSuperscript,
                                    equation    : true,
                                    disabled    : me._currentParaObjDisabled,
                                    equationProps: {type: type, callback: 'put_ScriptType', value: (scripttype == Asc.c_oAscMathInterfaceScript.SubSup) ? Asc.c_oAscMathInterfaceScript.Sub : Asc.c_oAscMathInterfaceScript.None }
                                });
                                arr.push(mnu);
                            }
                        }
                        break;
                    case Asc.c_oAscMathInterfaceType.Fraction:
                        var fraction = value.get_FractionType();
                        if (fraction==Asc.c_oAscMathInterfaceFraction.Skewed || fraction==Asc.c_oAscMathInterfaceFraction.Linear) {
                            mnu = new Common.UI.MenuItem({
                                caption     : me.txtFractionStacked,
                                equation    : true,
                                disabled    : me._currentParaObjDisabled,
                                equationProps: {type: type, callback: 'put_FractionType', value: Asc.c_oAscMathInterfaceFraction.Bar}
                            });
                            arr.push(mnu);
                        }
                        if (fraction==Asc.c_oAscMathInterfaceFraction.Bar || fraction==Asc.c_oAscMathInterfaceFraction.Linear) {
                            mnu = new Common.UI.MenuItem({
                                caption     : me.txtFractionSkewed,
                                equation    : true,
                                disabled    : me._currentParaObjDisabled,
                                equationProps: {type: type, callback: 'put_FractionType', value: Asc.c_oAscMathInterfaceFraction.Skewed}
                            });
                            arr.push(mnu);
                        }
                        if (fraction==Asc.c_oAscMathInterfaceFraction.Bar || fraction==Asc.c_oAscMathInterfaceFraction.Skewed) {
                            mnu = new Common.UI.MenuItem({
                                caption     : me.txtFractionLinear,
                                equation    : true,
                                disabled    : me._currentParaObjDisabled,
                                equationProps: {type: type, callback: 'put_FractionType', value: Asc.c_oAscMathInterfaceFraction.Linear}
                            });
                            arr.push(mnu);
                        }
                        if (fraction==Asc.c_oAscMathInterfaceFraction.Bar || fraction==Asc.c_oAscMathInterfaceFraction.NoBar) {
                            mnu = new Common.UI.MenuItem({
                                caption     : (fraction==Asc.c_oAscMathInterfaceFraction.Bar) ? me.txtRemFractionBar : me.txtAddFractionBar,
                                equation    : true,
                                disabled    : me._currentParaObjDisabled,
                                equationProps: {type: type, callback: 'put_FractionType', value: (fraction==Asc.c_oAscMathInterfaceFraction.Bar) ? Asc.c_oAscMathInterfaceFraction.NoBar : Asc.c_oAscMathInterfaceFraction.Bar}
                            });
                            arr.push(mnu);
                        }
                        break;
                    case Asc.c_oAscMathInterfaceType.Limit:
                        mnu = new Common.UI.MenuItem({
                            caption     : (value.get_Pos()==Asc.c_oAscMathInterfaceLimitPos.Top) ? me.txtLimitUnder : me.txtLimitOver,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'put_Pos', value: (value.get_Pos()==Asc.c_oAscMathInterfaceLimitPos.Top) ? Asc.c_oAscMathInterfaceLimitPos.Bottom : Asc.c_oAscMathInterfaceLimitPos.Top}
                        });
                        arr.push(mnu);
                        mnu = new Common.UI.MenuItem({
                            caption     : me.txtRemLimit,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'put_Pos', value: Asc.c_oAscMathInterfaceLimitPos.None}
                        });
                        arr.push(mnu);
                        break;
                    case Asc.c_oAscMathInterfaceType.Matrix:
                        mnu = new Common.UI.MenuItem({
                            caption     : value.get_HidePlaceholder() ? me.txtShowPlaceholder : me.txtHidePlaceholder,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'put_HidePlaceholder', value: !value.get_HidePlaceholder()}
                        });
                        arr.push(mnu);
                        mnu = new Common.UI.MenuItem({
                            caption     : me.insertText,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            menu        : new Common.UI.Menu({
                                menuAlign: 'tl-tr',
                                items   : [
                                    {
                                        caption: me.insertRowAboveText,
                                        equationProps: {type: type, callback: 'insert_MatrixRow', value: true}
                                    },
                                    {
                                        caption: me.insertRowBelowText,
                                        equationProps: {type: type, callback: 'insert_MatrixRow', value: false}
                                    },
                                    {
                                        caption: me.insertColumnLeftText,
                                        equationProps: {type: type, callback: 'insert_MatrixColumn', value: true}
                                    },
                                    {
                                        caption: me.insertColumnRightText,
                                        equationProps: {type: type, callback: 'insert_MatrixColumn', value: false}
                                    }
                                ]
                            })
                        });
                        arr.push(mnu);
                        mnu = new Common.UI.MenuItem({
                            caption     : me.deleteText,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            menu        : new Common.UI.Menu({
                                menuAlign: 'tl-tr',
                                items   : [
                                    {
                                        caption: me.deleteRowText,
                                        equationProps: {type: type, callback: 'delete_MatrixRow'}
                                    },
                                    {
                                        caption: me.deleteColumnText,
                                        equationProps: {type: type, callback: 'delete_MatrixColumn'}
                                    }
                                ]
                            })
                        });
                        arr.push(mnu);
                        mnu = new Common.UI.MenuItem({
                            caption     : me.txtMatrixAlign,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            menu        : new Common.UI.Menu({
                                menuAlign: 'tl-tr',
                                items   : [
                                    {
                                        caption: me.txtTop,
                                        checkable   : true,
                                        checked     : (value.get_MatrixAlign()==Asc.c_oAscMathInterfaceMatrixMatrixAlign.Top),
                                        equationProps: {type: type, callback: 'put_MatrixAlign', value: Asc.c_oAscMathInterfaceMatrixMatrixAlign.Top}
                                    },
                                    {
                                        caption: me.centerText,
                                        checkable   : true,
                                        checked     : (value.get_MatrixAlign()==Asc.c_oAscMathInterfaceMatrixMatrixAlign.Center),
                                        equationProps: {type: type, callback: 'put_MatrixAlign', value: Asc.c_oAscMathInterfaceMatrixMatrixAlign.Center}
                                    },
                                    {
                                        caption: me.txtBottom,
                                        checkable   : true,
                                        checked     : (value.get_MatrixAlign()==Asc.c_oAscMathInterfaceMatrixMatrixAlign.Bottom),
                                        equationProps: {type: type, callback: 'put_MatrixAlign', value: Asc.c_oAscMathInterfaceMatrixMatrixAlign.Bottom}
                                    }
                                ]
                            })
                        });
                        arr.push(mnu);
                        mnu = new Common.UI.MenuItem({
                            caption     : me.txtColumnAlign,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            menu        : new Common.UI.Menu({
                                menuAlign: 'tl-tr',
                                items   : [
                                    {
                                        caption: me.leftText,
                                        checkable   : true,
                                        checked     : (value.get_ColumnAlign()==Asc.c_oAscMathInterfaceMatrixColumnAlign.Left),
                                        equationProps: {type: type, callback: 'put_ColumnAlign', value: Asc.c_oAscMathInterfaceMatrixColumnAlign.Left}
                                    },
                                    {
                                        caption: me.centerText,
                                        checkable   : true,
                                        checked     : (value.get_ColumnAlign()==Asc.c_oAscMathInterfaceMatrixColumnAlign.Center),
                                        equationProps: {type: type, callback: 'put_ColumnAlign', value: Asc.c_oAscMathInterfaceMatrixColumnAlign.Center}
                                    },
                                    {
                                        caption: me.rightText,
                                        checkable   : true,
                                        checked     : (value.get_ColumnAlign()==Asc.c_oAscMathInterfaceMatrixColumnAlign.Right),
                                        equationProps: {type: type, callback: 'put_ColumnAlign', value: Asc.c_oAscMathInterfaceMatrixColumnAlign.Right}
                                    }
                                ]
                            })
                        });
                        arr.push(mnu);
                        break;
                    case Asc.c_oAscMathInterfaceType.EqArray:
                        mnu = new Common.UI.MenuItem({
                            caption     : me.txtInsertEqBefore,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'insert_Equation', value: true}
                        });
                        arr.push(mnu);
                        mnu = new Common.UI.MenuItem({
                            caption     : me.txtInsertEqAfter,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'insert_Equation', value: false}
                        });
                        arr.push(mnu);
                        mnu = new Common.UI.MenuItem({
                            caption     : me.txtDeleteEq,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'delete_Equation'}
                        });
                        arr.push(mnu);
                        mnu = new Common.UI.MenuItem({
                            caption     : me.alignmentText,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            menu        : new Common.UI.Menu({
                                menuAlign: 'tl-tr',
                                items   : [
                                    {
                                        caption: me.txtTop,
                                        checkable   : true,
                                        checked     : (value.get_Align()==Asc.c_oAscMathInterfaceEqArrayAlign.Top),
                                        equationProps: {type: type, callback: 'put_Align', value: Asc.c_oAscMathInterfaceEqArrayAlign.Top}
                                    },
                                    {
                                        caption: me.centerText,
                                        checkable   : true,
                                        checked     : (value.get_Align()==Asc.c_oAscMathInterfaceEqArrayAlign.Center),
                                        equationProps: {type: type, callback: 'put_Align', value: Asc.c_oAscMathInterfaceEqArrayAlign.Center}
                                    },
                                    {
                                        caption: me.txtBottom,
                                        checkable   : true,
                                        checked     : (value.get_Align()==Asc.c_oAscMathInterfaceEqArrayAlign.Bottom),
                                        equationProps: {type: type, callback: 'put_Align', value: Asc.c_oAscMathInterfaceEqArrayAlign.Bottom}
                                    }
                                ]
                            })
                        });
                        arr.push(mnu);
                        break;
                    case Asc.c_oAscMathInterfaceType.LargeOperator:
                        mnu = new Common.UI.MenuItem({
                            caption     : me.txtLimitChange,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'put_LimitLocation', value: (value.get_LimitLocation() == Asc.c_oAscMathInterfaceNaryLimitLocation.UndOvr) ? Asc.c_oAscMathInterfaceNaryLimitLocation.SubSup : Asc.c_oAscMathInterfaceNaryLimitLocation.UndOvr}
                        });
                        arr.push(mnu);
                        if (value.get_HideUpper() !== undefined) {
                            mnu = new Common.UI.MenuItem({
                                caption     : value.get_HideUpper() ? me.txtShowTopLimit : me.txtHideTopLimit,
                                equation    : true,
                                disabled    : me._currentParaObjDisabled,
                                equationProps: {type: type, callback: 'put_HideUpper', value: !value.get_HideUpper()}
                            });
                            arr.push(mnu);
                        }
                        if (value.get_HideLower() !== undefined) {
                            mnu = new Common.UI.MenuItem({
                                caption     : value.get_HideLower() ? me.txtShowBottomLimit : me.txtHideBottomLimit,
                                equation    : true,
                                disabled    : me._currentParaObjDisabled,
                                equationProps: {type: type, callback: 'put_HideLower', value: !value.get_HideLower()}
                            });
                            arr.push(mnu);
                        }
                        break;
                    case Asc.c_oAscMathInterfaceType.Delimiter:
                        mnu = new Common.UI.MenuItem({
                            caption     : me.txtInsertArgBefore,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'insert_DelimiterArgument', value: true}
                        });
                        arr.push(mnu);
                        mnu = new Common.UI.MenuItem({
                            caption     : me.txtInsertArgAfter,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'insert_DelimiterArgument', value: false}
                        });
                        arr.push(mnu);
                        if (value.can_DeleteArgument()) {
                            mnu = new Common.UI.MenuItem({
                                caption     : me.txtDeleteArg,
                                equation    : true,
                                disabled    : me._currentParaObjDisabled,
                                equationProps: {type: type, callback: 'delete_DelimiterArgument'}
                            });
                            arr.push(mnu);
                        }
                        mnu = new Common.UI.MenuItem({
                            caption     : value.has_Separators() ? me.txtDeleteCharsAndSeparators : me.txtDeleteChars,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'remove_DelimiterCharacters'}
                        });
                        arr.push(mnu);
                        mnu = new Common.UI.MenuItem({
                            caption     : value.get_HideOpeningBracket() ? me.txtShowOpenBracket : me.txtHideOpenBracket,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'put_HideOpeningBracket', value: !value.get_HideOpeningBracket()}
                        });
                        arr.push(mnu);
                        mnu = new Common.UI.MenuItem({
                            caption     : value.get_HideClosingBracket() ? me.txtShowCloseBracket : me.txtHideCloseBracket,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'put_HideClosingBracket', value: !value.get_HideClosingBracket()}
                        });
                        arr.push(mnu);
                        mnu = new Common.UI.MenuItem({
                            caption     : me.txtStretchBrackets,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            checkable   : true,
                            checked     : value.get_StretchBrackets(),
                            equationProps: {type: type, callback: 'put_StretchBrackets', value: !value.get_StretchBrackets()}
                        });
                        arr.push(mnu);
                        mnu = new Common.UI.MenuItem({
                            caption     : me.txtMatchBrackets,
                            equation    : true,
                            disabled    : (!value.get_StretchBrackets() || me._currentParaObjDisabled),
                            checkable   : true,
                            checked     : value.get_StretchBrackets() && value.get_MatchBrackets(),
                            equationProps: {type: type, callback: 'put_MatchBrackets', value: !value.get_MatchBrackets()}
                        });
                        arr.push(mnu);
                        break;
                    case Asc.c_oAscMathInterfaceType.GroupChar:
                        if (value.can_ChangePos()) {
                            mnu = new Common.UI.MenuItem({
                                caption     : (value.get_Pos()==Asc.c_oAscMathInterfaceGroupCharPos.Top) ? me.txtGroupCharUnder : me.txtGroupCharOver,
                                equation    : true,
                                disabled    : me._currentParaObjDisabled,
                                equationProps: {type: type, callback: 'put_Pos', value: (value.get_Pos()==Asc.c_oAscMathInterfaceGroupCharPos.Top) ? Asc.c_oAscMathInterfaceGroupCharPos.Bottom : Asc.c_oAscMathInterfaceGroupCharPos.Top}
                            });
                            arr.push(mnu);
                            mnu = new Common.UI.MenuItem({
                                caption     : me.txtDeleteGroupChar,
                                equation    : true,
                                disabled    : me._currentParaObjDisabled,
                                equationProps: {type: type, callback: 'put_Pos', value: Asc.c_oAscMathInterfaceGroupCharPos.None}
                            });
                            arr.push(mnu);
                        }
                        break;
                    case Asc.c_oAscMathInterfaceType.Radical:
                        if (value.get_HideDegree() !== undefined) {
                            mnu = new Common.UI.MenuItem({
                                caption     : value.get_HideDegree() ? me.txtShowDegree : me.txtHideDegree,
                                equation    : true,
                                disabled    : me._currentParaObjDisabled,
                                equationProps: {type: type, callback: 'put_HideDegree', value: !value.get_HideDegree()}
                            });
                            arr.push(mnu);
                        }
                        mnu = new Common.UI.MenuItem({
                            caption     : me.txtDeleteRadical,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'remove_Radical'}
                        });
                        arr.push(mnu);
                        break;
                }
                if (value.can_IncreaseArgumentSize()) {
                    mnu = new Common.UI.MenuItem({
                        caption     : me.txtIncreaseArg,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        equationProps: {type: type, callback: 'increase_ArgumentSize'}
                    });
                    arr.push(mnu);
                }
                if (value.can_DecreaseArgumentSize()) {
                    mnu = new Common.UI.MenuItem({
                        caption     : me.txtDecreaseArg,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        equationProps: {type: type, callback: 'decrease_ArgumentSize'}
                    });
                    arr.push(mnu);
                }
                if (value.can_InsertManualBreak()) {
                    mnu = new Common.UI.MenuItem({
                        caption     : me.txtInsertBreak,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        equationProps: {type: type, callback: 'insert_ManualBreak'}
                    });
                    arr.push(mnu);
                }
                if (value.can_DeleteManualBreak()) {
                    mnu = new Common.UI.MenuItem({
                        caption     : me.txtDeleteBreak,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        equationProps: {type: type, callback: 'delete_ManualBreak'}
                    });
                    arr.push(mnu);
                }
                if (value.can_AlignToCharacter()) {
                    mnu = new Common.UI.MenuItem({
                        caption     : me.txtAlignToChar,
                        equation    : true,
                        disabled    : me._currentParaObjDisabled,
                        equationProps: {type: type, callback: 'align_ToCharacter'}
                    });
                    arr.push(mnu);
                }
                return arr;
            };

            this.addEquationMenu = function(isParagraph, insertIdx) {
                if (_.isUndefined(isParagraph)) {
                    isParagraph = me.textMenu.isVisible();
                }

                me.clearEquationMenu(isParagraph, insertIdx);

                var equationMenu = (isParagraph) ? me.textMenu : me.tableMenu,
                    menuItems = me.initEquationMenu();

                if (menuItems.length > 0) {
                    _.each(menuItems, function(menuItem, index) {
                        if (menuItem.menu) {
                            _.each(menuItem.menu.items, function(item) {
                                item.on('click', _.bind(me.equationCallback, me, item.options.equationProps));
                            });
                        } else
                            menuItem.on('click', _.bind(me.equationCallback, me, menuItem.options.equationProps));
                        equationMenu.insertItem(insertIdx, menuItem);
                        insertIdx++;
                    });
                }
                return menuItems.length;
            };

            this.clearEquationMenu  = function(isParagraph, insertIdx) {
                var equationMenu = (isParagraph) ? me.textMenu : me.tableMenu;
                for (var i = insertIdx; i < equationMenu.items.length; i++) {
                    if (equationMenu.items[i].options.equation) {
                        if (equationMenu.items[i].menu) {
                            _.each(equationMenu.items[i].menu.items, function(item) {
                                item.off('click');
                            });
                        } else
                            equationMenu.items[i].off('click');
                        equationMenu.removeItem(equationMenu.items[i]);
                        i--;
                    } else
                        break;
                }
            };

            this.equationCallback  = function(eqProps) {
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
                        me.api.asc_SetMathProps(eqObj);
                    }
                }
                me.fireEvent('editcomplete', me);
            };

            this.changePosition = function() {
                me._XY = [
                    me.cmpEl.offset().left - $(window).scrollLeft(),
                    me.cmpEl.offset().top  - $(window).scrollTop()
                ];
                me._Height = me.cmpEl.height();
                me._BodyWidth = $('body').width();
                onMouseMoveStart();
            };

            this.hideTips = function() {
                /** coauthoring begin **/
                if (typeof userTooltip == 'object') {
                    userTooltip.hide();
                    userTooltip = true;
                }
                _.each(me.usertips, function(item) {
                    item.remove();
                });
                me.usertips = [];
                me.usertipcount = 0;
                /** coauthoring end **/
            };

            /** coauthoring begin **/
            var keymap = {};
            var hkComments = 'alt+h';
            keymap[hkComments] = function() {
                if (me.api.can_AddQuotedComment()!==false) {
                    me.addComment();
                }
            };
            Common.util.Shortcuts.delegateShortcuts({shortcuts:keymap});
            /** coauthoring end **/

            this.setApi = function(o) {
                this.api = o;

                if (this.api) {
                    this.api.asc_registerCallback('asc_onContextMenu',                  _.bind(onContextMenu, this));
                    this.api.asc_registerCallback('asc_onMouseMoveStart',               _.bind(onMouseMoveStart, this));
                    this.api.asc_registerCallback('asc_onMouseMoveEnd',                 _.bind(onMouseMoveEnd, this));

                    //hyperlink
                    this.api.asc_registerCallback('asc_onHyperlinkClick',               _.bind(onHyperlinkClick, this));
                    this.api.asc_registerCallback('asc_onMouseMove',                    _.bind(onMouseMove, this));

                    if (this.mode.isEdit === true) {
                        this.api.asc_registerCallback('asc_onImgWrapStyleChanged',      _.bind(this.onImgWrapStyleChanged, this));
                        this.api.asc_registerCallback('asc_onDialogAddHyperlink',       onDialogAddHyperlink);
                        this.api.asc_registerCallback('asc_doubleClickOnChart',         onDoubleClickOnChart);
                        this.api.asc_registerCallback('asc_onSpellCheckVariantsFound',  _.bind(onSpellCheckVariantsFound, this));
                        this.api.asc_registerCallback('asc_onRulerDblClick',            _.bind(this.onRulerDblClick, this));
                        this.api.asc_registerCallback('asc_ChangeCropState',            _.bind(this.onChangeCropState, this));
                    }
                    this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',        _.bind(onCoAuthoringDisconnect, this));
                    Common.NotificationCenter.on('api:disconnect',                      _.bind(onCoAuthoringDisconnect, this));
                    this.api.asc_registerCallback('asc_onTextLanguage',                 _.bind(onTextLanguage, this));
                    this.api.asc_registerCallback('asc_onParaStyleName',                _.bind(this.onApiParagraphStyleChange, this));

                    this.api.asc_registerCallback('asc_onShowForeignCursorLabel',       _.bind(onShowForeignCursorLabel, this));
                    this.api.asc_registerCallback('asc_onHideForeignCursorLabel',       _.bind(onHideForeignCursorLabel, this));
                    this.api.asc_registerCallback('asc_onFocusObject',                  _.bind(onFocusObject, this));
                    this.api.asc_registerCallback('asc_onShowSpecialPasteOptions',      _.bind(onShowSpecialPasteOptions, this));
                    this.api.asc_registerCallback('asc_onHideSpecialPasteOptions',      _.bind(onHideSpecialPasteOptions, this));
                }

                return this;
            };

            this.mode = {};
            this.setMode = function(m) {
                this.mode = m;
                /** coauthoring begin **/
                !(this.mode.canCoAuthoring && this.mode.canComments)
                    ? Common.util.Shortcuts.suspendEvents(hkComments)
                    : Common.util.Shortcuts.resumeEvents(hkComments);
                /** coauthoring end **/
                this.editorConfig = {user: m.user};
            };

            me.on('render:after', onAfterRender, me);
        },

        render: function () {
            this.fireEvent('render:before', this);

            this.cmpEl = $(this.el);

            this.fireEvent('render:after', this);
            return this;
        },

        onImgWrapStyleChanged: function(type){
            switch (type) {
                case Asc.c_oAscWrapStyle2.Inline:
                    this.menuImageWrap.menu.items[0].setChecked(true);
                    break;
                case Asc.c_oAscWrapStyle2.Square:
                    this.menuImageWrap.menu.items[1].setChecked(true);
                    break;
                case Asc.c_oAscWrapStyle2.Tight:
                    this.menuImageWrap.menu.items[2].setChecked(true);
                    break;
                case Asc.c_oAscWrapStyle2.Through:
                    this.menuImageWrap.menu.items[3].setChecked(true);
                    break;
                case Asc.c_oAscWrapStyle2.TopAndBottom:
                    this.menuImageWrap.menu.items[4].setChecked(true);
                    break;
                case Asc.c_oAscWrapStyle2.Behind:
                    this.menuImageWrap.menu.items[6].setChecked(true);
                    break;
                case Asc.c_oAscWrapStyle2.InFront:
                    this.menuImageWrap.menu.items[5].setChecked(true);
                    break;
            }
        },

        onChangeCropState: function(state) {
            this.menuImgCrop.menu.items[0].setChecked(state, true);
        },

        onApiParagraphStyleChange: function(name) {
            window.currentStyleName = name;
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
                                api             : me.api,
                                handler: function(result, value) {
                                    if (result == 'ok') {
                                        if (me.api) {
                                            me.borderAdvancedProps = value.borderProps;
                                            me.api.paraApply(value.paragraphProps);
                                        }
                                    }
                                    me.fireEvent('editcomplete', me);
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

        advancedFrameClick: function(item, e, eOpt){
            var win, me = this;
            if (me.api){
                var selectedElements = me.api.getSelectedElements();
                if (selectedElements && _.isArray(selectedElements)){
                    for (var i = selectedElements.length - 1; i >= 0; i--) {
                        var elType, elValue;
                        elType = selectedElements[i].get_ObjectType();
                        elValue = selectedElements[i].get_ObjectValue(); // заменить на свойства рамки
                        if (Asc.c_oAscTypeSelectElement.Paragraph == elType) {
                            win = new DE.Views.DropcapSettingsAdvanced({
                                tableStylerRows     : 2,
                                tableStylerColumns  : 1,
                                paragraphProps      : elValue,
                                borderProps         : me.borderAdvancedProps,
                                api                 : me.api,
                                isFrame             : true,
                                handler: function(result, value) {
                                    if (result == 'ok') {
                                        me.borderAdvancedProps = value.borderProps;
                                        if (value.paragraphProps && value.paragraphProps.get_Wrap() === c_oAscFrameWrap.None) {
                                            me.api.removeDropcap(false);
                                        } else
                                            me.api.put_FramePr(value.paragraphProps);
                                    }
                                    me.fireEvent('editcomplete', me);
                                }
                            });
                            break;
                        }
                    }
                }
            }

            if (win) {
                win.show();
            }
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
                                    me.fireEvent('editcomplete', me);
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

        onRulerDblClick: function(type) {
            var win, me = this;
            if (type == 'tables') {
                win = this.advancedTableClick();
                if (win)
                    win.setActiveCategory(4);
            } else if (type == 'indents' || type == 'tabs') {
                win = this.advancedParagraphClick({isChart: false});
                if (win)
                    win.setActiveCategory(type == 'indents' ? 0 : 3);
            } else if (type == 'margins') {
                win = new DE.Views.PageMarginsDialog({
                    handler: function(dlg, result) {
                        if (result == 'ok') {
                            var props = dlg.getSettings();
                            var mnu = DE.getController('Toolbar').toolbar.btnPageMargins.menu.items[0];
                            mnu.setVisible(true);
                            mnu.setChecked(true);
                            mnu.options.value = mnu.value = [props.get_TopMargin(), props.get_LeftMargin(), props.get_BottomMargin(), props.get_RightMargin()];
                            $(mnu.el).html(mnu.template({id: Common.UI.getId(), caption : mnu.caption, options : mnu.options}));
                            Common.localStorage.setItem("de-pgmargins-top", props.get_TopMargin());
                            Common.localStorage.setItem("de-pgmargins-left", props.get_LeftMargin());
                            Common.localStorage.setItem("de-pgmargins-bottom", props.get_BottomMargin());
                            Common.localStorage.setItem("de-pgmargins-right", props.get_RightMargin());

                            me.api.asc_SetSectionProps(props);
                            me.fireEvent('editcomplete', me);
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
                            me.fireEvent('editcomplete', me);
                        }
                    }
                });
                win.show();
                win.setSettings(me.api.asc_GetColumnsProps());
            }
        },

        editHyperlink: function(item, e, eOpt){
            var win, me = this;
            if (me.api){
                win = new DE.Views.HyperlinkSettingsDialog({
                    api: me.api,
                    handler: function(dlg, result) {
                        if (result == 'ok') {
                            me.api.change_Hyperlink(win.getSettings());
                        }
                        me.fireEvent('editcomplete', me);
                    }
                });
                win.show();
                win.setSettings(item.hyperProps.value);
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

        /** coauthoring begin **/
        addComment: function(item, e, eOpt){
            if (this.api && this.mode.canCoAuthoring && this.mode.canComments) {
                this.suppressEditComplete = true;

                var controller = DE.getController('Common.Controllers.Comments');
                if (controller) {
                    controller.addDummyComment();
                }
            }
        },
        /** coauthoring end **/

        addHyperlink: function(item, e, eOpt){
            var win, me = this;
            if (me.api){
                win = new DE.Views.HyperlinkSettingsDialog({
                    api: me.api,
                    handler: function(dlg, result) {
                        if (result == 'ok') {
                            me.api.add_Hyperlink(dlg.getSettings());
                        }
                        me.fireEvent('editcomplete', me);
                    }
                });

                win.show();
                win.setSettings(item.hyperProps.value);

                Common.component.Analytics.trackEvent('DocumentHolder', 'Add Hyperlink');
            }
        },

        editChartClick: function(){
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

        updateThemeColors: function() {
            this.effectcolors   = Common.Utils.ThemeColor.getEffectColors();
            this.standartcolors = Common.Utils.ThemeColor.getStandartColors();
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
                                me.fireEvent('editcomplete', me);
                            }
                        })).show();
                    }
                } 
            }
            me.fireEvent('editcomplete', me);
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

                            me.fireEvent('editcomplete', me);
                        }
                    })).show();
                } else if (item.value == 'remove') {
                    this.api.asc_RemoveContentControlWrapper(props.get_InternalId());
                }
            }
            me.fireEvent('editcomplete', me);
        },

        onContinueNumbering: function(item, e) {
            this.api.asc_ContinueNumbering();
            this.fireEvent('editcomplete', this);
        },

        onStartNumbering: function(startfrom, item, e) {
            if (startfrom == 1)
                this.api.asc_RestartNumbering(item.value.start);
            else {
                var me = this;
                (new DE.Views.NumberingValueDialog({
                    title: me.textNumberingValue,
                    props: item.value,
                    handler: function (result, value) {
                        if (result == 'ok')
                            me.api.asc_RestartNumbering(value);
                        me.fireEvent('editcomplete', me);
                    }
                })).show();
            }
            this.fireEvent('editcomplete', this);
        },

        createDelayedElementsViewer: function() {
            var me = this;

            var menuViewCopy = new Common.UI.MenuItem({
                caption: me.textCopy,
                value: 'copy'
            }).on('click', _.bind(me.onCutCopyPaste, me));

            var menuViewUndo = new Common.UI.MenuItem({
                caption: me.textUndo
            }).on('click', function () {
                me.api.Undo();
            });

            var menuViewCopySeparator = new Common.UI.MenuItem({
                caption: '--'
            });

            var menuViewAddComment = new Common.UI.MenuItem({
                caption: me.addCommentText
            }).on('click', _.bind(me.addComment, me));

            var menuSignatureViewSign   = new Common.UI.MenuItem({caption: this.strSign,      value: 0 }).on('click', _.bind(me.onSignatureClick, me));
            var menuSignatureDetails    = new Common.UI.MenuItem({caption: this.strDetails,   value: 1 }).on('click', _.bind(me.onSignatureClick, me));
            var menuSignatureViewSetup  = new Common.UI.MenuItem({caption: this.strSetup,     value: 2 }).on('click', _.bind(me.onSignatureClick, me));
            var menuSignatureRemove     = new Common.UI.MenuItem({caption: this.strDelete,    value: 3 }).on('click', _.bind(me.onSignatureClick, me));
            var menuViewSignSeparator   = new Common.UI.MenuItem({caption: '--' });

            this.viewModeMenu = new Common.UI.Menu({
                initMenu: function (value) {
                    var isInChart = (value.imgProps && value.imgProps.value && !_.isNull(value.imgProps.value.get_ChartProperties())),
                        signGuid = (value.imgProps && value.imgProps.value && me.mode.isSignatureSupport) ? value.imgProps.value.asc_getSignatureId() : undefined,
                        signProps = (signGuid) ? me.api.asc_getSignatureSetup(signGuid) : null,
                        isInSign = !!signProps && me._canProtect,
                        canComment = !isInChart && me.api.can_AddQuotedComment() !== false && me.mode.canCoAuthoring && me.mode.canComments && !me._isDisabled;

                    menuViewUndo.setVisible(me.mode.canCoAuthoring && me.mode.canComments && !me._isDisabled);
                    menuViewUndo.setDisabled(!me.api.asc_getCanUndo() && !me._isDisabled);
                    menuViewCopySeparator.setVisible(isInSign);

                    var isRequested = (signProps) ? signProps.asc_getRequested() : false;
                    menuSignatureViewSign.setVisible(isInSign && isRequested);
                    menuSignatureDetails.setVisible(isInSign && !isRequested);
                    menuSignatureViewSetup.setVisible(isInSign);
                    menuSignatureRemove.setVisible(isInSign && !isRequested);
                    menuViewSignSeparator.setVisible(canComment);

                    if (isInSign) {
                        menuSignatureViewSign.cmpEl.attr('data-value', signGuid); // sign
                        menuSignatureDetails.cmpEl.attr('data-value', signProps.asc_getId()); // view certificate
                        menuSignatureViewSetup.cmpEl.attr('data-value', signGuid); // view signature settings
                        menuSignatureRemove.cmpEl.attr('data-value', signGuid);
                    }

                    menuViewAddComment.setVisible(canComment);
                    menuViewAddComment.setDisabled(value.paraProps && value.paraProps.locked === true);

                    var cancopy = me.api && me.api.can_CopyCut();
                    menuViewCopy.setDisabled(!cancopy);
                },
                items: [
                    menuViewCopy,
                    menuViewUndo,
                    menuViewCopySeparator,
                    menuSignatureViewSign,
                    menuSignatureDetails,
                    menuSignatureViewSetup,
                    menuSignatureRemove,
                    menuViewSignSeparator,
                    menuViewAddComment
                ]
            }).on('hide:after', function (menu, e, isFromInputControl) {
                if (me.suppressEditComplete) {
                    me.suppressEditComplete = false;
                    return;
                }

                if (!isFromInputControl) me.fireEvent('editcomplete', me);
                me.currentMenu = null;
            });

        },

        createDelayedElements: function() {
            var me = this;

            var menuImageAlign = new Common.UI.MenuItem({
                caption     : me.textAlign,
                menu        : (function(){
                    function onItemClick(item, e) {
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
                        me.fireEvent('editcomplete', me);
                    }
                    return new Common.UI.Menu({
                        cls: 'ppm-toolbar',
                        menuAlign: 'tl-tr',
                        items: [
                            new Common.UI.MenuItem({
                                caption : me.textShapeAlignLeft,
                                iconCls : 'mnu-img-align-left',
                                value: Asc.c_oAscAlignShapeType.ALIGN_LEFT
                            }).on('click', onItemClick),
                            new Common.UI.MenuItem({
                                caption : me.textShapeAlignCenter,
                                iconCls : 'mnu-img-align-center',
                                value: Asc.c_oAscAlignShapeType.ALIGN_CENTER
                            }).on('click', onItemClick),
                            new Common.UI.MenuItem({
                                caption : me.textShapeAlignRight,
                                iconCls : 'mnu-img-align-right',
                                value: Asc.c_oAscAlignShapeType.ALIGN_RIGHT
                            }).on('click', onItemClick),
                            new Common.UI.MenuItem({
                                caption : me.textShapeAlignTop,
                                iconCls : 'mnu-img-align-top',
                                value: Asc.c_oAscAlignShapeType.ALIGN_TOP
                            }).on('click', onItemClick),
                            new Common.UI.MenuItem({
                                caption : me.textShapeAlignMiddle,
                                iconCls : 'mnu-img-align-middle',
                                value: Asc.c_oAscAlignShapeType.ALIGN_MIDDLE
                            }).on('click', onItemClick),
                            new Common.UI.MenuItem({
                                caption : me.textShapeAlignBottom,
                                iconCls : 'mnu-img-align-bottom',
                                value: Asc.c_oAscAlignShapeType.ALIGN_BOTTOM
                            }).on('click', onItemClick),
                            {caption    : '--'},
                            new Common.UI.MenuItem({
                                caption     : me.txtDistribHor,
                                iconCls     : 'mnu-distrib-hor',
                                value       : 6
                            }).on('click', onItemClick),
                            new Common.UI.MenuItem({
                                caption     : me.txtDistribVert,
                                iconCls     : 'mnu-distrib-vert',
                                value       : 7
                            }).on('click', onItemClick)
                        ]
                    })
                })()
            });

            var mnuGroup = new Common.UI.MenuItem({
                caption : this.txtGroup,
                iconCls : 'mnu-arrange-group'
            }).on('click', function(item, e) {
                if (me.api) {
                    var properties = new Asc.asc_CImgProperty();
                    properties.put_Group(1);
                    me.api.ImgApply(properties);
                }
                me.fireEvent('editcomplete', this);
            });

            var mnuUnGroup = new Common.UI.MenuItem({
                iconCls : 'mnu-arrange-ungroup',
                caption : this.txtUngroup
            }).on('click', function(item, e) {
                if (me.api) {
                    var properties = new Asc.asc_CImgProperty();
                    properties.put_Group(-1);
                    me.api.ImgApply(properties);
                }
                me.fireEvent('editcomplete', this);
            });

            var menuImageArrange = new Common.UI.MenuItem({
                caption : me.textArrange,
                menu    : (function(){
                    function onItemClick(item, e) {
                        if (me.api) {
                            var properties = new Asc.asc_CImgProperty();
                            properties.put_ChangeLevel(item.options.valign);
                            me.api.ImgApply(properties);
                        }
                        me.fireEvent('editcomplete', me);
                    }

                    return new Common.UI.Menu({
                        cls: 'ppm-toolbar',
                        menuAlign: 'tl-tr',
                        items: [
                            new Common.UI.MenuItem({
                                caption : me.textArrangeFront,
                                iconCls : 'mnu-arrange-front',
                                valign  : Asc.c_oAscChangeLevel.BringToFront
                            }).on('click', onItemClick),
                            new Common.UI.MenuItem({
                                caption : me.textArrangeBack,
                                iconCls : 'mnu-arrange-back',
                                valign  : Asc.c_oAscChangeLevel.SendToBack
                            }).on('click', onItemClick),
                            new Common.UI.MenuItem({
                                caption : me.textArrangeForward,
                                iconCls : 'mnu-arrange-forward',
                                valign  : Asc.c_oAscChangeLevel.BringForward
                            }).on('click', onItemClick),
                            new Common.UI.MenuItem({
                                caption : me.textArrangeBackward,
                                iconCls : 'mnu-arrange-backward',
                                valign  : Asc.c_oAscChangeLevel.BringBackward
                            }).on('click', onItemClick),
                            { caption: '--' },
                            mnuGroup,
                            mnuUnGroup
                        ]
                    })
                })()
            });

            var menuWrapPolygon = new Common.UI.MenuItem({
                caption : me.textEditWrapBoundary,
                cls     : 'no-icon-wrap-item'
            }).on('click', function(item, e) {
                if (me.api) {
                    me.api.StartChangeWrapPolygon();
                }
                me.fireEvent('editcomplete', me);
            });

            this.menuImageWrap = new Common.UI.MenuItem({
                caption : me.textWrap,
                menu    : (function(){
                    function onItemClick(item, e) {
                        if (me.api) {
                            var properties = new Asc.asc_CImgProperty();
                            properties.put_WrappingStyle(item.options.wrapType);

                            if (me.menuImageWrap._originalProps.get_WrappingStyle() === Asc.c_oAscWrapStyle2.Inline && item.wrapType !== Asc.c_oAscWrapStyle2.Inline ) {
                                properties.put_PositionH(new Asc.CImagePositionH());
                                properties.get_PositionH().put_UseAlign(false);
                                properties.get_PositionH().put_RelativeFrom(Asc.c_oAscRelativeFromH.Column);
                                var val = me.menuImageWrap._originalProps.get_Value_X(Asc.c_oAscRelativeFromH.Column);
                                properties.get_PositionH().put_Value(val);

                                properties.put_PositionV(new Asc.CImagePositionV());
                                properties.get_PositionV().put_UseAlign(false);
                                properties.get_PositionV().put_RelativeFrom(Asc.c_oAscRelativeFromV.Paragraph);
                                val = me.menuImageWrap._originalProps.get_Value_Y(Asc.c_oAscRelativeFromV.Paragraph);
                                properties.get_PositionV().put_Value(val);
                            }
                            me.api.ImgApply(properties);
                        }
                        me.fireEvent('editcomplete', me);
                    }

                    return new Common.UI.Menu({
                        cls: 'ppm-toolbar',
                        menuAlign: 'tl-tr',
                        items: [
                            new Common.UI.MenuItem({
                                caption     : me.txtInline,
                                iconCls     : 'mnu-wrap-inline',
                                toggleGroup : 'popuppicturewrapping',
                                wrapType    : Asc.c_oAscWrapStyle2.Inline,
                                checkable   : true
                            }).on('click', onItemClick),
                            new Common.UI.MenuItem({
                                caption     : me.txtSquare,
                                iconCls     : 'mnu-wrap-square',
                                toggleGroup : 'popuppicturewrapping',
                                wrapType    : Asc.c_oAscWrapStyle2.Square,
                                checkable   : true
                            }).on('click', onItemClick),
                            new Common.UI.MenuItem({
                                caption     : me.txtTight,
                                iconCls     : 'mnu-wrap-tight',
                                toggleGroup : 'popuppicturewrapping',
                                wrapType    : Asc.c_oAscWrapStyle2.Tight,
                                checkable   : true
                            }).on('click', onItemClick),
                            new Common.UI.MenuItem({
                                caption     : me.txtThrough,
                                iconCls     : 'mnu-wrap-through',
                                toggleGroup : 'popuppicturewrapping',
                                wrapType    : Asc.c_oAscWrapStyle2.Through,
                                checkable   : true
                            }).on('click', onItemClick),
                            new Common.UI.MenuItem({
                                caption     : me.txtTopAndBottom,
                                iconCls     : 'mnu-wrap-topAndBottom',
                                toggleGroup : 'popuppicturewrapping',
                                wrapType    : Asc.c_oAscWrapStyle2.TopAndBottom,
                                checkable   : true
                            }).on('click', onItemClick),
                            new Common.UI.MenuItem({
                                caption     : me.txtInFront,
                                iconCls     : 'mnu-wrap-inFront',
                                toggleGroup : 'popuppicturewrapping',
                                wrapType    : Asc.c_oAscWrapStyle2.InFront,
                                checkable   : true
                            }).on('click', onItemClick),
                            new Common.UI.MenuItem({
                                caption     : me.txtBehind,
                                iconCls     : 'mnu-wrap-behind',
                                toggleGroup : 'popuppicturewrapping',
                                wrapType    : Asc.c_oAscWrapStyle2.Behind,
                                checkable   : true
                            }).on('click', onItemClick),
                            { caption: '--' },
                            menuWrapPolygon
                        ]
                    })
                })()
            });

            var menuImageAdvanced = new Common.UI.MenuItem({
                caption : me.advancedText
            }).on('click', function(item, e) {
                var elType, elValue;

                if (me.api){
                    var selectedElements = me.api.getSelectedElements();

                    if (selectedElements && _.isArray(selectedElements)) {
                        for (var i = selectedElements.length - 1; i >= 0; i--) {
                            elType  = selectedElements[i].get_ObjectType();
                            elValue = selectedElements[i].get_ObjectValue();

                            if (Asc.c_oAscTypeSelectElement.Image == elType) {
                                var imgsizeOriginal;
                                if ( !elValue.get_ChartProperties() && !elValue.get_ShapeProperties() && !me.menuOriginalSize.isDisabled() && me.menuOriginalSize.isVisible()) {
                                    imgsizeOriginal = me.api.get_OriginalSizeImage();
                                    if (imgsizeOriginal)
                                        imgsizeOriginal = {width:imgsizeOriginal.get_ImageWidth(), height:imgsizeOriginal.get_ImageHeight()};
                                }

                                var win = new DE.Views.ImageSettingsAdvanced({
                                    imageProps  : elValue,
                                    sizeOriginal: imgsizeOriginal,
                                    sectionProps: me.api.asc_GetSectionProps(),
                                    handler     : function(result, value) {
                                        if (result == 'ok') {
                                            if (me.api) {
                                                me.api.ImgApply(value.imageProps);
                                            }
                                        }
                                        me.fireEvent('editcomplete', me);
                                    }
                                });
                                win.show();
                                win.btnOriginalSize.setVisible(me.menuOriginalSize.isVisible());
                                break;
                            }
                        }
                    }
                }
            });

            var menuChartEdit = new Common.UI.MenuItem({
                caption : me.editChartText
            }).on('click', _.bind(me.editChartClick, me));

            this.menuOriginalSize = new Common.UI.MenuItem({
                caption : me.originalSizeText
            }).on('click', function(item, e) {
                if (me.api){
                    var originalImageSize = me.api.get_OriginalSizeImage();

                    var properties = new Asc.asc_CImgProperty();
                    properties.put_Width(originalImageSize.get_ImageWidth());
                    properties.put_Height(originalImageSize.get_ImageHeight());
                    properties.put_ResetCrop(true);
                    me.api.ImgApply(properties);

                    me.fireEvent('editcomplete', this);
                }
            });

            var menuImgReplace = new Common.UI.MenuItem({
                caption     : me.textReplace,
                menu        : new Common.UI.Menu({
                    menuAlign: 'tl-tr',
                    items: [
                        new Common.UI.MenuItem({
                            caption     : this.textFromFile
                        }).on('click', function(item) {
                            setTimeout(function(){
                                if (me.api) me.api.ChangeImageFromFile();
                                me.fireEvent('editcomplete', me);
                            }, 10);
                        }),
                        new Common.UI.MenuItem({
                            caption     : this.textFromUrl
                        }).on('click', function(item) {
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
                                    me.fireEvent('editcomplete', me);
                                }
                            })).show();
                        })
                    ]
                })
            });

            var menuImgCopy = new Common.UI.MenuItem({
                caption : me.textCopy,
                value : 'copy'
            }).on('click', _.bind(me.onCutCopyPaste, me));

            var menuImgPaste = new Common.UI.MenuItem({
                caption : me.textPaste,
                value : 'paste'
            }).on('click', _.bind(me.onCutCopyPaste, me));

            var menuImgCut = new Common.UI.MenuItem({
                caption : me.textCut,
                value : 'cut'
            }).on('click', _.bind(me.onCutCopyPaste, me));

            var menuSignatureEditSign   = new Common.UI.MenuItem({caption: this.strSign,      value: 0 }).on('click', _.bind(me.onSignatureClick, me));
            var menuSignatureEditSetup  = new Common.UI.MenuItem({caption: this.strSetup,     value: 2 }).on('click', _.bind(me.onSignatureClick, me));
            var menuEditSignSeparator = new Common.UI.MenuItem({ caption: '--' });

            var menuImgRotate = new Common.UI.MenuItem({
                caption     : me.textRotate,
                menu        : new Common.UI.Menu({
                    menuAlign: 'tl-tr',
                    items: [
                        new Common.UI.MenuItem({
                            caption: this.textRotate90,
                            value  : 1
                        }).on('click', _.bind(me.onImgRotate, me)),
                        new Common.UI.MenuItem({
                            caption: this.textRotate270,
                            value  : 0
                        }).on('click', _.bind(me.onImgRotate, me)),
                        { caption: '--' },
                        new Common.UI.MenuItem({
                            caption: this.textFlipH,
                            value  : 1
                        }).on('click', _.bind(me.onImgFlip, me)),
                        new Common.UI.MenuItem({
                            caption: this.textFlipV,
                            value  : 0
                        }).on('click', _.bind(me.onImgFlip, me))
                    ]
                })
            });

            me.menuImgCrop = new Common.UI.MenuItem({
                caption     : me.textCrop,
                menu        : new Common.UI.Menu({
                    menuAlign: 'tl-tr',
                    items: [
                        new Common.UI.MenuItem({
                            caption: me.textCrop,
                            checkable: true,
                            allowDepress: true,
                            value  : 0
                        }).on('click', _.bind(me.onImgCrop, me)),
                        new Common.UI.MenuItem({
                            caption: me.textCropFill,
                            value  : 1
                        }).on('click', _.bind(me.onImgCrop, me)),
                        new Common.UI.MenuItem({
                            caption: me.textCropFit,
                            value  : 2
                        }).on('click', _.bind(me.onImgCrop, me))
                    ]
                })
            });

            this.pictureMenu = new Common.UI.Menu({
                initMenu: function(value){
                    if (_.isUndefined(value.imgProps))
                        return;

                    var notflow = !value.imgProps.value.get_CanBeFlow(),
                        wrapping = value.imgProps.value.get_WrappingStyle();

                    me.menuImageWrap._originalProps = value.imgProps.value;

                    if (notflow) {
                        for (var i = 0; i < 6; i++) {
                            me.menuImageWrap.menu.items[i].setChecked(false);
                        }
                    } else {
                        switch (wrapping) {
                            case Asc.c_oAscWrapStyle2.Inline:
                                me.menuImageWrap.menu.items[0].setChecked(true);
                                break;
                            case Asc.c_oAscWrapStyle2.Square:
                                me.menuImageWrap.menu.items[1].setChecked(true);
                                break;
                            case Asc.c_oAscWrapStyle2.Tight:
                                me.menuImageWrap.menu.items[2].setChecked(true);
                                break;
                            case Asc.c_oAscWrapStyle2.Through:
                                me.menuImageWrap.menu.items[3].setChecked(true);
                                break;
                            case Asc.c_oAscWrapStyle2.TopAndBottom:
                                me.menuImageWrap.menu.items[4].setChecked(true);
                                break;
                            case Asc.c_oAscWrapStyle2.Behind:
                                me.menuImageWrap.menu.items[6].setChecked(true);
                                break;
                            case Asc.c_oAscWrapStyle2.InFront:
                                me.menuImageWrap.menu.items[5].setChecked(true);
                                break;
                            default:
                                for (var i = 0; i < 6; i++) {
                                    me.menuImageWrap.menu.items[i].setChecked(false);
                                }
                                break;
                        }
                    }
                    _.each(me.menuImageWrap.menu.items, function(item) {
                        item.setDisabled(notflow);
                    });

                    var onlyCommonProps = ( value.imgProps.isImg && value.imgProps.isChart || value.imgProps.isImg && value.imgProps.isShape ||
                                                       value.imgProps.isShape && value.imgProps.isChart);
                    if (onlyCommonProps)
                        menuImageAdvanced.setCaption(me.advancedText, true);
                    else {
                        menuImageAdvanced.setCaption((value.imgProps.isImg) ? me.imageText : ((value.imgProps.isChart) ? me.chartText : me.shapeText), true);
                    }

                    menuChartEdit.setVisible(!_.isNull(value.imgProps.value.get_ChartProperties()) && !onlyCommonProps);

                    me.menuOriginalSize.setVisible(value.imgProps.isOnlyImg || !value.imgProps.isChart && !value.imgProps.isShape);

                    var islocked = value.imgProps.locked || (value.headerProps!==undefined && value.headerProps.locked);
                    var pluginGuid = value.imgProps.value.asc_getPluginGuid();
                    menuImgReplace.setVisible(value.imgProps.isOnlyImg && (pluginGuid===null || pluginGuid===undefined));
                    if (menuImgReplace.isVisible())
                        menuImgReplace.setDisabled(islocked || pluginGuid===null);

                    menuImgRotate.setVisible(!value.imgProps.isChart && (pluginGuid===null || pluginGuid===undefined));
                    if (menuImgRotate.isVisible())
                        menuImgRotate.setDisabled(islocked);

                    me.menuImgCrop.setVisible(me.api.asc_canEditCrop());
                    if (me.menuImgCrop.isVisible())
                        me.menuImgCrop.setDisabled(islocked);

                    if (menuChartEdit.isVisible())
                        menuChartEdit.setDisabled(islocked || value.imgProps.value.get_SeveralCharts());

                    me.pictureMenu.items[16].setVisible(menuChartEdit.isVisible());

                    me.menuOriginalSize.setDisabled(islocked || value.imgProps.value.get_ImageUrl()===null || value.imgProps.value.get_ImageUrl()===undefined);
                    menuImageAdvanced.setDisabled(islocked);
                    menuImageAlign.setDisabled( islocked || (wrapping == Asc.c_oAscWrapStyle2.Inline) );
                    if (!(islocked || (wrapping == Asc.c_oAscWrapStyle2.Inline))) {
                        var objcount = me.api.asc_getSelectedDrawingObjectsCount(),
                            alignto = Common.Utils.InternalSettings.get("de-img-align-to"); // 1 - page, 2 - margin, 3 - selected
                        menuImageAlign.menu.items[7].setDisabled(objcount==2 && (!alignto || alignto==3));
                        menuImageAlign.menu.items[8].setDisabled(objcount==2 && (!alignto || alignto==3));
                    }
                    menuImageArrange.setDisabled( wrapping == Asc.c_oAscWrapStyle2.Inline );

                    if (me.api) {
                        mnuUnGroup.setDisabled(islocked || !me.api.CanUnGroup());
                        mnuGroup.setDisabled(islocked || !me.api.CanGroup());
                        menuWrapPolygon.setDisabled(islocked || !me.api.CanChangeWrapPolygon());
                    }

                    me.menuImageWrap.setDisabled(islocked || value.imgProps.value.get_FromGroup() || (notflow && menuWrapPolygon.isDisabled()));

                    var cancopy = me.api && me.api.can_CopyCut();
                    menuImgCopy.setDisabled(!cancopy);
                    menuImgCut.setDisabled(islocked || !cancopy);
                    menuImgPaste.setDisabled(islocked);

                    var signGuid = (value.imgProps && value.imgProps.value && me.mode.isSignatureSupport) ? value.imgProps.value.asc_getSignatureId() : undefined,
                        isInSign = !!signGuid;
                    menuSignatureEditSign.setVisible(isInSign);
                    menuSignatureEditSetup.setVisible(isInSign);
                    menuEditSignSeparator.setVisible(isInSign);

                    if (isInSign) {
                        menuSignatureEditSign.cmpEl.attr('data-value', signGuid); // sign
                        menuSignatureEditSetup.cmpEl.attr('data-value', signGuid); // edit signature settings
                    }
                },
                items: [
                    menuImgCut,
                    menuImgCopy,
                    menuImgPaste,
                    { caption: '--' },
                    menuSignatureEditSign,
                    menuSignatureEditSetup,
                    menuEditSignSeparator,
                    menuImageArrange,
                    menuImageAlign,
                    me.menuImageWrap,
                    menuImgRotate,
                    { caption: '--' },
                    me.menuImgCrop,
                    me.menuOriginalSize,
                    menuImgReplace,
                    menuChartEdit,
                    { caption: '--' },
                    menuImageAdvanced
                ]
            }).on('hide:after', function(menu, e, isFromInputControl) {
                if (!isFromInputControl) me.fireEvent('editcomplete', me);
                me.currentMenu = null;
            });

            /* table menu*/

            var mnuTableMerge = new Common.UI.MenuItem({
                caption     : me.mergeCellsText
            }).on('click', function(item) {
                if (me.api)
                    me.api.MergeCells();
            });

            var mnuTableSplit = new Common.UI.MenuItem({
                caption     : me.splitCellsText
            }).on('click', function(item) {
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
                            me.fireEvent('editcomplete', me);
                        }
                    })).show();
                }
            });

            var tableCellsVAlign = function(item, e) {
                if (me.api) {
                    var properties = new Asc.CTableProp();
                    properties.put_CellsVAlign(item.options.valign);
                    me.api.tblApply(properties);
                }
            };

            var menuTableCellAlign = new Common.UI.MenuItem({
                caption     : me.cellAlignText,
                menu        : new Common.UI.Menu({
                    menuAlign: 'tl-tr',
                    items   : [
                        me.menuTableCellTop = new Common.UI.MenuItem({
                            caption     : me.textShapeAlignTop,
                            toggleGroup : 'popuptablecellalign',
                            checkable   : true,
                            checked     : false,
                            valign      : Asc.c_oAscVertAlignJc.Top
                        }).on('click', _.bind(tableCellsVAlign, me)),
                        me.menuTableCellCenter = new Common.UI.MenuItem({
                            caption     : me.textShapeAlignMiddle,
                            toggleGroup : 'popuptablecellalign',
                            checkable   : true,
                            checked     : false,
                            valign      : Asc.c_oAscVertAlignJc.Center
                        }).on('click', _.bind(tableCellsVAlign, me)),
                        me.menuTableCellBottom = new Common.UI.MenuItem({
                            caption     : me.textShapeAlignBottom,
                            toggleGroup : 'popuptablecellalign',
                            checkable   : true,
                            checked     : false,
                            valign      : Asc.c_oAscVertAlignJc.Bottom
                        }).on('click', _.bind(tableCellsVAlign, me))
                    ]
                })
            });

            var menuTableAdvanced = new Common.UI.MenuItem({
                caption        : me.advancedTableText
            }).on('click', _.bind(me.advancedTableClick, me));

            var menuParagraphAdvancedInTable = new Common.UI.MenuItem({
                caption     : me.advancedParagraphText
            }).on('click', _.bind(me.advancedParagraphClick, me));

            var menuHyperlinkSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            var menuEditHyperlinkTable = new Common.UI.MenuItem({
                caption     : me.editHyperlinkText
            }).on('click', _.bind(me.editHyperlink, me));

            var menuRemoveHyperlinkTable = new Common.UI.MenuItem({
                caption     : me.removeHyperlinkText
            }).on('click', function(item, e){
                me.api && me.api.remove_Hyperlink(item.hyperProps.value);
                me.fireEvent('editcomplete', me);
            });

            var menuHyperlinkTable = new Common.UI.MenuItem({
                caption     : me.hyperlinkText,
                menu        : new Common.UI.Menu({
                    menuAlign: 'tl-tr',
                    items   : [
                        menuEditHyperlinkTable,
                        menuRemoveHyperlinkTable
                    ]
                })
            });

            var menuTableRemoveControl = new Common.UI.MenuItem({
                caption: me.textRemove,
                value: 'remove'
            }).on('click', _.bind(me.onControlsSelect, me));

            var menuTableControlSettings = new Common.UI.MenuItem({
                    caption: me.textSettings,
                    value: 'settings'
            }).on('click', _.bind(me.onControlsSelect, me));

            var menuTableControl = new Common.UI.MenuItem({
                caption: me.textContentControls,
                menu        : new Common.UI.Menu({
                    menuAlign: 'tl-tr',
                    items   : [
                        menuTableRemoveControl,
                        menuTableControlSettings
                    ]
                })
            });

            var menuTableTOC = new Common.UI.MenuItem({
                caption     : me.textTOC,
                menu        : new Common.UI.Menu({
                    menuAlign: 'tl-tr',
                    items   : [
                        {
                            caption: me.textSettings,
                            value: 'settings'
                        },
                        {
                            caption: me.textUpdateAll,
                            value: 'all'
                        },
                        {
                            caption: me.textUpdatePages,
                            value: 'pages'
                        }
                    ]
                })
            });
            menuTableTOC.menu.on('item:click', function (menu, item, e) {
                me.fireEvent((item.value=='settings') ? 'links:contents' : 'links:update', [item.value, true]);
            });

            /** coauthoring begin **/
            var menuAddCommentTable = new Common.UI.MenuItem({
                caption     : me.addCommentText
            }).on('click', _.bind(me.addComment, me));
            /** coauthoring end **/

            var menuAddHyperlinkTable = new Common.UI.MenuItem({
                caption     : me.hyperlinkText
            }).on('click', _.bind(me.addHyperlink, me));

            var menuTableFollow = new Common.UI.MenuItem({
                caption: me.textFollow
            }).on('click', _.bind(me.onFollowMove, me));

            me.menuSpellTable = new Common.UI.MenuItem({
                caption     : me.loadSpellText,
                disabled    : true
            });

            me.menuSpellMoreTable = new Common.UI.MenuItem({
                caption     : me.moreText,
                menu        : new Common.UI.Menu({
                    menuAlign: 'tl-tr',
                    items   : [
                    ]
                })
            });

            me.langTableMenu = new Common.UI.MenuItem({
                caption     : me.langText,
                menu        : new Common.UI.Menu({
                    cls: 'lang-menu',
                    menuAlign: 'tl-tr',
                    maxHeight: 300,
                    restoreHeight: 300,
                    items   : [
                    ]
                }).on('show:before', function (mnu) {
                    if (!this.scroller) {
                        this.scroller = new Common.UI.Scroller({
                            el: $(this.el).find('.dropdown-menu '),
                            useKeyboard: this.enableKeyEvents && !this.handleSelect,
                            minScrollbarLength: 30,
                            alwaysVisibleY: true
                        });
                    }
                })
            });

            var menuIgnoreSpellTable = new Common.UI.MenuItem({
                caption     : me.ignoreSpellText
            }).on('click', function(item) {
                if (me.api) {
                    me.api.asc_ignoreMisspelledWord(me._currentSpellObj, false);
                    me.fireEvent('editcomplete', me);
                }
            });

            var menuIgnoreAllSpellTable = new Common.UI.MenuItem({
                caption     : me.ignoreAllSpellText
            }).on('click', function(menu) {
                if (me.api) {
                    me.api.asc_ignoreMisspelledWord(me._currentSpellObj, true);
                    me.fireEvent('editcomplete', me);
                }
            });

            var menuIgnoreSpellTableSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            var menuSpellcheckTableSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            me.menuSpellCheckTable = new Common.UI.MenuItem({
                caption     : me.spellcheckText,
                menu        : new Common.UI.Menu({
                    menuAlign: 'tl-tr',
                    items   : [
                        me.menuSpellTable,
                        me.menuSpellMoreTable,
                        menuIgnoreSpellTableSeparator,
                        menuIgnoreSpellTable,
                        menuIgnoreAllSpellTable,
                        { caption: '--' },
                        me.langTableMenu
                    ]
                })
            });

            var menuTableCopy = new Common.UI.MenuItem({
                caption : me.textCopy,
                value : 'copy'
            }).on('click', _.bind(me.onCutCopyPaste, me));

            var menuTablePaste = new Common.UI.MenuItem({
                caption : me.textPaste,
                value : 'paste'
            }).on('click', _.bind(me.onCutCopyPaste, me));

            var menuTableCut = new Common.UI.MenuItem({
                caption : me.textCut,
                value : 'cut'
            }).on('click', _.bind(me.onCutCopyPaste, me));

            var menuEquationSeparatorInTable = new Common.UI.MenuItem({
                caption     : '--'
            });

            var menuTableDistRows = new Common.UI.MenuItem({
                caption : me.textDistributeRows
            }).on('click', _.bind(function(){
                 if (me.api)
                     me.api.asc_DistributeTableCells(false);
                me.fireEvent('editcomplete', me);
            }, me));

            var menuTableDistCols = new Common.UI.MenuItem({
                caption : me.textDistributeCols
            }).on('click', _.bind(function(){
                if (me.api)
                    me.api.asc_DistributeTableCells(true);
                me.fireEvent('editcomplete', me);
            }, me));

            var tableDirection = function(item, e) {
                if (me.api) {
                    var properties = new Asc.CTableProp();
                    properties.put_CellsTextDirection(item.options.direction);
                    me.api.tblApply(properties);
                }
            };

            var menuTableDirection = new Common.UI.MenuItem({
                caption     : me.directionText,
                menu        : new Common.UI.Menu({
                    cls: 'ppm-toolbar',
                    menuAlign: 'tl-tr',
                    items   : [
                        me.menuTableDirectH = new Common.UI.MenuItem({
                            caption     : me.directHText,
                            iconCls     : 'mnu-direct-horiz',
                            checkable   : true,
                            checked     : false,
                            toggleGroup : 'popuptabledirect',
                            direction      : Asc.c_oAscCellTextDirection.LRTB
                        }).on('click', _.bind(tableDirection, me)),
                        me.menuTableDirect90 = new Common.UI.MenuItem({
                            caption     : me.direct90Text,
                            iconCls     : 'mnu-direct-rdown',
                            checkable   : true,
                            checked     : false,
                            toggleGroup : 'popuptabledirect',
                            direction      : Asc.c_oAscCellTextDirection.TBRL
                        }).on('click', _.bind(tableDirection, me)),
                        me.menuTableDirect270 = new Common.UI.MenuItem({
                            caption     : me.direct270Text,
                            iconCls     : 'mnu-direct-rup',
                            checkable   : true,
                            checked     : false,
                            toggleGroup : 'popuptabledirect',
                            direction      : Asc.c_oAscCellTextDirection.BTLR
                        }).on('click', _.bind(tableDirection, me))
                    ]
                })
            });

            var menuTableStartNewList = new Common.UI.MenuItem({
                caption: me.textStartNewList
            }).on('click', _.bind(me.onStartNumbering, me, 1));

            var menuTableStartNumberingFrom = new Common.UI.MenuItem({
                caption: me.textStartNumberingFrom
            }).on('click', _.bind(me.onStartNumbering, me, 'advanced'));

            var menuTableContinueNumbering = new Common.UI.MenuItem({
                caption: me.textContinueNumbering
            }).on('click', _.bind(me.onContinueNumbering, me));

            var menuNumberingTable = new Common.UI.MenuItem({
                caption     : me.bulletsText,
                menu        : new Common.UI.Menu({
                    menuAlign: 'tl-tr',
                    items   : [
                        menuTableStartNewList,
                        menuTableStartNumberingFrom,
                        menuTableContinueNumbering
                    ]
                })
            });

            var menuTableRefreshField = new Common.UI.MenuItem({
                caption: me.textRefreshField
            }).on('click', function(item, e){
                me.api.asc_UpdateComplexField(item.options.fieldProps);
                me.fireEvent('editcomplete', me);
            });

            var menuTableFieldSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            this.tableMenu = new Common.UI.Menu({
                initMenu: function(value){
                    // table properties
                    if (_.isUndefined(value.tableProps))
                        return;

                    var isEquation= (value.mathProps && value.mathProps.value);

                    for (var i = 7; i < 24; i++) {
                        me.tableMenu.items[i].setVisible(!isEquation);
                    }

                    var align = value.tableProps.value.get_CellsVAlign();
                    me.menuTableCellTop.setChecked(align == Asc.c_oAscVertAlignJc.Top);
                    me.menuTableCellCenter.setChecked(align == Asc.c_oAscVertAlignJc.Center);
                    me.menuTableCellBottom.setChecked(align == Asc.c_oAscVertAlignJc.Bottom);

                    var dir = value.tableProps.value.get_CellsTextDirection();
                    me.menuTableDirectH.setChecked(dir == Asc.c_oAscCellTextDirection.LRTB);
                    me.menuTableDirect90.setChecked(dir == Asc.c_oAscCellTextDirection.TBRL);
                    me.menuTableDirect270.setChecked(dir == Asc.c_oAscCellTextDirection.BTLR);

                    var disabled = value.tableProps.locked || (value.headerProps!==undefined && value.headerProps.locked);
                    me.tableMenu.items[10].setDisabled(disabled);
                    me.tableMenu.items[11].setDisabled(disabled);

                    if (me.api) {
                        mnuTableMerge.setDisabled(disabled || !me.api.CheckBeforeMergeCells());
                        mnuTableSplit.setDisabled(disabled || !me.api.CheckBeforeSplitCells());
                    }

                    menuTableDistRows.setDisabled(disabled);
                    menuTableDistCols.setDisabled(disabled);
                    menuTableCellAlign.setDisabled(disabled);
                    menuTableDirection.setDisabled(disabled);

                    menuTableAdvanced.setDisabled(disabled);

                    var cancopy = me.api && me.api.can_CopyCut();
                    menuTableCopy.setDisabled(!cancopy);
                    menuTableCut.setDisabled(disabled || !cancopy);
                    menuTablePaste.setDisabled(disabled);

                    // bullets & numbering
                    var listId = me.api.asc_GetCurrentNumberingId(),
                        in_list = (listId !== null);
                    menuNumberingTable.setVisible(in_list);
                    if (in_list) {
                        var numLvl = me.api.asc_GetNumberingPr(listId).get_Lvl(me.api.asc_GetCurrentNumberingLvl()),
                            format = numLvl.get_Format(),
                            start = me.api.asc_GetCalculatedNumberingValue();
                        menuTableStartNewList.setVisible(numLvl.get_Start()!=start);
                        menuTableStartNewList.value = {start: numLvl.get_Start()};
                        menuTableStartNumberingFrom.setVisible(format != Asc.c_oAscNumberingFormat.Bullet);
                        menuTableStartNumberingFrom.value = {format: format, start: start};
                        menuTableStartNewList.setCaption((format == Asc.c_oAscNumberingFormat.Bullet) ? me.textSeparateList : me.textStartNewList);
                        menuTableContinueNumbering.setCaption((format == Asc.c_oAscNumberingFormat.Bullet) ? me.textJoinList : me.textContinueNumbering);
                    }

                    // hyperlink properties
                    var text = null;
                    if (me.api) {
                        text = me.api.can_AddHyperlink();
                    }
                    menuAddHyperlinkTable.setVisible(value.hyperProps===undefined && text!==false);
                    menuHyperlinkTable.setVisible(value.hyperProps!==undefined);

                    menuEditHyperlinkTable.hyperProps = value.hyperProps;
                    menuRemoveHyperlinkTable.hyperProps = value.hyperProps;

                    if (text!==false) {
                        menuAddHyperlinkTable.hyperProps = {};
                        menuAddHyperlinkTable.hyperProps.value = new Asc.CHyperlinkProperty();
                        menuAddHyperlinkTable.hyperProps.value.put_Text(text);
                    }
                    /** coauthoring begin **/
                        // comments
                    menuAddCommentTable.setVisible(me.api.can_AddQuotedComment()!==false && me.mode.canCoAuthoring && me.mode.canComments);
                    menuAddCommentTable.setDisabled(value.paraProps!==undefined && value.paraProps.locked===true);
                    /** coauthoring end **/

                    // review move
                    var data = me.api.asc_GetRevisionsChangesStack(),
                        move = false;
                    menuTableFollow.value = null;
                    _.each(data, function(item) {
                        if ((item.get_Type()==Asc.c_oAscRevisionsChangeType.TextAdd || item.get_Type() == Asc.c_oAscRevisionsChangeType.TextRem) &&
                            item.get_MoveType()!=Asc.c_oAscRevisionsMove.NoMove) {
                            menuTableFollow.value = item;
                            move = true;
                        }
                    });
                    menuTableFollow.setVisible(move);

                    menuHyperlinkSeparator.setVisible(menuAddHyperlinkTable.isVisible() || menuHyperlinkTable.isVisible() || menuNumberingTable.isVisible() || menuTableFollow.isVisible());

                    // paragraph properties
                    menuParagraphAdvancedInTable.setVisible(value.paraProps!==undefined);

                    me._currentParaObjDisabled = disabled = value.paraProps.locked || (value.headerProps!==undefined && value.headerProps.locked);
                    menuAddHyperlinkTable.setDisabled(disabled);
                    menuHyperlinkTable.setDisabled(disabled || value.hyperProps!==undefined && value.hyperProps.isSeveralLinks===true);
                    menuParagraphAdvancedInTable.setDisabled(disabled);

                    me.menuSpellCheckTable.setVisible(value.spellProps!==undefined && value.spellProps.value.get_Checked()===false);
                    menuSpellcheckTableSeparator.setVisible(value.spellProps!==undefined && value.spellProps.value.get_Checked()===false);
                    
                    me.langTableMenu.setDisabled(disabled);
                    if (value.spellProps!==undefined && value.spellProps.value.get_Checked()===false && value.spellProps.value.get_Variants() !== null && value.spellProps.value.get_Variants() !== undefined) {
                        me.addWordVariants(false);
                    } else {
                        me.menuSpellTable.setCaption(me.loadSpellText, true);
                        me.clearWordVariants(false);
                        me.menuSpellMoreTable.setVisible(false);
                    }

                    if (me.menuSpellCheckTable.isVisible() && me._currLang.id !== me._currLang.tableid) {
                        me.changeLanguageMenu(me.langTableMenu.menu);
                        me._currLang.tableid = me._currLang.id;
                    }

                    //equation menu
                    var eqlen = 0;
                    if (isEquation) {
                        eqlen = me.addEquationMenu(false, 6);
                    } else
                        me.clearEquationMenu(false, 6);
                    menuEquationSeparatorInTable.setVisible(isEquation && eqlen>0);

                    var in_toc = me.api.asc_GetTableOfContentsPr(true),
                        in_control = !in_toc && me.api.asc_IsContentControl();
                    menuTableControl.setVisible(in_control);
                    if (in_control) {
                        var control_props = me.api.asc_GetContentControlProperties(),
                            lock_type = (control_props) ? control_props.get_Lock() : Asc.c_oAscSdtLockType.Unlocked;
                        menuTableRemoveControl.setDisabled(lock_type==Asc.c_oAscSdtLockType.SdtContentLocked || lock_type==Asc.c_oAscSdtLockType.SdtLocked);
                        menuTableControlSettings.setVisible(me.mode.canEditContentControl);
                    }
                    menuTableTOC.setVisible(in_toc);

                    var in_field = me.api.asc_GetCurrentComplexField();
                    menuTableRefreshField.setVisible(!!in_field);
                    menuTableRefreshField.setDisabled(disabled);
                    menuTableFieldSeparator.setVisible(!!in_field);
                    if (in_field) {
                        menuTableRefreshField.options.fieldProps = in_field;
                    }
                },
                items: [
                    me.menuSpellCheckTable,
                    menuSpellcheckTableSeparator,
                    menuTableCut,
                    menuTableCopy,
                    menuTablePaste,
                    { caption: '--' },
                    menuEquationSeparatorInTable,
                    menuTableRefreshField,
                    menuTableFieldSeparator,
                    {
                        caption     : me.selectText,
                        menu        : new Common.UI.Menu({
                            menuAlign: 'tl-tr',
                            style   : 'width: 100px',
                            items   : [
                                new Common.UI.MenuItem({
                                    caption: me.rowText
                                }).on('click', function(item) {
                                    if (me.api)
                                        me.api.selectRow();
                                }),
                                new Common.UI.MenuItem({
                                    caption: me.columnText
                                }).on('click', function(item) {
                                    if (me.api)
                                        me.api.selectColumn();
                                }),
                                new Common.UI.MenuItem({
                                    caption: me.cellText
                                }).on('click', function(item) {
                                    if (me.api)
                                        me.api.selectCell();
                                }),
                                new Common.UI.MenuItem({
                                    caption: me.tableText
                                }).on('click', function(item) {
                                    if (me.api)
                                        me.api.selectTable();
                                })
                            ]
                        })
                    },
                    {
                        caption     : me.insertText,
                        menu        : new Common.UI.Menu({
                            menuAlign: 'tl-tr',
                            style   : 'width: 100px',
                            items   : [
                                new Common.UI.MenuItem({
                                    caption: me.insertColumnLeftText
                                }).on('click', function(item) {
                                    if (me.api)
                                        me.api.addColumnLeft();
                                }),
                                new Common.UI.MenuItem({
                                    caption: me.insertColumnRightText
                                }).on('click', function(item) {
                                    if (me.api)
                                        me.api.addColumnRight();
                                }),
                                new Common.UI.MenuItem({
                                    caption: me.insertRowAboveText
                                }).on('click', function(item) {
                                    if (me.api)
                                        me.api.addRowAbove();
                                }),
                                new Common.UI.MenuItem({
                                    caption: me.insertRowBelowText
                                }).on('click', function(item) {
                                    if (me.api)
                                        me.api.addRowBelow();
                                })
                            ]
                        })
                    },
                    {
                        caption     : me.deleteText,
                        menu        : new Common.UI.Menu({
                            menuAlign: 'tl-tr',
                            style   : 'width: 100px',
                            items   : [
                                new Common.UI.MenuItem({
                                    caption: me.rowText
                                }).on('click', function(item) {
                                    if (me.api)
                                        me.api.remRow();
                                }),
                                new Common.UI.MenuItem({
                                    caption: me.columnText
                                }).on('click', function(item) {
                                    if (me.api)
                                        me.api.remColumn();
                                }),
                                new Common.UI.MenuItem({
                                    caption: me.tableText
                                }).on('click', function(item) {
                                    if (me.api)
                                        me.api.remTable();
                                })
                            ]
                        })
                    },
                    { caption: '--' },
                    mnuTableMerge,
                    mnuTableSplit,
                    { caption: '--' },
                    menuTableDistRows,
                    menuTableDistCols,
                    { caption: '--' },
                    menuTableCellAlign,
                    menuTableDirection,
                    { caption: '--' },
                    menuTableAdvanced,
                    { caption: '--' },
                /** coauthoring begin **/
                    menuAddCommentTable,
                /** coauthoring end **/
                    menuNumberingTable,
                    menuAddHyperlinkTable,
                    menuHyperlinkTable,
                    menuTableFollow,
                    menuHyperlinkSeparator,
                    menuTableControl,
                    menuTableTOC,
                    menuParagraphAdvancedInTable
                ]
            }).on('hide:after', function(menu, e, isFromInputControl) {
                if (me.suppressEditComplete) {
                    me.suppressEditComplete = false;
                    return;
                }

                if (!isFromInputControl) me.fireEvent('editcomplete', me);
                me.currentMenu = null;
            });

            /* text menu */

            var menuParagraphBreakBefore = new Common.UI.MenuItem({
                caption     : me.breakBeforeText,
                checkable   : true
            }).on('click', function(item, e) {
                    me.api.put_PageBreak(item.checked);
            });

            var menuParagraphKeepLines = new Common.UI.MenuItem({
                caption     : me.keepLinesText,
                checkable   : true
            }).on('click', function(item, e) {
                    me.api.put_KeepLines(item.checked);
            });

            var paragraphVAlign = function(item, e) {
                if (me.api) {
                    var properties = new Asc.asc_CImgProperty();
                    properties.put_VerticalTextAlign(item.options.valign);
                    me.api.ImgApply(properties);
                }
            };

            var menuParagraphVAlign = new Common.UI.MenuItem({
                caption     : me.vertAlignText,
                menu        : new Common.UI.Menu({
                    menuAlign: 'tl-tr',
                    items   : [
                        me.menuParagraphTop = new Common.UI.MenuItem({
                            caption     : me.textShapeAlignTop,
                            checkable   : true,
                            checked     : false,
                            toggleGroup : 'popupparagraphvalign',
                            valign      : Asc.c_oAscVAlign.Top
                        }).on('click', _.bind(paragraphVAlign, me)),
                        me.menuParagraphCenter = new Common.UI.MenuItem({
                            caption     : me.textShapeAlignMiddle,
                            checkable   : true,
                            checked     : false,
                            toggleGroup : 'popupparagraphvalign',
                            valign      : Asc.c_oAscVAlign.Center
                        }).on('click', _.bind(paragraphVAlign, me)),
                        me.menuParagraphBottom = new Common.UI.MenuItem({
                            caption     : me.textShapeAlignBottom,
                            checkable   : true,
                            checked     : false,
                            toggleGroup : 'popupparagraphvalign',
                            valign      : Asc.c_oAscVAlign.Bottom
                        }).on('click', _.bind(paragraphVAlign, me))
                    ]
                })
            });

            var paragraphDirection = function(item, e) {
                if (me.api) {
                    var properties = new Asc.asc_CImgProperty();
                    properties.put_Vert(item.options.direction);
                    me.api.ImgApply(properties);
                }
            };

            var menuParagraphDirection = new Common.UI.MenuItem({
                caption     : me.directionText,
                menu        : new Common.UI.Menu({
                    cls: 'ppm-toolbar',
                    menuAlign: 'tl-tr',
                    items   : [
                        me.menuParagraphDirectH = new Common.UI.MenuItem({
                            caption     : me.directHText,
                            iconCls     : 'mnu-direct-horiz',
                            checkable   : true,
                            checked     : false,
                            toggleGroup : 'popupparagraphdirect',
                            direction      : Asc.c_oAscVertDrawingText.normal
                        }).on('click', _.bind(paragraphDirection, me)),
                        me.menuParagraphDirect90 = new Common.UI.MenuItem({
                            caption     : me.direct90Text,
                            iconCls     : 'mnu-direct-rdown',
                            checkable   : true,
                            checked     : false,
                            toggleGroup : 'popupparagraphdirect',
                            direction      : Asc.c_oAscVertDrawingText.vert
                        }).on('click', _.bind(paragraphDirection, me)),
                        me.menuParagraphDirect270 = new Common.UI.MenuItem({
                            caption     : me.direct270Text,
                            iconCls     : 'mnu-direct-rup',
                            checkable   : true,
                            checked     : false,
                            toggleGroup : 'popupparagraphdirect',
                            direction      : Asc.c_oAscVertDrawingText.vert270
                        }).on('click', _.bind(paragraphDirection, me))
                    ]
                })
            });

            var menuParagraphAdvanced = new Common.UI.MenuItem({
                caption     : me.advancedParagraphText
            }).on('click', _.bind(me.advancedParagraphClick, me));

            var menuFrameAdvanced = new Common.UI.MenuItem({
                caption     : me.advancedFrameText
            }).on('click', _.bind(me.advancedFrameClick, me));

            /** coauthoring begin **/
            var menuCommentSeparatorPara = new Common.UI.MenuItem({
                caption     : '--'
            });

            var menuAddCommentPara = new Common.UI.MenuItem({
                caption     : me.addCommentText
            }).on('click', _.bind(me.addComment, me));
            /** coauthoring end **/

            var menuHyperlinkParaSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            var menuAddHyperlinkPara = new Common.UI.MenuItem({
                caption     : me.hyperlinkText
            }).on('click', _.bind(me.addHyperlink, me));

            var menuEditHyperlinkPara = new Common.UI.MenuItem({
                caption     : me.editHyperlinkText
            }).on('click', _.bind(me.editHyperlink, me));

            var menuRemoveHyperlinkPara = new Common.UI.MenuItem({
                caption     : me.removeHyperlinkText
            }).on('click', function(item, e) {
                me.api.remove_Hyperlink(item.hyperProps.value);
                me.fireEvent('editcomplete', me);
            });

            var menuHyperlinkPara = new Common.UI.MenuItem({
                caption     : me.hyperlinkText,
                menu        : new Common.UI.Menu({
                    menuAlign: 'tl-tr',
                    items   : [
                        menuEditHyperlinkPara,
                        menuRemoveHyperlinkPara
                    ]
                })
            });

            var menuStyleSeparator = new Common.UI.MenuItemSeparator();
            var menuStyle = new Common.UI.MenuItem({
                caption: me.styleText,
                menu: new Common.UI.Menu({
                    menuAlign: 'tl-tr',
                    items: [
                        me.menuStyleSave = new Common.UI.MenuItem({
                            caption: me.saveStyleText
                        }).on('click', _.bind(me.onMenuSaveStyle, me)),
                        me.menuStyleUpdate = new Common.UI.MenuItem({
                            caption: me.updateStyleText.replace('%1', window.currentStyleName)
                        }).on('click', _.bind(me.onMenuUpdateStyle, me))
                    ]
                })
            });

            me.menuSpellPara = new Common.UI.MenuItem({
                caption     : me.loadSpellText,
                disabled    : true
            });

            me.menuSpellMorePara = new Common.UI.MenuItem({
                caption     : me.moreText,
                menu        : new Common.UI.Menu({
                    menuAlign: 'tl-tr',
                    style   : 'max-height: 300px;',
                    items: [
                    ]
                })
            });

            me.langParaMenu = new Common.UI.MenuItem({
                caption     : me.langText,
                menu        : new Common.UI.Menu({
                    cls: 'lang-menu',
                    menuAlign: 'tl-tr',
                    maxHeight: 300,
                    restoreHeight: 300,
                    items   : [
                    ]
                }).on('show:before', function (mnu) {
                    if (!this.scroller) {
                        this.scroller = new Common.UI.Scroller({
                            el: $(this.el).find('.dropdown-menu '),
                            useKeyboard: this.enableKeyEvents && !this.handleSelect,
                            minScrollbarLength: 30,
                            alwaysVisibleY: true
                        });
                    }
                })
            });

            var menuIgnoreSpellPara = new Common.UI.MenuItem({
                caption     : me.ignoreSpellText
            }).on('click', function(item, e) {
                me.api.asc_ignoreMisspelledWord(me._currentSpellObj, false);
                me.fireEvent('editcomplete', me);
            });

            var menuIgnoreAllSpellPara = new Common.UI.MenuItem({
                caption     : me.ignoreAllSpellText
            }).on('click', function(item, e) {
                me.api.asc_ignoreMisspelledWord(me._currentSpellObj, true);
                me.fireEvent('editcomplete', me);
            });

            var menuIgnoreSpellParaSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            var menuSpellcheckParaSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            var menuParaCopy = new Common.UI.MenuItem({
                caption : me.textCopy,
                value : 'copy'
            }).on('click', _.bind(me.onCutCopyPaste, me));

            var menuParaPaste = new Common.UI.MenuItem({
                caption : me.textPaste,
                value : 'paste'
            }).on('click', _.bind(me.onCutCopyPaste, me));

            var menuParaCut = new Common.UI.MenuItem({
                caption : me.textCut,
                value : 'cut'
            }).on('click', _.bind(me.onCutCopyPaste, me));

            var menuEquationSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            var menuParaRemoveControl = new Common.UI.MenuItem({
                caption: me.textRemoveControl,
                value: 'remove'
            }).on('click', _.bind(me.onControlsSelect, me));

            var menuParaControlSettings = new Common.UI.MenuItem(
            {
                caption: me.textEditControls,
                value: 'settings'
            }).on('click', _.bind(me.onControlsSelect, me));

            var menuParaControlSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            var menuParaTOCSettings = new Common.UI.MenuItem({
                caption: me.textTOCSettings,
                value: 'settings'
            }).on('click', function (item, e) {
                me.fireEvent('links:contents', [item.value, true]);
            });

            var menuParaTOCRefresh = new Common.UI.MenuItem({
                caption     : me.textUpdateTOC,
                menu        : new Common.UI.Menu({
                    menuAlign: 'tl-tr',
                    items   : [
                        {
                            caption: me.textUpdateAll,
                            value: 'all'
                        },
                        {
                            caption: me.textUpdatePages,
                            value: 'pages'
                        }
                    ]
                })
            });
            menuParaTOCRefresh.menu.on('item:click', function (menu, item, e) {
                me.fireEvent('links:update', [item.value, true]);
            });

            var menuParaTOCSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            var menuParaRefreshField = new Common.UI.MenuItem({
                caption: me.textRefreshField
            }).on('click', function(item, e){
                me.api.asc_UpdateComplexField(item.options.fieldProps);
                me.fireEvent('editcomplete', me);
            });

            var menuParaFieldSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            var menuParaStartNewList = new Common.UI.MenuItem({
                caption: me.textStartNewList
            }).on('click', _.bind(me.onStartNumbering, me, 1));

            var menuParaStartNumberingFrom = new Common.UI.MenuItem({
                caption: me.textStartNumberingFrom
            }).on('click', _.bind(me.onStartNumbering, me, 'advanced'));

            var menuParaContinueNumbering = new Common.UI.MenuItem({
                caption: me.textContinueNumbering
            }).on('click', _.bind(me.onContinueNumbering, me));

            var menuParaNumberingSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            var menuParaFollow = new Common.UI.MenuItem({
                caption: me.textFollow
            }).on('click', _.bind(me.onFollowMove, me));

            var menuParaFollowSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            this.textMenu = new Common.UI.Menu({
                initMenu: function(value){
                    var isInShape = (value.imgProps && value.imgProps.value && !_.isNull(value.imgProps.value.get_ShapeProperties()));
                    var isInChart = (value.imgProps && value.imgProps.value && !_.isNull(value.imgProps.value.get_ChartProperties()));
                    var isEquation= (value.mathProps && value.mathProps.value);

                    menuParagraphVAlign.setVisible(isInShape && !isInChart && !isEquation); // после того, как заголовок можно будет растягивать по вертикали, вернуть "|| isInChart" !!
                    menuParagraphDirection.setVisible(isInShape && !isInChart && !isEquation); // после того, как заголовок можно будет растягивать по вертикали, вернуть "|| isInChart" !!
                    if ( isInShape || isInChart ) {
                        var align = value.imgProps.value.get_VerticalTextAlign();
                        me.menuParagraphTop.setChecked(align == Asc.c_oAscVAlign.Top);
                        me.menuParagraphCenter.setChecked(align == Asc.c_oAscVAlign.Center);
                        me.menuParagraphBottom.setChecked(align == Asc.c_oAscVAlign.Bottom);

                        var dir = value.imgProps.value.get_Vert();
                        me.menuParagraphDirectH.setChecked(dir == Asc.c_oAscVertDrawingText.normal);
                        me.menuParagraphDirect90.setChecked(dir == Asc.c_oAscVertDrawingText.vert);
                        me.menuParagraphDirect270.setChecked(dir == Asc.c_oAscVertDrawingText.vert270);
                    }
                    menuParagraphAdvanced.isChart = (value.imgProps && value.imgProps.isChart);
                    menuParagraphBreakBefore.setVisible(!isInShape && !isInChart && !isEquation);
                    menuParagraphKeepLines.setVisible(!isInShape && !isInChart && !isEquation);
                    if (value.paraProps) {
                        menuParagraphBreakBefore.setChecked(value.paraProps.value.get_PageBreakBefore());
                        menuParagraphKeepLines.setChecked(value.paraProps.value.get_KeepLines());
                    }

                    var text = null;
                    if (me.api) {
                        text = me.api.can_AddHyperlink();
                    }
                    /** coauthoring begin **/
                    menuCommentSeparatorPara.setVisible(!isInChart && me.api.can_AddQuotedComment()!==false && me.mode.canCoAuthoring && me.mode.canComments);
                    menuAddCommentPara.setVisible(!isInChart && me.api.can_AddQuotedComment()!==false && me.mode.canCoAuthoring && me.mode.canComments);
                    menuAddCommentPara.setDisabled(value.paraProps && value.paraProps.locked === true);
                    /** coauthoring end **/

                    menuAddHyperlinkPara.setVisible(value.hyperProps===undefined && text!==false);
                    menuHyperlinkPara.setVisible(value.hyperProps!==undefined);
                    menuHyperlinkParaSeparator.setVisible(menuAddHyperlinkPara.isVisible() || menuHyperlinkPara.isVisible());
                    menuEditHyperlinkPara.hyperProps = value.hyperProps;
                    menuRemoveHyperlinkPara.hyperProps = value.hyperProps;
                    if (text!==false) {
                        menuAddHyperlinkPara.hyperProps = {};
                        menuAddHyperlinkPara.hyperProps.value = new Asc.CHyperlinkProperty();
                        menuAddHyperlinkPara.hyperProps.value.put_Text(text);
                    }
                    var disabled = value.paraProps.locked || (value.headerProps!==undefined && value.headerProps.locked);
                    me._currentParaObjDisabled = disabled;
                    menuAddHyperlinkPara.setDisabled(disabled);
                    menuHyperlinkPara.setDisabled(disabled || value.hyperProps!==undefined && value.hyperProps.isSeveralLinks===true);

                    // review move
                    var data = me.api.asc_GetRevisionsChangesStack(),
                        move = false;
                    menuParaFollow.value = null;
                    _.each(data, function(item) {
                        if ((item.get_Type()==Asc.c_oAscRevisionsChangeType.TextAdd || item.get_Type() == Asc.c_oAscRevisionsChangeType.TextRem) &&
                            item.get_MoveType()!=Asc.c_oAscRevisionsMove.NoMove) {
                            menuParaFollow.value = item;
                            move = true;
                        }
                    });
                    menuParaFollow.setVisible(move);
                    menuParaFollowSeparator.setVisible(move);

                    menuParagraphBreakBefore.setDisabled(disabled || !_.isUndefined(value.headerProps) || !_.isUndefined(value.imgProps));
                    menuParagraphKeepLines.setDisabled(disabled);
                    menuParagraphAdvanced.setDisabled(disabled);
                    menuFrameAdvanced.setDisabled(disabled);
                    menuParagraphVAlign.setDisabled(disabled);
                    menuParagraphDirection.setDisabled(disabled);

                    var cancopy = me.api && me.api.can_CopyCut();
                    menuParaCopy.setDisabled(!cancopy);
                    menuParaCut.setDisabled(disabled || !cancopy);
                    menuParaPaste.setDisabled(disabled);

                    // spellCheck
                    me.menuSpellPara.setVisible(value.spellProps!==undefined && value.spellProps.value.get_Checked()===false);
                    menuSpellcheckParaSeparator.setVisible(value.spellProps!==undefined && value.spellProps.value.get_Checked()===false);
                    menuIgnoreSpellPara.setVisible(value.spellProps!==undefined && value.spellProps.value.get_Checked()===false);
                    menuIgnoreAllSpellPara.setVisible(value.spellProps!==undefined && value.spellProps.value.get_Checked()===false);
                    me.langParaMenu.setVisible(value.spellProps!==undefined && value.spellProps.value.get_Checked()===false);
                    me.langParaMenu.setDisabled(disabled);
                    menuIgnoreSpellParaSeparator.setVisible(value.spellProps!==undefined && value.spellProps.value.get_Checked()===false);

                    if (value.spellProps!==undefined && value.spellProps.value.get_Checked()===false && value.spellProps.value.get_Variants() !== null && value.spellProps.value.get_Variants() !== undefined) {
                        me.addWordVariants(true);
                    } else {
                        me.menuSpellPara.setCaption(me.loadSpellText, true);
                        me.clearWordVariants(true);
                        me.menuSpellMorePara.setVisible(false);
                    }
                    if (me.langParaMenu.isVisible() && me._currLang.id !== me._currLang.paraid) {
                        me.changeLanguageMenu(me.langParaMenu.menu);
                        me._currLang.paraid = me._currLang.id;
                    }

                    //equation menu
                    var eqlen = 0;
                    if (isEquation) {
                        eqlen = me.addEquationMenu(true, 11);
                    } else
                        me.clearEquationMenu(true, 11);
                    menuEquationSeparator.setVisible(isEquation && eqlen>0);

                    menuFrameAdvanced.setVisible(value.paraProps.value.get_FramePr() !== undefined);

                    menuStyleSeparator.setVisible(me.mode.canEditStyles && !isInChart);
                    menuStyle.setVisible(me.mode.canEditStyles && !isInChart);
                    if (me.mode.canEditStyles && !isInChart) {
                        me.menuStyleUpdate.setCaption(me.updateStyleText.replace('%1', DE.getController('Main').translationTable[window.currentStyleName] || window.currentStyleName));
                    }

                    var in_toc = me.api.asc_GetTableOfContentsPr(true),
                        in_control = !in_toc && me.api.asc_IsContentControl() ;
                    menuParaRemoveControl.setVisible(in_control);
                    menuParaControlSettings.setVisible(in_control && me.mode.canEditContentControl);
                    menuParaControlSeparator.setVisible(in_control);
                    if (in_control) {
                        var control_props = me.api.asc_GetContentControlProperties(),
                            lock_type = (control_props) ? control_props.get_Lock() : Asc.c_oAscSdtLockType.Unlocked;
                        menuParaRemoveControl.setDisabled(lock_type==Asc.c_oAscSdtLockType.SdtContentLocked || lock_type==Asc.c_oAscSdtLockType.SdtLocked);
                    }
                    menuParaTOCSettings.setVisible(in_toc);
                    menuParaTOCRefresh.setVisible(in_toc);
                    menuParaTOCSeparator.setVisible(in_toc);

                    var in_field = me.api.asc_GetCurrentComplexField();
                    menuParaRefreshField.setVisible(!!in_field);
                    menuParaRefreshField.setDisabled(disabled);
                    menuParaFieldSeparator.setVisible(!!in_field);
                    if (in_field) {
                        menuParaRefreshField.options.fieldProps = in_field;
                    }

                    var listId = me.api.asc_GetCurrentNumberingId(),
                        in_list = (listId !== null);
                    menuParaNumberingSeparator.setVisible(in_list); // hide when first item is selected
                    menuParaStartNewList.setVisible(in_list);
                    menuParaStartNumberingFrom.setVisible(in_list);
                    menuParaContinueNumbering.setVisible(in_list);
                    if (in_list) {
                        var numLvl = me.api.asc_GetNumberingPr(listId).get_Lvl(me.api.asc_GetCurrentNumberingLvl()),
                            format = numLvl.get_Format(),
                            start = me.api.asc_GetCalculatedNumberingValue();
                        menuParaStartNewList.setVisible(numLvl.get_Start()!=start);
                        menuParaStartNewList.value = {start: numLvl.get_Start()};
                        menuParaStartNumberingFrom.setVisible(format != Asc.c_oAscNumberingFormat.Bullet);
                        menuParaStartNumberingFrom.value = {format: format, start: start};
                        menuParaStartNewList.setCaption((format == Asc.c_oAscNumberingFormat.Bullet) ? me.textSeparateList : me.textStartNewList);
                        menuParaContinueNumbering.setCaption((format == Asc.c_oAscNumberingFormat.Bullet) ? me.textJoinList : me.textContinueNumbering);
                    }
                },
                items: [
                    me.menuSpellPara,
                    me.menuSpellMorePara,
                    menuSpellcheckParaSeparator,
                    menuIgnoreSpellPara,
                    menuIgnoreAllSpellPara,
                    me.langParaMenu,
                    menuIgnoreSpellParaSeparator,
                    menuParaCut,
                    menuParaCopy,
                    menuParaPaste,
                    { caption: '--' },
                    menuEquationSeparator,
                    menuParaRemoveControl,
                    menuParaControlSettings,
                    menuParaControlSeparator,
                    menuParaRefreshField,
                    menuParaFieldSeparator,
                    menuParaTOCSettings,
                    menuParaTOCRefresh,
                    menuParaTOCSeparator,
                    menuParagraphBreakBefore,
                    menuParagraphKeepLines,
                    menuParagraphVAlign,
                    menuParagraphDirection,
                    menuParagraphAdvanced,
                    menuFrameAdvanced,
                /** coauthoring begin **/
                    menuCommentSeparatorPara,
                    menuAddCommentPara,
                /** coauthoring end **/
                    menuHyperlinkParaSeparator,
                    menuAddHyperlinkPara,
                    menuHyperlinkPara,
                    menuParaFollowSeparator,
                    menuParaFollow,
                    menuParaNumberingSeparator,
                    menuParaStartNewList,
                    menuParaStartNumberingFrom,
                    menuParaContinueNumbering,
                    menuStyleSeparator,
                    menuStyle
                ]
            }).on('hide:after', function(menu, e, isFromInputControl) {
                if (me.suppressEditComplete) {
                    me.suppressEditComplete = false;
                    return;
                }

                if (!isFromInputControl) me.fireEvent('editcomplete', me);
                me.currentMenu = null;
            });

            /* header/footer menu */
            var menuEditHeaderFooter = new Common.UI.MenuItem({
                caption: me.editHeaderText
            });

            this.hdrMenu = new Common.UI.Menu({
                initMenu: function(value){
                    menuEditHeaderFooter.setCaption(value.Header ? me.editHeaderText : me.editFooterText, true);
                    menuEditHeaderFooter.off('click').on('click', function(item) {
                        if (me.api){
                            if (value.Header) {
                                me.api.GoToHeader(value.PageNum);
                            }
                            else
                                me.api.GoToFooter(value.PageNum);
                            me.fireEvent('editcomplete', me);
                        }
                    });
                },
                items: [
                    menuEditHeaderFooter
                ]
            }).on('hide:after', function(menu, e, isFromInputControl) {
                if (!isFromInputControl) me.fireEvent('editcomplete', me);
                me.currentMenu = null;
            });

            var nextpage = $('#id_buttonNextPage');
            nextpage.attr('data-toggle', 'tooltip');
            nextpage.tooltip({
                title       : me.textNextPage + Common.Utils.String.platformKey('Alt+PgDn'),
                placement   : 'top-right'
            });

            var prevpage = $('#id_buttonPrevPage');
            prevpage.attr('data-toggle', 'tooltip');
            prevpage.tooltip({
                title       : me.textPrevPage + Common.Utils.String.platformKey('Alt+PgUp'),
                placement   : 'top-right'
            });
        },

        setLanguages: function(langs){
            var me = this;

            if (langs && langs.length > 0 && me.langParaMenu && me.langTableMenu) {
                me.langParaMenu.menu.removeAll();
                me.langTableMenu.menu.removeAll();
                _.each(langs, function(lang, index){
                    me.langParaMenu.menu.addItem(new Common.UI.MenuItem({
                        caption     : lang.displayValue,
                        value       : lang.value,
                        checkable   : true,
                        toggleGroup : 'popupparalang',
                        langid      : lang.code,
                        spellcheck   : lang.spellcheck,
                        template: _.template([
                            '<a id="<%= id %>" tabindex="-1" type="menuitem" style="padding-left: 28px !important;" langval="<%= options.value %>">',
                                '<i class="icon <% if (options.spellcheck) { %> img-toolbarmenu spellcheck-lang <% } %>"></i>',
                                '<%= caption %>',
                            '</a>'
                        ].join(''))
                    }).on('click', function(item, e){
                        if (me.api){
                            if (!_.isUndefined(item.options.langid))
                                me.api.put_TextPrLang(item.options.langid);

                            me._currLang.paraid = item.options.langid;
                            me.langParaMenu.menu.currentCheckedItem = item;

                            me.fireEvent('editcomplete', me);
                        }
                    }));

                    me.langTableMenu.menu.addItem(new Common.UI.MenuItem({
                        caption     : lang.displayValue,
                        value       : lang.value,
                        checkable   : true,
                        toggleGroup : 'popuptablelang',
                        langid      : lang.code,
                        spellcheck   : lang.spellcheck,
                        template: _.template([
                            '<a id="<%= id %>" tabindex="-1" type="menuitem" style="padding-left: 28px !important;" langval="<%= options.value %>">',
                                '<i class="icon <% if (options.spellcheck) { %> img-toolbarmenu spellcheck-lang <% } %>"></i>',
                                '<%= caption %>',
                            '</a>'
                        ].join(''))
                    }).on('click', function(item, e){
                        if (me.api){
                            if (!_.isUndefined(item.options.langid))
                                me.api.put_TextPrLang(item.options.langid);

                            me._currLang.tableid = item.options.langid;
                            me.langTableMenu.menu.currentCheckedItem = item;

                            me.fireEvent('editcomplete', me);
                        }
                    }));
                });
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
                    Common.NotificationCenter.trigger('protect:signature', 'visible', this._isDisabled, datavalue);//guid, can edit settings for requested signature
                    break;
                case 3:
                    this.api.asc_RemoveSignature(datavalue); //guid
                    break;
            }
        },

        onImgRotate: function(item) {
            var properties = new Asc.asc_CImgProperty();
            properties.asc_putRotAdd((item.value==1 ? 90 : 270) * 3.14159265358979 / 180);
            this.api.ImgApply(properties);
            this.fireEvent('editcomplete', this);
        },

        onImgFlip: function(item) {
            var properties = new Asc.asc_CImgProperty();
            if (item.value==1)
                properties.asc_putFlipHInvert(true);
            else
                properties.asc_putFlipVInvert(true);
            this.api.ImgApply(properties);
            this.fireEvent('editcomplete', this);
        },

        onImgCrop: function(item) {
            if (item.value == 1) {
                this.api.asc_cropFill();
            } else if (item.value == 2) {
                this.api.asc_cropFit();
            } else {
                item.checked ? this.api.asc_startEditCrop() : this.api.asc_endEditCrop();
            }
            this.fireEvent('editcomplete', this);
        },

        onFollowMove: function(item) {
            if (this.api) {
                this.api.asc_FollowRevisionMove(item.value);
            }
            this.fireEvent('editcomplete', this);
        },

        focus: function() {
            var me = this;
            _.defer(function(){  me.cmpEl.focus(); }, 50);
        },

        SetDisabled: function(state, canProtect) {
            this._isDisabled = state;
            this._canProtect = canProtect;
        },

        alignmentText           : 'Alignment',
        leftText                : 'Left',
        rightText               : 'Right',
        centerText              : 'Center',
        selectRowText           : 'Select Row',
        selectColumnText        : 'Select Column',
        selectCellText          : 'Select Cell',
        selectTableText         : 'Select Table',
        insertRowAboveText      : 'Row Above',
        insertRowBelowText      : 'Row Below',
        insertColumnLeftText    : 'Column Left',
        insertColumnRightText   : 'Column Right',
        deleteText              : 'Delete',
        deleteRowText           : 'Delete Row',
        deleteColumnText        : 'Delete Column',
        deleteTableText         : 'Delete Table',
        mergeCellsText          : 'Merge Cells',
        splitCellsText          : 'Split Cell...',
        splitCellTitleText      : 'Split Cell',
        originalSizeText        : 'Default Size',
        advancedText            : 'Advanced Settings',
        breakBeforeText         : 'Page break before',
        keepLinesText           : 'Keep lines together',
        editHeaderText          : 'Edit header',
        editFooterText          : 'Edit footer',
        hyperlinkText           : 'Hyperlink',
        editHyperlinkText       : 'Edit Hyperlink',
        removeHyperlinkText     : 'Remove Hyperlink',
        styleText               : 'Formatting as Style',
        saveStyleText           : 'Create new style',
        updateStyleText         : 'Update %1 style',
        txtPressLink            : 'Press CTRL and click link',
        selectText              : 'Select',
        insertRowText           : 'Insert Row',
        insertColumnText        : 'Insert Column',
        rowText                 : 'Row',
        columnText              : 'Column',
        cellText                : 'Cell',
        tableText               : 'Table',
        aboveText               : 'Above',
        belowText               : 'Below',
        advancedTableText       : 'Table Advanced Settings',
        advancedParagraphText   : 'Paragraph Advanced Settings',
        paragraphText           : 'Paragraph',
        guestText               : 'Guest',
        editChartText           : 'Edit Data',
        /** coauthoring begin **/
        addCommentText          : 'Add Comment',
        /** coauthoring end **/
        cellAlignText:          'Cell Vertical Alignment',
        txtInline: 'Inline',
        txtSquare: 'Square',
        txtTight: 'Tight',
        txtThrough: 'Through',
        txtTopAndBottom: 'Top and bottom',
        txtBehind: 'Behind',
        txtInFront: 'In front',
        textWrap:       'Wrapping Style',
        textAlign: 'Align',
        textArrange              : 'Arrange',
        textShapeAlignLeft      : 'Align Left',
        textShapeAlignRight     : 'Align Right',
        textShapeAlignCenter    : 'Align Center',
        textShapeAlignTop       : 'Align Top',
        textShapeAlignBottom    : 'Align Bottom',
        textShapeAlignMiddle    : 'Align Middle',
        textArrangeFront        : 'Bring To Front',
        textArrangeBack         : 'Send To Back',
        textArrangeForward      : 'Bring Forward',
        textArrangeBackward     : 'Send Backward',
        txtGroup                : 'Group',
        txtUngroup              : 'Ungroup',
        textEditWrapBoundary: 'Edit Wrap Boundary',
        vertAlignText: 'Vertical Alignment',
        loadSpellText: 'Loading variants...',
        ignoreAllSpellText: 'Ignore All',
        ignoreSpellText: 'Ignore',
        noSpellVariantsText: 'No variants',
        moreText: 'More variants...',
        spellcheckText: 'Spellcheck',
        langText: 'Select Language',
        advancedFrameText: 'Frame Advanced Settings',
        tipIsLocked             : 'This element is being edited by another user.',
        textNextPage: 'Next Page',
        textPrevPage: 'Previous Page',
        imageText: 'Image Advanced Settings',
        shapeText: 'Shape Advanced Settings',
        chartText: 'Chart Advanced Settings',
        insertText: 'Insert',
        textCopy: 'Copy',
        textPaste: 'Paste',
        textCut: 'Cut',
        directionText: 'Text Direction',
        directHText: 'Horizontal',
        direct90Text: 'Rotate Text Down',
        direct270Text: 'Rotate Text Up°',
        txtRemoveAccentChar: 'Remove accent character',
        txtBorderProps: 'Borders property',
        txtHideTop: 'Hide top border',
        txtHideBottom: 'Hide bottom border',
        txtHideLeft: 'Hide left border',
        txtHideRight: 'Hide right border',
        txtHideHor: 'Hide horizontal line',
        txtHideVer: 'Hide vertical line',
        txtHideLT: 'Hide left top line',
        txtHideLB: 'Hide left bottom line',
        txtAddTop: 'Add top border',
        txtAddBottom: 'Add bottom border',
        txtAddLeft: 'Add left border',
        txtAddRight: 'Add right border',
        txtAddHor: 'Add horizontal line',
        txtAddVer: 'Add vertical line',
        txtAddLT: 'Add left top line',
        txtAddLB: 'Add left bottom line',
        txtRemoveBar: 'Remove bar',
        txtOverbar: 'Bar over text',
        txtUnderbar: 'Bar under text',
        txtRemScripts: 'Remove scripts',
        txtRemSubscript: 'Remove subscript',
        txtRemSuperscript: 'Remove superscript',
        txtScriptsAfter: 'Scripts after text',
        txtScriptsBefore: 'Scripts before text',
        txtFractionStacked: 'Change to stacked fraction',
        txtFractionSkewed: 'Change to skewed fraction',
        txtFractionLinear: 'Change to linear fraction',
        txtRemFractionBar: 'Remove fraction bar',
        txtAddFractionBar: 'Add fraction bar',
        txtRemLimit: 'Remove limit',
        txtLimitOver: 'Limit over text',
        txtLimitUnder: 'Limit under text',
        txtHidePlaceholder: 'Hide placeholder',
        txtShowPlaceholder: 'Show placeholder',
        txtMatrixAlign: 'Matrix alignment',
        txtColumnAlign: 'Column alignment',
        txtTop: 'Top',
        txtBottom: 'Bottom',
        txtInsertEqBefore: 'Insert equation before',
        txtInsertEqAfter: 'Insert equation after',
        txtDeleteEq: 'Delete equation',
        txtLimitChange: 'Change limits location',
        txtHideTopLimit: 'Hide top limit',
        txtShowTopLimit: 'Show top limit',
        txtHideBottomLimit: 'Hide bottom limit',
        txtShowBottomLimit: 'Show bottom limit',
        txtInsertArgBefore: 'Insert argument before',
        txtInsertArgAfter: 'Insert argument after',
        txtDeleteArg: 'Delete argument',
        txtHideOpenBracket: 'Hide opening bracket',
        txtShowOpenBracket: 'Show opening bracket',
        txtHideCloseBracket: 'Hide closing bracket',
        txtShowCloseBracket: 'Show closing bracket',
        txtStretchBrackets: 'Stretch brackets',
        txtMatchBrackets: 'Match brackets to argument height',
        txtGroupCharOver: 'Char over text',
        txtGroupCharUnder: 'Char under text',
        txtDeleteGroupChar: 'Delete char',
        txtHideDegree: 'Hide degree',
        txtShowDegree: 'Show degree',
        txtIncreaseArg: 'Increase argument size',
        txtDecreaseArg: 'Decrease argument size',
        txtInsertBreak: 'Insert manual break',
        txtDeleteBreak: 'Delete manual break',
        txtAlignToChar: 'Align to character',
        txtDeleteRadical: 'Delete radical',
        txtDeleteChars: 'Delete enclosing characters',
        txtDeleteCharsAndSeparators: 'Delete enclosing characters and separators',
        txtKeepTextOnly: 'Keep text only',
        textUndo: 'Undo',
        strSign: 'Sign',
        strDetails: 'Signature Details',
        strSetup: 'Signature Setup',
        strDelete: 'Remove Signature',
        txtOverwriteCells: 'Overwrite cells',
        textNest: 'Nest table',
        textContentControls: 'Content control',
        textRemove: 'Remove',
        textSettings: 'Settings',
        textRemoveControl: 'Remove content control',
        textEditControls: 'Content control settings',
        textDistributeRows: 'Distribute rows',
        textDistributeCols: 'Distribute columns',
        textUpdateTOC: 'Refresh table of contents',
        textUpdateAll: 'Refresh entire table',
        textUpdatePages: 'Refresh page numbers only',
        textTOCSettings: 'Table of contents settings',
        textTOC: 'Table of contents',
        textRefreshField: 'Refresh field',
        txtPasteSourceFormat: 'Keep source formatting',
        textReplace:    'Replace image',
        textFromUrl:    'From URL',
        textFromFile:   'From File',
        textStartNumberingFrom: 'Set numbering value',
        textStartNewList: 'Start new list',
        textContinueNumbering: 'Continue numbering',
        textSeparateList: 'Separate list',
        textJoinList: 'Join to previous list',
        textNumberingValue: 'Numbering Value',
        bulletsText: 'Bullets and Numbering',
        txtDistribHor           : 'Distribute Horizontally',
        txtDistribVert          : 'Distribute Vertically',
        textRotate270: 'Rotate 90° Counterclockwise',
        textRotate90: 'Rotate 90° Clockwise',
        textFlipV: 'Flip Vertically',
        textFlipH: 'Flip Horizontally',
        textRotate: 'Rotate',
        textCrop: 'Crop',
        textCropFill: 'Fill',
        textCropFit: 'Fit',
        textFollow: 'Follow move'

    }, DE.Views.DocumentHolder || {}));
});