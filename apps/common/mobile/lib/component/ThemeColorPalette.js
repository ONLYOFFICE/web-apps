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
 *  ThemeColorPalette.js
 *
 *  Created by Alexander Yuzhin on 10/27/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */


if (Common === undefined)
    var Common = {};

Common.UI = Common.UI || {};

define([
    'jquery',
    'underscore',
    'backbone'
], function ($, _, Backbone) {
    'use strict';

    Common.UI.ThemeColorPalette = Backbone.View.extend(_.extend({
        options: {
            dynamiccolors: 10,
            standardcolors: 10,
            themecolors: 10,
            effects: 5,
            allowReselect: true,
            transparent: false,
            value: '000000',
            cls: '',
            style: ''
        },

        template: _.template([
            '<% var me = this; %>',
            '<div class="list-block color-palette <%= me.options.cls %>" style="<%= me.options.style %>">',
                '<ul>',
                    '<li class="theme-colors">',
                        '<div style="padding: 15px 0 0 15px;"><%= me.textThemeColors %></div>',
                        '<div class="item-content">',
                            '<div class="item-inner">',
                            '<% _.each(themeColors, function(row) { %>',
                                '<div class="row">',
                                    '<% _.each(row, function(effect) { %>',
                                        '<a data-effectid="<%=effect.effectId%>" data-effectvalue="<%=effect.effectValue%>" data-color="<%=effect.color%>" style="background:#<%=effect.color%>"></a>',
                                    '<% }); %>',
                                '</div>',
                            '<% }); %>',
                            '</div>',
                        '</div>',
                    '</li>',
                    '<li class="standart-colors">',
                        '<div style="padding: 15px 0 0 15px;"><%= me.textStandartColors %></div>',
                        '<div class="item-content">',
                            '<div class="item-inner">',
                                '<% _.each(standartColors, function(color, index) { %>',
                                    '<% if (0 == index && me.options.transparent) { %>',
                                    '<a data-color="transparent" class="transparent"></a>',
                                    '<% } else { %>',
                                    '<a data-color="<%=color%>" style="background:#<%=color%>"></a>',
                                    '<% } %>',
                                '<% }); %>',
                            '</div>',
                        '</div>',
                    '</li>',
                    '<li class="dynamic-colors">',
                        '<div style="padding: 15px 0 0 15px;"><%= me.textCustomColors %></div>',
                        '<div class="item-content">',
                            '<div class="item-inner">',
                                '<% _.each(dynamicColors, function(color, index) { %>',
                                    '<a data-color="<%=color%>" style="background:#<%=color%>"></a>',
                                '<% }); %>',
                                '<% if (dynamicColors.length < me.options.dynamiccolors) { %>',
                                '<% for(var i = dynamicColors.length; i < me.options.dynamiccolors; i++) { %>',
                                    '<a data-color="empty" style="background:#ffffff"></a>',
                                '<% } %>',
                                '<% } %>',
                            '</div>',
                        '</div>',
                    '</li>',
                '</ul>',
            '</div>'
        ].join('')),

        // colorRe: /(?:^|\s)color-(.{6})(?:\s|$)/,
        // selectedCls: 'selected',
        //
        initialize : function(options) {
            var me = this,
                el = $(me.el);

            me.options = _({}).extend(me.options, options);
            me.render();

            el.find('.color-palette a').on('click', _.bind(me.onColorClick, me));
        },

        render: function () {
            var me = this,
                themeColors = [],
                row = -1,
                standartColors = Common.Utils.ThemeColor.getStandartColors();

            // Disable duplicate
            if ($(me.el).find('.list-block.color-palette').length > 0) {
                return
            }

            _.each(Common.Utils.ThemeColor.getEffectColors(), function(effect, index) {
                if (0 == index % me.options.themecolors) {
                    themeColors.push([]);
                    row++
                }
                themeColors[row].push(effect);
            });

            // custom color
            this.dynamicColors = Common.localStorage.getItem('asc.'+Common.localStorage.getId()+'.colors.custom');
            this.dynamicColors = this.dynamicColors ? this.dynamicColors.toLowerCase().split(',') : [];


            $(me.el).append(me.template({
                themeColors: themeColors,
                standartColors: standartColors,
                dynamicColors: me.dynamicColors
            }));

            return me;
        },

        isColor: function(val) {
            return typeof(val) == 'string' && (/[0-9A-Fa-f]{6}/).test(val);
        },
        isTransparent: function(val) {
            return typeof(val) == 'string' && (val=='transparent');
        },

        isEffect: function(val) {
            return (typeof(val) == 'object' && val.effectId !== undefined);
        },

        onColorClick:function (e) {
            var me = this,
                el = $(me.el),
                $target = $(e.currentTarget);

            var color = $target.data('color').toString(),
                effectId = $target.data('effectid');

            if (color !== 'empty') {
                el.find('.color-palette a').removeClass('active');
                $target.addClass('active');
                me.currentColor = color;
                if (effectId!==undefined) {
                    me.currentColor = {color: color, effectId: effectId};
                }
                me.trigger('select', me, me.currentColor);
            } else {
                me.fireEvent('customcolor', me);
            }
        },

        select: function(color) {
            var me = this,
                el = $(me.el);

            me.currentColor = color;

            me.clearSelection();

            if (_.isObject(color)) {
                if (! _.isUndefined(color.effectId)) {
                    el.find('a[data-effectid=' + color.effectId + ']').addClass('active');
                } else if (! _.isUndefined(color.effectValue)) {
                    el.find('a[data-effectvalue=' + color.effectValue + '][data-color=' + color.color + ']').addClass('active');
                }
            } else {
                if (/#?[a-fA-F0-9]{6}/.test(color)) {
                    color = /#?([a-fA-F0-9]{6})/.exec(color)[1];
                }

                if (/^[a-fA-F0-9]{6}|transparent$/.test(color) || _.indexOf(Common.Utils.ThemeColor.getStandartColors(), color) > -1 || _.indexOf(this.dynamicColors, color) > -1) {
                    el.find('.standart-colors a[data-color=' + color + '], .dynamic-colors a[data-color=' + color + ']').first().addClass('active');
                }

            }
        },


        clearSelection: function() {
            $(this.el).find('.color-palette a').removeClass('active');
        },

        saveDynamicColor: function(color) {
            var key_name = 'asc.'+Common.localStorage.getId()+'.colors.custom';
            var colors = Common.localStorage.getItem(key_name);
            colors = colors ? colors.split(',') : [];
            if (colors.push(color) > this.options.dynamiccolors) colors.shift();
            this.dynamicColors = colors;
            Common.localStorage.setItem(key_name, colors.join().toUpperCase());
        },

        updateDynamicColors: function() {
            var me = this;
            var dynamicColors = Common.localStorage.getItem('asc.'+Common.localStorage.getId()+'.colors.custom');
            dynamicColors = dynamicColors ? dynamicColors.toLowerCase().split(',') : [];
            var templateColors = '';
            _.each(dynamicColors, function(color) {
                templateColors += '<a data-color="' + color + '" style="background:#' + color + '"></a>';
            });
            if (dynamicColors.length < this.options.dynamiccolors) {
                for (var i = dynamicColors.length; i < this.options.dynamiccolors; i++) {
                    templateColors += '<a data-color="empty" style="background-color: #ffffff;"></a>';
                }
            }
            $(this.el).find('.dynamic-colors .item-inner').html(_.template(templateColors));
            $(this.el).find('.color-palette .dynamic-colors a').on('click', _.bind(this.onColorClick, this));
        },

        addNewDynamicColor: function(colorPicker, color) {
            if (color) {
                this.saveDynamicColor(color);
                this.updateDynamicColors();
                this.trigger('select', this, color);
                this.select(color);
            }
        },

        textThemeColors: 'Theme Colors',
        textStandartColors: 'Standard Colors',
        textCustomColors: 'Custom Colors'
    }, Common.UI.ThemeColorPalette || {}));
});