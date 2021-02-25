import React, { Component } from 'react'
import {observer, inject} from "mobx-react"

class CollaborationController extends Component {
    constructor(props){
        super(props);

        Common.Notifications.on('configOptionsFill', () => {
            const api = Common.EditorApi.get();
            // this.api = api;
            api.asc_registerCallback('asc_onAuthParticipantsChanged', this.onChangeEditUsers.bind(this));
            api.asc_registerCallback('asc_onParticipantsChanged',     this.onChangeEditUsers.bind(this));
            api.asc_registerCallback('asc_onConnectionStateChanged',  this.onUserConnection.bind(this));
        });
    }

    onChangeEditUsers(users) {
        const storeUsers = this.props.users;
        storeUsers.reset(users);
        storeUsers.setCurrentUser(this.props.storeAppOptions.user.id);
    }

    onUserConnection(change) {
        this.props.users.connection(change);
    }

    render() {
        return null
    }
}

export default inject('users', 'storeAppOptions')(observer(CollaborationController));