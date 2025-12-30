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
 *  ImageSettingsAdvanced.js
 *
 *  Created on 3/03/14
 *
 */

define([
    'text!documenteditor/main/app/template/ImageSettingsAdvanced.template',
    'text!common/main/lib/template/ChartVertAxis.template',
    'text!common/main/lib/template/ChartHorAxis.template',
    'common/main/lib/view/AdvancedSettingsWindow'
], function (contentTemplate, vertTemplate, horTemplate) {
    'use strict';

    DE.Views.ImageSettingsAdvanced = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 340,
            contentHeight: 450,
            toggleGroup: 'image-adv-settings-group',
            sizeOriginal: {width: 0, height: 0},
            sizeMax: {width: 55.88, height: 55.88},
            properties: null,
            chartSettings: null,
            storageName: 'de-img-settings-adv-category'
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle,
                items: [
                    {panelId: 'id-chart-settings-dlg-layout',       panelCaption: this.textLayout},
                    {panelId: 'id-chart-settings-dlg-vert',         panelCaption: this.textVertAxis},
                    {panelId: 'id-chart-settings-dlg-vert-sec',     panelCaption: this.textVertAxisSec},
                    {panelId: 'id-chart-settings-dlg-hor',          panelCaption: this.textHorAxis},
                    {panelId: 'id-chart-settings-dlg-hor-sec',      panelCaption: this.textHorAxisSec},
                    {panelId: 'id-adv-image-width',      panelCaption: this.textSize},
                    {panelId: 'id-adv-shape-size',       panelCaption: this.textSize},
                    {panelId: 'id-adv-image-rotate',     panelCaption: this.textRotation},
                    {panelId: 'id-adv-image-wrap',       panelCaption: this.textBtnWrap},
                    {panelId: 'id-adv-image-position',   panelCaption: this.textPosition},
                    {panelId: 'id-adv-image-shape',      panelCaption: this.textWeightArrows},
                    {panelId: 'id-adv-image-margins',    panelCaption: this.textTextBox},
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
                spnYPcChanged: false,
                ChartType: Asc.c_oAscChartTypeSettings.barNormal
            };
            this.Margins = undefined;
            this._nRatio = 1;

            this._originalProps = this.options.imageProps;
            this.sectionProps = this.options.sectionProps;
            this.pageWidth = this.options.sectionProps ? this.options.sectionProps.get_W() : 210;
            this.pageHeight = this.options.sectionProps ? this.options.sectionProps.get_H() : 297;
            this.api = this.options.api;
            this._changedProps = null;
            this._changedShapeProps = null;
            this._isSmartArt = false;
            this.chartSettings = this.options.chartSettings;
            this.isChart = !!this.chartSettings;
            this.isShape = false;
            this.vertAxisProps = [];
            this.vertAxisPropsIndexes = [];
            this.horAxisProps = [];
            this.horAxisPropsIndexes = [];
            this.currentAxisProps = [];
            this.currentChartType = this._state.ChartType;
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);

            var me = this;

            // Image & Chart Size
            this.spnWidth = new Common.UI.MetricSpinner({
                el: $('#image-advanced-spin-width'),
                step: .1,
                width: 70,
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
                width: 70,
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
                this.spnAngle.setValue(0);
                this.spnWidth.setValue(this.sizeOriginal.width, true);
                this.spnHeight.setValue(this.sizeOriginal.height, true);
                this._nRatio = this.sizeOriginal.width/this.sizeOriginal.height;
                if (this._changedProps) {
                    this._changedProps.put_Height(Common.Utils.Metric.fnRecalcToMM(this.spnHeight.getNumberValue()));
                    this._changedProps.put_Width(Common.Utils.Metric.fnRecalcToMM(this.spnWidth.getNumberValue()));
                    this._changedProps.put_Rot(0);
                }
            }, this));

            this.btnRatio = new Common.UI.Button({
                parentEl: $('#image-advanced-button-ratio'),
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

            // Shape Size
            this.radioHSize = new Common.UI.RadioBox({
                el: $('#shape-radio-hsize'),
                name: 'asc-radio-width',
                checked: true,
                ariaLabel: this.textAbsoluteWH
            });
            this.radioHSize.on('change', _.bind(this.onRadioHSizeChange, this));

            this.radioHSizePc = new Common.UI.RadioBox({
                el: $('#shape-radio-hsizepc'),
                name: 'asc-radio-width',
                ariaLabel: this.textRelativeWH
            });
            this.radioHSizePc.on('change', _.bind(this.onRadioHSizePcChange, this));

            this.radioVSize = new Common.UI.RadioBox({
                el: $('#shape-radio-vsize'),
                name: 'asc-radio-height',
                checked: true,
                ariaLabel: this.textAbsoluteWH
            });
            this.radioVSize.on('change', _.bind(this.onRadioVSizeChange, this));

            this.radioVSizePc = new Common.UI.RadioBox({
                el: $('#shape-radio-vsizepc'),
                name: 'asc-radio-height',
                ariaLabel: this.textRelativeWH
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
                if (this.chRatio.getValue()=='checked' && (!this.chRatio.isDisabled() || this._isSmartArt)) {
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
                if (this.chRatio.getValue()=='checked' && (!this.chRatio.isDisabled() || this._isSmartArt)) {
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
                data: this._arrHRelativePc,
                takeFocusOnClose: true
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
                data: this._arrVRelativePc,
                takeFocusOnClose: true
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
                parentEl: $('#image-advanced-button-wrap-inline'),
                cls: 'btn-options huge-1',
                iconCls: 'icon-advanced-wrap options__icon options__icon-huge btn-wrap-inline',
                posId: Asc.c_oAscWrapStyle2.Inline,
                hint: this.textWrapInlineTooltip,
                enableToggle: true,
                allowDepress: false,
                toggleGroup : 'imgAdvWrapGroup'
            });
            this.btnWrapInline.on('click', _.bind(this.onBtnWrapClick, this));

            this.btnWrapSquare = new Common.UI.Button({
                parentEl: $('#image-advanced-button-wrap-square'),
                cls: 'btn-options huge-1',
                iconCls: 'icon-advanced-wrap options__icon options__icon-huge btn-wrap-square',
                posId: Asc.c_oAscWrapStyle2.Square,
                hint: this.textWrapSquareTooltip,
                enableToggle: true,
                allowDepress: false,
                toggleGroup : 'imgAdvWrapGroup'
            });
            this.btnWrapSquare.on('click', _.bind(this.onBtnWrapClick, this));

            this.btnWrapTight = new Common.UI.Button({
                parentEl: $('#image-advanced-button-wrap-tight'),
                cls: 'btn-options huge-1',
                iconCls: 'icon-advanced-wrap options__icon options__icon-huge btn-wrap-tight',
                posId: Asc.c_oAscWrapStyle2.Tight,
                hint: this.textWrapTightTooltip,
                enableToggle: true,
                allowDepress: false,
                toggleGroup : 'imgAdvWrapGroup'
            });
            this.btnWrapTight.on('click', _.bind(this.onBtnWrapClick, this));

            this.btnWrapThrough = new Common.UI.Button({
                parentEl: $('#image-advanced-button-wrap-through'),
                cls: 'btn-options huge-1',
                iconCls: 'icon-advanced-wrap options__icon options__icon-huge btn-wrap-through',
                posId: Asc.c_oAscWrapStyle2.Through,
                hint: this.textWrapThroughTooltip,
                enableToggle: true,
                allowDepress: false,
                toggleGroup : 'imgAdvWrapGroup'
            });
            this.btnWrapThrough.on('click', _.bind(this.onBtnWrapClick, this));

            this.btnWrapTopBottom = new Common.UI.Button({
                parentEl: $('#image-advanced-button-wrap-topbottom'),
                cls: 'btn-options huge-1',
                iconCls: 'icon-advanced-wrap options__icon options__icon-huge btn-wrap-topbottom',
                posId: Asc.c_oAscWrapStyle2.TopAndBottom,
                hint: this.textWrapTopbottomTooltip,
                enableToggle: true,
                allowDepress: false,
                toggleGroup : 'imgAdvWrapGroup'
            });
            this.btnWrapTopBottom.on('click', _.bind(this.onBtnWrapClick, this));

            this.btnWrapBehind = new Common.UI.Button({
                parentEl: $('#image-advanced-button-wrap-behind'),
                cls: 'btn-options huge-1',
                iconCls: 'icon-advanced-wrap options__icon options__icon-huge btn-wrap-behind',
                posId: Asc.c_oAscWrapStyle2.Behind,
                hint: this.textWrapBehindTooltip,
                enableToggle: true,
                allowDepress: false,
                toggleGroup : 'imgAdvWrapGroup'
            });
            this.btnWrapBehind.on('click', _.bind(this.onBtnWrapClick, this));

            this.btnWrapInFront = new Common.UI.Button({
                parentEl: $('#image-advanced-button-wrap-infront'),
                cls: 'btn-options huge-1',
                iconCls: 'icon-advanced-wrap options__icon options__icon-huge btn-wrap-infront',
                posId: Asc.c_oAscWrapStyle2.InFront,
                hint: this.textWrapInFrontTooltip,
                enableToggle: true,
                allowDepress: false,
                toggleGroup : 'imgAdvWrapGroup'
            });
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
                data: this._arrHAlign,
                takeFocusOnClose: true
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
                data: this._arrHRelative,
                takeFocusOnClose: true
            });
            this.cmbHRelative.setValue(this._state.HAlignFrom);
            this.cmbHRelative.on('selected', _.bind(this.onHRelativeSelect, this));

            this.cmbHPosition = new Common.UI.ComboBox({
                el: $('#image-combo-hposition'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 115px;',
                editable: false,
                data: this._arrHRelative,
                takeFocusOnClose: true
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
                data: this._arrHRelativePc,
                takeFocusOnClose: true
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
                data: this._arrVAlign,
                takeFocusOnClose: true
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
                data: this._arrVRelative,
                takeFocusOnClose: true
            });
            this.cmbVRelative.setValue(this._state.VAlignFrom);
            this.cmbVRelative.on('selected', _.bind(this.onVRelativeSelect, this));

            this.cmbVPosition = new Common.UI.ComboBox({
                el: $('#image-combo-vposition'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 115px;',
                editable: false,
                data: this._arrVRelative,
                takeFocusOnClose: true
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
                data: this._arrVRelativePc,
                takeFocusOnClose: true
            });
            this.cmbVPositionPc.setDisabled(true);
            this.cmbVPositionPc.setValue(this._state.VPositionPcFrom);
            this.cmbVPositionPc.on('selected', _.bind(this.onVPositionPcSelect, this));

            this.radioHAlign = new Common.UI.RadioBox({
                el: $('#image-radio-halign'),
                name: 'asc-radio-horizontal',
                checked: true,
                ariaLabel: this.textHorizontal + ' ' + this.textAlignment
            });
            this.radioHAlign.on('change', _.bind(this.onRadioHAlignChange, this));

            this.radioHPosition = new Common.UI.RadioBox({
                el: $('#image-radio-hposition'),
                name: 'asc-radio-horizontal',
                ariaLabel: this.textHorizontal + ' ' + this.textPosition
            });
            this.radioHPosition.on('change', _.bind(this.onRadioHPositionChange, this));

            this.radioHPositionPc = new Common.UI.RadioBox({
                el: $('#image-radio-hpositionpc'),
                name: 'asc-radio-horizontal',
                ariaLabel: this.textHorizontal + ' ' + this.textPositionPc
            });
            this.radioHPositionPc.on('change', _.bind(this.onRadioHPositionPcChange, this));

            this.radioVAlign = new Common.UI.RadioBox({
                el: $('#image-radio-valign'),
                name: 'asc-radio-vertical',
                checked: true,
                ariaLabel: this.textVertical + ' ' + this.textAlignment
            });
            this.radioVAlign.on('change', _.bind(this.onRadioVAlignChange, this));

            this.radioVPosition = new Common.UI.RadioBox({
                el: $('#image-radio-vposition'),
                name: 'asc-radio-vertical',
                ariaLabel: this.textVertical + ' ' + this.textPosition
            });
            this.radioVPosition.on('change', _.bind(this.onRadioVPositionChange, this));

            this.radioVPositionPc = new Common.UI.RadioBox({
                el: $('#image-radio-vpositionpc'),
                name: 'asc-radio-vertical',
                ariaLabel: this.textVertical + ' ' + this.textPositionPc
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

            this.chAutofit = new Common.UI.CheckBox({
                el: $('#shape-checkbox-autofit'),
                labelText: this.textResizeFit
            });
            this.chAutofit.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedShapeProps) {
                    this._changedShapeProps.asc_putTextFitType(field.getValue()=='checked' ? AscFormat.text_fit_Auto : AscFormat.text_fit_No);
                }
            }, this));

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
                data: this._arrJoinType,
                takeFocusOnClose: true
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

            if (this.isChart) {

                // Chart
                this.cmbChartTitle = new Common.UI.ComboBox({
                    el: $('#chart-dlg-combo-chart-title'),
                    menuStyle: 'min-width: 100%;',
                    editable: false,
                    cls: 'input-group-nr',
                    data: [
                        {value: Asc.c_oAscChartTitleShowSettings.none, displayValue: this.textNone},
                        {value: Asc.c_oAscChartTitleShowSettings.overlay, displayValue: this.textOverlay},
                        {value: Asc.c_oAscChartTitleShowSettings.noOverlay, displayValue: this.textNoOverlay}
                    ],
                    takeFocusOnClose: true
                });

                this.cmbLegendPos = new Common.UI.ComboBox({
                    el: $('#chart-dlg-combo-legend-pos'),
                    menuStyle: 'min-width: 100%;',
                    editable: false,
                    cls: 'input-group-nr',
                    data: [
                        {value: Asc.c_oAscChartLegendShowSettings.none, displayValue: this.textNone},
                        {value: Asc.c_oAscChartLegendShowSettings.bottom, displayValue: this.textLegendBottom},
                        {value: Asc.c_oAscChartLegendShowSettings.top, displayValue: this.textLegendTop},
                        {value: Asc.c_oAscChartLegendShowSettings.right, displayValue: this.textLegendRight},
                        {value: Asc.c_oAscChartLegendShowSettings.left, displayValue: this.textLegendLeft},
                        {value: Asc.c_oAscChartLegendShowSettings.leftOverlay, displayValue: this.textLeftOverlay},
                        {value: Asc.c_oAscChartLegendShowSettings.rightOverlay, displayValue: this.textRightOverlay}
                    ],
                    takeFocusOnClose: true
                });

                this.cmbDataLabels = new Common.UI.ComboBox({
                    el: $('#chart-dlg-combo-data-labels'),
                    menuStyle: 'min-width: 100%;',
                    editable: false,
                    cls: 'input-group-nr',
                    data: [
                        {value: Asc.c_oAscChartDataLabelsPos.none, displayValue: this.textNone},
                        {value: Asc.c_oAscChartDataLabelsPos.ctr, displayValue: this.textCenter},
                        {value: Asc.c_oAscChartDataLabelsPos.inBase, displayValue: this.textInnerBottom},
                        {value: Asc.c_oAscChartDataLabelsPos.inEnd, displayValue: this.textInnerTop},
                        {value: Asc.c_oAscChartDataLabelsPos.outEnd, displayValue: this.textOuterTop}
                    ],
                    takeFocusOnClose: true
                });

                this.cmbDataLabels.on('selected', _.bind(me.onSelectDataLabels, this));

                this.txtSeparator = new Common.UI.InputField({
                    el: $('#chart-dlg-txt-separator'),
                    name: 'range',
                    style: 'width: 100%;',
                    allowBlank: true,
                    blankError: this.txtEmpty
                });

                this.chSeriesName = new Common.UI.CheckBox({
                    el: $('#chart-dlg-check-series'),
                    labelText: this.textSeriesName
                });

                this.chCategoryName = new Common.UI.CheckBox({
                    el: $('#chart-dlg-check-category'),
                    labelText: this.textCategoryName
                });

                this.chValue = new Common.UI.CheckBox({
                    el: $('#chart-dlg-check-value'),
                    labelText: this.textValue
                });

                this.cmbLines = new Common.UI.ComboBox({
                    el: $('#chart-dlg-combo-lines'),
                    menuStyle: 'min-width: 100%;',
                    editable: false,
                    cls: 'input-group-nr',
                    data: [
                        {value: 0, displayValue: this.textNone},
                        {value: 1, displayValue: this.textStraight},
                        {value: 2, displayValue: this.textSmooth}
                    ],
                    takeFocusOnClose: true
                }).on('selected', _.bind(function (combo, record) {
                    if (this.chartSettings) {
                        this.chartSettings.putLine(record.value !== 0);
                        if (record.value > 0)
                            this.chartSettings.putSmooth(record.value == 2);
                    }
                }, this));

                this.chMarkers = new Common.UI.CheckBox({
                    el: $('#chart-dlg-check-markers'),
                    labelText: this.textMarkers
                }).on('change', _.bind(function (checkbox, state) {
                    if (this.chartSettings)
                        this.chartSettings.putShowMarker(state == 'checked');
                }, this));

                this.lblLines = $('#chart-dlg-label-lines');

                // Vertical Axis
                this.cmbMinType = [];
                this.spnMinValue = [];
                this.cmbMaxType = [];
                this.spnMaxValue = [];
                this.cmbVCrossType = [];
                this.spnVAxisCrosses = [];
                this.cmbUnits = [];
                this.chVReverse = [];
                this.cmbVMajorType = [];
                this.cmbVMinorType = [];
                this.cmbVLabelPos = [];
                this.cmbVertTitle = [];
                this.cmbVertGrid = [];
                this.chVertHide = [];
                this.btnVFormat = [];
                this.chVLogScale = [];
                this.spnBase = [];

                this._arrVertTitle = [
                    {value: Asc.c_oAscChartVertAxisLabelShowSettings.none, displayValue: me.textNone},
                    {value: Asc.c_oAscChartVertAxisLabelShowSettings.rotated, displayValue: me.textRotated},
                    {value: Asc.c_oAscChartVertAxisLabelShowSettings.horizontal, displayValue: me.textHorizontal}
                ];

                // Horizontal Axis
                this.cmbHCrossType = [];
                this.cmbAxisPos = [];
                this.spnHAxisCrosses = [];
                this.chHReverse = [];
                this.cmbHMajorType = [];
                this.cmbHMinorType = [];
                this.spnMarksInterval = [];
                this.cmbHLabelPos = [];
                this.spnLabelDist = [];
                this.cmbLabelInterval = [];
                this.spnLabelInterval = [];
                this.cmbHorTitle = [];
                this.cmbHorGrid = [];
                this.chHorHide = [];
                this.btnHFormat = [];

                this._arrHorTitle = [
                    {value: Asc.c_oAscChartHorAxisLabelShowSettings.none, displayValue: me.textNone},
                    {value: Asc.c_oAscChartHorAxisLabelShowSettings.noOverlay, displayValue: me.textNoOverlay}
                ];
            }

            this.afterRender();
        },

        onCategoryClick: function(btn, index) {
            Common.Views.AdvancedSettingsWindow.prototype.onCategoryClick.call(this, btn, index);

            var me = this;
            setTimeout(function(){
                switch (index) {
                    case 0:
                        me.cmbChartTitle.focus();
                        break;
                    case 1:
                    case 2:
                        index -= 1;
                        var ctrlIndex = me.vertAxisPropsIndexes[index];
                        me.onVCategoryClick(index);
                        (me.vertAxisProps[index].getAxisType()===Asc.c_oAscAxisType.val) ? me.cmbMinType[ctrlIndex].focus() : (me.cmbHCrossType[ctrlIndex].isDisabled() ? me.btnHFormat[ctrlIndex].focus() : me.cmbHCrossType[ctrlIndex].focus() );
                        break;
                    case 3:
                    case 4:
                        index -= 3;
                        var ctrlIndex = me.horAxisPropsIndexes[index];
                        me.onHCategoryClick(index);
                        (me.horAxisProps[index].getAxisType()===Asc.c_oAscAxisType.val) ? me.cmbMinType[ctrlIndex].focus() : (me.cmbHCrossType[ctrlIndex].isDisabled() ? me.btnHFormat[ctrlIndex].focus() : me.cmbHCrossType[ctrlIndex].focus());
                        break;
                    case 5:
                        me.spnWidth.focus();
                        break;
                    case 6:
                        if (!me.spnShapeWidth.isDisabled())
                            me.spnShapeWidth.focus();
                        else
                            me.spnShapeWidthPc.focus();
                        break;
                    case 7:
                        me.spnAngle.focus();
                        break;
                    case 8:
                        if (!me.spnTop.isDisabled())
                            me.spnTop.focus();
                        else if (!me.spnLeft.isDisabled())
                            me.spnLeft.focus();
                        else if (!me.btnWrapInline.isDisabled())
                            me.btnWrapInline.focus();
                        break;
                    case 9:
                        if (!me.cmbHAlign.isDisabled())
                            me.cmbHAlign.focus();
                        else if (!me.spnX.isDisabled())
                            me.spnX.focus();
                        else
                            me.spnXPc.focus();
                        break;
                    case 10:
                        me.cmbCapType.focus();
                        break;
                    case 11:
                        me.chAutofit.focus();
                        break;
                    case 12:
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
                value = this.getActiveCategory();
                if (value==1 || value==2) this.onVCategoryClick(value-1);
                else if (value==3 || value==4) this.onHCategoryClick(value-3);
            }
        },

        _setDefaults: function(props) {
            Common.UI.FocusManager.add(this, this.btnsCategory);
            if (props ){
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
                var pluginGuid = props.asc_getPluginGuid();
                var control_props = this.api && this.api.asc_IsContentControl() ? this.api.asc_GetContentControlProperties() : null,
                    fixed_size = false;
                if (control_props) {
                    var spectype = control_props.get_SpecificType();
                    fixed_size = (spectype==Asc.c_oAscContentControlSpecificType.CheckBox || spectype==Asc.c_oAscContentControlSpecificType.ComboBox ||
                                spectype==Asc.c_oAscContentControlSpecificType.DropDownList || spectype==Asc.c_oAscContentControlSpecificType.None ||
                                spectype==Asc.c_oAscContentControlSpecificType.Picture || spectype==Asc.c_oAscContentControlSpecificType.Complex ||
                                spectype==Asc.c_oAscContentControlSpecificType.DateTime || spectype==Asc.c_oAscContentControlSpecificType.Signature) &&
                                control_props.get_FormPr() && control_props.get_FormPr().get_Fixed();
                }

                this.isShape = !!shapeprops;
                this.btnOriginalSize.setVisible(!(this.isShape || this.isChart));
                this.btnOriginalSize.setDisabled(props.get_ImageUrl()===null || props.get_ImageUrl()===undefined);
                this.btnsCategory[10].setVisible(this.isShape && !shapeprops.get_FromChart() && !fixed_size);   // Shapes
                this.btnsCategory[11].setVisible(this.isShape && !shapeprops.get_FromChart() && !fixed_size);   // Margins
                this.btnsCategory[12].setVisible(!fixed_size);   // Alt
                this.btnsCategory[7].setVisible(!this.isChart && (pluginGuid === null || pluginGuid === undefined)); // Rotation
                this.btnsCategory[8].setDisabled(props.get_FromGroup() || !!control_props && (control_props.get_SpecificType()==Asc.c_oAscContentControlSpecificType.Picture) && !control_props.get_FormPr()); // Wrapping
                this.btnsCategory[5].setVisible(!this.isShape && !this.isChart);
                this.btnsCategory[6].setVisible(this.isShape && !this.isChart);
                for (var i=0; i<5; i++) {
                    this.btnsCategory[i].setVisible(this.isChart);
                }

                if (shapeprops) {
                    this._setShapeDefaults(shapeprops);
                    this.setTitle(this.textTitleShape);
                    value = props.asc_getLockAspect();
                    this.chRatio.setValue(value || this._isSmartArt, true); // can resize smart art only proportionately

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
                    this.chRatio.setDisabled(this.radioVSizePc.getValue() || this.radioHSizePc.getValue() || this._isSmartArt);

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

                    this.chAutofit.setValue(shapeprops.asc_getTextFitType()==AscFormat.text_fit_Auto);

                    this.btnsCategory[11].setDisabled(null === margins);   // Margins
                    this.btnsCategory[10].setDisabled(shapeprops.get_stroke().get_type() == Asc.c_oAscStrokeType.STROKE_NONE);   // Weights & Arrows

                } else if (this.isChart) {
                    this._setChartDefaults(this.chartSettings);
                    this.setTitle(this.textTitleChart);
                } else {
                    this.setTitle(this.textTitle);
                    value = props.asc_getLockAspect();
                    this.btnRatio.toggle(value);

                    this.spnWidth.setMaxValue(this.sizeMax.width);
                    this.spnHeight.setMaxValue(this.sizeMax.height);
                    value = props.get_Width();
                    this.spnWidth.setValue((value!==undefined) ? Common.Utils.Metric.fnRecalcFromMM(value).toFixed(2) : '', true);
                    value = props.get_Height();
                    this.spnHeight.setValue((value!==undefined) ? Common.Utils.Metric.fnRecalcFromMM(value).toFixed(2) : '', true);
                }

                if (!this.isChart) {
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

                Common.UI.FocusManager.add(this, [this.spnWidth, this.btnRatio, this.spnHeight, this.btnOriginalSize, // 6 tab
                    this.radioHSize, this.spnShapeWidth , this.spnShapeWidthPc, this.radioHSizePc, this.cmbWidthPc,
                    this.radioVSize, this.spnShapeHeight, this.spnShapeHeightPc, this.radioVSizePc, this.cmbHeightPc, this.chRatio, // 7 tab
                    this.spnAngle, this.chFlipHor, this.chFlipVert, // 8 tab
                    this.btnWrapInline, this.btnWrapSquare, this.btnWrapTight, this.btnWrapThrough, this.btnWrapTopBottom, this.btnWrapInFront, this.btnWrapBehind,
                    this.spnTop, this.spnLeft, this.spnBottom, this.spnRight, // 9 tab
                    this.radioHAlign, this.radioHPosition, this.radioHPositionPc, this.cmbHAlign , this.cmbHRelative, this.spnX, this.cmbHPosition, this.spnXPc, this.cmbHPositionPc,
                    this.radioVAlign, this.radioVPosition, this.radioVPositionPc, this.cmbVAlign , this.cmbVRelative, this.spnY, this.cmbVPosition, this.spnYPc, this.cmbVPositionPc, this.chMove, this.chOverlap, // 10 tab
                    this.cmbCapType, this.cmbJoinType, this.btnBeginStyle, this.btnEndStyle, this.btnBeginSize, this.btnEndSize, // 11 tab
                    this.chAutofit, this.spnMarginTop, this.spnMarginLeft, this.spnMarginBottom, this.spnMarginRight, // 12 tab
                    this.inputAltTitle, this.textareaAltDescription ]); // 13 tab
            }
            Common.UI.FocusManager.add(this, this.getFooterButtons());
        },

        getSettings: function() {
            var properties = this._changedProps;

            if (this.isShape) {
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

            if (!this.isChart) {
                properties.asc_putRot(this.spnAngle.getNumberValue() * 3.14159265358979 / 180);
                properties.asc_putFlipH(this.chFlipHor.getValue() == 'checked');
                properties.asc_putFlipV(this.chFlipVert.getValue() == 'checked');
            } else {
                var type = this.currentChartType;
                this.chartSettings.putType(type);

                this.chartSettings.putTitle(this.cmbChartTitle.getValue());
                this.chartSettings.putLegendPos(this.cmbLegendPos.getValue());

                this.chartSettings.putDataLabelsPos(this.cmbDataLabels.getValue());

                this.chartSettings.putShowSerName(this.chSeriesName.getValue()=='checked');
                this.chartSettings.putShowCatName(this.chCategoryName.getValue()=='checked');
                this.chartSettings.putShowVal(this.chValue.getValue()=='checked');

                this.chartSettings.putSeparator(_.isEmpty(this.txtSeparator.getValue()) ? ' ' : this.txtSeparator.getValue());

                this.chMarkers.isVisible() && this.chartSettings.putShowMarker(this.chMarkers.getValue()=='checked');

                var value = (type == Asc.c_oAscChartTypeSettings.lineNormal || type == Asc.c_oAscChartTypeSettings.lineStacked ||
                    type == Asc.c_oAscChartTypeSettings.lineStackedPer || type == Asc.c_oAscChartTypeSettings.lineNormalMarker ||
                    type == Asc.c_oAscChartTypeSettings.lineStackedMarker || type == Asc.c_oAscChartTypeSettings.lineStackedPerMarker ||
                    type == Asc.c_oAscChartTypeSettings.scatter  || type == Asc.c_oAscChartTypeSettings.scatterSmoothMarker || type == Asc.c_oAscChartTypeSettings.scatterSmooth ||
                    type == Asc.c_oAscChartTypeSettings.scatterLineMarker || type == Asc.c_oAscChartTypeSettings.scatterLine);
                if (value) {
                    value = this.cmbLines.getValue();
                    this.chartSettings.putLine(value!==0);
                    if (value>0)
                        this.chartSettings.putSmooth(value==2);
                }
                properties.asc_putChartProperties(this.chartSettings);
            }

            if (this.isAltTitleChanged)
                properties.asc_putTitle(this.inputAltTitle.getValue());

            if (this.isAltDescChanged)
                properties.asc_putDescription(this.textareaAltDescription.val());

            return { imageProps: properties} ;
        },

        _setShapeDefaults: function(props) {
            if (props ){
                if (props.get_FromSmartArt()) {
                    this.radioHSizePc.setDisabled(true);
                    this.radioVSizePc.setDisabled(true);
                    this.btnsCategory[7].setDisabled(true);
                    this._isSmartArt = true;
                }
                if (props.get_FromSmartArtInternal()) {
                    this.chAutofit.setDisabled(true);
                    this.chFlipHor.setDisabled(true);
                    this.chFlipVert.setDisabled(true);
                    this.btnsCategory[6].setDisabled(true);
                }

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
            this._changedShapeProps = new Asc.asc_CShapeProperty();
        },

        _setChartDefaults: function(props) {
            if (!props) return;

            this._state.ChartType = props.getType();

            // Layout

            this.cmbChartTitle.setValue(props.getTitle());
            this.cmbLegendPos.setValue(props.getLegendPos());

            this.updateDataLabels(this._state.ChartType, props.getDataLabelsPos());
            this.cmbDataLabels.setDisabled(this._state.ChartType==Asc.c_oAscChartTypeSettings.surfaceNormal ||
                this._state.ChartType == Asc.c_oAscChartTypeSettings.surfaceWireframe);

            this.chSeriesName.setValue(this.chartSettings.getShowSerName(), true);
            this.chCategoryName.setValue(this.chartSettings.getShowCatName(), true);
            this.chValue.setValue(this.chartSettings.getShowVal(), true);

            var value = props.getSeparator();
            this.txtSeparator.setValue((value) ? value : '');

            Common.UI.FocusManager.add(this, [this.cmbChartTitle, this.cmbLegendPos, this.cmbDataLabels, this.chSeriesName, this.chCategoryName, this.chValue, this.txtSeparator, this.cmbLines, this.chMarkers]);

            // Vertical Axis
            this.vertAxisProps = props.getVertAxesProps();
            if (this.vertAxisProps.length>0) {
                var el = this.$window.find('#id-chart-settings-dlg-vert');
                this.vertAxisPropsIndexes[0] = (this.vertAxisProps[0].getAxisType()===Asc.c_oAscAxisType.val) ? this.addControlsV(el) : this.addControlsH(el);
            }
            if (this.vertAxisProps.length>1) {
                var el = this.$window.find('#id-chart-settings-dlg-vert-sec');
                this.vertAxisPropsIndexes[1] = (this.vertAxisProps[1].getAxisType()===Asc.c_oAscAxisType.val) ? this.addControlsV(el) : this.addControlsH(el);
            }

            // Horizontal Axis
            this.horAxisProps = props.getHorAxesProps();
            if (this.horAxisProps.length>0) {
                var el = this.$window.find('#id-chart-settings-dlg-hor');
                this.horAxisPropsIndexes[0] = (this.horAxisProps[0].getAxisType()===Asc.c_oAscAxisType.val) ? this.addControlsV(el) : this.addControlsH(el);
            }
            if (this.horAxisProps.length>1) {
                var el = this.$window.find('#id-chart-settings-dlg-hor-sec');
                this.horAxisPropsIndexes[1] = (this.horAxisProps[1].getAxisType()===Asc.c_oAscAxisType.val) ? this.addControlsV(el) : this.addControlsH(el);
            }
            this.updateAxisProps(this._state.ChartType);
            this.currentChartType = this._state.ChartType;
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

            this.btnsCategory[9].setDisabled(btnId == Asc.c_oAscWrapStyle2.Inline);
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
                this.cmbHAlign.focus();
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
                this.spnX.focus();
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
                this.spnXPc.focus();
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
                this.cmbVAlign.focus();
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
                this.spnY.focus();
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
                this.spnYPc.focus();
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
                this.spnShapeWidth.focus();
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
                this.spnShapeWidthPc.focus();
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
                this.spnShapeHeight.focus();
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
                this.spnShapeHeightPc.focus();
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

        onSelectBeginStyle: function(combo, picker, view, record, e){
            if (this._changedShapeProps) {
                if (this._changedShapeProps.get_stroke()===null)
                    this._changedShapeProps.put_stroke(new Asc.asc_CStroke());

                this._changedShapeProps.get_stroke().put_linebeginstyle(record.get('type'));
            }
            if (this._beginSizeIdx===null || this._beginSizeIdx===undefined)
                this._beginSizeIdx = 4;
            this._updateSizeArr(this.btnBeginSize, this.mnuBeginSizePicker, record, this._beginSizeIdx);
        },

        onSelectBeginSize: function(combo, picker, view, record, e){
            if (this._changedShapeProps) {
                if (this._changedShapeProps.get_stroke()===null)
                    this._changedShapeProps.put_stroke(new Asc.asc_CStroke());

                this._changedShapeProps.get_stroke().put_linebeginsize(record.get('type'));
            }
            this._beginSizeIdx = record.get('value');
        },

        onSelectEndStyle: function(combo, picker, view, record, e){
            if (this._changedShapeProps) {
                if (this._changedShapeProps.get_stroke()===null)
                    this._changedShapeProps.put_stroke(new Asc.asc_CStroke());

                this._changedShapeProps.get_stroke().put_lineendstyle(record.get('type'));
            }
            if (this._endSizeIdx===null || this._endSizeIdx===undefined)
                this._endSizeIdx = 4;
            this._updateSizeArr(this.btnEndSize, this.mnuEndSizePicker, record, this._endSizeIdx);
        },

        onSelectEndSize: function(combo, picker, view, record, e){
            if (this._changedShapeProps) {
                if (this._changedShapeProps.get_stroke()===null)
                    this._changedShapeProps.put_stroke(new Asc.asc_CStroke());

                this._changedShapeProps.get_stroke().put_lineendsize(record.get('type'));
            }
            this._endSizeIdx = record.get('value');
        },

        addControlsV: function(parentEl) {
            var me = this,
                i = me.chVertHide.length,
                el = $(_.template(vertTemplate)({
                    scope: me,
                    idx: i
                }));
            parentEl.append(el);

            me.chVertHide[i] = new Common.UI.CheckBox({
                el: $('#chart-dlg-chk-vert-hide-' + i),
                labelText: me.textHideAxis
            }).on('change', _.bind(function (checkbox, state) {
                if (me.currentAxisProps[i])
                    me.currentAxisProps[i].putShow(state !== 'checked');
            }, me));
            Common.UI.FocusManager.add(this, me.chVertHide[i]);

            me.cmbVertTitle[i] = new Common.UI.ComboBox({
                el: $('#chart-dlg-combo-vert-title-' + i),
                menuStyle: 'min-width: 100%;',
                editable: false,
                cls: 'input-group-nr',
                data: me._arrVertTitle,
                takeFocusOnClose: true
            }).on('selected', _.bind(function (combo, record) {
                if (me.currentAxisProps[i])
                    me.currentAxisProps[i].putLabel(record.value);
            }, me));
            Common.UI.FocusManager.add(this, me.cmbVertTitle[i]);

            me.cmbVertGrid[i] = new Common.UI.ComboBox({
                el: $('#chart-dlg-combo-vert-grid-' + i),
                menuStyle: 'min-width: 100%;',
                editable: false,
                cls: 'input-group-nr',
                data: [
                    {value: Asc.c_oAscGridLinesSettings.none, displayValue: me.textNone},
                    {value: Asc.c_oAscGridLinesSettings.major, displayValue: me.textMajor},
                    {value: Asc.c_oAscGridLinesSettings.minor, displayValue: me.textMinor},
                    {value: Asc.c_oAscGridLinesSettings.majorMinor, displayValue: me.textMajorMinor}
                ],
                takeFocusOnClose: true
            }).on('selected', _.bind(function (combo, record) {
                if (me.currentAxisProps[i])
                    me.currentAxisProps[i].putGridlines(record.value);
            }, me));
            Common.UI.FocusManager.add(this, me.cmbVertGrid[i]);

            me.cmbMinType[i] = new Common.UI.ComboBox({
                el: $('#chart-dlg-combo-mintype-' + i),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: [
                    {displayValue: me.textAuto, value: Asc.c_oAscValAxisRule.auto},
                    {displayValue: me.textFixed, value: Asc.c_oAscValAxisRule.fixed}
                ],
                takeFocusOnClose: true
            }).on('selected', _.bind(function (combo, record) {
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putMinValRule(record.value);
                    if (record.value == Asc.c_oAscValAxisRule.auto) {
                        me.spnMinValue[i].setValue(me._originalAxisVValues[i].minAuto, true);
                    }
                }
            }, me));
            Common.UI.FocusManager.add(this, me.cmbMinType[i]);

            me.spnMinValue[i] = new Common.UI.MetricSpinner({
                el: $('#chart-dlg-input-min-value-' + i),
                maxValue: 1000000,
                minValue: -1000000,
                step: 0.1,
                defaultUnit: "",
                defaultValue: 0,
                value: ''
            }).on('change', _.bind(function (field, newValue, oldValue) {
                me.cmbMinType[i].suspendEvents();
                me.cmbMinType[i].setValue(Asc.c_oAscValAxisRule.fixed);
                me.cmbMinType[i].resumeEvents();
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putMinValRule(Asc.c_oAscValAxisRule.fixed);
                    me.currentAxisProps[i].putMinVal(field.getNumberValue());
                }
            }, me));
            Common.UI.FocusManager.add(this, me.spnMinValue[i]);

            me.cmbMaxType[i] = new Common.UI.ComboBox({
                el: $('#chart-dlg-combo-maxtype-' + i),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: [
                    {displayValue: me.textAuto, value: Asc.c_oAscValAxisRule.auto},
                    {displayValue: me.textFixed, value: Asc.c_oAscValAxisRule.fixed}
                ],
                takeFocusOnClose: true
            }).on('selected', _.bind(function (combo, record) {
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putMaxValRule(record.value);
                    if (record.value == Asc.c_oAscValAxisRule.auto) {
                        me.spnMaxValue[i].setValue(me._originalAxisVValues[i].maxAuto, true);
                    }
                }
            }, me));
            Common.UI.FocusManager.add(this, me.cmbMaxType[i]);

            me.spnMaxValue[i] = new Common.UI.MetricSpinner({
                el: $('#chart-dlg-input-max-value-' + i),
                maxValue: 1000000,
                minValue: -1000000,
                step: 0.1,
                defaultUnit: "",
                defaultValue: 0,
                value: ''
            }).on('change', _.bind(function (field, newValue, oldValue) {
                me.cmbMaxType[i].suspendEvents();
                me.cmbMaxType[i].setValue(Asc.c_oAscValAxisRule.fixed);
                me.cmbMaxType[i].resumeEvents();
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putMaxValRule(Asc.c_oAscValAxisRule.fixed);
                    me.currentAxisProps[i].putMaxVal(field.getNumberValue());
                }
            }, me));
            Common.UI.FocusManager.add(this, me.spnMaxValue[i]);

            me.cmbVCrossType[i] = new Common.UI.ComboBox({
                el: $('#chart-dlg-combo-v-crosstype-' + i),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: [
                    {displayValue: me.textAuto, value: Asc.c_oAscCrossesRule.auto},
                    {displayValue: me.textValue, value: Asc.c_oAscCrossesRule.value},
                    {displayValue: me.textMinValue, value: Asc.c_oAscCrossesRule.minValue},
                    {displayValue: me.textMaxValue, value: Asc.c_oAscCrossesRule.maxValue}
                ],
                takeFocusOnClose: true
            }).on('selected', _.bind(function (combo, record) {
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putCrossesRule(record.value);
                    var value;
                    switch (record.value) {
                        case Asc.c_oAscCrossesRule.minValue:
                            me.spnVAxisCrosses[i].setValue(me.spnMinValue[i].getNumberValue(), true);
                            break;
                        case Asc.c_oAscCrossesRule.maxValue:
                            me.spnVAxisCrosses[i].setValue(me.spnMaxValue[i].getNumberValue(), true);
                            break;
                        case Asc.c_oAscCrossesRule.auto:
                            me.spnVAxisCrosses[i].setValue(me._originalAxisVValues[i].crossesAuto, true);
                            break;
                    }
                }
            }, me));
            Common.UI.FocusManager.add(this, me.cmbVCrossType[i]);

            me.spnVAxisCrosses[i] = new Common.UI.MetricSpinner({
                el: $('#chart-dlg-input-v-axis-crosses-' + i),
                maxValue: 1000000,
                minValue: -1000000,
                step: 0.1,
                defaultUnit: "",
                defaultValue: 0,
                value: ''
            }).on('change', _.bind(function (field, newValue, oldValue) {
                me.cmbVCrossType[i].suspendEvents();
                me.cmbVCrossType[i].setValue(Asc.c_oAscCrossesRule.value);
                me.cmbVCrossType[i].resumeEvents();
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putCrossesRule(Asc.c_oAscCrossesRule.value);
                    me.currentAxisProps[i].putCrosses(field.getNumberValue());
                }
            }, me));
            Common.UI.FocusManager.add(this, me.spnVAxisCrosses[i]);

            me.cmbUnits[i] = new Common.UI.ComboBox({
                el: $('#chart-dlg-combo-units-' + i),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: [
                    {displayValue: me.textNone, value: Asc.c_oAscValAxUnits.none},
                    {displayValue: me.textHundreds, value: Asc.c_oAscValAxUnits.HUNDREDS},
                    {displayValue: me.textThousands, value: Asc.c_oAscValAxUnits.THOUSANDS},
                    {displayValue: me.textTenThousands, value: Asc.c_oAscValAxUnits.TEN_THOUSANDS},
                    {displayValue: me.textHundredThousands, value: Asc.c_oAscValAxUnits.HUNDRED_THOUSANDS},
                    {displayValue: me.textMillions, value: Asc.c_oAscValAxUnits.MILLIONS},
                    {displayValue: me.textTenMillions, value: Asc.c_oAscValAxUnits.TEN_MILLIONS},
                    {displayValue: me.textHundredMil, value: Asc.c_oAscValAxUnits.HUNDRED_MILLIONS},
                    {displayValue: me.textBillions, value: Asc.c_oAscValAxUnits.BILLIONS},
                    {displayValue: me.textTrillions, value: Asc.c_oAscValAxUnits.TRILLIONS}
                ],
                takeFocusOnClose: true
            }).on('selected', _.bind(function (combo, record) {
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putDispUnitsRule(record.value);
                }
            }, me));
            Common.UI.FocusManager.add(this, me.cmbUnits[i]);

            me.chVReverse[i] = new Common.UI.CheckBox({
                el: $('#chart-dlg-check-v-reverse-' + i),
                labelText: me.textReverse
            }).on('change', _.bind(function (checkbox, state) {
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putInvertValOrder(state == 'checked');
                }
            }, me));
            Common.UI.FocusManager.add(this, me.chVReverse[i]);

            me.cmbVMajorType[i] = new Common.UI.ComboBox({
                el: $('#chart-dlg-combo-v-major-type-' + i),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: [
                    {displayValue: me.textNone, value: Asc.c_oAscTickMark.TICK_MARK_NONE},
                    {displayValue: me.textCross, value: Asc.c_oAscTickMark.TICK_MARK_CROSS},
                    {displayValue: me.textIn, value: Asc.c_oAscTickMark.TICK_MARK_IN},
                    {displayValue: me.textOut, value: Asc.c_oAscTickMark.TICK_MARK_OUT}
                ],
                takeFocusOnClose: true
            }).on('selected', _.bind(function (combo, record) {
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putMajorTickMark(record.value);
                }
            }, me));
            Common.UI.FocusManager.add(this, me.cmbVMajorType[i]);

            me.cmbVMinorType[i] = new Common.UI.ComboBox({
                el: $('#chart-dlg-combo-v-minor-type-' + i),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: [
                    {displayValue: me.textNone, value: Asc.c_oAscTickMark.TICK_MARK_NONE},
                    {displayValue: me.textCross, value: Asc.c_oAscTickMark.TICK_MARK_CROSS},
                    {displayValue: me.textIn, value: Asc.c_oAscTickMark.TICK_MARK_IN},
                    {displayValue: me.textOut, value: Asc.c_oAscTickMark.TICK_MARK_OUT}
                ],
                takeFocusOnClose: true
            }).on('selected', _.bind(function (combo, record) {
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putMinorTickMark(record.value);
                }
            }, me));
            Common.UI.FocusManager.add(this, me.cmbVMinorType[i]);

            me.cmbVLabelPos[i] = new Common.UI.ComboBox({
                el: $('#chart-dlg-combo-v-label-pos-' + i),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: [
                    {displayValue: me.textNone, value: Asc.c_oAscTickLabelsPos.TICK_LABEL_POSITION_NONE},
                    {displayValue: me.textLow, value: Asc.c_oAscTickLabelsPos.TICK_LABEL_POSITION_LOW},
                    {displayValue: me.textHigh, value: Asc.c_oAscTickLabelsPos.TICK_LABEL_POSITION_HIGH},
                    {displayValue: me.textNextToAxis, value: Asc.c_oAscTickLabelsPos.TICK_LABEL_POSITION_NEXT_TO}
                ],
                takeFocusOnClose: true
            }).on('selected', _.bind(function (combo, record) {
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putTickLabelsPos(record.value);
                }
            }, me));
            Common.UI.FocusManager.add(this, me.cmbVLabelPos[i]);

            me.btnVFormat[i] = new Common.UI.Button({
                el: $('#chart-dlg-btn-v-format-' + i)
            }).on('click', _.bind(me.openFormat, me, i));
            Common.UI.FocusManager.add(this, me.btnVFormat[i]);

            me.chVLogScale[i] = new Common.UI.CheckBox({
                el: $('#chart-dlg-check-v-logscale-' + i),
                labelText: me.textLogScale
            }).on('change', _.bind(function (checkbox, state) {
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putLogScale(state == 'checked');
                    (state == 'checked') && me.currentAxisProps[i].putLogBase(me.spnBase[i].getNumberValue());
                }
                me.spnBase[i].setDisabled((state !== 'checked'));
            }, me));
            Common.UI.FocusManager.add(this, me.chVLogScale[i]);

            me.spnBase[i] = new Common.UI.MetricSpinner({
                el: $('#chart-dlg-input-base-' + i),
                maxValue: 1000,
                minValue: 2,
                step: 1,
                defaultUnit: "",
                value: 10
            }).on('change', _.bind(function (field, newValue, oldValue) {
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putLogBase(field.getNumberValue());
                }
            }, me));
            Common.UI.FocusManager.add(this, me.spnBase[i]);

            return i;
        },

        addControlsH: function(parentEl) {
            var me = this,
                i = me.chHorHide.length,
                el = $(_.template(horTemplate)({
                    scope: me,
                    idx: i
                }));
            parentEl.append(el);

            me.chHorHide[i] = new Common.UI.CheckBox({
                el: $('#chart-dlg-chk-hor-hide-' + i),
                labelText: me.textHideAxis
            }).on('change', _.bind(function (checkbox, state) {
                if (me.currentAxisProps[i])
                    me.currentAxisProps[i].putShow(state !== 'checked');
            }, me));
            Common.UI.FocusManager.add(this, me.chHorHide[i]);

            me.cmbHorTitle[i] = new Common.UI.ComboBox({
                el: $('#chart-dlg-combo-hor-title-' + i),
                menuStyle: 'min-width: 100%;',
                editable: false,
                cls: 'input-group-nr',
                data: me._arrHorTitle,
                takeFocusOnClose: true
            }).on('selected', _.bind(function (combo, record) {
                if (me.currentAxisProps[i])
                    me.currentAxisProps[i].putLabel(record.value);
            }, me));
            Common.UI.FocusManager.add(this, me.cmbHorTitle[i]);

            me.cmbHorGrid[i] = new Common.UI.ComboBox({
                el: $('#chart-dlg-combo-hor-grid-' + i),
                menuStyle: 'min-width: 100%;',
                editable: false,
                cls: 'input-group-nr',
                data: [
                    {value: Asc.c_oAscGridLinesSettings.none, displayValue: me.textNone},
                    {value: Asc.c_oAscGridLinesSettings.major, displayValue: me.textMajor},
                    {value: Asc.c_oAscGridLinesSettings.minor, displayValue: me.textMinor},
                    {value: Asc.c_oAscGridLinesSettings.majorMinor, displayValue: me.textMajorMinor}
                ],
                takeFocusOnClose: true
            }).on('selected', _.bind(function (combo, record) {
                if (me.currentAxisProps[i])
                    me.currentAxisProps[i].putGridlines(record.value);
            }, me));
            Common.UI.FocusManager.add(this, me.cmbHorGrid[i]);

            me.cmbHCrossType[i] = new Common.UI.ComboBox({
                el: $('#chart-dlg-combo-h-crosstype-' + i),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: [
                    {displayValue: me.textAuto, value: Asc.c_oAscCrossesRule.auto},
                    {displayValue: me.textValue, value: Asc.c_oAscCrossesRule.value},
                    {displayValue: me.textMinValue, value: Asc.c_oAscCrossesRule.minValue},
                    {displayValue: me.textMaxValue, value: Asc.c_oAscCrossesRule.maxValue}
                ],
                takeFocusOnClose: true
            }).on('selected', _.bind(function (combo, record) {
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putCrossesRule(record.value);
                    if (record.value == Asc.c_oAscCrossesRule.auto) {
                        me.spnHAxisCrosses[i].setValue(me._originalAxisHValues[i].crossesAuto, true);
                    } else if (record.value == Asc.c_oAscCrossesRule.minValue) {
                        me.spnHAxisCrosses[i].setValue(me._originalAxisHValues[i].minAuto, true);
                    } else if (record.value == Asc.c_oAscCrossesRule.maxValue) {
                        me.spnHAxisCrosses[i].setValue(me._originalAxisHValues[i].maxAuto, true);
                    }
                }
            }, me));
            Common.UI.FocusManager.add(this, me.cmbHCrossType[i]);

            me.spnHAxisCrosses[i] = new Common.UI.MetricSpinner({
                el: $('#chart-dlg-input-h-axis-crosses-' + i),
                maxValue: 1000000,
                minValue: -1000000,
                step: 0.1,
                defaultUnit: "",
                defaultValue: 0,
                value: ''
            }).on('change', _.bind(function (field, newValue, oldValue) {
                me.cmbHCrossType[i].suspendEvents();
                me.cmbHCrossType[i].setValue(Asc.c_oAscCrossesRule.value);
                me.cmbHCrossType[i].resumeEvents();
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putCrossesRule(Asc.c_oAscCrossesRule.value);
                    me.currentAxisProps[i].putCrosses(field.getNumberValue());
                }
            }, me));
            Common.UI.FocusManager.add(this, me.spnHAxisCrosses[i]);

            me.cmbAxisPos[i] = new Common.UI.ComboBox({
                el: $('#chart-dlg-combo-axis-pos-' + i),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: [
                    {displayValue: me.textOnTickMarks, value: Asc.c_oAscLabelsPosition.byDivisions},
                    {displayValue: me.textBetweenTickMarks, value: Asc.c_oAscLabelsPosition.betweenDivisions}
                ],
                takeFocusOnClose: true
            }).on('selected', _.bind(function (combo, record) {
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putLabelsPosition(record.value);
                }
            }, me));
            Common.UI.FocusManager.add(this, me.cmbAxisPos[i]);

            me.chHReverse[i] = new Common.UI.CheckBox({
                el: $('#chart-dlg-check-h-reverse-' + i),
                labelText: me.textReverse
            }).on('change', _.bind(function (checkbox, state) {
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putInvertCatOrder(state == 'checked');
                }
            }, me));
            Common.UI.FocusManager.add(this, me.chHReverse[i]);

            me.cmbHMajorType[i] = new Common.UI.ComboBox({
                el: $('#chart-dlg-combo-h-major-type-' + i),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: [
                    {displayValue: me.textNone, value: Asc.c_oAscTickMark.TICK_MARK_NONE},
                    {displayValue: me.textCross, value: Asc.c_oAscTickMark.TICK_MARK_CROSS},
                    {displayValue: me.textIn, value: Asc.c_oAscTickMark.TICK_MARK_IN},
                    {displayValue: me.textOut, value: Asc.c_oAscTickMark.TICK_MARK_OUT}
                ],
                takeFocusOnClose: true
            }).on('selected', _.bind(function (combo, record) {
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putMajorTickMark(record.value);
                }
            }, me));
            Common.UI.FocusManager.add(this, me.cmbHMajorType[i]);

            me.cmbHMinorType[i] = new Common.UI.ComboBox({
                el: $('#chart-dlg-combo-h-minor-type-' + i),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: [
                    {displayValue: me.textNone, value: Asc.c_oAscTickMark.TICK_MARK_NONE},
                    {displayValue: me.textCross, value: Asc.c_oAscTickMark.TICK_MARK_CROSS},
                    {displayValue: me.textIn, value: Asc.c_oAscTickMark.TICK_MARK_IN},
                    {displayValue: me.textOut, value: Asc.c_oAscTickMark.TICK_MARK_OUT}
                ],
                takeFocusOnClose: true
            }).on('selected', _.bind(function (combo, record) {
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putMinorTickMark(record.value);
                }
            }, me));
            Common.UI.FocusManager.add(this, me.cmbHMinorType[i]);

            me.spnMarksInterval[i] = new Common.UI.MetricSpinner({
                el: $('#chart-dlg-input-marks-interval-' + i),
                width: 'auto',
                maxValue: 1000000,
                minValue: 1,
                step: 1,
                defaultUnit: "",
                value: ''
            }).on('change', _.bind(function (field, newValue, oldValue) {
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putIntervalBetweenTick(field.getNumberValue());
                }
            }, me));
            Common.UI.FocusManager.add(this, me.spnMarksInterval[i]);

            me.cmbHLabelPos[i] = new Common.UI.ComboBox({
                el: $('#chart-dlg-combo-h-label-pos-' + i),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: [
                    {displayValue: me.textNone, value: Asc.c_oAscTickLabelsPos.TICK_LABEL_POSITION_NONE},
                    {displayValue: me.textLow, value: Asc.c_oAscTickLabelsPos.TICK_LABEL_POSITION_LOW},
                    {displayValue: me.textHigh, value: Asc.c_oAscTickLabelsPos.TICK_LABEL_POSITION_HIGH},
                    {displayValue: me.textNextToAxis, value: Asc.c_oAscTickLabelsPos.TICK_LABEL_POSITION_NEXT_TO}
                ],
                takeFocusOnClose: true
            }).on('selected', _.bind(function (combo, record) {
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putTickLabelsPos(record.value);
                }
            }, me));
            Common.UI.FocusManager.add(this, me.cmbHLabelPos[i]);

            me.spnLabelDist[i] = new Common.UI.MetricSpinner({
                el: $('#chart-dlg-input-label-dist-' + i),
                width: 'auto',
                maxValue: 1000,
                minValue: 0,
                step: 1,
                defaultUnit: "",
                value: ''
            }).on('change', _.bind(function (field, newValue, oldValue) {
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putLabelsAxisDistance(field.getNumberValue());
                }
            }, me));
            Common.UI.FocusManager.add(this, me.spnLabelDist[i]);

            me.spnLabelInterval[i] = new Common.UI.MetricSpinner({
                el: $('#chart-dlg-input-label-int-' + i),
                width: 60,
                maxValue: 1000000,
                minValue: 1,
                step: 1,
                defaultUnit: "",
                value: ''
            }).on('change', _.bind(function (field, newValue, oldValue) {
                me.cmbLabelInterval[i].suspendEvents();
                me.cmbLabelInterval[i].setValue(Asc.c_oAscBetweenLabelsRule.manual);
                me.cmbLabelInterval[i].resumeEvents();
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putIntervalBetweenLabelsRule(Asc.c_oAscBetweenLabelsRule.manual);
                    me.currentAxisProps[i].putIntervalBetweenLabels(field.getNumberValue());
                }
            }, me));
            Common.UI.FocusManager.add(this, me.spnLabelInterval[i]);

            me.cmbLabelInterval[i] = new Common.UI.ComboBox({
                el: $('#chart-dlg-combo-label-int-' + i),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                data: [
                    {displayValue: me.textAuto, value: Asc.c_oAscBetweenLabelsRule.auto},
                    {displayValue: me.textManual, value: Asc.c_oAscBetweenLabelsRule.manual}
                ],
                takeFocusOnClose: true
            }).on('selected', _.bind(function (combo, record) {
                if (me.currentAxisProps[i]) {
                    me.currentAxisProps[i].putIntervalBetweenLabelsRule(record.value);
                    if (record.value == Asc.c_oAscBetweenLabelsRule.auto)
                        me.spnLabelInterval[i].setValue(1, true);
                }
            }, me));
            Common.UI.FocusManager.add(this, me.cmbLabelInterval[i]);

            me.btnHFormat[i] = new Common.UI.Button({
                el: $('#chart-dlg-btn-h-format-' + i)
            }).on('click', _.bind(me.openFormat, me, i));
            Common.UI.FocusManager.add(this, me.btnHFormat[i]);

            return i;
        },

        updateAxisProps: function(type, isDefault) {
            var value = (type == Asc.c_oAscChartTypeSettings.lineNormal || type == Asc.c_oAscChartTypeSettings.lineStacked ||
                type == Asc.c_oAscChartTypeSettings.lineStackedPer || type == Asc.c_oAscChartTypeSettings.lineNormalMarker ||
                type == Asc.c_oAscChartTypeSettings.lineStackedMarker || type == Asc.c_oAscChartTypeSettings.lineStackedPerMarker ||
                type == Asc.c_oAscChartTypeSettings.scatter || type == Asc.c_oAscChartTypeSettings.scatterSmoothMarker || type == Asc.c_oAscChartTypeSettings.scatterSmooth ||
                type == Asc.c_oAscChartTypeSettings.scatterLineMarker || type == Asc.c_oAscChartTypeSettings.scatterLine);
            this.chMarkers.setVisible(value);
            this.cmbLines.setVisible(value);
            this.lblLines.toggleClass('hidden', !value);

            if (value) {
                this.chMarkers.setValue(this.chartSettings.getShowMarker(), true);
                this.cmbLines.setValue(this.chartSettings.getLine() ? (this.chartSettings.getSmooth() ? 2 : 1) : 0);
            }

            value = (type == Asc.c_oAscChartTypeSettings.pie || type == Asc.c_oAscChartTypeSettings.doughnut || type == Asc.c_oAscChartTypeSettings.pie3d);
            this.btnsCategory[1].setDisabled(value);
            this.btnsCategory[2].setDisabled(value);
            this.btnsCategory[3].setDisabled(value);
            this.btnsCategory[4].setDisabled(value);
            this.btnsCategory[1].setVisible(this.vertAxisProps.length>0);
            this.btnsCategory[2].setVisible(this.vertAxisProps.length>1);
            this.btnsCategory[3].setVisible(this.horAxisProps.length>0);
            this.btnsCategory[4].setVisible(this.horAxisProps.length>1);

            value = (type == Asc.c_oAscChartTypeSettings.barNormal3d || type == Asc.c_oAscChartTypeSettings.barStacked3d || type == Asc.c_oAscChartTypeSettings.barStackedPer3d ||
                type == Asc.c_oAscChartTypeSettings.hBarNormal3d || type == Asc.c_oAscChartTypeSettings.hBarStacked3d || type == Asc.c_oAscChartTypeSettings.hBarStackedPer3d ||
                type == Asc.c_oAscChartTypeSettings.barNormal3dPerspective);
            for (var i=0; i<this.cmbAxisPos.length; i++)
                this.cmbAxisPos[i].setDisabled(value);
        },

        updateDataLabels: function(chartType, labelPos) {
            if (chartType !== this.currentChartType) {
                var data = [{ value: Asc.c_oAscChartDataLabelsPos.none, displayValue: this.textNone },
                    { value: Asc.c_oAscChartDataLabelsPos.ctr, displayValue: this.textCenter }];

                if (chartType == Asc.c_oAscChartTypeSettings.barNormal || chartType == Asc.c_oAscChartTypeSettings.hBarNormal)
                    data.push({ value: Asc.c_oAscChartDataLabelsPos.inBase, displayValue: this.textInnerBottom },
                        { value: Asc.c_oAscChartDataLabelsPos.inEnd, displayValue: this.textInnerTop },
                        { value: Asc.c_oAscChartDataLabelsPos.outEnd, displayValue: this.textOuterTop });
                else if ( chartType == Asc.c_oAscChartTypeSettings.barStacked || chartType == Asc.c_oAscChartTypeSettings.barStackedPer ||
                    chartType == Asc.c_oAscChartTypeSettings.hBarStacked || chartType == Asc.c_oAscChartTypeSettings.hBarStackedPer )
                    data.push({ value: Asc.c_oAscChartDataLabelsPos.inBase, displayValue: this.textInnerBottom },
                        { value: Asc.c_oAscChartDataLabelsPos.inEnd, displayValue: this.textInnerTop });
                else if (chartType == Asc.c_oAscChartTypeSettings.lineNormal || chartType == Asc.c_oAscChartTypeSettings.lineStacked || chartType == Asc.c_oAscChartTypeSettings.lineStackedPer ||
                    chartType == Asc.c_oAscChartTypeSettings.lineNormalMarker || chartType == Asc.c_oAscChartTypeSettings.lineStackedMarker || chartType == Asc.c_oAscChartTypeSettings.lineStackedPerMarker ||
                    chartType == Asc.c_oAscChartTypeSettings.stock || chartType == Asc.c_oAscChartTypeSettings.scatter  || chartType == Asc.c_oAscChartTypeSettings.scatterSmoothMarker ||
                    chartType == Asc.c_oAscChartTypeSettings.scatterSmooth || chartType == Asc.c_oAscChartTypeSettings.scatterLineMarker || chartType == Asc.c_oAscChartTypeSettings.scatterLine)
                    data.push({ value: Asc.c_oAscChartDataLabelsPos.l, displayValue: this.textLeft },
                        { value: Asc.c_oAscChartDataLabelsPos.r, displayValue: this.textRight },
                        { value: Asc.c_oAscChartDataLabelsPos.t, displayValue: this.textTop },
                        { value: Asc.c_oAscChartDataLabelsPos.b, displayValue: this.textBottom });
                else if (chartType == Asc.c_oAscChartTypeSettings.pie || chartType == Asc.c_oAscChartTypeSettings.pie3d)
                    data.push({ value: Asc.c_oAscChartDataLabelsPos.bestFit, displayValue: this.textFit },
                        { value: Asc.c_oAscChartDataLabelsPos.inEnd, displayValue: this.textInnerTop },
                        { value: Asc.c_oAscChartDataLabelsPos.outEnd, displayValue: this.textOuterTop });

                this.cmbDataLabels.setData(data);
            }

            if (labelPos!==undefined) {
                var rec = this.cmbDataLabels.store.findWhere({value: labelPos});
                if (!rec)
                    labelPos = Asc.c_oAscChartDataLabelsPos.ctr;
            } else
                labelPos = Asc.c_oAscChartDataLabelsPos.none;

            this.cmbDataLabels.setValue(labelPos);
            this.onSelectDataLabels(this.cmbDataLabels, {value:labelPos});
        },

        onVCategoryClick: function(index) {
            (this.vertAxisProps[index].getAxisType()==Asc.c_oAscAxisType.val) ? this.fillVProps(this.vertAxisProps[index], this.vertAxisPropsIndexes[index]) : this.fillHProps(this.vertAxisProps[index], this.vertAxisPropsIndexes[index], true);
        },

        onHCategoryClick: function(index) {
            (this.horAxisProps[index].getAxisType()==Asc.c_oAscAxisType.val) ? this.fillVProps(this.horAxisProps[index], this.horAxisPropsIndexes[index], true) : this.fillHProps(this.horAxisProps[index], this.horAxisPropsIndexes[index]);
        },

        fillVProps: function(props, index, hor) {
            if (props.getAxisType() !== Asc.c_oAscAxisType.val) return;
            if (this._originalAxisVValues==undefined)
                this._originalAxisVValues = [];
            if (this._originalAxisVValues[index]==undefined) {
                this._originalAxisVValues[index] = {
                    minAuto: (props.getMinVal()==null) ? 0 : props.getMinVal(),
                    maxAuto: (props.getMaxVal()==null) ? 10 : props.getMaxVal(),
                    crossesAuto: (props.getCrosses()==null) ? 0 : props.getCrosses()
                };
            }

            this.chVertHide[index].setValue(!props.getShow());
            this.cmbVertGrid[index].setValue(props.getGridlines());


            this.cmbVertTitle[index].setData(hor ? this._arrHorTitle : this._arrVertTitle);
            this.cmbVertTitle[index].setValue(props.getLabel());
            this.cmbVertTitle[index].setDisabled(!!props.isRadarAxis());

            this.cmbMinType[index].setValue(props.getMinValRule());
            var value = (props.getMinValRule()==Asc.c_oAscValAxisRule.auto) ? this._originalAxisVValues[index].minAuto : props.getMinVal();
            this.spnMinValue[index].setValue((value==null) ? '' : value, true);

            this.cmbMaxType[index].setValue(props.getMaxValRule());
            value = (props.getMaxValRule()==Asc.c_oAscValAxisRule.auto) ? this._originalAxisVValues[index].maxAuto : props.getMaxVal();
            this.spnMaxValue[index].setValue((value==null) ? '' : value, true);

            value = props.getCrossesRule();
            this.cmbVCrossType[index].setValue(value);
            switch (value) {
                case Asc.c_oAscCrossesRule.minValue:
                    value = this.spnMinValue[index].getNumberValue();
                    break;
                case Asc.c_oAscCrossesRule.maxValue:
                    value = this.spnMaxValue[index].getNumberValue();
                    break;
                case Asc.c_oAscCrossesRule.auto:
                    value = this._originalAxisVValues[index].crossesAuto;
                    break;
                default:
                    value = props.getCrosses();
                    break;
            }
            this.spnVAxisCrosses[index].setValue((value==null) ? '' : value, true);

            this.cmbUnits[index].setValue(props.getDispUnitsRule());
            this.chVReverse[index].setValue(props.getInvertValOrder(), true);
            this.cmbVMajorType[index].setValue(props.getMajorTickMark());
            this.cmbVMinorType[index].setValue(props.getMinorTickMark());
            this.cmbVLabelPos[index].setValue(props.getTickLabelsPos());
            value = props.getLogScale();
            this.chVLogScale[index].setValue(!!value, true);
            this.spnBase[index].setDisabled(!value);
            value && this.spnBase[index].setValue(props.getLogBase(), true);

            this.currentAxisProps[index] = props;
        },

        fillHProps: function(props, index, vert) {
            if (props.getAxisType() !== Asc.c_oAscAxisType.cat) return;
            if (this._originalAxisHValues==undefined)
                this._originalAxisHValues = [];
            if (this._originalAxisHValues[index]==undefined) {
                this._originalAxisHValues[index] = {
                    minAuto: (props.getCrossMinVal()==null) ? 0 : props.getCrossMinVal(),
                    maxAuto: (props.getCrossMaxVal()==null) ? 10 : props.getCrossMaxVal(),
                    crossesAuto: (props.getCrosses()==null) ? 0 : props.getCrosses()
                };
            }

            this.chHorHide[index].setValue(!props.getShow());
            this.cmbHorGrid[index].setValue(props.getGridlines());

            this.cmbHorTitle[index].setData(vert ? this._arrVertTitle : this._arrHorTitle);
            this.cmbHorTitle[index].setValue(props.getLabel());

            var value = props.getCrossesRule();
            this.cmbHCrossType[index].setValue(value);
            switch (value) {
                case Asc.c_oAscCrossesRule.minValue:
                    value = this._originalAxisHValues[index].minAuto;
                    break;
                case Asc.c_oAscCrossesRule.maxValue:
                    value = this._originalAxisHValues[index].maxAuto;
                    break;
                case Asc.c_oAscCrossesRule.auto:
                    value = this._originalAxisHValues[index].crossesAuto;
                    break;
                default:
                    value = props.getCrosses();
                    break;
            }
            this.spnHAxisCrosses[index].setValue((value==null) ? '' : value, true);

            this.cmbAxisPos[index].setValue(props.getLabelsPosition());
            this.chHReverse[index].setValue(props.getInvertCatOrder(), true);
            this.cmbHMajorType[index].setValue(props.getMajorTickMark());
            this.cmbHMinorType[index].setValue(props.getMinorTickMark());
            this.spnMarksInterval[index].setValue(props.getIntervalBetweenTick(), true);
            this.cmbHLabelPos[index].setValue(props.getTickLabelsPos());
            this.spnLabelDist[index].setValue(props.getLabelsAxisDistance(), true);

            value = props.getIntervalBetweenLabelsRule();
            this.cmbLabelInterval[index].setValue(value);
            this.spnLabelInterval[index].setValue((value===Asc.c_oAscBetweenLabelsRule.manual) ? props.getIntervalBetweenLabels(): 1, true);

            value = !!props.isRadarAxis();
            this.chHorHide[index].setDisabled(value);
            this.cmbHorTitle[index].setDisabled(value);
            this.cmbHorGrid[index].setDisabled(value);
            this.cmbHCrossType[index].setDisabled(value);
            this.spnHAxisCrosses[index].setDisabled(value);
            this.chHReverse[index].setDisabled(value);
            this.cmbHMajorType[index].setDisabled(value);
            this.cmbHMinorType[index].setDisabled(value);
            this.spnMarksInterval[index].setDisabled(value);
            this.cmbHLabelPos[index].setDisabled(value);
            this.spnLabelDist[index].setDisabled(value);
            this.cmbLabelInterval[index].setDisabled(value);
            this.spnLabelInterval[index].setDisabled(value);

            var type = this.currentChartType;
            value = !!props.isRadarAxis() || type == Asc.c_oAscChartTypeSettings.barNormal3d || type == Asc.c_oAscChartTypeSettings.barStacked3d || type == Asc.c_oAscChartTypeSettings.barStackedPer3d ||
                type == Asc.c_oAscChartTypeSettings.hBarNormal3d || type == Asc.c_oAscChartTypeSettings.hBarStacked3d || type == Asc.c_oAscChartTypeSettings.hBarStackedPer3d ||
                type == Asc.c_oAscChartTypeSettings.barNormal3dPerspective;
            this.cmbAxisPos[index].setDisabled(value);

            this.currentAxisProps[index] = props;
        },

        onSelectDataLabels: function(obj, rec, e) {
            var disable = rec.value == Asc.c_oAscChartDataLabelsPos.none;
            this.chSeriesName.setDisabled(disable);
            this.chCategoryName.setDisabled(disable);
            this.chValue.setDisabled(disable);
            this.txtSeparator.setDisabled(disable);
            if (!disable && this.chSeriesName.getValue()!=='checked' && this.chCategoryName.getValue()!=='checked'
                && this.chValue.getValue()!=='checked') {
                this.chValue.setValue('checked', true);
            }
        },

        openFormat: function(index, btn) {
            var me = this,
                props = me.currentAxisProps[index],
                fmt = props.getNumFmt(),
                lang = Common.Utils.InternalSettings.get("de-config-lang");

            var win = (new Common.Views.FormatSettingsDialog({
                api: me.api,
                handler: function(result, settings) {
                    if (result=='ok' && settings) {
                        fmt.putSourceLinked(settings.linked);
                        fmt.putFormatCode(settings.format);
                        me.chartSettings.endEditData();
                        me._isEditFormat = false;
                    }
                },
                linked: true,
                props   : {format: fmt.getFormatCode(), formatInfo: fmt.getFormatCellsInfo(), langId: lang, chartFormat: fmt}
            })).on('close', function() {
                me._isEditFormat && me.chartSettings.cancelEditData();
                me._isEditFormat = false;
                btn.focus();
            });
            me._isEditFormat = true;
            me.chartSettings.startEditData();
            win.show();
        },

        close: function () {
            this.api && this.api.asc_onCloseFrameEditor();
            Common.Views.AdvancedSettingsWindow.prototype.close.apply(this, arguments);
        },

        textTop:        'Top',
        textLeft:       'Left',
        textBottom:     'Bottom',
        textRight:      'Right',
        textOriginalSize: 'Actual Size',
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
        textVertically: 'Vertically',
        textTextBox: 'Text Box',
        textAutofit: 'AutoFit',
        textResizeFit: 'Resize shape to fit text',
        textLegendBottom:   'Bottom',
        textLegendTop:      'Top',
        textLegendRight:    'Right',
        textLegendLeft:     'Left',
        textChartTitle:     'Chart Title',
        textLayout: 'Layout',
        textLegendPos: 'Legend',
        textDataLabels: 'Data Labels',
        textSeparator: 'Data Labels Separator',
        textSeriesName: 'Series Name',
        textCategoryName: 'Category Name',
        textValue: 'Value',
        textMinValue: 'Minimum Value',
        textMaxValue: 'Maximum Value',
        textAxisCrosses: 'Axis Crosses',
        textUnits: 'Display Units',
        textTickOptions: 'Tick Options',
        textMajorType: 'Major Type',
        textMinorType: 'Minor Type',
        textLabelOptions: 'Label Options',
        textLabelPos: 'Label Position',
        textReverse: 'Values in reverse order',
        textVertAxis: 'Vertical Axis',
        textHorAxis: 'Horizontal Axis',
        textMarksInterval: 'Interval between Marks',
        textLabelDist: 'Axis Label Distance',
        textLabelInterval: 'Interval between Labels',
        textAxisPos: 'Axis Position',
        textLeftOverlay: 'Left Overlay',
        textRightOverlay: 'Right Overlay',
        textOverlay: 'Overlay',
        textNoOverlay: 'No Overlay',
        textRotated: 'Rotated',
        textInnerBottom: 'Inner Bottom',
        textInnerTop: 'Inner Top',
        textOuterTop: 'Outer Top',
        textNone: 'None',
        textFixed: 'Fixed',
        textAuto: 'Auto',
        textCross: 'Cross',
        textIn: 'In',
        textOut: 'Out',
        textLow: 'Low',
        textHigh: 'High',
        textNextToAxis: 'Next to axis',
        textHundreds: 'Hundreds',
        textThousands: 'Thousands',
        textTenThousands: '10 000',
        textHundredThousands: '100 000',
        textMillions: 'Millions',
        textTenMillions: '10 000 000',
        textHundredMil: '100 000 000',
        textBillions: 'Billions',
        textTrillions: 'Trillions',
        textCustom: 'Custom',
        textManual: 'Manual',
        textBetweenTickMarks: 'Between Tick Marks',
        textOnTickMarks: 'On Tick Marks',
        textLines: 'Lines',
        textMarkers: 'Markers',
        textMajor: 'Major',
        textMinor: 'Minor',
        textMajorMinor: 'Major and Minor',
        textStraight: 'Straight',
        textSmooth: 'Smooth',
        textGridLines: 'Gridlines',
        textFit: 'Fit Width',
        textVertAxisSec: 'Secondary Vertical Axis',
        textHorAxisSec: 'Secondary Horizontal Axis',
        textAxisTitle: 'Title',
        textHideAxis: 'Hide axis',
        textFormat: 'Label format',
        textBase: 'Base',
        textLogScale: 'Logarithmic Scale'

    }, DE.Views.ImageSettingsAdvanced || {}));
});