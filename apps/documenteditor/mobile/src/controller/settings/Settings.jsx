import React, {useEffect} from 'react';
import { useTranslation } from 'react-i18next';
import {f7} from 'framework7-react';
import { observer, inject } from "mobx-react";
import {Device} from '../../../../../common/mobile/utils/device';

import SettingsView from "../../view/settings/Settings";
import {LocalStorage} from "../../../../../common/mobile/utils/LocalStorage.mjs";

const Settings = props => {
    useEffect(() => {
        if ( Device.phone ) {
            f7.popup.open('.settings-popup');
        } else {
            f7.popover.open('#settings-popover', '#btn-settings');
        }

        return () => {
            // component will unmount
        }
    });

    const closeModal = () => {
        if (Device.phone) {
            f7.sheet.close('.settings-popup');
        } else {
            f7.popover.close('#settings-popover');
        }
    };

    const onPrint = () => {
        const api = Common.EditorApi.get();

        closeModal();
        setTimeout(() => {
            api.asc_Print();
        }, 400);
    };

    const showHelp = () => {
        let url = __HELP_URL__;

        if (url.charAt(url.length-1) !== '/') {
            url += '/';
        }

        if (Device.sailfish || Device.android) {
            url+='mobile-applications/documents/mobile-web-editors/android/index.aspx';
        }
        else {
            url+='mobile-applications/documents/mobile-web-editors/ios/index.aspx';
        }

        closeModal();
        setTimeout(() => {
            window.open(url, "_blank");
        }, 400);
    };

    const showFeedback = () => {
        let config = props.storeAppOptions.config;

        closeModal();
        setTimeout(() => {
            if(config && !!config.feedback && !!config.feedback.url) {
                window.open(config.feedback.url, "_blank");
            } else window.open(__SUPPORT_URL__, "_blank");
        }, 400);
    }

    const onOrthographyCheck = () => {
        closeModal();
        setTimeout(() => {
            Common.EditorApi.get().asc_pluginRun("asc.{B631E142-E40B-4B4C-90B9-2D00222A286E}", 0);
        }, 400);
    };

    const onDownloadOrigin = () => {
        closeModal();
        setTimeout(() => {
            Common.EditorApi.get().asc_DownloadOrigin();
        }, 0);
    };

    const onChangeMobileView = () => {
        const api = Common.EditorApi.get();
        const appOptions = props.storeAppOptions;
        const isMobileView = appOptions.isMobileView;

        LocalStorage.setBool('mobile-view', !isMobileView);
        appOptions.changeMobileView();
        api.ChangeReaderMode();
    };

    return <SettingsView usePopover={!Device.phone}
                         openOptions={props.openOptions}
                         closeOptions={props.closeOptions}
                         // onclosed={props.onclosed}
                         onPrint={onPrint}
                         showHelp={showHelp}
                         showFeedback={showFeedback}
                         onOrthographyCheck={onOrthographyCheck}
                         onDownloadOrigin={onDownloadOrigin}
                         onChangeMobileView={onChangeMobileView}
    />
};

export default inject("storeAppOptions")(observer(Settings));