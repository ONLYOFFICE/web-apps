/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/**
 *  Scroller.js
 *
 *  Created on 3/14/14
 *
 */

if (Common === undefined)
    var Common = {};

define([
    'jmousewheel',
    'perfectscrollbar',
    'common/main/lib/component/BaseView'
], function () { 'use strict';

    Common.UI.Scroller = (function(){
        var mouseCapture;

        return _.extend(Common.UI.BaseView.extend({
            options: {
                wheelSpeed              : 20,
                wheelPropagation        : false,
                minScrollbarLength      : null,
                useBothWheelAxes        : false,
                useKeyboard             : true,
                suppressScrollX         : false,
                suppressScrollY         : false,
                scrollXMarginOffset     : 5,
                scrollYMarginOffset     : 5,
                includePadding          : true,
                includeMargin           : true,
                alwaysVisibleX          : false,
                alwaysVisibleY          : false,
                scrollYStyle            : null
            },

            initialize: function(options) {
                Common.UI.BaseView.prototype.initialize.call(this, options);

                if (this.options.el) {
                    this.render();
                }
            },

            render: function() {
                var me = this;

                me.cmpEl = me.$el || $(this.el);

                if (!me.rendered) {
                    me.cmpEl.perfectScrollbar(_.extend({}, me.options));
                    me.rendered = true;

                    this.setAlwaysVisibleX(me.options.alwaysVisibleX);
                    this.setAlwaysVisibleY(me.options.alwaysVisibleY);

                    (this.options.scrollYStyle) && (this.setOptionStyleY(this.options.scrollYStyle));
                }

                return this;
            },

            remove: function() {
                this.destroy();
                Backbone.View.prototype.remove.call(this);
            },

            update: function(config) {
                var options = this.options;
                if (config) {
                    this.destroy();
                    options = _.extend(this.options, config);
                    this.cmpEl.perfectScrollbar(options);
                } else {
                    this.cmpEl.perfectScrollbar('update');
                }

                this.setAlwaysVisibleX(options.alwaysVisibleX);
                this.setAlwaysVisibleY(options.alwaysVisibleY);
                
                (options.scrollYStyle) && (this.setOptionStyleY(options.scrollYStyle));

                // Emulate capture scroller
                var mouseDownHandler = function(e) {
                    mouseCapture = true;

                    var upHandler = function(e) {
                        $(document).unbind('mouseup', upHandler);
                        _.delay(function() {
                            mouseCapture = false;
                        }, 10);
                    };

                    $(document).mouseup(upHandler);
                };

                $('.ps-scrollbar-x-rail, .ps-scrollbar-y-rail, .ps-scrollbar-x, .ps-scrollbar-y', this.cmpEl)
                    .off('mousedown', mouseDownHandler).on('mousedown', mouseDownHandler);
            },

            destroy: function() {
                this.cmpEl.perfectScrollbar('destroy');
            },

            scrollLeft: function(pos) {
                this.cmpEl.scrollLeft(pos);
                this.update();
            },

            scrollTop: function(pos) {
                this.cmpEl.scrollTop(pos);
                this.update();
            },

            getScrollTop: function () {
                return this.cmpEl.scrollTop();
            },

            getScrollLeft: function () {
                return this.cmpEl.scrollLeft();
            },
            setAlwaysVisibleX: function(flag) {
                if (flag) {
                    $(this.el).find('.ps-scrollbar-x-rail').addClass('always-visible-x');
                    $(this.el).find('.ps-scrollbar-x').addClass('always-visible-x');
                } else {
                    $(this.el).find('.ps-scrollbar-x-rail').removeClass('always-visible-x');
                    $(this.el).find('.ps-scrollbar-x').addClass('always-visible-x');
                }
            },
            setAlwaysVisibleY: function(flag) {
                if (flag) {
                    $(this.el).find('.ps-scrollbar-y-rail').addClass('always-visible-y');
                    $(this.el).find('.ps-scrollbar-y').addClass('always-visible-y');
                } else {
                    $(this.el).find('.ps-scrollbar-y-rail').removeClass('always-visible-y');
                    $(this.el).find('.ps-scrollbar-y').addClass('always-visible-y');
                }
            },

            setOptionStyleY: function (style) {
                $(this.el).find('.ps-scrollbar-y-rail').css(style);
                this.cmpEl.perfectScrollbar('update');
            },

            isVisible: function() {
                return $(this.el).find('.ps-scrollbar-y-rail').is(':visible');
            }

        }), {
            isMouseCapture: function() {
                return mouseCapture
            }
        })
    })();
});