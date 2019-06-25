/*
 *
 * (c) Copyright Ascensio System SIA 2010-2019
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
 * You can contact Ascensio System SIA at 20A-12 Ernesta Birznieka-Upisha
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
 *  FilterOptions.js
 *  Spreadsheet Editor
 *
 *  Created by Julia Svinareva on 13/6/19
 *  Copyright (c) 2019 Ascensio System SIA. All rights reserved.
 *
 */
define([
    'core',
    'jquery',
    'underscore',
    'backbone',
    'spreadsheeteditor/mobile/app/view/FilterOptions'
], function (core, $, _, Backbone) {
    'use strict';

    SSE.Controllers.FilterOptions = Backbone.Controller.extend(_.extend((function() {
        // Private
        var rootView,
            dataFilter,
            indChecked = [],
            modalView;

        return {
            models: [],
            collections: [],
            views: [
                'FilterOptions'
            ],

            initialize: function() {
                var me = this;
                me.addListeners({
                    'FilterOptions': {
                        'page:show' : me.onPageShow
                    }
                });
            },

            setApi: function(api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onSetAFDialog', _.bind(this.setSettings, this));
            },

            onLaunch: function () {
                this.createView('FilterOptions').render();
            },

            setMode: function(mode) {
                this.appConfig = mode;
            },

            showModal: function(posX,posY) {
                var me = this,
                    isAndroid = Framework7.prototype.device.android === true,
                    mainView = SSE.getController('Editor').getView('Editor').f7View;

                uiApp.closeModal();

                if (Common.SharedSettings.get('phone')) {
                    modalView = $$(uiApp.pickerModal(
                        '<div class="picker-modal settings container-filter">' +
                        '<div class="view filter-root-view navbar-through">' +
                        this.getView('FilterOptions').rootLayout() +
                        '</div>' +
                        '</div>'
                    )).on('opened', function () {
                        if (_.isFunction(me.api.asc_OnShowContextMenu)) {
                            me.api.asc_OnShowContextMenu()
                        }
                    }).on('close', function (e) {
                        mainView.showNavbar();
                        me.isValidChecked();
                    }).on('closed', function () {
                        if (_.isFunction(me.api.asc_OnHideContextMenu)) {
                            me.api.asc_OnHideContextMenu()
                        }
                    });
                    mainView.hideNavbar();
                } else {
                    var popoverHTML =
                        '<div class="popover settings container-filter">' +
                        '<div class="popover-angle"></div>' +
                        '<div class="popover-inner">' +
                        '<div class="content-block">' +
                        '<div class="view popover-view filter-root-view navbar-through">' +
                        this.getView('FilterOptions').rootLayout() +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '</div>';
                    var $target = $('#context-menu-target')
                        .css({left: posX, top: Math.max(0, posY)});
                    modalView = uiApp.popover(popoverHTML, $target);
                    $$(modalView).on('close', function (e) {
                        me.isValidChecked();
                    });
                    if (Common.SharedSettings.get('android')) {
                        Common.Utils.androidMenuTop($(modalView),  $target);
                    }
                }

                if (Framework7.prototype.device.android === true) {
                    $$('.view.filter-root-view.navbar-through').removeClass('navbar-through').addClass('navbar-fixed');
                    $$('.view.filter-root-view .navbar').prependTo('.view.filter-root-view > .pages > .page');
                }

                rootView = uiApp.addView('.filter-root-view', {
                    dynamicNavbar: true,
                    domCache: true
                });

                Common.NotificationCenter.trigger('filtercontainer:show');
                this.onPageShow(this.getView('FilterOptions'));

                SSE.getController('Toolbar').getView('Toolbar').hideSearch();
            },

            isValidChecked: function () {
                var me = this,
                    isValid = true;
                if (indChecked.length === indChecked.filter(function (item) {return item === false;}).length) {
                    isValid = false;
                }
                if(!isValid) {
                    uiApp.modal({
                        title   : me.textErrorTitle,
                        text    : me.textErrorMsg,
                        buttons: [
                            {
                                text: 'OK',
                            }
                        ]
                    });
                }
            },

            rootView : function() {
                return rootView;
            },

            onPageShow: function(view, pageId) {
                var me = this;
                var $clearFilter = $("#btn-clear-filter"),
                    $deleteFilter = $("#btn-delete-filter");
                this.setClearDisable();
                $clearFilter.single('click',    _.bind(me.onClickClearFilter, me));
                $deleteFilter.single('click',    _.bind(me.onClickDeleteFilter, me));
                $('.sortdown').single('click',  _.bind(me.onClickSort, me, 'down'));
                $('.sortup').single('click', _.bind(me.onClickSort, me, 'up'));
                this.setDataFilterCells();
            },

            setSettings: function(config) {
                dataFilter = config;
            },

            hideModal: function() {
                if (modalView) {
                    uiApp.closeModal(modalView);
                }
            },

            onClickSort: function(type) {
                this.api.asc_sortColFilter(type == 'down' ? Asc.c_oAscSortOptions.Ascending : Asc.c_oAscSortOptions.Descending,  '', dataFilter.asc_getCellId(), dataFilter.asc_getDisplayName(),true);
            },

            onClickClearFilter: function () {
                var me = this;
                if (me.api)
                    me.api.asc_clearFilter();
                for(var i=0; i<indChecked.length; i++) {
                    indChecked[i] = true;
                }
                setTimeout(function () {
                    me.updateCell();
                },20);
                $('[name="filter-cell"]').prop('checked', true);
                $('[name="filter-cell-all"]').prop('checked', true);
            },

            onClickDeleteFilter: function () {
                var formatTableInfo = this.api.asc_getCellInfo().asc_getFormatTableInfo();
                var tablename = (formatTableInfo) ? formatTableInfo.asc_getTableName() : undefined;
                if (this.api)
                    this.api.asc_changeAutoFilter(tablename, Asc.c_oAscChangeFilterOptions.filter, false);
                this.hideModal();
            },

            setClearDisable: function() {
                var $clearFilter = $("#btn-clear-filter");
                var arr = dataFilter.asc_getValues();
                var lenCheck = arr.filter(function (item) {
                    return item.visible == true;
                }).length;
                if (lenCheck == arr.length) {
                    $clearFilter.addClass("disabled");
                } else {
                    $clearFilter.removeClass("disabled");
                }
            },

            setDataFilterCells: function() {
                function isNumeric(value) {
                    return !isNaN(parseFloat(value)) && isFinite(value);
                }
                var me = this,
                    isnumber, value,
                    index = 0, throughIndex = 0,
                    selectedCells = 0,
                    arrCells = [],
                    idxs = [];

                dataFilter.asc_getValues().forEach(function (item) {
                    value       = item.asc_getText();
                    isnumber    = isNumeric(value);

                    if (idxs[throughIndex]==undefined) {
                        idxs[throughIndex] = item.asc_getVisible();
                    }

                    arrCells.push({
                            id              : index++,
                            selected        : false,
                            allowSelected   : true,
                            cellvalue       : value ? value : me.textEmptyItem,
                            value           : isnumber ? value : (value.length > 0 ? value: me.textEmptyItem),
                            intval          : isnumber ? parseFloat(value) : undefined,
                            strval          : !isnumber ? value : '',
                            groupid         : '1',
                            check           : idxs[throughIndex],
                            throughIndex    : throughIndex
                        });
                        if (idxs[throughIndex]) selectedCells++;

                    ++throughIndex;
                });

                indChecked = idxs;

                if(arrCells.length > 0) {
                    var templateItemCell = _.template([
                        '<%  _.each(cells, function (cell) { %>',
                        '<li>' +
                        '<label class="label-radio item-content">' +
                        '<input id="<%= cell.throughIndex %>" type="checkbox" name="filter-cell" value="<%= cell.cellvalue%>"/>' +
                        '<% if (android) { %><div class="item-media"><i class="icon icon-form-radio"></i></div><% } %>' +
                        '<div class="item-inner">' +
                        '<div class="item-title"><%= cell.cellvalue%></div>' +
                        '</div>' +
                        '</label>' +
                        '</li>',
                        '<% }); %>'].join(''));
                    var templateListCells = _.template(
                        '<ul>' +
                        '<li>' +
                        '<label class="label-radio item-content">' +
                        '<input type="checkbox" name="filter-cell-all" />' +
                        '<% if (android) { %><div class="item-media"><i class="icon icon-form-radio"></i></div><% } %>' +
                        '<div class="item-inner">' +
                        '<div class="item-title"><%= textSelectAll %></div>' +
                        '</div>' +
                        '</label>' +
                        '</li>' +
                        templateItemCell({cells: arrCells, android: Framework7.prototype.device.android}) +
                        '</ul>');
                    $('#list-cells').html(templateListCells({textSelectAll: this.textSelectAll, android: Framework7.prototype.device.android}));

                    var $filterCell = $('[name="filter-cell"]'),
                        $filterCellAll = $('[name="filter-cell-all"]');
                    $filterCell.single('change', _.bind(me.updateCell, me));
                    $filterCellAll.single('change', _.bind(me.updateCell, me));

                    if(selectedCells == arrCells.length) {
                        $filterCellAll.prop('checked', true);
                        $filterCell.prop('checked', true);
                    } else {
                        for(var i=0; i<arrCells.length; i++) {
                            $filterCell.eq(i).prop('checked', idxs[i]);
                        }
                    }
                }

            },

            updateCell: function(e) {
                var me = this;
                // Checkbox change
                var $filterCell = $('[name="filter-cell"]'),
                    $filterCellAll = $('[name="filter-cell-all"]'),
                    filterCellChecked = $('[name="filter-cell"]:checked').length,
                    filterCellCheckedAll = $('[name="filter-cell"]').length,
                    isValid = true;
                if(e) {
                    if (e.target.name == "filter-cell") {
                        if (filterCellChecked < filterCellCheckedAll) {
                            $filterCellAll.prop('checked', false);
                        } else if (filterCellChecked === filterCellCheckedAll) {
                            $filterCellAll.prop('checked', true);
                        }
                        indChecked[e.target.id] = e.target.checked;
                    }
                    // Select All change
                    if (e.target.name == "filter-cell-all") {
                        var checkAll = false;
                        if (e.target.checked) {
                            $filterCell.prop('checked', true);
                            checkAll = true;
                        } else {
                            $filterCell.prop('checked', false);
                            checkAll = false;
                            isValid = false;
                            filterCellChecked = 0;
                        }
                        for (var i = 0; i < indChecked.length; i++) {
                            indChecked[i] = checkAll;
                        }
                    }
                }
                if(filterCellChecked === 0) {
                    isValid = false;
                } else {
                    isValid = true;
                }
                if(isValid) {
                    var arrCells = dataFilter.asc_getValues();
                    arrCells.forEach(function (item, index) {
                        item.asc_setVisible(indChecked[index]);
                    });
                    dataFilter.asc_getFilterObj().asc_setType(Asc.c_oAscAutoFilterTypes.Filters);
                    this.api.asc_applyAutoFilter(dataFilter);
                }

                me.setClearDisable();

            },

            textEmptyItem: '{Blanks}',
            textSelectAll: 'Select All',
            textErrorTitle: 'Warning',
            textErrorMsg: 'You must choose at least one value'



        }
    })(), SSE.Controllers.FilterOptions || {}))
});