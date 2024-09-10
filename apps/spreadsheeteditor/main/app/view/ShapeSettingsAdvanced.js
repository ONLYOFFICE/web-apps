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
 *  ShapeSettingsAdvanced.js
 *
 *  Created on 3/31/14
 *
 */

define([
    'text!spreadsheeteditor/main/app/template/ShapeSettingsAdvanced.template',
    'common/main/lib/view/AdvancedSettingsWindow',
], function (contentTemplate) {
    'use strict';

    SSE.Views.ShapeSettingsAdvanced = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 300,
            contentHeight: 257,
            toggleGroup: 'shape-adv-settings-group',
            sizeOriginal: {width: 0, height: 0},
            sizeMax: {width: 55.88, height: 55.88},
            properties: null,
            storageName: 'sse-shape-settings-adv-category'
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle,
                items: [
                    {panelId: 'id-adv-shape-width',      panelCaption: this.textSize},
                    {panelId: 'id-adv-shape-rotate',     panelCaption: this.textRotation},
                    {panelId: 'id-adv-shape-shape',      panelCaption: this.textWeightArrows},
                    {panelId: 'id-adv-shape-margins',    panelCaption: this.textTextBox},
                    {panelId: 'id-adv-shape-columns',    panelCaption: this.strColumns},
                    {panelId: 'id-adv-shape-snap',       panelCaption: this.textSnap},
                    {panelId: 'id-adv-shape-alttext',    panelCaption: this.textAlt}
                ],
                contentTemplate: _.template(contentTemplate)({
                    scope: this
                })
            }, options);
            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);

            this.spinners = [];

            this.Margins = undefined;
            this._nRatio = 1;

            this._originalProps = this.options.shapeProps;
            this._changedProps = null;
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);

            var me = this;

            this.spnWidth = new Common.UI.MetricSpinner({
                el: $('#shape-advanced-spin-width'),
                step: .1,
                width: 100,
                defaultUnit : "cm",
                value: '3 cm',
                maxValue: 55.88,
                minValue: 0
            });
            this.spnWidth.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this.btnRatio.pressed) {
                    var w = field.getNumberValue();
                    var h = w/this._nRatio;
                    if (h>this.spnHeight.options.maxValue) {
                        h = this.spnHeight.options.maxValue;
                        w = h * this._nRatio;
                        this.spnWidth.setValue(w, true);
                    }
                    this.spnHeight.setValue(h, true);
                }
                if (this._changedProps) {
                    this._changedProps.asc_putWidth(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                    this._changedProps.asc_putHeight(Common.Utils.Metric.fnRecalcToMM(this.spnHeight.getNumberValue()));
                }
            }, this));
            this.spinners.push(this.spnWidth);

            this.spnHeight = new Common.UI.MetricSpinner({
                el: $('#shape-advanced-spin-height'),
                step: .1,
                width: 100,
                defaultUnit : "cm",
                value: '3 cm',
                maxValue: 55.88,
                minValue: 0
            });
            this.spnHeight.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                var h = field.getNumberValue(), w = null;
                if (this.btnRatio.pressed) {
                    w = h * this._nRatio;
                    if (w>this.spnWidth.options.maxValue) {
                        w = this.spnWidth.options.maxValue;
                        h = w/this._nRatio;
                        this.spnHeight.setValue(h, true);
                    }
                    this.spnWidth.setValue(w, true);
                }
                if (this._changedProps) {
                    this._changedProps.asc_putHeight(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                    this._changedProps.asc_putWidth(Common.Utils.Metric.fnRecalcToMM(this.spnWidth.getNumberValue()));
                }
            }, this));
            this.spinners.push(this.spnHeight);

            this.btnRatio = new Common.UI.Button({
                parentEl: $('#shape-advanced-button-ratio'),
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
                if (this._changedProps) {
                    this._changedProps.asc_putLockAspect(btn.pressed);
                }
            }, this));

            // Margins
            this.spnMarginTop = new Common.UI.MetricSpinner({
                el: $('#shape-margin-top'),
                step: .1,
                width: 100,
                defaultUnit : "cm",
                value: '0 cm',
                maxValue: 55.87,
                minValue: 0
            });
            this.spnMarginTop.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    if (this._changedProps.asc_getShapeProperties()===null || this._changedProps.asc_getShapeProperties()===undefined)
                        this._changedProps.asc_putShapeProperties(new Asc.asc_CShapeProperty());

                    if (this._changedProps.asc_getShapeProperties().asc_getPaddings()===null)
                        this._changedProps.asc_getShapeProperties().asc_putPaddings(new Asc.asc_CPaddings());

                    this._changedProps.asc_getShapeProperties().asc_getPaddings().asc_putTop(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                }
            }, this));
            this.spinners.push(this.spnMarginTop);

            this.spnMarginBottom = new Common.UI.MetricSpinner({
                el: $('#shape-margin-bottom'),
                step: .1,
                width: 100,
                defaultUnit : "cm",
                value: '0 cm',
                maxValue: 55.87,
                minValue: 0
            });
            this.spnMarginBottom.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    if (this._changedProps.asc_getShapeProperties()===null || this._changedProps.asc_getShapeProperties()===undefined)
                        this._changedProps.asc_putShapeProperties(new Asc.asc_CShapeProperty());

                    if (this._changedProps.asc_getShapeProperties().asc_getPaddings()===null)
                        this._changedProps.asc_getShapeProperties().asc_putPaddings(new Asc.asc_CPaddings());

                    this._changedProps.asc_getShapeProperties().asc_getPaddings().asc_putBottom(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                }
            }, this));
            this.spinners.push(this.spnMarginBottom);

            this.spnMarginLeft = new Common.UI.MetricSpinner({
                el: $('#shape-margin-left'),
                step: .1,
                width: 100,
                defaultUnit : "cm",
                value: '0.19 cm',
                maxValue: 9.34,
                minValue: 0
            });
            this.spnMarginLeft.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    if (this._changedProps.asc_getShapeProperties()===null || this._changedProps.asc_getShapeProperties()===undefined)
                        this._changedProps.asc_putShapeProperties(new Asc.asc_CShapeProperty());

                    if (this._changedProps.asc_getShapeProperties().asc_getPaddings()===null)
                        this._changedProps.asc_getShapeProperties().asc_putPaddings(new Asc.asc_CPaddings());

                    this._changedProps.asc_getShapeProperties().asc_getPaddings().asc_putLeft(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                }
            }, this));
            this.spinners.push(this.spnMarginLeft);

            this.spnMarginRight = new Common.UI.MetricSpinner({
                el: $('#shape-margin-right'),
                step: .1,
                width: 100,
                defaultUnit : "cm",
                value: '0.19 cm',
                maxValue: 9.34,
                minValue: 0
            });
            this.spnMarginRight.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    if (this._changedProps.asc_getShapeProperties()===null || this._changedProps.asc_getShapeProperties()===undefined)
                        this._changedProps.asc_putShapeProperties(new Asc.asc_CShapeProperty());

                    if (this._changedProps.asc_getShapeProperties().asc_getPaddings()===null)
                        this._changedProps.asc_getShapeProperties().asc_putPaddings(new Asc.asc_CPaddings());

                    this._changedProps.asc_getShapeProperties().asc_getPaddings().asc_putRight(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                }
            }, this));
            this.spinners.push(this.spnMarginRight);

            this.chAutofit = new Common.UI.CheckBox({
                el: $('#shape-checkbox-autofit'),
                labelText: this.textResizeFit
            });
            this.chAutofit.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    if (this._changedProps.asc_getShapeProperties()===null || this._changedProps.asc_getShapeProperties()===undefined)
                        this._changedProps.asc_putShapeProperties(new Asc.asc_CShapeProperty());
                    this._changedProps.asc_getShapeProperties().asc_putTextFitType(field.getValue()=='checked' ? AscFormat.text_fit_Auto : AscFormat.text_fit_No);
                }
            }, this));

            this.chOverflow = new Common.UI.CheckBox({
                el: $('#shape-checkbox-overflow'),
                labelText: this.textOverflow
            });
            this.chOverflow.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    if (this._changedProps.asc_getShapeProperties()===null || this._changedProps.asc_getShapeProperties()===undefined)
                        this._changedProps.asc_putShapeProperties(new Asc.asc_CShapeProperty());
                    this._changedProps.asc_getShapeProperties().asc_putVertOverflowType(field.getValue()=='checked' ? AscFormat.nOTOwerflow : AscFormat.nOTClip);
                }
            }, this));

            // Rotation
            this.spnAngle = new Common.UI.MetricSpinner({
                el: $('#shape-advanced-spin-angle'),
                step: 1,
                width: 80,
                defaultUnit : "°",
                value: '0 °',
                maxValue: 3600,
                minValue: -3600
            });

            this.chFlipHor = new Common.UI.CheckBox({
                el: $('#shape-advanced-checkbox-hor'),
                labelText: this.textHorizontally
            });

            this.chFlipVert = new Common.UI.CheckBox({
                el: $('#shape-advanced-checkbox-vert'),
                labelText: this.textVertically
            });

            // Shape
            this._arrCapType = [
                {displayValue: this.textFlat,   value: Asc.c_oAscLineCapType.Flat},
                {displayValue: this.textRound, value: Asc.c_oAscLineCapType.Round},
                {displayValue: this.textSquare,  value: Asc.c_oAscLineCapType.Square}
            ];

            this.cmbCapType = new Common.UI.ComboBox({
                el: $('#shape-advanced-cap-type'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100px;',
                editable: false,
                data: this._arrCapType,
                takeFocusOnClose: true
            });
            this.cmbCapType.setValue(Asc.c_oAscLineCapType.Flat);
            this.cmbCapType.on('selected', _.bind(function(combo, record){
                if (this._changedProps) {
                    if (this._changedProps.asc_getShapeProperties()===null || this._changedProps.asc_getShapeProperties()===undefined)
                        this._changedProps.asc_putShapeProperties(new Asc.asc_CShapeProperty());
                    if (this._changedProps.asc_getShapeProperties().asc_getStroke()===null)
                        this._changedProps.asc_getShapeProperties().asc_putStroke(new Asc.asc_CStroke());

                    this._changedProps.asc_getShapeProperties().asc_getStroke().asc_putLinecap(record.value);
                }
            }, this));

            this._arrJoinType = [
                {displayValue: this.textRound,   value: Asc.c_oAscLineJoinType.Round},
                {displayValue: this.textBevel, value: Asc.c_oAscLineJoinType.Bevel},
                {displayValue: this.textMiter,  value: Asc.c_oAscLineJoinType.Miter}
            ];
            this.cmbJoinType = new Common.UI.ComboBox({
                el: $('#shape-advanced-join-type'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100px;',
                editable: false,
                data: this._arrJoinType,
                takeFocusOnClose: true
            });
            this.cmbJoinType.setValue(Asc.c_oAscLineJoinType.Round);
            this.cmbJoinType.on('selected', _.bind(function(combo, record){
                if (this._changedProps) {
                    if (this._changedProps.asc_getShapeProperties()===null || this._changedProps.asc_getShapeProperties()===undefined)
                        this._changedProps.asc_putShapeProperties(new Asc.asc_CShapeProperty());
                    if (this._changedProps.asc_getShapeProperties().asc_getStroke()===null)
                        this._changedProps.asc_getShapeProperties().asc_putStroke(new Asc.asc_CStroke());

                    this._changedProps.asc_getShapeProperties().asc_getStroke().asc_putLinejoin(record.value);
                }
            }, this));


            var _arrStyles = [], _arrSize = [];
            _arrStyles.push({type: Asc.c_oAscLineBeginType.None, idsvg: 'no-'});
            _arrStyles.push({type: Asc.c_oAscLineBeginType.Triangle, idsvg: ''});
            _arrStyles.push({type: Asc.c_oAscLineBeginType.Arrow, idsvg: 'open-'});
            _arrStyles.push({type: Asc.c_oAscLineBeginType.Stealth, idsvg: 'stealth-'});
            _arrStyles.push({type: Asc.c_oAscLineBeginType.Diamond, idsvg: 'dimond-'});
            _arrStyles.push({type: Asc.c_oAscLineBeginType.Oval, idsvg: 'oval-'});

            for ( var i=0; i<6; i++ )
                _arrStyles[i].value = i;

            for ( i=0; i<9; i++ )
                _arrSize.push({value: i, typearrow:''});

            _arrSize[0].type = Asc.c_oAscLineBeginSize.small_small;
            _arrSize[1].type = Asc.c_oAscLineBeginSize.small_mid;
            _arrSize[2].type = Asc.c_oAscLineBeginSize.small_large;
            _arrSize[3].type = Asc.c_oAscLineBeginSize.mid_small;
            _arrSize[4].type = Asc.c_oAscLineBeginSize.mid_mid;
            _arrSize[5].type = Asc.c_oAscLineBeginSize.mid_large;
            _arrSize[6].type = Asc.c_oAscLineBeginSize.large_small;
            _arrSize[7].type = Asc.c_oAscLineBeginSize.large_mid;
            _arrSize[8].type = Asc.c_oAscLineBeginSize.large_large;


            this.btnBeginStyle = new Common.UI.ComboBoxDataView({
                el: $('#shape-advanced-begin-style'),
                additionalAlign: this.menuAddAlign,
                cls: 'combo-arrow-style move-focus',
                menuStyle: 'min-width: 105px;',
                dataViewStyle: 'width: 105px; margin: 0 5px;',
                store: new Common.UI.DataViewStore(_arrStyles),
                formTemplate: _.template([
                    '<div class="form-control" style="width: 100px;">',
                    '<i class="img-arrows"><svg><use xlink:href="#no-arrow-5"></use></svg></i>',
                    '</div>'
                ].join('')),
                itemTemplate: _.template('<div id="<%= id %>" class="item-arrow img-arrows">' +
                    '<svg><use xlink:href= "#<%= idsvg %>arrow-5"></use></svg></div>'),
                takeFocusOnClose: true,
                updateFormControl: this.updateFormControl
            });
            this.btnBeginStyle.on('item:click', _.bind(this.onSelectBeginStyle, this));
            this.mnuBeginStylePicker = this.btnBeginStyle.getPicker();
            this.btnBeginStyle.updateFormControl();

            this.btnBeginSize = new Common.UI.ComboBoxDataView({
                el: $('#shape-advanced-begin-size'),
                additionalAlign: this.menuAddAlign,
                cls: 'combo-arrow-style move-focus',
                menuStyle: 'min-width: 105px;',
                dataViewStyle: 'width: 160px; margin: 0 5px;',
                store: new Common.UI.DataViewStore(_arrSize),
                formTemplate: _.template([
                    '<div class="form-control" style="width: 100px;">',
                    '<i class="img-arrows"><svg><use xlink:href=""></use></svg></i>',
                    '</div>'
                ].join('')),
                itemTemplate: _.template('<div id="<%= id %>" class="item-arrow img-arrows">' +
                    '<svg><use xlink:href="#<%= typearrow %>arrow-<%= (value+1) %>"></use></svg></div>'),
                takeFocusOnClose: true,
                updateFormControl: this.updateFormControl
            });
            this.btnBeginSize.on('item:click', _.bind(this.onSelectBeginSize, this));
            this.mnuBeginSizePicker = this.btnBeginSize.getPicker();
            this.btnBeginSize.updateFormControl();

            for ( i=0; i<_arrStyles.length; i++ )
                _arrStyles[i].offsety += 200;

            for ( i=0; i<_arrSize.length; i++ )
                _arrSize[i].offsety += 200;

            this.btnEndStyle = new Common.UI.ComboBoxDataView({
                el: $('#shape-advanced-end-style'),
                additionalAlign: this.menuAddAlign,
                cls: 'combo-arrow-style move-focus',
                menuStyle: 'min-width: 105px;',
                dataViewStyle: 'width: 105px; margin: 0 5px;',
                store: new Common.UI.DataViewStore(_arrStyles),
                formTemplate: _.template([
                    '<div class="form-control" style="width: 100px;">',
                    '<i class="img-arrows"><svg class ="svg-mirror"><use xlink:href="#no-arrow-5"></use></svg></i>',
                    '</div>'
                ].join('')),
                itemTemplate: _.template('<div id="<%= id %>" class="item-arrow img-arrows">' +
                    '<svg class ="svg-mirror"><use xlink:href="#<%= idsvg %>arrow-5"></use></svg></div>'),
                takeFocusOnClose: true,
                updateFormControl: this.updateFormControl
            });
            this.btnEndStyle.on('item:click', _.bind(this.onSelectEndStyle, this));
            this.mnuEndStylePicker = this.btnEndStyle.getPicker();
            this.btnEndStyle.updateFormControl();

            this.btnEndSize = new Common.UI.ComboBoxDataView({
                el: $('#shape-advanced-end-size'),
                additionalAlign: this.menuAddAlign,
                cls: 'combo-arrow-style move-focus',
                menuStyle: 'min-width: 105px;',
                dataViewStyle: 'width: 160px; margin: 0 5px;',
                store: new Common.UI.DataViewStore(_arrSize),
                formTemplate: _.template([
                    '<div class="form-control" style="width: 100px;">',
                    '<i class="img-arrows"><svg class ="svg-mirror"><use xlink:href=""></use></svg></i>',
                    '</div>'
                ].join('')),
                itemTemplate: _.template('<div id="<%= id %>" class="item-arrow img-arrows">' +
                    '<svg class ="svg-mirror"><use xlink:href="#<%= typearrow %>arrow-<%= (value + 1) %>"></use></svg></div>'),
                takeFocusOnClose: true,
                updateFormControl: this.updateFormControl
            });
            this.btnEndSize.on('item:click', _.bind(this.onSelectEndSize, this));
            this.mnuEndSizePicker = this.btnEndSize.getPicker();
            this.btnEndSize.updateFormControl();

            // Columns

            this.spnColumns = new Common.UI.MetricSpinner({
                el: $('#shape-columns-number'),
                step: 1,
                allowDecimal: false,
                width: 100,
                defaultUnit : "",
                value: '1',
                maxValue: 16,
                minValue: 1
            });
            this.spnColumns.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    if (this._changedProps.asc_getShapeProperties()===null || this._changedProps.asc_getShapeProperties()===undefined)
                        this._changedProps.asc_putShapeProperties(new Asc.asc_CShapeProperty());

                    this._changedProps.asc_getShapeProperties().asc_putColumnNumber(field.getNumberValue());
                }
            }, this));

            this.spnSpacing = new Common.UI.MetricSpinner({
                el: $('#shape-columns-spacing'),
                step: .1,
                width: 100,
                defaultUnit : "cm",
                value: '0 cm',
                maxValue: 40.64,
                minValue: 0
            });
            this.spnSpacing.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    if (this._changedProps.asc_getShapeProperties()===null || this._changedProps.asc_getShapeProperties()===undefined)
                        this._changedProps.asc_putShapeProperties(new Asc.asc_CShapeProperty());

                    this._changedProps.asc_getShapeProperties().asc_putColumnSpace(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                }
            }, this));
            this.spinners.push(this.spnSpacing);

            // Snapping
            this.radioTwoCell = new Common.UI.RadioBox({
                el: $('#shape-radio-twocell'),
                name: 'asc-radio-snap',
                labelText: this.textTwoCell,
                value: AscCommon.c_oAscCellAnchorType.cellanchorTwoCell
            });
            this.radioTwoCell.on('change', _.bind(this.onRadioSnapChange, this));

            this.radioOneCell = new Common.UI.RadioBox({
                el: $('#shape-radio-onecell'),
                name: 'asc-radio-snap',
                labelText: this.textOneCell,
                value: AscCommon.c_oAscCellAnchorType.cellanchorOneCell
            });
            this.radioOneCell.on('change', _.bind(this.onRadioSnapChange, this));

            this.radioAbsolute = new Common.UI.RadioBox({
                el: $('#shape-radio-absolute'),
                name: 'asc-radio-snap',
                labelText: this.textAbsolute,
                value: AscCommon.c_oAscCellAnchorType.cellanchorAbsolute
            });
            this.radioAbsolute.on('change', _.bind(this.onRadioSnapChange, this));

            // Alt Text

            this.inputAltTitle = new Common.UI.InputField({
                el          : $('#shape-advanced-alt-title'),
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
                this.spnWidth, this.btnRatio, this.spnHeight, // 0 tab
                this.spnAngle, this.chFlipHor, this.chFlipVert, // 1 tab
                this.cmbCapType, this.cmbJoinType, this.btnBeginStyle, this.btnEndStyle, this.btnBeginSize, this.btnEndSize, // 2 tab
                this.chAutofit, this.chOverflow, this.spnMarginTop, this.spnMarginLeft, this.spnMarginBottom, this.spnMarginRight, // 3 tab
                this.spnColumns, this.spnSpacing, // 4 tab
                this.radioTwoCell, this.radioOneCell, this.radioAbsolute, // 5 tab
                this.inputAltTitle, this.textareaAltDescription  // 6 tab
            ]).concat(this.getFooterButtons());
        },

        onCategoryClick: function(btn, index) {
            Common.Views.AdvancedSettingsWindow.prototype.onCategoryClick.call(this, btn, index);

            var me = this;
            setTimeout(function(){
                switch (index) {
                    case 0:
                        me.spnWidth.focus();
                        break;
                    case 1:
                        me.spnAngle.focus();
                        break;
                    case 2:
                        me.cmbCapType.focus();
                        break;
                    case 3:
                        me.spnMarginTop.focus();
                        break;
                    case 4:
                        me.spnColumns.focus();
                        break;
                    case 5:
                        me.radioTwoCell.focus();
                        break;
                    case 6:
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

        _setDefaults: function(props) {
            if (props && props.asc_getShapeProperties()){
                var shapeprops = props.asc_getShapeProperties();

                if (shapeprops.asc_getFromSmartArt()) {
                    this.btnsCategory[1].setDisabled(true);
                }
                if (shapeprops.asc_getFromSmartArtInternal()) {
                    this.chAutofit.setDisabled(true);
                    this.chOverflow.setDisabled(true);
                    this.chFlipHor.setDisabled(true);
                    this.chFlipVert.setDisabled(true);
                    this.btnsCategory[0].setDisabled(true);
                }

                this.spnWidth.setValue(Common.Utils.Metric.fnRecalcFromMM(props.asc_getWidth()).toFixed(2), true);
                this.spnHeight.setValue(Common.Utils.Metric.fnRecalcFromMM(props.asc_getHeight()).toFixed(2), true);

                if (props.asc_getHeight()>0)
                    this._nRatio = props.asc_getWidth()/props.asc_getHeight();

                var value = props.asc_getLockAspect();
                this.btnRatio.toggle(value || shapeprops.asc_getFromSmartArt());
                this.btnRatio.setDisabled(!!shapeprops.asc_getFromSmartArt()); // can resize smart art only proportionately

                this._setShapeDefaults(shapeprops);

                var margins = shapeprops.asc_getPaddings();
                if (margins) {
                    var val = margins.asc_getLeft();
                    this.spnMarginLeft.setValue((null !== val && undefined !== val) ? Common.Utils.Metric.fnRecalcFromMM(val) : '', true);
                    val = margins.asc_getTop();
                    this.spnMarginTop.setValue((null !== val && undefined !== val) ? Common.Utils.Metric.fnRecalcFromMM(val) : '', true);
                    val = margins.asc_getRight();
                    this.spnMarginRight.setValue((null !== val && undefined !== val) ? Common.Utils.Metric.fnRecalcFromMM(val) : '', true);
                    val = margins.asc_getBottom();
                    this.spnMarginBottom.setValue((null !== val && undefined !== val) ? Common.Utils.Metric.fnRecalcFromMM(val) : '', true);
                }
                this.btnsCategory[3].setDisabled(null === margins);   // Margins

                this.chAutofit.setValue(shapeprops.asc_getTextFitType()==AscFormat.text_fit_Auto);
                this.chOverflow.setValue(shapeprops.asc_getVertOverflowType()==AscFormat.nOTOwerflow);

                var shapetype = shapeprops.asc_getType();
                this.btnsCategory[4].setDisabled(shapeprops.asc_getFromSmartArtInternal()
                    || shapetype=='line' || shapetype=='bentConnector2' || shapetype=='bentConnector3'
                    || shapetype=='bentConnector4' || shapetype=='bentConnector5' || shapetype=='curvedConnector2'
                    || shapetype=='curvedConnector3' || shapetype=='curvedConnector4' || shapetype=='curvedConnector5'
                    || shapetype=='straightConnector1');

                value = shapeprops.asc_getColumnNumber();
                this.spnColumns.setValue((null !== value && undefined !== value) ? value : '', true);

                value = shapeprops.asc_getColumnSpace();
                this.spnSpacing.setValue((null !== value && undefined !== value) ? Common.Utils.Metric.fnRecalcFromMM(value) : '', true);

                value = props.asc_getTitle();
                this.inputAltTitle.setValue(value ? value : '');

                value = props.asc_getDescription();
                this.textareaAltDescription.val(value ? value : '');

                value = props.asc_getRot();
                this.spnAngle.setValue((value==undefined || value===null) ? '' : Math.floor(value*180/3.14159265358979+0.5), true);
                this.chFlipHor.setValue(props.asc_getFlipH());
                this.chFlipVert.setValue(props.asc_getFlipV());

                value = props.asc_getAnchor();
                switch (value) {
                    case AscCommon.c_oAscCellAnchorType.cellanchorTwoCell:
                        this.radioTwoCell.setValue(true, true);
                        break;
                    case AscCommon.c_oAscCellAnchorType.cellanchorOneCell:
                        this.radioOneCell.setValue(true, true);
                        break;
                    case AscCommon.c_oAscCellAnchorType.cellanchorAbsolute:
                        this.radioAbsolute.setValue(true, true);
                        break;
                }

                this._changedProps = new Asc.asc_CImgProperty();
            }
        },

        getSettings: function() {
            if (this.isAltTitleChanged)
                this._changedProps.asc_putTitle(this.inputAltTitle.getValue());

            if (this.isAltDescChanged)
                this._changedProps.asc_putDescription(this.textareaAltDescription.val());

            this._changedProps.asc_putRot(this.spnAngle.getNumberValue() * 3.14159265358979 / 180);
            this._changedProps.asc_putFlipH(this.chFlipHor.getValue()=='checked');
            this._changedProps.asc_putFlipV(this.chFlipVert.getValue()=='checked');

            return { shapeProps: this._changedProps} ;
        },

        _setShapeDefaults: function(props) {
            if (props ){
                var stroke = props.asc_getStroke();
                if (stroke) {
                    this.btnsCategory[2].setDisabled(stroke.asc_getType() == Asc.c_oAscStrokeType.STROKE_NONE);   // Weights & Arrows

                    var value = stroke.asc_getLinejoin();
                    for (var i=0; i<this._arrJoinType.length; i++) {
                        if (value == this._arrJoinType[i].value) {
                            this.cmbJoinType.setValue(value);
                            break;
                        }
                    }

                    value = stroke.asc_getLinecap();
                    for (i=0; i<this._arrCapType.length; i++) {
                        if (value == this._arrCapType[i].value) {
                            this.cmbCapType.setValue(value);
                            break;
                        }
                    }

                    var canchange = stroke.asc_getCanChangeArrows();
                    this.btnBeginStyle.setDisabled(!canchange);
                    this.btnEndStyle.setDisabled(!canchange);
                    this.btnBeginSize.setDisabled(!canchange);
                    this.btnEndSize.setDisabled(!canchange);

                    if (canchange) {
                        value = stroke.asc_getLinebeginsize();
                        var rec = this.mnuBeginSizePicker.store.findWhere({type: value});

                        if (rec) {
                            this._beginSizeIdx = rec.get('value');
                        } else {
                            this._beginSizeIdx = null;
                            this.btnBeginSize.updateFormControl();
                        }

                        value = stroke.asc_getLinebeginstyle();
                        rec = this.mnuBeginStylePicker.store.findWhere({type: value});
                        this.btnBeginStyle.selectRecord(rec);
                        rec && this._updateSizeArr(this.btnBeginSize, this.mnuBeginSizePicker, rec, this._beginSizeIdx);

                        value = stroke.asc_getLineendsize();
                        rec = this.mnuEndSizePicker.store.findWhere({type: value});
                        if (rec) {
                            this._endSizeIdx = rec.get('value');
                        } else {
                            this._endSizeIdx = null;
                            this.btnEndSize.updateFormControl();
                        }

                        value = stroke.asc_getLineendstyle();
                        rec = this.mnuEndStylePicker.store.findWhere({type: value});
                        this.btnEndStyle.selectRecord(rec);
                        rec && this._updateSizeArr(this.btnEndSize, this.mnuEndSizePicker, rec, this._endSizeIdx);
                    }
                }
            }
        },

        updateMetricUnit: function() {
            if (this.spinners) {
                for (var i=0; i<this.spinners.length; i++) {
                    var spinner = this.spinners[i];
                    spinner.setDefaultUnit(Common.Utils.Metric.getCurrentMetricName());
                    spinner.setStep(Common.Utils.Metric.getCurrentMetric()==Common.Utils.Metric.c_MetricUnits.pt ? 1 : 0.01);
                }
            }
            this.sizeMax = {
                width: Common.Utils.Metric.fnRecalcFromMM(this.options.sizeMax.width*10),
                height: Common.Utils.Metric.fnRecalcFromMM(this.options.sizeMax.height*10)
            };
            if (this.options.sizeOriginal)
                this.sizeOriginal = {
                    width: Common.Utils.Metric.fnRecalcFromMM(this.options.sizeOriginal.width),
                    height: Common.Utils.Metric.fnRecalcFromMM(this.options.sizeOriginal.height)
                };
        },

        _updateSizeArr: function(combo, picker, record, sizeidx) {
            if (record.get('value')>0) {
                picker.store.each( function(rec){
                    rec.set({typearrow: record.get('idsvg')});
                }, this);
                combo.setDisabled(false);
                combo.selectRecord(sizeidx !== null ? picker.store.at(sizeidx) : null);
            } else {
                combo.updateFormControl();
                combo.setDisabled(true);
            }
        },

        updateFormControl: function(record) {
            var formcontrol = $(this.el).find('.form-control > .img-arrows use');
            if(formcontrol.length) {
                var str = '';
                if(record){
                    var styleId  = record.get('idsvg');
                    str = (styleId !== undefined) ? styleId + 'arrow-5' : record.get('typearrow') + 'arrow-' + (record.get('value')+1);
                }
                formcontrol[0].setAttribute('xlink:href', '#' + str);
            }
        },

        onSelectBeginStyle: function(combo, picker, view, record){
            if (this._changedProps) {
                if (this._changedProps.asc_getShapeProperties()===null || this._changedProps.asc_getShapeProperties()===undefined)
                    this._changedProps.asc_putShapeProperties(new Asc.asc_CShapeProperty());

                if (this._changedProps.asc_getShapeProperties().asc_getStroke()===null)
                    this._changedProps.asc_getShapeProperties().asc_putStroke(new Asc.asc_CStroke());

                this._changedProps.asc_getShapeProperties().asc_getStroke().asc_putLinebeginstyle(record.get('type'));
            }
            if (this._beginSizeIdx===null || this._beginSizeIdx===undefined)
                this._beginSizeIdx = 4;
            this._updateSizeArr(this.btnBeginSize, this.mnuBeginSizePicker, record, this._beginSizeIdx);
        },

        onSelectBeginSize: function(combo, picker, view, record){
            if (this._changedProps) {
                if (this._changedProps.asc_getShapeProperties()===null || this._changedProps.asc_getShapeProperties()===undefined)
                    this._changedProps.asc_putShapeProperties(new Asc.asc_CShapeProperty());

                if (this._changedProps.asc_getShapeProperties().asc_getStroke()===null)
                    this._changedProps.asc_getShapeProperties().asc_putStroke(new Asc.asc_CStroke());

                this._changedProps.asc_getShapeProperties().asc_getStroke().asc_putLinebeginsize(record.get('type'));
            }
            this._beginSizeIdx = record.get('value');
        },

        onSelectEndStyle: function(combo, picker, view, record){
            if (this._changedProps) {
                if (this._changedProps.asc_getShapeProperties()===null || this._changedProps.asc_getShapeProperties()===undefined)
                    this._changedProps.asc_putShapeProperties(new Asc.asc_CShapeProperty());

                if (this._changedProps.asc_getShapeProperties().asc_getStroke()===null)
                    this._changedProps.asc_getShapeProperties().asc_putStroke(new Asc.asc_CStroke());

                this._changedProps.asc_getShapeProperties().asc_getStroke().asc_putLineendstyle(record.get('type'));
            }
            if (this._endSizeIdx===null || this._endSizeIdx===undefined)
                this._endSizeIdx = 4;
            this._updateSizeArr(this.btnEndSize, this.mnuEndSizePicker, record, this._endSizeIdx);
        },

        onSelectEndSize: function(combo, picker, view, record){
            if (this._changedProps) {
                if (this._changedProps.asc_getShapeProperties()===null || this._changedProps.asc_getShapeProperties()===undefined)
                    this._changedProps.asc_putShapeProperties(new Asc.asc_CShapeProperty());

                if (this._changedProps.asc_getShapeProperties().asc_getStroke()===null)
                    this._changedProps.asc_getShapeProperties().asc_putStroke(new Asc.asc_CStroke());

                this._changedProps.asc_getShapeProperties().asc_getStroke().asc_putLineendsize(record.get('type'));
            }
            this._endSizeIdx = record.get('value');
        },

        onRadioSnapChange: function(field, newValue, eOpts) {
            if (newValue && this._changedProps) {
                this._changedProps.asc_putAnchor(field.options.value);
            }
        },

        textTop:        'Top',
        textLeft:       'Left',
        textBottom:     'Bottom',
        textRight:      'Right',
        textSize:       'Size',
        textWidth:      'Width',
        textHeight:     'Height',
        textKeepRatio: 'Constant Proportions',
        textTitle:      'Shape - Advanced Settings',
        strMargins: 'Text Padding',
        textRound:      'Round',
        textMiter:      'Miter',
        textSquare:     'Square',
        textFlat:       'Flat',
        textBevel:      'Bevel',
        textArrows:     'Arrows',
        textLineStyle:  'Line Style',
        textCapType:    'Cap Type',
        textJoinType:   'Join Type',
        textBeginStyle: 'Begin Style',
        textBeginSize:  'Begin Size',
        textEndStyle:   'End Style',
        textEndSize:    'End Size',
        textWeightArrows: 'Weights & Arrows',
        textAlt: 'Alternative Text',
        textAltTitle: 'Title',
        textAltDescription: 'Description',
        textAltTip: 'The alternative text-based representation of the visual object information, which will be read to the people with vision or cognitive impairments to help them better understand what information there is in the image, autoshape, chart or table.',
        strColumns: 'Columns',
        textSpacing: 'Spacing between columns',
        textColNumber: 'Number of columns',
        textRotation: 'Rotation',
        textAngle: 'Angle',
        textFlipped: 'Flipped',
        textHorizontally: 'Horizontally',
        textVertically: 'Vertically',
        textSnap: 'Cell Snapping',
        textAbsolute: 'Don\'t move or size with cells',
        textOneCell: 'Move but don\'t size with cells',
        textTwoCell: 'Move and size with cells',
        textTextBox: 'Text Box',
        textAutofit: 'AutoFit',
        textResizeFit: 'Resize shape to fit text',
        textOverflow: 'Allow text to overflow shape'

    }, SSE.Views.ShapeSettingsAdvanced || {}));
});