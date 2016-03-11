/**
 *  LoadMask.js
 *
 *  Displays loading mask over selected element(s) or component. Accepts both single and multiple selectors.
 *
 *  Created by Alexander Yuzhin on 2/7/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
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
        var ownerEl,
            maskeEl,
            loaderEl;

        return {
            options : {
                cls     : '',
                style   : '',
                title   : 'Loading...',
                owner   : document.body
            },

            template: _.template([
                '<div id="<%= id %>" class="asc-loadmask-body <%= cls %>" role="presentation" tabindex="-1">',
                '<div class="asc-loadmask-image"></div>',
                '<div class="asc-loadmask-title"><%= title %></div>',
                '</div>'
            ].join('')),

            initialize : function(options) {
                Common.UI.BaseView.prototype.initialize.call(this, options);

                this.template   = this.options.template || this.template;
                this.cls        = this.options.cls;
                this.style      = this.options.style;
                this.title      = this.options.title;
                this.owner      = this.options.owner;
            },

            render: function() {
                return this;
            },

            show: function(){
                if (maskeEl || loaderEl)
                    return;

                ownerEl = (this.owner instanceof Common.UI.BaseView) ? $(this.owner.el) : $(this.owner);

                // The owner is already masked
                if (ownerEl.hasClass('masked'))
                    return this;

                var me = this;

                maskeEl     = $('<div class="asc-loadmask"></div>');
                loaderEl    = $(this.template({
                    id      : me.id,
                    cls     : me.cls,
                    style   : me.style,
                    title   : me.title
                }));

                ownerEl.addClass('masked');
                ownerEl.append(maskeEl);
                ownerEl.append(loaderEl);

                loaderEl.css({
                    top : Math.round(ownerEl.height() / 2 - (loaderEl.height() + parseInt(loaderEl.css('padding-top'))  + parseInt(loaderEl.css('padding-bottom'))) / 2) + 'px',
                    left: Math.round(ownerEl.width()  / 2 - (loaderEl.width()  + parseInt(loaderEl.css('padding-left')) + parseInt(loaderEl.css('padding-right')))  / 2) + 'px'

                });

                Common.util.Shortcuts.suspendEvents();

                return this;
            },

            hide: function() {
                ownerEl     && ownerEl.removeClass('masked');
                maskeEl     && maskeEl.remove();
                loaderEl    && loaderEl.remove();
                maskeEl  = null;
                loaderEl = null;
                Common.util.Shortcuts.resumeEvents();
            },

            setTitle: function(title) {
                this.title = title;

                if (ownerEl && ownerEl.hasClass('masked') && loaderEl){
                    $('.asc-loadmask-title', loaderEl).html(title);
                }

            },

            isVisible: function() {
                return !_.isEmpty(loaderEl);
            }
        }
    })())
});

