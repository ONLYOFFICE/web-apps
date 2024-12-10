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
 *  LineNumbersDialog.js
 *
 *  Created on 18/09/19
 *
 */

define([], function () { 'use strict';

    DE.Views.LineNumbersDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 290,
            header: true,
            style: 'min-width: 290px;',
            cls: 'modal-dlg',
            id: 'window-line-numbers',
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.template = [
                '<div class="box">',
                '<div id="line-numbers-add-line-numbering" style="margin-bottom: 15px;"></div>',
                '<div style="margin-bottom: 15px;">',
                    '<div class="margin-right-9" style="display: inline-block;"><label>' + this.textStartAt + '</label><div id="line-numbers-start-at"></div></div>',
                    '<div class="margin-right-9" style="display: inline-block;"><label>' + this.textFromText + '</label><div id="line-numbers-from-text"></div></div>',
                    '<div style="display: inline-block;"><label>' + this.textCountBy + '</label><div id="line-numbers-count-by"></div></div>',
                '</div>',
                '<div style="margin-bottom: 8px;"><label>' + this.textNumbering + '</label></div>',
                '<div id="line-numbers-restart-each-page" style="margin-bottom: 8px;"></div>',
                '<div id="line-numbers-restart-each-section" style="margin-bottom: 8px;"></div>',
                '<div id="line-numbers-continuous" style="margin-bottom: 15px;"></div>',
                '<div style="margin-bottom: 5px;">',
                    '<label>' + this.textApplyTo + '</label><div id="line-numbers-combo-apply" class="input-group-nr" style="width:150px;"></div>',
                '</div>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);

            this.spinners = [];
            this._noApply = false;

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            this.chAddLineNumbering = new Common.UI.CheckBox({
                el: $('#line-numbers-add-line-numbering'),
                labelText: this.textAddLineNumbering
            }).on('change', _.bind(function(field, newValue, oldValue, eOpts){
                var checked = field.getValue()!=='checked';
                this.spnStartAt.setDisabled(checked);
                this.spnFromText.setDisabled(checked);
                this.spnCountBy.setDisabled(checked);
                this.rbRestartEachPage.setDisabled(checked);
                this.rbRestartEachSection.setDisabled(checked);
                this.rbContinuous.setDisabled(checked);
            }, this));

            this.spnStartAt = new Common.UI.MetricSpinner({
                el: $('#line-numbers-start-at'),
                step: 1,
                width: 80,
                defaultUnit : '',
                value: 1,
                maxValue: 32767,
                minValue: 1,
                disabled: true
            });

            this.spnFromText = new Common.UI.MetricSpinner({
                el: $('#line-numbers-from-text'),
                step: 0.1,
                width: 80,
                defaultUnit : 'cm',
                value: 'Auto',
                autoText    : this.txtAutoText,
                maxValue: 55.87,
                minValue: 0.1,
                allowAuto: true,
                disabled: true
            });
            this.spinners.push(this.spnFromText);

            this.spnCountBy = new Common.UI.MetricSpinner({
                el: $('#line-numbers-count-by'),
                step: 1,
                width: 80,
                defaultUnit : '',
                value: 1,
                maxValue: 100,
                minValue: 1,
                disabled: true
            });

            this.rbRestartEachPage = new Common.UI.RadioBox({
                el: $('#line-numbers-restart-each-page'),
                labelText: this.textRestartEachPage,
                name: 'asc-radio-line-numbers',
                disabled: true,
                checked: true
            });

            this.rbRestartEachSection = new Common.UI.RadioBox({
                el: $('#line-numbers-restart-each-section'),
                labelText: this.textRestartEachSection,
                name: 'asc-radio-line-numbers',
                disabled: true
            });

            this.rbContinuous = new Common.UI.RadioBox({
                el: $('#line-numbers-continuous'),
                labelText: this.textContinuous,
                name: 'asc-radio-line-numbers',
                disabled: true
            });

            this.cmbApply = new Common.UI.ComboBox({
                el: $('#line-numbers-combo-apply'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 150px;',
                takeFocusOnClose: true,
                editable: false,
                data: [
                    { displayValue: this.textSection,   value: Asc.c_oAscSectionApplyType.Current },
                    { displayValue: this.textForward,   value: Asc.c_oAscSectionApplyType.ToEnd },
                    { displayValue: this.textDocument,   value: Asc.c_oAscSectionApplyType.All }
                ]
            });
            this.cmbApply.setValue(this.options.applyTo);

            this.getChild().find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

            this.updateMetricUnit();
        },

        getFocusedComponents: function() {
            return [this.chAddLineNumbering, this.spnStartAt, this.spnFromText, this.spnCountBy, this.rbRestartEachPage, this.rbRestartEachSection, this.rbContinuous, this.cmbApply].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.chAddLineNumbering;
        },

        afterRender: function() {
        },

        setSettings: function (props) {
            if (props) {
                var type = props.get_Restart();
                this.chAddLineNumbering.setValue(true);
                switch (type) {
                    case Asc.c_oAscLineNumberRestartType.Continuous:   this.rbContinuous.setValue(true, true); break;
                    case Asc.c_oAscLineNumberRestartType.NewPage:   this.rbRestartEachPage.setValue(true, true); break;
                    case Asc.c_oAscLineNumberRestartType.NewSection: this.rbRestartEachSection.setValue(true, true); break;
                }
                this.spnStartAt.setValue(props.get_Start()!==null && props.get_Start()!==undefined ? props.get_Start() : '', true);
                this.spnFromText.setValue(props.get_Distance()!==null && props.get_Distance()!==undefined ? Common.Utils.Metric.fnRecalcFromMM(props.get_Distance() * 25.4 / 20 / 72.0) : -1, true);
                this.spnCountBy.setValue(props.get_CountBy()!==null && props.get_CountBy()!==undefined ? props.get_CountBy() : '', true);
            } else
                this.chAddLineNumbering.setValue(false);
        },

        _handleInput: function(state) {
            if (this.options.handler) {
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
            var props;
            if (this.chAddLineNumbering.getValue()==='checked') {
                props = new Asc.CSectionLnNumType();
                if (this.rbContinuous.getValue())
                    props.put_Restart(Asc.c_oAscLineNumberRestartType.Continuous);
                else if (this.rbRestartEachPage.getValue())
                    props.put_Restart(Asc.c_oAscLineNumberRestartType.NewPage);
                else if (this.rbRestartEachSection.getValue())
                    props.put_Restart(Asc.c_oAscLineNumberRestartType.NewSection);
                props.put_Start(this.spnStartAt.getValue()!=='' ? this.spnStartAt.getNumberValue() : undefined);
                var value = this.spnFromText.getNumberValue();
                props.put_Distance(value<0 ? null : parseInt(Common.Utils.Metric.fnRecalcToMM(value) * 72 * 20 / 25.4));
                props.put_CountBy(this.spnCountBy.getValue()!=='' ? this.spnCountBy.getNumberValue() : undefined);
            }
            return {props: props, type: this.cmbApply.getValue()};
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

        textTitle: 'Line Numbers',
        textAddLineNumbering: 'Add line numbering',
        textStartAt: 'Start at',
        textFromText: 'From text',
        textCountBy: 'Count by',
        textNumbering: 'Numbering',
        textRestartEachPage: 'Restart Each Page',
        textRestartEachSection: 'Restart Each Section',
        textContinuous: 'Continuous',
        textApplyTo: 'Apply changes to',
        textDocument: 'Whole document',
        textSection: 'Current section',
        textForward: 'This point forward',
        txtAutoText: 'Auto'
    }, DE.Views.LineNumbersDialog || {}))
});