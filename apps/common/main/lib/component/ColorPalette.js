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
 *  ColorPalette.js
 *
 *  Created on 2/20/14
 *
 */

if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/component/BaseView'
], function () { 'use strict';

    Common.UI.ColorPalette = Common.UI.BaseView.extend({
        options: {
            allowReselect: true,
            cls: '',
            style: ''
        },

        template:_.template([
            '<div class="palette-color">',
                '<% _.each(colors, function(color, index) { %>',
                    '<span class="color-item" data-color="<%= color %>" style="background-color: #<%= color %>;"></span>',
                '<% }) %>',
            '</div>'
        ].join('')),

        initialize : function(options) {
            Common.UI.BaseView.prototype.initialize.call(this, options);

            var me = this;

            this.id = me.options.id;
            this.cls = me.options.cls;
            this.style = me.options.style;
            this.colors = me.options.colors || [];
            this.value = me.options.value;

            if (me.options.el) {
                me.render();
            }
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
                    me.$el.html(this.cmpEl);
                }
            } else {
                this.cmpEl = me.$el || $(this.el);
            }

            if (!me.rendered) {
                me.cmpEl.on('click', 'span.color-item', me.itemClick.bind(me));
            }

            me.rendered = true;

            return this;
        },

        itemClick: function(e) {
            var item = $(e.target);

            this.select(item.attr('data-color'));
        },

        select: function(color, suppressEvent) {
            if (this.value != color) {
                var me = this;

                // Remove selection with other elements
                $('span.color-item', this.cmpEl).removeClass('selected');

                this.value = color;

                if (color && /#?[a-fA-F0-9]{6}/.test(color)) {
                    color = /#?([a-fA-F0-9]{6})/.exec(color)[1].toUpperCase();

                    $('span[data-color=' + color + ']', this.cmpEl).addClass('selected');

                    if (!suppressEvent)
                        me.trigger('select', me, this.value);
                }
            }
        }
    });
});