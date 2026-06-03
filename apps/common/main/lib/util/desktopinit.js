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

if ( window.AscDesktopEditor ) {
    window.desktop = window.AscDesktopEditor;
    desktop.features = {};
    window.native_message_cmd = [];

    window.on_native_message = function (cmd, param) {
        if ( /window:features/.test(cmd) ) {
            var obj = JSON.parse(param);
            if ( obj.singlewindow !== undefined ) {
                desktop.features.singlewindow = obj.singlewindow;
            }
        } else
            window.native_message_cmd[cmd] = param;
    }

    if ( !!window.RendererProcessVariable ) {
        const theme = desktop.theme = window.RendererProcessVariable.theme;
        const map_themes = window.RendererProcessVariable.localthemes;

        if ( theme ) {
            window.uitheme = {
                id: theme.id,
                type: theme.type,
            }

            if ( /dark|light/.test(theme.system) ) {
                window.uitheme.is_system_theme_dark = function () {
                    return theme.system == 'dark';
                }
            }

            if ( map_themes && map_themes[theme.id] ) {
                window.uitheme.colors = map_themes[theme.id].colors;
                // window.desktop.themes = map_themes;
            }
        }

        if ( window.RendererProcessVariable.rtl !== undefined ) {
            window.nativeprocvars = {
                rtl: window.RendererProcessVariable.rtl === true || window.RendererProcessVariable.rtl == "yes" || window.RendererProcessVariable.rtl == "true"
            };
        }
    }

    if ( !params || !params['internal'] ) {
        !window.features && (window.features = {});
        window.features.framesize = {width: window.innerWidth, height: window.innerHeight};
        window.desktop.execCommand('webapps:entry', (window.features && JSON.stringify(window.features)) || '');
    }
}
