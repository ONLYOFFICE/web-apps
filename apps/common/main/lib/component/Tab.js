/**
 *    Tab.js
 *
 *    Created by Maxim Kadushkin on 01 April 2014
 *    Copyright (c) 2014 Ascensio System SIA. All rights reserved.
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
        this.template   = _.template(['<li class="<% if(active){ %>active<% } %> <% if(cls.length){%><%= cls %><%}%>" data-label="<%= label %>">',
                                            '<a><%- label %></a>',
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

        hasClass: function(cls) {
            return this.$el.hasClass(cls);
        },

        setCaption: function(text) {
            this.$el.find('> a').text(text);
        }
    });

    Common.UI.Tab = Tab;
});

