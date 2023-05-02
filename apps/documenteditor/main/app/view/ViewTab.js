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
 *  ViewTab.js
 *
 *  Created by Julia Svinareva on 06.12.2021
 *  Copyright (c) 2021 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Layout'
], function () {
    'use strict';

    DE.Views.ViewTab = Common.UI.BaseView.extend(_.extend((function(){
        var template =
        '<section class="panel" data-tab="view">' +
            '<div class="group" data-layout-name="toolbar-view-navigation">' +
                '<span class="btn-slot text x-huge" id="slot-btn-navigation"></span>' +
            '</div>' +
            '<div class="separator long" data-layout-name="toolbar-view-navigation"></div>' +
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
                    '<span class="btn-slot text" id="slot-btn-ftp" style="text-align: center;"></span>' +
                '</div>' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-btn-ftw" style="text-align: center;"></span>' +
                '</div>' +
            '</div>' +
            '<div class="separator long"></div>' +
            '<div class="group">' +
                '<span class="btn-slot text x-huge" id="slot-btn-interface-theme"></span>' +
                '<span class="btn-slot text x-huge" id="slot-btn-dark-document"></span>' +
            '</div>' +
            '<div class="separator long separator-theme"></div>' +
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
            '<div class="separator long separator-rulers"></div>' +
            '<div class="group small">' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-chk-rulers"></span>' +
                '</div>' +
                '<div class="elset"></div>' +
            '</div>' +
        '</section>';

        return {
            options: {},

            setEvents: function () {
                var me = this;
                me.btnNavigation.on('click', function (btn, e) {
                    me.fireEvent('viewtab:navigation', [btn.pressed]);
                });
                me.btnFitToPage.on('click', function () {
                    me.fireEvent('zoom:topage');
                });
                me.btnFitToWidth.on('click', function () {
                    me.fireEvent('zoom:towidth');
                });
                me.chToolbar.on('change', _.bind(function(checkbox, state) {
                    me.fireEvent('toolbar:setcompact', [me.chToolbar, state !== 'checked']);
                }, me));
                me.chStatusbar.on('change', _.bind(function (checkbox, state) {
                    me.fireEvent('statusbar:hide', [me.chStatusbar, state !== 'checked']);
                }, me));
                me.chRulers.on('change', _.bind(function (checkbox, state) {
                    me.fireEvent('rulers:change', [me.chRulers, state === 'checked']);
                }, me));
                me.chLeftMenu.on('change', _.bind(function (checkbox, state) {
                    me.fireEvent('leftmenu:hide', [me.chLeftMenu, state === 'checked']);
                }, me));
                me.chRightMenu.on('change', _.bind(function (checkbox, state) {
                    me.fireEvent('rightmenu:hide', [me.chRightMenu, state === 'checked']);
                }, me));
                me.btnDarkDocument.on('click', _.bind(function () {
                    me.fireEvent('darkmode:change');
                }, me));
                me.cmbZoom.on('combo:focusin', _.bind(this.onComboOpen, this, false));
                me.cmbZoom.on('show:after', _.bind(this.onComboOpen, this, true));
            },

            initialize: function (options) {
                Common.UI.BaseView.prototype.initialize.call(this);
                this.toolbar = options.toolbar;
                this.appConfig = options.mode;

                this.lockedControls = [];

                var me = this;
                var _set = Common.enumLock;

                this.btnNavigation = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-menu-navigation',
                    lock: [_set.lostConnect, _set.disableOnStart],
                    caption: this.textOutline,
                    enableToggle: true,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.btnNavigation);

                this.cmbZoom = new Common.UI.ComboBox({
                    cls: 'input-group-nr',
                    lock: [_set.lostConnect, _set.disableOnStart],
                    menuStyle: 'min-width: 55px;',
                    editable: true,
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

                this.btnFitToPage = new Common.UI.Button({
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-ic-zoomtopage',
                    lock: [_set.lostConnect, _set.disableOnStart],
                    caption: this.textFitToPage,
                    toggleGroup: 'view-zoom',
                    enableToggle: true,
                    dataHint: '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'medium'
                });
                this.lockedControls.push(this.btnFitToPage);

                this.btnFitToWidth = new Common.UI.Button({
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-ic-zoomtowidth',
                    lock: [_set.lostConnect, _set.disableOnStart],
                    caption: this.textFitToWidth,
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
                    lock: [_set.lostConnect, _set.disableOnStart],
                    caption: this.textInterfaceTheme,
                    menu: true,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.btnInterfaceTheme);

                this.btnDarkDocument = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon dark-mode',
                    lock: [_set.inLightTheme, _set.lostConnect, _set.disableOnStart],
                    caption: this.textDarkDocument,
                    enableToggle: true,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.btnDarkDocument);

                this.chStatusbar = new Common.UI.CheckBox({
                    lock: [_set.lostConnect, _set.disableOnStart],
                    labelText: this.textStatusBar,
                    value: !Common.localStorage.getBool("de-hidden-status"),
                    dataHint: '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chStatusbar);

                this.chToolbar = new Common.UI.CheckBox({
                    lock: [_set.lostConnect, _set.disableOnStart],
                    labelText: this.textAlwaysShowToolbar,
                    value: !options.compactToolbar,
                    dataHint    : '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chToolbar);

                this.chRightMenu = new Common.UI.CheckBox({
                    lock: [_set.lostConnect, _set.disableOnStart],
                    labelText: this.textRightMenu,
                    dataHint    : '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chRightMenu);

                this.chLeftMenu = new Common.UI.CheckBox({
                    lock: [_set.lostConnect, _set.disableOnStart],
                    labelText: this.textLeftMenu,
                    dataHint    : '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chLeftMenu);

                this.chRulers = new Common.UI.CheckBox({
                    lock: [_set.lostConnect, _set.disableOnStart],
                    labelText: this.textRulers,
                    value: !Common.Utils.InternalSettings.get("de-hidden-rulers"),
                    dataHint: '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chRulers);

                Common.Utils.lockControls(_set.disableOnStart, true, {array: this.lockedControls});
                Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            },

            render: function (el) {
                if ( el ) el.html( this.getPanel() );

                return this;
            },

            getPanel: function () {
                this.$el = $(_.template(template)( {} ));
                var $host = this.$el;

                this.btnNavigation.render($host.find('#slot-btn-navigation'));
                this.cmbZoom.render($host.find('#slot-field-zoom'));
                $host.find('#slot-lbl-zoom').text(this.textZoom);
                this.btnFitToPage.render($host.find('#slot-btn-ftp'));
                this.btnFitToWidth.render($host.find('#slot-btn-ftw'));
                this.btnInterfaceTheme.render($host.find('#slot-btn-interface-theme'));
                this.btnDarkDocument.render($host.find('#slot-btn-dark-document'));
                this.chStatusbar.render($host.find('#slot-chk-statusbar'));
                this.chToolbar.render($host.find('#slot-chk-toolbar'));
                this.chRulers.render($host.find('#slot-chk-rulers'));
                this.chLeftMenu.render($host.find('#slot-chk-leftmenu'));
                this.chRightMenu.render($host.find('#slot-chk-rightmenu'));
                return this.$el;
            },

            onAppReady: function () {
                this.btnNavigation.updateHint(this.tipHeadings);
                this.btnFitToPage.updateHint(this.tipFitToPage);
                this.btnFitToWidth.updateHint(this.tipFitToWidth);
                this.btnInterfaceTheme.updateHint(this.tipInterfaceTheme);
                this.btnDarkDocument.updateHint(this.tipDarkDocument);

                var value = Common.UI.LayoutManager.getInitValue('leftMenu');
                value = (value!==undefined) ? !value : false;
                this.chLeftMenu.setValue(!Common.localStorage.getBool("de-hidden-leftmenu", value));

                value = Common.UI.LayoutManager.getInitValue('rightMenu');
                value = (value!==undefined) ? !value : false;
                this.chRightMenu.setValue(!Common.localStorage.getBool("de-hidden-rightmenu", value));
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

            turnNavigation: function (state) {
                this.btnNavigation && this.btnNavigation.toggle(state, true);
            },

            onComboOpen: function (needfocus, combo, e, params) {
                if (params && params.fromKeyDown) return;
                _.delay(function() {
                    var input = $('input', combo.cmpEl).select();
                    if (needfocus) input.focus();
                    else if (!combo.isMenuOpen()) input.one('mouseup', function (e) { e.preventDefault(); });
                }, 10);
            },

            textNavigation: 'Navigation',
            textOutline: 'Headings',
            textZoom: 'Zoom',
            textFitToPage: 'Fit To Page',
            textFitToWidth: 'Fit To Width',
            textInterfaceTheme: 'Interface theme',
            textStatusBar: 'Status Bar',
            textAlwaysShowToolbar: 'Always show toolbar',
            textRulers: 'Rulers',
            textDarkDocument: 'Dark document',
            tipHeadings: 'Headings',
            tipFitToPage: 'Fit to page',
            tipFitToWidth: 'Fit to width',
            tipInterfaceTheme: 'Interface theme',
            tipDarkDocument: 'Dark document',
            textLeftMenu: 'Left panel',
            textRightMenu: 'Right panel'
        }
    }()), DE.Views.ViewTab || {}));
});