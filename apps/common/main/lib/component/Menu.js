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
 *  Menu.js
 *
 *  A menu object. This is the container to which you may add {@link Common.UI.MenuItem menu items}.
 *
 *  Created on 1/28/14
 *
 */

/**
 *  Default template
 *
 *  <ul class="dropdown-menu" role="menu">
 *      <li><a href="#">item 1</a></li>-->
 *      <li><a href="#">item 2</a></li>-->
 *      <li class="divider"></li>-->
 *      <li><a href="#">item 3</a></li>
 *  </ul>
 *
 *  A useful classes of menu position
 *
 *  - `'pull-right'` using for layout menu by right side of a parent
 *
 *
 *  Example usage:
 *
 *      new Common.UI.Menu({
 *          items: [
 *              { caption: 'item 1', value: 1 },
 *              { caption: 'item 1', value: 2 },
 *              { caption: '--' },
 *              { caption: 'item 1', value: 3 },
 *          ]
 *      })
 *
 *  @property {Object} itemTemplate
 *
 *  Default template for items
 *
 *
 *  @property {Array} items
 *
 *  Arrow of the {Common.UI.MenuItem} menu items
 *
 *
 *  @property {Boolean/Number} restoreHeight
 *
 *  Adjust to the browser height and restore to restoreHeight when it's Number
 *
 *
 */

if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/extend/Bootstrap',
    'common/main/lib/component/BaseView',
    'common/main/lib/component/MenuItem',
    'common/main/lib/component/Scroller'
], function () {
    'use strict';

    Common.UI.Menu = (function(){
        var manager = (function(){
            var active = [],
                menus = {};

            return {
                register: function(menu) {
                    menus[menu.id] = menu;
                    menu
                    .on('show:after', function(m) {
                        active.push(m);
                    })
                    .on('hide:after', function(m) {
                        var index = active.indexOf(m);

                        if (index > -1)
                            active.splice(index, 1);
                    });
                },

                unregister: function(menu) {
                    var index = active.indexOf(menu);

                    delete menus[menu.id];

                    if (index > -1)
                        active.splice(index, 1);

                    menu.off('show:after').off('hide:after');
                },

                hideAll: function() {
                    Common.NotificationCenter.trigger('menumanager:hideall');

                    if (active && active.length > 0) {
                        _.each(active, function(menu) {
                            if (menu) menu.hide();
                        });
                        return true;
                    }
                    return false;
                }
            }
        })();

        return _.extend(Common.UI.BaseView.extend({
            options : {
                cls         : '',
                style       : '',
                itemTemplate: null,
                items       : [],
                menuAlign   : 'tl-bl',//menu - parent
                menuAlignEl : null,
                offset      : [0, 0],
                cyclic      : true,
                search      : false,
                scrollAlwaysVisible: true,
                scrollToCheckedItem: true, // if true - scroll menu to checked item on menu show
                focusToCheckedItem: false // if true - move focus to checked item on menu show
            },

            template: _.template([
                '<ul class="dropdown-menu <%= options.cls %>" oo_editor_input="true" style="<%= options.style %>" role="menu"></ul>'
            ].join('')),

            initialize : function(options) {
                Common.UI.BaseView.prototype.initialize.call(this, options);

                var me = this;

                this.id             = this.options.id || Common.UI.getId();
                this.itemTemplate   = this.options.itemTemplate || Common.UI.MenuItem.prototype.template;
                this.rendered       = false;
                this.items          = [];
                this.offset         = [0, 0];
                this.menuAlign      = this.options.menuAlign;
                this.menuAlignEl    = this.options.menuAlignEl;
                this.scrollAlwaysVisible = this.options.scrollAlwaysVisible;
                this.search = this.options.search;
                this.outerMenu      = this.options.outerMenu;

                if (Common.UI.isRTL()) {
                    if (this.menuAlign === 'tl-tr') {
                        this.menuAlign = 'tr-tl';
                    } else if (this.menuAlign === 'tl-bl') {
                        this.menuAlign = 'tr-br';
                    } else if (this.menuAlign === 'tr-br') {
                        this.menuAlign = 'tl-bl';
                    } else if (this.menuAlign === 'bl-tl') {
                        this.menuAlign = 'br-tr';
                    }
                }

                if (this.options.restoreHeight) {
                    this.options.restoreHeight = (typeof (this.options.restoreHeight) == "number") ? this.options.restoreHeight : (this.options.maxHeight ? this.options.maxHeight : 100000);
                    !this.options.maxHeight && (this.options.maxHeight = this.options.restoreHeight);
                }

                Common.Utils.isIE && (this.options.restoreHeightAndTop = false);

                if (!this.options.cyclic) this.options.cls += ' no-cyclic';

                _.each(this.options.items, function(item) {
                    if (item instanceof Common.UI.MenuItem) {
                        me.items.push(item)
                    } else {
                        me.items.push(
                            new Common.UI.MenuItem(_.extend({
                                tagName : 'li',
                                template: me.itemTemplate
                            }, item))
                        );
                    }
                });

                if (this.options.el)
                    this.render();

                manager.register(this);
            },

            remove: function() {
                manager.unregister(this);
                Common.UI.BaseView.prototype.remove.call(this);
            },

            render: function(parentEl) {
                var me = this;

                this.trigger('render:before', this);

                this.cmpEl = me.$el || $(this.el);

                if (parentEl) {
                    this.setElement(parentEl, false);

                    if (!me.rendered) {
                        this.cmpEl = $(this.template({
                            options : me.options
                        }));

                        parentEl.append(this.cmpEl);
                    }
                } else {
                    if (!me.rendered) {
                        this.cmpEl = this.template({
                            options : me.options
                        });
                        this.$el.append(this.cmpEl);
                    }
                }

                var rootEl = this.cmpEl.parent(),
                    menuRoot = (rootEl.attr('role') === 'menu') ? rootEl : rootEl.find('[role=menu]');
                this.menuRoot = menuRoot;

                if (menuRoot) {
                    if (!me.rendered) {
                        _.each(me.items || [], function(item) {
                            menuRoot.append(item.render().el);

                            item.on('click',  _.bind(me.onItemClick, me));
                            item.on('toggle', _.bind(me.onItemToggle, me));
                        });
                        menuRoot.on( "click", function(e) {
                            me.trigger('menu:click', this, e);
                        });
                    }

                    if (this.options.maxHeight) {
                        menuRoot.css({'max-height': me.options.maxHeight});
                        this.scroller = new Common.UI.Scroller({
                            el: me.$el.find('.dropdown-menu '),
                            minScrollbarLength: 30,
                            suppressScrollX: true,
                            alwaysVisibleY: this.scrollAlwaysVisible
                        });
                    }

                    menuRoot.css({
                        position    : 'fixed',
                        right       : 'auto',
                        left        : -1000,
                        top         : -1000
                    });

                    this.parentEl = menuRoot.parent();

                    this.parentEl.on('show.bs.dropdown',    _.bind(me.onBeforeShowMenu, me));
                    this.parentEl.on('shown.bs.dropdown',   _.bind(me.onAfterShowMenu, me));
                    this.parentEl.on('hide.bs.dropdown',    _.bind(me.onBeforeHideMenu, me));
                    this.parentEl.on('hidden.bs.dropdown',  _.bind(me.onAfterHideMenu, me));
                    this.parentEl.on('keydown.after.bs.dropdown', _.bind(me.onAfterKeydownMenu, me));
                    this.parentEl.on('keydown.before.bs.dropdown', _.bind(me.onBeforeKeydownMenu, me));
                    this.options.innerMenus && this.on('keydown:before', _.bind(me.onBeforeKeyDown, me));

                    menuRoot.hover(
                        function(e) { me.isOver = true;},
                        function(e) { me.isOver = false; }
                    );
                }

                this.rendered = true;

                this.trigger('render:after', this);

                return this;
            },

            isVisible: function() {
                return this.rendered && (this.cmpEl.is(':visible'));
            },

            show: function() {
                if (this.rendered && this.parentEl && !this.parentEl.hasClass('open')) {
                    this.cmpEl.dropdown('toggle');
                }
            },

            hide: function() {
                if (this.rendered && this.parentEl) {
                    if ( this.parentEl.hasClass('open') )
                        this.cmpEl.dropdown('toggle');
                    else if (this.parentEl.hasClass('over'))
                        this.parentEl.removeClass('over');
                }
            },

            insertItem: function(index, item) {
                var me = this,
                    el = this.cmpEl;

                if (!(item instanceof Common.UI.MenuItem)) {
                    item = new Common.UI.MenuItem(_.extend({
                        tagName : 'li',
                        template: me.itemTemplate
                    }, item));
                }

                if (index < 0 || index >= me.items.length)
                    me.items.push(item);
                else
                    me.items.splice(index, 0, item);

                if (this.rendered) {
                    var menuRoot = this.menuRoot;
                    if (menuRoot) {
                        if (index < 0) {
                            menuRoot.append(item.render().el);
                        } else if (index === 0) {
                            menuRoot.prepend(item.render().el);
                        } else {
                            menuRoot.children('li:nth-child(' + (index+1) + ')').before(item.render().el);
                        }

                        item.on('click',  _.bind(me.onItemClick, me));
                        item.on('toggle', _.bind(me.onItemToggle, me));
                    }
                }
            },

            addItem: function(item) {
                this.insertItem(-1, item);
            },

            removeItem: function(item) {
                var me = this,
                    index = me.items.indexOf(item);

                if (index > -1) {
                    me.items.splice(index, 1);

                    item.off('click').off('toggle');
                    item.remove();
                }
            },

            removeItems: function(from, len) {
                if (from > this.items.length-1) return;
                if (from+len>this.items.length) len = this.items.length - from;

                for (var i=from; i<from+len; i++) {
                    this.items[i].off('click').off('toggle');
                    this.items[i].remove();
                }
                this.items.splice(from, len);
            },

            removeAll: function() {
                var me = this;

                _.each(me.items, function(item){
                    item.off('click').off('toggle');
                    item.remove();
                });

                me.items = [];
            },

            onBeforeShowMenu: function(e) {
                Common.NotificationCenter.trigger('menu:show');
                this.trigger('show:before', this, e);
                (e && e.target===e.currentTarget) && this.alignPosition();
            },

            onAfterShowMenu: function(e) {
                this.trigger('show:after', this, e);
                if (this.scroller && e && e.target===e.currentTarget) {
                    var menuRoot = this.menuRoot;
                    if (this.wheelSpeed===undefined) {
                        var item = menuRoot.find('> li:first'),
                            itemHeight = (item.length) ? item.outerHeight() : 1;
                        this.wheelSpeed = Math.min((Math.floor(menuRoot.height()/itemHeight) * itemHeight)/10, 20);
                    }
                    this.scroller.update({alwaysVisibleY: this.scrollAlwaysVisible, wheelSpeed: this.wheelSpeed});

                    var $selected = menuRoot.find('> li .checked');
                    if ($selected.length) {
                        var itemTop = $selected.position().top,
                            itemHeight = $selected.outerHeight(),
                            listHeight = menuRoot.outerHeight();
                        if (!!this.options.scrollToCheckedItem && (itemTop < 0 || itemTop + itemHeight > listHeight)) {
                            var height = menuRoot.scrollTop() + itemTop + (itemHeight - listHeight)/2;
                            height = (Math.floor(height/itemHeight) * itemHeight);
                            menuRoot.scrollTop(height);
                        }
                        !!this.options.focusToCheckedItem && setTimeout(function(){$selected.focus();}, 1);
                    }
                }
                this._search = {};
            },

            onBeforeHideMenu: function(e) {
                this.trigger('hide:before', this, e);

                if (Common.UI.Scroller.isMouseCapture())
                    e.preventDefault();
            },

            onAfterHideMenu: function(e, isFromInputControl) {
                this.trigger('hide:after', this, e, isFromInputControl);
                Common.NotificationCenter.trigger('menu:hide', this, isFromInputControl);
            },

            onAfterKeydownMenu: function(e) {
                this.trigger('keydown:before', this, e);
                if (e.isDefaultPrevented())
                    return;

                if (e.keyCode == Common.UI.Keys.RETURN) {
                    var li = $(e.target).closest('li');
                    if (li.length<=0) li = $(e.target).parent().find('li .dataview');
                    if (li.length>0) li.click();
                    if (!li.hasClass('dropdown-submenu'))
                        Common.UI.Menu.Manager.hideAll();
                    if ( $(e.currentTarget).closest('li').hasClass('dropdown-submenu')) {
                        e.stopPropagation();
                        return false;
                    }
                } else if (e.keyCode == Common.UI.Keys.UP || e.keyCode == Common.UI.Keys.DOWN)  {
                    this.fromKeyDown = true;
                } else if (e.keyCode == Common.UI.Keys.ESC)  {
//                    Common.NotificationCenter.trigger('menu:afterkeydown', e);
//                    return false;
                } else if (this.search && e.keyCode > 64 && e.keyCode < 91 && e.key){
                    var me = this;
                    clearTimeout(this._search.timer);
                    this._search.timer = setTimeout(function () { me._search = {}; }, 1000);

                    (!this._search.text) && (this._search.text = '');
                    (!this._search.char) && (this._search.char = e.key);
                    (this._search.char !== e.key) && (this._search.full = true);
                    this._search.text += e.key;
                    if (this._search.index===undefined) {
                        var $items = this.menuRoot.find('> li').find('> a');
                        this._search.index = $items.index($items.filter(':focus'));
                    }
                    this.selectCandidate();
                }
            },

            onBeforeKeydownMenu: function(e) {
                if (e.isDefaultPrevented() || !(this.outerMenu && this.outerMenu.menu))
                    return;

                if (e.keyCode == Common.UI.Keys.UP || e.keyCode == Common.UI.Keys.DOWN)  {
                    var $items = this.menuRoot.find('> li').find('> a'),
                        index = $items.index($items.filter(':focus'));
                    if (e.keyCode==Common.UI.Keys.UP && index==0 || e.keyCode == Common.UI.Keys.DOWN && index==$items.length-1) {
                        this.outerMenu.menu.focusOuter(e, this.outerMenu.index);
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }
            },

            selectCandidate: function() {
                var index = (this._search.index && this._search.index != -1) ? this._search.index : 0,
                    re = new RegExp('^' + ((this._search.full) ? this._search.text : this._search.char), 'i'),
                    isFirstCharsEqual = re.test(this.items[index].caption),
                    itemCandidate, idxCandidate;

                for (var i=0; i<this.items.length; i++) {
                    var item = this.items[i];
                    if (re.test(item.caption)) {
                        if (!itemCandidate) {
                            itemCandidate = item;
                            idxCandidate = i;
                            if(!isFirstCharsEqual) 
                                break;  
                        }
                        if (this._search.full && i==index || i>index) {
                            itemCandidate = item;
                            idxCandidate = i;
                            break;
                        }
                    }
                }

                if (itemCandidate) {
                    this._search.index = idxCandidate;
                    var item = itemCandidate.cmpEl.find('a');
                    if (this.scroller) {
                        this.scroller.update({alwaysVisibleY: this.scrollAlwaysVisible, wheelSpeed: this.wheelSpeed});
                        var itemTop = item.position().top,
                            itemHeight = item.outerHeight(),
                            listHeight = this.menuRoot.outerHeight();
                        if (itemTop < 0 || itemTop + itemHeight > listHeight) {
                            var height = this.menuRoot.scrollTop() + itemTop;
                            height = (Math.floor(height/itemHeight) * itemHeight);
                            this.menuRoot.scrollTop(height);
                        }
                    }
                    item.focus();
                }
            },

            onBeforeKeyDown: function(menu, e) {
                if (e.keyCode == Common.UI.Keys.RETURN) {
                    var li = $(e.target).closest('li');
                    if (li.length>0) {
                        e.preventDefault();
                        e.stopPropagation();
                        li.click();
                    }
                    Common.UI.Menu.Manager.hideAll();
                } else if (e.namespace!=="after.bs.dropdown" && (e.keyCode == Common.UI.Keys.DOWN || e.keyCode == Common.UI.Keys.UP)) {
                    if ( this.menuRoot.length<1 || $(e.target).closest('ul[role=menu]').get(0) !== this.menuRoot.get(0)) return;

                    var innerMenu = this.findInnerMenu(e.keyCode);
                    if (innerMenu && innerMenu.focusInner) {
                        e.preventDefault();
                        e.stopPropagation();
                        _.delay(function() {
                            innerMenu.focusInner(e);
                        }, 10);
                    }
                }
            },

            setInnerMenu: function(menus) {
                if (this.options.innerMenus || !menus) return;

                this.options.innerMenus = menus;
                this.rendered && this.on('keydown:before', _.bind(this.onBeforeKeyDown, this));
            },
            
            findInnerMenu: function(direction, index, findOuter) {
                if (!this.options.innerMenus) return;

                var $allItems = $('> li', this.menuRoot),
                    $liItems = $('> li:not(.divider):not(.disabled):visible', this.menuRoot),
                    length = $liItems.length;
                if (!length) return;

                var step = 0;
                while (step<length) {
                    var focusedIndex = (index!==undefined) ? $liItems.index($allItems.eq(index)) : $liItems.index($liItems.find('> a').filter(':focus').parent());
                    var checkedIndex = (direction == Common.UI.Keys.DOWN) ? (focusedIndex<length-1 ? focusedIndex+1 : 0) : (focusedIndex>0 ? focusedIndex-1 : length-1),
                        checkedItem = $liItems.eq(checkedIndex);
                    index = $allItems.index(checkedItem);

                    for (var i=0; i<this.options.innerMenus.length; i++) {
                        var item = this.options.innerMenus[i];
                        if (item && item.menu && item.index==index) {
                            return item.menu;
                        }
                    }
                    if (checkedItem.find('> a').length>0)
                        return findOuter ? checkedItem : undefined;
                    step++;
                }
            },

            focusInner: function(e) {
                if (e.keyCode == Common.UI.Keys.UP)
                    this.items[this.items.length-1].cmpEl.find('> a').focus();
                else
                    this.items[0].cmpEl.find('> a').focus();
            },

            focusOuter: function(e, index) {
                var innerMenu = this.findInnerMenu(e.keyCode, index, true);
                if (innerMenu && innerMenu.focusInner) {
                    _.delay(function() {
                        innerMenu.focusInner(e);
                    }, 10);
                } else if (innerMenu) {
                    innerMenu.find('> a').focus();
                } else {
                    var $items = $('> li:not(.divider):not(.disabled):visible', this.menuRoot).find('> a'),
                        length = $items.length;
                    length && $items.eq(e.keyCode == Common.UI.Keys.UP ? (index<0 ? length-1 : index) : (index>=length-1 ? 0 : index+1)).focus();
                }
            },

            onItemClick: function(item, e) {
                if (!item.menu) this.isOver = false;
                if (item.options.stopPropagation) {
                    e.stopPropagation();
                    var me = this;
                    _.delay(function(){
                        me.$el.parent().parent().find('[data-toggle=dropdown]').focus();
                    }, 10);
                    return;
                }
                this.trigger('item:click', this, item, e);
            },

            onItemToggle: function(item, state, e) {
                this.trigger('item:toggle', this, item, state, e);
            },

            setOffset: function(offsetX, offsetY) {
                this.offset[0] = _.isUndefined(offsetX) ? this.offset[0] : offsetX;
                this.offset[1] = _.isUndefined(offsetY) ? this.offset[1] : offsetY;
                this.alignPosition();
            },

            getOffset: function() {
                return this.offset;
            },

            alignPosition: function(fixedAlign, fixedOffset) {
                var menuRoot = this.menuRoot,
                    menuParent  = this.menuAlignEl || menuRoot.parent(),
                    m           = this.menuAlign.match(/^([a-z]+)-([a-z]+)/),
                    offset      = menuParent.offset(),
                    docW        = Common.Utils.innerWidth() - 10,
                    docH        = Common.Utils.innerHeight() - 10, // Yep, it's magic number
                    menuW       = menuRoot.outerWidth(),
                    menuH       = menuRoot.outerHeight(),
                    parentW     = menuParent.outerWidth(),
                    parentH     = menuParent.outerHeight();

                var posMenu = {
                    'tl': [0, 0],
                    'bl': [0, menuH],
                    'tr': [menuW, 0],
                    'br': [menuW, menuH]
                };
                var posParent = {
                    'tl': [0, 0],
                    'tr': [parentW, 0],
                    'bl': [0, parentH],
                    'br': [parentW, parentH]
                };
                var left = offset.left - posMenu[m[1]][0] + posParent[m[2]][0] + this.offset[0];
                var top  = offset.top  - posMenu[m[1]][1] + posParent[m[2]][1] + this.offset[1];

                if (left + menuW > docW) {
                    if (menuParent.is('li.dropdown-submenu')) {
                        left = offset.left - menuW + 2;
                    } else {
                        left = docW - menuW;
                    }
                } else if (left < 0) {
                    if (menuParent.is('li.dropdown-submenu')) {
                        left = offset.left + parentW - 2;
                    } else {
                        left = 0;
                    }
                }
                if (left < 0)
                    left = 0;

                if (this.options.restoreHeightAndTop) { // can change top position, if top<0 - then change menu height
                    var cg = Common.Utils.croppedGeometry();
                    docH = cg.height - 10;
                    menuRoot.css('max-height', 'none');
                    menuH = menuRoot.outerHeight();
                    if (top + menuH > docH + cg.top) {
                        top = docH - menuH + cg.top;
                    }
                    if (top < cg.top)
                        top = cg.top;
                    if (top + menuH > docH + cg.top) {
                        menuRoot.css('max-height', (docH - top + cg.top) + 'px');
                        (!this.scroller) && (this.scroller = new Common.UI.Scroller({
                            el: this.$el.find('> .dropdown-menu '),
                            minScrollbarLength: 30,
                            suppressScrollX: true,
                            alwaysVisibleY: this.scrollAlwaysVisible
                        }));
                        this.wheelSpeed = undefined;
                    }
                    this.scroller && this.scroller.update({alwaysVisibleY: this.scrollAlwaysVisible});
                } else if (this.options.restoreHeight) {
                    if (typeof (this.options.restoreHeight) == "number") {
                        if (top + menuH > docH) {
                            menuRoot.css('max-height', (docH - top) + 'px');
                            (!this.scroller) && (this.scroller = new Common.UI.Scroller({
                                el: this.$el.find('.dropdown-menu '),
                                minScrollbarLength: 30,
                                suppressScrollX: true,
                                alwaysVisibleY: this.scrollAlwaysVisible
                            }));
                            this.wheelSpeed = undefined;
                        } else if ( top + menuH < docH && menuRoot.height() < this.options.restoreHeight) {
                            menuRoot.css('max-height', (Math.min(docH - top, this.options.restoreHeight)) + 'px');
                            this.wheelSpeed = undefined;
                        }
                    }
                } else {
                    var cg = Common.Utils.croppedGeometry();
                    docH = cg.height - 10;
                    if (top + menuH > docH + cg.top) {
                        if (fixedAlign && typeof fixedAlign == 'string') { // how to align if menu height > window height
                            m = fixedAlign.match(/^([a-z]+)-([a-z]+)/);
                            top  = offset.top  - posMenu[m[1]][1] + posParent[m[2]][1] + this.offset[1] + (fixedOffset || 0);
                        } else
                            top = docH - menuH + cg.top;
                    }


                    if (top < cg.top)
                        top = cg.top;
                }
                if (this.options.additionalAlign)
                    this.options.additionalAlign.call(this, menuRoot, left, top);
                else {
                    var _css = {left: left, top: top};
                    if (!(menuH < docH)) _css['margin-top'] = 0;

                    menuRoot.css(_css);
                }
            },

            getChecked: function() {
                for (var i=0; i<this.items.length; i++) {
                    var item = this.items[i];
                    if (item.isChecked && item.isChecked())
                        return item;
                }
            },

            clearAll: function() {
                _.each(this.items, function(item){
                    if (item.setChecked)
                        item.setChecked(false, true);
                });
            }

        }), {
            Manager: (function() {
                return manager;
            })()
        })
    })();

    Common.UI.MenuSimple = Common.UI.BaseView.extend({
        options : {
            cls         : '',
            style       : '',
            itemTemplate: null,
            items       : [],
            menuAlign   : 'tl-bl',
            menuAlignEl : null,
            offset      : [0, 0],
            cyclic      : true,
            search      : false,
            scrollAlwaysVisible: true,
            scrollToCheckedItem: true, // if true - scroll menu to checked item on menu show
            focusToCheckedItem: false // if true - move focus to checked item on menu show
        },

        template: _.template([
            '<ul class="dropdown-menu <%= options.cls %>" oo_editor_input="true" style="<%= options.style %>" role="menu">',
                '<% _.each(items, function(item) { %>',
                    '<% if (!item.id) item.id = Common.UI.getId(); %>',
                    '<% item.checked = item.checked || false;  %>',
                    '<li><%= itemTemplate(item) %></li>',
                '<% }) %>',
            '</ul>'
        ].join('')),

        initialize : function(options) {
            Common.UI.BaseView.prototype.initialize.call(this, options);

            var me = this;

            this.id             = this.options.id || Common.UI.getId();
            this.itemTemplate   = this.options.itemTemplate || _.template([
                                                                '<a id="<%= id %>" <% if(typeof style !== "undefined") { %> style="<%= style %>" <% } %>',
                                                                    '<% if(typeof canFocused !== "undefined") { %> tabindex="-1" type="menuitem" <% } %>',
                                                                    '<% if(typeof stopPropagation !== "undefined") { %> data-stopPropagation="true" <% } %>',
                                                                    'class="<% if (checked) { %> checked <% } %>" >',
                                                                    '<% if (typeof iconCls !== "undefined") { %>',
                                                                        '<span class="menu-item-icon <%= iconCls %>"></span>',
                                                                    '<% } %>',
                                                                '<%= caption %>',
                                                                '</a>'
                                                            ].join(''));
            this.rendered       = false;
            this.items          = this.options.items || [];
            this.offset         = [0, 0];
            this.menuAlign      = this.options.menuAlign;
            this.menuAlignEl    = this.options.menuAlignEl;
            this.scrollAlwaysVisible = this.options.scrollAlwaysVisible;
            this.search = this.options.search;

            if (Common.UI.isRTL()) {
                if (this.menuAlign === 'tl-tr') {
                    this.menuAlign = 'tr-tl';
                } else if (this.menuAlign === 'tl-bl') {
                    this.menuAlign = 'tr-br';
                } else if (this.menuAlign === 'tr-br') {
                    this.menuAlign = 'tl-bl';
                } else if (this.menuAlign === 'bl-tl') {
                    this.menuAlign = 'br-tr';
                }
            }

            if (this.options.restoreHeight) {
                this.options.restoreHeight = (typeof (this.options.restoreHeight) == "number") ? this.options.restoreHeight : (this.options.maxHeight ? this.options.maxHeight : 100000);
                !this.options.maxHeight && (this.options.maxHeight = this.options.restoreHeight);
            }

            if (!this.options.cyclic) this.options.cls += ' no-cyclic';

            if (this.options.el)
                this.render();

            Common.UI.Menu.Manager.register(this);
        },

        remove: function() {
            Common.UI.Menu.Manager.unregister(this);
            Common.UI.BaseView.prototype.remove.call(this);
        },

        render: function(parentEl) {
            var me = this;

            this.trigger('render:before', this);

            this.cmpEl = me.$el || $(this.el);

            parentEl && this.setElement(parentEl, false);

            if (!me.rendered) {
                this.cmpEl = $(this.template({
                    items: me.items,
                    itemTemplate: me.itemTemplate,
                    options : me.options
                }));

                parentEl ? parentEl.append(this.cmpEl) : this.$el.append(this.cmpEl);
            }

            var rootEl = this.cmpEl.parent(),
                menuRoot = (rootEl.attr('role') === 'menu') ? rootEl : rootEl.find('[role=menu]');
            this.menuRoot = menuRoot;

            if (menuRoot) {
                if (!me.rendered) {
                    menuRoot.on( "click", "li",       _.bind(me.onItemClick, me));
                    menuRoot.on( "mousedown", "li",   _.bind(me.onItemMouseDown, me));
                }

                if (this.options.maxHeight) {
                    menuRoot.css({'max-height': me.options.maxHeight});
                    this.scroller = new Common.UI.Scroller({
                        el: me.$el.find('.dropdown-menu '),
                        minScrollbarLength: 30,
                        suppressScrollX: true,
                        alwaysVisibleY: this.scrollAlwaysVisible
                    });
                }

                menuRoot.css({
                    position    : 'fixed',
                    right       : 'auto',
                    left        : -1000,
                    top         : -1000
                });

                this.parentEl = menuRoot.parent();

                this.parentEl.on('show.bs.dropdown',    _.bind(me.onBeforeShowMenu, me));
                this.parentEl.on('shown.bs.dropdown',   _.bind(me.onAfterShowMenu, me));
                this.parentEl.on('hide.bs.dropdown',    _.bind(me.onBeforeHideMenu, me));
                this.parentEl.on('hidden.bs.dropdown',  _.bind(me.onAfterHideMenu, me));
                this.parentEl.on('keydown.after.bs.dropdown', _.bind(me.onAfterKeydownMenu, me));

                menuRoot.hover(
                    function(e) { me.isOver = true;},
                    function(e) { me.isOver = false; }
                );
            }

            this.rendered = true;

            this.trigger('render:after', this);

            return this;
        },

        resetItems: function(items) {
            this.items = items || [];
            this.$items = null;
            var template = _.template([
                                '<% _.each(items, function(item) { %>',
                                    '<% if (!item.id) item.id = Common.UI.getId(); %>',
                                    '<% item.checked = item.checked || false;  %>',
                                    '<li><%= itemTemplate(item) %></li>',
                                '<% }) %>'
                            ].join(''));
            this.cmpEl && this.cmpEl.html(template({
                items: this.items,
                itemTemplate: this.itemTemplate,
                options : this.options
            }));
        },

        isVisible: function() {
            return this.rendered && (this.cmpEl.is(':visible'));
        },

        show: function() {
            if (this.rendered && this.parentEl && !this.parentEl.hasClass('open')) {
                this.cmpEl.dropdown('toggle');
            }
        },

        hide: function() {
            if (this.rendered && this.parentEl) {
                if ( this.parentEl.hasClass('open') )
                    this.cmpEl.dropdown('toggle');
                else if (this.parentEl.hasClass('over'))
                    this.parentEl.removeClass('over');
            }
        },

        onItemClick: function(e) {
            if (e.which != 1 && e.which !== undefined)
                return false;

            var index = $(e.currentTarget).closest('li').index(),
                item = (index>=0) ? this.items[index] : null;
            if (!item) return;

            if (item.disabled)
                return false;

            if (item.checkable && !item.checked)
                this.setChecked(index, !item.checked);

            this.isOver = false;
            if (item.stopPropagation) {
                e.stopPropagation();
                var me = this;
                _.delay(function(){
                    me.$el.parent().parent().find('[data-toggle=dropdown]').focus();
                }, 10);
                return;
            }
            this.trigger('item:click', this, item, e);
        },

        onItemMouseDown: function(e) {
            if (e.which != 1) {
                e.preventDefault();
                e.stopPropagation();

                return false;
            }
            e.stopPropagation();
        },

        setChecked: function(index, check, suppressEvent) {
            this.toggle(index, check, suppressEvent);
        },

        toggle: function(index, toggle, suppressEvent) {
            var state = !!toggle;
            var item = this.items[index];

            this.clearAll();

            if (item && item.checkable) {
                item.checked = state;

                if (this.rendered) {
                    var itemEl = item.el || this.cmpEl.find('#'+item.id);
                    if (itemEl) {
                        itemEl.toggleClass('checked', item.checked);
                        if (!_.isEmpty(item.iconCls)) {
                            itemEl.css('background-image', 'none');
                        }
                    }
                }

                if (!suppressEvent)
                    this.trigger('item:toggle', this, item, state);
            }
        },

        setDisabled: function(disabled) {
            this.disabled = !!disabled;

            if (this.rendered)
                this.cmpEl.toggleClass('disabled', this.disabled);
        },

        isDisabled: function() {
            return this.disabled;
        },

        onBeforeShowMenu: function(e) {
            Common.NotificationCenter.trigger('menu:show');
            this.trigger('show:before', this, e);
            (e && e.target===e.currentTarget) && this.alignPosition();
        },

        onAfterShowMenu: function(e) {
            this.trigger('show:after', this, e);
            if (this.scroller && e && e.target===e.currentTarget) {
                this.scroller.update({alwaysVisibleY: this.scrollAlwaysVisible});
                var menuRoot = this.menuRoot,
                    $selected = menuRoot.find('> li .checked');
                if ($selected.length) {
                    var itemTop = $selected.position().top,
                        itemHeight = $selected.outerHeight(),
                        listHeight = menuRoot.outerHeight();
                    if (!!this.options.scrollToCheckedItem && (itemTop < 0 || itemTop + itemHeight > listHeight)) {
                        var height = menuRoot.scrollTop() + itemTop + (itemHeight - listHeight)/2;
                        height = (Math.floor(height/itemHeight) * itemHeight);
                        menuRoot.scrollTop(height);
                    }
                    !!this.options.focusToCheckedItem && setTimeout(function(){$selected.focus();}, 1);
                }
            }
            this._search = {};
            if (this.search && !this.$items) {
                var me = this;
                this.$items = this.menuRoot.find('> li').find('> a');
                _.each(this.$items, function(item, index) {
                    me.items[index].el = $(item);
                });
            }
        },

        onBeforeHideMenu: function(e) {
            this.trigger('hide:before', this, e);

            if (Common.UI.Scroller.isMouseCapture())
                e.preventDefault();
        },

        onAfterHideMenu: function(e, isFromInputControl) {
            this.trigger('hide:after', this, e, isFromInputControl);
            Common.NotificationCenter.trigger('menu:hide', this, isFromInputControl);
        },

        onAfterKeydownMenu: function(e) {
            if (e.keyCode == Common.UI.Keys.RETURN) {
                var li = $(e.target).closest('li');
                if (li.length<=0) li = $(e.target).parent().find('li .dataview');
                if (li.length>0) li.click();
                if (!li.hasClass('dropdown-submenu'))
                    Common.UI.Menu.Manager.hideAll();
                if ( $(e.currentTarget).closest('li').hasClass('dropdown-submenu')) {
                    e.stopPropagation();
                    return false;
                }
            } else if (e.keyCode == Common.UI.Keys.UP || e.keyCode == Common.UI.Keys.DOWN)  {
                this.fromKeyDown = true;
            } else if (e.keyCode == Common.UI.Keys.ESC)  {
//                    Common.NotificationCenter.trigger('menu:afterkeydown', e);
//                    return false;
            } else if (this.search && e.keyCode > 64 && e.keyCode < 91 && e.key){
                var me = this;
                clearTimeout(this._search.timer);
                this._search.timer = setTimeout(function () { me._search = {}; }, 1000);

                (!this._search.text) && (this._search.text = '');
                (!this._search.char) && (this._search.char = e.key);
                (this._search.char !== e.key) && (this._search.full = true);
                this._search.text += e.key;
                if (this._search.index===undefined) {
                    this._search.index = this.$items.index(this.$items.filter(':focus'));
                }
                this.selectCandidate();
            }
        },

        selectCandidate: function() {
            var index = (this._search.index && this._search.index != -1) ? this._search.index : 0,
                re = new RegExp('^' + ((this._search.full) ? this._search.text : this._search.char), 'i'),
                isFirstCharsEqual = re.test(this.items[index].caption),
                itemCandidate, idxCandidate;

            for (var i=0; i<this.items.length; i++) {
                var item = this.items[i];
                if (re.test(item.caption)) {
                    if (!itemCandidate) {
                        itemCandidate = item;
                        idxCandidate = i;
                        if(!isFirstCharsEqual) 
                            break;                    
                    }
                    if (this._search.full && i==index || i>index) {
                        itemCandidate = item;
                        idxCandidate = i;
                        break;
                    }
                }
            }

            if (itemCandidate) {
                this._search.index = idxCandidate;
                var item = itemCandidate.el;
                if (this.scroller) {
                    this.scroller.update({alwaysVisibleY: this.scrollAlwaysVisible});
                    var itemTop = item.position().top,
                        itemHeight = item.outerHeight(),
                        listHeight = this.menuRoot.outerHeight();
                    if (itemTop < 0 || itemTop + itemHeight > listHeight) {
                        var height = this.menuRoot.scrollTop() + itemTop;
                        height = (Math.floor(height/itemHeight) * itemHeight);
                        this.menuRoot.scrollTop(height);
                    }
                }
                item.focus();
            }
        },

        setOffset: function(offsetX, offsetY) {
            this.offset[0] = _.isUndefined(offsetX) ? this.offset[0] : offsetX;
            this.offset[1] = _.isUndefined(offsetY) ? this.offset[1] : offsetY;
            this.alignPosition();
        },

        getOffset: function() {
            return this.offset;
        },

        alignPosition: function(fixedAlign, fixedOffset) {
            var menuRoot = this.menuRoot,
                menuParent  = this.menuAlignEl || menuRoot.parent(),
                m           = this.menuAlign.match(/^([a-z]+)-([a-z]+)/),
                offset      = menuParent.offset(),
                docW        = Common.Utils.innerWidth(),
                docH        = Common.Utils.innerHeight() - 10, // Yep, it's magic number
                menuW       = menuRoot.outerWidth(),
                menuH       = menuRoot.outerHeight(),
                parentW     = menuParent.outerWidth(),
                parentH     = menuParent.outerHeight();

            var posMenu = {
                'tl': [0, 0],
                'bl': [0, menuH],
                'tr': [menuW, 0],
                'br': [menuW, menuH]
            };
            var posParent = {
                'tl': [0, 0],
                'tr': [parentW, 0],
                'bl': [0, parentH],
                'br': [parentW, parentH]
            };
            var left = offset.left - posMenu[m[1]][0] + posParent[m[2]][0] + this.offset[0];
            var top  = offset.top  - posMenu[m[1]][1] + posParent[m[2]][1] + this.offset[1];

            if (left + menuW > docW) {
                if (menuParent.is('li.dropdown-submenu')) {
                    left = offset.left - menuW + 2;
                } else {
                    left = docW - menuW;
                }
            } else if (left < 0) {
                if (menuParent.is('li.dropdown-submenu')) {
                    left = offset.left + parentW - 2;
                } else {
                    left = 0;
                }
            }
            if (left < 0)
                left = 0;

            if (this.options.restoreHeight) {
                if (typeof (this.options.restoreHeight) == "number") {
                    if (top + menuH > docH) {
                        menuRoot.css('max-height', (docH - top) + 'px');
                        (!this.scroller) && (this.scroller = new Common.UI.Scroller({
                            el: this.$el.find('.dropdown-menu '),
                            minScrollbarLength: 30,
                            suppressScrollX: true,
                            alwaysVisibleY: this.scrollAlwaysVisible
                        }));
                    } else if ( top + menuH < docH && menuRoot.height() < this.options.restoreHeight) {
                        menuRoot.css('max-height', (Math.min(docH - top, this.options.restoreHeight)) + 'px');
                    }
                }
            } else {
                if (top + menuH > docH) {
                    if (fixedAlign && typeof fixedAlign == 'string') { // how to align if menu height > window height
                        m = fixedAlign.match(/^([a-z]+)-([a-z]+)/);
                        top  = offset.top  - posMenu[m[1]][1] + posParent[m[2]][1] + this.offset[1] + (fixedOffset || 0);
                    } else
                        top = docH - menuH;
                }

                if (top < 0)
                    top = 0;
            }

            if (this.options.additionalAlign)
                this.options.additionalAlign.call(this, menuRoot, left, top);
            else
                menuRoot.css({left: Math.ceil(left), top: Math.ceil(top)});
        },

        clearAll: function() {
            this.cmpEl && this.cmpEl.find('li > a.checked').removeClass('checked');
            _.each(this.items, function(item){
                item.checked = false;
            });
        }
    });

});