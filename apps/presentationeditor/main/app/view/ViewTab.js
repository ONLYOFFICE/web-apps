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
 *  Created by Julia Svinareva on 07.12.2021
 *  Copyright (c) 2021 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Layout'
], function () {
    'use strict';

    PE.Views.ViewTab = Common.UI.BaseView.extend(_.extend((function(){
        return {
            options: {},

            setEvents: function () {
                var me = this;
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
                    me.fireEvent('rulers:change', [me.chRulers, state === 'checked']);
                }, me));
                me.chNotes && me.chNotes.on('change', _.bind(function (checkbox, state) {
                    me.fireEvent('notes:change', [me.chNotes, state === 'checked']);
                }, me));
                me.cmbZoom.on('combo:focusin', _.bind(this.onComboOpen, this, false));
                me.cmbZoom.on('show:after', _.bind(this.onComboOpen, this, true));
            },

            initialize: function (options) {
                Common.UI.BaseView.prototype.initialize.call(this);
                this.toolbar = options.toolbar;
                this.appConfig = options.mode;
                var _set = PE.enumLock;

                this.lockedControls = [];

                var me = this,
                    $host = me.toolbar.$el;

                this.cmbZoom = new Common.UI.ComboBox({
                    el: $host.find('#slot-field-zoom'),
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

                $host.find('#slot-lbl-zoom').text(this.textZoom);

                this.btnFitToSlide = new Common.UI.Button({
                    parentEl: $host.find('#slot-btn-fts'),
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
                    parentEl: $host.find('#slot-btn-ftw'),
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
                    parentEl: $host.find('#slot-btn-interface-theme'),
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon day',
                    caption: this.textInterfaceTheme,
                    lock: [_set.disableOnStart],
                    menu: true,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.btnInterfaceTheme);

                this.chStatusbar = new Common.UI.CheckBox({
                    el: $host.findById('#slot-chk-statusbar'),
                    labelText: this.textStatusBar,
                    value: !Common.localStorage.getBool("pe-hidden-status"),
                    lock: [_set.disableOnStart],
                    dataHint: '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chStatusbar);

                this.chToolbar = new Common.UI.CheckBox({
                    el: $host.findById('#slot-chk-toolbar'),
                    labelText: this.textAlwaysShowToolbar,
                    value: !options.compactToolbar,
                    lock: [_set.disableOnStart],
                    dataHint    : '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chToolbar);

                this.chRulers = new Common.UI.CheckBox({
                    el: $host.findById('#slot-chk-rulers'),
                    labelText: this.textRulers,
                    value: !Common.Utils.InternalSettings.get("pe-hidden-rulers"),
                    lock: [_set.disableOnStart],
                    dataHint: '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chRulers);

                this.chNotes = new Common.UI.CheckBox({
                    el: $host.findById('#slot-chk-notes'),
                    labelText: this.textNotes,
                    value: !Common.localStorage.getBool('pe-hidden-notes', this.appConfig.customization && this.appConfig.customization.hideNotes===true),
                    lock: [_set.disableOnStart],
                    dataHint: '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chNotes);

                this.cmpEl = $host;
            },

            render: function (el) {
                return this;
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

            textZoom: 'Zoom',
            textFitToSlide: 'Fit To Slide',
            textFitToWidth: 'Fit To Width',
            textInterfaceTheme: 'Interface theme',
            textStatusBar: 'Status Bar',
            textAlwaysShowToolbar: 'Always show toolbar',
            textRulers: 'Rulers',
            textNotes: 'Notes'
        }
    }()), PE.Views.ViewTab || {}));
});