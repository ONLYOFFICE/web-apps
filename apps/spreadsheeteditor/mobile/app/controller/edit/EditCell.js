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
 *  EditCell.js
 *  Spreadsheet Editor
 *
 *  Created by Alexander Yuzhin on 12/6/16
 *  Copyright (c) 2016 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'spreadsheeteditor/mobile/app/view/edit/EditCell',
    'jquery',
    'underscore',
    'backbone',
    'common/mobile/lib/component/ThemeColorPalette'
], function (core, view, $, _, Backbone) {
    'use strict';

    SSE.Controllers.EditCell = Backbone.Controller.extend(_.extend((function() {
        var _fontsArray = [],
            _stack = [],
            _cellObject = undefined,
            _fontInfo = {};

        function onApiLoadFonts(fonts, select) {
            _.each(fonts, function(font){
                var fontId = font.asc_getFontId();
                _fontsArray.push({
                    id          : fontId,
                    name        : font.asc_getFontName(),
//                    displayValue: font.asc_getFontName(),
                    imgidx      : font.asc_getFontThumbnail(),
                    type        : font.asc_getFontType()
                });
            });

            Common.NotificationCenter.trigger('fonts:load', _fontsArray, select);
        }

        return {
            models: [],
            collections: [],
            views: [
                'EditCell'
            ],

            initialize: function () {
                Common.NotificationCenter.on('editcontainer:show', _.bind(this.initEvents, this));

                this.addListeners({
                    'EditCell': {
                        'page:show' : this.onPageShow,
                        'font:click': this.onFontClick
                    }
                });
            },

            setApi: function (api) {
                var me = this;
                me.api = api;

                // me.api.asc_registerCallback('asc_onInitEditorFonts',    _.bind(onApiLoadFonts, me));
                // me.api.asc_registerCallback('asc_onFocusObject',        _.bind(me.onApiFocusObject, me));
                // me.api.asc_registerCallback('asc_onFontFamily',         _.bind(me.onApiChangeFont, me));
                // me.api.asc_registerCallback('asc_onFontSize',           _.bind(me.onApiFontSize, me));
                // me.api.asc_registerCallback('asc_onBold',               _.bind(me.onApiBold, me));
                // me.api.asc_registerCallback('asc_onItalic',             _.bind(me.onApiItalic, me));
                // me.api.asc_registerCallback('asc_onUnderline',          _.bind(me.onApiUnderline, me));
                // me.api.asc_registerCallback('asc_onStrikeout',          _.bind(me.onApiStrikeout, me));
                // me.api.asc_registerCallback('asc_onVerticalAlign',      _.bind(me.onApiVerticalAlign, me));
                // me.api.asc_registerCallback('asc_onListType',           _.bind(me.onApiBullets, me));
                // me.api.asc_registerCallback('asc_onPrAlign',            _.bind(me.onApiParagraphAlign, me));
                // me.api.asc_registerCallback('asc_onTextColor',          _.bind(me.onApiTextColor, me));
                // me.api.asc_registerCallback('asc_onParaSpacingLine',    _.bind(me.onApiLineSpacing, me));
                // me.api.asc_registerCallback('asc_onTextShd',            _.bind(me.onApiTextShd, me));
            },

            onLaunch: function () {
                this.createView('EditCell').render();
            },

            initEvents: function () {
                var me = this;
                // $('#font-bold').single('click',                 _.bind(me.onBold, me));
                // $('#font-italic').single('click',               _.bind(me.onItalic, me));
                // $('#font-underline').single('click',            _.bind(me.onUnderline, me));
                // $('#font-strikethrough').single('click',        _.bind(me.onStrikethrough, me));
                //
                // $('#paragraph-align .button').single('click',   _.bind(me.onParagraphAlign, me));
                // $('#font-moveleft, #font-moveright').single('click',   _.bind(me.onParagraphMove, me));

                me.initSettings();
            },

            onPageShow: function (view, pageId) {
                var me = this;
                //     paletteTextColor = me.getView('EditCell').paletteTextColor,
                //     paletteBackgroundColor = me.getView('EditCell').paletteBackgroundColor;
                //
                // $('#text-additional li').single('click',        _.buffered(me.onAdditional, 100, me));
                // $('#page-text-linespacing li').single('click',  _.buffered(me.onLineSpacing, 100, me));
                // $('#font-size .button').single('click',         _.bind(me.onFontSize, me));
                // $('#letter-spacing .button').single('click',    _.bind(me.onLetterSpacing, me));
                //
                // $('.dataview.bullets li').single('click',       _.buffered(me.onBullet, 100, me));
                // $('.dataview.numbers li').single('click',       _.buffered(me.onNumber, 100, me));
                //
                // $('#font-color-auto').single('click',           _.bind(me.onTextColorAuto, me));
                // paletteTextColor && paletteTextColor.on('select', _.bind(me.onTextColor, me));
                // paletteBackgroundColor && paletteBackgroundColor.on('select', _.bind(me.onBackgroundColor, me));

                me.initSettings(pageId);
            },

            initSettings: function (pageId) {
                var me = this;

                // me.api && me.api.UpdateInterfaceState();
                //
                // if (_cellObject) {
                //     var $inputStrikethrough = $('#text-additional input[name=text-strikethrough]');
                //     var $inputTextCaps = $('#text-additional input[name=text-caps]');
                //
                //     _cellObject.get_Strikeout() && $inputStrikethrough.val(['strikethrough']).prop('prevValue', 'strikethrough');
                //     _cellObject.get_DStrikeout() && $inputStrikethrough.val(['double-strikethrough']).prop('prevValue', 'double-strikethrough');
                //
                //     _cellObject.get_SmallCaps() && $inputTextCaps.val(['small']).prop('prevValue', 'small');
                //     _cellObject.get_AllCaps() && $inputTextCaps.val(['all']).prop('prevValue', 'all');
                //
                //     _fontInfo.letterSpacing = Common.Utils.Metric.fnRecalcFromMM(_cellObject.get_TextSpacing());
                //     $('#letter-spacing .item-after label').text(_fontInfo.letterSpacing + ' ' + Common.Utils.Metric.getCurrentMetricName());
                // }
            },

            // Public

            getFonts: function() {
                return _fontsArray;
            },

            getStack: function() {
                return _stack;
            },

            getFontInfo: function () {
                return _fontInfo;
            },

            getCell: function () {
                return _cellObject;
            },

            // Handlers

            onBold: function (e) {
                var pressed = this._toggleButton(e);

                if (this.api) {
                    this.api.put_TextPrBold(pressed);
                }
            },

            onItalic: function (e) {
                var pressed = this._toggleButton(e);

                if (this.api) {
                    this.api.put_TextPrItalic(pressed);
                }
            },

            onUnderline: function (e) {
                var pressed = this._toggleButton(e);

                if (this.api) {
                    this.api.put_TextPrUnderline(pressed);
                }
            },

            // API handlers

            onApiFocusObject: function (objects) {
                _stack = objects;

                // var paragraphs = [];
                //
                // _.each(_stack, function(object) {
                //     if (object.get_ObjectType() == Asc.c_oAscTypeSelectElement.Paragraph) {
                //         paragraphs.push(object);
                //     }
                // });
                //
                // if (paragraphs.length > 0) {
                //     var object = paragraphs[paragraphs.length - 1]; // get top
                //     _cellObject = object.get_ObjectValue();
                // } else {
                //     _cellObject = undefined;
                // }
            },

            // Helpers
            _toggleButton: function (e) {
                return $(e.currentTarget).toggleClass('active').hasClass('active');
            },

            textFonts: 'Fonts',
            textAuto: 'Auto',
            textPt: 'pt'
        }
    })(), SSE.Controllers.EditCell || {}))
});