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
 *  StatusBar View
 *
 *  Created by Maxim Kadushkin on 11/28/2016
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'underscore'
    , 'common/mobile/utils/utils'
],
    function(core){
        'use strict';

        SSE.Views.Statusbar = Backbone.View.extend((function(){
            function tabVisible(t) {
                var leftbound = arguments[1] || this.$boxTabs.offset().left,
                    rightbound = arguments[2] || (leftbound + this.$boxTabs.width()),
                    tab;

                if ( typeof t == 'number' ) {
                    if ( !(t < 0) && t < this.$boxTabs.children().length ) {
                        tab = this.$boxTabs.children().eq(t);
                    }
                } else {
                    tab = t.get('el');
                }

                if ( tab ) {
                    var rect = tab.get(0).getBoundingClientRect();
                    return !(rect.left < leftbound) && !(rect.right > rightbound);
                }

                return false;
            }

            function setTabVisible(tab) {
                var _sheets = SSE.getCollection('Sheets');

                if ( typeof tab == 'object' ) {
                     if ( tab == _sheets.first() ) tab = 'first'; else
                     if ( tab == _sheets.last() ) tab = 'last';
                } else
                if ( typeof tab == 'number' ) {
                    if ( !(tab > 0) ) tab = 'first'; else
                    if ( !(tab + 1 < _sheets.size()) ) tab = 'last';
                    else tab = _sheets.at(tab);
                }

                if (tab <= 0 || tab == 'first') {
                    this.$boxTabs.scrollLeft(0);
                } else
                if ( tab == 'last' || tab >= (_sheets.size() - 1) ) {
                    this.$boxTabs.scrollLeft(10000);
                } else {
                    var $el = tab.get('el');
                    if ( $el ) {
                        var rightbound = this.$boxTabs.width();
                        var left = tab.position().left,
                            right = left + parseInt(tab.css('width'));

                        if (left < 0) {
                            this.$boxTabs.scrollLeft(/*this.$boxTabs.scrollLeft() + */left - 26);
                        } else if (right > rightbound) {
                            this.$boxTabs.scrollLeft(/*this.$boxTabs.scrollLeft() + */(right - rightbound) + 20);
                        }
                    }
                }
            }

            function hasInvisible() {
                var _sheets = SSE.getCollection('Sheets');

                var _left_bound_ = this.$boxTabs.offset().left,
                    _right_bound_ = _left_bound_ + this.$boxTabs.width();

                var tab = _sheets.first().get('el');
                var rect = tab.get(0).getBoundingClientRect();

                if ( !(rect.left < _left_bound_) ) {
                    tab = _sheets.last().get('el');
                    rect = tab.get(0).getBoundingClientRect();

                    if ( !(rect.right > _right_bound_) )
                        return false;
                }

                return true;
            }

            var touch = {};
            function onTouchStart(e) {
                if ( hasInvisible.call(this) )
                {
                    var touches = e.originalEvent.changedTouches;
                    touch.startx = touches[0].clientX;
                    touch.scrollx = this.$boxTabs.scrollLeft();

                    touch.timer = setTimeout(function () {
                        // touch.longtouch = true;
                    }, 500);
                    e.preventDefault();
                }
            }

            function onTouchMove(e) {
                if ( touch.startx !== undefined ) {
                    var touches = e.originalEvent.changedTouches;

                    if ( touch.longtouch ) {}
                    else {
                        if ( touch.timer ) clearTimeout(touch.timer), delete touch.timer;
                        this.$boxTabs.scrollLeft(touch.scrollx + (touch.startx - touches[0].clientX));
                    }

                    e.preventDefault();
                }
            }

            function onTouchEnd(e) {
                if ( touch.startx !== undefined ) {
                    touch.longtouch = false;
                    delete touch.startx;
                    e.preventDefault();
                }
            }

            return {
                el: '.pages > .page',
                template: '<div class="statusbar">' +
                                '<div id="box-addtab" class="status-group">' +
                                    '<a href="#" id="btn-addtab" class="button" style="display:none"><i class="icon icon-plus"></i></a>' +
                                '</div>' +
                                '<div class="box-tabs">' +
                                    '<ul class="sheet-tabs bottom"></ul>' +
                                '</div>' +
                            '</div>',
                tabtemplate: _.template('<li class="tab<% if (locked) print(" locked"); %>"><a><%= label %></a></li>'),
                menutemplate: _.template(
                    '<% _.each(menuItems, function(item) { %>' +
                        '<li data-event="<%= item.event %>" class="<% if (item.locked===true) print("disabled") %>">' +
                            '<a href="#" class="item-link list-button"><%= item.caption %>' +
                        '</li>' +
                    '<% }); %>'),

                events: {},
                api: undefined,

                initialize: function (options) {
                    _.extend(this, options);
                },

                render: function () {
                    var me = this;
                    me.$el = $(me.template).appendTo($(me.el));

                    me.$boxTabs = me.$el.find('.box-tabs > ul');
                    me.$btnAddTab = me.$el.find('#box-addtab > .button');
                    me.$btnAddTab.single('click', _.buffered(function(e) {
                        me.fireEvent('sheet:addnew');
                    }, 300));

                    me.$boxTabs.on({
                        'touchstart': onTouchStart.bind(this),
                        'touchmove': onTouchMove.bind(this),
                        'touchend': onTouchEnd
                    });

                    // me.editMode = false;
                    return me;
                },

                setMode: function(mode) {
                    if ('disconnect' == mode) {
                        this.$btnAddTab.toggleClass('disabled', true);
                    } else if (mode.isEdit) {
                        this.$btnAddTab.show();
                    }
                },

                setVisible: function(visible) {
                    visible ? this.show(): this.hide();
                },

                addSheet: function(model) {
                    var index = this.$boxTabs.children().length;
                    var $item = $(this.tabtemplate({
                        label: model.get('name'),
                        locked: model.get('locked')
                    })).appendTo(this.$boxTabs);

                    $item.on('click', this.onSheetClick.bind(this, index, model));
                    model.get('active') && $item.addClass('active');
                    model.set('el', $item, {silent:true});

                    return $item;
                },

                addSheets: function (collection) {
                    var active;
                    collection.each(function(model) {
                        this.addSheet(model);

                        if ( model.get('active') )
                            active = model;
                    }, this);

                    if ( active && !tabVisible.call(this, active) )
                        setTabVisible.call(this, active);
                },

                clearTabs: function () {
                    this.$boxTabs.children().off('click');
                    this.$boxTabs.empty();
                },

                setActiveTab: function (index) {
                    this.$boxTabs.children().removeClass('active')
                            .eq(index).addClass('active');

                    if ( !tabVisible.call(this, index) )
                        setTabVisible.call(this, index);
                },

                onSheetClick: function (index, model, e) {
                    this.fireEvent('sheet:click', [index, model]);
                    return false;
                },

                // onSheetChanged: function(o, index, tab) {
                //     this.api.asc_showWorksheet(tab.sheetindex);
                //
                //     if (this.hasTabInvisible && !this.tabbar.isTabVisible(index)) {
                //         this.tabbar.setTabVisible(index);
                //     }
                //
                //     this.fireEvent('sheet:changed', [this, tab.sheetindex]);
                //     this.fireEvent('sheet:updateColors', [true]);
                //
                //     Common.NotificationCenter.trigger('comments:updatefilter',
                //         {
                //             property: 'uid',
                //             value: new RegExp('^(doc_|sheet' + this.api.asc_getActiveWorksheetId() + '_)')
                //         },
                //         false //  hide popover
                //     );
                // },

                changeViewMode: function (edit) {
                    if (edit) {
                        this.tabBarBox.css('left',  '152px');
                    } else {
                        this.tabBarBox.css('left',  '');
                    }

                    this.tabbar.options.draggable = edit;
                    this.editMode = edit;
                },

                showTabContextMenu: function (items, model) {
                    uiApp.closeModal('.document-menu.modal-in');

                    var popoverHTML =
                        '<div class="popover document-menu">'+
                            '<div class="popover-inner">'+
                                '<div class="list-block">'+
                                    '<ul>'+
                                        this.menutemplate({menuItems: items}) +
                                    '</ul>'+
                                '</div>'+
                            '</div>'+
                        '</div>';

                    var $target = model.get('el');
                    var popover = uiApp.popover(popoverHTML, $target);

                    if (Common.SharedSettings.get('android')) {
                        Common.Utils.androidMenuTop($(popover),  $target);
                    }

                    $('.modal-overlay').removeClass('modal-overlay-visible');
                    $('.document-menu li').single('click', _.buffered(function(e) {
                        uiApp.closeModal('.document-menu.modal-in');

                        var $target = $(e.currentTarget),
                            eventName = $target.data('event');

                        this.fireEvent('contextmenu:click', [this, eventName, model]);
                    }, 100, this));
                }
            }
        })())
    }
);