/*
 *
 * (c) Copyright Ascensio System SIA 2010-2020
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
 *  FocusManager.js
 *
 *  Created by Julia Radzhabova on 24.09.2020
 *  Copyright (c) 2020 Ascensio System SIA. All rights reserved.
 *
 */


if (Common === undefined)
    var Common = {};

if (Common.UI === undefined) {
    Common.UI = {};
}

Common.UI.FocusManager = new(function() {
    var _tabindex = 1,
        _windows = [],
        _count = 0;

    var register = function(fields) {
        var arr = [];
        if (!fields.forEach) {
            fields = [fields];
        }
        fields.forEach(function(field) {
            if (field) {
                var item = (field.cmp && typeof field.selector == 'string') ? field : {cmp: field, selector: '.form-control'};
                item.el = (item.cmp.$el || $(item.cmp.el || item.cmp)).find(item.selector).addBack().filter(item.selector);
                item.el && item.el.attr && item.el.attr('tabindex', _tabindex.toString());
                arr.push(item);
            }
        });
        return arr;
    };

    var addTraps = function(current) {
        if (!current || current.traps || !current.fields || current.fields.length<1) return;

        var trapFirst = $('<span aria-hidden="true" tabindex="' + _tabindex + '"></span>');
        trapFirst.on('focus', function() {
            if (current.hidden) return;
            var fields = current.fields;
            for (var i=fields.length-1; i>=0; i--) {
                var field = fields[i];
                if ((field.cmp.isVisible ? field.cmp.isVisible() : field.cmp.is(':visible')) && !(field.cmp.isDisabled && field.cmp.isDisabled())) {
                    var el = (field.selector) ? (field.cmp.$el || $(field.cmp.el || field.cmp)).find(field.selector).addBack().filter(field.selector) : field.el;
                    el && setTimeout(function(){ el.focus(); }, 10);
                    break;
                }
            }
        });
        current.parent.$window.prepend(trapFirst);

        var trapLast = $('<span aria-hidden="true" tabindex="' + (_tabindex+1) + '"></span>');
        trapLast.on('focus', function() {
            if (current.hidden) return;
            var fields = current.fields;
            for (var i=0; i<fields.length; i++) {
                var field = fields[i];
                if ((field.cmp.isVisible ? field.cmp.isVisible() : field.cmp.is(':visible')) && !(field.cmp.isDisabled && field.cmp.isDisabled())) {
                    var el = (field.selector) ? (field.cmp.$el || $(field.cmp.el || field.cmp)).find(field.selector).addBack().filter(field.selector) : field.el;
                    el && setTimeout(function(){ el.focus(); }, 10);
                    break;
                }
            }
        });
        current.parent.$window.append(trapLast);
        current.traps = [trapFirst, trapLast];
    };

    var updateTabIndexes = function(increment) {
        var step = increment ? 1 : -1;
        for (var cid in _windows) {
            if (_windows.hasOwnProperty(cid)) {
                var item = _windows[cid];
                if (item && item.index < _count-1 && item.traps)
                    item.traps[1].attr('tabindex', (parseInt(item.traps[1].attr('tabindex')) + step).toString());
            }
        }
    };

    var _add = function(e, fields) {
        if (e && e.cid) {
            if (_windows[e.cid]) {
                _windows[e.cid].fields = (_windows[e.cid].fields || []).concat(register(fields));
            } else {
                _windows[e.cid] = {
                    parent: e,
                    fields: register(fields),
                    hidden: false,
                    index: _count++
                };
            }
            addTraps(_windows[e.cid]);
        }
    };

    var _init = function() {
        Common.NotificationCenter.on({
            'modal:show': function(e){
                if (e && e.cid) {
                    if (_windows[e.cid]) {
                        _windows[e.cid].hidden = false;
                    } else {
                        _windows[e.cid] = {
                            parent: e,
                            hidden: false,
                            index: _count++
                        };
                        updateTabIndexes(true);
                    }
                }
            },
            'window:show': function(e){
                if (e && e.cid && _windows[e.cid] && !_windows[e.cid].fields) {
                    _windows[e.cid].fields = register(e.getFocusedComponents());
                    addTraps(_windows[e.cid]);
                }

                var el = e ? e.getDefaultFocusableComponent() : null;
                el && setTimeout(function(){ el.focus(); }, 100);
            },
            'modal:close': function(e, last) {
                if (e && e.cid && _windows[e.cid]) {
                    updateTabIndexes(false);
                    delete _windows[e.cid];
                    _count--;
                }
            },
            'modal:hide': function(e, last) {
                if (e && e.cid && _windows[e.cid]) {
                    _windows[e.cid].hidden = true;
                }
            }
        });
    };

    return {
        init: _init,
        add: _add
    }
})();