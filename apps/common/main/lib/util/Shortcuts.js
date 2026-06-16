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
 *    Shortcuts.js
 *
 *    Created on 05 March 2014
 *
 */
/*
*       Methods
*       -------
*
*       @method delegateShortcuts
*       Accepts named array of shortcuts and callbacks
*
*       @method suspendEvents
*
*       @method resetEvents
*
*
*       Examples of usage
*       ----------------
*
*       Common.util.Shortcuts.delegateShortcuts({
*           shortcuts: {
*               "ctrl+f": this.onShortcutSearch
*           }
*       });
*
*       Common.util.Shortcuts.delegateShortcuts({
*           shortcuts: {
*               "ctrl+f": "shortcutSearch"
*           },
*           shortcutSearch: function(event) {
*           }
*       });
*
*       Common.util.Shortcuts.suspendEvents('ctrl+f')
*       Common.util.Shortcuts.resumeEvents('ctrl+f')
* */

if (Common === undefined) {
    var Common = {};
}

Common.util = Common.util||{};

 define([
    'backbone',
    'keymaster',
    'notification'
], function (Backbone) {
    'use strict';

    var Shortcuts = function(options) {
        this.cid = _.uniqueId("shortcuts");
        this.initialize.apply(this, arguments);
//        return this.delegateShortcuts(options);
        return this;
    };

    _.extend(Shortcuts.prototype, Backbone.Events, {
        initialize: function() {
            window.key.filter = function(event) {
                return true;
            };

            Common.NotificationCenter.on({
                'modal:show': function(e){
                    window.key.suspend();
                },
                'modal:close': function(e, last) {
                    last && window.key.resume();
                },
                'modal:hide': function(e, last) {
                    last && window.key.resume();
                }
            });
        },

        delegateShortcuts: function(options) {
            if (!options || !options.shortcuts) return;

            this.removeShortcuts(options);

            var callback, match, method, scope, shortcut, shortcutKey;
            var _results = [];
            for (shortcut in options.shortcuts) {
                callback = options.shortcuts[shortcut];

                if (!_.isFunction(callback)){
                    method = options[callback];
                    if (!method) throw new Error("Method " + callback + " does not exist");
                } else {
                    method = callback;
                }

                match = shortcut.match(/^(\S+)\s*(.*)$/);
                shortcutKey = match[1];
                scope = match[2].length ? match[2] : 'all';
                method = _.bind(method, this);
                _results.push(window.key(shortcutKey, scope, method));
            }
//            return _results;
        },

        removeShortcuts: function(options) {
            if (!options || !options.shortcuts) return;

            var match, scope, shortcut, shortcutKey;
            var _results = [];
            for (shortcut in options.shortcuts) {
                match = shortcut.match(/^(\S+)\s*(.*)$/);
                shortcutKey = match[1];
                scope = match[2].length ? match[2] : 'all';

                window.key.unbind(shortcutKey, scope);
            }
        },

        suspendEvents: function(key,scope,propagate) {
            window.key.suspend(key,scope,propagate);
        },

        resumeEvents: function(key,scope) {
            window.key.resume(key,scope);
        }
    });

    Shortcuts.extend = Backbone.View.extend;

    Common.util.Shortcuts = new Shortcuts;
});
