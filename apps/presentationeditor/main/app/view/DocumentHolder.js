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
define([
    'jquery',
    'underscore',
    'backbone',
    'gateway',
    'common/main/lib/util/utils',
    'common/main/lib/component/Menu',
    'common/main/lib/view/CopyWarningDialog',
    'presentationeditor/main/app/view/HyperlinkSettingsDialog',
//    'common/main/lib/view/InsertTableDialog',
    'presentationeditor/main/app/view/ParagraphSettingsAdvanced',
    'presentationeditor/main/app/view/ShapeSettingsAdvanced',
    'presentationeditor/main/app/view/TableSettingsAdvanced'
], function ($, _, Backbone, gateway) { 'use strict';

    PE.Views.DocumentHolder =  Backbone.View.extend(_.extend({
        el: '#editor_sdk',

        // Compile our stats template
        template: null,

        // Delegated events for creating new items, and clearing completed ones.
        events: {
        },

        initialize: function () {
            var me = this;

            me.usertips = [];
            me._TtHeight = 20;
            me.slidesCount = 0;
            me.fastcoauthtips = [];
            me._currentMathObj = undefined;
            me._currentParaObjDisabled = false;
            me._currentSpellObj = undefined;
            me._currLang        = {};
            me._state = {};
            me._isDisabled = false;

            /** coauthoring begin **/
            var usersStore = PE.getCollection('Common.Collections.Users');
            /** coauthoring end **/

            var showPopupMenu = function(menu, value, event, docElement, eOpts){
                if (!_.isUndefined(menu) && menu !== null){
                    Common.UI.Menu.Manager.hideAll();

                    var showPoint = [event.get_X(), event.get_Y()],
                        menuContainer = $(me.el).find(Common.Utils.String.format('#menu-container-{0}', menu.id));

                    if (event.get_Type() == Asc.c_oAscContextMenuTypes.Thumbnails) {
                        showPoint[0] -= 3;
                        showPoint[1] -= 3;
                    }

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
                    menu_to_show = null;
                _.each(selectedElements, function(element, index) {
                    var elType  = element.get_ObjectType(),
                        elValue = element.get_ObjectValue();

                    if (Asc.c_oAscTypeSelectElement.Image == elType) {
                        menu_to_show = me.pictureMenu;
                        menu_props.imgProps = {};
                        menu_props.imgProps.value = elValue;
                        menu_props.imgProps.locked = (elValue) ? elValue.get_Locked() : false;
                    } else if (Asc.c_oAscTypeSelectElement.Table == elType)
                    {
                        menu_to_show = me.tableMenu;
                        menu_props.tableProps = {};
                        menu_props.tableProps.value = elValue;
                        menu_props.tableProps.locked = (elValue) ? elValue.get_Locked() : false;
                    } else if (Asc.c_oAscTypeSelectElement.Hyperlink == elType) {
                        menu_props.hyperProps = {};
                        menu_props.hyperProps.value = elValue;
                    } else if (Asc.c_oAscTypeSelectElement.Shape == elType) { // shape
                        menu_to_show = me.pictureMenu;
                        menu_props.shapeProps = {};
                        menu_props.shapeProps.value = elValue;
                        menu_props.shapeProps.locked = (elValue) ? elValue.get_Locked() : false;
                        if (elValue.get_FromChart())
                            menu_props.shapeProps.isChart = true;
                    }
                    else if (Asc.c_oAscTypeSelectElement.Chart == elType) {
                        menu_to_show = me.pictureMenu;
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
                            menu_to_show = me.textMenu;
                    } else if (Asc.c_oAscTypeSelectElement.SpellCheck == elType) {
                        menu_props.spellProps = {};
                        menu_props.spellProps.value = elValue;
                        me._currentSpellObj = elValue;
                    } else if (Asc.c_oAscTypeSelectElement.Math == elType) {
                        menu_props.mathProps = {};
                        menu_props.mathProps.value = elValue;
                        me._currentMathObj = elValue;
                    }
                });
                if (menu_to_show === null) {
                    if (!_.isUndefined(menu_props.paraProps))
                        menu_to_show = me.textMenu;
                    else if (!_.isUndefined(menu_props.slideProps)) {
                        menu_to_show = me.slideMenu;
                    }
                }

                return {menu_to_show: menu_to_show, menu_props: menu_props};
            };

            var fillViewMenuProps = function(selectedElements) {
                if (!selectedElements || !_.isArray(selectedElements)) return;

                if (!me.viewModeMenu)
                    me.createDelayedElementsViewer();

                var menu_props = {},
                    menu_to_show = null;
                _.each(selectedElements, function(element, index) {
                    var elType  = element.get_ObjectType(),
                        elValue = element.get_ObjectValue();

                    if (Asc.c_oAscTypeSelectElement.Image == elType || Asc.c_oAscTypeSelectElement.Table == elType || Asc.c_oAscTypeSelectElement.Shape == elType ||
                        Asc.c_oAscTypeSelectElement.Chart == elType || Asc.c_oAscTypeSelectElement.Paragraph == elType) {
                        menu_to_show = me.viewModeMenu;
                        menu_props.locked = menu_props.locked || ((elValue) ? elValue.get_Locked() : false);
                        if (Asc.c_oAscTypeSelectElement.Chart == elType)
                            menu_props.isChart = true;
                    }
                    else if (Asc.c_oAscTypeSelectElement.Slide == elType) {
                        menu_props.locked = menu_props.locked || ((elValue) ? elValue.get_LockDelete() : false);
                    }
                });

                return (menu_to_show) ? {menu_to_show: menu_to_show, menu_props: menu_props} : null;
            };

            var showObjectMenu = function(event, docElement, eOpts){
                if (me.api){
                    var obj = (me.mode.isEdit && !me._isDisabled) ? fillMenuProps(me.api.getSelectedElements()) : fillViewMenuProps(me.api.getSelectedElements());
                    if (obj) showPopupMenu(obj.menu_to_show, obj.menu_props, event, docElement, eOpts);
                }
            };

            var onContextMenu = function(event){
                _.delay(function(){
                    if (event.get_Type() == Asc.c_oAscContextMenuTypes.Thumbnails) {
                        !me._isDisabled && showPopupMenu.call(me, me.slideMenu, {isSlideSelect: event.get_IsSlideSelect(), isSlideHidden: event.get_IsSlideHidden(), fromThumbs: true}, event);
                    } else {
                        showObjectMenu.call(me, event);
                    }
                },10);
            };

            var onFocusObject = function(selectedElements) {
                if (me.currentMenu && me.currentMenu.isVisible()){
                    if (me.api.asc_getCurrentFocusObject() === 0 ){ // thumbnails
                        if (me.slideMenu===me.currentMenu && !me._isDisabled) {
                            var isHidden = false;
                            _.each(selectedElements, function(element, index) {
                                if (Asc.c_oAscTypeSelectElement.Slide == element.get_ObjectType()) {
                                    isHidden = element.get_ObjectValue().get_IsHidden();
                                }
                            });

                            me.currentMenu.options.initMenu({isSlideSelect: me.slideMenu.items[2].isVisible(), isSlideHidden: isHidden, fromThumbs: true});
                            me.currentMenu.alignPosition();
                        }
                    } else {
                        var obj = (me.mode.isEdit && !me._isDisabled) ? fillMenuProps(selectedElements) : fillViewMenuProps(selectedElements);
                        if (obj) {
                            if (obj.menu_to_show===me.currentMenu) {
                                me.currentMenu.options.initMenu(obj.menu_props);
                                me.currentMenu.alignPosition();
                            }
                        }
                    }
                }
            };

            var handleDocumentWheel = function(event){
                if (me.api) {
                    var delta = (_.isUndefined(event.originalEvent)) ? event.wheelDelta : event.originalEvent.wheelDelta;
                    if (_.isUndefined(delta)) {
                        delta = event.deltaY;
                    }

                    if ((event.ctrlKey || event.metaKey) && !event.altKey){
                        if (delta < 0)
                            me.api.zoomOut();
                        else if (delta > 0)
                            me.api.zoomIn();

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

            var onDocumentHolderResize = function(){
                me._Height      = me.cmpEl.height();
                me._Width       = me.cmpEl.width();
                me._BodyWidth   = $('body').width();
                me._XY          = undefined;

                if (me.slideNumDiv) {
                    me.slideNumDiv.remove();
                    me.slideNumDiv = undefined;
                }
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
                var viewport = PE.getController('Viewport').getView('Viewport');
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
                    title: '<br><b>Press Ctrl and click link</b>'
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

            var onMouseMoveEnd = function() {
                if (screenTip.isHidden && screenTip.isVisible) {
                    screenTip.isVisible = false;
                    screenTip.toolTip.hide();
                }
            };

            var onMouseMove = function(moveData) {
                if (_.isUndefined(me._XY)) {
                    me._XY = [
                        me.cmpEl.offset().left - $(window).scrollLeft(),
                        me.cmpEl.offset().top - $(window).scrollTop()
                    ];
                    me._Width       = me.cmpEl.width();
                    me._Height      = me.cmpEl.height();
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

                            if (screenTip.tipLength !== ToolTip.length || screenTip.strTip.indexOf(ToolTip)<0 ) {
                                screenTip.toolTip.setTitle(ToolTip + '<br><b>' + me.txtPressLink + '</b>');
                                screenTip.tipLength = ToolTip.length;
                                screenTip.strTip = ToolTip;
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
                            showPoint[1] -= screenTip.tipHeight;
                            if (showPoint[0] + screenTip.tipWidth > me._BodyWidth )
                                showPoint[0] = me._BodyWidth - screenTip.tipWidth;
                            screenTip.toolTip.getBSTip().$tip.css({top: showPoint[1] + 'px', left: showPoint[0] + 'px'});
                        }
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
                    $('#id_main_parent').append(src);
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
            
            var onDialogAddHyperlink = function() {
                var win, props, text;
                if (me.api && me.mode.isEdit && !me._isDisabled && !PE.getController('LeftMenu').leftMenu.menuFile.isVisible()){
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
            };

            var onPaintSlideNum = function (slideNum) {
                if (_.isUndefined(me._XY)) {
                    me._XY = [
                        me.cmpEl.offset().left - $(window).scrollLeft(),
                        me.cmpEl.offset().top - $(window).scrollTop()
                    ];
                    me._Width       = me.cmpEl.width();
                    me._Height      = me.cmpEl.height();
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

                me.slideNumDiv.html(me.txtSlide + ' ' + (slideNum + 1));
                me.slideNumDiv.show();
            };

            var onEndPaintSlideNum = function () {
                if (me.slideNumDiv)
                    me.slideNumDiv.hide();
            };

            var onCoAuthoringDisconnect= function() {
                me.mode.isEdit = false;
            };

            var onDoubleClickOnChart = function(chart) {
                if (me.mode.isEdit && !me._isDisabled) {
                    var diagramEditor = PE.getController('Common.Controllers.ExternalDiagramEditor').getView('Common.Views.ExternalDiagramEditor');

                    if (diagramEditor && chart) {
                        diagramEditor.setEditMode(true);
                        diagramEditor.show();
                        diagramEditor.setChartData(new Asc.asc_CChartBinary(chart));
                    }
                }
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
            // Hotkeys
            // ---------------------
            var keymap = {};
            var hkComments = 'alt+h';
            keymap[hkComments] = function() {
                if (me.api.can_AddQuotedComment()!==false && me.slidesCount>0) {
                    me.addComment();
                }
            };

            var hkPreview = 'command+f5,ctrl+f5';
            keymap[hkPreview] = function(e) {
                var isResized = false;
                e.preventDefault();
                e.stopPropagation();
                if (me.slidesCount>0) {
                    Common.NotificationCenter.trigger('preview:start', 0);
                }
            };
            Common.util.Shortcuts.delegateShortcuts({shortcuts:keymap});

            var onApiStartDemonstration = function() {
                if (me.slidesCount>0) {
                    Common.NotificationCenter.trigger('preview:start', 0);
                }
            };

            /** coauthoring end **/

            var onApiCountPages = function(count) {
                me.slidesCount = count;
            };

            var onApiCurrentPages = function(number) {
                if (me.currentMenu && me.currentMenu.isVisible() && me._isFromSlideMenu !== true && me._isFromSlideMenu !== number)
                    me.currentMenu.hide();

                me._isFromSlideMenu = number;
            };

            var onApiUpdateThemeIndex = function(v) {
                me._state.themeId = v;
            };

            var onApiLockDocumentTheme = function() {
                me._state.themeLock = true;
            };

            var onApiUnLockDocumentTheme = function() {
                me._state.themeLock = false;
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
                    me._arrSpecialPaste[Asc.c_oSpecialPasteProps.keepTextOnly] = me.txtKeepTextOnly;
                    me._arrSpecialPaste[Asc.c_oSpecialPasteProps.picture] = me.txtPastePicture;
                    me._arrSpecialPaste[Asc.c_oSpecialPasteProps.sourceformatting] = me.txtPasteSourceFormat;
                    me._arrSpecialPaste[Asc.c_oSpecialPasteProps.destinationFormatting] = me.txtPasteDestFormat;


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

            var onChangeCropState = function(state) {
                this.menuImgCrop.menu.items[0].setChecked(state, true);
            };

            this.setApi = function(o) {
                me.api = o;

                if (me.api) {
                    me.api.asc_registerCallback('asc_onContextMenu',        _.bind(onContextMenu, me));
                    me.api.asc_registerCallback('asc_onMouseMoveStart',     _.bind(onMouseMoveStart, me));
                    me.api.asc_registerCallback('asc_onMouseMoveEnd',       _.bind(onMouseMoveEnd, me));
                    me.api.asc_registerCallback('asc_onPaintSlideNum',      _.bind(onPaintSlideNum, me));
                    me.api.asc_registerCallback('asc_onEndPaintSlideNum',   _.bind(onEndPaintSlideNum, me));
                    me.api.asc_registerCallback('asc_onCountPages',         _.bind(onApiCountPages, me));
                    me.api.asc_registerCallback('asc_onCurrentPage',        _.bind(onApiCurrentPages, me));
                    me.slidesCount = me.api.getCountPages();

                    //hyperlink
                    me.api.asc_registerCallback('asc_onHyperlinkClick',     _.bind(onHyperlinkClick, me));
                    me.api.asc_registerCallback('asc_onMouseMove',          _.bind(onMouseMove, me));

                    if (me.mode.isEdit===true) {
                        me.api.asc_registerCallback('asc_onDialogAddHyperlink', _.bind(onDialogAddHyperlink, me));
                        me.api.asc_registerCallback('asc_doubleClickOnChart', onDoubleClickOnChart);
                        me.api.asc_registerCallback('asc_onSpellCheckVariantsFound',  _.bind(onSpellCheckVariantsFound, me));
                        me.api.asc_registerCallback('asc_onShowSpecialPasteOptions',  _.bind(onShowSpecialPasteOptions, me));
                        me.api.asc_registerCallback('asc_onHideSpecialPasteOptions',  _.bind(onHideSpecialPasteOptions, me));
                        me.api.asc_registerCallback('asc_ChangeCropState',            _.bind(onChangeCropState, me));

                    }
                    me.api.asc_registerCallback('asc_onCoAuthoringDisconnect',  _.bind(onCoAuthoringDisconnect, me));
                    Common.NotificationCenter.on('api:disconnect',              _.bind(onCoAuthoringDisconnect, me));
                    me.api.asc_registerCallback('asc_onTextLanguage',           _.bind(onTextLanguage, me));

                    me.api.asc_registerCallback('asc_onShowForeignCursorLabel', _.bind(onShowForeignCursorLabel, me));
                    me.api.asc_registerCallback('asc_onHideForeignCursorLabel', _.bind(onHideForeignCursorLabel, me));
                    me.api.asc_registerCallback('asc_onFocusObject',            _.bind(onFocusObject, me));
                    me.api.asc_registerCallback('asc_onUpdateThemeIndex',       _.bind(onApiUpdateThemeIndex, me));
                    me.api.asc_registerCallback('asc_onLockDocumentTheme',      _.bind(onApiLockDocumentTheme, me));
                    me.api.asc_registerCallback('asc_onUnLockDocumentTheme',    _.bind(onApiUnLockDocumentTheme, me));
                    me.api.asc_registerCallback('asc_onStartDemonstration',     _.bind(onApiStartDemonstration));
                }

                return me;
            };

            this.mode = {};

            this.setMode = function(mode) {
                me.mode = mode;
                /** coauthoring begin **/
                !(me.mode.canCoAuthoring && me.mode.canComments)
                    ? Common.util.Shortcuts.suspendEvents(hkComments)
                    : Common.util.Shortcuts.resumeEvents(hkComments);
                /** coauthoring end **/

                me.editorConfig = {user: mode.user};
            };

            me.on('render:after', onAfterRender, me);
        },

        render: function () {
            this.fireEvent('render:before', this);

            this.cmpEl = $(this.el);

            this.fireEvent('render:after', this);
            return this;
        },

        focus: function() {
            var me = this;
            _.defer(function(){  me.cmpEl.focus(); }, 50);
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
                        me.fireEvent('editcomplete', me);
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
                        me.fireEvent('editcomplete', me);
                    },
                    slides: _arr
                });
                win.show();
                win.setSettings(item.hyperProps.value);

                Common.component.Analytics.trackEvent('DocumentHolder', 'Edit Hyperlink');
            }
        },

        /** coauthoring begin **/
        addComment: function(item, e, eOpt){
            if (this.api && this.mode.canCoAuthoring && this.mode.canComments) {
                this.suppressEditComplete = true;

                var controller = PE.getController('Common.Controllers.Comments');
                if (controller) {
                    controller.addDummyComment();
                }
            }
        },
        /** coauthoring end **/
        editChartClick: function(){
            var diagramEditor = PE.getController('Common.Controllers.ExternalDiagramEditor').getView('Common.Views.ExternalDiagramEditor');
            if (diagramEditor) {
                diagramEditor.setEditMode(true);
                diagramEditor.show();

                var chart = this.api.asc_getChartObject();
                if (chart) {
                    diagramEditor.setChartData(new Asc.asc_CChartBinary(chart));
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
                                me.fireEvent('editcomplete', me);
                            }
                        })).show();
                    }
                }
            }
            me.fireEvent('editcomplete', me);
        },

        onSlidePickerShowAfter: function(picker) {
            if (!picker._needRecalcSlideLayout) return;
            
            if (picker.cmpEl && picker.dataViewItems.length>0) {
                var dataViewItems = picker.dataViewItems,
                    el = $(dataViewItems[0].el),
                    itemW = el.outerWidth() + parseInt(el.css('margin-left')) + parseInt(el.css('margin-right')),
                    columnCount = Math.floor(picker.cmpEl.width() / itemW),
                    col = 0, maxHeight = 0;

                for (var i=0; i<dataViewItems.length; i++) {
                    var div = $(dataViewItems[i].el).find('.title'),
                        height = div.height();

                    if (height>maxHeight)
                        maxHeight = height;
                    else
                       div.css({'height' : maxHeight });

                    col++;
                    if (col>columnCount-1) { col = 0; maxHeight = 0;}
                }
                picker._needRecalcSlideLayout = false;
            }
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

            this.viewModeMenu = new Common.UI.Menu({
                initMenu: function (value) {
                    menuViewUndo.setVisible(me.mode.canCoAuthoring && me.mode.canComments && !me._isDisabled);
                    menuViewUndo.setDisabled(!me.api.asc_getCanUndo() && !me._isDisabled);
                    menuViewCopySeparator.setVisible(!value.isChart && me.api.can_AddQuotedComment() !== false && me.mode.canCoAuthoring && me.mode.canComments && !me._isDisabled);
                    menuViewAddComment.setVisible(!value.isChart && me.api.can_AddQuotedComment() !== false && me.mode.canCoAuthoring && me.mode.canComments && !me._isDisabled);
                    menuViewAddComment.setDisabled(value.locked);
                },
                items: [
                    menuViewCopy,
                    menuViewUndo,
                    menuViewCopySeparator,
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

        createDelayedElements: function(){
            var me = this;

            var mnuDeleteSlide = new Common.UI.MenuItem({
                caption     : me.txtDeleteSlide
            }).on('click', function(item) {
                if (me.api){
                    me._isFromSlideMenu = true;
                    me.api.DeleteSlide();

                    me.fireEvent('editcomplete', me);
                    Common.component.Analytics.trackEvent('DocumentHolder', 'Delete Slide');
                }
            });

            var mnuChangeSlide = new Common.UI.MenuItem({
                caption     : me.txtChangeLayout,
                menu        : new Common.UI.Menu({
                    menuAlign: 'tl-tr',
                    items: [
                        { template: _.template('<div id="id-docholder-menu-changeslide" class="menu-layouts" style="width: 302px; margin: 0 4px;"></div>') }
                    ]
                })
            });

            var mnuChangeTheme = new Common.UI.MenuItem({
                caption     : me.txtChangeTheme,
                menu        : new Common.UI.Menu({
                    menuAlign: 'tl-tr',
                    items: [
                        { template: _.template('<div id="id-docholder-menu-changetheme" style="width: 280px; margin: 0 4px;"></div>') }
                    ]
                })
            });

            var mnuPreview = new Common.UI.MenuItem({
                caption : me.txtPreview
            }).on('click', function(item) {
                var current = me.api.getCurrentPage();
                Common.NotificationCenter.trigger('preview:start', _.isNumber(current) ? current : 0);
            });

            var mnuSelectAll = new Common.UI.MenuItem({
                caption : me.txtSelectAll
            }).on('click', function(item){
                if (me.api){
                    me.api.SelectAllSlides();

                    me.fireEvent('editcomplete', me);
                    Common.component.Analytics.trackEvent('DocumentHolder', 'Select All Slides');
                }
            });

            var menuSlidePaste = new Common.UI.MenuItem({
                caption : me.textPaste,
                value : 'paste'
            }).on('click', _.bind(me.onCutCopyPaste, me));

            var menuSlideSettings = new Common.UI.MenuItem({
                caption : me.textSlideSettings,
                value : null
            }).on('click', function(item){
                PE.getController('RightMenu').onDoubleClickOnObject(item.options.value);
            });

            var mnuSlideHide = new Common.UI.MenuItem({
                caption : me.txtSlideHide,
                checkable: true,
                checked: false
            }).on('click', function(item){
                if (me.api){
                    me.api.asc_HideSlides(item.checked);

                    me.fireEvent('editcomplete', me);
                    Common.component.Analytics.trackEvent('DocumentHolder', 'Hide Slides');
                }
            });

            me.slideMenu = new Common.UI.Menu({
                initMenu: function(value) {
                    menuSlidePaste.setVisible(value.fromThumbs!==true);
                    me.slideMenu.items[1].setVisible(value.fromThumbs===true); // New Slide
                    me.slideMenu.items[2].setVisible(value.isSlideSelect===true); // Duplicate Slide
                    mnuDeleteSlide.setVisible(value.isSlideSelect===true);
                    mnuSlideHide.setVisible(value.isSlideSelect===true);
                    mnuSlideHide.setChecked(value.isSlideHidden===true);
                    me.slideMenu.items[5].setVisible(value.isSlideSelect===true || value.fromThumbs!==true);
                    mnuChangeSlide.setVisible(value.isSlideSelect===true || value.fromThumbs!==true);
                    mnuChangeTheme.setVisible(value.isSlideSelect===true || value.fromThumbs!==true);
                    menuSlideSettings.setVisible(value.isSlideSelect===true || value.fromThumbs!==true);
                    menuSlideSettings.options.value = null;

                    for (var i = 9; i < 13; i++) {
                        me.slideMenu.items[i].setVisible(value.fromThumbs===true);
                    }

                    var selectedElements = me.api.getSelectedElements(),
                        locked           = false,
                        lockedDeleted    = false,
                        lockedLayout     = false;
                    if (selectedElements && _.isArray(selectedElements)){
                        _.each(selectedElements, function(element, index) {
                            if (Asc.c_oAscTypeSelectElement.Slide == element.get_ObjectType()) {
                                var elValue         = element.get_ObjectValue();
                                locked          = elValue.get_LockDelete();
                                lockedDeleted   = elValue.get_LockRemove();
                                lockedLayout    = elValue.get_LockLayout();
                                menuSlideSettings.options.value = element;
                                me.slideLayoutMenu.options.layout_index = elValue.get_LayoutIndex();
                                return false;
                            }
                        });
                    }
                    for (var i = 0; i < 3; i++) {
                        me.slideMenu.items[i].setDisabled(locked);
                    }
                    mnuPreview.setDisabled(me.slidesCount<1);
                    mnuSelectAll.setDisabled(locked || me.slidesCount<2);
                    mnuDeleteSlide.setDisabled(lockedDeleted || locked);
                    mnuChangeSlide.setDisabled(lockedLayout || locked);
                    mnuChangeTheme.setDisabled(me._state.themeLock || locked );
                    mnuSlideHide.setDisabled(lockedLayout || locked);
                },
                items: [
                    menuSlidePaste,
                    new Common.UI.MenuItem({
                        caption : me.txtNewSlide
                    }).on('click', function(item) {
                        if (me.api) {
                            me._isFromSlideMenu = true;
                            me.api.AddSlide();

                            me.fireEvent('editcomplete', me);
                            Common.component.Analytics.trackEvent('DocumentHolder', 'Add Slide');
                        }
                    }),
                    new Common.UI.MenuItem({
                        caption : me.txtDuplicateSlide
                    }).on('click', function(item){
                        if (me.api) {
                            me._isFromSlideMenu = true;
                            me.api.DublicateSlide();

                            me.fireEvent('editcomplete', me);
                            Common.component.Analytics.trackEvent('DocumentHolder', 'Dublicate Hyperlink');
                        }
                    }),
                    mnuDeleteSlide,
                    mnuSlideHide,
                    {caption: '--'},
                    mnuChangeSlide,
                    mnuChangeTheme,
                    menuSlideSettings,
                    {caption: '--'},
                    mnuSelectAll,
                    {caption: '--'},
                    mnuPreview
                ]
            }).on('hide:after', function(menu, e, isFromInputControl) {
                if (me.suppressEditComplete) {
                    me.suppressEditComplete = false;
                    return;
                }

                if (!isFromInputControl) me.fireEvent('editcomplete', me);
                me.currentMenu = null;
            }).on('render:after', function(cmp) {
                me.slideLayoutMenu = new Common.UI.DataView({
                    el          : $('#id-docholder-menu-changeslide'),
                    parentMenu  : mnuChangeSlide.menu,
                    style: 'max-height: 300px;',
                    store       : PE.getCollection('SlideLayouts'),
                    itemTemplate: _.template([
                        '<div class="layout" id="<%= id %>" style="width: <%= itemWidth %>px;">',
                            '<div style="background-image: url(<%= imageUrl %>); width: <%= itemWidth %>px; height: <%= itemHeight %>px;"/>',
                            '<div class="title"><%= title %></div> ',
                        '</div>'
                    ].join(''))
                }).on('item:click', function(picker, item, record, e) {
                    if (me.api) {
                        me.api.ChangeLayout(record.get('data').idx);
                        if (e.type !== 'click')
                            me.slideMenu.hide();
                        me.fireEvent('editcomplete', me);
                        Common.component.Analytics.trackEvent('DocumentHolder', 'Change Layout');
                    }
                });

                if (me.slideMenu) {
                    mnuChangeSlide.menu.on('show:after', function (menu) {
                        me.onSlidePickerShowAfter(me.slideLayoutMenu);
                        me.slideLayoutMenu.scroller.update({alwaysVisibleY: true});

                        var record = me.slideLayoutMenu.store.findLayoutByIndex(me.slideLayoutMenu.options.layout_index);
                        if (record) {
                            me.slideLayoutMenu.selectRecord(record, true);
                            me.slideLayoutMenu.scrollToRecord(record);
                        }
                    });
                }
                me.slideLayoutMenu._needRecalcSlideLayout = true;
                me.listenTo(PE.getCollection('SlideLayouts'), 'reset',  function() {
                    me.slideLayoutMenu._needRecalcSlideLayout = true;
                });

                me.slideThemeMenu = new Common.UI.DataView({
                    el          : $('#id-docholder-menu-changetheme'),
                    parentMenu  : mnuChangeTheme.menu,
                    // restoreHeight: 300,
                    style: 'max-height: 300px;',
                    store       : PE.getCollection('SlideThemes'),
                    itemTemplate: _.template([
                        '<div class="style" id="<%= id %>" style="width: <%= itemWidth %>px;">',
                        '<div style="background-image: url(<%= imageUrl %>); width: <%= itemWidth %>px; height: <%= itemHeight %>px;"/>',
                        '</div>'
                    ].join(''))
                }).on('item:click', function(picker, item, record, e) {
                    if (me.api) {
                        me.api.ChangeTheme(record.get('themeId'), true);
                        if (e.type !== 'click')
                            me.slideMenu.hide();
                        me.fireEvent('editcomplete', me);
                        Common.component.Analytics.trackEvent('DocumentHolder', 'Change Theme');
                    }
                });

                if (me.slideMenu) {
                    mnuChangeTheme.menu.on('show:after', function (menu) {
                        var record = me.slideThemeMenu.store.findWhere({themeId: me._state.themeId});
                        me.slideThemeMenu.selectRecord(record, true);

                        me.slideThemeMenu.scroller.update({alwaysVisibleY: true});
                        me.slideThemeMenu.scroller.scrollTop(0);
                    });
                }
            });

            var mnuTableMerge = new Common.UI.MenuItem({
                caption     : me.mergeCellsText
            }).on('click', function(item) {
                if (me.api)
                    me.api.MergeCells();
            });

            var mnuTableSplit = new Common.UI.MenuItem({
                caption     : me.splitCellsText
            }).on('click', function(item) {
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
                            me.fireEvent('editcomplete', me);
                        }
                    })).show();
                }
            });

            var menuTableCellAlign = new Common.UI.MenuItem({
                caption     : me.cellAlignText,
                menu    : (function(){
                    function onItemClick(item, e) {
                        if (me.api) {
                            var properties = new Asc.CTableProp();
                            properties.put_CellsVAlign(item.value);
                            me.api.tblApply(properties);
                        }

                        me.fireEvent('editcomplete', me);
                        Common.component.Analytics.trackEvent('DocumentHolder', 'Table Cell Align');
                    }

                    return new Common.UI.Menu({
                        menuAlign: 'tl-tr',
                        items: [
                            me.menuTableCellTop = new Common.UI.MenuItem({
                                caption     : me.textShapeAlignTop,
                                checkable   : true,
                                toggleGroup : 'popuptablecellalign',
                                value       : Asc.c_oAscVertAlignJc.Top
                            }).on('click', _.bind(onItemClick, me)),
                            me.menuTableCellCenter = new Common.UI.MenuItem({
                                caption     : me.textShapeAlignMiddle,
                                checkable   : true,
                                toggleGroup : 'popuptablecellalign',
                                value       : Asc.c_oAscVertAlignJc.Center
                            }).on('click', _.bind(onItemClick, me)),
                            me.menuTableCellBottom = new Common.UI.MenuItem({
                                caption     : me.textShapeAlignBottom,
                                checkable   : true,
                                toggleGroup : 'popuptablecellalign',
                                value       : Asc.c_oAscVertAlignJc.Bottom
                            }).on('click', _.bind(onItemClick, me))
                        ]
                    })
                })()
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

            var menuTableAdvanced = new Common.UI.MenuItem({
                caption     : me.advancedTableText
            }).on('click', function(item) {
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
                                        handler: function(result, value) {
                                            if (result == 'ok') {
                                                if (me.api) {
                                                    me.api.tblApply(value.tableProps);
                                                }
                                            }
                                            me.fireEvent('editcomplete', me);
                                            Common.component.Analytics.trackEvent('DocumentHolder', 'Table Settings Advanced');
                                        }
                                    })).show();
                                break;
                            }
                        }
                    }
                }
            });

            var menuImageAdvanced = new Common.UI.MenuItem({
                caption     : me.advancedImageText
            }).on('click', function(item) {
                if (me.api){
                    var selectedElements = me.api.getSelectedElements();
                    if (selectedElements && selectedElements.length>0){
                        var elType, elValue;

                        for (var i = selectedElements.length - 1; i >= 0; i--) {
                            elType  = selectedElements[i].get_ObjectType();
                            elValue = selectedElements[i].get_ObjectValue();

                            if (Asc.c_oAscTypeSelectElement.Image == elType) {
                                var imgsizeOriginal;

                                if (!menuImgOriginalSize.isDisabled()) {
                                    imgsizeOriginal = me.api.get_OriginalSizeImage();
                                    if (imgsizeOriginal)
                                        imgsizeOriginal = {width:imgsizeOriginal.get_ImageWidth(), height:imgsizeOriginal.get_ImageHeight()};
                                }

                                (new PE.Views.ImageSettingsAdvanced(
                                    {
                                        imageProps: elValue,
                                        sizeOriginal: imgsizeOriginal,
                                        handler: function(result, value) {
                                            if (result == 'ok') {
                                                if (me.api) {
                                                    me.api.ImgApply(value.imageProps);
                                                }
                                            }
                                            me.fireEvent('editcomplete', me);
                                            Common.component.Analytics.trackEvent('DocumentHolder', 'Image Settings Advanced');
                                        }
                                    })).show();
                                break;
                            }
                        }
                    }
                }
            });

            var menuShapeAdvanced = new Common.UI.MenuItem({
                caption     : me.advancedShapeText
            }).on('click', function(item) {
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
                                        handler: function(result, value) {
                                            if (result == 'ok') {
                                                if (me.api) {
                                                    me.api.ShapeApply(value.shapeProps);
                                                }
                                            }
                                            me.fireEvent('editcomplete', me);
                                            Common.component.Analytics.trackEvent('DocumentHolder', 'Image Shape Advanced');
                                        }
                                    })).show();
                                break;
                            }
                        }
                    }
                }
            });

            var menuParagraphAdvanced = new Common.UI.MenuItem({
                caption     : me.advancedParagraphText
            }).on('click', function(item) {
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
                                            me.fireEvent('editcomplete', me);
                                            Common.component.Analytics.trackEvent('DocumentHolder', 'Image Paragraph Advanced');
                                        }
                                    })).show();
                                break;
                            }
                        }
                    }
                }
            });

            var menuCommentParaSeparator = new Common.UI.MenuItem({
                caption : '--'
            });

            var menuAddHyperlinkPara = new Common.UI.MenuItem({
                caption : me.hyperlinkText
            }).on('click', _.bind(me.addHyperlink, me));

            var menuEditHyperlinkPara = new Common.UI.MenuItem({
                caption : me.editHyperlinkText
            }).on('click', _.bind(me.editHyperlink, me));

            var menuRemoveHyperlinkPara = new Common.UI.MenuItem({
                caption : me.removeHyperlinkText
            }).on('click', function(item) {
                if (me.api){
                    me.api.remove_Hyperlink();
                }

                me.fireEvent('editcomplete', me);
                Common.component.Analytics.trackEvent('DocumentHolder', 'Remove Hyperlink');
            });

            var menuHyperlinkPara = new Common.UI.MenuItem({
                caption     : me.hyperlinkText,
                menu        : new Common.UI.Menu({
                    menuAlign: 'tl-tr',
                    items: [
                        menuEditHyperlinkPara,
                        menuRemoveHyperlinkPara
                    ]
                })
            });

            var menuAddHyperlinkTable = new Common.UI.MenuItem({
                caption     : me.hyperlinkText
            }).on('click', _.bind(me.addHyperlink, me));

            var menuEditHyperlinkTable = new Common.UI.MenuItem({
                caption     : me.editHyperlinkText
            }).on('click', _.bind(me.editHyperlink, me));

            var menuRemoveHyperlinkTable = new Common.UI.MenuItem({
                caption     : me.removeHyperlinkText
            }).on('click', function(item) {
                if (me.api){
                    me.api.remove_Hyperlink();
                }

                me.fireEvent('editcomplete', me);
                Common.component.Analytics.trackEvent('DocumentHolder', 'Remove Hyperlink Table');
            });

            var menuHyperlinkTable = new Common.UI.MenuItem({
                caption     : me.hyperlinkText,
                menu        : new Common.UI.Menu({
                    menuAlign: 'tl-tr',
                    items: [
                        menuEditHyperlinkTable,
                        menuRemoveHyperlinkTable
                    ]
                })
            });

            var menuHyperlinkSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            var mnuGroupImg = new Common.UI.MenuItem({
                caption     : this.txtGroup,
                iconCls     : 'mnu-group'
            }).on('click', function(item) {
                if (me.api) {
                    me.api.groupShapes();
                }

                me.fireEvent('editcomplete', this);
                Common.component.Analytics.trackEvent('DocumentHolder', 'Group Image');
            });

            var mnuUnGroupImg = new Common.UI.MenuItem({
                caption     : this.txtUngroup,
                iconCls     : 'mnu-ungroup'
            }).on('click', function(item) {
                if (me.api) {
                    me.api.unGroupShapes();
                }

                me.fireEvent('editcomplete', this);
                Common.component.Analytics.trackEvent('DocumentHolder', 'Ungroup Image');
            });

            var menuImgShapeArrange = new Common.UI.MenuItem({
                caption     : me.txtArrange,
                menu        : new Common.UI.Menu({
                    menuAlign: 'tl-tr',
                    items: [
                        new Common.UI.MenuItem({
                            caption     : this.textArrangeFront,
                            iconCls     : 'mnu-arrange-front'
                        }).on('click', function(item) {
                            if (me.api) {
                                me.api.shapes_bringToFront();
                            }

                            me.fireEvent('editcomplete', me);
                            Common.component.Analytics.trackEvent('DocumentHolder', 'Bring To Front');
                        }),
                        new Common.UI.MenuItem({
                            caption     : this.textArrangeBack,
                            iconCls     : 'mnu-arrange-back'
                        }).on('click', function(item) {
                            if (me.api) {
                                me.api.shapes_bringToBack();
                            }

                            me.fireEvent('editcomplete', me);
                            Common.component.Analytics.trackEvent('DocumentHolder', 'Bring To Back');
                        }),
                        new Common.UI.MenuItem({
                            caption     : this.textArrangeForward,
                            iconCls     : 'mnu-arrange-forward'
                        }).on('click', function(item) {
                            if (me.api) {
                                me.api.shapes_bringForward();
                            }

                            me.fireEvent('editcomplete', me);
                            Common.component.Analytics.trackEvent('DocumentHolder', 'Send Forward');
                        }),
                        new Common.UI.MenuItem({
                            caption     : this.textArrangeBackward,
                            iconCls     : 'mnu-arrange-backward'
                        }).on('click', function(item) {
                            if (me.api) {
                                me.api.shapes_bringBackward();
                            }

                            me.fireEvent('editcomplete', me);
                            Common.component.Analytics.trackEvent('DocumentHolder', 'Send Backward');
                        }),
                        {caption: '--'},
                        mnuGroupImg,
                        mnuUnGroupImg
                    ]
                })
            });

            var menuImgShapeAlign = new Common.UI.MenuItem({
                caption     : me.txtAlign,
                menu        : (function(){
                    function onItemClick(item) {
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
                        }
                        me.fireEvent('editcomplete', me);
                    }

                    return new Common.UI.Menu({
                        menuAlign: 'tl-tr',
                        items: [
                            new Common.UI.MenuItem({
                                caption     : me.textShapeAlignLeft,
                                iconCls     : 'mnu-shape-align-left',
                                value       : Asc.c_oAscAlignShapeType.ALIGN_LEFT
                            }).on('click', _.bind(onItemClick, me)),
                            new Common.UI.MenuItem({
                                caption     : me.textShapeAlignCenter,
                                iconCls     : 'mnu-shape-align-center',
                                value       : Asc.c_oAscAlignShapeType.ALIGN_CENTER
                            }).on('click', _.bind(onItemClick, me)),
                            new Common.UI.MenuItem({
                                caption     : me.textShapeAlignRight,
                                iconCls     : 'mnu-shape-align-right',
                                value       : Asc.c_oAscAlignShapeType.ALIGN_RIGHT
                            }).on('click', _.bind(onItemClick, me)),
                            new Common.UI.MenuItem({
                                caption     : me.textShapeAlignTop,
                                iconCls     : 'mnu-shape-align-top',
                                value       : Asc.c_oAscAlignShapeType.ALIGN_TOP
                            }).on('click', _.bind(onItemClick, me)),
                            new Common.UI.MenuItem({
                                caption     : me.textShapeAlignMiddle,
                                iconCls     : 'mnu-shape-align-middle',
                                value       : Asc.c_oAscAlignShapeType.ALIGN_MIDDLE
                            }).on('click', _.bind(onItemClick, me)),
                            new Common.UI.MenuItem({
                                caption     : me.textShapeAlignBottom,
                                iconCls     : 'mnu-shape-align-bottom',
                                value       : Asc.c_oAscAlignShapeType.ALIGN_BOTTOM
                            }).on('click', _.bind(onItemClick, me)),
                            {caption    : '--'},
                            new Common.UI.MenuItem({
                                caption     : me.txtDistribHor,
                                iconCls     : 'mnu-distrib-hor',
                                value       : 6
                            }).on('click', _.bind(onItemClick, me)),
                            new Common.UI.MenuItem({
                                caption     : me.txtDistribVert,
                                iconCls     : 'mnu-distrib-vert',
                                value       : 7
                            }).on('click', _.bind(onItemClick, me))
                        ]
                    })
                })()
            });

            var menuChartEdit = new Common.UI.MenuItem({
                caption     : me.editChartText
            }).on('click', _.bind(me.editChartClick, me));

            var menuParagraphVAlign = new Common.UI.MenuItem({
                caption     : me.vertAlignText,
                menu        : (function(){
                    function onItemClick(item) {
                        if (me.api) {
                            var properties = new Asc.asc_CShapeProperty();
                            properties.put_VerticalTextAlign(item.value);

                            me.api.ShapeApply(properties);
                        }

                        me.fireEvent('editcomplete', me);
                        Common.component.Analytics.trackEvent('DocumentHolder', 'Text Vertical Align');
                    }

                    return new Common.UI.Menu({
                        menuAlign: 'tl-tr',
                        items: [
                            me.menuParagraphTop = new Common.UI.MenuItem({
                                caption     : me.textShapeAlignTop,
                                checkable   : true,
                                toggleGroup : 'popupparagraphvalign',
                                value       : Asc.c_oAscVAlign.Top
                            }).on('click', _.bind(onItemClick, me)),
                            me.menuParagraphCenter = new Common.UI.MenuItem({
                                caption     : me.textShapeAlignMiddle,
                                checkable   : true,
                                toggleGroup : 'popupparagraphvalign',
                                value       : Asc.c_oAscVAlign.Center
                            }).on('click', _.bind(onItemClick, me)),
                            me.menuParagraphBottom = new Common.UI.MenuItem({
                                caption     : me.textShapeAlignBottom,
                                checkable   : true,
                                toggleGroup : 'popupparagraphvalign',
                                value       : Asc.c_oAscVAlign.Bottom
                            }).on('click', _.bind(onItemClick, me))
                        ]
                    })
                })()
            });

            var paragraphDirection = function(item, e) {
                if (me.api) {
                    var properties = new Asc.asc_CShapeProperty();
                    properties.put_Vert(item.options.direction);
                    me.api.ShapeApply(properties);
                }
                me.fireEvent('editcomplete', me);
                Common.component.Analytics.trackEvent('DocumentHolder', 'Text Direction');
            };

            var menuParagraphDirection = new Common.UI.MenuItem({
                caption     : me.directionText,
                menu        : new Common.UI.Menu({
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

            var menuImgShapeSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            var menuImgOriginalSize = new Common.UI.MenuItem({
                caption     : me.originalSizeText
            }).on('click', function(item){
                if (me.api){
                    var originalImageSize = me.api.get_OriginalSizeImage();

                    if (originalImageSize) {
                        var properties = new Asc.asc_CImgProperty();

                        properties.put_Width(originalImageSize.get_ImageWidth());
                        properties.put_Height(originalImageSize.get_ImageHeight());
                        properties.put_ResetCrop(true);
                        me.api.ImgApply(properties);
                    }

                    me.fireEvent('editcomplete', me);
                    Common.component.Analytics.trackEvent('DocumentHolder', 'Set Image Original Size');
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

            var onImgRotate = function(item) {
                var properties = new Asc.asc_CShapeProperty();
                properties.asc_putRotAdd((item.value==1 ? 90 : 270) * 3.14159265358979 / 180);
                me.api.ShapeApply(properties);
                me.fireEvent('editcomplete', me);
            };

            var onImgFlip = function(item) {
                var properties = new Asc.asc_CShapeProperty();
                if (item.value==1)
                    properties.asc_putFlipHInvert(true);
                else
                    properties.asc_putFlipVInvert(true);
                me.api.ShapeApply(properties);
                me.fireEvent('editcomplete', me);
            };

            var menuImgShapeRotate = new Common.UI.MenuItem({
                caption     : me.textRotate,
                menu        : new Common.UI.Menu({
                    menuAlign: 'tl-tr',
                    items: [
                        new Common.UI.MenuItem({
                            caption: me.textRotate90,
                            value  : 1
                        }).on('click', _.bind(onImgRotate, me)),
                        new Common.UI.MenuItem({
                            caption: me.textRotate270,
                            value  : 0
                        }).on('click', _.bind(onImgRotate, me)),
                        { caption: '--' },
                        new Common.UI.MenuItem({
                            caption: me.textFlipH,
                            value  : 1
                        }).on('click', _.bind(onImgFlip, me)),
                        new Common.UI.MenuItem({
                            caption: me.textFlipV,
                            value  : 0
                        }).on('click', _.bind(onImgFlip, me))
                    ]
                })
            });

            var onImgCrop = function(item) {
                if (item.value == 1) {
                    me.api.asc_cropFill();
                } else if (item.value == 2) {
                    me.api.asc_cropFit();
                } else {
                    item.checked ? me.api.asc_startEditCrop() : me.api.asc_endEditCrop();
                }
                me.fireEvent('editcomplete', me);
            };

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
                        }).on('click', _.bind(onImgCrop, me)),
                        new Common.UI.MenuItem({
                            caption: me.textCropFill,
                            value  : 1
                        }).on('click', _.bind(onImgCrop, me)),
                        new Common.UI.MenuItem({
                            caption: me.textCropFit,
                            value  : 2
                        }).on('click', _.bind(onImgCrop, me))
                    ]
                })
            });

            /** coauthoring begin **/
            var menuAddCommentPara = new Common.UI.MenuItem({
                caption     : me.addCommentText
            }).on('click', _.bind(me.addComment, me));
            menuAddCommentPara.hide();

            var menuAddCommentTable = new Common.UI.MenuItem({
                caption     : me.addCommentText
            }).on('click', _.bind(me.addComment, me));
            menuAddCommentTable.hide();

            var menuCommentSeparatorImg = new Common.UI.MenuItem({
                caption     : '--'
            });
            menuCommentSeparatorImg.hide();

            var menuAddCommentImg = new Common.UI.MenuItem({
                caption     : me.addCommentText
            }).on('click', _.bind(me.addComment, me));
            menuAddCommentImg.hide();
            /** coauthoring end **/

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

            var menuEquationSeparator = new Common.UI.MenuItem({
                caption     : '--'
            });

            var menuEquationSeparatorInTable = new Common.UI.MenuItem({
                caption     : '--'
            });

            me.textMenu = new Common.UI.Menu({
                initMenu: function(value){
                    var isInShape = (value.shapeProps && !_.isNull(value.shapeProps.value));
                    var isInChart = (value.chartProps && !_.isNull(value.chartProps.value));

                    var disabled = (value.paraProps!==undefined  && value.paraProps.locked) ||
                                   (value.slideProps!==undefined && value.slideProps.locked) ||
                                   (isInShape && value.shapeProps.locked);
                    var isEquation= (value.mathProps && value.mathProps.value);
                    me._currentParaObjDisabled = disabled;

                    menuParagraphVAlign.setVisible(isInShape && !isInChart && !isEquation); // после того, как заголовок можно будет растягивать по вертикали, вернуть "|| isInChart" !!
                    menuParagraphDirection.setVisible(isInShape && !isInChart && !isEquation); // после того, как заголовок можно будет растягивать по вертикали, вернуть "|| isInChart" !!
                    if (isInShape || isInChart) {
                        var align = value.shapeProps.value.get_VerticalTextAlign();
                        me.menuParagraphTop.setChecked(align == Asc.c_oAscVAlign.Top);
                        me.menuParagraphCenter.setChecked(align == Asc.c_oAscVAlign.Center);
                        me.menuParagraphBottom.setChecked(align == Asc.c_oAscVAlign.Bottom);

                        var dir = value.shapeProps.value.get_Vert();
                        me.menuParagraphDirectH.setChecked(dir == Asc.c_oAscVertDrawingText.normal);
                        me.menuParagraphDirect90.setChecked(dir == Asc.c_oAscVertDrawingText.vert);
                        me.menuParagraphDirect270.setChecked(dir == Asc.c_oAscVertDrawingText.vert270);
                    }
                    menuParagraphVAlign.setDisabled(disabled);
                    menuParagraphDirection.setDisabled(disabled);

                    var text = null;

                    if (me.api) {
                        text = me.api.can_AddHyperlink();
                    }

                    menuAddHyperlinkPara.setVisible(value.hyperProps===undefined && text!==false);
                    menuHyperlinkPara.setVisible(value.hyperProps!==undefined);

                    menuEditHyperlinkPara.hyperProps = value.hyperProps;

                    if (text!==false) {
                        menuAddHyperlinkPara.hyperProps = {};
                        menuAddHyperlinkPara.hyperProps.value = new Asc.CHyperlinkProperty();
                        menuAddHyperlinkPara.hyperProps.value.put_Text(text);
                    }

                    /** coauthoring begin **/
                    menuAddCommentPara.setVisible(!isInChart && isInShape && me.api.can_AddQuotedComment()!==false && me.mode.canCoAuthoring && me.mode.canComments);
                    /** coauthoring end **/

                    menuCommentParaSeparator.setVisible(/** coauthoring begin **/ menuAddCommentPara.isVisible() || /** coauthoring end **/ menuAddHyperlinkPara.isVisible() || menuHyperlinkPara.isVisible());
                    menuAddHyperlinkPara.setDisabled(disabled);
                    menuHyperlinkPara.setDisabled(disabled);

                    /** coauthoring begin **/
                    menuAddCommentPara.setDisabled(disabled);
                    /** coauthoring end **/

                    menuParagraphAdvanced.setDisabled(disabled);
                    menuParaCut.setDisabled(disabled);
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
                    menuEquationSeparator,
                    { caption: '--' },
                    menuParagraphVAlign,
                    menuParagraphDirection,
                    menuParagraphAdvanced,
                    menuCommentParaSeparator,
                /** coauthoring begin **/
                    menuAddCommentPara,
                /** coauthoring end **/
                    menuAddHyperlinkPara,
                    menuHyperlinkPara
                ]
            }).on('hide:after', function(menu, e, isFromInputControl) {
                if (me.suppressEditComplete) {
                    me.suppressEditComplete = false;
                    return;
                }

                if (!isFromInputControl) me.fireEvent('editcomplete', me);
                me.currentMenu = null;
            });

            me.tableMenu = new Common.UI.Menu({
                initMenu: function(value){
                    // table properties
                    if (_.isUndefined(value.tableProps))
                        return;

                    var isEquation= (value.mathProps && value.mathProps.value);
                    for (var i = 6; i < 19; i++) {
                        me.tableMenu.items[i].setVisible(!isEquation);
                    }

                    var disabled = (value.slideProps!==undefined && value.slideProps.locked);

                    me.menuTableCellTop.setChecked(value.tableProps.value.get_CellsVAlign() == Asc.c_oAscVertAlignJc.Top);
                    me.menuTableCellCenter.setChecked(value.tableProps.value.get_CellsVAlign() == Asc.c_oAscVertAlignJc.Center);
                    me.menuTableCellBottom.setChecked(value.tableProps.value.get_CellsVAlign() == Asc.c_oAscVertAlignJc.Bottom);

                    if (me.api) {
                        mnuTableMerge.setDisabled(value.tableProps.locked || disabled || !me.api.CheckBeforeMergeCells());
                        mnuTableSplit.setDisabled(value.tableProps.locked || disabled || !me.api.CheckBeforeSplitCells());
                    }
                    menuTableDistRows.setDisabled(value.tableProps.locked || disabled);
                    menuTableDistCols.setDisabled(value.tableProps.locked || disabled);

                    me.tableMenu.items[7].setDisabled(value.tableProps.locked || disabled);
                    me.tableMenu.items[8].setDisabled(value.tableProps.locked || disabled);

                    menuTableCellAlign.setDisabled(value.tableProps.locked || disabled);
                    menuTableAdvanced.setDisabled(value.tableProps.locked || disabled);
                    menuTableCut.setDisabled(value.tableProps.locked || disabled);
                    menuTablePaste.setDisabled(value.tableProps.locked || disabled);

                    // hyperlink properties
                    var text = null;

                    if (me.api) {
                        text = me.api.can_AddHyperlink();
                    }

                    menuAddHyperlinkTable.setVisible(!_.isUndefined(value.paraProps) && _.isUndefined(value.hyperProps) && text!==false);
                    menuHyperlinkTable.setVisible(!_.isUndefined(value.paraProps) && !_.isUndefined(value.hyperProps));

                    menuEditHyperlinkTable.hyperProps = value.hyperProps;

                    if (text!==false) {
                        menuAddHyperlinkTable.hyperProps = {};
                        menuAddHyperlinkTable.hyperProps.value = new Asc.CHyperlinkProperty();
                        menuAddHyperlinkTable.hyperProps.value.put_Text(text);
                    }
                    if (!_.isUndefined(value.paraProps)) {
                        menuAddHyperlinkTable.setDisabled(value.paraProps.locked || disabled);
                        menuHyperlinkTable.setDisabled(value.paraProps.locked || disabled);
                        me._currentParaObjDisabled = value.paraProps.locked || disabled;
                    }

                     /** coauthoring begin **/
                    menuAddCommentTable.setVisible(me.api.can_AddQuotedComment()!==false && me.mode.canCoAuthoring && me.mode.canComments);
                    menuAddCommentTable.setDisabled(!_.isUndefined(value.paraProps) && value.paraProps.locked || disabled);
                    /** coauthoring end **/
                    menuHyperlinkSeparator.setVisible(menuAddHyperlinkTable.isVisible() || menuHyperlinkTable.isVisible() /** coauthoring begin **/|| menuAddCommentTable.isVisible()/** coauthoring end **/);

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
                        menuHyperlinkSeparator.setVisible(menuHyperlinkSeparator.isVisible() && eqlen>0);
                    } else
                        me.clearEquationMenu(false, 6);
                },
                items: [
                    me.menuSpellCheckTable,
                    menuSpellcheckTableSeparator,
                    menuTableCut,
                    menuTableCopy,
                    menuTablePaste,
                    { caption: '--' },
                    new Common.UI.MenuItem({
                        caption     : me.selectText,
                        menu        : new Common.UI.Menu({
                            menuAlign: 'tl-tr',
                            items: [
                                new Common.UI.MenuItem({
                                    caption     : me.rowText
                                }).on('click', function() {if (me.api) me.api.selectRow()}),
                                new Common.UI.MenuItem({
                                    caption     : me.columnText
                                }).on('click', function() {if (me.api) me.api.selectColumn()}),
                                new Common.UI.MenuItem({
                                    caption     : me.cellText
                                }).on('click', function() {if (me.api) me.api.selectCell()}),
                                new Common.UI.MenuItem({
                                    caption     : me.tableText
                                }).on('click', function() {if (me.api) me.api.selectTable()})
                            ]
                        })
                    }),
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
                    new Common.UI.MenuItem({
                        caption     : me.deleteText,
                        menu        : new Common.UI.Menu({
                            menuAlign: 'tl-tr',
                            items: [
                                new Common.UI.MenuItem({
                                    caption     : me.rowText
                                }).on('click', function() {if (me.api) me.api.remRow()}),
                                new Common.UI.MenuItem({
                                    caption     : me.columnText
                                }).on('click', function() {if (me.api) me.api.remColumn()}),
                                new Common.UI.MenuItem({
                                    caption     : me.tableText
                                }).on('click', function() {if (me.api) me.api.remTable()})
                            ]
                        })
                    }),
                    { caption: '--' },
                    mnuTableMerge,
                    mnuTableSplit,
                    { caption: '--' },
                    menuTableDistRows,
                    menuTableDistCols,
                    { caption: '--' },
                    menuTableCellAlign,
                    { caption: '--' },
                    menuTableAdvanced,
                    menuHyperlinkSeparator,
                /** coauthoring begin **/
                    menuAddCommentTable,
                /** coauthoring end **/
                    menuAddHyperlinkTable,
                    menuHyperlinkTable
                ]
            }).on('hide:after', function(menu, e, isFromInputControl) {
                if (me.suppressEditComplete) {
                    me.suppressEditComplete = false;
                    return;
                }

                if (!isFromInputControl) me.fireEvent('editcomplete', me);
                me.currentMenu = null;
            });

            me.pictureMenu = new Common.UI.Menu({
                initMenu: function(value){
                    if (me.api) {
                        mnuUnGroupImg.setDisabled(!me.api.canUnGroup());
                        mnuGroupImg.setDisabled(!me.api.canGroup());
                    }

                    var isimage = (_.isUndefined(value.shapeProps) || value.shapeProps.value.get_FromImage()) && _.isUndefined(value.chartProps),
                        imgdisabled = (value.imgProps!==undefined && value.imgProps.locked),
                        shapedisabled = (value.shapeProps!==undefined && value.shapeProps.locked),
                        chartdisabled = (value.chartProps!==undefined && value.chartProps.locked),
                        disabled = imgdisabled || shapedisabled || chartdisabled || (value.slideProps!==undefined && value.slideProps.locked),
                        pluginGuid = (value.imgProps) ? value.imgProps.value.asc_getPluginGuid() : null;

                    menuImgShapeRotate.setVisible(_.isUndefined(value.chartProps) && (pluginGuid===null || pluginGuid===undefined));
                    if (menuImgShapeRotate.isVisible())
                        menuImgShapeRotate.setDisabled(disabled);

                    // image properties
                    menuImgOriginalSize.setVisible(isimage);
                    if (menuImgOriginalSize.isVisible())
                        menuImgOriginalSize.setDisabled(disabled || _.isNull(value.imgProps.value.get_ImageUrl()) || _.isUndefined(value.imgProps.value.get_ImageUrl()));

                    menuImgReplace.setVisible(isimage && (pluginGuid===null || pluginGuid===undefined));
                    if (menuImgReplace.isVisible())
                        menuImgReplace.setDisabled(disabled || pluginGuid===null);

                    me.menuImgCrop.setVisible(me.api.asc_canEditCrop());
                    if (me.menuImgCrop.isVisible())
                        me.menuImgCrop.setDisabled(disabled);

                    menuImageAdvanced.setVisible(isimage);
                    menuShapeAdvanced.setVisible(_.isUndefined(value.imgProps)   && _.isUndefined(value.chartProps));
                    menuChartEdit.setVisible(_.isUndefined(value.imgProps) && !_.isUndefined(value.chartProps) && (_.isUndefined(value.shapeProps) || value.shapeProps.isChart));
                    menuImgShapeSeparator.setVisible(menuImageAdvanced.isVisible() || menuShapeAdvanced.isVisible() || menuChartEdit.isVisible());
                    /** coauthoring begin **/
                    menuAddCommentImg.setVisible(me.api.can_AddQuotedComment()!==false && me.mode.canCoAuthoring && me.mode.canComments);
                    menuCommentSeparatorImg.setVisible(menuAddCommentImg.isVisible());
                    menuAddCommentImg.setDisabled(disabled);
                    /** coauthoring end **/
                    menuImgShapeAlign.setDisabled(disabled);
                    if (!disabled) {
                        var objcount = me.api.asc_getSelectedDrawingObjectsCount(),
                            slide_checked = Common.Utils.InternalSettings.get("pe-align-to-slide") || false;
                        menuImgShapeAlign.menu.items[7].setDisabled(objcount==2 && !slide_checked);
                        menuImgShapeAlign.menu.items[8].setDisabled(objcount==2 && !slide_checked);
                    }
                    menuImageAdvanced.setDisabled(disabled);
                    menuShapeAdvanced.setDisabled(disabled);
                    if (menuChartEdit.isVisible())
                        menuChartEdit.setDisabled(disabled);

                    menuImgCut.setDisabled(disabled);
                    menuImgPaste.setDisabled(disabled);
                },
                items: [
                    menuImgCut,
                    menuImgCopy,
                    menuImgPaste,
                    { caption: '--' },
                    menuImgShapeArrange,
                    menuImgShapeAlign,
                    menuImgShapeRotate,
                    menuImgShapeSeparator,
                    me.menuImgCrop,
                    menuImgOriginalSize,
                    menuImgReplace,
                    menuImageAdvanced,
                    menuShapeAdvanced
                    ,menuChartEdit
                /** coauthoring begin **/
                    ,menuCommentSeparatorImg,
                    menuAddCommentImg
                /** coauthoring end **/
                ]
            }).on('hide:after', function(menu, e, isFromInputControl) {
                if (me.suppressEditComplete) {
                    me.suppressEditComplete = false;
                    return;
                }

                if (!isFromInputControl) me.fireEvent('editcomplete', me);
                me.currentMenu = null;
            });

            var nextpage = $('#id_buttonNextPage');
            nextpage.attr('data-toggle', 'tooltip');
            nextpage.tooltip({
                title       : me.textNextPage + Common.Utils.String.platformKey('PgDn'),
                placement   : 'top-right'
            });

            var prevpage = $('#id_buttonPrevPage');
            prevpage.attr('data-toggle', 'tooltip');
            prevpage.tooltip({
                title       : me.textPrevPage + Common.Utils.String.platformKey('PgUp'),
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

        SetDisabled: function(state) {
            this._isDisabled = state;
        },

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
        advancedImageText       : 'Image Advanced Settings',
        hyperlinkText           : 'Hyperlink',
        editHyperlinkText       : 'Edit Hyperlink',
        removeHyperlinkText     : 'Remove Hyperlink',
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
        txtSelectAll            : 'Select All',
        txtNewSlide             : 'New Slide',
        txtDuplicateSlide       : 'Duplicate Slide',
        txtDeleteSlide          : 'Delete Slide',
        txtBackground           : 'Background',
        txtChangeLayout         : 'Change Layout',
        txtPreview              : 'Start slideshow',
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
        txtArrange              : 'Arrange',
        txtAlign                : 'Align',
        txtDistribHor           : 'Distribute Horizontally',
        txtDistribVert          : 'Distribute Vertically',
        txtSlide                : 'Slide',
        cellAlignText           : 'Cell Vertical Alignment',
        advancedShapeText       : 'Shape Advanced Settings',
        /** coauthoring begin **/
        addCommentText          : 'Add Comment',
        /** coauthoring end **/
        editChartText           : 'Edit Data',
        vertAlignText           : 'Vertical Alignment',
        advancedParagraphText   : 'Text Advanced Settings',
        tipIsLocked             : "This element is currently being edited by another user.",
        textNextPage            : 'Next Slide',
        textPrevPage            : 'Previous Slide',
        insertText: 'Insert',
        textCopy: 'Copy',
        textPaste: 'Paste',
        textCut: 'Cut',
        textSlideSettings: 'Slide Settings',
        directionText: 'Text Direction',
        directHText: 'Horizontal',
        direct90Text: 'Rotate Text Down',
        direct270Text: 'Rotate Text Up',
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
        alignmentText: 'Alignment',
        leftText: 'Left',
        rightText: 'Right',
        centerText: 'Center',
        loadSpellText: 'Loading variants...',
        ignoreAllSpellText: 'Ignore All',
        ignoreSpellText: 'Ignore',
        noSpellVariantsText: 'No variants',
        moreText: 'More variants...',
        spellcheckText: 'Spellcheck',
        langText: 'Select Language',
        textUndo: 'Undo',
        txtSlideHide: 'Hide Slide',
        txtChangeTheme: 'Change Theme',
        txtKeepTextOnly: 'Keep text only',
        txtPastePicture: 'Picture',
        txtPasteSourceFormat: 'Keep source formatting',
        txtPasteDestFormat: 'Use destination theme',
        textDistributeRows: 'Distribute rows',
        textDistributeCols: 'Distribute columns',
        textReplace:    'Replace image',
        textFromUrl:    'From URL',
        textFromFile:   'From File',
        textRotate270: 'Rotate 90° Counterclockwise',
        textRotate90: 'Rotate 90° Clockwise',
        textFlipV: 'Flip Vertically',
        textFlipH: 'Flip Horizontally',
        textRotate: 'Rotate',
        textCrop: 'Crop',
        textCropFill: 'Fill',
        textCropFit: 'Fit'

    }, PE.Views.DocumentHolder || {}));
});