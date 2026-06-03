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
 *  SignSettingsDialog.js
 *
 *  Created on 5/19/17
 *
 */


if (Common === undefined)
    var Common = {};

define([], function () { 'use strict';

    Common.Views.SignSettingsDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 350,
            style: 'min-width: 350px;',
            cls: 'modal-dlg',
            type: 'edit'
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle,
                buttons: ['ok'].concat((options.type || this.options.type) === 'edit' ? ['cancel'] : []),
            }, options || {});

            this.template = [
                '<div class="box" style="height: 250px;">',
                    '<div class="input-row">',
                        '<label>' + this.textInfoName + '</label>',
                    '</div>',
                    '<div id="id-dlg-sign-settings-name" class="input-row" style="margin-bottom: 5px;"></div>',
                    '<div class="input-row">',
                        '<label>' + this.textInfoTitle + '</label>',
                    '</div>',
                    '<div id="id-dlg-sign-settings-title" class="input-row" style="margin-bottom: 5px;"></div>',
                    '<div class="input-row">',
                        '<label>' + this.textInfoEmail + '</label>',
                    '</div>',
                    '<div id="id-dlg-sign-settings-email" class="input-row" style="margin-bottom: 10px;"></div>',
                    '<div class="input-row">',
                        '<label>' + this.textInstructions + '</label>',
                    '</div>',
                    '<div id="id-dlg-sign-settings-instructions"></div>',
                    '<div id="id-dlg-sign-settings-date"></div>',
                '</div>'
            ].join('');

            this.api = this.options.api;
            this.type = this.options.type || 'edit';
            this.options.tpl = _.template(this.template)(this.options);

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var me = this,
                $window = this.getChild();

            me.inputName = new Common.UI.InputField({
                el          : $('#id-dlg-sign-settings-name'),
                style       : 'width: 100%;',
                disabled    : this.type=='view'
            });

            me.inputTitle = new Common.UI.InputField({
                el          : $('#id-dlg-sign-settings-title'),
                style       : 'width: 100%;',
                disabled    : this.type=='view'
            });

            me.inputEmail = new Common.UI.InputField({
                el          : $('#id-dlg-sign-settings-email'),
                style       : 'width: 100%;',
                disabled    : this.type=='view'
            });

            me.textareaInstructions = new Common.UI.TextareaField({
                el          : $window.find('#id-dlg-sign-settings-instructions'),
                style       : 'width: 100%; height: 35px;margin-bottom: 10px;',
                value       : this.textDefInstruction,
                disabled    : this.type=='view'
            });

            this.chDate = new Common.UI.CheckBox({
                el: $('#id-dlg-sign-settings-date'),
                labelText: this.textShowDate,
                disabled: this.type=='view',
                value: 'checked'
            });

            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
        },

        getFocusedComponents: function() {
            return [this.inputName, this.inputTitle, this.inputEmail, this.textareaInstructions, this.chDate].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.inputName;
        },

        setSettings: function (props) {
            if (props) {
                var me = this;

                var value = props.asc_getSigner1();
                me.inputName.setValue(value ? value : '');
                value = props.asc_getSigner2();
                me.inputTitle.setValue(value ? value : '');
                value = props.asc_getEmail();
                me.inputEmail.setValue(value ? value : '');
                value = props.asc_getInstructions();
                me.textareaInstructions.setValue(value ? value : '');
                me.chDate.setValue(props.asc_getShowDate());

                me._currentGuid = props.asc_getGuid();
            }
        },

        getSettings: function () {
            var me = this,
                props = new AscCommon.asc_CSignatureLine();

            props.asc_setSigner1(me.inputName.getValue());
            props.asc_setSigner2(me.inputTitle.getValue());
            props.asc_setEmail(me.inputEmail.getValue());
            props.asc_setInstructions(me.textareaInstructions.getValue());
            props.asc_setShowDate(me.chDate.getValue()=='checked');
            (me._currentGuid!==undefined) && props.asc_setGuid(me._currentGuid);

            return props;
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        onPrimary: function(event) {
            this._handleInput('ok');
            return false;
        },

        _handleInput: function(state) {
            if (this.options.handler)
                this.options.handler.call(this, this, state);
            this.close();
        },

        textInfo:           'Signer Info',
        textInfoName:       'Suggested signer',
        textInfoTitle:      'Suggested signer\'s title',
        textInfoEmail:      'Suggested signer\'s e-mail',
        textInstructions:   'Instructions for signer',
        txtEmpty:           'This field is required',
        textAllowComment:   'Allow signer to add comment in the signature dialog',
        textShowDate:       'Show sign date in signature line',
        textTitle:          'Signature Setup',
        textDefInstruction: 'Before signing this document, verify that the content you are signing is correct.'
    }, Common.Views.SignSettingsDialog || {}))
});