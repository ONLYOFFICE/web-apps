import React, {useEffect} from 'react';
import { useTranslation } from 'react-i18next';
import {f7} from 'framework7-react';
import { observer, inject } from "mobx-react";
import {Device} from '../../../../../common/mobile/utils/device';

import SettingsView from "../../view/settings/Settings";

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

    const onReaderMode = () => {
        const appOptions = props.storeAppOptions;
        appOptions.changeReaderMode();

        Common.EditorApi.get().ChangeReaderMode();

        if (Device.phone) {
            setTimeout(() => {
                closeModal();
            }, 1);
        }
    };

    const onPrint = () => {
        closeModal();
        setTimeout(() => {
            Common.EditorApi.get().asc_Print();
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

    return <SettingsView usePopover={!Device.phone}
                         openOptions={props.openOptions}
                         onclosed={props.onclosed}
                         onReaderMode={onReaderMode}
                         onPrint={onPrint}
                         showHelp={showHelp}
                         onOrthographyCheck={onOrthographyCheck}
                         onDownloadOrigin={onDownloadOrigin}
    />
};

export default inject("storeAppOptions")(observer(Settings));