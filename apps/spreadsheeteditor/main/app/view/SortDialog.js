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
 *
 *  SortDialog.js
 *
 *  Created by Julia.Radzhabova on 05.10.19
 *  Copyright (c) 2019 Ascensio System SIA. All rights reserved.
 *
 */

define([  'text!spreadsheeteditor/main/app/template/SortDialog.template',
    'common/main/lib/view/AdvancedSettingsWindow',
    'common/main/lib/component/ComboBox',
    'common/main/lib/component/ListView',
    'spreadsheeteditor/main/app/view/SortOptionsDialog'
], function (contentTemplate) {
    'use strict';

    SSE.Views = SSE.Views || {};

    SSE.Views.SortDialog =  Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            alias: 'SortDialog',
            contentWidth: 500,
            height: 285,
            buttons: ['ok', 'cancel']
        },

        initialize: function (options) {
            var me = this;
            _.extend(this.options, {
                title: this.txtTitle,
                template: [
                    '<div class="box" style="height:' + (this.options.height-85) + 'px;">',
                    '<div class="content-panel" style="padding: 0;">' + _.template(contentTemplate)({scope: this}) + '</div>',
                    '</div>'
                ].join('')
            }, options);

            this.api        = options.api;
            this.handler    = options.handler;
            this.props      = options.props;

            this.sortOptions = {};
            this.sortStore = new Common.UI.DataViewStore();

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },
        render: function () {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this.sortList = new Common.UI.ListView({
                el: $('#sort-dialog-list', this.$window),
                store: new Common.UI.DataViewStore(),
                simpleAddMode: true,
                emptyText: '',
                template: _.template(['<div class="listview inner" style=""></div>'].join('')),
                itemTemplate: _.template([
                        '<div class="list-item" style="width: 100%;display:inline-block;">',
                            '<div style="width:150px;padding-right: 5px;display: inline-block;"><div id="sort-dialog-cmb-col-<%= index %>" class="input-group-nr" style="width:100%;"></div></div>',
                            '<div style="width:150px;padding-right: 5px;display: inline-block;"><div id="sort-dialog-cmb-sort-<%= index %>" class="input-group-nr" style="width:100%;"></div></div>',
                            '<div style="width:150px;display: inline-block;"><div id="sort-dialog-cmb-order-<%= index %>" class="input-group-nr" style="width:100%;"></div></div>',
                        '</div>'
                ].join(''))
            });
            // this.rangeList.on('item:select', _.bind(this.onSelectLevel, this))
            //               .on('item:keydown', _.bind(this.onKeyDown, this));

            this.btnAdd = new Common.UI.Button({
                el: $('#sort-dialog-btn-add')
            });
            // this.btnAdd.on('click', _.bind(this.onAddLevel, this, false));

            this.btnDelete = new Common.UI.Button({
                el: $('#sort-dialog-btn-delete')
            });
            // this.btnDelete.on('click', _.bind(this.onDeleteLevel, this));

            this.btnCopy = new Common.UI.Button({
                el: $('#sort-dialog-btn-copy')
            });
            // this.btnCopy.on('click', _.bind(this.onCopyLevel, this, false));

            this.btnOptions = new Common.UI.Button({
                el: $('#sort-dialog-btn-options')
            });
            this.btnOptions.on('click', _.bind(this.onOptions, this, false));

            this.btnUp = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'btn-incfont',
                hint: this.textUp
            });
            this.btnUp.render($('#sort-dialog-btn-up')) ;
            // this.btnUp.on('click', _.bind(this.onUpClick, this));

            this.btnDown = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'btn-decfont',
                hint: this.textDown
            });
            this.btnDown.render($('#sort-dialog-btn-down')) ;
            // this.btnDown.on('click', _.bind(this.onDownClick, this));

            this.afterRender();
        },

        afterRender: function() {
            this._setDefaults(this.props);
        },

        _setDefaults: function (props) {
            if (props) {
                this.sortOptions = {
                    headers: props.asc_getHasHeaders(),
                    // sensitive: props.asc_getCaseSensitive(),
                    sort: props.asc_getColumnSort()
                };

                // get name from props
                this.column_data = [
                    { value: 'a', displayValue: 'a' },
                    { value: 'b', displayValue: 'b' },
                    { value: 'c', displayValue: 'c' }
                ];
                this.sort_data = [
                    { value: Asc.c_oAscSortOptions.ByValue, displayValue: this.textValues },
                    { value: Asc.c_oAscSortOptions.ByColorFill, displayValue: this.textCellColor },
                    { value: Asc.c_oAscSortOptions.ByColorFont, displayValue: this.textFontColor },
                    { value: Asc.c_oAscSortOptions.ByIcon, displayValue: this.textCellIcon }
                ];
                this.order_data = [
                    { value: Asc.c_oAscSortOptions.Ascending, displayValue: this.textAZ },
                    { value: Asc.c_oAscSortOptions.Descending, displayValue: this.textZA }
                    ];

                this.sortList.on('item:add', _.bind(this.addControls, this));
                this.sortList.on('item:change', _.bind(this.addControls, this));
                this.refreshList(props.asc_getLevels());
            }
        },

        refreshList: function(levels) {
            this.cmbsColumn = [];
            this.cmbsSort = [];
            this.cmbsOrder = [];

            if (levels) {
                var arr = [];
                for (var i=0; i<levels.length; i++) {
                    var level = levels[i];
                    arr.push({
                        index: level.asc_getIndex(),
                        name: level.asc_getName(),
                        sort: level.asc_getSortBy(),
                        order: level.asc_getDescending(),
                        color: level.asc_getColor()
                    });
                }

                // arr.push({
                //     index: 0,
                //     name: 'a',
                //     sort: Asc.c_oAscSortOptions.ByValue,
                //     order: Asc.c_oAscSortOptions.Ascending
                // });
                // arr.push({
                //     index: 1,
                //     name: 's',
                //     sort: Asc.c_oAscSortOptions.ByValue,
                //     order: Asc.c_oAscSortOptions.Descending
                // });

                arr.sort(function (a, b) {
                    return a.index - b.index;
                });
                this.sortList.store.reset(arr);
            }
        },

        addControls: function(listView, itemView, item) {
            if (!item) return;

            var cmpEl = this.sortList.cmpEl;
            var i = item.get('index');
            var el = cmpEl.find('#sort-dialog-cmb-col-' + i),
                combo = new Common.UI.ComboBox({
                    el          : el,
                    editable    : false,
                    cls         : 'input-group-nr',
                    menuCls     : 'menu-absolute',
                    data        : this.column_data
                }).on('selected', function(combo, record) {
                    item.set('name', record.value);
                });
            var val = item.get('name');
            (val!==null) && combo.setValue(item.get('name'));
            this.cmbsColumn[i] = combo;

            el = cmpEl.find('#sort-dialog-cmb-sort-' + i);
            combo = new Common.UI.ComboBox({
                el          : el,
                editable    : false,
                cls         : 'input-group-nr',
                menuCls     : 'menu-absolute',
                data        : this.sort_data
            }).on('selected', function(combo, record) {
                item.set('sort', record.value);
            });
            val = item.get('sort');
            (val!==null) && combo.setValue(val);
            this.cmbsSort[i] = combo;

            el = cmpEl.find('#sort-dialog-cmb-order-' + i);
            combo = new Common.UI.ComboBox({
                el          : el,
                editable    : false,
                cls         : 'input-group-nr',
                menuCls     : 'menu-absolute',
                data        : this.order_data
            }).on('selected', function(combo, record) {
                item.set('order', record.value);
            });
            val = item.get('order');
            (val!==null) && combo.setValue(val);
            this.cmbsOrder[i] = combo;
        },

        onOptions: function () {
            var me = this;

            var win = new SSE.Views.SortOptionsDialog({
                props: me.sortOptions,
                handler : function(result, settings) {
                    if (result == 'ok' && settings) {
                        me.sortOptions = settings;
                    }
                }
            });
            win.show();
        },

        getSettings: function() {
            var props = new Asc.CSortProperties();
            props.asc_setHasHeaders(this.sortOptions.headers);
            // props.asc_setCaseSensitive(this.sortOptions.sensitive);
            props.asc_setColumnSort(this.sortOptions.sort);

            return {};
        },

        close: function () {
            Common.UI.Window.prototype.close.call(this);
        },

        onKeyDown: function (lisvView, record, e) {
            if (e.keyCode==Common.UI.Keys.DELETE && !this.btnDelete.isDisabled())
                this.onDeletelevel();
        },

        txtTitle: 'Sort',
        textAdd: 'Add level',
        textDelete: 'Delete level',
        textCopy: 'Copy level',
        textColumn: 'Column',
        textSort: 'Sort on',
        textOrder: 'Order',
        textUp: 'Move level up',
        textDown: 'Move level down',
        textOptions: 'Options',
        textValues: 'Values',
        textCellColor: 'Cell color',
        textFontColor: 'Font color',
        textCellIcon: 'Cell icon',
        textAZ: 'A to Z',
        textZA: 'Z to A'

    }, SSE.Views.SortDialog || {}));
});