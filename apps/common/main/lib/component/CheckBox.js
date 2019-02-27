/*
 *
 * (c) Copyright Ascensio System SIA 2010-2019
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
 * You can contact Ascensio System SIA at 20A-12 Ernesta Birznieka-Upisha
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
 *  Created by Julia Radzhabova on 1/24/14
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
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

            if (this.options.el)
                this.render();
        },

        render: function (parentEl) {
            var me = this,
                el = $(this.el);
            if (!me.rendered) {
                if (parentEl) {
                    this.setElement(parentEl, false);
                    parentEl.html(this.template({
                        labelText: this.options.labelText
                    }));
                    el = $(this.el);
                } else {
                    el.html(this.template({
                        labelText: this.options.labelText
                    }));
                }

                this.$chk = el.find('input[type=button]');
                this.$label = el.find('label');
                this.$chk.on('click', _.bind(this.onItemCheck, this));
            }

            this.rendered = true;

            if (this.options.disabled)
                this.setDisabled(this.options.disabled);

            if (this.options.value!==undefined)
                this.setValue(this.options.value, true);

            // handle events
            return this;
        },

        setDisabled: function(disabled) {
            disabled = (disabled===true);
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