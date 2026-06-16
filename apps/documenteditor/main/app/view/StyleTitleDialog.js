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
 * Created on 26.05.15.
 */
if (Common === undefined)
    var Common = {};

define([
], function () { 'use strict';

    DE.Views.StyleTitleDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 350,
            style: 'min-width: 230px;',
            cls: 'modal-dlg',
            buttons: ['ok', 'cancel']
        },

            initialize : function(options) {
                _.extend(this.options, {
                    title: this.textHeader
                }, options || {});

                this.template = [
                    '<div class="box">',
                        '<label class="input-row" style="margin-bottom: -5px;">' + this.textTitle + ' </label>',
                        '<div id="id-dlg-style-title" class="input-row" style="margin-bottom: 5px;"></div>',

                        '<label class="input-row" style="margin-bottom: -5px; margin-top: 5px;">' + this.textNextStyle + '</label>',
                        '<div id="id-dlg-style-next-par" class="input-group-nr" style="margin-bottom: 5px;" ></div>',
                    '</div>'
                ].join('');

                this.options.tpl = _.template(this.template)(this.options);
                this.options.formats = this.options.formats || [];

                Common.UI.Window.prototype.initialize.call(this, this.options);
            },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var me = this,
                $window = this.getChild();

            me.inputTitle = new Common.UI.InputField({
                el          : $('#id-dlg-style-title'),
                allowBlank  : false,
                blankError  : me.txtEmpty,
                style       : 'width: 100%;',
                validateOnBlur: false,
                validation  : function(value) {
                    value = value.trim();
                    var isvalid = value != '';

                    if (isvalid) {
                        return true;
                    } else {
                        return me.txtNotEmpty;
                    }
                }
            });

            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

            this.options.formats.unshift({value: -1, displayValue: this.txtSameAs});
            this.cmbNextStyle = new Common.UI.ComboBox({
                el          : $('#id-dlg-style-next-par'),
                style       : 'width: 100%;',
                menuStyle   : 'width: 100%; max-height: 210px;',
                editable    : false,
                takeFocusOnClose: true,
                cls         : 'input-group-nr',
                data        : this.options.formats,
                disabled    : (this.options.formats.length==0)
            });
            this.cmbNextStyle.setValue(-1);
        },

        getFocusedComponents: function() {
            return [this.inputTitle, this.cmbNextStyle].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.inputTitle;
        },

        getTitle: function () {
            var me = this;
            return me.inputTitle.getValue().trim();
        },

        getNextStyle: function () {
            var val = this.cmbNextStyle.getValue();
            return (val!=-1) ? val : null;
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        onPrimary: function(event) {
            this._handleInput('ok');
            return false;
        },

        _handleInput: function(state) {
            if (this.options.handler) {
                if (state == 'ok') {
                    var checkurl = this.inputTitle.checkValidate();
                    if (checkurl !== true)  {
                        this.inputTitle.focus();
                        return;
                    }
                }

                this.options.handler.call(this, this, state);
            }

            this.close();
        },

        textTitle:            'Title',
        textHeader:           'Create New Style',
        txtEmpty:             'This field is required',
        txtNotEmpty:          'Field must not be empty',
        textNextStyle:        'Next paragraph style',
        txtSameAs:            'Same as created new style'

    }, DE.Views.StyleTitleDialog || {}))

});