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

if ( window.Common === undefined ) {
    window.Common = {};
}

Common.util = Common.util||{};

define(['gateway'], function () {
    Common.util.Print = new (function() {
        
        /**
         * Finds the best matching paper size option by size and name hint.
         *
         * @param {Array<{size: [number, number], caption: string}>} list - List of available paper size options
         * @param {number} width - Page width
         * @param {number} height - Page height
         * @param {string|undefined} currentName - Current size name used as a hint when multiple matches are found
         * @param {Array<{value: [number, number], caption: string}>|undefined} defaultSizes - Default paper sizes used as fallback name hint when currentName is not provided
         * @returns {Object|undefined} The best matching paper size option, or undefined if nothing found
         */
        const _findPaperSizeOptionBySize = function(list, width, height, currentName, defaultSizes) {
            /** Picks the best match by name among candidates */ 
            function findBestByName(candidates, name) {
                /** Splits a string into tokens: separates camelCase, lowercases, splits by spaces/dashes/underscores */
                function tokenize(name) {
                    return name
                        .replace(/([a-z])([A-Z])/g, '$1 $2')  // "AnsiA" → "Ansi A"
                        .toLowerCase()
                        .split(/[\s_\-]+/)
                        .filter(Boolean);
                }

                /** Calculates similarity between two strings as the ratio of shared tokens to the longer token list */ 
                function tokenSimilarity(source, target) {
                    const sTokens = tokenize(source);
                    const tTokens = tokenize(target);
                    const commonTokens = sTokens.filter(function(tok){ return tTokens.includes(tok) }).length;
                    return commonTokens / Math.max(sTokens.length, tTokens.length);
                }

                /** Sorts candidates by descending similarity score; on a tie, prefers the shorter caption */
                return candidates
                    .map(function(candidate){
                        return {
                            candidate,
                            score: tokenSimilarity(name, candidate.caption)
                        }
                    })
                    .sort(function(a, b) {
                        if (b.score !== a.score) return b.score - a.score;
                        return tokenize(a.candidate.caption).length - tokenize(b.candidate.caption).length;
                    })[0].candidate;
            }

            width = Math.round(width);
            height = Math.round(height);

            // Filter the list to only options whose dimensions match within a tolerance of < 1
            const matched = _.filter(list, function(option) {
                const size = option.size;
                return Math.abs(Math.round(size[0]) - width) < 1 && 
                    Math.abs(Math.round(size[1]) - height) < 1;
            });

            let result = undefined;

            if(matched.length === 0) {
                result = undefined;
            } else if(matched.length === 1) {
                result = matched[0];
            } else {
                // Multiple matches — need to pick the best one by name
                let nameToMatch;

                if(currentName) {
                    // Use the provided name as the reference for comparison
                    nameToMatch = currentName;
                } else {
                    // Try to resolve a name from the provided default size list
                    const defaultMatch = _.find((defaultSizes || []), function(option) {
                        const size = option.value;
                        if(!size || !option.caption) return false;
                        return Math.abs(Math.round(option.value[0]) - width) < 1 &&
                            Math.abs(Math.round(option.value[1]) - height) < 1;
                    });
                    defaultMatch && (nameToMatch = defaultMatch.caption);
                }
                
                if(nameToMatch) {
                    result = findBestByName(matched, nameToMatch);
                } else {
                    result = matched[0];
                }
            }

            return result;
        };

        return {
            findPaperSizeOptionBySize: _findPaperSizeOptionBySize
        };
    })();
});
