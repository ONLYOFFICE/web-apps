/*
 *
 * (c) Copyright Ascensio System Limited 2010-2018
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
 *  HeaderFooterDialog.js
 *
 *  Created by Julia Radzhabova on 10/11/18
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */


define([
    'common/main/lib/util/utils',
    'common/main/lib/component/InputField',
    'common/main/lib/component/Window',
    'common/main/lib/component/ComboBoxFonts'
], function () { 'use strict';

    SSE.Views.HeaderFooterDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 647,
            style: 'min-width: 350px;',
            cls: 'modal-dlg'
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.api = this.options.api;
            this.fontStore = this.options.fontStore;
            this.font = {
                size: 11,
                name: 'Arial',
                bold: false,
                italic: false
            };

            this.template = [
                '<div class="box" style="height: 400px;">',
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
                    '<div class="input-row" style="margin-bottom: 15px; border-bottom: 1px solid #cfcfcf;">',
                        '<button type="button" class="btn btn-text-default auto" id="id-dlg-hf-btn-all" style="border-radius: 0;">', this.textAll,'</button>',
                        '<button type="button" class="btn btn-text-default auto hidden" id="id-dlg-hf-btn-odd" style="border-radius: 0;">', this.textOdd,'</button>',
                        '<button type="button" class="btn btn-text-default auto hidden" id="id-dlg-hf-btn-even" style="border-radius: 0; margin-left:-1px;">', this.textEven,'</button>',
                        '<button type="button" class="btn btn-text-default auto hidden" id="id-dlg-hf-btn-first" style="border-radius: 0; margin-left:-1px;">', this.textFirst,'</button>',
                    '</div>',
                    '<label style="display: block; margin-bottom: 3px;">' + this.textHeader + '</label>',
                    '<div id="id-dlg-h-presets" class="input-row" style="display: inline-block; vertical-align: middle;"></div>',
                    '<div id="id-dlg-h-insert" class="input-row" style="display: inline-block; vertical-align: middle; margin-left: 3px;"></div>',
                    '<div id="id-dlg-h-fonts" class="input-row" style="display: inline-block; vertical-align: middle; margin-left: 3px;"></div>',
                    '<div id="id-dlg-h-font-size" class="input-row" style="display: inline-block; vertical-align: middle; margin-left: 3px;"></div>',
                    '<div id="id-dlg-h-textcolor" style="display: inline-block;margin-left: 3px;"></div>',
                    '<div id="id-dlg-h-bold" style="display: inline-block;margin-left: 2px;"></div>','<div id="id-dlg-h-italic" style="display: inline-block;margin-left: 2px;"></div>',
                    '<div id="id-dlg-h-underline" style="display: inline-block;margin-left: 2px;"></div>','<div id="id-dlg-h-strikeout" style="display: inline-block;margin-left: 2px;"></div>',
                    '<div id="id-dlg-h-subscript" style="display: inline-block;margin-left: 2px;"></div>','<div id="id-dlg-h-superscript" style="display: inline-block;margin-left: 2px;"></div>',
                    '<div style="margin-top: 7px;">',
                        '<div style="display: inline-block;margin-right: -1px;">',
                            '<div style="border: 1px solid #cbcbcb;width: 205px; height: 90px; position:relative; overflow:hidden;">',
                                '<div id="header-left-img" style="width: 190px; height: 100%;"></div>',
                            '</div>',
                        '</div>',
                        '<div style="display: inline-block;margin-right: -1px;">',
                            '<div style="border: 1px solid #cbcbcb;width: 205px; height: 90px; position:relative; overflow:hidden;">',
                                '<div id="header-center-img" style="width: 190px; height: 100%;"></div>',
                            '</div>',
                        '</div>',
                        '<div style="display: inline-block;">',
                            '<div style="border: 1px solid #cbcbcb;width: 205px; height: 90px; position:relative; overflow:hidden;">',
                                '<div id="header-right-img" style="width: 190px; height: 100%;"></div>',
                            '</div>',
                        '</div>',
                    '</div>',
                    '<label style="display: block; margin-top: 10px;margin-bottom: 3px;">' + this.textFooter + '</label>',
                    '<div id="id-dlg-f-presets" class="input-row" style="display: inline-block; vertical-align: middle;"></div>',
                    '<div id="id-dlg-f-insert" class="input-row" style="display: inline-block; vertical-align: middle; margin-left: 3px;"></div>',
                    '<div id="id-dlg-f-fonts" class="input-row" style="display: inline-block; vertical-align: middle; margin-left: 3px;"></div>',
                    '<div id="id-dlg-f-font-size" class="input-row" style="display: inline-block; vertical-align: middle; margin-left: 3px;"></div>',
                    '<div id="id-dlg-f-textcolor" style="display: inline-block;margin-left: 3px;"></div>',
                    '<div id="id-dlg-f-bold" style="display: inline-block;margin-left: 2px;"></div>','<div id="id-dlg-f-italic" style="display: inline-block;margin-left: 2px;"></div>',
                    '<div id="id-dlg-f-underline" style="display: inline-block;margin-left: 2px;"></div>','<div id="id-dlg-f-strikeout" style="display: inline-block;margin-left: 2px;"></div>',
                    '<div id="id-dlg-f-subscript" style="display: inline-block;margin-left: 2px;"></div>','<div id="id-dlg-f-superscript" style="display: inline-block;margin-left: 2px;"></div>',
                    '<div style="margin-top: 7px;">',
                        '<div style="display: inline-block;margin-right: -1px;">',
                            '<div style="border: 1px solid #cbcbcb;width: 205px; height: 90px; position:relative; overflow:hidden;">',
                                '<div id="footer-left-img" style="width: 190px; height: 100%;"></div>',
                            '</div>',
                        '</div>',
                        '<div style="display: inline-block;margin-right: -1px;">',
                            '<div style="border: 1px solid #cbcbcb;width: 205px; height: 90px; position:relative; overflow:hidden;">',
                                '<div id="footer-center-img" style="width: 190px; height: 100%;"></div>',
                            '</div>',
                        '</div>',
                        '<div style="display: inline-block;">',
                            '<div style="border: 1px solid #cbcbcb;width: 205px; height: 90px; position:relative; overflow:hidden;">',
                                '<div id="footer-right-img" style="width: 190px; height: 100%;"></div>',
                            '</div>',
                        '</div>',
                    '</div>',
                '</div>',
                '<div class="footer center">',
                    '<button class="btn normal dlg-btn primary" result="ok" style="margin-right: 10px;">' + this.okButtonText + '</button>',
                    '<button class="btn normal dlg-btn" result="cancel">' + this.cancelButtonText + '</button>',
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
                // if (this.HFObject)
                //     this.HFObject.setFirst(checked);

                this.btnFirst.setVisible(checked);
                if (!checked && this.btnFirst.isActive())
                    (this.btnAll.isVisible()) ? this.btnAll.toggle(true) : this.btnOdd.toggle(true);

                this.cmbPresetsF.setDisabled(checked);
                this.cmbPresetsH.setDisabled(checked);
            }, this));

            this.chOddPage = new Common.UI.CheckBox({
                el: $('#id-dlg-hf-ch-odd'),
                labelText: this.textDiffOdd
            });
            this.chOddPage.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                var checked = (field.getValue()=='checked');
                // if (this.HFObject)
                //     this.HFObject.setOdd(checked);

                this.btnOdd.setVisible(checked);
                this.btnEven.setVisible(checked);
                this.btnAll.setVisible(!checked);
                if (!checked && (this.btnOdd.isActive() || this.btnEven.isActive()))
                    this.btnAll.toggle(true);
                if (checked && this.btnAll.isActive())
                    this.btnOdd.toggle(true);
                this.cmbPresetsF.setDisabled(checked);
                this.cmbPresetsH.setDisabled(checked);
            }, this));

            this.chScale = new Common.UI.CheckBox({
                el: $('#id-dlg-hf-ch-scale'),
                labelText: this.textScale
            });
            this.chScale.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                var checked = (field.getValue()=='checked');
                // if (this.HFObject)
                //     this.HFObject.setScale(checked);
            }, this));

            this.chAlign = new Common.UI.CheckBox({
                el: $('#id-dlg-hf-ch-align'),
                labelText: this.textAlign
            });
            this.chAlign.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                var checked = (field.getValue()=='checked');
                // if (this.HFObject)
                //     this.HFObject.setAlign(checked);
            }, this));

            this.btnAll = new Common.UI.Button({
                el: $('#id-dlg-hf-btn-all'),
                enableToggle: true,
                toggleGroup: 'hf-pages',
                allowDepress: false,
                pressed: true
            });

            this.btnOdd = new Common.UI.Button({
                el: $('#id-dlg-hf-btn-odd'),
                enableToggle: true,
                toggleGroup: 'hf-pages',
                allowDepress: false
            });
            this.btnOdd.on('click', _.bind(this.onPageTypeClick, this, 0));

            this.btnEven = new Common.UI.Button({
                el: $('#id-dlg-hf-btn-even'),
                enableToggle: true,
                toggleGroup: 'hf-pages',
                allowDepress: false
            });
            this.btnEven.on('click', _.bind(this.onPageTypeClick, this, 1));

            this.btnFirst = new Common.UI.Button({
                el: $('#id-dlg-hf-btn-first'),
                enableToggle: true,
                toggleGroup: 'hf-pages',
                allowDepress: false
            });
            this.btnFirst.on('click', _.bind(this.onPageTypeClick, this, 2));

            this.cmbPresetsH = new Common.UI.ComboBox({
                el          : $('#id-dlg-h-presets'),
                cls         : 'input-group-nr',
                style       : 'width: 115px;',
                menuStyle   : 'min-width: 100%; max-heigh: 100px;',
                editable    : false,
                data: data
            });
            this.cmbPresetsH.on('selected', _.bind(this.onPresetSelect, this));
            this.cmbPresetsH.setValue(this.textPresets);

            this.cmbPresetsF = new Common.UI.ComboBox({
                el          : $('#id-dlg-f-presets'),
                cls         : 'input-group-nr',
                style       : 'width: 115px;',
                menuStyle   : 'min-width: 100%; max-heigh: 100px;',
                editable    : false,
                data: data
            });
            this.cmbPresetsF.on('selected', _.bind(this.onPresetSelect, this));
            this.cmbPresetsF.setValue(this.textPresets);

            var data = [
                {displayValue: this.textPageNum, value: Asc.c_oAscHeaderFooterField.pageNumber},
                {displayValue: this.textPageCount, value: Asc.c_oAscHeaderFooterField.pageCount},
                {displayValue: this.textDate, value: Asc.c_oAscHeaderFooterField.date},
                {displayValue: this.textTime, value: Asc.c_oAscHeaderFooterField.time},
                {displayValue: this.textFilePath, value: Asc.c_oAscHeaderFooterField.filePath},
                {displayValue: this.textFileName, value: Asc.c_oAscHeaderFooterField.fileName},
                {displayValue: this.textSheet, value: Asc.c_oAscHeaderFooterField.sheetName}
            ];

            this.cmbInsertH = new Common.UI.ComboBox({
                el          : $('#id-dlg-h-insert'),
                cls         : 'input-group-nr',
                style       : 'width: 115px;',
                menuStyle   : 'min-width: 100%; max-heigh: 100px;',
                editable    : false,
                data: data
            });
            this.cmbInsertH.on('selected', _.bind(this.onObjectSelect, this));
            this.cmbInsertH.setValue(this.textInsert);

            this.cmbInsertF = new Common.UI.ComboBox({
                el          : $('#id-dlg-f-insert'),
                cls         : 'input-group-nr',
                style       : 'width: 115px;',
                menuStyle   : 'min-width: 100%; max-heigh: 100px;',
                editable    : false,
                data: data
            });
            this.cmbInsertF.on('selected', _.bind(this.onObjectSelect, this));
            this.cmbInsertF.setValue(this.textInsert);

            me.cmbFontsH = new Common.UI.ComboBoxFonts({
                el          : $('#id-dlg-h-fonts'),
                cls         : 'input-group-nr',
                style       : 'width: 150px;',
                menuCls     : 'scrollable-menu',
                menuStyle   : 'min-width: 100%;max-height: 270px;',
                store       : new Common.Collections.Fonts(),
                recent      : 0,
                hint        : me.tipFontName
            }).on('selected', _.bind(this.onFontSelect, this));
            me.cmbFontsF = new Common.UI.ComboBoxFonts({
                el          : $('#id-dlg-f-fonts'),
                cls         : 'input-group-nr',
                style       : 'width: 150px;',
                menuCls     : 'scrollable-menu',
                menuStyle   : 'min-width: 100%;max-height: 270px;',
                store       : new Common.Collections.Fonts(),
                recent      : 0,
                hint        : me.tipFontName
            }).on('selected', _.bind(this.onFontSelect, this));

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
            this.cmbFontSizeH = new Common.UI.ComboBox({
                el: $('#id-dlg-h-font-size'),
                cls: 'input-group-nr',
                style: 'width: 55px;',
                menuCls     : 'scrollable-menu',
                menuStyle: 'min-width: 55px;max-height: 270px;',
                hint: this.tipFontSize,
                data: data
            }).on('selected', _.bind(this.onFontSizeSelect, this));
            this.cmbFontSizeH.setValue(this.font.size);
            this.cmbFontSizeF = new Common.UI.ComboBox({
                el: $('#id-dlg-f-font-size'),
                cls: 'input-group-nr',
                style: 'width: 55px;',
                menuCls     : 'scrollable-menu',
                menuStyle: 'min-width: 55px;max-height: 270px;',
                hint: this.tipFontSize,
                data: data
            }).on('selected', _.bind(this.onFontSizeSelect, this));
            this.cmbFontSizeF.setValue(this.font.size);

            me.btnBoldH = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'btn-bold',
                enableToggle: true,
                hint: me.textBold
            });
            me.btnBoldH.render($('#id-dlg-h-bold')) ;
            me.btnBoldH.on('click', _.bind(this.onBoldClick, this));

            me.btnBoldF = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'btn-bold',
                enableToggle: true,
                hint: me.textBold
            });
            me.btnBoldF.render($('#id-dlg-f-bold')) ;
            me.btnBoldF.on('click', _.bind(this.onBoldClick, this));

            me.btnItalicH = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'btn-italic',
                enableToggle: true,
                hint: me.textItalic
            });
            me.btnItalicH.render($('#id-dlg-h-italic')) ;
            me.btnItalicH.on('click', _.bind(this.onItalicClick, this));

            me.btnItalicF = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'btn-italic',
                enableToggle: true,
                hint: me.textItalic
            });
            me.btnItalicF.render($('#id-dlg-f-italic')) ;
            me.btnItalicF.on('click', _.bind(this.onItalicClick, this));

            me.btnUnderlineH = new Common.UI.Button({
                cls         : 'btn-toolbar',
                iconCls     : 'btn-underline',
                enableToggle: true,
                hint: me.textUnderline
            });
            me.btnUnderlineH.render($('#id-dlg-h-underline')) ;
            me.btnUnderlineH.on('click', _.bind(this.onUnderlineClick, this));

            me.btnUnderlineF = new Common.UI.Button({
                cls         : 'btn-toolbar',
                iconCls     : 'btn-underline',
                enableToggle: true,
                hint: me.textUnderline
            });
            me.btnUnderlineF.render($('#id-dlg-f-underline')) ;
            me.btnUnderlineF.on('click', _.bind(this.onUnderlineClick, this));

            me.btnStrikeoutH = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'btn-strikeout',
                enableToggle: true,
                hint: me.textStrikeout
            });
            me.btnStrikeoutH.render($('#id-dlg-h-strikeout')) ;
            me.btnStrikeoutH.on('click',_.bind(this.onStrikeoutClick, this));
            me.btnStrikeoutF = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'btn-strikeout',
                enableToggle: true,
                hint: me.textStrikeout
            });
            me.btnStrikeoutF.render($('#id-dlg-f-strikeout')) ;
            me.btnStrikeoutF.on('click',_.bind(this.onStrikeoutClick, this));

            this.btnSuperscriptH = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'btn-superscript',
                enableToggle: true,
                toggleGroup: 'superscriptHFGroup',
                hint: me.textSuperscript
            });
            me.btnSuperscriptH.render($('#id-dlg-h-superscript')) ;
            me.btnSuperscriptH.on('click', _.bind(this.onSuperscriptClick, this));
            this.btnSuperscriptF = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'btn-superscript',
                enableToggle: true,
                toggleGroup: 'superscriptHFGroup',
                hint: me.textSuperscript
            });
            me.btnSuperscriptF.render($('#id-dlg-f-superscript')) ;
            me.btnSuperscriptF.on('click', _.bind(this.onSuperscriptClick, this));

            this.btnSubscriptH = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'btn-subscript',
                enableToggle: true,
                toggleGroup: 'superscriptHFGroup',
                hint: me.textSubscript
            });
            me.btnSubscriptH.render($('#id-dlg-h-subscript')) ;
            me.btnSubscriptH.on('click', _.bind(this.onSubscriptClick, this));
            this.btnSubscriptF = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'btn-subscript',
                enableToggle: true,
                toggleGroup: 'superscriptHFGroup',
                hint: me.textSubscript
            });
            me.btnSubscriptF.render($('#id-dlg-f-subscript')) ;
            me.btnSubscriptF.on('click', _.bind(this.onSubscriptClick, this));

            var initNewColor = function(btn, picker_el) {
                if (btn && btn.cmpEl) {
                    var colorVal = $('<div class="btn-color-value-line"></div>');
                    $('button:first-child', btn.cmpEl).append(colorVal);
                    colorVal.css('background-color', btn.currentColor || '#000000');
                    var picker = new Common.UI.ThemeColorPalette({
                        el: $(picker_el)
                    });
                }
                btn.menu.cmpEl.on('click', picker_el+'-new', _.bind(function() {
                    picker.addNewColor((typeof(btn.color) == 'object') ? btn.color.color : btn.color);
                }, me));
                picker.on('select', _.bind(me.onColorSelect, me, btn));
                return picker;
            };
            me.btnTextColorH = new Common.UI.Button({
                cls         : 'btn-toolbar',
                iconCls     : 'btn-fontcolor',
                hint        : me.textColor,
                menu        : new Common.UI.Menu({
                    items: [
                        { template: _.template('<div id="id-dlg-h-menu-fontcolor" style="width: 169px; height: 220px; margin: 10px;"></div>') },
                        { template: _.template('<a id="id-dlg-h-menu-fontcolor-new" style="padding-left:12px;">' + me.textNewColor + '</a>') }
                    ]
                })
            });
            me.btnTextColorH.render($('#id-dlg-h-textcolor'));
            me.mnuTextColorPickerH = initNewColor(me.btnTextColorH, "#id-dlg-h-menu-fontcolor");

            me.btnTextColorF = new Common.UI.Button({
                cls         : 'btn-toolbar',
                iconCls     : 'btn-fontcolor',
                hint        : me.textColor,
                menu        : new Common.UI.Menu({
                    items: [
                        { template: _.template('<div id="id-dlg-f-menu-fontcolor" style="width: 169px; height: 220px; margin: 10px;"></div>') },
                        { template: _.template('<a id="id-dlg-f-menu-fontcolor-new" style="padding-left:12px;">' + me.textNewColor + '</a>') }
                    ]
                })
            });
            me.btnTextColorF.render($('#id-dlg-f-textcolor'));
            me.mnuTextColorPickerF = initNewColor(me.btnTextColorF, "#id-dlg-f-menu-fontcolor");

            me.btnOk = new Common.UI.Button({
                el: $window.find('.primary')
            });

            $window.find('.dlg-btn').on('click', _.bind(me.onBtnClick, me));

            this.scrollers = [];
            this.initCanvas('#header-left-img');
            this.initCanvas('#header-center-img');
            this.initCanvas('#header-right-img');
            this.initCanvas('#footer-left-img');
            this.initCanvas('#footer-center-img');
            this.initCanvas('#footer-right-img');

            me.afterRender();
        },

        initCanvas: function(name) {
            var el = this.$window.find(name);
            el.on('click', _.bind(this.onCanvasClick, this, name));
            this.scrollers.push(new Common.UI.Scroller({
                el: el.parent(),
                minScrollbarLength  : 20
            }));
            this.scrollers[this.scrollers.length-1].update();
            this.scrollers[this.scrollers.length-1].scrollTop(0);
        },

        show: function() {
            Common.UI.Window.prototype.show.apply(this, arguments);
            var me = this;
            _.delay(function(){
                me.HFObject && me.HFObject.click('#header-left-img', 0, 0);
            },500);
        },

        close: function() {
            Common.UI.Window.prototype.close.apply(this, arguments);

            if (this.HFObject)
                this.HFObject.destroy();
        },

        afterRender: function () {
            this.cmbFontsH.fillFonts(this.fontStore);
            this.cmbFontsH.selectRecord(this.fontStore.findWhere({name: this.font.name}) || this.fontStore.at(0));
            this.cmbFontsF.fillFonts(this.fontStore);
            this.cmbFontsF.selectRecord(this.fontStore.findWhere({name: this.font.name}) || this.fontStore.at(0));
            this.updateThemeColors();

            this.HFObject = new AscCommonExcel.CHeaderFooterEditor('header-left-img', 'header-center-img', 'header-right-img', 190);
        },

        updateThemeColors: function() {
            this.mnuTextColorPickerH.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
            this.mnuTextColorPickerF.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
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
            if (this.options.handler) {
                this.options.handler.call(this, this, state);
            }
            if (this.HFObject) {
                this.HFObject.destroy(state=='ok');
                this.HFObject = null;
            }
            this.close();
        },

        scrollerUpdate: function() {
            this.scrollers.forEach(function(item){
                item.update();
            });
        },

        onCanvasClick: function(id, event){
            var parent = $(event.currentTarget).parent(),
                offset = parent.offset();
            this.HFObject.click(id, event.pageX*Common.Utils.zoom() - offset.left, event.pageY*Common.Utils.zoom() - offset.top + parent.scrollTop());
        },

        onPresetSelect: function(combo, record) {
            // if (this.HFObject)
            //     this.HFObject.setPreset(record.value);
        },

        onObjectSelect: function(combo, record) {
            combo.setValue(this.textInsert);
            if (this.HFObject)
                this.HFObject.addField(record.value);
        },

        onFontSelect: function(combo, record) {
            if (this.HFObject) {
                this.HFObject.setFontName(record.name);
                this.scrollerUpdate();
            }
        },

        onFontSizeSelect: function(combo, record) {
            if (this.HFObject) {
                this.HFObject.setFontSize(record.value);
                this.scrollerUpdate();
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

        onColorSelect: function(btn, picker, color) {
            var clr = (typeof(color) == 'object') ? color.color : color;
            btn.currentColor = color;
            $('.btn-color-value-line', btn.cmpEl).css('background-color', '#' + clr);
            picker.currentColor = color;
            if (this.HFObject)
                this.HFObject.setTextColor(Common.Utils.ThemeColor.getRgbColor(color));
        },

        onPageTypeClick: function(type, btn, event) {

        },

        cancelButtonText:   'Cancel',
        okButtonText:       'Ok',
        tipFontName: 'Font Name',
        tipFontSize: 'Font Size',
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
        textFilePath: 'File path',
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
        textAll: 'All pages'

    }, SSE.Views.HeaderFooterDialog || {}))
});