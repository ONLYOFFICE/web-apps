/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

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
