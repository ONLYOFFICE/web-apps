import React, {Component, Fragment} from 'react';
import { inject, observer } from "mobx-react";
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';
import { withTranslation} from 'react-i18next';
import { LocalStorage } from '../../../utils/LocalStorage.mjs';

import {AddComment, EditComment, AddReply, EditReply, ViewComments, ViewCurrentComments} from '../../view/collaboration/Comments';
import { getUserColor } from '../../../utils/getUserColor';

// utils
const timeZoneOffsetInMs = (new Date()).getTimezoneOffset() * 60000;
const utcDateToString = (date) => {
    if (Object.prototype.toString.call(date) === '[object Date]')
        return (date.getTime() - timeZoneOffsetInMs).toString();
    return '';
};
const ooDateToString = (date) => {
    if (Object.prototype.toString.call(date) === '[object Date]')
        return (date.getTime()).toString();
    return '';
};
const stringOOToLocalDate = (date) => {
    if (typeof date === 'string')
        return parseInt(date);
    return 0;
};
const stringUtcToLocalDate = (date) => {
    if (typeof date === 'string')
        return parseInt(date) + timeZoneOffsetInMs;
    return 0;
};
const dateToLocaleTimeString = (date, lang) => {
    const format = (date) => {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let ampm = hours >= 12 ? 'pm' : 'am';

        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        return hours + ':' + minutes + ' ' + ampm;
    };
    lang = (lang || 'en').replace('_', '-').toLowerCase();
    try {
        return date.toLocaleString(lang, {dateStyle: 'short', timeStyle: 'short'});
    } catch (e) {
        lang = 'en';
        return date.toLocaleString(lang, {dateStyle: 'short', timeStyle: 'short'});
    }

    // MM/dd/yyyy hh:mm AM
    return (date.getMonth() + 1) + '/' + (date.getDate()) + '/' + date.getFullYear() + ' ' + format(date);
};
const parseUserName = name => {
    return AscCommon.UserInfoParser.getParsedName(name);
};
//end utils

class CommentsController extends Component {
    constructor(props) {
        super(props);
        this.usersStore = this.props.users;
        this.appOptions = this.props.storeAppOptions;
        this.storeComments = this.props.storeComments;
        this.storeApplicationSettings = this.props.storeApplicationSettings;

        Common.Notifications.on('engineCreated', api => {
            api.asc_registerCallback('asc_onAddComment', this.addComment.bind(this));
            api.asc_registerCallback('asc_onAddComments', this.addComments.bind(this));
            api.asc_registerCallback('asc_onRemoveComment', this.removeComment.bind(this));
            api.asc_registerCallback('asc_onRemoveComments', this.removeComments.bind(this));
            api.asc_registerCallback('asc_onChangeCommentData', this.changeCommentData.bind(this));
            api.asc_registerCallback('asc_onShowComment', this.changeShowComments.bind(this));
            api.asc_registerCallback('asc_onHideComment', this.hideComments.bind(this));

            if (window.editorType === 'sse') {
                api.asc_registerCallback('asc_onActiveSheetChanged', this.onApiActiveSheetChanged.bind(this));
                Common.Notifications.on('comments:filterchange', this.onFilterChange.bind(this));
                Common.Notifications.on('sheet:active', this.onApiActiveSheetChanged.bind(this));
            }
        });

        Common.Notifications.on('document:ready', () => {
            if (window.editorType === 'de' || window.editorType === 'sse') {
                const api = Common.EditorApi.get();
                /** coauthoring begin **/
                const isLiveCommenting = LocalStorage.getBool(`${window.editorType}-mobile-settings-livecomment`, true);
                const resolved = LocalStorage.getBool(`${window.editorType}-settings-resolvedcomment`);
                this.storeApplicationSettings.changeDisplayComments(isLiveCommenting);
                this.storeApplicationSettings.changeDisplayResolved(resolved);
                isLiveCommenting ? api.asc_showComments(resolved) : api.asc_hideComments();
                /** coauthoring end **/
            }

            this.curUserId = this.props.users.currentUser.asc_getIdOriginal();
        });
    }
    onApiActiveSheetChanged (index) {
        this.onFilterChange(['doc', 'sheet' + Common.EditorApi.get().asc_getWorksheetId(index)]);
    }
    addComment (id, data) {
        const comment = this.readSDKComment(id, data);
    
        if (comment) {
            this.storeComments.addComment(comment);
            this.changeShowComments([comment.uid]);
        }
    }
    addComments (data) {
        for (let i = 0; i < data.length; ++i) {
            const comment = this.readSDKComment(data[i].asc_getId(), data[i]);
            this.storeComments.addComment(comment);
        }
    }
    removeComment (id) {
        this.storeComments.removeComment(id);
        if (this.storeComments.showComments.length < 1) {
            Device.phone ? f7.sheet.close('#view-comment-sheet') : f7.popover.close('#view-comment-popover');
        }
    }
    removeComments (data) {
        for (let i = 0; i < data.length; i++) {
            this.removeComment(data[i]);
        }
    }
    changeShowComments (id) {
        this.storeComments.changeShowComment(id);
    }
    hideComments () {
        //Common.Notifications.trigger('closeviewcomment');
    }
    changeCommentData (id, data) {
        const changeComment = {};

        const date = (data.asc_getOnlyOfficeTime()) ? new Date(stringOOToLocalDate(data.asc_getOnlyOfficeTime())) :
            ((data.asc_getTime() === '') ? new Date() : new Date(stringUtcToLocalDate(data.asc_getTime())));

        const userId = data.asc_getUserId()
        const user = this.usersStore.searchUserById(userId);
        const name = data.asc_getUserName();
        const parsedName = parseUserName(name);

        changeComment.comment = data.asc_getText();
        changeComment.userId = userId;
        changeComment.userName = name;
        changeComment.parsedName = Common.Utils.String.htmlEncode(parsedName);
        changeComment.userInitials = this.usersStore.getInitials(parsedName);
        changeComment.userColor = (user) ? user.asc_getColor() : getUserColor(userId || name);
        changeComment.resolved = data.asc_getSolved();
        changeComment.quote = data.asc_getQuoteText();
        changeComment.time = date.getTime();
        changeComment.date = dateToLocaleTimeString(date, this.appOptions.lang);
        changeComment.editable = (this.appOptions.canEditComments || (data.asc_getUserId() === this.curUserId)) && AscCommon.UserInfoParser.canEditComment(name);
        changeComment.removable = (this.appOptions.canDeleteComments || (data.asc_getUserId() === this.curUserId)) && AscCommon.UserInfoParser.canDeleteComment(name);
        changeComment.hide = !AscCommon.UserInfoParser.canViewComment(name);

        let dateReply = null;
        const replies = [];

        const repliesCount = data.asc_getRepliesCount();
        for (let i = 0; i < repliesCount; ++i) {

            dateReply = (data.asc_getReply(i).asc_getOnlyOfficeTime()) ? new Date(stringOOToLocalDate(data.asc_getReply(i).asc_getOnlyOfficeTime())) :
                ((data.asc_getReply(i).asc_getTime() === '') ? new Date() : new Date(stringUtcToLocalDate(data.asc_getReply(i).asc_getTime())));

            const userId = data.asc_getReply(i).asc_getUserId();
            const user = this.usersStore.searchUserById(userId);
            const userName = data.asc_getReply(i).asc_getUserName();
            const parsedName = parseUserName(userName);

            replies.push({
                ind: i,
                userId,
                userName,
                parsedName: Common.Utils.String.htmlEncode(parsedName),
                userColor: (user) ? user.asc_getColor() : getUserColor(userId || userName),
                date: dateToLocaleTimeString(dateReply, this.appOptions.lang),
                reply: data.asc_getReply(i).asc_getText(),
                time: dateReply.getTime(),
                userInitials: this.usersStore.getInitials(parsedName),
                editable: (this.appOptions.canEditComments || (data.asc_getReply(i).asc_getUserId() === this.curUserId)) && AscCommon.UserInfoParser.canEditComment(userName),
                removable: (this.appOptions.canDeleteComments || (data.asc_getReply(i).asc_getUserId() === this.curUserId)) && AscCommon.UserInfoParser.canDeleteComment(userName)
            });
        }
        changeComment.replies = replies;

        this.props.storeComments.changeComment(id, changeComment);
    }
    onFilterChange (filter) {
        this.storeComments.changeFilter(filter);
    }
    readSDKComment (id, data) {
        const date = (data.asc_getOnlyOfficeTime()) ? new Date(stringOOToLocalDate(data.asc_getOnlyOfficeTime())) :
            ((data.asc_getTime() === '') ? new Date() : new Date(stringUtcToLocalDate(data.asc_getTime())));
        const userId = data.asc_getUserId();
        const user = this.usersStore.searchUserById(userId);
        const groupName = id.substr(0, id.lastIndexOf('_')+1).match(/^(doc|sheet[0-9_]+)_/);
        const userName = data.asc_getUserName();
        const parsedName = parseUserName(userName);
        const comment = {
            uid                 : id,
            userId,
            userName,
            parsedName,
            userColor           : (user) ? user.asc_getColor() : getUserColor(userId || userName),
            date                : dateToLocaleTimeString(date, this.appOptions.lang),
            quote               : data.asc_getQuoteText(),
            comment             : data.asc_getText(),
            resolved            : data.asc_getSolved(),
            unattached          : !!data.asc_getDocumentFlag ? data.asc_getDocumentFlag() : false,
            time                : date.getTime(),
            replies             : [],
            groupName           : (groupName && groupName.length>1) ? groupName[1] : null,
            userInitials        : this.usersStore.getInitials(parsedName),
            editable            : (this.appOptions.canEditComments || (data.asc_getUserId() === this.curUserId)) && AscCommon.UserInfoParser.canEditComment(userName),
            removable           : (this.appOptions.canDeleteComments || (data.asc_getUserId() === this.curUserId)) && AscCommon.UserInfoParser.canDeleteComment(userName),
            hide                : !AscCommon.UserInfoParser.canViewComment(userName),
        };
        if (comment) {
            const replies = this.readSDKReplies(data);
            if (replies.length > 0) {
                comment.replies = replies;
            }
        }
        return comment;
    }
    readSDKReplies (data) {
        const replies = [];
        const repliesCount = data.asc_getRepliesCount();
        let i = 0;
        let date = null;
        if (repliesCount) {
            for (i = 0; i < repliesCount; ++i) {
                date = (data.asc_getReply(i).asc_getOnlyOfficeTime()) ? new Date(stringOOToLocalDate(data.asc_getReply(i).asc_getOnlyOfficeTime())) :
                    ((data.asc_getReply(i).asc_getTime() === '') ? new Date() : new Date(stringUtcToLocalDate(data.asc_getReply(i).asc_getTime())));
                const userId = data.asc_getReply(i).asc_getUserId();
                const user = this.usersStore.searchUserById(userId);
                const userName = data.asc_getReply(i).asc_getUserName();
                const parsedName = parseUserName(userName);

                replies.push({
                    ind                 : i,
                    userId,
                    userName,
                    parsedName          : Common.Utils.String.htmlEncode(parsedName),
                    userColor           : (user) ? user.asc_getColor() : getUserColor(userId || userName),
                    date                : dateToLocaleTimeString(date, this.appOptions.lang),
                    reply               : data.asc_getReply(i).asc_getText(),
                    time                : date.getTime(),
                    userInitials        : this.usersStore.getInitials(parsedName),
                    editable            : (this.appOptions.canEditComments || (data.asc_getReply(i).asc_getUserId() === this.curUserId)) && AscCommon.UserInfoParser.canEditComment(userName),
                    removable           : (this.appOptions.canDeleteComments || (data.asc_getReply(i).asc_getUserId() === this.curUserId)) && AscCommon.UserInfoParser.canDeleteComment(userName)
                });
            }
        }
        return replies;
    }
    render() {
        return null;
    }
}

class AddCommentController extends Component {
    constructor(props) {
        super(props);
        this.closeAddComment = this.closeAddComment.bind(this);
        this.getUserInfo = this.getUserInfo.bind(this);
        this.onAddNewComment = this.onAddNewComment.bind(this);

        this.state = {
            isOpen: false
        };

        Common.Notifications.on('addcomment', () => {
            f7.popover.close('#idx-context-menu-popover'); //close context menu
            this.setState({isOpen: true});
        });
    }
    closeAddComment () {
        this.setState({isOpen: false});
    }
    getUserInfo () {
        this.currentUser = this.props.users.currentUser;
        if (!this.currentUser) {
            this.currentUser = this.props.users.setCurrentUser(this.props.storeAppOptions.user.id);
        }
        const name = parseUserName(this.currentUser.asc_getUserName());
        return {
            name: Common.Utils.String.htmlEncode(name),
            initials: this.props.users.getInitials(name),
            color: this.currentUser.asc_getColor()
        };
    }
    onAddNewComment (commentText, documentFlag) {
        const api = Common.EditorApi.get();
        let comment;
        if (typeof Asc.asc_CCommentDataWord !== 'undefined') {
            comment = new Asc.asc_CCommentDataWord(null);
        } else {
            comment = new Asc.asc_CCommentData(null);
        }
        if (commentText.length > 0) {
            comment.asc_putText(commentText);
            comment.asc_putTime(utcDateToString(new Date()));
            comment.asc_putOnlyOfficeTime(ooDateToString(new Date()));
            comment.asc_putUserId(this.currentUser.asc_getIdOriginal());
            comment.asc_putUserName(this.currentUser.asc_getUserName());
            comment.asc_putSolved(false);

            !!comment.asc_putDocumentFlag && comment.asc_putDocumentFlag(documentFlag);

            api.asc_addComment(comment);
            Common.Notifications.trigger('viewcomment');
        }
    }
    render() {
        return(
            this.state.isOpen ? <AddComment userInfo={this.getUserInfo()} onAddNewComment={this.onAddNewComment} closeAddComment={this.closeAddComment}/> : null
        )
    }
}

class EditCommentController extends Component {
    constructor (props) {
        super(props);
        this.onEditComment = this.onEditComment.bind(this);
        this.onAddReply = this.onAddReply.bind(this);
        this.onEditReply = this.onEditReply.bind(this);
    }
    getUserInfo () {
        this.currentUser = this.props.users.currentUser;
        const name = parseUserName(this.currentUser.asc_getUserName());
        return {
            name: Common.Utils.String.htmlEncode(name),
            initials: this.props.users.getInitials(name),
            color: this.currentUser.asc_getColor()
        };
    }
    onChangeComment (comment) {
        const ascComment = typeof Asc.asc_CCommentDataWord !== 'undefined' ? new Asc.asc_CCommentDataWord(null) : new Asc.asc_CCommentData(null);
        if (ascComment && comment) {
            ascComment.asc_putText(comment.comment);
            ascComment.asc_putQuoteText(comment.quote);
            ascComment.asc_putTime(utcDateToString(new Date(comment.time)));
            ascComment.asc_putOnlyOfficeTime(ooDateToString(new Date(comment.time)));
            ascComment.asc_putUserId(comment.userId);
            ascComment.asc_putUserName(comment.userName);
            ascComment.asc_putSolved(comment.resolved);
            ascComment.asc_putGuid(comment.guid);

            if (!!ascComment.asc_putDocumentFlag) {
                ascComment.asc_putDocumentFlag(comment.unattached);
            }

            const reply = comment.replies;
            if (reply && reply.length > 0) {
                reply.forEach((reply) => {
                    const addReply = (typeof Asc.asc_CCommentDataWord !== 'undefined' ? new Asc.asc_CCommentDataWord(null) : new Asc.asc_CCommentData(null));
                    if (addReply) {
                        addReply.asc_putText(reply.reply);
                        addReply.asc_putTime(utcDateToString(new Date(reply.time)));
                        addReply.asc_putOnlyOfficeTime(ooDateToString(new Date(reply.time)));
                        addReply.asc_putUserId(reply.userId);
                        addReply.asc_putUserName(reply.userName);

                        ascComment.asc_addReply(addReply);
                    }
                });
            }
            const api = Common.EditorApi.get();
            api.asc_changeComment(comment.uid, ascComment);
        }
    }
    onEditComment (comment, text) {
        const changeComment = {...comment};
        changeComment.comment = text.trim();
        const user = this.props.users.currentUser;
        changeComment.userid = user.asc_getIdOriginal();
        changeComment.username = user.asc_getUserName();
        this.onChangeComment(changeComment);
    }
    onAddReply (comment, replyVal) {
        let reply = null;
        let addReply = null;
        const ascComment = (typeof Asc.asc_CCommentDataWord !== 'undefined' ? new Asc.asc_CCommentDataWord(null) : new Asc.asc_CCommentData(null));

        if (ascComment) {
            ascComment.asc_putText(comment.comment);
            ascComment.asc_putQuoteText(comment.quote);
            ascComment.asc_putTime(utcDateToString(new Date(comment.time)));
            ascComment.asc_putOnlyOfficeTime(ooDateToString(new Date(comment.time)));
            ascComment.asc_putUserId(comment.userId);
            ascComment.asc_putUserName(comment.userName);
            ascComment.asc_putSolved(comment.resolved);
            ascComment.asc_putGuid(comment.guid);

            if (!!ascComment.asc_putDocumentFlag) {
                ascComment.asc_putDocumentFlag(comment.unattached);
            }

            reply = comment.replies;
            if (reply && reply.length) {
                reply.forEach(function (reply) {

                    addReply = (typeof Asc.asc_CCommentDataWord !== 'undefined' ? new Asc.asc_CCommentDataWord(null) : new Asc.asc_CCommentData(null));
                    if (addReply) {
                        addReply.asc_putText(reply.reply);
                        addReply.asc_putTime(utcDateToString(new Date(reply.time)));
                        addReply.asc_putOnlyOfficeTime(ooDateToString(new Date(reply.time)));
                        addReply.asc_putUserId(reply.userId);
                        addReply.asc_putUserName(reply.userName);

                        ascComment.asc_addReply(addReply);
                    }
                });
            }

            addReply = (typeof Asc.asc_CCommentDataWord !== 'undefined' ? new Asc.asc_CCommentDataWord(null) : new Asc.asc_CCommentData(null));
            if (addReply) {
                addReply.asc_putText(replyVal);
                addReply.asc_putTime(utcDateToString(new Date()));
                addReply.asc_putOnlyOfficeTime(ooDateToString(new Date()));
                const currentUser = this.props.users.currentUser;
                addReply.asc_putUserId(currentUser.asc_getIdOriginal());
                addReply.asc_putUserName(currentUser.asc_getUserName());

                ascComment.asc_addReply(addReply);

                const api = Common.EditorApi.get();
                api.asc_changeComment(comment.uid, ascComment);
            }
        }
    }
    onEditReply (comment, reply, textReply) {
        const currentUser = this.props.users.currentUser;
        const indReply = reply.ind;
        const changeComment = {...comment};
        changeComment.replies = [...comment.replies];
        changeComment.replies[indReply] = {...reply};
        changeComment.replies[indReply].reply = textReply;
        changeComment.replies[indReply].userid = currentUser.asc_getIdOriginal();
        changeComment.replies[indReply].username = currentUser.asc_getUserName();
        this.onChangeComment(changeComment);
    }
    render() {
        const storeComments = this.props.storeComments;
        const comment = storeComments.currentComment;
        return (
            <Fragment>
                {storeComments.isOpenEditComment && <EditComment comment={comment} onEditComment={this.onEditComment}/>}
                {storeComments.isOpenAddReply && <AddReply userInfo={this.getUserInfo()} comment={comment} onAddReply={this.onAddReply}/>}
                {storeComments.isOpenEditReply && <EditReply comment={comment} reply={storeComments.currentReply} onEditReply={this.onEditReply}/>}
            </Fragment>
        )
    }
}

class ViewCommentsController extends Component {
    constructor (props) {
        super(props);
        this.onCommentMenuClick = this.onCommentMenuClick.bind(this);
        this.onResolveComment = this.onResolveComment.bind(this);
        this.closeViewCurComments = this.closeViewCurComments.bind(this);

        this.state = {
            isOpenViewCurComments: false
        };

        Common.Notifications.on('viewcomment', () => {
            this.setState({isOpenViewCurComments: true});
        });
        Common.Notifications.on('closeviewcomment', () => {
            this.closeViewCurComments();
        });
    }
    closeViewCurComments () {
        if (Device.phone) {
            f7.sheet.close('#view-comment-sheet');
        } else {
            f7.popover.close('#view-comment-popover');
        }
        this.setState({isOpenViewCurComments: false});
    }
    onResolveComment (comment) {
        let reply = null,
            addReply = null,
            ascComment = (typeof Asc.asc_CCommentDataWord !== 'undefined' ? new Asc.asc_CCommentDataWord(null) : new Asc.asc_CCommentData(null));

        if (ascComment && comment) {
            ascComment.asc_putText(comment.comment);
            ascComment.asc_putQuoteText(comment.quote);
            ascComment.asc_putTime(utcDateToString(new Date(comment.time)));
            ascComment.asc_putOnlyOfficeTime(ooDateToString(new Date(comment.time)));
            ascComment.asc_putUserId(comment.userId);
            ascComment.asc_putUserName(comment.userName);
            ascComment.asc_putSolved(!comment.resolved);
            ascComment.asc_putGuid(comment.guid);

            if (!!ascComment.asc_putDocumentFlag) {
                ascComment.asc_putDocumentFlag(comment.unattached);
            }

            reply = comment.replies;
            if (reply && reply.length > 0) {
                reply.forEach((reply) => {
                    addReply = (typeof Asc.asc_CCommentDataWord !== 'undefined' ? new Asc.asc_CCommentDataWord(null) : new Asc.asc_CCommentData(null));
                    if (addReply) {
                        addReply.asc_putText(reply.reply);
                        addReply.asc_putTime(utcDateToString(new Date(reply.time)));
                        addReply.asc_putOnlyOfficeTime(ooDateToString(new Date(reply.time)));
                        addReply.asc_putUserId(reply.userId);
                        addReply.asc_putUserName(reply.userName);

                        ascComment.asc_addReply(addReply);
                    }
                });
            }
            const api = Common.EditorApi.get();
            api.asc_showComments(this.props.storeApplicationSettings.isResolvedComments);
            api.asc_changeComment(comment.uid, ascComment);

            if(!this.props.storeApplicationSettings.isResolvedComments) {
                this.closeViewCurComments();
            }
        }
    }
    deleteComment (comment) {
        const api = Common.EditorApi.get();
        comment && api.asc_removeComment(comment.uid);
    }
    deleteReply (comment, reply) {
        let replies = null,
            addReply = null,
            ascComment = (!!Asc.asc_CCommentDataWord ? new Asc.asc_CCommentDataWord(null) : new Asc.asc_CCommentData(null));

        const indReply = reply.ind;

        if (ascComment && comment) {
            ascComment.asc_putText(comment.comment);
            ascComment.asc_putQuoteText(comment.quote);
            ascComment.asc_putTime(utcDateToString(new Date(comment.time)));
            ascComment.asc_putOnlyOfficeTime(ooDateToString(new Date(comment.time)));
            ascComment.asc_putUserId(comment.userId);
            ascComment.asc_putUserName(comment.userName);
            ascComment.asc_putSolved(comment.resolved);
            ascComment.asc_putGuid(comment.guid);

            if (!!ascComment.asc_putDocumentFlag) {
                ascComment.asc_putDocumentFlag(comment.unattached);
            }

            replies = comment.replies;
            if (replies && replies.length) {
                replies.forEach((reply) => {
                    if (reply.ind !== indReply) {
                        addReply = (!!Asc.asc_CCommentDataWord ? new Asc.asc_CCommentDataWord(null) : new Asc.asc_CCommentData(null));
                        if (addReply) {
                            addReply.asc_putText(reply.reply);
                            addReply.asc_putTime(utcDateToString(new Date(reply.time)));
                            addReply.asc_putOnlyOfficeTime(ooDateToString(new Date(reply.time)));
                            addReply.asc_putUserId(reply.userId);
                            addReply.asc_putUserName(reply.userName);

                            ascComment.asc_addReply(addReply);
                        }
                    }
                });
            }
            const api = Common.EditorApi.get();
            api.asc_changeComment(comment.uid, ascComment);
        }
    }
    onCommentMenuClick (action, comment, reply) {
        const { t } = this.props;
        const _t = t("Common.Collaboration", { returnObjects: true });
        switch (action) {
            case 'editComment':
                this.props.storeComments.openEditComment(true, comment);
                break;
            case 'resolve':
                this.onResolveComment(comment);
                break;
            case 'deleteComment':
                f7.dialog.create({
                    title: _t.textDeleteComment,
                    text: _t.textMessageDeleteComment,
                    buttons: [
                        {
                            text: _t.textCancel
                        },
                        {
                            text: _t.textOk,
                            onClick: () => this.deleteComment(comment)
                        }
                    ]
                }).open();
                break;
            case 'editReply':
                this.props.storeComments.openEditReply(true, comment, reply);
                break;
            case 'deleteReply':
                f7.dialog.create({
                    title: _t.textDeleteReply,
                    text: _t.textMessageDeleteReply,
                    buttons: [
                        {
                            text: _t.textCancel
                        },
                        {
                            text: _t.textOk,
                            onClick: () => this.deleteReply(comment, reply)
                        }
                    ]
                }).open();
                break;
            case 'addReply':
                this.props.storeComments.openAddReply(true, comment);
                break;
        }
    }

    showComment (comment) {
        const api = Common.EditorApi.get();

        api.asc_selectComment(comment.uid);      
        api.asc_showComment(comment.uid, false);
    }


    render() {
        return(
            <Fragment>
                {this.props.allComments && <ViewComments wsProps={this.props?.storeWorksheets?.wsProps} onCommentMenuClick={this.onCommentMenuClick} onResolveComment={this.onResolveComment} 
                    showComment={this.showComment} />}
                {this.state.isOpenViewCurComments && <ViewCurrentComments wsProps={this.props?.storeWorksheets?.wsProps} opened={this.state.isOpenViewCurComments}
                                                                          closeCurComments={this.closeViewCurComments}
                                                                          onCommentMenuClick={this.onCommentMenuClick}
                                                                          onResolveComment={this.onResolveComment}
                />}
            </Fragment>
        )
    }
}

class ViewCommentsSheetsController extends ViewCommentsController {
    constructor(props) {
        super(props);
    }
}

const _CommentsController = inject('storeAppOptions', 'storeComments', 'users', "storeApplicationSettings")(observer(CommentsController));
const _AddCommentController = inject('storeAppOptions', 'storeComments', 'users')(observer(AddCommentController));
const _EditCommentController = inject('storeComments', 'users')(observer(EditCommentController));
const _ViewCommentsController = inject('storeComments', 'users', "storeApplicationSettings", "storeReview", "storeAppOptions")(observer(withTranslation()(ViewCommentsController)));
const _ViewCommentsSheetsController = inject('storeComments', 'users', "storeApplicationSettings", "storeWorksheets", "storeReview", "storeAppOptions")(observer(withTranslation()(ViewCommentsSheetsController)));

export {
    _CommentsController as CommentsController,
    _AddCommentController as AddCommentController,
    _EditCommentController as EditCommentController,
    _ViewCommentsController as ViewCommentsController,
    _ViewCommentsSheetsController as ViewCommentsSheetsController
};