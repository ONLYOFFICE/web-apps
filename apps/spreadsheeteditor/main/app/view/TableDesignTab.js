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
            '<div class="group doc-preview">' +
                '<span class="btn-slot text x-huge" id="slot-btn-insert-slicer"></span>' +
                '<span class="btn-slot text x-huge" id="slot-btn-insert-pivot"></span>' +
            '</div>' +
            '<div class="separator long"></div>' +
            '<div class="group small sheet-formula">' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-chk-header-row"></span>' +
                '</div>' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-chk-total-row"></span>' +
                '</div>' +
            '</div>' +
            '<div class="group small sheet-gridlines">' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-chk-first-column"></span>' +
                '</div>' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-chk-last-column"></span>' +
                '</div>' +
            '</div>' +
            '<div class="group small sheet-gridlines">' +
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
            '<div class="group doc-preview">' +
                '<span class="btn-slot text x-huge" id="slot-btn-alt-text"></span>' +
            '</div>' +
            '<div class="separator long invisible"></div>' +
            '<div class="group flex small" id="slot-field-table-styles" style="width: 100%; min-width: 105px;" data-group-width="100%">' +
            '</div>' +
        '</section>';

        function setEvents() {
            var me = this;

            me.btnResizeTable.on('click', function (btn, e) {
                me.fireEvent('tabledesigntab:selectdata');
            });
            me.btnAltText.on('click', function (btn, e) {
                me.fireEvent('tabledesigntab:advanced')
            });
            this.tableStyles.on('click', function (combo, record) {
                me.fireEvent('tabledesigntab:style', [record]);
            });
            this.tableStyles.openButton.menu.on('show:after', function () {
                me.tableStyles.menuPicker.scroller.update({alwaysVisibleY: true});
            });
        }

        return {
            options: {},

            initialize: function (options) {
                this.lockedControls = [];
                this._locked = false;
                this.wsLock = false;
                this.wsProps = [];
                this.isEditCell = false;
                var controller = SSE.getController('TableDesignTab');
                this._state = controller._state
                this._noApply = false;
                Common.UI.BaseView.prototype.initialize.call(this);
                this.toolbar = options.toolbar;
                this.appConfig = options.mode;

                this.lockedControls = [];

                var me = this,
                    _set = Common.enumLock;

                if ( me.appConfig.canFeatureViews && me.appConfig.isEdit ) {
                    this.btnResizeTable = new Common.UI.Button({
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-resize-table',
                        lock: [_set.editCell, _set.editText, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.selSlicer, _set.selRangeEdit, _set.lostConnect, _set.coAuth, _set.wsLock],
                        caption: 'Resize table',
                        dataHint: '1',
                        dataHintDirection: 'left',
                        dataHintOffset: 'medium'
                    });
                    // this.btnResizeTable.on('click', _.bind(this.onSelectData, this));
                    this.lockedControls.push(this.btnResizeTable);

                    this.btnEdit = new Common.UI.Button({
                        cls         : 'btn-toolbar align-left',
                        iconCls     : 'toolbar__icon btn-rows-and-columns',
                        caption     : 'Rows & Columns',
                        style       : 'width: 100%;',
                        menu: new Common.UI.Menu({
                            menuAlign: 'tr-br',
                            items: [
                                { caption: 'Select row',      value:  Asc.c_oAscChangeSelectionFormatTable.row,   idx: 0 },
                                { caption: 'Select entire column',   value: Asc.c_oAscChangeSelectionFormatTable.column, idx: 1 },
                                { caption: 'Select column data',     value: Asc.c_oAscChangeSelectionFormatTable.data,   idx: 2 },
                                { caption: 'Select table',    value: Asc.c_oAscChangeSelectionFormatTable.all,    idx: 3 },
                                { caption: '--' },
                                { caption: 'Insert row above', value: Asc.c_oAscInsertOptions.InsertTableRowAbove,     idx: 4 },
                                { caption: 'Insert row below', value: Asc.c_oAscInsertOptions.InsertTableRowBelow,     idx: 5 },
                                { caption: 'Insert column left',  value: Asc.c_oAscInsertOptions.InsertTableColLeft,   idx: 6 },
                                { caption: 'Insert column right', value: Asc.c_oAscInsertOptions.InsertTableColRight,  idx: 7 },
                                { caption: '--' },
                                { caption: 'Delete row',      value: Asc.c_oAscDeleteOptions.DeleteRows,      idx: 8 },
                                { caption: 'Delete column',   value: Asc.c_oAscDeleteOptions.DeleteColumns,   idx: 9 },
                                { caption: 'Delete table',    value: Asc.c_oAscDeleteOptions.DeleteTable,     idx: 10 }
                            ]
                        }),
                        dataHint    : '1',
                        dataHintDirection: 'left',
                        dataHintOffset: 'small'
                    });

                    this.btnEdit.menu.on('show:after', _.bind( function(menu){
                        if (this.api) {
                            menu.items[5].setDisabled(!this._originalProps.asc_getIsInsertRowAbove());
                            menu.items[6].setDisabled(!this._originalProps.asc_getIsInsertRowBelow());
                            menu.items[7].setDisabled(!this._originalProps.asc_getIsInsertColumnLeft());
                            menu.items[8].setDisabled(!this._originalProps.asc_getIsInsertColumnRight());

                            menu.items[10].setDisabled(!this._originalProps.asc_getIsDeleteRow());
                            menu.items[11].setDisabled(!this._originalProps.asc_getIsDeleteColumn());
                            menu.items[12].setDisabled(!this._originalProps.asc_getIsDeleteTable());
                        }
                    }, this));
                    this.btnEdit.menu.on('item:click', _.bind(this.onEditClick, this));
                    this.lockedControls.push(this.btnEdit);

                    this.btnRemDuplicates = new Common.UI.Button({
                        cls         : 'btn-toolbar align-left',
                        iconCls     : 'toolbar__icon btn-remove-duplicates',
                        caption     : 'Remove duplicates',
                        style       : 'width: 100%;',
                        dataHint    : '1',
                        dataHintDirection: 'left',
                        dataHintOffset: 'small'
                    });
                    this.btnRemDuplicates.on('click', _.bind(function(btn){
                        Common.NotificationCenter.trigger('data:remduplicates', this);
                    }, this));
                    this.lockedControls.push(this.btnRemDuplicates);

                    this.btnConvertRange = new Common.UI.Button({
                        cls         : 'btn-toolbar align-left',
                        iconCls     : 'toolbar__icon btn-convert-to-range',
                        caption     : 'Convert to range',
                        style       : 'width: 100%;',
                        dataHint    : '1',
                        dataHintDirection: 'left',
                        dataHintOffset: 'small'
                    });

                    this.btnConvertRange.on('click', _.bind(function(btn){
                        if (this.api) this.api.asc_convertTableToRange(this._state.TableName);
                        Common.NotificationCenter.trigger('edit:complete', this);
                    }, this));
                    this.lockedControls.push(this.btnConvertRange);

                    this.btnInsertSlicer = new Common.UI.Button({
                        cls         : 'btn-toolbar x-huge icon-top',
                        iconCls     : 'toolbar__icon btn-big-slicer',
                        caption     : 'Slicer',
                        style       : 'width: 100%;',
                        dataHint    : '1',
                        dataHintDirection: 'left',
                        dataHintOffset: 'small'
                    });
                    this.btnInsertSlicer.on('click', _.bind(this.onInsertSlicerClick, this));
                    this.lockedControls.push(this.btnInsertSlicer);

                    this.btnInsertPivot = new Common.UI.Button({
                        cls         : 'btn-toolbar x-huge icon-top',
                        iconCls     : 'toolbar__icon btn-big-pivot-sum',
                        caption     : 'Pivot',
                        style       : 'width: 100%;',
                        dataHint    : '1',
                        dataHintDirection: 'left',
                        dataHintOffset: 'small'
                    });
                    this.btnInsertPivot.on('click', _.bind(this.onInsertPivotClick, this));
                    this.lockedControls.push(this.btnInsertPivot);

                    this.chHeaderRow = new Common.UI.CheckBox({
                        labelText: 'Header row',
                        lock        : [_set.sheetLock, _set.lostConnect, _set.coAuth, _set.editCell],
                        dataHint    : '1',
                        dataHintDirection: 'left',
                        dataHintOffset: 'small'
                    });
                    this.lockedControls.push(this.chHeaderRow);

                    this.chTotalRow = new Common.UI.CheckBox({
                        labelText: 'Total row',
                        lock        : [_set.sheetLock, _set.lostConnect, _set.coAuth, _set.editCell],
                        dataHint    : '1',
                        dataHintDirection: 'left',
                        dataHintOffset: 'small'
                    });
                    this.lockedControls.push(this.chTotalRow);

                    this.chFirstColumn = new Common.UI.CheckBox({
                        labelText: 'First column',
                        lock        : [_set.sheetLock, _set.lostConnect, _set.coAuth, _set.editCell],
                        dataHint    : '1',
                        dataHintDirection: 'left',
                        dataHintOffset: 'small'
                    });
                    this.lockedControls.push(this.chFirstColumn);

                    this.chLastColumn = new Common.UI.CheckBox({
                        labelText: 'Last column',
                        lock        : [_set.sheetLock, _set.lostConnect, _set.coAuth, _set.editCell],
                        dataHint    : '1',
                        dataHintDirection: 'left',
                        dataHintOffset: 'small'
                    });
                    this.lockedControls.push(this.chLastColumn);

                    this.chBandedRows = new Common.UI.CheckBox({
                        labelText: 'Banded rows',
                        lock        : [_set.sheetLock, _set.lostConnect, _set.coAuth, _set.editCell],
                        dataHint    : '1',
                        dataHintDirection: 'left',
                        dataHintOffset: 'small'
                    });
                    this.lockedControls.push(this.chBandedRows);

                    this.chBandedColumns = new Common.UI.CheckBox({
                        labelText: 'Banded columns',
                        lock        : [_set.sheetLock, _set.lostConnect, _set.coAuth, _set.editCell],
                        dataHint    : '1',
                        dataHintDirection: 'left',
                        dataHintOffset: 'small'
                    });
                    this.lockedControls.push(this.chBandedColumns);

                    this.chFilterButton = new Common.UI.CheckBox({
                        labelText: 'Filter button',
                        lock        : [_set.sheetLock, _set.lostConnect, _set.coAuth, _set.editCell],
                        dataHint    : '1',
                        dataHintDirection: 'left',
                        dataHintOffset: 'small'
                    });
                    this.lockedControls.push(this.chFilterButton);

                    this.btnAltText = new Common.UI.Button({
                        cls         : 'btn-toolbar x-huge icon-top',
                        iconCls     : 'toolbar__icon btn-big-pivot-sum',
                        caption     : 'Alt text',
                        style       : 'width: 100%;',
                        dataHint    : '1',
                        dataHintDirection: 'left',
                        dataHintOffset: 'small'
                    });
                    this.lockedControls.push(this.btnAltText);

                    this.txtTableName = new Common.UI.InputField({
                        el          : $('#table-txt-name'),
                        name        : 'tablename',
                        style       : 'width: 100%;',
                        validateOnBlur: false
                    });
                    this.txtTableName.on('changed:after', _.bind(this.onTableNameChanged, this));
                    this.lockedControls.push(this.txtTableName);

                    this.tableStyles = new Common.UI.ComboDataView({
                        cls             : 'combo-pivot-template',
                        style           : 'min-width: 103px; max-width: 517px;',
                        enableKeyEvents : true,
                        itemWidth       : 61,
                        itemHeight      : 49,
                        menuMaxHeight   : 300,
                        groups          : new Common.UI.DataViewGroupStore(),
                        autoWidth       : true,
                        lock        : [_set.lostConnect, _set.coAuth, _set.selRangeEdit, _set['FormatCells']],
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
                }

                if (me.appConfig.isEdit) {

                }
                this.chHeaderRow.on('change', _.bind(this.onCheckTemplateChange, this, Asc.c_oAscChangeTableStyleInfo.rowHeader, 'CheckHeader'));
                this.chTotalRow.on('change', _.bind(this.onCheckTemplateChange, this, Asc.c_oAscChangeTableStyleInfo.rowTotal, 'CheckTotal'));
                this.chBandedRows.on('change', _.bind(this.onCheckTemplateChange, this, Asc.c_oAscChangeTableStyleInfo.rowBanded, 'CheckBanded'));
                this.chFirstColumn.on('change', _.bind(this.onCheckTemplateChange, this, Asc.c_oAscChangeTableStyleInfo.columnFirst, 'CheckFirst'));
                this.chLastColumn.on('change', _.bind(this.onCheckTemplateChange, this, Asc.c_oAscChangeTableStyleInfo.columnLast, 'CheckLast'));
                this.chBandedColumns.on('change', _.bind(this.onCheckTemplateChange, this, Asc.c_oAscChangeTableStyleInfo.columnBanded, 'CheckColBanded'));
                this.chFilterButton.on('change', _.bind(this.onCheckTemplateChange, this, Asc.c_oAscChangeTableStyleInfo.filterButton, 'CheckFilter'));
                Common.UI.LayoutManager.addControls(this.lockedControls);
                Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            },

            onCheckTemplateChange: function(type, stateName, field, newValue, oldValue, eOpts) {
                this._state[stateName] = undefined;
                if (this.api)
                    this.api.asc_changeFormatTableInfo(this._state.TableName, type, newValue=='checked');
                Common.NotificationCenter.trigger('edit:complete', this);
            },

            render: function (el) {
                this.boxSdk = $('#editor_sdk');
                if ( el ) el.html( this.getPanel() );

                return this;
            },

            setApi: function(o) {
                this.api = o;
                if (o) {
                }
                return this;
            },

            onEditClick: function(menu, item, e) {
                if (this.api) {
                    if (item.options.idx>=0 && item.options.idx<4)
                        this.api.asc_changeSelectionFormatTable(this._state.TableName, item.value);
                    else if (item.options.idx>=4 && item.options.idx<8) {
                        this.api.asc_insertCellsInTable(this._state.TableName, item.value);
                    } else {
                        this.api.asc_deleteCellsInTable(this._state.TableName, item.value);
                    }
                }
                Common.NotificationCenter.trigger('edit:complete', this);
            },

            onTableNameChanged: function(input, newValue, oldValue) {
                var oldName = this._state.TableName;
                this._state.TableName = '';

                if (oldName.toLowerCase() == newValue.toLowerCase()) {
                    Common.NotificationCenter.trigger('edit:complete', this);
                    return;
                }

                var me = this,
                    isvalid = this.api.asc_checkDefinedName(newValue, null);
                if (isvalid.asc_getStatus() === true) isvalid = true;
                else {
                    switch (isvalid.asc_getReason()) {
                        case Asc.c_oAscDefinedNameReason.IsLocked:
                            isvalid = this.textIsLocked;
                        break;
                        case Asc.c_oAscDefinedNameReason.Existed:
                            isvalid = this.textExistName;
                        break;
                        case Asc.c_oAscDefinedNameReason.NameReserved:
                            isvalid = this.textReservedName;
                        break;
                        default:
                            isvalid = this.textInvalidName;
                    }
                }
                if (isvalid === true) {
                    this.api.asc_changeDisplayNameTable(oldName, newValue);
                    Common.NotificationCenter.trigger('edit:complete', this);
                } else if (!this._state.TableNameError) {
                    this._state.TableNameError = true;
                    Common.UI.alert({
                        msg: isvalid,
                        title: this.notcriticalErrorTitle,
                        iconCls: 'warn',
                        buttons: ['ok'],
                        callback: function(btn){
                            Common.NotificationCenter.trigger('edit:complete', this);
                            me._state.TableNameError = false;
                        }
                    });
                }
            },

            onInsertSlicerClick: function() {
                var me = this,
                    props = me.api.asc_beforeInsertSlicer();
                if (props) {
                    (new SSE.Views.SlicerAddDialog({
                        props: props,
                        handler: function (result, settings) {
                            if (me && me.api && result == 'ok') {
                                me.api.asc_insertSlicer(settings);
                            }
                            Common.NotificationCenter.trigger('edit:complete', me);
                        }
                    })).show();
                }
            },

            onInsertPivotClick: function() {
                this.fireEvent('pivottable:create');
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
                    if (!(config.canFeatureViews && me.appConfig.isEdit)) {
                        me.toolbar && me.toolbar.$el.find('.group.sheet-views').hide();
                        me.toolbar && me.toolbar.$el.find('.separator.sheet-views').hide();
                    }

                    if (config.isEdit) {
                    } else {
                        me.toolbar && me.toolbar.$el.find('.group.doc-preview').hide();
                        me.toolbar && me.toolbar.$el.find('.separator.doc-preview').hide();
                        me.toolbar && me.toolbar.$el.find('.group.sheet-freeze').hide();
                        me.toolbar && me.toolbar.$el.find('.separator.sheet-freeze').hide();
                        me.toolbar && me.toolbar.$el.find('.group.sheet-gridlines').hide();
                        me.toolbar.$el.find('#slot-btn-macros').closest('.group').prev().addBack().remove();
                    }

                    var emptyGroup = [];

                    if (emptyGroup.length>1) { // remove empty group
                        emptyGroup[emptyGroup.length-1].closest('.group').remove();
                    }

                    setEvents.call(me);

                    if (Common.Utils.InternalSettings.get('toolbar-active-tab')==='view')
                        Common.NotificationCenter.trigger('tab:set-active', 'view');
                });
            },

            show: function () {
                Common.UI.BaseView.prototype.show.call(this);
                this.fireEvent('show', this);
            },

            getButtons: function(type) {
                if (type===undefined)
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

            capBtnSheetView: 'Sheet View',
            capBtnFreeze: 'Freeze Panes',
            textZoom: 'Zoom',
            tipSheetView: 'Sheet view',
            textDefault: 'Default',
            textManager: 'View manager',
            tipFreeze: 'Freeze panes',
            tipCreate: 'Create sheet view',
            tipClose: 'Close sheet view',
            textCreate: 'New',
            textClose: 'Close',
            textFormula: 'Formula bar',
            textHeadings: 'Headings',
            textGridlines: 'Gridlines',
            textFreezeRow: 'Freeze Top Row',
            textFreezeCol: 'Freeze First Column',
            textUnFreeze: 'Unfreeze Panes',
            textZeros: 'Show zeros',
            textCombineSheetAndStatusBars: 'Combine sheet and status bars',
            textAlwaysShowToolbar: 'Always show toolbar',
            textInterfaceTheme: 'Interface theme',
            textShowFrozenPanesShadow: 'Show frozen panes shadow',
            tipInterfaceTheme: 'Interface theme',
            textLeftMenu: 'Left panel',
            textRightMenu: 'Right panel',
            txtViewNormal: 'Normal',
            txtViewPageBreak: 'Page Break Preview',
            tipViewNormal: 'See your document in Normal view',
            tipViewPageBreak: 'See where the page breaks will appear when your document is printed',
            textTabStyle: 'Tab style',
            textFill: 'Fill',
            textLine: 'Line',
            textMacros: 'Macros',
            tipMacros: 'Macros',
            txtGroupPivot_Custom: 'Custom',
            txtGroupPivot_Light: 'Light',
            txtGroupPivot_Medium: 'Medium',
            txtGroupPivot_Dark: 'Dark'
        }
    }()), SSE.Views.TableDesignTab || {}));
});
