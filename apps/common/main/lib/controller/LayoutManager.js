/*
 *
 * (c) Copyright Ascensio System SIA 2010-2021
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
 * You can contact Ascensio System SIA at 20A-12 Ernesta Birznieka-Upisha
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
 *  LayoutManager.js
 *
 *  Created by Julia Radzhabova on 06.10.2021
 *  Copyright (c) 2021 Ascensio System SIA. All rights reserved.
 *
 */


if (Common === undefined)
    var Common = {};

if (Common.UI === undefined) {
    Common.UI = {};
}

Common.UI.LayoutManager = new(function() {
    var _config,
        _licensed;
    var _init = function(config, licensed) {
        _config = config;
        _licensed = licensed;
    };

    var _applyCustomization = function(config, el, prefix) {
        !config && (config = _config);
        if (!_licensed || !config) return;

        for (var name in config) {
            if(config.hasOwnProperty(name)) {
                if(typeof config[name] === 'object')
                    _applyCustomization(config[name], el, (prefix || '') + name + '-');
                else if (config[name] === false) {
                    var selector = '[data-layout-name=' + (prefix || '') + name + ']',
                        cmp = el ? el.find(selector) : $(selector);
                    cmp && cmp.hide && cmp.hide();
                }
            }
        }
    };

    var _isElementVisible = function(value, config, prefix) {
        !config && (config = _config);
        if (!_licensed || !config) return true;

        var res = true;
        for (var name in config) {
            if(config.hasOwnProperty(name)) {
                if(typeof config[name] === 'object')
                    res = _isElementVisible(value, config[name], (prefix || '') + name + '-');
                else {
                    if (value === (prefix || '') + name) { // checked value is in config
                        res = config[name];
                    }
                }
                if (res===false) return res;
            }
        }
        return res;
    };

    var _getInitValue = function(name) {
        if (_licensed && _config) {
            var arr = name.split('-'),
                i = 0,
                obj = _config;
            for (i=0; i<arr.length; i++) {
                if (typeof obj[arr[i]] === 'object' && obj[arr[i]]) {
                    obj = obj[arr[i]];
                } else
                    break;
            }
            if (i===arr.length) {
                if (typeof obj === 'object' && obj)
                    return obj.mode;
                else
                    return obj;
            }
        }
    };

    return {
        init: _init,
        applyCustomization: _applyCustomization,
        isElementVisible: _isElementVisible,
        getInitValue: _getInitValue
    }
})();

/**
 * features: {
 *      feature: { //can be object or init value
 *          mode: <init value> // value1 / value2 ...
 *          change: false/true // hide/show feature
 *      } / value1 / value2 ...
 * }
 */
Common.UI.FeaturesManager = new(function() {
    var _config,
        _licensed;
    var _init = function(config, licensed) {
        _config = config;
        _licensed = licensed;
    };

    var _canChange = function(name, force) {
        return !((_licensed || force) && _config && typeof _config[name] === 'object' && _config[name] && _config[name].change===false);
    };

    var _getInitValue2 = function(name, defValue, force) {
        if ((_licensed || force) && _config && _config[name] !== undefined ) {
            if (typeof _config[name] === 'object' && _config[name]) { // object and not null
                if (_config[name].mode!==undefined)
                    return _config[name].mode;
            } else
                return _config[name];
        }

        return defValue;
    };

    var _getInitValue = function(name, force) {
        if ((_licensed || force) && _config && _config[name] !== undefined ) {
            if (typeof _config[name] === 'object' && _config[name]) { // object and not null
                if (_config[name].mode!==undefined)
                    return _config[name].mode;
            } else
                return _config[name];
        }
    };

    return {
        init: _init,
        canChange: _canChange,
        getInitValue: _getInitValue
    }
})();