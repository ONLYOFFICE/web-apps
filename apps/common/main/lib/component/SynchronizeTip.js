/*
 * (c) Copyright Ascensio System SIA 2010-2023
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
if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/component/BaseView'
], function () {
    'use strict';

    Common.UI.SynchronizeTip = Common.UI.BaseView.extend(_.extend((function() {
        return {
            options : {
                target  : $(document.body),
                text    : '',
                placement: 'right-bottom',
                showLink: true,
                showButton: false,
                closable: true
            },

            template: _.template([
                '<div class="synch-tip-root <% if (!!scope.options.extCls) {print(scope.options.extCls + \" \");} %><%= scope.placement %>" style="<%= scope.style %>">',
                    '<div class="asc-synchronizetip">',
                        '<div class="tip-arrow <%= scope.placement %>"></div>',
                        '<div>',
                            '<div class="tip-text"><%= scope.text %></div>',
                            '<% if ( scope.closable ) { %>',
                            '<div class="close"></div>',
                            '<% } %>',
                        '</div>',
                        '<% if ( scope.showLink ) { %>',
                        '<div class="show-link"><label><%= scope.textLink %></label></div>',
                        '<% } %>',
                        '<% if ( scope.showButton ) { %>',
                        '<div class="btn-div"><%= scope.textButton %></div>',
                        '<% } %>',
                    '</div>',
                '</div>'
            ].join('')),

            initialize : function(options) {
                this.textSynchronize += Common.Utils.String.platformKey('Ctrl+S');
                
                Common.UI.BaseView.prototype.initialize.call(this, options);
                this.target = this.options.target;
                this.text = !_.isEmpty(this.options.text) ? this.options.text : this.textSynchronize;
                this.textLink = !_.isEmpty(this.options.textLink) ? this.options.textLink : this.textDontShow;
                this.placement = this.options.placement; // if placement='target' and position is undefined  show in top,left position of target, also use for arrow position
                this.showLink = this.options.showLink;
                this.showButton = this.options.showButton;
                this.closable = this.options.closable;
                this.textButton = this.options.textButton || '';
                this.position = this.options.position; // show in the position relative to target
                this.style = this.options.style || '';
            },

            render: function() {
                if (!this.cmpEl) {
                    this.cmpEl = $(this.template({ scope: this }));
                    $(document.body).append(this.cmpEl);
                    this.cmpEl.find('.close').on('click', _.bind(function() { this.trigger('closeclick');}, this));
                    this.cmpEl.find('.show-link label').on('click', _.bind(function() { this.trigger('dontshowclick');}, this));
                    this.cmpEl.find('.btn-div').on('click', _.bind(function() { this.trigger('buttonclick');}, this));

                    this.closable && this.cmpEl.addClass('closable');
                }

                this.applyPlacement();

                return this;
            },

            show: function(){
                if (this.cmpEl) {
                    this.applyPlacement();
                    this.cmpEl.show()
                } else
                    this.render();
            },

            hide: function() {
                if (this.cmpEl) this.cmpEl.hide();
                this.trigger('hide');
            },

            close: function() {
                if (this.cmpEl) this.cmpEl.remove();
                this.trigger('close');
            },

            applyPlacement: function () {
                var target = this.target && this.target.length>0 ? this.target : $(document.body);
                var showxy = target.offset();
                if (this.placement=='target' && !this.position) {
                    this.cmpEl.css({top : showxy.top + 5 + 'px', left: showxy.left + 5 + 'px'});
                    return;
                }

                if (this.position && typeof this.position == 'object') {
                    var top = this.position.top, left = this.position.left, bottom = this.position.bottom, right = this.position.right;
                    if (bottom!==undefined || top!==undefined)
                        left = showxy.left + (target.width() - this.cmpEl.width())/2;
                    else
                        top = showxy.top + (target.height() - this.cmpEl.height())/2;
                    top = (top!==undefined) ? (top + 'px') : 'auto';
                    bottom = (bottom!==undefined) ? (bottom + 'px') : 'auto';
                    right = (right!==undefined) ? (right + 'px') : 'auto';
                    left = (left!==undefined) ? (left + 'px') : 'auto';

                    this.cmpEl.css({top : top, left: left, right: right, bottom: bottom});
                    return;
                }

                var placement = this.placement.split('-');
                if (placement.length>0) {
                    var top, left, bottom, right;
                    var pos = placement[0];
                    if (pos=='top') {
                        bottom = Common.Utils.innerHeight() - showxy.top;
                    } else if (pos == 'bottom') {
                        top = showxy.top + target.height();
                    } else if (pos == 'left') {
                        right = Common.Utils.innerWidth() - showxy.left;
                    } else if (pos == 'right') {
                        left = showxy.left + target.width();
                    }
                    pos = placement[1];
                    if (pos=='top') {
                        bottom = Common.Utils.innerHeight() - showxy.top - target.height()/2;
                    } else if (pos == 'bottom') {
                        top = showxy.top + target.height()/2;
                        var height = this.cmpEl.height();
                        if (top+height>Common.Utils.innerHeight())
                            top = Common.Utils.innerHeight() - height - 10;
                    } else if (pos == 'left') {
                        right = Common.Utils.innerWidth() - showxy.left - target.width()/2;
                    } else if (pos == 'right') {
                        left = showxy.left + target.width()/2;
                    } else {
                        if (bottom!==undefined || top!==undefined)
                            left = showxy.left + (target.width() - this.cmpEl.width())/2;
                        else
                            top = showxy.top + (target.height() - this.cmpEl.height())/2;
                    }
                    top = (top!==undefined) ? (top + 'px') : 'auto';
                    bottom = (bottom!==undefined) ? (bottom + 'px') : 'auto';
                    right = (right!==undefined) ? (right + 'px') : 'auto';
                    if (left!==undefined) {
                        var width = this.cmpEl.width();
                        if (left+width>Common.Utils.innerWidth())
                            left = Common.Utils.innerWidth() - width - 10;
                        left = (left + 'px');
                    } else
                        left = 'auto';
                    this.cmpEl.css({top : top, left: left, right: right, bottom: bottom});
                }
            },

            isVisible: function() {
                return this.cmpEl && this.cmpEl.is(':visible');
            },

            textDontShow        : 'Don\'t show this message again',
            textSynchronize     : 'The document has been changed by another user.<br>Please click to save your changes and reload the updates.'
        }
    })(), Common.UI.SynchronizeTip || {}));
});

