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
 *  ChartWizardDialog.js
 *
 *  Created on 02/11/23
 *
 */
define([
    'common/main/lib/view/AdvancedSettingsWindow',
], function () {
    'use strict';

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

    SSE.Views.ChartWizardDialog = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 455,
            contentHeight: 400,
            toggleGroup: 'chart-recommend-group',
            storageName: 'sse-chart-recommend-category'
        },

        initialize : function(options) {
            var me = this,
                charts = [],
                groups = [],
                chartData = Common.define.chartData.getChartData();
            this._currentTabIndex = undefined;
            this._arrSeriesGroups = [];
            this._arrSeriesType = [];
            if (options.props.recommended) {
                for (var type in options.props.recommended) {
                    if (isNaN(parseInt(type))) continue;
                    for (var i=0; i<chartData.length; i++) {
                        if (parseInt(type)===chartData[i].type) {
                            charts.push(chartData[i]);
                            break;
                        }
                    }
                }
            }
            (charts.length>0) && groups.push({panelId: 'id-chart-recommended-rec', panelCaption: me.textRecommended, groupId: 'rec', charts: charts, categoryIcon: 'toolbar__icon ' + 'btn-chartcategory-recommended', categoryCls: 'png-icons'});
            Common.define.chartData.getChartGroupData().forEach(function(group) {
                var charts = [];
                chartData.forEach(function(item){
                    if (group.id===item.group) {
                        charts.push(item);
                        (options.type===item.type) && (me._currentTabIndex = groups.length);
                    }
                });
                groups.push({panelId: 'id-chart-recommended-' + group.id, panelCaption: group.caption, groupId: group.id, charts: charts, categoryIcon: 'toolbar__icon ' + 'btn-chartcategory-' + charts[0].iconCls, categoryCls: 'png-icons'});
                (group.id !== 'menu-chart-group-combo') && (group.id !== 'menu-chart-group-stock') && me._arrSeriesGroups.push(group);
            });

            chartData.forEach(function(item) {
                !item.is3d && item.type!==Asc.c_oAscChartTypeSettings.stock &&
                item.type!==Asc.c_oAscChartTypeSettings.comboBarLine && item.type!==Asc.c_oAscChartTypeSettings.comboBarLineSecondary &&
                item.type!==Asc.c_oAscChartTypeSettings.comboAreaBar && item.type!==Asc.c_oAscChartTypeSettings.comboCustom && me._arrSeriesType.push(item);
            });

            this.chartTabTemplate = [
                    '<div class="inner-content">',
                        '<div class="buttons-container">',
                        '<% _.each(group.charts, function(chart) { %>',
                            '<div id="id-<%= group.groupId %>-btn-<%= chart.type %>" class="margin-right-5" style="display: inline-block;margin-bottom:8px;"></div>',
                        '<% }); %>',
                        '</div>',
                    '</div>',
                    '<div class="inner-content" style="' + (Common.UI.isRTL() ? 'padding-left: 0;' : 'padding-right: 0;') + '">',
                        '<table cols="1" style="width: 100%;">',
                            '<tr>',
                                '<td class="padding-small"></td>',
                            '</tr>',
                            '<tr>',
                                '<td>',
                                    '<label class="header" id="id-<%= group.groupId %>-lbl"></label>',
                                '</td>',
                            '</tr>',
                            '<tr class="chart-error">',
                                '<td class="padding-very-small"></td>',
                            '</tr>',
                            '<tr class="chart-error">',
                                '<td>',
                                    '<label id="id-<%= group.groupId %>-lbl-error"></label>',
                                '</td>',
                            '</tr>',
                            '<tr class="preview-list">',
                                '<td style="padding-bottom:12px;">',
                                '<div id="id-<%= group.groupId %>-list-preview" style="width:100%; height: <% if (group.groupId === "menu-chart-group-combo") {%>163<% } else { %>258<% } %>px;"></div>',
                                '</td>',
                            '</tr>',
                            '<tr class="preview-one hidden">',
                                '<td style="padding: ' + (Common.UI.isRTL() ? '3px 3px 12px 12px' : '3px 12px 12px 3px') + ';">',
                                '<div id="id-<%= group.groupId %>-preview" class="preview-canvas-container" style="<% if (group.groupId === "menu-chart-group-combo") {%>width:280px; height: 160px;<% } else { %>width:100%; height:258px;<% } %>"></div>',
                                '</td>',
                            '</tr>',
                            '<% if (group.groupId === "menu-chart-group-combo") {%>',
                            '<tr class="preview-combo">',
                                '<td>',
                                '<label>' + this.txtSeriesDesc + '</label>',
                                '</td>',
                            '</tr>',
                            '<tr class="preview-combo">',
                                '<td style="padding: ' + (Common.UI.isRTL() ? '3px 3px 3px 12px' : '3px 12px 3px 3px') + ';">',
                                '<div id="id-<%= group.groupId %>-combo-preview" class="" style="width:100%; height: 113px;"></div>',
                                '</td>',
                            '</tr>',
                            '<% } %>',
                        '</table>',
                    '</div>',
            ].join('');
            var template = [
                '<% _.each(groups, function(group) { %>',
                '<div id="<%= group.panelId %>" class="settings-panel"></div>',
                '<% }); %>',
            ].join('');
            _.extend(this.options, {
                title: options.isEdit ? this.textTitleChange : this.textTitle,
                items: groups,
                contentTemplate: _.template(template)({
                    groups: groups,
                    scope: this
                })
            }, options);
            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);

            this.api = this.options.api;

            this.allCharts = [];
            this._currentChartType = null;
            this._currentChartSpace = null;
            this._currentPreviews = [];
            this._currentPreviewSize = [430, 258];
            this._currentTabSettings = null;
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);

            this.chartButtons = [];

            this.btnOk = _.find(this.getFooterButtons(), function (item) {
                return (item.$el && item.$el.find('.primary').addBack().filter('.primary').length>0);
            }) || new Common.UI.Button({ el: this.$window.find('.primary') });

            this.afterRender();
        },

        onCategoryClick: function(btn, index) {
            if ($("#" + btn.options.contentTarget).hasClass('active')) return;

            Common.Views.AdvancedSettingsWindow.prototype.onCategoryClick.call(this, btn, index);

            var me = this,
                item = this.options.items[index];
            !item.rendered && this.renderChartTab(item);
            this.fillPreviews(item);

            var buttons = item.chartButtons;
            if (buttons.length>0)  {
                buttons[me._openedButtonIndex].toggle(true);
                setTimeout(function(){
                    buttons[me._openedButtonIndex].focus();
                }, 10);
            }
        },

        renderChartTab: function(tab) {
            var me = this,
                $window = this.getChild();
            $window.find('#' + tab.panelId).append($(_.template(this.chartTabTemplate)({
                                                    group: tab,
                                                    scope: me
                                                })));
            // render controls
            me._openedButtonIndex = 0;
            tab.chartButtons = [];
            tab.charts.forEach(function(chart, index){
                var btn = new Common.UI.Button({
                    parentEl: $window.find('#id-' + tab.groupId + '-btn-' + chart.type),
                    cls: 'btn-options huge-1 svg-chartlist',
                    iconCls: 'svgicon ' + 'chart-' + chart.iconCls,
                    chart: chart,
                    hint: chart.tip,
                    enableToggle: true,
                    allowDepress: false,
                    toggleGroup : 'toggle-' + tab.groupId
                });
                btn.on('toggle', function(cmp, pressed) {
                    if (pressed) {
                        $window.find('#id-' + tab.groupId + '-lbl').text(chart.tip);
                        me._currentChartType = chart.type;
                        me.updatePreview();
                    }
                });
                tab.chartButtons.push(btn);
                me.chartButtons.push(btn);
                (chart.type===me.options.type) && (tab.groupId!=='rec') && (me._openedButtonIndex = index);
                Common.UI.FocusManager.insert(me, btn, -1 * me.getFooterButtons().length);
            });
            tab.divErrorEl = $window.find('#' + tab.panelId + ' .chart-error');
            tab.lblError = $window.find('#id-' + tab.groupId + '-lbl-error');
            tab.divPreviewEl = $window.find('#' + tab.panelId + ' .preview-one');
            tab.divPreviewId = 'id-' + tab.groupId + '-preview';
            tab.listViewEl = $window.find('#' + tab.panelId + ' .preview-list');
            tab.listPreview = new Common.UI.DataView({
                el: $window.find('#id-' + tab.groupId + '-list-preview'),
                cls: 'focus-inner',
                scrollAlwaysVisible: true,
                store: new Common.UI.DataViewStore(),
                itemTemplate : _.template([
                    '<div class="style" id="<%= id %>" style="width:210px; height:120px;"></div>'
                ].join('')),
                tabindex: 1
            });
            tab.listPreview.on({
                'item:select': function (dataView, itemView, record) {
                    if (record) {
                        me._currentChartSpace = record.get('data');
                        if (me._currentTabSettings.groupId === 'menu-chart-group-combo') {
                            me.updateSeriesList(me._currentChartSpace.asc_getSeries());
                        }
                    }
                },
                'item:add': function (dataView, itemView, record) {
                    record && record.get('data').updateView(record.get('id'));
                },
                'entervalue': _.bind(this.onPrimary, this)
            });
            Common.UI.FocusManager.insert(this, tab.listPreview, -1 * this.getFooterButtons().length);

            if (tab.groupId==='menu-chart-group-combo')
                this.renderSeries(tab);

            tab.rendered = true;
        },

        renderSeries: function(tab) {
            this.seriesList = new Common.UI.ListView({
                el: this.$window.find('#id-' + tab.groupId + '-combo-preview'),
                store: new Common.UI.DataViewStore(),
                emptyText: '',
                scrollAlwaysVisible: true,
                headers: [
                    {name: this.textSeries, width: 138},
                    {name: this.textType, width: 145},
                    {name: this.textSecondary, width: 130, style:'text-align: center;'},
                ],
                template: _.template(['<div class="listview inner" style=""></div>'].join('')),
                itemTemplate: _.template([
                    '<div class="list-item" style="width: 100%;" id="chart-recommend-item-<%= seriesIndex %>">',
                        '<div class="series-color" id="chart-recommend-series-preview-<%= seriesIndex %>"></div>',
                        '<div class="series-value" style="width: 125px;"><%= Common.Utils.String.htmlEncode(value) %></div>',
                        '<div class="series-cmb" style="width: 150px;"><div id="chart-recommend-cmb-series-<%= seriesIndex %>" class="input-group-nr" style=""></div></div>',
                        '<div class="series-chk"><div id="chart-recommend-chk-series-<%= seriesIndex %>" style=""></div></div>',
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
            this.seriesList.on('item:add', _.bind(this.addControls, this));
            this.seriesList.on('item:change', _.bind(this.addControls, this));
            this.seriesList.on('item:select', _.bind(this.onSelectSeries, this));
            this.seriesList.on('item:deselect', _.bind(this.onDeselectSeries, this));
            this.seriesList.on('entervalue', _.bind(this.onPrimary, this));
            this.listViewComboEl = this.$window.find('#' + tab.panelId + ' .preview-combo');
            Common.UI.FocusManager.insert(this, this.seriesList, -1 * this.getFooterButtons().length);
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
                cmpEl = this.seriesList.cmpEl.find('#chart-recommend-item-' + i),
                series = item.get('series');
            series.asc_drawPreviewRect('chart-recommend-series-preview-' + i);
            var combo = this.initSeriesType('#chart-recommend-cmb-series-' + i, i, item);
            var check = new Common.UI.CheckBox({
                el: cmpEl.find('#chart-recommend-chk-series-' + i),
                value: item.get('isSecondary'),
                disabled: !item.get('canChangeSecondary')
            });
            check.on('change', function(field, newValue, oldValue, eOpts) {
                var res = series.asc_TryChangeAxisType(field.getValue()==='checked');
                if (res !== Asc.c_oAscError.ID.No) {
                    field.setValue(field.getValue()!=='checked', true);
                } else
                    me.updatePreview(i);
            });
            cmpEl.on('mousedown', '.combobox', function(){
                me.seriesList.selectRecord(item);
            });
            item.set('controls', {checkbox: check, combobox: combo}, {silent: true});
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
                    me.updatePreview(index);
                } else {
                    var oldrecord = picker.store.findWhere({type: oldtype});
                    picker.selectRecord(oldrecord, true);
                    if (res===Asc.c_oAscError.ID.SecondaryAxis)
                        Common.UI.warning({msg: me.errorSecondaryAxis, maxwidth: 500});                    }
            });
            return combo;
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

        fillPreviews: function(tab) {
            this._currentPreviews = (tab.groupId==='rec') ? this.options.props.recommended : this.allCharts;
            this._currentPreviewSize = (tab.groupId==='menu-chart-group-combo') ? [280, 160] : [430, 258];
            this._currentTabSettings = tab;
        },

        updatePreview: function(seriesIndex) {
            var charts = this._currentPreviews[this._currentChartType];
            if (charts===undefined && this._currentTabSettings.groupId!=='rec') {
                charts = this._currentPreviews[this._currentChartType] = this.api.asc_getChartData(this._currentChartType);
            }
            this._currentTabSettings.divErrorEl.toggleClass('hidden', typeof charts !== 'number');
            if (typeof charts === 'number') { // show error
                var msg = '';
                switch (charts) {
                    case Asc.c_oAscError.ID.StockChartError:
                        msg = this.errorStockChart;
                        break;
                    case Asc.c_oAscError.ID.MaxDataSeriesError:
                        msg = this.errorMaxRows;
                        break;
                    case Asc.c_oAscError.ID.ComboSeriesError:
                        msg = this.errorComboSeries;
                        break;
                    case Asc.c_oAscError.ID.MaxDataPointsError:
                        msg = this.errorMaxPoints;
                        break;
                }
                this._currentTabSettings.lblError.text(msg);
                charts = null;
            }
            this._currentTabSettings.listViewEl.toggleClass('hidden', !charts || charts.length<2);
            this._currentTabSettings.divPreviewEl.toggleClass('hidden', !charts || charts.length!==1);
            (this._currentTabSettings.groupId==='menu-chart-group-combo') && this.listViewComboEl.toggleClass('hidden', !charts || charts.length===0);
            if (charts) {
                if (charts.length===1) {
                    this._currentChartSpace = charts[0];
                    this._currentChartSpace.updateView(this._currentTabSettings.divPreviewId);
                } else if (charts.length>1) {
                    var store = this._currentTabSettings.listPreview.store,
                        idx = (seriesIndex!==undefined) ? _.indexOf(store.models, this._currentTabSettings.listPreview.getSelectedRec()) : 0,
                        arr = [];
                    for (var i = 0; i < charts.length; i++) {
                        arr.push(new Common.UI.DataViewModel({
                            data: charts[i],
                            skipRenderOnChange: true
                        }));
                    }
                    store.reset(arr);
                    this._currentChartSpace = charts[idx];
                    this._currentTabSettings.listPreview.selectByIndex(idx, true);
                }
                charts.length>0 && (this._currentTabSettings.groupId==='menu-chart-group-combo') && this.updateSeriesList(this._currentChartSpace.asc_getSeries(), seriesIndex);
            }
            this.btnOk.setDisabled(!charts || charts.length===0);
        },

        afterRender: function() {
            this._setDefaults(this.options.props);
            this.setActiveCategory(this._currentTabIndex);
        },

        _setDefaults: function(props) {
            Common.UI.FocusManager.add(this, this.btnsCategory.concat(this.getFooterButtons()));
        },

        getSettings: function() {
            return this._currentChartSpace;
        },

        onDlgBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        onPrimary: function() {
            this._handleInput('ok');
            return false;
        },

        _handleInput: function(state) {
            if (this.handler) {
                if (state === 'ok' && this.btnOk.isDisabled()) {
                    return;
                }
                this.handler.call(this, state, (state === 'ok') ? this.getSettings() : undefined);
            }

            this.close();
        },

        textTitle: 'Insert Chart',
        textTitleChange: 'Change Chart Type',
        textRecommended: 'Recommended',
        txtSeriesDesc: 'Choose the chart type and axis for your data series',
        textType: 'Type',
        textSeries: 'Series',
        textSecondary: 'Secondary Axis',
        errorSecondaryAxis: 'The selected chart type requires the secondary axis that an existing chart is using. Select another chart type.',
        errorComboSeries: 'To create a combination chart, select at least two series of data.',
        errorStockChart: 'Incorrect row order. To build a stock chart place the data on the sheet in the following order: opening price, max price, min price, closing price.',
        errorMaxRows: 'The maximum number of data series per chart is 255.',
        errorMaxPoints: 'The maximum number of points in series per chart is 4096.'

    }, SSE.Views.ChartWizardDialog || {}));
});