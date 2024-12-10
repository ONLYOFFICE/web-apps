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
 *  OpenDialog.js
 *
 *  Select Codepage for open CSV/TXT format file.
 *
 *  Created on 29/04/14
 *
 */

define([], function () {
    'use strict';

    Common.Views.PasswordDialog = Common.UI.Window.extend(_.extend({

        applyFunction: undefined,

        initialize : function (options) {
            var t = this,
                _options = {};

            _.extend(_options,  {
                width           : 395,
                header          : true,
                cls             : 'modal-dlg',
                contentTemplate : '',
                title           : t.txtTitle,
                buttons: ['ok', 'cancel']

            }, options);

            this.handler        =   options.handler;

            this.template = options.template || [
                '<div class="box">',
                    '<div class="input-row" style="margin-bottom: 10px;">',
                        '<label>' + t.txtDescription + '</label>',
                    '</div>',
                    '<div class="input-row">',
                        '<label>' + t.txtPassword + (t.passwordOptional ? ' (' + t.txtOptional + ')': '') + '</label>',
                    '</div>',
                    '<div id="id-password-txt" class="input-row" style="margin-bottom: 5px;"></div>',
                    '<div class="input-row">',
                        '<label>' + t.txtRepeat + '</label>',
                    '</div>',
                    '<div id="id-repeat-txt" class="input-row" style="margin-bottom: 10px;"></div>',
                    '<label>' + t.txtWarning + '</label>',
                '</div>'
            ].join('');

            _options.tpl        =   _.template(this.template)(_options);

            Common.UI.Window.prototype.initialize.call(this, _options);
        },
        render: function () {
            Common.UI.Window.prototype.render.call(this);

            if (this.$window) {
                var me = this;
                this.$window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

                    this.repeatPwd = new Common.UI.InputField({
                        el: $('#id-repeat-txt'),
                        type: 'password',
                        allowBlank  : false,
                        style       : 'width: 100%;',
                        maxLength: 255,
                        validateOnBlur: false,
                        validation  : function(value) {
                            return me.txtIncorrectPwd;
                        }
                    });
                    this.inputPwd = new Common.UI.InputFieldBtnPassword({
                        el: $('#id-password-txt'),
                        type: 'password',
                        allowBlank  : false,
                        style       : 'width: 100%;',
                        maxLength: 255,
                        validateOnBlur: false,
                        repeatInput: this.repeatPwd,
                        showPwdOnClick: false
                    });
            }
        },

        getFocusedComponents: function() {
            return [this.inputPwd, this.repeatPwd].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.inputPwd;
        },

        onPrimary: function(event) {
            this._handleInput('ok');
            return false;
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        _handleInput: function(state) {
            if (this.handler) {
                if (state == 'ok') {
                    if (this.inputPwd.checkValidate() !== true)  {
                        this.inputPwd.focus();
                        return;
                    }
                    if (this.inputPwd.getValue() !== this.repeatPwd.getValue()) {
                        this.repeatPwd.checkValidate();
                        this.repeatPwd.focus();
                        return;
                    }
                }
                this.handler.call(this, state, this.inputPwd.getValue());
            }

            this.close();
        },

        txtTitle           : "Set Password",
        txtPassword        : "Password",
        txtDescription     : "A Password is required to open this document",
        txtRepeat: 'Repeat password',
        txtIncorrectPwd: 'Confirmation password is not identical',
        txtWarning: 'Warning: If you lose or forget the password, it cannot be recovered. Please keep it in a safe place.'

    }, Common.Views.PasswordDialog || {}));
});