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
 *  EditCell.js
 *  Spreadsheet Editor
 *
 *  Created by Alexander Yuzhin on 12/6/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
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
        var _stack = [],
           _borderInfo = {color: '000000', width: Asc.c_oAscBorderStyles.Medium};

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
                        'page:show'     : this.onPageShow,
                        'font:click'    : this.onFontClick,
                        'style:click'   : this.onStyleClick
                    }
                });
                this._fontsArray = [];
                this._styleSize = {width: 100, height: 50};
                this._cellStyles = [];
                this._cellInfo = undefined;
                this._fontInfo = {};
                this._isEdit = false;
            },

            setApi: function (api) {
                var me = this;
                me.api = api;

                me.api.asc_setThumbnailStylesSizes(me._styleSize.width, me._styleSize.height);

                me.api.asc_registerCallback('asc_onSelectionChanged',           _.bind(me.onApiSelectionChanged, me));
                me.api.asc_registerCallback('asc_onEditorSelectionChanged',     _.bind(me.onApiEditorSelectionChanged, me));
            },

            setMode: function (mode) {
                this._isEdit = mode.isEdit;
            },

            onLaunch: function () {
                this.createView('EditCell').render();
            },

            initEvents: function () {
                if ($('#edit-cell').length < 1) {
                    return;
                }

                var me = this;

                $('#font-bold').single('click',                 _.bind(me.onBold, me));
                $('#font-italic').single('click',               _.bind(me.onItalic, me));
                $('#font-underline').single('click',            _.bind(me.onUnderline, me));

                me.getView('EditCell').renderStyles(me._cellStyles);

                me.initSettings();
            },

            onPageShow: function (view, pageId) {
                var me = this;

                me.initSettings(pageId);
            },

            initSettings: function (pageId) {
                var me = this;

                if ('#edit-text-fonts' == pageId) {
                    me.initFontsPage();
                } else if ('#edit-text-color' == pageId) {
                    me.initTextColorPage();
                } else if ('#edit-fill-color' == pageId) {
                    me.initFillColorPage();
                } else if ('#edit-cell-border-color' == pageId) {
                    me.initBorderColorPage();
                } else if ('#edit-text-format' == pageId) {
                    me.initTextFormat();
                } else if ('#edit-text-orientation' == pageId) {
                    me.initTextOrientation();
                } else if ('#edit-border-style' == pageId) {
                    me.initBorderStyle();
                } else if (!_.isUndefined(pageId) && pageId.indexOf('#edit-cell-format') > -1) {
                    me.initCellFormat();
                } else {
                    me.initCellSettings(me._cellInfo);
                }
            },

            // Public

            getFonts: function() {
                return this._fontsArray;
            },

            getStack: function() {
                return _stack;
            },

            getFontInfo: function () {
                return this._fontInfo;
            },

            getCell: function () {
                return this._cellInfo;
            },

            getStyleSize: function () {
                return this._styleSize;
            },

            initFontsPage: function () {
                var me = this,
                    displaySize = this._fontInfo.size;

                _.isUndefined(displaySize) ? displaySize = this.textAuto : displaySize = displaySize + ' ' + this.textPt;

                $('#font-size .item-after label').html(displaySize);
                $('#font-size .button').single('click', _.bind(me.onFontSize, me));
            },

            initTextColorPage: function () {
                var me = this,
                    palette = me.getView('EditCell').paletteTextColor,
                    color = me._sdkToThemeColor(this._fontInfo.color);

                if (palette) {
                    palette.select(color);
                    palette.on('select', _.bind(me.onTextColor, me));
                }
            },

            initFillColorPage: function () {
                if (_.isUndefined(this._cellInfo)) return;

                var me = this,
                    palette = me.getView('EditCell').paletteFillColor,
                    color = me._sdkToThemeColor(me._cellInfo.asc_getXfs().asc_getFillColor());

                if (palette) {
                    palette.select(color);
                    palette.on('select', _.bind(me.onFillColor, me));
                }
            },

            initBorderColorPage: function () {
                var me = this;
                me.getView('EditCell').showBorderColorPage();
                var palette = me.getView('EditCell').paletteBorderColor;
                if (palette) {
                    palette.select(_borderInfo.color);
                    palette.on('select', _.bind(function (palette, color) {
                        _borderInfo.color = color;
                        $('#edit-border-color .color-preview').css('background-color', '#' + (_.isObject(_borderInfo.color) ? _borderInfo.color.color : _borderInfo.color));
                    }, me));
                }
            },

            initTextFormat: function () {
                if (_.isUndefined(this._cellInfo)) return;

                var me = this,
                    $pageTextFormat = $('.page[data-page=edit-text-format]'),
                    xfs = me._cellInfo.asc_getXfs(),
                    hAlign = xfs.asc_getHorAlign(),
                    vAlign = xfs.asc_getVertAlign(),
                    hAlignStr = 'left',
                    vAlignStr = 'bottom',
                    isWrapText = xfs.asc_getWrapText();

                if (vAlign == Asc.c_oAscVAlign.Top)
                    vAlignStr = 'top';
                else if (vAlign == Asc.c_oAscVAlign.Center)
                    vAlignStr = 'center';

                switch (hAlign) {
                    case AscCommon.align_Center:  hAlignStr = 'center';    break;
                    case AscCommon.align_Right:   hAlignStr = 'right';     break;
                    case AscCommon.align_Justify: hAlignStr = 'justify';   break;
                }

                $('#text-format .item-media i').removeClass().addClass(Common.Utils.String.format('icon icon-text-align-{0}', hAlignStr));

                if ($pageTextFormat.length > 0) {
                    var $radioHAlign = $pageTextFormat.find('input:radio[name=text-halign]'),
                        $radioVAlign = $pageTextFormat.find('input:radio[name=text-valign]'),
                        $switchWrapText = $pageTextFormat.find('#edit-cell-wrap-text input');

                    $radioHAlign.val([hAlignStr]);
                    $radioVAlign.val([vAlignStr]);
                    $switchWrapText.prop('checked', isWrapText);

                    $radioHAlign.single('change',       _.bind(me.onHAlignChange, me));
                    $radioVAlign.single('change',       _.bind(me.onVAlignChange, me));
                    $switchWrapText.single('change',    _.bind(me.onWrapTextChange, me));
                }
            },

            initCellFormat: function () {
                var me = this,
                    $pageCellFormat = $('.page[data-page=edit-cell-format]');

                if ($pageCellFormat.length > 0) {
                    $pageCellFormat.find('.item-link.no-indicator[data-type]').single('click', _.bind(me.onCellFormat, me));
                }
            },

            initBorderStyle: function () {
                $('.page[data-page=edit-border-style] a[data-type]').single('click', _.bind(this.onBorderStyle, this));

                $('#edit-border-color .color-preview').css('background-color', '#' + (_.isObject(_borderInfo.color) ? _borderInfo.color.color : _borderInfo.color));
                $('#edit-border-size select').val(_borderInfo.width);
                $('#edit-border-size .item-after').text($('#edit-border-size select option[value=' +_borderInfo.width + ']').text());

                $('#edit-border-size select').single('change', function (e) {
                    _borderInfo.width = parseInt($(e.currentTarget).val());
                })
            },

            initFontSettings: function (fontObj) {
                if (_.isUndefined(fontObj)) {
                    return;
                }

                var me = this;

                // Init font name
                var fontName = fontObj.asc_getFontName() || this.textFonts;
                this._fontInfo.name = fontName;

                $('#font-fonts .item-title').html(fontName);


                // Init font style
                $('#font-bold').toggleClass('active', fontObj.asc_getFontBold() === true);
                $('#font-italic').toggleClass('active', fontObj.asc_getFontItalic() === true);
                $('#font-underline').toggleClass('active', fontObj.asc_getFontUnderline() === true);


                // Init font size
                this._fontInfo.size = fontObj.asc_getFontSize();
                var displaySize = this._fontInfo.size;

                _.isUndefined(displaySize) ? displaySize = this.textAuto : displaySize = displaySize + ' ' + this.textPt;

                $('#font-fonts .item-after span:first-child').html(displaySize);
                $('#font-size .item-after label').html(displaySize);


                // Init font color
                this._fontInfo.color = fontObj.asc_getFontColor();

                var color = this._fontInfo.color,
                    clr = me._sdkToThemeColor(color);

                $('#text-color .color-preview').css('background-color', '#' + (_.isObject(clr) ? clr.color : clr));
                var palette = this.getView('EditCell').paletteTextColor;
                palette && palette.select(clr);
            },

            initCellSettings: function (cellInfo) {
                if (_.isUndefined(cellInfo)) {
                    return;
                }

                var me = this,
                    selectionType = cellInfo.asc_getSelectionType(),
                    // coAuthDisable = (!this.toolbar.mode.isEditMailMerge && !this.toolbar.mode.isEditDiagram) ? (cellInfo.asc_getLocked()===true || cellInfo.asc_getLockedTable()===true) : false,
                    // editOptionsDisabled = this._disableEditOptions(selectionType, coAuthDisable),
                    xfs = cellInfo.asc_getXfs(),
                    val,
                    need_disable = false;

                me.initFontSettings(xfs);

                // Init fill color
                var color = xfs.asc_getFillColor(),
                    clr = me._sdkToThemeColor(color);

                $('#fill-color .color-preview').css('background-color', ('transparent' == clr) ? clr : ('#' + (_.isObject(clr) ? clr.color : clr)));
                var palette = this.getView('EditCell').paletteFillColor;
                palette && palette.select(clr);

                var styleName = cellInfo.asc_getStyleName();
                $('#edit-cell .cell-styles li[data-type="' + styleName + '"]').addClass('active');

                if (selectionType == Asc.c_oAscSelectionType.RangeChart || selectionType == Asc.c_oAscSelectionType.RangeChartText) {
                    return;
                }

                me.initTextOrientation();

                me.initTextFormat();
            },

            // Handlers

            onFontSize: function (e) {
                var me = this,
                    $button = $(e.currentTarget),
                    fontSize = this._fontInfo.size;

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

            onStyleClick: function (view, type) {
                this.api.asc_setCellStyle(type);
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

            onTextColor:function (palette, color) {
                this.api.asc_setCellTextColor(Common.Utils.ThemeColor.getRgbColor(color));
            },

            onFillColor:function (palette, color) {
                this.api.asc_setCellBackgroundColor(color == 'transparent' ? null : Common.Utils.ThemeColor.getRgbColor(color));
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

            onWrapTextChange: function (e) {
                var $target = $(e.currentTarget),
                    checked = $target.prop('checked');

                this.api.asc_setCellTextWrap(checked);
            },

            onCellFormat: function (e) {
            },

            onBorderStyle: function (e) {
                var me = this,
                    $target = $(e.currentTarget),
                    type = $target.data('type'),
                    newBorders = [],
                    bordersWidth = _borderInfo.width,
                    bordersColor = Common.Utils.ThemeColor.getRgbColor(_borderInfo.color);

                if (type == 'inner') {
                    newBorders[Asc.c_oAscBorderOptions.InnerV] = new Asc.asc_CBorder(bordersWidth, bordersColor);
                    newBorders[Asc.c_oAscBorderOptions.InnerH] = new Asc.asc_CBorder(bordersWidth, bordersColor);
                } else if (type == 'all') {
                    newBorders[Asc.c_oAscBorderOptions.InnerV] = new Asc.asc_CBorder(bordersWidth, bordersColor);
                    newBorders[Asc.c_oAscBorderOptions.InnerH] = new Asc.asc_CBorder(bordersWidth, bordersColor);
                    newBorders[Asc.c_oAscBorderOptions.Left]   = new Asc.asc_CBorder(bordersWidth, bordersColor);
                    newBorders[Asc.c_oAscBorderOptions.Top]    = new Asc.asc_CBorder(bordersWidth, bordersColor);
                    newBorders[Asc.c_oAscBorderOptions.Right]  = new Asc.asc_CBorder(bordersWidth, bordersColor);
                    newBorders[Asc.c_oAscBorderOptions.Bottom] = new Asc.asc_CBorder(bordersWidth, bordersColor);
                } else if (type == 'outer') {
                    newBorders[Asc.c_oAscBorderOptions.Left]   = new Asc.asc_CBorder(bordersWidth, bordersColor);
                    newBorders[Asc.c_oAscBorderOptions.Top]    = new Asc.asc_CBorder(bordersWidth, bordersColor);
                    newBorders[Asc.c_oAscBorderOptions.Right]  = new Asc.asc_CBorder(bordersWidth, bordersColor);
                    newBorders[Asc.c_oAscBorderOptions.Bottom] = new Asc.asc_CBorder(bordersWidth, bordersColor);
                } else if (type != 'none') {
                    var borderId = parseInt(type);
                    newBorders[borderId] = new Asc.asc_CBorder(bordersWidth, bordersColor);
                }

                me.api.asc_setCellBorders(newBorders);
            },

            // API handlers

            onApiEditorSelectionChanged: function(fontObj) {
            },

            onApiSelectionChanged: function(cellInfo) {
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

            initTextOrientation: function() {
                if (_.isUndefined(this._cellInfo)) return;

                var me = this,
                    $pageTextOrientation = $('.page[data-page=edit-text-orientation]'),
                    orientationStr = 'horizontal',
                    xfs = this._cellInfo.asc_getXfs();

                var textAngle = xfs.asc_getAngle();

                switch(textAngle) {
                    case 45:    orientationStr = 'anglecount'; break;
                    case -45:   orientationStr = 'angleclock'; break;
                    case 255:   orientationStr = 'vertical'; break;
                    case 90:    orientationStr = 'rotateup'; break;
                    case -90:   orientationStr = 'rotatedown'; break;
                    case 0:     orientationStr = 'horizontal'; break;
                }

                $('#text-orientation .item-media i').removeClass().addClass(Common.Utils.String.format('icon icon-text-orientation-{0}', orientationStr));

                if ($pageTextOrientation.length > 0) {
                    var $radioOrientation = $pageTextOrientation.find('input:radio[name=text-orientation]');
                    $radioOrientation.val([orientationStr]);
                    $radioOrientation.single('change', _.bind(me.onTextOrientationChange, me));
                }
            },

            onTextOrientationChange: function(e) {
                var $target = $(e.currentTarget),
                    value = $target.prop('value');
                var angle = 0;
                switch (value) {
                    case 'anglecount':  angle =  45;    break;
                    case 'angleclock':  angle = -45;    break;
                    case 'vertical':    angle =  255;   break;
                    case 'rotateup':    angle =  90;    break;
                    case 'rotatedown':  angle = -90;    break;
                }
                if (this.api)
                    this.api.asc_setCellAngle(angle);
            },

            textFonts: 'Fonts',
            textAuto: 'Auto',
            textPt: 'pt'
        }
    })(), SSE.Controllers.EditCell || {}))
});