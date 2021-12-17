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
 *  ViewTab.js
 *
 *  Created by Julia Radzhabova on 08.07.2020
 *  Copyright (c) 2020 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Layout'
], function () {
    'use strict';

    SSE.Views.ViewTab = Common.UI.BaseView.extend(_.extend((function(){
        function setEvents() {
            var me = this;
            if ( me.appConfig.canFeatureViews ) {
                me.btnCloseView.on('click', function (btn, e) {
                    me.fireEvent('viewtab:openview', [{name: 'default', value: 'default'}]);
                });
                me.btnCreateView.on('click', function (btn, e) {
                    me.fireEvent('viewtab:createview');
                });
            }

            me.btnFreezePanes.menu.on('item:click', function (menu, item, e) {
                if (item.value === 'shadow') {
                    me.fireEvent('viewtab:freezeshadow', [item.checked]);
                } else {
                    me.fireEvent('viewtab:freeze', [item.value]);
                }
            });
            this.chFormula.on('change', function (field, value) {
                me.fireEvent('viewtab:formula', [0, value]);
            });
            this.chHeadings.on('change', function (field, value) {
                me.fireEvent('viewtab:headings', [1, value]);
            });
            this.chGridlines.on('change', function (field, value) {
                me.fireEvent('viewtab:gridlines', [2, value]);
            });
            this.chZeros.on('change', function (field, value) {
                me.fireEvent('viewtab:zeros', [3, value]);
            });
            this.chToolbar.on('change', function (field, value) {
                me.fireEvent('viewtab:showtoolbar', [field, value !== 'checked']);
            });
            this.chStatusbar.on('change', function (field, value) {
                me.fireEvent('statusbar:setcompact', [field, value === 'checked']);
            });
            this.cmbZoom.on('selected', function (combo, record) {
                me.fireEvent('zoom:selected', [combo, record]);
            }).on('changed:before', function (combo, record) {
                me.fireEvent('zoom:changedbefore', [true, combo, record]);
            }).on('changed:after', function (combo, record) {
                me.fireEvent('zoom:changedafter', [false, combo, record]);
            }).on('combo:blur', function () {
                me.fireEvent('editcomplete', me);
            }).on('combo:focusin', _.bind(this.onComboOpen, this, false))
              .on('show:after', _.bind(this.onComboOpen, this, true));
        }

        return {
            options: {},

            initialize: function (options) {
                Common.UI.BaseView.prototype.initialize.call(this);
                this.toolbar = options.toolbar;
                this.appConfig = options.mode;

                this.lockedControls = [];

                var me = this,
                    $host = me.toolbar.$el,
                    _set = SSE.enumLock;

                if ( me.appConfig.canFeatureViews ) {
                    this.btnSheetView = new Common.UI.Button({
                        parentEl: $host.find('#slot-btn-sheet-view'),
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-sheet-view',
                        caption: me.capBtnSheetView,
                        lock        : [_set.lostConnect, _set.coAuth, _set.editCell],
                        menu: true,
                        dataHint    : '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.lockedControls.push(this.btnSheetView);

                    this.btnCreateView = new Common.UI.Button({
                        id          : 'id-toolbar-btn-createview',
                        cls         : 'btn-toolbar',
                        iconCls     : 'toolbar__icon btn-sheet-view-new',
                        caption     : this.textCreate,
                        lock        : [_set.coAuth, _set.lostConnect, _set.editCell],
                        dataHint    : '1',
                        dataHintDirection: 'left',
                        dataHintOffset: 'big'
                    });
                    this.lockedControls.push(this.btnCreateView);
                    Common.Utils.injectComponent($host.find('#slot-createview'), this.btnCreateView);

                    this.btnCloseView = new Common.UI.Button({
                        id          : 'id-toolbar-btn-closeview',
                        cls         : 'btn-toolbar',
                        iconCls     : 'toolbar__icon btn-sheet-view-close',
                        caption     : this.textClose,
                        lock        : [_set.sheetView, _set.coAuth, _set.lostConnect, _set.editCell],
                        dataHint    : '1',
                        dataHintDirection: 'left',
                        dataHintOffset: 'big'
                    });
                    this.lockedControls.push(this.btnCloseView);
                    Common.Utils.injectComponent($host.find('#slot-closeview'), this.btnCloseView);
                }

                this.btnFreezePanes = new Common.UI.Button({
                    parentEl: $host.find('#slot-btn-freeze'),
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-freeze-panes',
                    caption: this.capBtnFreeze,
                    menu: true,
                    lock: [_set.sheetLock, _set.lostConnect, _set.coAuth, _set.editCell],
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.btnFreezePanes);

                this.cmbZoom = new Common.UI.ComboBox({
                    el          : $host.find('#slot-field-zoom'),
                    cls         : 'input-group-nr',
                    menuStyle   : 'min-width: 55px;',
                    hint        : me.tipFontSize,
                    editable    : true,
                    lock        : [_set.coAuth, _set.lostConnect, _set.editCell],
                    data        : [
                        { displayValue: "50%", value: 50 },
                        { displayValue: "75%", value: 75 },
                        { displayValue: "100%", value: 100 },
                        { displayValue: "125%", value: 125 },
                        { displayValue: "150%", value: 150 },
                        { displayValue: "175%", value: 175 },
                        { displayValue: "200%", value: 200 },
                        { displayValue: "300%", value: 300 },
                        { displayValue: "400%", value: 400 },
                        { displayValue: "500%", value: 500 }
                    ],
                    dataHint    : '1',
                    dataHintDirection: 'top',
                    dataHintOffset: 'small'
                });
                this.cmbZoom.setValue(100);
                this.lockedControls.push(this.cmbZoom);

                this.chFormula = new Common.UI.CheckBox({
                    el: $host.findById('#slot-chk-formula'),
                    labelText: this.textFormula,
                    value: !Common.localStorage.getBool('sse-hidden-formula'),
                    lock        : [_set.lostConnect, _set.coAuth, _set.editCell],
                    dataHint    : '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chFormula);

                this.chHeadings = new Common.UI.CheckBox({
                    el: $host.findById('#slot-chk-heading'),
                    labelText: this.textHeadings,
                    lock        : [_set.sheetLock, _set.lostConnect, _set.coAuth, _set.editCell],
                    dataHint    : '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chHeadings);

                this.chGridlines = new Common.UI.CheckBox({
                    el: $host.findById('#slot-chk-gridlines'),
                    labelText: this.textGridlines,
                    lock        : [_set.sheetLock, _set.lostConnect, _set.coAuth, _set.editCell],
                    dataHint    : '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chGridlines);

                this.chZeros = new Common.UI.CheckBox({
                    el: $host.findById('#slot-chk-zeros'),
                    labelText: this.textZeros,
                    lock        : [_set.sheetLock, _set.lostConnect, _set.coAuth, _set.editCell],
                    dataHint    : '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chZeros);

                this.btnInterfaceTheme = new Common.UI.Button({
                    parentEl: $host.find('#slot-btn-interface-theme'),
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon day',
                    caption: this.textInterfaceTheme,
                    menu: true,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.btnInterfaceTheme);

                this.chStatusbar = new Common.UI.CheckBox({
                    el: $host.findById('#slot-chk-statusbar'),
                    labelText: this.textCombineSheetAndStatusBars,
                    value       : Common.localStorage.getBool('sse-compact-statusbar', true),
                    lock        : [_set.sheetLock, _set.lostConnect, _set.coAuth, _set.editCell],
                    dataHint    : '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chStatusbar);

                this.chToolbar = new Common.UI.CheckBox({
                    el: $host.findById('#slot-chk-toolbar'),
                    labelText: this.textAlwaysShowToolbar,
                    value       : !options.compactToolbar,
                    lock        : [_set.sheetLock, _set.lostConnect, _set.coAuth, _set.editCell],
                    dataHint    : '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chToolbar);

                $host.find('#slot-lbl-zoom').text(this.textZoom);

                Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            },

            render: function (el) {
                return this;
            },

            onAppReady: function (config) {
                var me = this;
                (new Promise(function (accept, reject) {
                    accept();
                })).then(function(){
                    if (!config.canFeatureViews) {
                        me.toolbar && me.toolbar.$el.find('.group.sheet-views').hide();
                        me.toolbar && me.toolbar.$el.find('.separator.sheet-views').hide();
                    } else {
                        me.btnSheetView.updateHint( me.tipSheetView );
                        me.setButtonMenu(me.btnSheetView);

                        me.btnCreateView.updateHint(me.tipCreate);
                        me.btnCloseView.updateHint(me.tipClose);
                    }
                    me.btnFreezePanes.setMenu(new Common.UI.Menu({
                        items: [
                            {
                                caption: me.toolbar && me.toolbar.api && !!me.toolbar.api.asc_getSheetViewSettings().asc_getIsFreezePane() ? me.textUnFreeze : me.capBtnFreeze,
                                value: undefined
                            },
                            {
                                caption: me.textFreezeRow,
                                value: Asc.c_oAscFrozenPaneAddType.firstRow
                            },
                            {
                                caption: me.textFreezeCol,
                                value: Asc.c_oAscFrozenPaneAddType.firstCol
                            },
                            { caption: '--' },
                            {
                                caption: me.textShowFrozenPanesShadow,
                                value: 'shadow',
                                checkable: true,
                                checked: Common.localStorage.getBool('sse-freeze-shadow', true)
                            }
                        ]
                    }));
                    me.btnFreezePanes.updateHint(me.tipFreeze);

                    var menuItems = [],
                        currentTheme = Common.UI.Themes.currentThemeId() || Common.UI.Themes.defaultThemeId();
                    for (var t in Common.UI.Themes.map()) {
                        menuItems.push({
                            value: t,
                            caption: Common.UI.Themes.get(t).text,
                            checked: t === currentTheme,
                            checkable: true,
                            toggleGroup: 'interface-theme'
                        });
                    }

                    if (menuItems.length) {
                        me.btnInterfaceTheme.setMenu(new Common.UI.Menu({items: menuItems}));
                        me.btnInterfaceTheme.menu.on('item:click', _.bind(function (menu, item) {
                            var value = item.value;
                            Common.UI.Themes.setTheme(value);
                        }, me));
                    }

                    setEvents.call(me);
                });
            },

            setButtonMenu: function(btn) {
                var me = this,
                    arr = [{caption: me.textDefault, value: 'default', checkable: true, allowDepress: false}];
                btn.setMenu(new Common.UI.Menu({
                    items: [
                        {template: _.template('<div id="id-toolbar-sheet-view-menu-" style="display: flex;" class="open"></div>')},
                        { caption: '--' },
                        {
                            caption: me.textManager,
                            value: 'manager'
                        }
                    ]
                }));
                btn.menu.items[2].on('click', function (item, e) {
                    me.fireEvent('viewtab:manager');
                });
                btn.menu.on('show:after', function (menu, e) {
                    var internalMenu = menu._innerMenu;
                    internalMenu.scroller.update({alwaysVisibleY: true});
                    _.delay(function() {
                        menu._innerMenu && menu._innerMenu.cmpEl.focus();
                    }, 10);
                }).on('show:before', function (menu, e) {
                    me.fireEvent('viewtab:showview');
                });

                var menu = new Common.UI.Menu({
                    maxHeight: 300,
                    cls: 'internal-menu',
                    items: arr,
                    outerMenu:  {menu: btn.menu, index: 0}
                });
                menu.render(btn.menu.items[0].cmpEl.children(':first'));
                menu.cmpEl.css({
                    display     : 'block',
                    position    : 'relative',
                    left        : 0,
                    top         : 0
                });
                menu.cmpEl.attr({tabindex: "-1"});
                menu.on('item:toggle', function (menu, item, state, e) {
                    if (!!state)
                        me.fireEvent('viewtab:openview', [{name: item.caption, value: item.value}]);
                });
                btn.menu._innerMenu = menu;
                btn.menu.setInnerMenu([{menu: menu, index: 0}]);
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

            onComboOpen: function (needfocus, combo) {
                _.delay(function() {
                    var input = $('input', combo.cmpEl).select();
                    if (needfocus) input.focus();
                    else if (!combo.isMenuOpen()) input.one('mouseup', function (e) { e.preventDefault(); });
                }, 10);
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
            textShowFrozenPanesShadow: 'Show frozen panes shadow'
        }
    }()), SSE.Views.ViewTab || {}));
});
