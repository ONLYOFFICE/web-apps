/*
 *
 * (c) Copyright Ascensio System Limited 2010-2018
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
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia,
 * EU, LV-1021.
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
 *  Created by Julia Radzhabova on 4/16/14
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
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
            height: 342,
            sizeOriginal: {width: 0, height: 0},
            sizeMax: {width: 55.88, height: 55.88},
            storageName: 'pe-img-settings-adv-category'
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle,
                items: [
                    {panelId: 'id-adv-image-size',       panelCaption: this.textPlacement},
                    {panelId: 'id-adv-image-alttext',    panelCaption: this.textAlt}
                ],
                contentTemplate: _.template(contentTemplate)({
                    scope: this
                })
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
            if (this.storageName) {
                var value = Common.localStorage.getItem(this.storageName);
                this.setActiveCategory((value!==null) ? parseInt(value) : 0);
            }
        },

        _setDefaults: function(props) {
            if (props ){
                this.spnWidth.setMaxValue(this.sizeMax.width);
                this.spnHeight.setMaxValue(this.sizeMax.height);
                this.spnWidth.setValue(Common.Utils.Metric.fnRecalcFromMM(props.get_Width()).toFixed(2), true);
                this.spnHeight.setValue(Common.Utils.Metric.fnRecalcFromMM(props.get_Height()).toFixed(2), true);

                this.btnOriginalSize.setDisabled(props.get_ImageUrl()===null || props.get_ImageUrl()===undefined);

                var value = props.asc_getLockAspect();
                this.btnRatio.toggle(value);
                if (props.get_Height()>0)
                    this._nRatio = props.get_Width()/props.get_Height();

                if (props.get_Position()) {
                    var Position = {X: props.get_Position().get_X(), Y: props.get_Position().get_Y()};
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
            }
        },

        getSettings: function() {
            var properties = new Asc.asc_CImgProperty();
            if (this.spnHeight.getValue()!=='')
                properties.put_Height(Common.Utils.Metric.fnRecalcToMM(this.spnHeight.getNumberValue()));
            if (this.spnWidth.getValue()!=='')
                properties.put_Width(Common.Utils.Metric.fnRecalcToMM(this.spnWidth.getNumberValue()));
            properties.asc_putLockAspect(this.btnRatio.pressed);

            var Position = new Asc.CPosition();
            if (this.spnX.getValue() !== '')
                Position.put_X(Common.Utils.Metric.fnRecalcToMM(this.spnX.getNumberValue()));
            if (this.spnY.getValue() !== '')
                Position.put_Y(Common.Utils.Metric.fnRecalcToMM(this.spnY.getNumberValue()));
            properties.put_Position(Position);

            if (this.isAltTitleChanged)
                properties.asc_putTitle(this.inputAltTitle.getValue());

            if (this.isAltDescChanged)
                properties.asc_putDescription(this.textareaAltDescription.val());

            return { imageProps: properties };
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
        okButtonText:   'Ok',
        textPlacement:  'Placement',
        textAlt: 'Alternative Text',
        textAltTitle: 'Title',
        textAltDescription: 'Description',
        textAltTip: 'The alternative text-based representation of the visual object information, which will be read to the people with vision or cognitive impairments to help them better understand what information there is in the image, autoshape, chart or table.'

    }, PE.Views.ImageSettingsAdvanced || {}));
});