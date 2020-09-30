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
 *  FormulaTab.js
 *
 *  Created by Julia Radzhabova on 14.06.2019
 *  Copyright (c) 2019 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Layout'
], function () {
    'use strict';

    SSE.Views.FormulaTab = Common.UI.BaseView.extend(_.extend((function(){
        function setEvents() {
            var me = this;
            me.btnAutosum.on('click', function(){
                me.fireEvent('function:apply', [{name: me.api.asc_getFormulaLocaleName('SUM'), origin: 'SUM'}, true]);
            });
            me.btnAutosum.menu.on('item:click', function (menu, item, e) {
                me.fireEvent('function:apply', [{name: item.caption, origin: item.value}, true]);
            });
            me.btnFormula.on('click', function(){
                me.fireEvent('function:apply', [{name: 'more', origin: 'more'}]);
            });
            me.btnCalculate.on('click', function () {
                me.fireEvent('function:calculate', [{type: Asc.c_oAscCalculateType.All}]);
            });
            me.btnCalculate.menu.on('item:click', function (menu, item, e) {
                me.fireEvent('function:calculate', [{type: item.value}]);
            });
            me.btnNamedRange.menu.on('show:after', function (menu) {
                me.fireEvent('function:namedrange-open', [menu]);
            });
            me.btnNamedRange.menu.on('item:click', function (menu, item, e) {
                me.fireEvent('function:namedrange', [menu, item, e]);
            });
        }
        return {
            options: {},

            initialize: function (options) {
                Common.UI.BaseView.prototype.initialize.call(this);
                this.toolbar = options.toolbar;
                this.formulasGroups = options.formulasGroups;

                this.lockedControls = [];
                this.formulaControls = [];

                var me = this,
                    $host = me.toolbar.$el,
                    _set = SSE.enumLock;

                var formulaDialog = SSE.getController('FormulaDialog');

                this.btnFinancial = new Common.UI.Button({
                    parentEl: $host.find('#slot-btn-financial'),
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-finance',
                    caption: formulaDialog.sCategoryFinancial,
                    hint: formulaDialog.sCategoryFinancial,
                    menu: true,
                    split: false,
                    disabled: true,
                    lock: [_set.editText, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.selSlicer, _set.selRangeEdit, _set.lostConnect, _set.coAuth, _set.noSubitems]
                });
                this.lockedControls.push(this.btnFinancial);
                this.formulaControls.push(this.btnFinancial);

                this.btnLogical = new Common.UI.Button({
                    parentEl: $host.find('#slot-btn-logical'),
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-logic',
                    caption: formulaDialog.sCategoryLogical,
                    hint: formulaDialog.sCategoryLogical,
                    menu: true,
                    split: false,
                    disabled: true,
                    lock: [_set.editText, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.selSlicer, _set.selRangeEdit, _set.lostConnect, _set.coAuth, _set.noSubitems]
                });
                this.lockedControls.push(this.btnLogical);
                this.formulaControls.push(this.btnLogical);

                this.btnTextData = new Common.UI.Button({
                    parentEl: $host.find('#slot-btn-text'),
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-func-text',
                    caption: formulaDialog.sCategoryTextAndData,
                    hint: formulaDialog.sCategoryTextAndData,
                    menu: true,
                    split: false,
                    disabled: true,
                    lock: [_set.editText, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.selSlicer, _set.selRangeEdit, _set.lostConnect, _set.coAuth, _set.noSubitems]
                });
                this.lockedControls.push(this.btnTextData);
                this.formulaControls.push(this.btnTextData);

                this.btnDateTime = new Common.UI.Button({
                    parentEl: $host.find('#slot-btn-datetime'),
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-datetime',
                    caption: formulaDialog.sCategoryDateAndTime,
                    hint: formulaDialog.sCategoryDateAndTime,
                    menu: true,
                    split: false,
                    disabled: true,
                    lock: [_set.editText, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.selSlicer, _set.selRangeEdit, _set.lostConnect, _set.coAuth, _set.noSubitems]
                });
                this.lockedControls.push(this.btnDateTime);
                this.formulaControls.push(this.btnDateTime);

                this.btnReference = new Common.UI.Button({
                    parentEl: $host.find('#slot-btn-lookup'),
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-lookup',
                    caption: formulaDialog.sCategoryLookupAndReference,
                    hint: formulaDialog.sCategoryLookupAndReference,
                    menu: true,
                    split: false,
                    disabled: true,
                    lock: [_set.editText, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.selSlicer, _set.selRangeEdit, _set.lostConnect, _set.coAuth, _set.noSubitems]
                });
                this.lockedControls.push(this.btnReference);
                this.formulaControls.push(this.btnReference);

                this.btnMath = new Common.UI.Button({
                    parentEl: $host.find('#slot-btn-math'),
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-func-math',
                    caption: formulaDialog.sCategoryMathematic,
                    hint: formulaDialog.sCategoryMathematic,
                    menu: true,
                    split: false,
                    disabled: true,
                    lock: [_set.editText, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.selSlicer, _set.selRangeEdit, _set.lostConnect, _set.coAuth, _set.noSubitems]
                });
                this.lockedControls.push(this.btnMath);
                this.formulaControls.push(this.btnMath);

                this.btnRecent = new Common.UI.Button({
                    parentEl: $host.find('#slot-btn-recent'),
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-recent',
                    caption: this.txtRecent,
                    hint: this.txtRecent,
                    menu: true,
                    split: false,
                    disabled: true,
                    lock: [_set.editText, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.selSlicer, _set.selRangeEdit, _set.lostConnect, _set.coAuth, _set.noSubitems]
                });
                this.lockedControls.push(this.btnRecent);
                this.formulaControls.push(this.btnRecent);

                this.btnAutosum = new Common.UI.Button({
                    parentEl: $host.find('#slot-btn-autosum'),
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-autosum',
                    caption: this.txtAutosum,
                    hint: [this.txtAutosumTip + Common.Utils.String.platformKey('Alt+='), this.txtFormulaTip + Common.Utils.String.platformKey('Shift+F3')],
                    split: true,
                    disabled: true,
                    lock: [_set.editText, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.selSlicer, _set.selRangeEdit, _set.lostConnect, _set.coAuth],
                    menu: new Common.UI.Menu({
                        items : [
                            {caption: 'SUM',   value: 'SUM'},
                            {caption: 'AVERAGE', value: 'AVERAGE'},
                            {caption: 'MIN',   value: 'MIN'},
                            {caption: 'MAX',   value: 'MAX'},
                            {caption: 'COUNT', value: 'COUNT'},
                            {caption: '--'},
                            {
                                caption: me.txtAdditional,
                                value: 'more',
                                hint: me.txtFormulaTip + Common.Utils.String.platformKey('Shift+F3')
                            }
                        ]
                    })
                });
                this.lockedControls.push(this.btnAutosum);
                this.formulaControls.push(this.btnAutosum);

                this.btnFormula = new Common.UI.Button({
                    parentEl: $host.find('#slot-btn-additional-formula'),
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-ins-formula',
                    caption: this.txtFormula,
                    hint: this.txtFormulaTip + Common.Utils.String.platformKey('Shift+F3'),
                    disabled: true,
                    lock: [_set.editText, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.selSlicer, _set.selRangeEdit, _set.lostConnect, _set.coAuth]
                });
                this.lockedControls.push(this.btnFormula);
                this.formulaControls.push(this.btnFormula);

                this.btnMore = new Common.UI.Button({
                    parentEl: $host.find('#slot-btn-more'),
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-more',
                    caption: this.txtMore,
                    hint: this.txtMore,
                    menu: true,
                    split: false,
                    disabled: true,
                    lock: [_set.editText, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.selSlicer, _set.selRangeEdit, _set.lostConnect, _set.coAuth, _set.noSubitems]
                });
                this.lockedControls.push(this.btnMore);
                this.formulaControls.push(this.btnMore);

                this.btnCalculate = new Common.UI.Button({
                    parentEl: $host.find('#slot-btn-calculate'),
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-calculation',
                    caption: this.txtCalculation,
                    split: true,
                    menu: true,
                    disabled: true,
                    lock: [_set.editCell, _set.selRangeEdit, _set.lostConnect, _set.coAuth]
                });
                this.lockedControls.push(this.btnCalculate);
                this.formulaControls.push(this.btnCalculate);

                this.btnNamedRange = new Common.UI.Button({
                    parentEl: $host.find('#slot-btn-named-range-huge'),
                    cls         : 'btn-toolbar x-huge icon-top',
                    iconCls     : 'toolbar__icon btn-named-range',
                    caption: this.toolbar.txtNamedRange,
                    hint: this.toolbar.txtNamedRange,
                    split: false,
                    disabled: true,
                    lock        : [_set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.lostConnect, _set.coAuth, _set.selRangeEdit],
                    menu: new Common.UI.Menu({
                        items: [
                            {
                                caption: me.toolbar.txtManageRange,
                                lock    : [_set.editCell],
                                value: 'manage'
                            },
                            {
                                caption: me.toolbar.txtNewRange,
                                lock    : [_set.editCell],
                                value: 'new'
                            },
                            {
                                caption: me.toolbar.txtPasteRange,
                                value: 'paste'
                            }
                        ]
                    })
                });
                this.lockedControls.push(this.btnNamedRange);

                Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            },

            render: function (el) {
                return this;
            },

            onAppReady: function (config) {
                var me = this;
                (new Promise(function (accept, reject) {
                    accept();
                })).then(function(){
                    me.btnCalculate.updateHint([me.tipCalculateTheEntireWorkbook + Common.Utils.String.platformKey('F9'), me.tipCalculate]);
                    var _menu = new Common.UI.Menu({
                        items: [
                            {caption: me.textCalculateWorkbook, value: Asc.c_oAscCalculateType.All},
                            {caption: me.textCalculateCurrentSheet, value: Asc.c_oAscCalculateType.ActiveSheet}
                            //{caption: '--'},
                            //{caption: me.textAutomatic, value: '', toggleGroup: 'menuCalcMode', checkable: true, checked: true},
                            //{caption: me.textManual, value: '', toggleGroup: 'menuCalcMode', checkable: true, checked: false}
                        ]
                    });
                    me.btnCalculate.setMenu(_menu);
                    setEvents.call(me);
                });
            },

            show: function () {
                Common.UI.BaseView.prototype.show.call(this);
                this.fireEvent('show', this);
            },

            getButtons: function(type) {
                if (type == 'formula')
                    return this.formulaControls;
                else if (type == 'range')
                    return this.btnNamedRange;
                else
                    return this.lockedControls;
            },

            SetDisabled: function (state) {
                this.lockedControls && this.lockedControls.forEach(function(button) {
                    if ( button ) {
                        button.setDisabled(state);
                    }
                }, this);
            },

            focusInner: function(menu, e) {
                if (e.keyCode == Common.UI.Keys.UP)
                    menu.items[menu.items.length-1].cmpEl.find('> a').focus();
                else
                    menu.items[0].cmpEl.find('> a').focus();
            },

            focusOuter: function(menu, e) {
                menu.items[2].cmpEl.find('> a').focus();
            },

            onBeforeKeyDown: function(menu, e) {
                if (e.keyCode == Common.UI.Keys.RETURN) {
                    e.preventDefault();
                    e.stopPropagation();
                    var li = $(e.target).closest('li');
                    (li.length>0) && li.click();
                    Common.UI.Menu.Manager.hideAll();
                } else if (e.namespace!=="after.bs.dropdown" && (e.keyCode == Common.UI.Keys.DOWN || e.keyCode == Common.UI.Keys.UP)) {
                    var $items = $('> [role=menu] > li:not(.divider):not(.disabled):visible', menu.$el).find('> a');
                    if (!$items.length) return;
                    var index = $items.index($items.filter(':focus')),
                        me = this;
                    if (menu._outerMenu && (e.keyCode == Common.UI.Keys.UP && index==0 || e.keyCode == Common.UI.Keys.DOWN && index==$items.length - 1) ||
                        menu._innerMenu && (e.keyCode == Common.UI.Keys.UP || e.keyCode == Common.UI.Keys.DOWN) && index!==-1) {
                        e.preventDefault();
                        e.stopPropagation();
                        _.delay(function() {
                            menu._outerMenu ? me.focusOuter(menu._outerMenu, e) : me.focusInner(menu._innerMenu, e);
                        }, 10);
                    }
                }
            },

            setButtonMenu: function(btn, name) {
                var me = this,
                    arr = [],
                    group = me.formulasGroups.findWhere({name : name});

                if (group) {
                    var functions = group.get('functions');
                    functions && functions.forEach(function(item) {
                        arr.push(new Common.UI.MenuItem({
                            caption: item.get('name'),
                            value: item.get('origin')
                        }));
                    });
                }
                if (arr.length) {
                    if (btn.menu && btn.menu.rendered) {
                        var menu = btn.menu._innerMenu;
                        if (menu) {
                            menu.removeAll();
                            arr.forEach(function(item){
                                menu.addItem(item);
                            });
                        }
                    } else {
                        btn.setMenu(new Common.UI.Menu({
                            items: [
                                {template: _.template('<div id="id-toolbar-formula-menu-'+ name +'" style="display: flex;" class="open"></div>')},
                                { caption: '--' },
                                {
                                    caption: me.txtAdditional,
                                    value: 'more',
                                    hint: me.txtFormulaTip + Common.Utils.String.platformKey('Shift+F3')
                                }
                            ]
                        }));
                        btn.menu.items[2].on('click', function (item, e) {
                            me.fireEvent('function:apply', [{name: item.caption, origin: item.value}, false, name]);
                        });
                        btn.menu.on('show:after', function (menu, e) {
                            var internalMenu = menu._innerMenu;
                            internalMenu.scroller.update({alwaysVisibleY: true});
                            _.delay(function() {
                                menu._innerMenu && menu._innerMenu.cmpEl.focus();
                            }, 10);
                        }).on('keydown:before', _.bind(me.onBeforeKeyDown, this));

                        var menu = new Common.UI.Menu({
                            maxHeight: 300,
                            cls: 'internal-menu',
                            items: arr
                        });
                        menu.render(btn.menu.items[0].cmpEl.children(':first'));
                        menu.cmpEl.css({
                            display     : 'block',
                            position    : 'relative',
                            left        : 0,
                            top         : 0
                        });
                        menu.cmpEl.attr({tabindex: "-1"});
                        menu.on('item:click', function (menu, item, e) {
                            me.fireEvent('function:apply', [{name: item.caption, origin: item.value}, false, name]);
                        }).on('keydown:before', _.bind(me.onBeforeKeyDown, this));
                        btn.menu._innerMenu = menu;
                        menu._outerMenu = btn.menu;
                    }
                }
                Common.Utils.lockControls(SSE.enumLock.noSubitems, arr.length<1, {array: [btn]});
            },

            setMenuItemMenu: function(name) {
                var me = this,
                    arr = [],
                    formulaDialog = SSE.getController('FormulaDialog'),
                    group = me.formulasGroups.findWhere({name : name});

                if (group) {
                    var functions = group.get('functions');
                    functions && functions.forEach(function(item) {
                        arr.push(new Common.UI.MenuItem({
                            caption: item.get('name'),
                            value: item.get('origin')
                        }));
                    });
                    if (arr.length) {
                        var mnu = new Common.UI.MenuItem({
                            caption : formulaDialog['sCategory' + name] || name,
                            menu: new Common.UI.Menu({
                                menuAlign: 'tl-tr',
                                items: [
                                    {template: _.template('<div id="id-toolbar-formula-menu-'+ name +'" style="display: flex;" class="open"></div>')},
                                    { caption: '--' },
                                    {
                                        caption: me.txtAdditional,
                                        value: 'more',
                                        hint: me.txtFormulaTip + Common.Utils.String.platformKey('Shift+F3')
                                    }
                                ]
                            })
                        });
                        mnu.menu.items[2].on('click', function (item, e) {
                            me.fireEvent('function:apply', [{name: item.caption, origin: item.value}, false, name]);
                        });
                        mnu.menu.on('show:after', function (menu, e) {
                            var internalMenu = menu._innerMenu;
                            internalMenu.scroller.update({alwaysVisibleY: true});
                            _.delay(function() {
                                menu._innerMenu && menu._innerMenu.items[0].cmpEl.find('> a').focus();
                            }, 10);
                        }).on('keydown:before', _.bind(me.onBeforeKeyDown, this))
                          .on('keydown:before', function(menu, e) {
                                if (e.keyCode == Common.UI.Keys.LEFT || e.keyCode == Common.UI.Keys.ESC) {
                                    var $parent = menu.cmpEl.parent();
                                    if ($parent.hasClass('dropdown-submenu') && $parent.hasClass('over')) { // close submenu
                                        $parent.removeClass('over');
                                        $parent.find('> a').focus();
                                    }
                                }
                        });

                        // internal menu
                        var menu = new Common.UI.Menu({
                            maxHeight: 300,
                            cls: 'internal-menu',
                            items: arr
                        });
                        menu.on('item:click', function (menu, item, e) {
                            me.fireEvent('function:apply', [{name: item.caption, origin: item.value}, false, name]);
                        }).on('keydown:before', _.bind(me.onBeforeKeyDown, this));
                        mnu.menu._innerMenu = menu;
                        menu._outerMenu = mnu.menu;
                        return mnu;
                    }
                }
            },

            fillFunctions: function () {
                if (this.formulasGroups) {
                    this.setButtonMenu(this.btnFinancial, 'Financial');
                    this.setButtonMenu(this.btnLogical, 'Logical');
                    this.setButtonMenu(this.btnTextData, 'TextAndData');
                    this.setButtonMenu(this.btnDateTime, 'DateAndTime');
                    this.setButtonMenu(this.btnReference, 'LookupAndReference');
                    this.setButtonMenu(this.btnMath, 'Mathematic');
                    this.setButtonMenu(this.btnRecent, 'Last10');

                    var formulas = this.btnAutosum.menu.items;
                    for (var i=0; i<Math.min(4,formulas.length); i++) {
                        this.api && formulas[i].setCaption(this.api.asc_getFormulaLocaleName(formulas[i].value));
                    }

                    // more button
                    var me = this,
                        morearr = [];
                    ['Cube', 'Database', 'Engineering',  'Information', 'Statistical'].forEach(function(name) {
                        var mnu = me.setMenuItemMenu(name);
                        mnu && morearr.push(mnu);

                    });
                    var btn = this.btnMore;
                    if (morearr.length) {
                        if (btn.menu && btn.menu.rendered) {
                            btn.menu.removeAll();
                            morearr.forEach(function(item){
                                btn.menu.addItem(item);
                            });
                        } else {
                            btn.setMenu(new Common.UI.Menu({
                                items: morearr
                            }));
                        }
                        btn.menu.items.forEach(function(mnu){
                            var menuContainer = mnu.menu.items[0].cmpEl.children(':first'),
                                menu = mnu.menu._innerMenu;
                            menu.render(menuContainer);
                            menu.cmpEl.css({
                                display     : 'block',
                                position    : 'relative',
                                left        : 0,
                                top         : 0
                            });
                            menu.cmpEl.attr({tabindex: "-1"});
                        });
                    }
                    Common.Utils.lockControls(SSE.enumLock.noSubitems, morearr.length<1, {array: [btn]});
                }
            },

            updateRecent: function() {
                this.formulasGroups && this.setButtonMenu(this.btnRecent, 'Last10');
            },

            setApi: function (api) {
                this.api = api;
            },

            txtRecent: 'Recently used',
            txtAutosum: 'Autosum',
            txtAutosumTip: 'Summation',
            txtAdditional: 'Insert Function',
            txtFormula: 'Function',
            txtFormulaTip: 'Insert function',
            txtMore: 'More functions',
            txtCalculation: 'Calculation',
            tipCalculate: 'Calculate',
            textCalculateWorkbook: 'Calculate workbook',
            textCalculateCurrentSheet: 'Calculate current sheet',
            textAutomatic: 'Automatic',
            textManual: 'Manual',
            tipCalculateTheEntireWorkbook: 'Calculate the entire workbook'
        }
    }()), SSE.Views.FormulaTab || {}));
});
