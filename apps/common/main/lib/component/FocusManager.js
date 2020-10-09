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

Common.UI.FocusManager = function (tabindex, parent) {
    var register = function(fields, options, tabindex) {
        var arr = [],
            selector,
            el;
        if (typeof options==='string') {
            selector = options;
        } else {
            el = options;
        }
        if (!fields.forEach) {
            fields = [fields];
            if (el)
                el = [el];
        }

        fields.forEach(function(cmp, index) {
            var elem = selector ? (cmp.$el || $(cmp.el)).find(selector).addBack().filter(selector) : (el && el[index] ? el[index] : cmp);
            elem && elem.attr && elem.attr('tabindex', tabindex.toString());
            arr.push({
                cmp: cmp,
                el: elem,
                selector: selector
            });
        });
        return arr;
    };

    return {
        tabindex: tabindex || 0,
        parent: parent,
        fields: [],

        add: function(fields, options) { // options may be selector or component.el
            this.fields = this.fields.concat(register(fields, options, this.tabindex));
            !this.trapFirst && this.addTraps();
        },

        insert: function(field, index, options) {
            this.fields.splice(index, 0, register(field, options, this.tabindex));
        },

        remove: function(index) {
            this.fields.splice(index, 1);
        },

        addTraps: function() {
            if (!this.parent || !this.parent.$window) return;

            var me = this;
            this.trapFirst = $('<span aria-hidden="true" tabindex="' + this.tabindex + '"></span>');
            this.trapFirst.on('focus', function() {
                for (var i=0; i<me.fields.length; i++) {
                    var field = me.fields[i];
                    if ((field.cmp.isVisible ? field.cmp.isVisible() : field.cmp.is(':visible')) && !(field.cmp.isDisabled && field.cmp.isDisabled())) {
                        var el = (field.selector) ? (field.cmp.$el || $(field.cmp.el)).find(field.selector).addBack().filter(field.selector) : field.el;
                        el.focus();
                        break;
                    }
                }
            });
            this.parent.$window.prepend(this.trapFirst);

            this.trapLast = $('<span aria-hidden="true" tabindex="' + (this.tabindex+1) + '"></span>');
            this.trapLast.on('focus', function() {
                for (var i=me.fields.length-1; i>=0; i--) {
                    var field = me.fields[i];
                    if ((field.cmp.isVisible ? field.cmp.isVisible() : field.cmp.is(':visible')) && !(field.cmp.isDisabled && field.cmp.isDisabled())) {
                        var el = (field.selector) ? (field.cmp.$el || $(field.cmp.el)).find(field.selector).addBack().filter(field.selector) : field.el;
                        el.focus();
                        break;
                    }
                }
            });
            this.parent.$window.append(this.trapLast);
        },

        setTabIndex: function (tabindex) {
            this.tabindex = tabindex;
        }
    }
};

Common.UI.FocusManager2 = new(function() {
    var _tabindex = 1,
        _windows = [];

    var register = function(fields) {
        var arr = [];
        if (!fields.forEach) {
            fields = [fields];
        }
        fields.forEach(function(field) {
            if (field) {
                var item = (field.cmp && typeof field.selector == 'string') ? field : {cmp: field, selector: '.form-control'};
                item.el = (item.cmp.$el || $(item.cmp.el)).find(item.selector).addBack().filter(item.selector);
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
            for (var i=0; i<fields.length; i++) {
                var field = fields[i];
                if ((field.cmp.isVisible ? field.cmp.isVisible() : field.cmp.is(':visible')) && !(field.cmp.isDisabled && field.cmp.isDisabled())) {
                    var el = (field.selector) ? (field.cmp.$el || $(field.cmp.el)).find(field.selector).addBack().filter(field.selector) : field.el;
                    el.focus();
                    break;
                }
            }
        });
        current.parent.$window.prepend(trapFirst);

        var trapLast = $('<span aria-hidden="true" tabindex="' + (_tabindex+1) + '"></span>');
        trapLast.on('focus', function() {
            if (current.hidden) return;
            var fields = current.fields;
            for (var i=fields.length-1; i>=0; i--) {
                var field = fields[i];
                if ((field.cmp.isVisible ? field.cmp.isVisible() : field.cmp.is(':visible')) && !(field.cmp.isDisabled && field.cmp.isDisabled())) {
                    var el = (field.selector) ? (field.cmp.$el || $(field.cmp.el)).find(field.selector).addBack().filter(field.selector) : field.el;
                    el.focus();
                    break;
                }
            }
        });
        current.parent.$window.append(trapLast);
        current.traps = [trapFirst, trapLast];
    };

    var _add = function(e, fields) {
        if (e && e.cid) {
            if (_windows[e.cid]) {
                _windows[e.cid].fields.concat(register(fields));
            } else {
                _windows[e.cid] = {
                    parent: e,
                    fields: register(fields),
                    hidden: false
                };
            }
            addTraps(_windows[e.cid]);
        }
    };

    Common.NotificationCenter.on({
        'modal:show': function(e){
            if (e && e.cid) {
                if (_windows[e.cid]) {
                    _windows[e.cid].hidden = false;
                } else {
                    _windows[e.cid] = {
                        parent: e,
                        hidden: false
                    };
                }
            }
        },
        'window:show': function(e){
            if (e && e.cid && _windows[e.cid] && !_windows[e.cid].fields) {
                _windows[e.cid].fields = register(e.getFocusedComponents());
                addTraps(_windows[e.cid]);
            }
        },
        'modal:close': function(e, last) {
            if (e && e.cid && _windows[e.cid]) {
                delete _windows[e.cid];
            }
        },
        'modal:hide': function(e, last) {
            if (e && e.cid && _windows[e.cid]) {
                _windows[e.cid].hidden = true;
            }
        }
    });

    return {
        add: _add
    }
})();