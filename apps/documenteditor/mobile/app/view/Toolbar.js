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
 *  Toolbar.js
 *  Document Editor
 *
 *  Created by Alexander Yuzhin on 9/23/16
 *  Copyright (c) 2016 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!documenteditor/mobile/app/template/Toolbar.template',
    'jquery',
    'underscore',
    'backbone'
], function (toolbarTemplate, $, _, Backbone) {
    'use strict';

    DE.Views.Toolbar = Backbone.View.extend((function() {
        // private

        return {
            el: '.view-main',

            // Compile our stats template
            template: _.template(toolbarTemplate),

            // Delegated events for creating new items, and clearing completed ones.
            events: {
                "click #toolbar-search"     : "searchToggle",
                "click #toolbar-edit"       : "showEdition",
                "click #toolbar-add"        : "showInserts",
                "click #toolbar-settings"   : "showSettings"
            },

            // Set innerHTML and get the references to the DOM elements
            initialize: function() {
                var me = this;

                Common.NotificationCenter.on('readermode:change', function (reader) {
                    if (reader) {
                        me.hideSearch();
                        $('#toolbar-search').addClass('disabled');
                    } else {
                        $('#toolbar-search').removeClass('disabled');
                    }
                });
            },

            // Render layout
            render: function() {
                var $el = $(this.el);

                $el.prepend(this.template({
                    android     : Common.SharedSettings.get('android'),
                    phone       : Common.SharedSettings.get('phone'),
                    backTitle   : Common.SharedSettings.get('android') ? '' : 'Back'
                }));

                return this;
            },

            setMode: function (mode) {
                var isEdit = (mode === 'edit');

                if (isEdit) {
                    $('#toolbar-edit, #toolbar-add, #toolbar-undo, #toolbar-redo').show();
                }
            },

            // Search
            searchToggle: function() {
                if ($$('.searchbar.document').length > 0) {
                    this.hideSearch();
                } else {
                    this.showSearch();
                }
            },

            showSearch: function () {
                var me = this,
                    searchBar = $$('.searchbar.document');

                if (searchBar.length < 1) {
                    $(me.el).find('.pages .page').first().prepend(_.template(
                        '<form class="searchbar document navbar navbar-hidden">' +
                            '<div class="searchbar-input">' +
                                '<input type="search" placeholder="Search"><a href="#" class="searchbar-clear"></a>' +
                            '</div>' +
                            '<p class="buttons-row">' +
                                '<a href="#" class="link icon-only prev disabled"><i class="icon icon-prev"></i></a>' +
                                '<a href="#" class="link icon-only next disabled"><i class="icon icon-next"></i></a>' +
                            '</p>' +
                        '</form>', {}
                    ));
                    me.fireEvent('searchbar:render', me);

                    searchBar = $$('.searchbar.document');

                    if (Common.SharedSettings.get('android')) {
                        searchBar.find('.buttons-row').css('margin-left', '10px');
                        searchBar.find('.buttons-row a').css('min-width', '0px');
                    } else {
                        searchBar.find('.buttons-row .next').css('margin-left', '10px');
                    }

                    _.defer(function() {
                        uiApp.showNavbar(searchBar);

                        searchBar.transitionEnd(function () {
                            if (!searchBar.hasClass('navbar-hidden')) {
                                me.fireEvent('searchbar:show', me);
                                $('.searchbar input').focus();
                            }
                        });
                    }, 10);
                }
            },

            hideSearch: function () {
                var me = this,
                    searchBar = $$('.searchbar.document');

                if (searchBar.length > 0) {
                    // Animating
                    if (searchBar.hasClass('.navbar-hidding')) {
                        return;
                    }

                    _.defer(function() {
                        searchBar.transitionEnd(function () {
                            me.fireEvent('searchbar:hide', me);
                            searchBar.remove();
                        });

                        uiApp.hideNavbar(searchBar);
                    }, 10);
                }
            },

            // Editor
            showEdition: function () {
                DE.getController('EditContainer').showModal();
            },

            // Inserts

            showInserts: function () {
                DE.getController('AddContainer').showModal();
            },

            // Settings
            showSettings: function () {
                DE.getController('Settings').showModal();
            }
        }
    })());
});
