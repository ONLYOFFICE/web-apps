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
            this.btnNamedRanges.menu.setOffset(Common.UI.isRTL() ? 81 : -81);

            this.$cellname = $('#ce-cell-name', this.el);
            this.$btnexpand = $('#ce-btn-expand', this.el);
            this.$btnfunc = $('#ce-func-label', this.el);
            this.$cellcontent = $('#ce-cell-content', this.el);
            this.$cellgroupname = this.$btnexpand.parent();

            var me = this;
            this.$cellname.on('focus', function(e){
                var txt = me.$cellname[0];
                txt.selectionStart = 0;
                txt.selectionEnd = txt.value.length;
                txt.scrollLeft = txt.scrollWidth;
            });

            this.$btnfunc.addClass('disabled');
            this.$btnfunc.tooltip({
                title       : this.tipFormula,
                placement   : 'cursor'
            });
            this.$btnfunc.attr('ratio', 'ratio');
            this.applyScaling(Common.UI.Scaling.currentRatio());
            this.$btnfunc.on('app:scaling', function (e, info) {
                me.applyScaling(info.ratio);
            });

            return this;
        },

        updateCellInfo: function(info) {
            if (info) {
                this.$cellname.val(typeof(info)=='string' ? info : info.asc_getName());
            }
        },

        cellNameDisabled: function(disabled){
            (disabled) ? this.$cellname.attr('disabled', 'disabled') : this.$cellname.removeAttr('disabled');
            this.btnNamedRanges.setDisabled(disabled);
        },

        applyScaling: function (ratio) {
            if (ratio > 2 && !this.$btnfunc.find('svg.icon').length) {
                var icon_name = 'btn-function',
                    svg_icon = '<svg class="icon"><use class="zoom-int" href="#%iconname"></use></svg>'.replace('%iconname', icon_name);
                this.$btnfunc.find('i.icon').after(svg_icon);
            }
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
