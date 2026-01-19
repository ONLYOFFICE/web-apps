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
 *  Charts3DDlg.js
 *
 *  Created on 12.11.2025
 *
 */
define([], function () {
    'use strict';
    var nMaxRecent = 5;
    SSE.Views.Charts3DDlg = Common.UI.Window.extend(_.extend({
        initialize : function (options) {
            var t = this,
                _options = {};
            _.extend(_options,  {
                title: options.title ? options.title : this.capRotation,
                cls: 'modal-dlg',
                width: 250,
                height: 'auto',
                buttons: options.buttons ? options.buttons : [{
                    value: 'ok',
                    caption: 'Ok'
                }, 'cancel']
            }, options);
            this.recentNumTypes = [];
            this.handler = options.handler;
            this.props = options.props;
            this.numbering = options.numbering;
            this.numFormat = options.numFormat;
            this.mode = options.mode;
            this.X = options.X;
            this.Y = options.Y;
            this.RightAngle = options.RightAngle;
            this.Perspective = options.Perspective;
            this.Depth = options.Depth;
            this.Height3d = options.Height3d;
            this.oView3D = options.oView3D;
            this.chartProps = options.chartProps;
            this.api = options.api;
            this.template = options.template || [
                '<div class="box">',
                    '<table cols="1" id="chart-panel-3d-rotate" role="presentation" style="margin: auto;">' +
                        '<tr >'+
                            '<td style="padding-bottom: 10px">'+
                                '<label class="fixed display-inline-block-middle" style="width: 83px;">' + t.txtXRotation + '</label>'+
                                '<div id="id-chart-spin-x" class="display-inline-block-middle"></div>'+
                                '<div id="id-chart-btn-x-left" class="display-inline-block-middle margin-left-4"></div>'+
                                '<div id="id-chart-btn-x-right" class="display-inline-block-middle margin-left-4"></div>'+
                            '</td>'+
                        '</tr>'+
                        '<tr>'+
                            '<td style="padding-bottom: 10px">'+
                                '<label class="fixed display-inline-block-middle" style="width: 83px;">' + t.txtYRotation + '</label>'+
                                '<div id="id-chart-spin-y" class="display-inline-block-middle"></div>'+
                                '<div id="id-chart-btn-y-up" class="display-inline-block-middle margin-left-4"></div>'+
                                '<div id="id-chart-btn-y-down" class="display-inline-block-middle margin-left-4"></div>'+
                            '</td>'+
                        '</tr>'+
                        '<tr>'+
                            '<td style="padding-bottom: 10px">'+
                                '<label class="fixed display-inline-block-middle" style="width: 83px;">' + t.txtPerspective + '</label>'+
                                '<div id="id-chart-spin-persp" class="display-inline-block-middle"></div>'+
                                '<div id="id-chart-btn-narrow" class="display-inline-block-middle margin-left-4"></div>'+
                                '<div id="id-chart-btn-widen" class="display-inline-block-middle margin-left-4"></div>'+
                            '</td>'+
                        '</tr>'+
                        '<tr>'+
                            '<td style="padding-bottom: 8px">'+
                                '<div id="id-chart-checkbox-right-angle"></div>'+
                            '</td>'+
                        '</tr>'+
                        '<tr>'+
                            '<td style="padding-bottom: 8px">'+
                                '<div id="id-chart-checkbox-autoscale"></div>'+
                            '</td>'+
                        '</tr>'+
                        '<tr>'+
                            '<td style="padding-bottom: 8px">'+
                                '<label class="fixed" style="margin-top: 3px;width: 122px;">' + t.txtDepth + '</label>'+
                                '<div id="id-chart-spin-3d-depth" style="display: inline-block;" class="float-right"></div>'+
                            '</td>'+
                        '</tr>'+
                        '<tr>'+
                            '<td style="padding-bottom: 8px">'+
                                '<label class="fixed" style="margin-top: 3px;width: 122px;">' + t.txtHeight + '</label>'+
                                '<div id="id-chart-spin-3d-height" style="display: inline-block;" class="float-right"></div>'+
                            '</td>'+
                        '</tr>'+
                        '<tr>'+
                            '<td style="padding-bottom: 8px">'+
                                '<label class="link canfocused" id="id-chart-def-rotate-link" data-hint="1" data-hint-direction="bottom" data-hint-offset="medium">' + t.txtDefRotation + '</label>'+
                            '</td>'+
                        '</tr>'+
                    '</table>'+
                '</div>'
            ].join('');
            _options.tpl        =   _.template(this.template)(_options);
            Common.UI.Window.prototype.initialize.call(this, _options);
        },
        render: function () {
            Common.UI.Window.prototype.render.call(this);
            var me = this;
            this.$window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

            this.btnLeft = new Common.UI.Button({
                parentEl: $('#id-chart-btn-x-left'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-rotate-270',
                hint: this.textLeft,
            });
            this.btnLeft.on('click', _.bind(function() {
                this.spnX.setValue(Math.ceil((this.spnX.getNumberValue() - 10)/10)*10);
            }, this));

            this.btnRight= new Common.UI.Button({
                parentEl: $('#id-chart-btn-x-right'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-rotate-90',
                hint: this.textRight,
            });
            this.btnRight.on('click', _.bind(function() {
                this.spnX.setValue(Math.floor((this.spnX.getNumberValue() + 10)/10)*10);
            }, this));

            this.spnX = new Common.UI.MetricSpinner({
                el: $('#id-chart-spin-x'),
                step: 10,
                width: 57,
                defaultUnit : "°",
                value: '20 °',
                maxValue: 359.9,
                minValue: 0,
                ariaLabel: this.textX
            });
            this.spnX.on('change', _.bind(this.onXRotation, this));

            this.spnY = new Common.UI.MetricSpinner({
                el: $('#id-chart-spin-y'),
                step: 10,
                width: 57,
                defaultUnit : "°",
                value: '15 °',
                maxValue: 90,
                minValue: -90,
                ariaLabel: this.textY
            });
            this.spnY.on('change', _.bind(this.onYRotation, this));

            this.btnUp = new Common.UI.Button({
                parentEl: $('#id-chart-btn-y-up'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-rotate-y-clockwise',
                hint: this.textUp,
            });
            this.btnUp.on('click', _.bind(function() {
                this.spnY.setValue(Math.ceil((this.spnY.getNumberValue() - 10)/10)*10);
            }, this));

            this.btnDown= new Common.UI.Button({
                parentEl: $('#id-chart-btn-y-down'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-rotate-y-counterclockwise',
                hint: this.textDown,
            });
            this.btnDown.on('click', _.bind(function() {
                this.spnY.setValue(Math.floor((this.spnY.getNumberValue() + 10)/10)*10);
            }, this));

            this.spnPerspective = new Common.UI.MetricSpinner({
                el: $('#id-chart-spin-persp'),
                step: 5,
                width: 57,
                defaultUnit : "°",
                value: '0 °',
                maxValue: 100,
                minValue: 0.1,
                ariaLabel: this.textPerspective
            });
            this.spnPerspective.on('change', _.bind(this.onPerspective, this));

            this.btnNarrow = new Common.UI.Button({
                parentEl: $('#id-chart-btn-narrow'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-rotate-up',
                hint: this.textNarrow,
            });
            this.btnNarrow.on('click', _.bind(function() {
                this.spnPerspective.setValue(Math.ceil((this.spnPerspective.getNumberValue() - 5)/5)*5);
            }, this));

            this.btnWiden= new Common.UI.Button({
                parentEl: $('#id-chart-btn-widen'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-rotate-down',
                hint: this.textWiden,
            });
            this.btnWiden.on('click', _.bind(function() {
                this.spnPerspective.setValue(Math.floor((this.spnPerspective.getNumberValue() + 5)/5)*5);
            }, this));

            this.chRightAngle = new Common.UI.CheckBox({
                el: $('#id-chart-checkbox-right-angle'),
                labelText: this.capRightAngleAxes
            });
            this.chRightAngle.on('change', _.bind(function(field, newValue, oldValue, eOpts) {
                if (this.api && this.chartProps && this.oView3D) {
                    this.oView3D.asc_setRightAngleAxes(field.getValue()=='checked');
                    this.spnPerspective.setDisabled(field.getValue()=='checked');
                    this.btnNarrow.setDisabled(field.getValue()=='checked');
                    this.btnWiden.setDisabled(field.getValue()=='checked');
                }
            }, this));

            this.chAutoscale = new Common.UI.CheckBox({
                el: $('#id-chart-checkbox-autoscale'),
                labelText: this.capAutoscale
            });
            this.chAutoscale.on('change', _.bind(function(field, newValue, oldValue, eOpts) {
                if (this.api && this.chartProps && this.oView3D){
                    this.oView3D.asc_setHeight(field.getValue()=='checked' ? null : this.spn3DHeight.getNumberValue());
                    this.spn3DHeight.setDisabled(field.getValue()=='checked');
                }
            }, this));

            this.spn3DDepth = new Common.UI.MetricSpinner({
                el: $('#id-chart-spin-3d-depth'),
                step: 10,
                width: 70,
                defaultUnit : "%",
                value: '0 %',
                maxValue: 2000,
                minValue: 0,
                ariaLabel: this.text3dDepth
            });
            this.spn3DDepth.on('change', _.bind(this.on3DDepth, this));

            this.spn3DHeight = new Common.UI.MetricSpinner({
                el: $('#id-chart-spin-3d-height'),
                step: 10,
                width: 70,
                defaultUnit : "%",
                value: '50 %',
                maxValue: 500,
                minValue: 5,
                ariaLabel: this.text3dHeight
            });
            this.spn3DHeight.on('change', _.bind(this.on3DHeight, this));

            this.linkDefRotation = $('#id-chart-def-rotate-link');
            this.linkDefRotation.on('click', _.bind(this.onDefRotation, this));

            this.spnX.setValue((me.X!==null && me.X !== undefined) ? me.X : '', true);
            this.spnY.setValue((me.Y!==null && me.Y !== undefined) ? me.Y : '', true);
            this.chRightAngle.setValue((me.RightAngle !== null && me.RightAngle !== undefined) ? me.RightAngle : 'indeterminate', true);
            this.spnPerspective.setMinValue((me.Perspective!==null && me.Perspective !== undefined) ? 0.1 : 0);
            this.spnPerspective.setValue((me.Perspective!==null && me.Perspective !== undefined) ? me.Perspective : 0, true);
            this.spnPerspective.setDisabled(!!me.RightAngle);
            this.btnNarrow.setDisabled(!!me.RightAngle);
            this.btnWiden.setDisabled(!!me.RightAngle);
            this.spn3DDepth.setValue((me.Depth!==null && me.Depth !== undefined) ? me.Depth : '', true);
            this.chAutoscale.setValue(me.Height3d===null, true);
            (me.Height3d!==null) && this.spn3DHeight.setValue(me.Height3d, true);
            this.spn3DHeight.setDisabled(me.Height3d===null);
        },

        onXRotation: function(field, newValue, oldValue, eOpts){
            if (this.api && this.chartProps && this.oView3D) {
                this.oView3D.asc_setRotX(field.getNumberValue());
            }
        },

        onYRotation: function(field, newValue, oldValue, eOpts){
            if (this.api && this.chartProps && this.oView3D) {
                this.oView3D.asc_setRotY(field.getNumberValue());
            }
        },

        onPerspective: function(field, newValue, oldValue, eOpts){
            if (this.api && this.chartProps && this.oView3D) {
                this.oView3D.asc_setPerspective(field.getNumberValue());
            }
        },

        on3DDepth: function(field, newValue, oldValue, eOpts){
            if (this.api && this.chartProps && this.oView3D) {
                this.oView3D.asc_setDepth(field.getNumberValue());
            }
        },

        on3DHeight: function(field, newValue, oldValue, eOpts){
            if (this.api && this.chartProps && this.oView3D) {
                this.oView3D.asc_setHeight(field.getNumberValue());
            }
        },

        onDefRotation: function() {
            var me = this;
            if (this.api && this.chartProps && this.oView3D) {
                this.oView3D.asc_setRotX(20);
                this.oView3D.asc_setRotY(15);
                me.spnX.setValue(20);
                me.spnY.setValue(15);
            }
        },

        getFocusedComponents: function() {
            return [this.spnX, this.btnRight, this.btnLeft, this.spnY, this.btnUp, this.btnDown, this.spnPerspective,
                this.btnNarrow, this.btnWiden, this.chRightAngle, this.chAutoscale, this.spn3DDepth, this.spn3DHeight].concat(this.getFooterButtons());
        },
        getDefaultFocusableComponent: function () {
            return this.spnX;
        },
        onPrimary: function(event) {
            this._handleInput('ok');
            return false;
        },
        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },
        _handleInput: function(state) {
            var me = this;
            if (this.handler) {
                this.handler.call(this, state, me.oView3D, me.chartProps);
            }
            this.close();
        },
    }, SSE.Views.Charts3DDlg || {}));
});