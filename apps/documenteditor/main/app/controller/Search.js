/*
 * (c) Copyright Ascensio System SIA 2010-2024
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
 * You can contact Ascensio System SIA at 20A-6 Ernesta Birznieka-Upish
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
 *  ViewTab.js
 *
 *  Created on 09.02.2022
 *
 */

define([
    'core',
    'common/main/lib/view/SearchPanel'
], function () {
    'use strict';

    DE.Controllers.Search = Backbone.Controller.extend(_.extend({
        sdkViewName : '#id_main',

        views: [
            'Common.Views.SearchPanel'
        ],

        initialize: function () {
            this.addListeners({
                'SearchBar': {
                    'search:back': _.bind(this.onSearchNext, this, 'back'),
                    'search:next': _.bind(this.onSearchNext, this, 'next'),
                    'search:input': _.bind(function (text) {
                        if (this._state.searchText === text) {
                            Common.NotificationCenter.trigger('search:updateresults', this._state.currentResult, this._state.resultsNumber);
                            return;
                        }
                        this.onInputSearchChange(text);
                    }, this),
                    'search:keydown': _.bind(this.onSearchNext, this, 'keydown'),
                    'show': _.bind(this.onSelectSearchingResults, this, true),
                    'hide': _.bind(this.onSelectSearchingResults, this, false)
                },
                'Common.Views.SearchPanel': {
                    'search:back': _.bind(this.onSearchNext, this, 'back'),
                    'search:next': _.bind(this.onSearchNext, this, 'next'),
                    'search:replace': _.bind(this.onQueryReplace, this),
                    'search:replaceall': _.bind(this.onQueryReplaceAll, this),
                    'search:input': _.bind(this.onInputSearchChange, this),
                    'search:options': _.bind(this.onChangeSearchOption, this),
                    'search:keydown': _.bind(this.onSearchNext, this, 'keydown'),
                    'show': _.bind(this.onShowPanel, this),
                    'hide': _.bind(this.onHidePanel, this),
                },
                'LeftMenu': {
                    'search:aftershow': _.bind(this.onShowAfterSearch, this)
                }
            });
        },
        onLaunch: function () {
            this._state = {
                searchText: '',
                matchCase: false,
                matchWord: false,
                useRegExp: false,
                isHighlightedResults: false,
                isContentChanged: false
            };
        },

        setMode: function (mode) {
            this.view = this.createView('Common.Views.SearchPanel', { mode: mode });
        },

        setApi: function (api) {
            if (api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onSetSearchCurrent', _.bind(this.onUpdateSearchCurrent, this));
                this.api.asc_registerCallback('asc_onStartTextAroundSearch', _.bind(this.onStartTextAroundSearch, this));
                this.api.asc_registerCallback('asc_onEndTextAroundSearch', _.bind(this.onEndTextAroundSearch, this));
                this.api.asc_registerCallback('asc_onGetTextAroundSearchPack', _.bind(this.onApiGetTextAroundSearch, this));
                this.api.asc_registerCallback('asc_onRemoveTextAroundSearch', _.bind(this.onApiRemoveTextAroundSearch, this));
                this.api.asc_registerCallback('asc_onSearchEnd', _.bind(this.onApiSearchEnd, this));
                this.api.asc_registerCallback('asc_onReplaceAll', _.bind(this.onApiTextReplaced, this));
            }
            return this;
        },

        getView: function(name) {
            return !name && this.view ?
                this.view : Backbone.Controller.prototype.getView.call(this, name);
        },

        checkPunctuation: function (text) {
            if (!!text) {
                var isPunctuation = false;
                for (var l = 0; l < text.length; l++) {
                    var charCode = text.charCodeAt(l),
                        char = text.charAt(l);
                    if (AscCommon.IsPunctuation(charCode) || char.trim() === '') {
                        isPunctuation = true;
                        break;
                    }
                }
                if (isPunctuation) {
                    if (this._state.matchWord) {
                        this.view.chMatchWord.setValue(false, true);
                        this._state.matchWord = false;
                    }
                    this.view.chMatchWord.setDisabled(true);
                } else if (this.view.chMatchWord.isDisabled()) {
                    this.view.chMatchWord.setDisabled(false);
                }
            }
        },

        onChangeSearchOption: function (option, checked) {
            switch (option) {
                case 'case-sensitive':
                    this._state.matchCase = checked;
                    break;
                case 'match-word':
                    this._state.matchWord = checked;
                    break;
                case 'regexp':
                    this._state.useRegExp = checked;
                    break;
            }
            if (this._state.searchText) {
                this.onQuerySearch();
            }
        },

        onSearchNext: function (type, text, e) {
            var isReturnKey = type === 'keydown' && e.keyCode === Common.UI.Keys.RETURN;
            if (text && text.length > 0 && (isReturnKey || type !== 'keydown')) {
                this.checkPunctuation(text);
                this._state.searchText = text;
                this.onQuerySearch(type, !(this.searchTimer || isReturnKey));
            }
        },

        onInputSearchChange: function (text) {
            var me = this;
            if ((text && this._state.searchText !== text) || (!text && this._state.newSearchText)) {
                this._state.newSearchText = text;
                this._lastInputChange = (new Date());
                if (this.searchTimer === undefined) {
                    this.searchTimer = setInterval(function(){
                        if ((new Date()) - me._lastInputChange < 400) return;

                        me.checkPunctuation(me._state.newSearchText);
                        me._state.searchText = me._state.newSearchText;
                        if (!(me._state.newSearchText !== '' && me.onQuerySearch()) && me._state.newSearchText === '') {
                            me.api.asc_endFindText();
                            me.view.updateResultsNumber('no-results');
                            me.hideResults();
                            me.view.disableNavButtons();
                            me.view.disableReplaceButtons(true);
                            clearInterval(me.searchTimer);
                            me.searchTimer = undefined;

                            Common.NotificationCenter.trigger('search:updateresults');
                        }
                    }, 10);
                }
            }
        },

        onQuerySearch: function (d, noUpdate) {
            var update = !noUpdate || this._state.isContentChanged;
            this._state.isContentChanged = false;
            this.searchTimer && clearInterval(this.searchTimer);
            this.searchTimer = undefined;
            update && this.hideResults();

            var searchSettings = new AscCommon.CSearchSettings();
            searchSettings.put_Text(this._state.searchText);
            searchSettings.put_MatchCase(this._state.matchCase);
            searchSettings.put_WholeWords(this._state.matchWord);
            if (!this.api.asc_findText(searchSettings, d != 'back')) {
                this.resultItems = [];
                this.view.updateResultsNumber(undefined, 0);
                this.hideResults();
                this.view.disableReplaceButtons(true);
                this._state.currentResult = 0;
                this._state.resultsNumber = 0;
                this.view.disableNavButtons();

                Common.NotificationCenter.trigger('search:updateresults');
                return false;
            }
            if (update && this.view.$el.is(':visible') && this.view.$resultsContainer.find('.many-results').length === 0) {
                this.api.asc_StartTextAroundSearch();
            }
            this.view.disableReplaceButtons(false);
            return true;
        },

        onQueryReplace: function(textSearch, textReplace) {
            if (textSearch !== '') {
                var me = this;
                var str = this.api.asc_GetErrorForReplaceString(textReplace);
                if (str) {
                    setTimeout(function() {
                        Common.UI.warning({
                            title: me.notcriticalErrorTitle,
                            msg: Common.Utils.String.format(me.warnReplaceString, str),
                            buttons: ['ok'],
                            callback: function(){
                                me.view.focus('replace');
                            }
                        });
                    }, 1);
                    return;
                }

                var searchSettings = new AscCommon.CSearchSettings();
                searchSettings.put_Text(textSearch);
                searchSettings.put_MatchCase(this._state.matchCase);
                searchSettings.put_WholeWords(this._state.matchWord);
                if (!this.api.asc_replaceText(searchSettings, textReplace, false)) {
                    this.removeResultItems();
                }
            }
        },

        onQueryReplaceAll: function(textSearch, textReplace) {
            if (textSearch !== '') {
                var me = this;
                var str = this.api.asc_GetErrorForReplaceString(textReplace);
                if (str) {
                    setTimeout(function() {
                        Common.UI.warning({
                            title: me.notcriticalErrorTitle,
                            msg: Common.Utils.String.format(me.warnReplaceString, str),
                            buttons: ['ok'],
                            callback: function(){
                                me.view.focus('replace');
                            }
                        });
                    }, 1);
                    return;
                }

                var searchSettings = new AscCommon.CSearchSettings();
                searchSettings.put_Text(textSearch);
                searchSettings.put_MatchCase(this._state.matchCase);
                searchSettings.put_WholeWords(this._state.matchWord);
                this.api.asc_replaceText(searchSettings, textReplace, true);

                this.removeResultItems('replace-all');
            }
        },

        removeResultItems: function (type) {
            this.resultItems = [];
            type !== 'replace-all' && this.view.updateResultsNumber(type, 0); // type === undefined, count === 0 -> no matches
            this.hideResults();
            this.view.disableReplaceButtons(true);
            this._state.currentResult = 0;
            this._state.resultsNumber = 0;
            this.view.disableNavButtons();
        },

        onUpdateSearchCurrent: function (current, all) {
            if (current === -1) return;
            this._state.currentResult = current;
            this._state.resultsNumber = all;
            if (this.view) {
                this.view.updateResultsNumber(current, all);
                this.view.disableNavButtons(current, all);
                if (this.resultItems && this.resultItems.length > 0) {
                    this.resultItems.forEach(function (item) {
                        item.selected = false;
                    });
                    if (this.resultItems[current]) {
                        this.resultItems[current].selected = true;
                        $('#search-results').find('.item').removeClass('selected');
                        $(this.resultItems[current].el).addClass('selected');
                        this.scrollToSelectedResult(current);
                    }
                }
            }
            Common.NotificationCenter.trigger('search:updateresults', current, all);
        },

        scrollToSelectedResult: function (ind) {
            var index = ind !== undefined ? ind : _.findIndex(this.resultItems, {selected: true});
            if (index !== -1) {
                var item = this.resultItems[index].$el,
                    itemHeight = item.outerHeight(),
                    itemTop = item.position().top,
                    container = this.view.$resultsContainer,
                    containerHeight = container.outerHeight(),
                    containerTop = container.scrollTop();
                if (itemTop < 0 || (containerTop === 0 && itemTop > containerHeight)) {
                    container.scroller.scrollTop(containerTop + itemTop - 12);
                } else if (itemTop + itemHeight > containerHeight) {
                    container.scroller.scrollTop(containerTop + itemHeight);
                }
            }
        },

        onStartTextAroundSearch: function () {
            if (this.view) {
                this._state.isStartedAddingResults = true;
            }
        },

        onEndTextAroundSearch: function () {
            if (this.view) {
                this.view.updateScrollers();
            }
        },

        onApiGetTextAroundSearch: function (data) {
            if (this.view && this._state.isStartedAddingResults) {
                this._state.isStartedAddingResults = false;
                if (data.length > 300 || !data.length) return;
                var me = this,
                    selectedInd;
                me.resultItems = [];
                data.forEach(function (item, ind) {
                    var el = document.createElement("div"),
                        isSelected = ind === me._state.currentResult;
                    el.className = 'item';
                    var innerHtml = "";
                    for (var i = 0, count = item[1].length; i < count; ++i) {
                        if (1 == i)
                            innerHtml += "<b>" + Common.Utils.String.htmlEncode(item[1][i]) + "</b>";
                        else
                            innerHtml += Common.Utils.String.htmlEncode(item[1][i]);
                    }
                    el.innerHTML = innerHtml.trim();
                    el.setAttribute('role', 'listitem');
                    me.view.$resultsContainer.append(el);
                    if (isSelected) {
                        $(el).addClass('selected');
                        selectedInd = ind;
                    }

                    var resultItem = {id: item[0], $el: $(el), el: el, selected: isSelected};
                    me.resultItems.push(resultItem);
                    $(el).on('click', _.bind(function (el) {
                        if (me._state.isContentChanged) {
                            me.onQuerySearch();
                            return;
                        }
                        var id = item[0];
                        me.api.asc_SelectSearchElement(id);
                    }, me));
                });

                this.view.$resultsContainer.show();
                this.scrollToSelectedResult(selectedInd);
            }
        },

        onApiRemoveTextAroundSearch: function (arr) {
            var me = this;
            arr.forEach(function (id) {
                var ind = _.findIndex(me.resultItems, {id: id});
                if (ind !== -1) {
                    me.resultItems[ind].$el.remove();
                    me.resultItems.splice(ind, 1);
                }
            });
        },

        hideResults: function () {
            if (this.view) {
                if (this.view.$resultsContainer.find('.many-results').length === 0) {
                    this.view.$resultsContainer.hide();
                }
                this.view.$resultsContainer.find('.item').remove();
            }
        },

        onShowAfterSearch: function (findText) {
            var viewport = this.getApplication().getController('Viewport');
            if (viewport.isSearchBarVisible()) {
                viewport.searchBar.hide();
            }

            var selectedText = this.api.asc_GetSelectedText(),
                text = typeof findText === 'string' ? findText : (selectedText && selectedText.trim() || this._state.searchText);
            this.checkPunctuation(text);
            if (this.resultItems && this.resultItems.length > 0 &&
                (!this._state.matchCase && text && text.toLowerCase() === this.view.inputText.getValue().toLowerCase() ||
                    this._state.matchCase && text === this.view.inputText.getValue())) { // show old results
                return;
            }
            if (text) {
                this.view.setFindText(text);
            } else if (text !== undefined) { // panel was opened from empty searchbar, clear to start new search
                this.view.setFindText('');
                this._state.searchText = undefined;
            }

            this.hideResults();
            if (text && text !== '' && text === this._state.searchText) { // search was made
                this.view.disableReplaceButtons(false);
                if (this.view.$resultsContainer.find('.many-results').length === 0) {
                    this.api.asc_StartTextAroundSearch();
                }
            } else if (text && text !== '') { // search wasn't made
                this.onInputSearchChange(text);
            } else {
                this.resultItems = [];
                this.view.disableReplaceButtons(true);
                this.view.clearResultsNumber();
            }
            this.view.disableNavButtons(this._state.currentResult, this._state.resultsNumber);
        },

        onShowPanel: function () {
            this.onSelectSearchingResults(true);
            if (this.resultItems && this.resultItems.length > 0 && !this._state.isStartedAddingResults) {
                var me = this;
                this.view.$resultsContainer.show();
                this.resultItems.forEach(function (item) {
                    me.view.$resultsContainer.append(item.el);
                    $(item.el)[item.selected ? 'addClass' : 'removeClass']('selected');
                    $(item.el).on('click', function (el) {
                        me.api.asc_SelectSearchElement(item.id);
                        $('#search-results').find('.item').removeClass('selected');
                        $(el.currentTarget).addClass('selected');
                    });
                });
                this.scrollToSelectedResult();
            }
        },

        onHidePanel: function () {
            this.hideResults();
            this.onSelectSearchingResults(false);
        },

        onSelectSearchingResults: function (val) {
            if (!val && this.getApplication().getController('LeftMenu').isSearchPanelVisible()) return;

            if (this._state.isHighlightedResults !== val) {
                this.api.asc_selectSearchingResults(val);
                this._state.isHighlightedResults = val;
            }
        },

        onApiSearchEnd: function () {
            if (!this._state.isContentChanged) {
                this._state.isContentChanged = true;
                this.view.updateResultsNumber('content-changed');
                this.view.disableReplaceButtons(true);
            }
        },

        onApiTextReplaced: function(found, replaced) {
            if (found) {
                !(found - replaced > 0) ?
                    /*Common.UI.info( {msg: Common.Utils.String.format(this.textReplaceSuccess, replaced)} ) :
                    Common.UI.warning( {msg: Common.Utils.String.format(this.textReplaceSkipped, found-replaced)} );*/
                    this.view.updateResultsNumber('replace-all', replaced) :
                    this.view.updateResultsNumber('replace', [replaced, found, found-replaced]);
            } else {
                Common.UI.info({msg: this.textNoTextFound});
            }
        },

        getSearchText: function () {
            return this._state.searchText;
        },

        getResultsNumber: function () {
            return [this._state.currentResult, this._state.resultsNumber];
        },

        notcriticalErrorTitle: 'Warning',
        warnReplaceString: '{0} is not a valid special character for the Replace With box.',
        textReplaceSuccess: 'Search has been done. {0} occurrences have been replaced',
        textReplaceSkipped: 'The replacement has been made. {0} occurrences were skipped.',
        textNoTextFound: 'The data you have been searching for could not be found. Please adjust your search options.'

    }, DE.Controllers.Search || {}));
});