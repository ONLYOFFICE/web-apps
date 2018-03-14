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
    'text!spreadsheeteditor/mobile/app/template/EditChart.template',
    'jquery',
    'underscore',
    'backbone',
    'common/mobile/lib/component/ThemeColorPalette'
], function (editTemplate, $, _, Backbone) {
    'use strict';

    SSE.Views.EditChart = Backbone.View.extend(_.extend((function() {
        // private
        var _editTextController,
            _types = [
            { type: Asc.c_oAscChartTypeSettings.barNormal,               thumb: 'chart-03.png'},
            { type: Asc.c_oAscChartTypeSettings.barStacked,              thumb: 'chart-02.png'},
            { type: Asc.c_oAscChartTypeSettings.barStackedPer,           thumb: 'chart-01.png'},
            { type: Asc.c_oAscChartTypeSettings.lineNormal,              thumb: 'chart-06.png'},
            { type: Asc.c_oAscChartTypeSettings.lineStacked,             thumb: 'chart-05.png'},
            { type: Asc.c_oAscChartTypeSettings.lineStackedPer,          thumb: 'chart-04.png'},
            { type: Asc.c_oAscChartTypeSettings.hBarNormal,              thumb: 'chart-09.png'},
            { type: Asc.c_oAscChartTypeSettings.hBarStacked,             thumb: 'chart-08.png'},
            { type: Asc.c_oAscChartTypeSettings.hBarStackedPer,          thumb: 'chart-07.png'},
            { type: Asc.c_oAscChartTypeSettings.areaNormal,              thumb: 'chart-12.png'},
            { type: Asc.c_oAscChartTypeSettings.areaStacked,             thumb: 'chart-11.png'},
            { type: Asc.c_oAscChartTypeSettings.areaStackedPer,          thumb: 'chart-10.png'},
            { type: Asc.c_oAscChartTypeSettings.pie,                     thumb: 'chart-13.png'},
            { type: Asc.c_oAscChartTypeSettings.doughnut,                thumb: 'chart-14.png'},
            { type: Asc.c_oAscChartTypeSettings.pie3d,                   thumb: 'chart-22.png'},
            { type: Asc.c_oAscChartTypeSettings.scatter,                 thumb: 'chart-15.png'},
            { type: Asc.c_oAscChartTypeSettings.stock,                   thumb: 'chart-16.png'},
            { type: Asc.c_oAscChartTypeSettings.line3d,                  thumb: 'chart-21.png'},
            { type: Asc.c_oAscChartTypeSettings.barNormal3d,             thumb: 'chart-17.png'},
            { type: Asc.c_oAscChartTypeSettings.barStacked3d,            thumb: 'chart-18.png'},
            { type: Asc.c_oAscChartTypeSettings.barStackedPer3d,         thumb: 'chart-19.png'},
            { type: Asc.c_oAscChartTypeSettings.hBarNormal3d,            thumb: 'chart-25.png'},
            { type: Asc.c_oAscChartTypeSettings.hBarStacked3d,           thumb: 'chart-24.png'},
            { type: Asc.c_oAscChartTypeSettings.hBarStackedPer3d,        thumb: 'chart-23.png'},
            { type: Asc.c_oAscChartTypeSettings.barNormal3dPerspective,  thumb: 'chart-20.png'}
        ];


        return {
            // el: '.view-main',

            template: _.template(editTemplate),

            events: {
            },

            initialize: function () {
                _editTextController = SSE.getController('EditChart');

                Common.NotificationCenter.on('editcontainer:show', _.bind(this.initEvents, this));
                this.on('page:show', _.bind(this.updateItemHandlers, this));
            },

            initEvents: function () {
                var me = this;

                me.updateItemHandlers();
                me.initControls();
            },

            // Render layout
            render: function () {
                var elementsInRow = 3;
                var groupsOfTypes = _.chain(_types).groupBy(function(element, index){
                    return Math.floor(index/elementsInRow);
                }).toArray().value();

                this.layout = $('<div/>').append(this.template({
                    android : Common.SharedSettings.get('android'),
                    phone   : Common.SharedSettings.get('phone'),
                    types   : groupsOfTypes,
                    scope   : this
                }));

                return this;
            },

            rootLayout: function () {
                if (this.layout) {
                    return this.layout
                        .find('#edit-chart-root')
                        .html();
                }

                return '';
            },

            initControls: function () {
                //
            },

            renderStyles: function (chartStyles) {
                var $styleContainer = $('#tab-chart-style');

                if ($styleContainer.length > 0) {
                    var columns = parseInt($styleContainer.width() / 70), // magic
                        row = -1,
                        styles = [];

                    _.each(chartStyles, function (style, index) {
                        if (0 == index % columns) {
                            styles.push([]);
                            row++
                        }
                        styles[row].push(style);
                    });

                    var template = _.template([
                        '<% _.each(styles, function(row) { %>',
                        '<ul class="row">',
                            '<% _.each(row, function(style) { %>',
                            '<li data-type="<%= style.asc_getStyle() %>">',
                                '<img src="<%= style.asc_getImageUrl() %>" width="50px" height="50px">',
                            '</li>',
                            '<% }); %>',
                        '</ul>',
                        '<% }); %>'
                    ].join(''))({
                        styles: styles
                    });

                    $styleContainer.html(template);
                }
            },

            updateItemHandlers: function () {
                var selectorsDynamicPage = [
                    '#edit-chart',
                    '.page[data-page=edit-chart-style]'
                ].map(function (selector) {
                    return selector + ' a.item-link[data-page]';
                }).join(', ');

                $(selectorsDynamicPage).single('click', _.bind(this.onItemClick, this));

                $('.edit-chart-style.subnavbar.categories a').single('click', function () {
                    $('.page[data-page=edit-chart-style]').find('.list-block.inputs-list').removeClass('inputs-list');
                });
            },

            showPage: function (templateId, suspendEvent) {
                var rootView = SSE.getController('EditContainer').rootView;

                if (rootView && this.layout) {
                    var $content = this.layout.find(templateId);

                    // Android fix for navigation
                    if (Framework7.prototype.device.android) {
                        $content.find('.page').append($content.find('.navbar'));
                    }

                    rootView.router.load({
                        content: $content.html()
                    });

                    if (suspendEvent !== true) {
                        this.fireEvent('page:show', [this, templateId]);
                    }
                }
            },

            onItemClick: function (e) {
                var $target = $(e.currentTarget),
                    page = $target.data('page');

                if (page && page.length > 0 ) {
                    this.showPage(page);
                }
            },

            textBack: 'Back',
            textChart: 'Chart',
            textReorder: 'Reorder',
            textRemoveChart: 'Remove Chart',
            textToForeground: 'Bring to Foreground',
            textToBackground: 'Send to Background',
            textForward: 'Move Forward',
            textBackward: 'Move Backward',
            textStyle: 'Style',
            textDesign: 'Design',
            textLayout: 'Layout',
            textVerAxis: 'Vertical Axis',
            textHorAxis: 'Horizontal Axis',
            textType: 'Type',
            textFill: 'Fill',
            textBorder: 'Border',
            textSize: 'Size',
            textColor: 'Color',
            textOverlay: 'Overlay',
            textNoOverlay: 'No Overlay',
            textChartTitle: 'Chart Title',
            textLeft: 'Left',
            textTop: 'Top',
            textRight: 'Right',
            textBottom: 'Bottom',
            textLeftOverlay: 'Left Overlay',
            textRightOverlay: 'Right Overlay',
            textLegend: 'Legend',
            textAxisTitle: 'Axis Title',
            textHorizontal: 'Horizontal',
            textRotated: 'Rotated',
            textVertical: 'Vertical',
            textMajor: 'Major',
            textMinor: 'Minor',
            textMajorMinor: 'Major and Minor',
            textDataLabels: 'Data Labels',
            textAxisOptions: 'Axis Options',
            textMinValue: 'Minimum Value',
            textMaxValue: 'Maximum Value',
            textAxisCrosses: 'Axis Crosses',
            textAuto: 'Auto',
            textCrossesValue: 'Crosses Value',
            textDisplayUnits: 'Display Units',
            textValReverseOrder: 'Values in Reverse Order',
            textTickOptions: 'Tick Options',
            textMajorType: 'Major Type',
            textMinorType: 'Minor Type',
            textLabelOptions: 'Label Options',
            textLabelPos: 'Label Position',
            textAxisPosition: 'Axis Position',
            textNone: 'None'
        }
    })(), SSE.Views.EditChart || {}))
});