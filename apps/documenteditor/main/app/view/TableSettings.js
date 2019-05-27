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
 *  TableSettings.js
 *
 *  Created by Julia Radzhabova on 2/07/14
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!documenteditor/main/app/template/TableSettings.template',
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/component/Button',
    'common/main/lib/component/CheckBox',
    'common/main/lib/component/ThemeColorPalette',
    'common/main/lib/component/ColorButton',
    'common/main/lib/component/ComboBorderSize',
    'common/main/lib/component/ComboDataView',
    'common/main/lib/view/InsertTableDialog',
    'documenteditor/main/app/view/TableSettingsAdvanced',
    'documenteditor/main/app/view/TableFormulaDialog'
], function (menuTemplate, $, _, Backbone) {
    'use strict';

    DE.Views.TableSettings = Backbone.View.extend(_.extend({
        el: '#id-table-settings',

        // Compile our stats template
        template: _.template(menuTemplate),

        // Delegated events for creating new items, and clearing completed ones.
        events: {
        },

        options: {
            alias: 'TableSettings'
        },

        initialize: function () {
            this._initSettings = true;

            this._state = {
                TemplateId: 0,
                CheckHeader: false,
                CheckTotal: false,
                CheckBanded: false,
                CheckFirst: false,
                CheckLast: false,
                CheckColBanded: false,
                BackColor: '#000000',
                RepeatRow: false,
                DisabledControls: false,
                Width: null,
                Height: null
            };
            this.spinners = [];
            this.lockedControls = [];
            this._locked = false;
            this._originalLook = new Asc.CTablePropLook();

            this._originalProps = null;
            this.CellBorders = {};
            this.CellColor = {Value: 1, Color: 'transparent'};  // value=1 - цвет определен - прозрачный или другой, value=0 - цвет не определен, рисуем прозрачным
            this.BorderSize = 1;
            this._noApply = false;

            this.render();
        },

        onCheckTemplateChange: function(type, field, newValue, oldValue, eOpts) {
            if (this.api)   {
                var properties = new Asc.CTableProp();
                var look = (this._originalLook) ? this._originalLook : new Asc.CTablePropLook();
                switch (type) {
                    case 0:
                        look.put_FirstRow(field.getValue()=='checked');
                        break;
                    case 1:
                        look.put_LastRow(field.getValue()=='checked');
                        break;
                    case 2:
                        look.put_BandHor(field.getValue()=='checked');
                        break;
                    case 3:
                        look.put_FirstCol(field.getValue()=='checked');
                        break;
                    case 4:
                        look.put_LastCol(field.getValue()=='checked');
                        break;
                    case 5:
                        look.put_BandVer(field.getValue()=='checked');
                        break;
                }
                properties.put_TableLook(look);
                this.api.tblApply(properties);
            }
            this.fireEvent('editcomplete', this);
        },

        onTableTemplateSelect: function(combo, record){
            if (this.api && !this._noApply) {
                var properties = new Asc.CTableProp();
                properties.put_TableStyle(record.get('templateId'));
                this.api.tblApply(properties);
            }
            this.fireEvent('editcomplete', this);
        },

        onCheckRepeatRowChange: function(field, newValue, oldValue, eOpts) {
            if (this.api)   {
                var properties = new Asc.CTableProp();
                properties.put_RowsInHeader(field.getValue()=='checked');
                this.api.tblApply(properties);
            }
            this.fireEvent('editcomplete', this);
        },

        onColorsBackSelect: function(picker, color) {
            this.btnBackColor.setColor(color);
            this.CellColor = {Value: 1, Color: color};

            if (this.api) {
                var properties = new Asc.CTableProp();
                var background = new Asc.CBackground();
                properties.put_CellsBackground(background);

                if (this.CellColor.Color=='transparent') {
                    background.put_Value(1);
                } else {
                    background.put_Value(0);
                    background.put_Color(Common.Utils.ThemeColor.getRgbColor(this.CellColor.Color));
                }

                properties.put_CellSelect(true);
                this.api.tblApply(properties);
            }

            this.fireEvent('editcomplete', this);
        },

        addNewColor: function(picker, btn) {
            picker.addNewColor((typeof(btn.color) == 'object') ? btn.color.color : btn.color);
        },

        onColorsBorderSelect: function(picker, color) {
            this.btnBorderColor.setColor(color);
        },

        onBtnBordersClick: function(btn, eOpts){
            this._UpdateBordersStyle(btn.options.strId, true);
            if (this.api) {
                var properties = new Asc.CTableProp();
                properties.put_CellBorders(this.CellBorders);
                properties.put_CellSelect(true);
                this.api.tblApply(properties);
            }
            this.fireEvent('editcomplete', this);
        },

        onBorderSizeSelect: function(combo, record) {
            this.BorderSize = record.value;
        },

        onEditClick: function(menu, item, e) {
            if (this.api) {
                switch (item.value) {
                    case 0: this.api.selectRow(); break;
                    case 1: this.api.selectColumn(); break;
                    case 2: this.api.selectCell(); break;
                    case 3: this.api.selectTable(); break;
                    case 4: this.api.addRowAbove(); break;
                    case 5: this.api.addRowBelow(); break;
                    case 6: this.api.addColumnLeft(); break;
                    case 7: this.api.addColumnRight(); break;
                    case 8: this.api.remRow(); break;
                    case 9: this.api.remColumn(); break;
                    case 10: this.api.remTable(); break;
                    case 11: this.api.MergeCells(); break;
                    case 12: this.splitCells(menu, item, e); break;
                }
            }
            this.fireEvent('editcomplete', this);
        },

        splitCells: function(menu, item, e) {
            var me = this;
            (new Common.Views.InsertTableDialog({
                split: true,
                handler: function(result, value) {
                    if (result == 'ok') {
                        if (me.api) {
                            me.api.SplitCell(value.columns, value.rows);
                        }
                    }
                    me.fireEvent('editcomplete', me);
                }
            })).show();
        },

        render: function () {
            var el = $(this.el);
            el.html(this.template({
                scope: this
            }));
        },

        setApi: function(o) {
            this.api = o;
            if (o) {
                this.api.asc_registerCallback('asc_onInitTableTemplates', _.bind(this._onInitTemplates, this));
            }
            return this;
        },

        createDelayedControls: function() {
            this.chHeader = new Common.UI.CheckBox({
                el: $('#table-checkbox-header'),
                labelText: this.textHeader
            });
            this.lockedControls.push(this.chHeader);

            this.chTotal = new Common.UI.CheckBox({
                el: $('#table-checkbox-total'),
                labelText: this.textTotal
            });
            this.lockedControls.push(this.chTotal);

            this.chBanded = new Common.UI.CheckBox({
                el: $('#table-checkbox-banded'),
                labelText: this.textBanded
            });
            this.lockedControls.push(this.chBanded);

            this.chFirst = new Common.UI.CheckBox({
                el: $('#table-checkbox-first'),
                labelText: this.textFirst
            });
            this.lockedControls.push(this.chFirst);

            this.chLast = new Common.UI.CheckBox({
                el: $('#table-checkbox-last'),
                labelText: this.textLast
            });
            this.lockedControls.push(this.chLast);

            this.chColBanded = new Common.UI.CheckBox({
                el: $('#table-checkbox-col-banded'),
                labelText: this.textBanded
            });
            this.lockedControls.push(this.chColBanded);

            this.chHeader.on('change', _.bind(this.onCheckTemplateChange, this, 0));
            this.chTotal.on('change', _.bind(this.onCheckTemplateChange, this, 1));
            this.chBanded.on('change', _.bind(this.onCheckTemplateChange, this, 2));
            this.chFirst.on('change', _.bind(this.onCheckTemplateChange, this, 3));
            this.chLast.on('change', _.bind(this.onCheckTemplateChange, this, 4));
            this.chColBanded.on('change', _.bind(this.onCheckTemplateChange, this, 5));

            var _arrBorderPosition = [
                ['l', 'btn-borders-small btn-position-left', 'table-button-border-left',            this.tipLeft],
                ['c','btn-borders-small btn-position-inner-vert', 'table-button-border-inner-vert', this.tipInnerVert],
                ['r','btn-borders-small btn-position-right', 'table-button-border-right',           this.tipRight],
                ['t','btn-borders-small btn-position-top', 'table-button-border-top',               this.tipTop],
                ['m','btn-borders-small btn-position-inner-hor', 'table-button-border-inner-hor',   this.tipInnerHor],
                ['b', 'btn-borders-small btn-position-bottom', 'table-button-border-bottom',        this.tipBottom],
                ['cm', 'btn-borders-small btn-position-inner', 'table-button-border-inner',         this.tipInner],
                ['lrtb', 'btn-borders-small btn-position-outer', 'table-button-border-outer',       this.tipOuter],
                ['lrtbcm', 'btn-borders-small btn-position-all', 'table-button-border-all',         this.tipAll],
                ['', 'btn-borders-small btn-position-none', 'table-button-border-none',             this.tipNone]
            ];

            this._btnsBorderPosition = [];
            _.each(_arrBorderPosition, function(item, index, list){
                var _btn = new Common.UI.Button({
                    cls: 'btn-toolbar',
                    iconCls: item[1],
                    strId   :item[0],
                    hint: item[3]
                });
                _btn.render( $('#'+item[2])) ;
                _btn.on('click', _.bind(this.onBtnBordersClick, this));
                this._btnsBorderPosition.push( _btn );
                this.lockedControls.push(_btn);
            }, this);

            this.cmbBorderSize = new Common.UI.ComboBorderSize({
                el: $('#table-combo-border-size'),
                style: "width: 93px;"
            });
            this.BorderSize = this.cmbBorderSize.store.at(1).get('value');
            this.cmbBorderSize.setValue(this.BorderSize);
            this.cmbBorderSize.on('selected', _.bind(this.onBorderSizeSelect, this));
            this.lockedControls.push(this.cmbBorderSize);

            this.btnEdit = new Common.UI.Button({
                cls: 'btn-icon-default',
                iconCls: 'btn-edit-table',
                menu        : new Common.UI.Menu({
                    menuAlign: 'tr-br',
                    items: [
                        { caption: this.selectRowText, value: 0 },
                        { caption: this.selectColumnText,  value: 1 },
                        { caption: this.selectCellText,  value: 2 },
                        { caption: this.selectTableText,  value: 3 },
                        { caption: '--' },
                        { caption: this.insertRowAboveText, value: 4 },
                        { caption: this.insertRowBelowText,  value: 5 },
                        { caption: this.insertColumnLeftText,  value: 6 },
                        { caption: this.insertColumnRightText,  value: 7 },
                        { caption: '--' },
                        { caption: this.deleteRowText, value: 8 },
                        { caption: this.deleteColumnText,  value: 9 },
                        { caption: this.deleteTableText,  value: 10 },
                        { caption: '--' },
                        { caption: this.mergeCellsText,  value: 11 },
                        { caption: this.splitCellsText,  value: 12 }
                    ]
                })
            });
            this.btnEdit.render( $('#table-btn-edit')) ;
            this.mnuMerge = this.btnEdit.menu.items[this.btnEdit.menu.items.length-2];
            this.mnuSplit = this.btnEdit.menu.items[this.btnEdit.menu.items.length-1];

            this.btnEdit.menu.on('show:after', _.bind( function(){
                if (this.api) {
                    this.mnuMerge.setDisabled(!this.api.CheckBeforeMergeCells());
                    this.mnuSplit.setDisabled(!this.api.CheckBeforeSplitCells());
                }
            }, this));
            this.btnEdit.menu.on('item:click', _.bind(this.onEditClick, this));
            this.lockedControls.push(this.btnEdit);

            this.chRepeatRow = new Common.UI.CheckBox({
                el: $('#table-checkbox-repeat-row'),
                labelText: this.strRepeatRow
            });
            this.chRepeatRow.on('change', _.bind(this.onCheckRepeatRowChange, this));
            this.lockedControls.push(this.chRepeatRow);

            this.numHeight = new Common.UI.MetricSpinner({
                el: $('#table-spin-cell-height'),
                step: .1,
                width: 115,
                defaultUnit : "cm",
                value: '1 cm',
                maxValue: 55.88,
                minValue: 0
            });
            this.numHeight.on('change', _.bind(function(field, newValue, oldValue, eOpts){			
				var _props = new Asc.CTableProp();
				_props.put_RowHeight(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));				
				this.api.tblApply(_props);
            }, this));
            this.lockedControls.push(this.numHeight);
            this.spinners.push(this.numHeight);

            this.numWidth = new Common.UI.MetricSpinner({
                el: $('#table-spin-cell-width'),
                step: .1,
                width: 115,
                defaultUnit : "cm",
                value: '1 cm',
                maxValue: 55.88,
                minValue: 0
            });
            this.numWidth.on('change', _.bind(function(field, newValue, oldValue, eOpts){
				var _props = new Asc.CTableProp();
				_props.put_ColumnWidth(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
				this.api.tblApply(_props);
            }, this));
            this.lockedControls.push(this.numWidth);
            this.spinners.push(this.numWidth);

            this.btnDistributeRows = new Common.UI.Button({
                el: $('#table-btn-distrub-rows')
            });
            this.lockedControls.push(this.btnDistributeRows);
            this.btnDistributeRows.on('click', _.bind(function(btn){
                this.api.asc_DistributeTableCells(false);
            }, this));

            this.btnDistributeCols = new Common.UI.Button({
                el: $('#table-btn-distrub-cols')
            });
            this.lockedControls.push(this.btnDistributeCols);
            this.btnDistributeCols.on('click', _.bind(function(btn){
                this.api.asc_DistributeTableCells(true);
            }, this));

            this.btnAddFormula = new Common.UI.Button({
                el: $('#table-btn-add-formula')
            });
            this.lockedControls.push(this.btnAddFormula);
            this.btnAddFormula.on('click', _.bind(this.onAddFormula, this));

            this.linkAdvanced = $('#table-advanced-link');
            $(this.el).on('click', '#table-advanced-link', _.bind(this.openAdvancedSettings, this));
        },

        createDelayedElements: function() {
            this.createDelayedControls();
            this.UpdateThemeColors();
            this.updateMetricUnit();
            this._initSettings = false;
        },

        ChangeSettings: function(props) {
            if (this._initSettings)
                this.createDelayedElements();

            this.disableControls(this._locked); // need to update combodataview after disabled state

            if (props )
            {
                this._originalProps = new Asc.CTableProp(props);
                this._originalProps.put_CellSelect(true);

                var value = props.get_ColumnWidth();
                if ((this._state.Width === undefined || value === undefined)&&(this._state.Width!==value) ||
					Math.abs(this._state.Width-value)>0.001) {
                    this.numWidth.setValue((value !== null && value !== undefined) ? Common.Utils.Metric.fnRecalcFromMM(value) : '', true);
                    this._state.Width=value;
                }
                value = props.get_RowHeight();
                if ((this._state.Height === undefined || value === undefined)&&(this._state.Height!==value) ||
					Math.abs(this._state.Height-value)>0.001) {
                    this.numHeight.setValue((value !== null && value !== undefined) ? Common.Utils.Metric.fnRecalcFromMM(value) : '', true);
                    this._state.Height=value;
                }

                //for table-template
                value = props.get_TableStyle();
                if (this._state.TemplateId!==value || this._isTemplatesChanged) {
                    this.cmbTableTemplate.suspendEvents();
                    var rec = this.cmbTableTemplate.menuPicker.store.findWhere({
                        templateId: value
                    });
                    this.cmbTableTemplate.menuPicker.selectRecord(rec);
                    this.cmbTableTemplate.resumeEvents();

                    if (this._isTemplatesChanged) {
                        if (rec)
                            this.cmbTableTemplate.fillComboView(this.cmbTableTemplate.menuPicker.getSelectedRec()[0],true);
                        else
                            this.cmbTableTemplate.fillComboView(this.cmbTableTemplate.menuPicker.store.at(0), true);
                    }
                    this._state.TemplateId=value;
                }
                this._isTemplatesChanged = false;

                var look = props.get_TableLook();
                if (look) {
                    value = look.get_FirstRow();
                    if (this._state.CheckHeader!==value) {
                        this.chHeader.setValue(value, true);
                        this._state.CheckHeader=value;
                        this._originalLook.put_FirstRow(value);
                    }

                    value = look.get_LastRow();
                    if (this._state.CheckTotal!==value) {
                        this.chTotal.setValue(value, true);
                        this._state.CheckTotal=value;
                        this._originalLook.put_LastRow(value);
                    }

                    value = look.get_BandHor();
                    if (this._state.CheckBanded!==value) {
                        this.chBanded.setValue(value, true);
                        this._state.CheckBanded=value;
                        this._originalLook.put_BandHor(value);
                    }

                    value = look.get_FirstCol();
                    if (this._state.CheckFirst!==value) {
                        this.chFirst.setValue(value, true);
                        this._state.CheckFirst=value;
                        this._originalLook.put_FirstCol(value);
                    }

                    value = look.get_LastCol();
                    if (this._state.CheckLast!==value) {
                        this.chLast.setValue(value, true);
                        this._state.CheckLast=value;
                        this._originalLook.put_LastCol(value);
                    }

                    value = look.get_BandVer();
                    if (this._state.CheckColBanded!==value) {
                        this.chColBanded.setValue(value, true);
                        this._state.CheckColBanded=value;
                        this._originalLook.put_BandVer(value);
                    }
                }

                // background colors
                var background = props.get_CellsBackground();
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

                var type1 = typeof(this.CellColor.Color),
                    type2 = typeof(this._state.BackColor);
                if ( (type1 !== type2) || (type1=='object' &&
                    (this.CellColor.Color.effectValue!==this._state.BackColor.effectValue || this._state.BackColor.color.indexOf(this.CellColor.Color.color)<0)) ||
                    (type1!='object' && this._state.BackColor.indexOf(this.CellColor.Color)<0 )) {

                    this.btnBackColor.setColor(this.CellColor.Color);
                    if ( typeof(this.CellColor.Color) == 'object' ) {
                        var isselected = false;
                        for (var i=0; i<10; i++) {
                            if ( Common.Utils.ThemeColor.ThemeValues[i] == this.CellColor.Color.effectValue ) {
                                this.colorsBack.select(this.CellColor.Color,true);
                                isselected = true;
                                break;
                            }
                        }
                        if (!isselected) this.colorsBack.clearSelection();
                    } else
                        this.colorsBack.select(this.CellColor.Color,true);

                    this._state.BackColor = this.CellColor.Color;
                }

                value = props.get_RowsInHeader();
                if ( this._state.RepeatRow!==value ) {
                    this.chRepeatRow.setValue(!!value, true);
                    this.chRepeatRow.setDisabled(value === null);
                    this._state.RepeatRow=value;
                }
            }
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

        _UpdateBordersStyle: function(border) {
            this.CellBorders = new Asc.CBorders();
            var updateBorders = this.CellBorders;

            var visible = (border != '');

            if (border.indexOf('l') > -1 || !visible) {
                if (updateBorders.get_Left()===null || updateBorders.get_Left()===undefined)
                    updateBorders.put_Left(new Asc.asc_CTextBorder());
                this._UpdateBorderStyle (updateBorders.get_Left(), visible);
            }
            if (border.indexOf('t') > -1 || !visible) {
                if (updateBorders.get_Top()===null || updateBorders.get_Top()===undefined)
                    updateBorders.put_Top(new Asc.asc_CTextBorder());
                this._UpdateBorderStyle (updateBorders.get_Top(), visible);
            }
            if (border.indexOf('r') > -1 || !visible) {
                if (updateBorders.get_Right()===null || updateBorders.get_Right()===undefined)
                    updateBorders.put_Right(new Asc.asc_CTextBorder());
                this._UpdateBorderStyle (updateBorders.get_Right(), visible);
            }
            if (border.indexOf('b') > -1 || !visible) {
                if (updateBorders.get_Bottom()===null || updateBorders.get_Bottom()===undefined)
                    updateBorders.put_Bottom(new Asc.asc_CTextBorder());
                this._UpdateBorderStyle (updateBorders.get_Bottom(), visible);
            }
            if (border.indexOf('c') > -1 || !visible) {
                if (updateBorders.get_InsideV()===null || updateBorders.get_InsideV()===undefined)
                    updateBorders.put_InsideV(new Asc.asc_CTextBorder());
                this._UpdateBorderStyle (updateBorders.get_InsideV(), visible);
            }
            if (border.indexOf('m') > -1 || !visible) {
                if (updateBorders.get_InsideH()===null || updateBorders.get_InsideH()===undefined)
                    updateBorders.put_InsideH(new Asc.asc_CTextBorder());
                this._UpdateBorderStyle (updateBorders.get_InsideH(), visible);
            }
        },

        _UpdateBorderStyle: function(border, visible) {
            if (null == border)
                border = new Asc.asc_CTextBorder();

            if (visible && this.BorderSize > 0){
                var size = parseFloat(this.BorderSize);
                border.put_Value(1);
                border.put_Size(size * 25.4 / 72.0);
                var color = Common.Utils.ThemeColor.getRgbColor(this.btnBorderColor.color);
                border.put_Color(color);
            }
            else {
                border.put_Value(0);
            }
        },

        UpdateThemeColors: function() {
             if (!this.btnBackColor) {
                // create color buttons
                 this.btnBorderColor = new Common.UI.ColorButton({
                     style: "width:45px;",
                     menu        : new Common.UI.Menu({
                         items: [
                             { template: _.template('<div id="table-border-color-menu" style="width: 169px; height: 220px; margin: 10px;"></div>') },
                             { template: _.template('<a id="table-border-color-new" style="padding-left:12px;">' + this.textNewColor + '</a>') }
                         ]
                     })
                 });
                 this.btnBorderColor.render( $('#table-border-color-btn'));
                 this.btnBorderColor.setColor('000000');
                 this.lockedControls.push(this.btnBorderColor);
                 this.borderColor = new Common.UI.ThemeColorPalette({
                     el: $('#table-border-color-menu')
                 });
                 this.borderColor.on('select', _.bind(this.onColorsBorderSelect, this));
                 this.btnBorderColor.menu.items[1].on('click',  _.bind(this.addNewColor, this, this.borderColor, this.btnBorderColor));

                 this.btnBackColor = new Common.UI.ColorButton({
                     style: "width:45px;",
                     menu        : new Common.UI.Menu({
                         items: [
                             { template: _.template('<div id="table-back-color-menu" style="width: 169px; height: 220px; margin: 10px;"></div>') },
                             { template: _.template('<a id="table-back-color-new" style="padding-left:12px;">' + this.textNewColor + '</a>') }
                         ]
                     })
                 });
                 this.btnBackColor.render( $('#table-back-color-btn'));
                 this.lockedControls.push(this.btnBackColor);
                 this.colorsBack = new Common.UI.ThemeColorPalette({
                     el: $('#table-back-color-menu'),
                     transparent: true
                 });
                 this.colorsBack.on('select', _.bind(this.onColorsBackSelect, this));
                 this.btnBackColor.menu.items[1].on('click',  _.bind(this.addNewColor, this, this.colorsBack, this.btnBackColor));
             }
             this.colorsBack.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
             this.borderColor.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
             this.btnBorderColor.setColor(this.borderColor.getColor());
        },

        _onInitTemplates: function(Templates){
            var self = this;
            this._isTemplatesChanged = true;

            if (!this.cmbTableTemplate) {
                this.cmbTableTemplate = new Common.UI.ComboDataView({
                    itemWidth: 70,
                    itemHeight: 50,
                    menuMaxHeight: 300,
                    enableKeyEvents: true,
                    cls: 'combo-template'
                });
                this.cmbTableTemplate.render($('#table-combo-template'));
                this.cmbTableTemplate.openButton.menu.cmpEl.css({
                    'min-width': 175,
                    'max-width': 175
                });
                this.cmbTableTemplate.on('click', _.bind(this.onTableTemplateSelect, this));
                this.cmbTableTemplate.openButton.menu.on('show:after', function () {
                    self.cmbTableTemplate.menuPicker.scroller.update({alwaysVisibleY: true});
                });
                this.lockedControls.push(this.cmbTableTemplate);
            }
            
            var count = self.cmbTableTemplate.menuPicker.store.length;
            if (count>0 && count==Templates.length) {
                var data = self.cmbTableTemplate.menuPicker.store.models;
                _.each(Templates, function(template, index){
                    data[index].set('imageUrl', template.get_Image());
                });
            } else {
                self.cmbTableTemplate.menuPicker.store.reset([]);
                var arr = [];
                _.each(Templates, function(template){
                    arr.push({
                        imageUrl: template.get_Image(),
                        id     : Common.UI.getId(),
                        templateId: template.get_Id()
                    });
                });
                self.cmbTableTemplate.menuPicker.store.add(arr);
            }
        },

        openAdvancedSettings: function(e) {
            if (this.linkAdvanced.hasClass('disabled')) return;

            var me = this;
            var win;
            if (me.api && !this._locked){
                var selectedElements = me.api.getSelectedElements();
                if (selectedElements && selectedElements.length>0){
                    var elType, elValue;
                    for (var i = selectedElements.length - 1; i >= 0; i--) {
                        elType = selectedElements[i].get_ObjectType();
                        elValue = selectedElements[i].get_ObjectValue();
                        if (Asc.c_oAscTypeSelectElement.Table == elType) {
                            (new DE.Views.TableSettingsAdvanced(
                            {
                                tableStylerRows: (elValue.get_CellBorders().get_InsideH()===null && elValue.get_CellSelect()==true) ? 1 : 2,
                                tableStylerColumns: (elValue.get_CellBorders().get_InsideV()===null && elValue.get_CellSelect()==true) ? 1 : 2,
                                tableProps: elValue,
                                borderProps: me.borderAdvancedProps,
                                sectionProps: me.api.asc_GetSectionProps(),
                                handler: function(result, value) {
                                    if (result == 'ok') {
                                        if (me.api) {
                                            me.borderAdvancedProps = value.borderProps;
                                            me.api.tblApply(value.tableProps);
                                        }
                                    }
                                    me.fireEvent('editcomplete', me);
                                }
                            })).show();
                            break;
                        }
                    }
                }
            }
        },

        onAddFormula: function(e) {
            var me = this;
            var win;
            if (me.api && !this._locked){
                (new DE.Views.TableFormulaDialog(
                {
                    api: me.api,
                    bookmarks: me.api.asc_GetBookmarksManager(),
                    handler: function(result, value) {
                        if (result == 'ok') {
                            if (me.api) {
                                me.api.asc_AddTableFormula(value);
                            }
                        }
                        me.fireEvent('editcomplete', me);
                    }
                })).show();
            }
        },

        setLocked: function (locked) {
            this._locked = locked;
        },

        disableControls: function(disable) {
            if (this._initSettings) return;
            
            if (this._state.DisabledControls!==disable) {
                this._state.DisabledControls = disable;
                _.each(this.lockedControls, function(item) {
                    item.setDisabled(disable);
                });
                this.linkAdvanced.toggleClass('disabled', disable);
            }
        },

        textBorders:        'Border\'s Style',
        textBorderColor:    'Color',
        textBackColor:      'Background color',
        textEdit:           'Rows & Columns',
        selectRowText           : 'Select Row',
        selectColumnText        : 'Select Column',
        selectCellText          : 'Select Cell',
        selectTableText         : 'Select Table',
        insertRowAboveText      : 'Insert Row Above',
        insertRowBelowText      : 'Insert Row Below',
        insertColumnLeftText    : 'Insert Column Left',
        insertColumnRightText   : 'Insert Column Right',
        deleteRowText           : 'Delete Row',
        deleteColumnText        : 'Delete Column',
        deleteTableText         : 'Delete Table',
        mergeCellsText          : 'Merge Cells',
        splitCellsText          : 'Split Cell...',
        splitCellTitleText      : 'Split Cell',
        textSelectBorders       : 'Select borders that you want to change',
        textAdvanced            : 'Show advanced settings',
        txtNoBorders            : 'No borders',
        textOK                  : 'OK',
        textCancel              : 'Cancel',
        textNewColor            : 'Add New Custom Color',
        textTemplate            : 'Select From Template',
        textRows                : 'Rows',
        textColumns             : 'Columns',
        textHeader              : 'Header',
        textTotal               : 'Total',
        textBanded              : 'Banded',
        textFirst               : 'First',
        textLast                : 'Last',
        textEmptyTemplate       : 'No templates',
        strRepeatRow            : 'Repeat as header row at the top of each page',
        tipTop:             'Set Outer Top Border Only',
        tipLeft:            'Set Outer Left Border Only',
        tipBottom:          'Set Outer Bottom Border Only',
        tipRight:           'Set Outer Right Border Only',
        tipAll:             'Set Outer Border and All Inner Lines',
        tipNone:            'Set No Borders',
        tipInner:           'Set Inner Lines Only',
        tipInnerVert:       'Set Vertical Inner Lines Only',
        tipInnerHor:        'Set Horizontal Inner Lines Only',
        tipOuter:           'Set Outer Border Only',
        textCellSize: 'Cell Size',
        textHeight: 'Height',
        textWidth: 'Width',
        textDistributeRows: 'Distribute rows',
        textDistributeCols: 'Distribute columns',
        textAddFormula: 'Add formula'

    }, DE.Views.TableSettings || {}));
});