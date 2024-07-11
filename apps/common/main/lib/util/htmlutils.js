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
const isIE = /msie|trident/i.test(navigator.userAgent);

var checkLocalStorage = (function () {
    try {
        var storage = window['localStorage'];
        return true;
    }
    catch(e) {
        return false;
    }
})();

if (!window.lang) {
    window.lang = (/(?:&|^)lang=([^&]+)&?/i).exec(window.location.search.substring(1));
    window.lang = window.lang ? window.lang[1] : '';
}
window.lang && (window.lang = window.lang.split(/[\-\_]/)[0].toLowerCase());

var isLangRtl = function (lang) {
    return lang.lastIndexOf('ar', 0) === 0;
}

var ui_rtl = false;
if ( window.nativeprocvars && window.nativeprocvars.rtl !== undefined ) {
    ui_rtl = window.nativeprocvars.rtl;
} else {
    if ( isLangRtl(lang) )
        if ( checkLocalStorage && localStorage.getItem("ui-rtl") !== null )
            ui_rtl = localStorage.getItem("ui-rtl") === '1';
        else ui_rtl = true;
}

if ( ui_rtl && !isIE ) {
    document.body.setAttribute('dir', 'rtl');
    document.body.classList.add('rtl');
}
if ( isLangRtl(lang) ) {
    document.body.classList.add('rtl-font');
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

    if ( !isIE ) {
        matches = {
            'pixel-ratio__2_5': 'screen and (-webkit-min-device-pixel-ratio: 2.25), screen and (min-resolution: 2.25dppx)',
        };
        for (let c in matches) {
            if ( window.matchMedia(matches[c]).matches ) {
                document.body.classList.add(c);
                Common.Utils.injectSvgIcons();
                break;
            }
        }
    }
}

let svg_icons = ['./resources/img/iconssmall@2.5x.svg',
    './resources/img/iconsbig@2.5x.svg', './resources/img/iconshuge@2.5x.svg'];

window.Common = {
    Utils: {
        injectSvgIcons: function () {
            if ( isIE ) return;

            let runonce;
            // const el = document.querySelector('div.inlined-svg');
            // if (!el || !el.innerHTML.firstChild) {
            if ( !runonce ) {
                runonce = true;
                function htmlToElements(html) {
                    var template = document.createElement('template');
                    template.innerHTML = html;
                    // return template.content.childNodes;
                    return template.content.firstChild;
                }

                svg_icons.map(function (url) {
                            fetch(url)
                                .then(function (r) {
                                    if (r.ok) return r.text();
                                    else {/* error */}
                                }).then(function (text) {
                                    const el = document.querySelector('div.inlined-svg')
                                    el.appendChild(htmlToElements(text));

                                    const i = svg_icons.findIndex(function (item) {return item == url});
                                    if ( !(i < 0) ) svg_icons.splice(i, 1)
                                }).catch(console.error.bind(console))
                        })
            }
        }
    }
}

checkScaling();

if ( !!params.uitheme ) {
    if ( params.uitheme == 'default-dark' ) {
        params.uitheme = 'theme-dark';
        params.uithemetype = 'dark';
    } else
    if ( params.uitheme == 'default-light' ) {
        params.uitheme = 'theme-classic-light';
        params.uithemetype = 'light';
    } else
    if ( params.uitheme == 'theme-system' ) {}
}

!window.uitheme.id && params.uitheme && (window.uitheme.id = params.uitheme);
if ( !window.uitheme.id ) {
    window.uitheme.adapt_to_system_theme();
} else {
    !window.uitheme.type && params.uitheme && (window.uitheme.type = params.uithemetype);
}

document.body.classList.add(window.uitheme.relevant_theme_id());

if ( window.uitheme.type == 'dark' ) {
    document.body.classList.add("theme-type-dark");

    if ( checkLocalStorage && localStorage.getItem("content-theme") == 'dark' ) {
        document.body.classList.add("content-theme-dark");
    } else {
    // document.body.classList.add("theme-type-ligth");
    }
}

if ( !window.is_system_theme_dark )
    delete window.is_system_theme_dark;
