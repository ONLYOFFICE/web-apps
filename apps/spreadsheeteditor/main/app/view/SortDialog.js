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
            height: 294,
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
            this.levels     = [];

            this.sortOptions = {};

            this.options.handler = function(result, value) {
                if ( result != 'ok' || this.isListValid() ) {
                    if (options.handler)
                        options.handler.call(this, result, value);
                    return;
                }
                return true;
            };

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },
        render: function () {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this.sortList = new Common.UI.ListView({
                el: $('#sort-dialog-list', this.$window),
                store: new Common.UI.DataViewStore(),
                emptyText: '',
                template: _.template(['<div class="listview inner" style=""></div>'].join('')),
                itemTemplate: _.template([
                        '<div class="list-item" style="width: 100%;display:inline-block;">',
                            '<div style="width:150px;padding-right: 5px;display: inline-block;"><div id="sort-dialog-cmb-col-<%= levelIndex %>" class="input-group-nr" style="width:100%;"></div></div>',
                            '<div style="width:150px;padding-right: 5px;display: inline-block;"><div id="sort-dialog-cmb-sort-<%= levelIndex %>" class="input-group-nr" style="width:100%;"></div></div>',
                            '<div style="width:150px;display: inline-block;"><div id="sort-dialog-cmb-order-<%= levelIndex %>" class="input-group-nr" style="width:100%;"></div></div>',
                        '</div>'
                ].join(''))
            });
            this.sortList.on('item:select', _.bind(this.onSelectLevel, this))
                         .on('item:keydown', _.bind(this.onKeyDown, this));

            this.btnAdd = new Common.UI.Button({
                el: $('#sort-dialog-btn-add')
            });
            this.btnAdd.on('click', _.bind(this.onAddLevel, this, false));

            this.btnDelete = new Common.UI.Button({
                el: $('#sort-dialog-btn-delete')
            });
            this.btnDelete.on('click', _.bind(this.onDeleteLevel, this));

            this.btnCopy = new Common.UI.Button({
                el: $('#sort-dialog-btn-copy')
            });
            this.btnCopy.on('click', _.bind(this.onCopyLevel, this, false));

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
            this.btnUp.on('click', _.bind(this.onMoveClick, this, true));

            this.btnDown = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'btn-decfont',
                hint: this.textDown
            });
            this.btnDown.render($('#sort-dialog-btn-down')) ;
            this.btnDown.on('click', _.bind(this.onMoveClick, this, false));

            this.lblColumn = $('#sort-dialog-label-column');

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
                    sortcol: props.asc_getColumnSort(),
                    infilter: !!props.asc_getFilterInside()
                };

                this.lblColumn.text(props.asc_getColumnSort() ? this.textColumn : this.textRow);

                // get name from props
                this.column_data = [];
                var values = props.asc_getSortList();
                for (var i=0; i<values.length; i++) {
                    this.column_data.push({ value: i, displayValue: values[i] });
                }
                this.sort_data = [
                    { value: Asc.c_oAscSortOptions.ByValue, displayValue: this.textValues },
                    { value: Asc.c_oAscSortOptions.ByColorFill, displayValue: this.textCellColor },
                    { value: Asc.c_oAscSortOptions.ByColorFont, displayValue: this.textFontColor }
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
            this.levels = [];
            if (levels) {
                var arr = [];
                for (var i=0; i<levels.length; i++) {
                    var level = levels[i],
                        levelProps = this.props.asc_getLevelProps(level.asc_getIndex()),
                        istext = levelProps ? levelProps.asc_getIsTextData() : true,
                        iscolor = (level.asc_getSortBy() !== Asc.c_oAscSortOptions.ByValue);
                    arr.push({
                        columnIndex: level.asc_getIndex(),
                        levelIndex: i,
                        sort: level.asc_getSortBy(),
                        order: level.asc_getDescending(),
                        color: level.asc_getColor()
                    });
                    this.levels[i] = {
                        levelProps: levelProps,
                        order_data: [
                            { value: Asc.c_oAscSortOptions.Ascending, displayValue: (iscolor) ? (this.sortOptions.sortcol ? this.textTop : this.textLeft) : (istext ? this.textAZ : this.textAsc) },
                            { value: Asc.c_oAscSortOptions.Descending, displayValue: (iscolor) ? (this.sortOptions.sortcol ? this.textBelow : this.textRight): (istext ? this.textZA : this.textDesc)}
                        ]
                    };
                }
                this.sortList.store.reset(arr);
                (this.sortList.store.length>0) && this.sortList.selectByIndex(0);
            }
            this.updateButtons();
        },

        addControls: function(listView, itemView, item) {
            if (!item) return;

            var me = this,
                cmpEl = this.sortList.cmpEl,
                i = item.get('levelIndex');
            if (!this.levels[i])
                this.levels[i] = {
                    order_data: this.order_data
                };
            var level = this.levels[i];
            var el = cmpEl.find('#sort-dialog-cmb-col-' + i),
                combo = new Common.UI.ComboBox({
                    el          : el,
                    editable    : false,
                    cls         : 'input-group-nr',
                    menuCls     : 'menu-absolute',
                    menuStyle   : 'max-height: 135px;',
                    data        : this.column_data
                }).on('selected', function(combo, record) {
                    item.set('columnIndex', record.value);
                    level.levelProps = me.props.asc_getLevelProps(record.value);
                    me.updateOrderList(i);
                });
            var val = item.get('columnIndex');
            (val!==null) && combo.setValue(item.get('columnIndex'));
            level.cmbColumn = combo;

            el = cmpEl.find('#sort-dialog-cmb-sort-' + i);
            combo = new Common.UI.ComboBox({
                el          : el,
                editable    : false,
                cls         : 'input-group-nr',
                menuCls     : 'menu-absolute',
                data        : this.sort_data
            }).on('selected', function(combo, record) {
                item.set('sort', record.value);
                me.updateOrderList(i);
            });
            val = item.get('sort');
            (val!==null) && combo.setValue(val);
            level.cmbSort = combo;

            el = cmpEl.find('#sort-dialog-cmb-order-' + i);
            combo = new Common.UI.ComboBox({
                el          : el,
                editable    : false,
                cls         : 'input-group-nr',
                menuCls     : 'menu-absolute',
                data        : level.order_data
            }).on('selected', function(combo, record) {
                item.set('order', record.value);
            });
            val = item.get('order');
            (val!==null) && combo.setValue(val);
            level.cmbOrder = combo;
        },

        onOptions: function () {
            var me = this;

            var win = new SSE.Views.SortOptionsDialog({
                props: me.sortOptions,
                handler : function(result, settings) {
                    if (result == 'ok' && settings) {
                        me.sortOptions = settings;
                        me.lblColumn.text(settings.sortcol ? me.textColumn : me.textRow);
                        me.props.asc_setHasHeaders(settings.headers);
                        // me.props.asc_setCaseSensitive(settings.sensitive);
                        me.props.asc_setColumnSort(settings.sortcol);
                        me.props.asc_updateSortList();
                        me.updateSortValues();
                    }
                }
            });
            win.show();
        },

        updateSortValues: function() {
            var values = this.props.asc_getSortList();
            this.column_data = [];
            for (var i=0; i<values.length; i++) {
                this.column_data.push({ value: i, displayValue: values[i] });
            }
            var me = this;
            this.sortList.store.each(function(item) {
                var columnIndex = (item.get('sort')==Asc.c_oAscSortOptions.ByValue) ? null : 0,
                    levelIndex = item.get('levelIndex');
                item.set('columnIndex', columnIndex, {silent: true} );
                item.set('order', Asc.c_oAscSortOptions.Ascending, {silent: true} );
                me.levels[levelIndex].levelProps = (columnIndex!==null) ? me.props.asc_getLevelProps(columnIndex) : undefined;
                me.addControls(null, null, item);
                me.updateOrderList(levelIndex);

            });
        },

        onAddLevel: function() {
            var store = this.sortList.store,
                rec = this.sortList.getSelectedRec();
            rec = store.add({
                columnIndex: null,
                levelIndex: this.levels.length,
                sort: Asc.c_oAscSortOptions.ByValue,
                order: Asc.c_oAscSortOptions.Ascending
            }, {at: rec ? store.indexOf(rec)+1 : store.length});
            if (rec) {
                this.sortList.selectRecord(rec);
                this.sortList.scrollToRecord(rec);
            }
            this.updateButtons();
        },

        onCopyLevel: function() {
            var store = this.sortList.store,
                rec = this.sortList.getSelectedRec();
            rec = store.add({
                levelIndex: this.levels.length,
                columnIndex: rec ? rec.get('columnIndex') : null,
                sort: rec ? rec.get('sort') : Asc.c_oAscSortOptions.ByValue,
                order: rec ? rec.get('order') : Asc.c_oAscSortOptions.Ascending,
                color: rec ? rec.get('color') : null
            }, {at: rec ? store.indexOf(rec)+1 : store.length});
            if (rec) {
                this.sortList.selectRecord(rec);
                this.sortList.scrollToRecord(rec);
            }
            this.updateButtons();
        },

        onDeleteLevel: function() {
            var store = this.sortList.store,
                rec = this.sortList.getSelectedRec();
            if (rec) {
                var index = rec.get('levelIndex');
                this.levels[index] = undefined;
                index = store.indexOf(rec);
                store.remove(rec);
                (store.length>0) && this.sortList.selectByIndex(index<store.length ? index : store.length-1);
                this.sortList.scrollToRecord(this.sortList.getSelectedRec());
            }
            this.updateButtons();
        },

        onMoveClick: function(up) {
            var store = this.sortList.store,
                length = store.length,
                rec = this.sortList.getSelectedRec();
            if (rec) {
                var index = store.indexOf(rec);
                store.add(store.remove(rec), {at: up ? Math.max(0, index-1) : Math.min(length-1, index+1)});
                this.sortList.selectRecord(rec);
                this.sortList.scrollToRecord(rec);
            }
            this.updateMoveButtons();
        },

        onSelectLevel: function(lisvView, itemView, record) {
            this.updateMoveButtons();
        },

        updateOrderList: function(levelIndex) {
            var level = this.levels[levelIndex],
                istext = level.levelProps ? level.levelProps.asc_getIsTextData() : true,
                iscolor = (level.cmbSort.getValue() !== Asc.c_oAscSortOptions.ByValue),
                order = level.cmbOrder.getValue();
            level.order_data = [
                { value: Asc.c_oAscSortOptions.Ascending, displayValue: (iscolor) ? (this.sortOptions.sortcol ? this.textTop : this.textLeft) : (istext ? this.textAZ : this.textAsc) },
                { value: Asc.c_oAscSortOptions.Descending, displayValue: (iscolor) ? (this.sortOptions.sortcol ? this.textBelow : this.textRight): (istext ? this.textZA : this.textDesc)}
            ];
            level.cmbOrder.setData(level.order_data);
            level.cmbOrder.setValue(order);
        },

        getSettings: function() {
            var props = new Asc.CSortProperties();
            props.asc_setHasHeaders(this.sortOptions.headers);
            // props.asc_setCaseSensitive(this.sortOptions.sensitive);
            props.asc_setColumnSort(this.sortOptions.sortcol);

            var me = this,
                arr = [];
            this.sortList.store.each(function(item) {
                var columnIndex = item.get('columnIndex'),
                    levelProp = me.levels[item.get('levelIndex')];
                if (columnIndex!==null && levelProp) {
                    var level = new Asc.CSortPropertiesLevel();
                    level.asc_setIndex(columnIndex);
                    level.asc_setSortBy(levelProp.cmbSort.getValue());
                    level.asc_setDescending(levelProp.cmbOrder.getValue());
                    // level.asc_setColor(level.color);
                    arr.push(level);
                }
            });
            props.asc_setLevels(arr);
            return props;
        },

        isListValid: function() {
            var rec = this.sortList.store.findWhere({columnIndex: null});
            if (rec)
                Common.UI.warning({msg: this.errorEmpty});
            return !rec;
        },

        close: function () {
            Common.Views.AdvancedSettingsWindow.prototype.close.call(this);
        },

        onKeyDown: function (lisvView, record, e) {
            if (e.keyCode==Common.UI.Keys.DELETE && !this.btnDelete.isDisabled())
                this.onDeleteLevel();
        },

        updateButtons: function() {
            this.btnAdd.setDisabled(this.sortList.store.length>63);
            this.btnCopy.setDisabled(this.sortList.store.length<1);
            this.btnDelete.setDisabled(this.sortList.store.length<1);
            this.updateMoveButtons();
            this.sortList.scroller && this.sortList.scroller.update();
        },

        updateMoveButtons: function() {
            var rec = this.sortList.getSelectedRec(),
                index = rec ? this.sortList.store.indexOf(rec) : -1;
            this.btnUp.setDisabled(index<1);
            this.btnDown.setDisabled(index<0 || index==this.sortList.store.length-1);
        },

        txtTitle: 'Sort',
        textAdd: 'Add level',
        textDelete: 'Delete level',
        textCopy: 'Copy level',
        textColumn: 'Column',
        textRow: 'Row',
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
        textZA: 'Z to A',
        textDesc: 'Descending',
        textAsc: 'Ascending',
        textTop: 'Top',
        textBelow: 'Below',
        textLeft: 'Left',
        textRight: 'Right',
        errorEmpty: 'All sort criteria must have a column or row specified.'

    }, SSE.Views.SortDialog || {}));
});