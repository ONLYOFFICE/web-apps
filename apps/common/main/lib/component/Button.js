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
 *  Button.js
 *
 *  Created on 1/20/14
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
                    'print(\'<svg class=\"icon uni-scale\"><use class=\"zoom-int\" xlink:href=\"#\' + /svgicon\\s(\\S+)/.exec(iconCls)[1] + \'\"></use></svg>\');' +
            '} else ' +
                    'print(\'<i class=\"icon \' + iconCls + \'\">&nbsp;</i>\'); %>' +
            '<% } %>';

    var templateBtnCaption =
        '<%= caption %>' +
        '<i class="caret"></i>';

    var templateHugeCaption =
            '<button type="button" class="btn <%= cls %>" id="<%= id %>" style="<%= style %>" data-hint="<%= dataHint %>" data-hint-direction="<%= dataHintDirection %>" data-hint-offset="<%= dataHintOffset %>" <% if (dataHintTitle) { %> data-hint-title="<%= dataHintTitle %>" <% } %>> ' +
                '<div class="inner-box-icon">' +
                    templateBtnIcon +
                '</div>' +
                '<div class="inner-box-caption">' +
                    '<span class="caption"><%= caption %></span>' +
                '</div>' +
            '</button>';

    var templateHugeMenuCaption =
        '<div class="btn-group icon-top" id="<%= id %>" style="<%= style %>">' +
            '<button type="button" class="btn dropdown-toggle <%= cls %>" data-toggle="dropdown" data-hint="<%= dataHint %>" data-hint-direction="<%= dataHintDirection %>" data-hint-offset="<%= dataHintOffset %>" <% if (dataHintTitle) { %> data-hint-title="<%= dataHintTitle %>" <% } %>>' +
                '<div class="inner-box-icon">' +
                    templateBtnIcon +
                '</div>' +
                '<div class="inner-box-caption">' +
                    '<span class="caption">' + templateBtnCaption + '</span>' +
                    '<i class="caret compact-caret"></i>' +
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
            '<button type="button" class="btn <%= cls %> inner-box-caption dropdown-toggle" data-toggle="dropdown" data-hint="<%= dataHint %>" data-hint-direction="<%= dataHintDirection %>" data-hint-offset="<%= dataHintOffset %>" <% if (dataHintTitle) { %> data-hint-title="<%= dataHintTitle %>" <% } %>>' +
                '<span class="btn-fixflex-vcenter">' +
                    '<span class="caption">' + templateBtnCaption + '</span>' +
                    '<i class="caret compact-caret"></i>' +
                '</span>' +
            '</button>' +
        '</div>';

    var getWidthOfCaption = function (txt) {
        var el = document.createElement('span');
        el.style.fontSize = document.documentElement.style.getPropertyValue("--font-size-base-app-custom") || '11px';
        el.style.fontFamily = 'Arial, Helvetica, "Helvetica Neue", sans-serif';
        el.style.position = "absolute";
        el.style.top = '-1000px';
        el.style.left = '-1000px';
        el.innerHTML = txt;
        document.body.appendChild(el);
        var result = el.offsetWidth;
        document.body.removeChild(el);
        return result;
    };

    var getShortText = function (txt, max) {
        var lastIndex = txt.length - 1,
            word = txt;
        while (getWidthOfCaption(word) > max) {
            word = txt.slice(0, lastIndex).trim() + '...';
            lastIndex--;
        }
        return word;
    };

    Common.UI.Button = Common.UI.BaseView.extend({
        options : {
            id              : null,
            hint            : false,
            delayRenderHint : true,
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
            visible         : true,
            dataHint        : '',
            dataHintDirection: '',
            dataHintOffset: '0, 0',
            scaling         : true,
            canFocused      : false, // used for button with menu
            takeFocusOnClose: false // used for button with menu, for future use in toolbar when canFocused=true, but takeFocusOnClose=false
        },

        template: _.template([
            '<% var applyicon = function() { %>',
                '<% if (iconImg) { print(\'<img src=\"\' + iconImg + \'\">\'); } else { %>',
                // '<% if (iconCls != "") { print(\'<i class=\"icon \' + iconCls + \'\">&nbsp;</i>\'); }} %>',
                '<% if (iconCls != "") { ' +
                    ' if (/svgicon/.test(iconCls)) {' +
                        'print(\'<svg class=\"icon uni-scale\"><use class=\"zoom-int\" xlink:href=\"#\' + /svgicon\\s(\\S+)/.exec(iconCls)[1] + \'\"></use></svg>\');' +
                    '} else ' +
                        'print(\'<i class=\"icon \' + iconCls + \'\">&nbsp;</i>\'); ' +
                '}} %>',
            '<% } %>',
            '<% if ( !menu && onlyIcon ) { %>',
                '<button type="button" class="btn <%= cls %>" id="<%= id %>" style="<%= style %>" data-hint="<%= dataHint %>" data-hint-direction="<%= dataHintDirection %>" data-hint-offset="<%= dataHintOffset %>" <% if (dataHintTitle) { %> data-hint-title="<%= dataHintTitle %>" <% } %>>',
                    '<% applyicon() %>',
                '</button>',
            '<% } else if ( !menu ) { %>',
                '<button type="button" class="btn <%= cls %>" id="<%= id %>" style="<%= style %>" data-hint="<%= dataHint %>" data-hint-direction="<%= dataHintDirection %>" data-hint-offset="<%= dataHintOffset %>" <% if (dataHintTitle) { %> data-hint-title="<%= dataHintTitle %>" <% } %>>',
                    '<% applyicon() %>',
                    '<span class="caption"><%= caption %></span>',
                '</button>',
            '<% } else if (onlyIcon) {%>',
                '<div class="btn-group" id="<%= id %>" style="<%= style %>">',
                    '<button type="button" class="btn dropdown-toggle <%= cls %>" data-toggle="dropdown" data-hint="<%= dataHint %>" data-hint-direction="<%= dataHintDirection %>" data-hint-offset="<%= dataHintOffset %>" <% if (dataHintTitle) { %> data-hint-title="<%= dataHintTitle %>" <% } %>>',
                        '<% applyicon() %>',
                    '</button>',
                '</div>',
            '<% } else if (split == false) {%>',
                '<div class="btn-group" id="<%= id %>" style="<%= style %>">',
                    '<button type="button" class="btn dropdown-toggle <%= cls %>" data-toggle="dropdown" data-hint="<%= dataHint %>" data-hint-direction="<%= dataHintDirection %>" data-hint-offset="<%= dataHintOffset %>" <% if (dataHintTitle) { %> data-hint-title="<%= dataHintTitle %>" <% } %>>',
                        '<% applyicon() %>',
                        '<span class="caption"><%= caption %></span>',
                        '<span class="inner-box-caret">' +
                            '<i class="caret"></i>' +
                        '</span>',
                    '</button>',
                '</div>',
            '<% } else { %>',
                '<div class="btn-group split <%= groupCls %>" id="<%= id %>" style="<%= style %>">',
                    '<button type="button" class="btn <%= cls %>">',
                        '<% applyicon() %>',
                        '<span class="caption"><%= caption %></span>',
                    '</button>',
                    '<button type="button" class="btn <%= cls %> dropdown-toggle" data-toggle="dropdown" data-hint="<%= dataHint %>" data-hint-direction="<%= dataHintDirection %>" data-hint-offset="<%= dataHintOffset %>" <% if (dataHintTitle) { %> data-hint-title="<%= dataHintTitle %>" <% } %>>',
                        '<i class="caret"></i>',
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
            me.stopPropagation = me.options.stopPropagation;
            me.delayRenderHint = me.options.delayRenderHint;

            // if ( /(?<!-)svg-icon(?!-)/.test(me.options.iconCls) )
            //     me.options.scaling = false;

            if ( me.options.scaling === false && me.options.iconCls) {
                me.iconCls = me.options.iconCls + ' scaling-off';
            }

            me.options.takeFocusOnClose && (me.options.canFocused = true);

            if (me.options.el) {
                me.render();
            } else if (me.options.parentEl)
                me.render(me.options.parentEl);
        },

        getCaptionWithBreaks: function (caption) {
            var words = caption.split(' '),
                newCaption = null,
                maxWidth = 160 - 4, //85 - 4
                containAnd = words.indexOf('&');
            if (containAnd > -1) { // add & to previous word
                words[containAnd - 1] += ' &';
                words.splice(containAnd, 1);
            }
            if (words.length > 1) {
                maxWidth = !!this.menu || this.split === true ? maxWidth - 10 : maxWidth;
                if (words.length < 3) {
                    words[0] = getShortText(words[0], !!this.menu ? maxWidth + 10 : maxWidth);
                    words[1] = getShortText(words[1], maxWidth);
                    newCaption = words[0] + '<br>' + words[1];
                } else {
                    var otherWords = '';
                    if (getWidthOfCaption(words[0] + ' ' + words[1]) < maxWidth) { // first and second words in first line
                        for (var i = 2; i < words.length; i++) {
                            otherWords += words[i] + ' ';
                        }
                        if (getWidthOfCaption(otherWords + (!!this.menu ? 10 : 0))*2 < getWidthOfCaption(words[0] + ' ' + words[1])) {
                            otherWords = getShortText((words[1] + ' ' + otherWords).trim(), maxWidth);
                            newCaption = words[0] + '<br>' + otherWords;
                        } else {
                            otherWords = getShortText(otherWords.trim(), maxWidth);
                            newCaption = words[0] + ' ' + words[1] + '<br>' + otherWords;
                        }
                    } else { // only first word is in first line
                        for (var j = 1; j < words.length; j++) {
                            otherWords += words[j] + ' ';
                        }
                        otherWords = getShortText(otherWords.trim(), maxWidth);
                        newCaption = words[0] + '<br>' + otherWords;
                    }
                }
            } else {
                var width = getWidthOfCaption(caption);
                newCaption = width < maxWidth ? caption : getShortText(caption, maxWidth);
                if (!!this.menu || this.split === true) {
                    newCaption += '<br>';
                }
            }
            return newCaption;
        },

        render: function(parentEl) {
            var me = this;

            me.trigger('render:before', me);

            me.cmpEl = me.$el || $(me.el);

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
                        var newCaption = this.getCaptionWithBreaks(this.caption);
                        if (newCaption) {
                            me.caption = newCaption;
                        }
                    }

                    me.cmpEl = $(this.template({
                        id           : me.id,
                        cls          : me.cls,
                        groupCls     : me.split && /btn-toolbar/.test(me.cls) ? 'no-borders' : '',
                        iconCls      : me.iconCls,
                        iconImg      : me.options.iconImg,
                        menu         : me.menu,
                        split        : me.split,
                        onlyIcon     : me.options.onlyIcon,
                        disabled     : me.disabled,
                        pressed      : me.pressed,
                        caption      : me.caption,
                        style        : me.style,
                        dataHint     : me.options.dataHint,
                        dataHintDirection: me.options.dataHintDirection,
                        dataHintOffset: me.options.dataHintOffset,
                        dataHintTitle: me.options.dataHintTitle
                    }));

                    if (me.menu && _.isObject(me.menu) && _.isFunction(me.menu.render)) {
                        me.menu.render(me.cmpEl);
                        me.options.canFocused && me.attachKeyEvents();
                    }

                    parentEl.html(me.cmpEl);
                    me.$icon = me.$el.find('.icon');
                }
            }

            if (!me.rendered) {
                var el = me.cmpEl,
                    isGroup = el.hasClass('btn-group'),
                    isSplit = el.hasClass('split');

                if (_.isString(me.toggleGroup)) {
                    me.enableToggle = true;
                }

                var buttonHandler = function(e) {
                    if (!me.disabled && (e.which === 1 || e.which===undefined)) {
                        me.doToggle();
                        if (me.options.hint) {
                            var tip = me.btnEl.data('bs.tooltip');
                            if (tip) {
                                if (tip.dontShow===undefined)
                                    tip.dontShow = true;

                                tip.hide();
                            }
                        }
                        me.split && me.options.takeFocusOnClose && me.focus();
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
                        $('[data-toggle^=dropdown]:first', el).toggleClass('active', select);

                    el.toggleClass('active', select);
                    me.stopPropagation && e.stopPropagation();
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
                            doSplitSelect(!me.isMenuOpen(), 'arrow', e);
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
                    me.stopPropagation && e.stopPropagation();
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
                    me.cmpEl.removeClass('over');
                    if (!me.disabled) {
                        me.trigger('mouseout', me, e);
                    }
                });

                // Register the button in the toggle manager
                Common.UI.ToggleManager.register(me);

                if ( me.options.scaling !== false ) {
                    el.attr('ratio', 'ratio');
                    me.applyScaling(Common.UI.Scaling.currentRatio());

                    el.on('app:scaling', function (e, info) {
                        if ( me.options.scaling != info.ratio ) {
                            me.applyScaling(info.ratio);
                        }
                    });
                }

                var $btn = $('button', el).length>0 ? $('button', el) : me.cmpEl;

                if (!me.menu)
                    $btn.addClass('canfocused');

                if (me.enableToggle && !me.menu) {
                    $btn.attr('aria-pressed', !!me.pressed)
                }

                if (me.menu) {
                    $('[data-toggle^=dropdown]', el).attr('aria-haspopup', 'menu');
                    $('[data-toggle^=dropdown]', el).attr('aria-expanded', false);
                }

                if ((!me.caption && me.options.hint) || me.options.ariaLabel) {
                    var ariaLabel = me.options.ariaLabel ? me.options.ariaLabel : ((typeof me.options.hint == 'string') ? me.options.hint : me.options.hint[0]);
                    $btn.attr('aria-label', ariaLabel);
                }
            }

            me.rendered = true;

            me.options.hint && me.createHint(me.options.hint);

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

            if (this.cmpEl) {
                this.cmpEl.attr('aria-pressed', state);
                this.cmpEl.trigger('button.internal.active', [state]);
            }

            if (!suppressEvent)
                this.trigger('toggle', this, state);
        },

        click: function(opts) {
            if ( !this.disabled ) {
                this.doToggle();
                this.trigger('click', this, opts);
            }
        },

        isActive: function() {
            if (this.enableToggle)
                return this.pressed;

            return this.cmpEl.hasClass('active');
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

                if (me.tabindex!==undefined) {
                    var el = this.split ? this.cmpEl : this.$el && this.$el.find('button').addBack().filter('button');
                    disabled && (this.tabindex = el.attr('tabindex'));
                    el.attr('tabindex', disabled ? "-1" : me.tabindex);
                }
            }

            this.disabled = disabled;
        },

        isDisabled: function() {
            return this.disabled;
        },

        setIconCls: function(cls) {
            var btnIconEl = $(this.el).find('i.icon'),
                oldCls = this.iconCls,
                svgIcon = $(this.el).find('.icon use.zoom-int');

            this.iconCls = cls;
            if (/svgicon/.test(this.iconCls)) {
                var icon = /svgicon\s(\S+)/.exec(this.iconCls);
                svgIcon.attr('xlink:href', icon && icon.length > 1 ? '#' + icon[1] : '');
            } else {
                if (svgIcon.length) {
                    var icon = /btn-[^\s]+/.exec(this.iconCls);
                    svgIcon.attr('href', icon ? '#' + icon[0]: '');
                }
                btnIconEl.removeClass(oldCls);
                btnIconEl.addClass(cls || '');
                if (this.options.scaling === false) {
                    btnIconEl.addClass('scaling-off');
                }
            }
        },

        changeIcon: function(opts) {
            var me = this,
                btnIconEl = $(this.el).find('i.icon');
            if (btnIconEl.length > 1) btnIconEl = $(btnIconEl[0]);
            if (opts && (opts.curr || opts.next) && btnIconEl) {
                var svgIcon = $(this.el).find('.icon use.zoom-int');
                if (opts.curr) {
                    btnIconEl.removeClass(opts.curr);
                    me.iconCls = me.iconCls.replace(opts.curr, '').trim();
                }
                if (opts.next) {
                    !btnIconEl.hasClass(opts.next) && (btnIconEl.addClass(opts.next));
                    (me.iconCls.indexOf(opts.next)<0) && (me.iconCls += ' ' + opts.next);
                }
                svgIcon.length && !!opts.next && svgIcon.attr('href', '#' + opts.next);

                if ( !!me.options.signals ) {
                    if ( !(me.options.signals.indexOf('icon:changed') < 0) ) {
                        me.trigger('icon:changed', me, opts);
                    }
                }
            }
        },

        hasIcon: function(iconcls) {
            return this.$icon.hasClass(iconcls);
        },

        setVisible: function(visible) {
            if (this.cmpEl) this.cmpEl.toggleClass('hidden', !visible);
            this.visible = visible;
        },

        isVisible: function() {
            return (this.cmpEl) ? this.cmpEl.is(":visible") : $(this.el).is(":visible");
        },

        createHint: function(hint, isHtml) {
            this.options.hint = hint;
            if (!this.rendered) return;

            var me = this,
                cmpEl = this.cmpEl,
                modalParents = cmpEl.closest('.asc-window'),
                tipZIndex = modalParents.length > 0 ? parseInt(modalParents.css('z-index')) + 10 : undefined;

            if (!this.btnEl) {
                if (typeof this.options.hint == 'object' && this.options.hint.length>1 && $('button', cmpEl).length>0) {
                    var btnEl = $('button', cmpEl);
                    this.btnEl = $(btnEl[0]);
                    this.btnMenuEl = $(btnEl[1]);
                } else {
                    this.btnEl = cmpEl;
                }
            }

            var tip = this.btnEl.data('bs.tooltip');
            tip && tip.updateTitle(typeof hint === 'string' ? hint : hint[0]);
            if (this.btnMenuEl) {
                tip = this.btnMenuEl.data('bs.tooltip');
                tip && tip.updateTitle(hint[1]);
            }
            if (!this._isTooltipInited) {
                if (this.delayRenderHint) {
                    this.btnEl.one('mouseenter', function(){ // hide tooltip when mouse is over menu
                        me.btnEl.tooltip({
                            html: !!isHtml,
                            title       : (typeof me.options.hint == 'string') ? me.options.hint : me.options.hint[0],
                            placement   : me.options.hintAnchor||'cursor',
                            zIndex : tipZIndex
                        });
                        !Common.Utils.isGecko && (me.btnEl.data('bs.tooltip').enabled = !me.disabled);
                        me.btnEl.mouseenter();
                    });
                    this.btnMenuEl && this.btnMenuEl.one('mouseenter', function(){ // hide tooltip when mouse is over menu
                        me.btnMenuEl.tooltip({
                            html: !!isHtml,
                            title       : me.options.hint[1],
                            placement   : me.options.hintAnchor||'cursor',
                            zIndex : tipZIndex
                        });
                        !Common.Utils.isGecko && (me.btnMenuEl.data('bs.tooltip').enabled = !me.disabled);
                        me.btnMenuEl.mouseenter();
                    });
                } else {
                    this.btnEl.tooltip({
                        html: !!isHtml,
                        title       : (typeof this.options.hint == 'string') ? this.options.hint : this.options.hint[0],
                        placement   : this.options.hintAnchor||'cursor',
                        zIndex      : tipZIndex
                    });
                    this.btnMenuEl && this.btnMenuEl.tooltip({
                        html: !!isHtml,
                        title       : this.options.hint[1],
                        placement   : this.options.hintAnchor||'cursor',
                        zIndex      : tipZIndex
                    });
                }
                if (modalParents.length > 0) {
                    var onModalClose = function(dlg) {
                        if (modalParents[0] !== dlg.$window[0]) return;
                        var tip = me.btnEl.data('bs.tooltip');
                        if (tip) {
                            if (tip.dontShow===undefined)
                                tip.dontShow = true;
                            tip.hide();
                        }
                        if (me.btnMenuEl) {
                            tip = me.btnMenuEl.data('bs.tooltip');
                            if (tip) {
                                if (tip.dontShow===undefined)
                                    tip.dontShow = true;
                                tip.hide();
                            }
                        }
                        Common.NotificationCenter.off({'modal:close': onModalClose});
                    };
                    Common.NotificationCenter.on({'modal:close': onModalClose});
                }
                this._isTooltipInited = true;
            }
        },

        updateHint: function(hint, isHtml) {
            this.options.hint = hint;
            if (!this.rendered) return;

            this.createHint(hint, isHtml);

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

            if (!this.caption) {
                var cmpEl = this.cmpEl,
                    $btn = $('button', cmpEl).length>0 ? $('button', cmpEl) : cmpEl;
                $btn.attr('aria-label', (typeof hint == 'string') ? hint : hint[0]);
            }
        },

        setCaption: function(caption) {
            if (this.caption != caption) {
                var isHuge = false;
                if ( /icon-top/.test(this.options.cls) && !!this.caption && /huge/.test(this.options.cls) ) {
                    var newCaption = this.getCaptionWithBreaks(caption);
                    this.caption = newCaption || caption;
                    isHuge = true;
                } else
                    this.caption = caption;

                if (this.rendered) {
                    var captionNode = this.cmpEl.find('.caption');

                    if (captionNode.length > 0) {
                        captionNode.html(isHuge && (this.split || this.menu) ? _.template(templateBtnCaption)({caption: this.caption}) : this.caption);
                    } else {
                        this.cmpEl.find('button:first').addBack().filter('button').html(this.caption);
                    }
                }
            }
        },

        setMenu: function (m) {
            if (m && _.isObject(m) && _.isFunction(m.render)){
                this.menu = m;
                if (this.rendered) {
                    this.menu.render(this.cmpEl);
                    this.options.canFocused && this.attachKeyEvents();
                }
            }
        },

        attachKeyEvents: function() {
            var me = this;
            if (me.menu && me.menu.rendered && me.cmpEl) {
                var btnEl = $('button', me.cmpEl);
                !me.split && btnEl.addClass('move-focus');
                me.menu.on('keydown:before', function(menu, e) {
                    if ((e.keyCode === Common.UI.Keys.DOWN || e.keyCode === Common.UI.Keys.SPACE) && !me.isMenuOpen()) {
                        $(btnEl[me.split ? 1 : 0]).click();
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }
                });
                me.options.takeFocusOnClose && me.menu.on('hide:after', function() {
                    setTimeout(function(){me.focus();}, 1);
                });
            }
        },

        applyScaling: function (ratio) {
            const me = this;
            if ( me.options.scaling != ratio ) {
                // me.cmpEl.attr('ratio', ratio);
                me.options.scaling = ratio;

                if (ratio > 2) {
                    const $el = me.$el.is('button') ? me.$el : me.$el.find('button:first');
                    if (!$el.find('svg.icon').length) {
                        const iconCls = me.iconCls || $el.find('i.icon').attr('class');
                        const re_icon_name = /btn-[^\s]+/.exec(iconCls);
                        const icon_name = re_icon_name ? re_icon_name[0] : "null";
                        const rtlCls = (iconCls ? iconCls.indexOf('icon-rtl') : -1) > -1 ? 'icon-rtl' : '';
                        const svg_icon = '<svg class="icon %rtlCls"><use class="zoom-int" href="#%iconname"></use></svg>'.replace('%iconname', icon_name).replace('%rtlCls', rtlCls);
                        $el.find('i.icon').after(svg_icon);
                    }
                } else {
                    if (!me.$el.find('i.icon')) {
                        const png_icon = '<i class="icon %cls">&nbsp;</i>'.replace('%cls', me.iconCls);
                        me.$el.find('svg.icon').after(png_icon);
                    }
                }
            }
        },

        isMenuOpen: function() {
            return this.cmpEl && this.cmpEl.hasClass('open');
        },

        focus: function() {
            this.split ? this.cmpEl.focus() : this.$el && this.$el.find('button').addBack().filter('button').focus();
        },

        setTabIndex: function(tabindex) {
            if (!this.rendered)
                return;

            this.tabindex = tabindex.toString();
            if (!this.disabled) {
                this.split ? this.cmpEl.attr('tabindex', this.tabindex) : this.$el && this.$el.find('button').addBack().filter('button').attr('tabindex', this.tabindex);
            }
        }
    });

    Common.UI.ButtonCustom = Common.UI.Button.extend(_.extend({
        initialize : function(options) {
            options.iconCls = 'icon-custom ' + (options.iconCls || '');
            Common.UI.Button.prototype.initialize.call(this, options);

            this.iconsSet = Common.UI.iconsStr2IconsObj(options.iconsSet || ['']);
            var icons = Common.UI.getSuitableIcons(this.iconsSet);
            this.iconNormalImg = icons['normal'];
            this.iconActiveImg = icons['active'];
        },

        render: function (parentEl) {
            Common.UI.Button.prototype.render.call(this, parentEl);

            var _current_active = false,
                me = this;
            this.cmpButtonFirst = $('button:first', this.$el || $(this.el));
            const _callback = function (records, observer) {
                var _hasactive = me.cmpButtonFirst.hasClass('active') || me.cmpButtonFirst.is(':active');
                if ( _hasactive !== _current_active ) {
                    me.updateIcon();
                    _current_active = _hasactive;
                }
            };
            this.cmpButtonFirst[0] && (new MutationObserver(_callback))
                .observe(this.cmpButtonFirst[0], {
                    attributes : true,
                    attributeFilter : ['class'],
                });

            if (this.menu && !this.split) {
                var onMouseDown = function (e) {
                    _callback();
                    $(document).on('mouseup',   onMouseUp);
                };
                var onMouseUp = function (e) {
                    _callback();
                    $(document).off('mouseup',   onMouseUp);
                };
                this.cmpButtonFirst.on('mousedown', _.bind(onMouseDown, this));
            }

            this.updateIcon();
            Common.NotificationCenter.on('uitheme:changed', this.updateIcons.bind(this));
        },

        updateIcons: function() {
            var icons = Common.UI.getSuitableIcons(this.iconsSet);
            this.iconNormalImg = icons['normal'];
            this.iconActiveImg = icons['active'];
            this.updateIcon();
        },

        updateIcon: function() {
            this.$icon && this.$icon.css({'background-image': 'url('+ (this.cmpButtonFirst && (this.cmpButtonFirst.hasClass('active') || this.cmpButtonFirst.is(':active')) ? this.iconActiveImg : this.iconNormalImg) +')'});
        },

        applyScaling: function (ratio) {
            if ( this.options.scaling !== ratio ) {
                this.options.scaling = ratio;
                this.updateIcons();
            }
        }
    }, Common.UI.ButtonCustom || {}));
});

