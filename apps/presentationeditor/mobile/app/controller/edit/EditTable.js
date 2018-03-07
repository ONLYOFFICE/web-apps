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
 *  EditTable.js
 *  Presentation Editor
 *
 *  Created by Julia Radzhabova on 11/30/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'presentationeditor/mobile/app/view/edit/EditTable',
    'jquery',
    'underscore',
    'backbone'
], function (core, view, $, _, Backbone) {
    'use strict';

    PE.Controllers.EditTable = Backbone.Controller.extend(_.extend((function() {
        // Private
        var _stack = [],
            _metricText = Common.Utils.Metric.getCurrentMetricName(),
            _tableObject = undefined,
            _tableLook = {},
            _cellBorders = undefined,
            _cellBorderColor = '000000',
            _cellBorderWidth = 0.5;

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
                'EditTable'
            ],

            initialize: function () {
                Common.NotificationCenter.on('editcontainer:show', _.bind(this.initEvents, this));

                this.addListeners({
                    'EditTable': {
                        'page:show'     : this.onPageShow
                    }
                });

                var me = this;
                uiApp.onPageBack('edit-table-style-options', function (page) {
                    $('.dataview.table-styles .row div').single('click',    _.bind(me.onStyleClick, me));
                    me.initSettings('#edit-table-style');
                });
            },

            setApi: function (api) {
                var me = this;
                me.api = api;

                me.api.asc_registerCallback('asc_onFocusObject',        _.bind(me.onApiFocusObject, me));
                me.api.asc_registerCallback('asc_onInitTableTemplates', _.bind(me.onApiInitTemplates, me));
            },

            onLaunch: function () {
                this.createView('EditTable').render();
            },

            initEvents: function () {
                var me = this;

                $('#table-remove-all').single('click',                  _.bind(function(){me.api.remTable(); me._closeIfNeed()}, me));
                $('#insert-column-left').single('click',                _.bind(function(){me.api.addColumnLeft(); me._closeIfNeed()}, me));
                $('#insert-column-right').single('click',               _.bind(function(){me.api.addColumnRight(); me._closeIfNeed()}, me));
                $('#insert-row-above').single('click',                  _.bind(function(){me.api.addRowAbove(); me._closeIfNeed()}, me));
                $('#insert-row-below').single('click',                  _.bind(function(){me.api.addRowBelow(); me._closeIfNeed()}, me));
                $('#remove-column').single('click',                     _.bind(function(){me.api.remColumn(); me._closeIfNeed()}, me));
                $('#remove-row').single('click',                        _.bind(function(){me.api.remRow(); me._closeIfNeed()}, me));
                $('#table-options-margins input').single('change touchend',      _.buffered(me.onOptionMargin, 100, me));
                $('#table-options-margins input').single('input',       _.bind(me.onOptionMarginChanging, me));

                me.initSettings();
            },

            onPageShow: function (view, pageId) {
                var me = this,
                    paletteFillColor = me.getView('EditTable').paletteFillColor,
                    paletteBorderColor = me.getView('EditTable').paletteBorderColor;

                $('#table-options-header-row input:checkbox').single('change',    _.bind(me.onCheckTemplateChange, me, 0));
                $('#table-options-total-row input:checkbox').single('change',     _.bind(me.onCheckTemplateChange, me, 1));
                $('#table-options-banded-row input:checkbox').single('change',    _.bind(me.onCheckTemplateChange, me, 2));
                $('#table-options-first-column input:checkbox').single('change',  _.bind(me.onCheckTemplateChange, me, 3));
                $('#table-options-last-column input:checkbox').single('change',   _.bind(me.onCheckTemplateChange, me, 4));
                $('#table-options-banded-column input:checkbox').single('change', _.bind(me.onCheckTemplateChange, me, 5));

                $('#edit-table-bordertypes a').single('click',          _.bind(me.onBorderTypeClick, me));

                $('.dataview.table-styles .row div').single('click',    _.bind(me.onStyleClick, me));
                $('#edit-table-bordersize input').single('change touchend',  _.buffered(me.onBorderSize, 100, me));
                $('#edit-table-bordersize input').single('input',            _.bind(me.onBorderSizeChanging, me));

                paletteFillColor && paletteFillColor.on('select',       _.bind(me.onFillColor, me));
                paletteBorderColor && paletteBorderColor.on('select',   _.bind(me.onBorderColor, me));

                $('.table-reorder a').single('click',                   _.bind(me.onReorder, me));
                $('.table-align a').single('click',                     _.bind(me.onAlign, me));

                me.initSettings(pageId);
            },

            initSettings: function (pageId) {
                var me = this;

                if (_tableObject) {
                    if (pageId == "#edit-table-style" || pageId == '#edit-table-border-color-view') {
                        me._initStyleView();
                    } else if (pageId == '#edit-table-style-options-view') {
                        me._initStyleOptionsView();
                    } else
                        me._initTableOptionsView();
                }
            },

            _initStyleOptionsView: function() {
                $('#table-options-header-row input').prop('checked',    _tableLook.get_FirstRow());
                $('#table-options-total-row input').prop('checked',     _tableLook.get_LastRow());
                $('#table-options-banded-row input').prop('checked',    _tableLook.get_BandHor());
                $('#table-options-first-column input').prop('checked',  _tableLook.get_FirstCol());
                $('#table-options-last-column input').prop('checked',   _tableLook.get_LastCol());
                $('#table-options-banded-column input').prop('checked', _tableLook.get_BandVer());
            },

            _initTableOptionsView: function() {
                var margins = _tableObject.get_CellMargins();
                if (margins) {
                    var distance = Common.Utils.Metric.fnRecalcFromMM(margins.get_Left());
                    $('#table-options-margins input').val(distance);
                    $('#table-options-margins .item-after').text(distance + ' ' + _metricText);
                }
            },

            _initStyleView: function() {
                var me = this;

                /**
                 * Style
                 */

                var styleId = _tableObject.get_TableStyle();
                $('#edit-table-styles .table-styles div').removeClass('active');
                $('#edit-table-styles .table-styles div[data-type=' + styleId + ']').addClass('active');

                /**
                 * Fill
                 */

                var background = _tableObject.get_CellsBackground(),
                    fillColor = 'transparent';

                if (background) {
                    if (background.get_Value()==0) {
                        var color = background.get_Color();
                        if (color) {
                            if (color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                                fillColor = {color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()), effectValue: color.get_value()};
                            } else {
                                fillColor = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
                            }
                        }
                    }
                }

                var palette = me.getView('EditTable').paletteFillColor;

                if (palette) {
                    palette.select(fillColor);
                }

                /**
                 * Border
                 */

                // if (_.isUndefined(_cellBorderColor) || _.isUndefined(_cellBorderWidth)) {
                //     _cellBorders = _tableObject.get_CellBorders();
                //
                //     _.some([
                //         _cellBorders.get_Left(),
                //         _cellBorders.get_Top(),
                //         _cellBorders.get_Right(),
                //         _cellBorders.get_Bottom(),
                //         _cellBorders.get_InsideV(),
                //         _cellBorders.get_InsideH()
                //     ], function (border) {
                //         if (border.get_Value() > 0) {
                //             var borderColor = border.get_Color();
                //
                //             if (borderColor.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                //                 borderColor = {
                //                     color: Common.Utils.ThemeColor.getHexColor(borderColor.get_r(), borderColor.get_g(), borderColor.get_b()),
                //                     effectValue: borderColor.get_value()
                //                 };
                //             } else {
                //                 borderColor = Common.Utils.ThemeColor.getHexColor(borderColor.get_r(), borderColor.get_g(), borderColor.get_b());
                //             }
                //
                //             _cellBorderWidth = border.get_Size();
                //             _cellBorderColor = borderColor;
                //
                //             return true;
                //         }
                //     });
                // }

                $('#edit-table-bordersize input').val([borderSizeTransform.indexSizeByValue(_cellBorderWidth)]);
                $('#edit-table-bordersize .item-after').text(borderSizeTransform.sizeByValue(_cellBorderWidth) + ' ' + _metricText);

                var borderPalette = me.getView('EditTable').paletteBorderColor;

                if (borderPalette) {
                    borderPalette.select(_cellBorderColor);
                }

                $('#edit-table-bordercolor .color-preview').css('background-color', ('transparent' == _cellBorderColor) ? _cellBorderColor : ('#' + (_.isObject(_cellBorderColor) ? _cellBorderColor.color : _cellBorderColor)));
            },

            _updateBordersStyle: function(border) {
                _cellBorders = new Asc.CBorders();
                var updateBorders = _cellBorders;

                var visible = (border != '');

                if (border.indexOf('l') > -1 || !visible) {
                    if (updateBorders.get_Left()===null || updateBorders.get_Left()===undefined)
                        updateBorders.put_Left(new Asc.asc_CTextBorder());
                    this._updateBorderStyle (updateBorders.get_Left(), visible);
                }
                if (border.indexOf('t') > -1 || !visible) {
                    if (updateBorders.get_Top()===null || updateBorders.get_Top()===undefined)
                        updateBorders.put_Top(new Asc.asc_CTextBorder());
                    this._updateBorderStyle (updateBorders.get_Top(), visible);
                }
                if (border.indexOf('r') > -1 || !visible) {
                    if (updateBorders.get_Right()===null || updateBorders.get_Right()===undefined)
                        updateBorders.put_Right(new Asc.asc_CTextBorder());
                    this._updateBorderStyle (updateBorders.get_Right(), visible);
                }
                if (border.indexOf('b') > -1 || !visible) {
                    if (updateBorders.get_Bottom()===null || updateBorders.get_Bottom()===undefined)
                        updateBorders.put_Bottom(new Asc.asc_CTextBorder());
                    this._updateBorderStyle (updateBorders.get_Bottom(), visible);
                }
                if (border.indexOf('c') > -1 || !visible) {
                    if (updateBorders.get_InsideV()===null || updateBorders.get_InsideV()===undefined)
                        updateBorders.put_InsideV(new Asc.asc_CTextBorder());
                    this._updateBorderStyle (updateBorders.get_InsideV(), visible);
                }
                if (border.indexOf('m') > -1 || !visible) {
                    if (updateBorders.get_InsideH()===null || updateBorders.get_InsideH()===undefined)
                        updateBorders.put_InsideH(new Asc.asc_CTextBorder());
                    this._updateBorderStyle (updateBorders.get_InsideH(), visible);
                }
            },

            _updateBorderStyle: function(border, visible) {
                if (_.isNull(border)) {
                    border = new Asc.asc_CTextBorder();
                }

                if (visible && _cellBorderWidth > 0){
                    var size = parseFloat(_cellBorderWidth);
                    border.put_Value(1);
                    border.put_Size(size * 25.4 / 72.0);
                    var color = Common.Utils.ThemeColor.getRgbColor(_cellBorderColor);
                    border.put_Color(color);
                }
                else {
                    border.put_Value(0);
                }
            },

            // Public

            getTable: function() {
                return _tableObject;
            },

            // Handlers

            onOptionMargin: function (e) {
                var me = this,
                    $target = $(e.currentTarget),
                    value = $target.val(),
                    properties = new Asc.CTableProp(),
                    margins = new Asc.CMargins();

                $('#table-options-margins .item-after').text(value + ' ' + _metricText);

                value = Common.Utils.Metric.fnRecalcToMM(value);

                margins.put_Top(value);
                margins.put_Right(value);
                margins.put_Bottom(value);
                margins.put_Left(value);
                margins.put_Flag(2);

                properties.put_CellMargins(margins);

                me.api.tblApply(properties);
            },

            onOptionMarginChanging: function (e) {
                var $target = $(e.currentTarget);
                $('#table-options-margins .item-after').text($target.val() + ' ' + _metricText);
            },

            onCheckTemplateChange: function(type, e) {
                if (this.api)   {
                    var properties = new Asc.CTableProp();

                    switch (type) {
                        case 0:
                            _tableLook.put_FirstRow($('#table-options-header-row input').is(':checked'));
                            break;
                        case 1:
                            _tableLook.put_LastRow($('#table-options-total-row input').is(':checked'));
                            break;
                        case 2:
                            _tableLook.put_BandHor($('#table-options-banded-row input').is(':checked'));
                            break;
                        case 3:
                            _tableLook.put_FirstCol($('#table-options-first-column input').is(':checked'));
                            break;
                        case 4:
                            _tableLook.put_LastCol($('#table-options-last-column input').is(':checked'));
                            break;
                        case 5:
                            _tableLook.put_BandVer($('#table-options-banded-column input').is(':checked'));
                            break;
                    }

                    properties.put_TableLook(_tableLook);
                    this.api.tblApply(properties);
                }
            },

            onBorderTypeClick: function (e) {
                var me = this,
                    $target = $(e.currentTarget),
                    type = $target.data('type');

                this._updateBordersStyle(type);

                if (me.api) {
                    var properties = new Asc.CTableProp();
                    _cellBorders = _.isUndefined(_cellBorders) ? new Asc.CBorders() : _cellBorders;

                    properties.put_CellBorders(_cellBorders);
                    properties.put_CellSelect(true);

                    me.api.tblApply(properties);
                }
            },

            onFillColor: function(palette, color) {
                if (this.api) {
                    var properties = new Asc.CTableProp(),
                        background = new Asc.CBackground();

                    properties.put_CellsBackground(background);

                    if ('transparent' == color) {
                        background.put_Value(1);
                    } else {
                        background.put_Value(0);
                        background.put_Color(Common.Utils.ThemeColor.getRgbColor(color));
                    }

                    properties.put_CellSelect(true);

                    this.api.tblApply(properties);
                }
            },

            onBorderColor: function (palette, color) {
                _cellBorderColor = color;
                $('#edit-table-bordercolor .color-preview').css('background-color', ('transparent' == color) ? color : ('#' + (_.isObject(color) ? color.color : color)));
            },

            onStyleClick: function (e) {
                var me = this,
                    $target = $(e.currentTarget),
                    type = $target.data('type'),
                    properties = new Asc.CTableProp();

                $('#edit-table-styles .table-styles div').removeClass('active');
                $target.addClass('active');

                properties.put_TableStyle(type);
                me.api.tblApply(properties);
            },

            onBorderSize: function (e) {
                var $target = $(e.currentTarget),
                    value = $target.val();

                _cellBorderWidth = borderSizeTransform.sizeByIndex(parseInt(value));
            },

            onBorderSizeChanging: function (e) {
                var $target = $(e.currentTarget);
                $('#edit-table-bordersize .item-after').text(borderSizeTransform.sizeByIndex($target.val()) + ' ' + _metricText);
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

            // API handlers

            onApiFocusObject: function (objects) {
                _stack = objects;

                var tables = [];

                _.each(_stack, function(object) {
                    if (object.get_ObjectType() == Asc.c_oAscTypeSelectElement.Table) {
                        tables.push(object);
                    }
                });

                if (tables.length > 0) {
                    var object = tables[tables.length - 1]; // get top table

                    _tableObject = object.get_ObjectValue();
                    _tableLook = _tableObject.get_TableLook();
                } else {
                    _tableObject = undefined;
                }
            },

            // Helpers

            _closeIfNeed: function () {
                if (!this._isTableInStack()) {
                    PE.getController('EditContainer').hideModal();
                }
            },

            _isTableInStack: function () {
                var tableExist = false;

                _.some(_stack, function(object) {
                    if (object.get_ObjectType() == Asc.c_oAscTypeSelectElement.Table) {
                        tableExist = true;
                        return true;
                    }
                });

                return tableExist;
            },

            onApiInitTemplates: function(templates) {
                var styles = [];

                _.each(templates, function(template){
                    styles.push({
                        imageUrl    : template.get_Image(),
                        templateId  : template.get_Id()
                    });
                });

                this.getView('EditTable').updateStyles(styles);
            }
        }
    })(), PE.Controllers.EditTable || {}))
});