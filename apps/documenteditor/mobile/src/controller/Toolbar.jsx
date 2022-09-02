import React, { useEffect, useState } from 'react';
import { inject, observer } from 'mobx-react';
import { f7 } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import ToolbarView from "../view/Toolbar";
import {storeAppOptions} from "../store/appOptions";
import {LocalStorage} from "../../../../common/mobile/utils/LocalStorage";

const ToolbarController = inject('storeAppOptions', 'users', 'storeReview', 'storeFocusObjects', 'storeToolbarSettings','storeDocumentInfo')(observer(props => {
    const {t} = useTranslation();
    const _t = t("Toolbar", { returnObjects: true });
    const appOptions = props.storeAppOptions;
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

    const showEditDocument = !appOptions.isEdit && appOptions.canEdit && appOptions.canRequestEditRights;

    const docInfo = props.storeDocumentInfo;
    const docExt = docInfo.dataDoc ? docInfo.dataDoc.fileType : '';
    const docTitle = docInfo.dataDoc ? docInfo.dataDoc.title : '';

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
    });

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
                            goBack(true);
                        }
                    },
                    {
                        text: _t.stayButtonText,
                        bold: true
                    }
                ]
            }).open();
        } else {
            goBack(true);
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

        appOptions.changeViewerMode();
        api.asc_addRestriction(Asc.c_oAscRestrictionType.View);
    }

    const changeMobileView = () => {
        const api = Common.EditorApi.get();
        const isMobileView = appOptions.isMobileView;

        LocalStorage.setBool('mobile-view', !isMobileView);
        appOptions.changeMobileView();
        api.ChangeReaderMode();
    }

    return (
        <ToolbarView openOptions={props.openOptions}
                     closeOptions={props.closeOptions}
                     isEdit={appOptions.isEdit}
                     docTitle={docTitle}
                     docExt={docExt}
                     isShowBack={isShowBack}
                     onBack={onBack}
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
        />
    )
}));

export {ToolbarController as Toolbar};