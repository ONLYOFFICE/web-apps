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
 *  TreeView.js
 *
 *  Created on 12/14/17
 *
 */

if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/component/DataView'
], function () {
    'use strict';

    Common.UI.TreeViewModel = Common.UI.DataViewModel.extend({
        defaults: function() {
            return {
                id: Common.UI.getId(),
                name: '',
                isNotHeader: false,
                hasSubItems: false,
                hasParent: false,
                isEmptyItem: false,
                isExpanded: true,
                isVisible: true,
                selected: false,
                allowSelected: true,
                disabled: false,
                getTipFromName: true,
                level: 0,
                index: 0
            }
        }
    });

    Common.UI.TreeViewStore = Backbone.Collection.extend({
        model: Common.UI.TreeViewModel,

        expandSubItems: function(record) {
            var me = this;
            var _expand_sub_items = function(idx, expanded, level) {
                for (var i=idx+1; i<me.length; i++) {
                    var item = me.at(i);
                    var item_level = item.get('level');
                    if (item_level>level) {
                        if (expanded)
                            item.set('isVisible', true);
                        if (item.get('hasSubItems'))
                            i = _expand_sub_items(i, item.get('isExpanded'), item_level );
                    } else {
                        return (i-1);
                    }
                }
            };

            record.set('isExpanded', true);
            _expand_sub_items(record.get('index'), true, record.get('level'));
        },

        collapseSubItems: function(record) {
            var start_level = record.get('level'),
                index = record.get('index');
            for (var i=index+1; i<this.length; i++) {
                var item = this.at(i);
                var item_level = item.get('level');
                if (item_level>start_level) {
                    item.set('isVisible', false);
                } else {
                    break;
                }
            }
            return i-1;
        },

        expandAll: function() {
            this.each(function(item) {
                item.set('isExpanded', true);
                item.set('isVisible', true);
            });
        },

        collapseAll: function() {
            for (var i=0; i<this.length; i++) {
                var item = this.at(i);
                if (!item.get('isNotHeader')) {
                    item.set('isExpanded', false);
                    i = this.collapseSubItems(item);
                }
            }
        },

        expandToLevel: function(expandLevel) {
            var me = this;
            var _expand_sub_items = function(idx, level) {
                var parent = me.at(idx);
                parent.set('isExpanded', false);
                for (var i=idx+1; i<me.length; i++) {
                    var item = me.at(i);
                    var item_level = item.get('level');
                    if (item_level>level) {
                        if (item_level<=expandLevel)
                            parent.set('isExpanded', true);
                        item.set('isVisible', item_level<=expandLevel);
                        if (item.get('hasSubItems'))
                            i = _expand_sub_items(i, item_level );
                    } else {
                        return (i-1);
                    }
                }
            };

            for (var j=0; j<this.length; j++) {
                var item = this.at(j);
                if (item.get('level')<=expandLevel || !item.get('hasParent')) {
                    item.set('isVisible', true);
                    if (!item.get('isNotHeader'))
                        j = _expand_sub_items(j, item.get('level'));
                }
            }
        }
    });

    Common.UI.TreeView = Common.UI.DataView.extend((function() {
        return {
            options: {
                handleSelect: true,
                showLast: true,
                allowScrollbar: true,
                scrollAlwaysVisible: true,
                emptyItemText: '',
                keyMoveDirection: 'both',
                role: 'tree',
                roleItem: 'treeitem'
            },

            template: _.template([
                '<div class="treeview inner" style="<%= style %>" role="<%= options.role %>"></div>'
            ].join('')),

            initialize : function(options) {
                options.store = options.store || new Common.UI.TreeViewStore();
                options.emptyItemText = options.emptyItemText || '';
                options.itemTemplate = options.itemTemplate || (!Common.UI.isRTL() ? _.template([
                    '<div id="<%= id %>" class="tree-item <% if (!isVisible) { %>' + 'hidden' + '<% } %>" style="display: block;padding-left: <%= level*16 + 24 %>px;">',
                    '<% if (hasSubItems) { %>',
                        '<div class="tree-caret img-commonctrl ' + '<% if (!isExpanded) { %>' + 'up' + '<% } %>' + '" style="margin-left: <%= level*16 %>px;"></div>',
                    '<% } %>',
                    '<% if (isNotHeader) { %>',
                        '<div class="name not-header"><%= Common.Utils.String.htmlEncode(name) %></div>',
                    '<% } else if (isEmptyItem) { %>',
                        '<div class="name empty">' + options.emptyItemText + '</div>',
                    '<% } else { %>',
                        '<div class="name"><%= Common.Utils.String.htmlEncode(name) %></div>',
                    '<% } %>',
                    '</div>'
                ].join('')) : _.template([
                    '<div id="<%= id %>" class="tree-item <% if (!isVisible) { %>' + 'hidden' + '<% } %>" style="display: block;padding-right: <%= level*16 + 24 %>px;">',
                    '<% if (hasSubItems) { %>',
                        '<div class="tree-caret img-commonctrl ' + '<% if (!isExpanded) { %>' + 'up' + '<% } %>' + '" style="margin-right: <%= level*16 %>px;"></div>',
                    '<% } %>',
                    '<% if (isNotHeader) { %>',
                        '<div class="name not-header"><%= Common.Utils.String.htmlEncode(name) %></div>',
                    '<% } else if (isEmptyItem) { %>',
                        '<div class="name empty">' + options.emptyItemText + '</div>',
                    '<% } else { %>',
                        '<div class="name"><%= Common.Utils.String.htmlEncode(name) %></div>',
                    '<% } %>',
                    '</div>'
                ].join('')));
                Common.UI.DataView.prototype.initialize.call(this, options);
            },

            onAddItem: function(record, store, opts) {
                var view = new Common.UI.DataViewItem({
                    template: this.itemTemplate,
                    model: record,
                    role: this.options.roleItem,
                    tabindex: this.itemTabindex
                });

                if (view) {
                    var innerEl = (this.$el || $(this.el)).find('.inner').addBack().filter('.inner');
                    if (innerEl) {
                        (this.dataViewItems.length<1) && innerEl.find('.empty-text').remove();

                        if (opts && (typeof opts.at==='number')) {
                            var idx = opts.at;
                            var innerDivs = innerEl.find('> div');
                            if (idx > 0)
                                $(innerDivs.get(idx - 1)).after(view.render().el);
                            else {
                                (innerDivs.length > 0) ? $(innerDivs[idx]).before(view.render().el) : innerEl.append(view.render().el);
                            }
                            this.dataViewItems = this.dataViewItems.slice(0, idx).concat(view).concat(this.dataViewItems.slice(idx));
                        } else {
                            innerEl.append(view.render().el);
                            this.dataViewItems.push(view);
                        }

                        this.updateTip(view);
                        this.listenTo(view, 'change',      this.onChangeItem);
                        this.listenTo(view, 'remove',      this.onRemoveItem);
                        this.listenTo(view, 'click',       this.onClickItem);
                        this.listenTo(view, 'dblclick',    this.onDblClickItem);
                        this.listenTo(view, 'select',      this.onSelectItem);
                        this.listenTo(view, 'contextmenu', this.onContextMenuItem);

                        if (record.get('hasSubItems'))
                            view.$el.attr('aria-expanded', record.get('isExpanded'));
                        view.$el.attr('aria-level', record.get('level') + 1);

                        if (!this.isSuspendEvents)
                            this.trigger('item:add', this, view, record);
                    }
                }
            },

            onChangeItem: function (view, record) {
                if (record.get('hasSubItems'))
                    view.$el.attr('aria-expanded', record.get('isExpanded'));
                Common.UI.DataView.prototype.onChangeItem.call(this, view, record);
            },

            onClickItem: function(view, record, e) {
                var btn = $(e.target);
                if (btn && (btn.hasClass('tree-caret') || btn.hasClass('btn-tree-caret'))) {
                    var tip = view.$el.data('bs.tooltip');
                    if (tip) (tip.tip()).remove();

                    var isExpanded = !record.get('isExpanded');
                    record.set('isExpanded', isExpanded);
                    this.store[(isExpanded) ? 'expandSubItems' : 'collapseSubItems'](record);
                    this.scroller.update({minScrollbarLength: this.minScrollbarLength, alwaysVisibleY: this.scrollAlwaysVisible});
                    this.trigger('item:expand', record, isExpanded, !isExpanded);
                } else
                    Common.UI.DataView.prototype.onClickItem.call(this, view, record, e);
            },

            expandAll: function() {
                this.store.expandAll();
                this.scroller.update({minScrollbarLength: this.minScrollbarLength, alwaysVisibleY: this.scrollAlwaysVisible});
            },

            collapseAll: function() {
                this.store.collapseAll();
                this.scroller.update({minScrollbarLength: this.minScrollbarLength, alwaysVisibleY: this.scrollAlwaysVisible});
            },

            expandToLevel: function(expandLevel) {
                this.store.expandToLevel(expandLevel);
                this.scroller.update({minScrollbarLength: this.minScrollbarLength, alwaysVisibleY: this.scrollAlwaysVisible});
            },

            expandRecord: function(record) {
                if (record) {
                    var oldExpand = record.get('isExpanded');
                    record.set('isExpanded', true);
                    this.store.expandSubItems(record);
                    this.scroller.update({minScrollbarLength: this.minScrollbarLength, alwaysVisibleY: this.scrollAlwaysVisible});
                    this.trigger('item:expand', record, true, oldExpand);
                }
            },

            collapseRecord: function(record) {
                if (record) {
                    var oldExpand = record.get('isExpanded');
                    record.set('isExpanded', false);
                    this.store.collapseSubItems(record);
                    this.scroller.update({minScrollbarLength: this.minScrollbarLength, alwaysVisibleY: this.scrollAlwaysVisible});
                    this.trigger('item:expand', record, false, oldExpand);
                }
            },

            onKeyDown: function (e, data) {
                if ( this.disabled ) return;
                if (data===undefined) data = e;
                if (_.indexOf(this.moveKeys, data.keyCode)>-1 || data.keyCode==Common.UI.Keys.RETURN) {
                    data.preventDefault();
                    data.stopPropagation();
                    var rec = this.getSelectedRec();
                    if (this.lastSelectedRec===null)
                        this.lastSelectedRec = rec;
                    if (data.keyCode==Common.UI.Keys.RETURN) {
                        this.lastSelectedRec = null;
                        if (this.selectedBeforeHideRec) // only for ComboDataView menuPicker
                            rec = this.selectedBeforeHideRec;
                        this.trigger('item:click', this, this, rec, e);
                        this.trigger('item:select', this, this, rec, e);
                        this.trigger('entervalue', this, rec, e);
                        if (this.parentMenu)
                            this.parentMenu.hide();
                    } else {
                        var idx = _.indexOf(this.store.models, rec);
                        if (idx<0) {
                            if (data.keyCode==Common.UI.Keys.LEFT) {
                                var target = $(e.target).closest('.dropdown-submenu.over');
                                if (target.length>0) {
                                    target.removeClass('over');
                                    target.find('> a').focus();
                                } else
                                    idx = 0;
                            } else
                                idx = 0;
                        } else if (this.options.keyMoveDirection == 'both') {
                            var hasSubItems = rec.get('hasSubItems');
                            var hasParent = rec.get('hasParent');
                            var isExpanded = rec.get('isExpanded');
                            if (data.keyCode==Common.UI.Keys.LEFT) {
                                if (hasSubItems && isExpanded)
                                    this.collapseRecord(rec);
                            } else if (data.keyCode==Common.UI.Keys.RIGHT) {
                                if (hasSubItems && !isExpanded)
                                    this.expandRecord(rec);
                            } else {
                                if (data.keyCode==Common.UI.Keys.DOWN) {
                                    for (var i=idx+1; i<this.store.length; i++) {
                                        if (this.store.at(i).get('isVisible')) {
                                            idx=i;
                                            break;
                                        }
                                    }
                                } else if (data.keyCode==Common.UI.Keys.UP) {
                                    for (var i=idx-1; i>=0; i--) {
                                        if (this.store.at(i).get('isVisible')) {
                                            idx=i;
                                            break;
                                        }
                                    }
                                }
                            }
                        } else {
                            idx = (data.keyCode==Common.UI.Keys.UP || data.keyCode==Common.UI.Keys.LEFT)
                                ? Math.max(0, idx-1)
                                : Math.min(this.store.length - 1, idx + 1) ;
                        }

                        if (idx !== undefined && idx>=0) rec = this.store.at(idx);
                        if (rec) {
                            this._fromKeyDown = true;
                            this.selectRecord(rec);
                            this._fromKeyDown = false;
                            this.scrollToRecord(rec);
                            $('#' + rec.get('id')).parent().focus();
                        }
                    }
                } else {
                    this.trigger('item:keydown', this, rec, e);
                }
            },

            focus: function() {
                this.cmpEl && this.cmpEl.find('.treeview').focus();
            },

            updateTip: function(item) {
                var record = item.model,
                    name = record.get('name'),
                    me = this;

                record.get('getTipFromName') && record.set('tip', name.length > 37 - record.get('level')*2 ? name : '');

                var el = item.$el || $(item.el),
                    tip = el.data('bs.tooltip');
                if (tip)
                    tip.updateTitle(record.get('tip'));
                else if (record.get('tip') && el.attr('data-toggle')!=='tooltip') { // init tooltip
                    el.attr('data-toggle', 'tooltip');
                    if (this.delayRenderTips)
                        el.one('mouseenter', function(){
                            el.tooltip({
                                title       : record.get('tip'),
                                placement   : 'cursor',
                                zIndex : me.tipZIndex
                            });
                            el.mouseenter();
                        });
                    else {
                        el.tooltip({
                            title       : record.get('tip'),
                            placement   : 'cursor',
                            zIndex : me.tipZIndex
                        });
                    }
                }
            }
        }
    })());
});