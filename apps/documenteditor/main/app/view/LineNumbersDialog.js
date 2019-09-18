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
            width: 300,
            header: true,
            style: 'min-width: 216px;',
            cls: 'modal-dlg'
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.template = [
                '<div class="box" style="">',
                '<div id="line-numbers-add-line-numbering"></div>',
                '<div>',
                    '<div style="display: inline-block;"><label>' + this.textStartAt + '</label><div id="line-numbers-start-at"></div></div>',
                    '<div style="display: inline-block;"><label>' + this.textFromText + '</label><div id="line-numbers-from-text"></div></div>',
                    '<div style="display: inline-block;"><label>' + this.textCountBy + '</label><div id="line-numbers-count-by"></div></div>',
                '</div>',
                '<div><label>' + this.textNumbering + '</label></div>',
                '<div id="line-numbers-restart-each-page"></div>',
                '<div id="line-numbers-restart-each-section"></div>',
                '<div id="line-numbers-continuous"></div>',
                '</div>',
                '<div class="footer center">',
                '<button class="btn normal dlg-btn primary" result="ok" style="margin-right: 10px;">' + this.okButtonText + '</button>',
                '<button class="btn normal dlg-btn" result="cancel">' + this.cancelButtonText + '</button>',
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
            });

            this.spnStartAt = new Common.UI.MetricSpinner({
                el: $('#line-numbers-start-at'),
                step: 1,
                width: 80,
                defaultUnit : '',
                value: 1,
                maxValue: 32767,
                minValue: 1
            });

            this.spnFromText = new Common.UI.MetricSpinner({
                el: $('#line-numbers-from-text'),
                step: 0.1,
                width: 80,
                defaultUnit : 'cm',
                value: 0.4,
                maxValue: 55.87,
                minValue: 0
            });
            this.spinners.push(this.spnFromText);

            this.spnCountBy = new Common.UI.MetricSpinner({
                el: $('#line-numbers-count-by'),
                step: 1,
                width: 80,
                defaultUnit : '',
                value: 1,
                maxValue: 100,
                minValue: 1
            });

            this.rbRestartEachPage = new Common.UI.RadioBox({
                el: $('#line-numbers-restart-each-page'),
                labelText: this.textRestartEachPage,
                name: 'asc-radio-line-numbers'
            });

            this.rbRestartEachSection = new Common.UI.RadioBox({
                el: $('#line-numbers-restart-each-section'),
                labelText: this.textRestartEachSection,
                name: 'asc-radio-line-numbers'
            });

            this.rbContinuous = new Common.UI.RadioBox({
                el: $('#line-numbers-continuous'),
                labelText: this.textContinuous,
                name: 'asc-radio-line-numbers'
            });


            this.getChild().find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

            this.updateMetricUnit();
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
            return this;
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

        textTitle: 'Line Numbers Settings',
        cancelButtonText: 'Cancel',
        okButtonText: 'Ok',
        textAddLineNumbering: 'Add line numbering',
        textStartAt: 'Start at',
        textFromText: 'From text',
        textCountBy: 'CountBy',
        textNumbering: 'Numbering',
        textRestartEachPage: 'Restart Each Page',
        textRestartEachSection: 'Restart Each Section',
        textContinuous: 'Continuous'
    }, DE.Views.LineNumbersDialog || {}))
});