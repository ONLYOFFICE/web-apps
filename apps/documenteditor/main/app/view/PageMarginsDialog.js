/**
 *  PageMarginsDialog.js
 *
 *  Created by Julia Radzhabova on 2/12/16
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/component/Window',
    'common/main/lib/component/MetricSpinner'
], function () { 'use strict';

    DE.Views.PageMarginsDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 215,
            header: true,
            style: 'min-width: 216px;',
            cls: 'modal-dlg',
            id: 'window-page-margins'
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.template = [
                '<div class="box" style="height: 85px;">',
                    '<table cols="2" style="width: 100%;margin-bottom: 10px;">',
                        '<tr>',
                            '<td style="padding-right: 10px;padding-bottom: 8px;">',
                                '<label class="input-label">' + this.textTop + '</label>',
                                '<div id="page-margins-spin-top"></div>',
                            '</td>',
                            '<td style="padding-bottom: 8px;">',
                                '<label class="input-label">' + this.textBottom + '</label>',
                                '<div id="page-margins-spin-bottom"></div>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td class="padding-small" style="padding-right: 10px;">',
                                '<label class="input-label">' + this.textLeft + '</label>',
                                '<div id="page-margins-spin-left"></div>',
                            '</td>',
                            '<td class="padding-small">',
                                '<label class="input-label">' + this.textRight + '</label>',
                                '<div id="page-margins-spin-right"></div>',
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
            this.maxMarginsW = this.maxMarginsH = 0;

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            this.spnTop = new Common.UI.MetricSpinner({
                el: $('#page-margins-spin-top'),
                step: .1,
                width: 86,
                defaultUnit : "cm",
                value: '1 cm',
                maxValue: 55.88,
                minValue: 0
            });
            this.spinners.push(this.spnTop);

            this.spnBottom = new Common.UI.MetricSpinner({
                el: $('#page-margins-spin-bottom'),
                step: .1,
                width: 86,
                defaultUnit : "cm",
                value: '1 cm',
                maxValue: 55.88,
                minValue: 0
            });
            this.spinners.push(this.spnBottom);

            this.spnLeft = new Common.UI.MetricSpinner({
                el: $('#page-margins-spin-left'),
                step: .1,
                width: 86,
                defaultUnit : "cm",
                value: '1 cm',
                maxValue: 55.88,
                minValue: 0
            });
            this.spinners.push(this.spnLeft);

            this.spnRight = new Common.UI.MetricSpinner({
                el: $('#page-margins-spin-right'),
                step: .1,
                width: 86,
                defaultUnit : "cm",
                value: '1 cm',
                maxValue: 55.88,
                minValue: 0
            });
            this.spinners.push(this.spnRight);

            var $window = this.getChild();
            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
            $window.find('input').on('keypress', _.bind(this.onKeyPress, this));

//            this.updateMetricUnit();
        },

        _handleInput: function(state) {
            if (this.options.handler) {
                if (state == 'ok') {
                    var errmsg = null;
                    if (this.spnLeft.getNumberValue() + this.spnRight.getNumberValue() > this.maxMarginsW )
                        errmsg = this.txtMarginsW;
                    else if (this.spnTop.getNumberValue() + this.spnBottom.getNumberValue() > this.maxMarginsH )
                        errmsg = this.txtMarginsH;
                    if (errmsg) {
                        Common.UI.warning({
                            title: this.notcriticalErrorTitle,
                            msg  : errmsg
                        });
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

        onKeyPress: function(event) {
            if (event.keyCode == Common.UI.Keys.RETURN) {
                this._handleInput('ok');
            }
        },

        setSettings: function (props) {
            if (props) {
                this.maxMarginsH = parseFloat((props.get_H()/10. - 0.26).toFixed(4));
                this.maxMarginsW = parseFloat((props.get_W()/10. - 1.27).toFixed(4));
                this.spnTop.setMaxValue(this.maxMarginsH);
                this.spnBottom.setMaxValue(this.maxMarginsH);
                this.spnLeft.setMaxValue(this.maxMarginsW);
                this.spnRight.setMaxValue(this.maxMarginsW);

                this.spnTop.setValue(props.get_TopMargin()/10, true); // this.spnTop.setValue(Common.Utils.Metric.fnRecalcFromMM(props.get_TopMargin()), true);
                this.spnBottom.setValue(props.get_BottomMargin()/10, true);
                this.spnLeft.setValue(props.get_LeftMargin()/10, true);
                this.spnRight.setValue(props.get_RightMargin()/10, true);
            }
        },

        getSettings: function() {
            var props = new CDocumentSectionProps();
            props.put_TopMargin(this.spnTop.getNumberValue()*10); // props.put_TopMargin(Common.Utils.Metric.fnRecalcToMM(this.spnTop.getNumberValue()));
            props.put_BottomMargin(this.spnBottom.getNumberValue()*10);
            props.put_LeftMargin(this.spnLeft.getNumberValue()*10);
            props.put_RightMargin(this.spnRight.getNumberValue()*10);
            return props;
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

        textTitle: 'Margins',
        textTop: 'Top',
        textLeft: 'Left',
        textBottom: 'Bottom',
        textRight: 'Right',
        cancelButtonText:   'Cancel',
        okButtonText:       'Ok',
        notcriticalErrorTitle: 'Warning',
        txtMarginsW: 'Left and right margins are too high for a given page wight',
        txtMarginsH: 'Top and bottom margins are too high for a given page height'
    }, DE.Views.PageMarginsDialog || {}))
});