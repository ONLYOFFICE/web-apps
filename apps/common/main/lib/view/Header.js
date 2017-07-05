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
 *  Header.js
 *
 *  Created by Alexander Yuzhin on 2/14/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

if (Common === undefined)
    var Common = {};

Common.Views = Common.Views || {};

define([
    'backbone',
    'text!common/main/lib/template/Header.template',
    'core',
    'common/main/lib/view/RenameDialog'
], function (Backbone, headerTemplate) { 'use strict';

    Common.Views.Header =  Backbone.View.extend(_.extend(function(){
        var storeUsers, appConfig;
        var $userList, $panelUsers, $btnUsers;
        var $saveStatus;

        var templateUserItem =
                '<li id="status-chat-user-<%= user.get("id") %>" class="<% if (!user.get("online")) { %> offline <% } if (user.get("view")) {%> viewmode <% } %>">' +
                    '<div class="color" style="background-color: <%= user.get("color") %>;" >' +
                        '<label class="name"><%= fnEncode(user.get("username")) %></label>' +
                    '</div>' +
                '</li>';

        var templateUserList = _.template(
                '<ul>' +
                    '<% _.each(users, function(item) { %>' +
                        '<%= usertpl({user: item, fnEncode: fnEncode}) %>' +
                    '<% }); %>' +
                '</ul>');

        var templateRightBox = '<section>' +
                            '<label id="rib-doc-name" class="status-label"></label>' +
                            '<a id="rib-save-status" class="status-label locked"><%= textSaveEnd %></a>' +
                            '<div class="elset">' +
                                // '<span class="btn-slot text" id="slot-btn-users"></span>' +
                                '<section id="tlb-box-users" class="box-cousers dropdown"">' +
                                    '<div class="btn-users">' +
                                        '<svg class="icon"><use href="#svg-btn-users"></use></svg>' +
                                        '<label class="caption">&plus;</label>' +
                                    '</div>' +
                                    '<div class="cousers-menu dropdown-menu">' +
                                        '<label id="tlb-users-menu-descr"><%= tipUsers %></label>' +
                                        '<div class="cousers-list"></div>' +
                                        '<label id="tlb-change-rights" class="link"><%= txtAccessRights %></label>' +
                                    '</div>' +
                                '</section>'+
                                '<div class="btn-slot" id="slot-btn-back"></div>' +
                            '</div>' +
                        '</section>';

        var templateLeftBox = '<section class="logo">' +
                                '<div id="header-logo"><i /></div>' +
                            '</section>';

        function onAddUser(model, collection, opts) {
            if ( $userList ) {
                var $ul = $userList.find('ul');
                if ( !$ul.length ) {
                    $userList.html( templateUserList({
                                        users: collection.models,
                                        usertpl: _.template(templateUserItem),
                                        fnEncode: Common.Utils.String.htmlEncode
                                    })
                    );
                } else {
                    $ul.append( _.template(templateUserItem)({
                        user: model,
                        fnEncode: Common.Utils.String.htmlEncode
                    }) );
                }

                $userList.scroller && $userList.scroller.update({minScrollbarLength  : 40, alwaysVisibleY: true});
            }

            applyUsers( collection.getOnlineCount() );
        };

        function onUsersChanged(model, collection) {
            if (model.changed.online != undefined && $userList) {
                $userList.find('#status-chat-user-'+ model.get('id'))[model.changed.online ? 'removeClass' : 'addClass']('offline');
                $userList.scroller && $userList.scroller.update({minScrollbarLength  : 40, alwaysVisibleY: true});
            }

            applyUsers(model.collection.getOnlineCount());
        };

        function onResetUsers(collection, opts) {
            var usercount = collection.getOnlineCount();
            if ( $userList ) {
                if ( usercount > 1 ) {
                    $userList.html(templateUserList({
                        users: collection.models,
                        usertpl: _.template(templateUserItem),
                        fnEncode: Common.Utils.String.htmlEncode
                    }));

                    $userList.scroller = new Common.UI.Scroller({
                        el: $userList.find('ul'),
                        useKeyboard: true,
                        minScrollbarLength: 40,
                        alwaysVisibleY: true
                    });
                } else {
                    $userList.empty();
                }
            }

            applyUsers( usercount );
        };

        function applyUsers(count) {
            if ( count > 1 ) {
                $btnUsers
                    .attr('data-toggle', 'dropdown')
                    .addClass('dropdown-toggle')
                    .menu = true;

                $panelUsers['show']();
            } else {
                $btnUsers
                    .removeAttr('data-toggle')
                    .removeClass('dropdown-toggle')
                    .menu = false;

                $panelUsers[(appConfig && !appConfig.isReviewOnly && appConfig.sharingSettingsUrl && appConfig.sharingSettingsUrl.length) ? 'show' : 'hide']();
            }

            $btnUsers.find('.caption')
                .css({'font-size': (count > 1 ? '12px' : '14px'),
                    'font-weight': (count > 1 ? 'bold' : 'normal'),
                    'margin-top': (count > 1 ? '0' : '-1px')})
                .html(count > 1 ? count : '&plus;');

            var usertip = $btnUsers.data('bs.tooltip');
            if ( usertip ) {
                usertip.options.title = count > 1 ? usertip.options.titleExt : usertip.options.titleNorm;
                usertip.setContent();
            }
        }

        function onUsersClick(e) {
            if ( !$btnUsers.menu ) {
                $panelUsers.removeClass('open');
                this.fireEvent('click:users', this);

                return false;
            }

            var usertip = $btnUsers.data('bs.tooltip');
            if ( usertip ) {
                if ( usertip.dontShow===undefined)
                    usertip.dontShow = true;

                usertip.hide();
            }
        }

        function onAppReady(mode) {
            appConfig = mode;

            var me = this;
            me.btnGoBack.updateHint(me.textBack);
            me.btnGoBack.on('click', function (e) {
                me.fireEvent('go:back', ['page:new']);
            });

            if ( me.logo )
                me.logo.on('click', function (e) {
                    var _url = !!me.branding && !!me.branding.logo && !!me.branding.logo.url ?
                        me.branding.logo.url : 'http://www.onlyoffice.com';

                    var newDocumentPage = window.open(_url);
                    newDocumentPage && newDocumentPage.focus();
                });

            $panelUsers.on('shown.bs.dropdown', function () {
                $userList.scroller && $userList.scroller.update({minScrollbarLength: 40, alwaysVisibleY: true});
            });

            $panelUsers.find('.cousers-menu')
                .on('click', function(e) { return false; });

            $btnUsers.tooltip({
                title: 'Manage document access rights',
                titleNorm: me.tipAccessRights,
                titleExt: me.tipViewUsers,
                placement: 'bottom',
                html: true
            });

            $btnUsers.on('click', onUsersClick.bind(me));

            var $labelChangeRights = $panelUsers.find('#tlb-change-rights');
            $labelChangeRights.on('click', onUsersClick.bind(me));

            $labelChangeRights[(!mode.isOffline && !mode.isReviewOnly && mode.sharingSettingsUrl && mode.sharingSettingsUrl.length)?'show':'hide']();
            $panelUsers[(storeUsers.size() > 1 || !mode.isOffline && !mode.isReviewOnly && mode.sharingSettingsUrl && mode.sharingSettingsUrl.length) ? 'show' : 'hide']();

            if ( $saveStatus ) {
                $saveStatus.attr('data-width', me.textSaveExpander);
                if (appConfig.canUseHistory) {
                    // $saveStatus.on('click', function(e) {
                    //     me.fireEvent('history:show', ['header']);
                    // });
                } else {
                    $saveStatus.addClass('locked');
                }
            }
        }

        return {
            options: {
                branding: {},
                headerCaption: 'Default Caption',
                documentCaption: '',
                canBack: false
            },

            el: '#header',

            // Compile our stats template
            template: _.template(headerTemplate),

            // Delegated events for creating new items, and clearing completed ones.
            events: {
                // 'click #header-logo': function (e) {}
            },

            initialize: function (options) {
                var me = this;
                this.options = this.options ? _({}).extend(this.options, options) : options;

                this.headerCaption = this.options.headerCaption;
                this.documentCaption = this.options.documentCaption;
                this.canBack = this.options.canBack;
                this.branding = this.options.customization;
                this.isModified = false;

                me.btnGoBack = new Common.UI.Button({
                    id: 'btn-goback',
                    cls: 'btn-toolbar',
                    iconCls: 'svgicon svg-btn-goback',
                    split: true
                });

                storeUsers = this.options.storeUsers;
                storeUsers.bind({
                    add     : onAddUser,
                    change  : onUsersChanged,
                    reset   : onResetUsers
                });


                Common.NotificationCenter.on('app:ready', function(mode) {
                    Common.Utils.asyncCall(onAppReady, me, mode);
                });
            },

            render: function (el, role) {
                $(el).html(this.getPanel(role));

                return this;
            },

            getPanel: function (role, config) {
                if ( role == 'left' && (!config || !config.isDesktopApp)) {
                    $html = $(templateLeftBox);
                    this.logo = $html.find('#header-logo');
                    return $html;
                } else
                if ( role == 'right' ) {
                    var $html = $(_.template(templateRightBox)({
                        tipUsers: this.labelCoUsersDescr,
                        txtAccessRights: this.txtAccessRights,
                        textSaveEnd: this.textSaveEnd
                    }));

                    this.labelDocName = $html.find('#rib-doc-name');
                    $saveStatus = $html.find('#rib-save-status');
                    $saveStatus.hide();

                    if ( config && config.isDesktopApp ) {
                        $html.addClass('desktop');
                        $html.find('#slot-btn-back').hide();
                        this.labelDocName.hide();

                        if ( config.isOffline )
                            $saveStatus = false;
                    } else {
                        if ( this.canBack === true ) {
                            this.btnGoBack.render($html.find('#slot-btn-back'));
                        } else {
                            $html.find('#slot-btn-back').hide();
                        }
                    }

                    if ( this.documentCaption ) {
                        $html.find('#rib-doc-name').text(
                            Common.Utils.String.htmlEncode(this.documentCaption) );
                    }

                    $userList = $html.find('.cousers-list');
                    $panelUsers = $html.find('.box-cousers');
                    $btnUsers = $html.find('.btn-users');

                    $panelUsers.hide();

                    return $html;
                }
            },

            setVisible: function (visible) {
                // visible
                //     ? this.show()
                //     : this.hide();
            },

            setBranding: function (value) {
                var element;

                this.branding = value;

                if (value && value.logo && value.logo.image) {
                    element = $('#header-logo');
                    if ( element ) {
                        element.html('<img src="' + value.logo.image + '" style="max-width:100px; max-height:20px; margin: 0;"/>');
                        element.css({'background-image': 'none', width: 'auto'});
                    }
                }
            },

            setHeaderCaption: function (value) {
                this.headerCaption = value;

                return value;
            },

            getHeaderCaption: function () {
                return this.headerCaption;
            },

            setDocumentCaption: function(value) {
                !value && (value = '');

                this.documentCaption = value;
                this.isModified && (value += '*');
                if ( this.labelDocName )
                    this.labelDocName.html(Common.Utils.String.htmlEncode(value));

                return value;
            },

            getDocumentCaption: function () {
                return this.documentCaption;
            },

            setDocumentChanged: function (changed) {
                this.isModified = changed;

                var _name = Common.Utils.String.htmlEncode(this.documentCaption);
                changed && (_name += '*');

                this.labelDocName.html(_name);
            },

            setCanBack: function (value) {
                this.canBack = value;

                this.btnGoBack[value ? 'show' : 'hide']();
            },

            getCanBack: function () {
                return this.canBack;
            },

            setCanRename: function (rename) {
                // var dc = $('#header-documentcaption div');
                // if (rename) {
                //     var me = this;
                //     dc.tooltip({title: me.txtRename, placement: 'cursor'});
                //     dc.on('click', function (e) {
                //         (new Common.Views.RenameDialog({
                //             filename: me.documentCaption,
                //             handler: function (result, value) {
                //                 if (result == 'ok' && !_.isEmpty(value.trim()) && me.documentCaption !== value.trim()) {
                //                     Common.Gateway.requestRename(value);
                //                 }
                //                 Common.NotificationCenter.trigger('edit:complete', me);
                //             }
                //         })).show(dc.position().left - 1, 20);
                //     });
                // } else {
                //     var tip = dc.data('bs.tooltip');
                //     if (tip) {
                //         tip.options.title = '';
                //         tip.setContent();
                //     }
                //     dc.off('click');
                // }
                // dc.css('cursor', rename ? 'pointer' : 'default');
                // dc.toggleClass('renamed', rename);
            },

            setSaveStatus: function (status) {
                if ( $saveStatus ) {
                    if ( $saveStatus.is(':hidden') ) $saveStatus.show();

                    var _text;
                    switch ( status ) {
                    case 'begin': _text = this.textSaveBegin; break;
                    case 'changed': _text = this.textSaveChanged; break;
                    default: _text = this.textSaveEnd;
                    }

                    $saveStatus.text( _text );
                }
            },

            textBack: 'Go to Documents',
            txtRename: 'Rename',
            textSaveBegin: 'Saving...',
            textSaveEnd: 'All changes saved',
            textSaveChanged: 'Modified',
            textSaveExpander: 'All changes saved',
            txtAccessRights: 'Change access rights',
            tipAccessRights: 'Manage document access rights',
            labelCoUsersDescr: 'Document is currently being edited by several users.',
            tipViewUsers: 'View users and manage document access rights'
        }
    }(), Common.Views.Header || {}))
});
