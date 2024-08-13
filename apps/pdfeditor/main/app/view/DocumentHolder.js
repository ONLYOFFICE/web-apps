/*
 * (c) Copyright Ascensio System SIA 2010-2024
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
 * You can contact Ascensio System SIA at 20A-6 Ernesta Birznieka-Upish
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
 *  DocumentHolder.js
 *
 *  DocumentHolder view
 *
 *  Created on 1/11/14
 *
 */

define([
    'jquery',
    'underscore',
    'backbone',
    'gateway',
    'common/main/lib/util/utils',
    'common/main/lib/component/Menu',
    'common/main/lib/component/Calendar'
], function ($, _, Backbone, gateway) { 'use strict';

    PDFE.Views.DocumentHolder =  Backbone.View.extend(_.extend({
        el: '#editor_sdk',

        // Compile our stats template
        template: null,

        // Delegated events for creating new items, and clearing completed ones.
        events: {
        },

        initialize: function () {
            this._isDisabled = false;
            this._preventCustomClick = null;
            this._hasCustomItems = false;
            this._pagesCount = 0;
            this._currentTranslateObj = this;
        },

        render: function () {
            this.fireEvent('render:before', this);

            this.cmpEl = $(this.el);

            this.fireEvent('render:after', this);
            return this;
        },

        setApi: function(o) {
            this.api = o;
            return this;
        },

        setMode: function(m) {
            this.mode = m;
            return this;
        },

        createDelayedElementsPDFViewer: function() {},

        createDelayedElementsPDFEditor: function() {},

        createDelayedElementsPDFForms: function() {},

        createEquationMenu: function(toggleGroup, menuAlign) {
            return new Common.UI.Menu({
                cls: 'ppm-toolbar shifted-right',
                menuAlign: menuAlign,
                items   : [
                    new Common.UI.MenuItem({
                        caption     : this.currProfText,
                        iconCls     : 'menu__icon btn-professional-equation',
                        type        : 'view',
                        value       : {all: false, linear: false}
                    }),
                    new Common.UI.MenuItem({
                        caption     : this.currLinearText,
                        iconCls     : 'menu__icon btn-linear-equation',
                        type        : 'view',
                        value       : {all: false, linear: true}
                    }),
                    new Common.UI.MenuItem({
                        caption     : this.allProfText,
                        iconCls     : 'menu__icon btn-professional-equation',
                        type        : 'view',
                        value       : {all: true, linear: false}
                    }),
                    new Common.UI.MenuItem({
                        caption     : this.allLinearText,
                        iconCls     : 'menu__icon btn-linear-equation',
                        type        : 'view',
                        value       : {all: true, linear: true}
                    }),
                    { caption     : '--' },
                    new Common.UI.MenuItem({
                        caption     : this.unicodeText,
                        checkable   : true,
                        checked     : false,
                        toggleGroup : toggleGroup,
                        type        : 'input',
                        value       : Asc.c_oAscMathInputType.Unicode
                    }),
                    new Common.UI.MenuItem({
                        caption     : this.latexText,
                        checkable   : true,
                        checked     : false,
                        toggleGroup : toggleGroup,
                        type        : 'input',
                        value       : Asc.c_oAscMathInputType.LaTeX
                    }),
                    { caption     : '--' },
                    new Common.UI.MenuItem({
                        caption     : this.hideEqToolbar,
                        isToolbarHide: false,
                        type        : 'hide',
                    })
                ]
            });
        },

        createTextBar: function(textBarBtns) {
            var container = $('<div id="text-bar-container" style="position: absolute;">' +
                                '<div id="text-bar-fonts" style="display:inline-block;" class="margin-right-2"></div>' +
                                '<div id="text-bar-font-size" style="display:inline-block;" class="margin-right-4"></div>' +
                                '<div id="text-bar-bold" style="display:inline-block;" class="margin-right-4"></div>' +
                                '<div id="text-bar-italic" style="display:inline-block;" class="margin-right-4"></div>' +
                                '<div id="text-bar-underline" style="display:inline-block;" class="margin-right-4"></div>' +
                                '<div id="text-bar-strikeout" style="display:inline-block;" class="margin-right-4"></div>' +
                                '<div id="text-bar-super" style="display:inline-block;" class="margin-right-4"></div>' +
                                '<div id="text-bar-sub" style="display:inline-block;" class="margin-right-4"></div>' +
                                '<div id="text-bar-textcolor" style="display:inline-block;"></div>' +
                            '</div>'),
                toolbarController = PDFE.getController('Toolbar'),
                toolbar = toolbarController.getView('Toolbar');

            this.cmbFontName = new Common.UI.ComboBoxFonts({
                el: $('#text-bar-fonts', container),
                cls         : 'input-group-nr',
                style       : 'width: 100px;',
                menuCls     : 'scrollable-menu menu-absolute',
                menuStyle   : 'min-width: 100%;max-height: 270px;',
                restoreMenuHeightAndTop: 220,
                store       : new Common.Collections.Fonts(),
                hint        : toolbar.tipFontName
            });
            textBarBtns.push(this.cmbFontName);
            toolbarController.fillFontsStore(this.cmbFontName);

            this.cmbFontSize = new Common.UI.ComboBox({
                el: $('#text-bar-font-size', container),
                cls: 'input-group-nr',
                style: 'width: 45px;',
                menuCls     : 'scrollable-menu menu-absolute',
                menuStyle: 'min-width: 45px;max-height: 270px;',
                restoreMenuHeightAndTop: 220,
                hint: toolbar.tipFontSize,
                data: [
                    {value: 8, displayValue: "8"},
                    {value: 9, displayValue: "9"},
                    {value: 10, displayValue: "10"},
                    {value: 11, displayValue: "11"},
                    {value: 12, displayValue: "12"},
                    {value: 14, displayValue: "14"},
                    {value: 16, displayValue: "16"},
                    {value: 18, displayValue: "18"},
                    {value: 20, displayValue: "20"},
                    {value: 22, displayValue: "22"},
                    {value: 24, displayValue: "24"},
                    {value: 26, displayValue: "26"},
                    {value: 28, displayValue: "28"},
                    {value: 36, displayValue: "36"},
                    {value: 48, displayValue: "48"},
                    {value: 72, displayValue: "72"},
                    {value: 96, displayValue: "96"}
                ]
            });
            this.cmbFontSize.setValue('');
            textBarBtns.push(this.cmbFontSize);

            this.btnBold = new Common.UI.Button({
                parentEl: $('#text-bar-bold', container),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-bold',
                enableToggle: true,
                hint: toolbar.textBold
            });
            textBarBtns.push(this.btnBold);

            this.btnItalic = new Common.UI.Button({
                parentEl: $('#text-bar-italic', container),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-italic',
                enableToggle: true,
                hint: toolbar.textItalic
            });
            textBarBtns.push(this.btnItalic);

            this.btnTextUnderline = new Common.UI.Button({
                parentEl: $('#text-bar-underline', container),
                cls         : 'btn-toolbar',
                iconCls     : 'toolbar__icon btn-underline',
                enableToggle: true,
                hint: toolbar.textUnderline
            });
            textBarBtns.push(this.btnTextUnderline);

            this.btnTextStrikeout = new Common.UI.Button({
                parentEl: $('#text-bar-strikeout', container),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-strikeout',
                enableToggle: true,
                hint: toolbar.textStrikeout
            });
            textBarBtns.push(this.btnTextStrikeout);

            this.btnSuperscript = new Common.UI.Button({
                parentEl: $('#text-bar-super', container),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-superscript',
                enableToggle: true,
                toggleGroup: 'superscriptGroup',
                hint: toolbar.textSuperscript
            });
            textBarBtns.push(this.btnSuperscript);

            this.btnSubscript = new Common.UI.Button({
                parentEl: $('#text-bar-sub', container),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-subscript',
                enableToggle: true,
                toggleGroup: 'superscriptGroup',
                hint: toolbar.textSubscript
            });
            textBarBtns.push(this.btnSubscript);

            var config = Common.UI.simpleColorsConfig;
            this.btnFontColor = new Common.UI.ButtonColored({
                parentEl: $('#text-bar-textcolor', container),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-fontcolor',
                split: true,
                menu: true,
                colors: config.colors,
                color: '000000',
                dynamiccolors: config.dynamiccolors,
                themecolors: config.themecolors,
                effects: config.effects,
                columns: config.columns,
                paletteCls: config.cls,
                paletteWidth: config.paletteWidth,
                hint: toolbar.tipFontColor
            });
            textBarBtns.push(this.btnFontColor);
            this.btnFontColor.setMenu();
            this.mnuFontColorPicker = this.btnFontColor.getPicker();
            this.btnFontColor.currentColor = this.btnFontColor.color;

            return container;
        },

        createAnnotBar: function(annotBarBtns) {
            var container = $('<div id="annot-bar-container" style="position: absolute;">' +
                    '<div id="annot-bar-copy" style="display:inline-block;" class=""></div>' +
                    '<div class="separator margin-left-6"></div>' +
                    '<div id="annot-bar-add-comment" style="display:inline-block;" class="margin-left-13"></div>' +
                    '<div id="annot-bar-highlight" style="display:inline-block;" class="margin-left-4"></div>' +
                    '<div id="annot-bar-underline" style="display:inline-block;" class="margin-left-4"></div>' +
                    '<div id="annot-bar-strikeout" style="display:inline-block;" class="margin-left-4"></div>' +
                    '<div class="separator margin-left-6"></div>' +
                    '<div id="annot-bar-edit-text" class="margin-left-13" style="display:inline-block;"></div>' +
                    '</div>'),
                toolbarController = PDFE.getController('Toolbar'),
                toolbar = toolbarController.getView('Toolbar');

            this.btnCopy = new Common.UI.Button({
                parentEl: $('#annot-bar-copy', container),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-copy',
                hint: toolbar.tipCopy
            });
            annotBarBtns.push(this.btnCopy);

            this.btnAddComment = new Common.UI.Button({
                parentEl: $('#annot-bar-add-comment', container),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-add-comment',
                hint: toolbar.tipAddComment
            });
            annotBarBtns.push(this.btnAddComment);

            var config = Common.UI.simpleColorsConfig;
            this.btnUnderline = new Common.UI.ButtonColored({
                parentEl: $('#annot-bar-underline', container),
                cls         : 'btn-toolbar',
                iconCls     : 'toolbar__icon btn-underline',
                enableToggle: true,
                allowDepress: true,
                split: true,
                menu: true,
                hideColorLine: true,
                colors: config.colors,
                color: '3D8A44',
                dynamiccolors: config.dynamiccolors,
                themecolors: config.themecolors,
                effects: config.effects,
                columns: config.columns,
                paletteCls: config.cls,
                paletteWidth: config.paletteWidth,
                storageSuffix: '-draw',
                hint: toolbar.textUnderline,
                type: AscPDF.ANNOTATIONS_TYPES.Underline
            });
            annotBarBtns.push(this.btnUnderline);
            this.btnUnderline.setMenu();
            this.mnuUnderlineColorPicker = this.btnUnderline.getPicker();
            this.btnUnderline.currentColor = this.btnUnderline.color;

            this.btnStrikeout = new Common.UI.ButtonColored({
                parentEl: $('#annot-bar-strikeout', container),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-strikeout',
                enableToggle: true,
                allowDepress: true,
                split: true,
                menu: true,
                hideColorLine: true,
                colors: config.colors,
                color: 'D43230',
                dynamiccolors: config.dynamiccolors,
                themecolors: config.themecolors,
                effects: config.effects,
                columns: config.columns,
                paletteCls: config.cls,
                paletteWidth: config.paletteWidth,
                storageSuffix: '-draw',
                hint: toolbar.textStrikeout,
                type: AscPDF.ANNOTATIONS_TYPES.Strikeout
            });
            annotBarBtns.push(this.btnStrikeout);
            this.btnStrikeout.setMenu();
            this.mnuStrikeoutColorPicker = this.btnStrikeout.getPicker();
            this.btnStrikeout.currentColor = this.btnStrikeout.color;

            this.btnHighlight = new Common.UI.ButtonColored({
                parentEl: $('#annot-bar-highlight', container),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-highlight',
                enableToggle: true,
                allowDepress: true,
                split: true,
                menu: true,
                colors: [
                    'FFFC54', '72F54A', '74F9FD', 'EB51F7', 'A900F9', 'EF8B3A', '7272FF', 'FF63A4', '1DFF92', '03DA18',
                    '249B01', 'C504D2', '0633D1', 'FFF7A0', 'FF0303', 'FFFFFF', 'D3D3D4', '969696', '606060', '000000'
                ],
                color: 'FFFC54',
                dynamiccolors: config.dynamiccolors,
                themecolors: config.themecolors,
                effects: config.effects,
                columns: config.columns,
                paletteCls: config.cls,
                paletteWidth: config.paletteWidth,
                storageSuffix: '-draw',
                hint: toolbar.textHighlight,
                type: AscPDF.ANNOTATIONS_TYPES.Highlight
            });
            annotBarBtns.push(this.btnHighlight);
            this.btnHighlight.setMenu();
            this.mnuHighlightColorPicker = this.btnHighlight.getPicker();
            this.btnHighlight.currentColor = this.btnHighlight.color;

            this.btnEditText = new Common.UI.Button({
                parentEl: $('#annot-bar-edit-text', container),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-magic-wand',
                caption: this.textRecognize,
                hint: this.tipRecognize
            });
            annotBarBtns.push(this.btnEditText);
            this.fireEvent('annotbar:create', [this.btnStrikeout, this.mnuStrikeoutColorPicker, this.btnUnderline, this.mnuUnderlineColorPicker, this.btnHighlight, this.mnuHighlightColorPicker]);

            return container;
        },

        focus: function() {
            var me = this;
            _.defer(function(){  me.cmpEl.focus(); }, 50);
        },

        SetDisabled: function(state, canProtect, fillFormMode) {
            this._isDisabled = state;
        },

        addEquationMenu: function() {},

        clearEquationMenu: function() {},

        equationCallback: function() {},

        initEquationMenu: function() {},

        updateCustomItems: function() {},

        clearCustomItems: function() {},

        parseIcons: function() {}

    }, PDFE.Views.DocumentHolder || {}));
});