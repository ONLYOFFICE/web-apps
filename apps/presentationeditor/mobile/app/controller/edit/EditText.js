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
 *  Presentation Editor
 *
 *  Created by Alexander Yuzhin on 10/4/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'presentationeditor/mobile/app/view/edit/EditText',
    'jquery',
    'underscore',
    'backbone',
    'common/mobile/lib/component/ThemeColorPalette'
], function (core, view, $, _, Backbone) {
    'use strict';

    PE.Controllers.EditText = Backbone.Controller.extend(_.extend((function() {
        var _fontsArray = [],
            _stack = [],
            _paragraphObject = undefined,
            _fontInfo = {},
            _paragraphInfo = {},
            metricText = Common.Utils.Metric.getCurrentMetricName();

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
                'EditText'
            ],

            initialize: function () {
                Common.NotificationCenter.on('editcontainer:show', _.bind(this.initEvents, this));
                Common.NotificationCenter.on('editcategory:show',  _.bind(this.categoryShow, this));

                this.addListeners({
                    'EditText': {
                        'page:show' : this.onPageShow,
                        'font:click': this.onFontClick
                    }
                });
            },

            setApi: function (api) {
                var me = this;
                me.api = api;

                me.api.asc_registerCallback('asc_onInitEditorFonts',    _.bind(onApiLoadFonts, me));
                me.api.asc_registerCallback('asc_onFocusObject',        _.bind(me.onApiFocusObject, me));
                me.api.asc_registerCallback('asc_onFontFamily',         _.bind(me.onApiChangeFont, me));
                me.api.asc_registerCallback('asc_onFontSize',           _.bind(me.onApiFontSize, me));
                me.api.asc_registerCallback('asc_onBold',               _.bind(me.onApiBold, me));
                me.api.asc_registerCallback('asc_onItalic',             _.bind(me.onApiItalic, me));
                me.api.asc_registerCallback('asc_onUnderline',          _.bind(me.onApiUnderline, me));
                me.api.asc_registerCallback('asc_onStrikeout',          _.bind(me.onApiStrikeout, me));
                me.api.asc_registerCallback('asc_onVerticalAlign',      _.bind(me.onApiVerticalAlign, me));
                me.api.asc_registerCallback('asc_onTextColor',          _.bind(me.onApiTextColor, me));

                me.api.asc_registerCallback('asc_onListType',           _.bind(me.onApiBullets, me));
                me.api.asc_registerCallback('asc_onPrAlign',            _.bind(me.onApiParagraphAlign, me));
                me.api.asc_registerCallback('asc_canIncreaseIndent',      _.bind(me.onApiCanIncreaseIndent, me));
                me.api.asc_registerCallback('asc_canDecreaseIndent',      _.bind(me.onApiCanDecreaseIndent, me));
                me.api.asc_registerCallback('asc_onLineSpacing',          _.bind(me.onApiLineSpacing, me));
                me.api.asc_registerCallback('asc_onVerticalTextAlign',    _.bind(me.onApiVerticalTextAlign, me));

                // me.api.asc_registerCallback('asc_onUpdateThemeIndex',     _.bind(this.onApiUpdateThemeIndex, this));
                // me.api.asc_registerCallback('asc_onCanGroup',             _.bind(this.onApiCanGroup, this));
                // me.api.asc_registerCallback('asc_onCanUnGroup',           _.bind(this.onApiCanUnGroup, this));
                // me.api.asc_registerCallback('asc_onPresentationSize',     _.bind(this.onApiPageSize, this));
                // me.api.asc_registerCallback('asc_onInitEditorStyles',     _.bind(this.onApiInitEditorStyles, this));
            },

            onLaunch: function () {
                this.createView('EditText').render();
            },

            initEvents: function () {
                var me = this;
                $('#font-bold').single('click',                 _.bind(me.onBold, me));
                $('#font-italic').single('click',               _.bind(me.onItalic, me));
                $('#font-underline').single('click',            _.bind(me.onUnderline, me));
                $('#font-strikethrough').single('click',        _.bind(me.onStrikethrough, me));

                $('#paragraph-align .button').single('click',   _.bind(me.onParagraphAlign, me));
                $('#paragraph-valign .button').single('click',   _.bind(me.onParagraphVAlign, me));
                $('#font-moveleft, #font-moveright').single('click',   _.bind(me.onParagraphMove, me));

                $('#paragraph-distance-before .button').single('click',         _.bind(me.onDistanceBefore, me));
                $('#paragraph-distance-after .button').single('click',          _.bind(me.onDistanceAfter, me));

                // me.initSettings();
            },

            categoryShow: function (e) {
                var $target = $(e.currentTarget);

                if ($target && $target.prop('id') === 'edit-text') {
                    this.initSettings();
                }
            },

            onPageShow: function (view, pageId) {
                var me = this,
                    paletteTextColor = me.getView('EditText').paletteTextColor;

                $('#text-additional li').single('click',        _.buffered(me.onAdditional, 100, me));
                $('#page-text-linespacing li').single('click',  _.buffered(me.onLineSpacing, 100, me));
                $('#font-size .button').single('click',         _.bind(me.onFontSize, me));
                $('#letter-spacing .button').single('click',    _.bind(me.onLetterSpacing, me));

                $('.dataview.bullets li').single('click',       _.buffered(me.onBullet, 100, me));
                $('.dataview.numbers li').single('click',       _.buffered(me.onNumber, 100, me));

                paletteTextColor && paletteTextColor.on('select', _.bind(me.onTextColor, me));

                me.initSettings(pageId);
            },

            initSettings: function (pageId) {
                var me = this;

                me.api && me.api.UpdateInterfaceState(); // TODO: refactor me

                if (_paragraphObject) {
                    if (pageId == '#edit-text-additional') {
                        var $inputStrikethrough = $('#text-additional input[name=text-strikethrough]');
                        var $inputTextCaps = $('#text-additional input[name=text-caps]');

                        _paragraphObject.get_Strikeout() && $inputStrikethrough.val(['strikethrough']).prop('prevValue', 'strikethrough');
                        _paragraphObject.get_DStrikeout() && $inputStrikethrough.val(['double-strikethrough']).prop('prevValue', 'double-strikethrough');

                        _paragraphObject.get_SmallCaps() && $inputTextCaps.val(['small']).prop('prevValue', 'small');
                        _paragraphObject.get_AllCaps() && $inputTextCaps.val(['all']).prop('prevValue', 'all');

                        _fontInfo.letterSpacing = Common.Utils.Metric.fnRecalcFromMM(_paragraphObject.get_TextSpacing());
                        $('#letter-spacing .item-after label').text(_fontInfo.letterSpacing + ' ' + Common.Utils.Metric.getCurrentMetricName());
                    }

                    _paragraphInfo.spaceBefore = _paragraphObject.get_Spacing().get_Before() < 0 ? _paragraphObject.get_Spacing().get_Before() : Common.Utils.Metric.fnRecalcFromMM(_paragraphObject.get_Spacing().get_Before());
                    _paragraphInfo.spaceAfter  = _paragraphObject.get_Spacing().get_After() < 0 ? _paragraphObject.get_Spacing().get_After() : Common.Utils.Metric.fnRecalcFromMM(_paragraphObject.get_Spacing().get_After());
                    $('#paragraph-distance-before .item-after label').text(_paragraphInfo.spaceBefore < 0 ? 'Auto' : _paragraphInfo.spaceBefore + ' ' + metricText);
                    $('#paragraph-distance-after .item-after label').text(_paragraphInfo.spaceAfter < 0 ? 'Auto' : _paragraphInfo.spaceAfter + ' ' + metricText);
                }
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

            getParagraph: function () {
                return _paragraphObject;
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

            onStrikethrough: function (e) {
                var pressed = this._toggleButton(e);

                if (this.api) {
                    this.api.put_TextPrStrikeout(pressed);
                }
            },

            onAdditionalStrikethrough : function ($target) {
                var value   = $target.prop('value'),
                    checked = $target.prop('checked'),
                    paragraphProps = new Asc.asc_CParagraphProperty();

                if ('strikethrough' == value) {
                    paragraphProps.put_DStrikeout(false);
                    paragraphProps.put_Strikeout(checked);
                } else {
                    paragraphProps.put_DStrikeout(checked);
                    paragraphProps.put_Strikeout(false);
                }
                this.api.paraApply(paragraphProps);
            },

            onAdditionalScript : function ($target) {
                var value   = $target.prop('value'),
                    checked = $target.prop('checked');

                if ('superscript' == value) {
                    this.api.put_TextPrBaseline(checked ? 1 : 0);
                } else {
                    this.api.put_TextPrBaseline(checked ? 2 : 0);
                }
            },

            onAdditionalCaps : function ($target) {
                var value   = $target.prop('value'),
                    checked = $target.prop('checked'),
                    paragraphProps = new Asc.asc_CParagraphProperty();

                if ('small' == value) {
                    paragraphProps.put_AllCaps(false);
                    paragraphProps.put_SmallCaps(checked);
                } else {
                    paragraphProps.put_AllCaps(checked);
                    paragraphProps.put_SmallCaps(false);
                }

                this.api.paraApply(paragraphProps);
            },

            onAdditional: function(e) {
                var me = this,
                    $target = $(e.currentTarget).find('input'),
                    prevValue = $target.prop('prevValue');

                if (prevValue == $target.prop('value')) {
                    $target.prop('checked', false);
                    prevValue = null;
                } else {
                    $target.prop('checked', true);
                    prevValue = $target.prop('value');
                }

                $('#page-text-additional input[name="'+ $target.prop('name') +'"]').prop('prevValue', prevValue);

                var radioName = $target.prop('name');
                if ('text-strikethrough' == radioName) {
                    me.onAdditionalStrikethrough($target);
                } else if ('text-script' == radioName) {
                    me.onAdditionalScript($target);
                } else if ('text-caps' == radioName){
                    me.onAdditionalCaps($target);
                }
            },

            onFontClick: function (view, e) {
                var $item = $(e.currentTarget).find('input');

                if ($item) {
                    this.api.put_TextPrFontName($item.prop('value'));
                }
            },

            onFontSize: function (e) {
                var $button = $(e.currentTarget),
                    fontSize = _fontInfo.size;

                if ($button.hasClass('decrement')) {
                    _.isUndefined(fontSize) ? this.api.FontSizeOut() : fontSize = Math.max(1, --fontSize);
                } else {
                    _.isUndefined(fontSize) ? this.api.FontSizeIn() : fontSize = Math.min(100, ++fontSize);
                }

                if (! _.isUndefined(fontSize)) {
                    this.api.put_TextPrFontSize(fontSize);
                }
            },

            onLetterSpacing: function (e) {
                var $button = $(e.currentTarget),
                    spacing = _fontInfo.letterSpacing;

                if ($button.hasClass('decrement')) {
                    spacing = Math.max(-100, --spacing);
                } else {
                    spacing = Math.min(100, ++spacing);
                }
                _fontInfo.letterSpacing = spacing;

                $('#letter-spacing .item-after label').text(spacing + ' ' + Common.Utils.Metric.getCurrentMetricName());

                var properties = new Asc.asc_CParagraphProperty();
                properties.put_TextSpacing(Common.Utils.Metric.fnRecalcToMM(spacing));

                this.api.paraApply(properties);
            },

            onTextColor: function (palette, color) {
                // $('.btn-color-value-line', this.toolbar.btnFontColor.cmpEl).css('background-color', '#' + clr);

                if (this.api) {
                    this.api.put_TextColor(Common.Utils.ThemeColor.getRgbColor(color));
                }
            },

            onParagraphAlign: function (e) {
                var $target = $(e.currentTarget);

                if ($target) {
                    var id = $target.attr('id'),
                        type = 1;

                    if ('font-just' == id) {
                        type = 3;
                    } else if ('font-right' == id) {
                        type = 0;
                    } else if ('font-center' == id) {
                        type = 2;
                    }

                    $('#paragraph-align .button').removeClass('active');
                    $target.addClass('active');

                    this.api.put_PrAlign(type);
                }
            },

            onParagraphVAlign: function (e) {
                var $target = $(e.currentTarget);

                if ($target) {
                    var id = $target.attr('id'),
                        type = Asc.c_oAscVAlign.Bottom;

                    if ('font-top' == id) {
                        type = Asc.c_oAscVAlign.Top;
                    } else if ('font-middle' == id) {
                        type = Asc.c_oAscVAlign.Center;
                    }

                    $('#paragraph-align .button').removeClass('active');
                    $target.addClass('active');

                    this.api.setVerticalAlign(type);
                }
            },

            onParagraphMove: function (e) {
                var $target = $(e.currentTarget);

                if ($target && this.api) {
                    var id = $target.attr('id');

                    if ('font-moveleft' == id) {
                        this.api.DecreaseIndent();
                    } else {
                        this.api.IncreaseIndent();
                    }
                }
            },

            onLineSpacing: function (e) {
                var $target = $(e.currentTarget).find('input');

                if ($target && this.api) {
                    var value = parseFloat($target.prop('value')),
                        LINERULE_AUTO = 1;

                    this.api.put_PrLineSpacing(LINERULE_AUTO, value);
                }
            },

            onBullet: function (e) {
                var $bullet = $(e.currentTarget),
                    type = $bullet.data('type');

                $('.dataview.bullets li').removeClass('active');
                $bullet.addClass('active');

                this.api.put_ListType(0, parseInt(type));
            },

            onNumber: function (e) {
                var $number = $(e.currentTarget),
                    type = $number.data('type');

                $('.dataview.numbers li').removeClass('active');
                $number.addClass('active');

                this.api.put_ListType(1, parseInt(type));
            },

            onDistanceBefore: function (e) {
                var $button = $(e.currentTarget),
                    distance = _paragraphInfo.spaceBefore;

                if ($button.hasClass('decrement')) {
                    distance = Math.max(-1, --distance);
                } else {
                    distance = Math.min(100, ++distance);
                }

                _paragraphInfo.spaceBefore = distance;

                $('#paragraph-distance-before .item-after label').text(_paragraphInfo.spaceBefore < 0 ? 'Auto' : (_paragraphInfo.spaceBefore) + ' ' + metricText);

                this.api.put_LineSpacingBeforeAfter(0, (_paragraphInfo.spaceBefore < 0) ? -1 : Common.Utils.Metric.fnRecalcToMM(_paragraphInfo.spaceBefore));
            },

            onDistanceAfter: function (e) {
                var $button = $(e.currentTarget),
                    distance = _paragraphInfo.spaceAfter;

                if ($button.hasClass('decrement')) {
                    distance = Math.max(-1, --distance);
                } else {
                    distance = Math.min(100, ++distance);
                }

                _paragraphInfo.spaceAfter = distance;

                $('#paragraph-distance-after .item-after label').text(_paragraphInfo.spaceAfter < 0 ? 'Auto' : (_paragraphInfo.spaceAfter) + ' ' + metricText);

                this.api.put_LineSpacingBeforeAfter(1, (_paragraphInfo.spaceAfter < 0) ? -1 : Common.Utils.Metric.fnRecalcToMM(_paragraphInfo.spaceAfter));
            },

            // API handlers

            onApiFocusObject: function (objects) {
                _stack = objects;

                var paragraphs = [];

                _.each(_stack, function(object) {
                    if (object.get_ObjectType() == Asc.c_oAscTypeSelectElement.Paragraph) {
                        paragraphs.push(object);
                    }
                });

                if (paragraphs.length > 0) {
                    var object = paragraphs[paragraphs.length - 1]; // get top
                    _paragraphObject = object.get_ObjectValue();
                } else {
                    _paragraphObject = undefined;
                }
                $('#edit-text div.edit-paragraph')[(paragraphs.length > 0) ? 'show' : 'hide']();
            },

            onApiChangeFont: function(font) {
                var name = (_.isFunction(font.get_Name) ?  font.get_Name() : font.asc_getName()) || this.textFonts;
                _fontInfo.name = name;

                $('#font-fonts .item-title').html(name);
            },

            onApiFontSize: function(size) {
                _fontInfo.size = size;
                var displaySize = _fontInfo.size;

                _.isUndefined(displaySize) ? displaySize = this.textAuto : displaySize = displaySize + ' ' + this.textPt;

                $('#font-fonts .item-after span:first-child').html(displaySize);
                $('#font-size .item-after label').html(displaySize);
            },

            onApiBold: function(on) {
                $('#font-bold').toggleClass('active', on);
            },

            onApiItalic: function(on) {
                $('#font-italic').toggleClass('active', on);
            },

            onApiUnderline: function(on) {
                $('#font-underline').toggleClass('active', on);
            },

            onApiStrikeout: function(on) {
                $('#font-strikethrough').toggleClass('active', on);
            },

            onApiVerticalAlign: function(typeBaseline) {
                var value;

                typeBaseline==1 && (value = 'superscript');
                typeBaseline==2 && (value = 'subscript');

                if (!_.isUndefined(value)) {
                    $('#text-additional input[name=text-script]').val([value]).prop('prevValue', value);
                }
            },

            onApiTextColor: function (color) {
                var me = this;

                if (color.get_auto()) {
                    // on auto
                } else {
                    var palette = me.getView('EditText').paletteTextColor,
                        clr;

                    if (color) {
                        if (color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                            clr = {
                                color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()),
                                effectValue: color.get_value()
                            }
                        } else {
                            clr = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
                        }

                        $('#font-color .color-preview').css('background-color', '#' + (_.isObject(clr) ? clr.color : clr));
                    }

                    if (palette) {
                        palette.select(clr);
                    }
                }
            },

            onApiBullets: function(data) {
                var type    = data.get_ListType(),
                    subtype = data.get_ListSubType();

                switch (type) {
                    case 0:
                        $('.dataview.bullets li[data-type=' + subtype + ']').addClass('active');
                        break;
                    case 1:
                        $('.dataview.numbers li[data-type=' + subtype + ']').addClass('active');
                        break;
                }
            },

            onApiParagraphAlign: function(align) {
                $('#font-right').toggleClass('active', align===0);
                $('#font-left').toggleClass('active', align===1);
                $('#font-center').toggleClass('active', align===2);
                $('#font-just').toggleClass('active', align===3);
            },

            onApiVerticalTextAlign: function(align) {
                $('#font-top').toggleClass('active', align===Asc.c_oAscVAlign.Top);
                $('#font-middle').toggleClass('active', align===Asc.c_oAscVAlign.Center);
                $('#font-bottom').toggleClass('active', align===Asc.c_oAscVAlign.Bottom);
            },

            onApiLineSpacing: function(vc) {
                var line = (vc.get_Line() === null || vc.get_LineRule() === null || vc.get_LineRule() != 1) ? -1 : vc.get_Line();

                $('#page-text-linespacing input').val([line]);
            },

            onApiCanIncreaseIndent: function(value) {
                $('#font-moveright').toggleClass('disabled', !value);
            },

            onApiCanDecreaseIndent: function(value) {
                $('#font-moveleft').toggleClass('disabled', !value);
            },

            // Helpers
            _toggleButton: function (e) {
                return $(e.currentTarget).toggleClass('active').hasClass('active');
            },

            textFonts: 'Fonts',
            textAuto: 'Auto',
            textPt: 'pt'
        }
    })(), PE.Controllers.EditText || {}))
});