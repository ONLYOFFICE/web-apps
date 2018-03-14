/*
 *
 * (c) Copyright Ascensio System Limited 2010-2018
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
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia,
 * EU, LV-1021.
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
 *  DocumentHolder.js
 *
 *  Created by Maxim Kadushkin on 11/8/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'jquery',
    'underscore',
    'backbone'
    , 'common/mobile/utils/utils'
], function ($, _, Backbone) {
    'use strict';

    SSE.Views.DocumentHolder = Backbone.View.extend((function() {
        // private
        var _anchorId = 'context-menu-target';

        return {
            el: '#editor_sdk',

            template: _.template('<div id="' + _anchorId + '" style="position: absolute;"></div>'),
            // Delegated events for creating new items, and clearing completed ones.
            events: {
            },

            // Set innerHTML and get the references to the DOM elements
            initialize: function() {
                Common.NotificationCenter.on('document:ready', function () {
                    this.$el.append(this.template());
                }.bind(this));
            },

            // Render layout
            render: function() {
                var el = $(this.el);

                // this.f7View = uiApp.addView('.view-main', {
                //     // params
                // });

                return this;
            },

            showMenu: function (items, posX, posY) {
                if (items.length < 1) {
                    return;
                }

                var menuItemTemplate = _.template([
                    '<% _.each(menuItems, function(item) { %>',
                    '<li data-event="<%= item.event %>"><a href="#" class="item-link list-button"><%= item.caption %></li>',
                    '<% }); %>'
                ].join(''));

                var $target = $('#' + _anchorId)
                        .css({left: posX, top: Math.max(0, posY)});

                uiApp.closeModal('.document-menu.modal-in');

                var popoverHTML =
                    '<div class="popover document-menu">'+
                        '<div class="popover-inner">'+
                            '<div class="list-block">'+
                                '<ul>'+
                                    menuItemTemplate({menuItems: items}) +
                                '</ul>'+
                            '</div>'+
                        '</div>'+
                    '</div>';
                var popover = uiApp.popover(popoverHTML, $target);

                if (Common.SharedSettings.get('android')) {
                    Common.Utils.androidMenuTop($(popover),  $target);
                }

                $('.modal-overlay').removeClass('modal-overlay-visible');

                $('.document-menu li').single('click', _.buffered(function(e) {
                    var $el = $(e.currentTarget),
                        eventName = $el.data('event');

                    this.fireEvent('contextmenu:click', [this, eventName]);
                }, 100, this));
            },

            hideMenu: function () {
                $('#' + _anchorId)
                    .css({'left': -1000, 'top': -1000});

                uiApp.closeModal('.document-menu.modal-in');
            }
        }
    })());
});