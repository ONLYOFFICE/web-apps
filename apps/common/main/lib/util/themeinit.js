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

    window.uitheme.DEFAULT_LIGHT_THEME_ID = !window.isIEBrowser ? 'theme-white' : 'theme-classic-light';
    window.uitheme.DEFAULT_DARK_THEME_ID = !window.isIEBrowser ? 'theme-night' : 'theme-dark';

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
            return this.is_system_theme_dark() ? window.uitheme.DEFAULT_DARK_THEME_ID : window.uitheme.DEFAULT_LIGHT_THEME_ID;
        return this.id;
    }

    if ( !window.uitheme.is_system_theme_dark )
        window.uitheme.is_system_theme_dark = function () {
            return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        }

    // localstorage.setItem('ui-theme-id', 'theme-white');
    !window.uitheme.id && window.uitheme.set_id(localstorage.getItem("ui-theme-id"));
    window.uitheme.iscontentdark = localstorage.getItem("content-theme") == 'dark';

    function inject_style_tag(content, id) {
        if ( id && !!document.getElementById(id) )
            return;

        const style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = content;
        if (id) style.id = id;
        document.getElementsByTagName('head')[0].appendChild(style);
    }

    window.uitheme.apply_icons_from_url = function (themeid, url) {
        if ( !url ) return;

        let base_url = !url.endsWith('/') ? url + '/' : url;
        const sp_names = ['small', 'big', 'huge'];
        const sp_scale = {'100':'', '125':'@1.25x','150':'@1.5x','175':'@1.75x','200':'@2x'};
        let icons = [];
        sp_names.forEach(function (n) {
            for (let key in sp_scale) {
                const value = sp_scale[key];
                icons.push('--sprite-button-'+n+'-'+key+':url('+ base_url +'icons' + n + value + '.png)');
            }
        });

        inject_style_tag('.' + themeid + '{' + icons.join(';') + ';}', themeid);

        // workaroud for svg sptites relative path that different from png sprites
        if ( base_url.lastIndexOf('../img/', 0) === 0 )
            base_url = base_url.replace('..','./resources');

        const svg_icons_array = [base_url+'iconssmall@2.5x.svg', base_url + 'iconsbig@2.5x.svg', base_url + 'iconshuge@2.5x.svg'];
        if ( window.Common && window.Common.Utils )
            window.Common.Utils.injectSvgIcons(svg_icons_array, true);
        else {
            window.uitheme.svg_icons = [base_url+'iconssmall@2.5x.svg', base_url + 'iconsbig@2.5x.svg', base_url + 'iconshuge@2.5x.svg'];
        }
    }

    inject_style_tag(':root .theme-dark {' +
                                '--toolbar-header-document: #2a2a2a; --toolbar-header-spreadsheet: #2a2a2a;' +
                                '--toolbar-header-presentation: #2a2a2a; --toolbar-header-pdf: #2a2a2a; --toolbar-header-visio: #2a2a2a;}' +
                            ':root .theme-contrast-dark {' +
                                '--toolbar-header-document: #1e1e1e; --toolbar-header-spreadsheet: #1e1e1e;' +
                                '--toolbar-header-presentation: #1e1e1e; --toolbar-header-pdf: #1e1e1e; --toolbar-header-visio: #1e1e1e;}');

    let objtheme = window.uitheme.colors ? window.uitheme : localstorage.getItem("ui-theme");
    const header_tokens = ['toolbar-header-document', 'toolbar-header-spreadsheet', 'toolbar-header-presentation', 'toolbar-header-pdf', 'toolbar-header-visio'];
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
                    header_tokens.forEach(function (i) {
                            !!objtheme.colors[i] && document.documentElement.style.setProperty('--' + i, objtheme.colors[i]);
                        });

                    let colors = [];
                    for (let c in objtheme.colors) {
                        colors.push('--' + c + ':' + objtheme.colors[c]);
                    }

                    inject_style_tag('.' + objtheme.id + '{' + colors.join(';') + ';}');
                }

                if ( objtheme.icons && !(window.uitheme.embedicons === true) ) {
                    window.uitheme.apply_icons_from_url(objtheme.id, objtheme.icons.basepath);
                }

                if ( objtheme.skeleton ) {
                    if ( objtheme.skeleton.css )
                        inject_style_tag(objtheme.skeleton.css);

                    if ( objtheme.skeleton.html ) {
                        window.skhtml = objtheme.skeleton.html;
                    }
                }
            }
        }
    } else {
        if ( window.uitheme.id && window.uitheme.id.lastIndexOf("theme-gray", 0) === 0 ) {
            header_tokens.forEach(function (i) {
                !!document.documentElement.style.setProperty('--' + i, "#f7f7f7");
            });
        } else if ( window.uitheme.id && window.uitheme.id.lastIndexOf("theme-white", 0) === 0 ) {
            header_tokens.forEach(function (i) {
                !!document.documentElement.style.setProperty('--' + i, "#ffffff");
            });
        }
    }
}();
