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
 *  Created on 3.06.2022
 *
 */

define([
    'core',
    'common/main/lib/view/SearchBar'
], function () {
    'use strict';

    DE.Controllers.SearchBar = Backbone.Controller.extend(_.extend({
        initialize: function() {
        },

        events: function() {
        },

        onLaunch: function() {
            this._state = {
                searchText: ''
            };
            Common.NotificationCenter.on('search:show', _.bind(this.onSearchShow, this));
        },

        setApi: function (api) {
            this.api = api;
            if (this.api) {
                this.api.asc_registerCallback('asc_onSetSearchCurrent', _.bind(this.onApiUpdateSearchCurrent, this));
            }
            return this;
        },

        onSearchShow: function () {
            if (!this.searchBar) {
                this.searchBar = new Common.UI.SearchBar({
                    showOpenPanel: false,
                    width: 303,
                    iconType: 'svg',
                });
                this.searchBar.on({
                    'search:back': _.bind(this.onSearchNext, this, 'back'),
                    'search:next': _.bind(this.onSearchNext, this, 'next'),
                    'search:input': _.bind(this.onInputSearchChange, this),
                    'search:keydown': _.bind(this.onSearchNext, this, 'keydown'),
                    'show': _.bind(this.onSelectSearchingResults, this, true),
                    'hide': _.bind(this.onSelectSearchingResults, this, false)
                });
            }
            if (!this.searchBar.isVisible()) {
                this.searchBar.show(this.api.asc_GetSelectedText() || this._state.searchText);
            }
        },

        onSelectSearchingResults: function (val) {
            if (this._state.isHighlightedResults !== val) {
                this.api.asc_selectSearchingResults(val);
                this._state.isHighlightedResults = val;
            }
        },

        onApiUpdateSearchCurrent: function (current, all) {
            if (this.searchBar) {
                this.searchBar.disableNavButtons(current, all);
                this.searchBar.updateResultsNumber(current, all);
            }
        },

        onSearchNext: function (type, arg) {
            var text = arg[0],
                event = arg[1];
            if (text && text.length > 0 && (type === 'keydown' && event.keyCode === 13 || type !== 'keydown')) {
                this._state.searchText = text;
                if (this.onQuerySearch(type) && this._searchTimer) {
                    if (this._searchTimer) {
                        clearInterval(this._searchTimer);
                        this._searchTimer = undefined;
                    }
                }
            }
        },

        onQuerySearch: function (d, w) {
            var searchSettings = new AscCommon.CSearchSettings();
            searchSettings.put_Text(this._state.searchText);
            searchSettings.put_MatchCase(false);
            searchSettings.put_WholeWords(false);
            if (!this.api.asc_findText(searchSettings, d != 'back')) {
                this.searchBar.disableNavButtons();
                this.searchBar.updateResultsNumber();
                return false;
            }
            return true;
        },

        onInputSearchChange: function (text) {
            var text = text[0];
            if ((text && this._state.searchText !== text) || (!text && this._state.newSearchText)) {
                this._state.newSearchText = text;
                this._lastInputChange = (new Date());
                if (this._searchTimer === undefined) {
                    var me = this;
                    this._searchTimer = setInterval(function() {
                        if ((new Date()) - me._lastInputChange < 400) return;

                        me._state.searchText = me._state.newSearchText;
                        if (me._state.newSearchText !== '') {
                            me.onQuerySearch();
                        } else {
                            me.api.asc_endFindText();
                            me.searchBar.updateResultsNumber();
                        }
                        clearInterval(me._searchTimer);
                        me._searchTimer = undefined;
                    }, 10);
                }
            }
        },

    }, DE.Controllers.SearchBar || {}));
});