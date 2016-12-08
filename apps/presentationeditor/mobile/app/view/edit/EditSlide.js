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
 *  EditSlide.js
 *  Presentation Editor
 *
 *  Created by Julia Radzhabova on 12/07/16
 *  Copyright (c) 2016 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!presentationeditor/mobile/app/template/EditSlide.template',
    'jquery',
    'underscore',
    'backbone'
], function (editTemplate, $, _, Backbone) {
    'use strict';

    PE.Views.EditSlide = Backbone.View.extend(_.extend((function() {
        // private
        var _layouts = [];

        return {
            // el: '.view-main',

            template: _.template(editTemplate),

            events: {
            },

            initialize: function () {
                Common.NotificationCenter.on('editcontainer:show', _.bind(this.initEvents, this));
                Common.NotificationCenter.on('editcategory:show',  _.bind(this.categoryShow, this));
            },

            initEvents: function () {
                var me = this;

                $('#slide-theme').single('click',                 _.bind(me.showTheme, me));
                $('#slide-change-layout').single('click',         _.bind(me.showLayout, me));
                $('#slide-transition').single('click',            _.bind(me.showTransition, me));
                $('#slide-style').single('click',                 _.bind(me.showStyle, me));

                me.initControls();
            },

            categoryShow: function(e) {
                // if ('edit-slide' == $(e.currentTarget).prop('id')) {
                //     this.initEvents();
                // }
            },

            // Render layout
            render: function () {
                this.layout = $('<div/>').append(this.template({
                    android : Common.SharedSettings.get('android'),
                    phone   : Common.SharedSettings.get('phone'),
                    scope   : this
                }));

                return this;
            },

            rootLayout: function () {
                if (this.layout) {
                    return this.layout
                        .find('#edit-slide-root')
                        .html();
                }

                return '';
            },

            initControls: function () {
                //
            },

            showPage: function (templateId, suspendEvent) {
                var rootView = PE.getController('EditContainer').rootView;

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

                    this.initEvents();
                }
            },

            showStyle: function () {
                this.showPage('#edit-slide-style', true);

                this.paletteFillColor = new Common.UI.ThemeColorPalette({
                    el: $('.page[data-page=edit-slide-style] .page-content'),
                    transparent: true
                });

                this.fireEvent('page:show', [this, '#edit-slide-style']);
            },

            showLayout: function () {
                this.showPage('#edit-slide-layout', true);

                this.renderLayouts();

                this.fireEvent('page:show', [this, '#edit-slide-layout']);
            },

            showTheme: function () {
                this.showPage('#edit-slide-theme');
            },

            showTransition: function () {
                this.showPage('#edit-slide-transition');
            },

            updateLayouts: function () {
                _layouts = Common.SharedSettings.get('slidelayouts');
                this.renderLayouts();
            },

            renderLayouts: function() {
                var $layoutContainer = $('.container-edit .slide-layout');
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
                    ].join(''), {
                        layouts: layouts
                    });

                    $layoutContainer.html(template);
                }
            },

            renderThemes: function() {
                var $themeContainer = $('.container-edit .slide-theme'),
                    _arr = PE.getController('EditSlide').getThemes();

                if ($themeContainer.length > 0 && _arr.length>0) {
                    var columns = parseInt(($themeContainer.width()-20) / 95), // magic
                        row = -1,
                        themes = [];

                    _.each(_arr, function (theme, index) {
                        if (0 == index % columns) {
                            themes.push([]);
                            row++
                        }
                        themes[row].push(theme);
                    });

                    var template = _.template([
                        '<% _.each(themes, function(row) { %>',
                            '<div class="row">',
                            '<% _.each(row, function(theme) { %>',
                                '<div data-type="<%= theme.themeId %>"><img src="<%= theme.imageUrl %>"></div>',
                            '<% }); %>',
                            '</div>',
                        '<% }); %>'
                    ].join(''), {
                        themes: themes
                    });

                    $themeContainer.html(template);
                }
            },

            textTheme: 'Theme',
            textStyle: 'Style',
            textLayout: 'Layout',
            textTransition: 'Transition',
            textRemoveSlide: 'Delete Slide',
            textDuplicateSlide: 'Duplicate Slide',
            textBack: 'Back',
            textFill: 'Fill',
            textEffects: 'Effects',
            textSize: 'Size',
            textColor: 'Color',
            textOpacity: 'Opacity'
        }
    })(), PE.Views.EditSlide || {}))
});