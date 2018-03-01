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
 *  EditSlide.js
 *  Presentation Editor
 *
 *  Created by Julia Radzhabova on 12/07/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
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
        var _layouts = [],
            _arrCurrentEffectTypes = [];

        return {
            // el: '.view-main',

            template: _.template(editTemplate),

            events: {
            },

            initialize: function () {
                Common.NotificationCenter.on('editcontainer:show', _.bind(this.initEvents, this));
                Common.NotificationCenter.on('editcategory:show',  _.bind(this.categoryShow, this));

                this._arrEffectType = [
                    {displayValue: this.textSmoothly,           value: Asc.c_oAscSlideTransitionParams.Fade_Smoothly},
                    {displayValue: this.textBlack,              value: Asc.c_oAscSlideTransitionParams.Fade_Through_Black},
                    {displayValue: this.textLeft,               value: Asc.c_oAscSlideTransitionParams.Param_Left},
                    {displayValue: this.textTop,                value: Asc.c_oAscSlideTransitionParams.Param_Top},
                    {displayValue: this.textRight,              value: Asc.c_oAscSlideTransitionParams.Param_Right},
                    {displayValue: this.textBottom,             value: Asc.c_oAscSlideTransitionParams.Param_Bottom},
                    {displayValue: this.textTopLeft,            value: Asc.c_oAscSlideTransitionParams.Param_TopLeft},
                    {displayValue: this.textTopRight,           value: Asc.c_oAscSlideTransitionParams.Param_TopRight},
                    {displayValue: this.textBottomLeft,         value: Asc.c_oAscSlideTransitionParams.Param_BottomLeft},
                    {displayValue: this.textBottomRight,        value: Asc.c_oAscSlideTransitionParams.Param_BottomRight},
                    {displayValue: this.textVerticalIn,         value: Asc.c_oAscSlideTransitionParams.Split_VerticalIn},
                    {displayValue: this.textVerticalOut,        value: Asc.c_oAscSlideTransitionParams.Split_VerticalOut},
                    {displayValue: this.textHorizontalIn,       value: Asc.c_oAscSlideTransitionParams.Split_HorizontalIn},
                    {displayValue: this.textHorizontalOut,      value: Asc.c_oAscSlideTransitionParams.Split_HorizontalOut},
                    {displayValue: this.textClockwise,          value: Asc.c_oAscSlideTransitionParams.Clock_Clockwise},
                    {displayValue: this.textCounterclockwise,   value: Asc.c_oAscSlideTransitionParams.Clock_Counterclockwise},
                    {displayValue: this.textWedge,              value: Asc.c_oAscSlideTransitionParams.Clock_Wedge},
                    {displayValue: this.textZoomIn,             value: Asc.c_oAscSlideTransitionParams.Zoom_In},
                    {displayValue: this.textZoomOut,            value: Asc.c_oAscSlideTransitionParams.Zoom_Out},
                    {displayValue: this.textZoomRotate,         value: Asc.c_oAscSlideTransitionParams.Zoom_AndRotate}
                ];
                this._arrEffect = [
                    {displayValue: this.textNone,    value: Asc.c_oAscSlideTransitionTypes.None},
                    {displayValue: this.textFade,    value: Asc.c_oAscSlideTransitionTypes.Fade},
                    {displayValue: this.textPush,    value: Asc.c_oAscSlideTransitionTypes.Push},
                    {displayValue: this.textWipe,    value: Asc.c_oAscSlideTransitionTypes.Wipe},
                    {displayValue: this.textSplit,   value: Asc.c_oAscSlideTransitionTypes.Split},
                    {displayValue: this.textUnCover, value: Asc.c_oAscSlideTransitionTypes.UnCover},
                    {displayValue: this.textCover,   value: Asc.c_oAscSlideTransitionTypes.Cover},
                    {displayValue: this.textClock,   value: Asc.c_oAscSlideTransitionTypes.Clock},
                    {displayValue: this.textZoom,    value: Asc.c_oAscSlideTransitionTypes.Zoom}
                ];
            },

            initEvents: function () {
                var me = this;

                $('#slide-theme').single('click',                 _.bind(me.showTheme, me));
                $('#slide-change-layout').single('click',         _.bind(me.showLayout, me));
                $('#slide-transition').single('click',            _.bind(me.showTransition, me));
                $('#slide-style').single('click',                 _.bind(me.showStyle, me));
                $('#edit-slide-effect').single('click',           _.bind(me.showEffect, me));
                $('#edit-slide-effect-type').single('click',      _.bind(me.showEffectType, me));

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

                // remove android specific style
                $('.page[data-page=edit-slide-transition] .list-block.inputs-list').removeClass('inputs-list');
            },

            showEffect: function () {
                this.showPage('#editslide-effect');
            },

            showEffectType: function () {
                this.showPage('#editslide-effect-type');
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
                    ].join(''))({
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
                    ].join(''))({
                        themes: themes
                    });

                    $themeContainer.html(template);
                }
            },

            renderEffectTypes: function() {
                var $typeContainer = $('#page-editslide-effect-type .list-block ul');
                if ($typeContainer.length > 0 && _arrCurrentEffectTypes.length>0) {
                    var template = _.template([
                        '<% _.each(types, function(item) { %>',
                        '<li>',
                            '<label class="label-radio item-content">',
                                '<input type="radio" name="editslide-effect-type" value="<%= item.value %>">',
                                '<% if (android) { %><div class="item-media"><i class="icon icon-form-radio"></i></div><% } %>',
                                '<div class="item-inner">',
                                    '<div class="item-title"><%= item.displayValue %></div>',
                                '</div>',
                            '</label>',
                        '</li>',
                        '<% }); %>'
                    ].join(''))({
                        android : Common.SharedSettings.get('android'),
                        types: _arrCurrentEffectTypes
                    });

                    $typeContainer.html(template);
                }
            },

            fillEffectTypes: function (type) {
                _arrCurrentEffectTypes = [];
                switch (type) {
                    case Asc.c_oAscSlideTransitionTypes.Fade:
                        _arrCurrentEffectTypes.push(this._arrEffectType[0], this._arrEffectType[1]);
                        break;
                    case Asc.c_oAscSlideTransitionTypes.Push:
                        _arrCurrentEffectTypes = this._arrEffectType.slice(2, 6);
                        break;
                    case Asc.c_oAscSlideTransitionTypes.Wipe:
                        _arrCurrentEffectTypes = this._arrEffectType.slice(2, 10);
                        break;
                    case Asc.c_oAscSlideTransitionTypes.Split:
                        _arrCurrentEffectTypes = this._arrEffectType.slice(10, 14);
                        break;
                    case Asc.c_oAscSlideTransitionTypes.UnCover:
                        _arrCurrentEffectTypes = this._arrEffectType.slice(2, 10);
                        break;
                    case Asc.c_oAscSlideTransitionTypes.Cover:
                        _arrCurrentEffectTypes = this._arrEffectType.slice(2, 10);
                        break;
                    case Asc.c_oAscSlideTransitionTypes.Clock:
                        _arrCurrentEffectTypes = this._arrEffectType.slice(14, 17);
                        break;
                    case Asc.c_oAscSlideTransitionTypes.Zoom:
                        _arrCurrentEffectTypes = this._arrEffectType.slice(17);
                        break;
                }
                return (_arrCurrentEffectTypes.length>0) ? _arrCurrentEffectTypes[0].value : -1;
            },

            getEffectName: function(effect) {
                for (var i=0; i<this._arrEffect.length; i++) {
                    if (this._arrEffect[i].value == effect) return this._arrEffect[i].displayValue;
                }
                return '';
            },

            getEffectTypeName: function(type) {
                for (var i=0; i<_arrCurrentEffectTypes.length; i++) {
                    if (_arrCurrentEffectTypes[i].value == type) return _arrCurrentEffectTypes[i].displayValue;
                }
                return '';
            },

            textTheme: 'Theme',
            textStyle: 'Style',
            textLayout: 'Layout',
            textTransition: 'Transition',
            textRemoveSlide: 'Delete Slide',
            textDuplicateSlide: 'Duplicate Slide',
            textBack: 'Back',
            textFill: 'Fill',
            textEffect: 'Effect',
            textType: 'Type',
            textDuration: 'Duration',
            textColor: 'Color',
            textOpacity: 'Opacity',
            textNone: 'None',
            textFade: 'Fade',
            textPush: 'Push',
            textWipe: 'Wipe',
            textSplit: 'Split',
            textUnCover: 'UnCover',
            textCover: 'Cover',
            textClock: 'Clock',
            textZoom: 'Zoom',
            textSmoothly: 'Smoothly',
            textBlack: 'Through Black',
            textLeft: 'Left',
            textTop: 'Top',
            textRight: 'Right',
            textBottom: 'Bottom',
            textTopLeft: 'Top-Left',
            textTopRight: 'Top-Right',
            textBottomLeft: 'Bottom-Left',
            textBottomRight: 'Bottom-Right',
            textVerticalIn: 'Vertical In',
            textVerticalOut: 'Vertical Out',
            textHorizontalIn: 'Horizontal In',
            textHorizontalOut: 'Horizontal Out',
            textClockwise: 'Clockwise',
            textCounterclockwise: 'Counterclockwise',
            textWedge: 'Wedge',
            textZoomIn: 'Zoom In',
            textZoomOut: 'Zoom Out',
            textZoomRotate: 'Zoom and Rotate',
            textStartOnClick: 'Start On Click',
            textDelay: 'Delay',
            textApplyAll: 'Apply to All Slides'
        }
    })(), PE.Views.EditSlide || {}))
});