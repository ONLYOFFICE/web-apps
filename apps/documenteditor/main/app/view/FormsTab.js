/*
 * (c) Copyright Ascensio System SIA 2010-2023
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
 *  FormsTab.js
 *
 *  Created by Julia Radzhabova on 06.10.2020
 *  Copyright (c) 2020 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Layout'
], function () {
    'use strict';

    DE.Views.FormsTab = Common.UI.BaseView.extend(_.extend((function(){
        var template =
        '<section class="panel" data-tab="forms">' +
            '<div class="group forms-buttons" style="display: none;">' +
                '<span class="btn-slot text x-huge" id="slot-btn-form-field"></span>' +
                '<span class="btn-slot text x-huge" id="slot-btn-form-combobox"></span>' +
                '<span class="btn-slot text x-huge" id="slot-btn-form-dropdown"></span>' +
                '<span class="btn-slot text x-huge" id="slot-btn-form-checkbox"></span>' +
                '<span class="btn-slot text x-huge" id="slot-btn-form-radiobox"></span>' +
                '<span class="btn-slot text x-huge" id="slot-btn-form-image"></span>' +
            '</div>' +
            '<div class="separator long forms-buttons" style="display: none;"></div>' +
            '<div class="group forms-buttons" style="display: none;">' +
                '<span class="btn-slot text x-huge" id="slot-btn-form-email"></span>' +
                '<span class="btn-slot text x-huge" id="slot-btn-form-phone"></span>' +
                '<span class="btn-slot text x-huge" id="slot-btn-form-datetime"></span>' +
                '<span class="btn-slot text x-huge" id="slot-btn-form-zipcode"></span>' +
                '<span class="btn-slot text x-huge" id="slot-btn-form-credit"></span>' +
                '<span class="btn-slot text x-huge" id="slot-btn-form-complex"></span>' +
            '</div>' +
            '<div class="separator long forms-buttons" style="display: none;"></div>' +
            '<div class="group forms-buttons" style="display: none;">' +
                '<span class="btn-slot text x-huge" id="slot-btn-manager"></span>' +
            '</div>' +
            '<div class="separator long forms-buttons" style="display: none;"></div>' +
            '<div class="group no-group-mask" style="">' +
                '<span class="btn-slot text x-huge" id="slot-btn-form-view-roles"></span>' +
                '<span class="btn-slot text x-huge" id="slot-btn-form-prev"></span>' +
                '<span class="btn-slot text x-huge" id="slot-btn-form-next"></span>' +
                '<span class="btn-slot text x-huge" id="slot-btn-form-clear"></span>' +
                '<span class="btn-slot text x-huge" id="slot-btn-form-submit"></span>' +
                '<span class="btn-slot text x-huge" id="slot-btn-form-save"></span>' +
            '</div>' +
        '</section>';

        function setEvents() {
            var me = this;
            this.btnTextField && this.btnTextField.on('click', function (b, e) {
                me.fireEvent('forms:insert', ['text', {fixed: b.options.fieldType==='fixed'}]);
            });
            this.btnTextField && this.btnTextField.menu.on('item:click', function (menu, item) {
                var oldType = me.btnTextField.options.fieldType;
                var newType = item.value;

                if(newType !== oldType){
                    me.btnTextField.changeIcon({
                        next: item.options.iconClsForMainBtn,
                        curr: me.btnTextField.menu.items.filter(function(mnu){return mnu.value === oldType})[0].options.iconClsForMainBtn
                    });
                    me.btnTextField.updateHint(item.options.hintForMainBtn);
                    me.btnTextField.options.fieldType = newType;
                    Common.localStorage.setBool("de-text-form-fixed", newType==='fixed')
                }
                me.fireEvent('forms:insert', ['text', {fixed: newType==='fixed'}]);
            });
            this.btnComboBox && this.btnComboBox.on('click', function (b, e) {
                me.fireEvent('forms:insert', ['combobox']);
            });
            this.btnDropDown && this.btnDropDown.on('click', function (b, e) {
                me.fireEvent('forms:insert', ['dropdown']);
            });
            this.btnCheckBox && this.btnCheckBox.on('click', function (b, e) {
                me.fireEvent('forms:insert', ['checkbox']);
            });
            this.btnRadioBox && this.btnRadioBox.on('click', function (b, e) {
                me.fireEvent('forms:insert', ['radiobox']);
            });
            this.btnImageField && this.btnImageField.on('click', function (b, e) {
                me.fireEvent('forms:insert', ['picture']);
            });
            this.btnComplexField && this.btnComplexField.on('click', function (b, e) {
                me.fireEvent('forms:insert', ['complex']);
            });
            this.btnEmailField && this.btnEmailField.on('click', function (b, e) {
                me.fireEvent('forms:insert', ['text', {reg: "\\S+@\\S+\\.\\S+", placeholder: 'user_name@email.com'}]);
            });
            this.btnPhoneField && this.btnPhoneField.on('click', function (b, e) {
                me.fireEvent('forms:insert', ['text', {mask: "(999)999-9999", placeholder: '(999)999-9999'}]);
            });
            this.btnCreditCard && this.btnCreditCard.on('click', function (b, e) {
                me.fireEvent('forms:insert', ['text', {mask: "9999-9999-9999-9999", placeholder: '9999-9999-9999-9999'}]);
            });
            this.btnZipCode && this.btnZipCode.on('click', function (b, e) {
                me.fireEvent('forms:insert', ['text', {mask: "99999-9999", placeholder: '99999-9999'}]);
            });
            this.btnDateTime && this.btnDateTime.on('click', function (b, e) {
                me.fireEvent('forms:insert', ['datetime']);
            });
            if (this.btnViewFormRoles) {
                this.btnViewFormRoles.on('click', function (b, e) {
                    var item = b.menu.getChecked();
                    if (item) {
                        item = item.caption;
                    } else if (me._state.roles && me._state.roles.length>0) {
                        item = me._state.roles[0].asc_getSettings().asc_getName();
                    }
                    me.fireEvent('forms:mode', [b.pressed, item]);
                });
                this.btnViewFormRoles.menu.on('item:click', _.bind(function (menu, item) {
                    if (!!item.checked) {
                        me.btnViewFormRoles.toggle(true, true);
                        me.fireEvent('forms:mode', [true, item.caption]);
                    }
                }, me));
                this.btnViewFormRoles.menu.on('show:after',  function (menu) {
                    me.fillRolesMenu();
                });
            }
            this.btnManager && this.btnManager.on('click', function (b, e) {
                me.fireEvent('forms:manager');
            });
            this.btnClear && this.btnClear.on('click', function (b, e) {
                me.fireEvent('forms:clear');
            });
            // if (this.mnuFormsColorPicker) {
            //     this.btnHighlight.on('color:select', function(btn, color) {
            //         me.fireEvent('forms:select-color', [color]);
            //     });
            //     this.mnuNoFormsColor.on('click', function (item) {
            //         me.fireEvent('forms:no-color', [item]);
            //     });
            // }
            this.btnPrevForm && this.btnPrevForm.on('click', function (b, e) {
                me.fireEvent('forms:goto', ['prev']);
            });
            this.btnNextForm && this.btnNextForm.on('click', function (b, e) {
                me.fireEvent('forms:goto', ['next']);
            });
            this.btnSubmit && this.btnSubmit.on('click', function (b, e) {
                me.fireEvent('forms:submit');
            });
            this.btnSaveForm && this.btnSaveForm.on('click', function (b, e) {
                me.fireEvent('forms:save');
            });
        }

        return {

            options: {},

            initialize: function (options) {
                Common.UI.BaseView.prototype.initialize.call(this);
                this.toolbar = options.toolbar;
                this.appConfig = options.config;

                this.paragraphControls = [];
                this._state = {};

                var me = this;
                var _set = Common.enumLock;

                if (this.appConfig.isRestrictedEdit && this.appConfig.canFillForms) {

                } else {
                    var isfixed = Common.localStorage.getBool("de-text-form-fixed", true);
                    this.btnTextField = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon ' + (isfixed ? 'btn-text-fixed-field' : 'btn-text-field'),
                        lock: [_set.paragraphLock, _set.headerLock, _set.controlPlain, _set.contentLock, _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.disableOnStart, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.inSmartart, _set.inSmartartInternal],
                        caption: this.capBtnText,
                        fieldType: isfixed ? 'fixed' : 'inline',
                        split: true,
                        menu: true,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.paragraphControls.push(this.btnTextField);

                    this.btnComboBox = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-combo-box',
                        lock: [_set.paragraphLock, _set.headerLock, _set.controlPlain, _set.contentLock, _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.disableOnStart, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.inSmartart, _set.inSmartartInternal],
                        caption: this.capBtnComboBox,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.paragraphControls.push(this.btnComboBox);

                    this.btnDropDown = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-dropdown',
                        lock: [_set.paragraphLock, _set.headerLock, _set.controlPlain, _set.contentLock, _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.disableOnStart, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.inSmartart, _set.inSmartartInternal],
                        caption: this.capBtnDropDown,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.paragraphControls.push(this.btnDropDown);

                    this.btnCheckBox = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-checkbox',
                        lock: [_set.paragraphLock, _set.headerLock, _set.controlPlain, _set.contentLock, _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.disableOnStart, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.inSmartart, _set.inSmartartInternal],
                        caption: this.capBtnCheckBox,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.paragraphControls.push(this.btnCheckBox);

                    this.btnRadioBox = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-radio-button',
                        lock: [_set.paragraphLock, _set.headerLock, _set.controlPlain, _set.contentLock, _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.disableOnStart, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.inSmartart, _set.inSmartartInternal],
                        caption: this.capBtnRadioBox,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.paragraphControls.push(this.btnRadioBox);

                    this.btnImageField = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-insertimage',
                        lock: [_set.paragraphLock, _set.headerLock, _set.controlPlain, _set.contentLock, _set.complexForm, _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.disableOnStart, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.inSmartart, _set.inSmartartInternal],
                        caption: this.capBtnImage,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.paragraphControls.push(this.btnImageField);

                    this.btnManager = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-ic-sharing',
                        lock: [ _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.disableOnStart, _set.docLockView, _set.docLockForms, _set.docLockComments],
                        caption: this.capBtnManager,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.paragraphControls.push(this.btnManager);

                    this.btnEmailField = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-email',
                        lock: [_set.paragraphLock, _set.headerLock, _set.controlPlain, _set.contentLock, _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.disableOnStart, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.inSmartart, _set.inSmartartInternal],
                        caption: this.capBtnEmail,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.paragraphControls.push(this.btnEmailField);

                    this.btnPhoneField = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-phone',
                        lock: [_set.paragraphLock, _set.headerLock, _set.controlPlain, _set.contentLock, _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.disableOnStart, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.inSmartart, _set.inSmartartInternal],
                        caption: this.capBtnPhone,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.paragraphControls.push(this.btnPhoneField);

                    this.btnZipCode = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-zip-code',
                        lock: [_set.paragraphLock, _set.headerLock, _set.controlPlain, _set.contentLock, _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.disableOnStart, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.inSmartart, _set.inSmartartInternal],
                        caption: this.capZipCode,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.paragraphControls.push(this.btnZipCode);

                    this.btnCreditCard = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-credit-card',
                        lock: [_set.paragraphLock, _set.headerLock, _set.controlPlain, _set.contentLock, _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.disableOnStart, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.inSmartart, _set.inSmartartInternal],
                        caption: this.capCreditCard,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.paragraphControls.push(this.btnCreditCard);

                    this.btnDateTime = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-datetime',
                        lock: [_set.paragraphLock, _set.headerLock, _set.controlPlain, _set.contentLock, _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.disableOnStart, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.inSmartart, _set.inSmartartInternal],
                        caption: this.capDateTime,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.paragraphControls.push(this.btnDateTime);

                    this.btnComplexField = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-complex-field',
                        lock: [_set.paragraphLock, _set.headerLock, _set.controlPlain, _set.contentLock, _set.complexForm, _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.disableOnStart, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.inSmartart, _set.inSmartartInternal],
                        caption: this.capBtnComplex,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.paragraphControls.push(this.btnComplexField);

                    this.btnViewFormRoles = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-sheet-view',
                        lock: [ _set.previewReviewMode, _set.formsNoRoles, _set.lostConnect, _set.disableOnStart, _set.docLockView, _set.docLockForms, _set.docLockComments],
                        caption: this.capBtnView,
                        split: true,
                        menu: new Common.UI.Menu({
                            cls: 'menu-roles',
                            maxHeight: 270,
                            style: 'max-width: 400px;',
                            items: []
                        }),
                        enableToggle: true,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.paragraphControls.push(this.btnViewFormRoles);

                    // this.btnHighlight = new Common.UI.ButtonColored({
                    //     cls         : 'btn-toolbar',
                    //     iconCls     : 'toolbar__icon btn-highlight',
                    //     lock: [ _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.disableOnStart],
                    //     caption     : this.textHighlight,
                    //     menu        : true,
                    //     additionalItems: [ this.mnuNoFormsColor = new Common.UI.MenuItem({
                    //                           id: 'id-toolbar-menu-no-highlight-form',
                    //                           caption: this.textNoHighlight,
                    //                           checkable: true,
                    //                           style: 'padding-left: 20px;'
                    //                       }),
                    //                       {caption: '--'}],
                    //     colors: ['000000', '993300', '333300', '003300', '003366', '000080', '333399', '333333', '800000', 'FF6600',
                    //                 '808000', '00FF00', '008080', '0000FF', '666699', '808080', 'FF0000', 'FF9900', '99CC00', '339966',
                    //                 '33CCCC', '3366FF', '800080', '999999', 'FF00FF', 'FFCC00', 'FFFF00', '00FF00', '00FFFF', '00CCFF',
                    //                 '993366', 'C0C0C0', 'FF99CC', 'FFCC99', 'FFFF99', 'CCFFCC', 'CCFFFF', 'C9C8FF', 'CC99FF', 'FFFFFF'
                    //             ],
                    //     dataHint: '1',
                    //     dataHintDirection: 'left',
                    //     dataHintOffset: 'small'
                    // });
                }

                this.btnClear = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-clear-style',
                    caption: this.textClear,
                    visible: false,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });

                this.btnPrevForm = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-previous-field',
                    lock: [ _set.previewReviewMode, _set.lostConnect, _set.disableOnStart, _set.docLockView, _set.docLockComments],
                    caption: this.capBtnPrev,
                    visible: false,
                    // disabled: this.appConfig.isEdit && this.appConfig.canFeatureContentControl && this.appConfig.canFeatureForms, // disable only for edit mode
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                !(this.appConfig.isRestrictedEdit && this.appConfig.canFillForms) && this.paragraphControls.push(this.btnPrevForm);

                this.btnNextForm = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-next-field',
                    lock: [ _set.previewReviewMode, _set.lostConnect, _set.disableOnStart, _set.docLockView, _set.docLockComments],
                    caption: this.capBtnNext,
                    visible: false,
                    // disabled: this.appConfig.isEdit && this.appConfig.canFeatureContentControl && this.appConfig.canFeatureForms, // disable only for edit mode,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                !(this.appConfig.isRestrictedEdit && this.appConfig.canFillForms) && this.paragraphControls.push(this.btnNextForm);

                if (this.appConfig.canSubmitForms) {
                    this.btnSubmit = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-submit-form',
                        lock: [_set.lostConnect, _set.disableOnStart],
                        caption: this.capBtnSubmit,
                        // disabled: this.appConfig.isEdit && this.appConfig.canFeatureContentControl && this.appConfig.canFeatureForms, // disable only for edit mode,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    !(this.appConfig.isRestrictedEdit && this.appConfig.canFillForms) && this.paragraphControls.push(this.btnSubmit);
                }
                if (this.appConfig.canDownloadForms) {
                    this.btnSaveForm = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        lock: [_set.lostConnect, _set.disableOnStart],
                        iconCls: 'toolbar__icon btn-save-form',
                        caption: this.appConfig.canRequestSaveAs || !!this.appConfig.saveAsUrl || this.appConfig.isOffline ? this.capBtnSaveForm : this.capBtnDownloadForm,
                        // disabled: this.appConfig.isEdit && this.appConfig.canFeatureContentControl && this.appConfig.canFeatureForms, // disable only for edit mode,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    !(this.appConfig.isRestrictedEdit && this.appConfig.canFillForms) && this.paragraphControls.push(this.btnSaveForm);
                }
                Common.Utils.lockControls(Common.enumLock.disableOnStart, true, {array: this.paragraphControls});
                this._state = {disabled: false};
                Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            },

            render: function (el) {
                if ( el ) el.html( this.getPanel() );

                return this;
            },
            
            onAppReady: function (config) {
                var me = this;
                (new Promise(function (accept, reject) {
                    accept();
                })).then(function(){
                    if (config.isEdit && config.canFeatureContentControl && config.canFeatureForms) {
                        // if (config.canEditContentControl) {
                        //     me.btnHighlight.setMenu();
                        //     me.mnuFormsColorPicker = me.btnHighlight.getPicker();
                        //     me.btnHighlight.currentColor && me.mnuFormsColorPicker.selectByRGB(me.btnHighlight.currentColor, true);
                        //     me.mnuNoFormsColor.setChecked(me.btnHighlight.currentColor === null);
                        //     me.btnHighlight.setColor(me.btnHighlight.currentColor || 'transparent');
                        // } else {
                        //     me.btnHighlight.cmpEl.parents('.group').hide().prev('.separator').hide();
                        // }
                        var menuTemplate = _.template('<a id="<%= id %>" tabindex="-1" type="menuitem" class="menu-item">'+
                            '<% if (!_.isEmpty(iconCls)) { %>'+
                            '<span class="menu-item-icon <%= iconCls %>"></span>'+
                            '<% } %>'+
                            '<div><%= caption %></div>' +
                            '<% if (options.description !== null) { %><label style="cursor: pointer;white-space: normal;"><%= options.description %></label>' +
                            '<% } %></a>');

                        me.btnTextField.setMenu(new Common.UI.Menu({
                            style: 'max-width: 300px;',
                            items: [
                            {
                                caption: me.txtInlineText,
                                template: menuTemplate,
                                description: me.txtInlineDesc,
                                iconCls     : 'menu__icon btn-field',
                                value: 'inline',
                                iconClsForMainBtn: 'btn-text-field',
                                hintForMainBtn: [me.tipInlineText, me.tipTextField]
                            },
                            {
                                caption: me.txtFixedText,
                                template: menuTemplate,
                                description: me.txtFixedDesc,
                                iconCls     : 'menu__icon btn-fixed-field',
                                value: 'fixed',
                                iconClsForMainBtn: 'btn-text-fixed-field',
                                hintForMainBtn: [me.tipFixedText, me.tipTextField]
                            }
                            ]
                        }));
                        me.btnTextField.updateHint([Common.localStorage.getBool("de-text-form-fixed", true) ? me.tipFixedText : me.tipInlineText, me.tipTextField]);

                        me.btnComboBox.updateHint(me.tipComboBox);
                        me.btnDropDown.updateHint(me.tipDropDown);
                        me.btnCheckBox.updateHint(me.tipCheckBox);
                        me.btnRadioBox.updateHint(me.tipRadioBox);
                        me.btnImageField.updateHint(me.tipImageField);
                        me.btnViewFormRoles.updateHint(me.tipViewForm);
                        me.btnManager.updateHint(me.tipManager);
                        me.btnEmailField.updateHint(me.tipEmailField);
                        me.btnPhoneField.updateHint(me.tipPhoneField);
                        me.btnComplexField.updateHint(me.tipComplexField);
                        me.btnZipCode.updateHint(me.tipZipCode);
                        me.btnCreditCard.updateHint(me.tipCreditCard);
                        me.btnDateTime.updateHint(me.tipDateTime);
                    }
                    me.btnClear.updateHint(me.textClearFields);
                    me.btnPrevForm.updateHint(me.tipPrevForm);
                    me.btnNextForm.updateHint(me.tipNextForm);
                    me.btnSubmit && me.btnSubmit.updateHint(me.tipSubmit);
                    me.btnSaveForm && me.btnSaveForm.updateHint(config.canRequestSaveAs || !!config.saveAsUrl ? me.tipSaveForm : me.tipDownloadForm);

                    setEvents.call(me);
                });
            },

            getPanel: function () {
                this.$el = $(_.template(template)( {} ));
                var $host = this.$el;

                this.appConfig.canSubmitForms && this.btnSubmit.render($host.find('#slot-btn-form-submit'));
                this.appConfig.canDownloadForms && this.btnSaveForm.render($host.find('#slot-btn-form-save'));

                if (this.appConfig.isRestrictedEdit && this.appConfig.canFillForms) {
                } else {
                    this.btnTextField.render($host.find('#slot-btn-form-field'));
                    this.btnComboBox.render($host.find('#slot-btn-form-combobox'));
                    this.btnDropDown.render($host.find('#slot-btn-form-dropdown'));
                    this.btnCheckBox.render($host.find('#slot-btn-form-checkbox'));
                    this.btnRadioBox.render($host.find('#slot-btn-form-radiobox'));
                    this.btnImageField.render($host.find('#slot-btn-form-image'));
                    this.btnViewFormRoles.render($host.find('#slot-btn-form-view-roles'));
                    this.btnManager.render($host.find('#slot-btn-manager'));
                    // this.btnHighlight.render($host.find('#slot-form-highlight'));
                    this.btnEmailField.render($host.find('#slot-btn-form-email'));
                    this.btnPhoneField.render($host.find('#slot-btn-form-phone'));
                    this.btnComplexField.render($host.find('#slot-btn-form-complex'));
                    this.btnZipCode.render($host.find('#slot-btn-form-zipcode'));
                    this.btnCreditCard.render($host.find('#slot-btn-form-credit'));
                    this.btnDateTime.render($host.find('#slot-btn-form-datetime'));

                    $host.find('.forms-buttons').show();
                }
                this.btnClear.render($host.find('#slot-btn-form-clear'));
                this.btnPrevForm.render($host.find('#slot-btn-form-prev'));
                this.btnNextForm.render($host.find('#slot-btn-form-next'));

                return this.$el;
            },

            fillRolesMenu: function(roles, lastViewRole) {
                if (!(this.btnViewFormRoles && this.btnViewFormRoles.menu && this.btnViewFormRoles.menu.isVisible())) {
                    this._state.roles = roles;
                    this._state.lastViewRole = lastViewRole;
                    return;
                }
                roles = roles || this._state.roles;
                lastViewRole = lastViewRole || this._state.lastViewRole;
                this._state.roles = this._state.lastViewRole = undefined;

                if (!roles) return;

                var checkedIndex = 0,
                    me = this;

                this.btnViewFormRoles.menu.removeAll();

                roles && roles.forEach(function(item, index) {
                    var role = item.asc_getSettings(),
                        color = role.asc_getColor();
                    if (role.asc_getName()===lastViewRole)
                        checkedIndex = index;
                    me.btnViewFormRoles.menu.addItem(new Common.UI.MenuItem({
                        caption: role.asc_getName() || me.textAnyone,
                        color: color ? '#' + Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()) : 'transparent',
                        checkable: true,
                        toggleGroup: 'formtab-view-role',
                        template: _.template([
                            '<a id="<%= id %>"  tabindex="-1" type="menuitem" class="<%= options.cls %>" style="overflow: hidden; text-overflow: ellipsis;">',
                            '<span class="color" style="background: <%= options.color %>;"></span>',
                            '<%= Common.Utils.String.htmlEncode(caption) %>',
                            '</a>'
                        ].join(''))
                    }));
                });

                var len = this.btnViewFormRoles.menu.items.length>0;
                len && this.btnViewFormRoles.menu.items[checkedIndex].setChecked(true, true);
                Common.Utils.lockControls(Common.enumLock.formsNoRoles, !len,{array: [this.btnViewFormRoles]});
            },

            show: function () {
                Common.UI.BaseView.prototype.show.call(this);
                this.fireEvent('show', this);
            },

            getButtons: function() {
                return this.paragraphControls;
            },

            setPreviewMode: function(state) {
                this.btnClear.setVisible(state);
                this.btnPrevForm.setVisible(state);
                this.btnNextForm.setVisible(state);
                this.btnSubmit && this.btnSubmit.setVisible(!state);
                this.btnSaveForm && this.btnSaveForm.setVisible(!state);
            },

            SetDisabled: function (state) {
                this._state.disabled = state;
                this.paragraphControls.forEach(function(button) {
                    if ( button ) {
                        button.setDisabled(state);
                    }
                }, this);
            },

            capBtnText: 'Text Field',
            capBtnComboBox: 'Combo Box',
            capBtnDropDown: 'Dropdown',
            capBtnCheckBox: 'Checkbox',
            capBtnRadioBox: 'Radio Button',
            capBtnImage: 'Image',
            capBtnView: 'Fill Form',
            textClearFields: 'Clear All Fields',
            textHighlight: 'Highlight Settings',
            tipTextField: 'Insert text field',
            tipComboBox: 'Insert combo box',
            tipDropDown: 'Insert dropdown list',
            tipCheckBox: 'Insert checkbox',
            tipRadioBox: 'Insert radio button',
            tipImageField: 'Insert image',
            tipViewForm: 'View form',
            textNoHighlight: 'No highlighting',
            textClear: 'Clear Fields',
            capBtnPrev: 'Previous Field',
            capBtnNext: 'Next Field',
            capBtnSubmit: 'Submit',
            tipPrevForm: 'Go to the previous field',
            tipNextForm: 'Go to the next field',
            tipSubmit: 'Submit form',
            textSubmited: 'Form submitted successfully',
            textRequired: 'Fill all required fields to send form.',
            capBtnSaveForm: 'Save as pdf',
            tipSaveForm: 'Save a file as a fillable PDF',
            txtUntitled: 'Untitled',
            textCreateForm: 'Add fields and create a fillable PDF',
            textGotIt: 'Got it',
            capBtnManager: 'Manage Roles',
            tipManager: 'Manage Roles',
            capBtnDownloadForm: 'Download as pdf',
            tipDownloadForm: 'Download a file as a fillable PDF',
            capBtnEmail: 'Email Address',
            capBtnPhone: 'Phone Number',
            capBtnComplex: 'Complex Field',
            tipEmailField: 'Insert email address',
            tipPhoneField: 'Insert phone number',
            tipComplexField: 'Insert complex field',
            textAnyone: 'Anyone',
            txtInlineText: 'Inline',
            txtInlineDesc: 'Insert inline text field',
            txtFixedText: 'Fixed',
            txtFixedDesc: 'Insert fixed text field',
            tipInlineText: 'Insert inline text field',
            tipFixedText: 'Insert fixed text field',
            capZipCode: 'Zip Code',
            capCreditCard: 'Credit Card',
            tipZipCode: 'Insert zip code',
            tipCreditCard: 'Insert credit card number',
            capDateTime: 'Date & Time',
            tipDateTime: 'Insert date and time',
            tipCreateField: 'To create a field select the desired field type on the toolbar and click on it. The field will appear in the document.',
            tipFormKey: 'You can assign a key to a field or a group of fields. When a user fills in the data, it will be copied to all the fields with the same key.',
            tipFormGroupKey: 'Group radio buttons to make the filling process faster. Choices with the same names will be synchronized. Users can only tick one radio button from the group.',
            tipFieldSettings: 'You can configure selected fields on the right sidebar. Click this icon to open the field settings.',
            tipHelpRoles: 'Use the Manage Roles feature to group fields by purpose and assign the responsible team members.',
            tipSaveFile: 'Click “Save as pdf” to save the form in the format ready for filling.',
            tipRolesLink: 'Learn more about roles',
            tipFieldsLink: 'Learn more about field parameters'

        }
    }()), DE.Views.FormsTab || {}));
});