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
 * Date: 14.12.17
 */

define([
    'core',
    'documenteditor/main/app/collection/Navigation',
    'documenteditor/main/app/view/Navigation'
], function () {
    'use strict';

    DE.Controllers.Navigation = Backbone.Controller.extend(_.extend({
        models: [],
        collections: [
            'Navigation'
        ],
        views: [
            'Navigation'
        ],

        initialize: function() {
            var me = this;
            this.addListeners({
                'Navigation': {
                    'show': function() {
                        if (!this.canUseViwerNavigation) {
                            me.api.asc_ShowDocumentOutline();
                        } else {
                            if (me.panelNavigation && me.panelNavigation.viewNavigationList && me.panelNavigation.viewNavigationList.scroller)
                                me.panelNavigation.viewNavigationList.scroller.update({alwaysVisibleY: true});
                        }
                        if (!me.mode.isEdit && !me.mode.isRestrictedEdit)
                            me.panelNavigation.viewNavigationList.focus();
                    },
                    'hide': function() {
                        if (!this.canUseViwerNavigation) {
                            me.api && me.api.asc_HideDocumentOutline();
                        }
                    }
                }
            });
        },

        events: function() {
        },

        onLaunch: function() {
            this.panelNavigation= this.createView('Navigation', {
                storeNavigation: this.getApplication().getCollection('Navigation')
            });
            this.panelNavigation.on('render:after', _.bind(this.onAfterRender, this));
            this._navigationObject = null;
            this._viewerNavigationObject = null;
            this._isDisabled = false;
        },

        setApi: function(api) {
            this.api = api;
            this.api.asc_registerCallback('asc_onDocumentOutlineUpdate', _.bind(this.updateNavigation, this));
            this.api.asc_registerCallback('asc_onDocumentOutlineCurrentPosition', _.bind(this.onChangeOutlinePosition, this));
            this.api.asc_registerCallback('asc_onDocumentOutlineUpdateAdd', _.bind(this.updateNavigation, this));
            this.api.asc_registerCallback('asc_onDocumentOutlineUpdateChange', _.bind(this.updateChangeNavigation, this));
            this.api.asc_registerCallback('asc_onDocumentOutlineUpdateRemove', _.bind(this.updateNavigation, this));

            this.api.asc_registerCallback('asc_onViewerBookmarksUpdate', _.bind(this.updateViewerNavigation, this));
            return this;
        },

        setMode: function(mode) {
            this.mode = mode;
            this.canUseViwerNavigation = this.mode.canUseViwerNavigation;
            if (this.panelNavigation && this.panelNavigation.viewNavigationList) {
                this.panelNavigation.viewNavigationList.setEmptyText(this.mode.isEdit ? this.panelNavigation.txtEmpty : this.panelNavigation.txtEmptyViewer);
                this.panelNavigation.viewNavigationList.enableKeyEvents = !this.mode.isEdit && !this.mode.isRestrictedEdit;
            }
            return this;
        },

        onAfterRender: function(panelNavigation) {
            panelNavigation.viewNavigationList.on('item:click', _.bind(this.onSelectItem, this));
            panelNavigation.viewNavigationList.on('item:contextmenu', _.bind(this.onItemContextMenu, this));
            panelNavigation.viewNavigationList.on('item:add', _.bind(this.onItemAdd, this));
            panelNavigation.navigationMenu.on('item:click',           _.bind(this.onMenuItemClick, this));
            panelNavigation.navigationMenu.items[11].menu.on('item:click', _.bind(this.onMenuLevelsItemClick, this));
            panelNavigation.btnSettingsMenu.on('item:click',           _.bind(this.onMenuSettingsItemClick, this));
            panelNavigation.btnSettingsMenu.items[2].menu.on('item:click', _.bind(this.onMenuLevelsItemClick, this));
            panelNavigation.btnSettingsMenu.items[4].menu.on('item:click', _.bind(this.onMenuFontSizeClick, this));
            panelNavigation.btnClose.on('click', _.bind(this.onClickClosePanel, this));

            var viewport = this.getApplication().getController('Viewport').getView('Viewport');
            viewport.hlayout.on('layout:resizedrag',  function () {
                if (panelNavigation.viewNavigationList && panelNavigation.viewNavigationList.scroller)
                    panelNavigation.viewNavigationList.scroller.update({alwaysVisibleY: true});
            });
        },

        updateNavigation: function() {
            if (!this._navigationObject)
                this._navigationObject = this.api.asc_GetDocumentOutlineManager();

            if (!this._navigationObject) return;

            if (this.timerUpdateId) {
                clearTimeout(this.timerUpdateId);
                this.timerUpdateId = 0;
            }

            var count = this._navigationObject.get_ElementsCount(),
                prev_level = -1,
                header_level = -1,
                first_header = !this._navigationObject.isFirstItemNotHeader(),
                arr = [];
            for (var i=0; i<count; i++) {
                var level = this._navigationObject.get_Level(i),
                    hasParent = true;
                if (level>prev_level && i>0)
                    arr[i-1].set('hasSubItems', true);
                if (header_level<0 || level<=header_level) {
                    if (i>0 || first_header)
                        header_level = level;
                    hasParent = false;
                }
                arr.push(new Common.UI.TreeViewModel({
                    name : this._navigationObject.get_Text(i),
                    level: level,
                    index: i,
                    hasParent: hasParent,
                    isEmptyItem: this._navigationObject.isEmptyItem(i)
                }));
                prev_level = level;
            }
            if (count>0 && !first_header) {
                arr[0].set('hasSubItems', false);
                arr[0].set('isNotHeader', true);
                arr[0].set('name', this.txtBeginning);
                arr[0].set('tip', this.txtGotoBeginning);
                arr[0].set('getTipFromName', false);
            }

            var me = this;
            var store = this.getApplication().getCollection('Navigation');
            store.reset(arr.splice(0, 50));

            this._currentPos = this._navigationObject.get_CurrentPosition();

            function addToPanel() {
                if (arr.length<1) {
                    if (me.timerUpdateId) {
                        clearTimeout(me.timerUpdateId);
                        me.timerUpdateId = 0;
                    }
                    me.panelNavigation.viewNavigationList.scroller && me.panelNavigation.viewNavigationList.scroller.update({alwaysVisibleY: true});
                    if (me._currentPos>-1 && me._currentPos<store.length)
                        me.onChangeOutlinePosition(me._currentPos);
                    me._currentPos = -1;
                    return;
                }
                me.timerUpdateId = setTimeout(function () {
                    var added = arr.splice(0, 100);
                    added.forEach(function(item) {
                        var idx = item.get('index');
                        item.set('name', me._navigationObject.get_Text(idx));
                        item.set('isEmptyItem', me._navigationObject.isEmptyItem(idx));
                    });
                    store.add(added);
                    if (me._currentPos>-1 && me._currentPos<store.length) {
                        me.onChangeOutlinePosition(me._currentPos);
                        me._currentPos = -1;
                    }
                    addToPanel();
                }, 1);
            }
            addToPanel();
        },

        updateChangeNavigation: function(index) {
            if (!this._navigationObject)
                this._navigationObject = this.api.asc_GetDocumentOutlineManager();

            if (!this._navigationObject) return;

            var navList = this.getApplication().getCollection('Navigation');
            if (navList.length<=index) return;

            var item = navList.at(index);
            if (item.get('level') !== this._navigationObject.get_Level(index) ||
                index==0 && item.get('isNotHeader') !== this._navigationObject.isFirstItemNotHeader()) {
                this.updateNavigation();
            } else {
                item.set('name', this._navigationObject.get_Text(index));
                item.set('isEmptyItem', this._navigationObject.isEmptyItem(index));
                this.panelNavigation.viewNavigationList.updateTip(item.get('dataItem'));
            }
        },

        onChangeOutlinePosition: function(index) {
            if (index<this.panelNavigation.viewNavigationList.store.length)
                this.panelNavigation.viewNavigationList.scrollToRecord(this.panelNavigation.viewNavigationList.selectByIndex(index));
            else
                this._currentPos = index;
        },

        onItemContextMenu: function(picker, item, record, e){
            var showPoint;
            var menu = this.panelNavigation.navigationMenu;
            if (menu.isVisible()) {
                menu.hide();
            }

            var parentOffset = this.panelNavigation.$el.offset(),
                top = e.clientY*Common.Utils.zoom();
            showPoint = [e.clientX*Common.Utils.zoom() + 5, top - parentOffset.top + 5];

            for (var i=0; i<7; i++) {
                menu.items[i].setVisible(this.mode.isEdit);
            }

            menu.items[7].setVisible(!this.canUseViwerNavigation);
            menu.items[8].setVisible(!this.canUseViwerNavigation);

            var isNotHeader = record.get('isNotHeader');
            menu.items[0].setDisabled(isNotHeader || this._isDisabled);
            menu.items[1].setDisabled(isNotHeader || this._isDisabled);
            menu.items[3].setDisabled(isNotHeader || this._isDisabled);
            menu.items[4].setDisabled(this._isDisabled);
            menu.items[5].setDisabled(this._isDisabled);
            menu.items[7].setDisabled(isNotHeader);

            if (showPoint != undefined) {
                var menuContainer = this.panelNavigation.$el.find('#menu-navigation-container');
                if (!menu.rendered) {
                    if (menuContainer.length < 1) {
                        menuContainer = $('<div id="menu-navigation-container" style="position: absolute; z-index: 10000;"><div class="dropdown-toggle" data-toggle="dropdown"></div></div>', menu.id);
                        $(this.panelNavigation.$el).append(menuContainer);
                    }
                    menu.render(menuContainer);
                    menu.cmpEl.attr({tabindex: "-1"});
                }
                menu.cmpEl.attr('data-value', record.get('index'));
                menuContainer.css({
                    left: showPoint[0],
                    top: showPoint[1]
                });
                menu.show();
                _.delay(function() {
                    menu.cmpEl.focus();
                }, 10);
            }

        },

        onSelectItem: function(picker, item, record, e){
            if (this._navigationObject) {
                this._navigationObject.goto(record.get('index'));
            } else if (this._viewerNavigationObject) {
                this.api.asc_viewerNavigateTo(record.get('index'));
            }
            (this.mode.isEdit || this.mode.isRestrictedEdit) && Common.NotificationCenter.trigger('edit:complete', this.panelNavigation);
        },

        onItemAdd: function(picker, item, record, e){
            record.set('dataItem', item);
        },

        onMenuItemClick: function (menu, item) {
            if (!this._navigationObject && !this._viewerNavigationObject) return;
            var index = parseInt(menu.cmpEl.attr('data-value'));
            if (item.value == 'promote') {
                this._navigationObject.promote(index);
            } else if (item.value == 'demote') {
                this._navigationObject.demote(index);
            } else if (item.value == 'before') {
                this._navigationObject.insertHeader(index, true);
            } else if (item.value == 'after') {
                this._navigationObject.insertHeader(index, false);
            } else if (item.value == 'new') {
                this._navigationObject.insertSubHeader(index);
            } else if (item.value == 'select') {
                this._navigationObject.selectContent(index);
            } else if (item.value == 'expand') {
                this.panelNavigation.viewNavigationList.expandAll();
            } else  if (item.value == 'collapse') {
                this.panelNavigation.viewNavigationList.collapseAll();
            }
        },
        onClickClosePanel: function() {
            Common.NotificationCenter.trigger('leftmenu:change', 'hide');
        },

        onMenuSettingsItemClick: function (menu, item){
            switch (item.value){
                case 'expand':
                    this.panelNavigation.viewNavigationList.expandAll();
                    break;
                case 'collapse':
                    this.panelNavigation.viewNavigationList.collapseAll();
                    break;
                case 'wrap':
                    this.panelNavigation.changeWrapHeadings();
                    break;
            }
        },

        onMenuLevelsItemClick: function (menu, item) {
            this.panelNavigation.viewNavigationList.expandToLevel(item.value-1);
        },

        onMenuFontSizeClick: function (menu, item){
            this.panelNavigation.changeFontSize(item.value);
        },

        SetDisabled: function(state) {
            this._isDisabled = state;
        },

        updateViewerNavigation: function (bookmarks) {
            this._viewerNavigationObject = bookmarks.length > 0 ? bookmarks : null;
            if (this._viewerNavigationObject) {
                var count = this._viewerNavigationObject.length,
                    prev_level = -1,
                    header_level = -1,
                    first_header = true,//!this._navigationObject.isFirstItemNotHeader(),
                    arr = [];
                for (var i = 0; i < count; i++) {
                    var level = this._viewerNavigationObject[i].level - 1,
                        hasParent = true;
                    if (level > prev_level && i > 0)
                        arr[i - 1].set('hasSubItems', true);
                    if (header_level < 0 || level <= header_level) {
                        if (i > 0 || first_header)
                            header_level = level;
                        hasParent = false;
                    }
                    arr.push(new Common.UI.TreeViewModel({
                        name: this._viewerNavigationObject[i].description,
                        level: level,
                        index: i,
                        hasParent: hasParent,
                        isEmptyItem: !this._viewerNavigationObject[i].description
                    }));
                    prev_level = level;
                }
                if (count > 0 && !first_header) {
                    arr[0].set('hasSubItems', false);
                    arr[0].set('isNotHeader', true);
                    arr[0].set('name', this.txtBeginning);
                    arr[0].set('tip', this.txtGotoBeginning);
                    arr[0].set('getTipFromName', false);
                }
                this.getApplication().getCollection('Navigation').reset(arr);
                if (this.panelNavigation && this.panelNavigation.viewNavigationList && this.panelNavigation.viewNavigationList.scroller)
                    this.panelNavigation.viewNavigationList.scroller.update({alwaysVisibleY: true});
            }
        },

        txtBeginning: 'Beginning of document',
        txtGotoBeginning: 'Go to the beginning of the document'

    }, DE.Controllers.Navigation || {}));
});
