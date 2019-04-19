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
 *  CellSettings.js
 *
 *  Created by Julia Radzhabova on 6/08/18
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!spreadsheeteditor/main/app/template/CellSettings.template',
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/component/Button',
    'common/main/lib/component/ThemeColorPalette',
    'common/main/lib/component/ColorButton',
    'common/main/lib/component/ComboBorderSize',
    'common/main/lib/view/OpenDialog'
], function (menuTemplate, $, _, Backbone) {
    'use strict';

    SSE.Views.CellSettings = Backbone.View.extend(_.extend({
        el: '#id-cell-settings',

        // Compile our stats template
        template: _.template(menuTemplate),

        // Delegated events for creating new items, and clearing completed ones.
        events: {
        },

        options: {
            alias: 'CellSettings'
        },

        initialize: function () {
            this._initSettings = true;

            this._state = {
                BackColor: undefined,
                DisabledControls: true,
                CellAngle: undefined,
                CSVOptions: new Asc.asc_CCSVAdvancedOptions(0, 4, '')
            };
            this.lockedControls = [];
            this._locked = true;
            this.isEditCell = false;
            this.isMultiSelect = false;
            this.BorderType = 1;

            this.render();
            this.createDelayedControls();

        },

        onColorsBackSelect: function(picker, color) {
            this.btnBackColor.setColor(color);

            if (this.api) {
                this.api.asc_setCellBackgroundColor(color == 'transparent' ? null : Common.Utils.ThemeColor.getRgbColor(color));
            }

            Common.NotificationCenter.trigger('edit:complete', this);
        },

        addNewColor: function(picker, btn) {
            picker.addNewColor((typeof(btn.color) == 'object') ? btn.color.color : btn.color);
        },

        onColorsBorderSelect: function(picker, color) {
            this.btnBorderColor.setColor(color);
        },

        onBtnBordersClick: function(btn, eOpts){
            if (this.api) {
                var new_borders = [],
                    bordersWidth = this.BorderType,
                    bordersColor = Common.Utils.ThemeColor.getRgbColor(this.btnBorderColor.color);

                if (btn.options.borderId == 'inner') {
                    new_borders[Asc.c_oAscBorderOptions.InnerV] = new Asc.asc_CBorder(bordersWidth, bordersColor);
                    new_borders[Asc.c_oAscBorderOptions.InnerH] = new Asc.asc_CBorder(bordersWidth, bordersColor);
                } else if (btn.options.borderId == 'all') {
                    new_borders[Asc.c_oAscBorderOptions.InnerV] = new Asc.asc_CBorder(bordersWidth, bordersColor);
                    new_borders[Asc.c_oAscBorderOptions.InnerH] = new Asc.asc_CBorder(bordersWidth, bordersColor);
                    new_borders[Asc.c_oAscBorderOptions.Left]   = new Asc.asc_CBorder(bordersWidth, bordersColor);
                    new_borders[Asc.c_oAscBorderOptions.Top]    = new Asc.asc_CBorder(bordersWidth, bordersColor);
                    new_borders[Asc.c_oAscBorderOptions.Right]  = new Asc.asc_CBorder(bordersWidth, bordersColor);
                    new_borders[Asc.c_oAscBorderOptions.Bottom] = new Asc.asc_CBorder(bordersWidth, bordersColor);
                } else if (btn.options.borderId == 'outer') {
                    new_borders[Asc.c_oAscBorderOptions.Left]   = new Asc.asc_CBorder(bordersWidth, bordersColor);
                    new_borders[Asc.c_oAscBorderOptions.Top]    = new Asc.asc_CBorder(bordersWidth, bordersColor);
                    new_borders[Asc.c_oAscBorderOptions.Right]  = new Asc.asc_CBorder(bordersWidth, bordersColor);
                    new_borders[Asc.c_oAscBorderOptions.Bottom] = new Asc.asc_CBorder(bordersWidth, bordersColor);
                } else if (btn.options.borderId != 'none') {
                    new_borders[btn.options.borderId]   = new Asc.asc_CBorder(bordersWidth, bordersColor);
                }

                this.api.asc_setCellBorders(new_borders);
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onBorderTypeSelect: function(combo, record) {
            this.BorderType = record.value;
        },

        onAngleChange: function(field, newValue, oldValue, eOpts) {
            this.api && this.api.asc_setCellAngle(field.getNumberValue());
        },

        onTextToColumn: function() {
            this.api.asc_TextImport(this._state.CSVOptions, _.bind(this.onTextToColumnCallback, this), false);
        },

        onTextToColumnCallback: function(data) {
            if (!data || !data.length) return;

            var me = this;
            (new Common.Views.OpenDialog({
                title: me.textWizard,
                closable: true,
                type: Common.Utils.importTextType.Columns,
                preview: true,
                previewData: data,
                settings: this._state.CSVOptions,
                api: me.api,
                handler: function (result, encoding, delimiter, delimiterChar) {
                    if (result == 'ok') {
                        if (me && me.api) {
                            me.api.asc_TextToColumns(new Asc.asc_CCSVAdvancedOptions(encoding, delimiter, delimiterChar));
                        }
                    }
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
                this.api.asc_registerCallback('asc_onEditCell', this.onApiEditCell.bind(this));
                this.api.asc_registerCallback('asc_onSelectionChanged', _.bind(this.onApiSelectionChanged, this));
            }
            return this;
        },

        createDelayedControls: function() {
            var _arrBorderPosition = [
                [Asc.c_oAscBorderOptions.Left,  'btn-borders-small btn-position-left',      'cell-button-border-left',        this.tipLeft],
                [Asc.c_oAscBorderOptions.InnerV,'btn-borders-small btn-position-inner-vert','cell-button-border-inner-vert',  this.tipInnerVert],
                [Asc.c_oAscBorderOptions.Right, 'btn-borders-small btn-position-right',     'cell-button-border-right',       this.tipRight],
                [Asc.c_oAscBorderOptions.Top,   'btn-borders-small btn-position-top',       'cell-button-border-top',         this.tipTop],
                [Asc.c_oAscBorderOptions.InnerH,'btn-borders-small btn-position-inner-hor', 'cell-button-border-inner-hor',   this.tipInnerHor],
                [Asc.c_oAscBorderOptions.Bottom,'btn-borders-small btn-position-bottom',    'cell-button-border-bottom',      this.tipBottom],
                [Asc.c_oAscBorderOptions.DiagU, 'btn-borders-small btn-position-diagu',    'cell-button-border-diagu',      this.tipDiagU],
                [Asc.c_oAscBorderOptions.DiagD, 'btn-borders-small btn-position-diagd',    'cell-button-border-diagd',      this.tipDiagD],
                ['inner',                       'btn-borders-small btn-position-inner',     'cell-button-border-inner',       this.tipInner],
                ['outer',                       'btn-borders-small btn-position-outer',     'cell-button-border-outer',       this.tipOuter],
                ['all',                         'btn-borders-small btn-position-all',       'cell-button-border-all',         this.tipAll],
                ['none',                        'btn-borders-small btn-position-none',      'cell-button-border-none',        this.tipNone]
            ];

            _.each(_arrBorderPosition, function(item, index, list){
                var _btn = new Common.UI.Button({
                    cls: 'btn-toolbar',
                    iconCls: item[1],
                    borderId:item[0],
                    hint: item[3],
                    disabled: this._locked
                });
                _btn.render( $('#'+item[2])) ;
                _btn.on('click', _.bind(this.onBtnBordersClick, this));
                this.lockedControls.push(_btn);
            }, this);

            this.cmbBorderType = new Common.UI.ComboBorderType({
                el: $('#cell-combo-border-type'),
                cls: 'cell-border-type',
                style: "width: 93px;",
                menuStyle: 'min-width: 93px;',
                disabled: this._locked,
                data: [
                    { value: Asc.c_oAscBorderStyles.Thin,   offsety: 0},
                    { value: Asc.c_oAscBorderStyles.Hair,   offsety: 20},
                    { value: Asc.c_oAscBorderStyles.Dotted,   offsety: 40},
                    { value: Asc.c_oAscBorderStyles.Dashed,   offsety: 60},
                    { value: Asc.c_oAscBorderStyles.DashDot,   offsety: 80},
                    { value: Asc.c_oAscBorderStyles.DashDotDot,   offsety: 100},
                    { value: Asc.c_oAscBorderStyles.Medium, offsety: 120},
                    { value: Asc.c_oAscBorderStyles.MediumDashed,  offsety: 140},
                    { value: Asc.c_oAscBorderStyles.MediumDashDot,  offsety: 160},
                    { value: Asc.c_oAscBorderStyles.MediumDashDotDot,  offsety: 180},
                    { value: Asc.c_oAscBorderStyles.Thick,  offsety: 200}
                ]
            }).on('selected', _.bind(this.onBorderTypeSelect, this));
            this.BorderType = Asc.c_oAscBorderStyles.Thin;
            this.cmbBorderType.setValue(this.BorderType);
            this.lockedControls.push(this.cmbBorderType);

            this.btnBorderColor = new Common.UI.ColorButton({
                style: "width:45px;",
                disabled: this._locked,
                menu        : true
            });
            this.btnBorderColor.render( $('#cell-border-color-btn'));
            this.btnBorderColor.setColor('000000');
            this.lockedControls.push(this.btnBorderColor);

            this.btnBackColor = new Common.UI.ColorButton({
                style: "width:45px;",
                disabled: this._locked,
                menu        : true
            });
            this.btnBackColor.render( $('#cell-back-color-btn'));
            this.btnBackColor.setColor('transparent');
            this.lockedControls.push(this.btnBackColor);

            this.spnAngle = new Common.UI.MetricSpinner({
                el: $('#cell-spin-angle'),
                step: 1,
                width: 60,
                defaultUnit : "°",
                value: '0 °',
                allowDecimal: false,
                maxValue: 90,
                minValue: -90,
                disabled: this._locked
            });
            this.lockedControls.push(this.spnAngle);
            this.spnAngle.on('change', _.bind(this.onAngleChange, this));

            this.btnTextToColumn = new Common.UI.Button({
                el: $('#cell-btn-text-to-column'),
                disabled: this._locked
            });
            this.btnTextToColumn.on('click', _.bind(this.onTextToColumn, this));
            this.lockedControls.push(this.btnTextToColumn);
        },

        createDelayedElements: function() {
            this.UpdateThemeColors();
            this._initSettings = false;
        },

        ChangeSettings: function(props) {
            if (this._initSettings)
                this.createDelayedElements();

            this.disableControls(this._locked);

            if (props )
            {
                var color = props.asc_getFill().asc_getColor(),
                    clr;
                if (color) {
                    if (color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                        clr = {color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()), effectValue: color.get_value() };
                    } else {
                        clr = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
                    }
                } else {
                    clr = 'transparent';
                }

                var type1 = typeof(clr);
                var type2 = typeof(this._state.BackColor);
                if ( (type1 !== type2) || (type1=='object' &&
                    (clr.effectValue!==this._state.BackColor.effectValue || this._state.BackColor.color.indexOf(clr.color)<0)) ||
                    (type1!='object' && this._state.BackColor!==undefined && this._state.BackColor.indexOf(clr)<0 )) {

                    this.btnBackColor.setColor(clr);
                    if (_.isObject(clr)) {
                        var isselected = false;
                        for (var i = 0; i < 10; i++) {
                            if (Common.Utils.ThemeColor.ThemeValues[i] == clr.effectValue) {
                                this.colorsBack.select(clr,true);
                                isselected = true;
                                break;
                            }
                        }
                        if (!isselected) this.colorsBack.clearSelection();
                    } else {
                        this.colorsBack.select(clr, true);
                    }
                    this._state.BackColor = clr;
                }

                var value = props.asc_getAngle();
                if ( Math.abs(this._state.CellAngle-value)>0.1 || (this._state.CellAngle===undefined)&&(this._state.CellAngle!==value)) {
                    this.spnAngle.setValue((value !== null) ? value : '', true);
                    this._state.CellAngle=value;
                }
            }
        },

        UpdateThemeColors: function() {
             if (!this.borderColor) {
                // create color buttons
                 this.btnBorderColor.setMenu( new Common.UI.Menu({
                     items: [
                         { template: _.template('<div id="cell-border-color-menu" style="width: 169px; height: 220px; margin: 10px;"></div>') },
                         { template: _.template('<a id="cell-border-color-new" style="padding-left:12px;">' + this.textNewColor + '</a>') }
                     ]
                 }));
                 this.borderColor = new Common.UI.ThemeColorPalette({
                     el: $('#cell-border-color-menu')
                 });
                 this.borderColor.on('select', _.bind(this.onColorsBorderSelect, this));
                 this.btnBorderColor.menu.items[1].on('click', _.bind(this.addNewColor, this, this.borderColor, this.btnBorderColor));

                 this.btnBackColor.setMenu( new Common.UI.Menu({
                     items: [
                         { template: _.template('<div id="cell-back-color-menu" style="width: 169px; height: 220px; margin: 10px;"></div>') },
                         { template: _.template('<a id="cell-back-color-new" style="padding-left:12px;">' + this.textNewColor + '</a>') }
                     ]
                 }));
                 this.colorsBack = new Common.UI.ThemeColorPalette({
                     el: $('#cell-back-color-menu'),
                     transparent: true
                 });
                 this.colorsBack.on('select', _.bind(this.onColorsBackSelect, this));
                 this.btnBackColor.menu.items[1].on('click', _.bind(this.addNewColor, this, this.colorsBack, this.btnBackColor));
             }
             this.colorsBack.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
             this.borderColor.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
             this.btnBorderColor.setColor(this.borderColor.getColor());
        },

        onApiEditCell: function(state) {
            this.isEditCell = (state != Asc.c_oAscCellEditorState.editEnd);
            if ( state == Asc.c_oAscCellEditorState.editStart || state == Asc.c_oAscCellEditorState.editEnd)
                this.disableControls(this._locked);
        },

        onApiSelectionChanged: function(info) {
            this.isMultiSelect = info.asc_getFlags().asc_getMultiselect() || info.asc_getSelectedColsCount()>1;
        },

        setLocked: function (locked) {
            this._locked = locked;
        },

        disableControls: function(disable) {
            if (this._initSettings) return;
            disable = disable || this.isEditCell;
            
            if (this._state.DisabledControls!==disable) {
                this._state.DisabledControls = disable;
                _.each(this.lockedControls, function(item) {
                    item.setDisabled(disable);
                });
            }
            this.btnTextToColumn.setDisabled(disable || this.isMultiSelect);
        },

        textBorders:        'Border\'s Style',
        textBorderColor:    'Color',
        textBackColor:      'Background color',
        textSelectBorders       : 'Select borders that you want to change',
        textNewColor            : 'Add New Custom Color',
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
        tipDiagU:           'Set Diagonal Up Border',
        tipDiagD:           'Set Diagonal Down Border',
        textOrientation:    'Text Orientation',
        textAngle:          'Angle',
        textTextToColumn:   'Text to Columns',
        textWizard: 'Text to Columns Wizard'

    }, SSE.Views.CellSettings || {}));
});