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
 *  Draw.js
 *
 *  Created by Julia Radzhabova on 28.03.2023
 *  Copyright (c) 2023 Ascensio System SIA. All rights reserved.
 *
 */

if (Common === undefined)
    var Common = {};

Common.Views = Common.Views || {};

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Layout',
    'common/main/lib/component/Window'
], function (template) {
    'use strict';

    Common.Views.Draw = Common.UI.BaseView.extend(_.extend((function(){
        var template =
            '<section id="draw-ink-panel" class="panel" data-tab="draw">' +
            '<div class="group">' +
            '<span id="slot-btn-draw-select" class="btn-slot text x-huge"></span>' +
            '<span id="slot-btn-draw-pen-0" class="btn-slot text x-huge emptycaption"></span>' +
            '<span id="slot-btn-draw-pen-1" class="btn-slot text x-huge emptycaption"></span>' +
            '<span id="slot-btn-draw-pen-2" class="btn-slot text x-huge emptycaption"></span>' +
            '<span id="slot-btn-draw-eraser" class="btn-slot text x-huge"></span>' +
            '</div>' +
            '</section>';

        function setEvents() {
            var me = this;
            me.btnEraser.on('click', function (b) {
                me.fireEvent('draw:eraser', [b]);
            });
            me.btnsPen.forEach(function(button) {
                button.on('click', function (b, e) {
                    me.fireEvent('draw:pen', [b]);
                });
                button.on('color:select', function (b, color) {
                    if (!b.pressed) {
                        b.toggle(true, true);
                        me.depressButtons(b);
                    }

                    b.options.penOptions.color = color;
                    me.updateButtonHint(b);
                    me.fireEvent('draw:pen', [b]);
                });
            });
            me.btnSelect.on('click', function (b) {
                me.fireEvent('draw:select', [b]);
            });

            me._isSetEvents = true;
        }

        return {

            options: {},

            initialize: function (options) {
                Common.UI.BaseView.prototype.initialize.call(this, options);

                this.appConfig = options.mode;
                this._state = {disabled: false};
                this.lockedControls = [];
                this.btnsPen = [];

                var filter = Common.localStorage.getKeysFilter();
                this.appPrefix = (filter && filter.length) ? filter.split(',')[0] : '';

                var penOptions = [
                        {hint: this.txtPen,  color: 'FF0000',  size: 1,  opacity: 100},
                        {hint: this.txtPen,  color: '00FF00',  size: 1,  opacity: 100},
                        {hint: this.txtPen,  color: '0000FF',  size: 5,  opacity: 50}
                    ],
                    me = this;
                penOptions.forEach(function (props) {
                    var btn = new Common.UI.ButtonColored({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon btn-ic-signature',
                        caption: me.txtPen,
                        menu: true,
                        split: true,
                        enableToggle: true,
                        allowDepress: true,
                        dataHint    : '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small',
                        penOptions: props
                    });
                    me.btnsPen.push(btn);
                    me.lockedControls.push(btn);
                });

                this.btnEraser = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-ic-signature',
                    caption: this.txtEraser,
                    enableToggle: true,
                    allowDepress: true,
                    dataHint    : '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.btnEraser);

                this.btnSelect = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-ic-signature',
                    caption: this.txtSelect,
                    dataHint    : '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.btnSelect);

                Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            },

            render: function (el) {
                this.boxSdk = $('#editor_sdk');
                if ( el ) el.html( this.getPanel() );

                return this;
            },

            updateButtonHint: function(button) {
                var config = button.options.penOptions;
                button.updateHint(config.hint + ': ' + Common.Utils.ThemeColor.getTranslation(Common.Utils.ThemeColor.getRgbColor(config.color).asc_getName()) + ', ' + config.size + ' ' + this.txtMM);
            },

            createPen: function(button) {
                var config = button.options.penOptions,
                    id = Common.UI.getId(),
                    me = this;
                this.updateButtonHint(button);
                button.setMenu(
                    new Common.UI.Menu({
                        cls: 'shifted-left',
                        style: 'min-width: 100px;',
                        items: [
                            {template: _.template('<div id="id-toolbar-menu-draw-pen-' + id + '" style="width: 145px; display: inline-block;" class="palette-large"></div>')},
                            {
                                id: id + '-color-new',
                                template: _.template('<a tabindex="-1" type="menuitem" style="">' + button.textNewColor + '</a>')
                            },
                            {caption: '--'},
                            {
                                caption: this.txtSize
                            }
                        ]
                    }), true );
                button.currentColor = config.color;
                button.setColor(button.currentColor);
                var picker = new Common.UI.ThemeColorPalette({
                    el: $('#id-toolbar-menu-draw-pen-' + id),
                    colors: config.colors || [
                        'FFFF00', '00FF00', '00FFFF', 'FF00FF', '0000FF', 'FF0000', '00008B', '008B8B',
                        '006400', '800080', '8B0000', '808000', 'FFFFFF', 'D3D3D3', 'A9A9A9', '000000'
                    ],
                    value: button.currentColor,
                    dynamiccolors: 4,
                    themecolors: 0,
                    effects: 0,
                    columns: 4,
                    outerMenu: {menu: button.menu, index: 0, focusOnShow: true}
                });
                button.setPicker(picker);
                picker.on('select', _.bind(button.onColorSelect, button));
                button.menu.setInnerMenu([{menu: picker, index: 0}]);
                button.menu.cmpEl.find('#' + id + '-color-new').on('click',  function() {
                    picker.addNewColor(button.currentColor);
                });
            },

            onAppReady: function (config) {
                var me = this;
                (new Promise(function (accept, reject) {
                    accept();
                })).then(function(){
                    me.btnsPen.forEach(function(button) {
                        me.createPen(button);
                    });
                    me.btnEraser.updateHint(me.hintEraser);
                    me.btnSelect.updateHint(me.hintSelect);
                    Common.NotificationCenter.trigger('tab:visible', 'draw', Common.UI.LayoutManager.isElementVisible('toolbar-draw'));

                    setEvents.call(me);
                });
            },

            getPanel: function () {
                this.$el = $(_.template(template)( {} ));
                var me = this;

                this.btnsPen.forEach(function(button, index) {
                    button.render(me.$el.find('#slot-btn-draw-pen-' + index));
                });
                this.btnEraser && this.btnEraser.render(this.$el.find('#slot-btn-draw-eraser'));
                this.btnSelect && this.btnSelect.render(this.$el.find('#slot-btn-draw-select'));
                return this.$el;
            },

            show: function () {
                Common.UI.BaseView.prototype.show.call(this);
                this.fireEvent('show', this);
            },

            getButtons: function() {
                return this.lockedControls;
            },

            depressButtons: function(btn) {
                this.btnsPen.forEach(function(button) {
                    (button !== btn) && button.toggle(false, true);
                });
                (this.btnEraser !== btn) && this.btnEraser.toggle(false, true);
            },

            SetDisabled: function (state) {
                this._state.disabled = state;
            },

            txtPen: 'Pen',
            txtHighlighter: 'Highlighter',
            txtEraser: 'Eraser',
            hintEraser: 'Eraser',
            txtSize: 'Size',
            txtSelect: 'Select',
            hintSelect: 'Select',
            txtMM: 'mm'
        }
    }()), Common.Views.Draw || {}));
});