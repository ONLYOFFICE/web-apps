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
 *  FormSettings.js
 *
 *  Created on 04.03.2025
 *
 */

define([
    'text!pdfeditor/main/app/template/FormSettings.template',
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/component/ComboBox',
    'common/main/lib/component/MetricSpinner',
    'common/main/lib/component/TextareaField',
    'common/main/lib/component/CheckBox'
], function (menuTemplate, $, _, Backbone) {
    'use strict';

    PDFE.Views.FormSettings = Backbone.View.extend(_.extend({
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
            this._originalSpecProps = null;
            this._originalProps = null;

            this.render();
        },

        render: function () {
            var el = this.$el || $(this.el);
            el.html(this.template({
                scope: this
            }));
            this.PlaceholderSettings = el.find('.form-placeholder');
            this.ListSettings = el.find('.form-list-common');
            this.ListboxOnlySettings = el.find('.form-list');
            this.AutofitSettings = el.find('.form-autofit');
            this.TextSettings = el.find('.form-text');
            this.ComboSettings = el.find('.form-combo');
            this.CheckSettings = el.find('.form-checkbox');
            this.RadioOnlySettings = el.find('.form-radiobox');
        },

        createDelayedElements: function() {
            this._initSettings = false;

            var $markup = this.$el || $(this.el);

            var me = this;

            this.labelFormName = $markup.findById('#form-settings-name');
            this.labelStyleName = $markup.findById('#form-settings-lbl-style');
            this.labelExportName = $markup.findById('#form-settings-lbl-export');

            // Common props
            this.cmbName = new Common.UI.ComboBox({
                el: $markup.findById('#form-combo-name'),
                cls: 'input-group-nr',
                menuCls: 'menu-absolute',
                menuStyle: 'min-width: 195px; max-height: 190px;',
                menuAlignEl: $(this.el).parent(),
                restoreMenuHeightAndTop: 85,
                editable: true,
                data: [],
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.cmbName.setValue('');
            this.lockedControls.push(this.cmbName);
            this.cmbName.on('selected', this.onNameChanged.bind(this));
            this.cmbName.on('changed:after', this.onNameChanged.bind(this));
            this.cmbName.on('hide:after', this.onHideMenus.bind(this));

            this.chRequired = new Common.UI.CheckBox({
                el: $markup.findById('#form-chb-required'),
                labelText: this.textRequired,
                dataHint: '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            this.chRequired.on('change', this.onChRequired.bind(this));
            this.lockedControls.push(this.chRequired);

            this.cmbLineWidth = new Common.UI.ComboBox({
                el: $markup.findById('#form-combo-line-width'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: [
                    {displayValue: this.textThin,   value: 1},
                    {displayValue: this.textMedium, value: 2},
                    {displayValue: this.textThick,  value: 3}
                ],
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.cmbLineWidth.setValue(1);
            this.cmbLineWidth.on('selected', this.onLineWidthChanged.bind(this));
            this.lockedControls.push(this.cmbLineWidth);

            this.cmbLineStyle = new Common.UI.ComboBox({
                el: $markup.findById('#form-combo-line-style'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: [
                    {displayValue: this.textSolid,   value: AscPDF.BORDER_TYPES.solid},
                    {displayValue: this.textDashed,   value: AscPDF.BORDER_TYPES.dashed},
                    {displayValue: this.textUnderline,   value: AscPDF.BORDER_TYPES.underline},
                    {displayValue: this.textBeveled,   value: AscPDF.BORDER_TYPES.beveled},
                    {displayValue: this.textInset,   value: AscPDF.BORDER_TYPES.inset}
                ],
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.cmbLineStyle.setValue(AscPDF.BORDER_TYPES.solid);
            this.cmbLineStyle.on('selected', this.onLineStyleChanged.bind(this));
            this.lockedControls.push(this.cmbLineStyle);

            //Spec props
            // combobox & text field
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

            this.chAutofit = new Common.UI.CheckBox({
                el: $markup.findById('#form-chb-autofit'),
                labelText: this.textAutofit,
                dataHint: '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            this.chAutofit.on('change', this.onChAutofit.bind(this));

            // text field
            this.chMulti = new Common.UI.CheckBox({
                el: $markup.findById('#form-chb-multiline'),
                labelText: this.textMulti,
                dataHint: '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            this.chMulti.on('change', this.onChMulti.bind(this));

            this.chScroll = new Common.UI.CheckBox({
                el: $markup.findById('#form-chb-scroll'),
                labelText: this.textScroll,
                dataHint: '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            this.chScroll.on('change', this.onChScroll.bind(this));

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

            this.spnCombChars = new Common.UI.MetricSpinner({
                el: $markup.findById('#form-spin-comb-chars'),
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
            this.spnCombChars.on('change', this.onCombCharsChange.bind(this));
            this.spnCombChars.on('inputleave', function(){ me.fireEvent('editcomplete', me);});

            // combobox
            this.chCustomText = new Common.UI.CheckBox({
                el: $markup.findById('#form-chb-custom-text'),
                labelText: this.textCustomText,
                dataHint: '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            this.chCustomText.on('change', this.onChCustomText.bind(this));
            this.lockedControls.push(this.chCustomText);

            // dropdown list
            this.chMultisel = new Common.UI.CheckBox({
                el: $markup.findById('#form-chb-multisel'),
                labelText: this.textMultisel,
                dataHint: '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            this.chMultisel.on('change', this.onChMultisel.bind(this));
            this.lockedControls.push(this.chMultisel);

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
                iconCls: 'toolbar__icon btn-cc-remove',
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

            this.chCommit = new Common.UI.CheckBox({
                el: $markup.findById('#form-chb-commit'),
                labelText: this.textCommit,
                dataHint: '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            this.chCommit.on('change', this.onChCommit.bind(this));
            this.lockedControls.push(this.chCommit);

            // checkbox & radio
            this.cmbCheckStyle = new Common.UI.ComboBox({
                el: $markup.findById('#form-combo-chb-style'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: [
                    {displayValue: this.textCheck,   value: AscPDF.CHECKBOX_STYLES.check},
                    {displayValue: this.textCross,   value: AscPDF.CHECKBOX_STYLES.cross},
                    {displayValue: this.textSquare,   value: AscPDF.CHECKBOX_STYLES.square},
                    {displayValue: this.textDiamond,   value: AscPDF.CHECKBOX_STYLES.diamond},
                    {displayValue: this.textCircle,   value: AscPDF.CHECKBOX_STYLES.circle},
                    {displayValue: this.textStar,   value: AscPDF.CHECKBOX_STYLES.star}
                ],
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.cmbCheckStyle.setValue(AscPDF.BORDER_TYPES.check);
            this.cmbCheckStyle.on('selected', this.onCheckStyleChanged.bind(this));
            this.lockedControls.push(this.cmbCheckStyle);

            this.txtExport = new Common.UI.InputField({
                el          : $markup.findById('#form-txt-export'),
                allowBlank  : true,
                validateOnChange: false,
                validateOnBlur: false,
                style       : 'width: 100%;',
                value       : '',
                dataHint    : '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            this.lockedControls.push(this.txtExport);
            this.txtExport.on('changed:after', this.onExportChanged.bind(this));
            this.txtExport.on('inputleave', function(){ me.fireEvent('editcomplete', me);});
            this.txtExport.cmpEl.on('focus', 'input.form-control', function() {
                setTimeout(function(){me.txtExport._input && me.txtExport._input.select();}, 1);
            });

            this.chDefValue = new Common.UI.CheckBox({
                el: $markup.findById('#form-chb-def-value'),
                labelText: this.textCheckDefault,
                dataHint: '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            this.chDefValue.on('change', this.onChDefValue.bind(this));
            this.lockedControls.push(this.chDefValue);

            // radiobox
            this.chUnison = new Common.UI.CheckBox({
                el: $markup.findById('#form-chb-unison'),
                labelText: this.textUnison,
                dataHint: '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            this.chUnison.on('change', this.onChUnison.bind(this));
            this.lockedControls.push(this.chUnison);

            this.UpdateThemeColors();
        },

        setApi: function(api) {
            this.api = api;
            return this;
        },

        setMode: function(mode) {
            this.mode = mode;
        },

        onNameChanged: function(combo, record) {
            if (this.api && !this._noApply) {
                this._state.Name = undefined;
                this.api.SetFieldName(record.value);
                this.fireEvent('editcomplete', this);
            }
        },

        onChRequired: function(field, newValue, oldValue, eOpts){
            if (this.api && !this._noApply) {
                this.api.SetFieldRequired(field.getValue()==='checked');
                this.fireEvent('editcomplete', this);
            }
        },

        onColorBGSelect: function(btn, color) {
            this.BackgroundColor = color;
            this._state.BackgroundColor = undefined;

            if (this.api) {
                if (color === 'transparent') {
                    this.api.SetFieldBgColor();
                } else {
                    var clr = Common.Utils.ThemeColor.getRgbColor(color);
                    this.api.SetFieldBgColor(clr.get_r(), clr.get_g(), clr.get_b());
                }
            }

            this.fireEvent('editcomplete', this);
        },

        onNoFillClick: function(item) {
            this.BackgroundColor = 'transparent';
            this._state.BackgroundColor = undefined;

            if (this.api && !this._noApply) {
                this.api.SetFieldBgColor();
                this.fireEvent('editcomplete', this);
            }
        },

        onColorPickerSelect: function(btn, color) {
            this.BorderColor = color;
            this._state.BorderColor = undefined;

            if (this.api && !this._noApply) {
                if (color == 'transparent') {
                    this.api.SetFieldStrokeColor();
                } else {
                    var clr = Common.Utils.ThemeColor.getRgbColor(color);
                    this.api.SetFieldStrokeColor(clr.get_r(), clr.get_g(), clr.get_b());
                }
                this.fireEvent('editcomplete', this);
            }
        },

        onNoBorderClick: function(item) {
            this.BorderColor = 'transparent';
            this._state.BorderColor = undefined;

            if (this.api && !this._noApply) {
                this.api.SetFieldStrokeColor();
                this.fireEvent('editcomplete', this);
            }
        },

        onPlaceholderChanged: function(input, newValue, oldValue, e) {
            if (this.api && !this._noApply && (newValue!==oldValue)) {
                this.api.SetFieldPlaceholder(newValue);
                if (!e.relatedTarget || (e.relatedTarget.localName != 'input' && e.relatedTarget.localName != 'textarea') || !/form-control/.test(e.relatedTarget.className))
                    this.fireEvent('editcomplete', this);
            }
        },

        onLineWidthChanged: function(combo, record) {
            if (this.api && !this._noApply) {
                this._state.StrokeWidth = undefined;
                this.api.SetFieldStrokeWidth(record.value);
                this.fireEvent('editcomplete', this);
            }
        },

        onLineStyleChanged: function(combo, record) {
            if (this.api && !this._noApply) {
                this._state.StrokeStyle = undefined;
                this.api.SetFieldStrokeStyle(record.value);
                this.fireEvent('editcomplete', this);
            }
        },

        onSelectItem: function(listView, itemView, record) {
            if (!record) return;
            this.txtNewValue.setValue(record.get('name'));
            this._state.listValue = record.get('name');
            this._state.listIndex = undefined;
            this.btnListAdd.setDisabled(this.txtNewValue.length<1 || this._state.DisabledControls);
            this.disableListButtons();
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
                    this._state.listValue = value;
                    this._state.listIndex = undefined;
                    this.api.AddListFieldOption([value], store.length);
                }
            }
            this.fireEvent('editcomplete', this);
        },

        onDeleteItem: function(btn, eOpts){
            var rec = this.list.getSelectedRec();
            if (rec) {
                this._state.listIndex = this.list.store.indexOf(rec);
                this._state.listValue = undefined;
                this.api.RemoveListFieldOption(this._state.listIndex);
            }
            this.fireEvent('editcomplete', this);
        },

        onMoveItem: function(up) {
            var rec = this.list.getSelectedRec();
            rec && this.api.MoveListFieldOption(this.list.store.indexOf(rec), up);
            this.fireEvent('editcomplete', this);
        },

        disableListButtons: function() {
            var rec = this.list.getSelectedRec(),
                idx = rec ? this.list.store.indexOf(rec) : -1;

            this.btnListDelete.setDisabled(idx<0 || this._state.DisabledControls);
            this.btnListUp.setDisabled(idx<1 || this._state.DisabledControls);
            this.btnListDown.setDisabled(idx<0 || idx>this.list.store.length-2 || this._state.DisabledControls);
        },

        onChAutofit: function(field, newValue, oldValue, eOpts){
            if (this.api && !this._noApply) {
                this._state.AutoFit = undefined;
                this.api.SetFieldAutoFit(field.getValue()=='checked');
                this.fireEvent('editcomplete', this);
            }
        },

        onChMulti: function(field, newValue, oldValue, eOpts){
            if (this.api && !this._noApply) {
                this._state.Multi = undefined;
                this.api.SetTextFieldMultiline(field.getValue()=='checked');
                this.fireEvent('editcomplete', this);
            }
        },

        onChScroll: function(field, newValue, oldValue, eOpts){
            if (this.api && !this._noApply) {
                this._state.Scroll = undefined;
                this.api.SetTextFieldScrollLongText(field.getValue()=='checked');
                this.fireEvent('editcomplete', this);
            }
        },

        onChCustomText: function(field, newValue, oldValue, eOpts){
            if (this.api && !this._noApply) {
                this.api.SetComboboxFieldEditable(field.getValue()=='checked');
                this.fireEvent('editcomplete', this);
            }
        },

        onChMultisel: function(field, newValue, oldValue, eOpts){
            if (this.api && !this._noApply) {
                this.api.SetListboxFieldMultiSelect(field.getValue()=='checked');
                this.fireEvent('editcomplete', this);
            }
        },

        onChCommit: function(field, newValue, oldValue, eOpts){
            if (this.api && !this._noApply) {
                this.api.SetListFieldCommitOnSelChange(field.getValue()=='checked');
                this.fireEvent('editcomplete', this);
            }
        },

        onChMaxCharsChanged: function(field, newValue, oldValue, eOpts){
            var checked = (field.getValue()=='checked');
            if (this.api && !this._noApply) {
                this.api.SetTextFieldCharLimit(checked ? 10 : 0);
                this.fireEvent('editcomplete', this);
            }
        },

        onMaxCharsChange: function(field, newValue, oldValue, eOpts){
            if (this.api && !this._noApply) {
                this.api.SetTextFieldCharLimit(this.chMaxChars.getValue()==='checked' ? field.getNumberValue() || 10 : 0);
            }
        },

        onChCombChanged: function(field, newValue, oldValue, eOpts){
            if (this.api && !this._noApply) {
                this._state.Comb = undefined;
                this.api.SetTextFieldComb(field.getValue()==='checked');
                this.fireEvent('editcomplete', this);
            }
        },

        onCombCharsChange: function(field, newValue, oldValue, eOpts){
            if (this.api && !this._noApply) {
                this.api.SetTextFieldCharLimit(this.chComb.getValue()==='checked' ? field.getNumberValue() || 10 : 0);
            }
        },

        onExportChanged: function(input, newValue, oldValue, e) {
            this._state.Export = undefined;
            if (this.api && !this._noApply && (newValue!==oldValue)) {
                newValue && this.api.SetCheckboxFieldExportValue(newValue);
                if (!e.relatedTarget || (e.relatedTarget.localName != 'input' && e.relatedTarget.localName != 'textarea') || !/form-control/.test(e.relatedTarget.className))
                    this.fireEvent('editcomplete', this);
            }
        },

        onCheckStyleChanged: function(combo, record) {
            if (this.api && !this._noApply) {
                this._state.ChbStyle = undefined;
                this.api.SetCheckboxFieldStyle(record.value);
                this.fireEvent('editcomplete', this);
            }
        },

        onChDefValue: function(field, newValue, oldValue, eOpts){
            if (this.api && !this._noApply) {
                this._state.DefValue=undefined;
                this.api.SetFieldDefaultValue(field.getValue()==='checked' ? this.txtExport.getValue() : undefined);
                this.fireEvent('editcomplete', this);
            }
        },

        onChUnison: function(field, newValue, oldValue, eOpts){
            if (this.api && !this._noApply) {
                this._state.Unison=undefined;
                this.api.SetRadioFieldInUnison(field.getValue()==='checked');
                this.fireEvent('editcomplete', this);
            }
        },

        ChangeSettings: function(props, isShape) {
            if (this._initSettings)
                this.createDelayedElements();

            if (props) {
                this._originalProps = props;
                this._noApply = true;

                this.disableControls(this._locked);

                var type = props.asc_getType();
                var specProps = props.asc_getFieldProps();
                this._originalSpecProps = specProps;

                // common props
                var data = this.api.GetAvailableFieldsNames(type);
                if (!this._state.arrName || this._state.arrName.length!==data.length || _.difference(this._state.arrName, data).length>0) {
                    var arr = [];
                    data.forEach(function(item) {
                        arr.push({ displayValue: item,  value: item });
                    });
                    this.cmbName.setData(arr);
                    this._state.arrName=data;
                    this._state.Name = undefined;
                }

                var val = props.asc_getName();
                if (this._state.Name!==val) {
                    this.cmbName.setValue(val ? val : '');
                    this._state.Name=val;
                }

                val = props.asc_getRequired();
                if ( this._state.Required!==val ) {
                    this.chRequired.setValue(!!val, true);
                    this._state.Required=val;
                }

                var color = props.asc_getStroke();
                if (color) {
                    if (color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                        this.BorderColor = {color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()), effectValue: color.get_value() };
                    } else {
                        this.BorderColor = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
                    }
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

                var bgColor = props.asc_getFill();
                if (bgColor) {
                    if (bgColor.get_type() === Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                        this.BackgroundColor = {color: Common.Utils.ThemeColor.getHexColor(bgColor.get_r(), bgColor.get_g(), bgColor.get_b()), effectValue: bgColor.get_value() };
                    } else {
                        this.BackgroundColor = Common.Utils.ThemeColor.getHexColor(bgColor.get_r(), bgColor.get_g(), bgColor.get_b());
                    }
                } else
                    this.BackgroundColor = 'transparent';

                type1 = typeof(this.BackgroundColor);
                type2 = typeof(this._state.BackgroundColor);
                if ( (type1 !== type2) || (type1 === 'object' &&
                        (this.BackgroundColor.effectValue!==this._state.BackgroundColor.effectValue || this._state.BackgroundColor.color.indexOf(this.BackgroundColor.color)<0)) ||
                    (type1 !== 'object' && this._state.BackgroundColor.indexOf(this.BackgroundColor)<0 )) {

                    this.btnBGColor.setColor(this.BackgroundColor);
                    this.mnuBGColorPicker.clearSelection();
                    this.mnuNoFill.setChecked(this.BackgroundColor == 'transparent', true);
                    (this.BackgroundColor !== 'transparent') && this.mnuBGColorPicker.selectByRGB(typeof(this.BackgroundColor) == 'object' ? this.BackgroundColor.color : this.BackgroundColor,true);
                    this._state.BackgroundColor = this.BackgroundColor;
                }

                val = props.asc_getStrokeWidth();
                if (this._state.StokeWidth!==val) {
                    this.cmbLineWidth.setValue(val, '');
                    this._state.StokeWidth=val;
                }
                this.cmbLineWidth.setDisabled(this._state.DisabledControls || this._state.BorderColor==='transparent');

                val = props.asc_getStrokeStyle();
                if (this._state.StokeStyle!==val) {
                    this.cmbLineStyle.setValue(val, '');
                    this._state.StokeStyle=val;
                }
                this.cmbLineStyle.setDisabled(this._state.DisabledControls || this._state.BorderColor==='transparent');

                if (type===AscPDF.FIELD_TYPES.text && specProps) {
                    this.labelFormName.text(this.textField);

                    var isComb = specProps.asc_getComb(),
                        isMulti = specProps.asc_getMultiline(),
                        isScroll = specProps.asc_getScrollLongText();
                    var combChanged = false;
                    if ( this._state.Comb!==isComb ) {
                        this.chComb.setValue(!!isComb, true);
                        this._state.Comb=isComb;
                        combChanged = true;
                    }

                    val = specProps.asc_getCharLimit();
                    var isCharLimits = val && val>0 && !isComb;
                    if ( (val===undefined || this._state.MaxChars===undefined)&&(this._state.MaxChars!==val) || Math.abs(this._state.MaxChars-val)>0.1 || combChanged) {
                        this.spnCombChars.setValue(isComb && val && val>0 ? val : '', true);
                        this.chMaxChars.setValue(isCharLimits);
                        this.spnMaxChars.setValue(isCharLimits ? val : '', true)
                        this._state.MaxChars=val;
                    }
                    this.chComb.setDisabled(isMulti || isScroll || isCharLimits || this._state.DisabledControls);
                    this.spnCombChars.setDisabled(!isComb || this._state.DisabledControls);
                    this.chMaxChars.setDisabled(isComb || this._state.DisabledControls);
                    this.spnMaxChars.setDisabled(!isCharLimits || this._state.DisabledControls);

                    if ( this._state.Multi!==isMulti ) {
                        this.chMulti.setValue(!!isMulti, true);
                        this._state.Multi=isMulti;
                    }
                    this.chMulti.setDisabled(isComb || this._state.DisabledControls);

                    if ( this._state.Scroll!==isScroll ) {
                        this.chScroll.setValue(!!isScroll, true);
                        this._state.Scroll=isScroll;
                    }
                    this.chScroll.setDisabled(isComb || this._state.DisabledControls);
                }

                if (type===AscPDF.FIELD_TYPES.text || type == AscPDF.FIELD_TYPES.combobox) {
                    if (specProps) {
                        val = specProps.asc_getPlaceholder();
                        if (this._state.placeholder !== val) {
                            this.txtPlaceholder.setValue(val ? val : '');
                            this._state.placeholder = val;
                        }

                        val = specProps.asc_getAutoFit();
                        if ( this._state.AutoFit!==val ) {
                            this.chAutofit.setValue(!!val, true);
                            this._state.AutoFit=val;
                        }
                        this.chAutofit.setDisabled(isComb || this._state.DisabledControls);
                    }
                }

                if (type == AscPDF.FIELD_TYPES.combobox && specProps) {
                    val = specProps.asc_getEditable();
                    if ( this._state.CustomText!==val ) {
                        this.chCustomText.setValue(!!val, true);
                        this._state.CustomText=val;
                    }
                }

                if (type == AscPDF.FIELD_TYPES.listbox && specProps) {
                    val = specProps.asc_getMultipleSelection();
                    if ( this._state.Multisel!==val ) {
                        this.chMultisel.setValue(!!val, true);
                        this._state.Multisel=val;
                    }
                }

                //for list controls
                if (type == AscPDF.FIELD_TYPES.combobox || type == AscPDF.FIELD_TYPES.listbox) {
                    this.labelFormName.text(type == AscPDF.FIELD_TYPES.combobox ? this.textCombobox : this.textListBox);
                    if (specProps) {
                        var options = specProps.asc_getOptions();
                        var arr = [];
                        for (var i=0; i<options.length; i++) {
                            (options[i]!=='') && arr.push({
                                value: options[i],
                                name: options[i]
                            });
                        }
                        this.list.store.reset(arr);
                        var rec = null;
                        if (arr.length>0 && (this._state.listValue!==undefined || this._state.listIndex!==undefined)) {
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

                        val = specProps.asc_getCommitOnSelChange();
                        if ( this._state.Commit!==val ) {
                            this.chCommit.setValue(!!val, true);
                            this._state.Commit=val;
                        }
                    }
                    this.disableListButtons();
                }

                if (type == AscPDF.FIELD_TYPES.button)
                    // this.labelFormName.text(props.is_Signature() ? this.textSignature : this.textImage);
                    this.labelFormName.text(this.textImage);

                if (type == AscPDF.FIELD_TYPES.checkbox || type == AscPDF.FIELD_TYPES.radiobutton) {
                    var isCheckbox = type == AscPDF.FIELD_TYPES.checkbox;
                    this.labelFormName.text(isCheckbox ? this.textCheckbox : this.textRadiobox);
                    this.labelStyleName.text(isCheckbox ? this.textChbStyle : this.textRadioStyle);
                    this.labelExportName.text(isCheckbox ? this.textExport : this.textRadioChoice);
                    if (specProps) {
                        val = specProps.asc_getCheckboxStyle();
                        if (this._state.ChbStyle!==val) {
                            this.cmbCheckStyle.setValue(val, '');
                            this._state.ChbStyle=val;
                        }

                        val = specProps.asc_getExportValue();
                        if (this._state.Export!==val) {
                            this.txtExport.setValue(val ? val : '');
                            this._state.Export=val;
                        }

                        this.chDefValue.setCaption(isCheckbox ? this.textCheckDefault : this.textRadioDefault);
                        val = specProps.asc_getDefaultChecked();
                        if ( this._state.DefValue!==val ) {
                            this.chDefValue.setValue(!!val, true);
                            this._state.DefValue=val;
                        }

                        if (type == AscPDF.FIELD_TYPES.radiobutton) {
                            val = specProps.asc_getRadiosInUnison();
                            if ( this._state.Unison!==val ) {
                                this.chUnison.setValue(!!val, true);
                                this._state.Unison=val;
                            }
                        }
                    }
                }

                this._noApply = false;

                if (this.type !== type)
                    this.showHideControls(type, specProps);

                if (this.type !== type)
                    this.fireEvent('updatescroller', this);
                this.type = type;
            }
        },

        UpdateThemeColors: function() {
            if (this._initSettings) return;

            var config = Common.UI.simpleColorsConfig;
            if (!this.btnColor) {
                this.btnColor = new Common.UI.ColorButton({
                    parentEl: (this.$el || $(this.el)).findById('#form-color-btn'),
                    additionalItemsBefore: [
                        this.mnuNoBorder = new Common.UI.MenuItem({
                            style: Common.UI.isRTL() ? 'padding-right:20px;' : 'padding-left:20px;',
                            caption: this.textNoBorder,
                            toggleGroup: 'form-settings-no-border',
                            checkable: true
                        }), {caption: '--'}],
                    colors: config.colors,
                    dynamiccolors: config.dynamiccolors,
                    themecolors: config.themecolors,
                    effects: config.effects,
                    columns: config.columns,
                    paletteCls: config.cls,
                    paletteWidth: config.paletteWidth,
                    dataHint: '1',
                    colorHints: false,
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'big'
                });
                this.lockedControls.push(this.btnColor);
                this.mnuNoBorder.on('click', _.bind(this.onNoBorderClick, this));
                this.btnColor.on('color:select', this.onColorPickerSelect.bind(this));
                // this.btnColor.setMenu();
                this.mnuColorPicker = this.btnColor.getPicker();
            }
            if (!this.btnBGColor) {
                this.btnBGColor = new Common.UI.ColorButton({
                    parentEl: $('#form-background-color-btn'),
                    transparent: true,
                    color: 'transparent',
                    // eyeDropper: true,
                    additionalItemsBefore: [
                        this.mnuNoFill = new Common.UI.MenuItem({
                            style: Common.UI.isRTL() ? 'padding-right:20px;' : 'padding-left:20px;',
                            caption: this.textNoFill,
                            toggleGroup: 'form-settings-no-fill',
                            checkable: true
                        }), {caption: '--'}],
                    colors: config.colors,
                    dynamiccolors: config.dynamiccolors,
                    themecolors: config.themecolors,
                    effects: config.effects,
                    columns: config.columns,
                    paletteCls: config.cls,
                    paletteWidth: config.paletteWidth,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'big'
                });
                this.lockedControls.push(this.btnBGColor);
                this.mnuNoFill.on('click', _.bind(this.onNoFillClick, this));
                this.btnBGColor.on('color:select', _.bind(this.onColorBGSelect, this));
                // this.btnBGColor.setMenu();
                this.mnuBGColorPicker = this.btnBGColor.getPicker();
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
            this.btnListAdd.setDisabled(this.txtNewValue.length<1 || this._state.DisabledControls);
            var isComb = this._state.Comb,
                isMulti = this._state.Multi,
                isScroll = this._state.Scroll;
            this.chAutofit.setDisabled(isComb || this._state.DisabledControls);
            this.chMulti.setDisabled(isComb || this._state.DisabledControls);
            this.chScroll.setDisabled(isComb || this._state.DisabledControls);

            this.chComb.setDisabled(isMulti || isScroll || this.chMaxChars.getValue()!=='checked' || this._state.DisabledControls);
            this.spnCombChars.setDisabled(!isComb || this._state.DisabledControls);
            this.chMaxChars.setDisabled(isComb || this._state.DisabledControls);
            this.spnMaxChars.setDisabled(isComb || this.chMaxChars.getValue()!=='checked' || this._state.DisabledControls);
        },

        showHideControls: function(type, specProps) {
            var isCombobox = type === AscPDF.FIELD_TYPES.combobox,
                isText = type === AscPDF.FIELD_TYPES.text,
                isListbox = type === AscPDF.FIELD_TYPES.listbox,
                isCheck = type === AscPDF.FIELD_TYPES.checkbox,
                isRadio = type === AscPDF.FIELD_TYPES.radiobutton;
            this.PlaceholderSettings.toggleClass('hidden', !(isCombobox || isText));
            this.AutofitSettings.toggleClass('hidden', !(isCombobox || isText));
            this.ListSettings.toggleClass('hidden', !(isCombobox || isListbox));
            this.TextSettings.toggleClass('hidden', !isText);
            this.ComboSettings.toggleClass('hidden', !isCombobox);
            this.ListboxOnlySettings.toggleClass('hidden', !isListbox);
            this.CheckSettings.toggleClass('hidden', !(isCheck || isRadio));
            this.RadioOnlySettings.toggleClass('hidden', !isRadio);
        }

    }, PDFE.Views.FormSettings || {}));
});