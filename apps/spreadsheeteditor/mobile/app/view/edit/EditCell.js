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
 *  EditCell.js
 *  Spreadsheet Editor
 *
 *  Created by Alexander Yuzhin on 12/6/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!spreadsheeteditor/mobile/app/template/EditCell.template',
    'jquery',
    'underscore',
    'backbone',
    'common/mobile/lib/component/ThemeColorPalette'
], function (editTemplate, $, _, Backbone) {
    'use strict';

    SSE.Views.EditCell = Backbone.View.extend(_.extend((function() {
        // private
        var _fontsList,
            _editCellController;

        return {
            // el: '.view-main',

            template: _.template(editTemplate),

            events: {
            },

            initialize: function () {
                _editCellController = SSE.getController('EditCell');

                Common.NotificationCenter.on('editcontainer:show', _.bind(this.initEvents, this));
                this.on('page:show', _.bind(this.updateItemHandlers, this));
            },

            initEvents: function () {
                var me = this;

                me.updateItemHandlers();

                $('#font-fonts').single('click',        _.bind(me.showFonts, me));
                $('#text-color').single('click',        _.bind(me.showTextColor, me));
                $('#fill-color').single('click',        _.bind(me.showFillColor, me));

                me.initControls();
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
                        .find('#edit-cell-root')
                        .html();
                }

                return '';
            },

            initControls: function () {
                //
            },

            renderStyles: function (cellStyles) {
                var $styleContainer = $('#edit-cell .cell-styles');

                if ($styleContainer.length > 0) {
                    var styleSize = _editCellController.getStyleSize(),
                        columns = parseInt($styleContainer.width() / (styleSize.width + 5)),
                        row = -1,
                        styles = [];

                    _.each(cellStyles, function (style, index) {
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
                            '<li data-type="<%= style.asc_getName() %>">',
                                '<div class="thumb" style="background-image:url(<%= style.asc_getImage() %>); width: <%= styleSize.width %>px; height: <%= styleSize.height %>px;">',
                            '</li>',
                            '<% }); %>',
                        '</ul>',
                        '<% }); %>'
                    ].join(''))({
                        styles: styles,
                        styleSize: styleSize
                    });

                    $styleContainer.html(template);

                    $('#edit-cell .cell-styles li').single('click', _.buffered(function (e) {
                        var $target = $(e.currentTarget),
                            type = $target.data('type');

                        $('#edit-cell .cell-styles li').removeClass('active');
                        $target.addClass('active');

                        this.fireEvent('style:click', [this, type]);
                    }, 100, this));
                }
            },

            updateItemHandlers: function () {
                var selectorsDynamicPage = [
                    '#edit-cell',
                    '.page[data-page=edit-border-style]',
                    '.page[data-page=edit-cell-format]'
                ].map(function (selector) {
                    return selector + ' a.item-link[data-page]';
                }).join(', ');

                $(selectorsDynamicPage).single('click', _.bind(this.onItemClick, this));
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

            showFonts: function () {
                this.showPage('#edit-text-fonts');

                var me = this,
                    $template = $(
                        '<div>' +
                            '<li>' +
                                '<label class="label-radio item-content">' +
                                    '<input type="radio" name="font-name" value="{{name}}">' +
                                    (Framework7.prototype.device.android ? '<div class="item-media"><i class="icon icon-form-radio"></i></div>' : '') +
                                    '<div class="item-inner">' +
                                        '<div class="item-title" style="font-family: \'{{name}}\';">{{name}}</div>' +
                                    '</div>' +
                                '</label>' +
                            '</li>' +
                        '</div>'
                    );

                _fontsList = uiApp.virtualList('#font-list.virtual-list', {
                    items: SSE.getController('EditCell').getFonts(),
                    template: $template.html(),
                    onItemsAfterInsert: function (list, fragment) {
                        var fontInfo = _editCellController.getFontInfo();
                        $('#font-list input[name=font-name]').val([fontInfo.name]);

                        $('#font-list li').single('click', _.buffered(function (e) {
                            me.fireEvent('font:click', [me, e]);
                        }, 100));
                    }
                });
            },

            showTextColor: function () {
                this.showPage('#edit-text-color', true);

                this.paletteTextColor = new Common.UI.ThemeColorPalette({
                    el: $('.page[data-page=edit-text-color] .page-content')
                });

                this.fireEvent('page:show', [this, '#edit-text-color']);
            },

            showFillColor: function () {
                this.showPage('#edit-fill-color', true);

                this.paletteFillColor = new Common.UI.ThemeColorPalette({
                    el: $('.page[data-page=edit-fill-color] .page-content'),
                    transparent: true
                });

                this.fireEvent('page:show', [this, '#edit-fill-color']);
            },

            textBack: 'Back',
            textFonts: 'Fonts',
            textTextColor: 'Text Color',
            textFillColor: 'Fill Color',
            textTextFormat: 'Text Format',
            textBorderStyle: 'Border Style',
            textSize: 'Size',
            textFormat: 'Format',
            textCellStyle: 'Cell Styles',
            textAlignLeft: 'Align Left',
            textAlignCenter: 'Align Center',
            textAlignRight: 'Align Right',
            textJustified: 'Justified',
            textAlignTop: 'Align Top',
            textAlignMiddle: 'Align Middle',
            textAlignBottom: 'Align Bottom',
            textWrapText: 'Wrap Text',
            textNoBorder: 'No Border',
            textAllBorders: 'All Borders',
            textBottomBorder: 'Bottom Border',
            textTopBorder: 'Top Border',
            textLeftBorder: 'Left Border',
            textRightBorder: 'Right Border',
            textInBorders: 'Inside Borders',
            textInVertBorder: 'Inside Vertical Border',
            textInHorBorder: 'Inside Horizontal Border',
            textDiagUpBorder: 'Diagonal Up Border',
            textDiagDownBorder: 'Diagonal Down Border',
            textColor: 'Color',
            textThin: 'Thin',
            textMedium: 'Medium',
            textThick: 'Thick',
            textInteger: 'Integer',
            textGeneral: 'General',
            textNumber: 'Number',
            textScientific: 'Scientific',
            textAccounting: 'Accounting',
            textCurrency: 'Currency',
            textDate: 'Date',
            textTime: 'Time',
            textPercentage: 'Percentage',
            textText: 'Text',
            textDollar: 'Dollar',
            textEuro: 'Euro',
            textPound: 'Pound',
            textRouble: 'Rouble',
            textYen: 'Yen'
    }
    })(), SSE.Views.EditCell || {}))
});
 