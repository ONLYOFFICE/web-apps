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
            _fileKey;


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
                this.api.asc_registerCallback('asc_onAddComment', _.bind(this.onApiAddComment, this));
                this.api.asc_registerCallback('asc_onAddComments', _.bind(this.onApiAddComments, this));
                this.api.asc_registerCallback('asc_onChangeCommentData', _.bind(this.onApiChangeCommentData, this));
                this.api.asc_registerCallback('asc_onRemoveComment', _.bind(this.onApiRemoveComment, this));
                this.api.asc_registerCallback('asc_onRemoveComments', _.bind(this.onApiRemoveComments, this));
                this.api.asc_registerCallback('asc_onShowComment', _.bind(this.apiShowComments, this));
                if (editor === 'DE') {
                    this.api.asc_registerCallback('asc_onShowRevisionsChange', _.bind(this.changeReview, this));
                }
            },

            onLaunch: function () {
                this.createView('Common.Views.Collaboration').render();
            },

            setMode: function(mode) {
                this.appConfig = mode;
                _userId = mode.user.id;
                if (editor === 'DE') {
                    _fileKey = mode.fileKey;
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
                    if(editor === 'DE' && !this.appConfig.canReview && !canViewReview) {
                        $('#reviewing-settings').hide();
                    }
                }
            },

            //Edit users

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
                        var userAttr = {
                            color: item.asc_getColor(),
                            id: item.asc_getId(),
                            idOriginal: item.asc_getIdOriginal(),
                            name: item.asc_getUserName(),
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

            //Review

            initReviewingSettingsView: function () {
                var me = this;
                $('#settings-review input:checkbox').attr('checked', this.appConfig.isReviewOnly || Common.localStorage.getBool("de-mobile-track-changes-" + (_fileKey || '')));
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
            },


            initChange: function() {
                var goto = false;
                if(arrChangeReview.length == 0) {
                    $('#current-change').css('display','none');
                } else {
                    $('#current-change #date-change').html(arrChangeReview[0].date);
                    $('#current-change #user-name').html(arrChangeReview[0].user);
                    $('#current-change #text-change').html(arrChangeReview[0].changetext);
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
                        $('.accept-reject').html('<div id="btn-delete-change"><i class="icon icon-delete-change"></i></div>');
                        $('#btn-delete-change').single('click', _.bind(this.onDeleteChange, this));
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
                    } else {
                        $('#current-change').show();
                        this.initChange();
                    }
                }
            },

            changeReview: function (data) {
                if (data && data.length>0) {
                    var me = this, arr = [];
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
                                    proptext += proptext += (me.textTabs + ', ');
                                if (value.Get_NumPr() !== undefined)
                                    proptext += proptext += (me.textNum + ', ');
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
                            goto = (item.get_MoveType() == Asc.c_oAscRevisionsMove.MoveTo || item.get_MoveType() == Asc.c_oAscRevisionsMove.MoveFrom);
                        date = me.dateToLocaleTimeString(date);
                        var editable = (item.get_UserId() == _userId);


                        arr.push({date: date, user: user, changetext: changetext, goto: goto, editable: editable});
                    });
                    arrChangeReview = arr;
                    dateChange = data;
                } else {
                    arrChangeReview = [];
                    dateChange = [];
                }
                this.updateInfoChange();
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

            findComment: function(uid) {
                var comment;
                if (this.groupCollectionFilter.length !== 0) {
                    comment = me.findCommentInGroup(uid);
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
            },

            updateViewComment: function() {
                DE.getController('Common.Controllers.Collaboration').getView('Common.Views.Collaboration').renderViewComments(this.showComments, this.indexCurrentComment);
                $('.comment-menu').single('click', _.bind(this.initMenuComments, this));
                $('.reply-menu').single('click', _.bind(this.initReplyMenu, this));
                $('.comment-resolve').single('click', _.bind(this.onClickResolveComment, this));
            },

            showCommentModal: function() {
                var me = this,
                    isAndroid = Framework7.prototype.device.android === true,
                    appPrefix = !!window.DE ? DE : !!window.PE ? PE : SSE,
                    mainView = appPrefix.getController('Editor').getView('Editor').f7View,
                    viewCollaboration = appPrefix.getController('Common.Controllers.Collaboration').getView('Common.Views.Collaboration');

                me.indexCurrentComment = 0;

                uiApp.closeModal();

                if (Common.SharedSettings.get('phone')) {
                    me.modalViewComment = $$(uiApp.pickerModal(
                        '<div class="picker-modal container-view-comment">' +
                            '<div class="swipe-container">' +
                                '<div class="icon-swipe"></div>' +
                            '</div>' +
                            '<div class="toolbar toolbar-bottom">' +
                                '<div class="toolbar-inner">' +
                                    '<div class="button-left">' +
                                        '<a href="#" class="link add-reply">' + me.textAddReply + '</a>' +
                                    '</div>' +
                                    '<div class="button-right">' +
                                        '<a href="#" class="link prev-comment"><i class="icon-arrow-comment left"></i></a>' +
                                        '<a href="#" class="link next-comment"><i class="icon-arrow-comment right"></i></a>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="pages">' +
                                '<div class="page page-view-comments" data-page="comments-view">' +
                                    '<div class="page-content">' +
                                    '</div>' +
                                '</div>' +
                            '</div>'+
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
                }

                appPrefix.getController('Toolbar').getView('Toolbar').hideSearch();

                viewCollaboration.renderViewComments(me.showComments, me.indexCurrentComment);

                //swipe modal window
                me.swipeFull = false;
                var $swipeContainer = $('.swipe-container');
                $swipeContainer.single('touchstart', _.bind(function(e){
                    var touchobj = e.changedTouches[0];
                    me.swipeStart = parseInt(touchobj.clientY);
                    e.preventDefault();
                }, me));
                $swipeContainer.single('touchend', _.bind(function (e) {
                    var touchobj = e.changedTouches[0];
                    var swipeEnd = parseInt(touchobj.clientY);
                    var dist = swipeEnd - me.swipeStart;
                    if (dist > 20) {
                        if (me.swipeFull) {
                            $('.container-view-comment').css('height', '50%');
                            me.swipeFull = false;
                        } else {
                            uiApp.closeModal();
                        }
                    } else if (dist < 0) {
                        $('.container-view-comment').css('height', '100%');
                        me.swipeFull = true;
                    } else {
                        $('.container-view-comment').css('height', '50%');
                    }
                }, me));

                $('.prev-comment').single('click', _.bind(me.onViewPrevComment, me));
                $('.next-comment').single('click', _.bind(me.onViewNextComment, me));
                $('.comment-menu').single('click', _.bind(me.initMenuComments, me));
                $('.add-reply').single('click', _.bind(me.onClickAddReply, me));
                $('.reply-menu').single('click', _.bind(me.initReplyMenu, me));
                $('.comment-resolve').single('click', _.bind(me.onClickResolveComment, me));
            },

            onViewPrevComment: function() {
                if (this.indexCurrentComment - 1 >= 0 && this.showComments.length > 0) {
                    this.indexCurrentComment -= 1;
                    DE.getController('Common.Controllers.Collaboration').getView('Common.Views.Collaboration').renderViewComments(this.showComments, this.indexCurrentComment);
                    $('.comment-menu').single('click', _.bind(this.initMenuComments, this));
                    $('.reply-menu').single('click', _.bind(this.initReplyMenu, this));
                    $('.comment-resolve').single('click', _.bind(this.onClickResolveComment, this));
                }
            },

            onViewNextComment: function() {
                if (this.indexCurrentComment + 1 < this.showComments.length) {
                    this.indexCurrentComment += 1;
                    DE.getController('Common.Controllers.Collaboration').getView('Common.Views.Collaboration').renderViewComments(this.showComments, this.indexCurrentComment);
                    $('.comment-menu').single('click', _.bind(this.initMenuComments, this));
                    $('.reply-menu').single('click', _.bind(this.initReplyMenu, this));
                    $('.comment-resolve').single('click', _.bind(this.onClickResolveComment, this));
                }
            },

            onClickAddReply: function() {
                var me = this;
                if (this.indexCurrentComment > -1 && this.indexCurrentComment < this.showComments.length) {
                    var addReplyView,
                        comment = this.showComments[this.indexCurrentComment];
                    if (Common.SharedSettings.get('phone')) {
                        addReplyView = uiApp.popup(
                            '<div class="popup container-add-reply">' +
                            '<div class="navbar">' +
                            '<div class="navbar-inner">' +
                            '<div class="left sliding"><a href="#" class="back link close-popup"> <i class="icon icon-close"></i>' + '<span>' + me.textCancel + '</span>'+ '</a></div>' +
                            '<div class="center sliding">' + me.textAddReply + '</div>' +
                            '<div class="right sliding"><a href="#" class="link done-reply"><i class="icon icon-done"></i>' + '<span>' + me.textDone + '</span>' + '</a></div>' +
                            '</div>' +
                            '</div>' +
                            '<div class="wrap-comment">' +
                            '<div class="user-name">' + comment.username + '</div>' +
                            '<div class="comment-date">' + comment.date + '</div>' +
                            '<div><textarea class="reply-textarea">'+ '</textarea></div>' +
                            '</div>' +
                            '</div>'
                        );
                        $('.popup').css('z-index', '20000');
                        _.delay(function () {
                            var $textarea = $('.reply-textarea')[0];
                            $textarea.focus();
                        },100);
                        $('.done-reply').single('click', _.bind(function (uid) {
                            var reply = $('.reply-textarea')[0].value;
                            if (reply && reply.length > 0) {
                                this.addReply(uid, reply);
                                uiApp.closeModal($$(addReplyView));
                                this.updateViewComment(this.showComments, this.indexCurrentComment);
                            }
                        }, me, comment.uid));
                    } else {

                    }
                }
            },

            addReply: function(id, replyVal) {
                if (replyVal.length > 0) {
                    var me = this,
                        reply = null,
                        addReply = null,
                        ascComment = (typeof Asc.asc_CCommentDataWord !== 'undefined' ? new Asc.asc_CCommentDataWord(null) : new Asc.asc_CCommentData(null)),
                        comment = _.findWhere(this.collectionComments, {uid: id});

                    if (ascComment && comment) {

                        ascComment.asc_putText(comment.comment);
                        ascComment.asc_putQuoteText(comment.quote);
                        ascComment.asc_putTime(me.utcDateToString(new Date(comment.time)));
                        ascComment.asc_putOnlyOfficeTime(me.ooDateToString(new Date(comment.time)));
                        ascComment.asc_putUserId(comment.userid);
                        ascComment.asc_putUserName(comment.username);
                        ascComment.asc_putSolved(comment.resolved);
                        ascComment.asc_putGuid(comment.guid);

                        if (!_.isUndefined(ascComment.asc_putDocumentFlag)) {
                            ascComment.asc_putDocumentFlag(comment.unattached);
                        }

                        reply = comment.replys;
                        if (reply && reply.length) {
                            reply.forEach(function (reply) {

                                addReply = (typeof Asc.asc_CCommentDataWord !== 'undefined' ? new Asc.asc_CCommentDataWord(null) : new Asc.asc_CCommentData(null));
                                if (addReply) {
                                    addReply.asc_putText(reply.reply);
                                    addReply.asc_putTime(me.utcDateToString(new Date(reply.time)));
                                    addReply.asc_putOnlyOfficeTime(me.ooDateToString(new Date(reply.time)));
                                    addReply.asc_putUserId(reply.userid);
                                    addReply.asc_putUserName(reply.username);

                                    ascComment.asc_addReply(addReply);
                                }
                            });
                        }

                        addReply = (typeof Asc.asc_CCommentDataWord !== 'undefined' ? new Asc.asc_CCommentDataWord(null) : new Asc.asc_CCommentData(null));
                        if (addReply) {
                            addReply.asc_putText(replyVal);
                            addReply.asc_putTime(me.utcDateToString(new Date()));
                            addReply.asc_putOnlyOfficeTime(me.ooDateToString(new Date()));
                            _.each(editUsers, function(item){
                                if (item.asc_getIdOriginal() === _userId) {
                                    me.currentUser = item;
                                }
                            });
                            addReply.asc_putUserId(_userId);
                            addReply.asc_putUserName(me.currentUser.asc_getUserName());

                            ascComment.asc_addReply(addReply);

                            me.api.asc_changeComment(id, ascComment);
                        }
                    }
                }
            },

            showAddCommentModal: function() {
                var me = this,
                    isAndroid = Framework7.prototype.device.android === true,
                    modalView,
                    appPrefix = !!window.DE ? DE : !!window.PE ? PE : SSE,
                    mainView = appPrefix.getController('Editor').getView('Editor').f7View;

                uiApp.closeModal();

                var date = new Date();
                _.each(editUsers, function(item){
                    if (item.asc_getIdOriginal() === _userId) {
                        me.currentUser = item;
                    }
                });
                if (!me.currentUser) return;
                var comment = {
                    time: date.getTime(),
                    date: me.dateToLocaleTimeString(date),
                    userid: _userId,
                    username: me.currentUser.asc_getUserName(),
                    usercolor: me.currentUser.asc_getColor()
                };

                if (Common.SharedSettings.get('phone')) {
                    modalView = $$(uiApp.pickerModal(
                        '<div class="picker-modal container-view-add-comment">' +
                            '<div class="navbar">' +
                                '<div class="navbar-inner">' +
                                    '<div class="left sliding"><a href="#" class="back link close-picker"> <i class="icon icon-close"></i>' +  (!isAndroid ? '<span>' + me.textCancel + '</span>' : '') + '</a></div>' +
                                    '<div class="center sliding">' + me.textAddComment + '</div>' +
                                    '<div class="right sliding"><a href="#" class="link" id="add-comment"><i class="icon icon-done"></i>' + (!isAndroid ? '<span>' + me.textDone + '</span>' : '') + '</a></div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="pages">' +
                                '<div class="page page-add-comment">' +
                                    '<div class="page-content">' +
                                        '<div class="wrap-comment">' +
                                            '<div class="user-name">' + comment.username + '</div>' +
                                            '<div class="comment-date">' + comment.date + '</div>' +
                                            '<div><textarea id="comment-text" class="comment-textarea"></textarea></div>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
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
                }

                _.delay(function(){
                    $('#comment-text').focus();
                },200);

                appPrefix.getController('Toolbar').getView('Toolbar').hideSearch();

                $('#add-comment').single('click', _.bind(me.onAddNewComment, me));
            },

            onAddNewComment: function() {
                var comment;
                if (typeof Asc.asc_CCommentDataWord !== 'undefined') {
                    comment = new Asc.asc_CCommentDataWord(null);
                } else {
                    comment = new Asc.asc_CCommentData(null);
                }

                var textComment = $('#comment-text').val();

                if (textComment.length > 0) {
                    comment.asc_putText(textComment);
                    comment.asc_putTime(this.utcDateToString(new Date()));
                    comment.asc_putOnlyOfficeTime(this.ooDateToString(new Date()));
                    comment.asc_putUserId(this.currentUser.asc_getIdOriginal());
                    comment.asc_putUserName(this.currentUser.asc_getUserName());
                    comment.asc_putSolved(false);

                    if (!_.isUndefined(comment.asc_putDocumentFlag))
                        comment.asc_putDocumentFlag(false);

                    this.api.asc_addComment(comment);

                    uiApp.closeModal();
                }
            },

            initMenuComments: function() {
                var me = this;
                _.delay(function () {
                    var _menuItems = [];
                    _menuItems.push({
                        caption: me.textEdit,
                        event: 'edit'
                    });
                    if (!me.showComments[me.indexCurrentComment].resolved) {
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
                    _menuItems.push({
                        caption: me.textDeleteComment,
                        event: 'delete'
                    });
                    _.each(_menuItems, function (item) {
                        item.text = item.caption;
                        item.onClick = function () {
                            me.onCommentMenuClick(item.event)
                        }
                    });

                    uiApp.actions([_menuItems, [
                        {
                            text: me.textCancel,
                            bold: true
                        }
                    ]]);
                }, 100);
            },

            initReplyMenu: function(event) {
                var me = this;
                var ind = $(event.currentTarget).parent().parent().data('ind');
                _.delay(function () {
                    var _menuItems = [];
                    _menuItems.push({
                        caption: me.textEdit,
                        event: 'editreply'
                    });
                    _menuItems.push({
                        caption: me.textDeleteReply,
                        event: 'deletereply'
                    });
                    _.each(_menuItems, function (item) {
                        item.text = item.caption;
                        item.onClick = function () {
                            me.onCommentMenuClick(item.event, ind);
                        }
                    });

                    uiApp.actions([_menuItems, [
                        {
                            text: me.textCancel,
                            bold: true
                        }
                    ]]);
                }, 100);
            },

            onCommentMenuClick: function(action, indReply) {
                var me = this;
                switch (action) {
                    case 'edit': me.showEditCommentModal(); break;
                    case 'resolve': me.onClickResolveComment(); break;
                    case 'delete': me.onDeleteComment(me.indexCurrentComment); break;
                    case 'editreply': me.showEditReplyModal(me.indexCurrentComment, indReply); break;
                    case 'deletereply': me.onDeleteReply(me.indexCurrentComment, indReply); break;
                }
            },

            onChangeComment: function(comment) {
                if (this.api) {
                    var ascComment,
                        me = this;
                    if (typeof Asc.asc_CCommentDataWord !== 'undefined') {
                        ascComment = new Asc.asc_CCommentDataWord(null);
                    } else {
                        ascComment = new Asc.asc_CCommentData(null);
                    }

                    if (ascComment && comment) {
                        var uid = comment.uid;
                        ascComment.asc_putText(comment.comment);
                        ascComment.asc_putQuoteText(comment.quote);
                        ascComment.asc_putTime(me.utcDateToString(new Date(comment.time)));
                        ascComment.asc_putOnlyOfficeTime(me.ooDateToString(new Date(comment.time)));
                        ascComment.asc_putUserId(comment.userid);
                        ascComment.asc_putUserName(comment.username);
                        ascComment.asc_putSolved(!comment.resolved);
                        ascComment.asc_putGuid(comment.guid);

                        if (!_.isUndefined(ascComment.asc_putDocumentFlag)) {
                            ascComment.asc_putDocumentFlag(comment.unattached);
                        }

                        var reply = comment.replys;
                        if (reply && reply.length > 0) {
                            reply.forEach(function (reply) {
                                var addReply = (typeof Asc.asc_CCommentDataWord !== 'undefined' ? new Asc.asc_CCommentDataWord(null) : new Asc.asc_CCommentData(null));
                                if (addReply) {
                                    addReply.asc_putText(reply.reply);
                                    addReply.asc_putTime(me.utcDateToString(new Date(reply.time)));
                                    addReply.asc_putOnlyOfficeTime(me.ooDateToString(new Date(reply.time)));
                                    addReply.asc_putUserId(reply.userid);
                                    addReply.asc_putUserName(reply.username);

                                    ascComment.asc_addReply(addReply);
                                }
                            });
                        }

                        this.api.asc_changeComment(uid, ascComment);
                    }
                }
            },

            onDeleteComment: function(ind) {
                if (this.api && !_.isUndefined(ind) && !_.isUndefined(this.showComments)) {
                    this.api.asc_removeComment(this.showComments[ind].uid);
                    if (this.showComments.length === 0) {
                        uiApp.closeModal();
                    } else {
                        this.indexCurrentComment = this.indexCurrentComment - 1 > -1 ? this.indexCurrentComment - 1 : 0;
                        this.updateViewComment();
                    }
                }
            },

            onDeleteReply: function(indComment, indReply) {
                if (!_.isUndefined(indComment) && !_.isUndefined(indReply)) {
                    var me = this,
                        replies = null,
                        addReply = null,
                        ascComment = (typeof Asc.asc_CCommentDataWord !== 'undefined' ? new Asc.asc_CCommentDataWord(null) : new Asc.asc_CCommentData(null)),
                        comment = me.showComments[indComment];

                    if (ascComment && comment) {
                        var id = comment.uid;
                        ascComment.asc_putText(comment.comment);
                        ascComment.asc_putQuoteText(comment.quote);
                        ascComment.asc_putTime(me.utcDateToString(new Date(comment.time)));
                        ascComment.asc_putOnlyOfficeTime(me.ooDateToString(new Date(comment.time)));
                        ascComment.asc_putUserId(comment.userid);
                        ascComment.asc_putUserName(comment.username);
                        ascComment.asc_putSolved(comment.resolved);
                        ascComment.asc_putGuid(comment.guid);

                        if (!_.isUndefined(ascComment.asc_putDocumentFlag)) {
                            ascComment.asc_putDocumentFlag(comment.unattached);
                        }

                        replies = comment.replys;
                        if (replies && replies.length) {
                            replies.forEach(function (reply) {
                                if (reply.ind !== indReply) {
                                    addReply = (typeof Asc.asc_CCommentDataWord !== 'undefined' ? new Asc.asc_CCommentDataWord(null) : new Asc.asc_CCommentData(null));
                                    if (addReply) {
                                        addReply.asc_putText(reply.reply);
                                        addReply.asc_putTime(me.utcDateToString(new Date(reply.time)));
                                        addReply.asc_putOnlyOfficeTime(me.ooDateToString(new Date(reply.time)));
                                        addReply.asc_putUserId(reply.userid);
                                        addReply.asc_putUserName(reply.username);

                                        ascComment.asc_addReply(addReply);
                                    }
                                }
                            });
                        }

                        me.api.asc_changeComment(id, ascComment);
                        me.updateViewComment();
                    }
                }
            },

            showEditCommentModal: function() {
                var me = this;
                if (this.indexCurrentComment > -1 && this.indexCurrentComment < this.showComments.length) {
                    var comment = this.showComments[this.indexCurrentComment];
                    if (Common.SharedSettings.get('phone')) {
                        me.editView = uiApp.popup(
                            '<div class="popup container-edit-comment">' +
                            '<div class="navbar">' +
                            '<div class="navbar-inner">' +
                            '<div class="left sliding"><a href="#" class="back link close-popup"> <i class="icon icon-close"></i>' + '<span>' + me.textCancel + '</span>'+ '</a></div>' +
                            '<div class="center sliding">' + me.textEditComment + '</div>' +
                            '<div class="right sliding"><a href="#" class="link" id="edit-comment"><i class="icon icon-done"></i>' + '<span>' + me.textDone + '</span>' + '</a></div>' +
                            '</div>' +
                            '</div>' +
                            '<div class="wrap-comment">' +
                            '<div class="user-name">' + comment.username + '</div>' +
                            '<div class="comment-date">' + comment.date + '</div>' +
                            '<div><textarea id="comment-text" class="comment-textarea">' + comment.comment + '</textarea></div>' +
                            '</div>' +
                            '</div>'
                        );
                        $('.popup').css('z-index', '20000');
                        _.delay(function () {
                            var $textarea = $('.comment-textarea')[0];
                            $textarea.focus();
                            $textarea.selectionStart = $textarea.value.length;
                        },100);
                        $('#edit-comment').single('click', _.bind(function (comment) {
                            var value = $('.comment-textarea')[0].value;
                            if (value && value.length > 0) {
                                comment.comment = value;
                                this.showComments[this.indexCurrentComment] = comment;
                                this.onChangeComment(comment);
                                uiApp.closeModal($$(me.editView));
                                this.updateViewComment();
                            }
                        }, me, comment));
                    } else {

                    }
                }
            },

            showEditReplyModal: function(indComment, indReply) {
                var me = this;
                if (indComment > -1 && indComment < this.showComments.length) {
                    var editView,
                        comment,
                        replies,
                        reply;
                    this.showComments && (comment = this.showComments[indComment]);
                    comment && (replies = comment.replys);
                    replies && (reply = replies[indReply]);
                    if (reply) {
                        if (Common.SharedSettings.get('phone')) {
                            editView = uiApp.popup(
                                '<div class="popup container-edit-comment">' +
                                '<div class="navbar">' +
                                '<div class="navbar-inner">' +
                                '<div class="left sliding"><a href="#" class="back link close-popup"> <i class="icon icon-close"></i>' + '<span>' + me.textCancel + '</span>' + '</a></div>' +
                                '<div class="center sliding">' + me.textEditReply + '</div>' +
                                '<div class="right sliding"><a href="#" class="link" id="edit-reply"><i class="icon icon-done"></i>' + '<span>' + me.textDone + '</span>' + '</a></div>' +
                                '</div>' +
                                '</div>' +
                                '<div class="wrap-comment">' +
                                '<div class="user-name">' + reply.username + '</div>' +
                                '<div class="comment-date">' + reply.date + '</div>' +
                                '<div><textarea id="comment-text" class="reply-textarea">' + reply.reply + '</textarea></div>' +
                                '</div>' +
                                '</div>'
                            );
                            $('.popup').css('z-index', '20000');
                            _.delay(function () {
                                var $textarea = $('.reply-textarea')[0];
                                $textarea.focus();
                                $textarea.selectionStart = $textarea.value.length;
                            },100);
                        }
                        $('#edit-reply').single('click', _.bind(function (comment, indReply) {
                            var value = $('.reply-textarea')[0].value;
                            if (value && value.length > 0) {
                                comment.replys[indReply].reply = value;
                                this.onChangeComment(comment);
                                uiApp.closeModal($$(editView));
                                this.updateViewComment();
                            }
                        }, me, comment, indReply));
                    }
                }
            },

            onClickResolveComment: function() {
                if (!_.isUndefined(this.indexCurrentComment) && !_.isUndefined(this.showComments)) {
                    var comment = this.showComments[this.indexCurrentComment];
                    if (comment) {
                        if (this.resolveComment(comment.uid)) {
                            $('.comment-resolve .icon-resolve-comment').toggleClass('check');
                        }
                    }
                }
            },

            resolveComment: function (uid) {
                var me = this,
                    reply = null,
                    addReply = null,
                    ascComment = (typeof Asc.asc_CCommentDataWord !== 'undefined' ? new Asc.asc_CCommentDataWord(null) : new Asc.asc_CCommentData(null)),
                    comment = me.findComment(uid);

                if (ascComment && comment && me.api) {
                    ascComment.asc_putText(comment.comment);
                    ascComment.asc_putQuoteText(comment.quote);
                    ascComment.asc_putTime(me.utcDateToString(new Date(comment.time)));
                    ascComment.asc_putOnlyOfficeTime(me.ooDateToString(new Date(comment.time)));
                    ascComment.asc_putUserId(comment.userid);
                    ascComment.asc_putUserName(comment.username);
                    ascComment.asc_putSolved(!comment.resolved);
                    ascComment.asc_putGuid(comment.guid);

                    if (!_.isUndefined(ascComment.asc_putDocumentFlag)) {
                        ascComment.asc_putDocumentFlag(comment.unattached);
                    }

                    reply = comment.replys;
                    if (reply && reply.length) {
                        reply.forEach(function (reply) {
                            addReply = (typeof Asc.asc_CCommentDataWord !== 'undefined' ? new Asc.asc_CCommentDataWord(null) : new Asc.asc_CCommentData(null));
                            if (addReply) {
                                addReply.asc_putText(reply.reply);
                                addReply.asc_putTime(me.utcDateToString(new Date(reply.time)));
                                addReply.asc_putOnlyOfficeTime(me.ooDateToString(new Date(reply.time)));
                                addReply.asc_putUserId(reply.userid);
                                addReply.asc_putUserName(reply.username);

                                ascComment.asc_addReply(addReply);
                            }
                        });
                    }

                    me.api.asc_changeComment(uid, ascComment);
                    return true;
                }
                return false;
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

                        var user = _.findWhere(editUsers, {idOriginal: data.asc_getReply(i).asc_getUserId()});
                        replies.push({
                            ind                  : i,
                            userid              : data.asc_getReply(i).asc_getUserId(),
                            username            : data.asc_getReply(i).asc_getUserName(),
                            usercolor           : (user) ? user.asc_getColor() : null,
                            date                : this.dateToLocaleTimeString(date),
                            reply               : data.asc_getReply(i).asc_getText(),
                            time                : date.getTime()
                        });
                    }
                }
                return replies;
            },

            readSDKComment: function(id, data) {
                var date = (data.asc_getOnlyOfficeTime()) ? new Date(this.stringOOToLocalDate(data.asc_getOnlyOfficeTime())) :
                    ((data.asc_getTime() == '') ? new Date() : new Date(this.stringUtcToLocalDate(data.asc_getTime())));
                var user = _.findWhere(editUsers, {idOriginal: data.asc_getUserId()}),
                    groupname = id.substr(0, id.lastIndexOf('_')+1).match(/^(doc|sheet[0-9_]+)_/);
                var comment = {
                    uid                 : id,
                    userid              : data.asc_getUserId(),
                    username            : data.asc_getUserName(),
                    usercolor           : (user) ? user.asc_getColor() : null,
                    date                : this.dateToLocaleTimeString(date),
                    quote               : data.asc_getQuoteText(),
                    comment             : data.asc_getText(),
                    resolved            : data.asc_getSolved(),
                    unattached          : !_.isUndefined(data.asc_getDocumentFlag) ? data.asc_getDocumentFlag() : false,
                    time                : date.getTime(),
                    replys              : [],
                    groupName           : (groupname && groupname.length>1) ? groupname[1] : null
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

                    var user = _.findWhere(editUsers, {idOriginal: data.asc_getUserId()});
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

                        user = _.findWhere(editUsers, {idOriginal: data.asc_getReply(i).asc_getUserId()});
                        replies.push({
                            ind                 : i,
                            userid              : data.asc_getReply(i).asc_getUserId(),
                            username            : data.asc_getReply(i).asc_getUserName(),
                            usercolor           : (user) ? user.asc_getColor() : null,
                            date                : me.dateToLocaleTimeString(dateReply),
                            reply               : data.asc_getReply(i).asc_getText(),
                            time                : dateReply.getTime()
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
                    var store = this.groupCollectionComments[name],
                        model = _.findWhere(store, {uid: id});
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
                if (this.groupCollectionComments.length > 0) {
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
                if (this.collectionComments.length > 0) {
                    var comment = _.findWhere(this.collectionComments, {uid: id});
                    if (comment) {
                        remove(this.collectionComments, comment);
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
            textTableRowsAdd: '<b>Table Rows Added<b/>',
            textTableRowsDel: '<b>Table Rows Deleted<b/>',
            textParaMoveTo: '<b>Moved:</b>',
            textParaMoveFromUp: '<b>Moved Up:</b>',
            textParaMoveFromDown: '<b>Moved Down:</b>',
            textEditUser: 'Document is currently being edited by several users.',
            textAddComment: "Add Comment",
            textCancel: "Cancel",
            textDone: "Done",
            textAddReply: "Add Reply",
            textEdit: 'Edit',
            textResolve: 'Resolve',
            textDeleteComment: 'Delete comment',
            textEditComment: 'Edit comment',
            textDeleteReply: 'Delete reply',
            textEditReply: 'Edit reply',
            textReopen: 'Reopen'

        }
    })(), Common.Controllers.Collaboration || {}))
});