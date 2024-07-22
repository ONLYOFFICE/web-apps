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
 *  ControlSettingsDialog.js.js
 *
 *  Created on 12.12.2017
 *
 */

define([
    'text!documenteditor/main/app/template/ControlSettingsDialog.template',
    'common/main/lib/view/AdvancedSettingsWindow',
], function (contentTemplate) { 'use strict';

    DE.Views.ControlSettingsDialog = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 310,
            contentHeight: 320,
            toggleGroup: 'control-adv-settings-group',
            storageName: 'de-control-settings-adv-category'
        },

        initialize : function(options) {
            var me = this;

            _.extend(this.options, {
                title: this.textTitle,
                items: [
                    {panelId: 'id-adv-control-settings-general', panelCaption: this.strGeneral},
                    {panelId: 'id-adv-control-settings-lock',    panelCaption: this.textLock},
                    {panelId: 'id-adv-control-settings-list',    panelCaption: this.textCombobox},
                    {panelId: 'id-adv-control-settings-date',    panelCaption: this.textDate},
                    {panelId: 'id-adv-control-settings-checkbox',panelCaption: this.textCheckbox},
                    {panelId: 'id-adv-control-settings-field',  panelCaption: this.textField},
                    {panelId: 'id-adv-control-settings-additional',panelCaption: this.textAdditional}
                ],
                contentTemplate: _.template(contentTemplate)({
                    scope: this
                })
            }, options);

            this.handler    = options.handler;
            this.props      = options.props;
            this.api        = options.api;

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this.txtName = new Common.UI.InputField({
                el          : $('#control-settings-txt-name'),
                allowBlank  : true,
                validateOnChange: false,
                validateOnBlur: false,
                style       : 'width: 100%;',
                maxLength: 64,
                value       : ''
            });

            this.txtTag = new Common.UI.InputField({
                el          : $('#control-settings-txt-tag'),
                allowBlank  : true,
                validateOnChange: false,
                validateOnBlur: false,
                style       : 'width: 100%;',
                maxLength: 64,
                value       : ''
            });

            this.txtPlaceholder = new Common.UI.InputField({
                el          : $('#control-settings-txt-pholder'),
                allowBlank  : true,
                validateOnChange: false,
                validateOnBlur: false,
                style       : 'width: 100%;',
                value       : ''
            });

            this.cmbShow = new Common.UI.ComboBox({
                el: $('#control-settings-combo-show'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 120px;',
                editable: false,
                takeFocusOnClose: true,
                data: [
                    { displayValue: this.textBox,   value: Asc.c_oAscSdtAppearance.Frame },
                    { displayValue: this.textNone,  value: Asc.c_oAscSdtAppearance.Hidden }
                ]
            });
            this.cmbShow.setValue(Asc.c_oAscSdtAppearance.Frame);

            this.btnColor = new Common.UI.ColorButton({
                parentEl: $('#control-settings-color-btn'),
                auto: {
                    caption: this.textSystemColor,
                    color: Common.Utils.ThemeColor.getHexColor(220, 220, 220)
                },
                additionalAlign: this.menuAddAlign,
                color: 'auto',
                colors: ['000000', '993300', '333300', '003300', '003366', '000080', '333399', '333333', '800000', 'FF6600',
                    '808000', '00FF00', '008080', '0000FF', '666699', '808080', 'FF0000', 'FF9900', '99CC00', '339966',
                    '33CCCC', '3366FF', '800080', '999999', 'FF00FF', 'FFCC00', 'FFFF00', '00FF00', '00FFFF', '00CCFF',
                    '993366', 'C0C0C0', 'FF99CC', 'FFCC99', 'FFFF99', 'CCFFCC', 'CCFFFF', 'C9C8FF', 'CC99FF', 'FFFFFF'
                ],
                themecolors: 0,
                effects: 0,
                takeFocusOnClose: true
            });
            this.colors = this.btnColor.getPicker();

            this.btnApplyAll = new Common.UI.Button({
                el: $('#control-settings-btn-all')
            });
            this.btnApplyAll.on('click', _.bind(this.applyAllClick, this));

            this.chTemp = new Common.UI.CheckBox({
                el: $('#control-settings-chb-temp'),
                labelText: this.txtRemContent
            });

            this.chLockDelete = new Common.UI.CheckBox({
                el: $('#control-settings-chb-lock-delete'),
                labelText: this.txtLockDelete
            });

            this.chLockEdit = new Common.UI.CheckBox({
                el: $('#control-settings-chb-lock-edit'),
                labelText: this.txtLockEdit
            });

            // combobox & dropdown list
            this.list = new Common.UI.ListView({
                el: $('#control-settings-list', this.$window),
                store: new Common.UI.DataViewStore(),
                emptyText: '',
                template: _.template(['<div class="listview inner" style=""></div>'].join('')),
                itemTemplate: _.template([
                    '<div id="<%= id %>" class="list-item" style="width: 100%;display:inline-block;">',
                    '<div class="margin-right-5" style="width:90px;display: inline-block;vertical-align: middle; overflow: hidden; text-overflow: ellipsis;white-space: pre;"><%= Common.Utils.String.htmlEncode(name) %></div>',
                    '<div style="width:90px;display: inline-block;vertical-align: middle; overflow: hidden; text-overflow: ellipsis;white-space: pre;"><%= Common.Utils.String.htmlEncode(value) %></div>',
                    '</div>'
                ].join('')),
                tabindex: 1
            });
            this.list.on('item:select', _.bind(this.onSelectItem, this));

            this.btnAdd = new Common.UI.Button({
                el: $('#control-settings-btn-add')
            });
            this.btnAdd.on('click', _.bind(this.onAddItem, this));

            this.btnChange = new Common.UI.Button({
                el: $('#control-settings-btn-change')
            });
            this.btnChange.on('click', _.bind(this.onChangeItem, this));

            this.btnDelete = new Common.UI.Button({
                el: $('#control-settings-btn-delete')
            });
            this.btnDelete.on('click', _.bind(this.onDeleteItem, this));

            this.btnUp = new Common.UI.Button({
                el: $('#control-settings-btn-up')
            });
            this.btnUp.on('click', _.bind(this.onMoveItem, this, true));

            this.btnDown = new Common.UI.Button({
                el: $('#control-settings-btn-down')
            });
            this.btnDown.on('click', _.bind(this.onMoveItem, this, false));

            // date picker
            var data = [{ value: 0x0401 }, { value: 0x042C }, { value: 0x0402 }, { value: 0x0405 }, { value: 0x0406 }, { value: 0x0C07 }, { value: 0x0407 },  {value: 0x0807}, { value: 0x0408 }, { value: 0x0C09 }, { value: 0x3809 }, { value: 0x0809 }, { value: 0x0409 }, { value: 0x0C0A }, { value: 0x080A },
                { value: 0x040B }, { value: 0x040C }, { value: 0x100C }, { value: 0x0421 }, { value: 0x0410 }, { value: 0x0810 }, { value: 0x0411 }, { value: 0x0412 }, { value: 0x0426 }, { value: 0x040E }, { value: 0x0413 }, { value: 0x0415 }, { value: 0x0416 },
                { value: 0x0816 }, { value: 0x0419 }, { value: 0x041B }, { value: 0x0424 }, { value: 0x281A }, { value: 0x241A }, { value: 0x081D }, { value: 0x041D }, { value: 0x041F }, { value: 0x0422 }, { value: 0x042A }, { value: 0x0804 }, { value: 0x0404 }];
            data.forEach(function(item) {
                var langinfo = Common.util.LanguageInfo.getLocalLanguageName(item.value);
                item.displayValue = langinfo[1];
                item.langName = langinfo[0];
            });

            this.cmbLang = new Common.UI.ComboBox({
                el          : $('#control-settings-lang'),
                menuStyle   : 'min-width: 100%; max-height: 185px;',
                cls         : 'input-group-nr',
                editable    : false,
                takeFocusOnClose: true,
                data        : data,
                search: true,
                scrollAlwaysVisible: true
            });
            this.cmbLang.setValue(0x0409);
            this.cmbLang.on('selected',function(combo, record) {
                me.updateFormats(record.value);
            });

            this.listFormats = new Common.UI.ListView({
                el: $('#control-settings-format'),
                store: new Common.UI.DataViewStore(),
                scrollAlwaysVisible: true,
                tabindex: 1
            });
            this.listFormats.on('item:select', _.bind(this.onSelectFormat, this));

            this.txtDate = new Common.UI.InputField({
                el          : $('#control-settings-txt-format'),
                allowBlank  : true,
                validateOnChange: false,
                validateOnBlur: false,
                style       : 'width: 100%;',
                value       : ''
            });

            // Check Box
            this.btnEditChecked = new Common.UI.Button({
                el: $('#control-settings-btn-checked-edit'),
                hint: this.tipChange
            });
            this.btnEditChecked.cmpEl.css({'font-size': '16px', 'line-height': '16px'});
            this.btnEditChecked.on('click', _.bind(this.onEditCheckbox, this, true));

            this.btnEditUnchecked = new Common.UI.Button({
                el: $('#control-settings-btn-unchecked-edit'),
                hint: this.tipChange
            });
            this.btnEditUnchecked.cmpEl.css({'font-size': '16px', 'line-height': '16px'});
            this.btnEditUnchecked.on('click', _.bind(this.onEditCheckbox, this, false));

            // Additional
            this.txtGroupKey = new Common.UI.InputField({
                el          : $('#control-settings-txt-groupkey'),
                allowBlank  : true,
                validateOnChange: false,
                validateOnBlur: false,
                style       : 'width: 100%;',
                // maxLength: 64,
                value       : ''
            });

            this.txtKey = new Common.UI.InputField({
                el          : $('#control-settings-txt-key'),
                allowBlank  : true,
                validateOnChange: false,
                validateOnBlur: false,
                style       : 'width: 100%;',
                // maxLength: 64,
                value       : ''
            });

            this.txtLabel = new Common.UI.InputField({
                el          : $('#control-settings-txt-label'),
                allowBlank  : true,
                validateOnChange: false,
                validateOnBlur: false,
                style       : 'width: 100%;',
                // maxLength: 64,
                value       : ''
            });

            this.textareaHelp = this.$window.find('#control-settings-txt-help');
            this.textareaHelp.keydown(function (event) {
                if (event.keyCode == Common.UI.Keys.RETURN) {
                    event.stopPropagation();
                }
                me.isHelpChanged = true;
            });

            this.chRequired = new Common.UI.CheckBox({
                el: $('#control-settings-chb-required'),
                labelText: this.textRequired
            });

            // Text field
            this.btnEditPlaceholder = new Common.UI.Button({
                el: $('#control-settings-btn-placeholder-edit'),
                hint: this.tipChange
            });
            this.btnEditPlaceholder.cmpEl.css({'font-size': '16px', 'line-height': '16px'});
            this.btnEditPlaceholder.on('click', _.bind(this.onEditPlaceholder, this));

            this.spnWidth = new Common.UI.MetricSpinner({
                el: $('#control-settings-spin-width'),
                step: .1,
                width: 80,
                defaultUnit : "cm",
                value: 'Auto',
                allowAuto: true,
                maxValue: 55.88,
                minValue: 0.1
            });

            this.spnMaxChars = new Common.UI.MetricSpinner({
                el: $('#control-settings-spin-max-chars'),
                step: 1,
                width: 53,
                defaultUnit : "",
                value: '10',
                maxValue: 1000000,
                minValue: 1
            });

            this.chMaxChars = new Common.UI.CheckBox({
                el: $('#control-settings-chb-max-chars'),
                labelText: this.textMaxChars
            });
            this.chMaxChars.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                this.spnMaxChars.setDisabled(field.getValue()!='checked');
            }, this));

            this.chComb = new Common.UI.CheckBox({
                el: $('#control-settings-chb-comb'),
                labelText: this.textComb
            });
            this.chComb.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                var checked = (field.getValue()=='checked');
                if (checked) {
                    this.chMaxChars.setValue(true);
                }
                this.btnEditPlaceholder.setDisabled(!checked);
                this.spnWidth.setDisabled(!checked);
            }, this));

            this.afterRender();
        },

        getFocusedComponents: function() {
            return this.btnsCategory.concat([
                this.txtName, this.txtTag, this.txtPlaceholder, this.chTemp, this.cmbShow, this.btnColor, this.btnApplyAll, // 0 tab
                this.chLockDelete , this.chLockEdit, // 1 tab
                this.list, this.btnAdd, this.btnChange, this.btnDelete, this.btnUp, this.btnDown, // 2 tab
                this.txtDate, this.listFormats, this.cmbLang, // 3 tab,
                this.btnEditChecked, this.btnEditUnchecked // 4 tab,
            ]).concat(this.getFooterButtons());
        },

        onCategoryClick: function(btn, index) {
            Common.Views.AdvancedSettingsWindow.prototype.onCategoryClick.call(this, btn, index);

            var me = this;
            setTimeout(function(){
                if (index==0) {
                    me.txtName.focus();
                } else if (index==1) {
                    me.chLockDelete.focus();
                } else if (index==2) {
                    me.list.focus();
                } else if (index==3)
                    me.txtDate.focus();
                else if (index==4)
                    me.btnEditChecked.focus();
            }, 100);
        },

        afterRender: function() {
            this.updateMetricUnit();
            this._setDefaults(this.props);
            if (this.storageName) {
                var value = Common.localStorage.getItem(this.storageName);
                this.setActiveCategory((value!==null) ? parseInt(value) : 0);
            }
        },

        show: function() {
            Common.Views.AdvancedSettingsWindow.prototype.show.apply(this, arguments);
        },

        _setDefaults: function (props) {
            if (props) {
                var val = props.get_Alias();
                this.txtName.setValue(val ? val : '');

                val = props.get_Tag();
                this.txtTag.setValue(val ? val : '');

                val = props.get_PlaceholderText();
                this.txtPlaceholder.setValue(val ? val : '');

                val = props.get_Appearance();
                (val!==null && val!==undefined) && this.cmbShow.setValue(val);

                val = props.get_Color();
                if (val) {
                    val = Common.Utils.ThemeColor.getHexColor(val.get_r(), val.get_g(), val.get_b());
                    this.colors.selectByRGB(val,true);
                } else {
                    this.colors.clearSelection();
                    val = 'auto';
                }
                this.btnColor.setAutoColor(val == 'auto');
                this.btnColor.setColor(val);

                val = props.get_Lock();
                (val===undefined) && (val = Asc.c_oAscSdtLockType.Unlocked);
                this.chLockDelete.setValue(val==Asc.c_oAscSdtLockType.SdtContentLocked || val==Asc.c_oAscSdtLockType.SdtLocked);
                this.chLockEdit.setValue(val==Asc.c_oAscSdtLockType.SdtContentLocked || val==Asc.c_oAscSdtLockType.ContentLocked);

                val = props.get_Temporary();
                this.chTemp.setValue(!!val);

                var type = props.get_SpecificType();
                var specProps;

                //for list controls
                this.btnsCategory[2].setVisible(type == Asc.c_oAscContentControlSpecificType.ComboBox || type == Asc.c_oAscContentControlSpecificType.DropDownList);
                if (type == Asc.c_oAscContentControlSpecificType.ComboBox || type == Asc.c_oAscContentControlSpecificType.DropDownList) {
                    this.btnsCategory[2].setCaption(type == Asc.c_oAscContentControlSpecificType.ComboBox ? this.textCombobox : this.textDropDown);
                    specProps = (type == Asc.c_oAscContentControlSpecificType.ComboBox) ? props.get_ComboBoxPr() : props.get_DropDownListPr();
                    if (specProps) {
                        var count = specProps.get_ItemsCount();
                        var arr = [];
                        for (var i=0; i<count; i++) {
                            arr.push({
                                value: specProps.get_ItemValue(i),
                                name: specProps.get_ItemDisplayText(i)
                            });
                        }
                        this.list.store.reset(arr);
                    }
                    this.disableListButtons();
                }

                //for date picker
                this.btnsCategory[3].setVisible(type == Asc.c_oAscContentControlSpecificType.DateTime);
                if (type == Asc.c_oAscContentControlSpecificType.DateTime) {
                    specProps = props.get_DateTimePr();
                    if (specProps) {
                        this.datetime = specProps;
                        var lang = specProps.get_LangId() || this.options.controlLang;
                        if (lang) {
                            var item = this.cmbLang.store.findWhere({value: lang});
                            item = item ? item.get('value') : 0x0409;
                            this.cmbLang.setValue(item);
                        }
                        this.updateFormats(this.cmbLang.getValue());
                        var format = specProps.get_DateFormat();
                        var rec = this.listFormats.store.findWhere({format: format});
                        this.listFormats.selectRecord(rec);
                        this.listFormats.scrollToRecord(rec);
                        this.txtDate.setValue(format);
                    }
                }

                // for check box
                this.btnsCategory[4].setVisible(type == Asc.c_oAscContentControlSpecificType.CheckBox);
                if (type == Asc.c_oAscContentControlSpecificType.CheckBox) {
                    specProps = props.get_CheckBoxPr();
                    if (specProps) {
                        var code = specProps.get_CheckedSymbol(),
                            font = specProps.get_CheckedFont();
                        font && this.btnEditChecked.cmpEl.css('font-family', font);
                        code && this.btnEditChecked.setCaption(String.fromCharCode(code));
                        this.checkedBox = {code: code, font: font};

                        code = specProps.get_UncheckedSymbol();
                        font = specProps.get_UncheckedFont();
                        font && this.btnEditUnchecked.cmpEl.css('font-family', font);
                        code && this.btnEditUnchecked.setCaption(String.fromCharCode(code));
                        this.uncheckedBox = {code: code, font: font};
                    }
                }

                this.type = type;

                // form settings
                var formPr = props.get_FormPr();
                this.btnsCategory[6].setVisible(!!formPr);
                if (formPr) {
                    val = formPr.get_Key();
                    this.txtKey.setValue(val ? val : '');

                    val = formPr.get_Label();
                    this.txtLabel.setValue(val ? val : '');

                    val = formPr.get_HelpText();
                    this.textareaHelp.val(val ? val : '');

                    val = formPr.get_Required();
                    this.chRequired.setValue(!!val);

                    var hidden = true;
                    if (type == Asc.c_oAscContentControlSpecificType.CheckBox && specProps) {
                        val = specProps.get_GroupKey();
                        this.txtGroupKey.setValue(val ? val : '');
                        hidden = (typeof val !== 'string');
                        !hidden && this.btnsCategory[4].setCaption(this.textRadiobox);
                    }
                    this.$window.find('.group-key').toggleClass('hidden', hidden);
                }

                var formTextPr = props.get_TextFormPr();
                this.btnsCategory[5].setVisible(!!formTextPr);
                if (formTextPr) {
                    var code = formTextPr.get_PlaceHolderSymbol(),
                        font = formTextPr.get_PlaceHolderFont();
                    font && this.btnEditPlaceholder.cmpEl.css('font-family', font);
                    code && this.btnEditPlaceholder.setCaption(String.fromCharCode(code));
                    this.placeholder = {code: code, font: font};

                    val = formTextPr.get_Comb();
                    this.chComb.setValue(!!val, true);

                    this.btnEditPlaceholder.setDisabled(!val);
                    this.spnWidth.setDisabled(!val);

                    val = formTextPr.get_MaxCharacters();
                    this.chMaxChars.setValue(val && val>=0, true);
                    this.spnMaxChars.setDisabled(!val || val<0);
                    this.spnMaxChars.setValue(val && val>=0 ? val : 10);

                    val = formTextPr.get_Width();
                    this.spnWidth.setValue(val!==0 && val!==undefined ? Common.Utils.Metric.fnRecalcFromMM(val * 25.4 / 20 / 72.0) : -1, true);
                }

                if ((type == Asc.c_oAscContentControlSpecificType.CheckBox || type == Asc.c_oAscContentControlSpecificType.Picture) && !formPr )  {// standart checkbox or picture
                    this.txtPlaceholder.cmpEl && this.txtPlaceholder.cmpEl.closest('tr').hide();
                }
            }
        },

        getSettings: function () {
            var props   = new AscCommon.CContentControlPr();
            props.put_Alias(this.txtName.getValue());
            props.put_Tag(this.txtTag.getValue());
            props.put_PlaceholderText(this.txtPlaceholder.getValue() || '    ');
            props.put_Appearance(this.cmbShow.getValue());

            if (this.btnColor.isAutoColor()) {
                props.put_Color(null);
            } else {
                var color = this.colors.getColor() || this.btnColor.color;
                if (color) {
                    color = Common.Utils.ThemeColor.getRgbColor(color);
                    props.put_Color(color.get_r(), color.get_g(), color.get_b());
                }
            }

            props.put_Temporary(this.chTemp.getValue()==='checked');

            var lock = Asc.c_oAscSdtLockType.Unlocked;

            if (this.chLockDelete.getValue()=='checked' && this.chLockEdit.getValue()=='checked')
                lock = Asc.c_oAscSdtLockType.SdtContentLocked;
            else if (this.chLockDelete.getValue()=='checked')
                lock = Asc.c_oAscSdtLockType.SdtLocked;
            else if (this.chLockEdit.getValue()=='checked')
                lock = Asc.c_oAscSdtLockType.ContentLocked;
            props.put_Lock(lock);

            var specProps;
            // for list controls
            if (this.type == Asc.c_oAscContentControlSpecificType.ComboBox || this.type == Asc.c_oAscContentControlSpecificType.DropDownList) {
                specProps = (this.type == Asc.c_oAscContentControlSpecificType.ComboBox) ? this.props.get_ComboBoxPr() : this.props.get_DropDownListPr();
                specProps.clear();
                this.list.store.each(function (item, index) {
                    specProps.add_Item(item.get('name'), item.get('value'));
                });
                (this.type == Asc.c_oAscContentControlSpecificType.ComboBox) ? props.put_ComboBoxPr(specProps) : props.put_DropDownListPr(specProps);
            }

            //for date picker
            if (this.type == Asc.c_oAscContentControlSpecificType.DateTime) {
                specProps = this.props.get_DateTimePr();
                specProps.put_DateFormat(this.txtDate.getValue());
                specProps.put_LangId(this.cmbLang.getValue());
                props.put_DateTimePr(specProps);
            }

            // for check box
            if (this.type == Asc.c_oAscContentControlSpecificType.CheckBox) {
                if (this.checkedBox && this.checkedBox.changed || this.uncheckedBox && this.uncheckedBox.changed) {
                    specProps = this.props.get_CheckBoxPr();
                    if (this.checkedBox) {
                        specProps.put_CheckedSymbol(this.checkedBox.code);
                        specProps.put_CheckedFont(this.checkedBox.font);
                    }
                    if (this.uncheckedBox) {
                        specProps.put_UncheckedSymbol(this.uncheckedBox.code);
                        specProps.put_UncheckedFont(this.uncheckedBox.font);
                    }
                    props.put_CheckBoxPr(specProps);
                }
            }

            if (this.btnsCategory[6].isVisible()) {
                var formPr = new AscCommon.CSdtFormPr();
                formPr.put_Key(this.txtKey.getValue());
                formPr.put_Label(this.txtLabel.getValue());
                formPr.put_Required(this.chRequired.getValue()=='checked');

                if (this.isHelpChanged)
                    formPr.put_HelpText(this.textareaHelp.val());

                if (this.type == Asc.c_oAscContentControlSpecificType.CheckBox && !this.$window.find('.group-key').hasClass('hidden')) {
                    specProps = this.props.get_CheckBoxPr();
                    if (specProps) {
                        specProps.put_GroupKey(this.txtGroupKey.getValue());
                        props.put_CheckBoxPr(specProps);
                    }
                }
                props.put_FormPr(formPr);
            }

            if (this.btnsCategory[5].isVisible()) {
                var formTextPr = new AscCommon.CSdtTextFormPr();
                if (this.spnWidth.getValue()) {
                    var value = this.spnWidth.getNumberValue();
                    formTextPr.put_Width(value<=0 ? 0 : parseInt(Common.Utils.Metric.fnRecalcToMM(value) * 72 * 20 / 25.4));
                } else
                    formTextPr.put_Width(0);

                if (this.placeholder && this.placeholder.changed) {
                    formTextPr.put_PlaceHolderSymbol(this.placeholder.code);
                    formTextPr.put_PlaceHolderFont(this.placeholder.font);
                }
                formTextPr.put_Comb(this.chComb.getValue()=='checked');

                var checked = (this.chMaxChars.getValue()=='checked' || this.chComb.getValue()=='checked');
                formTextPr.put_MaxCharacters(checked);
                if (checked)
                    formTextPr.put_MaxCharacters(this.spnMaxChars.getNumberValue() || 10);

                props.put_TextFormPr(formTextPr);
            }

            return props;
        },

        onDlgBtnClick: function(event) {
            var me = this;
            var state = (typeof(event) == 'object') ? event.currentTarget.attributes['result'].value : event;
            if (state == 'ok') {
                this.handler && this.handler.call(this, state, this.getSettings());
            }

            this.close();
        },

        applyAllClick: function(btn, eOpts){
            if (this.api) {
                var props   = new AscCommon.CContentControlPr();
                props.put_Appearance(this.cmbShow.getValue());
                if (this.btnColor.isAutoColor()) {
                    props.put_Color(null);
                } else {
                    var color = this.colors.getColor() || this.btnColor.color;
                    if (color) {
                        color = Common.Utils.ThemeColor.getRgbColor(color);
                        props.put_Color(color.get_r(), color.get_g(), color.get_b());
                    }
                }
                this.api.asc_SetContentControlProperties(props, null, true);
            }
        },

        onSelectItem: function(listView, itemView, record) {
            this.disableListButtons(false);
        },

        disableListButtons: function(disabled) {
            if (disabled===undefined)
                disabled = !this.list.getSelectedRec();
            this.btnChange.setDisabled(disabled);
            this.btnDelete.setDisabled(disabled);
            this.btnUp.setDisabled(disabled);
            this.btnDown.setDisabled(disabled);
        },

        onAddItem: function() {
            var me = this,
                win = new DE.Views.EditListItemDialog({
                    store: me.list.store,
                    handler: function(result, name, value) {
                        if (result == 'ok') {
                            var rec = me.list.store.add({
                                    value: value,
                                    name: name
                                });
                            if (rec) {
                                me.list.selectRecord(rec);
                                me.list.scrollToRecord(rec);
                                me.disableListButtons();
                            }
                        }
                        me.list.focus();
                    }
                }).on('close', function() {
                    me.list.focus();
                });
            win.show();
        },

        onChangeItem: function() {
            var me = this,
                rec = this.list.getSelectedRec(),
                win = new DE.Views.EditListItemDialog({
                    store: me.list.store,
                    handler: function(result, name, value) {
                        if (result == 'ok') {
                            if (rec) {
                                rec.set({
                                    value: value,
                                    name: name
                                });
                            }
                        }
                        me.list.focus();
                    }
                }).on('close', function() {
                    me.list.focus();
                });
            rec && win.show();
            rec && win.setSettings({name: rec.get('name'), value: rec.get('value')});
        },

        onDeleteItem: function(btn, eOpts){
            var rec = this.list.getSelectedRec();
            if (rec) {
                var store = this.list.store;
                var idx = _.indexOf(store.models, rec);
                store.remove(rec);
                if (idx>store.length-1) idx = store.length-1;
                if (store.length>0) {
                    this.list.selectByIndex(idx);
                    this.list.scrollToRecord(store.at(idx));
                }
            }
            this.disableListButtons();
            this.list.focus();
        },

        onMoveItem: function(up) {
            var store = this.list.store,
                length = store.length,
                rec = this.list.getSelectedRec();
            if (rec) {
                var index = store.indexOf(rec);
                store.add(store.remove(rec), {at: up ? Math.max(0, index-1) : Math.min(length-1, index+1)});
                this.list.selectRecord(rec);
                this.list.scrollToRecord(rec);
            }
            this.list.focus();
        },

        updateFormats: function(lang) {
            if (this.datetime) {
                var props = this.datetime,
                    formats = props.get_FormatsExamples(),
                    arr = [];
                for (var i = 0, len = formats.length; i < len; i++)
                {
                    props.get_String(formats[i], undefined, lang);
                    var rec = new Common.UI.DataViewModel();
                    rec.set({
                        format: formats[i],
                        value: props.get_String(formats[i], undefined, lang)
                    });
                    arr.push(rec);
                }
                this.listFormats.store.reset(arr);
                this.listFormats.selectByIndex(0);
                var rec = this.listFormats.getSelectedRec();
                this.listFormats.scrollToRecord(rec);
                this.txtDate.setValue(rec.get('format'));
            }
        },

        onEditCheckbox: function(checked) {
            if (this.api) {
                var me = this,
                    props = (checked) ? me.checkedBox : me.uncheckedBox,
                    cmp = (checked) ? me.btnEditChecked : me.btnEditUnchecked,
                    handler = function(dlg, result, settings) {
                        if (result == 'ok') {
                            props.changed = true;
                            props.code = settings.code;
                            props.font = settings.font;
                            props.font && cmp.cmpEl.css('font-family', props.font);
                            settings.symbol && cmp.setCaption(settings.symbol);
                        }
                    },
                    win = new Common.Views.SymbolTableDialog({
                        api: me.api,
                        lang: me.options.interfaceLang,
                        modal: true,
                        type: 0,
                        font: props.font,
                        code: props.code,
                        handler: handler
                    }).on('close', function() {
                        cmp.focus();
                    });
                win.show();
                win.on('symbol:dblclick', handler);
            }
        },

        onEditPlaceholder: function() {
            if (this.api) {
                var me = this,
                    props = me.placeholder,
                    cmp = me.btnEditPlaceholder,
                    handler = function(dlg, result, settings) {
                        if (result == 'ok') {
                            props.changed = true;
                            props.code = settings.code;
                            props.font = settings.font;
                            props.font && cmp.cmpEl.css('font-family', props.font);
                            settings.symbol && cmp.setCaption(settings.symbol);
                        }
                    },
                    win = new Common.Views.SymbolTableDialog({
                        api: me.api,
                        lang: me.options.interfaceLang,
                        modal: true,
                        type: 0,
                        font: props.font,
                        code: props.code,
                        handler: handler
                    });
                win.show();
                win.on('symbol:dblclick', handler);
            }
        },

        onSelectFormat: function(lisvView, itemView, record) {
            if (!record) return;
            this.txtDate.setValue(record.get('format'));
        },

        updateMetricUnit: function() {
            this.spnWidth.setDefaultUnit(Common.Utils.Metric.getCurrentMetricName());
            this.spnWidth.setStep(Common.Utils.Metric.getCurrentMetric()==Common.Utils.Metric.c_MetricUnits.pt ? 1 : 0.1);
        },

        textTitle:    'Content Control Settings',
        textName: 'Title',
        textTag: 'Tag',
        txtLockDelete: 'Content control cannot be deleted',
        txtLockEdit: 'Contents cannot be edited',
        textLock: 'Locking',
        textShowAs: 'Show as',
        textColor: 'Color',
        textBox: 'Bounding box',
        textNone: 'None',
        textApplyAll: 'Apply to All',
        textAppearance: 'Appearance',
        textSystemColor: 'System',
        strGeneral: 'General',
        textAdd: 'Add',
        textChange: 'Edit',
        textDelete: 'Delete',
        textUp: 'Up',
        textDown: 'Down',
        textCombobox: 'Combo box',
        textDropDown: 'Drop-down list',
        textDisplayName: 'Display name',
        textValue: 'Value',
        textDate: 'Date format',
        textLang: 'Language',
        textFormat: 'Display the date like this',
        textCheckbox: 'Check box',
        textChecked: 'Checked symbol',
        textUnchecked: 'Unchecked symbol',
        tipChange: 'Change symbol',
        textPlaceholder: 'Placeholder',
        textAdditional: 'Additional',
        textField: 'Text field',
        textKey: 'Key',
        textLabel: 'Label',
        textHelp: 'Help text',
        textRequired: 'Required',
        textGroupKey: 'Group key',
        textRadiobox: 'Radio box',
        textWidth: 'Width',
        textPlaceholderSymbol: 'Placeholder symbol',
        textMaxChars: 'Characters limit',
        textComb: 'Comb of characters',
        txtRemContent: 'Remove content control when contents are edited'

    }, DE.Views.ControlSettingsDialog || {}))
});