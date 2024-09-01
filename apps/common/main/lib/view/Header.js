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
 *  Header.js
 *
 *  Created on 2/14/14
 *
 */

if (Common === undefined)
    var Common = {};

Common.Views = Common.Views || {};

define([
    'backbone',
    'text!common/main/lib/template/Header.template',
    'core'
], function (Backbone, headerTemplate) { 'use strict';

    Common.Views.Header =  Backbone.View.extend(_.extend(function(){
        var storeUsers, appConfig;
        var $userList, $panelUsers, $btnUsers, $btnUserName, $labelDocName;
        var _readonlyRights = false;
        var _tabStyle = 'fill', _logoImage = '';
        var isPDFEditor = !!window.PDFE,
            isDocEditor = !!window.DE,
            isSSEEditor = !!window.SSE;

        var templateUserItem =
                '<li id="<%= user.get("iid") %>" class="<% if (!user.get("online")) { %> offline <% } if (user.get("view")) {%> viewmode <% } %>">' +
                    '<div class="user-name">' +
                        '<div class="color"' + 
                            '<% if (user.get("avatar")) { %>' +
                                'style="background-image: url(<%=user.get("avatar")%>); <% if (user.get("color")!==null) { %> border-color:<%=user.get("color")%>; border-style: solid;<% }%>"' +
                            '<% } else { %>' +
                                'style="background-color: <% if (user.get("color")!==null) { %> <%=user.get("color")%> <% } else { %> #cfcfcf <% }%>;"' +
                            '<% } %>' +
                        '><% if (!user.get("avatar")) { %><%-user.get("initials")%><% } %></div>' +
                        '<label><%= fnEncode(user.get("username")) %></label>' +
                        '<% if (len>1) { %><label class="margin-left-3">(<%=len%>)</label><% } %>' +
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
                            '<section id="box-right-btn-group" style="display: inherit;">' +
                                '<div class="hedset">' +
                                    '<div class="btn-slot margin-right-2" id="slot-btn-header-form-submit"></div>' +
                                    '<div class="btn-slot margin-right-2" id="slot-btn-start-fill"></div>' +
                                '</div>' +
                                '<div class="hedset">' +
                                    '<div class="btn-slot" id="slot-hbtn-edit"></div>' +
                                    '<div class="btn-slot" id="slot-hbtn-print"></div>' +
                                    '<div class="btn-slot" id="slot-hbtn-print-quick"></div>' +
                                    '<div class="btn-slot" id="slot-hbtn-download"></div>' +
                                '</div>' +
                                '<div class="hedset" data-layout-name="header-editMode">' +
                                    '<div class="btn-slot" id="slot-btn-edit-mode"></div>' +
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
                                    '<div class="btn-slot">' +
                                        '<button type="button" class="btn btn-header slot-btn-user-name hidden">' +
                                            '<div class="color-user-name"></div>' +
                                        '</button>' +
                                        '<div class="btn-current-user hidden">' +
                                            '<div class="color-user-name"></div>' +
                                        '</div>' +
                                    '</div>' +
                                    '<div class="btn-slot" id="slot-btn-close"></div>' +
                                '</div>' +
                            '</section>' +
                        '</section>';

        var templateLeftBox = '<section class="logo">' +
                                '<div id="header-logo"><i></i></div>' +
                            '</section>';

            var templateTitleBox = '<section id="box-document-title">' +
                                '<div class="extra"></div>' +
                                '<div class="hedset" role="menubar" aria-label="<%= scope.ariaQuickAccessToolbar %>">' +
                                    '<div class="btn-slot" id="slot-btn-dt-home"></div>' +
                                    '<div class="btn-slot" id="slot-btn-dt-save" data-layout-name="header-save"></div>' +
                                    '<div class="btn-slot" id="slot-btn-dt-print"></div>' +
                                    '<div class="btn-slot" id="slot-btn-dt-print-quick"></div>' +
                                    '<div class="btn-slot" id="slot-btn-dt-undo"></div>' +
                                    '<div class="btn-slot" id="slot-btn-dt-redo"></div>' +
                                    '<div class="btn-slot" id="slot-btn-dt-quick-access"></div>' +
                                '</div>' +
                                '<div class="lr-separator" id="id-box-doc-name">' +
                                    // '<label id="title-doc-name" /></label>' +
                                    '<input id="title-doc-name" autofill="off" autocomplete="off"/></input>' +
                                '</div>' +
                                '<div class="hedset">' +
                                    '<div class="btn-slot">' +
                                        '<button type="button" class="btn btn-header slot-btn-user-name hidden">' +
                                            '<div class="color-user-name"></div>' +
                                        '</button>' +
                                        '<div class="btn-current-user hidden">' +
                                            '<div class="color-user-name"></div>' +
                                        '</div>' +
                                    '</div>' +
                                    '<div class="btn-slot" id="slot-btn-close"></div>' +
                                '</div>' +
                            '</section>';

        function onResetUsers(collection, opts) {
            var usercount = collection.getVisibleEditingCount();
            if ( $userList ) {
                if (appConfig && (usercount > 1 && (appConfig.isEdit || appConfig.isRestrictedEdit) || usercount >0 && appConfig.canLiveView)) {
                    $userList.html(templateUserList({
                        users: collection.chain().filter(function(item){return item.get('online') && !item.get('view') && !item.get('hidden')}).groupBy(function(item) { return item.get('idOriginal'); }).value(),
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
            var has_edit_users = appConfig && (count > 1 && (appConfig.isEdit || appConfig.isRestrictedEdit) || count > 0 && appConfig.canLiveView); // has other user(s) who edit document
            if ( has_edit_users ) {
                $panelUsers['show']();
                $btnUsers.find('.caption').html(originalCount);
            } else {
                $panelUsers['hide']();
            }
            updateDocNamePosition();
        }

        function onLostEditRights() {
            _readonlyRights = true;
            this.btnShare && this.btnShare.setVisible(false);
            updateDocNamePosition();
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
            config = config || appConfig;
            if ( $labelDocName && config) {
                var $parent = $labelDocName.parent();
                if (!config.twoLevelHeader) {
                    var _left_width = $parent.position().left,
                        _right_width = $parent.next().outerWidth();
                    $parent.css('padding-left', _left_width < _right_width ? Math.max(2, _right_width - _left_width) : 2);
                    $parent.css('padding-right', _left_width < _right_width ? 2 : Math.max(2, _left_width - _right_width));
                } else if (!config.compactHeader) {
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

                if (!(config.customization && config.customization.toolbarHideFileName) && (!config.twoLevelHeader || config.compactHeader)) {
                    var basis = parseFloat($parent.css('padding-left') || 0) + parseFloat($parent.css('padding-right') || 0) + parseInt($labelDocName.css('min-width') || 50); // 2px - box-shadow
                    config.isCrypted && (basis += 20);
                    $parent.css('flex-basis', Math.ceil(basis) + 'px');
                    $parent.closest('.extra.right').css('flex-basis', Math.ceil(basis) + $parent.next().outerWidth() + 'px');
                    Common.NotificationCenter.trigger('tab:resize');
                }
            }
        }

        function changePDFMode(config) {
            var me = this;
            config = config || appConfig;
            if (!me.btnPDFMode || !config) return;
            var type = config.isPDFEdit ? 'edit' : (config.isPDFAnnotate && config.canCoEditing ? 'comment' : 'view'),
                isEdit = config.isPDFEdit,
                isComment = !isEdit && config.isPDFAnnotate && config.canCoEditing;
            me.btnPDFMode.setIconCls('toolbar__icon icon--inverse ' + (isEdit ? 'btn-edit' : (isComment ? 'btn-menu-comments' : 'btn-sheet-view')));
            me.btnPDFMode.setCaption(isEdit ? me.textEdit : (isComment ? me.textComment : me.textView));
            me.btnPDFMode.updateHint(isEdit ? me.tipEdit : (isComment ? me.tipComment : me.tipView));
            me.btnPDFMode.options.value = type;
            if (me.btnPDFMode.menu && typeof me.btnPDFMode.menu === 'object') {
                var item = _.find(me.btnPDFMode.menu.items, function(item) { return item.value == type; });
                (item) ? item.setChecked(true) : this.btnPDFMode.menu.clearAll();
            }
        }

        function changeDocMode(type, lockEditing) {
            if (!this.btnDocMode || !appConfig) return;

            if (lockEditing!==undefined) { //lock only menu item
                this.btnDocMode.menu && this.btnDocMode.menu.items && (this.btnDocMode.menu.items[0].value==='edit') && this.btnDocMode.menu.items[0].setDisabled(lockEditing);
                return;
            }

            var show = type!==undefined;
            if (type===undefined) {
                if (appConfig.isReviewOnly)
                    type = 'review';
                else {
                    var review = Common.Utils.InternalSettings.get(this.appPrefix + "track-changes");
                    type = (review===0 || review===2) ? 'review' : 'edit';
                }
            }

            var isEdit = type==='edit',
                isReview = type==='review',
                isViewForm = type==='view-form';
            this.btnDocMode.setIconCls('toolbar__icon icon--inverse ' + (isEdit ? 'btn-edit' : (isReview ? 'btn-ic-review' : 'btn-sheet-view')));
            this.btnDocMode.setCaption(isEdit ? this.textEdit : isReview ? this.textReview : isViewForm ? this.textViewForm : this.textView);
            this.btnDocMode.updateHint(isEdit ? this.tipDocEdit : isReview ? this.tipReview : isViewForm ? this.tipDocViewForm : this.tipDocView);
            this.btnDocMode.options.value = type;
            if (show && !this.btnDocMode.isVisible()) {
                this.btnDocMode.setVisible(true);
                Common.UI.TooltipManager.showTip('docMode');
            }
            if (this.btnDocMode.menu && typeof this.btnDocMode.menu === 'object') {
                var item = _.find(this.btnDocMode.menu.items, function(item) { return item.value == type; });
                (item) ? item.setChecked(true) : this.btnDocMode.menu.clearAll();
            }
        }

        function onResize() {
            if (appConfig && appConfig.twoLevelHeader && !appConfig.compactHeader)
                updateDocNamePosition();
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

        function onChangeQuickAccess(caller, props) {
            if (props.save !== undefined) {
                this.btnSave[props.save ? 'show' : 'hide']();
                Common.localStorage.setBool(this.appPrefix + 'quick-access-save', props.save);
            }
            if (props.print !== undefined) {
                this.btnPrint[props.print ? 'show' : 'hide']();
                Common.localStorage.setBool(this.appPrefix + 'quick-access-print', props.print);
            }
            if (props.quickPrint !== undefined) {
                this.btnPrintQuick[props.quickPrint ? 'show' : 'hide']();
                Common.localStorage.setBool(this.appPrefix + 'quick-access-quick-print', props.quickPrint);
            }
            if (props.undo !== undefined) {
                this.btnUndo[props.undo ? 'show' : 'hide']();
                Common.localStorage.setBool(this.appPrefix + 'quick-access-undo', props.undo);
            }
            if (props.redo !== undefined) {
                this.btnRedo[props.redo ? 'show' : 'hide']();
                Common.localStorage.setBool(this.appPrefix + 'quick-access-redo', props.redo);
            }
            Common.NotificationCenter.trigger('edit:complete');

            if ( caller && caller == 'header' )
                Common.NotificationCenter.trigger('quickaccess:changed', props);
            updateDocNamePosition();
        }

        function onAppReady(mode) {
            appConfig = mode;

            var me = this;
            me.btnGoBack.on('click', function (e) {
                Common.NotificationCenter.trigger('goback');
            });

            if (me.btnClose) {
                me.btnClose.on('click', function (e) {
                    Common.NotificationCenter.trigger('close');
                });
                me.btnClose.updateHint(appConfig.customization.close.text || me.textClose);
            }

            me.btnFavorite.on('click', function (e) {
                // wait for setFavorite method
                // me.options.favorite = !me.options.favorite;
                // me.btnFavorite.changeIcon(me.options.favorite ? {next: 'btn-in-favorite', curr: 'btn-favorite'} : {next: 'btn-favorite', curr: 'btn-in-favorite'});
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
                updateDocNamePosition();
            }

            if (me.btnStartFill) {
                Common.Gateway.on('startfilling', function() {
                    me.btnStartFill.setVisible(false);
                    updateDocNamePosition();
                });
                me.btnStartFill.on('click', function (e) {
                    Common.Gateway.requestStartFilling();
                });
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
                $panelUsers[(appConfig && (editingUsers > 1 && (appConfig.isEdit || appConfig.isRestrictedEdit) || editingUsers > 0 && appConfig.canLiveView)) ? 'show' : 'hide']();
                updateDocNamePosition();
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
                me.btnSave.updateHint(me.tipSave + (isPDFEditor ? '' : Common.Utils.String.platformKey('Ctrl+S')));
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

            if (me.btnQuickAccess) {
                me.btnQuickAccess.updateHint(me.tipCustomizeQuickAccessToolbar);
                var arr = [];
                if (me.btnSave) {
                    arr.push({
                        caption: me.tipSave,
                        value: 'save',
                        checkable: true
                    });
                }
                if (me.btnPrint) {
                    arr.push({
                        caption: me.textPrint,
                        value: 'print',
                        checkable: true
                    });
                }
                if (me.btnPrintQuick) {
                    arr.push({
                        caption: me.tipPrintQuick,
                        value: 'quick-print',
                        checkable: true
                    });
                }
                if (me.btnUndo) {
                    arr.push({
                        caption: me.tipUndo,
                        value: 'undo',
                        checkable: true
                    });
                }
                if (me.btnRedo) {
                    arr.push({
                        caption: me.tipRedo,
                        value: 'redo',
                        checkable: true
                    });
                }
                me.btnQuickAccess.setMenu(new Common.UI.Menu({
                    cls: 'ppm-toolbar',
                    style: 'min-width: 110px;',
                    menuAlign: 'tl-bl',
                    items: arr
                }));
                me.btnQuickAccess.menu.on('show:before', function (menu) {
                    Common.UI.TooltipManager.closeTip('quickAccess');
                    menu.items.forEach(function (item) {
                        if (item.value === 'save') {
                            item.setChecked(Common.localStorage.getBool(me.appPrefix + 'quick-access-save', true), true);
                        } else if (item.value === 'print') {
                            item.setChecked(Common.localStorage.getBool(me.appPrefix + 'quick-access-print', true), true);
                        } else if (item.value === 'quick-print') {
                            item.setChecked(Common.localStorage.getBool(me.appPrefix + 'quick-access-quick-print', true), true);
                        } else if (item.value === 'undo') {
                            item.setChecked(Common.localStorage.getBool(me.appPrefix + 'quick-access-undo', true), true);
                        } else if (item.value === 'redo') {
                            item.setChecked(Common.localStorage.getBool(me.appPrefix + 'quick-access-redo', true), true);
                        }
                    });
                });
                me.btnQuickAccess.menu.on('item:click', function (menu, item) {
                    var props = {};
                    switch (item.value) {
                        case 'save':
                            props.save = item.checked;
                            break;
                        case 'print':
                            props.print = item.checked;
                            break;
                        case 'quick-print':
                            props.quickPrint = item.checked;
                            break;
                        case 'undo':
                            props.undo = item.checked;
                            break;
                        case 'redo':
                            props.redo = item.checked;
                            break;
                    }
                    onChangeQuickAccess.call(me, 'header', props);
                });
                Common.NotificationCenter.on('quickaccess:changed', onChangeQuickAccess.bind(me, 'settings'));
                isSSEEditor && Common.UI.TooltipManager.showTip('quickAccess');
            }

            if ( !appConfig.twoLevelHeader ) {
                if ( me.btnDownload ) {
                    me.btnDownload.updateHint(me.tipDownload);
                    me.btnDownload.on('click', function (e) {
                        me.fireEvent('downloadas', ['original']);
                    });
                }
            }

            if ( me.btnEdit ) {
                me.btnEdit.updateHint(me.tipGoEdit);
                me.btnEdit.on('click', function (e) {
                    me.fireEvent('go:editor', me);
                });
            }

            if (me.btnSearch)
                me.btnSearch.updateHint(me.tipSearch +  Common.Utils.String.platformKey('Ctrl+F'));

            var menuTemplate = _.template('<a id="<%= id %>" tabindex="-1" type="menuitem" class="menu-item"><div>' +
                                            '<% if (!_.isEmpty(iconCls)) { %>' +
                                                '<span class="menu-item-icon <%= iconCls %>"></span>' +
                                            '<% } %>' +
                                            '<b><%= caption %></b></div>' +
                                            '<% if (options.description !== null) { %><label class="margin-left-10 description"><%= options.description %></label>' +
                                            '<% } %></a>');
            if (me.btnPDFMode) {
                var arr = [],
                    type = me.btnPDFMode.options.value;
                appConfig.canPDFEdit && arr.push({
                    caption: me.textEdit,
                    iconCls : 'menu__icon btn-edit',
                    template: menuTemplate,
                    description: appConfig.canCoEditing ? me.textEditDesc : me.textEditDescNoCoedit,
                    value: 'edit',
                    checkable: true,
                    toggleGroup: 'docmode'
                });
                arr.push({
                    caption: appConfig.canCoEditing ? me.textComment : me.textView,
                    iconCls : 'menu__icon ' + (appConfig.canCoEditing ? 'btn-menu-comments' : 'btn-sheet-view'),
                    template: menuTemplate,
                    description: appConfig.canCoEditing ? me.textCommentDesc : me.textViewDescNoCoedit,
                    value: appConfig.canCoEditing ? 'comment' : 'view',
                    disabled: !appConfig.canPDFAnnotate,
                    checkable: true,
                    toggleGroup: 'docmode'
                });
                appConfig.canCoEditing && arr.push({
                    caption: me.textView,
                    iconCls : 'menu__icon btn-sheet-view',
                    template: menuTemplate,
                    description: me.textViewDesc,
                    value: 'view',
                    checkable: true,
                    toggleGroup: 'docmode'
                });
                me.btnPDFMode.setMenu(new Common.UI.Menu({
                    cls: 'ppm-toolbar select-checked-items',
                    style: 'width: 220px;',
                    menuAlign: 'tr-br',
                    items: arr
                }));
                me.btnPDFMode.menu.on('item:click', function (menu, item) {
                    Common.NotificationCenter.trigger('pdf:mode-apply', item.value);
                });
                var item = _.find(me.btnPDFMode.menu.items, function(item) { return item.value == type; });
                item && item.setChecked(true);
            } else if (me.btnDocMode) {
                var arr = [],
                    type = me.btnDocMode.options.value;
                !appConfig.isReviewOnly && arr.push({
                    caption: me.textEdit,
                    iconCls : 'menu__icon btn-edit',
                    template: menuTemplate,
                    description: me.textDocEditDesc,
                    value: 'edit',
                    checkable: true,
                    toggleGroup: 'docmode'
                });
                appConfig.canReview && arr.push({
                    caption: me.textReview,
                    iconCls : 'menu__icon btn-ic-review',
                    template: menuTemplate,
                    description: me.textReviewDesc,
                    value: 'review',
                    checkable: true,
                    toggleGroup: 'docmode'
                });
                appConfig.isPDFForm && appConfig.isFormCreator ? arr.push({
                    caption: me.textViewForm,
                    iconCls : 'menu__icon btn-sheet-view',
                    template: menuTemplate,
                    description: me.textDocViewFormDesc,
                    value: 'view-form',
                    checkable: true,
                    toggleGroup: 'docmode'
                }) : arr.push({
                    caption: me.textView,
                    iconCls : 'menu__icon btn-sheet-view',
                    template: menuTemplate,
                    description: me.textDocViewDesc,
                    value: 'view',
                    checkable: true,
                    toggleGroup: 'docmode'
                });
                me.btnDocMode.setMenu(new Common.UI.Menu({
                    cls: 'ppm-toolbar select-checked-items',
                    style: 'width: 220px;',
                    menuAlign: 'tr-br',
                    items: arr
                }));
                me.btnDocMode.on('click', function (menu, item) {
                    Common.UI.TooltipManager.closeTip('docMode');
                });
                me.btnDocMode.menu.on('item:click', function (menu, item) {
                    Common.NotificationCenter.trigger('doc:mode-apply', item.value, true);
                });
                var item = _.find(me.btnDocMode.menu.items, function(item) { return item.value == type; });
                item && item.setChecked(true);
                me.btnDocMode.isVisible() && Common.UI.TooltipManager.showTip('docMode');
            }
            if (appConfig.twoLevelHeader && !appConfig.compactHeader)
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

        function onDocNameChanged(editcomplete) {
            var me = this,
                name = $labelDocName.val();
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
                                }, 50);
                            }
                        });
                    })
                } else if (me.withoutExt) {
                    name = me.cutDocName(name);
                    me.fireEvent('rename', [name]);
                    name += me.fileExtention;
                    me.withoutExt = false;
                    me.setDocTitle(name);
                    editcomplete && Common.NotificationCenter.trigger('edit:complete', me);
                }
            } else {
                editcomplete && Common.NotificationCenter.trigger('edit:complete', me);
            }
        }

        function onDocNameKeyDown(e) {
            var me = this;
            if ( e.keyCode === Common.UI.Keys.RETURN ) {
                onDocNameChanged.call(me, true);
            } else if ( e.keyCode === Common.UI.Keys.ESC ) {
                me.setDocTitle(me.cutDocName(me.documentCaption));
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
                canBack: false,
                wopi: false
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

                var filter = Common.localStorage.getKeysFilter();
                this.appPrefix = (filter && filter.length) ? filter.split(',')[0] : '';

                me.btnGoBack = new Common.UI.Button({
                    id: 'btn-go-back',
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
                    id: 'id-btn-favorite',
                    cls: 'btn-header',
                    iconCls: 'toolbar__icon icon--inverse btn-favorite',
                    dataHint: '0',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'big'
                });

                Common.NotificationCenter.on({
                    'app:ready': function(mode) {Common.Utils.asyncCall(onAppReady, me, mode);},
                    'app:face': function(mode) {Common.Utils.asyncCall(onAppShowed, me, mode);},
                    'tab:visible': function() {Common.Utils.asyncCall(updateDocNamePosition, me);},
                    'collaboration:sharingdeny': function(mode) {Common.Utils.asyncCall(onLostEditRights, me, mode);}
                });
                Common.NotificationCenter.on('uitheme:changed', this.changeLogo.bind(this));
                Common.NotificationCenter.on('mentions:setusers', this.avatarsUpdate.bind(this));
                Common.NotificationCenter.on('tabstyle:changed', this.changeLogo.bind(this));
                Common.NotificationCenter.on('tabbackground:changed', this.changeLogo.bind(this));

            },

            render: function (el, role) {
                $(el).html(this.getPanel(role));

                return this;
            },

            getPanel: function (role, config) {
                var me = this;

                function createTitleButton(iconid, slot, disabled, hintDirection, hintOffset, hintTitle, lock) {
                    return (new Common.UI.Button({
                        cls: 'btn-header',
                        iconCls: iconid,
                        disabled: disabled === true,
                        lock: lock,
                        dataHint:'0',
                        dataHintDirection: hintDirection ? hintDirection : (config.isDesktopApp ? 'right' : 'left'),
                        dataHintOffset: hintOffset ? hintOffset : (config.isDesktopApp ? '10, -18' : '10, 10'),
                        dataHintTitle: hintTitle
                    })).render(slot);
                }

                if ( role == 'left' && (!config || !config.isDesktopApp)) {
                    $html = $(templateLeftBox);
                    this.logo = $html.find('#header-logo');
                    var logo = this.getSuitableLogo(this.branding, config);
                    this.logo.toggleClass('logo-light', logo.isLight);
                    if (this.branding && this.branding.logo && this.logo) {
                        if (this.branding.logo.visible===false) {
                            this.logo.addClass('hidden');
                        } else if (this.branding.logo.image || this.branding.logo.imageDark || this.branding.logo.imageLight) {
                            _logoImage = logo.image;
                            this.logo.html('<img src="' + _logoImage + '" style="max-width:100px; max-height:20px; margin: 0;"/>');
                            this.logo.css({'background-image': 'none', width: 'auto'});
                            (this.branding.logo.url || this.branding.logo.url===undefined) && this.logo.addClass('link');
                        }
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
                        me.btnFavorite.changeIcon(!!me.options.favorite ? {next: 'btn-in-favorite', curr: 'btn-favorite'} : {next: 'btn-favorite', curr: 'btn-in-favorite'});
                        me.btnFavorite.updateHint(!me.options.favorite ? me.textAddFavorite : me.textRemoveFavorite);
                    } else {
                        $html.find('#slot-btn-favorite').hide();
                    }

                    if ( !config.twoLevelHeader) {
                        if ( (config.canDownload || config.canDownloadOrigin) && !config.isOffline  )
                            this.btnDownload = createTitleButton('toolbar__icon icon--inverse btn-download', $html.findById('#slot-hbtn-download'), undefined, 'bottom', 'big');

                        if ( config.canPrint )
                            this.btnPrint = createTitleButton('toolbar__icon icon--inverse btn-print', $html.findById('#slot-hbtn-print'), undefined, 'bottom', 'big', 'P');

                        if ( config.canQuickPrint )
                            this.btnPrintQuick = createTitleButton('toolbar__icon icon--inverse btn-quick-print', $html.findById('#slot-hbtn-print-quick'), undefined, 'bottom', 'big', 'Q');
                    }
                    if ( config.canRequestEditRights && (!config.twoLevelHeader && config.canEdit && !isPDFEditor || config.isPDFForm && config.canFillForms && config.isRestrictedEdit))
                        this.btnEdit = createTitleButton('toolbar__icon icon--inverse btn-edit', $html.findById('#slot-hbtn-edit'), undefined, 'bottom', 'big');

                    me.btnSearch.render($html.find('#slot-btn-search'));

                    if (!config.twoLevelHeader || config.compactHeader) {
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

                        if ( config.canCloseEditor )
                            me.btnClose = createTitleButton('toolbar__icon icon--inverse btn-close', $html.findById('#slot-btn-close'), false, 'bottom', 'big');
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

                    if (isPDFEditor && config.isEdit && config.canSwitchMode) {
                        me.btnPDFMode = new Common.UI.Button({
                            cls: 'btn-header btn-header-pdf-mode',
                            iconCls: 'toolbar__icon icon--inverse btn-sheet-view',
                            caption: me.textView,
                            menu: true,
                            value: 'view',
                            dataHint: '0',
                            dataHintDirection: 'bottom',
                            dataHintOffset: 'big'
                        });
                        me.btnPDFMode.render($html.find('#slot-btn-edit-mode'));
                        changePDFMode.call(me, config);
                        Common.NotificationCenter.on('pdf:mode-changed', _.bind(changePDFMode, me));
                    } else if (isDocEditor && config.isEdit && config.canSwitchMode) {
                        me.btnDocMode = new Common.UI.Button({
                            cls: 'btn-header btn-header-pdf-mode ',
                            iconCls: 'toolbar__icon icon--inverse ' + (config.isReviewOnly ? 'btn-ic-review' : 'btn-edit'),
                            caption: config.isReviewOnly ? me.textReview : me.textEdit,
                            menu: true,
                            visible: config.isReviewOnly || !config.canReview,
                            lock: [Common.enumLock.previewReviewMode, Common.enumLock.lostConnect, Common.enumLock.disableOnStart, Common.enumLock.docLockView, Common.enumLock.docLockComments, Common.enumLock.docLockForms, Common.enumLock.fileMenuOpened, Common.enumLock.changeModeLock],
                            value: config.isReviewOnly ? 'review' : 'edit',
                            dataHint: '0',
                            dataHintDirection: 'bottom',
                            dataHintOffset: 'big'
                        });
                        me.btnDocMode.render($html.find('#slot-btn-edit-mode'));
                        changeDocMode.call(me);
                        Common.NotificationCenter.on('doc:mode-changed', _.bind(changeDocMode, me));

                        !config.isPDFForm && Common.UI.LayoutManager.isElementVisible('header-editMode') && Common.UI.TooltipManager.addTips({
                            'docMode' : {name: 'de-help-tip-doc-mode', placement: 'bottom-left', text: me.helpDocMode, header: me.helpDocModeHeader, target: '#slot-btn-edit-mode', maxwidth: 300}
                        });
                    } else
                        $html.find('#slot-btn-edit-mode').hide();

                    if (config.canStartFilling) {
                        me.btnStartFill = new Common.UI.Button({
                            cls: 'btn-text-default auto yellow',
                            caption: me.textStartFill,
                            dataHint: '0',
                            dataHintDirection: 'bottom',
                            dataHintOffset: 'big'
                        });
                        me.btnStartFill.render($html.find('#slot-btn-start-fill'));
                    } else {
                        $html.find('#slot-btn-start-fill').hide();
                    }

                    $userList = $html.find('.cousers-list');
                    $panelUsers = $html.find('.box-cousers');
                    $btnUsers = $panelUsers.find('> .btn-users');
                    $panelUsers.hide();
                    return $html;
                } else
                if ( role == 'title' ) {
                    var $html = $(_.template(templateTitleBox)({scope: me}));

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

                    if ( config.canCloseEditor )
                        me.btnClose = createTitleButton('toolbar__icon icon--inverse btn-close', $html.findById('#slot-btn-close'), false, 'left', '10, 10');

                    if ( config.canPrint && config.twoLevelHeader ) {
                        me.btnPrint = createTitleButton('toolbar__icon icon--inverse btn-print', $html.findById('#slot-btn-dt-print'), true, undefined, undefined, 'P');
                        !Common.localStorage.getBool(me.appPrefix + 'quick-access-print', true) && me.btnPrint.hide();
                    }
                    if ( config.canQuickPrint && config.twoLevelHeader ) {
                        me.btnPrintQuick = createTitleButton('toolbar__icon icon--inverse btn-quick-print', $html.findById('#slot-btn-dt-print-quick'), true, undefined, undefined, 'Q');
                        !Common.localStorage.getBool(me.appPrefix + 'quick-access-quick-print', true) && me.btnPrintQuick.hide();
                    }
                    if (config.showSaveButton) {
                        me.btnSave = createTitleButton('toolbar__icon icon--inverse btn-save', $html.findById('#slot-btn-dt-save'), true, undefined, undefined, 'S');
                        !Common.localStorage.getBool(me.appPrefix + 'quick-access-save', true) && me.btnSave.hide();
                    }
                    me.btnUndo = createTitleButton('toolbar__icon icon--inverse btn-undo', $html.findById('#slot-btn-dt-undo'), true, undefined, undefined, 'Z',
                                                    [Common.enumLock.undoLock, Common.enumLock.fileMenuOpened]);
                    !Common.localStorage.getBool(me.appPrefix + 'quick-access-undo', true) && me.btnUndo.hide();
                    me.btnRedo = createTitleButton('toolbar__icon icon--inverse btn-redo', $html.findById('#slot-btn-dt-redo'), true, undefined, undefined, 'Y',
                                                    [Common.enumLock.redoLock, Common.enumLock.fileMenuOpened]);
                    !Common.localStorage.getBool(me.appPrefix + 'quick-access-redo', true) && me.btnRedo.hide();
                    me.btnQuickAccess = new Common.UI.Button({
                        cls: 'btn-header no-caret',
                        iconCls: 'toolbar__icon icon--inverse btn-more',
                        menu: true,
                        dataHint:'0',
                        dataHintDirection: config.isDesktopApp ? 'right' : 'left',
                        dataHintOffset: config.isDesktopApp ? '10, -18' : '10, 10'
                    });
                    me.btnQuickAccess.render($html.find('#slot-btn-dt-quick-access'));

                    isSSEEditor && Common.UI.TooltipManager.addTips({
                        'quickAccess' : {name: 'common-help-tip-quick-access', placement: 'bottom-right', text: me.helpQuickAccess, header: me.helpQuickAccessHeader, target: '#slot-btn-dt-quick-access'}
                    });

                    return $html;
                }
            },

            setVisible: function (visible) {
                // visible
                //     ? this.show()
                //     : this.hide();
            },

            setBranding: function (value, config) {
                this.branding = value;
                var element = $('#header-logo');
                var logo = this.getSuitableLogo(value, config);
                element.toggleClass('logo-light', logo.isLight);
                if ( value && value.logo && element) {
                    if (value.logo.visible===false) {
                        element.addClass('hidden');
                    } else if (value.logo.image || value.logo.imageDark || value.logo.imageLight) {
                        _logoImage = logo.image;
                        element.html('<img src="' + _logoImage + '" style="max-width:100px; max-height:20px; margin: 0;"/>');
                        element.css({'background-image': 'none', width: 'auto'});
                        (value.logo.url || value.logo.url===undefined) && element.addClass('link');
                    }
                }
            },

            getSuitableLogo: function(branding, config, tabStyle, tabBackground) {
                branding = branding || {};
                var image = branding.logo ? branding.logo.image || branding.logo.imageDark || branding.logo.imageLight : null,
                    isDark = true;
                tabStyle = tabStyle || Common.Utils.InternalSettings.get("settings-tab-style") || 'fill';
                tabBackground = tabBackground || Common.Utils.InternalSettings.get("settings-tab-background") || 'header';
                if (!Common.Utils.isIE) {
                    var header_color = Common.UI.Themes.currentThemeColor(isDocEditor && config.isPDFForm || isPDFEditor ? '--toolbar-header-pdf' :
                                                                            isDocEditor ? '--toolbar-header-document' : isSSEEditor ? '--toolbar-header-spreadsheet' : '--toolbar-header-presentation'),
                        toolbar_color = Common.UI.Themes.currentThemeColor('--background-toolbar'),
                        logo_type = (!config.twoLevelHeader || config.compactHeader) && (tabBackground==='toolbar') ? toolbar_color : header_color;
                    isDark = (new Common.Utils.RGBColor(logo_type)).isDark();
                    image = !branding.logo ? null : isDark ? (branding.logo.imageDark || branding.logo.image || branding.logo.imageLight) :
                                                             (branding.logo.imageLight || branding.logo.image || branding.logo.imageDark) ;
                }
                return {image: image, isLight: !isDark};
            },

            changeLogo: function () {
                var value = this.branding;
                var logo = this.getSuitableLogo(value, appConfig, Common.Utils.InternalSettings.get("settings-tab-style"), Common.Utils.InternalSettings.get("settings-tab-background"));
                $('#header-logo').toggleClass('logo-light', logo.isLight);
                if ( value && value.logo && (value.logo.visible!==false) && appConfig && (value.logo.image || value.logo.imageDark || value.logo.imageLight)) {
                    var image = logo.image; // change logo when image was changed
                    if (image !== _logoImage) {
                        _logoImage = image;
                        $('#header-logo img').attr('src', image);
                    }
                }
            },

            setDocumentCaption: function(value) {
                !value && (value = '');

                this.documentCaption = value;
                var idx = this.documentCaption.lastIndexOf('.');
                this.fileExtention = idx>0 ? this.documentCaption.substring(idx) : '';
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
                updateDocNamePosition();
                return this;
            },

            getCanBack: function () {
                return this.options.canBack;
            },

            setFavorite: function (value) {
                this.options.favorite = value;
                this.btnFavorite[value!==undefined && value!==null ? 'show' : 'hide']();
                this.btnFavorite.changeIcon(!!value ? {next: 'btn-in-favorite', curr: 'btn-favorite'} : {next: 'btn-favorite', curr: 'btn-in-favorite'});
                this.btnFavorite.updateHint(!value ? this.textAddFavorite : this.textRemoveFavorite);
                updateDocNamePosition();
                return this;
            },

            getFavorite: function () {
                return this.options.favorite;
            },

            setWopi: function(value) {
                this.options.wopi = value;
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
                                !me.isSaveDocName && onDocNameChanged.call(me);
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
                if (this._testCanvas) {
                    var mt = this._testCanvas.measureText(text);
                    return (mt.actualBoundingBoxLeft!==undefined) ? Math.ceil(Math.abs(mt.actualBoundingBoxLeft) + Math.abs(mt.actualBoundingBoxRight)) + 1 : (mt.width ? Math.ceil(mt.width)+2 : 0);
                }
                return -1;
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
                $btnUserName && this.updateAvatarEl();

                return this;
            },

            setUserAvatar: function(avatar) {
                this.options.userAvatar = avatar;
                $btnUserName && this.updateAvatarEl();
            },

            setUserId: function(id) {
                this.options.currentUserId = id;
            },

            updateAvatarEl: function(){
                if(this.options.userAvatar){
                    $btnUserName.css({'background-image': 'url('+ this.options.userAvatar +')'});
                    $btnUserName.text('');
                } else {
                    $btnUserName.text(Common.Utils.getUserInitials(this.options.userName));
                }
            },

            avatarsUpdate: function(type, users) {
                if (type!=='info') return;
                this.setUserAvatar(Common.UI.ExternalUsers.getImage(this.options.currentUserId));
            },

            getButton: function(type) {
                if (type == 'save')
                    return this.btnSave;
                else if (type == 'users')
                    return $panelUsers;
                else if (type == 'share')
                    return this.btnShare;
                else if (type == 'mode')
                    return this.btnDocMode;
            },

            lockHeaderBtns: function (alias, lock, cause) {
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
                        btn && Common.Utils.lockControls(cause, lock, {array: [btn]});
                    };
                    switch ( alias ) {
                    case 'undo': _lockButton(me.btnUndo); break;
                    case 'redo': _lockButton(me.btnRedo); break;
                    case 'mode': _lockButton(me.btnDocMode); break;
                    default: break;
                    }
                }
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
            textReadOnly: 'Read only',
            textView: 'Viewing',
            textComment: 'Commenting',
            textEdit: 'Editing',
            textViewDesc: 'All changes will be saved locally',
            textCommentDesc: 'All changes will be saved to the file. Real time collaboration',
            textEditDesc: 'All changes will be saved to the file. Real time collaboration',
            textViewDescNoCoedit: 'View or annotate',
            textEditDescNoCoedit: 'Add or edit text, shapes, images etc.',
            tipView: 'Viewing',
            tipComment: 'Commenting',
            tipEdit: 'Editing',
            textDocViewDesc: 'View the file, but make no changes',
            textDocEditDesc: 'Make any changes',
            tipDocView: 'Viewing',
            tipDocEdit: 'Editing',
            textReview: 'Reviewing',
            textReviewDesc: 'Suggest changes',
            tipReview: 'Reviewing',
            textClose: 'Close file',
            textStartFill: 'Start filling',
            tipCustomizeQuickAccessToolbar: 'Customize Quick Access Toolbar',
            textPrint: 'Print',
            textViewForm: 'Viewing form',
            tipDocViewForm: 'Viewing form',
            textDocViewFormDesc: 'See how the form will look like when filling out',
            helpDocMode: 'Easily change the way you work on a document: edit, review and track changes, or view only. This works individually for each user. So, you won’t affect or disturb other co-authors. ',
            helpDocModeHeader: 'Switch between modes',
            helpQuickAccess: 'Hide or show the functional buttons of your choice.',
            helpQuickAccessHeader: 'Customize Quick Access',
            ariaQuickAccessToolbar: 'Quick access toolbar'
        }
    }(), Common.Views.Header || {}))
});
