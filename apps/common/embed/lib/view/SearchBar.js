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
            $input.css('padding-right', $results.outerWidth() + 'px');
        },

        textFind: 'Find'

    };
})();