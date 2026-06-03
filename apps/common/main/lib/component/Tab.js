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
 *    Tab.js
 *
 *    Created on 01 April 2014
 *
 */


if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/component/BaseView'
], function (base) {
    'use strict';

    var Tab = function(opts) {
        this.active     = false;
        this.label      = 'Tab';
        this.cls        = '';
        this.iconCls    = '';
        this.iconVisible = false;
        this.iconTitle = '';
        this.index = -1;
        this.template   = _.template(['<li class="list-item <% if(active){ %>active selected<% } %> <% if(cls.length){%><%= cls %><%}%><% if(iconVisible){%> icon-visible <%}%>" data-label="<%- label %>">',
                                            '<span tabtitle="<%- label %>" draggable="true" oo_editor_input="true" tabindex="-1" data-index="<%= sheetindex %>">',
                                            '<div class="toolbar__icon <% if(iconCls.length){%><%= iconCls %><%}%>" title="<% if(iconTitle.length){%><%=Common.Utils.String.htmlEncode(iconTitle)%><%}%>"></div>',
                                            '<%- label %>',
                                            '</span>',
                                        '</li>'].join(''));

        this.initialize.call(this, opts);
        return this;
    };

    _.extend(Tab.prototype, {
        initialize: function(options) {
            _.extend(this, options);
        },

        render: function() {
            var el      = this.template(this);
            this.$el    = $(el);
            /*this.$el.find('span').tooltip({
                title: this.label,
                placement: 'cursor'});*/
            this.rendered = true;
            this.disable(this.disabled);
            return this;
        },

        isActive: function() {
            return this.$el.hasClass('active');
        },

        activate: function(){
            if (!this.$el.hasClass('active'))
                this.$el.addClass('active');
        },

        isSelected: function() {
            return this.$el.hasClass('selected');
        },

        deactivate: function(){
            this.$el.removeClass('active');
        },

        on: function() {
            this.$el.on.apply(this, arguments);
        },

        disable: function(val) {
            this.disabled = val;

            if (this.rendered) {
                if (val && !this.$el.hasClass('disabled'))
                    this.$el.addClass('disabled'); else
                    this.$el.removeClass('disabled');
            }
        },

        addClass: function(cls) {
            if (cls.length && !this.$el.hasClass(cls))
                this.$el.addClass(cls);
        },

        removeClass: function(cls) {
            if (cls.length && this.$el.hasClass(cls))
                this.$el.removeClass(cls);
        },

        toggleClass: function(cls) {
            if (cls.length)
                this.$el.toggleClass(cls);
        },

        hasClass: function(cls) {
            return this.$el.hasClass(cls);
        },

        setCaption: function(text) {
            this.$el.find('> span').text(text);
        },

        changeIconState: function(visible, title) {
            if (this.iconCls.length) {
                this.iconVisible = visible;
                this.iconTitle = title || '';
                this[visible ? 'addClass' : 'removeClass']('icon-visible');
                if (title)
                    this.$el.find('.' + this.iconCls).attr('title', title);
            }
        }
    });

    Common.UI.Tab = Tab;
});

