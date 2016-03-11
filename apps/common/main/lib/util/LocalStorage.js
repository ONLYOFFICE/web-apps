/**
 *    LocalStorage.js
 *
 *    Created by Maxim Kadushkin on 31 July 2015
 *    Copyright (c) 2015 Ascensio System SIA. All rights reserved.
 *
 */

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
        if (!_lsAllowed)
            Common.Gateway.internalMessage('localstorage', {cmd:'get', keys:_filter});
    };

    var _save = function() {
        if (!_lsAllowed)
            Common.Gateway.internalMessage('localstorage', {cmd:'set', keys:_store});
    };

    var _setItem = function(name, value, just) {
        if (_lsAllowed) {
            localStorage.setItem(name, value);
        } else {
            _store[name] = value;

            if (just===true) {
                Common.Gateway.internalMessage('localstorage', {
                    cmd:'set',
                    keys: {
                        name: value
                    }
                });
            }
        }
    };

    var _getItem = function(name) {
        if (_lsAllowed)
            return localStorage.getItem(name);
        else
            return _store[name]===undefined ? null : _store[name];
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
        setItem: _setItem,
        setKeysFilter: function(value) {
            _filter = value;
        },
        sync: _refresh,
        save: _save
    };
})();