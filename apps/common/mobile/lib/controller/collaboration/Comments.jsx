import React, {Component} from 'react';
import { inject, observer } from "mobx-react";
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';
import { withTranslation} from 'react-i18next';

import {AddComment} from '../../view/collaboration/Comments';

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
//end utils

@inject('storeComments', 'users')
@observer
class AddCommentController extends Component {
    constructor(props) {
        super(props);
        this.getUserInfo = this.getUserInfo.bind(this);
        this.onAddNewComment = this.onAddNewComment.bind(this);
    }
    getUserInfo () {
        this.currentUser = this.props.users.currentUser;
        const name = this.currentUser.asc_getUserName();
        return {
            name: name,
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

            return true;
        }
        return false;
    }
    render() {
        const isOpen = this.props.storeComments.isOpenAddComment;
        let userInfo;
        if (isOpen) {
            userInfo = this.getUserInfo();
        }
        return(
            isOpen ? <AddComment userInfo={userInfo} onAddNewComment={this.onAddNewComment} /> : null
        )
    }
}

export {AddCommentController};