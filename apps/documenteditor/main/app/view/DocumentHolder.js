/**
 *  DocumentHolder.js
 *
 *  DocumentHolder view
 *
 *  Created by Alexander Yuzhin on 1/11/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
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
    'documenteditor/main/app/view/TableSettingsAdvanced'
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

            var showPopupMenu = function(menu, value, event, docElement, eOpts){
                if (!_.isUndefined(menu)  && menu !== null && me.mode.isEdit){
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
                        var value = Common.localStorage.getItem("de-settings-inputmode"); // only for hieroglyphs mode
                        if (value!==null && parseInt(value) == 1)
                            me.api.asc_enableKeyEvents(false);
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
                    if (c_oAscTypeSelectElement.Image == elType) {
                        //image
                        menu_to_show = me.pictureMenu;
                        if (menu_props.imgProps===undefined)
                            menu_props.imgProps = {};
                        var shapeprops = elValue.get_ShapeProperties();
                        var chartprops = elValue.get_ChartProperties();
                        if (shapeprops) {
                            if (shapeprops.get_FromChart())
                                menu_props.imgProps.isChart = true;
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
                    } else if (c_oAscTypeSelectElement.Table == elType)
                    {
                        menu_to_show = me.tableMenu;
                        menu_props.tableProps = {};
                        menu_props.tableProps.value = elValue;
                        menu_props.tableProps.locked = (elValue) ? elValue.get_Locked() : false;
                        noobject = false;
                    } else if (c_oAscTypeSelectElement.Paragraph == elType)
                    {
                        menu_props.paraProps = {};
                        menu_props.paraProps.value = elValue;
                        menu_props.paraProps.locked = (elValue) ? elValue.get_Locked() : false;
                        if ( menu_props.imgProps && (menu_props.imgProps.isChart || menu_props.imgProps.isShape) && // text in shape, need to show paragraph menu with vertical align
                            menu_props.tableProps===undefined )
                            menu_to_show = me.textMenu;
                        noobject = false;
                    } else if (c_oAscTypeSelectElement.Hyperlink == elType) {
                        if (menu_props.hyperProps)
                            menu_props.hyperProps.isSeveralLinks = true;
                        else
                            menu_props.hyperProps = {};
                        menu_props.hyperProps.value = elValue;
                    } else if (c_oAscTypeSelectElement.Header == elType) {
                        menu_props.headerProps = {};
                        menu_props.headerProps.locked = (elValue) ? elValue.get_Locked() : false;
                    } else if (c_oAscTypeSelectElement.SpellCheck == elType) {
                        menu_props.spellProps = {};
                        menu_props.spellProps.value = elValue;
                        me._currentSpellObj = elValue;
                    } else if (c_oAscTypeSelectElement.Math == elType) {
                        menu_props.mathProps = {};
                        menu_props.mathProps.value = elValue;
                        me._currentMathObj = elValue;
                    }
                }
                return (!noobject) ? {menu_to_show: menu_to_show, menu_props: menu_props} : null;
            };

            var showObjectMenu = function(event, docElement, eOpts){
                if (me.api && me.mode.isEdit){
                    var obj = fillMenuProps(me.api.getSelectedElements());
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
                if (me.mode.isEdit && me.currentMenu && me.currentMenu.isVisible() && me.currentMenu !== me.hdrMenu){
                    var obj = fillMenuProps(selectedElements);
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
                        if (key === Common.UI.Keys.NUM_PLUS || key === Common.UI.Keys.EQUALITY || (Common.Utils.isOpera && key == 43)){
                            me.api.zoomIn();
                            event.preventDefault();
                            event.stopPropagation();
                            return false;
                        }
                        else if (key === Common.UI.Keys.NUM_MINUS || key === Common.UI.Keys.MINUS || (Common.Utils.isOpera && key == 45)){
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
                if (me._XY === undefined) {
                    me._XY = [
                        me.cmpEl.offset().left - $(window).scrollLeft(),
                        me.cmpEl.offset().top - $(window).scrollTop()
                    ];
                    me._Height = me.cmpEl.height();
                    me._BodyWidth = $('body').width();
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
                        showPoint[0] = me._BodyWidth - showPoint[0];
                        showPoint[1] -= ((moveData.get_LockedObjectType()==2) ? me._TtHeight : 0);

                        if (showPoint[1] > me._XY[1] && showPoint[1]+me._TtHeight < me._XY[1]+me._Height)  {
                            src.text(ToolTip);
                            src.css({visibility: 'visible', top: showPoint[1] + 'px', right: showPoint[0] + 'px'});
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

            var onDialogAddHyperlink = function() {
                var win, props, text;
                if (me.api && me.mode.isEdit){
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

                        props = new CHyperlinkProperty();
                        props.put_Text(text);

                        win.show();
                        win.setSettings(props);
                    } else {
                        var selectedElements = me.api.getSelectedElements();
                        if (selectedElements && _.isArray(selectedElements)){
                            _.each(selectedElements, function(el, i) {
                                if (selectedElements[i].get_ObjectType() == c_oAscTypeSelectElement.Hyperlink)
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
                if (me.mode.isEdit) {
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
                        if ( selectedElements[i].get_ObjectType() == c_oAscTypeSelectElement.SpellCheck) {
                            props = selectedElements[i].get_ObjectValue();
                            me._currentSpellObj = props;
                            break;
                        }
                    }
                }
                if (props && props.get_Checked()===false && props.get_Variants() !== null && props.get_Variants() !== undefined) {
                    me.addWordVariants();
                    if (me.textMenu.isVisible()) {
                        me.textMenu.alignPosition();
                    }
                }
            };

            this.addWordVariants = function(isParagraph) {
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
                            _.each(arr, function(variant){
                                me.textMenu.insertItem(0, variant);
                            })
                        } else {
                            _.each(arr, function(variant){
                                me.menuSpellCheckTable.menu.insertItem(0, variant);
                            })
                        }
                    }

                    if (arrMore.length > 0) {
                        _.each(arrMore, function(variant){
                            moreMenu.menu.insertItem(0, variant);
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
                    case c_oAscMathInterfaceType.Accent:
                        mnu = new Common.UI.MenuItem({
                            caption     : me.txtRemoveAccentChar,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'remove_AccentCharacter'}
                        });
                        arr.push(mnu);
                        break;
                    case c_oAscMathInterfaceType.BorderBox:
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
                    case c_oAscMathInterfaceType.Bar:
                        mnu = new Common.UI.MenuItem({
                            caption     : me.txtRemoveBar,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'remove_Bar'}
                        });
                        arr.push(mnu);
                        mnu = new Common.UI.MenuItem({
                            caption     : (value.get_Pos()==c_oAscMathInterfaceBarPos.Top) ? me.txtUnderbar : me.txtOverbar,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'put_Pos', value: (value.get_Pos()==c_oAscMathInterfaceBarPos.Top) ? c_oAscMathInterfaceBarPos.Bottom : c_oAscMathInterfaceBarPos.Top}
                        });
                        arr.push(mnu);
                        break;
                    case c_oAscMathInterfaceType.Script:
                        var scripttype = value.get_ScriptType();
                        if (scripttype == c_oAscMathInterfaceScript.PreSubSup) {
                            mnu = new Common.UI.MenuItem({
                                caption     : me.txtScriptsAfter,
                                equation    : true,
                                disabled    : me._currentParaObjDisabled,
                                equationProps: {type: type, callback: 'put_ScriptType', value: c_oAscMathInterfaceScript.SubSup}
                            });
                            arr.push(mnu);
                            mnu = new Common.UI.MenuItem({
                                caption     : me.txtRemScripts,
                                equation    : true,
                                disabled    : me._currentParaObjDisabled,
                                equationProps: {type: type, callback: 'put_ScriptType', value: c_oAscMathInterfaceScript.None}
                            });
                            arr.push(mnu);
                        } else {
                            if (scripttype == c_oAscMathInterfaceScript.SubSup) {
                                mnu = new Common.UI.MenuItem({
                                    caption     : me.txtScriptsBefore,
                                    equation    : true,
                                    disabled    : me._currentParaObjDisabled,
                                    equationProps: {type: type, callback: 'put_ScriptType', value: c_oAscMathInterfaceScript.PreSubSup}
                                });
                                arr.push(mnu);
                            }
                            if (scripttype == c_oAscMathInterfaceScript.SubSup || scripttype == c_oAscMathInterfaceScript.Sub ) {
                                mnu = new Common.UI.MenuItem({
                                    caption     : me.txtRemSubscript,
                                    equation    : true,
                                    disabled    : me._currentParaObjDisabled,
                                    equationProps: {type: type, callback: 'put_ScriptType', value: (scripttype == c_oAscMathInterfaceScript.SubSup) ? c_oAscMathInterfaceScript.Sup : c_oAscMathInterfaceScript.None }
                                });
                                arr.push(mnu);
                            }
                            if (scripttype == c_oAscMathInterfaceScript.SubSup || scripttype == c_oAscMathInterfaceScript.Sup ) {
                                mnu = new Common.UI.MenuItem({
                                    caption     : me.txtRemSuperscript,
                                    equation    : true,
                                    disabled    : me._currentParaObjDisabled,
                                    equationProps: {type: type, callback: 'put_ScriptType', value: (scripttype == c_oAscMathInterfaceScript.SubSup) ? c_oAscMathInterfaceScript.Sub : c_oAscMathInterfaceScript.None }
                                });
                                arr.push(mnu);
                            }
                        }
                        break;
                    case c_oAscMathInterfaceType.Fraction:
                        var fraction = value.get_FractionType();
                        if (fraction==c_oAscMathInterfaceFraction.Skewed || fraction==c_oAscMathInterfaceFraction.Linear) {
                            mnu = new Common.UI.MenuItem({
                                caption     : me.txtFractionStacked,
                                equation    : true,
                                disabled    : me._currentParaObjDisabled,
                                equationProps: {type: type, callback: 'put_FractionType', value: c_oAscMathInterfaceFraction.Bar}
                            });
                            arr.push(mnu);
                        }
                        if (fraction==c_oAscMathInterfaceFraction.Bar || fraction==c_oAscMathInterfaceFraction.Linear) {
                            mnu = new Common.UI.MenuItem({
                                caption     : me.txtFractionSkewed,
                                equation    : true,
                                disabled    : me._currentParaObjDisabled,
                                equationProps: {type: type, callback: 'put_FractionType', value: c_oAscMathInterfaceFraction.Skewed}
                            });
                            arr.push(mnu);
                        }
                        if (fraction==c_oAscMathInterfaceFraction.Bar || fraction==c_oAscMathInterfaceFraction.Skewed) {
                            mnu = new Common.UI.MenuItem({
                                caption     : me.txtFractionLinear,
                                equation    : true,
                                disabled    : me._currentParaObjDisabled,
                                equationProps: {type: type, callback: 'put_FractionType', value: c_oAscMathInterfaceFraction.Linear}
                            });
                            arr.push(mnu);
                        }
                        if (fraction==c_oAscMathInterfaceFraction.Bar || fraction==c_oAscMathInterfaceFraction.NoBar) {
                            mnu = new Common.UI.MenuItem({
                                caption     : (fraction==c_oAscMathInterfaceFraction.Bar) ? me.txtRemFractionBar : me.txtAddFractionBar,
                                equation    : true,
                                disabled    : me._currentParaObjDisabled,
                                equationProps: {type: type, callback: 'put_FractionType', value: (fraction==c_oAscMathInterfaceFraction.Bar) ? c_oAscMathInterfaceFraction.NoBar : c_oAscMathInterfaceFraction.Bar}
                            });
                            arr.push(mnu);
                        }
                        break;
                    case c_oAscMathInterfaceType.Limit:
                        mnu = new Common.UI.MenuItem({
                            caption     : (value.get_Pos()==c_oAscMathInterfaceLimitPos.Top) ? me.txtLimitUnder : me.txtLimitOver,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'put_Pos', value: (value.get_Pos()==c_oAscMathInterfaceLimitPos.Top) ? c_oAscMathInterfaceLimitPos.Bottom : c_oAscMathInterfaceLimitPos.Top}
                        });
                        arr.push(mnu);
                        mnu = new Common.UI.MenuItem({
                            caption     : me.txtRemLimit,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'put_Pos', value: c_oAscMathInterfaceLimitPos.None}
                        });
                        arr.push(mnu);
                        break;
                    case c_oAscMathInterfaceType.Matrix:
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
                                        checked     : (value.get_MatrixAlign()==c_oAscMathInterfaceMatrixMatrixAlign.Top),
                                        equationProps: {type: type, callback: 'put_MatrixAlign', value: c_oAscMathInterfaceMatrixMatrixAlign.Top}
                                    },
                                    {
                                        caption: me.centerText,
                                        checkable   : true,
                                        checked     : (value.get_MatrixAlign()==c_oAscMathInterfaceMatrixMatrixAlign.Center),
                                        equationProps: {type: type, callback: 'put_MatrixAlign', value: c_oAscMathInterfaceMatrixMatrixAlign.Center}
                                    },
                                    {
                                        caption: me.txtBottom,
                                        checkable   : true,
                                        checked     : (value.get_MatrixAlign()==c_oAscMathInterfaceMatrixMatrixAlign.Bottom),
                                        equationProps: {type: type, callback: 'put_MatrixAlign', value: c_oAscMathInterfaceMatrixMatrixAlign.Bottom}
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
                                        checked     : (value.get_ColumnAlign()==c_oAscMathInterfaceMatrixColumnAlign.Left),
                                        equationProps: {type: type, callback: 'put_ColumnAlign', value: c_oAscMathInterfaceMatrixColumnAlign.Left}
                                    },
                                    {
                                        caption: me.centerText,
                                        checkable   : true,
                                        checked     : (value.get_ColumnAlign()==c_oAscMathInterfaceMatrixColumnAlign.Center),
                                        equationProps: {type: type, callback: 'put_ColumnAlign', value: c_oAscMathInterfaceMatrixColumnAlign.Center}
                                    },
                                    {
                                        caption: me.rightText,
                                        checkable   : true,
                                        checked     : (value.get_ColumnAlign()==c_oAscMathInterfaceMatrixColumnAlign.Right),
                                        equationProps: {type: type, callback: 'put_ColumnAlign', value: c_oAscMathInterfaceMatrixColumnAlign.Right}
                                    }
                                ]
                            })
                        });
                        arr.push(mnu);
                        break;
                    case c_oAscMathInterfaceType.EqArray:
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
                                        checked     : (value.get_Align()==c_oAscMathInterfaceEqArrayAlign.Top),
                                        equationProps: {type: type, callback: 'put_Align', value: c_oAscMathInterfaceEqArrayAlign.Top}
                                    },
                                    {
                                        caption: me.centerText,
                                        checkable   : true,
                                        checked     : (value.get_Align()==c_oAscMathInterfaceEqArrayAlign.Center),
                                        equationProps: {type: type, callback: 'put_Align', value: c_oAscMathInterfaceEqArrayAlign.Center}
                                    },
                                    {
                                        caption: me.txtBottom,
                                        checkable   : true,
                                        checked     : (value.get_Align()==c_oAscMathInterfaceEqArrayAlign.Bottom),
                                        equationProps: {type: type, callback: 'put_Align', value: c_oAscMathInterfaceEqArrayAlign.Bottom}
                                    }
                                ]
                            })
                        });
                        arr.push(mnu);
                        break;
                    case c_oAscMathInterfaceType.LargeOperator:
                        mnu = new Common.UI.MenuItem({
                            caption     : me.txtLimitChange,
                            equation    : true,
                            disabled    : me._currentParaObjDisabled,
                            equationProps: {type: type, callback: 'put_LimitLocation', value: (value.get_LimitLocation() == c_oAscMathInterfaceNaryLimitLocation.UndOvr) ? c_oAscMathInterfaceNaryLimitLocation.SubSup : c_oAscMathInterfaceNaryLimitLocation.UndOvr}
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
                    case c_oAscMathInterfaceType.Delimiter:
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
                    case c_oAscMathInterfaceType.GroupChar:
                        if (value.can_ChangePos()) {
                            mnu = new Common.UI.MenuItem({
                                caption     : (value.get_Pos()==c_oAscMathInterfaceGroupCharPos.Top) ? me.txtGroupCharUnder : me.txtGroupCharOver,
                                equation    : true,
                                disabled    : me._currentParaObjDisabled,
                                equationProps: {type: type, callback: 'put_Pos', value: (value.get_Pos()==c_oAscMathInterfaceGroupCharPos.Top) ? c_oAscMathInterfaceGroupCharPos.Bottom : c_oAscMathInterfaceGroupCharPos.Top}
                            });
                            arr.push(mnu);
                            mnu = new Common.UI.MenuItem({
                                caption     : me.txtDeleteGroupChar,
                                equation    : true,
                                disabled    : me._currentParaObjDisabled,
                                equationProps: {type: type, callback: 'put_Pos', value: c_oAscMathInterfaceGroupCharPos.None}
                            });
                            arr.push(mnu);
                        }
                        break;
                    case c_oAscMathInterfaceType.Radical:
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
                        case c_oAscMathInterfaceType.Accent:
                            eqObj = new CMathMenuAccent();
                            break;
                        case c_oAscMathInterfaceType.BorderBox:
                            eqObj = new CMathMenuBorderBox();
                            break;
                        case c_oAscMathInterfaceType.Box:
                            eqObj = new CMathMenuBox();
                            break;
                        case c_oAscMathInterfaceType.Bar:
                            eqObj = new CMathMenuBar();
                            break;
                        case c_oAscMathInterfaceType.Script:
                            eqObj = new CMathMenuScript();
                            break;
                        case c_oAscMathInterfaceType.Fraction:
                            eqObj = new CMathMenuFraction();
                            break;
                        case c_oAscMathInterfaceType.Limit:
                            eqObj = new CMathMenuLimit();
                            break;
                        case c_oAscMathInterfaceType.Matrix:
                            eqObj = new CMathMenuMatrix();
                            break;
                        case c_oAscMathInterfaceType.EqArray:
                            eqObj = new CMathMenuEqArray();
                            break;
                        case c_oAscMathInterfaceType.LargeOperator:
                            eqObj = new CMathMenuNary();
                            break;
                        case c_oAscMathInterfaceType.Delimiter:
                            eqObj = new CMathMenuDelimiter();
                            break;
                        case c_oAscMathInterfaceType.GroupChar:
                            eqObj = new CMathMenuGroupCharacter();
                            break;
                        case c_oAscMathInterfaceType.Radical:
                            eqObj = new CMathMenuRadical();
                            break;
                        case c_oAscMathInterfaceType.Common:
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
                    }
                    this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',        _.bind(onCoAuthoringDisconnect, this));
                    Common.NotificationCenter.on('api:disconnect',                      _.bind(onCoAuthoringDisconnect, this));
                    this.api.asc_registerCallback('asc_onTextLanguage',                 _.bind(onTextLanguage, this));
                    this.api.asc_registerCallback('asc_onParaStyleName',                _.bind(this.onApiParagraphStyleChange, this));

                    this.api.asc_registerCallback('asc_onShowForeignCursorLabel',       _.bind(onShowForeignCursorLabel, this));
                    this.api.asc_registerCallback('asc_onHideForeignCursorLabel',       _.bind(onHideForeignCursorLabel, this));
                    this.api.asc_registerCallback('asc_onFocusObject',                  _.bind(onFocusObject, this));
                }

                return this;
            };

            this.mode = {};
            this.setMode = function(m) {
                if (this.api && m.isEdit) {
                    this.api.asc_registerCallback('asc_onImgWrapStyleChanged',          _.bind(this.onImgWrapStyleChanged, this));
                    this.api.asc_registerCallback('asc_onDialogAddHyperlink',           onDialogAddHyperlink);
                    this.api.asc_registerCallback('asc_doubleClickOnChart',             onDoubleClickOnChart);
                    this.api.asc_registerCallback('asc_onSpellCheckVariantsFound',      _.bind(onSpellCheckVariantsFound, this));
                }

                this.mode = m;
                /** coauthoring begin **/
                !(this.mode.canCoAuthoring && this.mode.isEdit && this.mode.canComments)
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
                case c_oAscWrapStyle2.Inline:
                    this.menuImageWrap.menu.items[0].setChecked(true);
                    break;
                case c_oAscWrapStyle2.Square:
                    this.menuImageWrap.menu.items[1].setChecked(true);
                    break;
                case c_oAscWrapStyle2.Tight:
                    this.menuImageWrap.menu.items[2].setChecked(true);
                    break;
                case c_oAscWrapStyle2.Through:
                    this.menuImageWrap.menu.items[3].setChecked(true);
                    break;
                case c_oAscWrapStyle2.TopAndBottom:
                    this.menuImageWrap.menu.items[4].setChecked(true);
                    break;
                case c_oAscWrapStyle2.Behind:
                    this.menuImageWrap.menu.items[6].setChecked(true);
                    break;
                case c_oAscWrapStyle2.InFront:
                    this.menuImageWrap.menu.items[5].setChecked(true);
                    break;
            }
        },

        onApiParagraphStyleChange: function(name) {
            window.currentStyleName = name;
            var menuStyleUpdate = this.menuStyleUpdate;
            if (menuStyleUpdate != undefined) {
                menuStyleUpdate.setCaption(this.updateStyleText.replace('%1', window.currentStyleName));
            }
        },

        _applyTableWrap: function(wrap, align){
            var selectedElements = this.api.getSelectedElements();
            if (selectedElements && _.isArray(selectedElements)){
                for (var i = selectedElements.length - 1; i >= 0; i--) {
                    var elType, elValue;
                    elType = selectedElements[i].get_ObjectType();
                    elValue = selectedElements[i].get_ObjectValue();
                    if (c_oAscTypeSelectElement.Table == elType) {
                        var properties = new CTableProp();
                        properties.put_TableWrap(wrap);
                        if (wrap == c_tableWrap.TABLE_WRAP_NONE) {
                            properties.put_TableAlignment(align);
                            properties.put_TableIndent(0);
                        }
                        this.api.tblApply(properties);
                        break;
                    }
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

                        if (c_oAscTypeSelectElement.Paragraph == elType) {
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
                        if (c_oAscTypeSelectElement.Paragraph == elType) {
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
            if (this.api && this.mode.canCoAuthoring && this.mode.isEdit && this.mode.canComments) {
                this.suppressEditComplete = true;
                this.api.asc_enableKeyEvents(false);

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
                if (typeof window['AscDesktopEditor'] === 'object') {
                    (item.value == 'cut') ? me.api.Cut() : ((item.value == 'copy') ? me.api.Copy() : me.api.Paste());
                } else {
                    var value = Common.localStorage.getItem("de-hide-copywarning");
                    if (!(value && parseInt(value) == 1)) {
                        (new Common.Views.CopyWarningDialog({
                            handler: function(dontshow) {
                                (item.value == 'cut') ? me.api.Cut() : ((item.value == 'copy') ? me.api.Copy() : me.api.Paste());
                                if (dontshow) Common.localStorage.setItem("de-hide-copywarning", 1);
                                me.fireEvent('editcomplete', me);
                            }
                        })).show();
                    } else {
                        (item.value == 'cut') ? me.api.Cut() : ((item.value == 'copy') ? me.api.Copy() : me.api.Paste());
                        me.fireEvent('editcomplete', me);
                    }
                }
            } else {
                me.fireEvent('editcomplete', me);
            }
        },

        createDelayedElements: function() {
            var me = this;

            var menuImageAlign = new Common.UI.MenuItem({
                caption     : me.textAlign,
                menu        : (function(){
                    function onItemClick(item, e) {
                        if (me.api) {
                            var properties = new CImgProperty();
                            if (!_.isUndefined(item.options.halign)) {
                                properties.put_PositionH(new CImagePositionH());
                                properties.get_PositionH().put_UseAlign(true);
                                properties.get_PositionH().put_Align(item.options.halign);
                                properties.get_PositionH().put_RelativeFrom(c_oAscRelativeFromH.Margin);
                            } else {
                                properties.put_PositionV(new CImagePositionV());
                                properties.get_PositionV().put_UseAlign(true);
                                properties.get_PositionV().put_Align(item.options.valign);
                                properties.get_PositionV().put_RelativeFrom(c_oAscRelativeFromV.Margin);
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
                                caption : me.textShapeAlignLeft,
                                iconCls : 'mnu-img-align-left',
                                halign  : c_oAscAlignH.Left
                            }).on('click', onItemClick),
                            new Common.UI.MenuItem({
                                caption : me.textShapeAlignCenter,
                                iconCls : 'mnu-img-align-center',
                                halign  : c_oAscAlignH.Center
                            }).on('click', onItemClick),
                            new Common.UI.MenuItem({
                                caption : me.textShapeAlignRight,
                                iconCls : 'mnu-img-align-right',
                                halign  : c_oAscAlignH.Right
                            }).on('click', onItemClick),
                            new Common.UI.MenuItem({
                                caption : me.textShapeAlignTop,
                                iconCls : 'mnu-img-align-top',
                                valign  : c_oAscAlignV.Top
                            }).on('click', onItemClick),
                            new Common.UI.MenuItem({
                                caption : me.textShapeAlignMiddle,
                                iconCls : 'mnu-img-align-middle',
                                valign  : c_oAscAlignV.Center
                            }).on('click', onItemClick),
                            new Common.UI.MenuItem({
                                caption : me.textShapeAlignBottom,
                                iconCls : 'mnu-img-align-bottom',
                                valign  : c_oAscAlignV.Bottom
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
                    var properties = new CImgProperty();
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
                    var properties = new CImgProperty();
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
                            var properties = new CImgProperty();
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
                                valign  : c_oAscChangeLevel.BringToFront
                            }).on('click', onItemClick),
                            new Common.UI.MenuItem({
                                caption : me.textArrangeBack,
                                iconCls : 'mnu-arrange-back',
                                valign  : c_oAscChangeLevel.SendToBack
                            }).on('click', onItemClick),
                            new Common.UI.MenuItem({
                                caption : me.textArrangeForward,
                                iconCls : 'mnu-arrange-forward',
                                valign  : c_oAscChangeLevel.BringForward
                            }).on('click', onItemClick),
                            new Common.UI.MenuItem({
                                caption : me.textArrangeBackward,
                                iconCls : 'mnu-arrange-backward',
                                valign  : c_oAscChangeLevel.BringBackward
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
                            var properties = new CImgProperty();
                            properties.put_WrappingStyle(item.options.wrapType);

                            if (me.menuImageWrap._originalProps.get_WrappingStyle() === c_oAscWrapStyle2.Inline && item.wrapType !== c_oAscWrapStyle2.Inline ) {
                                properties.put_PositionH(new CImagePositionH());
                                properties.get_PositionH().put_UseAlign(false);
                                properties.get_PositionH().put_RelativeFrom(c_oAscRelativeFromH.Column);
                                var val = me.menuImageWrap._originalProps.get_Value_X(c_oAscRelativeFromH.Column);
                                properties.get_PositionH().put_Value(val);

                                properties.put_PositionV(new CImagePositionV());
                                properties.get_PositionV().put_UseAlign(false);
                                properties.get_PositionV().put_RelativeFrom(c_oAscRelativeFromV.Paragraph);
                                val = me.menuImageWrap._originalProps.get_Value_Y(c_oAscRelativeFromV.Paragraph);
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
                                wrapType    : c_oAscWrapStyle2.Inline,
                                checkable   : true
                            }).on('click', onItemClick),
                            new Common.UI.MenuItem({
                                caption     : me.txtSquare,
                                iconCls     : 'mnu-wrap-square',
                                toggleGroup : 'popuppicturewrapping',
                                wrapType    : c_oAscWrapStyle2.Square,
                                checkable   : true
                            }).on('click', onItemClick),
                            new Common.UI.MenuItem({
                                caption     : me.txtTight,
                                iconCls     : 'mnu-wrap-tight',
                                toggleGroup : 'popuppicturewrapping',
                                wrapType    : c_oAscWrapStyle2.Tight,
                                checkable   : true
                            }).on('click', onItemClick),
                            new Common.UI.MenuItem({
                                caption     : me.txtThrough,
                                iconCls     : 'mnu-wrap-through',
                                toggleGroup : 'popuppicturewrapping',
                                wrapType    : c_oAscWrapStyle2.Through,
                                checkable   : true
                            }).on('click', onItemClick),
                            new Common.UI.MenuItem({
                                caption     : me.txtTopAndBottom,
                                iconCls     : 'mnu-wrap-topAndBottom',
                                toggleGroup : 'popuppicturewrapping',
                                wrapType    : c_oAscWrapStyle2.TopAndBottom,
                                checkable   : true
                            }).on('click', onItemClick),
                            new Common.UI.MenuItem({
                                caption     : me.txtInFront,
                                iconCls     : 'mnu-wrap-inFront',
                                toggleGroup : 'popuppicturewrapping',
                                wrapType    : c_oAscWrapStyle2.InFront,
                                checkable   : true
                            }).on('click', onItemClick),
                            new Common.UI.MenuItem({
                                caption     : me.txtBehind,
                                iconCls     : 'mnu-wrap-behind',
                                toggleGroup : 'popuppicturewrapping',
                                wrapType    : c_oAscWrapStyle2.Behind,
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

                            if (c_oAscTypeSelectElement.Image == elType) {
                                var imgsizeOriginal;
                                if ( !elValue.get_ChartProperties() && !elValue.get_ShapeProperties() && !me.menuOriginalSize.isDisabled() && me.menuOriginalSize.isVisible()) {
                                    imgsizeOriginal = me.api.get_OriginalSizeImage();
                                    if (imgsizeOriginal)
                                        imgsizeOriginal = {width:imgsizeOriginal.get_ImageWidth(), height:imgsizeOriginal.get_ImageHeight()};
                                }

                                var imgsizeMax = me.api.GetSectionInfo();
                                    imgsizeMax = {
                                        width   : imgsizeMax.get_PageWidth()  - (imgsizeMax.get_MarginLeft() + imgsizeMax.get_MarginRight()),
                                        height  : imgsizeMax.get_PageHeight() - (imgsizeMax.get_MarginTop()  + imgsizeMax.get_MarginBottom())
                                    };

                                var win = new DE.Views.ImageSettingsAdvanced({
                                    imageProps  : elValue,
                                    sizeOriginal: imgsizeOriginal,
                                    sizeMax     : imgsizeMax,
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

                    var properties = new CImgProperty();
                    properties.put_Width(originalImageSize.get_ImageWidth());
                    properties.put_Height(originalImageSize.get_ImageHeight());

                    me.api.ImgApply(properties);

                    me.fireEvent('editcomplete', this);
                }
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
                            case c_oAscWrapStyle2.Inline:
                                me.menuImageWrap.menu.items[0].setChecked(true);
                                break;
                            case c_oAscWrapStyle2.Square:
                                me.menuImageWrap.menu.items[1].setChecked(true);
                                break;
                            case c_oAscWrapStyle2.Tight:
                                me.menuImageWrap.menu.items[2].setChecked(true);
                                break;
                            case c_oAscWrapStyle2.Through:
                                me.menuImageWrap.menu.items[3].setChecked(true);
                                break;
                            case c_oAscWrapStyle2.TopAndBottom:
                                me.menuImageWrap.menu.items[4].setChecked(true);
                                break;
                            case c_oAscWrapStyle2.Behind:
                                me.menuImageWrap.menu.items[6].setChecked(true);
                                break;
                            case c_oAscWrapStyle2.InFront:
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

                    me.menuOriginalSize.setVisible(_.isNull(value.imgProps.value.get_ChartProperties()) && _.isNull(value.imgProps.value.get_ShapeProperties()) &&
                                                  !onlyCommonProps);
                    me.pictureMenu.items[7].setVisible(menuChartEdit.isVisible() || me.menuOriginalSize.isVisible());

                    var islocked = value.imgProps.locked || (value.headerProps!==undefined && value.headerProps.locked);
                    if (menuChartEdit.isVisible())
                        menuChartEdit.setDisabled(islocked || value.imgProps.value.get_SeveralCharts());

                    me.menuOriginalSize.setDisabled(islocked || value.imgProps.value.get_ImageUrl()===null || value.imgProps.value.get_ImageUrl()===undefined);
                    menuImageAdvanced.setDisabled(islocked);
                    menuImageAlign.setDisabled( islocked || (wrapping == c_oAscWrapStyle2.Inline) );
                    menuImageArrange.setDisabled( wrapping == c_oAscWrapStyle2.Inline );

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
                },
                items: [
                    menuImgCut,
                    menuImgCopy,
                    menuImgPaste,
                    { caption: '--' },
                    menuImageArrange,
                    menuImageAlign,
                    me.menuImageWrap,
                    { caption: '--' },
                    me.menuOriginalSize,
                    menuChartEdit,
                    { caption: '--' },
                    menuImageAdvanced
                ]
            }).on('hide:after', function(menu) {
                me.fireEvent('editcomplete', me);
                me.currentMenu = null;
            });

            /* table menu*/

            var tableAlign = function(item, e) {
                me._applyTableWrap(c_tableWrap.TABLE_WRAP_NONE, item.options.align);
            };

            var menuTableWrapInline = new Common.UI.MenuItem({
                caption     : me.inlineText,
                toggleGroup : 'popuptablewrapping',
                checkable   : true,
                menu        : new Common.UI.Menu({
                    menuAlign: 'tl-tr',
                    items   : [
                        me.menuTableAlignLeft = new Common.UI.MenuItem({
                            caption     : me.textShapeAlignLeft,
                            toggleGroup : 'popuptablealign',
                            checkable   : true,
                            checked     : false,
                            align      : c_tableAlign.TABLE_ALIGN_LEFT
                        }).on('click', _.bind(tableAlign, me)),
                        me.menuTableAlignCenter = new Common.UI.MenuItem({
                            caption     : me.textShapeAlignCenter,
                            toggleGroup : 'popuptablealign',
                            checkable   : true,
                            checked     : false,
                            align      : c_tableAlign.TABLE_ALIGN_CENTER
                        }).on('click', _.bind(tableAlign, me)),
                        me.menuTableAlignRight = new Common.UI.MenuItem({
                            caption     : me.textShapeAlignRight,
                            toggleGroup : 'popuptablealign',
                            checkable   : true,
                            checked     : false,
                            align      : c_tableAlign.TABLE_ALIGN_RIGHT
                        }).on('click', _.bind(tableAlign, me))
                    ]
                })
            });

            var menuTableWrapFlow = new Common.UI.MenuItem({
                caption     : me.flowoverText,
                toggleGroup : 'popuptablewrapping',
                checkable   : true,
                checked     : true
            }).on('click', function(item) {
                me._applyTableWrap(c_tableWrap.TABLE_WRAP_PARALLEL);
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
                if (me.api){
                    (new Common.Views.InsertTableDialog({
                        handler: function(result, value) {
                            if (result == 'ok') {
                                if (me.api) {
                                    me.api.SplitCell(value.columns, value.rows);
                                }
                                me.fireEvent('editcomplete', me);

                                Common.component.Analytics.trackEvent('DocumentHolder', 'Table');
                            }
                        }
                    })).show();
                }
            });

            var tableCellsVAlign = function(item, e) {
                if (me.api) {
                    var properties = new CTableProp();
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
                            caption     : me.topCellText,
                            toggleGroup : 'popuptablecellalign',
                            checkable   : true,
                            checked     : false,
                            valign      : c_oAscVertAlignJc.Top
                        }).on('click', _.bind(tableCellsVAlign, me)),
                        me.menuTableCellCenter = new Common.UI.MenuItem({
                            caption     : me.centerCellText,
                            toggleGroup : 'popuptablecellalign',
                            checkable   : true,
                            checked     : false,
                            valign      : c_oAscVertAlignJc.Center
                        }).on('click', _.bind(tableCellsVAlign, me)),
                        me.menuTableCellBottom = new Common.UI.MenuItem({
                            caption     : me.bottomCellText,
                            toggleGroup : 'popuptablecellalign',
                            checkable   : true,
                            checked     : false,
                            valign      : c_oAscVertAlignJc.Bottom
                        }).on('click', _.bind(tableCellsVAlign, me))
                    ]
                })
            });

            var menuTableAdvanced = new Common.UI.MenuItem({
                caption        : me.advancedTableText
            }).on('click', function(item, e, eOpt){
                var win;
                if (me.api){
                    var selectedElements = me.api.getSelectedElements();

                    if (selectedElements && _.isArray(selectedElements)){
                        for (var i = selectedElements.length - 1; i >= 0; i--) {
                            var elType, elValue;

                            elType  = selectedElements[i].get_ObjectType();
                            elValue = selectedElements[i].get_ObjectValue();

                            if (c_oAscTypeSelectElement.Table == elType) {
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
                }
            });

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
                me.api && me.api.remove_Hyperlink();
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

            /** coauthoring begin **/
            var menuAddCommentTable = new Common.UI.MenuItem({
                caption     : me.addCommentText
            }).on('click', _.bind(me.addComment, me));
            /** coauthoring end **/

            var menuAddHyperlinkTable = new Common.UI.MenuItem({
                caption     : me.hyperlinkText
            }).on('click', _.bind(me.addHyperlink, me));

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
                    menuAlign: 'tl-tr',
                    maxHeight: 300,
                    items   : [
                    ]
                }).on('show:after', function(menu) {
                    var self = this;

                    // TODO: scroll to checked item
//                    self.el.show();
//                    self.callParent(arguments);
//                    if (self.floating && self.constrain) {
//                        var y = self.el.getY();
//                        self.doConstrain();
//                        var h = self.getHeight();
//                        var maxHeight = Ext.Element.getViewportHeight();
//                        if (y+h > maxHeight)
//                            y = maxHeight-h;
//                        self.el.setY(y);
//                        if (self.currentCheckedItem!== undefined)
//                            self.currentCheckedItem.getEl().scrollIntoView(self.layout.getRenderTarget());
//                    }
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

            var tableDirection = function(item, e) {
                if (me.api) {
                    var properties = new CTableProp();
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
                            direction      : c_oAscCellTextDirection.LRTB
                        }).on('click', _.bind(tableDirection, me)),
                        me.menuTableDirect90 = new Common.UI.MenuItem({
                            caption     : me.direct90Text,
                            iconCls     : 'mnu-direct-rdown',
                            checkable   : true,
                            checked     : false,
                            toggleGroup : 'popuptabledirect',
                            direction      : c_oAscCellTextDirection.TBRL
                        }).on('click', _.bind(tableDirection, me)),
                        me.menuTableDirect270 = new Common.UI.MenuItem({
                            caption     : me.direct270Text,
                            iconCls     : 'mnu-direct-rup',
                            checkable   : true,
                            checked     : false,
                            toggleGroup : 'popuptabledirect',
                            direction      : c_oAscCellTextDirection.BTLR
                        }).on('click', _.bind(tableDirection, me))
                    ]
                })
            });

            this.tableMenu = new Common.UI.Menu({
                initMenu: function(value){
                    // table properties
                    if (_.isUndefined(value.tableProps))
                        return;

                    var isEquation= (value.mathProps && value.mathProps.value);

                    for (var i = 7; i < 22; i++) {
                        me.tableMenu.items[i].setVisible(!isEquation);
                    }

                    var align = value.tableProps.value.get_CellsVAlign();
                    me.menuTableCellTop.setChecked(align == c_oAscVertAlignJc.Top);
                    me.menuTableCellCenter.setChecked(align == c_oAscVertAlignJc.Center);
                    me.menuTableCellBottom.setChecked(align == c_oAscVertAlignJc.Bottom);

                    var flow = (value.tableProps.value.get_TableWrap() == c_tableWrap.TABLE_WRAP_PARALLEL);
                    (flow) ? menuTableWrapFlow.setChecked(true) : menuTableWrapInline.setChecked(true);

                    align = value.tableProps.value.get_TableAlignment();
                    me.menuTableAlignLeft.setChecked((flow) ? false : (align === c_tableAlign.TABLE_ALIGN_LEFT));
                    me.menuTableAlignCenter.setChecked((flow) ? false : (align === c_tableAlign.TABLE_ALIGN_CENTER));
                    me.menuTableAlignRight.setChecked((flow) ? false : (align === c_tableAlign.TABLE_ALIGN_RIGHT));

                    var dir = value.tableProps.value.get_CellsTextDirection();
                    me.menuTableDirectH.setChecked(dir == c_oAscCellTextDirection.LRTB);
                    me.menuTableDirect90.setChecked(dir == c_oAscCellTextDirection.TBRL);
                    me.menuTableDirect270.setChecked(dir == c_oAscCellTextDirection.BTLR);

                    var disabled = value.tableProps.locked || (value.headerProps!==undefined && value.headerProps.locked);
                    me.tableMenu.items[8].setDisabled(disabled);
                    me.tableMenu.items[9].setDisabled(disabled);

                    if (me.api) {
                        mnuTableMerge.setDisabled(disabled || !me.api.CheckBeforeMergeCells());
                        mnuTableSplit.setDisabled(disabled || !me.api.CheckBeforeSplitCells());
                    }

                    menuTableCellAlign.setDisabled(disabled);
                    menuTableDirection.setDisabled(disabled);

                    menuTableWrapInline.setDisabled(disabled);
                    menuTableWrapFlow.setDisabled(disabled || !value.tableProps.value.get_CanBeFlow());
                    menuTableAdvanced.setDisabled(disabled);

                    var cancopy = me.api && me.api.can_CopyCut();
                    menuTableCopy.setDisabled(!cancopy);
                    menuTableCut.setDisabled(disabled || !cancopy);
                    menuTablePaste.setDisabled(disabled);

                    // hyperlink properties
                    var text = null;
                    if (me.api) {
                        text = me.api.can_AddHyperlink();
                    }
                    menuAddHyperlinkTable.setVisible(value.hyperProps===undefined && text!==false);
                    menuHyperlinkTable.setVisible(value.hyperProps!==undefined);
                    menuHyperlinkSeparator.setVisible(menuAddHyperlinkTable.isVisible() || menuHyperlinkTable.isVisible());

                    menuEditHyperlinkTable.hyperProps = value.hyperProps;

                    if (text!==false) {
                        menuAddHyperlinkTable.hyperProps = {};
                        menuAddHyperlinkTable.hyperProps.value = new CHyperlinkProperty();
                        menuAddHyperlinkTable.hyperProps.value.put_Text(text);
                    }
                    /** coauthoring begin **/
                        // comments
                    menuAddCommentTable.setVisible(me.api.can_AddQuotedComment()!==false && me.mode.canCoAuthoring && me.mode.canComments);
                    menuAddCommentTable.setDisabled(value.paraProps!==undefined && value.paraProps.locked===true);
                    /** coauthoring end **/
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
                },
                items: [
                    me.menuSpellCheckTable,
                    menuSpellcheckTableSeparator,
                    menuTableCut,
                    menuTableCopy,
                    menuTablePaste,
                    { caption: '--' },
                    menuEquationSeparatorInTable,
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
                    menuTableCellAlign,
                    menuTableDirection,
                    { caption: '--' },
                    menuTableWrapInline,
                    menuTableWrapFlow,
                    { caption: '--' },
                    menuTableAdvanced,
                    { caption: '--' },
                /** coauthoring begin **/
                    menuAddCommentTable,
                /** coauthoring end **/
                    menuAddHyperlinkTable,
                    menuHyperlinkTable,
                    menuHyperlinkSeparator,
                    menuParagraphAdvancedInTable
                ]
            }).on('hide:after', function(menu) {
                me.fireEvent('editcomplete', me);
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
                    var properties = new CImgProperty();
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
                            caption     : me.topCellText,
                            checkable   : true,
                            checked     : false,
                            toggleGroup : 'popupparagraphvalign',
                            valign      : c_oAscVerticalTextAlign.TEXT_ALIGN_TOP
                        }).on('click', _.bind(paragraphVAlign, me)),
                        me.menuParagraphCenter = new Common.UI.MenuItem({
                            caption     : me.centerCellText,
                            checkable   : true,
                            checked     : false,
                            toggleGroup : 'popupparagraphvalign',
                            valign      : c_oAscVerticalTextAlign.TEXT_ALIGN_CTR
                        }).on('click', _.bind(paragraphVAlign, me)),
                        me.menuParagraphBottom = new Common.UI.MenuItem({
                            caption     : me.bottomCellText,
                            checkable   : true,
                            checked     : false,
                            toggleGroup : 'popupparagraphvalign',
                            valign      : c_oAscVerticalTextAlign.TEXT_ALIGN_BOTTOM
                        }).on('click', _.bind(paragraphVAlign, me))
                    ]
                })
            });

            var paragraphDirection = function(item, e) {
                if (me.api) {
                    var properties = new CImgProperty();
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
                            direction      : c_oAscVertDrawingText.normal
                        }).on('click', _.bind(paragraphDirection, me)),
                        me.menuParagraphDirect90 = new Common.UI.MenuItem({
                            caption     : me.direct90Text,
                            iconCls     : 'mnu-direct-rdown',
                            checkable   : true,
                            checked     : false,
                            toggleGroup : 'popupparagraphdirect',
                            direction      : c_oAscVertDrawingText.vert
                        }).on('click', _.bind(paragraphDirection, me)),
                        me.menuParagraphDirect270 = new Common.UI.MenuItem({
                            caption     : me.direct270Text,
                            iconCls     : 'mnu-direct-rup',
                            checkable   : true,
                            checked     : false,
                            toggleGroup : 'popupparagraphdirect',
                            direction      : c_oAscVertDrawingText.vert270
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
                me.api.remove_Hyperlink();
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
                    menuAlign: 'tl-tr',
                    maxHeight: 300,
                    items   : [
                    ]
                }).on('show:after', function(menu) {
                    // TODO: scroll to checked item
//                    var self = this;
//
//                    self.el.show();
//                    self.callParent(arguments);
//                    if (self.floating && self.constrain) {
//                        var y = self.el.getY();
//                        self.doConstrain();
//                        var h = self.getHeight();
//                        var maxHeight = Ext.Element.getViewportHeight();
//                        if (y+h > maxHeight)
//                            y = maxHeight-h;
//                        self.el.setY(y);
//                        if (self.currentCheckedItem!== undefined)
//                            self.currentCheckedItem.getEl().scrollIntoView(self.layout.getRenderTarget());
//                    }
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

            this.textMenu = new Common.UI.Menu({
                initMenu: function(value){
                    var isInShape = (value.imgProps && value.imgProps.value && !_.isNull(value.imgProps.value.get_ShapeProperties()));
                    var isInChart = (value.imgProps && value.imgProps.value && !_.isNull(value.imgProps.value.get_ChartProperties()));
                    var isEquation= (value.mathProps && value.mathProps.value);

                    menuParagraphVAlign.setVisible(isInShape && !isInChart && !isEquation); // после того, как заголовок можно будет растягивать по вертикали, вернуть "|| isInChart" !!
                    menuParagraphDirection.setVisible(isInShape && !isInChart && !isEquation); // после того, как заголовок можно будет растягивать по вертикали, вернуть "|| isInChart" !!
                    if ( isInShape || isInChart ) {
                        var align = value.imgProps.value.get_VerticalTextAlign();
                        me.menuParagraphTop.setChecked(align == c_oAscVerticalTextAlign.TEXT_ALIGN_TOP);
                        me.menuParagraphCenter.setChecked(align == c_oAscVerticalTextAlign.TEXT_ALIGN_CTR);
                        me.menuParagraphBottom.setChecked(align == c_oAscVerticalTextAlign.TEXT_ALIGN_BOTTOM);

                        var dir = value.imgProps.value.get_Vert();
                        me.menuParagraphDirectH.setChecked(dir == c_oAscVertDrawingText.normal);
                        me.menuParagraphDirect90.setChecked(dir == c_oAscVertDrawingText.vert);
                        me.menuParagraphDirect270.setChecked(dir == c_oAscVertDrawingText.vert270);
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
                    if (text!==false) {
                        menuAddHyperlinkPara.hyperProps = {};
                        menuAddHyperlinkPara.hyperProps.value = new CHyperlinkProperty();
                        menuAddHyperlinkPara.hyperProps.value.put_Text(text);
                    }
                    var disabled = value.paraProps.locked || (value.headerProps!==undefined && value.headerProps.locked);
                    me._currentParaObjDisabled = disabled;
                    menuAddHyperlinkPara.setDisabled(disabled);
                    menuHyperlinkPara.setDisabled(disabled || value.hyperProps!==undefined && value.hyperProps.isSeveralLinks===true);

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
                    menuStyleSeparator,
                    menuStyle
                ]
            }).on('hide:after', function(menu, e) {
                if (me.suppressEditComplete) {
                    me.suppressEditComplete = false;
                    return;
                }

                me.fireEvent('editcomplete', me);
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
            }).on('hide:after', function(menu) {
                me.fireEvent('editcomplete', me);
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

            if (langs && langs.length > 0) {
                _.each(langs, function(lang, index){
                    me.langParaMenu.menu.addItem(new Common.UI.MenuItem({
                        caption     : Common.util.LanguageInfo.getLocalLanguageName(lang.asc_getId())[1],
                        checkable   : true,
                        toggleGroup : 'popupparalang',
                        langid      : lang.asc_getId()
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
                        caption     : Common.util.LanguageInfo.getLocalLanguageName(lang.asc_getId())[1],
                        checkable   : true,
                        toggleGroup : 'popuptablelang',
                        langid      : lang.asc_getId()
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

                me.langTableMenu.menu.doLayout();
                me.langParaMenu.menu.doLayout();
            }
        },

        focus: function() {
            var me = this;
            _.defer(function(){  me.cmpEl.focus(); }, 50);
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
        flowoverText            : 'Wrapping Style - Flow',
        inlineText              : 'Wrapping Style - Inline',
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
        topCellText:            'Align Top',
        centerCellText:         'Align Center',
        bottomCellText:         'Align Bottom',
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
        direct90Text: 'Rotate at 90°',
        direct270Text: 'Rotate at 270°',
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
        txtDeleteCharsAndSeparators: 'Delete enclosing characters and separators'

    }, DE.Views.DocumentHolder || {}));
});