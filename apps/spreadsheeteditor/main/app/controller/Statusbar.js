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
 *  Statusbar.js
 *
 *  Statusbar controller
 *
 *    Created on 27 March 2014
 *
 */

define([
    'core',
    'spreadsheeteditor/main/app/view/Statusbar'
], function () {
    'use strict';

    SSE.Controllers.Statusbar = Backbone.Controller.extend(_.extend({
        models: [],
        collections: [],
        views: [
            'Statusbar'
        ],

        initialize: function() {
            this.addListeners({
                'Statusbar': {
                    'show:tab': _.bind(this.showTab, this),
                    'show:hidden': _.bind(function (obj, index) {
                        this.hideWorksheet(false, index);
                    }, this),
                    'sheet:changename': _.bind(function(){
                        this.api.asc_closeCellEditor();
                        this.renameWorksheet();
                    },this),
                    'sheet:setcolor':       _.bind(this.setWorksheetColor, this),
                    'sheet:updateColors':   _.bind(this.updateTabsColors, this),
                    'sheet:move':           _.bind(this.moveWorksheet, this)
                },
                'ViewTab': {
                    'statusbar:setcompact': _.bind(this.onChangeViewMode, this)
                }
            });
        },

        events: function() {
            return {
                'click #status-btn-zoomdown': _.bind(this.zoomDocument,this,'down'),
                'click #status-btn-zoomup': _.bind(this.zoomDocument,this,'up'),
                'click .cnt-zoom': _.bind(this.onZoomShow, this)
            };
        },

        onLaunch: function() {
            this.statusbar = this.createView('Statusbar').render();
            this.statusbar.$el.css('z-index', 10);
            this.statusbar.labelZoom.css('min-width', 80);
            this.statusbar.labelZoom.text(Common.Utils.String.format(this.zoomText, 100));
            this.statusbar.zoomMenu.on('item:click', _.bind(this.menuZoomClick, this));

            this.bindViewEvents(this.statusbar, this.events);

            $('#id-tab-menu-new-color', this.statusbar.$el).on('click', _.bind(this.onNewBorderColor, this));

            this.statusbar.tabbar.on({
                'tab:dragstart': _.bind(function (dataTransfer, selectTabs) {
                    Common.Utils.isIE && (this.isDrop = false);
                    Common.UI.Menu.Manager.hideAll();
                    this.api.asc_closeCellEditor();
                    var arrTabs = [],
                        arrName = [],
                        me = this;
                    var wc = me.api.asc_getWorksheetsCount(), items = [], i = -1;
                    while (++i < wc) {
                        if (!this.api.asc_isWorksheetHidden(i)) {
                            items.push({
                                value: me.api.asc_getWorksheetName(i),
                                inindex: i
                            });
                        }
                    }
                    var arrSelectIndex = [];
                    selectTabs.forEach(function (item) {
                        arrSelectIndex.push(item.sheetindex);
                    });
                    items.forEach(function (item) {
                        if (arrSelectIndex.indexOf(item.inindex) !== -1) {
                            arrTabs.push(item.inindex);
                            arrName.push(item.value);
                        }
                    });
                    var stringSheet, arr = [];
                    stringSheet = this.api.asc_StartMoveSheet(_.clone(arrTabs));
                    arr.push({type: 'onlyoffice', value: stringSheet});
                    arr.push({type: 'indexes', value: arrTabs});
                    arr.push({type: 'names', value: arrName});
                    arr.push({type: 'key', value: Common.Utils.InternalSettings.get("sse-doc-info-key")});
                    var json = JSON.stringify(arr);
                    if (!Common.Utils.isIE) {
                        dataTransfer.setData('onlyoffice', json);
                    } else {
                        dataTransfer.setData('text', 'sheet');
                        this.dataTransfer = json;
                    }
                    this.dropTabs = selectTabs;
                }, this),
                'tab:drop': _.bind(function (dataTransfer, index, copy) {
                    if (this.isEditFormula || (Common.Utils.isIE && this.dataTransfer === undefined)) return;
                    Common.Utils.isIE && (this.isDrop = true);
                    var data = !Common.Utils.isIE ? dataTransfer.getData('onlyoffice') : this.dataTransfer;
                    if (data) {
                        var arrData = JSON.parse(data);
                        if (arrData) {
                            var key = _.findWhere(arrData, {type: 'key'}).value;
                            if (Common.Utils.InternalSettings.get("sse-doc-info-key") === key) {
                                this.statusbar.fireEvent('sheet:move', [_.findWhere(arrData, {type: 'indexes'}).value, !copy, true, _.isNumber(index) ? index : this.api.asc_getWorksheetsCount()]);
                                Common.NotificationCenter.trigger('tabs:dragend', this);
                            } else {
                                var arrNames = _.findWhere(arrData, {type: 'names'}).value;
                                var newNames = this.generateSheetNames(false, undefined, arrNames);
                                var index = _.isNumber(index) ? index : this.api.asc_getWorksheetsCount();
                                this.api.asc_EndMoveSheet(index, newNames, _.findWhere(arrData, {type: 'onlyoffice'}).value);
                            }
                        }
                    }
                }, this),
                'tab:dragend':  _.bind(function (cut) {
                    if (cut && !(Common.Utils.isIE && this.isDrop === false)) {
                        if (this.dropTabs.length > 0) {
                            var arr = [];
                            this.dropTabs.forEach(function (tab) {
                                arr.push(tab.sheetindex);
                            });
                            this.api.asc_deleteWorksheet(arr);
                        }
                    }
                    this.dropTabs = undefined;
                    if (Common.Utils.isIE) {
                        this.isDrop = undefined;
                        this.dataTransfer = undefined;
                    }
                    Common.NotificationCenter.trigger('tabs:dragend', this);
                }, this)
            });
        },

        setApi: function(api) {
            this.api = api;
            this.api.asc_registerCallback('asc_onZoomChanged',   _.bind(this.onZoomChange, this));
            this.api.asc_registerCallback('asc_onSelectionMathChanged',   _.bind(this.onApiMathChanged, this));
            this.api.asc_registerCallback('asc_onCoAuthoringDisconnect', _.bind(this.onApiDisconnect, this));
            Common.NotificationCenter.on('api:disconnect',               _.bind(this.onApiDisconnect, this));
            this.api.asc_registerCallback('asc_onUpdateTabColor', _.bind(this.onApiUpdateTabColor, this));
            this.api.asc_registerCallback('asc_onEditCell', _.bind(this.onApiEditCell, this));
            /** coauthoring begin **/
            this.api.asc_registerCallback('asc_onWorkbookLocked', _.bind(this.onWorkbookLocked, this));
            this.api.asc_registerCallback('asc_onWorksheetLocked', _.bind(this.onWorksheetLocked, this));
            this.api.asc_registerCallback('asc_onChangeProtectWorkbook',_.bind(this.onChangeProtectWorkbook, this));
            /** coauthoring end **/
            this.api.asc_registerCallback('asc_onError', _.bind(this.onError, this));
            this.api.asc_registerCallback('asc_onFilterInfo',   _.bind(this.onApiFilterInfo , this));
            this.api.asc_registerCallback('asc_onActiveSheetChanged', _.bind(this.onApiActiveSheetChanged, this));
            this.api.asc_registerCallback('asc_onRefreshNamedSheetViewList', _.bind(this.onRefreshNamedSheetViewList, this));
            this.api.asc_registerCallback('asc_generateNewSheetNames', _.bind(function (arrNames, callback) {
                callback(this.generateSheetNames(false, undefined, arrNames));
            }, this));

            this.statusbar.setApi(api);
        },

        zoomDocument: function(d,e) {
            if (!this.api) return;

            switch (d) {
                case 'up':
                    var f = Math.floor(this.api.asc_getZoom() * 10)/10;
                    f += .1;
                    !(f > 5.) && this.api.asc_setZoom(f);
                    break;
                case 'down':
                    f = Math.ceil(this.api.asc_getZoom() * 10)/10;
                    f -= .1;
                    !(f < .1) && this.api.asc_setZoom(f);
                    break;
            }
            Common.NotificationCenter.trigger('edit:complete', this.statusbar);
        },

        menuZoomClick: function(menu, item) {
            this.api && this.api.asc_setZoom(item.value/100);
            Common.NotificationCenter.trigger('edit:complete', this.statusbar);
        },

        /*
        *   api events
        * */

        onZoomChange: function(percent, type) {
            var pr = Math.floor((percent +.005)*100);
            this.statusbar.labelZoom.text(Common.Utils.String.format(this.zoomText, pr));
            Common.localStorage.setItem('sse-last-zoom', pr);
        },

        onApiDisconnect: function() {
            this.SetDisabled(true);
        },

        SetDisabled: function(state) {
            this.statusbar.setMode({isDisconnected: state});
            this.statusbar.update();
        },

        /** coauthoring begin **/
        onWorkbookLocked: function(locked) {
            this.statusbar.tabbar[locked?'addClass':'removeClass']('coauth-locked');
            this.statusbar.btnAddWorksheet.setDisabled(locked || this.api.isCellEdited || this.statusbar.rangeSelectionMode==Asc.c_oAscSelectionDialogType.Chart ||
                                                                                          this.statusbar.rangeSelectionMode==Asc.c_oAscSelectionDialogType.FormatTable||
                                                                                          this.statusbar.rangeSelectionMode==Asc.c_oAscSelectionDialogType.PrintTitles ||
                                                       this.api.asc_isProtectedWorkbook());
            var item, i = this.statusbar.tabbar.getCount();
            while (i-- > 0) {
                item = this.statusbar.tabbar.getAt(i);
                if (item.sheetindex >= 0) {
//                        if (locked) item.reorderable = false;
//                        else item.reorderable = !this.api.asc_isWorksheetLockedOrDeleted(item.sheetindex);
                } else {
                    item.disable(locked);
                    item.$el.children(':first-child').attr('draggable', locked?'false':'true');
                }
            }
        },

        onWorksheetLocked: function(index,locked) {
            var count = this.statusbar.tabbar.getCount(), tab;
            var wbprotected = this.api.asc_isProtectedWorkbook();
            for (var i = count; i-- > 0; ) {
                tab = this.statusbar.tabbar.getAt(i);
                if (index == tab.sheetindex) {
                    tab[locked?'addClass':'removeClass']('coauth-locked');
                    tab.isLockTheDrag = locked || wbprotected || (this.statusbar.rangeSelectionMode==Asc.c_oAscSelectionDialogType.FormatTable) || (this.statusbar.rangeSelectionMode==Asc.c_oAscSelectionDialogType.PrintTitles);
                    tab.$el.children(':first-child').attr('draggable', tab.isLockTheDrag?'false':'true');
                    break;
                }
            }
            var listItem =this.statusbar.sheetListMenu.items[index];
            if (listItem && listItem.$el && listItem.$el.children().first().data('hidden')) {
                listItem.setDisabled(locked);
            }
        },

        onChangeProtectWorkbook: function() {
            var wbprotected = this.api.asc_isProtectedWorkbook();
            this.statusbar.btnAddWorksheet.setDisabled(this.api.isCellEdited || this.api.asc_isWorkbookLocked() || wbprotected || this.statusbar.rangeSelectionMode!=Asc.c_oAscSelectionDialogType.None);
            var count = this.statusbar.tabbar.getCount(), tab;
            for (var i = count; i-- > 0; ) {
                tab = this.statusbar.tabbar.getAt(i);
                var islocked = tab.hasClass('coauth-locked');
                tab.isLockTheDrag = islocked || wbprotected || (this.statusbar.rangeSelectionMode==Asc.c_oAscSelectionDialogType.FormatTable) || (this.statusbar.rangeSelectionMode==Asc.c_oAscSelectionDialogType.PrintTitles);
                tab.$el.children(':first-child').attr('draggable', tab.isLockTheDrag?'false':'true');
            }
            this.statusbar.update();
        },

        /** coauthoring end **/

        onApiMathChanged: function(info) {
//            info.asc_getCountNumbers();
//            info.asc_getMin();
//            info.asc_getMax();

            this.statusbar.setMathInfo({
                count   : info.asc_getCount(),
                average : info.asc_getAverage(),
                min     : info.asc_getMin(),
                max     : info.asc_getMax(),
                sum     : info.asc_getSum()
            });
            this.statusbar.updateTabbarBorders();
        },

        onApiFilterInfo: function(countFilter, countRecords) {
            this.statusbar.setFilteredInfo(countFilter, countRecords);
            this.statusbar.updateTabbarBorders();
        },

        onApiEditCell: function(state) {
            var disableAdd = (state == Asc.c_oAscCellEditorState.editFormula),
                disable = (state != Asc.c_oAscCellEditorState.editEnd),
                mask = $('.statusbar-mask'),
                statusbar = this.statusbar;

            statusbar.isEditFormula = disableAdd;
            statusbar.tabbar && (statusbar.tabbar.isEditFormula = disableAdd);
            statusbar.btnZoomUp.setDisabled(disable);
            statusbar.btnZoomDown.setDisabled(disable);
            statusbar.labelZoom[disable?'addClass':'removeClass']('disabled');
            statusbar.btnAddWorksheet.setDisabled(disable || this.api.asc_isWorkbookLocked() || this.api.asc_isProtectedWorkbook() || statusbar.rangeSelectionMode!=Asc.c_oAscSelectionDialogType.None);

            statusbar.$el.find('#statusbar_bottom li span').attr('oo_editor_input', !disableAdd);

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
            if (!Common.UI.LayoutManager.isElementVisible('statusBar-actionStatus') || this.statusbar.mode.isEditOle) {
                this.statusbar.customizeStatusBarMenu.items[0].setVisible(false);
                this.statusbar.customizeStatusBarMenu.items[1].setVisible(false);
                this.statusbar.boxAction.addClass('hide');
            }

            Common.NotificationCenter.on('window:resize', _.bind(this.onWindowResize, this));
            Common.NotificationCenter.on('cells:range',   _.bind(this.onRangeDialogMode, this));
        },

        onWindowResize: function(area) {
            this.statusbar.updateVisibleItemsBoxMath();
            this.statusbar.updateTabbarBorders();
            this.statusbar.onTabInvisible(undefined, this.statusbar.tabbar.checkInvisible(true));
        },

        onRangeDialogMode: function (mode) {
            var islocked = this.statusbar.tabbar.hasClass('coauth-locked'),
                currentIdx = this.api.asc_getActiveWorksheetIndex();
            this.statusbar.btnAddWorksheet.setDisabled(islocked || this.api.isCellEdited || this.api.asc_isProtectedWorkbook() || mode!=Asc.c_oAscSelectionDialogType.None);
            this.statusbar.btnSheetList[mode==Asc.c_oAscSelectionDialogType.FormatTable || mode==Asc.c_oAscSelectionDialogType.PrintTitles ? 'addClass' : 'removeClass']('disabled');

            var item, i = this.statusbar.tabbar.getCount();
            var wbprotected = this.api.asc_isProtectedWorkbook();
            while (i-- > 0) {
                item = this.statusbar.tabbar.getAt(i);
                if (item.sheetindex !== currentIdx) {
                    item.disable(mode==Asc.c_oAscSelectionDialogType.FormatTable || mode==Asc.c_oAscSelectionDialogType.PrintTitles);
                }
                item.isLockTheDrag = (item.hasClass('coauth-locked') || wbprotected || (mode!=Asc.c_oAscSelectionDialogType.None));
            }
            this.statusbar.rangeSelectionMode = mode;
        },

        onTabMenu: function(obj, item, e) {
            var me = this;
            var selectTabs = this.statusbar.tabbar.selectTabs,
                arrIndex = [];
            selectTabs.forEach(function (item) {
                arrIndex.push(item.sheetindex);
            });
            switch (item.value) {
                case 'ins':
                    var arrNames = [];
                    for(var i = 0; i < arrIndex.length; i++) {
                        arrNames.push(me.createSheetName(arrNames));
                    }
                    setTimeout(function () {
                        me.api.asc_insertWorksheet(arrNames);
                     }, 1);
                    break;
                case 'del':
                    this.deleteWorksheet(arrIndex);
                    break;
                case 'ren':
                    this.renameWorksheet();
                    break;
                case 'move-copy':
                    this.moveWorksheet(arrIndex);
                    break;
                case 'hide':
                    setTimeout(function () {
                        me.hideWorksheet(true, arrIndex);
                    }, 1);
                    break;
                case 'protect':
                    this.protectWorksheet();
                    break;
            }
        },

        createSheetName: function(curArrNames) {
            var items = [], wc = this.api.asc_getWorksheetsCount();
            while (wc--) {
                items.push(this.api.asc_getWorksheetName(wc).toLowerCase());
            }

            var index = 0, name;
            while(true) {
                index++;
                name = this.strSheet + index;
                if (items.indexOf(name.toLowerCase()) < 0) break;
            }

            if (curArrNames && curArrNames.length > 0) {
                var arr = [];
                curArrNames.forEach(function (item) {
                    arr.push(item.toLowerCase());
                });
                while(arr.indexOf(name.toLowerCase()) !== -1 || items.indexOf(name.toLowerCase()) !== -1) {
                    index++;
                    name = this.strSheet + index;
                }
            }

            return name;
        },

        createCopyName: function(copy, orig, curNames, names) {
            var re = /^(.*)\((\d)\)$/.exec(orig);
            var first = re ? re[1] : orig + ' ';

            var index = 1, name = orig;
            if (copy) {
                index++;
                name = first + '(' + index + ')';
            }
            while(names.indexOf(name.toLowerCase()) !== -1) {
                index++;
                name = first + '(' + index + ')';
            }

            if (curNames && curNames.length > 0) {
                var arr = [];
                curNames.forEach(function (item) {
                    arr.push(item.toLowerCase());
                });
                while(arr.indexOf(name.toLowerCase()) !== -1) {
                    index++;
                    name = first + '(' + index + ')';
                }
            }

            return name;
        },

        generateSheetNames: function (copy, arrIndexes, arrNames) {
            var me = this,
                names = [];
            var wc = this.api.asc_getWorksheetsCount();
            while (wc--) {
                names.push(this.api.asc_getWorksheetName(wc).toLowerCase());
            }

            var newNames = [];
            if (arrIndexes) {
                arrIndexes.forEach(function (item) {
                    newNames.push(me.createCopyName(copy, me.api.asc_getWorksheetName(item), newNames, names));
                });
            } else if (arrNames) {
                arrNames.forEach(function (item) {
                    newNames.push(me.createCopyName(copy, item, newNames, names));
                });
            }
            return newNames;
        },

        deleteWorksheet: function(selectTabs) {
            var me = this;

            if (this.statusbar.tabbar.tabs.length == 1 || selectTabs.length === this.statusbar.tabbar.tabs.length) {
                Common.UI.warning({msg: this.errorLastSheet});
            } else {
                Common.UI.warning({
                    msg: this.warnDeleteSheet,
                    buttons: ['ok','cancel'],
                    callback: function(btn) {
                        if (btn == 'ok' && !me.api.asc_deleteWorksheet(selectTabs)) {
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
                (this.statusbar.tabbar.tabs.length == 1 || index.length === this.statusbar.tabbar.tabs.length) ?
                    Common.UI.warning({msg: this.errorLastSheet}) :
                    this.api['asc_hideWorksheet'](index);
            } else {
                this.api['asc_showWorksheet'](index);
                this.loadTabColor(index);
                var me = this;
                setTimeout(function(){
                    me.statusbar.tabMenu.hide();
                }, 1);
            }
        },

        renameWorksheet: function() {
            var me = this;
            var wc = me.api.asc_getWorksheetsCount(), items = null;
            if (wc > 0) {
                var sindex = me.api.asc_getActiveWorksheetIndex();
                if (me.api.asc_isWorksheetLockedOrDeleted(sindex)) {
                    return;
                }

                var value = Common.Utils.InternalSettings.get("sse-settings-coauthmode");
                if (!value) {
                    items = [];
                    while (wc--) {
                        if (sindex !== wc) {
                            items.push(me.api.asc_getWorksheetName(wc).toLowerCase());
                        }
                    }
                }

                var tab = me.statusbar.tabbar.tabs[me.statusbar.tabbar.getActive()];
                var top = me.statusbar.$el.position().top - 115,
                    left = tab.$el.offset().left;

                var current = me.api.asc_getWorksheetName(me.api.asc_getActiveWorksheetIndex());
                var win = (new SSE.Views.Statusbar.RenameDialog({
                    current: current,
                    names: items,
                    api: me.api,
                    handler: function (btn, s) {
                        if (btn == 'ok' && s != current) {
                            me.api.asc_renameWorksheet(s);
                        }
                        me.api.asc_enableKeyEvents(true);
                    }
                }));
                if (typeof win.options.width == "number") {
                    var bodywidth = $('body').width();
                    if (left+win.options.width > bodywidth)
                        left = bodywidth - win.options.width - 5;
                }
                win.show(left, top);
            }
        },

        moveWorksheet: function(selectArr, cut, silent, indTo) {
            var me = this;
            var wc = me.api.asc_getWorksheetsCount(), items = [], arrIndex = [], i = -1;
            while (++i < wc) {
                if (!this.api.asc_isWorksheetHidden(i)) {
                    items.push({
                        value: me.api.asc_getWorksheetName(i),
                        inindex: i
                    });
                }
            }
            if (!_.isUndefined(selectArr)) {
                items.forEach(function (item) {
                    if (selectArr.indexOf(item.inindex) !== -1) {
                        arrIndex.push(item.inindex);
                    }
                });
            }

            if (!_.isUndefined(silent)) {
                if (cut) {
                    me.api.asc_moveWorksheet(indTo, arrIndex);
                    me.api.asc_enableKeyEvents(true);
                } else {
                    var arrNames = me.generateSheetNames(!cut, arrIndex);
                    me.api.asc_copyWorksheet(indTo, arrNames, arrIndex);
                }
                return;
            }

            var btn,
                supportBooks = me.api.asc_isSupportCopySheetsBetweenBooks();
            me.copyDialog = new SSE.Views.Statusbar.CopyDialog({
                title   : me.statusbar.itemMoveOrCopy,
                sheets  : items,
                supportBooks: supportBooks,
                spreadsheetName: me.api.asc_getDocumentName(),
                isDesktopApp: me.statusbar.mode.isDesktopApp,
                handler : function(result, i, copy, workbook) {
                    btn = result;
                    if (btn == 'ok') {
                        var arrBooks,
                            arrNames;
                        if (workbook === 'new')
                            arrBooks = [];
                        else if (workbook !== 'current')
                            arrBooks = [workbook];
                        if (workbook !== 'current') {
                            arrNames = [];
                            arrIndex.forEach(function (item) {
                                arrNames.push(me.api.asc_getWorksheetName(item));
                            });
                        }
                        if (!copy) {
                            me.api.asc_moveWorksheet(i == -255 ? wc : i, arrIndex, arrNames, arrBooks);
                        } else {
                            if (!arrNames)
                                arrNames = me.generateSheetNames(copy, arrIndex);
                            me.api.asc_copyWorksheet(i == -255 ? wc : i, arrNames, arrIndex, arrBooks);
                        }
                    } else {
                        me.api.asc_cancelMoveCopyWorksheet();
                    }
                    me.api.asc_enableKeyEvents(true);
                }
            });
            me.copyDialog.on('close', function () {
                if (!btn) me.api.asc_cancelMoveCopyWorksheet();
                me.copyDialog = undefined;
            });
            me.copyDialog.show();

            var callback = function (workbooks) {
                if (workbooks) {
                    me.copyDialog.changeSpreadsheets(workbooks);
                }
            };
            supportBooks && me.api.asc_getOpeningDocumentsList(callback);
        },

        onAddWorksheetClick: function(o, index, opts) {
            if (this.api) {
                this.api.asc_closeCellEditor();
                this.api.asc_addWorksheet(this.createSheetName());

                Common.NotificationCenter.trigger('comments:updatefilter', ['doc', 'sheet' + this.api.asc_getActiveWorksheetId()], false);  //  hide popover
            }
            Common.NotificationCenter.trigger('edit:complete', this.statusbar);
        },

        showTab: function (sheetIndex) {
            if (this.api && this.api.asc_getActiveWorksheetIndex() !== sheetIndex) {
                this.api.asc_showWorksheet(sheetIndex);
                this.loadTabColor(sheetIndex);
            }
            var me = this;
            setTimeout(function(){
                me.statusbar.sheetListMenu.hide();
            }, 1);
        },

        selectTab: function (sheetindex) {
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

        // colors

        onApiUpdateTabColor: function (index) {
            this.loadTabColor(index);
        },

        setWorksheetColor: function (color) {
            var me = this;
            if (this.api) {
                var selectTabs = this.statusbar.tabbar.selectTabs,
                    arrIndex = [];
                selectTabs.forEach(function (item) {
                    arrIndex.push(item.sheetindex);
                });
                if (arrIndex) {
                    if ('transparent' === color) {
                        this.api.asc_setWorksheetTabColor(null, arrIndex);
                        selectTabs.forEach(function (tab) {
                            tab.$el.find('span').css('box-shadow', '');
                        });
                    } else {
                        var asc_clr = Common.Utils.ThemeColor.getRgbColor(color);
                        if (asc_clr) {
                            this.api.asc_setWorksheetTabColor(asc_clr, arrIndex);
                            selectTabs.forEach(function (tab) {
                                me.setTabLineColor(tab, asc_clr);
                            });
                        }
                    }
                }
            }
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

        updateTabsColors: function (updateCurrentColor) {
            var i = -1,
                tabind = -1,
                color = null,
                clr = null,
                ishidden = false,
                wc = this.api.asc_getWorksheetsCount(),
                sindex = this.api.asc_getActiveWorksheetIndex();

            if (!_.isUndefined(updateCurrentColor)) {
                var toolbarController = this.application.getController('Toolbar');
                if (toolbarController) {

                    this.statusbar.mnuTabColor.updateCustomColors();

                    color = this.api.asc_getWorksheetTabColor(sindex);
                    if (color) {
                        if (color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                            clr = {color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()), effectValue: color.get_value() };
                        } else {
                            clr = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
                        }
                    } else
                        clr = 'transparent';
                    Common.Utils.ThemeColor.selectPickerColorByEffect(clr, this.statusbar.mnuTabColor);
                }
            }

            i = -1;

            while (++i < wc) {
                ++tabind;

                ishidden = this.api.asc_isWorksheetHidden(i);
                if (ishidden) {
                    --tabind;
                }

                if (!ishidden) {
                    this.setTabLineColor(this.statusbar.tabbar.getAt(tabind), this.api.asc_getWorksheetTabColor(i));
                }
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
                    this.statusbar.sheetListMenu.items[tab.sheetindex].$el.find('.color').css('background-color', color);

                    if (!tab.isActive()) {
                        color = '0px 4px 0 ' + Common.Utils.RGBColor(color).toRGBA(1) + ' inset';
                    } else {
                        color = '0px 4px 0 ' + color + ' inset';
                    }

                    tab.$el.find('span').css('box-shadow', color);
                } else {
                    tab.$el.find('span').css('box-shadow', '');
                    this.statusbar.sheetListMenu.items[tab.sheetindex].$el.find('.color').css('background-color', '');
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

        onApiActiveSheetChanged: function (index) {
            this.statusbar.tabMenu.hide();
            this.statusbar.sheetListMenu.hide();
            if (this.statusbar.sheetListMenu.items[index]) {
                this.statusbar.sheetListMenu.clearAll();
                this.statusbar.sheetListMenu.items[index].setChecked(true);
            }
            if (this._sheetViewTip && this._sheetViewTip.isVisible() && this.api.asc_getActiveNamedSheetView && !this.api.asc_getActiveNamedSheetView(index)) { // hide tip when sheet in the default mode
                this._sheetViewTip.hide();
            }
        },

        onRefreshNamedSheetViewList: function() {
            var views = this.api.asc_getNamedSheetViews(),
                active = false,
                name="",
                me = this;
            for (var i=0; i<views.length; i++) {
                if (views[i].asc_getIsActive()) {
                    active = true;
                    name = views[i].asc_getName();
                    break;
                }
            }
            var tab = this.statusbar.tabbar.getAt(this.statusbar.tabbar.getActive());
            if (tab) {
                tab.changeIconState(active, name);
            }

            if (active && !Common.localStorage.getBool("sse-hide-sheet-view-tip") && !Common.Utils.InternalSettings.get("sse-hide-sheet-view-tip")) {
                if (!this._sheetViewTip) {
                    this._sheetViewTip = new Common.UI.SynchronizeTip({
                        target      : $('#editor_sdk'),
                        extCls      : 'no-arrow',
                        text        : this.textSheetViewTipFilters,
                        placement   : 'target'
                    });
                    this._sheetViewTip.on({
                        'dontshowclick': function() {
                            Common.localStorage.setBool("sse-hide-sheet-view-tip", true);
                            Common.Utils.InternalSettings.set("sse-hide-sheet-view-tip", true);
                            this.close();
                            me._sheetViewTip = undefined;
                        },
                        'closeclick': function() {
                            Common.Utils.InternalSettings.set("sse-hide-sheet-view-tip", true);
                            this.close();
                            me._sheetViewTip = undefined;
                        }
                    });
                }
                if (!this._sheetViewTip.isVisible())
                    this._sheetViewTip.show();
            } else if (!active && this._sheetViewTip && this._sheetViewTip.isVisible())
                this._sheetViewTip.hide();
        },

        onChangeViewMode: function(item, compact, suppressEvent) {
            this.statusbar.fireEvent('view:compact', [this.statusbar, compact]);
            !suppressEvent && Common.localStorage.setBool('sse-compact-statusbar', compact);
            Common.NotificationCenter.trigger('layout:changed', 'status');
            this.statusbar.onChangeCompact(compact);

            Common.NotificationCenter.trigger('edit:complete', this.statusbar);
        },

        setStatusCaption: function(text, force, delay, callback) {
            if (this.timerCaption && ( ((new Date()) < this.timerCaption) || text.length==0 ) && !force )
                return;

            this.timerCaption = undefined;
            if (text.length) {
                this.statusbar.showStatusMessage(text, callback);
                if (delay>0)
                    this.timerCaption = (new Date()).getTime() + delay;
            } else
                this.statusbar.clearStatusMessage();
        },

        protectWorksheet: function() {
            Common.NotificationCenter.trigger('protect:sheet', !this.api.asc_isProtectedSheet());
        },

        getIsDragDrop: function () {
            var isDragDrop = this.statusbar.tabbar.isDragDrop;
            this.statusbar.tabbar.isDragDrop = false;
            return isDragDrop;
        },

        showDisconnectTip: function () {
            var me = this;
            if (!this.disconnectTip) {
                var target = this.statusbar.getStatusLabel();
                target = target.is(':visible') ? target.parent() : this.statusbar.isVisible() ? this.statusbar.$el : $(document.body);
                this.disconnectTip = new Common.UI.SynchronizeTip({
                    target  : target,
                    text    : this.textDisconnect,
                    placement: 'top',
                    position: this.statusbar.isVisible() ? undefined : {bottom: 0},
                    showLink: false,
                    style: 'max-width: 310px;'
                });
                this.disconnectTip.on({
                    'closeclick': function() {
                        me.disconnectTip.hide();
                        me.disconnectTip = null;
                    }
                });
            }
            this.disconnectTip.show();
        },

        hideDisconnectTip: function() {
            this.disconnectTip && this.disconnectTip.hide();
            this.disconnectTip = null;
        },

        getSelectTabs: function () {
            var selectTabs = this.statusbar.tabbar.selectTabs,
                tabIndArr = [];
            selectTabs.forEach(function (item) {
                tabIndArr.push(item.sheetindex);
            });
            return tabIndArr;
        },

        zoomText        : 'Zoom {0}%',
        errorLastSheet  : 'Workbook must have at least one visible worksheet.',
        errorRemoveSheet: 'Can\'t delete the worksheet.',
        warnDeleteSheet : 'The worksheet maybe has data. Proceed operation?',
        strSheet        : 'Sheet',
        textSheetViewTip: 'You are in Sheet View mode. Filters and sorting are visible only to you and those who are still in this view.',
        textSheetViewTipFilters: 'You are in Sheet View mode. Filters are visible only to you and those who are still in this view.',
        textDisconnect: '<b>Connection is lost</b><br>Trying to connect. Please check connection settings.'
    }, SSE.Controllers.Statusbar || {}));
});