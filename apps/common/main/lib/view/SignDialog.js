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
 *  SignDialog.js
 *
 *  Created on 5/19/17
 *
 */


if (Common === undefined)
    var Common = {};

define([], function () { 'use strict';

    Common.Views.SignDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 370,
            style: 'min-width: 350px;',
            cls: 'modal-dlg',
            buttons: ['ok', 'cancel']
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
            var filter = Common.localStorage.getKeysFilter();
            this.appPrefix = (filter && filter.length) ? filter.split(',')[0] : '';

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
                        '<div id="id-dlg-sign-font-size" class="input-row margin-left-3" style="display: inline-block;"></div>',
                        '<div id="id-dlg-sign-bold" class="margin-left-3" style="display: inline-block;"></div>','<div id="id-dlg-sign-italic" class="margin-left-3" style="display: inline-block;"></div>',
                        '<div style="margin: 10px 0 5px 0;">',
                            '<label>' + this.textUseImage + '</label>',
                        '</div>',
                        '<button id="id-dlg-sign-image" class="btn btn-text-default auto">' + this.textSelectImage + '</button>',
                        '<div class="input-row" style="margin-top: 10px;">',
                            '<label class="font-weight-bold">' + this.textSignature + '</label>',
                        '</div>',
                        '<div style="border: 1px solid #cbcbcb;"><div id="signature-preview-img" style="width: 100%; height: 50px;position: relative;"></div></div>',
                    '</div>',
                    '<table style="margin-top: 30px;">',
                        '<tr>',
                            '<td><label class="font-weight-bold" style="margin-bottom: 3px;">' + this.textCertificate + '</label></td>' +
                            '<td rowspan="2" class="padding-left-20" style="vertical-align: top;"><button id="id-dlg-sign-change" class="btn btn-text-default float-right">' + this.textSelect + '</button></td>',
                        '</tr>',
                        '<tr><td><div id="id-dlg-sign-certificate" class="hidden" style="max-width: 240px;overflow: hidden;white-space: nowrap;"></td></tr>',
                    '</table>',
                '</div>'
            ].join('');

            this.templateCertificate = _.template([
                '<label style="display: block;margin-bottom: 3px;overflow: hidden;text-overflow: ellipsis;"><%= Common.Utils.String.htmlEncode(name) %></label>',
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
                takeFocusOnClose: true,
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
                takeFocusOnClose: true,
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
            this.cmbFontSize.on('changed:before', _.bind(this.onFontSizeChanged, this, true));
            this.cmbFontSize.on('changed:after',  _.bind(this.onFontSizeChanged, this, false));

            me.btnBold = new Common.UI.Button({
                parentEl: $('#id-dlg-sign-bold'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-bold',
                enableToggle: true,
                hint: me.textBold
            });
            me.btnBold.on('click', function(btn, e) {
                if (me.signObject) {
                    me.signObject.setText(me.inputName.getValue(), me.font.name, me.font.size, me.font.italic, btn.pressed);
                }
                me.font.bold = btn.pressed;
            });

            me.btnItalic = new Common.UI.Button({
                parentEl: $('#id-dlg-sign-italic'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-italic',
                enableToggle: true,
                hint: me.textItalic
            });
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

            me.btnOk = _.find(this.getFooterButtons(), function (item) {
                return (item.$el && item.$el.find('.primary').addBack().filter('.primary').length>0);
            }) || new Common.UI.Button({ el: $window.find('.primary') });
            me.btnOk.setDisabled(true);

            me.cntCertificate = $('#id-dlg-sign-certificate');
            me.cntVisibleSign = $('#id-dlg-sign-visible');
            me.cntInvisibleSign = $('#id-dlg-sign-invisible');

            (me.signType == 'visible') ? me.cntInvisibleSign.addClass('hidden') : me.cntVisibleSign.addClass('hidden');

            $window.find('.dlg-btn').on('click', _.bind(me.onBtnClick, me));

            me.afterRender();
        },

        getFocusedComponents: function() {
            return [this.inputPurpose, this.inputName, this.cmbFonts, this.cmbFontSize, this.btnBold, this.btnItalic, this.btnSelectImage, this.btnChangeCertificate].concat(this.getFooterButtons());
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
                if (state == 'ok' && (this.btnOk.isDisabled() || this.signObject && !this.signObject.isValid())) {
                    if (!this.btnOk.isDisabled()) {
                        this.inputName.showError([this.textNameError]);
                        this.inputName.focus();
                    }
                    return;
                }


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

        onFontSizeChanged: function(before, combo, record, e) {
            var value,
                me = this;

            if (before) {
                var item = combo.store.findWhere({
                    displayValue: record.value
                });

                if (!item) {
                    value = /^\+?(\d*(\.|,)?\d+)$|^\+?(\d+(\.|,)?\d*)$/.exec(record.value);

                    if (!value) {
                        value = combo.getValue();
                        combo.setRawValue(value);
                        e.preventDefault();
                        return false;
                    }
                }
            } else {
                var maxvalue = (this.appPrefix=='sse-') ? 409 : 300;
                value = Common.Utils.String.parseFloat(record.value);
                value = value > maxvalue ? maxvalue :
                    value < 1 ? 1 : Math.floor((value+0.4)*2)/2;

                combo.setRawValue(value);
                if (this.signObject) {
                    this.signObject.setText(this.inputName.getValue(), this.font.name, value, this.font.italic, this.font.bold);
                }
                this.font.size = value;
            }
        },

        textTitle:          'Sign Document',
        textPurpose:        'Purpose for signing this document',
        textCertificate:    'Certificate',
        textValid:          'Valid from %1 to %2',
        textChange:         'Change',
        textInputName:      'Input signer name',
        textUseImage:       'or click \'Select Image\' to use a picture as signature',
        textSelectImage:    'Select Image',
        textSignature:      'Signature looks as',
        tipFontName: 'Font Name',
        tipFontSize: 'Font Size',
        textBold:           'Bold',
        textItalic:         'Italic',
        textSelect: 'Select',
        textNameError: 'Signer name must not be empty.'

    }, Common.Views.SignDialog || {}))
});