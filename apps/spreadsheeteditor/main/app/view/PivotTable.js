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
 *  PivotTable.js
 *
 *  View
 *
 *  Created by Julia.Radzhabova on 06.27.17
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    // 'text!spreadsheeteditor/main/app/template/PivotTableSettings.template',
    'common/main/lib/util/utils',
    'common/main/lib/component/Button',
    'common/main/lib/component/ComboDataView',
    'common/main/lib/component/Layout'
], function (menuTemplate) {
    'use strict';

    SSE.Views.PivotTable = Common.UI.BaseView.extend(_.extend((function(){
        var template =
            '<section id="pivot-table-panel" class="panel" data-tab="pivot">' +
                '<div class="group">' +
                    '<span class="btn-slot text x-huge slot-add-pivot"></span>' +
                '</div>' +
                '<div class="separator long"></div>' +
                '<div class="group">' +
                    '<span id="slot-btn-pivot-report-layout" class="btn-slot text x-huge"></span>' +
                    '<span id="slot-btn-pivot-blank-rows" class="btn-slot text x-huge"></span>' +
                    '<span id="slot-btn-pivot-subtotals" class="btn-slot text x-huge"></span>' +
                    '<span id="slot-btn-pivot-grand-totals" class="btn-slot text x-huge"></span>' +
                '</div>' +
                '<div class="separator long"></div>' +
                '<div class="group">' +
                    '<span id="slot-btn-refresh-pivot" class="btn-slot text x-huge"></span>' +
                '</div>' +
                '<div class="separator long"></div>' +
                '<div class="group">' +
                    '<span id="slot-btn-select-pivot" class="btn-slot text x-huge"></span>' +
                '</div>' +
                '<div class="separator long"></div>' +
                '<div class="group small">' +
                    '<div class="elset">' +
                        '<span class="btn-slot text" id="slot-chk-header-row"></span>' +
                    '</div>' +
                    '<div class="elset">' +
                        '<span class="btn-slot text" id="slot-chk-header-column"></span>' +
                    '</div>' +
                '</div>' +
                '<div class="group small">' +
                    '<div class="elset">' +
                        '<span class="btn-slot text" id="slot-chk-banded-row"></span>' +
                    '</div>' +
                    '<div class="elset">' +
                        '<span class="btn-slot text" id="slot-chk-banded-column"></span>' +
                    '</div>' +
                '</div>' +
                '<div class="group flex small" id="slot-field-pivot-styles" style="width: 336px;max-width: 336px;min-width: 115px;" data-group-width="336px">' +
                '</div>' +
            '</section>';

        function setEvents() {
            var me = this;

            this.btnsAddPivot.forEach(function(button) {
                button.on('click', function (b, e) {
                    me.fireEvent('pivottable:create');
                });
            });

            this.btnPivotLayout.menu.on('item:click', function (menu, item, e) {
                me.fireEvent('pivottable:layout', [item.value]);
            });

            this.btnPivotBlankRows.menu.on('item:click', function (menu, item, e) {
                me.fireEvent('pivottable:blankrows', [item.value]);
            });

            this.btnPivotSubtotals.menu.on('item:click', function (menu, item, e) {
                me.fireEvent('pivottable:subtotals', [item.value]);
            });

            this.btnPivotGrandTotals.menu.on('item:click', function (menu, item, e) {
                me.fireEvent('pivottable:grandtotals', [item.value]);
            });

            this.btnRefreshPivot.on('click', function (e) {
                me.fireEvent('pivottable:refresh');
            });

            this.btnSelectPivot.on('click', function (e) {
                me.fireEvent('pivottable:select');
            });

            this.chRowHeader.on('change', function (field, value) {
                me.fireEvent('pivottable:rowscolumns', [0, value]);
            });
            this.chColHeader.on('change', function (field, value) {
                me.fireEvent('pivottable:rowscolumns', [1, value]);
            });
            this.chRowBanded.on('change', function (field, value) {
                me.fireEvent('pivottable:rowscolumns', [2, value]);
            });
            this.chColBanded.on('change', function (field, value) {
                me.fireEvent('pivottable:rowscolumns', [3, value]);
            });

            this.pivotStyles.on('click', function (combo, record) {
                me.fireEvent('pivottable:style', [record]);
            });
            this.pivotStyles.openButton.menu.on('show:after', function () {
                me.pivotStyles.menuPicker.scroller.update({alwaysVisibleY: true});
            });
        }

        return {
            options: {},

            initialize: function (options) {
                Common.UI.BaseView.prototype.initialize.call(this, options);

                this.toolbar = options.toolbar;
                this.lockedControls = [];

                var _set = SSE.enumLock;

                this.btnsAddPivot = Common.Utils.injectButtons(this.toolbar.$el.find('.btn-slot.slot-add-pivot'), '', 'toolbar__icon btn-pivot-sum', this.txtPivotTable,
                    [_set.lostConnect, _set.coAuth, _set.editPivot, _set.selRangeEdit, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.selSlicer, _set.editCell]);

                this.chRowHeader = new Common.UI.CheckBox({
                    labelText: this.textRowHeader,
                    lock        : [_set.lostConnect, _set.coAuth, _set.noPivot, _set.selRangeEdit, _set.pivotLock]
                });
                this.lockedControls.push(this.chRowHeader);

                this.chColHeader = new Common.UI.CheckBox({
                    labelText: this.textColHeader,
                    lock        : [_set.lostConnect, _set.coAuth, _set.noPivot, _set.selRangeEdit, _set.pivotLock]
                });
                this.lockedControls.push(this.chColHeader);

                this.chRowBanded = new Common.UI.CheckBox({
                    labelText: this.textRowBanded,
                    lock        : [_set.lostConnect, _set.coAuth, _set.noPivot, _set.selRangeEdit, _set.pivotLock]
                });
                this.lockedControls.push(this.chRowBanded);

                this.chColBanded = new Common.UI.CheckBox({
                    labelText: this.textColBanded,
                    lock        : [_set.lostConnect, _set.coAuth, _set.noPivot, _set.selRangeEdit, _set.pivotLock]
                });
                this.lockedControls.push(this.chColBanded);

                this.btnPivotLayout = new Common.UI.Button({
                    cls         : 'btn-toolbar x-huge icon-top',
                    iconCls     : 'toolbar__icon btn-pivot-layout',
                    caption     : this.capLayout,
                    disabled    : true,
                    lock        : [_set.lostConnect, _set.coAuth, _set.noPivot, _set.selRangeEdit, _set.pivotLock],
                    menu        : true
                });
                this.lockedControls.push(this.btnPivotLayout);

                this.btnPivotBlankRows = new Common.UI.Button({
                    cls         : 'btn-toolbar x-huge icon-top',
                    iconCls     : 'toolbar__icon btn-blank-rows',
                    caption     : this.capBlankRows,
                    disabled    : true,
                    lock        : [_set.lostConnect, _set.coAuth, _set.noPivot, _set.selRangeEdit, _set.pivotLock],
                    menu        : true
                });
                this.lockedControls.push(this.btnPivotBlankRows);

                this.btnPivotSubtotals = new Common.UI.Button({
                    cls         : 'btn-toolbar x-huge icon-top',
                    iconCls     : 'toolbar__icon btn-subtotals',
                    caption     : this.capSubtotals,
                    disabled    : true,
                    lock        : [_set.lostConnect, _set.coAuth, _set.noPivot, _set.selRangeEdit, _set.pivotLock],
                    menu        : true
                });
                this.lockedControls.push(this.btnPivotSubtotals);

                this.btnPivotGrandTotals = new Common.UI.Button({
                    cls         : 'btn-toolbar x-huge icon-top',
                    iconCls     : 'toolbar__icon btn-grand-totals',
                    caption     : this.capGrandTotals,
                    disabled    : true,
                    lock        : [_set.lostConnect, _set.coAuth, _set.noPivot, _set.selRangeEdit, _set.pivotLock],
                    menu        : true
                });
                this.lockedControls.push(this.btnPivotGrandTotals);

                this.btnRefreshPivot = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-update',
                    caption: this.txtRefresh,
                    disabled    : true,
                    lock        : [_set.lostConnect, _set.coAuth, _set.noPivot, _set.selRangeEdit, _set.pivotLock]
                });
                this.lockedControls.push(this.btnRefreshPivot);

                this.btnSelectPivot = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-select-pivot',
                    caption: this.txtSelect,
                    lock: [_set.lostConnect, _set.coAuth, _set.noPivot, _set.selRangeEdit]
                });
                this.lockedControls.push(this.btnSelectPivot);

                this.pivotStyles = new Common.UI.ComboDataView({
                    cls             : 'combo-pivot-template',
                    enableKeyEvents : true,
                    itemWidth       : 61,
                    itemHeight      : 49,
                    menuMaxHeight   : 300,
                    lock        : [_set.lostConnect, _set.coAuth, _set.noPivot, _set.selRangeEdit, _set.pivotLock],
                    beforeOpenHandler: function(e) {
                        var cmp = this,
                            menu = cmp.openButton.menu;
                        if (menu.cmpEl) {
                            var offset = cmp.cmpEl.width() - cmp.openButton.$el.width() - menu.cmpEl.outerWidth() - 1;
                            menu.setOffset(Math.min(offset, 0));
                        }
                    }
                });
                this.lockedControls.push(this.pivotStyles);

                Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            },

            render: function (el) {
                this.boxSdk = $('#editor_sdk');
                if ( el ) el.html( this.getPanel() );

                return this;
            },

            onAppReady: function (config) {
                var me = this;
                (new Promise(function (accept, reject) {
                    accept();
                })).then(function(){
                    me.btnsAddPivot.forEach( function(btn) {
                        btn.updateHint(me.tipCreatePivot);
                    });
                    me.btnRefreshPivot.updateHint(me.tipRefresh);
                    me.btnSelectPivot.updateHint(me.tipSelect);
                    me.btnPivotLayout.updateHint(me.capLayout);
                    me.btnPivotLayout.setMenu(new Common.UI.Menu({
                        items: [
                            { caption: me.mniLayoutCompact,  value: 0 },
                            { caption: me.mniLayoutOutline,  value: 1 },
                            { caption: me.mniLayoutTabular,  value: 2 },
                            { caption: '--' },
                            { caption: me.mniLayoutRepeat,   value: 3 },
                            { caption: me.mniLayoutNoRepeat, value: 4 }
                        ]
                    }));

                    me.btnPivotBlankRows.updateHint(me.capBlankRows);
                    me.btnPivotBlankRows.setMenu( new Common.UI.Menu({
                        items: [
                            { caption: me.mniInsertBlankLine,  value: 'insert' },
                            { caption: me.mniRemoveBlankLine,  value: 'remove' }
                        ]
                    }));

                    me.btnPivotSubtotals.updateHint(me.tipSubtotals);
                    me.btnPivotSubtotals.setMenu(new Common.UI.Menu({
                        items: [
                            { caption: me.mniNoSubtotals,       value: 0 },
                            { caption: me.mniBottomSubtotals,   value: 1 },
                            { caption: me.mniTopSubtotals,      value: 2 }
                        ]
                    }));

                    me.btnPivotGrandTotals.updateHint(me.tipGrandTotals);
                    me.btnPivotGrandTotals.setMenu(new Common.UI.Menu({
                        items: [
                            { caption: me.mniOffTotals,       value: 0 },
                            { caption: me.mniOnTotals,        value: 1 },
                            { caption: me.mniOnRowsTotals,    value: 2 },
                            { caption: me.mniOnColumnsTotals, value: 3 }
                        ]
                    }));

                    setEvents.call(me);
                });
            },

            getPanel: function () {
                this.$el = $(_.template(template)( {} ));

                var _set = SSE.enumLock;
                this.btnsAddPivot = this.btnsAddPivot.concat(Common.Utils.injectButtons(this.$el.find('.btn-slot.slot-add-pivot'), '', 'toolbar__icon btn-pivot-sum', this.txtCreate,
                    [_set.lostConnect, _set.coAuth, _set.editPivot, _set.selRangeEdit, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.selSlicer, _set.editCell]));

                this.chRowHeader.render(this.$el.find('#slot-chk-header-row'));
                this.chColHeader.render(this.$el.find('#slot-chk-header-column'));
                this.chRowBanded.render(this.$el.find('#slot-chk-banded-row'));
                this.chColBanded.render(this.$el.find('#slot-chk-banded-column'));

                this.btnRefreshPivot.render(this.$el.find('#slot-btn-refresh-pivot'));
                this.btnSelectPivot.render(this.$el.find('#slot-btn-select-pivot'));
                this.btnPivotLayout.render(this.$el.find('#slot-btn-pivot-report-layout'));
                this.btnPivotBlankRows.render(this.$el.find('#slot-btn-pivot-blank-rows'));
                this.btnPivotSubtotals.render(this.$el.find('#slot-btn-pivot-subtotals'));
                this.btnPivotGrandTotals.render(this.$el.find('#slot-btn-pivot-grand-totals'));
                this.pivotStyles.render(this.$el.find('#slot-field-pivot-styles'));
                this.pivotStyles.openButton.menu.cmpEl.css({
                    'min-width': 293,
                    'max-width': 293
                });

                return this.$el;
            },

            show: function () {
                Common.UI.BaseView.prototype.show.call(this);
                this.fireEvent('show', this);
            },

            getButtons: function(type) {
                return this.btnsAddPivot.concat(this.lockedControls);
            },

            SetDisabled: function (state) {
                this.btnsAddPivot.concat(this.lockedControls).forEach(function(button) {
                    if ( button ) {
                        button.setDisabled(state);
                    }
                }, this);
            },

            txtCreate: 'Insert Table',
            tipCreatePivot: 'Insert Pivot Table',
            textRowHeader: 'Row Headers',
            textColHeader: 'Column Headers',
            textRowBanded: 'Banded Rows',
            textColBanded: 'Banded Columns',
            capBlankRows: 'Blank Rows',
            mniInsertBlankLine: 'Insert Blank Line after Each Item',
            mniRemoveBlankLine: 'Remove Blank Line after Each Item',
            capGrandTotals: 'Grand Totals',
            mniOffTotals: 'Off for Rows and Columns',
            mniOnTotals: 'On for Rows and Columns',
            mniOnRowsTotals: 'On for Rows Only',
            mniOnColumnsTotals: 'On for Columns Only',
            capLayout: 'Report Layout',
            capSubtotals: 'Subtotals',
            mniLayoutCompact: 'Show in Compact Form',
            mniLayoutOutline: 'Show in Outline Form',
            mniLayoutTabular: 'Show in Tabular Form',
            mniLayoutRepeat: 'Repeat All Item Labels',
            mniLayoutNoRepeat: 'Don\'t Repeat All Item Labels',
            mniNoSubtotals: 'Don\'t Show Subtotals',
            mniBottomSubtotals: 'Show all Subtotals at Bottom of Group',
            mniTopSubtotals: 'Show all Subtotals at Top of Group',
            txtRefresh: 'Refresh',
            tipRefresh: 'Update the information from data source',
            tipGrandTotals: 'Show or hide grand totals',
            tipSubtotals: 'Show or hide subtotals',
            txtSelect: 'Select',
            tipSelect: 'Select entire pivot table',
            txtPivotTable: 'Pivot Table'
        }
    }()), SSE.Views.PivotTable || {}));
});