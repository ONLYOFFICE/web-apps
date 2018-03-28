/*
 *
 * (c) Copyright Ascensio System Limited 2010-2018
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
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia,
 * EU, LV-1021.
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
 *  ColorPaletteExt.js
 *
 *  Created by Julia Radzhabova on 07/21/15
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
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
            var target = $(e.target).closest('div.palette-color-item');
            var color, cmp;

            if (target.length==0) return;

            if (target.hasClass('color-transparent') ) {
                $(me.el).find('div.' + me.selectedCls).removeClass(me.selectedCls);
                target.addClass(me.selectedCls);
                me.value = 'transparent';
                me.trigger('select', me, 'transparent');
            } else {
                if (!/^[a-fA-F0-9]{6}$/.test(me.value) || _.indexOf(me.colors, me.value)<0 )
                    me.value = false;

                $(me.el).find('div.' + me.selectedCls).removeClass(me.selectedCls);
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
            el.find('div.' + this.selectedCls).removeClass(this.selectedCls);

            if (!color) return;
            
            if (typeof(color) == 'object' ) {
                var effectEl;
                if (color.effectId !== undefined) {
                    effectEl = el.find('div[effectid="'+color.effectId+'"]').first();
                    if (effectEl.length>0) {
                        effectEl.addClass(this.selectedCls);
                        this.value = effectEl[0].className.match(this.colorRe)[1].toUpperCase();
                    } else
                        this.value = false;
                } else if (color.effectValue !== undefined) {
                    effectEl = el.find('div[effectvalue="'+color.effectValue+'"].color-' + color.color.toUpperCase()).first();
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
                        (color == 'transparent') ? el.find('div.color-transparent').addClass(this.selectedCls) : el.find('div.palette-color.color-' + color).first().addClass(this.selectedCls);
                        this.value = color;
                        if (suppressEvent !== true) {
                            this.fireEvent('select', this, color);
                        }
                    }
                } else {
                    var co = el.find('#'+color).first();
                    if (co.length==0)
                        co = el.find('div[color="'+color+'"]').first();
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
            $(this.el).find('div.' + this.selectedCls).removeClass(this.selectedCls);
            this.value = undefined;
        }
    });
});