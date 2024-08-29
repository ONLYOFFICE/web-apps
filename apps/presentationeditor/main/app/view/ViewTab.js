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
 *  Created on 07.12.2021
 *
 */

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Layout'
], function () {
    'use strict';

    PE.Views.ViewTab = Common.UI.BaseView.extend(_.extend((function(){
        var template =
            '<section class="panel" data-tab="view" role="tabpanel" aria-labelledby="view">' +
                '<div class="group small">' +
                    '<span class="btn-slot text x-huge" id="slot-btn-normal"></span>' +
                    '<span class="btn-slot text x-huge" id="slot-btn-slide-master"></span>' +
                '</div>' +
                '<div class="separator long slide-master-separator"></div>' +
                '<div class="group small">' +
                    '<div class="elset" style="display: flex;">' +
                        '<span class="btn-slot" id="slot-field-zoom" style="flex-grow: 1;"></span>' +
                    '</div>' +
                    '<div class="elset" style="text-align: center;">' +
                        '<span class="btn-slot text font-size-normal" id="slot-lbl-zoom" style="text-align: center;margin-top: 4px;"></span>' +
                    '</div>' +
                '</div>' +
                '<div class="group small">' +
                    '<div class="elset">' +
                        '<span class="btn-slot text" id="slot-btn-fts" style="text-align: center;"></span>' +
                    '</div>' +
                    '<div class="elset">' +
                        '<span class="btn-slot text" id="slot-btn-ftw" style="text-align: center;"></span>' +
                    '</div>' +
                '</div>' +
                '<div class="separator long"></div>' +
                '<div class="group">' +
                    '<span class="btn-slot text x-huge" id="slot-btn-interface-theme"></span>' +
                '</div>' +
                '<div class="separator long separator-theme"></div>' +
                '<div class="group small">' +
                    '<div class="elset">' +
                        '<span class="btn-slot text" id="slot-chk-notes"></span>' +
                    '</div>' +
                    '<div class="elset">' +
                        '<span class="btn-slot text" id="slot-chk-rulers"></span>' +
                    '</div>' +
                '</div>' +
                '<div class="group small">' +
                    '<span class="btn-slot text x-huge" id="slot-btn-guides"></span>' +
                    '<span class="btn-slot text x-huge" id="slot-btn-gridlines"></span>' +
                '</div>' +
                '<div class="separator long separator-rulers"></div>' +
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
        return {
            options: {},

            setEvents: function () {
                var me = this;
                me.btnNormal.on('toggle', _.bind(function(btn, state) {
                    me.fireEvent('mode:normal', [state]);
                }, me));
                me.btnSlideMaster.on('toggle', _.bind(function(btn, state) {
                    me.fireEvent('mode:master', [state]);
                }, me));
                me.btnFitToSlide && me.btnFitToSlide.on('click', function () {
                    me.fireEvent('zoom:toslide', [me.btnFitToSlide]);
                });
                me.btnFitToWidth && me.btnFitToWidth.on('click', function () {
                    me.fireEvent('zoom:towidth', [me.btnFitToWidth]);
                });
                me.chToolbar && me.chToolbar.on('change', _.bind(function(checkbox, state) {
                    me.fireEvent('toolbar:setcompact', [me.chToolbar, state !== 'checked']);
                }, me));
                me.chStatusbar && me.chStatusbar.on('change', _.bind(function (checkbox, state) {
                    me.fireEvent('statusbar:hide', [me.chStatusbar, state !== 'checked']);
                }, me));
                me.chRulers && me.chRulers.on('change', _.bind(function (checkbox, state) {
                    me.fireEvent('rulers:change', [state === 'checked']);
                }, me));
                me.chNotes && me.chNotes.on('change', _.bind(function (checkbox, state) {
                    me.fireEvent('notes:change', [me.chNotes, state === 'checked']);
                }, me));
                me.cmbZoom.on('selected', function (combo, record) {
                    me.fireEvent('zoom:selected', [combo, record]);
                }).on('changed:before', function (combo, record) {
                    me.fireEvent('zoom:changedbefore', [true, combo, record]);
                }).on('changed:after', function (combo, record) {
                    me.fireEvent('zoom:changedafter', [false, combo, record]);
                }).on('combo:blur', function () {
                    me.fireEvent('editcomplete', me);
                }).on('combo:focusin', _.bind(this.onComboOpen, this, false))
                    .on('show:after', _.bind(this.onComboOpen, this, true));

                me.btnGuides.on('toggle', _.bind(function(btn, state) {
                    me.fireEvent('guides:show', [state]);
                }, me));
                me.btnGuides.menu.on('item:click', _.bind(function(menu, item) {
                    if (item.value === 'add-vert' || item.value === 'add-hor')
                        me.fireEvent('guides:add', [item.value]);
                    else if (item.value === 'clear')
                        me.fireEvent('guides:clear');
                    else if (item.value === 'smart')
                        me.fireEvent('guides:smart', [item.isChecked()]);
                    else
                        me.fireEvent('guides:show', [item.isChecked()]);
                }, me));
                me.btnGuides.menu.on('show:after', _.bind(function(btn, state) {
                    me.fireEvent('guides:aftershow');
                }, me));

                me.btnGridlines.on('toggle', _.bind(function(btn, state) {
                    me.fireEvent('gridlines:show', [state]);
                }, me));
                me.btnGridlines.menu.on('item:click', _.bind(function(menu, item) {
                    if (item.value === 'custom')
                        me.fireEvent('gridlines:custom');
                    else if (item.value === 'snap')
                        me.fireEvent('gridlines:snap', [item.isChecked()]);
                    else if (item.value === 'show')
                        me.fireEvent('gridlines:show', [item.isChecked()]);
                    else
                        me.fireEvent('gridlines:spacing', [item.value]);

                }, me));
                me.btnGridlines.menu.on('show:after', _.bind(function(btn, state) {
                    me.fireEvent('gridlines:aftershow');
                }, me));
                me.chLeftMenu.on('change', _.bind(function (checkbox, state) {
                    me.fireEvent('leftmenu:hide', [me.chLeftMenu, state === 'checked']);
                }, me));
                me.chRightMenu.on('change', _.bind(function (checkbox, state) {
                    me.fireEvent('rightmenu:hide', [me.chRightMenu, state === 'checked']);
                }, me));
            },

            initialize: function (options) {
                Common.UI.BaseView.prototype.initialize.call(this);
                this.toolbar = options.toolbar;
                this.appConfig = options.mode;
                var _set = Common.enumLock;

                this.lockedControls = [];

                var me = this;

                this.btnNormal = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-normal',
                    caption: this.textNormal,
                    lock: [_set.disableOnStart],
                    enableToggle: true,
                    allowDepress: true,
                    pressed: true,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.btnNormal);

                this.btnSlideMaster = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-slide-master',
                    caption: this.textSlideMaster,
                    lock: [_set.disableOnStart],
                    enableToggle: true,
                    allowDepress: true,
                    pressed: false,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.btnSlideMaster);

                this.cmbZoom = new Common.UI.ComboBox({
                    cls: 'input-group-nr',
                    menuStyle: 'min-width: 55px;',
                    editable: true,
                    lock: [_set.disableOnStart],
                    data: [
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

                this.btnFitToSlide = new Common.UI.Button({
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-ic-zoomtoslide',
                    caption: this.textFitToSlide,
                    lock: [_set.disableOnStart],
                    toggleGroup: 'view-zoom',
                    enableToggle: true,
                    dataHint: '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'medium'
                });
                this.lockedControls.push(this.btnFitToSlide);

                this.btnFitToWidth = new Common.UI.Button({
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-ic-zoomtowidth',
                    caption: this.textFitToWidth,
                    lock: [_set.disableOnStart],
                    toggleGroup: 'view-zoom',
                    enableToggle: true,
                    dataHint: '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'medium'
                });
                this.lockedControls.push(this.btnFitToWidth);

                this.btnInterfaceTheme = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-day',
                    caption: this.textInterfaceTheme,
                    lock: [_set.disableOnStart],
                    menu: true,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.btnInterfaceTheme);

                this.chStatusbar = new Common.UI.CheckBox({
                    labelText: this.textStatusBar,
                    value: !Common.localStorage.getBool("pe-hidden-status"),
                    lock: [_set.disableOnStart],
                    dataHint: '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chStatusbar);

                this.chToolbar = new Common.UI.CheckBox({
                    labelText: this.textAlwaysShowToolbar,
                    value: !options.compactToolbar,
                    lock: [_set.disableOnStart],
                    dataHint    : '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chToolbar);

                this.chRulers = new Common.UI.CheckBox({
                    labelText: this.textRulers,
                    value: !Common.Utils.InternalSettings.get("pe-hidden-rulers"),
                    lock: [_set.disableOnStart],
                    dataHint: '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chRulers);

                this.chNotes = new Common.UI.CheckBox({
                    labelText: this.textNotes,
                    value: !Common.localStorage.getBool('pe-hidden-notes', this.appConfig.customization && this.appConfig.customization.hideNotes===true),
                    lock: [_set.disableOnStart],
                    dataHint: '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chNotes);

                this.btnGuides = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-guides',
                    caption: this.textGuides,
                    lock: [_set.disableOnStart],
                    enableToggle: true,
                    allowDepress: true,
                    pressed: Common.localStorage.getBool("pe-settings-showguides"),
                    split: true,
                    menu: true,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.btnGuides);

                this.btnGridlines = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-gridlines',
                    caption: this.textGridlines,
                    lock: [_set.disableOnStart],
                    enableToggle: true,
                    allowDepress: true,
                    pressed: Common.localStorage.getBool("pe-settings-showgrid"),
                    split: true,
                    menu: true,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.btnGridlines);

                this.chRightMenu = new Common.UI.CheckBox({
                    lock: [_set.disableOnStart],
                    labelText: !Common.UI.isRTL() ? this.textRightMenu : this.textLeftMenu,
                    dataHint    : '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chRightMenu);

                this.chLeftMenu = new Common.UI.CheckBox({
                    lock: [_set.disableOnStart],
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

                this.btnNormal.render($host.find('#slot-btn-normal'));
                this.btnSlideMaster.render($host.find('#slot-btn-slide-master'));
                this.cmbZoom.render($host.find('#slot-field-zoom'));
                $host.find('#slot-lbl-zoom').text(this.textZoom);
                this.btnFitToSlide.render($host.find('#slot-btn-fts'));
                this.btnFitToWidth.render($host.find('#slot-btn-ftw'));
                this.btnInterfaceTheme.render($host.find('#slot-btn-interface-theme'));
                this.chStatusbar.render($host.find('#slot-chk-statusbar'));
                this.chToolbar.render($host.find('#slot-chk-toolbar'));
                this.chRulers.render($host.find('#slot-chk-rulers'));
                this.chNotes.render($host.find('#slot-chk-notes'));
                this.btnGuides.render($host.find('#slot-btn-guides'));
                this.btnGridlines.render($host.find('#slot-btn-gridlines'));
                this.chLeftMenu.render($host.find('#slot-chk-leftmenu'));
                this.chRightMenu.render($host.find('#slot-chk-rightmenu'));
                return this.$el;
            },

            onAppReady: function (config) {
                var me = this;
                (new Promise(function (accept, reject) {
                    accept();
                })).then(function () {
                    me.btnNormal.updateHint(me.tipNormal);
                    me.btnSlideMaster.updateHint(me.tipSlideMaster);
                    me.btnFitToSlide.updateHint(me.tipFitToSlide);
                    me.btnFitToWidth.updateHint(me.tipFitToWidth);
                    me.btnInterfaceTheme.updateHint(me.tipInterfaceTheme);
                    me.btnGuides.updateHint(me.tipGuides);
                    me.btnGridlines.updateHint(me.tipGridlines);

                    me.btnGuides.setMenu( new Common.UI.Menu({
                        cls: 'shifted-right',
                        items: [
                            { caption: me.textShowGuides, value: 'show', checkable: true },
                            { caption: '--'},
                            { caption: me.textAddVGuides, iconCls: 'menu__icon btn-vertical-guide', value: 'add-vert' },
                            { caption: me.textAddHGuides, iconCls: 'menu__icon btn-horizontal-guide', value: 'add-hor' },
                            { caption: '--'},
                            { caption: me.textSmartGuides, value: 'smart', checkable: true },
                            { caption: me.textClearGuides, value: 'clear' }
                        ]
                    }));

                    me.btnGridlines.setMenu( new Common.UI.Menu({
                        restoreHeight: true,
                        items: [
                            { caption: me.textShowGridlines, value: 'show', checkable: true },
                            { caption: me.textSnapObjects, value: 'snap', checkable: true },
                            { caption: '--'},
                            { caption: '--'},
                            { caption: me.textCustom, value: 'custom' }
                        ]
                    }));

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

                    if (!config.isEdit) {
                        me.chRulers.hide();
                        me.btnGuides.$el.closest('.group').remove();
                        me.btnSlideMaster.$el.closest('.group').remove();
                        me.$el.find('.slide-master-separator').remove();
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
                    me.chLeftMenu.setValue(!Common.localStorage.getBool("pe-hidden-leftmenu", value));

                    value = Common.UI.LayoutManager.getInitValue('rightMenu');
                    value = (value!==undefined) ? !value : false;
                    me.chRightMenu.setValue(!Common.localStorage.getBool("pe-hidden-rightmenu", value));

                    me.setEvents();
                });
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

            textZoom: 'Zoom',
            textFitToSlide: 'Fit To Slide',
            textFitToWidth: 'Fit To Width',
            textInterfaceTheme: 'Interface theme',
            textStatusBar: 'Status Bar',
            textAlwaysShowToolbar: 'Always show toolbar',
            textRulers: 'Rulers',
            textNotes: 'Notes',
            tipFitToSlide: 'Fit to slide',
            tipFitToWidth: 'Fit to width',
            tipInterfaceTheme: 'Interface theme',
            textGuides: 'Guides',
            tipGuides: 'Show guides',
            textShowGuides: 'Show Guides',
            textAddVGuides: 'Add Vertical Guide',
            textAddHGuides: 'Add Horizontal Guide',
            textSmartGuides: 'Smart Guides',
            textClearGuides: 'Clear Guides',
            textGridlines: 'Gridlines',
            tipGridlines: 'Show gridlines',
            textShowGridlines: 'Show Gridlines',
            textSnapObjects: 'Snap Object to Grid',
            textCm: 'cm',
            textCustom: 'Custom',
            textLeftMenu: 'Left panel',
            textRightMenu: 'Right panel',
            textNormal: 'Normal',
            textSlideMaster: 'Slide Master',
            tipNormal: 'Normal',
            tipSlideMaster: 'Slide master',
            textTabStyle: 'Tab style',
            textFill: 'Fill',
            textLine: 'Line'
        }
    }()), PE.Views.ViewTab || {}));
});