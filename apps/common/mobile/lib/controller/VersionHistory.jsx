import React, { useEffect, useRef } from 'react';
import { observer, inject } from "mobx-react";
import VersionHistoryView from '../view/VersionHistory';
import { f7, Sheet, Popover, View } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import { Device } from '../../../../common/mobile/utils/device';
import { getUserColor } from '../../utils/getUserColor';

const VersionHistoryController = inject('storeAppOptions', 'storeVersionHistory')(observer(props => {
    const api = Common.EditorApi.get();
    const appOptions = props.storeAppOptions;
    const isViewer = appOptions.isViewer;
    const historyStore = props.storeVersionHistory;
    const isVersionHistoryMode = historyStore.isVersionHistoryMode;
    const arrVersionsHistory = historyStore.arrVersions;
    const fileTypes = {
        de: 'docx',
        pe: 'pptx',
        sse: 'xslx'
    };
    const fileType = fileTypes[window.editorType];
    const { t } = useTranslation();

    let currentChangeId = -1;
    let currentDocId = '';
    let currentDocIdPrev = '';
    let currentServerVersion = 0;
    let currentUserId = '';
    let currentUserName = '';
    let currentUserColor = '';
    let currentDateCreated = '';
    let isFromSelectRevision;
    let currentRev = 0;
    let timerId;

    const timeoutIdRef = useRef(null);
    const currentArrColors = useRef(null);

    useEffect(() => {
        api.asc_enableKeyEvents(false);

        if(arrVersionsHistory.length < 1) {
            Common.Gateway.requestHistory();
            Common.Gateway.on('refreshhistory', onRefreshHistory);
            Common.Gateway.on('sethistorydata', onSetHistoryData);

            api.asc_registerCallback('asc_onDownloadUrl', onDownloadUrl);
            api.asc_registerCallback('asc_onExpiredToken', onExpiredToken);
        }

        if(window.editorType === 'de') {
            if(!isViewer) {
                appOptions.changeViewerMode(true);
                api.asc_addRestriction(Asc.c_oAscRestrictionType.View);
            }
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
            api.asc_enableKeyEvents(true);
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
                title: t('Common.VersionHistory.notcriticalErrorTitle'),
                text: (opts.data.error) ? opts.data.error : t('Common.VersionHistory.txtErrorLoadHistory'),
                buttons: [
                    {
                        text: t('Common.VersionHistory.textOk')
                    }
                ]
            }).open();
        } else {
            api.asc_coAuthoringDisconnect();

            const versions = opts.data.history;
            let arrVersions = [];
            let arrColors = [];
            let ver, version, currentVersion = null, group = -1, prev_ver = -1, docIdPrev = '', user = null, usersCnt = 0;

            for (ver = versions.length - 1; ver >= 0; ver--) {
                version = versions[ver];

                if (version.versionGroup === undefined || version.versionGroup === null) {
                    version.versionGroup = version.version;
                }

                if (version) {
                    if (!version.user) version.user = {};

                    docIdPrev = (ver > 0 && versions[ver - 1]) ? versions[ver - 1].key : version.key + '0';
                    user = historyStore.findUserById(version.user.id);

                    if (!user) {
                        const color = getUserColor(version.user.id || version.user.name || t('Common.VersionHistory.textAnonymous'), true);

                        user = {
                            id: version.user.id,
                            username: version.user.name || t('Common.VersionHistory.textAnonymous'),
                            colorval: color,
                            color: generateUserColor(color),
                           
                        };

                        historyStore.addUser(user);
                    }

                    arrVersions.push({
                        version: version.versionGroup,
                        revision: version.version,
                        userid: version.user.id,
                        username: version.user.name || t('Common.VersionHistory.textAnonymous'),
                        usercolor: user.color,
                        created: version.created,
                        docId: version.key,
                        markedAsVersion: (group !== version.versionGroup),
                        selected: (opts.data.currentVersion == version.version),
                        canRestore: appOptions.canHistoryRestore && (ver < versions.length - 1),
                        isExpanded: true,
                        serverVersion: version.serverVersion,
                        fileType,
                        isRevision: true
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

                    arrColors.push(user.colorval);

                    let changes = version.changes, change, i;

                    if (changes && changes.length > 0) {
                        arrVersions[arrVersions.length - 1].docIdPrev = docIdPrev;

                        if (version.serverVersion && version.serverVersion == appOptions.buildVersion) {
                            arrVersions[arrVersions.length - 1].changeid = changes.length - 1;
                            arrVersions[arrVersions.length - 1].hasChanges = changes.length > 1;

                            for (i = changes.length - 2; i >= 0; i--) {
                                change = changes[i];
                                user = historyStore.findUserById(change.user.id);

                                if (!user) {
                                    const color = getUserColor(change.user.id || change.user.name || t('Common.VersionHistory.textAnonymous'), true);

                                    user = {
                                        id: change.user.id,
                                        username: change.user.name || t('Common.VersionHistory.textAnonymous'),
                                        colorval: color,
                                        color: generateUserColor(color),
                                    };

                                    historyStore.addUser(user);
                                }

                                arrVersions.push({
                                    version: version.versionGroup,
                                    revision: version.version,
                                    changeid: i,
                                    userid: change.user.id,
                                    username: change.user.name || t('Common.VersionHistory.textAnonymous'),
                                    usercolor: user.color,
                                    created: change.created,
                                    docId: version.key,
                                    docIdPrev: docIdPrev,
                                    selected: false,
                                    canRestore: appOptions.canHistoryRestore && appOptions.canDownload,
                                    isRevision: false,
                                    isVisible: true,
                                    serverVersion: version.serverVersion,
                                    fileType
                                });

                                arrColors.push(user.colorval);
                            }
                        }
                    } else if (ver == 0 && versions.length == 1) {
                        arrVersions[arrVersions.length - 1].docId = version.key + '1';
                    }
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
                arrVersions[0].selected = true;
                currentVersion = JSON.parse(JSON.stringify(arrVersions[0]));
                
                historyStore.setVersions([...arrVersions]);
                historyStore.changeVersion(currentVersion);
            } else if(!historyStore.currentVersion) {
                onSelectRevision(currentVersion);
            }
        }
    }

    const generateUserColor = color => {
        return '#' + color.toString(16);
    }

    const onSetHistoryData = opts => {
        if (!appOptions.canUseHistory) return;

        if (timeoutIdRef.current) {
            clearTimeout(timeoutIdRef.current);
            timerId = 0;
        }

        if (opts.data.error) {
            f7.dialog.create({
                title: t('Common.VersionHistory.notcriticalErrorTitle'),
                text: opts.data.error,
                buttons: [
                    {
                        text: t('Common.VersionHistory.textOk')
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
                hist.asc_setArrColors(currentArrColors.current);
                hist.asc_setToken(token);
                hist.asc_setIsRequested(true);
                hist.asc_setServerVersion(currentServerVersion);
                hist.asc_SetUserId(currentUserId);
                hist.asc_SetUserName(currentUserName);
                hist.asc_SetUserColor(currentUserColor);
                hist.asc_SetDateOfRevision(currentDateCreated);

                api.asc_showRevision(hist);
                currentRev = data.version;

                const selectedRev = revisions.find(revision => revision.selected);
               
                if(selectedRev) {
                    historyStore.changeVersion(selectedRev);
                } 
            }
        }
    };

    const onRestoreRevision = revision => {
        const isRevision = revision.isRevision;

        if (isRevision) {
            f7.dialog.create({
                title: t('Common.VersionHistory.titleWarningRestoreVersion'),
                text: t('Common.VersionHistory.textWarningRestoreVersion'),
                buttons: [
                    {
                        text: t('Common.VersionHistory.textCancel'),
                        bold: true
                    }, 
                    {
                        text: t('Common.VersionHistory.textRestore'),
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

        historyStore.changeVersion(version);

        currentRev = rev;
        currentChangeId = version.changeid;
        currentDocId = version.docId;
        currentDocIdPrev = version.docIdPrev;
        currentArrColors.current = version.arrColors;
        currentServerVersion = version.serverVersion;
        currentUserId = version.userid;
        currentUserName = version.username;
        currentUserColor = version.usercolor;
        currentDateCreated = version.created;

        if (!url || (urlGetTime - version.urlGetTime > 5 * 60000)) {
            if (!timerId) {
                timeoutIdRef.current = setTimeout(() => {
                    timerId = 0;
                }, 30000);

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
            hist.asc_setArrColors(currentArrColors.current);
            hist.asc_setToken(token);
            hist.asc_setIsRequested(false);
            hist.asc_setServerVersion(currentServerVersion);
            hist.asc_SetUserId(currentUserId);
            hist.asc_SetUserName(currentUserName);
            hist.asc_SetUserColor(currentUserColor);
            hist.asc_SetDateOfRevision(currentDateCreated);

            api.asc_showRevision(hist);
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
                <Sheet id='version-history-sheet' backdrop={true} closeByOutsideClick={false} onSheetClosed={() => props.onclosed()}>
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
