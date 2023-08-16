import React, { createContext } from 'react';
import { Device } from '../../../../../common/mobile/utils/device';
import SettingsView from '../../view/settings/Settings';
import { f7 } from 'framework7-react';

export const SettingsContext = createContext();

const SettingsController = () => {
    const closeModal = () => {
        if (Device.phone) {
            f7.sheet.close('.settings-popup', false);
        } else {
            f7.popover.close('#settings-popover', false);
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
        // let url = '{{HELP_URL}}';
        let url = __HELP_URL__;
        // let url = 'https://helpcenter.onlyoffice.com';

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
        window.open(url, "_blank");
    };

    const showFeedback = () => {
        let config = props.storeAppOptions.config;

        closeModal();
        if(config && !!config.feedback && !!config.feedback.url) {
            window.open(config.feedback.url, "_blank");
        } else window.open(__SUPPORT_URL__, "_blank");
    };

    const onDownloadOrigin = () => {
        closeModal();
        setTimeout(() => {
            Common.EditorApi.get().asc_DownloadOrigin();
        }, 0);
    };

    return (
        <SettingsContext.Provider value={{
            onPrint,
            showHelp,
            showFeedback,
            onDownloadOrigin,
            closeModal
        }}>
            <SettingsView />
        </SettingsContext.Provider>
    );
};

export default SettingsController;