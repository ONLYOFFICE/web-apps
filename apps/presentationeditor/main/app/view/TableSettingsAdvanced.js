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
 *  Created on 4/15/14
 *
 */

define([
    'text!presentationeditor/main/app/template/TableSettingsAdvanced.template',
    'common/main/lib/view/AdvancedSettingsWindow',
], function (contentTemplate) {
    'use strict';

    PE.Views.TableSettingsAdvanced = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            alias: 'TableSettingsAdvanced',
            contentWidth: 280,
            contentHeight: 300,
            storageName: 'pe-table-settings-adv-category',
            sizeMax: {width: 55.88, height: 55.88},
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle,
                items: [
                    {panelId: 'id-adv-table-general',    panelCaption: this.textGeneral},
                    {panelId: 'id-adv-table-placement',  panelCaption: this.textPlacement},
                    {panelId: 'id-adv-table-cell-props', panelCaption: this.textWidthSpaces},
                    {panelId: 'id-adv-table-alttext',    panelCaption: this.textAlt}
                ],
                contentTemplate: _.template(contentTemplate)({
                    scope: this
                })
            }, options);

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);

            this.spinners = [];

            this._changedProps = null;
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

            this._initialMarginsDefault = false;  // если для всех выделенных ячеек пришло одинаковое значение Flag=0 (Use Default Margins)
            this._originalProps = new Asc.CTableProp(this.options.tableProps);
            this.slideSize = this.options.slideSize;
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);

            var me = this;
            // General
            this.inputTableName = new Common.UI.InputField({
                el          : $('#tableadv-name'),
                allowBlank  : true,
                validateOnBlur: false,
                style       : 'width: 100%;'
            }).on('changed:after', function() {
                me.isTableNameChanged = true;
            });

            // Placement
            this.spnWidth = new Common.UI.MetricSpinner({
                el: $('#tableadv-spin-width'),
                step: .1,
                width: 85,
                defaultUnit : "cm",
                value: '3 cm',
                maxValue: 55.88,
                minValue: 0
            });
            this.spnWidth.on('change', _.bind(function(field){
                if (this.btnRatio.pressed) {
                    var w = field.getNumberValue();
                    var h = w/this._nRatio;
                    if (h>this.sizeMax.height) {
                        h = this.sizeMax.height;
                        w = h * this._nRatio;
                        this.spnWidth.setValue(w, true);
                    }
                    this.spnHeight.setValue(h, true);
                }
            }, this));
            this.spinners.push(this.spnWidth);

            this.spnHeight = new Common.UI.MetricSpinner({
                el: $('#tableadv-spin-height'),
                step: .1,
                width: 85,
                defaultUnit : "cm",
                value: '3 cm',
                maxValue: 55.88,
                minValue: 0
            });
            this.spnHeight.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                var h = field.getNumberValue(), w = null;
                if (this.btnRatio.pressed) {
                    w = h * this._nRatio;
                    if (w>this.sizeMax.width) {
                        w = this.sizeMax.width;
                        h = w/this._nRatio;
                        this.spnHeight.setValue(h, true);
                    }
                    this.spnWidth.setValue(w, true);
                }
            }, this));
            this.spinners.push(this.spnHeight);

            this.btnRatio = new Common.UI.Button({
                parentEl: $('#tableadv-button-ratio'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-advanced-ratio',
                style: 'margin-bottom: 1px;',
                enableToggle: true,
                hint: this.textKeepRatio
            });
            this.btnRatio.on('click', _.bind(function(btn, e) {
                if (btn.pressed && this.spnHeight.getNumberValue()>0) {
                    this._nRatio = this.spnWidth.getNumberValue()/this.spnHeight.getNumberValue();
                }
            }, this));

            this.spnX = new Common.UI.MetricSpinner({
                el: $('#tableadv-spin-x'),
                step: .1,
                width: 85,
                defaultUnit : "cm",
                defaultValue : 0,
                value: '0 cm',
                maxValue: 55.87,
                minValue: -55.87
            });
            this.spinners.push(this.spnX);

            this.spnY = new Common.UI.MetricSpinner({
                el: $('#tableadv-spin-y'),
                step: .1,
                width: 85,
                defaultUnit : "cm",
                defaultValue : 0,
                value: '0 cm',
                maxValue: 55.87,
                minValue: -55.87
            });
            this.spinners.push(this.spnY);

            this.cmbFromX = new Common.UI.ComboBox({
                el: $('#tableadv-combo-from-x'),
                cls: 'input-group-nr',
                style: "width: 125px;",
                menuStyle: 'min-width: 125px;',
                data: [
                    { value: 'left', displayValue: this.textTopLeftCorner },
                    { value: 'center', displayValue: this.textCenter }
                ],
                editable: false,
                takeFocusOnClose: true
            });

            this.cmbFromY = new Common.UI.ComboBox({
                el: $('#tableadv-combo-from-y'),
                cls: 'input-group-nr',
                style: "width: 125px;",
                menuStyle: 'min-width: 125px;',
                data: [
                    { value: 'left', displayValue: this.textTopLeftCorner },
                    { value: 'center', displayValue: this.textCenter }
                ],
                editable: false,
                takeFocusOnClose: true
            });

            this._marginsChange = function(field, newValue, oldValue, eOpts, source, property){
                if (source=='table')
                    this.TableMargins[property] = field.getNumberValue();
                else
                    this.CellMargins[property] = field.getNumberValue();
            };

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
                maxValue: 55.87,
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
                maxValue: 55.87,
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
                maxValue: 55.87,
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
                maxValue: 55.87,
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

            // Alt Text

            this.inputAltTitle = new Common.UI.InputField({
                el          : $('#tableadv-alt-title'),
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
                this.inputTableName, // 0 tab
                this.spnWidth, this.btnRatio, this.spnHeight, this.spnX, this.cmbFromX, this.spnY, this.cmbFromY, // 1 tab
                this.chCellMargins, this.spnMarginTop, this.spnMarginLeft, this.spnMarginBottom, this.spnMarginRight,
                this.spnTableMarginTop, this.spnTableMarginLeft, this.spnTableMarginBottom, this.spnTableMarginRight, // 2 tab
                this.inputAltTitle, this.textareaAltDescription  // 3 tab
            ]).concat(this.getFooterButtons());
        },

        onCategoryClick: function(btn, index) {
            Common.Views.AdvancedSettingsWindow.prototype.onCategoryClick.call(this, btn, index);

            var me = this;
            setTimeout(function(){
                switch (index) {
                    case 0:
                        me.inputTableName.focus();
                        break;
                    case 1:
                        me.spnWidth.focus();
                        break;
                    case 2:
                        if (!me.spnMarginTop.isDisabled())
                            me.spnMarginTop.focus();
                        else
                            me.spnTableMarginTop.focus();
                        break;
                    case 3:
                        me.inputAltTitle.focus();
                        break;
                }
            }, 10);
        },

        afterRender: function() {
            this.updateMetricUnit();
            this._setDefaults(this._originalProps);
            if (this.storageName) {
                var value = Common.localStorage.getItem(this.storageName);
                this.setActiveCategory((value!==null) ? parseInt(value) : 0);
            }
        },

        getSettings: function() {
            if (this.isTableNameChanged)
                this._changedProps.put_TableName(this.inputTableName.getValue());

            if (this.spnHeight.getValue()!=='')
                this._changedProps.put_FrameHeight(Common.Utils.Metric.fnRecalcToMM(this.spnHeight.getNumberValue()));
            if (this.spnWidth.getValue()!=='')
                this._changedProps.put_FrameWidth(Common.Utils.Metric.fnRecalcToMM(this.spnWidth.getNumberValue()));
            this._changedProps.put_FrameLockAspect(this.btnRatio.pressed);

            if (this.spnX.getValue() !== '') {
                var x = Common.Utils.Metric.fnRecalcToMM(this.spnX.getNumberValue());
                if (this.cmbFromX.getValue() === 'center') {
                    x = (this.slideSize.width/36000)/2 + x;
                }
                this._changedProps.put_FrameX(x);
            }
            if (this.spnY.getValue() !== '') {
                var y = Common.Utils.Metric.fnRecalcToMM(this.spnY.getNumberValue());
                if (this.cmbFromY.getValue() === 'center') {
                    y = (this.slideSize.height/36000)/2 + y;
                }
                this._changedProps.put_FrameY(y);
            }

            if (this.isAltTitleChanged)
                this._changedProps.put_TableCaption(this.inputAltTitle.getValue());

            if (this.isAltDescChanged)
                this._changedProps.put_TableDescription(this.textareaAltDescription.val());

            return { tableProps: this._changedProps };
        },

        _setDefaults: function(props) {
            if (props ){
                this._allTable = !props.get_CellSelect();

                // general
                var value = props.get_TableName();
                this.inputTableName.setValue(value ? value : '');

                // placement
                this.spnWidth.setMaxValue(this.sizeMax.width);
                this.spnHeight.setMaxValue(this.sizeMax.height);
                this.spnWidth.setValue(Common.Utils.Metric.fnRecalcFromMM(props.get_FrameWidth()).toFixed(2), true);
                this.spnHeight.setValue(Common.Utils.Metric.fnRecalcFromMM(props.get_FrameHeight()).toFixed(2), true);

                value = props.get_FrameLockAspect();
                this.btnRatio.toggle(value);
                if (props.get_FrameHeight()>0)
                    this._nRatio = props.get_FrameWidth()/props.get_FrameHeight();

                this.cmbFromX.setValue('left');
                this.cmbFromY.setValue('left');

                var position = {x: props.get_FrameX(), y: props.get_FrameY()};
                this.spnX.setValue((position.x !== null && position.x !== undefined) ? Common.Utils.Metric.fnRecalcFromMM(position.x) : '', true);
                this.spnY.setValue((position.y !== null && position.y !== undefined) ? Common.Utils.Metric.fnRecalcFromMM(position.y) : '', true);

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

                value = props.get_TableCaption();
                this.inputAltTitle.setValue(value ? value : '');

                value = props.get_TableDescription();
                this.textareaAltDescription.val(value ? value : '');

                this._changedProps = new Asc.CTableProp();
            }
        },

        fillMargins : function (checkMarginsState) {
            if ( this._initialMarginsDefault && checkMarginsState=='unchecked' ) {
                // изначально для всех ячеек использовали DefaultMargins, а теперь снимаем галку -> выставим в поля для маргинов 0, а не пустые значения
                if (this.CellMargins.Left=== null) this.CellMargins.Left = 0;
                if (this.CellMargins.Top=== null) this.CellMargins.Top = 0;
                if (this.CellMargins.Right=== null) this.CellMargins.Right = 0;
                if (this.CellMargins.Bottom=== null) this.CellMargins.Bottom = 0;
            }

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

        updateMetricUnit: function() {
            if (this.spinners) {
                for (var i=0; i<this.spinners.length; i++) {
                    var spinner = this.spinners[i];
                    spinner.setDefaultUnit(Common.Utils.Metric.getCurrentMetricName());
                    spinner.setStep(Common.Utils.Metric.getCurrentMetric()==Common.Utils.Metric.c_MetricUnits.pt ? 1 : 0.1);
                }
            }
            this.sizeMax = {
                width: Common.Utils.Metric.fnRecalcFromMM(this.options.sizeMax.width*10),
                height: Common.Utils.Metric.fnRecalcFromMM(this.options.sizeMax.height*10)
            };
        },

        textWidthSpaces:    'Margins',
        textMargins:        'Cell Margins',
        textTop:            'Top',
        textLeft:           'Left',
        textBottom:         'Bottom',
        textRight:          'Right',
        textTitle:          'Table - Advanced Settings',
        textDefaultMargins: 'Default Margins',
        textCheckMargins:   'Use default margins',
        textAlt: 'Alternative Text',
        textAltTitle: 'Title',
        textAltDescription: 'Description',
        textAltTip: 'The alternative text-based representation of the visual object information, which will be read to the people with vision or cognitive impairments to help them better understand what information there is in the image, autoshape, chart or table.',
        textPlacement: 'Placement',
        textSize: 'Size',
        textPosition: 'Position',
        textHorizontal: 'Horizontal',
        textVertical: 'Vertical',
        textFrom: 'From',
        textTopLeftCorner: 'Top Left Corner',
        textCenter: 'Center',
        textWidth: 'Width',
        textHeight: 'Height',
        textKeepRatio: 'Constant Proportions',
        textGeneral: 'General',
        textTableName: 'Table name'

    }, PE.Views.TableSettingsAdvanced || {}));
});