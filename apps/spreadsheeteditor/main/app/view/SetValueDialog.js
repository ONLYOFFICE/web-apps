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
 *  SetValueDialog.js
 *
 *  Created on 4/21/14
 *
 */

define([], function () { 'use strict';

    SSE.Views.SetValueDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 214,
            header: true,
            style: 'min-width: 214px;',
            cls: 'modal-dlg',
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.template = [
                '<div class="box">',
                    '<div class="input-row">',
                        '<div id="id-spin-set-value"></div>',
                    '</div>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);
            this.startvalue = this.options.startvalue;
            this.maxvalue = this.options.maxvalue;
            this.defaultUnit = this.options.defaultUnit;
            this.step = this.options.step;

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            this.spnSize = new Common.UI.MetricSpinner({
                el: $('#id-spin-set-value'),
                width: 182,
                step: this.step,
                defaultUnit : this.defaultUnit,
                minValue    : 0,
                maxValue    : this.maxvalue
            });
            this.spnSize.setValue((this.startvalue!==null) ? (this.startvalue + ' ' + this.defaultUnit) : '');

            if (this.startvalue!==null) {
                var me = this;
                setTimeout(function() {
                    var input = me.spnSize.$input[0];
                    if (document.selection) { // IE
                        me.spnSize.$input.select();
                    } else { //FF and Webkit
                        input.selectionStart = 0;
                        input.selectionEnd = (me.startvalue).toString().length;
                    }
                }, 10);
            }

            var $window = this.getChild();
            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
            this.spnSize.on('entervalue', _.bind(this.onPrimary, this));
            if (this.options.rounding)
                this.spnSize.on('change', _.bind(this.onChange, this));
            this.spnSize.$el.find('input').focus();
        },

        getFocusedComponents: function() {
            return [this.spnSize].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.spnSize;
        },

        _handleInput: function(state) {
            if (this.options.handler) {
                this.options.handler.call(this, this, state);
            }

            this.close();
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        onChange: function () {
            var val = this.spnSize.getNumberValue();
            val = val / this.step; val = (val | val) * this.step;
            this.spnSize.setValue(val, true);
        },

        getSettings: function() {
            return this.spnSize.getNumberValue();
        },

        onPrimary: function() {
            this._handleInput('ok');
            return false;
        },

        txtMinText: 'The minimum value for this field is {0}',
        txtMaxText: 'The maximum value for this field is {0}'
    }, SSE.Views.SetValueDialog || {}))
});