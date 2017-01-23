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
 *  StatusBar View
 *
 *  Created by Maxim Kadushkin on 8 April 2014
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!presentationeditor/main/app/template/StatusBar.template',
    'backbone',
    'tip',
    'common/main/lib/component/Menu',
    'common/main/lib/component/Window',
    'presentationeditor/main/app/model/Pages'
 ], function(template, Backbone){
        'use strict';

        function _onCountPages(count){
            this.pages.set('count', count);
            var isDisabled = (count<=0);
            if (this.btnPreview.isDisabled() !== isDisabled)
                this.btnPreview.setDisabled(isDisabled);
        }

        function _onCurrentPage(number){
            this.pages.set('current', number+1);
        }

        var _tplPages = _.template('Slide <%= current %> of <%= count %>');

        function _updatePagesCaption(model,value,opts) {
            $('#status-label-pages').text(
                Common.Utils.String.format(this.pageIndexText, model.get('current'), model.get('count')) );
        }

        PE.Views.Statusbar = Backbone.View.extend(_.extend({
            el: '#statusbar',
            template: _.template(template),

            storeUsers: undefined,

            tplUser: ['<li id="status-chat-user-<%= user.get("id") %>" class="<% if (!user.get("online")) { %> offline <% } if (user.get("view")) {%> viewmode <% } %>">',
                '<div class="color" style="background-color: <%= user.get("color") %>;" >',
                    '<label class="name"><%= scope.getUserName(user.get("username")) %></label>',
                '</div>',
            '</li>'].join(''),

            templateUserList: _.template('<ul>' +
                '<% _.each(users, function(item) { %>' +
                    '<%= _.template(usertpl, {user: item, scope: scope}) %>' +
                '<% }); %>' +
            '</ul>'),

            events: {
            },

            api: undefined,
            pages: undefined,

            initialize: function (options) {
                _.extend(this, options);
                this.pages = new PE.Models.Pages({current:1, count:1});
                this.pages.on('change', _.bind(_updatePagesCaption,this));
            },

            render: function () {
                var me = this;
                $(this.el).html(this.template({
                    scope: this
                }));

                this.btnZoomToPage = new Common.UI.Button({
                    el: $('#btn-zoom-topage',this.el),
                    hint: this.tipFitPage,
                    hintAnchor: 'top',
                    toggleGroup: 'status-zoom',
                    enableToggle: true
                });

                this.btnZoomToWidth = new Common.UI.Button({
                    el: $('#btn-zoom-towidth',this.el),
                    hint: this.tipFitWidth,
                    hintAnchor: 'top',
                    toggleGroup: 'status-zoom',
                    enableToggle: true
                });

                this.btnZoomDown = new Common.UI.Button({
                    el: $('#btn-zoom-down',this.el),
                    hint: this.tipZoomOut+Common.Utils.String.platformKey('Ctrl+-'),
                    hintAnchor: 'top'
                });

                this.btnZoomUp = new Common.UI.Button({
                    el: $('#btn-zoom-up',this.el),
                    hint: this.tipZoomIn+Common.Utils.String.platformKey('Ctrl++'),
                    hintAnchor: 'top-right'
                });

                this.cntZoom = new Common.UI.Button({
                    el: $('.cnt-zoom',this.el),
                    hint: this.tipZoomFactor,
                    hintAnchor: 'top'
                });
                this.cntZoom.cmpEl.on('show.bs.dropdown', function () {
                        _.defer(function(){
                            me.cntZoom.cmpEl.find('ul').focus();
                        }, 100);
                    }
                );
                this.cntZoom.cmpEl.on('hide.bs.dropdown', function () {
                        _.defer(function(){
                            me.api.asc_enableKeyEvents(true);
                        }, 100);
                    }
                );

                this.zoomMenu = new Common.UI.Menu({
                    style: 'margin-top:-5px;',
                    menuAlign: 'bl-tl',
                    items: [
                        { caption: "50%", value: 50 },
                        { caption: "75%", value: 75 },
                        { caption: "100%", value: 100 },
                        { caption: "125%", value: 125 },
                        { caption: "150%", value: 150 },
                        { caption: "175%", value: 175 },
                        { caption: "200%", value: 200 }
                    ]
                });
                this.zoomMenu.render($('.cnt-zoom',this.el));
                this.zoomMenu.cmpEl.attr({tabindex: -1});

                /** coauthoring begin **/
                this.panelUsersList = $('#status-users-list', this.el);
                this.storeUsers.bind({
                    add     : _.bind(this._onAddUser, this),
                    change  : _.bind(this._onUsersChanged, this),
                    reset   : _.bind(this._onResetUsers, this)
                });

                this.panelUsers = $('#status-users-ct', this.el);
                this.panelUsers.on('shown.bs.dropdown', function () {
                    me.panelUsersList.scroller.update({minScrollbarLength  : 40, alwaysVisibleY: true});
                });

                this.panelUsersBlock = this.panelUsers.find('#status-users-block');
                this.panelUsersBlock.tooltip({
                    title: this.tipAccessRights,
                    html: true,
                    placement: 'top'
                });
                this.panelUsersBlock.on('click', _.bind(this.onUsersClick, this));

                this.lblUserCount = this.panelUsers.find('#status-users-count');

                this.lblChangeRights = this.panelUsers.find('#status-change-rights');
                this.lblChangeRights.on('click', _.bind(this.onUsersClick, this));

                this.$el.find('#status-users-menu').on('click', function() {
                    return false;
                });
                /** coauthoring end **/

                this.txtGoToPage = new Common.UI.InputField({
                    el          : $('#status-goto-page'),
                    allowBlank  : true,
                    validateOnChange: true,
                    style       : 'width: 60px;',
                    maskExp: /[0-9]/,
                    validation  : function(value) {
                        if (/(^[0-9]+$)/.test(value)) {
                            value = parseInt(value);
                            if (undefined !== value && value > 0 && value <= me.pages.get('count'))
                                return true;
                        }

                        return me.txtPageNumInvalid;
                    }
                }).on('keypress:after', function(input, e) {
                        if (e.keyCode === Common.UI.Keys.RETURN) {
                            var box = me.$el.find('#status-goto-box'),
                                edit = box.find('input[type=text]'), page = parseInt(edit.val());
                            if (!page || page-- > me.pages.get('count') || page < 0) {
                                edit.select();
                                return false;
                            }

                            box.focus();                        // for IE
                            box.parent().removeClass('open');

                            me.api.goToPage(page);
                            me.api.asc_enableKeyEvents(true);

                            return false;
                        }
                    }
                ).on('keyup:after', function(input, e) {
                        if (e.keyCode === Common.UI.Keys.ESC) {
                            var box = me.$el.find('#status-goto-box');
                            box.focus();                        // for IE
                            box.parent().removeClass('open');
                            me.api.asc_enableKeyEvents(true);
                            return false;
                        }
                    }
                );

                var goto = this.$el.find('#status-goto-box');
                goto.on('click', function() {
                    return false;
                });
                goto.parent().on('show.bs.dropdown',
                    function () {
                        me.txtGoToPage.setValue(me.api.getCurrentPage() + 1);
                        me.txtGoToPage.checkValidate();
                        var edit = me.txtGoToPage.$el.find('input');
                        _.defer(function(){edit.focus(); edit.select();}, 100);

                    }
                );
                goto.parent().on('hide.bs.dropdown',
                    function () { var box = me.$el.find('#status-goto-box');
                        if (me.api && box) {
                            box.focus();                        // for IE
                            box.parent().removeClass('open');

                            me.api.asc_enableKeyEvents(true);
                        }
                    }
                );

                this.btnPreview = new Common.UI.Button({
                    el: $('#status-btn-preview',this.el),
                    hint: this.tipPreview,
                    hintAnchor: 'top'
                });

                return this;
            },

            setApi: function(api) {
                this.api = api;

                if (this.api) {
                    this.api.asc_registerCallback('asc_onCountPages',   _.bind(_onCountPages, this));
                    this.api.asc_registerCallback('asc_onCurrentPage',  _.bind(_onCurrentPage, this));

                    /** coauthoring begin **/
                    this.api.asc_registerCallback('asc_onAuthParticipantsChanged', _.bind(this.onApiUsersChanged, this));
                    this.api.asc_registerCallback('asc_onParticipantsChanged',     _.bind(this.onApiUsersChanged, this));
                    /** coauthoring end **/
                }

                return this;

            },

            setMode: function(mode) {
                this.mode = mode;
                this.$el.find('.el-edit')[this.mode.isEdit?'show':'hide']();
                this.lblChangeRights[(!this.mode.isOffline && this.mode.sharingSettingsUrl&&this.mode.sharingSettingsUrl.length)?'show':'hide']();
                this.panelUsers[(!this.mode.isOffline && this.mode.sharingSettingsUrl&&this.mode.sharingSettingsUrl.length)?'show':'hide']();
            },

            setVisible: function(visible) {
                visible
                    ? this.show()
                    : this.hide();
            },

            /** coauthoring begin **/
            onUsersClick: function() {
                this.panelUsers.removeClass('open');
                this.fireEvent('click:users', this);
            },

            onApiUsersChanged: function(users) {
                var length = 0;
                _.each(users, function(item){
                    if (!item.asc_getView())
                        length++;
                });

                this.panelUsers[(length>1 || this.mode.sharingSettingsUrl&&this.mode.sharingSettingsUrl.length)?'show':'hide']();
                this.lblUserCount.css({
                    'font-size': (length > 1 ? '11px' : '14px'),
                    'font-weight': (length > 1 ? 'bold' : 'normal'),
                    'margin-top': (length > 1 ? '0' : '-1px')
                });
                this.lblUserCount.text(length > 1 ? length : '+');
                $('#status-users-icon').css('margin-bottom', length > 1 ? '0' : '2px');

                var usertip = this.panelUsersBlock.data('bs.tooltip');
                if (usertip) {
                    usertip.options.title = (length > 1) ? this.tipViewUsers : this.tipAccessRights;
                    usertip.setContent();
                }
                (length > 1) ? this.panelUsersBlock.attr('data-toggle', 'dropdown') : this.panelUsersBlock.removeAttr('data-toggle');
                this.panelUsersBlock.toggleClass('dropdown-toggle', length > 1);
                (length > 1) ? this.panelUsersBlock.off('click') : this.panelUsersBlock.on('click', _.bind(this.onUsersClick, this));
            },

            _onAddUser: function(m, c, opts) {
                if (this.panelUsersList) {
                    this.panelUsersList.find('ul').append(_.template(this.tplUser, {user: m, scope: this}));
                    this.panelUsersList.scroller.update({minScrollbarLength  : 40, alwaysVisibleY: true});
                }
            },

            _onUsersChanged: function(m) {
                if (m.changed.online != undefined && this.panelUsersList) {
                    this.panelUsersList.find('#status-chat-user-'+ m.get('id'))[m.changed.online?'removeClass':'addClass']('offline');
                    this.panelUsersList.scroller.update({minScrollbarLength  : 40, alwaysVisibleY: true});
                }
            },

            _onResetUsers: function(c, opts) {
                if (this.panelUsersList) {
                    this.panelUsersList.html(this.templateUserList({users: c.models, usertpl: this.tplUser, scope: this}));
                    this.panelUsersList.scroller = new Common.UI.Scroller({
                        el              : $('#status-users-list ul'),
                        useKeyboard     : true,
                        minScrollbarLength  : 40,
                        alwaysVisibleY: true
                    });
                }
            },

            getUserName: function (username) {
                return Common.Utils.String.htmlEncode(username);
            },
            /** coauthoring end **/

            showStatusMessage: function(message) {
                $('#status-label-action').text(message);
            },

            clearStatusMessage: function() {
                $('#status-label-action').text('');
            },

            pageIndexText   : 'Slide {0} of {1}',
            goToPageText    : 'Go to Slide',
            tipUsers        : 'Document is currently being edited by several users.',
            tipMoreUsers    : 'and %1 users.',
            tipShowUsers    : 'To see all users click the icon below.',
            tipFitPage      : 'Fit to Slide',
            tipFitWidth     : 'Fit to Width',
            tipZoomIn       : 'Zoom In',
            tipZoomOut      : 'Zoom Out',
            tipZoomFactor   : 'Magnification',
            txtPageNumInvalid: 'Slide number invalid',
            tipPreview      : 'Start Slideshow',
            tipAccessRights : 'Manage document access rights',
            tipViewUsers    : 'View users and manage document access rights',
            txAccessRights  : 'Change access rights'
        }, PE.Views.Statusbar || {}));
    }
);