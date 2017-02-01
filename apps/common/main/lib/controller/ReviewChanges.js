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
 *  ReviewChanges.js
 *
 *  Created by Julia.Radzhabova on 05.08.15
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

if (Common === undefined)
    var Common = {};
Common.Controllers = Common.Controllers || {};

define([
    'core',
    'common/main/lib/model/ReviewChange',
    'common/main/lib/collection/ReviewChanges',
    'common/main/lib/view/ReviewChanges'
], function () {
    'use strict';

    Common.Controllers.ReviewChanges = Backbone.Controller.extend(_.extend({
        models : [],
        collections : [
            'Common.Collections.ReviewChanges'
        ],
        views : [
            'Common.Views.ReviewChanges',
            'Common.Views.ReviewChangesPopover'
        ],
        sdkViewName : '#id_main',

        initialize: function () {

            this.addListeners({
                'Common.Views.ReviewChanges': {

                    // comments handlers
                    'reviewchange:accept':      _.bind(this.onAcceptClick, this),
                    'reviewchange:reject':      _.bind(this.onRejectClick, this),
                    'reviewchange:delete':      _.bind(this.onDeleteClick, this)
                }
            });
        },
        onLaunch: function () {
            this.collection     =   this.getApplication().getCollection('Common.Collections.ReviewChanges');
            this.popoverChanges =   new Common.Collections.ReviewChanges();
            this.userCollection =   this.getApplication().getCollection('Common.Collections.Users');

            this.view           =   this.createView('Common.Views.ReviewChanges', {
                store           :   this.collection,
                popoverChanges  :   this.popoverChanges
            });
            this.view.render();
            this.bindViewEvents(this.view, this.events);

            var me = this;
            this.view.btnPrev.on('click', _.bind(this.onBtnPreviewClick, this));
            this.view.btnNext.on('click', _.bind(this.onBtnPreviewClick, this));
            this.view.btnAccept.on('click',           _.bind(this.onAcceptClick, this));
            this.view.btnAccept.menu.on('item:click', _.bind(this.onAcceptClick, this));
            this.view.btnReject.on('click',           _.bind(this.onRejectClick, this));
            this.view.btnReject.menu.on('item:click', _.bind(this.onRejectClick, this));

            this._state = {posx: -1000, posy: -1000, popoverVisible: false};
        },
        setConfig: function (data, api) {
            this.setApi(api);

            if (data) {
                this.sdkViewName        =   data['sdkviewname'] || this.sdkViewName;
            }
        },
        setApi: function (api) {
            if (api) {
                this.api = api;

                this.api.asc_registerCallback('asc_onShowRevisionsChange', _.bind(this.onApiShowChange, this));
                this.api.asc_registerCallback('asc_onUpdateRevisionsChangesPosition', _.bind(this.onApiUpdateChangePosition, this));
            }
        },

        setMode: function(mode) {
            this.view.isReviewOnly = mode.isReviewOnly;
            this.view.btnAccept.setDisabled(mode.isReviewOnly);
            this.view.btnReject.setDisabled(mode.isReviewOnly);
            return this;
        },

        onApiShowChange: function (sdkchange) {
            if (this.getPopover()) {
                if (sdkchange && sdkchange.length>0) {
                    var i = 0,
                        changes = this.readSDKChange(sdkchange),
                        posX = sdkchange[0].get_X(),
                        posY = sdkchange[0].get_Y(),
                        animate = ( Math.abs(this._state.posx-posX)>0.001 || Math.abs(this._state.posy-posY)>0.001),
                        lock = (sdkchange[0].get_LockUserId()!==null),
                        lockUser = this.getUserName(sdkchange[0].get_LockUserId());

                    this.popoverChanges.reset(changes);

                    if (animate) {
                        if ( this.getPopover().isVisible() ) this.getPopover().hide();
                        this.getPopover().setLeftTop(posX+25, posY);
                    }

                    this.getPopover().show(animate, lock, lockUser);

                    if (!this.view.isReviewOnly &&  this._state.lock !== lock) {
                        this.view.btnAccept.setDisabled(lock==true);
                        this.view.btnReject.setDisabled(lock==true);
                        this._state.lock = lock;
                    }
                    this._state.posx = posX;
                    this._state.posy = posY;
                    this._state.popoverVisible = true;
                } else if (this._state.popoverVisible){
                    this._state.posx = this._state.posy = -1000;
                    this._state.popoverVisible = false;
                    this.getPopover().hide();
                    this.popoverChanges.reset();
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
                    this.getPopover().setLeftTop(posX+25, posY);
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
            return this.view.getPopover(this.sdkViewName);
        },

        // helpers

        readSDKChange: function (data) {
            var me = this, arr = [];
            _.each(data, function(item) {
                var changetext = '', proptext = '',
                    value = item.get_Value(),
                    settings = false;
                switch (item.get_Type()) {
                    case Asc.c_oAscRevisionsChangeType.TextAdd:
                        changetext = me.textInserted;
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
                        changetext = me.textDeleted;
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

                }
                var date = (item.get_DateTime() == '') ? new Date() : new Date(item.get_DateTime()),
                    color = item.get_UserColor(),
                    change = new Common.Models.ReviewChange({
                        uid         : Common.UI.getId(),
                        userid      : item.get_UserId(),
                        username    : item.get_UserName(),
                        usercolor   : '#'+Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()),
                        date        : me.dateToLocaleTimeString(date),
                        changetext  : changetext,
                        id          : Common.UI.getId(),
                        lock        : (item.get_LockUserId()!==null),
                        lockuser    : item.get_LockUserId(),
                        type        : item.get_Type(),
                        changedata  : item,
                        scope       : me.view
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

        onBtnPreviewClick: function(btn, eOpts){
            switch (btn.options.value) {
                case 1:
                    this.api.asc_GetPrevRevisionsChange();
                    break;
                case 2:
                    this.api.asc_GetNextRevisionsChange();
                    break;
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
        textShape: 'Shape'
        
    }, Common.Controllers.ReviewChanges || {}));
});