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
                this.setDisabled(this.disabled);

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
            if (!this.rendered)
                return;

            disabled = (disabled===true);
            if (disabled !== this.disabled) {
                this.$label.toggleClass('disabled', disabled);
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
        }
    });
});