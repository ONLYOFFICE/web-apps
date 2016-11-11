/**
 *  SharedSettings.js
 *
 *  Created by Alexander Yuzhin on 10/7/16
 *  Copyright (c) 2016 Ascensio System SIA. All rights reserved.
 *
 */


if (Common === undefined)
    var Common = {};

Common.SharedSettings = new (function() {
    var _keys = [];
    var _data = {};

    var _set = function (key, value) {
        if (_data[key] === void 0) {
            _keys.push(key);
        }
        _data[key] = value;
    };

    var _get = function (key) {
        return _data[key];
    };

    var _remove = function (key) {
        var index = _keys.indexOf(key);
        if (index != -1) {
            _keys.splice(index, 1);
        }

        delete _data[key];
    };

    var _size = function () {
        return _keys.length;
    };

    return {
        set: _set,
        get: _get,
        remove: _remove,
        size: _size
    };
})();
