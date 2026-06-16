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

const load_stylesheet = reflink => {
    let link = document.createElement( "link" );
    link.href = reflink;
    // link.type = "text/css";
    link.rel = "stylesheet";

    document.getElementsByTagName("head")[0].appendChild(link);
};

if(!!window.Android && window.Android.editorConfig) {
    window.native = {editorConfig: window.Android.editorConfig()}
}

function isLocalStorageAvailable() {
    try {
        const testKey = 'test';
        localStorage.setItem(testKey, '1');
        localStorage.removeItem(testKey);

        return true;
    } catch (e) {
        return false;
    }
}

{
    let lang = (/(?:&|^)lang=([^&]+)&?/i).exec(window.location.search.substring(1));
    lang = ((lang && lang[1]) || window.Common.Locale.defaultLang).split(/[\-\_]/)[0];
    Common.Locale.currentLang = lang;
    Common.Locale.isCurrentLangRtl = lang && (/^(ar|he|ur)$/i.test(lang));
}

{
    if (Common.Locale.isCurrentLangRtl) {
        load_stylesheet('./css/framework7-rtl.css');
        document.body.classList.add('rtl');
    } else {
        load_stylesheet('./css/framework7.css')
    }
}

function getUrlParam(param) {
    const url = new URL(window.location.href);
    return url.searchParams.get(param);
}

const uithemeParam = getUrlParam('uitheme');

const supportedThemes = {
    'theme-light': 'light',
    'theme-dark': 'dark',
    'default-light': 'light',
    'default-dark': 'dark'
};

let obj;
isLocalStorageAvailable() && (obj = JSON.parse(localStorage.getItem("mobile-ui-theme-client")));

if (!obj) {
    if (uithemeParam && supportedThemes[uithemeParam]) {
        obj = {
            id: uithemeParam,
            type: supportedThemes[uithemeParam]
        };
    } else {
        let theme_type = window.native?.editorConfig?.theme?.type;
        if (!theme_type && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) theme_type = 'dark';

        const id = theme_type === 'dark' ? 'theme-dark' : 'theme-light';
        obj = {
            id,
            type: supportedThemes[id]
        }
    }
}

window.mobileUiTheme = obj;
document.body.classList.add(`theme-type-${obj.type}`, `${window.asceditor}-editor`);
