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
if (Common === undefined) {
    var Common = {};
}

Common.Locale = new(function() {
    "use strict";
    var l10n = null;
    var loadcallback,
        apply = false,
        defLang = '{{DEFAULT_LANG}}',
        currentLang = defLang,
        _4letterLangs = ['pt-pt', 'zh-tw'];

    var _applyLocalization = function(callback) {
        try {
            callback && (loadcallback = callback);
            if (l10n) {
                for (var prop in l10n) {
                    var p = prop.split('.');
                    if (p && p.length > 2) {

                        var obj = window;
                        for (var i = 0; i < p.length - 1; ++i) {
                            if (obj[p[i]] === undefined) {
                                obj[p[i]] = new Object();
                            }
                            obj = obj[p[i]];
                        }

                        if (obj) {
                            obj[p[p.length - 1]] = l10n[prop];
                        }
                    }
                }
                loadcallback && loadcallback();
            } else
                apply = true;
        }
        catch (e) {
        }
    };

    var _get = function(prop, scope) {
        var res = '';
        if (l10n && scope && scope.name) {
            res = l10n[scope.name + '.' + prop];

            if ( !res && scope.default )
                res = scope.default;
        }

        return res || (scope ? eval(scope.name).prototype[prop] : '');
    };

    var _getCurrentLanguage = function() {
        return currentLang;
    };

    var _getDefaultLanguage = function() {
        return defLang;
    };

    var _getLoadedLanguage = function() {
        return loadedLang;
    };

    var _getUrlParameterByName = function(name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    };

    var _requireLang = function (l) {
        typeof l != 'string' && (l = null);
        var lang = (l || _getUrlParameterByName('lang') || defLang);
        var idx4Letters = _4letterLangs.indexOf(lang.replace('_', '-').toLowerCase()); // try to load 4 letters language
        lang = (idx4Letters<0) ? lang.split(/[\-_]/)[0] : _4letterLangs[idx4Letters];
        currentLang = lang;
        fetch('locale/' + lang + '.json')
            .then(function(response) {
                if (!response.ok) {
                    if (idx4Letters>=0) { // try to load 2-letters language
                        throw new Error('4letters error');
                    }
                    currentLang = defLang;
                    if (lang != defLang)
                        /* load default lang if fetch failed */
                        return fetch('locale/' + defLang + '.json');

                    throw new Error('server error');
                }
                return response.json();
            }).then(function(response) {
                if ( response.json ) {
                    if (!response.ok)
                        throw new Error('server error');

                    return response.json();
                } else {
                    l10n = response;
                    /* to break promises chain */
                    throw new Error('loaded');
                }
            }).then(function(json) {
                l10n = json || {};
                apply && _applyLocalization();
            }).catch(function(e) {
                if ( /4letters/.test(e) ) {
                    return setTimeout(function(){
                        _requireLang(lang.split(/[\-_]/)[0]);
                    }, 0);
                }

                if ( !/loaded/.test(e) && currentLang != defLang && defLang && defLang.length < 3 ) {
                    return setTimeout(function(){
                        _requireLang(defLang)
                    }, 0);
                }

                l10n = l10n || {};
                apply && _applyLocalization();
                if ( e.message == 'loaded' ) {
                } else {
                    currentLang = null;
                    console.log('fetch error: ' + e);
                }
            });
    };

    if ( !window.fetch ) {
        /* use fetch polifill if native method isn't supported */
        var polyfills = ['../vendor/fetch/fetch.umd'];
        if ( !window.Promise ) {
            require(['../vendor/es6-promise/es6-promise.auto.min'],
                function () {
                    require(polyfills, _requireLang);
                });
        } else require(polyfills, _requireLang);
    } else _requireLang();

    const _isCurrentRtl = function () {
        return currentLang && (/^(ar)$/i.test(currentLang));
    };

    return {
        apply: _applyLocalization,
        get: _get,
        getCurrentLanguage: _getCurrentLanguage,
        isCurrentLanguageRtl: _isCurrentRtl,
        getDefaultLanguage: _getDefaultLanguage
    };
    
})();


