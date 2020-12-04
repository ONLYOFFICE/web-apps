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
 *  ChartTypeDialog.js
 *
 *  Created by Julia Radzhabova on 03.12.2020
 *  Copyright (c) 2020 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/ComboBox',
    'common/main/lib/component/ListView',
    'common/main/lib/view/AdvancedSettingsWindow'
], function () { 'use strict';

    SSE.Views.ChartTypeDialog = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 312,
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
                                    '<td class="padding-small">',
                                        '<label class="header">', me.textType, '</label>',
                                        '<div id="chart-type-dlg-button-type" style=""></div>',
                                    '</td>',
                                '</tr>',
                                '<tr class="simple-chart">',
                                    '<td class="padding-small">',
                                        '<label class="header">', me.textStyle, '</label>',
                                        '<div id="chart-type-dlg-styles-list" class="" style="width:100%; height: 176px;"></div>',
                                    '</td>',
                                '</tr>',
                                '<tr class="combined-chart">',
                                    '<td>',
                                        '<label id="chart-type-dlg-label-column" class="header" style="width: 100px;">', me.textSeries, '</label>',
                                        '<label id="chart-type-dlg-label-sort" class="header" style="width: 130px;">', me.textType, '</label>',
                                        '<label class="header" style="">', me.textSecondary, '</label>',
                                    '</td>',
                                '</tr>',
                                '<tr class="combined-chart">',
                                    '<td class="padding-small">',
                                        '<div id="chart-type-dlg-series-list" class="" style="width:100%; height: 150px;"></div>',
                                    '</td>',
                                '</tr>',
                            '</table>',
                        '</div></div>',
                    '</div>',
                    '</div>'
                ].join('')
            }, options);

            this.handler    = options.handler;

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);

            this._changedProps = null;

            this.api = this.options.api;
            this.chartSettings = this.options.chartSettings;
            this.currentChartType = Asc.c_oAscChartTypeSettings.barNormal;
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this.btnChartType = new Common.UI.Button({
                cls         : 'btn-large-dataview',
                iconCls     : 'svgicon chart-bar-normal',
                menu        : new Common.UI.Menu({
                    style: 'width: 364px; padding-top: 12px;',
                    additionalAlign: this.menuAddAlign,
                    items: [
                        { template: _.template('<div id="chart-type-dlg-menu-type" class="menu-insertchart"  style="margin: 5px 5px 5px 10px;"></div>') }
                    ]
                })
            });
            this.btnChartType.on('render:after', function(btn) {
                me.mnuChartTypePicker = new Common.UI.DataView({
                    el: $('#chart-type-dlg-menu-type', me.$window),
                    parentMenu: btn.menu,
                    restoreHeight: 421,
                    groups: new Common.UI.DataViewGroupStore(Common.define.chartData.getChartGroupData()),
                    store: new Common.UI.DataViewStore(Common.define.chartData.getChartData()),
                    itemTemplate: _.template('<div id="<%= id %>" class="item-chartlist"><svg width="40" height="40" class=\"icon\"><use xlink:href=\"#chart-<%= iconCls %>\"></use></svg></div>')
                });
            });
            this.btnChartType.render($('#chart-type-dlg-button-type'), this.$window);
            this.mnuChartTypePicker.on('item:click', _.bind(this.onSelectType, this));

            this.stylesList = new Common.UI.DataView({
                el: $('#chart-type-dlg-styles-list', this.$window),
                store: new Common.UI.DataViewStore(),
                cls: 'bordered',
                enableKeyEvents: this.options.enableKeyEvents,
                itemTemplate : _.template([
                    '<div class="style" id="<%= id %>">',
                        '<img src="<%= imageUrl %>" width="' + this.itemWidth + '" height="' + this.itemHeight + '"/>',
                        '<% if (typeof title !== "undefined") {%>',
                            '<span class="title"><%= title %></span>',
                        '<% } %>',
                    '</div>'
                ].join(''))
            });
            this.stylesList.on('item:select', _.bind(this.onSelectStyles, this));

            this.NotCombinedSettings = $('.simple-chart', this.$window);
            this.CombinedSettings = $('.combined-chart', this.$window);

            this.afterRender();
        },

        afterRender: function() {
            this._setDefaults(this.chartSettings);
        },

        show: function() {
            Common.Views.AdvancedSettingsWindow.prototype.show.apply(this, arguments);
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
                var record = this.mnuChartTypePicker.store.findWhere({type: this.currentChartType});
                this.mnuChartTypePicker.selectRecord(record, true);
                if (record) {
                    this.btnChartType.setIconCls('svgicon ' + 'chart-' + record.get('iconCls'));
                } else
                    this.btnChartType.setIconCls('svgicon');
                this.ShowHideSettings(this.currentChartType);
                if (this.currentChartType==Asc.c_oAscChartTypeSettings.combo) {

                } else
                    this.updateChartStyles(this.api.asc_getChartPreviews(this.currentChartType));
            }
        },

        getSettings: function () {
            return { chartSettings: this.chartSettings};
        },

        onDlgBtnClick: function(event) {
            var state = (typeof(event) == 'object') ? event.currentTarget.attributes['result'].value : event;
            if (state == 'ok') {
                // if (!this.isRangeValid()) return;
                this.handler && this.handler.call(this, state,  (state == 'ok') ? this.getSettings() : undefined);
            }

            this.close();
        },

        onPrimary: function() {
            this.onDlgBtnClick('ok');
            return false;
        },

        onSelectType: function(picker, itemView, record) {
            var rawData = {},
                isPickerSelect = _.isFunction(record.toJSON);

            if (isPickerSelect){
                if (record.get('selected')) {
                    rawData = record.toJSON();
                } else {
                    // record deselected
                    return;
                }
            } else {
                rawData = record;
            }

            this.btnChartType.setIconCls('svgicon ' + 'chart-' + rawData.iconCls);
            this.currentChartType = rawData.type;
            this.chartSettings.changeType(this.currentChartType);
            this.ShowHideSettings(this.currentChartType);
            if (this.currentChartType==Asc.c_oAscChartTypeSettings.combo) {

            } else
                this.updateChartStyles(this.api.asc_getChartPreviews(this.currentChartType));
        },

        onSelectStyle: function(combo, record) {
        },

        updateChartStyles: function(styles) {
            var me = this;
            if (styles && styles.length>0){
                var stylesStore = this.stylesList.store;
                if (stylesStore) {
                    var count = stylesStore.length;
                    if (count>0 && count==styles.length) {
                        var data = stylesStore.models;
                        _.each(styles, function(style, index){
                            data[index].set('imageUrl', style.asc_getImage());
                        });
                    } else {
                        var stylearray = [],
                            selectedIdx = -1;
                        _.each(styles, function(item, index){
                            stylearray.push({
                                imageUrl: item.asc_getImage(),
                                data    : item.asc_getName(),
                                tip     : me.textStyle + ' ' + item.asc_getName()
                            });
                        });
                        stylesStore.reset(stylearray, {silent: false});
                    }
                }
            } else {
                this.stylesList.store.reset();
            }
            this.stylesList.setDisabled(!styles || styles.length<1);
        },
        
        onSelectStyles: function(dataView, itemView, record) {
            this.chartSettings.putStyle(record.get('data'));
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

        ShowHideSettings: function(type) {
            this.NotCombinedSettings.toggleClass('hidden', type==Asc.c_oAscChartTypeSettings.combo);
            this.CombinedSettings.toggleClass('hidden', type!==Asc.c_oAscChartTypeSettings.combo);
        },

        textTitle: 'Chart Type',
        textType:   'Type',
        textStyle: 'Style',
        textSeries: 'Series',
        textSecondary: 'Secondary Axis'

    }, SSE.Views.ChartTypeDialog || {}))
});
