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
 *  ChartSettingsAdvanced.js
 *
 *  Created on 1/18/17
 *
 */

define([
    'text!presentationeditor/main/app/template/ChartSettingsAdvanced.template',
    'common/main/lib/view/AdvancedSettingsWindow',
], function (contentTemplate) {
    'use strict';

    PE.Views.ChartSettingsAdvanced = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 300,
            contentHeight: 257,
            toggleGroup: 'chart-adv-settings-group',
            properties: null,
            storageName: 'pe-chart-settings-adv-category',
            sizeMax: {width: 55.88, height: 55.88},
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle,
                items: [
                    {panelId: 'id-adv-chart-general',  panelCaption: this.textGeneral},
                    {panelId: 'id-adv-chart-placement',  panelCaption: this.textPlacement},
                    {panelId: 'id-adv-chart-alttext',    panelCaption: this.textAlt}
                ],
                contentTemplate: _.template(contentTemplate)({
                    scope: this
                })
            }, options);
            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);

            this.spinners = [];

            this._originalProps = this.options.chartProps;
            this.slideSize = this.options.slideSize;
            this._changedProps = null;
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);

            var me = this;

            // General

            this.inputChartName = new Common.UI.InputField({
                el          : $('#chart-advanced-name'),
                allowBlank  : true,
                validateOnBlur: false,
                style       : 'width: 100%;'
            }).on('changed:after', function() {
                me.isChartNameChanged = true;
            });

            // Placement

            this.spnWidth = new Common.UI.MetricSpinner({
                el: $('#chart-advanced-spin-width'),
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
                if (this._changedProps) {
                    this._changedProps.put_Width(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                    this._changedProps.put_Height(Common.Utils.Metric.fnRecalcToMM(this.spnHeight.getNumberValue()));
                }
            }, this));
            this.spinners.push(this.spnWidth);

            this.spnHeight = new Common.UI.MetricSpinner({
                el: $('#chart-advanced-spin-height'),
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
                parentEl: $('#chart-advanced-button-ratio'),
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
                el: $('#chart-advanced-spin-x'),
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
                el: $('#chart-advanced-spin-y'),
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
                el: $('#chart-advanced-combo-from-x'),
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
                el: $('#chart-advanced-combo-from-y'),
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

            // Alt Text

            this.inputAltTitle = new Common.UI.InputField({
                el          : $('#chart-advanced-alt-title'),
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
            if (this.storageName) {
                var value = Common.localStorage.getItem(this.storageName);
                this.setActiveCategory((value!==null) ? parseInt(value) : 0);
            }
        },

        getFocusedComponents: function() {
            return this.btnsCategory.concat([
                this.inputChartName, // 0 tab
                this.spnWidth, this.btnRatio, this.spnHeight, this.spnX, this.cmbFromX, this.spnY, this.cmbFromY, // 1 tab
                this.inputAltTitle, this.textareaAltDescription  // 2 tab
            ]).concat(this.getFooterButtons());
        },

        onCategoryClick: function(btn, index) {
            Common.Views.AdvancedSettingsWindow.prototype.onCategoryClick.call(this, btn, index);

            var me = this;
            setTimeout(function(){
                switch (index) {
                    case 0:
                        me.inputChartName.focus();
                        break;
                    case 1:
                        me.spnWidth.focus();
                        break;
                    case 2:
                        me.inputAltTitle.focus();
                        break;
                }
            }, 10);
        },

        _setDefaults: function(props) {
            if (props ){
                var value = props.asc_getName();
                this.inputChartName.setValue(value ? value : '');

                this.spnWidth.setMaxValue(this.sizeMax.width);
                this.spnHeight.setMaxValue(this.sizeMax.height);

                this.spnWidth.setValue(Common.Utils.Metric.fnRecalcFromMM(props.asc_getWidth()).toFixed(2), true);
                this.spnHeight.setValue(Common.Utils.Metric.fnRecalcFromMM(props.asc_getHeight()).toFixed(2), true);

                if (props.asc_getHeight()>0)
                    this._nRatio = props.asc_getWidth()/props.asc_getHeight();

                value = props.asc_getLockAspect();
                this.btnRatio.toggle(value);

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

                value = props.asc_getTitle();
                this.inputAltTitle.setValue(value ? value : '');

                value = props.asc_getDescription();
                this.textareaAltDescription.val(value ? value : '');

                this._changedProps = new Asc.CAscChartProp();
            }
        },

        getSettings: function() {
            var Position = new Asc.CPosition();
            if (this.isChartNameChanged)
                this._changedProps.asc_putName(this.inputChartName.getValue());

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

            return { chartProps: this._changedProps} ;
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

        textTitle:      'Chart - Advanced Settings',
        textAlt: 'Alternative Text',
        textAltTitle: 'Title',
        textAltDescription: 'Description',
        textAltTip: 'The alternative text-based representation of the visual object information, which will be read to the people with vision or cognitive impairments to help them better understand what information there is in the image, autoshape, chart or table.',
        textPlacement: 'Placement',
        textSize: 'Size',
        textWidth: 'Width',
        textHeight: 'Height',
        textPosition: 'Position',
        textHorizontal: 'Horizontal',
        textVertical: 'Vertical',
        textFrom: 'From',
        textTopLeftCorner: 'Top Left Corner',
        textCenter: 'Center',
        textKeepRatio: 'Constant Proportions',
        textGeneral: 'General',
        textChartName: 'Chart name'
    }, PE.Views.ChartSettingsAdvanced || {}));
});