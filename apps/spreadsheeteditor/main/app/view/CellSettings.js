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
 *  CellSettings.js
 *
 *  Created on 6/08/18
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
    'common/main/lib/component/ComboBorderSize'
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
            this._sendUndoPoint = true;
            
            this._state = {
                DisabledControls: true,
                DisabledFillPanels: true,
                CellAngle: undefined,
                CellIndent: undefined,
                GradFillType: Asc.c_oAscFillGradType.GRAD_LINEAR,
                CellColor: 'transparent',
                FillType: Asc.c_oAscFill.FILL_TYPE_NOFILL,
                FGColor: '000000',
                BGColor: 'ffffff',
                GradColor: '000000'
            };
            this.lockedControls = [];
            this._locked = true;
            this.isEditCell = false;
            this.BorderType = 1;
            this.GradFillType = Asc.c_oAscFillGradType.GRAD_LINEAR;
            this.GradLinearDirectionType = 0;
            this.GradRadialDirectionIdx = 0;
            this.GradColor = { values: [0, 100], colors: ['000000', 'ffffff'], currentIdx: 0};

            this.fillControls = [];
            this.gradientColorsStr="#000, #fff";
            this.typeGradient = 90;

            this.render();
            this.createDelayedControls();

            this.FillColorContainer = $('#cell-panel-color-fill');
            this.FillPatternContainer = $('#cell-panel-pattern-fill');
            this.FillGradientContainer = $('#cell-panel-gradient-fill');
        },

        onColorsBackSelect: function(btn, color) {
            if (this.api) {
                this.api.asc_setCellBackgroundColor(color == 'transparent' ? null : Common.Utils.ThemeColor.getRgbColor(color));
            }

            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onBtnBordersClick: function(btn, eOpts){
            if (this.api) {
                var new_borders = [],
                    bordersWidth = this.BorderType,
                    bordersColor;
                if (this.btnBorderColor.isAutoColor()) {
                    bordersColor = new Asc.asc_CColor();
                    bordersColor.put_auto(true);
                } else {
                    bordersColor = Common.Utils.ThemeColor.getRgbColor(this.btnBorderColor.color);
                }
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
            this.api && (newValue!==oldValue) && this.api.asc_setCellAngle(field.getNumberValue());
        },

        onIndentChange: function(field, newValue, oldValue, eOpts) {
            this.api && (newValue!==oldValue) && this.api.asc_setCellIndent(field.getNumberValue());
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
                data: this._arrFillSrc,
                disabled: this._locked,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                ariaLabel: this.textFill
            });
            this.cmbFillSrc.setValue(Asc.c_oAscFill.FILL_TYPE_NOFILL);
            this.fillControls.push(this.cmbFillSrc);
            this.cmbFillSrc.on('selected', _.bind(this.onFillSrcSelect, this));

            this.numGradientAngle = new Common.UI.MetricSpinner({
                el: $('#cell-spin-gradient-angle'),
                step: 10,
                width: 90,
                defaultUnit : "°",
                value: '0 °',
                allowDecimal: true,
                maxValue: 359.9,
                minValue: 0,
                disabled: this._locked,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                ariaLabel: this.textAngle
            });
            this.lockedControls.push(this.numGradientAngle);
            this.numGradientAngle.on('change', _.bind(this.onGradientAngleChange, this));
            this.numGradientAngle.on('inputleave', function(){ Common.NotificationCenter.trigger('edit:complete', me);});

            /*this._arrGradType = [
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
            this.cmbGradType.on('selected', _.bind(this.onGradTypeSelect, this));*/

            this._viewDataLinear = [
                { offsetx: 0,   offsety: 0,   type:45,  subtype:-1},
                { offsetx: 50,  offsety: 0,   type:90,  subtype:4},
                { offsetx: 100, offsety: 0,   type:135, subtype:5},
                { offsetx: 0,   offsety: 50,  type:0,   subtype:6,  cls: 'item-gradient-separator', selected: true},
                { offsetx: 100, offsety: 50,  type:180, subtype:1},
                { offsetx: 0,   offsety: 100, type:315, subtype:2},
                { offsetx: 50,  offsety: 100, type:270, subtype:3},
                { offsetx: 100, offsety: 100, type:225, subtype:7}
            ];
            _.each(this._viewDataLinear, function(item){
                item.gradientColorsStr = me.gradientColorsStr;
            });

            this.btnDirection = new Common.UI.Button({
                cls         : 'btn-large-dataview',
                scaling     : false,
                iconCls     : 'item-gradient gradient-left',
                menu        : new Common.UI.Menu({
                    style: 'min-width: 60px;',
                    menuAlign: 'tr-br',
                    items: [
                        { template: _.template('<div id="id-cell-menu-direction" style="width: 175px; margin: 0 5px;"></div>') }
                    ]
                }),
                dataHint    : '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                ariaLabel: this.textDirection
            });
            this.btnDirection.on('render:after', function(btn) {
                me.mnuDirectionPicker = new Common.UI.DataView({
                    el: $('#id-cell-menu-direction'),
                    parentMenu: btn.menu,
                    restoreHeight: 174,
                    store: new Common.UI.DataViewStore(me._viewDataLinear),
                    itemTemplate: _.template('<div id="<%= id %>" class="item-gradient" style="background: '
                        +'linear-gradient(<%= type + 90 %>deg,<%= gradientColorsStr %>);"></div>')
                });
            });
            this.btnDirection.render($('#cell-button-direction'));
            this.fillControls.push(this.btnDirection);
            this.mnuDirectionPicker.on('item:click', _.bind(this.onSelectGradient, this, this.btnDirection));

            this.sldrGradient = new Common.UI.MultiSliderGradient({
                el: $('#cell-slider-gradient'),
                width: 192,
                minValue: 0,
                maxValue: 100,
                values: [0, 100]
            });
            this.sldrGradient.on('change', _.bind(this.onGradientChange, this));
            this.sldrGradient.on('changecomplete', _.bind(this.onGradientChangeComplete, this));
            this.sldrGradient.on('thumbclick', function(cmp, index){
                me.GradColor.currentIdx = index;
                var color = me.GradColor.colors[me.GradColor.currentIdx];
                me.btnGradColor.setColor(color);
                me.colorsGrad.select(color,false);
                var curValue = me.GradColor.values[me.GradColor.currentIdx];
                me.spnGradPosition.setValue(Common.UI.isRTL() ? me.sldrGradient.maxValue - curValue : curValue);
            });
            this.sldrGradient.on('thumbdblclick', function(cmp){
                me.btnGradColor.cmpEl.find('button').dropdown('toggle');
            });
            this.sldrGradient.on('sortthumbs', function(cmp, recalc_indexes){
                var colors = [],
                    currentIdx;
                _.each (recalc_indexes, function(recalc_index, index) {
                    colors.push(me.GradColor.colors[recalc_index]);
                    if (me.GradColor.currentIdx == recalc_index)
                        currentIdx = index;
                });
                me.OriginalFillType = null;
                me.GradColor.colors = colors;
                me.GradColor.currentIdx = currentIdx;
            });
            this.sldrGradient.on('addthumb', function(cmp, index, pos){
                me.GradColor.colors[index] = me.GradColor.colors[me.GradColor.currentIdx];
                me.GradColor.currentIdx = index;
                var color = me.sldrGradient.addNewThumb(index, pos);
                me.GradColor.colors[me.GradColor.currentIdx] = color;
            });
            this.sldrGradient.on('removethumb', function(cmp, index){
                me.sldrGradient.removeThumb(index);
                me.GradColor.values.splice(index, 1);
                me.sldrGradient.changeGradientStyle();
                if (_.isUndefined(me.GradColor.currentIdx) || me.GradColor.currentIdx >= me.GradColor.colors.length) {
                    var newIndex = index > 0 ? index - 1 : index;
                    newIndex = (newIndex === 0 && me.GradColor.values.length > 2) ? me.GradColor.values.length - 2 : newIndex;
                    me.GradColor.currentIdx = newIndex;
                }
                me.sldrGradient.setActiveThumb(me.GradColor.currentIdx);
            });
            this.fillControls.push(this.sldrGradient);

            var itemWidth = 28,
                itemHeight = 28;
            this.cmbPattern = new Common.UI.ComboDataView({
                itemWidth: itemWidth,
                itemHeight: itemHeight,
                menuMaxHeight: 300,
                enableKeyEvents: true,
                cls: 'combo-pattern',
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                fillOnChangeVisibility: true,
                itemTemplate: _.template([
                    '<div class="style" id="<%= id %>">',
                    '<img src="data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" class="combo-pattern-item" ',
                    'width="' + itemWidth + '" height="' + itemHeight + '" ',
                    'style="background-position: -<%= offsetx %>px -<%= offsety %>px;"/>',
                    '</div>'
                ].join(''))
            });
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
                [Asc.c_oAscBorderOptions.Left,  'toolbar__icon btn-border-left',        'cell-button-border-left',      this.tipLeft,       'bottom'],
                [Asc.c_oAscBorderOptions.InnerV,'toolbar__icon btn-border-insidevert',  'cell-button-border-inner-vert',this.tipInnerVert,  'bottom'],
                [Asc.c_oAscBorderOptions.Right, 'toolbar__icon btn-border-right',       'cell-button-border-right',     this.tipRight,      'bottom'],
                [Asc.c_oAscBorderOptions.Top,   'toolbar__icon btn-border-top',         'cell-button-border-top',       this.tipTop,        'bottom'],
                [Asc.c_oAscBorderOptions.InnerH,'toolbar__icon btn-border-insidehor',   'cell-button-border-inner-hor', this.tipInnerHor,   'bottom'],
                [Asc.c_oAscBorderOptions.Bottom,'toolbar__icon btn-border-bottom',      'cell-button-border-bottom',    this.tipBottom,     'bottom'],
                [Asc.c_oAscBorderOptions.DiagU, 'toolbar__icon btn-border-diagup',      'cell-button-border-diagu',     this.tipDiagU,      'top'],
                [Asc.c_oAscBorderOptions.DiagD, 'toolbar__icon btn-border-diagdown',    'cell-button-border-diagd',     this.tipDiagD,      'top'],
                ['inner',                       'toolbar__icon btn-border-inside',      'cell-button-border-inner',     this.tipInner,      'top'],
                ['outer',                       'toolbar__icon btn-border-out',         'cell-button-border-outer',     this.tipOuter,      'top'],
                ['all',                         'toolbar__icon btn-border-all',         'cell-button-border-all',       this.tipAll,        'top'],
                ['none',                        'toolbar__icon btn-border-no',          'cell-button-border-none',      this.tipNone,       'top']
            ];

            _.each(_arrBorderPosition, function(item, index, list){
                var _btn = new Common.UI.Button({
                    parentEl: $('#'+item[2]),
                    cls: 'btn-toolbar borders--small',
                    iconCls: item[1],
                    borderId:item[0],
                    hint: item[3],
                    disabled: this._locked,
                    dataHint: '1',
                    dataHintDirection: item[4],
                    dataHintOffset: 'small'
                });
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
                    { value: Asc.c_oAscBorderStyles.Thin,   imgId: "solid-s"},
                    { value: Asc.c_oAscBorderStyles.Hair,   imgId: "dots-s"},
                    { value: Asc.c_oAscBorderStyles.Dotted,   imgId: "dashes-s"},
                    { value: Asc.c_oAscBorderStyles.Dashed,   imgId: "dashes-m"},
                    { value: Asc.c_oAscBorderStyles.DashDot,   imgId: "dash-dot-s"},
                    { value: Asc.c_oAscBorderStyles.DashDotDot,   imgId: "dash-dot-dot-s"},
                    { value: Asc.c_oAscBorderStyles.Medium, imgId: "solid-m"},
                    { value: Asc.c_oAscBorderStyles.MediumDashed,  imgId: "dashes-l"},
                    { value: Asc.c_oAscBorderStyles.MediumDashDot,  imgId: "dash-dot-m"},
                    { value: Asc.c_oAscBorderStyles.MediumDashDotDot,  imgId: "dash-dot-dot-m"},
                    { value: Asc.c_oAscBorderStyles.Thick,  imgId: "solid-l"}
                ],
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                ariaLabel: this.textBorders
            }).on('selected', _.bind(this.onBorderTypeSelect, this));
            this.BorderType = Asc.c_oAscBorderStyles.Thin;
            this.cmbBorderType.setValue(this.BorderType);
            this.lockedControls.push(this.cmbBorderType);

            this.btnBorderColor = new Common.UI.ColorButton({
                parentEl: $('#cell-border-color-btn'),
                disabled: this._locked,
                menu        : true,
                color: 'auto',
                auto: true,
                eyeDropper: true,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'medium',
                ariaLabel: this.textBorderColor
            });
            this.lockedControls.push(this.btnBorderColor);

            this.btnBackColor = new Common.UI.ColorButton({
                parentEl: $('#cell-back-color-btn'),
                disabled: this._locked,
                menu        : true,
                transparent : true,
                color: 'transparent',
                eyeDropper: true,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'medium',
                ariaLabel: this.textBackColor
            });
            this.lockedControls.push(this.btnBackColor);

            this.spnIndent = new Common.UI.MetricSpinner({
                el: $('#cell-spin-indent'),
                step: 1,
                width: 60,
                defaultUnit : "",
                value: '0',
                allowDecimal: false,
                maxValue: 250,
                minValue: 0,
                disabled: this._locked,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                ariaLabel: this.textIndent
            });
            this.lockedControls.push(this.spnIndent);
            this.spnIndent.on('change', _.bind(this.onIndentChange, this));
            this.spnIndent.on('inputleave', function(){ Common.NotificationCenter.trigger('edit:complete', me);});

            this.spnAngle = new Common.UI.MetricSpinner({
                el: $('#cell-spin-angle'),
                step: 1,
                width: 60,
                defaultUnit : "°",
                value: '0 °',
                allowDecimal: false,
                maxValue: 90,
                minValue: -90,
                disabled: this._locked,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                ariaLabel: this.textOrientation + ' ' + this.textAngle
            });
            this.lockedControls.push(this.spnAngle);
            this.spnAngle.on('change', _.bind(this.onAngleChange, this));
            this.spnAngle.on('inputleave', function(){ Common.NotificationCenter.trigger('edit:complete', me);});

            this.spnGradPosition = new Common.UI.MetricSpinner({
                el: $('#cell-gradient-position'),
                step: 1,
                width: 60,
                defaultUnit : "%",
                value: '50 %',
                allowDecimal: false,
                maxValue: 100,
                minValue: 0,
                disabled: this._locked,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                ariaLabel: this.textPosition
            });
            this.lockedControls.push(this.spnGradPosition);
            this.spnGradPosition.on('change', _.bind(this.onPositionChange, this));
            this.spnGradPosition.on('inputleave', function(){ Common.NotificationCenter.trigger('edit:complete', me);});

            this.btnAddGradientStep = new Common.UI.Button({
                parentEl: $('#cell-gradient-add-step'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-add-breakpoint',
                disabled: this._locked,
                hint: this.tipAddGradientPoint,
                dataHint: '1',
                dataHintDirection: 'bottom'
            });
            this.btnAddGradientStep.on('click', _.bind(this.onAddGradientStep, this));
            this.lockedControls.push(this.btnAddGradientStep);

            this.btnRemoveGradientStep = new Common.UI.Button({
                parentEl: $('#cell-gradient-remove-step'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-remove-breakpoint',
                disabled: this._locked,
                hint: this.tipRemoveGradientPoint,
                dataHint: '1',
                dataHintDirection: 'bottom'
            });
            this.btnRemoveGradientStep.on('click', _.bind(this.onRemoveGradientStep, this));
            this.lockedControls.push(this.btnRemoveGradientStep);

            this.chWrap = new Common.UI.CheckBox({
                el: $('#cell-checkbox-wrap'),
                labelText: this.strWrap,
                disabled: this._locked,
                dataHint: '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            this.lockedControls.push(this.chWrap);
            this.chWrap.on('change', this.onWrapChange.bind(this));

            this.chShrink = new Common.UI.CheckBox({
                el: $('#cell-checkbox-shrink'),
                labelText: this.strShrink,
                disabled: this._locked,
                dataHint: '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            this.lockedControls.push(this.chShrink);
            this.chShrink.on('change', this.onShrinkChange.bind(this));

            this.btnCondFormat = new Common.UI.Button({
                parentEl: $('#cell-btn-cond-format'),
                cls         : 'btn-toolbar align-left',
                iconCls     : 'toolbar__icon btn-cond-format',
                caption     : this.textCondFormat,
                style       : 'width: 100%;',
                menu: true,
                disabled: this._locked,
                dataHint    : '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            this.lockedControls.push(this.btnCondFormat);
        },

        createDelayedElements: function() {
            this.UpdateThemeColors();
            this.btnCondFormat.setMenu( new Common.UI.Menu({
                items: [
                    {
                        caption     : Common.define.conditionalData.textValue,
                        menu        : new Common.UI.Menu({
                            menuAlign   : 'tl-tr',
                            items: [
                                {   caption     : Common.define.conditionalData.textGreater,    type        : Asc.c_oAscCFType.cellIs, value       : Asc.c_oAscCFOperator.greaterThan },
                                {   caption     : Common.define.conditionalData.textGreaterEq,  type        : Asc.c_oAscCFType.cellIs, value       : Asc.c_oAscCFOperator.greaterThanOrEqual },
                                {   caption     : Common.define.conditionalData.textLess,       type        : Asc.c_oAscCFType.cellIs, value       : Asc.c_oAscCFOperator.lessThan },
                                {   caption     : Common.define.conditionalData.textLessEq,     type        : Asc.c_oAscCFType.cellIs, value       : Asc.c_oAscCFOperator.lessThanOrEqual },
                                {   caption     : Common.define.conditionalData.textEqual,      type        : Asc.c_oAscCFType.cellIs, value       : Asc.c_oAscCFOperator.equal },
                                {   caption     : Common.define.conditionalData.textNotEqual,   type        : Asc.c_oAscCFType.cellIs, value       : Asc.c_oAscCFOperator.notEqual },
                                {   caption     : Common.define.conditionalData.textBetween,    type        : Asc.c_oAscCFType.cellIs, value       : Asc.c_oAscCFOperator.between },
                                {   caption     : Common.define.conditionalData.textNotBetween, type        : Asc.c_oAscCFType.cellIs, value       : Asc.c_oAscCFOperator.notBetween }
                            ]
                        })
                    },
                    {
                        caption     : Common.define.conditionalData.textTop + '/' + Common.define.conditionalData.textBottom,
                        type        : Asc.c_oAscCFType.top10,
                        menu        : new Common.UI.Menu({
                            menuAlign   : 'tl-tr',
                            items: [
                                { caption: Common.define.conditionalData.textTop + ' 10 ' + this.textItems,      type: Asc.c_oAscCFType.top10, value: 0, percent: false },
                                { caption: Common.define.conditionalData.textTop + ' 10%',      type: Asc.c_oAscCFType.top10, value: 0, percent: true },
                                { caption: Common.define.conditionalData.textBottom + ' 10 ' + this.textItems,   type: Asc.c_oAscCFType.top10, value: 1, percent: false },
                                { caption: Common.define.conditionalData.textBottom + ' 10%',   type: Asc.c_oAscCFType.top10, value: 1, percent: true }
                            ]
                        })
                    },
                    {
                        caption: Common.define.conditionalData.textAverage,
                        menu: new Common.UI.Menu({
                            menuAlign   : 'tl-tr',
                            items: [
                                { caption: Common.define.conditionalData.textAbove, type: Asc.c_oAscCFType.aboveAverage, value: 0},
                                { caption: Common.define.conditionalData.textBelow, type: Asc.c_oAscCFType.aboveAverage, value: 1},
                                { caption: Common.define.conditionalData.textEqAbove, type: Asc.c_oAscCFType.aboveAverage, value: 2},
                                { caption: Common.define.conditionalData.textEqBelow, type: Asc.c_oAscCFType.aboveAverage,value: 3},
                                { caption: Common.define.conditionalData.text1Above, type: Asc.c_oAscCFType.aboveAverage, value: 4},
                                { caption: Common.define.conditionalData.text1Below, type: Asc.c_oAscCFType.aboveAverage, value: 5},
                                { caption: Common.define.conditionalData.text2Above, type: Asc.c_oAscCFType.aboveAverage, value: 6},
                                { caption: Common.define.conditionalData.text2Below, type: Asc.c_oAscCFType.aboveAverage, value: 7},
                                { caption: Common.define.conditionalData.text3Above, type: Asc.c_oAscCFType.aboveAverage, value: 8},
                                { caption: Common.define.conditionalData.text3Below, type: Asc.c_oAscCFType.aboveAverage, value: 9}
                            ]
                        })
                    },
                    {
                        caption     : Common.define.conditionalData.textText,
                        menu        : new Common.UI.Menu({
                            menuAlign   : 'tl-tr',
                            items: [
                                { caption: Common.define.conditionalData.textContains,   type: Asc.c_oAscCFType.containsText },
                                { caption: Common.define.conditionalData.textNotContains,   type: Asc.c_oAscCFType.notContainsText },
                                { caption: Common.define.conditionalData.textBegins,   type: Asc.c_oAscCFType.beginsWith },
                                { caption: Common.define.conditionalData.textEnds,   type: Asc.c_oAscCFType.endsWith }
                            ]
                        })
                    },
                    {
                        caption     : Common.define.conditionalData.textDate,
                        menu        : new Common.UI.Menu({
                            menuAlign   : 'tl-tr',
                            items: [
                                { caption: Common.define.conditionalData.textYesterday,  type: Asc.c_oAscCFType.timePeriod,  value: Asc.c_oAscTimePeriod.yesterday },
                                { caption: Common.define.conditionalData.textToday,  type: Asc.c_oAscCFType.timePeriod,  value: Asc.c_oAscTimePeriod.today},
                                { caption: Common.define.conditionalData.textTomorrow,  type: Asc.c_oAscCFType.timePeriod,  value: Asc.c_oAscTimePeriod.tomorrow},
                                { caption: Common.define.conditionalData.textLast7days,  type: Asc.c_oAscCFType.timePeriod,  value: Asc.c_oAscTimePeriod.last7Days},
                                { caption: Common.define.conditionalData.textLastWeek,  type: Asc.c_oAscCFType.timePeriod,  value: Asc.c_oAscTimePeriod.lastWeek},
                                { caption: Common.define.conditionalData.textThisWeek,  type: Asc.c_oAscCFType.timePeriod,  value: Asc.c_oAscTimePeriod.thisWeek},
                                { caption: Common.define.conditionalData.textNextWeek,  type: Asc.c_oAscCFType.timePeriod,  value: Asc.c_oAscTimePeriod.nextWeek},
                                { caption: Common.define.conditionalData.textLastMonth,  type: Asc.c_oAscCFType.timePeriod,  value: Asc.c_oAscTimePeriod.lastMonth},
                                { caption: Common.define.conditionalData.textThisMonth,  type: Asc.c_oAscCFType.timePeriod,  value: Asc.c_oAscTimePeriod.thisMonth},
                                { caption: Common.define.conditionalData.textNextMonth,  type: Asc.c_oAscCFType.timePeriod,  value: Asc.c_oAscTimePeriod.nextMonth}
                            ]
                        })
                    },
                    {
                        caption: Common.define.conditionalData.textBlank + '/' + Common.define.conditionalData.textError,
                        menu        : new Common.UI.Menu({
                            menuAlign   : 'tl-tr',
                            items: [
                                { caption: Common.define.conditionalData.textBlanks,   type: Asc.c_oAscCFType.containsBlanks },
                                { caption: Common.define.conditionalData.textNotBlanks,type: Asc.c_oAscCFType.notContainsBlanks },
                                { caption: Common.define.conditionalData.textErrors,   type: Asc.c_oAscCFType.containsErrors },
                                { caption: Common.define.conditionalData.textNotErrors,type: Asc.c_oAscCFType.notContainsErrors }
                            ]
                        })
                    },
                    {
                        caption: Common.define.conditionalData.textDuplicate + '/' + Common.define.conditionalData.textUnique,
                        menu        : new Common.UI.Menu({
                            menuAlign   : 'tl-tr',
                            items: [
                                { caption: Common.define.conditionalData.textDuplicate,    type: Asc.c_oAscCFType.duplicateValues },
                                { caption: Common.define.conditionalData.textUnique,       type: Asc.c_oAscCFType.uniqueValues }
                            ]
                        })
                    },
                    {caption: '--'},
                    this.mnuDataBars = new Common.UI.MenuItem({
                        caption     : this.textDataBars,
                        type        : Asc.c_oAscCFType.dataBar,
                        menu        : new Common.UI.Menu({
                            menuAlign   : 'tl-tr',
                            style: 'min-width: auto;',
                            items: []
                        })
                    }),
                    this.mnuColorScales = new Common.UI.MenuItem({
                        caption     : this.textColorScales,
                        type        : Asc.c_oAscCFType.colorScale,
                        menu        : new Common.UI.Menu({
                            menuAlign   : 'tl-tr',
                            style: 'min-width: auto;',
                            items: []
                        })
                    }),
                    this.mnuIconSets = new Common.UI.MenuItem({
                        caption     : Common.define.conditionalData.textIconSets,
                        type        : Asc.c_oAscCFType.iconSet,
                        menu        : new Common.UI.Menu({
                            menuAlign   : 'tl-tr',
                            style: 'min-width: auto;',
                            items: []
                        })
                    }),
                    {caption: '--'},
                    {
                        caption     : Common.define.conditionalData.textFormula,
                        type        : Asc.c_oAscCFType.expression
                    },
                    {caption: '--'},
                    {
                        caption     : this.textNewRule,
                        value       : 'new'
                    },
                    {
                        caption     : this.textClearRule,
                        menu        : new Common.UI.Menu({
                            menuAlign   : 'tl-tr',
                            items: [
                                { value: 'clear', type: Asc.c_oAscSelectionForCFType.selection, caption: this.textSelection },
                                { value: 'clear', type: Asc.c_oAscSelectionForCFType.worksheet, caption: this.textThisSheet },
                                { value: 'clear', type: Asc.c_oAscSelectionForCFType.table, caption: this.textThisTable },
                                { value: 'clear', type: Asc.c_oAscSelectionForCFType.pivot, caption: this.textThisPivot }
                            ]
                        })
                    },
                    {
                        caption     : this.textManageRule,
                        value       : 'manage'
                    }
                ]
            }));
            this.btnCondFormat.menu.on('show:before', _.bind(function() {
                this.fireEvent('cf:init', [this, 'cell']);
            }, this));
            this._initSettings = false;
        },

        ChangeSettings: function(props) {
            var me = this;
            if (this._initSettings)
                this.createDelayedElements();

            this.disableControls(this._locked);

            if (props ) {
                this._noApply = true;

                var xfs = props.asc_getXfs(),
                    value = xfs.asc_getAngle();
                if (Math.abs(this._state.CellAngle - value) > 0.1 || (this._state.CellAngle === undefined) && (this._state.CellAngle !== value)) {
                    this.spnAngle.setValue((value !== null) ? (value==255 ? 0 : value) : '', true);
                    this._state.CellAngle = value;
                }

                value = xfs.asc_getIndent();
                if (Math.abs(this._state.CellIndent - value) > 0.1 || (this._state.CellIndent === undefined) && (this._state.CellIndent !== value)) {
                    this.spnIndent.setValue((value !== null) ? value : '', true);
                    this._state.CellIndent = value;
                }

                value = xfs.asc_getWrapText();
                if ( this._state.Wrap!==value ) {
                    this.chWrap.setValue((value !== null && value !== undefined) ? value : 'indeterminate', true);
                    this._state.Wrap=value;
                }
                this.chWrap.setDisabled(xfs.asc_getHorAlign() == AscCommon.align_Justify || this._locked);

                value = xfs.asc_getShrinkToFit();
                if ( this._state.Shrink!==value ) {
                    this.chShrink.setValue((value !== null && value !== undefined) ? value : 'indeterminate', true);
                    this._state.Shrink=value;
                }
                this.chShrink.setDisabled((this.chWrap.getValue()=='checked') || this._locked);

                this.fill = xfs.asc_getFill();
                if (this.fill) {
                    this.pattern = this.fill.asc_getPatternFill();
                    this.gradient = this.fill.asc_getGradientFill();
                    if (this.pattern === null && this.gradient === null) {
                        this.CellColor = {Value: 0, Color: 'transparent'};
                        this.FGColor = {Value: 1, Color: {color: '4f81bd', effectId: 24}};
                        this.BGColor = {Value: 1, Color: 'ffffff'};
                        this.sldrGradient.setThumbs(2);
                        this.GradColor.colors.length = 0;
                        this.GradColor.values.length = 0;
                        this.GradColor.colors[0] = {color: '4f81bd', effectId: 24};
                        this.GradColor.colors[1] = 'ffffff';
                        this.GradColor.values = [0, 100];
                        this.GradColor.currentIdx = 0;
                        this.OriginalFillType = Asc.c_oAscFill.FILL_TYPE_NOFILL;
                    } else if (this.pattern !== null) {
                        if (this.pattern.asc_getType() === -1) {
                            var color = this.pattern.asc_getFgColor();
                            if (color) {
                                if (color.asc_getType() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                                    this.CellColor = {
                                        Value: 1,
                                        Color: {
                                            color: Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB()),
                                            effectValue: color.asc_getValue()
                                        }
                                    };
                                } else {
                                    this.CellColor = {
                                        Value: 1,
                                        Color: Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB())
                                    };
                                }
                                this.FGColor = {
                                    Value: 1,
                                    Color: Common.Utils.ThemeColor.colorValue2EffectId(this.CellColor.Color)
                                };
                            } else {
                                this.FGColor = this.CellColor = {Value: 1, Color: 'ffffff'};
                            }

                            this.BGColor = {Value: 1, Color: 'ffffff'};
                            this.sldrGradient.setThumbs(2);
                            this.GradColor.colors.length = 0;
                            this.GradColor.values.length = 0;
                            this.GradColor.values = [0, 100];
                            this.GradColor.colors[0] = Common.Utils.ThemeColor.colorValue2EffectId(this.CellColor.Color);
                            this.GradColor.colors[1] = 'ffffff';
                            this.GradColor.currentIdx = 0;
                            this.OriginalFillType = Asc.c_oAscFill.FILL_TYPE_SOLID;
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
                                    this.FGColor = {
                                        Value: 1,
                                        Color: {
                                            color: Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB()),
                                            effectValue: color.asc_getValue()
                                        }
                                    };
                                } else {
                                    this.FGColor = {
                                        Value: 1,
                                        Color: Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB())
                                    };
                                }
                            } else
                                this.FGColor = {Value: 1, Color: {color: '000000', effectId: 24}};

                            color = this.pattern.asc_getBgColor();
                            if (color) {
                                if (color.asc_getType() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                                    this.BGColor = {
                                        Value: 1,
                                        Color: {
                                            color: Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB()),
                                            effectValue: color.asc_getValue()
                                        }
                                    };
                                } else {
                                    this.BGColor = {
                                        Value: 1,
                                        Color: Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB())
                                    };
                                }
                            } else
                                this.BGColor = {Value: 1, Color: 'ffffff'};
                            this.CellColor = {
                                Value: 1,
                                Color: Common.Utils.ThemeColor.colorValue2EffectId(this.FGColor.Color)
                            };
                            this.sldrGradient.setThumbs(2);
                            this.GradColor.colors.length = 0;
                            this.GradColor.values.length = 0;
                            this.GradColor.values = [0, 100];
                            this.GradColor.colors[0] = Common.Utils.ThemeColor.colorValue2EffectId(this.FGColor.Color);
                            this.GradColor.colors[1] = 'ffffff';
                            this.GradColor.currentIdx = 0;
                            this.OriginalFillType = Asc.c_oAscFill.FILL_TYPE_PATT;
                        }
                    } else if (this.gradient !== null) {
                        var gradFillType = this.gradient.asc_getType();
                        if (this._state.GradFillType !== gradFillType || this.GradFillType !== gradFillType) {
                            this.GradFillType = gradFillType;
                            /*rec = undefined;
                            if (this.GradFillType == Asc.c_oAscFillGradType.GRAD_LINEAR || this.GradFillType == Asc.c_oAscFillGradType.GRAD_PATH) {
                                this.cmbGradType.setValue(this.GradFillType);
                                rec = this.cmbGradType.store.findWhere({value: this.GradFillType});
                                this.onGradTypeSelect(this.cmbGradType, rec.attributes);
                            } else {
                                this.cmbGradType.setValue('');
                                this.btnDirection.setIconCls('');
                            }*/
                            this._state.GradFillType = this.GradFillType;
                        }
                        if (this.GradFillType == Asc.c_oAscFillGradType.GRAD_LINEAR) {
                            var value = this.gradient.asc_getDegree();
                            if (Math.abs(this.GradLinearDirectionType - value) > 0.001) {
                                this.GradLinearDirectionType = value;
                                var record = this.mnuDirectionPicker.store.findWhere({type: value});
                                this.mnuDirectionPicker.selectRecord(record, true);
                                if (record)
                                    this.typeGradient = value + 90;
                                else
                                    this.typeGradient= -1;
                                this.numGradientAngle.setValue(value, true);
                            }
                        }

                        var me = this;


                        var gradientStops;
                        gradientStops = this.gradient.asc_getGradientStops();
                        var length = gradientStops.length;
                        this.sldrGradient.setThumbs(length);
                        this.GradColor.colors.length = 0;
                        this.GradColor.values.length = 0;
                        gradientStops.forEach(function (color) {
                            var clr = color.asc_getColor(),
                                position = color.asc_getPosition();
                            me.GradColor.colors.push( clr.asc_getType() == Asc.c_oAscColor.COLOR_TYPE_SCHEME ?
                                {color: Common.Utils.ThemeColor.getHexColor(clr.asc_getR(), clr.asc_getG(), clr.asc_getB()), effectValue: clr.asc_getValue()} :
                                Common.Utils.ThemeColor.getHexColor(clr.asc_getR(), clr.asc_getG(), clr.asc_getB()));
                            me.GradColor.values.push(position*100);
                        });

                        var arrGrCollors=[];
                        for (var index=0; index<length; index++) {
                            me.sldrGradient.setColorValue(Common.Utils.String.format('#{0}', (typeof(me.GradColor.colors[index]) == 'object') ? me.GradColor.colors[index].color : me.GradColor.colors[index]), index);
                            me.sldrGradient.setValue(index, me.GradColor.values[index]);
                            arrGrCollors.push(me.sldrGradient.getColorValue(index)+ ' '+ me.sldrGradient.getValue(index) +'%');
                        }
                        this.btnDirectionRedraw(me.sldrGradient, arrGrCollors.join(', '));

                        if (_.isUndefined(me.GradColor.currentIdx) || me.GradColor.currentIdx >= me.GradColor.colors.length) {
                            me.GradColor.currentIdx = 0;
                        }
                        me.sldrGradient.setActiveThumb(me.GradColor.currentIdx);

                        // Step position
                        var curValue = this.GradColor.values[this.GradColor.currentIdx];
                        this.spnGradPosition.setValue(Common.UI.isRTL() ? this.sldrGradient.maxValue - curValue : curValue);

                        this.OriginalFillType = Asc.c_oAscFill.FILL_TYPE_GRAD;
                        this.FGColor = {
                            Value: 1,
                            Color: Common.Utils.ThemeColor.colorValue2EffectId(this.GradColor.colors[0])
                        };
                        this.BGColor = {Value: 1, Color: 'ffffff'};
                        this.CellColor = {
                            Value: 1,
                            Color: Common.Utils.ThemeColor.colorValue2EffectId(this.GradColor.colors[0])
                        };
                    }

                    if (this._state.FillType !== this.OriginalFillType) {
                        this.cmbFillSrc.setValue((this.OriginalFillType === null) ? '' : this.OriginalFillType);
                        this._state.FillType = this.OriginalFillType;
                        this.ShowHideElem(this.OriginalFillType);
                    }

                    // Color Back

                    var type1 = typeof (this.CellColor.Color),
                        type2 = typeof (this._state.CellColor);
                    if ((type1 !== type2) || (type1 == 'object' &&
                        (this.CellColor.Color.effectValue !== this._state.CellColor.effectValue || this._state.CellColor.color.indexOf(this.CellColor.Color) < 0)) ||
                        (type1 != 'object' && this._state.CellColor !== undefined && this._state.CellColor.indexOf(this.CellColor.Color) < 0)) {

                        this.btnBackColor.setColor(this.CellColor.Color);
                        Common.Utils.ThemeColor.selectPickerColorByEffect(this.CellColor.Color, this.colorsBack);
                        this._state.CellColor = this.CellColor.Color;
                    }

                    // Pattern colors
                    type1 = typeof (this.FGColor.Color);
                    type2 = typeof (this._state.FGColor);

                    if ((type1 !== type2) || (type1 == 'object' &&
                        (this.FGColor.Color.effectValue !== this._state.FGColor.effectValue || this._state.FGColor.color.indexOf(this.FGColor.Color.color) < 0)) ||
                        (type1 != 'object' && this._state.FGColor.indexOf(this.FGColor.Color) < 0)) {

                        this.btnFGColor.setColor(this.FGColor.Color);
                        Common.Utils.ThemeColor.selectPickerColorByEffect(this.FGColor.Color, this.colorsFG);
                        this._state.FGColor = this.FGColor.Color;
                    }

                    type1 = typeof (this.BGColor.Color);
                    type2 = typeof (this._state.BGColor);

                    if ((type1 !== type2) || (type1 == 'object' &&
                        (this.BGColor.Color.effectValue !== this._state.BGColor.effectValue || this._state.BGColor.color.indexOf(this.BGColor.Color.color) < 0)) ||
                        (type1 != 'object' && this._state.BGColor.indexOf(this.BGColor.Color) < 0)) {

                        this.btnBGColor.setColor(this.BGColor.Color);
                        Common.Utils.ThemeColor.selectPickerColorByEffect(this.BGColor.Color, this.colorsBG);
                        this._state.BGColor = this.BGColor.Color;
                    }

                    // Gradient colors
                    var gradColor = this.GradColor.colors[this.GradColor.currentIdx];
                    type1 = typeof (gradColor);
                    type2 = typeof (this._state.GradColor);

                    if ((type1 !== type2) || (type1 == 'object' &&
                        (gradColor.effectValue !== this._state.GradColor.effectValue || this._state.GradColor.color.indexOf(gradColor.color) < 0)) ||
                        (type1 != 'object' && this._state.GradColor.indexOf(gradColor) < 0)) {

                        this.btnGradColor.setColor(gradColor);
                        Common.Utils.ThemeColor.selectPickerColorByEffect(gradColor, this.colorsGrad);
                        this._state.GradColor = gradColor;
                    }

                    this._noApply = false;
                }
            }
        },

        btnDirectionRedraw: function(slider, gradientColorsStr) {
            this.gradientColorsStr = gradientColorsStr;
            _.each(this._viewDataLinear, function(item){
                item.gradientColorsStr = gradientColorsStr;
            });
            this.mnuDirectionPicker.store.each(function(item){
                item.set('gradientColorsStr', gradientColorsStr);
            }, this);

            if (this.typeGradient == -1)
                this.btnDirection.$icon.css({'background': 'none'});
            else if (this.typeGradient == 2)
                this.btnDirection.$icon.css({'background': ('radial-gradient(' + gradientColorsStr + ')')});
            else
                this.btnDirection.$icon.css({
                    'background': ('linear-gradient(' + this.typeGradient + 'deg, ' + gradientColorsStr + ')')
                });
        },

        UpdateThemeColors: function() {
             if (!this.borderColor) {
                // create color buttons
                 this.btnBorderColor.setMenu();
                 this.borderColor = this.btnBorderColor.getPicker();
                 this.btnBorderColor.on('eyedropper:start', _.bind(this.onEyedropperStart, this));
                 this.btnBorderColor.on('eyedropper:end', _.bind(this.onEyedropperEnd, this));

                 this.btnBackColor.setMenu();
                 this.btnBackColor.on('color:select', _.bind(this.onColorsBackSelect, this));
                 this.btnBackColor.on('eyedropper:start', _.bind(this.onEyedropperStart, this));
                 this.btnBackColor.on('eyedropper:end', _.bind(this.onEyedropperEnd, this));
                 this.colorsBack = this.btnBackColor.getPicker();
                 this.fillControls.push(this.btnBackColor);

                 this.btnGradColor = new Common.UI.ColorButton({
                     parentEl: $('#cell-gradient-color-btn'),
                     color: '000000',
                     eyeDropper: true,
                     dataHint: '1',
                     dataHintDirection: 'bottom',
                     dataHintOffset: 'big',
                     ariaLabel: this.textGradientColor
                 });
                 this.fillControls.push(this.btnGradColor);
                 this.colorsGrad = this.btnGradColor.getPicker();
                 this.btnGradColor.on('color:select', _.bind(this.onColorsGradientSelect, this));
                 this.btnGradColor.on('eyedropper:start', _.bind(this.onEyedropperStart, this));
                 this.btnGradColor.on('eyedropper:end', _.bind(this.onEyedropperEnd, this));

                 this.btnFGColor = new Common.UI.ColorButton({
                     parentEl: $('#cell-foreground-color-btn'),
                     color: '000000',
                     eyeDropper: true,
                     dataHint: '1',
                     dataHintDirection: 'bottom',
                     dataHintOffset: 'medium',
                     ariaLabel: this.textForeground
                 });
                 this.fillControls.push(this.btnFGColor);
                 this.colorsFG = this.btnFGColor.getPicker();
                 this.btnFGColor.on('color:select', _.bind(this.onColorsFGSelect, this));
                 this.btnFGColor.on('eyedropper:start', _.bind(this.onEyedropperStart, this));
                 this.btnFGColor.on('eyedropper:end', _.bind(this.onEyedropperEnd, this));

                 this.btnBGColor = new Common.UI.ColorButton({
                     parentEl: $('#cell-background-color-btn'),
                     color: 'ffffff',
                     eyeDropper: true,
                     dataHint: '1',
                     dataHintDirection: 'bottom',
                     dataHintOffset: 'medium',
                     ariaLabel: this.textBackground
                 });
                 this.fillControls.push(this.btnBGColor);
                 this.colorsBG = this.btnBGColor.getPicker();
                 this.btnBGColor.on('color:select', _.bind(this.onColorsBGSelect, this));
                 this.btnBGColor.on('eyedropper:start', _.bind(this.onEyedropperStart, this));
                 this.btnBGColor.on('eyedropper:end', _.bind(this.onEyedropperEnd, this));
             }
             this.colorsBack.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
             this.borderColor.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
            !this.btnBorderColor.isAutoColor() && this.btnBorderColor.setColor(this.borderColor.getColor());
             this.colorsGrad.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
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
                            this.GradColor.currentIdx = 0;
                            if (this.GradColor.colors.length === 2) {
                                var HexColor0 = Common.Utils.ThemeColor.getRgbColor(this.GradColor.colors[0]).get_color().get_hex(),
                                    HexColor1 = Common.Utils.ThemeColor.getRgbColor(this.GradColor.colors[1]).get_color().get_hex();
                                if (HexColor0 === 'ffffff' && HexColor1 === 'ffffff') {
                                    this.GradColor.colors[0] = {color: '4f81bd', effectId: 24};    // color accent1
                                }
                            }
                            var arrGradStop = [];
                            this.GradColor.colors.forEach(function (item, index) {
                                var gradientStop = new Asc.asc_CGradientStop();
                                gradientStop.asc_setColor(Common.Utils.ThemeColor.getRgbColor(me.GradColor.colors[index]));
                                gradientStop.asc_setPosition(me.GradColor.values[index]/100);
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

        /*onGradTypeSelect: function(combo, record) {
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
        },*/

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

            this.typeGradient = rawData.type + 90;
            this.GradLinearDirectionType = rawData.type;
            this.numGradientAngle.setValue(rawData.type, true);

            if (this.api) {
                if (this.GradFillType == Asc.c_oAscFillGradType.GRAD_LINEAR) {
                    if (this.gradient == null) {
                        this.gradient = new Asc.asc_CGradientFill();
                        this.gradient.asc_setType(this.GradFillType);
                        var arrGradStop = [];
                        this.GradColor.values.forEach(function (item, index) {
                            var gradientStop = new Asc.asc_CGradientStop();
                            gradientStop.asc_setColor(Common.Utils.ThemeColor.getRgbColor(me.GradColor.colors[index]));
                            gradientStop.asc_setPosition(me.GradColor.values[index]/100);
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

        onColorsGradientSelect: function(btn, color) {
            var me = this;
            this.GradColor.colors[this.GradColor.currentIdx] = color;
            this.sldrGradient.setColorValue(Common.Utils.String.format('#{0}', (typeof(color) == 'object') ? color.color : color));

            if (this.api && !this._noApply) {
                if (this.gradient == null) {
                    this.gradient = new Asc.asc_CGradientFill();
                    this.gradient.asc_setType(this.GradFillType);
                    if (this.GradFillType == Asc.c_oAscFillGradType.GRAD_LINEAR) {
                        this.gradient.asc_setDegree(this.GradLinearDirectionType);
                    }
                }
                var arrGradStop = [];
                this.GradColor.values.forEach(function (item, index) {
                    var gradientStop = new Asc.asc_CGradientStop();
                    gradientStop.asc_setColor(Common.Utils.ThemeColor.getRgbColor(Common.Utils.ThemeColor.colorValue2EffectId(me.GradColor.colors[index])));
                    gradientStop.asc_setPosition(me.GradColor.values[index]/100);
                    arrGradStop.push(gradientStop);
                });
                this.gradient.asc_putGradientStops(arrGradStop);

                this.fill.asc_setGradientFill(this.gradient);
                this.api.asc_setCellFill(this.fill);
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onGradientAngleChange: function(field, newValue, oldValue, eOpts) {
            if (this.api && !this._noApply) {
                if (this.gradient == null) {
                    this.gradient = new Asc.asc_CGradientFill();
                    this.gradient.asc_setType(this.GradFillType);
                }
                if (this.GradFillType == Asc.c_oAscFillGradType.GRAD_LINEAR) {
                    this.gradient.asc_setDegree(field.getNumberValue());
                }
                this.fill.asc_setGradientFill(this.gradient);
                this.api.asc_setCellFill(this.fill);
            }
        },

        onGradientChange: function(slider, newValue, oldValue) {
            this.GradColor.values = slider.getValues();
            var curValue = this.GradColor.values[this.GradColor.currentIdx];
            this.spnGradPosition.setValue(Common.UI.isRTL() ? this.sldrGradient.maxValue - curValue : curValue, true);
            this._sliderChanged = true;
            if (this.api && !this._noApply) {
                if (this._sendUndoPoint)  {
                    this.api.setStartPointHistory();
                    this._sendUndoPoint = false;
                    this.updateslider = setInterval(_.bind(this._gradientApplyFunc, this), 100);
                }
            }
        },

        onGradientChangeComplete: function(slider, newValue, oldValue) {
            clearInterval(this.updateslider);
            this._sliderChanged = true;
            if (!this._sendUndoPoint) { // start point was added
                this.api.setEndPointHistory();
                this._gradientApplyFunc();
            }
            this._sendUndoPoint = true;
        },

        _gradientApplyFunc: function() {
            if (this._sliderChanged) {
                var me = this;
                if (this.gradient == null)
                    this.gradient = new Asc.asc_CGradientFill();
                var arrGradStop = [];
                this.GradColor.colors.forEach(function (item, index) {
                    var gradientStop = new Asc.asc_CGradientStop();
                    gradientStop.asc_setColor(Common.Utils.ThemeColor.getRgbColor(Common.Utils.ThemeColor.colorValue2EffectId(me.GradColor.colors[index])));
                    gradientStop.asc_setPosition(me.GradColor.values[index]/100);
                    arrGradStop.push(gradientStop);
                });
                this.gradient.asc_putGradientStops(arrGradStop);

                this.fill.asc_setGradientFill(this.gradient);
                this.api.asc_setCellFill(this.fill);

                this._sliderChanged = false;
            }
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

        onColorsFGSelect: function(btn, color) {
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

        onColorsBGSelect: function(btn, color) {
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

        onWrapChange: function(field, newValue, oldValue, eOpts){
            if (this.api && !this._noApply)
                this.api.asc_setCellTextWrap((field.getValue()=='checked'));
            this.chShrink.setDisabled((field.getValue()=='checked') || this._locked);
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onShrinkChange: function(field, newValue, oldValue, eOpts){
            if (this.api && !this._noApply)
                this.api.asc_setCellTextShrink((field.getValue()=='checked'));
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onPositionChange: function(btn) {
            var me = this,
                pos = btn.getNumberValue();
            if (Common.UI.isRTL()) {
                pos = this.sldrGradient.maxValue - pos;
            }
            var minValue = (this.GradColor.currentIdx-1<0) ? 0 : this.GradColor.values[this.GradColor.currentIdx-1],
                maxValue = (this.GradColor.currentIdx+1<this.GradColor.values.length) ? this.GradColor.values[this.GradColor.currentIdx+1] : 100,
                needSort = pos < minValue || pos > maxValue;
            if (this.api) {
                this.GradColor.values[this.GradColor.currentIdx] = pos;
                if (this.gradient == null) {
                    this.gradient = new Asc.asc_CGradientFill();
                    this.gradient.asc_setType(this.GradFillType);
                }
                var arrGradStop = [];
                this.GradColor.values.forEach(function (item, index) {
                    var gradientStop = new Asc.asc_CGradientStop();
                    gradientStop.asc_setColor(Common.Utils.ThemeColor.getRgbColor(Common.Utils.ThemeColor.colorValue2EffectId(me.GradColor.colors[index])));
                    gradientStop.asc_setPosition(me.GradColor.values[index]/100);
                    arrGradStop.push(gradientStop);
                });
                this.gradient.asc_putGradientStops(arrGradStop);

                this.fill.asc_setGradientFill(this.gradient);
                this.api.asc_setCellFill(this.fill);

                if (needSort) {
                    this.sldrGradient.sortThumbs();
                    this.sldrGradient.trigger('change', this.sldrGradient);
                    this.sldrGradient.trigger('changecomplete', this.sldrGradient);
                }
            }
        },

        onAddGradientStep: function() {
            if (this.GradColor.colors.length > 9) return;
            var curIndex = this.GradColor.currentIdx;
            var pos = (this.GradColor.values[curIndex] + this.GradColor.values[curIndex < this.GradColor.colors.length - 1 ? curIndex + 1 : curIndex - 1]) / 2;

            this.GradColor.colors[this.GradColor.colors.length] = this.GradColor.colors[curIndex];
            this.GradColor.currentIdx = this.GradColor.colors.length - 1;
            var color = this.sldrGradient.addNewThumb(undefined, pos, curIndex);
            this.GradColor.colors[this.GradColor.currentIdx] = color;

            this.sldrGradient.trigger('change', this.sldrGradient);
            this.sldrGradient.trigger('changecomplete', this.sldrGradient);
        },

        onRemoveGradientStep: function() {
            if (this.GradColor.values.length < 3) return;
            var index = this.GradColor.currentIdx;
            this.GradColor.values.splice(this.GradColor.currentIdx, 1);
            this.sldrGradient.removeThumb(this.GradColor.currentIdx);
            if (_.isUndefined(this.GradColor.currentIdx) || this.GradColor.currentIdx >= this.GradColor.colors.length) {
                var newIndex = index > 0 ? index - 1 : index;
                newIndex = (newIndex === 0 && this.GradColor.values.length > 2) ? this.GradColor.values.length - 2 : newIndex;
                this.GradColor.currentIdx = newIndex;
            }
            this.sldrGradient.setActiveThumb(this.GradColor.currentIdx);
        },

        onEyedropperStart: function (btn) {
            this.api.asc_startEyedropper(_.bind(btn.eyedropperEnd, btn));
            this.fireEvent('eyedropper', true);
        },

        onEyedropperEnd: function () {
            this.fireEvent('eyedropper', false);
        }

    }, SSE.Views.CellSettings || {}));
});