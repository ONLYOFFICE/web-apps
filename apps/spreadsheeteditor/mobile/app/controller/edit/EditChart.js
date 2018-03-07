/*
 *
 * (c) Copyright Ascensio System Limited 2010-2018
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
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia,
 * EU, LV-1021.
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
 *  EditChart.js
 *  Spreadsheet Editor
 *
 *  Created by Alexander Yuzhin on 12/12/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */


define([
    'core',
    'spreadsheeteditor/mobile/app/view/edit/EditChart',
    'jquery',
    'underscore',
    'backbone',
    'common/mobile/lib/component/ThemeColorPalette'
], function (core, view, $, _, Backbone) {
    'use strict';

    SSE.Controllers.EditChart = Backbone.Controller.extend(_.extend((function() {
        var _stack = [],
            _chartObject = undefined,
            _shapeObject = undefined,
            _borderInfo = {color: '000000', width: 1},
            _metricText = Common.Utils.Metric.getCurrentMetricName(),
            _isEdit = false;

        var borderSizeTransform = (function() {
            var _sizes = [0, 0.5, 1, 1.5, 2.25, 3, 4.5, 6];

            return {
                sizeByIndex: function (index) {
                    if (index < 1) return _sizes[0];
                    if (index > _sizes.length - 1) return _sizes[_sizes.length - 1];
                    return _sizes[index];
                },

                indexSizeByValue: function (value) {
                    var index = 0;
                    _.each(_sizes, function (size, idx) {
                        if (Math.abs(size - value) < 0.25) {
                            index = idx;
                        }
                    });

                    return index
                },

                sizeByValue: function (value) {
                    return _sizes[this.indexSizeByValue(value)];
                }
            }
        })();

        return {
            models: [],
            collections: [],
            views: [
                'EditChart'
            ],

            initialize: function () {
                Common.NotificationCenter.on('editcontainer:show', _.bind(this.initEvents, this));

                this.addListeners({
                    'EditChart': {
                        'page:show' : this.onPageShow
                    }
                });
            },

            setApi: function (api) {
                var me = this;
                me.api = api;

                me.api.asc_registerCallback('asc_onSelectionChanged',   _.bind(me.onApiSelectionChanged, me));
                me.api.asc_registerCallback('asc_onFocusObject',        _.bind(me.onApiFocusObject, me));

                me.api.asc_registerCallback('asc_onUpdateChartStyles',  _.bind(me.onApiUpdateChartStyles, me));
                // me.api.asc_registerCallback('asc_onSelectionChanged',           _.bind(me.onApiSelectionChanged, me));
                // me.api.asc_registerCallback('asc_onEditorSelectionChanged',     _.bind(me.onApiEditorSelectionChanged, me));
                // me.api.asc_registerCallback('asc_onInitEditorStyles',           _.bind(me.onApiInitEditorStyles, me)); // TODO: It does not work until the error in the SDK
            },

            setMode: function (mode) {
                _isEdit = mode.isEdit;
            },

            onLaunch: function () {
                this.createView('EditChart').render();
            },

            initEvents: function () {
                var me = this;

                me.initSettings();
            },

            onPageShow: function (view, pageId) {
                var me = this;

                me.initSettings(pageId);
            },

            initSettings: function (pageId) {
                if ($('#edit-chart').length < 1) {
                    return;
                }

                var me = this;

                if ('#edit-chart-style' == pageId) {
                    me.initStylePage();
                } else if ('#edit-chart-border-color-view' == pageId) {
                    me.initBorderColorPage();
                } else if ('#edit-chart-layout' == pageId) {
                    me.initLayoutPage();
                } else if ('#edit-chart-vertical-axis' == pageId) {
                    me.initVertAxisPage();
                } else if ('#edit-chart-horizontal-axis' == pageId) {
                    me.initHorAxisPage();
                } else if ('#edit-chart-reorder' == pageId) {
                    me.initReorderPage();
                } else {
                    me.initRootPage();
                }
            },

            // Public

            getStack: function() {
                return _stack;
            },

            getChart: function () {
                return _chartObject;
            },

            initRootPage: function () {
                $('#chart-remove').single('click', _.bind(this.onRemoveChart, this));

                if (!_.isUndefined(_chartObject)) {
                    this.updateAxisProps(_chartObject.get_ChartProperties().getType());
                }
            },

            initStylePage: function () {
                var me = this,
                    color,
                    chartProperties = _chartObject.get_ChartProperties(),
                    shapeProperties = _shapeObject.get_ShapeProperties();

                // Type

                var type = chartProperties.getType();
                $('.chart-types li').removeClass('active');
                $('.chart-types li[data-type=' + type + ']').addClass('active');
                $('#tab-chart-type li').single('click', _.buffered(me.onType, 100, me));

                // Styles

                _.defer(function () {
                    me._updateChartStyles(me.api.asc_getChartPreviews(_chartObject.get_ChartProperties().getType()));
                });

                // Fill

                var paletteFillColor = new Common.UI.ThemeColorPalette({
                    el: $('#tab-chart-fill'),
                    transparent: true
                });

                paletteFillColor.on('select', _.bind(me.onFillColor, me));

                var fill = shapeProperties.asc_getFill(),
                    fillType = fill.asc_getType();

                if (fillType == Asc.c_oAscFill.FILL_TYPE_SOLID) {
                    color = me._sdkToThemeColor(fill.asc_getFill().asc_getColor());
                }

                paletteFillColor.select(color);

                // Init border

                var borderSize = shapeProperties.get_stroke().get_width() * 72.0 / 25.4,
                    borderType = shapeProperties.get_stroke().get_type();
                $('#edit-chart-bordersize input').val([(borderType == Asc.c_oAscStrokeType.STROKE_NONE) ? 0 : borderSizeTransform.indexSizeByValue(borderSize)]);
                $('#edit-chart-bordersize .item-after').text(((borderType == Asc.c_oAscStrokeType.STROKE_NONE) ? 0 : borderSizeTransform.sizeByValue(borderSize)) + ' ' + _metricText);

                $('#edit-chart-bordersize input').single('change touchend', _.buffered(me.onBorderSize, 100, me));
                $('#edit-chart-bordersize input').single('input',           _.bind(me.onBorderSizeChanging, me));

                // Init border color
                me._initBorderColorView();
            },

            _initBorderColorView: function () {
                var me = this,
                    stroke = _shapeObject.get_ShapeProperties().get_stroke();

                _borderInfo.color = (stroke && stroke.get_type() == Asc.c_oAscStrokeType.STROKE_COLOR) ? me._sdkToThemeColor(stroke.get_color()) : 'transparent';

                $('#edit-chart-bordercolor .color-preview').css('background-color',
                    ('transparent' == _borderInfo.color)
                        ? _borderInfo.color
                        : ('#' + (_.isObject(_borderInfo.color) ? _borderInfo.color.color : _borderInfo.color))
                );
            },

            initLayoutPage: function () {
                var me = this,
                    chartProperties = _chartObject.get_ChartProperties(),
                    chartType = chartProperties.getType(),
                    $layoutPage = $('.page[data-page=edit-chart-layout]');

                var setValue = function (id, value) {
                    var textValue = $layoutPage.find('select[name=' + id + ']')
                        .val(value)
                        .find('option[value='+ value +']')
                        .text();
                    $layoutPage.find('#' + id + ' .item-after').text(textValue);
                };

                // Init legend position values

                var dataLabelPos = [
                    { value: Asc.c_oAscChartDataLabelsPos.none, displayValue: me.textNone },
                    { value: Asc.c_oAscChartDataLabelsPos.ctr, displayValue: me.textCenter }
                ];

                if (chartType == Asc.c_oAscChartTypeSettings.barNormal ||
                    chartType == Asc.c_oAscChartTypeSettings.hBarNormal) {
                    dataLabelPos.push(
                        {value: Asc.c_oAscChartDataLabelsPos.inBase, displayValue: me.textInnerBottom},
                        {value: Asc.c_oAscChartDataLabelsPos.inEnd, displayValue: me.textInnerTop},
                        {value: Asc.c_oAscChartDataLabelsPos.outEnd, displayValue: me.textOuterTop}
                    );
                } else if ( chartType == Asc.c_oAscChartTypeSettings.barStacked ||
                    chartType == Asc.c_oAscChartTypeSettings.barStackedPer ||
                    chartType == Asc.c_oAscChartTypeSettings.hBarStacked ||
                    chartType == Asc.c_oAscChartTypeSettings.hBarStackedPer ) {
                    dataLabelPos.push(
                        { value: Asc.c_oAscChartDataLabelsPos.inBase, displayValue: me.textInnerBottom },
                        { value: Asc.c_oAscChartDataLabelsPos.inEnd, displayValue: me.textInnerTop }
                    );
                } else if (chartType == Asc.c_oAscChartTypeSettings.lineNormal ||
                    chartType == Asc.c_oAscChartTypeSettings.lineStacked ||
                    chartType == Asc.c_oAscChartTypeSettings.lineStackedPer ||
                    chartType == Asc.c_oAscChartTypeSettings.stock ||
                    chartType == Asc.c_oAscChartTypeSettings.scatter) {
                    dataLabelPos.push(
                        { value: Asc.c_oAscChartDataLabelsPos.l, displayValue: me.textLeft },
                        { value: Asc.c_oAscChartDataLabelsPos.r, displayValue: me.textRight },
                        { value: Asc.c_oAscChartDataLabelsPos.t, displayValue: me.textTop },
                        { value: Asc.c_oAscChartDataLabelsPos.b, displayValue: me.textBottom }
                    );
                } else if (chartType == Asc.c_oAscChartTypeSettings.pie ||
                    chartType == Asc.c_oAscChartTypeSettings.pie3d) {
                    dataLabelPos.push(
                        {value: Asc.c_oAscChartDataLabelsPos.bestFit, displayValue: me.textFit},
                        {value: Asc.c_oAscChartDataLabelsPos.inEnd, displayValue: me.textInnerTop},
                        {value: Asc.c_oAscChartDataLabelsPos.outEnd, displayValue: me.textOuterTop}
                    );
                }

                $layoutPage.find('select[name=chart-layout-data-labels]').html((function () {
                    var options = [];
                    _.each(dataLabelPos, function (position) {
                        options.push(Common.Utils.String.format('<option value="{0}">{1}</option>', position.value, position.displayValue));
                    });
                    return options.join('');
                })());

                setValue('chart-layout-title', chartProperties.getTitle());
                setValue('chart-layout-legend', chartProperties.getLegendPos());
                setValue('chart-layout-axis-title-horizontal', chartProperties.getHorAxisLabel());
                setValue('chart-layout-axis-title-vertical', chartProperties.getVertAxisLabel());
                setValue('chart-layout-gridlines-horizontal', chartProperties.getHorGridLines());
                setValue('chart-layout-gridlines-vertical', chartProperties.getVertGridLines());
                setValue('chart-layout-data-labels', chartProperties.getDataLabelsPos() || Asc.c_oAscChartDataLabelsPos.none);

                var disableSetting = (
                    chartType == Asc.c_oAscChartTypeSettings.pie ||
                    chartType == Asc.c_oAscChartTypeSettings.doughnut ||
                    chartType == Asc.c_oAscChartTypeSettings.pie3d
                );

                $('#chart-layout-axis-title-horizontal').toggleClass('disabled', disableSetting);
                $('#chart-layout-axis-title-vertical').toggleClass('disabled', disableSetting);
                $('#chart-layout-gridlines-horizontal').toggleClass('disabled', disableSetting);
                $('#chart-layout-gridlines-vertical').toggleClass('disabled', disableSetting);

                // Handlers

                $('#chart-layout-title select').single('change',                _.bind(me.onLayoutTitle, me));
                $('#chart-layout-legend select').single('change',               _.bind(me.onLayoutLegend, me));
                $('#chart-layout-axis-title-horizontal select').single('change',_.bind(me.onLayoutAxisTitleHorizontal, me));
                $('#chart-layout-axis-title-vertical select').single('change',  _.bind(me.onLayoutAxisTitleVertical, me));
                $('#chart-layout-gridlines-horizontal select').single('change', _.bind(me.onLayoutGridlinesHorizontal, me));
                $('#chart-layout-gridlines-vertical select').single('change',   _.bind(me.onLayoutGridlinesVertical, me));
                $('#chart-layout-data-labels select').single('change',          _.bind(me.onLayoutDataLabel, me));
            },

            initVertAxisPage: function () {
                var me = this,
                    $vertAxisPage = $('.page[data-page=edit-chart-vertical-axis]'),
                    chartProperty = me.api.asc_getChartObject(),
                    verAxisProps = chartProperty.getVertAxisProps(),
                    axisProps = (verAxisProps.getAxisType() == Asc.c_oAscAxisType.val) ? verAxisProps : chartProperty.getHorAxisProps();

                var setValue = function (id, value) {
                    var textValue = $vertAxisPage.find('select[name=' + id + ']')
                        .val(value)
                        .find('option[value='+ value +']')
                        .text();
                    $vertAxisPage.find('#' + id + ' .item-after').text(textValue);
                };

                var setOptions = function (selectName, options) {
                    $vertAxisPage.find('select[name=' + selectName + ']').html((function () {
                        var _options = [];
                        _.each(options, function (option) {
                            _options.push(Common.Utils.String.format('<option value="{0}">{1}</option>', option.value, option.display));
                        });
                        return _options.join('');
                    })());
                };

                // Axis
                $('#edit-vertical-axis-min-val input').val((axisProps.getMinValRule()==Asc.c_oAscValAxisRule.auto) ? null : axisProps.getMinVal());
                $('#edit-vertical-axis-max-val input').val((axisProps.getMaxValRule()==Asc.c_oAscValAxisRule.auto) ? null : axisProps.getMaxVal());

                // Cross
                setOptions('vertical-axis-cross', [
                    {display: this.textAuto, value: Asc.c_oAscCrossesRule.auto},
                    {display: this.textValue, value: Asc.c_oAscCrossesRule.value},
                    {display: this.textMinValue, value: Asc.c_oAscCrossesRule.minValue},
                    {display: this.textMaxValue, value: Asc.c_oAscCrossesRule.maxValue}
                ]);

                var crossValue = axisProps.getCrossesRule();
                setValue('vertical-axis-cross', crossValue);

                if (crossValue == Asc.c_oAscCrossesRule.value) {
                    $('#edit-vertical-axis-cross-value').css('display', 'block');
                    $('#edit-vertical-axis-cross-value input').val(axisProps.getCrosses());
                }

                // Units
                setOptions('vertical-axis-display-units', [
                    {display: me.textNone, value: Asc.c_oAscValAxUnits.none},
                    {display: me.textHundreds, value: Asc.c_oAscValAxUnits.HUNDREDS},
                    {display: me.textThousands, value: Asc.c_oAscValAxUnits.THOUSANDS},
                    {display: me.textTenThousands, value: Asc.c_oAscValAxUnits.TEN_THOUSANDS},
                    {display: me.textHundredThousands, value: Asc.c_oAscValAxUnits.HUNDRED_THOUSANDS},
                    {display: me.textMillions, value: Asc.c_oAscValAxUnits.MILLIONS},
                    {display: me.textTenMillions, value: Asc.c_oAscValAxUnits.TEN_MILLIONS},
                    {display: me.textHundredMil, value: Asc.c_oAscValAxUnits.HUNDRED_MILLIONS},
                    {display: me.textBillions, value: Asc.c_oAscValAxUnits.BILLIONS},
                    {display: me.textTrillions, value: Asc.c_oAscValAxUnits.TRILLIONS}
                ]);

                setValue('vertical-axis-display-units', axisProps.getDispUnitsRule());
                $('#vertical-axis-in-reverse input').prop('checked', axisProps.getInvertValOrder());

                // Tick
                var tickOptions = [
                    {display: this.textNone, value: Asc.c_oAscTickMark.TICK_MARK_NONE},
                    {display: this.textCross, value: Asc.c_oAscTickMark.TICK_MARK_CROSS},
                    {display: this.textIn, value: Asc.c_oAscTickMark.TICK_MARK_IN},
                    {display: this.textOut, value: Asc.c_oAscTickMark.TICK_MARK_OUT}
                ];

                setOptions('vertical-axis-tick-major', tickOptions);
                setOptions('vertical-axis-tick-minor', tickOptions);

                setValue('vertical-axis-tick-major', axisProps.getMajorTickMark());
                setValue('vertical-axis-tick-minor', axisProps.getMinorTickMark());

                // Label
                setOptions('vertical-axis-label-pos', [
                    {display: this.textNone, value: Asc.c_oAscTickLabelsPos.TICK_LABEL_POSITION_NONE},
                    {display: this.textLow, value: Asc.c_oAscTickLabelsPos.TICK_LABEL_POSITION_LOW},
                    {display: this.textHigh, value: Asc.c_oAscTickLabelsPos.TICK_LABEL_POSITION_HIGH},
                    {display: this.textNextToAxis, value: Asc.c_oAscTickLabelsPos.TICK_LABEL_POSITION_NEXT_TO}
                ]);
                setValue('vertical-axis-label-pos', axisProps.getTickLabelsPos());

                me.updateAxisProps(chartProperty.getType());

                // Handlers
                $('#edit-vertical-axis-min-val input').single('change',     _.bind(me.onVerAxisMinValue, me));
                $('#edit-vertical-axis-max-val input').single('change',     _.bind(me.onVerAxisMaxValue, me));
                $('#vertical-axis-cross select').single('change',           _.bind(me.onVerAxisCrossType, me));
                $('#edit-vertical-axis-cross-value input').single('change', _.bind(me.onVerAxisCrossValue, me));
                $('#vertical-axis-display-units select').single('change',   _.bind(me.onVerAxisDisplayUnits, me));
                $('#vertical-axis-in-reverse input').single('change',       _.bind(me.onVerAxisReverse, me));
                $('#vertical-axis-tick-major select').single('change',      _.bind(me.onVerAxisTickMajor, me));
                $('#vertical-axis-tick-minor select').single('change',      _.bind(me.onVerAxisTickMinor, me));
                $('#vertical-axis-label-pos select').single('change',       _.bind(me.onVerAxisLabelPos, me));
            },

            initHorAxisPage: function () {
                var me = this,
                    $horAxisPage = $('.page[data-page=edit-chart-horizontal-axis]'),
                    chartProperty = me.api.asc_getChartObject(),
                    horAxisProps = chartProperty.getHorAxisProps(),
                    axisProps = (horAxisProps.getAxisType() == Asc.c_oAscAxisType.val) ? chartProperty.getVertAxisProps() : horAxisProps;

                var setValue = function (id, value) {
                    var textValue = $horAxisPage.find('select[name=' + id + ']')
                        .val(value)
                        .find('option[value='+ value +']')
                        .text();
                    $horAxisPage.find('#' + id + ' .item-after').text(textValue);
                };

                var setOptions = function (selectName, options) {
                    $horAxisPage.find('select[name=' + selectName + ']').html((function () {
                        var _options = [];
                        _.each(options, function (option) {
                            _options.push(Common.Utils.String.format('<option value="{0}">{1}</option>', option.value, option.display));
                        });
                        return _options.join('');
                    })());
                };

                // Cross
                setOptions('horizontal-axis-cross', [
                    {display: me.textAuto, value: Asc.c_oAscCrossesRule.auto},
                    {display: me.textValue, value: Asc.c_oAscCrossesRule.value},
                    {display: me.textMinValue, value: Asc.c_oAscCrossesRule.minValue},
                    {display: me.textMaxValue, value: Asc.c_oAscCrossesRule.maxValue}
                ]);

                var crossValue = axisProps.getCrossesRule();
                setValue('horizontal-axis-cross', crossValue);

                if (crossValue == Asc.c_oAscCrossesRule.value) {
                    $('#edit-horizontal-axis-cross-value').css('display', 'block');
                    $('#edit-horizontal-axis-cross-value input').val(axisProps.getCrosses());
                }

                // Pos
                setOptions('horizontal-axis-position', [
                    {display: me.textOnTickMarks, value: Asc.c_oAscLabelsPosition.byDivisions},
                    {display: me.textBetweenTickMarks, value: Asc.c_oAscLabelsPosition.betweenDivisions}
                ]);

                setValue('horizontal-axis-position', axisProps.getLabelsPosition());
                $('#horizontal-axis-in-reverse input').prop('checked', axisProps.getInvertCatOrder());

                // Tick
                var tickOptions = [
                    {display: me.textNone, value: Asc.c_oAscTickMark.TICK_MARK_NONE},
                    {display: me.textCross, value: Asc.c_oAscTickMark.TICK_MARK_CROSS},
                    {display: me.textIn, value: Asc.c_oAscTickMark.TICK_MARK_IN},
                    {display: me.textOut, value: Asc.c_oAscTickMark.TICK_MARK_OUT}
                ];

                setOptions('horizontal-axis-tick-major', tickOptions);
                setOptions('horizontal-axis-tick-minor', tickOptions);

                setValue('horizontal-axis-tick-major', axisProps.getMajorTickMark());
                setValue('horizontal-axis-tick-minor', axisProps.getMinorTickMark());

                // Label
                setOptions('horizontal-axis-label-pos', [
                    {display: me.textNone, value: Asc.c_oAscTickLabelsPos.TICK_LABEL_POSITION_NONE},
                    {display: me.textLow, value: Asc.c_oAscTickLabelsPos.TICK_LABEL_POSITION_LOW},
                    {display: me.textHigh, value: Asc.c_oAscTickLabelsPos.TICK_LABEL_POSITION_HIGH},
                    {display: me.textNextToAxis, value: Asc.c_oAscTickLabelsPos.TICK_LABEL_POSITION_NEXT_TO}
                ]);
                setValue('horizontal-axis-label-pos', axisProps.getTickLabelsPos());

                me.updateAxisProps(chartProperty.getType());

                // Handlers
                $('#horizontal-axis-cross select').single('change',           _.bind(me.onHorAxisCrossType, me));
                $('#edit-horizontal-axis-cross-value input').single('change', _.bind(me.onHorAxisCrossValue, me));
                $('#horizontal-axis-position select').single('change',        _.bind(me.onHorAxisPos, me));
                $('#horizontal-axis-in-reverse input').single('change',       _.bind(me.onHorAxisReverse, me));
                $('#horizontal-axis-tick-major select').single('change',      _.bind(me.onHorAxisTickMajor, me));
                $('#horizontal-axis-tick-minor select').single('change',      _.bind(me.onHorAxisTickMinor, me));
                $('#horizontal-axis-label-pos select').single('change',       _.bind(me.onHorAxisLabelPos, me));
            },

            initReorderPage: function () {
                $('.page[data-page=edit-chart-reorder] a.item-link').single('click', _.bind(this.onReorder, this));
            },

            initBorderColorPage: function () {
                var me = this,
                    palette = new Common.UI.ThemeColorPalette({
                        el: $('.page[data-page=edit-chart-border-color] .page-content')
                    });

                if (palette) {
                    palette.select(_borderInfo.color);
                    palette.on('select', _.bind(me.onBorderColor, me));
                }
            },

            // Handlers

            onRemoveChart: function () {
                this.api.asc_Remove();
                SSE.getController('EditContainer').hideModal();
            },

            onReorder: function(e) {
                var $target = $(e.currentTarget),
                    type = $target.data('type'),
                    ascType;

                if (type == 'all-up') {
                    ascType = Asc.c_oAscDrawingLayerType.BringToFront;
                } else if (type == 'all-down') {
                    ascType = Asc.c_oAscDrawingLayerType.SendToBack;
                } else if (type == 'move-up') {
                    ascType = Asc.c_oAscDrawingLayerType.BringForward;
                } else {
                    ascType = Asc.c_oAscDrawingLayerType.SendBackward;
                }

                this.api.asc_setSelectedDrawingObjectLayer(ascType);
            },

            onType: function (e) {
                var me = this,
                    $target = $(e.currentTarget),
                    type = $target.data('type');

                $('.chart-types li').removeClass('active');
                $target.addClass('active');

                _.defer(function() {
                    var image = new Asc.asc_CImgProperty(),
                        chart = _chartObject.get_ChartProperties();

                    chart.changeType(type);
                    image.put_ChartProperties(chart);

                    me.api.asc_setGraphicObjectProps(image);

                    // Force update styles
                    me._updateChartStyles(me.api.asc_getChartPreviews(chart.getType()));

                    me.updateAxisProps(type);
                });
            },

            onStyle: function (e) {
                var me = this,
                    $target = $(e.currentTarget),
                    type = $target.data('type');

                var image = new Asc.asc_CImgProperty(),
                    chart = _chartObject.get_ChartProperties();

                chart.putStyle(type);
                image.put_ChartProperties(chart);

                me.api.asc_setGraphicObjectProps(image);
            },

            onFillColor:function (palette, color) {
                var me = this;

                if (me.api) {
                    var image = new Asc.asc_CImgProperty(),
                        shape = new Asc.asc_CShapeProperty(),
                        fill = new Asc.asc_CShapeFill();

                    if (color == 'transparent') {
                        fill.put_type(Asc.c_oAscFill.FILL_TYPE_NOFILL);
                        fill.put_fill(null);
                    } else {
                        fill.put_type(Asc.c_oAscFill.FILL_TYPE_SOLID);
                        fill.put_fill(new Asc.asc_CFillSolid());
                        fill.get_fill().put_color(Common.Utils.ThemeColor.getRgbColor(color));
                    }

                    shape.put_fill(fill);
                    image.put_ShapeProperties(shape);

                    me.api.asc_setGraphicObjectProps(image);
                }
            },

            onBorderSize: function (e) {
                var me = this,
                    $target = $(e.currentTarget),
                    value = $target.val(),
                    image = new Asc.asc_CImgProperty(),
                    shape = new Asc.asc_CShapeProperty(),
                    stroke = new Asc.asc_CStroke();

                value = borderSizeTransform.sizeByIndex(parseInt(value));

                if (value < 0.01) {
                    stroke.put_type(Asc.c_oAscStrokeType.STROKE_NONE);
                } else {
                    stroke.put_type(Asc.c_oAscStrokeType.STROKE_COLOR);
                    if (_borderInfo.color == 'transparent')
                        stroke.put_color(Common.Utils.ThemeColor.getRgbColor({color: '000000', effectId: 29}));
                    else
                        stroke.put_color(Common.Utils.ThemeColor.getRgbColor(Common.Utils.ThemeColor.colorValue2EffectId(_borderInfo.color)));
                    stroke.put_width(value * 25.4 / 72.0);
                }

                shape.put_stroke(stroke);
                image.put_ShapeProperties(shape);

                me.api.asc_setGraphicObjectProps(image);
                me._initBorderColorView(); // when select STROKE_NONE or change from STROKE_NONE to STROKE_COLOR
            },

            onBorderSizeChanging: function (e) {
                var $target = $(e.currentTarget);
                $('#edit-chart-bordersize .item-after').text(borderSizeTransform.sizeByIndex($target.val()) + ' ' + _metricText);
            },

            onBorderColor: function (palette, color) {
                var me = this,
                    currentShape = _shapeObject.get_ShapeProperties();

                $('#edit-chart-bordercolor .color-preview').css('background-color', ('transparent' == color) ? color : ('#' + (_.isObject(color) ? color.color : color)));
                _borderInfo.color = color;

                if (me.api && currentShape && currentShape.get_stroke().get_type() == Asc.c_oAscStrokeType.STROKE_COLOR) {
                    var image = new Asc.asc_CImgProperty(),
                        shape = new Asc.asc_CShapeProperty(),
                        stroke = new Asc.asc_CStroke();

                    if (currentShape.get_stroke().get_width() < 0.01) {
                        stroke.put_type(Asc.c_oAscStrokeType.STROKE_NONE);
                    } else {
                        stroke.put_type(Asc.c_oAscStrokeType.STROKE_COLOR);
                        stroke.put_color(Common.Utils.ThemeColor.getRgbColor(color));
                        stroke.put_width(currentShape.get_stroke().get_width());
                        stroke.asc_putPrstDash(currentShape.get_stroke().asc_getPrstDash());
                    }

                    shape.put_stroke(stroke);
                    image.put_ShapeProperties(shape);

                    me.api.asc_setGraphicObjectProps(image);
                }
            },

            onLayoutTitle: function (e) {
                this._setLayoutProperty('putTitle', e);
            },

            onLayoutLegend: function(e) {
                this._setLayoutProperty('putLegendPos', e);
            },

            onLayoutAxisTitleHorizontal: function(e) {
                this._setLayoutProperty('putHorAxisLabel', e);
            },

            onLayoutAxisTitleVertical: function(e) {
                this._setLayoutProperty('putVertAxisLabel', e);
            },

            onLayoutGridlinesHorizontal: function(e) {
                this._setLayoutProperty('putHorGridLines', e);
            },

            onLayoutGridlinesVertical: function(e) {
                this._setLayoutProperty('putVertGridLines', e);
            },

            onLayoutDataLabel: function(e) {
                this._setLayoutProperty('putDataLabelsPos', e);
            },

            onVerAxisMinValue: function (e) {
                var value = $(e.currentTarget).val(),
                    axisProps = this._getVerticalAxisProp(),
                    axisRule = _.isEmpty(value) ? Asc.c_oAscValAxisRule.auto : Asc.c_oAscValAxisRule.fixed;

                axisProps.putMinValRule(axisRule);

                if (axisRule == Asc.c_oAscValAxisRule.fixed) {
                    axisProps.putMinVal(parseInt(value));
                }

                this._setVerticalAxisProp(axisProps);
            },

            onVerAxisMaxValue: function (e) {
                var value = $(e.currentTarget).val(),
                    axisProps = this._getVerticalAxisProp(),
                    axisRule = _.isEmpty(value) ? Asc.c_oAscValAxisRule.auto : Asc.c_oAscValAxisRule.fixed;

                axisProps.putMaxValRule(axisRule);

                if (axisRule == Asc.c_oAscValAxisRule.fixed) {
                    axisProps.putMaxVal(parseInt(value));
                }

                this._setVerticalAxisProp(axisProps);
            },

            onVerAxisCrossType: function (e) {
                var value = parseInt($(e.currentTarget).val()),
                    axisProps = this._getVerticalAxisProp();

                if (value ==  Asc.c_oAscCrossesRule.value) {
                    $('#edit-vertical-axis-cross-value').css('display', 'block');
                    $('#edit-vertical-axis-cross-value input').val(axisProps.getCrosses());
                } else {
                    $('#edit-vertical-axis-cross-value').css('display', 'none');
                }

                axisProps.putCrossesRule(value);

                this._setVerticalAxisProp(axisProps);
            },

            onVerAxisCrossValue: function (e) {
                var value = $(e.currentTarget).val(),
                    axisProps = this._getVerticalAxisProp();

                axisProps.putCrossesRule(Asc.c_oAscCrossesRule.value);
                axisProps.putCrosses(parseInt(value));

                this._setVerticalAxisProp(axisProps);
            },

            onVerAxisDisplayUnits: function (e) {
                var value = $(e.currentTarget).val(),
                    axisProps = this._getVerticalAxisProp();

                axisProps.putDispUnitsRule(parseInt(value));

                this._setVerticalAxisProp(axisProps);
            },

            onVerAxisReverse: function (e) {
                var value = $(e.currentTarget).prop('checked'),
                    axisProps = this._getVerticalAxisProp();

                axisProps.putInvertValOrder(value);

                this._setVerticalAxisProp(axisProps);
            },

            onVerAxisTickMajor: function (e) {
                var value = $(e.currentTarget).val(),
                    axisProps = this._getVerticalAxisProp();

                axisProps.putMajorTickMark(parseInt(value));

                this._setVerticalAxisProp(axisProps);
            },

            onVerAxisTickMinor: function (e) {
                var value = $(e.currentTarget).val(),
                    axisProps = this._getVerticalAxisProp();

                axisProps.putMinorTickMark(parseInt(value));

                this._setVerticalAxisProp(axisProps);
            },

            onVerAxisLabelPos: function (e) {
                var value = $(e.currentTarget).val(),
                    axisProps = this._getVerticalAxisProp();

                axisProps.putTickLabelsPos(parseInt(value));

                this._setVerticalAxisProp(axisProps);
            },


            onHorAxisCrossType: function(e) {
                var value = $(e.currentTarget).val(),
                    axisProps = this._getHorizontalAxisProp();

                if (value ==  Asc.c_oAscCrossesRule.value) {
                    $('#edit-horizontal-axis-cross-value').css('display', 'block');
                    $('#edit-horizontal-axis-cross-value input').val(axisProps.getCrosses());
                } else {
                    $('#edit-horizontal-axis-cross-value').css('display', 'none');
                }

                axisProps.putCrossesRule(parseInt(value));

                this._setHorizontalAxisProp(axisProps);
            },

            onHorAxisCrossValue: function(e) {
                var value = $(e.currentTarget).val(),
                    axisProps = this._getHorizontalAxisProp();

                axisProps.putCrossesRule(Asc.c_oAscCrossesRule.value);
                axisProps.putCrosses(parseInt(value));

                this._setHorizontalAxisProp(axisProps);
            },

            onHorAxisPos: function(e) {
                var value = $(e.currentTarget).val(),
                    axisProps = this._getHorizontalAxisProp();

                axisProps.putLabelsPosition(parseInt(value));

                this._setHorizontalAxisProp(axisProps);
            },

            onHorAxisReverse: function(e) {
                var value = $(e.currentTarget).prop('checked'),
                    axisProps = this._getHorizontalAxisProp();

                axisProps.putInvertCatOrder(value);

                this._setHorizontalAxisProp(axisProps);
            },

            onHorAxisTickMajor: function(e) {
                var value = $(e.currentTarget).val(),
                    axisProps = this._getHorizontalAxisProp();

                axisProps.putMajorTickMark(parseInt(value));

                this._setHorizontalAxisProp(axisProps);
            },

            onHorAxisTickMinor: function(e) {
                var value = $(e.currentTarget).val(),
                    axisProps = this._getHorizontalAxisProp();

                axisProps.putMinorTickMark(parseInt(value));

                this._setHorizontalAxisProp(axisProps);
            },

            onHorAxisLabelPos: function(e) {
                var value = $(e.currentTarget).val(),
                    axisProps = this._getHorizontalAxisProp();

                axisProps.putTickLabelsPos(parseInt(value));

                this._setHorizontalAxisProp(axisProps);
            },


            updateAxisProps: function(chartType) {
                // var value = (chartType == Asc.c_oAscChartTypeSettings.lineNormal || chartType == Asc.c_oAscChartTypeSettings.lineStacked ||
                // chartType == Asc.c_oAscChartTypeSettings.lineStackedPer || chartType == Asc.c_oAscChartTypeSettings.scatter);
                // this.chMarkers.setVisible(value);
                // this.cmbLines.setVisible(value);
                // this.lblLines.toggleClass('hidden', !value);
                //
                // if (value) {
                //     this.chMarkers.setValue(this.chartSettings.getShowMarker(), true);
                //     this.cmbLines.setValue(this.chartSettings.getLine() ? (this.chartSettings.getSmooth() ? 2 : 1) : 0);
                // }

                // Disable Axises

                var disableEditAxis = (
                    chartType == Asc.c_oAscChartTypeSettings.pie ||
                    chartType == Asc.c_oAscChartTypeSettings.doughnut ||
                    chartType == Asc.c_oAscChartTypeSettings.pie3d
                );

                $('#chart-vaxis, #chart-haxis').toggleClass('disabled', disableEditAxis);

                var disableAxisPos = (
                    chartType == Asc.c_oAscChartTypeSettings.barNormal3d ||
                    chartType == Asc.c_oAscChartTypeSettings.barStacked3d ||
                    chartType == Asc.c_oAscChartTypeSettings.barStackedPer3d ||
                    chartType == Asc.c_oAscChartTypeSettings.hBarNormal3d ||
                    chartType == Asc.c_oAscChartTypeSettings.hBarStacked3d ||
                    chartType == Asc.c_oAscChartTypeSettings.hBarStackedPer3d ||
                    chartType == Asc.c_oAscChartTypeSettings.barNormal3dPerspective
                );

                $('#horizontal-axis-position').toggleClass('disabled', disableAxisPos);

                // Reverse Axises
                var needReverse = (
                    chartType == Asc.c_oAscChartTypeSettings.hBarNormal ||
                    chartType == Asc.c_oAscChartTypeSettings.hBarStacked ||
                    chartType == Asc.c_oAscChartTypeSettings.hBarStackedPer ||
                    chartType == Asc.c_oAscChartTypeSettings.hBarNormal3d ||
                    chartType == Asc.c_oAscChartTypeSettings.hBarStacked3d ||
                    chartType == Asc.c_oAscChartTypeSettings.hBarStackedPer3d
                );

                $('#chart-vaxis').data('page', needReverse ? '#edit-chart-horizontal-axis': '#edit-chart-vertical-axis');
                $('#chart-haxis').data('page', (needReverse || chartType == Asc.c_oAscChartTypeSettings.scatter) ? '#edit-chart-vertical-axis': '#edit-chart-horizontal-axis');
            },


            // API handlers

            onApiUpdateChartStyles: function () {
                if (this.api && _chartObject && _chartObject.get_ChartProperties()) {
                    this._updateChartStyles(this.api.asc_getChartPreviews(_chartObject.get_ChartProperties().getType()));
                }
            },

            onApiSelectionChanged: function(info) {
                if (!_isEdit) {
                    return;
                }

                var me = this,
                    selectedObjects = [],
                    selectType = info.asc_getFlags().asc_getSelectionType();

                if (selectType == Asc.c_oAscSelectionType.RangeChart) {
                    selectedObjects = me.api.asc_getGraphicObjectProps();
                }

                me.onApiFocusObject(selectedObjects);
            },

            onApiFocusObject: function (objects) {
                _stack = objects;

                if (!_isEdit) {
                    return;
                }

                var charts = [],
                    shapes = [];

                _.each(_stack, function (object) {
                    if (object.get_ObjectType() == Asc.c_oAscTypeSelectElement.Image) {
                        if (object.get_ObjectValue() && object.get_ObjectValue().get_ChartProperties()) {
                            charts.push(object);
                        }
                        if (object.get_ObjectValue() && object.get_ObjectValue().get_ShapeProperties()) {
                            shapes.push(object);
                        }
                    }
                });

                var getTopObject = function(array) {
                    if (array.length > 0) {
                        var object = array[array.length - 1]; // get top
                        return object.get_ObjectValue();
                    } else {
                        return undefined;
                    }
                };

                _chartObject = getTopObject(charts);
                _shapeObject = getTopObject(shapes);
            },

            // Helpers

            _getVerticalAxisProp: function () {
                var chartObject = this.api.asc_getChartObject(),
                    verAxisProps = chartObject.getVertAxisProps();

                return (verAxisProps.getAxisType() == Asc.c_oAscAxisType.val) ? verAxisProps : chartObject.getHorAxisProps();
            },

            _setVerticalAxisProp: function (axisProps) {
                var chartObject = this.api.asc_getChartObject(),
                    verAxisProps = chartObject.getVertAxisProps();

                if (!_.isUndefined(chartObject)) {
                    chartObject[(verAxisProps.getAxisType() == Asc.c_oAscAxisType.val) ? 'putVertAxisProps' : 'putHorAxisProps'](axisProps);
                    this.api.asc_editChartDrawingObject(chartObject);
                }
            },

            _getHorizontalAxisProp: function () {
                var chartObject = this.api.asc_getChartObject(),
                    verHorProps = chartObject.getHorAxisProps();

                return (verHorProps.getAxisType() == Asc.c_oAscAxisType.val) ? chartObject.getVertAxisProps() : verHorProps;
            },

            _setHorizontalAxisProp: function (axisProps) {
                var chartObject = this.api.asc_getChartObject(),
                    verAxisProps = chartObject.getHorAxisProps();

                if (!_.isUndefined(chartObject)) {
                    chartObject[(verAxisProps.getAxisType() == Asc.c_oAscAxisType.val) ? 'putVertAxisProps' : 'putHorAxisProps'](axisProps);
                    this.api.asc_editChartDrawingObject(chartObject);
                }
            },

            _setLayoutProperty: function (propertyMethod, e) {
                var value = $(e.currentTarget).val(),
                    chartObject = this.api.asc_getChartObject();

                if (!_.isUndefined(chartObject) && value && value.length > 0) {
                    var intValue = parseInt(value);
                    chartObject[propertyMethod](parseInt(value));

                    if ("putDataLabelsPos" == propertyMethod && intValue != 0)
                        chartObject["putShowVal"](true);

                    this.api.asc_editChartDrawingObject(chartObject);
                }
            },

            _updateChartStyles: function(styles) {
                this.getView('EditChart').renderStyles(styles);
                $('#tab-chart-style li').single('click',    _.bind(this.onStyle, this));
            },

            _sdkToThemeColor: function (color) {
                var clr = 'transparent';

                if (color) {
                    if (color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                        clr = {
                            color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()),
                            effectValue: color.get_value()
                        }
                    } else {
                        clr = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
                    }
                }

                return clr;
            },

            textValue: 'Value',
            textMinValue: 'Minimum Value',
            textMaxValue: 'Maximum Value',
            textLeftOverlay: 'Left Overlay',
            textRightOverlay: 'Right Overlay',
            textOverlay: 'Overlay',
            textNoOverlay: 'No Overlay',
            textRotated: 'Rotated',
            textHorizontal: 'Horizontal',
            textInnerBottom: 'Inner Bottom',
            textInnerTop: 'Inner Top',
            textOuterTop: 'Outer Top',
            textNone: 'None',
            textCenter: 'Center',
            textFixed: 'Fixed',
            textAuto: 'Auto',
            textCross: 'Cross',
            textIn: 'In',
            textOut: 'Out',
            textLow: 'Low',
            textHigh: 'High',
            textNextToAxis: 'Next to axis',
            textHundreds: 'Hundreds',
            textThousands: 'Thousands',
            textTenThousands: '10 000',
            textHundredThousands: '100 000',
            textMillions: 'Millions',
            textTenMillions: '10 000 000',
            textHundredMil: '100 000 000',
            textBillions: 'Billions',
            textTrillions: 'Trillions',
            textCustom: 'Custom',
            textManual: 'Manual',
            textBetweenTickMarks: 'Between Tick Marks',
            textOnTickMarks: 'On Tick Marks',
            errorMaxRows: 'ERROR! The maximum number of data series per chart is 255.',
            errorStockChart: 'Incorrect row order. To build a stock chart place the data on the sheet in the following order:<br> opening price, max price, min price, closing price.',
            textLeft: 'Left',
            textRight: 'Right',
            textTop: 'Top',
            textBottom: 'Bottom',
            textFit: 'Fit Width'
        }
    })(), SSE.Controllers.EditChart || {}))
});