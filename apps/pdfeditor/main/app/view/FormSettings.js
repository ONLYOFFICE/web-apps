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
    'text!pdfeditor/main/app/template/FormSettings.template'
], function (menuTemplate) {
    'use strict';

    PDFE.Views.FormSettings = Common.UI.BaseView.extend(_.extend({
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
                LockDelete: undefined,
                ButtonCaption: {}
            };
            this.lockedControls = [];
            this._locked = true;
            this._originalSpecProps = null;
            this._originalProps = null;
            this.defFormat = {FormatType: AscPDF.FormatType.NONE, decimal: 2, separator: AscPDF.SeparatorStyle.COMMA_DOT, negative: AscPDF.NegativeStyle.BLACK_MINUS,
                              symbol: '', location: true, dateformat: 'm/d/yy', timeformat: 0, special: AscPDF.SpecialFormatType.PHONE, regexp: '.'};
            this.render();
        },

        render: function () {
            var el = this.$el || $(this.el);
            el.html(this.template({
                scope: this
            }));
            this.TextComboSettings = el.find('.form-text-combo');
            this.ListSettings = el.find('.form-list-common');
            this.ListboxOnlySettings = el.find('.form-list');
            this.TextSettings = el.find('.form-text');
            this.ComboSettings = el.find('.form-combo');
            this.CheckSettings = el.find('.form-checkbox');
            this.RadioOnlySettings = el.find('.form-radiobox');
            this.ButtonSettings = el.find('.form-button');
            this.ButtonTextOnlySettings = el.find('.form-button-text');
            this.ImageOnlySettings = el.find('.form-image');
            this.TextSpecialSettings = el.find('.form-special');
            this.MaskSettings = el.find('.form-special-mask');
            this.DateSettings = el.find('.form-date');
            this.TimeSettings = el.find('.form-time');
            this.linkAdvanced = el.find('#form-advanced-link');
            this.RequiredSettings = el.find('#form-chb-required').closest('tr');
            this.NameSettings = el.find('.form-name');
            this.NotCheckSettings = el.find('.form-not-check');
        },

        createDelayedElements: function() {
            this._initSettings = false;

            var $markup = this.$el || $(this.el);

            var me = this;

            this.labelFormName = $markup.findById('#form-settings-name');
            this.labelStyleName = $markup.findById('#form-settings-lbl-style');
            this.labelExportName = $markup.findById('#form-settings-lbl-export');
            $markup.findById('#form-advanced-link').on('click', _.bind(this.openAdvancedSettings, this));

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

            this.cmbNumeral = new Common.UI.ComboBox({
                el          : $markup.findById('#form-combo-numeral'),
                editable    : false,
                cls         : 'input-group-nr',
                menuStyle   : 'min-width:100%;',
                data        : [
                    { value: Asc.c_oNumeralType.arabic, displayValue: this.textArabic },
                    { value: Asc.c_oNumeralType.hindi, displayValue: this.textHindi }
                    // { value: Asc.c_oNumeralType.context, displayValue: this.textContext }
                ],
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.cmbNumeral.setValue(Asc.c_oNumeralType.arabic);
            this.cmbNumeral.on('selected', this.onNumeralChanged.bind(this));
            this.lockedControls.push(this.cmbNumeral);

            this.cmbOrient = new Common.UI.ComboBox({
                el: $markup.findById('#form-combo-orient'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                style: 'width: 48px;',
                editable: false,
                data: [
                    {displayValue: '0°',   value: 0},
                    {displayValue: '90°', value: 90},
                    {displayValue: '180°', value: 180},
                    {displayValue: '270°',  value: 270}
                ],
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.cmbOrient.setValue(0);
            this.cmbOrient.on('selected', this.onOrientChanged.bind(this));
            this.lockedControls.push(this.cmbOrient);

            this.chRequired = new Common.UI.CheckBox({
                el: $markup.findById('#form-chb-required'),
                labelText: this.textRequired,
                dataHint: '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            this.chRequired.on('change', this.onChRequired.bind(this));
            this.lockedControls.push(this.chRequired);

            this.chReadonly = new Common.UI.CheckBox({
                el: $markup.findById('#form-chb-readonly'),
                labelText: this.textReadonly,
                dataHint: '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            this.chReadonly.on('change', this.onChReadonly.bind(this));
            this.lockedControls.push(this.chReadonly);

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

            this.btnLockForm = new Common.UI.Button({
                parentEl: $markup.findById('#form-btn-lock'),
                cls         : 'btn-toolbar align-left',
                iconCls     : 'toolbar__icon btn-lock',
                caption     : this.textLock,
                dataHint    : '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            this.btnLockForm.on('click', _.bind(function(btn){
                if (this.api && !this._noApply) {
                    this.api.SetFieldLocked(!this._state.LockDelete);
                    this.fireEvent('editcomplete', this);
                }
            }, this));

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

            this.textareaTip = new Common.UI.TextareaField({
                el          : $markup.findById('#form-txt-tip'),
                style       : 'width: 100%; height: 36px;',
                value       : '',
                dataHint    : '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            this.lockedControls.push(this.textareaTip);
            this.textareaTip.on('changed:after', this.onTipChanged.bind(this));
            this.textareaTip.on('inputleave', function(){ me.fireEvent('editcomplete', me);});

            this.chAutofit = new Common.UI.CheckBox({
                el: $markup.findById('#form-chb-autofit'),
                labelText: this.textAutofit,
                dataHint: '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            this.chAutofit.on('change', this.onChAutofit.bind(this));

            this.cmbFormat = new Common.UI.ComboBox({
                el: $markup.findById('#form-combo-format'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                menuAlignEl: $(this.el).parent(),
                restoreMenuHeightAndTop: 85,
                editable: false,
                data: [{ displayValue: this.textNone,  value: AscPDF.FormatType.NONE },
                    { displayValue: this.textNumber,  value: AscPDF.FormatType.NUMBER },
                    { displayValue: this.textPercent,  value: AscPDF.FormatType.PERCENTAGE },
                    { displayValue: this.textDate,  value: AscPDF.FormatType.DATE },
                    { displayValue: this.textTime,  value: AscPDF.FormatType.TIME },
                    { displayValue: this.textSpecial,  value: AscPDF.FormatType.SPECIAL },
                    { displayValue: this.textReg,  value: AscPDF.FormatType.REGULAR }],
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.lockedControls.push(this.cmbFormat);
            this.cmbFormat.setValue(AscPDF.FormatType.NONE);
            this.cmbFormat.on('selected', this.onFormatSelect.bind(this));

            this.cmbSpecial = new Common.UI.ComboBox({
                el: $markup.findById('#form-combo-special'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                menuAlignEl: $(this.el).parent(),
                restoreMenuHeightAndTop: 85,
                editable: false,
                data: [
                    { displayValue: this.textZipCode,  value: AscPDF.SpecialFormatType.ZIP_CODE },
                    { displayValue: this.textZipCode4,  value: AscPDF.SpecialFormatType.ZIP_PLUS_4 },
                    { displayValue: this.textPhone,  value: AscPDF.SpecialFormatType.PHONE },
                    { displayValue: this.textSSN,  value: AscPDF.SpecialFormatType.SSN },
                    { displayValue: this.textMask, value: -1 }],
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.cmbSpecial.setValue(AscPDF.SpecialFormatType.PHONE);
            this.lockedControls.push(this.cmbSpecial);
            this.cmbSpecial.on('selected', this.onSpecialChanged.bind(this));

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

            var arr = [];
            this.api.asc_getFieldDateFormatOptions().forEach(function(item){
                arr.push({
                    value: item,
                    displayValue: item
                });
            });
            this.cmbDateFormat = new Common.UI.ComboBox({
                el: $markup.findById('#form-cmb-date-format'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%; max-height: 190px;',
                menuAlignEl: $(this.el).parent(),
                restoreMenuHeightAndTop: 85,
                editable: false,
                data: arr,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.cmbDateFormat.setValue('');
            this.lockedControls.push(this.cmbDateFormat);
            this.cmbDateFormat.on('selected', this.onDateFormatChanged.bind(this));
            this.cmbDateFormat.on('hide:after', this.onHideMenus.bind(this));

            arr = [];
            var timearr = this.api.asc_getFieldTimeFormatOptions();
            for (let str in timearr) {
                if(timearr.hasOwnProperty(str)) {
                    arr.push({
                        value: timearr[str],
                        displayValue: str
                    });
                }
            }
            this.cmbTimeFormat = new Common.UI.ComboBox({
                el: $markup.findById('#form-cmb-time-format'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%; max-height: 190px;',
                menuAlignEl: $(this.el).parent(),
                restoreMenuHeightAndTop: 85,
                editable: false,
                data: arr,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.cmbTimeFormat.setValue('');
            this.lockedControls.push(this.cmbTimeFormat);
            this.cmbTimeFormat.on('selected', this.onTimeFormatChanged.bind(this));
            this.cmbTimeFormat.on('hide:after', this.onHideMenus.bind(this));

            // text field
            this.chPwd = new Common.UI.CheckBox({
                el: $markup.findById('#form-chb-pwd'),
                labelText: this.textPassword,
                dataHint: '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            this.chPwd.on('change', this.onChPwd.bind(this));

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

            // button
            this.cmbLayout = new Common.UI.ComboBox({
                el: $markup.findById('#form-combo-btn-layout'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: [
                    {displayValue: this.textTextOnly,   value: AscPDF.Api.Types.position.textOnly},
                    {displayValue: this.textIconOnly,   value: AscPDF.Api.Types.position.iconOnly},
                    {displayValue: this.textIconTop,   value: AscPDF.Api.Types.position.iconTextV},
                    {displayValue: this.textLabelTop,   value: AscPDF.Api.Types.position.textIconV},
                    {displayValue: this.textIconLeft,   value: AscPDF.Api.Types.position.iconTextH},
                    {displayValue: this.textLabelLeft,   value: AscPDF.Api.Types.position.textIconH},
                    {displayValue: this.textOverlay,   value: AscPDF.Api.Types.position.overlay}
                ],
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.cmbLayout.setValue(AscPDF.Api.Types.position.textOnly);
            this.cmbLayout.on('selected', this.onLayoutChanged.bind(this));
            this.lockedControls.push(this.cmbLayout);

            this.cmbBehavior = new Common.UI.ComboBox({
                el: $markup.findById('#form-combo-behavior'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: [{ displayValue: this.textNone,  value: AscPDF.BUTTON_HIGHLIGHT_TYPES.none },
                    { displayValue: this.textPush,  value: AscPDF.BUTTON_HIGHLIGHT_TYPES.push },
                    { displayValue: this.textOutline,  value: AscPDF.BUTTON_HIGHLIGHT_TYPES.outline },
                    { displayValue: this.textInvert,  value: AscPDF.BUTTON_HIGHLIGHT_TYPES.invert }],
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.cmbBehavior.setValue(AscPDF.BUTTON_HIGHLIGHT_TYPES.none);
            this.cmbBehavior.on('selected', this.onBehaviorChanged.bind(this));
            this.lockedControls.push(this.cmbBehavior);

            this.cmbState = new Common.UI.ComboBox({
                el: $markup.findById('#form-combo-state'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: [{ displayValue: this.textNormal,  value: AscPDF.APPEARANCE_TYPES.normal },
                    { displayValue: this.textDown,  value: AscPDF.APPEARANCE_TYPES.mouseDown },
                    { displayValue: this.textHover,  value: AscPDF.APPEARANCE_TYPES.rollover }],
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.cmbState.setValue(AscPDF.APPEARANCE_TYPES.normal);
            this.cmbState.on('selected', this.onStateChanged.bind(this));
            this.lockedControls.push(this.cmbState);

            this.txtLabel = new Common.UI.InputField({
                el          : $markup.findById('#form-txt-label'),
                allowBlank  : true,
                validateOnChange: false,
                validateOnBlur: false,
                style       : 'width: 100%;',
                value       : '',
                dataHint    : '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            this.lockedControls.push(this.txtLabel);
            this.txtLabel.on('changed:after', this.onLabelChanged.bind(this));
            this.txtLabel.on('inputleave', function(){ me.fireEvent('editcomplete', me);});
            this.txtLabel.cmpEl.on('focus', 'input.form-control', function() {
                setTimeout(function(){me.txtLabel._input && me.txtLabel._input.select();}, 1);
            });

            this.btnSelectImage = new Common.UI.Button({
                parentEl: $markup.findById('#form-btn-replace'),
                cls: 'btn-text-menu-default',
                caption: this.textSelect,
                style: "width:100%;",
                menu: new Common.UI.Menu({
                    style: 'min-width: 90px;',
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
            if (this.mode.canRequestInsertImage || this.mode.fileChoiceUrl && this.mode.fileChoiceUrl.indexOf("{documentType}")>-1) {
                Common.NotificationCenter.on('storage:image-insert', _.bind(this.insertImageFromStorage, this));
            } else
                this.btnSelectImage.menu.items[2].setVisible(false);

            this.btnClear = new Common.UI.Button({
                parentEl: $markup.findById('#form-btn-clear'),
                cls         : 'btn-text-default',
                style: "width:100%;",
                caption     : this.textClear,
                dataHint    : '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            this.btnClear.on('click', _.bind(this.onImageClear, this));
            this.lockedControls.push(this.btnClear);

            this.chFit = new Common.UI.CheckBox({
                el: $markup.findById('#form-chb-fit'),
                labelText: this.textFitBounds,
                dataHint: '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            this.chFit.on('change', this.onChFit.bind(this));
            this.lockedControls.push(this.chFit);

            this.cmbScale = new Common.UI.ComboBox({
                el: $markup.findById('#form-combo-scale'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: [{ displayValue: this.textAlways,  value: AscPDF.Api.Types.scaleWhen.always },
                    { displayValue: this.textNever,  value: AscPDF.Api.Types.scaleWhen.never },
                    { displayValue: this.textTooBig,  value: AscPDF.Api.Types.scaleWhen.tooBig },
                    { displayValue: this.textTooSmall,  value: AscPDF.Api.Types.scaleWhen.tooSmall }],
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.cmbScale.setValue(AscPDF.Api.Types.scaleWhen.always);
            this.lockedControls.push(this.cmbScale);
            this.cmbScale.on('selected', this.onScaleChanged.bind(this));
            this.cmbScale.on('changed:after', this.onScaleChanged.bind(this));
            this.cmbScale.on('hide:after', this.onHideMenus.bind(this));

            this.cmbHowScale = new Common.UI.ComboBox({
                el: $markup.findById('#form-combo-how-scale'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: [{ displayValue: this.textProportional,  value: AscPDF.Api.Types.scaleHow.proportional },
                    { displayValue: this.textAnamorphic,  value: AscPDF.Api.Types.scaleHow.anamorphic }],
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.cmbHowScale.setValue(AscPDF.Api.Types.scaleHow.proportional);
            this.lockedControls.push(this.cmbHowScale);
            this.cmbHowScale.on('selected', this.onHowScaleChanged.bind(this));
            this.cmbHowScale.on('hide:after', this.onHideMenus.bind(this));

            this.imagePositionPreview = $markup.findById('#form-img-example');
            this.imagePositionLabel = $markup.findById('#form-img-slider-value');
            this.imagePositionPreview_offset = this.imagePositionPreview.parent().width() - this.imagePositionPreview.width();

            this.sldrPreviewPositionX = new Common.UI.SingleSlider({
                el: $markup.findById('#form-img-slider-position-x'),
                width: 116,
                minValue: 0,
                maxValue: 100,
                value: 50
            });
            this.sldrPreviewPositionX.on('change', _.bind(this.onImagePositionChange, this, 'x'));
            this.sldrPreviewPositionX.on('changecomplete', _.bind(this.onImagePositionChangeComplete, this, 'x'));
            this.lockedControls.push(this.sldrPreviewPositionX);

            this.sldrPreviewPositionY = new Common.UI.SingleSlider({
                el: $markup.findById('#form-img-slider-position-y'),
                width: 116,
                minValue: 0,
                maxValue: 100,
                value: 50,
                direction: 'vertical'
            });
            this.sldrPreviewPositionY.on('change', _.bind(this.onImagePositionChange, this, 'y'));
            this.sldrPreviewPositionY.on('changecomplete', _.bind(this.onImagePositionChangeComplete, this, 'y'));
            this.lockedControls.push(this.sldrPreviewPositionY);

            var xValue = this.sldrPreviewPositionX.getValue(),
                yValue = this.sldrPreviewPositionY.getValue();
            this.imagePositionLabel.text(xValue + ',' + (100 - yValue));

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

        onChReadonly: function(field, newValue, oldValue, eOpts){
            if (this.api && !this._noApply) {
                this.api.SetFieldReadOnly(field.getValue()==='checked');
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

        onTipChanged: function(input, newValue, oldValue, e) {
            if (this.api && !this._noApply && (newValue!==oldValue)) {
                this.api.SetFieldTooltip(newValue);
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

        onOrientChanged: function(combo, record) {
            if (this.api && !this._noApply) {
                this._state.Orient = undefined;
                this.api.SetFieldRotate(record.value);
                this.fireEvent('editcomplete', this);
            }
        },

        onNumeralChanged: function(combo, record) {
            if (this.api && !this._noApply) {
                this._state.Numeral = undefined;
                this.api.SetFieldDigitsType(record.value);
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

        onChPwd: function(field, newValue, oldValue, eOpts){
            if (this.api && !this._noApply) {
                this._state.Pwd = undefined;
                this.api.SetTextFieldPassword(field.getValue()=='checked');
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
                this.api.SetCheckboxFieldExportValue(newValue);
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

        onLayoutChanged: function(combo, record) {
            if (this.api && !this._noApply) {
                this._state.Layout = undefined;
                this.api.SetButtonFieldLayout(record.value);
                this.fireEvent('editcomplete', this);
            }
        },

        onBehaviorChanged: function(combo, record) {
            if (this.api && !this._noApply) {
                this._state.Behavior = undefined;
                this.api.SetButtonFieldBehavior(record.value);
                this.fireEvent('editcomplete', this);
            }
        },

        onStateChanged: function(combo, record) {
            if (this.api && !this._noApply) {
                this._state.State = record.value;
                if (this._originalSpecProps) {
                    this._originalSpecProps.asc_putCurrentState(record.value);
                    this._state.ButtonLabel = this._state.ButtonCaption[record.value];
                    this.txtLabel.setValue(this._state.ButtonLabel || '');
                }
            }
        },

        onLabelChanged: function(input, newValue, oldValue, e) {
            this._state.ButtonLabel = undefined;
            if (this.api && !this._noApply && (newValue!==oldValue)) {
                this.api.SetButtonFieldLabel(newValue, this._state.State);
                if (!e.relatedTarget || (e.relatedTarget.localName != 'input' && e.relatedTarget.localName != 'textarea') || !/form-control/.test(e.relatedTarget.className))
                    this.fireEvent('editcomplete', this);
            }
        },

        onImageClear: function() {
            if (this.api && !this._noApply) {
                this.api.ClearButtonFieldImage(this._state.State);
                this.fireEvent('editcomplete', this);
            }
        },

        insertImageFromStorage: function(data) {
            if (data && data._urls && data.c=='control') {
                this._originalSpecProps && this._originalSpecProps.put_ImageUrl(data._urls[0], this._state.State);
            }
        },

        onImageSelect: function(menu, item) {
            if (item.value==1) {
                var me = this;
                (new Common.Views.ImageFromUrlDialog({
                    handler: function(result, value) {
                        if (result == 'ok') {
                            if (me._originalSpecProps) {
                                var checkUrl = value.replace(/ /g, '');
                                if (!_.isEmpty(checkUrl)) {
                                    me._originalSpecProps.put_ImageUrl(checkUrl, me._state.State);
                                }
                            }
                        }
                        me.fireEvent('editcomplete', me);
                    }
                })).show();
            } else if (item.value==2) {
                Common.NotificationCenter.trigger('storage:image-load', 'control');
            } else {
                this._originalSpecProps && this._originalSpecProps.showFileDialog(this._state.State);
                this.fireEvent('editcomplete', this);
            }
        },

        onChFit: function(field, newValue, oldValue, eOpts){
            if (this.api && !this._noApply) {
                this.api.SetButtonFieldFitBounds(field.getValue()==='checked');
                this.fireEvent('editcomplete', this);
            }
        },

        onScaleChanged: function(combo, record) {
            if (this.api && !this._noApply) {
                this._state.Scale = undefined;
                this.api.SetButtonFieldScaleWhen(record.value);
                this.fireEvent('editcomplete', this);
            }
        },

        onHowScaleChanged: function(combo, record) {
            if (this.api && !this._noApply) {
                this._state.HowScale = undefined;
                this.api.SetButtonFieldScaleHow(record.value);
                this.fireEvent('editcomplete', this);
            }
        },

        onImagePositionChange: function (type, field, newValue, oldValue) {
            var value = (this.imagePositionPreview_offset * newValue) / 100 - 1;
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
            this.imagePositionLabel.text(Math.round(this._state.imgPositionX) + ',' + Math.round(100 - this._state.imgPositionY));
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
                this.api.SetButtonFieldIconPos(this._state.imgPositionX / 100, (100 - this._state.imgPositionY) / 100);
                this.fireEvent('editcomplete', this);
            }
        },

        onFormatSelect: function(combo, record) {
            if (this.api && !this._noApply) {
                this._state.FormatType = undefined;
                this.defFormat.FormatType = record.value;
                this.applyFormatSettings(this.defFormat);
                this.fireEvent('editcomplete', this);
            }
        },

        applyFormatSettings: function(_p) {
            switch (_p.FormatType) {
                case AscPDF.FormatType.NONE:
                    this.api.ClearFieldFormat();
                    break;
                case AscPDF.FormatType.NUMBER:
                    this.api.SetFieldNumberFormat(_p.decimal, _p.separator, _p.negative, _p.symbol, _p.location);
                    break;
                case AscPDF.FormatType.PERCENTAGE:
                    this.api.SetFieldPercentageFormat(_p.decimal, _p.separator);
                    break;
                case AscPDF.FormatType.DATE:
                    this.api.SetFieldDateFormat(_p.dateformat);
                    break;
                case AscPDF.FormatType.TIME:
                    this.api.SetFieldTimeFormat(_p.timeformat);
                    break;
                case AscPDF.FormatType.SPECIAL:
                    (_p.special===-1) ? this.api.SetFieldMask(_p.mask) : this.api.SetFieldSpecialFormat(_p.special);
                    break;
                case AscPDF.FormatType.REGULAR:
                    this.api.SetFieldRegularExp(_p.regexp);
                    break;
            }
        },

        onSpecialChanged: function(combo, record) {
            if (this.api && !this._noApply) {
                this._state.SpecialType = undefined;
                if (record.value===-1) {
                    this.api.SetFieldMask('*');
                } else
                    this.api.SetFieldSpecialFormat(record.value);
            }
            this.fireEvent('editcomplete', this);
        },

        onMaskChanged: function(input, newValue, oldValue, e) {
            if (this.api && !this._noApply && (newValue!==oldValue)) {
                this._state.MaskStr = undefined;
                if (this._state.FormatType===AscPDF.FormatType.REGULAR)
                    this.api.SetFieldRegularExp(newValue)
                else if (this._state.FormatType===AscPDF.FormatType.SPECIAL)
                    this.api.SetFieldMask(newValue);
                if (!e.relatedTarget || (e.relatedTarget.localName != 'input' && e.relatedTarget.localName != 'textarea') || !/form-control/.test(e.relatedTarget.className))
                    this.fireEvent('editcomplete', this);
            }
        },

        onDateFormatChanged: function(combo, record) {
            if (this.api && !this._noApply) {
                this._state.DateFormat = undefined;
                this.api.SetFieldDateFormat(record.value);
                this.fireEvent('editcomplete', this);
            }
        },

        onTimeFormatChanged: function(combo, record) {
            if (this.api && !this._noApply) {
                this._state.TimeFormat = undefined;
                this.api.SetFieldTimeFormat(record.value);
                this.fireEvent('editcomplete', this);
            }
        },

        ChangeSettings: function(props, isShape) {
            if (this._initSettings)
                this.createDelayedElements();

            if (props) {
                this._originalProps = props;
                this._noApply = true;

                var val = props.asc_getPropLocked();
                if (this._state.LockDelete !== val) {
                    this._state.LockDelete = val;
                    this.btnLockForm.setCaption(this._state.LockDelete ? this.textUnlock : this.textLock);
                }

                this.disableControls(this._locked);

                var forceShowHide = false,
                    type = props.asc_getType(),
                    specProps = props.asc_getFieldProps();
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

                val = props.asc_getName();
                if (this._state.Name!==val) {
                    this.cmbName.setValue(val ? val : '');
                    this._state.Name=val;
                }

                val = props.asc_getTooltip();
                if (this._state.tip!==val) {
                    this.textareaTip.setValue(val ? val : '');
                    this._state.tip=val;
                }

                val = props.asc_getRequired();
                if ( this._state.Required!==val ) {
                    this.chRequired.setValue(val!==null && val!==undefined ? !!val : 'indeterminate', true);
                    this._state.Required=val;
                }

                val = props.asc_getReadOnly();
                if ( this._state.Readonly!==val ) {
                    this.chReadonly.setValue(val!==null && val!==undefined ? !!val : 'indeterminate', true);
                    this._state.Readonly=val;
                }

                val = props.asc_getRot();
                if ( this._state.Orient!==val ) {
                    this.cmbOrient.setValue(val!==null && val!==undefined ? val : '');
                    this._state.Orient=val;
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
                        isPwd = specProps.asc_getPassword(),
                        isScroll = specProps.asc_getScrollLongText(),
                        isFormatSelected = specProps.asc_getFormat() && specProps.asc_getFormat().asc_getType() !== AscPDF.FormatType.NONE;

                    var combChanged = false;
                    if ( this._state.Comb!==isComb ) {
                        this.chComb.setValue(isComb!==null && isComb!==undefined ? !!isComb : 'indeterminate', true);
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
                    this.chComb.setDisabled(isMulti || isScroll || isCharLimits || isPwd || this._state.DisabledControls);
                    this.spnCombChars.setDisabled(!isComb || this._state.DisabledControls);
                    this.chMaxChars.setDisabled(isComb || this._state.DisabledControls);
                    this.spnMaxChars.setDisabled(!isCharLimits || this._state.DisabledControls);

                    if ( this._state.Multi!==isMulti ) {
                        this.chMulti.setValue(isMulti!==null && isMulti!==undefined ? !!isMulti : 'indeterminate', true);
                        this._state.Multi=isMulti;
                    }
                    this.chMulti.setDisabled(isComb || isPwd || isFormatSelected || this._state.DisabledControls);

                    if ( this._state.Pwd!==isPwd ) {
                        this.chPwd.setValue(!!isPwd, true);
                        this._state.Pwd=isPwd;
                    }
                    this.chPwd.setDisabled(isComb || isMulti || this._state.DisabledControls);

                    if ( this._state.Scroll!==isScroll ) {
                        this.chScroll.setValue(isScroll!==null && isScroll!==undefined ? !!isScroll : 'indeterminate', true);
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
                            this.chAutofit.setValue(val!==null && val!==undefined ? !!val : 'indeterminate', true);
                            this._state.AutoFit=val;
                        }
                        this.chAutofit.setDisabled(isComb || this._state.DisabledControls);

                        let format = specProps.asc_getFormat();
                        val = format===undefined ? AscPDF.FormatType.NONE : format===null ? null : format.asc_getType(); // undefined - none, null - different types
                        if ( this._state.FormatType!==val ) {
                            this.cmbFormat.setValue((val !== null && val !== undefined) ? val : '', '');
                            this._state.FormatType=val;
                            forceShowHide = true;
                        }
                        switch (this._state.FormatType) {
                            case AscPDF.FormatType.REGULAR:
                                val = format.asc_getRegExp();
                                break;
                            case AscPDF.FormatType.SPECIAL:
                                val = format.asc_getFormat();
                                (val===undefined) && (val = -1);
                                if ( this._state.SpecialType!==val) {
                                    this.cmbSpecial.setValue(val, '');
                                    this._state.SpecialType=val;
                                    forceShowHide = true;
                                }
                                val = format.asc_getMask();
                                break;
                            case AscPDF.FormatType.DATE:
                                val = format.asc_getFormat();
                                if ( this._state.DateFormat!==val ) {
                                    this.cmbDateFormat.setValue(val, this.txtCustom);
                                    this._state.DateFormat=val;
                                }
                                break;
                            case AscPDF.FormatType.TIME:
                                val = format.asc_getFormat();
                                if ( this._state.TimeFormat!==val ) {
                                    this.cmbTimeFormat.setValue(val, this.txtCustom);
                                    this._state.TimeFormat=val;
                                }
                                break;
                        }

                        if ((this._state.FormatType===AscPDF.FormatType.REGULAR || this._state.FormatType===AscPDF.FormatType.SPECIAL) && this._state.MaskStr !== val) {
                            this.txtMask.setValue(val ? val : '');
                            this._state.MaskStr = val;
                        }
                    }
                    this.cmbFormat.setDisabled(type===AscPDF.FIELD_TYPES.text && this._state.Multi || this._state.DisabledControls);
                }

                if (type == AscPDF.FIELD_TYPES.combobox && specProps) {
                    val = specProps.asc_getEditable();
                    if ( this._state.CustomText!==val ) {
                        this.chCustomText.setValue(val!==null && val!==undefined ? !!val : 'indeterminate', true);
                        this._state.CustomText=val;
                    }
                }

                if (type == AscPDF.FIELD_TYPES.listbox && specProps) {
                    val = specProps.asc_getMultipleSelection();
                    if ( this._state.Multisel!==val ) {
                        this.chMultisel.setValue(val!==null && val!==undefined ? !!val : 'indeterminate', true);
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
                            if (options[i]!=='') {
                                val = _.isArray(options[i]) && options[i].length ? options[i][0] : options[i];
                                arr.push({
                                    value: val,
                                    name: val
                                });
                            }
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
                            this.chCommit.setValue(val!==null && val!==undefined ? !!val : 'indeterminate', true);
                            this._state.Commit=val;
                        }
                    }
                    this.disableListButtons();
                }

                if (type === AscPDF.FIELD_TYPES.button) {
                    // this.labelFormName.text(props.is_Signature() ? this.textSignature : this.textImage);
                    this.labelFormName.text(this.textButton);
                    if (specProps) {
                        var layout = specProps.asc_getLayout();
                        if (this._state.Layout!==layout) {
                            this.cmbLayout.setValue(layout, '');
                            this._state.Layout=layout;
                        }

                        val = specProps.asc_getBehavior();
                        if (this._state.Behavior!==val) {
                            this.cmbBehavior.setValue(val, '');
                            this._state.Behavior=val;
                            this.cmbState.setDisabled(val!==AscPDF.BUTTON_HIGHLIGHT_TYPES.push || this._state.DisabledControls);
                        }
                        if (this._state.Behavior===AscPDF.BUTTON_HIGHLIGHT_TYPES.push) {
                            val = specProps.asc_getCurrentState();
                            if (this._state.State!==val) {
                                this.cmbState.setValue(val, '');
                                this._state.State=val;
                            }
                            this._state.ButtonCaption = {};
                            this._state.ButtonCaption[AscPDF.APPEARANCE_TYPES.normal] = specProps.asc_getNormalCaption();
                            this._state.ButtonCaption[AscPDF.APPEARANCE_TYPES.mouseDown] = specProps.asc_getDownCaption();
                            this._state.ButtonCaption[AscPDF.APPEARANCE_TYPES.rollover] = specProps.asc_getHoverCaption();
                        } else {
                            this._state.State = AscPDF.APPEARANCE_TYPES.normal;
                            this.cmbState.setValue(this._state.State);
                            this._state.ButtonCaption = {};
                            this._state.ButtonCaption[this._state.State] = specProps.asc_getNormalCaption();
                        }

                        if (layout!==AscPDF.Api.Types.position.iconOnly) {
                            if (this._state.ButtonLabel !== this._state.ButtonCaption[this._state.State]) {
                                this._state.ButtonLabel = this._state.ButtonCaption[this._state.State];
                                this.txtLabel.setValue(this._state.ButtonLabel || '');
                            }
                        }

                        if (layout!==AscPDF.Api.Types.position.textOnly) {
                            specProps.put_DivId('form-icon-img');

                            val = specProps.asc_getScaleWhen();
                            if (this._state.Scale!==val) {
                                this.cmbScale.setValue(val, '');
                                this._state.Scale=val;
                            }

                            val = specProps.asc_getScaleHow();
                            if (this._state.HowScale!==val) {
                                this.cmbHowScale.setValue(val, '');
                                this._state.HowScale=val;
                            }

                            val = specProps.asc_getIconPos();
                            if (val) {
                                var x = val.X * 100,
                                    y = 100 - val.Y * 100;
                                if (this._state.imgPositionX !== x) {
                                    this.sldrPreviewPositionX.setValue(x);
                                    this._state.imgPositionX = x;
                                }
                                if (this._state.imgPositionY !== y) {
                                    this.sldrPreviewPositionY.setValue(y);
                                    this._state.imgPositionY = y;
                                }
                                this.imagePositionLabel.text(Math.round(this._state.imgPositionX) + ',' + Math.round(100 - this._state.imgPositionY));
                                val = (this.imagePositionPreview_offset * this._state.imgPositionX) / 100 - 1;
                                this.imagePositionPreview.css({'left': val + 'px'});
                                val = (this.imagePositionPreview_offset * this._state.imgPositionY) / 100 - 1;
                                this.imagePositionPreview.css({'top': val + 'px'});
                            }

                            val = specProps.asc_getFitBounds();
                            if ( this._state.Fit!==val ) {
                                this.chFit.setValue(val!==null && val!==undefined ? !!val : 'indeterminate', true);
                                this._state.Fit=val;
                            }
                            this.cmbHowScale.setDisabled(this._state.Scale === AscPDF.Api.Types.scaleWhen.never || this._state.DisabledControls);
                        }
                    }
                }

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
                            this.chDefValue.setValue(val!==null && val!==undefined ? !!val : 'indeterminate', true);
                            this._state.DefValue=val;
                        }

                        if (type == AscPDF.FIELD_TYPES.radiobutton) {
                            val = specProps.asc_getRadiosInUnison();
                            if ( this._state.Unison!==val ) {
                                this.chUnison.setValue(val!==null && val!==undefined ? !!val : 'indeterminate', true);
                                this._state.Unison=val;
                            }
                        }
                    }
                } else {
                    val = props.asc_getDigitsType();
                    if ( this._state.Numeral!==val ) {
                        this.cmbNumeral.setValue(val!==null && val!==undefined ? val : '');
                        this._state.Numeral=val;
                    }
                }

                this._noApply = false;

                if (this.type !== type || type === AscPDF.FIELD_TYPES.button || forceShowHide)
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

        openAdvancedSettings: function(e) {
            if (this.linkAdvanced.hasClass('disabled')) return;

            var me = this;
            (new PDFE.Views.FormatSettingsDialog({
                api: me.api,
                handler: function(result, settings) {
                    settings && me.applyFormatSettings(settings);
                    this.fireEvent('editcomplete', this);
                },
                props: this._originalSpecProps
            })).show();
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
                isPwd = this._state.Pwd,
                isScroll = this._state.Scroll;
            this.chAutofit.setDisabled(isComb || this._state.DisabledControls);
            this.chMulti.setDisabled(isComb || isPwd || this.type===AscPDF.FIELD_TYPES.text && this._state.FormatType!== AscPDF.FormatType.NONE || this._state.DisabledControls);
            this.chScroll.setDisabled(isComb || this._state.DisabledControls);
            this.chPwd.setDisabled(isComb || isMulti || this._state.DisabledControls);
            this.cmbFormat.setDisabled(this.type===AscPDF.FIELD_TYPES.text && isMulti || this._state.DisabledControls);

            this.chComb.setDisabled(isMulti || isScroll || isPwd || this.chMaxChars.getValue()!=='checked' || this._state.DisabledControls);
            this.spnCombChars.setDisabled(!isComb || this._state.DisabledControls);
            this.chMaxChars.setDisabled(isComb || this._state.DisabledControls);
            this.spnMaxChars.setDisabled(isComb || this.chMaxChars.getValue()!=='checked' || this._state.DisabledControls);
            this.cmbHowScale.setDisabled(this._state.Scale === AscPDF.Api.Types.scaleWhen.never || this._state.DisabledControls);
            this.cmbState.setDisabled(this._state.Behavior!==AscPDF.BUTTON_HIGHLIGHT_TYPES.push || this._state.DisabledControls);
            this.linkAdvanced.toggleClass('disabled', disable);
            this.btnLockForm.setDisabled(disable);
        },

        showHideControls: function(type, specProps) {
            var isCombobox = type === AscPDF.FIELD_TYPES.combobox,
                isText = type === AscPDF.FIELD_TYPES.text,
                isListbox = type === AscPDF.FIELD_TYPES.listbox,
                isCheck = type === AscPDF.FIELD_TYPES.checkbox,
                isRadio = type === AscPDF.FIELD_TYPES.radiobutton,
                isButton = type === AscPDF.FIELD_TYPES.button,
                isImage = isButton && (specProps.asc_getLayout()!==AscPDF.Api.Types.position.textOnly),
                isButtonText = isButton && (specProps.asc_getLayout()!==AscPDF.Api.Types.position.iconOnly);
            this.NameSettings.toggleClass('hidden', type===null);
            this.TextComboSettings.toggleClass('hidden', !(isCombobox || isText));
            this.ListSettings.toggleClass('hidden', !(isCombobox || isListbox));
            this.TextSettings.toggleClass('hidden', !isText);
            this.ComboSettings.toggleClass('hidden', !isCombobox);
            this.ListboxOnlySettings.toggleClass('hidden', !isListbox);
            this.CheckSettings.toggleClass('hidden', !(isCheck || isRadio));
            this.RadioOnlySettings.toggleClass('hidden', !isRadio);
            this.ButtonSettings.toggleClass('hidden', !isButton);
            this.RequiredSettings.toggleClass('hidden', isButton);
            this.ImageOnlySettings.toggleClass('hidden', !isImage);
            this.ButtonTextOnlySettings.toggleClass('hidden', !isButtonText);
            this.TextSpecialSettings.toggleClass('hidden', !(isCombobox || isText) || this._state.FormatType!==AscPDF.FormatType.SPECIAL);
            this.MaskSettings.toggleClass('hidden', !(isCombobox || isText) || !(this._state.FormatType===AscPDF.FormatType.REGULAR ||
                                                                                 this._state.FormatType===AscPDF.FormatType.SPECIAL && this._state.SpecialType===-1));
            this.DateSettings.toggleClass('hidden', !(isCombobox || isText) || this._state.FormatType!==AscPDF.FormatType.DATE);
            this.TimeSettings.toggleClass('hidden', !(isCombobox || isText) || this._state.FormatType!==AscPDF.FormatType.TIME);
            this.NotCheckSettings.toggleClass('hidden', isCheck || isRadio);
        }

    }, PDFE.Views.FormSettings || {}));
});