/*
 *
 * (c) Copyright Ascensio System SIA 2010-2020
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
 *  LineNumbersDialog.js
 *
 *  Created by Julia Svinareva on 18/09/19
 *  Copyright (c) 2020 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/component/Window',
    'common/main/lib/component/CheckBox',
    'common/main/lib/component/MetricSpinner'
], function () { 'use strict';

    DE.Views.LineNumbersDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 290,
            height: 273,
            header: true,
            style: 'min-width: 290px;',
            cls: 'modal-dlg',
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.template = [
                '<div class="box" style="">',
                '<div id="line-numbers-add-line-numbering" style="margin-bottom: 15px;"></div>',
                '<div style="margin-bottom: 15px;">',
                    '<div style="display: inline-block; margin-right: 9px;"><label>' + this.textStartAt + '</label><div id="line-numbers-start-at"></div></div>',
                    '<div style="display: inline-block; margin-right: 9px;"><label>' + this.textFromText + '</label><div id="line-numbers-from-text"></div></div>',
                    '<div style="display: inline-block;"><label>' + this.textCountBy + '</label><div id="line-numbers-count-by"></div></div>',
                '</div>',
                '<div style="margin-bottom: 8px;"><label>' + this.textNumbering + '</label></div>',
                '<div id="line-numbers-restart-each-page" style="margin-bottom: 8px;"></div>',
                '<div id="line-numbers-restart-each-section" style="margin-bottom: 8px;"></div>',
                '<div id="line-numbers-continuous" style="margin-bottom: 5px;"></div>',
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


            this.getChild().find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

            this.updateMetricUnit();
        },

        afterRender: function() {
        },

        setSettings: function (props) {
            if (props) {
                // var type = props.asc_getType();
                // this.chAddLineNumbering.setValue(type !== case Asc.None);
                // switch (type) {
                //     case Asc.Continuous:   this.rbContinuous.setValue(true, true); break;
                //     case Asc.Page:   this.rbRestartEachPage.setValue(true, true); break;
                //     case Asc.Section: this.rbRestartEachSection.setValue(true, true); break;
                // }
                // this.spnStartAt.setValue(props.get_StartAt()!==null ? props.get_StartAt() : '', true);
                // this.spnFromText.setValue(props.get_FromText()!==null ? (props.get_FromText()<0 ? -1 : Common.Utils.Metric.fnRecalcFromMM(props.get_FromText())) : '', true);
                // this.spnCountBy.setValue(props.get_Count()!==null ? props.get_Count() : '', true);
            }
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
            // var props = new Asc.CDocumentLineNumberProps();
            // if (this.chAddLineNumbering.getValue()!=='checked') {
            //     props.put_Type(Asc.None);
            // } else {
            //     if (this.rbContinuous.getValue())
            //         props.put_Type(Asc.Continuous);
            //     else if (this.rbRestartEachPage.getValue())
            //         props.put_Type(Asc.Page);
            //     else if (this.rbRestartEachSection.getValue())
            //         props.put_Type(Asc.Section);
            //     props.put_StartAt(this.spnStartAt.getNumberValue());
            //     var value = this.spnFromText.getNumberValue();
            //     props.put_FromText(value<0 ? -1 : Common.Utils.Metric.fnRecalcToMM());
            //     props.put_Count(this.spnCountBy.getNumberValue());
            // }
            // return props;
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
        textContinuous: 'Continuous'
    }, DE.Views.LineNumbersDialog || {}))
});