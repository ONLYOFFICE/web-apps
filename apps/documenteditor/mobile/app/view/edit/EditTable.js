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
 *  Document Editor
 *
 *  Created by Alexander Yuzhin on 10/20/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!documenteditor/mobile/app/template/EditTable.template',
    'jquery',
    'underscore',
    'backbone',
    'common/mobile/lib/component/ThemeColorPalette'
], function (editTemplate, $, _, Backbone) {
    'use strict';

    DE.Views.EditTable = Backbone.View.extend(_.extend((function() {
        // private
        var _styles = [];

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

                $('#table-wrap').single('click',                        _.bind(me.showTableWrap, me));
                $('#table-style').single('click',                       _.bind(me.showTableStyle, me));
                $('#table-options').single('click',                     _.bind(me.showTableOptions, me));
                $('#edit-table-style-options').single('click',          _.bind(me.showTableStyleOptions, me));
                $('#edit-table-bordercolor').single('click',            _.bind(me.showBorderColor, me));
                $('.edit-table-style .categories a').single('click',    _.bind(me.showStyleCategory, me));

                me.initControls();
                me.renderStyles();
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
                        .find('#edit-table-root')
                        .html();
                }

                return '';
            },

            initControls: function () {
                //
            },

            updateStyles: function (styles) {
                _styles = styles;
                this.renderStyles();
            },

            renderStyles: function() {
                var $styleContainer = $('#edit-table-styles .item-inner');

                if ($styleContainer.length > 0) {
                    var columns = parseInt($styleContainer.width() / 70), // magic
                        row = -1,
                        styles = [];

                    _.each(_styles, function (style, index) {
                        if (0 == index % columns) {
                            styles.push([]);
                            row++
                        }
                        styles[row].push(style);
                    });

                    var template = _.template([
                        '<div class="dataview table-styles" style="width: 100%;">',
                            '<% _.each(styles, function(row) { %>',
                            '<div class="row">',
                                '<% _.each(row, function(style) { %>',
                                '<div data-type="<%= style.templateId %>">',
                                    '<img src="<%= style.imageUrl %>">',
                                '</div>',
                                '<% }); %>',
                            '</div>',
                            '<% }); %>',
                        '</div>'
                    ].join(''))({
                        styles: styles
                    });

                    $styleContainer.html(template);
                }
            },

            categoryShow: function(e) {
                // if ('edit-shape' == $(e.currentTarget).prop('id')) {
                //     this.initEvents();
                // }
            },

            showStyleCategory: function (e) {
                // remove android specific style
                $('.page[data-page=edit-table-style] .list-block.inputs-list').removeClass('inputs-list');
                if ($(e.currentTarget).data('type') == 'fill') {
                    this.fireEvent('page:show', [this, '#edit-table-style']);
                }
            },

            showPage: function (templateId, suspendEvent) {
                var rootView = DE.getController('EditContainer').rootView;

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

            showTableWrap: function () {
                this.showPage('#edit-table-wrap');
            },

            showTableStyle: function () {
                this.showPage('#edit-table-style', true);

                this.paletteFillColor = new Common.UI.ThemeColorPalette({
                    el: $('#tab-table-fill'),
                    transparent: true
                });

                this.fireEvent('page:show', [this, '#edit-table-style']);
            },

            showBorderColor: function () {
                this.showPage('#edit-table-border-color-view', true);

                this.paletteBorderColor = new Common.UI.ThemeColorPalette({
                    el: $('.page[data-page=edit-table-border-color] .page-content')
                });

                this.fireEvent('page:show', [this, '#edit-table-border-color-view']);
            },

            showTableOptions: function () {
                this.showPage('#edit-table-options');
            },

            showTableStyleOptions: function () {
                this.showPage('#edit-table-style-options-view');
            },

            textRemoveTable: 'Remove Table',
            textTableOptions: 'Table Options',
            textStyle: 'Style',
            textWrap: 'Wrap',
            textBack: 'Back',
            textInline: 'Inline',
            textFlow: 'Flow',
            textWithText: 'Move with Text',
            textFromText: 'Distance from Text',
            textAlign: 'Align',
            textOptions: 'Options',
            textRepeatHeader: 'Repeat as Header Row',
            textResizeFit: 'Resize to Fit Content',
            textCellMargins: 'Cell Margins',
            textFill: 'Fill',
            textBorder: 'Border',
            textStyleOptions: 'Style Options',
            textSize: 'Size',
            textColor: 'Color',
            textHeaderRow: 'Header Row',
            textTotalRow: 'Total Row',
            textBandedRow: 'Banded Row',
            textFirstColumn: 'First Column',
            textLastColumn: 'Last Column',
            textBandedColumn: 'Banded Column'
        }
    })(), DE.Views.EditTable || {}))
});