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
 *  AddChart.js
 *
 *  Created by Maxim Kadushkin on 12/13/2016
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!spreadsheeteditor/mobile/app/template/AddChart.template',
    'backbone'
], function (addTemplate, Backbone) {
    'use strict';

    SSE.Views.AddChart = Backbone.View.extend(_.extend((function() {
        // private

        var _types = [
            { type: Asc.c_oAscChartTypeSettings.barNormal,               thumb: 'bar-normal'},
            { type: Asc.c_oAscChartTypeSettings.barStacked,              thumb: 'bar-stacked'},
            { type: Asc.c_oAscChartTypeSettings.barStackedPer,           thumb: 'bar-pstacked'},
            { type: Asc.c_oAscChartTypeSettings.lineNormal,              thumb: 'line-normal'},
            { type: Asc.c_oAscChartTypeSettings.lineStacked,             thumb: 'line-stacked'},
            { type: Asc.c_oAscChartTypeSettings.lineStackedPer,          thumb: 'line-pstacked'},
            { type: Asc.c_oAscChartTypeSettings.hBarNormal,              thumb: 'hbar-normal'},
            { type: Asc.c_oAscChartTypeSettings.hBarStacked,             thumb: 'hbar-stacked'},
            { type: Asc.c_oAscChartTypeSettings.hBarStackedPer,          thumb: 'hbar-pstacked'},
            { type: Asc.c_oAscChartTypeSettings.areaNormal,              thumb: 'area-normal'},
            { type: Asc.c_oAscChartTypeSettings.areaStacked,             thumb: 'area-stacked'},
            { type: Asc.c_oAscChartTypeSettings.areaStackedPer,          thumb: 'area-pstacked'},
            { type: Asc.c_oAscChartTypeSettings.pie,                     thumb: 'pie'},
            { type: Asc.c_oAscChartTypeSettings.doughnut,                thumb: 'doughnut'},
            { type: Asc.c_oAscChartTypeSettings.pie3d,                   thumb: 'pie3d'},
            { type: Asc.c_oAscChartTypeSettings.scatter,                 thumb: 'scatter'},
            { type: Asc.c_oAscChartTypeSettings.stock,                   thumb: 'stock'},
            { type: Asc.c_oAscChartTypeSettings.line3d,                  thumb: 'line3d'},
            { type: Asc.c_oAscChartTypeSettings.barNormal3d,             thumb: 'bar3dnormal'},
            { type: Asc.c_oAscChartTypeSettings.barStacked3d,            thumb: 'bar3dstack'},
            { type: Asc.c_oAscChartTypeSettings.barStackedPer3d,         thumb: 'bar3dpstack'},
            { type: Asc.c_oAscChartTypeSettings.hBarNormal3d,            thumb: 'hbar3dnormal'},
            { type: Asc.c_oAscChartTypeSettings.hBarStacked3d,           thumb: 'hbar3dstack'},
            { type: Asc.c_oAscChartTypeSettings.hBarStackedPer3d,        thumb: 'hbar3dpstack'},
            { type: Asc.c_oAscChartTypeSettings.barNormal3dPerspective,  thumb: 'bar3dpsnormal'}
        ];

        return {
            // el: '.view-main',

            template: _.template(addTemplate),

            events: {
            },

            initialize: function () {
                Common.NotificationCenter.on('addcontainer:show', _.bind(this.initEvents, this));
            },

            initEvents: function () {
                var me = this;

                $('.chart-types .thumb').single('click', this.onTypeClick.bind(this));

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
                    types   : groupsOfTypes
                }));

                var $chartStyles = $('.container-add .chart-styles');
                if ( $chartStyles ) {
                    $chartStyles.replaceWith(this.layout.find('#add-chart-root').html());
                }

                return this;
            },

            rootLayout: function () {
                if (this.layout) {
                    return this.layout.html();
                }

                return '';
            },

            initControls: function () {
                //
            },

            onTypeClick: function (e) {
                this.fireEvent('chart:insert', [$(e.target.parentElement).data('type')]);
            }
        }
    })(), SSE.Views.AddChart || {}))
});