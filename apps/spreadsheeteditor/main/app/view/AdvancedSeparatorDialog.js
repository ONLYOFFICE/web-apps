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
 *  AdvancedSeparatorDialog.js
 *
 *  Created on 26/06/20
 *
 */

define([], function () { 'use strict';

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
                '<div style="margin-bottom: 8px;">' + this.textLabel + '</div>',
                '<div style="margin-bottom: 12px;">',
                    '<div id="id-adv-separator-decimal" class=""></div><label class="input-row margin-left-10" style="padding-top: 4px;">' + this.strDecimalSeparator + '</label>',
                '</div>',
                '<div style="margin-bottom: 10px;">',
                    '<div id="id-adv-separator-thousands" class=""></div><label class="input-row margin-left-10" style="padding-top: 4px;">' + this.strThousandsSeparator + '</label>',
                '</div>',
                '<div class="input-row">',
                '<label>' + this.textQualifier + '</label>',
                '</div>',
                '<div style="margin-bottom: 10px;">',
                '<div id="id-adv-separator-qualifier" class="input-group-nr"></div>',
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

            this.cmbQualifier = new Common.UI.ComboBox({
                el: $('#id-adv-separator-qualifier'),
                style: 'width: 100px;',
                menuStyle: 'min-width: 100px;',
                cls: 'input-group-nr',
                data: [
                    {value: '"', displayValue: '"'},
                    {value: '\'', displayValue: '\''},
                    {value: null, displayValue: this.txtNone}],
                editable: false,
                takeFocusOnClose: true
            });

            var $window = this.getChild();
            $window.find('.dlg-btn').on('click',     _.bind(this.onBtnClick, this));

            this.afterRender();
        },

        getFocusedComponents: function() {
            return [this.inputDecimalSeparator, this.inputThousandsSeparator, this.cmbQualifier].concat(this.getFooterButtons());
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
                this.cmbQualifier.setValue(props.qualifier || null);
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
                this.options.handler.call(this, state, {decimal: this.inputDecimalSeparator.getValue(), thousands: this.inputThousandsSeparator.getValue(),
                                                        qualifier: this.cmbQualifier.getValue()});
            }

            this.close();
        },

        textTitle: 'Advanced Settings',
        textLabel: 'Settings used to recognize numeric data',
        strDecimalSeparator: 'Decimal separator',
        strThousandsSeparator: 'Thousands separator',
        txtNone: '(none)',
        textQualifier: 'Text qualifier'

    }, SSE.Views.AdvancedSeparatorDialog || {}));
});