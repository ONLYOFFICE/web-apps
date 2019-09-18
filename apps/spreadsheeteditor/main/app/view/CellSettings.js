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
            this._noApply = true;

            this._state = {
                DisabledControls: true,
                DisabledFillPanels: false,
                CellAngle: undefined,
                GradFillType: Asc.c_oAscFillGradType.GRAD_LINEAR,
                CellColor: 'transparent',
                FillType: Asc.c_oAscFill.FILL_TYPE_SOLID,
                FGColor: '000000',
                BGColor: 'ffffff',
                GradColor1: '000000',
                GradColor2: 'ffffff'
            };
            this.lockedControls = [];
            this._locked = true;
            this.isEditCell = false;
            this.BorderType = 1;
            this.GradFillType = Asc.c_oAscFillGradType.GRAD_LINEAR;
            this.GradLinearDirectionType = 0;
            this.GradRadialDirectionIdx = 0;
            this.GradColors = [];

            this.fillControls = [];

            this.render();
            this.createDelayedControls();

            this.FillColorContainer = $('#cell-panel-color-fill');
            this.FillPatternContainer = $('#cell-panel-pattern-fill');
            this.FillGradientContainer = $('#cell-panel-gradient-fill');
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
            }
            return this;
        },

        createDelayedControls: function() {
            var me = this;
            this._arrFillSrc = [
                {displayValue: this.textColor,          value: Asc.c_oAscFill.FILL_TYPE_SOLID},
                {displayValue: this.textGradientFill,   value: Asc.c_oAscFill.FILL_TYPE_GRAD},
                {displayValue: this.textPatternFill,    value: Asc.c_oAscFill.FILL_TYPE_PATT},
                {displayValue: this.textNoFill,         value: Asc.c_oAscFill.FILL_TYPE_NOFILL}
            ];

            this.cmbFillSrc = new Common.UI.ComboBox({
                el: $('#cell-combo-fill-src'),
                cls: 'input-group-nr',
                style: 'width: 100%;',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: this._arrFillSrc
            });
            this.cmbFillSrc.setValue(this._arrFillSrc[0].value);
            this.fillControls.push(this.cmbFillSrc);
            this.cmbFillSrc.on('selected', _.bind(this.onFillSrcSelect, this));

            this._arrGradType = [
                {displayValue: this.textLinear, value: Asc.c_oAscFillGradType.GRAD_LINEAR},
                {displayValue: this.textRadial, value: Asc.c_oAscFillGradType.GRAD_PATH}
            ];

            this.cmbGradType = new Common.UI.ComboBox({
                el: $('#cell-combo-grad-type'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 90px;',
                editable: false,
                data: this._arrGradType
            });
            this.cmbGradType.setValue(this._arrGradType[0].value);
            this.fillControls.push(this.cmbGradType);
            this.cmbGradType.on('selected', _.bind(this.onGradTypeSelect, this));

            this._viewDataLinear = [
                { offsetx: 0,   offsety: 0,   type:45,  subtype:-1, iconcls:'gradient-left-top' },
                { offsetx: 50,  offsety: 0,   type:90,  subtype:4,  iconcls:'gradient-top'},
                { offsetx: 100, offsety: 0,   type:135, subtype:5,  iconcls:'gradient-right-top'},
                { offsetx: 0,   offsety: 50,  type:0,   subtype:6,  iconcls:'gradient-left', cls: 'item-gradient-separator', selected: true},
                { offsetx: 100, offsety: 50,  type:180, subtype:1,  iconcls:'gradient-right'},
                { offsetx: 0,   offsety: 100, type:315, subtype:2,  iconcls:'gradient-left-bottom'},
                { offsetx: 50,  offsety: 100, type:270, subtype:3,  iconcls:'gradient-bottom'},
                { offsetx: 100, offsety: 100, type:225, subtype:7,  iconcls:'gradient-right-bottom'}
            ];

            this._viewDataRadial = [
                { offsetx: 100, offsety: 150, type:2, subtype:5, iconcls:'gradient-radial-center'}
            ];

            this.btnDirection = new Common.UI.Button({
                cls         : 'btn-large-dataview',
                iconCls     : 'item-gradient gradient-left',
                menu        : new Common.UI.Menu({
                    style: 'min-width: 60px;',
                    menuAlign: 'tr-br',
                    items: [
                        { template: _.template('<div id="id-cell-menu-direction" style="width: 175px; margin: 0 5px;"></div>') }
                    ]
                })
            });
            this.btnDirection.on('render:after', function(btn) {
                me.mnuDirectionPicker = new Common.UI.DataView({
                    el: $('#id-cell-menu-direction'),
                    parentMenu: btn.menu,
                    restoreHeight: 174,
                    store: new Common.UI.DataViewStore(me._viewDataLinear),
                    itemTemplate: _.template('<div id="<%= id %>" class="item-gradient" style="background-position: -<%= offsetx %>px -<%= offsety %>px;"></div>')
                });
            });
            this.btnDirection.render($('#cell-button-direction'));
            this.fillControls.push(this.btnDirection);
            this.mnuDirectionPicker.on('item:click', _.bind(this.onSelectGradient, this, this.btnDirection));

            this.cmbPattern = new Common.UI.ComboDataView({
                itemWidth: 28,
                itemHeight: 28,
                menuMaxHeight: 300,
                enableKeyEvents: true,
                cls: 'combo-pattern'
            });
            this.cmbPattern.menuPicker.itemTemplate = this.cmbPattern.fieldPicker.itemTemplate = _.template([
                '<div class="style" id="<%= id %>">',
                '<img src="data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" class="combo-pattern-item" ',
                'width="' + this.cmbPattern.itemWidth + '" height="' + this.cmbPattern.itemHeight + '" ',
                'style="background-position: -<%= offsetx %>px -<%= offsety %>px;"/>',
                '</div>'
            ].join(''));
            this.cmbPattern.render($('#cell-combo-pattern'));
            this.cmbPattern.openButton.menu.cmpEl.css({
                'min-width': 178,
                'max-width': 178
            });
            this.cmbPattern.on('click', _.bind(this.onPatternSelect, this));
            this.cmbPattern.openButton.menu.on('show:after', function () {
                me.cmbPattern.menuPicker.scroller.update({alwaysVisibleY: true});
            });
            this.fillControls.push(this.cmbPattern);

            var global_hatch_menu_map = [
                -1,-1,-1,-1,-1,
                -1,-1,-1,-1,8,
                9,10,11,-1,-1,
                -1,21,-1,-1,-1,
                -1,20,22,23,-1,
                -1,27,28,29,30,
                -1,-1,33,-1,35,
                -1,-1,-1,-1,-1,
                41,-1,43,-1,-1,
                46,-1,-1,-1,-1
            ];

            this.patternViewData = [];
            var idx = 0;
            for (var i=0; i<13; i++) {
                for (var j=0; j<4; j++) {
                    var num = i*4+j;
                    if (global_hatch_menu_map[num]>-1)
                        this.patternViewData[idx++] = {offsetx: j*28, offsety: i*28, type: global_hatch_menu_map[num]};
                }
            }

            for ( var i=0; i<this.patternViewData.length; i++ ) {
                this.patternViewData[i].id = Common.UI.getId();
            }
            this.cmbPattern.menuPicker.store.add(this.patternViewData);
            if (this.cmbPattern.menuPicker.store.length > 0) {
                this.cmbPattern.fillComboView(this.cmbPattern.menuPicker.store.at(0),true);
                this.PatternFillType = this.patternViewData[0].type;
            }

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
        },

        createDelayedElements: function() {
            this.UpdateThemeColors();
            this._initSettings = false;
        },

        ChangeSettings: function(props) {
            var me = this;
            if (this._initSettings)
                this.createDelayedElements();

            this.disableControls(this._locked);

            if (props )
            {
                this._noApply = true;

                var value = props.asc_getAngle();
                if ( Math.abs(this._state.CellAngle-value)>0.1 || (this._state.CellAngle===undefined)&&(this._state.CellAngle!==value)) {
                    this.spnAngle.setValue((value !== null) ? value : '', true);
                    this._state.CellAngle=value;
                }
                this.fill = props.asc_getFill2();
                this.pattern = this.fill.asc_getPatternFill();
                this.gradient = this.fill.asc_getGradientFill();
                if (this.pattern === null && this.gradient === null) {
                    this.OriginalFillType = Asc.c_oAscFill.FILL_TYPE_NOFILL;
                    this.CellColor = {Value: 0, Color: 'transparent'};
                    this.FGColor = {Value: 1, Color: {color: '4f81bd', effectId: 24}};
                    this.BGColor = {Value: 1, Color: 'ffffff'};
                    this.GradColors[0] = {Value: 1, Color: {color: '4f81bd', effectId: 24}, Position: 0};
                    this.GradColors[1] = {Value: 1, Color: 'ffffff', Position: 1};
                } else if (this.pattern !== null) {
                    if(this.pattern.asc_getType() === -1) {
                        var color = this.pattern.asc_getFgColor();
                        if (color.asc_getType() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                            this.CellColor = {Value: 1, Color: {color: Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB()), effectValue: color.asc_getValue() }};
                        } else {
                            this.CellColor = {Value: 1, Color: Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB())};
                        }
                        this.OriginalFillType = Asc.c_oAscFill.FILL_TYPE_SOLID;
                        this.FGColor = {Value: 1, Color: Common.Utils.ThemeColor.colorValue2EffectId(this.CellColor.Color)};
                        this.BGColor = {Value: 1, Color: 'ffffff'};
                        this.GradColors[0] = {Value: 1, Color: Common.Utils.ThemeColor.colorValue2EffectId(this.CellColor.Color), Position: 0};
                        this.GradColors[1] = {Value: 1, Color: 'ffffff', Position: 1};
                    } else {
                        this.PatternFillType = this.pattern.asc_getType();
                        if (this._state.PatternFillType !== this.PatternFillType) {
                            this.cmbPattern.suspendEvents();
                            var rec = this.cmbPattern.menuPicker.store.findWhere({
                                type: this.PatternFillType
                            });
                            this.cmbPattern.menuPicker.selectRecord(rec);
                            this.cmbPattern.resumeEvents();
                            this._state.PatternFillType = this.PatternFillType;
                        }
                        var color = this.pattern.asc_getFgColor();
                        if (color) {
                            if (color.asc_getType() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                                this.FGColor = {Value: 1, Color: {color: Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB()), effectValue: color.asc_getValue() }};
                            } else {
                                this.FGColor = {Value: 1, Color: Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB())};
                            }
                        } else
                            this.FGColor = {Value: 1, Color: {color: '4f81bd', effectId: 24}};

                        color = this.pattern.asc_getBgColor();
                        if (color) {
                            if (color.asc_getType() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                                this.BGColor = {Value: 1, Color: {color: Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB()), effectValue: color.asc_getValue() }};
                            } else {
                                this.BGColor = {Value: 1, Color: Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB())};
                            }
                        } else
                            this.BGColor = {Value: 1, Color: 'ffffff'};
                        this.CellColor = {Value: 1, Color: Common.Utils.ThemeColor.colorValue2EffectId(this.FGColor.Color)};
                        this.GradColors[0] = {Value: 1, Color: Common.Utils.ThemeColor.colorValue2EffectId(this.FGColor.Color), Position: 0};
                        this.GradColors[1] = {Value: 1, Color: 'ffffff', Position: 1};
                        this.OriginalFillType = Asc.c_oAscFill.FILL_TYPE_PATT;
                    }
                } else if (this.gradient !== null) {
                    var gradFillType = this.gradient.asc_getType();
                    if (this._state.GradFillType !== gradFillType || this.GradFillType !== gradFillType) {
                        this.GradFillType = gradFillType;
                        rec = undefined;
                        if (this.GradFillType == Asc.c_oAscFillGradType.GRAD_LINEAR || this.GradFillType == Asc.c_oAscFillGradType.GRAD_PATH) {
                            this.cmbGradType.setValue(this.GradFillType);
                            rec = this.cmbGradType.store.findWhere({value: this.GradFillType});
                            this.onGradTypeSelect(this.cmbGradType, rec.attributes);
                        } else {
                            this.cmbGradType.setValue('');
                            this.btnDirection.setIconCls('');
                        }
                        this._state.GradFillType = this.GradFillType;
                    }
                    if (this.GradFillType == Asc.c_oAscFillGradType.GRAD_LINEAR) {
                        var value = this.gradient.asc_getDegree();
                        if (Math.abs(this.GradLinearDirectionType-value)>0.001) {
                            this.GradLinearDirectionType=value;
                            var record = this.mnuDirectionPicker.store.findWhere({type: value});
                            this.mnuDirectionPicker.selectRecord(record, true);
                            if (record)
                                this.btnDirection.setIconCls('item-gradient ' + record.get('iconcls'));
                            else
                                this.btnDirection.setIconCls('');
                        }
                    }

                    var gradientStops;
                    this.GradColors.length = 0;
                    gradientStops = this.gradient.asc_getGradientStops();
                    gradientStops.forEach(function (color) {
                        var clr = color.asc_getColor(),
                            position = color.asc_getPosition(),
                            itemColor;
                        if (clr.asc_getType() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                            itemColor  = {Value: 1, Color: {color: Common.Utils.ThemeColor.getHexColor(clr.asc_getR(), clr.asc_getG(), clr.asc_getB()), effectValue: clr.asc_getValue()}, Position: position};
                        } else {
                            itemColor = {Value: 1, Color: Common.Utils.ThemeColor.getHexColor(clr.asc_getR(), clr.asc_getG(), clr.asc_getB()), Position: position};
                        }
                        me.GradColors.push(itemColor);
                    });
                    this.GradColors = _.sortBy(this.GradColors, 'Position');
                    
                    this.OriginalFillType = Asc.c_oAscFill.FILL_TYPE_GRAD;
                    this.FGColor = {Value: 1, Color: Common.Utils.ThemeColor.colorValue2EffectId(this.GradColors[0].Color)};
                    this.BGColor = {Value: 1, Color: 'ffffff'};
                    this.CellColor = {Value: 1, Color: Common.Utils.ThemeColor.colorValue2EffectId(this.GradColors[0].Color)};
                }

                if ( this._state.FillType !== this.OriginalFillType ) {
                    this.cmbFillSrc.setValue((this.OriginalFillType === null) ? '' : this.OriginalFillType);
                    this._state.FillType = this.OriginalFillType;
                    this.ShowHideElem(this.OriginalFillType);
                }

                // Color Back

                var type1 = typeof(this.CellColor.Color),
                    type2 = typeof(this._state.CellColor);
                if ( (type1 !== type2) || (type1=='object' &&
                    (this.CellColor.Color.effectValue!==this._state.CellColor.effectValue || this._state.CellColor.color.indexOf(this.CellColor.Color)<0)) ||
                    (type1!='object' && this._state.CellColor!==undefined && this._state.CellColor.indexOf(this.CellColor.Color)<0 )) {

                    this.btnBackColor.setColor(this.CellColor.Color);
                    if (_.isObject(this.CellColor.Color)) {
                        var isselected = false;
                        for (var i = 0; i < 10; i++) {
                            if (Common.Utils.ThemeColor.ThemeValues[i] == this.CellColor.Color.effectValue) {
                                this.colorsBack.select(this.CellColor.Color,true);
                                isselected = true;
                                break;
                            }
                        }
                        if (!isselected) this.colorsBack.clearSelection();
                    } else {
                        this.colorsBack.select(this.CellColor.Color, true);
                    }
                    this._state.CellColor = this.CellColor.Color;
                }

                // Pattern colors
                type1 = typeof(this.FGColor.Color);
                type2 = typeof(this._state.FGColor);

                if ( (type1 !== type2) || (type1=='object' &&
                    (this.FGColor.Color.effectValue!==this._state.FGColor.effectValue || this._state.FGColor.color.indexOf(this.FGColor.Color.color)<0)) ||
                    (type1!='object' && this._state.FGColor.indexOf(this.FGColor.Color)<0 )) {

                    this.btnFGColor.setColor(this.FGColor.Color);
                    if ( typeof(this.FGColor.Color) == 'object' ) {
                        var isselected = false;
                        for (var i=0; i<10; i++) {
                            if ( Common.Utils.ThemeColor.ThemeValues[i] == this.FGColor.Color.effectValue ) {
                                this.colorsFG.select(this.FGColor.Color,true);
                                isselected = true;
                                break;
                            }
                        }
                        if (!isselected) this.colorsFG.clearSelection();
                    } else
                        this.colorsFG.select(this.FGColor.Color,true);

                    this._state.FGColor = this.FGColor.Color;
                }

                type1 = typeof(this.BGColor.Color);
                type2 = typeof(this._state.BGColor);

                if ( (type1 !== type2) || (type1=='object' &&
                    (this.BGColor.Color.effectValue!==this._state.BGColor.effectValue || this._state.BGColor.color.indexOf(this.BGColor.Color.color)<0)) ||
                    (type1!='object' && this._state.BGColor.indexOf(this.BGColor.Color)<0 )) {

                    this.btnBGColor.setColor(this.BGColor.Color);
                    if ( typeof(this.BGColor.Color) == 'object' ) {
                        var isselected = false;
                        for (var i=0; i<10; i++) {
                            if ( Common.Utils.ThemeColor.ThemeValues[i] == this.BGColor.Color.effectValue ) {
                                this.colorsBG.select(this.BGColor.Color,true);
                                isselected = true;
                                break;
                            }
                        }
                        if (!isselected) this.colorsBG.clearSelection();
                    } else
                        this.colorsBG.select(this.BGColor.Color,true);

                    this._state.BGColor = this.BGColor.Color;
                }

                // Gradient colors
                var gradColor1 = this.GradColors[0];
                if (!gradColor1) {
                    gradColor1 = {Value: 1, Color: {color: '4f81bd', effectId: 24}};
                }
                type1 = typeof(gradColor1.Color);
                type2 = typeof(this._state.GradColor1);

                if ( (type1 !== type2) || (type1=='object' &&
                    (gradColor1.Color.effectValue!==this._state.GradColor1.effectValue || this._state.GradColor1.color.indexOf(gradColor1.Color.color)<0)) ||
                    (type1!='object' && this._state.GradColor1.indexOf(gradColor1.Color)<0 )) {

                    this.btnGradColor1.setColor(gradColor1.Color);
                    if ( typeof(gradColor1.Color) == 'object' ) {
                        var isselected = false;
                        for (var i=0; i<10; i++) {
                            if ( Common.Utils.ThemeColor.ThemeValues[i] == gradColor1.Color.effectValue ) {
                                this.colorsGrad1.select(gradColor1.Color,true);
                                isselected = true;
                                break;
                            }
                        }
                        if (!isselected) this.colorsGrad1.clearSelection();
                    } else
                        this.colorsGrad1.select(gradColor1.Color,true);

                    this._state.GradColor1 = gradColor1.Color;
                }

                var gradColor2 = this.GradColors[1];
                if (!gradColor2) {
                    gradColor2 = {Value: 1, Color: 'ffffff'};
                }
                type1 = typeof(gradColor2.Color);
                type2 = typeof(this._state.GradColor2);

                if ( (type1 !== type2) || (type1=='object' &&
                    (gradColor2.Color.effectValue!==this._state.GradColor2.effectValue || this._state.GradColor2.color.indexOf(gradColor2.Color.color)<0)) ||
                    (type1!='object' && this._state.GradColor2.indexOf(gradColor2.Color)<0 )) {

                    this.btnGradColor2.setColor(gradColor2.Color);
                    if ( typeof(gradColor2.Color) == 'object' ) {
                        var isselected = false;
                        for (var i=0; i<10; i++) {
                            if ( Common.Utils.ThemeColor.ThemeValues[i] == gradColor2.Color.effectValue ) {
                                this.colorsGrad2.select(gradColor2.Color,true);
                                isselected = true;
                                break;
                            }
                        }
                        if (!isselected) this.colorsGrad2.clearSelection();
                    } else
                        this.colorsGrad2.select(gradColor2.Color,true);

                    this._state.GradColor2 = gradColor2.Color;
                }

                this._noApply = false;
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
                 this.fillControls.push(this.btnBackColor);

                 this.btnGradColor1 = new Common.UI.ColorButton({
                     style: "width:45px;",
                     menu        : new Common.UI.Menu({
                         items: [
                             { template: _.template('<div id="cell-gradient-color1-menu" style="width: 169px; height: 220px; margin: 10px;"></div>') },
                             { template: _.template('<a id="cell-gradient-color1-new" style="padding-left:12px;">' + this.textNewColor + '</a>') }
                         ]
                     })
                 });
                 this.btnGradColor1.render( $('#cell-grad-btn-color-1'));
                 this.btnGradColor1.setColor('000000');
                 this.colorsGrad1 = new Common.UI.ThemeColorPalette({
                     el: $('#cell-gradient-color1-menu'),
                     value: '000000'
                 });
                 this.colorsGrad1.on('select', _.bind(this.onColorsGradientSelect, this));
                 this.btnGradColor1.menu.items[1].on('click',  _.bind(this.addNewColor, this, this.colorsGrad1, this.btnGradColor1));
                 this.fillControls.push(this.btnGradColor1);

                 this.btnGradColor2 = new Common.UI.ColorButton({
                     style: "width:45px;",
                     menu        : new Common.UI.Menu({
                         items: [
                             { template: _.template('<div id="cell-gradient-color2-menu" style="width: 169px; height: 220px; margin: 10px;"></div>') },
                             { template: _.template('<a id="cell-gradient-color2-new" style="padding-left:12px;">' + this.textNewColor + '</a>') }
                         ]
                     })
                 });
                 this.btnGradColor2.render( $('#cell-grad-btn-color-2'));
                 this.btnGradColor2.setColor('ffffff');
                 this.colorsGrad2 = new Common.UI.ThemeColorPalette({
                     el: $('#cell-gradient-color2-menu'),
                     value: 'ffffff'
                 });
                 this.colorsGrad2.on('select', _.bind(this.onColorsGradientSelect, this));
                 this.btnGradColor2.menu.items[1].on('click',  _.bind(this.addNewColor, this, this.colorsGrad2, this.btnGradColor2));
                 this.fillControls.push(this.btnGradColor2);

                 this.btnFGColor = new Common.UI.ColorButton({
                     style: "width:45px;",
                     menu        : new Common.UI.Menu({
                         items: [
                             { template: _.template('<div id="cell-foreground-color-menu" style="width: 169px; height: 220px; margin: 10px;"></div>') },
                             { template: _.template('<a id="cell-foreground-color-new" style="padding-left:12px;">' + this.textNewColor + '</a>') }
                         ]
                     })
                 });
                 this.btnFGColor.render( $('#cell-foreground-color-btn'));
                 this.btnFGColor.setColor('000000');
                 this.colorsFG = new Common.UI.ThemeColorPalette({
                     el: $('#cell-foreground-color-menu'),
                     value: '000000'
                 });
                 this.colorsFG.on('select', _.bind(this.onColorsFGSelect, this));
                 this.btnFGColor.menu.items[1].on('click',  _.bind(this.addNewColor, this, this.colorsFG, this.btnFGColor));
                 this.fillControls.push(this.btnFGColor);

                 this.btnBGColor = new Common.UI.ColorButton({
                     style: "width:45px;",
                     menu        : new Common.UI.Menu({
                         items: [
                             { template: _.template('<div id="cell-background-color-menu" style="width: 169px; height: 220px; margin: 10px;"></div>') },
                             { template: _.template('<a id="cell-background-color-new" style="padding-left:12px;">' + this.textNewColor + '</a>') }
                         ]
                     })
                 });
                 this.btnBGColor.render( $('#cell-background-color-btn'));
                 this.btnBGColor.setColor('ffffff');
                 this.colorsBG = new Common.UI.ThemeColorPalette({
                     el: $('#cell-background-color-menu'),
                     value: 'ffffff'
                 });
                 this.colorsBG.on('select', _.bind(this.onColorsBGSelect, this));
                 this.btnBGColor.menu.items[1].on('click',  _.bind(this.addNewColor, this, this.colorsBG, this.btnBGColor));
                 this.fillControls.push(this.btnBGColor);
             }
             this.colorsBack.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
             this.borderColor.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
             this.btnBorderColor.setColor(this.borderColor.getColor());
             this.colorsGrad1.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
             this.colorsGrad2.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
             this.colorsFG.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
             this.colorsBG.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
        },

        onApiEditCell: function(state) {
            this.isEditCell = (state != Asc.c_oAscCellEditorState.editEnd);
            if ( state == Asc.c_oAscCellEditorState.editStart || state == Asc.c_oAscCellEditorState.editEnd)
                this.disableControls(this._locked);
        },

        setLocked: function (locked) {
            this._locked = locked;
        },

        disableFillPanels: function(disable) {
            if (this._state.DisabledFillPanels!==disable) {
                this._state.DisabledFillPanels = disable;
                _.each(this.fillControls, function(item) {
                    item.setDisabled(disable);
                });
            }
        },

        disableControls: function(disable) {
            if (this._initSettings) return;
            disable = disable || this.isEditCell;

            this.disableFillPanels(disable);
            if (this._state.DisabledControls!==disable) {
                this._state.DisabledControls = disable;
                _.each(this.lockedControls, function(item) {
                    item.setDisabled(disable);
                });
            }
        },

        onFillSrcSelect: function(combo, record) {
            var me = this;
            this.ShowHideElem(record.value);
            switch (record.value){
                case Asc.c_oAscFill.FILL_TYPE_SOLID:
                    this._state.FillType = Asc.c_oAscFill.FILL_TYPE_SOLID;
                    if (!this._noApply) {
                        if (this.pattern == null)
                            this.pattern = new Asc.asc_CPatternFill();
                        this.pattern.asc_setType(-1);
                        this.pattern.asc_setFgColor(Common.Utils.ThemeColor.getRgbColor((this.CellColor.Color=='transparent') ? {color: '4f81bd', effectId: 24} : this.CellColor.Color));
                        this.fill.asc_setPatternFill(this.pattern);
                        this.api.asc_setCellFill(this.fill);
                    }
                    break;
                case Asc.c_oAscFill.FILL_TYPE_GRAD:
                    this._state.FillType = Asc.c_oAscFill.FILL_TYPE_GRAD;
                    if (!this._noApply) {
                        if (this.gradient == null)
                            this.gradient = new Asc.asc_CGradientFill();
                        this.gradient.asc_setType(this.GradFillType);
                        if (this.GradFillType == Asc.c_oAscFillGradType.GRAD_LINEAR) {
                            this.gradient.asc_setDegree(this.GradLinearDirectionType);
                        }
                        if (this.OriginalFillType !== Asc.c_oAscFill.FILL_TYPE_GRAD) {
                            var HexColor0 = Common.Utils.ThemeColor.getRgbColor(this.GradColors[0].Color).get_color().get_hex(),
                                HexColor1 = Common.Utils.ThemeColor.getRgbColor(this.GradColors[1].Color).get_color().get_hex();

                            if (HexColor0 === 'ffffff' && HexColor1 === 'ffffff') {
                                this.GradColors[0].Color = {color: '4f81bd', effectId: 24};    // color accent1
                            }
                            var arrGradStop = [];
                            this.GradColors.forEach(function (item) {
                                var gradientStop = new Asc.asc_CGradientStop();
                                gradientStop.asc_setColor(Common.Utils.ThemeColor.getRgbColor(item.Color));
                                gradientStop.asc_setPosition(item.Position);
                                arrGradStop.push(gradientStop);
                            });
                            this.gradient.asc_putGradientStops(arrGradStop);
                        }
                        this.fill.asc_setGradientFill(this.gradient);
                        this.api.asc_setCellFill(this.fill);
                    }
                    break;
                case Asc.c_oAscFill.FILL_TYPE_PATT:
                    this._state.FillType = Asc.c_oAscFill.FILL_TYPE_PATT;
                    if (!this._noApply) {
                        var fHexColor = Common.Utils.ThemeColor.getRgbColor(this.FGColor.Color).get_color().get_hex();
                        var bHexColor = Common.Utils.ThemeColor.getRgbColor(this.BGColor.Color).get_color().get_hex();

                        if (bHexColor === 'ffffff' && fHexColor === 'ffffff') {
                            fHexColor = {color: '4f81bd', effectId: 24};    // color accent1
                        } else {
                            fHexColor = this.FGColor.Color;
                        }
                        if (this.pattern == null)
                            this.pattern = new Asc.asc_CPatternFill();
                        this.pattern.asc_setType(this.PatternFillType);
                        this.pattern.asc_setFgColor(Common.Utils.ThemeColor.getRgbColor(fHexColor));
                        this.pattern.asc_setBgColor(Common.Utils.ThemeColor.getRgbColor(this.BGColor.Color));
                        this.fill.asc_setPatternFill(this.pattern);
                        this.api.asc_setCellFill(this.fill);
                    }
                    break;
                case Asc.c_oAscFill.FILL_TYPE_NOFILL:
                    this._state.FillType = Asc.c_oAscFill.FILL_TYPE_NOFILL;
                    if (!this._noApply) {
                        this.fill.asc_setPatternFill(null);
                        this.fill.asc_setGradientFill(null);
                        this.api.asc_setCellFill(this.fill);
                    }
                    break;
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        ShowHideElem: function(value) {
            this.FillColorContainer.toggleClass('settings-hidden', value !== Asc.c_oAscFill.FILL_TYPE_SOLID);
            this.FillPatternContainer.toggleClass('settings-hidden', value !== Asc.c_oAscFill.FILL_TYPE_PATT);
            this.FillGradientContainer.toggleClass('settings-hidden', value !== Asc.c_oAscFill.FILL_TYPE_GRAD);
        },

        onGradTypeSelect: function(combo, record) {
            this.GradFillType = record.value;

            if (this.GradFillType == Asc.c_oAscFillGradType.GRAD_LINEAR) {
                this.mnuDirectionPicker.store.reset(this._viewDataLinear);
                this.mnuDirectionPicker.cmpEl.width(175);
                this.mnuDirectionPicker.restoreHeight = 174;
                var record = this.mnuDirectionPicker.store.findWhere({type: this.GradLinearDirectionType});
                this.mnuDirectionPicker.selectRecord(record, true);
                if (record)
                    this.btnDirection.setIconCls('item-gradient ' + record.get('iconcls'));
                else
                    this.btnDirection.setIconCls('');
            } else if (this.GradFillType == Asc.c_oAscFillGradType.GRAD_PATH) {
                this.mnuDirectionPicker.store.reset(this._viewDataRadial);
                this.mnuDirectionPicker.cmpEl.width(60);
                this.mnuDirectionPicker.restoreHeight = 58;
                this.mnuDirectionPicker.selectByIndex(this.GradRadialDirectionIdx, true);
                if (this.GradRadialDirectionIdx>=0)
                    this.btnDirection.setIconCls('item-gradient ' + this._viewDataRadial[this.GradRadialDirectionIdx].iconcls);
                else
                    this.btnDirection.setIconCls('');
            }

            if (this.api && !this._noApply) {
                if (this.gradient == null) {
                    this.gradient = new Asc.asc_CGradientFill();
                    if (this.GradFillType == Asc.c_oAscFillGradType.GRAD_LINEAR) {
                        this.gradient.asc_setDegree(this.GradLinearDirectionType);
                    }
                    var arrGradStop = [];
                    this.GradColors.forEach(function (item) {
                        var gradientStop = new Asc.asc_CGradientStop();
                        gradientStop.asc_setColor(Common.Utils.ThemeColor.getRgbColor(item.Color));
                        gradientStop.asc_setPosition(item.Position);
                        arrGradStop.push(gradientStop);
                    });
                    this.gradient.asc_putGradientStops(arrGradStop);
                }
                if (this.GradFillType == Asc.c_oAscFillGradType.GRAD_LINEAR) {
                    this.gradient.asc_setDegree(this.GradLinearDirectionType);
                }
                this.gradient.asc_setType(this.GradFillType);
                this.fill.asc_setGradientFill(this.gradient);
                this.api.asc_setCellFill(this.fill);
            }

            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onSelectGradient: function(btn, picker, itemView, record) {
            var me = this;
            if (this._noApply) return;

            var rawData = {},
                isPickerSelect = _.isFunction(record.toJSON);

            if (isPickerSelect){
                if (record.get('selected')) {
                    rawData = record.toJSON();
                } else {
                    // record deselected
                    return;
                }
            } else {
                rawData = record;
            }

            this.btnDirection.setIconCls('item-gradient ' + rawData.iconcls);
            (this.GradFillType == Asc.c_oAscFillGradType.GRAD_LINEAR) ? this.GradLinearDirectionType = rawData.type : this.GradRadialDirectionIdx = 0;

            if (this.api) {
                if (this.GradFillType == Asc.c_oAscFillGradType.GRAD_LINEAR) {
                    if (this.gradient == null) {
                        this.gradient = new Asc.asc_CGradientFill();
                        this.gradient.asc_setType(this.GradFillType);
                        var arrGradStop = [];
                        this.GradColors.forEach(function (item) {
                            var gradientStop = new Asc.asc_CGradientStop();
                            gradientStop.asc_setColor(Common.Utils.ThemeColor.getRgbColor(item.Color));
                            gradientStop.asc_setPosition(item.Position);
                            arrGradStop.push(gradientStop);
                        });
                        this.gradient.asc_putGradientStops(arrGradStop);
                    }
                    this.gradient.asc_setDegree(rawData.type);
                    this.fill.asc_setGradientFill(this.gradient);
                    this.api.asc_setCellFill(this.fill);
                }
            }

            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onColorsGradientSelect: function(picker, color) {
            var me = this,
                pickerId = picker.el.id;
            if (pickerId === "cell-gradient-color1-menu") {
                this.btnGradColor1.setColor(color);
                this.GradColors[0].Color = color;
            } else if (pickerId === "cell-gradient-color2-menu") {
                this.btnGradColor2.setColor(color);
                this.GradColors[1].Color = color;
            }

            if (this.api && !this._noApply) {
                if (this.gradient == null) {
                    this.gradient = new Asc.asc_CGradientFill();
                    this.gradient.asc_setType(this.GradFillType);
                    if (this.GradFillType == Asc.c_oAscFillGradType.GRAD_LINEAR) {
                        this.gradient.asc_setDegree(this.GradLinearDirectionType);
                    }
                }
                var arrGradStop = [];
                this.GradColors.forEach(function (item) {
                    var gradientStop = new Asc.asc_CGradientStop();
                    gradientStop.asc_setColor(Common.Utils.ThemeColor.getRgbColor(item.Color));
                    gradientStop.asc_setPosition(item.Position);
                    arrGradStop.push(gradientStop);
                });
                this.gradient.asc_putGradientStops(arrGradStop);

                this.fill.asc_setGradientFill(this.gradient);
                this.api.asc_setCellFill(this.fill);
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onPatternSelect: function(combo, record) {
            if (this.api && !this._noApply) {
                this.PatternFillType = record.get('type');
                if (this.pattern == null) {
                    this.pattern = new Asc.asc_CPatternFill();
                    this.pattern.asc_setFgColor(Common.Utils.ThemeColor.getRgbColor(this.FGColor.Color));
                    this.pattern.asc_setBgColor(Common.Utils.ThemeColor.getRgbColor(this.BGColor.Color));
                }
                this.pattern.asc_setType(this.PatternFillType);
                this.fill.asc_setPatternFill(this.pattern);
                this.api.asc_setCellFill(this.fill);
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onColorsFGSelect: function(picker, color) {
            this.btnFGColor.setColor(color);
            this.FGColor = {Value: 1, Color: color};
            if (this.api && !this._noApply) {
                if (this.pattern == null) {
                    this.pattern = new Asc.asc_CPatternFill();
                    this.pattern.asc_setType(this.PatternFillType);
                    this.pattern.asc_setBgColor(Common.Utils.ThemeColor.getRgbColor(this.BGColor.Color));
                }
                this.pattern.asc_setFgColor(Common.Utils.ThemeColor.getRgbColor(this.FGColor.Color));
                this.fill.asc_setPatternFill(this.pattern);
                this.api.asc_setCellFill(this.fill);
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onColorsBGSelect: function(picker, color) {
            this.btnBGColor.setColor(color);
            this.BGColor = {Value: 1, Color: color};
            if (this.api && !this._noApply) {
                if (this.pattern == null) {
                    this.pattern = new Asc.asc_CPatternFill();
                    this.pattern.asc_setFgColor(Common.Utils.ThemeColor.getRgbColor(this.FGColor.Color));
                    this.pattern.asc_setType(this.PatternFillType);
                }
                this.pattern.asc_setBgColor(Common.Utils.ThemeColor.getRgbColor(this.BGColor.Color));
                this.fill.asc_setPatternFill(this.pattern);
                this.api.asc_setCellFill(this.fill);
            }
            Common.NotificationCenter.trigger('edit:complete', this);
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
        textFill:           'Fill',
        textNoFill:         'No Fill',
        textGradientFill:   'Gradient Fill',
        textPatternFill:    'Pattern',
        textColor:          'Color Fill',
        textStyle:          'Style',
        textDirection:      'Direction',
        textLinear:         'Linear',
        textRadial:         'Radial',
        textColor1:         'Color 1',
        textColor2:         'Color 2',
        textPattern:        'Pattern',
        textForeground:     'Foreground color',
        textBackground:     'Background color'

    }, SSE.Views.CellSettings || {}));
});