/*
 *
 * (c) Copyright Ascensio System SIA 2010-2019
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
 * You can contact Ascensio System SIA at 20A-12 Ernesta Birznieka-Upisha
 * street, Riga, Latvia, EU, LV-1050.
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
    'text!presentationeditor/mobile/app/template/EditTable.template',
    'jquery',
    'underscore',
    'backbone',
    'common/mobile/lib/component/ThemeColorPalette',
    'common/mobile/lib/component/HsbColorPicker'
], function (editTemplate, $, _, Backbone) {
    'use strict';

    PE.Views.EditTable = Backbone.View.extend(_.extend((function() {
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

                $('#table-style').single('click',                       _.bind(me.showTableStyle, me));
                $('#edit-table-style-options').single('click',          _.bind(me.showTableStyleOptions, me));
                $('#edit-table-bordercolor').single('click',            _.bind(me.showBorderColor, me));
                $('.edit-table-style .categories a').single('click',    _.bind(me.showStyleCategory, me));
                $('#table-reorder').single('click',                     _.bind(me.showReorder, me));
                $('#table-align').single('click',                       _.bind(me.showAlign, me));

                Common.Utils.addScrollIfNeed('#edit-table .pages', '#edit-table .page');
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

                if ($styleContainer.length > 0 && $styleContainer.is(':visible')) {
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

                // Common.Utils.addScrollIfNeed('.page[data-page=edit-table-style] .tabs', '#tab-table-style');
                Common.Utils.addScrollIfNeed('#tab-table-style', '#tab-table-style .list-block');
                Common.Utils.addScrollIfNeed('#tab-table-fill', '#tab-table-fill .list-block');
                Common.Utils.addScrollIfNeed('#tab-table-border', '#tab-table-border .list-block');
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

                Common.Utils.addScrollIfNeed('#tab-table-style', '#tab-table-style .list-block');
                Common.Utils.addScrollIfNeed('.page.table-reorder', '.page.table-reorder .page-content');
            },

            showTableStyle: function () {
                var me = this;
                this.showPage('#edit-table-style', true);

                this.paletteFillColor = new Common.UI.ThemeColorPalette({
                    el: $('#tab-table-fill'),
                    transparent: true
                });
                this.paletteFillColor.on('customcolor', function () {
                    me.showCustomFillColor();
                });
                var template = _.template(['<div class="list-block">',
                    '<ul>',
                    '<li>',
                    '<a id="edit-table-add-custom-color" class="item-link">',
                    '<div class="item-content">',
                    '<div class="item-inner">',
                    '<div class="item-title"><%= scope.textAddCustomColor %></div>',
                    '</div>',
                    '</div>',
                    '</a>',
                    '</li>',
                    '</ul>',
                    '</div>'].join(''));
                $('#tab-table-fill').append(template({scope: this}));
                $('#edit-table-add-custom-color').single('click', _.bind(this.showCustomFillColor, this));

                this.fireEvent('page:show', [this, '#edit-table-style']);
            },

            showCustomFillColor: function () {
                var me = this,
                    selector = '#edit-table-custom-color-view';
                me.showPage(selector, true);

                me.customColorPicker = new Common.UI.HsbColorPicker({
                    el: $('.page[data-page=edit-table-custom-color] .page-content'),
                    color: me.paletteFillColor.currentColor
                });
                me.customColorPicker.on('addcustomcolor', function (colorPicker, color) {
                    me.paletteFillColor.addNewDynamicColor(colorPicker, color);
                    PE.getController('EditContainer').rootView.router.back();
                });

                me.fireEvent('page:show', [me, selector]);
            },

            showBorderColor: function () {
                var me = this;
                this.showPage('#edit-table-border-color-view', true);

                this.paletteBorderColor = new Common.UI.ThemeColorPalette({
                    el: $('.page[data-page=edit-table-border-color] .page-content')
                });
                this.paletteBorderColor.on('customcolor', function () {
                    me.showCustomBorderColor();
                });
                var template = _.template(['<div class="list-block">',
                    '<ul>',
                    '<li>',
                    '<a id="edit-table-add-custom-border-color" class="item-link">',
                    '<div class="item-content">',
                    '<div class="item-inner">',
                    '<div class="item-title"><%= scope.textAddCustomColor %></div>',
                    '</div>',
                    '</div>',
                    '</a>',
                    '</li>',
                    '</ul>',
                    '</div>'].join(''));
                $('.page[data-page=edit-table-border-color] .page-content').append(template({scope: this}));
                $('#edit-table-add-custom-border-color').single('click', _.bind(this.showCustomBorderColor, this));

                this.fireEvent('page:show', [this, '#edit-table-border-color-view']);
            },

            showCustomBorderColor: function() {
                var me = this,
                    selector = '#edit-table-custom-color-view';
                me.showPage(selector, true);

                me.customBorderColorPicker = new Common.UI.HsbColorPicker({
                    el: $('.page[data-page=edit-table-custom-color] .page-content'),
                    color: me.paletteBorderColor.currentColor
                });
                me.customBorderColorPicker.on('addcustomcolor', function (colorPicker, color) {
                    me.paletteBorderColor.addNewDynamicColor(colorPicker, color);
                    me.paletteFillColor.updateDynamicColors();
                    me.paletteFillColor.select(me.paletteFillColor.currentColor);
                    PE.getController('EditContainer').rootView.router.back();
                });

                me.fireEvent('page:show', [me, selector]);
            },

            showTableStyleOptions: function () {
                this.showPage('#edit-table-style-options-view');
            },

            showReorder: function () {
                this.showPage('#edit-table-reorder');
                Common.Utils.addScrollIfNeed('.page.table-reorder', '.page.table-reorder .page-content');
            },

            showAlign: function () {
                this.showPage('#edit-table-align');
                Common.Utils.addScrollIfNeed('.page.table-align', '.page.table-align .page-content');
            },

            textRemoveTable: 'Remove Table',
            textTableOptions: 'Table Options',
            textStyle: 'Style',
            textBack: 'Back',
            textOptions: 'Options',
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
            textBandedColumn: 'Banded Column',
            textReorder: 'Reorder',
            textToForeground: 'Bring to Foreground',
            textToBackground: 'Send to Background',
            textForward: 'Move Forward',
            textBackward: 'Move Backward',
            textAlign: 'Align',
            textAlignLeft:     'Align Left',
            textAlignRight:    'Align Right',
            textAlignCenter:   'Align Center',
            textAlignTop:      'Align Top',
            textAlignBottom:   'Align Bottom',
            textAlignMiddle:   'Align Middle',
            txtDistribHor:     'Distribute Horizontally',
            txtDistribVert:    'Distribute Vertically',
            textAddCustomColor: 'Add Custom Color',
            textCustomColor: 'Custom Color'
        }
    })(), PE.Views.EditTable || {}))
});