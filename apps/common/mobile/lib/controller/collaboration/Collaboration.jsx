/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Component } from 'react'
import { f7 } from 'framework7-react';
import {observer, inject} from "mobx-react"
import { LocalStorage } from '../../../utils/LocalStorage.mjs';
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
            const lsvalue = LocalStorage.getItem(`${window.editorType}-mobile-autosave`),
                intvalue = lsvalue != null ? parseInt(lsvalue) : 1;
            api.asc_setAutoSaveGap(intvalue);
            api.asc_SetFastCollaborative(intvalue == 1);
            window.editorType === 'de' && api.SetCollaborativeMarksShowType(Asc.c_oAscCollaborativeMarksShowType.None);
        } else if (appOptions.canLiveView) { // viewer
            isFastCoauth = !(appOptions.config.coEditing && appOptions.config.coEditing.mode==='strict');
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
                value = appOptions.canCoAuthoring && isFastCoauth ? 1 : 0;
            }

            if ( !value ) {
                api.asc_SetFastCollaborative(false);
                api.asc_setAutoSaveGap(0);
            } else {
                const lsvalue = LocalStorage.getItem(`${window.editorType}-mobile-autosave`),
                    intvalue = lsvalue != null ? parseInt(lsvalue) : 1;
                api.asc_setAutoSaveGap(intvalue);
                api.asc_SetFastCollaborative(intvalue == 1);
            }
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
