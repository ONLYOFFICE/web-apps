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

/**
 *  SearchBar.js
 *
 *  Created on 27.04.2022
 *
 */

+function () {
    !window.common && (window.common = {});
    !common.controller && (common.controller = {});

    common.controller.SearchBar = new(function() {
        var $searchBar,
            $searchInput,
            appConfig,
            api,
            _state = {
                searchText: ''
            },
            _lastInputChange,
            _searchTimer;

        var setApi = function (appApi) {
            api = appApi;
            if (api) {
                api.asc_registerCallback('asc_onSetSearchCurrent', onApiUpdateSearchCurrent);
            }
        };

        var create = function () {
            $searchBar = common.view.SearchBar.create();
            if (appConfig.toolbarDocked === 'bottom') {
                $searchBar.css({'right': '45px', 'bottom': '31px'});
            } else {
                $searchBar.css({'right': '45px', 'top': '31px'});
            }

            $searchInput = $searchBar.find('#search-bar-text');
            $searchInput.on('input', function(e){
                common.view.SearchBar.disableNavButtons();
                onInputSearchChange($searchInput.val());
            }).on('keydown', function (e) {
                onSearchNext('keydown', $searchInput.val(), e);
            });
            $searchBar.find('#search-bar-back').on('click', function(e){
                onSearchNext('back', $searchInput.val());
            });
            $searchBar.find('#search-bar-next').on('click', function(e){
                onSearchNext('next', $searchInput.val());
            });
            $searchBar.find('#search-bar-close').on('click', function(e){
                $searchBar.hide();
            });

            common.view.SearchBar.disableNavButtons();
        };

        var onShow = function () {
            if ( !$searchBar ) {
                create();
            }
            if (!$searchBar.is(':visible')) {
                var text = (api && api.asc_GetSelectedText()) || _state.searchText;
                $searchInput.val(text);
                (text.length > 0) && onInputSearchChange(text);

                $searchBar.show();
                setTimeout(function () {
                    $searchInput.focus();
                    $searchInput.select();
                }, 10);
            }
        };

        var onInputSearchChange = function (text) {
            if ((text && _state.searchText !== text) || (!text && _state.newSearchText)) {
                _state.newSearchText = text;
                _lastInputChange = (new Date());
                if (_searchTimer === undefined) {
                    _searchTimer = setInterval(function() {
                        if ((new Date()) - _lastInputChange < 400) return;

                        _state.searchText = _state.newSearchText;
                        if (_state.newSearchText !== '') {
                            onQuerySearch();
                        } else {
                            api.asc_endFindText();
                            common.view.SearchBar.updateResultsNumber();
                        }
                        clearInterval(_searchTimer);
                        _searchTimer = undefined;
                    }, 10);
                }
            }
        };

        var onQuerySearch = function (d, w) {
            var searchSettings = new AscCommon.CSearchSettings();
            searchSettings.put_Text(_state.searchText);
            searchSettings.put_MatchCase(false);
            searchSettings.put_WholeWords(false);
            if (!api.asc_findText(searchSettings, d != 'back')) {
                common.view.SearchBar.disableNavButtons();
                common.view.SearchBar.updateResultsNumber();
                return false;
            }
            return true;
        };

        var onSearchNext = function (type, text, e) {
            if (text && text.length > 0 && (type === 'keydown' && e.keyCode === 13 || type !== 'keydown')) {
                _state.searchText = text;
                if (onQuerySearch(type) && _searchTimer) {
                    clearInterval(_searchTimer);
                    _searchTimer = undefined;
                }
            }
        };

        var onApiUpdateSearchCurrent = function (current, all) {
            common.view.SearchBar.disableNavButtons(current, all);
            common.view.SearchBar.updateResultsNumber(current, all);
        };

        return {
            init: function(config) { appConfig = config; },
            setApi: setApi,
            show: onShow
        };
    });
}();