import React, { Component } from 'react'
import {observer, inject} from "mobx-react"

class CollaborationController extends Component {
    constructor(props){
        super(props);

        Common.Notifications.on('engineCreated', api => {
            // this.api = api;
            api.asc_registerCallback('asc_onAuthParticipantsChanged', this.onChangeEditUsers.bind(this));
            api.asc_registerCallback('asc_onParticipantsChanged',     this.onChangeEditUsers.bind(this));
            // this.api.asc_registerCallback('asc_onAddComment', _.bind(this.onApiAddComment, this));
            // this.api.asc_registerCallback('asc_onAddComments', _.bind(this.onApiAddComments, this));
            // this.api.asc_registerCallback('asc_onChangeCommentData', _.bind(this.onApiChangeCommentData, this));
            // this.api.asc_registerCallback('asc_onRemoveComment', _.bind(this.onApiRemoveComment, this));
            // this.api.asc_registerCallback('asc_onRemoveComments', _.bind(this.onApiRemoveComments, this));
            // this.api.asc_registerCallback('asc_onShowComment', _.bind(this.apiShowComments, this));
            // this.api.asc_registerCallback('asc_onHideComment', _.bind(this.apiHideComments, this));
        });
    }

    onChangeEditUsers(users) {
        const storeUsers = this.props.users;
        storeUsers.reset(users);
    };

    render() {
        return null
    }
}

export default inject('users')(observer(CollaborationController));