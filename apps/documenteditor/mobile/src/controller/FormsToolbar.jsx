import React, { useEffect, useState } from 'react';
import { inject, observer } from 'mobx-react';
import { f7 } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import FormsToolbarView from "../view/FormsToolbar";

const FormsToolbarController = inject('storeAppOptions', 'users', 'storeToolbarSettings')(observer(props => {
    const { t } = useTranslation();
    const _t = t("Toolbar", { returnObjects: true });
    const appOptions = props.storeAppOptions;
    const isDisconnected = props.users.isDisconnected;
    const storeToolbarSettings = props.storeToolbarSettings;
    const isCanUndo = storeToolbarSettings.isCanUndo;
    const isCanRedo = storeToolbarSettings.isCanRedo;
    const disabledControls = storeToolbarSettings.disabledControls;
    const disabledSettings = storeToolbarSettings.disabledSettings;

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

    // Back button
    const [isShowBack, setShowBack] = useState(appOptions.canBackToFolder);
    const loadConfig = (data) => {
        if(data && data.config && data.config.canBackToFolder !== false &&
            data.config.customization && data.config.customization.goback &&
            (data.config.customization.goback.url || data.config.customization.goback.requestClose && data.config.canRequestClose)) {
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

            if(!current && appOptions.customization.goback.blank !== false) {
                window.open(href, "_blank");
            } else {
                parent.location.href = href;
            }
        }
    }

    const onUndo = () => {
        const api = Common.EditorApi.get();

        if(api) {
            api.Undo();
        }
    };

    const onRedo = () => {
        const api = Common.EditorApi.get();

        if(api) {
            api.Redo();
        }
    }

    const deactivateEditControls = (enableDownload) => {
        storeToolbarSettings.setDisabledEditControls(true);

        if(!enableDownload) {
            storeToolbarSettings.setDisabledSettings(true);
        }
    };

    const activateControls = () => {
        storeToolbarSettings.setDisabledControls(false);
    };

    return (
        <FormsToolbarView 
            openOptions={props.openOptions}
            closeOptions={props.closeOptions}
            isEdit={appOptions.isEdit}
            isShowBack={isShowBack}
            isCanUndo={isCanUndo}
            isCanRedo={isCanRedo}
            onUndo={onUndo}
            onRedo={onRedo}
            disabledControls={disabledControls}
            disabledSettings={disabledSettings}
            isDisconnected={isDisconnected}
            isOpenModal={props.isOpenModal}
        />
    )
}));

export default FormsToolbarController;