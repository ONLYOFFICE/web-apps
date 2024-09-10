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

            _options.tpl = _.template(this.template)(_options);
            Common.UI.Window.prototype.initialize.call(this, _options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var me = this;
            me.inputLabel = new Common.UI.InputField({
                el          : $('#id-dlg-label-custom-input'),
                allowBlank  : me.inputConfig.allowBlank,
                blankError  : me.inputConfig.blankError,
                style       : 'width: 100%;',
                validateOnBlur: false,
                validation  : me.inputConfig.validation
            });
            me.inputLabel.setValue(me.options.value || '');
            var $window = this.getChild();
            $window.find('.dlg-btn').on('click',     _.bind(this.onBtnClick, this));
        },

        getFocusedComponents: function() {
            return [this.inputLabel].concat(this.getFooterButtons());
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