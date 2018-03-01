/*
 *
 * (c) Copyright Ascensio System Limited 2010-2018
 *
 * This program is freeware. You can redistribute it and/or modify it under the terms of the GNU
 * General Public License (GPL) version 3 as published by the Free Software Foundation (https://www.gnu.org/copyleft/gpl.html).
 * In accordance with Section 7(a) of the GNU GPL its Section 15 shall be amended to the effect that
 * Ascensio System SIA expressly excludes the warranty of non-infringement of any third-party rights.
 *
 * THIS PROGRAM IS DISTRIBUTED WITHOUT ANY WARRANTY; WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR
 * FITNESS FOR A PARTICULAR PURPOSE. For more details, see GNU GPL at https://www.gnu.org/copyleft/gpl.html
 *
 * You can contact Ascensio System SIA by email at sales@onlyoffice.com
 *
 * The interactive user interfaces in modified source and object code versions of ONLYOFFICE must display
 * Appropriate Legal Notices, as required under Section 5 of the GNU GPL version 3.
 *
 * Pursuant to Section 7  3(b) of the GNU GPL you must retain the original ONLYOFFICE logo which contains
 * relevant author attributions when distributing the software. If the display of the logo in its graphic
 * form is not reasonably feasible for technical reasons, you must include the words "Powered by ONLYOFFICE"
 * in every copy of the program you distribute.
 * Pursuant to Section 7  3(e) we decline to grant you any rights under trademark law for use of our trademarks.
 *
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

