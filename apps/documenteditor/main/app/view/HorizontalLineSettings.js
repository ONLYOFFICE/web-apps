define([
    'common/main/lib/view/AdvancedSettingsWindow',
], function () { 'use strict';

    var _lastUnit = 'pct';

    DE.Views.HorizontalLineSettings = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 290,
            id: 'window-horizontalline-settings',
            separator: false
        },

        initialize: function(options) {
            var me = this;

            _.extend(this.options, {
                title: this.textTitle,
                buttons: ['ok', 'cancel'],
                primary: 'ok',
                contentTemplate: _.template([
                    '<div class="settings-panel active">',
                        '<div class="inner-content">',
                            '<table style="width: 100%;">',
                                '<tr>',
                                    '<td class="padding-small">',
                                        '<label class="header">' + me.textSize + '</label>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-large">',
                                        '<label class="input-label" style="display: block;">' + me.textWidth + '</label>',
                                        '<div id="hl-dlg-spn-width" style="display: inline-block;"></div>',
                                        '<div id="hl-dlg-cmb-units" class="input-group-nr margin-left-5" style="display: inline-block; width: 50px;"></div>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-large">',
                                        '<label class="input-label" style="display: block;">' + me.textHeight + '</label>',
                                        '<div id="hl-dlg-spn-height"></div>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-small">',
                                        '<label class="header">' + me.textColor + '</label>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-large">',
                                        '<div id="hl-dlg-chk-color" style="display: inline-block;"></div>',
                                        '<div id="hl-dlg-btn-color" class="margin-left-22" style="display: inline-block;"></div>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-small">',
                                        '<label class="header">' + me.textAlignment + '</label>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-large">',
                                        '<div style="display: flex; gap: 4px;">',
                                            '<div id="hl-dlg-btn-align-left"></div>',
                                            '<div id="hl-dlg-btn-align-center"></div>',
                                            '<div id="hl-dlg-btn-align-right"></div>',
                                        '</div>',
                                    '</td>',
                                '</tr>',
                            '</table>',
                        '</div>',
                    '</div>'
                ].join(''))({scope: me})
            }, options);

            this.hrProps = options.hrProps;
            this.pctMode = true;
            this.widthUnit = 'pct';
            this.colWidthMM = options.colWidth || 210;
            this.color = 'a0a0a0';

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this.cmbUnits = new Common.UI.ComboBox({
                el: $('#hl-dlg-cmb-units'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 50px; width: 50px;',
                editable: false,
                takeFocusOnClose: true,
                data: [
                    {value: 'pct',    displayValue: this.textPct},
                    {value: 'metric', displayValue: this.textCm}
                ]
            });
            this.cmbUnits.on('selected', _.bind(this.onUnitsChanged, this));

            this.spnWidth = new Common.UI.MetricSpinner({
                el: $('#hl-dlg-spn-width'),
                step: 1,
                width: 70,
                defaultUnit: '',
                value: '100',
                maxValue: 100,
                minValue: 0,
                takeFocusOnClose: true
            });

            this.spnHeight = new Common.UI.MetricSpinner({
                el: $('#hl-dlg-spn-height'),
                step: 1,
                width: 70,
                defaultUnit: 'pt',
                value: '1 pt',
                maxValue: 1584,
                minValue: 0,
                takeFocusOnClose: true
            });

            this.chkColor = new Common.UI.CheckBox({
                el: $('#hl-dlg-chk-color'),
                labelText: me.textChkColor
            });

            this.spnWidth._increase = function(suspend) {
                if (!me.pctMode) return Common.UI.MetricSpinner.prototype._increase.call(this, suspend);
                var next = Math.floor(this.getNumberValue()) + 1;
                this.setValue((Math.min(next, this.options.maxValue) + ' %').trim(), suspend);
            };
            this.spnWidth._decrease = function(suspend) {
                if (!me.pctMode) return Common.UI.MetricSpinner.prototype._decrease.call(this, suspend);
                var next = Math.ceil(this.getNumberValue()) - 1;
                this.setValue((Math.max(next, this.options.minValue) + ' %').trim(), suspend);
            };

            this.spnHeight._increase = function(suspend) {
                var next = Math.floor(this.getNumberValue()) + 1;
                this.setValue((Math.min(next, this.options.maxValue) + ' pt').trim(), suspend);
            };
            this.spnHeight._decrease = function(suspend) {
                var next = Math.ceil(this.getNumberValue()) - 1;
                this.setValue((Math.max(next, this.options.minValue) + ' pt').trim(), suspend);
            };

            this.chkColor.on('change', _.bind(this.onColorChanged, this));

            this.btnColor = new Common.UI.ColorButton({
                parentEl: $('#hl-dlg-btn-color'),
                additionalAlign: this.menuAddAlign,
                color: this.color,
                takeFocusOnClose: true
            });
            this.colorPicker = this.btnColor.getPicker();
            this.colorPicker.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
            this.btnColor.on('color:select', function(btn, color) {
                me.color = color;
                if (me.chkColor.getValue() !== 'checked') {
                    me.chkColor.setValue(true, true);
                }
            });

            this.btnAlignLeft = new Common.UI.Button({
                parentEl: $('#hl-dlg-btn-align-left'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-align-left',
                enableToggle: true,
                toggleGroup: 'hl-align-group',
                allowDepress: false
            });
            this.btnAlignLeft.on('click', function() { me.align = 'left'; });

            this.btnAlignCenter = new Common.UI.Button({
                parentEl: $('#hl-dlg-btn-align-center'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-align-center',
                enableToggle: true,
                toggleGroup: 'hl-align-group',
                allowDepress: false
            });
            this.btnAlignCenter.on('click', function() { me.align = 'center'; });

            this.btnAlignRight = new Common.UI.Button({
                parentEl: $('#hl-dlg-btn-align-right'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-align-right',
                enableToggle: true,
                toggleGroup: 'hl-align-group',
                allowDepress: false
            });
            this.btnAlignRight.on('click', function() { me.align = 'right'; });

            this.setDefaults(this.hrProps);
        },

        setDefaults: function(props) {
            if (!props) return;

            var pct   = props.asc_getPct(),
                width = props.asc_getWidth();

            var displayPct = (pct !== null && pct !== undefined && pct > 0)
                ? this.normPct(pct)
                : (width !== null && width !== undefined && width > 0 && this.colWidthMM > 0)
                    ? this.normPct(this.mmToPct(width))
                    : 100;

            var displayMetric = (width !== null && width !== undefined && width > 0)
                ? this.normMetric(Common.Utils.Metric.fnRecalcFromMM(width))
                : this.normMetric(Common.Utils.Metric.fnRecalcFromMM(this.pctToMM(displayPct)));

            this.setWidthUnit(_lastUnit, true);
            this.spnWidth.setValue(_lastUnit === 'pct' ? displayPct : displayMetric, true);
            this.cmbUnits.setValue(_lastUnit);

            var height = props.asc_getHeight();
            var hPt = (height !== null && height !== undefined) ? Math.max(0, this.roundValue(height * 72 / 25.4, 2)) : 1;
            this.spnHeight.setValue(hPt, true);

            var noShade = props.asc_getNoShade();
            this.chkColor.setValue(noShade === true, true);

            if (noShade === true) {
                var color = props.asc_getColor();
                if (color) {
                    this.color = (color.get_type && color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME)
                        ? {color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()), effectValue: color.get_value()}
                        : Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
                }
            }
            this.btnColor.setColor(this.color);
            Common.Utils.ThemeColor.selectPickerColorByEffect(this.color, this.colorPicker);

            var align = props.asc_getAlign() || 'center';
            this.align = align;
            if (align === 'left')        this.btnAlignLeft.toggle(true, true);
            else if (align === 'right')  this.btnAlignRight.toggle(true, true);
            else                         this.btnAlignCenter.toggle(true, true);
        },

        onUnitsChanged: function(combo, record) {
            _lastUnit = record.value;
            this.setWidthUnit(record.value);
        },

        setWidthUnit: function(unit, noConvert) {
            var value = this.spnWidth.getNumberValue(),
                result = value,
                doConvert = noConvert !== true && this.widthUnit !== unit && !isNaN(value);

            if (doConvert) {
                result = (unit === 'pct')
                    ? this.normPct(this.mmToPct(Common.Utils.Metric.fnRecalcToMM(value)))
                    : this.normMetric(Common.Utils.Metric.fnRecalcFromMM(this.pctToMM(value)));
            }

            if (unit === 'pct') {
                this.pctMode = true;
                this.widthUnit = 'pct';
                this.spnWidth.setDefaultUnit('');
                this.spnWidth.setMinValue(1);
                this.spnWidth.setMaxValue(100);
                this.spnWidth.setStep(1);
            } else {
                this.pctMode = false;
                this.widthUnit = 'metric';
                var maxW = this.normMetric(Common.Utils.Metric.fnRecalcFromMM(this.colWidthMM));
                this.spnWidth.setDefaultUnit('');
                this.spnWidth.setMinValue(0);
                this.spnWidth.setMaxValue(maxW);
                this.spnWidth.setStep(Common.Utils.Metric.getCurrentMetric() == Common.Utils.Metric.c_MetricUnits.pt ? 1 : 0.1);
            }

            if (doConvert) {
                this.spnWidth.setValue(result, true);
            } else if (isNaN(value)) {
                this.spnWidth.setValue(unit === 'pct' ? 100 : this.normMetric(Common.Utils.Metric.fnRecalcFromMM(this.colWidthMM)), true);
            }
        },

        roundValue: function(value, precision) {
            var multiplier = Math.pow(10, precision);
            return Math.round(value * multiplier) / multiplier;
        },

        normMetric: function(value) {
            return this.roundValue(value, Common.Utils.Metric.getCurrentMetric() == Common.Utils.Metric.c_MetricUnits.pt ? 0 : 2);
        },

        normPct: function(value) {
            value = this.roundValue(value, 2);
            var rounded = Math.round(value);
            return Math.abs(value - rounded) < 0.05 ? rounded : value;
        },

        pctToMM: function(pct) {
            return this.colWidthMM * pct / 100;
        },

        mmToPct: function(width) {
            return 100 * width / this.colWidthMM;
        },

        onColorChanged: function(field, newValue) {
            if (newValue !== 'checked') {
                this.color = 'a0a0a0';
                this.btnColor.setColor(this.color);
            }
        },

        getSettings: function() {
            var props = this.hrProps;

            if (this.pctMode) {
                props.asc_putPct(this.spnWidth.getNumberValue());
                props.asc_putWidth(null);
            } else {
                var width = this.normMetric(this.spnWidth.getNumberValue());
                props.asc_putPct(null);
                props.asc_putWidth(Common.Utils.Metric.fnRecalcToMM(width));
            }

            props.asc_putHeight(this.spnHeight.getNumberValue() * 25.4 / 72);
            props.asc_putAlign(this.align || 'center');

            var noShade = (this.chkColor.getValue() === 'checked');
            props.asc_putNoShade(noShade);

            if (noShade && this.color) {
                props.asc_putColor(Common.Utils.ThemeColor.getRgbColor(this.color));
            } else {
                props.asc_putColor(null);
            }

            return props;
        },

        textTitle:       'Horizontal line settings',
        textSize:        'Size',
        textWidth:       'Width',
        textHeight:      'Height',
        textColor:       'Color',
        textChkColor:    'Use solid color',
        textAlignment:   'Alignment',
        textAlignLeft:   'Left',
        textAlignCenter: 'Center',
        textAlignRight:  'Right',
        textPct:         '%',
        textCm:          'cm'

    }, DE.Views.HorizontalLineSettings || {}));
});