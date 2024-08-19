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
 *  DataView.js
 *
 *  A mechanism for displaying data using custom layout templates and formatting.
 *
 *  Created on 1/24/14
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
            me.dataHint = me.options.dataHint || '';
            me.dataHintDirection = me.options.dataHintDirection || '';
            me.dataHintOffset = me.options.dataHintOffset || '';
            me.scaling = me.options.scaling;

            me.listenTo(me.model, 'change', this.model.get('skipRenderOnChange') ? me.onChange : me.render);
            me.listenTo(me.model, 'change:selected',    me.onSelectChange);
            me.listenTo(me.model, 'change:tip',         me.onTipChange);
            me.listenTo(me.model, 'remove',             me.remove);
        },

        render: function () {
            if (_.isUndefined(this.model.id))
                return this;

            var el = this.$el || $(this.el);

            el.html(this.template(this.model.toJSON()));
            el.addClass('item canfocused');
            el.toggleClass('selected', this.model.get('selected') && this.model.get('allowSelected'));
            el.attr('tabindex', this.options.tabindex || 0);
            el.attr('role', this.options.role ? this.options.role : 'listitem');
            
            if (this.dataHint !== '') {
                el.attr('data-hint', this.dataHint);
                el.attr('data-hint-direction', this.dataHintDirection);
                el.attr('data-hint-offset', this.dataHintOffset);
            }
            if (!_.isUndefined(this.model.get('contentTarget')))
                el.attr('content-target', this.model.get('contentTarget'));

            el.off('click dblclick contextmenu');
            el.on({ 'click': _.bind(this.onClick, this),
                'dblclick': _.bind(this.onDblClick, this),
                'contextmenu': _.bind(this.onContextMenu, this) });
            el.toggleClass('disabled', !!this.model.get('disabled'));

            if (!_.isUndefined(this.model.get('cls')))
                el.addClass(this.model.get('cls'));

            var tip = el.data('bs.tooltip');
            if (tip) {
                if (tip.dontShow===undefined && el.is(':hover'))
                    tip.dontShow = true;
            }

            if (this.scaling !== false && el.find('.options__icon').length) {
                el.attr('ratio', 'ratio');
                this.applyScaling(Common.UI.Scaling.currentRatio());

                el.on('app:scaling', _.bind(function (e, info) {
                    if ( this.scaling != info.ratio ) {
                        this.applyScaling(info.ratio);
                    }
                }, this));
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
        },

        onTipChange: function (model, tip) {
            this.trigger('tipchange', this, model);
        },

        onChange: function () {
            if (_.isUndefined(this.model.id))
                return this;
            var el = this.$el || $(this.el);
            el.toggleClass('selected', this.model.get('selected') && this.model.get('allowSelected'));
            el.toggleClass('disabled', !!this.model.get('disabled'));

            this.trigger('change', this, this.model);

            return this;
        },

        applyScaling: function (ratio) {
            this.scaling = ratio;

            if (ratio > 2) {
                var el = this.$el || $(this.el),
                    icon = el.find('.options__icon');
                if (icon.length > 0) {
                    if (!el.find('svg.icon').length) {
                        var iconCls = icon.attr('class'),
                            re_icon_name = /btn-[^\s]+/.exec(iconCls),
                            icon_name = re_icon_name ? re_icon_name[0] : "null",
                            svg_icon = '<svg class="icon"><use class="zoom-int" href="#%iconname"></use></svg>'.replace('%iconname', icon_name);
                        icon.after(svg_icon);
                    }
                }
            }
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
            minScrollbarLength: 40,
            scrollYStyle: null,
            showLast: true,
            useBSKeydown: false,
            cls: '',
            role: 'list'
        },

        template: _.template([
            '<div class="dataview inner <%= cls %>" style="<%= style %>" role="<%= options.role %>">',
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
            me.itemDataHint   = me.options.itemDataHint   || '';
            me.itemDataHintDirection = me.options.itemDataHintDirection || '';
            me.itemDataHintOffset = me.options.itemDataHintOffset || '';
            me.multiSelect    = me.options.multiSelect;
            me.handleSelect   = me.options.handleSelect;
            me.parentMenu     = me.options.parentMenu;
            me.outerMenu      = me.options.outerMenu;
            me.enableKeyEvents= me.options.enableKeyEvents;
            me.useBSKeydown   = me.options.useBSKeydown; // only with enableKeyEvents && parentMenu
            me.showLast       = me.options.showLast;
            me.style          = me.options.style        || '';
            me.cls            = me.options.cls          || '';
            me.emptyText      = me.options.emptyText    || '';
            me.listenStoreEvents= (me.options.listenStoreEvents!==undefined) ? me.options.listenStoreEvents : true;
            me.allowScrollbar = (me.options.allowScrollbar!==undefined) ? me.options.allowScrollbar : true;
            me.scrollAlwaysVisible = me.options.scrollAlwaysVisible || false;
            me.minScrollbarLength = me.options.minScrollbarLength || 40;
            me.scrollYStyle    = me.options.scrollYStyle;
            me.tabindex = me.options.tabindex || 0;
            me.itemTabindex = me.options.itemTabindex!==undefined ? me.options.itemTabindex : me.tabindex>0 ? -1 : 0; //do not set focus to items when dataview get focus
            me.delayRenderTips = me.options.delayRenderTips || false;
            if (me.parentMenu)
                me.parentMenu.options.restoreHeight = (me.options.restoreHeight>0);
            me.delaySelect = me.options.delaySelect || false;
            me.rendered       = false;
            me.dataViewItems = [];
            if (me.options.keyMoveDirection=='vertical')
                me.moveKeys = [Common.UI.Keys.UP, Common.UI.Keys.DOWN];
            else if (me.options.keyMoveDirection=='horizontal')
                me.moveKeys = [Common.UI.Keys.LEFT, Common.UI.Keys.RIGHT];
            else
                me.moveKeys = [Common.UI.Keys.UP, Common.UI.Keys.DOWN, Common.UI.Keys.LEFT, Common.UI.Keys.RIGHT];

            if ( me.options.scaling === false) {
                me.cls = me.options.cls + ' scaling-off';
            }

            if (me.options.el)
                me.render();
        },

        render: function (parentEl) {
            var me = this;

            this.trigger('render:before', this);

            if (parentEl) {
                this.setElement(parentEl, false);
                this.cmpEl = $(this.template({
                    groups: me.groups ? me.groups.toJSON() : null,
                    style: me.style,
                    cls: me.cls,
                    options: me.options
                }));

                parentEl.html(this.cmpEl);
            } else {
                this.cmpEl = me.$el || $(this.el);
                this.cmpEl.html(this.template({
                    groups: me.groups ? me.groups.toJSON() : null,
                    style: me.style,
                    cls: me.cls,
                    options: me.options
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
                    if (this.groups) {
                        this.listenTo(this.groups, 'add',  this.onAddGroup);
                        this.listenTo(this.groups, 'remove',  this.onRemoveGroup);
                    }
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
                    this.parentMenu.on('show:after', function(menu, e) {
                        if (e && (menu.el !== e.target)) return;
                        if (me.showLast) me.showLastSelected();
                        if (me.outerMenu && (me.outerMenu.focusOnShow===false)) return;
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
                    minScrollbarLength  : this.minScrollbarLength,
                    scrollYStyle: this.scrollYStyle,
                    wheelSpeed: 10,
                    alwaysVisibleY: this.scrollAlwaysVisible
                });
            }

            this.rendered = true;

            (this.$el || $(this.el)).on('click', function(e){
                if (/dataview|grouped-data|group-items-container/.test(e.target.className) || $(e.target).closest('.group-description').length>0) return false;
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
            this.extremeSeletedRec = record;
            if (!this.multiSelect || ( !this.pressedShift && !this.pressedCtrl) || !this.currentSelectedRec || (this.pressedShift && this.currentSelectedRec == record)) {
                _.each(this.store.where({selected: true}), function(rec){
                    rec.set({selected: false});
                });

                if (record) {
                    record.set({selected: true});
                    this.currentSelectedRec = record;
                }
            } else {
                if (record) {
                    if(this.pressedCtrl) {
                        record.set({selected: !record.get('selected')});
                        this.currentSelectedRec = record;
                    }
                    else if(this.pressedShift){
                        var me =this;
                        var inRange=false;
                        _.each(me.store.models, function(rec){
                            if(me.currentSelectedRec == rec || record == rec){
                                inRange = !inRange;
                                rec.set({selected: true});
                            }
                            else {
                                rec.set({selected: (inRange)});
                            }
                        });
                    }
                }
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
            this.lastSelectedRec = null;

            if (suspendEvents)
                this.resumeEvents();
        },

        getSelectedRec: function() {
            return (this.multiSelect) ? this.store.where({selected: true}) : this.store.findWhere({selected: true});
        },

        onAddItem: function(record, store, opts) {
            var view = new Common.UI.DataViewItem({
                template: this.itemTemplate,
                model: record,
                scaling: this.options.scaling,
                dataHint: this.itemDataHint,
                dataHintDirection: this.itemDataHintDirection,
                dataHintOffset: this.itemDataHintOffset,
                tabindex: this.itemTabindex
            });

            if (view) {
                var innerEl = $(this.el).find('.inner').addBack().filter('.inner');

                if (this.groups && this.groups.length > 0) {
                    var group = this.groups.findWhere({id: record.get('group')});

                    if (group) {
                        innerEl = innerEl.find('#' + group.id + ' ' + '.group-items-container');
                    }
                }

                var idx = _.indexOf(this.store.models, record);
                if (innerEl) {
                    if (opts && (typeof opts.at==='number') && opts.at >= 0) {
                        if (opts.at == 0) {
                            innerEl.prepend(view.render().el);
                        } else if (!(this.groups && this.groups.length > 0)) { // for dataview without groups
                            var innerDivs = innerEl.find('> div');
                            if (idx > 0)
                                $(innerDivs.get(idx - 1)).after(view.render().el);
                            else {
                                (innerDivs.length > 0) ? $(innerDivs[idx]).before(view.render().el) : innerEl.append(view.render().el);
                            }
                        } else
                            innerEl.append(view.render().el);
                    } else
                        innerEl.append(view.render().el);

                    (this.dataViewItems.length<1) && innerEl.find('.empty-text').remove();
                    this.dataViewItems = this.dataViewItems.slice(0, idx).concat(view).concat(this.dataViewItems.slice(idx));

                    var me = this,
                        view_el = $(view.el),
                        tip = record.get('tip');
                    if (tip!==undefined && tip!==null) {
                        if (this.delayRenderTips) {
                            view_el.one('mouseenter', function () { // hide tooltip when mouse is over menu
                                view_el.attr('data-toggle', 'tooltip');
                                view_el.tooltip({
                                    title       : record.get('tip'), // use actual tip, because it can be changed
                                    placement   : 'cursor',
                                    zIndex : me.tipZIndex
                                });
                                view_el.mouseenter();
                            });
                            view_el.attr('aria-label', record.get('tip'));
                        } else {
                            view_el.attr('data-toggle', 'tooltip');
                            view_el.tooltip({
                                title       : record.get('tip'), // use actual tip, because it can be changed
                                placement   : 'cursor',
                                zIndex : me.tipZIndex
                            });
                            view_el.attr('aria-label', record.get('tip'));
                        }
                    }

                    this.listenTo(view, 'change',      this.onChangeItem);
                    this.listenTo(view, 'remove',      this.onRemoveItem);
                    this.listenTo(view, 'click',       this.onClickItem);
                    this.listenTo(view, 'dblclick',    this.onDblClickItem);
                    this.listenTo(view, 'select',      this.onSelectItem);
                    this.listenTo(view, 'contextmenu', this.onContextMenuItem);
                    if (tip === null || tip === undefined)
                        this.listenTo(view, 'tipchange', this.onInitItemTip);

                    if (!this.isSuspendEvents)
                        this.trigger('item:add', this, view, record);
                }
            }
            this._layoutParams = undefined;
        },

        onAddGroup: function(group) {
            var el = $(_.template([
                '<% if (group.headername !== undefined) { %>',
                '<div class="header-name"><%= group.headername %></div>',
                '<% } %>',
                '<div class="grouped-data <% if (group.inline) { %> group.inline <% } %> <% if (!_.isEmpty(group.caption)) { %> margin <% } %>" id="<%= group.id %>">',
                '<% if (!_.isEmpty(group.caption)) { %>',
                    '<div class="group-description">',
                        '<span><%= group.caption %></span>',
                    '</div>',
                '<% } %>',
                    '<div class="group-items-container">',
                    '</div>',
                '</div>'
            ].join(''))({
                group: group.toJSON()
            }));
            var innerEl = $(this.el).find('.inner').addBack().filter('.inner');
            if (innerEl) {
                var idx = _.indexOf(this.groups.models, group);
                var innerDivs = innerEl.find('.grouped-data');
                if (idx > 0)
                    $(innerDivs.get(idx - 1)).after(el);
                else {
                    (innerDivs.length > 0) ? $(innerDivs[idx]).before(el) : innerEl.append(el);
                }
            }
        },

        onRemoveGroup: function(group) {
            var innerEl = $(this.el).find('.inner').addBack().filter('.inner');
            if (innerEl) {
                var div = innerEl.find('#' + group.get('id') + '.grouped-data');
                div && div.remove();
            }
            this._layoutParams = undefined;
        },

        onResetItems: function() {
            this.trigger('reset:before', this);

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
                style: this.style,
                cls: this.cls,
                options: this.options
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

            var me = this;
            this.store.each(function(item){
                me.onAddItem(item, me.store);
            }, this);

            if (this.allowScrollbar) {
                this.scroller = new Common.UI.Scroller({
                    el: $(this.el).find('.inner').addBack().filter('.inner'),
                    useKeyboard: this.enableKeyEvents && !this.handleSelect,
                    minScrollbarLength  : this.minScrollbarLength,
                    scrollYStyle: this.scrollYStyle,
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

        onInitItemTip: function (view, record) {
            var me = this,
                view_el = $(view.el),
                tip = view_el.data('bs.tooltip');
            if (!(tip === null || tip === undefined))
                view_el.removeData('bs.tooltip');
            if (this.delayRenderTips) {
                view_el.one('mouseenter', function () {
                    view_el.attr('data-toggle', 'tooltip');
                    view_el.tooltip({
                        title: record.get('tip'),
                        placement: 'cursor',
                        zIndex: me.tipZIndex
                    });
                    view_el.mouseenter();
                });
                view_el.attr('aria-label', record.get('tip'));
            } else {
                view_el.attr('data-toggle', 'tooltip');
                view_el.tooltip({
                    title: record.get('tip'),
                    placement: 'cursor',
                    zIndex: me.tipZIndex
                });
                view_el.attr('aria-label', record.get('tip'));
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
            this._layoutParams = undefined;
        },

        onClickItem: function(view, record, e) {
            if ( this.disabled ) return;

            window._event = e;  //  for FireFox only

            if(this.multiSelect) {
                if (e && e.ctrlKey) {
                    this.pressedCtrl = true;
                } else if (e && e.shiftKey) {
                    this.pressedShift = true;
                }
            }

            if (this.showLast) {
                if (!this.delaySelect) {
                    this.selectRecord(record);
                } else {
                    _.each(this.store.where({selected: true}), function(rec){
                        rec.set({selected: false});
                    });
                    if (record) {
                        setTimeout(_.bind(function () {
                            record.set({selected: true});
                            this.trigger('item:click', this, view, record, e);
                        }, this), 300);
                    }
                }
            }
            this.lastSelectedRec = null;

            var tip = view.$el.data('bs.tooltip');
            if (tip) (tip.tip()).remove();

            if (!this.isSuspendEvents) {
                if (!this.delaySelect) {
                    this.trigger('item:click', this, view, record, e);
                }
            }
        },

        onDblClickItem: function(view, record, e) { // item inner element must have css props: pointer-events: none;
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

        scrollToRecord: function (record, force, offsetTop) {
            if (!record) return;
            var innerEl = $(this.el).find('.inner'),
                inner_top = innerEl.offset().top + (offsetTop ? offsetTop : 0),
                idx = _.indexOf(this.store.models, record),
                div = (idx>=0 && this.dataViewItems.length>idx) ? $(this.dataViewItems[idx].el) : innerEl.find('#' + record.get('id'));
            if (div.length<=0) return;
            
            var div_top = div.offset().top,
                div_first = $(this.dataViewItems[0].el),
                div_first_top = (div_first.length>0) ? div_first[0].clientTop : 0;
            if (force || div_top < inner_top + div_first_top || div_top+div.outerHeight()*0.9 > inner_top + div_first_top + innerEl.height()) {
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
            if (data.isDefaultPrevented())
                return;

            if (!this.enableKeyEvents) return;

            if(this.multiSelect) {
                if (data.keyCode == Common.UI.Keys.CTRL) {
                    this.pressedCtrl = true;
                } else if (data.keyCode == Common.UI.Keys.SHIFT) {
                    this.pressedShift = true;
                }
            }

            if (_.indexOf(this.moveKeys, data.keyCode)>-1 || data.keyCode==Common.UI.Keys.RETURN) {
                data.preventDefault();
                data.stopPropagation();
                var rec =(this.multiSelect) ? this.extremeSeletedRec : this.getSelectedRec();
                if (this.lastSelectedRec === null)
                    this.lastSelectedRec = rec;
                if (data.keyCode == Common.UI.Keys.RETURN) {
                    this.lastSelectedRec = null;
                    if (this.selectedBeforeHideRec) // only for ComboDataView menuPicker
                        rec = this.selectedBeforeHideRec;
                    this.trigger('item:click', this, this, rec, e);
                    this.trigger('item:select', this, this, rec, e);
                    this.trigger('entervalue', this, rec, e);
                    if (this.parentMenu)
                        this.parentMenu.hide();
                } else {
                    this.pressedCtrl=false;
                    function getFirstItemIndex() {
                        if (this.dataViewItems.length===0) return 0;
                        var first = 0;
                        while(!this.dataViewItems[first] || !this.dataViewItems[first].$el || this.dataViewItems[first].$el.hasClass('disabled')) {
                            first++;
                        }
                        return first;
                    }
                    function getLastItemIndex() {
                        if (this.dataViewItems.length===0) return 0;
                        var last = this.dataViewItems.length-1;
                        while(!this.dataViewItems[last] || !this.dataViewItems[last].$el || this.dataViewItems[last].$el.hasClass('disabled')) {
                            last--;
                        }
                        return last;
                    }
                    var idx = _.indexOf(this.store.models, rec);
                    if (idx<0) {
                        if (data.keyCode==Common.UI.Keys.LEFT) {
                            var target = $(e.target).closest('.dropdown-submenu.over');
                            if (target.length>0) {
                                target.removeClass('over');
                                target.find('> a').focus();
                            } else
                                idx = getFirstItemIndex.call(this);
                        } else
                            idx = getFirstItemIndex.call(this);
                    } else if (this.options.keyMoveDirection == 'both') {
                        if (this._layoutParams === undefined)
                            this.fillIndexesArray();
                        var topIdx = this.dataViewItems[idx].topIdx,
                            leftIdx = this.dataViewItems[idx].leftIdx;
                        function checkEl() {
                            var item = this.dataViewItems[this._layoutParams.itemsIndexes[topIdx][leftIdx]];
                            if (item && item.$el && !item.$el.hasClass('disabled'))
                                return this._layoutParams.itemsIndexes[topIdx][leftIdx];
                        }

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
                                idx = checkEl.call(this);
                            }
                        } else if (data.keyCode==Common.UI.Keys.RIGHT) {
                            while (idx===undefined) {
                                leftIdx++;
                                if (leftIdx>this._layoutParams.columns-1) leftIdx = 0;
                                idx = checkEl.call(this);
                            }
                        } else if (data.keyCode==Common.UI.Keys.UP) {
                            if (topIdx==0 && this.outerMenu && this.outerMenu.menu) {
                                this.deselectAll(true);
                                this.outerMenu.menu.focusOuter && this.outerMenu.menu.focusOuter(data, this.outerMenu.index);
                                return;
                            } else
                                while (idx===undefined) {
                                    topIdx--;
                                    if (topIdx<0) topIdx = this._layoutParams.rows-1;
                                    idx = checkEl.call(this);
                                }
                        } else {
                            if (topIdx==this._layoutParams.rows-1 && this.outerMenu && this.outerMenu.menu) {
                                this.deselectAll(true);
                                this.outerMenu.menu.focusOuter && this.outerMenu.menu.focusOuter(data, this.outerMenu.index);
                                return;
                            } else
                                while (idx===undefined) {
                                    topIdx++;
                                    if (topIdx>this._layoutParams.rows-1) topIdx = 0;
                                    idx = checkEl.call(this);
                                }
                        }
                    } else {
                        var topIdx = idx,
                            firstIdx = getFirstItemIndex.call(this),
                            lastIdx = getLastItemIndex.call(this);
                        idx = undefined;
                        function checkEl() {
                            var item = this.dataViewItems[topIdx];
                            if (item && item.$el && !item.$el.hasClass('disabled'))
                                return topIdx;
                        }
                        while (idx===undefined) {
                            topIdx = (data.keyCode==Common.UI.Keys.UP || data.keyCode==Common.UI.Keys.LEFT)
                                    ? Math.max(firstIdx, topIdx-1)
                                    : Math.min(lastIdx, topIdx + 1);
                            idx = checkEl.call(this);
                        }
                    }

                    if (idx !== undefined && idx>=0) rec = this.store.at(idx);
                    if (rec) {
                        this._fromKeyDown = true;
                        this.selectRecord(rec);
                        this.scrollToRecord(rec);
                        (this.itemTabindex!==-1) && this.dataViewItems[idx] && this.dataViewItems[idx].$el.focus();
                        this._fromKeyDown = false;
                    }
                }
            } else {
                this.trigger('item:keydown', this, rec, e);
            }
        },

        onKeyUp: function(e){
            if (!this.enableKeyEvents) return;

            if(e.keyCode == Common.UI.Keys.SHIFT)
                this.pressedShift = false;
            if(e.keyCode == Common.UI.Keys.CTRL)
                this.pressedCtrl = false;
            this.trigger('item:keyup', this, e);
        },

        attachKeyEvents: function() {
            if (this.enableKeyEvents && this.handleSelect) {
                var el = $(this.el).find('.inner').addBack().filter('.inner');
                el.addClass('canfocused');
                el.attr('tabindex', this.tabindex.toString());
                el.on((this.parentMenu && this.useBSKeydown) ? 'dataview:keydown' : 'keydown', _.bind(this.onKeyDown, this));
                el.on((this.parentMenu && this.useBSKeydown) ? 'dataview:keyup' : 'keyup', _.bind(this.onKeyUp, this));
            }
        },

        showLastSelected: function() {
            if ( this.lastSelectedRec) {
                this.selectRecord(this.lastSelectedRec, true);
                this.scrollToRecord(this.lastSelectedRec);
                this.lastSelectedRec = null;
            } else {
                var selectedRec = this.getSelectedRec();
                if (!this.multiSelect)
                    this.scrollToRecord(selectedRec);
                else if(selectedRec && selectedRec.length > 0)
                    this.scrollToRecord(selectedRec[selectedRec.length - 1]);
            }
        },

        setDisabled: function(disabled) {
            disabled = !!disabled;
            this.disabled = disabled;
            $(this.el).find('.inner').addBack().filter('.inner').toggleClass('disabled', disabled);
        },

        isDisabled: function() {
            return this.disabled;
        },

        setEmptyText: function(emptyText) {
            this.emptyText = emptyText;

            if (this.store.length < 1) {
                var el = $(this.el).find('.inner').addBack().filter('.inner').find('.empty-text td');
                if ( el.length>0 )
                    el.text(this.emptyText);
            }
        },

        alignPosition: function() {
            var menuRoot = (this.parentMenu.cmpEl.attr('role') === 'menu')
                            ? this.parentMenu.cmpEl
                            : this.parentMenu.cmpEl.find('[role=menu]'),
                docH = Common.Utils.innerHeight()-10,
                innerEl = $(this.el).find('.inner').addBack().filter('.inner'),
                // parent = innerEl.parent(),
                // margins =  parseInt(parent.css('margin-top')) + parseInt(parent.css('margin-bottom')) + parseInt(menuRoot.css('margin-top')),
                // paddings = parseInt(menuRoot.css('padding-top')) + parseInt(menuRoot.css('padding-bottom')),
                menuH = menuRoot.outerHeight(),
                innerH = innerEl.height(),
                diff = Math.max(menuH - innerH, 0),
                top = parseInt(menuRoot.css('top')),
                props = {minScrollbarLength  : this.minScrollbarLength};
            this.scrollAlwaysVisible && (props.alwaysVisibleY = this.scrollAlwaysVisible);

            if (top + menuH > docH ) {
                innerEl.css('max-height', (docH - top - diff) + 'px');
                if (this.allowScrollbar) this.scroller.update(props);
            } else if ( top + menuH < docH && innerH < this.options.restoreHeight ) {
                innerEl.css('max-height', (Math.min(docH - top - diff, this.options.restoreHeight)) + 'px');
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
                itemW = el.outerWidth() + parseFloat(el.css('margin-left')) + parseFloat(el.css('margin-right')),
                offsetLeft = this.$el.offset().left,
                offsetTop = el.offset().top,
                prevtop = -1, topIdx = 0, leftIdx = 0;

            for (var i=0; i<this.dataViewItems.length; i++) {
                var top = $(this.dataViewItems[i].el).offset().top - offsetTop;
                leftIdx = Math.floor(($(this.dataViewItems[i].el).offset().left - offsetLeft)/itemW + 0.01);
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

        setMultiselectMode: function (multiselect) {
            this.pressedCtrl = !!multiselect;
        },

        onResize: function() {
            this._layoutParams = undefined;
        },

        focus: function(index) {
            $(this.el).find('.inner').addBack().filter('.inner').focus();
            var rec;
            if (typeof index == 'string') {
                if (index == 'first') {
                    rec = this.selectByIndex(0, true);
                } else if (index == 'last') {
                    if (this._layoutParams === undefined)
                        this.fillIndexesArray();
                    rec = this.selectByIndex(this._layoutParams.itemsIndexes[this._layoutParams.rows-1][0], true);
                }
            } else if (index !== undefined)
                rec = this.selectByIndex(index, true);
            this.scrollToRecord(rec);
        },

        focusInner: function(e) {
            this.focus(e.keyCode == Common.UI.Keys.DOWN ? 'first' : 'last');
        }
    });

    Common.UI.DataViewSimple = Common.UI.BaseView.extend({
        options : {
            handleSelect: true,
            enableKeyEvents: true,
            keyMoveDirection: 'both', // 'vertical', 'horizontal'
            restoreHeight: 0,
            scrollAlwaysVisible: false,
            useBSKeydown: false
        },

        template: _.template([
            '<div class="dataview inner" style="<%= style %>" role="list">',
            '<% _.each(items, function(item) { %>',
                '<% if (!item.id) item.id = Common.UI.getId(); %>',
                '<div class="item" role="listitem" <% if(typeof itemTabindex !== undefined) { %> tabindex="<%= itemTabindex %>" <% } %> <% if(!!item.tip) { %> data-toggle="tooltip" <% } %> data-hint="<%= item.dataHint %>" data-hint-direction="<%= item.dataHintDirection %>" data-hint-offset="<%= item.dataHintOffset %>"><%= itemTemplate(item) %></div>',
            '<% }) %>',
            '</div>'
        ].join('')),

        initialize : function(options) {
            Common.UI.BaseView.prototype.initialize.call(this, options);
            var me = this;

            me.template       = me.options.template       || me.template;
            me.store          = me.options.store          || new Common.UI.DataViewStore();
            me.itemTemplate   = me.options.itemTemplate   || null;
            me.handleSelect   = me.options.handleSelect;
            me.parentMenu     = me.options.parentMenu;
            me.enableKeyEvents= me.options.enableKeyEvents;
            me.useBSKeydown   = me.options.useBSKeydown; // only with enableKeyEvents && parentMenu
            me.style          = me.options.style        || '';
            me.scrollAlwaysVisible = me.options.scrollAlwaysVisible || false;
            me.tabindex = me.options.tabindex || 0;
            me.itemTabindex = me.options.itemTabindex!==undefined ? me.options.itemTabindex : me.tabindex>0 ? -1 : 0; //do not set focus to items when dataview get focus

            if (me.parentMenu)
                me.parentMenu.options.restoreHeight = (me.options.restoreHeight>0);
            me.rendered       = false;
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
            if (parentEl) {
                this.setElement(parentEl, false);
                this.cmpEl = $(this.template({
                    items: me.store.toJSON(),
                    itemTemplate: me.itemTemplate,
                    style: me.style,
                    itemTabindex: me.itemTabindex || 0
                }));

                parentEl.html(this.cmpEl);
            } else {
                this.cmpEl = me.$el || $(this.el);
                this.cmpEl.html(this.template({
                    items: me.store.toJSON(),
                    itemTemplate: me.itemTemplate,
                    style: me.style,
                    options: me.options,
                    itemTabindex: me.itemTabindex || 0
                }));
            }
            var modalParents = this.cmpEl.closest('.asc-window');
            if (modalParents.length < 1)
                modalParents = this.cmpEl.closest('[id^="menu-container-"]'); // context menu
            if (modalParents.length > 0) {
                this.tipZIndex = parseInt(modalParents.css('z-index')) + 10;
            }

            if (!this.rendered) {
                if (this.parentMenu) {
                    this.cmpEl.closest('li').css('height', '100%');
                    this.cmpEl.css('height', '100%');
                    this.parentMenu.on('show:after', _.bind(this.alignPosition, this));
                    this.parentMenu.on('show:after', _.bind(this.onAfterShowMenu, this));
                } else if (this.store.length>0)
                    this.onAfterShowMenu();

                if (this.enableKeyEvents && this.parentMenu && this.handleSelect) {
                    this.parentMenu.on('show:before', function(menu) { me.deselectAll(); });
                    this.parentMenu.on('show:after', function(menu) {
                        Common.NotificationCenter.trigger('dataview:focus');
                        _.delay(function() {
                            menu.cmpEl.find('.dataview').focus();
                        }, 10);
                    }).on('hide:after', function() {
                        Common.NotificationCenter.trigger('dataview:blur');
                    });
                }
                this.attachKeyEvents();
                this.cmpEl.on( "click", "div.item", _.bind(me.onClickItem, me));
            }
            if (_.isUndefined(this.scroller)) {
                this.scroller = new Common.UI.Scroller({
                    el: $(this.el).find('.inner').addBack().filter('.inner'),
                    useKeyboard: this.enableKeyEvents && !this.handleSelect,
                    minScrollbarLength  : this.minScrollbarLength,
                    scrollYStyle: this.scrollYStyle,
                    wheelSpeed: 10,
                    alwaysVisibleY: this.scrollAlwaysVisible
                });
            }

            this.rendered = true;

            (this.$el || $(this.el)).on('click', function(e){
                if (/dataview|grouped-data|group-items-container/.test(e.target.className) || $(e.target).closest('.group-description').length>0) return false;
            });

            this.trigger('render:after', this);
            return this;
        },

        selectRecord: function(record, suspendEvents) {
            if (!this.handleSelect)
                return;

            if (suspendEvents)
                this.suspendEvents();

            this.deselectAll(suspendEvents);

            if (record) {
                record.set({selected: true});
                var idx = _.indexOf(this.store.models, record);
                if (idx>=0 && this.dataViewItems && this.dataViewItems.length>idx) {
                    this.dataViewItems[idx].el.addClass('selected');
                }
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
            this.cmpEl.find('.item.selected').removeClass('selected');
            this.lastSelectedRec = null;

            if (suspendEvents)
                this.resumeEvents();
        },

        getSelectedRec: function() {
            return this.store.findWhere({selected: true});
        },

        onResetItems: function() {
            this.dataViewItems && _.each(this.dataViewItems, function(item) {
                var tip = item.el.data('bs.tooltip');
                if (tip) {
                    if (tip.dontShow===undefined)
                        tip.dontShow = true;
                    (tip.tip()).remove();
                }
            }, this);
            this.dataViewItems = null;

            var template = _.template([
                '<% _.each(items, function(item) { %>',
                    '<% if (!item.id) item.id = Common.UI.getId(); %>',
                    '<div class="item" role="listitem" <% if(typeof itemTabindex !== undefined) { %> tabindex="<%= itemTabindex %>" <% } %> <% if(!!item.tip) { %> data-toggle="tooltip" <% } %> data-hint="<%= item.dataHint %>" data-hint-direction="<%= item.dataHintDirection %>" data-hint-offset="<%= item.dataHintOffset %>"><%= itemTemplate(item) %></div>',
                '<% }) %>'
            ].join(''));
            this.cmpEl && this.cmpEl.find('.inner').html(template({
                items: this.store.toJSON(),
                itemTemplate: this.itemTemplate,
                style : this.style,
                itemTabindex: this.itemTabindex || 0
            }));

            if (!_.isUndefined(this.scroller)) {
                this.scroller.destroy();
                delete this.scroller;
            }

            this.scroller = new Common.UI.Scroller({
                el: $(this.el).find('.inner').addBack().filter('.inner'),
                useKeyboard: this.enableKeyEvents && !this.handleSelect,
                minScrollbarLength  : this.minScrollbarLength,
                scrollYStyle: this.scrollYStyle,
                wheelSpeed: 10,
                alwaysVisibleY: this.scrollAlwaysVisible
            });

            if (!this.parentMenu && this.store.length>0)
                this.onAfterShowMenu();
            this._layoutParams = undefined;
        },

        setStore: function(store) {
            if (store) {
                this.store = store;
                this.onResetItems();
            }
        },

        onClickItem: function(e) {
            if ( this.disabled ) return;

            window._event = e;  //  for FireFox only

            var index = $(e.currentTarget).closest('div.item').index(),
                record = (index>=0) ? this.store.at(index) : null,
                view = (index>=0) ? this.dataViewItems[index] : null;
            if (!record || !view) return;

            record.set({selected: true});
            var tip = view.el.data('bs.tooltip');
            if (tip) (tip.tip()).remove();

            if (!this.isSuspendEvents) {
                this.trigger('item:click', this, view.el, record, e);
            }
        },

        onAfterShowMenu: function(e) {
            if (!this.dataViewItems) {
                var me = this;
                this.dataViewItems = [];
                _.each(this.cmpEl.find('div.item'), function(item, index) {
                    var $item = $(item),
                        rec = me.store.at(index);
                    me.dataViewItems.push({el: $item});
                    var tip = rec.get('tip');
                    if (tip) {
                        $item.tooltip({
                            title       : tip,
                            placement   : 'cursor',
                            zIndex : me.tipZIndex
                        });
                        $item.attr('aria-label', tip);
                    }
                });
            }
        },

        scrollToRecord: function (record) {
            if (!record) return;
            var innerEl = $(this.el).find('.inner'),
                inner_top = innerEl.offset().top,
                idx = _.indexOf(this.store.models, record),
                div = (idx>=0 && this.dataViewItems.length>idx) ? this.dataViewItems[idx].el : innerEl.find('#' + record.get('id'));
            if (div.length<=0) return;

            var div_top = div.offset().top,
                div_first = this.dataViewItems[0].el,
                div_first_top = (div_first.length>0) ? div_first[0].offsetTop : 0;
            if (div_top < inner_top + div_first_top || div_top+div.outerHeight() > inner_top + innerEl.height()) {
                if (this.scroller) {
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
                var rec = this.getSelectedRec();
                if (data.keyCode==Common.UI.Keys.RETURN) {
                    if (this.selectedBeforeHideRec) // only for ComboDataView menuPicker
                        rec = this.selectedBeforeHideRec;
                    if (this.canAddRecents) // only for DaraViewShape
                        this.addRecentItem(rec);
                    this.trigger('item:click', this, this, rec, e);
                    if (this.parentMenu)
                        this.parentMenu.hide();
                } else {
                    var idx = _.indexOf(this.store.models, rec);
                    if (idx<0) {
                        function getFirstItemIndex() {
                            if (this.dataViewItems.length===0) return 0;
                            var first = 0;
                            while(!this.dataViewItems[first].el.is(':visible')) {
                                first++;
                            }
                            return first;
                        }
                        if (data.keyCode==Common.UI.Keys.LEFT) {
                            var target = $(e.target).closest('.dropdown-submenu.over');
                            if (target.length>0) {
                                target.removeClass('over');
                                target.find('> a').focus();
                            } else
                                idx = getFirstItemIndex.call(this);
                        } else
                            idx = getFirstItemIndex.call(this);
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
                            if (topIdx==0 && this.outerMenu && this.outerMenu.menu) {
                                this.deselectAll(true);
                                this.outerMenu.menu.focusOuter && this.outerMenu.menu.focusOuter(data, this.outerMenu.index);
                                return;
                            } else
                                while (idx===undefined) {
                                    topIdx--;
                                    if (topIdx<0) topIdx = this._layoutParams.rows-1;
                                    idx = this._layoutParams.itemsIndexes[topIdx][leftIdx];
                                }
                        } else {
                            if (topIdx==this._layoutParams.rows-1 && this.outerMenu && this.outerMenu.menu) {
                                this.deselectAll(true);
                                this.outerMenu.menu.focusOuter && this.outerMenu.menu.focusOuter(data, this.outerMenu.index);
                                return;
                            } else
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
                        this.scrollToRecord(rec);
                        (this.itemTabindex!==-1) && this.dataViewItems[idx] && $(this.dataViewItems[idx].el).focus();
                        this._fromKeyDown = false;
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
                el.attr('tabindex', this.tabindex.toString());
                el.on((this.parentMenu && this.useBSKeydown) ? 'dataview:keydown' : 'keydown', _.bind(this.onKeyDown, this));
            }
        },

        setDisabled: function(disabled) {
            disabled = !!disabled;
            this.disabled = disabled;
            $(this.el).find('.inner').addBack().filter('.inner').toggleClass('disabled', disabled);
        },

        isDisabled: function() {
            return this.disabled;
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
                props = {minScrollbarLength  : this.minScrollbarLength};
            this.scrollAlwaysVisible && (props.alwaysVisibleY = this.scrollAlwaysVisible);

            var menuUp = false;
            if (this.parentMenu.menuAlign) {
                var m = this.parentMenu.menuAlign.match(/^([a-z]+)-([a-z]+)/);
                menuUp = (m[1]==='bl' || m[1]==='br');
            }
            if (menuUp) {
                var bottom = top + menuH;
                if (top<0) {
                    innerEl.css('max-height', (bottom - paddings - margins) + 'px');
                    menuRoot.css('top', 0);
                    this.scroller.update(props);
                } else if (top>0 && innerEl.height() < this.options.restoreHeight) {
                    innerEl.css('max-height', (Math.min(bottom - paddings - margins, this.options.restoreHeight)) + 'px');
                    menuRoot.css('top', bottom - menuRoot.outerHeight());
                    this.scroller.update(props);
                }
            } else {
                if (top + menuH > docH ) {
                    innerEl.css('max-height', (docH - top - paddings - margins) + 'px');
                    this.scroller.update(props);
                } else if ( top + menuH < docH && innerEl.height() < this.options.restoreHeight ) {
                    innerEl.css('max-height', (Math.min(docH - top - paddings - margins, this.options.restoreHeight)) + 'px');
                    this.scroller.update(props);
                }
            }
        },

        fillIndexesArray: function() {
            if (this.dataViewItems.length<=0) return;

            this._layoutParams = {
                itemsIndexes:   [],
                columns:        0,
                rows:           0
            };

            var el = this.dataViewItems[0].el,
                itemW = el.outerWidth() + parseFloat(el.css('margin-left')) + parseFloat(el.css('margin-right')),
                offsetLeft = this.$el.offset().left,
                offsetTop = el.offset().top,
                prevtop = -1, topIdx = 0, leftIdx = 0;

            for (var i=0; i<this.dataViewItems.length; i++) {
                var item = this.dataViewItems[i];
                var top = item.el.offset().top - offsetTop;
                leftIdx = Math.floor((item.el.offset().left - offsetLeft)/itemW);
                if (top>prevtop) {
                    prevtop = top;
                    this._layoutParams.itemsIndexes.push([]);
                    topIdx = this._layoutParams.itemsIndexes.length-1;
                }
                this._layoutParams.itemsIndexes[topIdx][leftIdx] = i;
                item.topIdx = topIdx;
                item.leftIdx = leftIdx;
                if (this._layoutParams.columns<leftIdx) this._layoutParams.columns = leftIdx;
            }
            this._layoutParams.rows = this._layoutParams.itemsIndexes.length;
            this._layoutParams.columns++;
        },

        onResize: function() {
            this._layoutParams = undefined;
        },

        focus: function() {
            this.cmpEl && this.cmpEl.find('.dataview').focus();
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

    Common.UI.DataViewShape = Common.UI.DataViewSimple.extend(_.extend({
        template: _.template([
            '<div class="dataview inner" style="<%= style %>" role="list">',
                '<% _.each(options.groupsWithRecent, function(group, index) { %>',
                    '<div class="grouped-data <% if (index === 0) { %> recent-group <% } %> " id="<%= group.id %>" >',
                        '<% if (!_.isEmpty(group.groupName)) { %>',
                            '<div class="group-description">',
                                '<span><%= group.groupName %></span>',
                            '</div>',
                        '<% } %>',
                        '<div class="group-items-container <% if (index === 0) { %> recent-items <% } %>">',
                            '<% _.each(group.groupStore.toJSON(), function(item, index) { %>',
                                '<% if (!item.id) item.id = Common.UI.getId(); %>',
                                    '<div class="item" role="listitem" <% if (typeof itemTabindex !== undefined) { %> tabindex="<%= itemTabindex %>" <% } %> data-index="<%= index %>"<% if(!!item.tip) { %> data-toggle="tooltip" <% } %> ><%= itemTemplate(item) %></div>',
                                '<% }); %>',
                        '</div>',
                    '</div>',
                '<% }); %>',
            '</div>'
        ].join('')),
        initialize : function(options) {
            var me = this;
            this.canAddRecents = true;

            this._state = {
                hideTextRect: options.hideTextRect,
                hideLines: options.hideLines
            }

            var filter = Common.localStorage.getKeysFilter();
            this.appPrefix = (filter && filter.length) ? filter.split(',')[0] : '';

            me.groups = options.groups.toJSON();

            // add recent shapes to store
            var recentStore = new Common.UI.DataViewGroupStore,
                recentArr = options.recentShapes || [],
                cols = (recentArr.length) > 18 ? 7 : 6,
                height = Math.ceil(recentArr.length/cols) * 35 + 3,
                width = 30 * cols;

            me.recentShapes = recentArr;

            // check lang
            if (me.recentShapes.length > 0) {
                var isTranslated = _.findWhere(me.groups, {groupName: me.recentShapes[0].groupName});
                if (!isTranslated) {
                    for (var r = 0; r < me.recentShapes.length; r++) {
                        var type = me.recentShapes[r].data.shapeType,
                            record;
                        for (var g = 0; g < me.groups.length; g++) {
                            var store = me.groups[g].groupStore,
                                groupName = me.groups[g].groupName;
                            for (var i = 0; i < store.length; i++) {
                                if (store.at(i).get('data').shapeType === type) {
                                    record = store.at(i).toJSON();
                                    me.recentShapes[r] = {
                                        data: record.data,
                                        tip: record.tip,
                                        allowSelected: record.allowSelected,
                                        selected: false,
                                        groupName: groupName
                                    };
                                    break;
                                }
                            }
                            if (record) {
                                record = undefined;
                                break;
                            }
                        }
                    }
                    Common.localStorage.setItem(this.appPrefix + 'recent-shapes', JSON.stringify(me.recentShapes));
                }
            }

            // Add default recent

            if (me.recentShapes.length < 12) {
                var count = 12 - me.recentShapes.length,
                    defaultArr = [];

                var addItem = function (rec, groupName) {
                    var item = rec.toJSON(),
                        model = {
                            data: item.data,
                            tip: item.tip,
                            allowSelected: item.allowSelected,
                            selected: false,
                            groupName: groupName
                        };
                    defaultArr.push(model);
                };

                for (var i = 0; i < me.groups.length && count > 0; i++) {
                    var groupStore = me.groups[i].groupStore,
                        groupName = me.groups[i].groupName;
                    if (i === 0) {
                        addItem(groupStore.at(1), groupName);
                        count--;
                        if (count > 0) {
                            addItem(groupStore.at(2), groupName);
                            count--;
                        }
                    } else if (i !== 3 && i !== 6 && i !== 7) {
                        addItem(groupStore.at(0), groupName);
                        count--;
                        if (count > 0) {
                            addItem(groupStore.at(1), groupName);
                            count--;
                        }
                    }
                }
                me.recentShapes = me.recentShapes.concat(defaultArr);
            }

            recentStore.add(me.recentShapes);
            me.groups.unshift({
                groupName   : options.textRecentlyUsed,
                groupStore  : recentStore,
                groupWidth  : width,
                groupHeight : height
            });

            me.options.groupsWithRecent = me.groups;

            var store = new Common.UI.DataViewStore();

            _.each(me.groups, function (group, index) {
                var models = group.groupStore.models;
                if (index > 0) {
                    for (var i = 0; i < models.length; i++) {
                        models[i].set({groupName: group.groupName});
                    }
                }
                store.add(models);
            });

            options.store = store;

            Common.UI.DataViewSimple.prototype.initialize.call(this, options);

            me.parentMenu.on('show:before', function() { me.updateRecents(); });

            if (me._state.hideLines) {
                me.hideLinesGroup();
            }
        },
        onAfterShowMenu: function(e) {
            var me = this,
                updateHideRect = false;
            if (!me.dataViewItems) {
                me.dataViewItems = [];
                _.each(me.cmpEl.find('div.grouped-data'), function (group, indexGroup) {
                    _.each($(group).find('div.item'), function (item, index) {
                        var $item = $(item),
                            rec = me.groups[indexGroup].groupStore.at(index);
                        me.dataViewItems.push({el: $item, groupIndex: indexGroup, index: index});
                        var tip = rec.get('tip');
                        if (tip) {
                            $item.one('mouseenter', function(){ // hide tooltip when mouse is over menu
                                $item.attr('data-toggle', 'tooltip');
                                $item.tooltip({
                                    title       : tip,
                                    placement   : 'cursor',
                                    zIndex : me.tipZIndex
                                });
                                $item.mouseenter();
                            });
                            $item.attr('aria-label', tip);
                        }
                    });
                });
                updateHideRect = true;
            }
            if (me.updateDataViewItems && me.cmpEl.is(':visible')) {
                // add recent item in dataViewItems
                var recent = _.where(me.dataViewItems, {groupIndex: 0});
                var len = recent ? recent.length : 0;
                for (var i = 0; i < len; i++) {
                    var tip = me.dataViewItems[i].el.data('bs.tooltip');
                    if (tip) {
                        if (tip.dontShow===undefined)
                            tip.dontShow = true;
                        (tip.tip()).remove();
                    }
                }
                me.dataViewItems = me.dataViewItems.slice(len);
                var recentViewItems = [];
                _.each(me.cmpEl.find('.recent-group div.item'), function (item, index) {
                    var $item = $(item),
                        rec = me.recentShapes[index];
                    recentViewItems.push({el: $item, groupIndex: 0, index: index});
                    var tip = rec.tip;
                    if (tip) {
                        $item.one('mouseenter', function(){ // hide tooltip when mouse is over menu
                            $item.attr('data-toggle', 'tooltip');
                            $item.tooltip({
                                title: tip,
                                placement: 'cursor',
                                zIndex : me.tipZIndex
                            });
                            $item.mouseenter();
                        });
                        $item.attr('aria-label', tip);
                    }
                });
                me.dataViewItems = recentViewItems.concat(me.dataViewItems);

                if (me.recentShapes.length === 1) {
                    $('.recent-group').show();
                }
                me.updateDataViewItems = false;

                updateHideRect = true;
            }
            if (this._state.hideLines) {
                me.hideLines();
            }
            if (updateHideRect) {
                me.hideTextRect(me._state.hideTextRect);
            }
            me.fillIndexesArray();
        },

        onClickItem: function(e) {
            if ( this.disabled ) return;

            window._event = e;  //  for FireFox only

            var groupIndex = $(e.currentTarget).closest('div.grouped-data').index(),
                itemIndex = $(e.currentTarget).closest('div.item').data('index');
            var index = _.findIndex(this.dataViewItems, function (item) {
                    return (item.groupIndex === groupIndex && item.index === itemIndex);
                });
            var record = (index>=0) ? this.store.at(index) : null,
                view = (index>=0) ? this.dataViewItems[index] : null;
            if (!record || !view) return;

            record.set({selected: true});
            var tip = view.el.data('bs.tooltip');
            if (tip) (tip.tip()).remove();

            if (!this.isSuspendEvents) {
                this.trigger('item:click', this, view.el, record, e);
            }

            this.addRecentItem(record);
        },
        addRecentItem: function (rec) {
            var me = this,
                exist = false,
                type = rec.get('data').shapeType,
                groupName = rec.get('groupName');
            for (var i = 0; i < me.recentShapes.length; i++) {
                if (me.recentShapes[i].data.shapeType === type) {
                    exist = true;
                    break;
                }
            }
            if (exist) return;

            var item = rec.toJSON(),
                model = {
                    data: item.data,
                    tip: item.tip,
                    allowSelected: item.allowSelected,
                    selected: false,
                    groupName: groupName
                };
            var arr = [model].concat(me.recentShapes.slice(0, 11));
            Common.localStorage.setItem(this.appPrefix + 'recent-shapes', JSON.stringify(arr));
            me.recentShapes = undefined;
        },
        updateRecents: function () {
            var me = this,
                recents = Common.localStorage.getItem(this.appPrefix + 'recent-shapes');
            recents = recents ? JSON.parse(recents) : [];

            var diff = false;
            if (me.recentShapes) {
                for (var i = 0; i < recents.length; i++) {
                    if (!me.recentShapes[i] || (me.recentShapes[i] && recents[i].tip !== me.recentShapes[i].tip)) {
                        diff = true;
                    }
                }
            } else {
                diff = true;
            }

            if (recents.length > 0 && diff) {
                me.recentShapes = recents;
                var resentsStore = new Common.UI.DataViewStore();
                _.each(me.recentShapes, function (recent) {
                    var model = {
                        data: {shapeType: recent.data.shapeType},
                        tip: recent.tip,
                        allowSelected: recent.allowSelected,
                        selected: recent.selected,
                        groupName: recent.groupName
                    };
                    resentsStore.push(model);
                });
                me.groups[0].groupStore = resentsStore;

                var store = new Common.UI.DataViewStore();
                _.each(me.groups, function (group) {
                    store.add(group.groupStore.models);
                });
                me.store = store;

                var template = _.template([
                    '<% _.each(items, function(item, index) { %>',
                    '<% if (!item.id) item.id = Common.UI.getId(); %>',
                    '<div class="item" role="listitem" <% if (typeof itemTabindex !== undefined) { %> tabindex="<%= itemTabindex %>" <% } %> data-index="<%= index %>"<% if(!!item.tip) { %> data-toggle="tooltip" <% } %> ><%= itemTemplate(item) %></div>',
                    '<% }) %>'
                ].join(''));
                me.cmpEl && me.cmpEl.find('.recent-items').html(template({
                    items: me.recentShapes,
                    itemTemplate: this.itemTemplate,
                    style : this.style,
                    itemTabindex: this.itemTabindex || 0
                }));

                me.updateDataViewItems = true;
            }
        },
        fillIndexesArray: function() {
            if (this.dataViewItems.length<=0) return;

            this._layoutParams = {
                itemsIndexes:   [],
                columns:        0,
                rows:           0
            };

            var el = this.dataViewItems[0].el,
                first = 0;
            while (!this.dataViewItems[first].el.is(":visible")) { // if first elem is hidden
                first++;
                if (!this.dataViewItems[first]) return;
                el = this.dataViewItems[first].el;
            }

            var itemW = el.outerWidth() + parseInt(el.css('margin-left')) + parseInt(el.css('margin-right')),
                offsetLeft = this.$el.offset().left,
                offsetTop = el.offset().top,
                prevtop = -1, topIdx = 0, leftIdx = first;

            for (var i=0; i<this.dataViewItems.length; i++) {
                var item = this.dataViewItems[i];
                if (item.el.is(":visible")) {
                    var top = item.el.offset().top - offsetTop;
                    leftIdx = Math.floor((item.el.offset().left - offsetLeft) / itemW);
                    if (top > prevtop) {
                        prevtop = top;
                        this._layoutParams.itemsIndexes.push([]);
                        topIdx = this._layoutParams.itemsIndexes.length - 1;
                    }
                    this._layoutParams.itemsIndexes[topIdx][leftIdx] = i;
                    item.topIdx = topIdx;
                    item.leftIdx = leftIdx;
                    if (this._layoutParams.columns < leftIdx) this._layoutParams.columns = leftIdx;
                } else {
                    item.topIdx = -1;
                    item.leftIdx = -1;
                }
            }
            this._layoutParams.rows = this._layoutParams.itemsIndexes.length;
            this._layoutParams.columns++;
        },
        hideTextRect: function (hide) {
            var me = this;
            this.dataViewItems && this.store.each(function(item, index){
                if (item.get('data').shapeType === 'textRect' && me.dataViewItems[index] && me.dataViewItems[index].el) {
                    me.dataViewItems[index].el[hide ? 'addClass' : 'removeClass']('hidden');
                }
            }, this);
            this._state.hideTextRect = hide;
        },
        hideLinesGroup: function () {
            $(this.cmpEl.find('div.grouped-data')[9]).hide();
        },
        hideLines: function () {
            var me = this;
            this.store.each(function(item, index){
                if (item.get('groupName') === 'Lines') {
                    var el = me.dataViewItems[index].el;
                    if (el && el.is(':visible')) {
                        el.addClass('hidden');
                    }
                }
            }, this);
        }
    }));

});