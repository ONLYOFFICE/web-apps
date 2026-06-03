/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/**
 *    CellEdit.js
 *
 *    Created on 04 April 2014
 *
 */

define([
    'text!spreadsheeteditor/main/app/template/CellEditor.template',
    'common/main/lib/component/BaseView'
], function (template) {
    'use strict';

    SSE.Views.CellEditor = Common.UI.BaseView.extend(_.extend({
        template: _.template(template),

        initialize: function (options) {
            Common.UI.BaseView.prototype.initialize.call(this, options);
        },

        render: function () {
            $(this.el).html(this.template());

            this.btnNamedRanges = new Common.UI.Button({
                parentEl: $('#ce-cell-name-menu'),
                menu        : new Common.UI.Menu({
                    style   : 'min-width: 70px;max-width:400px;',
                    maxHeight: 250,
                    items: [
                        { caption: this.textManager, value: 'manager' },
                        { caption: '--' }
                    ]
                })
            });
            this.btnNamedRanges.setVisible(false);
            this.btnNamedRanges.menu.setOffset(Common.UI.isRTL() ? 84 : -84);

            this.$cellname = $('#ce-cell-name', this.el);
            this.$btnexpand = $('#ce-btn-expand', this.el);
            this.$btnfunc = $('#ce-func-label', this.el);
            this.btnfunc = new Common.UI.Button({
                el: this.$btnfunc,
                dataHint    : '1',
                dataHintDirection: 'bottom'
            });

            this.$cellcontent = $('#ce-cell-content', this.el);
            this.$cellgroupname = this.$btnexpand.parent();

            var me = this;
            this.$cellname.on('focus', function(e){
                var txt = me.$cellname[0];
                txt.selectionStart = 0;
                txt.selectionEnd = txt.value.length;
                txt.scrollLeft = txt.scrollWidth;
            });
            this.btnfunc.setDisabled(true)
            this.btnfunc.updateHint(this.tipFormula)

            return this;
        },

        setMode: function(mode) {
            this.mode = mode;
            this.mode.isEditDiagram && this.cellNameDisabled(true);
        },

        updateCellInfo: function(info) {
            if (info) {
                this.$cellname.val(typeof(info)=='string' ? info : info.asc_getName());
            }
        },

        cellNameDisabled: function(disabled){
            if (this.mode && this.mode.isEditDiagram) disabled = true;
            (disabled) ? this.$cellname.attr('disabled', 'disabled') : this.$cellname.removeAttr('disabled');
            this.btnNamedRanges.setDisabled(disabled);
        },

        cellEditorTextChange: function (){
            if (!this.$cellcontent) return;

            var cellcontent = this.$cellcontent[0];

            if (cellcontent.clientHeight != cellcontent.scrollHeight) {
                if ( !this._isScrollShow ) {
                    this._isScrollShow = true;
                    var scrollBarWidth = cellcontent.offsetWidth - cellcontent.clientWidth;
                    this.$cellgroupname.css({
                        'right': Common.UI.isRTL() ? '' : scrollBarWidth + "px",
                        'left': Common.UI.isRTL() ? scrollBarWidth + "px" : ''
                    });
                }
            } else {
                if ( this._isScrollShow ) {
                    this._isScrollShow = false;
                    this.$cellgroupname.css({'right': '', 'left': ''});
                }
            }
        },

        tipFormula: 'Insert Function',
        textManager: 'Manager'
    }, SSE.Views.CellEditor || {}));
});
