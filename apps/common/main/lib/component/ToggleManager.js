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
 *  ToggleManager.js
 *
 *  Created on 1/28/14
 *
 */


if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/component/BaseView'
], function () {
    'use strict';

    var groups = {};

    function toggleGroup(cmp, state) {
        var g, i, l;
        if (state) {
            g = groups[cmp.toggleGroup];
            for (i = 0, l = g.length; i < l; i++) {
                if (g[i] !== cmp) {
                    if (g[i].isActive) {
                        g[i].isActive() && g[i].toggle(false);
                    } else {
                        g[i].toggle(false);
                    }
                }
            }
        }
    }

    /**
     * Private utility class used by component
     */
    Common.UI.ToggleManager = {
        register: function(cmp) {
            if (!cmp.toggleGroup) {
                return;
            }
            var group = groups[cmp.toggleGroup];
            if (!group) {
                group = groups[cmp.toggleGroup] = [];
            }
            group.push(cmp);
            cmp.on('toggle', toggleGroup);
        },

        unregister: function(cmp) {
            if (!cmp.toggleGroup) {
                return;
            }
            var group = groups[cmp.toggleGroup];
            if (group) {
                _.without(group, cmp);
                cmp.off('toggle', toggleGroup);
            }
        },

        /**
         * Gets the toggled components in the passed group or null
         * @param {String} group
         * @return {Common.UI.BaseView}
         */
        getToggled: function(group) {
            var g = groups[group],
                i = 0,
                len;
            if (g) {
                for (len = g.length; i < len; i++) {
                    if (g[i].pressed === true ||
                        g[i].checked === true) {
                        return g[i];
                    }
                }
            }
            return null;
        }
    }
});