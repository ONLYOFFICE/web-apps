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
 *  RenameDialog.js
 *
 *  Created on 9/23/16
 *
 */

define([], function () { 'use strict';

    Common.Views.RenameDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 330,
            header: false,
            cls: 'modal-dlg',
            filename: '',
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            _.extend(this.options, options || {});

            this.template = [
                '<div class="box">',
                    '<div class="input-row">',
                        '<label>' + this.textName + '</label>',
                    '</div>',
                    '<div id="id-dlg-newname" class="input-row"></div>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var me = this;
            me.inputName = new Common.UI.InputField({
                el          : $('#id-dlg-newname'),
                style       : 'width: 100%;',
                validateOnBlur: false,
                maxLength: me.options.maxLength,
                validation  : function(value) {
                    return (/[\t*\+:\"<>?|\\\\/]/gim.test(value)) ? me.txtInvalidName + "*+:\"<>?|\/" : true;
                }
            });

            var $window = this.getChild();
            $window.find('.btn').on('click',     _.bind(this.onBtnClick, this));

            me.inputNameEl = $window.find('input');
        },

        getFocusedComponents: function() {
            return [this.inputName].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.inputName;
        },

        show: function() {
            Common.UI.Window.prototype.show.apply(this, arguments);

            var me = this;
            var idx = me.options.filename.lastIndexOf('.');
            if (idx>0)
                me.options.filename = me.options.filename.substring(0, idx);
            _.delay(function(){
                me.inputName.setValue(me.options.filename);
                me.inputNameEl.focus().select();
            },100);
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
                        this.inputNameEl.focus();
                        return;
                    }
                }

                this.options.handler.call(this, state, this.inputName.getValue());
            }

            this.close();
        },

        textName        : 'File name',
        txtInvalidName  : 'The file name cannot contain any of the following characters: '
    }, Common.Views.RenameDialog || {}));
});