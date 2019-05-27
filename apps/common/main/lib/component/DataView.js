/*
 *
 * (c) Copyright Ascensio System SIA 2010-2019
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
 *  DataView.js
 *
 *  A mechanism for displaying data using custom layout templates and formatting.
 *
 *  Created by Alexander Yuzhin on 1/24/14
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

/**
 * The View uses an template as its internal templating mechanism, and is bound to an
 * {@link Common.UI.DataViewStore} so that as the data in the store changes the view is automatically updated
 * to reflect the changes.
 *
 *  The example below binds a View to a {@link Common.UI.DataViewStore} and renders it into an el.
 *
 *      new Common.UI.DataView({
 *          el: $('#id'),
 *          store: new Common.UI.DataViewStore([{value: 1, value: 2}]),
 *          itemTemplate: _.template(['<li id="<%= id %>"><a href="#"><%= value %></a></li>'].join(''))
 *      });
 *
 *
 *  @property {Object} el
 *  Backbone el
 *
 *
 *  @property {Object} store
 *  The Store class encapsulates a client side cache of Model objects.
 *
 *
 *  @property {String} emptyText
 *  The text to display in the view when there is no data to display.
 *
 *
 *  @cfg {Object} itemTemplate
 *  The inner portion of the item template to be rendered.
 *
 */

if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Scroller'
], function () {
    'use strict';

    Common.UI.DataViewGroupModel = Backbone.Model.extend({
        defaults: function() {
            return {
                id: Common.UI.getId(),
                caption: '',
                inline: false,
                headername: undefined
            }
        }
    });

    Common.UI.DataViewGroupStore = Backbone.Collection.extend({
        model: Common.UI.DataViewGroupModel
    });

    Common.UI.DataViewModel = Backbone.Model.extend({
        defaults: function() {
            return {
                id: Common.UI.getId(),
                selected: false,
                allowSelected: true,
                value: null,
                disabled: false
            }
        }
    });

    Common.UI.DataViewStore = Backbone.Collection.extend({
        model: Common.UI.DataViewModel
    });

    Common.UI.DataViewItem = Common.UI.BaseView.extend({
        options : {
        },

        template: _.template([
            '<div id="<%= id %>"><%= value %></div>'
        ].join('')),

        initialize : function(options) {
            Common.UI.BaseView.prototype.initialize.call(this, options);

            var me = this;

            me.template = me.options.template || me.template;

            me.listenTo(me.model, 'change',             me.render);
            me.listenTo(me.model, 'change:selected',    me.onSelectChange);
            me.listenTo(me.model, 'remove',             me.remove);
        },

        render: function () {
            if (_.isUndefined(this.model.id))
                return this;

            var el = $(this.el);

            el.html(this.template(this.model.toJSON()));
            el.addClass('item');
            el.toggleClass('selected', this.model.get('selected') && this.model.get('allowSelected'));
            el.off('click dblclick contextmenu');
            el.on({ 'click': _.bind(this.onClick, this),
                'dblclick': _.bind(this.onDblClick, this),
                'contextmenu': _.bind(this.onContextMenu, this) });
            el.toggleClass('disabled', !!this.model.get('disabled'));

            if (!_.isUndefined(this.model.get('cls')))
                el.addClass(this.model.get('cls'));

            var tip = el.data('bs.tooltip');
            if (tip) {
                if (tip.dontShow===undefined)
                    tip.dontShow = true;
            }

            this.trigger('change', this, this.model);

            return this;
        },

        remove: function() {
            this.stopListening(this.model);
            this.trigger('remove', this, this.model);

            Common.UI.BaseView.prototype.remove.call(this);
        },

        onClick: function(e) {
            if (this.model.get('disabled')) return false;

            this.trigger('click', this, this.model, e);
        },

        onDblClick: function(e) {
            if (this.model.get('disabled')) return false;

            this.trigger('dblclick', this, this.model, e);
        },

        onContextMenu: function(e) {
            this.trigger('contextmenu', this, this.model, e);
        },

        onSelectChange: function(model, selected) {
            this.trigger('select', this, model, selected);
        }
    });

    Common.UI.DataView = Common.UI.BaseView.extend({
        options : {
            multiSelect: false,
            handleSelect: true,
            enableKeyEvents: true,
            keyMoveDirection: 'both', // 'vertical', 'horizontal'
            restoreHeight: 0,
            emptyText: '',
            listenStoreEvents: true,
            allowScrollbar: true,
            scrollAlwaysVisible: false,
            showLast: true,
            useBSKeydown: false
        },

        template: _.template([
            '<div class="dataview inner" style="<%= style %>">',
                '<% _.each(groups, function(group) { %>',
                    '<% if (group.headername !== undefined) { %>',
                        '<div class="header-name"><%= group.headername %></div>',
                    '<% } %>',
                    '<div class="grouped-data <% if (group.inline) { %> inline <% } %> <% if (!_.isEmpty(group.caption)) { %> margin <% } %>" id="<%= group.id %>">',
                        '<% if (!_.isEmpty(group.caption)) { %>',
                            '<div class="group-description">',
                                '<span><%= group.caption %></span>',
                            '</div>',
                        '<% } %>',
                        '<div class="group-items-container">',
                        '</div>',
                    '</div>',
                '<% }); %>',
            '</div>'
        ].join('')),

        initialize : function(options) {
            Common.UI.BaseView.prototype.initialize.call(this, options);

            var me = this;

            me.template       = me.options.template       || me.template;
            me.store          = me.options.store          || new Common.UI.DataViewStore();
            me.groups         = me.options.groups         || null;
            me.itemTemplate   = me.options.itemTemplate   || null;
            me.multiSelect    = me.options.multiSelect;
            me.handleSelect   = me.options.handleSelect;
            me.parentMenu     = me.options.parentMenu;
            me.enableKeyEvents= me.options.enableKeyEvents;
            me.useBSKeydown   = me.options.useBSKeydown; // only with enableKeyEvents && parentMenu
            me.showLast       = me.options.showLast;
            me.style          = me.options.style        || '';
            me.emptyText      = me.options.emptyText    || '';
            me.listenStoreEvents= (me.options.listenStoreEvents!==undefined) ? me.options.listenStoreEvents : true;
            me.allowScrollbar = (me.options.allowScrollbar!==undefined) ? me.options.allowScrollbar : true;
            me.scrollAlwaysVisible = me.options.scrollAlwaysVisible || false;
            if (me.parentMenu)
                me.parentMenu.options.restoreHeight = (me.options.restoreHeight>0);
            me.rendered       = false;
            me.dataViewItems = [];
            if (me.options.keyMoveDirection=='vertical')
                me.moveKeys = [Common.UI.Keys.UP, Common.UI.Keys.DOWN];
            else if (me.options.keyMoveDirection=='horizontal')
                me.moveKeys = [Common.UI.Keys.LEFT, Common.UI.Keys.RIGHT];
            else
                me.moveKeys = [Common.UI.Keys.UP, Common.UI.Keys.DOWN, Common.UI.Keys.LEFT, Common.UI.Keys.RIGHT];

            if (me.options.el)
                me.render();
        },

        render: function (parentEl) {
            var me = this;

            this.trigger('render:before', this);

            this.cmpEl = $(this.el);
            if (parentEl) {
                this.setElement(parentEl, false);
                this.cmpEl = $(this.template({
                    groups: me.groups ? me.groups.toJSON() : null,
                    style: me.style
                }));

                parentEl.html(this.cmpEl);
            } else {
                this.cmpEl.html(this.template({
                    groups: me.groups ? me.groups.toJSON() : null,
                    style: me.style
                }));
            }

            var modalParents = this.cmpEl.closest('.asc-window');
            if (modalParents.length < 1)
                modalParents = this.cmpEl.closest('[id^="menu-container-"]'); // context menu
            if (modalParents.length > 0) {
                this.tipZIndex = parseInt(modalParents.css('z-index')) + 10;
            }

            if (!this.rendered) {
                if (this.listenStoreEvents) {
                    this.listenTo(this.store, 'add',    this.onAddItem);
                    this.listenTo(this.store, 'reset',  this.onResetItems);
                }
                this.onResetItems();

                if (this.parentMenu) {
                    this.cmpEl.closest('li').css('height', '100%');
                    this.cmpEl.css('height', '100%');
                    this.parentMenu.on('show:after', _.bind(this.alignPosition, this));
                }

                if (this.enableKeyEvents && this.parentMenu && this.handleSelect) {
                    if (!me.showLast)
                        this.parentMenu.on('show:before', function(menu) { me.deselectAll(); });
                    this.parentMenu.on('show:after', function(menu) {
                        if (me.showLast) me.showLastSelected(); 
                        Common.NotificationCenter.trigger('dataview:focus');
                        _.delay(function() {
                            menu.cmpEl.find('.dataview').focus();
                        }, 10);
                    }).on('hide:after', function() {
                        Common.NotificationCenter.trigger('dataview:blur');
                    });
                }
            }

            if (_.isUndefined(this.scroller) && this.allowScrollbar) {
                this.scroller = new Common.UI.Scroller({
                    el: $(this.el).find('.inner').addBack().filter('.inner'),
                    useKeyboard: this.enableKeyEvents && !this.handleSelect,
                    minScrollbarLength  : 40,
                    wheelSpeed: 10,
                    alwaysVisibleY: this.scrollAlwaysVisible
                });
            }

            this.rendered = true;

            this.cmpEl.on('click', function(e){
                if (/dataview/.test(e.target.className)) return false;
            });

            this.trigger('render:after', this);
            return this;
        },

        setStore: function(store) {
            if (store) {
                this.stopListening(this.store);

                this.store = store;

                if (this.listenStoreEvents) {
                    this.listenTo(this.store, 'add',    this.onAddItem);
                    this.listenTo(this.store, 'reset',  this.onResetItems);
                }
            }
        },

        selectRecord: function(record, suspendEvents) {
            if (!this.handleSelect)
                return;

            if (suspendEvents)
                this.suspendEvents();

            if (!this.multiSelect) {
                _.each(this.store.where({selected: true}), function(rec){
                    rec.set({selected: false});
                });

                if (record)
                    record.set({selected: true});
            } else {
                if (record)
                    record.set({selected: !record.get('selected')});
            }

            if (suspendEvents)
                this.resumeEvents();
            return record;
        },

        selectByIndex: function(index, suspendEvents) {
            if (this.store.length > 0 && index > -1 && index < this.store.length) {
                return this.selectRecord(this.store.at(index), suspendEvents);
            }
        },

        deselectAll: function(suspendEvents) {
            if (suspendEvents)
                this.suspendEvents();

            _.each(this.store.where({selected: true}), function(record){
                record.set({selected: false});
            });

            if (suspendEvents)
                this.resumeEvents();
        },

        getSelectedRec: function() {
            if (this.multiSelect) {

                var items = [];
                _.each(this.store.where({selected: true}), function(rec){
                    items.push(rec);
                });

                return items;
            }

            return this.store.where({selected: true});
        },

        onAddItem: function(record, store, opts) {
            var view = new Common.UI.DataViewItem({
                template: this.itemTemplate,
                model: record
            });

            if (view) {
                var innerEl = $(this.el).find('.inner').addBack().filter('.inner');

                if (this.groups && this.groups.length > 0) {
                    var group = this.groups.findWhere({id: record.get('group')});

                    if (group) {
                        innerEl = innerEl.find('#' + group.id + ' ' + '.group-items-container');
                    }
                }

                if (innerEl) {
                    if (opts && opts.at == 0)
                        innerEl.prepend(view.render().el); else
                        innerEl.append(view.render().el);

                    (this.dataViewItems.length<1) && innerEl.find('.empty-text').remove();
                    var idx = _.indexOf(this.store.models, record);
                    this.dataViewItems = this.dataViewItems.slice(0, idx).concat(view).concat(this.dataViewItems.slice(idx));

                    if (record.get('tip')) {
                        var view_el = $(view.el);
                        view_el.attr('data-toggle', 'tooltip');
                        view_el.tooltip({
                            title       : record.get('tip'),
                            placement   : 'cursor',
                            zIndex : this.tipZIndex
                        });
                    }

                    this.listenTo(view, 'change',      this.onChangeItem);
                    this.listenTo(view, 'remove',      this.onRemoveItem);
                    this.listenTo(view, 'click',       this.onClickItem);
                    this.listenTo(view, 'dblclick',    this.onDblClickItem);
                    this.listenTo(view, 'select',      this.onSelectItem);
                    this.listenTo(view, 'contextmenu', this.onContextMenuItem);

                    if (!this.isSuspendEvents)
                        this.trigger('item:add', this, view, record);
                }
            }
        },

        onResetItems: function() {
            _.each(this.dataViewItems, function(item) {
                var tip = item.$el.data('bs.tooltip');
                if (tip) {
                    if (tip.dontShow===undefined)
                        tip.dontShow = true;
                    (tip.tip()).remove();
                }
            }, this);

            $(this.el).html(this.template({
                groups: this.groups ? this.groups.toJSON() : null,
                style: this.style
            }));

            if (!_.isUndefined(this.scroller)) {
                this.scroller.destroy();
                delete this.scroller;
            }

            if (this.store.length < 1 && this.emptyText.length > 0)
                $(this.el).find('.inner').addBack().filter('.inner').append('<table cellpadding="10" class="empty-text"><tr><td>' + this.emptyText + '</td></tr></table>');

            _.each(this.dataViewItems, function(item) {
                this.stopListening(item);
                item.stopListening(item.model);
            }, this);
            this.dataViewItems = [];

            this.store.each(this.onAddItem, this);

            if (this.allowScrollbar) {
                this.scroller = new Common.UI.Scroller({
                    el: $(this.el).find('.inner').addBack().filter('.inner'),
                    useKeyboard: this.enableKeyEvents && !this.handleSelect,
                    minScrollbarLength  : 40,
                    wheelSpeed: 10,
                    alwaysVisibleY: this.scrollAlwaysVisible
                });
            }

            if (this.disabled)
                this.setDisabled(this.disabled);

            this.attachKeyEvents();
            this.lastSelectedRec = null;
            this._layoutParams = undefined;
        },

        onChangeItem: function(view, record) {
            if (!this.isSuspendEvents) {
                this.trigger('item:change', this, view, record);
            }
        },

        onRemoveItem: function(view, record) {
            var tip = view.$el.data('bs.tooltip');
            if (tip) {
                if (tip.dontShow===undefined)
                    tip.dontShow = true;
                (tip.tip()).remove();
            }
            this.stopListening(view);
            view.stopListening();

            if (this.store.length < 1 && this.emptyText.length > 0) {
                var el = $(this.el).find('.inner').addBack().filter('.inner');
                if ( el.find('.empty-text').length<=0 )
                    el.append('<table cellpadding="10" class="empty-text"><tr><td>' + this.emptyText + '</td></tr></table>');
            }

            for (var i=0; i < this.dataViewItems.length; i++) {
                if (_.isEqual(view, this.dataViewItems[i]) ) {
                    this.dataViewItems.splice(i, 1);
                    break;
                }
            }

            if (!this.isSuspendEvents) {
                this.trigger('item:remove', this, view, record);
            }
        },

        onClickItem: function(view, record, e) {
            if ( this.disabled ) return;

            window._event = e;  //  for FireFox only

            if (this.showLast) this.selectRecord(record);
            this.lastSelectedRec = null;

            var tip = view.$el.data('bs.tooltip');
            if (tip) (tip.tip()).remove();

            if (!this.isSuspendEvents) {
                this.trigger('item:click', this, view, record, e);
            }
        },

        onDblClickItem: function(view, record, e) {
            if ( this.disabled ) return;

            window._event = e;  //  for FireFox only

            if (this.showLast) this.selectRecord(record);
            this.lastSelectedRec = null;

            if (!this.isSuspendEvents) {
                this.trigger('item:dblclick', this, view, record, e);
            }
        },

        onSelectItem: function(view, record, selected) {
            if (!this.isSuspendEvents) {
                this.trigger(selected ? 'item:select' : 'item:deselect', this, view, record, this._fromKeyDown);
            }
        },

        onContextMenuItem: function(view, record, e) {
            if (!this.isSuspendEvents) {
                this.trigger('item:contextmenu', this, view, record, e);
            }
        },

        scrollToRecord: function (record) {
            if (!record) return;
            var innerEl = $(this.el).find('.inner'),
                inner_top = innerEl.offset().top,
                idx = _.indexOf(this.store.models, record),
                div = (idx>=0 && this.dataViewItems.length>idx) ? $(this.dataViewItems[idx].el) : innerEl.find('#' + record.get('id'));
            if (div.length<=0) return;
            
            var div_top = div.offset().top,
                div_first = $(this.dataViewItems[0].el),
                div_first_top = (div_first.length>0) ? div_first[0].offsetTop : 0;
            if (div_top < inner_top + div_first_top || div_top+div.outerHeight() > inner_top + innerEl.height()) {
                if (this.scroller && this.allowScrollbar) {
                    this.scroller.scrollTop(innerEl.scrollTop() + div_top - inner_top - div_first_top, 0);
                } else {
                    innerEl.scrollTop(innerEl.scrollTop() + div_top - inner_top - div_first_top);
                }
            }
        },

        onKeyDown: function (e, data) {
            if ( this.disabled ) return;
            if (data===undefined) data = e;
            if (_.indexOf(this.moveKeys, data.keyCode)>-1 || data.keyCode==Common.UI.Keys.RETURN) {
                data.preventDefault();
                data.stopPropagation();
                var rec = this.getSelectedRec()[0];
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
                        if (this._layoutParams === undefined)
                            this.fillIndexesArray();
                        var topIdx = this.dataViewItems[idx].topIdx,
                            leftIdx = this.dataViewItems[idx].leftIdx;

                        idx = undefined;
                        if (data.keyCode==Common.UI.Keys.LEFT) {
                            while (idx===undefined) {
                                leftIdx--;
                                if (leftIdx<0) {
                                    var target = $(e.target).closest('.dropdown-submenu.over');
                                    if (target.length>0) {
                                        target.removeClass('over');
                                        target.find('> a').focus();
                                        break;
                                    } else
                                        leftIdx = this._layoutParams.columns-1;
                                }
                                idx = this._layoutParams.itemsIndexes[topIdx][leftIdx];
                            }
                        } else if (data.keyCode==Common.UI.Keys.RIGHT) {
                            while (idx===undefined) {
                                leftIdx++;
                                if (leftIdx>this._layoutParams.columns-1) leftIdx = 0;
                                idx = this._layoutParams.itemsIndexes[topIdx][leftIdx];
                            }
                        } else if (data.keyCode==Common.UI.Keys.UP) {
                            while (idx===undefined) {
                                topIdx--;
                                if (topIdx<0) topIdx = this._layoutParams.rows-1;
                                idx = this._layoutParams.itemsIndexes[topIdx][leftIdx];
                            }
                        } else {
                            while (idx===undefined) {
                                topIdx++;
                                if (topIdx>this._layoutParams.rows-1) topIdx = 0;
                                idx = this._layoutParams.itemsIndexes[topIdx][leftIdx];
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
                    }
                }
            } else {
                this.trigger('item:keydown', this, rec, e);
            }
        },

        attachKeyEvents: function() {
            if (this.enableKeyEvents && this.handleSelect) {
                var el = $(this.el).find('.inner').addBack().filter('.inner');
                el.addClass('canfocused');
                el.attr('tabindex', '0');
                el.on((this.parentMenu && this.useBSKeydown) ? 'dataview:keydown' : 'keydown', _.bind(this.onKeyDown, this));
            }
        },

        showLastSelected: function() {
            if ( this.lastSelectedRec) {
                this.selectRecord(this.lastSelectedRec, true);
                this.scrollToRecord(this.lastSelectedRec);
                this.lastSelectedRec = null;
            } else {
                var rec = this.getSelectedRec()[0];
                if (rec) this.scrollToRecord(rec);
            }
        },

        setDisabled: function(disabled) {
            this.disabled = disabled;
            $(this.el).find('.inner').addBack().filter('.inner').toggleClass('disabled', disabled);
        },

        isDisabled: function() {
            return this.disabled;
        },

        setEmptyText: function(emptyText) {
            this.emptyText = emptyText;
        },

        alignPosition: function() {
            var menuRoot = (this.parentMenu.cmpEl.attr('role') === 'menu')
                            ? this.parentMenu.cmpEl
                            : this.parentMenu.cmpEl.find('[role=menu]'),
                docH = Common.Utils.innerHeight()-10,
                innerEl = $(this.el).find('.inner').addBack().filter('.inner'),
                parent = innerEl.parent(),
                margins =  parseInt(parent.css('margin-top')) + parseInt(parent.css('margin-bottom')) + parseInt(menuRoot.css('margin-top')),
                paddings = parseInt(menuRoot.css('padding-top')) + parseInt(menuRoot.css('padding-bottom')),
                menuH = menuRoot.outerHeight(),
                top = parseInt(menuRoot.css('top')),
                props = {minScrollbarLength  : 40};
            this.scrollAlwaysVisible && (props.alwaysVisibleY = this.scrollAlwaysVisible);

            if (top + menuH > docH ) {
                innerEl.css('max-height', (docH - top - paddings - margins) + 'px');
                if (this.allowScrollbar) this.scroller.update(props);
            } else if ( top + menuH < docH && innerEl.height() < this.options.restoreHeight ) {
                innerEl.css('max-height', (Math.min(docH - top - paddings - margins, this.options.restoreHeight)) + 'px');
                if (this.allowScrollbar) this.scroller.update(props);
            }
        },

        fillIndexesArray: function() {
            if (this.dataViewItems.length<=0) return;

            this._layoutParams = {
                itemsIndexes:   [],
                columns:        0,
                rows:           0
            };

            var el = $(this.dataViewItems[0].el),
                itemW = el.outerWidth() + parseInt(el.css('margin-left')) + parseInt(el.css('margin-right')),
                offsetLeft = this.$el.offset().left,
                offsetTop = el.offset().top,
                prevtop = -1, topIdx = 0, leftIdx = 0;

            for (var i=0; i<this.dataViewItems.length; i++) {
                var top = $(this.dataViewItems[i].el).offset().top - offsetTop;
                leftIdx = Math.floor(($(this.dataViewItems[i].el).offset().left - offsetLeft)/itemW);
                if (top>prevtop) {
                    prevtop = top;
                    this._layoutParams.itemsIndexes.push([]);
                    topIdx = this._layoutParams.itemsIndexes.length-1;
                }
                this._layoutParams.itemsIndexes[topIdx][leftIdx] = i;
                this.dataViewItems[i].topIdx = topIdx;
                this.dataViewItems[i].leftIdx = leftIdx;
                if (this._layoutParams.columns<leftIdx) this._layoutParams.columns = leftIdx;
            }
            this._layoutParams.rows = this._layoutParams.itemsIndexes.length;
            this._layoutParams.columns++;
        },

        onResize: function() {
            this._layoutParams = undefined;
        }
    });

    $(document).on('keydown.dataview', '[data-toggle=dropdown], [role=menu]',  function(e) {
        if (e.keyCode !== Common.UI.Keys.UP && e.keyCode !== Common.UI.Keys.DOWN && e.keyCode !== Common.UI.Keys.LEFT && e.keyCode !== Common.UI.Keys.RIGHT && e.keyCode !== Common.UI.Keys.RETURN) return;

        _.defer(function(){
            var target = $(e.target).closest('.dropdown-toggle');
            if (target.length)
                target.parent().find('.inner.canfocused').trigger('dataview:keydown', e);
            else {
                $(e.target).closest('.dropdown-submenu').find('.inner.canfocused').trigger('dataview:keydown', e);
            }
        }, 100);
    });
});