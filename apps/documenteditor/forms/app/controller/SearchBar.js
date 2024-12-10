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