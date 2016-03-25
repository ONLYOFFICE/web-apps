/**
 * User: Julia.Radzhabova
 * Date: 06.03.15
 * Time: 12:13
 */

define([
    'core',
    'common/main/lib/collection/HistoryVersions',
    'common/main/lib/view/History'
], function () {
    'use strict';

    Common.Controllers.History = Backbone.Controller.extend(_.extend({
        models: [],
        collections: [
            'Common.Collections.HistoryVersions'
        ],
        views: [
            'Common.Views.History'
        ],

        initialize: function() {
            this.currentChangeId = -1;
            this.currentArrColors = [];
            this.currentDocId = '';
            this.currentDocIdPrev = '';
        },

        events: {
        },

        onLaunch: function() {
            this.panelHistory= this.createView('Common.Views.History', {
                storeHistory: this.getApplication().getCollection('Common.Collections.HistoryVersions')
            });
            this.panelHistory.on('render:after', _.bind(this.onAfterRender, this));
            Common.Gateway.on('sethistorydata', _.bind(this.onSetHistoryData, this));
        },

        setApi: function(api) {
            this.api = api;
            return this;
        },

        setMode: function(mode) {
            if (!mode.canHistoryClose) {
                this.panelHistory.$el.find('#history-header').hide();
                this.panelHistory.$el.find('#history-list').css('padding-top', 0);
            }
        },

        onAfterRender: function(historyView) {
            historyView.viewHistoryList.on('item:click', _.bind(this.onSelectRevision, this));
            historyView.btnBackToDocument.on('click', _.bind(this.onClickBackToDocument, this));
        },

        onSelectRevision: function(picker, item, record) {
            var url         = record.get('url'),
                rev         = record.get('revision'),
                urlGetTime  = new Date();

            this.currentChangeId = record.get('changeid');
            this.currentArrColors = record.get('arrColors');
            this.currentDocId = record.get('docId');
            this.currentDocIdPrev = record.get('docIdPrev');

            if ( _.isEmpty(url) || (urlGetTime - record.get('urlGetTime') > 5 * 60000)) {
                 _.delay(function() {
                    Common.Gateway.requestHistoryData(rev); // получаем url-ы для ревизий
                 }, 10);
            } else {
                var urlDiff = record.get('urlDiff'),
                    hist = new Asc.asc_CVersionHistory();
                hist.asc_setDocId(_.isEmpty(urlDiff) ? this.currentDocId : this.currentDocIdPrev);
                hist.asc_setUrl(url);
                hist.asc_setUrlChanges(urlDiff);
                hist.asc_setCurrentChangeId(this.currentChangeId);
                hist.asc_setArrColors(this.currentArrColors);
                this.api.asc_showRevision(hist);

                var commentsController = this.getApplication().getController('Common.Controllers.Comments');
                if (commentsController) commentsController.onApiHideComment();
            }
        },

        onSetHistoryData: function(opts) {
            if (opts.data.error) {
                 var config = {
                    closable: false,
                    title: this.notcriticalErrorTitle,
                    msg: opts.data.error,
                    iconCls: 'warn',
                    buttons: ['ok']
                };
                Common.UI.alert(config);
            } else {
                var data = opts.data;
                var historyStore = this.getApplication().getCollection('Common.Collections.HistoryVersions');
                if (historyStore && data!==null) {
                    var rev, revisions = historyStore.findRevisions(data.version),
                        urlGetTime = new Date();
                    var diff = opts.data.urlDiff || opts.data.changesUrl;
                    if (revisions && revisions.length>0) {
                        for(var i=0; i<revisions.length; i++) {
                            rev = revisions[i];
                            rev.set('url', opts.data.url, {silent: true});
                            rev.set('urlDiff', diff, {silent: true});
                            rev.set('urlGetTime', urlGetTime, {silent: true});
                        }
                    }
                    var hist = new Asc.asc_CVersionHistory();
                    hist.asc_setUrl(opts.data.url);
                    hist.asc_setUrlChanges(diff);
                    hist.asc_setDocId(_.isEmpty(diff) ? this.currentDocId : this.currentDocIdPrev);
                    hist.asc_setCurrentChangeId(this.currentChangeId);
                    hist.asc_setArrColors(this.currentArrColors);
                    this.api.asc_showRevision(hist);

                    var commentsController = this.getApplication().getController('Common.Controllers.Comments');
                    if (commentsController) commentsController.onApiHideComment();
                }
            }
        },

        onClickBackToDocument: function () {
            // reload editor
            Common.Gateway.requestHistoryClose();
        },

        notcriticalErrorTitle: 'Warning'

    }, Common.Controllers.History || {}));
});
