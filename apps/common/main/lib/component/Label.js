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
 *  Label.js
 *
 *  Created on 1/20/22
 *
 */

if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/component/BaseView',
    'underscore'
], function (base, _) {
    'use strict';

    Common.UI.Label = Common.UI.BaseView.extend({

        options : {
            id          : null,
            disabled    : false,
            cls     : '',
            iconCls     : '',
            style       : '',
            caption     : ''
        },

        template    : _.template('<label class="label-cmp <%= cls %>" style="<%= style %>">' +
                                    '<% if ( iconCls ) { %>' +
                                        '<i class="icon <%= iconCls %>"></i>' +
                                    '<% } %>' +
                                    '<span class="caption"><%= caption %></span>' +
                                 '</label>'),

        initialize : function(options) {
            Common.UI.BaseView.prototype.initialize.call(this, options);

            this.id           = this.options.id || Common.UI.getId();
            this.cls          = this.options.cls;
            this.iconCls      = this.options.iconCls;
            this.style        = this.options.style;
            this.disabled     = this.options.disabled;
            this.caption      = this.options.caption;
            this.template     = this.options.template || this.template;
            this.rendered     = false;

            if (this.options.el)
                this.render();
        },

        render: function (parentEl) {
            var me = this;
            if (!me.rendered) {
                var elem = this.template({
                    id           : me.id,
                    cls          : me.cls,
                    iconCls      : me.iconCls,
                    style        : me.style,
                    caption      : me.caption
                });
                if (parentEl) {
                    this.setElement(parentEl, false);
                    parentEl.html(elem);
                } else {
                    me.$el.html(elem);
                }

                this.$label = me.$el.find('.label-cmp');
                this.rendered = true;
            }

            if (this.disabled)
                this.setDisabled(!(this.disabled=false));

            if (this.options.scaling !== false && this.iconCls) {
                this.$label.attr('ratio', 'ratio');
                this.applyScaling(Common.UI.Scaling.currentRatio());

                this.$label.on('app:scaling', function (e, info) {
                    if (me.options.scaling != info.ratio) {
                        me.applyScaling(info.ratio);
                    }
                });
            }

            return this;
        },

        setDisabled: function(disabled) {
            if (this.rendered) {
                disabled = (disabled===true);
                if (disabled !== this.disabled) {
                    this.$label.toggleClass('disabled', disabled);
                }
            }

            this.disabled = disabled;
        },

        isDisabled: function() {
            return this.disabled;
        },

        applyScaling: function (ratio) {
            if (this.options.scaling != ratio) {
                this.options.scaling = ratio;

                if (ratio > 2) {
                    if (!this.$label.find('svg.icon').length) {
                        var iconCls = this.iconCls,
                            re_icon_name = /btn-[^\s]+/.exec(iconCls),
                            icon_name = re_icon_name ? re_icon_name[0] : "null",
                            svg_icon = '<svg class="icon"><use class="zoom-int" href="#%iconname"></use></svg>'.replace('%iconname', icon_name);

                        this.$label.find('i.icon').after(svg_icon);
                    }
                }
            }
        },

        setCaption: function(text) {
            this.$label.find('.caption').text(text);
        }
    });
});