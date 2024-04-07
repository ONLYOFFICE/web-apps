import React, { useContext, useEffect } from 'react';
import { f7, View, Popup, Popover } from 'framework7-react';
import { Device } from '../../../../../common/mobile/utils/device';
import DocumentSettingsController from "../../controller/settings/DocumentSettings";
import DocumentInfoController from "../../controller/settings/DocumentInfo";
import { DownloadController } from "../../controller/settings/Download";
import ApplicationSettingsController from "../../controller/settings/ApplicationSettings";
import { DocumentFormats, DocumentMargins, DocumentColorSchemes } from "./DocumentSettings";
import { MacrosSettings, ThemeSettings } from "./ApplicationSettings";
import About from '../../../../../common/mobile/lib/view/About';
import NavigationController from '../../controller/settings/Navigation';
import SharingSettings from "../../../../../common/mobile/lib/view/SharingSettings";
import ProtectionDocumentController from '../../controller/settings/DocumentProtection';
import ProtectionController from '../../controller/settings/Protection';
import FileEncryptionController from '../../controller/settings/FileEncryption';
import SettingsPage from './SettingsPage';
import { MainContext } from '../../page/main';
import VersionHistoryController from '../../../../../common/mobile/lib/controller/VersionHistory';

const routes = [
    {
        path: '/settings/',
        component: SettingsPage,
        keepAlive: true,
    },
    {
        path: '/document-settings/',
        component: DocumentSettingsController,
    },
    {
        path: '/margins/',
        component: DocumentMargins,
    },
    {
        path: '/document-formats/',
        component: DocumentFormats,
    },
    {
        path: "/document-info/",
        component: DocumentInfoController,
    },
    {
        path: '/application-settings/',
        component: ApplicationSettingsController
    },
    {
        path: '/macros-settings/',
        component: MacrosSettings
    },
    {
        path: '/download/',
        component: DownloadController
    },
    {
        path: '/color-schemes/',
        component: DocumentColorSchemes
    },
    {
        path: '/about/',
        component: About
    },
    {
        path: '/theme-settings/',
        component: ThemeSettings
    },
    // Navigation
    {
        path: '/navigation',
        component: NavigationController
    },
    // Sharing Settings
    {
        path: '/sharing-settings/',
        component: SharingSettings
    },
    // Protection
    {
        path: '/protection',
        component: ProtectionController
    },
    {
        path: '/protect',
        component: ProtectionDocumentController
    },
    // Encryption
    {
        path: '/encrypt',
        component: FileEncryptionController
    },
    // Version History 
    {
        path: '/version-history',
        component: VersionHistoryController,
        options: {
            props: {
                isNavigate: true
            }
        }
    },
];

routes.forEach(route => {
    route.options = {
        ...route.options,
        transition: 'f7-push'
    };
});

const SettingsView = () => {
    const mainContext = useContext(MainContext);

    useEffect(() => {
        if(Device.phone) {
            f7.popup.open('.settings-popup');
        } else {
            f7.popover.open('#settings-popover', '#btn-settings');
        }
    }, []);

    return (
        !Device.phone ?
            <Popover id="settings-popover" closeByOutsideClick={false} className="popover__titled" onPopoverClosed={() => mainContext.closeOptions('settings')}>
                <View style={{ height: '410px' }} routes={routes} url='/settings/'>
                    <SettingsPage />
                </View>
            </Popover> :
            <Popup className="settings-popup" onPopupClosed={() => mainContext.closeOptions('settings')}>
                <View routes={routes} url='/settings/'>
                    <SettingsPage />
                </View> 
            </Popup>
    )
};

export default SettingsView;
