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
 *    LocalStorage.js
 *
 *    Created on 31 July 2015
 *
 */

define(['gateway'], function () {
    Common.localStorage = new (function() {
        var _storeName, _filter;
        var _store = {};

        var ongetstore = function(data) {
            if (data.type == 'localstorage') {
                _store = data.keys;
            }
        };

        Common.Gateway.on('internalcommand', ongetstore);

        var _refresh = function() {
            // if (!_lsAllowed)
            //     Common.Gateway.internalMessage('localstorage', {cmd:'get', keys:_filter});
        };

        var _save = function() {
            // if (!_lsAllowed)
            //     Common.Gateway.internalMessage('localstorage', {cmd:'set', keys:_store});
        };

        var _setItem = function(name, value, just) {
            if (_lsAllowed) {
                try
                {
                    localStorage.setItem(name, value);
                }
                catch (error){}

            } else {
                _store[name] = value;

                // if (just===true) {
                    // TDDO: remove after ver 7.2. using external local storage is depricated
                    // Common.Gateway.internalMessage('localstorage', {
                    //     cmd:'set',
                    //     keys: {
                    //         name: value
                    //     }
                    // });
                // }
            }
        };

        var _setItemAsBool = function(name, value, just) {
            _setItem(name, value ? 1 : 0, just);
        };

        var _getItem = function(name) {
            if (_lsAllowed)
                return localStorage.getItem(name);
            else
                return _store[name]===undefined ? null : _store[name];
        };

        var _getItemAsBool = function (name, defValue) {
            var value = _getItem(name);
            defValue = defValue || false;
            return (value!==null) ? (parseInt(value) != 0) : defValue;
        };

        var _getItemAsInt = function (name, defValue) {
            var value = _getItem(name);
            return (value!==null) ? parseInt(value) : defValue || 0;
        };

        var _getItemExists = function (name) {
            var value = _getItem(name);
            return value !== null;
        };

        var _removeItem = function(name) {
            if (_lsAllowed)
                localStorage.removeItem(name);
            else
                delete _store[name];
        };

        try {
            localStorage.setItem('test', 1);    // for WebView checking !!window.localStorage not enough
            localStorage.removeItem('test');
            var _lsAllowed = true;
        } catch (e) {
            _lsAllowed = false;
        }

        return {
            getId: function() {
                return _storeName;
            },
            setId: function(name) {
                _storeName = name;
            },
            getItem: _getItem,
            getItemAsInt: _getItemAsInt,
            getBool: _getItemAsBool,
            setBool: _setItemAsBool,
            setItem: _setItem,
            removeItem: _removeItem,
            setKeysFilter: function(value) {
                _filter = value;
            },
            getKeysFilter: function() {
                return _filter;
            },
            itemExists: _getItemExists,
            sync: _refresh,
            save: _save
        };
    })();
});
