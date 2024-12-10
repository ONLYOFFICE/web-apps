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
            var _lsAllowed = !!window.localStorage;
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
