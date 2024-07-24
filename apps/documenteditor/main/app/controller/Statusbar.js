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
 *  Statusbar.js
 *
 *  Statusbar controller
 *
 *  Created on 1/15/14
 *
 */

define([
    'core',
    'documenteditor/main/app/view/Statusbar',
    'common/main/lib/util/LanguageInfo'
], function () {
    'use strict';

    DE.Controllers.Statusbar = Backbone.Controller.extend(_.extend({
        models: [],
        collections: [],
        views: [
            'Statusbar'
        ],

        initialize: function() {
            var me = this;
            this.addListeners({
                'Statusbar': {
                    'langchanged': this.onLangMenu,
                    'zoom:value': function(value) {
                        this.api.zoom(value);
                        Common.NotificationCenter.trigger('edit:complete', this.statusbar);
                    }.bind(this)
                },
                'ViewTab': {
                    'statusbar:hide': _.bind(me.onChangeCompactView, me)
                }
            });
        },

        events: function() {
            return {
                'click #btn-zoom-down': _.bind(this.zoomDocument,this,'down'),
                'click #btn-zoom-up': _.bind(this.zoomDocument,this,'up'),
                'click #btn-zoom-topage': _.bind(this.onBtnZoomTo, this, 'topage'),
                'click #btn-zoom-towidth': _.bind(this.onBtnZoomTo, this, 'towidth')
            };
        },


        onLaunch: function() {
            this.statusbar = this.createView('Statusbar', {
                // storeUsers: this.getApplication().getCollection('Common.Collections.Users')
            });

            var me = this;
            Common.NotificationCenter.on('app:face', function (cfg) {
                me.statusbar.render(cfg);
                me.statusbar.$el.css('z-index', 1);

                var lblzoom = $('.statusbar #label-zoom');
                lblzoom.css('min-width', 80);
                lblzoom.text(Common.Utils.String.format(me.zoomText, 100));

                if ( cfg.isEdit ) {
                    var review = me.getApplication().getController('Common.Controllers.ReviewChanges').getView();
                    if (cfg.canReview) {
                        me.btnTurnReview = review.getButton('turn', 'statusbar');
                        me.btnTurnReview.render(me.statusbar.$layout.find('#btn-doc-review'));
                        me.statusbar.btnTurnReview = me.btnTurnReview;
                    } else {
                        me.statusbar.$el.find('.el-review').hide();
                    }

                    me.btnSpelling = review.getButton('spelling', 'statusbar');
                    me.btnSpelling.render( me.statusbar.$layout.find('#btn-doc-spell') );
                    me.btnDocLang = review.getButton('doclang', 'statusbar');
                    me.btnDocLang.render( me.statusbar.$layout.find('#btn-doc-lang') );

                    var isVisible = (Common.UI.LayoutManager.isElementVisible('statusBar-textLang') || Common.UI.LayoutManager.isElementVisible('statusBar-docLang'))
                                    && Common.UI.FeaturesManager.canChange('spellcheck');
                    me.btnDocLang.$el.find('+.separator.space')[isVisible?'show':'hide']();
                    isVisible = Common.UI.LayoutManager.isElementVisible('statusBar-textLang') || Common.UI.LayoutManager.isElementVisible('statusBar-docLang')
                                || Common.UI.FeaturesManager.canChange('spellcheck');
                    me.statusbar.$el.find('.el-lang')[isVisible?'show':'hide']();
                } else {
                    me.statusbar.$el.find('.el-edit, .el-review').hide();
                }
                if (cfg.canUseSelectHandTools) {
                    me.statusbar.$el.find('.hide-select-tools').removeClass('hide-select-tools');
                }
            });
            Common.NotificationCenter.on('app:ready', me.onAppReady.bind(me));
        },

        onAppReady: function (config) {
            var me = this;
            me._isDocReady = true;
            (new Promise(function(resolve) {
                resolve();
            })).then(function () {
                me.bindViewEvents(me.statusbar, me.events);
                if (config.canUseSelectHandTools) {
                    me.statusbar.btnSelectTool.on('click', _.bind(me.onSelectTool, me, 'select'));
                    me.statusbar.btnHandTool.on('click', _.bind(me.onSelectTool, me, 'hand'));
                    me.api.asc_registerCallback('asc_onChangeViewerTargetType', _.bind(me.onChangeViewerTargetType, me));
                    me.api.asc_setViewerTargetType('hand');
                }

                var statusbarIsHidden = Common.localStorage.getBool("de-hidden-status");
                if ( config.canReview && !statusbarIsHidden ) {
                    var _process_changestip = function() {
                        var showTrackChangesTip = !Common.localStorage.getBool("de-track-changes-tip");
                        if ( showTrackChangesTip ) {
                            me.btnTurnReview.updateHint('');
                            if (me.changesTooltip === undefined)
                                me.changesTooltip = me.createChangesTip(me.textTrackChanges, 'de-track-changes-tip');

                            me.hideTips();
                            me.changesTooltip.show();
                        } else {
                            me.btnTurnReview.updateHint(me.tipReview);
                        }
                    }

                    var trackRevisions = me.api.asc_IsTrackRevisions(),
                        trackChanges = config.customization && config.customization.review ? config.customization.review.trackChanges : undefined;
                    (trackChanges===undefined) && (trackChanges = config.customization ? config.customization.trackChanges : undefined);

                    if ( config.isReviewOnly || trackChanges===true || (trackChanges!==false) && trackRevisions) {
                        _process_changestip();
                    } else if ( trackRevisions ) {
                        var showNewChangesTip = !Common.localStorage.getBool("de-new-changes");
                        if ( me.api.asc_HaveRevisionsChanges() && showNewChangesTip ) {
                            me.btnTurnReview.updateHint('');

                            if (me.newChangesTooltip === undefined)
                                me.newChangesTooltip = me.createChangesTip(me.textHasChanges, 'de-new-changes');

                            me.hideTips();
                            me.newChangesTooltip.show();
                        } else
                            me.btnTurnReview.updateHint(me.tipReview);
                    }
                }
            });
        },

        onChangeCompactView: function (view, status) {
            this.statusbar.setVisible(!status);
            Common.localStorage.setBool('de-hidden-status', status);

            if (view.$el.closest('.btn-slot').prop('id') === 'slot-btn-options') {
                this.statusbar.fireEvent('view:hide', [this, status]);
            }

            Common.NotificationCenter.trigger('layout:changed', 'status');
            Common.NotificationCenter.trigger('edit:complete', this.statusbar);
        },

        onApiTrackRevisionsChange: function(localFlag, globalFlag, userId) {
            var global = (localFlag===null),
                state = global ? globalFlag : localFlag;
            if (this.btnTurnReview) {
                if (!state) {
                    this.hideTips();
                    this.btnTurnReview.updateHint(this.tipReview);
                } else if (userId && state && global ) {
                    if (this.globalChangesTooltip === undefined)
                        this.globalChangesTooltip = this.createChangesTip(this.textSetTrackChanges);
                    if (!this.globalChangesTooltip.isVisible()) {
                        this.hideTips();
                        this.globalChangesTooltip.show();
                    }
                }
            }
        },

        setApi: function(api) {
            this.api = api;
            this.api.asc_registerCallback('asc_onZoomChange',   _.bind(this._onZoomChange, this));
            this.api.asc_registerCallback('asc_onTextLanguage', _.bind(this._onTextLanguage, this));
            this.api.asc_registerCallback('asc_onOnTrackRevisionsChange', _.bind(this.onApiTrackRevisionsChange, this));

            this.statusbar.setApi(api);
        },

        onBtnZoomTo: function(d, e) {
            var _btn, _func;
            if ( d == 'topage' ) {
                _btn = 'btnZoomToPage';
                _func = 'zoomFitToPage';
            } else {
                _btn = 'btnZoomToWidth';
                _func = 'zoomFitToWidth';
            }

            if ( !this.statusbar[ _btn ].pressed )
                this.api.zoomCustomMode(); else
                this.api[ _func ]();

            Common.NotificationCenter.trigger('edit:complete', this.statusbar);
        },

        zoomDocument: function(d,e) {
            switch (d) {
                case 'up':      this.api.zoomIn(); break;
                case 'down':    this.api.zoomOut(); break;
            }
            Common.NotificationCenter.trigger('edit:complete', this.statusbar);
        },

        /*
        *   api events
        * */

        _onZoomChange: function (percent, type) {
            this.statusbar.btnZoomToPage.toggle(type == 2, true);
            this.statusbar.btnZoomToWidth.toggle(type == 1, true);
            $('.statusbar #label-zoom').text(Common.Utils.String.format(this.zoomText, percent));
            if (!this._isDocReady) return;
            var value = type == 2 ? -1 : (type == 1 ? -2 : percent);
            Common.localStorage.setItem('de-last-zoom', value);
            Common.Utils.InternalSettings.set('de-last-zoom', value);
        },

        _onTextLanguage: function(langId) {
            var info = Common.util.LanguageInfo.getLocalLanguageName(langId);
            this.statusbar.setLanguage({
                    value:    info[0],
                    displayValue:  info[1],
                    code:   langId
            });
        },

        setLanguages: function(langs) {
            this.langs = langs;
            this.statusbar.reloadLanguages(langs);
        },

        setStatusCaption: function(text, force, delay, callback) {
            if (this.timerCaption && ( ((new Date()) < this.timerCaption) || text.length==0 ) && !force )
                return;

            this.timerCaption = undefined;
            if (text.length) {
                this.statusbar.showStatusMessage(text);
                callback && callback();
                if (delay>0)
                    this.timerCaption = (new Date()).getTime() + delay;
            } else
                this.statusbar.clearStatusMessage();
        },

        createDelayedElements: function() {
            this.statusbar.$el.css('z-index', '');
        },

        onLangMenu: function(obj, langid, title) {
            this.api.put_TextPrLang(langid);
        },

        synchronizeChanges: function() {
            this.setStatusCaption('');
        },

        hideTips: function () {
            this.changesTooltip && this.changesTooltip.isVisible() && this.changesTooltip.hide();
            this.newChangesTooltip && this.newChangesTooltip.isVisible() && this.newChangesTooltip.hide();
            this.globalChangesTooltip && this.globalChangesTooltip.isVisible() && this.globalChangesTooltip.hide();
        },

        createChangesTip: function (text, storage) {
            var me = this;
            var tip = new Common.UI.SynchronizeTip({
                target  : me.btnTurnReview.$el,
                text    : text,
                placement: Common.UI.isRTL() ? 'top-right' : 'top-left',
                showLink: !!storage
            });
            tip.on({
                'dontshowclick': function() {
                    Common.localStorage.setItem(storage, 1);

                    tip.hide();
                    me.btnTurnReview.updateHint(me.tipReview);
                },
                'closeclick': function() {
                    tip.hide();
                    me.btnTurnReview.updateHint(me.tipReview);
                }
            });

            return tip;
        },

        showDisconnectTip: function () {
            var me = this;
            if (!this.disconnectTip) {
                var target = this.statusbar.getStatusLabel();
                target = target.is(':visible') ? target.parent() : this.statusbar.isVisible() ? this.statusbar.$el : $(document.body);
                this.disconnectTip = new Common.UI.SynchronizeTip({
                    target  : target,
                    text    : this.textDisconnect,
                    placement: 'top',
                    position: this.statusbar.isVisible() ? undefined : {bottom: 0},
                    showLink: false,
                    style: 'max-width: 310px;'
                });
                this.disconnectTip.on({
                    'closeclick': function() {
                        me.disconnectTip.hide();
                        me.disconnectTip = null;
                    }
                });
            }
            this.disconnectTip.show();
        },

        hideDisconnectTip: function() {
            this.disconnectTip && this.disconnectTip.hide();
            this.disconnectTip = null;
        },

        onSelectTool: function (type, btn, e) {
            if (this.api) {
                this.api.asc_setViewerTargetType(type);
            }
        },

        onChangeViewerTargetType: function(isHandMode) {
            if (this.statusbar && this.statusbar.btnHandTool) {
                this.statusbar.btnHandTool.toggle(isHandMode, true);
                this.statusbar.btnSelectTool.toggle(!isHandMode, true);
            }
        },

        zoomText        : 'Zoom {0}%',
        textHasChanges  : 'New changes have been tracked',
        textTrackChanges: 'The document is opened with the Track Changes mode enabled',
        tipReview       : 'Review',
        textSetTrackChanges: 'You are in Track Changes mode',
        textDisconnect: '<b>Connection is lost</b><br>Trying to connect. Please check connection settings.'
    }, DE.Controllers.Statusbar || {}));
});