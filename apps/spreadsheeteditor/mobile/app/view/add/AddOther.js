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
 *
 *  Created by Kadushkin Maxim on 12/07/2016
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!spreadsheeteditor/mobile/app/template/AddOther.template',
    'backbone'
], function (addTemplate, Backbone) {
    'use strict';

    SSE.Views.AddOther = Backbone.View.extend(_.extend((function() {
        // private

        var tplNavigation = '<div class="navbar">' +
                                '<div class="navbar-inner">' +
                                    '<div class="left sliding">' +
                                        '<a href="#" class="back link">' +
                                            '<i class="icon icon-back"></i>' +
                                            '<% if (!android) { %><span><%= textBack %></span><% } %>' +
                                        '</a>' +
                                    '</div>' +
                                    '<div class="center sliding"><%= title %></div>' +
                                '</div>' +
                            '</div>';

        var mapNavigation = {};

        var tplNavigationComment = '<div class="navbar">' +
                                        '<div class="navbar-inner">' +
                                            '<div class="left sliding">' +
                                                '<a href="#" class="back-from-add-comment link">' +
                                                    '<i class="icon icon-back"></i>' +
                                                    '<% if (!android) { %><span><%= textBack %></span><% } %>' +
                                                '</a>' +
                                            '</div>' +
                                            '<div class="center sliding"><%= title %></div>' +
                                            '<div class="right sliding">' +
                                                '<a id="done-comment">' +
                                                '<% if (android) { %><i class="icon icon-done-comment-white"></i><% } else { %><%= textDone %><% } %>' +
                                                '</a>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>';

        var getNavigation = function (panelid) {
            var el = mapNavigation[panelid];
            if ( !el ) {
                var _title;
                switch ( panelid ) {
                case '#addlink':
                    _title = SSE.getController('AddLink').getView('AddLink').getTitle();
                    break;
                case '#addother-insimage': _title = this.textInsertImage; break;
                case '#addother-sort': _title = this.textSort; break;
                case '#addother-imagefromurl': _title = this.textLinkSettings; break;
                case '#addother-insert-comment': _title = this.textAddComment; break;
                }

                if (panelid === '#addother-insert-comment') {
                    el = _.template(tplNavigationComment)({
                            android     : Common.SharedSettings.get('android'),
                            phone       : Common.SharedSettings.get('phone'),
                            textBack    : this.textBack,
                            textDone    : this.textDone,
                            title       : _title
                        }
                    );
                } else {
                    mapNavigation =
                        el = _.template(tplNavigation)({
                                android     : Common.SharedSettings.get('android'),
                                phone       : Common.SharedSettings.get('phone'),
                                textBack    : this.textBack,
                                title       : _title
                            }
                        );
                }
            }

            return el;
        };

        return {
            // el: '.view-main',

            template: _.template(addTemplate),

            events: {},

            initialize: function () {
                Common.NotificationCenter.on('addcontainer:show', _.bind(this.initEvents, this));
            },

            initEvents: function () {
                var me = this;

                var $page = $('#add-other');
                $page.find('#add-other-insimage').single('click', _.bind(me.showInsertImage, me));
                $page.find('#add-other-link').single('click', _.bind(me.showInsertLink, me));
                $page.find('#add-other-sort').single('click', _.bind(me.showSortPage, me));
                if (me.hideInsertComments || me.isComments) {
                    $('#item-comment').hide();
                } else {
                    $('#item-comment').show();
                    $('#add-other-comment').single('click', _.bind(me.showPageComment, me));
                }

                me.initControls();
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

            childLayout: function (name) {
                if (this.layout) {
                    if ( name == 'image' )
                        return this.layout.find('#addother-insimage .page-content').html();
                }

                return '';
            },

            initControls: function () {
                //
            },

            showPage: function (templateId, animate) {
                var rootView = SSE.getController('AddContainer').rootView;

                if (rootView && this.layout) {
                    var $content = this.layout.find(templateId);
                    var navbar = getNavigation.call(this, templateId);

                    if ( !$content.find('.navbar').length ) {
                        // Android fix for navigation
                        if (Framework7.prototype.device.android) {
                            $content.find('.page').append(navbar);
                        } else {
                            $content.prepend(navbar);
                        }
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
                var me = this;
                _.delay(function () {
                    var $commentInfo = $('#comment-info');
                    var template = [
                        '<% if (android) { %><div class="header-comment"><div class="initials-comment" style="background-color: <%= comment.usercolor %>;"><%= comment.userInitials %></div><div><% } %>',
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
            
            showInsertImage: function () {
                this.showPage('#addother-insimage');

                $('#addimage-url').single('click', this.showImageFromUrl.bind(this));
                $('#addimage-file').single('click', function () {
                    this.fireEvent('image:insert',[{islocal:true}]);
                }.bind(this));
            },

            showInsertLink: function () {
                SSE.getController('AddLink').showPage(getNavigation.call(this, '#addlink'));
            },

            showSortPage: function (e) {
                this.showPage('#addother-sort');

                var me = this;
                $('.settings .sortdown').single('click', function (e) {me.fireEvent('insert:sort',['down']);});
                $('.settings .sortup').single('click', function (e) {me.fireEvent('insert:sort',['up']);});

                $('.settings #other-chb-insfilter input:checkbox').single('change', function (e) {
                    var $checkbox = $(e.currentTarget);
                    me.fireEvent('insert:filter', [$checkbox.is(':checked')]);
                });
            },

            showImageFromUrl: function () {
                this.showPage('#addother-imagefromurl');

                var me = this;
                var $input = $('#addimage-link-url input[type=url]');

                $('#addimage-insert a').single('click', _.buffered(function () {
                    var value = ($input.val()).replace(/ /g, '');
                    me.fireEvent('image:insert', [{islocal:false, url:value}]);
                }, 100, me));

                var $btnInsert = $('#addimage-insert');
                $('#addimage-fromurl input[type=url]').single('input', function (e) {
                    $btnInsert.toggleClass('disabled', _.isEmpty($(e.currentTarget).val()));
                });

                _.delay(function () { $input.focus(); }, 1000);
            },

            optionAutofilter: function (checked) {
                $('.settings #other-chb-insfilter input:checkbox').prop('checked', checked);
            },

            textInsertImage: 'Insert Image',
            textSort: 'Sort and Filter',
            textLink: 'Link',
            textBack: 'Back',
            textInsert: 'Insert',
            textFromLibrary: 'Picture from Library',
            textFromURL: 'Picture from URL',
            textAddress: 'Address',
            textImageURL: 'Image URL',
            textFilter: 'Filter',
            textLinkSettings: 'Link Settings',
            textComment: 'Comment',
            textAddComment: 'Add Comment',
            textDone: 'Done'
        }
    })(), SSE.Views.AddOther || {}))
});