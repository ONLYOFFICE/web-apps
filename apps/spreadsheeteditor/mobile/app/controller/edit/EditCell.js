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
            _cellInfo = undefined,
            _cellStyles = [],
            _fontInfo = {},
            _borderInfo = {color: '000000', width: 'medium'},
            _isEdit = false;

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

                me.api.asc_registerCallback('asc_onInitEditorFonts',            _.bind(onApiLoadFonts, me));
                me.api.asc_registerCallback('asc_onSelectionChanged',           _.bind(me.onApiSelectionChanged, me));
                me.api.asc_registerCallback('asc_onEditorSelectionChanged',     _.bind(me.onApiEditorSelectionChanged, me));
                me.api.asc_registerCallback('asc_onInitEditorStyles',           _.bind(me.onApiInitEditorStyles, me)); // TODO: It does not work until the error in the SDK
            },

            setMode: function (mode) {
                _isEdit = ('edit' === mode);
            },

            onLaunch: function () {
                this.createView('EditCell').render();
            },

            initEvents: function () {
                var me = this;

                $('#font-bold').single('click',                 _.bind(me.onBold, me));
                $('#font-italic').single('click',               _.bind(me.onItalic, me));
                $('#font-underline').single('click',            _.bind(me.onUnderline, me));

                me.getView('EditCell').renderStyles(_cellStyles);
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
                } else if ('#edit-border-style' == pageId) {
                    me.initBorderStyle();
                } else if (!_.isUndefined(pageId) && pageId.indexOf('#edit-cell-format') > -1) {
                    me.initCellFormat();
                } else {
                    me.initCellSettings(_cellInfo);
                }

                // me.api && me.api.UpdateInterfaceState();
                //
                // if (_cellInfo) {
                //     var $inputStrikethrough = $('#text-additional input[name=text-strikethrough]');
                //     var $inputTextCaps = $('#text-additional input[name=text-caps]');
                //
                //     _cellInfo.get_Strikeout() && $inputStrikethrough.val(['strikethrough']).prop('prevValue', 'strikethrough');
                //     _cellInfo.get_DStrikeout() && $inputStrikethrough.val(['double-strikethrough']).prop('prevValue', 'double-strikethrough');
                //
                //     _cellInfo.get_SmallCaps() && $inputTextCaps.val(['small']).prop('prevValue', 'small');
                //     _cellInfo.get_AllCaps() && $inputTextCaps.val(['all']).prop('prevValue', 'all');
                //
                //     _fontInfo.letterSpacing = Common.Utils.Metric.fnRecalcFromMM(_cellInfo.get_TextSpacing());
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
                return _cellInfo;
            },

            initFontsPage: function () {
                var me = this,
                    displaySize = _fontInfo.size;

                _.isUndefined(displaySize) ? displaySize = this.textAuto : displaySize = displaySize + ' ' + this.textPt;

                $('#font-size .item-after label').html(displaySize);
                $('#font-size .button').single('click', _.bind(me.onFontSize, me));
            },

            initTextColorPage: function () {
                var me = this,
                    palette = me.getView('EditCell').paletteTextColor,
                    color = me._sdkToThemeColor(_fontInfo.color);

                if (palette) {
                    palette.select(color);
                    palette.on('select', _.bind(me.onTextColor, me));
                }
            },

            initFillColorPage: function () {
                var me = this,
                    palette = me.getView('EditCell').paletteFillColor,
                    color = me._sdkToThemeColor(_cellInfo.asc_getFill().asc_getColor());

                if (palette) {
                    palette.select(color);
                    palette.on('select', _.bind(me.onFillColor, me));
                }
            },

            initBorderColorPage: function () {
                var me = this,
                    palette = new Common.UI.ThemeColorPalette({
                        el: $('.page[data-page=edit-border-color] .page-content')
                    });

                if (palette) {
                    palette.select(_borderInfo.color);
                    palette.on('select', _.bind(function (palette, color) {
                        _borderInfo.color = color;
                        $('#edit-border-color .color-preview').css('background-color', '#' + (_.isObject(_borderInfo.color) ? _borderInfo.color.color : _borderInfo.color));
                    }, me));
                }
            },

            initTextFormat: function () {
                var me = this,
                    $pageTextFormat = $('.page[data-page=edit-text-format]'),
                    hAlign = _cellInfo.asc_getHorAlign() || 'left',
                    vAlign = _cellInfo.asc_getVertAlign() || 'bottom',
                    isWrapText = _cellInfo.asc_getFlags().asc_getWrapText();

                $('#text-format .item-media i').removeClass().addClass(Common.Utils.String.format('icon icon-text-align-{0}', hAlign));

                if ($pageTextFormat.length > 0) {
                    var $radioHAlign = $pageTextFormat.find('input:radio[name=text-halign]'),
                        $radioVAlign = $pageTextFormat.find('input:radio[name=text-valign]'),
                        $switchWrapText = $pageTextFormat.find('#edit-cell-wrap-text input');

                    $radioHAlign.val([hAlign]);
                    $radioVAlign.val([vAlign]);
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

                $('#edit-border-color .color-preview').css('background-color', '#' + _borderInfo.color);
                $('#edit-border-size select').val(_borderInfo.width);
                $('#edit-border-size .item-after').text($('#edit-border-size select option[value=' +_borderInfo.width + ']').text());

                $('#edit-border-size select').single('change', function (e) {
                    _borderInfo.width = $(e.currentTarget).val();
                })
            },

            initFontSettings: function (fontObj) {
                if (_.isUndefined(fontObj)) {
                    return;
                }

                var me = this;

                // Init font name
                var fontName = fontObj.asc_getName() || this.textFonts;
                _fontInfo.name = fontName;

                $('#font-fonts .item-title').html(fontName);


                // Init font style
                $('#font-bold').toggleClass('active', fontObj.asc_getBold() === true);
                $('#font-italic').toggleClass('active', fontObj.asc_getItalic() === true);
                $('#font-underline').toggleClass('active', fontObj.asc_getUnderline() === true);


                // Init font size
                _fontInfo.size = fontObj.asc_getSize();
                var displaySize = _fontInfo.size;

                _.isUndefined(displaySize) ? displaySize = this.textAuto : displaySize = displaySize + ' ' + this.textPt;

                $('#font-fonts .item-after span:first-child').html(displaySize);
                $('#font-size .item-after label').html(displaySize);


                // Init font color
                _fontInfo.color = fontObj.asc_getColor();

                var color = _fontInfo.color,
                    clr = me._sdkToThemeColor(color);

                $('#text-color .color-preview').css('background-color', '#' + (_.isObject(clr) ? clr.color : clr));

            },

            initCellSettings: function (cellInfo) {
                if (_.isUndefined(cellInfo)) {
                    return;
                }

                var me = this,
                    selectionType = cellInfo.asc_getFlags().asc_getSelectionType(),
                    // coAuthDisable = (!this.toolbar.mode.isEditMailMerge && !this.toolbar.mode.isEditDiagram) ? (cellInfo.asc_getLocked()===true || cellInfo.asc_getLockedTable()===true) : false,
                    // editOptionsDisabled = this._disableEditOptions(selectionType, coAuthDisable),
                    _fontInfo = cellInfo.asc_getFont(),
                    val,
                    need_disable = false;

                me.initFontSettings(_fontInfo);

                // Init fill color
                var color = cellInfo.asc_getFill().asc_getColor(),
                    clr = me._sdkToThemeColor(color);

                $('#fill-color .color-preview').css('background-color', '#' + (_.isObject(clr) ? clr.color : clr));


                if (selectionType == Asc.c_oAscSelectionType.RangeChart || selectionType == Asc.c_oAscSelectionType.RangeChartText) {
                    return;
                }

                me.initTextFormat();

//
//                     val = (filterInfo) ? filterInfo.asc_getIsAutoFilter() : null;
//                     if (this._state.filter !== val) {
//                         toolbar.btnSetAutofilter.toggle(val===true, true);
//                         toolbar.mnuitemAutoFilter.setChecked(val===true, true);
//                         this._state.filter = val;
//                     }
//                     need_disable =  this._state.controlsdisabled.filters || (val===null);
//                     toolbar.lockToolbar(SSE.enumLock.ruleFilter, need_disable,
//                         { array: [toolbar.btnSortDown, toolbar.btnSortUp, toolbar.mnuitemSortAZ, toolbar.mnuitemSortZA,
//                             toolbar.btnTableTemplate,toolbar.btnSetAutofilter,toolbar.mnuitemAutoFilter,toolbar.btnAutofilter] });
//
//                     val = (formatTableInfo) ? formatTableInfo.asc_getTableStyleName() : null;
//                     if (this._state.tablestylename !== val && this.toolbar.mnuTableTemplatePicker) {
//                         val = this.toolbar.mnuTableTemplatePicker.store.findWhere({name: val});
//                         if (val) {
//                             this.toolbar.mnuTableTemplatePicker.selectRecord(val);
//                             this._state.tablestylename = val.get('name');
//                         } else {
//                             toolbar.mnuTableTemplatePicker.deselectAll();
//                             this._state.tablestylename = null;
//                         }
//                     }
//
//                     this._state.tablename = (formatTableInfo) ? formatTableInfo.asc_getTableName() : undefined;
//
//                     need_disable =  this._state.controlsdisabled.filters || !filterInfo || (filterInfo.asc_getIsApplyAutoFilter()!==true);
//                     toolbar.lockToolbar(SSE.enumLock.ruleDelFilter, need_disable, {array:[toolbar.btnClearAutofilter,toolbar.mnuitemClearFilter]});
//
//                     this._state.multiselect = cellInfo.asc_getFlags().asc_getMultiselect();
//                     toolbar.lockToolbar(SSE.enumLock.multiselect, this._state.multiselect, { array: [toolbar.btnTableTemplate, toolbar.btnInsertHyperlink]});
//                 }
//
//                 fontparam = toolbar.numFormatTypes[cellInfo.asc_getNumFormatType()];
//
//                 if (!fontparam)
//                     fontparam = toolbar.numFormatTypes[1];
//
//                 toolbar.btnNumberFormat.setCaption(fontparam);
//
//                 val = cellInfo.asc_getAngle();
//                 if (this._state.angle !== val) {
//                     this._clearChecked(toolbar.btnTextOrient.menu);
//                     switch(val) {
//                         case 45:    toolbar.btnTextOrient.menu.items[1].setChecked(true, true); break;
//                         case -45:   toolbar.btnTextOrient.menu.items[2].setChecked(true, true); break;
//                         case 90:    toolbar.btnTextOrient.menu.items[3].setChecked(true, true); break;
//                         case -90:   toolbar.btnTextOrient.menu.items[4].setChecked(true, true); break;
//                         default:    toolbar.btnTextOrient.menu.items[0].setChecked(true, true); break;
//                     }
//                     this._state.angle = val;
//                 }
//
//                 val = cellInfo.asc_getStyleName();
//                 if (this._state.prstyle != val && !this.toolbar.listStyles.isDisabled()) {
//                     var listStyle = this.toolbar.listStyles,
//                         listStylesVisible = (listStyle.rendered);
//
//                     if (listStylesVisible) {
//                         listStyle.suspendEvents();
//                         var styleRec = listStyle.menuPicker.store.findWhere({
//                             name: val
//                         });
//                         this._state.prstyle = (listStyle.menuPicker.store.length>0) ? val : undefined;
//
//                         listStyle.menuPicker.selectRecord(styleRec);
//                         listStyle.resumeEvents();
//                     }
//                 }
//
//                 val = (selectionType==Asc.c_oAscSelectionType.RangeRow);
//                 if ( this._state.controlsdisabled.rows!==val ) {
//                     this._state.controlsdisabled.rows=val;
//                     toolbar.btnAddCell.menu.items[3].setDisabled(val);
//                     toolbar.btnDeleteCell.menu.items[3].setDisabled(val);
//                 }
//                 val = (selectionType==Asc.c_oAscSelectionType.RangeCol);
//                 if ( this._state.controlsdisabled.cols!==val ) {
//                     this._state.controlsdisabled.cols=val;
//                     toolbar.btnAddCell.menu.items[2].setDisabled(val);
//                     toolbar.btnDeleteCell.menu.items[2].setDisabled(val);
//                 }
//
//                 val = filterInfo && filterInfo.asc_getIsApplyAutoFilter();
//                 if ( this._state.controlsdisabled.cells_right!==(this._state.controlsdisabled.rows || val) ) {
//                     this._state.controlsdisabled.cells_right = (this._state.controlsdisabled.rows || val);
//                     toolbar.btnAddCell.menu.items[0].setDisabled(this._state.controlsdisabled.cells_right);
//                     toolbar.btnDeleteCell.menu.items[0].setDisabled(this._state.controlsdisabled.cells_right);
//                 }
//                 if ( this._state.controlsdisabled.cells_down!==(this._state.controlsdisabled.cols || val) ) {
//                     this._state.controlsdisabled.cells_down = (this._state.controlsdisabled.cols || val);
//                     toolbar.btnAddCell.menu.items[1].setDisabled(this._state.controlsdisabled.cells_down);
//                     toolbar.btnDeleteCell.menu.items[1].setDisabled(this._state.controlsdisabled.cells_down);
//                 }
            },

            onApiInitEditorStyles: function(styles){
                window.styles_loaded = false;

                _cellStyles = styles.asc_getDefaultStyles().concat(styles.asc_getDocStyles());

                this.getView('EditCell').renderStyles(_cellStyles);

                window.styles_loaded = true;
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

            onTextColor:function (palette, color) {
                this.api.asc_setCellTextColor(Common.Utils.ThemeColor.getRgbColor(color));
            },

            onFillColor:function (palette, color) {
                this.api.asc_setCellBackgroundColor(color == 'transparent' ? null : Common.Utils.ThemeColor.getRgbColor(color));
            },

            onHAlignChange: function (e) {
                var $target = $(e.currentTarget),
                    type = $target.prop('value');

                this.api.asc_setCellAlign(type);
            },

            onVAlignChange: function (e) {
                var $target = $(e.currentTarget),
                    type = $target.prop('value');

                this.api.asc_setCellVertAlign(type);
            },

            onWrapTextChange: function (e) {
                var $target = $(e.currentTarget),
                    checked = $target.prop('checked');

                this.api.asc_setCellTextWrap(checked);
            },

            onCellFormat: function (e) {
                var $target = $(e.currentTarget),
                    type = decodeURIComponent(atob($target.data('type')));

                this.api.asc_setCellFormat(type);
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
                if (!_isEdit) {
                    return;
                }

                _fontInfo = fontObj;
                this.initFontSettings(fontObj);
            },

            onApiSelectionChanged: function(cellInfo) {
                if (!_isEdit) {
                    return;
                }

                _cellInfo = cellInfo;
                this.initCellSettings(cellInfo);
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
        }
    })(), SSE.Controllers.EditCell || {}))
});