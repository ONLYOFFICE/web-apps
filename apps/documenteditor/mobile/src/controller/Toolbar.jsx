import React, { useEffect, useState } from 'react';
import { inject } from 'mobx-react';
import { f7 } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import ToolbarView from "../view/Toolbar";

const ToolbarController = inject('storeAppOptions', 'users', 'storeReview')(props => {
    const {t} = useTranslation();
    const _t = t("Toolbar", { returnObjects: true });

    const appOptions = props.storeAppOptions;
    const isDisconnected = props.users.isDisconnected;
    const displayMode = props.storeReview.displayMode;
    const stateDisplayMode = displayMode == "final" || displayMode == "original" ? true : false;
    const displayCollaboration = props.users.hasEditUsers || appOptions.canViewComments || appOptions.canReview || appOptions.canViewReview;
    const readerMode = appOptions.readerMode;

    useEffect(() => {
        const onDocumentReady = () => {
            const api = Common.EditorApi.get();
            api.asc_registerCallback('asc_onCanUndo', onApiCanUndo);
            api.asc_registerCallback('asc_onCanRedo', onApiCanRedo);
            api.asc_registerCallback('asc_onFocusObject', onApiFocusObject);
            api.asc_registerCallback('asc_onCoAuthoringDisconnect', onCoAuthoringDisconnect);
            Common.Notifications.on('api:disconnect', onCoAuthoringDisconnect);
            Common.Notifications.on('toolbar:activatecontrols', activateControls);
            Common.Notifications.on('toolbar:deactivateeditcontrols', deactivateEditControls);
            Common.Notifications.on('goback', goBack);
        };
        if ( !Common.EditorApi ) {
            Common.Notifications.on('document:ready', onDocumentReady);
            Common.Notifications.on('setdoctitle', setDocTitle);
            Common.Gateway.on('init', loadConfig);
        } else {
            onDocumentReady();
        }

        return () => {
            Common.Notifications.off('document:ready', onDocumentReady);
            Common.Notifications.off('setdoctitle', setDocTitle);
            Common.Notifications.off('api:disconnect', onCoAuthoringDisconnect);
            Common.Notifications.off('toolbar:activatecontrols', activateControls);
            Common.Notifications.off('toolbar:deactivateeditcontrols', deactivateEditControls);
            Common.Notifications.off('goback', goBack);

            const api = Common.EditorApi.get();
            api.asc_unregisterCallback('asc_onCanUndo', onApiCanUndo);
            api.asc_unregisterCallback('asc_onCanRedo', onApiCanRedo);
            api.asc_unregisterCallback('asc_onFocusObject', onApiFocusObject);
            api.asc_unregisterCallback('asc_onCoAuthoringDisconnect', onCoAuthoringDisconnect);
        }
    });

    const [docTitle, resetDocTitle] = useState('');
    const setDocTitle = (title) => {
        resetDocTitle(title);
    }

    // Back button
    const [isShowBack, setShowBack] = useState(false);
    const loadConfig = (data) => {
        if (data && data.config && data.config.canBackToFolder !== false &&
            data.config.customization && data.config.customization.goback &&
            (data.config.customization.goback.url || data.config.customization.goback.requestClose && data.config.canRequestClose)) {
            setShowBack(true);
        }
    };
    const onBack = () => {
        const api = Common.EditorApi.get();
        if (api.isDocumentModified()) {
            f7.dialog.create({
                title   : _t.dlgLeaveTitleText,
                text    : _t.dlgLeaveMsgText,
                verticalButtons: true,
                buttons : [
                    {
                        text: _t.leaveButtonText,
                        onClick: function() {
                            goBack();
                        }
                    },
                    {
                        text: _t.stayButtonText,
                        bold: true
                    }
                ]
            }).open();
        } else {
            goBack();
        }
    };
    const goBack = (current) => {
        if (appOptions.customization.goback.requestClose && appOptions.canRequestClose) {
            Common.Gateway.requestClose();
        } else {
            const href = appOptions.customization.goback.url;
            if (!current && appOptions.customization.goback.blank !== false) {
                window.open(href, "_blank");
            } else {
                parent.location.href = href;
            }
        }
    }

    // Undo and Redo
    const [isCanUndo, setCanUndo] = useState(true);
    const [isCanRedo, setCanRedo] = useState(true);
    const onApiCanUndo = (can) => {
        if (isDisconnected) return;
        setCanUndo(can);
    };
    const onApiCanRedo = (can) => {
        if (isDisconnected) return;
        setCanRedo(can);
    };
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

    const [isObjectLocked, setObjectLocked] = useState(false);
    const onApiFocusObject = (objects) => {
        if (isDisconnected) return;

        if (objects.length > 0) {
            const getTopObject = (objects) => {
                const arrObj = objects.reverse();
                let obj;
                for (let i=0; i<arrObj.length; i++) {
                    if (arrObj[i].get_ObjectType() != Asc.c_oAscTypeSelectElement.SpellCheck) {
                        obj = arrObj[i];
                        break;
                    }
                }
                return obj;
            };
            const topObject = getTopObject(objects);
            const topObjectValue = topObject.get_ObjectValue();
            const objectLocked = (typeof topObjectValue.get_Locked === 'function') ? topObjectValue.get_Locked() : false;

            setObjectLocked(objectLocked);
        }
    };

    const [disabledEditControls, setDisabledEditControls] = useState(false);
    const [disabledSettings, setDisabledSettings] = useState(false);
    const deactivateEditControls = (enableDownload) => {
        setDisabledEditControls(true);
        if (enableDownload) {
            //DE.getController('Settings').setMode({isDisconnected: true, enableDownload: enableDownload});
        } else {
            setDisabledSettings(true);
        }
    };

    const onCoAuthoringDisconnect = (enableDownload) => {
        deactivateEditControls(enableDownload);
        setCanUndo(false);
        setCanRedo(false);
        f7.popover.close();
        f7.sheet.close();
        f7.popup.close();
    };

    const [disabledControls, setDisabledControls] = useState(true);
    const activateControls = () => {
        setDisabledControls(false);
    };

    return (
        <ToolbarView openOptions={props.openOptions}
                     isEdit={appOptions.isEdit}
                     docTitle={docTitle}
                     isShowBack={isShowBack}
                     onBack={onBack}
                     isCanUndo={isCanUndo}
                     isCanRedo={isCanRedo}
                     onUndo={onUndo}
                     onRedo={onRedo}
                     isObjectLocked={isObjectLocked}
                     stateDisplayMode={stateDisplayMode}
                     disabledControls={disabledControls}
                     disabledEditControls={disabledEditControls}
                     disabledSettings={disabledSettings}
                     displayCollaboration={displayCollaboration}
                     readerMode={readerMode}
        />
    )
});

export {ToolbarController as Toolbar};