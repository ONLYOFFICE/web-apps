/*
 *
 * (c) Copyright Ascensio System Limited 2010-2017
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
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia,
 * EU, LV-1021.
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
 * User: Julia.Radzhabova
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
                        var obj = me.api.asc_ShowDocumentOutline();
                        if (!me._navigationObject)
                            me._navigationObject = obj;
                        me.updateNavigation();
                    },
                    'hide': function() {
                        me.api.asc_HideDocumentOutline();
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
        },

        setApi: function(api) {
            this.api = api;
            this.api.asc_registerCallback('asc_onDocumentOutlineUpdate', _.bind(this.updateNavigation, this));
            return this;
        },

        setMode: function(mode) {
        },

        onAfterRender: function(panelNavigation) {
            panelNavigation.viewNavigationList.on('item:click', _.bind(this.onSelectItem, this));
            panelNavigation.viewNavigationList.on('item:contextmenu', _.bind(this.onItemContextMenu, this));
            panelNavigation.navigationMenu.on('item:click',           _.bind(this.onMenuItemClick, this));
        },

        updateNavigation: function() {
            if (!this._navigationObject) return;

            var count = this._navigationObject.get_ElementsCount(),
                prev_level = -1,
                arr = [];
            for (var i=0; i<count; i++) {
                var level = this._navigationObject.get_Level(i);
                if (level>prev_level && i>0)
                    arr[i-1].set('hasSubItems', true);
                arr.push(new Common.UI.TreeViewModel({
                    name : this._navigationObject.get_Text(i),
                    level: level,
                    index: i
                }));
                prev_level = level;

            }
            this.getApplication().getCollection('Navigation').reset(arr);
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

            if (record != undefined) {
                //itemMenu
                // menu.items[0].setVisible(true);
            } else {
            }

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

                menuContainer.css({
                    left: showPoint[0],
                    top: showPoint[1]
                });
                menu.show();
            }

        },

        onSelectItem: function(picker, item, record, e){
            // this.api.asc_gotoHeader();
        },

        onMenuItemClick: function (menu, item) {
            if (item.value == 'promote') {

            } else if (item.value == 'promote') {

            } else if (item.value == 'indent') {

            } else if (item.value == 'before') {

            } else if (item.value == 'after') {

            } else if (item.value == 'new') {

            } else if (item.value == 'select') {

            } else if (item.value == 'expand') {
                this.panelNavigation.viewNavigationList.expandAll();
            } else  if (item.value == 'collapse') {
                this.panelNavigation.viewNavigationList.collapseAll();
            }
        }

    }, DE.Controllers.Navigation || {}));
});
