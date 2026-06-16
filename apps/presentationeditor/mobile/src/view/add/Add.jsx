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
import { View, Popup, Popover, f7 } from 'framework7-react';
import { Device } from '../../../../../common/mobile/utils/device';
import { AddImageController } from "../../controller/add/AddImage";
import { PageImageLinkSettings } from "./AddImage";
import { PageAddTable } from "./AddOther";
import { AddLinkController } from "../../controller/add/AddLink";
import { PageTypeLink, PageLinkTo } from "./AddLink";
import { EditLinkController } from '../../controller/edit/EditLink';
import { ObservablePageEditTypeLink, ObservablePageEditLinkTo } from '../../view/edit/EditLink';
import AddingPage from './AddingPage';
import { MainContext } from '../../page/main';

const routes = [
    {
        path: '/adding-page/',
        component: AddingPage,
    },
    // Image
    {
        path: '/add-image-from-url/',
        component: PageImageLinkSettings
    },

    // Other
    {
        path: '/add-table/',
        component: PageAddTable
    },
    {
        path: '/add-link/',
        component: AddLinkController
    },
    {
        path: '/add-link-type/',
        component: PageTypeLink
    },
    {
        path: '/add-link-to/',
        component: PageLinkTo
    },
    {
        path: '/edit-link/',
        component: EditLinkController
    },
    {
        path: '/edit-link-type/',
        component: ObservablePageEditTypeLink
    },
    {
        path: '/edit-link-to/',
        component: ObservablePageEditLinkTo
    },

    // Image 

    {
        path: '/add-image/',
        component: AddImageController
    }
];

routes.forEach(route => {
    route.options = {
        ...route.options,
        transition: 'f7-push'
    };
});

const AddView = () => {
    const mainContext = useContext(MainContext);

    useEffect(() => {
        if(Device.phone) {
            f7.popup.open('.add-popup');
        } else {
            f7.popover.open('#add-popover', '#btn-add');
        }
    }, []);

    return (
        !Device.phone ?
            <Popover id="add-popover" className="popover__titled" closeByOutsideClick={false} onPopoverClosed={() => mainContext.closeOptions('add')}>
                <View routes={routes} url='/adding-page/' style={{ height: '410px' }}>
                    <AddingPage />
                </View>
            </Popover> :
            <Popup className="add-popup" onPopupClosed={() => mainContext.closeOptions('add')}>
                <View routes={routes} url='/adding-page/'>
                    <AddingPage />
                </View>
            </Popup>
    )
}

export default AddView;
