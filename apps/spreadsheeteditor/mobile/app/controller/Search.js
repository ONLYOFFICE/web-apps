/*
 *
 * (c) Copyright Ascensio System Limited 2010-2017
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
Ext.define('SSE.controller.Search', {
    extend: 'Ext.app.Controller',

    config: {
        refs: {
            nextResult      : '#id-btn-search-prev',
            previousResult  : '#id-btn-search-next',
            searchField     : '#id-field-search'
        },

        control: {
            '#id-btn-search-prev': {
                tap: 'onPreviousResult'
            },
            '#id-btn-search-next': {
                tap: 'onNextResult'
            },
            '#id-field-search': {
                keyup: 'onSearchKeyUp',
                change: 'onSearchChange',
                clearicontap: 'onSearchClear'
            }
        }
    },

    _step: -1,

    init: function() {
    },

    setApi: function(o) {
        this.api = o;
        this.findOptions = new Asc.asc_CFindOptions();
        this.findOptions.asc_setScanForward(true);
        this.findOptions.asc_setIsMatchCase(false);
        this.findOptions.asc_setIsWholeCell(false);
        this.findOptions.asc_setScanOnOnlySheet(true);
        this.findOptions.asc_setScanByRows(true);
        this.findOptions.asc_setLookIn(Asc.c_oAscFindLookIn.Formulas);
    },

    onNextResult: function(){
        var searchField = this.getSearchField();
        if (this.api && searchField){
            this.findOptions.asc_setFindWhat(searchField.getValue());
            this.findOptions.asc_setScanForward(true);
            this.api.asc_findText(this.findOptions);
        }
    },

    onPreviousResult: function(){
        var searchField = this.getSearchField();
        if (this.api && searchField){
            this.findOptions.asc_setFindWhat(searchField.getValue());
            this.findOptions.asc_setScanForward(false);
            this.api.asc_findText(this.findOptions);
        }
    },

    onSearchKeyUp: function(field, e){
        var keyCode = e.event.keyCode,
            searchField = this.getSearchField();

        if (keyCode == 13 && this.api) {
            this.findOptions.asc_setFindWhat(searchField.getValue());
            this.findOptions.asc_setScanForward(true);
            this.api.asc_findText(this.findOptions);
        }
        this.updateNavigation();
    },

    onSearchChange: function(field, newValue, oldValue){
        this.updateNavigation();
    },

    onSearchClear: function(field, e){
        this.updateNavigation();

        // workaround blur problem in iframe (bug #12685)
        window.focus();
        document.activeElement.blur();
    },

    updateNavigation: function(){
        var searchField = this.getSearchField(),
            nextResult = this.getNextResult(),
            previousResult = this.getPreviousResult();

        if (searchField && nextResult && previousResult){
            nextResult.setDisabled(searchField.getValue() == '');
            previousResult.setDisabled(searchField.getValue() == '');
        }
    }
});
