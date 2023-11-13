/*
 * (c) Copyright Ascensio System SIA 2010-2023
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
 *  Created by Julia Radzhabova on 02/11/23
 *  Copyright (c) 2023 Ascensio System SIA. All rights reserved.
 *
 */
define(['common/main/lib/view/AdvancedSettingsWindow',
    'common/main/lib/component/Button',
    'common/main/lib/component/DataView'
], function () {
    'use strict';

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
            (charts.length>0) && groups.push({panelId: 'id-chart-recommended-rec', panelCaption: me.textRecommended, groupId: 'rec', charts: charts});
            Common.define.chartData.getChartGroupData().forEach(function(group) {
                var charts = [];
                chartData.forEach(function(item){
                    (group.id===item.group) && charts.push(item);
                });
                groups.push({panelId: 'id-chart-recommended-' + group.id, panelCaption: group.caption, groupId: group.id, charts: charts});
            });

            this.chartTabTemplate = [
                    '<div class="inner-content">',
                        '<div class="buttons-container">',
                        '<% _.each(group.charts, function(chart) { %>',
                            '<div id="id-<%= group.groupId %>-btn-<%= chart.type %>" class="margin-right-5" style="display: inline-block;margin-bottom:8px;"></div>',
                        '<% }); %>',
                        '</div>',
                    '</div>',
                    '<div class="separator horizontal padding-small"></div>',
                    '<div class="inner-content" style="' + (Common.UI.isRTL() ? 'padding-left: 0;' : 'padding-right: 0;') + '">',
                        '<table cols="1" style="width: 100%;">',
                            '<tr>',
                                '<td>',
                                    '<label class="header" id="id-<%= group.groupId %>-lbl"></label>',
                                '</td>',
                            '</tr>',
                            '<tr class="preview-list hidden">',
                                '<td>',
                                '<div id="id-<%= group.groupId %>-list-preview" class="" style="width:100%; height: 258px;"></div>',
                                '</td>',
                            '</tr>',
                            '<tr class="preview-one">',
                                '<td style="padding: ' + (Common.UI.isRTL() ? '3px 3px 3px 12px' : '3px 12px 3px 3px') + ';">',
                                '<div id="id-<%= group.groupId %>-preview" class="preview-canvas-container" style="width:100%; height: 258px;background-size: cover; background-repeat: no-repeat;"></div>',
                                '</td>',
                            '</tr>',
                        '</table>',
                    '</div>',
            ].join('');
            var template = [
                '<% _.each(groups, function(group) { %>',
                '<div id="<%= group.panelId %>" class="settings-panel"></div>',
                '<% }); %>',
            ].join('');
            _.extend(this.options, {
                title: this.textTitle,
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

            var item = this.options.items[index];
            !item.rendered && this.renderChartTab(item);
            this.fillPreviews(index);

            var buttons = item.chartButtons;
            if (buttons.length>0)  {
                buttons[0].toggle(true);
                setTimeout(function(){
                    buttons[0].focus();
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
                Common.UI.FocusManager.insert(me, btn, -1 * me.getFooterButtons().length);
            });
            tab.listViewEl = $window.find('#' + tab.panelId + ' .preview-list');
            tab.divPreviewEl = $window.find('#' + tab.panelId + ' .preview-one');
            tab.divPreview = $window.find('#id-' + tab.groupId + '-preview');
            tab.listPreview = new Common.UI.DataView({
                el: $window.find('#id-' + tab.groupId + '-list-preview'),
                cls: 'focus-inner',
                scrollAlwaysVisible: true,
                store: new Common.UI.DataViewStore(),
                itemTemplate : _.template([
                    '<div class="style" id="<%= id %>">',
                    '<img src="<%= imageUrl %>" width="210" height="120" <% if(typeof imageUrl === "undefined" || imageUrl===null || imageUrl==="") { %> style="visibility: hidden;" <% } %>/>',
                    '</div>'
                ].join('')),
                tabindex: 1
            });
            tab.listPreview.on('item:select', function(dataView, itemView, record) {
                if (record) {
                    me._currentChartSpace = record.get('data');
                }
            });
            Common.UI.FocusManager.insert(this, tab.listPreview, -1 * this.getFooterButtons().length);

            tab.rendered = true;
        },

        fillPreviews: function(index) {
            if (index===0)
                this._currentPreviews = this.options.props.recommended;
            else
                this._currentPreviews = this.allCharts;
            this._currentTabSettings = this.options.items[index];
        },

        updatePreview: function() {
            var charts = this._currentPreviews[this._currentChartType];
            if (charts===undefined && this._currentTabSettings.groupId!=='rec') {
                charts = this._currentPreviews[this._currentChartType] = this.api.asc_getChartData(this._currentChartType);
            }
            if (charts) {
                this._currentTabSettings.listViewEl.toggleClass('hidden', charts.length<2);
                this._currentTabSettings.divPreviewEl.toggleClass('hidden', charts.length!==1);
                if (charts.length===1) {
                    this._currentChartSpace = charts[0];
                    this._currentTabSettings.divPreview.css('background-image', 'url(' + this._currentChartSpace.asc_getPreview() + ')');
                } else if (charts.length>1) {
                    var store = this._currentTabSettings.listPreview.store,
                        arr = [];
                    for (var i = 0; i < charts.length; i++) {
                        arr.push(new Common.UI.DataViewModel({
                            imageUrl: charts[i].asc_getPreview(),
                            data: charts[i]
                        }));
                    }
                    store.reset(arr);
                    this._currentTabSettings.listPreview.selectByIndex(0);
                }
            }
            this.btnOk.setDisabled(!charts || charts.length===0);
        },

        afterRender: function() {
            this._setDefaults(this.options.props);
            this.setActiveCategory(0);
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
        textRecommended: 'Recommended'

    }, SSE.Views.ChartWizardDialog || {}));
});