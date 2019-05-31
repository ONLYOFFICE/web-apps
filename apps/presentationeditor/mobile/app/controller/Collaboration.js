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
 *  Collaboration.js
 *  Presentation Editor
 *
 *  Created by Julia Svinareva on 31/5/19
 *  Copyright (c) 2019 Ascensio System SIA. All rights reserved.
 *
 */
define([
    'core',
    'jquery',
    'underscore',
    'backbone',
    'presentationeditor/mobile/app/view/Collaboration'
], function (core, $, _, Backbone) {
    'use strict';

    PE.Controllers.Collaboration = Backbone.Controller.extend(_.extend((function() {
        // Private
        var rootView,
            _userId,
            editUsers = [];

        return {
            models: [],
            collections: [],
            views: [
                'Collaboration'
            ],

            initialize: function() {
                var me = this;
                me.addListeners({
                    'Collaboration': {
                        'page:show' : me.onPageShow
                    }
                });
            },

            setApi: function(api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onAuthParticipantsChanged', _.bind(this.onChangeEditUsers, this));
                this.api.asc_registerCallback('asc_onParticipantsChanged',     _.bind(this.onChangeEditUsers, this));
            },

            onLaunch: function () {
                this.createView('Collaboration').render();
            },

            setMode: function(mode) {
                this.appConfig = mode;
                _userId = mode.user.id;
                return this;
            },


            showModal: function() {
                var me = this,
                    isAndroid = Framework7.prototype.device.android === true,
                    modalView,
                    mainView = PE.getController('Editor').getView('Editor').f7View;

                uiApp.closeModal();

                if (Common.SharedSettings.get('phone')) {
                    modalView = $$(uiApp.pickerModal(
                        '<div class="picker-modal settings container-collaboration">' +
                        '<div class="view collaboration-root-view navbar-through">' +
                        this.getView('Collaboration').rootLayout() +
                        '</div>' +
                        '</div>'
                    )).on('opened', function () {
                        if (_.isFunction(me.api.asc_OnShowContextMenu)) {
                            me.api.asc_OnShowContextMenu()
                        }
                    }).on('close', function (e) {
                        mainView.showNavbar();
                    }).on('closed', function () {
                        if (_.isFunction(me.api.asc_OnHideContextMenu)) {
                            me.api.asc_OnHideContextMenu()
                        }
                    });
                    mainView.hideNavbar();
                } else {
                    modalView = uiApp.popover(
                        '<div class="popover settings container-collaboration">' +
                        '<div class="popover-angle"></div>' +
                        '<div class="popover-inner">' +
                        '<div class="content-block">' +
                        '<div class="view popover-view collaboration-root-view navbar-through">' +
                        this.getView('Collaboration').rootLayout() +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '</div>',
                        $$('#toolbar-collaboration')
                    );
                }

                if (Framework7.prototype.device.android === true) {
                    $$('.view.collaboration-root-view.navbar-through').removeClass('navbar-through').addClass('navbar-fixed');
                    $$('.view.collaboration-root-view .navbar').prependTo('.view.collaboration-root-view > .pages > .page');
                }

                rootView = uiApp.addView('.collaboration-root-view', {
                    dynamicNavbar: true,
                    domCache: true
                });

                Common.NotificationCenter.trigger('collaborationcontainer:show');
                this.onPageShow(this.getView('Collaboration'));

                PE.getController('Toolbar').getView('Toolbar').hideSearch();
            },

            rootView : function() {
                return rootView;
            },

            onPageShow: function(view, pageId) {
                var me = this;

                if('#edit-users-view' == pageId) {
                    me.initEditUsers();
                    Common.Utils.addScrollIfNeed('.page[data-page=edit-users-view]', '.page[data-page=edit-users-view] .page-content');
                } else {
                }
            },

            onChangeEditUsers: function(users) {
                editUsers = users;
            },

            initEditUsers: function() {
                var usersArray = [];
                _.each(editUsers, function(item){
                    var fio = item.asc_getUserName().split(' ');
                    var initials = fio[0].substring(0, 1).toUpperCase();
                    if (fio.length > 1) {
                        initials += fio[fio.length - 1].substring(0, 1).toUpperCase();
                    }
                    if(!item.asc_getView()) {
                        usersArray.push({
                            color: item.asc_getColor(),
                            id: item.asc_getId(),
                            idOriginal: item.asc_getIdOriginal(),
                            name: item.asc_getUserName(),
                            view: item.asc_getView(),
                            initial: initials
                        })
                    }
                });
                var userSort = _.chain(usersArray).groupBy('idOriginal').value();
                var templateUserItem = _.template([
                    '<%  _.each(users, function (user) { %>',
                    '<li id="<%= user[0].id %>" class="<% if (user[0].view) {%> viewmode <% } %> item-content">' +
                    '<div class="user-name item-inner">' +
                    '<div class="color" style="background-color: <%= user[0].color %>;"><%= user[0].initial %></div>'+
                    '<label><%= user[0].name %></label>' +
                    '<% if (user.length>1) { %><label class="length"> (<%= user.length %>)</label><% } %>' +
                    '</div>'+
                    '</li>',
                    '<% }); %>'].join(''));
                var templateUserList = _.template(
                    '<div class="item-content"><div class="item-inner">' +
                    this.textEditUser +
                    '</div></div>' +
                    '<ul>' +
                    templateUserItem({users: userSort}) +
                    '</ul>');
                $('#user-list').html(templateUserList());
            },


            textEditUser: 'Document is currently being edited by several users.'

        }
    })(), PE.Controllers.Collaboration || {}))
});