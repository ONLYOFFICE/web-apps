import React, { useState } from 'react'
import { resetUsers } from '../store/actions/actions.js'
import Notifications from '../../utils/notifications.js'

const Collaboration = () => {
    const onChangeEditUsers = (users) => {
        const store = Common.Store.get();
        store.dispatch(resetUsers(Object.values(users)));
    };

    Common.Notifications.on('engineCreated', api => {
        // this.api = api;
        api.asc_registerCallback('asc_onAuthParticipantsChanged', onChangeEditUsers);
        api.asc_registerCallback('asc_onParticipantsChanged',     onChangeEditUsers);
        // this.api.asc_registerCallback('asc_onAddComment', _.bind(this.onApiAddComment, this));
        // this.api.asc_registerCallback('asc_onAddComments', _.bind(this.onApiAddComments, this));
        // this.api.asc_registerCallback('asc_onChangeCommentData', _.bind(this.onApiChangeCommentData, this));
        // this.api.asc_registerCallback('asc_onRemoveComment', _.bind(this.onApiRemoveComment, this));
        // this.api.asc_registerCallback('asc_onRemoveComments', _.bind(this.onApiRemoveComments, this));
        // this.api.asc_registerCallback('asc_onShowComment', _.bind(this.apiShowComments, this));
        // this.api.asc_registerCallback('asc_onHideComment', _.bind(this.apiHideComments, this));
    });

    return {
        setApi(api) {
        }
    }
};

export {Collaboration as CollaborationController}