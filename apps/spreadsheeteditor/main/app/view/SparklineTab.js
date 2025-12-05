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
 *  SparklineTab.js
 *
 *  Created on 15.10.2025
 *
 */

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/Button',
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Layout',
    'common/main/lib/component/Label',
    'common/main/lib/component/ThemeColorPalette',
], function () {
    'use strict';

    SSE.Views.SparklineTab = Common.UI.BaseView.extend(_.extend((function(){
        var template = '<section id="sparkline-design-panel" class="panel" data-tab="sparklinetab" role="tabpanel" aria-labelledby="view">' +
            '<div class="group">' +
                '<span class="btn-slot text x-huge" id="slot-btn-sparkline-line"></span>' +
                '<span class="btn-slot text x-huge" id="slot-btn-sparkline-column"></span>' +
                '<span class="btn-slot text x-huge" id="slot-btn-sparkline-winloss"></span>' +
            '</div>' +
            '<div class="separator long"></div>' +
            '<div class="group small">' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-chk-high"></span>' +
                '</div>' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-chk-low"></span>' +
                '</div>' +
            '</div>' +
            '<div class="group small">' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-chk-first"></span>' +
                '</div>' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-chk-last"></span>' +
                '</div>' +
            '</div>' +
            '<div class="group small">' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-chk-negative"></span>' +
                '</div>' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-chk-markers"></span>' +
                '</div>' +
            '</div>' +
            '<div class="separator long"></div>' +
            '<div class="group">' +
                '<span class="btn-slot text x-huge" id="slot-btn-sparkline-marker-color"></span>' +
            '</div>' +
            '<div class="group flex small" id="id-spark-combo-style" style="min-width: 100px; width: 448px" data-group-width="448px"></div>' +
            '<div class="group small">' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-btn-sparkline-color"></span>' +
                '</div>' +
                '<div class="elset">' +
                   ' <span class="btn-slot text font-size-normal margin-right-6" id="slot-lbl-line-weight" style="flex-grow:1;" "></span>' +
                    '<span id="slot-spin-line-weight" class="btn-slot text "></span>' +
                '</div>' +
            '</div>' +
            '<div class="separator long"></div>' +
            '<div class="group small">' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-btn-sparkline-advanced"></span>' +
                '</div>' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-btn-sparkline-clear"></span>' +
                '</div>' +
            '</div>' +
        '</section>';

        function setEvents() {
            var me = this;
            this.chHighPoint.on('change', function (type, field, newValue, oldValue, eOpts) {
                me.fireEvent('sparkline:checkbox', [0, field, 0]);
            });
            this.chLowPoint.on('change', function (type, field, newValue, oldValue, eOpts) {
                me.fireEvent('sparkline:checkbox', [1, field, 1]);
            });
            this.chNegativePoint.on('change', function (type, field, newValue, oldValue, eOpts) {
                me.fireEvent('sparkline:checkbox', [2, field, 2]);
            });
            this.chFirstPoint.on('change', function (type, field, newValue, oldValue, eOpts) {
                me.fireEvent('sparkline:checkbox', [3, field, 3]);
            });
            this.chLastPoint.on('change', function (type, field, newValue, oldValue, eOpts) {
                me.fireEvent('sparkline:checkbox', [4, field, 4]);
            });
            this.chMarkers.on('change', function (type, field, newValue, oldValue, eOpts) {
                me.fireEvent('sparkline:checkbox', [5, field, 5]);
            });
            this.btnLineType.on('click', function () {
                me.fireEvent('sparkline:type', [0]);
            });
            this.btnColumnType.on('click', function () {
                me.fireEvent('sparkline:type', [1]);
            });
            this.btnWinLossType.on('click', function () {
                me.fireEvent('sparkline:type', [2]);
            });
            this.btnSparklineColor.menu.on('item:click', function (menu, item) {
                me.fireEvent('sparkline:addnewcolor', [menu, item])
            });
            this.btnClear.menu.on('item:click', function (menu, item, e) {
                me.fireEvent('sparkline:clear', [menu, item, e])
            });
            this.btnAdvancedSettings.on('click', function () {
                me.fireEvent('sparkline:advanced');
            });
            this.cmbBorderSize.on('selected', function (combo, record) {
                me.fireEvent('sparkline:bordersizeselect', [combo, record])
            });
            this.cmbBorderSize.on('changed:before', function (combo, record) {
                me.fireEvent('sparkline:bordersizechanged', [combo, record, true])
            });
            this.cmbBorderSize.on('changed:after', function (combo, record) {
                me.fireEvent('sparkline:bordersizechanged', [combo, record, false])
            });
            this.cmbSparkStyle.on('click', function (combo, record) {
                me.fireEvent('sparkline:styleselect', [combo, record])
            });
        }

        return {
            initialize: function (options) {
                var controller = SSE.getController('SparklineTab');
                this._state = controller._state;
                this.defColor = {r: 255, g: 239, b: 191, Auto: false};
                Common.UI.BaseView.prototype.initialize.call(this);

                this.lockedControls = [];

                var me = this,
                    _set = Common.enumLock;

                this.btnLineType = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-sparkline-line',
                    caption: me.capLine,
                    lock        : [_set.lostConnect, _set.coAuth, _set.editCell, _set.sparkLocked, _set.wsLock,],
                    enableToggle: true,
                    action: 'sheet-view',
                    dataHint    : '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.btnLineType);

                this.btnColumnType = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-sparkline-column',
                    caption: me.capColumn,
                    lock        : [_set.lostConnect, _set.coAuth, _set.editCell, _set.sparkLocked, _set.wsLock,],
                    enableToggle: true,
                    action: 'sheet-view',
                    dataHint    : '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.btnColumnType);

                this.btnWinLossType = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-sparkline-win-loss',
                    caption: me.capWinLoss,
                    lock        : [_set.lostConnect, _set.coAuth, _set.editCell, _set.sparkLocked, _set.wsLock,],
                    enableToggle: true,
                    action: 'sheet-view',
                    dataHint    : '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.btnWinLossType);

                this.chHighPoint = new Common.UI.CheckBox({
                    labelText: me.textHighPoint,
                    lock        : [_set.lostConnect, _set.editCell, _set.coAuth, _set.sparkLocked, _set.wsLock,],
                    dataHint    : '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chHighPoint);

                this.chLowPoint = new Common.UI.CheckBox({
                    labelText: me.textLowPoint,
                    lock        : [_set.lostConnect, _set.editCell, _set.coAuth, _set.sparkLocked, _set.wsLock,],
                    dataHint    : '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chLowPoint);

                this.chFirstPoint = new Common.UI.CheckBox({
                    labelText: me.textFirstPoint,
                    lock        : [_set.lostConnect, _set.editCell, _set.coAuth, _set.sparkLocked, _set.wsLock,],
                    dataHint    : '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chFirstPoint);

                this.chLastPoint = new Common.UI.CheckBox({
                    labelText: me.textLastPoint,
                    lock        : [_set.lostConnect, _set.editCell, _set.coAuth, _set.sparkLocked, _set.wsLock,],
                    dataHint    : '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chLastPoint);

                this.chNegativePoint = new Common.UI.CheckBox({
                    labelText: me.textNegativePoint,
                    lock        : [_set.lostConnect, _set.editCell, _set.coAuth, _set.sparkLocked, _set.wsLock,],
                    dataHint    : '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chNegativePoint);

                this.chMarkers = new Common.UI.CheckBox({
                    labelText: me.textMarkers,
                    lock        : [_set.lostConnect, _set.editCell, _set.notLineType, _set.coAuth, _set.sparkLocked, _set.wsLock,],
                    dataHint    : '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chMarkers);

                this.btnMarkerColor = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-big-colorschemas',
                    caption: me.capMarkerColor,
                    lock        : [_set.lostConnect, _set.coAuth, _set.editCell, _set.sparkLocked, _set.wsLock,],
                    menu: true,
                    dataHint    : '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.btnMarkerColor);

                this.cmbSparkStyle = new Common.UI.ComboDataView({
                    itemWidth: 50,
                    itemHeight: 50,
                    menuMaxHeight: 300,
                    lock: [_set.lostConnect, _set.coAuth, _set.editCell, _set.sparkLocked, _set.wsLock,],
                    enableKeyEvents: true,
                    cls: 'combo-chart-template',
                    style: 'min-width: 90px; max-width: 496px;',
                    delayRenderTips: true,
                    autoWidth: true,
                    beforeOpenHandler: function(e) {
                        var cmp = this,
                            menu = cmp.openButton.menu,
                            minMenuColumn = 6;

                        if (menu.cmpEl) {
                            var itemEl = $(cmp.cmpEl.find('.dataview.inner .style').get(0)).parent();
                            var itemMargin = 8;
                            var itemWidth = itemEl.is(':visible') ? parseFloat(itemEl.css('width')) :
                                (cmp.itemWidth + parseFloat(itemEl.css('padding-left')) + parseFloat(itemEl.css('padding-right')) +
                                parseFloat(itemEl.css('border-left-width')) + parseFloat(itemEl.css('border-right-width')));

                            var minCount = cmp.menuPicker.store.length >= minMenuColumn ? minMenuColumn : cmp.menuPicker.store.length,
                                    columnCount = Math.min(cmp.menuPicker.store.length, Math.round($('.dataview', $(cmp.fieldPicker.el)).width() / (itemMargin + itemWidth)));
                            columnCount = columnCount < minCount ? minCount : columnCount;
                            menu.menuAlignEl = cmp.cmpEl;
                            menu.menuAlign = 'tl-tl';
                            var menuWidth = columnCount * (itemMargin + itemWidth) + 16, // for scroller
                                buttonOffsetLeft = Common.Utils.getOffset(cmp.openButton.$el).left;
                            if (menuWidth>Common.Utils.innerWidth())
                                menuWidth = Math.max(Math.floor((Common.Utils.innerWidth()-16)/(itemMargin + itemWidth)), 2) * (itemMargin + itemWidth) + 16;
                            var offset = cmp.cmpEl.width() - cmp.openButton.$el.width() - Math.min(menuWidth, buttonOffsetLeft);
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
                    fillOnChangeVisibility: true
                });
                this.cmbSparkStyle.openButton.menu.on('show:after', function () {
                    me.cmbSparkStyle.menuPicker.scroller.update({alwaysVisibleY: true});
                });
                this.lockedControls.push(this.cmbSparkStyle);

                this.btnSparklineColor = new Common.UI.Button({
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-paracolor',
                    lock: [_set.lostConnect, _set.coAuth, _set.editCell, _set.sparkLocked, _set.wsLock,],
                    caption: this.capSparklineColor,
                    menu: new Common.UI.Menu({
                        cls: 'color-menu',
                        items: [
                            { template: _.template('<div id="sparkline-color-menu-picker" style="width: 164px;display: inline-block;"></div>'), stopPropagation: true },
                            { caption: '--'},
                            {
                                caption: this.textMoreColors,
                                value: 1
                            },
                        ]
                    }),
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: '0, -8'
                });
                this.lockedControls.push(this.btnSparklineColor);

                this.cmbBorderSize = new Common.UI.ComboBorderSizeEditable({
                    style       : 'width: 90px;',
                    lock: [_set.lostConnect, _set.notLineType, _set.coAuth, _set.sparkLocked, _set.wsLock,],
                    allowNoBorders: false
                })
                this.BorderSize = this.cmbBorderSize.store.at(1).get('value');
                this.cmbBorderSize.setValue(this.BorderSize);
                this.lockedControls.push(this.cmbBorderSize);

                this.lblLineWeight = new Common.UI.Label({
                    caption: me.lblLineWeight,
                    lock: [_set.lostConnect, _set.editCell, _set.notLineType, _set.coAuth, _set.sparkLocked, _set.wsLock,]
                });
                this.lockedControls.push(this.lblLineWeight);

                this.btnAdvancedSettings = new Common.UI.Button({
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-settings',
                    lock: [_set.editCell, _set.lostConnect, _set.coAuth, _set.sparkLocked, _set.wsLock,],
                    caption: this.capAdvancedSettings,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: '0, -8'
                });
                this.lockedControls.push(this.btnAdvancedSettings);

                this.btnClear = new Common.UI.Button({
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-clearstyle',
                    lock: [_set.editCell, _set.lostConnect, _set.coAuth, _set.sparkLocked, _set.wsLock,],
                    caption: this.capClear,
                    menu        : new Common.UI.Menu({
                        items   : [
                                { caption: me.txtClearSparklines, value: Asc.c_oAscCleanOptions.Sparklines },
                                { caption: me.txtClearSparklineGroups, value: Asc.c_oAscCleanOptions.SparklineGroups }
                            ]
                    }),
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: '0, -8'
                });
                this.lockedControls.push(this.btnClear);

                var colorMenu = new Common.UI.Menu({
                    cls: 'menu-marker-colors',
                    items: [
                        new Common.UI.MenuItem({
                            caption: me.textHighPoint,
                            color: '#' + Common.Utils.ThemeColor.getHexColor(me.defColor.r, me.defColor.g, me.defColor.b),
                            checkable: true,
                            menu: true,
                            value: 'high',
                            toggleGroup: 'formtab-view-role',
                            template: _.template([
                                '<a id="<%= id %>"  tabindex="-1" type="menuitem" class="<%= options.cls %>" style="overflow: hidden; text-overflow: ellipsis;">',
                                '<span class="color" style="background: <%= options.color %>;"></span>',
                                '<%= Common.Utils.String.htmlEncode(caption) %>',
                                '</a>'
                            ].join(''))
                        }),
                        new Common.UI.MenuItem({
                            caption: me.textLowPoint,
                            color: '#' + Common.Utils.ThemeColor.getHexColor(me.defColor.r, me.defColor.g, me.defColor.b),
                            checkable: true,
                            menu: true,
                            value: 'low',
                            toggleGroup: 'formtab-view-role',
                            template: _.template([
                                '<a id="<%= id %>"  tabindex="-1" type="menuitem" class="<%= options.cls %>" style="overflow: hidden; text-overflow: ellipsis;">',
                                '<span class="color" style="background: <%= options.color %>;"></span>',
                                '<%= Common.Utils.String.htmlEncode(caption) %>',
                                '</a>'
                            ].join(''))
                        }),
                        new Common.UI.MenuItem({
                            caption: me.textFirstPoint,
                            color: '#' + Common.Utils.ThemeColor.getHexColor(me.defColor.r, me.defColor.g, me.defColor.b),
                            checkable: true,
                            menu: true,
                            value: 'first',
                            toggleGroup: 'formtab-view-role',
                            template: _.template([
                                '<a id="<%= id %>"  tabindex="-1" type="menuitem" class="<%= options.cls %>" style="overflow: hidden; text-overflow: ellipsis;">',
                                '<span class="color" style="background: <%= options.color %>;"></span>',
                                '<%= Common.Utils.String.htmlEncode(caption) %>',
                                '</a>'
                            ].join(''))
                        }),
                        new Common.UI.MenuItem({
                            caption: me.textLastPoint,
                            color: '#' + Common.Utils.ThemeColor.getHexColor(me.defColor.r, me.defColor.g, me.defColor.b),
                            checkable: true,
                            menu: true,
                            value: 'last',
                            toggleGroup: 'formtab-view-role',
                            template: _.template([
                                '<a id="<%= id %>"  tabindex="-1" type="menuitem" class="<%= options.cls %>" style="overflow: hidden; text-overflow: ellipsis;">',
                                '<span class="color" style="background: <%= options.color %>;"></span>',
                                '<%= Common.Utils.String.htmlEncode(caption) %>',
                                '</a>'
                            ].join(''))
                        }),
                        new Common.UI.MenuItem({
                            caption: me.textNegativePoint,
                            color: '#' + Common.Utils.ThemeColor.getHexColor(me.defColor.r, me.defColor.g, me.defColor.b),
                            checkable: true,
                            menu: true,
                            value: 'negative',
                            toggleGroup: 'formtab-view-role',
                            template: _.template([
                                '<a id="<%= id %>"  tabindex="-1" type="menuitem" class="<%= options.cls %>" style="overflow: hidden; text-overflow: ellipsis;">',
                                '<span class="color" style="background: <%= options.color %>; vertical-align: middle;"></span>',
                                '<%= Common.Utils.String.htmlEncode(caption) %>',
                                '</a>'
                            ].join(''))
                        }),
                        this.markerColor = new Common.UI.MenuItem({
                            caption: me.textMarkers,
                            color: '#' + Common.Utils.ThemeColor.getHexColor(me.defColor.r, me.defColor.g, me.defColor.b),
                            checkable: true,
                            lock: [_set.notLineType],
                            menu: true,
                            value: 'markers',
                            toggleGroup: 'formtab-view-role',
                            template: _.template([
                                '<a id="<%= id %>"  tabindex="-1" type="menuitem" class="<%= options.cls %>" style="overflow: hidden; text-overflow: ellipsis;">',
                                '<span class="color" style="background: <%= options.color %>;"></span>',
                                '<%= Common.Utils.String.htmlEncode(caption) %>',
                                '</a>'
                            ].join(''))
                        }),
                    ]
                })

                this.lockedControls.push(this.markerColor)
                this.btnMarkerColor.setMenu(colorMenu)
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
                var _injectComponent = function (id, cmp) {
                    Common.Utils.injectComponent($host.findById(id), cmp);
                };
                _injectComponent('#slot-spin-line-weight', this.cmbBorderSize);
                _injectComponent('#id-spark-combo-style', this.cmbSparkStyle);
                this.lblLineWeight && this.lblLineWeight.render($host.find('#slot-lbl-line-weight'));
                this.btnLineType && this.btnLineType.render($host.find('#slot-btn-sparkline-line'));
                this.btnColumnType && this.btnColumnType.render($host.find('#slot-btn-sparkline-column'));
                this.btnWinLossType && this.btnWinLossType.render($host.find('#slot-btn-sparkline-winloss'));
                this.chHighPoint && this.chHighPoint.render($host.find('#slot-chk-high'));
                this.chLowPoint && this.chLowPoint.render($host.find('#slot-chk-low'));
                this.chFirstPoint && this.chFirstPoint.render($host.find('#slot-chk-first'));
                this.chLastPoint && this.chLastPoint.render($host.find('#slot-chk-last'));
                this.chNegativePoint && this.chNegativePoint.render($host.find('#slot-chk-negative'));
                this.chMarkers && this.chMarkers.render($host.find('#slot-chk-markers'));
                this.btnMarkerColor && this.btnMarkerColor.render($host.find('#slot-btn-sparkline-marker-color'));
                this.btnSparklineColor && this.btnSparklineColor.render($host.find('#slot-btn-sparkline-color'));
                this.btnAdvancedSettings && this.btnAdvancedSettings.render($host.find('#slot-btn-sparkline-advanced'));
                this.btnClear && this.btnClear.render($host.find('#slot-btn-sparkline-clear'));
                return this.$el;
            },

            onAppReady: function (config) {
                var me = this;
                (new Promise(function (accept, reject) {
                    accept();
                })).then(function(){
                    me.btnMarkerColor.menu.items.forEach(function (item, index) {
                        var subMenu = new Common.UI.Menu({
                            cls: 'color-menu',
                            menuAlign: 'tl-tr',
                            items: [
                                { template: _.template(`<div id="sparkline-markers-menu-picker${index}" style="width: 164px;display: inline-block;"></div>`), stopPropagation: true },
                                { caption: '--'},
                                {
                                    caption: me.textMoreColors,
                                    value: 1
                                },
                            ]
                        });

                        subMenu.on('item:click', function (menu, color) {
                            me.fireEvent('sparkline:addnewcolor', [menu, color])
                        })
                        item.setMenu(subMenu);

                        var colorsMenu = new Common.UI.ThemeColorPalette({
                            el: $(`#sparkline-markers-menu-picker${index}`),
                            outerMenu: {menu: item.menu, index: 0}
                        });
                        item.menu.setInnerMenu([{menu: colorsMenu, index: 0}]);
                        colorsMenu.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
                        colorsMenu.on('select', function (item, color) {
                            me.fireEvent('sparkline:markerscolor', [item, color, index])
                        });
                    });
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
    }()), SSE.Views.SparklineTab || {}));
});
