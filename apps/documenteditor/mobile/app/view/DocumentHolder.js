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
 *  Document Editor
 *
 *  Created by Alexander Yuzhin on 11/8/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'jquery',
    'underscore',
    'backbone',
    'common/mobile/utils/utils'
], function ($, _, Backbone) {
    'use strict';

    DE.Views.DocumentHolder = Backbone.View.extend((function() {
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
                //
            },

            // Render layout
            render: function() {
                var el = $(this.el);

                if (el.length > 0 && el.find('#' + _anchorId).length < 1) {
                    el.append(this.template());
                }

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

                $('#' + _anchorId)
                    .css('left', posX)
                    .css('top', Math.max(0, posY));

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

                var popover = uiApp.popover(popoverHTML, $('#' + _anchorId));

                if (Common.SharedSettings.get('android')) {
                    Common.Utils.androidMenuTop($(popover),  $('#' + _anchorId));
                }

                $('.modal-overlay').removeClass('modal-overlay-visible');

                $('.document-menu li').single('click', _.buffered(function(e) {
                    var $target = $(e.currentTarget),
                        eventName = $target.data('event');

                    this.fireEvent('contextmenu:click', [this, eventName]);
                }, 100, this));
            },

            hideMenu: function () {
                $('#' + _anchorId)
                    .css('left', -1000)
                    .css('top', -1000);

                uiApp.closeModal('.document-menu.modal-in');
            }
        }
    })());
});