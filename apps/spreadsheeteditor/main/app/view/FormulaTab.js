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
            var _setevent = function(btn){
                (typeof btn.menu == 'object') && btn.menu.on('item:click', function (menu, item, e) {
                    me.fireEvent('function:apply', [{name: item.caption, origin: item.value}]);
                });
            };
            // me.btnFinancial.menu.on('item:click', function (menu, item, e) {
            //     me.fireEvent('function:apply', [{name: item.caption, origin: item.value}]);
            // });
            _setevent(this.btnFinancial);
            _setevent(this.btnLogical);
            _setevent(this.btnTextData);
            _setevent(this.btnDateTime);
            _setevent(this.btnReference);
            _setevent(this.btnMath);
        }

        return {
            options: {},

            initialize: function (options) {
                Common.UI.BaseView.prototype.initialize.call(this);
                this.toolbar = options.toolbar;
                this.formulasGroups =   options.formulasGroups;

                this.lockedControls = [];

                var me = this,
                    $host = me.toolbar.$el,
                    _set = SSE.enumLock;

                var formulaDialog = SSE.getController('FormulaDialog');

                this.btnFinancial = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'btn-cell-group',
                    caption: formulaDialog.sCategoryFinancial,
                    hint: formulaDialog.sCategoryFinancial,
                    menu: true,
                    split: false,
                    disabled: true,
                    lock: [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.lostConnect, _set.coAuth]
                });
                Common.Utils.injectComponent($host.find('#slot-btn-financial'), this.btnFinancial);
                this.lockedControls.push(this.btnFinancial);

                this.btnLogical = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'btn-cell-group',
                    caption: formulaDialog.sCategoryLogical,
                    hint: formulaDialog.sCategoryLogical,
                    menu: true,
                    split: false,
                    disabled: true,
                    lock: [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.lostConnect, _set.coAuth]
                });
                Common.Utils.injectComponent($host.find('#slot-btn-logical'), this.btnLogical);
                this.lockedControls.push(this.btnLogical);

                this.btnTextData = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'btn-cell-group',
                    caption: formulaDialog.sCategoryTextAndData,
                    hint: formulaDialog.sCategoryTextAndData,
                    menu: true,
                    split: false,
                    disabled: true,
                    lock: [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.lostConnect, _set.coAuth]
                });
                Common.Utils.injectComponent($host.find('#slot-btn-text'), this.btnTextData);
                this.lockedControls.push(this.btnTextData);

                this.btnDateTime = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'btn-cell-group',
                    caption: formulaDialog.sCategoryDateAndTime,
                    hint: formulaDialog.sCategoryDateAndTime,
                    menu: true,
                    split: false,
                    disabled: true,
                    lock: [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.lostConnect, _set.coAuth]
                });
                Common.Utils.injectComponent($host.find('#slot-btn-datetime'), this.btnDateTime);
                this.lockedControls.push(this.btnDateTime);

                this.btnReference = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'btn-cell-group',
                    caption: formulaDialog.sCategoryLookupAndReference,
                    hint: formulaDialog.sCategoryLookupAndReference,
                    menu: true,
                    split: false,
                    disabled: true,
                    lock: [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.lostConnect, _set.coAuth]
                });
                Common.Utils.injectComponent($host.find('#slot-btn-lookup'), this.btnReference);
                this.lockedControls.push(this.btnReference);

                this.btnMath = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'btn-cell-group',
                    caption: formulaDialog.sCategoryMathematic,
                    hint: formulaDialog.sCategoryMathematic,
                    menu: true,
                    split: false,
                    disabled: true,
                    lock: [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.lostConnect, _set.coAuth]
                });
                Common.Utils.injectComponent($host.find('#slot-btn-math'), this.btnMath);
                this.lockedControls.push(this.btnMath);

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
                    // setEvents.call(me);
                });
            },

            show: function () {
                Common.UI.BaseView.prototype.show.call(this);
                this.fireEvent('show', this);
            },

            getButtons: function(type) {
                return this.lockedControls;
            },

            SetDisabled: function (state) {
                this.lockedControls && this.lockedControls.forEach(function(button) {
                    if ( button ) {
                        button.setDisabled(state);
                    }
                }, this);
            },

            fillFunctions: function () {
                if (this.formulasGroups) {
                    var me = this;
                    var setMenu = function(btn, name) {
                        var i = 0,
                            length = 0,
                            functions = null,
                            arr = [],
                            group = me.formulasGroups.findWhere({name : name});

                        if (group) {
                            functions = group.get('functions');
                            functions && functions.forEach(function(item) {
                                arr.push(new Common.UI.MenuItem({
                                    caption: item.get('name'),
                                    value: item.get('origin')
                                }));
                            });
                        }
                        if (arr.length) {
                            if (btn.menu && btn.menu.rendered) {
                                btn.menu.removeAll();
                                arr.forEach(function(item){
                                    btn.menu.addItem(item);
                                });
                            } else {
                                btn.setMenu(new Common.UI.Menu({
                                    restoreHeight: 415,
                                    items: arr
                                }));
                                btn.menu.on('item:click', function (menu, item, e) {
                                    me.fireEvent('function:apply', [{name: item.caption, origin: item.value}]);
                                });
                            }
                        }
                        btn.setDisabled(arr.length<1);
                    };

                    setMenu(this.btnFinancial, 'Financial');
                    setMenu(this.btnLogical, 'Logical');
                    setMenu(this.btnTextData, 'TextAndData');
                    setMenu(this.btnDateTime, 'DateAndTime');
                    setMenu(this.btnReference, 'LookupAndReference');
                    setMenu(this.btnMath, 'Mathematic');
                }
            },

            capBtnGroup: 'Group',
            capBtnUngroup: 'Ungroup',
            textRows: 'Ungroup rows',
            textColumns: 'Ungroup columns',
            textClear: 'Clear outline',
            tipGroup: 'Group range of cells',
            tipUngroup: 'Ungroup range of cells',
            capBtnTextToCol: 'Text to Columns',
            tipToColumns: 'Separate cell text into columns',
            capBtnTextShow: 'Show details',
            capBtnTextHide: 'Hide details'
        }
    }()), SSE.Views.FormulaTab || {}));
});
