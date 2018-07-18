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
 *  AddSlide.js
 *  Presentation Editor
 *
 *  Created by Julia Radzhabova on 12/06/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!presentationeditor/mobile/app/template/AddSlide.template',
    'jquery',
    'underscore',
    'backbone'
], function (addTemplate, $, _, Backbone) {
    'use strict';

    PE.Views.AddSlide = Backbone.View.extend(_.extend((function() {
        // private
        var _layouts = [];

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
                me.initControls();
            },

            // Render layout
            render: function () {
                this.layout = $('<div/>').append(this.template({
                    android : Common.SharedSettings.get('android'),
                    phone   : Common.SharedSettings.get('phone')
                }));

                return this;
            },

            rootLayout: function () {
                if (this.layout) {
                    return this.layout
                        .find('#add-slide-root')
                        .html();
                }

                return '';
            },

            initControls: function () {
                //
            },

            updateLayouts: function (layouts) {
                _layouts = layouts;
                this.renderLayouts();
            },

            renderLayouts: function() {
                var $layoutContainer = $('.container-add .slide-layout');
                if ($layoutContainer.length > 0 && _layouts.length>0) {
                    var columns = parseInt(($layoutContainer.width()-20) / (_layouts[0].itemWidth+2)), // magic
                        row = -1,
                        layouts = [];

                    _.each(_layouts, function (layout, index) {
                        if (0 == index % columns) {
                            layouts.push([]);
                            row++
                        }
                        layouts[row].push(layout);
                    });

                    var template = _.template([
                        '<% _.each(layouts, function(row) { %>',
                            '<ul class="row">',
                                '<% _.each(row, function(item) { %>',
                                    '<li data-type="<%= item.idx %>">',
                                    '<img src="<%= item.imageUrl %>" width="<%= item.itemWidth %>" height="<%= item.itemHeight %>">',
                                    '</li>',
                                '<% }); %>',
                            '</ul>',
                        '<% }); %>'
                    ].join(''))({
                        layouts: layouts
                    });

                    $layoutContainer.html(template);
                }
            }
        }
    })(), PE.Views.AddSlide || {}))
});