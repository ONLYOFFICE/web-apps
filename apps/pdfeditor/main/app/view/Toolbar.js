/*
 * (c) Copyright Ascensio System SIA 2010-2023
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
 *  Created by Julia Radzhabova on 05/04/23
 *  Copyright (c) 2023 Ascensio System SIA. All rights reserved.
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
        cantPrint:      'cant-print',
        lostConnect:    'disconnect',
        disableOnStart: 'on-start',
        firstPage: 'first-page',
        lastPage: 'last-page',
        requiredNotFilled: 'required-not-filled',
        submit: 'submit',
        fileMenuOpened: 'file-menu-opened'
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
                this._state = {
                    hasCollaborativeChanges: undefined
                };
                Common.NotificationCenter.on('app:ready', me.onAppReady.bind(this));
                return this;
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
                                {caption: me.textTabComment, action: 'comment', extcls: 'canedit', dataHintTitle: 'C'},
                                {caption: me.textTabEdit, action: 'edit', extcls: 'canedit', dataHintTitle: 'E'},
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

                    // this.btnRotate = new Common.UI.Button({
                    //     id: 'tlbtn-rotate',
                    //     cls: 'btn-toolbar x-huge icon-top',
                    //     iconCls: 'toolbar__icon btn-update',
                    //     lock: [_set.disableOnStart],
                    //     caption: this.capBtnRotate,
                    //     dataHint: '1',
                    //     dataHintDirection: 'bottom',
                    //     dataHintOffset: 'small'
                    // });
                    // this.toolbarControls.push(this.btnRotate);

                    this.btnAddComment = new Common.UI.Button({
                        id: 'tlbtn-addcomment',
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-add-comment',
                        lock: [_set.disableOnStart],
                        caption: this.capBtnComment,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.toolbarControls.push(this.btnAddComment);

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
                        lock: [_set.paragraphLock, _set.headerLock, _set.richEditLock, _set.plainEditLock, _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.disableOnStart, _set.docLockView, _set.docLockComments],
                        enableToggle: true,
                        allowDepress: true,
                        split: true,
                        menu: true,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: '0, -16',
                        penOptions: {color: '000000'},
                        type: AscPDF.ANNOTATIONS_TYPES.Strikeout
                    });
                    // this.paragraphControls.push(this.btnStrikeout);

                    this.btnUnderline = new Common.UI.ButtonColored({
                        id: 'id-toolbar-btn-underline',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-underline',
                        lock: [_set.paragraphLock, _set.headerLock, _set.richEditLock, _set.plainEditLock, _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.disableOnStart, _set.docLockView, _set.docLockComments],
                        enableToggle: true,
                        allowDepress: true,
                        split: true,
                        menu: true,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: '0, -16',
                        penOptions: {color: '000000'},
                        type: AscPDF.ANNOTATIONS_TYPES.Underline
                    });
                    // this.paragraphControls.push(this.btnUnderline);

                    this.btnHighlight = new Common.UI.ButtonColored({
                        id: 'id-toolbar-btn-highlight',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-highlight',
                        lock: [_set.paragraphLock, _set.headerLock, _set.richEditLock, _set.plainEditLock, _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.disableOnStart, _set.docLockView, _set.docLockComments],
                        enableToggle: true,
                        allowDepress: true,
                        split: true,
                        menu: true,
                        type: AscPDF.ANNOTATIONS_TYPES.Highlight,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: '0, -16',
                        penOptions: {color: 'FFFC54', colors: [
                                'FFFC54', '72F54A', '74F9FD', 'EB51F7', 'A900F9', 'EF8B3A', '7272FF', 'FF63A4', '1DFF92', '03DA18',
                                '249B01', 'C504D2', '0633D1', 'FFF7A0', 'FF0303', 'FFFFFF', 'D3D3D4', '969696', '606060', '000000'
                            ]}
                    });
                    // this.paragraphControls.push(this.btnHighlight);

                    // tab Edit
                    this.cmbFontName = new Common.UI.ComboBoxFonts({
                        cls: 'input-group-nr',
                        menuCls: 'scrollable-menu',
                        menuStyle: 'min-width: 325px;',
                        hint: this.tipFontName,
                        lock: [_set.paragraphLock, _set.lostConnect, _set.noTextSelected, _set.shapeLock],
                        store: new Common.Collections.Fonts(),
                        dataHint: '1',
                        dataHintDirection: 'top'
                    });
                    this.paragraphControls.push(this.cmbFontName);

                    this.cmbFontSize = new Common.UI.ComboBox({
                        cls: 'input-group-nr',
                        menuStyle: 'min-width: 55px;',
                        hint: this.tipFontSize,
                        lock: [_set.paragraphLock, _set.lostConnect, _set.noTextSelected, _set.shapeLock],
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

                    this.btnIncFontSize = new Common.UI.Button({
                        id: 'id-toolbar-btn-incfont',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-incfont',
                        lock: [_set.paragraphLock, _set.lostConnect, _set.noTextSelected, _set.shapeLock],
                        dataHint: '1',
                        dataHintDirection: 'top'
                    });
                    this.paragraphControls.push(this.btnIncFontSize);

                    this.btnDecFontSize = new Common.UI.Button({
                        id: 'id-toolbar-btn-decfont',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-decfont',
                        lock: [_set.paragraphLock, _set.lostConnect, _set.noTextSelected, _set.shapeLock],
                        dataHint: '1',
                        dataHintDirection: 'top'
                    });
                    this.paragraphControls.push(this.btnDecFontSize);

                    this.btnBold = new Common.UI.Button({
                        id: 'id-toolbar-btn-bold',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-bold',
                        lock: [_set.paragraphLock, _set.lostConnect, _set.noTextSelected, _set.shapeLock],
                        enableToggle: true,
                        dataHint: '1',
                        dataHintDirection: 'bottom'
                    });
                    this.paragraphControls.push(this.btnBold);

                    this.btnItalic = new Common.UI.Button({
                        id: 'id-toolbar-btn-italic',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-italic',
                        lock: [_set.paragraphLock, _set.lostConnect, _set.noTextSelected, _set.shapeLock],
                        enableToggle: true,
                        dataHint: '1',
                        dataHintDirection: 'bottom'
                    });
                    this.paragraphControls.push(this.btnItalic);

                    this.btnTextUnderline = new Common.UI.Button({
                        id: 'id-toolbar-btn-underline',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-underline',
                        lock: [_set.paragraphLock, _set.lostConnect, _set.noTextSelected, _set.shapeLock],
                        enableToggle: true,
                        dataHint: '1',
                        dataHintDirection: 'bottom'
                    });
                    this.paragraphControls.push(this.btnTextUnderline);

                    this.btnTextStrikeout = new Common.UI.Button({
                        id: 'id-toolbar-btn-strikeout',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-strikeout',
                        lock: [_set.paragraphLock, _set.lostConnect, _set.noTextSelected, _set.shapeLock],
                        enableToggle: true,
                        dataHint: '1',
                        dataHintDirection: 'bottom'
                    });
                    this.paragraphControls.push(this.btnTextStrikeout);

                    this.btnSuperscript = new Common.UI.Button({
                        id: 'id-toolbar-btn-superscript',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-superscript',
                        lock: [_set.paragraphLock, _set.lostConnect, _set.noTextSelected, _set.shapeLock],
                        enableToggle: true,
                        toggleGroup: 'superscriptGroup',
                        dataHint: '1',
                        dataHintDirection: 'bottom'
                    });
                    this.paragraphControls.push(this.btnSuperscript);

                    this.btnSubscript = new Common.UI.Button({
                        id: 'id-toolbar-btn-subscript',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-subscript',
                        lock: [_set.paragraphLock, _set.lostConnect, _set.noTextSelected, _set.shapeLock],
                        enableToggle: true,
                        toggleGroup: 'superscriptGroup',
                        dataHint: '1',
                        dataHintDirection: 'bottom'
                    });
                    this.paragraphControls.push(this.btnSubscript);

                    this.btnTextHighlightColor = new Common.UI.ButtonColored({
                        id: 'id-toolbar-btn-highlight',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-highlight',
                        enableToggle: true,
                        allowDepress: true,
                        split: true,
                        menu: true,
                        lock: [_set.paragraphLock, _set.lostConnect, _set.noTextSelected, _set.shapeLock],
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: '0, -16',
                        penOptions: {color: 'FFFC54', colors: [
                                'FFFC54', '72F54A', '74F9FD', 'EB51F7', 'A900F9', 'EF8B3A', '7272FF', 'FF63A4', '1DFF92', '03DA18',
                                '249B01', 'C504D2', '0633D1', 'FFF7A0', 'FF0303', 'FFFFFF', 'D3D3D4', '969696', '606060', '000000'
                            ]}
                    });
                    this.paragraphControls.push(this.btnTextHighlightColor);

                    this.btnFontColor = new Common.UI.ButtonColored({
                        id: 'id-toolbar-btn-fontcolor',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-fontcolor',
                        lock: [_set.paragraphLock, _set.lostConnect, _set.noTextSelected, _set.shapeLock],
                        split: true,
                        menu: true,
                        eyeDropper: true,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: '0, -16',
                        penOptions: {color: '000000'}
                    });
                    this.paragraphControls.push(this.btnFontColor);

                    this.btnChangeCase = new Common.UI.Button({
                        id: 'id-toolbar-btn-case',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-change-case',
                        lock: [_set.paragraphLock, _set.lostConnect, _set.noTextSelected, _set.shapeLock],
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
                    this.mnuChangeCase = this.btnChangeCase.menu;

                    this.btnClearStyle = new Common.UI.Button({
                        id: 'id-toolbar-btn-clearstyle',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-clearstyle',
                        lock: [ _set.paragraphLock, _set.lostConnect, _set.noParagraphSelected],
                        dataHint: '1',
                        dataHintDirection: 'bottom'
                    });
                    this.paragraphControls.push(this.btnClearStyle);

                    this.btnMarkers = new Common.UI.Button({
                        id: 'id-toolbar-btn-markers',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon ' + (!Common.UI.isRTL() ? 'btn-setmarkers' : 'btn-setmarkers-rtl'),
                        lock: [_set.paragraphLock, _set.lostConnect, _set.noParagraphSelected, _set.inSmartart, _set.inSmartartInternal],
                        enableToggle: true,
                        toggleGroup: 'markersGroup',
                        split: true,
                        menu: true,
                        dataHint: '1',
                        dataHintDirection: 'top',
                        dataHintOffset: '0, -16'
                    });
                    this.paragraphControls.push(this.btnMarkers);

                    this.btnNumbers = new Common.UI.Button({
                        id: 'id-toolbar-btn-numbering',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon ' + (!Common.UI.isRTL() ? 'btn-numbering' : 'btn-numbering-rtl'),
                        lock: [_set.paragraphLock, _set.lostConnect, _set.noParagraphSelected, _set.inSmartart, _set.inSmartartInternal],
                        enableToggle: true,
                        toggleGroup: 'markersGroup',
                        split: true,
                        menu: true,
                        dataHint: '1',
                        dataHintDirection: 'top',
                        dataHintOffset: '0, -16'
                    });
                    this.paragraphControls.push(this.btnNumbers);

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
                        lock: [_set.paragraphLock, _set.lostConnect, _set.noParagraphSelected],
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

                    this.btnVerticalAlign = new Common.UI.Button({
                        id: 'id-toolbar-btn-valign',
                        cls: 'btn-toolbar',
                        lock: [_set.paragraphLock, _set.lostConnect, _set.noParagraphSelected, _set.noObjectSelected],
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

                    this.btnDecLeftOffset = new Common.UI.Button({
                        id: 'id-toolbar-btn-decoffset',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-decoffset',
                        lock: [_set.decIndentLock, _set.paragraphLock, _set.lostConnect, _set.noParagraphSelected, _set.inSmartart, _set.inSmartartInternal],
                        dataHint: '1',
                        dataHintDirection: 'top'
                    });
                    this.paragraphControls.push(this.btnDecLeftOffset);

                    this.btnIncLeftOffset = new Common.UI.Button({
                        id: 'id-toolbar-btn-incoffset',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-incoffset',
                        lock: [_set.incIndentLock, _set.paragraphLock, _set.lostConnect, _set.noParagraphSelected, _set.inSmartart, _set.inSmartartInternal],
                        dataHint: '1',
                        dataHintDirection: 'top'
                    });
                    this.paragraphControls.push(this.btnIncLeftOffset);

                    this.btnLineSpace = new Common.UI.Button({
                        id: 'id-toolbar-btn-linespace',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-linespace',
                        lock: [_set.paragraphLock, _set.lostConnect, _set.noParagraphSelected],
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

                    this.btnColumns = new Common.UI.Button({
                        id: 'id-toolbar-btn-columns',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-columns-two',
                        lock: [_set.paragraphLock, _set.lostConnect, _set.noParagraphSelected, _set.noColumns],
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

                    this.cmbInsertShape = new Common.UI.ComboDataViewShape({
                        cls: 'combo-styles shapes',
                        itemWidth: 20,
                        itemHeight: 20,
                        menuMaxHeight: 652,
                        menuWidth: 330,
                        style: 'width: 140px;',
                        enableKeyEvents: true,
                        lock: [_set.lostConnect, _set.disableOnStart],
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: '-16, 0'
                    });
                    this.toolbarControls.push(this.cmbInsertShape);

                    this.btnInsertText = new Common.UI.Button({
                        id: 'tlbtn-inserttext',
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-big-text',
                        lock: [_set.lostConnect, _set.disableOnStart],
                        caption: this.capInsertText,
                        enableToggle: true,
                        split: true,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small',
                        textboxType: 'textRect'
                    });
                    this.toolbarControls.push(this.btnInsertText);

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
                        lock: [_set.undoLock, _set.previewReviewMode, _set.lostConnect, _set.disableOnStart, _set.docLockView],
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
                        lock: [_set.redoLock, _set.previewReviewMode, _set.lostConnect, _set.disableOnStart, _set.docLockView],
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
                        lock: [_set.copyLock, _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.disableOnStart],
                        dataHint: '1',
                        dataHintDirection: 'top',
                        dataHintTitle: 'C'
                    });
                    this.toolbarControls.push(this.btnCopy);

                    this.btnPaste = new Common.UI.Button({
                        id: 'id-toolbar-btn-paste',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-paste',
                        lock: [_set.paragraphLock, _set.headerLock, _set.richEditLock, _set.plainEditLock, _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.disableOnStart, _set.docLockView, _set.docLockComments],
                        dataHint: '1',
                        dataHintDirection: 'top',
                        dataHintTitle: 'V'
                    });
                    this.paragraphControls.push(this.btnPaste);

                    this.btnCut = new Common.UI.Button({
                        id: 'id-toolbar-btn-cut',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-cut',
                        lock: [_set.cutLock, _set.paragraphLock, _set.headerLock, _set.richEditLock, _set.plainEditLock, _set.imageLock, _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.disableOnStart, _set.docLockView, _set.docLockComments],
                        dataHint: '1',
                        dataHintDirection: 'top',
                        dataHintTitle: 'X'
                    });
                    this.paragraphControls.push(this.btnCut);

                    this.btnSelectAll = new Common.UI.Button({
                        id: 'id-toolbar-btn-select-all',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-select-all',
                        lock: [_set.viewFormMode, _set.disableOnStart],
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
                    this.lockControls = me.toolbarControls.concat(me.paragraphControls);
                    this.lockToolbar(Common.enumLock.disableOnStart, true, {array: this.lockControls});

                    this.on('render:after', _.bind(this.onToolbarAfterRender, this));
                } else {
                    Common.UI.Mixtbar.prototype.initialize.call(this, {
                            template: _.template(template_view),
                            tabs: [
                                {caption: me.textTabFile, action: 'file', layoutname: 'toolbar-file', haspanel: false, dataHintTitle: 'F'}
                            ]
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
                    me.$el.html(me.rendererComponents(me.$layout));
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
                    this.showSynchTip = !Common.localStorage.getBool("de-hide-synch");
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

            rendererComponents: function (html) {
                var $host = $(html);
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
                _injectComponent('#slot-btn-comment', this.btnAddComment);
                _injectComponent('#slot-btn-strikeout', this.btnStrikeout);
                _injectComponent('#slot-btn-underline', this.btnUnderline);
                _injectComponent('#slot-btn-highlight', this.btnHighlight);
                // _injectComponent('#slot-btn-rotate', this.btnRotate);
                _injectComponent('#slot-btn-pages', this.fieldPages);
                _injectComponent('#slot-btn-first-page', this.btnFirstPage);
                _injectComponent('#slot-btn-last-page', this.btnLastPage);
                _injectComponent('#slot-btn-prev-page', this.btnPrevPage);
                _injectComponent('#slot-btn-next-page', this.btnNextPage);
                _injectComponent('#slot-chk-showcomment', this.chShowComments);
                _injectComponent('#slot-btn-form-clear', this.btnClear);
                _injectComponent('#slot-btn-form-prev', this.btnPrevForm);
                _injectComponent('#slot-btn-form-next', this.btnNextForm);
                _injectComponent('#slot-btn-form-submit', this.btnSubmit);
                _injectComponent('#slot-btn-form-save', this.btnSaveForm);
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
                _injectComponent('#slot-combo-insertshape', this.cmbInsertShape);
                _injectComponent('#slot-btn-instext', this.btnInsertText);

                this.btnPrint.menu && this.btnPrint.$el.addClass('split');
                return $host;
            },

            createPen: function(button, id, transparent) {
                var mnu;
                button.setMenu(new Common.UI.Menu({
                    cls: 'shifted-left',
                    style: 'min-width: 100px;',
                    items: [
                        {template: _.template('<div id="id-toolbar-menu-' + id + '" style="width: 174px; display: inline-block;" class="palette-large"></div>')},
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
                var picker = new Common.UI.ThemeColorPalette({
                    el: $('#id-toolbar-menu-' + id),
                    colors: button.options.penOptions.colors || [
                        '1755A0', 'D43230', 'F5C346', 'EA3368', '12A489', '552F8B', '9D1F87', 'BB2765', '479ED2', '67C9FA',
                        '3D8A44', '80CA3D', '1C19B4', '7F4B0F', 'FF7E07', 'FFFFFF', 'D3D3D4', '879397', '575757', '000000'
                    ],
                    value: button.currentColor,
                    dynamiccolors: 5,
                    themecolors: 0,
                    effects: 0,
                    columns: 5,
                    outerMenu: {menu: button.menu, index: 0, focusOnShow: true},
                    storageSuffix: '-draw'
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
                        var arr = me.createPen(me.btnStrikeout, 'strikeout');
                        me.mnuStrikeoutColorPicker = arr[0];
                        me.mnuStrikeoutTransparent = arr[1];
                    }
                    if (me.btnUnderline && me.btnUnderline.menu) {
                        var arr = me.createPen(me.btnUnderline, 'underline');
                        me.mnuUnderlineColorPicker = arr[0];
                        me.mnuUnderlineTransparent = arr[1];
                    }
                    if (me.btnHighlight && me.btnHighlight.menu) {
                        var arr = me.createPen(me.btnHighlight, 'highlight');
                        me.mnuHighlightColorPicker = arr[0];
                        me.mnuHighlightTransparent = arr[1];
                    }
                    if (me.btnTextHighlightColor && me.btnTextHighlightColor.menu) {
                        var arr = me.createPen(me.btnTextHighlightColor, 'text-highlight', true);
                        me.mnuTextHighlightColorPicker = arr[0];
                        me.mnuTextHighlightTransparent = arr[1];
                    }
                    if (me.btnFontColor && me.btnFontColor.menu) {
                        var arr = me.createPen(me.btnFontColor, 'font');
                        me.mnuFontColorPicker = arr[0];
                        me.mnuFontTransparent = arr[1];
                    }

                    me.btnInsertText && me.btnInsertText.setMenu(new Common.UI.Menu({
                        items: [
                            {
                                caption: me.tipInsertHorizontalText,
                                checkable: true,
                                checkmark: false,
                                iconCls     : 'menu__icon btn-text',
                                toggleGroup: 'textbox',
                                value: 'textRect',
                                iconClsForMainBtn: 'btn-big-text'
                            },
                            {
                                caption: me.tipInsertVerticalText,
                                checkable: true,
                                checkmark: false,
                                iconCls     : 'menu__icon btn-text-vertical',
                                toggleGroup: 'textbox',
                                value: 'textRectVertical',
                                iconClsForMainBtn: 'btn-big-text-vertical'
                            },
                        ]
                    }));

                });
            },

            createDelayedElements: function () {
                if (this.api) {
                    this.updateMetricUnit();
                }

                // set hints
                if (this.mode.isEdit) {
                    this.btnSave.updateHint(this.btnSaveTip);
                    this.btnAddComment.updateHint(this.tipAddComment);
                    this.btnStrikeout.updateHint(this.textStrikeout);
                    this.btnUnderline.updateHint(this.textUnderline);
                    this.btnHighlight.updateHint(this.textHighlight);
                    // this.btnRotate.updateHint(this.tipRotate);
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
                    this.btnInsertText.updateHint([this.tipInsertHorizontalText ,this.tipInsertText]);
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

                } else if (this.mode.isRestrictedEdit) {
                    this.btnClear.updateHint(this.textClearFields);
                    this.btnPrevForm.updateHint(this.tipPrevForm);
                    this.btnNextForm.updateHint(this.tipNextForm);
                    this.btnSubmit && this.btnSubmit.updateHint(this.tipSubmit);
                    this.btnSaveForm && this.btnSaveForm.updateHint(this.mode.canRequestSaveAs || !!this.mode.saveAsUrl ? this.tipSaveForm : this.tipDownloadForm);
                }
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

                this.btnSave.setDisabled(!this.mode.isPDFEdit && !this.mode.isPDFAnnotate && !this.mode.saveAlwaysEnabled);
                Common.Gateway.collaborativeChanges();
            },

            createSynchTip: function () {
                this.synchTooltip = new Common.UI.SynchronizeTip({
                    extCls: (this.mode.customization && !!this.mode.customization.compactHeader) ? undefined : 'inc-index',
                    placement: 'right-bottom',
                    target: this.btnCollabChanges.$el
                });
                this.synchTooltip.on('dontshowclick', function () {
                    this.showSynchTip = false;
                    this.synchTooltip.hide();
                    this.btnCollabChanges.updateHint(this.tipSynchronize + Common.Utils.String.platformKey('Ctrl+S'));
                    Common.localStorage.setItem("de-hide-synch", 1);
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

                        this.btnSave.setDisabled(!me.mode.forcesave || !me.mode.isPDFEdit && !me.mode.isPDFAnnotate && !me.mode.saveAlwaysEnabled);
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
                    me.btnCollabChanges.$icon.removeClass(me.btnSaveCls).addClass(cls);
                    me.btnSaveCls = cls;
                }
            },

            /** coauthoring end **/

            updateAutoshapeMenu: function (menuShape, collection) {
                var me = this,
                    index = $(menuShape.el).prop('id').slice(-1);

                var menuitem = new Common.UI.MenuItem({
                    template: _.template('<div id="id-toolbar-menu-insertshape-<%= options.index %>" class="menu-insertshape"></div>'),
                    index: index
                });
                menuShape.addItem(menuitem);

                var recents = Common.localStorage.getItem('pdfe-recent-shapes');
                recents = recents ? JSON.parse(recents) : null;

                var shapePicker = new Common.UI.DataViewShape({
                    el: $('#id-toolbar-menu-insertshape-'+index),
                    itemTemplate: _.template('<div class="item-shape" id="<%= id %>"><svg width="20" height="20" class=\"icon uni-scale\"><use xlink:href=\"#svg-icon-<%= data.shapeType %>\"></use></svg></div>'),
                    groups: collection,
                    parentMenu: menuShape,
                    restoreHeight: 652,
                    textRecentlyUsed: me.textRecentlyUsed,
                    recentShapes: recents
                });
                shapePicker.on('item:click', function(picker, item, record, e) {
                    if (e.type !== 'click') Common.UI.Menu.Manager.hideAll();
                    if (record) {
                        me.fireEvent('insert:shape', [record.get('data').shapeType]);
                        me.cmbInsertShape.updateComboView(record);
                    }
                });

            },

            updateComboAutoshapeMenu: function (collection) {
                var me = this,
                    recents = Common.localStorage.getItem('pdfe-recent-shapes');
                recents = recents ? JSON.parse(recents) : null;
                me.cmbInsertShape.setMenuPicker(collection, recents, me.textRecentlyUsed);
            },

            lockToolbar: function (causes, lock, opts) {
                Common.Utils.lockControls(causes, lock, opts, this.lockControls);
            },

            tipCopy: 'Copy',
            tipPaste: 'Paste',
            tipUndo: 'Undo',
            tipRedo: 'Redo',
            tipPrint: 'Print',
            tipPrintQuick: 'Quick print',
            tipSave: 'Save',
            tipSelectTool: 'Select tool',
            tipHandTool: 'Hand tool',
            tipSynchronize: 'The document has been changed by another user. Please click to save your changes and reload the updates.',
            tipSaveCoauth: 'Save your changes for the other users to see them.',
            textTabFile: 'File',
            textTabHome: 'Home',
            capBtnSelect: 'Select',
            capBtnHand: 'Hand',
            textTabView: 'View',
            tipSelectAll: 'Select all',
            tipCut: 'Cut',
            textTabComment: 'Comment',
            capBtnComment: 'Comment',
            tipAddComment: 'Add comment',
            strMenuNoFill: 'No Fill',
            textStrikeout: 'Strikeout',
            textUnderline: 'Underline',
            textHighlight: 'Highlight',
            capBtnRotate: 'Rotate',
            tipRotate: 'Rotate pages',
            tipFirstPage: 'Go to the first page',
            tipLastPage: 'Go to the last page',
            tipPrevPage: 'Go to the previous page',
            tipNextPage: 'Go to the next page',
            capBtnShowComments: 'Show Comments',
            textClearFields: 'Clear All Fields',
            textClear: 'Clear Fields',
            capBtnPrev: 'Previous Field',
            capBtnNext: 'Next Field',
            capBtnSubmit: 'Submit',
            tipPrevForm: 'Go to the previous field',
            tipNextForm: 'Go to the next field',
            tipSubmit: 'Submit form',
            textSubmited: 'Form submitted successfully',
            capBtnSaveForm: 'Save as pdf',
            capBtnSaveFormDesktop: 'Save as...',
            tipSaveForm: 'Save a file as a fillable PDF',
            capBtnDownloadForm: 'Download as pdf',
            tipDownloadForm: 'Download a file as a fillable PDF',
            textTabEdit: 'Edit',
            textBold: 'Bold',
            textItalic: 'Italic',
            textSuperscript: 'Superscript',
            textSubscript: 'Subscript',
            tipFontName: 'Font Name',
            tipFontSize: 'Font Size',
            tipFontColor: 'Font color',
            tipMarkers: 'Bullets',
            tipNumbers: 'Numbering',
            tipClearStyle: 'Clear Style',
            tipHAligh: 'Horizontal Align',
            tipVAligh: 'Vertical Align',
            textAlignTop: 'Align text to the top',
            textAlignMiddle: 'Align text to the middle',
            textAlignBottom: 'Align text to the bottom',
            textAlignLeft: 'Left align text',
            textAlignRight: 'Right align text',
            textAlignCenter: 'Center text',
            textAlignJust: 'Justify',
            tipDecPrLeft: 'Decrease Indent',
            tipIncPrLeft: 'Increase Indent',
            tipLineSpace: 'Line Spacing',
            tipInsertHorizontalText: 'Insert horizontal text box',
            tipInsertVerticalText: 'Insert vertical text box',
            tipInsertText: 'Insert Text',
            capInsertText: 'Text',
            tipIncFont: 'Increment font size',
            tipDecFont: 'Decrement font size',
            tipColumns: 'Insert columns',
            textColumnsOne: 'One Column',
            textColumnsTwo: 'Two Columns',
            textColumnsThree: 'Three Columns',
            textColumnsCustom: 'Custom Columns',
            tipChangeCase: 'Change case',
            mniSentenceCase: 'Sentence case.',
            mniLowerCase: 'lowercase',
            mniUpperCase: 'UPPERCASE',
            mniCapitalizeWords: 'Capitalize Each Word',
            mniToggleCase: 'tOGGLE cASE',
            tipHighlightColor: 'Highlight color',
            tipNumCapitalLetters: 'A. B. C.',
            tipNumLettersParentheses: 'a) b) c)',
            tipNumLettersPoints: 'a. b. c.',
            tipNumNumbersPoint: '1. 2. 3.',
            tipNumNumbersParentheses: '1) 2) 3)',
            tipNumRoman: 'I. II. III.',
            tipNumRomanSmall: 'i. ii. iii.',
            tipMarkersFRound: 'Filled round bullets',
            tipMarkersHRound: 'Hollow round bullets',
            tipMarkersFSquare: 'Filled square bullets',
            tipMarkersStar: 'Star bullets',
            tipMarkersArrow: 'Arrow bullets',
            tipMarkersCheckmark: 'Checkmark bullets',
            tipMarkersFRhombus: 'Filled rhombus bullets',
            tipMarkersDash: 'Dash bullets',
            tipNone: 'None',
            textRecentlyUsed: 'Recently Used',
        }
    })(), PDFE.Views.Toolbar || {}));
});
