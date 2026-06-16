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
if (Common === undefined)
    var Common = {};

Common.IrregularStack = function(config) {

    var _stack = [];

    var _compare = function(obj1, obj2){
        if (typeof obj1 === 'object' && typeof obj2 === 'object' && window.JSON)
            return window.JSON.stringify(obj1) === window.JSON.stringify(obj2);
        return obj1 === obj2;
    }

    config = config || {};
    var _strongCompare = config.strongCompare || _compare;
    var _weakCompare = config.weakCompare || _compare;

    var _indexOf = function(obj, compare) {
        for (var i = _stack.length - 1; i >= 0; i--) {
            if (compare(_stack[i], obj))
                return i;
        }
        return -1;
    }

    var _push = function(obj) {
        _stack.push(obj);
    }

    var _pop = function(obj) {
        var index = _indexOf(obj, _strongCompare);
        if (index != -1) {
            var removed = _stack.splice(index, 1);
            return removed[0];
        }
        return undefined;
    }

    var _get = function(obj) {
        var index = (typeof obj === 'object')? _indexOf(obj, _weakCompare) : obj;
        if (index != -1) 
            return _stack[index];
        return undefined;
    }

    var _exist = function(obj) {
        return !(_indexOf(obj, _strongCompare) < 0);
    }

    var _length = function() {
        return _stack.length;
    }

    return {
        push: _push,
        pop: _pop,
        get: _get,
        exist: _exist,
        length: _length
    }
};