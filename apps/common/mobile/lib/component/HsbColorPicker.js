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
 *  HsbColorPicker.js
 *
 *  Created by Julia Svinareva on 02/10/19
 *  Copyright (c) 2019 Ascensio System SIA. All rights reserved.
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

    Common.UI.HsbColorPicker = Backbone.View.extend(_.extend({
        options: {
            color: '#000000'
        },
        template: _.template([
            '<div class="custom-colors <% if (phone) { %> phone <% } %>">',
                '<div class="color-picker-wheel">',
                    '<svg id="id-wheel" viewBox="0 0 300 300" width="300" height="300"><%=circlesColors%></svg>',
                    '<div class="color-picker-wheel-handle"></div>',
                    '<div class="color-picker-sb-spectrum" style="background-color: hsl(0, 100%, 50%)">',
                        '<div class="color-picker-sb-spectrum-handle"></div>',
                    '</div>',
                '</div>',
                '<div class="right-block">',
                    '<div class="color-hsb-preview">',
                        '<div class="new-color-hsb-preview" style=""></div>',
                        '<div class="current-color-hsb-preview" style=""></div>',
                    '</div>',
                    '<a href="#" class="button button-round" id="add-new-color"><i class="icon icon-plus" style="height: 30px;width: 30px;"></i></a>',
                '</div>',
            '</div>'
        ].join('')),

        initialize : function(options) {
            var me = this,
                el = $(me.el);
            me.currentColor = options.color;
            if(_.isObject(me.currentColor)) {
                me.currentColor = me.currentColor.color;
            }
            if (!me.currentColor) {
                me.currentColor = me.options.color;
            }
            if (me.currentColor === 'transparent') {
                me.currentColor = 'ffffff';
            }
            var colorRgb = me.colorHexToRgb(me.currentColor);
            me.currentHsl = me.colorRgbToHsl(colorRgb[0],colorRgb[1],colorRgb[2]);
            me.currentHsb = me.colorHslToHsb(me.currentHsl[0],me.currentHsl[1],me.currentHsl[2]);
            me.currentHue = [];

            me.options = _({}).extend(me.options, options);
            me.render();
        },

        render: function () {
            var me = this;

            var total = 256,
                circles = '';
            for (var i = total; i > 0; i -= 1) {
                var angle = i * Math.PI / (total / 2);
                var hue = 360 / total * i;
                circles += '<circle cx="' + (150 - Math.sin(angle) * 125) + '" cy="' + (150 - Math.cos(angle) * 125) + '" r="25" fill="hsl( ' + hue + ', 100%, 50%)"></circle>';
            }

            (me.$el || $(me.el)).html(me.template({
                circlesColors: circles,
                scope: me,
                phone: Common.SharedSettings.get('phone'),
                android: Common.SharedSettings.get('android')
            }));

            $('.current-color-hsb-preview').css({'background-color': '#' + me.currentColor});

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
            $('#add-new-color').single('click', _.bind(this.onClickAddNewColor, this));
            this.updateCustomColor();
        },

        colorHexToRgb: function(hex) {
            var h = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, function(m, r, g, b) { return (r + r + g + g + b + b)});
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);
            return result
                ? result.slice(1).map(function (n) { return parseInt(n, 16)})
                : null;
        },

        colorRgbToHsl: function(r, g, b) {
            r /= 255;
            g /= 255;
            b /= 255;
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

        colorHslToHsb: function(h, s, l) {
            var HSB = {h: h, s: 0, b: 0};
            var HSL = {h: h, s: s, l: l};
            var t = HSL.s * (HSL.l < 0.5 ? HSL.l : 1 - HSL.l);
            HSB.b = HSL.l + t;
            HSB.s = HSL.l > 0 ? 2 * t / HSB.b : HSB.s;
            return [HSB.h, HSB.s, HSB.b];
        },

        colorHsbToHsl: function(h, s, b) {
            var HSL = {h: h, s: 0, l: 0};
            var HSB = { h: h, s: s, b: b };
            HSL.l = (2 - HSB.s) * HSB.b / 2;
            HSL.s = HSL.l && HSL.l < 1 ? HSB.s * HSB.b / (HSL.l < 0.5 ? HSL.l * 2 : 2 - HSL.l * 2) : HSL.s;
            return [HSL.h, HSL.s, HSL.l];
        },

        colorHslToRgb: function(h, s, l) {
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

        colorRgbToHex: function(r, g, b) {
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
            this.currentHsl = this.colorHsbToHsl(this.currentHsl[0], s, b);
            this.updateCustomColor();
        },

        handleTouchStart: function (e) {
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

        updateCustomColor: function (first) {
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
            var color = this.colorHslToRgb(this.currentHsl[0], this.currentHsl[1], this.currentHsl[2]);
            this.currentColor = this.colorRgbToHex(color[0], color[1], color[2]);
            $('.new-color-hsb-preview').css({'background-color': this.currentColor});

        },

        onClickAddNewColor: function() {
            var color = this.currentColor;
            if (color) {
                if (color.charAt(0) === '#') {
                    color = color.substr(1);
                }
                this.trigger('addcustomcolor', this, color);
            }
        }

    }, Common.UI.HsbColorPicker || {}));
});