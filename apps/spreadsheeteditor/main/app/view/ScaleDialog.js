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
 *  ScaleDialog.js
 *
 *  Created on 21/08/19
 *
 */

define([], function () { 'use strict';

    SSE.Views.ScaleDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 215,
            header: true,
            style: 'min-width: 215px;',
            cls: 'modal-dlg',
            id: 'window-scale',
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this._state = {
                width: null,
                height: null
            };

            this.template = [
                '<div class="box">',
                '<div id="radio-fit-to" style="margin-bottom: 4px;"></div>',
                '<div class="padding-left-22">',
                    '<div>',
                        '<label style="height: 22px;width: 55px;padding-top: 4px;display: inline-block;margin-bottom: 4px;">' + this.textWidth + '</label>',
                        '<div id="scale-width" style="display: inline-block;margin-bottom: 4px;"></div>',
                    '</div>',
                    '<div>',
                        '<label style="height: 22px;width: 55px;padding-top: 4px;display: inline-block;margin-bottom: 16px;">' + this.textHeight + '</label>',
                        '<div id="scale-height" style="display: inline-block;margin-bottom: 16px;"></div>',
                    '</div>',
                '</div>',
                '<div id="radio-scale-to" style="margin-bottom: 6px;"></div>',
                '<div id="scale" class="padding-left-22" style="margin-bottom: 6px;"></div>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);

            this.api = this.options.api;
            this._originalProps = this.options.props;

            this.arrDataScale = [
                {displayValue: this.textAuto, value: 0},
                {displayValue: '1 ' + this.textOnePage, value: 1},
                {displayValue: '2 ' + this.textFewPages, value: 2},
                {displayValue: '3 ' + this.textFewPages, value: 3},
                {displayValue: '4 ' + this.textFewPages, value: 4},
                {displayValue: '5 ' + this.textManyPages, value: 5},
                {displayValue: '6 ' + this.textManyPages, value: 6},
                {displayValue: '7 ' + this.textManyPages, value: 7},
                {displayValue: '8 ' + this.textManyPages, value: 8},
                {displayValue: '9 ' + this.textManyPages, value: 9}
            ];

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            this.radioFitTo = new Common.UI.RadioBox({
                el: $('#radio-fit-to'),
                labelText: this.textFitTo,
                name: 'asc-radio-scale'
            });
            this.radioFitTo.on('change', _.bind(this.onRadioScale, this, 'fitto'));

            this.radioScaleTo = new Common.UI.RadioBox({
                el: $('#radio-scale-to'),
                labelText: this.textScaleTo,
                name: 'asc-radio-scale'
            });
            this.radioScaleTo.on('change', _.bind(this.onRadioScale, this, 'scaleto'));

            this.cmbScaleWidth = new Common.UI.ComboBox({
                el: $('#scale-width'),
                cls: 'input-group-nr',
                style: 'width: 90px;',
                menuStyle   : 'min-width: 90px;',
                editable: true,
                data: this.arrDataScale,
                scrollAlwaysVisible: true,
                takeFocusOnClose: true
            }).on('selected', _.bind(this.changeWidthHeight, this, 'width'))
              .on('changed:after', _.bind(this.changeWidthHeight, this, 'width'))
              .on('changed:before', _.bind(this.onChangeComboScale, this, 'width'));

            this.cmbScaleHeight = new Common.UI.ComboBox({
                el: $('#scale-height'),
                cls: 'input-group-nr',
                style: 'width: 90px;',
                menuStyle   : 'min-width: 90px;',
                editable: true,
                data: this.arrDataScale,
                scrollAlwaysVisible: true,
                takeFocusOnClose: true
            }).on('selected', _.bind(this.changeWidthHeight, this, 'height'))
              .on('changed:after', _.bind(this.changeWidthHeight, this, 'height'))
              .on('changed:before', _.bind(this.onChangeComboScale, this, 'height'));

            this.spnScale = new Common.UI.MetricSpinner({
                el          : $('#scale'),
                step        : 1,
                width       : 75,
                defaultUnit : "%",
                maxValue    : 400,
                minValue    : 10,
                defaultValue: '100 %'
            }).on('change', _.bind(function (field) {
                this.radioScaleTo.setValue(true, true);
                this.cmbScaleHeight.setValue(0,true);
                this.cmbScaleWidth.setValue(0,true);
                this._state.width = 0;
                this._state.height = 0;
            }, this));

            var $window = this.getChild();
            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

            this.afterRender();
        },

        getFocusedComponents: function() {
            return [this.radioFitTo, this.cmbScaleWidth, this.cmbScaleHeight, this.radioScaleTo, this.spnScale].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.radioScaleTo.getValue() ? this.spnScale : this.cmbScaleWidth;
        },

        afterRender: function() {
            this._setDefaults(this._originalProps);
        },

        _handleInput: function(state) {
            if (this.options.handler && state === 'ok') {
                this.options.handler.call(this, 'ok', this.getSettings());
            }
            this.close(state);
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        onPrimary: function() {
            this._handleInput('ok');
            return false;
        },

        changeWidthHeight: function (type, field) {
            var value = field.getValue();
            if (typeof(value) === 'string') {
                value = parseInt(value);
                if (isNaN(value)) {
                    value = 0;
                }
            }
            if (type === 'width') {
                this._state.width = value;
            } else {
                this._state.height = value;
            }
            if ((this._state.width === 0 || this._state.width === null) && (this._state.height === 0 || this._state.height === null)) {
                this.radioScaleTo.setValue(true, true);
            } else {
                this.radioFitTo.setValue(true, true);
            }
        },

        onRadioScale: function(type, field, newValue) {
            if (type === 'scaleto') {
                this.cmbScaleHeight.setValue(0,true);
                this._state.height = 0;
                this.cmbScaleWidth.setValue(0,true);
                this._state.width = 0;
            } else {
                this.cmbScaleHeight.setValue(0,true);
                this._state.height = 0;
                this.cmbScaleWidth.setValue(1,true);
                this._state.width = 1;
            }
        },

        _setDefaults: function (props) {
            if (this.api) {
                var pageProps = props ? props : this.api.asc_getPageOptions();
                var pageSetup = pageProps.asc_getPageSetup(),
                    width = pageSetup.asc_getFitToWidth(),
                    height = pageSetup.asc_getFitToHeight(),
                    scale = pageSetup.asc_getScale();
                this._state.width = (width !== null && width !== 0) ? width : null;
                this._state.height = (height !== null && height !== 0) ? height : null;

                width = (width !== null && width !== undefined) ? width : 0;
                height = (height !== null && height !== undefined) ? height : 0;

                if (width === 0 && height === 0) {
                    this.radioScaleTo.setValue(true,true);
                } else {
                    this.radioFitTo.setValue(true,true);
                }

                if (_.findWhere(this.arrDataScale, {value: width})) {
                    this.cmbScaleWidth.setValue(width);
                } else {
                    this.cmbScaleWidth.setRawValue(width.toString() + ' ' + this.getTextPages(width));
                }
                if (_.findWhere(this.arrDataScale, {value: height})) {
                    this.cmbScaleHeight.setValue(height);
                } else {
                    this.cmbScaleHeight.setRawValue(height.toString() + ' ' + this.getTextPages(height));
                }

                this.spnScale.setValue((scale !== null && scale !== undefined) ? scale : '', true);
            }
        },

        getSettings: function () {
            var props = {};
            props.width = (this._state.width === null) ? null : this._state.width;
            props.height = (this._state.height === null) ? null : this._state.height;
            props.scale = this.spnScale.getNumberValue();
            return props;
        },

        getTextPages: function (val) {
            var lastNum = val % 10,
                textPage;
            if (lastNum > 0 && lastNum < 1.001) {
                textPage = this.textOnePage;
            } else if (lastNum > 0 && lastNum < 4.001) {
                textPage = this.textFewPages;
            } else {
                textPage = this.textManyPages;
            }
            return textPage;
        },

        onChangeComboScale: function(type, combo, record, e) {
            var me = this,
                textPage,
                value = record.value.toLowerCase();
            var exprAuto = new RegExp('^\\s*(' + me.textAuto.toLowerCase() + ')\\s*$');
            if (exprAuto.exec(value)) {
                value = 0;
            } else {
                value = parseInt(value);
                !isNaN(value) && (textPage = me.getTextPages(value));
            }
            if (isNaN(value) || value < 0 || value > 32767) {
                Common.UI.error({
                    msg: me.textError,
                    callback: function() {
                        _.defer(function(btn) {
                            Common.NotificationCenter.trigger('edit:complete', me);
                        })
                    }
                });
                value = (type === 'width') ? me._state.width : me._state.height;
                textPage = me.getTextPages(value);
            }
            if (value === null) value = 0;
            if (type === 'width') {
                if (_.findWhere(me.arrDataScale, {value: value})) {
                    me.cmbScaleWidth.setValue(value);
                } else {
                    me.cmbScaleWidth.setValue('');
                    me.cmbScaleWidth.setRawValue(value.toString() + ' ' + textPage);
                }
                me._state.width = value;
            } else if (type === 'height') {
                if (_.findWhere(me.arrDataScale, {value: value})) {
                    me.cmbScaleHeight.setValue(value);
                } else {
                    me.cmbScaleHeight.setValue('');
                    me.cmbScaleHeight.setRawValue(value.toString() + ' ' + textPage);
                }
                me._state.height = value;
            }
        },

        close: function(state) {
            if (this.options.handler && state !== 'ok') {
                this.options.handler.call(this, 'cancel', undefined);
            }
            Common.UI.Window.prototype.close.call(this);
        },

        textTitle: 'Scale Settings',
        textWidth: 'Width',
        textHeight: 'Height',
        textAuto: 'Auto',
        textOnePage: 'page',
        textFewPages: 'pages',
        textManyPages: 'pages',
        textError: 'The entered value is incorrect.',
        textScaleTo: 'Scale To',
        textFitTo: 'Fit To'

    }, SSE.Views.ScaleDialog || {}))
});