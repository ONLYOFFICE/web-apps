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
 *  Statusbar.js
 *
 *  Statusbar controller
 *
 *  Created by Maxim Kadushkin on 11/28/2016
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'spreadsheeteditor/mobile/app/view/Statusbar',
    'spreadsheeteditor/mobile/app/collection/sheets'
], function () {
    'use strict';

    SSE.Controllers.Statusbar = Backbone.Controller.extend(_.extend({
        models: [],
        collections: ['Sheets'],
        views: [
            'Statusbar'
        ],

        initialize: function() {
            this.addListeners({
                'Statusbar': {
                    'sheet:click': this.onTabClick,
                    'sheet:addnew': this.onAddTab,
                    'contextmenu:click': this.onTabMenu
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
                add:    function (model, collection, opts) {
                    var $item = me.statusbar.addSheet(model);
                    model.set('el', $item, {silent:true});
                },
                change: function (model) {
                    if ( model.changed ) {
                        if ( model.changed.locked != undefined ) {
                            model.get('el').toggleClass('locked', model.changed.locked);
                        }
                    }
                },
                reset:  function (collection, opts) {
                    me.statusbar.clearTabs();
                    me.statusbar.addSheets(collection);
                }
            });

            this.hiddensheets = this.getApplication().createCollection('Sheets');
            // this.bindViewEvents(this.statusbar, this.events);

            Common.NotificationCenter.on('document:ready', this.onApiSheetsChanged.bind(this));
        },

        setApi: function(api) {
            this.api = api;
            this.api.asc_registerCallback('asc_onCoAuthoringDisconnect', _.bind(this.onApiDisconnect, this));
            // Common.NotificationCenter.on('api:disconnect',               _.bind(this.onApiDisconnect, this));
            // this.api.asc_registerCallback('asc_onUpdateTabColor', _.bind(this.onApiUpdateTabColor, this));
            // this.api.asc_registerCallback('asc_onEditCell', _.bind(this.onApiEditCell, this));
            this.api.asc_registerCallback('asc_onWorkbookLocked', _.bind(this.onWorkbookLocked, this));
            this.api.asc_registerCallback('asc_onWorksheetLocked', _.bind(this.onWorksheetLocked, this));
            // this.api.asc_registerCallback('asc_onError', _.bind(this.onError, this));

            this.api.asc_registerCallback('asc_onSheetsChanged', this.onApiSheetsChanged.bind(this));
        },

        setMode: function(mode) {
            this.statusbar.setMode(mode);
            this.isEdit = mode.isEdit;
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
                    // cls         : locked ? 'coauth-locked':'',
                    locked      : locked,
                    color       : me.api.asc_getWorksheetTabColor(i)
                };

                (this.api.asc_isWorksheetHidden(i) ? hiddentems : items).push(new SSE.Models.Sheet(tab));
            }

            this.sheets.reset(items);
            this.hiddensheets.reset(hiddentems);

            return;

            if (this.api) {
                // if (!this.tabbar.isTabVisible(sindex))
                //     this.tabbar.setTabVisible(sindex);

                // this.btnAddWorksheet.setDisabled(me.mode.isDisconnected || me.api.asc_isWorkbookLocked());
                // $('#status-label-zoom').text(Common.Utils.String.format(this.zoomText, Math.floor((this.api.asc_getZoom() +.005)*100)));
            }
        },

        onApiDisconnect: function() {
            this.statusbar.setMode('disconnect');
            this.isDisconnected = true;
        },

        onWorkbookLocked: function(locked) {
            this.statusbar.$btnAddTab.toggleClass('disabled', locked);
            return;

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

        onWorksheetLocked: function(index, locked) {
            var model = this.sheets.findWhere({index: index});
            if ( model && model.get('locked') != locked )
                model.set('locked', locked);
        },

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
            this.statusbar.btnAddWorksheet.on('click', _.bind(this.onAddWorksheetClick, this));

            Common.NotificationCenter.on('window:resize', _.bind(this.onWindowResize, this));
            // Common.NotificationCenter.on('cells:range',   _.bind(this.onRangeDialogMode, this));
        },

        onWindowResize: function(area) {
            // this.statusbar.onTabInvisible(undefined, this.statusbar.tabbar.checkInvisible(true));
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

            if (me.sheets.length == 1) {
                uiApp.alert(me.errorLastSheet);
            } else {
                uiApp.confirm(me.warnDeleteSheet, undefined, _.buffered(function() {
                    if ( !me.api.asc_deleteWorksheet() ) {
                        _.defer(function(){
                            uiApp.alert(me.errorRemoveSheet);
                        });
                    }
                }, 300));
            }
        },

        hideWorksheet: function(hide, index) {
            if ( hide ) {
                this.sheets.length == 1 ?
                    uiApp.alert(this.errorLastSheet) :
                    this.api['asc_hideWorksheet'](index);
            } else {
                this.api['asc_showWorksheet'](index);
                // this.loadTabColor(index);
            }
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

        onError: function(id, level, errData) {
            // if (id == Asc.c_oAscError.ID.LockedWorksheetRename)
            //     this.statusbar.update();
        },

        onTabClick: function(index, model) {
            var opened = $('.document-menu.modal-in').length;
            uiApp.closeModal('.document-menu.modal-in');

            var sdkindex = model.get('index');
            if ( sdkindex == this.api.asc_getActiveWorksheetIndex () ) {
                if ( !opened ) {
                    if ( this.isEdit && !this.isDisconnected ) {
                        this.api.asc_closeCellEditor();

                        this.statusbar.showTabContextMenu(this._getTabMenuItems(model), model);
                    }
                }
            } else {
                this.api.asc_showWorksheet( sdkindex );
                this.statusbar.setActiveTab(index);

                Common.NotificationCenter.trigger('sheet:active', sdkindex);
            }
        },

        onAddTab: function () {
            this.api.asc_closeCellEditor();
            this.api.asc_addWorksheet(this.createSheetName());
        },

        onTabMenu: function (view, event, model) {
            var me = this;

            switch (event) {
            case 'del': me.deleteWorksheet(); break;
            case 'hide': me.hideWorksheet(true, model.get('index')); break;
            case 'ins': me.api.asc_insertWorksheet(me.createSheetName()); break;
            case 'copy':
                var name = me.createCopyName(me.api.asc_getWorksheetName(me.api.asc_getActiveWorksheetIndex()));
                me.api.asc_copyWorksheet(model.get('index'), name);
                break;
            case 'unhide':
                var items = [];
                _.each(this.hiddensheets.models, function (item) {
                    items.push({
                        caption: item.get('name'),
                        event: 'reveal:' + item.get('index')
                    })
                });
                _.defer(function () {
                    me.statusbar.showTabContextMenu(items, model);
                });
                break;
            default:
                var _re = /reveal\:(\d+)/.exec(event);
                if ( _re && !!_re[1] ) {
                    me.hideWorksheet(false, parseInt(_re[1]));
                }
            }

        },

        _getTabMenuItems: function(model) {
            var wbLocked = this.api.asc_isWorkbookLocked();
            var shLocked   = this.api.asc_isWorksheetLockedOrDeleted(model.get('index'));

            var items = [{
                    caption: this.menuDuplicate,
                    event: 'copy',
                    locked: wbLocked || shLocked
                },{
                    caption: this.menuDelete,
                    event: 'del',
                    locked: wbLocked || shLocked
                },{
                    caption: this.menuHide,
                    event: 'hide',
                    locked: wbLocked || shLocked
                }];


            if ( !wbLocked && !shLocked && this.hiddensheets.length ) {
                items.push({
                    caption: this.menuUnhide,
                    event: 'unhide'
                });
            }

            return items;
        },

        menuDuplicate   : 'Duplicate',
        menuDelete      : 'Delete',
        menuHide        : 'Hide',
        menuUnhide      : 'Unhide',
        errorLastSheet  : 'Workbook must have at least one visible worksheet.',
        errorRemoveSheet: 'Can\'t delete the worksheet.',
        warnDeleteSheet : 'The worksheet maybe has data. Proceed operation?',
        strSheet        : 'Sheet'
    }, SSE.Controllers.Statusbar || {}));
});