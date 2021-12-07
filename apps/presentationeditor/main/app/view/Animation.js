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
                me.listEffectsMore.on('click', _.bind(function () {
                    me.fireEvent('animation:additional');
                }, me));
            }

            if (me.btnPreview) {
                me.btnPreview.on('click', _.bind(function(btn) {
                    me.fireEvent('animation:preview', [me.btnPreview]);
                }, me));
            }

            if(me.cmbTrigger)
            {
                me.cmbTrigger.menu.on('item:click', _.bind(function(menu, item, e) {
                    me.fireEvent('animation:trigger', [item]);
                }, me));
                me.btnClickOf.menu.on('item:click', _.bind(function(menu, item, e) {
                    me.fireEvent('animation:triggerclickof', [item]);
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
                });
            }

            if (me.numRepeat) {
                me.numRepeat.on('change', function(bth) {
                    me.fireEvent('animation:repeat', [me.numRepeat]);
                }, me);
            }

            if (me.chRewind) {
                me.chRewind.on('change', _.bind(function (e) {
                    me.fireEvent('animation:checkrewind', [me.chRewind, me.chRewind.value, me.chRewind.lastValue]);
                }, me));
            }

        }

        return {
            // el: '#transitions-panel',

            options: {},

            initialize: function (options) {

                this.triggers= {
                    ClickSequence:  0,
                    ClickOf:        1
                }

                Common.UI.BaseView.prototype.initialize.call(this, options);
                this.toolbar = options.toolbar;
                this.appConfig = options.mode;
                this.$el = this.toolbar.toolbar.$el.find('#animation-panel');
                var _set = PE.enumLock;
                this.lockedControls = [];

                this._arrEffectName = [{group:'none', value: AscFormat.ANIM_PRESET_NONE, iconCls: 'transition-none', displayValue: this.textNone}].concat(Common.define.effectData.getEffectData());
                this._arrEffectOptions = [];
                var itemWidth = 87,
                    itemHeight = 40;
                this.listEffectsMore = new Common.UI.MenuItem({
                    caption: this.textMoreEffects
                });
                this.listEffects = new Common.UI.ComboDataView({
                    cls: 'combo-transitions combo-animation',
                    itemWidth: itemWidth,
                    itemHeight: itemHeight,
                    itemTemplate: _.template([
                        '<div  class = "btn_item x-huge" id = "<%= id %>" style = "width: ' + itemWidth + 'px;height: ' + itemHeight + 'px;">',
                            '<div class = "icon toolbar__icon <%= iconCls %>"></div>',
                            '<div class = "caption"><%= displayValue %></div>',
                        '</div>'
                    ].join('')),
                    groups: new Common.UI.DataViewGroupStore([{id: 'none', value: -10, caption: this.textNone}].concat(Common.define.effectData.getEffectGroupData())),
                    store: new Common.UI.DataViewStore(this._arrEffectName),
                    enableKeyEvents: true,
                    lock: [_set.slideDeleted, _set.noSlides, _set.disableOnStart],
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

                this.btnPreview = new Common.UI.Button({
                    cls: 'btn-toolbar', // x-huge icon-top',
                    caption: this.txtPreview,
                    split: false,
                    iconCls: 'toolbar__icon preview-transitions',
                    lock: [_set.slideDeleted, _set.noSlides],
                    dataHint: '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'medium'
                });
                this.lockedControls.push(this.btnPreview);

                this.btnParameters = new Common.UI.Button({
                    cls: 'btn-toolbar  x-huge icon-top',
                    caption: this.txtParameters,
                    iconCls: 'toolbar__icon icon transition-none',
                    menu: new Common.UI.Menu({items: []}),
                    lock: [_set.slideDeleted, _set.noSlides, _set.disableOnStart],
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
                    lock: [_set.slideDeleted, _set.noSlides, _set.disableOnStart],
                    dataHint: '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'medium'
                });
                this.lockedControls.push(this.btnAnimationPane);

                this.btnAddAnimation = new Common.UI.Button({
                    cls: 'btn-toolbar  x-huge  icon-top',
                    caption: this.txtAddEffect,
                    iconCls: 'toolbar__icon icon btn-addslide',
                    menu: true,
                    lock: [_set.slideDeleted, _set.noSlides, _set.disableOnStart],
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
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
                    lock: [_set.slideDeleted, _set.noSlides, _set.disableOnStart],
                    dataHint: '1',
                    dataHintDirection: 'top',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.numDuration);

                this.cmbTrigger = new Common.UI.Button({
                        parentEl: $('#animation-trigger'),
                        cls: 'btn-text-split-default',
                        split: true,
                        width: 82,
                        menu        : new Common.UI.Menu({
                            style       : 'min-width: 150px;',
                            items: [
                                {
                                    caption: this.textOnClickSequence,
                                    checkable: true,
                                    toggleGroup: 'animtrigger',
                                    value: this.triggers.ClickSequence
                                },
                                {
                                    value: this.triggers.ClickOf,
                                    caption:  this.textOnClickOf,
                                    menu: new Common.UI.Menu({
                                        menuAlign: 'tr-br',
                                        items: []
                                    })
                                }]
                        }),
                        dataHint: '1',
                        dataHintDirection: 'bottom',
                        dataHintOffset: 'big'
                    });
                this.lockedControls.push(this.cmbTrigger);
                this.btnClickOf = this.cmbTrigger.menu.items[1];

                this.numDelay = new Common.UI.MetricSpinner({
                    el: this.$el.find('#animation-spin-delay'),
                    step: 1,
                    width: 52,
                    value: '',
                    defaultUnit: this.txtSec,
                    maxValue: 300,
                    minValue: 0,
                    lock: [_set.slideDeleted, _set.noSlides, _set.disableOnStart],
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'big'
                });
                this.lockedControls.push(this.numDelay);

                this.cmbStart = new Common.UI.ComboBox({
                    cls: 'input-group-nr',
                    menuStyle: 'width: 150px;',
                    lock: [_set.slideDeleted,  _set.noSlides, _set.disableOnStart],
                    data: [
                        {value: AscFormat.NODE_TYPE_CLICKEFFECT, displayValue: this.textStartOnClick},
                        {value: AscFormat.NODE_TYPE_WITHEFFECT, displayValue: this.textStartWithPrevious},
                        {value: AscFormat.NODE_TYPE_AFTEREFFECT, displayValue: this.textStartAfterPrevious}
                    ],
                    dataHint: '1',
                    dataHintDirection: 'top'
                });
                this.lockedControls.push(this.cmbStart);

                this.chRewind = new Common.UI.CheckBox({
                    el: this.$el.find('#animation-checkbox-rewind'),
                    labelText: this.strRewind,
                    lock: [_set.slideDeleted, _set.noSlides, _set.disableOnStart],
                    dataHint: '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chRewind);

                this.numRepeat = new Common.UI.MetricSpinner({
                    el: this.$el.find('#animation-spin-repeat'),
                    step: 1,
                    width: 88,
                    value: '',
                    maxValue: 1000,
                    minValue: 0,
                    defaultUnit: '',
                    lock: [_set.slideDeleted, _set.noSlides, _set.disableOnStart],
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'big'
                });
                this.lockedControls.push(this.numRepeat);

                Common.Utils.lockControls(PE.enumLock.disableOnStart, true, {array: this.lockedControls});

                this.$el.find('#animation-duration').text(this.strDuration);
                this.$el.find('#animation-delay').text(this.strDelay);
                this.$el.find('#animation-label-start').text(this.strStart);
                this.$el.find('#animation-repeat').text(this.strRepeat);
                this.$el.find('#animation-label-trigger').text(this.strTrigger);
                Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            },

            render: function (el) {
                this.boxSdk = $('#editor_sdk');
                if (el) el.html(this.getPanel());
                return this;
            },

            onAppReady: function (config) {
                var me = this;
                (new Promise(function (accept, reject) {
                    accept();
                })).then(function() {
                    setEvents.call(me);

                    me.btnAddAnimation.setMenu( new Common.UI.Menu({
                        style: 'width: 370px;padding-top: 12px;',
                        items: [
                            {template: _.template('<div id="id-toolbar-menu-addanimation" class="menu-animation"></div>')}
                        ]
                    }));

                    var itemWidth = 87,
                        itemHeight = 40;
                    var onShowBefore = function(menu) {
                        var picker = new Common.UI.DataView({
                            el: $('#id-toolbar-menu-addanimation'),
                            parentMenu: menu,
                            showLast: false,
                            restoreHeight: 465,
                            groups: new Common.UI.DataViewGroupStore(Common.define.effectData.getEffectGroupData()),
                            store: new Common.UI.DataViewStore(Common.define.effectData.getEffectData()),
                            itemTemplate: _.template([
                                '<div  class = "btn_item x-huge" id = "<%= id %>" style = "width: ' + itemWidth + 'px;height: ' + itemHeight + 'px;">',
                                    '<div class = "icon toolbar__icon <%= iconCls %>"></div>',
                                    '<div class = "caption"><%= displayValue %></div>',
                                '</div>'
                            ].join(''))
                        });
                        picker.on('item:click', function (picker, item, record, e) {
                            if (record)
                                me.fireEvent('animation:addanimation', [picker, record]);
                        });
                        menu.off('show:before', onShowBefore);
                    };
                    me.btnAddAnimation.menu.on('show:before', onShowBefore);
                });
            },

            getPanel: function () {
                this.listEffects && this.listEffects.render(this.$el.find('#animation-field-effects'));
                this.btnPreview && this.btnPreview.render(this.$el.find('#animation-button-preview'));
                this.btnParameters && this.btnParameters.render(this.$el.find('#animation-button-parameters'));
                this.btnAnimationPane && this.btnAnimationPane.render(this.$el.find('#animation-button-pane'));
                this.btnAddAnimation && this.btnAddAnimation.render(this.$el.find('#animation-button-add-effect'));
                this.cmbStart && this.cmbStart.render(this.$el.find('#animation-start'));
                //this.cmbTrigger && this.cmbTrigger.render(this.$el.find('#animation-trigger'));
                this.renderComponent('#animation-spin-duration', this.numDuration);
                this.renderComponent('#animation-spin-delay', this.numDelay);
                this.renderComponent('#animation-spin-repeat', this.numRepeat);
                this.$el.find("#animation-duration").innerText = this.strDuration;
                this.$el.find("#animation-delay").innerText = this.strDelay;
                this.$el.find("#animation-label-start").innerText = this.strStart;
                this.$el.find("#animation-label-trigger").innerText = this.strTrigger;
                this.$el.find("#animation-repeat").innerText = this.strRepeat;
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

            setMenuParameters: function (effectId, option)
            {
                var effect = this.listEffects.store.findWhere({value: effectId});
                var arrEffectOptions = Common.define.effectData.getEffectOptionsData(effect.get('group'), effect.get('value'));
                if (!this.listEffects.isDisabled()) {
                    this.btnParameters.setDisabled(!arrEffectOptions);
                }

                if(!arrEffectOptions) {
                    this.btnParameters.menu.removeAll();
                    this._effectId = effectId
                    return undefined;
                }
                var selectedElement;
                if (this._effectId != effectId) {
                    this.btnParameters.menu.removeAll();
                    arrEffectOptions.forEach(function (opt, index) {
                        opt.checkable = true;
                        opt.toggleGroup ='animateeffects';
                        this.btnParameters.menu.addItem(opt);
                        (opt.value==option) && (selectedElement = this.btnParameters.menu.items[index]);
                    }, this);
                }
                else {
                    this.btnParameters.menu.items.forEach(function (opt) {
                        (opt.value == option) && (selectedElement = opt);
                    });
                }
                (selectedElement == undefined) && (selectedElement = this.btnParameters.menu.items[0])
                selectedElement.setChecked(true);
                this._effectId = effectId;
                return selectedElement.value;
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
            strTrigger: 'Trigger',
            textStartOnClick: 'On Click',
            textStartWithPrevious: 'With Previous',
            textStartAfterPrevious: 'After Previous',
            textOnClickSequence: 'On Click Sequence',
            textOnClickOf: 'On Click of',
            textNone: 'None',
            textMoreEffects: 'Show More Effects'
        }
    }()), PE.Views.Animation || {}));

});