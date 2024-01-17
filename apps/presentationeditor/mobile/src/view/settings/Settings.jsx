import React, { useContext, useEffect } from 'react';
import { View, Popup, Popover, f7 } from 'framework7-react';
import { Device } from '../../../../../common/mobile/utils/device';
import ApplicationSettingsController from "../../controller/settings/ApplicationSettings";
import { MacrosSettings, ThemeSettings } from "./ApplicationSettings";
import DownloadController from "../../controller/settings/Download";
import PresentationInfoController from "../../controller/settings/PresentationInfo";
import PresentationSettingsController from "../../controller/settings/PresentationSettings";
import { PresentationColorSchemes } from "./PresentationSettings";
import About from '../../../../../common/mobile/lib/view/About';
import SettingsPage from './SettingsPage';
import { MainContext } from '../../page/main';
import VersionHistoryController from '../../../../../common/mobile/lib/controller/VersionHistory';

const routes = [
    {
        path: '/settings-page/',
        component: SettingsPage,
        keepAlive: true
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
        path: '/theme-settings/',
        component: ThemeSettings
    },
    {
        path: '/download/',
        component: DownloadController
    },
    {
        path: '/presentation-info/',
        component: PresentationInfoController
    },
    {
        path: '/presentation-settings/',
        component: PresentationSettingsController
    },
    {
        path: '/color-schemes/',
        component: PresentationColorSchemes
    },
    {
        path: '/about/',
        component: About
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
                <View style={{ height: '410px' }} routes={routes} url='/settings-page/'>
                    <SettingsPage />
                </View>
            </Popover> :
            <Popup className="settings-popup" onPopupClosed={() => mainContext.closeOptions('settings')}>
                <View routes={routes} url='/settings-page/'>
                    <SettingsPage />
                </View>
            </Popup>
    )
};

export default SettingsView;