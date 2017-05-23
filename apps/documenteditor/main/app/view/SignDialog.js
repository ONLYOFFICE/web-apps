/*
 *
 * (c) Copyright Ascensio System Limited 2010-2017
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
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia,
 * EU, LV-1021.
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
 *  SignDialog.js
 *
 *  Created by Julia Radzhabova on 5/19/17
 *  Copyright (c) 2017 Ascensio System SIA. All rights reserved.
 *
 */


if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/InputField',
    'common/main/lib/component/Window'
], function () { 'use strict';

    DE.Views.SignDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 350,
            style: 'min-width: 350px;',
            cls: 'modal-dlg'
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.api = this.options.api;
            this.signType = this.options.signType || 'invisible';
            this.certificateId = null;

            this.template = [
                '<div class="box" style="height: ' + ((this.signType == 'invisible') ? '132px;' : '260px;') + '">',
                    '<div id="id-dlg-sign-invisible">',
                        '<div class="input-row">',
                            '<label>' + this.textPurpose + '</label>',
                        '</div>',
                        '<div id="id-dlg-sign-purpose" class="input-row"></div>',
                    '</div>',
                    '<div id="id-dlg-sign-visible">',
                        '<div class="input-row">',
                            '<label>' + this.textInputName + '</label>',
                        '</div>',
                        '<div id="id-dlg-sign-name" class="input-row"></div>',
                        '<div class="input-row">',
                            '<label>' + this.textUseImage + '</label>',
                        '</div>',
                        '<button id="id-dlg-sign-image" class="btn btn-text-default" style="">' + this.textSelectImage + '</button>',
                        '<div class="input-row" style="margin-top: 10px;">',
                            '<label style="font-weight: bold;">' + this.textSignature + '</label>',
                        '</div>',
                        '<div style="border: 1px solid #cbcbcb;"><div id="signature-preview-img" style="width: 100%; height: 50px;position: relative;"></div></div>',
                    '</div>',
                    '<table style="margin-top: 30px;">',
                        '<tr>',
                            '<td><label style="font-weight: bold;margin-bottom: 3px;">' + this.textCertificate + '</label></td>' +
                            '<td rowspan="2" style="vertical-align: top; padding-left: 30px;"><button id="id-dlg-sign-change" class="btn btn-text-default" style="">' + this.textChange + '</button></td>',
                        '</tr>',
                        '<tr><td><div id="id-dlg-sign-certificate" style="max-width: 212px;overflow: hidden;"></td></tr>',
                    '</table>',
                '</div>',
                '<div class="footer center">',
                    '<button class="btn normal dlg-btn primary" result="ok" style="margin-right: 10px;">' + this.okButtonText + '</button>',
                    '<button class="btn normal dlg-btn" result="cancel">' + this.cancelButtonText + '</button>',
                '</div>'
            ].join('');

            this.templateCertificate = _.template([
                '<label style="display: block;margin-bottom: 3px;"><%= Common.Utils.String.htmlEncode(name) %></label>',
                '<label style="display: block;"><%= Common.Utils.String.htmlEncode(valid) %></label>'
            ].join(''));

            this.options.tpl = _.template(this.template)(this.options);

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var me = this,
                $window = this.getChild();

            me.inputPurpose = new Common.UI.InputField({
                el          : $('#id-dlg-sign-purpose'),
                style       : 'width: 100%;'
            });

            me.inputName = new Common.UI.InputField({
                el          : $('#id-dlg-sign-name'),
                style       : 'width: 100%;'
            });

            me.btnChangeCertificate = new Common.UI.Button({
                el: '#id-dlg-sign-change'
            });
            me.btnChangeCertificate.on('click', _.bind(me.onChangeCertificate, me));

            me.cntCertificate = $('#id-dlg-sign-certificate');
            me.cntVisibleSign = $('#id-dlg-sign-visible');
            me.cntInvisibleSign = $('#id-dlg-sign-invisible');

            (me.signType == 'visible') ? me.cntInvisibleSign.addClass('hidden') : me.cntVisibleSign.addClass('hidden');

            $window.find('.dlg-btn').on('click', _.bind(me.onBtnClick, me));
            $window.find('input').on('keypress', _.bind(me.onKeyPress, me));
        },

        show: function() {
            Common.UI.Window.prototype.show.apply(this, arguments);

            var me = this;
            _.delay(function(){
                me.inputPurpose.cmpEl.find('input').focus();
            },500);
        },

        setSettings: function (props) {
            if (props) {
                var me = this,
                    name = (props.name) ? props.name : '',
                    date = props.date,
                    arr_date = (typeof date == 'string') ? date.split(' - ') : ['', ''];
                this.cntCertificate.html(this.templateCertificate({name: name, valid: this.textValid.replace('%1', arr_date[0]).replace('%2', arr_date[1])}));
                this.certificateId = props.id;
            }
            if (this.api) {
                this.api.asc_unregisterCallback('on_signature_selectsertificate_ret', _.bind(this.onCertificateChanged, this));
                this.api.asc_registerCallback('on_signature_selectsertificate_ret', _.bind(this.onCertificateChanged, this));
            }
        },

        getSettings: function () {
            var props = {};
            props.certificateId = this.certificateId;
            if (this.signType == 'invisible') {
                props.purpose(this.inputPurpose.getValue());
            } else {
                // props.asc_putName(me.inputName.getValue());
            }

            return props;
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        onKeyPress: function(event) {
            if (event.keyCode == Common.UI.Keys.RETURN) {
                this._handleInput('ok');
                return false;
            }
        },

        _handleInput: function(state) {
            if (this.options.handler)
                this.options.handler.call(this, this, state);
            this.close();
        },

        onChangeCertificate: function() {
            this.api.asc_SelectCertificate();
        },

        onCertificateChanged: function(certificate) {
            this.certificateId = certificate.id;
            var date = certificate.date,
                arr_date = (typeof date == 'string') ? date.split(' - ') : ['', ''];
            this.cntCertificate.html(this.templateCertificate({name: certificate.name, valid: this.textValid.replace('%1', arr_date[0]).replace('%2', arr_date[1])}));
        },

        textTitle:          'Sign Document',
        textPurpose:        'Purpose for signing this document',
        textCertificate:    'Certificate',
        textValid:          'Valid from %1 to %2',
        textChange:         'Change',
        cancelButtonText:   'Cancel',
        okButtonText:       'Ok',
        textInputName:      'Input signer name',
        textUseImage:       'or click \'Select Image\' to use a picture as signature',
        textSelectImage:    'Select Image',
        textSignature:      'Signature looks as'

    }, DE.Views.SignDialog || {}))
});