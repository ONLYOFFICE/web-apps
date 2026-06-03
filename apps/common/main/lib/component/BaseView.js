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
 *  BaseView.js
 *
 *  Created on 1/17/14
 *
 */

if (Common === undefined)
    var Common = {};

define([
    'backbone'
], function (Backbone) {
    'use strict';

    Common.UI = _.extend(Common.UI || {}, {
        Keys : {
            BACKSPACE:  8,
            TAB:        9,
            RETURN:     13,
            SHIFT:      16,
            CTRL:       17,
            ALT:        18,
            ESC:        27,
            LEFT:       37,
            UP:         38,
            RIGHT:      39,
            DOWN:       40,
            DELETE:     46,
            HOME:       36,
            END:        35,
            SPACE:      32,
            PAGEUP:     33,
            PAGEDOWN:   34,
            INSERT:     45,
            ZERO:       48,
            EQUALITY_FF:61,
            META:       91,
            NUM_ZERO:   96,
            NUM_PLUS:   107,
            NUM_MINUS:  109,
            F1:         112,
            F2:         113,
            F3:         114,
            F4:         115,
            F5:         116,
            F6:         117,
            F7:         118,
            F8:         119,
            F9:         120,
            F10:        121,
            F11:        122,
            F12:        123,
            MINUS_FF:   173,
            EQUALITY:   187,
            MINUS:      189
        },

        BaseView: Backbone.View.extend({
            isSuspendEvents: false,

            initialize : function(options) {
                this.options = this.options ? _({}).extend(this.options, options) : options;
            },

            setVisible: function(visible) {
                return this[visible ? 'show': 'hide']();
            },

            isVisible: function() {
                return $(this.el).is(":visible");
            },

            suspendEvents: function() {
                this.isSuspendEvents = true;
            },

            resumeEvents: function() {
                this.isSuspendEvents = false;
            }
        }),

        getId: function(prefix) {
            return _.uniqueId(prefix || "asc-gen");
        }
    });
});