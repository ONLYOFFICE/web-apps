import React, { useEffect, useState } from 'react';
import { observer, inject } from "mobx-react";
import VersionHistoryView from '../view/VersionHistory';
import { f7, Sheet, Popover, View } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import { Device } from '../../../../common/mobile/utils/device';

const VersionHistoryController = inject('storeAppOptions', 'users', 'storeVersionHistory')(observer(props => {
    const api = Common.EditorApi.get();
    const appOptions = props.storeAppOptions;
    const isViewer = appOptions.isViewer;
    const usersStore = props.users;
    const historyStore = props.storeVersionHistory;
    const isVersionHistoryMode = historyStore.isVersionHistoryMode;
    const arrVersions = historyStore.arrVersions;
    const { t } = useTranslation();

    let currentChangeId = -1;
    let currentDocId = '';
    let currentDocIdPrev = '';
    let currentArrColors = [];
    let currentServerVersion = 0;
    let currentUserId = '';
    let currentUserName = '';
    let currentUserColor = '';
    let currentDateCreated = '';
    let isFromSelectRevision;
    let currentRev = 0;
    let timerId;

    useEffect(() => {
        const api = Common.EditorApi.get();

        Common.Gateway.requestHistory();
        Common.Gateway.on('refreshhistory', onRefreshHistory);
        Common.Gateway.on('sethistorydata', onSetHistoryData);

        api.asc_registerCallback('asc_onDownloadUrl', onDownloadUrl);
        api.asc_registerCallback('asc_onExpiredToken', onExpiredToken);

        if(!isViewer) {
            appOptions.changeViewerMode(true);
            api.asc_addRestriction(Asc.c_oAscRestrictionType.View);
        }

        if(!isVersionHistoryMode) {
            historyStore.changeVersionHistoryMode(true);
        }
        
        if(!props.isNavigate) {
            if(Device.phone) {
                f7.sheet.open('#version-history-sheet', true);
            } else {
                f7.popover.open('#version-history-popover', '#btn-open-history');
            }
        }

        return () => {
            api.asc_unregisterCallback('asc_onDownloadUrl', onDownloadUrl);
            api.asc_unregisterCallback('asc_onExpiredToken', onExpiredToken);
        }
    }, []);

    const onExpiredToken = () => {
        setTimeout(() => {
            Common.Gateway.requestHistoryData(currentRev);
        }, 10);
    }

    const onDownloadUrl = (url, fileType) => {
        if (isFromSelectRevision) {
            Common.Gateway.requestRestore(isFromSelectRevision, url, fileType);
        }

        isFromSelectRevision = null;
    }

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

                    if (!user) {
                        user = {
                            id: version.user.id,
                            username: version.user.name || t('Settings.textAnonymous'),
                            color: generateUserColor(Asc.c_oAscArrUserColors[usersCnt++])
                        };

                        usersStore.addUser(user);
                    }

                    arrVersions.push({
                        version: version.versionGroup,
                        revision: version.version,
                        userid: version.user.id,
                        username: version.user.name || t('Settings.textAnonymous'),
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

                                if (!user) {
                                    user = {
                                        id: change.user.id,
                                        username: change.user.name || t('Settings.textAnonymous'),
                                        color: generateUserColor(Asc.c_oAscArrUserColors[usersCnt++])
                                    };

                                    usersStore.addUser(user);
                                }

                                arrVersions.push({
                                    version: version.versionGroup,
                                    revision: version.version,
                                    changeid: i,
                                    userid: change.user.id,
                                    username: change.user.name || t('Settings.textAnonymous'),
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
                        arrVersions[arrVersions.length - 1].docId = version.key + '1';
                    }
                }
            
                if (arrColors.length > 0) {
                    arrColors.reverse();

                    for (let i = 0; i < arrColors.length; i++) {
                        arrVersions[arrVersions.length - i - 1].arrColors = arrColors;
                    }

                    arrColors = [];
                }

                historyStore.setVersions(arrVersions);

                if (currentVersion === null && historyStore.arrVersions.length > 0) {
                    currentVersion = historyStore.arrVersions[0];
                    currentVersion.selected = true;

                    historyStore.setVersions([...arrVersions, currentVersion]);
                    historyStore.changeVersion(currentVersion);
                } else {
                    if(!historyStore.currentVersion) {
                        historyStore.changeVersion(currentVersion);
                        onSelectRevision(currentVersion);
                    }
                }
            }
        }
    }

    const generateUserColor = color => {
        return '#' + ('000000' + color.toString(16)).substring(-6);
    }

    const onSetHistoryData = opts => {
        if (!appOptions.canUseHistory) return;

        if (timerId) {
            clearTimeout(timerId);
            timerId = 0;
        }

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
        } else {
            const data = opts.data;
        
            if (data !== null) {
                let rev, revisions = historyStore.findRevisions(data.version), 
                    urlGetTime = new Date(),
                    diff = (!opts.data.previous || currentChangeId === undefined) ? null : opts.data.changesUrl,
                    url = !diff && opts.data.previous ? opts.data.previous.url : opts.data.url,
                    fileType = !diff && opts.data.previous ? opts.data.previous.fileType : opts.data.fileType,
                    docId = opts.data.key ? opts.data.key : currentDocId,
                    docIdPrev = opts.data.previous && opts.data.previous.key ? opts.data.previous.key : currentDocIdPrev,
                    token = opts.data.token;

                if (revisions && revisions.length > 0) {
                    for(let i = 0; i < revisions.length; i++) {
                        rev = revisions[i];
                        rev.url = url;
                        rev.urlDiff = diff;
                        rev.urlGetTime = urlGetTime;

                        if (opts.data.key) {
                            rev.docId = docId;
                            rev.docIdPrev = docIdPrev;
                        }

                        rev.token = token;

                        if(fileType) {
                            rev.fileType = fileType;
                        }
                    }
                }

                const hist = new Asc.asc_CVersionHistory();

                hist.asc_setUrl(url);
                hist.asc_setUrlChanges(diff);
                hist.asc_setDocId(!diff ? docId : docIdPrev);
                hist.asc_setCurrentChangeId(currentChangeId);
                hist.asc_setArrColors(currentArrColors);
                hist.asc_setToken(token);
                hist.asc_setIsRequested(true);
                hist.asc_setServerVersion(currentServerVersion);
                hist.asc_SetUserId(currentUserId);
                hist.asc_SetUserName(currentUserName);
                hist.asc_SetUserColor(currentUserColor);
                hist.asc_SetDateOfRevision(currentDateCreated);

                api.asc_showRevision(hist);

                currentRev = data.version;
                historyStore.changeVersion(data);
            }
        }
    };

    const onRestoreRevision = revision => {
        const isRevision = revision.isRevision;

        if (isRevision) {
            f7.dialog.create({
                title: t('Settings.titleWarningRestoreVersion'),
                text: t('Settings.textWarningRestoreVersion'),
                buttons: [
                    {
                        text: t('Settings.textCancel'),
                        bold: true
                    }, 
                    {
                        text: t('Settings.textRestore'),
                        onClick: () => {
                            Common.Gateway.requestRestore(revision.revision, undefined, revision.fileType);
                        }
                    }
                ]
            }).open();
        } else {
            isFromSelectRevision = revision.revision;

            const fileType = Asc.c_oAscFileType[(revision.fileType || '').toUpperCase()] || Asc.c_oAscFileType.DOCX;
            api.asc_DownloadAs(new Asc.asc_CDownloadOptions(fileType, true));
        }
    }

    const onSelectRevision = version => {
        const rev = version.revision;
        const url = version.url;
        const urlGetTime  = new Date();

        currentRev = rev;
        currentChangeId = version.changeid;
        currentDocId = version.docId;
        currentDocIdPrev = version.docIdPrev;
        currentArrColors = version.arrColors;
        currentServerVersion = version.serverVersion;
        currentUserId = version.userid;
        currentUserName = version.username;
        currentUserColor = version.usercolor;
        currentDateCreated = version.created;

        if (!url || (urlGetTime - version.urlGetTime > 5 * 60000)) {
            if (!timerId) {
                timerId = setTimeout(function() {
                    timerId = 0;
                }, 500);

                setTimeout(() => {
                    Common.Gateway.requestHistoryData(rev);
                }, 10);
            }
        } else {
            const urlDiff = version.urlDiff;
            const token = version.token;
            const hist = new Asc.asc_CVersionHistory();

            hist.asc_setDocId(!urlDiff ? currentDocId : currentDocIdPrev);
            hist.asc_setUrl(url);
            hist.asc_setUrlChanges(urlDiff);
            hist.asc_setCurrentChangeId(currentChangeId);
            hist.asc_setArrColors(currentArrColors);
            hist.asc_setToken(token);
            hist.asc_setIsRequested(false);
            hist.asc_setServerVersion(currentServerVersion);
            hist.asc_SetUserId(currentUserId);
            hist.asc_SetUserName(currentUserName);
            hist.asc_SetUserColor(currentUserColor);
            hist.asc_SetDateOfRevision(currentDateCreated);

            api.asc_showRevision(hist);
            historyStore.changeVersion(version);
        }
    }

    return (
        props.isNavigate ?
            !Device.phone &&
                <VersionHistoryView 
                    onSetHistoryData={onSetHistoryData}
                    onSelectRevision={onSelectRevision}
                    onRestoreRevision={onRestoreRevision}
                    isNavigate={props.isNavigate}
                />
        :
            !Device.phone ?
                <Popover id='version-history-popover' closeByOutsideClick={false} className="popover__titled" onPopoverClosed={() => props.onclosed()}>
                    <View style={{height: '410px'}}>
                        <VersionHistoryView 
                            onSetHistoryData={onSetHistoryData}
                            onSelectRevision={onSelectRevision}
                            onRestoreRevision={onRestoreRevision}
                            isNavigate={props.isNavigate}
                        />
                    </View>
                </Popover>
            :
                <Sheet id='version-history-sheet' closeByOutsideClick={false} push onSheetClosed={() => props.onclosed()}>
                    <VersionHistoryView 
                        onSetHistoryData={onSetHistoryData}
                        onSelectRevision={onSelectRevision}
                        onRestoreRevision={onRestoreRevision}
                        isNavigate={props.isNavigate}
                    />
                </Sheet>

    )
}));

export default VersionHistoryController;
