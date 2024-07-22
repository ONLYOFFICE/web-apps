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
 *
 *  SortDialog.js
 *
 *  Created on 05.10.19
 *
 */

define([
    'text!spreadsheeteditor/main/app/template/SortDialog.template',
    'common/main/lib/view/AdvancedSettingsWindow',
], function (contentTemplate) {
    'use strict';

    SSE.Views = SSE.Views || {};

    var _CustomItem = Common.UI.DataViewItem.extend({
        initialize : function(options) {
            Common.UI.BaseView.prototype.initialize.call(this, options);

            var me = this;

            me.template = me.options.template || me.template;

            me.listenTo(me.model, 'change:sort', function() {
                me.render();
                me.trigger('change', me, me.model);
            });
            me.listenTo(me.model, 'change:selected', function() {
                var el = me.$el || $(me.el);
                el.toggleClass('selected', me.model.get('selected') && me.model.get('allowSelected'));
                me.onSelectChange(me.model, me.model.get('selected') && me.model.get('allowSelected'));
            });
            me.listenTo(me.model, 'remove',             me.remove);
        }
    });

    SSE.Views.SortDialog =  Common.Views.AdvancedSettingsWindow.extend(_.extend({

        options: {
            alias: 'SortDialog',
            contentWidth: 560,
            separator: false,
            buttons: ['ok', 'cancel']
        },

        initialize: function (options) {
            var me = this;
            _.extend(this.options, {
                title: this.txtTitle,
                contentStyle: 'padding: 0;',
                contentTemplate: _.template(contentTemplate)({scope: this})
            }, options);

            this.api        = options.api;
            this.handler    = options.handler;
            this.props      = options.props;
            this.levels     = [];

            this.sortOptions = {};

            this.options.handler = function(result, value) {
                if (!value) {
                    value = new Asc.CSortProperties();
                    value.asc_setSelection(options.props.asc_getSelection());
                }
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

            var span = $('<span style="position: absolute; visibility: hidden;"></span>');
            me.$window.append(span);
            span.text(this.textSortBy);
            var captionWidth = span.width();
            span.text(this.textThenBy);
            captionWidth = Math.ceil(Math.max(captionWidth, span.width()))+10;
            span.remove();

            this.sortList = new Common.UI.ListView({
                el: $('#sort-dialog-list', this.$window),
                store: new Common.UI.DataViewStore(),
                emptyText: '',
                headers: [
                    {name: me.textColumn,   width: 212},
                    {name: me.textSort,     width: 157},
                    {name: me.textOrder,    width: 156},
                ],
                template: _.template(['<div class="listview inner" style=""></div>'].join('')),
                itemTemplate: _.template([
                        '<div class="list-item" style="width: 100%;display: flex;align-items:center;" id="sort-dialog-item-<%= levelIndex %>">',
                            '<label class="level-caption" style="width: ' + captionWidth + 'px;flex-shrink:0;cursor: pointer;"></label>',
                            '<div style="display:inline-block;flex-grow: 1;">',
                                '<div style="width: 33%;padding: 0 5px;display: inline-block;vertical-align: top;"><div id="sort-dialog-cmb-col-<%= levelIndex %>" class="input-group-nr" style=""></div></div>',
                                '<div style="width: 33%;padding: 0 5px;display: inline-block;vertical-align: top;"><div id="sort-dialog-cmb-sort-<%= levelIndex %>" class="input-group-nr"></div></div>',
                                '<% if (sort==Asc.c_oAscSortOptions.ByColorFill || sort==Asc.c_oAscSortOptions.ByColorFont) { %>',
                                    '<div style="width: 17%;padding: 0 5px;display: inline-block;vertical-align: top;"><div id="sort-dialog-btn-color-<%= levelIndex %>" class="input-group-nr"></div></div>',
                                    '<div style="width: 17%;padding: 0 5px;display: inline-block;vertical-align: top;"><div id="sort-dialog-cmb-order-<%= levelIndex %>" class="input-group-nr" style=""></div></div>',
                                '<% } else { %>',
                                    '<div style="width: 34%;padding: 0 5px;display: inline-block;vertical-align: top;"><div id="sort-dialog-cmb-order-<%= levelIndex %>" class="input-group-nr" style=""></div></div>',
                                '<% } %>',
                            '</div>',
                        '</div>'
                ].join('')),
                tabindex: 1
            });
            this.sortList.createNewItem = function(record) {
                return new _CustomItem({
                    template: this.itemTemplate,
                    model: record
                });
            };
            this.sortList.on('item:select', _.bind(this.onSelectLevel, this))
                         .on('item:deselect', _.bind(this.onDeselectLevel, this))
                         .on('item:keydown', _.bind(this.onKeyDown, this))
                         .on('item:remove', _.bind(this.onRemoveLevel, this))
                         .on('entervalue', _.bind(this.onPrimary, this));
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
                parentEl: $('#sort-dialog-btn-up'),
                cls: 'btn-toolbar bg-white',
                iconCls: 'caret-up',
                scaling: false,
                hint: this.textUp
            });
            this.btnUp.on('click', _.bind(this.onMoveClick, this, true));

            this.btnDown = new Common.UI.Button({
                parentEl: $('#sort-dialog-btn-down'),
                cls: 'btn-toolbar bg-white',
                iconCls: 'caret-down',
                scaling: false,
                hint: this.textDown
            });
            this.btnDown.on('click', _.bind(this.onMoveClick, this, false));

            this.afterRender();
        },

        afterRender: function() {
            this._setDefaults(this.props);
        },

        getDefaultFocusableComponent: function () {
            return this.sortList;
        },

        _setDefaults: function (props) {
            Common.UI.FocusManager.add(this, [ this.btnAdd, this.btnDelete, this.btnCopy, this.btnOptions, this.btnUp, this.btnDown, this.sortList ].concat(this.getFooterButtons()));
            if (props) {
                this.sortOptions = {
                    headers: props.asc_getHasHeaders(),
                    // sensitive: props.asc_getCaseSensitive(),
                    sortcol: props.asc_getColumnSort(),
                    lockHeaders: !!props.asc_getLockChangeHeaders(),
                    lockOrientation: !!props.asc_getLockChangeOrientation()
                };

                this.sortList.setHeaderName(0, (props.asc_getColumnSort() ? this.textColumn : this.textRow));

                // get name from props
                this.fillSortValues();

                this.sort_data = [
                    { value: Asc.c_oAscSortOptions.ByValue, displayValue: this.textValues },
                    { value: Asc.c_oAscSortOptions.ByColorFill, displayValue: this.textCellColor },
                    { value: Asc.c_oAscSortOptions.ByColorFont, displayValue: this.textFontColor }
                ];
                this.order_data = [
                    { value: Asc.c_oAscSortOptions.Ascending, displayValue: this.textAZ },
                    { value: Asc.c_oAscSortOptions.Descending, displayValue: this.textZA }
                    ];

                this.sortList.on('item:add', _.bind(this.addControls, this, false));
                this.sortList.on('item:change', _.bind(this.addControls, this, true));
                this.refreshList(props.asc_getLevels());
                this.initListHeaders();
            }
        },

        refreshList: function(levels) {
            this.levels = [];

            var arr = [];
            if (!levels && this.column_data.length==1) {
                levels = [{
                    columnIndex: this.column_data[0].value,
                    sort: Asc.c_oAscSortOptions.ByValue,
                    order: Asc.c_oAscSortOptions.Ascending
                }];
            }
            if (levels) {
                for (var i=0; i<levels.length; i++) {
                    var level = levels[i],
                        columnIndex = level.asc_getIndex ? level.asc_getIndex() : level.columnIndex,
                        levelProps = this.props.asc_getLevelProps(columnIndex),
                        levelSort = level.asc_getSortBy ? level.asc_getSortBy() : level.sort,
                        istext = levelProps ? levelProps.asc_getIsTextData() : true,
                        iscolor = (levelSort !== Asc.c_oAscSortOptions.ByValue);
                    arr.push({
                        columnIndex: columnIndex,
                        levelIndex: i,
                        sort: levelSort,
                        order: level.asc_getDescending ? level.asc_getDescending() : level.order,
                        color: level.asc_getColor ? level.asc_getColor() : undefined
                    });
                    if (iscolor) {
                        var color_data = [];
                        var me = this;
                        if (levelProps) {
                            var levelColors = (levelSort==Asc.c_oAscSortOptions.ByColorFill) ? levelProps.asc_getColorsFill() : levelProps.asc_getColorsFont();
                            levelColors.forEach(function(item, index) {
                                if (item) {
                                    var value = Common.Utils.ThemeColor.getHexColor(item.get_r(), item.get_g(), item.get_b()).toLocaleUpperCase();
                                    color_data.push({
                                        value: value,
                                        displayValue: '',
                                        color: item,
                                        styleObj: {'background-color': '#' + value},
                                        styleStr: 'background-color: #' + value + ';'
                                    });
                                } else
                                    color_data.unshift({ value: -1, displayValue: (levelSort==Asc.c_oAscSortOptions.ByColorFill) ? me.textNone : me.textAuto , color: null,
                                                                styleObj: {'background-color': 'transparent' }, styleStr: 'background-color:transparent;'});
                            });
                        }
                    }
                    this.levels[i] = {
                        levelProps: levelProps,
                        order_data: [
                            { value: Asc.c_oAscSortOptions.Ascending, displayValue: (iscolor) ? (this.sortOptions.sortcol ? this.textTop : this.textLeft) : (istext ? this.textAZ : this.textAsc) },
                            { value: Asc.c_oAscSortOptions.Descending, displayValue: (iscolor) ? (this.sortOptions.sortcol ? this.textBelow : this.textRight): (istext ? this.textZA : this.textDesc)}
                        ],
                        color_data: color_data
                    };
                }
            } else {
                arr.push({
                    columnIndex: null,
                    levelIndex: 0,
                    sort: Asc.c_oAscSortOptions.ByValue,
                    order: Asc.c_oAscSortOptions.Ascending
                });
            }
            this.beforeLevelsReset(this.sortList.store);
            this.sortList.store.reset(arr);
            (this.sortList.store.length>0) && this.sortList.selectByIndex(0);
            var me = this;
            setTimeout(function(){
                me.sortList.focus();
            }, 1);

            this.updateButtons();
        },

        initListHeaders: function() {
            var isRTL = Common.UI.isRTL(),
                firstLabelWidth = 0,
                secondLabelWidth = 0,
                thirdLabelWidth = 0,
                cmbEl = this.sortList.cmpEl.find('#sort-dialog-cmb-sort-0'),
                widthHeaderEl = this.sortList.headerEl.width(),
                paddingHeaderEl = parseFloat(this.sortList.headerEl.css(isRTL ? 'padding-right' : 'padding-left')),
                pos = cmbEl.position();

            if(isRTL) {
                pos && (firstLabelWidth = widthHeaderEl + paddingHeaderEl - (Math.floor(pos.left) + cmbEl.width()));
            }
            else {
                pos && (firstLabelWidth = Math.floor(pos.left) - paddingHeaderEl);
            }
            
            cmbEl = this.sortList.cmpEl.find('#sort-dialog-btn-color-0');
            (!cmbEl[0]) && (cmbEl = this.sortList.cmpEl.find('#sort-dialog-cmb-order-0'));
            pos = cmbEl.position();

            if(isRTL) {
                pos && (secondLabelWidth = (widthHeaderEl + paddingHeaderEl - (Math.floor(pos.left) + cmbEl.width())) - firstLabelWidth);
            }
            else {
                pos && (secondLabelWidth = Math.floor(pos.left)-paddingHeaderEl - firstLabelWidth);
            }

            thirdLabelWidth = widthHeaderEl - firstLabelWidth - secondLabelWidth;
            
            this.sortList.setHeaderWidth(0, firstLabelWidth);
            this.sortList.setHeaderWidth(1, secondLabelWidth);
            this.sortList.setHeaderWidth(2, thirdLabelWidth);
        },

        onShowMenu: function() {
            this.sortList.enableKeyEvents = false;
        },

        onHideMenu: function() {
            this.sortList.enableKeyEvents = true;
        },

        addControls: function(fromChange, listView, itemView, item) {
            if (!item) return;

            var me = this,
                i = item.get('levelIndex'),
                cmpEl = this.sortList.cmpEl.find('#sort-dialog-item-' + i),
                comboarr = [];
            if (!this.levels[i])
                this.levels[i] = {
                    order_data: this.order_data
                };
            var level = this.levels[i];
            var combo = new Common.UI.ComboBox({
                el          : cmpEl.find('#sort-dialog-cmb-col-' + i),
                editable    : false,
                cls         : 'input-group-nr',
                menuCls     : 'menu-absolute',
                menuStyle   : 'max-height: 135px;',
                takeFocusOnClose: true,
                data        : this.column_data
            }).on('selected', function(combo, record) {
                if (record.value==-1) {
                    var index = item.get('columnIndex');
                    combo.setValue(index!==null ? index : '');
                    me.onSelectOther(combo, item);
                } else {
                    item.set('columnIndex', record.value);
                    level.levelProps = me.props.asc_getLevelProps(record.value);
                    me.updateOrderList(i, item, true);
                }
            });
            var val = item.get('columnIndex');
            (val!==null) && combo.setValue(item.get('columnIndex'));
            level.cmbColumn = combo;
            comboarr.push(combo);
            combo.on('show:after', _.bind(this.onShowMenu, this));
            combo.on('hide:after', _.bind(this.onHideMenu, this));

            combo = new Common.UI.ComboBox({
                el          : cmpEl.find('#sort-dialog-cmb-sort-' + i),
                editable    : false,
                cls         : 'input-group-nr',
                menuCls     : 'menu-absolute',
                takeFocusOnClose: true,
                data        : this.sort_data
            }).on('selected', function(combo, record) {
                item.set('sort', record.value);
                me.updateOrderList(i, item);
            });
            val = item.get('sort');
            (val!==null) && combo.setValue(val);
            level.cmbSort = combo;
            comboarr.push(combo);
            combo.on('show:after', _.bind(this.onShowMenu, this));
            combo.on('hide:after', _.bind(this.onHideMenu, this));

            var sort = item.get('sort');
            if (sort==Asc.c_oAscSortOptions.ByColorFill || sort==Asc.c_oAscSortOptions.ByColorFont) {
                combo = new Common.UI.ComboBoxColor({
                    el          : cmpEl.find('#sort-dialog-btn-color-' + i),
                    editable    : false,
                    menuCls     : 'menu-absolute',
                    menuStyle   : 'max-height: 135px;',
                    takeFocusOnClose: true,
                    data        : level.color_data,
                    disabled    : !level.color_data || level.color_data.length<1
                }).on('selected', function(combo, record) {
                    item.set('color', record.color);
                });
                val = item.get('color');
                combo.setValue(val ? Common.Utils.ThemeColor.getHexColor(val.get_r(), val.get_g(), val.get_b()).toLocaleUpperCase() : -1);
                var rec = combo.getSelectedRecord();
                rec && item.set('color', rec.color);
                level.cmbColor = combo;
                comboarr.push(combo);
                combo.on('show:after', _.bind(this.onShowMenu, this));
                combo.on('hide:after', _.bind(this.onHideMenu, this));
            }

            combo = new Common.UI.ComboBox({
                el          : cmpEl.find('#sort-dialog-cmb-order-' + i),
                editable    : false,
                cls         : 'input-group-nr',
                menuCls     : 'menu-absolute',
                takeFocusOnClose: true,
                data        : level.order_data
            }).on('selected', function(combo, record) {
                item.set('order', record.value);
            });
            val = item.get('order');
            (val!==null) && combo.setValue(val);
            level.cmbOrder = combo;
            comboarr.push(combo);
            combo.on('show:after', _.bind(this.onShowMenu, this));
            combo.on('hide:after', _.bind(this.onHideMenu, this));

            cmpEl.on('mousedown', '.combobox', function(){
                me.sortList.selectRecord(item);
            });
            item.set('controls', {combobox: comboarr}, {silent: true});
            fromChange && setTimeout(function(){
                listView.focus();
            }, 1);
            this.updateLevelCaptions(true);
        },

        onOptions: function () {
            var me = this;

            var win = new SSE.Views.SortOptionsDialog({
                props: me.sortOptions,
                handler : function(result, settings) {
                    if (result == 'ok' && settings) {
                        me.sortList.setHeaderName(0, settings.sortcol ? me.textColumn : me.textRow);
                        me.props.asc_setHasHeaders(settings.headers);
                        // me.props.asc_setCaseSensitive(settings.sensitive);
                        me.props.asc_setColumnSort(settings.sortcol);
                        var saveOrient = (me.sortOptions.sortcol == settings.sortcol);
                        me.props.asc_updateSortList(saveOrient);
                        me.sortOptions = settings;
                        me.updateSortValues(saveOrient);
                    }
                }
            }).on('close', function() {
                me.btnOptions.focus();
            });
            win.show();
        },

        fillSortValues: function() {
            var values = this.props.asc_getSortList(),
                len = values.length;
            this.column_data = [];
            for (var i=0; i<len; i++) {
                if (values[i]==undefined) continue;
                this.column_data.push({ value: i, displayValue: values[i] });
            }
            if (this.column_data.length>=500)
                this.column_data.push({ value: -1, displayValue: this.sortOptions.sortcol ? this.textMoreCols : this.textMoreRows });
        },

        updateSortValues: function(saveOrient) {
            this.fillSortValues();
            var me = this;
            this.sortList.store.each(function(item) {
                var columnIndex = saveOrient ? item.get('columnIndex') : 0,
                    levelIndex = item.get('levelIndex');
                if (!saveOrient) {
                    item.set('columnIndex', columnIndex, {silent: true} );
                    item.set('color', null, {silent: true} );
                }
                me.levels[levelIndex].levelProps = (columnIndex!==null) ? me.props.asc_getLevelProps(columnIndex) : undefined;
                me.addControls(false, null, null, item);
                me.updateOrderList(levelIndex, item, true);
            });
        },

        onAddLevel: function() {
            var store = this.sortList.store,
                rec = this.sortList.getSelectedRec(),
                columnIndex = (this.column_data.length==1) ? this.column_data[0].value : null,
                levelIndex = this.levels.length;
            if (columnIndex!==null) {
                var levelProps = this.props.asc_getLevelProps(columnIndex),
                    istext = levelProps ? levelProps.asc_getIsTextData() : true;
                this.levels[levelIndex] = {
                    levelProps: levelProps,
                    order_data: [
                        { value: Asc.c_oAscSortOptions.Ascending, displayValue: (istext ? this.textAZ : this.textAsc) },
                        { value: Asc.c_oAscSortOptions.Descending, displayValue: (istext ? this.textZA : this.textDesc)}
                    ]
                };
            }

            rec = store.add({
                columnIndex: columnIndex,
                levelIndex: levelIndex,
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
                rec = this.sortList.getSelectedRec(),
                levelIndex = this.levels.length,
                copyLevel = this.levels[rec ? rec.get('levelIndex') : null];

            this.levels[levelIndex] = {
                levelProps: copyLevel ? copyLevel.levelProps : null,
                order_data: copyLevel ? copyLevel.order_data : null,
                color_data: copyLevel ? copyLevel.color_data : null
            };
            rec = store.add({
                levelIndex: levelIndex,
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
                this.onHideMenu();
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
                this.onHideMenu();
            }
            this.updateMoveButtons();
            this.updateLevelCaptions();
        },

        onSelectLevel: function(listView, itemView, record, fromKeyDown) {
            this.updateMoveButtons();
            if (record && record.get('controls')) {
                var controls = record.get('controls'),
                    res = Common.UI.FocusManager.insert(this, controls.combobox, -1 * this.getFooterButtons().length);
                (res!==undefined) && (controls.index = res);
                fromKeyDown && setTimeout(function(){
                    listView.focus();
                }, 1);
            }
        },

        onDeselectLevel: function(listView, itemView, record) {
            if (record && record.get('controls')) {
                var controls = record.get('controls');
                Common.UI.FocusManager.remove(this, controls.index, controls.combobox.length);
                controls.index = undefined;
            }
        },

        onRemoveLevel: function(listView, itemView, record) {
            if (record && record.get('selected') && record.get('controls')) {
                var controls = record.get('controls');
                Common.UI.FocusManager.remove(this, controls.index, controls.combobox.length);
                controls.index = undefined;
            }
        },

        beforeLevelsReset: function(store) {
            for (var i=0; i<store.length; i++) {
                var item = store.at(i);
                if (item) {
                    var controls = item.get('controls');
                    if (controls && controls.index!==undefined) {
                        Common.UI.FocusManager.remove(this, controls.index, controls.combobox.length);
                        break;
                    }
                }
            }
        },

        updateOrderList: function(levelIndex, storeItem, saveColor) {
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

            if (iscolor) {
                level.color_data = [];
                var color = storeItem ? storeItem.get('color') : null,
                    colorValue = color ? Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()).toLocaleUpperCase() : -1,
                    current;

                if (level.levelProps) {
                    var me = this;
                    var levelColors = (level.cmbSort.getValue()==Asc.c_oAscSortOptions.ByColorFill) ? level.levelProps.asc_getColorsFill() : level.levelProps.asc_getColorsFont();
                    levelColors.forEach(function(item, index) {
                        var value = item ? Common.Utils.ThemeColor.getHexColor(item.get_r(), item.get_g(), item.get_b()).toLocaleUpperCase() : -1,
                            color_data = {
                                value: value,
                                displayValue: item ? '' : ((level.cmbSort.getValue()==Asc.c_oAscSortOptions.ByColorFill) ? me.textNone : me.textAuto),
                                color: item,
                                styleObj: {'background-color': item ? '#' + value : 'transparent' },
                                styleStr: item ? 'background-color: #' + value + ';' : 'background-color:transparent;'
                            };
                        item ? level.color_data.push(color_data) : level.color_data.unshift(color_data);
                        if (colorValue == color_data.value)
                            current = colorValue;
                    });
                }
                level.cmbColor.setData(level.color_data);
                level.cmbColor.setDisabled(level.color_data.length<1);
                (level.color_data.length>0) && level.cmbColor.setValue(current && saveColor ? current : level.color_data[0].value);
                var rec = level.cmbColor.getSelectedRecord();
                rec && storeItem && storeItem.set('color', rec.color);
            }
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
                    if (levelProp.cmbSort.getValue() == Asc.c_oAscSortOptions.ByColorFill || levelProp.cmbSort.getValue()==Asc.c_oAscSortOptions.ByColorFont) {
                        var rec = levelProp.cmbColor.getSelectedRecord();
                        if (rec) {
                            level.asc_setColor(rec.color);
                        }
                    }
                    arr.push(level);
                }
            });
            props.asc_setLevels(arr);
            props.asc_setSelection(this.props.asc_getSelection());
            return props;
        },

        isListValid: function() {
            var me = this,
                rec = this.sortList.store.findWhere({columnIndex: null}),
                callback = function(btn){
                    me.sortList.focus();
                };
            if (rec)
                Common.UI.warning({msg: this.errorEmpty, callback: callback});
            else {
                var store = this.sortList.store,
                    len = store.length;
                for (var index=0; index<len; index++) {
                    var item = store.at(index),
                        levelProp = this.levels[item.get('levelIndex')],
                        sort = levelProp.cmbSort.getValue(),
                        color = (sort == Asc.c_oAscSortOptions.ByColorFill || sort==Asc.c_oAscSortOptions.ByColorFont) ? levelProp.cmbColor.getSelectedRecord() : null;
                    for (var i=index-1; i>=0; i--) {
                        var itemcheck = store.at(i),
                            levelcheck = this.levels[itemcheck.get('levelIndex')];
                        if (item.get('columnIndex') == itemcheck.get('columnIndex') && sort == levelcheck.cmbSort.getValue()) {
                            if (sort == Asc.c_oAscSortOptions.ByColorFill || sort==Asc.c_oAscSortOptions.ByColorFont) {
                                var colorcheck = levelcheck.cmbColor.getSelectedRecord();
                                if (color && colorcheck && color.value == colorcheck.value) {
                                    rec = levelProp.cmbColumn.getSelectedRecord().displayValue;
                                    rec = this.errorSameColumnColor.replace('%1', rec);
                                    break;
                                }
                            } else {
                                rec = levelProp.cmbColumn.getSelectedRecord().displayValue;
                                rec = this.errorSameColumnValue.replace('%1', rec);
                                break;
                            }
                        }
                    }
                    if (rec)
                        break;
                }
                rec && Common.UI.warning({msg: rec, callback: callback});
            }
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
            this.updateLevelCaptions(true);
            this.sortList.scroller && this.sortList.scroller.update();
        },

        updateMoveButtons: function() {
            var rec = this.sortList.getSelectedRec(),
                index = rec ? this.sortList.store.indexOf(rec) : -1;
            this.btnUp.setDisabled(index<1);
            this.btnDown.setDisabled(index<0 || index==this.sortList.store.length-1);
        },

        updateLevelCaptions: function(all) {
            var captions = this.$window.find('.level-caption');
            if (captions.length<1) return;

            if (all)
                captions.text(this.textThenBy);
            else
                (captions.length>1) && (captions[1].innerText = this.textThenBy);
            captions[0].innerText = this.textSortBy;
        },

        onSelectOther: function(combo, item) {
            var me = this;
            if (me.api) {
                var handlerDlg = function(dlg, result) {
                    if (result == 'ok') {
                        var range = dlg.getSettings();
                        var isvalid;
                        if (!_.isEmpty(range)) {
                            isvalid = me.api.asc_checkDataRange(Asc.c_oAscSelectionDialogType.CustomSort, range, true, !me.sortOptions.sortcol);
                        }

                        if (isvalid == Asc.c_oAscError.ID.No) {
                            var index = me.props.asc_addBySortList(range);
                            me.fillSortValues();
                            combo.setData(me.column_data);
                            combo.setValue(index);
                            item.set('columnIndex', index);
                            me.levels[item.get('levelIndex')].levelProps = me.props.asc_getLevelProps(index);
                            me.updateOrderList(item.get('levelIndex'), item, true);
                            return false;
                        } else if (isvalid == Asc.c_oAscError.ID.CustomSortMoreOneSelectedError)
                            Common.UI.warning({msg: me.sortOptions.sortcol ? me.errorMoreOneCol: me.errorMoreOneRow});
                        else if (isvalid == Asc.c_oAscError.ID.CustomSortNotOriginalSelectError)
                            Common.UI.warning({msg: me.sortOptions.sortcol ? me.errorNotOriginalCol : me.errorNotOriginalRow});
                        else
                            Common.UI.warning({msg: me.txtInvalidRange});
                        return true;
                    }
                };

                var win = new SSE.Views.CellRangeDialog({
                    handler: handlerDlg
                }).on('close', function() {
                    me.show();
                });

                var xy = me.$window.offset();
                me.hide();
                win.show(xy.left + 65, xy.top + 77);
                win.setSettings({
                    api     : me.api,
                    range   : me.props.asc_getRangeStr(),
                    type    : Asc.c_oAscSelectionDialogType.CustomSort
                });
            }
        },

        txtTitle: 'Sort',
        textLevels: 'Levels',
        textBtnNew: 'New',
        textBtnDelete: 'Delete',
        textBtnCopy: 'Copy',
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
        textAZ: 'A to Z',
        textZA: 'Z to A',
        textDesc: 'Descending',
        textAsc: 'Ascending',
        textTop: 'Top',
        textBelow: 'Below',
        textLeft: 'Left',
        textRight: 'Right',
        errorEmpty: 'All sort criteria must have a column or row specified.',
        textAuto: 'Auto',
        textNone: 'None',
        errorNotOriginalCol: 'The column you selected is not in the original selected range.',
        errorNotOriginalRow: 'The row you selected is not in the original selected range.',
        errorMoreOneRow: 'More than one row is selected.',
        errorMoreOneCol: 'More than one column is selected.',
        txtInvalidRange: 'Invalid cells range.',
        textMoreRows: '(More rows...)',
        textMoreCols: '(More columns...)',
        errorSameColumnValue: "%1 is being sorted by values more than once.<br>Delete the duplicate sort criteria and try again.",
        errorSameColumnColor: "%1 is being sorted by the same color more than once.<br>Delete the duplicate sort criteria and try again.",
        textSortBy: 'Sort by',
        textThenBy: 'Then by'
    }, SSE.Views.SortDialog || {}));
});