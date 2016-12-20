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
 *  StatusBar View
 *
 *  Created by Maxim Kadushkin on 11/28/2016
 *  Copyright (c) 2016 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'underscore'
],
    function(template){
        'use strict';

        SSE.Views.Statusbar = Backbone.View.extend({
            el: '.pages > .page',
            template: '<div class="statusbar">' +
                            '<div id="box-addtab" class="status-group">' +
                                '<a href="#" id="btn-addtab" class="button"><i class="icon icon-plus"></i></a>' +
                            '</div>' +
                            '<div class="box-tabs">' +
                                '<ul class="sheet-tabs bottom"></ul>' +
                            '</div>' +
                        '</div>',
            tabtemplate: _.template('<li class="tab"><a><%= label %></a></li>'),

            events: {},
            api: undefined,

            initialize: function (options) {
                _.extend(this, options);
            },

            render: function () {
                var me = this;
                this.$el = $(this.template).appendTo($(this.el));

                this.$boxTabs = this.$el.find('.box-tabs > ul');
                this.$btnAddTab = this.$el.find('#box-addtab > .button');
                this.$btnAddTab.on('click', function(e){
                    me.fireEvent('sheet:addnew');
                });

                // this.editMode = false;

                // this.btnAddWorksheet = new Common.UI.Button({
                //     el: $('#status-btn-addtab',this.el),
                //     hint: this.tipAddTab,
                //     disabled: true,
                //     hintAnchor: 'top'
                // });

                return this;
            },

            // setApi: function(api) {
                // this.api = api;
                // this.api.asc_registerCallback('asc_onSheetsChanged', _.bind(this.update, this));
                // return this;
            // },

            setMode: function(mode) {
                this.mode = _.extend({}, this.mode, mode);
//                this.$el.find('.el-edit')[mode.isEdit?'show':'hide']();
                this.btnAddWorksheet.setVisible(this.mode.isEdit);
                this.btnAddWorksheet.setDisabled(this.mode.isDisconnected);
                this.lblChangeRights[(!this.mode.isOffline && this.mode.sharingSettingsUrl&&this.mode.sharingSettingsUrl.length)?'show':'hide']();
                // this.updateTabbarBorders();
            },

            setVisible: function(visible) {
                visible ? this.show(): this.hide();
            },

            addSheet: function(model) {
                var index = this.$boxTabs.children().length;
                var $item = $(this.tabtemplate({
                    'label': model.get('name')
                })).appendTo(this.$boxTabs)

                $item.on('click', this.onSheetClick.bind(this, index, model));
                model.get('active') && $item.addClass('active');
                return $item;
            },

            addSheets: function () {
            },

            clearTabs: function () {
                this.$boxTabs.children().off('click');
                this.$boxTabs.empty();
            },

            setActiveTab: function (index) {
                this.$boxTabs.children().removeClass('active')
                        .eq(index).addClass('active');
            },

            update: function() {
                var me = this;

                return;

                this.tabbar.empty(true);
                this.btnAddWorksheet.setDisabled(true);

                if (this.api) {
                    var wc = this.api.asc_getWorksheetsCount(), i = -1;
                    var hidentems = [], items = [], tab, locked;
                    var sindex = this.api.asc_getActiveWorksheetIndex();

                    while (++i < wc) {
                        locked = me.api.asc_isWorksheetLockedOrDeleted(i);
                        tab = {
                            sheetindex    : i,
                            active        : sindex == i,
                            label         : me.api.asc_getWorksheetName(i),
//                          reorderable   : !locked,
                            cls           : locked ? 'coauth-locked':'',
                            isLockTheDrag : locked
                        };

                        this.api.asc_isWorksheetHidden(i)? hidentems.push(tab) : items.push(tab);
                    }

                    if (hidentems.length) {
                        hidentems.forEach(function(item){
                            me.tabMenu.items[6].menu.addItem(new Common.UI.MenuItem({
                                style: 'white-space: pre-wrap',
                                caption: Common.Utils.String.htmlEncode(item.label),
                                value: item.sheetindex
                            }));
                        });
                        this.tabMenu.items[6].show();
                    }

                    this.tabbar.add(items);

                    if (!_.isUndefined(this.tabBarScroll)) {
                        this.tabbar.$bar.scrollLeft(this.tabBarScroll.scrollLeft);
                        this.tabBarScroll = undefined;
                    }
                    if (!this.tabbar.isTabVisible(sindex))
                        this.tabbar.setTabVisible(sindex);

                    this.btnAddWorksheet.setDisabled(me.mode.isDisconnected || me.api.asc_isWorkbookLocked());
                    $('#status-label-zoom').text(Common.Utils.String.format(this.zoomText, Math.floor((this.api.asc_getZoom() +.005)*100)));

                    me.fireEvent('sheet:changed', [me, sindex]);
                    me.fireEvent('sheet:updateColors', [true]);
                    Common.NotificationCenter.trigger('comments:updatefilter', {property: 'uid', value: new RegExp('^(doc_|sheet' + me.api.asc_getActiveWorksheetId() + '_)')}, false);
                }
            },

            onSheetClick: function (index, model, e) {
                this.fireEvent('sheet:click', [index, model]);
            },

            onSheetChanged: function(o, index, tab) {
                this.api.asc_showWorksheet(tab.sheetindex);

                if (this.hasTabInvisible && !this.tabbar.isTabVisible(index)) {
                    this.tabbar.setTabVisible(index);
                }

                this.fireEvent('sheet:changed', [this, tab.sheetindex]);
                this.fireEvent('sheet:updateColors', [true]);

                Common.NotificationCenter.trigger('comments:updatefilter',
                    {
                        property: 'uid',
                        value: new RegExp('^(doc_|sheet' + this.api.asc_getActiveWorksheetId() + '_)')
                    },
                    false //  hide popover
                );
            },

            updateTabbarBorders: function() {
                var right = parseInt(this.boxZoom.css('width')), visible = false;
                if (this.boxMath.is(':visible')) {
                    right   += parseInt(this.boxMath.css('width'));
                    visible = true;
                }

                if (this.panelUsers.is(':visible')) {
                    right   += parseInt(this.panelUsers.css('width'));
                    visible = true;
                }

                this.boxZoom.find('.separator').css('border-left-color',visible?'':'transparent');
                this.tabBarBox.css('right',  right + 'px');
            },

            changeViewMode: function (edit) {
                if (edit) {
                    this.tabBarBox.css('left',  '152px');
                } else {
                    this.tabBarBox.css('left',  '');
                }

                this.tabbar.options.draggable = edit;
                this.editMode = edit;
            }
        });
    }
);