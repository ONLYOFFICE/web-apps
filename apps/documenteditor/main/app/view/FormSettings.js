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

            this._arrWidthRule = [
                {displayValue: this.textAuto,    value: Asc.CombFormWidthRule.Auto},
                {displayValue: this.textAtLeast, value: Asc.CombFormWidthRule.AtLeast},
                {displayValue: this.textExact,   value: Asc.CombFormWidthRule.Exact}
            ];

            this.render();
        },

        render: function () {
            var el = this.$el || $(this.el);
            el.html(this.template({
                scope: this
            }));

            this.TextOnlySettings = el.find('.form-textfield');
            this.TextOnlySimpleSettings = el.find('.form-textfield-simple'); // text field not in complex form
            this.TextOnlySettingsMask = el.find('.form-textfield-mask');
            this.PlaceholderSettings = el.find('.form-placeholder');
            this.KeySettings = el.find('.form-keyfield');
            this.KeySettingsTd = this.KeySettings.find('td');
            this.CheckOnlySettings = el.find('.form-checkbox');
            this.RadioOnlySettings = el.find('.form-radiobox');
            this.ListOnlySettings = el.find('.form-list');
            this.ImageOnlySettings = el.find('.form-image');
            this.ConnectedSettings = el.find('.form-connected');
            this.FixedSettings = el.find('.form-fixed');
            this.NotInComplexSettings = el.find('.form-not-in-complex');
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
                data: [],
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
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
                value       : '',
                dataHint    : '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            this.lockedControls.push(this.txtPlaceholder);
            this.txtPlaceholder.on('changed:after', this.onPlaceholderChanged.bind(this));
            this.txtPlaceholder.on('inputleave', function(){ me.fireEvent('editcomplete', me);});
            this.txtPlaceholder.cmpEl.on('focus', 'input.form-control', function() {
                setTimeout(function(){me.txtPlaceholder._input && me.txtPlaceholder._input.select();}, 1);
            });

            this.txtTag = new Common.UI.InputField({
                el          : $markup.findById('#form-txt-tag'),
                allowBlank  : true,
                validateOnChange: false,
                validateOnBlur: false,
                style       : 'width: 100%;',
                value       : '',
                dataHint    : '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            this.lockedControls.push(this.txtTag);
            this.txtTag.on('changed:after', this.onTagChanged.bind(this));
            this.txtTag.on('inputleave', function(){ me.fireEvent('editcomplete', me);});
            this.txtTag.cmpEl.on('focus', 'input.form-control', function() {
                setTimeout(function(){me.txtTag._input && me.txtTag._input.select();}, 1);
            });

            this.textareaHelp = new Common.UI.TextareaField({
                el          : $markup.findById('#form-txt-help'),
                style       : 'width: 100%; height: 36px;',
                value       : '',
                dataHint    : '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            this.lockedControls.push(this.textareaHelp);
            this.textareaHelp.on('changed:after', this.onHelpChanged.bind(this));
            this.textareaHelp.on('inputleave', function(){ me.fireEvent('editcomplete', me);});

            // Text props
            this.chMaxChars = new Common.UI.CheckBox({
                el: $markup.findById('#form-chb-max-chars'),
                labelText: this.textMaxChars,
                dataHint: '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
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
                minValue: 1,
                allowDecimal: false,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.spnMaxChars.on('change', this.onMaxCharsChange.bind(this));
            this.spnMaxChars.on('inputleave', function(){ me.fireEvent('editcomplete', me);});

            this.chComb = new Common.UI.CheckBox({
                el: $markup.findById('#form-chb-comb'),
                labelText: this.textComb,
                dataHint: '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            this.chComb.on('change', this.onChCombChanged.bind(this));
            this.lockedControls.push(this.chComb);

            this.cmbWidthRule = new Common.UI.ComboBox({
                el: $markup.findById('#form-combo-width-rule'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 82px;',
                editable: false,
                data: this._arrWidthRule,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.cmbWidthRule.setValue('');
            this.cmbWidthRule.on('selected', this.onWidthRuleSelect.bind(this));

            this.spnWidth = new Common.UI.MetricSpinner({
                el: $markup.findById('#form-spin-width'),
                step: .1,
                width: 82,
                defaultUnit : "cm",
                value: '',
                allowAuto: false,
                maxValue: 55.88,
                minValue: 0.1,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.spinners.push(this.spnWidth);
            this.spnWidth.on('change', this.onWidthChange.bind(this));
            this.spnWidth.on('inputleave', function(){ me.fireEvent('editcomplete', me);});

            this.chAutofit = new Common.UI.CheckBox({
                el: $markup.findById('#form-chb-autofit'),
                labelText: this.textAutofit,
                dataHint: '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            this.chAutofit.on('change', this.onChAutofit.bind(this));

            this.chMulti = new Common.UI.CheckBox({
                el: $markup.findById('#form-chb-multiline'),
                labelText: this.textMulti,
                dataHint: '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            this.chMulti.on('change', this.onChMulti.bind(this));

            this.chRequired = new Common.UI.CheckBox({
                el: $markup.findById('#form-chb-required'),
                labelText: this.textRequired,
                dataHint: '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            this.chRequired.on('change', this.onChRequired.bind(this));
            this.lockedControls.push(this.chRequired);

            this.chFixed = new Common.UI.CheckBox({
                el: $markup.findById('#form-chb-fixed'),
                labelText: this.textFixed,
                dataHint: '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            this.chFixed.on('change', this.onChFixed.bind(this));
            this.lockedControls.push(this.chFixed);

            // Radio props
            this.cmbGroupKey = new Common.UI.ComboBox({
                el: $markup.findById('#form-combo-group-key'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: true,
                data: [],
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
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
                validateOnChange: true,
                validateOnBlur: false,
                style       : 'width: 100%;',
                value       : '',
                dataHint    : '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            }).on ('changing', function (input, value) {
                me.btnListAdd.setDisabled(value.length<1 || me._state.DisabledControls);
            });
            this.lockedControls.push(this.txtNewValue);
            this.txtNewValue.on('inputleave', function(){ me.fireEvent('editcomplete', me);});
            this.txtNewValue._input.on('keydown', _.bind(this.onNewValueKeydown, this));
            this.txtNewValue.cmpEl.on('focus', 'input.form-control', function() {
                setTimeout(function(){me.txtNewValue._input && me.txtNewValue._input.select();}, 1);
            });

            this.list = new Common.UI.ListView({
                el: $markup.findById('#form-list-list'),
                store: new Common.UI.DataViewStore(),
                emptyText: '',
                template: _.template(['<div class="listview inner" style=""></div>'].join('')),
                itemTemplate: _.template([
                    '<div id="<%= id %>" class="list-item" style="width: 100%;display:inline-block;">',
                    // '<div style="width:65px;display: inline-block;vertical-align: middle; overflow: hidden; text-overflow: ellipsis;white-space: pre;margin-right: 5px;"><%= name %></div>',
                    '<div style="width:145px;display: inline-block;vertical-align: middle; overflow: hidden; text-overflow: ellipsis;white-space: pre;"><%= Common.Utils.String.htmlEncode(name) %></div>',
                    '</div>'
                ].join(''))
            });
            this.list.on('item:select', _.bind(this.onSelectItem, this));
            this.lockedControls.push(this.list);

            this.btnListAdd = new Common.UI.Button({
                parentEl: $markup.findById('#form-list-add'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-zoomup',
                hint: this.textTipAdd,
                dataHint: '1',
                dataHintDirection: 'left',
                dataHintOffset: 'big'
            });
            this.btnListAdd.on('click', _.bind(this.onAddItem, this));

            this.btnListDelete = new Common.UI.Button({
                parentEl: $markup.findById('#form-list-delete'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon cc-remove',
                hint: this.textTipDelete,
                dataHint: '1',
                dataHintDirection: 'left',
                dataHintOffset: 'big'
            });
            this.btnListDelete.on('click', _.bind(this.onDeleteItem, this));
            this.lockedControls.push(this.btnListDelete);

            this.btnListUp = new Common.UI.Button({
                parentEl: $markup.findById('#form-list-up'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-arrow-up',
                hint: this.textTipUp,
                dataHint: '1',
                dataHintDirection: 'left',
                dataHintOffset: 'big'
            });
            this.btnListUp.on('click', _.bind(this.onMoveItem, this, true));
            this.lockedControls.push(this.btnListUp);

            this.btnListDown = new Common.UI.Button({
                parentEl: $markup.findById('#form-list-down'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-arrow-down',
                hint: this.textTipDown,
                dataHint: '1',
                dataHintDirection: 'left',
                dataHintOffset: 'big'
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
                }),
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.lockedControls.push(this.btnSelectImage);
            this.btnSelectImage.menu.on('item:click', _.bind(this.onImageSelect, this));
            this.btnSelectImage.menu.items[2].setVisible(this.mode.canRequestInsertImage || this.mode.fileChoiceUrl && this.mode.fileChoiceUrl.indexOf("{documentType}")>-1);

            this.btnRemForm = new Common.UI.Button({
                parentEl: $markup.findById('#form-btn-delete'),
                cls         : 'btn-toolbar',
                iconCls     : 'toolbar__icon cc-remove',
                caption     : this.textDelete,
                style       : 'text-align: left;',
                dataHint    : '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
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
                style       : 'text-align: left;',
                dataHint    : '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            this.btnLockForm.on('click', _.bind(function(btn){
                if (this.api  && !this._noApply) {
                    var props   = this._originalProps || new AscCommon.CContentControlPr();
                    props.put_Lock(!this._state.LockDelete ? Asc.c_oAscSdtLockType.SdtLocked : Asc.c_oAscSdtLockType.Unlocked);
                    this.api.asc_SetContentControlProperties(props, this.internalId);
                }
            }, this));

            this.chAspect = new Common.UI.CheckBox({
                el: $markup.findById('#form-chb-aspect'),
                labelText: this.textAspect,
                dataHint: '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            this.chAspect.on('change', this.onChAspect.bind(this));

            this.cmbScale = new Common.UI.ComboBox({
                el: $markup.findById('#form-combo-scale'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: [{ displayValue: this.textAlways,  value: Asc.c_oAscPictureFormScaleFlag.Always },
                    { displayValue: this.textNever,  value: Asc.c_oAscPictureFormScaleFlag.Never },
                    { displayValue: this.textTooBig,  value: Asc.c_oAscPictureFormScaleFlag.Bigger },
                    { displayValue: this.textTooSmall,  value: Asc.c_oAscPictureFormScaleFlag.Smaller }],
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.cmbScale.setValue(Asc.c_oAscPictureFormScaleFlag.Always);
            this.lockedControls.push(this.cmbScale);
            this.cmbScale.on('selected', this.onScaleChanged.bind(this));
            this.cmbScale.on('changed:after', this.onScaleChanged.bind(this));
            this.cmbScale.on('hide:after', this.onHideMenus.bind(this));

            this.imagePositionPreview = $markup.findById('#form-img-example');
            this.imagePositionLabel = $markup.findById('#form-img-slider-value');

            this.sldrPreviewPositionX = new Common.UI.SingleSlider({
                el: $('#form-img-slider-position-x'),
                width: 116,
                minValue: 0,
                maxValue: 100,
                value: 50
            });
            this.sldrPreviewPositionX.on('change', _.bind(this.onImagePositionChange, this, 'x'));
            this.sldrPreviewPositionX.on('changecomplete', _.bind(this.onImagePositionChangeComplete, this, 'x'));

            this.sldrPreviewPositionY = new Common.UI.SingleSlider({
                el: $('#form-img-slider-position-y'),
                width: 116,
                minValue: 0,
                maxValue: 100,
                value: 50,
                direction: 'vertical'
            });
            this.sldrPreviewPositionY.on('change', _.bind(this.onImagePositionChange, this, 'y'));
            this.sldrPreviewPositionY.on('changecomplete', _.bind(this.onImagePositionChangeComplete, this, 'y'));

            var xValue = this.sldrPreviewPositionX.getValue(),
                yValue = this.sldrPreviewPositionY.getValue();
            this.imagePositionLabel.text(xValue + ',' + yValue);

            this.cmbFormat = new Common.UI.ComboBox({
                el: $markup.findById('#form-combo-format'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: [{ displayValue: this.textNone,  value: Asc.TextFormFormatType.None },
                    { displayValue: this.textDigits,  value: Asc.TextFormFormatType.Digit },
                    { displayValue: this.textLetters,  value: Asc.TextFormFormatType.Letter },
                    { displayValue: this.textMask,  value: Asc.TextFormFormatType.Mask },
                    { displayValue: this.textReg,  value: Asc.TextFormFormatType.RegExp }],
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.lockedControls.push(this.cmbFormat);
            this.cmbFormat.setValue(Asc.TextFormFormatType.None);
            this.cmbFormat.on('selected', this.onFormatSelect.bind(this));

            this.txtMask = new Common.UI.InputField({
                el          : $markup.findById('#form-txt-mask'),
                allowBlank  : true,
                validateOnChange: false,
                validateOnBlur: false,
                style       : 'width: 100%;',
                value       : '',
                dataHint    : '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            this.lockedControls.push(this.txtMask);
            this.txtMask.on('changed:after', this.onMaskChanged.bind(this));
            this.txtMask.on('inputleave', function(){ me.fireEvent('editcomplete', me);});
            this.txtMask.cmpEl.on('focus', 'input.form-control', function() {
                setTimeout(function(){me.txtMask._input && me.txtMask._input.select();}, 1);
            });

            this.txtFormatSymbols = new Common.UI.InputField({
                el          : $markup.findById('#form-txt-format-symbols'),
                allowBlank  : true,
                validateOnChange: false,
                validateOnBlur: false,
                style       : 'width: 100%;',
                value       : '',
                dataHint    : '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            this.lockedControls.push(this.txtFormatSymbols);
            this.txtFormatSymbols.on('changed:after', this.onFormatSymbolsChanged.bind(this));
            this.txtFormatSymbols.on('inputleave', function(){ me.fireEvent('editcomplete', me);});
            this.txtFormatSymbols.cmpEl.on('focus', 'input.form-control', function() {
                setTimeout(function(){me.txtFormatSymbols._input && me.txtFormatSymbols._input.select();}, 1);
            });

            this.updateMetricUnit();
            this.UpdateThemeColors();
        },

        setApi: function(api) {
            this.api = api;
            if (this.api) {
                // this.api.asc_registerCallback('asc_onParaSpacingLine', _.bind(this._onLineSpacing, this));
            }
            Common.NotificationCenter.on('storage:image-insert', _.bind(this.insertImageFromStorage, this));
            return this;
        },

        setMode: function(mode) {
            this.mode = mode;
        },

        onKeyChanged: function(combo, record) {
            if (this.api && !this._noApply) {
                this._state.Key = undefined;
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

        onTagChanged: function(input, newValue, oldValue, e) {
            if (this.api && !this._noApply && (newValue!==oldValue)) {
                var props   = this._originalProps || new AscCommon.CContentControlPr();
                props.put_Tag(newValue);
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
            this.spnMaxChars.setDisabled(!checked || this._state.FormatType===Asc.TextFormFormatType.Mask || this._state.DisabledControls);
            if (!checked) {
                this.chComb.setValue(false, true);
                this.spnWidth.setDisabled(true);
                this.cmbWidthRule.setDisabled(true);
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
            }
        },

        onChCombChanged: function(field, newValue, oldValue, eOpts){
            var checked = (field.getValue()=='checked');
            if (checked) {
                this.chMaxChars.setValue(true, true);
                this.spnMaxChars.setDisabled(false || this._state.FormatType===Asc.TextFormFormatType.Mask || this._state.DisabledControls);
            }
            this.cmbWidthRule.setDisabled(!checked || this._state.Fixed || this._state.DisabledControls);
            this.spnWidth.setDisabled(!checked || this._state.WidthRule===Asc.CombFormWidthRule.Auto || this._state.DisabledControls);
            if (this.api && !this._noApply) {
                var props   = this._originalProps || new AscCommon.CContentControlPr();
                var formTextPr = this._originalTextFormProps || new AscCommon.CSdtTextFormPr();
                formTextPr.put_Comb(checked);
                if (checked) {
                    formTextPr.put_MaxCharacters(this.spnMaxChars.getNumberValue() || 10);
                    if (this.spnWidth.getValue()) {
                        var value = this.spnWidth.getNumberValue();
                        formTextPr.put_Width(value<=0 ? 0 : parseInt(Common.Utils.Metric.fnRecalcToMM(value) * 72 * 20 / 25.4 + 0.5));
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
                    formTextPr.put_Width(value<=0 ? 0 : parseInt(Common.Utils.Metric.fnRecalcToMM(value) * 72 * 20 / 25.4 + 0.5));
                    formTextPr.put_WidthRule(this.cmbWidthRule.getValue());
                } else
                    formTextPr.put_Width(0);

                props.put_TextFormPr(formTextPr);
                this.api.asc_SetContentControlProperties(props, this.internalId);
            }
        },

        onWidthRuleSelect: function(combo, record) {
            if (this.api && !this._noApply) {
                var props   = this._originalProps || new AscCommon.CContentControlPr();
                var formTextPr = this._originalTextFormProps || new AscCommon.CSdtTextFormPr();
                formTextPr.put_WidthRule(record.value);
                if (record.value === Asc.CombFormWidthRule.Auto)
                    formTextPr.put_Width(this._state.WidthPlaceholder);
                props.put_TextFormPr(formTextPr);
                this.api.asc_SetContentControlProperties(props, this.internalId);
                this.fireEvent('editcomplete', this);
            }
        },

        onChRequired: function(field, newValue, oldValue, eOpts){
            var checked = (field.getValue()=='checked');
            if (this.api && !this._noApply) {
                var props   = this._originalProps || new AscCommon.CContentControlPr();
                var formPr = this._originalFormProps || new AscCommon.CSdtFormPr();
                formPr.put_Required(checked);
                props.put_FormPr(formPr);
                this.api.asc_SetContentControlProperties(props, this.internalId);
                this.fireEvent('editcomplete', this);
            }
        },

        onChAutofit: function(field, newValue, oldValue, eOpts){
            var checked = (field.getValue()=='checked');
            if (this.api && !this._noApply) {
                var props   = this._originalProps || new AscCommon.CContentControlPr();
                var formTextPr = this._originalTextFormProps || new AscCommon.CSdtTextFormPr();
                formTextPr.put_AutoFit(checked);
                props.put_TextFormPr(formTextPr);
                this.api.asc_SetContentControlProperties(props, this.internalId);
                this.fireEvent('editcomplete', this);
            }
        },

        onChMulti: function(field, newValue, oldValue, eOpts){
            var checked = (field.getValue()=='checked');
            if (this.api && !this._noApply) {
                var props   = this._originalProps || new AscCommon.CContentControlPr();
                var formTextPr = this._originalTextFormProps || new AscCommon.CSdtTextFormPr();
                formTextPr.put_MultiLine(checked);
                props.put_TextFormPr(formTextPr);
                this.api.asc_SetContentControlProperties(props, this.internalId);
                this.fireEvent('editcomplete', this);
            }
        },

        onChFixed: function(field, newValue, oldValue, eOpts){
            if (this.api && !this._noApply) {
                var props   = this._originalProps || new AscCommon.CContentControlPr();
                this.cmbWidthRule.setDisabled(!this._state.Comb || field.getValue()=='checked' || this._state.DisabledControls);
                this.api.asc_SetFixedForm(this.internalId, field.getValue()=='checked');
                this.fireEvent('editcomplete', this);
             }
        },

        onChAspect: function(field, newValue, oldValue, eOpts){
            if (this.api && !this._noApply) {
                var props   = this._originalProps || new AscCommon.CContentControlPr();
                var pictPr = this._originalPictProps || new AscCommon.CSdtPictureFormPr();
                pictPr.put_ConstantProportions(field.getValue()=='checked');
                props.put_PictureFormPr(pictPr);
                this.api.asc_SetContentControlProperties(props, this.internalId);
                this.fireEvent('editcomplete', this);
            }
        },

        onScaleChanged: function(combo, record) {
            if (this.api && !this._noApply) {
                var props   = this._originalProps || new AscCommon.CContentControlPr();
                var pictPr = this._originalPictProps || new AscCommon.CSdtPictureFormPr();
                pictPr.put_ScaleFlag(record.value);
                props.put_PictureFormPr(pictPr);
                this.api.asc_SetContentControlProperties(props, this.internalId);
                this.fireEvent('editcomplete', this);
            }
        },

        onGroupKeyChanged: function(combo, record) {
            if (this.api && !this._noApply && record.value!=='') {
                var props   = this._originalProps || new AscCommon.CContentControlPr();
                var specProps = this._originalCheckProps || new AscCommon.CSdtCheckBoxPr();
                specProps.put_GroupKey(record.value);
                props.put_CheckBoxPr(specProps);
                this.api.asc_SetContentControlProperties(props, this.internalId);
                this.fireEvent('editcomplete', this);
            } else {
                this.cmbGroupKey.setValue(this._state.groupKey ? this._state.groupKey : '');
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
            if (data && data._urls && data.c=='control') {
                this.setImageUrl(data._urls[0], data.token);
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

        onColorBGSelect: function(btn, color) {
            this.BackgroundColor = color;
            this._state.BackgroundColor = undefined;

            var props   = this._originalProps || new AscCommon.CContentControlPr();
            var formPr = this._originalFormProps || new AscCommon.CSdtFormPr();

            if (this.api) {
                if (color === 'transparent') {
                    formPr.put_Shd(false);
                } else {
                    formPr.put_Shd(true, Common.Utils.ThemeColor.getRgbColor(color));
                }
                props.put_FormPr(formPr);
                this.api.asc_SetContentControlProperties(props, this.internalId);
            }

            this.fireEvent('editcomplete', this);
        },

        onColorPickerSelect: function(btn, color) {
            this.BorderColor = color;
            this._state.BorderColor = undefined;

            if (this.api && !this._noApply) {
                var props   = this._originalProps || new AscCommon.CContentControlPr();
                var formPr = this._originalFormProps || new AscCommon.CSdtFormPr();
                if (color == 'transparent') {
                    formPr.put_Border();
                } else {
                    var brd = formPr.get_Border();
                    if (!brd)
                        brd = new Asc.asc_CTextBorder();
                    brd.put_Value(1);
                    brd.put_Color(Common.Utils.ThemeColor.getRgbColor(color));
                    formPr.put_Border(brd);
                }
                props.put_FormPr(formPr);
                this.api.asc_SetContentControlProperties(props, this.internalId);
                this.fireEvent('editcomplete', this);
            }
        },

        onNoBorderClick: function(item) {
            this.BorderColor = 'transparent';
            this._state.BorderColor = undefined;

            if (this.api && !this._noApply) {
                var props   = this._originalProps || new AscCommon.CContentControlPr();
                var formPr = this._originalFormProps || new AscCommon.CSdtFormPr();
                formPr.put_Border();
                props.put_FormPr(formPr);
                this.api.asc_SetContentControlProperties(props, this.internalId);
                this.fireEvent('editcomplete', this);
            }
        },

        onFormatSelect: function(combo, record) {
            if (this.api && !this._noApply) {
                var props   = this._originalProps || new AscCommon.CContentControlPr();
                var formTextPr = this._originalTextFormProps || new AscCommon.CSdtTextFormPr();
                switch (record.value) {
                    case Asc.TextFormFormatType.None:
                        formTextPr.put_NoneFormat();
                        break;
                    case Asc.TextFormFormatType.Digit:
                        formTextPr.put_DigitFormat();
                        break;
                    case Asc.TextFormFormatType.Letter:
                        formTextPr.put_LetterFormat();
                        break;
                    case Asc.TextFormFormatType.Mask:
                        this.txtMask.setValue('*');
                        formTextPr.put_MaskFormat(this.txtMask.getValue());
                        break;
                    case Asc.TextFormFormatType.RegExp:
                        this.txtMask.setValue('.');
                        formTextPr.put_RegExpFormat(this.txtMask.getValue());
                        break;
                }
                props.put_TextFormPr(formTextPr);
                this.api.asc_SetContentControlProperties(props, this.internalId);
                this.fireEvent('editcomplete', this);
            }
        },

        onMaskChanged: function(input, newValue, oldValue, e) {
            if (this.api && !this._noApply && (newValue!==oldValue)) {
                var props   = this._originalProps || new AscCommon.CContentControlPr();
                var formTextPr = this._originalTextFormProps || new AscCommon.CSdtTextFormPr();
                if (this.cmbFormat.getValue()===Asc.TextFormFormatType.Mask) {
                    formTextPr.put_MaskFormat(newValue);
                } else if (this.cmbFormat.getValue()===Asc.TextFormFormatType.RegExp) {
                    formTextPr.put_RegExpFormat(newValue);
                }
                props.put_TextFormPr(formTextPr);
                this.api.asc_SetContentControlProperties(props, this.internalId);
                if (!e.relatedTarget || (e.relatedTarget.localName != 'input' && e.relatedTarget.localName != 'textarea') || !/form-control/.test(e.relatedTarget.className))
                    this.fireEvent('editcomplete', this);
            }
        },

        onFormatSymbolsChanged: function(input, newValue, oldValue, e) {
            if (this.api && !this._noApply && (newValue!==oldValue)) {
                var props   = this._originalProps || new AscCommon.CContentControlPr();
                var formTextPr = this._originalTextFormProps || new AscCommon.CSdtTextFormPr();
                formTextPr.put_FormatSymbols(newValue);
                props.put_TextFormPr(formTextPr);
                this.api.asc_SetContentControlProperties(props, this.internalId);
                if (!e.relatedTarget || (e.relatedTarget.localName != 'input' && e.relatedTarget.localName != 'textarea') || !/form-control/.test(e.relatedTarget.className))
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

                val = props.get_Tag();
                if (this._state.tag !== val) {
                    this.txtTag.setValue(val ? val : '');
                    this._state.tag = val;
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
                            this.list.selectRecord(rec, this.txtNewValue._input.is(':focus'));
                            this.list.scrollToRecord(rec);
                        } else if (!this.txtNewValue._input.is(':focus')) {
                            this.txtNewValue.setValue('');
                            this.btnListAdd.setDisabled(true);
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

                    if (type == Asc.c_oAscContentControlSpecificType.Picture) 
                        this.labelFormName.text(this.textImage);

                    var data = this.api.asc_GetFormKeysByType(type);
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

                    val = formPr.get_Required();
                    if ( this._state.Required!==val ) {
                        this.chRequired.setValue(!!val, true);
                        this._state.Required=val;
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

                    if (type !== Asc.c_oAscContentControlSpecificType.Picture) {
                        val = formPr.get_Fixed();
                        if ( this._state.Fixed!==val ) {
                            this.chFixed.setValue(!!val, true);
                            this._state.Fixed=val;
                        }
                    }

                    var brd = formPr.get_Border();
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

                    var shd = formPr.get_Shd();
                    if (shd) {
                        var bgColor = shd.get_Color();
                        if (bgColor) {
                            if (bgColor.get_type() === Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                                this.BackgroundColor = {color: Common.Utils.ThemeColor.getHexColor(bgColor.get_r(), bgColor.get_g(), bgColor.get_b()), effectValue: bgColor.get_value() };
                            } else {
                                this.BackgroundColor = Common.Utils.ThemeColor.getHexColor(bgColor.get_r(), bgColor.get_g(), bgColor.get_b());
                            }
                        } else
                            this.BackgroundColor = 'transparent';
                    } else {
                        this.BackgroundColor = 'transparent';
                    }

                    type1 = typeof(this.BackgroundColor);
                    type2 = typeof(this._state.BackgroundColor);
                    if ( (type1 !== type2) || (type1 === 'object' &&
                        (this.BackgroundColor.effectValue!==this._state.BackgroundColor.effectValue || this._state.BackgroundColor.color.indexOf(this.BackgroundColor.color)<0)) ||
                        (type1 !== 'object' && this._state.BackgroundColor.indexOf(this.BackgroundColor)<0 )) {

                        this.btnBGColor.setColor(this.BackgroundColor);
                        if ( typeof(this.BackgroundColor) == 'object' ) {
                            var isselected = false;
                            for (i=0; i<10; i++) {
                                if ( Common.Utils.ThemeColor.ThemeValues[i] === this.BackgroundColor.effectValue ) {
                                    this.mnuBGColorPicker.select(this.BackgroundColor, true);
                                    isselected = true;
                                    break;
                                }
                            }
                            if (!isselected) this.mnuBGColorPicker.clearSelection();
                        } else
                            this.mnuBGColorPicker.select(this.BackgroundColor,true);

                        this._state.BackgroundColor = this.BackgroundColor;
                    }

                }

                var pictPr = props.get_PictureFormPr();
                if (pictPr) {
                    this._originalPictProps = pictPr;
                    val = pictPr.get_ConstantProportions();
                    if ( this._state.Aspect!==val ) {
                        this.chAspect.setValue(!!val, true);
                        this._state.Aspect=val;
                    }

                    val = pictPr.get_ScaleFlag();
                    if (this._state.scaleFlag!==val) {
                        this.cmbScale.setValue(val);
                        this._state.scaleFlag=val;
                    }

                    val = pictPr.get_ShiftX() * 100;
                    if (this._state.imgPositionX !== val) {
                        this.sldrPreviewPositionX.setValue(val);
                        this._state.imgPositionX = val;
                    }
                    val = pictPr.get_ShiftY() * 100;
                    if (this._state.imgPositionY !== val) {
                        this.sldrPreviewPositionY.setValue(val);
                        this._state.imgPositionY = val;
                    }
                    this.imagePositionLabel.text(Math.round(this._state.imgPositionX) + ',' + Math.round(this._state.imgPositionY));
                    val = ((130 - 80) * this._state.imgPositionX) / 100 - 1;
                    this.imagePositionPreview.css({'left': val + 'px'});
                    val = ((130 - 80) * this._state.imgPositionY) / 100 - 1;
                    this.imagePositionPreview.css({'top': val + 'px'});

                    this.chAspect.setDisabled(this._state.scaleFlag === Asc.c_oAscPictureFormScaleFlag.Never || this._state.DisabledControls);
                    var disableSliders = this._state.scaleFlag === Asc.c_oAscPictureFormScaleFlag.Always && !this._state.Aspect || this._state.DisabledControls;
                    this.sldrPreviewPositionX.setDisabled(disableSliders);
                    this.sldrPreviewPositionY.setDisabled(disableSliders);
                }

                var formTextPr = props.get_TextFormPr();
                var needUpdateTextControls = !!formTextPr && !this._originalTextFormProps || !formTextPr && !!this._originalTextFormProps;
                if (formTextPr) {
                    this._originalTextFormProps = formTextPr;

                    this.labelFormName.text(this.textField);
                    val = formTextPr.get_Comb();
                    if ( this._state.Comb!==val ) {
                        this.chComb.setValue(!!val, true);
                        this._state.Comb=val;
                    }

                    val = formTextPr.get_MultiLine();
                    if ( this._state.Multi!==val ) {
                        this.chMulti.setValue(!!val, true);
                        this._state.Multi=val;
                    }
                    this.chMulti.setDisabled(!this._state.Fixed || this._state.Comb || this._state.DisabledControls);

                    val = formTextPr.get_AutoFit();
                    if ( this._state.AutoFit!==val ) {
                        this.chAutofit.setValue(!!val, true);
                        this._state.AutoFit=val;
                    }
                    this.chAutofit.setDisabled(!this._state.Fixed || this._state.Comb || this._state.DisabledControls);

                    this.cmbWidthRule.setDisabled(!this._state.Comb || this._state.Fixed || this._state.DisabledControls);
                    val = this._state.Fixed ? Asc.CombFormWidthRule.Exact : formTextPr.get_WidthRule();
                    if ( this._state.WidthRule!==val ) {
                        this.cmbWidthRule.setValue((val !== null && val !== undefined) ? val : '');
                        this._state.WidthRule=val;
                    }

                    val = this.api.asc_GetTextFormAutoWidth();
                    if ( (this._state.WidthPlaceholder!==val) || Math.abs(this._state.WidthPlaceholder-val)>0.01) {
                        this.spnWidth.setDefaultValue(val!==undefined && val!==null ? Common.Utils.Metric.fnRecalcFromMM((val+1) * 25.4 / 20 / 72.0) : this.spnWidth.getMinValue());
                        this._state.WidthPlaceholder=val;
                    }

                    this.spnWidth.setDisabled(!this._state.Comb || this._state.WidthRule===Asc.CombFormWidthRule.Auto || this._state.DisabledControls);
                    val = formTextPr.get_Width();
                    val = (this._state.WidthRule===Asc.CombFormWidthRule.Auto || val===undefined || val===0) ? this._state.WidthPlaceholder : val;
                    if ((val===undefined || this._state.Width===undefined)&&(this._state.Width!==val) || Math.abs(this._state.Width-val)>0.1) {
                        this.spnWidth.setValue(val!==0 && val!==undefined ? Common.Utils.Metric.fnRecalcFromMM(val * 25.4 / 20 / 72.0) : '', true);
                        this._state.Width=val;
                    }

                    val = formTextPr.get_FormatType();
                    if ( this._state.FormatType!==val ) {
                        this.cmbFormat.setValue((val !== null && val !== undefined) ? val : Asc.TextFormFormatType.None);
                        this._state.FormatType=val;
                    }

                    if ( this._state.FormatType===Asc.TextFormFormatType.Mask || this._state.FormatType===Asc.TextFormFormatType.RegExp ) {
                        val = (this._state.FormatType===Asc.TextFormFormatType.Mask) ? formTextPr.get_MaskFormat() : formTextPr.get_RegExpFormat();
                        this.txtMask.setValue((val !== null && val !== undefined) ? val : '');
                        this._state.Mask=val;
                    }

                    val = formTextPr.get_FormatSymbols();
                    if ( this._state.FormatSymbols!==val ) {
                        this.txtFormatSymbols.setValue((val !== null && val !== undefined) ? val : '');
                        this._state.FormatSymbols=val;
                    }

                    val = formTextPr.get_MaxCharacters();
                    this.chMaxChars.setValue(val && val>=0);
                    this.chMaxChars.setDisabled(this._state.FormatType===Asc.TextFormFormatType.Mask || this._state.DisabledControls);
                    this.spnMaxChars.setDisabled(!val || val<0 || this._state.FormatType===Asc.TextFormFormatType.Mask || this._state.DisabledControls);
                    if ( (val===undefined || this._state.MaxChars===undefined)&&(this._state.MaxChars!==val) || Math.abs(this._state.MaxChars-val)>0.1) {
                        this.spnMaxChars.setValue(val && val>=0 ? val : 10, true);
                        this._state.MaxChars=val;
                    }
                } else
                    this._originalTextFormProps = null;

                var isComplex = !!props.get_ComplexFormPr(), // is complex form
                    isSimpleInsideComplex = !!this.api.asc_GetCurrentComplexForm() && !isComplex;

                if (isComplex) {
                    this.labelFormName.text(this.textComplex);
                }
                this._noApply = false;

                this.KeySettingsTd.toggleClass('padding-small', !connected);
                this.ConnectedSettings.toggleClass('hidden', !connected);
                this.TextOnlySettingsMask.toggleClass('hidden', !(type === Asc.c_oAscContentControlSpecificType.None && !!formTextPr) || !(this._state.FormatType===Asc.TextFormFormatType.Mask || this._state.FormatType===Asc.TextFormFormatType.RegExp));
                if (this.type !== type || this.isSimpleInsideComplex !== isSimpleInsideComplex || needUpdateTextControls || type == Asc.c_oAscContentControlSpecificType.CheckBox)
                    this.showHideControls(type, formTextPr, specProps, isSimpleInsideComplex);
                this.type = type;
                this._state.isSimpleInsideComplex = isSimpleInsideComplex;

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
                this.spnWidth && this.spnWidth.setValue(val!==0 && val!==undefined ? Common.Utils.Metric.fnRecalcFromMM(val * 25.4 / 20 / 72.0) : '', true);
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
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'big'
                });
                this.lockedControls.push(this.btnColor);
                this.mnuNoBorder.on('click', _.bind(this.onNoBorderClick, this));
                this.btnColor.on('color:select', this.onColorPickerSelect.bind(this));
                this.btnColor.setMenu();
                this.mnuColorPicker = this.btnColor.getPicker();
            }
            if (!this.btnBGColor) {
                this.btnBGColor = new Common.UI.ColorButton({
                    parentEl: $('#form-background-color-btn'),
                    transparent: true,
                    menu: true,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'big'
                });
                this.lockedControls.push(this.btnBGColor);
                this.btnBGColor.on('color:select', _.bind(this.onColorBGSelect, this));
                this.btnBGColor.setMenu();
                this.mnuBGColorPicker = this.btnBGColor.getPicker();
            }
            this.mnuBGColorPicker.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
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
            this.chMaxChars.setDisabled(this._state.FormatType===Asc.TextFormFormatType.Mask || this._state.DisabledControls);
            this.spnMaxChars.setDisabled(this.chMaxChars.getValue()!=='checked' || this._state.FormatType===Asc.TextFormFormatType.Mask || this._state.DisabledControls);
            this.cmbWidthRule.setDisabled(!this._state.Comb || this._state.Fixed || this._state.DisabledControls);
            this.spnWidth.setDisabled(!this._state.Comb || this._state.WidthRule===Asc.CombFormWidthRule.Auto || this._state.DisabledControls);
            this.chMulti.setDisabled(!this._state.Fixed || this._state.Comb || this._state.DisabledControls);
            this.chAutofit.setDisabled(!this._state.Fixed || this._state.Comb || this._state.DisabledControls);
            this.chAspect.setDisabled(this._state.scaleFlag === Asc.c_oAscPictureFormScaleFlag.Never || this._state.DisabledControls);
            var disableSliders = this._state.scaleFlag === Asc.c_oAscPictureFormScaleFlag.Always && !this._state.Aspect;
            this.sldrPreviewPositionX.setDisabled(disableSliders || this._state.DisabledControls);
            this.sldrPreviewPositionY.setDisabled(disableSliders || this._state.DisabledControls);
            this.btnListAdd.setDisabled(this.txtNewValue.length<1 || this._state.DisabledControls);
            this.btnLockForm.setDisabled(disable);
        },

        showHideControls: function(type, textProps, specProps, isSimpleInsideComplex) {
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
            } else if (type == Asc.c_oAscContentControlSpecificType.None || type == Asc.c_oAscContentControlSpecificType.Complex) {
                textOnly = !!textProps;
            }
            this.TextOnlySettings.toggleClass('hidden', !textOnly);
            this.TextOnlySimpleSettings.toggleClass('hidden', !textOnly || isSimpleInsideComplex);
            this.ListOnlySettings.toggleClass('hidden', !listOnly);
            this.ImageOnlySettings.toggleClass('hidden', !imageOnly);
            this.RadioOnlySettings.toggleClass('hidden', !radioboxOnly);
            this.KeySettings.toggleClass('hidden', radioboxOnly || isSimpleInsideComplex);
            var value = (checkboxOnly || radioboxOnly);
            this.PlaceholderSettings.toggleClass('hidden', value);
            this.CheckOnlySettings.toggleClass('hidden', !value);
            this.FixedSettings.toggleClass('hidden', imageOnly || isSimpleInsideComplex);
            this.NotInComplexSettings.toggleClass('hidden', isSimpleInsideComplex);
        },

        onSelectItem: function(listView, itemView, record) {
            if (!record) return;
            this.txtNewValue.setValue(record.get('name'));
            this._state.listValue = record.get('name');
            this._state.listIndex = undefined;
            this.btnListAdd.setDisabled(this.txtNewValue.length<1 || this._state.DisabledControls);
            this.disableListButtons();
        },

        onDisconnect: function() {
            this.onKeyChanged(this.cmbKey, {value: (this._originalProps || new AscCommon.CContentControlPr()).get_NewKey()});
        },

        disableListButtons: function() {
            var rec = this.list.getSelectedRec(),
                idx = rec ? this.list.store.indexOf(rec) : -1;

            this.btnListDelete.setDisabled(idx<0 || this._state.DisabledControls);
            this.btnListUp.setDisabled(idx<1 || this._state.DisabledControls);
            this.btnListDown.setDisabled(idx<0 || idx>this.list.store.length-2 || this._state.DisabledControls);
        },

        onImagePositionChange: function (type, field, newValue, oldValue) {
            var value = ((130 - 80) * newValue) / 100 - 1;
            if (type === 'x') {
                this.imagePositionPreview.css({'left': value + 'px'});
                this._state.imgPositionX = newValue;
            } else {
                this.imagePositionPreview.css({'top': value + 'px'});
                this._state.imgPositionY = newValue;
            }
            if (_.isUndefined(this._state.imgPositionX)) {
                this._state.imgPositionX = 50;
            } else if (_.isUndefined(this._state.imgPositionY)) {
                this._state.imgPositionY = 50;
            }
            this.imagePositionLabel.text(Math.round(this._state.imgPositionX) + ',' + Math.round(this._state.imgPositionY));
        },

        onImagePositionChangeComplete: function (type, field, newValue, oldValue) {
            if (type === 'x') {
                this._state.imgPositionX = newValue;
            } else {
                this._state.imgPositionY = newValue;
            }
            this.imgPositionApplyFunc(type);
        },

        imgPositionApplyFunc: function (type) {
            if (this.api && !this._noApply) {
                var props   = this._originalProps || new AscCommon.CContentControlPr();
                var pictPr = this._originalPictProps || new AscCommon.CSdtPictureFormPr();
                var val;
                if (type === 'x') {
                    val = this._state.imgPositionX / 100;
                    pictPr.put_ShiftX(val);
                } else {
                    val = this._state.imgPositionY / 100;
                    pictPr.put_ShiftY(val);
                }
                props.put_PictureFormPr(pictPr);
                this.api.asc_SetContentControlProperties(props, this.internalId);
                this.fireEvent('editcomplete', this);
            }
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
        textNoBorder: 'No border',
        textFixed: 'Fixed size field',
        textRequired: 'Required',
        textAutofit: 'AutoFit',
        textMulti: 'Multiline field',
        textAspect: 'Lock aspect ratio',
        textAlways: 'Always',
        textNever: 'Never',
        textTooBig: 'Image is Too Big',
        textTooSmall: 'Image is Too Small',
        textScale: 'When to scale',
        textBackgroundColor: 'Background Color',
        textTag: 'Tag',
        textAuto: 'Auto',
        textAtLeast: 'At least',
        textExact: 'Exactly',
        textFormat: 'Format',
        textMask: 'Arbitrary Mask',
        textReg: 'Regular Expression',
        textFormatSymbols: 'Allowed Symbols',
        textLetters: 'Letters',
        textDigits: 'Digits',
        textNone: 'None',
        textComplex: 'Complex Field'

    }, DE.Views.FormSettings || {}));
});