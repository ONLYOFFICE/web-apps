/*
 *
 * (c) Copyright Ascensio System SIA 2010-2019
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
 *  SignSettingsDialog.js
 *
 *  Created by Julia Radzhabova on 5/19/17
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */


if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/InputField',
    'common/main/lib/component/CheckBox',
    'common/main/lib/component/Window'
], function () { 'use strict';

    Common.Views.SignSettingsDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 350,
            style: 'min-width: 350px;',
            cls: 'modal-dlg',
            type: 'edit'
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.template = [
                '<div class="box" style="height: 260px;">',
                    '<div class="input-row">',
                        '<label>' + this.textInfo + '</label>',
                    '</div>',
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
                    '<textarea id="id-dlg-sign-settings-instructions" class="form-control" style="width: 100%;height: 35px;margin-bottom: 10px;resize: none;"></textarea>',
                    '<div id="id-dlg-sign-settings-date"></div>',
                '</div>',
                '<div class="footer center">',
                    '<button class="btn normal dlg-btn primary" result="ok" style="margin-right: 10px;">' + this.okButtonText + '</button>',
                    '<% if (type == "edit") { %>',
                    '<button class="btn normal dlg-btn" result="cancel">' + this.cancelButtonText + '</button>',
                    '<% } %>',
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

            me.textareaInstructions = this.$window.find('textarea');
            me.textareaInstructions.keydown(function (event) {
                if (event.keyCode == Common.UI.Keys.RETURN) {
                    event.stopPropagation();
                }
            });
            (this.type=='view') ? this.textareaInstructions.attr('disabled', 'disabled') : this.textareaInstructions.removeAttr('disabled');
            this.textareaInstructions.toggleClass('disabled', this.type=='view');

            this.chDate = new Common.UI.CheckBox({
                el: $('#id-dlg-sign-settings-date'),
                labelText: this.textShowDate,
                disabled: this.type=='view'
            });

            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
        },

        show: function() {
            Common.UI.Window.prototype.show.apply(this, arguments);

            var me = this;
            _.delay(function(){
                me.inputName.cmpEl.find('input').focus();
            },500);
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
                me.textareaInstructions.val(value ? value : '');
                me.chDate.setValue(props.asc_getShowDate());
            }
        },

        getSettings: function () {
            var me = this,
                props = new AscCommon.asc_CSignatureLine();

            props.asc_setSigner1(me.inputName.getValue());
            props.asc_setSigner2(me.inputTitle.getValue());
            props.asc_setEmail(me.inputEmail.getValue());
            props.asc_setInstructions(me.textareaInstructions.val());
            props.asc_setShowDate(me.chDate.getValue()=='checked');

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
        textInfoName:       'Name',
        textInfoTitle:      'Signer Title',
        textInfoEmail:      'E-mail',
        textInstructions:   'Instructions for Signer',
        cancelButtonText:   'Cancel',
        okButtonText:       'Ok',
        txtEmpty:           'This field is required',
        textAllowComment:   'Allow signer to add comment in the signature dialog',
        textShowDate:       'Show sign date in signature line',
        textTitle:          'Signature Setup'
    }, Common.Views.SignSettingsDialog || {}))
});