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
 *  TableSettingsAdvanced.js
 *
 *  Created on 2/27/14
 *
 */

define([
    'text!documenteditor/main/app/template/TableSettingsAdvanced.template',
    'common/main/lib/component/TableStyler',
    'common/main/lib/view/AdvancedSettingsWindow',
], function (contentTemplate) {
    'use strict';

    DE.Views.TableSettingsAdvanced = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 340,
            contentHeight: 351,
            toggleGroup: 'table-adv-settings-group',
            storageName: 'de-table-settings-adv-category'
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle,
                items: [
                    {panelId: 'id-adv-table-width',      panelCaption: this.textTable},
                    {panelId: 'id-adv-table-cell-props', panelCaption: this.textCellProps},
                    {panelId: 'id-adv-table-borders',    panelCaption: this.textBordersBackgroung},
                    {panelId: 'id-adv-table-position',   panelCaption: this.textTablePosition},
                    {panelId: 'id-adv-table-wrap',       panelCaption: this.textWrap},
                    {panelId: 'id-adv-table-alttext',    panelCaption: this.textAlt}
                ],
                contentTemplate: _.template(contentTemplate)({
                    scope: this
                })
            }, options);
            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);

            this.spinners = [];

            this._changedProps = null;
            this._cellBackground = null;

            this._state = {
                HAlignType: Asc.c_oAscXAlign.Left,
                HAlignFrom: Asc.c_oAscHAnchor.Margin,
                HPositionFrom: Asc.c_oAscHAnchor.Margin,
                VAlignType: Asc.c_oAscYAlign.Top,
                VAlignFrom: Asc.c_oAscVAnchor.Margin,
                VPositionFrom: Asc.c_oAscVAnchor.Margin,
                spnXChanged: false,
                spnYChanged: false,
                fromWrapInline: false,
                verticalPropChanged: false,
                horizontalPropChanged: false,
                alignChanged: false
            };

            this._allTable = false;
            this.TableMargins = {
                Left   : 0.19,
                Right  : 0.19,
                Top    : 0,
                Bottom : 0
            };
            this.CellMargins = {
                Left   : 0.19,
                Right  : 0.19,
                Top    : null,
                Bottom : null,
                Flag   : 0  // 0(checked) - как в таблице, 1(indeterminate) - разные значения, не определено, 2 (unchecked) - собственные
            };

            this.TableBorders = {};
            this.CellBorders = {};
            this.ChangedTableBorders = undefined; // undefined - не менялись, null - применялись пресеты, отправлять TableBorders, object - менялись отдельные границы, отправлять ChangedTableBorders
            this.ChangedCellBorders = undefined; // undefined - не менялись, null - применялись пресеты, отправлять CellBorders, object - менялись отдельные границы, отправлять ChangedCellBorders
            this.BorderSize = {ptValue: 0, pxValue: 0};

            this.TableColor = {Value: 1, Color: 'transparent'};  // value=1 - цвет определен - прозрачный или другой
            this.CellColor = {Value: 1, Color: 'transparent'};  // value=1 - цвет определен - прозрачный или другой, value=0 - цвет не определен, рисуем прозрачным
            this.IndeterminateColor = '#C8C8C8';
            this.IndeterminateSize = 4.5;

            this.tableStylerRows = this.options.tableStylerRows;
            this.tableStylerColumns = this.options.tableStylerColumns;
            this.borderProps = this.options.borderProps;
            this.pageWidth = 210;
            this._originalProps = new Asc.CTableProp(this.options.tableProps);
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);

            var me = this;

            this._marginsChange = function(field, newValue, oldValue, eOpts, source, property){
                if (source=='table')
                    this.TableMargins[property] = field.getNumberValue();
                else
                    this.CellMargins[property] = field.getNumberValue();
            };

            this.chWidth = new Common.UI.CheckBox({
                el: $('#tableadv-checkbox-width'),
                value: true,
                labelText: ''
            });
            this.chWidth.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                var value = (newValue=='checked');
                this.nfWidth.setDisabled(!value);
                this.cmbUnit.setDisabled(!value);
                if (this._changedProps) {
                    if (value && this.nfWidth.getNumberValue()>0)
                        this._changedProps.put_Width(this.cmbUnit.getValue() ? -this.nfWidth.getNumberValue() : Common.Utils.Metric.fnRecalcToMM(this.nfWidth.getNumberValue()));
                    else
                        this._changedProps.put_Width(null);
                }
            }, this));

            this.nfWidth = new Common.UI.MetricSpinner({
                el: $('#tableadv-number-width'),
                step: .1,
                width: 115,
                defaultUnit : "cm",
                value: '10 cm',
                maxValue: 55.88,
                minValue: 0
            });
            this.nfWidth.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps)
                    this._changedProps.put_Width(this.cmbUnit.getValue() ? -field.getNumberValue() : Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
            }, this));

            var currmetric = Common.Utils.Metric.getCurrentMetric();
            this.cmbUnit = new Common.UI.ComboBox({
                el          : $('#tableadv-cmb-unit'),
                style       : 'width: 115px;',
                menuStyle   : 'min-width: 115px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [
                    { value: 0, displayValue: (currmetric == Common.Utils.Metric.c_MetricUnits.pt) ? this.txtPt : ((currmetric == Common.Utils.Metric.c_MetricUnits.inch) ? this.txtInch : this.txtCm) },
                    { value: 1, displayValue: this.txtPercent }
                ],
                takeFocusOnClose: true
            });
            this.cmbUnit.on('selected', _.bind(function(combo, record) {
                if (this._changedProps) {
                    var maxwidth = Common.Utils.Metric.fnRecalcFromMM(558);
                    this.nfWidth.setDefaultUnit(record.value ? '%' : Common.Utils.Metric.getCurrentMetricName());
                    this.nfWidth.setMaxValue(record.value ? parseFloat((100 * maxwidth/this.pageWidth).toFixed(2)) : maxwidth);
                    this.nfWidth.setStep((record.value || Common.Utils.Metric.getCurrentMetric()==Common.Utils.Metric.c_MetricUnits.pt) ? 1 : 0.1);
                    this.nfWidth.setValue((record.value) ? 100*this.nfWidth.getNumberValue()/this.pageWidth : this.pageWidth*this.nfWidth.getNumberValue()/100);
                    this._changedProps.put_Width(record.value ? -this.nfWidth.getNumberValue() : Common.Utils.Metric.fnRecalcToMM(this.nfWidth.getNumberValue()));
                }
            }, this));

            this.chAllowSpacing = new Common.UI.CheckBox({
                el: $('#tableadv-checkbox-spacing'),
                value: true,
                labelText: ''
            });
            this.chAllowSpacing.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                var value = (newValue=='checked');
                if (this._changedProps) {
                    this.nfSpacing.setDisabled(!value);
                    this.ShowHideSpacing(value);

                    if (this._changedProps) {
                        if (value && this.nfSpacing.getNumberValue()>0)
                            this._changedProps.put_Spacing(Common.Utils.Metric.fnRecalcToMM(this.nfSpacing.getNumberValue()));
                        else
                            this._changedProps.put_Spacing(null);
                    }
                }
            }, this));

            this.nfSpacing = new Common.UI.MetricSpinner({
                el: $('#tableadv-number-spacing'),
                step: .1,
                width: 115,
                defaultUnit : "cm",
                value: '0.5 cm',
                maxValue: 2.14,
                minValue: 0
            });
            this.nfSpacing.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps)
                    this._changedProps.put_Spacing(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
            }, this));
            this.spinners.push(this.nfSpacing);

            this.chAutofit = new Common.UI.CheckBox({
                el: $('#tableadv-checkbox-autofit'),
                value: true,
                labelText: this.textAutofit
            });
            this.chAutofit.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    this._changedProps.put_TableLayout((field.getValue()=='checked') ? Asc.c_oAscTableLayout.AutoFit : Asc.c_oAscTableLayout. Fixed);
                }
            }, this));

            // Margins
            this.spnTableMarginTop = new Common.UI.MetricSpinner({
                el: $('#tableadv-number-margin-table-top'),
                step: .1,
                width: 85,
                defaultUnit : "cm",
                value: '0 cm',
                maxValue: 55.87,
                minValue: 0
            });
            this.spnTableMarginTop.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                this._marginsChange( field, newValue, oldValue, eOpts, 'table', 'Top');
                if (this._changedProps)  {
                    if (this._changedProps.get_DefaultMargins()===undefined)
                        this._changedProps.put_DefaultMargins(new Asc.asc_CPaddings());
                    this._changedProps.get_DefaultMargins().put_Top((this.TableMargins.Top!==null) ? Common.Utils.Metric.fnRecalcToMM(this.TableMargins.Top) : null);
                    this.TableMargins.isChanged = true;
                }
            }, this));
            this.spinners.push(this.spnTableMarginTop);

            this.spnTableMarginBottom = new Common.UI.MetricSpinner({
                el: $('#tableadv-number-margin-table-bottom'),
                step: .1,
                width: 85,
                defaultUnit : "cm",
                value: '0 cm',
                maxValue: 55.87,
                minValue: 0
            });
            this.spnTableMarginBottom.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                this._marginsChange( field, newValue, oldValue, eOpts, 'table', 'Bottom');
                if (this._changedProps)  {
                    if (this._changedProps.get_DefaultMargins()===undefined)
                        this._changedProps.put_DefaultMargins(new Asc.asc_CPaddings());
                    this._changedProps.get_DefaultMargins().put_Bottom((this.TableMargins.Bottom!==null) ? Common.Utils.Metric.fnRecalcToMM(this.TableMargins.Bottom) : null);
                    this.TableMargins.isChanged = true;
                }
            }, this));
            this.spinners.push(this.spnTableMarginBottom);

            this.spnTableMarginLeft = new Common.UI.MetricSpinner({
                el: $('#tableadv-number-margin-table-left'),
                step: .1,
                width: 85,
                defaultUnit : "cm",
                value: '0.19 cm',
                maxValue: 9.34,
                minValue: 0
            });
            this.spnTableMarginLeft.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                this._marginsChange( field, newValue, oldValue, eOpts, 'table', 'Left');
                if (this._changedProps)  {
                    if (this._changedProps.get_DefaultMargins()===undefined)
                        this._changedProps.put_DefaultMargins(new Asc.asc_CPaddings());
                    this._changedProps.get_DefaultMargins().put_Left((this.TableMargins.Left!==null) ? Common.Utils.Metric.fnRecalcToMM(this.TableMargins.Left) : null);
                    this.TableMargins.isChanged = true;
                }
            }, this));
            this.spinners.push(this.spnTableMarginLeft);

            this.spnTableMarginRight = new Common.UI.MetricSpinner({
                el: $('#tableadv-number-margin-table-right'),
                step: .1,
                width: 85,
                defaultUnit : "cm",
                value: '0.19 cm',
                maxValue: 9.34,
                minValue: 0
            });
            this.spnTableMarginRight.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                this._marginsChange( field, newValue, oldValue, eOpts, 'table', 'Right');
                if (this._changedProps)  {
                    if (this._changedProps.get_DefaultMargins()===undefined)
                        this._changedProps.put_DefaultMargins(new Asc.asc_CPaddings());
                    this._changedProps.get_DefaultMargins().put_Right((this.TableMargins.Right!==null) ? Common.Utils.Metric.fnRecalcToMM(this.TableMargins.Right) : null);
                    this.TableMargins.isChanged = true;
                }
            }, this));
            this.spinners.push(this.spnTableMarginRight);

           // Cell Margins
            var setCellFlag = function() {
                if (me.CellMargins.Flag=='indeterminate')
                    me._changedProps.get_CellMargins().put_Flag(1);
                else if (me.CellMargins.Flag=='checked')
                    me._changedProps.get_CellMargins().put_Flag(0);
                else
                    me._changedProps.get_CellMargins().put_Flag(2);
            };

            this.chCellMargins = new Common.UI.CheckBox({
                el: $('#tableadv-checkbox-margins'),
                value: true,
                labelText: this.textCheckMargins
            });
            this.chCellMargins.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if ( oldValue=='checked' && this._originalProps && this._originalProps.get_CellMargins().get_Flag()==1 ) { // позволяем выставлять значение indeterminate только если исходные значения не совпадали
                    field.setValue('indeterminate', true);
                }
                this.fillMargins.call( this, field.getValue());
                this.CellMargins.Flag = field.getValue();
                if (this._changedProps) {
                    if (this._changedProps.get_CellMargins()===undefined)
                        this._changedProps.put_CellMargins(new Asc.CMargins());
                    this._changedProps.get_CellMargins().put_Left( ( this.CellMargins.Left!== null) ? Common.Utils.Metric.fnRecalcToMM(this.CellMargins.Left) : null);
                    this._changedProps.get_CellMargins().put_Top((this.CellMargins.Top!==null) ? Common.Utils.Metric.fnRecalcToMM(this.CellMargins.Top) : null);
                    this._changedProps.get_CellMargins().put_Bottom((this.CellMargins.Bottom!==null) ? Common.Utils.Metric.fnRecalcToMM(this.CellMargins.Bottom) : null);
                    this._changedProps.get_CellMargins().put_Right((this.CellMargins.Right!==null) ? Common.Utils.Metric.fnRecalcToMM(this.CellMargins.Right) : null);
                    setCellFlag();
                }
            }, this));

            this.spnMarginTop = new Common.UI.MetricSpinner({
                el: $('#tableadv-number-margin-top'),
                step: .1,
                width: 85,
                defaultUnit : "cm",
                value: '0 cm',
                maxValue: 55.87,
                minValue: 0
            });
            this.spnMarginTop.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                this._marginsChange( field, newValue, oldValue, eOpts, 'cell', 'Top');
                if (this._changedProps)  {
                    if (this._changedProps.get_CellMargins()===undefined)
                        this._changedProps.put_CellMargins(new Asc.CMargins());
                    this._changedProps.get_CellMargins().put_Top((this.CellMargins.Top!==null) ? Common.Utils.Metric.fnRecalcToMM(this.CellMargins.Top) : null);
                    setCellFlag();
                }
            }, this));
            this.spinners.push(this.spnMarginTop);

            this.spnMarginBottom = new Common.UI.MetricSpinner({
                el: $('#tableadv-number-margin-bottom'),
                step: .1,
                width: 85,
                defaultUnit : "cm",
                value: '0 cm',
                maxValue: 55.87,
                minValue: 0
            });
            this.spnMarginBottom.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                this._marginsChange( field, newValue, oldValue, eOpts, 'cell', 'Bottom');
                if (this._changedProps)  {
                    if (this._changedProps.get_CellMargins()===undefined)
                        this._changedProps.put_CellMargins(new Asc.CMargins());
                    this._changedProps.get_CellMargins().put_Bottom((this.CellMargins.Bottom!==null) ? Common.Utils.Metric.fnRecalcToMM(this.CellMargins.Bottom) : null);
                    setCellFlag();
                }
            }, this));
            this.spinners.push(this.spnMarginBottom);

            this.spnMarginLeft = new Common.UI.MetricSpinner({
                el: $('#tableadv-number-margin-left'),
                step: .1,
                width: 85,
                defaultUnit : "cm",
                value: '0.19 cm',
                maxValue: 9.34,
                minValue: 0
            });
            this.spnMarginLeft.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                this._marginsChange( field, newValue, oldValue, eOpts, 'cell', 'Left');
                if (this._changedProps)  {
                    if (this._changedProps.get_CellMargins()===undefined)
                        this._changedProps.put_CellMargins(new Asc.CMargins());
                    this._changedProps.get_CellMargins().put_Left((this.CellMargins.Left!==null) ? Common.Utils.Metric.fnRecalcToMM(this.CellMargins.Left) : null);
                    setCellFlag();
                }
            }, this));
            this.spinners.push(this.spnMarginLeft);

            this.spnMarginRight = new Common.UI.MetricSpinner({
                el: $('#tableadv-number-margin-right'),
                step: .1,
                width: 85,
                defaultUnit : "cm",
                value: '0.19 cm',
                maxValue: 9.34,
                minValue: 0
            });
            this.spnMarginRight.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                this._marginsChange( field, newValue, oldValue, eOpts, 'cell', 'Right');
                if (this._changedProps)  {
                    if (this._changedProps.get_CellMargins()===undefined)
                        this._changedProps.put_CellMargins(new Asc.CMargins());
                    this._changedProps.get_CellMargins().put_Right((this.CellMargins.Right!==null) ? Common.Utils.Metric.fnRecalcToMM(this.CellMargins.Right) : null);
                    setCellFlag();
                }
            }, this));
            this.spinners.push(this.spnMarginRight);

            // Cell Size
            this.chPrefWidth = new Common.UI.CheckBox({
                el: $('#tableadv-checkbox-prefwidth'),
                value: false,
                labelText: ''
            });
            this.chPrefWidth.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                var value = (newValue=='checked');
                this.nfPrefWidth.setDisabled(!value);
                this.cmbPrefWidthUnit.setDisabled(!value);
                if (this._changedProps) {
                    if (value && this.nfPrefWidth.getNumberValue()>0)
                        this._changedProps.put_CellsWidth(this.cmbPrefWidthUnit.getValue() ? -this.nfPrefWidth.getNumberValue() : Common.Utils.Metric.fnRecalcToMM(this.nfPrefWidth.getNumberValue()));
                    else
                        this._changedProps.put_CellsWidth(null);
                }
            }, this));

            this.nfPrefWidth = new Common.UI.MetricSpinner({
                el: $('#tableadv-number-prefwidth'),
                step: .1,
                width: 115,
                defaultUnit : "cm",
                value: '10 cm',
                maxValue: 55.88,
                minValue: 0
            });
            this.nfPrefWidth.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps)
                    this._changedProps.put_CellsWidth(this.cmbPrefWidthUnit.getValue() ? -field.getNumberValue() : Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
            }, this));

            this.cmbPrefWidthUnit = new Common.UI.ComboBox({
                el          : $('#tableadv-combo-prefwidth-unit'),
                style       : 'width: 115px;',
                menuStyle   : 'min-width: 115px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [
                    { value: 0, displayValue: (currmetric == Common.Utils.Metric.c_MetricUnits.pt) ? this.txtPt : ((currmetric == Common.Utils.Metric.c_MetricUnits.inch) ? this.txtInch : this.txtCm) },
                    { value: 1, displayValue: this.txtPercent }
                ],
                takeFocusOnClose: true
            });
            this.cmbPrefWidthUnit.on('selected', _.bind(function(combo, record) {
                if (this._changedProps) {
                    var defUnit = (record.value) ? '%' : Common.Utils.Metric.getCurrentMetricName();
                    if (this.nfPrefWidth.getUnitValue() !== defUnit) {
                        var maxwidth = Common.Utils.Metric.fnRecalcFromMM(558);
                        this.nfPrefWidth.setDefaultUnit(defUnit);
                        this.nfPrefWidth.setMaxValue(record.value ? parseFloat((100 * maxwidth/this.pageWidth).toFixed(2)) : maxwidth);
                        this.nfPrefWidth.setStep((record.value || Common.Utils.Metric.getCurrentMetric()==Common.Utils.Metric.c_MetricUnits.pt) ? 1 : 0.1);
                        this.nfPrefWidth.setValue((record.value) ? 100*this.nfPrefWidth.getNumberValue()/this.pageWidth : this.pageWidth*this.nfPrefWidth.getNumberValue()/100);
                        this._changedProps.put_CellsWidth(record.value ? -this.nfPrefWidth.getNumberValue() : Common.Utils.Metric.fnRecalcToMM(this.nfPrefWidth.getNumberValue()));
                    }
                }
            }, this));

            this.chWrapText = new Common.UI.CheckBox({
                el: $('#tableadv-checkbox-wrap'),
                value: false,
                labelText: this.textWrapText
            });
            this.chWrapText.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    this._changedProps.put_CellsNoWrap((field.getValue()!='checked'));
                }
            }, this));

            // Wrapping

            this.btnWrapNone = new Common.UI.Button({
                parentEl: $('#tableadv-button-wrap-none'),
                cls: 'btn-options huge-1',
                iconCls: 'options__icon options__icon-huge btn-table-align-center',
                posId: c_tableWrap.TABLE_WRAP_NONE,
                hint: this.textWrapNoneTooltip,
                enableToggle: true,
                allowDepress: false,
                toggleGroup : 'advtablewrapGroup'
            });
            this.btnWrapNone.on('click', _.bind(this.onBtnInlineWrapClick, this));

            this.btnWrapParallel = new Common.UI.Button({
                parentEl: $('#tableadv-button-wrap-parallel'),
                cls: 'btn-options huge-1',
                iconCls: 'options__icon options__icon-huge btn-table-flow',
                posId: c_tableWrap.TABLE_WRAP_PARALLEL,
                hint: this.textWrapParallelTooltip,
                enableToggle: true,
                allowDepress: false,
                toggleGroup : 'advtablewrapGroup'
            });
            this.btnWrapParallel.on('click', _.bind(this.onBtnFlowWrapClick, this));

            this.btnAlignLeft = new Common.UI.Button({
                parentEl: $('#tableadv-button-align-left'),
                cls: 'btn-options huge-1',
                iconCls: 'options__icon options__icon-huge btn-table-align-left',
                posId: c_tableAlign.TABLE_ALIGN_LEFT,
                hint: this.textLeftTooltip,
                enableToggle: true,
                allowDepress: false,
                toggleGroup : 'advtablealignGroup'
            });
            this.btnAlignLeft.on('click', _.bind(function(btn){
                if (this._changedProps && btn.pressed) {
                    this._changedProps.put_TableAlignment(btn.options.posId);
                    this._changedProps.put_TableIndent(Common.Utils.Metric.fnRecalcToMM(this.spnIndentLeft.getNumberValue()));
                    this.spnIndentLeft.setDisabled(!btn.pressed);
                    this._state.alignChanged = true;
                }
            }, this));

            this.btnAlignCenter = new Common.UI.Button({
                parentEl: $('#tableadv-button-align-center'),
                cls: 'btn-options huge-1',
                iconCls: 'options__icon options__icon-huge btn-table-align-center',
                posId: c_tableAlign.TABLE_ALIGN_CENTER,
                hint: this.textCenterTooltip,
                enableToggle: true,
                allowDepress: false,
                toggleGroup : 'advtablealignGroup'
            });
            this.btnAlignCenter.on('click', _.bind(function(btn){
                if (this._changedProps && btn.pressed) {
                    this._changedProps.put_TableAlignment(btn.options.posId);
                    this._changedProps.put_TableIndent(0);
                    this.spnIndentLeft.setDisabled(btn.pressed);
                    this._state.alignChanged = true;
                }
            }, this));

            this.btnAlignRight = new Common.UI.Button({
                parentEl: $('#tableadv-button-align-right'),
                cls: 'btn-options huge-1',
                iconCls: 'options__icon options__icon-huge btn-table-align-right',
                posId: c_tableAlign.TABLE_ALIGN_RIGHT,
                hint: this.textRightTooltip,
                enableToggle: true,
                allowDepress: false,
                toggleGroup : 'advtablealignGroup'
            });
            this.btnAlignRight.on('click', _.bind(function(btn){
                if (this._changedProps && btn.pressed) {
                    this._changedProps.put_TableAlignment(btn.options.posId);
                    this._changedProps.put_TableIndent(0);
                    this.spnIndentLeft.setDisabled(btn.pressed);
                    this._state.alignChanged = true;
                }
            }, this));

            this.spnIndentLeft = new Common.UI.MetricSpinner({
                el: $('#tableadv-number-indent'),
                step: .1,
                width: 85,
                defaultUnit : "cm",
                defaultValue : 0,
                value: '0 cm',
                maxValue: 38.09,
                minValue: -38.09
            });
            this.spnIndentLeft.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps)  {
                    this._changedProps.put_TableIndent(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                }
            }, this));
            this.spinners.push(this.spnIndentLeft);

            this.spnDistanceTop = new Common.UI.MetricSpinner({
                el: $('#tableadv-number-distance-top'),
                step: .1,
                width: 85,
                defaultUnit : "cm",
                value: '1 cm',
                maxValue: 55.87,
                minValue: 0
            });
            this.spnDistanceTop.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    if (this._changedProps.get_TablePaddings()===undefined)
                        this._changedProps.put_TablePaddings(new Asc.asc_CPaddings());
                    this._changedProps.get_TablePaddings().put_Top(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                }
            }, this));
            this.spinners.push(this.spnDistanceTop);

            this.spnDistanceBottom = new Common.UI.MetricSpinner({
                el: $('#tableadv-number-distance-bottom'),
                step: .1,
                width: 85,
                defaultUnit : "cm",
                value: '1 cm',
                maxValue: 55.87,
                minValue: 0
            });
            this.spnDistanceBottom.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    if (this._changedProps.get_TablePaddings()===undefined)
                        this._changedProps.put_TablePaddings(new Asc.asc_CPaddings());
                    this._changedProps.get_TablePaddings().put_Bottom(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                }
            }, this));
            this.spinners.push(this.spnDistanceBottom);

            this.spnDistanceLeft = new Common.UI.MetricSpinner({
                el: $('#tableadv-number-distance-left'),
                step: .1,
                width: 85,
                defaultUnit : "cm",
                value: '1 cm',
                maxValue: 9.34,
                minValue: 0
            });
            this.spnDistanceLeft.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    if (this._changedProps.get_TablePaddings()===undefined)
                        this._changedProps.put_TablePaddings(new Asc.asc_CPaddings());
                    this._changedProps.get_TablePaddings().put_Left(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                }
            }, this));
            this.spinners.push(this.spnDistanceLeft);

            this.spnDistanceRight = new Common.UI.MetricSpinner({
                el: $('#tableadv-number-distance-right'),
                step: .1,
                width: 85,
                defaultUnit : "cm",
                value: '0.19 cm',
                maxValue: 9.34,
                minValue: 0
            });
            this.spnDistanceRight.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    if (this._changedProps.get_TablePaddings()===undefined)
                        this._changedProps.put_TablePaddings(new Asc.asc_CPaddings());
                    this._changedProps.get_TablePaddings().put_Right(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                }
            }, this));
            this.spinners.push(this.spnDistanceRight);

            // Position

            this.spnX = new Common.UI.MetricSpinner({
                el: $('#tableadv-spin-x'),
                step: .1,
                width: 115,
                disabled: true,
                defaultUnit : "cm",
                defaultValue : 0,
                value: '1 cm',
                maxValue: 55.87,
                minValue: -55.87
            });
            this.spnX.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    if (this._changedProps.get_PositionH()===null || this._changedProps.get_PositionH()===undefined)
                        this._changedProps.put_PositionH(new Asc.CTablePositionH());

                    this._changedProps.get_PositionH().put_UseAlign(false);
                    this._changedProps.get_PositionH().put_RelativeFrom(this._state.HPositionFrom);
                    this._changedProps.get_PositionH().put_Value(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                    this._state.spnXChanged = true;
                }
            }, this));
            this.spinners.push(this.spnX);

            this.spnY = new Common.UI.MetricSpinner({
                el: $('#tableadv-spin-y'),
                step: .1,
                width: 115,
                disabled: true,
                defaultUnit : "cm",
                defaultValue : 0,
                value: '1 cm',
                maxValue: 55.87,
                minValue: -55.87
            });
            this.spnY.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    if (this._changedProps.get_PositionV()===null || this._changedProps.get_PositionV()===undefined)
                        this._changedProps.put_PositionV(new Asc.CTablePositionV());

                    this._changedProps.get_PositionV().put_UseAlign(false);
                    this._changedProps.get_PositionV().put_RelativeFrom(this._state.VPositionFrom);
                    this._changedProps.get_PositionV().put_Value(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                    this._state.spnYChanged = true;
                }
            }, this));
            this.spinners.push(this.spnY);

            // Horizontal
            this._arrHAlign = [
                {displayValue: this.textLeft,   value: Asc.c_oAscXAlign.Left},
                {displayValue: this.textCenter, value: Asc.c_oAscXAlign.Center},
                {displayValue: this.textRight,  value: Asc.c_oAscXAlign.Right}
            ];

            this.cmbHAlign = new Common.UI.ComboBox({
                el: $('#tableadv-combo-halign'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 115px;',
                editable: false,
                data: this._arrHAlign,
                takeFocusOnClose: true
            });
            this.cmbHAlign.setValue(this._state.HAlignType);
            this.cmbHAlign.on('selected', _.bind(this.onHAlignSelect, this));

            this._arrHRelative = [
                {displayValue: this.textMargin,     value: Asc.c_oAscHAnchor.Margin},
                {displayValue: this.textPage,       value: Asc.c_oAscHAnchor.Page},
                {displayValue: this.textAnchorText, value: Asc.c_oAscHAnchor.Text}
            ];

            this.cmbHRelative = new Common.UI.ComboBox({
                el: $('#tableadv-combo-hrelative'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 115px;',
                editable: false,
                data: this._arrHRelative,
                takeFocusOnClose: true
            });
            this.cmbHRelative.setValue(this._state.HAlignFrom);
            this.cmbHRelative.on('selected', _.bind(this.onHRelativeSelect, this));

            this.cmbHPosition = new Common.UI.ComboBox({
                el: $('#tableadv-combo-hposition'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 115px;',
                editable: false,
                data: this._arrHRelative,
                takeFocusOnClose: true
            });
            this.cmbHPosition.setDisabled(true);
            this.cmbHPosition.setValue(this._state.HPositionFrom);
            this.cmbHPosition.on('selected', _.bind(this.onHPositionSelect, this));

            // Vertical
            this._arrVAlign = [
                {displayValue: this.textTop,   value: Asc.c_oAscYAlign.Top},
                {displayValue: this.textCenter, value: Asc.c_oAscYAlign.Center},
                {displayValue: this.textBottom,  value: Asc.c_oAscYAlign.Bottom}
            ];

            this.cmbVAlign = new Common.UI.ComboBox({
                el: $('#tableadv-combo-valign'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 115px;',
                editable: false,
                data: this._arrVAlign,
                takeFocusOnClose: true
            });
            this.cmbVAlign.setValue(this._state.VAlignType);
            this.cmbVAlign.on('selected', _.bind(this.onVAlignSelect, this));

            this._arrVRelative = [
                {displayValue: this.textMargin,     value: Asc.c_oAscVAnchor.Margin},
                {displayValue: this.textPage,       value: Asc.c_oAscVAnchor.Page},
                {displayValue: this.textAnchorText, value: Asc.c_oAscVAnchor.Text}
            ];

            this.cmbVRelative = new Common.UI.ComboBox({
                el: $('#tableadv-combo-vrelative'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 115px;',
                editable: false,
                data: this._arrVRelative,
                takeFocusOnClose: true
            });
            this.cmbVRelative.setValue(this._state.VAlignFrom);
            this.cmbVRelative.on('selected', _.bind(this.onVRelativeSelect, this));

            this.cmbVPosition = new Common.UI.ComboBox({
                el: $('#tableadv-combo-vposition'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 115px;',
                editable: false,
                data: this._arrVRelative,
                takeFocusOnClose: true
            });
            this.cmbVPosition.setDisabled(true);
            this.cmbVPosition.setValue(this._state.VPositionFrom);
            this.cmbVPosition.on('selected', _.bind(this.onVPositionSelect, this));

            this.radioHAlign = new Common.UI.RadioBox({
                el: $('#tableadv-radio-halign'),
                name: 'asc-radio-horizontal',
                checked: true
            });
            this.radioHAlign.on('change', _.bind(this.onRadioHAlignChange, this));

            this.radioHPosition = new Common.UI.RadioBox({
                el: $('#tableadv-radio-hposition'),
                name: 'asc-radio-horizontal'
            });
            this.radioHPosition.on('change', _.bind(this.onRadioHPositionChange, this));

            this.radioVAlign = new Common.UI.RadioBox({
                el: $('#tableadv-radio-valign'),
                name: 'asc-radio-vertical',
                checked: true
            });
            this.radioVAlign.on('change', _.bind(this.onRadioVAlignChange, this));

            this.radioVPosition = new Common.UI.RadioBox({
                el: $('#tableadv-radio-vposition'),
                name: 'asc-radio-vertical'
            });
            this.radioVPosition.on('change', _.bind(this.onRadioVPositionChange, this));

            this.chMove = new Common.UI.CheckBox({
                el: $('#tableadv-checkbox-move'),
                labelText: this.textMove
            });
            this.chMove.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    var value = this._arrVRelative[(field.getValue()=='checked') ? 2 : 1].value;
                    if (this.cmbVRelative.isDisabled()) {
                        this.cmbVPosition.setValue(value);
                        var rec = this.cmbVPosition.getSelectedRecord();
                        if (rec) this.onVPositionSelect(this.cmbVPosition, rec);
                    } else {
                        this.cmbVRelative.setValue(value);
                        var rec = this.cmbVRelative.getSelectedRecord();
                        if (rec) this.onVRelativeSelect(this.cmbVRelative, rec);
                    }
                }
            }, this));

            this.chOverlap = new Common.UI.CheckBox({
                el: $('#tableadv-checkbox-overlap'),
                labelText: this.textOverlap
            });
            this.chOverlap.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    this._changedProps.put_AllowOverlap(field.getValue()=='checked');
                }
            }, this));

            // Borders

            this.cmbBorderSize = new Common.UI.ComboBorderSize({
                el: $('#tableadv-combo-border-size'),
                style: "width: 93px;",
                takeFocusOnClose: true
            });
            var rec = this.cmbBorderSize.store.at(1);
            this.BorderSize = {ptValue: rec.get('value'), pxValue: rec.get('pxValue')};
            this.cmbBorderSize.setValue(this.BorderSize.ptValue);
            this.cmbBorderSize.on('selected', _.bind(this.onBorderSizeSelect, this));

            this.btnBorderColor = new Common.UI.ColorButton({
                parentEl: $('#tableadv-border-color-btn'),
                additionalAlign: this.menuAddAlign,
                color: 'auto',
                auto: true,
                takeFocusOnClose: true
            });
            this.btnBorderColor.on('color:select', _.bind(me.onColorsBorderSelect, me));
            this.btnBorderColor.on('auto:select', _.bind(me.onColorsBorderSelect, me));
            this.colorsBorder = this.btnBorderColor.getPicker();

            this.btnBackColor = new Common.UI.ColorButton({
                parentEl: $('#tableadv-button-back-color'),
                additionalAlign: this.menuAddAlign,
                transparent: true,
                takeFocusOnClose: true
            });
            this.btnBackColor.on('color:select', _.bind(this.onColorsBackSelect, this));
            this.colorsBack = this.btnBackColor.getPicker();

            this.btnTableBackColor = new Common.UI.ColorButton({
                parentEl: $('#tableadv-button-table-back-color'),
                additionalAlign: this.menuAddAlign,
                transparent: true,
                takeFocusOnClose: true
            });
            this.btnTableBackColor.on('color:select', _.bind(this.onColorsTableBackSelect, this));
            this.colorsTableBack = this.btnTableBackColor.getPicker();

            this.tableBordersImageSpacing = new Common.UI.TableStyler({
                el: $('#id-detablestyler-spacing'),
                width: 200,
                height: 200,
                rows: this.tableStylerRows,
                columns: this.tableStylerColumns,
                spacingMode: true
            });

            this.tableBordersImage = new Common.UI.TableStyler({
                el: $('#id-detablestyler'),
                width: 200,
                height: 200,
                rows: this.tableStylerRows,
                columns: this.tableStylerColumns,
                spacingMode: false
            });

            var _arrBorderPresets = [
                ['cm',      'toolbar__icon toolbar__icon-big btn-borders-inner-only', 'tableadv-button-border-inner',     this.tipInner],
                ['lrtb',    'toolbar__icon toolbar__icon-big btn-borders-outer-only', 'tableadv-button-border-outer',     this.tipOuter],
                ['lrtbcm',  'toolbar__icon toolbar__icon-big btn-borders-all',   'tableadv-button-border-all',       this.tipAll],
                ['',        'toolbar__icon toolbar__icon-big btn-borders-none',  'tableadv-button-border-none',      this.tipNone]
            ];

            this._btnsBorderPosition = [];
            _.each(_arrBorderPresets, function(item, index, list){
                var _btn = new Common.UI.Button({
                    parentEl: $('#'+item[2]),
                    cls: 'btn-options large border-off',
                    iconCls: item[1],
                    strId   :item[0],
                    hint: item[3]
                });
                _btn.on('click', _.bind(this._ApplyBorderPreset, this));
                this._btnsBorderPosition.push( _btn );
            }, this);


            var _arrTableBorderPresets = [
                ['cm', '',          'toolbar__icon toolbar__icon-big btn-borders-twin-none-inner',    'tableadv-button-border-inner-none',    this.tipCellInner],
                ['lrtb', '',        'toolbar__icon toolbar__icon-big btn-borders-twin-none-outer',    'tableadv-button-border-outer-none',    this.tipCellOuter],
                ['lrtbcm', '',      'toolbar__icon toolbar__icon-big btn-borders-twin-none-all',      'tableadv-button-border-all-none',      this.tipCellAll],
                ['', '',            'toolbar__icon toolbar__icon-big btn-borders-twin-none',          'tableadv-button-border-none-none',     this.tipNone],
                ['lrtbcm', 'lrtb',  'toolbar__icon toolbar__icon-big btn-borders-twin-all',           'tableadv-button-border-all-table',     this.tipTableOuterCellAll],
                ['', 'lrtb',        'toolbar__icon toolbar__icon-big btn-borders-twin-outer-none',    'tableadv-button-border-none-table',    this.tipOuter],
                ['cm', 'lrtb',      'toolbar__icon toolbar__icon-big btn-borders-twin-outer-inner',   'tableadv-button-border-inner-table',   this.tipTableOuterCellInner],
                ['lrtb', 'lrtb',    'toolbar__icon toolbar__icon-big btn-borders-twin-outer-outer',   'tableadv-button-border-outer-table',   this.tipTableOuterCellOuter]
            ];

            this._btnsTableBorderPosition = [];
            _.each(_arrTableBorderPresets, function(item, index, list){
                var _btn = new Common.UI.Button({
                    parentEl: $('#'+item[3]),
                    style: 'margin-bottom: 4px;',
                    cls: 'btn-options large border-off  margin-left-4',
                    iconCls: item[2],
                    strCellId  :item[0],
                    strTableId :item[1],
                    hint: item[4]
                });
                _btn.on('click', _.bind(this._ApplyBorderPreset, this));
                this._btnsTableBorderPosition.push( _btn );
            }, this);

            // Alt Text

            this.inputAltTitle = new Common.UI.InputField({
                el          : $('#table-advanced-alt-title'),
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

            this.AlignContainer = $('#tableadv-panel-align');
            this.DistanceContainer = $('#tableadv-panel-distance');

            this.BordersContainer = $('#tableadv-panel-borders');
            this.BordersSpacingContainer = $('#tableadv-panel-borders-spacing');
            this.CellBackContainer = $('#tableadv-panel-cell-back');
            this.TableBackContainer = $('#tableadv-panel-table-back');

            this.afterRender();
        },

        getFocusedComponents: function() {
            return this.btnsCategory.concat([
                this.chWidth, this.nfWidth, this.cmbUnit, this.chAutofit, this.spnTableMarginTop, this.spnTableMarginLeft, this.spnTableMarginBottom, this.spnTableMarginRight, this.chAllowSpacing, this.nfSpacing, // 0 tab
                this.chPrefWidth, this.nfPrefWidth, this.cmbPrefWidthUnit, this.chCellMargins, this.spnMarginTop, this.spnMarginLeft, this.spnMarginBottom, this.spnMarginRight, this.chWrapText, // 1 tab
                this.cmbBorderSize, this.btnBorderColor]).concat(this._btnsBorderPosition).concat(this._btnsTableBorderPosition).concat([this.btnBackColor, this.btnTableBackColor,
                this.radioHAlign, this.cmbHAlign , this.radioHPosition, this.cmbHRelative, this.spnX, this.cmbHPosition,
                this.radioVAlign, this.cmbVAlign , this.radioVPosition, this.cmbVRelative, this.spnY, this.cmbVPosition, this.chMove, this.chOverlap, // 3 tab
                this.btnWrapNone, this.btnWrapParallel, this.btnAlignLeft, this.btnAlignCenter, this.btnAlignRight, this.spnIndentLeft, this.spnDistanceTop, this.spnDistanceLeft, this.spnDistanceBottom, this.spnDistanceRight, // 4 tab
                this.inputAltTitle, this.textareaAltDescription  // 5 tab
            ]).concat(this.getFooterButtons());
        },

        onCategoryClick: function(btn, index) {
            Common.Views.AdvancedSettingsWindow.prototype.onCategoryClick.call(this, btn, index);

            var me = this;
            setTimeout(function(){
                switch (index) {
                    case 0:
                        if (!me.nfWidth.isDisabled())
                            me.nfWidth.focus();
                        else
                            me.spnTableMarginTop.focus();
                        break;
                    case 1:
                        me.onCellCategoryClick(btn);
                        if (!me.nfPrefWidth.isDisabled())
                            me.nfPrefWidth.focus();
                        else
                            me.chPrefWidth.focus();
                        break;
                    case 2:
                        me.cmbBorderSize.focus();
                        break;
                    case 3:
                        if (!me.cmbHAlign.isDisabled())
                            me.cmbHAlign.focus();
                        else
                            me.spnX.focus();
                        break;
                    case 4:
                        if (me.spnIndentLeft.isVisible()) {
                            if (!me.spnIndentLeft.isDisabled())
                                me.spnIndentLeft.focus();
                            else
                                me.btnWrapNone.focus();
                        } else
                            me.spnDistanceTop.focus();
                        break;
                    case 5:
                        me.inputAltTitle.focus();
                        break;
                }
            }, 10);
        },

        afterRender: function() {
            this.updateMetricUnit();
            this.updateThemeColors();

            this._setDefaults(this._originalProps);
            var cellcolorstr = (typeof(this.CellColor.Color) == 'object') ? this.CellColor.Color.color : this.CellColor.Color,
                tablecolorstr = (typeof(this.TableColor.Color) == 'object') ? this.TableColor.Color.color : this.TableColor.Color;
            this.tableBordersImageSpacing.setTableColor(tablecolorstr);
            this.tableBordersImage.setTableColor(tablecolorstr);
            this.tableBordersImageSpacing.setCellsColor(cellcolorstr);
            this.tableBordersImage.setCellsColor((this._allTable) ? tablecolorstr : cellcolorstr);
            if(colorstr!='transparent') {
                this.tableBordersImage.redrawTable();
                this.tableBordersImageSpacing.redrawTable();
            }

            if (this.borderProps !== undefined) {
                this.btnBorderColor.setColor(this.borderProps.borderColor);
                this.btnBorderColor.setAutoColor(this.borderProps.borderColor=='auto');
                var colorstr = (typeof(this.btnBorderColor.color) == 'object') ? this.btnBorderColor.color.color : this.btnBorderColor.color;
                this.tableBordersImageSpacing.setVirtualBorderColor(colorstr);
                this.tableBordersImage.setVirtualBorderColor(colorstr);
                if (this.borderProps.borderColor=='auto')
                    this.colorsBorder.clearSelection();
                else
                    this.colorsBorder.select(this.borderProps.borderColor,true);

                this.cmbBorderSize.setValue(this.borderProps.borderSize.ptValue);
                var rec = this.cmbBorderSize.getSelectedRecord();
                if (rec)
                    this.onBorderSizeSelect(this.cmbBorderSize, rec);
            }

            this.tableBordersImageSpacing.on('borderclick:cellborder', function(ct, border, size, color){
                if (this.ChangedCellBorders===undefined) {
                    this.ChangedCellBorders = new Asc.CBorders();
                }
                this._UpdateCellBordersStyle(ct, border, size, color,   this.CellBorders,  this.ChangedCellBorders);
            }, this);

            this.tableBordersImageSpacing.on('borderclick', function(ct, border, size, color){
                if (this.ChangedTableBorders===undefined) {
                    this.ChangedTableBorders = new Asc.CBorders();
                }
                this._UpdateTableBordersStyle(ct, border, size, color,  this.TableBorders, this.ChangedTableBorders);
            }, this);

            this.tableBordersImage.on('borderclick', function(ct, border, size, color){
                if (this._allTable) {
                    if (this.ChangedTableBorders===undefined) {
                        this.ChangedTableBorders = new Asc.CBorders();
                    }
                } else {
                    if (this.ChangedCellBorders===undefined) {
                        this.ChangedCellBorders = new Asc.CBorders();
                    }
                }
                this._UpdateTableBordersStyle(ct, border, size, color, (this._allTable) ? this.TableBorders : this.CellBorders, (this._allTable) ? this.ChangedTableBorders : this.ChangedCellBorders);

            }, this);

            this.tableBordersImage.on('borderclick:cellborder', function(ct, border, size, color){
                if (this._allTable) {
                    if (this.ChangedTableBorders===undefined) {
                        this.ChangedTableBorders = new Asc.CBorders();
                    }
                } else {
                    if (this.ChangedCellBorders===undefined) {
                        this.ChangedCellBorders = new Asc.CBorders();
                    }
                }
                this._UpdateCellBordersStyle(ct, border, size, color,  (this._allTable) ? this.TableBorders : this.CellBorders, (this._allTable) ? this.ChangedTableBorders : this.ChangedCellBorders);

            }, this);

            if (this.storageName) {
                var value = Common.localStorage.getItem(this.storageName);
                this.setActiveCategory((value!==null) ? parseInt(value) : 0);
            }
        },

        getSettings: function() {
            if (this._cellBackground) {
                if (this._allTable) {
                    if ( this._changedProps.get_Spacing() === null || (this._changedProps.get_Spacing() === undefined && this._originalProps.get_Spacing()===null))
                        this._changedProps.put_CellsBackground(null);
                    else
                        this._changedProps.put_CellsBackground(this._cellBackground);
                } else
                    this._changedProps.put_CellsBackground(this._cellBackground);
            }

            if ( this.ChangedTableBorders === null ) {
                this._changedProps.put_TableBorders(this.TableBorders);
            } else if (this.ChangedTableBorders !== undefined) {
                this._changedProps.put_TableBorders(this.ChangedTableBorders);
            }

            if ( this.ChangedCellBorders === null ) {
                this._changedProps.put_CellBorders(this.CellBorders);
            } else if (this.ChangedCellBorders !== undefined) {
                this._changedProps.put_CellBorders(this.ChangedCellBorders);
            }

            if (this.isAltTitleChanged)
                this._changedProps.put_TableCaption(this.inputAltTitle.getValue());

            if (this.isAltDescChanged)
                this._changedProps.put_TableDescription(this.textareaAltDescription.val());

            return { tableProps: this._changedProps, borderProps: {borderSize: this.BorderSize, borderColor: this.btnBorderColor.isAutoColor() ? 'auto' : this.btnBorderColor.color} };
        },

        _setDefaults: function(props) {
            if (props ){
                this._allTable = !props.get_CellSelect();
                this.pageWidth = Common.Utils.Metric.fnRecalcFromMM(props.get_PercentFullWidth());

                var value,
                    TableWidth = props.get_Width(),
                    currmetric = Common.Utils.Metric.getCurrentMetric();

                // main props
                this.cmbUnit.store.at(0).set('displayValue', (currmetric == Common.Utils.Metric.c_MetricUnits.pt) ? this.txtPt : ((currmetric == Common.Utils.Metric.c_MetricUnits.inch) ? this.txtInch : this.txtCm));
                this.cmbUnit.setValue(TableWidth<0 ? 1 : 0);
                this.nfWidth.setDefaultUnit(TableWidth<0 ? '%' : Common.Utils.Metric.getCurrentMetricName());
                if (TableWidth<0) //%
                    this.nfWidth.setMaxValue(parseFloat((100 * Common.Utils.Metric.fnRecalcFromMM(558)/this.pageWidth).toFixed(2)));
                this.nfWidth.setStep((TableWidth<0 || Common.Utils.Metric.getCurrentMetric()==Common.Utils.Metric.c_MetricUnits.pt) ? 1 : 0.1);
                if (TableWidth !== null)
                    this.nfWidth.setValue(TableWidth>0 ? Common.Utils.Metric.fnRecalcFromMM(TableWidth) : -TableWidth , true);

                this.chWidth.setValue(TableWidth !== null, true);
                value = (this.chWidth.getValue()!=='checked');
                this.nfWidth.setDisabled(value);
                this.cmbUnit.setDisabled(value);

                var TableSpacing = props.get_Spacing();
                if (TableSpacing !== null) {
                    this.nfSpacing.setValue(Common.Utils.Metric.fnRecalcFromMM(TableSpacing), true);
                }

                this.chAllowSpacing.setValue(TableSpacing !== null, true);
                this.nfSpacing.setDisabled(this.chAllowSpacing.getValue()!=='checked');

                var autoFit = props.get_TableLayout();
                this.chAutofit.setDisabled(autoFit===undefined);
                this.chAutofit.setValue(autoFit===Asc.c_oAscTableLayout.AutoFit, true);

                // margins
                var margins = props.get_DefaultMargins();
                if (margins) {
                    this.TableMargins = {
                        Left   : (margins.get_Left() !==null) ? Common.Utils.Metric.fnRecalcFromMM(margins.get_Left()) : null,
                        Right  : (margins.get_Right() !==null) ? Common.Utils.Metric.fnRecalcFromMM(margins.get_Right()) : null,
                        Top    : (margins.get_Top() !==null) ? Common.Utils.Metric.fnRecalcFromMM(margins.get_Top()) : null,
                        Bottom : (margins.get_Bottom() !==null) ? Common.Utils.Metric.fnRecalcFromMM(margins.get_Bottom()) : null
                    };
                }

                margins = props.get_CellMargins();
                var flag = undefined;
                if (margins) {
                    this.CellMargins = {
                        Left   : (margins.get_Left() !==null) ? Common.Utils.Metric.fnRecalcFromMM(margins.get_Left()) : null,
                        Right  : (margins.get_Right() !==null) ? Common.Utils.Metric.fnRecalcFromMM(margins.get_Right()) : null,
                        Top    : (margins.get_Top() !==null) ? Common.Utils.Metric.fnRecalcFromMM(margins.get_Top()) : null,
                        Bottom : (margins.get_Bottom() !==null) ? Common.Utils.Metric.fnRecalcFromMM(margins.get_Bottom()) : null
                    };
                    flag = margins.get_Flag();
                    this.CellMargins.Flag = (flag==1) ? 'indeterminate' : ((flag==0) ? 'checked' : 'unchecked');
                    this.chCellMargins.setValue( this.CellMargins.Flag, true);
                }

                if ( flag===0 ) {
                    // Если для всех выделенных ячеек пришло одинаковое значение Flag=0 (Use Default Margins), выставим в поля для Cell Margins значения DefaultMargins
                    if (this.CellMargins.Left=== null) this.CellMargins.Left = this.TableMargins.Left;
                    if (this.CellMargins.Top=== null) this.CellMargins.Top = this.TableMargins.Top;
                    if (this.CellMargins.Right=== null) this.CellMargins.Right = this.TableMargins.Right;
                    if (this.CellMargins.Bottom=== null) this.CellMargins.Bottom = this.TableMargins.Bottom;
                }

                this.fillMargins(this.CellMargins.Flag);

                // Cell Size
                var cellWidth = props.get_CellsWidth();

                this.cmbPrefWidthUnit.store.at(0).set('displayValue', (currmetric == Common.Utils.Metric.c_MetricUnits.pt) ? this.txtPt : ((currmetric == Common.Utils.Metric.c_MetricUnits.inch) ? this.txtInch : this.txtCm));
                this.cmbPrefWidthUnit.setValue(cellWidth<0 ? 1 : 0);
                this.nfPrefWidth.setDefaultUnit(cellWidth<0 ? '%' : Common.Utils.Metric.getCurrentMetricName());
                if (cellWidth<0) //%
                    this.nfPrefWidth.setMaxValue(parseFloat((100 * Common.Utils.Metric.fnRecalcFromMM(558)/this.pageWidth).toFixed(2)));
                this.nfPrefWidth.setStep((cellWidth<0 || Common.Utils.Metric.getCurrentMetric()==Common.Utils.Metric.c_MetricUnits.pt) ? 1 : 0.1);
                if (cellWidth !== null)
                    this.nfPrefWidth.setValue(cellWidth>0 ? Common.Utils.Metric.fnRecalcFromMM(cellWidth) : -cellWidth , true);

                this.chPrefWidth.setValue((props.get_CellsWidthNotEqual()) ? 'indeterminate' : (cellWidth !== null), true);
                value = (this.chPrefWidth.getValue()!=='checked');
                this.nfPrefWidth.setDisabled(value);
                this.cmbPrefWidthUnit.setDisabled(value);

                var wrapText = !props.get_CellsNoWrap();
                this.chWrapText.setValue(wrapText, true);

                // wrapping props
                this._TblWrapStyleChanged(props.get_TableWrap());
                this.ShowHideWrap(props.get_TableWrap()===c_tableWrap.TABLE_WRAP_NONE);
                this.btnWrapParallel.setDisabled(!props.get_CanBeFlow());
                // align props
                var tableAlign = props.get_TableAlignment();
                if ( tableAlign !== null ) {
                    this._TblAlignChanged(tableAlign);
                    this.spnIndentLeft.setValue(tableAlign !== c_tableAlign.TABLE_ALIGN_LEFT ? 0 : Common.Utils.Metric.fnRecalcFromMM(props.get_TableIndent()), true);
                    this.spnIndentLeft.setDisabled(tableAlign !== c_tableAlign.TABLE_ALIGN_LEFT);
                }
                this._state.alignChanged = false;

                // distances & position
                var paddings = props.get_TablePaddings();
                if (paddings) {
                    this.spnDistanceTop.setValue(Common.Utils.Metric.fnRecalcFromMM(paddings.get_Top()), true);
                    this.spnDistanceLeft.setValue(Common.Utils.Metric.fnRecalcFromMM(paddings.get_Left()), true);
                    this.spnDistanceBottom.setValue(Common.Utils.Metric.fnRecalcFromMM(paddings.get_Bottom()), true);
                    this.spnDistanceRight.setValue(Common.Utils.Metric.fnRecalcFromMM(paddings.get_Right()), true);
                }

                var Position = props.get_PositionH();
                if (Position) {
                    value = Position.get_RelativeFrom();
                    for (var i=0; i<this._arrHRelative.length; i++) {
                        if (value == this._arrHRelative[i].value) {
                            this.cmbHRelative.setValue(value);
                            this.cmbHPosition.setValue(value);
                            this._state.HPositionFrom = value;
                            this._state.HAlignFrom = value;
                            break;
                        }
                    }

                    if (Position.get_UseAlign()) {
                        value = Position.get_Align();
                        for (var i=0; i<this._arrHAlign.length; i++) {
                            if (value == this._arrHAlign[i].value) {
                                this.cmbHAlign.setValue(value);
                                this._state.HAlignType = value;
                                break;
                            }
                        }
                        value = this._originalProps.get_Value_X(this._state.HPositionFrom);
                        this.spnX.setValue(Common.Utils.Metric.fnRecalcFromMM(value));
                    } else {
                        this.radioHPosition.setValue(true);
                        value = Position.get_Value();
                        this.spnX.setValue(Common.Utils.Metric.fnRecalcFromMM(value));
                    }
                } else {
                    value = this._originalProps.get_Value_X(this._state.HPositionFrom);
                    this.spnX.setValue(Common.Utils.Metric.fnRecalcFromMM(value));
                }

                Position = props.get_PositionV();
                if (Position) {
                    value = Position.get_RelativeFrom();
                    for (i=0; i<this._arrVRelative.length; i++) {
                        if (value == this._arrVRelative[i].value) {
                            this.cmbVRelative.setValue(value);
                            this.cmbVPosition.setValue(value);
                            this._state.VAlignFrom = value;
                            this._state.VPositionFrom = value;
                            break;
                        }
                    }
                    if (value==Asc.c_oAscVAnchor.Text)
                        this.chMove.setValue(true, true);

                    if (Position.get_UseAlign()) {
                        value = Position.get_Align();
                        for (i=0; i<this._arrVAlign.length; i++) {
                            if (value == this._arrVAlign[i].value) {
                                this.cmbVAlign.setValue(value);
                                this._state.VAlignType = value;
                                break;
                            }
                        }
                        value = props.get_Value_Y(this._state.VPositionFrom);
                        this.spnY.setValue(Common.Utils.Metric.fnRecalcFromMM(value));
                    } else {
                        this.radioVPosition.setValue(true);
                        value = Position.get_Value();
                        this.spnY.setValue(Common.Utils.Metric.fnRecalcFromMM(value));
                    }
                } else {
                    value = props.get_Value_Y(this._state.VPositionFrom);
                    this.spnY.setValue(Common.Utils.Metric.fnRecalcFromMM(value));
                }

                this.chOverlap.setValue((props.get_AllowOverlap() !== null ) ? props.get_AllowOverlap() : 'indeterminate', true);
                this._state.verticalPropChanged = false;
                this._state.horizontalPropChanged = false;

                // borders
                this.TableBorders = new Asc.CBorders(props.get_TableBorders());

                this.CellBorders = new Asc.CBorders(props.get_CellBorders());

                this._UpdateBordersNoSpacing_();
                this._UpdateBordersSpacing_();

                var disable_inner = (this.CellBorders.get_InsideV()=== null && this.CellBorders.get_InsideH()=== null);
                this._btnsBorderPosition[0].setDisabled(disable_inner && !this._allTable);
                this._btnsTableBorderPosition[0].setDisabled(disable_inner && !this._allTable);
                this._btnsTableBorderPosition[6].setDisabled(disable_inner && !this._allTable);

                // background colors
                var background = props.get_TableBackground();
                if (background && background.get_Value()==0) {
                    var color = background.get_Color();
                    if (color) {
                        if (color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                            this.TableColor = {Value: 1, Color: {color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()), effectValue: color.get_value() }};
                        } else {
                            this.TableColor = {Value: 1, Color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b())};
                        }
                    } else
                        this.TableColor = {Value: 1, Color: 'transparent'};
                } else
                    this.TableColor = {Value: 0, Color: 'transparent'};

                background = props.get_CellsBackground();
                if (background) {
                    if (background.get_Value()==0) {
                        var color = background.get_Color();
                        if (color) {
                            if (color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                                this.CellColor = {Value: 1, Color: {color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()), effectValue: color.get_value() }};
                            } else {
                                this.CellColor = {Value: 1, Color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b())};
                            }
                        } else
                            this.CellColor = {Value: 1, Color: 'transparent'};
                    } else
                        this.CellColor = {Value: 1, Color: 'transparent'};
                } else
                    this.CellColor = {Value: 0, Color: 'transparent'};

                this.btnBackColor.setColor(this.CellColor.Color);
                Common.Utils.ThemeColor.selectPickerColorByEffect(this.CellColor.Color, this.colorsBack);

                this.btnTableBackColor.setColor(this.TableColor.Color);
                Common.Utils.ThemeColor.selectPickerColorByEffect(this.TableColor.Color, this.colorsTableBack);

                this.ShowHideSpacing(this.chAllowSpacing.getValue()==='checked');

                value = props.get_TableCaption();
                this.inputAltTitle.setValue(value ? value : '');

                value = props.get_TableDescription();
                this.textareaAltDescription.val(value ? value : '');
            }
            this._changedProps = new Asc.CTableProp();
            this._changedProps.put_CellSelect(!this._allTable);
            this._cellBackground = null;
            this.ChangedTableBorders = undefined;
            this.ChangedCellBorders = undefined;
        },

        fillMargins : function (checkMarginsState) {
            this.spnMarginLeft.setValue((this.CellMargins.Left!== null) ? this.CellMargins.Left : '', true);
            this.spnMarginTop.setValue((this.CellMargins.Top!== null) ? this.CellMargins.Top : '', true);
            this.spnMarginRight.setValue((this.CellMargins.Right!== null) ? this.CellMargins.Right : '', true);
            this.spnMarginBottom.setValue((this.CellMargins.Bottom!== null) ? this.CellMargins.Bottom : '', true);
            var disabled = (checkMarginsState=='checked');
            this.spnMarginTop.setDisabled(disabled);
            this.spnMarginBottom.setDisabled(disabled);
            this.spnMarginLeft.setDisabled(disabled);
            this.spnMarginRight.setDisabled(disabled);
            this.spnTableMarginLeft.setValue((this.TableMargins.Left!== null) ? this.TableMargins.Left : '', true);
            this.spnTableMarginTop.setValue((this.TableMargins.Top!== null) ? this.TableMargins.Top : '', true);
            this.spnTableMarginRight.setValue((this.TableMargins.Right!== null) ? this.TableMargins.Right : '', true);
            this.spnTableMarginBottom.setValue((this.TableMargins.Bottom!== null) ? this.TableMargins.Bottom : '', true);
        },

        _TblWrapStyleChanged: function(style) {
            if (style==c_tableWrap.TABLE_WRAP_NONE)
                this.btnWrapNone.toggle(true);
            else
                this.btnWrapParallel.toggle(true);
            this._state.fromWrapInline = (style==c_tableWrap.TABLE_WRAP_NONE);
        },

        _TblAlignChanged: function(style) {
            if (style==c_tableAlign.TABLE_ALIGN_LEFT)
                this.btnAlignLeft.toggle(true, true);
            else if (style==c_tableAlign.TABLE_ALIGN_CENTER)
                this.btnAlignCenter.toggle(true, true);
            else
                this.btnAlignRight.toggle(true, true);
        },

        onBtnInlineWrapClick: function(btn, e) {
            this.ShowHideWrap(true);
            if (this._changedProps && btn.pressed) {
                if (this._state.alignChanged) {
                    if (this._state.HAlignType===Asc.c_oAscXAlign.Left)
                        this.btnAlignLeft.toggle(true);
                    else if (this._state.HAlignType==Asc.c_oAscXAlign.Center)
                        this.btnAlignCenter.toggle(true);
                    else if (this._state.HAlignType==Asc.c_oAscXAlign.Right)
                        this.btnAlignRight.toggle(true);
                    this._state.alignChanged = false;
                }

                this._changedProps.put_TableWrap(btn.options.posId);
                if (this.btnAlignLeft.pressed) this._changedProps.put_TableAlignment(c_tableAlign.TABLE_ALIGN_LEFT);
                else if (this.btnAlignCenter.pressed) this._changedProps.put_TableAlignment(c_tableAlign.TABLE_ALIGN_CENTER);
                else  this._changedProps.put_TableAlignment(c_tableAlign.TABLE_ALIGN_RIGHT);
                this.spnIndentLeft.setDisabled(!this.btnAlignLeft.pressed);
                this._changedProps.put_TableIndent(Common.Utils.Metric.fnRecalcToMM(this.spnIndentLeft.getNumberValue()));
            }
            !this.spnIndentLeft.isDisabled() && this.spnIndentLeft.focus();
        },

        onBtnFlowWrapClick: function(btn, e) {
            this.ShowHideWrap(false);
            if (this._changedProps && btn.pressed) {
                this._changedProps.put_TableWrap(btn.options.posId);
                this._changedProps.put_TableAlignment(null);
                this._changedProps.put_TableIndent(null);
                if (this._state.fromWrapInline && !this._state.verticalPropChanged) {
                    this.radioVPosition.setValue(true);
                }
                if (this._state.alignChanged) {
                    if (this.btnAlignLeft.pressed) this._state.HAlignType = Asc.c_oAscXAlign.Left;
                    else if (this.btnAlignCenter.pressed) this._state.HAlignType = Asc.c_oAscXAlign.Center;
                    else  this._state.HAlignType = Asc.c_oAscXAlign.Right;
                    this.cmbHAlign.setValue(this._state.HAlignType);
                    this.radioHAlign.setValue(true);
                    if (this._changedProps.get_PositionH()===null || this._changedProps.get_PositionH()===undefined)
                        this._changedProps.put_PositionH(new Asc.CTablePositionH());

                    this._changedProps.get_PositionH().put_UseAlign(true);
                    this._changedProps.get_PositionH().put_Align(this._state.HAlignType);
                    this._changedProps.get_PositionH().put_RelativeFrom(this._state.HAlignFrom);
                    this._state.alignChanged = false;
                    this._state.horizontalPropChanged = true;
                } else if (this._state.fromWrapInline && !this._state.horizontalPropChanged) {
                    this.radioHPosition.setValue(true);
                }
            }
            this.spnDistanceTop.focus();
        },

        onHAlignSelect: function(combo, record){
            if (this._changedProps) {
                if (this._changedProps.get_PositionH()===null || this._changedProps.get_PositionH()===undefined)
                    this._changedProps.put_PositionH(new Asc.CTablePositionH());

                this._state.HAlignType = record.value;
                this._changedProps.get_PositionH().put_UseAlign(true);
                this._changedProps.get_PositionH().put_RelativeFrom(this._state.HAlignFrom);
                this._changedProps.get_PositionH().put_Align(this._state.HAlignType);
                this._state.alignChanged = true;
            }
        },

        onHRelativeSelect: function(combo, record){
            if (this._changedProps) {
                if (this._changedProps.get_PositionH()===null || this._changedProps.get_PositionH()===undefined)
                    this._changedProps.put_PositionH(new Asc.CTablePositionH());

                this._state.HAlignFrom = record.value;
                this._changedProps.get_PositionH().put_UseAlign(true);
                this._changedProps.get_PositionH().put_RelativeFrom(this._state.HAlignFrom);
                this._changedProps.get_PositionH().put_Align(this._state.HAlignType);
            }
        },

        onHPositionSelect: function(combo, record){
            if (this._changedProps) {
                if (this._changedProps.get_PositionH()===null || this._changedProps.get_PositionH()===undefined)
                    this._changedProps.put_PositionH(new Asc.CTablePositionH());

                this._state.HPositionFrom = record.value;
                this._changedProps.get_PositionH().put_UseAlign(false);
                this._changedProps.get_PositionH().put_RelativeFrom(this._state.HPositionFrom);
                if (!this._state.spnXChanged) {
                    var val = this._originalProps.get_Value_X(this._state.HPositionFrom);
                    this.spnX.setValue(Common.Utils.Metric.fnRecalcFromMM(val), true);
                }
                this._changedProps.get_PositionH().put_Value(Common.Utils.Metric.fnRecalcToMM(this.spnX.getNumberValue()));
            }
        },

        onVAlignSelect: function(combo, record){
            if (this._changedProps) {
                if (this._changedProps.get_PositionV()===null || this._changedProps.get_PositionV()===undefined)
                    this._changedProps.put_PositionV(new Asc.CTablePositionV());

                this._state.VAlignType = record.value;
                this._changedProps.get_PositionV().put_UseAlign(true);
                this._changedProps.get_PositionV().put_RelativeFrom(this._state.VAlignFrom);
                this._changedProps.get_PositionV().put_Align(this._state.VAlignType);
            }
        },

        onVRelativeSelect: function(combo, record){
            if (this._changedProps) {
                if (this._changedProps.get_PositionV()===null || this._changedProps.get_PositionV()===undefined)
                    this._changedProps.put_PositionV(new Asc.CTablePositionV());

                this._state.VAlignFrom = record.value;
                this._changedProps.get_PositionV().put_UseAlign(true);
                this._changedProps.get_PositionV().put_RelativeFrom(this._state.VAlignFrom);
                this._changedProps.get_PositionV().put_Align(this._state.VAlignType);

                this.chMove.setValue(this._state.VAlignFrom==Asc.c_oAscVAnchor.Text, true);
            }
        },

        onVPositionSelect: function(combo, record){
            if (this._changedProps) {
                if (this._changedProps.get_PositionV()===null || this._changedProps.get_PositionV()===undefined)
                    this._changedProps.put_PositionV(new Asc.CTablePositionV());

                this._state.VPositionFrom = record.value;
                this._changedProps.get_PositionV().put_UseAlign(false);
                this._changedProps.get_PositionV().put_RelativeFrom(this._state.VPositionFrom);
                if (!this._state.spnYChanged) {
                    var val = this._originalProps.get_Value_Y(this._state.VPositionFrom);
                    this.spnY.setValue(Common.Utils.Metric.fnRecalcFromMM(val), true);
                }
                this._changedProps.get_PositionV().put_Value(Common.Utils.Metric.fnRecalcToMM(this.spnY.getNumberValue()));
                this.chMove.setValue(this._state.VPositionFrom==Asc.c_oAscVAnchor.Text, true);
            }
        },

        onRadioHAlignChange: function(field, newValue, eOpts) {
            if (this._changedProps) {
                if (this._changedProps.get_PositionH()===null || this._changedProps.get_PositionH()===undefined)
                    this._changedProps.put_PositionH(new Asc.CTablePositionH());

                this._changedProps.get_PositionH().put_UseAlign(newValue);
                if (newValue) {
                    this._changedProps.get_PositionH().put_Align(this._state.HAlignType);
                    this._changedProps.get_PositionH().put_RelativeFrom(this._state.HAlignFrom);
                }
            }
            if (newValue) {
                this.cmbHAlign.setDisabled(false);
                this.cmbHAlign.focus();
                this.cmbHRelative.setDisabled(false);
                this.spnX.setDisabled(true);
                this.cmbHPosition.setDisabled(true);
                this._state.horizontalPropChanged = true;
                this._state.alignChanged = true;
            }
        },

        onRadioHPositionChange: function(field, newValue, eOpts) {
            if (this._changedProps) {
                if (this._changedProps.get_PositionH()===null || this._changedProps.get_PositionH()===undefined)
                    this._changedProps.put_PositionH(new Asc.CTablePositionH());

                this._changedProps.get_PositionH().put_UseAlign(!newValue);
                if (newValue) {
                    if (!this._state.spnXChanged) {
                        var val = this._originalProps.get_Value_X(this._state.HPositionFrom);
                        this.spnX.setValue(Common.Utils.Metric.fnRecalcFromMM(val));
                    }
                    this._changedProps.get_PositionH().put_Value(Common.Utils.Metric.fnRecalcToMM(this.spnX.getNumberValue()));
                    this._changedProps.get_PositionH().put_RelativeFrom(this._state.HPositionFrom);
                }
            }
            if (newValue) {
                this.cmbHAlign.setDisabled(true);
                this.cmbHRelative.setDisabled(true);
                this.spnX.setDisabled(false);
                this.spnX.focus();
                this.cmbHPosition.setDisabled(false);
                this._state.alignChanged = false;
            }
        },

        onRadioVAlignChange: function(field, newValue, eOpts) {
            if (this._changedProps) {
                if (this._changedProps.get_PositionV()===null || this._changedProps.get_PositionV()===undefined)
                    this._changedProps.put_PositionV(new Asc.CTablePositionV());

                this._changedProps.get_PositionV().put_UseAlign(newValue);
                if (newValue) {
                    this._changedProps.get_PositionV().put_Align(this._state.VAlignType);
                    this._changedProps.get_PositionV().put_RelativeFrom(this._state.VAlignFrom);
                    this._state.verticalPropChanged = true;
                }
            }
            if (newValue) {
                this.cmbVAlign.setDisabled(false);
                this.cmbVAlign.focus();
                this.cmbVRelative.setDisabled(false);
                this.spnY.setDisabled(true);
                this.cmbVPosition.setDisabled(true);
                this.chMove.setValue(this._state.VAlignFrom==Asc.c_oAscVAnchor.Text, true);
            }
        },

        onRadioVPositionChange: function(field, newValue, eOpts) {
            if (this._changedProps) {
                if (this._changedProps.get_PositionV()===null || this._changedProps.get_PositionV()===undefined)
                    this._changedProps.put_PositionV(new Asc.CTablePositionV());

                this._changedProps.get_PositionV().put_UseAlign(!newValue);
                if (newValue) {
                    if (!this._state.spnYChanged) {
                        var val = this._originalProps.get_Value_Y(this._state.VPositionFrom);
                        this.spnY.setValue(Common.Utils.Metric.fnRecalcFromMM(val));
                    }
                    this._changedProps.get_PositionV().put_Value(Common.Utils.Metric.fnRecalcToMM(this.spnY.getNumberValue()));
                    this._changedProps.get_PositionV().put_RelativeFrom(this._state.VPositionFrom);
                }
            }
            if (newValue) {
                this.cmbVAlign.setDisabled(true);
                this.cmbVRelative.setDisabled(true);
                this.spnY.setDisabled(false);
                this.spnY.focus();
                this.cmbVPosition.setDisabled(false);
                this.chMove.setValue(this._state.VPositionFrom==Asc.c_oAscVAnchor.Text, true);
            }
        },

        onBorderSizeSelect: function(combo, record) {
            this.BorderSize = {ptValue: record.value, pxValue: record.pxValue};
            this.tableBordersImage.setVirtualBorderSize( this.BorderSize.pxValue );
            this.tableBordersImageSpacing.setVirtualBorderSize( this.BorderSize.pxValue );
        },

        onColorsBorderSelect: function(btn, color) {
            var colorstr = (typeof(color) == 'object') ? color.color : color;
            this.tableBordersImage.setVirtualBorderColor(colorstr);
            this.tableBordersImageSpacing.setVirtualBorderColor(colorstr);
        },

        onColorsBackSelect: function(btn, color) {
            this.CellColor = {Value: 1, Color: color};

            if (this._cellBackground === null)
                this._cellBackground = new Asc.CBackground();

            if (this.CellColor.Color=='transparent') {
                this._cellBackground.put_Value(1);
                this._cellBackground.put_Color(new Asc.asc_CColor(0,0,0));
            } else {
                this._cellBackground.put_Value(0);
                this._cellBackground.put_Color(Common.Utils.ThemeColor.getRgbColor(this.CellColor.Color));
            }
            var colorstr = (typeof(color) == 'object') ? color.color : color;
            this.tableBordersImageSpacing.setCellsColor(colorstr);
            this.tableBordersImageSpacing.redrawTable()
            if (!this._allTable) {
                this.tableBordersImage.setCellsColor(colorstr);
                this.tableBordersImage.redrawTable();
            }
        },

        onColorsTableBackSelect: function(btn, color) {
            this.TableColor.Color = color;

            if (this._changedProps) {
                var background = this._changedProps.get_TableBackground();
                if (background===undefined) {
                    background = new Asc.CBackground();
                    this._changedProps.put_TableBackground(background);
                }
                if (this.TableColor.Color=='transparent') {
                    background.put_Value(1);
                    background.put_Color(new Asc.asc_CColor(0, 0,0));
                } else {
                    background.put_Value(0);
                    background.put_Color(Common.Utils.ThemeColor.getRgbColor(this.TableColor.Color));
                }
            }
            var colorstr = (typeof(color) == 'object') ? color.color : color;
            this.tableBordersImageSpacing.setTableColor(colorstr);
            this.tableBordersImage.setTableColor(colorstr);
            if (this._allTable)
                this.tableBordersImage.setCellsColor(colorstr);
            this.tableBordersImage.redrawTable();
            this.tableBordersImageSpacing.redrawTable();
        },

        _UpdateBordersSpacing_: function (){
            var source = this.TableBorders;

            var oldSize = this.BorderSize;
            var oldColor = this.btnBorderColor.color;

            this._UpdateTableBorderSpacing_(source.get_Left(), 'l');
            this._UpdateTableBorderSpacing_(source.get_Top(), 't');
            this._UpdateTableBorderSpacing_(source.get_Right(), 'r');
            this._UpdateTableBorderSpacing_(source.get_Bottom(), 'b');

            source = this.CellBorders;

            this._UpdateCellBorderSpacing_(source.get_Top(),  this.tableBordersImageSpacing.getCellBorder(0, -1,0));
            this._UpdateCellBorderSpacing_(source.get_Left(), this.tableBordersImageSpacing.getCellBorder(-1, 0, 0));
            this._UpdateCellBorderSpacing_(source.get_Bottom(),  this.tableBordersImageSpacing.getCellBorder(this.tableBordersImageSpacing.rows -1, -1,1));
            this._UpdateCellBorderSpacing_(source.get_Right(), this.tableBordersImageSpacing.getCellBorder(-1, this.tableBordersImageSpacing.columns-1, 1));

            if (this._allTable && source.get_InsideV() === null) {
                source.put_InsideV(new Asc.asc_CTextBorder());
            }

            if (source.get_InsideV() !== null) {
                for (var i=0; i<this.tableBordersImageSpacing.columns-1; i++) {
                    this._UpdateCellBorderSpacing_(source.get_InsideV(),  this.tableBordersImageSpacing.getCellBorder(-1, i, 1));
                    this._UpdateCellBorderSpacing_(source.get_InsideV(),  this.tableBordersImageSpacing.getCellBorder(-1, i+1, 0));
                }
            }

            if (this._allTable && source.get_InsideH() === null) {
                source.put_InsideH(new Asc.asc_CTextBorder());
            }
            if (source.get_InsideH() !== null) {
                for (var i=0; i<this.tableBordersImageSpacing.rows-1; i++) {
                    this._UpdateCellBorderSpacing_(source.get_InsideH(), this.tableBordersImageSpacing.getCellBorder(i, -1,1));
                    this._UpdateCellBorderSpacing_(source.get_InsideH(), this.tableBordersImageSpacing.getCellBorder(i+1, -1,0));
                }
            }

            this.tableBordersImageSpacing.setVirtualBorderSize(oldSize.pxValue);
            this.tableBordersImageSpacing.setVirtualBorderColor((typeof(oldColor) == 'object') ? oldColor.color : oldColor);

            this.tableBordersImageSpacing.redrawTable();
        },

        _UpdateCellBorderSpacing_: function(BorderParam, cell){
            if (null !== BorderParam && undefined !== BorderParam){
                if (null !== BorderParam.get_Value() && null !== BorderParam.get_Size() && null !== BorderParam.get_Color()){
                    if (1 == BorderParam.get_Value()) {
                        cell.setBordersSize(this._BorderPt2Px(BorderParam.get_Size() * 72 / 25.4));
                        cell.setBordersColor('rgb(' + BorderParam.get_Color().get_r() + ',' + BorderParam.get_Color().get_g() + ',' + BorderParam.get_Color().get_b() + ')');
                    } else
                        cell.setBordersSize(0);
                } else {
                    cell.setBordersSize(this.IndeterminateSize);
                    cell.setBordersColor(this.IndeterminateColor);
                }
            }
            else {
                cell.setBordersSize(this.IndeterminateSize);
                cell.setBordersColor(this.IndeterminateColor);
            }
        },

        _UpdateTableBorderSpacing_: function(BorderParam, borderName){
            if (null !== BorderParam && undefined !== BorderParam){
                if (null !== BorderParam.get_Value() && null !== BorderParam.get_Size() && null !== BorderParam.get_Color()){
                    if (1 == BorderParam.get_Value()) {
                        this.tableBordersImageSpacing.setBordersSize(borderName, this._BorderPt2Px(BorderParam.get_Size() * 72 / 25.4));
                        this.tableBordersImageSpacing.setBordersColor(borderName, 'rgb(' + BorderParam.get_Color().get_r() + ',' + BorderParam.get_Color().get_g() + ',' + BorderParam.get_Color().get_b() + ')');
                    } else
                        this.tableBordersImageSpacing.setBordersSize(borderName, 0);
                } else {
                    this.tableBordersImageSpacing.setBordersSize(borderName, this.IndeterminateSize);
                    this.tableBordersImageSpacing.setBordersColor(borderName, this.IndeterminateColor);
                }
            }
            else {
                this.tableBordersImageSpacing.setBordersSize(borderName, this.IndeterminateSize);
                this.tableBordersImageSpacing.setBordersColor(borderName, this.IndeterminateColor);
            }
        },

        _UpdateBordersNoSpacing_: function (){
            var source = (this._allTable) ? this.TableBorders : this.CellBorders;

            var oldSize = this.BorderSize;
            var oldColor = this.btnBorderColor.color;

            this._UpdateTableBorderNoSpacing_(source.get_Left(), 'l');
            this._UpdateTableBorderNoSpacing_(source.get_Top(), 't');
            this._UpdateTableBorderNoSpacing_(source.get_Right(), 'r');
            this._UpdateTableBorderNoSpacing_(source.get_Bottom(), 'b');

            if (this._allTable && source.get_InsideV() == null) {
                source.put_InsideV(new Asc.asc_CTextBorder());
            }
            if (source.get_InsideV() !== null) {
                for (var i=0; i < this.tableBordersImage.columns-1; i++) {
                    this._UpdateCellBorderNoSpacing_(source.get_InsideV(),  this.tableBordersImage.getCellBorder(-1, i));
                }
            }

            if (this._allTable && source.get_InsideH() == null) {
                source.put_InsideH(new Asc.asc_CTextBorder());
            }
            if (source.get_InsideH() !== null) {
                for (i=0; i<this.tableBordersImage.rows-1; i++) {
                    this._UpdateCellBorderNoSpacing_(source.get_InsideH(),  this.tableBordersImage.getCellBorder(i, -1));
                }

            }

            this.tableBordersImage.setVirtualBorderSize(oldSize.pxValue);
            this.tableBordersImage.setVirtualBorderColor((typeof(oldColor) == 'object') ? oldColor.color : oldColor);
        },

        _UpdateCellBorderNoSpacing_: function(BorderParam,  cell){
            if (null !== BorderParam && undefined !== BorderParam){
                if (null !== BorderParam.get_Value() && null !== BorderParam.get_Size() && null !== BorderParam.get_Color()){
                    if (1 == BorderParam.get_Value()) {
                        cell.setBordersSize( this._BorderPt2Px(BorderParam.get_Size() * 72 / 25.4));
                        cell.setBordersColor( 'rgb(' + BorderParam.get_Color().get_r() + ',' + BorderParam.get_Color().get_g() + ',' + BorderParam.get_Color().get_b() + ')');
                    } else
                        cell.setBordersSize( 0);
                } else {
                    cell.setBordersSize( this.IndeterminateSize);
                    cell.setBordersColor( this.IndeterminateColor);
                }
            }
            else {
                cell.setBordersSize( this.IndeterminateSize);
                cell.setBordersColor( this.IndeterminateColor);
            }
        },

        _UpdateTableBorderNoSpacing_: function(BorderParam, borderName){
            if (null !== BorderParam && undefined !== BorderParam){
                if (null !== BorderParam.get_Value() && null !== BorderParam.get_Size() && null !== BorderParam.get_Color() ){
                    if (1 == BorderParam.get_Value()) {
                        this.tableBordersImage.setBordersSize(borderName, this._BorderPt2Px(BorderParam.get_Size() * 72 / 25.4));
                        this.tableBordersImage.setBordersColor(borderName, 'rgb(' + BorderParam.get_Color().get_r() + ',' + BorderParam.get_Color().get_g() + ',' + BorderParam.get_Color().get_b() + ')');
                    } else
                        this.tableBordersImage.setBordersSize(borderName, 0);
                } else {
                    this.tableBordersImage.setBordersSize(borderName, this.IndeterminateSize);
                    this.tableBordersImage.setBordersColor(borderName, this.IndeterminateColor);
                }
            }
            else {
                this.tableBordersImage.setBordersSize(borderName, this.IndeterminateSize);
                this.tableBordersImage.setBordersColor(borderName, this.IndeterminateColor);
            }
        },

        _BorderPt2Px: function(value) {
            if (value==0) return 0;
            if (value <0.6) return 0.5;
            if (value <=1) return 1;
            if (value <=1.5) return 2;
            if (value <=2.25) return 3;
            if (value <=3) return 4;
            if (value <=4.5) return 6;
            return 8;
        },

        _ApplyBorderPreset: function(btn) {
            var cellborder = (btn.options.strId !== undefined) ? btn.options.strId : btn.options.strCellId;
            var tableborder = btn.options.strTableId;

            var updateBorders;
            if (this._allTable && tableborder===undefined) {
                updateBorders = this.TableBorders;
                this.ChangedTableBorders = null;
            } else {
                updateBorders = this.CellBorders;
                this.ChangedCellBorders = null;
            }

            this._UpdateBorderStyle(updateBorders.get_Left(),    (cellborder.indexOf('l') > -1));
            this._UpdateBorderStyle(updateBorders.get_Top(),    (cellborder.indexOf('t') > -1));
            this._UpdateBorderStyle(updateBorders.get_Right(),    (cellborder.indexOf('r') > -1));
            this._UpdateBorderStyle(updateBorders.get_Bottom(),    (cellborder.indexOf('b') > -1));
            this._UpdateBorderStyle(updateBorders.get_InsideV(),    (cellborder.indexOf('c') > -1));
            this._UpdateBorderStyle(updateBorders.get_InsideH(),    (cellborder.indexOf('m') > -1));

            if (tableborder===undefined) {
                this._UpdateBordersNoSpacing_();

                if (this._allTable) {
                    updateBorders = this.CellBorders;
                    this.ChangedCellBorders = null;
                    this._UpdateBorderStyle(updateBorders.get_Left(),    (cellborder.indexOf('l') > -1));
                    this._UpdateBorderStyle(updateBorders.get_Top(),    (cellborder.indexOf('t') > -1));
                    this._UpdateBorderStyle(updateBorders.get_Right(),    (cellborder.indexOf('r') > -1));
                    this._UpdateBorderStyle(updateBorders.get_Bottom(),    (cellborder.indexOf('b') > -1));
                    this._UpdateBorderStyle(updateBorders.get_InsideV(),    (cellborder.indexOf('c') > -1));
                    this._UpdateBorderStyle(updateBorders.get_InsideH(),    (cellborder.indexOf('m') > -1));
                }
                this.tableBordersImageSpacing.redrawTable();
                this.tableBordersImage.redrawTable();
                return;
            }

            updateBorders = this.TableBorders;
            this.ChangedTableBorders = null;

            this._UpdateBorderStyle (updateBorders.get_Left(),    (tableborder.indexOf('l') > -1));
            this._UpdateBorderStyle (updateBorders.get_Top(),    (tableborder.indexOf('t') > -1));
            this._UpdateBorderStyle (updateBorders.get_Right(),    (tableborder.indexOf('r') > -1));
            this._UpdateBorderStyle (updateBorders.get_Bottom(),    (tableborder.indexOf('b') > -1));

            this._UpdateBordersSpacing_();
        },

        _UpdateCellBordersStyle: function(ct, border, size, color, destination, changed_destination) {
            var updateBorders = destination;

            if(border.col == 0 && border.numInCell == 0){
                this._UpdateBorderStyle(updateBorders.get_Left(), (size>0));
                if (changed_destination) {
                    changed_destination.put_Left(new Asc.asc_CTextBorder(updateBorders.get_Left()));
                }
            }
            else if(border.col == border.columns-1 && border.numInCell == 1){
                this._UpdateBorderStyle(updateBorders.get_Right(), (size>0));
                if (changed_destination) {
                    changed_destination.put_Right(new Asc.asc_CTextBorder(updateBorders.get_Right()));
                }
            }
            else  if(border.row == 0 && border.numInCell == 0){
                this._UpdateBorderStyle(updateBorders.get_Top(), (size>0));
                if (changed_destination) {
                    changed_destination.put_Top(new Asc.asc_CTextBorder(updateBorders.get_Top()));
                }
            }
            else if(border.row == border.rows-1 && border.numInCell == 1){
                this._UpdateBorderStyle(updateBorders.get_Bottom(), (size>0));
                if (changed_destination) {
                    changed_destination.put_Bottom(new Asc.asc_CTextBorder(updateBorders.get_Bottom()));
                }
            }
            else if ( border.col > -1  ) {
                this._UpdateBorderStyle(updateBorders.get_InsideV(), (size>0));
                if (changed_destination)  {
                    changed_destination.put_InsideV(new Asc.asc_CTextBorder(updateBorders.get_InsideV()));
                }
            }
            else if ( border.row > -1  ) {
                this._UpdateBorderStyle(updateBorders.get_InsideH(), (size>0));
                if (changed_destination)  {
                    changed_destination.put_InsideH(new Asc.asc_CTextBorder(updateBorders.get_InsideH()));
                }
            }
        },

        _UpdateTableBordersStyle: function(ct, border, size, color, destination, changed_destination) {
            var updateBorders = destination;

            if (border.indexOf('l') > -1) {
                this._UpdateBorderStyle(updateBorders.get_Left(), (size>0));
                if (changed_destination) {
                    changed_destination.put_Left(new Asc.asc_CTextBorder(updateBorders.get_Left()));
                }
            }else if (border.indexOf('t') > -1) {
                this._UpdateBorderStyle(updateBorders.get_Top(), (size>0));
                if (changed_destination) {
                    changed_destination.put_Top(new Asc.asc_CTextBorder(updateBorders.get_Top()));
                }
            }else if (border.indexOf('r') > -1) {
                this._UpdateBorderStyle(updateBorders.get_Right(), (size>0));
                if (changed_destination) {
                    changed_destination.put_Right(new Asc.asc_CTextBorder(updateBorders.get_Right()));
                }
            }else if (border.indexOf('b') > -1) {
                this._UpdateBorderStyle(updateBorders.get_Bottom(), (size>0));
                if (changed_destination)  {
                    changed_destination.put_Bottom(new Asc.asc_CTextBorder(updateBorders.get_Bottom()));
                }
            }
        },

        _UpdateBorderStyle: function(border, visible) {
            if (null == border)
                return 0;
            if (visible && this.BorderSize.ptValue > 0){
                var size = parseFloat(this.BorderSize.ptValue);
                border.put_Value(1);
                border.put_Size(size * 25.4 / 72.0);
                var color;
                if (this.btnBorderColor.isAutoColor()) {
                    color = new Asc.asc_CColor();
                    color.put_auto(true);
                } else {
                    color = Common.Utils.ThemeColor.getRgbColor(this.btnBorderColor.color);
                }
                border.put_Color(color);
            }
            else {
                border.put_Color(new Asc.asc_CColor());
                border.put_Value(0);
            }
            return border.get_Value();
        },

        onCellCategoryClick: function(btn) {
            if (this.CellMargins.Flag=='checked' && this.TableMargins.isChanged) {
                this.CellMargins.Left = this.TableMargins.Left;
                this.CellMargins.Top = this.TableMargins.Top;
                this.CellMargins.Right = this.TableMargins.Right;
                this.CellMargins.Bottom = this.TableMargins.Bottom;
                this.spnMarginRight.setValue(this.CellMargins.Right, true);
                this.spnMarginLeft.setValue(this.CellMargins.Left, true);
                this.spnMarginBottom.setValue(this.CellMargins.Bottom, true);
                this.spnMarginTop.setValue(this.CellMargins.Top, true);
            }
            this.TableMargins.isChanged = false;
        },

        updateMetricUnit: function() {
            if (this.spinners) {
                for (var i=0; i<this.spinners.length; i++) {
                    var spinner = this.spinners[i];
                    spinner.setDefaultUnit(Common.Utils.Metric.getCurrentMetricName());
                    spinner.setStep(Common.Utils.Metric.getCurrentMetric()==Common.Utils.Metric.c_MetricUnits.pt ? 1 : 0.1);
                }
            }
        },

        updateThemeColors: function() {
            this.colorsBorder.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
            this.colorsBack.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
            this.colorsTableBack.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
        },

        ShowHideWrap: function(inline) {
            this.AlignContainer.toggleClass('settings-hidden', !inline);
            this.DistanceContainer.toggleClass('settings-hidden', inline);
            this.btnsCategory[3].setDisabled(inline);
        },

        ShowHideSpacing: function(spacing) {
            this.BordersContainer.toggleClass('settings-hidden', spacing);
            this.BordersSpacingContainer.toggleClass('settings-hidden', !spacing);
            this.TableBackContainer.css('display', (!spacing && !this._allTable) ? 'none' : 'flex');
            this.CellBackContainer.css('display', (!spacing && this._allTable) ? 'none' : 'flex');
            this.TableBackContainer.toggleClass('float-right', spacing || !this._allTable);
            (spacing) ? this._UpdateBordersSpacing_() : this._UpdateBordersNoSpacing_();
        },

        textWidth:          'Width',
        textAllowSpacing:   'Spacing between cells',
        textAlign:          'Alignment',
        textIndLeft:        'Indent from Left',
        textWidthSpaces:    'Width & Spaces',
        textWrap:           'Text Wrapping',
        textMargins:        'Cell Margins',
        textTop:            'Top',
        textLeft:           'Left',
        textBottom:         'Bottom',
        textRight:          'Right',
        textDistance:       'Distance From Text',
        textPosition:       'Position',
        textWrapParallelTooltip: 'Flow table',
        textWrapNoneTooltip: 'Inline table',
        textLeftTooltip:    'Left',
        textRightTooltip:   'Right',
        textCenterTooltip:  'Center',
        textTitle:          'Table - Advanced Settings',
        textDefaultMargins: 'Default Cell Margins',
        textCheckMargins:   'Use default margins',
        textBordersBackgroung: 'Borders & Background',
        textOnlyCells:      'For selected cells only',
        textBorderWidth:    'Border Size',
        textBorderColor:    'Border Color',
        textBackColor:      'Cell Background',
        textPreview:        'Preview',
        textBorderDesc:     'Click on diagramm or use buttons to select borders',
        textTableBackColor: 'Table Background',
        txtNoBorders:       'No borders',
        textCenter: 'Center',
        textMargin: 'Margin',
        textPage: 'Page',
        textHorizontal: 'Horizontal',
        textVertical: 'Vertical',
        textAlignment: 'Alignment',
        textRelative: 'relative to',
        textRightOf: 'to the right Of',
        textBelow: 'below',
        textOverlap: 'Allow overlap',
        textMove: 'Move object with text',
        textOptions: 'Options',
        textAnchorText: 'Text',
        textAutofit: 'Automatically resize to fit contents',
        textCellProps: 'Cell',
        tipAll:             'Set Outer Border and All Inner Lines',
        tipNone:            'Set No Borders',
        tipInner:           'Set Inner Lines Only',
        tipOuter:           'Set Outer Border Only',
        tipCellAll: 'Set Borders for Inner Cells Only',
        tipTableOuterCellAll: 'Set Outer Border and Borders for All Inner Cells',
        tipCellInner: 'Set Vertical and Horizontal Lines for Inner Cells Only',
        tipTableOuterCellInner: 'Set Outer Border and Vertical and Horizontal Lines for Inner Cells',
        tipCellOuter: 'Set Outer Borders for Inner Cells Only',
        tipTableOuterCellOuter: 'Set Table Outer Border and Outer Borders for Inner Cells',
        txtPercent: 'Percent',
        txtCm: 'Centimeter',
        txtPt: 'Point',
        txtInch: 'Inch',
        textCellSize: 'Cell Size',
        textPrefWidth: 'Preferred width',
        textMeasure: 'Measure in',
        textCellOptions: 'Cell Options',
        textWrapText: 'Wrap text',
        textTable: 'Table',
        textTableSize: 'Table Size',
        textTablePosition: 'Table Position',
        textWrappingStyle: 'Wrapping Style',
        textAlt: 'Alternative Text',
        textAltTitle: 'Title',
        textAltDescription: 'Description',
        textAltTip: 'The alternative text-based representation of the visual object information, which will be read to the people with vision or cognitive impairments to help them better understand what information there is in the image, autoshape, chart or table.'

    }, DE.Views.TableSettingsAdvanced || {}));
});
