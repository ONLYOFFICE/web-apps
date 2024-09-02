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
 *  MenuItem.js
 *
 *  A base class for all menu items that require menu-related functionality such as click handling,
 *  sub-menus, icons, etc.
 *
 *  Created on 1/27/14
 *
 */

/**
 *  Default template
 *
 *  Simple menu item:
 *  <li><a href="#">Caption</a></li>
 *
 *  Separator:
 *  <li class="divider"></li>
 *
 *  Menu item with sub-menu:
 *  <li class="dropdown-submenu">
 *      <a href="#">Sub-menu item</a>
 *      <ul class="dropdown-menu"></ul>
 *  </li>
 *
 *
 *  Example usage:
 *
 *      new Common.UI.MenuItem({
 *          caption: 'View Compact Toolbar',
 *          checkable: true,
 *          menu: {
 *              items: [
 *                  { caption: 'Menu item 1', value: 'value-1' },
 *                  { caption: 'Menu item 2', value: 'value-2' },
 *                  new Common.UI.MenuItem({ caption: 'Menu item 3', value: 'value-3' })
 *              ]
 *          }
 *      });
 *
 *  @property {Object} value
 *
 *  @property {Common.UI.Menu} menu
 *
 *
 */


if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/component/BaseView',
    'common/main/lib/component/ToggleManager'
], function () {
    'use strict';

    Common.UI.MenuItem = Common.UI.BaseView.extend({
        options : {
            id          : null,
            cls         : '',
            style       : '',
            hint        : false,
            checkable   : false,
            checked     : false,
            allowDepress: false,
            disabled    : false,
            visible     : true,
            value       : null,
            toggleGroup : null,
            iconCls     : '',
            menu        : null,
            canFocused  : true,
            dataHint    : '',
            dataHintDirection: '',
            dataHintOffset: '',
            dataHintTitle: '',
            scaling: true
        },

        tagName : 'li',

        template: _.template([
            '<a id="<%= id %>" class="menu-item" style="<%= style %>" <% if(options.canFocused) { %> tabindex="-1" type="menuitem" <% }; if(!_.isUndefined(options.stopPropagation)) { %> data-stopPropagation="true" <% }; if(!_.isUndefined(options.dataHint)) { %> data-hint="<%= options.dataHint %>" <% }; if(!_.isUndefined(options.dataHintDirection)) { %> data-hint-direction="<%= options.dataHintDirection %>" <% }; if(!_.isUndefined(options.dataHintOffset)) { %> data-hint-offset="<%= options.dataHintOffset %>" <% }; if(options.dataHintTitle) { %> data-hint-title="<%= options.dataHintTitle %>" <% }; %> >',
                '<% if (!_.isEmpty(iconCls)) { %>',
                    '<span class="menu-item-icon <%= iconCls %>"></span>',
                '<% } else if (!_.isEmpty(iconImg)) { %>',
                    '<img src="<%= iconImg %>" class="menu-item-icon">',
                '<% } %>',
                '<%- caption %>',
            '</a>'
        ].join('')),

        initialize : function(options) {
            Common.UI.BaseView.prototype.initialize.call(this, options);

            var me = this;

            this.id             = me.options.id || Common.UI.getId();
            this.cls            = me.options.cls;
            this.style          = me.options.style;
            this.caption        = me.options.caption;
            this.menu           = me.options.menu || null;
            this.checkable      = me.options.checkable;
            this.checked        = me.options.checked;
            me.allowDepress     = me.options.allowDepress;
            this.disabled       = me.options.disabled;
            this.visible        = me.options.visible;
            this.value          = me.options.value;
            this.toggleGroup    = me.options.toggleGroup;
            this.template       = me.options.template || this.template;
            this.iconCls        = me.options.iconCls;
            this.hint           = me.options.hint;
            this.rendered       = false;

            if (this.menu !== null && !(this.menu instanceof Common.UI.Menu) && !(this.menu instanceof Common.UI.MenuSimple)) {
                this.menu = new Common.UI.Menu(_.extend({}, me.options.menu));
            }

            if (me.options.el)
                this.render();
        },

        render: function() {
            var me = this,
                el = me.$el || $(this.el);

            me.cmpEl = el;
            me.trigger('render:before', me);

            if (me.caption === '--') {
                el.addClass('divider');
            } else {
                if (!this.rendered) {
                    el.off('click');
                    Common.UI.ToggleManager.unregister(me);

                    el.html(this.template({
                        id      : me.id,
                        caption : me.caption,
                        iconCls : me.iconCls,
                        iconImg : me.options.iconImg,
                        style   : me.style,
                        options : me.options
                    }));

                    if (me.menu) {
                        el.addClass('dropdown-submenu');

                        me.menu.render(el);
                        el.mouseenter(_.bind(me.menu.alignPosition, me.menu));
//                        el.focusin(_.bind(me.onFocusItem, me));
                        el.focusout(_.bind(me.onBlurItem, me));
                        el.hover(
                            _.bind(me.onHoverItem, me),
                            _.bind(me.onUnHoverItem, me)
                        );
                    }

                    var firstChild = el.children(':first');

                    if (this.checkable && firstChild) {
                        firstChild.toggleClass('checkable', this.checkable);
                        firstChild.toggleClass('no-checkmark', this.options.checkmark===false);
                        firstChild.toggleClass('checked', this.checked);
                        if (!_.isEmpty(this.iconCls)) {
                            firstChild.css('background-image', 'none');
                        }
                    }

                    if (me.options.hint) {
                        el.attr('data-toggle', 'tooltip');
                        el.tooltip({
                            title       : me.options.hint,
                            placement   : me.options.hintAnchor||function(tip, element) {
                                var pos = Common.Utils.getBoundingClientRect(element),
                                    actualWidth = tip.offsetWidth,
                                    actualHeight = tip.offsetHeight,
                                    innerWidth = Common.Utils.innerWidth(),
                                    innerHeight = Common.Utils.innerHeight();
                                var top = pos.top,
                                    left = pos.left + pos.width + 2;
                                if (top + actualHeight > innerHeight) {
                                    top = innerHeight - actualHeight - 2;
                                }
                                if (left + actualWidth > innerWidth) {
                                    left = pos.left - actualWidth - 2;
                                }
                                $(tip).offset({top: top,left: left}).addClass('in');
                            }
                        });
                    }

                    if (this.cls)
                        el.addClass(this.cls);

                    if (this.disabled)
                        el.toggleClass('disabled', this.disabled);

                    el.on('click',      _.bind(this.onItemClick, this));
                    el.on('mousedown',  _.bind(this.onItemMouseDown, this));

                    Common.UI.ToggleManager.register(me);

                    if (me.options.scaling !== false && me.iconCls) {
                        el.attr('ratio', 'ratio');
                        me.applyScaling(Common.UI.Scaling.currentRatio());

                        el.on('app:scaling', function (e, info) {
                            if ( me.options.scaling != info.ratio ) {
                                me.applyScaling(info.ratio);
                            }
                        });
                    }
                }
            }
            if (!this.visible)
                this.setVisible(this.visible);

            me.rendered = true;

            me.trigger('render:after', me);

            return this;
        },

        setCaption: function(caption) {
            this.caption = caption;

            if (this.rendered)
                this.cmpEl.find('> a').contents().last()[0].textContent = caption;
        },

        setIconCls: function(iconCls) {
            if (this.rendered && !_.isEmpty(this.iconCls)) {
                var firstChild = this.cmpEl.children(':first');
                if (firstChild) {
                    firstChild.find('.menu-item-icon').removeClass(this.iconCls).addClass(iconCls);
                    var svgIcon = firstChild.find('use.zoom-int');
                    if (svgIcon.length) {
                        var re_icon_name = /btn-[^\s]+/.exec(iconCls),
                            icon_name = re_icon_name ? re_icon_name[0] : "null";
                        svgIcon.attr('href', '#' + icon_name);
                    }
                }
            }
            this.iconCls = iconCls;
        },

        setChecked: function(check, suppressEvent) {
            this.toggle(check, suppressEvent);
        },

        isChecked: function() {
            return this.checked;
        },

        setDisabled: function(disabled) {
            this.disabled = !!disabled;

            if (this.rendered)
                this.cmpEl.toggleClass('disabled', this.disabled);
        },

        isDisabled: function() {
            return this.disabled;
        },

        toggle: function(toggle, suppressEvent) {
            var state = toggle === undefined ? !this.checked : !!toggle;

            if (this.checkable) {
                this.checked = state;

                if (this.rendered) {
                    var firstChild = this.cmpEl.children(':first');

                    if (firstChild) {
                        firstChild.toggleClass('checked', this.checked);
                        if (!_.isEmpty(this.iconCls)) {
                            firstChild.css('background-image', 'none');
                        }
                    }
                }

                if (!suppressEvent)
                    this.trigger('toggle', this, state);
            }
        },

        onItemMouseDown: function(e) {
            Common.UI.HintManager && Common.UI.HintManager.clearHints();
            if (e.which != 1) {
                e.preventDefault();
                e.stopPropagation();

                return false;
            }
            e.stopPropagation();
        },

        onItemClick: function(e) {
            if (e.which != 1 && (e.which !== undefined || this.menu))
                return false;

            if (!this.disabled && (this.allowDepress || !(this.checked && this.toggleGroup)) && !this.menu)
                this.setChecked(!this.checked);

            if (this.menu) {
                if (e.target.id == this.id) {
                    return false;
                }

                if (!this.menu.isOver)
                    this.cmpEl.removeClass('over');

                return;
            }

            if (!this.disabled) {
                this.trigger('click', this, e);
            } else {
                return false;
            }
        },

        onHoverItem: function(e) {
            this._doHover(e);
//            $('a', this.cmpEl).focus();
        },

        onUnHoverItem: function(e) {
            this._doUnHover(e);
//            $('a', this.cmpEl).blur();
        },

//        onFocusItem: function(e) {
//            this._doHover(e);
//        },

        onBlurItem: function(e) {
            this._doUnHover(e);
        },

        _doHover: function(e) {
            var me = this;

            if (me.menu && !me.disabled) {
                clearTimeout(me.hideMenuTimer);

                me.cmpEl.trigger('show.bs.dropdown');
                me.expandMenuTimer = _.delay(function(){
                    me.cmpEl.addClass('over');
                    me.cmpEl.trigger('shown.bs.dropdown');
                }, 200);
            }
        },

        _doUnHover: function(e) {
            var me = this;
            if (me.cmpEl.hasClass('dropdown-submenu') && me.cmpEl.hasClass('over') &&
               (e && e.relatedTarget && me.cmpEl.find(e.relatedTarget).length>0 || me.cmpEl.hasClass('focused-submenu'))) {
                // When focus go from menuItem to it's submenu don't hide this submenu
                me.cmpEl.removeClass('focused-submenu');
                return;
            }
            if (me.menu && !me.disabled) {
                clearTimeout(me.expandMenuTimer);

                me.hideMenuTimer = _.delay(function(){
                    if (!me.menu.isOver)
                        me.cmpEl.removeClass('over');
                }, 200);

                if (e && e.type !== 'focusout') { // when mouseleave from clicked menu item with submenu
                    var focused = me.cmpEl.children(':focus');
                    if (focused.length>0) {
                        focused.blur();
                        me.cmpEl.closest('ul').focus();
                    }
                }
            }
        },

        setMenu: function (m) {
            if (m && _.isObject(m) && _.isFunction(m.render)){
                if (this.rendered) {
                    if (this.menu && (this.menu instanceof Common.UI.Menu || this.menu instanceof Common.UI.MenuSimple)) {
                        Common.UI.Menu.Manager.unregister(this.menu);
                        this.menu.cmpEl && this.menu.cmpEl.remove();
                    }
                    this.menu = m;
                    var el = this.cmpEl;
                    el.addClass('dropdown-submenu');
                    this.menu.render(el);
                    el.mouseenter(_.bind(this.menu.alignPosition, this.menu));
                    el.focusout(_.bind(this.onBlurItem, this));
                    el.hover(
                        _.bind(this.onHoverItem, this),
                        _.bind(this.onUnHoverItem, this)
                    );
                } else
                    this.menu = m;
            }
        },

        applyScaling: function (ratio) {
            var me = this;
            if (me.options.scaling != ratio) {
                me.options.scaling = ratio;
                var firstChild = this.cmpEl.children(':first');

                if (ratio > 2) {
                    if (!firstChild.find('svg.menu-item-icon').length) {
                        var iconCls = me.iconCls,
                            re_icon_name = /btn-[^\s]+/.exec(iconCls),
                            icon_name = re_icon_name ? re_icon_name[0] : "null",
                            rtlCls = (iconCls ? iconCls.indexOf('icon-rtl') : -1) > -1 ? 'icon-rtl' : '',
                            svg_icon = '<svg class="menu-item-icon %rtlCls"><use class="zoom-int" href="#%iconname"></use></svg>'.replace('%iconname', icon_name).replace('%rtlCls', rtlCls);

                        firstChild.find('span.menu-item-icon').after(svg_icon);
                    }
                }
            }
        }
    });

    Common.UI.MenuItemSeparator = function(options) {
        options = options || {};
        options.caption = '--';
        return new Common.UI.MenuItem(options);
    };
});