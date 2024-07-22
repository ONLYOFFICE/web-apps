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
 *  LayoutManager.js
 *
 *  Created on 06.10.2021
 *
 */


if (Common === undefined)
    var Common = {};

if (Common.UI === undefined) {
    Common.UI = {};
}

Common.UI.LayoutManager = new(function() {
    var _config,
        _licensed,
        _api,
        _lastInternalTabIdx = 10;
    var _init = function(config, licensed, api) {
        _config = config;
        _licensed = licensed;
        _api = api;
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

    var _findCustomButton = function(toolbar, action, guid, id) {
        if (toolbar && toolbar.customButtonsArr && toolbar.customButtonsArr[guid] ) {
            for (var i=0; i< toolbar.customButtonsArr[guid].length; i++) {
                var btn = toolbar.customButtonsArr[guid][i];
                if (btn.options.tabid === action && btn.options.guid === guid && btn.options.value === id) {
                    return btn;
                }
            }
        }
    }

    var _findRemovedButtons = function(toolbar, action, guid, items) {
        var arr = [];
        if (toolbar && toolbar.customButtonsArr && toolbar.customButtonsArr[guid] ) {
            if (!items || items.length<1) {
                arr = toolbar.customButtonsArr[guid];
                toolbar.customButtonsArr[guid] = undefined;
            } else {
                for (var i=0; i< toolbar.customButtonsArr[guid].length; i++) {
                    var btn = toolbar.customButtonsArr[guid][i];
                    if (btn.options.tabid === action && !_.findWhere(items, {id: btn.options.value})) {
                        arr.push(btn);
                        toolbar.customButtonsArr[guid].splice(i, 1);
                        i--;
                    }
                }
            }
        }
        return arr;
    }

    var _fillButtonMenu = function(items, guid, lang, toMenu) {
        if (toMenu)
            toMenu.removeAll();
        else {
            toMenu = new Common.UI.Menu({
                cls: 'shifted-right',
                menuAlign: 'tl-tr',
                items: []
            });
            toMenu.on('item:click', function(menu, mi, e) {
                _api && _api.onPluginToolbarMenuItemClick(mi.options.guid, mi.value);
            });
        }
        items.forEach(function(menuItem) {
            if (menuItem.separator) toMenu.addItem({caption: '--'});
            menuItem.text && toMenu.addItem({
                caption: menuItem.text || '',
                value: menuItem.id,
                menu: menuItem.items ? _fillButtonMenu(menuItem.items, guid, lang) : false,
                iconImg: Common.UI.getSuitableIcons(Common.UI.iconsStr2IconsObj(menuItem.icons)),
                guid: guid
            });
        });
        return toMenu;
    }

    var _addCustomItems = function (toolbar, data) {
        if (!data) return;

        var lang = Common.Locale.getCurrentLanguage(),
            btns = [];
        data.forEach(function(plugin) {
            /*
            plugin = {
                guid: 'plugin-guid',
                tabs: [
                    {
                        id: 'tab-id',
                        text: 'caption',
                        items: [
                            {
                                id: 'button-id',
                                type: 'button'='big-button' or 'small-button',
                                icons: 'template string' or object
                                text: 'caption' or - can be empty
                                hint: 'hint',
                                separator: true/false - inserted before item,
                                split: true/false - used when has menu
                                items: [
                                    {
                                        id: 'item-id',
                                        text: 'caption'
                                        separator: true/false - inserted before item,
                                        icons: 'template string' or object
                                    }
                                ],
                                enableToggle: true/false - can press and depress button, only when no menu or has split menu
                                lockInViewMode: true/false - lock in view modes (preview review, view forms, disconnect, etc.),
                                disabled: true/false
                            }
                        ]
                    },
                    {
                        id: 'tab-id',
                        text: 'caption',
                        items: [...]
                    },
                ]
            }
            */
            plugin.tabs && plugin.tabs.forEach(function(tab) {
                if (tab) {
                    var added = [],
                        removed = _findRemovedButtons(toolbar, tab.id, plugin.guid, tab.items);
                    tab.items && tab.items.forEach(function(item, index) {
                        var btn = _findCustomButton(toolbar, tab.id, plugin.guid, item.id),
                            _set = Common.enumLock;
                        if (btn) { // change caption, hint, disable state, menu items
                            if (btn instanceof Common.UI.Button) {
                                var caption = item.text || '';
                                if (btn.options.caption !== (caption || ' ')) {
                                    btn.cmpEl.closest('.btn-slot.x-huge').toggleClass('nocaption', !caption);
                                    btn.setCaption(caption || ' ');
                                    btn.options.caption = caption || ' ';
                                }
                                btn.updateHint(item.hint || '');
                                (item.disabled!==undefined) && Common.Utils.lockControls(_set.customLock, !!item.disabled, {array: [btn]});
                                if (btn.menu && item.items && item.items.length > 0) {// update menu items
                                    if (typeof btn.menu !== 'object') {
                                        btn.setMenu(new Common.UI.Menu({items: []}));
                                        btn.menu.on('item:click', function(menu, mi, e) {
                                            _api && _api.onPluginToolbarMenuItemClick(mi.options.guid, mi.value);
                                        });
                                    }
                                    _fillButtonMenu(item.items, plugin.guid, lang, btn.menu);
                                }
                            }
                            return;
                        }

                        if (item.type==='button' || item.type==='big-button') {
                            btn = new Common.UI.ButtonCustom({
                                cls: 'btn-toolbar x-huge icon-top',
                                iconsSet: item.icons,
                                caption: item.text || ' ',
                                menu: item.items,
                                split: item.items && !!item.split,
                                enableToggle: item.enableToggle && (!item.items || !!item.split),
                                value: item.id,
                                guid: plugin.guid,
                                tabid: tab.id,
                                separator: item.separator,
                                hint: item.hint || '',
                                lock: item.lockInViewMode ? [_set.customLock, _set.viewMode, _set.previewReviewMode, _set.viewFormMode, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.selRangeEdit, _set.editFormula ] : [_set.customLock],
                                dataHint: '1',
                                dataHintDirection: 'bottom',
                                dataHintOffset: 'small'
                            });

                            if (item.items && typeof item.items === 'object') {
                                btn.setMenu(new Common.UI.Menu({items: []}));
                                btn.menu.on('item:click', function(menu, mi, e) {
                                    _api && _api.onPluginToolbarMenuItemClick(mi.options.guid, mi.value);
                                });
                                _fillButtonMenu(item.items, plugin.guid, lang, btn.menu);
                            }
                            if ( !btn.menu || btn.split) {
                                btn.on('click', function(b, e) {
                                    _api && _api.onPluginToolbarMenuItemClick(b.options.guid, b.options.value, b.pressed);
                                });
                            }
                            added.push(btn);
                            item.disabled && Common.Utils.lockControls(_set.customLock, item.disabled, {array: [btn]});
                        }
                    });

                    toolbar.addCustomItems({action: tab.id, caption: tab.text || ''}, added, removed);
                    if (!toolbar.customButtonsArr)
                        toolbar.customButtonsArr = [];
                    if (!toolbar.customButtonsArr[plugin.guid])
                        toolbar.customButtonsArr[plugin.guid] = [];
                    Array.prototype.push.apply(toolbar.customButtonsArr[plugin.guid], added);
                    Array.prototype.push.apply(btns, added);
                }
            });
        });
        return btns;
    };

    return {
        init: _init,
        applyCustomization: _applyCustomization,
        isElementVisible: _isElementVisible,
        getInitValue: _getInitValue,
        lastTabIdx: _lastInternalTabIdx,
        addCustomItems: _addCustomItems
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

    var _isFeatureEnabled = function(name, force) {
        if (!(_licensed || force) || !_config) return true;

        return _config[name]!==false;
    };

    return {
        init: _init,
        canChange: _canChange,
        getInitValue: _getInitValue,
        isFeatureEnabled: _isFeatureEnabled
    }
})();