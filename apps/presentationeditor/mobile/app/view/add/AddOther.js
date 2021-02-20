/*
 *
 * (c) Copyright Ascensio System SIA 2010-2019
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
 * You can contact Ascensio System SIA at 20A-12 Ernesta Birznieka-Upisha
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
 *  AddOther.js
 *  Presentation Editor
 *
 *  Created by Julia Svinareva on 10/04/20
 *  Copyright (c) 2020 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!presentationeditor/mobile/app/template/AddOther.template',
    'jquery',
    'underscore',
    'backbone'
], function (addTemplate, $, _, Backbone) {
    'use strict';

    PE.Views.AddOther = Backbone.View.extend(_.extend((function() {
        // private

        return {
            // el: '.view-main',

            template: _.template(addTemplate),

            events: {
            },

            initialize: function () {
                Common.NotificationCenter.on('addcontainer:show', _.bind(this.initEvents, this));
            },

            initEvents: function () {
                if (this.hideInsertComments) {
                    $('#item-comment').hide();
                } else {
                    $('#item-comment').show();
                    $('#add-other-comment').single('click',     _.bind(this.showPageComment, this));
                }
                $('#add-other-table').single('click',     _.bind(this.showPageTable, this));
                if (this.hideInsertLink) {
                    $('#item-link').hide();
                } else {
                    $('#item-link').show();
                    $('#add-other-link').single('click',     _.bind(this.showPageLink, this));
                }

                this.initControls();
            },

            // Render layout
            render: function () {
                this.layout = $('<div/>').append(this.template({
                    android : Common.SharedSettings.get('android'),
                    phone   : Common.SharedSettings.get('phone'),
                    scope   : this
                }));

                return this;
            },

            rootLayout: function () {
                if (this.layout) {
                    if (!this.canViewComments) {
                        this.layout.find('#addother-root-view #item-comment').remove();
                    }
                    return this.layout
                        .find('#addother-root-view')
                        .html();
                }

                return '';
            },

            initControls: function () {
                //
            },

            showPage: function (templateId, animate) {
                var rootView = PE.getController('AddContainer').rootView;

                if (rootView && this.layout) {
                    var $content = this.layout.find(templateId);

                    // Android fix for navigation
                    if (Framework7.prototype.device.android) {
                        $content.find('.page').append($content.find('.navbar'));
                    }

                    rootView.router.load({
                        content: $content.html(),
                        animatePages: animate !== false
                    });

                    if (templateId === '#addother-insert-link') {
                        this.fireEvent('category:show', [this, templateId]);
                    } else {
                        this.fireEvent('page:show', [this, templateId]);
                    }
                }
            },

            showPageComment: function(animate) {
                this.showPage('#addother-insert-comment', animate);
            },

            renderComment: function(comment) {
                var me = this;
                _.delay(function () {
                    var $commentInfo = $('#comment-info');
                    var template = [
                        '<% if (android) { %><div class="header-comment"><div class="initials-comment" style="background-color: <% if (comment.usercolor!==null) { %><%=comment.usercolor%><% } else { %> #cfcfcf <% } %>;"><%= comment.userInitials %></div><div><% } %>',
                        '<div class="user-name"><%= scope.getUserName(comment.username) %></div>',
                        '<div class="comment-date"><%= comment.date %></div>',
                        '<% if (android) { %></div></div><% } %>',
                        '<div class="wrap-textarea"><textarea id="comment-text" class="comment-textarea" placeholder="<%= textAddComment %>" autofocus></textarea></div>'
                    ].join('');
                    var insert = _.template(template)({
                        android: Framework7.prototype.device.android,
                        comment: comment,
                        textAddComment: me.textAddComment,
                        scope: me
                    });
                    $commentInfo.html(insert);
                    _.defer(function () {
                        var $textarea = $('.comment-textarea')[0];
                        var $btnAddComment = $('#done-comment');
                        $btnAddComment.addClass('disabled');
                        $textarea.focus();
                        $textarea.oninput = function () {
                            if ($textarea.value.length < 1) {
                                if (!$btnAddComment.hasClass('disabled'))
                                    $btnAddComment.addClass('disabled');
                            } else {
                                if ($btnAddComment.hasClass('disabled')) {
                                    $btnAddComment.removeClass('disabled');
                                }
                            }
                        };
                    });
                }, 100);
            },

            getUserName: function (username) {
                return Common.Utils.String.htmlEncode(Common.Utils.UserInfoParser.getParsedName(username));
            },
            
            showPageTable: function() {
                this.showPage('#addother-insert-table');
                this.renderTableStyles();
                PE.getController('AddTable').initEvents();
            },

            renderTableStyles: function() {
                var $stylesList = $('.table-styles ul');
                var template = [
                    '<% _.each(styles, function(style) { %>',
                    '<li data-type="<%= style.templateId %>">',
                    '<img src="<%= style.imageUrl %>">',
                    '</li>',
                    '<% }); %>'
                ].join('');
                var insert = _.template(template)({
                    android : Common.SharedSettings.get('android'),
                    phone   : Common.SharedSettings.get('phone'),
                    styles  : PE.getController('AddTable').getStyles()
                });
                $stylesList.html(insert);
            },

            showPageLink: function() {
                this.showPage('#addother-insert-link');
                $('#add-link-number').single('click',  _.bind(this.showPageNumber, this));
                $('#add-link-type').single('click',  _.bind(this.showLinkType, this));
            },

            showLinkType: function () {
                this.showPage('#addlink-type');
            },

            showPageNumber: function () {
                this.showPage('#addlink-slidenumber');
            },

            textComment: 'Comment',
            textAddComment: 'Add Comment',
            textDone: 'Done',
            textTable: 'Table',
            textLinkType: 'Link Type',
            textExternalLink: 'External Link',
            textInternalLink: 'Slide in this Presentation',
            textLink: 'Link',
            textLinkSlide: 'Link to',
            textBack: 'Back',
            textDisplay: 'Display',
            textTip: 'Screen Tip',
            textInsert: 'Insert',
            textNext: 'Next Slide',
            textPrev: 'Previous Slide',
            textFirst: 'First Slide',
            textLast: 'Last Slide',
            textNumber: 'Slide Number'

        }
    })(), PE.Views.AddOther || {}))
});