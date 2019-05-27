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
 *  ImageSettingsAdvanced.js
 *
 *  Created by Julia Radzhabova on 3/03/14
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([    'text!documenteditor/main/app/template/ImageSettingsAdvanced.template',
    'common/main/lib/view/AdvancedSettingsWindow',
    'common/main/lib/component/ComboBox',
    'common/main/lib/component/MetricSpinner',
    'common/main/lib/component/CheckBox',
    'common/main/lib/component/RadioBox'
], function (contentTemplate) {
    'use strict';

    DE.Views.ImageSettingsAdvanced = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 340,
            height: 485,
            toggleGroup: 'image-adv-settings-group',
            sizeOriginal: {width: 0, height: 0},
            sizeMax: {width: 55.88, height: 55.88},
            properties: null,
            storageName: 'de-img-settings-adv-category'
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle,
                items: [
                    {panelId: 'id-adv-image-width',      panelCaption: this.textSize},
                    {panelId: 'id-adv-shape-size',       panelCaption: this.textSize},
                    {panelId: 'id-adv-image-rotate',     panelCaption: this.textRotation},
                    {panelId: 'id-adv-image-wrap',       panelCaption: this.textBtnWrap},
                    {panelId: 'id-adv-image-position',   panelCaption: this.textPosition},
                    {panelId: 'id-adv-image-shape',      panelCaption: this.textWeightArrows},
                    {panelId: 'id-adv-image-margins',    panelCaption: this.strMargins},
                    {panelId: 'id-adv-image-alttext',    panelCaption: this.textAlt}
                ],
                contentTemplate: _.template(contentTemplate)({
                    scope: this
                })
            }, options);
            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);

            this.spinners = [];

            this._state = {
                HAlignType: Asc.c_oAscAlignH.Left,
                HAlignFrom: Asc.c_oAscRelativeFromH.Character,
                HPositionFrom: Asc.c_oAscRelativeFromH.Character,
                HPositionPcFrom: Asc.c_oAscRelativeFromH.Page,
                ShapeWidthPcFrom: Asc.c_oAscRelativeFromH.Margin,
                VAlignType: Asc.c_oAscAlignV.Top,
                VAlignFrom: Asc.c_oAscRelativeFromV.Paragraph,
                VPositionFrom: Asc.c_oAscRelativeFromV.Paragraph,
                VPositionPcFrom: Asc.c_oAscRelativeFromV.Page,
                ShapeHeightPcFrom: Asc.c_oAscRelativeFromV.Margin,
                spnXChanged: false,
                spnYChanged: false,
                spnXPcChanged: false,
                spnYPcChanged: false
            };
            this._objectType = Asc.c_oAscTypeSelectElement.Image;
            this.Margins = undefined;
            this._nRatio = 1;

            this._originalProps = this.options.imageProps;
            this.sectionProps = this.options.sectionProps;
            this.pageWidth = this.options.sectionProps ? this.options.sectionProps.get_W() : 210;
            this.pageHeight = this.options.sectionProps ? this.options.sectionProps.get_H() : 297;
            this._changedProps = null;
            this._changedShapeProps = null;
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);

            var me = this;

            // Image & Chart Size
            this.spnWidth = new Common.UI.MetricSpinner({
                el: $('#image-advanced-spin-width'),
                step: .1,
                width: 80,
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
                    this._changedProps.put_ResetCrop(false);
                }
            }, this));
            this.spinners.push(this.spnWidth);

            this.spnHeight = new Common.UI.MetricSpinner({
                el: $('#image-advanced-spin-height'),
                step: .1,
                width: 80,
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
                    this._changedProps.put_ResetCrop(false);
                }
            }, this));
            this.spinners.push(this.spnHeight);

            this.btnOriginalSize = new Common.UI.Button({
                el: $('#image-advanced-button-original-size')
            });
            this.btnOriginalSize.on('click', _.bind(function(btn, e) {
                this.spnWidth.setValue(this.sizeOriginal.width, true);
                this.spnHeight.setValue(this.sizeOriginal.height, true);
                this._nRatio = this.sizeOriginal.width/this.sizeOriginal.height;
                if (this._changedProps) {
                    this._changedProps.put_Height(Common.Utils.Metric.fnRecalcToMM(this.spnHeight.getNumberValue()));
                    this._changedProps.put_Width(Common.Utils.Metric.fnRecalcToMM(this.spnWidth.getNumberValue()));
                    this._changedProps.put_ResetCrop(true);
                }
            }, this));

            this.btnRatio = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'advanced-btn-ratio',
                style: 'margin-bottom: 1px;',
                enableToggle: true,
                hint: this.textKeepRatio
            });
            this.btnRatio.render($('#image-advanced-button-ratio')) ;
            this.btnRatio.on('click', _.bind(function(btn, e) {
                if (btn.pressed && this.spnHeight.getNumberValue()>0) {
                    this._nRatio = this.spnWidth.getNumberValue()/this.spnHeight.getNumberValue();
                }
                if (this._changedProps) {
                    this._changedProps.asc_putLockAspect(btn.pressed);
                }
            }, this));

            // Shape Size
            this.radioHSize = new Common.UI.RadioBox({
                el: $('#shape-radio-hsize'),
                name: 'asc-radio-width',
                checked: true
            });
            this.radioHSize.on('change', _.bind(this.onRadioHSizeChange, this));

            this.radioHSizePc = new Common.UI.RadioBox({
                el: $('#shape-radio-hsizepc'),
                name: 'asc-radio-width'
            });
            this.radioHSizePc.on('change', _.bind(this.onRadioHSizePcChange, this));

            this.radioVSize = new Common.UI.RadioBox({
                el: $('#shape-radio-vsize'),
                name: 'asc-radio-height',
                checked: true
            });
            this.radioVSize.on('change', _.bind(this.onRadioVSizeChange, this));

            this.radioVSizePc = new Common.UI.RadioBox({
                el: $('#shape-radio-vsizepc'),
                name: 'asc-radio-height'
            });
            this.radioVSizePc.on('change', _.bind(this.onRadioVSizePcChange, this));

            this.chRatio = new Common.UI.CheckBox({
                el: $('#shape-checkbox-ratio'),
                labelText: this.textAspectRatio
            });
            this.chRatio.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if ((field.getValue()=='checked') && this.spnShapeHeight.getNumberValue()>0) {
                    this._nRatio = this.spnShapeWidth.getNumberValue()/this.spnShapeHeight.getNumberValue();
                }
                if (this._changedProps) {
                    this._changedProps.asc_putLockAspect(field.getValue()=='checked');
                }
            }, this));

            this.spnShapeWidth = new Common.UI.MetricSpinner({
                el: $('#shape-advanced-spin-width'),
                step: .1,
                width: 80,
                defaultUnit : "cm",
                value: '3 cm',
                maxValue: 55.88,
                minValue: 0
            });
            this.spnShapeWidth.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this.chRatio.getValue()=='checked' && !this.chRatio.isDisabled()) {
                    var w = field.getNumberValue();
                    var h = w/this._nRatio;
                    if (h>this.sizeMax.height) {
                        h = this.sizeMax.height;
                        w = h * this._nRatio;
                        this.spnShapeWidth.setValue(w, true);
                    }
                    this.spnShapeHeight.setValue(h, true);
                }
                if (this._changedProps) {
                    this._changedProps.put_Width(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                    this.fillShapeHeight();
                }
            }, this));
            this.spinners.push(this.spnShapeWidth);

            this.spnShapeHeight = new Common.UI.MetricSpinner({
                el: $('#shape-advanced-spin-height'),
                step: .1,
                width: 80,
                defaultUnit : "cm",
                value: '3 cm',
                maxValue: 55.88,
                minValue: 0
            });
            this.spnShapeHeight.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                var h = field.getNumberValue(), w = null;
                if (this.chRatio.getValue()=='checked' && !this.chRatio.isDisabled()) {
                    w = h * this._nRatio;
                    if (w>this.sizeMax.width) {
                        w = this.sizeMax.width;
                        h = w/this._nRatio;
                        this.spnShapeHeight.setValue(h, true);
                    }
                    this.spnShapeWidth.setValue(w, true);
                }
                if (this._changedProps) {
                    this._changedProps.put_Height(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                    this.fillShapeWidth();
                }
            }, this));
            this.spinners.push(this.spnShapeHeight);

            this.spnShapeWidthPc = new Common.UI.MetricSpinner({
                el: $('#shape-advanced-spin-width-rel'),
                disabled: true,
                step: 1,
                width: 80,
                defaultUnit : "%",
                value: '1 %',
                maxValue: 1000,
                minValue: 1
            });
            this.spnShapeWidthPc.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    if (this._changedProps.get_SizeRelH()===null || this._changedProps.get_SizeRelH()===undefined)
                        this._changedProps.put_SizeRelH(new Asc.CImagePositionH());

                    this._changedProps.get_SizeRelH().put_Value(field.getNumberValue());
                    this._changedProps.get_SizeRelH().put_RelativeFrom(this._state.ShapeWidthPcFrom);

                    this.fillShapeHeight();
                }
            }, this));

            this.spnShapeHeightPc = new Common.UI.MetricSpinner({
                el: $('#shape-advanced-spin-height-rel'),
                disabled: true,
                step: 1,
                width: 80,
                defaultUnit : "%",
                value: '1 %',
                maxValue: 1000,
                minValue: 1
            });
            this.spnShapeHeightPc.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    if (this._changedProps.get_SizeRelV()===null || this._changedProps.get_SizeRelV()===undefined)
                        this._changedProps.put_SizeRelV(new Asc.CImagePositionV());

                    this._changedProps.get_SizeRelV().put_Value(field.getNumberValue());
                    this._changedProps.get_SizeRelV().put_RelativeFrom(this._state.ShapeHeightPcFrom);

                    this.fillShapeWidth();
                }
            }, this));

            this._arrHRelativePc = [
                {displayValue: this.textLeftMargin,   value: Asc.c_oAscRelativeFromH.LeftMargin, size: this.sectionProps.get_LeftMargin()},
                {displayValue: this.textMargin,       value: Asc.c_oAscRelativeFromH.Margin, size: this.sectionProps.get_W() - this.sectionProps.get_LeftMargin() - this.sectionProps.get_RightMargin()},
                {displayValue: this.textPage,         value: Asc.c_oAscRelativeFromH.Page, size: this.sectionProps.get_W()},
                {displayValue: this.textRightMargin,  value: Asc.c_oAscRelativeFromH.RightMargin, size: this.sectionProps.get_RightMargin()}
            ];

            this.cmbWidthPc = new Common.UI.ComboBox({
                el: $('#shape-combo-width-rel'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 115px;',
                editable: false,
                data: this._arrHRelativePc
            });
            this.cmbWidthPc.setDisabled(true);
            this.cmbWidthPc.setValue(this._state.ShapeWidthPcFrom);
            this.cmbWidthPc.on('selected', _.bind(this.onCmbWidthPcSelect, this));

            this._arrVRelativePc = [
                {displayValue: this.textMargin,       value: Asc.c_oAscRelativeFromV.Margin, size: this.sectionProps.get_H() - this.sectionProps.get_TopMargin() - this.sectionProps.get_BottomMargin()},
                {displayValue: this.textBottomMargin,       value: Asc.c_oAscRelativeFromV.BottomMargin, size: this.sectionProps.get_BottomMargin()},
                {displayValue: this.textPage,       value: Asc.c_oAscRelativeFromV.Page, size: this.sectionProps.get_H()},
                {displayValue: this.textTopMargin, value: Asc.c_oAscRelativeFromV.TopMargin, size: this.sectionProps.get_TopMargin()}
            ];

            this.cmbHeightPc = new Common.UI.ComboBox({
                el: $('#shape-combo-height-rel'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 115px;',
                editable: false,
                data: this._arrVRelativePc
            });
            this.cmbHeightPc.setDisabled(true);
            this.cmbHeightPc.setValue(this._state.ShapeHeightPcFrom);
            this.cmbHeightPc.on('selected', _.bind(this.onCmbHeightPcSelect, this));

            // Rotation
            this.spnAngle = new Common.UI.MetricSpinner({
                el: $('#image-advanced-spin-angle'),
                step: 1,
                width: 80,
                defaultUnit : "°",
                value: '0 °',
                maxValue: 3600,
                minValue: -3600
            });

            this.chFlipHor = new Common.UI.CheckBox({
                el: $('#image-advanced-checkbox-hor'),
                labelText: this.textHorizontally
            });

            this.chFlipVert = new Common.UI.CheckBox({
                el: $('#image-advanced-checkbox-vert'),
                labelText: this.textVertically
            });

            // Wrapping

            this.btnWrapInline = new Common.UI.Button({
                cls: 'btn-options x-huge',
                iconCls: 'icon-advanced-wrap btn-wrap-inline',
                posId: Asc.c_oAscWrapStyle2.Inline,
                hint: this.textWrapInlineTooltip,
                enableToggle: true,
                allowDepress: false,
                toggleGroup : 'imgAdvWrapGroup'
            });
            this.btnWrapInline.render( $('#image-advanced-button-wrap-inline')) ;
            this.btnWrapInline.on('click', _.bind(this.onBtnWrapClick, this));

            this.btnWrapSquare = new Common.UI.Button({
                cls: 'btn-options x-huge',
                iconCls: 'icon-advanced-wrap btn-wrap-square',
                posId: Asc.c_oAscWrapStyle2.Square,
                hint: this.textWrapSquareTooltip,
                enableToggle: true,
                allowDepress: false,
                toggleGroup : 'imgAdvWrapGroup'
            });
            this.btnWrapSquare.render( $('#image-advanced-button-wrap-square')) ;
            this.btnWrapSquare.on('click', _.bind(this.onBtnWrapClick, this));

            this.btnWrapTight = new Common.UI.Button({
                cls: 'btn-options x-huge',
                iconCls: 'icon-advanced-wrap btn-wrap-tight',
                posId: Asc.c_oAscWrapStyle2.Tight,
                hint: this.textWrapTightTooltip,
                enableToggle: true,
                allowDepress: false,
                toggleGroup : 'imgAdvWrapGroup'
            });
            this.btnWrapTight.render( $('#image-advanced-button-wrap-tight')) ;
            this.btnWrapTight.on('click', _.bind(this.onBtnWrapClick, this));

            this.btnWrapThrough = new Common.UI.Button({
                cls: 'btn-options x-huge',
                iconCls: 'icon-advanced-wrap btn-wrap-through',
                posId: Asc.c_oAscWrapStyle2.Through,
                hint: this.textWrapThroughTooltip,
                enableToggle: true,
                allowDepress: false,
                toggleGroup : 'imgAdvWrapGroup'
            });
            this.btnWrapThrough.render( $('#image-advanced-button-wrap-through')) ;
            this.btnWrapThrough.on('click', _.bind(this.onBtnWrapClick, this));

            this.btnWrapTopBottom = new Common.UI.Button({
                cls: 'btn-options x-huge',
                iconCls: 'icon-advanced-wrap btn-wrap-topbottom',
                posId: Asc.c_oAscWrapStyle2.TopAndBottom,
                hint: this.textWrapTopbottomTooltip,
                enableToggle: true,
                allowDepress: false,
                toggleGroup : 'imgAdvWrapGroup'
            });
            this.btnWrapTopBottom.render( $('#image-advanced-button-wrap-topbottom')) ;
            this.btnWrapTopBottom.on('click', _.bind(this.onBtnWrapClick, this));

            this.btnWrapBehind = new Common.UI.Button({
                cls: 'btn-options x-huge',
                iconCls: 'icon-advanced-wrap btn-wrap-behind',
                posId: Asc.c_oAscWrapStyle2.Behind,
                hint: this.textWrapBehindTooltip,
                enableToggle: true,
                allowDepress: false,
                toggleGroup : 'imgAdvWrapGroup'
            });
            this.btnWrapBehind.render( $('#image-advanced-button-wrap-behind')) ;
            this.btnWrapBehind.on('click', _.bind(this.onBtnWrapClick, this));

            this.btnWrapInFront = new Common.UI.Button({
                cls: 'btn-options x-huge',
                iconCls: 'icon-advanced-wrap btn-wrap-infront',
                posId: Asc.c_oAscWrapStyle2.InFront,
                hint: this.textWrapInFrontTooltip,
                enableToggle: true,
                allowDepress: false,
                toggleGroup : 'imgAdvWrapGroup'
            });
            this.btnWrapInFront.render( $('#image-advanced-button-wrap-infront')) ;
            this.btnWrapInFront.on('click', _.bind(this.onBtnWrapClick, this));

            this.spnTop = new Common.UI.MetricSpinner({
                el: $('#image-advanced-distance-top'),
                step: .1,
                width: 85,
                defaultUnit : "cm",
                value: '0 cm',
                maxValue: 55.87,
                minValue: 0
            });
            this.spnTop.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    if (this._changedProps.get_Paddings()===null || this._changedProps.get_Paddings()===undefined)
                        this._changedProps.put_Paddings(new Asc.asc_CPaddings());

                    this._changedProps.get_Paddings().put_Top(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                }
            }, this));
            this.spinners.push(this.spnTop);

            this.spnBottom = new Common.UI.MetricSpinner({
                el: $('#image-advanced-distance-bottom'),
                step: .1,
                width: 85,
                defaultUnit : "cm",
                value: '0 cm',
                maxValue: 55.87,
                minValue: 0
            });
            this.spnBottom.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    if (this._changedProps.get_Paddings()===null || this._changedProps.get_Paddings()===undefined)
                        this._changedProps.put_Paddings(new Asc.asc_CPaddings());

                    this._changedProps.get_Paddings().put_Bottom(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                }
            }, this));
            this.spinners.push(this.spnBottom);

            this.spnLeft = new Common.UI.MetricSpinner({
                el: $('#image-advanced-distance-left'),
                step: .1,
                width: 85,
                defaultUnit : "cm",
                value: '0.32 cm',
                maxValue: 55.87,
                minValue: 0
            });
            this.spnLeft.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    if (this._changedProps.get_Paddings()===null || this._changedProps.get_Paddings()===undefined)
                        this._changedProps.put_Paddings(new Asc.asc_CPaddings());

                    this._changedProps.get_Paddings().put_Left(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                }
            }, this));
            this.spinners.push(this.spnLeft);

            this.spnRight = new Common.UI.MetricSpinner({
                el: $('#image-advanced-distance-right'),
                step: .1,
                width: 85,
                defaultUnit : "cm",
                value: '0.32 cm',
                maxValue: 55.87,
                minValue: 0
            });
            this.spnRight.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    if (this._changedProps.get_Paddings()===null || this._changedProps.get_Paddings()===undefined)
                        this._changedProps.put_Paddings(new Asc.asc_CPaddings());

                    this._changedProps.get_Paddings().put_Right(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                }
            }, this));
            this.spinners.push(this.spnRight);

            // Position

            this.spnX = new Common.UI.MetricSpinner({
                el: $('#image-spin-x'),
                step: .1,
                width: 115,
                disabled: true,
                defaultUnit : "cm",
                defaultValue : 0,
                value: '0 cm',
                maxValue: 55.87,
                minValue: -55.87
            });
            this.spnX.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    if (this._changedProps.get_PositionH()===null || this._changedProps.get_PositionH()===undefined)
                        this._changedProps.put_PositionH(new Asc.CImagePositionH());

                    this._changedProps.get_PositionH().put_UseAlign(false);
                    this._changedProps.get_PositionH().put_Percent(false);
                    this._changedProps.get_PositionH().put_RelativeFrom(this._state.HPositionFrom);
                    this._changedProps.get_PositionH().put_Value(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                    this._state.spnXChanged = true;
                }
            }, this));
            this.spinners.push(this.spnX);

            this.spnY = new Common.UI.MetricSpinner({
                el: $('#image-spin-y'),
                step: .1,
                width: 115,
                disabled: true,
                defaultUnit : "cm",
                defaultValue : 0,
                value: '0 cm',
                maxValue: 55.87,
                minValue: -55.87
            });
            this.spnY.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    if (this._changedProps.get_PositionV()===null || this._changedProps.get_PositionV()===undefined)
                        this._changedProps.put_PositionV(new Asc.CImagePositionV());

                    this._changedProps.get_PositionV().put_UseAlign(false);
                    this._changedProps.get_PositionV().put_Percent(false);
                    this._changedProps.get_PositionV().put_RelativeFrom(this._state.VPositionFrom);
                    this._changedProps.get_PositionV().put_Value(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                    this._state.spnYChanged = true;
                }
            }, this));
            this.spinners.push(this.spnY);

            // Horizontal
            this._arrHAlign = [
                {displayValue: this.textLeft,   value: Asc.c_oAscAlignH.Left},
                {displayValue: this.textCenter, value: Asc.c_oAscAlignH.Center},
                {displayValue: this.textRight,  value: Asc.c_oAscAlignH.Right}
            ];

            this.cmbHAlign = new Common.UI.ComboBox({
                el: $('#image-combo-halign'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 115px;',
                editable: false,
                data: this._arrHAlign
            });
            this.cmbHAlign.setValue(this._state.HAlignType);
            this.cmbHAlign.on('selected', _.bind(this.onHAlignSelect, this));

            this._arrHRelative = [
                {displayValue: this.textCharacter,     value: Asc.c_oAscRelativeFromH.Character},
                {displayValue: this.textColumn,       value: Asc.c_oAscRelativeFromH.Column},
                {displayValue: this.textLeftMargin,       value: Asc.c_oAscRelativeFromH.LeftMargin},
                {displayValue: this.textMargin,       value: Asc.c_oAscRelativeFromH.Margin},
                {displayValue: this.textPage,       value: Asc.c_oAscRelativeFromH.Page},
                {displayValue: this.textRightMargin, value: Asc.c_oAscRelativeFromH.RightMargin}
            ];

            this.cmbHRelative = new Common.UI.ComboBox({
                el: $('#image-combo-hrelative'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 115px;',
                editable: false,
                data: this._arrHRelative
            });
            this.cmbHRelative.setValue(this._state.HAlignFrom);
            this.cmbHRelative.on('selected', _.bind(this.onHRelativeSelect, this));

            this.cmbHPosition = new Common.UI.ComboBox({
                el: $('#image-combo-hposition'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 115px;',
                editable: false,
                data: this._arrHRelative
            });
            this.cmbHPosition.setDisabled(true);
            this.cmbHPosition.setValue(this._state.HPositionFrom);
            this.cmbHPosition.on('selected', _.bind(this.onHPositionSelect, this));

            this.spnXPc = new Common.UI.MetricSpinner({
                el: $('#image-spin-xpc'),
                step: 1,
                width: 115,
                disabled: true,
                defaultUnit : "%",
                defaultValue : 0,
                value: '0 %',
                maxValue: 1000,
                minValue: -1000
            });
            this.spnXPc.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    if (this._changedProps.get_PositionH()===null || this._changedProps.get_PositionH()===undefined)
                        this._changedProps.put_PositionH(new Asc.CImagePositionH());

                    this._changedProps.get_PositionH().put_UseAlign(false);
                    this._changedProps.get_PositionH().put_Percent(true);
                    this._changedProps.get_PositionH().put_RelativeFrom(this._state.HPositionPcFrom);
                    this._changedProps.get_PositionH().put_Value(field.getNumberValue());
                    this._state.spnXPcChanged = true;
                }
            }, this));

            this.cmbHPositionPc = new Common.UI.ComboBox({
                el: $('#image-combo-hpositionpc'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 115px;',
                editable: false,
                data: this._arrHRelativePc
            });
            this.cmbHPositionPc.setDisabled(true);
            this.cmbHPositionPc.setValue(this._state.HPositionPcFrom);
            this.cmbHPositionPc.on('selected', _.bind(this.onHPositionPcSelect, this));

            // Vertical
            this._arrVAlign = [
                {displayValue: this.textTop,   value: Asc.c_oAscAlignV.Top},
                {displayValue: this.textCenter, value: Asc.c_oAscAlignV.Center},
                {displayValue: this.textBottom,  value: Asc.c_oAscAlignV.Bottom}
            ];

            this.cmbVAlign = new Common.UI.ComboBox({
                el: $('#image-combo-valign'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 115px;',
                editable: false,
                data: this._arrVAlign
            });
            this.cmbVAlign.setValue(this._state.VAlignType);
            this.cmbVAlign.on('selected', _.bind(this.onVAlignSelect, this));

            this._arrVRelative = [
                {displayValue: this.textLine,     value: Asc.c_oAscRelativeFromV.Line},
                {displayValue: this.textMargin,       value: Asc.c_oAscRelativeFromV.Margin},
                {displayValue: this.textBottomMargin,       value: Asc.c_oAscRelativeFromV.BottomMargin},
                {displayValue: this.textParagraph,       value: Asc.c_oAscRelativeFromV.Paragraph},
                {displayValue: this.textPage,       value: Asc.c_oAscRelativeFromV.Page},
                {displayValue: this.textTopMargin, value: Asc.c_oAscRelativeFromV.TopMargin}
            ];

            this.cmbVRelative = new Common.UI.ComboBox({
                el: $('#image-combo-vrelative'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 115px;',
                editable: false,
                data: this._arrVRelative
            });
            this.cmbVRelative.setValue(this._state.VAlignFrom);
            this.cmbVRelative.on('selected', _.bind(this.onVRelativeSelect, this));

            this.cmbVPosition = new Common.UI.ComboBox({
                el: $('#image-combo-vposition'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 115px;',
                editable: false,
                data: this._arrVRelative
            });
            this.cmbVPosition.setDisabled(true);
            this.cmbVPosition.setValue(this._state.VPositionFrom);
            this.cmbVPosition.on('selected', _.bind(this.onVPositionSelect, this));

            this.spnYPc = new Common.UI.MetricSpinner({
                el: $('#image-spin-ypc'),
                step: 1,
                width: 115,
                disabled: true,
                defaultUnit : "%",
                defaultValue : 0,
                value: '0 %',
                maxValue: 1000,
                minValue: -1000
            });
            this.spnYPc.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    if (this._changedProps.get_PositionV()===null || this._changedProps.get_PositionV()===undefined)
                        this._changedProps.put_PositionV(new Asc.CImagePositionV());

                    this._changedProps.get_PositionV().put_UseAlign(false);
                    this._changedProps.get_PositionV().put_Percent(true);
                    this._changedProps.get_PositionV().put_RelativeFrom(this._state.VPositionPcFrom);
                    this._changedProps.get_PositionV().put_Value(field.getNumberValue());
                    this._state.spnYPcChanged = true;
                }
            }, this));

            this.cmbVPositionPc = new Common.UI.ComboBox({
                el: $('#image-combo-vpositionpc'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 115px;',
                editable: false,
                data: this._arrVRelativePc
            });
            this.cmbVPositionPc.setDisabled(true);
            this.cmbVPositionPc.setValue(this._state.VPositionPcFrom);
            this.cmbVPositionPc.on('selected', _.bind(this.onVPositionPcSelect, this));

            this.radioHAlign = new Common.UI.RadioBox({
                el: $('#image-radio-halign'),
                name: 'asc-radio-horizontal',
                checked: true
            });
            this.radioHAlign.on('change', _.bind(this.onRadioHAlignChange, this));

            this.radioHPosition = new Common.UI.RadioBox({
                el: $('#image-radio-hposition'),
                name: 'asc-radio-horizontal'
            });
            this.radioHPosition.on('change', _.bind(this.onRadioHPositionChange, this));

            this.radioHPositionPc = new Common.UI.RadioBox({
                el: $('#image-radio-hpositionpc'),
                name: 'asc-radio-horizontal'
            });
            this.radioHPositionPc.on('change', _.bind(this.onRadioHPositionPcChange, this));

            this.radioVAlign = new Common.UI.RadioBox({
                el: $('#image-radio-valign'),
                name: 'asc-radio-vertical',
                checked: true
            });
            this.radioVAlign.on('change', _.bind(this.onRadioVAlignChange, this));

            this.radioVPosition = new Common.UI.RadioBox({
                el: $('#image-radio-vposition'),
                name: 'asc-radio-vertical'
            });
            this.radioVPosition.on('change', _.bind(this.onRadioVPositionChange, this));

            this.radioVPositionPc = new Common.UI.RadioBox({
                el: $('#image-radio-vpositionpc'),
                name: 'asc-radio-vertical'
            });
            this.radioVPositionPc.on('change', _.bind(this.onRadioVPositionPcChange, this));

            this.chMove = new Common.UI.CheckBox({
                el: $('#image-checkbox-move'),
                labelText: this.textMove
            });
            this.chMove.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    var value = this._arrVRelative[(field.getValue()=='checked') ? 3 : 4].value;
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
                el: $('#image-checkbox-overlap'),
                labelText: this.textOverlap
            });
            this.chOverlap.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    this._changedProps.put_AllowOverlap(field.getValue()=='checked');
                }
            }, this));

            // Margins
            this.spnMarginTop = new Common.UI.MetricSpinner({
                el: $('#image-margin-top'),
                step: .1,
                width: 100,
                defaultUnit : "cm",
                value: '0 cm',
                maxValue: 55.87,
                minValue: 0
            });
            this.spnMarginTop.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    if (this.Margins===undefined)
                        this.Margins= new Asc.asc_CPaddings();
                    this.Margins.put_Top(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                }
            }, this));
            this.spinners.push(this.spnMarginTop);

            this.spnMarginBottom = new Common.UI.MetricSpinner({
                el: $('#image-margin-bottom'),
                step: .1,
                width: 100,
                defaultUnit : "cm",
                value: '0 cm',
                maxValue: 55.87,
                minValue: 0
            });
            this.spnMarginBottom.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    if (this.Margins===undefined)
                        this.Margins= new Asc.asc_CPaddings();
                    this.Margins.put_Bottom(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                }
            }, this));
            this.spinners.push(this.spnMarginBottom);

            this.spnMarginLeft = new Common.UI.MetricSpinner({
                el: $('#image-margin-left'),
                step: .1,
                width: 100,
                defaultUnit : "cm",
                value: '0.19 cm',
                maxValue: 9.34,
                minValue: 0
            });
            this.spnMarginLeft.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    if (this.Margins===undefined)
                        this.Margins= new Asc.asc_CPaddings();
                    this.Margins.put_Left(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                }
            }, this));
            this.spinners.push(this.spnMarginLeft);

            this.spnMarginRight = new Common.UI.MetricSpinner({
                el: $('#image-margin-right'),
                step: .1,
                width: 100,
                defaultUnit : "cm",
                value: '0.19 cm',
                maxValue: 9.34,
                minValue: 0
            });
            this.spnMarginRight.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    if (this.Margins===undefined)
                        this.Margins= new Asc.asc_CPaddings();
                    this.Margins.put_Right(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                }
            }, this));
            this.spinners.push(this.spnMarginRight);

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
                data: this._arrCapType
            });
            this.cmbCapType.setValue(Asc.c_oAscLineCapType.Flat);
            this.cmbCapType.on('selected', _.bind(function(combo, record){
                if (this._changedShapeProps) {
                    if (this._changedShapeProps.get_stroke()===null)
                        this._changedShapeProps.put_stroke(new Asc.asc_CStroke());

                    this._changedShapeProps.get_stroke().put_linecap(record.value);
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
                data: this._arrJoinType
            });
            this.cmbJoinType.setValue(Asc.c_oAscLineJoinType.Round);
            this.cmbJoinType.on('selected', _.bind(function(combo, record){
                if (this._changedShapeProps) {
                    if (this._changedShapeProps.get_stroke()===null)
                        this._changedShapeProps.put_stroke(new Asc.asc_CStroke());

                    this._changedShapeProps.get_stroke().put_linejoin(record.value);
                }
            }, this));


            var _arrStyles = [], _arrSize = [];
            for ( var i=0; i<6; i++ )
                _arrStyles.push({value: i, offsetx: 80*i+10, offsety: 0});

            _arrStyles[0].type = Asc.c_oAscLineBeginType.None;
            _arrStyles[1].type = Asc.c_oAscLineBeginType.Triangle;
            _arrStyles[2].type = Asc.c_oAscLineBeginType.Arrow;
            _arrStyles[3].type = Asc.c_oAscLineBeginType.Stealth;
            _arrStyles[4].type = Asc.c_oAscLineBeginType.Diamond;
            _arrStyles[5].type = Asc.c_oAscLineBeginType.Oval;

            for ( i=0; i<9; i++ )
                _arrSize.push({value: i, offsetx: 80+10, offsety: 20*(i+1)});

            _arrSize[0].type = Asc.c_oAscLineBeginSize.small_small;
            _arrSize[1].type = Asc.c_oAscLineBeginSize.small_mid;
            _arrSize[2].type = Asc.c_oAscLineBeginSize.small_large;
            _arrSize[3].type = Asc.c_oAscLineBeginSize.mid_small;
            _arrSize[4].type = Asc.c_oAscLineBeginSize.mid_mid;
            _arrSize[5].type = Asc.c_oAscLineBeginSize.mid_large;
            _arrSize[6].type = Asc.c_oAscLineBeginSize.large_small;
            _arrSize[7].type = Asc.c_oAscLineBeginSize.large_mid;
            _arrSize[8].type = Asc.c_oAscLineBeginSize.large_large;


            this.btnBeginStyle = new Common.UI.ComboBox({
                el: $('#shape-advanced-begin-style'),
                template: _.template([
                    '<div class="input-group combobox combo-dataview-menu input-group-nr dropdown-toggle combo-arrow-style"  data-toggle="dropdown">',
                    '<div class="img-arrows form-control image" style="width: 100px;"></div>',
                    '<div style="display: table-cell;"></div>',
                    '<button type="button" class="btn btn-default"><span class="caret img-commonctrl"></span></button>',
                    '</div>'
                ].join(''))
            });
            this.btnBeginStyleMenu = (new Common.UI.Menu({
                style: 'min-width: 105px;',
                additionalAlign: this.menuAddAlign,
                items: [
                    { template: _.template('<div id="shape-advanced-menu-begin-style" style="width: 105px; margin: 0 5px;"></div>') }
                ]
            })).render($('#shape-advanced-begin-style'));

            this.mnuBeginStylePicker = new Common.UI.DataView({
                el: $('#shape-advanced-menu-begin-style'),
                parentMenu: this.btnBeginStyleMenu,
                store: new Common.UI.DataViewStore(_arrStyles),
                itemTemplate: _.template('<div id="<%= id %>" class="item-arrow img-arrows" style="background-position: -<%= offsetx %>px -<%= offsety %>px;"></div>')
            });
            this.mnuBeginStylePicker.on('item:click', _.bind(this.onSelectBeginStyle, this));
            this._selectStyleItem(this.btnBeginStyle, null);

            this.btnBeginSize = new Common.UI.ComboBox({
                el: $('#shape-advanced-begin-size'),
                template: _.template([
                    '<div class="input-group combobox combo-dataview-menu input-group-nr dropdown-toggle combo-arrow-style"  data-toggle="dropdown">',
                    '<div class="img-arrows form-control image" style="width: 100px;"></div>',
                    '<div style="display: table-cell;"></div>',
                    '<button type="button" class="btn btn-default"><span class="caret img-commonctrl"></span></button>',
                    '</div>'
                ].join(''))
            });
            this.btnBeginSizeMenu = (new Common.UI.Menu({
                style: 'min-width: 160px;',
                additionalAlign: this.menuAddAlign,
                items: [
                    { template: _.template('<div id="shape-advanced-menu-begin-size" style="width: 160px; margin: 0 5px;"></div>') }
                ]
            })).render($('#shape-advanced-begin-size'));

            this.mnuBeginSizePicker = new Common.UI.DataView({
                el: $('#shape-advanced-menu-begin-size'),
                parentMenu: this.btnBeginSizeMenu,
                store: new Common.UI.DataViewStore(_arrSize),
                itemTemplate: _.template('<div id="<%= id %>" class="item-arrow img-arrows" style="background-position: -<%= offsetx %>px -<%= offsety %>px;"></div>')
            });
            this.mnuBeginSizePicker.on('item:click', _.bind(this.onSelectBeginSize, this));
            this._selectStyleItem(this.btnBeginSize, null);

            for ( i=0; i<_arrStyles.length; i++ )
                _arrStyles[i].offsety += 200;

            for ( i=0; i<_arrSize.length; i++ )
                _arrSize[i].offsety += 200;

            this.btnEndStyle = new Common.UI.ComboBox({
                el: $('#shape-advanced-end-style'),
                template: _.template([
                    '<div class="input-group combobox combo-dataview-menu input-group-nr dropdown-toggle combo-arrow-style"  data-toggle="dropdown">',
                    '<div class="img-arrows form-control image" style="width: 100px;"></div>',
                    '<div style="display: table-cell;"></div>',
                    '<button type="button" class="btn btn-default"><span class="caret img-commonctrl"></span></button>',
                    '</div>'
                ].join(''))
            });
            this.btnEndStyleMenu = (new Common.UI.Menu({
                style: 'min-width: 105px;',
                additionalAlign: this.menuAddAlign,
                items: [
                    { template: _.template('<div id="shape-advanced-menu-end-style" style="width: 105px; margin: 0 5px;"></div>') }
                ]
            })).render($('#shape-advanced-end-style'));

            this.mnuEndStylePicker = new Common.UI.DataView({
                el: $('#shape-advanced-menu-end-style'),
                parentMenu: this.btnEndStyleMenu,
                store: new Common.UI.DataViewStore(_arrStyles),
                itemTemplate: _.template('<div id="<%= id %>" class="item-arrow img-arrows" style="background-position: -<%= offsetx %>px -<%= offsety %>px;"></div>')
            });
            this.mnuEndStylePicker.on('item:click', _.bind(this.onSelectEndStyle, this));
            this._selectStyleItem(this.btnEndStyle, null);

            this.btnEndSize = new Common.UI.ComboBox({
                el: $('#shape-advanced-end-size'),
                template: _.template([
                    '<div class="input-group combobox combo-dataview-menu input-group-nr dropdown-toggle combo-arrow-style"  data-toggle="dropdown">',
                    '<div class="img-arrows form-control image" style="width: 100px;"></div>',
                    '<div style="display: table-cell;"></div>',
                    '<button type="button" class="btn btn-default"><span class="caret img-commonctrl"></span></button>',
                    '</div>'
                ].join(''))
            });
            this.btnEndSizeMenu = (new Common.UI.Menu({
                style: 'min-width: 160px;',
                additionalAlign: this.menuAddAlign,
                items: [
                    { template: _.template('<div id="shape-advanced-menu-end-size" style="width: 160px; margin: 0 5px;"></div>') }
                ]
            })).render($('#shape-advanced-end-size'));

            this.mnuEndSizePicker = new Common.UI.DataView({
                el: $('#shape-advanced-menu-end-size'),
                parentMenu: this.btnEndSizeMenu,
                store: new Common.UI.DataViewStore(_arrSize),
                itemTemplate: _.template('<div id="<%= id %>" class="item-arrow img-arrows" style="background-position: -<%= offsetx %>px -<%= offsety %>px;"></div>')
            });
            this.mnuEndSizePicker.on('item:click', _.bind(this.onSelectEndSize, this));
            this._selectStyleItem(this.btnEndSize, null);

            // Alt Text

            this.inputAltTitle = new Common.UI.InputField({
                el          : $('#image-advanced-alt-title'),
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
            this.updateMetricUnit();
            this._setDefaults(this._originalProps);
            this.btnsCategory[(this._objectType == Asc.c_oAscTypeSelectElement.Shape) ? 0 : 1].setVisible(false);
            if (this.storageName) {
                var value = Common.localStorage.getItem(this.storageName);
                this.setActiveCategory((value!==null) ? parseInt(value) : 0);
            }
        },

        _setDefaults: function(props) {
            if (props ){
                this._objectType = Asc.c_oAscTypeSelectElement.Image;

                var value = props.get_WrappingStyle();
                if ( props.get_CanBeFlow() ) {
                    switch (value) {
                        case Asc.c_oAscWrapStyle2.Inline:
                            this.btnWrapInline.toggle(true);
                            break;
                        case Asc.c_oAscWrapStyle2.Square:
                            this.btnWrapSquare.toggle(true);
                            break;
                        case Asc.c_oAscWrapStyle2.Tight:
                            this.btnWrapTight.toggle(true);
                            break;
                        case Asc.c_oAscWrapStyle2.Through:
                            this.btnWrapThrough.toggle(true);
                            break;
                        case Asc.c_oAscWrapStyle2.TopAndBottom:
                            this.btnWrapTopBottom.toggle(true);
                            break;
                        case Asc.c_oAscWrapStyle2.Behind:
                            this.btnWrapBehind.toggle(true);
                            break;
                        case Asc.c_oAscWrapStyle2.InFront:
                            this.btnWrapInFront.toggle(true);
                            break;
                        default:
                            this.btnWrapInline.toggle(false);
                            this.btnWrapSquare.toggle(false);
                            this.btnWrapTight.toggle(false);
                            this.btnWrapThrough.toggle(false);
                            this.btnWrapTopBottom.toggle(false);
                            this.btnWrapBehind.toggle(false);
                            this.btnWrapInFront.toggle(false);
                            break;
                    }
                    this._DisableElem(value);
                } else {
                    this.btnWrapInline.toggle(true);
                    this.btnWrapSquare.setDisabled(true);
                    this.btnWrapTight.setDisabled(true);
                    this.btnWrapThrough.setDisabled(true);
                    this.btnWrapTopBottom.setDisabled(true);
                    this.btnWrapBehind.setDisabled(true);
                    this.btnWrapInFront.setDisabled(true);
                    this._DisableElem(Asc.c_oAscWrapStyle2.Inline);
                }

                if (props.get_Paddings()) {
                    var Paddings = {
                        Top: props.get_Paddings().get_Top(),
                        Right: props.get_Paddings().get_Right(),
                        Bottom: props.get_Paddings().get_Bottom(),
                        Left: props.get_Paddings().get_Left()
                    };

                    if (Paddings.Top !== null && Paddings.Top !== undefined) this.spnTop.setValue(Common.Utils.Metric.fnRecalcFromMM(Paddings.Top), true);
                    if (Paddings.Left !== null && Paddings.Left !== undefined) this.spnLeft.setValue(Common.Utils.Metric.fnRecalcFromMM(Paddings.Left), true);
                    if (Paddings.Bottom !== null && Paddings.Bottom !== undefined) this.spnBottom.setValue(Common.Utils.Metric.fnRecalcFromMM(Paddings.Bottom), true);
                    if (Paddings.Right !== null && Paddings.Right !== undefined) this.spnRight.setValue(Common.Utils.Metric.fnRecalcFromMM(Paddings.Right), true);
                }

                var Position = props.get_PositionH();
                if (Position) {
                    if (Position.get_UseAlign()) {
                        value = Position.get_Align();
                        for (var i=0; i<this._arrHAlign.length; i++) {
                            if (value == this._arrHAlign[i].value) {
                                this.cmbHAlign.setValue(value);
                                this._state.HAlignType = value;
                                break;
                            }
                        }
                        value = Position.get_RelativeFrom();
                        for (var i=0; i<this._arrHRelative.length; i++) {
                            if (value == this._arrHRelative[i].value) {
                                this.cmbHRelative.setValue(value);
                                this._state.HAlignFrom = value;
                                break;
                            }
                        }
                    } else if (Position.get_Percent()) {
                        this.radioHPositionPc.setValue(true);
                        this.spnXPc.setValue(Position.get_Value());
                        value = Position.get_RelativeFrom();
                        for (i=0; i<this._arrHRelativePc.length; i++) {
                            if (value == this._arrHRelativePc[i].value) {
                                this.cmbHPositionPc.setValue(value);
                                this._state.HPositionPcFrom = value;
                                break;
                            }
                        }
                    } else {
                        this.radioHPosition.setValue(true);
                        value = Position.get_Value();
                        this.spnX.setValue(Common.Utils.Metric.fnRecalcFromMM(value));
                        value = Position.get_RelativeFrom();
                        for (i=0; i<this._arrHRelative.length; i++) {
                            if (value == this._arrHRelative[i].value) {
                                this.cmbHPosition.setValue(value);
                                this._state.HPositionFrom = value;
                                break;
                            }
                        }
                    }
                }

                Position = props.get_PositionV();
                if (Position) {
                    if (Position.get_UseAlign()) {
                        value = Position.get_Align();
                        for (i=0; i<this._arrVAlign.length; i++) {
                            if (value == this._arrVAlign[i].value) {
                                this.cmbVAlign.setValue(value);
                                this._state.VAlignType = value;
                                break;
                            }
                        }
                        value = Position.get_RelativeFrom();
                        for (i=0; i<this._arrVRelative.length; i++) {
                            if (value == this._arrVRelative[i].value) {
                                this.cmbVRelative.setValue(value);
                                this._state.VAlignFrom = value;
                                break;
                            }
                        }
                    } else if (Position.get_Percent()) {
                        this.radioVPositionPc.setValue(true);
                        this.spnYPc.setValue(Position.get_Value());
                        value = Position.get_RelativeFrom();
                        for (i=0; i<this._arrVRelativePc.length; i++) {
                            if (value == this._arrVRelativePc[i].value) {
                                this.cmbVPositionPc.setValue(value);
                                this._state.VPositionPcFrom = value;
                                break;
                            }
                        }
                    } else {
                        this.radioVPosition.setValue(true);
                        value = Position.get_Value();
                        this.spnY.setValue(Common.Utils.Metric.fnRecalcFromMM(value));
                        value = Position.get_RelativeFrom();
                        for (i=0; i<this._arrVRelative.length; i++) {
                            if (value == this._arrVRelative[i].value) {
                                this.cmbVPosition.setValue(value);
                                this._state.VPositionFrom = value;
                                break;
                            }
                        }
                    }
                    this.chMove.setValue((value==Asc.c_oAscRelativeFromV.Line || value==Asc.c_oAscRelativeFromV.Paragraph), true);
                    this.chMove.setDisabled(!Position.get_UseAlign() && Position.get_Percent());
                }

                this.chOverlap.setValue((props.get_AllowOverlap() !== null && props.get_AllowOverlap() !== undefined) ? props.get_AllowOverlap() : 'indeterminate', true);

                if (props.get_Height()>0)
                    this._nRatio = props.get_Width()/props.get_Height();

                var shapeprops = props.get_ShapeProperties();
                var chartprops = props.get_ChartProperties();

                this.btnOriginalSize.setVisible(!(shapeprops || chartprops));
                this.btnOriginalSize.setDisabled(props.get_ImageUrl()===null || props.get_ImageUrl()===undefined);
                this.btnsCategory[5].setVisible(shapeprops!==null && !shapeprops.get_FromChart());   // Shapes
                this.btnsCategory[6].setVisible(shapeprops!==null && !shapeprops.get_FromChart());   // Margins
                this.btnsCategory[3].setDisabled(props.get_FromGroup()); // Wrapping
                this.btnsCategory[2].setVisible(!chartprops); // Rotation

                if (shapeprops) {
                    this._objectType = Asc.c_oAscTypeSelectElement.Shape;
                    this._setShapeDefaults(shapeprops);
                    this.setTitle(this.textTitleShape);
                    value = props.asc_getLockAspect();
                    this.chRatio.setValue(value);

                    this.spnShapeWidth.setMaxValue(this.sizeMax.width);
                    this.spnShapeHeight.setMaxValue(this.sizeMax.height);

                    var sizeRelH = props.get_SizeRelH();
                    if (sizeRelH) {
                        this.radioHSizePc.setValue(true);
                        this.spnShapeWidthPc.setValue(sizeRelH.get_Value());
                        value = sizeRelH.get_RelativeFrom();
                        for (i=0; i<this._arrHRelativePc.length; i++) {
                            if (value == this._arrHRelativePc[i].value) {
                                this.cmbWidthPc.setValue(value);
                                this.spnShapeWidth.setValue(Common.Utils.Metric.fnRecalcFromMM(this._arrHRelativePc[i].size * sizeRelH.get_Value()/100).toFixed(2), true);
                                this._state.ShapeWidthPcFrom = value;
                                break;
                            }
                        }
                    } else {
                        this.radioHSize.setValue(true);
                        value = props.get_Width();
                        this.spnShapeWidth.setValue((value!==undefined) ? Common.Utils.Metric.fnRecalcFromMM(value).toFixed(2) : '', true);
                    }

                    var sizeRelV = props.get_SizeRelV();
                    if (sizeRelV) {
                        this.radioVSizePc.setValue(true);
                        this.spnShapeHeightPc.setValue(sizeRelV.get_Value());
                        value = sizeRelV.get_RelativeFrom();
                        for (i=0; i<this._arrVRelativePc.length; i++) {
                            if (value == this._arrVRelativePc[i].value) {
                                this.cmbHeightPc.setValue(value);
                                this.spnShapeHeight.setValue(Common.Utils.Metric.fnRecalcFromMM(this._arrVRelativePc[i].size * sizeRelV.get_Value()/100).toFixed(2), true);
                                this._state.ShapeHeightPcFrom = value;
                                break;
                            }
                        }
                    } else {
                        this.radioVSize.setValue(true);
                        value = props.get_Height();
                        this.spnShapeHeight.setValue((value!==undefined) ? Common.Utils.Metric.fnRecalcFromMM(value).toFixed(2) : '', true);
                    }
                    this.chRatio.setDisabled(this.radioVSizePc.getValue() || this.radioHSizePc.getValue());

                    var margins = shapeprops.get_paddings();
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

                    this.btnsCategory[6].setDisabled(null === margins);   // Margins
                    this.btnsCategory[5].setDisabled(shapeprops.get_stroke().get_type() == Asc.c_oAscStrokeType.STROKE_NONE);   // Weights & Arrows

                } else {
                    value = props.asc_getLockAspect();
                    if (chartprops) {
                        this._objectType = Asc.c_oAscTypeSelectElement.Chart;
                        this.setTitle(this.textTitleChart);
                    }
                    else {
                        this.setTitle(this.textTitle);
                    }
                    this.btnRatio.toggle(value);

                    this.spnWidth.setMaxValue(this.sizeMax.width);
                    this.spnHeight.setMaxValue(this.sizeMax.height);
                    value = props.get_Width();
                    this.spnWidth.setValue((value!==undefined) ? Common.Utils.Metric.fnRecalcFromMM(value).toFixed(2) : '', true);
                    value = props.get_Height();
                    this.spnHeight.setValue((value!==undefined) ? Common.Utils.Metric.fnRecalcFromMM(value).toFixed(2) : '', true);
                }

                if (!chartprops) {
                    value = props.asc_getRot();
                    this.spnAngle.setValue((value==undefined || value===null) ? '' : Math.floor(value*180/3.14159265358979+0.5), true);
                    this.chFlipHor.setValue(props.asc_getFlipH());
                    this.chFlipVert.setValue(props.asc_getFlipV());
                }

                value = props.asc_getTitle();
                this.inputAltTitle.setValue(value ? value : '');

                value = props.asc_getDescription();
                this.textareaAltDescription.val(value ? value : '');

                this._changedProps = new Asc.asc_CImgProperty();
            }
        },

        getSettings: function() {
            var properties = this._changedProps;

            if (this._objectType == Asc.c_oAscTypeSelectElement.Shape) {
                properties.put_ShapeProperties(this._changedShapeProps);
                if (this.Margins) {
                    if (properties.get_ShapeProperties()===null || properties.get_ShapeProperties()===undefined)
                        properties.put_ShapeProperties(new Asc.asc_CShapeProperty());
                    properties.get_ShapeProperties().put_paddings(this.Margins);
                }
            }

            if (this._originalProps.get_WrappingStyle()===Asc.c_oAscWrapStyle2.Inline && properties.get_WrappingStyle() !== undefined && properties.get_WrappingStyle()!==Asc.c_oAscWrapStyle2.Inline ) {
                if ( properties.get_PositionH()===null || properties.get_PositionH()===undefined ) {
                    properties.put_PositionH(new Asc.CImagePositionH());
                    properties.get_PositionH().put_UseAlign(false);
                    properties.get_PositionH().put_Percent(false);
                    properties.get_PositionH().put_RelativeFrom(Asc.c_oAscRelativeFromH.Column);
                    var val = this._originalProps.get_Value_X(Asc.c_oAscRelativeFromH.Column);
                    properties.get_PositionH().put_Value(val);
                }

                if ( properties.get_PositionV()===null || properties.get_PositionV()===undefined ) {
                    properties.put_PositionV(new Asc.CImagePositionV());
                    properties.get_PositionV().put_UseAlign(false);
                    properties.get_PositionV().put_Percent(false);
                    properties.get_PositionV().put_RelativeFrom(Asc.c_oAscRelativeFromV.Paragraph);
                    val = this._originalProps.get_Value_Y(Asc.c_oAscRelativeFromV.Paragraph);
                    properties.get_PositionV().put_Value(val);
                }
            }

            if (this._objectType != Asc.c_oAscTypeSelectElement.Chart) {
                properties.asc_putRot(this.spnAngle.getNumberValue() * 3.14159265358979 / 180);
                properties.asc_putFlipH(this.chFlipHor.getValue()=='checked');
                properties.asc_putFlipV(this.chFlipVert.getValue()=='checked');
            }

            if (this.isAltTitleChanged)
                properties.asc_putTitle(this.inputAltTitle.getValue());

            if (this.isAltDescChanged)
                properties.asc_putDescription(this.textareaAltDescription.val());

            return { imageProps: properties} ;
        },

        _setShapeDefaults: function(props) {
            if (props ){
                var stroke = props.get_stroke();
                if (stroke) {
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
                            this._selectStyleItem(this.btnBeginSize, null);
                        }

                        value = stroke.get_linebeginstyle();
                        rec = this.mnuBeginStylePicker.store.findWhere({type: value});
                        if (rec) {
                            this.mnuBeginStylePicker.selectRecord(rec, true);
                            this._updateSizeArr(this.btnBeginSize, this.mnuBeginSizePicker, rec, this._beginSizeIdx);
                            this._selectStyleItem(this.btnBeginStyle, rec);
                        } else
                            this._selectStyleItem(this.btnBeginStyle, null);

                        value = stroke.get_lineendsize();
                        rec = this.mnuEndSizePicker.store.findWhere({type: value});
                        if (rec) {
                            this._endSizeIdx = rec.get('value');
                        } else {
                            this._endSizeIdx = null;
                            this._selectStyleItem(this.btnEndSize, null);
                        }

                        value = stroke.get_lineendstyle();
                        rec = this.mnuEndStylePicker.store.findWhere({type: value});
                        if (rec) {
                            this.mnuEndStylePicker.selectRecord(rec, true);
                            this._updateSizeArr(this.btnEndSize, this.mnuEndSizePicker, rec, this._endSizeIdx);
                            this._selectStyleItem(this.btnEndStyle, rec);
                        } else
                            this._selectStyleItem(this.btnEndStyle, null);
                    } else {
                        this._selectStyleItem(this.btnBeginStyle);
                        this._selectStyleItem(this.btnEndStyle);
                        this._selectStyleItem(this.btnBeginSize);
                        this._selectStyleItem(this.btnEndSize);
                    }
                }
            }
            this._changedShapeProps = new Asc.asc_CShapeProperty();
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

        onBtnWrapClick: function(btn, e) {
            this._DisableElem(btn.options.posId);
            if (this._changedProps)
                this._changedProps.put_WrappingStyle(btn.options.posId);
        },

        _DisableElem: function(btnId){
            var disabledLR = (btnId == Asc.c_oAscWrapStyle2.Inline || btnId == Asc.c_oAscWrapStyle2.Behind || btnId == Asc.c_oAscWrapStyle2.InFront || btnId == Asc.c_oAscWrapStyle2.TopAndBottom);
            var disabledTB = (btnId == Asc.c_oAscWrapStyle2.Inline || btnId == Asc.c_oAscWrapStyle2.Behind || btnId == Asc.c_oAscWrapStyle2.InFront
                || btnId == Asc.c_oAscWrapStyle2.Tight || btnId == Asc.c_oAscWrapStyle2.Through);

            this.spnLeft.setDisabled(disabledLR);
            this.spnRight.setDisabled(disabledLR);
            this.spnTop.setDisabled(disabledTB);
            this.spnBottom.setDisabled(disabledTB);

            this.btnsCategory[4].setDisabled(btnId == Asc.c_oAscWrapStyle2.Inline);
        },

        onHAlignSelect: function(combo, record){
            if (this._changedProps) {
                if (this._changedProps.get_PositionH()===null || this._changedProps.get_PositionH()===undefined)
                    this._changedProps.put_PositionH(new Asc.CImagePositionH());

                this._state.HAlignType = record.value;
                this._changedProps.get_PositionH().put_UseAlign(true);
                this._changedProps.get_PositionH().put_Percent(false);
                this._changedProps.get_PositionH().put_RelativeFrom(this._state.HAlignFrom);
                this._changedProps.get_PositionH().put_Align(this._state.HAlignType);
            }
        },

        onHRelativeSelect: function(combo, record){
            if (this._changedProps) {
                if (this._changedProps.get_PositionH()===null || this._changedProps.get_PositionH()===undefined)
                    this._changedProps.put_PositionH(new Asc.CImagePositionH());

                this._state.HAlignFrom = record.value;
                this._changedProps.get_PositionH().put_UseAlign(true);
                this._changedProps.get_PositionH().put_Percent(false);
                this._changedProps.get_PositionH().put_RelativeFrom(this._state.HAlignFrom);
                this._changedProps.get_PositionH().put_Align(this._state.HAlignType);
            }
        },

        onHPositionSelect: function(combo, record){
            if (this._changedProps) {
                if (this._changedProps.get_PositionH()===null || this._changedProps.get_PositionH()===undefined)
                    this._changedProps.put_PositionH(new Asc.CImagePositionH());

                this._state.HPositionFrom = record.value;
                this._changedProps.get_PositionH().put_UseAlign(false);
                this._changedProps.get_PositionH().put_Percent(false);
                this._changedProps.get_PositionH().put_RelativeFrom(this._state.HPositionFrom);
                if (!this._state.spnXChanged) {
                    var val = this._originalProps.get_Value_X(this._state.HPositionFrom);
                    this.spnX.setValue(Common.Utils.Metric.fnRecalcFromMM(val), true);
                }
                this._changedProps.get_PositionH().put_Value(Common.Utils.Metric.fnRecalcToMM(this.spnX.getNumberValue()));
            }
        },

        onHPositionPcSelect: function(combo, record){
            if (this._changedProps) {
                if (this._changedProps.get_PositionH()===null || this._changedProps.get_PositionH()===undefined)
                    this._changedProps.put_PositionH(new Asc.CImagePositionH());

                this._state.HPositionPcFrom = record.value;
                this._changedProps.get_PositionH().put_UseAlign(false);
                this._changedProps.get_PositionH().put_Percent(true);
                this._changedProps.get_PositionH().put_RelativeFrom(this._state.HPositionPcFrom);
                if (!this._state.spnXPcChanged) {
                    var val = this._originalProps.get_Value_X(this._state.HPositionPcFrom);
                    this.spnXPc.setValue(parseFloat((100*val/this.pageWidth).toFixed(2)), true);
                }
                this._changedProps.get_PositionH().put_Value(this.spnXPc.getNumberValue());
            }
        },

        onVAlignSelect: function(combo, record){
            if (this._changedProps) {
                if (this._changedProps.get_PositionV()===null || this._changedProps.get_PositionV()===undefined)
                    this._changedProps.put_PositionV(new Asc.CImagePositionV());

                this._state.VAlignType = record.value;
                this._changedProps.get_PositionV().put_UseAlign(true);
                this._changedProps.get_PositionV().put_Percent(false);
                this._changedProps.get_PositionV().put_RelativeFrom(this._state.VAlignFrom);
                this._changedProps.get_PositionV().put_Align(this._state.VAlignType);
            }
        },

        onVRelativeSelect: function(combo, record){
            if (this._changedProps) {
                if (this._changedProps.get_PositionV()===null || this._changedProps.get_PositionV()===undefined)
                    this._changedProps.put_PositionV(new Asc.CImagePositionV());

                this._state.VAlignFrom = record.value;
                this._changedProps.get_PositionV().put_UseAlign(true);
                this._changedProps.get_PositionV().put_Percent(false);
                this._changedProps.get_PositionV().put_RelativeFrom(this._state.VAlignFrom);
                this._changedProps.get_PositionV().put_Align(this._state.VAlignType);

                this.chMove.setValue(this._state.VAlignFrom==Asc.c_oAscRelativeFromV.Line || this._state.VAlignFrom==Asc.c_oAscRelativeFromV.Paragraph, true);
            }
        },

        onVPositionSelect: function(combo, record){
            if (this._changedProps) {
                if (this._changedProps.get_PositionV()===null || this._changedProps.get_PositionV()===undefined)
                    this._changedProps.put_PositionV(new Asc.CImagePositionV());

                this._state.VPositionFrom = record.value;
                this._changedProps.get_PositionV().put_UseAlign(false);
                this._changedProps.get_PositionV().put_Percent(false);
                this._changedProps.get_PositionV().put_RelativeFrom(this._state.VPositionFrom);
                if (!this._state.spnYChanged) {
                    var val = this._originalProps.get_Value_Y(this._state.VPositionFrom);
                    this.spnY.setValue(Common.Utils.Metric.fnRecalcFromMM(val), true);
                }
                this._changedProps.get_PositionV().put_Value(Common.Utils.Metric.fnRecalcToMM(this.spnY.getNumberValue()));
                this.chMove.setValue(this._state.VPositionFrom==Asc.c_oAscRelativeFromV.Line || this._state.VPositionFrom==Asc.c_oAscRelativeFromV.Paragraph, true);
            }
        },

        onVPositionPcSelect: function(combo, record){
            if (this._changedProps) {
                if (this._changedProps.get_PositionV()===null || this._changedProps.get_PositionV()===undefined)
                    this._changedProps.put_PositionV(new Asc.CImagePositionV());

                this._state.VPositionPcFrom = record.value;
                this._changedProps.get_PositionV().put_UseAlign(false);
                this._changedProps.get_PositionV().put_Percent(true);
                this._changedProps.get_PositionV().put_RelativeFrom(this._state.VPositionPcFrom);
                if (!this._state.spnYPcChanged) {
                    var val = this._originalProps.get_Value_Y(this._state.VPositionPcFrom);
                    this.spnYPc.setValue(parseFloat((100*val/this.pageHeight).toFixed(2)), true);
                }
                this._changedProps.get_PositionV().put_Value(this.spnYPc.getNumberValue());
            }
        },

        onRadioHAlignChange: function(field, newValue, eOpts) {
            if (this._changedProps) {
                if (this._changedProps.get_PositionH()===null || this._changedProps.get_PositionH()===undefined)
                    this._changedProps.put_PositionH(new Asc.CImagePositionH());

                this._changedProps.get_PositionH().put_UseAlign(newValue);
                if (newValue) {
                    this._changedProps.get_PositionH().put_Percent(false);
                    this._changedProps.get_PositionH().put_Align(this._state.HAlignType);
                    this._changedProps.get_PositionH().put_RelativeFrom(this._state.HAlignFrom);
                }
            }
            if (newValue) {
                this.cmbHAlign.setDisabled(false);
                this.cmbHRelative.setDisabled(false);
                this.spnX.setDisabled(true);
                this.cmbHPosition.setDisabled(true);
                this.spnXPc.setDisabled(true);
                this.cmbHPositionPc.setDisabled(true);
            }
        },

        onRadioHPositionChange: function(field, newValue, eOpts) {
            if (this._changedProps) {
                if (this._changedProps.get_PositionH()===null || this._changedProps.get_PositionH()===undefined)
                    this._changedProps.put_PositionH(new Asc.CImagePositionH());

                if (newValue) {
                    this._changedProps.get_PositionH().put_UseAlign(false);
                    this._changedProps.get_PositionH().put_Percent(false);
                    this._changedProps.get_PositionH().put_Value(Common.Utils.Metric.fnRecalcToMM(this.spnX.getNumberValue()));
                    this._changedProps.get_PositionH().put_RelativeFrom(this._state.HPositionFrom);
                }
            }
            if (newValue) {
                this.cmbHAlign.setDisabled(true);
                this.cmbHRelative.setDisabled(true);
                this.spnX.setDisabled(false);
                this.cmbHPosition.setDisabled(false);
                this.spnXPc.setDisabled(true);
                this.cmbHPositionPc.setDisabled(true);
            }
        },

        onRadioHPositionPcChange: function(field, newValue, eOpts) {
            if (this._changedProps) {
                if (this._changedProps.get_PositionH()===null || this._changedProps.get_PositionH()===undefined)
                    this._changedProps.put_PositionH(new Asc.CImagePositionH());

                this._changedProps.get_PositionH().put_Percent(newValue);
                if (newValue) {
                    this._changedProps.get_PositionH().put_UseAlign(false);
                    this._changedProps.get_PositionH().put_Value(this.spnXPc.getNumberValue());
                    this._changedProps.get_PositionH().put_RelativeFrom(this._state.HPositionPcFrom);
                }
            }
            if (newValue) {
                this.cmbHAlign.setDisabled(true);
                this.cmbHRelative.setDisabled(true);
                this.spnX.setDisabled(true);
                this.cmbHPosition.setDisabled(true);
                this.spnXPc.setDisabled(false);
                this.cmbHPositionPc.setDisabled(false);
            }
        },

        onRadioVAlignChange: function(field, newValue, eOpts) {
            if (this._changedProps) {
                if (this._changedProps.get_PositionV()===null || this._changedProps.get_PositionV()===undefined)
                    this._changedProps.put_PositionV(new Asc.CImagePositionV());

                this._changedProps.get_PositionV().put_UseAlign(newValue);
                if (newValue) {
                    this._changedProps.get_PositionV().put_Percent(false);
                    this._changedProps.get_PositionV().put_Align(this._state.VAlignType);
                    this._changedProps.get_PositionV().put_RelativeFrom(this._state.VAlignFrom);
                }
            }
            if (newValue) {
                this.cmbVAlign.setDisabled(false);
                this.cmbVRelative.setDisabled(false);
                this.spnY.setDisabled(true);
                this.cmbVPosition.setDisabled(true);
                this.chMove.setValue(this._state.VAlignFrom==Asc.c_oAscRelativeFromV.Line || this._state.VAlignFrom==Asc.c_oAscRelativeFromV.Paragraph, true);
                this.chMove.setDisabled(false);
                this.spnYPc.setDisabled(true);
                this.cmbVPositionPc.setDisabled(true);
            }
        },

        onRadioVPositionChange: function(field, newValue, eOpts) {
            if (this._changedProps) {
                if (this._changedProps.get_PositionV()===null || this._changedProps.get_PositionV()===undefined)
                    this._changedProps.put_PositionV(new Asc.CImagePositionV());

                if (newValue) {
                    this._changedProps.get_PositionV().put_UseAlign(false);
                    this._changedProps.get_PositionV().put_Percent(false);
                    this._changedProps.get_PositionV().put_Value(Common.Utils.Metric.fnRecalcToMM(this.spnY.getNumberValue()));
                    this._changedProps.get_PositionV().put_RelativeFrom(this._state.VPositionFrom);
                }
            }
            if (newValue) {
                this.cmbVAlign.setDisabled(true);
                this.cmbVRelative.setDisabled(true);
                this.spnY.setDisabled(false);
                this.cmbVPosition.setDisabled(false);
                this.chMove.setValue(this._state.VPositionFrom==Asc.c_oAscRelativeFromV.Line || this._state.VPositionFrom==Asc.c_oAscRelativeFromV.Paragraph, true);
                this.chMove.setDisabled(false);
                this.spnYPc.setDisabled(true);
                this.cmbVPositionPc.setDisabled(true);
            }
        },

        onRadioVPositionPcChange: function(field, newValue, eOpts) {
            if (this._changedProps) {
                if (this._changedProps.get_PositionV()===null || this._changedProps.get_PositionV()===undefined)
                    this._changedProps.put_PositionV(new Asc.CImagePositionV());

                this._changedProps.get_PositionV().put_Percent(newValue);
                if (newValue) {
                    this._changedProps.get_PositionV().put_UseAlign(false);
                    this._changedProps.get_PositionV().put_Value(this.spnYPc.getNumberValue());
                    this._changedProps.get_PositionV().put_RelativeFrom(this._state.VPositionPcFrom);
                }
            }
            if (newValue) {
                this.cmbVAlign.setDisabled(true);
                this.cmbVRelative.setDisabled(true);
                this.spnY.setDisabled(true);
                this.cmbVPosition.setDisabled(true);
                this.chMove.setValue(false, true);
                this.chMove.setDisabled(true);
                this.spnYPc.setDisabled(false);
                this.cmbVPositionPc.setDisabled(false);
            }
        },

        onRadioHSizeChange: function(field, newValue, eOpts) {
            if (newValue) {
                if (this._changedProps) {
                    this._changedProps.put_Width(Common.Utils.Metric.fnRecalcToMM(this.spnShapeWidth.getNumberValue()));
                    this._changedProps.put_SizeRelH(undefined);

                    this.fillShapeHeight();
                }
                this.chRatio.setDisabled(this.radioVSizePc.getValue());
                this.cmbWidthPc.setDisabled(true);
                this.spnShapeWidthPc.setDisabled(true);
                this.spnShapeWidth.setDisabled(false);
            }
        },

        onRadioHSizePcChange: function(field, newValue, eOpts) {
            if (newValue) {
                if (this._changedProps) {
                    if (this._changedProps.get_SizeRelH()===null || this._changedProps.get_SizeRelH()===undefined)
                        this._changedProps.put_SizeRelH(new Asc.CImagePositionH());

                    this._changedProps.get_SizeRelH().put_Value(this.spnShapeWidthPc.getNumberValue());
                    this._changedProps.get_SizeRelH().put_RelativeFrom(this._state.ShapeWidthPcFrom);

                    this.fillShapeHeight();
                }
                this.chRatio.setDisabled(true);
                this.cmbWidthPc.setDisabled(false);
                this.spnShapeWidthPc.setDisabled(false);
                this.spnShapeWidth.setDisabled(true);
            }
        },

        onRadioVSizeChange: function(field, newValue, eOpts) {
            if (newValue) {
                if (this._changedProps) {
                    this._changedProps.put_Height(Common.Utils.Metric.fnRecalcToMM(this.spnShapeHeight.getNumberValue()));
                    this._changedProps.put_SizeRelV(undefined);

                    this.fillShapeWidth();
                }
                this.chRatio.setDisabled(this.radioHSizePc.getValue());
                this.cmbHeightPc.setDisabled(true);
                this.spnShapeHeightPc.setDisabled(true);
                this.spnShapeHeight.setDisabled(false);
            }
        },

        onRadioVSizePcChange: function(field, newValue, eOpts) {
            if (newValue) {
                if (this._changedProps) {
                    if (this._changedProps.get_SizeRelV()===null || this._changedProps.get_SizeRelV()===undefined)
                        this._changedProps.put_SizeRelV(new Asc.CImagePositionV());

                    this._changedProps.get_SizeRelV().put_Value(this.spnShapeHeightPc.getNumberValue());
                    this._changedProps.get_SizeRelV().put_RelativeFrom(this._state.ShapeHeightPcFrom);

                    this.fillShapeWidth();
                }
                this.chRatio.setDisabled(true);
                this.cmbHeightPc.setDisabled(false);
                this.spnShapeHeightPc.setDisabled(false);
                this.spnShapeHeight.setDisabled(true);
            }
        },

        onCmbWidthPcSelect: function(combo, record){
            if (this._changedProps) {
                if (this._changedProps.get_SizeRelH()===null || this._changedProps.get_SizeRelH()===undefined)
                    this._changedProps.put_SizeRelH(new Asc.CImagePositionH());

                this._state.ShapeWidthPcFrom = record.value;
                this._changedProps.get_SizeRelH().put_Value(this.spnShapeWidthPc.getNumberValue());
                this._changedProps.get_SizeRelH().put_RelativeFrom(this._state.ShapeWidthPcFrom);

                this.fillShapeHeight();
            }
        },

        onCmbHeightPcSelect: function(combo, record){
            if (this._changedProps) {
                if (this._changedProps.get_SizeRelV()===null || this._changedProps.get_SizeRelV()===undefined)
                    this._changedProps.put_SizeRelV(new Asc.CImagePositionV());

                this._state.ShapeHeightPcFrom = record.value;
                this._changedProps.get_SizeRelV().put_Value(this.spnShapeHeightPc.getNumberValue());
                this._changedProps.get_SizeRelV().put_RelativeFrom(this._state.ShapeHeightPcFrom);

                this.fillShapeWidth();
            }
        },

        fillShapeWidth: function(combo, record){
            if (this.radioHSize.getValue())
                this._changedProps.put_Width(Common.Utils.Metric.fnRecalcToMM(this.spnShapeWidth.getNumberValue()));
            else {
                if (this._changedProps.get_SizeRelH()===null || this._changedProps.get_SizeRelH()===undefined)
                    this._changedProps.put_SizeRelH(new Asc.CImagePositionH());

                this._changedProps.get_SizeRelH().put_Value(this.spnShapeWidthPc.getNumberValue());
                this._changedProps.get_SizeRelH().put_RelativeFrom(this._state.ShapeWidthPcFrom);
            }
        },

        fillShapeHeight: function(combo, record){
            if (this.radioVSize.getValue())
                this._changedProps.put_Height(Common.Utils.Metric.fnRecalcToMM(this.spnShapeHeight.getNumberValue()));
            else {
                if (this._changedProps.get_SizeRelV()===null || this._changedProps.get_SizeRelV()===undefined)
                    this._changedProps.put_SizeRelV(new Asc.CImagePositionV());

                this._changedProps.get_SizeRelV().put_Value(this.spnShapeHeightPc.getNumberValue());
                this._changedProps.get_SizeRelV().put_RelativeFrom(this._state.ShapeHeightPcFrom);
            }
        },

        _updateSizeArr: function(combo, picker, record, sizeidx) {
            if (record.get('value')>0) {
                picker.store.each( function(rec){
                    rec.set({offsetx: record.get('value')*80 + 10});
                }, this);
                combo.setDisabled(false);
                if (sizeidx !== null) {
                    picker.selectByIndex(sizeidx, true);
                    this._selectStyleItem(combo, picker.store.at(sizeidx));
                } else
                    this._selectStyleItem(combo, null);
            } else {
                this._selectStyleItem(combo, null);
                combo.setDisabled(true);
            }
        },

        _selectStyleItem: function(combo, record) {
            var formcontrol = $(combo.el).find('.form-control');
            formcontrol.css('background-position', ((record) ? (-record.get('offsetx')+20) + 'px' : '0') + ' ' + ((record) ? '-' + record.get('offsety') + 'px' : '-30px'));
        },

        onSelectBeginStyle: function(picker, view, record, e){
            if (this._changedShapeProps) {
                if (this._changedShapeProps.get_stroke()===null)
                    this._changedShapeProps.put_stroke(new Asc.asc_CStroke());

                this._changedShapeProps.get_stroke().put_linebeginstyle(record.get('type'));
            }
            if (this._beginSizeIdx===null || this._beginSizeIdx===undefined)
                this._beginSizeIdx = 4;
            this._updateSizeArr(this.btnBeginSize, this.mnuBeginSizePicker, record, this._beginSizeIdx);
            this._selectStyleItem(this.btnBeginStyle, record);
        },

        onSelectBeginSize: function(picker, view, record, e){
            if (this._changedShapeProps) {
                if (this._changedShapeProps.get_stroke()===null)
                    this._changedShapeProps.put_stroke(new Asc.asc_CStroke());

                this._changedShapeProps.get_stroke().put_linebeginsize(record.get('type'));
            }
            this._beginSizeIdx = record.get('value');
            this._selectStyleItem(this.btnBeginSize, record);
        },

        onSelectEndStyle: function(picker, view, record, e){
            if (this._changedShapeProps) {
                if (this._changedShapeProps.get_stroke()===null)
                    this._changedShapeProps.put_stroke(new Asc.asc_CStroke());

                this._changedShapeProps.get_stroke().put_lineendstyle(record.get('type'));
            }
            if (this._endSizeIdx===null || this._endSizeIdx===undefined)
                this._endSizeIdx = 4;
            this._updateSizeArr(this.btnEndSize, this.mnuEndSizePicker, record, this._endSizeIdx);
            this._selectStyleItem(this.btnEndStyle, record);
        },

        onSelectEndSize: function(picker, view, record, e){
            if (this._changedShapeProps) {
                if (this._changedShapeProps.get_stroke()===null)
                    this._changedShapeProps.put_stroke(new Asc.asc_CStroke());

                this._changedShapeProps.get_stroke().put_lineendsize(record.get('type'));
            }
            this._endSizeIdx = record.get('value');
            this._selectStyleItem(this.btnEndSize, record);
        },

        textTop:        'Top',
        textLeft:       'Left',
        textBottom:     'Bottom',
        textRight:      'Right',
        textOriginalSize: 'Default Size',
        textPosition:   'Position',
        textDistance:   'Distance From Text',
        textSize:       'Size',
        textWrap:       'Wrapping Style',
        textWidth:      'Width',
        textHeight:     'Height',
        textWrapInlineTooltip: 'Inline',
        textWrapSquareTooltip: 'Square',
        textWrapTightTooltip: 'Tight',
        textWrapThroughTooltip: 'Through',
        textWrapTopbottomTooltip: 'Top and Bottom',
        textWrapBehindTooltip: 'Behind',
        textWrapInFrontTooltip: 'In Front',
        textTitle:      'Image - Advanced Settings',
        textKeepRatio: 'Constant Proportions',
        cancelButtonText: 'Cancel',
        okButtonText:   'Ok',
        textBtnWrap:    'Text Wrapping',
        textCenter: 'Center',
        textCharacter: 'Character',
        textColumn: 'Column',
        textLeftMargin: 'Left Margin',
        textMargin: 'Margin',
        textPage: 'Page',
        textRightMargin: 'Right Margin',
        textLine: 'Line',
        textBottomMargin: 'Bottom Margin',
        textParagraph: 'Paragraph',
        textTopMargin: 'Top Margin',
        textHorizontal: 'Horizontal',
        textVertical: 'Vertical',
        textAlignment: 'Alignment',
        textRelative: 'relative to',
        textRightOf: 'to the right Of',
        textBelow: 'below',
        textOverlap: 'Allow overlap',
        textMove: 'Move object with text',
        textOptions: 'Options',
        textShape: 'Shape Settings',
        textTitleShape:      'Shape - Advanced Settings',
        textTitleChart:      'Chart - Advanced Settings',
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
        textPositionPc: 'Relative position',
        textAspectRatio: 'Lock aspect ratio',
        textAbsoluteWH: 'Absolute',
        textRelativeWH: 'Relative',
        textAlt: 'Alternative Text',
        textAltTitle: 'Title',
        textAltDescription: 'Description',
        textAltTip: 'The alternative text-based representation of the visual object information, which will be read to the people with vision or cognitive impairments to help them better understand what information there is in the image, autoshape, chart or table.',
        textWeightArrows: 'Weights & Arrows',
        textRotation: 'Rotation',
        textAngle: 'Angle',
        textFlipped: 'Flipped',
        textHorizontally: 'Horizontally',
        textVertically: 'Vertically'

    }, DE.Views.ImageSettingsAdvanced || {}));
});