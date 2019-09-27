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
                    '<li class="custom-colors">',
                        '<div style="padding: 15px 0 0 15px;"><%= me.textCustomColors %></div>',
                        '<div class="item-content">',
                        '<div class="item-inner">',
                            '<div class="color-picker-wheel">',
                                '<svg id="id-wheel" viewBox="0 0 300 300" width="300" height="300"><%=circlesColors%></svg>',
                                '<div class="color-picker-wheel-handle"></div>',
                                '<div class="color-picker-sb-spectrum" style="background-color: hsl(0, 100%, 50%)">',
                                    '<div class="color-picker-sb-spectrum-handle"></div>',
                                '</div>',
                            '</div>',
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
            if (!this.currentHsl)
                this.currentHsl = [];
            if (!this.currentHsb)
                this.currentHsb = [];
            if (!this.currentHue)
                this.currentHue = [];
            var total = 256,
                circles = '';
            for (var i = total; i > 0; i -= 1) {
                var angle = i * Math.PI / (total / 2);
                var hue = 360 / total * i;
                circles += '<circle cx="' + (150 - Math.sin(angle) * 125) + '" cy="' + (150 - Math.cos(angle) * 125) + '" r="25" fill="hsl( ' + hue + ', 100%, 50%)"></circle>';
            }

            $(me.el).append(me.template({
                themeColors: themeColors,
                standartColors: standartColors,
                circlesColors: circles
            }));

            this.afterRender();

            return me;
        },

        afterRender: function () {
            this.$colorPicker = $('.color-picker-wheel');
            this.$colorPicker.on({
                'touchstart': this.handleTouchStart.bind(this),
                'touchmove': this.handleTouchMove.bind(this),
                'touchend': this.handleTouchEnd.bind(this)
            });
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

            el.find('.color-palette a').removeClass('active');
            $target.addClass('active');

            var color = $target.data('color').toString(),
                effectId = $target.data('effectid');

            me.currentColor = color;

            if (effectId) {
                me.currentColor = {color: color, effectId: effectId};
            }

            me.trigger('select', me, me.currentColor);
        },

        select: function(color) {
            var me = this,
                el = $(me.el);

            if (color == me.currentColor) {
                return;
            }

            me.currentColor = color;

            me.clearSelection();

            if (_.isObject(color)) {
                if (! _.isUndefined(color.effectId)) {
                    el.find('a[data-effectid=' + color.effectId + ']').addClass('active');
                } else if (! _.isUndefined(color.effectValue)) {
                    el.find('a[data-effectvalue=' + color.effectValue + '][data-color=' + color.color + ']').addClass('active');
                }
                this.currentHsl = this.colorHexToRgb(color.color);
            } else {
                if (/#?[a-fA-F0-9]{6}/.test(color)) {
                    color = /#?([a-fA-F0-9]{6})/.exec(color)[1];
                }

                if (/^[a-fA-F0-9]{6}|transparent$/.test(color) || _.indexOf(Common.Utils.ThemeColor.getStandartColors(), color) > -1) {
                    el.find('.standart-colors a[data-color=' + color + ']').addClass('active');
                } else {
                    el.find('.custom-colors a[data-color=' + color + ']').addClass('active');
                }
                this.currentHsl = this.colorHexToRgb(color);
            }
            if (!this.currentHsl) {
                this.currentHsl = this.colorHexToRgb('000000');
            }
            this.currentHsl = this.colorRgbToHsl(...this.currentHsl);
            this.currentHsb = this.colorHslToHsb(...this.currentHsl);
            this.updateCustomColor(true);
        },


        clearSelection: function() {
            $(this.el).find('.color-palette a').removeClass('active');
        },

        colorHexToRgb(hex) {
            var h = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, function(m, r, g, b) { return (r + r + g + g + b + b)});
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);
            return result
                ? result.slice(1).map(function (n) { return parseInt(n, 16)})
                : null;
        },

        colorRgbToHsl(r, g, b) {
            r /= 255; // eslint-disable-line
            g /= 255; // eslint-disable-line
            b /= 255; // eslint-disable-line
            var max = Math.max(r, g, b);
            var min = Math.min(r, g, b);
            var d = max - min;
            var h;
            if (d === 0) h = 0;
            else if (max === r) h = ((g - b) / d) % 6;
            else if (max === g) h = (b - r) / d + 2;
            else if (max === b) h = (r - g) / d + 4;
            var l = (min + max) / 2;
            var s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
            if (h < 0) h = 360 / 60 + h;
            return [h * 60, s, l];
        },

        colorHslToHsb(h, s, l) {
            var HSB = {
                h,
                s: 0,
                b: 0,
            };
            var HSL = {h, s, l};
            var t = HSL.s * (HSL.l < 0.5 ? HSL.l : 1 - HSL.l);
            HSB.b = HSL.l + t;
            HSB.s = HSL.l > 0 ? 2 * t / HSB.b : HSB.s;
            return [HSB.h, HSB.s, HSB.b];
        },

        colorHsbToHsl(h, s, b) {
            var HSL = {
                h,
                s: 0,
                l: 0,
            };
            var HSB = { h, s, b };
            HSL.l = (2 - HSB.s) * HSB.b / 2;
            HSL.s = HSL.l && HSL.l < 1 ? HSB.s * HSB.b / (HSL.l < 0.5 ? HSL.l * 2 : 2 - HSL.l * 2) : HSL.s;
            return [HSL.h, HSL.s, HSL.l];
        },

        colorHslToRgb(h, s, l) {
            var c = (1 - Math.abs(2 * l - 1)) * s;
            var hp = h / 60;
            var x = c * (1 - Math.abs((hp % 2) - 1));
            var rgb1;
            if (Number.isNaN(h) || typeof h === 'undefined') {
                rgb1 = [0, 0, 0];
            } else if (hp <= 1) rgb1 = [c, x, 0];
            else if (hp <= 2) rgb1 = [x, c, 0];
            else if (hp <= 3) rgb1 = [0, c, x];
            else if (hp <= 4) rgb1 = [0, x, c];
            else if (hp <= 5) rgb1 = [x, 0, c];
            else if (hp <= 6) rgb1 = [c, 0, x];
            var m = l - (c / 2);
            var result = rgb1.map(function (n) {
                return Math.max(0, Math.min(255, Math.round(255 * (n + m))));
            });
            return result;
        },

        colorRgbToHex(r, g, b) {
            var result = [r, g, b].map( function (n) {
                var hex = n.toString(16);
                return hex.length === 1 ? ('0' + hex) : hex;
            }).join('');
            return ('#' + result);
        },

        setHueFromWheelCoords: function (x, y) {
            var wheelCenterX = this.wheelRect.left + this.wheelRect.width / 2;
            var wheelCenterY = this.wheelRect.top + this.wheelRect.height / 2;
            var angleRad = Math.atan2(y - wheelCenterY, x - wheelCenterX);
            var angleDeg = angleRad * 180 / Math.PI + 90;
            if (angleDeg < 0) angleDeg += 360;
            angleDeg = 360 - angleDeg;
            this.currentHsl[0] = angleDeg;
            this.updateCustomColor();
        },

        setSBFromSpecterCoords: function (x, y) {
            var s = (x - this.specterRect.left) / this.specterRect.width;
            var b = (y - this.specterRect.top) / this.specterRect.height;
            s = Math.max(0, Math.min(1, s));
            b = 1 - Math.max(0, Math.min(1, b));

            this.currentHsb = [this.currentHsl[0], s, b];
            this.currentHsl = this.colorHsbToHsl(...this.currentHsb);
            this.updateCustomColor();
        },

        handleTouchStart: function (e) {
            this.clearSelection();
            if (this.isMoved || this.isTouched) return;
            this.touchStartX = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
            this.touchCurrentX = this.touchStartX;
            this.touchStartY = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
            this.touchCurrentY = this.touchStartY;
            var $targetEl = $(e.target);
            this.wheelHandleIsTouched = $targetEl.closest('.color-picker-wheel-handle').length > 0;
            this.wheelIsTouched = $targetEl.closest('circle').length > 0;
            this.specterHandleIsTouched = $targetEl.closest('.color-picker-sb-spectrum-handle').length > 0;
            if (!this.specterHandleIsTouched) {
                this.specterIsTouched = $targetEl.closest('.color-picker-sb-spectrum').length > 0;
            }
            if (this.wheelIsTouched) {
                this.wheelRect = this.$el.find('.color-picker-wheel')[0].getBoundingClientRect();
                this.setHueFromWheelCoords(this.touchStartX, this.touchStartY);
            }
            if (this.specterIsTouched) {
                this.specterRect = this.$el.find('.color-picker-sb-spectrum')[0].getBoundingClientRect();
                this.setSBFromSpecterCoords(this.touchStartX, this.touchStartY);
            }
            if (this.specterHandleIsTouched || this.specterIsTouched) {
                this.$el.find('.color-picker-sb-spectrum-handle').addClass('color-picker-sb-spectrum-handle-pressed');
            }
        },

        handleTouchMove: function (e) {
            if (!(this.wheelIsTouched || this.wheelHandleIsTouched) && !(this.specterIsTouched || this.specterHandleIsTouched)) return;
            this.touchCurrentX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
            this.touchCurrentY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;
            e.preventDefault();
            if (!this.isMoved) {
                // First move
                this.isMoved = true;
                if (this.wheelHandleIsTouched) {
                    this.wheelRect = this.$el.find('.color-picker-wheel')[0].getBoundingClientRect();
                }
                if (this.specterHandleIsTouched) {
                    this.specterRect = this.$el.find('.color-picker-sb-spectrum')[0].getBoundingClientRect();
                }
            }
            if (this.wheelIsTouched || this.wheelHandleIsTouched) {
                this.setHueFromWheelCoords(this.touchCurrentX, this.touchCurrentY);
            }
            if (this.specterIsTouched || this.specterHandleIsTouched) {
                this.setSBFromSpecterCoords(this.touchCurrentX, this.touchCurrentY);
            }
        },

        handleTouchEnd: function () {
            this.isMoved = false;
            if (this.specterIsTouched || this.specterHandleIsTouched) {
                this.$el.find('.color-picker-sb-spectrum-handle').removeClass('color-picker-sb-spectrum-handle-pressed');
            }
            this.wheelIsTouched = false;
            this.wheelHandleIsTouched = false;
            this.specterIsTouched = false;
            this.specterHandleIsTouched = false;
        },

        updateCustomColor: function (firstSelect) {
            var specterWidth = this.$el.find('.color-picker-sb-spectrum')[0].offsetWidth,
                specterHeight = this.$el.find('.color-picker-sb-spectrum')[0].offsetHeight,
                wheelSize = this.$el.find('.color-picker-wheel')[0].offsetWidth,
                wheelHalfSize = wheelSize / 2,
                angleRad = this.currentHsl[0] * Math.PI / 180,
                handleSize = wheelSize / 6,
                handleHalfSize = handleSize / 2,
                tX = wheelHalfSize - Math.sin(angleRad) * (wheelHalfSize - handleHalfSize) - handleHalfSize,
                tY = wheelHalfSize - Math.cos(angleRad) * (wheelHalfSize - handleHalfSize) - handleHalfSize;
                this.$el.find('.color-picker-wheel-handle')
                    .css({'background-color':  'hsl(' + this.currentHsl[0] + ', 100%, 50%)'})
                    .css({transform: 'translate(' + tX + 'px,' + tY + 'px)'});

            this.$el.find('.color-picker-sb-spectrum')
                .css({'background-color':  'hsl(' + this.currentHsl[0] + ', 100%, 50%)'});

            if (this.currentHsb && this.currentHsl) {
                this.$el.find('.color-picker-sb-spectrum-handle')
                    .css({'background-color': 'hsl(' + this.currentHsl[0] + ', ' + (this.currentHsl[1] * 100) + '%,' + (this.currentHsl[2] * 100) + '%)'})
                    .css({transform: 'translate(' + specterWidth * this.currentHsb[1] + 'px, ' + specterHeight * (1 - this.currentHsb[2]) + 'px)'});
            }

            if (!firstSelect) {
                var color = this.colorHslToRgb(...this.currentHsl);
                this.currentColor = this.colorRgbToHex(...color);
                this.trigger('select', this, this.currentColor);
            }
        },

        textThemeColors: 'Theme Colors',
        textStandartColors: 'Standard Colors',
        textCustomColors: 'Custom Colors'
    }, Common.UI.ThemeColorPalette || {}));
});