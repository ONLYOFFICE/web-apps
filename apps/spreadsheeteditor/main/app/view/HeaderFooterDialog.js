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
            width: 660,
            style: 'min-width: 350px;',
            cls: 'modal-dlg'
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: (this.options.type == 'header') ? this.textHeader : this.textFooter
            }, options || {});

            this.api = this.options.api;
            this.type = this.options.type || 'header';
            this.fontStore = this.options.fontStore;
            this.font = {
                size: 11,
                name: 'Arial',
                bold: false,
                italic: false
            };

            this.template = [
                '<div class="box" style="height: 310px;">',
                    '<div id="id-dlg-h-presets" class="input-row" style="display: inline-block; vertical-align: middle;"></div>',
                    '<div id="id-dlg-h-insert" class="input-row" style="display: inline-block; vertical-align: middle;"></div>',
                    '<div id="id-dlg-h-fonts" class="input-row" style="display: inline-block; vertical-align: middle; margin-left: 3px;"></div>',
                    '<div id="id-dlg-h-font-size" class="input-row" style="display: inline-block; vertical-align: middle; margin-left: 3px;"></div>',
                    '<div id="id-dlg-h-textcolor" style="display: inline-block;margin-left: 3px;"></div>',
                    '<div id="id-dlg-h-bold" style="display: inline-block;margin-left: 2px;"></div>','<div id="id-dlg-h-italic" style="display: inline-block;margin-left: 2px;"></div>',
                    '<div id="id-dlg-h-underline" style="display: inline-block;margin-left: 2px;"></div>','<div id="id-dlg-h-strikeout" style="display: inline-block;margin-left: 2px;"></div>',
                    '<div id="id-dlg-h-subscript" style="display: inline-block;margin-left: 2px;"></div>','<div id="id-dlg-h-superscript" style="display: inline-block;margin-left: 2px;"></div>',
                    '<label style="display: block; margin-top: 15px;">' + this.textHeader + '</label>',
                    '<div style="">',
                        '<div style="display: inline-block;margin-right: 10px;">',
                            '<div style="border: 1px solid #cbcbcb;width: 201px; height: 90px; position:relative; overflow:hidden;">',
                                '<div id="header-left-img" style="width: 190px; height: 100%;"></div>',
                            '</div>',
                        '</div>',
                        '<div style="display: inline-block;margin-right: 10px;">',
                            '<div style="border: 1px solid #cbcbcb;width: 201px; height: 90px; position:relative; overflow:hidden;">',
                                '<div id="header-center-img" style="width: 190px; height: 100%;"></div>',
                            '</div>',
                        '</div>',
                        '<div style="display: inline-block;">',
                            '<div style="border: 1px solid #cbcbcb;width: 201px; height: 90px; position:relative; overflow:hidden;">',
                                '<div id="header-right-img" style="width: 190px; height: 100%;"></div>',
                            '</div>',
                        '</div>',
                    '</div>',
                    '<label style="margin-top: 15px;">' + this.textFooter + '</label>',
                    '<div id="id-dlg-f-presets" class="input-row" style="display: inline-block; vertical-align: middle;"></div>',
                    '<div id="id-dlg-f-insert" class="input-row" style="display: inline-block; vertical-align: middle;"></div>',
                    '<div id="id-dlg-f-fonts" class="input-row" style="display: inline-block; vertical-align: middle; margin-left: 3px;"></div>',
                    '<div id="id-dlg-f-font-size" class="input-row" style="display: inline-block; vertical-align: middle; margin-left: 3px;"></div>',
                    '<div id="id-dlg-f-textcolor" style="display: inline-block;margin-left: 3px;"></div>',
                    '<div id="id-dlg-f-bold" style="display: inline-block;margin-left: 2px;"></div>','<div id="id-dlg-f-italic" style="display: inline-block;margin-left: 2px;"></div>',
                    '<div id="id-dlg-f-underline" style="display: inline-block;margin-left: 2px;"></div>','<div id="id-dlg-f-strikeout" style="display: inline-block;margin-left: 2px;"></div>',
                    '<div id="id-dlg-f-subscript" style="display: inline-block;margin-left: 2px;"></div>','<div id="id-dlg-f-superscript" style="display: inline-block;margin-left: 2px;"></div>',
                    '<div style="">',
                        '<div style="display: inline-block;margin-right: 10px;">',
                            '<div style="border: 1px solid #cbcbcb;width: 201px; height: 90px; position:relative; overflow:hidden;">',
                                '<div id="footer-left-img" style="width: 190px; height: 100%;"></div>',
                            '</div>',
                        '</div>',
                        '<div style="display: inline-block;margin-right: 10px;">',
                            '<div style="border: 1px solid #cbcbcb;width: 201px; height: 90px; position:relative; overflow:hidden;">',
                                '<div id="footer-center-img" style="width: 190px; height: 100%;"></div>',
                            '</div>',
                        '</div>',
                        '<div style="display: inline-block;">',
                            '<div style="border: 1px solid #cbcbcb;width: 201px; height: 90px; position:relative; overflow:hidden;">',
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
                style       : 'width: 120px;',
                menuStyle   : 'min-width: 100%; max-heigh: 100px;',
                editable    : false,
                data: data
            });
            this.cmbInsertH.on('selected', _.bind(function(combo, record) {
                combo.setValue(this.textInsert);
                if (this.HFObject)
                    this.HFObject.addField(record.value);
            }, this));
            this.cmbInsertH.setValue(this.textInsert);

            me.cmbFonts = new Common.UI.ComboBoxFonts({
                el          : $('#id-dlg-h-fonts'),
                cls         : 'input-group-nr',
                style       : 'width: 150px;',
                menuCls     : 'scrollable-menu',
                menuStyle   : 'min-width: 100%;max-height: 270px;',
                store       : new Common.Collections.Fonts(),
                recent      : 0,
                hint        : me.tipFontName
            }).on('selected', function(combo, record) {
                if (me.HFObject) {
                    me.HFObject.setFontName(record.name);
                    me.scrollerUpdate();
                }
            });

            this.cmbFontSize = new Common.UI.ComboBox({
                el: $('#id-dlg-h-font-size'),
                cls: 'input-group-nr',
                style: 'width: 55px;',
                menuCls     : 'scrollable-menu',
                menuStyle: 'min-width: 55px;max-height: 270px;',
                hint: this.tipFontSize,
                data: [
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
            }).on('selected', function(combo, record) {
                if (me.HFObject) {
                    me.HFObject.setFontSize(record.value);
                    me.scrollerUpdate();
                }
            });
            this.cmbFontSize.setValue(this.font.size);

            me.btnBold = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'btn-bold',
                enableToggle: true,
                hint: me.textBold
            });
            me.btnBold.render($('#id-dlg-h-bold')) ;
            me.btnBold.on('click', function(btn, e) {
                if (me.HFObject) {
                    me.HFObject.setBold(btn.pressed);
                    me.scrollerUpdate();
                }
            });

            me.btnItalic = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'btn-italic',
                enableToggle: true,
                hint: me.textItalic
            });
            me.btnItalic.render($('#id-dlg-h-italic')) ;
            me.btnItalic.on('click', function(btn, e) {
                if (me.HFObject) {
                    me.HFObject.setItalic(btn.pressed);
                    me.scrollerUpdate();
                }
            });

            me.btnUnderline = new Common.UI.Button({
                cls         : 'btn-toolbar',
                iconCls     : 'btn-underline',
                enableToggle: true,
                hint: me.textUnderline
            });
            me.btnUnderline.render($('#id-dlg-h-underline')) ;
            me.btnUnderline.on('click', function(btn, e) {
                if (me.HFObject) {
                    me.HFObject.setUnderline(btn.pressed);
                    me.scrollerUpdate();
                }
            });

            me.btnStrikeout = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'btn-strikeout',
                enableToggle: true,
                hint: me.textStrikeout
            });
            me.btnStrikeout.render($('#id-dlg-h-strikeout')) ;
            me.btnStrikeout.on('click', function(btn, e) {
                if (me.HFObject) {
                    me.HFObject.setStrikeout(btn.pressed);
                    me.scrollerUpdate();
                }
            });

            this.btnSuperscript = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'btn-superscript',
                enableToggle: true,
                toggleGroup: 'superscriptHFGroup',
                hint: me.textSuperscript
            });
            me.btnSuperscript.render($('#id-dlg-h-superscript')) ;
            me.btnSuperscript.on('click', function(btn, e) {
                if (me.HFObject) {
                    me.HFObject.setSuperscript(btn.pressed);
                    me.scrollerUpdate();
                }
            });

            this.btnSubscript = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'btn-subscript',
                enableToggle: true,
                toggleGroup: 'superscriptHFGroup',
                hint: me.textSubscript
            });
            me.btnSubscript.render($('#id-dlg-h-subscript')) ;
            me.btnSubscript.on('click', function(btn, e) {
                if (me.HFObject) {
                    me.HFObject.setSubscript(btn.pressed);
                    me.scrollerUpdate();
                }
            });

            me.btnTextColor = new Common.UI.Button({
                cls         : 'btn-toolbar',
                iconCls     : 'btn-fontcolor',
                hint        : me.textColor,
                menu        : new Common.UI.Menu({
                    items: [
                        { template: _.template('<div id="id-dlg-h-menu-fontcolor" style="width: 169px; height: 220px; margin: 10px;"></div>') },
                        { template: _.template('<a id="id-dlg-h-menu-new-fontcolor" style="padding-left:12px;">' + me.textNewColor + '</a>') }
                    ]
                })
            });
            me.btnTextColor.render($('#id-dlg-h-textcolor'));
            if (me.btnTextColor && me.btnTextColor.cmpEl) {
                var colorVal = $('<div class="btn-color-value-line"></div>');
                $('button:first-child', this.btnTextColor.cmpEl).append(colorVal);
                colorVal.css('background-color', this.btnTextColor.currentColor || '#000000');
                me.mnuTextColorPicker = new Common.UI.ThemeColorPalette({
                    el: $('#id-dlg-h-menu-fontcolor')
                });
            }
            this.btnTextColor.menu.cmpEl.on('click', '#id-dlg-h-menu-new-fontcolor', _.bind(function() {
                me.mnuTextColorPicker.addNewColor((typeof(me.btnTextColor.color) == 'object') ? me.btnTextColor.color.color : me.btnTextColor.color);
            }, me));
            me.mnuTextColorPicker.on('select', function(picker, color, fromBtn) {
                var clr = (typeof(color) == 'object') ? color.color : color;

                me.btnTextColor.currentColor = color;
                $('.btn-color-value-line', me.btnTextColor.cmpEl).css('background-color', '#' + clr);

                me.mnuTextColorPicker.currentColor = color;
                if (me.HFObject)
                    me.HFObject.setTextColor(Common.Utils.ThemeColor.getRgbColor(color));
            });

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
        },

        close: function() {
            Common.UI.Window.prototype.close.apply(this, arguments);

            if (this.HFObject)
                this.HFObject.destroy();
        },

        afterRender: function () {
            this.cmbFonts.fillFonts(this.fontStore);
            this.cmbFonts.selectRecord(this.fontStore.findWhere({name: this.font.name}) || this.fontStore.at(0));
            this.updateThemeColors();

            this.HFObject = new AscCommonExcel.CHeaderFooterEditor('header-left-img', 'header-center-img', 'header-right-img', 190);
        },

        updateThemeColors: function() {
            this.mnuTextColorPicker.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
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
        textInsert: 'Insert'

    }, SSE.Views.HeaderFooterDialog || {}))
});