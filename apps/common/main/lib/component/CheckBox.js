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
 *  CheckBox.js
 *
 *  Created on 1/24/14
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

        template    : _.template('<label class="checkbox-indeterminate"><input id="<%= id %>" type="checkbox" class="checkbox__native">' +
                                    '<label for="<%= id %>" class="checkbox__shape canfocused" data-hint="<%= dataHint %>" data-hint-direction="<%= dataHintDirection %>" data-hint-offset="<%= dataHintOffset %>" role="checkbox" aria-checked="false" aria-labelledby="<%= id %>-description"></label><span id="<%= id %>-description"></span></label>'),

        initialize : function(options) {
            Common.UI.BaseView.prototype.initialize.call(this, options);

            if (this.options.el)
                this.render();
        },

        render: function (parentEl) {
            var me = this;
            if (!me.rendered) {
                var elem = this.template({
                    id: Common.UI.getId('chb-'),
                    dataHint: me.options.dataHint,
                    dataHintDirection: me.options.dataHintDirection,
                    dataHintOffset: me.options.dataHintOffset
                });
                if (parentEl) {
                    this.setElement(parentEl, false);
                    parentEl.html(elem);
                } else {
                    me.$el.html(elem);
                }

                this.$chk = me.$el.find('input[type=checkbox]');
                this.$label = me.$el.find('label.checkbox-indeterminate');
                this.$span = me.$label.find('span');
                this.$chk.on('click', this.onItemCheck.bind(this));
                this.$label.on('keydown', this.onKeyDown.bind(this));

                this.rendered = true;
            }

            if (this.options.disabled)
                this.setDisabled(this.options.disabled);

            if (this.options.value!==undefined)
                this.setValue(this.options.value, true);

            this.setCaption(this.options.labelText);

            // handle events
            return this;
        },

        setDisabled: function(disabled) {
            if (!this.rendered)
                return;

            disabled = (disabled===true);
            if (disabled !== this.disabled) {
                this.$label.toggleClass('disabled', disabled);
                (disabled) ? this.$chk.attr({disabled: disabled}) : this.$chk.removeAttr('disabled');
                if (this.tabindex!==undefined) {
                    disabled && (this.tabindex = this.$label.attr('tabindex'));
                    this.$label.attr('tabindex', disabled ? "-1" : this.tabindex);
                }
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

            this.value = this.indeterminate ? 'indeterminate' : (this.checked ? 'checked' : 'unchecked');
            this.$chk.prop({indeterminate: this.indeterminate, checked: this.checked});

            $(this.$label.find('label')).attr('aria-checked', this.indeterminate ? 'mixed' : this.checked);
        },

        setValue: function(value, suspendchange) {
            if (this.rendered) {
                if ( value != this.value ) {
                    this.lastValue = this.value;
                    this.setRawValue(value);
                    if (suspendchange !== true)
                        this.trigger('change', this, this.value, this.lastValue);
                }
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
            this.$span.text(text);
            this.$span.css('visibility', text ? 'visible' : 'hidden');
        },

        onKeyDown: function(e) {
            if (e.isDefaultPrevented())
                return;

            if (e.keyCode === Common.UI.Keys.SPACE)
                this.onItemCheck(e);
        },

        focus: function() {
            this.$label && this.$label.focus();
        },

        setTabIndex: function(tabindex) {
            if (!this.rendered)
                return;

            this.tabindex = tabindex.toString();
            !this.disabled && this.$label.attr('tabindex', this.tabindex);
        }
    });
});