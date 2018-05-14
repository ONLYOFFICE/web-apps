/*
 *
 * (c) Copyright Ascensio System Limited 2010-2018
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
            this.currentRev = 0;
            this.currentServerVersion = 0;
        },

        events: {
        },

        onLaunch: function() {
            this.panelHistory= this.createView('Common.Views.History', {
                storeHistory: this.getApplication().getCollection('Common.Collections.HistoryVersions')
            });
            this.panelHistory.storeHistory.on('reset', _.bind(this.onResetStore, this));
            this.panelHistory.on('render:after', _.bind(this.onAfterRender, this));
            Common.Gateway.on('sethistorydata', _.bind(this.onSetHistoryData, this));
        },

        setApi: function(api) {
            this.api = api;
            this.api.asc_registerCallback('asc_onDownloadUrl', _.bind(this.onDownloadUrl, this));
            this.api.asc_registerCallback('asc_onExpiredToken', _.bind(this.onExpiredToken, this));
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
            historyView.btnExpand.on('click', _.bind(this.onClickExpand, this));
        },

        onResetStore: function() {
            var hasChanges = this.panelHistory.storeHistory.hasChanges();
            this.panelHistory.$el.find('#history-expand-changes')[hasChanges ? 'show' : 'hide']();
            this.panelHistory.$el.find('#history-list').css('padding-bottom', hasChanges ? '45px' : 0);
        },

        onDownloadUrl: function(url) {
            if (this.isFromSelectRevision !== undefined)
                Common.Gateway.requestRestore(this.isFromSelectRevision, url);
            this.isFromSelectRevision = undefined;
        },

        onSelectRevision: function(picker, item, record, e) {
            if (e) {
                var btn = $(e.target);
                if (btn && btn.hasClass('revision-restore')) {
                    if (record.get('isRevision'))
                        Common.Gateway.requestRestore(record.get('revision'));
                    else {
                        this.isFromSelectRevision = record.get('revision');
                        this.api.asc_DownloadAs(Asc.c_oAscFileType.DOCX, true);
                    }
                    return;
                }
            }

            if (!picker && record)
                this.panelHistory.viewHistoryList.scrollToRecord(record);

            var url         = record.get('url'),
                rev         = record.get('revision'),
                urlGetTime  = new Date();

            this.currentChangeId = record.get('changeid');
            this.currentArrColors = record.get('arrColors');
            this.currentDocId = record.get('docId');
            this.currentDocIdPrev = record.get('docIdPrev');
            this.currentRev = rev;
            this.currentServerVersion = record.get('serverVersion');

            if ( _.isEmpty(url) || (urlGetTime - record.get('urlGetTime') > 5 * 60000)) {
                 _.delay(function() {
                    Common.Gateway.requestHistoryData(rev); // получаем url-ы для ревизий
                 }, 10);
            } else {
                var urlDiff = record.get('urlDiff'),
                    token   = record.get('token'),
                    hist = new Asc.asc_CVersionHistory();
                hist.asc_setDocId(_.isEmpty(urlDiff) ? this.currentDocId : this.currentDocIdPrev);
                hist.asc_setUrl(url);
                hist.asc_setUrlChanges(urlDiff);
                hist.asc_setCurrentChangeId(this.currentChangeId);
                hist.asc_setArrColors(this.currentArrColors);
                hist.asc_setToken(token);
                hist.asc_setIsRequested(false);
                hist.asc_setServerVersion(this.currentServerVersion);
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
                    var diff = (this.currentChangeId===undefined) ? null : opts.data.changesUrl, // if revision has changes, but serverVersion !== app.buildVersion -> hide revision changes
                        url = (!_.isEmpty(diff) && opts.data.previous) ? opts.data.previous.url : opts.data.url,
                        docId = opts.data.key ? opts.data.key : this.currentDocId,
                        docIdPrev = opts.data.previous && opts.data.previous.key ? opts.data.previous.key : this.currentDocIdPrev,
                        token = opts.data.token;

                    if (revisions && revisions.length>0) {
                        for(var i=0; i<revisions.length; i++) {
                            rev = revisions[i];
                            rev.set('url', url, {silent: true});
                            rev.set('urlDiff', diff, {silent: true});
                            rev.set('urlGetTime', urlGetTime, {silent: true});
                            if (opts.data.key) {
                                rev.set('docId', docId, {silent: true});
                                rev.set('docIdPrev', docIdPrev, {silent: true});
                            }
                            rev.set('token', token, {silent: true});
                        }
                    }
                    var hist = new Asc.asc_CVersionHistory();
                    hist.asc_setUrl(url);
                    hist.asc_setUrlChanges(diff);
                    hist.asc_setDocId(_.isEmpty(diff) ? docId : docIdPrev);
                    hist.asc_setCurrentChangeId(this.currentChangeId);
                    hist.asc_setArrColors(this.currentArrColors);
                    hist.asc_setToken(token);
                    hist.asc_setIsRequested(true);
                    hist.asc_setServerVersion(this.currentServerVersion);
                    this.api.asc_showRevision(hist);

                    var commentsController = this.getApplication().getController('Common.Controllers.Comments');
                    if (commentsController) commentsController.onApiHideComment();
                }
            }
        },

        onExpiredToken: function() {
            var me = this;
            _.delay(function() {
                Common.Gateway.requestHistoryData(me.currentRev); // получаем url-ы для ревизий
            }, 10);
        },

        onClickBackToDocument: function () {
            // reload editor
            Common.Gateway.requestHistoryClose();
        },

        onClickExpand: function () {
            var store = this.panelHistory.storeHistory,
                needExpand = store.hasCollapsed();

            store.where({isRevision: true, hasChanges: true, isExpanded: !needExpand}).forEach(function(item){
                item.set('isExpanded', needExpand);
            });
            store.where({isRevision: false}).forEach(function(item){
                item.set('isVisible', needExpand);
            });
            this.panelHistory.viewHistoryList.scroller.update({minScrollbarLength: 40});
            this.panelHistory.btnExpand.cmpEl.text(needExpand ? this.panelHistory.textHideAll : this.panelHistory.textShowAll);
        },

        notcriticalErrorTitle: 'Warning'

    }, Common.Controllers.History || {}));
});
