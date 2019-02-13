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
 *  SignDialog.js
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
    'common/main/lib/component/Window',
    'common/main/lib/component/ComboBoxFonts'
], function () { 'use strict';

    Common.Views.SignDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 370,
            style: 'min-width: 350px;',
            cls: 'modal-dlg'
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.api = this.options.api;
            this.signType = this.options.signType || 'invisible';
            this.signSize = this.options.signSize || {width: 0, height: 0};
            this.certificateId = null;
            this.signObject = null;
            this.fontStore = this.options.fontStore;
            this.font = {
                size: 11,
                name: 'Arial',
                bold: false,
                italic: false
            };

            this.template = [
                '<div class="box" style="height: ' + ((this.signType == 'invisible') ? '132px;' : '300px;') + '">',
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
                        '<div id="id-dlg-sign-name" class="input-row" style="margin-bottom: 5px;"></div>',
                        '<div id="id-dlg-sign-fonts" class="input-row" style="display: inline-block;"></div>',
                        '<div id="id-dlg-sign-font-size" class="input-row" style="display: inline-block;margin-left: 3px;"></div>',
                        '<div id="id-dlg-sign-bold" style="display: inline-block;margin-left: 3px;"></div>','<div id="id-dlg-sign-italic" style="display: inline-block;margin-left: 3px;"></div>',
                        '<div style="margin: 10px 0 5px 0;">',
                            '<label>' + this.textUseImage + '</label>',
                        '</div>',
                        '<button id="id-dlg-sign-image" class="btn btn-text-default auto">' + this.textSelectImage + '</button>',
                        '<div class="input-row" style="margin-top: 10px;">',
                            '<label style="font-weight: bold;">' + this.textSignature + '</label>',
                        '</div>',
                        '<div style="border: 1px solid #cbcbcb;"><div id="signature-preview-img" style="width: 100%; height: 50px;position: relative;"></div></div>',
                    '</div>',
                    '<table style="margin-top: 30px;">',
                        '<tr>',
                            '<td><label style="font-weight: bold;margin-bottom: 3px;">' + this.textCertificate + '</label></td>' +
                            '<td rowspan="2" style="vertical-align: top; padding-left: 30px;"><button id="id-dlg-sign-change" class="btn btn-text-default" style="">' + this.textSelect + '</button></td>',
                        '</tr>',
                        '<tr><td><div id="id-dlg-sign-certificate" class="hidden" style="max-width: 212px;overflow: hidden;"></td></tr>',
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
                style       : 'width: 100%;',
                validateOnChange: true
            }).on ('changing', _.bind(me.onChangeName, me));

            me.cmbFonts = new Common.UI.ComboBoxFonts({
                el          : $('#id-dlg-sign-fonts'),
                cls         : 'input-group-nr',
                style       : 'width: 234px;',
                menuCls     : 'scrollable-menu',
                menuStyle   : 'min-width: 234px;max-height: 270px;',
                store       : new Common.Collections.Fonts(),
                recent      : 0,
                hint        : me.tipFontName
            }).on('selected', function(combo, record) {
                if (me.signObject) {
                    me.signObject.setText(me.inputName.getValue(), record.name, me.font.size, me.font.italic, me.font.bold);
                }
                me.font.name = record.name;
            });

            this.cmbFontSize = new Common.UI.ComboBox({
                el: $('#id-dlg-sign-font-size'),
                cls: 'input-group-nr',
                style: 'width: 55px;',
                menuCls     : 'scrollable-menu',
                menuStyle: 'min-width: 55px;max-height: 270px;',
                hint: this.tipFontSize,
                data: [
                    { value: 8, displayValue: "8" },
                    { value: 9, displayValue: "9" },
                    { value: 10, displayValue: "10" },
                    { value: 11, displayValue: "11" },
                    { value: 12, displayValue: "12" },
                    { value: 14, displayValue: "14" },
                    { value: 16, displayValue: "16" },
                    { value: 18, displayValue: "18" },
                    { value: 20, displayValue: "20" },
                    { value: 22, displayValue: "22" },
                    { value: 24, displayValue: "24" },
                    { value: 26, displayValue: "26" },
                    { value: 28, displayValue: "28" },
                    { value: 36, displayValue: "36" },
                    { value: 48, displayValue: "48" },
                    { value: 72, displayValue: "72" },
                    { value: 96, displayValue: "96" }
                ]
            }).on('selected', function(combo, record) {
                if (me.signObject) {
                    me.signObject.setText(me.inputName.getValue(), me.font.name, record.value, me.font.italic, me.font.bold);
                }
                me.font.size = record.value;
            });
            this.cmbFontSize.setValue(this.font.size);

            me.btnBold = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'btn-bold',
                enableToggle: true,
                hint: me.textBold
            });
            me.btnBold.render($('#id-dlg-sign-bold')) ;
            me.btnBold.on('click', function(btn, e) {
                if (me.signObject) {
                    me.signObject.setText(me.inputName.getValue(), me.font.name, me.font.size, me.font.italic, btn.pressed);
                }
                me.font.bold = btn.pressed;
            });

            me.btnItalic = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'btn-italic',
                enableToggle: true,
                hint: me.textItalic
            });
            me.btnItalic.render($('#id-dlg-sign-italic')) ;
            me.btnItalic.on('click', function(btn, e) {
                if (me.signObject) {
                    me.signObject.setText(me.inputName.getValue(), me.font.name, me.font.size, btn.pressed, me.font.bold);
                }
                me.font.italic = btn.pressed;
            });

            me.btnSelectImage = new Common.UI.Button({
                el: '#id-dlg-sign-image'
            });
            me.btnSelectImage.on('click', _.bind(me.onSelectImage, me));

            me.btnChangeCertificate = new Common.UI.Button({
                el: '#id-dlg-sign-change'
            });
            me.btnChangeCertificate.on('click', _.bind(me.onChangeCertificate, me));

            me.btnOk = new Common.UI.Button({
                el: $window.find('.primary'),
                disabled: true
            });

            me.cntCertificate = $('#id-dlg-sign-certificate');
            me.cntVisibleSign = $('#id-dlg-sign-visible');
            me.cntInvisibleSign = $('#id-dlg-sign-invisible');

            (me.signType == 'visible') ? me.cntInvisibleSign.addClass('hidden') : me.cntVisibleSign.addClass('hidden');

            $window.find('.dlg-btn').on('click', _.bind(me.onBtnClick, me));

            me.afterRender();
        },

        show: function() {
            Common.UI.Window.prototype.show.apply(this, arguments);

            var me = this;
            _.delay(function(){
                ((me.signType == 'visible') ? me.inputName : me.inputPurpose).cmpEl.find('input').focus();
            },500);
        },

        close: function() {
            this.api.asc_unregisterCallback('on_signature_defaultcertificate_ret', this.binding.certificateChanged);
            this.api.asc_unregisterCallback('on_signature_selectsertificate_ret', this.binding.certificateChanged);

            Common.UI.Window.prototype.close.apply(this, arguments);

            if (this.signObject)
                this.signObject.destroy();
        },

        afterRender: function () {
            if (this.api) {
                if (!this.binding)
                    this.binding = {};
                this.binding.certificateChanged = _.bind(this.onCertificateChanged, this);
                this.api.asc_registerCallback('on_signature_defaultcertificate_ret', this.binding.certificateChanged);
                this.api.asc_registerCallback('on_signature_selectsertificate_ret', this.binding.certificateChanged);
                this.api.asc_GetDefaultCertificate();
            }

            if (this.signType == 'visible') {
                this.cmbFonts.fillFonts(this.fontStore);
                this.cmbFonts.selectRecord(this.fontStore.findWhere({name: this.font.name}) || this.fontStore.at(0));

                this.signObject = new AscCommon.CSignatureDrawer('signature-preview-img', this.api, this.signSize.width, this.signSize.height);
            }
        },

        getSettings: function () {
            var props = {};
            props.certificateId = this.certificateId;
            if (this.signType == 'invisible') {
                props.purpose = this.inputPurpose.getValue();
            } else {
                props.images = this.signObject ? this.signObject.getImages() : [null, null];
            }

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
            if (this.options.handler) {
                if (state == 'ok' && (this.btnOk.isDisabled() || this.signObject && !this.signObject.isValid()))
                        return;

                this.options.handler.call(this, this, state);
            }
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
            this.cntCertificate.toggleClass('hidden', _.isEmpty(this.certificateId) || this.certificateId<0);
            this.btnChangeCertificate.setCaption((_.isEmpty(this.certificateId) || this.certificateId<0) ? this.textSelect : this.textChange);
            this.btnOk.setDisabled(_.isEmpty(this.certificateId) || this.certificateId<0);
        },

        onSelectImage: function() {
            if (!this.signObject) return;
            this.signObject.selectImage();
            this.inputName.setValue('');
        },

        onChangeName: function (input, value) {
            if (!this.signObject) return;
            this.signObject.setText(value, this.font.name, this.font.size, this.font.italic, this.font.bold);
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
        textSignature:      'Signature looks as',
        tipFontName: 'Font Name',
        tipFontSize: 'Font Size',
        textBold:           'Bold',
        textItalic:         'Italic',
        textSelect: 'Select'

    }, Common.Views.SignDialog || {}))
});