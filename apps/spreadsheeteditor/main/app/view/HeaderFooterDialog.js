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
 *  Created by Julia Radzhabova on 10/111/18
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
                '<div class="box" style="height: 210px;">',
                    '<div id="id-dlg-hf-fonts" class="input-row" style="display: inline-block; vertical-align: middle;"></div>',
                    '<div id="id-dlg-hf-font-size" class="input-row" style="display: inline-block; vertical-align: middle; margin-left: 3px;"></div>',
                    '<div id="id-dlg-hf-textcolor" style="display: inline-block;margin-left: 3px;"></div>',
                    '<div id="id-dlg-hf-bold" style="display: inline-block;margin-left: 2px;"></div>','<div id="id-dlg-hf-italic" style="display: inline-block;margin-left: 2px;"></div>',
                    '<div id="id-dlg-hf-underline" style="display: inline-block;margin-left: 2px;"></div>','<div id="id-dlg-hf-strikeout" style="display: inline-block;margin-left: 2px;"></div>',
                    '<div id="id-dlg-hf-subscript" style="display: inline-block;margin-left: 2px;"></div>','<div id="id-dlg-hf-superscript" style="display: inline-block;margin-left: 2px;"></div>',
                    '<div id="id-dlg-hf-pagenum" style="display: inline-block;margin-left: 10px;"></div>','<div id="id-dlg-hf-pagecount" style="display: inline-block;margin-left: 2px;"></div>',
                    '<div id="id-dlg-hf-date" style="display: inline-block;margin-left: 10px;"></div>','<div id="id-dlg-hf-time" style="display: inline-block;margin-left: 2px;"></div>',
                    '<div id="id-dlg-hf-filepath" style="display: inline-block;margin-left: 10px;"></div>', '<div id="id-dlg-hf-filename" style="display: inline-block;margin-left: 2px;"></div>',
                    '<div id="id-dlg-hf-sheet" style="display: inline-block;margin-left: 2px;"></div>',
                    '<div style="margin-top: 15px;">',
                        '<div style="display: inline-block;margin-right: 10px;">',
                            '<label style="font-weight: bold;">' + this.textLeft + '</label>',
                            '<div style="border: 1px solid #cbcbcb;width: 201px; height: 150px; position:relative; overflow:hidden;">',
                                '<div id="headerfooter-left-img" style="width: 190px; height: 100%;"></div>',
                            '</div>',
                        '</div>',
                        '<div style="display: inline-block;margin-right: 10px;">',
                            '<label style="font-weight: bold;">' + this.textCenter + '</label>',
                            '<div style="border: 1px solid #cbcbcb;width: 201px; height: 150px; position:relative; overflow:hidden;">',
                                '<div id="headerfooter-center-img" style="width: 190px; height: 100%;"></div>',
                            '</div>',
                        '</div>',
                        '<div style="display: inline-block;">',
                            '<label style="font-weight: bold;">' + this.textRight + '</label>',
                            '<div style="border: 1px solid #cbcbcb;width: 201px; height: 150px; position:relative; overflow:hidden;">',
                                '<div id="headerfooter-right-img" style="width: 190px; height: 100%;"></div>',
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

            me.cmbFonts = new Common.UI.ComboBoxFonts({
                el          : $('#id-dlg-hf-fonts'),
                cls         : 'input-group-nr',
                style       : 'width: 220px;',
                menuCls     : 'scrollable-menu',
                menuStyle   : 'min-width: 234px;max-height: 270px;',
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
                el: $('#id-dlg-hf-font-size'),
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
            me.btnBold.render($('#id-dlg-hf-bold')) ;
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
            me.btnItalic.render($('#id-dlg-hf-italic')) ;
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
            me.btnUnderline.render($('#id-dlg-hf-underline')) ;
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
            me.btnStrikeout.render($('#id-dlg-hf-strikeout')) ;
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
            me.btnSuperscript.render($('#id-dlg-hf-superscript')) ;
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
            me.btnSubscript.render($('#id-dlg-hf-subscript')) ;
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
                        { template: _.template('<div id="id-dlg-hf-menu-fontcolor" style="width: 169px; height: 220px; margin: 10px;"></div>') },
                        { template: _.template('<a id="id-dlg-hf-menu-new-fontcolor" style="padding-left:12px;">' + me.textNewColor + '</a>') }
                    ]
                })
            });
            me.btnTextColor.render($('#id-dlg-hf-textcolor'));
            if (me.btnTextColor && me.btnTextColor.cmpEl) {
                var colorVal = $('<div class="btn-color-value-line"></div>');
                $('button:first-child', this.btnTextColor.cmpEl).append(colorVal);
                colorVal.css('background-color', this.btnTextColor.currentColor || '#000000');
                me.mnuTextColorPicker = new Common.UI.ThemeColorPalette({
                    el: $('#id-dlg-hf-menu-fontcolor')
                });
            }
            this.btnTextColor.menu.cmpEl.on('click', '#id-dlg-hf-menu-new-fontcolor', _.bind(function() {
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

            var onHeaderFooterFieldClick = function(btn){
                if (me.HFObject)
                    me.HFObject.addField(btn.options.value);
            };

            me.btnPageNum = new Common.UI.Button({
                cls         : 'btn-toolbar',
                iconCls     : 'btn-align-just',
                hint: me.textPageNum,
                value: Asc.c_oAscHeaderFooterField.pageNumber
            });
            me.btnPageNum.render($('#id-dlg-hf-pagenum')) ;
            me.btnPageNum.on('click', onHeaderFooterFieldClick);

            me.btnPageCount = new Common.UI.Button({
                cls         : 'btn-toolbar',
                iconCls     : 'btn-align-just',
                hint: me.textPageCount,
                value: Asc.c_oAscHeaderFooterField.pageCount
            });
            me.btnPageCount.render($('#id-dlg-hf-pagecount')) ;
            me.btnPageCount.on('click', onHeaderFooterFieldClick);

            me.btnDate = new Common.UI.Button({
                cls         : 'btn-toolbar',
                iconCls     : 'btn-align-just',
                hint: me.textDate,
                value: Asc.c_oAscHeaderFooterField.date
            });
            me.btnDate.render($('#id-dlg-hf-date')) ;
            me.btnDate.on('click', onHeaderFooterFieldClick);

            me.btnTime = new Common.UI.Button({
                cls         : 'btn-toolbar',
                iconCls     : 'btn-align-just',
                hint: me.textTime,
                value: Asc.c_oAscHeaderFooterField.time
            });
            me.btnTime.render($('#id-dlg-hf-time')) ;
            me.btnTime.on('click', onHeaderFooterFieldClick);

            me.btnFilePath = new Common.UI.Button({
                cls         : 'btn-toolbar',
                iconCls     : 'btn-align-just',
                hint: me.textFilePath,
                value: Asc.c_oAscHeaderFooterField.filePath
            });
            me.btnFilePath.render($('#id-dlg-hf-filepath')) ;
            me.btnFilePath.on('click', onHeaderFooterFieldClick);

            me.btnFileName = new Common.UI.Button({
                cls         : 'btn-toolbar',
                iconCls     : 'btn-align-just',
                hint: me.textFileName,
                value: Asc.c_oAscHeaderFooterField.fileName
            });
            me.btnFileName.render($('#id-dlg-hf-filename')) ;
            me.btnFileName.on('click', onHeaderFooterFieldClick);

            me.btnSheet = new Common.UI.Button({
                cls         : 'btn-toolbar',
                iconCls     : 'btn-align-just',
                hint: me.textSheet,
                value: Asc.c_oAscHeaderFooterField.sheetName
            });
            me.btnSheet.render($('#id-dlg-hf-sheet')) ;
            me.btnSheet.on('click', onHeaderFooterFieldClick);

            me.btnOk = new Common.UI.Button({
                el: $window.find('.primary')
            });

            $window.find('.dlg-btn').on('click', _.bind(me.onBtnClick, me));

            $window.find('#headerfooter-left-img').on('click', _.bind(me.onCanvasClick, me, '#headerfooter-left-img'));
            $window.find('#headerfooter-center-img').on('click', _.bind(me.onCanvasClick, me, '#headerfooter-center-img'));
            $window.find('#headerfooter-right-img').on('click', _.bind(me.onCanvasClick, me, '#headerfooter-right-img'));

            this.scrollerYL = new Common.UI.Scroller({
                el: this.$window.find('#headerfooter-left-img').parent(),
                minScrollbarLength  : 20
            });
            this.scrollerYL.update(); this.scrollerYL.scrollTop(0);
            this.scrollerYC = new Common.UI.Scroller({
                el: this.$window.find('#headerfooter-center-img').parent(),
                minScrollbarLength  : 20
            });
            this.scrollerYC.update(); this.scrollerYC.scrollTop(0);
            this.scrollerYR = new Common.UI.Scroller({
                el: this.$window.find('#headerfooter-right-img').parent(),
                minScrollbarLength  : 20
            });
            this.scrollerYR.update(); this.scrollerYR.scrollTop(0);

            me.afterRender();
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

            this.HFObject = new AscCommonExcel.CHeaderFooterEditor('headerfooter-left-img', 'headerfooter-center-img', 'headerfooter-right-img', 190);
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
            this.scrollerYL.update();
            this.scrollerYR.update();
            this.scrollerYC.update();
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
        textPageNum: 'Insert page number',
        textPageCount: 'Insert page count',
        textDate: 'Insert date',
        textTime: 'Insert time',
        textFilePath: 'Insert file path',
        textFileName: 'Insert file name',
        textSheet: 'Insert sheet name',
        textColor: 'Text color',
        textNewColor: 'Add New Custom Color'

    }, SSE.Views.HeaderFooterDialog || {}))
});