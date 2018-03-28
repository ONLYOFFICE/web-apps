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
 *  Presentation Editor
 *
 *  Created by Julia Radzhabova on 12/19/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'presentationeditor/mobile/app/view/edit/EditChart',
    'jquery',
    'underscore',
    'backbone'
], function (core, view, $, _, Backbone) {
    'use strict';

    PE.Controllers.EditChart = Backbone.Controller.extend(_.extend((function() {
        // Private
        var _stack = [],
            _chartObject = undefined,
            _shapeObject = undefined,
            _metricText = Common.Utils.Metric.getCurrentMetricName(),
            _borderColor = 'transparent';

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
                        'page:show': this.onPageShow
                    }
                });
            },

            setApi: function (api) {
                var me = this;
                me.api = api;

                me.api.asc_registerCallback('asc_onFocusObject',        _.bind(me.onApiFocusObject, me));
                me.api.asc_registerCallback('asc_onUpdateChartStyles',  _.bind(me.onApiUpdateChartStyles, me));
            },

            onLaunch: function () {
                this.createView('EditChart').render();
            },

            initEvents: function () {
                var me = this;

                $('#chart-remove').single('click', _.bind(me.onRemoveChart, me));

                me.initSettings();
            },

            onPageShow: function (view, pageId) {
                var me = this;

                $('.chart-reorder a').single('click',                       _.bind(me.onReorder, me));
                $('.chart-replace li').single('click',                      _.buffered(me.onReplace, 100, me));
                $('.chart-align a').single('click',                         _.bind(me.onAlign, me));

                $('#edit-chart-bordersize input').single('change touchend', _.buffered(me.onBorderSize, 100, me));
                $('#edit-chart-bordersize input').single('input',           _.bind(me.onBorderSizeChanging, me));

                $('#tab-chart-type li').single('click',                     _.buffered(me.onType, 100, me));

                me.initSettings(pageId);
            },

            initSettings: function (pageId) {
                var me = this;

                if (_chartObject) {
                    if (pageId == '#edit-chart-style') {
                        me._updateChartStyles(me.api.asc_getChartPreviews(_chartObject.getType()));
                        me._initStyleView();
                    } else if (pageId == '#edit-chart-border-color-view') {
                        me._initStyleView();
                    }
                }
            },

            _initStyleView: function (updateStyles) {
                var me = this,
                    chartProperties = _chartObject,
                    shapeProperties = _shapeObject,
                    paletteFillColor = me.getView('EditChart').paletteFillColor,
                    paletteBorderColor = me.getView('EditChart').paletteBorderColor;

                // Style

                var type = chartProperties.getType();
                $('.chart-types li').removeClass('active');
                $('.chart-types li[data-type=' + type + ']').addClass('active');

                // Init style border size
                var borderSize = shapeProperties.get_stroke().get_width() * 72.0 / 25.4,
                    borderType = _shapeObject.get_stroke().get_type();
                $('#edit-chart-bordersize input').val([(borderType == Asc.c_oAscStrokeType.STROKE_NONE) ? 0 : borderSizeTransform.indexSizeByValue(borderSize)]);
                $('#edit-chart-bordersize .item-after').text(((borderType == Asc.c_oAscStrokeType.STROKE_NONE) ? 0 : borderSizeTransform.sizeByValue(borderSize)) + ' ' + _metricText);

                paletteFillColor && paletteFillColor.on('select',       _.bind(me.onFillColor, me));
                paletteBorderColor && paletteBorderColor.on('select',   _.bind(me.onBorderColor, me));

                var sdkColor, color;

                // Init fill color
                var fill = shapeProperties.get_fill(),
                    fillType = fill.get_type();

                color = 'transparent';

                if (fillType == Asc.c_oAscFill.FILL_TYPE_SOLID) {
                    fill = fill.get_fill();
                    sdkColor = fill.get_color();

                    if (sdkColor) {
                        if (sdkColor.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                            color = {color: Common.Utils.ThemeColor.getHexColor(sdkColor.get_r(), sdkColor.get_g(), sdkColor.get_b()), effectValue: sdkColor.get_value()};
                        } else {
                            color = Common.Utils.ThemeColor.getHexColor(sdkColor.get_r(), sdkColor.get_g(), sdkColor.get_b());
                        }
                    }
                }

                paletteFillColor && paletteFillColor.select(color);

                // Init border color
                me._initBorderColorView();
            },

            _initBorderColorView: function () {
                var me = this,
                    paletteBorderColor = me.getView('EditChart').paletteBorderColor,
                    stroke = _shapeObject.get_stroke();

                var color = 'transparent';

                if (stroke && stroke.get_type() == Asc.c_oAscStrokeType.STROKE_COLOR) {
                    var sdkColor = stroke.get_color();

                    if (sdkColor) {
                        if (sdkColor.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                            color = {color: Common.Utils.ThemeColor.getHexColor(sdkColor.get_r(), sdkColor.get_g(), sdkColor.get_b()), effectValue: sdkColor.get_value()};
                        }
                        else {
                            color = Common.Utils.ThemeColor.getHexColor(sdkColor.get_r(), sdkColor.get_g(), sdkColor.get_b());
                        }
                    }
                }
                _borderColor = color;

                paletteBorderColor && paletteBorderColor.select(color);
                $('#edit-chart-bordercolor .color-preview').css('background-color', ('transparent' == color) ? color : ('#' + (_.isObject(color) ? color.color : color)))
            },

            // Public

            getChart: function () {
                return _chartObject;
            },

            // Handlers

            onType: function (e) {
                var me = this,
                    $target = $(e.currentTarget),
                    type = $target.data('type');

                var chart = new Asc.CAscChartProp();
                chart.changeType(type);
                me.api.ChartApply(chart);

                $('.chart-types li').removeClass('active');
                $target.addClass('active');

                // Force update styles
                me._updateChartStyles(me.api.asc_getChartPreviews(chart.getType()));
            },

            onStyle: function (e) {
                var me = this,
                    $target = $(e.currentTarget),
                    type = $target.data('type');

                var chart = new Asc.CAscChartProp();
                chart.putStyle(type);
                me.api.ChartApply(chart);
            },

            onRemoveChart: function () {
                this.api.asc_Remove();
                PE.getController('EditContainer').hideModal();
            },

            onReorder: function (e) {
                var $target = $(e.currentTarget),
                    type = $target.data('type');

                if ('all-up' == type) {
                    this.api.shapes_bringToFront();
                } else if ('all-down' == type) {
                    this.api.shapes_bringToBack();
                } else if ('move-up' == type) {
                    this.api.shapes_bringForward();
                } else if ('move-down' == type) {
                    this.api.shapes_bringBackward();
                }
            },

            onAlign: function (e) {
                var $target = $(e.currentTarget),
                    type = $target.data('type');

                if ('align-left' == type) {
                    this.api.put_ShapesAlign(Asc.c_oAscAlignShapeType.ALIGN_LEFT);
                } else if ('align-center' == type) {
                    this.api.put_ShapesAlign(Asc.c_oAscAlignShapeType.ALIGN_CENTER);
                } else if ('align-right' == type) {
                    this.api.put_ShapesAlign(Asc.c_oAscAlignShapeType.ALIGN_RIGHT);
                } else if ('align-top' == type) {
                    this.api.put_ShapesAlign(Asc.c_oAscAlignShapeType.ALIGN_TOP);
                } else if ('align-middle' == type) {
                    this.api.put_ShapesAlign(Asc.c_oAscAlignShapeType.ALIGN_MIDDLE);
                }else if ('align-bottom' == type) {
                    this.api.put_ShapesAlign(Asc.c_oAscAlignShapeType.ALIGN_BOTTOM);
                }else if ('distrib-hor' == type) {
                    this.api.DistributeHorizontally();
                }else if ('distrib-vert' == type) {
                    this.api.DistributeVertically();
                }
            },

            onBorderSize: function (e) {
                var me = this,
                    $target = $(e.currentTarget),
                    value = $target.val(),
                    shape = new Asc.asc_CShapeProperty(),
                    stroke = new Asc.asc_CStroke();

                value = borderSizeTransform.sizeByIndex(parseInt(value));

                if (value < 0.01) {
                    stroke.put_type(Asc.c_oAscStrokeType.STROKE_NONE);
                } else {
                    stroke.put_type(Asc.c_oAscStrokeType.STROKE_COLOR);
                    if (_borderColor == 'transparent')
                        stroke.put_color(Common.Utils.ThemeColor.getRgbColor({color: '000000', effectId: 29}));
                    else
                        stroke.put_color(Common.Utils.ThemeColor.getRgbColor(Common.Utils.ThemeColor.colorValue2EffectId(_borderColor)));
                    stroke.put_width(value * 25.4 / 72.0);
                }

                shape.put_stroke(stroke);

                me.api.ShapeApply(shape);
                me._initBorderColorView(); // when select STROKE_NONE or change from STROKE_NONE to STROKE_COLOR
            },

            onBorderSizeChanging: function (e) {
                var $target = $(e.currentTarget);
                $('#edit-chart-bordersize .item-after').text(borderSizeTransform.sizeByIndex($target.val()) + ' ' + _metricText);
            },

            onFillColor: function(palette, color) {
                var me = this;

                if (me.api) {
                    var shape = new Asc.asc_CShapeProperty(),
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

                    me.api.ShapeApply(shape);
                }
            },

            onBorderColor: function (palette, color) {
                var me = this;

                $('#edit-chart-bordercolor .color-preview').css('background-color', ('transparent' == color) ? color : ('#' + (_.isObject(color) ? color.color : color)));
                _borderColor = color;

                if (me.api && _shapeObject && _shapeObject.get_stroke().get_type() == Asc.c_oAscStrokeType.STROKE_COLOR) {
                    var shape = new Asc.asc_CShapeProperty(),
                        stroke = new Asc.asc_CStroke();

                    if (_shapeObject.get_stroke().get_width() < 0.01) {
                        stroke.put_type(Asc.c_oAscStrokeType.STROKE_NONE);
                    } else {
                        stroke.put_type(Asc.c_oAscStrokeType.STROKE_COLOR);
                        stroke.put_color(Common.Utils.ThemeColor.getRgbColor(color));
                        stroke.put_width(_shapeObject.get_stroke().get_width());
                        stroke.asc_putPrstDash(_shapeObject.get_stroke().asc_getPrstDash());
                    }

                    shape.put_stroke(stroke);

                    me.api.ShapeApply(shape);
                }
            },

            // API handlers

            onApiFocusObject: function (objects) {
                _stack = objects;

                var charts = [],
                    shapes = [];

                _.each(_stack, function (object) {
                    if (object.get_ObjectType() == Asc.c_oAscTypeSelectElement.Chart)
                        charts.push(object);
                    else if (object.get_ObjectType() == Asc.c_oAscTypeSelectElement.Shape && object.get_ObjectValue() && object.get_ObjectValue().get_FromChart()) {
                        shapes.push(object);
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

            onApiUpdateChartStyles: function () {
                if (this.api && _chartObject) {
                    this._updateChartStyles(this.api.asc_getChartPreviews(_chartObject.getType()));
                }
            },

            // Helpers

            _updateChartStyles: function(styles) {
                Common.SharedSettings.set('chartstyles', styles);
                Common.NotificationCenter.trigger('chartstyles:load', styles);

                $('#tab-chart-style li').single('click',    _.bind(this.onStyle, this));
            },

            _closeIfNeed: function () {
                if (!this._isChartInStack()) {
                    PE.getController('EditContainer').hideModal();
                }
            },

            _isChartInStack: function () {
                var chartExist = false;

                _.some(_stack, function(object) {
                    if (object.get_ObjectType() == Asc.c_oAscTypeSelectElement.Chart && object.get_ObjectValue()) {
                        chartExist = true;
                        return true;
                    }
                });

                return chartExist;
            }
        };
    })(), PE.Controllers.EditChart || {}))
});