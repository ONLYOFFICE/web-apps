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

+function init_themes() {
    let localstorage;
    const local_storage_available = +function () {
        try {
            return !!(localstorage = window.localStorage);
        } catch (e) {
            console.warn('localStorage is unavailable');
            localstorage = {
                getItem: function (key) {return null;},
            };
            return false;
        }
    }();

    !window.uitheme && (window.uitheme = {});

    window.uitheme.set_id = function (id) {
        if ( id == 'theme-system' )
            this.adapt_to_system_theme();
        else this.id = id;
    }

    window.uitheme.is_theme_system = function () {
        return this.id == 'theme-system';
    }

    window.uitheme.adapt_to_system_theme = function () {
        this.id = 'theme-system';
        this.type = this.is_system_theme_dark() ? 'dark' : 'light';
    }

    window.uitheme.relevant_theme_id = function () {
        if ( this.is_theme_system() )
            return this.is_system_theme_dark() ? 'theme-dark' : 'theme-classic-light';
        return this.id;
    }

    if ( !window.uitheme.is_system_theme_dark )
        window.uitheme.is_system_theme_dark = function () {
            return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        }

    !window.uitheme.id && window.uitheme.set_id(localstorage.getItem("ui-theme-id"));
    window.uitheme.iscontentdark = localstorage.getItem("content-theme") == 'dark';

    let objtheme = window.uitheme.colors ? window.uitheme : localstorage.getItem("ui-theme");
    if ( !!objtheme ) {
        if ( typeof(objtheme) == 'string' && objtheme.lastIndexOf("{", 0) === 0 &&
                objtheme.indexOf("}", objtheme.length - 1) !== -1 )
        {
            objtheme = JSON.parse(objtheme);
        }

        if ( objtheme ) {
            if ( window.uitheme.id && window.uitheme.id != objtheme.id ) {
                local_storage_available && localstorage.removeItem("ui-theme");
                !window.uitheme.type && /-dark/.test(window.uitheme.id) && (window.uitheme.type = 'dark');
            } else {
                window.uitheme.cache = objtheme;
                if ( !window.uitheme.type && objtheme.type ) {
                    window.uitheme.type = objtheme.type;
                }

                if ( objtheme.colors ) {
                    ['toolbar-header-document', 'toolbar-header-spreadsheet', 'toolbar-header-presentation', 'toolbar-header-pdf']
                        .forEach(function (i) {
                            !!objtheme.colors[i] && document.documentElement.style.setProperty('--' + i, objtheme.colors[i]);
                        });

                    let colors = [];
                    for (let c in objtheme.colors) {
                        colors.push('--' + c + ':' + objtheme.colors[c]);
                    }

                    var style = document.createElement('style');
                    style.type = 'text/css';
                    style.innerHTML = '.' + objtheme.id + '{' + colors.join(';') + ';}';
                    document.getElementsByTagName('head')[0].appendChild(style);
                }
            }
        }
    }
}();
