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

var checkLocalStorage = (function () {
    try {
        localStorage.setItem('test', 1);   // for WebView checking !!window.localStorage not enough
        localStorage.removeItem('test');
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
    return lang && (/^(ar|he|ur)$/i.test(lang));
}

var ui_rtl = false;
if ( window.nativeprocvars && window.nativeprocvars.rtl !== undefined ) {
    ui_rtl = window.nativeprocvars.rtl;
} else {
    if ( isLangRtl(lang) )
        if ( checkLocalStorage && localStorage.getItem("settings-ui-rtl") !== null )
            ui_rtl = localStorage.getItem("settings-ui-rtl") === '1';
        else ui_rtl = true;
}

if ( ui_rtl && window.isIEBrowser !== true ) {
    document.body.setAttribute('dir', 'rtl');
    document.body.classList.add('rtl');
}
if ( isLangRtl(lang) ) {
    document.body.classList.add('rtl-font');
}
document.body.setAttribute('applang', lang);

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

    if ( window.isIEBrowser !== true ) {
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

let svg_icons = window.uitheme.svg_icons || ['./resources/img/iconssmall@2.5x.svg',
                    './resources/img/iconsbig@2.5x.svg', './resources/img/iconshuge@2.5x.svg'];

window.Common = {
    Utils: {
        injectSvgIcons: function (svg_icons_array, force) {
            if ( window.isIEBrowser === true ) return;

            window.svgiconsrunonce;
            // const el = document.querySelector('div.inlined-svg');
            // if (!el || !el.innerHTML.firstChild) {
            if ( !window.svgiconsrunonce || force === true ) {
                window.svgiconsrunonce = true;
                function htmlToElements(html, id) {
                    var template = document.createElement('template');
                    template.innerHTML = html;
                    // return template.content.childNodes;
                    if ( !!id ) template.content.firstChild.id = id;
                    return template.content.firstChild;
                }

                const sprite_uid = getComputedStyle(document.body).getPropertyValue('--sprite-button-icons-uid');

                !svg_icons_array && (svg_icons_array = svg_icons);
                svg_icons_array.map(function (url) {
                            fetch(url)
                                .then(function (r) {
                                    if (r.ok) return r.text();
                                    else {/* error */}
                                }).then(function (text) {
                                    const type = /icons(\w+)(?:@2\.5x)\.svg$/.exec(url)[1];
                                    let el_id;
                                    if ( type ) {
                                        const el = document.getElementById((el_id = 'idx-sprite-btns-' + type));
                                        if ( el ) {
                                            const idx = el.getAttribute('data-sprite-uid');
                                            if ( idx != sprite_uid )
                                                el.remove()
                                            else return;
                                        };
                                    }

                                    const el = document.querySelector('div.inlined-svg');
                                    const child = htmlToElements(text, el_id);
                                    if ( sprite_uid.length )
                                        child.setAttribute('data-sprite-uid', sprite_uid);
                                    el.appendChild(child);

                                    const i = svg_icons_array.findIndex(function (item) {return item == url});
                                    if ( !(i < 0) ) svg_icons_array.splice(i, 1)
                                }).catch(console.error.bind(console))
                        })
            }
        }
    }
}

!params.skipScaling && checkScaling();

if ( !window.uitheme.id && !!params.uitheme ) {
    if ( params.uitheme == 'default-dark' ) {
        window.uitheme.id = window.uitheme.DEFAULT_DARK_THEME_ID;
        window.uitheme.type = 'dark';
    } else
    if ( params.uitheme == 'default-light' ) {
        window.uitheme.id = window.uitheme.DEFAULT_LIGHT_THEME_ID;
        window.uitheme.type = 'light';
    } else
    if ( params.uitheme == 'theme-system' ) {
        window.uitheme.adapt_to_system_theme();
    } else {
        window.uitheme.id = params.uitheme;
        window.uitheme.type = params.uithemetype;
    }
}

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
