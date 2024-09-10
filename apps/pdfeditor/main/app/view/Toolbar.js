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
 *  Toolbar.js
 *
 *  Toolbar view
 *
 *  Created on 05/04/23
 *
 */
if (Common === undefined)
    var Common = {};

define([
    'jquery',
    'underscore',
    'backbone',
    'text!pdfeditor/main/app/template/Toolbar.template',
    'text!documenteditor/main/app/template/ToolbarView.template',
    'common/main/lib/collection/Fonts',
    'common/main/lib/component/Button',
    'common/main/lib/component/ColorButton',
    'common/main/lib/component/ComboBox',
    'common/main/lib/component/DataView',
    'common/main/lib/component/ColorPalette',
    'common/main/lib/component/ThemeColorPalette',
    'common/main/lib/component/Menu',
    'common/main/lib/component/Window',
    'common/main/lib/component/ComboBoxFonts',
    'common/main/lib/component/ComboDataView',
    'common/main/lib/component/SynchronizeTip',
    'common/main/lib/component/Mixtbar',
    'common/main/lib/component/ComboDataViewShape'
], function ($, _, Backbone, template, template_view) {
    'use strict';

    if (!Common.enumLock)
        Common.enumLock = {};

    var enumLock = {
        undoLock:       'can-undo',
        redoLock:       'can-redo',
        copyLock:       'can-copy',
        cutLock:        'can-cut',
        inLightTheme:   'light-theme',
        noParagraphSelected:  'no-paragraph',
        noTextSelected:  'no-text',
        cantPrint:      'cant-print',
        lostConnect:    'disconnect',
        disableOnStart: 'on-start',
        firstPage: 'first-page',
        lastPage: 'last-page',
        requiredNotFilled: 'required-not-filled',
        submit: 'submit',
        fileMenuOpened: 'file-menu-opened',
        paragraphLock:  'para-lock',
        shapeLock:      'shape-lock',
        incIndentLock:   'can-inc-indent',
        decIndentLock:   'can-dec-indent',
        hyperlinkLock:   'can-hyperlink',
        noObjectSelected:  'no-object', // no objects in stack from asc_onFocusObject event
        noDrawingObjects:  'no-drawing-object', // asc_getSelectedDrawingObjectsCount<1 (2 selected tables: noObjectSelected=true, noDrawingObjects = false)
        noColumns: 'no-columns',
        inSmartart: 'in-smartart',
        inSmartartInternal: 'in-smartart-internal',
        inEquation: 'in-equation',
        inAnnotation: 'in-annotation',
        singlePage: 'single-page'
    };
    for (var key in enumLock) {
        if (enumLock.hasOwnProperty(key)) {
            Common.enumLock[key] = enumLock[key];
        }
    }

    PDFE.Views.Toolbar =  Common.UI.Mixtbar.extend(_.extend((function(){

        return {
            el: '#toolbar',

            // Compile our stats template
            // template: _.template(template),

            // Delegated events for creating new items, and clearing completed ones.
            events: {
                //
            },

            initialize: function () {
                var me = this;

                /**
                 * UI Components
                 */

                this.paragraphControls = [];
                this.toolbarControls = [];
                this.shapeControls = [];
                this._state = {
                    hasCollaborativeChanges: undefined
                };
                Common.NotificationCenter.on('app:ready', me.onAppReady.bind(this));
                return this;
            },

            applyLayoutPDFEdit: function(config) {
                if (!config.isPDFEdit) return;

                var _set = Common.enumLock,
                    arr = []
                // tab Edit
                this.btnEditText = new Common.UI.Button({
                    id: 'id-toolbar-btn-edittext',
                    cls: 'btn-toolbar x-huge icon-top',
                    style: 'min-width: 45px;',
                    iconCls: 'toolbar__icon btn-big-magic-wand',
                    lock: [_set.lostConnect, _set.disableOnStart],
                    caption: this.capBtnRecognize,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                this.toolbarControls.push(this.btnEditText);
                arr.push(this.btnEditText);

                this.cmbFontName = new Common.UI.ComboBoxFonts({
                    cls: 'input-group-nr',
                    menuCls: 'scrollable-menu',
                    menuStyle: 'min-width: 325px;',
                    hint: this.tipFontName,
                    lock: [_set.paragraphLock, _set.lostConnect, _set.noTextSelected, _set.shapeLock, _set.disableOnStart],
                    store: new Common.Collections.Fonts(),
                    dataHint: '1',
                    dataHintDirection: 'top'
                });
                this.paragraphControls.push(this.cmbFontName);
                arr.push(this.cmbFontName);

                this.cmbFontSize = new Common.UI.ComboBox({
                    cls: 'input-group-nr',
                    menuStyle: 'min-width: 55px;',
                    hint: this.tipFontSize,
                    lock: [_set.paragraphLock, _set.lostConnect, _set.noTextSelected, _set.shapeLock, _set.disableOnStart],
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
                    ],
                    dataHint: '1',
                    dataHintDirection: 'top'
                });
                this.paragraphControls.push(this.cmbFontSize);
                arr.push(this.cmbFontSize);

                this.btnIncFontSize = new Common.UI.Button({
                    id: 'id-toolbar-btn-incfont',
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-incfont',
                    lock: [_set.paragraphLock, _set.lostConnect, _set.noTextSelected, _set.shapeLock, _set.disableOnStart],
                    dataHint: '1',
                    dataHintDirection: 'top'
                });
                this.paragraphControls.push(this.btnIncFontSize);
                arr.push(this.btnIncFontSize);

                this.btnDecFontSize = new Common.UI.Button({
                    id: 'id-toolbar-btn-decfont',
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-decfont',
                    lock: [_set.paragraphLock, _set.lostConnect, _set.noTextSelected, _set.shapeLock, _set.disableOnStart],
                    dataHint: '1',
                    dataHintDirection: 'top'
                });
                this.paragraphControls.push(this.btnDecFontSize);
                arr.push(this.btnDecFontSize);

                this.btnBold = new Common.UI.Button({
                    id: 'id-toolbar-btn-bold',
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-bold',
                    lock: [_set.paragraphLock, _set.lostConnect, _set.noTextSelected, _set.shapeLock, _set.disableOnStart],
                    enableToggle: true,
                    dataHint: '1',
                    dataHintDirection: 'bottom'
                });
                this.paragraphControls.push(this.btnBold);
                arr.push(this.btnBold);

                this.btnItalic = new Common.UI.Button({
                    id: 'id-toolbar-btn-italic',
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-italic',
                    lock: [_set.paragraphLock, _set.lostConnect, _set.noTextSelected, _set.shapeLock, _set.disableOnStart],
                    enableToggle: true,
                    dataHint: '1',
                    dataHintDirection: 'bottom'
                });
                this.paragraphControls.push(this.btnItalic);
                arr.push(this.btnItalic);

                this.btnTextUnderline = new Common.UI.Button({
                    id: 'id-toolbar-btn-underline',
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-underline',
                    lock: [_set.paragraphLock, _set.lostConnect, _set.noTextSelected, _set.shapeLock, _set.disableOnStart],
                    enableToggle: true,
                    dataHint: '1',
                    dataHintDirection: 'bottom'
                });
                this.paragraphControls.push(this.btnTextUnderline);
                arr.push(this.btnTextUnderline);

                this.btnTextStrikeout = new Common.UI.Button({
                    id: 'id-toolbar-btn-strikeout',
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-strikeout',
                    lock: [_set.paragraphLock, _set.lostConnect, _set.noTextSelected, _set.shapeLock, _set.disableOnStart],
                    enableToggle: true,
                    dataHint: '1',
                    dataHintDirection: 'bottom'
                });
                this.paragraphControls.push(this.btnTextStrikeout);
                arr.push(this.btnTextStrikeout);

                this.btnSuperscript = new Common.UI.Button({
                    id: 'id-toolbar-btn-superscript',
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-superscript',
                    lock: [_set.paragraphLock, _set.lostConnect, _set.noTextSelected, _set.shapeLock, _set.disableOnStart, _set.inEquation],
                    enableToggle: true,
                    toggleGroup: 'superscriptGroup',
                    dataHint: '1',
                    dataHintDirection: 'bottom'
                });
                this.paragraphControls.push(this.btnSuperscript);
                arr.push(this.btnSuperscript);

                this.btnSubscript = new Common.UI.Button({
                    id: 'id-toolbar-btn-subscript',
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-subscript',
                    lock: [_set.paragraphLock, _set.lostConnect, _set.noTextSelected, _set.shapeLock, _set.disableOnStart, _set.inEquation],
                    enableToggle: true,
                    toggleGroup: 'superscriptGroup',
                    dataHint: '1',
                    dataHintDirection: 'bottom'
                });
                this.paragraphControls.push(this.btnSubscript);
                arr.push(this.btnSubscript);

                this.btnTextHighlightColor = new Common.UI.ButtonColored({
                    id: 'id-toolbar-btn-text-highlight',
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-highlight',
                    enableToggle: true,
                    allowDepress: true,
                    split: true,
                    lock: [_set.paragraphLock, _set.lostConnect, _set.noTextSelected, _set.shapeLock, _set.disableOnStart, _set.inAnnotation],
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: '0, -16',
                    menu: new Common.UI.Menu({
                        style: 'min-width: 100px;',
                        items: [
                            {template: _.template('<div id="id-toolbar-menu-text-highlight" style="width: 145px; display: inline-block;"></div>')},
                            {caption: '--'},
                            this.mnuTextHighlightTransparent = new Common.UI.MenuItem({
                                caption: this.strMenuNoFill,
                                checkable: true
                            })
                        ]
                    })
                });
                this.paragraphControls.push(this.btnTextHighlightColor);
                arr.push(this.btnTextHighlightColor);

                this.btnFontColor = new Common.UI.ButtonColored({
                    id: 'id-toolbar-btn-fontcolor',
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-fontcolor',
                    lock: [_set.paragraphLock, _set.lostConnect, _set.noTextSelected, _set.shapeLock, _set.disableOnStart],
                    split: true,
                    menu: true,
                    eyeDropper: true,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: '0, -16',
                    penOptions: {color: '000000'}
                });
                this.paragraphControls.push(this.btnFontColor);
                arr.push(this.btnFontColor);

                this.btnChangeCase = new Common.UI.Button({
                    id: 'id-toolbar-btn-case',
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-change-case',
                    lock: [_set.paragraphLock, _set.lostConnect, _set.noTextSelected, _set.shapeLock, _set.disableOnStart],
                    menu: new Common.UI.Menu({
                        items: [
                            {caption: this.mniSentenceCase, value: Asc.c_oAscChangeTextCaseType.SentenceCase},
                            {caption: this.mniLowerCase, value: Asc.c_oAscChangeTextCaseType.LowerCase},
                            {caption: this.mniUpperCase, value: Asc.c_oAscChangeTextCaseType.UpperCase},
                            {caption: this.mniCapitalizeWords, value: Asc.c_oAscChangeTextCaseType.CapitalizeWords},
                            {caption: this.mniToggleCase, value: Asc.c_oAscChangeTextCaseType.ToggleCase}
                        ]
                    }),
                    dataHint: '1',
                    dataHintDirection: 'top',
                    dataHintOffset: '0, -6'
                });
                this.paragraphControls.push(this.btnChangeCase);
                arr.push(this.btnChangeCase);
                this.mnuChangeCase = this.btnChangeCase.menu;

                this.btnClearStyle = new Common.UI.Button({
                    id: 'id-toolbar-btn-clearstyle',
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-clearstyle',
                    lock: [ _set.paragraphLock, _set.lostConnect, _set.noTextSelected, _set.disableOnStart],
                    dataHint: '1',
                    dataHintDirection: 'bottom'
                });
                this.paragraphControls.push(this.btnClearStyle);
                arr.push(this.btnClearStyle);

                this.btnMarkers = new Common.UI.Button({
                    id: 'id-toolbar-btn-markers',
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon ' + (!Common.UI.isRTL() ? 'btn-setmarkers' : 'btn-setmarkers-rtl'),
                    lock: [_set.paragraphLock, _set.lostConnect, _set.noParagraphSelected, _set.inSmartart, _set.inSmartartInternal, _set.disableOnStart, _set.inAnnotation],
                    enableToggle: true,
                    toggleGroup: 'markersGroup',
                    split: true,
                    menu: true,
                    dataHint: '1',
                    dataHintDirection: 'top',
                    dataHintOffset: '0, -16'
                });
                this.paragraphControls.push(this.btnMarkers);
                arr.push(this.btnMarkers);

                this.btnNumbers = new Common.UI.Button({
                    id: 'id-toolbar-btn-numbering',
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon ' + (!Common.UI.isRTL() ? 'btn-numbering' : 'btn-numbering-rtl'),
                    lock: [_set.paragraphLock, _set.lostConnect, _set.noParagraphSelected, _set.inSmartart, _set.inSmartartInternal, _set.disableOnStart, _set.inAnnotation],
                    enableToggle: true,
                    toggleGroup: 'markersGroup',
                    split: true,
                    menu: true,
                    dataHint: '1',
                    dataHintDirection: 'top',
                    dataHintOffset: '0, -16'
                });
                this.paragraphControls.push(this.btnNumbers);
                arr.push(this.btnNumbers);

                var clone = function (source) {
                    var obj = {};
                    for (var prop in source)
                        obj[prop] = (typeof(source[prop]) == 'object') ? clone(source[prop]) : source[prop];
                    return obj;
                };

                this.mnuMarkersPicker = {
                    conf: {index: 0},
                    selectByIndex: function (idx) {
                        this.conf.index = idx;
                    }
                };
                this.mnuNumbersPicker = clone(this.mnuMarkersPicker);

                this.btnHorizontalAlign = new Common.UI.Button({
                    id: 'id-toolbar-btn-halign',
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-align-left',
                    icls: 'btn-align-left',
                    lock: [_set.paragraphLock, _set.lostConnect, _set.noParagraphSelected, _set.disableOnStart, _set.inAnnotation],
                    menu: new Common.UI.Menu({
                        items: [
                            {
                                caption: this.textAlignLeft + Common.Utils.String.platformKey('Ctrl+L'),
                                iconCls: 'menu__icon btn-align-left',
                                icls: 'btn-align-left',
                                checkable: true,
                                checkmark: false,
                                toggleGroup: 'halignGroup',
                                checked: true,
                                value: 1
                            },
                            {
                                caption: this.textAlignCenter + Common.Utils.String.platformKey('Ctrl+E'),
                                iconCls: 'menu__icon btn-align-center',
                                icls: 'btn-align-center',
                                checkable: true,
                                checkmark: false,
                                toggleGroup: 'halignGroup',
                                value: 2
                            },
                            {
                                caption: this.textAlignRight + Common.Utils.String.platformKey('Ctrl+R'),
                                iconCls: 'menu__icon btn-align-right',
                                icls: 'btn-align-right',
                                checkable: true,
                                checkmark: false,
                                toggleGroup: 'halignGroup',
                                value: 0
                            },
                            {
                                caption: this.textAlignJust + Common.Utils.String.platformKey('Ctrl+J'),
                                iconCls: 'menu__icon btn-align-just',
                                icls: 'btn-align-just',
                                checkable: true,
                                checkmark: false,
                                toggleGroup: 'halignGroup',
                                value: 3
                            }
                        ]
                    }),
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: '0, -6'
                });
                this.paragraphControls.push(this.btnHorizontalAlign);
                arr.push(this.btnHorizontalAlign);

                this.btnVerticalAlign = new Common.UI.Button({
                    id: 'id-toolbar-btn-valign',
                    cls: 'btn-toolbar',
                    lock: [_set.paragraphLock, _set.lostConnect, _set.noParagraphSelected, _set.noObjectSelected, _set.disableOnStart, _set.inAnnotation],
                    iconCls: 'toolbar__icon btn-align-middle',
                    icls: 'btn-align-middle',
                    menu: new Common.UI.Menu({
                        items: [
                            {
                                caption: this.textAlignTop,
                                iconCls: 'menu__icon btn-align-top',
                                icls: 'btn-align-top',
                                checkable: true,
                                checkmark: false,
                                toggleGroup: 'valignGroup',
                                value: Asc.c_oAscVAlign.Top
                            },
                            {
                                caption: this.textAlignMiddle,
                                iconCls: 'menu__icon btn-align-middle',
                                icls: 'btn-align-middle',
                                checkable: true,
                                checkmark: false,
                                toggleGroup: 'valignGroup',
                                value: Asc.c_oAscVAlign.Center,
                                checked: true
                            },
                            {
                                caption: this.textAlignBottom,
                                iconCls: 'menu__icon btn-align-bottom',
                                icls: 'btn-align-bottom',
                                checkable: true,
                                checkmark: false,
                                toggleGroup: 'valignGroup',
                                value: Asc.c_oAscVAlign.Bottom
                            }
                        ]
                    }),
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: '0, -6'
                });
                this.paragraphControls.push(this.btnVerticalAlign);
                arr.push(this.btnVerticalAlign);

                this.btnDecLeftOffset = new Common.UI.Button({
                    id: 'id-toolbar-btn-decoffset',
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-decoffset',
                    lock: [_set.decIndentLock, _set.paragraphLock, _set.lostConnect, _set.noParagraphSelected, _set.inSmartart, _set.inSmartartInternal, _set.disableOnStart, _set.inAnnotation],
                    dataHint: '1',
                    dataHintDirection: 'top'
                });
                this.paragraphControls.push(this.btnDecLeftOffset);
                arr.push(this.btnDecLeftOffset);

                this.btnIncLeftOffset = new Common.UI.Button({
                    id: 'id-toolbar-btn-incoffset',
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-incoffset',
                    lock: [_set.incIndentLock, _set.paragraphLock, _set.lostConnect, _set.noParagraphSelected, _set.inSmartart, _set.inSmartartInternal, _set.disableOnStart, _set.inAnnotation],
                    dataHint: '1',
                    dataHintDirection: 'top'
                });
                this.paragraphControls.push(this.btnIncLeftOffset);
                arr.push(this.btnIncLeftOffset);

                this.btnLineSpace = new Common.UI.Button({
                    id: 'id-toolbar-btn-linespace',
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-linespace',
                    lock: [_set.paragraphLock, _set.lostConnect, _set.noParagraphSelected, _set.disableOnStart, _set.inAnnotation],
                    menu: new Common.UI.Menu({
                        style: 'min-width: 60px;',
                        items: [
                            {caption: '1.0', value: 1.0, checkable: true, toggleGroup: 'linesize'},
                            {caption: '1.15', value: 1.15, checkable: true, toggleGroup: 'linesize'},
                            {caption: '1.5', value: 1.5, checkable: true, toggleGroup: 'linesize'},
                            {caption: '2.0', value: 2.0, checkable: true, toggleGroup: 'linesize'},
                            {caption: '2.5', value: 2.5, checkable: true, toggleGroup: 'linesize'},
                            {caption: '3.0', value: 3.0, checkable: true, toggleGroup: 'linesize'}
                        ]
                    }),
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: '0, -6'
                });
                this.paragraphControls.push(this.btnLineSpace);
                arr.push(this.btnLineSpace);

                this.btnColumns = new Common.UI.Button({
                    id: 'id-toolbar-btn-columns',
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-columns-two',
                    lock: [_set.paragraphLock, _set.lostConnect, _set.noParagraphSelected, _set.noColumns, _set.disableOnStart, _set.inAnnotation],
                    menu: new Common.UI.Menu({
                        cls: 'ppm-toolbar shifted-right',
                        items: [
                            {
                                caption: this.textColumnsOne,
                                iconCls: 'menu__icon btn-columns-one',
                                checkable: true,
                                checkmark: false,
                                toggleGroup: 'menuColumns',
                                value: 0
                            },
                            {
                                caption: this.textColumnsTwo,
                                iconCls: 'menu__icon btn-columns-two',
                                checkable: true,
                                checkmark: false,
                                toggleGroup: 'menuColumns',
                                value: 1
                            },
                            {
                                caption: this.textColumnsThree,
                                iconCls: 'menu__icon btn-columns-three',
                                checkable: true,
                                checkmark: false,
                                toggleGroup: 'menuColumns',
                                value: 2
                            },
                            {caption: '--'},
                            {caption: this.textColumnsCustom, value: 'advanced'}
                        ]
                    }),
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: '0, -6'
                });
                this.paragraphControls.push(this.btnColumns);
                arr.push(this.btnColumns);

                this.mniAlignToSlide = new Common.UI.MenuItem({
                    caption: this.txtPageAlign,
                    checkable: true,
                    toggleGroup: 'slidealign',
                    value: -1
                }).on('click', function (mnu) {
                    Common.Utils.InternalSettings.set("pdfe-align-to-slide", true);
                });
                this.mniAlignObjects = new Common.UI.MenuItem({
                    caption: this.txtObjectsAlign,
                    checkable: true,
                    toggleGroup: 'slidealign',
                    value: -1
                }).on('click', function (mnu) {
                    Common.Utils.InternalSettings.set("pdfe-align-to-slide", false);
                });

                this.mniDistribHor = new Common.UI.MenuItem({
                    caption: this.txtDistribHor,
                    iconCls: 'menu__icon btn-shape-distribute-hor',
                    value: 6
                });
                this.mniDistribVert = new Common.UI.MenuItem({
                    caption: this.txtDistribVert,
                    iconCls: 'menu__icon btn-shape-distribute-vert',
                    value: 7
                });

                this.btnShapeAlign = new Common.UI.Button({
                    id: 'id-toolbar-btn-shape-align',
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-shape-align-left',
                    lock: [_set.shapeLock, _set.lostConnect, _set.noDrawingObjects, _set.disableOnStart],
                    menu: new Common.UI.Menu({
                        cls: 'shifted-right',
                        items: [
                            {
                                caption: this.textShapeAlignLeft,
                                iconCls: 'menu__icon btn-shape-align-left',
                                value: Asc.c_oAscAlignShapeType.ALIGN_LEFT
                            },
                            {
                                caption: this.textShapeAlignCenter,
                                iconCls: 'menu__icon btn-shape-align-center',
                                value: Asc.c_oAscAlignShapeType.ALIGN_CENTER
                            },
                            {
                                caption: this.textShapeAlignRight,
                                iconCls: 'menu__icon btn-shape-align-right',
                                value: Asc.c_oAscAlignShapeType.ALIGN_RIGHT
                            },
                            {
                                caption: this.textShapeAlignTop,
                                iconCls: 'menu__icon btn-shape-align-top',
                                value: Asc.c_oAscAlignShapeType.ALIGN_TOP
                            },
                            {
                                caption: this.textShapeAlignMiddle,
                                iconCls: 'menu__icon btn-shape-align-middle',
                                value: Asc.c_oAscAlignShapeType.ALIGN_MIDDLE
                            },
                            {
                                caption: this.textShapeAlignBottom,
                                iconCls: 'menu__icon btn-shape-align-bottom',
                                value: Asc.c_oAscAlignShapeType.ALIGN_BOTTOM
                            },
                            {caption: '--'},
                            this.mniDistribHor,
                            this.mniDistribVert,
                            {caption: '--'},
                            this.mniAlignToSlide,
                            this.mniAlignObjects
                        ]
                    }),
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: '0, -6'
                });
                this.shapeControls.push(this.btnShapeAlign);
                arr.push(this.btnShapeAlign);

                this.btnShapeArrange = new Common.UI.Button({
                    id: 'id-toolbar-btn-shape-arrange',
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-arrange-front',
                    lock: [_set.lostConnect, _set.noDrawingObjects, _set.disableOnStart],
                    menu: new Common.UI.Menu({
                        items: [
                            this.mnuArrangeFront = new Common.UI.MenuItem({
                                caption: this.textArrangeFront,
                                iconCls: 'menu__icon btn-arrange-front',
                                value: 1
                            }),
                            this.mnuArrangeBack = new Common.UI.MenuItem({
                                caption: this.textArrangeBack,
                                iconCls: 'menu__icon btn-arrange-back',
                                value: 2
                            }),
                            this.mnuArrangeForward = new Common.UI.MenuItem({
                                caption: this.textArrangeForward,
                                iconCls: 'menu__icon btn-arrange-forward',
                                value: 3
                            }),
                            this.mnuArrangeBackward = new Common.UI.MenuItem({
                                caption: this.textArrangeBackward,
                                iconCls: 'menu__icon btn-arrange-backward',
                                value: 4
                            }),
                            // {caption: '--'},
                            // this.mnuGroupShapes = new Common.UI.MenuItem({
                            //     caption: this.txtGroup,
                            //     iconCls: 'menu__icon btn-shape-group',
                            //     value: 5
                            // }),
                            // this.mnuUnGroupShapes = new Common.UI.MenuItem({
                            //     caption: this.txtUngroup,
                            //     iconCls: 'menu__icon btn-shape-ungroup',
                            //     value: 6
                            // })
                        ]
                    }),
                    dataHint: '1',
                    dataHintDirection: 'top',
                    dataHintOffset: '0, -6'
                });
                this.shapeControls.push(this.btnShapeArrange);
                arr.push(this.btnShapeArrange);

                this.btnDelPage = new Common.UI.Button({
                    id: 'id-toolbar-btn-delpage',
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-rem-comment',
                    lock: [_set.lostConnect, _set.disableOnStart, _set.singlePage],
                    caption: this.capBtnDelPage,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                arr.push(this.btnDelPage);

                this.btnRotatePage = new Common.UI.Button({
                    id: 'tlbtn-rotate',
                    cls: 'btn-toolbar x-huge icon-top',
                    caption: this.capBtnRotatePage,
                    split: true,
                    iconCls: 'toolbar__icon btn-update',
                    lock: [_set.lostConnect, _set.disableOnStart],
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small',
                    menu: new Common.UI.Menu({
                        items: [
                            {caption: this.txtRotateRight, iconCls: 'menu__icon btn-rotate-90', value: 90},
                            {caption: this.txtRotateLeft, iconCls: 'menu__icon btn-rotate-270', value: -90}
                        ]
                    }),
                });
                arr.push(this.btnRotatePage);

                return arr;
            },

            applyLayout: function (config) {
                var me = this;
                me.lockControls = [];
                var _set = Common.enumLock;
                if ( config.isEdit ) {
                    Common.UI.Mixtbar.prototype.initialize.call(this, {
                            template: _.template(template),
                            tabs: [
                                {caption: me.textTabFile, action: 'file', extcls: 'canedit', layoutname: 'toolbar-file', haspanel:false, dataHintTitle: 'F'},
                                {caption: me.textTabHome, action: 'home', extcls: 'canedit', dataHintTitle: 'H'},
                                {caption: me.textTabComment, action: 'comment', extcls: 'canedit', dataHintTitle: 'C'}
                            ],
                            config: config
                        }
                    );

                    this.btnSaveCls = 'btn-save';
                    this.btnSaveTip = this.tipSave;// + Common.Utils.String.platformKey('Ctrl+S');
                    this.btnSave = new Common.UI.Button({
                        id: 'id-toolbar-btn-save',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon no-mask ' + this.btnSaveCls,
                        lock: [_set.lostConnect, _set.disableOnStart],
                        signals: ['disabled'],
                        dataHint: '1',
                        dataHintDirection: 'top',
                        dataHintTitle: 'S'
                    });
                    this.toolbarControls.push(this.btnSave);
                    this.btnCollabChanges = this.btnSave;

                    this.btnAddComment = new Common.UI.Button({
                        id: 'tlbtn-addcomment',
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-big-add-comment',
                        lock: [_set.disableOnStart],
                        caption: this.capBtnComment,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.toolbarControls.push(this.btnAddComment);

                    this.btnTextComment = new Common.UI.Button({
                        id: 'tlbtn-textcomment',
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-big-text-comment',
                        lock: [_set.disableOnStart],
                        caption: this.capBtnTextComment,
                        menu: true,
                        split: true,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.toolbarControls.push(this.btnTextComment);

                    this.chShowComments = new Common.UI.CheckBox({
                        lock: [_set.disableOnStart],
                        labelText: this.capBtnShowComments,
                        value: true,
                        dataHint    : '1',
                        dataHintDirection: 'left',
                        dataHintOffset: 'small'
                    });
                    this.toolbarControls.push(this.chShowComments);

                    this.btnStrikeout = new Common.UI.ButtonColored({
                        id: 'id-toolbar-btn-strikeout',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-strikeout',
                        lock: [_set.lostConnect, _set.disableOnStart],
                        enableToggle: true,
                        allowDepress: true,
                        split: true,
                        menu: true,
                        hideColorLine: true,
                        dataHint: '1',
                        dataHintDirection: 'top',
                        dataHintOffset: '0, -16',
                        penOptions: {color: 'D43230'},
                        type: AscPDF.ANNOTATIONS_TYPES.Strikeout
                    });
                    this.btnsStrikeout = [this.btnStrikeout];

                    this.btnUnderline = new Common.UI.ButtonColored({
                        id: 'id-toolbar-btn-underline',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-underline',
                        lock: [_set.lostConnect, _set.disableOnStart],
                        enableToggle: true,
                        allowDepress: true,
                        split: true,
                        menu: true,
                        hideColorLine: true,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: '0, -16',
                        penOptions: {color: '3D8A44'},
                        type: AscPDF.ANNOTATIONS_TYPES.Underline
                    });
                    this.btnsUnderline = [this.btnUnderline];

                    this.btnHighlight = new Common.UI.ButtonColored({
                        id: 'id-toolbar-btn-highlight',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-highlight',
                        lock: [_set.lostConnect, _set.disableOnStart],
                        enableToggle: true,
                        allowDepress: true,
                        split: true,
                        menu: true,
                        type: AscPDF.ANNOTATIONS_TYPES.Highlight,
                        dataHint: '1',
                        dataHintDirection: 'top',
                        dataHintOffset: '0, -16',
                        penOptions: {color: 'FFFC54', colors: [
                                'FFFC54', '72F54A', '74F9FD', 'EB51F7', 'A900F9', 'EF8B3A', '7272FF', 'FF63A4', '1DFF92', '03DA18',
                                '249B01', 'C504D2', '0633D1', 'FFF7A0', 'FF0303', 'FFFFFF', 'D3D3D4', '969696', '606060', '000000'
                            ]}
                    });
                    this.btnsHighlight = [this.btnHighlight];

                    this.btnEditMode = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-edit-text',
                        style: 'min-width: 45px;',
                        lock: [_set.lostConnect, _set.disableOnStart],
                        caption: this.textEditMode,
                        enableToggle: true,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.toolbarControls.push(this.btnEditMode);

                    config.isPDFEdit && this.applyLayoutPDFEdit(config);
                } else if ( config.isRestrictedEdit ) {
                    Common.UI.Mixtbar.prototype.initialize.call(this, {
                            template: _.template(template),
                            tabs: [
                                {caption: me.textTabFile, action: 'file', extcls: 'canedit', layoutname: 'toolbar-file', haspanel:false, dataHintTitle: 'F'},
                                {caption: me.textTabHome, action: 'home', extcls: 'canedit', dataHintTitle: 'H'}
                            ],
                            config: config
                        }
                    );

                    this.btnClear = new Common.UI.Button({
                        id: 'id-toolbar-btn-clear',
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-clear-style',
                        lock: [_set.disableOnStart],
                        caption: this.textClear,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.toolbarControls.push(this.btnClear);

                    this.btnPrevForm = new Common.UI.Button({
                        id: 'id-toolbar-btn-prev',
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-previous-field',
                        lock: [_set.disableOnStart],
                        caption: this.capBtnPrev,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.toolbarControls.push(this.btnPrevForm);

                    this.btnNextForm = new Common.UI.Button({
                        id: 'id-toolbar-btn-next',
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-next-field',
                        lock: [_set.disableOnStart],
                        caption: this.capBtnNext,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.toolbarControls.push(this.btnNextForm);

                    if (config.canSubmitForms) {
                        this.btnSubmit = new Common.UI.Button({
                            id: 'id-toolbar-btn-submit',
                            cls: 'btn-toolbar x-huge icon-top',
                            iconCls: 'toolbar__icon btn-submit-form',
                            lock: [_set.lostConnect, _set.disableOnStart, _set.requiredNotFilled, _set.submit],
                            caption: this.capBtnSubmit,
                            dataHint: '1',
                            dataHintDirection: 'bottom',
                            dataHintOffset: 'small'
                        });
                        this.toolbarControls.push(this.btnSubmit);
                    } else if (config.canDownload) {
                        this.btnSaveForm = new Common.UI.Button({
                            id: 'id-toolbar-btn-download-form',
                            cls: 'btn-toolbar x-huge icon-top',
                            lock: [_set.lostConnect, _set.disableOnStart],
                            iconCls: 'toolbar__icon btn-save-form',
                            caption: config.canRequestSaveAs || !!config.saveAsUrl ? this.capBtnSaveForm : (config.isOffline ? this.capBtnSaveFormDesktop : this.capBtnDownloadForm),
                            dataHint: '1',
                            dataHintDirection: 'bottom',
                            dataHintOffset: 'small'
                        });
                        this.toolbarControls.push(this.btnSaveForm);
                    }
                }

                if ( config.isEdit || config.isRestrictedEdit) {
                    this.btnPrint = new Common.UI.Button({
                        id: 'id-toolbar-btn-print',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-print no-mask',
                        lock: [_set.cantPrint, _set.disableOnStart],
                        signals: ['disabled'],
                        split: config.canQuickPrint,
                        menu: config.canQuickPrint,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintTitle: 'P',
                        printType: 'print'
                    });
                    this.toolbarControls.push(this.btnPrint);

                    this.btnUndo = new Common.UI.Button({
                        id: 'id-toolbar-btn-undo',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-undo',
                        lock: [_set.undoLock, _set.lostConnect, _set.disableOnStart],
                        signals: ['disabled'],
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintTitle: 'Z'
                    });
                    this.toolbarControls.push(this.btnUndo);

                    this.btnRedo = new Common.UI.Button({
                        id: 'id-toolbar-btn-redo',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-redo',
                        lock: [_set.redoLock, _set.lostConnect, _set.disableOnStart],
                        signals: ['disabled'],
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintTitle: 'Y'
                    });
                    this.toolbarControls.push(this.btnRedo);

                    this.btnCopy = new Common.UI.Button({
                        id: 'id-toolbar-btn-copy',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-copy',
                        lock: [_set.copyLock, _set.lostConnect, _set.disableOnStart],
                        dataHint: '1',
                        dataHintDirection: 'top',
                        dataHintTitle: 'C'
                    });
                    this.toolbarControls.push(this.btnCopy);

                    this.btnPaste = new Common.UI.Button({
                        id: 'id-toolbar-btn-paste',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-paste',
                        lock: [_set.paragraphLock, _set.lostConnect, _set.disableOnStart],
                        dataHint: '1',
                        dataHintDirection: 'top',
                        dataHintTitle: 'V'
                    });
                    this.paragraphControls.push(this.btnPaste);

                    this.btnCut = new Common.UI.Button({
                        id: 'id-toolbar-btn-cut',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-cut',
                        lock: [_set.cutLock, _set.paragraphLock, _set.shapeLock, _set.lostConnect, _set.disableOnStart],
                        dataHint: '1',
                        dataHintDirection: 'top',
                        dataHintTitle: 'X'
                    });
                    this.paragraphControls.push(this.btnCut);

                    this.btnSelectAll = new Common.UI.Button({
                        id: 'id-toolbar-btn-select-all',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-select-all',
                        lock: [_set.disableOnStart],
                        dataHint: '1',
                        dataHintDirection: 'bottom'
                    });
                    this.toolbarControls.push(this.btnSelectAll);

                    this.btnSelectTool = new Common.UI.Button({
                        id: 'tlbtn-selecttool',
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-select',
                        lock: [_set.disableOnStart],
                        caption: me.capBtnSelect,
                        toggleGroup: 'select-tools-tb',
                        enableToggle: true,
                        allowDepress: false,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.toolbarControls.push(this.btnSelectTool);

                    this.btnHandTool = new Common.UI.Button({
                        id: 'tlbtn-handtool',
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-big-hand-tool',
                        lock: [_set.disableOnStart],
                        caption: me.capBtnHand,
                        toggleGroup: 'select-tools-tb',
                        enableToggle: true,
                        allowDepress: false,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.toolbarControls.push(this.btnHandTool);

                    this.fieldPages = new Common.UI.InputFieldFixed({
                        id: 'id-toolbar-txt-pages',
                        style       : 'width: 100%;',
                        maskExp     : /[0-9]/,
                        allowBlank  : true,
                        validateOnChange: false,
                        fixedValue: '/ 1',
                        value: 1,
                        lock: [_set.disableOnStart],
                        validation  : function(value) {
                            if (/(^[0-9]+$)/.test(value)) {
                                value = parseInt(value);
                                if (value===undefined || value===null || value<1)
                                    me.fieldPages.setValue(me.api.getCurrentPage()+1);
                            } else
                                me.fieldPages.setValue(me.api.getCurrentPage()+1);

                            return true;
                        }
                    });
                    this.toolbarControls.push(this.fieldPages);

                    this.btnFirstPage = new Common.UI.Button({
                        id          : 'id-toolbar-btn-first-page',
                        cls         : 'btn-toolbar',
                        iconCls     : 'toolbar__icon btn-firstitem',
                        lock: [_set.disableOnStart, _set.firstPage],
                        dataHint    : '1',
                        dataHintDirection: 'bottom'
                    });
                    this.toolbarControls.push(this.btnFirstPage);

                    this.btnLastPage = new Common.UI.Button({
                        id          : 'id-toolbar-btn-last-page',
                        cls         : 'btn-toolbar',
                        iconCls     : 'toolbar__icon btn-lastitem',
                        lock: [_set.disableOnStart, _set.lastPage],
                        dataHint    : '1',
                        dataHintDirection: 'bottom'
                    });
                    this.toolbarControls.push(this.btnLastPage);

                    this.btnPrevPage = new Common.UI.Button({
                        id          : 'id-toolbar-btn-prev-page',
                        cls         : 'btn-toolbar',
                        iconCls     : 'toolbar__icon btn-previtem',
                        lock: [_set.disableOnStart, _set.firstPage],
                        dataHint    : '1',
                        dataHintDirection: 'bottom'
                    });
                    this.toolbarControls.push(this.btnPrevPage);
                    //
                    this.btnNextPage = new Common.UI.Button({
                        id          : 'id-toolbar-btn-next-page',
                        cls         : 'btn-toolbar',
                        iconCls     : 'toolbar__icon btn-nextitem',
                        lock: [_set.disableOnStart, _set.lastPage],
                        dataHint    : '1',
                        dataHintDirection: 'bottom'
                    });
                    this.toolbarControls.push(this.btnNextPage);

                    // Menus
                    //

                    // Disable all components before load document
                    this.lockControls = me.toolbarControls.concat(me.paragraphControls).concat(me.shapeControls);
                    this.lockToolbar(Common.enumLock.disableOnStart, true, {array: this.lockControls});

                    this.on('render:after', _.bind(this.onToolbarAfterRender, this));
                } else {
                    Common.UI.Mixtbar.prototype.initialize.call(this, {
                            template: _.template(template_view),
                            tabs: [
                                {caption: me.textTabFile, action: 'file', layoutname: 'toolbar-file', haspanel: false, dataHintTitle: 'F'}
                            ],
                            config: config
                        }
                    );
                }
                return this;
            },

            render: function (mode) {
                var me = this;

                /**
                 * Render UI layout
                 */

                this.fireEvent('render:before', [this]);

                me.isCompactView = mode.isCompactView;
                if ( mode.isEdit || mode.isRestrictedEdit) {
                    me.$el.html(me.rendererComponents(me.$layout, mode));
                } else {
                    me.$layout.find('.canedit').hide();
                    me.isCompactView && me.$layout.addClass('folded');
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
                    /** coauthoring begin **/
                    this.showSynchTip = !Common.localStorage.getBool("pdfe-hide-synch");
                    this.needShowSynchTip = false;
                    /** coauthoring end **/
                }
                (mode.isEdit || mode.isRestrictedEdit) && me.setTab('home');

                if ( me.isCompactView )
                    me.setFolded(true);

                return this;
            },

            onTabClick: function (e) {
                var me = this,
                    tab = $(e.currentTarget).find('> a[data-tab]').data('tab'),
                    is_file_active = me.isTabActive('file');

                if (tab === 'file' && !Common.Controllers.LaunchController.isScriptLoaded()) return;

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
            },

            rendererComponentsRestrictedEdit: function($host) {
                var _injectComponent = function (id, cmp) {
                    Common.Utils.injectComponent($host.findById(id), cmp);
                };
                _injectComponent('#slot-btn-form-prev', this.btnPrevForm);
                _injectComponent('#slot-btn-form-next', this.btnNextForm);
                _injectComponent('#slot-btn-form-submit', this.btnSubmit);
                _injectComponent('#slot-btn-form-save', this.btnSaveForm);
            },

            rendererComponentsPDFEdit: function($host) {
                var _injectComponent = function (id, cmp) {
                    Common.Utils.injectComponent($host.findById(id), cmp);
                };

                _injectComponent('#slot-btn-edittext', this.btnEditText);
                _injectComponent('#slot-field-fontname', this.cmbFontName);
                _injectComponent('#slot-field-fontsize', this.cmbFontSize);
                _injectComponent('#slot-btn-text-underline', this.btnTextUnderline);
                _injectComponent('#slot-btn-text-highlight', this.btnTextHighlightColor);
                _injectComponent('#slot-btn-text-strikeout', this.btnTextStrikeout);
                _injectComponent('#slot-btn-bold', this.btnBold);
                _injectComponent('#slot-btn-italic', this.btnItalic);
                _injectComponent('#slot-btn-superscript', this.btnSuperscript);
                _injectComponent('#slot-btn-subscript', this.btnSubscript);
                _injectComponent('#slot-btn-incfont', this.btnIncFontSize);
                _injectComponent('#slot-btn-decfont', this.btnDecFontSize);
                _injectComponent('#slot-btn-fontcolor', this.btnFontColor);
                _injectComponent('#slot-btn-changecase', this.btnChangeCase);
                _injectComponent('#slot-btn-clearstyle', this.btnClearStyle);
                _injectComponent('#slot-btn-markers', this.btnMarkers);
                _injectComponent('#slot-btn-numbering', this.btnNumbers);
                _injectComponent('#slot-btn-incoffset', this.btnIncLeftOffset);
                _injectComponent('#slot-btn-decoffset', this.btnDecLeftOffset);
                _injectComponent('#slot-btn-halign', this.btnHorizontalAlign);
                _injectComponent('#slot-btn-valign', this.btnVerticalAlign);
                _injectComponent('#slot-btn-linespace', this.btnLineSpace);
                _injectComponent('#slot-btn-columns', this.btnColumns);
                _injectComponent('#slot-btn-arrange-shape', this.btnShapeArrange);
                _injectComponent('#slot-btn-align-shape', this.btnShapeAlign);
                _injectComponent('#slot-btn-rotate', this.btnRotatePage);
                _injectComponent('#slot-btn-deletepage', this.btnDelPage);
            },

            rendererComponentsAnnotate: function($host) {
                var _injectComponent = function (id, cmp) {
                    Common.Utils.injectComponent($host.findById(id), cmp);
                };
                _injectComponent('#slot-btn-comment', this.btnAddComment);
                _injectComponent('#slot-btn-strikeout', this.btnStrikeout);
                _injectComponent('#slot-btn-underline', this.btnUnderline);
                _injectComponent('#slot-btn-highlight', this.btnHighlight);
                _injectComponent('#slot-btn-text-comment', this.btnTextComment);
                _injectComponent('#slot-btn-tb-edit-mode', this.btnEditMode);
            },

            rendererComponentsCommon: function($host) {
                var _injectComponent = function (id, cmp) {
                    Common.Utils.injectComponent($host.findById(id), cmp);
                };
                _injectComponent('#slot-btn-print', this.btnPrint);
                _injectComponent('#slot-btn-save', this.btnSave);
                _injectComponent('#slot-btn-undo', this.btnUndo);
                _injectComponent('#slot-btn-redo', this.btnRedo);
                _injectComponent('#slot-btn-copy', this.btnCopy);
                _injectComponent('#slot-btn-paste', this.btnPaste);
                _injectComponent('#slot-btn-cut', this.btnCut);
                _injectComponent('#slot-btn-select-all', this.btnSelectAll);
                _injectComponent('#slot-btn-select-tool', this.btnSelectTool);
                _injectComponent('#slot-btn-hand-tool', this.btnHandTool);
                _injectComponent('#slot-btn-pages', this.fieldPages);
                _injectComponent('#slot-btn-first-page', this.btnFirstPage);
                _injectComponent('#slot-btn-last-page', this.btnLastPage);
                _injectComponent('#slot-btn-prev-page', this.btnPrevPage);
                _injectComponent('#slot-btn-next-page', this.btnNextPage);
                _injectComponent('#slot-chk-showcomment', this.chShowComments);
                _injectComponent('#slot-btn-form-clear', this.btnClear);
                this.btnPrint.menu && this.btnPrint.$el.addClass('split');
            },

            rendererComponents: function (html, mode) {
                var $host = $(html);
                this.rendererComponentsCommon($host);
                if (mode.isEdit) {
                    this.rendererComponentsAnnotate($host);
                    mode.isPDFEdit && this.rendererComponentsPDFEdit($host);
                    $host.find(mode.isPDFEdit ? '.annotate' : '.pdfedit').addClass('hidden');
                } else if (mode.isRestrictedEdit)
                    this.rendererComponentsRestrictedEdit($host);

                return $host;
            },

            createPen: function(button, id, transparent, storage) {
                var mnu;
                button.setMenu(new Common.UI.Menu({
                    cls: 'shifted-left',
                    style: 'min-width: 100px;',
                    items: [
                        {template: _.template('<div id="id-toolbar-menu-' + id + '" style="width: 174px; display: inline-block;"></div>')},
                        {caption: '--'},
                        {
                            id: 'id-toolbar-menu-' + id + '-color-new',
                            template: _.template('<a tabindex="-1" type="menuitem" style="">' + button.textNewColor + '</a>')
                        },
                        {caption: '--', visible: !!transparent},
                        mnu = new Common.UI.MenuItem({
                            caption: this.strMenuNoFill,
                            checkable: true,
                            visible: !!transparent,
                            style: 'padding-left:20px;padding-right:20px;'
                        })
                    ]
                }), true);
                button.currentColor = button.options.penOptions.color;
                button.setColor(button.currentColor);
                var config = Common.UI.simpleColorsConfig;
                var picker = new Common.UI.ThemeColorPalette({
                    el: $('#id-toolbar-menu-' + id),
                    colors: button.options.penOptions.colors || config.colors,
                    value: button.currentColor,
                    dynamiccolors: config.dynamiccolors,
                    themecolors: config.themecolors,
                    effects: config.effects,
                    columns: config.columns,
                    cls: config.cls,
                    outerMenu: {menu: button.menu, index: 0, focusOnShow: true},
                    storageSuffix: storage || ''
                });
                button.setPicker(picker);
                picker.on('select', _.bind(button.onColorSelect, button));
                button.menu.setInnerMenu([{menu: picker, index: 0}]);
                button.menu.cmpEl.find('#id-toolbar-menu-' + id + '-color-new').on('click',  function() {
                    picker.addNewColor(button.currentColor);
                });
                return [picker, mnu];
            },

            onAppReady: function (config) {
                var me = this;
                (new Promise( function(resolve, reject) {
                    resolve();
                })).then(function () {
                    if ( !config.isEdit && !config.isRestrictedEdit) return;

                    if(me.btnPrint.menu){
                        me.btnPrint.setMenu(
                            new Common.UI.Menu({
                                items:[
                                    {
                                        caption:            me.tipPrint,
                                        iconCls:            'menu__icon btn-print',
                                        toggleGroup:        'viewPrint',
                                        value:              'print',
                                        iconClsForMainBtn:  'btn-print',
                                        platformKey:         Common.Utils.String.platformKey('Ctrl+P')
                                    },
                                    {
                                        caption:            me.tipPrintQuick,
                                        iconCls:            'menu__icon btn-quick-print',
                                        toggleGroup:        'viewPrint',
                                        value:              'print-quick',
                                        iconClsForMainBtn:  'btn-quick-print',
                                        platformKey:        ''
                                    }
                                ]
                            }));
                    }
                    if (me.btnStrikeout && me.btnStrikeout.menu) {
                        var arr = me.createPen(me.btnStrikeout, 'strikeout', false, '-draw');
                        me.mnuStrikeoutColorPicker = arr[0];
                        me.mnusStrikeoutColorPicker = [me.mnuStrikeoutColorPicker];
                        // me.mnuStrikeoutTransparent = arr[1];
                    }
                    if (me.btnUnderline && me.btnUnderline.menu) {
                        var arr = me.createPen(me.btnUnderline, 'underline', false, '-draw');
                        me.mnuUnderlineColorPicker = arr[0];
                        me.mnusUnderlineColorPicker = [me.mnuUnderlineColorPicker];
                        // me.mnuUnderlineTransparent = arr[1];
                    }
                    if (me.btnHighlight && me.btnHighlight.menu) {
                        var arr = me.createPen(me.btnHighlight, 'highlight', false, '-draw');
                        me.mnuHighlightColorPicker = arr[0];
                        me.mnusHighlightColorPicker = [me.mnuHighlightColorPicker];
                        // me.mnuHighlightTransparent = arr[1];
                    }

                    if (me.btnTextComment) {
                        me.btnTextComment.options.textboxType = AscPDF.FREE_TEXT_INTENT_TYPE.FreeText;
                        me.btnTextComment.setMenu(new Common.UI.Menu({
                            items: [
                                {
                                    caption: me.tipInsertTextComment,
                                    iconCls     : 'menu__icon btn-text-comment',
                                    value: AscPDF.FREE_TEXT_INTENT_TYPE.FreeText,
                                    iconClsForMainBtn: 'btn-big-text-comment',
                                    captionForMainBtn: me.capBtnTextComment
                                },
                                {
                                    caption: me.tipInsertTextCallout,
                                    iconCls     : 'menu__icon btn-text-callout',
                                    value: AscPDF.FREE_TEXT_INTENT_TYPE.FreeTextCallout,
                                    iconClsForMainBtn: 'btn-big-text-callout',
                                    captionForMainBtn: me.capBtnTextCallout
                                },
                            ]
                        }));
                    }
                });
            },

            createDelayedElementsCommon: function() {
                this.btnPrint.updateHint(this.tipPrint + Common.Utils.String.platformKey('Ctrl+P'));
                this.btnUndo.updateHint(this.tipUndo + Common.Utils.String.platformKey('Ctrl+Z'));
                this.btnRedo.updateHint(this.tipRedo + Common.Utils.String.platformKey('Ctrl+Y'));
                this.btnCopy.updateHint(this.tipCopy + Common.Utils.String.platformKey('Ctrl+C'));
                this.btnPaste.updateHint(this.tipPaste + Common.Utils.String.platformKey('Ctrl+V'));
                this.btnCut.updateHint(this.tipCut + Common.Utils.String.platformKey('Ctrl+X'));
                this.btnSelectAll.updateHint(this.tipSelectAll + Common.Utils.String.platformKey('Ctrl+A'));
                this.btnSelectTool.updateHint(this.tipSelectTool);
                this.btnHandTool.updateHint(this.tipHandTool);
                this.btnFirstPage.updateHint(this.tipFirstPage);
                this.btnLastPage.updateHint(this.tipLastPage);
                this.btnPrevPage.updateHint(this.tipPrevPage);
                this.btnNextPage.updateHint(this.tipNextPage);
            },

            createDelayedElementsRestrictedEdit: function() {
                if (!this.mode.isRestrictedEdit) return;

                this.btnClear.updateHint(this.textClearFields);
                this.btnPrevForm.updateHint(this.tipPrevForm);
                this.btnNextForm.updateHint(this.tipNextForm);
                this.btnSubmit && this.btnSubmit.updateHint(this.tipSubmit);
                this.btnSaveForm && this.btnSaveForm.updateHint(this.mode.canRequestSaveAs || !!this.mode.saveAsUrl ? this.tipSaveForm : this.tipDownloadForm);
            },

            createDelayedElementsPDFAnnotate: function() {
                if (!this.mode.isEdit) return;

                this.btnSave.updateHint(this.btnSaveTip);
                this.btnAddComment.updateHint(this.tipAddComment);
                this.btnStrikeout.updateHint(this.textStrikeout);
                this.btnUnderline.updateHint(this.textUnderline);
                this.btnHighlight.updateHint(this.textHighlight);
                // this.btnTextComment.updateHint([this.tipInsertTextComment, this.tipInsertText]);
                this.btnTextComment.updateHint(this.tipInsertTextComment);
                this.btnEditMode.updateHint(this.tipEditMode);
            },

            createDelayedElementsPDFEdit: function() {
                if (!this.mode.isPDFEdit) return;

                this.updateMetricUnit();
                this.btnEditText.updateHint(this.tipRecognize);
                this.btnIncFontSize.updateHint(this.tipIncFont + Common.Utils.String.platformKey('Ctrl+]'));
                this.btnDecFontSize.updateHint(this.tipDecFont + Common.Utils.String.platformKey('Ctrl+['));
                this.btnBold.updateHint(this.textBold + Common.Utils.String.platformKey('Ctrl+B'));
                this.btnItalic.updateHint(this.textItalic + Common.Utils.String.platformKey('Ctrl+I'));
                this.btnTextUnderline.updateHint(this.textUnderline + Common.Utils.String.platformKey('Ctrl+U'));
                this.btnTextStrikeout.updateHint(this.textStrikeout);
                this.btnSuperscript.updateHint(this.textSuperscript);
                this.btnSubscript.updateHint(this.textSubscript);
                this.btnFontColor.updateHint(this.tipFontColor);
                this.btnTextHighlightColor.updateHint(this.tipHighlightColor);
                this.btnChangeCase.updateHint(this.tipChangeCase);
                this.btnClearStyle.updateHint(this.tipClearStyle);
                this.btnMarkers.updateHint(this.tipMarkers);
                this.btnNumbers.updateHint(this.tipNumbers);
                this.btnHorizontalAlign.updateHint(this.tipHAligh);
                this.btnVerticalAlign.updateHint(this.tipVAligh);
                this.btnDecLeftOffset.updateHint(this.tipDecPrLeft + Common.Utils.String.platformKey('Ctrl+Shift+M'));
                this.btnIncLeftOffset.updateHint(this.tipIncPrLeft);
                this.btnLineSpace.updateHint(this.tipLineSpace);
                this.btnColumns.updateHint(this.tipColumns);
                this.btnShapeAlign.updateHint(this.tipShapeAlign);
                this.btnShapeArrange.updateHint(this.tipShapeArrange);
                this.btnRotatePage.updateHint([this.txtRotatePageRight, this.txtRotatePage]);
                this.btnDelPage.updateHint(this.tipDelPage);
                this.btnMarkers.setMenu(
                    new Common.UI.Menu({
                        cls: 'shifted-left',
                        style: 'min-width: 145px',
                        items: [
                            {template: _.template('<div id="id-toolbar-menu-markers" class="menu-markers" style="width: 145px; margin: 0 9px;"></div>')},
                            this.mnuMarkerSettings = new Common.UI.MenuItem({
                                caption: this.textListSettings,
                                value: 'settings'
                            })
                        ]
                    })
                );

                this.btnNumbers.setMenu(
                    new Common.UI.Menu({
                        cls: 'shifted-left',
                        items: [
                            {template: _.template('<div id="id-toolbar-menu-numbering" class="menu-markers" style="width: 353px; margin: 0 9px;"></div>')},
                            this.mnuNumberSettings = new Common.UI.MenuItem({
                                caption: this.textListSettings,
                                value: 'settings'
                            })
                        ]
                    })
                );

                this._markersArr = [
                    'undefined',
                    '{"bulletTypeface":{"type":"bufont","typeface":"Symbol"},"bulletType":{"type":"char","char":"·","startAt":null}}',
                    '{"bulletTypeface":{"type":"bufont","typeface":"Courier New"},"bulletType":{"type":"char","char":"o","startAt":null}}',
                    '{"bulletTypeface":{"type":"bufont","typeface":"Wingdings"},"bulletType":{"type":"char","char":"§","startAt":null}}',
                    '{"bulletTypeface":{"type":"bufont","typeface":"Wingdings"},"bulletType":{"type":"char","char":"v","startAt":null}}',
                    '{"bulletTypeface":{"type":"bufont","typeface":"Wingdings"},"bulletType":{"type":"char","char":"Ø","startAt":null}}',
                    '{"bulletTypeface":{"type":"bufont","typeface":"Wingdings"},"bulletType":{"type":"char","char":"ü","startAt":null}}',
                    '{"bulletTypeface":{"type":"bufont","typeface":"Symbol"},"bulletType":{"type":"char","char":"¨","startAt":null}}',
                    '{"bulletTypeface":{"type":"bufont","typeface":"Arial"},"bulletType":{"type":"char","char":"–","startAt":null}}'
                ];

                var _conf = this.mnuMarkersPicker.conf;
                this.mnuMarkersPicker = new Common.UI.DataView({
                    el: $('#id-toolbar-menu-markers'),
                    parentMenu: this.btnMarkers.menu,
                    outerMenu:  {menu: this.btnMarkers.menu, index: 0},
                    restoreHeight: 138,
                    allowScrollbar: false,
                    delayRenderTips: true,
                    store: new Common.UI.DataViewStore([
                        {id: 'id-markers-' + Common.UI.getId(), data: {type: 0, subtype: -1},numberingInfo: this._markersArr[0], skipRenderOnChange: true, tip: this.tipNone},
                        {id: 'id-markers-' + Common.UI.getId(), data: {type: 0, subtype: 1}, numberingInfo: this._markersArr[1], skipRenderOnChange: true, tip: this.tipMarkersFRound},
                        {id: 'id-markers-' + Common.UI.getId(), data: {type: 0, subtype: 2}, numberingInfo: this._markersArr[2], skipRenderOnChange: true, tip: this.tipMarkersHRound},
                        {id: 'id-markers-' + Common.UI.getId(), data: {type: 0, subtype: 3}, numberingInfo: this._markersArr[3], skipRenderOnChange: true, tip: this.tipMarkersFSquare},
                        {id: 'id-markers-' + Common.UI.getId(), data: {type: 0, subtype: 4}, numberingInfo: this._markersArr[4], skipRenderOnChange: true, tip: this.tipMarkersStar},
                        {id: 'id-markers-' + Common.UI.getId(), data: {type: 0, subtype: 5}, numberingInfo: this._markersArr[5], skipRenderOnChange: true, tip: this.tipMarkersArrow},
                        {id: 'id-markers-' + Common.UI.getId(), data: {type: 0, subtype: 6}, numberingInfo: this._markersArr[6], skipRenderOnChange: true, tip: this.tipMarkersCheckmark},
                        {id: 'id-markers-' + Common.UI.getId(), data: {type: 0, subtype: 7}, numberingInfo: this._markersArr[7], skipRenderOnChange: true, tip: this.tipMarkersFRhombus},
                        {id: 'id-markers-' + Common.UI.getId(), data: {type: 0, subtype: 8}, numberingInfo: this._markersArr[8], skipRenderOnChange: true, tip: this.tipMarkersDash}
                    ]),
                    itemTemplate: _.template('<div id="<%= id %>" class="item-markerlist"></div>')
                });
                this.btnMarkers.menu.setInnerMenu([{menu: this.mnuMarkersPicker, index: 0}]);
                _conf && this.mnuMarkersPicker.selectByIndex(_conf.index, true);

                this._numbersArr = [
                    'undefined',
                    '{"bulletTypeface":{"type":"bufont","typeface":"Arial"},"bulletType":{"type":"autonum","char":null,"autoNumType":"alphaUcPeriod","startAt":null}}',
                    '{"bulletTypeface":{"type":"bufont","typeface":"Arial"},"bulletType":{"type":"autonum","char":null,"autoNumType":"alphaLcParenR","startAt":null}}',
                    '{"bulletTypeface":{"type":"bufont","typeface":"Arial"},"bulletType":{"type":"autonum","char":null,"autoNumType":"alphaLcPeriod","startAt":null}}',
                    '{"bulletTypeface":{"type":"bufont","typeface":"Arial"},"bulletType":{"type":"autonum","char":null,"autoNumType":"arabicPeriod","startAt":null}}',
                    '{"bulletTypeface":{"type":"bufont","typeface":"Arial"},"bulletType":{"type":"autonum","char":null,"autoNumType":"arabicParenR","startAt":null}}',
                    '{"bulletTypeface":{"type":"bufont","typeface":"Arial"},"bulletType":{"type":"autonum","char":null,"autoNumType":"romanUcPeriod","startAt":null}}',
                    '{"bulletTypeface":{"type":"bufont","typeface":"Arial"},"bulletType":{"type":"autonum","char":null,"autoNumType":"romanLcPeriod","startAt":null}}'
                ];

                _conf = this.mnuNumbersPicker.conf;
                this.mnuNumbersPicker = new Common.UI.DataView({
                    el: $('#id-toolbar-menu-numbering'),
                    parentMenu: this.btnNumbers.menu,
                    outerMenu:  {menu: this.btnNumbers.menu, index: 0},
                    restoreHeight: 92,
                    allowScrollbar: false,
                    delayRenderTips: true,
                    store: new Common.UI.DataViewStore([
                        {id: 'id-numbers-' + Common.UI.getId(), data: {type: 1, subtype: -1}, numberingInfo: this._numbersArr[0], skipRenderOnChange: true, tip: this.tipNone},
                        {id: 'id-numbers-' + Common.UI.getId(), data: {type: 1, subtype: 4}, numberingInfo: this._numbersArr[1], skipRenderOnChange: true, tip: this.tipNumCapitalLetters},
                        {id: 'id-numbers-' + Common.UI.getId(), data: {type: 1, subtype: 5}, numberingInfo: this._numbersArr[2], skipRenderOnChange: true, tip: this.tipNumLettersParentheses},
                        {id: 'id-numbers-' + Common.UI.getId(), data: {type: 1, subtype: 6}, numberingInfo: this._numbersArr[3], skipRenderOnChange: true, tip: this.tipNumLettersPoints},
                        {id: 'id-numbers-' + Common.UI.getId(), data: {type: 1, subtype: 1}, numberingInfo: this._numbersArr[4], skipRenderOnChange: true, tip: this.tipNumNumbersPoint},
                        {id: 'id-numbers-' + Common.UI.getId(), data: {type: 1, subtype: 2}, numberingInfo: this._numbersArr[5], skipRenderOnChange: true, tip: this.tipNumNumbersParentheses},
                        {id: 'id-numbers-' + Common.UI.getId(), data: {type: 1, subtype: 3}, numberingInfo: this._numbersArr[6], skipRenderOnChange: true, tip: this.tipNumRoman},
                        {id: 'id-numbers-' + Common.UI.getId(), data: {type: 1, subtype: 7}, numberingInfo: this._numbersArr[7], skipRenderOnChange: true, tip: this.tipNumRomanSmall}
                    ]),
                    itemTemplate: _.template('<div id="<%= id %>" class="item-multilevellist"></div>')
                });
                this.btnNumbers.menu.setInnerMenu([{menu: this.mnuNumbersPicker, index: 0}]);
                _conf && this.mnuNumbersPicker.selectByIndex(_conf.index, true);

                if (this.btnTextHighlightColor && this.btnTextHighlightColor.cmpEl) {
                    this.btnTextHighlightColor.currentColor = 'FFFF00';
                    this.btnTextHighlightColor.setColor(this.btnTextHighlightColor.currentColor);
                    this.mnuTextHighlightColorPicker = new Common.UI.ThemeColorPalette({
                        el: $('#id-toolbar-menu-text-highlight'),
                        colors: [
                            'FFFF00', '00FF00', '00FFFF', 'FF00FF', '0000FF', 'FF0000', '00008B', '008B8B',
                            '006400', '800080', '8B0000', '808000', 'FFFFFF', 'D3D3D3', 'A9A9A9', '000000'
                        ],
                        colorHints: [
                            Common.Utils.ThemeColor.txtYellow, Common.Utils.ThemeColor.txtBrightGreen, Common.Utils.ThemeColor.txtTurquosie, Common.Utils.ThemeColor.txtPink,
                            Common.Utils.ThemeColor.txtBlue, Common.Utils.ThemeColor.txtRed, Common.Utils.ThemeColor.txtDarkBlue, Common.Utils.ThemeColor.txtTeal,
                            Common.Utils.ThemeColor.txtGreen, Common.Utils.ThemeColor.txtViolet, Common.Utils.ThemeColor.txtDarkRed, Common.Utils.ThemeColor.txtDarkYellow,
                            Common.Utils.ThemeColor.txtWhite, Common.Utils.ThemeColor.txtGray + '-25%', Common.Utils.ThemeColor.txtGray + '-50%', Common.Utils.ThemeColor.txtBlack
                        ],
                        value: 'FFFF00',
                        dynamiccolors: 0,
                        themecolors: 0,
                        effects: 0,
                        columns: 4,
                        cls: 'palette-large',
                        outerMenu: {menu: this.btnTextHighlightColor.menu, index: 0, focusOnShow: true}
                    });
                    this.btnTextHighlightColor.setPicker(this.mnuTextHighlightColorPicker);
                    this.btnTextHighlightColor.menu.setInnerMenu([{menu: this.mnuTextHighlightColorPicker, index: 0}]);
                }
                if (this.btnFontColor && this.btnFontColor.menu) {
                    var arr = this.createPen(this.btnFontColor, 'font');
                    this.mnuFontColorPicker = arr[0];
                    this.mnuFontTransparent = arr[1];
                }
            },

            createDelayedElements: function () {
                this.createDelayedElementsCommon();
                if (this.mode.isEdit) {
                    this.createDelayedElementsPDFAnnotate();
                    this.mode.isPDFEdit && this.createDelayedElementsPDFEdit();
                } else if (this.mode.isRestrictedEdit)
                    this.createDelayedElementsRestrictedEdit();
            },

            onToolbarAfterRender: function(toolbar) {
                // DataView and pickers
            },

            updateMetricUnit: function () {
            },

            setApi: function (api) {
                this.api = api;
                /** coauthoring begin **/
                this.api.asc_registerCallback('asc_onCollaborativeChanges', _.bind(this.onCollaborativeChanges, this));
                this.api.asc_registerCallback('asc_onAuthParticipantsChanged', _.bind(this.onApiUsersChanged, this));
                this.api.asc_registerCallback('asc_onParticipantsChanged', _.bind(this.onApiUsersChanged, this));
                /** coauthoring end **/
                return this;
            },

            setMode: function (mode) {
                if (mode.isDisconnected) {
                    this.lockToolbar(Common.enumLock.lostConnect, true);
                    if ( this.synchTooltip )
                        this.synchTooltip.hide();
                    if (!mode.enableDownload)
                        this.lockToolbar(Common.enumLock.cantPrint, true, {array: [this.btnPrint]});
                } else {
                    this.lockToolbar(Common.enumLock.cantPrint, !mode.canPrint, {array: [this.btnPrint]});
                    !mode.canPrint && this.btnPrint.hide();
                }

                this.mode = mode;
            },

            /** coauthoring begin **/
            onCollaborativeChanges: function () {
                if (this._state.hasCollaborativeChanges) return;
                if (!this.btnCollabChanges.rendered || this._state.previewmode) {
                    this.needShowSynchTip = true;
                    return;
                }

                this._state.hasCollaborativeChanges = true;
                this.btnCollabChanges.cmpEl.addClass('notify');
                if (this.showSynchTip) {
                    this.btnCollabChanges.updateHint('');
                    if (this.synchTooltip === undefined)
                        this.createSynchTip();

                    this.synchTooltip.show();
                } else {
                    this.btnCollabChanges.updateHint(this.tipSynchronize + Common.Utils.String.platformKey('Ctrl+S'));
                }

                this.btnSave.setDisabled(!this.mode.isPDFEdit && !this.mode.isPDFAnnotate && this.mode.canSaveToFile);
                Common.Gateway.collaborativeChanges();
            },

            createSynchTip: function () {
                var direction = Common.UI.isRTL() ? 'left' : 'right';
                this.synchTooltip = new Common.UI.SynchronizeTip({
                    extCls: (this.mode.compactHeader) ? undefined : 'inc-index',
                    placement: this.mode.isDesktopApp ? 'bottom-' + direction : direction + '-bottom',
                    target: this.btnCollabChanges.$el
                });
                this.synchTooltip.on('dontshowclick', function () {
                    this.showSynchTip = false;
                    this.synchTooltip.hide();
                    this.btnCollabChanges.updateHint(this.tipSynchronize + Common.Utils.String.platformKey('Ctrl+S'));
                    Common.localStorage.setItem("pdfe-hide-synch", 1);
                }, this);
                this.synchTooltip.on('closeclick', function () {
                    this.synchTooltip.hide();
                    this.btnCollabChanges.updateHint(this.tipSynchronize + Common.Utils.String.platformKey('Ctrl+S'));
                }, this);
            },

            synchronizeChanges: function () {
                if ( !this._state.previewmode && this.btnCollabChanges.rendered ) {
                    var me = this;

                    if ( me.btnCollabChanges.cmpEl.hasClass('notify') ) {
                        me.btnCollabChanges.cmpEl.removeClass('notify');
                        if (this.synchTooltip)
                            this.synchTooltip.hide();
                        this.btnCollabChanges.updateHint(this.btnSaveTip);

                        this.btnSave.setDisabled(!me.mode.forcesave && !me.mode.canSaveDocumentToBinary || !me.mode.isPDFEdit && !me.mode.isPDFAnnotate && me.mode.canSaveToFile);
                        this._state.hasCollaborativeChanges = false;
                    }
                }
            },

            onApiUsersChanged: function (users) {
                var editusers = [];
                _.each(users, function (item) {
                    if (!item.asc_getView())
                        editusers.push(item);
                });

                var me = this;
                var length = _.size(editusers);
                var cls = (length > 1) ? 'btn-save-coauth' : 'btn-save';
                if ( cls !== me.btnSaveCls && me.btnCollabChanges.rendered ) {
                    me.btnSaveTip = ((length > 1) ? me.tipSaveCoauth : me.tipSave ) + Common.Utils.String.platformKey('Ctrl+S');
                    me.btnCollabChanges.updateHint(me.btnSaveTip);
                    me.btnCollabChanges.changeIcon({next: cls, curr: me.btnSaveCls});
                    me.btnSaveCls = cls;
                }
            },

            /** coauthoring end **/

            lockToolbar: function (causes, lock, opts) {
                Common.Utils.lockControls(causes, lock, opts, this.lockControls);
            },

            tipNumCapitalLetters: 'A. B. C.',
            tipNumLettersParentheses: 'a) b) c)',
            tipNumLettersPoints: 'a. b. c.',
            tipNumNumbersPoint: '1. 2. 3.',
            tipNumNumbersParentheses: '1) 2) 3)',
            tipNumRoman: 'I. II. III.',
            tipNumRomanSmall: 'i. ii. iii.'
        }
    })(), PDFE.Views.Toolbar || {}));
});
