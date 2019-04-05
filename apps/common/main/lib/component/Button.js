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
 *  Button.js
 *
 *  Created by Alexander Yuzhin on 1/20/14
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

/**
 *  Using template
 *
 *  A simple button with text:
 *  <button type="button" class="btn" id="id-button">Caption</button>
 *
 *  A simple button with icon:
 *  <button type="button" class="btn" id="id-button"><span class="icon">&nbsp;</span></button>
 *
 *  A button with menu:
 *  <div class="btn-group" id="id-button">
 *      <button type="button" class="btn dropdown-toggle" data-toggle="dropdown">
 *          <span class="icon">&nbsp;</span>
 *          <span class="caret"></span>
 *      </button>
 *      <ul class="dropdown-menu" role="menu">
 *      </ul>
 *  </div>
 *
 *  A split button:
 *  <div class="btn-group split" id="id-button">
 *      <button type="button" class="btn"><span class="icon">&nbsp;</span></button>
 *      <button type="button" class="btn dropdown-toggle" data-toggle="dropdown">
 *          <span class="caret"></span>
 *          <span class="sr-only"></span>
 *      </button>
 *      <ul class="dropdown-menu" role="menu">
 *      </ul>
 *  </div>
 *
 *   A useful classes of button size
 *
 *  - `'small'`
 *  - `'normal'`
 *  - `'large'`
 *  - `'huge'`
 *
 *  A useful classes of button type
 *
 *  - `'default'`
 *  - `'active'`
 *
 *
 *  Buttons can also be toggled. To enable this, you simple set the {@link #enableToggle} property to `true`.
 *
 *  Example usage:
 *      new Common.UI.Button({
 *          el: $('#id'),
 *          enableToggle: true
 *      });
 *
 *
 *  @property {Boolean} disabled
 *  True if this button is disabled. Read-only.
 *
 *  disabled: false,
 *
 *
 *  @property {Boolean} pressed
 *  True if this button is pressed (only if enableToggle = true). Read-only.
 *
 *  pressed: false,
 *
 *
 *  @cfg {Boolean} [allowDepress=true]
 *  False to not allow a pressed Button to be depressed. Only valid when {@link #enableToggle} is true.
 *
 *  @cfg {String/Object} hint
 *  The tooltip for the button - can be a string to be used as bootstrap tooltip
 *
 */

if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/component/BaseView',
    'common/main/lib/component/ToggleManager'
], function () {
    'use strict';

    window.createButtonSet = function() {
        function ButtonsArray(args) {};
        ButtonsArray.prototype = new Array;
        ButtonsArray.prototype.constructor = ButtonsArray;

        var _disabled = false;

        ButtonsArray.prototype.add = function(button) {
            button.setDisabled(_disabled);
            this.push(button);
        };

        ButtonsArray.prototype.setDisabled = function(disable) {
            // if ( _disabled != disable ) //bug when disable buttons outside the group
            {
                _disabled = disable;

                this.forEach( function(button) {
                    button.setDisabled(disable);
                });
            }
        };

        ButtonsArray.prototype.toggle = function(state, suppress) {
            this.forEach(function(button) {
                button.toggle(state, suppress);
            });
        };

        ButtonsArray.prototype.pressed = function() {
            return this.some(function(button) {
                return button.pressed;
            });
        };

        ButtonsArray.prototype.contains = function(id) {
            return this.some(function(button) {
                return button.id == id;
            });
        };

        ButtonsArray.prototype.concat = function () {
            var args = Array.prototype.slice.call(arguments);
            var result = Array.prototype.slice.call(this);

            args.forEach(function(sub){
                if (sub instanceof Array )
                    Array.prototype.push.apply(result, sub);
                else if (sub)
                    result.push(sub);
            });

            return result;
        };

        var _out_array = Object.create(ButtonsArray.prototype);
        for ( var i in arguments ) {
            _out_array.add(arguments[i]);
        }

        return _out_array;
    };

    var templateBtnIcon =
            '<% if ( iconImg ) { %>' +
                '<img src="<%= iconImg %>">' +
            '<% } else { %>' +
                '<% if (/svgicon/.test(iconCls)) {' +
                    'print(\'<svg width="26" height="26" class=\"icon\"><use href=\"#\' + /svgicon\\s(\\S+)/.exec(iconCls)[1] + \'\"></use></svg>\');' +
                '} else ' +
                    'print(\'<i class=\"icon \' + iconCls + \'\">&nbsp;</i>\'); %>' +
            '<% } %>';

    var templateHugeCaption =
            '<button type="button" class="btn <%= cls %>" id="<%= id %>" > ' +
                '<div class="inner-box-icon">' +
                    templateBtnIcon +
                '</div>' +
                '<div class="inner-box-caption">' +
                    '<span class="caption"><%= caption %></span>' +
                '</div>' +
            '</button>';

    var templateHugeMenuCaption =
        '<div class="btn-group icon-top" id="<%= id %>" style="<%= style %>">' +
            '<button type="button" class="btn dropdown-toggle <%= cls %>" data-toggle="dropdown">' +
                '<div class="inner-box-icon">' +
                    templateBtnIcon +
                '</div>' +
                '<div class="inner-box-caption">' +
                    '<span class="caption"><%= caption %></span>' +
                    '<i class="caret img-commonctrl"></i>' +
                '</div>' +
            '</button>' +
        '</div>';

    var templateHugeSplitCaption =
        '<div class="btn-group x-huge split icon-top" id="<%= id %>" style="<%= style %>">' +
            '<button type="button" class="btn <%= cls %> inner-box-icon">' +
                '<span class="btn-fixflex-hcenter">' +
                    templateBtnIcon +
                '</span>' +
            '</button>' +
            '<button type="button" class="btn <%= cls %> inner-box-caption dropdown-toggle" data-toggle="dropdown">' +
                '<span class="btn-fixflex-vcenter">' +
                    '<span class="caption"><%= caption %></span>' +
                    '<i class="caret img-commonctrl"></i>' +
                '</span>' +
            '</button>' +
        '</div>';

    Common.UI.Button = Common.UI.BaseView.extend({
        options : {
            id              : null,
            hint            : false,
            enableToggle    : false,
            allowDepress    : true,
            toggleGroup     : null,
            cls             : '',
            iconCls         : '',
            caption         : '',
            menu            : null,
            disabled        : false,
            pressed         : false,
            split           : false,
            visible         : true
        },

        template: _.template([
            '<% var applyicon = function() { %>',
                '<% if (iconImg) { print(\'<img src=\"\' + iconImg + \'\">\'); } else { %>',
                // '<% if (iconCls != "") { print(\'<i class=\"icon \' + iconCls + \'\">&nbsp;</i>\'); }} %>',
                '<% if (iconCls != "") { ' +
                    ' if (/svgicon/.test(iconCls)) {' +
                        'print(\'<svg class=\"icon\"><use xlink:href=\"#\' + /svgicon\\s(\\S+)/.exec(iconCls)[1] + \'\"></use></svg>\');' +
                    '} else ' +
                        'print(\'<i class=\"icon \' + iconCls + \'\">&nbsp;</i>\'); ' +
                '}} %>',
            '<% } %>',
            '<% if ( !menu ) { %>',
                '<button type="button" class="btn <%= cls %>" id="<%= id %>" style="<%= style %>">',
                    '<% applyicon() %>',
                    '<span class="caption"><%= caption %></span>',
                '</button>',
            '<% } else if (split == false) {%>',
                '<div class="btn-group" id="<%= id %>" style="<%= style %>">',
                    '<button type="button" class="btn dropdown-toggle <%= cls %>" data-toggle="dropdown">',
                        '<% applyicon() %>',
                        '<span class="caption"><%= caption %></span>',
                        '<span class="inner-box-caret">' +
                            '<i class="caret img-commonctrl"></i>' +
                        '</span>',
                    '</button>',
                '</div>',
            '<% } else { %>',
                '<div class="btn-group split" id="<%= id %>" style="<%= style %>">',
                    '<button type="button" class="btn <%= cls %>">',
                        '<% applyicon() %>',
                        '<span class="caption"><%= caption %></span>',
                    '</button>',
                    '<button type="button" class="btn <%= cls %> dropdown-toggle" data-toggle="dropdown">',
                        '<i class="caret img-commonctrl"></i>',
                        '<span class="sr-only"></span>',
                    '</button>',
                '</div>',
            '<% } %>'
        ].join('')),

        initialize : function(options) {
            Common.UI.BaseView.prototype.initialize.call(this, options);

            var me = this;

            me.id           = me.options.id || Common.UI.getId();
            me.hint         = me.options.hint;
            me.enableToggle = me.options.enableToggle;
            me.allowDepress = me.options.allowDepress;
            me.cls          = me.options.cls;
            me.iconCls      = me.options.iconCls;
            me.menu         = me.options.menu;
            me.split        = me.options.split;
            me.toggleGroup  = me.options.toggleGroup;
            me.disabled     = me.options.disabled;
            me.visible      = me.options.visible;
            me.pressed      = me.options.pressed;
            me.caption      = me.options.caption;
            me.template     = me.options.template || me.template;
            me.style        = me.options.style;
            me.rendered     = false;

            if (me.options.el) {
                me.render();
            }
        },

        render: function(parentEl) {
            var me = this;

            me.trigger('render:before', me);

            me.cmpEl = $(me.el);

            if (parentEl) {
                me.setElement(parentEl, false);

                if (!me.rendered) {
                    if ( /icon-top/.test(me.cls) && !!me.caption && /huge/.test(me.cls) ) {
                        if ( me.split === true ) {
                            !!me.cls && (me.cls = me.cls.replace(/\s?(?:x-huge|icon-top)/g, ''));
                            this.template = _.template(templateHugeSplitCaption);
                        } else
                        if ( !!me.menu ) {
                            this.template = _.template(templateHugeMenuCaption);
                        } else {
                            this.template = _.template(templateHugeCaption);
                        }
                    }

                    me.cmpEl = $(this.template({
                        id           : me.id,
                        cls          : me.cls,
                        iconCls      : me.iconCls,
                        iconImg      : me.options.iconImg,
                        menu         : me.menu,
                        split        : me.split,
                        disabled     : me.disabled,
                        pressed      : me.pressed,
                        caption      : me.caption,
                        style        : me.style
                    }));

                    if (me.menu && _.isObject(me.menu) && _.isFunction(me.menu.render))
                        me.menu.render(me.cmpEl);

                    parentEl.html(me.cmpEl);
                    me.$icon = me.$el.find('.icon');
                }
            }

            if (!me.rendered) {
                var el = me.cmpEl,
                    isGroup = el.hasClass('btn-group'),
                    isSplit = el.hasClass('split');

                if (me.options.hint) {
                    var modalParents = me.cmpEl.closest('.asc-window');

                    if (typeof me.options.hint == 'object' && me.options.hint.length>1 && $('button', el).length>0) {
                        var btnEl = $('button', el);
                        me.btnEl = $(btnEl[0]);
                        me.btnMenuEl = $(btnEl[1]);
                    } else {
                        me.btnEl = me.cmpEl;
                        me.btnEl.attr('data-toggle', 'tooltip');
                    }
                    me.btnEl.tooltip({
                        title       : (typeof me.options.hint == 'string') ? me.options.hint : me.options.hint[0],
                        placement   : me.options.hintAnchor||'cursor'
                    });
                    me.btnMenuEl && me.btnMenuEl.tooltip({
                        title       : me.options.hint[1],
                        placement   : me.options.hintAnchor||'cursor'
                    });

                    if (modalParents.length > 0) {
                        me.btnEl.data('bs.tooltip').tip().css('z-index', parseInt(modalParents.css('z-index')) + 10);
                        me.btnMenuEl && me.btnMenuEl.data('bs.tooltip').tip().css('z-index', parseInt(modalParents.css('z-index')) + 10);
                    }
                }

                if (_.isString(me.toggleGroup)) {
                    me.enableToggle = true;
                }

                var buttonHandler = function(e) {
                    if (!me.disabled && e.which == 1) {
                        me.doToggle();
                        if (me.options.hint) {
                            var tip = me.btnEl.data('bs.tooltip');
                            if (tip) {
                                if (tip.dontShow===undefined)
                                    tip.dontShow = true;

                                tip.hide();
                            }
                        }
                        me.trigger('click', me, e);
                    }
                };

                var doSplitSelect = function(select, element, e) {
                    if (!select) {
                        // Is mouse under button
                        var isUnderMouse = false;

                        $('button', el).each(function(index, button){
                            if ($(button).is(':hover')) {
                                isUnderMouse = true;
                                return false;
                            }
                        });

                        if (!isUnderMouse) {
                            el.removeClass('over');
                            $('button', el).removeClass('over');
                        }
                    }

                    if ( element == 'button') {
                        if (!select && (me.enableToggle && me.allowDepress && me.pressed))
                            return;
                        if (select && !isSplit && (me.enableToggle && me.allowDepress && !me.pressed)) { // to depress button with menu
                            e.preventDefault();
                            return;
                        }

                        $('button:first', el).toggleClass('active', select);
                    } else
                        $('[data-toggle^=dropdown]', el).toggleClass('active', select);

                    el.toggleClass('active', select);
                };

                var menuHandler = function(e) {
                    if (!me.disabled && e.which == 1) {
                        if (isSplit) {
                            if (me.options.hint) {
                                var tip = (me.btnMenuEl ? me.btnMenuEl : me.btnEl).data('bs.tooltip');
                                if (tip) {
                                    if (tip.dontShow===undefined)
                                        tip.dontShow = true;

                                    tip.hide();
                                }
                            }
                            var isOpen = el.hasClass('open');
                            doSplitSelect(!isOpen, 'arrow', e);
                        }
                    }
                };

                var doSetActiveState = function(e, state) {
                    if (isSplit) {
                        doSplitSelect(state, 'button', e);
                    } else {
                        el.toggleClass('active', state);
                        $('button', el).toggleClass('active', state);
                    }
                };

                var splitElement;
                var onMouseDown = function (e) {
                    splitElement = e.currentTarget.className.match(/dropdown/) ? 'arrow' : 'button';
                    doSplitSelect(true, splitElement, e);
                    $(document).on('mouseup',   onMouseUp);
                };

                var onMouseUp = function (e) {
                    doSplitSelect(false, splitElement, e);
                    $(document).off('mouseup',   onMouseUp);
                };

                var onAfterHideMenu = function(e, isFromInputControl) {
                    me.cmpEl.find('.dropdown-toggle').blur();
                    if (me.cmpEl.hasClass('active') !== me.pressed) 
                        me.cmpEl.trigger('button.internal.active', [me.pressed]);
                };

                if (isGroup) {
                    if (isSplit) {
                        $('[data-toggle^=dropdown]', el).on('mousedown', _.bind(menuHandler, this));
                        $('button', el).on('mousedown', _.bind(onMouseDown, this));
                        (me.options.width>0) && $('button:first', el).css('width', me.options.width - $('[data-toggle^=dropdown]', el).outerWidth());
                    }

                    el.on('hide.bs.dropdown', _.bind(doSplitSelect, me, false, 'arrow'));
                    el.on('show.bs.dropdown', _.bind(doSplitSelect, me, true, 'arrow'));
                    el.on('hidden.bs.dropdown', _.bind(onAfterHideMenu, me));

                    $('button:first', el).on('click', buttonHandler);
                } else {
                    el.on('click', buttonHandler);
                }

                el.on('button.internal.active', _.bind(doSetActiveState, me));

                el.on('mouseover', function(e) {
                    if (!me.disabled) {
                        me.cmpEl.addClass('over');
                        me.trigger('mouseover', me, e);
                    }
                });

                el.on('mouseout', function(e) {
                    if (!me.disabled) {
                        me.cmpEl.removeClass('over');
                        me.trigger('mouseout', me, e);
                    }
                });

                // Register the button in the toggle manager
                Common.UI.ToggleManager.register(me);
            }

            me.rendered = true;

            if (me.pressed) {
                me.toggle(me.pressed, true);
            }

            if (me.disabled) {
                me.setDisabled(!(me.disabled=false));
            }

            if (!me.visible) {
                me.setVisible(me.visible);
            }

            me.trigger('render:after', me);

            return this;
        },

        doToggle: function(){
            var me = this;
            if (me.enableToggle && (me.allowDepress !== false || !me.pressed)) {
                me.toggle();
            }
        },

        toggle: function(toggle, suppressEvent) {
            var state = toggle === undefined ? !this.pressed : !!toggle;

            this.pressed = state;

            if (this.cmpEl)
                this.cmpEl.trigger('button.internal.active', [state]);

            if (!suppressEvent)
                this.trigger('toggle', this, state);
        },

        isActive: function() {
            if (this.enableToggle)
                return this.pressed;

            return this.cmpEl.hasClass('active')
        },

        setDisabled: function(disabled) {
            if (this.rendered && this.disabled != disabled) {
                var el = this.cmpEl,
                    isGroup = el.hasClass('btn-group'),
                    me = this;

                disabled = (disabled===true);

                if (disabled !== el.hasClass('disabled')) {
                    var decorateBtn = function(button) {
                        button.toggleClass('disabled', disabled);
                        if (!me.options.allowMouseEventsOnDisabled)
                            (disabled) ? button.attr({disabled: disabled}) : button.removeAttr('disabled');
                    };

                    decorateBtn(el);
                    isGroup && decorateBtn(el.children('button'));
                }

                if ((disabled || !Common.Utils.isGecko) && this.options.hint) {
                    var tip = this.btnEl.data('bs.tooltip');
                    if (tip) {
                        disabled && tip.hide();
                        !Common.Utils.isGecko && (tip.enabled = !disabled);
                    }
                    if (this.btnMenuEl) {
                        tip = this.btnMenuEl.data('bs.tooltip');
                        if (tip) {
                            disabled && tip.hide();
                            !Common.Utils.isGecko && (tip.enabled = !disabled);
                        }
                    }
                }

                if (disabled && this.menu && _.isObject(this.menu) && this.menu.rendered && this.menu.isVisible())
                    setTimeout(function(){ me.menu.hide()}, 1);

                if ( !!me.options.signals ) {
                    var opts = me.options.signals;
                    if ( !(opts.indexOf('disabled') < 0) ) {
                        me.trigger('disabled', me, disabled);
                    }
                }
            }

            this.disabled = disabled;
        },

        isDisabled: function() {
            return this.disabled;
        },

        setIconCls: function(cls) {
            var btnIconEl = $(this.el).find('.icon'),
                oldCls = this.iconCls;

            this.iconCls = cls;
            btnIconEl.removeClass(oldCls);
            btnIconEl.addClass(cls || '');
        },

        setVisible: function(visible) {
            if (this.cmpEl) this.cmpEl.toggleClass('hidden', !visible);
            this.visible = visible;
        },

        isVisible: function() {
            return (this.cmpEl) ? this.cmpEl.is(":visible") : $(this.el).is(":visible");
        },

        updateHint: function(hint) {
            this.options.hint = hint;

            if (!this.rendered) return;
            
            var cmpEl = this.cmpEl,
                modalParents = cmpEl.closest('.asc-window');


            if (!this.btnEl) {
                if (typeof this.options.hint == 'object' && this.options.hint.length>1 && $('button', cmpEl).length>0) {
                    var btnEl = $('button', cmpEl);
                    this.btnEl = $(btnEl[0]);
                    this.btnMenuEl = $(btnEl[1]);
                } else {
                    this.btnEl = cmpEl;
                    this.btnEl.attr('data-toggle', 'tooltip');
                }
            }

            if (this.btnEl.data('bs.tooltip'))
                this.btnEl.removeData('bs.tooltip');
            if (this.btnMenuEl && this.btnMenuEl.data('bs.tooltip'))
                this.btnMenuEl.removeData('bs.tooltip');

            this.btnEl.tooltip({
                title       : (typeof hint == 'string') ? hint : hint[0],
                placement   : this.options.hintAnchor||'cursor'
            });
            this.btnMenuEl && this.btnMenuEl.tooltip({
                title       : hint[1],
                placement   : this.options.hintAnchor||'cursor'
            });

            if (modalParents.length > 0) {
                this.btnEl.data('bs.tooltip').tip().css('z-index', parseInt(modalParents.css('z-index')) + 10);
                this.btnMenuEl && this.btnMenuEl.data('bs.tooltip').tip().css('z-index', parseInt(modalParents.css('z-index')) + 10);
            }

            if (this.disabled || !Common.Utils.isGecko) {
                var tip = this.btnEl.data('bs.tooltip');
                if (tip) {
                    this.disabled && tip.hide();
                    !Common.Utils.isGecko && (tip.enabled = !this.disabled);
                }
                if (this.btnMenuEl) {
                    tip = this.btnMenuEl.data('bs.tooltip');
                    if (tip) {
                        this.disabled && tip.hide();
                        !Common.Utils.isGecko && (tip.enabled = !this.disabled);
                    }
                }
            }
        },

        setCaption: function(caption) {
            if (this.caption != caption) {
                this.caption = caption;

                if (this.rendered) {
                    var captionNode = this.cmpEl.find('button:first > .caption').addBack().filter('button > .caption');

                    if (captionNode.length > 0) {
                        captionNode.text(caption);
                    } else {
                        this.cmpEl.find('button:first').addBack().filter('button').text(caption);
                    }
                }
            }
        },

        setMenu: function (m) {
            if (m && _.isObject(m) && _.isFunction(m.render)){
                this.menu = m;
                if (this.rendered)
                    this.menu.render(this.cmpEl);
            }
        }
    });
});

