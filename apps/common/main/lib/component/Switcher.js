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
 * User: Julia.Radzhabova
 * Date: 26.02.15
 */

if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/component/BaseView',
    'underscore'
], function (base, _) {
    'use strict';

    Common.UI.Switcher = Common.UI.BaseView.extend({

        options : {
            width: 25,
            thumbWidth: 13,
            value: false
        },

        disabled: false,

        template    : _.template([
            '<div class="switcher">',
                '<div class="sw-left"></div>',
                '<div class="sw-right"></div>',
                '<div class="thumb"></div>',
            '</div>'
        ].join('')),

        initialize : function(options) {
            Common.UI.BaseView.prototype.initialize.call(this, options);

            var me = this,
                el = $(this.el);

            me.width = me.options.width;
            me.thumbWidth = me.options.thumbWidth;
            me.delta = (me.width - me.thumbWidth - 2)/2;
            
            if (me.options.el)
                me.render();

            this.setValue(me.options.value);
        },

        render : function(parentEl) {
            var me = this;

            if (!me.rendered) {
                this.cmpEl = $(this.template({
                }));

                if (parentEl) {
                    this.setElement(parentEl, false);
                    parentEl.html(this.cmpEl);
                } else {
                    $(this.el).html(this.cmpEl);
                }
            } else {
                this.cmpEl = $(this.el);
            }

            this.thumb = this.cmpEl.find('.thumb');

            this.cmpEl.width(me.width);
            this.thumb.width(me.thumbWidth);
            this.cmpEl.find('.sw-left').width(me.width/2);
            this.cmpEl.find('.sw-right').width(me.width/2);

            var onMouseUp = function (e) {
                if ( me.disabled ) return;

                e.preventDefault();
                e.stopPropagation();

                $(document).off('mouseup.switcher',   onMouseUp);
                $(document).off('mousemove.switcher', onMouseMove);

                var pos = Math.round((e.pageX*Common.Utils.zoom() - me._dragstart));
                me.value = (me.value) ? (pos > -me.delta) : (pos > me.delta);
                me.cmpEl.toggleClass('on', me.value);
                me.thumb.css({left: '', right: ''});
                me.trigger('change', me, me.value);

                me._dragstart = undefined;
            };

            var onMouseMove = function (e) {
                if ( me.disabled ) return;
                if ( me._dragstart===undefined ) return;

                e.preventDefault();
                e.stopPropagation();

                var pos = Math.round((e.pageX*Common.Utils.zoom() - me._dragstart));
                if (me.value) {
                    me.thumb.css({right: (pos<1) ? Math.min(me.width-me.thumbWidth - 2, -pos) : 0, left: 'auto'});
                } else {
                    me.thumb.css({left: (pos>-1) ? Math.min(me.width-me.thumbWidth - 2, pos) : 0, right: 'auto'});
                }
                if (!me._isMouseMove) me._isMouseMove = Math.abs(pos)>0;
            };

            var onMouseDown = function (e) {
                if ( me.disabled ) return;
                me._dragstart = e.pageX*Common.Utils.zoom();
                me._isMouseMove = false;
                
                $(document).on('mouseup.switcher',   onMouseUp);
                $(document).on('mousemove.switcher', onMouseMove);
            };

            var onSwitcherClick = function (e) {
                if ( me.disabled || me._isMouseMove) { me._isMouseMove = false; return;}

                me.value = !me.value;
                me.cmpEl.toggleClass('on', me.value);
                me.trigger('change', me, me.value);
            };

            if (!me.rendered) {
                var el = me.cmpEl;
                el.on('mousedown', '.thumb', onMouseDown);
                el.on('click', onSwitcherClick);
            }

            me.rendered = true;

            return this;
        },

        setThumbPosition: function(x) {
            var isOn = (this.value) ? (x < -this.delta) : (x > this.delta);
            this.thumb.css((isOn) ? {right: 0, left: 'auto'} : {left: 0, right: 'auto'});
        },

        setValue: function(value) {
            this.value = (value===true);
            this.cmpEl.toggleClass('on', this.value);
        },

        getValue: function() {
            return this.value;
        },

        setDisabled: function(disabled) {
            if (disabled !== this.disabled)
                this.cmpEl.toggleClass('disabled', disabled);
            this.disabled = disabled;
        },

        isDisabled: function() {
            return this.disabled;
        }
    });
});
