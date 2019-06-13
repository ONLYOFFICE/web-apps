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
 *  ReviewChanges.js
 *
 *  Created by Julia.Radzhabova on 05.08.15
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

if (Common === undefined)
    var Common = {};
Common.Controllers = Common.Controllers || {};

define([
    'core',
    'common/main/lib/model/ReviewChange',
    'common/main/lib/collection/ReviewChanges',
    'common/main/lib/view/ReviewChanges',
    'common/main/lib/view/ReviewPopover',
    'common/main/lib/view/LanguageDialog'
], function () {
    'use strict';

    Common.Controllers.ReviewChanges = Backbone.Controller.extend(_.extend({
        models : [],
        collections : [
            'Common.Collections.ReviewChanges'
        ],
        views : [
            'Common.Views.ReviewChanges',
            'Common.Views.ReviewPopover'
        ],
        sdkViewName : '#id_main',

        initialize: function () {

            this.addListeners({
                'FileMenu': {
                    'settings:apply': this.applySettings.bind(this)
                },
                'Common.Views.ReviewChanges': {
                    'reviewchange:accept':      _.bind(this.onAcceptClick, this),
                    'reviewchange:reject':      _.bind(this.onRejectClick, this),
                    'reviewchange:delete':      _.bind(this.onDeleteClick, this),
                    'reviewchange:preview':     _.bind(this.onBtnPreviewClick, this),
                    'reviewchanges:view':       _.bind(this.onReviewViewClick, this),
                    'lang:document':            _.bind(this.onDocLanguage, this),
                    'collaboration:coauthmode': _.bind(this.onCoAuthMode, this)
                },
                'Common.Views.ReviewChangesDialog': {
                    'reviewchange:accept':      _.bind(this.onAcceptClick, this),
                    'reviewchange:reject':      _.bind(this.onRejectClick, this),
                    'reviewchange:preview':     _.bind(this.onBtnPreviewClick, this)
                },
                'Common.Views.ReviewPopover': {
                    'reviewchange:accept':      _.bind(this.onAcceptClick, this),
                    'reviewchange:reject':      _.bind(this.onRejectClick, this),
                    'reviewchange:delete':      _.bind(this.onDeleteClick, this),
                    'reviewchange:goto':        _.bind(this.onGotoClick, this)
                }
            });
        },
        onLaunch: function () {
            this.collection     =   this.getApplication().getCollection('Common.Collections.ReviewChanges');
            this.userCollection =   this.getApplication().getCollection('Common.Collections.Users');

            this._state = {posx: -1000, posy: -1000, popoverVisible: false, previewMode: false};

            Common.NotificationCenter.on('reviewchanges:turn', this.onTurnPreview.bind(this));
            Common.NotificationCenter.on('spelling:turn', this.onTurnSpelling.bind(this));
            Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            Common.NotificationCenter.on('api:disconnect', _.bind(this.onCoAuthoringDisconnect, this));

            this.userCollection.on('reset', _.bind(this.onUpdateUsers, this));
            this.userCollection.on('add',   _.bind(this.onUpdateUsers, this));
        },
        setConfig: function (data, api) {
            this.setApi(api);

            if (data) {
                this.currentUserId      =   data.config.user.id;
                this.sdkViewName        =   data['sdkviewname'] || this.sdkViewName;
            }
        },
        setApi: function (api) {
            if (api) {
                this.api = api;

                if (this.appConfig.canReview || this.appConfig.canViewReview) {
                    this.api.asc_registerCallback('asc_onShowRevisionsChange', _.bind(this.onApiShowChange, this));
                    this.api.asc_registerCallback('asc_onUpdateRevisionsChangesPosition', _.bind(this.onApiUpdateChangePosition, this));
                }
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',_.bind(this.onCoAuthoringDisconnect, this));
            }
        },

        setMode: function(mode) {
            this.appConfig = mode;
            this.popoverChanges = new Common.Collections.ReviewChanges();
            this.view = this.createView('Common.Views.ReviewChanges', { mode: mode });

            return this;
        },

        SetDisabled: function(state) {
            if (this.dlgChanges)
                this.dlgChanges.close();
            this.view && this.view.SetDisabled(state, this.langs);
            this.setPreviewMode(state);
        },

        setPreviewMode: function(mode) { //disable accept/reject in popover
            if (this.viewmode === mode) return;
            this.viewmode = mode;
            if (mode)
                this.prevcanReview = this.appConfig.canReview;
            this.appConfig.canReview = (mode) ? false : this.prevcanReview;
            var me = this;
            this.popoverChanges && this.popoverChanges.each(function (model) {
                model.set('hint', !me.appConfig.canReview);
            });
        },

        onApiShowChange: function (sdkchange) {
            if (this.getPopover()) {
                if (sdkchange && sdkchange.length>0) {
                    var i = 0,
                        changes = this.readSDKChange(sdkchange),
                        posX = sdkchange[0].get_X(),
                        posY = sdkchange[0].get_Y(),
                        animate = ( Math.abs(this._state.posx-posX)>0.001 || Math.abs(this._state.posy-posY)>0.001) || (sdkchange.length !== this._state.changes_length),
                        lock = (sdkchange[0].get_LockUserId()!==null),
                        lockUser = this.getUserName(sdkchange[0].get_LockUserId());

                    this.getPopover().hideTips();
                    this.popoverChanges.reset(changes);

                    if (animate) {
                        if ( this.getPopover().isVisible() ) this.getPopover().hide();
                        this.getPopover().setLeftTop(posX, posY);
                    }

                    this.getPopover().showReview(animate, lock, lockUser);

                    if (this.appConfig.canReview && !this.appConfig.isReviewOnly && this._state.lock !== lock) {
                        this.view.btnAccept.setDisabled(lock==true);
                        this.view.btnReject.setDisabled(lock==true);
                        if (this.dlgChanges) {
                            this.dlgChanges.btnAccept.setDisabled(lock==true);
                            this.dlgChanges.btnReject.setDisabled(lock==true);
                        }
                        this._state.lock = lock;
                    }
                    this._state.posx = posX;
                    this._state.posy = posY;
                    this._state.changes_length = sdkchange.length;
                    this._state.popoverVisible = true;
                } else if (this._state.popoverVisible){
                    this._state.posx = this._state.posy = -1000;
                    this._state.changes_length = 0;
                    this._state.popoverVisible = false;
                    this.getPopover().hideTips();
                    this.popoverChanges.reset();
                    this.getPopover().hideReview();
                }
            }
        },

        onApiUpdateChangePosition: function (posX, posY) {
            var i, useAnimation = false,
                change = null,
                text = undefined,
                saveTxtId = '',
                saveTxtReplyId = '';

            if (this.getPopover()) {
                if (posY < 0 || this.getPopover().sdkBounds.height < posY) {
                    this.getPopover().hide();
                } else if (this.popoverChanges.length>0) {
                    if (!this.getPopover().isVisible())
                        this.getPopover().show(false);
                    this.getPopover().setLeftTop(posX, posY);
                }
            }
        },

        findChange: function (uid, id) {
            if (_.isUndefined(uid)) {
                return this.collection.findWhere({id: id});
            }

            return this.collection.findWhere({uid: uid});
        },

        getPopover: function () {
            if ((this.appConfig.canReview || this.appConfig.canViewReview) && _.isUndefined(this.popover)) {
                this.popover = Common.Views.ReviewPopover.prototype.getPopover({
                    reviewStore : this.popoverChanges,
                    renderTo : this.sdkViewName
                });
                this.popover.setReviewStore(this.popoverChanges);
            }
            return this.popover;
        },

        // helpers

        readSDKChange: function (data) {
            var me = this, arr = [];
            _.each(data, function(item) {
                var changetext = '', proptext = '',
                    value = item.get_Value(),
                    movetype = item.get_MoveType(),
                    settings = false;
                switch (item.get_Type()) {
                    case Asc.c_oAscRevisionsChangeType.TextAdd:
                        changetext = (movetype==Asc.c_oAscRevisionsMove.NoMove) ? me.textInserted : me.textParaMoveTo;
                        if (typeof value == 'object') {
                            _.each(value, function(obj) {
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
                            changetext +=  (' ' + Common.Utils.String.htmlEncode(value));
                        }
                    break;
                    case Asc.c_oAscRevisionsChangeType.TextRem:
                        changetext = (movetype==Asc.c_oAscRevisionsMove.NoMove) ? me.textDeleted : (item.is_MovedDown() ? me.textParaMoveFromDown : me.textParaMoveFromUp);
                        if (typeof value == 'object') {
                            _.each(value, function(obj) {
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
                            changetext +=  (' ' + Common.Utils.String.htmlEncode(value));
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
                            proptext += (((value.Get_VertAlign()==1) ? me.textSuperScript : ((value.Get_VertAlign()==2) ? me.textSubScript : me.textBaseline)) + ', ');
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
                            proptext = proptext.substring(0, proptext.length-2);
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
                            proptext += (((value.Get_SpacingLineRule()==c_paragraphLinerule.LINERULE_AUTO) ? value.Get_SpacingLine() : Common.Utils.Metric.fnRecalcFromMM(value.Get_SpacingLine()).toFixed(2) + ' ' + Common.Utils.Metric.getCurrentMetricName()) + ', ');
                        }
                        if (value.Get_SpacingBeforeAutoSpacing())
                            proptext += (me.textSpacingBefore + ' ' + me.textAuto +', ');
                        else if (value.Get_SpacingBefore() !== undefined)
                            proptext += (me.textSpacingBefore + ' ' + Common.Utils.Metric.fnRecalcFromMM(value.Get_SpacingBefore()).toFixed(2) + ' ' + Common.Utils.Metric.getCurrentMetricName() + ', ');
                        if (value.Get_SpacingAfterAutoSpacing())
                            proptext += (me.textSpacingAfter + ' ' + me.textAuto +', ');
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
                            proptext = proptext.substring(0, proptext.length-2);
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
                    user = me.userCollection.findOriginalUser(item.get_UserId()),
                    change = new Common.Models.ReviewChange({
                        uid         : Common.UI.getId(),
                        userid      : item.get_UserId(),
                        username    : item.get_UserName(),
                        usercolor   : (user) ? user.get('color') : null,
                        date        : me.dateToLocaleTimeString(date),
                        changetext  : changetext,
                        id          : Common.UI.getId(),
                        lock        : (item.get_LockUserId()!==null),
                        lockuser    : me.getUserName(item.get_LockUserId()),
                        type        : item.get_Type(),
                        changedata  : item,
                        scope       : me.view,
                        hint        : !me.appConfig.canReview,
                        goto        : (item.get_MoveType() == Asc.c_oAscRevisionsMove.MoveTo || item.get_MoveType() == Asc.c_oAscRevisionsMove.MoveFrom),
                        editable    : (item.get_UserId() == me.currentUserId)
                    });

                arr.push(change);
            });
            return arr;
        },

        getUserName: function(id){
            if (this.userCollection && id!==null){
                var rec = this.userCollection.findUser(id);
                if (rec) return rec.get('username');
            }
            return '';
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

        onBtnPreviewClick: function(btn, opts){
            switch (opts) {
                case 'prev': this.api.asc_GetPrevRevisionsChange(); break;
                case 'next': this.api.asc_GetNextRevisionsChange(); break;
            }

            Common.NotificationCenter.trigger('edit:complete', this.view);
        },

        onAcceptClick: function(menu, item, e) {
            if (this.api) {
                if (item) {
                    if (item.value === 'all') {
                        this.api.asc_AcceptAllChanges();
                    } else {
                        this.api.asc_AcceptChanges();
                    }
                } else {
                    this.api.asc_AcceptChanges(menu);
                }
            }
            Common.NotificationCenter.trigger('edit:complete', this.view);
        },

        onRejectClick: function(menu, item, e) {
            if (this.api) {
                if (item) {
                    if (item.value === 'all') {
                        this.api.asc_RejectAllChanges();
                    } else {
                        this.api.asc_RejectChanges();
                    }
                } else {
                    this.api.asc_RejectChanges(menu);
                }
            }
            Common.NotificationCenter.trigger('edit:complete', this.view);
        },

        onDeleteClick: function(change) {
            if (this.api) {
                this.api.asc_RejectChanges(change);
            }
            Common.NotificationCenter.trigger('edit:complete', this.view);
        },

        onGotoClick: function(change) {
            if (this.api) {
                this.api.asc_FollowRevisionMove(change);
            }
            Common.NotificationCenter.trigger('edit:complete', this.view);
        },

        onTurnPreview: function(state) {
            if ( this.appConfig.isReviewOnly ) {
                this.view.turnChanges(true);
            } else
            if ( this.appConfig.canReview ) {
                state = (state == 'on');

                this.api.asc_SetTrackRevisions(state);
                Common.localStorage.setItem(this.view.appPrefix + "track-changes-" + (this.appConfig.fileKey || ''), state ? 1 : 0);

                this.view.turnChanges(state);
            }
        },

        onTurnSpelling: function (state) {
            state = (state == 'on');
            this.view.turnSpelling(state);

            Common.localStorage.setItem(this.view.appPrefix + "settings-spellcheck", state ? 1 : 0);
            this.api.asc_setSpellCheck(state);
            Common.Utils.InternalSettings.set("de-settings-spellcheck", state);
        },

        onReviewViewClick: function(menu, item, e) {
            this.turnDisplayMode(item.value);
            !this.appConfig.canReview && Common.localStorage.setItem(this.view.appPrefix + "review-mode", item.value);
            Common.NotificationCenter.trigger('edit:complete', this.view);
        },

        turnDisplayMode: function(mode) {
            if (this.api) {
                if (mode === 'final')
                    this.api.asc_BeginViewModeInReview(true);
                else if (mode === 'original')
                    this.api.asc_BeginViewModeInReview(false);
                else
                    this.api.asc_EndViewModeInReview();
            }
            this.disableEditing(mode == 'final' || mode == 'original');
            this._state.previewMode = (mode == 'final' || mode == 'original');
        },

        isPreviewChangesMode: function() {
            return this._state.previewMode;
        },

        onCoAuthMode: function(menu, item, e) {
            Common.localStorage.setItem(this.view.appPrefix + "settings-coauthmode", item.value);
            Common.Utils.InternalSettings.set(this.view.appPrefix + "settings-coauthmode", item.value);

            if (this.api) {
                this.api.asc_SetFastCollaborative(item.value==1);

                if (this.api.SetCollaborativeMarksShowType) {
                    var value = Common.localStorage.getItem(item.value ? this.view.appPrefix + "settings-showchanges-fast" : this.view.appPrefix + "settings-showchanges-strict");
                    if (value !== null)
                        this.api.SetCollaborativeMarksShowType(value == 'all' ? Asc.c_oAscCollaborativeMarksShowType.All :
                            value == 'none' ? Asc.c_oAscCollaborativeMarksShowType.None : Asc.c_oAscCollaborativeMarksShowType.LastChanges);
                    else
                        this.api.SetCollaborativeMarksShowType(item.value ? Asc.c_oAscCollaborativeMarksShowType.None : Asc.c_oAscCollaborativeMarksShowType.LastChanges);
                }

                value = Common.localStorage.getItem(this.view.appPrefix + "settings-autosave");
                if (value===null && this.appConfig.customization && this.appConfig.customization.autosave===false)
                    value = 0;
                value = (!item.value && value!==null) ? parseInt(value) : 1;

                Common.localStorage.setItem(this.view.appPrefix + "settings-autosave", value);
                Common.Utils.InternalSettings.set(this.view.appPrefix + "settings-autosave", value);
                this.api.asc_setAutoSaveGap(value);
            }
            Common.NotificationCenter.trigger('edit:complete', this.view);
            this.view.fireEvent('settings:apply', [this]);
        },

        disableEditing: function(disable) {
            var app = this.getApplication();
            app.getController('Toolbar').DisableToolbar(disable, false, true);
            app.getController('DocumentHolder').getView().SetDisabled(disable);

            if (this.appConfig.canReview) {
                app.getController('RightMenu').getView('RightMenu').clearSelection();
                app.getController('RightMenu').SetDisabled(disable, false);
                app.getController('Statusbar').getView('Statusbar').SetDisabled(disable);
                app.getController('Navigation') && app.getController('Navigation').SetDisabled(disable);
                app.getController('Common.Controllers.Plugins').getView('Common.Views.Plugins').disableControls(disable);
            }

            var comments = app.getController('Common.Controllers.Comments');
            if (comments)
                comments.setPreviewMode(disable);

            var leftMenu = app.getController('LeftMenu');
            leftMenu.leftMenu.getMenu('file').miProtect.setDisabled(disable);
            leftMenu.setPreviewMode(disable);

            if (this.view) {
                this.view.$el.find('.no-group-mask').css('opacity', 1);

                this.view.btnsDocLang && this.view.btnsDocLang.forEach(function(button) {
                    if ( button ) {
                        button.setDisabled(disable || !this.langs || this.langs.length<1);
                    }
                }, this);
            }
        },

        createToolbarPanel: function() {
            return this.view.getPanel();
        },

        getView: function(name) {
            return !name && this.view ?
                this.view : Backbone.Controller.prototype.getView.call(this, name);
        },

        onAppReady: function (config) {
            var me = this;
            if ( me.view && Common.localStorage.getBool(me.view.appPrefix + "settings-spellcheck", true) )
                me.view.turnSpelling(true);

            if ( config.canReview ) {
                (new Promise(function (resolve) {
                    resolve();
                })).then(function () {
                    function _setReviewStatus(state) {
                        me.view.turnChanges(state);
                        me.api.asc_SetTrackRevisions(state);
                    };

                    var state = config.isReviewOnly || Common.localStorage.getBool(me.view.appPrefix + "track-changes-" + (config.fileKey || ''));
                    me.api.asc_HaveRevisionsChanges() && me.view.markChanges(true);
                    _setReviewStatus(state);

                    if ( typeof (me.appConfig.customization) == 'object' && (me.appConfig.customization.showReviewChanges==true) ) {
                        me.dlgChanges = (new Common.Views.ReviewChangesDialog({
                            popoverChanges  : me.popoverChanges,
                            mode            : me.appConfig
                        }));
                        var sdk = $('#editor_sdk'),
                            offset = sdk.offset();
                        me.dlgChanges.show(Math.max(10, offset.left + sdk.width() - 300), Math.max(10, offset.top + sdk.height() - 150));
                    }
                });
            } else if (config.canViewReview) {
                config.canViewReview = me.api.asc_HaveRevisionsChanges(true); // check revisions from all users
                if (config.canViewReview) {
                    var val = Common.localStorage.getItem(me.view.appPrefix + "review-mode");
                    if (val===null)
                        val = me.appConfig.customization && /^(original|final|markup)$/i.test(me.appConfig.customization.reviewDisplay) ? me.appConfig.customization.reviewDisplay.toLocaleLowerCase() : 'original';
                    me.turnDisplayMode(config.isRestrictedEdit ? 'markup' : val); // load display mode only in viewer
                    me.view.turnDisplayMode(config.isRestrictedEdit ? 'markup' : val);
                }
            }

            if (me.view && me.view.btnChat) {
                me.getApplication().getController('LeftMenu').leftMenu.btnChat.on('toggle', function(btn, state){
                    if (state !== me.view.btnChat.pressed)
                        me.view.turnChat(state);
                });

            }
        },

        applySettings: function(menu) {
            this.view && this.view.turnSpelling( Common.localStorage.getBool(this.view.appPrefix + "settings-spellcheck", true) );
            this.view && this.view.turnCoAuthMode( Common.localStorage.getBool(this.view.appPrefix + "settings-coauthmode", true) );
        },

        synchronizeChanges: function() {
            if ( this.appConfig && this.appConfig.canReview ) {
                this.view.markChanges( this.api.asc_HaveRevisionsChanges() );
            }
        },

        setLanguages: function (array) {
            this.langs = array;
            this.view && this.view.btnsDocLang && this.view.btnsDocLang.forEach(function(button) {
                if ( button ) {
                    button.setDisabled(this.langs.length<1);
                }
            }, this);
        },

        onDocLanguage: function() {
            var me = this;
            (new Common.Views.LanguageDialog({
                languages: me.langs,
                current: me.api.asc_getDefaultLanguage(),
                handler: function(result, value) {
                    if (result=='ok') {
                        var record = _.findWhere(me.langs, {'value':value});
                        record && me.api.asc_setDefaultLanguage(record.code);
                    }
                }
            })).show();
        },

        onLostEditRights: function() {
            this.view && this.view.onLostEditRights();
        },

        onCoAuthoringDisconnect: function() {
            this.SetDisabled(true);
        },

        onUpdateUsers: function() {
            var users = this.userCollection;
            this.popoverChanges && this.popoverChanges.each(function (model) {
                var user = users.findOriginalUser(model.get('userid'));
                model.set('usercolor', (user) ? user.get('color') : null);
            });
        },

        textInserted: '<b>Inserted:</b>',
        textDeleted: '<b>Deleted:</b>',
        textParaInserted: '<b>Paragraph Inserted</b> ',
        textParaDeleted: '<b>Paragraph Deleted</b> ',
        textFormatted: 'Formatted',
        textParaFormatted: 'Paragraph Formatted',
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
        textFontSize: 'Font size',
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
        textParaMoveFromDown: '<b>Moved Down:</b>'
    }, Common.Controllers.ReviewChanges || {}));
});