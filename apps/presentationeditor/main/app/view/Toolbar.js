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
 *  Created on 4/16/14
 *
 */

define([
    'backbone',
    'text!presentationeditor/main/app/template/Toolbar.template',
    'text!presentationeditor/main/app/template/ToolbarView.template',
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
    ,'common/main/lib/component/Mixtbar',
    'common/main/lib/component/ComboDataViewShape'
], function (Backbone, template, template_view) {
    'use strict';

    if (!Common.enumLock)
        Common.enumLock = {};

    var enumLock = {
        paragraphLock:  'para-lock',
        shapeLock:      'shape-lock',
        slideLock:      'slide-lock',
        slideDeleted:   'slide-deleted',
        noSlides:       'no-slides',
        lostConnect:    'disconnect',
        incIndentLock:   'can-inc-indent',
        decIndentLock:   'can-dec-indent',
        hyperlinkLock:   'can-hyperlink',
        undoLock:        'can-undo',
        redoLock:        'can-redo',
        docPropsLock:   'doc-props-lock',
        themeLock:      'theme-lock',
        menuFileOpen:   'menu-file-open',
        noParagraphSelected:  'no-paragraph',
        noObjectSelected:  'no-object', // no objects in stack from asc_onFocusObject event
        noDrawingObjects:  'no-drawing-object', // asc_getSelectedDrawingObjectsCount<1 (2 selected tables: noObjectSelected=true, noDrawingObjects = false)
        disableOnStart: 'on-start',
        cantPrint:      'cant-print',
        noTextSelected:  'no-text',
        inEquation: 'in-equation',
        commentLock: 'can-comment',
        noColumns: 'no-columns',
        transitLock: 'transit-lock',
        inSmartart: 'in-smartart',
        inSmartartInternal: 'in-smartart-internal',
        noGraphic: 'no-graphic',
        noAnimation: 'no-animation',
        noAnimationParam: 'no-animation-params',
        noTriggerObjects: 'no-trigger-objects',
        noMoveAnimationEarlier: 'no-move-animation-earlier',
        noMoveAnimationLater: 'no-move-animation-later',
        noAnimationPreview: 'no-animation-preview',
        noAnimationRepeat: 'no-animation-repeat',
        noAnimationDuration: 'no-animation-duration',
        timingLock: 'timing-lock',
        copyLock:   'can-copy',
        fileMenuOpened: 'file-menu-opened',
        noParagraphObject:  'no-paragraph-obj',
        inSlideMaster: 'in-slide-master',
        slideMasterMode: 'slide-master-mode',
        cantMergeShape: 'merge-shape-lock',
        cantSave: 'cant-save',
        macrosStopped: 'macros-stopped'
    };
    for (var key in enumLock) {
        if (enumLock.hasOwnProperty(key)) {
            Common.enumLock[key] = enumLock[key];
        }
    }

    PE.Views.Toolbar =  Common.UI.Mixtbar.extend(_.extend((function(){

        return {
            el: '#toolbar',

            // Delegated events for creating new items, and clearing completed ones.
            events: {
                //
            },

            initialize: function () {
                var me = this;

                me.paragraphControls = [];
                me.shapeControls = [];
                me.slideOnlyControls = [];
                me.synchTooltip = undefined;
                me.needShowSynchTip = false;

                me.shortcutHints = {};
                me._state = {
                    hasCollaborativeChanges: undefined
                };
                me.binding = {};

                Common.NotificationCenter.on('app:ready', me.onAppReady.bind(this));
                return this;
            },

            applyLayout: function (config) {
                var me = this;
                me.lockControls = [];
                me.nolockControls = [];
                if ( config.isEdit ) {
                    Common.UI.Mixtbar.prototype.initialize.call(this, {
                            template: _.template(template),
                            tabs: [
                                {caption: me.textTabFile, action: 'file', extcls: 'canedit', layoutname: 'toolbar-file', haspanel:false, dataHintTitle: 'F'},
                                {caption: me.textTabHome, action: 'home', extcls: 'canedit', dataHintTitle: 'H'},
                                {caption: me.textTabInsert, action: 'ins', extcls: 'canedit', dataHintTitle: 'I'},
                                {caption: me.textTabDesign, action: 'design', extcls: 'canedit', dataHintTitle: 'D'},
                                {caption: me.textTabTransitions, action: 'transit', extcls: 'canedit', dataHintTitle: 'N'},
                                {caption: me.textTabAnimation, action: 'animate', extcls: 'canedit', dataHintTitle: 'A'}
                                // undefined, undefined, undefined,
                            ]
                        }
                    );

                    me.btnSaveCls = 'btn-save';
                    me.btnSaveTip = this.tipSave;

                    /**
                     * UI Components
                     */
                    var _set = Common.enumLock;

                    me.btnPrint = new Common.UI.Button({
                        id: 'id-toolbar-btn-print',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-print no-mask',
                        lock: [_set.slideDeleted, _set.noSlides, _set.cantPrint, _set.disableOnStart],
                        signals: ['disabled'],
                        split: config.canQuickPrint,
                        menu: config.canQuickPrint,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintTitle: 'P',
                        printType: 'print'
                    });
                    me.slideOnlyControls.push(me.btnPrint);
                    me.nolockControls.push(me.btnPrint);
                    me.shortcutHints.PrintPreviewAndPrint = {
                        btn: me.btnPrint,
                        label: me.tipPrint
                    };

                    me.btnSave = new Common.UI.Button({
                        id: 'id-toolbar-btn-save',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon no-mask ' + me.btnSaveCls,
                        lock: [_set.cantSave, _set.lostConnect],
                        signals: ['disabled'],
                        dataHint: '1',
                        dataHintDirection: 'top',
                        dataHintTitle: 'S'
                    });
                    me.btnCollabChanges = me.btnSave;
                    me.lockControls.push(me.btnSave);
                    me.shortcutHints.Save = {
                        applyCallback: function(item, hintText) {
                            me.btnSave.updateHint(me.btnSaveTip + hintText);
                        }
                    };

                    me.btnUndo = new Common.UI.Button({
                        id: 'id-toolbar-btn-undo',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-undo icon-rtl',
                        lock: [_set.undoLock, _set.slideDeleted, _set.lostConnect, _set.disableOnStart],
                        signals: ['disabled'],
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintTitle: 'Z'
                    });
                    me.slideOnlyControls.push(me.btnUndo);
                    me.lockControls.push(me.btnUndo);
                    me.shortcutHints.EditUndo = {
                        btn: me.btnUndo,
                        label: me.tipUndo
                    };

                    me.btnRedo = new Common.UI.Button({
                        id: 'id-toolbar-btn-redo',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-redo icon-rtl',
                        lock: [_set.redoLock, _set.slideDeleted, _set.lostConnect, _set.disableOnStart],
                        signals: ['disabled'],
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintTitle: 'Y'
                    });
                    me.slideOnlyControls.push(me.btnRedo);
                    me.lockControls.push(me.btnRedo);
                    me.shortcutHints.EditRedo = {
                        btn: me.btnRedo,
                        label: me.tipRedo
                    };

                    me.btnCopy = new Common.UI.Button({
                        id: 'id-toolbar-btn-copy',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-copy',
                        lock: [_set.slideDeleted, _set.lostConnect, _set.noSlides, _set.disableOnStart, _set.copyLock],
                        dataHint: '1',
                        dataHintDirection: 'top',
                        dataHintTitle: 'C'
                    });
                    me.slideOnlyControls.push(me.btnCopy);
                    me.lockControls.push(me.btnCopy);
                    me.shortcutHints.Copy = {
                        btn: me.btnCopy,
                        label: me.tipCopy
                    };

                    me.btnPaste = new Common.UI.Button({
                        id: 'id-toolbar-btn-paste',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-paste',
                        lock: [_set.slideDeleted, _set.paragraphLock, _set.lostConnect, _set.noSlides],
                        dataHint: '1',
                        dataHintDirection: 'top',
                        dataHintTitle: 'V'
                    });
                    me.paragraphControls.push(me.btnPaste);
                    me.lockControls.push(me.btnPaste);
                    me.shortcutHints.Paste = {
                        btn: me.btnPaste,
                        label: me.tipPaste
                    };

                    me.btnCut = new Common.UI.Button({
                        id: 'id-toolbar-btn-cut',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-cut',
                        lock: [_set.slideDeleted, _set.paragraphLock, _set.shapeLock, _set.slideLock, _set.lostConnect, _set.noSlides, _set.disableOnStart, _set.copyLock],
                        dataHint: '1',
                        dataHintDirection: 'top',
                        dataHintTitle: 'X'
                    });
                    me.paragraphControls.push(me.btnCut);
                    me.lockControls.push(me.btnCut);
                    me.shortcutHints.Cut = {
                        btn: me.btnCut,
                        label: me.tipCut
                    };

                    me.btnAddSlide = new Common.UI.Button({
                        id: 'id-toolbar-btn-add-slide',
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-addslide',
                        caption: this.capAddSlide,
                        lock: [_set.menuFileOpen, _set.lostConnect, _set.disableOnStart],
                        split: true,
                        menu: true,
                        action: 'add-slide',
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    me.btnAddSlide.on('click', function (btn, e) {
                        me.fireEvent('add:slide');
                    });
                    me.slideOnlyControls.push(me.btnAddSlide);
                    me.lockControls.push(me.btnAddSlide);
                    me.shortcutHints.NewSlide = {
                        btn: me.btnAddSlide,
                        label: me.tipAddSlide
                    };

                    me.btnChangeSlide = new Common.UI.Button({
                        id: 'id-toolbar-button-change-slide',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-changeslide',
                        lock: [_set.menuFileOpen, _set.slideDeleted, _set.slideLock, _set.lostConnect, _set.noSlides, _set.disableOnStart],
                        menu: true,
                        action: 'change-slide',
                        dataHint: '1',
                        dataHintDirection: 'top',
                        dataHintOffset: '0, -6'
                    });
                    me.slideOnlyControls.push(me.btnChangeSlide);
                    me.lockControls.push(me.btnChangeSlide);

                    me.btnPreview = new Common.UI.Button({
                        id: 'id-toolbar-btn-preview',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-preview',
                        lock: [_set.menuFileOpen, _set.slideDeleted, _set.noSlides, _set.disableOnStart],
                        split: true,
                        menu: true,
                        signals: ['disabled'],
                        action: 'preview-slide',
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: '0, -6'
                    });
                    me.slideOnlyControls.push(me.btnPreview);
                    me.nolockControls.push(me.btnPreview);

                    me.btnSelectAll = new Common.UI.Button({
                        id: 'id-toolbar-btn-select-all',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-select-all',
                        lock: [_set.noSlides, _set.disableOnStart],
                        dataHint: '1',
                        dataHintDirection: 'bottom'
                    });
                    me.slideOnlyControls.push(me.btnSelectAll);
                    me.lockControls.push(me.btnSelectAll);
                    me.shortcutHints.EditSelectAll = {
                        btn: me.btnSelectAll,
                        label: me.tipSelectAll
                    };

                    me.btnReplace = new Common.UI.Button({
                        id: 'id-toolbar-btn-replace',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-replace',
                        lock: [_set.noSlides, _set.disableOnStart],
                        dataHint: '1',
                        dataHintDirection: 'top'
                    });
                    me.slideOnlyControls.push(me.btnReplace);
                    me.lockControls.push(me.btnReplace);
                    me.shortcutHints.OpenFindAndReplaceMenu = {
                        btn: me.btnReplace,
                        label: me.tipReplace
                    };

                    me.cmbFontName = new Common.UI.ComboBoxFonts({
                        cls: 'input-group-nr',
                        menuCls: 'scrollable-menu',
                        menuStyle: 'min-width: 325px;',
                        hint: me.tipFontName,
                        lock: [_set.slideDeleted, _set.paragraphLock, _set.lostConnect, _set.noSlides, _set.noTextSelected, _set.shapeLock],
                        store: new Common.Collections.Fonts(),
                        dataHint: '1',
                        dataHintDirection: 'top'
                    });
                    me.paragraphControls.push(me.cmbFontName);
                    me.lockControls.push(me.cmbFontName);

                    me.cmbFontSize = new Common.UI.ComboBox({
                        cls: 'input-group-nr',
                        menuStyle: 'min-width: 55px;',
                        hint: me.tipFontSize,
                        lock: [_set.slideDeleted, _set.paragraphLock, _set.lostConnect, _set.noSlides, _set.noTextSelected, _set.shapeLock],
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
                    me.paragraphControls.push(me.cmbFontSize);
                    me.lockControls.push(me.cmbFontSize);

                    me.btnIncFontSize = new Common.UI.Button({
                        id: 'id-toolbar-btn-incfont',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-incfont',
                        lock: [_set.slideDeleted, _set.paragraphLock, _set.lostConnect, _set.noSlides, _set.noTextSelected, _set.shapeLock],
                        dataHint: '1',
                        dataHintDirection: 'top'
                    });
                    me.paragraphControls.push(me.btnIncFontSize);
                    me.lockControls.push(me.btnIncFontSize);
                    me.shortcutHints.IncreaseFontSize = {
                        btn: me.btnIncFontSize,
                        label: me.tipIncFont
                    };

                    me.btnDecFontSize = new Common.UI.Button({
                        id: 'id-toolbar-btn-decfont',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-decfont',
                        lock: [_set.slideDeleted, _set.paragraphLock, _set.lostConnect, _set.noSlides, _set.noTextSelected, _set.shapeLock],
                        dataHint: '1',
                        dataHintDirection: 'top'
                    });
                    me.paragraphControls.push(me.btnDecFontSize);
                    me.lockControls.push(me.btnDecFontSize);
                    me.shortcutHints.DecreaseFontSize = {
                        btn: me.btnDecFontSize,
                        label: me.tipDecFont
                    };

                    me.btnBold = new Common.UI.Button({
                        id: 'id-toolbar-btn-bold',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-bold',
                        lock: [_set.slideDeleted, _set.paragraphLock, _set.lostConnect, _set.noSlides, _set.noTextSelected, _set.shapeLock],
                        enableToggle: true,
                        dataHint: '1',
                        dataHintDirection: 'bottom'
                    });
                    me.paragraphControls.push(me.btnBold);
                    me.lockControls.push(me.btnBold);
                    me.shortcutHints.Bold = {
                        btn: me.btnBold,
                        label: me.textBold
                    };

                    me.btnItalic = new Common.UI.Button({
                        id: 'id-toolbar-btn-italic',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-italic',
                        lock: [_set.slideDeleted, _set.paragraphLock, _set.lostConnect, _set.noSlides, _set.noTextSelected, _set.shapeLock],
                        enableToggle: true,
                        dataHint: '1',
                        dataHintDirection: 'bottom'
                    });
                    me.paragraphControls.push(me.btnItalic);
                    me.lockControls.push(me.btnItalic);
                    me.shortcutHints.Italic = {
                        btn: me.btnItalic,
                        label: me.textItalic
                    };

                    me.btnUnderline = new Common.UI.Button({
                        id: 'id-toolbar-btn-underline',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-underline',
                        lock: [_set.slideDeleted, _set.paragraphLock, _set.lostConnect, _set.noSlides, _set.noTextSelected, _set.shapeLock],
                        enableToggle: true,
                        dataHint: '1',
                        dataHintDirection: 'bottom'
                    });
                    me.paragraphControls.push(me.btnUnderline);
                    me.lockControls.push(me.btnUnderline);
                    me.shortcutHints.Underline = {
                        btn: me.btnUnderline,
                        label: me.textUnderline
                    };

                    me.btnStrikeout = new Common.UI.Button({
                        id: 'id-toolbar-btn-strikeout',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-strikeout',
                        lock: [_set.slideDeleted, _set.paragraphLock, _set.lostConnect, _set.noSlides, _set.noTextSelected, _set.shapeLock],
                        enableToggle: true,
                        dataHint: '1',
                        dataHintDirection: 'bottom'
                    });
                    me.paragraphControls.push(me.btnStrikeout);
                    me.lockControls.push(me.btnStrikeout);
                    me.shortcutHints.Strikeout = {
                        btn: me.btnStrikeout,
                        label: me.textStrikeout
                    };

                    me.btnSuperscript = new Common.UI.Button({
                        id: 'id-toolbar-btn-superscript',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-superscript',
                        lock: [_set.slideDeleted, _set.paragraphLock, _set.lostConnect, _set.noSlides, _set.noTextSelected, _set.shapeLock, _set.inEquation],
                        enableToggle: true,
                        toggleGroup: 'superscriptGroup',
                        dataHint: '1',
                        dataHintDirection: 'bottom'
                    });
                    me.paragraphControls.push(me.btnSuperscript);
                    me.lockControls.push(me.btnSuperscript);
                    me.shortcutHints.Superscript = {
                        btn: me.btnSuperscript,
                        label: me.textSuperscript
                    };

                    me.btnSubscript = new Common.UI.Button({
                        id: 'id-toolbar-btn-subscript',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-subscript',
                        lock: [_set.slideDeleted, _set.paragraphLock, _set.lostConnect, _set.noSlides, _set.noTextSelected, _set.shapeLock, _set.inEquation],
                        enableToggle: true,
                        toggleGroup: 'superscriptGroup',
                        dataHint: '1',
                        dataHintDirection: 'bottom'
                    });
                    me.paragraphControls.push(me.btnSubscript);
                    me.lockControls.push(me.btnSubscript);
                    me.shortcutHints.Subscript = {
                        btn: me.btnSubscript,
                        label: me.textSubscript
                    };

                    me.btnHighlightColor = new Common.UI.ButtonColored({
                        id: 'id-toolbar-btn-highlight',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-highlight',
                        enableToggle: true,
                        allowDepress: true,
                        split: true,
                        lock: [_set.slideDeleted, _set.paragraphLock, _set.lostConnect, _set.noSlides, _set.noTextSelected, _set.shapeLock],
                        menu: new Common.UI.Menu({
                            style: 'min-width: 100px;',
                            items: [
                                {template: _.template('<div id="id-toolbar-menu-highlight" style="width: 145px; display: inline-block;" class="palette-large"></div>')},
                                {caption: '--'},
                                me.mnuHighlightTransparent = new Common.UI.MenuItem({
                                    caption: me.strMenuNoFill,
                                    checkable: true
                                })
                            ]
                        }),
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: '0, -16'
                    });
                    me.paragraphControls.push(me.btnHighlightColor);
                    me.lockControls.push(me.btnHighlightColor);

                    me.btnFontColor = new Common.UI.ButtonColored({
                        id: 'id-toolbar-btn-fontcolor',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-fontcolor',
                        lock: [_set.slideDeleted, _set.paragraphLock, _set.lostConnect, _set.noSlides, _set.noTextSelected, _set.shapeLock],
                        split: true,
                        menu: true,
                        eyeDropper: true,
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: '0, -16'
                    });
                    me.paragraphControls.push(me.btnFontColor);
                    me.lockControls.push(me.btnFontColor);

                    me.btnChangeCase = new Common.UI.Button({
                        id: 'id-toolbar-btn-case',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-change-case',
                        action: 'change-case',
                        lock: [_set.slideDeleted, _set.paragraphLock, _set.lostConnect, _set.noSlides, _set.noTextSelected, _set.shapeLock],
                        menu: new Common.UI.Menu({
                            items: [
                                {caption: me.mniSentenceCase, value: Asc.c_oAscChangeTextCaseType.SentenceCase},
                                {caption: me.mniLowerCase, value: Asc.c_oAscChangeTextCaseType.LowerCase},
                                {caption: me.mniUpperCase, value: Asc.c_oAscChangeTextCaseType.UpperCase},
                                {caption: me.mniCapitalizeWords, value: Asc.c_oAscChangeTextCaseType.CapitalizeWords},
                                {caption: me.mniToggleCase, value: Asc.c_oAscChangeTextCaseType.ToggleCase}
                            ]
                        }),
                        dataHint: '1',
                        dataHintDirection: 'top',
                        dataHintOffset: '0, -6'
                    });
                    me.paragraphControls.push(me.btnChangeCase);
                    me.lockControls.push(me.btnChangeCase);
                    me.mnuChangeCase = me.btnChangeCase.menu;

                    me.btnClearStyle = new Common.UI.Button({
                        id: 'id-toolbar-btn-clearstyle',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-clearstyle',
                        lock: [_set.slideDeleted, _set.paragraphLock, _set.lostConnect, _set.noSlides, _set.noParagraphSelected],
                        dataHint: '1',
                        dataHintDirection: 'bottom'
                    });
                    me.paragraphControls.push(me.btnClearStyle);
                    me.lockControls.push(me.btnClearStyle);

                    me.btnCopyStyle = new Common.UI.Button({
                        id: 'id-toolbar-btn-copystyle',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-copystyle',
                        lock: [_set.slideDeleted, _set.lostConnect, _set.noSlides, _set.noParagraphSelected, _set.disableOnStart],
                        enableToggle: true,
                        dataHint: '1',
                        dataHintDirection: 'bottom'
                    });
                    me.slideOnlyControls.push(me.btnCopyStyle);
                    me.lockControls.push(me.btnCopyStyle);
                    me.shortcutHints.CopyFormat = {
                        btn: me.btnCopyStyle,
                        label: me.tipCopyStyle
                    };

                    me.btnMarkers = new Common.UI.Button({
                        id: 'id-toolbar-btn-markers',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon ' + (!Common.UI.isRTL() ? 'btn-setmarkers' : 'btn-setmarkers-rtl'),
                        lock: [_set.slideDeleted, _set.paragraphLock, _set.lostConnect, _set.noSlides, _set.noParagraphSelected, _set.inSmartart, _set.inSmartartInternal],
                        enableToggle: true,
                        toggleGroup: 'markersGroup',
                        split: true,
                        menu: true,
                        dataHint: '1',
                        dataHintDirection: 'top',
                        dataHintOffset: '0, -16'
                    });
                    me.paragraphControls.push(me.btnMarkers);
                    me.lockControls.push(me.btnMarkers);

                    me.btnNumbers = new Common.UI.Button({
                        id: 'id-toolbar-btn-numbering',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon ' + (!Common.UI.isRTL() ? 'btn-numbering' : 'btn-numbering-rtl'),
                        lock: [_set.slideDeleted, _set.paragraphLock, _set.lostConnect, _set.noSlides, _set.noParagraphSelected, _set.inSmartart, _set.inSmartartInternal],
                        enableToggle: true,
                        toggleGroup: 'markersGroup',
                        split: true,
                        menu: true,
                        dataHint: '1',
                        dataHintDirection: 'top',
                        dataHintOffset: '0, -16'
                    });
                    me.paragraphControls.push(me.btnNumbers);
                    me.lockControls.push(me.btnNumbers);

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

                    me.btnHorizontalAlign = new Common.UI.Button({
                        id: 'id-toolbar-btn-halign',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-align-left',
                        icls: 'btn-align-left',
                        lock: [_set.slideDeleted, _set.paragraphLock, _set.lostConnect, _set.noSlides, _set.noParagraphSelected],
                        menu: new Common.UI.Menu({
                            items: [
                                {
                                    caption: me.textAlignLeft,
                                    iconCls: 'menu__icon btn-align-left',
                                    icls: 'btn-align-left',
                                    checkable: true,
                                    checkmark: false,
                                    toggleGroup: 'halignGroup',
                                    checked: true,
                                    value: 1
                                },
                                {
                                    caption: me.textAlignCenter,
                                    iconCls: 'menu__icon btn-align-center',
                                    icls: 'btn-align-center',
                                    checkable: true,
                                    checkmark: false,
                                    toggleGroup: 'halignGroup',
                                    value: 2
                                },
                                {
                                    caption: me.textAlignRight,
                                    iconCls: 'menu__icon btn-align-right',
                                    icls: 'btn-align-right',
                                    checkable: true,
                                    checkmark: false,
                                    toggleGroup: 'halignGroup',
                                    value: 0
                                },
                                {
                                    caption: me.textAlignJust,
                                    iconCls: 'menu__icon btn-align-just',
                                    icls: 'btn-align-just',
                                    checkable: true,
                                    checkmark: false,
                                    toggleGroup: 'halignGroup',
                                    value: 3
                                }
                            ]
                        }),
                        action: 'align-horizontal',
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: '0, -6'
                    });
                    me.paragraphControls.push(me.btnHorizontalAlign);
                    me.lockControls.push(me.btnHorizontalAlign);
                    me.shortcutHints.LeftPara = {
                        btn: me.btnHorizontalAlign.menu.items[0],
                        label: me.textAlignLeft,
                        applyCallback: function(item, hintText) {
                            item.btn.setCaption(hintText);
                        }
                    };
                    me.shortcutHints.CenterPara = {
                        btn: me.btnHorizontalAlign.menu.items[1],
                        label: me.textAlignCenter,
                        applyCallback: function(item, hintText) {
                            item.btn.setCaption(hintText);
                        }
                    };
                    me.shortcutHints.RightPara = {
                        btn: me.btnHorizontalAlign.menu.items[2],
                        label: me.textAlignRight,
                        applyCallback: function(item, hintText) {
                            item.btn.setCaption(hintText);
                        }
                    };
                    me.shortcutHints.JustifyPara = {
                        btn: me.btnHorizontalAlign.menu.items[3],
                        label: me.textAlignJust,
                        applyCallback: function(item, hintText) {
                            item.btn.setCaption(hintText);
                        }
                    };

                    me.btnVerticalAlign = new Common.UI.Button({
                        id: 'id-toolbar-btn-valign',
                        cls: 'btn-toolbar',
                        lock: [_set.slideDeleted, _set.paragraphLock, _set.lostConnect, _set.noSlides, _set.noParagraphSelected, _set.noObjectSelected],
                        iconCls: 'toolbar__icon btn-align-middle',
                        icls: 'btn-align-middle',
                        menu: new Common.UI.Menu({
                            items: [
                                {
                                    caption: me.textAlignTop,
                                    iconCls: 'menu__icon btn-align-top',
                                    icls: 'btn-align-top',
                                    checkable: true,
                                    checkmark: false,
                                    toggleGroup: 'valignGroup',
                                    value: Asc.c_oAscVAlign.Top
                                },
                                {
                                    caption: me.textAlignMiddle,
                                    iconCls: 'menu__icon btn-align-middle',
                                    icls: 'btn-align-middle',
                                    checkable: true,
                                    checkmark: false,
                                    toggleGroup: 'valignGroup',
                                    value: Asc.c_oAscVAlign.Center,
                                    checked: true
                                },
                                {
                                    caption: me.textAlignBottom,
                                    iconCls: 'menu__icon btn-align-bottom',
                                    icls: 'btn-align-bottom',
                                    checkable: true,
                                    checkmark: false,
                                    toggleGroup: 'valignGroup',
                                    value: Asc.c_oAscVAlign.Bottom
                                }
                            ]
                        }),
                        action: 'align-vertical',
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: '0, -6'
                    });
                    me.paragraphControls.push(me.btnVerticalAlign);
                    me.lockControls.push(me.btnVerticalAlign);

                    me.btnDecLeftOffset = new Common.UI.Button({
                        id: 'id-toolbar-btn-decoffset',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-decoffset',
                        lock: [_set.decIndentLock, _set.slideDeleted, _set.paragraphLock, _set.lostConnect, _set.noSlides, _set.noParagraphSelected, _set.inSmartart, _set.inSmartartInternal],
                        dataHint: '1',
                        dataHintDirection: 'top'
                    });
                    me.paragraphControls.push(me.btnDecLeftOffset);
                    me.lockControls.push(me.btnDecLeftOffset);
                    me.shortcutHints.UnIndent = {
                        btn: me.btnDecLeftOffset,
                        label: me.tipDecPrLeft
                    };

                    me.btnIncLeftOffset = new Common.UI.Button({
                        id: 'id-toolbar-btn-incoffset',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-incoffset',
                        lock: [_set.incIndentLock, _set.slideDeleted, _set.paragraphLock, _set.lostConnect, _set.noSlides, _set.noParagraphSelected, _set.inSmartart, _set.inSmartartInternal],
                        dataHint: '1',
                        dataHintDirection: 'top'
                    });
                    me.paragraphControls.push(me.btnIncLeftOffset);
                    me.lockControls.push(me.btnIncLeftOffset);
                    me.shortcutHints.Indent = {
                        btn: me.btnIncLeftOffset,
                        label: me.tipIncPrLeft
                    };

                    me.btnLineSpace = new Common.UI.Button({
                        id: 'id-toolbar-btn-linespace',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-linespace',
                        lock: [_set.slideDeleted, _set.paragraphLock, _set.lostConnect, _set.noSlides, _set.noParagraphSelected, _set.noParagraphObject],
                        menu: new Common.UI.Menu({
                            style: 'min-width: 60px;',
                            items: [
                                {caption: '1.0', value: 1.0, checkable: true, toggleGroup: 'linesize'},
                                {caption: '1.15', value: 1.15, checkable: true, toggleGroup: 'linesize'},
                                {caption: '1.5', value: 1.5, checkable: true, toggleGroup: 'linesize'},
                                {caption: '2.0', value: 2.0, checkable: true, toggleGroup: 'linesize'},
                                {caption: '2.5', value: 2.5, checkable: true, toggleGroup: 'linesize'},
                                {caption: '3.0', value: 3.0, checkable: true, toggleGroup: 'linesize'}
                            ].concat(config.canBrandingExt && config.customization && config.customization.rightMenu === false || !Common.UI.LayoutManager.isElementVisible('rightMenu') ? [] : [
                                me.mnuLineSpaceOptions = new Common.UI.MenuItem({caption: me.textLineSpaceOptions, value: 'options'})
                            ])
                        }),
                        action: 'line-space',
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: '0, -6'
                    });
                    me.paragraphControls.push(me.btnLineSpace);
                    me.lockControls.push(me.btnLineSpace);

                    me.btnColumns = new Common.UI.Button({
                        id: 'id-toolbar-btn-columns',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-columns-two',
                        lock: [_set.slideDeleted, _set.paragraphLock, _set.lostConnect, _set.noSlides, _set.noParagraphSelected, _set.noColumns],
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
                        action: 'insert-columns',
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: '0, -6'
                    });
                    me.paragraphControls.push(me.btnColumns);
                    me.lockControls.push(me.btnColumns);

                    me.btnTextDir = new Common.UI.Button({
                        id: 'id-toolbar-btn-direction',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-ltr',
                        icls: 'btn-ltr',
                        action: 'text-direction',
                        dirRtl: false,
                        lock: [_set.slideDeleted, _set.paragraphLock, _set.lostConnect, _set.noSlides, _set.noParagraphSelected, _set.noParagraphObject],
                        menu: new Common.UI.Menu({
                            items: [
                                {caption: me.textDirLtr, value: false, iconCls: 'menu__icon btn-ltr'},
                                {caption: me.textDirRtl, value: true, iconCls: 'menu__icon btn-rtl'},
                            ]
                        }),
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: '0, -6'
                    });
                    me.paragraphControls.push(me.btnTextDir);
                    me.lockControls.push(me.btnLineSpace);

                    me.btnInsertTable = new Common.UI.Button({
                        id: 'tlbtn-inserttable',
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-inserttable',
                        caption: me.capInsertTable,
                        lock: [_set.slideDeleted, _set.lostConnect, _set.noSlides, _set.disableOnStart],
                        menu: new Common.UI.Menu({
                            cls: 'shifted-left',
                            items: [
                                {template: _.template('<div id="id-toolbar-menu-tablepicker" class="dimension-picker" style="margin: 5px 10px;"></div>')},
                                {caption: me.mniCustomTable, value: 'custom'},
                                {caption: me.mniInsertSSE, value: 'sse'}
                            ]
                        }),
                        action: 'insert-table',
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    me.slideOnlyControls.push(me.btnInsertTable);
                    me.lockControls.push(me.btnInsertTable);

                    me.btnInsertChart = new Common.UI.Button({
                        id: 'tlbtn-insertchart',
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-insertchart',
                        caption: me.capInsertChart,
                        lock: [_set.slideDeleted, _set.lostConnect, _set.noSlides, _set.disableOnStart],
                        menu: true,
                        action: 'insert-chart',
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    me.slideOnlyControls.push(me.btnInsertChart);
                    me.lockControls.push(me.btnInsertChart);

                    this.btnInsertSmartArt = new Common.UI.Button({
                        id: 'tlbtn-insertsmartart',
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-smart-art',
                        lock: [_set.slideDeleted, _set.lostConnect, _set.noSlides, _set.disableOnStart],
                        caption: me.capBtnInsSmartArt,
                        menu: true,
                        action: 'insert-smartart',
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    me.slideOnlyControls.push(this.btnInsertSmartArt);
                    me.lockControls.push(this.btnInsertSmartArt);

                    me.btnInsertEquation = new Common.UI.Button({
                        id: 'tlbtn-insertequation',
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-insertequation',
                        caption: me.capInsertEquation,
                        lock: [_set.slideDeleted, _set.paragraphLock, _set.lostConnect, _set.noSlides, _set.disableOnStart],
                        split: true,
                        menu: new Common.UI.Menu(),
                        action: 'insert-equation',
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    me.slideOnlyControls.push(this.btnInsertEquation);
                    me.lockControls.push(this.btnInsertEquation);

                    me.btnInsertSymbol = new Common.UI.Button({
                        id: 'tlbtn-insertsymbol',
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-symbol',
                        caption: me.capBtnInsSymbol,
                        lock: [_set.slideDeleted, _set.paragraphLock, _set.lostConnect, _set.noSlides, _set.noParagraphSelected],
                        menu: new Common.UI.Menu({
                            style: 'min-width: 100px;',
                            items: [
                                {template: _.template('<div id="id-toolbar-menu-symbols"></div>')},
                                {caption: '--'},
                                new Common.UI.MenuItem({
                                    caption: this.textMoreSymbols
                                })
                            ]
                        }),
                        action: 'insert-symbol',
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    me.paragraphControls.push(me.btnInsertSymbol);
                    me.lockControls.push(me.btnInsertSymbol);

                    me.btnInsertHyperlink = new Common.UI.Button({
                        id: 'tlbtn-insertlink',
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-big-inserthyperlink',
                        caption: me.capInsertHyperlink,
                        lock: [_set.hyperlinkLock, _set.slideDeleted, _set.paragraphLock, _set.lostConnect, _set.noSlides, _set.noParagraphSelected, _set.slideMasterMode],
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    me.paragraphControls.push(me.btnInsertHyperlink);
                    me.lockControls.push(me.btnInsertHyperlink);
                    me.shortcutHints.InsertHyperlink = {
                        btn: me.btnInsertHyperlink,
                        label: me.tipInsertHyperlink
                    };

                    me.btnInsertTextArt = new Common.UI.Button({
                        id: 'tlbtn-inserttextart',
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-textart',
                        caption: me.capInsertTextArt,
                        lock: [_set.slideDeleted, _set.lostConnect, _set.noSlides, _set.disableOnStart],
                        menu: new Common.UI.Menu({
                            cls: 'menu-shapes',
                            items: [
                                {template: _.template('<div id="view-insert-art" class="margin-left-5" style="width: 239px;"></div>')}
                            ]
                        }),
                        action: 'insert-textart',
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    me.slideOnlyControls.push(me.btnInsertTextArt);
                    me.lockControls.push(me.btnInsertTextArt);

                    me.btnEditHeader = new Common.UI.Button({
                        id: 'id-toolbar-btn-editheader',
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-editheader',
                        caption: me.capBtnInsHeaderFooter,
                        lock: [_set.slideDeleted, _set.lostConnect, _set.noSlides, _set.disableOnStart],
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    me.slideOnlyControls.push(me.btnEditHeader);
                    me.lockControls.push(me.btnEditHeader);

                    me.btnInsDateTime = new Common.UI.Button({
                        id: 'id-toolbar-btn-datetime',
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-datetime',
                        caption: me.capBtnDateTime,
                        lock: [_set.slideDeleted, _set.lostConnect, _set.noSlides, _set.paragraphLock, _set.disableOnStart],
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    me.slideOnlyControls.push(me.btnInsDateTime);
                    me.lockControls.push(me.btnInsDateTime);

                    me.btnInsSlideNum = new Common.UI.Button({
                        id: 'id-toolbar-btn-slidenum',
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-pagenum',
                        caption: me.capBtnSlideNum,
                        lock: [_set.slideDeleted, _set.lostConnect, _set.noSlides, _set.paragraphLock, _set.disableOnStart],
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    me.slideOnlyControls.push(me.btnInsSlideNum);
                    me.lockControls.push(me.btnInsSlideNum);

                    if (Common.Controllers.Desktop.isActive() &&
                            Common.Controllers.Desktop.isFeatureAvailable("IsSupportMedia") && Common.Controllers.Desktop.call("IsSupportMedia"))
                    {
                        me.btnInsAudio = new Common.UI.Button({
                            id: 'tlbtn-insaudio',
                            cls: 'btn-toolbar x-huge icon-top',
                            iconCls: 'toolbar__icon btn-audio',
                            caption: me.capInsertAudio,
                            lock: [_set.slideDeleted, _set.lostConnect, _set.noSlides, _set.disableOnStart]
                        });
                        me.slideOnlyControls.push(me.btnInsAudio);
                        me.lockControls.push(me.btnInsAudio);

                        me.btnInsVideo = new Common.UI.Button({
                            id: 'tlbtn-insvideo',
                            cls: 'btn-toolbar x-huge icon-top',
                            iconCls: 'toolbar__icon btn-video',
                            caption: me.capInsertVideo,
                            lock: [_set.slideDeleted, _set.lostConnect, _set.noSlides, _set.disableOnStart]
                        });
                        me.slideOnlyControls.push(me.btnInsVideo);
                        me.lockControls.push(me.btnInsVideo);
                    }

                    me.btnColorSchemas = new Common.UI.Button({
                        id: 'id-toolbar-btn-colorschemas',
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-big-colorschemas',
                        lock: [_set.themeLock, _set.slideDeleted, _set.lostConnect, _set.noSlides, _set.disableOnStart],
                        caption: me.txtColors,
                        menu: new Common.UI.Menu({
                            cls: 'shifted-left',
                            items: [],
                            restoreHeight: true
                        }),
                        action: 'theme-colors',
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    me.slideOnlyControls.push(me.btnColorSchemas);
                    me.lockControls.push(me.btnColorSchemas);

                    me.mniAlignToSlide = new Common.UI.MenuItem({
                        caption: me.txtSlideAlign,
                        checkable: true,
                        toggleGroup: 'slidealign',
                        value: -1
                    }).on('click', function (mnu) {
                        Common.Utils.InternalSettings.set("pe-align-to-slide", true);
                    });
                    me.mniAlignObjects = new Common.UI.MenuItem({
                        caption: me.txtObjectsAlign,
                        checkable: true,
                        toggleGroup: 'slidealign',
                        value: -1
                    }).on('click', function (mnu) {
                        Common.Utils.InternalSettings.set("pe-align-to-slide", false);
                    });

                    me.mniDistribHor = new Common.UI.MenuItem({
                        caption: me.txtDistribHor,
                        iconCls: 'menu__icon btn-shape-distribute-hor',
                        value: 6
                    });
                    me.mniDistribVert = new Common.UI.MenuItem({
                        caption: me.txtDistribVert,
                        iconCls: 'menu__icon btn-shape-distribute-vert',
                        value: 7
                    });

                    me.btnShapeAlign = new Common.UI.Button({
                        id: 'id-toolbar-btn-shape-align',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-shape-align-left',
                        lock: [_set.slideDeleted, _set.shapeLock, _set.lostConnect, _set.noSlides, _set.noDrawingObjects, _set.disableOnStart],
                        menu: new Common.UI.Menu({
                            cls: 'shifted-right',
                            items: [
                                {
                                    caption: me.textShapeAlignLeft,
                                    iconCls: 'menu__icon btn-shape-align-left',
                                    value: Asc.c_oAscAlignShapeType.ALIGN_LEFT
                                },
                                {
                                    caption: me.textShapeAlignCenter,
                                    iconCls: 'menu__icon btn-shape-align-center',
                                    value: Asc.c_oAscAlignShapeType.ALIGN_CENTER
                                },
                                {
                                    caption: me.textShapeAlignRight,
                                    iconCls: 'menu__icon btn-shape-align-right',
                                    value: Asc.c_oAscAlignShapeType.ALIGN_RIGHT
                                },
                                {
                                    caption: me.textShapeAlignTop,
                                    iconCls: 'menu__icon btn-shape-align-top',
                                    value: Asc.c_oAscAlignShapeType.ALIGN_TOP
                                },
                                {
                                    caption: me.textShapeAlignMiddle,
                                    iconCls: 'menu__icon btn-shape-align-middle',
                                    value: Asc.c_oAscAlignShapeType.ALIGN_MIDDLE
                                },
                                {
                                    caption: me.textShapeAlignBottom,
                                    iconCls: 'menu__icon btn-shape-align-bottom',
                                    value: Asc.c_oAscAlignShapeType.ALIGN_BOTTOM
                                },
                                {caption: '--'},
                                me.mniDistribHor,
                                me.mniDistribVert,
                                {caption: '--'},
                                me.mniAlignToSlide,
                                me.mniAlignObjects
                            ]
                        }),
                        action: 'object-align',
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: '0, -6'
                    });
                    me.shapeControls.push(me.btnShapeAlign);
                    me.slideOnlyControls.push(me.btnShapeAlign);
                    me.lockControls.push(me.btnShapeAlign);

                    me.btnShapeArrange = new Common.UI.Button({
                        id: 'id-toolbar-btn-shape-arrange',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-arrange-front',
                        lock: [_set.slideDeleted, _set.lostConnect, _set.noSlides, _set.noDrawingObjects, _set.disableOnStart],
                        menu: new Common.UI.Menu({
                            items: [
                                me.mnuArrangeFront = new Common.UI.MenuItem({
                                    caption: me.textArrangeFront,
                                    iconCls: 'menu__icon btn-arrange-front',
                                    value: 1
                                }),
                                me.mnuArrangeBack = new Common.UI.MenuItem({
                                    caption: me.textArrangeBack,
                                    iconCls: 'menu__icon btn-arrange-back',
                                    value: 2
                                }),
                                me.mnuArrangeForward = new Common.UI.MenuItem({
                                    caption: me.textArrangeForward,
                                    iconCls: 'menu__icon btn-arrange-forward',
                                    value: 3
                                }),
                                me.mnuArrangeBackward = new Common.UI.MenuItem({
                                    caption: me.textArrangeBackward,
                                    iconCls: 'menu__icon btn-arrange-backward',
                                    value: 4
                                }),
                                {caption: '--'},
                                me.mnuGroupShapes = new Common.UI.MenuItem({
                                    caption: me.txtGroup,
                                    iconCls: 'menu__icon btn-shape-group',
                                    value: 5
                                }),
                                me.mnuUnGroupShapes = new Common.UI.MenuItem({
                                    caption: me.txtUngroup,
                                    iconCls: 'menu__icon btn-shape-ungroup',
                                    value: 6
                                })
                            ]
                        }),
                        action: 'object-arrange',
                        dataHint: '1',
                        dataHintDirection: 'top',
                        dataHintOffset: '0, -6'
                    });
                    me.slideOnlyControls.push(me.btnShapeArrange);
                    me.lockControls.push(me.btnShapeArrange);

                    me.btnShapesMerge = new Common.UI.Button({
                        id: 'id-toolbar-btn-merge-shapes',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-combine-shapes',
                        lock: [_set.slideDeleted, _set.shapeLock, _set.lostConnect, _set.noSlides, _set.noDrawingObjects, _set.disableOnStart, _set.cantMergeShape],
                        menu: new Common.UI.Menu({
                            cls: 'shifted-right',
                            items: [
                                {
                                    caption: me.textShapesUnion, 
                                    iconCls: 'menu__icon btn-union-shapes',
                                    value: 'unite',
                                },
                                {
                                    caption: me.textShapesCombine, 
                                    iconCls: 'menu__icon btn-combine-shapes',
                                    value: 'exclude',
                                },
                                {
                                    caption: me.textShapesFragment, 
                                    iconCls: 'menu__icon btn-fragment-shapes',
                                    value: 'divide',
                                },
                                {
                                    caption: me.textShapesIntersect, 
                                    iconCls: 'menu__icon btn-intersect-shapes',
                                    value: 'intersect',
                                },
                                {
                                    caption: me.textShapesSubstract, 
                                    iconCls: 'menu__icon btn-substract-shapes',
                                    value: 'subtract',
                                },
                            ]
                        }),
                        action: 'object-merge',
                        dataHint: '1',
                        dataHintDirection: 'top',
                        dataHintOffset: '0, -6'
                    });
                    me.shapeControls.push(me.btnShapesMerge);
                    me.slideOnlyControls.push(me.btnShapesMerge);
                    me.lockControls.push(me.btnShapesMerge);

                    me.btnSlideSize = new Common.UI.Button({
                        id: 'id-toolbar-btn-slide-size',
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-slidesize',
                        lock: [_set.docPropsLock, _set.slideDeleted, _set.lostConnect, _set.disableOnStart],
                        caption: me.txtSlideSize,
                        menu: new Common.UI.Menu({
                            items: [
                                {
                                    caption: me.mniSlideStandard,
                                    checkable: true,
                                    toggleGroup: 'slidesize',
                                    value: 0
                                },
                                {
                                    caption: me.mniSlideWide,
                                    checkable: true,
                                    toggleGroup: 'slidesize',
                                    value: 1
                                },
                                {caption: '--'},
                                {
                                    caption: me.mniSlideAdvanced,
                                    value: 'advanced'
                                }
                            ]
                        }),
                        action: 'slide-size',
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    me.slideOnlyControls.push(me.btnSlideSize);
                    me.lockControls.push(me.btnSlideSize);

                    me.listTheme = new Common.UI.ComboDataView({
                        cls: 'combo-styles',
                        itemWidth: 88,
                        enableKeyEvents: true,
                        itemHeight: 40,
                        style: 'min-width:123px;',
                        lock: [_set.themeLock, _set.lostConnect, _set.noSlides],
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: '-16, -4',
                        delayRenderTips: true,
                        autoWidth:       true,
                        itemTemplate: _.template([
                            '<div class="style" id="<%= id %>">',
                            '<div class="item-theme" style="' + '<% if (typeof imageUrl !== "undefined") { %>' + 'background-image: url(<%= imageUrl %>);' + '<% } %> background-position: 0 -<%= offsety %>px;"></div>',
                            '</div>'
                        ].join('')),
                        beforeOpenHandler: function (e) {
                            var cmp = this,
                                menu = cmp.openButton.menu,
                                minMenuColumn = 6;

                            if (menu.cmpEl) {
                                var itemEl = $(cmp.cmpEl.find('.dataview.inner .style').get(0)).parent();
                                var itemMargin = parseFloat(itemEl.css('margin-right'));
                                // Common.Utils.applicationPixelRatio() > 1 && Common.Utils.applicationPixelRatio() !== 2 && (itemMargin = -1 / Common.Utils.applicationPixelRatio());
                                var itemWidth = itemEl.is(':visible') ? parseFloat(itemEl.css('width')) :
                                    (cmp.itemWidth + parseFloat(itemEl.css('padding-left')) + parseFloat(itemEl.css('padding-right')) +
                                    parseFloat(itemEl.css('border-left-width')) + parseFloat(itemEl.css('border-right-width')));

                                var minCount = cmp.menuPicker.store.length >= minMenuColumn ? minMenuColumn : cmp.menuPicker.store.length,
                                    columnCount = Math.min(cmp.menuPicker.store.length, Math.round($('.dataview', $(cmp.fieldPicker.el)).width() / (itemMargin + itemWidth)));

                                columnCount = columnCount < minCount ? minCount : columnCount;
                                menu.menuAlignEl = cmp.cmpEl;

                                menu.menuAlign = 'tl-tl';
                                var menuWidth = columnCount * (itemMargin + itemWidth),
                                    buttonOffsetLeft = Common.Utils.getOffset(cmp.openButton.$el).left;
                                // if (menuWidth>buttonOffsetLeft)
                                //     menuWidth = Math.max(Math.floor(buttonOffsetLeft/(itemMargin + itemWidth)), 2) * (itemMargin + itemWidth);
                                if (menuWidth>Common.Utils.innerWidth())
                                    menuWidth = Math.max(Math.floor(Common.Utils.innerWidth()/(itemMargin + itemWidth)), 2) * (itemMargin + itemWidth);
                                menuWidth = Math.ceil(menuWidth * 10)/10;
                                var offset = cmp.cmpEl.width() - cmp.openButton.$el.width() - Math.min(menuWidth, buttonOffsetLeft);
                                if (Common.UI.isRTL()) {
                                    offset = cmp.openButton.$el.width();
                                }
                                menu.setOffset(Common.UI.isRTL() ? offset : Math.min(offset, 0));

                                menu.cmpEl.css({
                                    'width': menuWidth,
                                    'min-height': cmp.cmpEl.height()
                                });
                            }

                            if (cmp.menuPicker.scroller) {
                                cmp.menuPicker.scroller.update({
                                    includePadding: true,
                                    suppressScrollX: true
                                });
                            }
                        }
                    });
                    me.lockControls.push(me.listTheme);

                    Common.UI.LayoutManager.addControls(this.lockControls);
                    Common.UI.LayoutManager.addControls(this.nolockControls);

                    // Disable all components before load document
                    _.each([me.btnSave]
                            .concat(me.paragraphControls),
                        function (cmp) {
                            if (_.isFunction(cmp.setDisabled))
                                cmp.setDisabled(true);
                        });
                    this.lockToolbar(Common.enumLock.disableOnStart, true, {array: me.slideOnlyControls.concat(me.shapeControls)});
                    this.on('render:after', _.bind(this.onToolbarAfterRender, this));
                } else {
                    Common.UI.Mixtbar.prototype.initialize.call(this, {
                            template: _.template(template_view),
                            tabs: [
                                {caption: me.textTabFile, action: 'file', layoutname: 'toolbar-file', haspanel:false, dataHintTitle: 'F'}
                            ]
                        }
                    );
                }

                return this;
            },

            lockToolbar: function (causes, lock, opts) {
                Common.Utils.lockControls(causes, lock, opts, this.lockControls);
            },

            render: function (mode) {
                var me = this;

                /**
                 * Render UI layout
                 */

                this.fireEvent('render:before', [this]);

                me.isCompactView = mode.compactview;
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
                //_.bind(function (element){
                //},me);
                if ( mode.isEdit ) {
                    me.setTab('home');
                    me.processPanelVisible();
                    Common.NotificationCenter.on('desktop:window', _.bind(me.onDesktopWindow, me));
                }

                if ( me.isCompactView )
                    me.setFolded(true);

                return this;
            },

            onTabClick: function (e) {
                var me = this,
                    tab = $(e.currentTarget).find('> a[data-tab]').data('tab'),
                    is_file_active = me.isTabActive('file');

                if (!me._isDocReady || tab === 'file' && !Common.Controllers.LaunchController.isScriptLoaded()) return;

                Common.UI.Mixtbar.prototype.onTabClick.apply(me, arguments);

                if ( is_file_active ) {
                    me.fireEvent('file:close');
                } else
                if ( tab == 'file' ) {
                    me.fireEvent('file:open');
                    me.setTab(tab);
                }
            },

            rendererComponents: function (html) {
                var $host = $(html),
                    me = this;
                var _injectComponent = function (id, cmp) {
                    Common.Utils.injectComponent($host.find(id), cmp);
                };
                _injectComponent('#slot-field-fontname', this.cmbFontName);
                _injectComponent('#slot-field-fontsize', this.cmbFontSize);
                _injectComponent('#slot-btn-print', this.btnPrint);
                _injectComponent('#slot-btn-save', this.btnSave);
                _injectComponent('#slot-btn-undo', this.btnUndo);
                _injectComponent('#slot-btn-redo', this.btnRedo);
                _injectComponent('#slot-btn-copy', this.btnCopy);
                _injectComponent('#slot-btn-paste', this.btnPaste);
                _injectComponent('#slot-btn-cut', this.btnCut);
                _injectComponent('#slot-addslide', this.btnAddSlide);
                _injectComponent('#slot-changeslide', this.btnChangeSlide);
                _injectComponent('#slot-preview', this.btnPreview);
                _injectComponent('#slot-btn-select-all', this.btnSelectAll);
                _injectComponent('#slot-btn-replace', this.btnReplace);
                _injectComponent('#slot-btn-bold', this.btnBold);
                _injectComponent('#slot-btn-italic', this.btnItalic);
                _injectComponent('#slot-btn-underline', this.btnUnderline);
                _injectComponent('#slot-btn-strikeout', this.btnStrikeout);
                _injectComponent('#slot-btn-superscript', this.btnSuperscript);
                _injectComponent('#slot-btn-subscript', this.btnSubscript);
                _injectComponent('#slot-btn-incfont', this.btnIncFontSize);
                _injectComponent('#slot-btn-decfont', this.btnDecFontSize);
                _injectComponent('#slot-btn-fontcolor', this.btnFontColor);
                _injectComponent('#slot-btn-highlight', this.btnHighlightColor);
                _injectComponent('#slot-btn-changecase', this.btnChangeCase);
                _injectComponent('#slot-btn-clearstyle', this.btnClearStyle);
                _injectComponent('#slot-btn-copystyle', this.btnCopyStyle);
                _injectComponent('#slot-btn-markers', this.btnMarkers);
                _injectComponent('#slot-btn-numbering', this.btnNumbers);
                _injectComponent('#slot-btn-incoffset', this.btnIncLeftOffset);
                _injectComponent('#slot-btn-decoffset', this.btnDecLeftOffset);
                _injectComponent('#slot-btn-halign', this.btnHorizontalAlign);
                _injectComponent('#slot-btn-valign', this.btnVerticalAlign);
                _injectComponent('#slot-btn-linespace', this.btnLineSpace);
                _injectComponent('#slot-btn-columns', this.btnColumns);
                _injectComponent('#slot-btn-direction', this.btnTextDir);
                _injectComponent('#slot-btn-arrange-shape', this.btnShapeArrange);
                _injectComponent('#slot-btn-align-shape', this.btnShapeAlign);
                _injectComponent('#slot-btn-shapes-merge', this.btnShapesMerge);
                _injectComponent('#slot-btn-inssmartart', this.btnInsertSmartArt);
                _injectComponent('#slot-btn-insertequation', this.btnInsertEquation);
                _injectComponent('#slot-btn-inssymbol', this.btnInsertSymbol);
                _injectComponent('#slot-btn-insertlink', this.btnInsertHyperlink);
                _injectComponent('#slot-btn-inserttable', this.btnInsertTable);
                _injectComponent('#slot-btn-insertchart', this.btnInsertChart);
                _injectComponent('#slot-btn-instextart', this.btnInsertTextArt);
                _injectComponent('#slot-btn-colorschemas', this.btnColorSchemas);
                _injectComponent('#slot-btn-slidesize', this.btnSlideSize);
                _injectComponent('#slot-field-styles', this.listTheme);
                _injectComponent('#slot-btn-editheader', this.btnEditHeader);
                _injectComponent('#slot-btn-datetime', this.btnInsDateTime);
                _injectComponent('#slot-btn-slidenum', this.btnInsSlideNum);

                this.cmbsInsertShape = [];
                $host.find('.slot-combo-insertshape').each(function (index, el) {
                    var cmb = new Common.UI.ComboDataViewShape({
                        cls: 'combo-styles shapes',
                        id: 'tlbtn-insertshape-' + index,
                        itemWidth: 20,
                        itemHeight: 20,
                        menuMaxHeight: 652,
                        menuWidth: 362,
                        style: 'width: 145px;',
                        enableKeyEvents: true,
                        lock: [Common.enumLock.slideDeleted, Common.enumLock.lostConnect, Common.enumLock.noSlides, Common.enumLock.disableOnStart],
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: '-16, 0'
                    });
                    _injectComponent(el, cmb);
                    me.cmbsInsertShape.push(cmb);
                    me.slideOnlyControls.push(cmb);
                    me.lockControls.push(cmb);
                });

                this.btnInsAudio && _injectComponent('#slot-btn-insaudio', this.btnInsAudio);
                this.btnInsVideo && _injectComponent('#slot-btn-insvideo', this.btnInsVideo);
                if (!this.btnInsAudio && !this.btnInsVideo) {
                    $host.find('#slot-btn-insaudio').parents('.group').hide().prev().hide();
                }

                this.btnsInsertImage = Common.Utils.injectButtons($host.find('.slot-insertimg'), 'tlbtn-insertimage-', 'toolbar__icon btn-insertimage', this.capInsertImage,
                    [Common.enumLock.slideDeleted, Common.enumLock.lostConnect, Common.enumLock.noSlides, Common.enumLock.disableOnStart], false, true, undefined, '1', 'bottom', 'small', undefined, 'insert-image');
                this.btnsInsertText = Common.Utils.injectButtons($host.find('.slot-instext'), 'tlbtn-inserttext-', 'toolbar__icon btn-big-text', this.capInsertText,
                    [Common.enumLock.slideDeleted, Common.enumLock.lostConnect, Common.enumLock.noSlides, Common.enumLock.disableOnStart], true, false, true, '1', 'bottom', 'small', undefined, 'insert-text');

                var created = this.btnsInsertImage.concat(this.btnsInsertText);
                this.lockToolbar(Common.enumLock.disableOnStart, true, {array: created});

                Array.prototype.push.apply(this.slideOnlyControls, created);
                Array.prototype.push.apply(this.lockControls, created);
                Common.UI.LayoutManager.addControls(created);
                this.btnPrint.menu && this.btnPrint.$el.addClass('split');
                return $host;
            },

            onAppReady: function (config) {
                var me = this;
                me._isDocReady = true;
                if (!config.isEdit) return;

                if(me.btnPrint.menu) {
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

                me.btnAddSlide.setMenu(
                    new Common.UI.Menu({
                        items: [
                            {template: _.template('<div id="id-toolbar-menu-addslide" class="menu-layouts" style="width: 302px; margin: 0 4px;"></div>')},
                            {caption: '--'},
                            {
                                caption: me.txtDuplicateSlide,
                                value: 'duplicate'
                            }
                        ]
                    })
                );
                me.btnAddSlide.menu.on('item:click', function (menu, item) {
                    (item.value === 'duplicate') && me.fireEvent('duplicate:slide');
                });

                me.btnChangeSlide.setMenu(
                    new Common.UI.Menu({
                        items: [
                            {template: _.template('<div id="id-toolbar-menu-changeslide" class="menu-layouts" style="width: 302px; margin: 0 4px;"></div>')}
                        ]
                    })
                );

                me.btnPreview.setMenu(
                    new Common.UI.Menu({
                        items: [
                            {caption: me.textShowBegin, value: 0},
                            {caption: me.textShowCurrent, value: 1},
                            {caption: me.textShowPresenterView, value: 2},
                            {caption: '--'},
                            me.mnuShowSettings = new Common.UI.MenuItem({
                                caption: me.textShowSettings,
                                value: 3,
                                lock: [Common.enumLock.lostConnect]
                            })
                        ]
                    })
                );
                me.lockControls.push(me.mnuShowSettings);

                me.btnsInsertImage.forEach(function (btn) {
                    btn.updateHint(me.tipInsertImage);
                    btn.setMenu(
                        new Common.UI.Menu({
                            items: [
                                {caption: me.mniImageFromFile, value: 'file'},
                                {caption: me.mniImageFromUrl, value: 'url'},
                                {caption: me.mniImageFromStorage, value: 'storage'}
                            ]
                        }).on('item:click', function (menu, item, e) {
                            me.fireEvent('insert:image', [item.value]);
                        })
                    );
                    btn.menu.items[2].setVisible(config.canRequestInsertImage || config.fileChoiceUrl && config.fileChoiceUrl.indexOf("{documentType}")>-1);
                });

                me.btnsInsertText.forEach(function (button) {
                    button.updateHint([me.tipInsertHorizontalText, me.tipInsertText]);
                    button.options.textboxType = 'textRect';
                    button.setMenu(new Common.UI.Menu({
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
                    button.on('click', function (btn, e) {
                        me.fireEvent('insert:text-btn', [btn, e]);
                    });
                    button.menu.on('item:click', function(btn, e) {
                        button.toggle(true);
                        me.fireEvent('insert:text-menu', [button, e]);
                    });
                });
            },

            updateHints: function() {
                this.btnSave.updateHint(this.btnSaveTip);
                this.btnChangeSlide.updateHint(this.tipChangeSlide);
                this.btnPreview.updateHint(this.tipPreview);
                this.btnFontColor.updateHint(this.tipFontColor);
                this.btnHighlightColor.updateHint(this.tipHighlightColor);
                this.btnChangeCase.updateHint(this.tipChangeCase);
                this.btnClearStyle.updateHint(this.tipClearStyle);
                this.btnMarkers.updateHint(this.tipMarkers);
                this.btnNumbers.updateHint(this.tipNumbers);
                this.btnHorizontalAlign.updateHint(this.tipHAligh);
                this.btnVerticalAlign.updateHint(this.tipVAligh);
                this.btnLineSpace.updateHint(this.tipLineSpace);
                this.btnColumns.updateHint(this.tipColumns);
                this.btnTextDir.updateHint(this.tipTextDir);
                this.btnInsertTable.updateHint(this.tipInsertTable);
                this.btnInsertChart.updateHint(this.tipInsertChart);
                this.btnInsertSmartArt.updateHint(this.tipInsertSmartArt);
                this.btnInsertEquation.updateHint(this.tipInsertEquation);
                this.btnInsertSymbol.updateHint(this.tipInsertSymbol);
                this.btnInsertTextArt.updateHint(this.tipInsertTextArt);
                this.btnInsAudio && this.btnInsAudio.updateHint(this.tipInsertAudio);
                this.btnInsVideo && this.btnInsVideo.updateHint(this.tipInsertVideo);
                this.btnColorSchemas.updateHint(this.tipColorSchemas);
                this.btnShapeAlign.updateHint(this.tipShapeAlign);
                this.btnShapesMerge.updateHint(this.tipShapesMerge);
                this.btnShapeArrange.updateHint(this.tipShapeArrange);
                this.btnSlideSize.updateHint(this.tipSlideSize);
                this.btnEditHeader.updateHint(this.tipEditHeaderFooter);
                this.btnInsDateTime.updateHint(this.tipDateTime);
                this.btnInsSlideNum.updateHint(this.tipSlideNum);


                PE.getController('Common.Controllers.Shortcuts').updateShortcutHints(this.shortcutHints);
            },

            createDelayedElements: function () {
                this.updateHints();

                // set menus
                var me = this;

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

                this.btnInsertChart.setMenu( new Common.UI.Menu({
                    style: 'width: 364px;padding-top: 12px;',
                    items: [
                        {template: _.template('<div id="id-toolbar-menu-insertchart" class="menu-insertchart"></div>')}
                    ]
                }));

                var onShowBefore = function(menu) {
                    var picker = new Common.UI.DataView({
                        el: $('#id-toolbar-menu-insertchart'),
                        parentMenu: menu,
                        outerMenu: {menu: menu, index:0},
                        showLast: false,
                        restoreHeight: 535,
                        groups: new Common.UI.DataViewGroupStore(Common.define.chartData.getChartGroupData()),
                        store: new Common.UI.DataViewStore(Common.define.chartData.getChartData()),
                        itemTemplate: _.template('<div id="<%= id %>" class="item-chartlist"><svg width="40" height="40" class=\"icon uni-scale\"><use xlink:href=\"#chart-<%= iconCls %>\"></use></svg></div>')
                    });
                    picker.on('item:click', function (picker, item, record, e) {
                        if (record)
                            me.fireEvent('add:chart', [record.get('type')]);
                    });
                    menu.off('show:before', onShowBefore);
                    menu.setInnerMenu([{menu: picker, index: 0}]);
                };
                this.btnInsertChart.menu.on('show:before', onShowBefore);

                this.btnInsertSmartArt.setMenu(new Common.UI.Menu({
                    cls: 'shifted-right',
                    items: []
                }));

                var onShowBeforeSmartArt = function (menu) { // + <% if(typeof imageUrl === "undefined" || imageUrl===null || imageUrl==="") { %> style="visibility: hidden;" <% } %>/>',
                    var smartArtData = Common.define.smartArt.getSmartArtData();
                    smartArtData.forEach(function (item, index) {
                        var length = item.items.length,
                            width = 399;
                        if (length < 5) {
                            width = length * (70 + 8) + 9; // 4px margin + 4px margin
                        }
                        me.btnInsertSmartArt.menu.addItem({
                            caption: item.caption,
                            value: item.sectionId,
                            itemId: item.id,
                            itemsLength: length,
                            iconCls: item.icon ? 'menu__icon ' + item.icon : undefined,
                            menu: new Common.UI.Menu({
                                items: [
                                    {template: _.template('<div id="' + item.id + '" class="menu-add-smart-art margin-left-5" style="width: ' + width + 'px; height: 500px;"></div>')}
                                ],
                                menuAlign: 'tl-tr',
                            })}, true);
                    });
                    var sa_items = me.btnInsertSmartArt.menu.getItems(true);
                    sa_items.forEach(function (item, index) {
                        var items = [];
                        for (var i=0; i<item.options.itemsLength; i++) {
                            items.push({
                                isLoading: true
                            });
                        }
                        item.menuPicker = new Common.UI.DataView({
                            el: $('#' + item.options.itemId),
                            parentMenu: sa_items[index].menu,
                            itemTemplate: _.template([
                                '<% if (isLoading) { %>',
                                    '<div class="loading-item" style="width: 70px; height: 70px;">',
                                        '<i class="loading-spinner"></i>',
                                    '</div>',
                                '<% } else { %>',
                                    '<div>',
                                        '<img src="<%= imageUrl %>" width="' + 70 + '" height="' + 70 + '" />',
                                    '</div>',
                                '<% } %>'
                            ].join('')),
                            store: new Common.UI.DataViewStore(items),
                            delayRenderTips: true,
                            scrollAlwaysVisible: true,
                            showLast: false
                        });
                        item.menuPicker.on('item:click', function(picker, item, record, e) {
                            if (record && record.get('value') !== null) {
                                me.fireEvent('insert:smartart', [record.get('value')]);
                            }
                            Common.NotificationCenter.trigger('edit:complete', me);
                        });
                        item.menuPicker.loaded = false;
                        item.$el.on('mouseenter', function () {
                            if (!item.menuPicker.loaded) {
                                me.fireEvent('smartart:mouseenter', [item.value]);
                            }
                        });
                        item.$el.on('mouseleave', function () {
                            me.fireEvent('smartart:mouseleave', [item.value]);
                        });
                    });
                    menu.off('show:before', onShowBeforeSmartArt);
                };
                this.btnInsertSmartArt.menu.on('show:before', onShowBeforeSmartArt);

                var onShowBeforeTextArt = function (menu) {
                    var collection = PE.getCollection('Common.Collections.TextArt');
                    if (collection.length<1)
                        PE.getController('Main').fillTextArt(me.api.asc_getTextArtPreviews());
                    var picker = new Common.UI.DataView({
                        el: $('#view-insert-art', menu.$el),
                        store: collection,
                        parentMenu: menu,
                        outerMenu: {menu: menu, index:0},
                        showLast: false,
                        itemTemplate: _.template('<div class="item-art"><img src="<%= imageUrl %>" id="<%= id %>" style="width:50px;height:50px;"></div>')
                    });
                    picker.on('item:click', function (picker, item, record, e) {
                        if (record)
                            me.fireEvent('insert:textart', [record.get('data')]);
                        if (e.type !== 'click') menu.hide();
                    });
                    menu.off('show:before', onShowBeforeTextArt);
                    menu.setInnerMenu([{menu: picker, index: 0}]);
                };
                this.btnInsertTextArt.menu.on('show:before', onShowBeforeTextArt);

                // set dataviews
                this.specSymbols = [
                    {symbol: 8226,     description: this.textBullet},
                    {symbol: 8364,     description: this.textEuro},
                    {symbol: 65284,    description: this.textDollar},
                    {symbol: 165,      description: this.textYen},
                    {symbol: 169,      description: this.textCopyright},
                    {symbol: 174,      description: this.textRegistered},
                    {symbol: 189,      description: this.textOneHalf},
                    {symbol: 188,      description: this.textOneQuarter},
                    {symbol: 8800,     description: this.textNotEqualTo},
                    {symbol: 177,      description: this.textPlusMinus},
                    {symbol: 247,      description: this.textDivision},
                    {symbol: 8730,     description: this.textSquareRoot},
                    {symbol: 8804,     description: this.textLessEqual},
                    {symbol: 8805,     description: this.textGreaterEqual},
                    {symbol: 8482,     description: this.textTradeMark},
                    {symbol: 8734,     description: this.textInfinity},
                    {symbol: 126,      description: this.textTilde},
                    {symbol: 176,      description: this.textDegree},
                    {symbol: 167,      description: this.textSection},
                    {symbol: 945,      description: this.textAlpha},
                    {symbol: 946,      description: this.textBetta},
                    {symbol: 960,      description: this.textLetterPi},
                    {symbol: 916,      description: this.textDelta},
                    {symbol: 9786,     description: this.textSmile},
                    {symbol: 9829,     description: this.textBlackHeart}
                ];
                this.mnuInsertSymbolsPicker = new Common.UI.DataView({
                    el: $('#id-toolbar-menu-symbols'),
                    cls: 'no-borders-item',
                    parentMenu: this.btnInsertSymbol.menu,
                    outerMenu: {menu: this.btnInsertSymbol.menu, index:0},
                    restoreHeight: 290,
                    delayRenderTips: true,
                    scrollAlwaysVisible: true,
                    store: new Common.UI.DataViewStore(this.loadRecentSymbolsFromStorage()),
                    itemTemplate: _.template('<div class="item-symbol" dir="ltr" <% if (typeof font !== "undefined" && font !=="") { %> style ="font-family: <%= font %>"<% } %>>&#<%= symbol %></div>')
                });
                this.btnInsertSymbol.menu.setInnerMenu([{menu: this.mnuInsertSymbolsPicker, index: 0}]);
                this.btnInsertSymbol.menu.on('show:before',  _.bind(function() {
                    this.mnuInsertSymbolsPicker.deselectAll();
                }, this));

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

                this.mnuTablePicker = new Common.UI.DimensionPicker({
                    el: $('#id-toolbar-menu-tablepicker'),
                    minRows: 8,
                    minColumns: 10,
                    maxRows: 8,
                    maxColumns: 10
                });

                /** coauthoring begin **/
                this.showSynchTip = !Common.localStorage.getBool('pe-hide-synch');

                if (this.needShowSynchTip) {
                    this.needShowSynchTip = false;
                    this.onCollaborativeChanges();
                }
                /** coauthoring end **/

            },

            onToolbarAfterRender: function(toolbar) {
                // DataView and pickers
                //
                if (this.btnFontColor.cmpEl) {
                    this.btnFontColor.setMenu();
                    this.mnuFontColorPicker = this.btnFontColor.getPicker();
                    this.btnFontColor.setColor(this.btnFontColor.currentColor || 'transparent');
                }
                if (this.btnHighlightColor.cmpEl) {
                    this.btnHighlightColor.currentColor = 'FFFF00';
                    this.btnHighlightColor.setColor(this.btnHighlightColor.currentColor);
                    this.mnuHighlightColorPicker = new Common.UI.ThemeColorPalette({
                        el: $('#id-toolbar-menu-highlight'),
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
                        outerMenu: {menu: this.btnHighlightColor.menu, index: 0, focusOnShow: true}
                    });
                    this.btnHighlightColor.setPicker(this.mnuHighlightColorPicker);
                    this.btnHighlightColor.menu.setInnerMenu([{menu: this.mnuHighlightColorPicker, index: 0}]);
                }
            },

            setApi: function (api) {
                this.api = api;

                if (this.api) {
                    this.api.asc_registerCallback('asc_onSendThemeColorSchemes', _.bind(this.onSendThemeColorSchemes, this));
                    /** coauthoring begin **/
                    this.api.asc_registerCallback('asc_onCollaborativeChanges', _.bind(this.onCollaborativeChanges, this));
                    this.api.asc_registerCallback('asc_onAuthParticipantsChanged', _.bind(this.onApiUsersChanged, this));
                    this.api.asc_registerCallback('asc_onParticipantsChanged', _.bind(this.onApiUsersChanged, this));
                    /** coauthoring end **/
                }

                return this;
            },

            setMode: function (mode) {
                if (mode.isDisconnected) {
                    this.lockToolbar(Common.enumLock.lostConnect, true);
                    this.lockToolbar( Common.enumLock.lostConnect, true, {array:[this.btnUndo,this.btnRedo,this.btnSave]} );
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

            onSendThemeColorSchemes: function (schemas) {
                var mnuColorSchema = this.btnColorSchemas.menu;
                mnuColorSchema && mnuColorSchema.removeAll(true);

                if (mnuColorSchema == null) {
                    mnuColorSchema = new Common.UI.Menu({
                        cls: 'shifted-left',
                        restoreHeight: true
                    });
                }

                if (mnuColorSchema) {
                    var itemTemplate = _.template([
                        '<a id="<%= id %>" class="<%= options.cls %>" tabindex="-1" type="menuitem">',
                        '<span class="colors">',
                        '<% _.each(options.colors, function(color) { %>',
                        '<span class="color" style="background: <%= color %>;"></span>',
                        '<% }) %>',
                        '</span>',
                        '<span class="text"><%- caption %></span>',
                        '</a>'
                    ].join(''));

                    _.each(schemas, function (schema, index) {
                        var colors = schema.get_colors();//schema.colors;
                        var schemecolors = [];
                        for (var j = 2; j < 7; j++) {
                            var clr = '#' + Common.Utils.ThemeColor.getHexColor(colors[j].get_r(), colors[j].get_g(), colors[j].get_b());
                            schemecolors.push(clr);
                        }

                        if (index == 24) {
                            mnuColorSchema.addItem({
                                caption: '--'
                            }, true);
                        }
                        mnuColorSchema.addItem({
                            template: itemTemplate,
                            cls: 'color-schemas-menu',
                            colors: schemecolors,
                            caption: schema.get_name(),
                            value: index,
                            checkable: true,
                            toggleGroup: 'menuSchema'
                        }, true);
                    }, this);
                }
            },

            /** coauthoring begin **/
            onCollaborativeChanges: function () {
                if (this._state.hasCollaborativeChanges) return;
                if (!this.btnCollabChanges.rendered) {
                    this.needShowSynchTip = true;
                    return;
                }

                var previewPanel = PE.getController('Viewport').getView('DocumentPreview');
                if (previewPanel && previewPanel.isVisible()) {
                    this.needShowSynchTip = true;
                    return;
                }

                this._state.hasCollaborativeChanges = true;
                this.btnCollabChanges.cmpEl.addClass('notify');
                if (this.showSynchTip) {
                    this.btnCollabChanges.updateHint('');
                    if (this.synchTooltip === undefined)
                        this.createSynchTip();

                    this.synchTooltip.target = this.btnCollabChanges.$el.is(':visible') ? this.btnCollabChanges.$el : $('[data-layout-name=toolbar-file]', this.$el);
                    this.synchTooltip.show();
                } else {
                    this.btnSaveTip = this.tipSynchronize;
                    PE.getController('Common.Controllers.Shortcuts').updateShortcutHints({
                        Save: {
                            btn: this.btnCollabChanges,
                            label: this.btnSaveTip,
                            ignoreUpdates: true
                        },
                    });
                }
                this.lockToolbar(Common.enumLock.cantSave, false, {array: [this.btnSave]});
                Common.Gateway.collaborativeChanges();
            },

            createSynchTip: function () {
                var direction = Common.UI.isRTL() ? 'left' : 'right';
                this.synchTooltip = new Common.UI.SynchronizeTip({
                    extCls: (this.mode.compactHeader) ? undefined : 'inc-index',
                    placement: this.mode.isDesktopApp ? 'bottom-' + direction : direction + '-bottom',
                });
                this.synchTooltip.on('dontshowclick', function () {
                    this.showSynchTip = false;
                    this.synchTooltip.hide();
                    this.btnSaveTip = this.tipSynchronize;
                    PE.getController('Common.Controllers.Shortcuts').updateShortcutHints({
                        Save: {
                            btn: this.btnCollabChanges,
                            label: this.btnSaveTip,
                            ignoreUpdates: true
                        },
                    });
                    Common.localStorage.setItem("pe-hide-synch", 1);
                }, this);
                this.synchTooltip.on('closeclick', function () {
                    this.synchTooltip.hide();
                    this.btnSaveTip = this.tipSynchronize;
                    PE.getController('Common.Controllers.Shortcuts').updateShortcutHints({
                        Save: {
                            btn: this.btnCollabChanges,
                            label: this.btnSaveTip,
                            ignoreUpdates: true
                        },
                    });
                }, this);
            },

            synchronizeChanges: function () {
                if (this.btnCollabChanges.rendered) {
                    var me = this;

                    if ( me.btnCollabChanges.cmpEl.hasClass('notify') ) {
                        me.btnCollabChanges.cmpEl.removeClass('notify');
                        if (this.synchTooltip)
                            this.synchTooltip.hide();

                        PE.getController('Common.Controllers.Shortcuts').updateShortcutHints({
                            Save: {
                                btn: this.btnCollabChanges,
                                label: this.btnSaveTip,
                                ignoreUpdates: true
                            },
                        });

                        this.lockToolbar(Common.enumLock.cantSave, !me.mode.forcesave && !me.mode.canSaveDocumentToBinary, {array: [this.btnSave]});
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

                var length = _.size(editusers);
                var cls = (length > 1) ? 'btn-save-coauth' : 'btn-save';
                if (cls !== this.btnSaveCls && this.btnCollabChanges.rendered) {
                    this.btnSaveTip = ((length > 1) ? this.tipSaveCoauth : this.tipSave );
                    PE.getController('Common.Controllers.Shortcuts').updateShortcutHints({
                        Save: {
                            btn: this.btnCollabChanges,
                            label: this.btnSaveTip,
                            ignoreUpdates: true
                        },
                    });
                    this.btnCollabChanges.changeIcon({next: cls, curr: this.btnSaveCls});
                    this.btnSaveCls = cls;
                }
            },

            /** coauthoring end **/

            onSlidePickerShowAfter: function (picker) {
                if (!picker._needRecalcSlideLayout) return;
                if (picker.cmpEl && picker.dataViewItems.length > 0) {
                    var dataViewItems = picker.dataViewItems,
                        el = $(dataViewItems[0].el),
                        itemW = el.outerWidth() + parseInt(el.css('margin-left')) + parseInt(el.css('margin-right')),
                        columnCount = Math.floor(picker.options.restoreWidth / itemW + 0.5) || 1, // try to use restore width
                        col = 0, maxHeight = 0;

                    picker.cmpEl.width(itemW * columnCount + 11);

                    for (var i = 0; i < dataViewItems.length; i++) {
                        var div = $(dataViewItems[i].el).find('.title'),
                            height = div.height();

                        if (height > maxHeight)
                            maxHeight = height;
                        else
                            div.css({'height': maxHeight});

                        col++;
                        if (col > columnCount - 1) {
                            col = 0;
                            maxHeight = 0;
                        }
                    }
                    picker._needRecalcSlideLayout = false;
                }
            },

            updateComboAutoshapeMenu: function (collection) {
                var me = this,
                    recents = Common.localStorage.getItem('pe-recent-shapes');
                recents = recents ? JSON.parse(recents) : null;
                me.cmbsInsertShape.forEach(function (cmb) {
                    cmb.setMenuPicker(collection, recents, me.textRecentlyUsed);
                });
            },

            updateAddSlideMenu: function(collection) {
                if (collection.size()<1) return;
                var me = this;
                if (!me.binding.onShowBeforeAddSlide) {
                    me.binding.onShowBeforeAddSlide = function(menu) {
                        var change = (this.iconCls.indexOf('btn-changeslide')>-1);
                        var picker = new Common.UI.DataView({
                            el: $('.menu-layouts', menu.$el),
                            parentMenu: menu,
                            outerMenu:  {menu: menu, index: 0},
                            showLast: change,
                            restoreHeight: 300,
                            restoreWidth: 302,
                            style: 'max-height: 300px;',
                            store: PE.getCollection('SlideLayouts'),
                            itemTemplate: _.template([
                                '<div class="layout" id="<%= id %>" style="width: <%= itemWidth %>px;">',
                                '<div style="background-image: url(<%= imageUrl %>); width: <%= itemWidth %>px; height: <%= itemHeight %>px;background-size: contain;"></div>',
                                '<div class="title"><%- title %></div> ',
                                '</div>'
                            ].join(''))
                        });
                        picker.on('item:click', function (picker, item, record, e) {
                            if (e.type !== 'click') Common.UI.Menu.Manager.hideAll();
                            if (record)
                                me.fireEvent(change ? 'change:slide' : 'add:slide', [record.get('data').idx]);
                        });
                        if (menu) {
                            menu.on('show:after', function () {
                                me.onSlidePickerShowAfter(picker);
                                !change && me.fireEvent('duplicate:check', [menu]);
                                picker.scroller.update({alwaysVisibleY: true});
                                if (change) {
                                    var record = picker.store.findLayoutByIndex(picker.options.layout_index);
                                    if (record) {
                                        picker.selectRecord(record, true);
                                        picker.scrollToRecord(record);
                                    }
                                } else
                                    picker.scroller.scrollTop(0);
                            });
                            menu.setInnerMenu([{menu: picker, index: 0}]);
                        }
                        menu.off('show:before', me.binding.onShowBeforeAddSlide);
                        if (change && this.mnuSlidePicker)
                            picker.options.layout_index = this.mnuSlidePicker.options.layout_index;
                        this.mnuSlidePicker = picker;
                        this.mnuSlidePicker._needRecalcSlideLayout = true;
                    };
                    [me.btnAddSlide, me.btnChangeSlide].forEach(function (btn, index) {
                        btn.menu.on('show:before', me.binding.onShowBeforeAddSlide, btn);
                    });
                } else {
                    [me.btnAddSlide, me.btnChangeSlide].forEach(function (btn, index) {
                        btn.mnuSlidePicker && (btn.mnuSlidePicker._needRecalcSlideLayout = true);
                    });
                }
            },

            loadRecentSymbolsFromStorage: function(){
                var recents = Common.localStorage.getItem('pe-fastRecentSymbols');
                var arr = (!!recents) ? JSON.parse(recents) :
                    [
                        { symbol: 8226,     font: 'Arial'},
                        { symbol: 8364,     font: 'Arial'},
                        { symbol: 65284,    font: 'Arial'},
                        { symbol: 165,      font: 'Arial'},
                        { symbol: 169,      font: 'Arial'},
                        { symbol: 174,      font: 'Arial'},
                        { symbol: 189,      font: 'Arial'},
                        { symbol: 188,      font: 'Arial'},
                        { symbol: 8800,     font: 'Arial'},
                        { symbol: 177,      font: 'Arial'},
                        { symbol: 247,      font: 'Arial'},
                        { symbol: 8730,     font: 'Arial'},
                        { symbol: 8804,     font: 'Arial'},
                        { symbol: 8805,     font: 'Arial'},
                        { symbol: 8482,     font: 'Arial'},
                        { symbol: 8734,     font: 'Arial'},
                        { symbol: 126,      font: 'Arial'},
                        { symbol: 176,      font: 'Arial'},
                        { symbol: 167,      font: 'Arial'},
                        { symbol: 945,      font: 'Arial'},
                        { symbol: 946,      font: 'Arial'},
                        { symbol: 960,      font: 'Arial'},
                        { symbol: 916,      font: 'Arial'},
                        { symbol: 9786,     font: 'Arial'},
                        { symbol: 9829,     font: 'Arial'}
                    ];
                arr.forEach(function (item){
                    item.tip = this.getSymbolDescription(item.symbol);
                }.bind(this));
                return arr;
            },

            saveSymbol: function(symbol, font) {
                var maxLength =25,
                    picker = this.mnuInsertSymbolsPicker;
                var item = picker.store.find(function(item){
                    return item.get('symbol') == symbol && item.get('font') == font
                });

                item && picker.store.remove(item);
                picker.store.add({symbol: symbol, font: font, tip: this.getSymbolDescription(symbol)},{at:0});
                picker.store.length > maxLength && picker.store.remove(picker.store.last());

                var arr = picker.store.map(function (item){
                    return {symbol: item.get('symbol'), font: item.get('font')};
                });
                var sJSON = JSON.stringify(arr);
                Common.localStorage.setItem( 'pe-fastRecentSymbols', sJSON);
            },

            getSymbolDescription: function(symbol){
                var  specSymbol = this.specSymbols.find(function (item){return item.symbol == symbol});
                return !!specSymbol ? specSymbol.description : this.capBtnInsSymbol + ': ' + symbol;
            },

            onDesktopWindow: function() {
                if (this.synchTooltip && this.synchTooltip.isVisible()) {
                    this.synchTooltip.show(); // change position for visible tip
                }
            },

            tipNumCapitalLetters: 'A. B. C.',
            tipNumLettersParentheses: 'a) b) c)',
            tipNumLettersPoints: 'a. b. c.',
            tipNumNumbersPoint: '1. 2. 3.',
            tipNumNumbersParentheses: '1) 2) 3)',
            tipNumRoman: 'I. II. III.',
            tipNumRomanSmall: 'i. ii. iii.'
        }
    }()), PE.Views.Toolbar || {}));
});
