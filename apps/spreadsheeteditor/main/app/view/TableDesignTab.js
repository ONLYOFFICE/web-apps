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
 *  TableDesignTab.js
 *
 *  Created on 07.07.2025
 *
 */

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/Button',
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Layout'
], function () {
    'use strict';

    SSE.Views.TableDesignTab = Common.UI.BaseView.extend(_.extend((function(){
        var template = '<section id="table-styles-panel" class="panel" data-tab="tabledesign" role="tabpanel" aria-labelledby="view">' +
            '<div class="group small">' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-btn-resize-table"></span>' +
                '</div>' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-btn-rows-cols"></span>' +
                '</div>' +
            '</div>' +
            '<div class="separator long"></div>' +
            '<div class="group small">' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-btn-remove-duplicates"></span>' +
                '</div>' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-btn-convert-to-range"></span>' +
                '</div>' +
            '</div>' +
            '<div class="separator long"></div>' +
            '<div class="group">' +
                '<span class="btn-slot text x-huge" id="slot-btn-insert-slicer"></span>' +
                '<span class="btn-slot text x-huge" id="slot-btn-insert-pivot"></span>' +
            '</div>' +
            '<div class="separator long"></div>' +
            '<div class="group small">' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-chk-header-row"></span>' +
                '</div>' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-chk-total-row"></span>' +
                '</div>' +
            '</div>' +
            '<div class="group small">' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-chk-first-column"></span>' +
                '</div>' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-chk-last-column"></span>' +
                '</div>' +
            '</div>' +
            '<div class="group small">' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-chk-banded-rows"></span>' +
                '</div>' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-chk-banded-columns"></span>' +
                '</div>' +
            '</div>' +
            '<div class="group small">' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-chk-filter-button"></span>' +
                '</div>' +
                '<div class="elset"></div>' +
            '</div>' +
            '<div class="separator long"></div>' +
            '<div class="group">' +
                '<span class="btn-slot text x-huge" id="slot-btn-alt-text"></span>' +
            '</div>' +
            '<div class="separator long"></div>' +
            '<div class="group flex small" id="slot-field-table-styles" style="width: 100%; min-width: 105px;" data-group-width="100%">' +
            '</div>' +
        '</section>';

        function setEvents() {
            var me = this;

            me.btnResizeTable.on('click', function (btn, e) {
                me.fireEvent('tabledesigntab:selectdata');
            });
            me.btnAltText.on('click', function (btn, e) {
                me.fireEvent('tabledesigntab:advanced');
            });
            this.tableStyles.on('click', function (combo, record) {
                me.fireEvent('tabledesigntab:style', [record]);
            });
            this.btnInsertSlicer.on('click', function (btn, e) {
                me.fireEvent('tabledesigntab:insertslicer');
            });
            this.txtTableName.on('click', function (btn, e) {
                me.fireEvent('tabledesign:namechanged');
            });
            this.btnConvertRange.on('click', function (btn, e) {
                me.fireEvent('tabledesigntab:convertrange')
            });
            this.btnInsertPivot.on('click', function () {
                me.fireEvent('pivottable:create');
            });
            this.btnRemDuplicates.on('click', function(btn){
                Common.NotificationCenter.trigger('data:remduplicates', this);
            });
            this.btnEdit.menu.on('item:click', function(menu, item, e) {
                me.fireEvent('tabledesigntab:edit', [item])
            });
            this.tableStyles.openButton.menu.on('show:after', function () {
                me.tableStyles.menuPicker.scroller.update({alwaysVisibleY: true});
            });
        }

        return {
            initialize: function (options) {
                var controller = SSE.getController('TableDesignTab');
                this._state = controller._state
                Common.UI.BaseView.prototype.initialize.call(this);

                this.lockedControls = [];

                var me = this,
                    _set = Common.enumLock;

                this.btnResizeTable = new Common.UI.Button({
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-resize-table',
                    lock: [_set.editCell, _set.selRangeEdit, _set.lostConnect, _set.coAuth, _set.wsLock, _set.cantModifyFilter],
                    caption: this.txtResize,
                    dataHint: '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'medium'
                });
                this.lockedControls.push(this.btnResizeTable);

                this.btnEdit = new Common.UI.Button({
                    cls         : 'btn-toolbar align-left',
                    iconCls     : 'toolbar__icon btn-rows-and-columns',
                    caption     : this.txtRowsCols,
                    lock: [_set.editCell, _set.selRangeEdit, _set.lostConnect, _set.coAuth, _set.wsLock,  _set.cantModifyFilter],
                    style       : 'width: 100%;',
                    menu: new Common.UI.Menu({
                        menuAlign: 'tr-br',
                        items: [
                            { caption: this.selectRowText,      value:  Asc.c_oAscChangeSelectionFormatTable.row,   idx: 0 },
                            { caption: this.selectColumnText,   value: Asc.c_oAscChangeSelectionFormatTable.column, idx: 1 },
                            { caption: this.selectColumnData,     value: Asc.c_oAscChangeSelectionFormatTable.data,   idx: 2 },
                            { caption: this.selectTableText,    value: Asc.c_oAscChangeSelectionFormatTable.all,    idx: 3 },
                            { caption: '--' },
                            { caption: this.insertRowAboveText, value: Asc.c_oAscInsertOptions.InsertTableRowAbove,     idx: 4 },
                            { caption: this.insertRowBelowText, value: Asc.c_oAscInsertOptions.InsertTableRowBelow,     idx: 5 },
                            { caption: this.insertColumnLeftText,  value: Asc.c_oAscInsertOptions.InsertTableColLeft,   idx: 6 },
                            { caption: this.insertColumnRightText, value: Asc.c_oAscInsertOptions.InsertTableColRight,  idx: 7 },
                            { caption: '--' },
                            { caption: this.deleteRowText,      value: Asc.c_oAscDeleteOptions.DeleteRows,      idx: 8 },
                            { caption: this.deleteColumnText,   value: Asc.c_oAscDeleteOptions.DeleteColumns,   idx: 9 },
                            { caption: this.deleteTableText,    value: Asc.c_oAscDeleteOptions.DeleteTable,     idx: 10 }
                        ]
                    }),
                    dataHint    : '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.btnEdit);

                this.btnEdit.menu.on('show:after', _.bind( function(menu){
                    menu.items[5].setDisabled(!this._originalProps.asc_getIsInsertRowAbove());
                    menu.items[6].setDisabled(!this._originalProps.asc_getIsInsertRowBelow());
                    menu.items[7].setDisabled(!this._originalProps.asc_getIsInsertColumnLeft());
                    menu.items[8].setDisabled(!this._originalProps.asc_getIsInsertColumnRight());

                    menu.items[10].setDisabled(!this._originalProps.asc_getIsDeleteRow());
                    menu.items[11].setDisabled(!this._originalProps.asc_getIsDeleteColumn());
                    menu.items[12].setDisabled(!this._originalProps.asc_getIsDeleteTable());
                }, this));
                this.lockedControls.push(this.btnEdit);

                this.btnRemDuplicates = new Common.UI.Button({
                    cls         : 'btn-toolbar align-left',
                    iconCls     : 'toolbar__icon btn-remove-duplicates',
                    caption     : this.txtRemDuplicates,
                    lock: [_set.editCell, _set.selRangeEdit, _set.lostConnect, _set.coAuth, _set.wsLock, _set.cantModifyFilter],
                    style       : 'width: 100%;',
                    dataHint    : '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.btnRemDuplicates);

                this.btnConvertRange = new Common.UI.Button({
                    cls         : 'btn-toolbar align-left',
                    iconCls     : 'toolbar__icon btn-convert-to-range',
                    caption     : this.txtConvertToRange,
                    lock: [_set.editCell, _set.selRangeEdit, _set.lostConnect, _set.coAuth, _set.wsLock, _set.cantModifyFilter],
                    style       : 'width: 100%;',
                    dataHint    : '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.btnConvertRange);

                this.btnInsertSlicer = new Common.UI.Button({
                    cls         : 'btn-toolbar x-huge icon-top',
                    iconCls     : 'toolbar__icon btn-big-slicer',
                    caption     : this.txtSlicer,
                    lock: [_set.editCell, _set.selRangeEdit, _set.lostConnect, _set.coAuth, _set.wsLock, _set.cantModifyFilter],
                    style       : 'width: 100%;',
                    dataHint    : '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.btnInsertSlicer);

                this.btnInsertPivot = new Common.UI.Button({
                    cls         : 'btn-toolbar x-huge icon-top',
                    iconCls     : 'toolbar__icon btn-big-pivot-sum',
                    caption     : this.txtPivot,
                    lock: [_set.editCell, _set.selRangeEdit, _set.lostConnect, _set.coAuth, _set.wsLock, _set.cantModifyFilter],
                    style       : 'width: 100%;',
                    dataHint    : '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.btnInsertPivot);

                this.chHeaderRow = new Common.UI.CheckBox({
                    labelText: this.txtHeaderRow,
                    lock        : [_set.sheetLock, _set.lostConnect, _set.coAuth, _set.editCell, _set.wsLock, _set.cantModifyFilter],
                    dataHint    : '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chHeaderRow);

                this.chTotalRow = new Common.UI.CheckBox({
                    labelText: this.txtTotalRow,
                    lock        : [_set.sheetLock, _set.lostConnect, _set.coAuth, _set.editCell, _set.wsLock, _set.cantModifyFilter],
                    dataHint    : '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chTotalRow);

                this.chFirstColumn = new Common.UI.CheckBox({
                    labelText: this.txtFirstColumn,
                    lock        : [_set.sheetLock, _set.lostConnect, _set.coAuth, _set.editCell, _set['FormatCells'], _set.cantModifyFilter],
                    dataHint    : '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chFirstColumn);

                this.chLastColumn = new Common.UI.CheckBox({
                    labelText: this.txtLastColumn,
                    lock        : [_set.sheetLock, _set.lostConnect, _set.coAuth, _set.editCell, _set['FormatCells'], _set.cantModifyFilter],
                    dataHint    : '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chLastColumn);

                this.chBandedRows = new Common.UI.CheckBox({
                    labelText: this.txtBandedRows,
                    lock        : [_set.sheetLock, _set.lostConnect, _set.coAuth, _set.editCell, _set['FormatCells'], _set.cantModifyFilter],
                    dataHint    : '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chBandedRows);

                this.chBandedColumns = new Common.UI.CheckBox({
                    labelText: this.txtBandedColumns,
                    lock        : [_set.sheetLock, _set.lostConnect, _set.coAuth, _set.editCell, _set['FormatCells'], _set.cantModifyFilter],
                    dataHint    : '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chBandedColumns);

                this.chFilterButton = new Common.UI.CheckBox({
                    labelText: this.txtFilterButton,
                    lock        : [_set.sheetLock, _set.lostConnect, _set.coAuth, _set.editCell, _set.wsLock, _set.cantModifyFilter, _set.isFilterAvailable],
                    dataHint    : '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chFilterButton);

                this.btnAltText = new Common.UI.Button({
                    cls         : 'btn-toolbar x-huge icon-top',
                    iconCls     : 'toolbar__icon btn-table-alt-text',
                    caption     : this.txtAltText,
                    lock: [_set.editCell, _set.selRangeEdit, _set.lostConnect, _set.coAuth, _set.wsLock, _set.cantModifyFilter],
                    style       : 'width: 100%;',
                    dataHint    : '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.btnAltText);

                this.txtTableName = new Common.UI.InputField({
                    el          : $('#table-txt-name'),
                    name        : 'tablename',
                    style       : 'width: 100%;',
                    validateOnBlur: false
                });
                this.lockedControls.push(this.txtTableName);

                this.tableStyles = new Common.UI.ComboDataView({
                    cls             : 'combo-table-template',
                    style           : 'min-width: 103px; max-width: 517px;',
                    enableKeyEvents : true,
                    itemWidth       : 60,
                    itemHeight      : 44,
                    menuMaxHeight   : 300,
                    groups          : new Common.UI.DataViewGroupStore(),
                    autoWidth       : true,
                    lock: [_set.editCell, _set.selRangeEdit, _set.lostConnect, _set.coAuth, _set.wsLock, _set.cantModifyFilter],
                    beforeOpenHandler: function(e) {
                        var cmp = this,
                            menu = cmp.openButton.menu,
                            columnCount = 7;

                        if (menu.cmpEl) {
                            var itemEl = $(cmp.cmpEl.find('.dataview.inner .style').get(0)).parent();
                            var itemMargin = 8;
                            var itemWidth = itemEl.is(':visible') ? parseFloat(itemEl.css('width')) :
                                (cmp.itemWidth + parseFloat(itemEl.css('padding-left')) + parseFloat(itemEl.css('padding-right')) +
                                parseFloat(itemEl.css('border-left-width')) + parseFloat(itemEl.css('border-right-width')));

                            menu.menuAlignEl = cmp.cmpEl;
                            menu.menuAlign = 'tl-tl';
                            var menuWidth = columnCount * (itemMargin + itemWidth) + 17, // for scroller
                                buttonOffsetLeft = Common.Utils.getOffset(cmp.openButton.$el).left;
                            if (menuWidth>Common.Utils.innerWidth())
                                menuWidth = Math.max(Math.floor((Common.Utils.innerWidth()-17)/(itemMargin + itemWidth)), 2) * (itemMargin + itemWidth) + 17;
                            var offset = cmp.cmpEl.width() - cmp.openButton.$el.width() - Math.min(menuWidth, buttonOffsetLeft) - 1;
                            if (Common.UI.isRTL()) {
                                offset = cmp.openButton.$el.width() + parseFloat($(cmp.$el.find('.combo-dataview').get(0)).css('padding-left'));
                            }
                            menu.setOffset(Common.UI.isRTL() ? offset : Math.min(offset, 0));

                            menu.cmpEl.css({
                                'width': menuWidth,
                                'min-height': cmp.cmpEl.height()
                            });
                        }
                    },
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: '-16, 0'
                });
                this.lockedControls.push(this.tableStyles);

                this.chHeaderRow.on('change', _.bind(this.onCheckStyleChange, this, Asc.c_oAscChangeTableStyleInfo.rowHeader, 'CheckHeader'));
                this.chTotalRow.on('change', _.bind(this.onCheckStyleChange, this, Asc.c_oAscChangeTableStyleInfo.rowTotal, 'CheckTotal'));
                this.chBandedRows.on('change', _.bind(this.onCheckStyleChange, this, Asc.c_oAscChangeTableStyleInfo.rowBanded, 'CheckBanded'));
                this.chFirstColumn.on('change', _.bind(this.onCheckStyleChange, this, Asc.c_oAscChangeTableStyleInfo.columnFirst, 'CheckFirst'));
                this.chLastColumn.on('change', _.bind(this.onCheckStyleChange, this, Asc.c_oAscChangeTableStyleInfo.columnLast, 'CheckLast'));
                this.chBandedColumns.on('change', _.bind(this.onCheckStyleChange, this, Asc.c_oAscChangeTableStyleInfo.columnBanded, 'CheckColBanded'));
                this.chFilterButton.on('change', _.bind(this.onCheckStyleChange, this, Asc.c_oAscChangeTableStyleInfo.filterButton, 'CheckFilter'));
                Common.UI.LayoutManager.addControls(this.lockedControls);
                Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            },

            onCheckStyleChange: function(type, stateName, field, newValue, oldValue, eOpts) {
                var me = this;
                me.fireEvent('tabledesigntab:stylechange', [type, stateName, newValue]);
            },

            render: function (el) {
                if ( el ) el.html( this.getPanel() );

                return this;
            },

            getPanel: function () {
                this.$el = $(_.template(template)( {} ));
                var $host = this.$el;

                this.btnResizeTable && this.btnResizeTable.render($host.find('#slot-btn-resize-table'));
                this.btnEdit && this.btnEdit.render($host.find('#slot-btn-rows-cols'));
                this.btnConvertRange && this.btnConvertRange.render($host.find('#slot-btn-convert-to-range'));
                this.btnInsertSlicer && this.btnInsertSlicer.render($host.find('#slot-btn-insert-slicer'));
                this.btnInsertPivot && this.btnInsertPivot.render($host.find('#slot-btn-insert-pivot'));
                this.chHeaderRow && this.chHeaderRow.render($host.find('#slot-chk-header-row'));
                this.chTotalRow && this.chTotalRow.render($host.find('#slot-chk-total-row'));
                this.chFirstColumn && this.chFirstColumn.render($host.find('#slot-chk-first-column'));
                this.chLastColumn && this.chLastColumn.render($host.find('#slot-chk-last-column'));
                this.chBandedRows && this.chBandedRows.render($host.find('#slot-chk-banded-rows'));
                this.chBandedColumns && this.chBandedColumns.render($host.find('#slot-chk-banded-columns'));
                this.chFilterButton && this.chFilterButton.render($host.find('#slot-chk-filter-button'));
                this.btnAltText && this.btnAltText.render($host.find('#slot-btn-alt-text'));
                this.btnRemDuplicates && this.btnRemDuplicates.render($host.find('#slot-btn-remove-duplicates'));
                this.tableStyles.render(this.$el.find('#slot-field-table-styles'));
                return this.$el;
            },

            onAppReady: function (config) {
                var me = this;
                (new Promise(function (accept, reject) {
                    accept();
                })).then(function(){
                    me.btnResizeTable.updateHint(me.tipResize);
                    me.btnEdit.updateHint(me.tipRowsCols);
                    me.btnConvertRange.updateHint(me.tipConvertRange);
                    me.btnInsertSlicer.updateHint(me.tipInsertSlicer);
                    me.btnInsertPivot.updateHint(me.tipInsertPivot);
                    me.btnAltText.updateHint(me.tipAltText);
                    me.btnRemDuplicates.updateHint(me.tipRemDuplicates);
                    setEvents.call(me);
                });
            },

            show: function () {
                Common.UI.BaseView.prototype.show.call(this);
                this.fireEvent('show', this);
            },

            getButtons: function(type) {
                if (type===undefined) {
                    return this.lockedControls;
                } else if (type==='rem-duplicates') {
                    return this.btnRemDuplicates
                }
                return [];
            },

            SetDisabled: function (state) {
                this.lockedControls && this.lockedControls.forEach(function(button) {
                    if ( button ) {
                        button.setDisabled(state);
                    }
                }, this);
            },

            txtResize: 'Resize table',
            txtRowsCols: 'Rows & Columns',
            tipRowsCols: 'Rows & Columns',
            txtGroupTable_Custom: 'Custom',
            txtGroupTable_Light: 'Light',
            txtGroupTable_Medium: 'Medium',
            txtGroupTable_Dark: 'Dark',
            tipResize: 'Change the size of this table by adding or removing rows and columns.',
            tipRemDuplicates: 'Removing duplicate lines from a sheet.',
            tipConvertRange: 'Convert this table to a regular range of cells.',
            tipInsertSlicer: 'Insert slicer',
            tipInsertPivot: 'Insert Pivot Table',
            tipHeaderRow: 'Show or hide the header row in a table.',
            tipAltText: 'Set alternative title and description for a table.',
            selectRowText: 'Select row',
            selectColumnText: 'Select entire column',
            selectColumnData: 'Select column data',
            selectTableText: 'Select table',
            insertRowAboveText: 'Insert row above',
            insertRowBelowText: 'Insert row below',
            insertColumnLeftText: 'Insert column left',
            insertColumnRightText: 'Insert column right',
            deleteRowText: 'Delete row',
            deleteColumnText: 'Delete column',
            deleteTableText: 'Delete table',
            txtRemDuplicates: 'Remove duplicates',
            txtConvertToRange: 'Convert to range',
            txtSlicer: 'Slicer',
            txtPivot: 'Pivot',
            txtHeaderRow: 'Header row',
            txtTotalRow: 'Total row',
            txtFirstColumn: 'First column',
            txtLastColumn: 'Last column',
            txtBandedRows: 'Banded rows',
            txtBandedColumns: 'Banded columns',
            txtFilterButton: 'Filter button',
            txtAltText: 'Alt text'
        }
    }()), SSE.Views.TableDesignTab || {}));
});
