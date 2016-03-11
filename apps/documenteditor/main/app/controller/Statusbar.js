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
                'FileMenu': {
                    'settings:apply': _.bind(this.applySettings, this)
                },
                'Statusbar': {
                    'langchanged': this.onLangMenu
                }
            });
        },

        events: function() {
            return {
                'click #btn-zoom-down': _.bind(this.zoomDocument,this,'down'),
                'click #btn-zoom-up': _.bind(this.zoomDocument,this,'up'),
                'click #btn-doc-lang':_.bind(this.onBtnLanguage,this)
            };
        },


        onLaunch: function() {
            this.statusbar = this.createView('Statusbar', {
                storeUsers: this.getApplication().getCollection('Common.Collections.Users')
            }).render();
            this.statusbar.$el.css('z-index', 1);

            this.bindViewEvents(this.statusbar, this.events);

            $('.statusbar #label-zoom').css('min-width', 70);

            this.statusbar.btnSetSpelling.on('click', _.bind(this.onBtnSpelling, this));
            this.statusbar.btnZoomToPage.on('click', _.bind(this.onBtnZoomTo, this, 'topage'));
            this.statusbar.btnZoomToWidth.on('click', _.bind(this.onBtnZoomTo, this, 'towidth'));
            this.statusbar.zoomMenu.on('item:click', _.bind(this.menuZoomClick, this));
            this.statusbar.btnReview.menu.on('item:toggle', _.bind(this.onMenuReviewToggle, this));
            this.statusbar.btnReview.on('toggle', _.bind(this.onReviewToggle, this));
        },

        setApi: function(api) {
            this.api = api;
            this.api.asc_registerCallback('asc_onZoomChange',   _.bind(this._onZoomChange, this));
            this.api.asc_registerCallback('asc_onTextLanguage', _.bind(this._onTextLanguage, this));

            this.statusbar.setApi(api);
        },

        onBtnZoomTo: function(d, b, e) {
            if (!b.pressed)
                this.api.zoomCustomMode(); else
                this.api[d=='topage'?'zoomFitToPage':'zoomFitToWidth']();
            Common.NotificationCenter.trigger('edit:complete', this.statusbar);
        },

        zoomDocument: function(d,e) {
            switch (d) {
                case 'up':      this.api.zoomIn(); break;
                case 'down':    this.api.zoomOut(); break;
            }
            Common.NotificationCenter.trigger('edit:complete', this.statusbar);
        },

        menuZoomClick: function(menu, item) {
            this.api.zoom(item.value);
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

        setLanguages: function(apiLangs) {
            var langs = this.langs = [], info;
            _.each(apiLangs, function(lang, index, list){
                info = Common.util.LanguageInfo.getLocalLanguageName(lang.asc_getId());
                langs.push({
                    title:  info[1],
                    tip:    info[0],
                    code:   lang.asc_getId()
                });
            }, this);

            this.statusbar.reloadLanguages(langs);
        },

        setStatusCaption: function(text) {
            if (text.length)
                this.statusbar.showStatusMessage(text); else
                this.statusbar.clearStatusMessage();
        },

        createDelayedElements: function() {
            this.statusbar.$el.css('z-index', '');

            var value = Common.localStorage.getItem("de-hidden-status"),
                statusbarIsHidden = (value !== null && parseInt(value) == 1);

            value = Common.localStorage.getItem("de-settings-spellcheck");
            this.statusbar.btnSetSpelling.toggle(value===null || parseInt(value) == 1, true);

            if (this.statusbar.mode.canReview) {
                var me = this;
                this.reviewChangesPanel = this.getApplication().getController('Common.Controllers.ReviewChanges').getView('Common.Views.ReviewChanges');
                this.reviewChangesPanel.on('hide', function(){
                    me.statusbar.mnuChangesPanel.setChecked(false, true);
                });

                value = Common.localStorage.getItem("de-track-changes-tip");
                this.showTrackChangesTip = !(value && parseInt(value) == 1);

                value = Common.localStorage.getItem("de-new-changes");
                this.showNewChangesTip = !(value && parseInt(value) == 1);

                if (this.statusbar.mode.isReviewOnly) {
                    var iconEl = $('.btn-icon', this.statusbar.btnReview.cmpEl);
                    (this.api.asc_HaveRevisionsChanges()) ? iconEl.removeClass(this.statusbar.btnReviewCls).addClass('btn-ic-changes') : iconEl.removeClass('btn-ic-changes').addClass(this.statusbar.btnReviewCls);
                    this.statusbar.mnuTrackChanges.setDisabled(true);
                    this.changeReviewStatus(true);
                    if (this.showTrackChangesTip && !statusbarIsHidden){
                        this.statusbar.btnReview.updateHint('');
                        if (this.changesTooltip===undefined)
                            this.changesTooltip = this.createChangesTip(this.textTrackChanges, 'de-track-changes-tip', false);
                        this.changesTooltip.show();
                    } else
                        this.statusbar.btnReview.updateHint(this.statusbar.tipReview);
                } else {
                    value = Common.localStorage.getItem("de-track-changes");
                    var doc_review = this.api.asc_IsTrackRevisions();
                    if (!doc_review)
                        this.changeReviewStatus(false);
                    else {
                        var iconEl = $('.btn-icon', this.statusbar.btnReview.cmpEl);
                       (this.api.asc_HaveRevisionsChanges()) ? iconEl.removeClass(this.statusbar.btnReviewCls).addClass('btn-ic-changes') : iconEl.removeClass('btn-ic-changes').addClass(this.statusbar.btnReviewCls);
                        if (value!==null && parseInt(value) == 1) {
                            this.changeReviewStatus(true);
                            // show tooltip "track changes in this document" and change icon
                            if (this.showTrackChangesTip && !statusbarIsHidden){
                                this.statusbar.btnReview.updateHint('');
                                if (this.changesTooltip===undefined)
                                    this.changesTooltip = this.createChangesTip(this.textTrackChanges, 'de-track-changes-tip', false);
                                this.changesTooltip.show();
                            } else
                                this.statusbar.btnReview.updateHint(this.statusbar.tipReview);
                        } else {
                            this.changeReviewStatus(false);
                            if (this.api.asc_HaveRevisionsChanges() && this.showNewChangesTip && !statusbarIsHidden){
                                this.statusbar.btnReview.updateHint('');
                                if (this.newChangesTooltip===undefined)
                                    this.newChangesTooltip = this.createChangesTip(this.textHasChanges, 'de-new-changes', true);
                                this.newChangesTooltip.show();
                            } else
                                this.statusbar.btnReview.updateHint(this.statusbar.tipReview);
                        }
                    }
                }
            }
        },

        onBtnLanguage: function() {
            var langs = _.map(this.langs, function(item){
                return {
                    displayValue:   item.title,
                    value:          item.tip,
                    code:           item.code
                }
            });

            var me = this;
            (new DE.Views.Statusbar.LanguageDialog({
                languages: langs,
                current: me.api.asc_getDefaultLanguage(),
                handler: function(result, tip) {
                    if (result=='ok') {
                        var record = _.findWhere(langs, {'value':tip});
                        record && me.api.asc_setDefaultLanguage(record.code);
                    }
                }
            })).show();
        },

        onLangMenu: function(obj, langid, title) {
            this.api.put_TextPrLang(langid);
        },

        onBtnSpelling: function(d, b, e) {
            Common.localStorage.setItem("de-settings-spellcheck", d.pressed ? 1 : 0);
            this.api.asc_setSpellCheck(d.pressed);
            Common.NotificationCenter.trigger('edit:complete', this.statusbar);
        },

        applySettings: function(menu) {
            var value = Common.localStorage.getItem("de-settings-spellcheck");
            this.statusbar.btnSetSpelling.toggle(value===null || parseInt(value) == 1, true);
        },

        onMenuReviewToggle: function(menu, item, state, e) {
            if (!this.statusbar.mode.canReview) return;

            var me = this;
            if (item.value === 'track') {
                this.statusbar.btnReview.toggle(state);
            } else if (item.value === 'panel') {
                // show/hide Changes panel
                this.showHideReviewChangesPanel(state);
            }
            Common.NotificationCenter.trigger('edit:complete', this.statusbar);
        },

        onReviewToggle: function(btn, state) {
            if (!this.statusbar.mode.canReview) return;
            if (this.statusbar.mode.isReviewOnly) {
                this.statusbar.btnReview.toggle(true, true);
            } else {
                this.changeReviewStatus(state);
                Common.localStorage.setItem("de-track-changes", state ? 1 : 0);
            }
            Common.NotificationCenter.trigger('edit:complete', this.statusbar);
        },

        changeReviewStatus: function(state) {
            this.statusbar.btnReview.toggle(state, true);
            this.statusbar.mnuTrackChanges.setChecked(state, true);
            this.statusbar.mnuChangesPanel.setChecked(state, true);

            if (this.api) {
                this.api.asc_SetTrackRevisions(state);
            }
            this.showHideReviewChangesPanel(state);
        },

        showHideReviewChangesPanel: function(state) {
            this.reviewChangesPanel[state ? 'show' : 'hide']();
        },

        synchronizeChanges: function() {
            this.setStatusCaption('');

            if (this.statusbar.mode.canReview) {
                var iconEl = $('.btn-icon', this.statusbar.btnReview.cmpEl);
                (this.api.asc_HaveRevisionsChanges()) ? iconEl.removeClass(this.statusbar.btnReviewCls).addClass('btn-ic-changes') : iconEl.removeClass('btn-ic-changes').addClass(this.statusbar.btnReviewCls);
            }
        },

        createChangesTip: function (text, storage, newchanges) {
            var tip = new Common.UI.SynchronizeTip({
                target  : $('#btn-doc-review'),
                text    : text,
                placement: 'top'
            });
            tip.on('dontshowclick', function() {
                (newchanges) ? this.showNewChangesTip = false : this.showTrackChangesTip = false;
                tip.hide();
                Common.localStorage.setItem(storage, 1);
                this.statusbar.btnReview.updateHint(this.statusbar.tipReview);
            }, this);
            tip.on('closeclick', function() {
                tip.hide();
                this.statusbar.btnReview.updateHint(this.statusbar.tipReview);
            }, this);
            return tip;
        },

        zoomText        : 'Zoom {0}%',
        textHasChanges  : 'New changes have been tracked',
        textTrackChanges: 'The document is opened with the Track Changes mode enabled'
    }, DE.Controllers.Statusbar || {}));
});