/*
 *
 * (c) Copyright Ascensio System Limited 2010-2016
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
 *  Copyright (c) 2016 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'jquery',
    'underscore',
    'backbone'
], function ($, _, Backbone) {
    'use strict';

    DE.Views.DocumentHolder = Backbone.View.extend((function() {
        // private
        var _anchorId = 'context-menu-target';

        function androidSizeMenu(popover, target) {
            popover.css({left: '', top: ''});
            var modalWidth =  popover.width();
            var modalHeight =  popover.height();
            var modalAngleSize = 10;
            var targetWidth = target.outerWidth();
            var targetHeight = target.outerHeight();
            var targetOffset = target.offset();
            var targetParentPage = target.parents('.page');
            if (targetParentPage.length > 0) {
                targetOffset.top = targetOffset.top - targetParentPage[0].scrollTop;
            }

            var windowHeight = $(window).height();
            var windowWidth = $(window).width();

            var modalTop = 0;
            var modalLeft = 0;

            // Top Position
            var modalPosition = 'top';// material ? 'bottom' : 'top';
            {
                if ((modalHeight + modalAngleSize) < targetOffset.top) {
                    // On top
                    modalTop = targetOffset.top - modalHeight - modalAngleSize;
                }
                else if ((modalHeight + modalAngleSize) < windowHeight - targetOffset.top - targetHeight) {
                    // On bottom
                    modalPosition = 'bottom';
                    modalTop = targetOffset.top + targetHeight + modalAngleSize;
                }
                else {
                    // On middle
                    modalPosition = 'middle';
                    modalTop = targetHeight / 2 + targetOffset.top - modalHeight / 2;

                    if (modalTop <= 0) {
                        modalTop = 5;
                    }
                    else if (modalTop + modalHeight >= windowHeight) {
                        modalTop = windowHeight - modalHeight - 5;
                    }
                }

                // Horizontal Position
                if (modalPosition === 'top' || modalPosition === 'bottom') {
                    modalLeft = targetWidth / 2 + targetOffset.left - modalWidth / 2;
                    if (modalLeft < 5) modalLeft = 5;
                    if (modalLeft + modalWidth > windowWidth) modalLeft = windowWidth - modalWidth - 5;
                }
                else if (modalPosition === 'middle') {
                    modalLeft = targetOffset.left - modalWidth - modalAngleSize;

                    if (modalLeft < 5 || (modalLeft + modalWidth > windowWidth)) {
                        if (modalLeft < 5) modalLeft = targetOffset.left + targetWidth + modalAngleSize;
                        if (modalLeft + modalWidth > windowWidth) modalLeft = windowWidth - modalWidth - 5;
                    }
                }
            }

            // Apply Styles
            popover.css({top: modalTop + 'px', left: modalLeft + 'px'});
        }

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
                el.append(this.template({}));

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
                    .css('top', posY);

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
                    androidSizeMenu($(popover),  $('#' + _anchorId));
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