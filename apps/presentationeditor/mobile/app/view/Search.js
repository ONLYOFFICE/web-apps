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
 *  Search.js
 *  Presentation Editor
 *
 *  Created by Alexander Yuzhin on 11/22/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!presentationeditor/mobile/app/template/Search.template',
    'jquery',
    'underscore',
    'backbone'
], function (searchTemplate, $, _, Backbone) {
    'use strict';

    PE.Views.Search = Backbone.View.extend(_.extend((function() {
        // private
        var _isEdit = false,
            _layout;

        return {
            el: '.view-main',

            // Compile our stats template
            template: _.template(searchTemplate),

            // Delegated events for creating new items, and clearing completed ones.
            events: {},

            // Set innerHTML and get the references to the DOM elements
            initialize: function () {
                this.on('searchbar:show', _.bind(this.initEvents, this));
            },

            initEvents: function() {
                //
            },

            // Render layout
            render: function () {
                _layout = $('<div/>').append(this.template({
                    android : Common.SharedSettings.get('android'),
                    phone   : Common.SharedSettings.get('phone'),
                    isEdit  : _isEdit,
                    scope   : this
                }));

                return this;
            },

            setMode: function (mode) {
                _isEdit = mode.isEdit;
                this.render();
            },

            showSearch: function () {
                var me = this,
                    searchBar = $$('.searchbar.document');

                if (searchBar.length < 1) {
                    $(me.el).find('.pages .page').first().prepend(_layout.find('#search-panel-view').html());

                    me.fireEvent('searchbar:render', me);
                    me.fireEvent('searchbar:show', me);

                    searchBar = $$('.searchbar.document');

                    _.defer(function() {
                        uiApp.showNavbar(searchBar);

                        searchBar.transitionEnd(function () {
                            if (!searchBar.hasClass('navbar-hidden')) {
                                $('.searchbar.search input').focus();
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

            textSearch: 'Search'
        }
    })(), PE.Views.Search || {}))
});