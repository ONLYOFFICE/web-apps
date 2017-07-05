/*
 *
 * (c) Copyright Ascensio System Limited 2010-2017
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
 *  Toolbar.js
 *
 *  Created by Alexander Yuzhin on 3/31/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'jquery',
    'underscore',
    'backbone',
    'text!spreadsheeteditor/main/app/template/Toolbar.template',
    'common/main/lib/collection/Fonts',
    'common/main/lib/component/Button',
    'common/main/lib/component/ComboBox',
    'common/main/lib/component/DataView',
    'common/main/lib/component/ColorPalette',
    'common/main/lib/component/ThemeColorPalette',
    'common/main/lib/component/Menu',
    'common/main/lib/component/DimensionPicker',
    'common/main/lib/component/Window',
    'common/main/lib/component/ComboBoxFonts',
    'common/main/lib/component/ComboDataView'
    /** coauthoring begin **/
    ,'common/main/lib/component/SynchronizeTip'
    /** coauthoring end **/
], function ($, _, Backbone, toolbarTemplate) { 'use strict';

    SSE.enumLock = {
        editCell:       'cell-editing',
        editFormula:    'is-formula',
        editText:       'is-text',
        selImage:       'sel-image',
        selShape:       'sel-shape',
        selShapeText:   'sel-shape-txt',
        selChart:       'sel-chart',
        selChartText:   'sel-chart-txt',
        selRange:       'sel-range',
        lostConnect:    'disconnect',
        coAuth:         'co-auth',
        coAuthText:     'co-auth-text',
        ruleMerge:      'rule-btn-merge',
        ruleFilter:     'rule-filter',
        ruleDelFilter:  'rule-clear-filter',
        menuFileOpen:   'menu-file-open',
        cantPrint:      'cant-print',
        multiselect:    'is-multiselect',
        cantHyperlink:  'cant-hyperlink'
    };

    SSE.Views.Toolbar =  Backbone.View.extend(_.extend({
        el: '#toolbar',

        // Compile our stats template
        template: _.template(toolbarTemplate),

        // Delegated events for creating new items, and clearing completed ones.
        events: {
            //
        },

        initialize: function () {
            var me = this,
                options = {};

            me.SchemeNames = [
                me.txtScheme1, me.txtScheme2, me.txtScheme3, me.txtScheme4, me.txtScheme5,
                me.txtScheme6, me.txtScheme7, me.txtScheme8, me.txtScheme9, me.txtScheme10,
                me.txtScheme11, me.txtScheme12, me.txtScheme13, me.txtScheme14, me.txtScheme15,
                me.txtScheme16, me.txtScheme17, me.txtScheme18, me.txtScheme19, me.txtScheme20,
                me.txtScheme21
            ];
            me._state = {
                hasCollaborativeChanges: undefined
            };
            me.btnSaveCls = 'btn-save';
            me.btnSaveTip = this.tipSave + Common.Utils.String.platformKey('Ctrl+S');

            me.ascFormatOptions = {
                General     : 'General',
                Number      : '0.00',
                Currency    : '$#,##0.00',
                Accounting  : '_($* #,##0.00_);_($* (#,##0.00);_($* "-"??_);_(@_)',
                DateShort   : 'm/d/yyyy',
                DateLong    : '[$-F800]dddd, mmmm dd, yyyy',
                Time        : '[$-F400]h:mm:ss AM/PM',
                Percentage  : '0.00%',
                Percent     : '0%',
                Fraction    : '# ?/?',
                Scientific  : '0.00E+00',
                Text        : '@'
            };

            me.numFormatData = [
                { value: Asc.c_oAscNumFormatType.General,   format: this.ascFormatOptions.General,     displayValue: this.txtGeneral,      exampleval: '100' },
                { value: Asc.c_oAscNumFormatType.Number,    format: this.ascFormatOptions.Number,      displayValue: this.txtNumber,       exampleval: '100,00' },
                { value: Asc.c_oAscNumFormatType.Scientific,format: this.ascFormatOptions.Scientific,  displayValue: this.txtScientific,   exampleval: '1,00E+02' },
                { value: Asc.c_oAscNumFormatType.Accounting,format: this.ascFormatOptions.Accounting,  displayValue: this.txtAccounting,   exampleval: '100,00 $' },
                { value: Asc.c_oAscNumFormatType.Currency,  format: this.ascFormatOptions.Currency,    displayValue: this.txtCurrency,     exampleval: '100,00 $' },
                { value: Asc.c_oAscNumFormatType.Date,      format: 'MM-dd-yyyy',                      displayValue: this.txtDate,         exampleval: '04-09-1900' },
                { value: Asc.c_oAscNumFormatType.Time,      format: 'HH:MM:ss',                        displayValue: this.txtTime,         exampleval: '00:00:00' },
                { value: Asc.c_oAscNumFormatType.Percent,   format: this.ascFormatOptions.Percentage,  displayValue: this.txtPercentage,   exampleval: '100,00%' },
                { value: Asc.c_oAscNumFormatType.Fraction,  format: this.ascFormatOptions.Fraction,    displayValue: this.txtFraction,     exampleval: '100' },
                { value: Asc.c_oAscNumFormatType.Text,      format: this.ascFormatOptions.Text,        displayValue: this.txtText,         exampleval: '100' }
            ];

            function dummyCmp() {
                return {
                    isDummy : true,
                    on      : function() {}
                }
            }

            var _set = SSE.enumLock;
            me.cmbFontSize = new Common.UI.ComboBox({
                cls         : 'input-group-nr',
                menuStyle   : 'min-width: 55px;',
                hint        : me.tipFontSize,
                lock        : [_set.selImage, _set.editFormula, _set.selRange, _set.coAuth, _set.coAuthText, _set.lostConnect],
                data        : [
                    { value: 8, displayValue: "8" },
                    { value: 9, displayValue: "9" },
                    { value: 10, displayValue: "10" },
                    { value: 11, displayValue: "11" },
                    { value: 12, displayValue: "12" },
                    { value: 14, displayValue: "14" },
                    { value: 16, displayValue: "16" },
                    { value: 18, displayValue: "18" },
                    { value: 20, displayValue: "20" },
                    { value: 22, displayValue: "22" },
                    { value: 24, displayValue: "24" },
                    { value: 26, displayValue: "26" },
                    { value: 28, displayValue: "28" },
                    { value: 36, displayValue: "36" },
                    { value: 48, displayValue: "48" },
                    { value: 72, displayValue: "72" }
                ]
            });

            me.btnNewDocument = new Common.UI.Button({
                id          : 'id-toolbar-btn-newdocument',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-newdocument',
                lock        : [_set.lostConnect]
            });

            me.btnOpenDocument = new Common.UI.Button({
                id          : 'id-toolbar-btn-opendocument',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-opendocument',
                lock        : [_set.lostConnect]
            });

            me.cmbFontName = new Common.UI.ComboBoxFonts({
                cls         : 'input-group-nr',
                menuCls     : 'scrollable-menu',
                menuStyle   : 'min-width: 325px;',
                hint        : me.tipFontName,
                lock        : [_set.selImage, _set.editFormula, _set.selRange, _set.coAuth, _set.coAuthText, _set.lostConnect],
                store       : new Common.Collections.Fonts()
            });

            me.btnPrint = new Common.UI.Button({
                id          : 'id-toolbar-btn-print',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-print',
                lock        : [_set.editCell, _set.cantPrint]
            });

            me.btnSave = new Common.UI.Button({
                id          : 'id-toolbar-btn-save',
                cls         : 'btn-toolbar',
                iconCls     : me.btnSaveCls
            });

            me.btnCopy = new Common.UI.Button({
                id          : 'id-toolbar-btn-copy',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-copy'
            });

            me.btnPaste = new Common.UI.Button({
                id          : 'id-toolbar-btn-paste',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-paste',
                lock        : [/*_set.editCell,*/ _set.coAuth, _set.lostConnect]
            });

            me.btnUndo = new Common.UI.Button({
                id          : 'id-toolbar-btn-undo',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-undo',
                disabled    : true,
                lock        : [_set.lostConnect]
            });

            me.btnRedo = new Common.UI.Button({
                id          : 'id-toolbar-btn-redo',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-redo',
                disabled    : true,
                lock        : [_set.lostConnect]
            });

            me.btnIncFontSize = new Common.UI.Button({
                id          : 'id-toolbar-btn-incfont',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-incfont',
                lock        : [_set.selImage, _set.editFormula, _set.selRange, _set.coAuth, _set.coAuthText, _set.lostConnect]
            });

            me.btnDecFontSize = new Common.UI.Button({
                id          : 'id-toolbar-btn-decfont',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-decfont',
                lock        : [_set.selImage, _set.editFormula, _set.selRange, _set.coAuth, _set.coAuthText, _set.lostConnect]
            });

            me.btnBold = new Common.UI.Button({
                id          : 'id-toolbar-btn-bold',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-bold',
                lock        : [_set.selImage, _set.editFormula, _set.selRange, _set.coAuth, _set.coAuthText, _set.lostConnect],
                enableToggle: true
            });

            me.btnItalic = new Common.UI.Button({
                id          : 'id-toolbar-btn-italic',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-italic',
                lock        : [_set.selImage, _set.editFormula, _set.selRange, _set.coAuth, _set.coAuthText, _set.lostConnect],
                enableToggle: true
            });

            me.btnUnderline = new Common.UI.Button({
                id          : 'id-toolbar-btn-underline',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-underline',
                lock        : [_set.selImage, _set.editFormula, _set.selRange, _set.coAuth, _set.coAuthText, _set.lostConnect],
                enableToggle: true
            });

            me.mnuTextColorPicker = dummyCmp();
            me.btnTextColor = new Common.UI.Button({
                id          : 'id-toolbar-btn-fontcolor',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-fontcolor',
                split       : true,
                lock        : [_set.selImage, _set.editFormula, _set.selRange, _set.coAuth, _set.coAuthText, _set.lostConnect],
                menu        : new Common.UI.Menu({
                    items: [
                        { template: _.template('<div id="id-toolbar-menu-fontcolor" style="width: 169px; height: 220px; margin: 10px;"></div>') },
                        { template: _.template('<a id="id-toolbar-menu-new-fontcolor" style="padding-left:12px;">' + me.textNewColor + '</a>') }
                    ]
                })
            }).on('render:after', function(btn) {
                var colorVal = $('<div class="btn-color-value-line"></div>');
                $('button:first-child', btn.cmpEl).append(colorVal);
                colorVal.css('background-color', btn.currentColor || 'transparent');

                me.mnuTextColorPicker = new Common.UI.ThemeColorPalette({
                    el: $('#id-toolbar-menu-fontcolor')
                });
            });

            me.mnuBackColorPicker = dummyCmp();
            me.btnBackColor = new Common.UI.Button({
                id          : 'id-toolbar-btn-fillparag',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-fillparag',
                split       : true,
                lock        : [_set.selImage, _set.editCell, _set.coAuth, _set.coAuthText, _set.lostConnect],
                menu        : new Common.UI.Menu({
                    items: [
                        { template: _.template('<div id="id-toolbar-menu-paracolor" style="width: 169px; height: 220px; margin: 10px;"></div>') },
                        { template: _.template('<a id="id-toolbar-menu-new-paracolor" style="padding-left:12px;">' + me.textNewColor + '</a>') }
                    ]
                })
            }).on('render:after', function(btn) {
                var colorVal = $('<div class="btn-color-value-line"></div>');
                $('button:first-child', btn.cmpEl).append(colorVal);
                colorVal.css('background-color', btn.currentColor || 'transparent');

                me.mnuBackColorPicker = new Common.UI.ThemeColorPalette({
                    el: $('#id-toolbar-menu-paracolor'),
                    transparent: true
                });
            });

            me.btnBorders = new Common.UI.Button({
                id          : 'id-toolbar-btn-borders',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-border-out',
                icls        : 'btn-border-out',
                borderId    : 'outer',
                borderswidth: 'thin',
                lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.lostConnect, _set.coAuth],
                split       : true,
                menu        : true
            });

            me.btnAlignLeft = new Common.UI.Button({
                id          : 'id-toolbar-btn-align-left',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-align-left',
                enableToggle: true,
                lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selImage, _set.lostConnect, _set.coAuth, _set.coAuthText],
                toggleGroup : 'alignGroup'
            });

            me.btnAlignCenter = new Common.UI.Button({
                id          : 'id-toolbar-btn-align-center',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-align-center',
                enableToggle: true,
                lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selImage, _set.lostConnect, _set.coAuth, _set.coAuthText],
                toggleGroup : 'alignGroup'
            });

            me.btnAlignRight = new Common.UI.Button({
                id          : 'id-toolbar-btn-align-right',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-align-right',
                enableToggle: true,
                lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selImage, _set.lostConnect, _set.coAuth, _set.coAuthText],
                toggleGroup : 'alignGroup'
            });

            me.btnAlignJust = new Common.UI.Button({
                id          : 'id-toolbar-btn-align-just',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-align-just',
                enableToggle: true,
                lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selImage, _set.lostConnect, _set.coAuth, _set.coAuthText],
                toggleGroup: 'alignGroup'
            });

            me.btnMerge = new Common.UI.Button({
                id          : 'id-toolbar-rtn-merge',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-merge',
                enableToggle: true,
                allowDepress: true,
                split       : true,
                lock        : [_set.editCell, _set.selShape, _set.selShapeText, _set.selChart, _set.selChartText, _set.selImage, _set.lostConnect, _set.coAuth, _set.ruleMerge],
                menu        : new Common.UI.Menu({
                    items: [
                        {
                            caption : me.txtMergeCenter,
                            value   : Asc.c_oAscMergeOptions.MergeCenter
                        },
                        {
                            caption : me.txtMergeAcross,
                            value   : Asc.c_oAscMergeOptions.MergeAcross
                        },
                        {
                            caption : me.txtMergeCells,
                            value   : Asc.c_oAscMergeOptions.Merge
                        },
                        {
                            caption : me.txtUnmerge,
                            value   : Asc.c_oAscMergeOptions.None
                        }
                    ]
                })
            });

            me.btnAlignTop = new Common.UI.Button({
                id          : 'id-toolbar-rtn-valign-top',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-valign-top',
                lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selImage, _set.lostConnect, _set.coAuth, _set.coAuthText],
                enableToggle: true,
                toggleGroup : 'vAlignGroup'
            });

            me.btnAlignMiddle = new Common.UI.Button({
                id          : 'id-toolbar-rtn-valign-middle',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-valign-middle',
                enableToggle: true,
                lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selImage, _set.lostConnect, _set.coAuth, _set.coAuthText],
                toggleGroup : 'vAlignGroup'
            });

            me.btnAlignBottom = new Common.UI.Button({
                id          : 'id-toolbar-rtn-valign-bottom',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-valign-bottom',
                lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selImage, _set.lostConnect, _set.coAuth, _set.coAuthText],
                enableToggle: true,
                toggleGroup : 'vAlignGroup'
            });

            me.btnWrap = new Common.UI.Button({
                id          : 'id-toolbar-rtn-wrap',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-wrap',
                lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.lostConnect, _set.coAuth],
                enableToggle: true,
                allowDepress: true
            });

            me.btnTextOrient = new Common.UI.Button({
                id          : 'id-toolbar-rtn-textorient',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-text-orient',
                lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.lostConnect, _set.coAuth, _set.coAuthText],
                menu        : new Common.UI.Menu({
                    items: [
                        {
                            caption     : me.textHorizontal,
                            iconCls     : 'mnu-direct-horiz',
                            checkable   : true,
                            toggleGroup : 'textorientgroup',
                            value       : 'horiz'
                        },
                        {
                            caption     : me.textCounterCw,
                            iconCls     : 'mnu-direct-ccw',
                            checkable   : true,
                            toggleGroup : 'textorientgroup',
                            value       : 'countcw'
                        },
                        {
                            caption     : me.textClockwise,
                            iconCls     : 'mnu-direct-cw',
                            checkable   : true,
                            toggleGroup : 'textorientgroup',
                            value       : 'clockwise'
                        },
                        {
                            caption     : me.textRotateUp,
                            iconCls     : 'mnu-direct-rup',
                            checkable   : true,
                            toggleGroup : 'textorientgroup',
                            value       : 'rotateup'
                        },
                        {
                            caption     : me.textRotateDown,
                            iconCls     : 'mnu-direct-rdown',
                            checkable   : true,
                            toggleGroup : 'textorientgroup',
                            value       : 'rotatedown'
                        }
                    ]
                })
            });

            me.btnInsertImage = new Common.UI.Button({
                id          : 'id-toolbar-btn-insertimage',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-insertimage',
                lock        : [_set.editCell, _set.selChartText, _set.selImage, _set.lostConnect, _set.coAuth],
                menu        : new Common.UI.Menu({
                    items: [
                        { caption: me.mniImageFromFile, value: 'file' },
                        { caption: me.mniImageFromUrl,  value: 'url' }
                    ]
                })
            });

            me.btnInsertHyperlink = new Common.UI.Button({
                id          : 'id-toolbar-btn-inserthyperlink',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-inserthyperlink',
                lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selImage, _set.selShape, _set.cantHyperlink, _set.multiselect, _set.lostConnect, _set.coAuth]
            });

            me.btnInsertChart = new Common.UI.Button({
                id          : 'id-toolbar-btn-insertchart',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-insertchart',
                lock        : [_set.editCell, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.lostConnect, _set.coAuth, _set.coAuthText],
                menu        : new Common.UI.Menu({
                    style: 'width: 435px;',
                    items: [
                        { template: _.template('<div id="id-toolbar-menu-insertchart" class="menu-insertchart" style="margin: 5px 5px 5px 10px;"></div>') }
                    ]
                })
            });

            me.btnEditChart = new Common.UI.Button({
                id          : 'id-toolbar-rtn-edit-chart',
                cls         : 'btn-toolbar btn-text-value',
                caption     : me.tipEditChart,
                lock        : [_set.lostConnect],
                style       : 'width: 120px;'
            });

            me.btnInsertShape = new Common.UI.Button({
                id          : 'id-toolbar-btn-insertshape',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-insertshape',
                enableToggle: true,
                lock        : [_set.editCell, _set.selChartText, _set.selImage, _set.lostConnect, _set.coAuth],
                menu        : new Common.UI.Menu({cls: 'menu-shapes'})
            });

            me.btnInsertText = new Common.UI.Button({
                id          : 'id-toolbar-btn-inserttext',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-text',
                lock        : [_set.editCell, _set.selChartText, _set.selImage, _set.lostConnect, _set.coAuth],
                enableToggle: true,
                split       : true,
                menu        : new Common.UI.Menu({
                    items : [
                        {caption: this.textInsText, value: 'text'},
                        this.mnuInsertTextArt = new Common.UI.MenuItem({
                            caption: this.textInsTextArt,
                            value: 'art',
                            menu: new Common.UI.Menu({
                                menuAlign: 'tl-tr',
                                cls: 'menu-shapes',
                                items: [
                                    { template: _.template('<div id="id-toolbar-menu-insart" style="width: 239px; margin-left: 5px;"></div>') }
                                ]
                            })
                        })
                    ]
                })
            });

            this.btnInsertEquation = new Common.UI.Button({
                id          : 'id-toolbar-btn-insertequation',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-insertequation',
                split       : true,
                lock        : [_set.editCell, _set.selChartText, _set.selImage, _set.lostConnect, _set.coAuth],
                menu        : new Common.UI.Menu({cls: 'menu-shapes'})
            });

            me.btnSortDown = new Common.UI.Button({
                id          : 'id-toolbar-btn-sort-down',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-sort-down',
                lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.lostConnect, _set.coAuth, _set.ruleFilter]
            });

            me.btnSortUp = new Common.UI.Button({
                id          : 'id-toolbar-btn-sort-up',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-sort-up',
                lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.lostConnect, _set.coAuth, _set.ruleFilter]
            });

            me.btnSetAutofilter = new Common.UI.Button({
                id          : 'id-toolbar-btn-setautofilter',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-autofilter',
                lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.lostConnect, _set.coAuth, _set.ruleFilter],
                enableToggle: true
            });

            me.btnClearAutofilter = new Common.UI.Button({
                id          : 'id-toolbar-btn-clearfilter',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-clear-filter',
                lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.lostConnect, _set.coAuth, _set.ruleDelFilter]
            });
            
            me.btnSearch = new Common.UI.Button({
                id          : 'id-toolbar-btn-search',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-search',
                lock        : [_set.lostConnect]
            });

            me.btnTableTemplate = new Common.UI.Button({
                id          : 'id-toolbar-btn-ttempl',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-ttempl',
                lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.lostConnect, _set.coAuth, _set.ruleFilter, _set.multiselect],
                menu        : new Common.UI.Menu({
                    items: [
                        { template: _.template('<div id="id-toolbar-menu-table-templates" style="width: 288px; height: 300px; margin: 0px 4px;"></div>') }
                    ]
                })
            });

            me.listStyles = new Common.UI.ComboDataView({
                cls             : 'combo-styles',
                enableKeyEvents : true,
                itemWidth       : 112,
                itemHeight      : 38,
                menuMaxHeight   : 226,
                lock            : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.lostConnect, _set.coAuth],
                beforeOpenHandler: function(e) {
                    var cmp = this,
                        menu = cmp.openButton.menu,
                        minMenuColumn = 6;

                    if (menu.cmpEl) {
                        var itemEl = $(cmp.cmpEl.find('.dataview.inner .style').get(0)).parent();
                        var itemMargin = /*parseInt($(itemEl.get(0)).parent().css('margin-right'))*/-1;
                        var itemWidth = itemEl.is(':visible') ? parseInt(itemEl.css('width')) :
                                        (cmp.itemWidth + parseInt(itemEl.css('padding-left')) + parseInt(itemEl.css('padding-right')) +
                                        parseInt(itemEl.css('border-left-width')) + parseInt(itemEl.css('border-right-width'))); 

                        var minCount        = cmp.menuPicker.store.length >= minMenuColumn ? minMenuColumn : cmp.menuPicker.store.length,
                            columnCount     = Math.min(cmp.menuPicker.store.length, Math.round($('.dataview', $(cmp.fieldPicker.el)).width() / (itemMargin + itemWidth) + 0.5));

                        columnCount = columnCount < minCount ? minCount : columnCount;
                        menu.menuAlignEl = cmp.cmpEl;

                        menu.menuAlign = 'tl-tl';
                        var offset = cmp.cmpEl.width() - cmp.openButton.$el.width() - columnCount * (itemMargin + itemWidth) - 1;
                        menu.setOffset(Math.min(offset, 0));

                        menu.cmpEl.css({
                            'width' : columnCount * (itemWidth + itemMargin),
                            'min-height': cmp.cmpEl.height()
                        });
                    }
                }
            });

            var formatTemplate =
                _.template([
                '<% _.each(items, function(item) { %>',
                '<li id="<%= item.id %>" data-value="<%= item.value %>"><a tabindex="-1" type="menuitem">',
                    '<div style="position: relative;"><div style="position: absolute; left: 0; width: 100px;"><%= scope.getDisplayValue(item) %></div>',
                    '<div style="display: inline-block; width: 100%; max-width: 300px; overflow: hidden; text-overflow: ellipsis; text-align: right; vertical-align: bottom; padding-left: 100px; color: silver;"><%= item.exampleval ? item.exampleval : "" %></div>',
                '</div></a></li>',
                '<% }); %>',
                '<li class="divider">',
                '<li id="id-toolbar-mnu-item-more-formats" data-value="-1"><a tabindex="-1" type="menuitem">' + me.textMoreFormats + '</a></li>'
            ].join(''));

            me.cmbNumberFormat = new Common.UI.ComboBox({
                cls         : 'input-group-nr',
                menuStyle   : 'min-width: 180px;',
                hint        : me.tipNumFormat,
                lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.selRange, _set.lostConnect, _set.coAuth],
                itemsTemplate: formatTemplate,
                editable    : false,
                data        : me.numFormatData
            });

            me.btnPercentStyle = new Common.UI.Button({
                id          : 'id-toolbar-btn-percent-style',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-percent-style',
                lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.lostConnect, _set.coAuth],
                styleName   : 'Percent'
            });

            me.btnCurrencyStyle = new Common.UI.Button({
                id          : 'id-toolbar-btn-accounting-style',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-currency-style',
                lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.lostConnect, _set.coAuth],
                styleName    : 'Currency',
                split       : true,
                menu        : new Common.UI.Menu({
                    style: 'min-width: 120px;',
                    items : [
                        {
                            caption : me.txtDollar,
                            value   : 0x0409 // $ en-US
                        },
                        {
                            caption : me.txtEuro,
                            value   : 0x0407 // € de-DE
                        },
                        {
                            caption : me.txtPound,
                            value   : 0x0809 // £ en-GB
                        },
                        {
                            caption : me.txtRouble,
                            value   : 0x0419 // ₽ ru-RU
                        },
                        {
                            caption : me.txtYen,
                            value   : 0x0411 // ¥ ja-JP
                        }
                    ]
                })
            });

            me.btnDecDecimal = new Common.UI.Button({
                id          : 'id-toolbar-btn-decdecimal',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-decdecimal',
                lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.lostConnect, _set.coAuth]
            });

            me.btnIncDecimal = new Common.UI.Button({
                id          : 'id-toolbar-btn-incdecimal',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-incdecimal',
                lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.lostConnect, _set.coAuth]
            });

            me.btnInsertFormula = new Common.UI.Button({
                id          : 'id-toolbar-btn-insertformula',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-formula',
                split       : true,
                lock        : [_set.editText, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.selRange, _set.lostConnect, _set.coAuth],
                menu        : new Common.UI.Menu({
                    style : 'min-width: 110px',
                    items : [
                        {caption: 'SUM',   value: 'SUM'},
                        {caption: 'MIN',   value: 'MIN'},
                        {caption: 'MAX',   value: 'MAX'},
                        {caption: 'COUNT', value: 'COUNT'},
                        {caption: '--'},
                        {
                            caption: me.txtAdditional,
                            value: 'more'
                        }
                    ]
                })
            });

            me.btnNamedRange = new Common.UI.Button({
                id          : 'id-toolbar-btn-insertrange',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-named-range',
                lock        : [_set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.lostConnect, _set.coAuth, _set.selRange],
                menu        : new Common.UI.Menu({
                    style : 'min-width: 110px',
                    items : [
                        {
                            caption: me.txtManageRange,
                            lock    : [_set.editCell],
                            value: 'manage'
                        },
                        {
                            caption: me.txtNewRange,
                            lock    : [_set.editCell],
                            value: 'new'
                        },
                        {
                            caption: me.txtPasteRange,
                            value: 'paste'
                        }
                    ]
                })
            });

            me.btnClearStyle = new Common.UI.Button({
                id          : 'id-toolbar-btn-clear',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-clearstyle',
                lock        : [_set.lostConnect, _set.coAuth, _set.selRange],
                menu        : new Common.UI.Menu({
                    style : 'min-width: 110px',
                    items : [
                        {
                            caption : me.txtClearAll,
                            value   : Asc.c_oAscCleanOptions.All
                        },
                        {
                            caption : me.txtClearText,
                            lock    : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.coAuth],
                            value   : Asc.c_oAscCleanOptions.Text
                        },
                        {
                            caption : me.txtClearFormat,
                            lock    : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.coAuth],
                            value   : Asc.c_oAscCleanOptions.Format
                        },
                        {
                            caption : me.txtClearComments,
                            lock    : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.coAuth],
                            value   : Asc.c_oAscCleanOptions.Comments
                        },
                        {
                            caption : me.txtClearHyper,
                            lock    : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.coAuth],
                            value   : Asc.c_oAscCleanOptions.Hyperlinks
                        }
                    ]
                })
            });

            me.btnCopyStyle = new Common.UI.Button({
                id          : 'id-toolbar-btn-copystyle',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-copystyle',
                lock        : [_set.editCell, _set.lostConnect, _set.coAuth, _set.selChart],
                enableToggle: true
            });

            me.btnAddCell = new Common.UI.Button({
                id          : 'id-toolbar-btn-addcell',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-addcell',
                lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.lostConnect, _set.coAuth],
                menu        : new Common.UI.Menu({
                    items : [
                        {
                            caption : me.textInsRight,
                            value   : Asc.c_oAscInsertOptions.InsertCellsAndShiftRight
                        },
                        {
                            caption : me.textInsDown,
                            value   : Asc.c_oAscInsertOptions.InsertCellsAndShiftDown
                        },
                        {
                            caption : me.textEntireRow,
                            value   : Asc.c_oAscInsertOptions.InsertRows
                        },
                        {
                            caption : me.textEntireCol,
                            value   : Asc.c_oAscInsertOptions.InsertColumns
                        }
                    ]
                })
            });

            me.btnDeleteCell = new Common.UI.Button({
                id          : 'id-toolbar-btn-delcell',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-delcell',
                lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.lostConnect, _set.coAuth],
                menu        : new Common.UI.Menu({
                    items : [
                        {
                            caption : me.textDelLeft,
                            value   : Asc.c_oAscDeleteOptions.DeleteCellsAndShiftLeft
                        },
                        {
                            caption : me.textDelUp,
                            value   : Asc.c_oAscDeleteOptions.DeleteCellsAndShiftTop
                        },
                        {
                            caption : me.textEntireRow,
                            value   : Asc.c_oAscDeleteOptions.DeleteRows
                        },
                        {
                            caption : me.textEntireCol,
                            value   : Asc.c_oAscDeleteOptions.DeleteColumns
                        }
                    ]
                })
            });

            me.btnColorSchemas = new Common.UI.Button({
                id          : 'id-toolbar-btn-colorschemas',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-colorschemas',
                lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.lostConnect, _set.coAuth],
                menu        : new Common.UI.Menu({
                    items: [],
                    maxHeight   : 600,
                    restoreHeight: 600
                }).on('show:before', function(mnu) {
                    if ( !this.scroller ) {
                        this.scroller = new Common.UI.Scroller({
                            el: $(this.el).find('.dropdown-menu '),
                            useKeyboard: this.enableKeyEvents && !this.handleSelect,
                            minScrollbarLength  : 40,
                            alwaysVisibleY: true
                        });
                    }
                }).on('show:after', function(btn, e) {
                    var mnu = $(this.el).find('.dropdown-menu '),
                        docH = Common.Utils.innerHeight(),
                        menuH = mnu.outerHeight(),
                        top = parseInt(mnu.css('top'));

                    if (menuH > docH) {
                        mnu.css('max-height', (docH - parseInt(mnu.css('padding-top')) - parseInt(mnu.css('padding-bottom'))-5) + 'px');
                        this.scroller.update({minScrollbarLength  : 40});
                    } else if ( mnu.height() < this.options.restoreHeight ) {
                        mnu.css('max-height', (Math.min(docH - parseInt(mnu.css('padding-top')) - parseInt(mnu.css('padding-bottom'))-5, this.options.restoreHeight)) + 'px');
                        menuH = mnu.outerHeight();
                        if (top+menuH > docH) {
                            mnu.css('top', 0);
                        }
                        this.scroller.update({minScrollbarLength  : 40});
                    }
                })
            });

            me.mnuZoomIn = dummyCmp();
            me.mnuZoomOut = dummyCmp();

            var clone = function(source) {
                var obj = {};
                for (var prop in source)
                    obj[prop] = (typeof(source[prop])=='object') ? clone(source[prop]) : source[prop];
                return obj;
            };

            this.mnuitemHideHeadings = {
                conf: {checked:false},
                setChecked: function(val) { this.conf.checked = val;},
                isChecked: function () { return this.conf.checked; }
            };
            this.mnuitemHideGridlines = clone(this.mnuitemHideHeadings);
            this.mnuitemFreezePanes = clone(this.mnuitemHideHeadings);
            this.mnuZoom = {
                options: {value: 100}
            };

            me.btnShowMode = new Common.UI.Button({
                id          : 'id-toolbar-btn-showmode',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-showmode',
                lock        : [_set.menuFileOpen, _set.editCell],
                menu        : true
            });

            me.btnSettings = new Common.UI.Button({
                id          : 'id-toolbar-btn-settings',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-settings'
            });

            // Is unique for the short view

            me.btnHorizontalAlign = new Common.UI.Button({
                id          : 'id-toolbar-btn-halign',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-align-left',
                icls        : 'btn-align-left',
                lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.lostConnect, _set.coAuth, _set.coAuthText],
                menu        : new Common.UI.Menu({
                    items: [
                        {
                            caption     : me.tipAlignLeft,
                            iconCls     : 'mnu-align-left',
                            icls        : 'btn-align-left',
                            checkable   : true,
                            allowDepress: true,
                            toggleGroup : 'halignGroup',
                            checked     : true,
                            value       : 'left'
                        },
                        {
                            caption     : me.tipAlignCenter,
                            iconCls     : 'mnu-align-center',
                            icls        : 'btn-align-center',
                            checkable   : true,
                            allowDepress: true,
                            toggleGroup : 'halignGroup',
                            value       : 'center'
                        },
                        {
                            caption     : me.tipAlignRight,
                            iconCls     : 'mnu-align-right',
                            icls        : 'btn-align-right',
                            checkable   : true,
                            allowDepress: true,
                            toggleGroup : 'halignGroup',
                            value       : 'right'
                        },
                        {
                            caption     : me.tipAlignJust,
                            iconCls     : 'mnu-align-just',
                            icls        : 'btn-align-just',
                            checkable   : true,
                            allowDepress: true,
                            toggleGroup : 'halignGroup',
                            value       : 'justify'
                        }
                    ]
                })
            });

            me.btnVerticalAlign = new Common.UI.Button({
                id          : 'id-toolbar-btn-valign',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-valign-bottom',
                icls        : 'btn-valign-bottom',
                lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.lostConnect, _set.coAuth, _set.coAuthText],
                menu        : new Common.UI.Menu({
                    items: [
                        {
                            caption     : me.tipAlignTop,
                            iconCls     : 'mnu-valign-top',
                            icls        : 'btn-valign-top',
                            checkable   : true,
                            allowDepress: true,
                            toggleGroup : 'valignGroup',
                            value       : 'top'
                        },
                        {
                            caption     : me.tipAlignMiddle,
                            iconCls     : 'mnu-valign-middle',
                            icls        : 'btn-valign-middle',
                            checkable   : true,
                            allowDepress: true,
                            toggleGroup : 'valignGroup',
                            value       : 'center'
                        },
                        {
                            caption     : me.tipAlignBottom,
                            iconCls     : 'mnu-valign-bottom',
                            icls        : 'btn-valign-bottom',
                            checkable   : true,
                            allowDepress: true,
                            checked     : true,
                            toggleGroup : 'valignGroup',
                            value       : 'bottom'
                        }
                    ]
                })
            });

            me.btnAutofilter = new Common.UI.Button({
                id          : 'id-toolbar-btn-autofilter',
                cls         : 'btn-toolbar',
                iconCls     : 'btn-autofilter',
                lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.lostConnect, _set.coAuth, _set.ruleFilter],
                menu        : new Common.UI.Menu({
                    items : [
                        me.mnuitemSortAZ = new Common.UI.MenuItem({
                            caption : me.txtSortAZ,
                            iconCls : 'mnu-sort-asc',
                            lock    : [_set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.coAuth, _set.ruleFilter],
                            value   : Asc.c_oAscSortOptions.Ascending
                        }),
                        me.mnuitemSortZA = new Common.UI.MenuItem({
                            caption : me.txtSortZA,
                            iconCls : 'mnu-sort-desc',
                            lock    : [_set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.coAuth, _set.ruleFilter],
                            value   : Asc.c_oAscSortOptions.Descending
                        }),
                        me.mnuitemAutoFilter = new Common.UI.MenuItem({
                            caption : me.txtFilter,
                            iconCls : 'mnu-filter-add',
                            checkable: true,
                            lock    : [_set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.coAuth, _set.ruleFilter],
                            value   : 'set-filter'
                        }),
                        me.mnuitemClearFilter = new Common.UI.MenuItem({
                            caption : me.txtClearFilter,
                            iconCls : 'mnu-filter-clear',
                            lock    : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.coAuth, _set.ruleDelFilter],
                            value   : 'clear-filter'
                        })
                        /*,{
                            caption : me.txtTableTemplate,
                            iconCls : 'mnu-filter-clear',
                            menu        : new Common.UI.Menu({
                                menuAlign: 'tl-tr',
                                items: [
                                    { template: _.template('<div id="id-toolbar-short-menu-table-templates" style="width: 288px; height: 300px; margin: 0px 4px;"></div>') }
                                ]
                            })
                        } */
                    ]
                })
            });

            me.lockControls = [
                me.cmbFontName, me.cmbFontSize, me.btnIncFontSize, me.btnDecFontSize, me.btnBold,
                me.btnItalic, me.btnUnderline, me.btnTextColor, me.btnHorizontalAlign, me.btnAlignLeft,
                me.btnAlignCenter,me.btnAlignRight,me.btnAlignJust, me.btnVerticalAlign, me.btnAlignTop,
                me.btnAlignMiddle, me.btnAlignBottom, me.btnWrap, me.btnTextOrient, me.btnBackColor,
                me.btnMerge, me.btnInsertFormula, me.btnNamedRange, me.btnIncDecimal, me.btnInsertShape, me.btnInsertEquation,
                me.btnInsertText, me.btnSortUp, me.btnSortDown, me.btnSetAutofilter, me.btnClearAutofilter, me.btnTableTemplate,
                me.btnPercentStyle, me.btnCurrencyStyle, me.btnDecDecimal, me.btnAddCell, me.btnDeleteCell,
                me.cmbNumberFormat, me.btnBorders, me.btnInsertImage, me.btnInsertHyperlink,
                me.btnInsertChart, me.btnColorSchemas,
                me.btnAutofilter, me.btnCopy, me.btnPaste, me.btnSettings, me.listStyles, me.btnPrint, me.btnShowMode,
                /*me.btnSave, */me.btnClearStyle, me.btnCopyStyle
            ];

            /** coauthoring begin **/
            var hidetip = Common.localStorage.getItem("sse-hide-synch");
            me.showSynchTip = !(hidetip && parseInt(hidetip) == 1);
            me.needShowSynchTip = false;
            /** coauthoring end **/

            var _temp_array = [me.cmbFontName, me.cmbFontSize, me.btnAlignLeft,me.btnAlignCenter,me.btnAlignRight,me.btnAlignJust,me.btnAlignTop,
                                me.btnAlignMiddle, me.btnAlignBottom, me.btnHorizontalAlign, me.btnVerticalAlign,
                                me.btnInsertImage, me.btnInsertText, me.btnInsertShape, me.btnInsertEquation, me.btnIncFontSize, me.btnDecFontSize,
                                me.btnBold, me.btnItalic, me.btnUnderline, me.btnTextColor, me.btnBackColor,
                                me.btnInsertHyperlink, me.btnBorders, me.btnTextOrient, me.btnPercentStyle, me.btnCurrencyStyle, me.btnColorSchemas,
                                me.btnSettings, me.btnInsertFormula, me.btnNamedRange, me.btnDecDecimal, me.btnIncDecimal, me.cmbNumberFormat, me.btnWrap,
                                me.btnInsertChart, me.btnMerge, me.btnAddCell, me.btnDeleteCell, me.btnShowMode, me.btnPrint,
                                me.btnAutofilter, me.btnSortUp, me.btnSortDown, me.btnTableTemplate, me.btnSetAutofilter, me.btnClearAutofilter,
                                me.btnSave, me.btnClearStyle, me.btnCopyStyle, me.btnCopy, me.btnPaste];

            // Enable none paragraph components
            _.each(_temp_array, function(cmp) {
                if (cmp && _.isFunction(cmp.setDisabled))
                    cmp.setDisabled(true);
            });

            return this;
        },

        lockToolbar: function(causes, lock, opts) {
            !opts && (opts = {});

            var controls = opts.array || this.lockControls;
            opts.merge && (controls = _.union(this.lockControls,controls));

            function doLock(cmp, cause) {
                if ( _.contains(cmp.options.lock, cause) ) {
                    var index = cmp.keepState.indexOf(cause);
                    if (lock) {
                        if (index < 0) {
                            cmp.keepState.push(cause);
                        }
                    } else {
                        if (!(index < 0)) {
                            cmp.keepState.splice(index, 1);
                        }
                    }
                }
            }

            _.each(controls, function(item) {
                if (_.isFunction(item.setDisabled)) {
                    !item.keepState && (item.keepState = []);
                    if (opts.clear && opts.clear.length > 0 && item.keepState.length > 0) {
                        item.keepState = _.difference(item.keepState, opts.clear);
                    }

                    _.isArray(causes) ? _.each(causes, function(c) {doLock(item, c)}) : doLock(item, causes);

                    if (!(item.keepState.length > 0)) {
                        item.isDisabled() && item.setDisabled(false);
                    } else {
                        !item.isDisabled() && item.setDisabled(true);
                    }
                }
            });
        },

        render: function (mode) {
            var me = this,
                el = $(this.el);

            /**
             * Render UI layout
             */

            var isCompactView = JSON.parse(Common.localStorage.getItem('sse-toolbar-compact'));
            isCompactView = !!(isCompactView!==null && parseInt(isCompactView) == 1 || isCompactView === null && mode.customization && mode.customization.compactToolbar);

            this.trigger('render:before', this);

            el.html(this.template({
                isEditDiagram: mode.isEditDiagram,
                isEditMailMerge: mode.isEditMailMerge,
                isCompactView: isCompactView
            }));

            me.rendererComponents(mode.isEditDiagram ? 'diagram' : (mode.isEditMailMerge ? 'merge' : isCompactView ? 'short' : 'full'));

            this.trigger('render:after', this);

            return this;
        },

        rendererComponents: function(mode) {
            var replacePlacholder = function(id, cmp) {
                var placeholderEl = $(id),
                    placeholderDom = placeholderEl.get(0);

                if (placeholderDom) {
                    if (cmp.rendered) {
                        cmp.el = document.getElementById(cmp.id);
                        if (cmp.el) placeholderDom.appendChild(document.getElementById(cmp.id));
                    } else {
                        cmp.render(placeholderEl);
                    }
                }
            };

            replacePlacholder('#id-toolbar-' + mode + '-placeholder-field-fontname',     this.cmbFontName);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-field-fontsize',     this.cmbFontSize);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-newdocument',    this.btnNewDocument);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-opendocument',   this.btnOpenDocument);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-print',          this.btnPrint);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-save',           this.btnSave);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-undo',           this.btnUndo);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-redo',           this.btnRedo);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-copy',           this.btnCopy);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-paste',          this.btnPaste);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-incfont',        this.btnIncFontSize);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-decfont',        this.btnDecFontSize);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-bold',           this.btnBold);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-italic',         this.btnItalic);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-underline',      this.btnUnderline);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-fontcolor',      this.btnTextColor);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-fillparag',      this.btnBackColor);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-borders',        this.btnBorders);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-align-left',     this.btnAlignLeft);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-align-center',   this.btnAlignCenter);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-align-right',    this.btnAlignRight);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-align-just',     this.btnAlignJust);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-merge',          this.btnMerge);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-top',            this.btnAlignTop);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-middle',         this.btnAlignMiddle);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-bottom',         this.btnAlignBottom);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-wrap',           this.btnWrap);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-text-orient',    this.btnTextOrient);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-insertimage',    this.btnInsertImage);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-inserthyperlink',this.btnInsertHyperlink);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-insertshape',    this.btnInsertShape);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-text',           this.btnInsertText);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-insertequation',  this.btnInsertEquation);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-sortdesc',       this.btnSortDown);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-sortasc',        this.btnSortUp);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-setfilter',      this.btnSetAutofilter);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-clear-filter',   this.btnClearAutofilter);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-table-tpl',      this.btnTableTemplate);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-format',         this.cmbNumberFormat);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-percents',       this.btnPercentStyle);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-currency',       this.btnCurrencyStyle);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-digit-dec',      this.btnDecDecimal);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-digit-inc',      this.btnIncDecimal);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-formula',        this.btnInsertFormula);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-named-range',    this.btnNamedRange);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-clear',          this.btnClearStyle);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-copystyle',      this.btnCopyStyle);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-cell-ins',       this.btnAddCell);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-cell-del',       this.btnDeleteCell);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-colorschemas',   this.btnColorSchemas);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-hidebars',       this.btnShowMode);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-settings',       this.btnSettings);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-search',         this.btnSearch);
            replacePlacholder('#id-toolbar-' + mode + '-placeholder-btn-insertchart',    this.btnInsertChart);
            replacePlacholder('#id-toolbar-diagram-placeholder-btn-chart',               this.btnEditChart);
            replacePlacholder('#id-toolbar-short-placeholder-btn-halign',                this.btnHorizontalAlign);
            replacePlacholder('#id-toolbar-short-placeholder-btn-valign',                this.btnVerticalAlign);
            replacePlacholder('#id-toolbar-short-placeholder-btn-filter',                this.btnAutofilter);
            replacePlacholder('#id-toolbar-full-placeholder-field-styles',               this.listStyles);

        },

        createDelayedElements: function() {
            var me = this;
            
            // set hints
            this.btnNewDocument.updateHint(this.tipNewDocument);
            this.btnOpenDocument.updateHint(this.tipOpenDocument);
            this.btnPrint.updateHint(this.tipPrint + Common.Utils.String.platformKey('Ctrl+P'));
            this.btnSave.updateHint(this.btnSaveTip);
            this.btnCopy.updateHint(this.tipCopy + Common.Utils.String.platformKey('Ctrl+C'));
            this.btnPaste.updateHint(this.tipPaste + Common.Utils.String.platformKey('Ctrl+V'));
            this.btnUndo.updateHint(this.tipUndo + Common.Utils.String.platformKey('Ctrl+Z'));
            this.btnRedo.updateHint(this.tipRedo + Common.Utils.String.platformKey('Ctrl+Y'));
            this.btnIncFontSize.updateHint(this.tipIncFont + Common.Utils.String.platformKey('Ctrl+]'));
            this.btnDecFontSize.updateHint(this.tipDecFont + Common.Utils.String.platformKey('Ctrl+['));
            this.btnBold.updateHint(this.textBold + Common.Utils.String.platformKey('Ctrl+B'));
            this.btnItalic.updateHint(this.textItalic + Common.Utils.String.platformKey('Ctrl+I'));
            this.btnUnderline.updateHint(this.textUnderline + Common.Utils.String.platformKey('Ctrl+U'));
            this.btnTextColor.updateHint(this.tipFontColor);
            this.btnBackColor.updateHint(this.tipPrColor);
            this.btnBorders.updateHint(this.tipBorders);
            this.btnAlignLeft.updateHint(this.tipAlignLeft);
            this.btnAlignCenter.updateHint(this.tipAlignCenter);
            this.btnAlignRight.updateHint(this.tipAlignRight);
            this.btnAlignJust.updateHint(this.tipAlignJust);
            this.btnMerge.updateHint(this.tipMerge);
            this.btnAlignTop.updateHint(this.tipAlignTop);
            this.btnAlignMiddle.updateHint(this.tipAlignMiddle);
            this.btnAlignBottom.updateHint(this.tipAlignBottom);
            this.btnWrap.updateHint(this.tipWrap);
            this.btnTextOrient.updateHint(this.tipTextOrientation);
            this.btnInsertImage.updateHint(this.tipInsertImage);
            this.btnInsertChart.updateHint(this.tipInsertChartSpark);
            this.btnInsertText.updateHint(this.tipInsertText);
            this.btnInsertHyperlink.updateHint(this.tipInsertHyperlink + Common.Utils.String.platformKey('Ctrl+K'));
            this.btnInsertShape.updateHint(this.tipInsertShape);
            this.btnInsertEquation.updateHint(this.tipInsertEquation);
            this.btnSortDown.updateHint(this.txtSortAZ);
            this.btnSortUp.updateHint(this.txtSortZA);
            this.btnSetAutofilter.updateHint(this.txtFilter + ' (Ctrl+Shift+L)');
            this.btnClearAutofilter.updateHint(this.txtClearFilter);
            this.btnSearch.updateHint(this.txtSearch);
            this.btnTableTemplate.updateHint(this.txtTableTemplate);
            this.btnPercentStyle.updateHint(this.tipDigStylePercent);
            this.btnCurrencyStyle.updateHint(this.tipDigStyleAccounting);
            this.btnDecDecimal.updateHint(this.tipDecDecimal);
            this.btnIncDecimal.updateHint(this.tipIncDecimal);
            this.btnInsertFormula.updateHint(this.txtFormula);
            this.btnNamedRange.updateHint(this.txtNamedRange);
            this.btnClearStyle.updateHint(this.tipClearStyle);
            this.btnCopyStyle.updateHint(this.tipCopyStyle);
            this.btnAddCell.updateHint(this.tipInsertOpt);
            this.btnDeleteCell.updateHint(this.tipDeleteOpt);
            this.btnColorSchemas.updateHint(this.tipColorSchemas);
            this.btnShowMode.updateHint(this.tipViewSettings);
            this.btnSettings.updateHint(this.tipAdvSettings);
            this.btnHorizontalAlign.updateHint(this.tipHAligh);
            this.btnVerticalAlign.updateHint(this.tipVAligh);
            this.btnAutofilter.updateHint(this.tipAutofilter);

            // set menus
            if (this.btnShowMode.rendered) {
                this.btnShowMode.setMenu(new Common.UI.Menu({
                    items: [
                        this.mnuitemCompactToolbar = new Common.UI.MenuItem({
                            caption     : this.textCompactToolbar,
                            checkable   : true,
                            value       : 'compact'
                        }),
                        this.mnuitemHideTitleBar = new Common.UI.MenuItem({
                            caption     : this.textHideTBar,
                            checkable   : true,
                            value       : 'title'
                        }),
                        this.mnuitemHideFormulaBar = new Common.UI.MenuItem({
                            caption     : this.textHideFBar,
                            checkable   : true,
                            value       : 'formula'
                        }),
                        {caption: '--'},
                        this.mnuitemHideHeadings = new Common.UI.MenuItem({
                            caption     : this.textHideHeadings,
                            checkable   : true,
                            checked     : this.mnuitemHideHeadings.isChecked(),
                            value       : 'headings'
                        }),
                        this.mnuitemHideGridlines = new Common.UI.MenuItem({
                            caption     : this.textHideGridlines,
                            checkable   : true,
                            checked     : this.mnuitemHideGridlines.isChecked(),
                            value       : 'gridlines'
                        }),
                        {caption: '--'},
                        this.mnuitemFreezePanes = new Common.UI.MenuItem({
                            caption     : this.textFreezePanes,
                            checkable   : true,
                            checked     : this.mnuitemFreezePanes.isChecked(),
                            value       : 'freezepanes'
                        }),
                        {caption: '--'},
                        this.mnuZoom = new Common.UI.MenuItem({
                            template: _.template([
                                '<div id="id-toolbar-menu-zoom" class="menu-zoom" style="height: 25px;" ',
                                    '<% if(!_.isUndefined(options.stopPropagation)) { %>',
                                        'data-stopPropagation="true"',
                                    '<% } %>', '>',
                                    '<label class="title">' + this.textZoom + '</label>',
                                    '<button id="id-menu-zoom-in" type="button" style="float:right; margin: 2px 5px 0 0;" class="btn small btn-toolbar"><span class="btn-icon btn-zoomin">&nbsp;</span></button>',
                                    '<label class="zoom"><%= options.value %>%</label>',
                                    '<button id="id-menu-zoom-out" type="button" style="float:right; margin-top: 2px;" class="btn small btn-toolbar"><span class="btn-icon btn-zoomout">&nbsp;</span></button>',
                                '</div>'
                            ].join('')),
                            stopPropagation: true,
                            value: this.mnuZoom.options.value
                        })
                    ]
                }));

                this.mnuZoomOut = new Common.UI.Button({
                    el  : $('#id-menu-zoom-out'),
                    cls : 'btn-toolbar'
                });
                this.mnuZoomIn = new Common.UI.Button({
                    el  : $('#id-menu-zoom-in'),
                    cls : 'btn-toolbar'
                });

                var options = {};
                JSON.parse(Common.localStorage.getItem('sse-hidden-title'))     && (options.title = true);
                JSON.parse(Common.localStorage.getItem('sse-hidden-formula'))   && (options.formula = true);
    //            JSON.parse(Common.localStorage.getItem('sse-hidden-headings'))  && (options.headings = true);
                var isCompactView = JSON.parse(Common.localStorage.getItem('sse-toolbar-compact'));
                isCompactView = !!(isCompactView!==null && parseInt(isCompactView) == 1 || isCompactView === null && this.mode.customization && this.mode.customization.compactToolbar);

                this.mnuitemCompactToolbar.setChecked(isCompactView);
                this.mnuitemHideTitleBar.setChecked(!!options.title);
                this.mnuitemHideFormulaBar.setChecked(!!options.formula);
                this.mnuitemHideHeadings.setChecked(!!options.headings);

                if (this.mode.isDesktopApp || this.mode.canBrandingExt && this.mode.customization && this.mode.customization.header===false)
                    this.mnuitemHideTitleBar.hide();
            }
            
            if (this.btnBorders.rendered) {
                this.btnBorders.setMenu( new Common.UI.Menu({
                    items: [
                        {
                            caption     : this.textOutBorders,
                            iconCls     : 'mnu-border-out',
                            icls        : 'btn-border-out',
                            borderId    : 'outer'
                        },
                        {
                            caption     : this.textAllBorders,
                            iconCls     : 'mnu-border-all',
                            icls        : 'btn-border-all',
                            borderId    : 'all'
                        },
                        {
                            caption     : this.textTopBorders,
                            iconCls     : 'mnu-border-top',
                            icls        : 'btn-border-top',
                            borderId    : Asc.c_oAscBorderOptions.Top
                        },
                        {
                            caption     : this.textBottomBorders,
                            iconCls     : 'mnu-border-bottom',
                            icls        : 'btn-border-bottom',
                            borderId    : Asc.c_oAscBorderOptions.Bottom
                        },
                        {
                            caption     : this.textLeftBorders,
                            iconCls     : 'mnu-border-left',
                            icls        : 'btn-border-left',
                            borderId    : Asc.c_oAscBorderOptions.Left
                        },
                        {
                            caption     : this.textRightBorders,
                            iconCls     : 'mnu-border-right',
                            icls        : 'btn-border-right',
                            borderId    : Asc.c_oAscBorderOptions.Right
                        },
                        {
                            caption     : this.textNoBorders,
                            iconCls     : 'mnu-border-no',
                            icls        : 'btn-border-no',
                            borderId    : 'none'
                        },
                        {caption: '--'},
                        {
                            caption     : this.textInsideBorders,
                            iconCls     : 'mnu-border-center',
                            icls        : 'btn-border-center',
                            borderId    : 'inner'
                        },
                        {
                            caption     : this.textCenterBorders,
                            iconCls     : 'mnu-border-vmiddle',
                            icls        : 'btn-border-vmiddle',
                            borderId    : Asc.c_oAscBorderOptions.InnerV
                        },
                        {
                            caption     : this.textMiddleBorders,
                            iconCls     : 'mnu-border-hmiddle',
                            icls        : 'btn-border-hmiddle',
                            borderId    : Asc.c_oAscBorderOptions.InnerH
                        },
                        {
                            caption     : this.textDiagUpBorder,
                            iconCls     : 'mnu-border-diagup',
                            icls        : 'btn-border-diagup',
                            borderId    : Asc.c_oAscBorderOptions.DiagU
                        },
                        {
                            caption     : this.textDiagDownBorder,
                            iconCls     : 'mnu-border-diagdown',
                            icls        : 'btn-border-diagdown',
                            borderId    : Asc.c_oAscBorderOptions.DiagD
                        },
                        {caption: '--'},
                        {
                            id          : 'id-toolbar-mnu-item-border-width',
                            caption     : this.textBordersStyle,
                            iconCls     : 'mnu-icon-item mnu-border-width',
                            template    : _.template('<a id="<%= id %>" tabindex="-1" type="menuitem"><span class="menu-item-icon" style="background-image: none; width: 11px; height: 11px; margin: 2px 7px 0 -9px;"></span><%= caption %></a>'),
                            menu        : (function(){
                                var itemTemplate = _.template('<a id="<%= id %>" tabindex="-1" type="menuitem"><div class="border-size-item" style="background-position: 0 -<%= options.offsety %>px;"></div></a>');

                                me.mnuBorderWidth = new Common.UI.Menu({
                                    style       : 'min-width: 100px;',
                                    menuAlign   : 'tl-tr',
                                    id          : 'toolbar-menu-borders-width',
                                    items: [
                                        { template: itemTemplate, stopPropagation: true, checkable: true, toggleGroup: 'border-width', value: Asc.c_oAscBorderStyles.Thin ,   offsety: 0, checked:true},
                                        { template: itemTemplate, stopPropagation: true, checkable: true, toggleGroup: 'border-width', value: Asc.c_oAscBorderStyles.Hair,   offsety: 20},
                                        { template: itemTemplate, stopPropagation: true, checkable: true, toggleGroup: 'border-width', value: Asc.c_oAscBorderStyles.Dotted,   offsety: 40},
                                        { template: itemTemplate, stopPropagation: true, checkable: true, toggleGroup: 'border-width', value: Asc.c_oAscBorderStyles.Dashed,   offsety: 60},
                                        { template: itemTemplate, stopPropagation: true, checkable: true, toggleGroup: 'border-width', value: Asc.c_oAscBorderStyles.DashDot,   offsety: 80},
                                        { template: itemTemplate, stopPropagation: true, checkable: true, toggleGroup: 'border-width', value: Asc.c_oAscBorderStyles.DashDotDot,   offsety: 100},
                                        { template: itemTemplate, stopPropagation: true, checkable: true, toggleGroup: 'border-width', value: Asc.c_oAscBorderStyles.Medium, offsety: 120},
                                        { template: itemTemplate, stopPropagation: true, checkable: true, toggleGroup: 'border-width', value: Asc.c_oAscBorderStyles.MediumDashed,  offsety: 140},
                                        { template: itemTemplate, stopPropagation: true, checkable: true, toggleGroup: 'border-width', value: Asc.c_oAscBorderStyles.MediumDashDot,  offsety: 160},
                                        { template: itemTemplate, stopPropagation: true, checkable: true, toggleGroup: 'border-width', value: Asc.c_oAscBorderStyles.MediumDashDotDot,  offsety: 180},
                                        { template: itemTemplate, stopPropagation: true, checkable: true, toggleGroup: 'border-width', value: Asc.c_oAscBorderStyles.Thick,  offsety: 200}
                                    ]
                                });

                                return me.mnuBorderWidth;
                            })()
                        },
                        this.mnuBorderColor = new Common.UI.MenuItem({
                            id          : 'id-toolbar-mnu-item-border-color',
                            caption     : this.textBordersColor,
                            iconCls     : 'mnu-icon-item mnu-border-color',
                            template    : _.template('<a id="<%= id %>"tabindex="-1" type="menuitem"><span class="menu-item-icon" style="background-image: none; width: 11px; height: 11px; margin: 2px 7px 0 -9px; border-style: solid; border-width: 3px; border-color: #000;"></span><%= caption %></a>'),
                            menu        : new Common.UI.Menu({
                                menuAlign   : 'tl-tr',
                                items       : [
                                    { template: _.template('<div id="id-toolbar-menu-bordercolor" style="width: 169px; height: 220px; margin: 10px;"></div>'), stopPropagation: true },
                                    { template: _.template('<a id="id-toolbar-menu-new-bordercolor" style="padding-left:12px;">' + this.textNewColor + '</a>'),  stopPropagation: true }
                                ]
                            })
                        })
                    ]
                }));

                var colorVal = $('<div class="btn-color-value-line"></div>');
                $('button:first-child', this.btnBorders.cmpEl).append(colorVal);
                colorVal.css('background-color', this.btnBorders.currentColor || 'transparent');

                this.mnuBorderColorPicker = new Common.UI.ThemeColorPalette({
                    el: $('#id-toolbar-menu-bordercolor')
                });
            }

            this.mnuInsertChartPicker = new Common.UI.DataView({
                el: $('#id-toolbar-menu-insertchart'),
                parentMenu: this.btnInsertChart.menu,
                showLast: false,
                restoreHeight: 539,
                groups: new Common.UI.DataViewGroupStore([
                    { id: 'menu-chart-group-bar',     caption: me.textColumn, headername: me.textCharts },
                    { id: 'menu-chart-group-line',    caption: me.textLine },
                    { id: 'menu-chart-group-pie',     caption: me.textPie },
                    { id: 'menu-chart-group-hbar',    caption: me.textBar },
                    { id: 'menu-chart-group-area',    caption: me.textArea, inline: true },
                    { id: 'menu-chart-group-scatter', caption: me.textPoint, inline: true },
                    { id: 'menu-chart-group-stock',   caption: me.textStock, inline: true }
                    // { id: 'menu-chart-group-surface', caption: me.textSurface}
                    // ,{ id: 'menu-chart-group-sparkcolumn', inline: true, headername: me.textSparks },
                    // { id: 'menu-chart-group-sparkline',   inline: true },
                    // { id: 'menu-chart-group-sparkwin',    inline: true }
                ]),
                store: new Common.UI.DataViewStore([
                    { group: 'menu-chart-group-bar',     type: Asc.c_oAscChartTypeSettings.barNormal,          allowSelected: true, iconCls: 'column-normal', selected: true},
                    { group: 'menu-chart-group-bar',     type: Asc.c_oAscChartTypeSettings.barStacked,         allowSelected: true, iconCls: 'column-stack'},
                    { group: 'menu-chart-group-bar',     type: Asc.c_oAscChartTypeSettings.barStackedPer,      allowSelected: true, iconCls: 'column-pstack'},
                    { group: 'menu-chart-group-bar',     type: Asc.c_oAscChartTypeSettings.barNormal3d,        allowSelected: true, iconCls: 'column-3d-normal'},
                    { group: 'menu-chart-group-bar',     type: Asc.c_oAscChartTypeSettings.barStacked3d,       allowSelected: true, iconCls: 'column-3d-stack'},
                    { group: 'menu-chart-group-bar',     type: Asc.c_oAscChartTypeSettings.barStackedPer3d,    allowSelected: true, iconCls: 'column-3d-pstack'},
                    { group: 'menu-chart-group-bar',     type: Asc.c_oAscChartTypeSettings.barNormal3dPerspective,    allowSelected: true, iconCls: 'column-3d-normal-per'},
                    { group: 'menu-chart-group-line',    type: Asc.c_oAscChartTypeSettings.lineNormal,         allowSelected: true, iconCls: 'line-normal'},
                    { group: 'menu-chart-group-line',    type: Asc.c_oAscChartTypeSettings.lineStacked,        allowSelected: true, iconCls: 'line-stack'},
                    { group: 'menu-chart-group-line',    type: Asc.c_oAscChartTypeSettings.lineStackedPer,     allowSelected: true, iconCls: 'line-pstack'},
                    { group: 'menu-chart-group-line',    type: Asc.c_oAscChartTypeSettings.line3d,             allowSelected: true, iconCls: 'line-3d'},
                    { group: 'menu-chart-group-pie',     type: Asc.c_oAscChartTypeSettings.pie,                allowSelected: true, iconCls: 'pie-normal'},
                    { group: 'menu-chart-group-pie',     type: Asc.c_oAscChartTypeSettings.doughnut,           allowSelected: true, iconCls: 'pie-doughnut'},
                    { group: 'menu-chart-group-pie',     type: Asc.c_oAscChartTypeSettings.pie3d,              allowSelected: true, iconCls: 'pie-3d-normal'},
                    { group: 'menu-chart-group-hbar',    type: Asc.c_oAscChartTypeSettings.hBarNormal,         allowSelected: true, iconCls: 'bar-normal'},
                    { group: 'menu-chart-group-hbar',    type: Asc.c_oAscChartTypeSettings.hBarStacked,        allowSelected: true, iconCls: 'bar-stack'},
                    { group: 'menu-chart-group-hbar',    type: Asc.c_oAscChartTypeSettings.hBarStackedPer,     allowSelected: true, iconCls: 'bar-pstack'},
                    { group: 'menu-chart-group-hbar',    type: Asc.c_oAscChartTypeSettings.hBarNormal3d,       allowSelected: true, iconCls: 'bar-3d-normal'},
                    { group: 'menu-chart-group-hbar',    type: Asc.c_oAscChartTypeSettings.hBarStacked3d,      allowSelected: true, iconCls: 'bar-3d-stack'},
                    { group: 'menu-chart-group-hbar',    type: Asc.c_oAscChartTypeSettings.hBarStackedPer3d,   allowSelected: true, iconCls: 'bar-3d-pstack'},
                    { group: 'menu-chart-group-area',    type: Asc.c_oAscChartTypeSettings.areaNormal,         allowSelected: true, iconCls: 'area-normal'},
                    { group: 'menu-chart-group-area',    type: Asc.c_oAscChartTypeSettings.areaStacked,        allowSelected: true, iconCls: 'area-stack'},
                    { group: 'menu-chart-group-area',    type: Asc.c_oAscChartTypeSettings.areaStackedPer,     allowSelected: true, iconCls: 'area-pstack'},
                    { group: 'menu-chart-group-scatter', type: Asc.c_oAscChartTypeSettings.scatter,            allowSelected: true, iconCls: 'point-normal'},
                    { group: 'menu-chart-group-stock',   type: Asc.c_oAscChartTypeSettings.stock,              allowSelected: true, iconCls: 'stock-normal'}
                    // { group: 'menu-chart-group-surface', type: Asc.c_oAscChartTypeSettings.surfaceNormal,      allowSelected: true, iconCls: 'surface-normal'},
                    // { group: 'menu-chart-group-surface', type: Asc.c_oAscChartTypeSettings.surfaceWireframe,   allowSelected: true, iconCls: 'surface-wireframe'},
                    // { group: 'menu-chart-group-surface', type: Asc.c_oAscChartTypeSettings.contourNormal,      allowSelected: true, iconCls: 'contour-normal'},
                    // { group: 'menu-chart-group-surface', type: Asc.c_oAscChartTypeSettings.contourWireframe,   allowSelected: true, iconCls: 'contour-wireframe'}
                    // ,{ group: 'menu-chart-group-sparkcolumn',   type: Asc.c_oAscSparklineType.Column,    allowSelected: true, iconCls: 'spark-column', tip: me.textColumnSpark},
                    // { group: 'menu-chart-group-sparkline',     type: Asc.c_oAscSparklineType.Line,      allowSelected: true, iconCls: 'spark-line', tip: me.textLineSpark},
                    // { group: 'menu-chart-group-sparkwin',      type: Asc.c_oAscSparklineType.Stacked,   allowSelected: true, iconCls: 'spark-win', tip: me.textWinLossSpark}
                ]),
                itemTemplate: _.template('<div id="<%= id %>" class="item-chartlist <%= iconCls %>"></div>')
            });
        },

        setApi: function(api) {
            this.api = api;

            if (!this.mode.isEditMailMerge && !this.mode.isEditDiagram) {
                this.api.asc_registerCallback('asc_onCollaborativeChanges',  _.bind(this.onApiCollaborativeChanges, this));
                this.api.asc_registerCallback('asc_onSendThemeColorSchemes', _.bind(this.onApiSendThemeColorSchemes, this));
                this.api.asc_registerCallback('asc_onAuthParticipantsChanged', _.bind(this.onApiUsersChanged, this));
                this.api.asc_registerCallback('asc_onParticipantsChanged',     _.bind(this.onApiUsersChanged, this));
            }

            return this;
        },

        setMode: function(mode) {
            if (mode.isDisconnected) {
                this.lockToolbar( SSE.enumLock.lostConnect, true );
                this.lockToolbar( SSE.enumLock.lostConnect, true,
                    {array:[this.btnEditChart,this.btnUndo,this.btnRedo,this.btnOpenDocument,this.btnNewDocument,this.btnSave]} );
                this.lockToolbar(SSE.enumLock.cantPrint, !mode.canPrint || mode.disableDownload, {array: [this.btnPrint]});
            } else {
                this.mode = mode;

                if (!mode.nativeApp) {
                    var nativeBtnGroup = $('.toolbar-group-native');

                    if (nativeBtnGroup) {
                        nativeBtnGroup.hide();
                    }
                } 

                if (mode.isDesktopApp)
                    $('.toolbar-group-native').hide();

                this.lockToolbar(SSE.enumLock.cantPrint, !mode.canPrint, {array: [this.btnPrint]});
            }
        },

        onApiSendThemeColorSchemes: function(schemas) {
            var me = this;

            this.mnuColorSchema = this.btnColorSchemas.menu;

            if (this.mnuColorSchema && this.mnuColorSchema.items.length > 0) {
                _.each(this.mnuColorSchema.items, function(item) {
                    item.remove();
                });
            }

            if (this.mnuColorSchema == null) {
                this.mnuColorSchema = new Common.UI.Menu({maxHeight   : 600,
                    restoreHeight: 600
                }).on('show:before', function(mnu) {
                        this.scroller = new Common.UI.Scroller({
                        el: $(this.el).find('.dropdown-menu '),
                        useKeyboard: this.enableKeyEvents && !this.handleSelect,
                        minScrollbarLength  : 40
                    });
                });
            }

            this.mnuColorSchema.items = [];

            var itemTemplate = _.template([
                '<a id="<%= id %>" class="<%= options.cls %>" tabindex="-1" type="menuitem">',
                    '<span class="colors">',
                        '<% _.each(options.colors, function(color) { %>',
                            '<span class="color" style="background: <%= color %>;"></span>',
                        '<% }) %>',
                    '</span>',
                    '<span class="text"><%= caption %></span>',
                '</a>'
            ].join(''));

            _.each(schemas, function(schema, index) {
                var colors = schema.get_colors();
                var schemecolors = [];
                for (var j = 2; j < 7; j++) {
                    var clr = '#' + Common.Utils.ThemeColor.getHexColor(colors[j].get_r(), colors[j].get_g(), colors[j].get_b());
                    schemecolors.push(clr);
                }

                if (index == 21) {
                    this.mnuColorSchema.addItem({
                        caption : '--'
                    });
                } else {
                    this.mnuColorSchema.addItem({
                        template: itemTemplate,
                        cls     : 'color-schemas-menu',
                        colors  : schemecolors,
                        caption : (index < 21) ? (me.SchemeNames[index] || schema.get_name()) : schema.get_name(),
                        value   : index
                    });
                }
            }, this);
        },

        onApiCollaborativeChanges: function() {
            if (this._state.hasCollaborativeChanges) return;
            if (!this.btnSave.rendered) {
                this.needShowSynchTip = true;
                return;
            }

            this._state.hasCollaborativeChanges = true;
            var iconEl = $('.btn-icon', this.btnSave.cmpEl);
            iconEl.removeClass(this.btnSaveCls);
            iconEl.addClass('btn-synch');

            if (this.showSynchTip){
                this.btnSave.updateHint('');
                if (this.synchTooltip===undefined)
                    this.createSynchTip();

                this.synchTooltip.show();
            } else {
                this.btnSave.updateHint(this.tipSynchronize + Common.Utils.String.platformKey('Ctrl+S'));
            }

            this.btnSave.setDisabled(false);
            Common.Gateway.collaborativeChanges();
        },

        createSynchTip: function () {
            this.synchTooltip = new Common.UI.SynchronizeTip({
                target    : $('#id-toolbar-btn-save')
            });
            this.synchTooltip.on('dontshowclick', function() {
                this.showSynchTip = false;
                this.synchTooltip.hide();
                this.btnSave.updateHint(this.tipSynchronize + Common.Utils.String.platformKey('Ctrl+S'));
                Common.localStorage.setItem('sse-hide-synch', 1);
            }, this);
            this.synchTooltip.on('closeclick', function() {
                this.synchTooltip.hide();
                this.btnSave.updateHint(this.tipSynchronize + Common.Utils.String.platformKey('Ctrl+S'));
            }, this);
        },

        synchronizeChanges: function() {
            if (this.btnSave.rendered) {
                var iconEl = $('.btn-icon', this.btnSave.cmpEl);

                if (iconEl.hasClass('btn-synch')) {
                    iconEl.removeClass('btn-synch');
                    iconEl.addClass(this.btnSaveCls);
                    if (this.synchTooltip)
                        this.synchTooltip.hide();
                    this.btnSave.updateHint(this.btnSaveTip);
                    this.btnSave.setDisabled(!this.mode.forcesave);
                    this._state.hasCollaborativeChanges = false;
                }
            }
        },

        onApiUsersChanged: function(users) {
            var editusers = [];
            _.each(users, function(item){
                if (!item.asc_getView())
                    editusers.push(item);
            });

            var length = _.size(editusers);
            var cls = (length>1) ? 'btn-save-coauth' : 'btn-save';
            if (cls !== this.btnSaveCls && this.btnSave.rendered) {
                this.btnSaveTip = ((length>1) ? this.tipSaveCoauth : this.tipSave )+ Common.Utils.String.platformKey('Ctrl+S');

                var iconEl = $('.btn-icon', this.btnSave.cmpEl);
                if (!iconEl.hasClass('btn-synch')) {
                    iconEl.removeClass(this.btnSaveCls);
                    iconEl.addClass(cls);
                    this.btnSave.updateHint(this.btnSaveTip);
                }
                this.btnSaveCls = cls;
            }
        },

        textBold:           'Bold',
        textItalic:         'Italic',
        textUnderline:      'Underline',
        tipFontName:        'Font Name',
        tipFontSize:        'Font Size',
        tipCellStyle:       'Cell Style',
        tipCopy:            'Copy',
        tipPaste:           'Paste',
        tipUndo:            'Undo',
        tipRedo:            'Redo',
        tipPrint:           'Print',
        tipSave:            'Save',
        tipFontColor:       'Font color',
        tipPrColor:         'Background color',
        tipClearStyle:      'Clear',
        tipCopyStyle:       'Copy Style',
        tipBack:            'Back',
        tipHAligh:          'Horizontal Align',
        tipVAligh:          'Vertical Align',
        tipAlignLeft:       'Align Left',
        tipAlignRight:      'Align Right',
        tipAlignCenter:     'Align Center',
        tipAlignJust:       'Justified',
        textAlignTop:       'Align text to the top',
        textAlignMiddle:    'Align text to the middle',
        textAlignBottom:    'Align text to the bottom',
        tipNumFormat:       'Number Format',
        txtNumber:          'Number',
        txtInteger:         'Integer',
        txtGeneral:         'General',
        txtCustom:          'Custom',
        txtCurrency:        'Currency',
        txtDollar:          '$ Dollar',
        txtEuro:            '€ Euro',
        txtRouble:          '₽ Rouble',
        txtPound:           '£ Pound',
        txtYen:             '¥ Yen',
//    txtFranc:           'CHF Swiss franc',
        txtAccounting:      'Accounting',
        txtDate:            'Date',
        txtTime:            'Time',
        txtDateTime:        'Date & Time',
        txtPercentage:      'Percentage',
        txtFraction:        'Fraction',
        txtScientific:      'Scientific',
        txtText:            'Text',
//    txtSpecial:         'Special',
        tipBorders:         'Borders',
        textOutBorders:     'Outside Borders',
        textAllBorders:     'All Borders',
        textTopBorders:     'Top Borders',
        textBottomBorders:  'Bottom Borders',
        textLeftBorders:    'Left Borders',
        textRightBorders:   'Right Borders',
        textNoBorders:      'No Borders',
        textInsideBorders:  'Inside Borders',
        textMiddleBorders:  'Inside Horizontal Borders',
        textCenterBorders:  'Inside Vertical Borders',
        textDiagDownBorder: 'Diagonal Down Border',
        textDiagUpBorder:   'Diagonal Up Border',
        tipWrap:            'Wrap Text',
        txtClearAll:        'All',
        txtClearText:       'Text',
        txtClearFormat:     'Format',
        txtClearFormula:    'Formula',
        txtClearHyper:      'Hyperlink',
        txtClearComments:   'Comments',
        tipMerge:           'Merge',
        txtMergeCenter:     'Merge Center',
        txtMergeAcross:     'Merge Across',
        txtMergeCells:      'Merge Cells',
        txtUnmerge:         'Unmerge Cells',
        tipIncDecimal:      'Increase Decimal',
        tipDecDecimal:      'Decrease Decimal',
        tipAutofilter:      'Set Autofilter',
        tipInsertImage:     'Insert Picture',
        tipInsertHyperlink: 'Add Hyperlink',
        tipSynchronize:     'The document has been changed by another user. Please click to save your changes and reload the updates.',
        tipIncFont:         'Increment font size',
        tipDecFont:         'Decrement font size',
        tipInsertText:      'Insert Text',
        tipInsertShape:     'Insert Autoshape',
        tipDigStylePercent: 'Percent Style',
//        tipDigStyleCurrency:'Currency Style',
        tipDigStyleAccounting: 'Accounting Style',
        tipViewSettings:    'View Settings',
        tipAdvSettings:     'Advanced Settings',
        tipTextOrientation: 'Orientation',
        tipInsertOpt:       'Insert Cells',
        tipDeleteOpt:       'Delete Cells',
        tipAlignTop:        'Align Top',
        tipAlignMiddle:     'Align Middle',
        tipAlignBottom:     'Align Bottom',
        textBordersStyle:   'Border Style',
        textBordersColor:   'Borders Color',
        textAlignLeft:      'Left align text',
        textAlignRight:     'Right align text',
        textAlignCenter:    'Center text',
        textAlignJust:      'Justify',
        txtSort:            'Sort',
//    txtAscending:       'Ascending',
//    txtDescending:      'Descending',
        txtFormula:         'Insert Function',
        txtNoBorders:       'No borders',
        txtAdditional:      'Additional',
        mniImageFromFile:   'Picture from file',
        mniImageFromUrl:    'Picture from url',
        textNewColor:       'Add New Custom Color',
        tipInsertChart:     'Insert Chart',
        tipEditChart:       'Edit Chart',
        textPrint:          'Print',
        textPrintOptions:   'Print Options',
        tipColorSchemas:    'Change Color Scheme',
        tipNewDocument:     'New Document',
        tipOpenDocument:    'Open Document',
        txtSortAZ:          'Sort A to Z',
        txtSortZA:          'Sort Z to A',
        txtFilter:          'Filter',
        txtTableTemplate:   'Format As Table Template',
        textHorizontal:     'Horizontal Text',
        textCounterCw:      'Angle Counterclockwise',
        textClockwise:      'Angle Clockwise',
        textRotateUp:       'Rotate Text Up',
        textRotateDown:     'Rotate Text Down',
        textInsRight:       'Shift Cells Right',
        textInsDown:        'Shift Cells Down',
        textEntireRow:      'Entire Row',
        textEntireCol:      'Entire Column',
        textDelLeft:        'Shift Cells Left',
        textDelUp:          'Shift Cells Up',
        textZoom:           'Zoom',
        textCompactToolbar: 'Compact Toolbar',
        textHideTBar:       'Hide Title Bar',
        textHideFBar:       'Hide Formula Bar',
        textHideHeadings:   'Hide Headings',
        textHideGridlines:  'Hide Gridlines',
        textFreezePanes:    'Freeze Panes',
        txtScheme1:         'Office',
        txtScheme2:         'Grayscale',
        txtScheme3:         'Apex',
        txtScheme4:         'Aspect',
        txtScheme5:         'Civic',
        txtScheme6:         'Concourse',
        txtScheme7:         'Equity',
        txtScheme8:         'Flow',
        txtScheme9:         'Foundry',
        txtScheme10:        'Median',
        txtScheme11:        'Metro',
        txtScheme12:        'Module',
        txtScheme13:        'Opulent',
        txtScheme14:        'Oriel',
        txtScheme15:        'Origin',
        txtScheme16:        'Paper',
        txtScheme17:        'Solstice',
        txtScheme18:        'Technic',
        txtScheme19:        'Trek',
        txtScheme20:        'Urban',
        txtScheme21:        'Verve',
        txtClearFilter:     'Clear Filter',
        tipSaveCoauth: 'Save your changes for the other users to see them.',
        txtSearch: 'Search',
        txtNamedRange:      'Named Ranges',
        txtNewRange:        'Define Name',
        txtManageRange:     'Name manager',
        txtPasteRange:      'Paste name',
        textInsText:        'Insert text box',
        textInsTextArt:     'Insert Text Art',
        textInsCharts:      'Charts',
        textLine:           'Line',
        textColumn:         'Column',
        textBar:            'Bar',
        textArea:           'Area',
        textPie:            'Pie',
        textPoint:          'XY (Scatter)',
        textStock:          'Stock',
        textLineSpark:      'Line',
        textColumnSpark:    'Column',
        textWinLossSpark:   'Win/Loss',
        tipInsertEquation:  'Insert Equation',
        textCharts:         'Charts',
        textSparks:         'Sparklines',
        tipInsertChartSpark: 'Insert Chart or Sparkline',
        textMoreFormats: 'More formats',
        textSurface: 'Surface'
    }, SSE.Views.Toolbar || {}));
});