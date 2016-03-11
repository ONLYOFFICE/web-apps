/**
 *  PageSizeDialog.js
 *
 *  Created by Julia Radzhabova on 2/16/16
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/component/Window',
    'common/main/lib/component/MetricSpinner'
], function () { 'use strict';

    DE.Views.PageSizeDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 215,
            header: true,
            style: 'min-width: 216px;',
            cls: 'modal-dlg',
            id: 'window-page-size'
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.template = [
                '<div class="box" style="height: 40px;">',
                    '<table cols="2" style="width: 100%;margin-bottom: 10px;">',
                        '<tr>',
                            '<td class="padding-small" style="padding-right: 10px;">',
                                '<label class="input-label">' + this.textWidth + '</label>',
                                '<div id="page-size-spin-width"></div>',
                            '</td>',
                            '<td class="padding-small">',
                                '<label class="input-label">' + this.textHeight + '</label>',
                                '<div id="page-size-spin-height"></div>',
                            '</td>',
                        '</tr>',
                    '</table>',
                '</div>',
                '<div class="separator horizontal"/>',
                '<div class="footer center">',
                    '<button class="btn normal dlg-btn primary" result="ok" style="margin-right: 10px;">' + this.okButtonText + '</button>',
                    '<button class="btn normal dlg-btn" result="cancel">' + this.cancelButtonText + '</button>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template, this.options);

            this.spinners = [];
            this._noApply = false;

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            this.spnWidth = new Common.UI.MetricSpinner({
                el: $('#page-size-spin-width'),
                step: .1,
                width: 86,
                defaultUnit : "cm",
                value: '10 cm',
                maxValue: 55.88,
                minValue: 0
            });
            this.spinners.push(this.spnWidth);

            this.spnHeight = new Common.UI.MetricSpinner({
                el: $('#page-size-spin-height'),
                step: .1,
                width: 86,
                defaultUnit : "cm",
                value: '20 cm',
                maxValue: 55.88,
                minValue: 0
            });
            this.spinners.push(this.spnHeight);

            var $window = this.getChild();
            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
            $window.find('input').on('keypress', _.bind(this.onKeyPress, this));

//            this.updateMetricUnit();
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

        onKeyPress: function(event) {
            if (event.keyCode == Common.UI.Keys.RETURN) {
                this._handleInput('ok');
            }
        },

        setSettings: function (props) {
            if (props) {
                this.spnWidth.setMinValue(parseFloat((props.get_LeftMargin()/10+props.get_RightMargin()/10.).toFixed(4)) + 1.27);
                this.spnWidth.setValue(props.get_W()/10, true); // this.spnWidth.setValue(Common.Utils.Metric.fnRecalcFromMM(props[0]), true);
                this.spnHeight.setMinValue(parseFloat((props.get_TopMargin()/10+props.get_BottomMargin()/10.).toFixed(4)) + 0.26);
                this.spnHeight.setValue(props.get_H()/10, true);
            }
        },

        getSettings: function() {
            return [this.spnWidth.getNumberValue()*10, this.spnHeight.getNumberValue()*10]; //Common.Utils.Metric.fnRecalcToMM(this.spnWidth.getNumberValue())
        },

        updateMetricUnit: function() {
            if (this.spinners) {
                for (var i=0; i<this.spinners.length; i++) {
                    var spinner = this.spinners[i];
                    spinner.setDefaultUnit(Common.Utils.Metric.metricName[Common.Utils.Metric.getCurrentMetric()]);
                    spinner.setStep(Common.Utils.Metric.getCurrentMetric()==Common.Utils.Metric.c_MetricUnits.cm ? 0.1 : 1);
                }
            }

        },

        textTitle: 'Page Size',
        textWidth: 'Width',
        textHeight: 'Height',
        cancelButtonText:   'Cancel',
        okButtonText:       'Ok'
    }, DE.Views.PageSizeDialog || {}))
});