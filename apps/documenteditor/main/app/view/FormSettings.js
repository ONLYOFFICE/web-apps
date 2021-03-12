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
 *  FormSettings.js
 *
 *  Created by Julia Radzhabova on 28/09/20
 *  Copyright (c) 2020 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!documenteditor/main/app/template/FormSettings.template',
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/component/ComboBox',
    'common/main/lib/component/MetricSpinner',
    'common/main/lib/component/TextareaField',
    'common/main/lib/component/CheckBox',
    'common/main/lib/view/ImageFromUrlDialog'
], function (menuTemplate, $, _, Backbone) {
    'use strict';

    DE.Views.FormSettings = Backbone.View.extend(_.extend({
        el: '#id-form-settings',

        // Compile our stats template
        template: _.template(menuTemplate),

        // Delegated events for creating new items, and clearing completed ones.
        events: {
        },

        options: {
            alias: 'FormSettings'
        },

        initialize: function () {
            this._initSettings = true;

            this._state = {
                DisabledControls: undefined,
                LockDelete: undefined
            };
            this.spinners = [];
            this.lockedControls = [];
            this.internalId = null;
            this._locked = true;
            this._originalTextFormProps = null;
            this._originalFormProps = null;
            this._originalProps = null;

            this.render();
        },

        render: function () {
            var el = this.$el || $(this.el);
            el.html(this.template({
                scope: this
            }));

            this.TextOnlySettings = el.find('.form-textfield');
            this.PlaceholderSettings = el.find('.form-placeholder');
            this.KeySettings = el.find('.form-keyfield');
            this.KeySettingsTd = this.KeySettings.find('td');
            this.CheckOnlySettings = el.find('.form-checkbox');
            this.RadioOnlySettings = el.find('.form-radiobox');
            this.ListOnlySettings = el.find('.form-list');
            this.ImageOnlySettings = el.find('.form-image');
            this.ConnectedSettings = el.find('.form-connected');
        },

        createDelayedElements: function() {
            this._initSettings = false;

            var $markup = this.$el || $(this.el);

            var me = this;

            this.labelFormName = $markup.findById('#form-settings-name');
            this.labelConnectedFields = $markup.findById('#form-settings-connected');
            $markup.findById('#form-settings-disconnect').on('click', _.bind(this.onDisconnect, this));

            // Common props
            this.cmbKey = new Common.UI.ComboBox({
                el: $markup.findById('#form-combo-key'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: true,
                data: []
            });
            this.cmbKey.setValue('');
            this.lockedControls.push(this.cmbKey);
            this.cmbKey.on('selected', this.onKeyChanged.bind(this));
            this.cmbKey.on('changed:after', this.onKeyChanged.bind(this));
            this.cmbKey.on('hide:after', this.onHideMenus.bind(this));

            this.txtPlaceholder = new Common.UI.InputField({
                el          : $markup.findById('#form-txt-pholder'),
                allowBlank  : true,
                validateOnChange: false,
                validateOnBlur: false,
                style       : 'width: 100%;',
                value       : ''
            });
            this.lockedControls.push(this.txtPlaceholder);
            this.txtPlaceholder.on('changed:after', this.onPlaceholderChanged.bind(this));
            this.txtPlaceholder.on('inputleave', function(){ me.fireEvent('editcomplete', me);});

            this.textareaHelp = new Common.UI.TextareaField({
                el          : $markup.findById('#form-txt-help'),
                style       : 'width: 100%; height: 60px;',
                value       : ''
            });
            this.lockedControls.push(this.textareaHelp);
            this.textareaHelp.on('changed:after', this.onHelpChanged.bind(this));
            this.textareaHelp.on('inputleave', function(){ me.fireEvent('editcomplete', me);});

            // Text props
            this.chMaxChars = new Common.UI.CheckBox({
                el: $markup.findById('#form-chb-max-chars'),
                labelText: this.textMaxChars
            });
            this.chMaxChars.on('change', this.onChMaxCharsChanged.bind(this));
            this.lockedControls.push(this.chMaxChars);

            this.spnMaxChars = new Common.UI.MetricSpinner({
                el: $markup.findById('#form-spin-max-chars'),
                step: 1,
                width: 45,
                defaultUnit : "",
                value: '10',
                maxValue: 1000000,
                minValue: 1
            });
            this.lockedControls.push(this.spnMaxChars);
            this.spnMaxChars.on('change', this.onMaxCharsChange.bind(this));
            this.spnMaxChars.on('inputleave', function(){ me.fireEvent('editcomplete', me);});

            this.chComb = new Common.UI.CheckBox({
                el: $markup.findById('#form-chb-comb'),
                labelText: this.textComb
            });
            this.chComb.on('change', this.onChCombChanged.bind(this));
            this.lockedControls.push(this.chComb);

            this.spnWidth = new Common.UI.MetricSpinner({
                el: $markup.findById('#form-spin-width'),
                step: .1,
                width: 64,
                defaultUnit : "cm",
                value: 'Auto',
                allowAuto: true,
                maxValue: 55.88,
                minValue: 0.1
            });
            this.lockedControls.push(this.spnWidth);
            this.spinners.push(this.spnWidth);
            this.spnWidth.on('change', this.onWidthChange.bind(this));
            this.spnWidth.on('inputleave', function(){ me.fireEvent('editcomplete', me);});

            // Radio props
            this.cmbGroupKey = new Common.UI.ComboBox({
                el: $markup.findById('#form-combo-group-key'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: true,
                data: []
            });
            this.cmbGroupKey.setValue('');
            this.lockedControls.push(this.cmbGroupKey);
            this.cmbGroupKey.on('selected', this.onGroupKeyChanged.bind(this));
            this.cmbGroupKey.on('changed:after', this.onGroupKeyChanged.bind(this));
            this.cmbGroupKey.on('hide:after', this.onHideMenus.bind(this));

            // combobox & dropdown list
            this.txtNewValue = new Common.UI.InputField({
                el          : $markup.findById('#form-txt-new-value'),
                allowBlank  : true,
                validateOnChange: false,
                validateOnBlur: false,
                style       : 'width: 100%;',
                value       : ''
            });
            this.lockedControls.push(this.txtNewValue);
            this.txtNewValue.on('inputleave', function(){ me.fireEvent('editcomplete', me);});
            this.txtNewValue._input.on('keydown', _.bind(this.onNewValueKeydown, this));

            this.list = new Common.UI.ListView({
                el: $markup.findById('#form-list-list'),
                store: new Common.UI.DataViewStore(),
                emptyText: '',
                template: _.template(['<div class="listview inner" style=""></div>'].join('')),
                itemTemplate: _.template([
                    '<div id="<%= id %>" class="list-item" style="width: 100%;display:inline-block;">',
                    // '<div style="width:65px;display: inline-block;vertical-align: middle; overflow: hidden; text-overflow: ellipsis;white-space: pre;margin-right: 5px;"><%= name %></div>',
                    '<div style="width:145px;display: inline-block;vertical-align: middle; overflow: hidden; text-overflow: ellipsis;white-space: pre;"><%= name %></div>',
                    '</div>'
                ].join(''))
            });
            this.list.on('item:select', _.bind(this.onSelectItem, this));
            this.lockedControls.push(this.list);

            this.btnListAdd = new Common.UI.Button({
                parentEl: $markup.findById('#form-list-add'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-zoomup',
                hint: this.textTipAdd
            });
            this.btnListAdd.on('click', _.bind(this.onAddItem, this));
            this.lockedControls.push(this.btnListAdd);

            this.btnListDelete = new Common.UI.Button({
                parentEl: $markup.findById('#form-list-delete'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon cc-remove',
                hint: this.textTipDelete
            });
            this.btnListDelete.on('click', _.bind(this.onDeleteItem, this));
            this.lockedControls.push(this.btnListDelete);

            this.btnListUp = new Common.UI.Button({
                parentEl: $markup.findById('#form-list-up'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-arrow-up',
                hint: this.textTipUp
            });
            this.btnListUp.on('click', _.bind(this.onMoveItem, this, true));
            this.lockedControls.push(this.btnListUp);

            this.btnListDown = new Common.UI.Button({
                parentEl: $markup.findById('#form-list-down'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-arrow-down',
                hint: this.textTipDown
            });
            this.btnListDown.on('click', _.bind(this.onMoveItem, this, false));
            this.lockedControls.push(this.btnListDown);

            // image props
            this.btnSelectImage = new Common.UI.Button({
                parentEl: $('#form-button-replace'),
                cls: 'btn-text-menu-default',
                caption: this.textSelectImage,
                style: "width:100%;",
                menu: new Common.UI.Menu({
                    style: 'min-width: 194px;',
                    maxHeight: 200,
                    items: [
                        {caption: this.textFromFile, value: 0},
                        {caption: this.textFromUrl, value: 1},
                        {caption: this.textFromStorage, value: 2}
                    ]
                })
            });
            this.lockedControls.push(this.btnSelectImage);
            this.btnSelectImage.menu.on('item:click', _.bind(this.onImageSelect, this));
            this.btnSelectImage.menu.items[2].setVisible(this.mode.canRequestInsertImage || this.mode.fileChoiceUrl && this.mode.fileChoiceUrl.indexOf("{documentType}")>-1);

            this.btnRemForm = new Common.UI.Button({
                parentEl: $markup.findById('#form-btn-delete'),
                cls         : 'btn-toolbar',
                iconCls     : 'toolbar__icon cc-remove',
                caption     : this.textDelete,
                style       : 'text-align: left;'
            });
            this.btnRemForm.on('click', _.bind(function(btn){
                this.api.asc_RemoveContentControl(this._state.id);
            }, this));
            this.lockedControls.push(this.btnRemForm);

            this.btnLockForm = new Common.UI.Button({
                parentEl: $markup.findById('#form-btn-lock'),
                cls         : 'btn-toolbar',
                iconCls     : 'toolbar__icon btn-lock',
                caption     : this.textLock,
                style       : 'text-align: left;'
            });
            this.btnLockForm.on('click', _.bind(function(btn){
                if (this.api  && !this._noApply) {
                    var props   = this._originalProps || new AscCommon.CContentControlPr();
                    props.put_Lock(!this._state.LockDelete ? Asc.c_oAscSdtLockType.SdtLocked : Asc.c_oAscSdtLockType.Unlocked);
                    this.api.asc_SetContentControlProperties(props, this.internalId);
                }
            }, this));

            this.updateMetricUnit();
            this.UpdateThemeColors();
        },

        setApi: function(api) {
            this.api = api;
            if (this.api) {
                // this.api.asc_registerCallback('asc_onParaSpacingLine', _.bind(this._onLineSpacing, this));
            }
            return this;
        },

        setMode: function(mode) {
            this.mode = mode;
        },

        onKeyChanged: function(combo, record) {
            if (this.api && !this._noApply) {
                var props   = this._originalProps || new AscCommon.CContentControlPr();
                var formPr = this._originalFormProps || new AscCommon.CSdtFormPr();
                formPr.put_Key(record.value);
                props.put_FormPr(formPr);
                this.api.asc_SetContentControlProperties(props, this.internalId);
                this.fireEvent('editcomplete', this);
            }
        },

        onPlaceholderChanged: function(input, newValue, oldValue, e) {
            if (this.api && !this._noApply && (newValue!==oldValue)) {
                var props   = this._originalProps || new AscCommon.CContentControlPr();
                props.put_PlaceholderText(newValue || '    ');
                this.api.asc_SetContentControlProperties(props, this.internalId);
                if (!e.relatedTarget || (e.relatedTarget.localName != 'input' && e.relatedTarget.localName != 'textarea') || !/form-control/.test(e.relatedTarget.className))
                    this.fireEvent('editcomplete', this);
            }
        },

        onHelpChanged: function(input, newValue, oldValue, e) {
            if (this.api && !this._noApply && (newValue!==oldValue)) {
                var props   = this._originalProps || new AscCommon.CContentControlPr();
                var formPr = this._originalFormProps || new AscCommon.CSdtFormPr();
                formPr.put_HelpText(newValue);
                props.put_FormPr(formPr);
                this.api.asc_SetContentControlProperties(props, this.internalId);
                if (!e.relatedTarget || (e.relatedTarget.localName != 'input' && e.relatedTarget.localName != 'textarea') || !/form-control/.test(e.relatedTarget.className))
                    this.fireEvent('editcomplete', this);
            }
        },

        onChMaxCharsChanged: function(field, newValue, oldValue, eOpts){
            var checked = (field.getValue()=='checked');
            this.spnMaxChars.setDisabled(!checked);
            if (!checked) {
                this.chComb.setValue(false, true);
                this.spnWidth.setDisabled(true);
            }
            if (this.api && !this._noApply) {
                var props   = this._originalProps || new AscCommon.CContentControlPr();
                var formTextPr = this._originalTextFormProps || new AscCommon.CSdtTextFormPr();
                (!checked) && formTextPr.put_Comb(checked);
                formTextPr.put_MaxCharacters(checked ? (this.spnMaxChars.getNumberValue() || 10) : checked);
                props.put_TextFormPr(formTextPr);
                this.api.asc_SetContentControlProperties(props, this.internalId);
                this.fireEvent('editcomplete', this);
            }
        },

        onMaxCharsChange: function(field, newValue, oldValue, eOpts){
            if (this.api && !this._noApply) {
                var props   = this._originalProps || new AscCommon.CContentControlPr();
                var formTextPr = this._originalTextFormProps || new AscCommon.CSdtTextFormPr();
                var checked = (this.chMaxChars.getValue()=='checked' || this.chComb.getValue()=='checked');
                formTextPr.put_MaxCharacters(checked ? (field.getNumberValue() || 10) : checked);
                props.put_TextFormPr(formTextPr);
                this.api.asc_SetContentControlProperties(props, this.internalId);
                this.fireEvent('editcomplete', this);
            }
        },

        onChCombChanged: function(field, newValue, oldValue, eOpts){
            var checked = (field.getValue()=='checked');
            if (checked) {
                this.chMaxChars.setValue(true, true);
                this.spnMaxChars.setDisabled(false);
            }
            this.spnWidth.setDisabled(!checked);
            if (this.api && !this._noApply) {
                var props   = this._originalProps || new AscCommon.CContentControlPr();
                var formTextPr = this._originalTextFormProps || new AscCommon.CSdtTextFormPr();
                formTextPr.put_Comb(checked);
                if (checked) {
                    formTextPr.put_MaxCharacters(this.spnMaxChars.getNumberValue() || 10);
                    if (this.spnWidth.getValue()) {
                        var value = this.spnWidth.getNumberValue();
                        formTextPr.put_Width(value<=0 ? 0 : parseInt(Common.Utils.Metric.fnRecalcToMM(value) * 72 * 20 / 25.4 + 0.1));
                    } else
                        formTextPr.put_Width(0);
                }
                props.put_TextFormPr(formTextPr);
                this.api.asc_SetContentControlProperties(props, this.internalId);
                this.fireEvent('editcomplete', this);
            }
        },

        onWidthChange: function(field, newValue, oldValue, eOpts){
            if (this.api && !this._noApply) {
                var props   = this._originalProps || new AscCommon.CContentControlPr();
                var formTextPr = this._originalTextFormProps || new AscCommon.CSdtTextFormPr();
                if (this.spnWidth.getValue()) {
                    var value = this.spnWidth.getNumberValue();
                    formTextPr.put_Width(value<=0 ? 0 : parseInt(Common.Utils.Metric.fnRecalcToMM(value) * 72 * 20 / 25.4 + 0.1));
                } else
                    formTextPr.put_Width(0);

                props.put_TextFormPr(formTextPr);
                this.api.asc_SetContentControlProperties(props, this.internalId);
                this.fireEvent('editcomplete', this);
            }
        },

        onGroupKeyChanged: function(combo, record) {
            if (this.api && !this._noApply) {
                var props   = this._originalProps || new AscCommon.CContentControlPr();
                var specProps = this._originalCheckProps || new AscCommon.CSdtCheckBoxPr();
                specProps.put_GroupKey(record.value);
                props.put_CheckBoxPr(specProps);
                this.api.asc_SetContentControlProperties(props, this.internalId);
                this.fireEvent('editcomplete', this);
            }
        },

        fillListProps: function() {
            if (this.api && !this._noApply) {
                var props   = this._originalProps || new AscCommon.CContentControlPr();
                var specProps = this._originalListProps || new AscCommon.CSdtComboBoxPr();
                specProps.clear();
                this.list.store.each(function (item, index) {
                    specProps.add_Item(item.get('name'), item.get('value'));
                });
                (this.type == Asc.c_oAscContentControlSpecificType.ComboBox) ? props.put_ComboBoxPr(specProps) : props.put_DropDownListPr(specProps);
                this.api.asc_SetContentControlProperties(props, this.internalId);
            }
        },

        onNewValueKeydown: function(event) {
            if (this.api && !this._noApply && event.keyCode == Common.UI.Keys.RETURN) {
                this.onAddItem();
            }
        },

        onAddItem: function() {
            var store = this.list.store,
                value = this.txtNewValue.getValue();
            if (value!=='') {
                var rec = store.findWhere({value: value});
                if (!rec) {
                    store.add({value: value, name: value});
                    this._state.listValue = value;
                    this._state.listIndex = undefined;
                    this.fillListProps();
                }
            }
            this.fireEvent('editcomplete', this);
        },

        onDeleteItem: function(btn, eOpts){
            var rec = this.list.getSelectedRec();
            if (rec) {
                var store = this.list.store;
                this._state.listIndex = store.indexOf(rec);
                this._state.listValue = undefined;
                store.remove(rec);
                this.fillListProps();
            }
            this.fireEvent('editcomplete', this);
        },

        onMoveItem: function(up) {
            var store = this.list.store,
                length = store.length,
                rec = this.list.getSelectedRec();
            if (rec) {
                var index = store.indexOf(rec);
                store.add(store.remove(rec), {at: up ? Math.max(0, index-1) : Math.min(length-1, index+1)});
                this.fillListProps();
            }
            this.fireEvent('editcomplete', this);
        },

        setImageUrl: function(url, token) {
            this.api.asc_SetContentControlPictureUrl(url, this.internalId, token);
        },

        insertImageFromStorage: function(data) {
            if (data && data.url && data.c=='control') {
                this.setImageUrl(data.url, data.token);
            }
        },

        onImageSelect: function(menu, item) {
            if (item.value==1) {
                var me = this;
                (new Common.Views.ImageFromUrlDialog({
                    handler: function(result, value) {
                        if (result == 'ok') {
                            if (me.api) {
                                var checkUrl = value.replace(/ /g, '');
                                if (!_.isEmpty(checkUrl)) {
                                    me.setImageUrl(checkUrl);
                                }
                            }
                        }
                        me.fireEvent('editcomplete', me);
                    }
                })).show();
            } else if (item.value==2) {
                Common.NotificationCenter.trigger('storage:image-load', 'control');
            } else {
                if (this._isFromFile) return;
                this._isFromFile = true;
                if (this.api) this.api.asc_addImage(this._originalProps);
                this.fireEvent('editcomplete', this);
                this._isFromFile = false;
            }
        },

        onColorPickerSelect: function(btn, color) {
            this.BorderColor = color;
            this._state.BorderColor = undefined;

            if (this.api && !this._noApply) {
                var props   = this._originalProps || new AscCommon.CContentControlPr();
                var formTextPr = this._originalTextFormProps || new AscCommon.CSdtTextFormPr();
                if (color == 'transparent') {
                    formTextPr.put_CombBorder();
                } else {
                    var brd = formTextPr.get_CombBorder();
                    if (!brd)
                        brd = new Asc.asc_CTextBorder();
                    brd.put_Value(1);
                    brd.put_Color(Common.Utils.ThemeColor.getRgbColor(color));
                    formTextPr.put_CombBorder(brd);
                }
                props.put_TextFormPr(formTextPr);
                this.api.asc_SetContentControlProperties(props, this.internalId);
                this.fireEvent('editcomplete', this);
            }
        },

        onNoBorderClick: function(item) {
            this.BorderColor = 'transparent';
            this._state.BorderColor = undefined;

            if (this.api && !this._noApply) {
                var props   = this._originalProps || new AscCommon.CContentControlPr();
                var formTextPr = this._originalTextFormProps || new AscCommon.CSdtTextFormPr();
                formTextPr.put_CombBorder();
                props.put_TextFormPr(formTextPr);
                this.api.asc_SetContentControlProperties(props, this.internalId);
                this.fireEvent('editcomplete', this);
            }
        },

        ChangeSettings: function(props) {
            if (this._initSettings)
                this.createDelayedElements();

            if (props) {
                this._originalProps = props;

                this._noApply = true;

                this.internalId = props.get_InternalId();

                var val = props.get_PlaceholderText();
                if (this._state.placeholder !== val) {
                    this.txtPlaceholder.setValue(val ? val : '');
                    this._state.placeholder = val;
                }

                val = props.get_Lock();
                (val===undefined) && (val = Asc.c_oAscSdtLockType.Unlocked);
                if (this._state.LockDelete !== (val==Asc.c_oAscSdtLockType.SdtContentLocked || val==Asc.c_oAscSdtLockType.SdtLocked)) {
                    this._state.LockDelete = (val==Asc.c_oAscSdtLockType.SdtContentLocked || val==Asc.c_oAscSdtLockType.SdtLocked);
                    this.btnLockForm.setCaption(this._state.LockDelete ? this.textUnlock : this.textLock);
                }
                this.disableControls(this._locked);

                var type = props.get_SpecificType(),
                    connected = false;
                var specProps;
                //for list controls
                if (type == Asc.c_oAscContentControlSpecificType.ComboBox || type == Asc.c_oAscContentControlSpecificType.DropDownList) {
                    this.labelFormName.text(type == Asc.c_oAscContentControlSpecificType.ComboBox ? this.textCombobox : this.textDropDown);
                    specProps = (type == Asc.c_oAscContentControlSpecificType.ComboBox) ? props.get_ComboBoxPr() : props.get_DropDownListPr();
                    if (specProps) {
                        this._originalListProps = specProps;
                        var count = specProps.get_ItemsCount();
                        var arr = [];
                        for (var i=0; i<count; i++) {
                            (specProps.get_ItemValue(i)!=='') && arr.push({
                                value: specProps.get_ItemValue(i),
                                name: specProps.get_ItemDisplayText(i)
                            });
                        }
                        this.list.store.reset(arr);
                        var rec = null;
                        if (arr.length>0 && this._state.internalId === this.internalId && (this._state.listValue!==undefined || this._state.listIndex!==undefined)) {
                            if (this._state.listIndex!==undefined) {
                                (this._state.listIndex>=this.list.store.length) && (this._state.listIndex = this.list.store.length-1);
                            }
                            rec = (this._state.listValue!==undefined) ? this.list.store.findWhere({value: this._state.listValue}) : this.list.store.at(this._state.listIndex);
                        }
                        if (rec) {
                            this.list.selectRecord(rec);
                            this.list.scrollToRecord(rec);
                        } else {
                            this.txtNewValue.setValue('');
                            this._state.listValue = this._state.listIndex = undefined;
                        }
                    }
                    this.disableListButtons();
                } else if (type == Asc.c_oAscContentControlSpecificType.CheckBox) {
                    specProps = props.get_CheckBoxPr();
                    this._originalCheckProps = specProps;
                }

                // form settings
                var formPr = props.get_FormPr();
                if (formPr) {
                    this._originalFormProps = formPr;

                    var data = [];
                    if (type == Asc.c_oAscContentControlSpecificType.CheckBox)
                        data = this.api.asc_GetCheckBoxFormKeys();
                    else if (type == Asc.c_oAscContentControlSpecificType.Picture) {
                        data = this.api.asc_GetPictureFormKeys();
                        this.labelFormName.text(this.textImage);
                    } else
                        data = this.api.asc_GetTextFormKeys();
                    if (!this._state.arrKey || this._state.arrKey.length!==data.length || _.difference(this._state.arrKey, data).length>0) {
                        var arr = [];
                        data.forEach(function(item) {
                            arr.push({ displayValue: item,  value: item });
                        });
                        this.cmbKey.setData(arr);
                        this._state.arrKey=data;
                    }

                    val = formPr.get_Key();
                    if (this._state.Key!==val) {
                        this.cmbKey.setValue(val ? val : '');
                        this._state.Key=val;
                    }

                    if (val) {
                        val = this.api.asc_GetFormsCountByKey(val);
                        connected = (val>1);
                    }
                    connected && this.labelConnectedFields.text(this.textConnected + ': ' + val);

                    val = formPr.get_HelpText();
                    if (this._state.help!==val) {
                        this.textareaHelp.setValue(val ? val : '');
                        this._state.help=val;
                    }

                    if (type == Asc.c_oAscContentControlSpecificType.CheckBox && specProps) {
                        val = specProps.get_GroupKey();
                        var ischeckbox = (typeof val !== 'string');
                        if (!ischeckbox) {
                            data = this.api.asc_GetRadioButtonGroupKeys();
                            if (!this._state.arrGroupKey || this._state.arrGroupKey.length!==data.length || _.difference(this._state.arrGroupKey, data).length>0) {
                                var arr = [];
                                data.forEach(function(item) {
                                    arr.push({ displayValue: item,  value: item });
                                });
                                this.cmbGroupKey.setData(arr);
                                this._state.arrGroupKey=data;
                            }

                            if (this._state.groupKey!==val) {
                                this.cmbGroupKey.setValue(val ? val : '');
                                this._state.groupKey=val;
                            }
                        }

                        this.labelFormName.text(ischeckbox ? this.textCheckbox : this.textRadiobox);
                    }
                }

                var formTextPr = props.get_TextFormPr();
                if (formTextPr) {
                    this._originalTextFormProps = formTextPr;

                    this.labelFormName.text(this.textField);
                    val = formTextPr.get_Comb();
                    if ( this._state.Comb!==val ) {
                        this.chComb.setValue(!!val, true);
                        this._state.Comb=val;
                    }

                    this.btnColor.setDisabled(!val);

                    this.spnWidth.setDisabled(!val);
                    val = formTextPr.get_Width();
                    if ( (val===undefined || this._state.Width===undefined)&&(this._state.Width!==val) || Math.abs(this._state.Width-val)>0.1) {
                        this.spnWidth.setValue(val!==0 && val!==undefined ? Common.Utils.Metric.fnRecalcFromMM(val * 25.4 / 20 / 72.0) : -1, true);
                        this._state.Width=val;
                    }

                    val = this.api.asc_GetTextFormAutoWidth();
                    if ( (this._state.WidthPlaceholder!==val) || Math.abs(this._state.WidthPlaceholder-val)>0.01) {
                        this.spnWidth.setDefaultValue(val!==undefined && val!==null ? Common.Utils.Metric.fnRecalcFromMM(val) : this.spnWidth.options.minValue);
                        this._state.WidthPlaceholder=val;
                    }

                    val = formTextPr.get_MaxCharacters();
                    this.chMaxChars.setValue(val && val>=0);
                    this.spnMaxChars.setDisabled(!val || val<0);
                    if ( (val===undefined || this._state.MaxChars===undefined)&&(this._state.MaxChars!==val) || Math.abs(this._state.MaxChars-val)>0.1) {
                        this.spnMaxChars.setValue(val && val>=0 ? val : 10, true);
                        this._state.MaxChars=val;
                    }

                    var brd = formTextPr.get_CombBorder();
                    if (brd) {
                        var color = brd.get_Color();
                        if (color) {
                            if (color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                                this.BorderColor = {color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()), effectValue: color.get_value() };
                            } else {
                                this.BorderColor = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
                            }
                        } else
                            this.BorderColor = 'transparent';
                    } else
                        this.BorderColor = 'transparent';

                    var type1 = typeof(this.BorderColor),
                        type2 = typeof(this._state.BorderColor);
                    if ( (type1 !== type2) || (type1=='object' &&
                        (this.BorderColor.effectValue!==this._state.BorderColor.effectValue || this._state.BorderColor.color.indexOf(this.BorderColor.color)<0)) ||
                        (type1!='object' && this._state.BorderColor.indexOf(this.BorderColor)<0 )) {

                        this.btnColor.setColor(this.BorderColor);
                        this.mnuColorPicker.clearSelection();
                        this.mnuNoBorder.setChecked(this.BorderColor == 'transparent', true);
                        (this.BorderColor != 'transparent') && this.mnuColorPicker.selectByRGB(typeof(this.BorderColor) == 'object' ? this.BorderColor.color : this.BorderColor,true);
                        this._state.BorderColor = this.BorderColor;
                    }
                }

                this._noApply = false;

                this.KeySettingsTd.toggleClass('padding-small', !connected);
                this.ConnectedSettings.toggleClass('hidden', !connected);
                if (this.type !== type || type == Asc.c_oAscContentControlSpecificType.CheckBox)
                    this.showHideControls(type, formTextPr, specProps);
                this.type = type;

                this._state.internalId = this.internalId;
            }
        },

        updateMetricUnit: function() {
            if (this.spinners) {
                for (var i=0; i<this.spinners.length; i++) {
                    var spinner = this.spinners[i];
                    spinner.setDefaultUnit(Common.Utils.Metric.getCurrentMetricName());
                    spinner.setStep(Common.Utils.Metric.getCurrentMetric()==Common.Utils.Metric.c_MetricUnits.pt ? 1 : 0.1);
                }
                var val = this._state.Width;
                this.spnWidth && this.spnWidth.setMinValue(Common.Utils.Metric.fnRecalcFromMM(1));
                this.spnWidth && this.spnWidth.setValue(val!==0 && val!==undefined ? Common.Utils.Metric.fnRecalcFromMM(val * 25.4 / 20 / 72.0) : -1, true);
            }
        },

        UpdateThemeColors: function() {
            if (this._initSettings) return;

            if (!this.btnColor) {
                this.btnColor = new Common.UI.ColorButton({
                    parentEl: (this.$el || $(this.el)).findById('#form-color-btn'),
                    additionalItems: [
                        this.mnuNoBorder = new Common.UI.MenuItem({
                            style: 'padding-left:20px;',
                            caption: this.textNoBorder,
                            toggleGroup: 'form-settings-no-border',
                            checkable: true
                        }), {caption: '--'}],
                    menu        : true,
                    colors: ['000000', '993300', '333300', '003300', '003366', '000080', '333399', '333333', '800000', 'FF6600',
                        '808000', '00FF00', '008080', '0000FF', '666699', '808080', 'FF0000', 'FF9900', '99CC00', '339966',
                        '33CCCC', '3366FF', '800080', '999999', 'FF00FF', 'FFCC00', 'FFFF00', '00FF00', '00FFFF', '00CCFF',
                        '993366', 'C0C0C0', 'FF99CC', 'FFCC99', 'FFFF99', 'CCFFCC', 'CCFFFF', 'C9C8FF', 'CC99FF', 'FFFFFF'
                    ],
                    paletteHeight: 94
                });
                this.lockedControls.push(this.btnColor);
                this.mnuNoBorder.on('click', _.bind(this.onNoBorderClick, this));
                this.btnColor.on('color:select', this.onColorPickerSelect.bind(this));
                this.btnColor.setMenu();
                this.mnuColorPicker = this.btnColor.getPicker();
            }
        },
        
        onHideMenus: function(menu, e, isFromInputControl){
            if (!isFromInputControl) this.fireEvent('editcomplete', this);
        },

        setLocked: function (locked) {
            this._locked = locked;
        },

        disableControls: function(disable) {
            if (this._initSettings) return;

            var me = this;
            if (this._state.DisabledControls!==(this._state.LockDelete || disable)) {
                this._state.DisabledControls = this._state.LockDelete || disable;
                _.each(this.lockedControls, function(item) {
                    item.setDisabled(me._state.DisabledControls);
                });
            }
            this.btnLockForm.setDisabled(disable);
        },

        showHideControls: function(type, textProps, specProps) {
            var textOnly = false,
                checkboxOnly = false,
                radioboxOnly = false,
                listOnly = false,
                imageOnly = false;
            if (type == Asc.c_oAscContentControlSpecificType.ComboBox || type == Asc.c_oAscContentControlSpecificType.DropDownList) {
                listOnly = !!specProps;
            } else if (type == Asc.c_oAscContentControlSpecificType.CheckBox) {
                if (specProps) {
                    checkboxOnly = (typeof specProps.get_GroupKey() !== 'string');
                    radioboxOnly = !checkboxOnly;
                }
            } else if (type == Asc.c_oAscContentControlSpecificType.Picture) {
                imageOnly = true;
            } else if (type == Asc.c_oAscContentControlSpecificType.None) {
                textOnly = !!textProps;
            }
            this.TextOnlySettings.toggleClass('hidden', !textOnly);
            this.ListOnlySettings.toggleClass('hidden', !listOnly);
            this.ImageOnlySettings.toggleClass('hidden', !imageOnly);
            this.RadioOnlySettings.toggleClass('hidden', !radioboxOnly);
            this.KeySettings.toggleClass('hidden', radioboxOnly);
            var value = (checkboxOnly || radioboxOnly);
            this.PlaceholderSettings.toggleClass('hidden', value);
            this.CheckOnlySettings.toggleClass('hidden', !value);
        },

        onSelectItem: function(listView, itemView, record) {
            this.txtNewValue.setValue(record.get('name'));
            this._state.listValue = record.get('name');
            this._state.listIndex = undefined;
            this.disableListButtons(false);
        },

        onDisconnect: function() {
            this.onKeyChanged(this.cmbKey, {value: ""});
        },

        disableListButtons: function(disabled) {
            if (disabled===undefined)
                disabled = !this.list.getSelectedRec();
            this.btnListDelete.setDisabled(disabled || this._state.DisabledControls);
            this.btnListUp.setDisabled(disabled || this._state.DisabledControls);
            this.btnListDown.setDisabled(disabled || this._state.DisabledControls);
        },

        textField: 'Text Field',
        textKey: 'Key',
        textPlaceholder: 'Placeholder',
        textTip: 'Tip',
        textMaxChars: 'Characters limit',
        textComb: 'Comb of characters',
        textWidth: 'Cell width',
        textDelete: 'Delete',
        textLock: 'Lock',
        textUnlock: 'Unlock',
        textRadiobox: 'Radio Button',
        textCheckbox: 'Checkbox',
        textCombobox: 'Combo Box',
        textDropDown: 'Dropdown',
        textImage: 'Image',
        textGroupKey: 'Group key',
        textTipAdd: 'Add new value',
        textTipDelete: 'Delete value',
        textTipUp: 'Move up',
        textTipDown: 'Move down',
        textValue: 'Value Options',
        textSelectImage: 'Select Image',
        textFromUrl:    'From URL',
        textFromFile:   'From File',
        textFromStorage: 'From Storage',
        textColor: 'Border color',
        textConnected: 'Fields connected',
        textDisconnect: 'Disconnect',
        textNoBorder: 'No border'

    }, DE.Views.FormSettings || {}));
});