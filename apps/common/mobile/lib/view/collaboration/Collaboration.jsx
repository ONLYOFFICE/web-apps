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

import React, { useEffect } from 'react';
import { Popover, Sheet, f7, View } from 'framework7-react';
import { Device } from "../../../utils/device";
import { ReviewController, ReviewChangeController } from "../../controller/collaboration/Review";
import { PageDisplayMode } from "./Review";
import { ViewCommentsController, ViewCommentsSheetsController } from "../../controller/collaboration/Comments";
import SharingSettingsController from "../../controller/SharingSettings";
import { CollaborationPage } from '../../pages/CollaborationPage';
import UsersPage from '../../pages/UsersPage';

const routes = [
    {
        path: '/collaboration-page/',
        component: CollaborationPage,
        keepAlive: true
    },
    {
        path: '/users/',
        component: UsersPage
    },
    {
        path: '/review/',
        component: ReviewController
    },
    {
        path: '/cm-review/',
        component: ReviewController,
        options: {
            props: {
                noBack: true
            }
        }
    },
    {
        path: '/display-mode/',
        component: PageDisplayMode
    },
    {
        path: '/review-change/',
        component: ReviewChangeController
    },
    {
        path: '/cm-review-change/',
        component: ReviewChangeController,
        options: {
            props: {
                noBack: true
            }
        }
    },
    {
        path: '/comments/',
        asyncComponent: () => window.editorType == 'sse' ? ViewCommentsSheetsController : ViewCommentsController,
        options: {
            props: {
                allComments: true
            }
        }
    },
    {
        path: '/sharing-settings/',
        component: SharingSettingsController
    }
];

routes.forEach(route => {
    route.options = {
        ...route.options,
        transition: 'f7-push'
    };
});

const CollaborationView = props => {
    useEffect(() => {
        if(Device.phone) {
            f7.sheet.open('.coauth__sheet');
        } else {
            f7.popover.open('#coauth-popover', '#btn-coauth');
        }
    }, []);

    const initUrl = props.showOptions ? `/${props.showOptions}/` : '/collaboration-page/';

    return (
        !Device.phone ?
            <Popover id="coauth-popover" className="popover__titled" onPopoverClosed={() => props.closeOptions('coauth')} closeByOutsideClick={false}>
                <View style={{height: '430px'}} routes={routes} url={initUrl}>
                    <CollaborationPage />
                </View>
            </Popover> :
            <Sheet className="coauth__sheet" onSheetClosed={() => props.closeOptions('coauth')}>
                <View routes={routes} url={initUrl}>
                    <CollaborationPage />
                </View>
            </Sheet>
    )
}

export default CollaborationView;
