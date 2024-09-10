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
 * Date: 11.02.2022
 */

define([
    'text!common/main/lib/template/SearchPanel.template',
    'common/main/lib/util/utils',
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Layout',
    'common/main/lib/component/InputField',
], function (template) {
    'use strict';

    Common.Views.SearchPanel = Common.UI.BaseView.extend(_.extend({
        el: '#left-panel-search',
        template: _.template(template),

        initialize: function(options) {
            _.extend(this, options);
            Common.UI.BaseView.prototype.initialize.call(this, arguments);

            this.mode = false;

            window.SSE && (this.extendedOptions = Common.localStorage.getBool('sse-search-options-extended', true));
        },

        render: function(el) {
            var me = this;
            if (!this.rendered) {
                el = el || this.el;
                $(el).html(this.template({
                    scope: this
                }));
                this.$el = $(el);

                this.inputText = new Common.UI.InputField({
                    el: $('#search-adv-text'),
                    placeHolder: this.textFind,
                    allowBlank: true,
                    validateOnBlur: false,
                    style: 'width: 100%;',
                    type: 'search',
                    dataHint: '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.inputText._input.on('input', _.bind(function () {
                    this.fireEvent('search:input', [this.inputText._input.val()]);
                }, this)).on('keydown', _.bind(function (e) {
                    this.fireEvent('search:keydown', [this.inputText._input.val(), e]);
                }, this));

                this.inputReplace = new Common.UI.InputField({
                    el: $('#search-adv-replace-text'),
                    placeHolder: this.textReplaceWith,
                    allowBlank: true,
                    validateOnBlur: false,
                    style: 'width: 100%;',
                    dataHint: '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.inputReplace._input.on('keydown', _.bind(function (e) {
                    if (e.keyCode === Common.UI.Keys.RETURN && !this.btnReplace.isDisabled()) {
                        this.onReplaceClick('replace');
                    }
                }, this));

                this.btnBack = new Common.UI.Button({
                    parentEl: $('#search-adv-back'),
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-arrow-up',
                    hint: this.tipPreviousResult,
                    dataHint: '1',
                    dataHintDirection: 'bottom'
                });
                this.btnBack.on('click', _.bind(this.onBtnNextClick, this, 'back'));

                this.btnNext = new Common.UI.Button({
                    parentEl: $('#search-adv-next'),
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-arrow-down',
                    hint: this.tipNextResult,
                    dataHint: '1',
                    dataHintDirection: 'bottom'
                });
                this.btnNext.on('click', _.bind(this.onBtnNextClick, this, 'next'));

                this.btnReplace = new Common.UI.Button({
                    el: $('#search-adv-replace')
                });
                this.btnReplace.on('click', _.bind(this.onReplaceClick, this, 'replace'));

                this.btnReplaceAll = new Common.UI.Button({
                    el: $('#search-adv-replace-all')
                });
                this.btnReplaceAll.on('click', _.bind(this.onReplaceClick, this, 'replaceall'));

                this.$reaultsNumber = $('#search-adv-results-number');
                this.updateResultsNumber('no-results');

                this.chCaseSensitive = new Common.UI.CheckBox({
                    el: $('#search-adv-case-sensitive'),
                    labelText: this.textCaseSensitive,
                    value: false,
                    dataHint: '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                }).on('change', function(field) {
                    me.fireEvent('search:options', ['case-sensitive', field.getValue() === 'checked']);
                });

                /*this.chUseRegExp = new Common.UI.CheckBox({
                    el: $('#search-adv-use-regexp'),
                    labelText: this.textMatchUsingRegExp,
                    dataHint: '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                }).on('change', function(field) {
                    me.fireEvent('search:options', ['regexp', field.getValue() === 'checked']);
                });*/

                this.chMatchWord = new Common.UI.CheckBox({
                    el: $('#search-adv-match-word'),
                    labelText: window.SSE ? this.textItemEntireCell : this.textWholeWords,
                    value: false,
                    dataHint: '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                }).on('change', function(field) {
                    me.fireEvent('search:options', ['match-word', field.getValue() === 'checked']);
                });

                this.buttonClose = new Common.UI.Button({
                    parentEl: $('#search-btn-close', this.$el),
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-close',
                    hint: this.textCloseSearch,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'medium'
                });
                this.buttonClose.on('click', _.bind(this.onClickClosePanel, this));

                this.$resultsContainer = $('#search-results');
                this.$resultsContainer.hide();

                this.$searchContainer = $('#search-container');
                this.$searchContainer.scroller = new Common.UI.Scroller({
                    el              : $('#search-container'),
                    useKeyboard     : true,
                    minScrollbarLength: 40
                });

                Common.NotificationCenter.on('search:updateresults', _.bind(this.disableNavButtons, this));
                if (window.SSE) {
                    this.cmbWithin = new Common.UI.ComboBox({
                        el: $('#search-adv-cmb-within'),
                        menuStyle: 'min-width: 100%;',
                        style: "width: 219px;",
                        editable: false,
                        cls: 'input-group-nr',
                        data: [
                            { value: Asc.c_oAscSearchBy.Sheet, displayValue: this.textSheet },
                            { value: Asc.c_oAscSearchBy.Workbook, displayValue: this.textWorkbook },
                            { value: Asc.c_oAscSearchBy.Range, displayValue: this.textSpecificRange}
                        ],
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'big'
                    }).on('selected', function(combo, record) {
                        me.fireEvent('search:options', ['within', record.value]);
                    });

                    this.inputSelectRange = new Common.UI.InputFieldBtn({
                        el: $('#search-adv-select-range'),
                        placeHolder: this.textSelectDataRange,
                        allowBlank: true,
                        validateOnChange: true,
                        validateOnBlur: true,
                        style: "width: 219px; margin-top: 8px",
                        disabled: true,
                        dataHint: '1',
                        dataHintDirection: 'left',
                        dataHintOffset: 'small'
                    }).on('keyup:after', function(input, e) {
                        me.fireEvent('search:options', ['range', input.getValue(), e.keyCode !== Common.UI.Keys.RETURN]);
                    });
                    this.inputSelectRange.$el.hide();

                    this.cmbSearch = new Common.UI.ComboBox({
                        el: $('#search-adv-cmb-search'),
                        menuStyle: 'min-width: 100%;',
                        style: "width: 219px;",
                        editable: false,
                        cls: 'input-group-nr',
                        data: [
                            { value: 0, displayValue: this.textByRows },
                            { value: 1, displayValue: this.textByColumns }
                        ],
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'big'
                    }).on('selected', function(combo, record) {
                        me.fireEvent('search:options', ['search', !record.value]);
                    });

                    this.cmbLookIn = new Common.UI.ComboBox({
                        el: $('#search-adv-cmb-look-in'),
                        menuStyle: 'min-width: 100%;',
                        style: "width: 219px;",
                        editable: false,
                        cls: 'input-group-nr',
                        data: [
                            { value: 0, displayValue: this.textFormulas },
                            { value: 1, displayValue: this.textValues }
                        ],
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'big'
                    }).on('selected', function(combo, record) {
                        me.fireEvent('search:options', ['lookIn', !record.value]);
                    });

                    this.$searchOptionsBlock = $('.search-options-block');
                    this.$searchOptionsBlock.show();
                    $('#open-search-options').on('click', _.bind(this.expandSearchOptions, this));

                    if (!this.extendedOptions) {
                        this.$searchOptionsBlock.addClass('no-expand');
                    }

                    this.cmbWithin.setValue(Asc.c_oAscSearchBy.Sheet);
                    this.cmbSearch.setValue(0);
                    this.cmbLookIn.setValue(0);

                    var tableTemplate = '<div role="table" class="search-table" aria-label="' + this.textSearchResultsTable + '">' +
                        '<div role="rowgroup"><div role="row" class="header-items">' +
                        '<div role="columnheader" class="header-item">' + this.textSheet + '</div>' +
                        '<div role="columnheader" class="header-item">' + this.textName + '</div>' +
                        '<div role="columnheader" class="header-item">' + this.textCell + '</div>' +
                        '<div role="columnheader" class="header-item">' + this.textValue + '</div>' +
                        '<div role="columnheader" class="header-item">' + this.textFormula + '</div>' +
                        '</div></div>' +
                        '<div role="rowgroup" class="ps-container oo search-items"></div>' +
                        '</div>',
                        $resultTable = $(tableTemplate).appendTo(this.$resultsContainer);
                    this.$resultsContainer.scroller = new Common.UI.Scroller({
                        el: $resultTable.find('.search-items'),
                        includePadding: true,
                        useKeyboard: true,
                        minScrollbarLength: 40,
                        alwaysVisibleY: true
                    });
                    this.$resultsTable = this.$resultsContainer.find('.search-table');
                } else {
                    this.$resultsContainer.attr('role', 'list');
                    this.$resultsContainer.attr('aria-label', this.textSearchResultsTable);
                    this.$resultsContainer.scroller = new Common.UI.Scroller({
                        el: this.$resultsContainer,
                        includePadding: true,
                        useKeyboard: true,
                        minScrollbarLength: 40,
                        alwaysVisibleY: true
                    });
                }
                Common.NotificationCenter.on('window:resize', function() {
                    me.updateResultsContainerHeight();
                });
            }

            this.rendered = true;
            this.trigger('render:after', this);
            return this;
        },

        show: function () {
            Common.UI.BaseView.prototype.show.call(this,arguments);
            this.fireEvent('show', this );

            this.updateResultsContainerHeight();
        },

        hide: function () {
            Common.UI.BaseView.prototype.hide.call(this,arguments);
            this.fireEvent('hide', this );
        },

        focus: function(type) {
            var me  = this,
                el = type === 'replace' ? me.inputReplace.$el : (type === 'range' ? me.inputSelectRange.$el : me.inputText.$el);
            setTimeout(function(){
                el.find('input').focus();
                el.find('input').select();
            }, 10);
        },

        getFocusElement: function () {
            return this.inputText.$el.find('input');
        },

        setSearchMode: function (mode) {
            if (this.mode !== mode) {
                this.$el.find('.edit-setting')[mode !== 'no-replace' ? 'show' : 'hide']();
                this.$el.find('#search-adv-title').text(mode !== 'no-replace' ? this.textFindAndReplace : this.textFind);
                this.mode = mode;
            }
        },

        ChangeSettings: function(props) {
        },

        updateScrollers: function () {
            this.$resultsContainer.scroller.update({alwaysVisibleY: true});
            this.$searchContainer.scroller.update({alwaysVisibleY: true});

            setTimeout(_.bind(function () {
                if (this.$searchContainer.find('> .ps-scrollbar-y-rail').is(':visible')) {
                    this.$resultsContainer.find('.ps-scrollbar-y-rail').addClass('set-left');
                } else {
                    this.$resultsContainer.find('.ps-scrollbar-y-rail').removeClass('set-left');
                }
            }, this), 100);
        },

        updateResultsContainerHeight: function () {
            if (this.$resultsContainer) {
                this.$resultsContainer.outerHeight(Math.max($('#search-box').outerHeight() - $('#search-header').outerHeight() - $('#search-adv-settings').outerHeight(), 112));
                this.updateScrollers();
            }
        },

        updateResultsNumber: function (current, count) {
            var text;
            if (this.$resultsContainer && current !== 'content-changed' && current !== 'replace-all' && current !== 'replace') {
                if (count > 300) {
                    this.showToManyResults();
                } else {
                    this.$resultsContainer.find('.many-results').remove();
                    if (window.SSE) {
                        this.$resultsTable.show();
                    }
                }
            }
            text = current === 'no-results' ? this.textNoSearchResults :
                (current === 'stop' ? this.textSearchHasStopped :
                (current === 'content-changed' ? (this.textContentChanged + ' ' + Common.Utils.String.format(this.textSearchAgain, '<a class="search-again">','</a>')) :
                (current === 'replace-all' ? Common.Utils.String.format(this.textItemsSuccessfullyReplaced, count) :
                (current === 'replace' ? Common.Utils.String.format(this.textPartOfItemsNotReplaced, count[0], count[1], count[2]) :
                (!count ? this.textNoMatches : Common.Utils.String.format(this.textSearchResults, current + 1, count))))));
            if (current === 'content-changed') {
                var me = this;
                this.$reaultsNumber.html(text);
                this.$reaultsNumber.find('.search-again').on('click', function () {
                    me.fireEvent('search:next', [me.inputText.getValue(), true]);
                });
            } else {
                this.$reaultsNumber.text(text);
            }
            this.updateResultsContainerHeight();
            !window.SSE && this.disableReplaceButtons(!count);
        },

        showToManyResults: function () {
            if (!window.SSE) {
                this.$resultsContainer.empty();
            } else {
                this.$resultsTable.hide();
                this.$resultsTable.find('.search-items').empty();
                this.$resultsContainer.find('.many-results').remove();
            }
            this.$resultsContainer.append('<div class="many-results">' + this.textTooManyResults + '</div>');
            if (!this.$resultsContainer.is(':visible')) {
                this.$resultsContainer.show();
            }
        },

        onClickClosePanel: function() {
            Common.NotificationCenter.trigger('leftmenu:change', 'hide');
            this.fireEvent('hide', this );
        },

        onBtnNextClick: function (action) {
            this.fireEvent('search:'+action, [this.inputText.getValue(), true]);
        },

        onReplaceClick: function (action) {
            this.fireEvent('search:'+action, [this.inputText.getValue(), this.inputReplace.getValue()]);
        },

        getSettings: function() {
            return {
                textsearch: this.inputText.getValue(),
                matchcase: this.chCaseSensitive.checked,
                matchword: this.chMatchWord.checked
            };
        },

        expandSearchOptions: function () {
            this.extendedOptions = !this.extendedOptions;
            this.$searchOptionsBlock[this.extendedOptions ? 'removeClass' : 'addClass']('no-expand');
            Common.localStorage.setBool('sse-search-options-extended', this.extendedOptions);

            this.updateResultsContainerHeight();
        },

        setFindText: function (val) {
            this.inputText.setValue(val);
        },

        clearResultsNumber: function () {
            this.updateResultsNumber('no-results');
        },

        disableNavButtons: function (resultNumber, allResults) {
            var disable = (this.inputText._input.val() === '' && !window.SSE) || !allResults;
            this.btnBack.setDisabled(disable);
            this.btnNext.setDisabled(disable);
        },

        disableReplaceButtons: function (disable) {
            this.btnReplace.setDisabled(disable);
            this.btnReplaceAll.setDisabled(disable);
        },

        textFind: 'Find',
        textFindAndReplace: 'Find and replace',
        textCloseSearch: 'Close search',
        textReplace: 'Replace',
        textReplaceAll: 'Replace All',
        textSearchResults: 'Search results: {0}/{1}',
        textReplaceWith: 'Replace with',
        textCaseSensitive: 'Case sensitive',
        textMatchUsingRegExp: 'Match using regular expressions',
        textWholeWords: 'Whole words only',
        textWithin: 'Within',
        textSelectDataRange: 'Select Data range',
        textSearch: 'Search',
        textLookIn: 'Look in',
        textSheet: 'Sheet',
        textWorkbook: 'Workbook',
        textSpecificRange: 'Specific range',
        textByRows: 'By rows',
        textByColumns: 'By columns',
        textFormulas: 'Formulas',
        textValues: 'Values',
        textSearchOptions: 'Search options',
        textNoMatches: 'No matches',
        textNoSearchResults: 'No search results',
        textItemEntireCell: 'Entire cell contents',
        textTooManyResults: 'There are too many results to show here',
        tipPreviousResult: 'Previous result',
        tipNextResult: 'Next result',
        textName: 'Name',
        textCell: 'Cell',
        textValue: 'Value',
        textFormula: 'Formula',
        textSearchHasStopped: 'Search has stopped',
        textContentChanged: 'Document changed.',
        textSearchAgain: '{0}Perform new search{1} for accurate results.',
        textItemsSuccessfullyReplaced: '{0} items successfully replaced.',
        textPartOfItemsNotReplaced: '{0}/{1} items replaced. Remaining {2} items are locked by other users.',
        textSearchResultsTable: 'Search results'

    }, Common.Views.SearchPanel || {}));
});