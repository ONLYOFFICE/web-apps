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
 *  DataTab.js
 *
 *  Created by Julia Radzhabova on 30.05.2019
 *  Copyright (c) 2019 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Layout'
], function () {
    'use strict';

    SSE.Views.DataTab = Common.UI.BaseView.extend(_.extend((function(){
        function setEvents() {
            var me = this;
            me.btnUngroup.menu.on('item:click', function (menu, item, e) {
                me.fireEvent('data:ungroup', [item.value]);
            });
            me.btnUngroup.on('click', function (b, e) {
                me.fireEvent('data:ungroup');
            });
            me.btnGroup.on('click', function (b, e) {
                me.fireEvent('data:group');
            });
            me.btnTextToColumns.on('click', function (b, e) {
                me.fireEvent('data:tocolumns');
            });
            me.btnShow.on('click', function (b, e) {
                me.fireEvent('data:show');
            });
            me.btnHide.on('click', function (b, e) {
                me.fireEvent('data:hide');
            });
            me.btnsSortDown.forEach(function(button) {
                button.on('click', function (b, e) {
                    me.fireEvent('data:sort', [Asc.c_oAscSortOptions.Ascending]);
                });
            });
        }

        return {
            options: {},

            initialize: function (options) {
                Common.UI.BaseView.prototype.initialize.call(this);
                this.toolbar = options.toolbar;

                this.lockedControls = [];
                this.btnsSortDown = [];

                var me = this,
                    $host = me.toolbar.$el,
                    _set = SSE.enumLock;

                var _injectComponent = function (id, cmp) {
                    var $slot = $host.find(id);
                    if ($slot.length)
                        cmp.rendered ? $slot.append(cmp.$el) : cmp.render($slot);
                };

                var _injectComponents = function ($slots, iconCls, split, menu, caption, lock, btnsArr) {
                    $slots.each(function(index, el) {
                        var _cls = 'btn-toolbar';
                        /x-huge/.test(el.className) && (_cls += ' x-huge icon-top');

                        var button = new Common.UI.Button({
                            id: "id-toolbar-" + iconCls + index,
                            cls: _cls,
                            iconCls: iconCls,
                            caption: caption,
                            split: split,
                            menu: menu,
                            lock: lock,
                            disabled: true
                        }).render( $slots.eq(index) );

                        btnsArr.push(button);
                        me.lockedControls.push(button);
                    });
                };

                this.btnGroup = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'btn-img-group',
                    caption: this.capBtnGroup,
                    split: false,
                    disabled: true,
                    lock: [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.lostConnect, _set.coAuth]
                });
                _injectComponent('#slot-btn-group', this.btnGroup);
                this.lockedControls.push(this.btnGroup);

                this.btnUngroup = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'btn-img-group',
                    caption: this.capBtnUngroup,
                    split: true,
                    menu: true,
                    disabled: true,
                    lock: [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.lostConnect, _set.coAuth]
                });
                _injectComponent('#slot-btn-ungroup', this.btnUngroup);
                this.lockedControls.push(this.btnUngroup);

                this.btnTextToColumns = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'btn-img-group',
                    caption: this.capBtnTextToCol,
                    split: false,
                    disabled: true,
                    lock: [_set.multiselect, _set.multiselectCols, _set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.lostConnect, _set.coAuth]
                });
                _injectComponent('#slot-btn-text-column', this.btnTextToColumns);
                this.lockedControls.push(this.btnTextToColumns);

                this.btnShow = new Common.UI.Button({
                    cls         : 'btn-toolbar',
                    iconCls     : 'btn-show-details',
                    style: 'padding-right: 2px;',
                    caption: this.capBtnTextShow,
                    lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.lostConnect, _set.coAuth]
                });
                _injectComponent('#slot-btn-show-details', this.btnShow);
                this.lockedControls.push(this.btnShow);

                this.btnHide = new Common.UI.Button({
                    cls         : 'btn-toolbar',
                    iconCls     : 'btn-hide-details',
                    style: 'padding-right: 2px;',
                    caption: this.capBtnTextHide,
                    lock        : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.lostConnect, _set.coAuth]
                });
                _injectComponent('#slot-btn-hide-details', this.btnHide);
                this.lockedControls.push(this.btnHide);

                _injectComponents($host.find('.slot-sortdesc'), 'btn-sort-down', false, false, '',
                    [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.lostConnect, _set.coAuth, _set.ruleFilter, _set.editPivot],
                    this.btnsSortDown);

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
                    me.btnUngroup.updateHint( me.tipUngroup );
                    var _menu = new Common.UI.Menu({
                        items: [
                            {caption: me.textRows, value: 'rows'},
                            {caption: me.textColumns, value: 'columns'},
                            {caption: me.textClear, value: 'clear'}
                        ]
                    });
                    me.btnUngroup.setMenu(_menu);

                    me.btnGroup.updateHint(me.tipGroup);
                    me.btnTextToColumns.updateHint(me.tipToColumns);

                    me.btnsSortDown.forEach( function(btn) {
                        btn.updateHint(me.toolbar.txtSortAZ);
                    });

                    setEvents.call(me);
                });
            },

            show: function () {
                Common.UI.BaseView.prototype.show.call(this);
                this.fireEvent('show', this);
            },

            getButtons: function(type) {
                if (type == 'sort-down')
                    return this.btnsSortDown;
                else if (type===undefined)
                    return this.lockedControls;
                return [];
            },

            SetDisabled: function (state) {
                this.lockedControls && this.lockedControls.forEach(function(button) {
                    if ( button ) {
                        button.setDisabled(state);
                    }
                }, this);
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
    }()), SSE.Views.DataTab || {}));
});
