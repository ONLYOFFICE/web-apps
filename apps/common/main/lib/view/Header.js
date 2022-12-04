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
        var $userList, $panelUsers, $btnUsers, $btnUserName, $labelDocName;
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
                                //'<label id="rib-doc-name" />' +
                                '<input id="rib-doc-name" autofill="off" autocomplete="off"/></input>' +
                            '</section>' +
                            '<section style="display: inherit;">' +
                                '<div class="hedset">' +
                                    '<div class="btn-slot" id="slot-hbtn-edit"></div>' +
                                    '<div class="btn-slot" id="slot-hbtn-print"></div>' +
                                    '<div class="btn-slot" id="slot-hbtn-print-quick"></div>' +
                                    '<div class="btn-slot" id="slot-hbtn-download"></div>' +
                                '</div>' +
                                '<div class="hedset" data-layout-name="header-users">' +
                                    // '<span class="btn-slot text" id="slot-btn-users"></span>' +
                                    '<section id="tlb-box-users" class="box-cousers dropdown">' +
                                        '<div class="btn-users dropdown-toggle" data-toggle="dropdown" data-hint="0" data-hint-direction="bottom" data-hint-offset="big">' +
                                            '<div class="inner-box-icon">' +
                                                '<svg class=""><use xlink:href="#svg-icon-users"></use></svg>' +
                                            '</div>' +
                                            '<label class="caption"></label>' +
                                        '</div>' +
                                        '<div class="cousers-menu dropdown-menu">' +
                                            '<label id="tlb-users-menu-descr"><%= tipUsers %></label>' +
                                            '<div class="cousers-list"></div>' +
                                        '</div>' +
                                    '</section>'+
                                '</div>' +
                                '<div class="hedset">' +
                                    '<div class="btn-slot" id="slot-btn-share"></div>' +
                                '</div>' +
                                '<div class="hedset">' +
                                    '<div class="btn-slot" id="slot-btn-mode"></div>' +
                                    '<div class="btn-slot" id="slot-btn-back"></div>' +
                                    '<div class="btn-slot" id="slot-btn-favorite"></div>' +
                                    '<div class="btn-slot" id="slot-btn-search"></div>' +
                                '</div>' +
                                '<div class="hedset">' +
                                    // '<div class="btn-slot slot-btn-user-name"></div>' +
                                    '<button type="button" class="btn btn-header slot-btn-user-name hidden">' +
                                        '<div class="color-user-name"></div>' +
                                    '</button>' +
                                    '<div class="btn-current-user hidden">' +
                                        '<div class="color-user-name"></div>' +
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
                                    '<div class="btn-slot" id="slot-btn-dt-home"></div>' +
                                    '<div class="btn-slot" id="slot-btn-dt-save" data-layout-name="header-save"></div>' +
                                    '<div class="btn-slot" id="slot-btn-dt-print"></div>' +
                                    '<div class="btn-slot" id="slot-btn-dt-print-quick"></div>' +
                                    '<div class="btn-slot" id="slot-btn-dt-undo"></div>' +
                                    '<div class="btn-slot" id="slot-btn-dt-redo"></div>' +
                                '</div>' +
                                '<div class="lr-separator" id="id-box-doc-name">' +
                                    // '<label id="title-doc-name" /></label>' +
                                    '<input id="title-doc-name" autofill="off" autocomplete="off"/></input>' +
                                '</div>' +
                                '<div class="hedset">' +
                                    // '<div class="btn-slot slot-btn-user-name"></div>' +
                                    '<button type="button" class="btn btn-header slot-btn-user-name hidden">' +
                                        '<div class="color-user-name"></div>' +
                                    '</button>' +
                                    '<div class="btn-current-user hidden">' +
                                        '<div class="color-user-name"></div>' +
                                    '</div>' +
                                '</div>' +
                            '</section>';

        function onResetUsers(collection, opts) {
            var usercount = collection.getVisibleEditingCount();
            if ( $userList ) {
                if (usercount > 1 && appConfig && (appConfig.isEdit || appConfig.isRestrictedEdit)) {
                    $userList.html(templateUserList({
                        users: collection.chain().filter(function(item){return item.get('online') && !item.get('view') && !item.get('hidden')}).groupBy(function(item) {return item.get('idOriginal');}).value(),
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

            applyUsers( usercount, collection.getVisibleEditingOriginalCount() );
        };

        function onUsersChanged(model) {
            onResetUsers(model.collection);
        };

        function applyUsers(count, originalCount) {
            if (!$btnUsers) return;

            var has_edit_users = count > 1 && appConfig && (appConfig.isEdit || appConfig.isRestrictedEdit); // has other user(s) who edit document
            if ( has_edit_users ) {
                $panelUsers['show']();
                $btnUsers.find('.caption').html(originalCount);
            } else {
                $panelUsers['hide']();
            }
            updateDocNamePosition(appConfig);
        }

        function onLostEditRights() {
            _readonlyRights = true;
            this.btnShare && this.btnShare.setVisible(false);
            updateDocNamePosition(appConfig);
        }

        function onUsersClick(e) {
            var usertip = $btnUsers.data('bs.tooltip');
            if ( usertip ) {
                if ( usertip.dontShow===undefined)
                    usertip.dontShow = true;

                usertip.hide();
            }
        }

        function updateDocNamePosition(config) {
            if ( $labelDocName && config) {
                var $parent = $labelDocName.parent();
                if (!config.isEdit) {
                    var _left_width = $parent.position().left,
                        _right_width = $parent.next().outerWidth();
                    $parent.css('padding-left', _left_width < _right_width ? Math.max(2, _right_width - _left_width) : 2);
                    $parent.css('padding-right', _left_width < _right_width ? 2 : Math.max(2, _left_width - _right_width));
                } else if (!(config.customization && config.customization.compactHeader)) {
                    var _left_width = $parent.position().left,
                        _right_width = $parent.next().outerWidth(),
                        outerWidth = $labelDocName.outerWidth(),
                        cssWidth = $labelDocName[0].style.width;
                    cssWidth = cssWidth ? parseFloat(cssWidth) : outerWidth;
                    if (cssWidth - outerWidth > 0.1) {
                        $parent.css('padding-left', _left_width < _right_width ? Math.max(2, $parent.outerWidth() - 2 - cssWidth) : 2);
                        $parent.css('padding-right', _left_width < _right_width ? 2 : Math.max(2, $parent.outerWidth() - 2 - cssWidth));
                    } else {
                        $parent.css('padding-left', _left_width < _right_width ? Math.max(2, Math.min(_right_width - _left_width + 2, $parent.outerWidth() - 2 - cssWidth)) : 2);
                        $parent.css('padding-right', _left_width < _right_width ? 2 : Math.max(2, Math.min(_left_width - _right_width + 2, $parent.outerWidth() - 2 - cssWidth)));
                    }
                }

                if (!(config.customization && config.customization.toolbarHideFileName) && (!config.isEdit || config.customization && config.customization.compactHeader)) {
                    var basis = parseFloat($parent.css('padding-left') || 0) + parseFloat($parent.css('padding-right') || 0) + parseInt($labelDocName.css('min-width') || 50); // 2px - box-shadow
                    config.isCrypted && (basis += 20);
                    $parent.css('flex-basis', Math.ceil(basis) + 'px');
                    $parent.closest('.extra.right').css('flex-basis', Math.ceil(basis) + $parent.next().outerWidth() + 'px');
                    Common.NotificationCenter.trigger('tab:resize');
                }
            }
        }

        function onResize() {
            if (appConfig && appConfig.isEdit && !(appConfig.customization && appConfig.customization.compactHeader)) {
                updateDocNamePosition(appConfig);
            }
        }

        function onAppShowed(config) {
            // config.isCrypted =true; //delete fore merge!
            if ( $labelDocName ) {
                if ( config.isCrypted ) {
                    $labelDocName.before(
                        '<div class="inner-box-icon crypted hidden">' +
                            '<svg class="icon"><use xlink:href="#svg-icon-crypted"></use></svg>' +
                        '</div>');
                    this.imgCrypted = $labelDocName.parent().find('.crypted');
                    this._showImgCrypted = true;
                }

                updateDocNamePosition(config);
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

            if (me.btnShare) {
                me.btnShare.on('click', function (e) {
                    Common.NotificationCenter.trigger('collaboration:sharing');
                });
                me.btnShare.updateHint(me.tipAccessRights);
                me.btnShare.setVisible(!_readonlyRights && appConfig && (appConfig.sharingSettingsUrl && appConfig.sharingSettingsUrl.length || appConfig.canRequestSharingSettings));
                updateDocNamePosition(appConfig);
            }

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

                var editingUsers = storeUsers.getVisibleEditingCount();
                $btnUsers.tooltip({
                    title: me.tipUsers,
                    placement: 'bottom',
                    html: true
                });
                $btnUsers.on('click', onUsersClick.bind(me));
                $panelUsers[(editingUsers > 1 && appConfig && (appConfig.isEdit || appConfig.isRestrictedEdit)) ? 'show' : 'hide']();
                updateDocNamePosition(appConfig);
            }

            if (appConfig.user.guest && appConfig.canRenameAnonymous) {
                if (me.btnUserName) {
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

            if ( me.btnPrintQuick ) {
                me.btnPrintQuick.updateHint(me.tipPrintQuick);
                me.btnPrintQuick.on('click', function (e) {
                    me.fireEvent('print-quick', me);
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

            if (me.btnSearch)
                me.btnSearch.updateHint(me.tipSearch +  Common.Utils.String.platformKey('Ctrl+F'));

            if (appConfig.isEdit && !(appConfig.customization && appConfig.customization.compactHeader))
                Common.NotificationCenter.on('window:resize', onResize);
        }

        function onFocusDocName(e){
            var me = this;
            me.imgCrypted && me.imgCrypted.toggleClass('hidden', true);
            me.isSaveDocName =false;
            if(me.withoutExt) return;
            var name = me.cutDocName($labelDocName.val());
            me.withoutExt = true;
            _.delay(function(){
                me.setDocTitle(name);
                $labelDocName.select();
            },100);
        }

        function onDocNameKeyDown(e) {
            var me = this;

            var name = $labelDocName.val();
            if ( e.keyCode == Common.UI.Keys.RETURN ) {
                name = name.trim();
                if ( !_.isEmpty(name) && me.cutDocName(me.documentCaption) !== name ) {
                    me.isSaveDocName =true;
                    if ( /[\t*\+:\"<>?|\\\\/]/gim.test(name) ) {
                        _.defer(function() {
                            Common.UI.error({
                                msg: (new Common.Views.RenameDialog).txtInvalidName + "*+:\"<>?|\/"
                                , callback: function() {
                                    _.delay(function() {
                                        $labelDocName.focus();
                                        me.isSaveDocName =true;
                                    }, 50);
                                }
                            });
                        })
                    } else
                    if(me.withoutExt) {
                        name = me.cutDocName(name);
                        me.options.wopi ? me.api.asc_wopi_renameFile(name) : Common.Gateway.requestRename(name);
                        name += me.fileExtention;
                        me.withoutExt = false;
                        me.setDocTitle(name);
                        Common.NotificationCenter.trigger('edit:complete', me);
                    }

                } else {
                    Common.NotificationCenter.trigger('edit:complete', me);
                }
            } else
            if ( e.keyCode == Common.UI.Keys.ESC ) {
                Common.NotificationCenter.trigger('edit:complete', this);
            } else {
                _.delay(function(){
                    me.setDocTitle();
                },10);
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
                    dataHint: '0',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'big'
                });

                storeUsers = this.options.storeUsers;
                storeUsers.bind({
                    add     : onUsersChanged,
                    change  : onUsersChanged,
                    reset   : onResetUsers
                });

                me.btnSearch = new Common.UI.Button({
                    cls: 'btn-header no-caret',
                    iconCls: 'toolbar__icon icon--inverse btn-menu-search',
                    enableToggle: true,
                    dataHint: '0',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'big'
                });

                me.btnFavorite = new Common.UI.Button({
                    id: 'btn-favorite',
                    cls: 'btn-header',
                    iconCls: 'toolbar__icon icon--inverse btn-favorite',
                    dataHint: '0',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'big'
                });

                Common.NotificationCenter.on({
                    'app:ready': function(mode) {Common.Utils.asyncCall(onAppReady, me, mode);},
                    'app:face': function(mode) {Common.Utils.asyncCall(onAppShowed, me, mode);},
                    'tab:visible': function() {Common.Utils.asyncCall(updateDocNamePosition, me, appConfig);},
                    'collaboration:sharingdeny': function(mode) {Common.Utils.asyncCall(onLostEditRights, me, mode);}
                });
                Common.NotificationCenter.on('uitheme:changed', this.changeLogo.bind(this));
            },

            render: function (el, role) {
                $(el).html(this.getPanel(role));

                return this;
            },

            getPanel: function (role, config) {
                var me = this;

                function createTitleButton(iconid, slot, disabled, hintDirection, hintOffset, hintTitle) {
                    return (new Common.UI.Button({
                        cls: 'btn-header',
                        iconCls: iconid,
                        disabled: disabled === true,
                        dataHint:'0',
                        dataHintDirection: hintDirection ? hintDirection : (config.isDesktopApp ? 'right' : 'left'),
                        dataHintOffset: hintOffset ? hintOffset : (config.isDesktopApp ? '10, -18' : '10, 10'),
                        dataHintTitle: hintTitle
                    })).render(slot);
                }

                if ( role == 'left' && (!config || !config.isDesktopApp)) {
                    $html = $(templateLeftBox);
                    this.logo = $html.find('#header-logo');

                    if (this.branding && this.branding.logo && (this.branding.logo.image || this.branding.logo.imageDark) && this.logo) {
                        var image = Common.UI.Themes.isDarkTheme() ? (this.branding.logo.imageDark || this.branding.logo.image) : (this.branding.logo.image || this.branding.logo.imageDark);
                        this.logo.html('<img src="' + image + '" style="max-width:100px; max-height:20px; margin: 0;"/>');
                        this.logo.css({'background-image': 'none', width: 'auto'});
                        (this.branding.logo.url || this.branding.logo.url===undefined) && this.logo.addClass('link');
                    }

                    return $html;
                } else
                if ( role == 'right' ) {
                    var $html = $(_.template(templateRightBox)({
                        tipUsers: this.labelCoUsersDescr,
                        textShare: this.textShare
                    }));

                    if ( !$labelDocName ) {
                        $labelDocName = $html.find('#rib-doc-name');
                        if ( me.documentCaption ) {
                            setTimeout(function() { me.setDocTitle(me.documentCaption); }, 50);
                        }
                    } else {
                        $html.find('#rib-doc-name').hide();
                    }

                    this.setCanRename(!!this.options.canRename);

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
                            this.btnDownload = createTitleButton('toolbar__icon icon--inverse btn-download', $html.findById('#slot-hbtn-download'), undefined, 'bottom', 'big');

                        if ( config.canPrint )
                            this.btnPrint = createTitleButton('toolbar__icon icon--inverse btn-print', $html.findById('#slot-hbtn-print'), undefined, 'bottom', 'big', 'P');

                        if ( config.canQuickPrint )
                            this.btnPrintQuick = createTitleButton('toolbar__icon icon--inverse btn-quick-print', $html.findById('#slot-hbtn-print-quick'), undefined, 'bottom', 'big', 'Q');

                        if ( config.canEdit && config.canRequestEditRights )
                            this.btnEdit = createTitleButton('toolbar__icon icon--inverse btn-edit', $html.findById('#slot-hbtn-edit'), undefined, 'bottom', 'big');
                    }
                    me.btnSearch.render($html.find('#slot-btn-search'));

                    if (!config.isEdit || config.customization && !!config.customization.compactHeader) {
                        if (config.user.guest && config.canRenameAnonymous) {
                            me.btnUserName = new Common.UI.Button({
                                el: $html.findById('.slot-btn-user-name'),
                                cls: 'btn-header',
                                dataHint:'0',
                                dataHintDirection: 'bottom',
                                dataHintOffset: 'big',
                                visible: true
                            });
                            me.btnUserName.cmpEl.removeClass('hidden');
                        } else {
                            me.elUserName = $html.find('.btn-current-user');
                            me.elUserName.removeClass('hidden');
                        }
                        $btnUserName = $html.find('.color-user-name');
                        me.setUserName(me.options.userName);
                    }

                    if (!_readonlyRights && config && (config.sharingSettingsUrl && config.sharingSettingsUrl.length || config.canRequestSharingSettings)) {
                        me.btnShare = new Common.UI.Button({
                            cls: 'btn-header btn-header-share',
                            iconCls: 'toolbar__icon icon--inverse btn-users-share',
                            caption: me.textShare,
                            dataHint: '0',
                            dataHintDirection: 'bottom',
                            dataHintOffset: 'big'
                        });
                        me.btnShare.render($html.find('#slot-btn-share'));
                    } else {
                        $html.find('#slot-btn-share').hide();
                    }

                    $userList = $html.find('.cousers-list');
                    $panelUsers = $html.find('.box-cousers');
                    $btnUsers = $panelUsers.find('> .btn-users');
                    $panelUsers.hide();
                    return $html;
                } else
                if ( role == 'title' ) {
                    var $html = $(_.template(templateTitleBox)());

                    !!$labelDocName && $labelDocName.hide().off();                  // hide document title if it was created in right box
                    $labelDocName = $html.find('#title-doc-name');
                    setTimeout(function() { me.setDocTitle(me.documentCaption); }, 50);

                    me.options.wopi && $labelDocName.attr('maxlength', me.options.wopi.FileNameMaxLength);

                    if (config.user.guest && config.canRenameAnonymous) {
                        me.btnUserName = new Common.UI.Button({
                            el: $html.findById('.slot-btn-user-name'),
                            cls: 'btn-header',
                            dataHint:'0',
                            dataHintDirection: 'bottom',
                            dataHintOffset: 'big',
                            visible: true
                        });
                        me.btnUserName.cmpEl.removeClass('hidden');
                    }
                    else {
                        me.elUserName = $html.find('.btn-current-user');
                        me.elUserName.removeClass('hidden');
                    }
                    $btnUserName = $html.find('.color-user-name');
                    me.setUserName(me.options.userName);

                    if ( config.canPrint && config.isEdit ) {
                        me.btnPrint = createTitleButton('toolbar__icon icon--inverse btn-print', $html.findById('#slot-btn-dt-print'), true, undefined, undefined, 'P');
                    }
                    if ( config.canQuickPrint && config.isEdit )
                        me.btnPrintQuick = createTitleButton('toolbar__icon icon--inverse btn-quick-print', $html.findById('#slot-btn-dt-print-quick'), true, undefined, undefined, 'Q');

                    me.btnSave = createTitleButton('toolbar__icon icon--inverse btn-save', $html.findById('#slot-btn-dt-save'), true, undefined, undefined, 'S');
                    me.btnUndo = createTitleButton('toolbar__icon icon--inverse btn-undo', $html.findById('#slot-btn-dt-undo'), true, undefined, undefined, 'Z');
                    me.btnRedo = createTitleButton('toolbar__icon icon--inverse btn-redo', $html.findById('#slot-btn-dt-redo'), true, undefined, undefined, 'Y');

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
                    if ( value.logo &&(value.logo.image || value.logo.imageDark)) {
                        var image = Common.UI.Themes.isDarkTheme() ? (value.logo.imageDark || value.logo.image) : (value.logo.image || value.logo.imageDark);
                        element = $('#header-logo');
                        if (element) {
                            element.html('<img src="' + image + '" style="max-width:100px; max-height:20px; margin: 0;"/>');
                            element.css({'background-image': 'none', width: 'auto'});
                            (value.logo.url || value.logo.url===undefined) && element.addClass('link');
                        }
                    }
                }
            },

            changeLogo: function () {
                var value = this.branding;
                if ( value && value.logo && value.logo.image && value.logo.imageDark && (value.logo.image !== value.logo.imageDark)) { // change logo when image and imageDark are different
                    var image = Common.UI.Themes.isDarkTheme() ? (value.logo.imageDark || value.logo.image) : (value.logo.image || value.logo.imageDark);
                    $('#header-logo img').attr('src', image);
                }
            },

            setDocumentCaption: function(value) {
                !value && (value = '');

                this.documentCaption = value;
                var idx = this.documentCaption.lastIndexOf('.');
                if (idx>0)
                    this.fileExtention = this.documentCaption.substring(idx);
                this.isModified && (value += '*');
                this.readOnly && (value += ' (' + this.textReadOnly + ')');
                if ( $labelDocName ) {
                    this.setDocTitle( value );
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

                this.setDocTitle(_name);
            },

            setCanBack: function (value, text) {
                this.options.canBack = value;
                this.btnGoBack[value ? 'show' : 'hide']();
                if (value)
                    this.btnGoBack.updateHint((text && typeof text == 'string') ? text : this.textBack);
                updateDocNamePosition(appConfig);
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
                updateDocNamePosition(appConfig);
                return this;
            },

            getFavorite: function () {
                return this.options.favorite;
            },

            setCanRename: function (rename) {
                var me = this;
                me.options.canRename = rename;
                if ( $labelDocName ) {
                    var label = $labelDocName;
                    if ( rename ) {
                        label.removeAttr('disabled').tooltip({
                            title: me.txtRename,
                            placement: 'cursor'}
                        );

                        label.on({
                            'keydown': onDocNameKeyDown.bind(this),
                            'focus': onFocusDocName.bind(this),
                            'blur': function (e) {
                                me.imgCrypted && me.imgCrypted.toggleClass('hidden', false);
                                Common.Utils.isGecko && (label[0].selectionStart = label[0].selectionEnd = 0);
                                if(!me.isSaveDocName) {
                                    me.withoutExt = false;
                                    me.setDocTitle(me.documentCaption);
                                }
                            },
                            'paste': function (e) {
                                setTimeout(function() {
                                    var name = me.cutDocName($labelDocName.val());
                                    me.setDocTitle(name);
                                });
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

            cutDocName: function(name) {
                if(name.length <= this.fileExtention.length) return name;
                var idx =name.length - this.fileExtention.length;

                return (name.substring(idx) == this.fileExtention) ? name.substring(0, idx) : name ;
            },

            setDocTitle: function(name){
                var width = this.getTextWidth(name || $labelDocName.val());
                (width>=0) && $labelDocName.width(width);
                name && (width>=0) && $labelDocName.val(name);
                if (this._showImgCrypted && width>=0) {
                    this.imgCrypted.toggleClass('hidden', false);
                    this._showImgCrypted = false;
                }
                (width>=0) && onResize();
            },

            getTextWidth: function(text) {
                if (!this._testCanvas ) {
                    var font = ($labelDocName.css('font-size') + ' ' + $labelDocName.css('font-family')).trim();
                    if (font) {
                        var canvas = document.createElement("canvas");
                        this._testCanvas = canvas.getContext('2d');
                        this._testCanvas.font = font;
                    }
                }
                return this._testCanvas ? this._testCanvas.measureText(text).width : -1;
            },

            setUserName: function(name) {
                this.options.userName = name;
                if ( this.btnUserName ) {
                    this.btnUserName.updateHint(name);
                } else if (this.elUserName) {
                    this.elUserName.tooltip({
                        title: Common.Utils.String.htmlEncode(name),
                        placement: 'cursor',
                        html: true
                    });
                }
                $btnUserName && $btnUserName.text(this.getInitials(name));
                return this;
            },

            getButton: function(type) {
                if (type == 'save')
                    return this.btnSave;
                else if (type == 'users')
                    return $panelUsers;
                else if (type == 'share')
                    return this.btnShare;
            },

            lockHeaderBtns: function (alias, lock) {
                var me = this;
                if ( alias == 'users' ) {
                    if ( lock ) {
                        $btnUsers.addClass('disabled').attr('disabled', 'disabled');
                    } else {
                        $btnUsers.removeClass('disabled').removeAttr('disabled');
                    }
                    if (me.btnShare) {
                        me.btnShare.setDisabled(lock);
                    }
                } else if ( alias == 'rename-user' ) {
                    if (me.btnUserName) {
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
                    default: break;
                    }
                }
            },

            getInitials: function(name) {
                var fio = name.split(' ');
                var initials = fio[0].substring(0, 1).toUpperCase();
                for (var i = fio.length-1; i>0; i--) {
                    if (fio[i][0]!=='(' && fio[i][0]!==')') {
                        initials += fio[i].substring(0, 1).toUpperCase();
                        break;
                    }
                }
                return initials;
            },

            setDocumentReadOnly: function (readonly) {
                this.readOnly = readonly;
                this.setDocumentCaption(this.documentCaption);
            },

            textBack: 'Go to Documents',
            txtRename: 'Rename',
            txtAccessRights: 'Change access rights',
            tipAccessRights: 'Manage document access rights',
            labelCoUsersDescr: 'Document is currently being edited by several users.',
            tipViewUsers: 'View users and manage document access rights',
            tipUsers: 'View users',
            tipDownload: 'Download file',
            tipPrint: 'Print file',
            tipGoEdit: 'Edit current file',
            tipSave: 'Save',
            tipUndo: 'Undo',
            tipRedo: 'Redo',
            textCompactView: 'Hide Toolbar',
            textHideStatusBar: 'Combine sheet and status bars',
            textHideLines: 'Hide Rulers',
            textZoom: 'Zoom',
            textAdvSettings: 'Advanced Settings',
            tipViewSettings: 'View Settings',
            textRemoveFavorite: 'Remove from Favorites',
            textAddFavorite: 'Mark as favorite',
            textHideNotes: 'Hide Notes',
            tipSearch: 'Search',
            textShare: 'Share',
            tipPrintQuick: 'Quick print',
            textReadOnly: 'Read only'
        }
    }(), Common.Views.Header || {}))
});
