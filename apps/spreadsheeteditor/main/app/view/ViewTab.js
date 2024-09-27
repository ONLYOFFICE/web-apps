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
 *  ViewTab.js
 *
 *  Created on 08.07.2020
 *
 */

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Layout'
], function () {
    'use strict';

    SSE.Views.ViewTab = Common.UI.BaseView.extend(_.extend((function(){
        var template = '<section class="panel" data-tab="view" role="tabpanel" aria-labelledby="view">' +
            '<div class="group sheet-views">' +
                '<span class="btn-slot text x-huge" id="slot-btn-sheet-view"></span>' +
            '</div>' +
            '<div class="group sheet-views small">' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-createview"></span>' +
                '</div>' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-closeview"></span>' +
                '</div>' +
            '</div>' +
            '<div class="separator long sheet-views"></div>' +
            '<div class="group doc-preview">' +
                '<span class="btn-slot text x-huge" id="slot-btn-view-normal"></span>' +
                '<span class="btn-slot text x-huge" id="slot-btn-view-pagebreak"></span>' +
            '</div>' +
            '<div class="separator long doc-preview"></div>' +
            '<div class="group small">' +
                '<div class="elset" style="display: flex;">' +
                    '<span class="btn-slot" id="slot-field-zoom" style="flex-grow: 1;"></span>' +
                '</div>' +
                '<div class="elset" style="text-align: center;">' +
                    '<span class="btn-slot text font-size-normal" id="slot-lbl-zoom" style="text-align: center;margin-top: 4px;"></span>' +
                '</div>' +
            '</div>' +
            '<div class="separator long"></div>' +
            '<div class="group">' +
                '<span class="btn-slot text x-huge" id="slot-btn-interface-theme"></span>' +
            '</div>' +
            '<div class="separator long separator-theme"></div>' +
            '<div class="group sheet-freeze">' +
                '<span class="btn-slot text x-huge" id="slot-btn-freeze"></span>' +
            '</div>' +
            '<div class="separator long sheet-freeze"></div>' +
            '<div class="group small sheet-formula">' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-chk-formula"></span>' +
                '</div>' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-chk-heading"></span>' +
                '</div>' +
            '</div>' +
            '<div class="group small sheet-gridlines">' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-chk-gridlines"></span>' +
                '</div>' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-chk-zeros"></span>' +
                '</div>' +
            '</div>' +
            '<div class="separator long separator-formula"></div>' +
            '<div class="group small">' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-chk-toolbar"></span>' +
                '</div>' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-chk-statusbar"></span>' +
                '</div>' +
            '</div>' +
            '<div class="group small">' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-chk-leftmenu"></span>' +
                '</div>' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-chk-rightmenu"></span>' +
                '</div>' +
            '</div>' +
        '</section>';

        function setEvents() {
            var me = this;
            if ( me.appConfig.canFeatureViews && me.appConfig.isEdit) {
                me.btnCloseView.on('click', function (btn, e) {
                    me.fireEvent('viewtab:openview', [{name: 'default', value: 'default'}]);
                });
                me.btnCreateView.on('click', function (btn, e) {
                    me.fireEvent('viewtab:createview');
                });
            }

            me.btnFreezePanes && me.btnFreezePanes.menu.on('item:click', function (menu, item, e) {
                if (item.value === 'shadow') {
                    me.fireEvent('viewtab:freezeshadow', [item.checked]);
                } else {
                    me.fireEvent('viewtab:freeze', [item.value]);
                }
            });
            this.chFormula.on('change', function (field, value) {
                me.fireEvent('viewtab:formula', [0, value=='checked']);
            });
            this.chHeadings && this.chHeadings.on('change', function (field, value) {
                me.fireEvent('viewtab:headings', [1, value=='checked']);
            });
            this.chGridlines && this.chGridlines.on('change', function (field, value) {
                me.fireEvent('viewtab:gridlines', [2, value=='checked']);
            });
            this.chZeros && this.chZeros.on('change', function (field, value) {
                me.fireEvent('viewtab:zeros', [3, value=='checked']);
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
            me.chLeftMenu.on('change', _.bind(function (checkbox, state) {
                me.fireEvent('leftmenu:hide', [me.chLeftMenu, state === 'checked']);
            }, me));
            me.chRightMenu.on('change', _.bind(function (checkbox, state) {
                me.fireEvent('rightmenu:hide', [me.chRightMenu, state === 'checked']);
            }, me));
            me.btnViewNormal && me.btnViewNormal.on('click', function (btn, e) {
                btn.pressed && me.fireEvent('viewtab:viewmode', [Asc.c_oAscESheetViewType.normal]);
            });
            me.btnViewPageBreak && me.btnViewPageBreak.on('click', function (btn, e) {
                btn.pressed && me.fireEvent('viewtab:viewmode', [Asc.c_oAscESheetViewType.pageBreakPreview]);
            });
        }

        return {
            options: {},

            initialize: function (options) {
                Common.UI.BaseView.prototype.initialize.call(this);
                this.toolbar = options.toolbar;
                this.appConfig = options.mode;

                this.lockedControls = [];

                var me = this,
                    _set = Common.enumLock;

                if ( me.appConfig.canFeatureViews && me.appConfig.isEdit ) {
                    this.btnSheetView = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-big-sheet-view',
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
                }

                if (me.appConfig.isEdit) {
                    this.btnFreezePanes = new Common.UI.Button({
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

                    this.chHeadings = new Common.UI.CheckBox({
                        labelText: this.textHeadings,
                        lock        : [_set.sheetLock, _set.lostConnect, _set.coAuth, _set.editCell],
                        dataHint    : '1',
                        dataHintDirection: 'left',
                        dataHintOffset: 'small'
                    });
                    this.lockedControls.push(this.chHeadings);

                    this.chGridlines = new Common.UI.CheckBox({
                        labelText: this.textGridlines,
                        lock        : [_set.sheetLock, _set.lostConnect, _set.coAuth, _set.editCell],
                        dataHint    : '1',
                        dataHintDirection: 'left',
                        dataHintOffset: 'small'
                    });
                    this.lockedControls.push(this.chGridlines);

                    this.chZeros = new Common.UI.CheckBox({
                        labelText: this.textZeros,
                        lock        : [_set.sheetLock, _set.lostConnect, _set.coAuth, _set.editCell],
                        dataHint    : '1',
                        dataHintDirection: 'left',
                        dataHintOffset: 'small'
                    });
                    this.lockedControls.push(this.chZeros);

                    this.btnViewNormal = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-normal-view',
                        enableToggle: true,
                        allowDepress: false,
                        caption: this.txtViewNormal,
                        lock        : [_set.sheetLock, _set.lostConnect, _set.coAuth, _set.editCell],
                        dataHint    : '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.lockedControls.push(this.btnViewNormal);

                    this.btnViewPageBreak = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-page-break-preview',
                        enableToggle: true,
                        allowDepress: false,
                        caption: this.txtViewPageBreak,
                        lock        : [_set.sheetLock, _set.lostConnect, _set.coAuth, _set.editCell],
                        dataHint    : '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small'
                    });
                    this.lockedControls.push(this.btnViewPageBreak);
                }

                this.cmbZoom = new Common.UI.ComboBox({
                    cls         : 'input-group-nr',
                    menuStyle   : 'min-width: 55px;',
                    hint        : me.tipFontSize,
                    editable    : true,
                    lock        : [_set.lostConnect, _set.editCell],
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
                this.lockedControls.push(this.cmbZoom);

                this.btnInterfaceTheme = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-day',
                    caption: this.textInterfaceTheme,
                    menu: true,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.btnInterfaceTheme);

                this.chFormula = new Common.UI.CheckBox({
                    labelText: this.textFormula,
                    value: !Common.localStorage.getBool('sse-hidden-formula'),
                    lock        : [_set.lostConnect, _set.editCell],
                    dataHint    : '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chFormula);

                this.chStatusbar = new Common.UI.CheckBox({
                    labelText: this.textCombineSheetAndStatusBars,
                    value       : Common.localStorage.getBool('sse-compact-statusbar', true),
                    lock        : [_set.lostConnect, _set.editCell],
                    dataHint    : '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chStatusbar);

                this.chToolbar = new Common.UI.CheckBox({
                    labelText: this.textAlwaysShowToolbar,
                    value       : !options.compactToolbar,
                    lock        : [_set.lostConnect, _set.editCell],
                    dataHint    : '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chToolbar);

                this.chRightMenu = new Common.UI.CheckBox({
                    lock: [_set.lostConnect],
                    labelText: !Common.UI.isRTL() ? this.textRightMenu : this.textLeftMenu,
                    dataHint    : '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chRightMenu);

                this.chLeftMenu = new Common.UI.CheckBox({
                    lock: [_set.lostConnect],
                    labelText: !Common.UI.isRTL() ? this.textLeftMenu : this.textRightMenu,
                    dataHint    : '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chLeftMenu);

                Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            },

            render: function (el) {
                if ( el ) el.html( this.getPanel() );

                return this;
            },

            getPanel: function () {
                this.$el = $(_.template(template)( {} ));
                var $host = this.$el;

                this.btnSheetView && this.btnSheetView.render($host.find('#slot-btn-sheet-view'));
                this.btnCreateView && this.btnCreateView.render($host.find('#slot-createview'));
                this.btnCloseView && this.btnCloseView.render($host.find('#slot-closeview'));
                this.btnFreezePanes && this.btnFreezePanes.render($host.find('#slot-btn-freeze'));
                this.cmbZoom.render($host.find('#slot-field-zoom'));
                this.cmbZoom.setValue(100);
                $host.find('#slot-lbl-zoom').text(this.textZoom);
                this.btnInterfaceTheme.render($host.find('#slot-btn-interface-theme'));
                this.chFormula.render($host.find('#slot-chk-formula'));
                this.chStatusbar.render($host.find('#slot-chk-statusbar'));
                this.chToolbar.render($host.find('#slot-chk-toolbar'));
                this.chHeadings && this.chHeadings.render($host.find('#slot-chk-heading'));
                this.chGridlines && this.chGridlines.render($host.find('#slot-chk-gridlines'));
                this.chZeros && this.chZeros.render($host.find('#slot-chk-zeros'));
                this.chLeftMenu.render($host.find('#slot-chk-leftmenu'));
                this.chRightMenu.render($host.find('#slot-chk-rightmenu'));
                this.btnViewNormal && this.btnViewNormal.render($host.find('#slot-btn-view-normal'));
                this.btnViewPageBreak && this.btnViewPageBreak.render($host.find('#slot-btn-view-pagebreak'));
                return this.$el;
            },

            onAppReady: function (config) {
                var me = this;
                (new Promise(function (accept, reject) {
                    accept();
                })).then(function(){
                    if (!(config.canFeatureViews && me.appConfig.isEdit)) {
                        me.toolbar && me.toolbar.$el.find('.group.sheet-views').hide();
                        me.toolbar && me.toolbar.$el.find('.separator.sheet-views').hide();
                    } else {
                        me.btnSheetView.updateHint( me.tipSheetView );
                        me.setButtonMenu(me.btnSheetView);

                        me.btnCreateView.updateHint(me.tipCreate);
                        me.btnCloseView.updateHint(me.tipClose);
                    }

                    me.btnInterfaceTheme.updateHint(me.tipInterfaceTheme);

                    if (config.isEdit) {
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
                        me.btnViewNormal.updateHint(me.tipViewNormal);
                        me.btnViewPageBreak.updateHint(me.tipViewPageBreak);
                    } else {
                        me.toolbar && me.toolbar.$el.find('.group.doc-preview').hide();
                        me.toolbar && me.toolbar.$el.find('.separator.doc-preview').hide();
                        me.toolbar && me.toolbar.$el.find('.group.sheet-freeze').hide();
                        me.toolbar && me.toolbar.$el.find('.separator.sheet-freeze').hide();
                        me.toolbar && me.toolbar.$el.find('.group.sheet-gridlines').hide();
                    }

                    if (!Common.UI.Themes.available()) {
                        me.btnInterfaceTheme.$el.closest('.group').remove();
                        me.$el.find('.separator-theme').remove();
                    }

                    var emptyGroup = [];
                    if (config.canBrandingExt && config.customization && config.customization.statusBar === false || !Common.UI.LayoutManager.isElementVisible('statusBar')) {
                        emptyGroup.push(me.chStatusbar.$el.closest('.elset'));
                        me.chStatusbar.$el.remove();
                    }

                    if (config.canBrandingExt && config.customization && config.customization.leftMenu === false || !Common.UI.LayoutManager.isElementVisible('leftMenu')) {
                        emptyGroup.push(me.chLeftMenu.$el.closest('.elset'));
                        me.chLeftMenu.$el.remove();
                    } else if (emptyGroup.length>0) {
                        emptyGroup.push(me.chLeftMenu.$el.closest('.elset'));
                        emptyGroup.shift().append(me.chLeftMenu.$el[0]);
                    }

                    if (!config.isEdit || config.canBrandingExt && config.customization && config.customization.rightMenu === false || !Common.UI.LayoutManager.isElementVisible('rightMenu')) {
                        emptyGroup.push(me.chRightMenu.$el.closest('.elset'));
                        me.chRightMenu.$el.remove();
                    } else if (emptyGroup.length>0) {
                        emptyGroup.push(me.chRightMenu.$el.closest('.elset'));
                        emptyGroup.shift().append(me.chRightMenu.$el[0]);
                    }
                    if (emptyGroup.length>1) { // remove empty group
                        emptyGroup[emptyGroup.length-1].closest('.group').remove();
                    }

                    if (Common.UI.Themes.available()) {
                        function _add_tab_styles() {
                            let btn = me.btnInterfaceTheme;
                            if ( typeof(btn.menu) === 'object' )
                                btn.menu.addItem({caption: '--'});
                            else
                                btn.setMenu(new Common.UI.Menu());
                            let mni = new Common.UI.MenuItem({
                                value: -1,
                                caption: me.textTabStyle,
                                menu: new Common.UI.Menu({
                                    menuAlign: 'tl-tr',
                                    items: [
                                        {value: 'fill', caption: me.textFill, checkable: true, toggleGroup: 'tabstyle'},
                                        {value: 'line', caption: me.textLine, checkable: true, toggleGroup: 'tabstyle'}
                                    ]
                                })
                            });
                            _.each(mni.menu.items, function(item){
                                item.setChecked(Common.Utils.InternalSettings.get("settings-tab-style")===item.value, true);
                            });
                            mni.menu.on('item:click', _.bind(function (menu, item) {
                                Common.UI.TabStyler.setStyle(item.value);
                            }, me));
                            btn.menu.addItem(mni);
                            me.menuTabStyle = mni.menu;
                        }
                        function _fill_themes() {
                            let btn = this.btnInterfaceTheme;
                            if ( typeof(btn.menu) == 'object' ) btn.menu.removeAll();
                            else btn.setMenu(new Common.UI.Menu());

                            var currentTheme = Common.UI.Themes.currentThemeId() || Common.UI.Themes.defaultThemeId();
                            for (var t in Common.UI.Themes.map()) {
                                btn.menu.addItem({
                                    value: t,
                                    caption: Common.UI.Themes.get(t).text,
                                    checked: t === currentTheme,
                                    checkable: true,
                                    toggleGroup: 'interface-theme'
                                });
                            }
                            // Common.UI.FeaturesManager.canChange('tabStyle', true) && _add_tab_styles();
                        }

                        Common.NotificationCenter.on('uitheme:countchanged', _fill_themes.bind(me));
                        _fill_themes.call(me);

                        if (me.btnInterfaceTheme.menu.items.length) {
                            me.btnInterfaceTheme.menu.on('item:click', _.bind(function (menu, item) {
                                var value = item.value;
                                Common.UI.Themes.setTheme(value);
                            }, me));
                        }
                    }

                    var value = Common.UI.LayoutManager.getInitValue('leftMenu');
                    value = (value!==undefined) ? !value : false;
                    me.chLeftMenu.setValue(!Common.localStorage.getBool("sse-hidden-leftmenu", value));

                    value = Common.UI.LayoutManager.getInitValue('rightMenu');
                    value = (value!==undefined) ? !value : false;
                    me.chRightMenu.setValue(!Common.localStorage.getBool("sse-hidden-rightmenu", value));

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

            onComboOpen: function (needfocus, combo, e, params) {
                if (params && params.fromKeyDown) return;
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
            textShowFrozenPanesShadow: 'Show frozen panes shadow',
            tipInterfaceTheme: 'Interface theme',
            textLeftMenu: 'Left panel',
            textRightMenu: 'Right panel',
            txtViewNormal: 'Normal',
            txtViewPageBreak: 'Page Break Preview',
            tipViewNormal: 'See your document in Normal view',
            tipViewPageBreak: 'See where the page breaks will appear when your document is printed',
            textTabStyle: 'Tab style',
            textFill: 'Fill',
            textLine: 'Line'
        }
    }()), SSE.Views.ViewTab || {}));
});
