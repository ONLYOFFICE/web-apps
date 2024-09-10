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
 *  FormsTab.js
 *
 *  Created on 06.10.2020
 *
 */

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Layout'
], function () {
    'use strict';

    if (!Common.enumLock)
        Common.enumLock = {};

    var enumLock = {
        requiredNotFilled: 'required-not-filled',
        submit: 'submit',
        firstPage: 'first-page',
        lastPage: 'last-page'
    };
    for (var key in enumLock) {
        if (enumLock.hasOwnProperty(key)) {
            Common.enumLock[key] = enumLock[key];
        }
    }

    DE.Views.FormsTab = Common.UI.BaseView.extend(_.extend((function(){
        var template =
        '<section class="panel" data-tab="forms" role="tabpanel" aria-labelledby="forms">' +
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
            '<div class="group small pdf-buttons" style="display: none;">' +
                '<div class="elset">' +
                    '<span class="btn-slot" id="slot-btn-pages" style="width: 95px;"></span>' +
                '</div>' +
                '<div class="elset">' +
                    '<span class="btn-slot" id="slot-btn-first-page"></span>' +
                    '<span class="btn-slot margin-left-5" id="slot-btn-prev-page"></span>' +
                    '<span class="btn-slot margin-left-5" id="slot-btn-next-page"></span>' +
                    '<span class="btn-slot margin-left-5" id="slot-btn-last-page"></span>' +
                '</div>' +
            '</div>' +
            '<div class="separator long pdf-buttons" style="display: none;"></div>' +
            '<div class="group small pdf-buttons" style="display: none;">' +
                '<div class="elset" style="display: flex;">' +
                    '<span class="btn-slot slot-field-zoom" style="flex-grow: 1;"></span>' +
                '</div>' +
                '<div class="elset" style="text-align: center;">' +
                    '<span class="btn-slot text font-size-normal slot-lbl-zoom" style="text-align: center;margin-top: 4px;"></span>' +
                '</div>' +
            '</div>' +
            '<div class="group small pdf-buttons" style="display: none;">' +
                '<div class="elset">' +
                    '<span class="btn-slot text slot-btn-ftp" style="text-align: center;"></span>' +
                '</div>' +
                '<div class="elset">' +
                    '<span class="btn-slot text slot-btn-ftw" style="text-align: center;"></span>' +
                '</div>' +
            '</div>' +
            '<div class="separator long pdf-buttons" style="display: none;"></div>' +
            '<div class="group no-group-mask" style="">' +
                '<span class="btn-slot text x-huge" id="slot-btn-form-view-roles"></span>' +
                '<span class="btn-slot text x-huge" id="slot-btn-form-prev"></span>' +
                '<span class="btn-slot text x-huge" id="slot-btn-form-next"></span>' +
                '<span class="btn-slot text x-huge" id="slot-btn-form-clear"></span>' +
            '</div>' +
            '<div class="separator long save-separator" style="display: none;"></div>' +
            '<div class="group no-group-mask" style="">' +
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
                    var item;
                    if (b.menu) {
                        item = b.menu.getChecked();
                        if (item) {
                            item = item.caption;
                        } else if (me._state.roles && me._state.roles.length>0) {
                            item = me._state.roles[0].asc_getSettings().asc_getName();
                        }
                    }
                    me.fireEvent('forms:mode', [b.pressed, item]);
                });
                if (this.btnViewFormRoles.menu) {
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

            if (this.fieldPages) {
                this.fieldPages.on('changed:after', function () {
                    me.fireEvent('forms:gopage', ['', parseInt(me.fieldPages.getValue())]);
                });
                this.fieldPages.on('inputleave', function(){ Common.NotificationCenter.trigger('edit:complete', this);});
                this.fieldPages.cmpEl && this.fieldPages.cmpEl.on('focus', 'input.form-control', function() {
                    setTimeout(function(){me.fieldPages._input && me.fieldPages._input.select();}, 1);
                });
            }
            this.btnFirstPage && this.btnFirstPage.on('click', function () {
                me.fireEvent('forms:gopage', ['first']);
            });
            this.btnLastPage && this.btnLastPage.on('click', function () {
                me.fireEvent('forms:gopage', ['last']);
            });
            this.btnPrevPage && this.btnPrevPage.on('click', function () {
                me.fireEvent('forms:gopage', ['prev']);
            });
            this.btnNextPage && this.btnNextPage.on('click', function () {
                me.fireEvent('forms:gopage', ['next']);
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
                    if (this.appConfig.isPDFForm) {
                        this.fieldPages = new Common.UI.InputFieldFixed({
                            id: 'id-toolbar-txt-pages',
                            style       : 'width: 100%;',
                            maskExp     : /[0-9]/,
                            allowBlank  : true,
                            validateOnChange: false,
                            fixedValue: '/ 1',
                            value: 1,
                            lock: [_set.disableOnStart],
                            validation  : function(value) {
                                if (/(^[0-9]+$)/.test(value)) {
                                    value = parseInt(value);
                                    if (value===undefined || value===null || value<1)
                                        me.fieldPages.setValue(me.api.getCurrentPage()+1);
                                } else
                                    me.fieldPages.setValue(me.api.getCurrentPage()+1);

                                return true;
                            }
                        });
                        this.paragraphControls.push(this.fieldPages);

                        this.btnFirstPage = new Common.UI.Button({
                            id          : 'id-toolbar-btn-first-page',
                            cls         : 'btn-toolbar',
                            iconCls     : 'toolbar__icon btn-firstitem',
                            lock: [_set.disableOnStart, _set.firstPage],
                            dataHint    : '1',
                            dataHintDirection: 'bottom'
                        });
                        this.paragraphControls.push(this.btnFirstPage);

                        this.btnLastPage = new Common.UI.Button({
                            id          : 'id-toolbar-btn-last-page',
                            cls         : 'btn-toolbar',
                            iconCls     : 'toolbar__icon btn-lastitem',
                            lock: [_set.disableOnStart, _set.lastPage],
                            dataHint    : '1',
                            dataHintDirection: 'bottom'
                        });
                        this.paragraphControls.push(this.btnLastPage);

                        this.btnPrevPage = new Common.UI.Button({
                            id          : 'id-toolbar-btn-prev-page',
                            cls         : 'btn-toolbar',
                            iconCls     : 'toolbar__icon btn-previtem',
                            lock: [_set.disableOnStart, _set.firstPage],
                            dataHint    : '1',
                            dataHintDirection: 'bottom'
                        });
                        this.paragraphControls.push(this.btnPrevPage);
                        //
                        this.btnNextPage = new Common.UI.Button({
                            id          : 'id-toolbar-btn-next-page',
                            cls         : 'btn-toolbar',
                            iconCls     : 'toolbar__icon btn-nextitem',
                            lock: [_set.disableOnStart, _set.lastPage],
                            dataHint    : '1',
                            dataHintDirection: 'bottom'
                        });
                        this.paragraphControls.push(this.btnNextPage);
                    }
                } else {
                    var isfixed = Common.localStorage.getBool("de-text-form-fixed", true);
                    this.btnTextField = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon ' + (isfixed ? 'btn-text-fixed-field' : 'btn-text-field'),
                        lock: [_set.paragraphLock, _set.headerLock, _set.controlPlain, _set.contentLock, _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.disableOnStart, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.inSmartart, _set.inSmartartInternal, _set.viewMode],
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
                        lock: [_set.paragraphLock, _set.headerLock, _set.controlPlain, _set.contentLock, _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.disableOnStart, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.inSmartart, _set.inSmartartInternal, _set.viewMode],
                        caption: this.capBtnComboBox,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.paragraphControls.push(this.btnComboBox);

                    this.btnDropDown = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-dropdown',
                        lock: [_set.paragraphLock, _set.headerLock, _set.controlPlain, _set.contentLock, _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.disableOnStart, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.inSmartart, _set.inSmartartInternal, _set.viewMode],
                        caption: this.capBtnDropDown,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.paragraphControls.push(this.btnDropDown);

                    this.btnCheckBox = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-checkbox',
                        lock: [_set.paragraphLock, _set.headerLock, _set.controlPlain, _set.contentLock, _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.disableOnStart, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.inSmartart, _set.inSmartartInternal, _set.viewMode],
                        caption: this.capBtnCheckBox,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.paragraphControls.push(this.btnCheckBox);

                    this.btnRadioBox = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-radio-button',
                        lock: [_set.paragraphLock, _set.headerLock, _set.controlPlain, _set.contentLock, _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.disableOnStart, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.inSmartart, _set.inSmartartInternal, _set.viewMode],
                        caption: this.capBtnRadioBox,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.paragraphControls.push(this.btnRadioBox);

                    this.btnImageField = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-insertimage',
                        lock: [_set.paragraphLock, _set.headerLock, _set.controlPlain, _set.contentLock, _set.complexForm, _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.disableOnStart, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.inSmartart, _set.inSmartartInternal, _set.viewMode],
                        caption: this.capBtnImage,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.paragraphControls.push(this.btnImageField);

                    this.btnManager = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-ic-sharing',
                        lock: [ _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.disableOnStart, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.viewMode],
                        caption: this.capBtnManager,
                        visible: Common.UI.FeaturesManager.isFeatureEnabled('roles', true),
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.paragraphControls.push(this.btnManager);

                    this.btnEmailField = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-email',
                        lock: [_set.paragraphLock, _set.headerLock, _set.controlPlain, _set.contentLock, _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.disableOnStart, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.inSmartart, _set.inSmartartInternal, _set.viewMode],
                        caption: this.capBtnEmail,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.paragraphControls.push(this.btnEmailField);

                    this.btnPhoneField = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-phone',
                        lock: [_set.paragraphLock, _set.headerLock, _set.controlPlain, _set.contentLock, _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.disableOnStart, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.inSmartart, _set.inSmartartInternal, _set.viewMode],
                        caption: this.capBtnPhone,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.paragraphControls.push(this.btnPhoneField);

                    this.btnZipCode = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-zip-code',
                        lock: [_set.paragraphLock, _set.headerLock, _set.controlPlain, _set.contentLock, _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.disableOnStart, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.inSmartart, _set.inSmartartInternal, _set.viewMode],
                        caption: this.capZipCode,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.paragraphControls.push(this.btnZipCode);

                    this.btnCreditCard = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-credit-card',
                        lock: [_set.paragraphLock, _set.headerLock, _set.controlPlain, _set.contentLock, _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.disableOnStart, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.inSmartart, _set.inSmartartInternal, _set.viewMode],
                        caption: this.capCreditCard,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.paragraphControls.push(this.btnCreditCard);

                    this.btnDateTime = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-datetime',
                        lock: [_set.paragraphLock, _set.headerLock, _set.controlPlain, _set.contentLock, _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.disableOnStart, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.inSmartart, _set.inSmartartInternal, _set.viewMode],
                        caption: this.capDateTime,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.paragraphControls.push(this.btnDateTime);

                    this.btnComplexField = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-complex-field',
                        lock: [_set.paragraphLock, _set.headerLock, _set.controlPlain, _set.contentLock, _set.complexForm, _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.disableOnStart, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.inSmartart, _set.inSmartartInternal, _set.viewMode],
                        caption: this.capBtnComplex,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.paragraphControls.push(this.btnComplexField);

                    this.btnViewFormRoles = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-big-sheet-view',
                        lock: [ _set.previewReviewMode, _set.formsNoRoles, _set.lostConnect, _set.disableOnStart, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.viewMode],
                        caption: this.capBtnView,
                        split: Common.UI.FeaturesManager.isFeatureEnabled('roles', true),
                        menu: Common.UI.FeaturesManager.isFeatureEnabled('roles', true) ? new Common.UI.Menu({
                            cls: 'menu-roles',
                            maxHeight: 270,
                            style: 'max-width: 400px;',
                            items: []
                        }) : false,
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
                    //     additionalItemsBefore: [ this.mnuNoFormsColor = new Common.UI.MenuItem({
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
                    lock: [ _set.lostConnect, _set.viewMode, _set.disableOnStart],
                    visible: this.appConfig.isRestrictedEdit && this.appConfig.canFillForms && this.appConfig.isPDFForm,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                this.paragraphControls.push(this.btnClear);

                this.btnPrevForm = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-previous-field',
                    lock: [ _set.previewReviewMode, _set.lostConnect, _set.disableOnStart, _set.docLockView, _set.docLockComments, _set.viewMode],
                    caption: this.capBtnPrev,
                    visible: this.appConfig.isRestrictedEdit && this.appConfig.canFillForms && this.appConfig.isPDFForm,
                    // disabled: this.appConfig.isEdit && this.appConfig.canFeatureContentControl && this.appConfig.canFeatureForms, // disable only for edit mode
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                this.paragraphControls.push(this.btnPrevForm);

                this.btnNextForm = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-next-field',
                    lock: [ _set.previewReviewMode, _set.lostConnect, _set.disableOnStart, _set.docLockView, _set.docLockComments, _set.viewMode],
                    caption: this.capBtnNext,
                    visible: this.appConfig.isRestrictedEdit && this.appConfig.canFillForms && this.appConfig.isPDFForm,
                    // disabled: this.appConfig.isEdit && this.appConfig.canFeatureContentControl && this.appConfig.canFeatureForms, // disable only for edit mode,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                this.paragraphControls.push(this.btnNextForm);

                if (this.appConfig.canSubmitForms) {
                    if (this.appConfig.isRestrictedEdit && this.appConfig.canFillForms) {
                        this.btnSubmit = new Common.UI.Button({
                            cls: 'btn-text-default auto back-color',
                            caption: this.capBtnSubmit,
                            lock: [_set.lostConnect, _set.disableOnStart, _set.requiredNotFilled, _set.submit],
                            dataHint: '0',
                            dataHintDirection: 'bottom',
                            dataHintOffset: 'big'
                        });
                    } else {
                        this.btnSubmit = new Common.UI.Button({
                            cls: 'btn-toolbar x-huge icon-top',
                            iconCls: 'toolbar__icon btn-submit-form',
                            lock: [_set.lostConnect, _set.disableOnStart, _set.requiredNotFilled, _set.submit],
                            caption: this.capBtnSubmit,
                            // disabled: this.appConfig.isEdit && this.appConfig.canFeatureContentControl && this.appConfig.canFeatureForms, // disable only for edit mode,
                            dataHint: '1',
                            dataHintDirection: 'bottom',
                            dataHintOffset: 'small'
                        });
                    }
                    this.paragraphControls.push(this.btnSubmit);
                } else if (this.appConfig.canDownloadForms) {
                    this.btnSaveForm = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        lock: [_set.lostConnect, _set.disableOnStart],
                        iconCls: 'toolbar__icon btn-save-form',
                        caption: this.appConfig.canRequestSaveAs || !!this.appConfig.saveAsUrl ? this.capBtnSaveForm : (this.appConfig.isOffline ? this.capBtnSaveFormDesktop : this.capBtnDownloadForm),
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
                    } else if (config.isRestrictedEdit && config.canFillForms && config.isPDFForm) {
                        me.btnFirstPage.updateHint(me.tipFirstPage);
                        me.btnLastPage.updateHint(me.tipLastPage);
                        me.btnPrevPage.updateHint(me.tipPrevPage);
                        me.btnNextPage.updateHint(me.tipNextPage);
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

                if (this.appConfig.isRestrictedEdit && this.appConfig.canFillForms) {
                    this.btnSubmit ? this.btnSubmit.render($('#slot-btn-header-form-submit')) : $('#slot-btn-header-form-submit').hide();
                    if (this.appConfig.isPDFForm) {
                        this.fieldPages.render($host.find('#slot-btn-pages'));
                        this.btnFirstPage.render($host.find('#slot-btn-first-page'));
                        this.btnLastPage.render($host.find('#slot-btn-last-page'));
                        this.btnPrevPage.render($host.find('#slot-btn-prev-page'));
                        this.btnNextPage.render($host.find('#slot-btn-next-page'));
                        $host.find('.pdf-buttons').show();
                    }
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
                    this.btnSubmit && this.btnSubmit.render($host.find('#slot-btn-form-submit'));

                    $host.find('.forms-buttons').show();
                    !Common.UI.FeaturesManager.isFeatureEnabled('roles', true) && this.btnManager.cmpEl.parents('.group').hide().prev('.separator').hide();
                }
                this.btnClear.render($host.find('#slot-btn-form-clear'));
                this.btnPrevForm.render($host.find('#slot-btn-form-prev'));
                this.btnNextForm.render($host.find('#slot-btn-form-next'));

                this.btnSaveForm && this.btnSaveForm.render($host.find('#slot-btn-form-save'));
                (this.btnSubmit && !(this.appConfig.isRestrictedEdit && this.appConfig.canFillForms) || this.btnSaveForm) && $host.find('.save-separator').show();

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
            tipFieldsLink: 'Learn more about field parameters',
            capBtnSaveFormDesktop: 'Save as...',
            textSubmitOk: 'Your PDF form has been saved in the Complete section. You can fill out this form again and send another result.',
            textFilled: 'Filled',
            tipFirstPage: 'Go to the first page',
            tipLastPage: 'Go to the last page',
            tipPrevPage: 'Go to the previous page',
            tipNextPage: 'Go to the next page'
        }
    }()), DE.Views.FormsTab || {}));
});