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
 *  Document Editor
 *
 *  Created by Julia Svinareva on 14/5/19
 *  Copyright (c) 2019 Ascensio System SIA. All rights reserved.
 *
 */
define([
    'core',
    'jquery',
    'underscore',
    'backbone',
    'documenteditor/mobile/app/view/Collaboration'
], function (core, $, _, Backbone) {
    'use strict';

    DE.Controllers.Collaboration = Backbone.Controller.extend(_.extend((function() {
        // Private
        var _settings = [],
            _headerType = 1,
             rootView,
            displayMode = "Markup",
            arrChangeReview = [],
            dateChange = [],
            _fileKey,
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
                this.api.asc_registerCallback('asc_onShowRevisionsChange', _.bind(this.changeReview, this));
                this.api.asc_registerCallback('asc_onAuthParticipantsChanged', _.bind(this.onChangeEditUsers, this));
                this.api.asc_registerCallback('asc_onParticipantsChanged',     _.bind(this.onChangeEditUsers, this));
            },

            onLaunch: function () {
                this.createView('Collaboration').render();
            },

            setMode: function(mode) {
                this.appConfig = mode;
                _fileKey = mode.fileKey;
                _userId = mode.user.id;
                return this;
            },


            showModal: function() {
                var me = this,
                    isAndroid = Framework7.prototype.device.android === true,
                    modalView,
                    mainView = DE.getController('Editor').getView('Editor').f7View;

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

                DE.getController('Toolbar').getView('Toolbar').hideSearch();
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
                } else {
                    if(!this.appConfig.canReview) {
                        $('#reviewing-settings').hide();
                    }
                }
            },

            initReviewingSettingsView: function () {
                var me = this;
                $('#settings-review input:checkbox').attr('checked', this.appConfig.isReviewOnly || Common.localStorage.getBool("de-mobile-track-changes-" + (_fileKey || '')));
                $('#settings-review input:checkbox').single('change', _.bind(me.onTrackChanges, me));
                $('#settings-accept-all').single('click', _.bind(me.onAcceptAllClick, me));
                $('#settings-reject-all').single('click', _.bind(me.onRejectAllClick, me));
                if(this.appConfig.isReviewOnly || displayMode == "Final" || displayMode == "Original" ) {
                    $('#settings-accept-all').addClass('disabled');
                    $('#settings-reject-all').addClass('disabled');
                    $('#settings-review').addClass('disabled');
                } else {
                    $('#settings-accept-all').removeClass('disabled');
                    $('#settings-reject-all').removeClass('disabled');
                    $('#settings-review').removeClass('disabled');
                }
            },

            onTrackChanges: function(e) {
                var $checkbox = $(e.currentTarget),
                    state = $checkbox.is(':checked');
                if ( this.appConfig.isReviewOnly ) {
                    $checkbox.attr('checked', true);
                } else {
                    this.api.asc_SetTrackRevisions(state);
                    Common.localStorage.setItem("de-mobile-track-changes-" + (_fileKey || ''), state ? 1 : 0);
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
                if (value == null || value === "Markup") {
                    $('input[value="Markup"]').attr('checked', true);
                } else if (value === 'Final') {
                    $('input[value="Final"]').attr('checked', true);
                } else if (value === 'Original') {
                    $('input[value="Original"]').attr('checked', true);
                }
            },

            getDisplayMode: function() {
                return displayMode;
            },

            onReviewViewClick: function(event) {
                var value = $(event.currentTarget).val();
                this.turnDisplayMode(value);
            },

            turnDisplayMode: function(value) {
                displayMode = value;
                if (this.api) {
                    if (value === 'Final')
                        this.api.asc_BeginViewModeInReview(true);

                    else if (value === 'Original')
                        this.api.asc_BeginViewModeInReview(false);
                    else
                        this.api.asc_EndViewModeInReview();
                }
                this.initReviewingSettingsView();
                DE.getController('Toolbar').setDisplayMode(value);
            },


            initChange: function() {
                var goto = false;
                if(arrChangeReview.length == 0) {
                    this.api.asc_GetNextRevisionsChange();
                }
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
                        $('.accept-reject').html('<div id="btn-delete-change"><i class="icon icon-review"></i></div>');
                        $('#btn-delete-change').single('click', _.bind(this.onDeleteChange, this));
                    }
                }
                if(displayMode == "Final" || displayMode == "Original") {
                    $('#btn-accept-change').addClass('disabled');
                    $('#btn-reject-change').addClass('disabled');
                    $('#btn-prev-change').addClass('disabled');
                    $('#btn-next-change').addClass('disabled');
                }
            },

            onPrevChange: function() {
                this.api.asc_GetPrevRevisionsChange();
            },

            onNextChange: function() {
                this.api.asc_GetNextRevisionsChange();
            },

            onAcceptCurrentChange: function() {
                if (this.api) {
                    this.api.asc_AcceptChanges(dateChange[0]);
                }
                this.api.asc_GetNextRevisionsChange();
            },

            onRejectCurrentChange: function() {
                if (this.api) {
                    this.api.asc_RejectChanges(dateChange[0]);
                }
                this.api.asc_GetNextRevisionsChange();
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

            onChangeEditUsers: function(users) {
                editUsers = users;
            },

            initEditUsers: function() {
                var templateUserItem = _.template([
                    '<% _.each(users, function(item) { %>',
                    '<li id="<%= item.id %>" class="<% if (item.view) {%> viewmode <% } %> item-content">' +
                    '<div class="user-name item-inner">' +
                    '<div class="color" style="background-color: <%= item.color %>;"><%= item.initial %></div>'+
                    '<label><%= item.name %></label>' +
                    '<% if (item.len>1) { %><label class="length"> (<%= item.len %>)</label><% } %>' +
                    '</div>'+
                    '</li>',
                    '<% }); %>'
                ].join(''));
                var users = [],
                    usersSort = [],
                    len;
                _.each(editUsers, function(item){
                    var fio = item.userName.split(' ');
                    var initials = fio[0].substring(0, 1).toUpperCase();
                    if (fio.length > 1) {
                        initials += fio[fio.length - 1].substring(0, 1).toUpperCase();
                    }
                    users.push({color: item.asc_getColor(), id: item.id, idOriginal: item.idOriginal, name: item.userName, view: item.view, initial: initials})
                });
                _.each(users.filter(function (itm) {return !itm.view;}), function(item){
                    if (usersSort.filter(function (itemFil) {return item.idOriginal === itemFil.idOriginal;}).length === 0) {
                        len = users.filter(function (itemFil) {
                            return (item.idOriginal === itemFil.idOriginal && !itemFil.view);
                        }).length;
                        usersSort.push({color: item.color, id: item.id, idOriginal: item.idOriginal, name: item.name, view: item.view, len: len, initial: item.initial})
                    }
                });
                var templateUserList = _.template(
                    '<div class="item-content"><div class="item-inner">' +
                    this.textEditUser +
                    '</div></div>' +
                    '<ul>' +
                        templateUserItem(({users: usersSort})) +
                    '</ul>');
                    $('#user-list').html(templateUserList({
                        users: usersSort.filter(function (item) {
                            return !item.view;
                        }),
                    }));
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
            textEditUser: 'Document is currently being edited by several users.'

        }
    })(), DE.Controllers.Collaboration || {}))
});