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
 *  ChartTypeDialog.js
 *
 *  Created on 03.12.2020
 *
 */

define([
    'common/main/lib/view/AdvancedSettingsWindow',
], function () { 'use strict';

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

    SSE.Views.ChartTypeDialog = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 370,
            contentHeight: 300,
            separator: false
        },

        initialize : function(options) {
            var me = this;

            _.extend(this.options, {
                title: this.textTitle,
                contentStyle: 'padding: 0 10px;',
                contentTemplate: _.template([
                    '<div class="settings-panel active">',
                        '<div class="inner-content">',
                            '<table cols="1" style="width: 100%;">',
                                '<tr>',
                                    '<td class="padding-large">',
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
                                    '<td class="padding-small">',
                                        '<div id="chart-type-dlg-series-list" class="" style="width:100%; height: 203px;"></div>',
                                    '</td>',
                                '</tr>',
                            '</table>',
                        '</div></div>'
                ].join(''))({scope: this})
            }, options);

            this.handler    = options.handler;

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);

            this._changedProps = null;

            this.api = this.options.api;
            this.chartSettings = this.options.chartSettings;
            this.currentChartType = Asc.c_oAscChartTypeSettings.barNormal;

            this.wrapEvents = {
                onAddChartStylesPreview: _.bind(this.onAddChartStylesPreview, this)
            };
            this.api.asc_registerCallback('asc_onAddChartStylesPreview', this.wrapEvents.onAddChartStylesPreview);
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            var arr = Common.define.chartData.getChartGroupData();
            this._arrSeriesGroups = [];
            arr.forEach(function(item) {
                (item.id !== 'menu-chart-group-combo') && (item.id !== 'menu-chart-group-stock') && me._arrSeriesGroups.push(item);
            });
            arr = Common.define.chartData.getChartData();
            this._arrSeriesType = [];
            arr.forEach(function(item) {
                !item.is3d && item.type!==Asc.c_oAscChartTypeSettings.stock &&
                item.type!==Asc.c_oAscChartTypeSettings.comboBarLine && item.type!==Asc.c_oAscChartTypeSettings.comboBarLineSecondary &&
                item.type!==Asc.c_oAscChartTypeSettings.comboAreaBar && item.type!==Asc.c_oAscChartTypeSettings.comboCustom && me._arrSeriesType.push(item);
            });

            this.btnChartType = new Common.UI.Button({
                cls         : 'btn-large-dataview',
                iconCls     : 'svgicon chart-bar-normal',
                menu        : new Common.UI.Menu({
                    style: 'width: 364px;',
                    additionalAlign: this.menuAddAlign,
                    items: [
                        { template: _.template('<div id="chart-type-dlg-menu-type" class="menu-insertchart"></div>') }
                    ]
                }),
                takeFocusOnClose: true
            });
            this.btnChartType.on('render:after', function(btn) {
                me.mnuChartTypePicker = new Common.UI.DataView({
                    el: $('#chart-type-dlg-menu-type', me.$window),
                    parentMenu: btn.menu,
                    restoreHeight: 535,
                    groups: new Common.UI.DataViewGroupStore(Common.define.chartData.getChartGroupData()),
                    store: new Common.UI.DataViewStore(arr),
                    itemTemplate: _.template('<div id="<%= id %>" class="item-chartlist"><svg width="40" height="40" class=\"icon uni-scale\"><use xlink:href=\"#chart-<%= iconCls %>\"></use></svg></div>')
                });
            });
            this.btnChartType.render($('#chart-type-dlg-button-type'), this.$window);
            this.mnuChartTypePicker.on('item:click', _.bind(this.onSelectType, this));

            this.stylesList = new Common.UI.DataView({
                el: $('#chart-type-dlg-styles-list', this.$window),
                store: new Common.UI.DataViewStore(),
                cls: 'bordered',
                itemTemplate : _.template([
                    '<div class="style" id="<%= id %>">',
                        '<img src="<%= imageUrl %>" width="50" height="50" <% if(typeof imageUrl === "undefined" || imageUrl===null || imageUrl==="") { %> style="visibility: hidden;" <% } %>/>',
                        '<% if (typeof title !== "undefined") {%>',
                            '<span class="title"><%= title %></span>',
                        '<% } %>',
                    '</div>'
                ].join('')),
                delayRenderTips: true,
                tabindex: 1
            });
            this.stylesList.on('item:select', _.bind(this.onSelectStyles, this));
            this.stylesList.on('entervalue', _.bind(this.onPrimary, this));

            this.seriesList = new Common.UI.ListView({
                el: $('#chart-type-dlg-series-list', this.$window),
                store: new Common.UI.DataViewStore(),
                emptyText: '',
                scrollAlwaysVisible: true,
                headers: [
                    {name: me.textSeries, width: 108},
                    {name: me.textType, width: 105},
                    {name: me.textSecondary, width: 123, style:'text-align: center;'},
                ],
                template: _.template(['<div class="listview inner" style=""></div>'].join('')),
                itemTemplate: _.template([
                    '<div class="list-item" style="width: 100%;" id="chart-type-dlg-item-<%= seriesIndex %>">',
                        '<div class="series-color" id="chart-type-dlg-series-preview-<%= seriesIndex %>"></div>',
                        '<div class="series-value"><%= Common.Utils.String.htmlEncode(value) %></div>',
                        '<div class="series-cmb"><div id="chart-type-dlg-cmb-series-<%= seriesIndex %>" class="input-group-nr" style=""></div></div>',
                        '<div class="series-chk"><div id="chart-type-dlg-chk-series-<%= seriesIndex %>" style=""></div></div>',
                    '</div>'
                ].join('')),
                tabindex: 1
            });
            this.seriesList.createNewItem = function(record) {
                return new _CustomItem({
                    template: this.itemTemplate,
                    model: record
                });
            };
            this.NotCombinedSettings = $('.simple-chart', this.$window);
            this.CombinedSettings = $('.combined-chart', this.$window);

            this.afterRender();
        },

        afterRender: function() {
            this._setDefaults(this.chartSettings);
        },

        getFocusedComponents: function() {
            return [this.btnChartType, this.stylesList, this.seriesList].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.btnChartType;
        },

        show: function() {
            Common.Views.AdvancedSettingsWindow.prototype.show.apply(this, arguments);
        },

        close: function () {
            this.api.asc_onCloseChartFrame();
            this.api.asc_unregisterCallback('asc_onAddChartStylesPreview', this.wrapEvents.onAddChartStylesPreview);
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
                } else {
                    var iconcls = '';
                    switch (this.currentChartType) {
                        case Asc.c_oAscChartTypeSettings.surfaceNormal:
                            iconcls = 'chart-surface-normal';
                            break;
                        case Asc.c_oAscChartTypeSettings.surfaceWireframe:
                            iconcls = 'chart-surface-wireframe';
                            break;
                        case Asc.c_oAscChartTypeSettings.contourNormal:
                            iconcls = 'chart-contour-wireframe';
                            break;
                        case Asc.c_oAscChartTypeSettings.contourWireframe:
                            iconcls = 'chart-contour-wireframe';
                            break;

                    }
                    this.btnChartType.setIconCls('svgicon ' + iconcls);
                }
                this.seriesList.on('item:add', _.bind(this.addControls, this));
                this.seriesList.on('item:change', _.bind(this.addControls, this));
                this.seriesList.on('item:select', _.bind(this.onSelectSeries, this));
                this.seriesList.on('item:deselect', _.bind(this.onDeselectSeries, this));
                this.seriesList.on('entervalue', _.bind(this.onPrimary, this));
                this.ShowHideSettings(this.currentChartType);
                if (this.currentChartType==Asc.c_oAscChartTypeSettings.comboBarLine || this.currentChartType==Asc.c_oAscChartTypeSettings.comboBarLineSecondary ||
                    this.currentChartType==Asc.c_oAscChartTypeSettings.comboAreaBar || this.currentChartType==Asc.c_oAscChartTypeSettings.comboCustom) {
                    this.updateSeriesList(this.chartSettings.getSeries());
                } else {
                    this.updateChartStyles(this.api.asc_getChartPreviews(this.currentChartType, undefined, true));
                    this.api.asc_generateChartPreviews(this.currentChartType);
                }
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
            var isCombo = rawData.type==Asc.c_oAscChartTypeSettings.comboBarLine || rawData.type==Asc.c_oAscChartTypeSettings.comboBarLineSecondary ||
                          rawData.type==Asc.c_oAscChartTypeSettings.comboAreaBar || rawData.type==Asc.c_oAscChartTypeSettings.comboCustom;
            if (isCombo && this.chartSettings.getSeries().length<2) {
                Common.UI.warning({msg: this.errorComboSeries, maxwidth: 600});
                return;
            }

            var res = this.chartSettings.changeType(rawData.type);
            if (res) {
                this.btnChartType.setIconCls('svgicon ' + 'chart-' + rawData.iconCls);
                this.currentChartType = rawData.type;
                this.ShowHideSettings(this.currentChartType);
                if (isCombo)
                    this.updateSeriesList(this.chartSettings.getSeries());
                else {
                    this.updateChartStyles(this.api.asc_getChartPreviews(this.currentChartType, undefined, true));
                    this.api.asc_generateChartPreviews(this.currentChartType);
                }
            } else {
                picker.selectRecord(picker.store.findWhere({type: this.currentChartType}), true);
            }

        },

        updateChartStyles: function(styles) {
            var me = this;
            if (styles && styles.length>0){
                var stylesStore = this.stylesList.store;
                if (stylesStore) {
                    var stylearray = [];
                    _.each(styles, function(item, index){
                        stylearray.push({
                            imageUrl: item.asc_getImage(),
                            data    : item.asc_getName(),
                            tip     : me.textStyle + ' ' + item.asc_getName()
                        });
                    });
                    stylesStore.reset(stylearray, {silent: false});
                }
            } else {
                this.stylesList.store.reset();
            }
            this.stylesList.setDisabled(!styles || styles.length<1);
        },
        
        onSelectStyles: function(dataView, itemView, record) {
            if (!record) return;
            this.chartSettings.putStyle(record.get('data'));
        },

        onAddChartStylesPreview: function(styles){
            var me = this;
            if (styles && styles.length>0){
                var stylesStore = this.stylesList.store;
                if (stylesStore) {
                    _.each(styles, function(item, index){
                        var rec = stylesStore.findWhere({
                            data: item.asc_getName()
                        });
                        rec && rec.set('imageUrl', item.asc_getImage());
                    });
                }
            }
        },

        updateSeriesList: function(series, index) {
            var me = this,
                arr = [],
                store = this.seriesList.store;
            this.beforeSeriesReset(store);
            for (var i = 0, len = series.length; i < len; i++)
            {
                var item = series[i],
                    rec = new Common.UI.DataViewModel();
                rec.set({
                    value: item.asc_getSeriesName(),
                    type: item.asc_getChartType(),
                    isSecondary: item.asc_getIsSecondaryAxis(),
                    canChangeSecondary: item.asc_canChangeAxisType(),
                    seriesIndex: i,
                    series: item
                });
                arr.push(rec);
            }
            store.reset(arr);
            (arr.length>0) && (index!==undefined) && (index < arr.length) && this.seriesList.selectByIndex(index);
            if (arr.length>0 && index!==undefined) {
                (index < arr.length) && this.seriesList.selectByIndex(index);
                setTimeout(function(){
                    me.seriesList.focus();
                }, 10);
            }
        },

        addControls: function(listView, itemView, item) {
            if (!item) return;

            var me = this,
                i = item.get('seriesIndex'),
                cmpEl = this.seriesList.cmpEl.find('#chart-type-dlg-item-' + i),
                series = item.get('series');
            series.asc_drawPreviewRect('chart-type-dlg-series-preview-' + i);
            var combo = this.initSeriesType('#chart-type-dlg-cmb-series-' + i, i, item);
            var check = new Common.UI.CheckBox({
                el: cmpEl.find('#chart-type-dlg-chk-series-' + i),
                value: item.get('isSecondary'),
                disabled: !item.get('canChangeSecondary')
            });
            check.on('change', function(field, newValue, oldValue, eOpts) {
                var res = series.asc_TryChangeAxisType(field.getValue()=='checked');
                if (res !== Asc.c_oAscError.ID.No) {
                    field.setValue(field.getValue()!='checked', true);
                } else
                    me.updateSeriesList(me.chartSettings.getSeries(), i);
            });
            cmpEl.on('mousedown', '.combobox', function(){
                me.seriesList.selectRecord(item);
            });
            item.set('controls', {checkbox: check, combobox: combo}, {silent: true});
        },

        onDeselectSeries: function(listView, itemView, item) {
            if (item && item.get('controls')) {
                var controls = item.get('controls');
                Common.UI.FocusManager.remove(this, controls.index, 2);
                controls.index = undefined;
            }
        },

        onSelectSeries: function(listView, itemView, item, fromKeyDown) {
            if (item && item.get('controls')) {
                var controls = item.get('controls'),
                    res = Common.UI.FocusManager.insert(this, [controls.combobox, controls.checkbox], -1 * this.getFooterButtons().length);
                (res!==undefined) && (controls.index = res);
                fromKeyDown && setTimeout(function(){
                    listView.focus();
                }, 1);
            }
        },

        beforeSeriesReset: function(store) {
            for (var i=0; i<store.length; i++) {
                var item = store.at(i);
                if (item) {
                    var controls = item.get('controls');
                    if (controls && controls.index!==undefined) {
                        Common.UI.FocusManager.remove(this, controls.index, 2);
                        break;
                    }
                }
            }
        },

        initSeriesType: function(id, index, item) {
            var me = this,
                series = item.get('series'),
                store = new Common.UI.DataViewStore(me._arrSeriesType),
                currentTypeRec = store.findWhere({type: item.get('type')}),
                el = $(id);
            var combo = new Common.UI.ComboBoxDataView({
                el: el,
                additionalAlign: this.menuAddAlign,
                cls: 'move-focus',
                menuCls: 'menu-absolute',
                menuStyle: 'width: 318px;',
                dataViewCls: 'menu-insertchart',
                restoreHeight: 535,
                groups: new Common.UI.DataViewGroupStore(me._arrSeriesGroups),
                store: store,
                formTemplate: _.template([
                    '<input type="text" class="form-control" spellcheck="false">',
                ].join('')),
                itemTemplate: _.template('<div id="<%= id %>" class="item-chartlist"><svg width="40" height="40" class=\"icon uni-scale\"><use xlink:href=\"#chart-<%= iconCls %>\"></use></svg></div>'),
                takeFocusOnClose: true,
                updateFormControl: function(record) {
                    $(this.el).find('input').val(record ? record.get('tip') : '');
                }
            });
            combo.selectRecord(currentTypeRec);
            combo.on('item:click', function(cmb, picker, view, record){
                var oldtype = item.get('type');
                var res = series.asc_TryChangeChartType(record.get('type'));
                if (res === Asc.c_oAscError.ID.No) {
                    cmb.selectRecord(record);
                    me.updateSeriesList(me.chartSettings.getSeries(), index);
                } else {
                    var oldrecord = picker.store.findWhere({type: oldtype});
                    picker.selectRecord(oldrecord, true);
                    if (res===Asc.c_oAscError.ID.SecondaryAxis)
                        Common.UI.warning({msg: me.errorSecondaryAxis, maxwidth: 500});                    }
            });
            return combo;
        },

        ShowHideSettings: function(type) {
            var isCombo = type==Asc.c_oAscChartTypeSettings.comboBarLine || type==Asc.c_oAscChartTypeSettings.comboBarLineSecondary ||
                          type==Asc.c_oAscChartTypeSettings.comboAreaBar || type==Asc.c_oAscChartTypeSettings.comboCustom;
            this.NotCombinedSettings.toggleClass('hidden', isCombo);
            this.CombinedSettings.toggleClass('hidden', !isCombo);
        },

        textTitle: 'Chart Type',
        textType:   'Type',
        textStyle: 'Style',
        textSeries: 'Series',
        textSecondary: 'Secondary Axis',
        errorSecondaryAxis: 'The selected chart type requires the secondary axis that an existing chart is using. Select another chart type.',
        errorComboSeries: 'To create a combination chart, select at least two series of data.'

    }, SSE.Views.ChartTypeDialog || {}))
});
