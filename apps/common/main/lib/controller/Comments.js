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
 *  Comments.js
 *
 *  Created on 16.01.14
 *
 */

if (Common === undefined)
    var Common = {};
Common.Controllers = Common.Controllers || {};

define([
    'core',
    'common/main/lib/model/Comment',
    'common/main/lib/collection/Comments',
    'common/main/lib/view/Comments',
    'common/main/lib/view/ReviewPopover'
], function () {
    'use strict';

    // NOTE: temporary solution

    function buildCommentData () {
        if (typeof Asc.asc_CCommentDataWord !== 'undefined') {
            return new Asc.asc_CCommentDataWord(null);
        }

        return new Asc.asc_CCommentData(null);
    }

    Common.Controllers.Comments = Backbone.Controller.extend(_.extend({
        models : [],
        collections : [
            'Common.Collections.Comments'
        ],
        views : [
            'Common.Views.Comments',
            'Common.Views.ReviewPopover'
        ],
        sdkViewName : '#id_main',
        subEditStrings : {},
        filter : undefined,
        hintmode : false,
        fullInfoHintMode: false,
        viewmode: false,
        isSelectedComment : false,
        uids : [],
        oldUids : [],
        isDummyComment : false,

        initialize: function () {

            this.addListeners({
                'Common.Views.Comments': {

                    // comments handlers

                    'comment:add':              _.bind(this.onCreateComment, this),
                    'comment:change':           _.bind(this.onChangeComment, this),
                    'comment:remove':           _.bind(this.onRemoveComment, this),
                    'comment:resolve':          _.bind(this.onResolveComment, this),
                    'comment:show':             _.bind(this.onShowComment, this),

                    // reply handlers

                    'comment:addReply':         _.bind(this.onAddReplyComment, this),
                    'comment:changeReply':      _.bind(this.onChangeReplyComment, this),
                    'comment:removeReply':      _.bind(this.onRemoveReplyComment, this),
                    'comment:editReply':        _.bind(this.onShowEditReplyComment, this),

                    // work handlers

                    'comment:closeEditing':     _.bind(this.closeEditing, this),
                    'comment:sort':             _.bind(this.setComparator, this),
                    'comment:filtergroups':     _.bind(this.setFilterGroups, this)
                },

                'Common.Views.ReviewPopover': {

                    // comments handlers

                    'comment:change':           _.bind(this.onChangeComment, this),
                    'comment:remove':           _.bind(this.onRemoveComment, this),
                    'comment:resolve':          _.bind(this.onResolveComment, this),
                    'comment:show':             _.bind(this.onShowComment, this),

                    // reply handlers

                    'comment:addReply':         _.bind(this.onAddReplyComment, this),
                    'comment:changeReply':      _.bind(this.onChangeReplyComment, this),
                    'comment:removeReply':      _.bind(this.onRemoveReplyComment, this),
                    'comment:editReply':        _.bind(this.onShowEditReplyComment, this),

                    // work handlers

                    'comment:closeEditing':     _.bind(this.closeEditing, this),
                    'comment:disableHint':      _.bind(this.disableHint, this),
                    'comment:addDummyComment':  _.bind(this.onAddDummyComment, this)
                },
                'Common.Views.ReviewChanges': {
                    'comment:removeComments':           _.bind(this.onRemoveComments, this),
                    'comment:resolveComments':          _.bind(this.onResolveComments, this)
                }
            });

            Common.NotificationCenter.on('comments:updatefilter',   _.bind(this.onUpdateFilter, this));
            Common.NotificationCenter.on('app:comment:add',         _.bind(this.onAppAddComment, this));
            Common.NotificationCenter.on('layout:changed', function(area){
                Common.Utils.asyncCall(function(e) {
                    if ( (e == 'toolbar' || e == 'status') && this.view.$el.is(':visible') ) {
                        this.onAfterShow();
                    }
                }, this, area);
            }.bind(this));
            Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
        },
        onLaunch: function () {
            var filter = Common.localStorage.getKeysFilter();
            this.appPrefix = (filter && filter.length) ? filter.split(',')[0] : '';
            this._state = {
                disableEditing: false, // disable editing when disconnect/signed file/mail merge preview/review final or original/forms preview
                docProtection: {
                    isReadOnly: false,
                    isReviewOnly: false,
                    isFormsOnly: false,
                    isCommentsOnly: false
                }
            };

            this.collection                     =   this.getApplication().getCollection('Common.Collections.Comments');
            this.setComparator();

            this.popoverComments                =   new Common.Collections.Comments();
            if (this.popoverComments) {
                this.popoverComments.comparator = function (collection) {
                    return collection.get('time') === null ? new Date().getTime() : collection.get('time');
                };
            }

            this.groupCollection = [];
            this.userGroups = []; // for filtering comments

            this.view = this.createView('Common.Views.Comments', { store: this.collection });
            this.view.render();

            this.userCollection = this.getApplication().getCollection('Common.Collections.Users');
            this.userCollection.on('reset', _.bind(this.onUpdateUsers, this));
            this.userCollection.on('add',   _.bind(this.onUpdateUsers, this));
            Common.NotificationCenter.on('mentions:setusers', this.avatarsUpdate.bind(this));

            this.bindViewEvents(this.view, this.events);
        },
        setConfig: function (data, api) {
            this.setApi(api);

            if (data) {
                this.currentUserId      =   data.config.user.id;
                this.sdkViewName        =   data['sdkviewname'] || this.sdkViewName;
                this.hintmode           =   data['hintmode'] || false;
                this.fullInfoHintMode   =   data['fullInfoHintMode'] || false;
                this.viewmode           =   data['viewmode'] || false;
            }
        },
        setApi: function (api) {
            if (api) {
                this.api = api;

                this.api.asc_registerCallback('asc_onAddComment', _.bind(this.onApiAddComment, this));
                this.api.asc_registerCallback('asc_onAddComments', _.bind(this.onApiAddComments, this));
                this.api.asc_registerCallback('asc_onRemoveComment', _.bind(this.onApiRemoveComment, this));
                this.api.asc_registerCallback('asc_onChangeComments', _.bind(this.onChangeComments, this));
                this.api.asc_registerCallback('asc_onRemoveComments', _.bind(this.onApiRemoveComments, this));
                this.api.asc_registerCallback('asc_onChangeCommentData', _.bind(this.onApiChangeCommentData, this));
                this.api.asc_registerCallback('asc_onLockComment', _.bind(this.onApiLockComment, this));
                this.api.asc_registerCallback('asc_onUnLockComment', _.bind(this.onApiUnLockComment, this));
                this.api.asc_registerCallback('asc_onShowComment', _.bind(this.onApiShowComment, this));
                this.api.asc_registerCallback('asc_onHideComment', _.bind(this.onApiHideComment, this));
                this.api.asc_registerCallback('asc_onUpdateCommentPosition', _.bind(this.onApiUpdateCommentPosition, this));
                this.api.asc_registerCallback('asc_onDocumentPlaceChanged', _.bind(this.onDocumentPlaceChanged, this));
                this.api.asc_registerCallback('asc_onDeleteComment', _.bind(this.onDeleteComment, this)); // only for PE, when del or ctrl+x pressed
                this.api.asc_registerCallback('asc_onChangeCommentLogicalPosition', _.bind(this.onApiChangeCommentLogicalPosition, this)); // change comments position in document
            }
        },

        setMode: function(mode) {
            this.mode = mode;
            this.isModeChanged = true; // change show-comment mode from/to hint mode using canComments flag
            this.view.viewmode = !this.mode.canComments;
            this.view.changeLayout(mode);
            return this;
        },
        //

        setComparator: function(type) {
            if (this.collection) {
                var sort = (type !== undefined);
                if (type === undefined) {
                    type = Common.localStorage.getItem(this.appPrefix + "comments-sort") || 'date-desc';
                }
                Common.localStorage.setItem(this.appPrefix + "comments-sort", type);
                Common.Utils.InternalSettings.set(this.appPrefix + "comments-sort", type);

                if (type=='position-asc' || type=='position-desc') {
                    var direction = (type=='position-asc') ? 1 : -1;
                    this.collection.comparator = function (collection) {
                        return direction * collection.get('position');
                    };
                } else if (type=='author-asc' || type=='author-desc') {
                    var direction = (type=='author-asc') ? 1 : -1;
                    this.collection.comparator = function(item1, item2) {
                        var n1 = item1.get('parsedName').toLowerCase(),
                            n2 = item2.get('parsedName').toLowerCase();
                        if (n1==n2) return 0;
                        return (n1<n2) ? -direction : direction;
                    };
                } else { // date
                    var direction = (type=='date-asc') ? 1 : -1;
                    this.collection.comparator = function (collection) {
                        return collection.get('time') === null
                            ? new Date().getTime()
                            : direction * collection.get('time');
                    };
                }
                sort && this.updateComments(true);
            }
        },

        getComparator: function() {
            return Common.Utils.InternalSettings.get(this.appPrefix + "comments-sort") || 'date';
        },

        onCreateComment: function (panel, commentVal, editMode, hidereply, documentFlag) {
            if (this.api && commentVal && commentVal.length > 0) {
                var comment = buildCommentData();   //  new asc_CCommentData(null);
                if (comment) {
                    this.showPopover        =   true;
                    this.editPopover        =   editMode ? true : false;
                    this.hidereply          =   hidereply;
                    this.isSelectedComment  =   false;
                    this.uids               =   [];

                    comment.asc_putText(commentVal);
                    comment.asc_putTime(this.utcDateToString(new Date()));
                    comment.asc_putOnlyOfficeTime(this.ooDateToString(new Date()));
                    comment.asc_putUserId(this.currentUserId);
                    comment.asc_putUserName(AscCommon.UserInfoParser.getCurrentName());
                    comment.asc_putSolved(false);

                    if (!_.isUndefined(comment.asc_putDocumentFlag)) {
                        comment.asc_putDocumentFlag(documentFlag);
                    }

                    this.api.asc_addComment(comment);
                    this.view.showEditContainer(false);
                }
            }

            this.view.txtComment.focus();
        },
        onRemoveComment: function (id) {
            if (this.api && id) {
                this.api.asc_removeComment(id);
            }
        },
        onRemoveComments: function (type) {
            if (this.api) {
                this.api.asc_RemoveAllComments(type=='my' || !this.mode.canDeleteComments, type=='current');// 1 param = true if remove only my comments, 2 param - remove current comments
            }
        },

        onResolveComments: function (type) {
            if (this.api) {
                this.api.asc_ResolveAllComments(type=='my' || !this.mode.canEditComments, type=='current');// 1 param = true if resolve only my comments, 2 param - resolve current comments
            }
        },

        onResolveComment: function (uid) {
            var t = this, reply = null, comment = t.findComment(uid);

            if (_.isUndefined(uid)) {
                uid = comment.get('uid');
            }

            if (comment) {
                var ascComment = t.buildComment(comment);
                if (!ascComment) {
                    return false;
                }

                ascComment.asc_putSolved(!comment.get('resolved'));

                reply = comment.get('replys');
                if (reply && reply.length) {
                    reply.forEach(function (reply) {
                        var ascReply = t.buildReplyComment(reply);
                        if (ascReply) {
                            ascComment.asc_addReply(ascReply);
                        }
                    });
                }

                t.api.asc_changeComment(uid, ascComment);

                return true;
            }

            return false;
        },
        onShowComment: function (id, selected, fromLeftPanelSelection) {
            var comment = this.findComment(id);
            if (comment) {
                if (null !== comment.get('quote')) {
                    if (this.api) {

                        if (this.hintmode) {
                            this.animate = true;

                            if (comment.get('unattached')) {
                                if (this.getPopover()) {
                                    this.getPopover().hideComments();
                                    return;
                                }
                            }
                        } else {
                            var model = this.popoverComments.findWhere({uid: id});
                            if (model && !this.getPopover().isVisible()) {
                                this.getPopover().showComments(true);
                                this.api.asc_selectComment(id);
                                return;
                            }
                        }

                        if (!_.isUndefined(selected) && this.hintmode) {
                            this.isSelectedComment = selected;
                        }

                        if (!fromLeftPanelSelection || !((0 === _.difference(this.uids, [id]).length) && (0 === _.difference([id], this.uids).length))) { 
                            this.api.asc_selectComment(id);
                            this._dontScrollToComment = true;
                            this.api.asc_showComment(id,false);
                        }
                    }
                } else {

                    if (this.hintmode) {
                        this.api.asc_selectComment(id);
                    }

                    if (this.getPopover()) {
                        this.getPopover().hideComments();
                    }

                    this.isSelectedComment = false;
                    this.uids = [];
                }
            }
        },
        onChangeComment: function (id, commentVal) {
            if (commentVal && commentVal.length > 0) {
                var t = this, comment2 = null, comment = t.findComment(id), oldCommentVal = '';

                if (comment) {
                    var ascComment = t.buildComment(comment);
                    if (!ascComment) {
                        return false;
                    }

                    ascComment.asc_putText(commentVal);
                    ascComment.asc_putUserId(t.currentUserId);
                    ascComment.asc_putUserName(AscCommon.UserInfoParser.getCurrentName());

                    oldCommentVal = comment.get('comment');

                    comment.set('editTextInPopover', false);

                    comment2 = t.findPopupComment(id);
                    if (comment2) {
                        comment2.set('editTextInPopover', false);
                    }

                    if (t.subEditStrings[id]) { delete t.subEditStrings[id]; }
                    if (t.subEditStrings[id + '-R']) { delete t.subEditStrings[id + '-R']; }

                    var replies = comment.get('replys');

                    if (replies && replies.length) {
                        replies.forEach(function (reply) {
                            var ascReply = t.buildReplyComment(reply);
                            if (ascReply) {
                                ascComment.asc_addReply(ascReply);
                            }
                        });
                    }

                    t.api.asc_changeComment(id, ascComment);
                    t.mode && t.mode.canRequestSendNotify && t.view.pickEMail(ascComment.asc_getGuid(), commentVal, oldCommentVal);

                    return true;
                }
            }

            return false;
        },
        onChangeReplyComment: function (id, replyId, replyVal) {
            if (replyVal && replyVal.length > 0) {
                var me = this,
                    addReply = null,
                    comment = me.findComment(id),
                    oldReplyVal = '';

                if (comment) {
                    var ascComment = me.buildComment(comment);
                    if (!ascComment) {
                        return false;
                    }

                    var replies = comment.get('replys');

                    if (replies && replies.length) {
                        replies.forEach(function (reply) {
                            addReply = buildCommentData();   //  new asc_CCommentData();
                            if (addReply) {
                                if (reply.get('id') === replyId && !_.isUndefined(replyVal)) {
                                    oldReplyVal = reply.get('reply');
                                    addReply.asc_putText(replyVal);
                                    addReply.asc_putUserId(me.currentUserId);
                                    addReply.asc_putUserName(AscCommon.UserInfoParser.getCurrentName());
                                } else {
                                    addReply.asc_putText(reply.get('reply'));
                                    addReply.asc_putUserId(reply.get('userid'));
                                    addReply.asc_putUserName(reply.get('username'));
                                }

                                addReply.asc_putTime(reply.get('time') ? me.utcDateToString(new Date(reply.get('time'))) : '');
                                addReply.asc_putOnlyOfficeTime(reply.get('time') ? me.ooDateToString(new Date(reply.get('time'))) : '');
                                addReply.asc_putUserData(reply.get('userdata'));

                                ascComment.asc_addReply(addReply);
                            }
                        });
                    }

                    me.api.asc_changeComment(id, ascComment);
                    me.mode && me.mode.canRequestSendNotify && me.view.pickEMail(ascComment.asc_getGuid(), replyVal, oldReplyVal);
                    return true;
                }
            }

            return false;
        },
        onAddReplyComment: function (id, replyVal) {
            if (replyVal.length > 0) {
                var me = this, uid = null, comment = me.findComment(id);

                if (comment) {
                    uid = comment.get('uid');
                    if (uid) {
                        if (me.subEditStrings[uid]) { delete me.subEditStrings[uid]; }
                        if (me.subEditStrings[uid + '-R']) { delete me.subEditStrings[uid + '-R']; }
                        comment.set('showReplyInPopover', false);
                    }

                    var ascComment = me.buildComment(comment);
                    if (!ascComment) {
                        return false;
                    }

                    var replies = comment.get('replys');
                    if (replies && replies.length) {
                        replies.forEach(function (reply) {
                            var ascReply = me.buildReplyComment(reply);
                            if (ascReply) {
                                ascComment.asc_addReply(ascReply);
                            }
                        });
                    }

                    var addReply = buildCommentData();   //  new asc_CCommentData(null);
                    if (addReply) {
                        addReply.asc_putText(replyVal);
                        addReply.asc_putTime(me.utcDateToString(new Date()));
                        addReply.asc_putOnlyOfficeTime(me.ooDateToString(new Date()));
                        addReply.asc_putUserId(me.currentUserId);
                        addReply.asc_putUserName(AscCommon.UserInfoParser.getCurrentName());

                        ascComment.asc_addReply(addReply);

                        me.api.asc_changeComment(id, ascComment);
                        me.mode && me.mode.canRequestSendNotify && me.view.pickEMail(ascComment.asc_getGuid(), replyVal);

                        return true;
                    }
                }
            }

            return false;
        },
        onRemoveReplyComment: function (id, replyId) {
            if (!_.isUndefined(id) && !_.isUndefined(replyId)) {
                var me = this, comment = me.findComment(id);

                if (comment) {
                    var ascComment = me.buildComment(comment);
                    if (!ascComment) {
                        return false;
                    }

                    var replies = comment.get('replys');

                    if (replies && replies.length) {
                        replies.forEach(function (reply) {
                            if (reply.get('id') !== replyId) {
                                var ascReply = me.buildReplyComment(reply);
                                if (ascReply) {
                                    ascComment.asc_addReply(ascReply);
                                }
                            }
                        });
                    }

                    me.api.asc_changeComment(id, ascComment);

                    return true;
                }
            }

            return false;
        },
        onShowEditReplyComment: function (id, replyId, inpopover) {
            var i, model, repliesSrc, repliesCopy;

            if (!_.isUndefined(id) && !_.isUndefined(replyId)) {
                if (inpopover) {
                    model = this.popoverComments.findWhere({uid: id});
                    if (model) {
                        repliesSrc = model.get('replys');
                        repliesCopy = _.clone(model.get('replys'));
                        if (repliesCopy) {
                            for (i = 0; i < repliesCopy.length; ++i) {
                                if (replyId === repliesCopy[i].get('id')) {
                                    repliesCopy[i].set('editTextInPopover', true);

                                    repliesSrc.length = 0;
                                    model.set('replys', repliesCopy);

                                    return true;
                                }
                            }
                        }
                    }
                } else {
                    model = this.collection.findWhere({uid: id});
                    if (model) {
                        repliesSrc = model.get('replys');
                        repliesCopy = _.clone(model.get('replys'));
                        if (repliesCopy) {
                            for (i = 0; i < repliesCopy.length; ++i) {
                                if (replyId === repliesCopy[i].get('id')) {
                                    repliesCopy[i].set('editText', true);

                                    repliesSrc.length = 0;
                                    model.set('replys', repliesCopy);

                                    return true;
                                }
                            }
                        }
                    }
                }
            }

            return false;
        },

        onUpdateFilter: function (filter, applyOnly) {
            if (filter) {
                if (!this.view.isVisible()) {
                    this.view.needUpdateFilter = filter;
                    applyOnly = true;
                }
                this.filter = filter;

                var me = this,
                    comments = [];
                this.filter.forEach(function(item){
                    if (!me.groupCollection[item])
                        me.groupCollection[item] = new Backbone.Collection([], { model: Common.Models.Comment});
                    comments = comments.concat(me.groupCollection[item].models);
                });
                this.collection.reset(comments);
                this.collection.groups = this.filter;

                if (!applyOnly) {
                    if (this.getPopover()) {
                        this.getPopover().hide();
                    }
                    this.view.needUpdateFilter = false;

                    var end = true;
                    for (var i = this.collection.length - 1; i >= 0; --i) {
                        var item = this.collection.at(i);
                        if (end && !item.get('hide') && !item.get('filtered')) {
                            item.set('last', true, {silent: true});
                            end = false;
                        } else {
                            if (item.get('last')) {
                                item.set('last', false, {silent: true});
                            }
                        }
                    }
                    this.view.render();
                    this.view.update();
                }
            }
        },
        onAppAddComment: function (sender, to_doc) {
            if ( !!this.api.can_AddQuotedComment && this.api.can_AddQuotedComment() === false || to_doc) return;
            this.addDummyComment();
        },

        addCommentToGroupCollection: function(comment) {
            var groupname = comment.get('groupName');
            if (!this.groupCollection[groupname])
                this.groupCollection[groupname] = new Backbone.Collection([], { model: Common.Models.Comment});
            this.groupCollection[groupname].push(comment);
        },

        // SDK

        onApiAddComment: function (id, data) {
            var requestObj = {},
                comment = this.readSDKComment(id, data, requestObj);
            if (comment) {
                if (comment.get('groupName')) {
                    this.addCommentToGroupCollection(comment);
                    (_.indexOf(this.collection.groups, comment.get('groupName'))>-1) && this.collection.push(comment);
                } else
                    this.collection.push(comment);

                this.updateComments(true, this.getComparator() === 'position-asc' || this.getComparator() === 'position-desc'); // don't sort by position

                if (this.showPopover) {
                    if (null !== data.asc_getQuoteText()) {
                        this.api.asc_selectComment(id);
                        this._dontScrollToComment = true;
                        this.api.asc_showComment(id, true);
                    }

                    this.showPopover = undefined;
                    this.editPopover = false;
                }
                requestObj.arrIds && requestObj.arrIds.length && Common.UI.ExternalUsers.get('info', requestObj.arrIds);
            }
        },
        onApiAddComments: function (data) {
            var requestObj = {};
            for (var i = 0; i < data.length; ++i) {
                var comment = this.readSDKComment(data[i].asc_getId(), data[i], requestObj);
                comment.get('groupName') ? this.addCommentToGroupCollection(comment) : this.collection.push(comment);
            }
            this.updateComments(true, this.getComparator() === 'position-asc' || this.getComparator() === 'position-desc');
            requestObj.arrIds && requestObj.arrIds.length && Common.UI.ExternalUsers.get('info', requestObj.arrIds);
        },
        onApiRemoveComment: function (id, silentUpdate) {
            for (var name in this.groupCollection) {
                var store = this.groupCollection[name],
                    model = store.findWhere({uid: id});
                if (model) {
                    store.remove(model);
                    break;
                }
            }
            if (this.collection.length) {
                var model = this.collection.findWhere({uid: id});
                if (model) {
                    this.collection.remove(model);
                    if (!silentUpdate) {
                        this.updateComments(true);
                    }
                }

                if (this.popoverComments.length) {
                    model = this.popoverComments.findWhere({uid: id});
                    if (model) {
                        this.popoverComments.remove(model);
                        if (0 === this.popoverComments.length) {
                            if (this.getPopover()) {
                                this.getPopover().hideComments();
                            }
                        }
                    }
                }
            }
        },
        onChangeComments: function (data) {
            for (var i = 0; i < data.length; ++i) {
                this.onApiChangeCommentData(data[i].Comment.Id, data[i].Comment, true);
            }

            this.updateComments(true);
        },
        onApiRemoveComments: function (data) {
            for (var i = 0; i < data.length; ++i) {
                this.onApiRemoveComment(data[i], true);
            }

            this.updateComments(true);
        },
        onApiChangeCommentData: function (id, data, silentUpdate) {
            var t = this,
                i = 0,
                date = null,
                replies = null,
                repliesCount = 0,
                dateReply = null,
                comment = this.findComment(id) || this.findCommentInGroup(id);

            if (comment) {
                t = this;

                date = (data.asc_getOnlyOfficeTime()) ? new Date(this.stringOOToLocalDate(data.asc_getOnlyOfficeTime())) :
                       ((data.asc_getTime() == '') ? null : new Date(this.stringUtcToLocalDate(data.asc_getTime())));

                var userid = data.asc_getUserId(),
                    user = this.userCollection.findOriginalUser(userid),
                    avatar = Common.UI.ExternalUsers.getImage(userid),
                    arrIds = [];
                (avatar===undefined) && arrIds.push(userid);
                var hideComment = !AscCommon.UserInfoParser.canViewComment(data.asc_getUserName()),
                    needSort = (this.getComparator() == 'author-asc' || this.getComparator() == 'author-desc') && (data.asc_getUserName() !== comment.get('username')) ||
                                hideComment !== comment.get('hide');
                comment.set('comment',  data.asc_getText());
                comment.set('userid',   userid);
                comment.set('username', data.asc_getUserName());
                comment.set('initials', Common.Utils.getUserInitials(AscCommon.UserInfoParser.getParsedName(data.asc_getUserName())));
                comment.set('parsedName', AscCommon.UserInfoParser.getParsedName(data.asc_getUserName()));
                comment.set('parsedGroups', AscCommon.UserInfoParser.getParsedGroups(data.asc_getUserName()));
                comment.set('usercolor', (user) ? user.get('color') : Common.UI.ExternalUsers.getColor(userid || data.asc_getUserName()));
                comment.set('avatar',   avatar);
                comment.set('resolved', data.asc_getSolved());
                comment.set('quote',    data.asc_getQuoteText());
                comment.set('userdata', data.asc_getUserData());
                comment.set('time',     date ? date.getTime() : null);
                comment.set('date',     date ? t.dateToLocaleTimeString(date) : null);
                comment.set('editable', (t.mode.canEditComments || (userid == t.currentUserId)) && AscCommon.UserInfoParser.canEditComment(data.asc_getUserName()));
                comment.set('removable', (t.mode.canDeleteComments || (userid == t.currentUserId)) && AscCommon.UserInfoParser.canDeleteComment(data.asc_getUserName()));
                comment.set('hide', hideComment);

                if (!comment.get('hide')) {
                    var usergroups = comment.get('parsedGroups');
                    t.fillUserGroups(usergroups);
                    var group = Common.Utils.InternalSettings.get(t.appPrefix + "comments-filtergroups");
                    var filter = !!group && (group!==-1) && (!usergroups || usergroups.length<1 || usergroups.indexOf(group)<0);
                    comment.set('filtered', filter);
                }

                replies = _.clone(comment.get('replys'));

                replies.length = 0;

                repliesCount = data.asc_getRepliesCount();
                for (i = 0; i < repliesCount; ++i) {

                    dateReply = (data.asc_getReply(i).asc_getOnlyOfficeTime()) ? new Date(this.stringOOToLocalDate(data.asc_getReply(i).asc_getOnlyOfficeTime())) :
                                ((data.asc_getReply(i).asc_getTime() == '') ? null : new Date(this.stringUtcToLocalDate(data.asc_getReply(i).asc_getTime())));

                    userid = data.asc_getReply(i).asc_getUserId();
                    user = this.userCollection.findOriginalUser(userid);
                    avatar = Common.UI.ExternalUsers.getImage(userid);
                    (avatar===undefined) && arrIds.push(userid);
                    replies.push(new Common.Models.Reply({
                        id                  : Common.UI.getId(),
                        userid              : userid,
                        username            : data.asc_getReply(i).asc_getUserName(),
                        initials            : Common.Utils.getUserInitials(AscCommon.UserInfoParser.getParsedName(data.asc_getReply(i).asc_getUserName())),
                        parsedName          : AscCommon.UserInfoParser.getParsedName(data.asc_getReply(i).asc_getUserName()),
                        usercolor           : (user) ? user.get('color') : Common.UI.ExternalUsers.getColor(userid || data.asc_getReply(i).asc_getUserName()),
                        avatar              : avatar,
                        date                : dateReply ? t.dateToLocaleTimeString(dateReply) : null,
                        reply               : data.asc_getReply(i).asc_getText(),
                        userdata            : data.asc_getReply(i).asc_getUserData(),
                        time                : dateReply ? dateReply.getTime() : null,
                        editText            : false,
                        editTextInPopover   : false,
                        showReplyInPopover  : false,
                        scope               : t.view,
                        editable            : (t.mode.canEditComments || (userid == t.currentUserId)) && AscCommon.UserInfoParser.canEditComment(data.asc_getReply(i).asc_getUserName()),
                        removable           : (t.mode.canDeleteComments || (userid == t.currentUserId)) && AscCommon.UserInfoParser.canDeleteComment(data.asc_getReply(i).asc_getUserName())
                    }));
                }

                comment.set('replys', replies);

                if (!this.popoverComments.findWhere({hide: false})) {
                    this.getPopover() && this.getPopover().hideComments();
                }

                if (!silentUpdate) {
                    this.updateComments(needSort, !needSort);

                    // if (this.getPopover() && this.getPopover().isVisible()) {
                    //     this._dontScrollToComment = true;
                    //     this.api.asc_showComment(id, true);
                    // }
                }
                arrIds.length && Common.UI.ExternalUsers.get('info', arrIds);
            }
        },
        onApiLockComment: function (id,userId) {
            var cur = this.findComment(id) || this.findCommentInGroup(id),
                user = null;

            if (cur) {
                if (this.userCollection) {
                    user = this.userCollection.findUser(userId);
                    if (user) {
                        this.getPopover() && this.getPopover().saveText();
                        this.view.saveText();
                        cur.set('lock', true);
                        cur.set('lockuserid', this.view.getUserName(user.get('username')));
                    }
                }
            }
        },
        onApiUnLockComment: function (id) {
            var cur = this.findComment(id) || this.findCommentInGroup(id);
            if (cur) {
                cur.set('lock', false);
                this.getPopover() && this.getPopover().loadText();
                this.view.loadText();
            }
        },
        onApiShowComment: function (uids, posX, posY, leftX, opts, hint) {
            var apihint = hint;
            var same_uids = (0 === _.difference(this.uids, uids).length) && (0 === _.difference(uids, this.uids).length);
            
            if (hint && this.isSelectedComment && same_uids && !this.isModeChanged) {
                // хотим показать тот же коментарий что был и выбран
                return;
            }

            var popover = this.getPopover();
            if (popover) {
                this.clearDummyComment();

                if (this.isSelectedComment && same_uids && !this.isModeChanged) {
                    //NOTE: click to sdk view ?
                    if (this.api) {
                        //this.view.txtComment.blur();
                        popover.commentsView && popover.commentsView.setFocusToTextBox(true);
                        this.api.asc_enableKeyEvents(true);
                    }

                    return;
                }

                var i = 0,
                    saveTxtId = '',
                    saveTxtReplyId = '',
                    comment = null,
                    text = '',
                    animate = true,
                    comments = [];

                for (i = 0; i < uids.length; ++i) {
                    saveTxtId = uids[i];
                    saveTxtReplyId = uids[i] + '-R';
                    comment = this.findComment(saveTxtId);

                    if (!comment) continue;

                    if (this.subEditStrings[saveTxtId] && (comment.get('fullInfoInHint') || !hint)) {
                        comment.set('editTextInPopover', true);
                        text = this.subEditStrings[saveTxtId];
                    }
                    else if (this.subEditStrings[saveTxtReplyId] && (comment.get('fullInfoInHint') || !hint)) {
                        comment.set('showReplyInPopover', true);
                        text = this.subEditStrings[saveTxtReplyId];
                    }

                    comment.set('hint', !_.isUndefined(hint) ? hint : false);

                    if (!hint && this.hintmode) {
                        if (same_uids)
                            animate = false;

                        if (this.oldUids.length && (0 === _.difference(this.oldUids, uids).length) && (0 === _.difference(uids, this.oldUids).length)) {
                            animate = false;
                            this.oldUids = [];
                        }

                        if (same_uids && !apihint && !this.isModeChanged)
                            this.api.asc_selectComment(comment.get('uid'));
                    }

                    if (this.animate) {
                        animate = this.animate;
                        this.animate = false;
                    }

                    this.isSelectedComment = !apihint || !this.hintmode;
                    this.uids = _.clone(uids);

                    comments.push(comment);
                    if (!this._dontScrollToComment)
                        this.view.commentsView.scrollToRecord(comment);
                    this._dontScrollToComment = false;
                }

                this.popoverComments.reset(comments);

                if (this.popoverComments.findWhere({hide: false})) {
                    if (popover.isVisible() && (!same_uids || this.isModeChanged)) {
                        popover.hide();
                    }

                    popover.setLeftTop(posX, posY, leftX);
                    popover.showComments(animate, false, true, text);
                } else
                    popover.hideComments();
            }
            this.isModeChanged = false;
        },
        onApiHideComment: function (hint) {
            var t = this;

            if (this.getPopover()) {
                if (this.isSelectedComment && hint) {
                    return;
                }

                if (hint && this.getPopover().isCommentsViewMouseOver()) return;

                this.popoverComments.each(function (model) {
                    if (model.get('editTextInPopover')) {
                        t.subEditStrings[model.get('uid')] = t.getPopover().getEditText();
                    }

                    if (model.get('showReplyInPopover')) {
                        t.subEditStrings[model.get('uid') + '-R'] = t.getPopover().getEditText();
                    }
                });

                this.getPopover().saveText(true);
                this.getPopover().hideComments();

                this.collection.clearEditing();
                this.popoverComments.clearEditing();

                this.oldUids = _.clone(this.uids);
                this.isSelectedComment = false;
                this.uids = [];

                this.popoverComments.reset();
            }
        },
        onApiUpdateCommentPosition: function (uids, posX, posY, leftX) {
            var i, useAnimation = false,
                comment = null,
                text = undefined,
                saveTxtId = '',
                saveTxtReplyId = '';

            if (this.getPopover()) {
                this.getPopover().saveText();
                this.getPopover().hideTips();

                if (posY < 0 || this.getPopover().sdkBounds.height < posY || (!_.isUndefined(leftX) && this.getPopover().sdkBounds.width < leftX)) {
                    this.getPopover().hide();
                } else {
                    if (this.isModeChanged)
                        this.onApiShowComment(uids, posX, posY, leftX);
                    if (0 === this.popoverComments.length) {
                        var comments = [];
                        for (i = 0; i < uids.length; ++i) {
                            saveTxtId = uids[i];
                            saveTxtReplyId = uids[i] + '-R';
                            comment = this.findComment(saveTxtId);

                            if (!comment) continue;

                            if (this.subEditStrings[saveTxtId]) {
                                comment.set('editTextInPopover', true);
                                text = this.subEditStrings[saveTxtId];
                            }
                            else if (this.subEditStrings[saveTxtReplyId]) {
                                comment.set('showReplyInPopover', true);
                                text = this.subEditStrings[saveTxtReplyId];
                            }

                            comments.push(comment);
                        }

                        this.popoverComments.reset(comments);

                        if (this.popoverComments.findWhere({hide: false})) {
                            useAnimation = true;
                            this.getPopover().showComments(useAnimation, undefined, undefined, text);
                        } else
                            this.getPopover().hideComments();
                    } else if (!this.getPopover().isVisible() && this.popoverComments.findWhere({hide: false})) {
                        this.getPopover().showComments(false, undefined, undefined, text);
                    }

                    this.getPopover().setLeftTop(posX, posY, leftX, undefined, true);

//                    if (this.isSelectedComment && (0 === _.difference(this.uids, uids).length)) {
                        //NOTE: click to sdk view ?
//                        if (this.api) {
//                            this.view.txtComment.blur();
//                            this.getPopover().commentsView.setFocusToTextBox(true);
//                            this.api.asc_enableKeyEvents(true);
//                        }
//                    }
                }
            }
        },
        onDocumentPlaceChanged: function () {
            if (this.isDummyComment && this.getPopover()) {
                if (this.getPopover().isVisible()) {
                    var anchor = this.api.asc_getAnchorPosition();
                    if (anchor) {
                        this.getPopover().setLeftTop(anchor.asc_getX() + anchor.asc_getWidth(),
                            anchor.asc_getY(),
                            this.hintmode ? anchor.asc_getX() : undefined);
                    }
                }
            }
        },

        onDeleteComment: function (id, comment) {
            if (this.api) {
                this.api.asc_RemoveAllComments(!this.mode.canDeleteComments, true);// 1 param = true if remove only my comments, 2 param - remove current comments
            }
        },

        onApiChangeCommentLogicalPosition: function (comments) {
            for (var uid in comments) {
                if (comments.hasOwnProperty(uid)) {
                    var comment = this.findComment(uid) || this.findCommentInGroup(uid);
                    comment && comment.set('position', comments[uid]);
                }
            }
            (this.getComparator() === 'position-asc' || this.getComparator() === 'position-desc') && this.updateComments(true);
        },

        // internal

        updateComments: function (needRender, disableSort, loadText) {
            var me = this;
            me.updateCommentsTime = new Date();
            me.disableSort = !!disableSort;
            if (me.timerUpdateComments===undefined)
                me.timerUpdateComments = setInterval(function(){
                    if ((new Date()) - me.updateCommentsTime>100) {
                        clearInterval(me.timerUpdateComments);
                        me.timerUpdateComments = undefined;
                        me.updateCommentsView(needRender, me.disableSort, loadText);
                    }
               }, 25);
        },

        updateCommentsView: function (needRender, disableSort, loadText) {
            if (needRender && !this.view.isVisible()) {
                this.view.needRender = needRender;
                this.onUpdateFilter(this.filter, true);
                return;
            }

            var i, end = true;

            if (!disableSort) {
                this.collection.sort();
            }

            if (needRender) {
                this.onUpdateFilter(this.filter, true);

                for (i = this.collection.length - 1; i >= 0; --i) {
                    var item = this.collection.at(i);
                    if (end && !item.get('hide') && !item.get('filtered')) {
                        item.set('last', true, {silent: true});
                        end = false;
                    } else {
                        if (item.get('last')) {
                            item.set('last', false, {silent: true});
                        }
                    }
                }

                this.view.render();
                this.view.needRender = false;
            }

            this.view.update();

            loadText && this.view.loadText();
        },
        findComment: function (uid) {
            return this.collection.findWhere({uid: uid});
        },
        findPopupComment: function (id) {
            return this.popoverComments.findWhere({id: id});
        },
        findCommentInGroup: function (id) {
            for (var name in this.groupCollection) {
                var store = this.groupCollection[name],
                    model = store.findWhere({uid: id});
                if (model) return model;
            }
        },

        closeEditing: function (id) {
            var t = this;

            if (!_.isUndefined(id)) {
                var comment2 = this.findPopupComment(id);
                if (comment2) {
                    comment2.set('editTextInPopover', false);
                    comment2.set('showReplyInPopover', false);
                }

                if (this.subEditStrings[id]) { delete this.subEditStrings[id]; }
                if (this.subEditStrings[id + '-R']) { delete this.subEditStrings[id + '-R']; }
            }

            this.collection.clearEditing();
            this.collection.each(function (model) {
                var replies = _.clone(model.get('replys'));
                model.get('replys').length = 0;

                replies.forEach(function (reply) {
                    if (reply.get('editText'))
                        reply.set('editText', false);
                    if (reply.get('editTextInPopover'))
                        reply.set('editTextInPopover', false);
                });

                model.set('replys', replies);
            });

            this.view.showEditContainer(false);
            this.view.update();
        },
        disableHint: function (comment) {
            if (comment && this.mode.canComments) {
                comment.set('hint', false);
                this.api.asc_showComment(comment.get('uid'), false);

                this.isSelectedComment = true;
            }
        },
        blockPopover: function (flag) {
            this.isSelectedComment = flag;
            if (flag) {
                if (this.getPopover().isVisible()) {
                    this.getPopover().hide();
                }
            }
        },

        getPopover: function () {
            if (_.isUndefined(this.popover)) {
                this.popover = Common.Views.ReviewPopover.prototype.getPopover({
                    commentsStore : this.popoverComments,
                    renderTo : this.sdkViewName,
                    canRequestUsers: (this.mode) ? this.mode.canRequestUsers : undefined,
                    canRequestSendNotify: (this.mode) ? this.mode.canRequestSendNotify : undefined,
                    mentionShare: (this.mode) ? this.mode.mentionShare : true,
                    api: this.api
                });
                this.popover.setCommentsStore(this.popoverComments);
            }
            return this.popover;
        },

        // helpers

        onUpdateUsers: function() {
            var users = this.userCollection,
                hasGroup = false,
                updateCommentData = function(comment, user, isNotReply) {
                    var color = (user) ? user.get('color') : Common.UI.ExternalUsers.getColor(comment.get('userid')),
                        needrender = false;
                    if (color !== comment.get('usercolor')) {
                        needrender = true;
                        comment.set('usercolor', color, {silent: true});
                    }
                    if (user && (user.image!==undefined)) {
                        if (user.image !== comment.get('avatar')) {
                            needrender = true;
                            comment.set('avatar', user.image, {silent: true});
                        }
                    }

                    //If a comment and not a reply
                    if(isNotReply){
                        comment.get('replys').forEach(function (reply) {
                            var needrenderReply = updateCommentData(reply, users.findOriginalUser(reply.get('userid')), false);
                            needrender = needrenderReply || needrender;
                        });
                        
                        if (needrender)
                            comment.trigger('change');
                    }

                    return needrender;
                };
            
            for (var name in this.groupCollection) {
                hasGroup = true;
                this.groupCollection[name].each(function (comment) {
                    updateCommentData(comment, users.findOriginalUser(comment.get('userid')), true);
                });
            }
            !hasGroup && this.collection.each(function (comment) {
                updateCommentData(comment, users.findOriginalUser(comment.get('userid')), true);
            });
        },

        avatarsUpdate: function(type, users) {
            if (type!=='info') return;

            var hasGroup = false,
                updateCommentData = function(comment, isNotReply) {
                    var user = _.findWhere(users, {id: comment.get('userid')}),
                        needrender = false;
                    if (user && (user.image!==undefined)) {
                        var avatar = user.image;
                        if (avatar !== comment.get('avatar')) {
                            needrender = true;
                            comment.set('avatar', avatar, {silent: true});
                        }
                    }

                    //If a comment and not a reply
                    if(isNotReply){
                        comment.get('replys').forEach(function (reply) {
                            var needrenderReply = updateCommentData(reply, false);
                            needrender = needrenderReply || needrender;
                        });

                        if (needrender)
                            comment.trigger('change');
                    }

                    return needrender;
                };

            for (var name in this.groupCollection) {
                hasGroup = true;
                this.groupCollection[name].each(function (comment) {
                    updateCommentData(comment, true);
                });
            }
            !hasGroup && this.collection.each(function (comment) {
                updateCommentData(comment, true);
            });
        },

        readSDKComment: function (id, data, requestObj) {
            requestObj && !requestObj.arrIds && (requestObj.arrIds = []);
            var date = (data.asc_getOnlyOfficeTime()) ? new Date(this.stringOOToLocalDate(data.asc_getOnlyOfficeTime())) :
                ((data.asc_getTime() == '') ? null : new Date(this.stringUtcToLocalDate(data.asc_getTime())));
            var userid = data.asc_getUserId(),
                user = this.userCollection.findOriginalUser(userid),
                groupname = id.substr(0, id.lastIndexOf('_')+1).match(/^(doc|sheet[0-9_]+)_/),
                avatar = Common.UI.ExternalUsers.getImage(userid);
            (avatar===undefined) && requestObj.arrIds.push(userid);
            var comment = new Common.Models.Comment({
                uid                 : id,
                guid                : data.asc_getGuid(),
                userid              : userid,
                username            : data.asc_getUserName(),
                initials            : Common.Utils.getUserInitials(AscCommon.UserInfoParser.getParsedName(data.asc_getUserName())),
                parsedName          : AscCommon.UserInfoParser.getParsedName(data.asc_getUserName()),
                parsedGroups        : AscCommon.UserInfoParser.getParsedGroups(data.asc_getUserName()),
                usercolor           : (user) ? user.get('color') : Common.UI.ExternalUsers.getColor(userid || data.asc_getUserName()),
                avatar              : avatar,
                date                : date ? this.dateToLocaleTimeString(date) : null,
                quote               : data.asc_getQuoteText(),
                comment             : data.asc_getText(),
                resolved            : data.asc_getSolved(),
                unattached          : !_.isUndefined(data.asc_getDocumentFlag) ? data.asc_getDocumentFlag() : false,
                userdata            : data.asc_getUserData(),
                id                  : Common.UI.getId(),
                time                : date ? date.getTime() : null,
                showReply           : false,
                editText            : false,
                last                : undefined,
                editTextInPopover   : (this.editPopover ? true : false),
                showReplyInPopover  : false,
                hideAddReply        : !_.isUndefined(this.hidereply) ? this.hidereply : (this.showPopover ? true : false),
                scope               : this.view,
                editable            : (this.mode.canEditComments || (userid == this.currentUserId)) && AscCommon.UserInfoParser.canEditComment(data.asc_getUserName()),
                removable           : (this.mode.canDeleteComments || (userid == this.currentUserId)) && AscCommon.UserInfoParser.canDeleteComment(data.asc_getUserName()),
                hide                : !AscCommon.UserInfoParser.canViewComment(data.asc_getUserName()),
                hint                : !this.mode.canComments,
                fullInfoInHint      : this.fullInfoHintMode,
                groupName           : (groupname && groupname.length>1) ? groupname[1] : null
            });
            if (comment) {
                if (!comment.get('hide')) {
                    var usergroups = comment.get('parsedGroups');
                    this.fillUserGroups(usergroups);
                    var group = Common.Utils.InternalSettings.get(this.appPrefix + "comments-filtergroups");
                    var filter = !!group && (group!==-1) && (!usergroups || usergroups.length<1 || usergroups.indexOf(group)<0);
                    comment.set('filtered', filter);
                }
                var replies = this.readSDKReplies(data, requestObj);
                if (replies.length) {
                    comment.set('replys', replies);
                }
            }

            return comment;
        },
        readSDKReplies: function (data, requestObj) {
            requestObj && !requestObj.arrIds && (requestObj.arrIds = []);
            var i = 0,
                replies = [],
                date = null;
            var repliesCount = data.asc_getRepliesCount();
            if (repliesCount) {
                for (i = 0; i < repliesCount; ++i) {
                    date = (data.asc_getReply(i).asc_getOnlyOfficeTime()) ? new Date(this.stringOOToLocalDate(data.asc_getReply(i).asc_getOnlyOfficeTime())) :
                        ((data.asc_getReply(i).asc_getTime() == '') ? null : new Date(this.stringUtcToLocalDate(data.asc_getReply(i).asc_getTime())));

                    var userid = data.asc_getReply(i).asc_getUserId(),
                        user = this.userCollection.findOriginalUser(userid),
                        avatar = Common.UI.ExternalUsers.getImage(userid);
                    (avatar===undefined) && requestObj && requestObj.arrIds.push(userid);
                    replies.push(new Common.Models.Reply({
                        id                  : Common.UI.getId(),
                        userid              : userid,
                        username            : data.asc_getReply(i).asc_getUserName(),
                        initials            : Common.Utils.getUserInitials(AscCommon.UserInfoParser.getParsedName(data.asc_getReply(i).asc_getUserName())),
                        parsedName          : AscCommon.UserInfoParser.getParsedName(data.asc_getReply(i).asc_getUserName()),
                        usercolor           : (user) ? user.get('color') : Common.UI.ExternalUsers.getColor(userid || data.asc_getReply(i).asc_getUserName()),
                        avatar              : avatar,
                        date                : date ? this.dateToLocaleTimeString(date) : null,
                        reply               : data.asc_getReply(i).asc_getText(),
                        userdata            : data.asc_getReply(i).asc_getUserData(),
                        time                : date ? date.getTime() : null,
                        editText            : false,
                        editTextInPopover   : false,
                        showReplyInPopover  : false,
                        scope               : this.view,
                        editable            : (this.mode.canEditComments || (userid == this.currentUserId)) && AscCommon.UserInfoParser.canEditComment(data.asc_getReply(i).asc_getUserName()),
                        removable           : (this.mode.canDeleteComments || (userid == this.currentUserId)) && AscCommon.UserInfoParser.canDeleteComment(data.asc_getReply(i).asc_getUserName())
                    }));
                }
            }

            return replies;
        },

        // dummy comment

        addDummyComment: function () {
            if (this.api) {
                var me = this, anchor = null, date = new Date(), dialog = this.getPopover();
                if (dialog) {
                    if (this.popoverComments.length) {// can add new comment to text with other comments
                        if (this.isDummyComment) {//don't hide previous dummy comment
                            _.delay(function() {
                                dialog.commentsView.setFocusToTextBox();
                            }, 200);
                            return;
                        } else
                            this.closeEditing(); // add dummy comment and close editing for existing comment
                    }

                    var user = this.userCollection.findOriginalUser(this.currentUserId);
                    var comment = new Common.Models.Comment({
                        id: -1,
                        time: date.getTime(),
                        date: this.dateToLocaleTimeString(date),
                        userid: this.currentUserId,
                        username: AscCommon.UserInfoParser.getCurrentName(),
                        avatar: Common.UI.ExternalUsers.getImage(this.currentUserId),
                        initials: Common.Utils.getUserInitials(AscCommon.UserInfoParser.getParsedName(AscCommon.UserInfoParser.getCurrentName())),
                        parsedName: AscCommon.UserInfoParser.getParsedName(AscCommon.UserInfoParser.getCurrentName()),
                        usercolor: (user) ? user.get('color') : Common.UI.ExternalUsers.getColor(this.currentUserId),
                        editTextInPopover: true,
                        showReplyInPopover: false,
                        hideAddReply: true,
                        scope: this.view,
                        dummy: true
                    });

                    this.popoverComments.reset();
                    this.popoverComments.push(comment);

                    this.uids = [];
                    this.isSelectedComment = true;
                    this.isDummyComment = true;

                    if (!_.isUndefined(this.api.asc_SetDocumentPlaceChangedEnabled)) {
                        me.api.asc_SetDocumentPlaceChangedEnabled(true);
                    }

                    dialog.handlerHide = (function () {
                    });

                    if (dialog.isVisible()) {
                        dialog.hide();
                    }

                    dialog.handlerHide = (function (clear) {
                        me.clearDummyComment(clear);
                    });

                    anchor = this.api.asc_getAnchorPosition();
                    if (anchor) {
                        dialog.setLeftTop(anchor.asc_getX() + anchor.asc_getWidth(),
                            anchor.asc_getY(),
                            this.hintmode ? anchor.asc_getX() : undefined);

                        Common.NotificationCenter.trigger('comments:showdummy');
                        dialog.showComments(true, false, true, dialog.getDummyText());
                    }
                }
            }
        },
        onAddDummyComment: function (commentVal) {
            if (this.api && commentVal && commentVal.length > 0) {
                var comment = buildCommentData();   //  new asc_CCommentData(null);
                if (comment) {
                    this.showPopover        = true;
                    this.editPopover        = false;
                    this.hidereply          = false;
                    this.isSelectedComment  = false;
                    this.uids               = [];

                    this.popoverComments.reset();
                    if (this.getPopover().isVisible()) {
                       this.getPopover().hideComments();
                    }

                    this.isDummyComment     = false;

                    comment.asc_putText(commentVal);
                    comment.asc_putTime(this.utcDateToString(new Date()));
                    comment.asc_putOnlyOfficeTime(this.ooDateToString(new Date()));
                    comment.asc_putUserId(this.currentUserId);
                    comment.asc_putUserName(AscCommon.UserInfoParser.getCurrentName());
                    comment.asc_putSolved(false);

                    if (!_.isUndefined(comment.asc_putDocumentFlag))
                        comment.asc_putDocumentFlag(false);

                    this.api.asc_addComment(comment);
                    this.view.showEditContainer(false);
                    this.mode && this.mode.canRequestSendNotify && this.view.pickEMail(comment.asc_getGuid(), commentVal);
                    Common.NotificationCenter.trigger('comments:tryshowcomments'); // only for pdf
                    if (!_.isUndefined(this.api.asc_SetDocumentPlaceChangedEnabled)) {
                        this.api.asc_SetDocumentPlaceChangedEnabled(false);
                    }
                }
            }
        },
        clearDummyComment: function (clear) {
            if (this.isDummyComment) {
                this.isDummyComment     = false;

                this.showPopover        = true;
                this.editPopover        = false;
                this.hidereply          = false;
                this.isSelectedComment  = false;
                this.uids               = [];

                var dialog = this.getPopover();
                if (dialog) {
                    clear && dialog.clearDummyText();
                    dialog.saveDummyText();

                    dialog.handlerHide = (function () {
                    });

                    if (dialog.isVisible()) {
                        dialog.hideComments();
                    }
                }

                this.popoverComments.reset();

                if (!_.isUndefined(this.api.asc_SetDocumentPlaceChangedEnabled)) {
                    this.api.asc_SetDocumentPlaceChangedEnabled(false);
                }

                Common.NotificationCenter.trigger('comments:cleardummy');
            }
        },

        //

        onEditComments: function(comments) {
            if (this.api) {

                var i = 0,
                    t = this,
                    comment = null;

                var anchor = this.api.asc_getAnchorPosition();
                if (anchor) {

                    this.isSelectedComment = true;

                    this.popoverComments.reset();

                    for (i = 0; i < comments.length; ++i) {
                        comment = this.findComment(comments[i].asc_getId());
                        if (comment) {
                            comment.set('editTextInPopover', t.mode.canEditComments && AscCommon.UserInfoParser.canEditComment(comment.username));// dont't edit comment when customization->commentAuthorOnly is true or when permissions.editCommentAuthorOnly is true
                            comment.set('hint', false);
                            this.popoverComments.push(comment);
                        }
                    }

                    if (this.getPopover() && this.popoverComments.length>0 && this.popoverComments.findWhere({hide: false})) {
                        if (this.getPopover().isVisible()) {
                            this.getPopover().hide();
                        }
                        this.getPopover().setLeftTop(anchor.asc_getX() + anchor.asc_getWidth(),
                            anchor.asc_getY(),
                            this.hintmode ? anchor.asc_getX() : undefined);

                        this.getPopover().showComments(true, false, true);
                    }
                }
            }
        },

        onAfterShow: function () {
            if (this.view && this.api) {
                var panel = $('.new-comment-ct', this.view.el);
                if (panel && panel.length) {
                    if ('none' !== panel.css('display')) {
                        this.view.txtComment.focus();
                    }
                }
                if (this.view.needRender)
                    this.updateComments(true);
                else if (this.view.needUpdateFilter)
                    this.onUpdateFilter(this.view.needUpdateFilter);
                this.view.update();
            }
        },

        onBeforeHide: function () {
            if (this.view) {
                this.view.showEditContainer(false);
            }
        },

        // utils

        timeZoneOffsetInMs: (new Date()).getTimezoneOffset() * 60000,

        stringOOToLocalDate: function (date) {
            if (typeof date === 'string')
                return parseInt(date);

            return 0;
        },
        ooDateToString: function (date) {
            if (Object.prototype.toString.call(date) === '[object Date]')
                return (date.getTime()).toString();

            return '';
        },

        stringUtcToLocalDate: function (date) {
            if (typeof date === 'string')
                return parseInt(date) + this.timeZoneOffsetInMs;

            return 0;
        },
        utcDateToString: function (date) {
            if (Object.prototype.toString.call(date) === '[object Date]')
                return (date.getTime() - this.timeZoneOffsetInMs).toString();

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

            var lang = (this.mode ? this.mode.lang || 'en' : 'en').replace('_', '-').toLowerCase();
            try {
                if ( lang == 'ar-SA'.toLowerCase() ) lang = lang + '-u-nu-latn-ca-gregory';    // TODO: check Intl.Locale to support suitable options
                return date.toLocaleString(lang, {dateStyle: 'short', timeStyle: 'short'});
            } catch (e) {
                lang = 'en';
                return date.toLocaleString(lang, {dateStyle: 'short', timeStyle: 'short'});
            }

            // MM/dd/yyyy hh:mm AM
            return (date.getMonth() + 1) + '/' + (date.getDate()) + '/' + date.getFullYear() + ' ' + format(date);
        },

        buildComment: function(comment) {
            var ascComment = buildCommentData();
            if (!ascComment) {
                return null;
            }

            ascComment.asc_putText(comment.get('comment'));
            ascComment.asc_putQuoteText(comment.get('quote'));
            ascComment.asc_putTime(comment.get('time') ? this.utcDateToString(new Date(comment.get('time'))) : '');
            ascComment.asc_putOnlyOfficeTime(comment.get('time') ? this.ooDateToString(new Date(comment.get('time'))) : '');
            ascComment.asc_putUserId(comment.get('userid'));
            ascComment.asc_putUserName(comment.get('username'));
            ascComment.asc_putSolved(comment.get('resolved'));
            ascComment.asc_putGuid(comment.get('guid'));
            ascComment.asc_putUserData(comment.get('userdata'));

            if (!_.isUndefined(ascComment.asc_putDocumentFlag)) {
                ascComment.asc_putDocumentFlag(comment.get('unattached'));
            }

            return ascComment
        },

        buildReplyComment: function(reply) {
            var ascComment = buildCommentData();
            if (!ascComment) {
                return null;
            }

            ascComment.asc_putText(reply.get('reply'));
            ascComment.asc_putTime(reply.get('time') ? this.utcDateToString(new Date(reply.get('time'))) : '');
            ascComment.asc_putOnlyOfficeTime(reply.get('time') ? this.ooDateToString(new Date(reply.get('time'))) : '');
            ascComment.asc_putUserId(reply.get('userid'));
            ascComment.asc_putUserName(reply.get('username'));
            ascComment.asc_putUserData(reply.get('userdata'));

            return ascComment;
        },

        getView: function(name) {
            return !name && this.view ?
                this.view : Backbone.Controller.prototype.getView.call(this, name);
        },

        setPreviewMode: function(mode) {
            this._state.disableEditing = mode;
            this.updatePreviewMode();
        },

        updatePreviewMode: function() {
            var docProtection = this._state.docProtection;
            var viewmode = this._state.disableEditing || docProtection.isReadOnly || docProtection.isFormsOnly;

            if (this.viewmode === viewmode) return;
            this.viewmode = viewmode;

            if (viewmode)
                this.prevcanComments = this.mode.canComments;
            this.mode.canComments = (viewmode) ? false : this.prevcanComments;
            this.closeEditing();
            this.setMode(this.mode);
            this.updateComments(true);
            if (this.getPopover())
                viewmode ? this.getPopover().hide() : this.getPopover().update(true);
        },

        clearCollections: function() {
            this.collection.reset();
            this.groupCollection = [];
        },

        fillUserGroups: function(usergroups) {
            if (!this.mode.canUseCommentPermissions) return;

            var viewgroups = AscCommon.UserInfoParser.getCommentPermissions('view');
            if (usergroups && usergroups.length>0) {
                if (viewgroups)
                    usergroups = _.intersection(usergroups, viewgroups);
                usergroups = _.uniq(this.userGroups.concat(usergroups));
            }
            var view = this.view;
            if (view && view.buttonSort && _.difference(usergroups, this.userGroups).length>0) {
                this.userGroups = usergroups;
                view.hasFilters = this.userGroups.length>0;
                view.buttonSort.updateHint(this.mode.canComments && !this.mode.compatibleFeatures ? (view.hasFilters ? view.textSortFilterMore : view.textSortMore) : (view.hasFilters ? view.textSortFilter : view.textSort));
                var menu = view.buttonSort.menu;
                menu.items[menu.items.length-3].setVisible(view.hasFilters);
                menu.items[menu.items.length-4].setVisible(view.hasFilters);
                menu = menu.items[menu.items.length-3].menu;
                menu.removeAll();

                var last = Common.Utils.InternalSettings.get(this.appPrefix + "comments-filtergroups");
                menu.addItem(new Common.UI.MenuItem({
                    checkable: true,
                    checked: last===-1 || last===undefined,
                    toggleGroup: 'filtercomments',
                    caption: view.textAll,
                    value: -1
                }));
                this.userGroups.forEach(function(item){
                    menu.addItem(new Common.UI.MenuItem({
                        checkable: true,
                        checked: last === item,
                        toggleGroup: 'filtercomments',
                        caption: item,
                        value: item
                    }));
                });
            }
        },

        setFilterGroups: function (group) {
            Common.Utils.InternalSettings.set(this.appPrefix + "comments-filtergroups", group);
            var i, end = true;
            for (i = this.collection.length - 1; i >= 0; --i) {
                var item = this.collection.at(i);
                if (!item.get('hide')) {
                    var usergroups = item.get('parsedGroups');
                    item.set('filtered', !!group && (group!==-1) && (!usergroups || usergroups.length<1 || usergroups.indexOf(group)<0), {silent: true});
                }
                if (end && !item.get('hide') && !item.get('filtered')) {
                    item.set('last', true, {silent: true});
                    end = false;
                } else {
                    if (item.get('last')) {
                        item.set('last', false, {silent: true});
                    }
                }
            }
            this.updateComments(true);
        },

        onAppReady: function (config) {
            var me = this;
            (new Promise(function (accept, reject) {
                accept();
            })).then(function(){
                me.onChangeProtectDocument();
                Common.NotificationCenter.on('protect:doclock', _.bind(me.onChangeProtectDocument, me));
            });
        },

        onChangeProtectDocument: function(props) {
            if (!props) {
                var docprotect = this.getApplication().getController('DocProtection');
                props = docprotect ? docprotect.getDocProps() : null;
            }
            if (props) {
                this._state.docProtection = props;
                this.updatePreviewMode();
            }
        }

    }, Common.Controllers.Comments || {}));
});
