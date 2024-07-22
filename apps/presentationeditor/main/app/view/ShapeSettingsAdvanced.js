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
 *  Created on 4/15/14
 *
 */

define([
    'text!presentationeditor/main/app/template/ShapeSettingsAdvanced.template',
    'common/main/lib/view/AdvancedSettingsWindow',
], function (contentTemplate) {
    'use strict';

    PE.Views.ShapeSettingsAdvanced = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 300,
            contentHeight: 257,
            toggleGroup: 'shape-adv-settings-group',
            sizeOriginal: {width: 0, height: 0},
            sizeMax: {width: 55.88, height: 55.88},
            properties: null,
            storageName: 'pe-shape-settings-adv-category'
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle,
                items: [
                    {panelId: 'id-adv-shape-general',    panelCaption: this.textGeneral},
                    {panelId: 'id-adv-shape-width',      panelCaption: this.textPlacement},
                    {panelId: 'id-adv-shape-rotate',     panelCaption: this.textRotation},
                    {panelId: 'id-adv-shape-shape',      panelCaption: this.textWeightArrows},
                    {panelId: 'id-adv-shape-margins',    panelCaption: this.textTextBox},
                    {panelId: 'id-adv-shape-columns',    panelCaption: this.strColumns},
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
            this.slideSize = this.options.slideSize;
            this._changedProps = null;
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);

            var me = this;

            // General
            this.inputShapeName = new Common.UI.InputField({
                el          : $('#shape-general-object-name'),
                allowBlank  : true,
                validateOnBlur: false,
                style       : 'width: 100%;'
            }).on('changed:after', function() {
                me.isShapeNameChanged = true;
            });

            // Placement
            this.spnWidth = new Common.UI.MetricSpinner({
                el: $('#shape-advanced-spin-width'),
                step: .1,
                width: 85,
                defaultUnit : "cm",
                value: '3 cm',
                maxValue: 55.88,
                minValue: 0
            });
            this.spnWidth.on('change', _.bind(function(field, newValue, oldValue, eOpts){
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
                if (this._changedProps) {
                    this._changedProps.put_Width(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                    this._changedProps.put_Height(Common.Utils.Metric.fnRecalcToMM(this.spnHeight.getNumberValue()));
                }
            }, this));
            this.spinners.push(this.spnWidth);

            this.spnHeight = new Common.UI.MetricSpinner({
                el: $('#shape-advanced-spin-height'),
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
                if (this._changedProps) {
                    this._changedProps.put_Height(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                    this._changedProps.put_Width(Common.Utils.Metric.fnRecalcToMM(this.spnWidth.getNumberValue()));
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

            this.spnX = new Common.UI.MetricSpinner({
                el: $('#shape-advanced-spin-x'),
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
                el: $('#shape-advanced-spin-y'),
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
                el: $('#shape-advanced-combo-from-x'),
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
                el: $('#shape-advanced-combo-from-y'),
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
                    if (this._changedProps.get_paddings()===null || this._changedProps.get_paddings()===undefined)
                        this._changedProps.put_paddings(new Asc.asc_CPaddings());
                    this._changedProps.get_paddings().put_Top(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
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
                    if (this._changedProps.get_paddings()===null || this._changedProps.get_paddings()===undefined)
                        this._changedProps.put_paddings(new Asc.asc_CPaddings());
                    this._changedProps.get_paddings().put_Bottom(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                }
            }, this));
            this.spinners.push(this.spnMarginBottom);

            this.spnMarginLeft = new Common.UI.MetricSpinner({
                el: $('#shape-margin-left'),
                step: .1,
                width: 100,
                defaultUnit : "cm",
                value: '0.19 cm',
                maxValue: 55.87,
                minValue: 0
            });
            this.spnMarginLeft.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    if (this._changedProps.get_paddings()===null || this._changedProps.get_paddings()===undefined)
                        this._changedProps.put_paddings(new Asc.asc_CPaddings());
                    this._changedProps.get_paddings().put_Left(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                }
            }, this));
            this.spinners.push(this.spnMarginLeft);

            this.spnMarginRight = new Common.UI.MetricSpinner({
                el: $('#shape-margin-right'),
                step: .1,
                width: 100,
                defaultUnit : "cm",
                value: '0.19 cm',
                maxValue: 55.87,
                minValue: 0
            });
            this.spnMarginRight.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    if (this._changedProps.get_paddings()===null || this._changedProps.get_paddings()===undefined)
                        this._changedProps.put_paddings(new Asc.asc_CPaddings());
                    this._changedProps.get_paddings().put_Right(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                }
            }, this));
            this.spinners.push(this.spnMarginRight);

            this.radioNofit = new Common.UI.RadioBox({
                el: $('#shape-radio-nofit'),
                name: 'asc-radio-fit',
                labelText: this.textNofit,
                value: AscFormat.text_fit_No
            });
            this.radioNofit.on('change', _.bind(this.onRadioFitChange, this));

            this.radioShrink = new Common.UI.RadioBox({
                el: $('#shape-radio-shrink'),
                name: 'asc-radio-fit',
                labelText: this.textShrink,
                value: AscFormat.text_fit_NormAuto
            });
            this.radioShrink.on('change', _.bind(this.onRadioFitChange, this));

            this.radioFit = new Common.UI.RadioBox({
                el: $('#shape-radio-fit'),
                name: 'asc-radio-fit',
                labelText: this.textResizeFit,
                value: AscFormat.text_fit_Auto
            });
            this.radioFit.on('change', _.bind(this.onRadioFitChange, this));

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
                    if (this._changedProps.get_stroke()===null)
                        this._changedProps.put_stroke(new Asc.asc_CStroke());

                    this._changedProps.get_stroke().put_linecap(record.value);
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
                    if (this._changedProps.get_stroke()===null)
                        this._changedProps.put_stroke(new Asc.asc_CStroke());

                    this._changedProps.get_stroke().put_linejoin(record.value);
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
                if (this._changedProps)
                    this._changedProps.asc_putColumnNumber(field.getNumberValue());
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
                if (this._changedProps)
                    this._changedProps.asc_putColumnSpace(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
            }, this));
            this.spinners.push(this.spnSpacing);

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
                this.inputShapeName,// 0 tab
                this.spnWidth, this.btnRatio, this.spnHeight, this.spnX, this.cmbFromX, this.spnY, this.cmbFromY, // 1 tab
                this.spnAngle, this.chFlipHor, this.chFlipVert, // 2 tab
                this.cmbCapType, this.cmbJoinType, this.btnBeginStyle, this.btnEndStyle, this.btnBeginSize, this.btnEndSize, // 3 tab
                this.radioNofit, this.radioShrink, this.radioFit, this.spnMarginTop, this.spnMarginLeft, this.spnMarginBottom, this.spnMarginRight, // 4 tab
                this.spnColumns, this.spnSpacing, // 5 tab
                this.inputAltTitle, this.textareaAltDescription  // 6 tab
            ]).concat(this.getFooterButtons());
        },

        onCategoryClick: function(btn, index) {
            Common.Views.AdvancedSettingsWindow.prototype.onCategoryClick.call(this, btn, index);

            var me = this;
            setTimeout(function(){
                switch (index) {
                    case 0:
                        me.inputShapeName.focus();
                        break;
                    case 1:
                        me.spnWidth.focus();
                        break;
                    case 2:
                        me.spnAngle.focus();
                        break;
                    case 3:
                        me.cmbCapType.focus();
                        break;
                    case 4:
                        me.spnMarginTop.focus();
                        break;
                    case 5:
                        me.spnColumns.focus();
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
            if (props ){
                if (props.get_FromSmartArt()) {
                    this.btnsCategory[2].setDisabled(true);
                }
                if (props.get_FromSmartArtInternal()) {
                    this.radioNofit.setDisabled(true);
                    this.radioShrink.setDisabled(true);
                    this.radioFit.setDisabled(true);
                    this.chFlipHor.setDisabled(true);
                    this.chFlipVert.setDisabled(true);
                    this.btnsCategory[1].setDisabled(true);
                }

                var value = props.asc_getName();
                this.inputShapeName.setValue(value ? value : '');

                this.spnWidth.setValue(Common.Utils.Metric.fnRecalcFromMM(props.asc_getWidth()).toFixed(2), true);
                this.spnHeight.setValue(Common.Utils.Metric.fnRecalcFromMM(props.asc_getHeight()).toFixed(2), true);

                if (props.asc_getHeight()>0)
                    this._nRatio = props.asc_getWidth()/props.asc_getHeight();

                value = props.asc_getLockAspect();
                this.btnRatio.toggle(value || props.get_FromSmartArt());
                this.btnRatio.setDisabled(!!props.get_FromSmartArt()); // can resize smart art only proportionately

                this.cmbFromX.setValue('left');
                this.cmbFromY.setValue('left');

                if (props.asc_getPosition()) {
                    var Position = {X: props.asc_getPosition().get_X(), Y: props.asc_getPosition().get_Y()};
                    this.spnX.setValue((Position.X !== null && Position.X !== undefined) ? Common.Utils.Metric.fnRecalcFromMM(Position.X) : '', true);
                    this.spnY.setValue((Position.Y !== null && Position.Y !== undefined) ? Common.Utils.Metric.fnRecalcFromMM(Position.Y) : '', true);
                } else {
                    this.spnX.setValue('', true);
                    this.spnY.setValue('', true);
                }

                this._setShapeDefaults(props);

                var margins = props.get_paddings();
                if (margins) {
                    var val = margins.get_Left();
                    this.spnMarginLeft.setValue((null !== val && undefined !== val) ? Common.Utils.Metric.fnRecalcFromMM(val) : '', true);
                    val = margins.get_Top();
                    this.spnMarginTop.setValue((null !== val && undefined !== val) ? Common.Utils.Metric.fnRecalcFromMM(val) : '', true);
                    val = margins.get_Right();
                    this.spnMarginRight.setValue((null !== val && undefined !== val) ? Common.Utils.Metric.fnRecalcFromMM(val) : '', true);
                    val = margins.get_Bottom();
                    this.spnMarginBottom.setValue((null !== val && undefined !== val) ? Common.Utils.Metric.fnRecalcFromMM(val) : '', true);
                }
                value = props.asc_getTextFitType();
                switch (value) {
                    case AscFormat.text_fit_No:
                        this.radioNofit.setValue(true, true);
                        break;
                    case AscFormat.text_fit_Auto:
                        this.radioFit.setValue(true, true);
                        break;
                    case AscFormat.text_fit_NormAuto:
                        this.radioShrink.setValue(true, true);
                        break;
                }
                this.btnsCategory[4].setDisabled(null === margins);   // Margins

                var shapetype = props.asc_getType();
                this.btnsCategory[5].setDisabled(props.get_FromSmartArtInternal()
                    || shapetype=='line' || shapetype=='bentConnector2' || shapetype=='bentConnector3'
                    || shapetype=='bentConnector4' || shapetype=='bentConnector5' || shapetype=='curvedConnector2'
                    || shapetype=='curvedConnector3' || shapetype=='curvedConnector4' || shapetype=='curvedConnector5'
                    || shapetype=='straightConnector1');

                value = props.asc_getColumnNumber();
                this.spnColumns.setValue((null !== value && undefined !== value) ? value : '', true);

                value = props.asc_getColumnSpace();
                this.spnSpacing.setValue((null !== value && undefined !== value) ? Common.Utils.Metric.fnRecalcFromMM(value) : '', true);

                value = props.asc_getTitle();
                this.inputAltTitle.setValue(value ? value : '');

                value = props.asc_getDescription();
                this.textareaAltDescription.val(value ? value : '');

                value = props.asc_getRot();
                this.spnAngle.setValue((value==undefined || value===null) ? '' : Math.floor(value*180/3.14159265358979+0.5), true);
                value = props.asc_getFlipH();
                this.chFlipHor.setValue((value==undefined || value===null) ? 'indeterminate' : value);
                value = props.asc_getFlipV();
                this.chFlipVert.setValue((value==undefined || value===null) ? 'indeterminate' : value);

                this._changedProps = new Asc.asc_CShapeProperty();
            }
        },

        getSettings: function() {
            if (this.isShapeNameChanged)
                this._changedProps.asc_putName(this.inputShapeName.getValue());

            var Position = new Asc.CPosition();
            if (this.spnX.getValue() !== '') {
                var x = Common.Utils.Metric.fnRecalcToMM(this.spnX.getNumberValue());
                if (this.cmbFromX.getValue() === 'center') {
                    x = (this.slideSize.width/36000)/2 + x;
                }
                Position.put_X(x);
            }
            if (this.spnY.getValue() !== '') {
                var y = Common.Utils.Metric.fnRecalcToMM(this.spnY.getNumberValue());
                if (this.cmbFromY.getValue() === 'center') {
                    y = (this.slideSize.height/36000)/2 + y;
                }
                Position.put_Y(y);
            }
            this._changedProps.asc_putPosition(Position);

            if (this.isAltTitleChanged)
                this._changedProps.asc_putTitle(this.inputAltTitle.getValue());

            if (this.isAltDescChanged)
                this._changedProps.asc_putDescription(this.textareaAltDescription.val());

            this._changedProps.asc_putRot(this.spnAngle.getNumberValue() * 3.14159265358979 / 180);
            if (this.chFlipHor.getValue()!=='indeterminate')
                this._changedProps.asc_putFlipH(this.chFlipHor.getValue()==='checked');
            if (this.chFlipVert.getValue()!=='indeterminate')
                this._changedProps.asc_putFlipV(this.chFlipVert.getValue()==='checked');

            Common.localStorage.setItem("pe-settings-shaperatio", (this.btnRatio.pressed) ? 1 : 0);
            return { shapeProps: this._changedProps} ;
        },

        _setShapeDefaults: function(props) {
            if (props ){
                var stroke = props.get_stroke();
                if (stroke) {
                    this.btnsCategory[3].setDisabled(stroke.get_type() == Asc.c_oAscStrokeType.STROKE_NONE);   // Weights & Arrows

                    var value = stroke.get_linejoin();
                    for (var i=0; i<this._arrJoinType.length; i++) {
                        if (value == this._arrJoinType[i].value) {
                            this.cmbJoinType.setValue(value);
                            break;
                        }
                    }

                    value = stroke.get_linecap();
                    for (i=0; i<this._arrCapType.length; i++) {
                        if (value == this._arrCapType[i].value) {
                            this.cmbCapType.setValue(value);
                            break;
                        }
                    }

                    var canchange = stroke.get_canChangeArrows();
                    this.btnBeginStyle.setDisabled(!canchange);
                    this.btnEndStyle.setDisabled(!canchange);
                    this.btnBeginSize.setDisabled(!canchange);
                    this.btnEndSize.setDisabled(!canchange);

                    if (canchange) {
                        value = stroke.get_linebeginsize();
                        var rec = this.mnuBeginSizePicker.store.findWhere({type: value});

                        if (rec) {
                            this._beginSizeIdx = rec.get('value');
                        } else {
                            this._beginSizeIdx = null;
                            this.btnBeginSize.updateFormControl();
                        }

                        value = stroke.get_linebeginstyle();
                        rec = this.mnuBeginStylePicker.store.findWhere({type: value});
                        this.btnBeginStyle.selectRecord(rec);
                        rec && this._updateSizeArr(this.btnBeginSize, this.mnuBeginSizePicker, rec, this._beginSizeIdx);

                        value = stroke.get_lineendsize();
                        rec = this.mnuEndSizePicker.store.findWhere({type: value});
                        if (rec) {
                            this._endSizeIdx = rec.get('value');
                        } else {
                            this._endSizeIdx = null;
                            this.btnEndSize.updateFormControl();
                        }

                        value = stroke.get_lineendstyle();
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
                if (this._changedProps.get_stroke()===null)
                    this._changedProps.put_stroke(new Asc.asc_CStroke());

                this._changedProps.get_stroke().put_linebeginstyle(record.get('type'));
            }
            if (this._beginSizeIdx===null || this._beginSizeIdx===undefined)
                this._beginSizeIdx = 4;
            this._updateSizeArr(this.btnBeginSize, this.mnuBeginSizePicker, record, this._beginSizeIdx);
        },

        onSelectBeginSize: function(combo, picker, view, record){
            if (this._changedProps) {
                if (this._changedProps.get_stroke()===null)
                    this._changedProps.put_stroke(new Asc.asc_CStroke());

                this._changedProps.get_stroke().put_linebeginsize(record.get('type'));
            }
            this._beginSizeIdx = record.get('value');
        },

        onSelectEndStyle: function(combo, picker, view, record){
            if (this._changedProps) {
                if (this._changedProps.get_stroke()===null)
                    this._changedProps.put_stroke(new Asc.asc_CStroke());

                this._changedProps.get_stroke().put_lineendstyle(record.get('type'));
            }
            if (this._endSizeIdx===null || this._endSizeIdx===undefined)
                this._endSizeIdx = 4;
            this._updateSizeArr(this.btnEndSize, this.mnuEndSizePicker, record, this._endSizeIdx);
        },

        onSelectEndSize: function(combo, picker, view, record){
            if (this._changedProps) {
                if (this._changedProps.get_stroke()===null)
                    this._changedProps.put_stroke(new Asc.asc_CStroke());

                this._changedProps.get_stroke().put_lineendsize(record.get('type'));
            }
            this._endSizeIdx = record.get('value');
        },

        onRadioFitChange: function(field, newValue, eOpts) {
            if (newValue && this._changedProps) {
                this._changedProps.asc_putTextFitType(field.options.value);
            }
        },

        textRound:      'Round',
        textMiter:      'Miter',
        textSquare:     'Square',
        textFlat:       'Flat',
        textBevel:      'Bevel',
        textTitle:      'Shape - Advanced Settings',
        txtNone:        'None',
        textWeightArrows: 'Weights & Arrows',
        textArrows:     'Arrows',
        textLineStyle:  'Line Style',
        textCapType:    'Cap Type',
        textJoinType:   'Join Type',
        textBeginStyle: 'Begin Style',
        textBeginSize:  'Begin Size',
        textEndStyle:   'End Style',
        textEndSize:    'End Size',
        textSize:       'Size',
        textWidth:      'Width',
        textHeight:     'Height',
        textKeepRatio: 'Constant Proportions',
        textTop:            'Top',
        textLeft:           'Left',
        textBottom:         'Bottom',
        textRight:          'Right',
        strMargins: 'Text Padding',
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
        textTextBox: 'Text Box',
        textAutofit: 'AutoFit',
        textNofit: 'Do not Autofit',
        textShrink: 'Shrink text on overflow',
        textResizeFit: 'Resize shape to fit text',
        textPlacement: 'Placement',
        textPosition: 'Position',
        textHorizontal: 'Horizontal',
        textFrom: 'From',
        textVertical: 'Vertical',
        textTopLeftCorner: 'Top Left Corner',
        textCenter: 'Center',
        textGeneral: 'General',
        textShapeName: 'Shape name'

    }, PE.Views.ShapeSettingsAdvanced || {}));
});