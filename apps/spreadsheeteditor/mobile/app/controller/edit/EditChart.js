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
            _chartInfo = {},
            _chartStyles = [],
            _borderInfo = {color: '000000', width: 1},
            _isEdit = false;

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

                me.getView('EditChart').renderStyles(_chartStyles);

                me.initSettings();
            },

            onPageShow: function (view, pageId) {
                var me = this;

                me.initSettings(pageId);
            },

            initSettings: function (pageId) {
                var me = this;

                if ('#edit-chart-styles' == pageId) {
                    me.initStylesPage();
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
                return _chartInfo;
            },

            initStylesPage: function () {
                //
            },

            initReorderPage: function () {
                $('.page[data-page=edit-chart-reorder] a.item-link').single('click', _.bind(this.onReorder, this));
            },

            initFillColorPage: function () {
                // var me = this,
                //     palette = me.getView('EditChart').paletteFillColor,
                //     color = me._sdkToThemeColor(_cellInfo.asc_getFill().asc_getColor());
                //
                // if (palette) {
                //     palette.select(color);
                //     palette.on('select', _.bind(me.onFillColor, me));
                // }
            },

            initBorderColorPage: function () {
                // var me = this,
                //     palette = new Common.UI.ThemeColorPalette({
                //         el: $('.page[data-page=edit-border-color] .page-content')
                //     });
                //
                // if (palette) {
                //     palette.select(_borderInfo.color);
                //     palette.on('select', _.bind(function (palette, color) {
                //         _borderInfo.color = color;
                //         $('#edit-border-color .color-preview').css('background-color', '#' + (_.isObject(_borderInfo.color) ? _borderInfo.color.color : _borderInfo.color));
                //     }, me));
                // }
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

            onFillColor:function (palette, color) {
                this.api.asc_setCellBackgroundColor(color == 'transparent' ? null : Common.Utils.ThemeColor.getRgbColor(color));
            },

            // API handlers

            onApiEditorSelectionChanged: function(fontObj) {
                if (!_isEdit) {
                    return;
                }
                //
                // _fontInfo = fontObj;
                // this.initFontSettings(fontObj);
            },

            onApiSelectionChanged: function(cellInfo) {
                if (!_isEdit) {
                    return;
                }

                // _cellInfo = cellInfo;
                // this.initCellSettings(cellInfo);
            },

            // Helpers

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

            textChart: 'Chart'
        }
    })(), SSE.Controllers.EditChart || {}))
});