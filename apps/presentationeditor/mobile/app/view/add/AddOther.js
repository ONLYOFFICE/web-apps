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

                    this.fireEvent('page:show', [this, templateId]);
                }
            },

            showPageComment: function(animate) {
                this.showPage('#addother-insert-comment', animate);
            },

            renderComment: function(comment) {
                _.delay(function () {
                    var $commentInfo = $('#comment-info');
                    var template = [
                        '<% if (android) { %><div class="header-comment"><div class="initials-comment" style="background-color: <%= comment.usercolor %>;"><%= comment.userInitials %></div><div><% } %>',
                        '<div class="user-name"><%= comment.username %></div>',
                        '<div class="comment-date"><%= comment.date %></div>',
                        '<% if (android) { %></div></div><% } %>',
                        '<div class="wrap-textarea"><textarea id="comment-text" class="comment-textarea" autofocus></textarea></div>'
                    ].join('');
                    var insert = _.template(template)({
                        android: Framework7.prototype.device.android,
                        comment: comment
                    });
                    $commentInfo.html(insert);
                    _.defer(function () {
                        var $textarea = $('.comment-textarea')[0];
                        $textarea.focus();
                    });
                }, 100);
            },

            textComment: 'Comment',
            textAddComment: 'Add Comment',
            textDone: 'Done'

        }
    })(), PE.Views.AddOther || {}))
});