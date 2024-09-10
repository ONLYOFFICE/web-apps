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
 *  TextToTableDialog.js
 *
 *  Created on 15/04/21
 *
 */

define([
    'common/main/lib/view/AdvancedSettingsWindow',
], function () { 'use strict';

    DE.Views.TextToTableDialog = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 300,
            separator: false
        },

        initialize : function(options) {
            var me = this;

            _.extend(this.options, {
                title: this.textTitle,
                contentStyle: 'padding: 0 5px;',
                contentTemplate: _.template([
                    '<div class="settings-panel active">',
                        '<div class="inner-content">',
                            '<table cols="2" style="width: auto;">',
                                '<tr>',
                                    '<td colspan="2" class="padding-small">',
                                        '<label class="header">', me.textTableSize,'</label>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-small">',
                                        '<label class="margin-right-10">', me.textColumns,'</label>',
                                    '</td>',
                                    '<td class="padding-small">',
                                        '<div id="id-text-table-spn-columns"></div>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-large">',
                                        '<label class="margin-right-10">', me.textRows,'</label>',
                                    '</td>',
                                    '<td class="padding-large">',
                                        '<div id="id-text-table-spn-rows"></div>',
                                    '</td>',
                                '</tr>',
                            '</table>',
                            '<table cols="1">',
                                '<tr>',
                                    '<td  style="padding-bottom: 5px;">',
                                        '<label class="header">', me.textAutofit,'</label>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td style="padding-bottom: 5px;">',
                                        '<div id="id-text-table-radio-fixed" class="margin-right-10"></div>',
                                        '<div id="id-text-table-spn-fixed"></div>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-small">',
                                        '<div id="id-text-table-radio-contents"></div>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-large">',
                                        '<div id="id-text-table-radio-window"></div>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-small">',
                                        '<label class="header">', me.textSeparator,'</label>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-small">',
                                        '<div id="id-text-table-radio-para"></div>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-small">',
                                        '<div id="id-text-table-radio-tabs"></div>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td style="padding-bottom: 5px;">',
                                        '<div id="id-text-table-radio-semi"></div>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-small">',
                                        '<div id="id-text-table-radio-other" class="margin-right-10" style="display: inline-block;vertical-align: middle;"></div>',
                                        '<div id="id-text-table-txt-other" style="display: inline-block;vertical-align: middle;"></div>',
                                    '</td>',
                                '</tr>',
                            '</table>',
                        '</div></div>'
                ].join(''))({scope: this})
            }, options);

            this.handler    = options.handler;
            this.props      = options.props;
            this.spinners = [];

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);

            var $window = this.getChild(),
                me = this;

            this.spnColumns = new Common.UI.MetricSpinner({
                el          : $window.find('#id-text-table-spn-columns'),
                step        : 1,
                width       : 80,
                value       : 2,
                defaultUnit : '',
                maxValue    : 63,
                minValue    : 1,
                allowDecimal: false
            }).on('change', function(field, newValue, oldValue, eOpts){
                if (me.props) {
                    var size = me.props.put_ColsCount(field.getNumberValue(), true);
                    size && me.spnRows.setValue(size[0], true);
                }
            });

            this.spnRows = new Common.UI.MetricSpinner({
                el          : $window.find('#id-text-table-spn-rows'),
                step        : 1,
                width       : 80,
                value       : 2,
                defaultUnit : '',
                maxValue    : 100,
                minValue    : 1,
                allowDecimal: false,
                disabled: true
            });

            this.spnWidth = new Common.UI.MetricSpinner({
                el: $window.find('#id-text-table-spn-fixed'),
                step: 0.1,
                width: 80,
                defaultUnit : 'cm',
                value: 'Auto',
                autoText    : this.txtAutoText,
                maxValue: 55.87,
                minValue: 0.42,
                allowAuto: true
            });
            this.spinners.push(this.spnWidth);

            this.rbFixed = new Common.UI.RadioBox({
                el: $window.find('#id-text-table-radio-fixed'),
                labelText: this.textFixed,
                name: 'asc-radio-text-table-autofit',
                value: 1,
                checked: true
            }).on('change', _.bind(this.onRadioAutofitChange, this));
            this.rbContents = new Common.UI.RadioBox({
                el: $window.find('#id-text-table-radio-contents'),
                labelText: this.textContents,
                name: 'asc-radio-text-table-autofit',
                value: 2
            }).on('change', _.bind(this.onRadioAutofitChange, this));
            this.rbWindow = new Common.UI.RadioBox({
                el: $window.find('#id-text-table-radio-window'),
                labelText: this.textWindow,
                name: 'asc-radio-text-table-autofit',
                value: 3
            }).on('change', _.bind(this.onRadioAutofitChange, this));

            this.rbPara = new Common.UI.RadioBox({
                el: $window.find('#id-text-table-radio-para'),
                labelText: this.textPara,
                name: 'asc-radio-text-table-separator',
                value: 1,
                checked: true
            }).on('change', _.bind(this.onRadioSeparatorChange, this));

            this.rbTabs = new Common.UI.RadioBox({
                el: $window.find('#id-text-table-radio-tabs'),
                labelText: this.textTab,
                name: 'asc-radio-text-table-separator',
                value: 2
            }).on('change', _.bind(this.onRadioSeparatorChange, this));

            this.rbSemi = new Common.UI.RadioBox({
                el: $window.find('#id-text-table-radio-semi'),
                labelText: this.textSemicolon,
                name: 'asc-radio-text-table-separator',
                value: ';'
            }).on('change', _.bind(this.onRadioSeparatorChange, this));

            this.rbOther = new Common.UI.RadioBox({
                el: $window.find('#id-text-table-radio-other'),
                labelText: this.textOther,
                name: 'asc-radio-text-table-separator',
                value: 3
            }).on('change', _.bind(this.onRadioSeparatorChange, this));

            this.inputOther = new Common.UI.InputField({
                el          : $window.find('#id-text-table-txt-other'),
                style       : 'width: 30px;',
                maxLength: 1,
                validateOnChange: true,
                validateOnBlur: false,
                value: Common.Utils.InternalSettings.get("de-text-to-table-separator") || '-'
            }).on ('changing', function(input, newValue) {
                if (me.props && newValue) {
                    me.props.put_SeparatorType(3, true);
                    var size = me.props.put_Separator(newValue.charCodeAt(0), true);
                    if (size) {
                        me.spnColumns.setValue(size[1], true);
                        me.spnRows.setValue(size[0], true);
                    }
                }
            });

            this.afterRender();
        },

        getFocusedComponents: function() {
            return [this.spnColumns, this.spnStartAt, this.spnWidth, this.rbFixed, this.rbContents, this.rbWindow, this.rbPara, this.rbTabs, this.rbSemi, this.rbOther, this.inputOther].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.spnColumns;
        },

        afterRender: function() {
            this.updateMetricUnit();
            this._setDefaults(this.props);
        },

        _setDefaults: function (props) {
            if (props) {
                var val = props.get_Size();
                this.spnColumns.setValue(val[1], true);
                this.spnRows.setValue(val[0], true);

                val = props.get_AutoFitType();
                (val===1) ? this.rbFixed.setValue(true, true) : (val===2 ? this.rbContents.setValue(true, true) : this.rbWindow.setValue(true, true));
                (val===1) && this.spnWidth.setValue(props.get_Fit()>-1 ? Common.Utils.Metric.fnRecalcFromMM(props.get_Fit()) : -1, true);
                this.spnWidth.setDisabled(val!==1);

                val = props.get_SeparatorType();
                switch (val) {
                    case 1:
                        this.rbPara.setValue(true, true);
                        this.inputOther.setDisabled(true);
                        break;
                    case 2:
                        this.rbTabs.setValue(true, true);
                        this.inputOther.setDisabled(true);
                        break;
                    case 3:
                        val = String.fromCharCode(props.get_Separator());
                        if (val == ';') {
                            this.rbSemi.setValue(true, true);
                            this.inputOther.setDisabled(true);
                        } else {
                            this.rbOther.setValue(true, true);
                            this.inputOther.setValue(val);
                            this.inputOther.setDisabled(false);
                        }
                        break;
                }
            }
        },

        getSettings: function () {
            if (this.props) {
                this.props.put_AutoFitType(this.rbFixed.getValue() ? 1 : (this.rbContents.getValue() ? 2 : 3));
                this.rbFixed.getValue() && this.props.put_Fit(Common.Utils.Metric.fnRecalcToMM(this.spnWidth.getNumberValue()));
                this.rbOther.getValue() && Common.Utils.InternalSettings.set("de-text-to-table-separator", String.fromCharCode(this.props.get_Separator()));
            }

            return this.props;
        },

        onDlgBtnClick: function(event) {
            var state = (typeof(event) == 'object') ? event.currentTarget.attributes['result'].value : event;
            if (state == 'ok') {
                if (!this.isRangeValid()) return;
                this.handler && this.handler.call(this, state,  (state == 'ok') ? this.getSettings() : undefined);
            }

            this.close();
        },

        onPrimary: function() {
            this.onDlgBtnClick('ok');
            return false;
        },

        isRangeValid: function() {
            if (this.rbOther.getValue() && this.inputOther.getValue()=='') {
                var me = this;
                Common.UI.warning({
                    msg: this.textEmpty,
                    maxwidth: 600,
                    callback: function(btn){
                        me.inputOther.focus();
                    }});
                return false;
            }
            return true;
        },

        onRadioAutofitChange: function(field, newValue, eOpts) {
            var value = field.options.value,
                me = this;
            if (newValue && this.props) {
                me.spnWidth.setDisabled(value!==1);
                (value==1) && setTimeout(function(){me.spnWidth.focus(); }, 1);
            }
        },

        onRadioSeparatorChange: function(field, newValue, eOpts) {
            var value = field.options.value,
                me = this,
                size;
            if (newValue && this.props) {
                this.inputOther.setDisabled(value!==3);
                if (typeof value === 'string') {
                    size = this.props.put_Separator(value.charCodeAt(0), true);
                } else {
                    if (value==3) {
                        if (this.inputOther.getValue())
                            size = this.props.put_Separator(this.inputOther.getValue().charCodeAt(0), true);
                        setTimeout(function(){ me.inputOther.focus(); }, 1);
                    } else {
                        size = this.props.put_SeparatorType(value, true);
                    }
                }
                if (size) {
                    this.spnColumns.setValue(size[1], true);
                    this.spnRows.setValue(size[0], true);
                }
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

        textTitle: 'Convert Text to Table',
        textTableSize: 'Table Size',
        textColumns: 'Columns',
        textRows: 'Rows',
        textAutofit: 'Autofit Behavior',
        textFixed: 'Fixed column width',
        textContents: 'Autofit to contents',
        textWindow: 'Autofit to window',
        textSeparator: 'Separate Text at',
        textPara: 'Paragraphs',
        textTab: 'Tabs',
        textSemicolon: 'Semicolons',
        textOther: 'Other',
        txtAutoText: 'Auto',
        textEmpty: 'You must type a character for the custom separator.'
    }, DE.Views.TextToTableDialog || {}))
});