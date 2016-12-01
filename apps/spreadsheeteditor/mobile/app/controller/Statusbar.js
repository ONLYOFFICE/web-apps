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
 *  Statusbar.js
 *
 *  Statusbar controller
 *
 *  Created by Maxim Kadushkin on 11/28/2016
 *  Copyright (c) 2016 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'spreadsheeteditor/mobile/app/view/Statusbar',
    'spreadsheeteditor/mobile/app/collection/sheets'
], function () {
    'use strict';

    SSE.Controllers.Statusbar = Backbone.Controller.extend({
        models: [],
        collections: ['Sheets'],
        views: [
            'Statusbar'
        ],

        initialize: function() {
            this.addListeners({
                'Statusbar': {
                    'sheet:click': this.onTabClick
                }
            });
        },

        events: function() {
        },

        onLaunch: function() {
            var me = this;
            this.statusbar = this.createView('Statusbar').render();
            // this.statusbar.$el.css('z-index', 10);

            this.sheets = this.getApplication().getCollection('Sheets');
            this.sheets.bind({
                add     : function (model, collection, opts) {
                    console.log('add in collection');
                },
                change  : function (model) {
                    console.log('change in collection');
                },
                reset   : function (collection, opts) {
                    collection.each(function(model) {
                        me.statusbar.addSheet(model);
                    });
                }
            });

            // this.bindViewEvents(this.statusbar, this.events);
        },

        setApi: function(api) {
            this.api = api;
            // this.api.asc_registerCallback('asc_onCoAuthoringDisconnect', _.bind(this.onApiDisconnect, this));
            // Common.NotificationCenter.on('api:disconnect',               _.bind(this.onApiDisconnect, this));
            // this.api.asc_registerCallback('asc_onUpdateTabColor', _.bind(this.onApiUpdateTabColor, this));
            // this.api.asc_registerCallback('asc_onEditCell', _.bind(this.onApiEditCell, this));
            /** coauthoring begin **/
            // this.api.asc_registerCallback('asc_onWorkbookLocked', _.bind(this.onWorkbookLocked, this));
            // this.api.asc_registerCallback('asc_onWorksheetLocked', _.bind(this.onWorksheetLocked, this));
            /** coauthoring end **/
            // this.api.asc_registerCallback('asc_onError', _.bind(this.onError, this));

            // this.statusbar.setApi(api);

            this.api.asc_registerCallback('asc_onSheetsChanged', this.onApiSheetsChanged.bind(this));
        },

        /*
        *   api events
        * */

        onApiSheetsChanged: function() {
            var me = this;

            var sheets_count = this.api.asc_getWorksheetsCount(), i = -1;
            var hiddentems = [], items = [], tab, locked;
            var active_index = this.api.asc_getActiveWorksheetIndex();

            while ( ++i < sheets_count ) {
                locked = me.api.asc_isWorksheetLockedOrDeleted(i);
                tab = {
                    index       : i,
                    active      : active_index == i,
                    name        : me.api.asc_getWorksheetName(i),
                    cls         : locked ? 'coauth-locked':'',
                    draglocked  : locked
                };

                this.api.asc_isWorksheetHidden(i)? hiddentems.push(tab) :
                    items.push(new SSE.Models.Sheet(tab));
            }

            this.sheets.reset(items);

            return;

            // this.tabbar.empty(true);
            // this.btnAddWorksheet.setDisabled(true);

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

        onApiDisconnect: function() {
            this.statusbar.setMode({isDisconnected: true});
            this.statusbar.update();
        },

        /** coauthoring begin **/
        onWorkbookLocked: function(locked) {
            this.statusbar.tabbar[locked?'addClass':'removeClass']('coauth-locked');
            this.statusbar.btnAddWorksheet.setDisabled(locked || this.statusbar.rangeSelectionMode==Asc.c_oAscSelectionDialogType.Chart ||
                                                                 this.statusbar.rangeSelectionMode==Asc.c_oAscSelectionDialogType.FormatTable);
            var item, i = this.statusbar.tabbar.getCount();
            while (i-- > 0) {
                item = this.statusbar.tabbar.getAt(i);
                if (item.sheetindex >= 0) {
//                        if (locked) item.reorderable = false;
//                        else item.reorderable = !this.api.asc_isWorksheetLockedOrDeleted(item.sheetindex);
                } else {
                    item.disable(locked);
                }
            }
        },

        onWorksheetLocked: function(index,locked) {
            var count = this.statusbar.tabbar.getCount(), tab;
            for (var i = count; i-- > 0; ) {
                tab = this.statusbar.tabbar.getAt(i);
                if (index == tab.sheetindex) {
                    tab[locked?'addClass':'removeClass']('coauth-locked');
                    tab.isLockTheDrag = locked || (this.statusbar.rangeSelectionMode==Asc.c_oAscSelectionDialogType.FormatTable);
                    break;
                }
            }
        },
        /** coauthoring end **/

        onApiEditCell: function(state) {
            var disableAdd = (state == Asc.c_oAscCellEditorState.editFormula),
                disable = (state != Asc.c_oAscCellEditorState.editEnd),
                mask = $('.statusbar-mask'),
                statusbar = this.statusbar;

            statusbar.isEditFormula = disableAdd;

            if (disableAdd && mask.length>0 || !disableAdd && mask.length==0) return;
            statusbar.$el.find('.statusbar').toggleClass('masked', disableAdd);
            if(disableAdd) {
                mask = $("<div class='statusbar-mask'>").appendTo(statusbar.$el);
            } else {
                mask.remove();
            }
        },

        createDelayedElements: function() {
            this.statusbar.$el.css('z-index', '');
            this.statusbar.tabMenu.on('item:click', _.bind(this.onTabMenu, this));
            this.statusbar.btnAddWorksheet.on('click', _.bind(this.onAddWorksheetClick, this));

            Common.NotificationCenter.on('window:resize', _.bind(this.onWindowResize, this));
            Common.NotificationCenter.on('cells:range',   _.bind(this.onRangeDialogMode, this));
        },

        onWindowResize: function(area) {
            // this.statusbar.onTabInvisible(undefined, this.statusbar.tabbar.checkInvisible(true));
        },

        onTabMenu: function(obj, item, e) {
            switch (item.value){
            case 'ins':
                this.api.asc_insertWorksheet(this.createSheetName());
                break;
            case 'del':     this.deleteWorksheet(); break;
            case 'copy':    this.moveWorksheet(false); break;
            case 'hide':    this.hideWorksheet(true); break;
            }
        },

        createSheetName: function() {
            var items = [], wc = this.api.asc_getWorksheetsCount();
            while (wc--) {
                items.push(this.api.asc_getWorksheetName(wc).toLowerCase());
            }

            var index = 0, name;
            while(++index < 1000) {
                name = this.strSheet + index;
                if (items.indexOf(name.toLowerCase()) < 0) break;
            }

            return name;
        },

        createCopyName: function(orig) {
            var wc = this.api.asc_getWorksheetsCount(), names = [];
            while (wc--) {
                names.push(this.api.asc_getWorksheetName(wc).toLowerCase());
            }

            var re = /^(.*)\((\d)\)$/.exec(orig);
            var first = re ? re[1] : orig + ' ';

            var index = 1, name;
            while(++index < 1000) {
                name = first + '(' + index + ')';
                if (names.indexOf(name.toLowerCase()) < 0) break;
            }

            return name;
        },

        deleteWorksheet: function() {
            var me = this;

            if (this.statusbar.tabbar.tabs.length == 1) {
                Common.UI.warning({msg: this.errorLastSheet});
            } else {
                Common.UI.warning({
                    msg: this.warnDeleteSheet,
                    buttons: ['ok','cancel'],
                    callback: function(btn) {
                        if (btn == 'ok' && !me.api.asc_deleteWorksheet()) {
                            _.delay(function(){
                                Common.UI.error({msg: me.errorRemoveSheet});
                            },10);
                        }
                    }
                });
            }
        },

        hideWorksheet: function(hide, index) {
            if ( hide ) {
                this.statusbar.tabbar.tabs.length == 1 ?
                    Common.UI.warning({msg: this.errorLastSheet}) :
                    this.api['asc_hideWorksheet'](index);
            } else {
                this.api['asc_showWorksheet'](index);
                this.loadTabColor(index);
            }
        },

        moveWorksheet: function(cut, silent, index, destPos) {
            var me = this;
            var wc = me.api.asc_getWorksheetsCount(), items = [], i = -1;
            while (++i < wc) {
                if (!this.api.asc_isWorksheetHidden(i)) {
                    items.push({
                        value       : me.api.asc_getWorksheetName(i),
                        inindex     : i
                    });
                }
            }
            if (!_.isUndefined(silent)) {
                me.api.asc_showWorksheet(items[index].inindex);

                Common.NotificationCenter.trigger('comments:updatefilter',
                    {property: 'uid',
                        value: new RegExp('^(doc_|sheet' + this.api.asc_getActiveWorksheetId() + '_)')});

                if (!_.isUndefined(destPos)) {
                    me.api.asc_moveWorksheet(items.length === destPos ? wc : items[destPos].inindex);
                }

                return;
            }

            (new SSE.Views.Statusbar.CopyDialog({
                title   : cut ? me.statusbar.itemMove : me.statusbar.itemCopy,
                ismove  : cut,
                names   : items,
                handler : function(btn, i) {
                    if (btn == 'ok') {
                        if (cut) {
                            me.api.asc_moveWorksheet(i == -255 ? wc : i);
                        } else {
                            var new_text = me.createCopyName(me.api.asc_getWorksheetName(me.api.asc_getActiveWorksheetIndex()));
                            me.api.asc_copyWorksheet(i == -255 ? wc : i, new_text);
                        }
                    }
                    me.api.asc_enableKeyEvents(true);
                }
            })).show();
        },

        onAddWorksheetClick: function(o, index, opts) {
            if (this.api) {
                this.api.asc_closeCellEditor();
                this.api.asc_addWorksheet(this.createSheetName());

                Common.NotificationCenter.trigger('comments:updatefilter',
                    {property: 'uid',
                        value: new RegExp('^(doc_|sheet' + this.api.asc_getActiveWorksheetId() + '_)')
                    },
                    false   //  hide popover
                );
            }
            Common.NotificationCenter.trigger('edit:complete', this.statusbar);
        },

        selectTab: function (index) {
            if (this.api) {
                var hidden = this.api.asc_isWorksheetHidden(sheetindex);
                if (!hidden) {
                    var tab = _.findWhere(this.statusbar.tabbar.tabs, {sheetindex: sheetindex});
                    if (tab) {
                        this.statusbar.tabbar.setActive(tab);
                    }
                }
            }
        },

        moveCurrentTab: function (direction) {
            if (this.api) {
                var indTab = 0,
                    tabBar = this.statusbar.tabbar,
                    index = this.api.asc_getActiveWorksheetIndex(),
                    length = tabBar.tabs.length;

                this.statusbar.tabMenu.hide();
                this.api.asc_closeCellEditor();

                for (var i = 0; i < length; ++i) {
                    if (tabBar.tabs[i].sheetindex === index) {
                        indTab = i;

                        if (direction > 0) {
                            indTab++;
                            if (indTab >= length) {
                                indTab = 0;
                            }
                        } else {
                            indTab--;
                            if (indTab < 0) {
                                indTab = length - 1;
                            }
                        }

                        tabBar.setActive(indTab);
                        this.api.asc_showWorksheet(tabBar.getAt(indTab).sheetindex);

                        break;
                    }
                }
            }
        },

        // colors

        onApiUpdateTabColor: function (index) {
            this.loadTabColor(index);
        },

        updateThemeColors: function() {
            var updateColors = function(picker, defaultColorIndex) {
                if (picker) {
                    var clr,
                        effectcolors = Common.Utils.ThemeColor.getEffectColors();

                    for (var i = 0; i < effectcolors.length; ++i) {
                        if (typeof(picker.currentColor) == 'object' &&
                            clr === undefined &&
                            picker.currentColor.effectId == effectcolors[i].effectId)
                            clr = effectcolors[i];
                    }

                    picker.updateColors(effectcolors, Common.Utils.ThemeColor.getStandartColors());

                    if (picker.currentColor === undefined) {
                        picker.currentColor = effectcolors[defaultColorIndex];
                    } else if (clr!==undefined) {
                        picker.currentColor = clr;
                    }
                }
            };

            if (this.statusbar) {
                updateColors(this.statusbar.mnuTabColor, 1);
            }
        },

        onNewBorderColor: function() {
            if (this.statusbar && this.statusbar.mnuTabColor) {
                this.statusbar.mnuTabColor.addNewColor();
            }
        },

        loadTabColor: function (sheetindex) {
            if (this.api) {
                if (!this.api.asc_isWorksheetHidden(sheetindex)) {
                    var tab = _.findWhere(this.statusbar.tabbar.tabs, {sheetindex: sheetindex});
                    if (tab) {
                        this.setTabLineColor(tab, this.api.asc_getWorksheetTabColor(sheetindex));
                    }
                }
            }
        },

        setTabLineColor: function (tab, color) {
            if (tab) {
                 if (null !== color) {
                    color = '#' + Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
                } else {
                    color = '';
                }

                if (color.length) {
                    if (!tab.isActive()) {
                        color = '0px 3px 0 ' + Common.Utils.RGBColor(color).toRGBA(0.7) + ' inset';
                    } else {
                        color = '0px 3px 0 ' + color + ' inset';
                    }

                    tab.$el.find('a').css('box-shadow', color);
                } else {
                    tab.$el.find('a').css('box-shadow', '');
                }
            }
        },

        onZoomShow: function(e){
            if (e.target.classList.contains('disabled')) {
                return false;
            }
        },


        onError: function(id, level, errData) {
            if (id == Asc.c_oAscError.ID.LockedWorksheetRename)
                this.statusbar.update();
        },

        onTabClick: function(index, model) {
            this.api.asc_showWorksheet(model.get('index'));
            this.statusbar.setActiveTab(index);
        },

        errorLastSheet  : 'Workbook must have at least one visible worksheet.',
        errorRemoveSheet: 'Can\'t delete the worksheet.',
        warnDeleteSheet : 'The worksheet maybe has data. Proceed operation?',
        strSheet        : 'Sheet'
    });
});