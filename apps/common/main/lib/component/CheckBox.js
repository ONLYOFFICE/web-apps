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

    Common.UI.CheckBoxTemplate = '<label class="checkbox-indeterminate">' +
            '<input id="<%= id %>" type="checkbox" class="checkbox__native">' +
            '<label for="<%= id %>" class="checkbox__shape canfocused">' +
                '<svg width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" x="0" y="0">' +
                    '<path class="chb-check-mark" d="M10.767,4.201c0.3,0.29 0.31,0.76 0.03,1.07l-4.25,4.5c-0.14,0.14 -0.34,0.23 -0.54,0.23c-0.2,-0 -0.4,-0.08 -0.54,-0.22l-2.25,-2.25c-0.29,-0.29 -0.29,-0.77 0,-1.06c0.29,-0.29 0.77,-0.29 1.06,-0l1.7,1.7l3.72,-3.93c0.29,-0.31 0.76,-0.32 1.07,-0.04Z"/>' +
                    '<rect class="chb-indeterminate" height="2" rx="0.5" transform="matrix(1 0 0 1 0 0)" width="8" x="3" y="6"/>' +
                '</svg>' +
            '</label>' +
        '</label>';

    Common.UI.CheckBox = Common.UI.BaseView.extend({

        options : {
            labelText: ''
        },

        disabled    : false,
        rendered    : false,
        indeterminate: false,
        checked     : false,
        value       : 'unchecked',

        template: _.template([
            '<label class="checkbox-indeterminate">',
                '<input id="<%= id %>" type="checkbox" class="checkbox__native">',
                '<label for="<%= id %>" class="checkbox__shape canfocused" data-hint="<%= dataHint %>" data-hint-direction="<%= dataHintDirection %>" data-hint-offset="<%= dataHintOffset %>" role="checkbox" aria-checked="false" aria-labelledby="<%= id %>-description">',
                    '<svg width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" x="0" y="0">',
                        '<path class="chb-check-mark" d="M10.767,4.201c0.3,0.29 0.31,0.76 0.03,1.07l-4.25,4.5c-0.14,0.14 -0.34,0.23 -0.54,0.23c-0.2,-0 -0.4,-0.08 -0.54,-0.22l-2.25,-2.25c-0.29,-0.29 -0.29,-0.77 0,-1.06c0.29,-0.29 0.77,-0.29 1.06,-0l1.7,1.7l3.72,-3.93c0.29,-0.31 0.76,-0.32 1.07,-0.04Z"/>',
                        '<rect class="chb-indeterminate" height="2" rx="0.5" transform="matrix(1 0 0 1 0 0)" width="8" x="3" y="6"/>',
                    '</svg>',
                '</label>',
                '<span id="<%= id %>-description"></span>',
            '</label>'
        ].join('')),

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