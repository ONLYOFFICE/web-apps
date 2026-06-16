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

define([
    'common/main/lib/component/BaseView'
], function () {
    'use strict';

    DE.Views.FootnoteTip = Common.UI.BaseView.extend(_.extend((function() {
        var tipEl;

        return {
            options : {
                name    : '',
                text    : '',
                target  : null,
                placement: 'bottom'
            },

            template: _.template([
                '<div class="footnote-tip-root <%= scope.placement %>">',
                    '<div class="asc-footnotetip">',
                        '<div class="tip-arrow"></div>',
                        '<div>',
                            '<label class="tip-name" style="width: 220px;"><%= scope.name %></label>',
                            '<label class="tip-text" style="width: 220px;"><%= scope.text %></label>',
                            '<div class="move-ct">',
                                '<button id="footnote-btn-prev" type="button" class="btn btn-toolbar"><span class="prev img-commonctrl">&nbsp;</span></button>',
                                '<button id="footnote-btn-next" type="button" class="btn btn-toolbar"><span class="next img-commonctrl">&nbsp;</span></button>',
                            '</div>',
                        '</div>',
                        '<div class="show-link"><label><%= scope.textSettings %></label></div>',
                    '</div>',
                '</div>'
            ].join('')),

            initialize : function(options) {
                Common.UI.BaseView.prototype.initialize.call(this, options);
                this.text = this.options.text;
                this.name = this.options.name;
                this.target = this.options.target;
                this.placement = this.options.placement;
            },

            render: function() {
                tipEl = $(this.template({ scope: this }));

                this.btnPrev = new Common.UI.Button({
                    el: $('#footnote-btn-prev',tipEl)
                });

                this.btnNext = new Common.UI.Button({
                    el: $('#footnote-btn-next',tipEl)
                });

                tipEl.find('.show-link label').on('click', _.bind(function() { this.trigger('settingsclick');}, this));
                this.btnPrev.on('click', _.bind(function(btn) {
                    this.trigger('prevclick');
                }, this));
                this.btnNext.on('click', _.bind(function(btn) {
                    this.trigger('nextclick');
                }, this));
                
                this.lblName = tipEl.find('.tip-name');
                this.lblText = tipEl.find('.tip-text');

                $(document.body).append(tipEl);
                this.applyPlacement(this.target);

                return this;
            },

            show: function(name, text, target){
                if (tipEl) {
                    this.lblName.text(name);
                    this.lblText.text(text);
                    this.applyPlacement(target);
                    tipEl.show()
                } else
                    this.render();
            },

            hide: function() {
                if (tipEl) tipEl.hide();
            },

            applyPlacement: function (target) {
                if (!target)
                    target = {top: 0, left: 0, width: 1, height: 1};
                var docHeight = Common.Utils.innerHeight(),
                    elHeight = tipEl.height(),
                    elWidth = tipEl.width(),
                    placement = this.placement;
                
                if (this.placement == 'bottom') {
                    if (target.top + target.height + elHeight > docHeight)
                        placement = 'top';
                } else if (this.placement == 'top') {
                    if (target.top - elHeight < 0)
                        placement = 'bottom';
                }
                tipEl.removeClass(placement == 'top' ? 'bottom' : 'top');
                tipEl.addClass(placement);
                (placement == 'top') ? tipEl.css({top: 'auto', bottom : docHeight - target.top + 'px', left: target.left + target.width/2 - elWidth/2 + 'px'})
                                     : tipEl.css({top : target.top + target.height + 'px', bottom: 'auto', left: target.left + target.width/2  - elWidth/2 + 'px'});
            },

            textSettings: 'Note Settings'
        }
    })(), DE.Views.FootnoteTip || {}));
});

