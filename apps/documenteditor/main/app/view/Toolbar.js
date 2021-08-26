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
 *  Toolbar view
 *
 *  Created by Maxim.Kadushkin on 2/13/17
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'jquery',
    'underscore',
    'backbone',
    'text!documenteditor/main/app/template/Toolbar.template',
    'text!documenteditor/main/app/template/ToolbarView.template',
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
], function ($, _, Backbone, template, template_view) {
    'use strict';

    DE.Views.Toolbar =  Common.UI.Mixtbar.extend(_.extend((function(){

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

                this.SchemeNames = [ this.txtScheme22,
                    this.txtScheme1, this.txtScheme2, this.txtScheme3, this.txtScheme4, this.txtScheme5,
                    this.txtScheme6, this.txtScheme7, this.txtScheme8, this.txtScheme9, this.txtScheme10,
                    this.txtScheme11, this.txtScheme12, this.txtScheme13, this.txtScheme14, this.txtScheme15,
                    this.txtScheme16, this.txtScheme17, this.txtScheme18, this.txtScheme19, this.txtScheme20,
                    this.txtScheme21
                ];

                this.paragraphControls = [];
                this.toolbarControls = [];
                this.textOnlyControls = [];
                this._state = {
                    hasCollaborativeChanges: undefined,
                    previewmode: false
                };

                Common.NotificationCenter.on('app:ready', me.onAppReady.bind(this));
                return this;
            },

            applyLayout: function (config) {
                var me = this;

                if ( config.isEdit ) {
                    Common.UI.Mixtbar.prototype.initialize.call(this, {
                            template: _.template(template),
                            tabs: [
                                {caption: me.textTabFile, action: 'file', extcls: 'canedit', haspanel:false},
                                {caption: me.textTabHome, action: 'home', extcls: 'canedit'},
                                {caption: me.textTabInsert, action: 'ins', extcls: 'canedit'},
                                {caption: me.textTabLayout, action: 'layout', extcls: 'canedit'},
                                {caption: me.textTabLinks, action: 'links', extcls: 'canedit'}
                            ]
                        }
                    );

                    this.btnSaveCls = 'btn-save';
                    this.btnSaveTip = this.tipSave + Common.Utils.String.platformKey('Ctrl+S');

                    this.btnPrint = new Common.UI.Button({
                        id: 'id-toolbar-btn-print',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-print no-mask',
                        signals: ['disabled']
                    });
                    this.toolbarControls.push(this.btnPrint);

                    this.btnSave = new Common.UI.Button({
                        id: 'id-toolbar-btn-save',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon no-mask ' + this.btnSaveCls,
                        signals: ['disabled']
                    });
                    this.toolbarControls.push(this.btnSave);
                    this.btnCollabChanges = this.btnSave;

                    this.btnUndo = new Common.UI.Button({
                        id: 'id-toolbar-btn-undo',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-undo',
                        signals: ['disabled']
                    });
                    this.toolbarControls.push(this.btnUndo);

                    this.btnRedo = new Common.UI.Button({
                        id: 'id-toolbar-btn-redo',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-redo',
                        signals: ['disabled']
                    });
                    this.toolbarControls.push(this.btnRedo);

                    this.btnCopy = new Common.UI.Button({
                        id: 'id-toolbar-btn-copy',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-copy'
                    });
                    this.toolbarControls.push(this.btnCopy);

                    this.btnPaste = new Common.UI.Button({
                        id: 'id-toolbar-btn-paste',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-paste'
                    });
                    this.paragraphControls.push(this.btnPaste);

                    this.btnIncFontSize = new Common.UI.Button({
                        id: 'id-toolbar-btn-incfont',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-incfont'
                    });
                    this.paragraphControls.push(this.btnIncFontSize);

                    this.btnDecFontSize = new Common.UI.Button({
                        id: 'id-toolbar-btn-decfont',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-decfont'
                    });
                    this.paragraphControls.push(this.btnDecFontSize);

                    this.btnBold = new Common.UI.Button({
                        id: 'id-toolbar-btn-bold',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-bold',
                        enableToggle: true
                    });
                    this.paragraphControls.push(this.btnBold);

                    this.btnItalic = new Common.UI.Button({
                        id: 'id-toolbar-btn-italic',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-italic',
                        enableToggle: true
                    });
                    this.paragraphControls.push(this.btnItalic);

                    this.btnUnderline = new Common.UI.Button({
                        id: 'id-toolbar-btn-underline',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-underline',
                        enableToggle: true
                    });
                    this.paragraphControls.push(this.btnUnderline);

                    this.btnStrikeout = new Common.UI.Button({
                        id: 'id-toolbar-btn-strikeout',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-strikeout',
                        enableToggle: true
                    });
                    this.paragraphControls.push(this.btnStrikeout);

                    this.btnSuperscript = new Common.UI.Button({
                        id: 'id-toolbar-btn-superscript',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-superscript',
                        enableToggle: true,
                        toggleGroup: 'superscriptGroup'
                    });
                    this.paragraphControls.push(this.btnSuperscript);

                    this.btnSubscript = new Common.UI.Button({
                        id: 'id-toolbar-btn-subscript',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-subscript',
                        enableToggle: true,
                        toggleGroup: 'superscriptGroup'
                    });
                    this.paragraphControls.push(this.btnSubscript);

                    this.btnHighlightColor = new Common.UI.ButtonColored({
                        id: 'id-toolbar-btn-highlight',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-highlight',
                        enableToggle: true,
                        allowDepress: true,
                        split: true,
                        menu: new Common.UI.Menu({
                            style: 'min-width: 100px;',
                            items: [
                                {template: _.template('<div id="id-toolbar-menu-highlight" style="width: 120px; height: 120px; margin: 10px;"></div>')},
                                {caption: '--'},
                                this.mnuHighlightTransparent = new Common.UI.MenuItem({
                                    caption: this.strMenuNoFill,
                                    checkable: true
                                })
                            ]
                        })
                    });
                    this.paragraphControls.push(this.btnHighlightColor);
                    this.textOnlyControls.push(this.btnHighlightColor);

                    this.btnFontColor = new Common.UI.ButtonColored({
                        id: 'id-toolbar-btn-fontcolor',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-fontcolor',
                        split: true,
                        menu: new Common.UI.Menu({
                            cls: 'shifted-left',
                            items: [
                                {
                                    id: 'id-toolbar-menu-auto-fontcolor',
                                    caption: this.textAutoColor,
                                    template: _.template('<a tabindex="-1" type="menuitem"><span class="menu-item-icon" style="background-image: none; width: 12px; height: 12px; margin: 1px 7px 0 1px; background-color: #000;"></span><%= caption %></a>')
                                },
                                {caption: '--'},
                                {template: _.template('<div id="id-toolbar-menu-fontcolor" style="width: 169px; height: 216px; margin: 10px;"></div>')},
                                {template: _.template('<a id="id-toolbar-menu-new-fontcolor" style="">' + this.textNewColor + '</a>')}
                            ]
                        })
                    });
                    this.paragraphControls.push(this.btnFontColor);

                    this.btnParagraphColor = new Common.UI.ButtonColored({
                        id: 'id-toolbar-btn-paracolor',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-paracolor',
                        split: true,
                        menu: new Common.UI.Menu({
                            items: [
                                {template: _.template('<div id="id-toolbar-menu-paracolor" style="width: 169px; height: 216px; margin: 10px;"></div>')},
                                {template: _.template('<a id="id-toolbar-menu-new-paracolor" style="padding-left:12px;">' + this.textNewColor + '</a>')}
                            ]
                        })
                    });
                    this.paragraphControls.push(this.btnParagraphColor);
                    this.textOnlyControls.push(this.btnParagraphColor);

                    this.btnChangeCase = new Common.UI.Button({
                        id: 'id-toolbar-btn-case',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-change-case',
                        menu: new Common.UI.Menu({
                            items: [
                                {caption: this.mniSentenceCase, value: Asc.c_oAscChangeTextCaseType.SentenceCase},
                                {caption: this.mniLowerCase, value: Asc.c_oAscChangeTextCaseType.LowerCase},
                                {caption: this.mniUpperCase, value: Asc.c_oAscChangeTextCaseType.UpperCase},
                                {caption: this.mniCapitalizeWords, value: Asc.c_oAscChangeTextCaseType.CapitalizeWords},
                                {caption: this.mniToggleCase, value: Asc.c_oAscChangeTextCaseType.ToggleCase}
                            ]
                        })
                    });
                    this.paragraphControls.push(this.btnChangeCase);

                    this.btnAlignLeft = new Common.UI.Button({
                        id: 'id-toolbar-btn-align-left',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-align-left',
                        enableToggle: true,
                        toggleGroup: 'alignGroup'
                    });
                    this.paragraphControls.push(this.btnAlignLeft);

                    this.btnAlignCenter = new Common.UI.Button({
                        id: 'id-toolbar-btn-align-center',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-align-center',
                        enableToggle: true,
                        toggleGroup: 'alignGroup'
                    });
                    this.paragraphControls.push(this.btnAlignCenter);

                    this.btnAlignRight = new Common.UI.Button({
                        id: 'id-toolbar-btn-align-right',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-align-right',
                        enableToggle: true,
                        toggleGroup: 'alignGroup'
                    });
                    this.paragraphControls.push(this.btnAlignRight);

                    this.btnAlignJust = new Common.UI.Button({
                        id: 'id-toolbar-btn-align-just',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-align-just',
                        enableToggle: true,
                        toggleGroup: 'alignGroup'
                    });
                    this.paragraphControls.push(this.btnAlignJust);

                    this.btnDecLeftOffset = new Common.UI.Button({
                        id: 'id-toolbar-btn-decoffset',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-decoffset'
                    });
                    this.paragraphControls.push(this.btnDecLeftOffset);

                    this.btnIncLeftOffset = new Common.UI.Button({
                        id: 'id-toolbar-btn-incoffset',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-incoffset'
                    });
                    this.paragraphControls.push(this.btnIncLeftOffset);

                    this.btnLineSpace = new Common.UI.Button({
                        id: 'id-toolbar-btn-linespace',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-linespace',
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
                        })
                    });
                    this.paragraphControls.push(this.btnLineSpace);

                    this.btnShowHidenChars = new Common.UI.Button({
                        id: 'id-toolbar-btn-hidenchars',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-paragraph',
                        enableToggle: true,
                        split: true,
                        menu: new Common.UI.Menu({
                            style: 'min-width: 60px;',
                            items: [
                                {caption: this.mniHiddenChars, value: 'characters', checkable: true},
                                {caption: this.mniHiddenBorders, value: 'table', checkable: true}
                            ]
                        })
                    });
                    this.toolbarControls.push(this.btnShowHidenChars);

                    this.btnMarkers = new Common.UI.Button({
                        id: 'id-toolbar-btn-markers',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-setmarkers',
                        enableToggle: true,
                        toggleGroup: 'markersGroup',
                        split: true,
                        menu: true
                    });
                    this.paragraphControls.push(this.btnMarkers);
                    this.textOnlyControls.push(this.btnMarkers);

                    this.btnNumbers = new Common.UI.Button({
                        id: 'id-toolbar-btn-numbering',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-numbering',
                        enableToggle: true,
                        toggleGroup: 'markersGroup',
                        split: true,
                        menu: true
                    });
                    this.paragraphControls.push(this.btnNumbers);
                    this.textOnlyControls.push(this.btnNumbers);

                    this.btnMultilevels = new Common.UI.Button({
                        id: 'id-toolbar-btn-multilevels',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-multilevels',
                        menu: true
                    });
                    this.paragraphControls.push(this.btnMultilevels);
                    this.textOnlyControls.push(this.btnMultilevels);

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
                        },
                        deselectAll: function () {
                            this.conf.index = -1;
                        }
                    };
                    this.mnuNumbersPicker = clone(this.mnuMarkersPicker);
                    this.mnuMultilevelPicker = clone(this.mnuMarkersPicker);

                    this.btnInsertTable = new Common.UI.Button({
                        id: 'tlbtn-inserttable',
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-inserttable',
                        caption: me.capBtnInsTable,
                        menu: new Common.UI.Menu({
                            items: [
                                {template: _.template('<div id="id-toolbar-menu-tablepicker" class="dimension-picker" style="margin: 5px 10px;"></div>')},
                                {caption: this.mniCustomTable, value: 'custom'},
                                {caption: this.mniDrawTable, value: 'draw', checkable: true},
                                {caption: this.mniEraseTable, value: 'erase', checkable: true},
                                {caption: this.mniTextToTable, value: 'convert'}
                            ]
                        })
                    });
                    this.paragraphControls.push(this.btnInsertTable);

                    this.btnInsertImage = new Common.UI.Button({
                        id: 'tlbtn-insertimage',
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-insertimage',
                        caption: me.capBtnInsImage,
                        menu: new Common.UI.Menu({
                            items: [
                                {caption: this.mniImageFromFile, value: 'file'},
                                {caption: this.mniImageFromUrl, value: 'url'},
                                {caption: this.mniImageFromStorage, value: 'storage'}
                            ]
                        })
                    });
                    this.paragraphControls.push(this.btnInsertImage);

                    this.btnInsertChart = new Common.UI.Button({
                        id: 'tlbtn-insertchart',
                        cls: 'btn-toolbar x-huge icon-top',
                        caption: me.capBtnInsChart,
                        iconCls: 'toolbar__icon btn-insertchart',
                        menu: true
                    });
                    this.paragraphControls.push(this.btnInsertChart);

                    this.btnInsertText = new Common.UI.Button({
                        id: 'tlbtn-inserttext',
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-text',
                        caption: me.capBtnInsTextbox,
                        enableToggle: true
                    });
                    this.paragraphControls.push(this.btnInsertText);
                    this.btnInsertTextArt = new Common.UI.Button({
                        id: 'tlbtn-inserttextart',
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-textart',
                        caption: me.capBtnInsTextart,
                        menu: new Common.UI.Menu({
                            cls: 'menu-shapes',
                            items: [
                                {template: _.template('<div id="id-toolbar-menu-insart" style="width: 239px; margin-left: 5px;"></div>')}
                            ]
                        })
                    });
                    this.paragraphControls.push(this.btnInsertTextArt);

                    this.btnEditHeader = new Common.UI.Button({
                        id: 'id-toolbar-btn-editheader',
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-editheader',
                        caption: me.capBtnInsHeader,
                        menu: true
                    });
                    this.mnuPageNumberPosPicker = {
                        conf: {disabled: false},
                        isDisabled: function () {
                            return this.conf.disabled;
                        },
                        setDisabled: function (val) {
                            this.conf.disabled = val;
                        }
                    };
                    this.mnuPageNumCurrentPos = clone(this.mnuPageNumberPosPicker);
                    this.mnuInsertPageNum = clone(this.mnuPageNumberPosPicker);
                    this.mnuInsertPageCount = clone(this.mnuPageNumberPosPicker);
                    this.paragraphControls.push(this.mnuPageNumCurrentPos);
                    this.paragraphControls.push(this.mnuInsertPageCount);
                    this.toolbarControls.push(this.btnEditHeader);

                    this.btnInsDateTime = new Common.UI.Button({
                        id: 'id-toolbar-btn-datetime',
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-datetime',
                        caption: me.capBtnDateTime
                    });
                    this.paragraphControls.push(this.btnInsDateTime);

                    this.btnBlankPage = new Common.UI.Button({
                        id: 'id-toolbar-btn-blankpage',
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-blankpage',
                        caption: me.capBtnBlankPage
                    });
                    this.paragraphControls.push(this.btnBlankPage);

                    this.btnInsertShape = new Common.UI.Button({
                        id: 'tlbtn-insertshape',
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-insertshape',
                        caption: me.capBtnInsShape,
                        enableToggle: true,
                        menu: new Common.UI.Menu({cls: 'menu-shapes'})
                    });
                    this.paragraphControls.push(this.btnInsertShape);

                    this.btnInsertEquation = new Common.UI.Button({
                        id: 'tlbtn-insertequation',
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-insertequation',
                        caption: me.capBtnInsEquation,
                        split: true,
                        menu: new Common.UI.Menu({cls: 'menu-shapes'})
                    });
                    this.paragraphControls.push(this.btnInsertEquation);

                    this.btnInsertSymbol = new Common.UI.Button({
                        id: 'tlbtn-insertsymbol',
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-symbol',
                        caption: me.capBtnInsSymbol
                    });
                    this.paragraphControls.push(this.btnInsertSymbol);

                    this.btnDropCap = new Common.UI.Button({
                        id: 'tlbtn-dropcap',
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-dropcap',
                        caption: me.capBtnInsDropcap,
                        menu: new Common.UI.Menu({
                            cls: 'ppm-toolbar shifted-right',
                            items: [
                                {
                                    caption: this.textNone,
                                    iconCls: 'menu__icon columns-one',
                                    checkable: true,
                                    checkmark: false,
                                    toggleGroup: 'menuDropCap',
                                    value: Asc.c_oAscDropCap.None,
                                    checked: true
                                },
                                {
                                    caption: this.textInText,
                                    iconCls: 'menu__icon dropcap-intext',
                                    checkable: true,
                                    checkmark: false,
                                    toggleGroup: 'menuDropCap',
                                    value: Asc.c_oAscDropCap.Drop
                                },
                                {
                                    caption: this.textInMargin,
                                    iconCls: 'menu__icon dropcap-inmargin',
                                    checkable: true,
                                    checkmark: false,
                                    toggleGroup: 'menuDropCap',
                                    value: Asc.c_oAscDropCap.Margin
                                },
                                {caption: '--'},
                                this.mnuDropCapAdvanced = new Common.UI.MenuItem({caption: this.mniEditDropCap})
                            ]
                        })
                    });
                    this.paragraphControls.push(this.btnDropCap);

                    this.btnContentControls = new Common.UI.Button({
                        id: 'tlbtn-controls',
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-controls',
                        caption: me.capBtnInsControls,
                        menu: new Common.UI.Menu({
                            cls: 'ppm-toolbar shifted-right',
                            items: [
                                {
                                    caption: this.textPlainControl,
                                    iconCls: 'menu__icon cc-plaintext',
                                    value: 'plain'
                                },
                                {
                                    caption: this.textRichControl,
                                    iconCls: 'menu__icon cc-richtext',
                                    value: 'rich'
                                },
                                {
                                    caption: this.textPictureControl,
                                    iconCls: 'menu__icon btn-menu-image',
                                    value: 'picture'
                                },
                                {
                                    caption: this.textComboboxControl,
                                    // iconCls: 'mnu-control-rich',
                                    value: 'combobox'
                                },
                                {
                                    caption: this.textDropdownControl,
                                    // iconCls: 'mnu-control-rich',
                                    value: 'dropdown'
                                },
                                {
                                    caption: this.textDateControl,
                                    // iconCls: 'mnu-control-rich',
                                    value: 'date'
                                },
                                {
                                    caption: this.textCheckboxControl,
                                    // iconCls: 'mnu-control-rich',
                                    value: 'checkbox'
                                },
                                {caption: '--'},
                                {
                                    caption: this.textRemoveControl,
                                    iconCls: 'menu__icon cc-remove',
                                    value: 'remove'
                                },
                                {caption: '--'},
                                {
                                    caption: this.mniEditControls,
                                    value: 'settings'
                                },
                                {
                                    caption: this.mniHighlightControls,
                                    value: 'highlight',
                                    menu: new Common.UI.Menu({
                                        menuAlign   : 'tl-tr',
                                        items: [
                                            this.mnuNoControlsColor = new Common.UI.MenuItem({
                                                id: 'id-toolbar-menu-no-highlight-controls',
                                                caption: this.textNoHighlight,
                                                checkable: true
                                            }),
                                            {caption: '--'},
                                            {template: _.template('<div id="id-toolbar-menu-controls-color" style="width: 169px; height: 94px; margin: 10px;"></div>')},
                                            {template: _.template('<a id="id-toolbar-menu-new-control-color" style="padding-left:12px;">' + this.textNewColor + '</a>')}
                                        ]
                                    })
                                }
                            ]
                        })
                    });
                    // this.paragraphControls.push(this.btnContentControls);

                    this.btnColumns = new Common.UI.Button({
                        id: 'tlbtn-columns',
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-columns',
                        caption: me.capBtnColumns,
                        menu: new Common.UI.Menu({
                            cls: 'ppm-toolbar shifted-right',
                            items: [
                                {
                                    caption: this.textColumnsOne,
                                    iconCls: 'menu__icon columns-one',
                                    checkable: true,
                                    checkmark: false,
                                    toggleGroup: 'menuColumns',
                                    value: 0
                                },
                                {
                                    caption: this.textColumnsTwo,
                                    iconCls: 'menu__icon columns-two',
                                    checkable: true,
                                    checkmark: false,
                                    toggleGroup: 'menuColumns',
                                    value: 1
                                },
                                {
                                    caption: this.textColumnsThree,
                                    iconCls: 'menu__icon columns-three',
                                    checkable: true,
                                    checkmark: false,
                                    toggleGroup: 'menuColumns',
                                    value: 2
                                },
                                {
                                    caption: this.textColumnsLeft,
                                    iconCls: 'menu__icon columns-left',
                                    checkmark: false,
                                    checkable: true,
                                    toggleGroup: 'menuColumns',
                                    value: 3
                                },
                                {
                                    caption: this.textColumnsRight,
                                    iconCls: 'menu__icon columns-right',
                                    checkmark: false,
                                    checkable: true,
                                    toggleGroup: 'menuColumns',
                                    value: 4
                                },
                                {caption: '--'},
                                {caption: this.textColumnsCustom, value: 'advanced'}
                            ]
                        })
                    });
                    this.paragraphControls.push(this.btnColumns);

                    this.btnPageOrient = new Common.UI.Button({
                        id: 'tlbtn-pageorient',
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-pageorient',
                        caption: me.capBtnPageOrient,
                        menu: new Common.UI.Menu({
                            cls: 'ppm-toolbar',
                            items: [
                                {
                                    caption: this.textPortrait,
                                    iconCls: 'menu__icon page-portrait',
                                    checkable: true,
                                    checkmark: false,
                                    toggleGroup: 'menuOrient',
                                    value: true
                                },
                                {
                                    caption: this.textLandscape,
                                    iconCls: 'menu__icon page-landscape',
                                    checkable: true,
                                    checkmark: false,
                                    toggleGroup: 'menuOrient',
                                    value: false
                                }
                            ]
                        })
                    });
                    this.toolbarControls.push(this.btnPageOrient);


                    var pageMarginsTemplate = _.template('<a id="<%= id %>" tabindex="-1" type="menuitem"><div><b><%= caption %></b></div>' +
                        '<% if (options.value !== null) { %><div style="display: inline-block;margin-right: 20px;min-width: 80px;">' +
                        '<label style="display: block;">' + this.textTop + '<%= parseFloat(Common.Utils.Metric.fnRecalcFromMM(options.value[0]).toFixed(2)) %> <%= Common.Utils.Metric.getCurrentMetricName() %></label>' +
                        '<label style="display: block;">' + this.textLeft + '<%= parseFloat(Common.Utils.Metric.fnRecalcFromMM(options.value[1]).toFixed(2)) %> <%= Common.Utils.Metric.getCurrentMetricName() %></label></div><div style="display: inline-block;">' +
                        '<label style="display: block;">' + this.textBottom + '<%= parseFloat(Common.Utils.Metric.fnRecalcFromMM(options.value[2]).toFixed(2)) %> <%= Common.Utils.Metric.getCurrentMetricName() %></label>' +
                        '<label style="display: block;">' + this.textRight + '<%= parseFloat(Common.Utils.Metric.fnRecalcFromMM(options.value[3]).toFixed(2)) %> <%= Common.Utils.Metric.getCurrentMetricName() %></label></div>' +
                        '<% } %></a>');

                    this.btnPageMargins = new Common.UI.Button({
                        id: 'tlbtn-pagemargins',
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-pagemargins',
                        caption: me.capBtnMargins,
                        menu: new Common.UI.Menu({
                            items: [
                                {
                                    caption: this.textMarginsLast,
                                    checkable: true,
                                    template: pageMarginsTemplate,
                                    toggleGroup: 'menuPageMargins'
                                }, //top,left,bottom,right
                                {
                                    caption: this.textMarginsNormal,
                                    checkable: true,
                                    template: pageMarginsTemplate,
                                    toggleGroup: 'menuPageMargins',
                                    value: [20, 30, 20, 15]
                                },
                                {
                                    caption: this.textMarginsUsNormal,
                                    checkable: true,
                                    template: pageMarginsTemplate,
                                    toggleGroup: 'menuPageMargins',
                                    value: [25.4, 25.4, 25.4, 25.4]
                                },
                                {
                                    caption: this.textMarginsNarrow,
                                    checkable: true,
                                    template: pageMarginsTemplate,
                                    toggleGroup: 'menuPageMargins',
                                    value: [12.7, 12.7, 12.7, 12.7]
                                },
                                {
                                    caption: this.textMarginsModerate,
                                    checkable: true,
                                    template: pageMarginsTemplate,
                                    toggleGroup: 'menuPageMargins',
                                    value: [25.4, 19.1, 25.4, 19.1]
                                },
                                {
                                    caption: this.textMarginsWide,
                                    checkable: true,
                                    template: pageMarginsTemplate,
                                    toggleGroup: 'menuPageMargins',
                                    value: [25.4, 50.8, 25.4, 50.8]
                                },
                                {caption: '--'},
                                {caption: this.textPageMarginsCustom, value: 'advanced'}
                            ]
                        })
                    });
                    this.toolbarControls.push(this.btnPageMargins);

                    var pageSizeTemplate = _.template('<a id="<%= id %>" tabindex="-1" type="menuitem"><div><b><%= caption %></b></div>' +
                        '<div><%= parseFloat(Common.Utils.Metric.fnRecalcFromMM(options.value[0]).toFixed(2)) %> <%= Common.Utils.Metric.getCurrentMetricName() %> x ' +
                        '<%= parseFloat(Common.Utils.Metric.fnRecalcFromMM(options.value[1]).toFixed(2)) %> <%= Common.Utils.Metric.getCurrentMetricName() %></div></a>');

                    this.btnPageSize = new Common.UI.Button({
                        id: 'tlbtn-pagesize',
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-pagesize',
                        caption: me.capBtnPageSize,
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
                                },
                                {caption: '--'},
                                {caption: this.textPageSizeCustom, value: 'advanced'}
                            ]
                        })
                    });
                    this.toolbarControls.push(this.btnPageSize);

                    this.btnLineNumbers = new Common.UI.Button({
                        id: 'tlbtn-line-numbers',
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-line-numbering',
                        caption: me.capBtnLineNumbers,
                        menu: new Common.UI.Menu({
                            cls: 'ppm-toolbar',
                            items: [
                                {
                                    caption: this.textNone,
                                    checkable: true,
                                    toggleGroup: 'menuLineNumbers',
                                    value: 0
                                },
                                {
                                    caption: this.textContinuous,
                                    checkable: true,
                                    toggleGroup: 'menuLineNumbers',
                                    value: 1
                                },
                                {
                                    caption: this.textRestartEachPage,
                                    checkable: true,
                                    toggleGroup: 'menuLineNumbers',
                                    value: 2
                                },
                                {
                                    caption: this.textRestartEachSection,
                                    checkable: true,
                                    toggleGroup: 'menuLineNumbers',
                                    value: 3
                                },
                                {
                                    caption: this.textSuppressForCurrentParagraph,
                                    checkable: true,
                                    allowDepress: true,
                                    value: 4
                                },
                                {caption: '--'},
                                {
                                    caption: this.textCustomLineNumbers,
                                    value: 5
                                }
                            ]
                        })
                    });
                    this.toolbarControls.push(this.btnLineNumbers);

                    this.btnClearStyle = new Common.UI.Button({
                        id: 'id-toolbar-btn-clearstyle',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-clearstyle'
                    });
                    this.toolbarControls.push(this.btnClearStyle);

                    this.btnCopyStyle = new Common.UI.Button({
                        id: 'id-toolbar-btn-copystyle',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-copystyle',
                        enableToggle: true
                    });
                    this.toolbarControls.push(this.btnCopyStyle);

                    this.btnColorSchemas = new Common.UI.Button({
                        id: 'id-toolbar-btn-colorschemas',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-colorschemas',
                        menu: new Common.UI.Menu({
                            cls: 'shifted-left',
                            items: [],
                            restoreHeight: true
                        })
                    });
                    this.toolbarControls.push(this.btnColorSchemas);

                    this.btnMailRecepients = new Common.UI.Button({
                        id: 'id-toolbar-btn-mailrecepients',
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-mailmerge'
                    });

                    me.btnImgAlign = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-img-align',
                        caption: me.capImgAlign,
                        menu: true
                    });

                    me.btnImgGroup = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-img-group',
                        caption: me.capImgGroup,
                        menu: true
                    });
                    me.btnImgForward = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-img-frwd',
                        caption: me.capImgForward,
                        split: true,
                        menu: true
                    });
                    me.btnImgBackward = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-img-bkwd',
                        caption: me.capImgBackward,
                        split: true,
                        menu: true
                    });
                    me.btnImgWrapping = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-img-wrap',
                        caption: me.capImgWrapping,
                        menu: true
                    });

                    me.btnWatermark = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-watermark',
                        caption: me.capBtnWatermark,
                        menu: new Common.UI.Menu({
                            cls: 'ppm-toolbar',
                            items: [
                                {
                                    caption: this.textEditWatermark,
                                    value: 'edit'
                                },
                                {
                                    caption: this.textRemWatermark,
                                    value: 'remove'
                                }
                            ]
                        })
                    });

                    me.toolbarControls.push(me.btnImgAlign,
                        me.btnImgGroup, me.btnImgForward, me.btnImgBackward, me.btnImgWrapping, me.btnWatermark);

                    //
                    // Menus
                    //

                    this.mnuLineSpace = this.btnLineSpace.menu;
                    this.mnuNonPrinting = this.btnShowHidenChars.menu;
                    this.mnuInsertTable = this.btnInsertTable.menu;
                    this.mnuInsertImage = this.btnInsertImage.menu;
                    this.mnuPageSize = this.btnPageSize.menu;
                    this.mnuColorSchema = this.btnColorSchemas.menu;
                    this.mnuChangeCase = this.btnChangeCase.menu;

                    this.cmbFontSize = new Common.UI.ComboBox({
                        cls: 'input-group-nr',
                        menuStyle: 'min-width: 55px;',
                        hint: this.tipFontSize,
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
                    this.paragraphControls.push(this.cmbFontSize);

                    this.cmbFontName = new Common.UI.ComboBoxFonts({
                        cls: 'input-group-nr',
                        menuCls: 'scrollable-menu',
                        menuStyle: 'min-width: 325px;',
                        hint: this.tipFontName,
                        store: new Common.Collections.Fonts()
                    });
                    this.paragraphControls.push(this.cmbFontName);

                    this.listStylesAdditionalMenuItem = new Common.UI.MenuItem({
                        template: _.template(
                            '<div id="id-save-style-container" class = "save-style-container">' +
                            '<span id="id-save-style-plus" class="plus img-commonctrl"  ></span>' +
                            '<label id="id-save-style-link" class="save-style-link" >' + me.textStyleMenuNew + '</label>' +
                            '</div>')
                    });

                    this.listStyles = new Common.UI.ComboDataView({
                        cls: 'combo-styles',
                        itemWidth: 104,
                        itemHeight: 40,
//                hint        : this.tipParagraphStyle,
                        enableKeyEvents: true,
                        additionalMenuItems: [this.listStylesAdditionalMenuItem],
                        beforeOpenHandler: function (e) {
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

                                var minCount = cmp.menuPicker.store.length >= minMenuColumn ? minMenuColumn : cmp.menuPicker.store.length,
                                    columnCount = Math.min(cmp.menuPicker.store.length, Math.round($('.dataview', $(cmp.fieldPicker.el)).width() / (itemMargin + itemWidth) + 0.5));

                                columnCount = columnCount < minCount ? minCount : columnCount;
                                menu.menuAlignEl = cmp.cmpEl;

                                menu.menuAlign = 'tl-tl';
                                var offset = cmp.cmpEl.width() - cmp.openButton.$el.width() - columnCount * (itemMargin + itemWidth) - 1;
                                menu.setOffset(Math.min(offset, 0));

                                menu.cmpEl.css({
                                    'width': columnCount * (itemWidth + itemMargin),
                                    'min-height': cmp.cmpEl.height()
                                });
                            }

                            if (cmp.menuPicker.scroller) {
                                cmp.menuPicker.scroller.update({
                                    includePadding: true,
                                    suppressScrollX: true
                                });
                            }

                            cmp.removeTips();
                        }
                    });

                    this.listStyles.fieldPicker.itemTemplate = _.template([
                        '<div class="style" id="<%= id %>">',
                        '<div style="background-image: url(<%= imageUrl %>); width: ' + this.listStyles.itemWidth + 'px; height: ' + this.listStyles.itemHeight + 'px;"></div>',
                        '</div>'
                    ].join(''));
                    this.listStyles.menuPicker.itemTemplate = _.template([
                        '<div class="style" id="<%= id %>">',
                        '<div style="background-image: url(<%= imageUrl %>); width: ' + this.listStyles.itemWidth + 'px; height: ' + this.listStyles.itemHeight + 'px;"></div>',
                        '</div>'
                    ].join(''));
                    this.paragraphControls.push(this.listStyles);
                    this.textOnlyControls.push(this.listStyles);

                    // Disable all components before load document
                    _.each(this.toolbarControls.concat(this.paragraphControls), function (cmp) {
                        if (_.isFunction(cmp.setDisabled))
                            cmp.setDisabled(true);
                    });
                    this.btnMailRecepients.setDisabled(true);

                    var editStyleMenuUpdate = new Common.UI.MenuItem({
                        caption: me.textStyleMenuUpdate
                    }).on('click', _.bind(me.onStyleMenuUpdate, me));

                    var editStyleMenuRestore = new Common.UI.MenuItem({
                        caption: me.textStyleMenuDelete
                    }).on('click', _.bind(me.onStyleMenuDelete, me));

                    var editStyleMenuDelete = new Common.UI.MenuItem({
                        caption: me.textStyleMenuRestore
                    }).on('click', _.bind(me.onStyleMenuDelete, me));

                    var editStyleMenuRestoreAll = new Common.UI.MenuItem({
                        caption: me.textStyleMenuRestoreAll
                    }).on('click', _.bind(me.onStyleMenuRestoreAll, me));

                    var editStyleMenuDeleteAll = new Common.UI.MenuItem({
                        caption: me.textStyleMenuDeleteAll
                    }).on('click', _.bind(me.onStyleMenuDeleteAll, me));

                    if (this.styleMenu == null) {
                        this.styleMenu = new Common.UI.Menu({
                            items: [
                                editStyleMenuUpdate,
                                editStyleMenuRestore,
                                editStyleMenuDelete,
                                editStyleMenuRestoreAll,
                                editStyleMenuDeleteAll
                            ]
                        });
                    }

                    this.on('render:after', _.bind(this.onToolbarAfterRender, this));
                } else {
                    Common.UI.Mixtbar.prototype.initialize.call(this, {
                            template: _.template(template_view),
                            tabs: [
                                {caption: me.textTabFile, action: 'file', haspanel: false}
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
                if ( mode.isEdit ) {
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

                    me.setTab('home');

                    var top = Common.localStorage.getItem("de-pgmargins-top"),
                        left = Common.localStorage.getItem("de-pgmargins-left"),
                        bottom = Common.localStorage.getItem("de-pgmargins-bottom"),
                        right = Common.localStorage.getItem("de-pgmargins-right");
                    if ( top!==null && left!==null && bottom!==null && right!==null ) {
                        var mnu = this.btnPageMargins.menu.items[0];
                        mnu.options.value = mnu.value = [parseFloat(top), parseFloat(left), parseFloat(bottom), parseFloat(right)];
                        mnu.setVisible(true);
                        $(mnu.el).html(mnu.template({id: Common.UI.getId(), caption : mnu.caption, options : mnu.options}));
                    } else
                        this.btnPageMargins.menu.items[0].setVisible(false);
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
            },

            rendererComponents: function (html) {
                var $host = $(html);
                var _injectComponent = function (id, cmp) {
                    Common.Utils.injectComponent($host.findById(id), cmp);
                };

                _injectComponent('#slot-field-fontname', this.cmbFontName);
                _injectComponent('#slot-field-fontsize', this.cmbFontSize);
                _injectComponent('#slot-btn-print', this.btnPrint);
                _injectComponent('#slot-btn-save', this.btnSave);
                _injectComponent('#slot-btn-undo', this.btnUndo);
                _injectComponent('#slot-btn-redo', this.btnRedo);
                _injectComponent('#slot-btn-copy', this.btnCopy);
                _injectComponent('#slot-btn-paste', this.btnPaste);
                _injectComponent('#slot-btn-incfont', this.btnIncFontSize);
                _injectComponent('#slot-btn-decfont', this.btnDecFontSize);
                _injectComponent('#slot-btn-bold', this.btnBold);
                _injectComponent('#slot-btn-italic', this.btnItalic);
                _injectComponent('#slot-btn-underline', this.btnUnderline);
                _injectComponent('#slot-btn-strikeout', this.btnStrikeout);
                _injectComponent('#slot-btn-superscript', this.btnSuperscript);
                _injectComponent('#slot-btn-subscript', this.btnSubscript);
                _injectComponent('#slot-btn-highlight', this.btnHighlightColor);
                _injectComponent('#slot-btn-fontcolor', this.btnFontColor);
                _injectComponent('#slot-btn-changecase', this.btnChangeCase);
                _injectComponent('#slot-btn-align-left', this.btnAlignLeft);
                _injectComponent('#slot-btn-align-center', this.btnAlignCenter);
                _injectComponent('#slot-btn-align-right', this.btnAlignRight);
                _injectComponent('#slot-btn-align-just', this.btnAlignJust);
                _injectComponent('#slot-btn-incoffset', this.btnIncLeftOffset);
                _injectComponent('#slot-btn-decoffset', this.btnDecLeftOffset);
                _injectComponent('#slot-btn-linespace', this.btnLineSpace);
                _injectComponent('#slot-btn-hidenchars', this.btnShowHidenChars);
                _injectComponent('#slot-btn-markers', this.btnMarkers);
                _injectComponent('#slot-btn-numbering', this.btnNumbers);
                _injectComponent('#slot-btn-multilevels', this.btnMultilevels);
                _injectComponent('#slot-btn-instable', this.btnInsertTable);
                _injectComponent('#slot-btn-insimage', this.btnInsertImage);
                _injectComponent('#slot-btn-inschart', this.btnInsertChart);
                _injectComponent('#slot-btn-instext', this.btnInsertText);
                _injectComponent('#slot-btn-instextart', this.btnInsertTextArt);
                _injectComponent('#slot-btn-dropcap', this.btnDropCap);
                _injectComponent('#slot-btn-controls', this.btnContentControls);
                _injectComponent('#slot-btn-columns', this.btnColumns);
                _injectComponent('#slot-btn-line-numbers', this.btnLineNumbers);
                _injectComponent('#slot-btn-editheader', this.btnEditHeader);
                _injectComponent('#slot-btn-datetime', this.btnInsDateTime);
                _injectComponent('#slot-btn-blankpage', this.btnBlankPage);
                _injectComponent('#slot-btn-insshape', this.btnInsertShape);
                _injectComponent('#slot-btn-insequation', this.btnInsertEquation);
                _injectComponent('#slot-btn-inssymbol', this.btnInsertSymbol);
                _injectComponent('#slot-btn-pageorient', this.btnPageOrient);
                _injectComponent('#slot-btn-pagemargins', this.btnPageMargins);
                _injectComponent('#slot-btn-pagesize', this.btnPageSize);
                _injectComponent('#slot-btn-clearstyle', this.btnClearStyle);
                _injectComponent('#slot-btn-copystyle', this.btnCopyStyle);
                _injectComponent('#slot-btn-colorschemas', this.btnColorSchemas);
                _injectComponent('#slot-btn-paracolor', this.btnParagraphColor);
                _injectComponent('#slot-field-styles', this.listStyles);
                _injectComponent('#slot-btn-mailrecepients', this.btnMailRecepients);
                _injectComponent('#slot-img-align', this.btnImgAlign);
                _injectComponent('#slot-img-group', this.btnImgGroup);
                _injectComponent('#slot-img-movefrwd', this.btnImgForward);
                _injectComponent('#slot-img-movebkwd', this.btnImgBackward);
                _injectComponent('#slot-img-wrapping', this.btnImgWrapping);
                _injectComponent('#slot-btn-watermark', this.btnWatermark);

                this.btnsPageBreak = Common.Utils.injectButtons($host.find('.btn-slot.btn-pagebreak'), '', 'toolbar__icon btn-pagebreak', this.capBtnInsPagebreak, undefined, true, true);
                Array.prototype.push.apply(this.paragraphControls, this.btnsPageBreak);

                return $host;
            },

            onAppReady: function (config) {
                var me = this;
                (new Promise( function(resolve, reject) {
                    resolve();
                })).then(function () {
                    if ( !config.isEdit ) return;

                    me.btnsPageBreak.forEach( function(btn) {
                        btn.updateHint( [me.textInsPageBreak, me.tipPageBreak] );

                        var _menu_section_break = new Common.UI.Menu({
                            menuAlign: 'tl-tr',
                            items: [
                                {caption: me.textNextPage, value: Asc.c_oAscSectionBreakType.NextPage},
                                {caption: me.textContPage, value: Asc.c_oAscSectionBreakType.Continuous},
                                {caption: me.textEvenPage, value: Asc.c_oAscSectionBreakType.EvenPage},
                                {caption: me.textOddPage, value: Asc.c_oAscSectionBreakType.OddPage}
                            ]
                        });

                        var _menu = new Common.UI.Menu({
                            items: [
                                {caption: me.textInsPageBreak, value: 'page'},
                                {caption: me.textInsColumnBreak, value: 'column'},
                                {caption: me.textInsSectionBreak, value: 'section', menu: _menu_section_break}
                            ]
                        });

                        btn.setMenu(_menu);
                    });

                    var _holder_view = DE.getController('DocumentHolder').getView();
                    me.btnImgForward.updateHint(me.tipSendForward);
                    me.btnImgForward.setMenu(new Common.UI.Menu({
                        items: [{
                                caption : _holder_view.textArrangeFront,
                                iconCls : 'menu__icon arrange-front',
                                valign  : Asc.c_oAscChangeLevel.BringToFront
                            }, {
                                caption : _holder_view.textArrangeForward,
                                iconCls : 'menu__icon arrange-forward',
                                valign  : Asc.c_oAscChangeLevel.BringForward
                            }
                        ]})
                    );

                    me.btnImgBackward.updateHint(me.tipSendBackward);
                    me.btnImgBackward.setMenu(new Common.UI.Menu({
                        items: [{
                                caption : _holder_view.textArrangeBack,
                                iconCls : 'menu__icon arrange-back',
                                valign  : Asc.c_oAscChangeLevel.SendToBack
                            }, {
                                caption : _holder_view.textArrangeBackward,
                                iconCls : 'menu__icon arrange-backward',
                                valign  : Asc.c_oAscChangeLevel.BringBackward
                            }]
                    }));

                    me.btnImgAlign.updateHint(me.tipImgAlign);

                    me.mniAlignToPage = new Common.UI.MenuItem({
                        caption: me.txtPageAlign,
                        checkable: true,
                        toggleGroup: 'imgalign',
                        value: -1
                    }).on('click', function (mnu) {
                        Common.Utils.InternalSettings.set("de-img-align-to", 1);
                    });
                    me.mniAlignToMargin = new Common.UI.MenuItem({
                        caption: me.txtMarginAlign,
                        checkable: true,
                        toggleGroup: 'imgalign',
                        value: -1
                    }).on('click', function (mnu) {
                        Common.Utils.InternalSettings.set("de-img-align-to", 2);
                    });
                    me.mniAlignObjects = new Common.UI.MenuItem({
                        caption: me.txtObjectsAlign,
                        checkable: true,
                        toggleGroup: 'imgalign',
                        value: -1
                    }).on('click', function (mnu) {
                        Common.Utils.InternalSettings.set("de-img-align-to", 3);
                    });

                    me.mniDistribHor = new Common.UI.MenuItem({
                        caption: me.txtDistribHor,
                        iconCls: 'menu__icon shape-distribute-hor',
                        value: 6
                    });
                    me.mniDistribVert = new Common.UI.MenuItem({
                        caption: me.txtDistribVert,
                        iconCls: 'menu__icon shape-distribute-vert',
                        value: 7
                    });

                    me.btnImgAlign.setMenu(new Common.UI.Menu({
                        cls: 'shifted-right',
                        items: [{
                                caption : _holder_view.textShapeAlignLeft,
                                iconCls : 'menu__icon shape-align-left',
                                value: Asc.c_oAscAlignShapeType.ALIGN_LEFT
                            }, {
                                caption : _holder_view.textShapeAlignCenter,
                                iconCls : 'menu__icon shape-align-center',
                                value: Asc.c_oAscAlignShapeType.ALIGN_CENTER
                            }, {
                                caption : _holder_view.textShapeAlignRight,
                                iconCls : 'menu__icon shape-align-right',
                                value: Asc.c_oAscAlignShapeType.ALIGN_RIGHT
                            }, {
                                caption : _holder_view.textShapeAlignTop,
                                iconCls : 'menu__icon shape-align-top',
                                value: Asc.c_oAscAlignShapeType.ALIGN_TOP
                            }, {
                                caption : _holder_view.textShapeAlignMiddle,
                                iconCls : 'menu__icon shape-align-middle',
                                value: Asc.c_oAscAlignShapeType.ALIGN_MIDDLE
                            }, {
                                caption : _holder_view.textShapeAlignBottom,
                                iconCls : 'menu__icon shape-align-bottom',
                                value: Asc.c_oAscAlignShapeType.ALIGN_BOTTOM
                            },
                            {caption: '--'},
                            me.mniDistribHor,
                            me.mniDistribVert,
                            {caption: '--'},
                            me.mniAlignToPage,
                            me.mniAlignToMargin,
                            me.mniAlignObjects
                        ]
                    }));

                    me.btnImgGroup.updateHint(me.tipImgGroup);
                    me.btnImgGroup.setMenu(new Common.UI.Menu({
                        items: [{
                            caption : _holder_view.txtGroup,
                            iconCls : 'menu__icon shape-group',
                            groupval: 1
                        }, {
                            caption : _holder_view.txtUngroup,
                            iconCls : 'menu__icon shape-ungroup',
                            groupval: -1
                        }]
                    }));

                    me.btnImgWrapping.updateHint(me.tipImgWrapping);
                    me.btnImgWrapping.setMenu(new Common.UI.Menu({
                        cls: 'ppm-toolbar shifted-right',
                        items: [{
                                caption     : _holder_view.txtInline,
                                iconCls     : 'menu__icon wrap-inline',
                                toggleGroup : 'imgwrapping',
                                wrapType    : Asc.c_oAscWrapStyle2.Inline,
                                checkmark   : false,
                                checkable   : true
                            }, {
                                caption     : _holder_view.txtSquare,
                                iconCls     : 'menu__icon wrap-square',
                                toggleGroup : 'imgwrapping',
                                wrapType    : Asc.c_oAscWrapStyle2.Square,
                                checkmark   : false,
                                checkable   : true
                            }, {
                                caption     : _holder_view.txtTight,
                                iconCls     : 'menu__icon wrap-tight',
                                toggleGroup : 'imgwrapping',
                                wrapType    : Asc.c_oAscWrapStyle2.Tight,
                                checkmark   : false,
                                checkable   : true
                            }, {
                                caption     : _holder_view.txtThrough,
                                iconCls     : 'menu__icon wrap-through',
                                toggleGroup : 'imgwrapping',
                                wrapType    : Asc.c_oAscWrapStyle2.Through,
                                checkmark   : false,
                                checkable   : true
                            }, {
                                caption     : _holder_view.txtTopAndBottom,
                                iconCls     : 'menu__icon wrap-topandbottom',
                                toggleGroup : 'imgwrapping',
                                wrapType    : Asc.c_oAscWrapStyle2.TopAndBottom,
                                checkmark   : false,
                                checkable   : true
                            }, {
                                caption     : _holder_view.txtInFront,
                                iconCls     : 'menu__icon wrap-infront',
                                toggleGroup : 'imgwrapping',
                                wrapType    : Asc.c_oAscWrapStyle2.InFront,
                                checkmark   : false,
                                checkable   : true
                            }, {
                                caption     : _holder_view.txtBehind,
                                iconCls     : 'menu__icon wrap-behind',
                                toggleGroup : 'imgwrapping',
                                wrapType    : Asc.c_oAscWrapStyle2.Behind,
                                checkmark   : false,
                                checkable   : true
                            },
                            { caption: '--' },
                            {
                                caption     : _holder_view.textEditWrapBoundary,
                                wrapType    : 'edit'
                            }
                        ]
                    }));

                    me.btnWatermark.updateHint(me.tipWatermark);

                    if (!config.canFeatureContentControl && me.btnContentControls.cmpEl) {
                        me.btnContentControls.cmpEl.parents('.group').hide().prev('.separator').hide();
                    }
                });
            },

            createDelayedElements: function () {
                if (this.api) {
                    this.mnuNonPrinting.items[0].setChecked(this.api.get_ShowParaMarks(), true);
                    this.mnuNonPrinting.items[1].setChecked(this.api.get_ShowTableEmptyLine(), true);
                    this.btnShowHidenChars.toggle(this.mnuNonPrinting.items[0].checked, true);

                    this.updateMetricUnit();
                }

                // set hints
                this.btnPrint.updateHint(this.tipPrint + Common.Utils.String.platformKey('Ctrl+P'));
                this.btnSave.updateHint(this.btnSaveTip);
                this.btnUndo.updateHint(this.tipUndo + Common.Utils.String.platformKey('Ctrl+Z'));
                this.btnRedo.updateHint(this.tipRedo + Common.Utils.String.platformKey('Ctrl+Y'));
                this.btnCopy.updateHint(this.tipCopy + Common.Utils.String.platformKey('Ctrl+C'));
                this.btnPaste.updateHint(this.tipPaste + Common.Utils.String.platformKey('Ctrl+V'));
                this.btnIncFontSize.updateHint(this.tipIncFont + Common.Utils.String.platformKey('Ctrl+]'));
                this.btnDecFontSize.updateHint(this.tipDecFont + Common.Utils.String.platformKey('Ctrl+['));
                this.btnBold.updateHint(this.textBold + Common.Utils.String.platformKey('Ctrl+B'));
                this.btnItalic.updateHint(this.textItalic + Common.Utils.String.platformKey('Ctrl+I'));
                this.btnUnderline.updateHint(this.textUnderline + Common.Utils.String.platformKey('Ctrl+U'));
                this.btnStrikeout.updateHint(this.textStrikeout);
                this.btnSuperscript.updateHint(this.textSuperscript);
                this.btnSubscript.updateHint(this.textSubscript);
                this.btnHighlightColor.updateHint(this.tipHighlightColor);
                this.btnFontColor.updateHint(this.tipFontColor);
                this.btnParagraphColor.updateHint(this.tipPrColor);
                this.btnChangeCase.updateHint(this.tipChangeCase);
                this.btnAlignLeft.updateHint(this.tipAlignLeft + Common.Utils.String.platformKey('Ctrl+L'));
                this.btnAlignCenter.updateHint(this.tipAlignCenter + Common.Utils.String.platformKey('Ctrl+E'));
                this.btnAlignRight.updateHint(this.tipAlignRight + Common.Utils.String.platformKey('Ctrl+R'));
                this.btnAlignJust.updateHint(this.tipAlignJust + Common.Utils.String.platformKey('Ctrl+J'));
                this.btnDecLeftOffset.updateHint(this.tipDecPrLeft + Common.Utils.String.platformKey('Ctrl+Shift+M'));
                this.btnIncLeftOffset.updateHint(this.tipIncPrLeft + Common.Utils.String.platformKey('Ctrl+M'));
                this.btnLineSpace.updateHint(this.tipLineSpace);
                this.btnShowHidenChars.updateHint(this.tipShowHiddenChars + Common.Utils.String.platformKey('Ctrl+*'));
                this.btnMarkers.updateHint(this.tipMarkers);
                this.btnNumbers.updateHint(this.tipNumbers);
                this.btnMultilevels.updateHint(this.tipMultilevels);
                this.btnInsertTable.updateHint(this.tipInsertTable);
                this.btnInsertImage.updateHint(this.tipInsertImage);
                this.btnInsertChart.updateHint(this.tipInsertChart);
                this.btnInsertText.updateHint(this.tipInsertText);
                this.btnInsertTextArt.updateHint(this.tipInsertTextArt);
                this.btnEditHeader.updateHint(this.tipEditHeader);
                this.btnInsDateTime.updateHint(this.tipDateTime);
                this.btnBlankPage.updateHint(this.tipBlankPage);
                this.btnInsertShape.updateHint(this.tipInsertShape);
                this.btnInsertEquation.updateHint(this.tipInsertEquation);
                this.btnInsertSymbol.updateHint(this.tipInsertSymbol);
                this.btnDropCap.updateHint(this.tipDropCap);
                this.btnContentControls.updateHint(this.tipControls);
                this.btnColumns.updateHint(this.tipColumns);
                this.btnPageOrient.updateHint(this.tipPageOrient);
                this.btnPageSize.updateHint(this.tipPageSize);
                this.btnPageMargins.updateHint(this.tipPageMargins);
                this.btnLineNumbers.updateHint(this.tipLineNumbers);
                this.btnClearStyle.updateHint(this.tipClearStyle);
                this.btnCopyStyle.updateHint(this.tipCopyStyle + Common.Utils.String.platformKey('Ctrl+Shift+C'));
                this.btnColorSchemas.updateHint(this.tipColorSchemas);
                this.btnMailRecepients.updateHint(this.tipMailRecepients);

                // set menus

                var me = this;
                var levelTemplate = _.template('<a id="<%= id %>" tabindex="-1" type="menuitem"><div id="<%= options.previewId %>" class="menu-list-preview" style="width: 200px; height: 30px;"></div></a>');
                var items = [], ids = [];
                for (var i=0; i<9; i++) {
                    ids.push('id-toolbar-menu-markers-level-' + i);
                    items.push({template: levelTemplate, previewId: ids[i], level: i, checkable: true });
                }
                this.btnMarkers.setMenu(
                    new Common.UI.Menu({
                        cls: 'shifted-left',
                        style: 'min-width: 145px',
                        items: [
                            {template: _.template('<div id="id-toolbar-menu-markers" class="menu-markers" style="width: 145px; margin: 0 9px;"></div>')},
                            {caption: '--'},
                            this.mnuMarkerChangeLevel = new Common.UI.MenuItem({
                                caption: this.textChangeLevel,
                                style: 'padding-right:20px;',
                                disabled: (this.mnuMarkersPicker.conf.index || 0)==0,
                                menu: new Common.UI.Menu({
                                    cls: 'list-settings-level',
                                    menuAlign: 'tl-tr',
                                    items: items,
                                    previewIds: ids
                                })
                            }),
                            this.mnuMarkerSettings = new Common.UI.MenuItem({
                                caption: this.textListSettings,
                                disabled: (this.mnuMarkersPicker.conf.index || 0)==0,
                                value: 'settings'
                            })
                        ]
                    })
                );

                items = []; ids = [];
                for (var i=0; i<9; i++) {
                    ids.push('id-toolbar-menu-numbering-level-' + i);
                    items.push({template: levelTemplate, previewId: ids[i], level: i, checkable: true });
                }
                this.btnNumbers.setMenu(
                    new Common.UI.Menu({
                        cls: 'shifted-left',
                        items: [
                            {template: _.template('<div id="id-toolbar-menu-numbering" class="menu-markers" style="width: 353px; margin: 0 9px;"></div>')},
                            {caption: '--'},
                            this.mnuNumberChangeLevel = new Common.UI.MenuItem({
                                caption: this.textChangeLevel,
                                style: 'padding-right:20px;',
                                disabled: (this.mnuNumbersPicker.conf.index || 0)==0,
                                menu: new Common.UI.Menu({
                                    cls: 'list-settings-level',
                                    menuAlign: 'tl-tr',
                                    items: items,
                                    previewIds: ids
                                })
                            }),
                            this.mnuNumberSettings = new Common.UI.MenuItem({
                                caption: this.textListSettings,
                                disabled: (this.mnuNumbersPicker.conf.index || 0)==0,
                                value: 'settings'
                            })
                        ]
                    })
                );
                items = []; ids = [];
                for (var i=0; i<9; i++) {
                    ids.push('id-toolbar-menu-multilevels-level-' + i);
                    items.push({template: levelTemplate, previewId: ids[i], level: i, checkable: true });
                }
                this.btnMultilevels.setMenu(
                    new Common.UI.Menu({
                        cls: 'shifted-left',
                        style: 'min-width: 177px',
                        items: [
                            {template: _.template('<div id="id-toolbar-menu-multilevels" class="menu-markers" style="width: 185px; margin: 0 9px;"></div>')},
                            {caption: '--'},
                            this.mnuMultiChangeLevel = new Common.UI.MenuItem({
                                caption: this.textChangeLevel,
                                style: 'padding-right:20px;',
                                disabled: (this.mnuMultilevelPicker.conf.index || 0)==0,
                                menu: new Common.UI.Menu({
                                    cls: 'list-settings-level',
                                    menuAlign: 'tl-tr',
                                    items: items,
                                    previewIds: ids
                                })
                            }),
                            this.mnuMultilevelSettings = new Common.UI.MenuItem({
                                caption: this.textListSettings,
                                disabled: (this.mnuMultilevelPicker.conf.index || 0)==0,
                                value: 'settings'
                            })
                        ]
                    })
                );

                this.btnEditHeader.setMenu(
                    new Common.UI.Menu({
                        items: [
                            {caption: this.mniEditHeader, value: 'header'},
                            {caption: this.mniEditFooter, value: 'footer'},
                            {caption: '--'},
                            this.mnuInsertPageNum = new Common.UI.MenuItem({
                                caption: this.textInsertPageNumber,
                                disabled: this.mnuInsertPageNum.isDisabled(),
                                menu: new Common.UI.Menu({
                                    cls: 'shifted-left',
                                    menuAlign: 'tl-tr',
                                    style: 'min-width: 90px;',
                                    items: [
                                        {template: _.template('<div id="id-toolbar-menu-pageposition" class="menu-pageposition"></div>')},
                                        this.mnuPageNumCurrentPos = new Common.UI.MenuItem({
                                            caption: this.textToCurrent,
                                            disabled: this.mnuPageNumCurrentPos.isDisabled(),
                                            value: 'current'
                                        })
                                    ]
                                })
                            }),
                            this.mnuInsertPageCount = new Common.UI.MenuItem({
                                caption: this.textInsertPageCount,
                                disabled: this.mnuInsertPageCount.isDisabled()
                            })
                        ]
                    })
                );
                this.paragraphControls.push(this.mnuPageNumCurrentPos);
                this.paragraphControls.push(this.mnuInsertPageCount);

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
                        showLast: false,
                        restoreHeight: 465,
                        groups: new Common.UI.DataViewGroupStore(Common.define.chartData.getChartGroupData()),
                        store: new Common.UI.DataViewStore(Common.define.chartData.getChartData()),
                        itemTemplate: _.template('<div id="<%= id %>" class="item-chartlist"><svg width="40" height="40" class=\"icon\"><use xlink:href=\"#chart-<%= iconCls %>\"></use></svg></div>')
                    });
                    picker.on('item:click', function (picker, item, record, e) {
                        if (record)
                            me.fireEvent('add:chart', [record.get('type')]);
                    });
                    menu.off('show:before', onShowBefore);
                };
                this.btnInsertChart.menu.on('show:before', onShowBefore);

                var onShowBeforeTextArt = function (menu) {
                    var collection = DE.getCollection('Common.Collections.TextArt');
                    if (collection.length<1)
                        DE.getController('Main').fillTextArt(me.api.asc_getTextArtPreviews());
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

                // set dataviews

                var _conf = this.mnuMarkersPicker.conf;
                this.mnuMarkersPicker = new Common.UI.DataView({
                    el: $('#id-toolbar-menu-markers'),
                    parentMenu: this.btnMarkers.menu,
                    restoreHeight: 138,
                    allowScrollbar: false,
                    store: new Common.UI.DataViewStore([
                        {id: 'id-markers-' + Common.UI.getId(), data: {type: 0, subtype: -1}, skipRenderOnChange: true},
                        {id: 'id-markers-' + Common.UI.getId(), data: {type: 0, subtype: 1}, skipRenderOnChange: true},
                        {id: 'id-markers-' + Common.UI.getId(), data: {type: 0, subtype: 2}, skipRenderOnChange: true},
                        {id: 'id-markers-' + Common.UI.getId(), data: {type: 0, subtype: 3}, skipRenderOnChange: true},
                        {id: 'id-markers-' + Common.UI.getId(), data: {type: 0, subtype: 4}, skipRenderOnChange: true},
                        {id: 'id-markers-' + Common.UI.getId(), data: {type: 0, subtype: 5}, skipRenderOnChange: true},
                        {id: 'id-markers-' + Common.UI.getId(), data: {type: 0, subtype: 6}, skipRenderOnChange: true},
                        {id: 'id-markers-' + Common.UI.getId(), data: {type: 0, subtype: 7}, skipRenderOnChange: true},
                        {id: 'id-markers-' + Common.UI.getId(), data: {type: 0, subtype: 8}, skipRenderOnChange: true}
                    ]),
                    itemTemplate: _.template('<div id="<%= id %>" class="item-markerlist"></div>')
                });
                _conf && this.mnuMarkersPicker.selectByIndex(_conf.index, true);

                _conf = this.mnuNumbersPicker.conf;
                this.mnuNumbersPicker = new Common.UI.DataView({
                    el: $('#id-toolbar-menu-numbering'),
                    parentMenu: this.btnNumbers.menu,
                    restoreHeight: 92,
                    allowScrollbar: false,
                    store: new Common.UI.DataViewStore([
                        {id: 'id-numbers-' + Common.UI.getId(), data: {type: 1, subtype: -1}, skipRenderOnChange: true},
                        {id: 'id-numbers-' + Common.UI.getId(), data: {type: 1, subtype: 4}, skipRenderOnChange: true},
                        {id: 'id-numbers-' + Common.UI.getId(), data: {type: 1, subtype: 5}, skipRenderOnChange: true},
                        {id: 'id-numbers-' + Common.UI.getId(), data: {type: 1, subtype: 6}, skipRenderOnChange: true},
                        {id: 'id-numbers-' + Common.UI.getId(), data: {type: 1, subtype: 1}, skipRenderOnChange: true},
                        {id: 'id-numbers-' + Common.UI.getId(), data: {type: 1, subtype: 2}, skipRenderOnChange: true},
                        {id: 'id-numbers-' + Common.UI.getId(), data: {type: 1, subtype: 3}, skipRenderOnChange: true},
                        {id: 'id-numbers-' + Common.UI.getId(), data: {type: 1, subtype: 7}, skipRenderOnChange: true}
                    ]),
                    itemTemplate: _.template('<div id="<%= id %>" class="item-multilevellist"></div>')
                });
                _conf && this.mnuNumbersPicker.selectByIndex(_conf.index, true);

                _conf = this.mnuMultilevelPicker.conf;
                this.mnuMultilevelPicker = new Common.UI.DataView({
                    el: $('#id-toolbar-menu-multilevels'),
                    parentMenu: this.btnMultilevels.menu,
                    restoreHeight: 92,
                    allowScrollbar: false,
                    store: new Common.UI.DataViewStore([
                        {id: 'id-multilevels-' + Common.UI.getId(), data: {type: 2, subtype: -1}, skipRenderOnChange: true},
                        {id: 'id-multilevels-' + Common.UI.getId(), data: {type: 2, subtype: 1}, skipRenderOnChange: true},
                        {id: 'id-multilevels-' + Common.UI.getId(), data: {type: 2, subtype: 2}, skipRenderOnChange: true},
                        {id: 'id-multilevels-' + Common.UI.getId(), data: {type: 2, subtype: 3}, skipRenderOnChange: true}
                    ]),
                    itemTemplate: _.template('<div id="<%= id %>" class="item-multilevellist"></div>')
                });
                _conf && this.mnuMultilevelPicker.selectByIndex(_conf.index, true);

                _conf = this.mnuPageNumberPosPicker ? this.mnuPageNumberPosPicker.conf : undefined;
                this.mnuPageNumberPosPicker = new Common.UI.DataView({
                    el: $('#id-toolbar-menu-pageposition'),
                    allowScrollbar: false,
                    store: new Common.UI.DataViewStore([
                        {
                            allowSelected: false,
                            iconname: 'page-number-top-left',
                            data: {
                                type: c_pageNumPosition.PAGE_NUM_POSITION_TOP,
                                subtype: c_pageNumPosition.PAGE_NUM_POSITION_LEFT
                            }
                        },
                        {
                            allowSelected: false,
                            iconname: 'page-number-top-center',
                            data: {
                                type: c_pageNumPosition.PAGE_NUM_POSITION_TOP,
                                subtype: c_pageNumPosition.PAGE_NUM_POSITION_CENTER
                            }
                        },
                        {
                            allowSelected: false,
                            iconname: 'page-number-top-right',
                            data: {
                                type: c_pageNumPosition.PAGE_NUM_POSITION_TOP,
                                subtype: c_pageNumPosition.PAGE_NUM_POSITION_RIGHT
                            }
                        },
                        {
                            allowSelected: false,
                            iconname: 'page-number-bottom-left',
                            data: {
                                type: c_pageNumPosition.PAGE_NUM_POSITION_BOTTOM,
                                subtype: c_pageNumPosition.PAGE_NUM_POSITION_LEFT
                            }
                        },
                        {
                            allowSelected: false,
                            iconname: 'page-number-bottom-center',
                            data: {
                                type: c_pageNumPosition.PAGE_NUM_POSITION_BOTTOM,
                                subtype: c_pageNumPosition.PAGE_NUM_POSITION_CENTER
                            }
                        },
                        {
                            allowSelected: false,
                            iconname: 'page-number-bottom-right',
                            data: {
                                type: c_pageNumPosition.PAGE_NUM_POSITION_BOTTOM,
                                subtype: c_pageNumPosition.PAGE_NUM_POSITION_RIGHT
                            }
                        }
                    ]),
                    itemTemplate: _.template('<div id="<%= id %>" class="item-pagenumber options__icon options__icon-huge <%= iconname %>"></div>')
                });
                _conf && this.mnuPageNumberPosPicker.setDisabled(_conf.disabled);

                this.mnuTablePicker = new Common.UI.DimensionPicker({
                    el: $('#id-toolbar-menu-tablepicker'),
                    minRows: 8,
                    minColumns: 10,
                    maxRows: 8,
                    maxColumns: 10
                });
            },

            onToolbarAfterRender: function(toolbar) {
                // DataView and pickers
                //
                var colorVal;
                if (this.btnHighlightColor.cmpEl) {
                    this.btnHighlightColor.currentColor = 'FFFF00';
                    this.btnHighlightColor.setColor(this.btnHighlightColor.currentColor);
                    this.mnuHighlightColorPicker = new Common.UI.ColorPalette({
                        el: $('#id-toolbar-menu-highlight'),
                        colors: [
                            'FFFF00', '00FF00', '00FFFF', 'FF00FF', '0000FF', 'FF0000', '00008B', '008B8B',
                            '006400', '800080', '8B0000', '808000', 'FFFFFF', 'D3D3D3', 'A9A9A9', '000000'
                        ]
                    });
                    this.mnuHighlightColorPicker.select('FFFF00');
                }

                if (this.btnFontColor.cmpEl) {
                    this.btnFontColor.setColor(this.btnFontColor.currentColor || 'transparent');
                    this.mnuFontColorPicker = new Common.UI.ThemeColorPalette({
                        el: $('#id-toolbar-menu-fontcolor')
                    });
                }

                if (this.btnParagraphColor.cmpEl) {
                    this.btnParagraphColor.setColor(this.btnParagraphColor.currentColor || 'transparent');
                    this.mnuParagraphColorPicker = new Common.UI.ThemeColorPalette({
                        el: $('#id-toolbar-menu-paracolor'),
                        transparent: true
                    });
                }

                if (this.btnContentControls.cmpEl) {
                    this.mnuControlsColorPicker = new Common.UI.ThemeColorPalette({
                        el: $('#id-toolbar-menu-controls-color'),
                        colors: ['000000', '993300', '333300', '003300', '003366', '000080', '333399', '333333', '800000', 'FF6600',
                            '808000', '00FF00', '008080', '0000FF', '666699', '808080', 'FF0000', 'FF9900', '99CC00', '339966',
                            '33CCCC', '3366FF', '800080', '999999', 'FF00FF', 'FFCC00', 'FFFF00', '00FF00', '00FFFF', '00CCFF',
                            '993366', 'C0C0C0', 'FF99CC', 'FFCC99', 'FFFF99', 'CCFFCC', 'CCFFFF', 'C9C8FF', 'CC99FF', 'FFFFFF'
                        ]
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

            setApi: function (api) {
                this.api = api;
                /** coauthoring begin **/
                this.api.asc_registerCallback('asc_onSendThemeColorSchemes', _.bind(this.onSendThemeColorSchemes, this));
                this.api.asc_registerCallback('asc_onCollaborativeChanges', _.bind(this.onCollaborativeChanges, this));
                this.api.asc_registerCallback('asc_onAuthParticipantsChanged', _.bind(this.onApiUsersChanged, this));
                this.api.asc_registerCallback('asc_onParticipantsChanged', _.bind(this.onApiUsersChanged, this));
                /** coauthoring end **/
                return this;
            },

            setMode: function (mode) {
                if (mode.isDisconnected) {
                    this.btnSave.setDisabled(true);
                    if (!mode.enableDownload)
                        this.btnPrint.setDisabled(true);
                }

                this.mode = mode;

                this.btnMailRecepients.setVisible(mode.canCoAuthoring == true && mode.canUseMailMerge);
                this.listStylesAdditionalMenuItem.setVisible(mode.canEditStyles);
                this.btnContentControls.menu.items[10].setVisible(mode.canEditContentControl);
                this.mnuInsertImage.items[2].setVisible(this.mode.canRequestInsertImage || this.mode.fileChoiceUrl && this.mode.fileChoiceUrl.indexOf("{documentType}")>-1);
            },

            onSendThemeColorSchemes: function (schemas) {
                var me = this;

                if (this.mnuColorSchema && this.mnuColorSchema.items.length > 0) {
                    _.each(this.mnuColorSchema.items, function (item) {
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
                    '<a id="<%= id %>"  tabindex="-1" type="menuitem" class="<%= options.cls %>">',
                    '<span class="colors">',
                    '<% _.each(options.colors, function(color) { %>',
                    '<span class="color" style="background: <%= color %>;"></span>',
                    '<% }) %>',
                    '</span>',
                    '<span class="text"><%= caption %></span>',
                    '</a>'
                ].join(''));

                _.each(schemas, function (schema, index) {
                    var colors = schema.get_colors();//schema.colors;
                    var schemecolors = [];
                    for (var j = 2; j < 7; j++) {
                        var clr = '#' + Common.Utils.ThemeColor.getHexColor(colors[j].get_r(), colors[j].get_g(), colors[j].get_b());
                        schemecolors.push(clr);
                    }

                    if (index == 22) {
                        this.mnuColorSchema.addItem({
                            caption: '--'
                        });
                    }
                    var name = schema.get_name();
                    this.mnuColorSchema.addItem({
                        template: itemTemplate,
                        cls: 'color-schemas-menu',
                        colors: schemecolors,
                        caption: (index < 22) ? (me.SchemeNames[index] || name) : name,
                        value: index,
                        checkable: true,
                        toggleGroup: 'menuSchema'
                    });
                }, this);
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

                this.btnSave.setDisabled(false);
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

                        this.btnSave.setDisabled(!me.mode.forcesave);
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

            onStyleMenuUpdate: function (item, e, eOpt) {
                var me = this;
                if (me.api) {
                    var style = me.api.asc_GetStyleFromFormatting();
                    var title = item.styleTitle;

                    var characterStyle = style.get_Link();
                    style.put_Name(title);
                    characterStyle.put_Name(title + '_character');
                    me.api.asc_AddNewStyle(style);
                    setTimeout(function () {
                        me.listStyles.openButton.menu.hide();
                    }, 100);
                }
            },

            onStyleMenuDelete: function (item, e, eOpt) {
                var me = this;
                if (me.api) {
                    this.api.asc_RemoveStyle(item.styleTitle);
                }
            },

            onStyleMenuRestoreAll: function (item, e, eOpt) {
                var me = this;
                if (me.api) {
                    _.each(window.styles.get_MergedStyles(), function (style) {
                        if (me.api.asc_IsStyleDefault(style.get_Name())) {
                            me.api.asc_RemoveStyle(style.get_Name());
                        }
                    });
                }
            },

            onStyleMenuDeleteAll: function (item, e, eOpt) {
                if (this.api)
                    this.api.asc_RemoveAllCustomStyles();
            },

            textBold: 'Bold',
            textItalic: 'Italic',
            textUnderline: 'Underline',
            textStrikeout: 'Strikeout',
            textSuperscript: 'Superscript',
            textSubscript: 'Subscript',
            strMenuNoFill: 'No Fill',
            tipFontName: 'Font Name',
            tipFontSize: 'Font Size',
            tipParagraphStyle: 'Paragraph Style',
            tipCopy: 'Copy',
            tipPaste: 'Paste',
            tipUndo: 'Undo',
            tipRedo: 'Redo',
            tipPrint: 'Print',
            tipSave: 'Save',
            tipIncFont: 'Increment font size',
            tipDecFont: 'Decrement font size',
            tipHighlightColor: 'Highlight color',
            tipFontColor: 'Font color',
            tipMarkers: 'Bullets',
            tipNumbers: 'Numbering',
            tipMultilevels: 'Outline',
            tipAlignLeft: 'Align Left',
            tipAlignRight: 'Align Right',
            tipAlignCenter: 'Align Center',
            tipAlignJust: 'Justified',
            tipDecPrLeft: 'Decrease Indent',
            tipIncPrLeft: 'Increase Indent',
            tipShowHiddenChars: 'Nonprinting Characters',
            tipLineSpace: 'Paragraph Line Spacing',
            tipPrColor: 'Background color',
            tipInsertTable: 'Insert Table',
            tipInsertImage: 'Insert Image',
            tipPageBreak: 'Insert Page or Section break',
            tipInsertNum: 'Insert Page Number',
            tipClearStyle: 'Clear Style',
            tipCopyStyle: 'Copy Style',
            tipPageSize: 'Page Size',
            tipPageOrient: 'Page Orientation',
            tipBack: 'Back',
            tipInsertShape: 'Insert Autoshape',
            tipInsertEquation: 'Insert Equation',
            mniImageFromFile: 'Image from File',
            mniImageFromUrl: 'Image from URL',
            mniCustomTable: 'Insert Custom Table',
            textTitleError: 'Error',
            textInsertPageNumber: 'Insert page number',
            textToCurrent: 'To Current Position',
            tipEditHeader: 'Edit header or footer',
            mniEditHeader: 'Edit Document Header',
            mniEditFooter: 'Edit Document Footer',
            mniHiddenChars: 'Nonprinting Characters',
            mniHiddenBorders: 'Hidden Table Borders',
            tipSynchronize: 'The document has been changed by another user. Please click to save your changes and reload the updates.',
            textNewColor: 'Add New Custom Color',
            textAutoColor: 'Automatic',
            tipInsertChart: 'Insert Chart',
            tipColorSchemas: 'Change Color Scheme',
            tipInsertText: 'Insert Text',
            tipInsertTextArt: 'Insert Text Art',
            mniEditDropCap: 'Drop Cap Settings',
            textNone: 'None',
            textInText: 'In Text',
            textInMargin: 'In Margin',
            tipDropCap: 'Insert drop cap',
            txtScheme1: 'Office',
            txtScheme2: 'Grayscale',
            txtScheme3: 'Apex',
            txtScheme4: 'Aspect',
            txtScheme5: 'Civic',
            txtScheme6: 'Concourse',
            txtScheme7: 'Equity',
            txtScheme8: 'Flow',
            txtScheme9: 'Foundry',
            txtScheme10: 'Median',
            txtScheme11: 'Metro',
            txtScheme12: 'Module',
            txtScheme13: 'Opulent',
            txtScheme14: 'Oriel',
            txtScheme15: 'Origin',
            txtScheme16: 'Paper',
            txtScheme17: 'Solstice',
            txtScheme18: 'Technic',
            txtScheme19: 'Trek',
            txtScheme20: 'Urban',
            txtScheme21: 'Verve',
            textInsPageBreak: 'Insert Page Break',
            textInsColumnBreak: 'Insert Column Break',
            textInsSectionBreak: 'Insert Section Break',
            textNextPage: 'Next Page',
            textContPage: 'Continuous Page',
            textEvenPage: 'Even Page',
            textOddPage: 'Odd Page',
            tipSaveCoauth: 'Save your changes for the other users to see them.',
            tipMailRecepients: 'Mail Merge',
            textStyleMenuUpdate: 'Update from select',
            textStyleMenuRestore: 'Restore to default',
            textStyleMenuDelete: 'Delete style',
            textStyleMenuRestoreAll: 'Restore all to default styles',
            textStyleMenuDeleteAll: 'Delete all custom styles',
            textStyleMenuNew: 'New style from selection',
            tipColumns: 'Insert columns',
            textColumnsOne: 'One',
            textColumnsTwo: 'Two',
            textColumnsThree: 'Three',
            textColumnsLeft: 'Left',
            textColumnsRight: 'Right',
            tipPageMargins: 'Page Margins',
            textMarginsLast: 'Last Custom',
            textMarginsNormal: 'Normal',
            textMarginsUsNormal: 'US Normal',
            textMarginsNarrow: 'Narrow',
            textMarginsModerate: 'Moderate',
            textMarginsWide: 'Wide',
            textPageMarginsCustom: 'Custom margins',
            textTop: 'Top: ',
            textLeft: 'Left: ',
            textBottom: 'Bottom: ',
            textRight: 'Right: ',
            textPageSizeCustom: 'Custom Page Size',
            textPortrait: 'Portrait',
            textLandscape: 'Landscape',
            textInsertPageCount: 'Insert number of pages',
            tipChangeChart: 'Change Chart Type',
            capBtnInsPagebreak: 'Page Break',
            capBtnInsImage: 'Image',
            capBtnInsTable: 'Table',
            capBtnInsChart: 'Chart',
            textTabFile: 'File',
            textTabHome: 'Home',
            textTabInsert: 'Insert',
            textTabLayout: 'Layout',
            textTabReview: 'Review',
            capBtnInsShape: 'Shape',
            capBtnInsTextbox: 'Text Box',
            capBtnInsTextart: 'Text Art',
            capBtnInsDropcap: 'Drop Cap',
            capBtnInsEquation: 'Equation',
            capBtnInsHeader: 'Header/Footer',
            capBtnColumns: 'Columns',
            capBtnPageOrient: 'Orientation',
            capBtnMargins: 'Margins',
            capBtnPageSize: 'Size',
            tipImgAlign: 'Align objects',
            tipImgGroup: 'Group objects',
            tipImgWrapping: 'Wrap text',
            tipSendForward: 'Bring forward',
            tipSendBackward: 'Send backward',
            capImgAlign: 'Align',
            capImgGroup: 'Group',
            capImgForward: 'Bring Forward',
            capImgBackward: 'Send Backward',
            capImgWrapping: 'Wrapping',
            capBtnComment: 'Comment',
            textColumnsCustom: 'Custom Columns',
            textTabCollaboration: 'Collaboration',
            textTabProtect: 'Protection',
            textTabLinks: 'References',
            capBtnInsControls: 'Content Control',
            textRichControl: 'Rich text',
            textPlainControl: 'Plain text',
            textRemoveControl: 'Remove',
            mniEditControls: 'Settings',
            tipControls: 'Insert content control',
            mniHighlightControls: 'Highlight settings',
            textNoHighlight: 'No highlighting',
            mniImageFromStorage: 'Image from Storage',
            capBtnBlankPage: 'Blank Page',
            tipBlankPage: 'Insert blank page',
            txtDistribHor: 'Distribute Horizontally',
            txtDistribVert: 'Distribute Vertically',
            txtPageAlign: 'Align to Page',
            txtMarginAlign: 'Align to Margin',
            txtObjectsAlign: 'Align Selected Objects',
            capBtnWatermark: 'Watermark',
            textEditWatermark: 'Custom Watermark',
            textRemWatermark: 'Remove Watermark',
            tipWatermark: 'Edit watermark',
            textPictureControl: 'Picture',
            textComboboxControl: 'Combo box',
            textCheckboxControl: 'Check box',
            textDropdownControl: 'Drop-down list',
            textDateControl: 'Date',
            capBtnAddComment: 'Add Comment',
            capBtnInsSymbol: 'Symbol',
            tipInsertSymbol: 'Insert symbol',
            mniDrawTable: 'Draw Table',
            mniEraseTable: 'Erase Table',
            textListSettings: 'List Settings',
            capBtnDateTime: 'Date & Time',
            tipDateTime: 'Insert current date and time',
            capBtnLineNumbers: 'Line Numbers',
            textContinuous: 'Continuous',
            textRestartEachPage: 'Restart Each Page',
            textRestartEachSection: 'Restart Each Section',
            textSuppressForCurrentParagraph: 'Suppress for Current Paragraph',
            textCustomLineNumbers: 'Line Numbering Options',
            tipLineNumbers: 'Show line numbers',
            tipChangeCase: 'Change case',
            mniSentenceCase: 'Sentence case.',
            mniLowerCase: 'lowercase',
            mniUpperCase: 'UPPERCASE',
            mniCapitalizeWords: 'Capitalize Each Word',
            mniToggleCase: 'tOGGLE cASE',
            textChangeLevel: 'Change List Level',
            mniTextToTable: 'Convert Text to Table',
            txtScheme22: 'New Office'
        }
    })(), DE.Views.Toolbar || {}));
});
