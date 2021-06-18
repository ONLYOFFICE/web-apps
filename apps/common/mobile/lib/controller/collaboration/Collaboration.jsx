import React, { Component } from 'react'
import { f7 } from 'framework7-react';
import {observer, inject} from "mobx-react"
import { LocalStorage } from '../../../utils/LocalStorage';
import { withTranslation } from 'react-i18next';

class CollaborationController extends Component {
    constructor(props){
        super(props);

        Common.Notifications.on('engineCreated', (api) => {
            api.asc_registerCallback('asc_onAuthParticipantsChanged', this.onChangeEditUsers.bind(this));
            api.asc_registerCallback('asc_onParticipantsChanged',     this.onChangeEditUsers.bind(this));
            api.asc_registerCallback('asc_onConnectionStateChanged',  this.onUserConnection.bind(this));
            api.asc_registerCallback('asc_onCoAuthoringDisconnect',  this.onCoAuthoringDisconnect.bind(this));

            api.asc_registerCallback('asc_OnTryUndoInFastCollaborative', this.onTryUndoInFastCollaborative.bind(this));
        });

        Common.Notifications.on('api:disconnect', this.onCoAuthoringDisconnect.bind(this));
        Common.Notifications.on('document:ready', this.onDocumentReady.bind(this));
    }

    onDocumentReady() {
        const api = Common.EditorApi.get();
        const appOptions = this.props.storeAppOptions;
        /** coauthoring begin **/
        let isFastCoauth;
        if (appOptions.isEdit && appOptions.canLicense && !appOptions.isOffline && appOptions.canCoAuthoring) {
            // Force ON fast co-authoring mode
            isFastCoauth = true;
            api.asc_SetFastCollaborative(isFastCoauth);

            if (window.editorType === 'de') {
                const value = LocalStorage.getItem((isFastCoauth) ? "de-settings-showchanges-fast" : "de-settings-showchanges-strict");
                if (value !== null) {
                    api.SetCollaborativeMarksShowType(
                        value === 'all' ? Asc.c_oAscCollaborativeMarksShowType.All :
                            value === 'none' ? Asc.c_oAscCollaborativeMarksShowType.None : Asc.c_oAscCollaborativeMarksShowType.LastChanges);
                } else {
                    api.SetCollaborativeMarksShowType(isFastCoauth ? Asc.c_oAscCollaborativeMarksShowType.None : Asc.c_oAscCollaborativeMarksShowType.LastChanges);
                }
            }
        } else if (!appOptions.isEdit && appOptions.isRestrictedEdit) {
            isFastCoauth = true;
            api.asc_SetFastCollaborative(isFastCoauth);
            window.editorType === 'de' && api.SetCollaborativeMarksShowType(Asc.c_oAscCollaborativeMarksShowType.None);
            api.asc_setAutoSaveGap(1);
        } else {
            isFastCoauth = false;
            api.asc_SetFastCollaborative(isFastCoauth);
            window.editorType === 'de' && api.SetCollaborativeMarksShowType(Asc.c_oAscCollaborativeMarksShowType.None);
        }

        if (appOptions.isEdit) {
            let value;
            if (window.editorType === 'sse') {
                value = appOptions.canAutosave ? 1 : 0; // FORCE AUTOSAVE
            } else {
                value = isFastCoauth; // Common.localStorage.getItem("de-settings-autosave");
                value = (!isFastCoauth && value !== null) ? parseInt(value) : (appOptions.canCoAuthoring ? 1 : 0);
            }
            api.asc_setAutoSaveGap(value);
        }
        /** coauthoring end **/
    }

    onChangeEditUsers(users) {
        const storeUsers = this.props.users;
        storeUsers.reset(users);
        storeUsers.setCurrentUser(this.props.storeAppOptions.user.id);
    }

    onUserConnection(change) {
        this.props.users.connection(change);
    }

    onCoAuthoringDisconnect() {
        this.props.users.resetDisconnected(true);
    }

    onTryUndoInFastCollaborative() {
        const { t } = this.props;
        const _t = t("Common.Collaboration", { returnObjects: true });
        f7.dialog.alert(_t.textTryUndoRedo, _t.notcriticalErrorTitle);
    }

    render() {
        return null
    }
}

export default inject('users', 'storeAppOptions')(observer(withTranslation()(CollaborationController)));