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
            width: 654,
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
                    '<div id="id-dlg-sign-fonts" class="input-row" style="display: inline-block;"></div>',
                    '<div id="id-dlg-sign-font-size" class="input-row" style="display: inline-block;margin-left: 3px;"></div>',
                    '<div id="id-dlg-sign-bold" style="display: inline-block;margin-left: 3px;"></div>','<div id="id-dlg-sign-italic" style="display: inline-block;margin-left: 3px;"></div>',
                    '<div id="id-dlg-sign-underline" style="display: inline-block;margin-left: 3px;"></div>','<div id="id-dlg-sign-strikeout" style="display: inline-block;margin-left: 3px;"></div>',
                    '<div id="id-dlg-sign-subscript" style="display: inline-block;margin-left: 3px;"></div>','<div id="id-dlg-sign-superscript" style="display: inline-block;margin-left: 3px;"></div>',
                    '<div style="margin-top: 15px;">',
                        '<div style="display: inline-block;margin-right: 10px;">',
                            '<label style="font-weight: bold;">' + this.textLeft + '</label>',
                            '<div style="border: 1px solid #cbcbcb;width: 200px; height: 150px; position:relative; overflow:hidden;">',
                                '<div id="headerfooter-left-img" style="width: 190px; height: 100%;"></div>',
                            '</div>',
                        '</div>',
                        '<div style="display: inline-block;margin-right: 10px;">',
                            '<label style="font-weight: bold;">' + this.textCenter + '</label>',
                            '<div style="border: 1px solid #cbcbcb;width: 200px; height: 150px; position:relative; overflow:hidden;">',
                                '<div id="headerfooter-center-img" style="width: 190px; height: 100%;"></div>',
                            '</div>',
                        '</div>',
                        '<div style="display: inline-block;">',
                            '<label style="font-weight: bold;">' + this.textRight + '</label>',
                            '<div style="border: 1px solid #cbcbcb;width: 200px; height: 150px; position:relative; overflow:hidden;">',
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
                el          : $('#id-dlg-sign-fonts'),
                cls         : 'input-group-nr',
                style       : 'width: 234px;',
                menuCls     : 'scrollable-menu',
                menuStyle   : 'min-width: 234px;max-height: 270px;',
                store       : new Common.Collections.Fonts(),
                recent      : 0,
                hint        : me.tipFontName
            }).on('selected', function(combo, record) {
                if (me.signObject) {
                    me.signObject.setText('Some text', record.name, me.font.size, me.font.italic, me.font.bold);
                    me.scrollerUpdate();
                }
                me.font.name = record.name;
            });

            this.cmbFontSize = new Common.UI.ComboBox({
                el: $('#id-dlg-sign-font-size'),
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
                if (me.signObject) {
                    me.signObject.setText('Some text', me.font.name, record.value, me.font.italic, me.font.bold);
                    me.scrollerUpdate();
                }
                me.font.size = record.value;
            });
            this.cmbFontSize.setValue(this.font.size);

            me.btnBold = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'btn-bold',
                enableToggle: true,
                hint: me.textBold
            });
            me.btnBold.render($('#id-dlg-sign-bold')) ;
            me.btnBold.on('click', function(btn, e) {
                if (me.signObject) {
                    me.signObject.setText('Some text', me.font.name, me.font.size, me.font.italic, btn.pressed);
                    me.scrollerUpdate();
                }
                me.font.bold = btn.pressed;
            });

            me.btnItalic = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'btn-italic',
                enableToggle: true,
                hint: me.textItalic
            });
            me.btnItalic.render($('#id-dlg-sign-italic')) ;
            me.btnItalic.on('click', function(btn, e) {
                if (me.signObject) {
                    me.signObject.setText('Some text', me.font.name, me.font.size, btn.pressed, me.font.bold);
                    me.scrollerUpdate();
                }
                me.font.italic = btn.pressed;
            });

            me.btnUnderline = new Common.UI.Button({
                cls         : 'btn-toolbar',
                iconCls     : 'btn-underline',
                enableToggle: true,
                hint: me.textUnderline
            });
            me.btnUnderline.render($('#id-dlg-sign-underline')) ;
            me.btnUnderline.on('click', function(btn, e) {
                if (me.signObject) {
                    me.signObject.setText('Some text', me.font.name, me.font.size, me.font.italic, me.font.bold);
                    me.scrollerUpdate();
                }
                me.font.underline = btn.pressed;
            });

            me.btnStrikeout = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'btn-strikeout',
                enableToggle: true,
                hint: me.textStrikeout
            });
            me.btnStrikeout.render($('#id-dlg-sign-strikeout')) ;
            me.btnStrikeout.on('click', function(btn, e) {
                if (me.signObject) {
                    me.signObject.setText('Some text', me.font.name, me.font.size, me.font.italic, me.font.bold);
                    me.scrollerUpdate();
                }
                me.font.strikeout = btn.pressed;
            });

            this.btnSuperscript = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'btn-superscript',
                enableToggle: true,
                toggleGroup: 'superscriptHFGroup',
                hint: me.textSuperscript
            });
            me.btnSuperscript.render($('#id-dlg-sign-superscript')) ;
            me.btnSuperscript.on('click', function(btn, e) {
                if (me.signObject) {
                    me.signObject.setText('Some text', me.font.name, me.font.size, me.font.italic, me.font.bold);
                    me.scrollerUpdate();
                }
                me.font.superscript = btn.pressed;
            });

            this.btnSubscript = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'btn-subscript',
                enableToggle: true,
                toggleGroup: 'superscriptHFGroup',
                hint: me.textSubscript
            });
            me.btnSubscript.render($('#id-dlg-sign-subscript')) ;
            me.btnSubscript.on('click', function(btn, e) {
                if (me.signObject) {
                    me.signObject.setText('Some text', me.font.name, me.font.size, me.font.italic, me.font.bold);
                    me.scrollerUpdate();
                }
                me.font.subscript = btn.pressed;
            });

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

            if (this.signObject)
                this.signObject.destroy();
            // if (this.HFObject)
            //     this.HFObject.destroy();
        },

        afterRender: function () {
            this.cmbFonts.fillFonts(this.fontStore);
            this.cmbFonts.selectRecord(this.fontStore.findWhere({name: this.font.name}) || this.fontStore.at(0));

            // this.signObject = new AscCommon.CSignatureDrawer('headerfooter-left-img', this.api, 50, 50);
            this.HFObject = new AscCommonExcel.CHeaderFooterEditor('headerfooter-left-img', 'headerfooter-center-img', 'headerfooter-right-img', 190);


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
            this.close();
        },

        scrollerUpdate: function() {
            this.scrollerYL.update();
            this.scrollerYR.update();
            this.scrollerYC.update();
        },

        onCanvasClick: function(id, event){
            this.HFObject.click(id, event.pageX*Common.Utils.zoom(), event.pageY*Common.Utils.zoom());
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
        textRight: 'Right'

    }, SSE.Views.HeaderFooterDialog || {}))
});