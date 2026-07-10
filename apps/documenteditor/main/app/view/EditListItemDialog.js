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
 *  EditListItemDialog.js
 *
 *  Created on 05.11.2019
 *
 */

define([], function () { 'use strict';

    DE.Views.EditListItemDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 330,
            header: false,
            cls: 'modal-dlg',
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            _.extend(this.options, options || {});

            this.template = [
                '<div class="box">',
                '<div class="input-row">',
                    '<label>' + this.textDisplayName + '</label>',
                '</div>',
                '<div id="id-dlg-label-name" class="input-row" style="margin-bottom: 8px;"></div>',
                '<div class="input-row">',
                '<label>' + this.textValue + '</label>',
                '</div>',
                '<div id="id-dlg-label-value" class="input-row"></div>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);
            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var me = this;
            me.inputName = new Common.UI.InputField({
                el          : $('#id-dlg-label-name'),
                allowBlank  : false,
                blankError  : me.textNameError,
                style       : 'width: 100%;',
                maxLength   : 256,
                validateOnBlur: false,
                validation  : function(value) {
                    return value ? true : '';
                }
            });
            me.inputName._input.on('input', function (e) {
                if (me.copyvalue==undefined && me.inputValue.getValue()==me.inputName.getValue()) {
                    me.copyvalue = 1;
                }
                if (me.copyvalue==1)
                    me.inputValue.setValue($(e.target).val());
                else if (me.copyvalue==2)
                    me.copyvalue = 0;
            });

            me.inputValue = new Common.UI.InputField({
                el          : $('#id-dlg-label-value'),
                style       : 'width: 100%;',
                maxLength   : 256,
                validateOnBlur: false,
                validation  : function(value) {
                    if (value!=='' && me.options.store) {
                        var rec = me.options.store.findWhere({value: value});
                        if (rec)
                            return me.textValueError
                    }
                    return true;
                }
            });
            me.inputValue._input.on('input', function (e) {
                if (me.copyvalue==undefined && me.inputValue.getValue()==me.inputName.getValue()) {
                    me.copyvalue = 2;
                }
                if (me.copyvalue==2)
                    me.inputName.setValue($(e.target).val());
                else if (me.copyvalue==1)
                    me.copyvalue = 0;
            });

            var $window = this.getChild();
            $window.find('.dlg-btn').on('click',     _.bind(this.onBtnClick, this));
        },

        getFocusedComponents: function() {
            return [this.inputName, this.inputValue].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.inputName;
        },

        onPrimary: function(event) {
            this._handleInput('ok');
            return false;
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        _handleInput: function(state) {
            if (this.options.handler) {
                if (state == 'ok') {
                    if (this.inputName.checkValidate() !== true)  {
                        this.inputName.focus();
                        return;
                    }
                    if (this.inputValue.checkValidate() !== true)  {
                        this.inputValue.focus();
                        return;
                    }
                }

                this.options.handler.call(this, state, this.inputName.getValue(), this.inputValue.getValue());
            }

            this.close();
        },

        setSettings: function (props) {
            if (props) {
                this.inputName.setValue(props.name || '');
                this.inputValue.setValue(props.value || '');
            }
        },

        textDisplayName: 'Display name',
        textValue: 'Value',
        textNameError: 'Display name must not be empty.',
        textValueError: 'An item with the same value already exists.'
    }, DE.Views.EditListItemDialog || {}));
});