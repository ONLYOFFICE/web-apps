/**
 *  ImageSettingsAdvanced.js
 *
 *  Created by Julia Radzhabova on 4/16/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

define([    'text!presentationeditor/main/app/template/ImageSettingsAdvanced.template',
    'common/main/lib/view/AdvancedSettingsWindow',
    'common/main/lib/component/MetricSpinner'
], function (contentTemplate) {
    'use strict';

    PE.Views.ImageSettingsAdvanced = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            alias: 'ImageSettingsAdvanced',
            contentWidth: 340,
            height: 235,
            sizeOriginal: {width: 0, height: 0},
            sizeMax: {width: 55.88, height: 55.88}
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle,
                template: [
                    '<div class="box" style="height:' + (this.options.height-85) + 'px;">',
                    '<div class="menu-panel" style="overflow: hidden;">',
                    '<div style="height: 70px; line-height: 70px;" class="div-category">' + this.textSize + '</div>',
                    '<div style="height: 75px; line-height: 75px;" class="div-category">' + this.textPosition + '</div>',
                    '</div>',
                    '<div class="separator"/>',
                    '<div class="content-panel">' + _.template(contentTemplate)({scope: this}) + '</div>',
                    '</div>',
                    '<div class="separator horizontal"/>',
                    '<div class="footer center">',
                    '<button class="btn normal dlg-btn primary" result="ok" style="margin-right: 10px;  width: 86px;">' + this.okButtonText + '</button>',
                    '<button class="btn normal dlg-btn" result="cancel" style="width: 86px;">' + this.cancelButtonText + '</button>',
                    '</div>'
                ].join('')
            }, options);
            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
            this.spinners = [];

            this._nRatio = 1;
            this._originalProps = this.options.imageProps;
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);

            var me = this;

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
            }, this));
            this.spinners.push(this.spnHeight);

            this.btnOriginalSize = new Common.UI.Button({
                el: $('#image-advanced-button-original-size')
            });
            this.btnOriginalSize.on('click', _.bind(function(btn, e) {
                this.spnWidth.setValue(this.sizeOriginal.width, true);
                this.spnHeight.setValue(this.sizeOriginal.height, true);
                this._nRatio = this.sizeOriginal.width/this.sizeOriginal.height;
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
            }, this));

            this.spnX = new Common.UI.MetricSpinner({
                el: $('#image-advanced-spin-x'),
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
                el: $('#image-advanced-spin-y'),
                step: .1,
                width: 85,
                defaultUnit : "cm",
                defaultValue : 0,
                value: '0 cm',
                maxValue: 55.87,
                minValue: -55.87
            });
            this.spinners.push(this.spnY);

            this.afterRender();
        },

        afterRender: function() {
            this.updateMetricUnit();
            this._setDefaults(this._originalProps);
        },

        _setDefaults: function(props) {
            if (props ){
                this.spnWidth.setMaxValue(this.sizeMax.width);
                this.spnHeight.setMaxValue(this.sizeMax.height);
                this.spnWidth.setValue(Common.Utils.Metric.fnRecalcFromMM(props.get_Width()).toFixed(2), true);
                this.spnHeight.setValue(Common.Utils.Metric.fnRecalcFromMM(props.get_Height()).toFixed(2), true);

                this.btnOriginalSize.setDisabled(props.get_ImageUrl()===null || props.get_ImageUrl()===undefined);

                var value = Common.localStorage.getItem("pe-settings-imageratio");
                if (value===null || parseInt(value) == 1) {
                    this.btnRatio.toggle(true);
                }

                if (props.get_Position()) {
                    var Position = {X: props.get_Position().get_X(), Y: props.get_Position().get_Y()};
                    if (Position.X !== null && Position.X !== undefined) this.spnX.setValue(Common.Utils.Metric.fnRecalcFromMM(Position.X), true);
                    if (Position.Y !== null && Position.Y !== undefined) this.spnY.setValue(Common.Utils.Metric.fnRecalcFromMM(Position.Y), true);
                } else {
                    this.spnX.setValue('', true);
                    this.spnY.setValue('', true);
                }
            }
        },

        getSettings: function() {
            Common.localStorage.setItem("pe-settings-imageratio", (this.btnRatio.pressed) ? 1 : 0);

            var properties = new CImgProperty();
            if (this.spnHeight.getValue()!=='')
                properties.put_Height(Common.Utils.Metric.fnRecalcToMM(this.spnHeight.getNumberValue()));
            if (this.spnWidth.getValue()!=='')
                properties.put_Width(Common.Utils.Metric.fnRecalcToMM(this.spnWidth.getNumberValue()));

            var Position = new CPosition();
            if (this.spnX.getValue() !== '')
                Position.put_X(Common.Utils.Metric.fnRecalcToMM(this.spnX.getNumberValue()));
            if (this.spnY.getValue() !== '')
                Position.put_Y(Common.Utils.Metric.fnRecalcToMM(this.spnY.getNumberValue()));
            properties.put_Position(Position);

            return { imageProps: properties };
        },

        updateMetricUnit: function() {
            if (this.spinners) {
                for (var i=0; i<this.spinners.length; i++) {
                    var spinner = this.spinners[i];
                    spinner.setDefaultUnit(Common.Utils.Metric.metricName[Common.Utils.Metric.getCurrentMetric()]);
                    spinner.setStep(Common.Utils.Metric.getCurrentMetric()==Common.Utils.Metric.c_MetricUnits.cm ? 0.1 : 1);
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

        textOriginalSize: 'Default Size',
        textPosition:   'Position',
        textSize:       'Size',
        textWidth:      'Width',
        textHeight:     'Height',
        textTitle:      'Image - Advanced Settings',
        textKeepRatio: 'Constant Proportions',
        cancelButtonText: 'Cancel',
        okButtonText:   'Ok'

    }, PE.Views.ImageSettingsAdvanced || {}));
});