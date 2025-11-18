/*
 * (c) Copyright Ascensio System SIA 2010-2025
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
 *  SolverMethodDialog.js
 *
 *  Created on 10.15.2025
 *
 */
define([], function () { 'use strict';
    SSE.Views.SolverMethodDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 290,
            header: true,
            style: 'min-width: 290px;',
            cls: 'modal-dlg',
            id: 'window-solver-method-dlg',
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.txtTitle
            }, options || {});

            this.template = [
                '<div class="box">',
                    '<table cols="2" style="width: 100%;">',
                        '<tr>',
                            '<td style="padding-bottom: 10px;">',
                                '<label class="margin-right-5">' + this.txtPrecision + '</label>',
                            '</td>',
                            '<td style="padding-bottom: 10px;">',
                                '<div id="smethod-txt-precision" class="float-right" style="display: inline-block;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td colspan="2" style="padding-bottom: 15px;">',
                                '<div id="smethod-chk-auto-scaling"></div>',
                            '</td>',
                        '</tr>',
                        // '<tr>',
                        //     '<td colspan="2" style="padding-bottom: 10px;">',
                        //         '<label class="font-weight-bold">' + this.txtSolverInt + '</label>',
                        //     '</td>',
                        // '</tr>',
                        // '<tr>',
                        //     '<td colspan="2" style="padding-bottom: 10px;">',
                        //         '<div id="smethod-chk-ignore"></div>',
                        //     '</td>',
                        // '</tr>',
                        // '<tr>',
                        //     '<td style="padding-bottom: 15px;">',
                        //         '<label class="margin-right-5">' + this.txtOptimality + '</label>',
                        //     '</td>',
                        //     '<td style="padding-bottom: 15px;">',
                        //         '<div id="smethod-txt-optimality" class="float-right" style="display: inline-block;"></div>',
                        //     '</td>',
                        // '</tr>',
                        '<tr>',
                            '<td colspan="2" style="padding-bottom: 5px;">',
                                '<label class="font-weight-bold">' + this.txtSolverLimits + '</label>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td style="padding-bottom: 10px;">',
                                '<label class="margin-right-5">' + this.txtMaxTime + '</label>',
                            '</td>',
                            '<td style="padding-bottom: 10px;">',
                                '<div id="smethod-txt-maxtime" class="float-right" style="display: inline-block;"></div>',
                            '</td>',
                        '</tr>',
                        '</tr>',
                            '<td style="padding-bottom: 5px;">',
                                '<label class="margin-right-5">' + this.txtIterations + '</label>',
                            '</td>',
                            '<td style="padding-bottom: 5px;">',
                                '<div id="smethod-txt-iterations" class="float-right" style="display: inline-block;"></div>',
                            '</td>',
                        '</tr>',
                    '</table>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);
            this._changedProps = null;
            this._noApply = false;

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);
            var $window = this.getChild();

            this.chAuto = new Common.UI.CheckBox({
                el: $window.find('#smethod-chk-auto-scaling'),
                labelText: this.txtAutoScale
            }).on('change', _.bind(function(field, newValue, oldValue, eOpts){
                this._autoChanged = true;
            }, this));

            // this.chIgnore = new Common.UI.CheckBox({
            //     el: $window.find('#smethod-chk-ignore'),
            //     labelText: this.txtIgnore
            // }).on('change', _.bind(function(field, newValue, oldValue, eOpts){
            //     this._ignoreChanged = true;
            // }, this));

            this.inputPrecision = new Common.UI.InputField({
                el: $window.find('#smethod-txt-precision'),
                style: 'width: 80px;',
                maskExp     : /[0-9,\.]/,
                value: '0.000001',
                validateOnBlur: false,
                hideErrorOnInput: true
            }).on('changed:after', _.bind(function(input, newValue, oldValue) {
                (newValue !== oldValue) && (this._precisionChanged = true);
            }, this));

            // this.inputOptimality = new Common.UI.InputField({
            //     el: $window.find('#smethod-txt-optimality'),
            //     style: 'width: 80px;',
            //     maskExp     : /[0-9]/,
            //     value: '1',
            //     validateOnBlur: false,
            //     hideErrorOnInput: true
            // }).on('changed:after', _.bind(function(input, newValue, oldValue) {
            //     (newValue !== oldValue) && (this._optimalityChanged = true);
            // }, this));
            // this.inputOptimality.setValue();

            this.inputMaxTime = new Common.UI.InputField({
                el: $window.find('#smethod-txt-maxtime'),
                style: 'width: 80px;',
                maskExp     : /[0-9]/,
                validateOnBlur: false,
                hideErrorOnInput: true
            }).on('changed:after', _.bind(function(input, newValue, oldValue) {
                (newValue !== oldValue) && (this._maxTimeChanged = true);
            }, this));

            this.inputIterations = new Common.UI.InputField({
                el: $window.find('#smethod-txt-iterations'),
                style: 'width: 80px;',
                maskExp     : /[0-9]/,
                validateOnBlur: false,
                hideErrorOnInput: true
            }).on('changed:after', _.bind(function(input, newValue, oldValue) {
                (newValue !== oldValue) && (this._iterationsChanged = true);
            }, this));

            this.getChild().find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
        },

        getFocusedComponents: function() {
            return [this.inputPrecision, this.chAuto, /*this.chIgnore, this.inputOptimality, */ this.inputMaxTime, this.inputIterations].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.inputPrecision;
        },

        setSettings: function (props) {
            if (props) {
                this.chAuto.setValue(!!props.asc_getAutomaticScaling(), true);
                // this.chIgnore.setValue(!!props.asc_getIgnoreIntConstraints(), true);
                this.inputPrecision.setValue(props.asc_getConstraintPrecision());
                // this.inputOptimality.setValue(props.asc_getIntOptimal());
                this.inputMaxTime.setValue(props.asc_getMaxTime());
                this.inputIterations.setValue(props.asc_getIterations());
            }
            this._changedProps = props || new AscCommon.asc_COptions();
        },

        _handleInput: function(state) {
            if (this.options.handler) {
                if (state === 'ok') {
                    var val = this.inputPrecision.getValue();
                    if (!Common.UI.isValidNumber(val) || parseFloat(val)>=1 || parseFloat(val)<0) {
                        this.inputPrecision.showError([this.txtPrecisionInvalid]);
                        this.inputPrecision.focus();
                        return;
                    }

                    // val = this.inputOptimality.getValue();
                    // if (!_.isEmpty(val) && (!Common.UI.isValidNumber(val) || (parseFloat(val) % 1 !== 0) || parseFloat(val)>=100 || parseFloat(val)<0)) {
                    //     this.inputOptimality.showError([this.txtOptimalityInvalid]);
                    //     this.inputOptimality.focus();
                    //     return;
                    // }

                    val = this.inputMaxTime.getValue();
                    if (!_.isEmpty(val) && (!Common.UI.isValidNumber(val) || (parseFloat(val) % 1 !== 0))) {
                        this.inputMaxTime.showError([this.txtMaxTimeInvalid]);
                        this.inputMaxTime.focus();
                        return;
                    }

                    val = this.inputIterations.getValue();
                    if (!_.isEmpty(val) && (!Common.UI.isValidNumber(val) || (parseFloat(val) % 1 !== 0))) {
                        this.inputIterations.showError([this.txtIterationsInvalid]);
                        this.inputIterations.focus();
                        return;
                    }
                }

                this.options.handler.call(this, this, state);
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

        getSettings: function() {
            if (this._changedProps) {
                this._precisionChanged && this._changedProps.asc_setConstraintPrecision(this.inputPrecision.getValue());
                // this._optimalityChanged && this._changedProps.asc_setIntOptimal(this.inputOptimality.getValue());
                this._maxTimeChanged && this._changedProps.asc_setMaxTime(this.inputMaxTime.getValue());
                this._iterationsChanged && this._changedProps.asc_setIterations(this.inputIterations.getValue());
                this._autoChanged && this._changedProps.asc_setAutomaticScaling(this.chAuto.getValue()==='checked');
                // this._ignoreChanged && this._changedProps.asc_setIgnoreIntConstraints(this.chIgnore.getValue()==='checked');
            }
            return this._changedProps;
        },

    }, SSE.Views.SolverMethodDialog || {}))
});