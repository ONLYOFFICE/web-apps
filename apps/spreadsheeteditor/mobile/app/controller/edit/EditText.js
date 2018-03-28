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
 *  EditText.js
 *  Spreadsheet Editor
 *
 *  Created by Alexander Yuzhin on 12/21/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'spreadsheeteditor/mobile/app/view/edit/EditText',
    'jquery',
    'underscore',
    'backbone'
], function (core, view, $, _, Backbone) {
    'use strict';

    SSE.Controllers.EditText = Backbone.Controller.extend(_.extend((function() {
        // Private
        var TextType = {inUnknown: 0, inChart: 1, inShape: 2};

        var _textIn = TextType.inUnknown,
            _fontInfo = undefined,
            _cellInfo = undefined,
            _isEdit = false;

        return {
            models: [],
            collections: [],
            views: [
                'EditText'
            ],

            initialize: function () {
                Common.NotificationCenter.on('editcontainer:show', _.bind(this.initEvents, this));

                this.addListeners({
                    'EditText': {
                        'page:show'     : this.onPageShow,
                        'font:click'    : this.onFontClick
                    }
                });
            },

            setApi: function (api) {
                var me = this;
                me.api = api;

                me.api.asc_registerCallback('asc_onSelectionChanged',       _.bind(me.onApiSelectionChanged, me));
                me.api.asc_registerCallback('asc_onEditorSelectionChanged', _.bind(me.onApiEditorSelectionChanged, me));
            },

            setMode: function (mode) {
                _isEdit = mode.isEdit;
            },

            onPageShow: function (view, pageId) {
                var me = this;

                me.initSettings(pageId);
            },

            onLaunch: function () {
                this.createView('EditText').render();
            },

            initEvents: function () {
                var me = this;

                me.initSettings();
            },

            initSettings: function (pageId) {
                if ($('#edit-text').length < 1) {
                    return;
                }

                var me = this;

                if ('#edit-text-fonts' == pageId) {
                    me.initFontsPage();
                } else if ('#edit-text-color' == pageId) {
                    me.initTextColorPage();
                } else {
                    me.initRootPage();
                }
            },

            initRootPage: function () {
                if (_.isUndefined(_fontInfo)) {
                    return;
                }

                var me = this;


                // Init font name
                var fontName = _fontInfo.asc_getName() || this.textFonts;
                $('#font-fonts .item-title').html(fontName);


                // Init font size
                var displaySize = _fontInfo.asc_getSize();
                _.isUndefined(displaySize) ? displaySize = this.textAuto : displaySize = displaySize + ' ' + this.textPt;

                $('#font-fonts .item-after span:first-child').html(displaySize);
                $('#font-size .item-after label').html(displaySize);


                // Init font style
                $('#font-bold').toggleClass('active', _fontInfo.asc_getBold() === true);
                $('#font-italic').toggleClass('active', _fontInfo.asc_getItalic() === true);
                $('#font-underline').toggleClass('active', _fontInfo.asc_getUnderline() === true);


                // Init font color
                var color = _fontInfo.asc_getColor(),
                    clr = me._sdkToThemeColor(color);

                $('#font-color .color-preview').css('background-color', '#' + (_.isObject(clr) ? clr.color : clr));

                // Align
                $('#edit-text-align-block').css('display', (_textIn == TextType.inShape) ? 'block' : 'none');

                var hAlign = _cellInfo.asc_getHorAlign(),
                    vAlign = _cellInfo.asc_getVertAlign();

                $('#font-left').toggleClass('active', hAlign===AscCommon.align_Left);
                $('#font-center').toggleClass('active', hAlign===AscCommon.align_Center);
                $('#font-right').toggleClass('active', hAlign===AscCommon.align_Right);
                $('#font-just').toggleClass('active', hAlign===AscCommon.align_Justify);
                $('#font-top').toggleClass('active', vAlign===Asc.c_oAscVAlign.Top);
                $('#font-middle').toggleClass('active', vAlign===Asc.c_oAscVAlign.Center);
                $('#font-bottom').toggleClass('active', vAlign===Asc.c_oAscVAlign.Bottom);

                // Handlers
                $('#font-bold').single('click',                 _.bind(me.onBold, me));
                $('#font-italic').single('click',               _.bind(me.onItalic, me));
                $('#font-underline').single('click',            _.bind(me.onUnderline, me));
                $('#font-left').single('click',                 _.bind(me.onHAlign, me, AscCommon.align_Left));
                $('#font-center').single('click',               _.bind(me.onHAlign, me, AscCommon.align_Center));
                $('#font-right').single('click',                _.bind(me.onHAlign, me, AscCommon.align_Right));
                $('#font-just').single('click',                 _.bind(me.onHAlign, me, AscCommon.align_Justify));
                $('#font-top').single('click',                  _.bind(me.onVAlign, me, Asc.c_oAscVAlign.Top));
                $('#font-middle').single('click',               _.bind(me.onVAlign, me, Asc.c_oAscVAlign.Center));
                $('#font-bottom').single('click',               _.bind(me.onVAlign, me, Asc.c_oAscVAlign.Bottom));
            },

            initFontsPage: function () {
                var me = this,
                    displaySize = _fontInfo.size;

                _.isUndefined(displaySize) ? displaySize = this.textAuto : displaySize = displaySize + ' ' + this.textPt;

                $('#font-size .item-after label').html(displaySize);
                $('#font-size .button').single('click', _.bind(me.onFontSize, me));

                _.defer(function () {
                    me.getView('EditText').renderFonts();
                }, me);
            },

            initTextColorPage: function () {
                var me = this,
                    color = me._sdkToThemeColor(_fontInfo.color),
                    palette = new Common.UI.ThemeColorPalette({
                        el: $('.page[data-page=edit-text-color] .page-content')
                    });

                if (palette) {
                    palette.select(color);
                    palette.on('select', _.bind(me.onTextColor, me));
                }
            },

            // Handlers

            onFontSize: function (e) {
                var me = this,
                    $button = $(e.currentTarget),
                    fontSize = _fontInfo.size;

                if ($button.hasClass('decrement')) {
                    _.isUndefined(fontSize) ? me.api.asc_decreaseFontSize() : fontSize = Math.max(1, --fontSize);
                } else {
                    _.isUndefined(fontSize) ? me.api.asc_increaseFontSize() : fontSize = Math.min(100, ++fontSize);
                }

                if (! _.isUndefined(fontSize)) {
                    me.api.asc_setCellFontSize(fontSize);
                }
            },

            onFontClick: function (view, e) {
                var $item = $(e.currentTarget).find('input');

                if ($item) {
                    this.api.asc_setCellFontName($item.prop('value'));
                }
            },

            onBold: function (e) {
                var pressed = this._toggleButton(e);

                if (this.api) {
                    this.api.asc_setCellBold(pressed);
                }
            },

            onItalic: function (e) {
                var pressed = this._toggleButton(e);

                if (this.api) {
                    this.api.asc_setCellItalic(pressed);
                }
            },

            onUnderline: function (e) {
                var pressed = this._toggleButton(e);

                if (this.api) {
                    this.api.asc_setCellUnderline(pressed);
                }
            },

            onHAlign: function(type, e) {
                var $target = $(e.currentTarget);

                $target.parent('.row').find('a.button').removeClass('active');
                $target.addClass('active');

                this.api.asc_setCellAlign(type);
            },

            onVAlign: function(type, e) {
                var $target = $(e.currentTarget);

                $target.parent('.row').find('a.button').removeClass('active');
                $target.addClass('active');

                this.api.asc_setCellVertAlign(type);
            },


            onTextColor:function (palette, color) {
                this.api.asc_setCellTextColor(Common.Utils.ThemeColor.getRgbColor(color));
                $('#font-color .color-preview').css('background-color', '#' + (_.isObject(color) ? color.color : color));
            },

            onHAlignChange: function (e) {
                var $target = $(e.currentTarget),
                    value = $target.prop('value'),
                    type = AscCommon.align_Left;

                if (value == 'center')
                    type = AscCommon.align_Center;
                else if (value == 'right')
                    type = AscCommon.align_Right;
                else if (value == 'justify')
                    type = AscCommon.align_Justify;

                this.api.asc_setCellAlign(type);
            },

            onVAlignChange: function (e) {
                var $target = $(e.currentTarget),
                    value = $target.prop('value'),
                    type = Asc.c_oAscVAlign.Bottom;

                if (value == 'top') {
                    type = Asc.c_oAscVAlign.Top;
                } else if (value == 'center') {
                    type = Asc.c_oAscVAlign.Center;
                }

                this.api.asc_setCellVertAlign(type);
            },

            // Public

            getFontInfo: function () {
                return _fontInfo;
            },

            // API handlers

            onApiSelectionChanged: function(info) {
                if (!_isEdit) {
                    return;
                }

                _cellInfo = info;
                _fontInfo = info.asc_getFont();

                var selectType = info.asc_getFlags().asc_getSelectionType();

                switch (selectType) {
                    case Asc.c_oAscSelectionType.RangeChartText: _textIn = TextType.inChart; break;
                    case Asc.c_oAscSelectionType.RangeShapeText: _textIn = TextType.inShape; break;
                    default:                                     _textIn = TextType.inUnknown;
                }
            },

            onApiEditorSelectionChanged: function(fontObj) {
                if (!_isEdit) {
                    return;
                }

                _fontInfo = fontObj;
            },

            // Helpers

            _toggleButton: function (e) {
                return $(e.currentTarget).toggleClass('active').hasClass('active');
            },

            _sdkToThemeColor: function (color) {
                var clr = 'transparent';

                if (color) {
                    if (color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                        clr = {
                            color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()),
                            effectValue: color.get_value()
                        }
                    } else {
                        clr = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
                    }
                }

                return clr;
            },

            textFonts: 'Fonts',
            textAuto: 'Auto',
            textPt: 'pt'
        };
    })(), SSE.Controllers.EditText || {}))
});