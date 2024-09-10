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
 *  LoadMask.js
 *
 *  Displays loading mask over selected element(s) or component. Accepts both single and multiple selectors.
 *
 *  Created on 2/7/14
 *
 */

/**
 * @example
 *      new Common.UI.LoadMask({
 *          owner: $('#viewport')
 *      });
 *
 *  @property {Object} owner
 *
 *  Component or selector that will be masked.
 *
 *
 *  @property {String} title
 *
 *  @property {String} cls
 *
 *  @property {String} style
 *
 */

if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/component/BaseView'
], function () {
    'use strict';

    Common.UI.LoadMask = Common.UI.BaseView.extend((function() {
        return {
            options : {
                cls     : '',
                style   : '',
                title   : 'Loading...',
                owner   : document.body
            },

            template: _.template([
                '<div id="<%= id %>" class="asc-loadmask-body <%= cls %>" role="presentation" tabindex="-1">',
                    '<i id="loadmask-spinner" class="asc-loadmask-image"></i>',
                    '<div class="asc-loadmask-title"><%= title %></div>',
                '</div>'
            ].join('')),

            initialize : function(options) {
                Common.UI.BaseView.prototype.initialize.call(this, options);

                this.template   = this.options.template || this.template;
                this.title      = this.options.title;

                this.ownerEl     = (this.options.owner instanceof Common.UI.BaseView) ? $(this.options.owner.el) : $(this.options.owner);
                this.loaderEl    = $(this.template({
                    id      : this.id,
                    cls     : this.options.cls,
                    style   : this.options.style,
                    title   : this.title
                }));
                this.maskeEl = $('<div class="asc-loadmask"></div>');
                this.timerId = 0;
            },

            render: function() {
                return this;
            },

            internalShowLoader: function() {
                this.ownerEl.append(this.loaderEl);
                this.loaderEl.css('min-width', $('.asc-loadmask-title', this.loaderEl).width() + 105);

                if (this.ownerEl && this.ownerEl.closest('.asc-window.modal').length==0)
                    Common.util.Shortcuts.suspendEvents();
            },

            internalShowMask: function() {
                if (!!this.ownerEl.ismasked) return;

                this.ownerEl.ismasked = true;
                this.ownerEl.append(this.maskeEl);
            },

            show: function(immediately){
                this.internalShowMask();

                // The owner is already masked
                if (!!this.ownerEl.hasloader)
                    return this;

                this.ownerEl.hasloader = true;

                var me = this;
                if (me.title != me.options.title) {
                    me.options.title = me.title;
                    $('.asc-loadmask-title', this.loaderEl).html(me.title);
                }

                if (immediately) {
                    me.internalShowLoader();
                } else if (!me.timerId) {
                    // show mask after 500 ms if it wont be hided
                    me.timerId = setTimeout(function () {
                        me.internalShowLoader();
                    },500);
                }

                return this;
            },

            hide: function() {
                var ownerEl = this.ownerEl;
                if (this.timerId) {
                    clearTimeout(this.timerId);
                    this.timerId = 0;
                }

                ownerEl && ownerEl.ismasked && this.maskeEl && this.maskeEl.remove();
                delete ownerEl.ismasked;

                if (ownerEl && ownerEl.hasloader) {
                    if (ownerEl.closest('.asc-window.modal').length==0 && !Common.Utils.ModalWindow.isVisible())
                        Common.util.Shortcuts.resumeEvents();

                    this.loaderEl    && this.loaderEl.remove();
                }
                delete ownerEl.hasloader;
            },

            setTitle: function(title) {
                this.title = title;

                if (this.ownerEl && this.ownerEl.hasloader && this.loaderEl){
                    var el = $('.asc-loadmask-title', this.loaderEl);
                    el.html(title);
                    this.loaderEl.css('min-width', el.width() + 105);
                }
            },

            isVisible: function() {
                return !!this.ownerEl.ismasked;
            },

            updatePosition: function() {
                var ownerEl = this.ownerEl,
                    loaderEl = this.loaderEl;
                if (ownerEl && ownerEl.hasloader && loaderEl){
                    loaderEl.css({
                        top : Math.round(ownerEl.height() / 2 - (loaderEl.height() + parseInt(loaderEl.css('padding-top'))  + parseInt(loaderEl.css('padding-bottom'))) / 2) + 'px',
                        left: Math.round(ownerEl.width()  / 2 - (loaderEl.width()  + parseInt(loaderEl.css('padding-left')) + parseInt(loaderEl.css('padding-right')))  / 2) + 'px'
                    });
                    loaderEl.css({visibility: 'visible'});
                }
            }
        }
    })())
});

