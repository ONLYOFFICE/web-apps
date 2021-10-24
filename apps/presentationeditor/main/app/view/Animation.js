/*
 *
 * (c) Copyright Ascensio System SIA 2010-2019
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
 *  Animation.js
 *
 *  View
 *
 *  Created by Olga.Sharova on 13.10.21
 *  Copyright (c) 2021 Ascensio System SIA. All rights reserved.
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

    PE.Views.Animation = Common.UI.BaseView.extend(_.extend((function() {
        function setEvents() {
            var me = this;
            if (me.listEffects) {
                me.listEffects.on('click', _.bind(function (combo, record) {
                    me.fireEvent('animation:selecteffect', [combo, record]);
                }, me));
            }

            if (me.btnPreview) {
                me.btnPreview.on('click', _.bind(function(btn) {
                    me.fireEvent('animation:preview', [me.btnPreview]);
                }, me));
            }

            if (me.btnParameters) {
                me.btnParameters.menu.on('item:click', function (menu, item, e) {
                    me.fireEvent('animation:parameters', [item.value]);
                });
            }

            if (me.btnAnimationPane) {
                me.btnAnimationPane.on('click', _.bind(function(btn) {
                    me.fireEvent('animation:animationpane', [me.btnAnimationPane]);
                }, me));
            }
            if (me.btnAddAnimation) {
                me.btnAddAnimation.on('click', _.bind(function(btn) {
                    me.fireEvent('animation:addanimation', [me.btnAddAnimation]);
                }, me));
            }

            if (me.numDuration) {
                me.numDuration.on('change', function(bth) {
                    me.fireEvent('animation:duration', [me.numDuration]);
                }, me);
            }

            if (me.numDelay) {
                me.numDelay.on('change', function(bth) {
                    me.fireEvent('animation:delay', [me.numDelay]);
                }, me);
            }

            if(me.cmbStart) {
                me.cmbStart.on('selected',function (combo, record)
                {
                    me.fireEvent('animation:startselect',[combo, record])
                })
            }

            if (me.numRepeat) {
                me.numRepeat.on('change', function(bth) {
                    me.fireEvent('animation:repeat', [me.numRepeat]);
                }, me);
            }

        }

        return {
            // el: '#transitions-panel',

            options: {},

            initialize: function (options) {

                Common.UI.BaseView.prototype.initialize.call(this, options);
                this.toolbar = options.toolbar;
                this.appConfig = options.mode;
                this.$el = this.toolbar.toolbar.$el.find('#animation-panel');
                var _set = PE.enumLock;
                this.lockedControls = [];

                this._arrEffectName = [
                    {title: this.textNone, imageUrl: "transition-none", value: Asc.c_oAscSlideTransitionTypes.None, id: Common.UI.getId()},
                    {title: this.textFade, imageUrl: "transition-fade", value: Asc.c_oAscSlideTransitionTypes.Fade, id: Common.UI.getId()},
                    {title: this.textPush, imageUrl: "transition-push", value: Asc.c_oAscSlideTransitionTypes.Push, id: Common.UI.getId()},
                    {title: this.textWipe, imageUrl: "transition-wipe", value: Asc.c_oAscSlideTransitionTypes.Wipe, id: Common.UI.getId()},
                    {title: this.textSplit, imageUrl: "transition-split", value: Asc.c_oAscSlideTransitionTypes.Split, id: Common.UI.getId()},
                    {title: this.textUnCover, imageUrl: "transition-uncover", value: Asc.c_oAscSlideTransitionTypes.UnCover, id: Common.UI.getId()},
                    {title: this.textCover, imageUrl: "transition-cover", value: Asc.c_oAscSlideTransitionTypes.Cover, id: Common.UI.getId()},
                    {title: this.textClock, imageUrl: "transition-clock", value: Asc.c_oAscSlideTransitionTypes.Clock, id: Common.UI.getId()},
                    {title: this.textZoom,  imageUrl: "transition-zoom", value: Asc.c_oAscSlideTransitionTypes.Zoom, id: Common.UI.getId()}
                ];

                this.listEffects = new Common.UI.ComboDataView({
                    cls: 'combo-styles',
                    itemWidth: 87,
                    itemHeight: 40,
                    enableKeyEvents: true,
                    //lock: [_set.slideDeleted, _set.noSlides, _set.disableOnStart, _set.transitLock],
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: '-16, 0',
                    beforeOpenHandler: function (e) {
                        var cmp = this,
                            menu = cmp.openButton.menu;

                        if (menu.cmpEl) {

                            menu.menuAlignEl = cmp.cmpEl;
                            menu.menuAlign = 'tl-tl';
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

                this.listEffects.fieldPicker.itemTemplate = _.template([
                    '<div  class = "btn_item x-huge" id = "<%= id %>" style = "width: ' + (this.listEffects.itemWidth) + 'px;height: ' + (this.listEffects.itemHeight) + 'px;">',
                        '<div class = "icon toolbar__icon <%= imageUrl %>"></div>',
                        '<div class = "caption"><%= title %></div>',
                    '</div>'
                ].join(''));
                this.listEffects.menuPicker.itemTemplate = this.listEffects.fieldPicker.itemTemplate;

                this.btnPreview = new Common.UI.Button({
                    cls: 'btn-toolbar', // x-huge icon-top',
                    caption: this.txtPreview,
                    split: false,
                    iconCls: 'toolbar__icon preview-transitions',
                    //lock: [_set.slideDeleted, _set.noSlides, _set.disableOnStart, _set.transitLock],
                    dataHint: '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'medium'
                });
                this.lockedControls.push(this.btnPreview);

                this.btnParameters = new Common.UI.Button({
                    cls: 'btn-toolbar  x-huge icon-top',
                    caption: this.txtParameters,
                    iconCls: 'toolbar__icon icon transition-none',
                    menu: new Common.UI.Menu({
                        items: this.createParametersMenuItems()}),
                    //lock: [_set.slideDeleted, _set.noSlides, _set.disableOnStart, _set.transitLock],
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.btnParameters);

                this.btnAnimationPane = new Common.UI.Button({
                    cls: 'btn-toolbar',
                    caption: this.txtAnimationPane,
                    split: true,
                    iconCls: 'toolbar__icon transition-apply-all',
                    //lock: [_set.slideDeleted, _set.noSlides, _set.disableOnStart, _set.transitLock],
                    dataHint: '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'medium'
                });
                this.lockedControls.push(this.btnAnimationPane);

                this.btnAddAnimation = new Common.UI.Button({
                    cls: 'btn-toolbar',
                    caption: this.txtAddEffect,
                    split: true,
                    iconCls: 'toolbar__icon btn-zoomup',
                    //lock: [_set.slideDeleted, _set.noSlides, _set.disableOnStart, _set.transitLock],
                    dataHint: '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'medium'
                });
                this.lockedControls.push(this.btnAddAnimation);

                this.numDuration = new Common.UI.MetricSpinner({
                    el: this.$el.find('#animation-spin-duration'),
                    step: 1,
                    width: 52,
                    value: '',
                    defaultUnit: this.txtSec,
                    maxValue: 300,
                    minValue: 0,
                    //lock: [_set.slideDeleted, _set.noSlides, _set.disableOnStart, _set.transitLock],
                    dataHint: '1',
                    dataHintDirection: 'top',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.numDuration);

                this.numDelay = new Common.UI.MetricSpinner({
                    el: this.$el.find('#animation-spin-delay'),
                    step: 1,
                    width: 52,
                    value: '',
                    defaultUnit: this.txtSec,
                    maxValue: 300,
                    minValue: 0,
                    //lock: [_set.slideDeleted, _set.noSlides, _set.disableOnStart, _set.transitLock],
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'big'
                });
                this.lockedControls.push(this.numDelay);

                this.cmbStart = new Common.UI.ComboBox({
                    cls: 'input-group-nr',
                    menuStyle: 'width: 150px;',
                    lock: [_set.slideDeleted, _set.paragraphLock, _set.lostConnect, _set.noSlides, _set.noTextSelected, _set.shapeLock],
                    data: [
                        {value: 0, displayValue: this.textStartOnClick},
                        {value: 1, displayValue: this.textStartBeforePrevious},
                        {value: 2, displayValue: this.textStartAfterPrevious}
                    ],
                    dataHint: '1',
                    dataHintDirection: 'top'
                });
                this.lockedControls.push(this.cmbStart);

                this.chRewind = new Common.UI.CheckBox({
                    el: this.$el.find('#animation-checkbox-rewind'),
                    labelText: this.strRewind,
                    //lock: [_set.slideDeleted, _set.noSlides, _set.disableOnStart, _set.transitLock],
                    dataHint: '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chRewind);

                this.numRepeat = new Common.UI.MetricSpinner({
                    el: this.$el.find('#animation-spin-repeat'),
                    step: 1,
                    width: 52,
                    value: '',
                    maxValue: 300,
                    minValue: 0,
                    //lock: [_set.slideDeleted, _set.noSlides, _set.disableOnStart, _set.transitLock],
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'big'
                });

                Common.Utils.lockControls(PE.enumLock.disableOnStart, true, {array: this.lockedControls});

                this.$el.find('#animation-duration').text(this.strDuration);
                this.$el.find('#animation-delay').text(this.strDelay);
                this.$el.find('#animation-label-start').text(this.strStart);
                this.$el.find('#animation-repeat').text(this.strRepeat);
                Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            },

            render: function (el) {
                this.boxSdk = $('#editor_sdk');
                if (el) el.html(this.getPanel());
                return this;
            },

            createParametersMenuItems: function()
            {
                var arrEffectType = [
                    {caption: this.textSmoothly,          value: Asc.c_oAscSlideTransitionParams.Fade_Smoothly},
                    {caption: this.textBlack,             value: Asc.c_oAscSlideTransitionParams.Fade_Through_Black},
                    {caption: this.textLeft,              value: Asc.c_oAscSlideTransitionParams.Param_Left},
                    {caption: this.textTop,               value: Asc.c_oAscSlideTransitionParams.Param_Top},
                    {caption: this.textRight,             value: Asc.c_oAscSlideTransitionParams.Param_Right},
                    {caption: this.textBottom,            value: Asc.c_oAscSlideTransitionParams.Param_Bottom},
                    {caption: this.textTopLeft,           value: Asc.c_oAscSlideTransitionParams.Param_TopLeft},
                    {caption: this.textTopRight,          value: Asc.c_oAscSlideTransitionParams.Param_TopRight},
                    {caption: this.textBottomLeft,         value: Asc.c_oAscSlideTransitionParams.Param_BottomLeft},
                    {caption: this.textBottomRight,        value: Asc.c_oAscSlideTransitionParams.Param_BottomRight},
                    {caption: this.textVerticalIn,         value: Asc.c_oAscSlideTransitionParams.Split_VerticalIn},
                    {caption: this.textVerticalOut,        value: Asc.c_oAscSlideTransitionParams.Split_VerticalOut},
                    {caption: this.textHorizontalIn,       value: Asc.c_oAscSlideTransitionParams.Split_HorizontalIn},
                    {caption: this.textHorizontalOut,      value: Asc.c_oAscSlideTransitionParams.Split_HorizontalOut},
                    {caption: this.textClockwise,          value: Asc.c_oAscSlideTransitionParams.Clock_Clockwise},
                    {caption: this.textCounterclockwise,   value: Asc.c_oAscSlideTransitionParams.Clock_Counterclockwise},
                    {caption: this.textWedge,             value: Asc.c_oAscSlideTransitionParams.Clock_Wedge},
                    {caption: this.textZoomIn,            value: Asc.c_oAscSlideTransitionParams.Zoom_In},
                    {caption: this.textZoomOut,           value: Asc.c_oAscSlideTransitionParams.Zoom_Out},
                    {caption: this.textZoomRotate,         value: Asc.c_oAscSlideTransitionParams.Zoom_AndRotate}
            ];

                var itemsMenu = [];
                _.each(arrEffectType, function (item) {
                    itemsMenu.push({
                            caption: item.caption,
                            value: item.value,
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
                })).then(function() {

                    setEvents.call(me);
                });
            },

            getPanel: function () {
                this.listEffects && this.listEffects.render(this.$el.find('#animation-field-effects'));
                this.btnPreview && this.btnPreview.render(this.$el.find('#animation-button-preview'));
                this.btnParameters && this.btnParameters.render(this.$el.find('#animation-button-parameters'));
                this.btnAnimationPane && this.btnAnimationPane.render(this.$el.find('#animation-button-pane'));
                this.btnAddAnimation && this.btnAddAnimation.render(this.$el.find('#animation-button-add-effect'));
                this.cmbStart && this.cmbStart.render(this.$el.find('#animation-start'))
                this.renderComponent('#animation-spin-duration', this.numDuration);
                this.renderComponent('#animation-spin-delay', this.numDelay);
                this.renderComponent('#animation-spin-repeat', this.numRepeat);
                this.$el.find("#animation-duration").innerText = this.strDuration;
                this.$el.find("#animation-delay").innerText = this.strDelay;
                this.$el.find("#animation-label-start").innerText = this.strStart;
                this.$el.find("#animation-repeat").innerText = this.strRepeat;
                return this.$el;
            },

            renderComponent: function (compid, obj)
            {
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

            setMenuParameters: function (effect, value)
            {
                var minMax = [-1, -1];
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
                }

                var selectedElement;
                _.each(this.btnParameters.menu.items, function (element, index) {
                    if (((index < minMax[0])||(index > minMax[1])))
                        element.setVisible(false);
                    else {
                        element.setVisible(true);

                        if (value != undefined) {
                            if (value == element.value) selectedElement = element;
                        }
                    }
                });

                if (selectedElement == undefined)
                    selectedElement = this.btnParameters.menu.items[minMax[0]];
                
                if (effect != Asc.c_oAscSlideTransitionTypes.None)
                    selectedElement.setChecked(true);

                if (!this.listEffects.isDisabled()) {
                    this.btnParameters.setDisabled(effect === Asc.c_oAscSlideTransitionTypes.None);
                    this.btnPreview.setDisabled(effect === Asc.c_oAscSlideTransitionTypes.None);
                    this.numDuration.setDisabled(effect === Asc.c_oAscSlideTransitionTypes.None);
                }
                return (selectedElement)?selectedElement.value:-1;
            },


            txtSec: 's',
            txtPreview: 'Preview',
            txtParameters: 'Parameters',
            txtAnimationPane: 'Animation Pane',
            txtAddEffect: 'Add animation',
            strDuration: 'Duration',
            strDelay: 'Delay',
            strStart: 'Start',
            strRewind: 'Rewind',
            strRepeat: 'Repeat',

            textStartOnClick: 'On Click',
            textStartBeforePrevious: 'Before Previous',
            textStartAfterPrevious: 'After Previous',

            textNone: 'None',
            textFade: 'Fade',
            textPush: 'Push',
            textWipe: 'Wipe',
            textSplit: 'Split',
            textUnCover: 'UnCover',
            textCover: 'Cover',
            textClock: 'Clock',
            textZoom: 'Zoom',

            textSmoothly: 'Smoothly',
            textBlack: 'Through Black',
            textLeft: 'Left',
            textTop: 'Top',
            textRight: 'Right',
            textBottom: 'Bottom',
            textTopLeft: 'Top-Left',
            textTopRight: 'Top-Right',
            textBottomLeft: 'Bottom-Left',
            textBottomRight: 'Bottom-Right',
            textVerticalIn: 'Vertical In',
            textVerticalOut: 'Vertical Out',
            textHorizontalIn: 'Horizontal In',
            textHorizontalOut: 'Horizontal Out',
            textClockwise: 'Clockwise',
            textCounterclockwise: 'Counterclockwise',
            textWedge: 'Wedge',
            textZoomIn: 'Zoom In',
            textZoomOut: 'Zoom Out',
            textZoomRotate: 'Zoom and Rotate'
        }
    }()), PE.Views.Animation || {}));

    });