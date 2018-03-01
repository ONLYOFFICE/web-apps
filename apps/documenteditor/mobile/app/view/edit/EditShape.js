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
 *  EditShape.js
 *  Document Editor
 *
 *  Created by Alexander Yuzhin on 10/21/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!documenteditor/mobile/app/template/EditShape.template',
    'jquery',
    'underscore',
    'backbone'
], function (editTemplate, $, _, Backbone) {
    'use strict';

    DE.Views.EditShape = Backbone.View.extend(_.extend((function() {
        // private

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

                $('#shape-style').single('click',                   _.bind(me.showStyle, me));
                $('#shape-wrap').single('click',                    _.bind(me.showWrap, me));
                $('#shape-replace').single('click',                 _.bind(me.showReplace, me));
                $('#shape-reorder').single('click',                 _.bind(me.showReorder, me));
                $('#edit-shape-bordercolor').single('click',        _.bind(me.showBorderColor, me));

                $('.edit-shape-style .categories a').single('click', _.bind(me.showStyleCategory, me));

                me.initControls();
            },

            categoryShow: function(e) {
                // if ('edit-shape' == $(e.currentTarget).prop('id')) {
                //     this.initEvents();
                // }
            },

            // Render layout
            render: function () {
                var shapes = Common.SharedSettings.get('shapes').slice();
                shapes.splice(0, 1); // Remove line shapes

                this.layout = $('<div/>').append(this.template({
                    android : Common.SharedSettings.get('android'),
                    phone   : Common.SharedSettings.get('phone'),
                    shapes  : shapes,
                    scope   : this
                }));

                return this;
            },

            rootLayout: function () {
                if (this.layout) {
                    return this.layout
                        .find('#edit-shape-root')
                        .html();
                }

                return '';
            },

            initControls: function () {
                //
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

            showStyleCategory: function (e) {
                // remove android specific style
                $('.page[data-page=edit-shape-style] .list-block.inputs-list').removeClass('inputs-list');
            },

            showStyle: function () {
                var selector = '#edit-shape-style';
                this.showPage(selector, true);

                this.paletteFillColor = new Common.UI.ThemeColorPalette({
                    el: $('#tab-shape-fill'),
                    transparent: true
                });

                this.fireEvent('page:show', [this, selector]);
            },

            showWrap: function () {
                this.showPage('#edit-shape-wrap');
            },

            showReplace: function () {
                this.showPage('#edit-shape-replace');
            },

            showReorder: function () {
                this.showPage('#edit-shape-reorder');
            },

            showBorderColor: function () {
                var selector = '#edit-shape-border-color-view';
                this.showPage(selector, true);

                this.paletteBorderColor = new Common.UI.ThemeColorPalette({
                    el: $('.page[data-page=edit-shape-border-color] .page-content')
                });

                this.fireEvent('page:show', [this, selector]);
            },

            textStyle: 'Style',
            textWrap: 'Wrap',
            textReplace: 'Replace',
            textReorder: 'Reorder',
            textRemoveShape: 'Remove Shape',
            textBack: 'Back',
            textToForeground: 'Bring to Foreground',
            textToBackground: 'Send to Background',
            textForward: 'Move Forward',
            textBackward: 'Move Backward',
            textInline: 'Inline',
            textSquare: 'Square',
            textTight: 'Tight',
            textThrough: 'Through',
            textTopAndBottom: 'Top and Bottom',
            textInFront: 'In Front',
            textBehind: 'Behind',
            textAlign: 'Align',
            textWithText: 'Move with Text',
            textOverlap: 'Allow Overlap',
            textFromText: 'Distance from Text',
            textFill: 'Fill',
            textBorder: 'Border',
            textEffects: 'Effects',
            textSize: 'Size',
            textColor: 'Color',
            textOpacity: 'Opacity'
        }
    })(), DE.Views.EditShape || {}))
});