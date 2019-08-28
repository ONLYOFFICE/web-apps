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
 *  ScaleDialog.js
 *
 *  Created by Julia Svinareva on 21/08/19
 *  Copyright (c) 2019 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/component/Window',
    'common/main/lib/component/ComboBox'
], function () { 'use strict';

    SSE.Views.ScaleDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 215,
            header: true,
            style: 'min-width: 215px;',
            cls: 'modal-dlg'
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this._state = {
                width: 'Auto',
                height: 'Auto'
            };

            this.template = [
                '<div class="box">',
                '<table style="width: 100%;"><tbody>',
                '<tr>',
                '<td><label style="height: 22px;width: 45px;padding-top: 4px;margin-bottom: 8px;">' + this.textWidth + '</label></td>',
                '<td><div id="scale-width" style="margin-bottom: 8px;"></div></td>',
                '<td><label style="width: 45px;height: 22px;padding-top: 4px;margin-bottom: 8px;text-align: right;">' + this.textPages + '</label></td>',
                '</tr>',
                '<tr>',
                '<td><label style="height: 22px;width: 45px;padding-top: 4px;margin-bottom: 8px;">' + this.textHeight + '</label></td>',
                '<td><div id="scale-height" style="margin-bottom: 8px;"></div></td>',
                '<td><label style="width: 45px;height: 22px;padding-top: 4px;margin-bottom: 8px;text-align: right;">' + this.textPages + '</label></td>',
                '</tr>',
                '<tr>',
                '<td><label style="height: 22px;width: 45px;padding-top: 4px;">' + this.textScale + '</label></td>',
                '<td><div id="scale" style=""></div></td>',
                '</tr>',
                '</tbody></table>',
                '</div>',
                '<div class="footer center">',
                '<button class="btn normal dlg-btn primary" result="ok" style="margin-right: 10px;">' + this.okButtonText + '</button>',
                '<button class="btn normal dlg-btn" result="cancel">' + this.cancelButtonText + '</button>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);

            this.api = this.options.api;

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            this.spnScaleWidth = new Common.UI.MetricSpinner({
                el          : $('#scale-width'),
                step        : 1,
                width       : 80,
                value       : 'Auto',
                defaultUnit : '',
                maxValue    : 32767,
                minValue    : 1,
                allowAuto   : true
            });
            this.spnScaleWidth.on('change', _.bind(function (field) {
                this._state.width = field.getValue();
                this.setDisabledScale();
            }, this));

            this.spnScaleHeight = new Common.UI.MetricSpinner({
                el          : $('#scale-height'),
                step        : 1,
                width       : 80,
                value       : 'Auto',
                defaultUnit : '',
                maxValue    : 32767,
                minValue    : 1,
                allowAuto   : true
            });
            this.spnScaleHeight.on('change', _.bind(function (field) {
                this._state.height = field.getValue();
                this.setDisabledScale();
            }, this));

            this.spnScale = new Common.UI.MetricSpinner({
                el          : $('#scale'),
                step        : 5,
                width       : 80,
                value       : '100 %',
                defaultUnit : "%",
                maxValue    : 400,
                minValue    : 10
            });

            var $window = this.getChild();
            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

            this.afterRender();
        },

        afterRender: function() {
            this._setDefaults();
        },

        _handleInput: function(state) {
            if (this.options.handler) {
                this.options.handler.call(this, state,  (state == 'ok') ? this.getSettings() : undefined);
            }
            this.close();
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        onPrimary: function() {
            this._handleInput('ok');
            return false;
        },

        setDisabledScale: function() {
            if (this._state.height !== 'Auto' || this._state.width !== 'Auto') {
                this.spnScale.setValue('100 %');
                this.spnScale.setDisabled(true);
            } else {
                this.spnScale.setDisabled(false);
            }
        },

        _setDefaults: function (props) {
            if (this.api) {
                var pageSetup = this.api.asc_getPageOptions().asc_getPageSetup(),
                    width = pageSetup.asc_getFitToWidth(),
                    height = pageSetup.asc_getFitToHeight(),
                    scale = pageSetup.asc_getScale();
                this._state.width = (width !== null && width !== undefined) ? width : 'Auto';
                this._state.height = (height !== null && height !== undefined) ? height : 'Auto';
                this.spnScaleWidth.setValue(this._state.width);
                this.spnScaleHeight.setValue(this._state.height);
                this.spnScale.setValue((scale !== null && scale !== undefined) ? scale : '100 %');

                this.setDisabledScale();
            }
        },

        getSettings: function () {
            var width = this.spnScaleWidth.getValue(),
                height = this.spnScaleHeight.getValue();
            var props = {};
            props.width = (width !== 'Auto') ? width : null;
            props.height = (height !== 'Auto') ? height : null;
            props.scale = !this.spnScale.disabled ? this.spnScale.getNumberValue() : null;
            return props;
        },

        textTitle: 'Scale Settings',
        cancelButtonText: 'Cancel',
        okButtonText:   'Ok',
        textWidth: 'Width',
        textHeight: 'Height',
        textPages: 'page(s)',
        textScale: 'Scale'

    }, SSE.Views.ScaleDialog || {}))
});