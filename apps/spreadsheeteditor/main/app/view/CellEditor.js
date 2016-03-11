/**
 *    CellEdit.js
 *
 *    Created by Maxim Kadushkin on 04 April 2014
 *    Copyright (c) 2014 Ascensio System SIA. All rights reserved.
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
                menu        : new Common.UI.Menu({
                    style   : 'min-width: 70px;max-width:400px;',
                    maxHeight: 250,
                    items: [
                        { caption: this.textManager, value: 'manager' },
                        { caption: '--' }
                    ]
                }).on('render:after', function(mnu) {
                        this.scroller = new Common.UI.Scroller({
                        el: $(this.el).find('.dropdown-menu '),
                        useKeyboard: this.enableKeyEvents && !this.handleSelect,
                        minScrollbarLength  : 40
                    });
                }).on('show:after', function () {
                    this.scroller.update({alwaysVisibleY: true});
                })
            });
            this.btnNamedRanges.render($('#ce-cell-name-menu'));
            this.btnNamedRanges.setVisible(false);
            this.btnNamedRanges.menu.setOffset(-55);

            this.$cellname = $('#ce-cell-name', this.el);
            this.$btnexpand = $('#ce-btn-expand', this.el);
            this.$btnfunc = $('#ce-func-label', this.el);

            var me = this;
            this.$cellname.on('focusin', function(e){
                me.$cellname.select().one('mouseup', function (e) {e.preventDefault();});
            });

            this.$btnfunc.addClass('disabled');
            this.$btnfunc.tooltip({
                title       : this.tipFormula,
                placement   : 'cursor'
            });

            return this;
        },

        updateCellInfo: function(info) {
            if (info) {
                this.$cellname.val(typeof(info)=='string' ? info : info.asc_getName());
            }
        },

        tipFormula: 'Insert Function',
        textManager: 'Manager'
    }, SSE.Views.CellEditor || {}));
});
