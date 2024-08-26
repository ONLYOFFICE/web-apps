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
 *  ReviewChanges.js
 *
 *  Created on 05.08.15
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
    'common/main/lib/view/ReviewPopover'
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
                'LeftMenu': {
                    'comments:show': _.bind(this.commentsShowHide, this, 'show'),
                    'comments:hide': _.bind(this.commentsShowHide, this, 'hide')
                },
                'Common.Views.ReviewChanges': {
                    'reviewchange:accept':      _.bind(this.onAcceptClick, this),
                    'reviewchange:reject':      _.bind(this.onRejectClick, this),
                    'reviewchange:delete':      _.bind(this.onDeleteClick, this),
                    'reviewchange:preview':     _.bind(this.onBtnPreviewClick, this),
                    'reviewchange:view':        _.bind(this.onReviewViewClick, this),
                    'reviewchange:compare':     _.bind(this.onCompareClick, this),
                    'reviewchange:combine':     _.bind(this.onCombineClick, this),
                    'lang:document':            _.bind(this.onDocLanguage, this),
                    'collaboration:coauthmode': _.bind(this.onCoAuthMode, this),
                    'protect:update':           _.bind(this.onChangeProtectDocument, this)
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
                },
                'ViewTab': {
                    'viewmode:change': _.bind(this.onChangeViewMode, this)
                }
            });
        },
        onLaunch: function () {
            this.collection     =   this.getApplication().getCollection('Common.Collections.ReviewChanges');
            this.userCollection =   this.getApplication().getCollection('Common.Collections.Users');
            this.viewmode = false;
            var filter = Common.localStorage.getKeysFilter();
            this.appPrefix = (filter && filter.length) ? filter.split(',')[0] : '';

            this._state = { posx: -1000, posy: -1000, popoverVisible: false, previewMode: false, compareSettings: null, wsLock: false, wsProps: [],
                            displayMode: Asc.c_oAscDisplayModeInReview.Edit,
                            disableEditing: false, // disable editing when disconnect/signed file/mail merge preview/review final or original/forms preview
                            docProtection: {
                                isReadOnly: false,
                                isReviewOnly: false,
                                isFormsOnly: false,
                                isCommentsOnly: false
                            },
                            sdkchange: null
                          };

            Common.NotificationCenter.on('reviewchanges:turn', this.onTurnPreview.bind(this));
            Common.NotificationCenter.on('spelling:turn', this.onTurnSpelling.bind(this));
            Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            Common.NotificationCenter.on('api:disconnect', _.bind(this.onCoAuthoringDisconnect, this));
            Common.NotificationCenter.on('collaboration:sharing', this.changeAccessRights.bind(this));
            Common.NotificationCenter.on('collaboration:sharingdeny', this.onLostEditRights.bind(this));
            Common.NotificationCenter.on('protect:wslock', _.bind(this.onChangeProtectSheet, this));
            Common.NotificationCenter.on('mentions:setusers', this.avatarsUpdate.bind(this));

            this.userCollection.on({
                add     : _.bind(this.onUpdateUsers, this),
                change  : _.bind(this.onUpdateUsers, this),
                reset   : _.bind(this.onUpdateUsers, this)
            });

        },
        setConfig: function (data, api) {
            this.setApi(api);

            if (data) {
                this.currentUserId      =   data.config.user.id;
                this.sdkViewName        =   data['sdkviewname'] || this.sdkViewName;
            }
            return this;
        },
        setApi: function (api) {
            if (api) {
                this.api = api;

                if (this.appConfig.canReview || this.appConfig.canViewReview) {
                    this.api.asc_registerCallback('asc_onShowRevisionsChange', _.bind(this.onApiShowChange, this));
                    this.api.asc_registerCallback('asc_onUpdateRevisionsChangesPosition', _.bind(this.onApiUpdateChangePosition, this));
                    this.api.asc_registerCallback('asc_onAuthParticipantsChanged', _.bind(this.onAuthParticipantsChanged, this));
                    this.api.asc_registerCallback('asc_onParticipantsChanged',     _.bind(this.onAuthParticipantsChanged, this));
                    this.api.asc_registerCallback('asc_onChangeDisplayModeInReview',   _.bind(this.onChangeDisplayModeInReview, this));
                }
                if (this.appConfig.canReview)
                    this.api.asc_registerCallback('asc_onOnTrackRevisionsChange', _.bind(this.onApiTrackRevisionsChange, this));
                this.api.asc_registerCallback('asc_onAcceptChangesBeforeCompare',_.bind(this.onAcceptChangesBeforeCompare, this));
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',_.bind(this.onCoAuthoringDisconnect, this));

                Common.Gateway.on('setrevisedfile', _.bind(this.setRevisedFile, this));
                if (this.appConfig.canFeatureComparison) {
                    Common.NotificationCenter.on('storage:document-load', _.bind(this.openDocumentFromStorage, this));
                    Common.NotificationCenter.on('storage:document-insert', _.bind(this.insertDocumentFromStorage, this));
                    Common.Gateway.on('setrequesteddocument', _.bind(this.setRequestedDocument, this));
                }
            }
        },

        setMode: function(mode) {
            this.appConfig = mode;
            this.popoverChanges = new Common.Collections.ReviewChanges();
            this.view = this.createView('Common.Views.ReviewChanges', { mode: mode });

            if (!!this.appConfig.sharingSettingsUrl && this.appConfig.sharingSettingsUrl.length || this.appConfig.canRequestSharingSettings) {
                Common.Gateway.on('showsharingsettings', _.bind(this.changeAccessRights, this));
                Common.Gateway.on('setsharingsettings', _.bind(this.setSharingSettings, this));
            }

            return this;
        },

        loadDocument: function(data) {
            this.document = data.doc;
        },

        SetDisabled: function(state, reviewMode, fillFormMode) {
            if (this.dlgChanges)
                this.dlgChanges.close();
            if (reviewMode) {
                this.lockToolbar(Common.enumLock.previewReviewMode, state);
                this.dlgChanges && Common.Utils.lockControls(Common.enumLock.previewReviewMode, state, {array: [this.dlgChanges.btnAccept, this.dlgChanges.btnReject]});
            } else if (fillFormMode) {
                this.lockToolbar(Common.enumLock.viewFormMode, state);
                this.dlgChanges && Common.Utils.lockControls(Common.enumLock.viewFormMode, state, {array: [this.dlgChanges.btnAccept, this.dlgChanges.btnReject]});
            } else {
                this.lockToolbar(Common.enumLock.viewMode, state);
            }
            this.setPreviewMode(state);
        },

        lockToolbar: function (causes, lock, opts) {
            this.view && Common.Utils.lockControls(causes, lock, opts, this.view.getButtons());
        },

        setPreviewMode: function(mode) { //disable accept/reject in popover
            this._state.disableEditing = mode;
            this.updatePreviewMode();
        },

        updatePreviewMode: function() {
            var viewmode = this._state.disableEditing || this._state.docProtection.isReadOnly || this._state.docProtection.isFormsOnly || this._state.docProtection.isCommentsOnly;

            if (this.viewmode === viewmode) return;
            this.viewmode = viewmode;
            if (viewmode)
                this.prevcanReview = this.appConfig.canReview;
            this.appConfig.canReview = (viewmode) ? false : this.prevcanReview;
            var me = this;
            this.popoverChanges && this.popoverChanges.each(function (model) {
                model.set('hint', !me.appConfig.canReview);
            });
        },

        isSelectedChangesLocked: function(changes, isShow) {
            if (!changes || changes.length<1) return true;

            if (isShow)
                return changes[0].get('lock') || !changes[0].get('editable');

            for (var i=0; i<changes.length; i++) {
                var change = changes[i];
                if (change.get('lock') || !change.get('editable'))
                    return true; // lock button if at least one change is locked
            }
            return false;
        },

        onApiShowChange: function (sdkchange, isShow) {
            var btnlock = true,
                changes;
            this._state.sdkchange = sdkchange;
            if (this.appConfig.canReview && !(this.appConfig.isReviewOnly || this._state.docProtection.isReviewOnly)) {
                if (sdkchange && sdkchange.length>0) {
                    changes = this.readSDKChange(sdkchange);
                    btnlock = this.isSelectedChangesLocked(changes, isShow);
                }
                if (this._state.lock !== btnlock) {
                    // Common.Utils.lockControls(Common.enumLock.reviewChangelock, btnlock, {array: [this.view.btnAccept, this.view.btnReject]});
                    this.dlgChanges && Common.Utils.lockControls(Common.enumLock.reviewChangelock, btnlock, {array: [this.dlgChanges.btnAccept, this.dlgChanges.btnReject]});
                    this._state.lock = btnlock;
                    Common.Utils.InternalSettings.set(this.appPrefix + "accept-reject-lock", btnlock);
                }
            }

            if (this.getPopover()) {
                if (!this.appConfig.reviewHoverMode && (this._state.displayMode !== Asc.c_oAscDisplayModeInReview.Simple) && sdkchange && sdkchange.length>0 && isShow) { // show changes balloon only for current position, not selection
                    var i = 0,
                        posX = sdkchange[0].get_X(),
                        posY = sdkchange[0].get_Y(),
                        animate = ( Math.abs(this._state.posx-posX)>0.001 || Math.abs(this._state.posy-posY)>0.001) || (sdkchange.length !== this._state.changes_length),
                        lock = (sdkchange[0].get_LockUserId()!==null),
                        lockUser = this.getUserName(sdkchange[0].get_LockUserId());

                    this.getPopover().hideTips();
                    this.popoverChanges.reset(changes || this.readSDKChange(sdkchange));

                    if (animate) {
                        if ( this.getPopover().isVisible() ) this.getPopover().hide();
                        this.getPopover().setLeftTop(posX, posY);
                    }

                    this.getPopover().showReview(animate, lock, lockUser);
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
                    renderTo : this.sdkViewName,
                    canRequestUsers: (this.appConfig) ? this.appConfig.canRequestUsers : undefined,
                    canRequestSendNotify: (this.appConfig) ? this.appConfig.canRequestSendNotify : undefined,
                    mentionShare: (this.appConfig) ? this.appConfig.mentionShare : true,
                    api: this.api
                });
                this.popover.setReviewStore(this.popoverChanges);
            }
            return this.popover;
        },

        // helpers

        readSDKChange: function (data) {
            var me = this, arr = [], arrIds = [],
                cmm = Common.Utils.String.textComma + ' ';
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
                            proptext += ((value.Get_Bold() ? '' : me.textNot) + me.textBold + cmm);
                        if (value.Get_Italic() !== undefined)
                            proptext += ((value.Get_Italic() ? '' : me.textNot) + me.textItalic + cmm);
                        if (value.Get_Underline() !== undefined)
                            proptext += ((value.Get_Underline() ? '' : me.textNot) + me.textUnderline + cmm);
                        if (value.Get_Strikeout() !== undefined)
                            proptext += ((value.Get_Strikeout() ? '' : me.textNot) + me.textStrikeout + cmm);
                        if (value.Get_DStrikeout() !== undefined)
                            proptext += ((value.Get_DStrikeout() ? '' : me.textNot) + me.textDStrikeout + cmm);
                        if (value.Get_Caps() !== undefined)
                            proptext += ((value.Get_Caps() ? '' : me.textNot) + me.textCaps + cmm);
                        if (value.Get_SmallCaps() !== undefined)
                            proptext += ((value.Get_SmallCaps() ? '' : me.textNot) + me.textSmallCaps + cmm);
                        if (value.Get_VertAlign() !== undefined)
                            proptext += (((value.Get_VertAlign()===Asc.vertalign_SuperScript) ? me.textSuperScript : ((value.Get_VertAlign()===Asc.vertalign_SubScript) ? me.textSubScript : me.textBaseline)) + cmm);
                        if (value.Get_Color() !== undefined)
                            proptext += (me.textColor + cmm);
                        if (value.Get_Highlight() !== undefined)
                            proptext += (me.textHighlight + cmm);
                        if (value.Get_Shd() !== undefined)
                            proptext += (me.textShd + cmm);
                        if (value.Get_FontFamily() !== undefined)
                            proptext += (value.Get_FontFamily() + cmm);
                        if (value.Get_FontSize() !== undefined)
                            proptext += (value.Get_FontSize() + cmm);
                        if (value.Get_Spacing() !== undefined)
                            proptext += (me.textSpacing + ' ' + Common.Utils.Metric.fnRecalcFromMM(value.Get_Spacing()).toFixed(2) + ' ' + Common.Utils.Metric.getCurrentMetricName() + cmm);
                        if (value.Get_Position() !== undefined)
                            proptext += (me.textPosition + ' ' + Common.Utils.Metric.fnRecalcFromMM(value.Get_Position()).toFixed(2) + ' ' + Common.Utils.Metric.getCurrentMetricName() + cmm);
                        if (value.Get_Lang() !== undefined)
                            proptext += (Common.util.LanguageInfo.getLocalLanguageName(value.Get_Lang())[1] + cmm);

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
                            proptext += ((value.Get_ContextualSpacing() ? me.textContextual : me.textNoContextual) + cmm);
                        if (value.Get_IndLeft() !== undefined)
                            proptext += (me.textIndentLeft + ' ' + Common.Utils.Metric.fnRecalcFromMM(value.Get_IndLeft()).toFixed(2) + ' ' + Common.Utils.Metric.getCurrentMetricName() + cmm);
                        if (value.Get_IndRight() !== undefined)
                            proptext += (me.textIndentRight + ' ' + Common.Utils.Metric.fnRecalcFromMM(value.Get_IndRight()).toFixed(2) + ' ' + Common.Utils.Metric.getCurrentMetricName() + cmm);
                        if (value.Get_IndFirstLine() !== undefined)
                            proptext += (me.textFirstLine + ' ' + Common.Utils.Metric.fnRecalcFromMM(value.Get_IndFirstLine()).toFixed(2) + ' ' + Common.Utils.Metric.getCurrentMetricName() + cmm);
                        if (value.Get_Jc() !== undefined) {
                            switch (value.Get_Jc()) {
                                case 0:
                                    proptext += (me.textRight + cmm);
                                    break;
                                case 1:
                                    proptext += (me.textLeft + cmm);
                                    break;
                                case 2:
                                    proptext += (me.textCenter + cmm);
                                    break;
                                case 3:
                                    proptext += (me.textJustify + cmm);
                                    break;

                            }
                        }
                        if (value.Get_KeepLines() !== undefined)
                            proptext += ((value.Get_KeepLines() ? me.textKeepLines : me.textNoKeepLines) + cmm);
                        if (value.Get_KeepNext())
                            proptext += ((value.Get_KeepNext() ? me.textKeepNext : me.textNoKeepNext) + cmm);
                        if (value.Get_PageBreakBefore())
                            proptext += ((value.Get_PageBreakBefore() ? me.textBreakBefore : me.textNoBreakBefore) + cmm);
                        if (value.Get_SpacingLineRule() !== undefined && value.Get_SpacingLine() !== undefined) {
                            proptext += me.textLineSpacing;
                            proptext += (((value.Get_SpacingLineRule() == c_paragraphLinerule.LINERULE_LEAST) ? me.textAtLeast : ((value.Get_SpacingLineRule() == c_paragraphLinerule.LINERULE_AUTO) ? me.textMultiple : me.textExact)) + ' ');
                            proptext += (((value.Get_SpacingLineRule()==c_paragraphLinerule.LINERULE_AUTO) ? value.Get_SpacingLine() : Common.Utils.Metric.fnRecalcFromMM(value.Get_SpacingLine()).toFixed(2) + ' ' + Common.Utils.Metric.getCurrentMetricName()) + cmm);
                        }
                        if (value.Get_SpacingBeforeAutoSpacing())
                            proptext += (me.textSpacingBefore + ' ' + me.textAuto +cmm);
                        else if (value.Get_SpacingBefore() !== undefined)
                            proptext += (me.textSpacingBefore + ' ' + Common.Utils.Metric.fnRecalcFromMM(value.Get_SpacingBefore()).toFixed(2) + ' ' + Common.Utils.Metric.getCurrentMetricName() + cmm);
                        if (value.Get_SpacingAfterAutoSpacing())
                            proptext += (me.textSpacingAfter + ' ' + me.textAuto +cmm);
                        else if (value.Get_SpacingAfter() !== undefined)
                            proptext += (me.textSpacingAfter + ' ' + Common.Utils.Metric.fnRecalcFromMM(value.Get_SpacingAfter()).toFixed(2) + ' ' + Common.Utils.Metric.getCurrentMetricName() + cmm);
                        if (value.Get_WidowControl())
                            proptext += ((value.Get_WidowControl() ? me.textWidow : me.textNoWidow) + cmm);
                        if (value.Get_Tabs() !== undefined)
                            proptext += (me.textTabs + cmm);
                        if (value.Get_NumPr() !== undefined)
                            proptext += (me.textNum + cmm);
                        if (value.Get_PStyle() !== undefined) {
                            var style = me.api.asc_GetStyleNameById(value.Get_PStyle());
                            if (!_.isEmpty(style)) proptext += (style + cmm);
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
                    isProtectedReview = me._state.docProtection.isReviewOnly,
                    avatar = Common.UI.ExternalUsers.getImage(item.get_UserId()),
                    change = new Common.Models.ReviewChange({
                        uid         : Common.UI.getId(),
                        userid      : item.get_UserId(),
                        username    : item.get_UserName(),
                        usercolor   : (user) ? user.get('color') : Common.UI.ExternalUsers.getColor(item.get_UserId() || item.get_UserName()),
                        initials    : Common.Utils.getUserInitials(AscCommon.UserInfoParser.getParsedName(item.get_UserName())),
                        avatar      : avatar,
                        date        : me.dateToLocaleTimeString(date),
                        changetext  : changetext,
                        id          : Common.UI.getId(),
                        lock        : (item.get_LockUserId()!==null),
                        lockuser    : me.getUserName(item.get_LockUserId()),
                        type        : item.get_Type(),
                        changedata  : item,
                        scope       : me.view,
                        hint        : !me.appConfig.canReview,
                        docProtection: me._state.docProtection,
                        goto        : (item.get_MoveType() == Asc.c_oAscRevisionsMove.MoveTo || item.get_MoveType() == Asc.c_oAscRevisionsMove.MoveFrom),
                        editable    : (me.appConfig.isReviewOnly || isProtectedReview) && (item.get_UserId() == me.currentUserId) || !(me.appConfig.isReviewOnly || isProtectedReview) && (!me.appConfig.canUseReviewPermissions || AscCommon.UserInfoParser.canEditReview(item.get_UserName()))
                    });

                arr.push(change);
                (avatar===undefined) && arrIds.push(item.get_UserId());
            });
            arrIds.length && Common.UI.ExternalUsers.get('info', arrIds);
            return arr;
        },

        getUserName: function(id){
            if (this.userCollection && id!==null){
                var rec = this.userCollection.findUser(id);
                if (rec) return AscCommon.UserInfoParser.getParsedName(rec.get('username'));
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

            var lang = (this.appConfig ? this.appConfig.lang || 'en' : 'en').replace('_', '-').toLowerCase();
            try {
                if ( lang == 'ar-SA'.toLowerCase() ) lang = lang + '-u-nu-latn-ca-gregory';
                return date.toLocaleString(lang, {dateStyle: 'short', timeStyle: 'short'});
            } catch (e) {
                lang = 'en';
                return date.toLocaleString(lang, {dateStyle: 'short', timeStyle: 'short'});
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
                        this._state.lock ? this.api.asc_GetNextRevisionsChange() : this.api.asc_AcceptChangesBySelection(true); // accept and move to the next change
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
                        this._state.lock ? this.api.asc_GetNextRevisionsChange() : this.api.asc_RejectChangesBySelection(true); // reject and move to the next change
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

        onTurnPreview: function(state, global, fromApi) {
            if ( this.appConfig.isReviewOnly) {
                this.view.turnChanges(true);
            } else
            if ( this.appConfig.canReview ) {
                state = (state=='off') ? false : state; // support of prev. version (on/off)
                if (!!global) {
                    this.api.asc_SetLocalTrackRevisions(null);
                    this.api.asc_SetGlobalTrackRevisions(!!state);
                } else
                    this.api.asc_SetLocalTrackRevisions(!!state);
            }
        },

        onApiTrackRevisionsChange: function(localFlag, globalFlag, userId) {
            if ( this.appConfig.isReviewOnly || this._state.docProtection.isReviewOnly) {
                this.view.turnChanges(true);
            } else
            if ( this.appConfig.canReview ) {
                var global = (localFlag===null),
                    state = global ? globalFlag : localFlag;
                Common.Utils.InternalSettings.set(this.appPrefix + "track-changes", (state ? 0 : 1) + (global ? 2 : 0));
                this.view.turnChanges(state, global);
                if (userId && this.userCollection) {
                    var rec = this.userCollection.findOriginalUser(userId);
                    rec && Common.NotificationCenter.trigger('showmessage', {msg: Common.Utils.String.format(globalFlag ? this.textOnGlobal : this.textOffGlobal, AscCommon.UserInfoParser.getParsedName(rec.get('username')))},
                                                                            {timeout: 5000, hideCloseTip: true});
                }
            }
        },

        onTurnSpelling: function (state, suspend) {
            state = (state == 'on');
            this.view && this.view.turnSpelling(state);

            if (Common.UI.FeaturesManager.canChange('spellcheck') && !suspend) {
                Common.localStorage.setItem(this.appPrefix + "settings-spellcheck", state ? 1 : 0);
                this.api.asc_setSpellCheck(state);
                Common.Utils.InternalSettings.set(this.appPrefix + "settings-spellcheck", state);
            }
        },

        onReviewViewClick: function(menu, item, e) {
            this.turnDisplayMode(item.value);
            if (!this.appConfig.isEdit && !this.appConfig.isRestrictedEdit)
                Common.localStorage.setItem(this.appPrefix + "review-mode", item.value); // for viewer
            else if (item.value=='markup' || item.value=='simple') {
                Common.localStorage.setItem(this.appPrefix + "review-mode-editor", item.value); // for editor save only markup modes
                Common.Utils.InternalSettings.set(this.appPrefix + "review-mode-editor", item.value);
            }
            Common.NotificationCenter.trigger('edit:complete', this.view);
        },

        onCompareClick: function(item) {
            if (this.api) {
                var me = this;
                if (!this._state.compareSettings) {
                    this._state.compareSettings = new AscCommonWord.ComparisonOptions();
                    this._state.compareSettings.putWords(!Common.localStorage.getBool("de-compare-char"));
                }
                if (item === 'file') {
                    if (this.api)
                        setTimeout(function() {me.api.asc_CompareDocumentFile(me._state.compareSettings);}, 1);
                    Common.NotificationCenter.trigger('edit:complete', this.view);
                } else if (item === 'url') {
                    (new Common.Views.ImageFromUrlDialog({
                        label: me.textUrl,
                        handler: function(result, value) {
                            if (result == 'ok') {
                                if (me.api) {
                                    var checkUrl = value.replace(/ /g, '');
                                    if (!_.isEmpty(checkUrl)) {
                                        me.api.asc_CompareDocumentUrl(checkUrl, me._state.compareSettings);
                                    }
                                }
                                Common.NotificationCenter.trigger('edit:complete', me.view);
                            }
                        }
                    })).show();
                } else if (item === 'storage') {
                    Common.NotificationCenter.trigger('storage:document-load', 'compare');
                } else if (item === 'settings') {
                    var value = me._state.compareSettings ? me._state.compareSettings.getWords() : true;
                    (new Common.Views.OptionsDialog({
                        title: me.textTitleComparison,
                        items: [
                            {caption: me.textChar, value: false, checked: (value===false)},
                            {caption: me.textWord, value: true, checked: (value!==false)}
                        ],
                        label: me.textShow,
                        handler: function (dlg, result) {
                            if (result=='ok') {
                                me._state.compareSettings = new AscCommonWord.ComparisonOptions();
                                me._state.compareSettings.putWords(dlg.getSettings());
                            }
                            Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                        }
                    })).show();
                }
            }
            Common.NotificationCenter.trigger('edit:complete', this.view);
        },

        onCombineClick: function(item) {
            if(this.api) {
                var me = this;
                if (!this._state.compareSettings) {
                    this._state.compareSettings = new AscCommonWord.ComparisonOptions();
                    this._state.compareSettings.putWords(!Common.localStorage.getBool("de-compare-char"));
                }
                if (item === 'file') {
                    setTimeout(function() {me.api.asc_MergeDocumentFile(me._state.compareSettings);}, 1);
                    Common.NotificationCenter.trigger('edit:complete', this.view);
                } else if (item === 'url') {
                    (new Common.Views.ImageFromUrlDialog({
                        label: me.textUrl,
                        handler: function(result, value) {
                            if (result == 'ok') {
                                if (me.api) {
                                    var checkUrl = value.replace(/ /g, '');
                                    if (!_.isEmpty(checkUrl)) {
                                        me.api.asc_MergeDocumentUrl(checkUrl, me._state.compareSettings);
                                    }
                                }
                                Common.NotificationCenter.trigger('edit:complete', me.view);
                            }
                        }
                    })).show();
                } else if (item === 'storage') {
                    Common.NotificationCenter.trigger('storage:document-load', 'combine');
                }
            }
            Common.NotificationCenter.trigger('edit:complete', this.view);
        },

        setRevisedFile: function(data) {
            data && (data.c = 'compare');
            this.setRequestedDocument(data);
        },

        onAcceptChangesBeforeCompare: function(callback) {
            var me = this;
            Common.UI.warning({
                width: 550,
                msg: this.textAcceptBeforeCompare,
                buttons: ['yes', 'no'],
                primary: 'yes',
                callback: function(result) {
                    _.defer(function() {
                        if (callback) callback(result=='yes');
                    });
                    Common.NotificationCenter.trigger('edit:complete', this.view);
                }
            });
        },

        openDocumentFromStorage: function(type) {
            var me = this;
            if (this.appConfig.canRequestSelectDocument) {
                Common.Gateway.requestSelectDocument(type);
            } else if (this.appConfig.canRequestCompareFile) {
                console.log("Obsolete: The 'onRequestCompareFile' event is deprecated. Please use 'onRequestSelectDocument' event instead.");
                Common.Gateway.requestCompareFile();
            } else {
                (new Common.Views.SelectFileDlg({
                    fileChoiceUrl: this.appConfig.fileChoiceUrl.replace("{fileExt}", "").replace("{documentType}", "DocumentsOnly")
                })).on('selectfile', function(obj, file){
                    file && (file.c = type);
                    me.setRequestedDocument(file);
                }).show();
            }
        },

        setRequestedDocument: function(data) { // gateway
            Common.NotificationCenter.trigger('storage:document-insert', data);
        },

        insertDocumentFromStorage: function(data) {
            if (data && data.url && (data.c==='compare' || data.c==='combine' || data.c==='insert-text')) {
                if (!this._state.compareSettings) {
                    this._state.compareSettings = new AscCommonWord.ComparisonOptions();
                    this._state.compareSettings.putWords(!Common.localStorage.getBool("de-compare-char"));
                }
                (data.c==='compare') && this.api.asc_CompareDocumentUrl(data.url, this._state.compareSettings, data.token);
                (data.c==='combine') && this.api.asc_MergeDocumentUrl(data.url, this._state.compareSettings, data.token);
                (data.c==='insert-text') && this.api.asc_insertTextFromUrl(data.url, data.token);
            }
        },

        turnDisplayMode: function(mode) {
            if (this.api) {
                var type = Asc.c_oAscDisplayModeInReview.Edit;
                switch (mode) {
                    case 'final':
                        type = Asc.c_oAscDisplayModeInReview.Final;
                        break;
                    case 'original':
                        type = Asc.c_oAscDisplayModeInReview.Original;
                        break;
                    case 'simple':
                        type = Asc.c_oAscDisplayModeInReview.Simple;
                        break;
                }
                this._state.displayMode = type;
                this.api.asc_SetDisplayModeInReview(type);
            }
            this.disableEditing(mode == 'final' || mode == 'original');
            this._state.previewMode = (mode == 'final' || mode == 'original');
        },

        onChangeDisplayModeInReview: function(type) {
            this.disableEditing(type===Asc.c_oAscDisplayModeInReview.Final || type===Asc.c_oAscDisplayModeInReview.Original);
            this._state.displayMode = type;
            var mode = 'markup';
            switch (type) {
                case Asc.c_oAscDisplayModeInReview.Final:
                    mode = 'final';
                    break;
                case Asc.c_oAscDisplayModeInReview.Original:
                    mode = 'original';
                    break;
                case Asc.c_oAscDisplayModeInReview.Simple:
                    mode = 'simple';
                    break;
            }
            this.view && this.view.turnDisplayMode(mode);
            this._state.previewMode = (type===Asc.c_oAscDisplayModeInReview.Final || type===Asc.c_oAscDisplayModeInReview.Original);
        },

        isPreviewChangesMode: function() {
            return this._state.previewMode;
        },

        onCoAuthMode: function(menu, item, e) {
            Common.localStorage.setItem(this.appPrefix + "settings-coauthmode", item.value);
            Common.Utils.InternalSettings.set(this.appPrefix + "settings-coauthmode", item.value);

            if (this.api) {
                this.api.asc_SetFastCollaborative(item.value==1);

                if (this.api.SetCollaborativeMarksShowType) {
                    var value = Common.localStorage.getItem(item.value ? this.appPrefix + "settings-showchanges-fast" : this.appPrefix + "settings-showchanges-strict");
                    if (value !== null)
                        this.api.SetCollaborativeMarksShowType(value == 'all' ? Asc.c_oAscCollaborativeMarksShowType.All :
                            value == 'none' ? Asc.c_oAscCollaborativeMarksShowType.None : Asc.c_oAscCollaborativeMarksShowType.LastChanges);
                    else
                        this.api.SetCollaborativeMarksShowType(item.value ? Asc.c_oAscCollaborativeMarksShowType.None : Asc.c_oAscCollaborativeMarksShowType.LastChanges);
                }

                value = Common.localStorage.getItem(this.appPrefix + "settings-autosave");
                if (value===null && this.appConfig.customization && this.appConfig.customization.autosave===false)
                    value = 0;
                value = (!item.value && value!==null) ? parseInt(value) : 1;

                Common.localStorage.setItem(this.appPrefix + "settings-autosave", value);
                Common.Utils.InternalSettings.set(this.appPrefix + "settings-autosave", value);
                this.api.asc_setAutoSaveGap(value);
            }
            Common.NotificationCenter.trigger('edit:complete', this.view);
            this.view.fireEvent('settings:apply', [this]);
        },

        disableEditing: function(disable) {
            Common.NotificationCenter.trigger('editing:disable', disable, {
                viewMode: false,
                reviewMode: true,
                fillFormMode: false,
                viewDocMode: false,
                allowMerge: false,
                allowSignature: false,
                allowProtect: false,
                rightMenu: {clear: disable, disable: true},
                statusBar: true,
                leftMenu: {disable: false, previewMode: true},
                fileMenu: {protect: true, info: true},
                navigation: {disable: false, previewMode: true},
                comments: {disable: false, previewMode: true},
                chat: false,
                review: true,
                viewport: false,
                documentHolder: {clear: false, disable: true},
                toolbar: true,
                plugins: true,
                protect: true,
                header: {docmode: true}
            }, 'review');
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
            (new Promise(function (resolve) {
                resolve();
            })).then(function () {
                if ( config.canReview ) {
                    // function _setReviewStatus(state, global) {
                    //     me.view.turnChanges(state, global);
                    //     !global && me.api.asc_SetLocalTrackRevisions(state);
                    //     Common.Utils.InternalSettings.set(me.appPrefix + "track-changes", (state ? 0 : 1) + (global ? 2 : 0));
                    // };

                    var trackChanges = me.appConfig.customization && me.appConfig.customization.review ? me.appConfig.customization.review.trackChanges : undefined;
                    (trackChanges===undefined) && (trackChanges = me.appConfig.customization ? me.appConfig.customization.trackChanges : undefined);

                    if (config.isReviewOnly || trackChanges!==undefined)
                        me.api.asc_SetLocalTrackRevisions(config.isReviewOnly || trackChanges===true);
                    else
                        me.onApiTrackRevisionsChange(me.api.asc_GetLocalTrackRevisions(), me.api.asc_GetGlobalTrackRevisions());
                    me.api.asc_HaveRevisionsChanges() && me.view.markChanges(true);

                    var val = Common.localStorage.getItem(me.appPrefix + "review-mode-editor");
                    if (val===null) {
                        val = me.appConfig.customization && me.appConfig.customization.review ? me.appConfig.customization.review.reviewDisplay : undefined;
                        !val && (val = me.appConfig.customization ? me.appConfig.customization.reviewDisplay : undefined);
                        val = /^(original|final|markup|simple)$/i.test(val) ? val.toLocaleLowerCase() : 'markup';
                    }
                    Common.Utils.InternalSettings.set(me.appPrefix + "review-mode-editor", val);
                    me.turnDisplayMode(val); // load display mode for all modes (viewer or editor)
                    me.view.turnDisplayMode(val);

                    if ( typeof (me.appConfig.customization) == 'object' && (me.appConfig.customization.review && me.appConfig.customization.review.showReviewChanges==true ||
                        (!me.appConfig.customization.review || me.appConfig.customization.review.showReviewChanges===undefined) && me.appConfig.customization.showReviewChanges==true) ) {
                        me.dlgChanges = (new Common.Views.ReviewChangesDialog({
                            popoverChanges  : me.popoverChanges,
                            mode            : me.appConfig,
                            docProtection   : me._state.docProtection
                        }));
                        var sdk = $('#editor_sdk'),
                            offset = sdk.offset();
                        me.dlgChanges.show(Math.max(10, offset.left + sdk.width() - 300), Math.max(10, offset.top + sdk.height() - 150));
                    }
                } else if (config.canViewReview) {
                    config.canViewReview = (config.isEdit || me.api.asc_HaveRevisionsChanges(true)); // check revisions from all users
                    if (config.canViewReview) {
                        var val = Common.localStorage.getItem(me.appPrefix + (config.isEdit || config.isRestrictedEdit ? "review-mode-editor" : "review-mode"));
                        if (val===null) {
                            val = me.appConfig.customization && me.appConfig.customization.review ? me.appConfig.customization.review.reviewDisplay : undefined;
                            !val && (val = me.appConfig.customization ? me.appConfig.customization.reviewDisplay : undefined);
                            val = /^(original|final|markup|simple)$/i.test(val) ? val.toLocaleLowerCase() : (config.isEdit || config.isRestrictedEdit ? 'markup' : 'original');
                        }
                        me.turnDisplayMode(val);
                        me.view.turnDisplayMode(val);
                    }
                }

                if (me.view && me.view.btnChat) {
                    me.getApplication().getController('LeftMenu').leftMenu.btnChat.on('toggle', function(btn, state){
                        if (state !== me.view.btnChat.pressed)
                            me.view.turnChat(state);
                    });
                }
                me.onChangeProtectSheet();
                if (me.view) {
                    me.lockToolbar(Common.enumLock.hideComments, !Common.localStorage.getBool(me.appPrefix + "settings-livecomment", true), {array: [me.view.btnCommentRemove, me.view.btnCommentResolve]});
                    me.lockToolbar(Common.enumLock['Objects'], !!me._state.wsProps['Objects'], {array: [me.view.btnCommentRemove, me.view.btnCommentResolve]});
                }

                var val = Common.localStorage.getItem(me.appPrefix + "settings-review-hover-mode");
                if (val === null) {
                    val = me.appConfig.customization && me.appConfig.customization.review ? !!me.appConfig.customization.review.hoverMode : false;
                } else
                    val = !!parseInt(val);
                Common.Utils.InternalSettings.set(me.appPrefix + "settings-review-hover-mode", val);
                me.appConfig.reviewHoverMode = val;

                if (me.view && me.view.btnMailRecepients) {
                    Common.Utils.lockControls(Common.enumLock.mmergeLock, !!me._state.mmdisable, {array: [me.view.btnMailRecepients]});
                    me.view.mnuMailRecepients.items[2].setVisible(me.appConfig.fileChoiceUrl || me.appConfig.canRequestSelectSpreadsheet || me.appConfig.canRequestMailMergeRecipients);
                }

                me.view && me.view.onAppReady(config);
                me._state.sdkchange && me.onApiShowChange(me._state.sdkchange, true);
            });
        },

        applySettings: function(menu) {
            this.view && this.view.turnSpelling( Common.localStorage.getBool(this.appPrefix + "settings-spellcheck", true) );
            this.view && this.view.turnCoAuthMode( Common.localStorage.getBool(this.appPrefix + "settings-coauthmode", true) );
            if ((this.appConfig.canReview || this.appConfig.canViewReview) && this.appConfig.reviewHoverMode)
                this.onApiShowChange();
        },

        synchronizeChanges: function() {
            if ( this.appConfig && this.appConfig.canReview ) {
                this.view.markChanges( this.api.asc_HaveRevisionsChanges() );
            }
        },

        setLanguages: function (array) {
            this.langs = array;
            this.lockToolbar(Common.enumLock.noSpellcheckLangs, this.langs.length<1, {array: this.view.btnsDocLang});
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
            this._readonlyRights = true;
            this.view && this.view.onLostEditRights();
            this.view && this.lockToolbar(Common.enumLock.cantShare, true, {array: [this.view.btnSharing]});
        },

        changeAccessRights: function(btn,event,opts) {
            if (this._docAccessDlg || this._readonlyRights) return;

            if (this.appConfig.canRequestSharingSettings) {
                Common.Gateway.requestSharingSettings();
            } else {
                var me = this;
                me._docAccessDlg = new Common.Views.DocumentAccessDialog({
                    settingsurl: this.appConfig.sharingSettingsUrl
                });
                me._docAccessDlg.on('accessrights', function(obj, rights){
                    me.setSharingSettings({sharingSettings: rights});
                }).on('close', function(obj){
                    me._docAccessDlg = undefined;
                });

                me._docAccessDlg.show();
            }
        },

        setSharingSettings: function(data) {
            if (data) {
                this.document.info.sharingSettings = data.sharingSettings;
                Common.NotificationCenter.trigger('collaboration:sharingupdate', data.sharingSettings);
                Common.NotificationCenter.trigger('mentions:clearusers', 'mention');
                Common.NotificationCenter.trigger('mentions:clearusers', 'protect');
            }
        },

        onCoAuthoringDisconnect: function() {
            this.lockToolbar(Common.enumLock.lostConnect, true);
            this.dlgChanges && Common.Utils.lockControls(Common.enumLock.lostConnect, true, {array: [this.dlgChanges.btnAccept, this.dlgChanges.btnReject]});
        },

        onUpdateUsers: function() {
            var users = this.userCollection;
            this.popoverChanges && this.popoverChanges.each(function (model) {
                var user = users.findOriginalUser(model.get('userid'));
                model.set('usercolor', (user) ? user.get('color') : Common.UI.ExternalUsers.getColor(model.get('userid')));
                user && user.get('avatar') && model.set('avatar', user.get('avatar'));
            });
        },

        avatarsUpdate: function(type, users) {
            if (type!=='info') return;

            this.popoverChanges && this.popoverChanges.each(function (model) {
                var user = _.findWhere(users, {id: model.get('userid')})
                user && (user.image!==undefined) && model.set('avatar', user.image);
            });
        },

        onAuthParticipantsChanged: function(users) {
            if (this.view && this.view.btnCompare) {
                var length = 0;
                _.each(users, function(item){
                    if (!item.asc_getView())
                        length++;
                });
                Common.Utils.lockControls(Common.enumLock.hasCoeditingUsers, length>1, {array: [this.view.btnCompare, this.view.btnCombine]});
            }
        },

        commentsShowHide: function(mode) {
            if (!this.view) return;
            var value = Common.Utils.InternalSettings.get(this.appPrefix + "settings-livecomment");
            (value!==undefined) && this.lockToolbar(Common.enumLock.hideComments, mode != 'show' && !value, {array: [this.view.btnCommentRemove, this.view.btnCommentResolve]});
        },

        onChangeProtectSheet: function(props) {
            if (!props) {
                var wbprotect = this.getApplication().getController('WBProtection');
                props = wbprotect ? wbprotect.getWSProps() : null;
            }
            this._state.wsProps = props ? props.wsProps : [];
            this._state.wsLock = props ? props.wsLock : false;

            if (!this.view) return;
            this.lockToolbar(Common.enumLock['Objects'], !!this._state.wsProps['Objects'], {array: [this.view.btnCommentRemove, this.view.btnCommentResolve]});
        },

        onChangeProtectDocument: function(props) {
            if (!props) {
                var docprotect = this.getApplication().getController('DocProtection');
                props = docprotect ? docprotect.getDocProps() : null;
            }
            if (props) {
                this._state.docProtection = props;
                this.lockToolbar(Common.enumLock.docLockView, props.isReadOnly);
                this.lockToolbar(Common.enumLock.docLockForms, props.isFormsOnly);
                this.lockToolbar(Common.enumLock.docLockReview, props.isReviewOnly);
                this.lockToolbar(Common.enumLock.docLockComments, props.isCommentsOnly);
                if (this.dlgChanges) {
                    Common.Utils.lockControls(Common.enumLock.docLockView, props.isReadOnly, {array: [this.dlgChanges.btnAccept, this.dlgChanges.btnReject]});
                    Common.Utils.lockControls(Common.enumLock.docLockForms, props.isFormsOnly, {array: [this.dlgChanges.btnAccept, this.dlgChanges.btnReject]});
                    Common.Utils.lockControls(Common.enumLock.docLockReview, props.isReviewOnly, {array: [this.dlgChanges.btnAccept, this.dlgChanges.btnReject]});
                    Common.Utils.lockControls(Common.enumLock.docLockComments, props.isCommentsOnly, {array: [this.dlgChanges.btnAccept, this.dlgChanges.btnReject]});
                }
                if (!this.appConfig.isReviewOnly) {
                    // protection in document is more important than permissions.review, call asc_SetLocalTrackRevisions even if canReview is false
                    if (props.isReviewOnly) {
                        this.api.asc_SetLocalTrackRevisions(true);
                        this.onApiShowChange();
                    } else if (this._state.prevReviewProtected) {
                        this.api.asc_SetLocalTrackRevisions(false);
                        this.onApiShowChange();
                    }
                    this._state.prevReviewProtected = props.isReviewOnly;
                }
                this.updatePreviewMode();
            }
        },

        DisableMailMerge: function() {
            this._state.mmdisable = true;
            this.view && this.view.btnMailRecepients && Common.Utils.lockControls(Common.enumLock.mmergeLock, true, {array: [this.view.btnMailRecepients]});
        },

        onChangeViewMode: function (mode) {
            this.lockToolbar(Common.enumLock.slideMasterMode, mode==='master');
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
        textTableRowsAdd: '<b>Table Rows Added</b>',
        textTableRowsDel: '<b>Table Rows Deleted</b>',
        textParaMoveTo: '<b>Moved:</b>',
        textParaMoveFromUp: '<b>Moved Up:</b>',
        textParaMoveFromDown: '<b>Moved Down:</b>',
        textUrl: 'Paste a document URL',
        textAcceptBeforeCompare: 'In order to compare documents all the tracked changes in them will be considered to have been accepted. Do you want to continue?',
        textTitleComparison: 'Comparison Settings',
        textShow: 'Show changes at',
        textChar: 'Character level',
        textWord: 'Word level',
        textOnGlobal: '{0} enabled Track Changes for everyone.',
        textOffGlobal: '{0} disabled Track Changes for everyone.',
        textOn: '{0} is now using Track Changes.',
        textOff: '{0} is no longer using Track Changes.'

    }, Common.Controllers.ReviewChanges || {}));
});