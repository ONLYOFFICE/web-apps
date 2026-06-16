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
 *  UserNameDialog.js
 *
 *  Created on 09.12.2020
 *
 */

define([
    'common/main/lib/component/Window'
], function () { 'use strict';

    Common.Views.UserNameDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 330,
            header: false,
            modal       : false,
            cls: 'modal-dlg',
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            _.extend(this.options, options || {});

            this.template = [
                '<div class="box">',
                '<div style="margin-bottom: 2px;">' + (this.options.label ? this.options.label : this.textLabel) + '</div>',
                '<div id="id-dlg-username-caption" class="input-row"></div>',
                '<div id="id-dlg-username-chk-use" class="" style="margin-top: 10px;"></div>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var me = this;
            me.inputLabel = new Common.UI.InputField({
                el          : $('#id-dlg-username-caption'),
                allowBlank  : true,
                style       : 'width: 100%;',
                maxLength   : 128,
                validateOnBlur: false,
                validation  : me.options.validation || function(value) {
                    return value ? true : '';
                }
            });
            me.inputLabel.setValue(this.options.value || '' );

            me.chDontShow = new Common.UI.CheckBox({
                el: $('#id-dlg-username-chk-use'),
                labelText: this.textDontShow,
                value: this.options.check
            });

            var $window = this.getChild();
            $window.find('.dlg-btn').on('click',     _.bind(this.onBtnClick, this));
        },

        show: function() {
            Common.UI.Window.prototype.show.apply(this, arguments);

            var me = this;
            _.delay(function(){
                me.getChild('input').focus();
            },50);
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
                    if (this.inputLabel.checkValidate() !== true)  {
                        this.inputLabel.cmpEl.find('input').focus();
                        return;
                    }
                }

                this.options.handler.call(this, state, {input: this.inputLabel.getValue(), checkbox: this.chDontShow.getValue()=='checked'});
            }

            this.close();
        },

        textLabel: 'Label:',
        textLabelError: 'Label must not be empty.',
        textDontShow: 'Don\'t ask me again'
    }, Common.Views.UserNameDialog || {}));
});