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
 *  RadioBox.js
 *
 *  Created on 2/26/14
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

        template    : _.template('<div class="radiobox canfocused" role="radio" data-hint="<%= dataHint %>" data-hint-direction="<%= dataHintDirection %>" data-hint-offset="<%= dataHintOffset %>">' +
                                    '<input type="radio" name="<%= name %>" id="<%= id %>" class="button__radiobox">' +
                                    '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                                        '<circle class="rb-circle" cx="8" cy="8" r="6.5" />' +
                                        '<circle class="rb-check-mark" cx="8" cy="8" r="4" />' +
                                    '</svg>' +
                                    '<span></span></div>'),

        initialize : function(options) {
            Common.UI.BaseView.prototype.initialize.call(this, options);

            this.dataHint = options.dataHint;
            this.dataHintDirection = options.dataHintDirection;
            this.dataHintOffset = options.dataHintOffset;

            var me = this;

            this.name =  this.options.name || Common.UI.getId();

            this.render();

            if (this.options.disabled)
                this.setDisabled(this.options.disabled);

            if (this.options.checked!==undefined)
                this.setValue(this.options.checked, true);

            this.setCaption(this.options.labelText);

            if (this.options.ariaLabel || this.options.labelText) {
                var ariaLabel = this.options.ariaLabel ? this.options.ariaLabel : this.options.labelText;
                this.$label.attr('aria-label', ariaLabel);
            }

            // handle events
        },

        render: function () {
            var el = this.$el || $(this.el);
            el.html(this.template({
                labelText: this.options.labelText,
                name: this.name,
                id: Common.UI.getId('rdb-'),
                dataHint: this.dataHint,
                dataHintDirection: this.dataHintDirection,
                dataHintOffset: this.dataHintOffset
            }));

            this.$radio = el.find('input[type=radio]');
            this.$label = el.find('div.radiobox');
            this.$span = this.$label.find('span');
            this.$label.on({
                'keydown': this.onKeyDown.bind(this),
                'click': function(e){
                    if ( !this.disabled )
                        this.setValue(true);
                }.bind(this),});

            this.rendered = true;

            return this;
        },

        setDisabled: function(disabled) {
            if (!this.rendered)
                return;

            disabled = !!disabled;
            if (disabled !== this.disabled) {
                this.$label.toggleClass('disabled', disabled);
                this.$radio.toggleClass('disabled', disabled);
                (disabled) ? this.$radio.attr({disabled: disabled}) : this.$radio.removeAttr('disabled');
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
            if (!this.disabled) this.setValue(true);
        },

        setRawValue: function(value) {
            var value = (value === true || value === 'true' || value === '1' || value === 1 );
            if (value) {
                var input = $('input[type=radio][name=' + this.name + ']');
                input.removeClass('checked');
                input.parent().attr('aria-checked', false);
            }
            this.$radio.toggleClass('checked', value);
            this.$radio.prop('checked', value);

            this.$label.attr('aria-checked', value);
        },

        setValue: function(value, suspendchange) {
            if (this.rendered) {
                var lastValue = this.$radio.hasClass('checked');
                this.setRawValue(value);
                if (suspendchange !== true && lastValue !== value)
                    this.trigger('change', this, this.$radio.is(':checked'));
            } else {
                this.options.checked = value;
            }
        },

        getValue: function() {
            return this.$radio.is(':checked');
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