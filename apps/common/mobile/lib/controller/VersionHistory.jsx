import React, { useEffect } from 'react';
import { observer, inject } from "mobx-react";
import VersionHistoryView from '../view/VersionHistory';
import { f7 } from 'framework7-react';
import { useTranslation } from 'react-i18next';

const VersionHistoryController = inject('storeAppOptions', 'users', 'storeVersionHistory')(observer(props => {
    const appOptions = props.storeAppOptions;
    const usersStore = props.users;
    const historyStore = props.storeVersionHistory;
    const arrVersions = historyStore.arrVersions;
    const api = Common.EditorApi.get();
    const { t } = useTranslation();

    useEffect(() => {
        Common.Gateway.requestHistory();
        Common.Gateway.on('refreshhistory', onRefreshHistory);
        Common.Gateway.on('sethistorydata', onSetHistoryData);
    }, []);

    const onRefreshHistory = opts => {
        if (!appOptions.canUseHistory) return;

        if (opts.data.error || !opts.data.history) {
            if (arrVersions.length) {
                const arr = arrVersions.map(version => {
                    version.canRestore = false;
                    return version;
                });

                historyStore.setVersions(arr);
            }

            f7.dialog.create({
                title: t('Settings.notcriticalErrorTitle'),
                text: (opts.data.error) ? opts.data.error : t('Settings.txtErrorLoadHistory'),
                buttons: [
                    {
                        text: t('Settings.textOk')
                    }
                ]
            }).open();
        } else {
            api.asc_coAuthoringDisconnect();

            const versions = opts.data.history;
            let arrVersions = [];
            let arrColors = [];
            let ver, version, currentVersion = null, group = -1, prev_ver = -1, docIdPrev = '', user = null;

            for (ver = versions.length - 1; ver >= 0; ver--) {
                version = versions[ver];

                if (version.versionGroup === undefined || version.versionGroup === null) {
                    version.versionGroup = version.version;
                }

                if (version) {
                    if (!version.user) version.user = {};

                    docIdPrev = (ver > 0 && versions[ver - 1]) ? versions[ver - 1].key : version.key + '0';
                    user = usersStore.searchUserById(version.user.id);

                    arrVersions.push({
                        version: version.versionGroup,
                        revision: version.version,
                        userid : version.user.id,
                        username : version.user.name || t('Settings.textAnonymous'),
                        usercolor: user.color,
                        created: version.created,
                        docId: version.key,
                        markedAsVersion: (group !== version.versionGroup),
                        selected: (opts.data.currentVersion == version.version),
                        canRestore: appOptions.canHistoryRestore && (ver < versions.length - 1),
                        isExpanded: true,
                        serverVersion: version.serverVersion,
                        fileType: 'docx'
                    });

                    if (opts.data.currentVersion == version.version) {
                        currentVersion = arrVersions[arrVersions.length - 1];
                    }

                    group = version.versionGroup;

                    if (prev_ver !== version.version) {
                        prev_ver = version.version;
                        arrColors.reverse();

                        for (let i = 0; i < arrColors.length; i++) {
                            arrVersions[arrVersions.length - i - 2].arrColors = arrColors;
                        }

                        arrColors = [];
                    }

                    arrColors.push(user.color);

                    let changes = version.changes, change, i;

                    if (changes && changes.length > 0) {
                        arrVersions[arrVersions.length - 1].docIdPrev = docIdPrev;

                        if (version.serverVersion && version.serverVersion == appOptions.buildVersion) {
                            arrVersions[arrVersions.length - 1].changeid = changes.length - 1;
                            arrVersions[arrVersions.length - 1].hasChanges = changes.length > 1;

                            for (i = changes.length - 2; i >= 0; i--) {
                                change = changes[i];

                                user = usersStore.searchUserById(change.user.id);

                                arrVersions.push({
                                    version: version.versionGroup,
                                    revision: version.version,
                                    changeid: i,
                                    userid : change.user.id,
                                    username : change.user.name || t('Settings.textAnonymous'),
                                    usercolor: user.color,
                                    created: change.created,
                                    docId: version.key,
                                    docIdPrev: docIdPrev,
                                    selected: false,
                                    canRestore: appOptions.canHistoryRestore && appOptions.canDownload,
                                    isRevision: false,
                                    isVisible: true,
                                    serverVersion: version.serverVersion,
                                    fileType: 'docx'
                                });

                                arrColors.push(user.color);
                            }
                        }
                    } else if (ver == 0 && versions.length == 1) {
                        arrVersions[arrVersions.length-1].docId = version.key + '1';
                    }
                }
            
                if (arrColors.length > 0) {
                    arrColors.reverse();

                    for (let i = 0; i < arrColors.length; i++) {
                        arrVersions[arrVersions.length - i - 1].arrColors = arrColors;
                    }

                    arrColors = [];
                }
            }

            historyStore.setVersions(arrVersions);
        }
    }

    const onSetHistoryData = opts => {
        if (!appOptions.canUseHistory) return;

        if (opts.data.error) {
            f7.dialog.create({
                title: t('Settings.notcriticalErrorTitle'),
                text: opts.data.error,
                buttons: [
                    {
                        text: t('Settings.textOk')
                    }
                ]
            }).open();
        }
    };

    return (
        <VersionHistoryView />
    )
}));

export default VersionHistoryController;
