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
 *  ChartRecommendedDialog.js
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

    SSE.Views.ChartRecommendedDialog = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 350,
            contentHeight: 330,
            toggleGroup: 'chart-recommend-group',
            storageName: 'sse-chart-recommend-category'
        },

        initialize : function(options) {
            var me = this,
                charts = [],
                groups = [],
                chartData = Common.define.chartData.getChartData();
            (options.charts || []).forEach(function(chart) {
                for (var i=0; i<chartData.length; i++) {
                    if (chart===chartData[i].type) {
                        charts.push(chartData[i]);
                        break;
                    }
                }
            });
            (charts.length>0) && groups.push({panelId: 'id-chart-recommended-rec', panelCaption: me.textRecommended, groupId: 'rec', charts: charts});
            Common.define.chartData.getChartGroupData().forEach(function(group) {
                var charts = [];
                chartData.forEach(function(item){
                    (group.id===item.group) && charts.push(item);
                });
                groups.push({panelId: 'id-chart-recommended-' + group.id, panelCaption: group.caption, groupId: group.id, charts: charts});
            });

            var template = [
                '<% _.each(groups, function(group) { %>',
                '<div id="<%= group.panelId %>" class="settings-panel">',
                    '<div class="inner-content">',
                        '<div class="buttons-container">',
                        '<% _.each(group.charts, function(chart) { %>',
                            '<div id="id-<%= group.groupId %>-btn-<%= chart.type %>" class="margin-right-5" style="display: inline-block;margin-bottom:8px;"></div>',
                        '<% }); %>',
                        '</div>',
                    '</div>',
                    '<div class="separator horizontal padding-small"></div>',
                    '<div class="inner-content">',
                        '<table cols="1" style="width: 100%;">',
                            '<tr>',
                                '<td class="padding-small">',
                                    '<label class="header" id="id-<%= group.groupId %>-lbl"></label>',
                                '</td>',
                            '</tr>',
                            '<tr class="preview-list hidden">',
                                '<td class="padding-small">',
                                '<div id="id-<%= group.groupId %>-list-preview" class="preview-canvas-container" style="width:100%; height: 176px;"></div>',
                                '</td>',
                            '</tr>',
                            '<tr class="preview-one">',
                                '<td class="padding-small">',
                                '<div id="id-<%= group.groupId %>-preview" class="preview-canvas-container" style="width:100%; height: 176px;"></div>',
                                '</td>',
                            '</tr>',
                        '</table>',
                    '</div>',
                '</div>',
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

            this._originalProps = this.options.props;
            this._charts = this.options.charts;
            this._currentChartType = null;
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);

            var me = this,
                $window = this.getChild();
            this.chartButtons = [];
            this.options.items.forEach(function(item) {
                item.chartButtons = [];
                item.charts.forEach(function(chart, index){
                    var btn = new Common.UI.Button({
                        parentEl: $window.find('#id-' + item.groupId + '-btn-' + chart.type),
                        cls: 'btn-options huge-1 svg-chartlist',
                        iconCls: 'svgicon ' + 'chart-' + chart.iconCls,
                        chart: chart,
                        hint: chart.tip,
                        enableToggle: true,
                        allowDepress: false,
                        toggleGroup : 'toggle-' + item.groupId
                    });
                    btn.on('toggle', function(cmp, pressed) {
                        if (pressed) {
                            $window.find('#id-' + item.groupId + '-lbl').text(chart.tip);
                            me._currentChartType = chart.type;
                        }
                    });
                    item.chartButtons.push(btn);
                    me.chartButtons.push(btn);
                });
            });

            this.afterRender();
        },

        getFocusedComponents: function() {
            return this.btnsCategory.concat(this.chartButtons).concat(this.getFooterButtons());
        },

        onCategoryClick: function(btn, index) {
            if ($("#" + btn.options.contentTarget).hasClass('active')) return;

            Common.Views.AdvancedSettingsWindow.prototype.onCategoryClick.call(this, btn, index);

            var buttons = this.options.items[index].chartButtons;
            if (buttons.length>0)  {
                buttons[0].toggle(true);
                setTimeout(function(){
                    buttons[0].focus();
                }, 10);
            }
        },

        afterRender: function() {
            this._setDefaults(this._originalProps);
            this.setActiveCategory(0);
        },

        _setDefaults: function(props) {
            if (props){

            }
        },

        getSettings: function() {
            return { type: this._currentChartType} ;
        },

        textTitle: 'Insert Chart',
        textRecommended: 'Recommended'

    }, SSE.Views.ChartRecommendedDialog || {}));
});