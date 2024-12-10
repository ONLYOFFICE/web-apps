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
 *  Draw.js
 *
 *  Created on 28.03.2023
 *
 */

if (Common === undefined)
    var Common = {};

Common.Views = Common.Views || {};

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Layout',
    'common/main/lib/component/Window',
    'common/main/lib/component/UpDownPicker'
], function (template) {
    'use strict';

    Common.Views.Draw = Common.UI.BaseView.extend(_.extend((function(){
        var template =
            '<div class="group">' +
            '<span id="slot-btn-draw-select" class="btn-slot text x-huge"></span>' +
            '<span id="slot-btn-draw-pen-0" class="btn-slot text x-huge emptycaption"></span>' +
            '<span id="slot-btn-draw-pen-1" class="btn-slot text x-huge emptycaption"></span>' +
            '<span id="slot-btn-draw-pen-2" class="btn-slot text x-huge emptycaption"></span>' +
            '<span id="slot-btn-draw-eraser" class="btn-slot text x-huge"></span>' +
            '</div>';
        var templateSection =
            '<section id="draw-ink-panel" class="panel" data-tab="draw" role="tabpanel" aria-labelledby="draw">' +
            template +
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
                    me.fireEvent('draw:color', [b, color]);
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
                this.isPDFEditor = !!window.PDFE;

                var filter = Common.localStorage.getKeysFilter();
                this.appPrefix = (filter && filter.length) ? filter.split(',')[0] : '';

                var _set = Common.enumLock;
                var penOptions = [
                        {hint: this.txtPen,  color: '3D8A44',  opacity: 100, size: {arr: [0.25, 0.5, 1, 2, 3.5], idx: 2}, iconCls: 'btn-pen-tool', idx: 0},
                        {hint: this.txtPen,  color: 'D43230',  opacity: 100, size: {arr: [0.25, 0.5, 1, 2, 3.5], idx: 2}, iconCls: 'btn-pen-tool', idx: 1},
                        {hint: this.txtHighlighter,  color: 'FFFC54',  opacity: 50, size: {arr: [2, 4, 6, 8, 10], idx: 2}, iconCls: 'btn-highlighter-tool', idx: 2,
                         colors: [
                             'FFFC54', '72F54A', '74F9FD', 'EB51F7', 'A900F9', 'EF8B3A', '7272FF', 'FF63A4', '1DFF92', '03DA18',
                             '249B01', 'C504D2', '0633D1', 'FFF7A0', 'FF0303', 'FFFFFF', 'D3D3D4', '969696', '606060', '000000'
                         ]}
                    ],
                    lock = (this.appPrefix === 'de-') ? [_set.headerLock, _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.viewMode] :
                           (this.appPrefix === 'pe-') ? [_set.slideDeleted, _set.lostConnect, _set.noSlides] :
                                                        [_set.editCell, _set.lostConnect, _set.coAuth, _set['Objects']],
                    me = this;
                penOptions.forEach(function (props) {
                    var btn = new Common.UI.ButtonColored({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'toolbar__icon ' + props.iconCls,
                        caption: ' ',
                        menu: true,
                        split: true,
                        enableToggle: true,
                        allowDepress: true,
                        dataHint    : '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'small',
                        penOptions: props,
                        lock: lock
                    });
                    me.btnsPen.push(btn);
                    me.lockedControls.push(btn);
                });

                this.btnEraser = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-eraser',
                    caption: this.txtEraser,
                    enableToggle: true,
                    allowDepress: true,
                    dataHint    : '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small',
                    lock: lock
                });
                this.lockedControls.push(this.btnEraser);

                this.btnSelect = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-select',
                    caption: this.txtSelect,
                    dataHint    : '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small',
                    lock: lock,
                    visible: !this.isPDFEditor
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
                button.updateHint(config.hint + ': ' + Common.Utils.ThemeColor.getTranslation(Common.Utils.ThemeColor.getRgbColor(config.color).asc_getName()) + Common.Utils.String.textComma + ' ' + config.size.arr[config.size.idx] + ' ' + this.txtMM);
                button.sizePicker && button.sizePicker.setValue(config.size.arr[config.size.idx] + ' ' + this.txtMM);
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
                            {
                                template: _.template('<div id="id-toolbar-menu-draw-pen-' + id + '" style="width: 174px; display: inline-block;" class="palette-large"></div>'),
                                stopPropagation: true
                            },
                            {
                                id: id + '-color-new',
                                template: _.template('<a tabindex="-1" type="menuitem" style="">' + button.textNewColor + '</a>')
                            },
                            {caption: '--'},
                            {
                                template: _.template('<div id="id-toolbar-draw-updownpicker-' + id + '" class="custom-scale" data-stopPropagation="true"></div>'),
                                stopPropagation: true
                            }
                        ]
                    }), true );
                // color
                button.currentColor = config.color;
                button.setColor(button.currentColor);
                var picker = new Common.UI.ThemeColorPalette({
                    el: $('#id-toolbar-menu-draw-pen-' + id),
                    colors: config.colors || [
                        '1755A0', 'D43230', 'F5C346', 'EA3368', '12A489', '552F8B', '9D1F87', 'BB2765', '479ED2', '67C9FA',
                        '3D8A44', '80CA3D', '1C19B4', '7F4B0F', 'FF7E07', 'FFFFFF', 'D3D3D4', '879397', '575757', '000000'
                    ],
                    value: button.currentColor,
                    dynamiccolors: 5,
                    themecolors: 0,
                    effects: 0,
                    columns: 5,
                    outerMenu: {menu: button.menu, index: 0, focusOnShow: true},
                    storageSuffix: '-draw'
                });
                button.setPicker(picker);
                picker.on('select', _.bind(button.onColorSelect, button));
                button.menu.setInnerMenu([{menu: picker, index: 0}]);
                button.menu.cmpEl.find('#' + id + '-color-new').on('click',  function() {
                    picker.addNewColor(button.currentColor);
                });
                // size
                var onShowAfter = function(menu) {
                    var sizePicker = new Common.UI.UpDownPicker({
                        el: $('#id-toolbar-draw-updownpicker-' + id),
                        caption: me.txtSize,
                        minWidth: 50
                    });
                    sizePicker.on('click', function (direction) {
                        me.fireEvent('draw:size', [button, direction]);
                    });
                    sizePicker.setValue(button.options.penOptions.size.arr[button.options.penOptions.size.idx] + ' ' + me.txtMM);
                    button.sizePicker = sizePicker;
                    menu.off('show:after', onShowAfter);
                };
                button.menu.on('show:after', onShowAfter);
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

            getPanel: function (groups) {
                this.$el = $(_.template(groups ? template : templateSection)( {} ));
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