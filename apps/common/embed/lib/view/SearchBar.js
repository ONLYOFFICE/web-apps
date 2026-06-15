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

!window.common && (window.common = {});
!common.view && (common.view = {});
common.view.SearchBar = new(function() {
    var tpl = '<div class="asc-window search-window" style="display: none;">' +
                    '<div class="body">{body}</div>' +
                '</div>';
    var tplBody = '<div class="search-input-group">' +
                    '<input type="text" id="search-bar-text" placeholder="{textFind}" autocomplete="off">' +
                    '<div id="search-bar-results">0/0</div>' +
                '</div>' +
                '<div class="tools">' +
                    '<button id="search-bar-back" class="svg-icon search-arrow-up"></button>' +
                    '<button id="search-bar-next" class="svg-icon search-arrow-down"></button>' +
                    '<button id="search-bar-close" class="svg-icon search-close"></button>' +
                '</div>';

    return {
        create: function(parent) {
            !parent && (parent = 'body');

            var _$dlg = $(tpl
                .replace(/\{body}/, tplBody)
                .replace(/\{textFind}/, this.textFind))
                    .appendTo(parent)
                    .attr('id', 'dlg-search');

            return _$dlg;
        },

        disableNavButtons: function (resultNumber, allResults) {
            var disable = $('#search-bar-text').val() === '' || !allResults;
            $('#search-bar-back').attr({disabled: disable});
            $('#search-bar-next').attr({disabled: disable});
        },

        updateResultsNumber: function (current, all) {
            var $results = $('#search-bar-results'),
                $input = $('#search-bar-text');
            $results.text(!all || $input.val() === '' ? '0/0' : current + 1 + '/' + all);
        },

        textFind: 'Find'

    };
})();