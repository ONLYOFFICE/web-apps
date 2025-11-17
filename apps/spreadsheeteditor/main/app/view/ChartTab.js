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
 *  ChartTab.js
 *
 *  Created on 06.10.2025
 *
 */

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/Button',
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Layout'
], function () {
    'use strict';

    SSE.Views.ChartTab = Common.UI.BaseView.extend(_.extend((function(){
        var template = '<section id="chart-design-panel" class="panel" data-tab="charttab" role="tabpanel" aria-labelledby="view">' +
            '<div class="group">' +
                '<span class="btn-slot text x-huge" id="slot-btn-chart-elements"></span>' +
            '</div>' +
            '<div class="separator long"></div>' +
            '<div class="group">' +
                '<span class="btn-slot text x-huge" id="slot-btn-chart-type"></span>' +
            '</div>' +
            '<div class="separator long"></div>' +
            '<div class="group">' +
                '<span class="btn-slot text x-huge" id="slot-btn-select-data"></span>' +
                '<span class="btn-slot text x-huge" id="slot-btn-switch-rowscols"></span>' +
            '</div>' +
            '<div class="separator long"></div>' +
            '<div class="group small">' +
                '<div class="elset" style="text-align: center;">' +
                    '<span class="btn-slot text font-size-normal" id="slot-lbl-width" style="text-align: center;margin-top: 2px;"></span>' +
                '</div>' +
                '<div class="elset" style="text-align: center;">' +
                    '<span class="btn-slot text font-size-normal" id="slot-lbl-height" style="text-align: center;margin-top: 2px;"></span>' +
                '</div>' +
            '</div>' +
            '<div class="group small">' +
                '<div class="elset">' +
                    '<div id="chart-spin-width"></div>' +
                '</div>' +
                '<div class="elset">' +
                    '<div id="chart-spin-height"></div>' +
                '</div>' +
            '</div>' +
            '<div class="group small">' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-chk-ratio"></span>' +
                '</div>' +
                '<div class="elset">' +
                '</div>' +
            '</div>' +
            '<div class="separator long"></div>' +
            '<div class="group flex small" id="slot-field-chart-styles" style="width: 100%; min-width: 105px;" data-group-width="100%">' +
            '</div>' +
            '<div class="separator long"></div>' +
            '<div class="group">' +
                '<span class="btn-slot text x-huge" id="slot-btn-chart-3d-settings"></span>' +
            '</div>' +
            '<div class="group">' +
                '<span class="btn-slot text x-huge" id="slot-btn-chart-advanced-settings"></span>' +
            '</div>' +
        '</section>';

        function setEvents() {
            var me = this;

            me.btnChartElements.on('click', function (btn, e) {
                me.fireEvent('charttab:updatemenu', [me.menuChartElement.menu]);
            });
            me.menuChartElement.menu.items.forEach(item => {
                    if (item.menu) {
                        item.menu.items.forEach(item => {
                            item.on('click', function() {
                                me.fireEvent('charttab:elementselected', [item.menu, item]);
                            });
                        });
                    }
                });
            me.btnChartType.on('click', function (btn, e) {
                me.fireEvent('charttab:type');
            });
            me.btnSelectData.on('click', function (btn, e) {
                me.fireEvent('charttab:selectdata');
            });
            me.btnSwitchRowsCols.on('click', function (btn, e) {
                me.fireEvent('charttab:rowscols');
            });
            me.btn3DSettings.on('click', function (btn, e) {
                me.fireEvent('charttab:3dsettings');
            });
            me.btnAdvancedSettings.on('click', function (btn, e) {
                me.fireEvent('charttab:advanced');
            });
            me.spnWidth.on('change', function () {
                me.fireEvent('charttab:widthchange');
            });
            me.spnHeight.on('change',function () {
                me.fireEvent('charttab:heightchange');
            });
            me.chRatio.on('change',function (field, value) {
                me.fireEvent('charttab:ratio', [value === 'checked']);
            });
        }

        return {
            initialize: function (options) {
                var controller = SSE.getController('ChartTab');
                this._state = controller._state;
                Common.UI.BaseView.prototype.initialize.call(this);

                this.lockedControls = [];

                var me = this,
                    _set = Common.enumLock;

                this.menuChartElement = new Common.UI.MenuItem({
                    menu: new Common.UI.Menu({
                        items: [
                            {
                                caption: me.textAxes,
                                value: 'axes',
                                disabled: false,
                                menu: new Common.UI.Menu({
                                    cls: 'shifted-right',
                                    menuAlign: 'tl-tr',
                                    items: [
                                        {
                                            caption: me.textHorAxis,
                                            value: 'bShowHorAxis',
                                            stopPropagation: true,
                                            checkable: true
                                        },
                                        {
                                            caption: me.textVertAxis,
                                            value: 'bShowVertAxis',
                                            stopPropagation: true,
                                            checkable: true
                                        },
                                        { 
                                            caption: me.textHorAxisSec,
                                            value: 'bShowHorAxSec',
                                            stopPropagation: true,
                                            checkable: true
                                        },
                                        { 
                                            caption: me.textVertAxisSec,
                                            value: 'bShowVertAxSec',
                                            stopPropagation: true,
                                            checkable: true
                                        },
                                        { 
                                            caption: me.DepthAxis,
                                            value: 'bShowDepthAxes',
                                            stopPropagation: true,
                                            checkable: true
                                        }
                                    ]
                                })
                            },
                            { 
                                caption: me.textAxisTitles,
                                value: 'axisTitles',
                                disabled: false,
                                menu: new Common.UI.Menu({
                                    cls: 'shifted-right',
                                    menuAlign: 'tl-tr',
                                    items: [
                                        {
                                            caption:me.textHorAxis,
                                            value: 'bShowHorAxTitle',
                                            stopPropagation: true,
                                            checkable: true
                                        },
                                        {
                                            caption: me.textVertAxis,
                                            value: 'bShowVertAxTitle',
                                            stopPropagation: true,
                                            checkable: true
                                        },
                                        {
                                            caption:  me.textHorAxisSec,
                                            value: 'bShowHorAxTitleSec',
                                            stopPropagation: true,
                                            checkable: true
                                        },
                                        {
                                            caption: me.textVertAxisSec,
                                            value: 'bShowVertAxisTitleSec',
                                            stopPropagation: true,
                                            checkable: true
                                        },
                                        { 
                                            caption: me.DepthAxis,
                                            value: 'bShowDepthAxisTitle',
                                            stopPropagation: true,
                                            checkable: true
                                        }
                                    ]
                                })
                            },
                            { 
                                caption: me.textChartTitle,
                                value: 'chartTitle',
                                disabled: false,
                                menu: new Common.UI.Menu({
                                    cls: 'shifted-right',
                                    menuAlign: 'tl-tr',
                                    items: [
                                        { 
                                            caption: me.textNone,
                                            value: 'bShowChartTitleNone',
                                            stopPropagation: true, 
                                            toggleGroup: 'chartTitle',
                                            checkable: true
                                        },
                                        { 
                                            caption: me.textNoOverlay,
                                            value: 'bShowChartTitle',
                                            stopPropagation: true,
                                            toggleGroup: 'chartTitle',
                                            checkable: true
                                        },
                                        { 
                                            caption: me.textOverlay,
                                            value: 'bOverlayTitle',
                                            stopPropagation: true,
                                            toggleGroup: 'chartTitle',
                                            checkable: true
                                        }
                                    ]
                                })
                            },
                            { 
                                caption: me.textDataLabels,
                                value: 'dataLabels', 
                                disabled: false,
                                menu: new Common.UI.Menu({
                                    cls: 'shifted-right',  
                                    menuAlign: 'tl-tr',
                                    items: [
                                        { 
                                            caption: me.textNone,
                                            value: 'bShowDataLabels',
                                            stopPropagation: true,
                                            toggleGroup: 'dataLabels',
                                            checkable: true
                                        },
                                        { 
                                            caption: me.textCenter,
                                            value: 'CenterData',
                                            stopPropagation: true,
                                            toggleGroup: 'dataLabels',
                                            checkable: true
                                        },
                                        {   
                                            caption: me.textInnerBottom,
                                            value: 'InnerBottomData',
                                            stopPropagation: true,
                                            toggleGroup: 'dataLabels',
                                            checkable: true
                                        },
                                        { 
                                            caption: me.textInnerTop,
                                            value: 'InnerTopData',
                                            stopPropagation: true,
                                            toggleGroup: 'dataLabels',
                                            checkable: true
                                        },
                                        { 
                                            caption: me.textOuterTop,
                                            value: 'OuterTopData',
                                            stopPropagation: true,
                                            toggleGroup: 'dataLabels',
                                            checkable: true
                                        },
                                        { 
                                            caption: me.textTop,
                                            value: 'TopData',
                                            stopPropagation: true,
                                            toggleGroup: 'dataLabels',
                                            checkable: true
                                        },
                                        { 
                                            caption: me.textLeft,
                                            value: 'LeftData',
                                            stopPropagation: true,
                                            toggleGroup: 'dataLabels',
                                            checkable: true
                                        },
                                        { 
                                            caption: me.textRight,
                                            value: 'RightData',
                                            stopPropagation: true,  
                                            checkable: true
                                        },
                                        { 
                                            caption: me.textBottom,
                                            value: 'BottomData',
                                            stopPropagation: true,
                                            toggleGroup: 'dataLabels',
                                            checkable: true
                                        },
                                        { 
                                            caption: me.textFit,
                                            value: 'FitWidthData',
                                            stopPropagation: true,
                                            toggleGroup: 'dataLabels',
                                            checkable: true
                                        }                 
                                    ]
                                })
                            },
                            {
                                caption: me.textErrorBars,
                                value: 'errorBars',
                                disabled: false,
                                menu: new Common.UI.Menu({
                                    cls: 'shifted-right',  
                                    menuAlign: 'tl-tr',
                                    items: [
                                        {
                                            caption: me.textStandardError,
                                            value: 'standardError',
                                            stopPropagation: true, 
                                            disabled: false
                                        },
                                        {
                                            caption: me.txtPercentage,
                                            value: 'percentage',
                                            stopPropagation: true, 
                                            disabled: false
                                        },
                                        {
                                            caption: me.textStandardDeviation,
                                            value: 'standardDeviation',
                                            stopPropagation: true, 
                                            disabled: false
                                        }
                                    ]
                                })
                            },
                            { 
                                caption: me.textGridLines,
                                value: 'gridLines', 
                                disabled: false,
                                menu: new Common.UI.Menu({
                                    cls: 'shifted-right',  
                                    menuAlign: 'tl-tr',
                                    items: [
                                        { 
                                            caption: me.textHorizontalMajor,
                                            value: 'bShowHorMajor',
                                            stopPropagation: true,  
                                            checkable: true
                                        },
                                        { 
                                            caption: me.textVerticalMajor,
                                            value: 'bShowVerMajor',
                                            stopPropagation: true,  
                                            checkable: true
                                        },
                                        { 
                                            caption: me.textHorizontalMinor,
                                            value: 'bShowHorMinor',
                                            stopPropagation: true,  
                                            checkable: true
                                        },
                                        { 
                                            caption: me.textVerticalMinor,
                                            value: 'bShowVerMinor',
                                            stopPropagation: true,  
                                            checkable: true
                                        }
                                    ]
                                })
                            },
                            { 
                                caption: me.textLegendPos,
                                value: 'legend', 
                                disabled: false,
                                menu: new Common.UI.Menu({
                                    cls: 'shifted-right',  
                                    menuAlign: 'tl-tr',
                                    items: [
                                        { 
                                            caption: me.textTop,
                                            value: 'TopLegend',
                                            stopPropagation: true,
                                            toggleGroup: 'legend',  
                                            checkable: true
                                        },
                                        { 
                                            caption: me.textLeft,
                                            value: 'LeftLegend',
                                            stopPropagation: true, 
                                            toggleGroup: 'legend',   
                                            checkable: true
                                        },
                                        { 
                                            caption: me.textRight,
                                            value: 'RightLegend', 
                                            stopPropagation: true, 
                                            toggleGroup: 'legend',  
                                            checkable: true
                                        },
                                        { 
                                            caption: me.textBottom,
                                            value: 'BottomLegend', 
                                            stopPropagation: true, 
                                            toggleGroup: 'legend',  
                                            checkable: true
                                        },
                                        { 
                                            caption: me.textLeftOverlay,
                                            value: 'LeftOverlay', 
                                            stopPropagation: true,
                                            toggleGroup: 'legend',   
                                            checkable: true
                                        },
                                        { 
                                            caption: me.textRightOverlay,
                                            value: 'RightOverlay', 
                                            stopPropagation: true, 
                                            toggleGroup: 'legend',  
                                            checkable: true
                                        }
                                    ]
                                })
                            },
                            {
                                caption: me.textTrendline,
                                value: 'trendLines',
                                disabled: false,
                                menu: new Common.UI.Menu({
                                    cls: 'shifted-right',  
                                    menuAlign: 'tl-tr',
                                    items: [
                                        {
                                            caption: me.textNone,
                                            stopPropagation: true, 
                                            value: 'trendLineNone'
                                        },
                                        {
                                            caption: me.textLinear,
                                            stopPropagation: true, 
                                            value: 'trendLineLinear'
                                        },
                                        {
                                            caption: me.textExponential,
                                            stopPropagation: true,  
                                            value: 'trendLineExponential'
                                        },
                                        {
                                            caption: me.textLinearForecast,
                                            stopPropagation: true, 
                                            value: 'trendLineForecast'
                                        },
                                        {
                                            caption: me.textMovingAverage,
                                            stopPropagation: true, 
                                            value: 'trendLineMovingAverage'
                                        }
                                    ]
                                })
                            },
                            // { 
                            //     caption: me.textUpDownBars, 
                            //     value: 'upDownBars', 
                            //     disabled: false,
                            //     menu: new Common.UI.Menu({
                            //         cls: 'shifted-right',  
                            //         menuAlign: 'tl-tr',
                            //         items: [
                            //             { 
                            //                 caption: me.textNone, 
                            //                 stopPropagation: true,  
                            //                 value: 'bShowUpDownNone'
                            //             },
                            //             { 
                            //                 caption: me.textShowUpDown, 
                            //                 stopPropagation: true, 
                            //                 value: 'bShowUpDownBars'
                            //             }
                            //         ]
                            //     })
                            // }
                        ]
                    })
                });
                
                this.btnChartElements = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-freeze-panes',
                    caption: me.capChartElements,
                    lock: [_set.sheetLock, _set.lostConnect, _set.coAuth, _set.editCell, _set.coAuthText, _set.wsLock,],
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small',
                    menu: true,
                    menu: this.menuChartElement.menu
                });
                this.lockedControls.push(this.btnChartElements);

                this.btnChartType = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-big-sheet-view',
                    caption: me.capChartType,
                    lock        : [_set.lostConnect, _set.coAuth, _set.editCell, _set.coAuthText, _set.wsLock,],
                    dataHint    : '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.btnChartType);
                
                this.btnSelectData = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-big-pivot-sum',
                    caption: me.capSelectData,
                    lock        : [_set.lostConnect, _set.coAuth, _set.editCell, _set.coAuthText, _set.wsLock,],
                    dataHint    : '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.btnSelectData);

                this.btnSwitchRowsCols = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-big-slicer',
                    caption: me.capRowCol,
                    lock        : [_set.lostConnect, _set.coAuth, _set.editCell, _set.noRange, _set.coAuthText, _set.wsLock,],
                    dataHint    : '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.btnSwitchRowsCols);

                this.chartStyles = new Common.UI.ComboDataView({
                    cls             : 'combo-chart-template',
                    style           : 'min-width: 103px; max-width: 517px;',
                    enableKeyEvents : true,
                    itemWidth       : 50,
                    itemHeight      : 50,
                    menuMaxHeight   : 300,
                    groups          : new Common.UI.DataViewGroupStore(),
                    autoWidth       : true,
                    lock: [_set.editCell, _set.lostConnect, _set.coAuth, _set.wsLock, _set.noStyles, _set.coAuthText],
                    beforeOpenHandler: function(e) {
                        var cmp = this,
                            menu = cmp.openButton.menu,
                            columnCount = 8;

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
                this.lockedControls.push(this.chartStyles);

                this.btn3DSettings = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-day',
                    caption: me.cap3DRotation,
                    lock        : [_set.lostConnect, _set.coAuth, _set.editCell, _set.coAuthText, _set.wsLock,],
                    dataHint    : '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.btn3DSettings);

                this.btnAdvancedSettings = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-day',
                    caption: me.capAdvancedSettings,
                    lock        : [_set.lostConnect, _set.coAuth, _set.editCell, _set.SeveralCharts, _set.coAuthText, _set.wsLock,],
                    dataHint    : '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.btnAdvancedSettings);

                this.spnWidth = new Common.UI.MetricSpinner({
                    el: $('#chart-spin-width'),
                    step: .1,
                    width: 78,
                    defaultUnit : "cm",
                    lock: [_set.lostConnect, _set.coAuth, _set.editCell, _set.coAuthText, _set.wsLock,],
                    value: '3 cm',
                    maxValue: 55.88,
                    minValue: 0,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'big',
                    ariaLabel: this.textWidth
                });
                this.lockedControls.push(this.spnWidth);

                this.spnHeight = new Common.UI.MetricSpinner({
                    el: $('#chart-spin-height'),
                    step: .1,
                    width: 78,
                    defaultUnit : "cm",
                    lock: [_set.lostConnect, _set.coAuth, _set.editCell, _set.coAuthText, _set.wsLock,],
                    value: '3 cm',
                    maxValue: 55.88,
                    minValue: 0,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'big',
                    ariaLabel: this.textHeight
                });
                this.lockedControls.push(this.spnHeight);

                this.chRatio = new Common.UI.CheckBox({
                    labelText: me.textLockRation,
                    value: true,
                    lock        : [_set.lostConnect, _set.editCell, _set.coAuthText, _set.wsLock,],
                    dataHint    : '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chRatio);

                this.lblWidth = new Common.UI.Label({
                    caption: me.textWidth,
                    lock: [_set.lostConnect, _set.coAuth, _set.editCell, _set.coAuthText, _set.wsLock,],
                });
                this.lockedControls.push(this.lblWidth);

                this.lblHeight = new Common.UI.Label({
                    caption: me.textHeight,
                    lock: [_set.lostConnect, _set.coAuth, _set.editCell, _set.coAuthText, _set.wsLock,],
                });
                this.lockedControls.push(this.lblHeight);

                this.spnWidth.on('inputleave', function(){ Common.NotificationCenter.trigger('edit:complete', me);});
                this.spnHeight.on('inputleave', function(){ Common.NotificationCenter.trigger('edit:complete', me);});

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
                var me = this;

                this.btnChartElements && this.btnChartElements.render($host.find('#slot-btn-chart-elements'));
                this.btnChartType && this.btnChartType.render($host.find('#slot-btn-chart-type'));
                this.btnSelectData && this.btnSelectData.render($host.find('#slot-btn-select-data'));
                this.btnSwitchRowsCols && this.btnSwitchRowsCols.render($host.find('#slot-btn-switch-rowscols'));
                this.btn3DSettings && this.btn3DSettings.render($host.find('#slot-btn-chart-3d-settings'));
                this.btnAdvancedSettings && this.btnAdvancedSettings.render($host.find('#slot-btn-chart-advanced-settings'));
                this.chRatio && this.chRatio.render($host.find('#slot-chk-ratio'));
                this.lblWidth && this.lblWidth.render($host.find('#slot-lbl-width'));
                this.lblHeight && this.lblHeight.render($host.find('#slot-lbl-height'));
                this.chartStyles.render(this.$el.find('#slot-field-chart-styles'));
                return this.$el;
            },

            onAppReady: function (config) {
                var me = this;
                (new Promise(function (accept, reject) {
                    accept();
                })).then(function(){
                    me.btnAdvancedSettings.updateHint(me.tipAdvanced)
                    me.btnChartElements.updateHint(me.tipChartElements)
                    me.btnChartType.updateHint(me.tipChartType)
                    me.btnSelectData.updateHint(me.tipSelectData)
                    me.btnSwitchRowsCols.updateHint(me.tipSwitchRowCol)
                    me.btn3DSettings.updateHint(me.tip3DRotation)
                    me.btnAdvancedSettings.updateHint(me.tipAdvanced)
                    setEvents.call(me);
                });
            },

            show: function () {
                Common.UI.BaseView.prototype.show.call(this);
                this.fireEvent('show', this);
            },

            getButtons: function(type) {
                return this.lockedControls
            },

            SetDisabled: function (state) {
                this.lockedControls && this.lockedControls.forEach(function(button) {
                    if ( button ) {
                        button.setDisabled(state);
                    }
                }, this);
            },
        }
    }()), SSE.Views.ChartTab || {}));
});
