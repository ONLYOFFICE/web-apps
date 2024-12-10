/*
 * (c) Copyright Ascensio System SIA 2010-2024
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation. In accordance with
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at 20A-6 Ernesta Birznieka-Upish
 * street, Riga, Latvia, EU, LV-1050.
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product
 * logo when distributing the program. Pursuant to Section 7(e) we decline to
 * grant you any rights under trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
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
