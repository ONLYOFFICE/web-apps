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
    'core',
    'jquery',
    'underscore',
    'backbone',
    'presentationeditor/mobile/app/view/Search'
], function (core, $, _, Backbone) {
    'use strict';

    PE.Controllers.Search = Backbone.Controller.extend(_.extend((function() {
        // private

        var _isShow = false,
            _startPoint = {};

        var pointerEventToXY = function(e){
            var out = {x:0, y:0};
            if(e.type == 'touchstart' || e.type == 'touchend'){
                var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
                out.x = touch.pageX;
                out.y = touch.pageY;
            } else if (e.type == 'mousedown' || e.type == 'mouseup') {
                out.x = e.pageX;
                out.y = e.pageY;
            }
            return out;
        };

        return {
            models: [],
            collections: [],
            views: [
                'Search'
            ],

            initialize: function() {
                this.addListeners({
                    'Search': {
                        'searchbar:show'        : this.onSearchbarShow,
                        'searchbar:hide'        : this.onSearchbarHide,
                        'searchbar:render'      : this.onSearchbarRender
                    }
                });
            },

            setApi: function(api) {
                this.api = api;
            },

            setMode: function (mode) {
                this.getView('Search').setMode(mode);
            },

            onLaunch: function() {
                var me = this;
                me.createView('Search').render();

                $('#editor_sdk').single('mousedown touchstart', _.bind(me.onEditorTouchStart, me));
                $('#editor_sdk').single('mouseup touchend',     _.bind(me.onEditorTouchEnd, me));
            },

            showSearch: function () {
                this.getView('Search').showSearch();
            },

            hideSearch: function () {
                this.getView('Search').hideSearch();
            },

            // Handlers

            onEditorTouchStart: function (e) {
                _startPoint = pointerEventToXY(e);
            },

            onEditorTouchEnd: function (e) {
                var _endPoint = pointerEventToXY(e);

                if (_isShow) {
                    var distance = Math.sqrt((_endPoint.x -= _startPoint.x) * _endPoint.x + (_endPoint.y -= _startPoint.y) * _endPoint.y);

                    if (distance < 1) {
                        this.hideSearch();
                    }
                }
            },

            onSearchbarRender: function(bar) {
                var me              = this,
                    searchString    = Common.SharedSettings.get('search-search') || '';

                me.searchBar = uiApp.searchbar('.searchbar.document .searchbar.search', {
                    customSearch: true,
                    onSearch    : _.bind(me.onSearchChange, me),
                    onEnable    : _.bind(me.onSearchEnable, me),
                    onClear     : _.bind(me.onSearchClear, me)
                });

                me.searchPrev = $('.searchbar.document .prev');
                me.searchNext = $('.searchbar.document .next');

                me.searchPrev.single('click', _.bind(me.onSearchPrev, me));
                me.searchNext.single('click', _.bind(me.onSearchNext, me));

                me.searchBar.search(searchString);
            },

            onSearchbarShow: function(bar) {
                _isShow = true;
            },

            onSearchEnable: function (bar) {
                //
            },

            onSearchbarHide: function(bar) {
                _isShow = false;
            },

            onSearchChange: function(search) {
                var me = this,
                    isEmpty = (search.query.trim().length < 1);

                Common.SharedSettings.set('search-search', search.query);

                _.each([me.searchPrev, me.searchNext], function(btn) {
                    btn.toggleClass('disabled', isEmpty);
                });
            },

            onSearchClear: function(search) {
                Common.SharedSettings.set('search-search', '');
//            window.focus();
//            document.activeElement.blur();
            },

            onSearchPrev: function(btn) {
                this.onQuerySearch(this.searchBar.query, 'back');
            },

            onSearchNext: function(btn) {
                this.onQuerySearch(this.searchBar.query, 'next');
            },

            onQuerySearch: function(query, direction) {
                if (query && query.length) {
                    if (!this.api.findText(query, direction != 'back')) {
                        var me = this;
                        uiApp.alert(
                            '',
                            me.textNoTextFound,
                            function () {
                                me.searchBar.input.focus();
                            }
                        );
                    }
                }
            },

            // API handlers

            textNoTextFound     : 'Text not found'
        }
    })(), PE.Controllers.Search || {}))
});