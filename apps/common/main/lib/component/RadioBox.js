/**
 *  RadioBox.js
 *
 *  Created by Julia Radzhabova on 2/26/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */
/**
 * Radiobox can be in two states: true or false.
 * To get the radiobox state use getValue() function. It can return true/false.
 *
 * @property {String} name
 *  The name of the group of radioboxes.
 *
 *  name: 'group-name',
 *
 *  @property {Boolean} checked
 *  Initial state of radiobox.
 *
 *  checked: false,
 *
 * **/

   if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/component/BaseView',
    'underscore'
], function (base, _) {
    'use strict';

    Common.UI.RadioBox = Common.UI.BaseView.extend({

        options : {
            labelText: ''
        },

        disabled    : false,
        rendered    : false,

        template    : _.template('<label class="radiobox"><input type="button" name="<%= name %>" class="img-commonctrl"><%= labelText %></label>'),

        initialize : function(options) {
            Common.UI.BaseView.prototype.initialize.call(this, options);

            var me = this,
                el = $(this.el);

            this.name =  this.options.name || Common.UI.getId();

            this.render();

            if (this.options.disabled)
                this.setDisabled(this.options.disabled);

            if (this.options.checked!==undefined)
                this.setValue(this.options.checked, true);

            // handle events
            this.$radio.on('click', _.bind(this.onItemCheck, this));
        },

        render: function () {
            var el = $(this.el);
            el.html(this.template({
                labelText: this.options.labelText,
                name: this.name
            }));

            this.$radio = el.find('input[type=button]');
            this.rendered = true;

            return this;
        },

        setDisabled: function(disabled) {
            if (disabled !== this.disabled) {
                this.$radio.toggleClass('disabled', disabled);
                (disabled) ? this.$radio.attr({disabled: disabled}) : this.$radio.removeAttr('disabled');
            }

            this.disabled = disabled;
        },

        isDisabled: function() {
            return this.disabled;
        },

        onItemCheck: function (e) {
            if (!this.disabled) this.setValue(true);
        },

        setRawValue: function(value) {
            var value = (value === true || value === 'true' || value === '1' || value === 1 );
            $('input[type=button][name=' + this.name + ']').removeClass('checked');
            this.$radio.toggleClass('checked', value);
        },

        setValue: function(value, suspendchange) {
            if (this.rendered) {
                var lastValue = this.$radio.hasClass('checked');
                this.setRawValue(value);
                if (suspendchange !== true && lastValue !== value)
                    this.trigger('change', this, this.$radio.hasClass('checked'));
            } else {
                this.options.checked = value;
            }
        },

        getValue: function() {
            return this.$radio.hasClass('checked');
        }
    });
});