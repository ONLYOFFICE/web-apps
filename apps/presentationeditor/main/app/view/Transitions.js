/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/**
 *  Transitions.js
 *
 *  View
 *
 *  Created on 15.07.21
 *
 */



define([
    'common/main/lib/util/utils',
    'common/main/lib/component/Button',
    'common/main/lib/component/DataView',
    'common/main/lib/component/ComboDataView',
    'common/main/lib/component/Layout',
    'presentationeditor/main/app/view/SlideSettings',
    'common/main/lib/component/MetricSpinner',
    'common/main/lib/component/Window'
], function () {
    'use strict';

    PE.Views.Transitions = Common.UI.BaseView.extend(_.extend((function() {
        function setEvents() {
            var me = this;
            if (me.listEffects) {
                me.listEffects.on('click', _.bind(function (combo, record) {
                    me.fireEvent('transit:selecteffect', [combo, record]);
                }, me));
            }

            if (me.btnPreview) {
                me.btnPreview.on('click', _.bind(function(btn) {
                    me.fireEvent('transit:preview', [me.btnPreview]);
                }, me));
            }

            if (me.btnParameters) {

                me.btnParameters.menu.on('item:click', function (menu, item, e) {
                    me.fireEvent('transit:parameters', [item.value]);
                });
            }

            if (me.btnApplyToAll) {
                me.btnApplyToAll.on('click', _.bind(function(btn) {
                    me.fireEvent('transit:applytoall', [me.btnApplyToAll]);
                }, me));
            }

            if (me.numDuration) {
                me.numDuration.on('change', function(bth) {
                    me.fireEvent('transit:duration', [me.numDuration]);
                }, me);
            }

            if (me.numDelay) {
                me.numDelay.on('change', function(bth) {
                    me.fireEvent('transit:delay', [me.numDelay]);
                }, me);
            }

            if (me.chStartOnClick) {
                me.chStartOnClick.on('change', _.bind(function (e) {
                    me.fireEvent('transit:startonclick', [me.chStartOnClick, me.chStartOnClick.value, me.chStartOnClick.lastValue]);
                }, me));
            }

            if (me.chDelay) {
                me.chDelay.on('change', _.bind(function (e) {
                    me.fireEvent('transit:checkdelay', [me.chDelay, me.chDelay.value, me.chDelay.lastValue]);
                }, me));
            }
        }

        return {
            // el: '#transitions-panel',

            options: {},

            initialize: function (options) {

                Common.UI.BaseView.prototype.initialize.call(this, options);
                this.toolbar = options.toolbar;
                this.appConfig = options.mode;
                this.$el = this.toolbar.toolbar.$el.find('#transitions-panel');
                var _set = Common.enumLock;
                this.lockedControls = [];

                this._arrEffectName = [
                    {group: 'subtle', title: this.textNone, imageUrl: "btn-transition-none", value: Asc.c_oAscSlideTransitionTypes.None, id: Common.UI.getId()},
                    {group: 'subtle', title: this.textMorph, imageUrl: "btn-transition-morph", value: Asc.c_oAscSlideTransitionTypes.Morph, id: Common.UI.getId()},
                    {group: 'subtle', title: this.textFade, imageUrl: "btn-transition-fade", value: Asc.c_oAscSlideTransitionTypes.Fade, id: Common.UI.getId()},
                    {group: 'subtle', title: this.textPush, imageUrl: "btn-transition-push", value: Asc.c_oAscSlideTransitionTypes.Push, id: Common.UI.getId()},
                    {group: 'subtle', title: this.textWipe, imageUrl: "btn-transition-wipe", value: Asc.c_oAscSlideTransitionTypes.Wipe, id: Common.UI.getId()},
                    {group: 'subtle', title: this.textSplit, imageUrl: "btn-transition-split", value: Asc.c_oAscSlideTransitionTypes.Split, id: Common.UI.getId()},
                    {group: 'subtle', title: this.textCut, imageUrl: "btn-transition-cut", value: Asc.c_oAscSlideTransitionTypes.Cut, id: Common.UI.getId()},
                    {group: 'subtle', title: this.textRandomBars, imageUrl: "btn-transition-randombars", value: Asc.c_oAscSlideTransitionTypes.RandomBar, id: Common.UI.getId()},
                    {group: 'subtle', title: this.textShape, imageUrl: "btn-transition-shape", value: Asc.c_oAscSlideTransitionTypes.Circle, id: Common.UI.getId()},
                    {group: 'subtle', title: this.textUnCover, imageUrl: "btn-transition-uncover", value: Asc.c_oAscSlideTransitionTypes.UnCover, id: Common.UI.getId()},
                    {group: 'subtle', title: this.textCover, imageUrl: "btn-transition-cover", value: Asc.c_oAscSlideTransitionTypes.Cover, id: Common.UI.getId()},
                    {group: 'exciting', title: this.textDissolve, imageUrl: "btn-transition-dissolve", value: Asc.c_oAscSlideTransitionTypes.Dissolve, id: Common.UI.getId()},
                    {group: 'exciting', title: this.textChecker, imageUrl: "btn-transition-checker", value: Asc.c_oAscSlideTransitionTypes.Checker, id: Common.UI.getId()},
                    {group: 'exciting', title: this.textBlinds, imageUrl: "btn-transition-blinds", value: Asc.c_oAscSlideTransitionTypes.Blinds, id: Common.UI.getId()},
                    {group: 'exciting', title: this.textClock, imageUrl: "btn-transition-clock", value: Asc.c_oAscSlideTransitionTypes.Clock, id: Common.UI.getId()},
                    {group: 'exciting', title: this.textRipple, imageUrl: "btn-transition-ripple", value: Asc.c_oAscSlideTransitionTypes.Ripple, id: Common.UI.getId()},
                    {group: 'exciting', title: this.textHoneycomb, imageUrl: "btn-transition-honeycomb", value: Asc.c_oAscSlideTransitionTypes.Honeycomb, id: Common.UI.getId()},
                    {group: 'exciting', title: this.textVortex, imageUrl: "btn-transition-vortex", value: Asc.c_oAscSlideTransitionTypes.Vortex, id: Common.UI.getId()},
                    {group: 'exciting', title: this.textSwitch, imageUrl: "btn-transition-switch", value: Asc.c_oAscSlideTransitionTypes.Switch, id: Common.UI.getId()},
                    {group: 'exciting', title: this.textFlip, imageUrl: "btn-transition-flip", value: Asc.c_oAscSlideTransitionTypes.Flip, id: Common.UI.getId()},
                    {group: 'exciting', title: this.textGallery, imageUrl: "btn-transition-gallery", value: Asc.c_oAscSlideTransitionTypes.Gallery, id: Common.UI.getId()},
                    {group: 'exciting', title: this.textCube, imageUrl: "btn-transition-cube", prismId: 'prism-cube', value: Asc.c_oAscSlideTransitionTypes.Prism, id: Common.UI.getId()},
                    {group: 'exciting', title: this.textDoors, imageUrl: "btn-transition-doors", value: Asc.c_oAscSlideTransitionTypes.Doors, id: Common.UI.getId()},
                    {group: 'exciting', title: this.textBox, imageUrl: "btn-transition-box", prismId: 'prism-box', value: Asc.c_oAscSlideTransitionTypes.Prism, id: Common.UI.getId()},
                    {group: 'exciting', title: this.textComb, imageUrl: "btn-transition-comb", value: Asc.c_oAscSlideTransitionTypes.Comb, id: Common.UI.getId()},
                    {group: 'exciting', title: this.textZoom, imageUrl: "btn-transition-zoom", value: Asc.c_oAscSlideTransitionTypes.Zoom, id: Common.UI.getId()},
                    {group: 'exciting', title: this.textRandom, imageUrl: "btn-transition-random", value: Asc.c_oAscSlideTransitionTypes.Random, id: Common.UI.getId()},
                    {group: 'dynamic-content', title: this.textFerris, imageUrl: "btn-transition-ferris", value: Asc.c_oAscSlideTransitionTypes.Ferris, id: Common.UI.getId()},
                    {group: 'dynamic-content', title: this.textRotate, imageUrl: "btn-transition-rotate", prismId: 'prism-rotate', value: Asc.c_oAscSlideTransitionTypes.Prism, id: Common.UI.getId()},
                    {group: 'dynamic-content', title: this.textWindow, imageUrl: "btn-transition-window", value: Asc.c_oAscSlideTransitionTypes.Window, id: Common.UI.getId()},
                    {group: 'dynamic-content', title: this.textOrbit, imageUrl: "btn-transition-orbit", prismId: 'prism-orbit', value: Asc.c_oAscSlideTransitionTypes.Prism, id: Common.UI.getId(), cls: 'last-item'}
                ];
                this._arrEffectName.forEach(function (item) {
                    item.tip = item.title;
                });

                var itemWidth = 88,
                    itemHeight = 40;
                this.listEffects = new Common.UI.ComboDataView({
                    cls: 'combo-transitions',
                    itemWidth: itemWidth,
                    itemHeight: itemHeight,
                    menuMaxHeight: 350,
                    style: 'min-width:115px;',
                    autoWidth:       true,
                    itemTemplate: _.template([
                        '<div  class = "btn_item x-huge" id = "<%= id %>" style = "width: ' + itemWidth + 'px;height: ' + itemHeight + 'px;">',
                        '<div class = "icon toolbar__icon options__icon <%= imageUrl %>"></div>',
                        '<div class = "caption"><%= title %></div>',
                        '</div>'
                    ].join('')),
                    groups: new Common.UI.DataViewGroupStore([
                        {id: 'subtle',  caption: this.textSubtle},
                        {id: 'exciting', caption: this.textExciting},
                        {id: 'dynamic-content', caption: this.textDynamicContent}
                    ]),
                    enableKeyEvents: true,
                    lock: [_set.slideDeleted, _set.noSlides, _set.disableOnStart, _set.transitLock],
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: '-16, 0',
                    delayRenderTips: true,
                    beforeOpenHandler: function (e) {
                        var cmp = this,
                            menu = cmp.openButton.menu;

                        if (menu.cmpEl) {

                            menu.menuAlignEl = cmp.cmpEl;
                            menu.menuAlign = Common.UI.isRTL() ? 'tr-tr' : 'tl-tl';
                            menu.cmpEl.css({
                                'width': cmp.cmpEl.width() - cmp.openButton.$el.width(),
                                'min-height': cmp.cmpEl.height()
                            });
                        }

                        if (cmp.menuPicker.scroller) {
                            cmp.menuPicker.scroller.update({
                                includePadding: true,
                                suppressScrollX: true
                            });
                        }

                        cmp.removeTips();
                    }
                });
                this.lockedControls.push(this.listEffects);
                this.listEffects.menuPicker.store.add(this._arrEffectName);

                this.btnPreview = new Common.UI.Button({
                    cls: 'btn-toolbar', // x-huge icon-top',
                    caption: this.txtPreview,
                    split: false,
                    iconCls: 'toolbar__icon btn-preview-transitions',
                    lock: [_set.slideDeleted, _set.noSlides, _set.disableOnStart, _set.transitLock],
                    dataHint: '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'medium'
                });
                this.lockedControls.push(this.btnPreview);

                this.btnParameters = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    caption: this.txtParameters,
                    iconCls: 'toolbar__icon btn-transition-none',
                    menu: new Common.UI.Menu({
                        items: this.createParametersMenuItems()
                    }),
                    lock: [_set.slideDeleted, _set.noSlides, _set.disableOnStart, _set.transitLock],
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.btnParameters);

                this.btnApplyToAll = new Common.UI.Button({
                    cls: 'btn-toolbar',
                    caption: this.txtApplyToAll,
                    split: true,
                    iconCls: 'toolbar__icon btn-transition-apply-all',
                    lock: [_set.slideDeleted, _set.noSlides, _set.disableOnStart, _set.transitLock],
                    dataHint: '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'medium'
                });
                this.lockedControls.push(this.btnApplyToAll);

                this.numDuration = new Common.UI.MetricSpinner({
                    el: this.$el.find('#transit-spin-duration'),
                    step: 1,
                    width: 55,
                    value: '',
                    defaultUnit: this.txtSec,
                    maxValue: 300,
                    minValue: 0,
                    lock: [_set.slideDeleted, _set.noSlides, _set.disableOnStart, _set.transitLock],
                    dataHint: '1',
                    dataHintDirection: 'top',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.numDuration);

                this.lblDuration = new Common.UI.Label({
                    el: this.$el.find('#transit-duration'),
                    iconCls: 'toolbar__icon btn-animation-duration',
                    caption: this.strDuration,
                    lock: [_set.slideDeleted, _set.noSlides, _set.disableOnStart, _set.transitLock]
                });
                this.lockedControls.push(this.lblDuration);

                this.numDelay = new Common.UI.MetricSpinner({
                    el: this.$el.find('#transit-spin-delay'),
                    step: 1,
                    width: 55,
                    value: '',
                    defaultUnit: this.txtSec,
                    maxValue: 300,
                    minValue: 0,
                    lock: [_set.slideDeleted, _set.noSlides, _set.disableOnStart, _set.transitLock],
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'big'
                });
                this.lockedControls.push(this.numDelay);

                this.chStartOnClick = new Common.UI.CheckBox({
                    el: this.$el.find('#transit-checkbox-startonclick'),
                    labelText: this.strStartOnClick,
                    lock: [_set.slideDeleted, _set.noSlides, _set.disableOnStart, _set.transitLock],
                    dataHint: '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chStartOnClick);

                this.chDelay = new Common.UI.CheckBox({
                    el: this.$el.find('#transit-checkbox-delay'),
                    labelText: this.strDelay,
                    lock: [_set.slideDeleted, _set.noSlides, _set.disableOnStart, _set.transitLock],
                    dataHint: '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chDelay);
                Common.UI.LayoutManager.addControls(this.lockedControls);
                Common.Utils.lockControls(Common.enumLock.disableOnStart, true, {array: this.lockedControls});

                Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            },

            render: function (el) {
                this.boxSdk = $('#editor_sdk');
                if (el) el.html(this.getPanel());
                return this;
            },

            createParametersMenuItems: function () {
                var arrEffectType = [
                    {caption: this.textSmoothly, value: Asc.c_oAscSlideTransitionParams.Fade_Smoothly},
                    {caption: this.textBlack, value: Asc.c_oAscSlideTransitionParams.Fade_Through_Black},
                    {caption: this.textLeft, value: Asc.c_oAscSlideTransitionParams.Param_Left},
                    {caption: this.textTop, value: Asc.c_oAscSlideTransitionParams.Param_Top},
                    {caption: this.textRight, value: Asc.c_oAscSlideTransitionParams.Param_Right},
                    {caption: this.textBottom, value: Asc.c_oAscSlideTransitionParams.Param_Bottom},
                    {caption: this.textTopLeft, value: Asc.c_oAscSlideTransitionParams.Param_TopLeft},
                    {caption: this.textTopRight, value: Asc.c_oAscSlideTransitionParams.Param_TopRight},
                    {caption: this.textBottomLeft, value: Asc.c_oAscSlideTransitionParams.Param_BottomLeft},
                    {caption: this.textBottomRight, value: Asc.c_oAscSlideTransitionParams.Param_BottomRight},
                    {caption: this.textVerticalIn, value: Asc.c_oAscSlideTransitionParams.Split_VerticalIn},
                    {caption: this.textVerticalOut, value: Asc.c_oAscSlideTransitionParams.Split_VerticalOut},
                    {caption: this.textHorizontalIn, value: Asc.c_oAscSlideTransitionParams.Split_HorizontalIn},
                    {caption: this.textHorizontalOut, value: Asc.c_oAscSlideTransitionParams.Split_HorizontalOut},
                    {caption: this.textClockwise, value: Asc.c_oAscSlideTransitionParams.Clock_Clockwise},
                    {caption: this.textCounterclockwise, value: Asc.c_oAscSlideTransitionParams.Clock_Counterclockwise},
                    {caption: this.textWedge, value: Asc.c_oAscSlideTransitionParams.Clock_Wedge},
                    {caption: this.textZoomIn, value: Asc.c_oAscSlideTransitionParams.Zoom_In},
                    {caption: this.textZoomOut, value: Asc.c_oAscSlideTransitionParams.Zoom_Out},
                    {caption: this.textZoomRotate, value: Asc.c_oAscSlideTransitionParams.Zoom_AndRotate},
                    {caption: this.textMorphObjects, value: Asc.c_oAscSlideTransitionParams.Morph_Objects},
                    {caption: this.textMorphWord, value: Asc.c_oAscSlideTransitionParams.Morph_Words},
                    {caption: this.textMorphLetters, value: Asc.c_oAscSlideTransitionParams.Morph_Letters},
                    {caption: this.textNone, value: Asc.c_oAscSlideTransitionParams.Cut_Default},
                    {caption: this.textBlack, value: Asc.c_oAscSlideTransitionParams.Cut_ThroughBlack},
                    {caption: this.textHorizontal, value: Asc.c_oAscSlideTransitionParams.Blinds_Horizontal},
                    {caption: this.textVertical, value: Asc.c_oAscSlideTransitionParams.Blinds_Vertical},
                    {caption: this.textHorizontal, value: Asc.c_oAscSlideTransitionParams.Checker_Horizontal},
                    {caption: this.textVertical, value: Asc.c_oAscSlideTransitionParams.Checker_Vertical},
                    {caption: this.textHorizontal, value: Asc.c_oAscSlideTransitionParams.Comb_Horizontal},
                    {caption: this.textVertical, value: Asc.c_oAscSlideTransitionParams.Comb_Vertical},
                    {caption: this.textCircle, value: Asc.c_oAscSlideTransitionParams.Circle_Default},
                    {caption: this.textDiamond, value: Asc.c_oAscSlideTransitionParams.Diamond_Default},
                    {caption: this.textDissolve, value: Asc.c_oAscSlideTransitionParams.Dissolve_Default},
                    {caption: this.textPlus, value: Asc.c_oAscSlideTransitionParams.Plus_Default},
                    {caption: this.textHorizontal, value: Asc.c_oAscSlideTransitionParams.RandomBar_Horizontal},
                    {caption: this.textVertical, value: Asc.c_oAscSlideTransitionParams.RandomBar_Vertical},
                    {caption: this.textIn, value: Asc.c_oAscSlideTransitionParams.BoxZoom_In},
                    {caption: this.textOut, value: Asc.c_oAscSlideTransitionParams.BoxZoom_Out},
                    {caption: this.textLeft, value: Asc.c_oAscSlideTransitionParams.Vortex_Left},
                    {caption: this.textRight, value: Asc.c_oAscSlideTransitionParams.Vortex_Right},
                    {caption: this.textTop, value: Asc.c_oAscSlideTransitionParams.Vortex_Up},
                    {caption: this.textBottom, value: Asc.c_oAscSlideTransitionParams.Vortex_Down},
                    {caption: this.textLeftShort, value: Asc.c_oAscSlideTransitionParams.Switch_Left},
                    {caption: this.textRightShort, value: Asc.c_oAscSlideTransitionParams.Switch_Right},
                    {caption: this.textLeftShort, value: Asc.c_oAscSlideTransitionParams.Flip_Left},
                    {caption: this.textRightShort, value: Asc.c_oAscSlideTransitionParams.Flip_Right},
                    {caption: this.textCenter, value: Asc.c_oAscSlideTransitionParams.Ripple_Center},
                    {caption: this.textTopLeft, value: Asc.c_oAscSlideTransitionParams.Ripple_LeftUp},
                    {caption: this.textTopRight, value: Asc.c_oAscSlideTransitionParams.Ripple_RightUp},
                    {caption: this.textBottomLeft, value: Asc.c_oAscSlideTransitionParams.Ripple_LeftDown},
                    {caption: this.textBottomRight, value: Asc.c_oAscSlideTransitionParams.Ripple_RightDown},
                    {caption: this.textHoneycomb, value: Asc.c_oAscSlideTransitionParams.Honeycomb_Default},
                    {caption: this.textLeft, value: Asc.c_oAscSlideTransitionParams.Prism_Left},
                    {caption: this.textRight, value: Asc.c_oAscSlideTransitionParams.Prism_Right},
                    {caption: this.textTop, value: Asc.c_oAscSlideTransitionParams.Prism_Up},
                    {caption: this.textBottom, value: Asc.c_oAscSlideTransitionParams.Prism_Down},
                    {caption: this.textLeft, value: Asc.c_oAscSlideTransitionParams.Prism_Left_Inverted},
                    {caption: this.textRight, value: Asc.c_oAscSlideTransitionParams.Prism_Right_Inverted},
                    {caption: this.textTop, value: Asc.c_oAscSlideTransitionParams.Prism_Up_Inverted},
                    {caption: this.textBottom, value: Asc.c_oAscSlideTransitionParams.Prism_Down_Inverted},
                    {caption: this.textLeft, value: Asc.c_oAscSlideTransitionParams.Prism_Left_Content},
                    {caption: this.textRight, value: Asc.c_oAscSlideTransitionParams.Prism_Right_Content},
                    {caption: this.textTop, value: Asc.c_oAscSlideTransitionParams.Prism_Up_Content},
                    {caption: this.textBottom, value: Asc.c_oAscSlideTransitionParams.Prism_Down_Content},
                    {caption: this.textLeft, value: Asc.c_oAscSlideTransitionParams.Prism_Left_ContentInv},
                    {caption: this.textRight, value: Asc.c_oAscSlideTransitionParams.Prism_Right_ContentInv},
                    {caption: this.textTop, value: Asc.c_oAscSlideTransitionParams.Prism_Up_ContentInv},
                    {caption: this.textBottom, value: Asc.c_oAscSlideTransitionParams.Prism_Down_ContentInv},
                    {caption: this.textHorizontal, value: Asc.c_oAscSlideTransitionParams.Doors_Horizontal},
                    {caption: this.textVertical, value: Asc.c_oAscSlideTransitionParams.Doors_Vertical},
                    {caption: this.textHorizontal, value: Asc.c_oAscSlideTransitionParams.Window_Horizontal},
                    {caption: this.textVertical, value: Asc.c_oAscSlideTransitionParams.Window_Vertical},
                    {caption: this.textLeft, value: Asc.c_oAscSlideTransitionParams.Ferris_Left},
                    {caption: this.textRight, value: Asc.c_oAscSlideTransitionParams.Ferris_Right},
                    {caption: this.textLeftShort, value: Asc.c_oAscSlideTransitionParams.Gallery_Left},
                    {caption: this.textRightShort, value: Asc.c_oAscSlideTransitionParams.Gallery_Right}
                ];

                var itemsMenu = [];
                _.each(arrEffectType, function (item) {
                    itemsMenu.push({
                        caption: item.caption, value: item.value,
                        checkable: true,
                        toggleGroup: 'effects'
                    });
                });
                return itemsMenu;
            },

            onAppReady: function (config) {
                var me = this;
                (new Promise(function (accept, reject) {
                    accept();
                })).then(function () {

                    setEvents.call(me);
                });
            },

            getPanel: function () {
                this.listEffects && this.listEffects.render(this.$el.find('#transit-field-effects'));
                this.btnPreview && this.btnPreview.render(this.$el.find('#transit-button-preview'));
                this.btnParameters && this.btnParameters.render(this.$el.find('#transit-button-parameters'));
                this.btnApplyToAll && this.btnApplyToAll.render(this.$el.find('#transit-button-apply'));
                this.renderComponent('#transit-spin-duration', this.numDuration);
                this.renderComponent('#transit-spin-delay', this.numDelay);
                this.renderComponent('#transit-checkbox-startonclick', this.chStartOnClick);
                this.$el.find("#label-delay").innerText = this.strDelay;
                return this.$el;
            },

            renderComponent: function (compid, obj) {
                var element = this.$el.find(compid);
                element.parent().append(obj.el);
            },

            show: function () {
                Common.UI.BaseView.prototype.show.call(this);
                this.fireEvent('show', this);
            },

            getButtons: function (type) {
                if (type === undefined)
                    return this.lockedControls;
                return [];
            },

            setDisabled: function (state) {
                this.lockedControls && this.lockedControls.forEach(function (button) {
                    button.setDisabled(state);
                }, this);
            },

            getPrismId: function (value) {
                var prismId = 'prism-cube';
                if (value >= Asc.c_oAscSlideTransitionParams.Prism_Left_Inverted && value <= Asc.c_oAscSlideTransitionParams.Prism_Down_Inverted)
                    prismId = 'prism-box';
                else if (value >= Asc.c_oAscSlideTransitionParams.Prism_Left_Content && value <= Asc.c_oAscSlideTransitionParams.Prism_Down_Content)
                    prismId = 'prism-rotate';
                else if (value >= Asc.c_oAscSlideTransitionParams.Prism_Left_ContentInv && value <= Asc.c_oAscSlideTransitionParams.Prism_Down_ContentInv)
                    prismId = 'prism-orbit';
                return prismId;
            },

            getShapeType: function (value) {
                if (value === Asc.c_oAscSlideTransitionParams.Diamond_Default)
                    return Asc.c_oAscSlideTransitionTypes.Diamond;
                if (value === Asc.c_oAscSlideTransitionParams.Plus_Default)
                    return Asc.c_oAscSlideTransitionTypes.Plus;
                if (value === Asc.c_oAscSlideTransitionParams.BoxZoom_In || value === Asc.c_oAscSlideTransitionParams.BoxZoom_Out)
                    return Asc.c_oAscSlideTransitionTypes.BoxZoom;
                return Asc.c_oAscSlideTransitionTypes.Circle;
            },

            getEffect: function (effect, value) {
                if (effect === Asc.c_oAscSlideTransitionTypes.Prism) {
                    var prism = this.getPrismId(value);
                    return this.listEffects.store.findWhere({prismId: prism});
                }
                if (this.isShape(effect))
                    return this.listEffects.store.findWhere({value: Asc.c_oAscSlideTransitionTypes.Circle});
                return this.listEffects.store.findWhere({value: effect});
            },

            isShape: function (effect) {
                return effect === Asc.c_oAscSlideTransitionTypes.Circle ||
                    effect === Asc.c_oAscSlideTransitionTypes.Diamond ||
                    effect === Asc.c_oAscSlideTransitionTypes.Plus ||
                    effect === Asc.c_oAscSlideTransitionTypes.BoxZoom;
            },


            setMenuParameters: function (effect, value, prismId) {
                var minMax = [-1, -1];
                var shapeItems;
                switch (effect) {
                    case Asc.c_oAscSlideTransitionTypes.Fade:
                        minMax = [0, 1];
                        break;
                    case Asc.c_oAscSlideTransitionTypes.Push:
                        minMax = [2, 5];
                        break;
                    case Asc.c_oAscSlideTransitionTypes.Wipe:
                        minMax = [2, 9];
                        break;
                    case Asc.c_oAscSlideTransitionTypes.Split:
                        minMax = [10, 13];
                        break;
                    case Asc.c_oAscSlideTransitionTypes.UnCover:
                        minMax = [2, 9];
                        break;
                    case Asc.c_oAscSlideTransitionTypes.Cover:
                        minMax = [2, 9];
                        break;
                    case Asc.c_oAscSlideTransitionTypes.Clock:
                        minMax = [14, 16];
                        break;
                    case Asc.c_oAscSlideTransitionTypes.Zoom:
                        minMax = [17, 19];
                        break;
                    case Asc.c_oAscSlideTransitionTypes.Morph:
                        minMax = [20, 22];
                        break;
                    case Asc.c_oAscSlideTransitionTypes.Cut:
                        minMax = [23, 24];
                        break;
                    case Asc.c_oAscSlideTransitionTypes.Blinds:
                        minMax = [25, 26];
                        break;
                    case Asc.c_oAscSlideTransitionTypes.Checker:
                        minMax = [27, 28];
                        break;
                    case Asc.c_oAscSlideTransitionTypes.Comb:
                        minMax = [29, 30];
                        break;
                    case Asc.c_oAscSlideTransitionTypes.RandomBar:
                        minMax = [35, 36];
                        break;
                    case Asc.c_oAscSlideTransitionTypes.Circle:
                    case Asc.c_oAscSlideTransitionTypes.Diamond:
                    case Asc.c_oAscSlideTransitionTypes.Plus:
                    case Asc.c_oAscSlideTransitionTypes.BoxZoom:
                        shapeItems = [31, 32, 34, 37, 38];
                        break;
                    case Asc.c_oAscSlideTransitionTypes.Vortex:
                        minMax = [39, 42];
                        break;
                    case Asc.c_oAscSlideTransitionTypes.Switch:
                        minMax = [43, 44];
                        break;
                    case Asc.c_oAscSlideTransitionTypes.Flip:
                        minMax = [45, 46];
                        break;
                    case Asc.c_oAscSlideTransitionTypes.Ripple:
                        minMax = [47, 51];
                        break;
                    case Asc.c_oAscSlideTransitionTypes.Prism:
                        var prism = prismId || this.getPrismId(value);
                        switch (prism) {
                            case 'prism-box':
                                minMax = [57, 60];
                                break;
                            case 'prism-rotate':
                                minMax = [61, 64];
                                break;
                            case 'prism-orbit':
                                minMax = [65, 68];
                                break;
                            default:
                                minMax = [53, 56];
                                break;
                        }
                        break;
                    case Asc.c_oAscSlideTransitionTypes.Doors:
                        minMax = [69, 70];
                        break;
                    case Asc.c_oAscSlideTransitionTypes.Window:
                        minMax = [71, 72];
                        break;
                    case Asc.c_oAscSlideTransitionTypes.Ferris:
                        minMax = [73, 74];
                        break;
                    case Asc.c_oAscSlideTransitionTypes.Gallery:
                        minMax = [75, 76];
                        break;
                }

                var selectedElement;

                _.each(this.btnParameters.menu.getItems(), function (element, index) {
                    var itemVisible = shapeItems ? _.contains(shapeItems, index) : ((index >= minMax[0]) && (index <= minMax[1]));
                    if (itemVisible) {
                        element.setVisible(true);
                        if (value != undefined) {
                            if (value == element.value) selectedElement = element;
                        }
                    } else
                        element.setVisible(false);
                });

                if (selectedElement == undefined)
                    selectedElement = shapeItems ? this.btnParameters.menu.items[shapeItems[0]] : this.btnParameters.menu.items[minMax[0]];

                if (effect != Asc.c_oAscSlideTransitionTypes.None && selectedElement)
                    selectedElement.setChecked(true);

                if (!this.listEffects.isDisabled()) {
                    var noParameters = effect === Asc.c_oAscSlideTransitionTypes.None ||
                        effect === Asc.c_oAscSlideTransitionTypes.Random ||
                        effect === Asc.c_oAscSlideTransitionTypes.Dissolve ||
                        effect === Asc.c_oAscSlideTransitionTypes.Honeycomb;

                    this.numDelay.setDisabled(this.chDelay.getValue() !== 'checked');
                    this.btnParameters.setDisabled(noParameters);
                    this.btnPreview.setDisabled(effect === Asc.c_oAscSlideTransitionTypes.None);
                    this.numDuration.setDisabled(effect === Asc.c_oAscSlideTransitionTypes.None);
                    this.lblDuration.setDisabled(effect === Asc.c_oAscSlideTransitionTypes.None);
                }
                return (selectedElement) ? selectedElement.value : -1;
            }
        }
    }()), PE.Views.Transitions || {}));

    });
