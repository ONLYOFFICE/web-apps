/**
 *  CheckBox.js
 *
 *  Created by Julia Radzhabova on 1/24/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

/**
 *  Single checkbox field. Can be used as a direct replacement for traditional checkbox fields.
 *  Checkboxes may be given an optional {@link #labelText} which will be displayed immediately after checkbox.
 *
 *  Example usage:
 *      new Common.UI.CheckBox({
 *          el          : $('#id'),
 *          labelText   : 'someText',
 *          value       : true
 *      });
 *
 *  # Values
 *
 *  The main value of a checkbox is a boolean, indicating whether or not the checkbox is checked.
 *  To check the checkbox use setValue(...) function with parameters:
 *
 *  - `true`
 *  - `'true'`
 *  - `'1'`
 *  - `1`
 *  - 'checked'
 *
 *  Checkbox can be in indeterminate state. Use setValue('indeterminate').
 *
 *  Any other value will uncheck the checkbox.
 *
 *  To get the checkbox state use getValue() function. It can return 'checked' / 'unchecked' / 'indeterminate'.
 *
 *  @property {Boolean} disabled
 *  True if this checkbox is disabled.
 *
 *  disabled: false,
 *
 * **/

if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/component/BaseView',
    'underscore'
], function (base, _) {
    'use strict';

    Common.UI.CheckBox = Common.UI.BaseView.extend({

        options : {
            labelText: ''
        },

        disabled    : false,
        rendered    : false,
        indeterminate: false,
        checked     : false,
        value       : 'unchecked',

        template    : _.template('<label class="checkbox-indeterminate"><input type="button" class="img-commonctrl"><span><%= labelText %></span></label>'),

        initialize : function(options) {
            Common.UI.BaseView.prototype.initialize.call(this, options);

            var me = this,
                el = $(this.el);

            this.render();

            if (this.options.disabled)
                this.setDisabled(this.options.disabled);

            if (this.options.value!==undefined)
                this.setValue(this.options.value, true);

            // handle events
            this.$chk.on('click', _.bind(this.onItemCheck, this));
        },

        render: function () {
            var el = $(this.el);
            el.html(this.template({
                labelText: this.options.labelText
            }));

            this.$chk = el.find('input[type=button]');
            this.$label = el.find('label');

            this.rendered = true;

            return this;
        },

        setDisabled: function(disabled) {
            if (disabled !== this.disabled) {
                this.$label.toggleClass('disabled', disabled);
                (disabled) ? this.$chk.attr({disabled: disabled}) : this.$chk.removeAttr('disabled');
            }

            this.disabled = disabled;
        },

        isDisabled: function() {
            return this.disabled;
        },

        onItemCheck: function (e) {
            if (!this.disabled) {
                if (this.indeterminate){
                    this.indeterminate = false;
                    this.setValue(false);
                } else {
                    this.setValue(!this.checked);
                }
            }
        },

        setRawValue: function(value) {
            this.checked = (value === true || value === 'true' || value === '1' || value === 1 || value === 'checked');
            this.indeterminate = (value === 'indeterminate');

            this.$chk.toggleClass('checked', this.checked);
            this.$chk.toggleClass('indeterminate', this.indeterminate);

            this.value = this.indeterminate ? 'indeterminate' : (this.checked ? 'checked' : 'unchecked');
        },

        setValue: function(value, suspendchange) {
            if (this.rendered) {
                this.lastValue = this.value;
                this.setRawValue(value);
                if (suspendchange !== true && this.lastValue !== value)
                    this.trigger('change', this, this.value, this.lastValue);
            } else {
                this.options.value = value;
            }
        },

        getValue: function() {
            return this.value;
        },

        isChecked: function () {
            return this.checked;
        },

        setCaption: function(text) {
            this.$label.find('span').text(text);
        }
    });
});