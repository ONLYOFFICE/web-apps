/*
 *
 * (c) Copyright Ascensio System SIA 2010-2019
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
 *  PivotSettingsAdvanced.js
 *
 *  Created by Julia Radzhabova on 17.07.2017
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([    'text!spreadsheeteditor/main/app/template/PivotSettingsAdvanced.template',
    'common/main/lib/util/utils',
    'common/main/lib/component/InputField',
    'common/main/lib/component/ComboBox',
    'common/main/lib/component/CheckBox',
    'common/main/lib/component/MetricSpinner',
    'common/main/lib/view/AdvancedSettingsWindow'
], function (contentTemplate) { 'use strict';

    SSE.Views.PivotSettingsAdvanced = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 300,
            height: 395,
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
            this.handler    = options.handler;
            this.props      = options.props;

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
                width: 85,
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

            this.txtDataRange = new Common.UI.InputField({
                el          : $('#pivot-adv-txt-range'),
                name        : 'range',
                style       : 'width: 100%;',
                allowBlank  : true,
                blankError  : this.txtEmpty,
                validateOnChange: true
            });

            this.btnSelectData = new Common.UI.Button({
                el: $('#pivot-adv-btn-data')
            });
            this.btnSelectData.on('click', _.bind(this.onSelectData, this));

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
                this.inputName.setValue(Common.Utils.String.htmlEncode(props.asc_getName()));

                this.chCols.setValue(props.asc_getRowGrandTotals(), true);
                this.chRows.setValue(props.asc_getColGrandTotals(), true);

                (props.asc_getPageOverThenDown()) ? this.radioOver.setValue(true) : this.radioDown.setValue(true);
                this.lblPageWrap.html((props.asc_getPageOverThenDown()) ? this.textWrapRow : this.textWrapCol);

                this.numWrap.setValue(props.asc_getPageWrap());

                this.chHeaders.setValue(props.asc_getShowHeaders(), true);

                // var value = props.getRange();
                // this.txtDataRange.setValue((value) ? value : '');
                // this.dataRangeValid = value;

                this.txtDataRange.validation = function(value) {
                    // var isvalid = me.api.asc_checkDataRange(Asc.c_oAscSelectionDialogType.Pivot, value, false);
                    // return (isvalid==Asc.c_oAscError.ID.DataRangeError) ? me.textInvalidRange : true;
                    return true;
                };
            }
        },

        getSettings: function () {
            var props = new Asc.CT_pivotTableDefinition();
            props.asc_setRowGrandTotals(this.chCols.getValue() == 'checked');
            props.asc_setColGrandTotals(this.chRows.getValue() == 'checked');

            return props;
        },

        onDlgBtnClick: function(event) {
            var me = this;
            var state = (typeof(event) == 'object') ? event.currentTarget.attributes['result'].value : event;
            if (state == 'ok' && this.isRangeValid()) {
                this.handler && this.handler.call(this, state,  (state == 'ok') ? this.getSettings() : undefined);
            }

            this.close();
        },

        onPrimary: function() {
            this.onDlgBtnClick('ok');
            return false;
        },

        isRangeValid: function() {
            if (this.isChart) {
                var isvalid;
                if (!_.isEmpty(this.txtDataRange.getValue())) {
                    isvalid = this.api.asc_checkDataRange(Asc.c_oAscSelectionDialogType.Pivot, this.txtDataRange.getValue());
                    if (isvalid == Asc.c_oAscError.ID.No)
                        return true;
                } else
                    this.txtDataRange.showError([this.txtEmpty]);

                this.setActiveCategory(1);
                this.txtDataRange.cmpEl.find('input').focus();
                return false;
            } else
                return true;
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
                    type    : Asc.c_oAscSelectionDialogType.Pivot
                });
            }
        },

        textTitle: 'Pivot Table - Advanced Settings',
        textCancel: 'Cancel',
        textOk: 'OK',
        strLayout: 'Name and Layout',
        txtName: 'Name',
        textGrandTotals: 'Grand Totals',
        textShowRows: 'Show for rows',
        textShowCols: 'Show for columns',
        textDataSource: 'Data Source',
        textDataRange: 'Data Range',
        textSelectData: 'Select Data',
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
        textShowHeaders: 'Show field headers for rows and columns'

    }, SSE.Views.PivotSettingsAdvanced || {}))
});