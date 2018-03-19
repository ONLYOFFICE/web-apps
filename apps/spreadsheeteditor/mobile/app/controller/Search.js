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
 *  Spreadsheet Editor
 *
 *  Created by Alexander Yuzhin on 12/5/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'jquery',
    'underscore',
    'backbone',
    'spreadsheeteditor/mobile/app/view/Search'
], function (core, $, _, Backbone) {
    'use strict';

    SSE.Controllers.Search = Backbone.Controller.extend(_.extend((function() {
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
                        'searchbar:render'      : this.onSearchbarRender,
                        'searchbar:showsettings': this.onSearchbarSettings
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
                    searchString    = Common.SharedSettings.get('search-search') || '',
                    replaceString   = Common.SharedSettings.get('search-replace')|| '';

                me.searchBar = uiApp.searchbar('.searchbar.document .searchbar.search', {
                    customSearch: true,
                    onSearch    : _.bind(me.onSearchChange, me),
                    onEnable    : _.bind(me.onSearchEnable, me),
                    onClear     : _.bind(me.onSearchClear, me)
                });

                me.replaceBar = uiApp.searchbar('.searchbar.document .searchbar.replace', {
                    customSearch: true,
                    onSearch    : _.bind(me.onReplaceChange, me),
                    onEnable    : _.bind(me.onReplaceEnable, me),
                    onClear     : _.bind(me.onReplaceClear, me)
                });

                me.searchPrev = $('.searchbar.document .prev');
                me.searchNext = $('.searchbar.document .next');
                me.replaceBtn = $('.searchbar.document .link.replace');

                me.searchPrev.single('click', _.bind(me.onSearchPrev, me));
                me.searchNext.single('click', _.bind(me.onSearchNext, me));
                me.replaceBtn.single('click', _.bind(me.onReplace, me));

                $$('.searchbar.document .link.replace').on('taphold', _.bind(me.onReplaceAll, me));

                me.searchBar.search(searchString);
                me.replaceBar.search(replaceString);
            },

            onSearchbarSettings: function (view) {
                var me              = this,
                    isReplace       = Common.SharedSettings.get('search-is-replace') === true,
                    searchIn        = Common.SharedSettings.get('search-in') === 'sheet' ? 'sheet' : 'workbook',
                    isMatchCase     = Common.SharedSettings.get('search-match-case') === true,
                    isMatchCell     = Common.SharedSettings.get('search-match-cell') === true,
                    $pageSettings   = $('.page[data-page=search-settings]'),
                    $inputType      = $pageSettings.find('input[name=search-type]'),
                    $inputSearchIn  = $pageSettings.find('input[name=search-in]'),
                    $inputMatchCase = $pageSettings.find('#search-match-case input:checkbox'),
                    $inputMatchCell = $pageSettings.find('#search-match-cell input:checkbox');

                $inputType.val([isReplace ? 'replace' : 'search']);
                $inputSearchIn.val([searchIn]);
                $inputMatchCase.prop('checked', isMatchCase);
                $inputMatchCell.prop('checked', isMatchCell);

                // init events
                $inputType.single('change',      _.bind(me.onTypeChange, me));
                $inputSearchIn.single('change',  _.bind(me.onSearchInChange, me));
                $inputMatchCase.single('change', _.bind(me.onMatchCaseClick, me));
                $inputMatchCell.single('change', _.bind(me.onMatchCellClick, me));
            },

            onSearchbarShow: function(bar) {
                _isShow = true;
                // this.api.asc_selectSearchingResults(Common.SharedSettings.get('search-highlight'));
            },

            onSearchEnable: function (bar) {
                this.replaceBar.container.removeClass('searchbar-active');
            },

            onSearchbarHide: function(bar) {
                _isShow = false;
                // this.api.asc_selectSearchingResults(false);
            },

            onSearchChange: function(search) {
                var me = this,
                    isEmpty = (search.query.trim().length < 1);

                Common.SharedSettings.set('search-search', search.query);

                _.each([me.searchPrev, me.searchNext, me.replaceBtn], function(btn) {
                    btn.toggleClass('disabled', isEmpty);
                });
            },

            onSearchClear: function(search) {
                Common.SharedSettings.set('search-search', '');
//            window.focus();
//            document.activeElement.blur();
            },

            onReplaceChange: function(replace) {
                var me = this,
                    isEmpty = (replace.query.trim().length < 1);

                Common.SharedSettings.set('search-replace', replace.query);
            },

            onReplaceEnable: function (bar) {
                this.searchBar.container.removeClass('searchbar-active');
            },

            onReplaceClear: function(replace) {
                Common.SharedSettings.set('search-replace', '');
            },

            onSearchPrev: function(btn) {
                this.onQuerySearch(this.searchBar.query, 'back');
            },

            onSearchNext: function(btn) {
                this.onQuerySearch(this.searchBar.query, 'next');
            },

            onReplace: function (btn) {
                this.onQueryReplace(this.searchBar.query, this.replaceBar.query);
            },

            onReplaceAll: function (e) {
                var me = this,
                    popover = [
                        '<div class="popover" style="width: auto;">',
                            '<div class="popover-inner">',
                                '<div class="list-block">',
                                    '<ul>',
                                        '<li><a href="#" id="replace-all" class="item-link list-button">{0}</li>'.format(me.textReplaceAll),
                                    '</ul>',
                                '</div>',
                            '</div>',
                        '</div>'
                    ].join('');

                popover = uiApp.popover(popover, $$(e.currentTarget));

                $('#replace-all').single('click', _.bind(function () {
                    me.onQueryReplaceAll(this.searchBar.query, this.replaceBar.query);
                    uiApp.closeModal(popover);
                }, me))
            },

            onQuerySearch: function(query, direction) {
                var matchCase = Common.SharedSettings.get('search-match-case') || false,
                    matchCell = Common.SharedSettings.get('search-match-cell') || false,
                    lookInSheet = Common.SharedSettings.get('search-in') === 'sheet';

                if (query && query.length) {
                    var options = new Asc.asc_CFindOptions();
                    options.asc_setFindWhat(query);
                    options.asc_setScanForward(direction != 'back');
                    options.asc_setIsMatchCase(matchCase);
                    options.asc_setIsWholeCell(matchCell);
                    options.asc_setScanOnOnlySheet(lookInSheet);
                    // options.asc_setScanByRows(this.dlgSearch.menuSearch.menu.items[0].checked);
                    // options.asc_setLookIn(this.dlgSearch.menuLookin.menu.items[0].checked?Asc.c_oAscFindLookIn.Formulas:Asc.c_oAscFindLookIn.Value);

                    if (!this.api.asc_findText(options)) {
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

            onQueryReplace: function(search, replace) {
                var matchCase = Common.SharedSettings.get('search-match-case') || false,
                    matchCell = Common.SharedSettings.get('search-match-cell') || false,
                    lookInSheet = Common.SharedSettings.get('search-in') === 'sheet';

                if (search && search.length) {
                    this.api.isReplaceAll = false;

                    var options = new Asc.asc_CFindOptions();
                    options.asc_setFindWhat(search);
                    options.asc_setReplaceWith(replace);
                    options.asc_setIsMatchCase(matchCase);
                    options.asc_setIsWholeCell(matchCell);
                    options.asc_setScanOnOnlySheet(lookInSheet);
                    // options.asc_setScanByRows(this.dlgSearch.menuSearch.menu.items[0].checked);
                    // options.asc_setLookIn(this.dlgSearch.menuLookin.menu.items[0].checked?Asc.c_oAscFindLookIn.Formulas:Asc.c_oAscFindLookIn.Value);
                    options.asc_setIsReplaceAll(false);

                    this.api.asc_replaceText(options);
                }
            },

            onQueryReplaceAll: function(search, replace) {
                var matchCase = Common.SharedSettings.get('search-match-case') || false,
                    matchCell = Common.SharedSettings.get('search-match-cell') || false,
                    lookInSheet = Common.SharedSettings.get('search-in') === 'sheet';

                if (search && search.length) {
                    this.api.isReplaceAll = true;

                    var options = new Asc.asc_CFindOptions();
                    options.asc_setFindWhat(search);
                    options.asc_setReplaceWith(replace);
                    options.asc_setIsMatchCase(matchCase);
                    options.asc_setIsWholeCell(matchCell);
                    options.asc_setScanOnOnlySheet(lookInSheet);
                    // options.asc_setScanByRows(this.dlgSearch.menuSearch.menu.items[0].checked);
                    // options.asc_setLookIn(this.dlgSearch.menuLookin.menu.items[0].checked?Asc.c_oAscFindLookIn.Formulas:Asc.c_oAscFindLookIn.Value);
                    options.asc_setIsReplaceAll(true);

                    this.api.asc_replaceText(options);
                }
            },

            onTypeChange: function (e) {
                var $target = $(e.currentTarget),
                    isReplace = ($target.val() === 'replace');

                Common.SharedSettings.set('search-is-replace', isReplace);
                $('.searchbar.document').toggleClass('replace', isReplace);
            },

            onSearchInChange: function (e) {
                Common.SharedSettings.set('search-in', $(e.currentTarget).val());
            },

            onMatchCaseClick: function (e) {
                Common.SharedSettings.set('search-match-case', $(e.currentTarget).is(':checked'));
            },

            onMatchCellClick: function (e) {
                Common.SharedSettings.set('search-match-cell', $(e.currentTarget).is(':checked'));
            },

            // API handlers

            textNoTextFound: 'Text not found',
            textReplaceAll: 'Replace All'
        }
    })(), SSE.Controllers.Search || {}))
});