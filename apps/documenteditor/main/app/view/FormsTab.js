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
            '<div class="group" style="display: none;">' +
                '<span class="btn-slot text x-huge" id="slot-btn-form-field"></span>' +
                '<span class="btn-slot text x-huge" id="slot-btn-form-combobox"></span>' +
                '<span class="btn-slot text x-huge" id="slot-btn-form-dropdown"></span>' +
                '<span class="btn-slot text x-huge" id="slot-btn-form-checkbox"></span>' +
                '<span class="btn-slot text x-huge" id="slot-btn-form-radiobox"></span>' +
                '<span class="btn-slot text x-huge" id="slot-btn-form-image"></span>' +
            '</div>' +
            '<div class="separator long forms" style="display: none;"></div>' +
            '<div class="group no-group-mask inner-elset small" style="display: none;">' +
                '<div class="elset no-group-mask form-view">' +
                    '<span class="btn-slot text" id="slot-form-clear-fields"></span>' +
                '</div>' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-form-highlight"></span>' +
                '</div>' +
            '</div>' +
            '<div class="group no-group-mask form-view">' +
                '<span class="btn-slot text x-huge" id="slot-btn-form-clear"></span>' +
                '<span class="btn-slot text x-huge" id="slot-btn-form-prev"></span>' +
                '<span class="btn-slot text x-huge" id="slot-btn-form-next"></span>' +
            '</div>' +
            '<div class="separator long submit" style="display: none;"></div>' +
            '<div class="group no-group-mask form-view" style="display: none;">' +
                '<span class="btn-slot text x-huge" id="slot-btn-form-view"></span>' +
                '<span class="btn-slot text x-huge" id="slot-btn-form-submit"></span>' +
            '</div>' +
        '</section>';

        function setEvents() {
            var me = this;
            this.btnTextField && this.btnTextField.on('click', function (b, e) {
                me.fireEvent('forms:insert', ['text']);
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
            this.btnViewForm && this.btnViewForm.on('click', function (b, e) {
                me.fireEvent('forms:mode', [b.pressed]);
            });
            this.btnClearFields && this.btnClearFields.on('click', function (b, e) {
                me.fireEvent('forms:clear');
            });
            this.btnClear && this.btnClear.on('click', function (b, e) {
                me.fireEvent('forms:clear');
            });
            if (this.mnuFormsColorPicker) {
                $('#id-toolbar-menu-new-form-color').on('click', function (b, e) {
                    me.fireEvent('forms:new-color');
                });
                this.mnuNoFormsColor.on('click', function (item) {
                    me.fireEvent('forms:no-color', [item]);
                });
                this.mnuFormsColorPicker.on('select', function(picker, color) {
                    me.fireEvent('forms:select-color', [color]);
                });
                this.btnHighlight.menu.on('show:after', function(picker, color) {
                    me.fireEvent('forms:open-color', [color]);
                });
            }
            this.btnPrevForm && this.btnPrevForm.on('click', function (b, e) {
                me.fireEvent('forms:goto', ['prev']);
            });
            this.btnNextForm && this.btnNextForm.on('click', function (b, e) {
                me.fireEvent('forms:goto', ['next']);
            });
            this.btnSubmit && this.btnSubmit.on('click', function (b, e) {
                me.fireEvent('forms:submit');
            });
        }

        return {

            options: {},

            initialize: function (options) {
                Common.UI.BaseView.prototype.initialize.call(this);
                this.toolbar = options.toolbar;
                this.appConfig = options.config;

                this.paragraphControls = [];

                var me = this;

                if (this.appConfig.isRestrictedEdit && this.appConfig.canFillForms) {
                    this.btnClear = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon clear-style',
                        caption: this.textClear
                    });
                } else {
                    this.btnTextField = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-text-field',
                        caption: this.capBtnText,
                        disabled: true
                    });
                    this.paragraphControls.push(this.btnTextField);

                    this.btnComboBox = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-combo-box',
                        caption: this.capBtnComboBox,
                        disabled: true
                    });
                    this.paragraphControls.push(this.btnComboBox);

                    this.btnDropDown = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-dropdown',
                        caption: this.capBtnDropDown,
                        disabled: true
                    });
                    this.paragraphControls.push(this.btnDropDown);

                    this.btnCheckBox = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-checkbox',
                        caption: this.capBtnCheckBox,
                        disabled: true
                    });
                    this.paragraphControls.push(this.btnCheckBox);

                    this.btnRadioBox = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-radio-button',
                        caption: this.capBtnRadioBox,
                        disabled: true
                    });
                    this.paragraphControls.push(this.btnRadioBox);

                    this.btnImageField = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-insertimage',
                        caption: this.capBtnImage,
                        disabled: true
                    });
                    this.paragraphControls.push(this.btnImageField);

                    this.btnViewForm = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-sheet-view',
                        caption: this.capBtnView,
                        enableToggle: true,
                        disabled: true
                    });
                    this.paragraphControls.push(this.btnViewForm);

                    this.btnClearFields = new Common.UI.Button({
                        cls         : 'btn-toolbar',
                        iconCls     : 'toolbar__icon btn-clearstyle',
                        caption     : this.textClearFields,
                        disabled: true
                    });
                    this.paragraphControls.push(this.btnClearFields);

                    this.btnHighlight = new Common.UI.ButtonColored({
                        cls         : 'btn-toolbar',
                        iconCls     : 'toolbar__icon btn-highlight',
                        caption     : this.textHighlight,
                        menu        : true,
                        disabled: true
                    });
                    this.paragraphControls.push(this.btnHighlight);
                }

                this.btnPrevForm = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon previous-field',
                    caption: this.capBtnPrev
                });
                this.paragraphControls.push(this.btnPrevForm);

                this.btnNextForm = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon next-field',
                    caption: this.capBtnNext
                });
                this.paragraphControls.push(this.btnNextForm);

                if (this.appConfig.canSubmitForms) {
                    this.btnSubmit = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon submit-form',
                        caption: this.capBtnSubmit
                    });
                    this.paragraphControls.push(this.btnSubmit);
                }

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
                    if (config.isEdit && config.canFeatureContentControl) {
                        if (config.canEditContentControl) {
                            me.btnHighlight.setMenu(new Common.UI.Menu({
                                items: [
                                    me.mnuNoFormsColor = new Common.UI.MenuItem({
                                        id: 'id-toolbar-menu-no-highlight-form',
                                        caption: me.textNoHighlight,
                                        checkable: true,
                                        checked: me.btnHighlight.currentColor === null
                                    }),
                                    {caption: '--'},
                                    {template: _.template('<div id="id-toolbar-menu-form-color" style="width: 169px; height: 94px; margin: 10px;"></div>')},
                                    {template: _.template('<a id="id-toolbar-menu-new-form-color" style="padding-left:12px;">' + me.textNewColor + '</a>')}
                                ]
                            }));
                            me.mnuFormsColorPicker = new Common.UI.ThemeColorPalette({
                                el: $('#id-toolbar-menu-form-color'),
                                colors: ['000000', '993300', '333300', '003300', '003366', '000080', '333399', '333333', '800000', 'FF6600',
                                    '808000', '00FF00', '008080', '0000FF', '666699', '808080', 'FF0000', 'FF9900', '99CC00', '339966',
                                    '33CCCC', '3366FF', '800080', '999999', 'FF00FF', 'FFCC00', 'FFFF00', '00FF00', '00FFFF', '00CCFF',
                                    '993366', 'C0C0C0', 'FF99CC', 'FFCC99', 'FFFF99', 'CCFFCC', 'CCFFFF', '99CCFF', 'CC99FF', 'FFFFFF'
                                ],
                                value: me.btnHighlight.currentColor
                            });
                            me.btnHighlight.setColor(me.btnHighlight.currentColor || 'transparent');
                        } else {
                            me.btnHighlight.cmpEl.parents('.group').hide().prev('.separator').hide();
                        }

                        me.btnTextField.updateHint(me.tipTextField);
                        me.btnComboBox.updateHint(me.tipComboBox);
                        me.btnDropDown.updateHint(me.tipDropDown);
                        me.btnCheckBox.updateHint(me.tipCheckBox);
                        me.btnRadioBox.updateHint(me.tipRadioBox);
                        me.btnImageField.updateHint(me.tipImageField);
                        me.btnViewForm.updateHint(me.tipViewForm);
                    } else {
                        me.btnClear.updateHint(me.textClearFields);
                    }
                    me.btnPrevForm.updateHint(me.tipPrevForm);
                    me.btnNextForm.updateHint(me.tipNextForm);
                    me.btnSubmit && me.btnSubmit.updateHint(me.tipSubmit);

                    setEvents.call(me);
                });
            },

            getPanel: function () {
                this.$el = $(_.template(template)( {} ));
                var $host = this.$el;

                if (this.appConfig.canSubmitForms) {
                    this.btnSubmit.render($host.find('#slot-btn-form-submit'));
                }

                if (this.appConfig.isRestrictedEdit && this.appConfig.canFillForms) {
                    this.btnClear.render($host.find('#slot-btn-form-clear'));
                    this.btnSubmit && $host.find('.separator.submit').show().next('.group').show();
                } else {
                    this.btnTextField.render($host.find('#slot-btn-form-field'));
                    this.btnComboBox.render($host.find('#slot-btn-form-combobox'));
                    this.btnDropDown.render($host.find('#slot-btn-form-dropdown'));
                    this.btnCheckBox.render($host.find('#slot-btn-form-checkbox'));
                    this.btnRadioBox.render($host.find('#slot-btn-form-radiobox'));
                    this.btnImageField.render($host.find('#slot-btn-form-image'));
                    this.btnViewForm.render($host.find('#slot-btn-form-view'));
                    this.btnClearFields.render($host.find('#slot-form-clear-fields'));
                    this.btnHighlight.render($host.find('#slot-form-highlight'));

                    var separator_forms = $host.find('.separator.forms');
                    separator_forms.prev('.group').show();
                    separator_forms.show().next('.group').show();
                    $host.find('.separator.submit').show().next('.group').show();
                }
                this.btnPrevForm.render($host.find('#slot-btn-form-prev'));
                this.btnNextForm.render($host.find('#slot-btn-form-next'));

                return this.$el;
            },

            show: function () {
                Common.UI.BaseView.prototype.show.call(this);
                this.fireEvent('show', this);
            },

            getButtons: function() {
                return this.paragraphControls;
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
            textNewColor: 'Add New Custom Color',
            textClear: 'Clear Fields',
            capBtnPrev: 'Previous Field',
            capBtnNext: 'Next Field',
            capBtnSubmit: 'Submit',
            tipPrevForm: 'Go to the previous field',
            tipNextForm: 'Go to the next field',
            tipSubmit: 'Submit form',
            textSubmited: 'Form submitted successfully',
            textRequired: 'Fill all required fields to send form.'
        }
    }()), DE.Views.FormsTab || {}));
});