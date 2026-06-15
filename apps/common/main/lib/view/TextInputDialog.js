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
 *  TextInputDialog.js
 *
 *  Created on 17/08/24
 *
 */

define([], function () { 'use strict';

    Common.Views.TextInputDialog = Common.UI.Window.extend(_.extend({

        initialize : function(options) {
            var _options = {};

            _.extend(_options, {
                header: !!options.title,
                label: options.label || '',
                description: options.description || '',
                width: 330 || options.width,
                cls: 'modal-dlg',
                buttons: ['ok', 'cancel']
            }, options || {});

            this.template = [
                '<div class="box">',
                    '<div class="input-row <% if (!label) { %> hidden <% } %>">',
                        '<label><%= label %></label>',
                    '</div>',
                    '<div id="id-dlg-label-custom-input" class="input-row"></div>',
                    '<div class="input-row <% if (!description) { %> hidden <% } %>">',
                        '<label class="light"><%= description %></label>',
                    '</div>',
                '</div>'
            ].join('');

            this.inputConfig = _.extend({
                allowBlank: true
            }, options.inputConfig || {});

            this.inputFixedConfig = options.inputFixedConfig;

            _options.tpl = _.template(this.template)(_options);
            Common.UI.Window.prototype.initialize.call(this, _options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var me = this;
            me.inputLabel = !this.inputFixedConfig ? new Common.UI.InputField({
                el          : $('#id-dlg-label-custom-input'),
                allowBlank  : me.inputConfig.allowBlank,
                blankError  : me.inputConfig.blankError,
                maxLength   : me.inputConfig.maxLength,
                style       : 'width: 100%;',
                validateOnBlur: false,
                validation  : me.inputConfig.validation
            }) : new Common.UI.InputFieldFixed({
                el          : $('#id-dlg-label-custom-input'),
                allowBlank  : me.inputConfig.allowBlank,
                blankError  : me.inputConfig.blankError,
                maxLength   : me.inputFixedConfig.fixedValue && me.inputConfig.maxLength ? me.inputConfig.maxLength - me.inputFixedConfig.fixedValue.length : me.inputConfig.maxLength,
                style       : 'width: 100%;',
                validateOnBlur: false,
                validation  : me.inputConfig.validation,
                cls         : 'text-align-left',
                fixedValue  : me.inputFixedConfig.fixedValue,
                fixedCls    : 'light',
                fixedWidth  : me.inputFixedConfig.fixedWidth
            });
            me.inputLabel.cmpEl.on('focus', 'input.fixed-text', function() {
                setTimeout(function(){me.inputLabel._input && me.inputLabel._input.focus();}, 1);
            });
            me.inputLabel.setValue(me.options.value || '');
            var $window = this.getChild();
            $window.find('.dlg-btn').on('click',     _.bind(this.onBtnClick, this));
        },

        getFocusedComponents: function() {
            return [{cmp: this.inputLabel, selector: 'input:not(.fixed-text)'}].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.inputLabel;
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

                this.options.handler.call(this, state, this.inputLabel.getValue());
            }

            this.close();
        }

    }, Common.Views.TextInputDialog || {}));

    Common.Views.ImageFromUrlDialog = Common.Views.TextInputDialog.extend(_.extend({

        initialize : function(options) {

            var _options = {},
                me = this;
            _.extend(_options, {
                header: false,
                label: options.label || me.textUrl,
                inputConfig: {
                    allowBlank  : false,
                    blankError  : me.txtEmpty,
                    validation  : function(value) {
                        return (/((^https?)|(^ftp)):\/\/.+/i.test(value)) ? true : me.txtNotUrl;
                    }
                }
            }, options || {});

            Common.Views.TextInputDialog.prototype.initialize.call(this, _options);
        },

        textUrl         : 'Paste an image URL:',
        txtEmpty        : 'This field is required',
        txtNotUrl       : 'This field should be a URL in the format \"http://www.example.com\"'
    }, Common.Views.ImageFromUrlDialog || {}));
});