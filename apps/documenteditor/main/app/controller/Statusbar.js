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
 *  Statusbar.js
 *
 *  Statusbar controller
 *
 *  Created by Alexander Yuzhin on 1/15/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'documenteditor/main/app/view/Statusbar',
    'common/main/lib/util/LanguageInfo',
    'common/main/lib/view/ReviewChanges'
], function () {
    'use strict';

    DE.Controllers.Statusbar = Backbone.Controller.extend(_.extend({
        models: [],
        collections: [],
        views: [
            'Statusbar'
        ],

        initialize: function() {
            this.addListeners({
                'Statusbar': {
                    'langchanged': this.onLangMenu,
                    'zoom:value': function(value) {
                        this.api.zoom(value);
                        Common.NotificationCenter.trigger('edit:complete', this.statusbar);
                    }.bind(this)
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
                me.statusbar.render();
                me.statusbar.$el.css('z-index', 1);

                $('.statusbar #label-zoom').css('min-width', 70);

                if ( cfg.canReview ) {
                    var review = DE.getController('Common.Controllers.ReviewChanges').getView();
                    me.btnTurnReview = review.getButton('turn', 'statusbar');
                    me.btnTurnReview.render( me.statusbar.$layout.find('#btn-doc-review') );

                    me.btnSpelling = review.getButton('spelling', 'statusbar');
                    me.btnSpelling.render( me.statusbar.$layout.find('#btn-doc-spell') );
                } else {
                    me.statusbar.$el.find('.el-review').hide();
                }

                if ( !cfg.isEdit ) {
                    me.statusbar.$el.find('.el-edit')['hide']();
                }
            });

            Common.NotificationCenter.on('app:ready', me.onAppReady.bind(this));
        },

        onAppReady: function (config) {
            var me = this;

            (new Promise(function(resolve) {
                resolve();
            })).then(function () {
                me.bindViewEvents(me.statusbar, me.events);

                var statusbarIsHidden = Common.localStorage.getBool("de-hidden-status");
                if ( config.canReview && !statusbarIsHidden ) {
                    var _process_changestip = function() {
                        var showTrackChangesTip = !Common.localStorage.getBool("de-track-changes-tip");
                        if ( showTrackChangesTip ) {
                            me.btnTurnReview.updateHint('');
                            if (me.changesTooltip === undefined)
                                me.changesTooltip = me.createChangesTip(me.textTrackChanges, 'de-track-changes-tip', false);

                            me.changesTooltip.show();
                        } else {
                            me.btnTurnReview.updateHint(me.tipReview);
                        }
                    }

                    if ( config.isReviewOnly ) {
                        _process_changestip();
                    } else
                    if ( me.api.asc_IsTrackRevisions() ) {
                        if ( Common.localStorage.getItem("de-track-changes") ) {
                            // show tooltip "track changes in this document"
                            _process_changestip();
                        } else {
                            var showNewChangesTip = !Common.localStorage.getBool("de-new-changes");
                            if ( me.api.asc_HaveRevisionsChanges() && showNewChangesTip ) {
                                me.btnTurnReview.updateHint('');

                                if (me.newChangesTooltip === undefined)
                                    me.newChangesTooltip = me.createChangesTip(me.textHasChanges, 'de-new-changes', true);

                                me.newChangesTooltip.show();
                            } else
                                me.btnTurnReview.updateHint(me.tipReview);
                        }
                    }

                }
            });
        },

        setApi: function(api) {
            this.api = api;
            this.api.asc_registerCallback('asc_onZoomChange',   _.bind(this._onZoomChange, this));
            this.api.asc_registerCallback('asc_onTextLanguage', _.bind(this._onTextLanguage, this));

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

         _onZoomChange: function(percent, type) {
            this.statusbar.btnZoomToPage.toggle(type == 2, true);
            this.statusbar.btnZoomToWidth.toggle(type == 1, true);

            $('.statusbar #label-zoom').text(Common.Utils.String.format(this.zoomText, percent));
        },

        _onTextLanguage: function(langId) {
            var info = Common.util.LanguageInfo.getLocalLanguageName(langId);
            this.statusbar.setLanguage({
                    tip:    info[0],
                    title:  info[1],
                    code:   langId
            });
        },

        /*
        * */

        setLanguages: function(langs) {
            this.langs = langs;
            this.statusbar.reloadLanguages(langs);
        },

        setStatusCaption: function(text) {
            if (text.length)
                this.statusbar.showStatusMessage(text); else
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

        createChangesTip: function (text, storage, newchanges) {
            var me = this;
            var tip = new Common.UI.SynchronizeTip({
                target  : me.btnTurnReview.$el,
                text    : text,
                placement: 'top'
            });
            tip.on({
                'dontshowclick': function() {
                    Common.localStorage.setItem(storage, 1);

                    tip.hide();
                    me.btnTurnReview.updateHint(this.tipReview);
                },
                'closeclick': function() {
                    tip.hide();
                    me.btnTurnReview.updateHint(this.tipReview);
                }
            });

            return tip;
        },

        zoomText        : 'Zoom {0}%',
        textHasChanges  : 'New changes have been tracked',
        textTrackChanges: 'The document is opened with the Track Changes mode enabled'
    }, DE.Controllers.Statusbar || {}));
});