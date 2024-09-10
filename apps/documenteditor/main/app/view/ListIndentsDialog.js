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
 *  ListIndentsDialog.js
 *
 *  Created on 10/13/22
 *
 */

define([], function () { 'use strict';

    DE.Views.ListIndentsDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 305,
            header: true,
            style: 'min-width: 216px;',
            cls: 'modal-dlg',
            id: 'window-list-indents',
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.props = options.props;
            this.isBullet = options.isBullet || false;

            this.template = [
                '<div class="box" style="height: 85px;">',
                    '<table cols="2" style="width: 100%;">',
                        '<tr>',
                            '<td class="padding-right-10">',
                                '<label class="input-label">' + (this.isBullet ? this.txtPosBullet : this.txtPosNumber) + '</label>',
                                '<div id="id-dlg-indents-align-at" style="margin-bottom: 10px;"></div>',
                            '</td>',
                            '<td>',
                                '<label class="input-label">' + this.txtIndent + '</label>',
                                '<div id="id-dlg-indents-indent" style="margin-bottom: 10px;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td colspan="2">',
                                '<label class="input-label">' + (this.isBullet ? this.txtFollowBullet : this.txtFollowNumber) + '</label>',
                                '<div id="id-dlg-indents-follow" class="input-group-nr" style="width: 100%;margin-bottom: 10px;"></div>',
                            '</td>',
                        '</tr>',
                    '</table>',
                '</div>',
                '<div class="separator horizontal"></div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);

            this.spinners = [];
            this._noApply = false;

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var $window = this.getChild();

            this.spnAlign = new Common.UI.MetricSpinner({
                el: $window.findById('#id-dlg-indents-align-at'),
                step: .1,
                width: 130,
                defaultUnit : "cm",
                defaultValue : 0,
                value: '0 cm',
                maxValue: 55.87,
                minValue: 0
            });
            this.spinners.push(this.spnAlign);
            this.spnAlign.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    this._changedProps.put_NumberPosition(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                }
            }, this));

            this.spnIndents = new Common.UI.MetricSpinner({
                el: $window.findById('#id-dlg-indents-indent'),
                step: .1,
                width: 130,
                defaultUnit : "cm",
                defaultValue : 0,
                value: '0 cm',
                maxValue: 55.87,
                minValue: 0
            });
            this.spinners.push(this.spnIndents);
            this.spnIndents.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    this._changedProps.put_IndentSize(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                }
            }, this));

            this.cmbFollow = new Common.UI.ComboBox({
                el          : $window.find('#id-dlg-indents-follow'),
                menuStyle   : 'min-width: 100%;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [
                    { value: Asc.c_oAscNumberingSuff.Tab, displayValue: this.textTab },
                    { value: Asc.c_oAscNumberingSuff.Space, displayValue: this.textSpace },
                    { value: Asc.c_oAscNumberingSuff.None, displayValue: this.txtNone }
                ],
                takeFocusOnClose: true
            });
            this.cmbFollow.on('selected', _.bind(function (combo, record) {
                if (this._changedProps)
                    this._changedProps.put_Suff(record.value);
            }, this));

            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

            this.updateMetricUnit();
            this._setDefaults(this.props);
        },

        getFocusedComponents: function() {
            return [this.spnAlign, this.spnIndents, this.cmbFollow].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.spnAlign;
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        onPrimary: function(event) {
            this._handleInput('ok');
            return false;
        },

        _handleInput: function(state) {
            this.options.handler && this.options.handler.call(this, state, this._changedProps);
            this.close();
        },

        _setDefaults: function (props) {
            if (props) {
                this.spnAlign.setValue(Common.Utils.Metric.fnRecalcFromMM(props.get_NumberPosition()), true);
                this.spnIndents.setValue(Common.Utils.Metric.fnRecalcFromMM(props.get_IndentSize()), true);
                this.cmbFollow.setValue(props.get_Suff());
                this.isBullet = (props.get_Format() === Asc.c_oAscNumberingFormat.Bullet);
                this._changedProps = props;
            }
        },

        updateMetricUnit: function() {
            if (this.spinners) {
                for (var i=0; i<this.spinners.length; i++) {
                    var spinner = this.spinners[i];
                    spinner.setDefaultUnit(Common.Utils.Metric.getCurrentMetricName());
                    spinner.setStep(Common.Utils.Metric.getCurrentMetric()==Common.Utils.Metric.c_MetricUnits.pt ? 1 : 0.1);
                }
            }

        },

        textTitle: 'List Indents',
        txtPosBullet: 'Bullet position',
        txtPosNumber: 'Number position',
        txtIndent: 'Text indent',
        txtFollowBullet: 'Follow bullet with',
        txtFollowNumber: 'Follow number with',
        textTab: 'Tab character',
        textSpace: 'Space',
        txtNone: 'None'

    }, DE.Views.ListIndentsDialog || {}))
});