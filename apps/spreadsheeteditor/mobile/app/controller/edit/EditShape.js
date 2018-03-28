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
 *  EditShape.js
 *  Spreadsheet Editor
 *
 *  Created by Alexander Yuzhin on 12/19/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'spreadsheeteditor/mobile/app/view/edit/EditShape',
    'jquery',
    'underscore',
    'backbone'
], function (core, view, $, _, Backbone) {
    'use strict';

    SSE.Controllers.EditShape = Backbone.Controller.extend(_.extend((function() {
        // Private
        var _stack = [],
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

                    return index;
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
                'EditShape'
            ],

            initialize: function () {
                Common.NotificationCenter.on('editcontainer:show', _.bind(this.initEvents, this));

                this.addListeners({
                    'EditShape': {
                        'page:show': this.onPageShow
                    }
                });
            },

            setApi: function (api) {
                var me = this;
                me.api = api;

                me.api.asc_registerCallback('asc_onSelectionChanged',   _.bind(me.onApiSelectionChanged, me));
                me.api.asc_registerCallback('asc_onFocusObject',        _.bind(me.onApiFocusObject, me));
            },

            setMode: function (mode) {
                _isEdit = mode.isEdit;
            },

            onPageShow: function (view, pageId) {
                var me = this;

                me.initSettings(pageId);
            },

            onLaunch: function () {
                this.createView('EditShape').render();
            },

            initEvents: function () {
                var me = this;

                me.initSettings();
            },

            initSettings: function (pageId) {
                if ($('#edit-shape').length < 1) {
                    return;
                }

                var me = this;

                if ('#edit-shape-style' == pageId) {
                    me.initStylePage();
                } else if ('#edit-shape-border-color-view' == pageId) {
                    me.initBorderColorPage();
                } else if ('#edit-shape-replace' == pageId) {
                    me.initReplacePage();
                } else if ('#edit-shape-reorder' == pageId) {
                    me.initReorderPage();
                } else {
                    me.initRootPage();
                }
            },

            initRootPage: function () {
                $('#shape-remove').single('click', _.bind(this.onRemoveShape, this));
            },

            initStylePage: function () {
                var me = this,
                    color,
                    shapeProperties = _shapeObject.get_ShapeProperties();

                // Fill

                var paletteFillColor = new Common.UI.ThemeColorPalette({
                    el: $('#tab-shape-fill'),
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

                var borderSize = me._mm2pt(shapeProperties.get_stroke().get_width()),
                    borderType = shapeProperties.get_stroke().get_type();
                $('#edit-shape-bordersize input').val([(borderType == Asc.c_oAscStrokeType.STROKE_NONE) ? 0 : borderSizeTransform.indexSizeByValue(borderSize)]);
                $('#edit-shape-bordersize .item-after').text(((borderType == Asc.c_oAscStrokeType.STROKE_NONE) ? 0 : borderSizeTransform.sizeByValue(borderSize)) + ' ' + _metricText);

                $('#edit-shape-bordersize input').single('change touchend', _.buffered(me.onBorderSize, 100, me));
                $('#edit-shape-bordersize input').single('input',           _.bind(me.onBorderSizeChanging, me));

                // Init border color
                me._initBorderColorView();

                // Effect
                // Init style opacity
                $('#edit-shape-effect input').val([shapeProperties.get_fill().asc_getTransparent() ? shapeProperties.get_fill().asc_getTransparent() / 2.55 : 100]);
                $('#edit-shape-effect .item-after').text($('#edit-shape-effect input').val() + ' ' + "%");
                $('#edit-shape-effect input').single('change touchend',     _.buffered(me.onOpacity, 100, me));
                $('#edit-shape-effect input').single('input',               _.bind(me.onOpacityChanging, me));
            },

            _initBorderColorView: function () {
                var me = this,
                    stroke = _shapeObject.get_ShapeProperties().get_stroke();

                _borderInfo.color = (stroke && stroke.get_type() == Asc.c_oAscStrokeType.STROKE_COLOR) ? me._sdkToThemeColor(stroke.get_color()) : 'transparent';

                $('#edit-shape-bordercolor .color-preview').css('background-color',
                    ('transparent' == _borderInfo.color)
                        ? _borderInfo.color
                        : ('#' + (_.isObject(_borderInfo.color) ? _borderInfo.color.color : _borderInfo.color))
                );
            },

            initReplacePage: function () {
                $('.shape-replace li').single('click', _.buffered(this.onReplace, 100, this));
            },

            initReorderPage: function () {
                $('.page[data-page=edit-shape-reorder] a.item-link').single('click', _.bind(this.onReorder, this));
            },

            initBorderColorPage: function () {
                var me = this,
                    palette = new Common.UI.ThemeColorPalette({
                        el: $('.page[data-page=edit-shape-border-color-view] .page-content')
                    });

                if (palette) {
                    palette.select(_borderInfo.color);
                    palette.on('select', _.bind(me.onBorderColor, me));
                }
            },

            // Public

            getShape: function () {
                return _shapeObject;
            },

            // Handlers

            onRemoveShape: function () {
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

            onReplace: function (e) {
                var $target = $(e.currentTarget),
                    type = $target.data('type');

                this.api.asc_changeShapeType(type);
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
                    stroke.put_width(me._pt2mm(value));
                }

                shape.put_stroke(stroke);
                image.asc_putShapeProperties(shape);

                me.api.asc_setGraphicObjectProps(image);
                me._initBorderColorView(); // when select STROKE_NONE or change from STROKE_NONE to STROKE_COLOR
            },

            onBorderSizeChanging: function (e) {
                var $target = $(e.currentTarget);
                $('#edit-shape-bordersize .item-after').text(borderSizeTransform.sizeByIndex($target.val()) + ' ' + _metricText);
            },

            onOpacity: function (e) {
                var me = this,
                    $target = $(e.currentTarget),
                    value = $target.val(),
                    properties = new Asc.asc_CImgProperty(),
                    fill = new Asc.asc_CShapeFill(),
                    shape = new Asc.asc_CShapeProperty();

                fill.asc_putTransparent(parseInt(value * 2.55));
                shape.asc_putFill(fill);
                properties.put_ShapeProperties(shape);

                me.api.asc_setGraphicObjectProps(properties);
            },

            onOpacityChanging: function (e) {
                var $target = $(e.currentTarget);
                $('#edit-shape-effect .item-after').text($target.val() + ' %');
            },

            onFillColor: function(palette, color) {
                var me = this,
                    currentShape = _shapeObject.get_ShapeProperties();

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

                    shape.asc_putFill(fill);
                    image.asc_putShapeProperties(shape);

                    me.api.asc_setGraphicObjectProps(image);
                }
            },

            onBorderColor: function (palette, color) {
                var me = this,
                    currentShape = _shapeObject.get_ShapeProperties();

                $('#edit-shape-bordercolor .color-preview').css('background-color', ('transparent' == color) ? color : ('#' + (_.isObject(color) ? color.color : color)));
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
                    image.asc_putShapeProperties(shape);

                    me.api.asc_setGraphicObjectProps(image);
                }
            },

            // API handlers

            onApiSelectionChanged: function(info) {
                if (!_isEdit) {
                    return;
                }

                var me = this,
                    selectedObjects = [],
                    selectType = info.asc_getFlags().asc_getSelectionType();

                if (selectType == Asc.c_oAscSelectionType.RangeShape) {
                    selectedObjects = me.api.asc_getGraphicObjectProps();
                }

                me.onApiFocusObject(selectedObjects);
            },

            onApiFocusObject: function (objects) {
                _stack = objects;

                if (!_isEdit) {
                    return;
                }

                if (_stack.length < 1) {
                    _stack = this.api.asc_getGraphicObjectProps();
                }

                var shapes = [];

                _.each(_stack, function (object) {
                    if (object.get_ObjectType() == Asc.c_oAscTypeSelectElement.Image) {
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

                _shapeObject = getTopObject(shapes);
            },

            // Helpers

            _pt2mm: function(value) {
                return (value * 25.4 / 72.0);
            },

            _mm2pt: function(value) {
                return (value * 72.0 / 25.4);
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
            }

        };
    })(), SSE.Controllers.EditShape || {}))
});