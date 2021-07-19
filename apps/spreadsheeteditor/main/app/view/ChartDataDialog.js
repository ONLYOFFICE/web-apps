/*
 *
 * (c) Copyright Ascensio System SIA 2010-2020
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
 *  ChartDataDialog.js
 *
 *  Created by Julia Radzhabova on 06.07.2020
 *  Copyright (c) 2020 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/MetricSpinner',
    'common/main/lib/component/ComboBox',
    'common/main/lib/component/ListView',
    'common/main/lib/view/AdvancedSettingsWindow'
], function () { 'use strict';

    SSE.Views.ChartDataDialog = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 370,
            height: 490
        },

        initialize : function(options) {
            var me = this;

            _.extend(this.options, {
                title: this.textTitle,
                template: [
                    '<div class="box" style="height:' + (me.options.height - 85) + 'px;">',
                    '<div class="content-panel" style="padding: 0 10px;"><div class="inner-content">',
                        '<div class="settings-panel active">',
                            '<table cols="1" style="width: 100%;">',
                                '<tr>',
                                    '<td>',
                                        '<label class="input-label">', me.textData, '</label>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-small" width="200">',
                                        '<div id="chart-dlg-txt-range" class="input-row" style=""></div>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-small">',
                                        '<label class="input-label">', me.textSeries, '</label>',
                                        '<div id="chart-dlg-series-list" class="" style="width:100%; height: 93px;"></div>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-large">',
                                        '<button type="button" class="btn btn-text-default auto" id="chart-dlg-btn-add" style="min-width: 70px;margin-right:5px;">', me.textAdd, '</button>',
                                        '<button type="button" class="btn btn-text-default auto" id="chart-dlg-btn-edit" style="min-width: 70px;margin-right:5px;">', me.textEdit, '</button>',
                                        '<button type="button" class="btn btn-text-default auto" id="chart-dlg-btn-delete" style="min-width: 70px;margin-right:5px;">', me.textDelete, '</button>',
                                        '<div style="display: inline-block; float: right;">',
                                        '<div id="chart-dlg-btn-up" style="display: inline-block;margin-right: 2px;"></div>',
                                        '<div id="chart-dlg-btn-down" style="display: inline-block;"></div>',
                                        '</div>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-large">',
                                        '<button type="button" class="btn btn-text-default auto" id="chart-dlg-btn-switch" style="min-width: 70px;margin-right:5px;">', me.textSwitch, '</button>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-small">',
                                        '<label class="input-label">', me.textCategory, '</label>',
                                        '<div id="chart-dlg-category-list" class="" style="width:100%; height: 93px;"></div>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-small">',
                                        '<button type="button" class="btn btn-text-default auto" id="chart-dlg-btn-category-edit" style="min-width: 70px;margin-right:5px;">', me.textEdit, '</button>',
                                    '</td>',
                                '</tr>',
                            '</table>',
                        '</div></div>',
                    '</div>',
                    '</div>',
                    '<div class="separator horizontal"></div>'
                ].join('')
            }, options);

            this.handler    = options.handler;

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);

            this._noApply = true;
            this._changedProps = null;

            this.api = this.options.api;
            this.chartSettings = this.options.chartSettings;
            this.currentChartType = Asc.c_oAscChartTypeSettings.barNormal;
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this.txtDataRange = new Common.UI.InputFieldBtn({
                el          : $('#chart-dlg-txt-range'),
                name        : 'range',
                style       : 'width: 100%;',
                btnHint     : this.textSelectData,
                allowBlank  : true
                // validateOnChange: true
            });
            this.txtDataRange.on('button:click', _.bind(this.onSelectData, this));
            this.txtDataRange.on('changed:after', function(input, newValue, oldValue, e) {
                if (newValue == oldValue) return;
                me.changeChartRange(newValue);
            });

            // Chart data
            this.seriesList = new Common.UI.ListView({
                el: $('#chart-dlg-series-list', this.$window),
                store: new Common.UI.DataViewStore(),
                emptyText: '',
                scrollAlwaysVisible: true,
                itemTemplate: _.template('<div id="<%= id %>" class="list-item" style="min-height: 15px;"><%= value %></div>')
            });
            this.seriesList.onKeyDown = _.bind(this.onListKeyDown, this, 'series');
            this.seriesList.on('item:select', _.bind(this.onSelectSeries, this));
            this.seriesList.store.comparator = function(rec) {
                return rec.get("order");
            };

            this.btnAdd = new Common.UI.Button({
                el: $('#chart-dlg-btn-add')
            });
            this.btnAdd.on('click', _.bind(this.onAddSeries, this, false));

            this.btnDelete = new Common.UI.Button({
                el: $('#chart-dlg-btn-delete')
            });
            this.btnDelete.on('click', _.bind(this.onDeleteSeries, this));

            this.btnEdit = new Common.UI.Button({
                el: $('#chart-dlg-btn-edit')
            });
            this.btnEdit.on('click', _.bind(this.onEditSeries, this, false));

            this.btnUp = new Common.UI.Button({
                parentEl: $('#chart-dlg-btn-up'),
                cls: 'btn-toolbar bg-white',
                iconCls: 'caret-up',
                hint: this.textUp
            });
            this.btnUp.on('click', _.bind(this.onMoveClick, this, true));

            this.btnDown = new Common.UI.Button({
                parentEl: $('#chart-dlg-btn-down'),
                cls: 'btn-toolbar bg-white',
                iconCls: 'caret-down',
                hint: this.textDown
            });
            this.btnDown.on('click', _.bind(this.onMoveClick, this, false));

            this.btnSwitch = new Common.UI.Button({
                el: $('#chart-dlg-btn-switch')
            });
            this.btnSwitch.on('click', _.bind(this.onSwitch, this));

            this.categoryList = new Common.UI.ListView({
                el: $('#chart-dlg-category-list', this.$window),
                store: new Common.UI.DataViewStore(),
                emptyText: '',
                scrollAlwaysVisible: true,
                itemTemplate: _.template('<div id="<%= id %>" class="list-item" style="min-height: 15px;"><%= value %></div>')
            });

            this.btnEditCategory = new Common.UI.Button({
                el: $('#chart-dlg-btn-category-edit')
            });
            this.btnEditCategory.on('click', _.bind(this.onEditCategory, this, false));

            this.afterRender();
        },

        afterRender: function() {
            this._setDefaults(this.chartSettings);
        },

        show: function() {
            Common.Views.AdvancedSettingsWindow.prototype.show.apply(this, arguments);

            var me = this;
            _.delay(function(){
                me.txtDataRange.cmpEl.find('input').focus();
            },50);
        },

        close: function () {
            this.api.asc_onCloseChartFrame();
            Common.Views.AdvancedSettingsWindow.prototype.close.apply(this, arguments);
        },

        _setDefaults: function (props) {
            var me = this;
            if (props ){
                this.chartSettings = props;

                this.currentChartType = props.getType();

                var value = props.getRange();
                this.txtDataRange.setValue((value) ? value : '');

                this.txtDataRange.validation = function(value) {
                    return true;
                };

                this.updateSeriesList(props.getSeries(), 0);
                this.updateCategoryList(props.getCatValues());
            }
            this.updateButtons();
        },

        getSettings: function () {
            return { chartSettings: this.chartSettings};
        },

        onDlgBtnClick: function(event) {
            var state = (typeof(event) == 'object') ? event.currentTarget.attributes['result'].value : event;
            if (state == 'ok') {
                if (!this.isRangeValid()) return;
                this.handler && this.handler.call(this, state,  (state == 'ok') ? this.getSettings() : undefined);
            }

            this.close();
        },

        onPrimary: function() {
            this.onDlgBtnClick('ok');
            return false;
        },

        isRangeValid: function() {
            var isvalid;
            isvalid = this.chartSettings.isValidRange(this.txtDataRange.getValue());
            if (isvalid === true || isvalid == Asc.c_oAscError.ID.No)
                return true;

            var error = this.textInvalidRange;
            switch (isvalid) {
                case Asc.c_oAscError.ID.StockChartError:
                    error = this.errorStockChart;
                    break;
                case Asc.c_oAscError.ID.MaxDataSeriesError:
                    error = this.errorMaxRows;
                    break;
                case Asc.c_oAscError.ID.MaxDataPointsError:
                    error = this.errorMaxPoints;
                    break;
                case Asc.c_oAscError.ID.ErrorInFormula:
                    error = this.errorInFormula;
                    break;
                case Asc.c_oAscError.ID.InvalidReference:
                    error = this.errorInvalidReference;
                    break;
                case Asc.c_oAscError.ID.NoSingleRowCol:
                    error = this.errorNoSingleRowCol;
                    break;
                case Asc.c_oAscError.ID.NoValues:
                    error = this.errorNoValues;
                    break;
            }
            Common.UI.warning({msg: error, maxwidth: 600});
            return false;
        },

        changeChartRange: function(settings) {
            var me = this;
            if (me.isRangeValid(settings)) {
                me.txtDataRange.checkValidate();
                me.chartSettings.setRange(settings);

                me.updateSeriesList(me.chartSettings.getSeries(), 0);
                me.updateCategoryList(me.chartSettings.getCatValues());
                me.updateButtons();
            }
        },

        onSelectData: function(input) {
            var me = this;
            if (me.api) {
                var handlerDlg = function(dlg, result) {
                    if (result == 'ok') {
                        input.setValue(dlg.getSettings());
                        _.delay(function(){
                            me.changeChartRange(dlg.getSettings());
                        },10);
                    }
                };

                var win = new SSE.Views.CellRangeDialog({
                    handler: handlerDlg
                }).on('close', function() {
                    me.show();
                });

                var xy = me.$window.offset();
                me.hide();
                win.show(xy.left + 160, xy.top + 125);
                win.setSettings({
                    api     : me.api,
                    range   : me.txtDataRange.getValue(),
                    type    : Asc.c_oAscSelectionDialogType.Chart,
                    validation: function() {return true;}
                });
            }
        },

        onListKeyDown: function (type, e, data) {
            var record = null, listView = this.seriesList;

            if (listView.disabled) return;
            if (_.isUndefined(undefined)) data = e;

            if (data.keyCode==Common.UI.Keys.DELETE && !this.btnDelete.isDisabled()) {
                // this.onDeleteSeries();
            } else {
                Common.UI.DataView.prototype.onKeyDown.call(listView, e, data);
            }
        },

        onSelectSeries: function(lisvView, itemView, record) {
            this.updateMoveButtons();
        },

        updateRange: function() {
            this.txtDataRange.setValue(this.chartSettings.getRange() || '');
        },

        updateButtons: function() {
            this.btnEdit.setDisabled(this.seriesList.store.length<1);
            this.btnDelete.setDisabled(this.seriesList.store.length<1);
            this.btnSwitch.setDisabled(this.seriesList.store.length<1 || !this.chartSettings.getRange());
            this.updateMoveButtons();
        },

        updateMoveButtons: function() {
            var rec = this.seriesList.getSelectedRec(),
                index = rec ? this.seriesList.store.indexOf(rec) : -1;
            this.btnUp.setDisabled(index<1);
            this.btnDown.setDisabled(index<0 || index==this.seriesList.store.length-1);
        },

        onAddSeries: function() {
            var me = this;
            me.chartSettings.startEditData();
            var series = me.chartSettings.addSeries(),
                isScatter = series.asc_IsScatter();

            var handlerDlg = function(dlg, result) {
                if (result == 'ok') {
                    me.updateRange();
                    me.updateSeriesList(me.chartSettings.getSeries(), me.seriesList.store.length-1);
                    me.updateCategoryList(me.chartSettings.getCatValues());
                    me.updateButtons();
                    me.chartSettings.endEditData();
                    me._isEditRanges = false;
                }
            };
            this.changeDataRange(1, {series: series, isScatter: isScatter}, handlerDlg);
        },

        onDeleteSeries: function() {
            var rec = this.seriesList.getSelectedRec();
            if (rec) {
                var order = rec.get('order');
                rec.get('series').asc_Remove();
                this.updateRange();
                this.updateSeriesList(this.chartSettings.getSeries(), order);
                this.updateCategoryList(this.chartSettings.getCatValues());
                this.updateButtons();
            }
        },

        onEditSeries: function() {
            var rec = this.seriesList.getSelectedRec();
            if (rec) {
                var series = rec.get('series'),
                    isScatter = series.asc_IsScatter(),
                    me = this;
                var handlerDlg = function(dlg, result) {
                    if (result == 'ok') {
                        rec.set('value', series.asc_getSeriesName());
                        me.updateRange();
                        me.updateCategoryList(me.chartSettings.getCatValues());
                        me.updateButtons();
                        me.chartSettings.endEditData();
                        me._isEditRanges = false;
                    }
                };
                me.chartSettings.startEditData();
                this.changeDataRange(1, {series: series, isScatter: isScatter }, handlerDlg);
            }
        },

        onEditCategory: function() {
            var me = this;
            var handlerDlg = function(dlg, result) {
                if (result == 'ok') {
                    me.updateCategoryList(me.chartSettings.getCatValues());
                    me.updateRange();
                    me.updateButtons();
                    me.chartSettings.endEditData();
                    me._isEditRanges = false;
                }
            };
            me.chartSettings.startEditData();
            this.changeDataRange(0, {category: this.chartSettings.getCatFormula(), values: this.chartSettings.getCatValues()}, handlerDlg);
        },

        changeDataRange: function(type, props, handlerDlg) {
            var me = this;
            var win = new SSE.Views.ChartDataRangeDialog({
                type: type, //series
                isScatter: !!props.isScatter,
                handler: handlerDlg
            }).on('close', function() {
                me._isEditRanges && me.chartSettings.cancelEditData();
                me._isEditRanges = false;
                me.show();
            });

            me._isEditRanges = true;
            var xy = me.$window.offset();
            me.hide();
            win.show(xy.left + 160, xy.top + 125);
            win.setSettings({
                api     : me.api,
                props   : props,
                chartSettings: me.chartSettings
            });
        },

        onMoveClick: function(up) {
            var store = this.seriesList.store,
                length = store.length,
                rec = this.seriesList.getSelectedRec();
            if (rec) {
                var index = store.indexOf(rec),
                    order = rec.get('order'),
                    newindex = up ? Math.max(0, index-1) : Math.min(length-1, index+1),
                    newrec = store.at(newindex),
                    neworder = newrec.get('order');
                store.add(store.remove(rec), {at: newindex});
                rec.set('order', neworder);
                newrec.set('order', order);
                up ? rec.get('series').asc_MoveUp() : rec.get('series').asc_MoveDown();
                this.seriesList.selectRecord(rec);
                this.seriesList.scrollToRecord(rec);
                this.updateRange();
                this.updateCategoryList(this.chartSettings.getCatValues());
                this.updateButtons();
            }
        },

        updateSeriesList: function(series, index) {
            this.btnEditCategory.setDisabled(series && series.length>0 ? series[0].asc_IsScatter() : false);

            var arr = [];
            var store = this.seriesList.store;
            for (var i = 0, len = series.length; i < len; i++)
            {
                var item = series[i],
                    rec = new Common.UI.DataViewModel();
                rec.set({
                    value: item.asc_getSeriesName(),
                    index: item.asc_getIdx(),
                    order: item.asc_getOrder(),
                    series: item
                });
                arr.push(rec);
            }
            store.reset(arr);
            (len>0) && this.seriesList.selectByIndex(Math.min(index || 0, store.length-1));
        },

        updateCategoryList: function(categories) {
            var arr = [];
            var store = this.categoryList.store;
            for (var i = 0, len = categories.length; i < len; i++)
            {
                var item = categories[i],
                    rec = new Common.UI.DataViewModel();
                rec.set({
                    value: item
                });
                arr.push(rec);
            }
            store.reset(arr);
            (len>0) && this.categoryList.selectByIndex(0);
        },

        onSwitch: function() {
            var res = this.chartSettings.switchRowCol();
            if (res === Asc.c_oAscError.ID.MaxDataSeriesError)
                Common.UI.warning({msg: this.errorMaxRows, maxwidth: 600});
            else {
                this.updateSeriesList(this.chartSettings.getSeries(), 0);
                this.updateCategoryList(this.chartSettings.getCatValues());
                this.updateRange();
                this.updateButtons();
            }
        },

        textTitle: 'Chart Data',
        textInvalidRange:   'Invalid cells range',
        textSelectData: 'Select data',
        errorMaxRows: 'The maximum number of data series per chart is 255.',
        errorStockChart: 'Incorrect row order. To build a stock chart place the data on the sheet in the following order:<br> opening price, max price, min price, closing price.',
        errorMaxPoints: 'The maximum number of points in series per chart is 4096.',
        textSeries: 'Legend Entries (Series)',
        textAdd: 'Add',
        textEdit: 'Edit',
        textDelete: 'Remove',
        textSwitch: 'Switch Row/Column',
        textCategory: 'Horizontal (Category) Axis Labels',
        textUp: 'Up',
        textDown: 'Down',
        textData: 'Chart data range',
        errorInFormula: "There's an error in formula you entered.",
        errorInvalidReference: 'The reference is not valid. Reference must be to an open worksheet.',
        errorNoSingleRowCol: 'The reference is not valid. References for titles, values, sizes, or data labels must be a single cell, row, or column.',
        errorNoValues: 'To create a chart, the series must contain at least one value.'

}, SSE.Views.ChartDataDialog || {}))
});
