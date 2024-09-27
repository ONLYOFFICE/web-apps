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