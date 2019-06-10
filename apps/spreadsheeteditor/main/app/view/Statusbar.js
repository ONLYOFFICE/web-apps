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
 *  StatusBar View
 *
 *  Created by Maxim Kadushkin on 27 March 2014
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!spreadsheeteditor/main/app/template/StatusBar.template',
    'tip',
    'common/main/lib/component/TabBar',
    'common/main/lib/component/Menu',
    'common/main/lib/component/Window',
    'common/main/lib/component/ThemeColorPalette'
],
    function(template){
        'use strict';

        if (SSE.Views.Statusbar) {
            var RenameDialog = SSE.Views.Statusbar.RenameDialog;
            var CopyDialog = SSE.Views.Statusbar.CopyDialog;
        }

        SSE.Views.Statusbar = Common.UI.BaseView.extend(_.extend({
            el: '#statusbar',
            template: _.template(template),

            events: function() {
                return {
                    'click #status-btn-tabfirst': _.bind(this.onBtnTabScroll, this, 'first'),
                    'click #status-btn-tabback': _.bind(this.onBtnTabScroll, this, 'backward'),
                    'click #status-btn-tabnext': _.bind(this.onBtnTabScroll, this, 'forward'),
                    'click #status-btn-tablast': _.bind(this.onBtnTabScroll, this, 'last')
                };
            },

            api: undefined,

            initialize: function (options) {
                _.extend(this, options);
            },

            render: function () {
                var me = this;
                $(this.el).html(this.template({
                    scope: this
                }));

                this.editMode = false;

                this.btnZoomDown = new Common.UI.Button({
                    el: $('#status-btn-zoomdown',this.el),
                    hint: this.tipZoomOut+' (Ctrl+-)',
                    hintAnchor: 'top'
                });

                this.btnZoomUp = new Common.UI.Button({
                    el: $('#status-btn-zoomup',this.el),
                    hint: this.tipZoomIn+' (Ctrl++)',
                    hintAnchor: 'top-right'
                });

                this.btnScrollFirst = new Common.UI.Button({
                    el: $('#status-btn-tabfirst',this.el),
                    hint: this.tipFirst,
                    disabled: true,
                    hintAnchor: 'top'
                });

                this.btnScrollBack = new Common.UI.Button({
                    el: $('#status-btn-tabback',this.el),
                    hint: this.tipPrev,
                    disabled: true,
                    hintAnchor: 'top'
                });

                this.btnScrollNext = new Common.UI.Button({
                    el: $('#status-btn-tabnext',this.el),
                    hint: this.tipNext,
                    disabled: true,
                    hintAnchor: 'top'
                });

                this.btnScrollLast = new Common.UI.Button({
                    el: $('#status-btn-tablast',this.el),
                    hint: this.tipLast,
                    disabled: true,
                    hintAnchor: 'top'
                });

                this.btnAddWorksheet = new Common.UI.Button({
                    el: $('#status-btn-addtab',this.el),
                    hint: this.tipAddTab,
                    disabled: true,
                    hintAnchor: 'top'
                });

                this.cntZoom = new Common.UI.Button({
                    el: $('.cnt-zoom',this.el),
                    hint: this.tipZoomFactor,
                    hintAnchor: 'top'
                });
                this.cntZoom.cmpEl.on({
                    'show.bs.dropdown': function () {
                        _.defer(function(){
                            me.cntZoom.cmpEl.find('ul').focus();
                        }, 100);
                    },
                    'hide.bs.dropdown': function () {
                        _.defer(function(){
                            me.api.asc_enableKeyEvents(true);
                        }, 100);
                    }
                });

                this.zoomMenu = new Common.UI.Menu({
                    style: 'margin-top:-5px;',
                    menuAlign: 'bl-tl',
                    items: [
                        { caption: "50%", value: 50 },
                        { caption: "75%", value: 75 },
                        { caption: "100%", value: 100 },
                        { caption: "125%", value: 125 },
                        { caption: "150%", value: 150 },
                        { caption: "175%", value: 175 },
                        { caption: "200%", value: 200 }
                    ]
                });
                this.zoomMenu.render($('.cnt-zoom',this.el));
                this.zoomMenu.cmpEl.attr({tabindex: -1});

                this.labelZoom = $('#status-label-zoom',this.$el);

                this.tabBarBox = $('#status-sheets-bar-box', this.el);
                this.tabbar = new Common.UI.TabBar({
                    el: '#status-sheets-bar',
                    placement: 'bottom',
                    draggable: false
                }).render();

                this.tabbar.on({
                    'tab:invisible'     : _.bind(this.onTabInvisible, this),
                    'tab:changed'       : _.bind(this.onSheetChanged, this),
                    //'tab:manual'        : _.bind(this.onAddTabClick, this),
                    'tab:contextmenu'   : _.bind(this.onTabMenu, this),
                    'tab:dblclick'      : _.bind(function () {
                        if (me.editMode && (me.rangeSelectionMode !== Asc.c_oAscSelectionDialogType.Chart) &&
                                           (me.rangeSelectionMode !== Asc.c_oAscSelectionDialogType.FormatTable)) {
                            me.fireEvent('sheet:changename');
                        }
                    }, this),
                    'tab:move'          : _.bind(function (tabIndex, index) {
                        me.tabBarScroll = {scrollLeft: me.tabbar.scrollX};

                        if (_.isUndefined(index) || tabIndex === index) {
                            return;
                        }

                        if (tabIndex < index) {
                            ++index;
                        }

                        me.fireEvent('sheet:move', [false, true, tabIndex, index]);

                    }, this)
                });

                var menuHiddenItems = new Common.UI.Menu({
                    maxHeight: 260,
                    menuAlign: 'tl-tr'
                }).on('render:after', function(mnu) {
                    this.scroller = new Common.UI.Scroller({
                        el: $(this.el).find('.dropdown-menu '),
                        useKeyboard: this.enableKeyEvents && !this.handleSelect,
                        minScrollbarLength  : 40,
                        alwaysVisibleY: true
                    });
                }).on('show:after', function () {
                    this.scroller.update({alwaysVisibleY: true});
                });
                menuHiddenItems.on('item:click', function(obj,item,e) {
                    me.fireEvent('show:hidden', [me, item.value]);
                });

                var menuColorItems = new Common.UI.Menu({
                    menuAlign: 'tl-tr',
                    cls: 'color-tab',
                    items: [
                        { template: _.template('<div id="id-tab-menu-color" style="width: 169px; height: 220px; margin: 10px;"></div>') },
                        { template: _.template('<a id="id-tab-menu-new-color" style="padding-left:12px;">' + me.textNewColor + '</a>') }
                    ]
                });

                function dummyCmp() {
                    return {
                        isDummy : true,
                        on      : function() {}
                    }
                }

                me.mnuTabColor = dummyCmp();
                this.tabMenu = new Common.UI.Menu({
                    menuAlign: 'bl-tl',
                    items: [
                        {caption: this.itemInsert,  value: 'ins'},
                        {caption: this.itemDelete,  value: 'del'},
                        {caption: this.itemRename,  value: 'ren'},
                        {caption: this.itemCopy,    value: 'copy'},
                        {caption: this.itemMove,    value: 'move'},
                        {caption: this.itemHide,    value: 'hide'},
                        {
                            caption: this.itemHidden,
                            menu: menuHiddenItems
                        },
                        {
                            caption: this.itemTabColor,
                            menu: menuColorItems
                        }
                    ]
                }).on('render:after', function(btn) {
                        var colorVal = $('<div class="btn-color-value-line"></div>');
                        $('button:first-child', btn.cmpEl).append(colorVal);
                        colorVal.css('background-color', btn.currentColor || 'transparent');

                        me.mnuTabColor = new Common.UI.ThemeColorPalette({
                            el: $('#id-tab-menu-color'),
                            transparent: true
                        });

                        me.mnuTabColor.on('select', function(picker, color) {
                            me.fireEvent('sheet:setcolor', [color]);
                        });
                    });

                this.tabbar.$el.append('<div class="dropdown-toggle" data-toggle="dropdown" style="width:0; height:0;"/>');
                this.tabMenu.render(this.tabbar.$el);
                this.tabMenu.cmpEl.attr({tabindex: -1});
                this.tabMenu.on('show:after', _.bind(this.onTabMenuAfterShow, this));
                this.tabMenu.on('hide:after', _.bind(this.onTabMenuAfterHide, this));
                this.tabMenu.on('item:click', _.bind(this.onTabMenuClick, this));

                this.boxMath = $('#status-math-box', this.el);
                this.labelSum = $('#status-math-sum', this.boxMath);
                this.labelCount = $('#status-math-count', this.boxMath);
                this.labelAverage = $('#status-math-average', this.boxMath);
                this.labelMin = $('#status-math-min', this.boxMath);
                this.labelMax = $('#status-math-max', this.boxMath);
                this.boxMath.hide();

                this.boxFiltered = $('#status-filtered-box', this.el);
                this.labelFiltered = $('#status-filtered-records', this.boxFiltered);
                this.boxFiltered.hide();

                this.boxZoom = $('#status-zoom-box', this.el);
                this.boxZoom.find('.separator').css('border-left-color','transparent');

                return this;
            },

            setApi: function(api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onSheetsChanged', _.bind(this.update, this));
                return this;
            },

            setMode: function(mode) {
                this.mode = _.extend({}, this.mode, mode);
//                this.$el.find('.el-edit')[mode.isEdit?'show':'hide']();
                this.btnAddWorksheet.setVisible(this.mode.isEdit);
                this.btnAddWorksheet.setDisabled(this.mode.isDisconnected);
                this.updateTabbarBorders();
            },

            setVisible: function(visible) {
                visible ? this.show(): this.hide();
            },

            update: function() {
                var me = this;

                this.tabbar.empty(true);
                this.tabMenu.items[6].menu.removeAll();
                this.tabMenu.items[6].hide();
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
                    Common.NotificationCenter.trigger('comments:updatefilter', ['doc', 'sheet' + me.api.asc_getActiveWorksheetId()], false);
                }
            },

            setMathInfo: function(info) {
                if (info.count>1) {
                    if (!this.boxMath.is(':visible')) this.boxMath.show();
                    this.labelCount.text(this.textCount + ': ' + info.count);
                    this.labelMin.text((info.min && info.min.length) ? (this.textMin + ': ' + info.min) : '');
                    this.labelMax.text((info.max && info.max.length) ? (this.textMax + ': ' + info.max) : '');
                    this.labelSum.text((info.sum && info.sum.length) ? (this.textSum + ': ' + info.sum) : '');
                    this.labelAverage.text((info.average && info.average.length) ? (this.textAverage + ': ' + info.average) : '');
                } else {
                    if (this.boxMath.is(':visible')) this.boxMath.hide();
                }

                var me = this;
                _.delay(function(){
                    me.onTabInvisible(undefined, me.tabbar.checkInvisible(true));
                },30);
            },

            setFilteredInfo: function(countFilter, countRecords) {
                if (countFilter>0 && countRecords>0) {//filter is applied
                    if (!this.boxFiltered.is(':visible')) this.boxFiltered.show();
                    this.labelFiltered.text(Common.Utils.String.format(this.filteredRecordsText, countFilter, countRecords));
                } else if (countFilter) {// filter mode
                    if (!this.boxFiltered.is(':visible')) this.boxFiltered.show();
                    this.labelFiltered.text(this.filteredText);
                } else if (countFilter !== undefined && countFilter !== null){
                    if (this.boxFiltered.is(':visible')) this.boxFiltered.hide();
                } else {
                    var filterInfo = this.api.asc_getCellInfo().asc_getAutoFilterInfo(),
                        need_disable =  !filterInfo || (filterInfo.asc_getIsApplyAutoFilter()!==true);
                    this.setFilteredInfo(!need_disable);
                }

                var me = this;
                _.delay(function(){
                    me.onTabInvisible(undefined, me.tabbar.checkInvisible(true));
                },30);
            },

            onSheetChanged: function(o, index, tab) {
                this.api.asc_showWorksheet(tab.sheetindex);

                if (this.hasTabInvisible && !this.tabbar.isTabVisible(index)) {
                    this.tabbar.setTabVisible(index);
                }

                this.fireEvent('sheet:changed', [this, tab.sheetindex]);
                this.fireEvent('sheet:updateColors', [true]);

                // Common.NotificationCenter.trigger('comments:updatefilter', ['doc', 'sheet' + this.api.asc_getActiveWorksheetId()], false); //  hide popover
            },

            onTabMenu: function (o, index, tab) {
                if (this.mode.isEdit && !this.isEditFormula && (this.rangeSelectionMode !== Asc.c_oAscSelectionDialogType.Chart) &&
                                                               (this.rangeSelectionMode !== Asc.c_oAscSelectionDialogType.FormatTable) &&
                    !this.mode.isDisconnected ) {
                    if (tab && tab.sheetindex >= 0) {
                        var rect = tab.$el.get(0).getBoundingClientRect(),
                            childPos = tab.$el.offset(),
                            parentPos = tab.$el.parent().offset();

                        if (!tab.isActive()) this.tabbar.setActive(tab);

                        var issheetlocked   = this.api.asc_isWorksheetLockedOrDeleted(tab.sheetindex),
                            isdoclocked     = this.api.asc_isWorkbookLocked();

                        this.tabMenu.items[0].setDisabled(isdoclocked);
                        this.tabMenu.items[1].setDisabled(issheetlocked);
                        this.tabMenu.items[2].setDisabled(issheetlocked);
                        this.tabMenu.items[3].setDisabled(issheetlocked);
                        this.tabMenu.items[4].setDisabled(issheetlocked);
                        this.tabMenu.items[5].setDisabled(issheetlocked);
                        this.tabMenu.items[6].setDisabled(isdoclocked);
                        this.tabMenu.items[7].setDisabled(issheetlocked);

                        this.api.asc_closeCellEditor();
                        this.api.asc_enableKeyEvents(false);

                        this.tabMenu.atposition = (function () {
                            return {
                                top : rect.top,
                                left: rect.left - parentPos.left - 2
                            };
                        })();

                        this.tabMenu.hide();
                        this.tabMenu.show();
                        var menu = this.tabMenu;
                        _.defer(function(){
                            menu.cmpEl.focus();
                        }, 10);
                    }
                }
            },

            onTabMenuAfterShow: function (obj) {
                if (obj.atposition) {
                    obj.setOffset(obj.atposition.left);
                }

                this.enableKeyEvents = true;
            },

            onTabMenuAfterHide: function () {
                if (!_.isUndefined(this.enableKeyEvents)) {
                    if (this.api) {
                        this.api.asc_enableKeyEvents(this.enableKeyEvents);
                    }

                    this.enableKeyEvents = undefined;
                }
            },

            onTabMenuClick: function (o, item) {
                if (item && this.api) {
                    this.enableKeyEvents = (item.value === 'ins' || item.value === 'hide');
                }
            },

            onTabInvisible: function(obj, opts) {
                if (this.btnScrollFirst.isDisabled() !== (!opts.first)) {
                    this.btnScrollFirst.setDisabled(!opts.first);
                    this.btnScrollBack.setDisabled(!opts.first);
                }
                if (this.btnScrollNext.isDisabled() !== (!opts.last)) {
                    this.btnScrollNext.setDisabled(!opts.last);
                    this.btnScrollLast.setDisabled(!opts.last);
                }
                this.hasTabInvisible = opts.first || opts.last;
            },

            onBtnTabScroll: function(action, e) {
                this.tabbar.setTabVisible(action);
            },

            updateTabbarBorders: function() {
                var right = parseInt(this.boxZoom.css('width')), visible = false;
                if (this.boxMath.is(':visible')) {
                    right   += parseInt(this.boxMath.css('width'));
                    visible = true;
                }

                if (this.boxFiltered.is(':visible')) {
                    right   += parseInt(this.boxFiltered.css('width'));
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
            },

            tipZoomIn           : 'Zoom In',
            tipZoomOut          : 'Zoom Out',
            tipZoomFactor       : 'Magnification',
            tipFirst            : 'First Sheet',
            tipLast             : 'Last Sheet',
            tipPrev             : 'Previous Sheet',
            tipNext             : 'Next Sheet',
            tipAddTab           : 'Add Worksheet',
            itemInsert          : 'Insert',
            itemDelete          : 'Delete',
            itemRename          : 'Rename',
            itemCopy            : 'Copy',
            itemMove            : 'Move',
            itemHide            : 'Hide',
            itemHidden          : 'Hidden',
            itemTabColor        : 'Tab Color',
            textNoColor         : 'No Color',
            textNewColor        : 'Add New Custom Color',
            zoomText            : 'Zoom {0}%',
            textSum             : 'SUM',
            textCount           : 'COUNT',
            textAverage         : 'AVERAGE',
            textMin             : 'MIN',
            textMax             : 'MAX',
            filteredRecordsText : '{0} of {1} records filtered',
            filteredText        : 'Filter mode'
        }, SSE.Views.Statusbar || {}));

        SSE.Views.Statusbar.RenameDialog = Common.UI.Window.extend(_.extend({
            options: {
                header: false,
                width: 280,
                cls: 'modal-dlg'
            },

            template:   '<div class="box">' +
                            '<div class="input-row">' +
                                '<label><%= label %></label>' +
                            '</div>' +
                            '<div class="input-row" id="txt-sheet-name" />' +
                        '</div>' +
                        '<div class="footer right">' +
                            '<button class="btn normal dlg-btn primary" result="ok" style="margin-right: 10px;"><%= btns.ok %></button>'+
                            '<button class="btn normal dlg-btn" result="cancel"><%= btns.cancel %></button>'+
                        '</div>',

            initialize : function(options) {
                _.extend(this.options, options || {}, {
                    label: this.labelSheetName,
                    btns: {ok: this.okButtonText, cancel: this.cancelButtonText}
                });
                this.options.tpl = _.template(this.template)(this.options);

                Common.UI.Window.prototype.initialize.call(this, this.options);
            },

            render: function() {
                Common.UI.Window.prototype.render.call(this);

                var $window = this.getChild();
                $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

                this.txtName = new Common.UI.InputField({
                    el: $window.find('#txt-sheet-name'),
                    style: 'width:100%;',
                    value: Common.Utils.String.htmlEncode(this.options.current),
                    allowBlank: false,
                    maxLength: 31,
                    validation: _.bind(this.nameValidator, this)
                });
            },

            show: function(x,y) {
                Common.UI.Window.prototype.show.apply(this, arguments);
                var edit = this.txtName.$el.find('input');
                _.delay(function(me){
                    edit.focus();
                    edit.select();
                }, 100, this);
            },

            onBtnClick: function(event) {
                this.doClose(event.currentTarget.attributes['result'].value);
            },

            doClose: function(res) {
                if (res == 'ok') {
                    if (this.txtName.checkValidate() !== true) {
                        _.delay(function(me){
                            me.txtName.focus();
                        }, 100, this);
                        return;
                    }
                }

                if (this.options.handler) {
                    this.options.handler.call(this, res, this.txtName.getValue());
                }

                this.close();
            },

            onPrimary: function(e) {
                this.doClose('ok');
                return false;
            },

            nameValidator: function(value) {
                var items = this.options.names;
                if (!items && this.options.api) {
                    var api = this.options.api,
                        sindex = api.asc_getActiveWorksheetIndex(),
                        wc = api.asc_getWorksheetsCount();
                    items = [];
                    while (wc--) {
                        if (sindex !== wc) {
                            items.push(api.asc_getWorksheetName(wc).toLowerCase());
                        }
                    }
                }
                if (items) {
                    var testval = value.toLowerCase();
                    for (var i = items.length - 1; i >= 0; --i) {
                        if (items[i] === testval) {
                            return this.errNameExists;
                        }
                    }
                }

                if (value.length > 2 && value[0]=='"' && value[value.length-1]=='"') return true;
                if (!/[:\\\/\*\?\[\]\']/.test(value)) return true;

                return this.errNameWrongChar;
            },

            errNameExists   : 'Worksheet with such name already exist.',
            errNameWrongChar: 'A sheet name cannot contains characters: \\, \/, *, ?, [, ], :',
            labelSheetName  : 'Sheet Name'
        }, RenameDialog||{}));

        SSE.Views.Statusbar.CopyDialog = Common.UI.Window.extend(_.extend({
            options: {
                width: 270,
                height: 300,
                cls: 'modal-dlg'
            },

            template:   '<div class="box">' +
                            '<div class="input-row">' +
                                '<label><%= label %></label>' +
                            '</div>' +
                            '<div id="status-list-names" style="height: 170px;"/>' +
                        '</div>' +
                        '<div class="footer center">' +
                            '<button class="btn normal dlg-btn primary" result="ok" style="margin-right: 10px;"><%= btns.ok %></button>'+
                            '<button class="btn normal dlg-btn" result="cancel"><%= btns.cancel %></button>'+
                        '</div>',

            initialize : function(options) {
                _.extend(this.options, options || {}, {
                    label: options.ismove ? this.textMoveBefore : this.textCopyBefore,
                    btns: {ok: this.okButtonText, cancel: this.cancelButtonText}
                });
                this.options.tpl = _.template(this.template)(this.options);

                Common.UI.Window.prototype.initialize.call(this, this.options);
            },

            render: function() {
                Common.UI.Window.prototype.render.call(this);

                var $window = this.getChild();
                $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

                var pages = [];
                this.options.names.forEach(function(item){
                    pages.push(new Common.UI.DataViewModel(item));
                }, this);

                if (pages.length) {
                    pages.push(new Common.UI.DataViewModel({
                        value       : this.options.ismove ? this.itemMoveToEnd : this.itemCopyToEnd,
                        inindex     : -255
                    }));
                }

                this.listNames = new Common.UI.ListView({
                    el: $('#status-list-names', $window),
                    store: new Common.UI.DataViewStore(pages),
                    itemTemplate: _.template('<div id="<%= id %>" class="list-item" style="pointer-events:none;"><%= Common.Utils.String.htmlEncode(value) %></div>')
                });

                this.listNames.selectByIndex(0);
                this.listNames.on('entervalue', _.bind(this.onPrimary, this));
                this.listNames.on('item:dblclick', _.bind(this.onPrimary, this));

                this.mask = $('.modals-mask');
                this.mask.on('mousedown',_.bind(this.onUpdateFocus, this));
            },

            show: function(x,y) {
                Common.UI.Window.prototype.show.apply(this, arguments);

                _.delay(function(me){
                    me.listNames.$el.find('.listview').focus();
                }, 100, this);
            },

            hide: function () {
                Common.UI.Window.prototype.hide.apply(this, arguments);

                this.mask.off('mousedown',_.bind(this.onUpdateFocus, this));
            },

            onBtnClick: function(event) {
                var active = this.listNames.getSelectedRec();

                if (this.options.handler) {
                    this.options.handler.call(this,
                        event.currentTarget.attributes['result'].value, active[0].get('inindex'));
                }

                this.close();
            },

            onPrimary: function() {
                if (this.options.handler) {
                    this.options.handler.call(this, 'ok', this.listNames.getSelectedRec()[0].get('inindex'));
                }

                this.close();
            },

            onUpdateFocus: function () {
                _.delay(function(me){
                    me.listNames.$el.find('.listview').focus();
                }, 100, this);
            },

            itemCopyToEnd   : '(Copy to end)',
            itemMoveToEnd   : '(Move to end)',
            textCopyBefore  : 'Copy before sheet',
            textMoveBefore  : 'Move before sheet'
        }, CopyDialog||{}));

    }
);