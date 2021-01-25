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
 *
 *  Created by Julia Svinareva on 12/7/19
 *  Copyright (c) 2019 Ascensio System SIA. All rights reserved.
 *
 */

if (Common === undefined)
    var Common = {};

Common.Controllers = Common.Controllers || {};

define([
    'core',
    'jquery',
    'underscore',
    'backbone',
    'common/mobile/lib/view/Collaboration'
], function (core, $, _, Backbone) {
    'use strict';

    Common.Controllers.Collaboration = Backbone.Controller.extend(_.extend((function() {
        // Private
        var rootView,
            _userId,
            editUsers = [],
            editor = !!window.DE ? 'DE' : !!window.PE ? 'PE' : 'SSE',
            displayMode = "markup",
            canViewReview,
            arrChangeReview = [],
            dateChange = [],
            _fileKey,
            _currentUserGroups;


        return {
            models: [],
            collections: [],
            views: [
                'Common.Views.Collaboration'
            ],

            initialize: function() {
                var me = this;
                me.addListeners({
                    'Common.Views.Collaboration': {
                        'page:show' : me.onPageShow
                    }
                });
                Common.NotificationCenter.on('comments:filterchange',   _.bind(this.onFilterChange, this));
            },

            setApi: function(api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onAuthParticipantsChanged', _.bind(this.onChangeEditUsers, this));
                this.api.asc_registerCallback('asc_onParticipantsChanged',     _.bind(this.onChangeEditUsers, this));
                this.api.asc_registerCallback('asc_onConnectionStateChanged',  _.bind(this.onUserConnection, this));
                this.api.asc_registerCallback('asc_onAddComment', _.bind(this.onApiAddComment, this));
                this.api.asc_registerCallback('asc_onAddComments', _.bind(this.onApiAddComments, this));
                this.api.asc_registerCallback('asc_onChangeCommentData', _.bind(this.onApiChangeCommentData, this));
                this.api.asc_registerCallback('asc_onRemoveComment', _.bind(this.onApiRemoveComment, this));
                this.api.asc_registerCallback('asc_onRemoveComments', _.bind(this.onApiRemoveComments, this));
                this.api.asc_registerCallback('asc_onShowComment', _.bind(this.apiShowComments, this));
                this.api.asc_registerCallback('asc_onHideComment', _.bind(this.apiHideComments, this));

                if (editor === 'DE') {
                    this.api.asc_registerCallback('asc_onShowRevisionsChange', _.bind(this.changeReview, this));
                }
            },

            onLaunch: function () {
                this.createView('Common.Views.Collaboration').render();
            },

            setMode: function(mode) {
                this.appConfig = mode;
                this.view = this.getView('Common.Views.Collaboration');
                this.view.viewmode = !mode.canComments;
                this.view.canViewComments = mode.canViewComments;
                _userId = mode.user.id;
                if (editor === 'DE') {
                    _fileKey = mode.fileKey;
                }

                if (mode && mode.canUseReviewPermissions) {
                    var permissions = mode.customization.reviewPermissions,
                        arr = [],
                        groups  =  Common.Utils.UserInfoParser.getParsedGroups(mode.user.fullname);
                    groups && groups.forEach(function(group) {
                        var item = permissions[group.trim()];
                        item && (arr = arr.concat(item));
                    });
                    _currentUserGroups = arr;
                }

                return this;
            },


            showModal: function() {
                var me = this,
                    isAndroid = Framework7.prototype.device.android === true,
                    modalView,
                    appPrefix = !!window.DE ? DE : !!window.PE ? PE : SSE,
                    mainView = appPrefix.getController('Editor').getView('Editor').f7View;

                uiApp.closeModal();

                if (Common.SharedSettings.get('phone')) {
                    modalView = $$(uiApp.pickerModal(
                        '<div class="picker-modal settings container-collaboration">' +
                        '<div class="view collaboration-root-view navbar-through">' +
                        this.getView('Common.Views.Collaboration').rootLayout() +
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
                        this.getView('Common.Views.Collaboration').rootLayout() +
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

                if (!Common.SharedSettings.get('phone')) {
                    this.picker = $$(modalView);
                    var $overlay = $('.modal-overlay');

                    $$(this.picker).on('opened', function () {
                        $overlay.on('removeClass', function () {
                            if (!$overlay.hasClass('modal-overlay-visible')) {
                                $overlay.addClass('modal-overlay-visible')
                            }
                        });
                    }).on('close', function () {
                        $overlay.off('removeClass');
                        $overlay.removeClass('modal-overlay-visible')
                    });
                }

                Common.NotificationCenter.trigger('collaborationcontainer:show');
                this.onPageShow(this.getView('Common.Views.Collaboration'));

                appPrefix.getController('Toolbar').getView('Toolbar').hideSearch();
            },

            rootView : function() {
                return rootView;
            },

            onPageShow: function(view, pageId) {
                var me = this;

                if ('#reviewing-settings-view' == pageId) {
                    me.initReviewingSettingsView();
                    Common.Utils.addScrollIfNeed('.page[data-page=reviewing-settings-view]', '.page[data-page=reviewing-settings-view] .page-content');
                } else if ('#display-mode-view' == pageId) {
                    me.initDisplayMode();
                    Common.Utils.addScrollIfNeed('.page[data-page=display-mode-view]', '.page[data-page=display-mode-view] .page-content');
                } else if('#change-view' == pageId) {
                    me.initChange();
                    Common.Utils.addScrollIfNeed('.page[data-page=change-view]', '.page[data-page=change-view] .page-content');
                } else if('#edit-users-view' == pageId) {
                    me.initEditUsers();
                    Common.Utils.addScrollIfNeed('.page[data-page=edit-users-view]', '.page[data-page=edit-users-view] .page-content');
                } else if ('#comments-view' == pageId) {
                    me.initComments();
                    Common.Utils.addScrollIfNeed('.page[data-page=comments-view]', '.page[data-page=comments-view] .page-content');
                } else {
                    var length = 0;
                    _.each(editUsers, function (item) {
                        if ((item.asc_getState()!==false) && !item.asc_getView())
                            length++;
                    });
                    (length<1) && $('#item-edit-users').hide();

                    if(editor === 'DE' && !this.appConfig.canReview && !canViewReview) {
                        $('#reviewing-settings').hide();
                    }
                }
            },

            //Edit users

            onChangeEditUsers: function(users) {
                editUsers = users;
            },

            onUserConnection: function(change){
                var changed = false;
                for (var uid in editUsers) {
                    if (undefined !== uid) {
                        var user = editUsers[uid];
                        if (user && user.asc_getId() == change.asc_getId()) {
                            editUsers[uid] = change;
                            changed = true;
                        }
                    }
                }
                !changed && change && (editUsers[change.asc_getId()] = change);
            },

            getUsersInfo: function() {
                var usersArray = [];
                _.each(editUsers, function(item){
                    var name = Common.Utils.UserInfoParser.getParsedName(item.asc_getUserName());
                    var fio = name.split(' ');
                    var initials = fio[0].substring(0, 1).toUpperCase();
                    if (fio.length > 1) {
                        initials += fio[fio.length - 1].substring(0, 1).toUpperCase();
                    }
                    if((item.asc_getState()!==false) && !item.asc_getView()) {
                        var userAttr = {
                            color: item.asc_getColor(),
                            id: item.asc_getId(),
                            idOriginal: item.asc_getIdOriginal(),
                            name: name,
                            view: item.asc_getView(),
                            initial: initials
                        };
                        if(item.asc_getIdOriginal() == _userId) {
                            usersArray.unshift(userAttr);
                        } else {
                            usersArray.push(userAttr);
                        }
                    }
                });
                var userSort = _.chain(usersArray).groupBy('idOriginal').value();
                return userSort;
            },

            initEditUsers: function() {
                var users = this.getUsersInfo();
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
                    templateUserItem({users: users}) +
                    '</ul>');
                $('#user-list').html(templateUserList());
            },

            //Review

            initReviewingSettingsView: function () {
                var me = this;

                var trackChanges = typeof (this.appConfig.customization) == 'object' ? this.appConfig.customization.trackChanges : undefined;
                $('#settings-review input:checkbox').attr('checked', this.appConfig.isReviewOnly || trackChanges===true || (trackChanges!==false) && Common.localStorage.getBool("de-mobile-track-changes-" + (_fileKey || '')));
                $('#settings-review input:checkbox').single('change', _.bind(me.onTrackChanges, me));
                $('#settings-accept-all').single('click', _.bind(me.onAcceptAllClick, me));
                $('#settings-reject-all').single('click', _.bind(me.onRejectAllClick, me));
                if(this.appConfig.isReviewOnly || displayMode == "final" || displayMode == "original" ) {
                    $('#settings-accept-all').addClass('disabled');
                    $('#settings-reject-all').addClass('disabled');
                    $('#settings-review').addClass('disabled');
                } else {
                    $('#settings-accept-all').removeClass('disabled');
                    $('#settings-reject-all').removeClass('disabled');
                    $('#settings-review').removeClass('disabled');
                }
                if (!this.appConfig.canReview) {
                    $('#settings-review').hide();
                    $('#settings-accept-all').hide();
                    $('#settings-reject-all').hide();
                }
                if (this.appConfig.canUseReviewPermissions) {
                    $('#settings-accept-all').hide();
                    $('#settings-reject-all').hide();
                }
                if (this.appConfig.isRestrictedEdit) {
                    $('#display-mode-settings').hide();
                }
            },

            onTrackChanges: function(e) {
                var $checkbox = $(e.currentTarget),
                    state = $checkbox.is(':checked');
                if ( this.appConfig.isReviewOnly ) {
                    $checkbox.attr('checked', true);
                } else {
                    this.api.asc_SetTrackRevisions(state);
                    var prefix = !!window.DE ? 'de' : !!window.PE ? 'pe' : 'sse';
                    Common.localStorage.setItem(prefix + "-mobile-track-changes-" + (_fileKey || ''), state ? 1 : 0);
                }
            },

            onAcceptAllClick: function() {
                if (this.api) {
                    this.api.asc_AcceptAllChanges();
                }
            },

            onRejectAllClick: function() {
                if (this.api) {
                    this.api.asc_RejectAllChanges();
                }
            },

            initDisplayMode: function() {
                var me = this;
                $('input:radio').single('change', _.bind(me.onReviewViewClick, me));
                var value = displayMode;
                if (value == null || value === "markup") {
                    $('input[value="markup"]').attr('checked', true);
                } else if (value === 'final') {
                    $('input[value="final"]').attr('checked', true);
                } else if (value === 'original') {
                    $('input[value="original"]').attr('checked', true);
                }
            },

            getDisplayMode: function() {
                return displayMode;
            },

            setCanViewReview: function(config) {
                canViewReview = config;
            },

            onReviewViewClick: function(event) {
                var value = $(event.currentTarget).val();
                this.turnDisplayMode(value);
                !this.appConfig.canReview && Common.localStorage.setItem("de-view-review-mode", value);
            },

            turnDisplayMode: function(value, suppressEvent) {
                displayMode = value.toLocaleLowerCase();
                if (this.api) {
                    if (displayMode === 'final')
                        this.api.asc_BeginViewModeInReview(true);

                    else if (displayMode === 'original')
                        this.api.asc_BeginViewModeInReview(false);
                    else
                        this.api.asc_EndViewModeInReview();
                }
                !suppressEvent && this.initReviewingSettingsView();
                DE.getController('Toolbar').setDisplayMode(displayMode);
                DE.getController('DocumentHolder').setDisplayMode(displayMode);
            },


            initChange: function() {
                var goto = false;
                if(arrChangeReview.length == 0) {
                    $('#current-change').css('display','none');
                    $('.accept-reject').find('a').addClass('disabled');
                    $('#current-change').after(_.template('<div id="no-changes">' + this.textNoChanges + '</div>'));
                } else {
                    if ($('#no-changes').length > 0) {
                        $('#no-changes').remove();
                    }
                    var arr = {
                        date: arrChangeReview[0].date,
                        user: arrChangeReview[0].user,
                        color: arrChangeReview[0].usercolor.get_hex(),
                        text: arrChangeReview[0].changetext,
                        initials: this.getInitials(arrChangeReview[0].user)
                    };
                    this.view.renderChangeReview(arr);
                    goto = arrChangeReview[0].goto;
                }
                if (goto) {
                    $('#btn-goto-change').show();
                } else {
                    $('#btn-goto-change').hide();
                }
                $('#btn-prev-change').single('click', _.bind(this.onPrevChange, this));
                $('#btn-next-change').single('click', _.bind(this.onNextChange, this));
                $('#btn-accept-change').single('click', _.bind(this.onAcceptCurrentChange, this));
                $('#btn-reject-change').single('click', _.bind(this.onRejectCurrentChange, this));
                $('#btn-goto-change').single('click', _.bind(this.onGotoNextChange, this));

                if(this.appConfig.isReviewOnly) {
                    $('#btn-accept-change').remove();
                    $('#btn-reject-change').remove();
                    if(arrChangeReview.length != 0 && arrChangeReview[0].editable) {
                        $('.accept-reject').html('<a href="#" id="btn-delete-change" class="link">' + this.textDelete + '</a>');
                        $('#btn-delete-change').single('click', _.bind(this.onDeleteChange, this));
                    }
                } else {
                    if(arrChangeReview.length != 0 && !arrChangeReview[0].editable) {
                        $('#btn-accept-change').addClass('disabled');
                        $('#btn-reject-change').addClass('disabled');
                    }
                }
                if(displayMode == "final" || displayMode == "original") {
                    $('#btn-accept-change').addClass('disabled');
                    $('#btn-reject-change').addClass('disabled');
                    $('#btn-prev-change').addClass('disabled');
                    $('#btn-next-change').addClass('disabled');
                }
                if (!this.appConfig.canReview) {
                    $('#btn-accept-change').addClass('disabled');
                    $('#btn-reject-change').addClass('disabled');
                }
            },

            onPrevChange: function() {
                this.api.asc_GetPrevRevisionsChange();
            },

            onNextChange: function() {
                this.api.asc_GetNextRevisionsChange();
            },

            onAcceptCurrentChange: function() {
                var me = this;
                if (this.api) {
                    this.api.asc_AcceptChanges(dateChange[0]);
                    setTimeout(function () {
                        me.api.asc_GetNextRevisionsChange();
                    }, 10);
                }
            },

            onRejectCurrentChange: function() {
                var me = this;
                if (this.api) {
                    this.api.asc_RejectChanges(dateChange[0]);
                    setTimeout(function () {
                        me.api.asc_GetNextRevisionsChange();
                    }, 10);
                }
            },

            updateInfoChange: function() {
                if($("[data-page=change-view]").length > 0) {
                    if (arrChangeReview.length == 0) {
                        $('#current-change #date-change').empty();
                        $('#current-change #user-name').empty();
                        $('#current-change #text-change').empty();
                        $('#current-change').hide();
                        $('#btn-goto-change').hide();
                        $('#btn-delete-change').hide();
                        $('.accept-reject').find('a').addClass('disabled');
                        $('#current-change').after(_.template('<div id="no-changes">' + this.textNoChanges + '</div>'));
                    } else {
                        $('#current-change').show();
                        $('.accept-reject').find('a').removeClass('disabled');
                        this.initChange();
                    }
                }
            },

            changeReview: function (data) {
                if (data && data.length>0) {
                    var me = this, arr = [];
                    var c_paragraphLinerule = {
                        LINERULE_LEAST: 0,
                        LINERULE_AUTO: 1,
                        LINERULE_EXACT: 2
                    };
                    _.each(data, function (item) {
                        var changetext = '', proptext = '',
                            value = item.get_Value(),
                            movetype = item.get_MoveType(),
                            settings = false;
                        switch (item.get_Type()) {
                            case Asc.c_oAscRevisionsChangeType.TextAdd:
                                changetext = (movetype==Asc.c_oAscRevisionsMove.NoMove) ? me.textInserted : me.textParaMoveTo;
                                if (typeof value == 'object') {
                                    _.each(value, function (obj) {
                                        if (typeof obj === 'string')
                                            changetext += (' ' + Common.Utils.String.htmlEncode(obj));
                                        else {
                                            switch (obj) {
                                                case 0:
                                                    changetext += (' &lt;' + me.textImage + '&gt;');
                                                    break;
                                                case 1:
                                                    changetext += (' &lt;' + me.textShape + '&gt;');
                                                    break;
                                                case 2:
                                                    changetext += (' &lt;' + me.textChart + '&gt;');
                                                    break;
                                                case 3:
                                                    changetext += (' &lt;' + me.textEquation + '&gt;');
                                                    break;
                                            }
                                        }
                                    })
                                } else if (typeof value === 'string') {
                                    changetext += (' ' + Common.Utils.String.htmlEncode(value));
                                }
                                break;
                            case Asc.c_oAscRevisionsChangeType.TextRem:
                                changetext = (movetype==Asc.c_oAscRevisionsMove.NoMove) ? me.textDeleted : (item.is_MovedDown() ? me.textParaMoveFromDown : me.textParaMoveFromUp);
                                if (typeof value == 'object') {
                                    _.each(value, function (obj) {
                                        if (typeof obj === 'string')
                                            changetext += (' ' + Common.Utils.String.htmlEncode(obj));
                                        else {
                                            switch (obj) {
                                                case 0:
                                                    changetext += (' &lt;' + me.textImage + '&gt;');
                                                    break;
                                                case 1:
                                                    changetext += (' &lt;' + me.textShape + '&gt;');
                                                    break;
                                                case 2:
                                                    changetext += (' &lt;' + me.textChart + '&gt;');
                                                    break;
                                                case 3:
                                                    changetext += (' &lt;' + me.textEquation + '&gt;');
                                                    break;
                                            }
                                        }
                                    })
                                } else if (typeof value === 'string') {
                                    changetext += (' ' + Common.Utils.String.htmlEncode(value));
                                }
                                break;
                            case Asc.c_oAscRevisionsChangeType.ParaAdd:
                                changetext = me.textParaInserted;
                                break;
                            case Asc.c_oAscRevisionsChangeType.ParaRem:
                                changetext = me.textParaDeleted;
                                break;
                            case Asc.c_oAscRevisionsChangeType.TextPr:
                                changetext = '<b>' + me.textFormatted;
                                if (value.Get_Bold() !== undefined)
                                    proptext += ((value.Get_Bold() ? '' : me.textNot) + me.textBold + ', ');
                                if (value.Get_Italic() !== undefined)
                                    proptext += ((value.Get_Italic() ? '' : me.textNot) + me.textItalic + ', ');
                                if (value.Get_Underline() !== undefined)
                                    proptext += ((value.Get_Underline() ? '' : me.textNot) + me.textUnderline + ', ');
                                if (value.Get_Strikeout() !== undefined)
                                    proptext += ((value.Get_Strikeout() ? '' : me.textNot) + me.textStrikeout + ', ');
                                if (value.Get_DStrikeout() !== undefined)
                                    proptext += ((value.Get_DStrikeout() ? '' : me.textNot) + me.textDStrikeout + ', ');
                                if (value.Get_Caps() !== undefined)
                                    proptext += ((value.Get_Caps() ? '' : me.textNot) + me.textCaps + ', ');
                                if (value.Get_SmallCaps() !== undefined)
                                    proptext += ((value.Get_SmallCaps() ? '' : me.textNot) + me.textSmallCaps + ', ');
                                if (value.Get_VertAlign() !== undefined)
                                    proptext += (((value.Get_VertAlign() == 1) ? me.textSuperScript : ((value.Get_VertAlign() == 2) ? me.textSubScript : me.textBaseline)) + ', ');
                                if (value.Get_Color() !== undefined)
                                    proptext += (me.textColor + ', ');
                                if (value.Get_Highlight() !== undefined)
                                    proptext += (me.textHighlight + ', ');
                                if (value.Get_Shd() !== undefined)
                                    proptext += (me.textShd + ', ');
                                if (value.Get_FontFamily() !== undefined)
                                    proptext += (value.Get_FontFamily() + ', ');
                                if (value.Get_FontSize() !== undefined)
                                    proptext += (value.Get_FontSize() + ', ');
                                if (value.Get_Spacing() !== undefined)
                                    proptext += (me.textSpacing + ' ' + Common.Utils.Metric.fnRecalcFromMM(value.Get_Spacing()).toFixed(2) + ' ' + Common.Utils.Metric.getCurrentMetricName() + ', ');
                                if (value.Get_Position() !== undefined)
                                    proptext += (me.textPosition + ' ' + Common.Utils.Metric.fnRecalcFromMM(value.Get_Position()).toFixed(2) + ' ' + Common.Utils.Metric.getCurrentMetricName() + ', ');
                                if (value.Get_Lang() !== undefined)
                                    proptext += (Common.util.LanguageInfo.getLocalLanguageName(value.Get_Lang())[1] + ', ');

                                if (!_.isEmpty(proptext)) {
                                    changetext += ': ';
                                    proptext = proptext.substring(0, proptext.length - 2);
                                }
                                changetext += '</b>';
                                changetext += proptext;
                                break;
                            case Asc.c_oAscRevisionsChangeType.ParaPr:
                                changetext = '<b>' + me.textParaFormatted;
                                if (value.Get_ContextualSpacing())
                                    proptext += ((value.Get_ContextualSpacing() ? me.textContextual : me.textNoContextual) + ', ');
                                if (value.Get_IndLeft() !== undefined)
                                    proptext += (me.textIndentLeft + ' ' + Common.Utils.Metric.fnRecalcFromMM(value.Get_IndLeft()).toFixed(2) + ' ' + Common.Utils.Metric.getCurrentMetricName() + ', ');
                                if (value.Get_IndRight() !== undefined)
                                    proptext += (me.textIndentRight + ' ' + Common.Utils.Metric.fnRecalcFromMM(value.Get_IndRight()).toFixed(2) + ' ' + Common.Utils.Metric.getCurrentMetricName() + ', ');
                                if (value.Get_IndFirstLine() !== undefined)
                                    proptext += (me.textFirstLine + ' ' + Common.Utils.Metric.fnRecalcFromMM(value.Get_IndFirstLine()).toFixed(2) + ' ' + Common.Utils.Metric.getCurrentMetricName() + ', ');
                                if (value.Get_Jc() !== undefined) {
                                    switch (value.Get_Jc()) {
                                        case 0:
                                            proptext += (me.textRight + ', ');
                                            break;
                                        case 1:
                                            proptext += (me.textLeft + ', ');
                                            break;
                                        case 2:
                                            proptext += (me.textCenter + ', ');
                                            break;
                                        case 3:
                                            proptext += (me.textJustify + ', ');
                                            break;

                                    }
                                }
                                if (value.Get_KeepLines() !== undefined)
                                    proptext += ((value.Get_KeepLines() ? me.textKeepLines : me.textNoKeepLines) + ', ');
                                if (value.Get_KeepNext())
                                    proptext += ((value.Get_KeepNext() ? me.textKeepNext : me.textNoKeepNext) + ', ');
                                if (value.Get_PageBreakBefore())
                                    proptext += ((value.Get_PageBreakBefore() ? me.textBreakBefore : me.textNoBreakBefore) + ', ');
                                if (value.Get_SpacingLineRule() !== undefined && value.Get_SpacingLine() !== undefined) {
                                    proptext += me.textLineSpacing;
                                    proptext += (((value.Get_SpacingLineRule() == c_paragraphLinerule.LINERULE_LEAST) ? me.textAtLeast : ((value.Get_SpacingLineRule() == c_paragraphLinerule.LINERULE_AUTO) ? me.textMultiple : me.textExact)) + ' ');
                                    proptext += (((value.Get_SpacingLineRule() == c_paragraphLinerule.LINERULE_AUTO) ? value.Get_SpacingLine() : Common.Utils.Metric.fnRecalcFromMM(value.Get_SpacingLine()).toFixed(2) + ' ' + Common.Utils.Metric.getCurrentMetricName()) + ', ');
                                }
                                if (value.Get_SpacingBeforeAutoSpacing())
                                    proptext += (me.textSpacingBefore + ' ' + me.textAuto + ', ');
                                else if (value.Get_SpacingBefore() !== undefined)
                                    proptext += (me.textSpacingBefore + ' ' + Common.Utils.Metric.fnRecalcFromMM(value.Get_SpacingBefore()).toFixed(2) + ' ' + Common.Utils.Metric.getCurrentMetricName() + ', ');
                                if (value.Get_SpacingAfterAutoSpacing())
                                    proptext += (me.textSpacingAfter + ' ' + me.textAuto + ', ');
                                else if (value.Get_SpacingAfter() !== undefined)
                                    proptext += (me.textSpacingAfter + ' ' + Common.Utils.Metric.fnRecalcFromMM(value.Get_SpacingAfter()).toFixed(2) + ' ' + Common.Utils.Metric.getCurrentMetricName() + ', ');
                                if (value.Get_WidowControl())
                                    proptext += ((value.Get_WidowControl() ? me.textWidow : me.textNoWidow) + ', ');
                                if (value.Get_Tabs() !== undefined)
                                    proptext += (me.textTabs + ', ');
                                if (value.Get_NumPr() !== undefined)
                                    proptext += (me.textNum + ', ');
                                if (value.Get_PStyle() !== undefined) {
                                    var style = me.api.asc_GetStyleNameById(value.Get_PStyle());
                                    if (!_.isEmpty(style)) proptext += (style + ', ');
                                }

                                if (!_.isEmpty(proptext)) {
                                    changetext += ': ';
                                    proptext = proptext.substring(0, proptext.length - 2);
                                }
                                changetext += '</b>';
                                changetext += proptext;
                                break;
                            case Asc.c_oAscRevisionsChangeType.TablePr:
                                changetext = me.textTableChanged;
                                break;
                            case Asc.c_oAscRevisionsChangeType.RowsAdd:
                                changetext = me.textTableRowsAdd;
                                break;
                            case Asc.c_oAscRevisionsChangeType.RowsRem:
                                changetext = me.textTableRowsDel;
                                break;

                        }
                        var date = (item.get_DateTime() == '') ? new Date() : new Date(item.get_DateTime()),
                            user = item.get_UserName(),
                            userColor = item.get_UserColor(),
                            goto = (item.get_MoveType() == Asc.c_oAscRevisionsMove.MoveTo || item.get_MoveType() == Asc.c_oAscRevisionsMove.MoveFrom);
                        date = me.dateToLocaleTimeString(date);
                        var editable = me.appConfig.isReviewOnly && (item.get_UserId() == _userId) || !me.appConfig.isReviewOnly && (!me.appConfig.canUseReviewPermissions || me.checkUserGroups(item.get_UserName()));
                        arr.push({date: date, user: user, usercolor: userColor, changetext: changetext, goto: goto, editable: editable});
                    });
                    arrChangeReview = arr;
                    dateChange = data;
                } else {
                    arrChangeReview = [];
                    dateChange = [];
                }
                this.updateInfoChange();
            },

            checkUserGroups: function(username) {
                var groups = Common.Utils.UserInfoParser.getParsedGroups(username);
                return _currentUserGroups && groups && (_.intersection(_currentUserGroups, (groups.length>0) ? groups : [""]).length>0);
            },

            dateToLocaleTimeString: function (date) {
                function format(date) {
                    var strTime,
                        hours = date.getHours(),
                        minutes = date.getMinutes(),
                        ampm = hours >= 12 ? 'pm' : 'am';

                    hours = hours % 12;
                    hours = hours ? hours : 12; // the hour '0' should be '12'
                    minutes = minutes < 10 ? '0'+minutes : minutes;
                    strTime = hours + ':' + minutes + ' ' + ampm;

                    return strTime;
                }

                // MM/dd/yyyy hh:mm AM
                return (date.getMonth() + 1) + '/' + (date.getDate()) + '/' + date.getFullYear() + ' ' + format(date);
            },

            onDeleteChange: function() {
                if (this.api) {
                    this.api.asc_RejectChanges(dateChange[0]);
                }
            },

            onGotoNextChange: function() {
                if (this.api) {
                    this.api.asc_FollowRevisionMove(dateChange[0]);
                }
            },

            //Comments
            getCurrentUser: function () {
                var me = this;
                _.each(editUsers, function(item){
                    if (item.asc_getIdOriginal() === _userId) {
                        me.currentUser = item;
                    }
                });
                return me.currentUser;
            },

            getCommentInfo: function () {
                this.getCurrentUser();
                if (this.currentUser) {
                    var date = new Date();
                    var comment = {
                        time: date.getTime(),
                        date: this.dateToLocaleTimeString(date),
                        userid: _userId,
                        username: this.currentUser.asc_getUserName(),
                        usercolor: this.currentUser.asc_getColor(),
                        userInitials: this.getInitials(this.currentUser.asc_getUserName())
                    };
                    return comment;
                }
            },

            getInitials: function(name) {
                var fio = Common.Utils.UserInfoParser.getParsedName(name).split(' ');
                var initials = fio[0].substring(0, 1).toUpperCase();
                if (fio.length > 1) {
                    initials += fio[fio.length - 1].substring(0, 1).toUpperCase();
                }
                return initials;
            },

            findComment: function(uid) {
                var comment;
                if (this.groupCollectionFilter.length !== 0) {
                    comment = this.findCommentInGroup(uid);
                } else if (this.collectionComments.length !== 0) {
                    comment = _.findWhere(this.collectionComments, {uid: uid});
                }
                return comment;
            },

            apiShowComments: function(uid) {
                var comments,
                    me = this;
                me.showComments = [];
                if (this.groupCollectionFilter.length !== 0) {
                    comments = this.groupCollectionFilter;
                    _.each(uid, function (id) {
                        var comment = me.findCommentInGroup(uid);
                        if (comment) {
                            me.showComments.push(comment);
                        }
                    });
                } else if (this.collectionComments.length !== 0) {
                    comments = this.collectionComments;
                    _.each(uid, function (id) {
                        var comment = _.findWhere(comments, {uid: id});
                        if (comment) {
                            me.showComments.push(comment);
                        }
                    });
                }
                if ($('.container-view-comment').length > 0) {
                    me.indexCurrentComment = 0;
                    me.updateViewComment();
                }
            },

            apiHideComments: function() {
                if ($('.container-view-comment').length > 0) {
                    uiApp.closeModal();
                    $('.container-view-comment').remove();
                }
            },

            disabledViewComments: function(disabled) {
                if ($('.container-view-comment').length > 0) {
                    if (disabled) {
                        $('.comment-resolve, .comment-menu, .add-reply, .reply-menu').addClass('disabled');
                        if (!$('.prev-comment').hasClass('disabled')) {
                            $('.prev-comment').addClass('disabled');
                        }
                        if (!$('.next-comment').hasClass('disabled')) {
                            $('.next-comment').addClass('disabled');
                        }
                    } else {
                        $('.comment-resolve, .comment-menu, .add-reply, .reply-menu').removeClass('disabled');
                        if (this.showComments && this.showComments.length > 1) {
                            $('.prev-comment, .next-comment').removeClass('disabled');
                        }
                    }
                }
            },

            updateViewComment: function() {
                this.view.renderViewComments(this.showComments, this.indexCurrentComment);
                $('.comment-menu').single('click', _.buffered(this.initMenuComments, 100, this));
                $('.reply-menu').single('click', _.buffered(this.initReplyMenu, 100, this));
                $('.comment-resolve').single('click', _.bind(this.onClickResolveComment, this, false));
                if (this.showComments && this.showComments.length === 1) {
                    $('.prev-comment, .next-comment').addClass('disabled');
                }
            },

            showCommentModal: function() {
                var me = this,
                    appPrefix = !!window.DE ? DE : !!window.PE ? PE : SSE,
                    mainView = appPrefix.getController('Editor').getView('Editor').f7View;

                me.indexCurrentComment = 0;

                uiApp.closeModal();

                if (Common.SharedSettings.get('phone')) {
                    me.modalViewComment = $$(uiApp.pickerModal(
                        '<div class="picker-modal container-view-comment">' +
                        '<div class="swipe-container">' +
                        '<div class="icon-swipe"></div>' +
                        '</div>' +
                        me.view.getTemplateContainerViewComments() +
                        '</div>'
                    )).on('close', function (e) {
                        mainView.showNavbar();
                    });
                    mainView.hideNavbar();
                } else {
                    if (!me.openModal) {
                        me.modalViewComment = uiApp.popover(
                            '<div class="popover container-view-comment">' +
                            '<div class="popover-inner">' +
                            me.view.getTemplateContainerViewComments() +
                            '</div>' +
                            '</div>',
                            $$('#toolbar-collaboration')
                        );
                        this.picker = $$(me.modalViewComment);
                        var $overlay = $('.modal-overlay');
                        me.openModal = true;
                        $$(this.picker).on('opened', function () {
                            $overlay.on('removeClass', function () {
                                if (!$overlay.hasClass('modal-overlay-visible')) {
                                    $overlay.addClass('modal-overlay-visible')
                                }
                            });
                        }).on('close', function () {
                            $overlay.off('removeClass');
                            $overlay.removeClass('modal-overlay-visible');
                            $('.popover').remove();
                            me.openModal = false;
                        });
                    }
                }
                me.getView('Common.Views.Collaboration').renderViewComments(me.showComments, me.indexCurrentComment);
                $('.prev-comment').single('click', _.bind(me.onViewPrevComment, me));
                $('.next-comment').single('click', _.bind(me.onViewNextComment, me));
                $('.comment-menu').single('click', _.buffered(me.initMenuComments, 100, me));
                $('.add-reply').single('click', _.bind(me.onClickAddReply, me, false));
                $('.reply-menu').single('click', _.buffered(me.initReplyMenu, 100, me));
                $('.comment-resolve').single('click', _.bind(me.onClickResolveComment, me, false));

                if (me.showComments && me.showComments.length === 1) {
                    $('.prev-comment, .next-comment').addClass('disabled');
                }

                appPrefix.getController('Toolbar').getView('Toolbar').hideSearch();

                //swipe modal window
                if ($('.swipe-container').length > 0) {
                    me.swipeFull = false;
                    var $swipeContainer = $('.swipe-container');
                    $swipeContainer.single('touchstart', _.bind(function (e) {
                        var touchobj = e.changedTouches[0];
                        me.swipeStart = parseInt(touchobj.clientY);
                        me.swipeChange = parseInt(touchobj.clientY);
                        me.swipeHeight = parseInt($('.container-view-comment').css('height'));
                        e.preventDefault();
                     }, me));
                    $swipeContainer.single('touchmove', _.bind(function (e) {
                        var touchobj = e.changedTouches[0];
                        var dist = parseInt(touchobj.clientY) - me.swipeStart;
                        var newHeight;
                        if (dist < 0) {
                            newHeight = '100%';
                            me.swipeFull = true;
                            me.closeCommentPicker = false;
                            if (window.SSE) {
                                if ($('.container-view-comment').hasClass('onHide')) {
                                    $('.container-view-comment').removeClass('onHide');
                                }
                            } else {
                                $('.container-view-comment').css('opacity', '1');
                            }
                        } else if (dist < 100) {
                            newHeight = '50%';
                            me.swipeFull = false;
                            me.closeCommentPicker = false;
                            if (window.SSE) {
                                if ($('.container-view-comment').hasClass('onHide')) {
                                    $('.container-view-comment').removeClass('onHide');
                                }
                            } else {
                                $('.container-view-comment').css('opacity', '1');
                            }
                        } else {
                            me.closeCommentPicker = true;
                            if (window.SSE) {
                                if (!$('.container-view-comment').hasClass('onHide')) {
                                    $('.container-view-comment').addClass('onHide');
                                }
                            } else {
                                $('.container-view-comment').css('opacity', '0.6');
                            }
                        }
                        $('.container-view-comment').css('height', newHeight);
                        me.swipeHeight = newHeight;
                        e.preventDefault();
                     }, me));
                    $swipeContainer.single('touchend', _.bind(function (e) {
                        var touchobj = e.changedTouches[0];
                        var swipeEnd = parseInt(touchobj.clientY);
                        var dist = swipeEnd - me.swipeStart;
                        if (me.closeCommentPicker) {
                            uiApp.closeModal();
                            me.modalViewComment.remove();
                        } else if (me.swipeFull) {
                            if (dist > 20) {
                                $('.container-view-comment').css('height', '50%');
                            }
                        }
                        me.swipeHeight = undefined;
                        me.swipeChange = undefined;
                        me.closeCommentPicker = undefined;
                    }, me));
                }
            },

            onViewPrevComment: function() {
                if (this.showComments && this.showComments.length > 0) {
                    if (this.indexCurrentComment - 1 < 0) {
                        this.indexCurrentComment = this.showComments.length - 1;
                    } else {
                        this.indexCurrentComment -= 1;
                    }
                    this.view.renderViewComments(this.showComments, this.indexCurrentComment);
                    var me = this;
                    _.defer(function () {
                        $('.comment-menu').single('click', _.buffered(me.initMenuComments, 100, me));
                        $('.reply-menu').single('click', _.buffered(me.initReplyMenu, 100, me));
                        $('.comment-resolve').single('click', _.bind(me.onClickResolveComment, me, false));
                    });
                }
            },

            onViewNextComment: function() {
                if (this.showComments && this.showComments.length > 0) {
                    if (this.indexCurrentComment + 1 === this.showComments.length) {
                        this.indexCurrentComment = 0;
                    } else {
                        this.indexCurrentComment += 1;
                    }
                    this.view.renderViewComments(this.showComments, this.indexCurrentComment);
                    var me = this;
                    _.defer(function () {
                        $('.comment-menu').single('click', _.buffered(me.initMenuComments, 100, me));
                        $('.reply-menu').single('click', _.buffered(me.initReplyMenu, 100, me));
                        $('.comment-resolve').single('click', _.bind(me.onClickResolveComment, me, false));
                    });
                }
            },

            onClickAddReply: function(id) {
                var me = this;
                var phone = Common.SharedSettings.get('phone');
                var idComment = !id ? $('.page-view-comments').find('.comment').data('uid') : id;
                if (_.isNumber(idComment)) {
                    idComment = idComment.toString();
                }
                var comment = me.findComment(idComment);
                me.getCurrentUser();
                var date = me.dateToLocaleTimeString(new Date());
                if (comment) {
                    if ($('.container-view-comment').length > 0) {
                        if (phone) {
                            var colorUser = me.currentUser.asc_getColor(),
                                name = me.currentUser.asc_getUserName(),
                                initialUser = me.getInitials(name);
                            var templatePopup = me.getView('Common.Views.Collaboration').getTemplateAddReplyPopup(name, colorUser, initialUser, date);
                            me.addReplyView = uiApp.popup(
                                templatePopup
                            );
                            $('.popup').css('z-index', '20000');
                        } else {
                            me.disabledViewComments(true);
                            $('.container-view-comment .toolbar').find('a.prev-comment, a.next-comment, a.add-reply').css('display', 'none');
                            var template = _.template('<a href="#" class="link" id="add-new-reply">' + me.textDone + '</a>');
                            $('.container-view-comment .button-right').append(template);
                            template = _.template('<a href="#" class="link cancel-reply">' + me.textCancel + '</a>');
                            $('.container-view-comment .button-left').append(template);
                            template = _.template('<div class="block-reply"><textarea class="reply-textarea" autofocus placeholder="' + me.textAddReply + '"></textarea></div>');
                            $('.page-view-comments .page-content').append(template);
                        }
                    } else if ($('.container-collaboration').length > 0) {
                        me.getView('Common.Views.Collaboration').showPage('#comments-add-reply-view', false);
                        var name = me.currentUser.asc_getUserName(),
                            color = me.currentUser.asc_getColor();
                        me.getView('Common.Views.Collaboration').renderAddReply(name, color, me.getInitials(name), date);
                    }
                    _.defer(function () {
                        var $textarea = $('.reply-textarea')[0];
                        var $btnAddReply = $('#add-new-reply');
                        $textarea.focus();
                        $btnAddReply.addClass('disabled');
                        $textarea.oninput = function () {
                            if ($textarea.value.length < 1) {
                                if (!$btnAddReply.hasClass('disabled'))
                                    $btnAddReply.addClass('disabled');
                            } else {
                                if ($btnAddReply.hasClass('disabled')) {
                                    $btnAddReply.removeClass('disabled');
                                }
                            }
                        };
                    });
                    $('#add-new-reply').single('click', _.bind(me.onDoneAddNewReply, me, comment.uid));
                    $('.cancel-reply').single('click', _.bind(me.onCancelAddNewReply, me));
                }
            },

            onDoneAddNewReply: function(uid) {
                var phone = Common.SharedSettings.get('phone');
                var reply = $('.reply-textarea')[0].value.trim();
                if ($('.container-view-comment').length > 0) {
                    var $viewComment = $('.container-view-comment');
                    if (reply && reply.length > 0) {
                        this.addReply && this.addReply(uid, reply, _userId);
                        if (!phone) {
                            $viewComment.find('a#add-new-reply, a.cancel-reply').remove();
                            $viewComment.find('a.prev-comment, a.next-comment, a.add-reply').css('display', 'flex');
                            if ($('.block-reply').length > 0) {
                                $('.block-reply').remove();
                            }
                        } else {
                            uiApp.closeModal($$(this.addReplyView));
                        }
                        this.disabledViewComments(false);
                    }
                } else if ($('.container-collaboration').length > 0) {
                    this.addReply && this.addReply(uid, reply, _userId);
                    rootView.router.back();
                }
            },

            onCancelAddNewReply: function() {
                var $viewComment = $('.container-view-comment');
                if ($viewComment.find('.block-reply').length > 0) {
                    $viewComment.find('.block-reply').remove();
                }
                $viewComment.find('a#add-new-reply, a.cancel-reply').remove();
                $viewComment.find('a.prev-comment, a.next-comment, a.add-reply').css('display', 'flex');
                this.disabledViewComments(false);
            },

            onAddNewComment: function() {
            },

            initMenuComments: function(e) {
                if ($('.actions-modal').length < 1) {
                    var $comment = $(e.currentTarget).closest('.comment');
                    var idComment = $comment.data('uid');
                    if (_.isNumber(idComment)) {
                        idComment = idComment.toString();
                    }
                    var comment = this.findComment(idComment);
                    if ($('.actions-modal').length === 0 && comment) {
                        var me = this;
                        _.delay(function () {
                            var _menuItems = [];
                            _menuItems.push({
                                caption: me.textEdit,
                                event: 'edit'
                            });
                            if (!comment.resolved) {
                                _menuItems.push({
                                    caption: me.textResolve,
                                    event: 'resolve'
                                });
                            } else {
                                _menuItems.push({
                                    caption: me.textReopen,
                                    event: 'resolve'
                                });
                            }
                            if ($('.container-collaboration').length > 0) {
                                _menuItems.push({
                                    caption: me.textAddReply,
                                    event: 'addreply'
                                });
                            }
                            _menuItems.push({
                                caption: me.textDeleteComment,
                                event: 'delete',
                                color: 'red'
                            });
                            _.each(_menuItems, function (item) {
                                item.text = item.caption;
                                item.onClick = function () {
                                    me.onCommentMenuClick(item.event, idComment)
                                }
                            });

                            me.menuComments = uiApp.actions([_menuItems, [
                                {
                                    text: me.textCancel,
                                    bold: true,
                                    onClick: function () {
                                        me.onCommentMenuClick();
                                    }
                                }
                            ]]);
                            $$(me.menuComments).on('close', function () {
                                me.disabledViewComments(false);
                            });
                        }, 100);
                    }
                    this.disabledViewComments(true);
                }
            },

            initReplyMenu: function(event) {
                if ($('.actions-modal').length < 1) {
                    var me = this;
                    var ind = $(event.currentTarget).parent().parent().data('ind');
                    var idComment = $(event.currentTarget).closest('.comment').data('uid');
                    if (_.isNumber(idComment)) {
                        idComment = idComment.toString();
                    }
                    _.delay(function () {
                        var _menuItems = [];
                        _menuItems.push({
                            caption: me.textEdit,
                            event: 'editreply'
                        });
                        _menuItems.push({
                            caption: me.textDeleteReply,
                            event: 'deletereply',
                            color: 'red'
                        });
                        _.each(_menuItems, function (item) {
                            item.text = item.caption;
                            item.onClick = function () {
                                me.onCommentMenuClick(item.event, idComment, ind);
                            }
                        });
                        me.menuReply = uiApp.actions([_menuItems, [
                            {
                                text: me.textCancel,
                                bold: true,
                                onClick: function () {
                                    me.onCommentMenuClick();
                                }
                            }
                        ]]);
                        $$(me.menuReply).on('close', function () {
                            me.disabledViewComments(false);
                        });
                    }, 100);
                    this.disabledViewComments(true);
                }
            },

            onCommentMenuClick: function(action, idComment, indReply) {
                var me = this;
                function addOverlay () {
                    if (!Common.SharedSettings.get('phone')) {
                        var $overlay = $('.modal-overlay');
                        if (!$overlay.hasClass('modal-overlay-visible')) {
                            $overlay.addClass('modal-overlay-visible')
                        }
                    }
                }
                switch (action) {
                    case 'edit':
                        addOverlay();
                        me.showEditComment(idComment);
                        break;
                    case 'resolve':
                        addOverlay();
                        me.onClickResolveComment(idComment);
                        me.disabledViewComments(false);
                        break;
                    case 'delete':
                        addOverlay();
                        $$(uiApp.modal({
                            title: this.textDeleteComment,
                            text: this.textMessageDeleteComment,
                            buttons: [
                                {
                                    text: this.textCancel
                                },
                                {
                                    text: this.textYes,
                                    onClick: function () {
                                        me.onDeleteComment && me.onDeleteComment(idComment);
                                    }
                                }]
                        })).on('close', function () {
                            addOverlay();
                        });
                        me.disabledViewComments(false);
                        break;
                    case 'editreply':
                        addOverlay();
                        me.showEditReply(idComment, indReply);
                        break;
                    case 'deletereply':
                        addOverlay();
                        $$(uiApp.modal({
                            title: this.textDeleteReply,
                            text: this.textMessageDeleteReply,
                            buttons: [
                                {
                                    text: this.textCancel
                                },
                                {
                                    text: this.textYes,
                                    onClick: function () {
                                        me.onDeleteReply && me.onDeleteReply(idComment, indReply);
                                    }
                                }]
                        })).on('close', function () {
                            addOverlay();
                        });
                        me.disabledViewComments(false);
                        break;
                    case 'addreply':
                        addOverlay();
                        me.onClickAddReply(idComment);
                    default:
                        addOverlay();
                        me.disabledViewComments(false);
                        break;
                }
            },

            showEditComment: function(idComment) {
                var me = this;
                if (idComment) {
                    var comment = this.findComment(idComment);
                    if ($('.container-view-comment').length > 0) {
                        if (Common.SharedSettings.get('phone')) {
                            me.editView = uiApp.popup(
                                me.view.getTemplateEditCommentPopup(comment)
                            );
                            $$(me.editView).on('close', function(){
                                me.disabledViewComments(false);
                            });
                            $('.popup').css('z-index', '20000');
                            _.delay(function () {
                                var $textarea = $('.comment-textarea')[0];
                                $textarea.focus();
                                $textarea.selectionStart = $textarea.value.length;
                            }, 100);
                        } else {
                            me.disabledViewComments(true);
                            if ($('.comment-textarea').length === 0) {
                                var $viewComment = $('.container-view-comment');
                                var oldComment = $viewComment.find('.comment-text pre').text();
                                $viewComment.find('.comment-text pre').css('display', 'none');
                                var template = _.template('<textarea id="comment-text" class="comment-textarea">' + oldComment + '</textarea>');
                                $viewComment.find('.comment-text').append(template);
                                $viewComment.find('a.prev-comment, a.next-comment, a.add-reply').css('display', 'none');
                                template = _.template('<a href="#" class="link done-edit-comment" id="edit-comment">' + me.textDone + '</a>');
                                $viewComment.find('.button-right').append(template);
                                template = _.template('<a href="#" class="link cancel-edit-comment">' + me.textCancel + '</a>');
                                $viewComment.find('.button-left').append(template);
                            }
                        }
                    } else if ($('.container-collaboration').length > 0) {
                        this.getView('Common.Views.Collaboration').showPage('#comments-edit-view', false);
                        this.getView('Common.Views.Collaboration').renderEditComment(comment);
                    }
                    _.defer(function () {
                        var $textarea = $('.comment-textarea')[0];
                        $textarea.focus();
                        $textarea.selectionStart = $textarea.value.length;
                    });
                    $('#edit-comment').single('click', _.bind(me.onEditComment, me, comment));
                    $('.cancel-edit-comment').single('click', _.bind(me.onCancelEditComment, me));
                }
            },

            onEditComment: function(comment) {
                var value = $('#comment-text')[0].value.trim();
                if (value && value.length > 0) {
                    this.getCurrentUser();
                    if (!_.isUndefined(this.onChangeComment)) {
                        comment.comment = value;
                        comment.userid = this.currentUser.asc_getIdOriginal();
                        comment.username = this.currentUser.asc_getUserName();
                        this.onChangeComment(comment);
                    }
                    if ($('.container-view-comment').length > 0) {
                        if (Common.SharedSettings.get('phone')) {
                            uiApp.closeModal($$(this.editView));
                        } else {
                            var $viewComment = $('.container-view-comment');
                            $viewComment.find('a.done-edit-comment, a.cancel-edit-comment').remove();
                            $viewComment.find('a.prev-comment, a.next-comment, a.add-reply').css('display', 'flex');
                            if ($viewComment.find('.comment-textarea').length > 0) {
                                $viewComment.find('.comment-textarea').remove();
                                $viewComment.find('.comment-text pre').css('display', 'block');
                            }
                        }
                        this.disabledViewComments(false);
                    } else if ($('.container-collaboration').length > 0) {
                        rootView.router.back();
                    }
                }
            },

            onCancelEditComment: function() {
                var $viewComment = $('.container-view-comment');
                $viewComment.find('a.done-edit-comment, a.cancel-edit-comment, .comment-textarea').remove();
                $viewComment.find('.comment-text pre').css('display', 'block');
                $viewComment.find('a.prev-comment, a.next-comment, a.add-reply').css('display', 'flex');
                this.disabledViewComments(false);
            },

            showEditReply: function(idComment, indReply) {
                var me = this;
                var comment = me.findComment(idComment);
                if (comment) {
                    var replies,
                        reply;
                    replies = comment.replys;
                    reply = replies[indReply];
                    if (reply) {
                        if ($('.container-view-comment').length > 0) {
                            if (Common.SharedSettings.get('phone')) {
                                me.editReplyView = uiApp.popup(
                                    me.view.getTemplateEditReplyPopup(reply)
                                );
                                $$(me.editReplyView).on('close', function () {
                                    me.disabledViewComments(false);
                                });
                                $('.popup').css('z-index', '20000');
                            } else {
                                me.disabledViewComments(true);
                                var $reply = $('.reply-item[data-ind=' + indReply + ']');
                                var $viewComment = $('.container-view-comment');
                                $reply.find('.reply-text').css('display', 'none');
                                $viewComment.find('a.prev-comment, a.next-comment, a.add-reply').css('display', 'none');
                                var template = _.template('<textarea class="edit-reply-textarea">' + reply.reply + '</textarea>');
                                $reply.append(template);
                                template = _.template('<a href="#" class="link" id="edit-reply">' + me.textDone + '</a>');
                                $viewComment.find('.button-right').append(template);
                                template = _.template('<a href="#" class="link cancel-reply">' + me.textCancel + '</a>');
                                $viewComment.find('.button-left').append(template);
                            }
                        } else if ($('.container-collaboration').length > 0) {
                            me.getView('Common.Views.Collaboration').showPage('#comments-edit-reply-view', false);
                            me.getView('Common.Views.Collaboration').renderEditReply(reply);
                        }
                        _.defer(function () {
                            var $textarea = $('.edit-reply-textarea')[0];
                            $textarea.focus();
                            $textarea.selectionStart = $textarea.value.length;
                        });
                        $('#edit-reply').single('click', _.bind(me.onEditReply, me, comment, indReply));
                        $('.cancel-reply').single('click', _.bind(me.onCancelEditReply, me, indReply));
                    }
                }
            },

            onEditReply: function(comment, indReply) {
                var value = $('.edit-reply-textarea')[0].value.trim();
                if (value && value.length > 0) {
                    this.getCurrentUser();
                    if ($('.container-view-comment').length > 0) {
                        if (!_.isUndefined(this.onChangeComment)) {
                            comment.replys[indReply].reply = value;
                            comment.replys[indReply].userid = this.currentUser.asc_getIdOriginal();
                            comment.replys[indReply].username = this.currentUser.asc_getUserName();
                            this.onChangeComment(comment);
                        }
                        if (Common.SharedSettings.get('phone')) {
                            uiApp.closeModal($$(this.editReplyView));
                        } else {
                            var $viewComment = $('.container-view-comment');
                            $viewComment.find('a#edit-reply, a.cancel-reply').remove();
                            $viewComment.find('a.prev-comment, a.next-comment, a.add-reply').css('display', 'flex');
                            if ($viewComment.find('.edit-reply-textarea').length > 0) {
                                $viewComment.find('.edit-reply-textarea').remove();
                                $viewComment.find('.reply-text').css('display', 'block');
                            }
                        }
                    } else {
                        if (!_.isUndefined(this.onChangeComment)) {
                            comment.replys[indReply].reply = value;
                            comment.replys[indReply].userid = this.currentUser.asc_getIdOriginal();
                            comment.replys[indReply].username = this.currentUser.asc_getUserName();
                            this.onChangeComment(comment);
                        }
                        rootView.router.back();
                    }
                    this.disabledViewComments(false);
                }
            },

            onCancelEditReply: function(indReply) {
                var $viewComment = $('.container-view-comment'),
                    $reply = $('.reply-item[data-ind=' + indReply + ']');
                $viewComment.find('a#edit-reply, a.cancel-reply, .edit-reply-textarea').remove();
                $reply.find('.reply-text').css('display', 'block');
                $viewComment.find('a.prev-comment, a.next-comment, a.add-reply').css('display', 'flex');
                this.disabledViewComments(false);
            },

            onClickResolveComment: function(uid, e) {
                var idComment;
                if (!uid) {
                    var $comment = $(e.currentTarget).closest('.comment');
                    idComment = $comment.data('uid');
                } else {
                    idComment = uid;
                }
                if (_.isNumber(idComment)) {
                    idComment = idComment.toString();
                }
                var comment = this.findComment(idComment);
                if (comment) {
                    this.resolveComment && this.resolveComment(comment.uid);
                }
            },

            // utils
            timeZoneOffsetInMs: (new Date()).getTimezoneOffset() * 60000,
            utcDateToString: function (date) {
                if (Object.prototype.toString.call(date) === '[object Date]')
                    return (date.getTime() - this.timeZoneOffsetInMs).toString();

                return '';
            },
            ooDateToString: function (date) {
                if (Object.prototype.toString.call(date) === '[object Date]')
                    return (date.getTime()).toString();

                return '';
            },
            //end utils


            groupCollectionComments: [],
            collectionComments: [],
            groupCollectionFilter: [],
            filter: [],

            initComments: function() {
                this.getView('Common.Views.Collaboration').renderComments((this.groupCollectionFilter.length !== 0) ? this.groupCollectionFilter : (this.collectionComments.length !== 0) ? this.collectionComments : false);
                $('.comment-menu').single('click', _.buffered(this.initMenuComments, 100, this));
                $('.reply-menu').single('click', _.buffered(this.initReplyMenu, 100, this));
                $('.comment-resolve').single('click', _.bind(this.onClickResolveComment, this, false));
                $('.comment-quote').single('click', _.bind(this.onSelectComment, this));
            },

            readSDKReplies: function (data) {
                var i = 0,
                    replies = [],
                    date = null;
                var repliesCount = data.asc_getRepliesCount();
                if (repliesCount) {
                    for (i = 0; i < repliesCount; ++i) {
                        date = (data.asc_getReply(i).asc_getOnlyOfficeTime()) ? new Date(this.stringOOToLocalDate(data.asc_getReply(i).asc_getOnlyOfficeTime())) :
                            ((data.asc_getReply(i).asc_getTime() == '') ? new Date() : new Date(this.stringUtcToLocalDate(data.asc_getReply(i).asc_getTime())));

                        var user = _.find(editUsers, function(item){
                            return (item.asc_getIdOriginal()==data.asc_getReply(i).asc_getUserId());
                        });
                        var username = data.asc_getReply(i).asc_getUserName();
                        replies.push({
                            ind                  : i,
                            userid              : data.asc_getReply(i).asc_getUserId(),
                            username            : username,
                            usercolor           : (user) ? user.asc_getColor() : null,
                            date                : this.dateToLocaleTimeString(date),
                            reply               : data.asc_getReply(i).asc_getText(),
                            time                : date.getTime(),
                            userInitials        : this.getInitials(username),
                            editable            : this.appConfig.canEditComments || (data.asc_getReply(i).asc_getUserId() == _userId)
                        });
                    }
                }
                return replies;
            },

            readSDKComment: function(id, data) {
                var date = (data.asc_getOnlyOfficeTime()) ? new Date(this.stringOOToLocalDate(data.asc_getOnlyOfficeTime())) :
                    ((data.asc_getTime() == '') ? new Date() : new Date(this.stringUtcToLocalDate(data.asc_getTime())));
                var user = _.find(editUsers, function(item){
                    return (item.asc_getIdOriginal()==data.asc_getUserId());
                });
                var groupname = id.substr(0, id.lastIndexOf('_')+1).match(/^(doc|sheet[0-9_]+)_/);
                var username = data.asc_getUserName();
                var comment = {
                    uid                 : id,
                    userid              : data.asc_getUserId(),
                    username            : username,
                    usercolor           : (user) ? user.asc_getColor() : null,
                    date                : this.dateToLocaleTimeString(date),
                    quote               : data.asc_getQuoteText(),
                    comment             : data.asc_getText(),
                    resolved            : data.asc_getSolved(),
                    unattached          : !_.isUndefined(data.asc_getDocumentFlag) ? data.asc_getDocumentFlag() : false,
                    time                : date.getTime(),
                    replys              : [],
                    groupName           : (groupname && groupname.length>1) ? groupname[1] : null,
                    userInitials        : this.getInitials(username),
                    editable            : this.appConfig.canEditComments || (data.asc_getUserId() == _userId)
                };
                if (comment) {
                    var replies = this.readSDKReplies(data);
                    if (replies.length) {
                        comment.replys = replies;
                    }
                }
                return comment;
            },

            onApiChangeCommentData: function(id, data) {
                var me = this,
                    i = 0,
                    date = null,
                    replies = null,
                    repliesCount = 0,
                    dateReply = null,
                    comment = _.findWhere(me.collectionComments, {uid: id}) || this.findCommentInGroup(id);

                if (comment) {

                    date = (data.asc_getOnlyOfficeTime()) ? new Date(this.stringOOToLocalDate(data.asc_getOnlyOfficeTime())) :
                        ((data.asc_getTime() == '') ? new Date() : new Date(this.stringUtcToLocalDate(data.asc_getTime())));

                    var user = _.find(editUsers, function(item){
                        return (item.asc_getIdOriginal()==data.asc_getUserId());
                    });
                    comment.comment = data.asc_getText();
                    comment.userid = data.asc_getUserId();
                    comment.username = data.asc_getUserName();
                    comment.usercolor = (user) ? user.asc_getColor() : null;
                    comment.resolved = data.asc_getSolved();
                    comment.quote = data.asc_getQuoteText();
                    comment.time = date.getTime();
                    comment.date = me.dateToLocaleTimeString(date);

                    replies = _.clone(comment.replys);

                    replies.length = 0;

                    repliesCount = data.asc_getRepliesCount();
                    for (i = 0; i < repliesCount; ++i) {

                        dateReply = (data.asc_getReply(i).asc_getOnlyOfficeTime()) ? new Date(this.stringOOToLocalDate(data.asc_getReply(i).asc_getOnlyOfficeTime())) :
                            ((data.asc_getReply(i).asc_getTime() == '') ? new Date() : new Date(this.stringUtcToLocalDate(data.asc_getReply(i).asc_getTime())));

                        user = _.find(editUsers, function(item){
                            return (item.asc_getIdOriginal()==data.asc_getReply(i).asc_getUserId());
                        });
                        var username = data.asc_getReply(i).asc_getUserName();
                        replies.push({
                            ind                 : i,
                            userid              : data.asc_getReply(i).asc_getUserId(),
                            username            : username,
                            usercolor           : (user) ? user.asc_getColor() : null,
                            date                : me.dateToLocaleTimeString(dateReply),
                            reply               : data.asc_getReply(i).asc_getText(),
                            time                : dateReply.getTime(),
                            userInitials        : me.getInitials(username),
                            editable            : me.appConfig.canEditComments || (data.asc_getUserId() == _userId)
                        });
                    }
                    comment.replys = replies;
                    if($('.page-comments').length > 0) {
                        this.initComments();
                    }

                    if (this.showComments && this.showComments.length > 0) {
                        var showComment = _.findWhere(this.showComments, {uid: id});
                        if (showComment) {
                            showComment = comment;
                        }
                    }
                    if ($('.container-view-comment').length > 0) {
                        this.updateViewComment();
                    }
                }
            },

            onApiAddComment: function (id, data) {
                var comment = this.readSDKComment(id, data);
                if (comment) {
                    comment.groupName ? this.addCommentToGroupCollection(comment) : this.collectionComments.push(comment);
                }
                if($('.page-comments').length > 0) {
                    this.initComments();
                }
            },

            onApiAddComments: function (data) {
                for (var i = 0; i < data.length; ++i) {
                    var comment = this.readSDKComment(data[i].asc_getId(), data[i]);
                    comment.groupName ? this.addCommentToGroupCollection(comment) : this.collectionComments.push(comment);
                }
                if($('.page-comments').length > 0) {
                    this.initComments();
                }
            },

            stringOOToLocalDate: function (date) {
                if (typeof date === 'string')
                    return parseInt(date);
                return 0;
            },

            stringUtcToLocalDate: function (date) {
                if (typeof date === 'string')
                    return parseInt(date) + this.timeZoneOffsetInMs;

                return 0;
            },

            addCommentToGroupCollection: function (comment) {
                var groupname = comment.groupName;
                if (!this.groupCollectionComments[groupname])
                    this.groupCollectionComments[groupname] = [];
                this.groupCollectionComments[groupname].push(comment);
                if (this.filter.indexOf(groupname) != -1) {
                    this.groupCollectionFilter.push(comment);
                }
            },

            findCommentInGroup: function (id) {
                for (var name in this.groupCollectionComments) {
                    var store = this.groupCollectionComments[name];
                    var id = _.isArray(id) ? id[0] : id;
                    var model = _.findWhere(store, {uid: id});
                    if (model) return model;
                }
            },

            onApiRemoveComment: function (id, silentUpdate) {
                function remove (collection, key) {
                    if(collection instanceof Array) {
                        var index = collection.indexOf(key);
                        if(index != -1) {
                            collection.splice(index, 1);
                        }
                    }
                }
                if (this.collectionComments.length > 0) {
                    var comment = _.findWhere(this.collectionComments, {uid: id});
                    if (comment) {
                        remove(this.collectionComments, comment);
                    }
                } else {
                    for (var name in this.groupCollectionComments) {
                        var store = this.groupCollectionComments[name],
                            comment = _.findWhere(store, {uid: id});
                        if (comment) {
                            remove(this.groupCollectionComments[name], comment);
                            if (this.filter.indexOf(name) != -1) {
                                remove(this.groupCollectionFilter, comment);
                            }
                        }
                    }
                }
                if(!silentUpdate && $('.page-comments').length > 0) {
                    this.initComments();
                }

                if (this.showComments && this.showComments.length > 0) {
                    var removeComment = _.findWhere(this.showComments, {uid: id});
                    if (removeComment) {
                        this.showComments = _.without(this.showComments, removeComment);
                    }
                }
            },

            onApiRemoveComments: function(data) {
                for (var i = 0; i < data.length; i++) {
                    this.onApiRemoveComment(data[i], true);
                }
            },

            onFilterChange: function (filter) {
                if (filter) {
                    var me = this,
                        comments = [];
                    this.filter = filter;
                    filter.forEach(function(item){
                        if (!me.groupCollectionComments[item])
                            me.groupCollectionComments[item] = [];
                        comments = comments.concat(me.groupCollectionComments[item]);
                    });
                    this.groupCollectionFilter = comments;
                }
            },

            onSelectComment: function (e) {
                var id = $(e.currentTarget).data('id');
                this.api.asc_selectComment(id);
            },


            textInserted: '<b>Inserted:</b>',
            textDeleted: '<b>Deleted:</b>',
            textParaInserted: '<b>Paragraph Inserted</b> ',
            textParaDeleted: '<b>Paragraph Deleted</b> ',
            textFormatted: 'Formatted',
            textParaFormatted: '<b>Paragraph Formatted</b>',
            textNot: 'Not ',
            textBold: 'Bold',
            textItalic: 'Italic',
            textStrikeout: 'Strikeout',
            textUnderline: 'Underline',
            textColor: 'Font color',
            textBaseline: 'Baseline',
            textSuperScript: 'Superscript',
            textSubScript: 'Subscript',
            textHighlight: 'Highlight color',
            textSpacing: 'Spacing',
            textDStrikeout: 'Double strikeout',
            textCaps: 'All caps',
            textSmallCaps: 'Small caps',
            textPosition: 'Position',
            textShd: 'Background color',
            textContextual: 'Don\'t add interval between paragraphs of the same style',
            textNoContextual: 'Add interval between paragraphs of the same style',
            textIndentLeft: 'Indent left',
            textIndentRight: 'Indent right',
            textFirstLine: 'First line',
            textRight: 'Align right',
            textLeft: 'Align left',
            textCenter: 'Align center',
            textJustify: 'Align justify',
            textBreakBefore: 'Page break before',
            textKeepNext: 'Keep with next',
            textKeepLines: 'Keep lines together',
            textNoBreakBefore: 'No page break before',
            textNoKeepNext: 'Don\'t keep with next',
            textNoKeepLines: 'Don\'t keep lines together',
            textLineSpacing: 'Line Spacing: ',
            textMultiple: 'multiple',
            textAtLeast: 'at least',
            textExact: 'exactly',
            textSpacingBefore: 'Spacing before',
            textSpacingAfter: 'Spacing after',
            textAuto: 'auto',
            textWidow: 'Widow control',
            textNoWidow: 'No widow control',
            textTabs: 'Change tabs',
            textNum: 'Change numbering',
            textEquation: 'Equation',
            textImage: 'Image',
            textChart: 'Chart',
            textShape: 'Shape',
            textTableChanged: '<b>Table Settings Changed</b>',
            textTableRowsAdd: '<b>Table Rows Added</b>',
            textTableRowsDel: '<b>Table Rows Deleted</b>',
            textParaMoveTo: '<b>Moved:</b>',
            textParaMoveFromUp: '<b>Moved Up:</b>',
            textParaMoveFromDown: '<b>Moved Down:</b>',
            textEditUser: 'Document is currently being edited by several users.',
            textCancel: "Cancel",
            textDone: "Done",
            textAddReply: "Add Reply",
            textEdit: 'Edit',
            textResolve: 'Resolve',
            textDeleteComment: 'Delete comment',
            textDeleteReply: 'Delete reply',
            textReopen: 'Reopen',
            textMessageDeleteComment: 'Do you really want to delete this comment?',
            textMessageDeleteReply: 'Do you really want to delete this reply?',
            textYes: 'Yes',
            textDelete: 'Delete',
            textNoChanges: 'There are no changes.'

        }
    })(), Common.Controllers.Collaboration || {}))
});