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
 *  HeaderFooterDialog.js
 *
 *  Created on 10/11/18
 *
 */


define([], function () { 'use strict';

    SSE.Views.HeaderFooterDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 650,
            style: 'min-width: 350px;',
            cls: 'modal-dlg enable-key-events',
            animate: {mask: false},
            buttons: ['ok', 'cancel'],
            id: 'window-header-footer'
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.api = this.options.api;
            this.props = this.options.props;
            this.fontStore = this.options.fontStore;
            this.pageSetup = this.options.pageSetup;
            this.isFooter = false;
            this.currentCanvas = null;
            this.headerControls = [];
            this.footerControls = [];
            this._state = {
                clrtext: undefined,
                bold: undefined,
                italic: undefined,
                underline: undefined,
                strikeout: undefined,
                subscript: undefined,
                superscript: undefined,
                fontsize: undefined,
                fontname: ''
            };

            this.template = [
                '<div class="box">',
                    '<table cols="2" style="width: 450px;margin-bottom: 30px;">',
                        '<tr>',
                            '<td style="padding-bottom: 8px;">',
                                '<div id="id-dlg-hf-ch-first"></div>',
                            '</td>',
                            '<td style="padding-bottom: 8px;">',
                                '<div id="id-dlg-hf-ch-scale"></div>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td>',
                                '<div id="id-dlg-hf-ch-odd"></div>',
                            '</td>',
                            '<td>',
                                '<div id="id-dlg-hf-ch-align"></div>',
                            '</td>',
                        '</tr>',
                    '</table>',
                    '<div class="input-row input-row-tabs" style="margin-bottom: 15px;">',
                        '<button type="button" class="btn btn-text-default auto" id="id-dlg-hf-btn-all" style="border-radius: 0;">', this.textAll,'</button>',
                        '<button type="button" class="btn btn-text-default auto hidden" id="id-dlg-hf-btn-odd" style="border-radius: 0;">', this.textOdd,'</button>',
                        '<button type="button" class="btn btn-text-default auto hidden" id="id-dlg-hf-btn-even" style="border-radius: 0;">', this.textEven,'</button>',
                        '<button type="button" class="btn btn-text-default auto hidden" id="id-dlg-hf-btn-first" style="border-radius: 0;">', this.textFirst,'</button>',
                    '</div>',
                    '<label style="display: block; margin-bottom: 3px;">' + this.textHeader + '</label>',
                    '<div id="id-dlg-h-presets" class="input-row" style="display: inline-block; vertical-align: middle;"></div>',
                    '<div id="id-dlg-h-insert" class="input-row margin-left-2" style="display: inline-block; vertical-align: middle;"></div>',
                    '<div id="id-dlg-h-fonts" class="input-row margin-left-2" style="display: inline-block; vertical-align: middle;"></div>',
                    '<div id="id-dlg-h-font-size" class="input-row margin-left-2" style="display: inline-block; vertical-align: middle;"></div>',
                    '<div id="id-dlg-h-textcolor" class="margin-left-6" style="display: inline-block;"></div>',
                    '<div id="id-dlg-h-bold" class="margin-left-2" style="display: inline-block;"></div>','<div id="id-dlg-h-italic" class="margin-left-6" style="display: inline-block;"></div>',
                    '<div id="id-dlg-h-underline" class="margin-left-6" style="display: inline-block;"></div>','<div id="id-dlg-h-strikeout" class="margin-left-6" style="display: inline-block;"></div>',
                    '<div id="id-dlg-h-subscript" class="margin-left-6" style="display: inline-block;"></div>','<div id="id-dlg-h-superscript" class="margin-left-6" style="display: inline-block;"></div>',
                        '<div class="preview-container" style="display: inline-block;margin-top: 7px;vertical-align: middle;">',
                            '<div class="preview-canvas-container" style="width: 206px; height: 92px; position:relative; overflow:hidden;">',
                                '<div id="header-left-img" style="width: 190px; height: 100%;"></div>',
                            '</div>',
                        '</div>',
                        '<div class="preview-container" style="display: inline-block;margin-top: 7px;vertical-align: middle;">',
                            '<div class="preview-canvas-container" style="width: 206px; height: 92px; position:relative; overflow:hidden;">',
                                '<div id="header-center-img" style="width: 190px; height: 100%;"></div>',
                            '</div>',
                        '</div>',
                        '<div style="display: inline-block;margin-top: 7px;vertical-align: middle;">',
                            '<div class="preview-canvas-container" style="width: 206px; height: 92px; position:relative; overflow:hidden;">',
                                '<div id="header-right-img" style="width: 190px; height: 100%;"></div>',
                            '</div>',
                        '</div>',
                    '<label style="display: block; margin-top: 10px;margin-bottom: 3px;">' + this.textFooter + '</label>',
                    '<div id="id-dlg-f-presets" class="input-row" style="display: inline-block; vertical-align: middle;"></div>',
                    '<div id="id-dlg-f-insert" class="input-row margin-left-2" style="display: inline-block; vertical-align: middle;"></div>',
                    '<div id="id-dlg-f-fonts" class="input-row margin-left-2" style="display: inline-block; vertical-align: middle;"></div>',
                    '<div id="id-dlg-f-font-size" class="input-row margin-left-2" style="display: inline-block; vertical-align: middle;"></div>',
                    '<div id="id-dlg-f-textcolor" class="margin-left-6" style="display: inline-block;"></div>',
                    '<div id="id-dlg-f-bold" class="margin-left-2" style="display: inline-block;"></div>','<div id="id-dlg-f-italic" class="margin-left-6" style="display: inline-block;"></div>',
                    '<div id="id-dlg-f-underline" class="margin-left-6" style="display: inline-block;"></div>','<div class="margin-left-6" id="id-dlg-f-strikeout" style="display: inline-block;"></div>',
                    '<div id="id-dlg-f-subscript" class="margin-left-6" style="display: inline-block;"></div>','<div id="id-dlg-f-superscript" class="margin-left-6" style="display: inline-block;"></div>',
                        '<div class="preview-container" style="display: inline-block;margin-top: 7px;vertical-align: middle;">',
                            '<div class="preview-canvas-container" style="width: 206px; height: 92px; position:relative; overflow:hidden;">',
                                '<div id="footer-left-img" style="width: 190px; height: 100%;"></div>',
                            '</div>',
                        '</div>',
                        '<div class="preview-container" style="display: inline-block;margin-top: 7px;vertical-align: middle;">',
                            '<div class="preview-canvas-container" style="width: 206px; height: 92px; position:relative; overflow:hidden;">',
                                '<div id="footer-center-img" style="width: 190px; height: 100%;"></div>',
                            '</div>',
                        '</div>',
                        '<div style="display: inline-block;margin-top: 7px;vertical-align: middle;">',
                            '<div class="preview-canvas-container" style="width: 206px; height: 92px; position:relative; overflow:hidden;">',
                                '<div id="footer-right-img" style="width: 190px; height: 100%;"></div>',
                            '</div>',
                        '</div>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);
            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var me = this,
                $window = this.getChild();

            this.chFirstPage = new Common.UI.CheckBox({
                el: $('#id-dlg-hf-ch-first'),
                labelText: this.textDiffFirst
            });
            this.chFirstPage.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                var checked = (field.getValue()=='checked');
                var id = (this.HFObject) ? this.HFObject.setDifferentFirst(checked) : null;
                if (id)  {
                    var me = this;
                    this.showError(function() {
                        field.setValue(!checked, true);
                        _.delay(function(){
                            me.onCanvasClick(id);
                        },50);
                    });
                    return;
                }

                this.btnFirst.setVisible(checked);
                if (!checked && this.btnFirst.isActive())
                    (this.btnAll.isVisible()) ? this.btnAll.toggle(true) : this.btnOdd.toggle(true);
            }, this));

            this.chOddPage = new Common.UI.CheckBox({
                el: $('#id-dlg-hf-ch-odd'),
                labelText: this.textDiffOdd
            });
            this.chOddPage.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                var checked = (field.getValue()=='checked');
                var id = (this.HFObject) ? this.HFObject.setDifferentOddEven(checked) : null;
                if (id)  {
                    var me = this;
                    this.showError(function() {
                        field.setValue(!checked, true);
                        _.delay(function(){
                            me.onCanvasClick(id);
                        },50);
                    });
                    return;
                }

                this.btnOdd.setVisible(checked);
                this.btnEven.setVisible(checked);
                this.btnAll.setVisible(!checked);
                if (!checked && (this.btnOdd.isActive() || this.btnEven.isActive()))
                    this.btnAll.toggle(true);
                if (checked && this.btnAll.isActive())
                    this.btnOdd.toggle(true);
            }, this));

            this.chScale = new Common.UI.CheckBox({
                el: $('#id-dlg-hf-ch-scale'),
                labelText: this.textScale
            });
            this.chScale.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                var checked = (field.getValue()=='checked');
                if (this.HFObject)
                    this.HFObject.setScaleWithDoc(checked);
            }, this));

            this.chAlign = new Common.UI.CheckBox({
                el: $('#id-dlg-hf-ch-align'),
                labelText: this.textAlign
            });
            this.chAlign.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                var checked = (field.getValue()=='checked');
                if (this.HFObject)
                    this.HFObject.setAlignWithMargins(checked);
            }, this));

            this.btnAll = new Common.UI.Button({
                el: $('#id-dlg-hf-btn-all'),
                enableToggle: true,
                toggleGroup: 'hf-pages',
                allowDepress: false,
                pressed: true
            });
            this.btnAll.on('toggle', _.bind(this.onPageTypeToggle, this, Asc.c_oAscHeaderFooterType.odd));

            this.btnOdd = new Common.UI.Button({
                el: $('#id-dlg-hf-btn-odd'),
                enableToggle: true,
                toggleGroup: 'hf-pages',
                allowDepress: false
            });
            this.btnOdd.on('toggle', _.bind(this.onPageTypeToggle, this, Asc.c_oAscHeaderFooterType.odd));

            this.btnEven = new Common.UI.Button({
                el: $('#id-dlg-hf-btn-even'),
                enableToggle: true,
                toggleGroup: 'hf-pages',
                allowDepress: false
            });
            this.btnEven.on('toggle', _.bind(this.onPageTypeToggle, this, Asc.c_oAscHeaderFooterType.even));

            this.btnFirst = new Common.UI.Button({
                el: $('#id-dlg-hf-btn-first'),
                enableToggle: true,
                toggleGroup: 'hf-pages',
                allowDepress: false
            });
            this.btnFirst.on('toggle', _.bind(this.onPageTypeToggle, this, Asc.c_oAscHeaderFooterType.first));

            this.btnPresetsH = new Common.UI.Button({
                parentEl: $('#id-dlg-h-presets'),
                cls: 'btn-text-menu-default',
                caption: this.textPresets,
                style: 'width: 122px;',
                menu: true
            });

            this.btnPresetsF = new Common.UI.Button({
                parentEl: $('#id-dlg-f-presets'),
                cls: 'btn-text-menu-default',
                caption: this.textPresets,
                style: 'width: 122px;',
                menu: true
            });

            var data = [
                {caption: this.textPageNum, value: Asc.c_oAscHeaderFooterField.pageNumber},
                {caption: this.textPageCount, value: Asc.c_oAscHeaderFooterField.pageCount},
                {caption: this.textDate, value: Asc.c_oAscHeaderFooterField.date},
                {caption: this.textTime, value: Asc.c_oAscHeaderFooterField.time},
                {caption: this.textFileName, value: Asc.c_oAscHeaderFooterField.fileName},
                {caption: this.textSheet, value: Asc.c_oAscHeaderFooterField.sheetName},
                {caption: this.textImage, value: Asc.c_oAscHeaderFooterField.picture}
            ];

            this.btnInsertH = new Common.UI.Button({
                parentEl: $('#id-dlg-h-insert'),
                cls: 'btn-text-menu-default',
                caption: this.textInsert,
                style: 'width: 120px;',
                menu: new Common.UI.Menu({
                    style: 'min-width: 120px;',
                    maxHeight: 200,
                    additionalAlign: this.menuAddAlign,
                    items: data
                })
            });
            this.btnInsertH.menu.on('item:click', _.bind(this.onObjectSelect, this));
            this.headerControls.push(this.btnInsertH);

            this.btnInsertF = new Common.UI.Button({
                parentEl: $('#id-dlg-f-insert'),
                cls: 'btn-text-menu-default',
                caption: this.textInsert,
                style: 'width: 120px;',
                menu: new Common.UI.Menu({
                    style: 'min-width: 120px;',
                    maxHeight: 200,
                    additionalAlign: this.menuAddAlign,
                    items: data
                })
            });
            this.btnInsertF.menu.on('item:click', _.bind(this.onObjectSelect, this));
            this.footerControls.push(this.btnInsertF);

            this.cmbFonts = [];
            this.cmbFonts.push(new Common.UI.ComboBoxFonts({
                el          : $('#id-dlg-h-fonts'),
                cls         : 'input-group-nr',
                style       : 'width: 130px;',
                menuCls     : 'scrollable-menu',
                menuStyle   : 'min-width: 100%;max-height: 270px;',
                store       : new Common.Collections.Fonts(),
                recent      : 0,
                hint        : this.tipFontName
            }));
            this.cmbFonts[0].on('selected', _.bind(this.onFontSelect, this));
            this.cmbFonts[0].setValue(this._state.fontname);
            this.headerControls.push(this.cmbFonts[0]);

            this.cmbFonts.push(new Common.UI.ComboBoxFonts({
                el          : $('#id-dlg-f-fonts'),
                cls         : 'input-group-nr',
                style       : 'width: 130px;',
                menuCls     : 'scrollable-menu',
                menuStyle   : 'min-width: 100%;max-height: 270px;',
                store       : new Common.Collections.Fonts(),
                recent      : 0,
                hint        : this.tipFontName
            }));
            this.cmbFonts[1].on('selected', _.bind(this.onFontSelect, this));
            this.cmbFonts[1].setValue(this._state.fontname);
            this.footerControls.push(this.cmbFonts[1]);
            Common.NotificationCenter.on('fonts:change', _.bind(this.onApiChangeFont, this));

            data = [
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
            ];
            this.cmbFontSize = [];
            this.cmbFontSize.push(new Common.UI.ComboBox({
                el: $('#id-dlg-h-font-size'),
                cls: 'input-group-nr',
                style: 'width: 45px;',
                menuCls     : 'scrollable-menu',
                menuStyle: 'min-width: 45px;max-height: 270px;',
                hint: this.tipFontSize,
                data: data
            }));
            this.cmbFontSize[0].on('selected', _.bind(this.onFontSizeSelect, this));
            this.cmbFontSize[0].on('changed:before', _.bind(this.onFontSizeChanged, this, true));
            this.cmbFontSize[0].on('changed:after',  _.bind(this.onFontSizeChanged, this, false));

            this.cmbFontSize[0].setValue(this._state.fontsize);
            this.headerControls.push(this.cmbFontSize[0]);

            this.cmbFontSize.push(new Common.UI.ComboBox({
                el: $('#id-dlg-f-font-size'),
                cls: 'input-group-nr',
                style: 'width: 45px;',
                menuCls     : 'scrollable-menu',
                menuStyle: 'min-width: 45px;max-height: 270px;',
                hint: this.tipFontSize,
                data: data
            }));
            this.cmbFontSize[1].on('selected', _.bind(this.onFontSizeSelect, this));
            this.cmbFontSize[1].on('changed:before', _.bind(this.onFontSizeChanged, this, true));
            this.cmbFontSize[1].on('changed:after',  _.bind(this.onFontSizeChanged, this, false));
            this.cmbFontSize[1].setValue(this._state.fontsize);
            this.footerControls.push(this.cmbFontSize[1]);

            this.btnBold = [];
            this.btnBold.push(new Common.UI.Button({
                parentEl: $('#id-dlg-h-bold'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-bold',
                enableToggle: true,
                hint: this.textBold
            }));
            this.btnBold[0].on('click', _.bind(this.onBoldClick, this));
            this.headerControls.push(this.btnBold[0]);

            this.btnBold.push(new Common.UI.Button({
                parentEl: $('#id-dlg-f-bold'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-bold',
                enableToggle: true,
                hint: this.textBold
            }));
            this.btnBold[1].on('click', _.bind(this.onBoldClick, this));
            this.footerControls.push(this.btnBold[1]);

            this.btnItalic = [];
            this.btnItalic.push(new Common.UI.Button({
                parentEl: $('#id-dlg-h-italic'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-italic',
                enableToggle: true,
                hint: this.textItalic
            }));
            this.btnItalic[0].on('click', _.bind(this.onItalicClick, this));
            this.headerControls.push(this.btnItalic[0]);

            this.btnItalic.push(new Common.UI.Button({
                parentEl: $('#id-dlg-f-italic'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-italic',
                enableToggle: true,
                hint: this.textItalic
            }));
            this.btnItalic[1].on('click', _.bind(this.onItalicClick, this));
            this.footerControls.push(this.btnItalic[1]);

            this.btnUnderline = [];
            this.btnUnderline.push(new Common.UI.Button({
                parentEl: $('#id-dlg-h-underline'),
                cls         : 'btn-toolbar',
                iconCls     : 'toolbar__icon btn-underline',
                enableToggle: true,
                hint: this.textUnderline
            }));
            this.btnUnderline[0].on('click', _.bind(this.onUnderlineClick, this));
            this.headerControls.push(this.btnUnderline[0]);

            this.btnUnderline.push(new Common.UI.Button({
                parentEl: $('#id-dlg-f-underline'),
                cls         : 'btn-toolbar',
                iconCls     : 'toolbar__icon btn-underline',
                enableToggle: true,
                hint: this.textUnderline
            }));
            this.btnUnderline[1].on('click', _.bind(this.onUnderlineClick, this));
            this.footerControls.push(this.btnUnderline[1]);

            this.btnStrikeout = [];
            this.btnStrikeout.push(new Common.UI.Button({
                parentEl: $('#id-dlg-h-strikeout'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-strikeout',
                enableToggle: true,
                hint: this.textStrikeout
            }));
            this.btnStrikeout[0].on('click',_.bind(this.onStrikeoutClick, this));
            this.headerControls.push(this.btnStrikeout[0]);

            this.btnStrikeout.push(new Common.UI.Button({
                parentEl: $('#id-dlg-f-strikeout'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-strikeout',
                enableToggle: true,
                hint: this.textStrikeout
            }));
            this.btnStrikeout[1].on('click',_.bind(this.onStrikeoutClick, this));
            this.footerControls.push(this.btnStrikeout[1]);

            this.btnSuperscript = [];
            this.btnSuperscript.push(new Common.UI.Button({
                parentEl: $('#id-dlg-h-superscript'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-superscript',
                enableToggle: true,
                toggleGroup: 'superscriptHFGroup',
                hint: this.textSuperscript
            }));
            this.btnSuperscript[0].on('click', _.bind(this.onSuperscriptClick, this));
            this.headerControls.push(this.btnSuperscript[0]);

            this.btnSuperscript.push(new Common.UI.Button({
                parentEl: $('#id-dlg-f-superscript'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-superscript',
                enableToggle: true,
                toggleGroup: 'superscriptHFGroup',
                hint: this.textSuperscript
            }));
            this.btnSuperscript[1].on('click', _.bind(this.onSuperscriptClick, this));
            this.footerControls.push(this.btnSuperscript[1]);

            this.btnSubscript = [];
            this.btnSubscript.push(new Common.UI.Button({
                parentEl: $('#id-dlg-h-subscript'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-subscript',
                enableToggle: true,
                toggleGroup: 'superscriptHFGroup',
                hint: this.textSubscript
            }));
            this.btnSubscript[0].on('click', _.bind(this.onSubscriptClick, this));
            this.headerControls.push(this.btnSubscript[0]);

            this.btnSubscript.push(new Common.UI.Button({
                parentEl: $('#id-dlg-f-subscript'),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon btn-subscript',
                enableToggle: true,
                toggleGroup: 'superscriptHFGroup',
                hint: this.textSubscript
            }));
            this.btnSubscript[1].on('click', _.bind(this.onSubscriptClick, this));
            this.footerControls.push(this.btnSubscript[1]);

            var initNewColor = function(btn) {
                btn.setMenu();
                btn.currentColor = '000000';
                btn.setColor(btn.currentColor);
                var picker = btn.getPicker();
                picker.currentColor = btn.currentColor;
                btn.on('color:select', _.bind(me.onColorSelect, me));
                return picker;
            };
            this.btnTextColor = [];
            this.btnTextColor.push(new Common.UI.ButtonColored({
                parentEl: $('#id-dlg-h-textcolor'),
                cls         : 'btn-toolbar',
                iconCls     : 'toolbar__icon btn-fontcolor',
                hint        : this.textColor,
                split       : true,
                additionalAlign: this.menuAddAlign,
                menu        : true
            }));
            this.btnTextColor[0].on('click', _.bind(this.onTextColor, this));

            this.mnuTextColorPicker = [];
            this.mnuTextColorPicker.push(initNewColor(this.btnTextColor[0]));
            this.headerControls.push(this.btnTextColor[0]);

            this.btnTextColor.push(new Common.UI.ButtonColored({
                parentEl: $('#id-dlg-f-textcolor'),
                cls         : 'btn-toolbar',
                iconCls     : 'toolbar__icon btn-fontcolor',
                hint        : this.textColor,
                split       : true,
                additionalAlign: this.menuAddAlign,
                menu        : true
            }));
            this.btnTextColor[1].on('click', _.bind(this.onTextColor, this));
            this.mnuTextColorPicker.push(initNewColor(this.btnTextColor[1]));
            this.footerControls.push(this.btnTextColor[1]);

            this.btnOk = _.find(this.getFooterButtons(), function (item) {
                return (item.$el && item.$el.find('.primary').addBack().filter('.primary').length>0);
            }) || new Common.UI.Button({ el: $window.find('.primary') });

            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

            this.scrollers = [];
            this.initCanvas('#header-left-img');
            this.initCanvas('#header-center-img');
            this.initCanvas('#header-right-img');
            this.initCanvas('#footer-left-img');
            this.initCanvas('#footer-center-img');
            this.initCanvas('#footer-right-img');

            this.wrapEvents = {
                onApiEditorSelectionChanged: _.bind(this.onApiEditorSelectionChanged, this),
                onApiResizeEditorHeight: _.bind(this.onApiResizeEditorHeight, this),
                onUpdateEditorCursorPosition: _.bind(this.onUpdateEditorCursorPosition, this)
            };

            this.afterRender();
        },

        initCanvas: function(name) {
            var el = this.$window.find(name);
            el.on('click', _.bind(this.onCanvasClick, this, name));
            this.canvasBoxHeight = el.height();
            this.scrollers[name] = new Common.UI.Scroller({
                el: el.parent(),
                minScrollbarLength  : 20
            });
            this.scrollers[name].update();
            this.scrollers[name].scrollTop(0);
        },

        show: function() {
            Common.UI.Window.prototype.show.apply(this, arguments);
        },

        close: function() {
            this.api.asc_unregisterCallback('asc_onEditorSelectionChanged', this.wrapEvents.onApiEditorSelectionChanged);
            this.api.asc_unregisterCallback('asc_resizeEditorHeight', this.wrapEvents.onApiResizeEditorHeight);
            this.api.asc_unregisterCallback('asc_updateEditorCursorPosition', this.wrapEvents.onUpdateEditorCursorPosition);

            Common.UI.Window.prototype.close.apply(this, arguments);

            if (this.HFObject)
                this.HFObject.destroy(false, this.pageSetup);
        },

        afterRender: function () {
            this.api.asc_registerCallback('asc_onEditorSelectionChanged', this.wrapEvents.onApiEditorSelectionChanged);
            this.api.asc_registerCallback('asc_resizeEditorHeight', this.wrapEvents.onApiResizeEditorHeight);
            this.api.asc_registerCallback('asc_updateEditorCursorPosition', this.wrapEvents.onUpdateEditorCursorPosition);

            this.cmbFonts[0].fillFonts(this.fontStore);
            this.cmbFonts[1].fillFonts(this.fontStore);
            this.updateThemeColors();

            this.HFObject = new Asc.asc_CHeaderFooterEditor(['header-left-img', 'header-center-img', 'header-right-img', 'footer-left-img', 'footer-center-img', 'footer-right-img'], 205, undefined, this.pageSetup);
            this._setDefaults(this.props);
            this.editorCanvas = this.$window.find('#ce-canvas-menu');
            var me = this;
            _.delay(function(){
                me.onCanvasClick('#header-left-img');
            },500);
        },

        _setDefaults: function (props) {
            var presets = [];
            this.HFObject.getTextPresetsArr().forEach(function(item, index){
                presets.push({caption: item, value: index});
            });

            this.btnPresetsH.setMenu(new Common.UI.Menu({
                style: 'min-width: 115px;',
                maxHeight: 200,
                additionalAlign: this.menuAddAlign,
                items: presets
            }));
            this.btnPresetsH.menu.on('item:click', _.bind(this.onPresetSelect, this, false));
            this.btnPresetsF.setMenu(new Common.UI.Menu({
                style: 'min-width: 115px;',
                maxHeight: 200,
                additionalAlign: this.menuAddAlign,
                items: presets
            }));
            this.btnPresetsF.menu.on('item:click', _.bind(this.onPresetSelect, this, true));

            this.chOddPage.setValue(this.HFObject.getDifferentOddEven());
            this.chFirstPage.setValue(this.HFObject.getDifferentFirst());
            this.chAlign.setValue(this.HFObject.getAlignWithMargins());
            this.chScale.setValue(this.HFObject.getScaleWithDoc());

            var value = (this.chOddPage.getValue() == 'checked');
            this.btnOdd.setVisible(value);
            this.btnEven.setVisible(value);
            this.btnAll.setVisible(!value);
            value ? this.btnOdd.toggle(true) : this.btnAll.toggle(true);

            value = (this.chFirstPage.getValue() == 'checked');
            this.btnFirst.setVisible(value);
        },

        updateThemeColors: function() {
            this.mnuTextColorPicker[0].updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
            this.mnuTextColorPicker[1].updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
        },

        getSettings: function () {
            var props = {};
            return props;
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        onPrimary: function(event) {
            this._handleInput('ok');
            return false;
        },

        _handleInput: function(state) {
            if (this.HFObject) {
                var id = this.HFObject.destroy(state=='ok', this.pageSetup);
                if (id)  {
                    var me = this;
                    this.showError(function() {
                        _.delay(function(){
                            me.onCanvasClick(id);
                        },50);
                    });
                    return;
                }
                this.HFObject = null;
            }
            if (this.options.handler) {
                this.options.handler.call(this, this, state);
            }
            this.close();
        },

        showError: function(callback) {
            Common.UI.warning({
                title: this.notcriticalErrorTitle,
                msg  : this.textMaxError,
                callback: callback
            });
        },

        scrollerUpdate: function() {
            for (var name in this.scrollers) {
                this.scrollers[name] && this.scrollers[name].update();
            }
        },

        scrollerScrollTop: function() {
            for (var name in this.scrollers) {
                this.scrollers[name] && this.scrollers[name].scrollTop(0);
            }
        },

        onCanvasClick: function(id, event){
            if (!this.HFObject) return;
            id = id || '#header-left-img';
            var diff = (this.currentCanvas !== id);
            if (diff) {
                this.currentCanvas = id;
                this.isFooter = (id == '#footer-left-img' || id == '#footer-center-img' || id == '#footer-right-img');

                var me = this;
                this.headerControls.forEach(function(item){
                    item.setDisabled(me.isFooter);
                });
                this.footerControls.forEach(function(item){
                    item.setDisabled(!me.isFooter);
                });
            }

            if (event) {
                this.HFObject.click(id, event.pageX, event.pageY);
            } else
                this.HFObject.click(id);

            diff && this.scrollerUpdate();
        },

        onApiResizeEditorHeight: function(event) {
            if (!this.editorCanvas) return;
            var height = this.editorCanvas.height();
            if (height == this.editorCanvasHeight) return;
            this.editorCanvasHeight = height;

            if (this.scrollers[this.currentCanvas])
                this.scrollers[this.currentCanvas].update();
        },

        onUpdateEditorCursorPosition: function(pos, height) {
            if (!this.editorCanvas) return;
            var id = this.currentCanvas;
            if (this.scrollers[id]) {
                var top = this.scrollers[id].getScrollTop();
                if (pos + height>top+this.canvasBoxHeight)
                    this.scrollers[id].scrollTop(pos + height - this.canvasBoxHeight);
                else if (pos<top)
                    this.scrollers[id].scrollTop(pos);
            }
        },

        onPresetSelect: function(footer, menu, item) {
            if (this.HFObject)
                this.HFObject.applyPreset(item.value, !!footer);
            this.onCanvasClick(footer ? '#footer-left-img' : '#header-left-img');
        },

        onObjectSelect: function(menu, item) {
            if (this.HFObject)
                this.HFObject.addField(item.value);
            this.onCanvasClick(this.currentCanvas);
        },

        onFontSelect: function(combo, record) {
            if (this.HFObject)
                this.HFObject.setFontName(record.name);
            this.onCanvasClick(this.currentCanvas);
        },

        onFontSizeSelect: function(combo, record) {
            if (this.HFObject)
                this.HFObject.setFontSize(record.value);
            this.onCanvasClick(this.currentCanvas);
        },

        onFontSizeChanged: function(before, combo, record, e) {
            var value,
                me = this;

            if (before) {
                var item = combo.store.findWhere({
                    displayValue: record.value
                });

                if (!item) {
                    value = /^\+?(\d*(\.|,)?\d+)$|^\+?(\d+(\.|,)?\d*)$/.exec(record.value);

                    if (!value) {
                        value = combo.getValue();
                        combo.setRawValue(value);
                        e.preventDefault();
                        return false;
                    }
                }
            } else {
                value = Common.Utils.String.parseFloat(record.value);
                value = value > 409 ? 409 :
                    value < 1 ? 1 : Math.floor((value+0.4)*2)/2;

                combo.setRawValue(value);
                if (this.HFObject)
                    this.HFObject.setFontSize(value);
            }
        },

        onBoldClick: function(btn, e) {
            if (this.HFObject) {
                this.HFObject.setBold(btn.pressed);
                this.scrollerUpdate();
            }
        },

        onItalicClick: function(btn, e) {
            if (this.HFObject) {
                this.HFObject.setItalic(btn.pressed);
                this.scrollerUpdate();
            }
        },

        onUnderlineClick: function(btn, e) {
            if (this.HFObject) {
                this.HFObject.setUnderline(btn.pressed);
                this.scrollerUpdate();
            }
        },

        onStrikeoutClick: function(btn, e) {
            if (this.HFObject) {
                this.HFObject.setStrikeout(btn.pressed);
                this.scrollerUpdate();
            }
        },

        onSuperscriptClick: function(btn, e) {
            if (this.HFObject) {
                this.HFObject.setSuperscript(btn.pressed);
                this.scrollerUpdate();
            }
        },

        onSubscriptClick: function(btn, e) {
            if (this.HFObject) {
                this.HFObject.setSubscript(btn.pressed);
                this.scrollerUpdate();
            }
        },

        onTextColor: function() {
            var mnuTextColorPicker = this.mnuTextColorPicker[this.isFooter ? 1 : 0];
            mnuTextColorPicker.trigger('select', mnuTextColorPicker, mnuTextColorPicker.currentColor, true);
        },

        onColorSelect: function(btn, color) {
            btn.currentColor = color;
            btn.colorPicker.currentColor = color;
            if (this.HFObject)
                this.HFObject.setTextColor(Common.Utils.ThemeColor.getRgbColor(color));
            this.onCanvasClick(this.currentCanvas);
        },

        onPageTypeToggle: function(type, btn, state) {
            if (this._pagetype) return;

            if (state && this.HFObject) {
                var prev = this.HFObject.getPageType(),
                    id = this.HFObject.switchHeaderFooterType(type);
                if (id)  {
                    this._pagetype = true;
                    var me = this;
                    this.showError(function() {
                        switch (prev) {
                            case Asc.c_oAscHeaderFooterType.odd:
                                me.btnOdd.isVisible() ? me.btnOdd.toggle(true) : me.btnAll.toggle(true);
                                break;
                            case Asc.c_oAscHeaderFooterType.even:
                                me.btnEven.toggle(true);
                                break;
                            case Asc.c_oAscHeaderFooterType.first:
                                me.btnFirst.toggle(true);
                                break;
                        }
                        _.delay(function(){
                            me.onCanvasClick(id);
                        },50);
                        me._pagetype = false;
                    });
                    return;
                }

                this.scrollerScrollTop();
                this.onCanvasClick(this.currentCanvas, undefined, true);
            }
        },

        onApiChangeFont: function(font) {
            this.cmbFonts[this.isFooter ? 1 : 0].onApiChangeFont(font);
        },

        onApiEditorSelectionChanged: function(fontobj) {
            var idx = this.isFooter ? 1 : 0,
                val;

            /* read font name */
            var fontparam = fontobj.asc_getFontName();
            if (fontparam != this.cmbFonts[idx].getValue()) {
                Common.NotificationCenter.trigger('fonts:change', fontobj);
            }

            /* read font params */
            val = fontobj.asc_getFontBold();
            if (this.btnBold[idx].isActive() !== val)
                this.btnBold[idx].toggle(val === true, true);

            val = fontobj.asc_getFontItalic();
            if (this.btnItalic[idx].isActive() !== val)
                this.btnItalic[idx].toggle(val === true, true);

            val = fontobj.asc_getFontUnderline();
            if (this.btnUnderline[idx].isActive() !== val)
                this.btnUnderline[idx].toggle(val === true, true);

            val = fontobj.asc_getFontStrikeout();
            if (this.btnStrikeout[idx].isActive() !== val)
                this.btnStrikeout[idx].toggle(val === true, true);

            val = fontobj.asc_getFontSubscript();
            if (this.btnSubscript[idx].isActive() !== val)
                this.btnSubscript[idx].toggle(val === true, true);

            val = fontobj.asc_getFontSuperscript();
            if (this.btnSuperscript[idx].isActive() !== val)
                this.btnSuperscript[idx].toggle(val === true, true);

            /* read font size */
            var str_size = fontobj.asc_getFontSize();
            if (this.cmbFontSize[idx].getValue() !== str_size)
                this.cmbFontSize[idx].setValue((str_size!==undefined) ? str_size : '');

            /* read font color */
            var clr,
                color,
                fontColorPicker = this.mnuTextColorPicker[idx];
            color = fontobj.asc_getFontColor();
            if (color) {
                if (color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                    clr = {color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()), effectValue: color.get_value() };
                } else {
                    clr = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
                }
            }
            Common.Utils.ThemeColor.selectPickerColorByEffect(clr, fontColorPicker);
        },

        tipFontName: 'Font',
        tipFontSize: 'Font size',
        textBold:    'Bold',
        textItalic:  'Italic',
        textUnderline: 'Underline',
        textStrikeout: 'Strikeout',
        textSuperscript: 'Superscript',
        textSubscript: 'Subscript',
        textTitle: 'Header/Footer Settings',
        textHeader: 'Header',
        textFooter: 'Footer',
        textLeft: 'Left',
        textCenter: 'Center',
        textRight: 'Right',
        textPageNum: 'Page number',
        textPageCount: 'Page count',
        textDate: 'Date',
        textTime: 'Time',
        textFileName: 'File name',
        textSheet: 'Sheet name',
        textColor: 'Text color',
        textNewColor: 'Add New Custom Color',
        textInsert: 'Insert',
        textPresets: 'Presets',
        textDiffFirst: 'Different first page',
        textDiffOdd: 'Different odd and even pages',
        textScale: 'Scale with document',
        textAlign: 'Align with page margins',
        textFirst: 'First page',
        textOdd: 'Odd page',
        textEven: 'Even page',
        textAll: 'All pages',
        textMaxError: 'The text string you entered is too long. Reduce the number of characters used.',
        textImage: 'Picture'

    }, SSE.Views.HeaderFooterDialog || {}))
});