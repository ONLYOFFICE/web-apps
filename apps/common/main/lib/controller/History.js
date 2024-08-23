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
 * Date: 06.03.15
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
            this.currentUserId = '';
            this.currentUserName = '';
            this.currentUserColor = '';
            this.currentDateCreated = '';
            this.currentDocumentSha256 = undefined;
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
            Common.NotificationCenter.on('mentions:setusers', _.bind(this.avatarsUpdate, this));
        },

        setApi: function(api) {
            this.api = api;
            this.api.asc_registerCallback('asc_onDownloadUrl', _.bind(this.onDownloadUrl, this));
            this.api.asc_registerCallback('asc_onExpiredToken', _.bind(this.onExpiredToken, this));
            return this;
        },

        setMode: function(mode) {
            this.mode = mode;
            if (!mode.canHistoryClose) {
                this.panelHistory.$el.find('#history-header').hide();
                this.panelHistory.$el.find('#history-list').css('padding-top', 0);
            }
        },

        onAfterRender: function(historyView) {
            historyView.viewHistoryList.on('item:click', _.bind(this.onSelectRevision, this));
            historyView.btnBackToDocument.on('click', _.bind(this.onClickBackToDocument, this));
            historyView.btnExpand.on('click', _.bind(this.onClickExpand, this));
            historyView.buttonMenu.menu.on('show:before', _.bind(this.onShowBeforeButtonMenu, this));
            historyView.buttonMenu.menu.on('item:toggle', _.bind(this.onItemToggleButtonMenu, this));
        },

        onResetStore: function() {
            var hasChanges = this.panelHistory.storeHistory.hasChanges();
            this.panelHistory.btnExpand.setDisabled(!hasChanges);
            
            //If in menu only button expand and it disabled then menu hide
            if(!this.panelHistory.chHighlightDeleted) {
                this.panelHistory.buttonMenu.setVisible(hasChanges);
            }
        },

        onDownloadUrl: function(url, fileType) {
            if (this.isFromSelectRevision !== undefined) {
                Common.Gateway.requestRestore(this.isFromSelectRevision, url, fileType);
            }
            this.isFromSelectRevision = undefined;
        },

        onSelectRevision: function(picker, item, record, e) {
            if (e) {
                var btn = $(e.target);
                if (btn && btn.hasClass('revision-restore')) {
                    if (!record.get('hasParent'))
                        Common.Gateway.requestRestore(record.get('revision'), undefined, record.get('fileType'));
                    else {
                        this.isFromSelectRevision = record.get('revision');
                        var fileType = Asc.c_oAscFileType[(record.get('fileType') || '').toUpperCase()] || Asc.c_oAscFileType.DOCX;
                        this.api.asc_DownloadAs(new Asc.asc_CDownloadOptions(fileType, true));
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
            this.currentUserId = record.get('userid');
            this.currentUserName = record.get('username');
            this.currentUserColor = record.get('usercolor');
            this.currentDateCreated = record.get('created');
            this.currentDocumentSha256 = record.get('documentSha256');

            if ( _.isEmpty(url) || (urlGetTime - record.get('urlGetTime') > 5 * 60000)) {
                var me = this;
                if (!me.timerId) {
                    me.timerId = setTimeout(function () {
                        me.timerId = 0;
                    },30000);
                    _.delay(function() {
                        Common.Gateway.requestHistoryData(rev); // получаем url-ы для ревизий
                    }, 10);
                }
            } else {
                var commentsController = this.getApplication().getController('Common.Controllers.Comments');
                if (commentsController) {
                    commentsController.onApiHideComment();
                    commentsController.clearCollections();
                }

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
                hist.asc_SetUserId(this.currentUserId);
                hist.asc_SetUserName(this.currentUserName);
                hist.asc_SetUserColor(this.currentUserColor);
                hist.asc_SetDateOfRevision(this.currentDateCreated);
                hist.asc_setDocumentSha256(this.currentDocumentSha256);
                this.api.asc_showRevision(hist);

                var reviewController = this.getApplication().getController('Common.Controllers.ReviewChanges');
                if (reviewController)
                    reviewController.onApiShowChange();
            }
        },

        onSetHistoryData: function(opts) {
            if (!this.mode.canUseHistory) return;

            if (this.timerId) {
                clearTimeout(this.timerId);
                this.timerId = 0;
            }

            if (opts.data.error) {
                 var config = {
                    title: this.notcriticalErrorTitle,
                    msg: opts.data.error,
                    iconCls: 'warn',
                    buttons: ['ok']
                };
                Common.UI.alert(config);
            } else {
                var commentsController = this.getApplication().getController('Common.Controllers.Comments');
                if (commentsController) {
                    commentsController.onApiHideComment();
                    commentsController.clearCollections();
                }

                var data = opts.data;
                var historyStore = this.getApplication().getCollection('Common.Collections.HistoryVersions');
                if (historyStore && data!==null) {
                    var rev, revisions = historyStore.findRevisions(data.version),
                        urlGetTime = new Date();
                    var diff = (!opts.data.previous || this.currentChangeId===undefined) ? null : opts.data.changesUrl, // if revision has changes, but serverVersion !== app.buildVersion -> hide revision changes
                        url = (!_.isEmpty(diff) && opts.data.previous) ? opts.data.previous.url : opts.data.url,
                        fileType = (!_.isEmpty(diff) && opts.data.previous) ? opts.data.previous.fileType : opts.data.fileType,
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
                            fileType && rev.set('fileType', fileType, {silent: true});
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
                    hist.asc_SetUserId(this.currentUserId);
                    hist.asc_SetUserName(this.currentUserName);
                    hist.asc_SetUserColor(this.currentUserColor);
                    hist.asc_SetDateOfRevision(this.currentDateCreated);
                    hist.asc_setDocumentSha256(this.currentDocumentSha256);
                    this.api.asc_showRevision(hist);
                    this.currentRev = data.version;

                    var reviewController = this.getApplication().getController('Common.Controllers.ReviewChanges');
                    if (reviewController)
                        reviewController.onApiShowChange();
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

            if(needExpand) {
                this.panelHistory.viewHistoryList.expandAll();
            } else {
                this.panelHistory.viewHistoryList.collapseAll();
            }
            this.panelHistory.btnExpand.setCaption(needExpand ? this.panelHistory.textHideAll : this.panelHistory.textShowAll);
        },

        onShowBeforeButtonMenu: function() {
            if(this.api && this.panelHistory.chHighlightDeleted) {
                this.panelHistory.chHighlightDeleted.setChecked(this.api.asc_isShowedDeletedTextInVersionHistory(), true);
            }
        },

        onItemToggleButtonMenu: function(menu, item, state) {
            if(this.api && item.value == 'highlight') {
                if(state) {
                    this.api.asc_showDeletedTextInVersionHistory();
                } else {
                    this.api.asc_hideDeletedTextInVersionHistory();
                }
            }
        },

        avatarsUpdate: function(type, users) {
            if (type!=='info') return;

            if (users && users.length>0 ){
                this.panelHistory.storeHistory.each(function(item){
                    var user = _.findWhere(users, {id: item.get('userid')});
                    if (user && (user.image!==undefined)) {
                        if (user.image !== item.get('avatar')) {
                            item.set('avatar', user.image);
                        }
                    }
                });
            }
        },

        onHashError: function() {
            if (!this.panelHistory || !this.panelHistory.storeHistory) return;

            var store = this.panelHistory.storeHistory;
            store.remove(store.where({revision: this.currentRev, level: 1}));

            var rec = store.findWhere({revision: this.currentRev});
            if (rec && this.panelHistory.viewHistoryList) {
                rec.set('hasSubItems', false);
                rec.set('changeid', undefined);
                rec.set('documentSha256', undefined);
                rec.set('url', '');
                this.panelHistory.viewHistoryList.selectRecord(rec);
                this.onSelectRevision(null, null, rec);
            }
            console.log('Received changes that are incompatible with the file version');
        },

        notcriticalErrorTitle: 'Warning'

    }, Common.Controllers.History || {}));
});
