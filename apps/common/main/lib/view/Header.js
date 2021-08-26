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
 *  Header.js
 *
 *  Created by Alexander Yuzhin on 2/14/14
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
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
        var _readonlyRights = false;

        var templateUserItem =
                '<li id="<%= user.get("iid") %>" class="<% if (!user.get("online")) { %> offline <% } if (user.get("view")) {%> viewmode <% } %>">' +
                    '<div class="user-name">' +
                        '<div class="color" style="background-color: <%= user.get("color") %>;"></div>'+
                        '<label><%= fnEncode(user.get("username")) %></label>' +
                        '<% if (len>1) { %><label style="margin-left:3px;">(<%=len%>)</label><% } %>' +
                    '</div>'+
                '</li>';

        var templateUserList = _.template(
                '<ul>' +
                    '<% for (originalId in users) { %>' +
                        '<%= usertpl({user: users[originalId][0], fnEncode: fnEncode, len: users[originalId].length}) %>' +
                    '<% } %>' +
                '</ul>');

        var templateRightBox = '<section>' +
                            '<section id="box-doc-name">' +
                                // '<input type="text" id="rib-doc-name" spellcheck="false" data-can-copy="false" style="pointer-events: none;" disabled="disabled">' +
                                '<label id="rib-doc-name" />' +
                            '</section>' +
                            '<section style="display: inherit;">' +
                                '<div class="hedset">' +
                                    '<div class="btn-slot" id="slot-hbtn-edit"></div>' +
                                    '<div class="btn-slot" id="slot-hbtn-print"></div>' +
                                    '<div class="btn-slot" id="slot-hbtn-download"></div>' +
                                '</div>' +
                                '<div class="hedset">' +
                                    // '<span class="btn-slot text" id="slot-btn-users"></span>' +
                                    '<section id="tlb-box-users" class="box-cousers dropdown"">' +
                                        '<div class="btn-users">' +
                                            '<i class="icon toolbar__icon icon--inverse btn-users"></i>' +
                                            '<label class="caption">&plus;</label>' +
                                        '</div>' +
                                        '<div class="cousers-menu dropdown-menu">' +
                                            '<label id="tlb-users-menu-descr"><%= tipUsers %></label>' +
                                            '<div class="cousers-list"></div>' +
                                            '<label id="tlb-change-rights" class="link"><%= txtAccessRights %></label>' +
                                        '</div>' +
                                    '</section>'+
                                '</div>' +
                                '<div class="hedset">' +
                                    '<div class="btn-slot" id="slot-btn-back"></div>' +
                                    '<div class="btn-slot" id="slot-btn-favorite"></div>' +
                                    '<div class="btn-slot" id="slot-btn-options"></div>' +
                                '</div>' +
                                '<div class="hedset">' +
                                    '<div class="btn-slot" id="slot-btn-user-name"></div>' +
                                    '<div class="btn-current-user btn-header hidden">' +
                                        '<i class="icon toolbar__icon icon--inverse btn-user"></i>' +
                                    '</div>' +
                                '</div>' +
                            '</section>' +
                        '</section>';

        var templateLeftBox = '<section class="logo">' +
                                '<div id="header-logo"><i></i></div>' +
                            '</section>';

        var templateTitleBox = '<section id="box-document-title">' +
                                '<div class="extra"></div>' +
                                '<div class="hedset">' +
                                    '<div class="btn-slot" id="slot-btn-dt-save"></div>' +
                                    '<div class="btn-slot" id="slot-btn-dt-print"></div>' +
                                    '<div class="btn-slot" id="slot-btn-dt-undo"></div>' +
                                    '<div class="btn-slot" id="slot-btn-dt-redo"></div>' +
                                '</div>' +
                                '<div class="lr-separator" id="id-box-doc-name">' +
                                    '<label id="title-doc-name" />' +
                                '</div>' +
                                '<label id="title-user-name"></label>' +
                            '</section>';

        function onResetUsers(collection, opts) {
            var usercount = collection.getEditingCount();
            if ( $userList ) {
                if ( usercount > 1 || usercount > 0 && appConfig && !appConfig.isEdit && !appConfig.isRestrictedEdit) {
                    $userList.html(templateUserList({
                        users: collection.chain().filter(function(item){return item.get('online') && !item.get('view')}).groupBy(function(item) {return item.get('idOriginal');}).value(),
                        usertpl: _.template(templateUserItem),
                        fnEncode: function(username) {
                            return Common.Utils.String.htmlEncode(AscCommon.UserInfoParser.getParsedName(username));
                        }
                    }));

                    $userList.scroller = new Common.UI.Scroller({
                        el: $userList.find('ul'),
                        useKeyboard: true,
                        minScrollbarLength: 40,
                        alwaysVisibleY: true
                    });
                    $userList.scroller.update({minScrollbarLength  : 40, alwaysVisibleY: true});
                } else {
                    $userList.empty();
                }
            }

            applyUsers( usercount, collection.getEditingOriginalCount() );
        };

        function onUsersChanged(model) {
            onResetUsers(model.collection);
        };

        function applyUsers(count, originalCount) {
            if (!$btnUsers) return;

            var has_edit_users = count > 1 || count > 0 && appConfig && !appConfig.isEdit && !appConfig.isRestrictedEdit; // has other user(s) who edit document
            if ( has_edit_users ) {
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

                $panelUsers[(!_readonlyRights && appConfig && (appConfig.sharingSettingsUrl && appConfig.sharingSettingsUrl.length || appConfig.canRequestSharingSettings)) ? 'show' : 'hide']();
            }

            $btnUsers.find('.caption')
                .css({'font-size': ((has_edit_users) ? '12px' : '14px'),
                    'margin-top': ((has_edit_users) ? '0' : '-1px')})
                .html((has_edit_users) ? originalCount : '&plus;');

            var usertip = $btnUsers.data('bs.tooltip');
            if ( usertip ) {
                usertip.options.title = (has_edit_users) ? usertip.options.titleExt : usertip.options.titleNorm;
                usertip.setContent();
            }
        }

        function onLostEditRights() {
            _readonlyRights = true;
            $panelUsers && $panelUsers.find('#tlb-change-rights').hide();
            $btnUsers && !$btnUsers.menu && $panelUsers.hide();
        }

        function onUsersClick(e) {
            if ( !$btnUsers.menu ) {
                $panelUsers.removeClass('open');
                Common.NotificationCenter.trigger('collaboration:sharing');
            } else {
                var usertip = $btnUsers.data('bs.tooltip');
                if ( usertip ) {
                    if ( usertip.dontShow===undefined)
                        usertip.dontShow = true;

                    usertip.hide();
                }
            }
        }

        function onAppShowed(config) {
            if ( this.labelDocName ) {
                if ( config.isCrypted ) {
                    this.labelDocName.before(
                        '<div class="inner-box-icon crypted">' +
                            '<svg class="icon"><use xlink:href="#svg-icon-crypted"></use></svg>' +
                        '</div>');
                }

                if (!config.isEdit || !config.customization || !config.customization.compactHeader) {
                    var $parent = this.labelDocName.parent();
                    var _left_width = $parent.position().left,
                        _right_width = $parent.next().outerWidth();

                    if ( _left_width < _right_width )
                        this.labelDocName.parent().css('padding-left', _right_width - _left_width);
                    else this.labelDocName.parent().css('padding-right', _left_width - _right_width);
                }
            }
        }

        function onAppReady(mode) {
            appConfig = mode;

            var me = this;
            me.btnGoBack.on('click', function (e) {
                Common.NotificationCenter.trigger('goback');
            });

            me.btnFavorite.on('click', function (e) {
                // wait for setFavorite method
                // me.options.favorite = !me.options.favorite;
                // me.btnFavorite.changeIcon(me.options.favorite ? {next: 'btn-in-favorite'} : {curr: 'btn-in-favorite'});
                // me.btnFavorite.updateHint(!me.options.favorite ? me.textAddFavorite : me.textRemoveFavorite);
                Common.NotificationCenter.trigger('markfavorite', !me.options.favorite);
            });

            if ( me.logo )
                me.logo.children(0).on('click', function (e) {
                    var _url = !!me.branding && !!me.branding.logo && (me.branding.logo.url!==undefined) ?
                        me.branding.logo.url : '{{PUBLISHER_URL}}';
                    if (_url) {
                        var newDocumentPage = window.open(_url);
                        newDocumentPage && newDocumentPage.focus();
                    }
                });

            if ( $panelUsers ) {
                onResetUsers(storeUsers);

                $panelUsers.on('shown.bs.dropdown', function () {
                    $userList.scroller && $userList.scroller.update({minScrollbarLength: 40, alwaysVisibleY: true});
                });

                $panelUsers.find('.cousers-menu')
                    .on('click', function(e) { return false; });

                var editingUsers = storeUsers.getEditingCount();
                $btnUsers.tooltip({
                    title: (editingUsers > 1 || editingUsers>0 && !appConfig.isEdit && !appConfig.isRestrictedEdit) ? me.tipViewUsers : me.tipAccessRights,
                    titleNorm: me.tipAccessRights,
                    titleExt: me.tipViewUsers,
                    placement: 'bottom',
                    html: true
                });

                $btnUsers.on('click', onUsersClick.bind(me));

                var $labelChangeRights = $panelUsers.find('#tlb-change-rights');
                $labelChangeRights.on('click', function(e) {
                    $panelUsers.removeClass('open');
                    Common.NotificationCenter.trigger('collaboration:sharing');
                });

                $labelChangeRights[(!mode.isOffline && (mode.sharingSettingsUrl && mode.sharingSettingsUrl.length || mode.canRequestSharingSettings))?'show':'hide']();
                $panelUsers[(editingUsers > 1  || editingUsers > 0 && !appConfig.isEdit && !appConfig.isRestrictedEdit || !mode.isOffline && (mode.sharingSettingsUrl && mode.sharingSettingsUrl.length || mode.canRequestSharingSettings)) ? 'show' : 'hide']();
            }


            if (appConfig.user.guest && appConfig.canRenameAnonymous) {
                if (me.labelUserName) {
                    me.labelUserName.addClass('clickable');
                    me.labelUserName.on('click', function (e) {
                        Common.NotificationCenter.trigger('user:rename');
                    });
                } else if (me.btnUserName) {
                    me.btnUserName.on('click', function (e) {
                        Common.NotificationCenter.trigger('user:rename');
                    });
                }
            }

            if ( me.btnPrint ) {
                me.btnPrint.updateHint(me.tipPrint + Common.Utils.String.platformKey('Ctrl+P'));
                me.btnPrint.on('click', function (e) {
                    me.fireEvent('print', me);
                });
            }

            if ( me.btnSave ) {
                me.btnSave.updateHint(me.tipSave + Common.Utils.String.platformKey('Ctrl+S'));
                me.btnSave.on('click', function (e) {
                    me.fireEvent('save', me);
                });
            }

            if ( me.btnUndo ) {
                me.btnUndo.updateHint(me.tipUndo + Common.Utils.String.platformKey('Ctrl+Z'));
                me.btnUndo.on('click', function (e) {
                    me.fireEvent('undo', me);
                });
            }

            if ( me.btnRedo ) {
                me.btnRedo.updateHint(me.tipRedo + Common.Utils.String.platformKey('Ctrl+Y'));
                me.btnRedo.on('click', function (e) {
                    me.fireEvent('redo', me);
                });
            }

            if ( !mode.isEdit ) {
                if ( me.btnDownload ) {
                    me.btnDownload.updateHint(me.tipDownload);
                    me.btnDownload.on('click', function (e) {
                        me.fireEvent('downloadas', ['original']);
                    });
                }

                if ( me.btnEdit ) {
                    me.btnEdit.updateHint(me.tipGoEdit);
                    me.btnEdit.on('click', function (e) {
                        me.fireEvent('go:editor', me);
                    });
                }
            }

            if ( me.btnOptions )
                me.btnOptions.updateHint(me.tipViewSettings);
        }

        function onDocNameKeyDown(e) {
            var me = this;

            var name = me.labelDocName.val();
            if ( e.keyCode == Common.UI.Keys.RETURN ) {
                name = name.trim();
                if ( !_.isEmpty(name) && me.documentCaption !== name ) {
                    if ( /[\t*\+:\"<>?|\\\\/]/gim.test(name) ) {
                        _.defer(function() {
                            Common.UI.error({
                                msg: (new Common.Views.RenameDialog).txtInvalidName + "*+:\"<>?|\/"
                                , callback: function() {
                                    _.delay(function() {
                                        me.labelDocName.focus();
                                    }, 50);
                                }
                            });

                            me.labelDocName.blur();
                        })
                    } else {
                        Common.Gateway.requestRename(name);
                        Common.NotificationCenter.trigger('edit:complete', me);
                    }
                }
            } else
            if ( e.keyCode == Common.UI.Keys.ESC ) {
                me.labelDocName.val(me.documentCaption);
                Common.NotificationCenter.trigger('edit:complete', this);
            } else {
                me.labelDocName.attr('size', name.length > 10 ? name.length : 10);
            }
        }

        return {
            options: {
                branding: {},
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
                this.options = this.options ? _.extend(this.options, options) : options;

                this.documentCaption = this.options.documentCaption;
                this.branding = this.options.customization;
                this.isModified = false;

                me.btnGoBack = new Common.UI.Button({
                    id: 'btn-goback',
                    cls: 'btn-header',
                    iconCls: 'toolbar__icon icon--inverse btn-goback',
                    split: true
                });

                storeUsers = this.options.storeUsers;
                storeUsers.bind({
                    add     : onUsersChanged,
                    change  : onUsersChanged,
                    reset   : onResetUsers
                });

                me.btnOptions = new Common.UI.Button({
                    cls: 'btn-header no-caret',
                    iconCls: 'toolbar__icon icon--inverse btn-ic-options',
                    menu: true
                });

                me.mnuZoom = {options: {value: 100}};

                me.btnFavorite = new Common.UI.Button({
                    id: 'btn-favorite',
                    cls: 'btn-header',
                    iconCls: 'toolbar__icon icon--inverse btn-favorite'
                });

                Common.NotificationCenter.on({
                    'app:ready': function(mode) {Common.Utils.asyncCall(onAppReady, me, mode);},
                    'app:face': function(mode) {Common.Utils.asyncCall(onAppShowed, me, mode);}
                });
                Common.NotificationCenter.on('collaboration:sharingdeny', onLostEditRights);
            },

            render: function (el, role) {
                $(el).html(this.getPanel(role));

                return this;
            },

            getPanel: function (role, config) {
                var me = this;

                function createTitleButton(iconid, slot, disabled) {
                    return (new Common.UI.Button({
                        cls: 'btn-header',
                        iconCls: iconid,
                        disabled: disabled === true
                    })).render(slot);
                }

                if ( role == 'left' && (!config || !config.isDesktopApp)) {
                    $html = $(templateLeftBox);
                    this.logo = $html.find('#header-logo');

                    if (this.branding && this.branding.logo && this.branding.logo.image && this.logo) {
                        this.logo.html('<img src="' + this.branding.logo.image + '" style="max-width:100px; max-height:20px; margin: 0;"/>');
                        this.logo.css({'background-image': 'none', width: 'auto'});
                        (this.branding.logo.url || this.branding.logo.url===undefined) && this.logo.addClass('link');
                    }

                    return $html;
                } else
                if ( role == 'right' ) {
                    var $html = $(_.template(templateRightBox)({
                        tipUsers: this.labelCoUsersDescr,
                        txtAccessRights: this.txtAccessRights
                    }));

                    if ( !me.labelDocName ) {
                        me.labelDocName = $html.find('#rib-doc-name');
                        if ( me.documentCaption ) {
                            me.labelDocName.text(me.documentCaption);
                        }
                    } else {
                        $html.find('#rib-doc-name').hide();
                    }

                    if ( !_.isUndefined(this.options.canRename) ) {
                        this.setCanRename(this.options.canRename);
                    }

                    if ( this.options.canBack === true ) {
                        me.btnGoBack.render($html.find('#slot-btn-back'));
                    } else {
                        $html.find('#slot-btn-back').hide();
                    }

                    if ( this.options.favorite !== undefined && this.options.favorite!==null) {
                        me.btnFavorite.render($html.find('#slot-btn-favorite'));
                        me.btnFavorite.changeIcon(!!me.options.favorite ? {next: 'btn-in-favorite'} : {curr: 'btn-in-favorite'});
                        me.btnFavorite.updateHint(!me.options.favorite ? me.textAddFavorite : me.textRemoveFavorite);
                    } else {
                        $html.find('#slot-btn-favorite').hide();
                    }

                    if ( !config.isEdit ) {
                        if ( (config.canDownload || config.canDownloadOrigin) && !config.isOffline  )
                            this.btnDownload = createTitleButton('toolbar__icon icon--inverse btn-download', $html.findById('#slot-hbtn-download'));

                        if ( config.canPrint )
                            this.btnPrint = createTitleButton('toolbar__icon icon--inverse btn-print', $html.findById('#slot-hbtn-print'));

                        if ( config.canEdit && config.canRequestEditRights )
                            this.btnEdit = createTitleButton('toolbar__icon icon--inverse btn-edit', $html.findById('#slot-hbtn-edit'));
                    }
                    me.btnOptions.render($html.find('#slot-btn-options'));

                    if (!config.isEdit || config.customization && !!config.customization.compactHeader) {
                        if (config.user.guest && config.canRenameAnonymous)
                            me.btnUserName = createTitleButton('toolbar__icon icon--inverse btn-user', $html.findById('#slot-btn-user-name'));
                        else {
                            me.elUserName = $html.find('.btn-current-user');
                            me.elUserName.removeClass('hidden');
                        }
                        me.setUserName(me.options.userName);
                    }

                    $userList = $html.find('.cousers-list');
                    $panelUsers = $html.find('.box-cousers');
                    $btnUsers = $html.find('.btn-users');

                    $panelUsers.hide();

                    return $html;
                } else
                if ( role == 'title' ) {
                    var $html = $(_.template(templateTitleBox)());

                    !!me.labelDocName && me.labelDocName.hide().off();                  // hide document title if it was created in right box
                    me.labelDocName = $html.find('#title-doc-name');
                    me.labelDocName.text( me.documentCaption );

                    me.labelUserName = $('> #title-user-name', $html);
                    me.setUserName(me.options.userName);

                    if ( config.canPrint && config.isEdit ) {
                        me.btnPrint = createTitleButton('toolbar__icon icon--inverse btn-print', $html.findById('#slot-btn-dt-print'), true);
                    }

                    me.btnSave = createTitleButton('toolbar__icon icon--inverse btn-save', $html.findById('#slot-btn-dt-save'), true);
                    me.btnUndo = createTitleButton('toolbar__icon icon--inverse btn-undo', $html.findById('#slot-btn-dt-undo'), true);
                    me.btnRedo = createTitleButton('toolbar__icon icon--inverse btn-redo', $html.findById('#slot-btn-dt-redo'), true);

                    if ( me.btnSave.$icon.is('svg') ) {
                        me.btnSave.$icon.addClass('icon-save btn-save');
                        var _create_use = function (extid, intid) {
                            var _use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
                            _use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', extid);
                            _use.setAttribute('id', intid);

                            return $(_use);
                        };

                        _create_use('#svg-btn-save-coauth', 'coauth').appendTo(me.btnSave.$icon);
                        _create_use('#svg-btn-save-sync', 'sync').appendTo(me.btnSave.$icon);
                    }
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

                if ( value ) {
                    if ( value.logo && value.logo.image ) {
                        element = $('#header-logo');
                        if (element) {
                            element.html('<img src="' + value.logo.image + '" style="max-width:100px; max-height:20px; margin: 0;"/>');
                            element.css({'background-image': 'none', width: 'auto'});
                            (value.logo.url || value.logo.url===undefined) && element.addClass('link');
                        }
                    }
                }
            },

            setDocumentCaption: function(value) {
                !value && (value = '');

                this.documentCaption = value;
                this.isModified && (value += '*');
                if ( this.labelDocName ) {
                    this.labelDocName.text( value );
                    // this.labelDocName.attr('size', value.length);

                    this.setCanRename(true);
                }

                return value;
            },

            getDocumentCaption: function () {
                return this.documentCaption;
            },

            setDocumentChanged: function (changed) {
                this.isModified = changed;

                var _name = this.documentCaption;
                changed && (_name += '*');

                this.labelDocName.text(_name);
            },

            setCanBack: function (value, text) {
                this.options.canBack = value;
                this.btnGoBack[value ? 'show' : 'hide']();
                if (value)
                    this.btnGoBack.updateHint((text && typeof text == 'string') ? text : this.textBack);

                return this;
            },

            getCanBack: function () {
                return this.options.canBack;
            },

            setFavorite: function (value) {
                this.options.favorite = value;
                this.btnFavorite[value!==undefined && value!==null ? 'show' : 'hide']();
                this.btnFavorite.changeIcon(!!value ? {next: 'btn-in-favorite'} : {curr: 'btn-in-favorite'});
                this.btnFavorite.updateHint(!value ? this.textAddFavorite : this.textRemoveFavorite);

                return this;
            },

            getFavorite: function () {
                return this.options.favorite;
            },

            setCanRename: function (rename) {
                rename = false;

                var me = this;
                me.options.canRename = rename;
                if ( me.labelDocName ) {
                    var label = me.labelDocName;
                    if ( rename ) {
                        label.removeAttr('disabled').tooltip({
                            title: me.txtRename,
                            placement: 'cursor'}
                        );

                        label.on({
                            'keydown': onDocNameKeyDown.bind(this),
                            'blur': function (e) {

                            }
                        });

                    } else {
                        label.off();
                        label.attr('disabled', true);
                        var tip = label.data('bs.tooltip');
                        if ( tip ) {
                            tip.options.title = '';
                            tip.setContent();
                        }
                    }
                    label.attr('data-can-copy', rename);
                }
            },

            setUserName: function(name) {
                if ( !!this.labelUserName ) {
                    if ( !!name ) {
                        this.labelUserName.text(name).show();
                    } else this.labelUserName.hide();
                } else {
                    this.options.userName = name;
                    if ( this.btnUserName ) {
                        this.btnUserName.updateHint(name);
                    } else if (this.elUserName) {
                        this.elUserName.tooltip({
                            title: name,
                            placement: 'cursor',
                            html: true
                        });
                    }
                }

                return this;
            },

            getButton: function(type) {
                if (type == 'save')
                    return this.btnSave;
                else if (type == 'users')
                    return $panelUsers;
            },

            lockHeaderBtns: function (alias, lock) {
                var me = this;
                if ( alias == 'users' ) {
                    if ( lock )
                        $btnUsers.addClass('disabled').attr('disabled', 'disabled'); else
                        $btnUsers.removeClass('disabled').attr('disabled', '');
                } else if ( alias == 'rename-user' ) {
                    if (me.labelUserName) {
                        if ( lock ) {
                            me.labelUserName.removeClass('clickable');
                            me.labelUserName.addClass('disabled');
                        } else {
                            me.labelUserName.addClass('clickable');
                            me.labelUserName.removeClass('disabled');
                        }
                    } else if (me.btnUserName) {
                        me.btnUserName.setDisabled(lock);
                    }
                } else {
                    var _lockButton = function (btn) {
                        if ( btn ) {
                            if ( lock ) {
                                btn.keepState = {
                                    disabled: btn.isDisabled()
                                };
                                btn.setDisabled( true );
                            } else {
                                btn.setDisabled( btn.keepState && btn.keepState.disabled || lock);
                                delete btn.keepState;
                            }
                        }
                    };

                    switch ( alias ) {
                    case 'undo': _lockButton(me.btnUndo); break;
                    case 'redo': _lockButton(me.btnRedo); break;
                    case 'opts': _lockButton(me.btnOptions); break;
                    default: break;
                    }
                }
            },

            fakeMenuItem: function() {
                return {
                    conf: {checked: false, disabled: false},
                    setChecked: function (val) { this.conf.checked = val; },
                    isChecked: function () { return this.conf.checked; },
                    setDisabled: function (val) { this.conf.disabled = val; },
                    isDisabled: function () { return this.conf.disabled; }
                };
            },

            textBack: 'Go to Documents',
            txtRename: 'Rename',
            txtAccessRights: 'Change access rights',
            tipAccessRights: 'Manage document access rights',
            labelCoUsersDescr: 'Document is currently being edited by several users.',
            tipViewUsers: 'View users and manage document access rights',
            tipDownload: 'Download file',
            tipPrint: 'Print file',
            tipGoEdit: 'Edit current file',
            tipSave: 'Save',
            tipUndo: 'Undo',
            tipRedo: 'Redo',
            textCompactView: 'Hide Toolbar',
            textHideStatusBar: 'Hide Status Bar',
            textHideLines: 'Hide Rulers',
            textZoom: 'Zoom',
            textAdvSettings: 'Advanced Settings',
            tipViewSettings: 'View Settings',
            textRemoveFavorite: 'Remove from Favorites',
            textAddFavorite: 'Mark as favorite',
            textHideNotes: 'Hide Notes'
        }
    }(), Common.Views.Header || {}))
});
