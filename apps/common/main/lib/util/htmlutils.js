/*
 * (c) Copyright Ascensio System SIA 2010-2023
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
var checkLocalStorage = (function () {
    try {
        var storage = window['localStorage'];
        return true;
    }
    catch(e) {
        return false;
    }
})();

if ( checkLocalStorage && localStorage.getItem("ui-rtl") === '1' ) {
    document.body.setAttribute('dir', 'rtl');
    document.body.classList.add('rtl');
}

function checkScaling() {
    var matches = {
        'pixel-ratio__1_25': "screen and (-webkit-min-device-pixel-ratio: 1.25) and (-webkit-max-device-pixel-ratio: 1.49), " +
                                "screen and (min-resolution: 1.25dppx) and (max-resolution: 1.49dppx)",
        'pixel-ratio__1_5': "screen and (-webkit-min-device-pixel-ratio: 1.5) and (-webkit-max-device-pixel-ratio: 1.74), " +
                                "screen and (min-resolution: 1.5dppx) and (max-resolution: 1.74dppx)",
        'pixel-ratio__1_75': "screen and (-webkit-min-device-pixel-ratio: 1.75) and (-webkit-max-device-pixel-ratio: 1.99), " +
                                "screen and (min-resolution: 1.75dppx) and (max-resolution: 1.99dppx)",
    };

    for (var c in matches) {
        if ( window.matchMedia(matches[c]).matches ) {
            document.body.classList.add(c);
            break;
        }
    }

    if ( !window.matchMedia("screen and (-webkit-device-pixel-ratio: 1.5)," +
                            "screen and (-webkit-device-pixel-ratio: 1)," +
                            "screen and (-webkit-device-pixel-ratio: 2)").matches )
    {
        // don't add zoom for mobile devices
        // if (!(/android|avantgo|playbook|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od|ad)|iris|kindle|lge |maemo|midp|mmp|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent || navigator.vendor || window.opera)))
        //     document.getElementsByTagName('html')[0].setAttribute('style', 'zoom: ' + (1 / window.devicePixelRatio) + ';');
    }
}

checkScaling();

var params = (function() {
    var e,
        a = /\+/g,  // Regex for replacing addition symbol with a space
        r = /([^&=]+)=?([^&]*)/g,
        d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
        q = window.location.search.substring(1),
        urlParams = {};

    while (e = r.exec(q))
        urlParams[d(e[1])] = d(e[2]);

    return urlParams;
})();

if ( window.desktop ) {
    var theme = desktop.theme

    if ( theme ) {
        if ( !theme.id && !!theme.type ) {
            if ( theme.type == 'dark' ) theme.id = 'theme-dark'; else
            if ( theme.type == 'light' ) theme.id = 'theme-classic-light';
        }

        if ( theme.id ) {
            if ( theme.id == 'theme-system' ) {
                localStorage.setItem("ui-theme-use-system", "1");
                localStorage.removeItem("ui-theme-id");
                delete params.uitheme;
            } else {
                localStorage.setItem("ui-theme-id", theme.id);
                localStorage.removeItem("ui-theme-use-system");
            }

            localStorage.removeItem("ui-theme");
        }
    }
}

if ( !!params.uitheme && checkLocalStorage && !localStorage.getItem("ui-theme-id") ) {
    // const _t = params.uitheme.match(/([\w-]+)/g);

    if ( params.uitheme == 'default-dark' )
        params.uitheme = 'theme-dark';
    else
    if ( params.uitheme == 'default-light' )
        params.uitheme = 'theme-classic-light';

    localStorage.removeItem("ui-theme");
}

var ui_theme_name = checkLocalStorage && localStorage.getItem("ui-theme-id") ? localStorage.getItem("ui-theme-id") : params.uitheme;
var ui_theme_type;
if ( !ui_theme_name ) {
    if ( (window.desktop && desktop.theme && desktop.theme.system == 'dark') ||
            (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) )
    {
        ui_theme_name = 'theme-dark';
        ui_theme_type = 'dark';
        checkLocalStorage && localStorage.removeItem("ui-theme");
    }
}
if ( !!ui_theme_name ) {
    document.body.classList.add(ui_theme_name);
}

if ( checkLocalStorage ) {
    let current_theme = localStorage.getItem("ui-theme");
    if ( !!current_theme && /type":\s*"dark/.test(current_theme) || ui_theme_type == 'dark' ) {
        document.body.classList.add("theme-type-dark");

        let content_theme = localStorage.getItem("content-theme");
        if ( content_theme == 'dark' ) {
            document.body.classList.add("content-theme-dark");
        }
    }
}