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
 *  AddShape.js
 *  Document Editor
 *
 *  Created by Alexander Yuzhin on 10/18/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'documenteditor/mobile/app/view/add/AddShape',
    'jquery',
    'underscore',
    'backbone'
], function (core, view, $, _, Backbone) {
    'use strict';

    DE.Controllers.AddShape = Backbone.Controller.extend(_.extend((function() {
        var _styles = [];

        return {
            models: [],
            collections: [],
            views: [
                'AddShape'
            ],

            initialize: function () {
                Common.NotificationCenter.on('addcontainer:show', _.bind(this.initEvents, this));

                // Fill shapes

                function randomColor() {
                    return '#' + Math.floor(Math.random()*16777215).toString(16);
                }

                _styles = [
                    {
                        title: 'Text',
                        thumb: 'shape-01.svg',
                        type: 'textRect'
                    },
                    {
                        title: 'Line',
                        thumb: 'shape-02.svg',
                        type: 'line'
                    },
                    {
                        title: 'Line with arrow',
                        thumb: 'shape-03.svg',
                        type: 'lineWithArrow'
                    },
                    {
                        title: 'Line with two arrows',
                        thumb: 'shape-04.svg',
                        type: 'lineWithTwoArrows'
                    },
                    {
                        title: 'Rect',
                        thumb: 'shape-05.svg',
                        type: 'rect'
                    },
                    {
                        title: 'Hexagon',
                        thumb: 'shape-06.svg',
                        type: 'hexagon'
                    },
                    {
                        title: 'Round rect',
                        thumb: 'shape-07.svg',
                        type: 'roundRect'
                    },
                    {
                        title: 'Ellipse',
                        thumb: 'shape-08.svg',
                        type: 'ellipse'
                    },
                    {
                        title: 'Triangle',
                        thumb: 'shape-09.svg',
                        type: 'triangle'
                    },
                    {
                        title: 'Triangle',
                        thumb: 'shape-10.svg',
                        type: 'rtTriangle'
                    },
                    {
                        title: 'Trapezoid',
                        thumb: 'shape-11.svg',
                        type: 'trapezoid'
                    },
                    {
                        title: 'Diamond',
                        thumb: 'shape-12.svg',
                        type: 'diamond'
                    },
                    {
                        title: 'Right arrow',
                        thumb: 'shape-13.svg',
                        type: 'rightArrow'
                    },
                    {
                        title: 'Left-right arrow',
                        thumb: 'shape-14.svg',
                        type: 'leftRightArrow'
                    },
                    {
                        title: 'Left arrow callout',
                        thumb: 'shape-15.svg',
                        type: 'leftArrow'
                    },
                    {
                        title: 'Right arrow callout',
                        thumb: 'shape-16.svg',
                        type: 'bentUpArrow'
                    },
                    {
                        title: 'Flow chart off page connector',
                        thumb: 'shape-17.svg',
                        type: 'flowChartOffpageConnector'
                    },
                    {
                        title: 'Heart',
                        thumb: 'shape-18.svg',
                        type: 'heart'
                    },
                    {
                        title: 'Math minus',
                        thumb: 'shape-19.svg',
                        type: 'mathMinus'
                    },
                    {
                        title: 'Math plus',
                        thumb: 'shape-20.svg',
                        type: 'mathPlus'
                    },
                    {
                        title: 'Parallelogram',
                        thumb: 'shape-21.svg',
                        type: 'parallelogram'
                    },
                    {
                        title: 'Wedge rect callout',
                        thumb: 'shape-22.svg',
                        type: 'wedgeRectCallout'
                    },
                    {
                        title: 'Wedge ellipse callout',
                        thumb: 'shape-23.svg',
                        type: 'wedgeEllipseCallout'
                    },
                    {
                        title: 'Cloud callout',
                        thumb: 'shape-24.svg',
                        type: 'cloudCallout'
                    }
                ];

                var elementsInRow = 4;
                var groups = _.chain(_styles).groupBy(function(element, index){
                    return Math.floor(index/elementsInRow);
                }).toArray().value();

                Common.SharedSettings.set('shapes', groups);
                Common.NotificationCenter.trigger('shapes:load', groups);
            },

            setApi: function (api) {
                this.api = api;
            },

            onLaunch: function () {
                this.createView('AddShape').render();
            },

            initEvents: function () {
                var me = this;

                $('#add-shape li').single('click',  _.buffered(me.onShapeClick, 300, me));
            },

            onShapeClick: function (e) {
                var me = this,
                    $target = $(e.currentTarget);

                if ($target && me.api) {
                    me.api.AddShapeOnCurrentPage($target.data('type'));
                }

                DE.getController('AddContainer').hideModal();
            },

            // Public

            getStyles: function () {
                return _styles;
            }
        }
    })(), DE.Controllers.AddShape || {}))
});