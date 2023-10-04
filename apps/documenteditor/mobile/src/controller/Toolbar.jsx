import React, { useEffect, useState } from 'react';
import { Device } from '../../../../common/mobile/utils/device';
import { inject, observer } from 'mobx-react';
import { f7 } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import ToolbarView from "../view/Toolbar";
import {LocalStorage} from "../../../../common/mobile/utils/LocalStorage.mjs";

const ToolbarController = inject('storeAppOptions', 'users', 'storeReview', 'storeFocusObjects', 'storeToolbarSettings','storeDocumentInfo', 'storeVersionHistory')(observer(props => {
    const {t} = useTranslation();
    const _t = t("Toolbar", { returnObjects: true });
    const appOptions = props.storeAppOptions;
    const isEdit = appOptions.isEdit;
    const storeVersionHistory = props.storeVersionHistory;
    const isVersionHistoryMode = storeVersionHistory.isVersionHistoryMode;
    const isViewer = appOptions.isViewer;
    const isMobileView = appOptions.isMobileView;
    const isDisconnected = props.users.isDisconnected;
    const displayMode = props.storeReview.displayMode;
    const stateDisplayMode = displayMode == "final" || displayMode == "original" ? true : false;
    const displayCollaboration = props.users.hasEditUsers || appOptions.canViewComments || appOptions.canReview || appOptions.canViewReview;
    const readerMode = appOptions.readerMode;
    const objectLocked = props.storeFocusObjects.objectLocked;
    const storeToolbarSettings = props.storeToolbarSettings;
    const isCanUndo = storeToolbarSettings.isCanUndo;
    const isCanRedo = storeToolbarSettings.isCanRedo;
    const disabledControls = storeToolbarSettings.disabledControls;
    const disabledEditControls = storeToolbarSettings.disabledEditControls;
    const disabledSettings = storeToolbarSettings.disabledSettings;
    const showEditDocument = !isEdit && appOptions.canEdit && appOptions.canRequestEditRights;
    const storeDocumentInfo = props.storeDocumentInfo;
    const docExt = storeDocumentInfo.dataDoc ? storeDocumentInfo.dataDoc.fileType : '';
    const docTitle = storeDocumentInfo.dataDoc ? storeDocumentInfo.dataDoc.title : '';

    useEffect(() => {
        Common.Gateway.on('init', loadConfig);
        Common.Notifications.on('toolbar:activatecontrols', activateControls);
        Common.Notifications.on('toolbar:deactivateeditcontrols', deactivateEditControls);
        Common.Notifications.on('goback', goBack);

        if (isDisconnected) {
            f7.popover.close();
            f7.sheet.close();
            f7.popup.close();
        }

        return () => {
            Common.Notifications.off('toolbar:activatecontrols', activateControls);
            Common.Notifications.off('toolbar:deactivateeditcontrols', deactivateEditControls);
            Common.Notifications.off('goback', goBack);
        }
    }, []);

    useEffect(() => {
        const api = Common.EditorApi.get();
        const navbarBgHeight = document.querySelector('.navbar-bg').clientHeight;
        const subnavbarHeight = document.querySelector('.subnavbar').clientHeight;
        const navbarHeight = navbarBgHeight + subnavbarHeight;

        const onEngineCreated = api => {
            if(isViewer) {
                api.SetMobileTopOffset(navbarHeight, navbarHeight);
                api.asc_registerCallback('onMobileScrollDelta', scrollHandler);
            }
        };

        if (!api) {
            Common.Notifications.on('engineCreated', onEngineCreated);
        } else {
            onEngineCreated(api);
        }

        return () => {
            const api = Common.EditorApi.get();

            if (api && isViewer) {
                api.SetMobileTopOffset(navbarHeight, navbarHeight);
                api.asc_unregisterCallback('onMobileScrollDelta', scrollHandler);
            }

            Common.Notifications.off('engineCreated', onEngineCreated);
        }
    }, [isViewer]);

    // Scroll handler

    const scrollHandler = offset => {
        const api = Common.EditorApi.get();
        const navbarBgHeight = document.querySelector('.navbar-bg').clientHeight;
        const subnavbarHeight = document.querySelector('.subnavbar').clientHeight;
        const navbarHeight = navbarBgHeight + subnavbarHeight;

        if(offset > 0) {
            f7.navbar.hide('.main-navbar');
            props.closeOptions('fab');
            api.SetMobileTopOffset(undefined, 0);
        } else if(offset <= 0) {
            f7.navbar.show('.main-navbar');
            props.openOptions('fab');
            api.SetMobileTopOffset(undefined, navbarHeight);
        }
    }

    // Back button
    const [isShowBack, setShowBack] = useState(appOptions.canBackToFolder);
    const loadConfig = (data) => {
        if (data && data.config && data.config.canBackToFolder !== false &&
            data.config.customization && data.config.customization.goback &&
            (data.config.customization.goback.url || data.config.customization.goback.requestClose && data.config.canRequestClose))
        {
            setShowBack(true);
        }
    };

    const onRequestClose = () => {
        const api = Common.EditorApi.get();

        if (api.isDocumentModified()) {
            api.asc_stopSaving();

            f7.dialog.create({
                title   : _t.dlgLeaveTitleText,
                text    : _t.dlgLeaveMsgText,
                verticalButtons: true,
                buttons : [
                    {
                        text: _t.leaveButtonText,
                        onClick: () => {
                            api.asc_undoAllChanges();
                            api.asc_continueSaving();
                            Common.Gateway.requestClose();
                        }
                    },
                    {
                        text: _t.stayButtonText,
                        bold: true,
                        onClick: () => {
                            api.asc_continueSaving();
                        }
                    }
                ]
            }).open();
        } else {
            Common.Gateway.requestClose();
        }
    };

    const goBack = (current) => {
        if (appOptions.customization.goback.requestClose && appOptions.canRequestClose) {
            onRequestClose();
        } else {
            const href = appOptions.customization.goback.url;

            if (!current && appOptions.customization.goback.blank !== false) {
                window.open(href, "_blank");
            } else {
                parent.location.href = href;
            }
        }
    }

    const onUndo = () => {
        const api = Common.EditorApi.get();
        if (api) {
            api.Undo();
        }
    };

    const onRedo = () => {
        const api = Common.EditorApi.get();
        if (api) {
            api.Redo();
        }
    }

    const deactivateEditControls = (enableDownload) => {
        storeToolbarSettings.setDisabledEditControls(true);
        if (enableDownload) {
            //DE.getController('Settings').setMode({isDisconnected: true, enableDownload: enableDownload});
        } else {
            storeToolbarSettings.setDisabledSettings(true);
        }
    };

    const activateControls = () => {
        storeToolbarSettings.setDisabledControls(false);
    };

    const onEditDocument = () => {
        Common.Gateway.requestEditRights();
    };

    const turnOnViewerMode = () => {
        const api = Common.EditorApi.get();

        f7.popover.close('.document-menu.modal-in', false);

        appOptions.changeViewerMode(true);
        api.asc_addRestriction(Asc.c_oAscRestrictionType.View);
    }

    const changeMobileView = () => {
        const api = Common.EditorApi.get();
        const isMobileView = appOptions.isMobileView;

        LocalStorage.setBool('mobile-view', !isMobileView);
        appOptions.changeMobileView();
        api.ChangeReaderMode();
    }

    const changeTitleHandler = () => {
        if(!appOptions.canRename) return;

        const api = Common.EditorApi.get();
        api.asc_enableKeyEvents(true);

        f7.dialog.create({
            title: t('Toolbar.textRenameFile'),
            text : t('Toolbar.textEnterNewFileName'),
            content: Device.ios ?
                `<div class="input-field">
                    <input type="text" class="modal-text-input" name="modal-title" id="modal-title">
                </div>` : 
                `<div class="input-field modal-title">
                    <div class="inputs-list list inline-labels">
                        <ul>
                            <li>
                                <div class="item-content item-input">
                                    <div class="item-inner">
                                        <div class="item-input-wrap">
                                            <input type="text" name="modal-title" id="modal-title">
                                        </div>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>`,
            cssClass: 'dlg-adv-options',
            buttons: [
                {
                    text: t('Edit.textCancel')
                },
                {
                    text: t('Edit.textOk'),
                    cssClass: 'btn-change-title',
                    bold: true,
                    close: false,
                    onClick: () => {
                        const titleFieldValue = document.querySelector('#modal-title').value;

                        if(titleFieldValue.trim().length) {
                            changeTitle(titleFieldValue);
                            f7.dialog.close();
                        }
                    }
                }
            ],
            on: {
                opened: () => {
                    const nameDoc = docTitle.split('.')[0];
                    const titleField = document.querySelector('#modal-title');
                    const btnChangeTitle = document.querySelector('.btn-change-title');

                    titleField.value = nameDoc;
                    titleField.focus();
                    titleField.select();

                    titleField.addEventListener('input', () => {
                        if(titleField.value.trim().length) {
                            btnChangeTitle.classList.remove('disabled');
                        } else {
                            btnChangeTitle.classList.add('disabled');
                        }
                    });
                }
            }
        }).open();
    }

    const cutDocName = name => {
        if(name.length <= docExt.length) return name;
        const idx = name.length - docExt.length;

        return name.substring(idx) == docExt ? name.substring(0, idx) : name;
    };

    const changeTitle = (name) => {
        const api = Common.EditorApi.get();
        const docInfo = storeDocumentInfo.docInfo;
        const currentTitle = `${name}.${docExt}`;
        let formatName = name.trim();

        if(formatName.length > 0 && cutDocName(currentTitle) !== formatName) {
            if(/[\t*\+:\"<>?|\\\\/]/gim.test(formatName)) {
                f7.dialog.create({
                    title: t('Edit.notcriticalErrorTitle'),
                    text: t('Edit.textInvalidName') + '*+:\"<>?|\/',
                    buttons: [
                        {
                            text: t('Edit.textOk'),
                            close: true
                        }
                    ]
                }).open();
            } else {
                const wopi = appOptions.wopi;
                formatName = cutDocName(formatName);

                if(wopi) {
                    api.asc_wopi_renameFile(formatName);
                } else {
                    Common.Gateway.requestRename(formatName);
                }

                const newTitle = `${formatName}.${docExt}`;

                storeDocumentInfo.changeTitle(newTitle);
                docInfo.put_Title(newTitle);
                storeDocumentInfo.setDocInfo(docInfo);
            }
        }
    }

    const closeHistory = () => {
        Common.Gateway.requestHistoryClose();
    }

    return (
        <ToolbarView openOptions={props.openOptions}
                     closeOptions={props.closeOptions}
                     isEdit={isEdit}
                     docTitle={docTitle}
                     docExt={docExt}
                     isShowBack={isShowBack}
                     isCanUndo={isCanUndo}
                     isCanRedo={isCanRedo}
                     onUndo={onUndo}
                     onRedo={onRedo}
                     isObjectLocked={objectLocked}
                     stateDisplayMode={stateDisplayMode}
                     disabledControls={disabledControls}
                     disabledEditControls={disabledEditControls}
                     disabledSettings={disabledSettings}
                     displayCollaboration={displayCollaboration}
                     readerMode={readerMode}
                     showEditDocument={showEditDocument}
                     onEditDocument={onEditDocument}
                     isDisconnected={isDisconnected}
                     isViewer={isViewer}
                     turnOnViewerMode={turnOnViewerMode}
                     isMobileView={isMobileView}
                     changeMobileView={changeMobileView}
                     changeTitleHandler={changeTitleHandler}
                     isVersionHistoryMode={isVersionHistoryMode}
                     closeHistory={closeHistory}
                     isOpenModal={props.isOpenModal}
        />
    )
}));

export {ToolbarController as Toolbar};