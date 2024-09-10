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
 *
 *  ShapeShadowDialog.js
 *
 *  Created on 27.09.23
 *
 */

define([
    'common/main/lib/view/AdvancedSettingsWindow',
], function () { 'use strict';
    Common.Views.ShapeShadowDialog =  Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            alias: 'ShapeShadowDialog',
            contentWidth: 208,
            height: 252,
        },

        initialize: function (options) {
            var me = this;

            _.extend(this.options, {
                title: this.txtTitle,
                template: [
                    '<div class="box" style="height:' + (me.options.height - 85) + 'px;">',
                        '<div class="content-panel" style="padding: 16px 16px 0 16px;">',
                            '<table cols="1" style="width: 100%;">',
                                '<tr>',
                                    '<td>',
                                        '<label class="header">' + me.txtTransparency + '</label>',
                                        '<div style="display: flex; align-items: center; justify-content: space-between;">',
                                            '<div id="shape-shadow-transparency-slider" style="display: inline-block"></div>',
                                            '<div id="shape-shadow-transparency-spin"></div>',
                                        '</div>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td>',
                                        '<label class="header">' + me.txtSize + '</label>',
                                        '<div style="display: flex; align-items: center; justify-content: space-between;">',
                                            '<div id="shape-shadow-size-slider" style="display: inline-block"></div>',
                                            '<div id="shape-shadow-size-spin"></div>',
                                        '</div>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td>',
                                        '<label class="header">' + me.txtAngle + '</label>',
                                        '<div style="display: flex; align-items: center; justify-content: space-between;">',
                                            '<div id="shape-shadow-angle-slider" style="display: inline-block"></div>',
                                            '<div id="shape-shadow-angle-spin"></div>',
                                        '</div>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td>',
                                        '<label class="header">' + me.txtDistance + '</label>',
                                        '<div style="display: flex; align-items: center; justify-content: space-between;">',
                                            '<div id="shape-shadow-distance-slider" style="display: inline-block"></div>',
                                            '<div id="shape-shadow-distance-spin"></div>',
                                        '</div>',
                                    '</td>',
                                '</tr>',
                            '</table>',
                        '</div>',
                    '</div>'
                ].join('')
            }, options);

            this.handler                = options.handler;
            this.api                    = options.api;
            this.shadowProps            = options.shadowProps;
            this.methodApplySettings    = options.methodApplySettings; 

            this.isShadowEmpty  = !this.shadowProps; 
            if(!this.shadowProps) {
                this.shadowProps = new Asc.asc_CShadowProperty();
                this.shadowProps.putPreset('t');
            }

            this.oldTransparency = this.shadowProps.getTransparency();
            this.oldSize = this.shadowProps.getSize();
            this.oldAngle = this.shadowProps.getAngle();
            this.oldDistance = this._mm2pt(this.shadowProps.getDistance());


            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },
        render: function () {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            
            this.api.setStartPointHistory();
            if(this.isShadowEmpty) {
                var shapeProps = new Asc.asc_CShapeProperty();
                shapeProps.asc_putShadow(this.shadowProps);
                this.methodApplySettings && this.methodApplySettings.call(this, shapeProps);
            }

            this.sldrTransparency = new Common.UI.SingleSlider({
                el: $('#shape-shadow-transparency-slider'),
                width: 128,
                minValue: 0,
                maxValue: 100,
                value: this.oldTransparency
            });
            this.sldrTransparency.on('change', _.bind(this.onSliderTransparencyChange, this));

            this.spinTransparency = new Common.UI.MetricSpinner({
                el: $('#shape-shadow-transparency-spin'),
                step: 1,
                width: 62,
                allowDecimal: false,
                value: '0 %',
                defaultUnit : "%",
                maxValue: 100,
                minValue: 0,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.spinTransparency.setValue(this.oldTransparency, true);
            this.spinTransparency.on('change', _.bind(this.onSpinnerTransparencyChange, this));


            this.sldrSize = new Common.UI.SingleSlider({
                el: $('#shape-shadow-size-slider'),
                width: 128,
                minValue: 1,
                maxValue: 200,
                value: this.oldSize
            });
            this.sldrSize.on('change', _.bind(this.onSliderSizeChange, this));

            this.spinSize = new Common.UI.MetricSpinner({
                el: $('#shape-shadow-size-spin'),
                step: 1,
                width: 62,
                allowDecimal: false,
                value: '0 %',
                defaultUnit : "%",
                maxValue: 200,
                minValue: 1,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.spinSize.setValue(this.oldSize, true);
            this.spinSize.on('change', _.bind(this.onSpinnerSizeChange, this));


            this.sldrAngle = new Common.UI.SingleSlider({
                el: $('#shape-shadow-angle-slider'),
                width: 128,
                minValue: 0,
                maxValue: 359,
                value: this.oldAngle
            });
            this.sldrAngle.on('change', _.bind(this.onSliderAngleChange, this));


            this.spinAngle = new Common.UI.MetricSpinner({
                el: $('#shape-shadow-angle-spin'),
                step: 1,
                width: 62,
                allowDecimal: false,
                value: '0 °',
                defaultUnit : "°",
                maxValue: 359,
                minValue: 0,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.spinAngle.setValue(this.oldAngle, true);
            this.spinAngle.on('change', _.bind(this.onSpinnerAngleChange, this));


            this.sldrDistance = new Common.UI.SingleSlider({
                el: $('#shape-shadow-distance-slider'),
                width: 128,
                minValue: 0,
                maxValue: 200,
                value: this.oldDistance
            });
            this.sldrDistance.on('change', _.bind(this.onSliderDistanceChange, this));

            var metricName = Common.Utils.Metric.getMetricName(Common.Utils.Metric.c_MetricUnits.pt);

            this.spinDistance = new Common.UI.MetricSpinner({
                el: $('#shape-shadow-distance-spin'),
                step: 1,
                width: 62,
                allowDecimal: false,
                value: "0 " + metricName,
                defaultUnit : metricName,
                maxValue: 200,
                minValue: 0,
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.spinDistance.setValue(this.oldDistance, true);
            this.spinDistance.on('change', _.bind(this.onSpinnerDistanceChange, this));


            this.on('close', _.bind(this.handleCancelClose, this));
        },

        onSliderTransparencyChange: function (field, newValue, oldValue) {
            this.spinTransparency.setValue(newValue, true);
            this.setTransparency(newValue);
        },

        onSpinnerTransparencyChange: function (field, newValue, oldValue) {
            var num = field.getNumberValue();
            this.sldrTransparency.setValue(num, true);
            this.setTransparency(num);
        },

        setTransparency: function(value) {
            var shapeProps = new Asc.asc_CShapeProperty();
            this.shadowProps.putTransparency(value);
            shapeProps.asc_putShadow(this.shadowProps);
            this.methodApplySettings && this.methodApplySettings.call(this, shapeProps);
        },


        onSliderSizeChange: function (field, newValue, oldValue) {
            this.spinSize.setValue(newValue, true);
            this.setSize(newValue);
        },

        onSpinnerSizeChange: function (field, newValue, oldValue) {
            var num = field.getNumberValue();
            this.sldrSize.setValue(num, true);
            this.setSize(num);
        },

        setSize: function(value) {
            var shapeProps = new Asc.asc_CShapeProperty();
            this.shadowProps.putSize(value);
            shapeProps.asc_putShadow(this.shadowProps);
            this.methodApplySettings && this.methodApplySettings.call(this, shapeProps);
        },


        onSliderAngleChange: function (field, newValue, oldValue) {
            this.spinAngle.setValue(newValue, true);
            this.setAngle(newValue);
        },

        onSpinnerAngleChange: function (field, newValue, oldValue) {
            var num = field.getNumberValue();
            this.sldrAngle.setValue(num, true);
            this.setAngle(num);
        },

        setAngle: function(value) {
            var shapeProps = new Asc.asc_CShapeProperty();
            this.shadowProps.putAngle(value);
            shapeProps.asc_putShadow(this.shadowProps);
            this.methodApplySettings && this.methodApplySettings.call(this, shapeProps);
        },


        onSliderDistanceChange: function (field, newValue, oldValue) {
            this.spinDistance.setValue(newValue, true);
            this.setDistance(newValue);
        },

        onSpinnerDistanceChange: function (field, newValue, oldValue) {
            var num = field.getNumberValue();
            this.sldrDistance.setValue(num, true);
            this.setDistance(num);
        },

        setDistance: function(value) {
            var shapeProps = new Asc.asc_CShapeProperty();
            this.shadowProps.putDistance(this._pt2mm(value));
            shapeProps.asc_putShadow(this.shadowProps);
            this.methodApplySettings && this.methodApplySettings.call(this, shapeProps);
        },


        setAllProperties: function(transparency, size, angle, distance) {
            var shapeProps = new Asc.asc_CShapeProperty();
            this.shadowProps.putTransparency(transparency);
            this.shadowProps.putSize(size);
            this.shadowProps.putAngle(angle);
            this.shadowProps.putDistance(this._pt2mm(distance));
            shapeProps.asc_putShadow(this.shadowProps);
            this.methodApplySettings && this.methodApplySettings.call(this, shapeProps);
        },

        getFocusedComponents: function() {
            return [this.spinTransparency, this.spinSize, this.spinAngle, this.spinDistance].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.spinTransparency;
        },

        _pt2mm: function(value) {
            return (value * 25.4 / 72.0);
        },

        _mm2pt: function(value) {
            return (value * 72.0 / 25.4);
        },
        
        onPrimary: function() {
            this.handleOkClose();
            this.close(true);
            return false;
        },

        onDlgBtnClick: function(event) {
            var state = event.currentTarget.attributes['result'].value;
            if(state == "ok") this.handleOkClose();
            else this.handleCancelClose();
            this.close(true);
        },

        onDblClickFunction: function () {
            this.handleOkClose();
            this.close(true);
        },

        handleOkClose: function() {
            this.api.setEndPointHistory();
            this.setAllProperties(
                parseInt(this.spinTransparency.getValue()),
                parseInt(this.spinSize.getValue()),
                parseInt(this.spinAngle.getValue()),
                parseInt(this.spinDistance.getValue())
            );
            this.handler && this.handler.call(this, 'ok');
        },

        handleCancelClose: function() {
            if(this.isShadowEmpty) {
                var shapeProps = new Asc.asc_CShapeProperty();
                shapeProps.asc_putShadow(null);
                this.methodApplySettings && this.methodApplySettings.call(this, shapeProps);
            } else {
                this.setAllProperties(this.oldTransparency, this.oldSize, this.oldAngle, this.oldDistance);
            }
            this.api.setEndPointHistory();
            this.handler && this.handler.call(this, 'cancel');
        },


        txtTitle: 'Adjust Shadow',
        txtTransparency: 'Transparency',
        txtSize: 'Size',
        txtAngle: 'Angle',
        txtDistance: 'Distance',
    }, Common.Views.ShapeShadowDialog || {}));
});
