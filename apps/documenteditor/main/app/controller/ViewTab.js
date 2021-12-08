/*
 *
 * (c) Copyright Ascensio System SIA 2010-2020
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
 *  ViewTab.js
 *
 *  Created by Julia Svinareva on 06.12.2021
 *  Copyright (c) 2021 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'documenteditor/main/app/view/ViewTab'
], function () {
    'use strict';

    DE.Controllers.ViewTab = Backbone.Controller.extend(_.extend({
        models : [],
        collections : [
        ],
        views : [
            'ViewTab'
        ],
        sdkViewName : '#id_main',

        initialize: function () {
        },
        onLaunch: function () {
            this._state = {};
            Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
        },

        setApi: function (api) {
            if (api) {
                this.api = api;

            }
            return this;
        },

        setConfig: function(config) {
            this.toolbar = config.toolbar;
            this.view = this.createView('ViewTab', {
                toolbar: this.toolbar.toolbar,
                mode: config.mode
            });
            this.addListeners({
                'ViewTab': {

                },
                'Statusbar': {

                }
            });
        },

        SetDisabled: function(state) {
            this.view && this.view.SetDisabled(state);
        },

        getView: function(name) {
            return !name && this.view ?
                this.view : Backbone.Controller.prototype.getView.call(this, name);
        },

        onCoAuthoringDisconnect: function() {
            this.SetDisabled(true);
        },

        onAppReady: function (config) {
            var me = this;
            (new Promise(function (accept, reject) {
                accept();
            })).then(function(){
                me.view.setEvents();
            });
            if (me.view.btnNavigation) {
                me.getApplication().getController('LeftMenu').leftMenu.btnNavigation.on('toggle', function(btn, state){
                    if (state !== me.view.btnNavigation.pressed)
                        me.view.turnNavigation(state);
                });
            }

            var menuItems = [],
                currentTheme = Common.UI.Themes.currentThemeId() || Common.UI.Themes.defaultThemeId();
            for (var t in Common.UI.Themes.map()) {
                menuItems.push({
                    value: t,
                    caption: Common.UI.Themes.get(t).text,
                    checked: t === currentTheme,
                    checkable: true,
                    toggleGroup: 'interface-theme'
                });
            }

            if ( menuItems.length ) {
                this.view.btnInterfaceTheme.setMenu(new Common.UI.Menu({items: menuItems}));
                this.view.btnInterfaceTheme.menu.on('item:click', _.bind(function (menu, item) {
                    var value = item.value;
                    Common.UI.Themes.setTheme(value);
                    this.view.btnDarkDocument.setDisabled(value !== 'theme-dark');
                }, this));
            }
        },

    }, DE.Controllers.ViewTab || {}));
});