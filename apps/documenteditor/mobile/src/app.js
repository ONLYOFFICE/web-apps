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

// Import React and ReactDOM
import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';

// Import Framework7
import Framework7 from 'framework7/lite-bundle';
import { Dom7 } from 'framework7/lite-bundle';
window.$$ = Dom7;

// Import Framework7-React Plugin
import Framework7React from 'framework7-react';

import jQuery from 'jquery';
window.jQuery = jQuery;
window.$ = jQuery;

// Import Framework7 Styles

// Import Icons and App Custom Styles
// import '../css/icons.css';
import '../../../common/mobile/resources/less/icons-preload.less';
import('./less/app.less');

// Import App Component

import { I18nextProvider } from 'react-i18next';
import i18n from './lib/i18n.js';
import App from './view/app.jsx';

import { Provider } from 'mobx-react';
import { stores } from './store/mainStore.js';
// import { LocalStorage } from '../../../common/mobile/utils/LocalStorage';

const container = document.getElementById('app');

const startApp = () => {
    const root = createRoot(container);
    // Init F7 React Plugin
    Framework7.use(Framework7React);

// Mount React App
    root.render(
        <I18nextProvider i18n={i18n}>
            <Provider {...stores}>
                {/*<Suspense fallback="loading...">*/}
                <App />
                {/*</Suspense>*/}
            </Provider>
        </I18nextProvider>
    );
};

const params = getUrlParams(),
      isForm = params["isForm"];
if (isForm===undefined && listenApiMsg) {
    listenApiMsg(function (isform) {
        window.isPDFForm = !!isform;
        startApp();
    });
} else {
    window.isPDFForm = isForm==='true';
    startApp();
}
