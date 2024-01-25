/*
 * (c) Copyright Ascensio System SIA 2010-2023
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
        _licensed,
        _lastInternalTabIdx = 10;
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

    var _createTab = function(toolbar, action, caption) {
        if (!toolbar || !action || !caption) return;

        var _tab = {action: action, caption: caption},
            _panel = $('<section id="' + action + '" class="panel" data-tab="' + action + '"></section>'),
            _group = $('<div class="group"></div>');
        _group.appendTo(_panel);

        toolbar.addTab(_tab, _panel, toolbar.getLastTabIdx());
        toolbar.setVisible(action, true);
        console.log('create ' + action);
        return _panel;
    };

    var _getTab = function (toolbar, action, caption) {
        if (!toolbar || !action) return;
        return toolbar.getTab(action) || _createTab(toolbar, action, caption);
    };

    var _addCustomItems = function (toolbar, data, api) {
        if (!data || data.length<1) return;

        var lang = Common.Locale.getCurrentLanguage();
        data.forEach(function(plugin) {
            /*
            plugin = {
                guid: 'plugin-guid',
                tab: {
                    id: 'tab-id',
                    text: 'caption' or { "fr": "french caption", "es": "spanish caption"}
                },
                items: [
                    {
                        id: 'button-id',
                        type: 'button'='big-button' or 'small-button',
                        icons: 'template string' or object
                        text: 'caption' or { "fr": "french caption", "es": "spanish caption"},
                        hint: 'hint' or { "fr": "french hint", "es": "spanish hint"},
                        separator: true/false - inserted before item,
                        split: true/false - used when has menu
                        menu: [
                            {
                                id: 'item-id',
                                text: 'caption' or { "fr": "french caption", "es": "spanish caption"},
                                separator: true/false - inserted before item,
                            }
                        ],
                        enableToggle: true/false - can press and depress button, only when no menu or has split menu
                        lockInViewMode: true/false - lock in view mode
                    }
                ]
            }
            */
            if (plugin.tab) {
                var $panel = _getTab(toolbar, plugin.tab.id, plugin.tab.text) || _getTab(toolbar, 'plugins');
                if ($panel) {
                    plugin.items && plugin.items.forEach(function(item) {
                        var _groups = $panel.children().filter('.group'),
                            _group;
                        if (_groups.length>0 && !item.separator)
                            _group = $(_groups[_groups.length-1]);
                        else {
                            item.separator && $('<div class="separator long"></div>').appendTo($panel);
                            _group = $('<div class="group"></div>');
                            _group.appendTo($panel);
                        }

                        if (item.type==='button' || item.type==='big-button') {
                            var _set = Common.enumLock;
                            var btn = new Common.UI.ButtonCustom({
                                cls: 'btn-toolbar x-huge icon-top',
                                iconsSet: item.icons,
                                caption: ((typeof item.text == 'object') ? item.text[lang] || item.text['en'] : item.text) || '',
                                menu: item.menu && item.menu.length > 0,
                                split: item.menu && item.menu.length > 0 && !!item.split,
                                enableToggle: item.enableToggle && (!item.menu || !!item.split),
                                value: item.id,
                                guid: plugin.guid,
                                hint: ((typeof item.hint == 'object') ? item.hint[lang] || item.hint['en'] : item.hint) || '',
                                lock: item.lockInViewMode ? [_set.viewMode, _set.previewReviewMode, _set.viewFormMode, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.selRangeEdit, _set.editFormula ] : [],
                                dataHint: '1',
                                dataHintDirection: 'bottom',
                                dataHintOffset: 'small'
                            });

                            if (btn.menu) {
                                var _menu_items = [];
                                item.menu.forEach(function(menuItem) {
                                    if (menuItem.separator) _menu_items.push({caption: '--'});
                                    menuItem.text && _menu_items.push({
                                        caption: ((typeof menuItem.text == 'object') ? menuItem.text[lang] || menuItem.text['en'] : menuItem.text) || '',
                                        value: menuItem.id,
                                        iconImg: Common.UI.getSuitableIcons(Common.UI.iconsStr2IconsObj(menuItem.icons)),
                                        guid: plugin.guid
                                    });
                                });
                                btn.setMenu(new Common.UI.Menu({
                                    items: _menu_items
                                }));
                                btn.menu.on('item:click', function(menu, mi, e) {
                                    api && api.onPluginButtonClick && api.onPluginButtonClick(mi.options.guid, mi.value);
                                });
                            }
                            if ( !btn.menu || btn.split) {
                                btn.on('click', function(b, e) {
                                    api && api.onPluginButtonClick && api.onPluginButtonClick(b.options.guid, b.options.value, b.pressed);
                                });
                            }
                            var $slot = $('<span class="btn-slot text x-huge"></span>').appendTo(_group);
                            btn.render($slot);
                        }
                    });
                }
            }
        });
    };

    return {
        init: _init,
        applyCustomization: _applyCustomization,
        isElementVisible: _isElementVisible,
        getInitValue: _getInitValue,
        lastTabIdx: _lastInternalTabIdx,
        getTab: _getTab,
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

    return {
        init: _init,
        canChange: _canChange,
        getInitValue: _getInitValue
    }
})();