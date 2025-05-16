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
        _lastInternalTabIdx = 10,
        _toolbar,
        _arrControls = [], // all toolbar controls that plugin can add menu items to
        _actionsStack = [],
        _processActions = 0, // 0 - processing stopped, 1 - in process, 2 - need to process again
        _arrPlugins = []; // all plugins that add controls to toolbar or menu items to toolbar buttons
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

    var _addControls = function(arr) {
        if (Object.prototype.toString.call(arr) === '[object Array]' || arr instanceof Array)
            Array.prototype.push.apply(_arrControls, arr);
        else
            Array.prototype.push.apply(_arrControls, [arr]);
        _actionsStack.length && _tryToProcessActions();
    };

    var _getControls = function() {
        return _arrControls;
    };

    // add custom controls to toolbar

    var _findCustomControl = function(toolbar, action, guid, id) {
        if (toolbar && toolbar.customButtonsArr && toolbar.customButtonsArr[guid] ) {
            for (var i=0; i< toolbar.customButtonsArr[guid].length; i++) {
                var btn = toolbar.customButtonsArr[guid][i];
                if (btn.options.tabid === action && btn.options.guid === guid && btn.options.value === id) {
                    return btn;
                }
            }
        }
    }

    var _findAndRemoveCustomControl = function(toolbar, action, guid, id) {
        if (toolbar && toolbar.customButtonsArr && toolbar.customButtonsArr[guid] ) {
            for (var i=0; i< toolbar.customButtonsArr[guid].length; i++) {
                var btn = toolbar.customButtonsArr[guid][i];
                if (btn.options.tabid === action && btn.options.guid === guid && btn.options.value === id) {
                    toolbar.customButtonsArr[guid].splice(i, 1);
                    return btn;
                }
            }
        }
    }

    var _findRemovedControls = function(toolbar, action, guid, items) {
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

    var _fillButtonMenu = function(items, guid, callback, toMenu) {
        if (toMenu)
            toMenu.removeAll();
        else {
            toMenu = new Common.UI.Menu({
                menuAlign: 'tl-tr',
                items: []
            });
            toMenu.on('item:custom-click', function(menu, mi, e) {
                callback && callback(mi.options.guid, mi.value);
            });
        }
        var hasIcons = false;
        items.forEach(function(menuItem) {
            if (menuItem.separator) toMenu.addItem(new Common.UI.MenuItemCustom({caption: '--'}));
            menuItem.text && toMenu.addItem(new Common.UI.MenuItemCustom({
                caption: menuItem.text || '',
                value: menuItem.id,
                menu: menuItem.items ? _fillButtonMenu(menuItem.items, guid, callback) : false,
                baseUrl: '', // base url is included in icon path
                iconsSet: menuItem.icons,
                guid: guid
            }));
            hasIcons = hasIcons || !!menuItem.icons;
        });
        hasIcons && (toMenu.cmpEl ? toMenu.cmpEl.toggleClass('shifted-right', true) : (toMenu.options.cls = 'shifted-right'));
        return toMenu;
    }

    var _addCustomControls = function (toolbar, data, callback, preventRemove) {
        if (!data) return;

        _toolbar = toolbar;

        var btns = [];
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
                        removed = preventRemove ? [] : _findRemovedControls(toolbar, tab.id, plugin.guid, tab.items);

                    if (!_arrPlugins[plugin.guid])
                        _arrPlugins[plugin.guid] = {actions: [], tabs: []};

                    if (_.indexOf(_arrPlugins[plugin.guid].tabs, tab)<0)
                        _arrPlugins[plugin.guid].tabs.push(tab.id);

                    tab.items && tab.items.forEach(function(item, index) {
                        if (item.removed) { // need to remove button from the toolbar
                            let btn = _findAndRemoveCustomControl(toolbar, tab.id, plugin.guid, item.id);
                            btn && removed.push(btn);
                            return;
                        }

                        let btn = _findCustomControl(toolbar, tab.id, plugin.guid, item.id),
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
                                        btn.menu.on('item:custom-click', function(menu, mi, e) {
                                            callback && callback(mi.options.guid, mi.value);
                                        });
                                    }
                                    _fillButtonMenu(item.items, plugin.guid, callback, btn.menu);
                                }
                            }
                            return;
                        }

                        if (item.type==='button' || item.type==='big-button') {
                            btn = new Common.UI.ButtonCustom({
                                cls: 'btn-toolbar x-huge icon-top',
                                iconsSet: item.icons,
                                baseUrl: '', // base url is included in icon path
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
                                btn.menu.on('item:custom-click', function(menu, mi, e) {
                                    callback && callback(mi.options.guid, mi.value);
                                });
                                _fillButtonMenu(item.items, plugin.guid, callback, btn.menu);
                            }
                            if ( !btn.menu || btn.split) {
                                btn.on('click', function(b, e) {
                                    callback && callback(b.options.guid, b.options.value, b.pressed);
                                });
                            }
                            added.push(btn);
                            item.disabled && Common.Utils.lockControls(_set.customLock, item.disabled, {array: [btn]});
                        }
                    });

                    toolbar.addCustomControls({action: tab.id, caption: tab.text || ''}, added, removed);
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

    var _clearCustomControls = function(guid) {
        if (!_toolbar) return;
        if (_arrPlugins[guid] && _arrPlugins[guid].tabs) {
            _arrPlugins[guid].tabs.forEach(function(tab) {
                _toolbar.addCustomControls({action: tab}, undefined, _findRemovedControls(_toolbar, tab, guid));
            });
            _arrPlugins[guid].tabs = [];
        }
    };

    // add custom items to button menu

    var _addCustomMenuItems = function (action, data, callback) {
        if (!data) return;

        var btns = _findButtonByAction(action);
        if (!btns || btns.length==0) {
            _actionsStack.push({action: action, data: data, callback: callback});
            return;
        }

        btns.forEach(function(btn) {
            var _action = action;
            if (typeof btn.menu === 'object')
                _updateCustomMenuItems(_action, btn.menu, data, callback);
            else if (btn.menu) {
                let btnData = data,
                    btnCallback = callback;
                btn.on('menu:created', function() {
                    _updateCustomMenuItems(_action, btn.menu, btnData, btnCallback);
                });
            }
        });
    };

    var _clearCustomMenuItems = function(guid) {
        if (_arrPlugins[guid] && _arrPlugins[guid].actions) {
            _arrPlugins[guid].actions.forEach(function(action) {
                var btns = _findButtonByAction(action);
                btns && btns.forEach(function(btn) {
                    (typeof btn.menu === 'object') && _removeCustomMenuItems(btn.menu, guid);
                });
            });
            _arrPlugins[guid].actions = [];
        }
    };

    var _tryToProcessActions = function() { //
        if (_processActions) {
            _processActions = 2;
            return;
        }
        _processActions = 1;
        let arrLen = _actionsStack.length;
        while (arrLen>0) {
            let data = _actionsStack.shift();
            _addCustomMenuItems(data.action, data.data, data.callback);
            arrLen--;
        }
        if (_processActions===2) {
            _processActions = 0;
            _tryToProcessActions();
        } else
            _processActions = 0;
    };

    var _findButtonByAction = function(action) {
        if (!_arrControls) return;

        var arr = [];
        _arrControls.forEach(function(item) {
            if (item instanceof Common.UI.Button && item.action === action) {
                arr.push(item);
            }
        });
        return arr;
    };

    var _findCustomMenuItem = function(menu, guid, id) {
        if (menu && menu.items.length>0) {
            for (var i = menu.items.length-1; i >=0 ; i--) {
                if (menu.items[i].isCustomItem && (id===undefined && menu.items[i].options.guid === guid || menu.items[i].options.guid === guid && menu.items[i].value === id)) {
                    return menu.items[i];
                }
            }
        }
    };

    var _getMenu = function(items, guid, callback, toMenu) {
        var me = this,
            hasIcons = false;
        if (toMenu)
            toMenu.removeAll();
        else {
            toMenu = new Common.UI.Menu({
                menuAlign: 'tl-tr',
                items: []
            });
            toMenu.on('item:custom-click', function(menu, item, e) {
                !me._preventCustomClick && callback && callback(item.options.guid, item.value);
            });
            toMenu.on('menu:click', function(menu, e) {
                me._preventCustomClick && e.stopPropagation();
            });
        }
        items.forEach(function(item) {
            item.separator && toMenu.addItem(new Common.UI.MenuItemCustom({
                caption: '--',
                guid: guid
            }));
            item.text && toMenu.addItem(new Common.UI.MenuItemCustom({
                caption: item.text || '',
                value: item.id,
                menu: item.items ? _getMenu(item.items, guid, callback) : false,
                iconsSet: item.icons,
                baseUrl: '', // base url is included in icon path
                guid: guid,
                disabled: !!item.disabled
            }));
            hasIcons = hasIcons || !!item.icons;
        });
        hasIcons && (toMenu.cmpEl ? toMenu.cmpEl.toggleClass('shifted-right', true) : (toMenu.options.cls = toMenu.cls = 'shifted-right'));
        return toMenu;
    };

    var _updateCustomMenuItems = function (action, menu, data, callback) {
        if (!menu) return;
        if (!data || data.length<1) {
            _removeCustomMenuItems(menu);
            menu._hasCustomItems = false;
            return;
        }

        var me = this;
        me._preventCustomClick && clearTimeout(me._preventCustomClick);
        menu._hasCustomItems && (me._preventCustomClick = setTimeout(function () {
            me._preventCustomClick = null;
        },500)); // set delay only on update existing items

        var focused,
            hasIcons = false,
            newItems = [];
        menu._hasCustomItems = false;
        data.forEach(function(plugin) {
            /*
             plugin = {
                    guid: 'plugin-guid',
                    items: [
                        {
                            id: 'item-id',
                            text: 'caption',
                            icons: 'template string' or object
                            separator: true/false - inserted before item,
                            disabled: true/false,
                            items: [
                                {
                                    id: 'item-id',
                                    text: 'caption',
                                    separator: true/false - inserted before item,
                                    icons: 'template string' or object,
                                    disabled: true/false,
                                    items: []
                                }, ...
                            ],
                        },
                        { ... },
                        ...
                    ]
                }
            */
            if (!_arrPlugins[plugin.guid])
                _arrPlugins[plugin.guid] = {actions: [], tabs: []};

            if (_.indexOf(_arrPlugins[plugin.guid].actions, action)<0)
                _arrPlugins[plugin.guid].actions.push(action);

            _removeCustomMenuItems(menu, plugin.guid, plugin.items);

            var isnew = !_findCustomMenuItem(menu, plugin.guid);
            if (plugin && plugin.items && plugin.items.length>0) {
                menu._hasCustomItems = true;
                plugin.items.forEach(function(item) {
                    if (item.separator && isnew) {// add separator only to new plugins menu
                        menu.addItem(new Common.UI.MenuItemCustom({
                            caption: '--',
                            guid: plugin.guid
                        }));
                    }

                    if (!item.text) return;
                    var mnu = _findCustomMenuItem(menu, plugin.guid, item.id),
                        caption = item.text || '';
                    if (mnu) {
                        mnu.setCaption(caption);
                        mnu.setDisabled(!!item.disabled);
                        if (item.items) {
                            if (mnu.menu) {
                                if (mnu.menu.isVisible() && mnu.menu.cmpEl.find(' > li:not(.divider):not(.disabled):visible').find('> a').filter(':focus').length>0) {
                                    mnu.menu.isOver = true;
                                    focused = mnu.cmpEl;
                                }
                                _getMenu(item.items, plugin.guid, callback, mnu.menu);
                            } else
                                mnu.setMenu(_getMenu(item.items, plugin.guid, callback));
                        }
                    } else {
                        var mnu = new Common.UI.MenuItemCustom({
                            caption     : caption,
                            value: item.id,
                            guid: plugin.guid,
                            menu: item.items && item.items.length>=0 ? _getMenu(item.items, plugin.guid, callback) : false,
                            iconsSet: item.icons,
                            baseUrl: '', // base url is included in icon path
                            disabled: !!item.disabled
                        }).on('click', function(item, e) {
                            !me._preventCustomClick && callback && callback(item.options.guid, item.value);
                        });
                        hasIcons = hasIcons || !!item.icons;
                        menu.addItem(mnu);
                        newItems.push(mnu);
                    }
                });
            }
        });

        if (focused) {
            var $subitems = $('> [role=menu]', focused).find('> li:not(.divider):not(.disabled):visible > a');
            ($subitems.length>0) && $subitems.eq(0).focus();
        }
        if (hasIcons) {
            for (var i=0; i<newItems.length; i++) {
                hasIcons && (newItems[i].cmpEl ? newItems[i].cmpEl.toggleClass('shifted-right', true) : (newItems[i].options.cls = newItems[i].cls = 'shifted-right'));
            }
        }
        // hasIcons && (menu.cmpEl ? menu.cmpEl.toggleClass('shifted-right', true) : (menu.options.cls = 'shifted-right'));
        menu.rendered && menu.alignPosition();
    };

    _removeCustomMenuItems = function(menu, guid, items) {
        if (menu && menu.items.length>0) {
            for (var i = 0; i < menu.items.length; i++) {
                if (menu.items[i].isCustomItem && (guid===undefined || menu.items[i].options.guid === guid && !_.findWhere((items || []), {id: menu.items[i].options.value}))) {
                    menu.removeItem(menu.items[i]);
                    i--;
                }
            }
        }
    };

    return {
        init: _init,
        applyCustomization: _applyCustomization,
        isElementVisible: _isElementVisible,
        getInitValue: _getInitValue,
        lastTabIdx: _lastInternalTabIdx,
        addControls: _addControls,
        getControls: _getControls,
        addCustomControls: _addCustomControls, // add controls to toolbar
        clearCustomControls: _clearCustomControls, // remove controls added by plugin from toolbar
        addCustomMenuItems: _addCustomMenuItems, // add menu items to toolbar buttons
        clearCustomMenuItems: _clearCustomMenuItems // remove menu items added by plugin from toolbar buttons
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