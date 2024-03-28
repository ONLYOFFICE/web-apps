import React, { useEffect, useState } from 'react';
import { inject, observer } from 'mobx-react';
import { f7 } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import ToolbarView from "../view/Toolbar";
import { Device } from '../../../../common/mobile/utils/device';

const ToolbarController = inject('storeAppOptions', 'users', 'storeSpreadsheetInfo', 'storeFocusObjects', 'storeToolbarSettings', 'storeWorksheets', 'storeVersionHistory')(observer(props => {
    const {t} = useTranslation();
    const _t = t("Toolbar", { returnObjects: true });
    const storeVersionHistory = props.storeVersionHistory;
    const storeSpreadsheetInfo = props.storeSpreadsheetInfo;
    const isVersionHistoryMode = storeVersionHistory.isVersionHistoryMode;

    const storeWorksheets = props.storeWorksheets;
    const wsProps = storeWorksheets.wsProps;

    const appOptions = props.storeAppOptions;
    const isDisconnected = props.users.isDisconnected;

    const storeFocusObjects = props.storeFocusObjects;
    const focusOn = storeFocusObjects.focusOn;
    const isObjectLocked = storeFocusObjects.isLocked;
    const isShapeLocked = storeFocusObjects.isLockedShape;
    const isEditCell = storeFocusObjects.isEditCell;
    const editFormulaMode = storeFocusObjects.editFormulaMode;

    const displayCollaboration = props.users.hasEditUsers || appOptions.canViewComments;
    const docTitle = storeSpreadsheetInfo.dataDoc?.title ?? '';
    const docExt = storeSpreadsheetInfo.dataDoc?.fileType ?? '';
   
    const showEditDocument = !appOptions.isEdit && appOptions.canEdit && appOptions.canRequestEditRights;

    const storeToolbarSettings = props.storeToolbarSettings;
    const isCanUndo = storeToolbarSettings.isCanUndo;
    const isCanRedo = storeToolbarSettings.isCanRedo;
    const disabledControls = storeToolbarSettings.disabledControls;
    const disabledEditControls = storeToolbarSettings.disabledEditControls;
    const disabledSettings = storeToolbarSettings.disabledSettings;

    useEffect(() => {
        Common.Gateway.on('init', loadConfig);
        Common.Notifications.on('toolbar:activatecontrols', activateControls);
        Common.Notifications.on('toolbar:deactivateeditcontrols', deactivateEditControls);
        Common.Notifications.on('goback', goBack);
        Common.Notifications.on('close', onClose);
        Common.Notifications.on('sheet:active', onApiActiveSheetChanged);

        if (isDisconnected) {
            f7.popover.close();
            f7.sheet.close();
            f7.popup.close();
        }

        return () => {
            Common.Notifications.off('toolbar:activatecontrols', activateControls);
            Common.Notifications.off('toolbar:deactivateeditcontrols', deactivateEditControls);
            Common.Notifications.off('goback', goBack);
            Common.Notifications.off('close', onClose);
            Common.Notifications.off('sheet:active', onApiActiveSheetChanged);
        }
    });

    // Back button
    const [isShowBack, setShowBack] = useState(appOptions.canBackToFolder);
    const loadConfig = (data) => {
        if (data && data.config && data.config.canBackToFolder !== false &&
            data.config.customization && data.config.customization.goback) {
            const canback = data.config.customization.close === undefined ?
                data.config.customization.goback.url || data.config.customization.goback.requestClose && data.config.canRequestClose :
                data.config.customization.goback.url && !data.config.customization.goback.requestClose;
            canback && setShowBack(true);
        }
    };

    const onRequestClose = () => {
        const api = Common.EditorApi.get();

        if (api.asc_isDocumentModified()) {
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

    const onClose = () => {
        onRequestClose();
    }

    const onUndo = () => {
        const api = Common.EditorApi.get();
        if (api) {
            api.asc_Undo();
        }
    };

    const onRedo = () => {
        const api = Common.EditorApi.get();
        if (api) {
            api.asc_Redo();
        }
    }

    const onApiActiveSheetChanged = (index) => {
        Common.Notifications.trigger('comments:filterchange', ['doc', 'sheet' + Common.EditorApi.get().asc_getWorksheetId(index)], false );
    };

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

    const closeHistory = () => {
        Common.Gateway.requestHistoryClose();
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
                    text: t('View.Edit.textCancel')
                },
                {
                    text: t('View.Edit.textOk'),
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
        const currentTitle = `${name}.${docExt}`;
        let formatName = name.trim();

        if(formatName.length > 0 && cutDocName(currentTitle) !== formatName) {
            if(/[\t*\+:\"<>?|\\\\/]/gim.test(formatName)) {
                f7.dialog.create({
                    title: t('View.Edit.notcriticalErrorTitle'),
                    text: t('View.Edit.textInvalidName') + '*+:\"<>?|\/',
                    buttons: [
                        {
                            text: t('View.Edit.textOk'),
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
                storeSpreadsheetInfo.changeTitle(newTitle);
            }
        }
    }

    return (
        <ToolbarView 
            openOptions={props.openOptions}
            isEdit={appOptions.isEdit}
            docTitle={docTitle}
            isShowBack={isShowBack}
            isCanUndo={isCanUndo}
            isCanRedo={isCanRedo}
            onUndo={onUndo}
            onRedo={onRedo}
            disabledControls={disabledControls}
            disabledEditControls={disabledEditControls || isObjectLocked || editFormulaMode || isEditCell}
            disabledSearch={editFormulaMode || isEditCell}
            disabledSettings={disabledSettings || editFormulaMode || isEditCell}
            displayCollaboration={displayCollaboration}
            disabledCollaboration={editFormulaMode || isEditCell}
            showEditDocument={showEditDocument}
            onEditDocument={onEditDocument}
            isDisconnected={isDisconnected}
            wsProps={wsProps}
            focusOn={focusOn}
            isShapeLocked={isShapeLocked}
            isVersionHistoryMode={isVersionHistoryMode}
            closeHistory={closeHistory}
            isOpenModal={props.isOpenModal}
            changeTitleHandler={changeTitleHandler}
        />
    )
}));

export {ToolbarController as Toolbar};