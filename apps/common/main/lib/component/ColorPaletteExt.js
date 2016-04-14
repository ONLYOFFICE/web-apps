/**
 *  ColorPaletteExt.js
 *
 *  Created by Julia Radzhabova on 07/21/15
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/component/BaseView'
], function () { 'use strict';

    Common.UI.ColorPaletteExt = Common.UI.BaseView.extend({
        options: {
            dynamiccolors: 10,
            allowReselect: true,
            cls: '',
            style: ''
        },

        template:
            _.template([
                '<div class="palette-color-ext">',
                '<% var me = this; %>',
                '<% $(colors).each(function(num, item) { %>',
                    '<% if (me.isColor(item)) { %>',
                        '<div class="palette-color-item palette-color color-<%=item%>" style="background:#<%=item%>" hidefocus="on">',
                        '<em><span style="background:#<%=item%>;" unselectable="on">&#160;</span></em>',
                        '</div>',
                    '<% } else if (me.isTransparent(item)) { %>',
                        '<div class="palette-color-item color-<%=item%>" hidefocus="on">',
                        '<em><span unselectable="on">&#160;</span></em>',
                        '</div>',
                    '<% } else if (me.isEffect(item)) { %>',
                        '<div effectid="<%=item.effectId%>" effectvalue="<%=item.effectValue%>" class="palette-color-item palette-color-effect color-<%=item.color%>" style="background:#<%=item.color%>" hidefocus="on">',
                        '<em><span style="background:#<%=item.color%>;" unselectable="on">&#160;</span></em>',
                        '</div>',
                    '<% } %>',
                '<% }); %>',
                '</div>'].join('')),

        colorRe: /(?:^|\s)color-(.{6})(?:\s|$)/,
        selectedCls: 'selected',

        initialize : function(options) {
            Common.UI.BaseView.prototype.initialize.call(this, options);

            this.id = this.options.id;
            this.cls = this.options.cls;
            this.style = this.options.style;
            this.colors = this.options.colors || [];
            this.value = this.options.value;

            if (this.options.el)
                this.render();

            if (this.options.value)
                this.select(this.options.value, true);
        },

        render: function (parentEl) {
            var me = this;

            if (!me.rendered) {
                this.cmpEl = $(this.template({
                    id          : this.id,
                    cls         : this.cls,
                    style       : this.style,
                    colors      : this.colors
                }));

                if (parentEl) {
                    this.setElement(parentEl, false);
                    parentEl.html(this.cmpEl);
                } else {
                    $(this.el).html(this.cmpEl);
                }

                this.cmpEl.on('click', _.bind(this.handleClick, this));
            } else {
                this.cmpEl = $(this.el);
            }

            me.rendered = true;
            return this;
        },

        isColor: function(v) {
            return typeof(v) == 'string' && (/[0-9A-F]{6}/).test(v);
        },

        isTransparent: function(v) {
            return typeof(v) == 'string' && (v=='transparent');
        },

        isEffect: function(v) {
            return (typeof(v) == 'object' && v.effectId !== undefined);
        },

        getColor: function() {
            return this.value;
        },

        handleClick: function(e) {
            var me = this;
            var target = $(e.target).closest('a');
            var color, cmp;

            if (target.length==0) return;

            if (target.hasClass('color-transparent') ) {
                $(me.el).find('a.' + me.selectedCls).removeClass(me.selectedCls);
                target.addClass(me.selectedCls);
                me.value = 'transparent';
                me.trigger('select', me, 'transparent');
            } else {
                if (!/^[a-fA-F0-9]{6}$/.test(me.value) || _.indexOf(me.colors, me.value)<0 )
                    me.value = false;

                $(me.el).find('a.' + me.selectedCls).removeClass(me.selectedCls);
                target.addClass(me.selectedCls);

                color = target[0].className.match(me.colorRe)[1];
                if ( target.hasClass('palette-color-effect') ) {
                    var effectId = parseInt(target.attr('effectid'));
                    if (color)  {
                        me.value = color.toUpperCase();
                        me.trigger('select', me, {color: color, effectId: effectId});
                    }
                } else {
                    if (/#?[a-fA-F0-9]{6}/.test(color)) {
                        color = /#?([a-fA-F0-9]{6})/.exec(color)[1].toUpperCase();
                        me.value = color;
                        me.trigger('select', me, color);
                    }
                }
            }
        },

        select: function(color, suppressEvent) {
            var el = $(this.el);
            el.find('a.' + this.selectedCls).removeClass(this.selectedCls);

            if (!color) return;
            
            if (typeof(color) == 'object' ) {
                var effectEl;
                if (color.effectId !== undefined) {
                    effectEl = el.find('a[effectid="'+color.effectId+'"]').first();
                    if (effectEl.length>0) {
                        effectEl.addClass(this.selectedCls);
                        this.value = effectEl[0].className.match(this.colorRe)[1].toUpperCase();
                    } else
                        this.value = false;
                } else if (color.effectValue !== undefined) {
                    effectEl = el.find('a[effectvalue="'+color.effectValue+'"].color-' + color.color.toUpperCase()).first();
                    if (effectEl.length>0) {
                        effectEl.addClass(this.selectedCls);
                        this.value = effectEl[0].className.match(this.colorRe)[1].toUpperCase();
                    } else
                        this.value = false;
                }
            } else {
                if (/#?[a-fA-F0-9]{6}/.test(color)) {
                    color = /#?([a-fA-F0-9]{6})/.exec(color)[1].toUpperCase();
                    this.value = color;
                }

                if (/^[a-fA-F0-9]{6}|transparent$/.test(color) && _.indexOf(this.colors, color)>=0 ) {
                    if (_.indexOf(this.colors, this.value)<0) this.value = false;

                    if (color != this.value || this.options.allowReselect) {
                        (color == 'transparent') ? el.find('a.color-transparent').addClass(this.selectedCls) : el.find('a.palette-color.color-' + color).first().addClass(this.selectedCls);
                        this.value = color;
                        if (suppressEvent !== true) {
                            this.fireEvent('select', this, color);
                        }
                    }
                } else {
                    var co = el.find('#'+color).first();
                    if (co.length==0)
                        co = el.find('a[color="'+color+'"]').first();
                    if (co.length>0) {
                        co.addClass(this.selectedCls);
                        this.value = color.toUpperCase();
                    }
                }
            }
        },

        updateColors: function(effectcolors) {
            if (effectcolors===undefined) return;

            this.colors = effectcolors;
            this.cmpEl = $(this.template({
                id          : this.id,
                cls         : this.cls,
                style       : this.style,
                colors      : this.colors
            }));
            $(this.el).html(this.cmpEl);
            this.cmpEl.on('click', _.bind(this.handleClick, this));
        },

        clearSelection: function(suppressEvent) {
            $(this.el).find('a.' + this.selectedCls).removeClass(this.selectedCls);
            this.value = undefined;
        }
    });
});