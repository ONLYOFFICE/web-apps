/*
 *
 * (c) Copyright Ascensio System SIA 2010-2020
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
 * You can contact Ascensio System SIA at 20A-12 Ernesta Birznieka-Upisha
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
 *  AdvancedSeparatorDialog.js
 *
 *  Created by Julia Radzhabova on 26/06/20
 *  Copyright (c) 2020 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/component/Window',
    'common/main/lib/component/InputField'
], function () { 'use strict';

    SSE.Views.AdvancedSeparatorDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 330,
            cls: 'modal-dlg',
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.template = [
                '<div class="box">',
                '<div class="input-row" style="margin-bottom: 8px;">',
                    '<label>' + this.textLabel + '</label>',
                '</div>',
                '<div style="margin-bottom: 12px;">',
                    '<div id="id-adv-separator-decimal" class=""></div><label class="input-row" style="margin-left: 10px; padding-top: 4px;">' + this.strDecimalSeparator + '</label>',
                '</div>',
                '<div style="margin-bottom: 10px;">',
                    '<div id="id-adv-separator-thousands" class=""></div><label class="input-row" style="margin-left: 10px; padding-top: 4px;">' + this.strThousandsSeparator + '</label>',
                '</div>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);
            this.props = options.props;

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            this.inputDecimalSeparator = new Common.UI.InputField({
                el: $('#id-adv-separator-decimal'),
                style: 'width: 35px;',
                maxLength: 1,
                validateOnBlur: false
            });

            this.inputThousandsSeparator = new Common.UI.InputField({
                el: $('#id-adv-separator-thousands'),
                style: 'width: 35px;',
                maxLength: 1,
                validateOnBlur: false
            });

            var $window = this.getChild();
            $window.find('.btn').on('click',     _.bind(this.onBtnClick, this));

            this.afterRender();
        },

        getFocusedComponents: function() {
            return [this.inputDecimalSeparator, this.inputThousandsSeparator];
        },

        getDefaultFocusableComponent: function () {
            return this.inputDecimalSeparator;
        },

        afterRender: function() {
            this._setDefaults(this.props);
        },

        _setDefaults: function (props) {
            if (props) {
                this.inputDecimalSeparator.setValue(props.decimal || '');
                this.inputThousandsSeparator.setValue(props.thousands || '');
            }
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
                this.options.handler.call(this, state, {decimal: this.inputDecimalSeparator.getValue(), thousands: this.inputThousandsSeparator.getValue()});
            }

            this.close();
        },

        textTitle: 'Advanced Settings',
        textLabel: 'Settings used to recognize numeric data',
        strDecimalSeparator: 'Decimal separator',
        strThousandsSeparator: 'Thousands separator'

    }, SSE.Views.AdvancedSeparatorDialog || {}));
});