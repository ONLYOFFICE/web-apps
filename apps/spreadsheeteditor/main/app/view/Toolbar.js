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
 *  Toolbar.js
 *
 *  Created by Alexander Yuzhin on 3/31/14
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'backbone',
    'text!spreadsheeteditor/main/app/template/Toolbar.template',
    'text!spreadsheeteditor/main/app/template/ToolbarAnother.template',
    'text!spreadsheeteditor/main/app/template/ToolbarView.template',
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
    ,'common/main/lib/component/SynchronizeTip'
    ,'common/main/lib/component/Mixtbar'
], function (Backbone, template, simple, template_view) { 'use strict';

    SSE.enumLock = {
        editCell:       'cell-editing',
        editFormula:    'is-formula',
        editText:       'is-text',
        editPivot:      'is-pivot',
        selImage:       'sel-image',
        selShape:       'sel-shape',
        selShapeText:   'sel-shape-txt',
        selChart:       'sel-chart',
        selChartText:   'sel-chart-txt',
        selRange:       'sel-range',
        selRangeEdit:   'sel-range-edit',
        lostConnect:    'disconnect',
        coAuth:         'co-auth',
        coAuthText:     'co-auth-text',
        ruleMerge:      'rule-btn-merge',
        ruleFilter:     'rule-filter',
        ruleDelFilter:  'rule-clear-filter',
        menuFileOpen:   'menu-file-open',
        cantPrint:      'cant-print',
        multiselect:    'is-multiselect',
        cantHyperlink:  'cant-hyperlink',
        commentLock:    'can-comment',
        cantModifyFilter: 'cant-filter',
        disableOnStart: 'on-start',
        cantGroup:      'cant-group',
        cantGroupUngroup: 'cant-group-ungroup',
        docPropsLock:   'doc-props-lock',
        printAreaLock:  'print-area-lock',
        namedRangeLock: 'named-range-lock',
        multiselectCols:'is-multiselect-cols',
        headerLock: 'header-lock',
        sheetLock: 'sheet-lock',
        noPivot: 'no-pivot',
        noSubitems: 'no-subitems',
        noSlicerSource: 'no-slicer-source',
        selSlicer: 'sel-slicer',
        cantSort: 'cant-sort',
        pivotLock: 'pivot-lock',
        tableHasSlicer: 'table-has-slicer',
        sheetView: 'sheet-view'
    };

    SSE.Views.Toolbar =  Common.UI.Mixtbar.extend(_.extend({
        el: '#toolbar',

        // Compile our stats template
        template: _.template(template),

        // Delegated events for creating new items, and clearing completed ones.
        events: {
            //
        },

        initialize: function () {
            var me = this,
                options = {};

            me.SchemeNames = [me.txtScheme22,
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

            return this;
        },

        lockToolbar: function(causes, lock, opts) {
            Common.Utils.lockControls(causes, lock, opts, this.lockControls);
        },

        applyLayout: function (config) {
            var me = this;

            function dummyCmp() {
                return {
                    isDummy : true,
                    on      : function() {}
                }
            }

            var _set = SSE.enumLock;

            me.btnCopy = new Common.UI.Button({
                id          : 'id-toolbar-btn-copy',
                cls         : 'btn-toolbar',
                iconCls     : 'toolbar__icon btn-copy'
            });

            me.btnPaste = new Common.UI.Button({
                id          : 'id-toolbar-btn-paste',
                cls         : 'btn-toolbar',
                iconCls     : 'toolbar__icon btn-paste',
                lock        : [/*_set.editCell,*/ _set.coAuth, _set.lostConnect]
            });

            me.btnUndo = new Common.UI.Button({
                id          : 'id-toolbar-btn-undo',
                cls         : 'btn-toolbar',
                iconCls     : 'toolbar__icon btn-undo',
                disabled    : true,
                lock        : [_set.lostConnect],
                signals     : ['disabled']
            });

            me.btnRedo = new Common.UI.Button({
                id          : 'id-toolbar-btn-redo',
                cls         : 'btn-toolbar',
                iconCls     : 'toolbar__icon btn-redo',
                disabled    : true,
                lock        : [_set.lostConnect],
                signals     : ['disabled']
            });

            if ( config.isEditDiagram ) {
                me.$layout = $(_.template(simple)(config));

                me.btnInsertFormula = new Common.UI.Button({
                    id          : 'id-toolbar-btn-insertformula',
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-formula',
                    split       : true,
                    lock        : [_set.editText, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.selRangeEdit, _set.lostConnect, _set.coAuth],
                    menu        : new Common.UI.Menu({
                        style : 'min-width: 110px',
                        items : [
                            {caption: 'SUM',   value: 'SUM'},
                            {caption: 'AVERAGE', value: 'AVERAGE'},
                            {caption: 'MIN',   value: 'MIN'},
                            {caption: 'MAX',   value: 'MAX'},
                            {caption: 'COUNT', value: 'COUNT'},
                            {caption: '--'},
                            {
                                caption: me.txtAdditional,
                                value: 'more',
                                hint: me.txtFormula + Common.Utils.String.platformKey('Shift+F3')
                            }
                        ]
                    })
                });

                me.btnDecDecimal = new Common.UI.Button({
                    id          : 'id-toolbar-btn-decdecimal',
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-decdecimal',
                    lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.lostConnect, _set.coAuth]
                });

                me.btnIncDecimal = new Common.UI.Button({
                    id          : 'id-toolbar-btn-incdecimal',
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-incdecimal',
                    lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.lostConnect, _set.coAuth]
                });

                var formatTemplate =
                    _.template([
                        '<% _.each(items, function(item) { %>',
                        '<li id="<%= item.id %>" data-value="<%= item.value %>"><a tabindex="-1" type="menuitem">',
                        '<div style="position: relative;"><div style="position: absolute; left: 0; width: 100px;"><%= scope.getDisplayValue(item) %></div>',
                        '<div style="display: inline-block; width: 100%; max-width: 300px; overflow: hidden; text-overflow: ellipsis; text-align: right; vertical-align: bottom; padding-left: 100px; color: silver;white-space: nowrap;"><%= item.exampleval ? item.exampleval : "" %></div>',
                        '</div></a></li>',
                        '<% }); %>',
                        '<li class="divider">',
                        '<li id="id-toolbar-mnu-item-more-formats" data-value="-1"><a tabindex="-1" type="menuitem">' + me.textMoreFormats + '</a></li>'
                    ].join(''));

                me.cmbNumberFormat = new Common.UI.ComboBox({
                    cls         : 'input-group-nr',
                    menuStyle   : 'min-width: 180px;',
                    hint        : me.tipNumFormat,
                    lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.selRangeEdit, _set.lostConnect, _set.coAuth],
                    itemsTemplate: formatTemplate,
                    editable    : false,
                    data        : me.numFormatData
                });

                me.btnEditChart = new Common.UI.Button({
                    id          : 'id-toolbar-rtn-edit-chart',
                    cls         : 'btn-toolbar btn-text-default auto',
                    caption     : me.tipEditChart,
                    lock        : [_set.lostConnect],
                    style       : 'min-width: 120px;'
                });

                me.btnEditChartData = new Common.UI.Button({
                    id          : 'id-toolbar-rtn-edit-chart-data',
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-select-range',
                    caption     : me.tipEditChartData,
                    lock        : [_set.editCell, _set.selRange, _set.selRangeEdit, _set.lostConnect]
                });

                me.btnEditChartType = new Common.UI.Button({
                    id          : 'id-toolbar-rtn-edit-chart-type',
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-menu-chart',
                    caption     : me.tipEditChartType,
                    lock        : [_set.editCell, _set.selRange, _set.selRangeEdit, _set.lostConnect],
                    style       : 'min-width: 120px;'
                });
            } else
            if ( config.isEditMailMerge ) {
                me.$layout = $(_.template(simple)(config));

                me.btnSearch = new Common.UI.Button({
                    id          : 'id-toolbar-btn-search',
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-menu-search',
                    lock        : [_set.lostConnect]
                });

                me.btnSortDown = new Common.UI.Button({
                    id          : 'id-toolbar-btn-sort-down',
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-sort-down',
                    lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.lostConnect, _set.coAuth, _set.ruleFilter, _set.editPivot]
                });

                me.btnSortUp = new Common.UI.Button({
                    id          : 'id-toolbar-btn-sort-up',
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-sort-up',
                    lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.lostConnect, _set.coAuth, _set.ruleFilter, _set.editPivot]
                });

                me.btnSetAutofilter = new Common.UI.Button({
                    id          : 'id-toolbar-btn-setautofilter',
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-autofilter',
                    lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.lostConnect, _set.coAuth, _set.ruleFilter, _set.editPivot],
                    enableToggle: true
                });

                me.btnClearAutofilter = new Common.UI.Button({
                    id          : 'id-toolbar-btn-clearfilter',
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-clear-filter',
                    lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.lostConnect, _set.coAuth, _set.ruleDelFilter, _set.editPivot]
                });
            } else
            if ( config.isEdit ) {
                Common.UI.Mixtbar.prototype.initialize.call(this, {
                    template: _.template(template),
                    tabs: [
                        { caption: me.textTabFile, action: 'file', extcls: 'canedit', haspanel:false},
                        { caption: me.textTabHome, action: 'home', extcls: 'canedit'},
                        { caption: me.textTabInsert, action: 'ins', extcls: 'canedit'},
                        {caption: me.textTabLayout, action: 'layout', extcls: 'canedit'},
                        {caption: me.textTabFormula, action: 'formula', extcls: 'canedit'},
                        {caption: me.textTabData, action: 'data', extcls: 'canedit'},
                        undefined, undefined, undefined,
                        {caption: me.textTabView, action: 'view', extcls: 'canedit'}
                    ]}
                );

                me.cmbFontSize = new Common.UI.ComboBox({
                    cls         : 'input-group-nr',
                    menuStyle   : 'min-width: 55px;',
                    hint        : me.tipFontSize,
                    lock        : [_set.selImage, _set.editFormula, _set.selRangeEdit, _set.selSlicer, _set.coAuth, _set.coAuthText, _set.lostConnect],
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
                        { value: 72, displayValue: "72" },
                        { value: 96, displayValue: "96" }
                    ]
                });

                me.cmbFontName = new Common.UI.ComboBoxFonts({
                    cls         : 'input-group-nr',
                    menuCls     : 'scrollable-menu',
                    menuStyle   : 'min-width: 325px;',
                    hint        : me.tipFontName,
                    lock        : [_set.selImage, _set.editFormula, _set.selRangeEdit, _set.selSlicer, _set.coAuth, _set.coAuthText, _set.lostConnect],
                    store       : new Common.Collections.Fonts()
                });

                me.btnPrint = new Common.UI.Button({
                    id          : 'id-toolbar-btn-print',
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-print no-mask',
                    lock        : [_set.editCell, _set.cantPrint, _set.disableOnStart],
                    signals: ['disabled']
                });

                me.btnSave = new Common.UI.Button({
                    id          : 'id-toolbar-btn-save',
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon no-mask ' + me.btnSaveCls,
                    signals     : ['disabled']
                });
                me.btnCollabChanges = me.btnSave;

                me.btnIncFontSize = new Common.UI.Button({
                    id          : 'id-toolbar-btn-incfont',
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-incfont',
                    lock        : [_set.selImage, _set.editFormula, _set.selRangeEdit, _set.selSlicer, _set.coAuth, _set.coAuthText, _set.lostConnect]
                });

                me.btnDecFontSize = new Common.UI.Button({
                    id          : 'id-toolbar-btn-decfont',
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-decfont',
                    lock        : [_set.selImage, _set.editFormula, _set.selRangeEdit, _set.selSlicer, _set.coAuth, _set.coAuthText, _set.lostConnect]
                });

                me.btnBold = new Common.UI.Button({
                    id          : 'id-toolbar-btn-bold',
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-bold',
                    lock        : [_set.selImage, _set.editFormula, _set.selRangeEdit, _set.selSlicer, _set.coAuth, _set.coAuthText, _set.lostConnect],
                    enableToggle: true
                });

                me.btnItalic = new Common.UI.Button({
                    id          : 'id-toolbar-btn-italic',
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-italic',
                    lock        : [_set.selImage, _set.editFormula, _set.selRangeEdit, _set.selSlicer, _set.coAuth, _set.coAuthText, _set.lostConnect],
                    enableToggle: true
                });

                me.btnUnderline = new Common.UI.Button({
                    id          : 'id-toolbar-btn-underline',
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-underline',
                    lock        : [_set.selImage, _set.editFormula, _set.selRangeEdit, _set.selSlicer, _set.coAuth, _set.coAuthText, _set.lostConnect],
                    enableToggle: true
                });

                me.btnStrikeout = new Common.UI.Button({
                    id: 'id-toolbar-btn-strikeout',
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-strikeout',
                    lock        : [_set.selImage, _set.editFormula, _set.selRangeEdit, _set.selSlicer, _set.coAuth, _set.coAuthText, _set.lostConnect],
                    enableToggle: true
                });

                me.btnSubscript = new Common.UI.Button({
                    id          : 'id-toolbar-btn-subscript',
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-subscript',
                    icls     : 'btn-subscript',
                    split       : true,
                    enableToggle: true,
                    lock        : [_set.selImage, _set.editFormula, _set.selRangeEdit, _set.selSlicer, _set.coAuth, _set.coAuthText, _set.lostConnect],
                    menu        : new Common.UI.Menu({
                        items: [
                            {
                                caption     : me.textSuperscript,
                                iconCls     : 'menu__icon btn-superscript',
                                icls        : 'btn-superscript',
                                checkable   : true,
                                checkmark   : false,
                                allowDepress: true,
                                toggleGroup : 'textsubscriptgroup',
                                value       : 'super'
                            },
                            {
                                caption     : me.textSubscript,
                                iconCls     : 'menu__icon btn-subscript',
                                icls        : 'btn-subscript',
                                checkable   : true,
                                checkmark   : false,
                                allowDepress: true,
                                toggleGroup : 'textsubscriptgroup',
                                value       : 'sub'
                            }
                        ]
                    })
                });

                me.mnuTextColorPicker = dummyCmp();
                me.btnTextColor = new Common.UI.ButtonColored({
                    id          : 'id-toolbar-btn-fontcolor',
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-fontcolor',
                    split       : true,
                    lock        : [_set.selImage, _set.editFormula, _set.selRangeEdit, _set.selSlicer, _set.coAuth, _set.coAuthText, _set.lostConnect],
                    menu        : new Common.UI.Menu({
                        cls: 'shifted-left',
                        items: [
                            {
                                id: 'id-toolbar-menu-auto-fontcolor',
                                caption: this.textAutoColor,
                                template: _.template('<a tabindex="-1" type="menuitem"><span class="menu-item-icon" style="background-image: none; width: 12px; height: 12px; margin: 1px 7px 0 1px; background-color: #000;"></span><%= caption %></a>')
                            },
                            {caption: '--'},
                            { template: _.template('<div id="id-toolbar-menu-fontcolor" style="width: 169px; height: 216px; margin: 10px;"></div>') },
                            { template: _.template('<a id="id-toolbar-menu-new-fontcolor" style="padding-left:12px;">' + me.textNewColor + '</a>') }
                        ]
                    })
                });

                me.mnuBackColorPicker = dummyCmp();
                me.btnBackColor = new Common.UI.ButtonColored({
                    id          : 'id-toolbar-btn-fillparag',
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-paracolor',
                    split       : true,
                    lock        : [_set.selImage, _set.editCell, _set.selSlicer, _set.coAuth, _set.coAuthText, _set.lostConnect],
                    menu        : new Common.UI.Menu({
                        items: [
                            { template: _.template('<div id="id-toolbar-menu-paracolor" style="width: 169px; height: 216px; margin: 10px;"></div>') },
                            { template: _.template('<a id="id-toolbar-menu-new-paracolor" style="padding-left:12px;">' + me.textNewColor + '</a>') }
                        ]
                    })
                });

                me.btnBorders = new Common.UI.Button({
                    id          : 'id-toolbar-btn-borders',
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-border-out',
                    icls        : 'btn-border-out',
                    borderId    : 'outer',
                    borderswidth: Asc.c_oAscBorderStyles.Thin,
                    lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.selSlicer, _set.lostConnect, _set.coAuth],
                    split       : true,
                    menu        : true
                });

                me.btnAlignLeft = new Common.UI.Button({
                    id          : 'id-toolbar-btn-align-left',
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-align-left',
                    enableToggle: true,
                    lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selImage, _set.selSlicer, _set.lostConnect, _set.coAuth, _set.coAuthText],
                    toggleGroup : 'alignGroup'
                });

                me.btnAlignCenter = new Common.UI.Button({
                    id          : 'id-toolbar-btn-align-center',
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-align-center',
                    enableToggle: true,
                    lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selImage, _set.selSlicer, _set.lostConnect, _set.coAuth, _set.coAuthText],
                    toggleGroup : 'alignGroup'
                });

                me.btnAlignRight = new Common.UI.Button({
                    id          : 'id-toolbar-btn-align-right',
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-align-right',
                    enableToggle: true,
                    lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selImage, _set.selSlicer, _set.lostConnect, _set.coAuth, _set.coAuthText],
                    toggleGroup : 'alignGroup'
                });

                me.btnAlignJust = new Common.UI.Button({
                    id          : 'id-toolbar-btn-align-just',
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-align-just',
                    enableToggle: true,
                    lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selImage, _set.selSlicer, _set.lostConnect, _set.coAuth, _set.coAuthText],
                    toggleGroup: 'alignGroup'
                });

                me.btnMerge = new Common.UI.Button({
                    id          : 'id-toolbar-rtn-merge',
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-merge-and-center',
                    enableToggle: true,
                    allowDepress: true,
                    split       : true,
                    lock        : [_set.editCell, _set.selShape, _set.selShapeText, _set.selChart, _set.selChartText, _set.selImage, _set.selSlicer, _set.lostConnect, _set.coAuth, _set.ruleMerge, _set.editPivot],
                    menu        : new Common.UI.Menu({
                        items: [
                            {
                                caption : me.txtMergeCenter,
                                iconCls     : 'menu__icon btn-merge-and-center',
                                value   : Asc.c_oAscMergeOptions.MergeCenter
                            },
                            {
                                caption : me.txtMergeAcross,
                                iconCls     : 'menu__icon btn-merge-across',
                                value   : Asc.c_oAscMergeOptions.MergeAcross
                            },
                            {
                                caption : me.txtMergeCells,
                                iconCls     : 'menu__icon btn-merge-cells',
                                value   : Asc.c_oAscMergeOptions.Merge
                            },
                            {
                                caption : me.txtUnmerge,
                                iconCls     : 'menu__icon btn-unmerge-cells',
                                value   : Asc.c_oAscMergeOptions.None
                            }
                        ]
                    })
                });

                me.btnAlignTop = new Common.UI.Button({
                    id          : 'id-toolbar-rtn-valign-top',
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-align-top',
                    lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selImage, _set.selSlicer, _set.lostConnect, _set.coAuth, _set.coAuthText],
                    enableToggle: true,
                    toggleGroup : 'vAlignGroup'
                });

                me.btnAlignMiddle = new Common.UI.Button({
                    id          : 'id-toolbar-rtn-valign-middle',
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-align-middle',
                    enableToggle: true,
                    lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selImage, _set.selSlicer, _set.lostConnect, _set.coAuth, _set.coAuthText],
                    toggleGroup : 'vAlignGroup'
                });

                me.btnAlignBottom = new Common.UI.Button({
                    id          : 'id-toolbar-rtn-valign-bottom',
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-align-bottom',
                    lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selImage, _set.selSlicer, _set.lostConnect, _set.coAuth, _set.coAuthText],
                    enableToggle: true,
                    toggleGroup : 'vAlignGroup'
                });

                me.btnWrap = new Common.UI.Button({
                    id          : 'id-toolbar-rtn-wrap',
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-wrap',
                    lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.selSlicer, _set.lostConnect, _set.coAuth],
                    enableToggle: true,
                    allowDepress: true
                });

                me.btnTextOrient = new Common.UI.Button({
                    id          : 'id-toolbar-rtn-textorient',
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon text-orient-ccw',
                    lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selImage, _set.selSlicer, _set.lostConnect, _set.coAuth, _set.coAuthText],
                    menu        : new Common.UI.Menu({
                        items: [
                            {
                                caption     : me.textHorizontal,
                                iconCls     : 'menu__icon text-orient-hor',
                                checkable   : true,
                                checkmark   : false,
                                toggleGroup : 'textorientgroup',
                                value       : 'horiz'
                            },
                            {
                                caption     : me.textCounterCw,
                                iconCls     : 'menu__icon text-orient-ccw',
                                checkable   : true,
                                checkmark   : false,
                                toggleGroup : 'textorientgroup',
                                value       : 'countcw'
                            },
                            {
                                caption     : me.textClockwise,
                                iconCls     : 'menu__icon text-orient-cw',
                                checkable   : true,
                                checkmark   : false,
                                toggleGroup : 'textorientgroup',
                                value       : 'clockwise'
                            },
                            {
                                caption     : me.textVertical,
                                iconCls     : 'menu__icon text-orient-vertical',
                                checkable   : true,
                                checkmark   : false,
                                toggleGroup : 'textorientgroup',
                                value       : 'vertical'
                            },
                            {
                                caption     : me.textRotateUp,
                                iconCls     : 'menu__icon text-orient-rup',
                                checkable   : true,
                                checkmark   : false,
                                toggleGroup : 'textorientgroup',
                                value       : 'rotateup'
                            },
                            {
                                caption     : me.textRotateDown,
                                iconCls     : 'menu__icon text-orient-rdown',
                                checkable   : true,
                                checkmark   : false,
                                toggleGroup : 'textorientgroup',
                                value       : 'rotatedown'
                            }
                        ]
                    })
                });

                me.btnInsertImage = new Common.UI.Button({
                    id          : 'tlbtn-insertimage',
                    cls         : 'btn-toolbar x-huge icon-top',
                    iconCls     : 'toolbar__icon btn-insertimage',
                    caption     : me.capInsertImage,
                    lock        : [_set.editCell, _set.lostConnect, _set.coAuth],
                    menu        : new Common.UI.Menu({
                        items: [
                            { caption: me.mniImageFromFile, value: 'file' },
                            { caption: me.mniImageFromUrl,  value: 'url' },
                            { caption: me.mniImageFromStorage, value: 'storage'}
                        ]
                    })
                });

                me.btnInsertHyperlink = new Common.UI.Button({
                    id          : 'tlbtn-insertlink',
                    cls         : 'btn-toolbar x-huge icon-top',
                    iconCls     : 'toolbar__icon btn-inserthyperlink',
                    caption     : me.capInsertHyperlink,
                    lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selImage, _set.selShape, _set.cantHyperlink, _set.selSlicer, _set.multiselect, _set.lostConnect, _set.coAuth, _set.editPivot]
                });

                me.btnInsertChart = new Common.UI.Button({
                    id          : 'tlbtn-insertchart',
                    cls         : 'btn-toolbar x-huge icon-top',
                    iconCls     : 'toolbar__icon btn-insertchart',
                    lock        : [_set.editCell, _set.lostConnect, _set.coAuth, _set.coAuthText],
                    caption     : me.capInsertChart,
                    menu        : true
                });

                me.btnInsertSparkline = new Common.UI.Button({
                    id          : 'tlbtn-insertsparkline',
                    cls         : 'btn-toolbar x-huge icon-top',
                    iconCls     : 'toolbar__icon btn-sparkline',
                    lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selImage, _set.selShape, _set.selSlicer, _set.multiselect, _set.lostConnect, _set.coAuth, _set.coAuthText, _set.editPivot],
                    caption     : me.capInsertSpark,
                    menu        : true
                });

                me.btnInsertShape = new Common.UI.Button({
                    id          : 'tlbtn-insertshape',
                    cls         : 'btn-toolbar x-huge icon-top',
                    iconCls     : 'toolbar__icon btn-insertshape',
                    enableToggle: true,
                    caption     : me.capInsertShape,
                    lock        : [_set.editCell, _set.lostConnect, _set.coAuth],
                    menu        : new Common.UI.Menu({cls: 'menu-shapes'})
                });

                me.btnInsertText = new Common.UI.Button({
                    id          : 'tlbtn-inserttext',
                    cls         : 'btn-toolbar x-huge icon-top',
                    iconCls     : 'toolbar__icon btn-text',
                    caption     : me.capInsertText,
                    lock        : [_set.editCell, _set.lostConnect, _set.coAuth],
                    enableToggle: true
                });

                me.btnInsertTextArt = new Common.UI.Button({
                    id          : 'tlbtn-inserttextart',
                    cls         : 'btn-toolbar x-huge icon-top',
                    iconCls     : 'toolbar__icon btn-textart',
                    caption     : me.capInsertTextart,
                    lock        : [_set.editCell, _set.lostConnect, _set.coAuth],
                    menu        : new Common.UI.Menu({
                        cls: 'menu-shapes',
                        items: [
                            {template: _.template('<div id="id-toolbar-menu-insart" style="width: 239px; margin-left: 5px;"></div>')}
                        ]
                    })
                });

                me.btnInsertEquation = new Common.UI.Button({
                    id          : 'tlbtn-insertequation',
                    cls         : 'btn-toolbar x-huge icon-top',
                    iconCls     : 'toolbar__icon btn-insertequation',
                    caption     : me.capInsertEquation,
                    split       : true,
                    lock        : [_set.editCell, _set.lostConnect, _set.coAuth],
                    menu        : new Common.UI.Menu({cls: 'menu-shapes'})
                });

                me.btnInsertSymbol = new Common.UI.Button({
                    id: 'tlbtn-insertsymbol',
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-symbol',
                    caption: me.capBtnInsSymbol,
                    lock: [_set.selImage, _set.selChart, _set.selShape, _set.editFormula, _set.selRangeEdit, _set.selSlicer, _set.coAuth, _set.coAuthText, _set.lostConnect]
                });

                me.btnInsertSlicer = new Common.UI.Button({
                    id: 'tlbtn-insertslicer',
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-slicer',
                    caption: me.capBtnInsSlicer,
                    lock: [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.selSlicer, _set.lostConnect, _set.coAuth, _set.multiselect, _set.noSlicerSource]
                });

                me.btnTableTemplate = new Common.UI.Button({
                    id          : 'id-toolbar-btn-ttempl',
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-menu-table',
                    lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.selSlicer, _set.lostConnect, _set.coAuth, _set.ruleFilter, _set.multiselect, _set.cantModifyFilter],
                    menu        : new Common.UI.Menu({
                        items: [
                            { template: _.template('<div id="id-toolbar-menu-table-templates" style="width: 487px; height: 300px; margin: 0px 4px;"></div>') }
                        ]
                    })
                });

                me.btnInsertTable = new Common.UI.Button({
                    id          : 'tlbtn-inserttable',
                    cls         : 'btn-toolbar x-huge icon-top',
                    iconCls     : 'toolbar__icon btn-inserttable',
                    caption     : me.capInsertTable,
                    lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.selSlicer, _set.lostConnect, _set.coAuth, _set.ruleFilter, _set.multiselect, _set.cantModifyFilter, _set.ruleMerge, _set.editPivot]
                });

                me.listStyles = new Common.UI.ComboDataView({
                    cls             : 'combo-styles',
                    enableKeyEvents : true,
                    itemWidth       : 112,
                    itemHeight      : 40,
                    menuMaxHeight   : 226,
                    lock            : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.selSlicer, _set.lostConnect, _set.coAuth],
                    beforeOpenHandler: function(e) {
                        var cmp = this,
                            menu = cmp.openButton.menu,
                            minMenuColumn = 6;

                        if (menu.cmpEl) {
                            var itemEl = $(cmp.cmpEl.find('.dataview.inner .style').get(0)).parent();
                            var itemMargin = /*parseInt($(itemEl.get(0)).parent().css('margin-right'))*/-1;
                            Common.Utils.applicationPixelRatio() > 1 && Common.Utils.applicationPixelRatio() < 2 && (itemMargin = itemMargin + 1/Common.Utils.applicationPixelRatio());
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
                        '<div style="display: inline-block; width: 100%; max-width: 300px; overflow: hidden; text-overflow: ellipsis; text-align: right; vertical-align: bottom; padding-left: 100px; color: silver;white-space: nowrap;"><%= item.exampleval ? item.exampleval : "" %></div>',
                        '</div></a></li>',
                        '<% }); %>',
                        '<li class="divider">',
                        '<li id="id-toolbar-mnu-item-more-formats" data-value="-1"><a tabindex="-1" type="menuitem">' + me.textMoreFormats + '</a></li>'
                    ].join(''));

                me.cmbNumberFormat = new Common.UI.ComboBox({
                    cls         : 'input-group-nr',
                    menuStyle   : 'min-width: 180px;',
                    hint        : me.tipNumFormat,
                    lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.selSlicer, _set.selRangeEdit, _set.lostConnect, _set.coAuth],
                    itemsTemplate: formatTemplate,
                    editable    : false,
                    data        : me.numFormatData
                });

                me.btnPercentStyle = new Common.UI.Button({
                    id          : 'id-toolbar-btn-percent-style',
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-percent-style',
                    lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.selSlicer, _set.lostConnect, _set.coAuth],
                    styleName   : 'Percent'
                });

                me.btnCurrencyStyle = new Common.UI.Button({
                    id          : 'id-toolbar-btn-accounting-style',
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-currency-style',
                    lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.selSlicer, _set.lostConnect, _set.coAuth],
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
                            },{caption: '--'},
                            {
                                caption : me.textMoreFormats,
                                value   : -1
                            }
                        ]
                    })
                });

                me.btnDecDecimal = new Common.UI.Button({
                    id          : 'id-toolbar-btn-decdecimal',
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-decdecimal',
                    lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.selSlicer, _set.lostConnect, _set.coAuth]
                });

                me.btnIncDecimal = new Common.UI.Button({
                    id          : 'id-toolbar-btn-incdecimal',
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-incdecimal',
                    lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.selSlicer, _set.lostConnect, _set.coAuth]
                });

                me.btnInsertFormula = new Common.UI.Button({
                    id          : 'id-toolbar-btn-insertformula',
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-formula',
                    split       : true,
                    lock        : [_set.editText, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.selSlicer, _set.selRangeEdit, _set.lostConnect, _set.coAuth],
                    menu        : new Common.UI.Menu({
                        style : 'min-width: 110px',
                        items : [
                            {caption: 'SUM',   value: 'SUM'},
                            {caption: 'AVERAGE', value: 'AVERAGE'},
                            {caption: 'MIN',   value: 'MIN'},
                            {caption: 'MAX',   value: 'MAX'},
                            {caption: 'COUNT', value: 'COUNT'},
                            {caption: '--'},
                            {
                                caption: me.txtAdditional,
                                value: 'more',
                                hint: me.txtFormula + Common.Utils.String.platformKey('Shift+F3')
                            }
                        ]
                    })
                });

                me.btnNamedRange = new Common.UI.Button({
                    id          : 'id-toolbar-btn-insertrange',
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-named-range',
                    lock        : [_set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.lostConnect, _set.coAuth, _set.selRangeEdit],
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
                    iconCls     : 'toolbar__icon btn-clearstyle',
                    lock        : [_set.lostConnect, _set.coAuth, _set.selRangeEdit, _set.selSlicer],
                    menu        : new Common.UI.Menu({
                        style : 'min-width: 110px',
                        items : [
                            {
                                caption : me.txtClearAll,
                                lock    : [ _set.cantModifyFilter],
                                value   : Asc.c_oAscCleanOptions.All
                            },
                            {
                                caption : me.txtClearText,
                                lock    : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.coAuth],
                                value   : Asc.c_oAscCleanOptions.Text
                            },
                            {
                                caption : me.txtClearFormat,
                                lock    : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.coAuth, _set.cantModifyFilter],
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
                    iconCls     : 'toolbar__icon btn-copystyle',
                    lock        : [_set.editCell, _set.lostConnect, _set.coAuth, _set.selChart, _set.selSlicer],
                    enableToggle: true
                });

                me.btnAddCell = new Common.UI.Button({
                    id          : 'id-toolbar-btn-addcell',
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-addcell',
                    lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.selSlicer, _set.lostConnect, _set.coAuth],
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
                    iconCls     : 'toolbar__icon btn-delcell',
                    lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.selSlicer, _set.lostConnect, _set.coAuth],
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

                me.btnCondFormat = new Common.UI.Button({
                    id          : 'id-toolbar-btn-condformat',
                    cls         : 'btn-toolbar',
                    iconCls     : 'toolbar__icon btn-cond-format',
                    lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.lostConnect, _set.coAuth],
                    menu        : true
                });

                me.btnColorSchemas = new Common.UI.Button({
                    id          : 'id-toolbar-btn-colorschemas',
                    cls         : 'btn-toolbar x-huge icon-top',
                    iconCls     : 'toolbar__icon btn-colorschemas',
                    caption     : me.capBtnColorSchemas,
                    lock        : [_set.editCell, _set.lostConnect, _set.coAuth],
                    menu        : new Common.UI.Menu({
                        cls: 'shifted-left',
                        items: [],
                        restoreHeight: true
                    })
                });

                var hidetip = Common.localStorage.getItem("sse-hide-synch");
                me.showSynchTip = !(hidetip && parseInt(hidetip) == 1);
                // me.needShowSynchTip = false;

                me.btnPageOrient = new Common.UI.Button({
                    id: 'tlbtn-pageorient',
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-pageorient',
                    caption: me.capBtnPageOrient,
                    lock        : [_set.docPropsLock, _set.lostConnect, _set.coAuth, _set.selRangeEdit],
                    menu: new Common.UI.Menu({
                        cls: 'ppm-toolbar',
                        items: [
                            {
                                caption: me.textPortrait,
                                iconCls: 'menu__icon page-portrait',
                                checkable: true,
                                checkmark: false,
                                toggleGroup: 'menuOrient',
                                value: Asc.c_oAscPageOrientation.PagePortrait
                            },
                            {
                                caption: me.textLandscape,
                                iconCls: 'menu__icon page-landscape',
                                checkable: true,
                                checkmark: false,
                                toggleGroup: 'menuOrient',
                                value: Asc.c_oAscPageOrientation.PageLandscape
                            }
                        ]
                    })
                });

                var pageMarginsTemplate = _.template('<a id="<%= id %>" tabindex="-1" type="menuitem"><div><b><%= caption %></b></div>' +
                    '<% if (options.value !== null) { %><div style="display: inline-block;margin-right: 20px;min-width: 80px;">' +
                    '<label style="display: block;">' + this.textTop + '<%= parseFloat(Common.Utils.Metric.fnRecalcFromMM(options.value[0]).toFixed(2)) %> <%= Common.Utils.Metric.getCurrentMetricName() %></label>' +
                    '<label style="display: block;">' + this.textLeft + '<%= parseFloat(Common.Utils.Metric.fnRecalcFromMM(options.value[1]).toFixed(2)) %> <%= Common.Utils.Metric.getCurrentMetricName() %></label></div><div style="display: inline-block;">' +
                    '<label style="display: block;">' + this.textBottom + '<%= parseFloat(Common.Utils.Metric.fnRecalcFromMM(options.value[2]).toFixed(2)) %> <%= Common.Utils.Metric.getCurrentMetricName() %></label>' +
                    '<label style="display: block;">' + this.textRight + '<%= parseFloat(Common.Utils.Metric.fnRecalcFromMM(options.value[3]).toFixed(2)) %> <%= Common.Utils.Metric.getCurrentMetricName() %></label></div>' +
                    '<% } %></a>');

                me.btnPageMargins = new Common.UI.Button({
                    id: 'tlbtn-pagemargins',
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-pagemargins',
                    caption: me.capBtnMargins,
                    lock        : [_set.docPropsLock, _set.lostConnect, _set.coAuth, _set.selRangeEdit],
                    menu: new Common.UI.Menu({
                        items: [
                            {
                                caption: me.textMarginsLast,
                                checkable: true,
                                template: pageMarginsTemplate,
                                toggleGroup: 'menuPageMargins'
                            }, //top,left,bottom,right
                            {
                                caption: me.textMarginsNormal,
                                checkable: true,
                                template: pageMarginsTemplate,
                                toggleGroup: 'menuPageMargins',
                                value: [19.1, 17.8, 19.1, 17.8]
                            },
                            {
                                caption: me.textMarginsNarrow,
                                checkable: true,
                                template: pageMarginsTemplate,
                                toggleGroup: 'menuPageMargins',
                                value: [19.1, 6.4, 19.1, 6.4]
                            },
                            {
                                caption: me.textMarginsWide,
                                checkable: true,
                                template: pageMarginsTemplate,
                                toggleGroup: 'menuPageMargins',
                                value: [25.4, 25.4, 25.4, 25.4]
                            },
                            {caption: '--'},
                            {caption: me.textPageMarginsCustom, value: 'advanced'}
                        ]
                    })
                });

                var pageSizeTemplate = _.template('<a id="<%= id %>" tabindex="-1" type="menuitem"><div><b><%= caption %></b></div>' +
                    '<div><%= parseFloat(Common.Utils.Metric.fnRecalcFromMM(options.value[0]).toFixed(2)) %> <%= Common.Utils.Metric.getCurrentMetricName() %> x ' +
                    '<%= parseFloat(Common.Utils.Metric.fnRecalcFromMM(options.value[1]).toFixed(2)) %> <%= Common.Utils.Metric.getCurrentMetricName() %></div></a>');

                me.btnPageSize = new Common.UI.Button({
                    id: 'tlbtn-pagesize',
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-pagesize',
                    caption: me.capBtnPageSize,
                    lock        : [_set.docPropsLock, _set.lostConnect, _set.coAuth, _set.selRangeEdit],
                    menu: new Common.UI.Menu({
                        restoreHeight: true,
                        items: [
                            {
                                caption: 'US Letter',
                                subtitle: '21,59cm x 27,94cm',
                                template: pageSizeTemplate,
                                checkable: true,
                                toggleGroup: 'menuPageSize',
                                value: [215.9, 279.4]
                            },
                            {
                                caption: 'US Legal',
                                subtitle: '21,59cm x 35,56cm',
                                template: pageSizeTemplate,
                                checkable: true,
                                toggleGroup: 'menuPageSize',
                                value: [215.9, 355.6]
                            },
                            {
                                caption: 'A4',
                                subtitle: '21cm x 29,7cm',
                                template: pageSizeTemplate,
                                checkable: true,
                                toggleGroup: 'menuPageSize',
                                value: [210, 297],
                                checked: true
                            },
                            {
                                caption: 'A5',
                                subtitle: '14,81cm x 20,99cm',
                                template: pageSizeTemplate,
                                checkable: true,
                                toggleGroup: 'menuPageSize',
                                value: [148, 210]
                            },
                            {
                                caption: 'B5',
                                subtitle: '17,6cm x 25,01cm',
                                template: pageSizeTemplate,
                                checkable: true,
                                toggleGroup: 'menuPageSize',
                                value: [176, 250]
                            },
                            {
                                caption: 'Envelope #10',
                                subtitle: '10,48cm x 24,13cm',
                                template: pageSizeTemplate,
                                checkable: true,
                                toggleGroup: 'menuPageSize',
                                value: [104.8, 241.3]
                            },
                            {
                                caption: 'Envelope DL',
                                subtitle: '11,01cm x 22,01cm',
                                template: pageSizeTemplate,
                                checkable: true,
                                toggleGroup: 'menuPageSize',
                                value: [110, 220]
                            },
                            {
                                caption: 'Tabloid',
                                subtitle: '27,94cm x 43,17cm',
                                template: pageSizeTemplate,
                                checkable: true,
                                toggleGroup: 'menuPageSize',
                                value: [279.4, 431.8]
                            },
                            {
                                caption: 'A3',
                                subtitle: '29,7cm x 42,01cm',
                                template: pageSizeTemplate,
                                checkable: true,
                                toggleGroup: 'menuPageSize',
                                value: [297, 420]
                            },
                            {
                                caption: 'Tabloid Oversize',
                                subtitle: '30,48cm x 45,71cm',
                                template: pageSizeTemplate,
                                checkable: true,
                                toggleGroup: 'menuPageSize',
                                value: [304.8, 457.1]
                            },
                            {
                                caption: 'ROC 16K',
                                subtitle: '19,68cm x 27,3cm',
                                template: pageSizeTemplate,
                                checkable: true,
                                toggleGroup: 'menuPageSize',
                                value: [196.8, 273]
                            },
                            {
                                caption: 'Envelope Choukei 3',
                                subtitle: '11,99cm x 23,49cm',
                                template: pageSizeTemplate,
                                checkable: true,
                                toggleGroup: 'menuPageSize',
                                value: [119.9, 234.9]
                            },
                            {
                                caption: 'Super B/A3',
                                subtitle: '33,02cm x 48,25cm',
                                template: pageSizeTemplate,
                                checkable: true,
                                toggleGroup: 'menuPageSize',
                                value: [330.2, 482.5]
                            }
                        ]
                    })
                });
                me.mnuPageSize = me.btnPageSize.menu;

                me.btnPrintArea = new Common.UI.Button({
                    id: 'tlbtn-printarea',
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-print-area',
                    caption: me.capBtnPrintArea,
                    lock        : [_set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.selSlicer, _set.editCell, _set.selRangeEdit, _set.printAreaLock, _set.lostConnect, _set.coAuth],
                    menu: new Common.UI.Menu({
                        cls: 'ppm-toolbar',
                        items: [
                            {
                                caption: me.textSetPrintArea,
                                lock: [_set.namedRangeLock],
                                value: Asc.c_oAscChangePrintAreaType.set
                            },
                            {
                                caption: me.textClearPrintArea,
                                value: Asc.c_oAscChangePrintAreaType.clear
                            },
                            {
                                caption: me.textAddPrintArea,
                                lock: [_set.namedRangeLock],
                                value: Asc.c_oAscChangePrintAreaType.add
                            }
                        ]
                    })
                });

                me.mnuCustomScale = new Common.UI.MenuItem({
                    template: _.template([
                        '<div class="checkable custom-scale" style="padding: 5px 20px;font-weight: normal;line-height: 1.42857143;font-size: 11px;height: 32px;"',
                        '<% if(!_.isUndefined(options.stopPropagation)) { %>',
                        'data-stopPropagation="true"',
                        '<% } %>', '>',
                        '<label class="title" style="padding-top: 3px;">' + me.textScale + '</label>',
                        '<button id="custom-scale-up" type="button" style="float:right;" class="btn small btn-toolbar"><i class="icon toolbar__icon btn-zoomup">&nbsp;</i></button>',
                        '<label id="value-custom-scale" style="float:right;padding: 3px 3px;min-width: 40px; text-align: center;"></label>',
                        '<button id="custom-scale-down" type="button" style="float:right;" class="btn small btn-toolbar"><i class="icon toolbar__icon btn-zoomdown">&nbsp;</i></button>',
                        '</div>'
                    ].join('')),
                    stopPropagation: true,
                    value: 4
                });

                me.btnScale = new Common.UI.Button({
                    id: 'tlbtn-scale',
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-scale',
                    caption: me.capBtnScale,
                    lock: [_set.docPropsLock, _set.lostConnect, _set.coAuth, _set.selRangeEdit],
                    menu: new Common.UI.Menu({
                        items: [],
                        cls: 'scale-menu'})
                });
                var menuWidthItem = new Common.UI.MenuItem({
                    caption: me.textWidth,
                    menu: new Common.UI.Menu({
                        menuAlign: 'tl-tr',
                        items: [
                            {caption: this.textAuto, value: 0, checkable: true, toggleGroup : 'scaleWidth'},
                            {caption: '1 ' + this.textOnePage, value: 1, checkable: true, toggleGroup : 'scaleWidth'},
                            {caption: '2 ' + this.textFewPages, value: 2, checkable: true, toggleGroup : 'scaleWidth'},
                            {caption: '3 ' + this.textFewPages, value: 3, checkable: true, toggleGroup : 'scaleWidth'},
                            {caption: '4 ' + this.textFewPages, value: 4, checkable: true, toggleGroup : 'scaleWidth'},
                            {caption: '5 ' + this.textManyPages, value: 5, checkable: true, toggleGroup : 'scaleWidth'},
                            {caption: '6 ' + this.textManyPages, value: 6, checkable: true, toggleGroup : 'scaleWidth'},
                            {caption: '7 ' + this.textManyPages, value: 7, checkable: true, toggleGroup : 'scaleWidth'},
                            {caption: '8 ' + this.textManyPages, value: 8, checkable: true, toggleGroup : 'scaleWidth'},
                            {caption: '9 ' + this.textManyPages, value: 9, checkable: true, toggleGroup : 'scaleWidth'},
                            {caption: '--'},
                            {caption: this.textMorePages, value: 'more', checkable: true, toggleGroup : 'scaleWidth'}
                        ]
                    })
                });
                var menuHeightItem = new Common.UI.MenuItem({
                    caption: me.textHeight,
                    menu: new Common.UI.Menu({
                        menuAlign: 'tl-tr',
                        items: [
                            {caption: this.textAuto, value: 0, checkable: true, toggleGroup : 'scaleHeight'},
                            {caption: '1 ' + this.textOnePage, value: 1, checkable: true, toggleGroup : 'scaleHeight'},
                            {caption: '2 ' + this.textFewPages, value: 2, checkable: true, toggleGroup : 'scaleHeight'},
                            {caption: '3 ' + this.textFewPages, value: 3, checkable: true, toggleGroup : 'scaleHeight'},
                            {caption: '4 ' + this.textFewPages, value: 4, checkable: true, toggleGroup : 'scaleHeight'},
                            {caption: '5 ' + this.textManyPages, value: 5, checkable: true, toggleGroup : 'scaleHeight'},
                            {caption: '6 ' + this.textManyPages, value: 6, checkable: true, toggleGroup : 'scaleHeight'},
                            {caption: '7 ' + this.textManyPages, value: 7, checkable: true, toggleGroup : 'scaleHeight'},
                            {caption: '8 ' + this.textManyPages, value: 8, checkable: true, toggleGroup : 'scaleHeight'},
                            {caption: '9 ' + this.textManyPages, value: 9, checkable: true, toggleGroup : 'scaleHeight'},
                            {caption: '--'},
                            {caption: this.textMorePages, value: 'more', checkable: true, toggleGroup : 'scaleHeight'}
                        ]
                    })
                });
                me.btnScale.menu.addItem(menuWidthItem);
                me.btnScale.menu.addItem(menuHeightItem);
                me.btnScale.menu.addItem(me.mnuCustomScale);
                me.btnScale.menu.addItem({caption: '--'});
                me.btnScale.menu.addItem(
                    {   caption: me.textScaleCustom, value: 'custom'
                    });
                me.menuWidthScale = me.btnScale.menu.items[0].menu;
                me.menuHeightScale = me.btnScale.menu.items[1].menu;

                me.mnuScale = me.btnScale.menu;
                me.mnuScale.on('show:after', _.bind(me.onAfterShowMenuScale, me));

                me.btnPrintTitles = new Common.UI.Button({
                    id: 'tlbtn-printtitles',
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-print-titles',
                    caption: me.capBtnPrintTitles,
                    lock        : [_set.docPropsLock, _set.lostConnect, _set.coAuth, _set.selRangeEdit]
                });

                me.btnImgAlign = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-img-align',
                    caption: me.capImgAlign,
                    lock        : [_set.selRange, _set.selRangeEdit, _set.cantGroup, _set.lostConnect,  _set.coAuth, _set.coAuthText],
                    menu: true
                });

                me.btnImgGroup = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-img-group',
                    caption: me.capImgGroup,
                    lock        : [_set.selRange, _set.selRangeEdit, _set.cantGroupUngroup, _set.lostConnect, _set.coAuth, _set.coAuthText],
                    menu: true
                });
                me.btnImgForward = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-img-frwd',
                    caption: me.capImgForward,
                    split: true,
                    lock        : [_set.selRange, _set.selRangeEdit, _set.lostConnect, _set.coAuth, _set.coAuthText],
                    menu: true
                });
                me.btnImgBackward = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-img-bkwd',
                    caption: me.capImgBackward,
                    lock        : [_set.selRange, _set.selRangeEdit, _set.lostConnect, _set.coAuth, _set.coAuthText],
                    split: true,
                    menu: true
                });

            } else {
                Common.UI.Mixtbar.prototype.initialize.call(this, {
                        template: _.template(template_view),
                        tabs: [
                            {caption: me.textTabFile, action: 'file', haspanel:false}
                        ]
                    }
                );
            }
            me.lockControls = [];
            if (config.isEdit) {
                me.lockControls = [
                    me.cmbFontName, me.cmbFontSize, me.btnIncFontSize, me.btnDecFontSize, me.btnBold,
                    me.btnItalic, me.btnUnderline, me.btnStrikeout, me.btnSubscript, me.btnTextColor, me.btnAlignLeft,
                    me.btnAlignCenter,me.btnAlignRight,me.btnAlignJust, me.btnAlignTop,
                    me.btnAlignMiddle, me.btnAlignBottom, me.btnWrap, me.btnTextOrient, me.btnBackColor, me.btnInsertTable,
                    me.btnMerge, me.btnInsertFormula, me.btnNamedRange, me.btnIncDecimal, me.btnInsertShape, me.btnInsertEquation, me.btnInsertSymbol, me.btnInsertSlicer,
                    me.btnInsertText, me.btnInsertTextArt, me.btnSortUp, me.btnSortDown, me.btnSetAutofilter, me.btnClearAutofilter,
                    me.btnTableTemplate, me.btnPercentStyle, me.btnCurrencyStyle, me.btnDecDecimal, me.btnAddCell, me.btnDeleteCell, me.btnCondFormat,
                    me.cmbNumberFormat, me.btnBorders, me.btnInsertImage, me.btnInsertHyperlink,
                    me.btnInsertChart, me.btnColorSchemas, me.btnInsertSparkline,
                    me.btnCopy, me.btnPaste, me.listStyles, me.btnPrint,
                    /*me.btnSave,*/ me.btnClearStyle, me.btnCopyStyle,
                    me.btnPageMargins, me.btnPageSize, me.btnPageOrient, me.btnPrintArea, me.btnPrintTitles, me.btnImgAlign, me.btnImgBackward, me.btnImgForward, me.btnImgGroup, me.btnScale
                ];

                _.each(me.lockControls.concat([me.btnSave]), function(cmp) {
                    if (cmp && _.isFunction(cmp.setDisabled))
                        cmp.setDisabled(true);
                });
                this.lockToolbar(SSE.enumLock.disableOnStart, true, {array: [me.btnPrint]});

                this.on('render:after', _.bind(this.onToolbarAfterRender, this));
            }
            return this;
        },

        onAfterShowMenuScale: function () {
            var me = this;
            if (me.api) {
                var scale = me.api.asc_getPageOptions().asc_getPageSetup().asc_getScale();
                $('#value-custom-scale', me.mnuCustomScale.$el).html(scale + '%');
                me.valueCustomScale = scale;
            }
            if (!me.itemCustomScale) {
                me.itemCustomScale = $('.custom-scale', me.mnuCustomScale.$el).on('click', _.bind(function () {
                    me.fireEvent('click:customscale', ['scale', undefined, undefined, undefined, me.valueCustomScale], this);
                }, this));
            }
            if (!me.btnCustomScaleUp) {
                me.btnCustomScaleUp = new Common.UI.Button({
                    el: $('#custom-scale-up', me.mnuCustomScale.$el),
                    cls: 'btn-toolbar'
                }).on('click', _.bind(function () {
                    me.fireEvent('change:scalespn', ['up', me.valueCustomScale], this);
                }, this));
            }
            if (!me.btnCustomScaleDown) {
                me.btnCustomScaleDown = new Common.UI.Button({
                    el: $('#custom-scale-down', me.mnuCustomScale.$el),
                    cls: 'btn-toolbar'
                }).on('click', _.bind(function () {
                    me.fireEvent('change:scalespn', ['down', me.valueCustomScale], this);
                }, this));
            }
            SSE.getController('Toolbar').onChangeScaleSettings();
        },

        setValueCustomScale: function(val) {
            if (this.api && val !== null && val !== undefined) {
                $('#value-custom-scale', this.mnuCustomScale.$el).html(val + '%');
                this.valueCustomScale = val;
            }
        },

        render: function (mode) {
            var me = this;

            /**
             * Render UI layout
             */

            me.isCompactView = mode.isCompactView;

            this.fireEvent('render:before', [this]);

            // el.html(this.template({
            //     isEditDiagram: mode.isEditDiagram,
            //     isEditMailMerge: mode.isEditMailMerge,
            //     isCompactView: isCompactView
            // }));
            // me.rendererComponents(mode.isEditDiagram ? 'diagram' : (mode.isEditMailMerge ? 'merge' : isCompactView ? 'short' : 'full'));

            if ( mode.isEdit ) {
                me.$el.html(me.rendererComponents(me.$layout));
            } else {
                me.$layout.find('.canedit').hide();
                me.$layout.addClass('folded');

                me.$el.html(me.$layout);
            }

            this.fireEvent('render:after', [this]);
            Common.UI.Mixtbar.prototype.afterRender.call(this);

            Common.NotificationCenter.on({
                'window:resize': function() {
                    Common.UI.Mixtbar.prototype.onResize.apply(me, arguments);
                }
            });

            if ( mode.isEdit ) {
                if (!mode.isEditDiagram && !mode.isEditMailMerge) {
                    var top = Common.localStorage.getItem("sse-pgmargins-top"),
                        left = Common.localStorage.getItem("sse-pgmargins-left"),
                        bottom = Common.localStorage.getItem("sse-pgmargins-bottom"),
                        right = Common.localStorage.getItem("sse-pgmargins-right");
                    if ( top!==null && left!==null && bottom!==null && right!==null ) {
                        var mnu = this.btnPageMargins.menu.items[0];
                        mnu.options.value = mnu.value = [parseFloat(top), parseFloat(left), parseFloat(bottom), parseFloat(right)];
                        mnu.setVisible(true);
                        $(mnu.el).html(mnu.template({id: Common.UI.getId(), caption : mnu.caption, options : mnu.options}));
                    } else
                        this.btnPageMargins.menu.items[0].setVisible(false);
                    this.btnInsertImage.menu.items[2].setVisible(mode.canRequestInsertImage || mode.fileChoiceUrl && mode.fileChoiceUrl.indexOf("{documentType}")>-1);
                }

                me.setTab('home');
            }
            if ( me.isCompactView )
                me.setFolded(true);

            return this;
        },

        onTabClick: function (e) {
            var me = this,
                tab = $(e.currentTarget).find('> a[data-tab]').data('tab'),
                is_file_active = me.isTabActive('file');

            Common.UI.Mixtbar.prototype.onTabClick.apply(me, arguments);

            if ( is_file_active ) {
                me.fireEvent('file:close');
            } else
            if ( tab == 'file' ) {
                me.fireEvent('file:open');
                me.setTab(tab);
            }
            if ( me.isTabActive('home'))
                me.fireEvent('home:open');

            if ( me.isTabActive('pivot')) {
                var pivottab = SSE.getController('PivotTable');
                pivottab && pivottab.getView('PivotTable').fireEvent('pivot:open');
            }
        },

        rendererComponents: function(html) {
            var $host = $(html);
            var _injectComponent = function (id, cmp) {
                Common.Utils.injectComponent($host.find(id), cmp);
            };

            _injectComponent('#slot-field-fontname',     this.cmbFontName);
            _injectComponent('#slot-field-fontsize',     this.cmbFontSize);
            _injectComponent('#slot-btn-print',          this.btnPrint);
            _injectComponent('#slot-btn-save',           this.btnSave);
            _injectComponent('#slot-btn-undo',           this.btnUndo);
            _injectComponent('#slot-btn-redo',           this.btnRedo);
            _injectComponent('#slot-btn-copy',           this.btnCopy);
            _injectComponent('#slot-btn-paste',          this.btnPaste);
            _injectComponent('#slot-btn-incfont',        this.btnIncFontSize);
            _injectComponent('#slot-btn-decfont',        this.btnDecFontSize);
            _injectComponent('#slot-btn-bold',           this.btnBold);
            _injectComponent('#slot-btn-italic',         this.btnItalic);
            _injectComponent('#slot-btn-underline',      this.btnUnderline);
            _injectComponent('#slot-btn-strikeout',      this.btnStrikeout);
            _injectComponent('#slot-btn-subscript',      this.btnSubscript);
            _injectComponent('#slot-btn-fontcolor',      this.btnTextColor);
            _injectComponent('#slot-btn-fillparag',      this.btnBackColor);
            _injectComponent('#slot-btn-borders',        this.btnBorders);
            _injectComponent('#slot-btn-align-left',     this.btnAlignLeft);
            _injectComponent('#slot-btn-align-center',   this.btnAlignCenter);
            _injectComponent('#slot-btn-align-right',    this.btnAlignRight);
            _injectComponent('#slot-btn-align-just',     this.btnAlignJust);
            _injectComponent('#slot-btn-merge',          this.btnMerge);
            _injectComponent('#slot-btn-top',            this.btnAlignTop);
            _injectComponent('#slot-btn-middle',         this.btnAlignMiddle);
            _injectComponent('#slot-btn-bottom',         this.btnAlignBottom);
            _injectComponent('#slot-btn-wrap',           this.btnWrap);
            _injectComponent('#slot-btn-text-orient',    this.btnTextOrient);
            _injectComponent('#slot-btn-insimage',       this.btnInsertImage);
            _injectComponent('#slot-btn-instable',       this.btnInsertTable);
            _injectComponent('#slot-btn-inshyperlink',   this.btnInsertHyperlink);
            _injectComponent('#slot-btn-insshape',       this.btnInsertShape);
            _injectComponent('#slot-btn-instext',        this.btnInsertText);
            _injectComponent('#slot-btn-instextart',     this.btnInsertTextArt);
            _injectComponent('#slot-btn-insequation',    this.btnInsertEquation);
            _injectComponent('#slot-btn-inssymbol',      this.btnInsertSymbol);
            _injectComponent('#slot-btn-insslicer',      this.btnInsertSlicer);
            _injectComponent('#slot-btn-sortdesc',       this.btnSortDown);
            _injectComponent('#slot-btn-sortasc',        this.btnSortUp);
            _injectComponent('#slot-btn-setfilter',      this.btnSetAutofilter);
            _injectComponent('#slot-btn-clear-filter',   this.btnClearAutofilter);
            _injectComponent('#slot-btn-table-tpl',      this.btnTableTemplate);
            _injectComponent('#slot-btn-format',         this.cmbNumberFormat);
            _injectComponent('#slot-btn-percents',       this.btnPercentStyle);
            _injectComponent('#slot-btn-currency',       this.btnCurrencyStyle);
            _injectComponent('#slot-btn-digit-dec',      this.btnDecDecimal);
            _injectComponent('#slot-btn-digit-inc',      this.btnIncDecimal);
            _injectComponent('#slot-btn-formula',        this.btnInsertFormula);
            _injectComponent('#slot-btn-named-range',    this.btnNamedRange);
            _injectComponent('#slot-btn-clear',          this.btnClearStyle);
            _injectComponent('#slot-btn-copystyle',      this.btnCopyStyle);
            _injectComponent('#slot-btn-cell-ins',       this.btnAddCell);
            _injectComponent('#slot-btn-cell-del',       this.btnDeleteCell);
            _injectComponent('#slot-btn-colorschemas',   this.btnColorSchemas);
            _injectComponent('#slot-btn-search',         this.btnSearch);
            _injectComponent('#slot-btn-inschart',       this.btnInsertChart);
            _injectComponent('#slot-btn-inssparkline',   this.btnInsertSparkline);
            _injectComponent('#slot-field-styles',       this.listStyles);
            _injectComponent('#slot-btn-chart',          this.btnEditChart);
            _injectComponent('#slot-btn-chart-data',     this.btnEditChartData);
            _injectComponent('#slot-btn-chart-type',     this.btnEditChartType);
            _injectComponent('#slot-btn-pageorient',    this.btnPageOrient);
            _injectComponent('#slot-btn-pagemargins',   this.btnPageMargins);
            _injectComponent('#slot-btn-pagesize',      this.btnPageSize);
            _injectComponent('#slot-btn-printarea',      this.btnPrintArea);
            _injectComponent('#slot-btn-printtitles',    this.btnPrintTitles);
            _injectComponent('#slot-img-align',         this.btnImgAlign);
            _injectComponent('#slot-img-group',         this.btnImgGroup);
            _injectComponent('#slot-img-movefrwd',      this.btnImgForward);
            _injectComponent('#slot-img-movebkwd',      this.btnImgBackward);
            _injectComponent('#slot-btn-scale',         this.btnScale);
            _injectComponent('#slot-btn-condformat',    this.btnCondFormat);
            this.btnsEditHeader = Common.Utils.injectButtons($host.find('.slot-editheader'), 'tlbtn-editheader-', 'toolbar__icon btn-editheader', this.capBtnInsHeader,
                                [SSE.enumLock.editCell, SSE.enumLock.selRangeEdit, SSE.enumLock.headerLock, SSE.enumLock.lostConnect, SSE.enumLock.coAuth]);
            Array.prototype.push.apply(this.lockControls, this.btnsEditHeader);

            return $host;
        },

        createDelayedElements: function() {
            var me = this;

            function _updateHint(cmp, hint) {
                cmp && cmp.updateHint(hint);
            }

            // set hints
            _updateHint(this.btnPrint, this.tipPrint + Common.Utils.String.platformKey('Ctrl+P'));
            _updateHint(this.btnSave, this.btnSaveTip);
            _updateHint(this.btnCopy, this.tipCopy + Common.Utils.String.platformKey('Ctrl+C'));
            _updateHint(this.btnPaste, this.tipPaste + Common.Utils.String.platformKey('Ctrl+V'));
            _updateHint(this.btnUndo, this.tipUndo + Common.Utils.String.platformKey('Ctrl+Z'));
            _updateHint(this.btnRedo, this.tipRedo + Common.Utils.String.platformKey('Ctrl+Y'));
            _updateHint(this.btnIncFontSize, this.tipIncFont + Common.Utils.String.platformKey('Ctrl+]'));
            _updateHint(this.btnDecFontSize, this.tipDecFont + Common.Utils.String.platformKey('Ctrl+['));
            _updateHint(this.btnBold, this.textBold + Common.Utils.String.platformKey('Ctrl+B'));
            _updateHint(this.btnItalic, this.textItalic + Common.Utils.String.platformKey('Ctrl+I'));
            _updateHint(this.btnUnderline, this.textUnderline + Common.Utils.String.platformKey('Ctrl+U'));
            _updateHint(this.btnStrikeout, this.textStrikeout);
            _updateHint(this.btnSubscript, this.textSubSuperscript);
            _updateHint(this.btnTextColor, this.tipFontColor);
            _updateHint(this.btnBackColor, this.tipPrColor);
            _updateHint(this.btnBorders, this.tipBorders);
            _updateHint(this.btnAlignLeft, this.tipAlignLeft);
            _updateHint(this.btnAlignCenter, this.tipAlignCenter);
            _updateHint(this.btnAlignRight, this.tipAlignRight);
            _updateHint(this.btnAlignJust, this.tipAlignJust);
            _updateHint(this.btnMerge, this.tipMerge);
            _updateHint(this.btnAlignTop, this.tipAlignTop);
            _updateHint(this.btnAlignMiddle, this.tipAlignMiddle);
            _updateHint(this.btnAlignBottom, this.tipAlignBottom);
            _updateHint(this.btnWrap, this.tipWrap);
            _updateHint(this.btnTextOrient, this.tipTextOrientation);
            _updateHint(this.btnInsertTable, this.tipInsertTable);
            _updateHint(this.btnInsertImage, this.tipInsertImage);
            _updateHint(this.btnInsertChart, this.tipInsertChartSpark);
            _updateHint(this.btnInsertSparkline, this.tipInsertSpark);
            _updateHint(this.btnInsertText, this.tipInsertText);
            _updateHint(this.btnInsertTextArt, this.tipInsertTextart);
            _updateHint(this.btnInsertHyperlink, this.tipInsertHyperlink + Common.Utils.String.platformKey('Ctrl+K'));
            _updateHint(this.btnInsertShape, this.tipInsertShape);
            _updateHint(this.btnInsertEquation, this.tipInsertEquation);
            _updateHint(this.btnInsertSymbol, this.tipInsertSymbol);
            _updateHint(this.btnInsertSlicer, this.tipInsertSlicer);
            _updateHint(this.btnSortDown, this.txtSortAZ);
            _updateHint(this.btnSortUp, this.txtSortZA);
            _updateHint(this.btnSetAutofilter, this.txtFilter + ' (Ctrl+Shift+L)');
            _updateHint(this.btnClearAutofilter, this.txtClearFilter);
            _updateHint(this.btnSearch, this.txtSearch);
            _updateHint(this.btnTableTemplate, this.txtTableTemplate);
            _updateHint(this.btnPercentStyle, this.tipDigStylePercent);
            _updateHint(this.btnCurrencyStyle, this.tipDigStyleAccounting);
            _updateHint(this.btnDecDecimal, this.tipDecDecimal);
            _updateHint(this.btnIncDecimal, this.tipIncDecimal);
            _updateHint(this.btnInsertFormula, [this.txtAutosumTip + Common.Utils.String.platformKey('Alt+='), this.txtFormula + Common.Utils.String.platformKey('Shift+F3')]);
            _updateHint(this.btnNamedRange, this.txtNamedRange);
            _updateHint(this.btnClearStyle, this.tipClearStyle);
            _updateHint(this.btnCopyStyle, this.tipCopyStyle);
            _updateHint(this.btnAddCell, this.tipInsertOpt + Common.Utils.String.platformKey('Ctrl+Shift+='));
            _updateHint(this.btnDeleteCell, this.tipDeleteOpt + Common.Utils.String.platformKey('Ctrl+Shift+-'));
            _updateHint(this.btnColorSchemas, this.tipColorSchemas);
            _updateHint(this.btnPageOrient, this.tipPageOrient);
            _updateHint(this.btnPageSize, this.tipPageSize);
            _updateHint(this.btnPageMargins, this.tipPageMargins);
            _updateHint(this.btnPrintArea, this.tipPrintArea);
            _updateHint(this.btnPrintTitles, this.tipPrintTitles);
            _updateHint(this.btnScale, this.tipScale);
            _updateHint(this.btnCondFormat, this.tipCondFormat);
            this.btnsEditHeader.forEach(function (btn) {
                _updateHint(btn, me.tipEditHeader);
            });

            // set menus
            if (this.btnBorders && this.btnBorders.rendered) {
                this.btnBorders.setMenu( new Common.UI.Menu({
                    items: [
                        {
                            caption     : this.textOutBorders,
                            iconCls     : 'menu__icon btn-border-out',
                            icls        : 'btn-border-out',
                            borderId    : 'outer'
                        },
                        {
                            caption     : this.textAllBorders,
                            iconCls     : 'menu__icon btn-border-all',
                            icls        : 'btn-border-all',
                            borderId    : 'all'
                        },
                        {
                            caption     : this.textTopBorders,
                            iconCls     : 'menu__icon btn-border-top',
                            icls        : 'btn-border-top',
                            borderId    : Asc.c_oAscBorderOptions.Top
                        },
                        {
                            caption     : this.textBottomBorders,
                            iconCls     : 'menu__icon btn-border-bottom',
                            icls        : 'btn-border-bottom',
                            borderId    : Asc.c_oAscBorderOptions.Bottom
                        },
                        {
                            caption     : this.textLeftBorders,
                            iconCls     : 'menu__icon btn-border-left',
                            icls        : 'btn-border-left',
                            borderId    : Asc.c_oAscBorderOptions.Left
                        },
                        {
                            caption     : this.textRightBorders,
                            iconCls     : 'menu__icon btn-border-right',
                            icls        : 'btn-border-right',
                            borderId    : Asc.c_oAscBorderOptions.Right
                        },
                        {
                            caption     : this.textNoBorders,
                            iconCls     : 'menu__icon btn-border-no',
                            icls        : 'btn-border-no',
                            borderId    : 'none'
                        },
                        {caption: '--'},
                        {
                            caption     : this.textInsideBorders,
                            iconCls     : 'menu__icon btn-border-inside',
                            icls        : 'btn-border-inside',
                            borderId    : 'inner'
                        },
                        {
                            caption     : this.textCenterBorders,
                            iconCls     : 'menu__icon btn-border-insidevert',
                            icls        : 'btn-border-insidevert',
                            borderId    : Asc.c_oAscBorderOptions.InnerV
                        },
                        {
                            caption     : this.textMiddleBorders,
                            iconCls     : 'menu__icon btn-border-insidehor',
                            icls        : 'btn-border-insidehor',
                            borderId    : Asc.c_oAscBorderOptions.InnerH
                        },
                        {
                            caption     : this.textDiagUpBorder,
                            iconCls     : 'menu__icon btn-border-diagup',
                            icls        : 'btn-border-diagup',
                            borderId    : Asc.c_oAscBorderOptions.DiagU
                        },
                        {
                            caption     : this.textDiagDownBorder,
                            iconCls     : 'menu__icon btn-border-diagdown',
                            icls        : 'btn-border-diagdown',
                            borderId    : Asc.c_oAscBorderOptions.DiagD
                        },
                        {caption: '--'},
                        {
                            id          : 'id-toolbar-mnu-item-border-width',
                            caption     : this.textBordersStyle,
                            iconCls     : 'menu__icon btn-border-style',
                            // template    : _.template('<a id="<%= id %>" tabindex="-1" type="menuitem"><span class="menu-item-icon" style="background-image: none; width: 11px; height: 11px; margin: 2px 7px 0 -9px;"></span><%= caption %></a>'),
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
                            template    : _.template('<a id="<%= id %>"tabindex="-1" type="menuitem"><span class="menu-item-icon" style="background-image: none; width: 12px; height: 12px; margin: 2px 9px 0 -11px; border-style: solid; border-width: 3px; border-color: #000;"></span><%= caption %></a>'),
                            menu        : new Common.UI.Menu({
                                menuAlign   : 'tl-tr',
                                cls: 'shifted-left',
                                items       : [
                                    {
                                        id: 'id-toolbar-menu-auto-bordercolor',
                                        caption: this.textAutoColor,
                                        template: _.template('<a tabindex="-1" type="menuitem"><span class="menu-item-icon" style="background-image: none; width: 12px; height: 12px; margin: 1px 7px 0 1px; background-color: #000;"></span><%= caption %></a>'),
                                        stopPropagation: true
                                    },
                                    {caption: '--'},
                                    { template: _.template('<div id="id-toolbar-menu-bordercolor" style="width: 169px; height: 216px; margin: 10px;"></div>'), stopPropagation: true },
                                    { template: _.template('<a id="id-toolbar-menu-new-bordercolor" style="padding-left:12px;">' + this.textNewColor + '</a>'),  stopPropagation: true }
                                ]
                            })
                        })
                    ]
                }));
                this.mnuBorderColorPicker = new Common.UI.ThemeColorPalette({
                    el: $('#id-toolbar-menu-bordercolor')
                });
            }

            if ( this.btnInsertChart ) {
                this.btnInsertChart.setMenu(new Common.UI.Menu({
                    style: 'width: 364px;padding-top: 12px;',
                    items: [
                        { template: _.template('<div id="id-toolbar-menu-insertchart" class="menu-insertchart"></div>') }
                    ]
                }));

                var onShowBefore = function(menu) {
                    var picker = new Common.UI.DataView({
                        el: $('#id-toolbar-menu-insertchart'),
                        parentMenu: menu,
                        showLast: false,
                        restoreHeight: 465,
                        groups: new Common.UI.DataViewGroupStore(Common.define.chartData.getChartGroupData()/*.concat(Common.define.chartData.getSparkGroupData(true))*/),
                        store: new Common.UI.DataViewStore(Common.define.chartData.getChartData()/*.concat(Common.define.chartData.getSparkData())*/),
                        itemTemplate: _.template('<div id="<%= id %>" class="item-chartlist"><svg width="40" height="40" class=\"icon\"><use xlink:href=\"#chart-<%= iconCls %>\"></use></svg></div>')
                    });
                    picker.on('item:click', function (picker, item, record, e) {
                        if (record)
                            me.fireEvent('add:chart', [record.get('group'), record.get('type')]);
                        if (e.type !== 'click') menu.hide();
                    });
                    menu.off('show:before', onShowBefore);
                };
                this.btnInsertChart.menu.on('show:before', onShowBefore);
            }

            if ( this.btnInsertSparkline ) {
                this.btnInsertSparkline.setMenu(new Common.UI.Menu({
                    style: 'width: 166px;padding: 5px 0 10px;',
                    items: [
                        { template: _.template('<div id="id-toolbar-menu-insertspark" class="menu-insertchart"></div>') }
                    ]
                }));

                var onShowBefore = function(menu) {
                    var picker = new Common.UI.DataView({
                        el: $('#id-toolbar-menu-insertspark'),
                        parentMenu: menu,
                        showLast: false,
                        restoreHeight: 50,
                        // groups: new Common.UI.DataViewGroupStore(Common.define.chartData.getSparkGroupData()),
                        store: new Common.UI.DataViewStore(Common.define.chartData.getSparkData()),
                        itemTemplate: _.template('<div id="<%= id %>" class="item-chartlist"><svg width="40" height="40" class=\"icon\"><use xlink:href=\"#chart-<%= iconCls %>\"></use></svg></div>')
                    });
                    picker.on('item:click', function (picker, item, record, e) {
                        if (record)
                            me.fireEvent('add:spark', [record.get('type')]);
                        if (e.type !== 'click') menu.hide();
                    });
                    menu.off('show:before', onShowBefore);
                };
                this.btnInsertSparkline.menu.on('show:before', onShowBefore);
            }

            if (this.btnInsertTextArt) {
                var onShowBeforeTextArt = function (menu) {
                    var collection = SSE.getCollection('Common.Collections.TextArt');
                    if (collection.length<1)
                        SSE.getController('Main').fillTextArt(me.api.asc_getTextArtPreviews());
                    var picker = new Common.UI.DataView({
                        el: $('#id-toolbar-menu-insart'),
                        store: collection,
                        parentMenu: menu,
                        showLast: false,
                        itemTemplate: _.template('<div class="item-art"><img src="<%= imageUrl %>" id="<%= id %>" style="width:50px;height:50px;"></div>')
                    });
                    picker.on('item:click', function (picker, item, record, e) {
                        if (record)
                            me.fireEvent('insert:textart', [record.get('data')]);
                        if (e.type !== 'click') menu.hide();
                    });
                    menu.off('show:before', onShowBeforeTextArt);
                };
                this.btnInsertTextArt.menu.on('show:before', onShowBeforeTextArt);
            }

            if (this.btnCondFormat && this.btnCondFormat.rendered) {
                this.btnCondFormat.setMenu( new Common.UI.Menu({
                    items: [
                        {
                            caption     : Common.define.conditionalData.textValue,
                            menu        : new Common.UI.Menu({
                                menuAlign   : 'tl-tr',
                                items: [
                                    {   caption     : Common.define.conditionalData.textGreater,    type        : Asc.c_oAscCFType.cellIs, value       : Asc.c_oAscCFOperator.greaterThan },
                                    {   caption     : Common.define.conditionalData.textGreaterEq,  type        : Asc.c_oAscCFType.cellIs, value       : Asc.c_oAscCFOperator.greaterThanOrEqual },
                                    {   caption     : Common.define.conditionalData.textLess,       type        : Asc.c_oAscCFType.cellIs, value       : Asc.c_oAscCFOperator.lessThan },
                                    {   caption     : Common.define.conditionalData.textLessEq,     type        : Asc.c_oAscCFType.cellIs, value       : Asc.c_oAscCFOperator.lessThanOrEqual },
                                    {   caption     : Common.define.conditionalData.textEqual,      type        : Asc.c_oAscCFType.cellIs, value       : Asc.c_oAscCFOperator.equal },
                                    {   caption     : Common.define.conditionalData.textNotEqual,   type        : Asc.c_oAscCFType.cellIs, value       : Asc.c_oAscCFOperator.notEqual },
                                    {   caption     : Common.define.conditionalData.textBetween,    type        : Asc.c_oAscCFType.cellIs, value       : Asc.c_oAscCFOperator.between },
                                    {   caption     : Common.define.conditionalData.textNotBetween, type        : Asc.c_oAscCFType.cellIs, value       : Asc.c_oAscCFOperator.notBetween }
                                ]
                            })
                        },
                        {
                            caption     : Common.define.conditionalData.textTop + '/' + Common.define.conditionalData.textBottom,
                            type        : Asc.c_oAscCFType.top10,
                            menu        : new Common.UI.Menu({
                                menuAlign   : 'tl-tr',
                                items: [
                                    { caption: Common.define.conditionalData.textTop + ' 10 ' + this.textItems,      type: Asc.c_oAscCFType.top10, value: 0, percent: false },
                                    { caption: Common.define.conditionalData.textTop + ' 10%',      type: Asc.c_oAscCFType.top10, value: 0, percent: true },
                                    { caption: Common.define.conditionalData.textBottom + ' 10 ' + this.textItems,   type: Asc.c_oAscCFType.top10, value: 1, percent: false },
                                    { caption: Common.define.conditionalData.textBottom + ' 10%',   type: Asc.c_oAscCFType.top10, value: 1, percent: true }
                                ]
                            })
                        },
                        {
                            caption: Common.define.conditionalData.textAverage,
                            menu: new Common.UI.Menu({
                                menuAlign   : 'tl-tr',
                                items: [
                                    { caption: Common.define.conditionalData.textAbove, type: Asc.c_oAscCFType.aboveAverage, value: 0},
                                    { caption: Common.define.conditionalData.textBelow, type: Asc.c_oAscCFType.aboveAverage, value: 1},
                                    { caption: Common.define.conditionalData.textEqAbove, type: Asc.c_oAscCFType.aboveAverage, value: 2},
                                    { caption: Common.define.conditionalData.textEqBelow, type: Asc.c_oAscCFType.aboveAverage,value: 3},
                                    { caption: Common.define.conditionalData.text1Above, type: Asc.c_oAscCFType.aboveAverage, value: 4},
                                    { caption: Common.define.conditionalData.text1Below, type: Asc.c_oAscCFType.aboveAverage, value: 5},
                                    { caption: Common.define.conditionalData.text2Above, type: Asc.c_oAscCFType.aboveAverage, value: 6},
                                    { caption: Common.define.conditionalData.text2Below, type: Asc.c_oAscCFType.aboveAverage, value: 7},
                                    { caption: Common.define.conditionalData.text3Above, type: Asc.c_oAscCFType.aboveAverage, value: 8},
                                    { caption: Common.define.conditionalData.text3Below, type: Asc.c_oAscCFType.aboveAverage, value: 9}
                                ]
                            })
                        },
                        {
                            caption     : Common.define.conditionalData.textText,
                            menu        : new Common.UI.Menu({
                                menuAlign   : 'tl-tr',
                                items: [
                                    { caption: Common.define.conditionalData.textContains,   type: Asc.c_oAscCFType.containsText },
                                    { caption: Common.define.conditionalData.textNotContains,   type: Asc.c_oAscCFType.notContainsText },
                                    { caption: Common.define.conditionalData.textBegins,   type: Asc.c_oAscCFType.beginsWith },
                                    { caption: Common.define.conditionalData.textEnds,   type: Asc.c_oAscCFType.endsWith }
                                ]
                            })
                        },
                        {
                            caption     : Common.define.conditionalData.textDate,
                            menu        : new Common.UI.Menu({
                                menuAlign   : 'tl-tr',
                                items: [
                                    { caption: Common.define.conditionalData.textYesterday,  type: Asc.c_oAscCFType.timePeriod,  value: Asc.c_oAscTimePeriod.yesterday },
                                    { caption: Common.define.conditionalData.textToday,  type: Asc.c_oAscCFType.timePeriod,  value: Asc.c_oAscTimePeriod.today},
                                    { caption: Common.define.conditionalData.textTomorrow,  type: Asc.c_oAscCFType.timePeriod,  value: Asc.c_oAscTimePeriod.tomorrow},
                                    { caption: Common.define.conditionalData.textLast7days,  type: Asc.c_oAscCFType.timePeriod,  value: Asc.c_oAscTimePeriod.last7Days},
                                    { caption: Common.define.conditionalData.textLastWeek,  type: Asc.c_oAscCFType.timePeriod,  value: Asc.c_oAscTimePeriod.lastWeek},
                                    { caption: Common.define.conditionalData.textThisWeek,  type: Asc.c_oAscCFType.timePeriod,  value: Asc.c_oAscTimePeriod.thisWeek},
                                    { caption: Common.define.conditionalData.textNextWeek,  type: Asc.c_oAscCFType.timePeriod,  value: Asc.c_oAscTimePeriod.nextWeek},
                                    { caption: Common.define.conditionalData.textLastMonth,  type: Asc.c_oAscCFType.timePeriod,  value: Asc.c_oAscTimePeriod.lastMonth},
                                    { caption: Common.define.conditionalData.textThisMonth,  type: Asc.c_oAscCFType.timePeriod,  value: Asc.c_oAscTimePeriod.thisMonth},
                                    { caption: Common.define.conditionalData.textNextMonth,  type: Asc.c_oAscCFType.timePeriod,  value: Asc.c_oAscTimePeriod.nextMonth}
                                ]
                            })
                        },
                        {
                            caption: Common.define.conditionalData.textBlank + '/' + Common.define.conditionalData.textError,
                            menu        : new Common.UI.Menu({
                                menuAlign   : 'tl-tr',
                                items: [
                                    { caption: Common.define.conditionalData.textBlanks,   type: Asc.c_oAscCFType.containsBlanks },
                                    { caption: Common.define.conditionalData.textNotBlanks,type: Asc.c_oAscCFType.notContainsBlanks },
                                    { caption: Common.define.conditionalData.textErrors,   type: Asc.c_oAscCFType.containsErrors },
                                    { caption: Common.define.conditionalData.textNotErrors,type: Asc.c_oAscCFType.notContainsErrors }
                                ]
                            })
                        },
                        {
                            caption: Common.define.conditionalData.textDuplicate + '/' + Common.define.conditionalData.textUnique,
                            menu        : new Common.UI.Menu({
                                menuAlign   : 'tl-tr',
                                items: [
                                    { caption: Common.define.conditionalData.textDuplicate,    type: Asc.c_oAscCFType.duplicateValues },
                                    { caption: Common.define.conditionalData.textUnique,       type: Asc.c_oAscCFType.uniqueValues }
                                ]
                            })
                        },
                        {caption: '--'},
                        this.mnuDataBars = new Common.UI.MenuItem({
                            caption     : this.textDataBars,
                            type        : Asc.c_oAscCFType.dataBar,
                            menu        : new Common.UI.Menu({
                                menuAlign   : 'tl-tr',
                                style: 'min-width: auto;',
                                items: []
                            })
                        }),
                        this.mnuColorScales = new Common.UI.MenuItem({
                            caption     : this.textColorScales,
                            type        : Asc.c_oAscCFType.colorScale,
                            menu        : new Common.UI.Menu({
                                menuAlign   : 'tl-tr',
                                style: 'min-width: auto;',
                                items: []
                            })
                        }),
                        this.mnuIconSets = new Common.UI.MenuItem({
                            caption     : Common.define.conditionalData.textIconSets,
                            type        : Asc.c_oAscCFType.iconSet,
                            menu        : new Common.UI.Menu({
                                menuAlign   : 'tl-tr',
                                style: 'min-width: auto;',
                                items: []
                            })
                        }),
                        {caption: '--'},
                        {
                            caption     : Common.define.conditionalData.textFormula,
                            type        : Asc.c_oAscCFType.expression
                        },
                        {caption: '--'},
                        {
                            caption     : this.textNewRule,
                            value       : 'new'
                        },
                        {
                            caption     : this.textClearRule,
                            menu        : new Common.UI.Menu({
                                menuAlign   : 'tl-tr',
                                items: [
                                    { value: 'clear', type: Asc.c_oAscSelectionForCFType.selection, caption: this.textSelection },
                                    { value: 'clear', type: Asc.c_oAscSelectionForCFType.worksheet, caption: this.textThisSheet },
                                    { value: 'clear', type: Asc.c_oAscSelectionForCFType.table, caption: this.textThisTable },
                                    { value: 'clear', type: Asc.c_oAscSelectionForCFType.pivot, caption: this.textThisPivot }
                                ]
                            })
                        },
                        {
                            caption     : this.textManageRule,
                            value       : 'manage'
                        }
                    ]
                }));
            }

            if (!this.mode.isEditMailMerge && !this.mode.isEditDiagram)
                this.updateMetricUnit();
        },

        onToolbarAfterRender: function(toolbar) {
            // DataView and pickers
            //
            if (this.btnTextColor && this.btnTextColor.cmpEl) {
                this.btnTextColor.setColor(this.btnTextColor.currentColor || 'transparent');
                this.mnuTextColorPicker = new Common.UI.ThemeColorPalette({
                    el: $('#id-toolbar-menu-fontcolor')
                });
            }
            if (this.btnBackColor && this.btnBackColor.cmpEl) {
                this.btnBackColor.setColor(this.btnBackColor.currentColor || 'transparent');
                this.mnuBackColorPicker = new Common.UI.ThemeColorPalette({
                    el: $('#id-toolbar-menu-paracolor'),
                    transparent: true
                });
            }
        },

        updateMetricUnit: function () {
            var items = this.btnPageMargins.menu.items;
            for (var i = 0; i < items.length; i++) {
                var mnu = items[i];
                if (mnu.checkable) {
                    var checked = mnu.checked;
                    $(mnu.el).html(mnu.template({
                        id: Common.UI.getId(),
                        caption: mnu.caption,
                        options: mnu.options
                    }));
                    if (checked) mnu.setChecked(checked);
                }
            }
            items = this.btnPageSize.menu.items;
            for (var i = 0; i < items.length; i++) {
                var mnu = items[i];
                if (mnu.checkable) {
                    var checked = mnu.checked;
                    $(mnu.el).html(mnu.template({
                        id: Common.UI.getId(),
                        caption: mnu.caption,
                        options: mnu.options
                    }));
                    if (checked) mnu.setChecked(checked);
                }
            }
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
                    {array:[this.btnEditChart, this.btnEditChartData, this.btnEditChartType, this.btnUndo,this.btnRedo]} );
                if (!mode.enableDownload)
                    this.lockToolbar(SSE.enumLock.cantPrint, true, {array: [this.btnPrint]});
            } else {
                this.mode = mode;
                this.lockToolbar(SSE.enumLock.cantPrint, !mode.canPrint, {array: [this.btnPrint]});
            }

            return this;
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
                this.mnuColorSchema = new Common.UI.Menu({
                    cls: 'shifted-left',
                    restoreHeight: true
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

                if (index == 22) {
                    this.mnuColorSchema.addItem({
                        caption : '--'
                    });
                }
                var name = schema.get_name();
                this.mnuColorSchema.addItem({
                    template: itemTemplate,
                    cls     : 'color-schemas-menu',
                    colors  : schemecolors,
                    caption: (index < 22) ? (me.SchemeNames[index] || name) : name,
                    value: index,
                    checkable: true,
                    toggleGroup: 'menuSchema'
                });
            }, this);
        },

        onApiCollaborativeChanges: function() {
            if (this._state.hasCollaborativeChanges) return;
            if (!this.btnCollabChanges.rendered) {
                // this.needShowSynchTip = true;
                return;
            }

            this._state.hasCollaborativeChanges = true;
            this.btnCollabChanges.cmpEl.addClass('notify');

            if (this.showSynchTip){
                this.btnCollabChanges.updateHint('');
                if (this.synchTooltip===undefined)
                    this.createSynchTip();

                this.synchTooltip.show();
            } else {
                this.btnCollabChanges.updateHint(this.tipSynchronize + Common.Utils.String.platformKey('Ctrl+S'));
            }

            this.btnSave.setDisabled(false);
            Common.Gateway.collaborativeChanges();
        },

        createSynchTip: function () {
            this.synchTooltip = new Common.UI.SynchronizeTip({
                extCls: (this.mode.customization && !!this.mode.customization.compactHeader) ? undefined : 'inc-index',
                placement: 'right-bottom',
                target: this.btnCollabChanges.$el
            });
            this.synchTooltip.on('dontshowclick', function() {
                this.showSynchTip = false;
                this.synchTooltip.hide();
                this.btnCollabChanges.updateHint(this.tipSynchronize + Common.Utils.String.platformKey('Ctrl+S'));
                Common.localStorage.setItem('sse-hide-synch', 1);
            }, this);
            this.synchTooltip.on('closeclick', function() {
                this.synchTooltip.hide();
                this.btnCollabChanges.updateHint(this.tipSynchronize + Common.Utils.String.platformKey('Ctrl+S'));
            }, this);
        },

        synchronizeChanges: function() {
            if (this.btnCollabChanges.rendered) {
                var me = this;

                if ( me.btnCollabChanges.cmpEl.hasClass('notify') ) {
                    me.btnCollabChanges.cmpEl.removeClass('notify');
                    if (this.synchTooltip)
                        this.synchTooltip.hide();
                    this.btnCollabChanges.updateHint(this.btnSaveTip);
                    this.btnSave.setDisabled(!me.mode.forcesave);

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
            if (cls !== this.btnSaveCls && this.btnCollabChanges.rendered) {
                this.btnSaveTip = ((length>1) ? this.tipSaveCoauth : this.tipSave )+ Common.Utils.String.platformKey('Ctrl+S');
                this.btnCollabChanges.updateHint(this.btnSaveTip);
                this.btnCollabChanges.$icon.removeClass(this.btnSaveCls).addClass(cls);
                this.btnSaveCls = cls;
            }
        },

        onAppReady: function (config) {
            if (!this.mode.isEdit || this.mode.isEditMailMerge || this.mode.isEditDiagram) return;

            var me = this;
            var _holder_view = SSE.getController('DocumentHolder').getView('DocumentHolder');
            me.btnImgForward.updateHint(me.tipSendForward);
            me.btnImgForward.setMenu(new Common.UI.Menu({
                items: [{
                    caption : _holder_view.textArrangeFront,
                    iconCls : 'menu__icon arrange-front',
                    value  : Asc.c_oAscDrawingLayerType.BringToFront
                }, {
                    caption : _holder_view.textArrangeForward,
                    iconCls : 'menu__icon arrange-forward',
                    value  : Asc.c_oAscDrawingLayerType.BringForward
                }
                ]})
            );

            me.btnImgBackward.updateHint(me.tipSendBackward);
            me.btnImgBackward.setMenu(new Common.UI.Menu({
                items: [{
                    caption : _holder_view.textArrangeBack,
                    iconCls : 'menu__icon arrange-back',
                    value  : Asc.c_oAscDrawingLayerType.SendToBack
                }, {
                    caption : _holder_view.textArrangeBackward,
                    iconCls : 'menu__icon arrange-backward',
                    value  : Asc.c_oAscDrawingLayerType.SendBackward
                }]
            }));

            me.btnImgAlign.updateHint(me.tipImgAlign);
            me.btnImgAlign.setMenu(new Common.UI.Menu({
                items: [{
                    caption : _holder_view.textShapeAlignLeft,
                    iconCls : 'menu__icon shape-align-left',
                    value   : 0
                }, {
                    caption : _holder_view.textShapeAlignCenter,
                    iconCls : 'menu__icon shape-align-center',
                    value   : 4
                }, {
                    caption : _holder_view.textShapeAlignRight,
                    iconCls : 'menu__icon shape-align-right',
                    value   : 1
                }, {
                    caption : _holder_view.textShapeAlignTop,
                    iconCls : 'menu__icon shape-align-top',
                    value   : 3
                }, {
                    caption : _holder_view.textShapeAlignMiddle,
                    iconCls : 'menu__icon shape-align-middle',
                    value   : 5
                }, {
                    caption : _holder_view.textShapeAlignBottom,
                    iconCls : 'menu__icon shape-align-bottom',
                    value   : 2
                },
                {caption: '--'},
                {
                    caption: _holder_view.txtDistribHor,
                    iconCls: 'menu__icon shape-distribute-hor',
                    value: 6
                },
                {
                    caption: _holder_view.txtDistribVert,
                    iconCls: 'menu__icon shape-distribute-vert',
                    value: 7
                }]
            }));

            me.btnImgGroup.updateHint(me.tipImgGroup);
            me.btnImgGroup.setMenu(new Common.UI.Menu({
                items: [{
                    caption : _holder_view.txtGroup,
                    iconCls : 'menu__icon shape-group',
                    value: 'grouping'
                }, {
                    caption : _holder_view.txtUngroup,
                    iconCls : 'menu__icon shape-ungroup',
                    value: 'ungrouping'
                }]
            }));

        },

        textBold:           'Bold',
        textItalic:         'Italic',
        textUnderline:      'Underline',
        textStrikeout:      'Strikeout',
        textSuperscript:    'Superscript',
        textSubscript:      'Subscript',
        textSubSuperscript: 'Subscript/Superscript',
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
        tipInsertImage:     'Insert Image',
        tipInsertHyperlink: 'Add Hyperlink',
        tipSynchronize:     'The document has been changed by another user. Please click to save your changes and reload the updates.',
        tipIncFont:         'Increment font size',
        tipDecFont:         'Decrement font size',
        tipInsertText:      'Insert Text',
        tipInsertTextart:   'Insert Text Art',
        tipInsertShape:     'Insert Autoshape',
        tipDigStylePercent: 'Percent Style',
//        tipDigStyleCurrency:'Currency Style',
        tipDigStyleAccounting: 'Accounting Style',
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
        txtAdditional:      'Insert Function',
        mniImageFromFile:   'Image from file',
        mniImageFromUrl:    'Image from url',
        textNewColor:       'Add New Custom Color',
        tipInsertChart:     'Insert Chart',
        tipEditChart:       'Edit Chart',
        textPrint:          'Print',
        textPrintOptions:   'Print Options',
        tipColorSchemas:    'Change Color Scheme',
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
        textInsCharts:      'Charts',
        tipInsertEquation:  'Insert Equation',
        tipInsertChartSpark: 'Insert Chart',
        textMoreFormats: 'More formats',
        capInsertText: 'Text',
        capInsertTextart: 'Text Art',
        capInsertImage: 'Image',
        capInsertShape: 'Shape',
        capInsertChart: 'Chart',
        capInsertHyperlink: 'Hyperlink',
        capInsertEquation: 'Equation',
        capBtnComment: 'Comment',
        textTabFile: 'File',
        textTabHome: 'Home',
        textTabInsert: 'Insert',
        tipChangeChart: 'Change Chart Type',
        textTabCollaboration: 'Collaboration',
        textTabProtect: 'Protection',
        textTabLayout: 'Layout',
        capBtnPageOrient: 'Orientation',
        capBtnMargins: 'Margins',
        capBtnPageSize: 'Size',
        tipImgAlign: 'Align objects',
        tipImgGroup: 'Group objects',
        tipSendForward: 'Bring forward',
        tipSendBackward: 'Send backward',
        capImgAlign: 'Align',
        capImgGroup: 'Group',
        capImgForward: 'Bring Forward',
        capImgBackward: 'Send Backward',
        tipPageSize: 'Page Size',
        tipPageOrient: 'Page Orientation',
        tipPageMargins: 'Page Margins',
        textMarginsLast: 'Last Custom',
        textMarginsNormal: 'Normal',
        textMarginsNarrow: 'Narrow',
        textMarginsWide: 'Wide',
        textPageMarginsCustom: 'Custom margins',
        textTop: 'Top: ',
        textLeft: 'Left: ',
        textBottom: 'Bottom: ',
        textRight: 'Right: ',
        textPortrait: 'Portrait',
        textLandscape: 'Landscape',
        mniImageFromStorage: 'Image from Storage',
        capBtnPrintArea: 'Print Area',
        textSetPrintArea: 'Set Print Area',
        textClearPrintArea: 'Clear Print Area',
        textAddPrintArea: 'Add to Print Area',
        tipPrintArea: 'Print area',
        capBtnInsHeader: 'Header/Footer',
        tipEditHeader: 'Edit header or footer',
        textTabData: 'Data',
        capInsertTable: 'Table',
        tipInsertTable: 'Insert table',
        textTabFormula: 'Formula',
        capBtnScale: 'Scale to Fit',
        tipScale: 'Scale to Fit',
        textScaleCustom: 'Custom',
        textScale: 'Scale',
        textAuto: 'Auto',
        textOnePage: 'page',
        textFewPages: 'pages',
        textManyPages: 'pages',
        textHeight: 'Height',
        textWidth: 'Width',
        textMorePages: 'More pages',
        capBtnAddComment: 'Add Comment',
        capBtnInsSymbol: 'Symbol',
        tipInsertSymbol: 'Insert symbol',
        txtAutosumTip: 'Summation',
        capBtnPrintTitles: 'Print Titles',
        tipPrintTitles: 'Print titles',
        capBtnColorSchemas: 'Color Scheme',
        tipCondFormat: 'Conditional formatting',
        textDataBars: 'Data Bars',
        textColorScales: 'Color Scales',
        textNewRule: 'New Rule',
        textClearRule: 'Clear Rules',
        textSelection: 'From current selection',
        textThisSheet: 'From this worksheet',
        textThisTable: 'From this table',
        textThisPivot: 'From this pivot',
        textManageRule: 'Manage Rules',
        capBtnInsSlicer: 'Slicer',
        tipInsertSlicer: 'Insert slicer',
        textVertical: 'Vertical Text',
        textTabView: 'View',
        tipEditChartData: 'Select Data',
        tipEditChartType: 'Change Chart Type',
        textAutoColor: 'Automatic',
        textItems: 'Items',
        tipInsertSpark: 'Insert sparkline',
        capInsertSpark: 'Sparklines',
        txtScheme22: 'New Office'
    }, SSE.Views.Toolbar || {}));
});