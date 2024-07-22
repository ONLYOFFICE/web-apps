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
 *  PivotSettingsAdvanced.js
 *
 *  Created on 17.07.2017
 *
 */

define([
    'text!spreadsheeteditor/main/app/template/PivotSettingsAdvanced.template',
    'common/main/lib/view/AdvancedSettingsWindow',
], function (contentTemplate) { 'use strict';

    SSE.Views.PivotSettingsAdvanced = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 310,
            contentHeight: 355,
            toggleGroup: 'pivot-adv-settings-group',
            storageName: 'sse-pivot-adv-settings-category'
        },

        initialize : function(options) {
            var me = this;

            _.extend(this.options, {
                title: this.textTitle,
                items: [
                    {panelId: 'id-adv-pivot-layout',    panelCaption: this.strLayout},
                    {panelId: 'id-adv-pivot-data',      panelCaption: this.textDataSource},
                    {panelId: 'id-adv-pivot-alttext',   panelCaption: this.textAlt}
                ],
                contentTemplate:  _.template(contentTemplate)({
                    scope: this
                })
            }, options);

            this.api        = options.api;
            this.props      = options.props;

            this.options.handler = function(result, value) {
                if ( result != 'ok' || this.isRangeValid() ) {
                    if (options.handler)
                        options.handler.call(this, result, value);
                    return;
                }
                return true;
            };

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this.inputName = new Common.UI.InputField({
                el          : $('#pivot-adv-name'),
                allowBlank  : true,
                validateOnBlur: false,
                style       : 'width: 100%;'
            });

            this.radioDown = new Common.UI.RadioBox({
                el: $('#pivot-adv-radio-down'),
                labelText: this.textDown,
                name: 'asc-radio-display-field',
                checked: true
            });
            this.radioDown.on('change', _.bind(function(field, newValue, eOpts) {
                if (newValue) {
                    this.lblPageWrap.html(this.textWrapCol);
                }
            }, this));

            this.radioOver = new Common.UI.RadioBox({
                el: $('#pivot-adv-radio-over'),
                labelText: this.textOver,
                name: 'asc-radio-display-field'
            });
            this.radioOver.on('change', _.bind(function(field, newValue, eOpts) {
                if (newValue) {
                    this.lblPageWrap.html(this.textWrapRow);
                }
            }, this));

            this.chRows = new Common.UI.CheckBox({
                el: $('#pivot-adv-chk-show-rows'),
                labelText: this.textShowRows
            });

            this.chCols = new Common.UI.CheckBox({
                el: $('#pivot-adv-chk-show-columns'),
                labelText: this.textShowCols
            });

            this.numWrap = new Common.UI.MetricSpinner({
                el: $('#pivot-adv-spin-wrap'),
                step: 1,
                width: 60,
                allowDecimal: false,
                defaultUnit : "",
                value: '0',
                maxValue: 255,
                minValue: 0
            });

            this.lblPageWrap = this.$window.find('#pivot-adv-label-wrap');

            this.chHeaders = new Common.UI.CheckBox({
                el: $('#pivot-adv-chk-show-headers'),
                labelText: this.textShowHeaders
            });

            this.chAutofitColWidth = new Common.UI.CheckBox({
                el: $('#pivot-adv-chk-autofit-col-width'),
                labelText: this.textAutofitColWidth
            });

            this.txtDataRange = new Common.UI.InputFieldBtn({
                el          : $('#pivot-adv-txt-range'),
                name        : 'range',
                style       : 'width: 100%;',
                btnHint     : this.textSelectData,
                allowBlank  : true,
                blankError  : this.txtEmpty,
                validateOnChange: true
            });
            this.txtDataRange.on('button:click', _.bind(this.onSelectData, this));

            // Alt Text

            this.inputAltTitle = new Common.UI.InputField({
                el          : $('#pivot-advanced-alt-title'),
                allowBlank  : true,
                validateOnBlur: false,
                style       : 'width: 100%;'
            }).on('changed:after', function() {
                me.isAltTitleChanged = true;
            });

            this.textareaAltDescription = this.$window.find('textarea');
            this.textareaAltDescription.keydown(function (event) {
                if (event.keyCode == Common.UI.Keys.RETURN) {
                    event.stopPropagation();
                }
                me.isAltDescChanged = true;
            });

            this.afterRender();
        },

        getFocusedComponents: function() {
            return this.btnsCategory.concat([
                this.inputName, this.chRows, this.chCols, this.radioDown, this.radioOver, this.numWrap, this.chHeaders, this.chAutofitColWidth, // 0 tab
                this.txtDataRange,  // 1 tab
                this.inputAltTitle, this.textareaAltDescription  // 2 tab
            ]).concat(this.getFooterButtons());
        },

        onCategoryClick: function(btn, index) {
            Common.Views.AdvancedSettingsWindow.prototype.onCategoryClick.call(this, btn, index);

            var me = this;
            setTimeout(function(){
                switch (index) {
                    case 0:
                        me.inputName.focus();
                        break;
                    case 1:
                        me.txtDataRange.focus();
                        break;
                    case 2:
                        me.inputAltTitle.focus();
                        break;
                }
            }, 10);
        },

        afterRender: function() {
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
                var me = this;
                this.inputName.setValue(props.asc_getName());

                this.chCols.setValue(props.asc_getRowGrandTotals(), true);
                this.chRows.setValue(props.asc_getColGrandTotals(), true);

                (props.asc_getPageOverThenDown()) ? this.radioOver.setValue(true) : this.radioDown.setValue(true);
                this.lblPageWrap.html((props.asc_getPageOverThenDown()) ? this.textWrapRow : this.textWrapCol);

                this.numWrap.setValue(props.asc_getPageWrap());

                this.chHeaders.setValue(props.asc_getShowHeaders(), true);
                this.chAutofitColWidth.setValue(props.asc_getUseAutoFormatting(), true);

                var value = props.asc_getDataRef();
                this.txtDataRange.setValue((value) ? value : '');
                this.dataRangeValid = value;

                this.txtDataRange.validation = function(value) {
                    var isvalid = me.api.asc_checkDataRange(Asc.c_oAscSelectionDialogType.PivotTableData, value, false);
                    return (isvalid==Asc.c_oAscError.ID.DataRangeError) ? me.textInvalidRange : true;
                };

                value = props.asc_getTitle();
                this.inputAltTitle.setValue(value ? value : '');

                value = props.asc_getDescription();
                this.textareaAltDescription.val(value ? value : '');
            }
        },

        getSettings: function () {
            var props = new Asc.CT_pivotTableDefinition();
            props.asc_setName(this.inputName.getValue());
            props.asc_setRowGrandTotals(this.chCols.getValue() == 'checked');
            props.asc_setColGrandTotals(this.chRows.getValue() == 'checked');
            props.asc_setPageOverThenDown(this.radioOver.getValue());
            props.asc_setPageWrap(this.numWrap.getNumberValue());
            props.asc_setShowHeaders(this.chHeaders.getValue() == 'checked');
            props.asc_setUseAutoFormatting(this.chAutofitColWidth.getValue() == 'checked');
            props.asc_setDataRef(this.txtDataRange.getValue());

            if (this.isAltTitleChanged)
                props.asc_setTitle(this.inputAltTitle.getValue());
            if (this.isAltDescChanged)
                props.asc_setDescription(this.textareaAltDescription.val());

            return props;
        },

        isRangeValid: function() {
            var isvalid = true,
                txtError = '';

            if (_.isEmpty(this.txtDataRange.getValue())) {
                isvalid = false;
                txtError = this.txtEmpty;
            } else {
                isvalid = this.api.asc_checkDataRange(Asc.c_oAscSelectionDialogType.PivotTableData, this.txtDataRange.getValue());
                isvalid = (isvalid == Asc.c_oAscError.ID.No);
                !isvalid && (txtError = this.textInvalidRange);
            }
            if (!isvalid) {
                this.setActiveCategory(1);
                this.txtDataRange.showError([txtError]);
                this.txtDataRange.cmpEl.find('input').focus();
                return isvalid;
            }
            return isvalid;
        },

        onSelectData: function() {
            var me = this;
            if (me.api) {
                var handlerDlg = function(dlg, result) {
                    if (result == 'ok') {
                        me.dataRangeValid = dlg.getSettings();
                        me.txtDataRange.setValue(me.dataRangeValid);
                        me.txtDataRange.checkValidate();
                    }
                };

                var win = new SSE.Views.CellRangeDialog({
                    handler: handlerDlg
                }).on('close', function() {
                    me.show();
                });

                var xy = me.$window.offset();
                me.hide();
                win.show(xy.left + 160, xy.top + 125);
                win.setSettings({
                    api     : me.api,
                    range   : (!_.isEmpty(me.txtDataRange.getValue()) && (me.txtDataRange.checkValidate()==true)) ? me.txtDataRange.getValue() : me.dataRangeValid,
                    type    : Asc.c_oAscSelectionDialogType.PivotTableData
                });
            }
        },

        textTitle: 'Pivot Table - Advanced Settings',
        strLayout: 'Name and Layout',
        txtName: 'Name',
        textGrandTotals: 'Grand Totals',
        textShowRows: 'Show for rows',
        textShowCols: 'Show for columns',
        textDataSource: 'Data Source',
        textDataRange: 'Data Range',
        textSelectData: 'Select data',
        textAlt: 'Alternative Text',
        textAltTitle: 'Title',
        textAltDescription: 'Description',
        textAltTip: 'The alternative text-based representation of the visual object information, which will be read to the people with vision or cognitive impairments to help them better understand what information there is in the image, autoshape, chart or table.',
        txtEmpty:           'This field is required',
        textInvalidRange:   'ERROR! Invalid cells range',
        textDisplayFields: 'Display fields in report filter area',
        textDown: 'Down, then over',
        textOver: 'Over, then down',
        textWrapCol: 'Report filter fields per column',
        textWrapRow: 'Report filter fields per row',
        textHeaders: 'Field Headers',
        textShowHeaders: 'Show field headers for rows and columns',
        textAutofitColWidth: 'Autofit column widths on update'

    }, SSE.Views.PivotSettingsAdvanced || {}))
});