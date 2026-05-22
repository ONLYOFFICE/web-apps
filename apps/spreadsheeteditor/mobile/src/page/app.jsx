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

import React from 'react';

import {App,Views,View,Navbar,NavLeft,NavRight,Link} from 'framework7-react';
import { f7ready } from 'framework7-react';

import '../../../../common/Gateway.js';

import routes from '../router/routes.js';

import '../../../../common/main/lib/util/utils.js';
import '../../../../common/main/lib/util/LanguageInfo.js';
import {LocalStorage} from '../../../../common/mobile/utils/LocalStorage.mjs';
import Notifications from '../../../../common/mobile/utils/notifications.js';
import {MainController} from '../controller/Main';
import {Device} from '../../../../common/mobile/utils/device';
import CellEditor from '../controller/CellEditor';

const f7params = {
    name: 'Spreadsheet Editor', // App name
    theme: 'auto', // Automatic theme detection

    routes: routes, // App routes
};

export default class extends React.Component {
    constructor() {
        super();
       
        Common.Notifications = new Notifications();
        Common.localStorage = LocalStorage;
    }

    render() {
        return (
            <App { ...f7params } className={'app-layout'}>
                {/* Your main view, should have "view-main" class */}
                <View main className="safe-areas" url="/" />
                <MainController />
            </App>
        )
    }

    componentDidMount() {
        f7ready(f7 => {
            Device.initDom();
        });

        // clean duplicate of app's root element
        const app = $$('#app');
        if ( app.length ) {
            for (let a of app)
                if (!a.children.length)
                    a.remove();
        }
    }
}
