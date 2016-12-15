/*
 *
 * (c) Copyright Ascensio System Limited 2010-2016
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
 *  Copyright (c) 2016 Ascensio System SIA. All rights reserved.
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

                sizeByValue: function (value) {
                    var index = 0;
                    _.each(_sizes, function (size, idx) {
                        if (Math.abs(size - value) < 0.25) {
                            index = idx;
                        }
                    });
                    return _sizes[index];
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
                _isEdit = ('edit' === mode);
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
                var me = this;

                if ('#edit-chart-style' == pageId) {
                    me.initStylePage();
                } else if ('#edit-chart-border-color-view' == pageId) {
                    me.initBorderColorPage();
                } else if ('#edit-chart-layout' == pageId) {
                    me.initLayoutPage();
                } else if ('#edit-chart-reorder' == pageId) {
                    me.initReorderPage();
                } else {
                    $('#chart-remove').single('click', _.bind(me.onRemoveChart, me));
                }
            },

            // Public

            getStack: function() {
                return _stack;
            },

            getChart: function () {
                return _chartObject;
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

                var borderSize = shapeProperties.get_stroke().get_width() * 72.0 / 25.4;
                $('#edit-chart-bordersize input').val([borderSizeTransform.sizeByIndex(borderSize)]);
                $('#edit-chart-bordersize .item-after').text(borderSizeTransform.sizeByValue(borderSize) + ' ' + _metricText);

                $('#edit-chart-bordersize input').single('change touchend', _.buffered(me.onBorderSize, 100, me));
                $('#edit-chart-bordersize input').single('input',           _.bind(me.onBorderSizeChanging, me));

                var stroke = shapeProperties.get_stroke(),
                    strokeType = stroke.get_type();

                if (stroke && strokeType == Asc.c_oAscStrokeType.STROKE_COLOR) {
                    _borderInfo.color = me._sdkToThemeColor(stroke.get_color());
                }

                $('#edit-chart-bordercolor .color-preview').css('background-color',
                    ('transparent' == _borderInfo.color)
                        ? _borderInfo.color
                        : ('#' + (_.isObject(_borderInfo.color) ? _borderInfo.color.color : _borderInfo.color))
                )
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
                console.debug('REMOVE CHART')
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
                    currentShape = _shapeObject.get_ShapeProperties(),
                    image = new Asc.asc_CImgProperty(),
                    shape = new Asc.asc_CShapeProperty(),
                    stroke = new Asc.asc_CStroke(),
                    currentColor = Common.Utils.ThemeColor.getRgbColor('000000');

                value = borderSizeTransform.sizeByIndex(parseInt(value));

                var currentStroke = currentShape.get_stroke();

                if (currentStroke) {
                    var currentStrokeType = currentStroke.get_type();

                    if (currentStrokeType == Asc.c_oAscStrokeType.STROKE_COLOR) {
                        currentColor = currentStroke.get_color();
                    }
                }

                if (value < 0.01) {
                    stroke.put_type(Asc.c_oAscStrokeType.STROKE_NONE);
                } else {
                    stroke.put_type(Asc.c_oAscStrokeType.STROKE_COLOR);
                    stroke.put_color(currentColor);
                    stroke.put_width(value * 25.4 / 72.0);
                }

                shape.put_stroke(stroke);
                image.put_ShapeProperties(shape);

                me.api.asc_setGraphicObjectProps(image);
            },

            onBorderSizeChanging: function (e) {
                var $target = $(e.currentTarget);
                $('#edit-chart-bordersize .item-after').text(borderSizeTransform.sizeByIndex($target.val()) + ' ' + _metricText);
            },

            onBorderColor: function (palette, color) {
                var me = this,
                    currentShape = _shapeObject.get_ShapeProperties();

                $('#edit-chart-bordercolor .color-preview').css('background-color', ('transparent' == color) ? color : ('#' + (_.isObject(color) ? color.color : color)));

                if (me.api && currentShape) {
                    var image = new Asc.asc_CImgProperty(),
                        shape = new Asc.asc_CShapeProperty(),
                        stroke = new Asc.asc_CStroke();

                    _borderInfo.color = Common.Utils.ThemeColor.getRgbColor(color);

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

            _setLayoutProperty: function (propertyMethod, e) {
                var value = $(e.currentTarget).val(),
                    chartObject = this.api.asc_getChartObject();

                if (!_.isUndefined(chartObject) && value && value.length > 0) {
                    chartObject[propertyMethod](parseInt(value));
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

            textChart: 'Chart',
            textLayout: 'Layout',
            textLegendPos: 'Legend',
            textHorTitle: 'Horizontal Axis Title',
            textVertTitle: 'Vertical Axis Title',
            textDataLabels: 'Data Labels',
            textSeparator: 'Data Labels Separator',
            textSeriesName: 'Series Name',
            textCategoryName: 'Category Name',
            textValue: 'Value',
            textAxisOptions: 'Axis Options',
            textMinValue: 'Minimum Value',
            textMaxValue: 'Maximum Value',
            textAxisCrosses: 'Axis Crosses',
            textUnits: 'Display Units',
            textTickOptions: 'Tick Options',
            textMajorType: 'Major Type',
            textMinorType: 'Minor Type',
            textLabelOptions: 'Label Options',
            textLabelPos: 'Label Position',
            textReverse: 'Values in reverse order',
            textVertAxis: 'Vertical Axis',
            textHorAxis: 'Horizontal Axis',
            textMarksInterval: 'Interval between Marks',
            textLabelDist: 'Axis Label Distance',
            textLabelInterval: 'Interval between Labels',
            textAxisPos: 'Axis Position',
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
            textHorGrid: 'Horizontal Gridlines',
            textVertGrid: 'Vertical Gridlines',
            textLines: 'Lines',
            textMarkers: 'Markers',
            textMajor: 'Major',
            textMinor: 'Minor',
            textMajorMinor: 'Major and Minor',
            textStraight: 'Straight',
            textSmooth: 'Smooth',
            textType: 'Type',
            textTypeData: 'Type & Data',
            textStyle: 'Style',
            errorMaxRows: 'ERROR! The maximum number of data series per chart is 255.',
            errorStockChart: 'Incorrect row order. To build a stock chart place the data on the sheet in the following order:<br> opening price, max price, min price, closing price.',
            textAxisSettings: 'Axis Settings',
            textGridLines: 'Gridlines',
            textShow: 'Show',
            textHide: 'Hide',
            textLeft: 'Left',
            textRight: 'Right',
            textTop: 'Top',
            textBottom: 'Bottom',
            textFit: 'Fit Width'
        }
    })(), SSE.Controllers.EditChart || {}))
});