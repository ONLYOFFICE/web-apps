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
 *  Animation.js
 *
 *  View
 *
 *  Created on 13.10.21
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
    'common/main/lib/component/Label',
    'common/main/lib/component/Window',
    'common/main/lib/component/ThemeColorPalette'
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
                    var rec = me.listEffects.menuPicker.getSelectedRec();
                    me.fireEvent('animation:additional', [!(rec && rec.get('value') === AscFormat.ANIM_PRESET_NONE)]); // replace effect
                }, me));
            }

            me.btnAddAnimation && me.btnAddAnimation.menu.on('item:click', function (menu, item, e) {
                (item.value=='more') && me.fireEvent('animation:additional', [false]); // add effect
            });

            if (me.btnPreview) {
                me.btnPreview.on('click', _.bind(function(btn) {
                    me.fireEvent('animation:preview', [me.btnPreview]);
                }, me));
                me.btnPreview.menu.on('item:click', _.bind(function(menu, item, e) {
                   if (item.value === 'preview')
                       me.fireEvent('animation:preview', [me.btnPreview]);
                   else if (item.value === 'auto')
                       Common.Utils.InternalSettings.set("pe-animation-no-auto-preview", !item.checked);
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
                    me.fireEvent('animation:parameters', [item.value, item.options.isCustom ? 'custompath' : item.toggleGroup]);
                });
            }

            if (me.btnAnimationPane) {
                me.btnAnimationPane.on('click', _.bind(function(btn) {
                    me.fireEvent('animation:animationpane', [me.btnAnimationPane]);
                }, me));
            }

            if (me.cmbDuration) {
                me.cmbDuration.on('changed:before', function (combo, record, e) {
                    me.fireEvent('animation:durationchange', [true, combo, record, e]);
                }, me);
                me.cmbDuration.on('changed:after', function (combo, record, e) {
                    me.fireEvent('animation:durationchange', [false, combo, record, e]);
                }, me);
                me.cmbDuration.on('selected', function (combo, record) {
                    me.fireEvent('animation:durationselected', [combo, record]);
                }, me);
                me.cmbDuration.on('show:after', function (combo, e, params) {
                    me.fireEvent('animation:durationfocusin', [true, combo, e, params]);
                }, me);
                me.cmbDuration.on('combo:focusin', function (combo) {
                    me.fireEvent('animation:durationfocusin', [false, combo]);
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

            if (me.cmbRepeat) {
                me.cmbRepeat.on('changed:before', function (combo, record, e) {
                    me.fireEvent('animation:repeatchange', [true, combo, record, e]);
                }, me);
                me.cmbRepeat.on('changed:after', function (combo, record, e) {
                    me.fireEvent('animation:repeatchange', [false, combo, record, e]);
                }, me);
                me.cmbRepeat.on('selected', function (combo, record) {
                    me.fireEvent('animation:repeatselected', [combo, record]);
                }, me);
                me.cmbRepeat.on('show:after', function (combo, e, params) {
                    me.fireEvent('animation:repeatfocusin', [true, combo, e, params]);
                }, me);
                me.cmbRepeat.on('combo:focusin', function (combo) {
                    me.fireEvent('animation:repeatfocusin', [false, combo]);
                }, me);
            }

            if (me.chRewind) {
                me.chRewind.on('change', _.bind(function (e) {
                    me.fireEvent('animation:checkrewind', [me.chRewind, me.chRewind.value, me.chRewind.lastValue]);
                }, me));
            }

            me.btnMoveEarlier && me.btnMoveEarlier.on('click', _.bind(function(btn) {
                me.fireEvent('animation:moveearlier', [me.btnMoveEarlier]);
            }, me));

            me.btnMoveLater && me.btnMoveLater.on('click', _.bind(function(btn) {
                me.fireEvent('animation:movelater', [me.btnMoveLater]);
            }, me));

        }

        return {
            // el: '#transitions-panel',

            options: {},

            initialize: function (options) {

                this.triggers= {
                    ClickSequence:  0,
                    ClickOf:        1
                };
                this.startIndexParam = 2;
                this.allEffects = [{group:'none', value: AscFormat.ANIM_PRESET_NONE, iconCls: 'animation-none', displayValue: this.textNone}].concat(Common.define.effectData.getEffectFullData());
                Common.UI.BaseView.prototype.initialize.call(this, options);
                this.toolbar = options.toolbar;
                this.appConfig = options.mode;
                this.$el = this.toolbar.toolbar.$el.find('#animation-panel');
                var me = this;
                var _set = Common.enumLock;
                this.lockedControls = [];
                this._arrEffectName = [{group:'none', value: AscFormat.ANIM_PRESET_NONE, iconCls: 'animation-none', displayValue: this.textNone}].concat(Common.define.effectData.getEffectData());
                _.forEach(this._arrEffectName,function (elm){
                    elm.tip = elm.displayValue;
                });
                this._arrEffectOptions = [];
                var itemWidth = 88,
                    itemHeight = 40;
                this.listEffectsMore = new Common.UI.MenuItem({
                    caption: this.textMoreEffects
                });
                this.listEffects = new Common.UI.ComboDataView({
                    cls: 'combo-transitions combo-animation',
                    itemWidth: itemWidth,
                    itemHeight: itemHeight,
                    style: 'min-width:200px;',
                    autoWidth:       true,
                    itemTemplate: _.template([
                        '<div  class = "btn_item x-huge" id = "<%= id %>" style = "width: ' + itemWidth + 'px;height: ' + itemHeight + 'px;">',
                            '<div class = "icon toolbar__icon <%= iconCls %>"></div>',
                            '<div class = "caption"><%= displayValue %></div>',
                        '</div>'
                    ].join('')),
                    groups: new Common.UI.DataViewGroupStore([{id: 'none', value: -10, caption: this.textNone}].concat(Common.define.effectData.getEffectGroupData())),
                    store: new Common.UI.DataViewStore(this._arrEffectName),
                    additionalMenuItems: [{caption: '--'}, this.listEffectsMore],
                    enableKeyEvents: true,
                    lock: [_set.slideDeleted, _set.noSlides, _set.noGraphic, _set.timingLock],
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

                this.btnPreview = new Common.UI.Button({
                    cls: 'btn-toolbar   x-huge  icon-top', // x-huge icon-top',
                    caption: this.txtPreview,
                    split: true,
                    menu: true,
                    iconCls: 'toolbar__icon btn-animation-preview-start',
                    lock: [_set.slideDeleted, _set.noSlides, _set.noAnimationPreview, _set.timingLock],
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.btnPreview);

                this.btnParameters = new Common.UI.Button({
                    cls: 'btn-toolbar  x-huge icon-top',
                    caption: this.txtParameters,
                    iconCls: 'toolbar__icon icon btn-animation-parameters',
                    menu: true,
                    lock: [_set.slideDeleted, _set.noSlides, _set.noGraphic, _set.noAnimation, _set.noAnimationParam, _set.timingLock],
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.btnParameters);

                this.btnAnimationPane = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    caption: this.txtAnimationPane,
                    iconCls: 'toolbar__icon icon btn-animation-panel',
                    lock: [_set.slideDeleted, _set.noSlides, _set.timingLock],
                    enableToggle: true,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.btnAnimationPane);

                this.btnAddAnimation = new Common.UI.Button({
                    cls: 'btn-toolbar  x-huge  icon-top',
                    caption: this.txtAddEffect,
                    iconCls: 'toolbar__icon icon btn-add-animation',
                    menu: true,
                    lock: [_set.slideDeleted, _set.noSlides, _set.noGraphic, _set.timingLock],
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });

                this.lockedControls.push(this.btnAddAnimation);

                this.cmbDuration = new Common.UI.ComboBoxCustom({
                    el: this.$el.find('#animation-spin-duration'),
                    cls: 'input-group-nr',
                    menuStyle: 'min-width: 100%;',
                    editable: true,
                    data: [
                        {value: 20, displayValue: this.str20},
                        {value: 5, displayValue: this.str5},
                        {value: 3, displayValue: this.str3},
                        {value: 2, displayValue: this.str2},
                        {value: 1, displayValue: this.str1},
                        {value: 0.5, displayValue: this.str0_5}
                    ],
                    lock: [_set.slideDeleted, _set.noSlides, _set.noGraphic, _set.noAnimation, _set.noAnimationDuration, _set.timingLock],
                    dataHint: '1',
                    dataHintDirection: 'top',
                    dataHintOffset: 'small',
                    updateFormControl: function(record) {
                        record && this.setRawValue(record.get('value') + ' ' + me.txtSec);
                    }
                });
                this.lockedControls.push(this.cmbDuration);

                this.lblDuration = new Common.UI.Label({
                    el: this.$el.find('#animation-duration'),
                    iconCls: 'toolbar__icon btn-animation-duration',
                    caption: this.strDuration,
                    lock: [_set.slideDeleted, _set.noSlides, _set.noGraphic, _set.noAnimation, _set.noAnimationDuration, _set.timingLock]
                });
                this.lockedControls.push(this.lblDuration);

                this.cmbTrigger = new Common.UI.Button({
                    parentEl: $('#animation-trigger'),
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-trigger',
                    caption: this.strTrigger,
                    lock: [_set.slideDeleted, _set.noSlides, _set.noGraphic, _set.noAnimation, _set.noTriggerObjects, _set.timingLock],
                    menu        : new Common.UI.Menu({
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
                                    menuAlign: 'tl-tr',
                                    items: []
                                })
                            }]
                    }),
                    dataHint: '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'medium'
                });
                this.lockedControls.push(this.cmbTrigger);
                this.btnClickOf = this.cmbTrigger.menu.items[1];

                this.numDelay = new Common.UI.MetricSpinner({
                    el: this.$el.find('#animation-spin-delay'),
                    step: 1,
                    width: 55,
                    value: '',
                    defaultUnit: this.txtSec,
                    maxValue: 60,
                    minValue: 0,
                    lock: [_set.slideDeleted, _set.noSlides, _set.noGraphic, _set.noAnimation, _set.timingLock],
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'big'
                });
                this.lockedControls.push(this.numDelay);

                this.lblDelay = new Common.UI.Label({
                    el: this.$el.find('#animation-delay'),
                    iconCls: 'toolbar__icon btn-animation-delay',
                    caption: this.strDelay,
                    lock: [_set.slideDeleted, _set.noSlides, _set.noGraphic, _set.noAnimation, _set.timingLock]
                });
                this.lockedControls.push(this.lblDelay);

                this.cmbStart = new Common.UI.ComboBox({
                    cls: 'input-group-nr',
                    menuStyle: 'min-width: 100%;',
                    editable: false,
                    lock: [_set.slideDeleted,  _set.noSlides, _set.noGraphic, _set.noAnimation, _set.timingLock],
                    data: [
                        {value: AscFormat.NODE_TYPE_CLICKEFFECT, displayValue: this.textStartOnClick},
                        {value: AscFormat.NODE_TYPE_WITHEFFECT, displayValue: this.textStartWithPrevious},
                        {value: AscFormat.NODE_TYPE_AFTEREFFECT, displayValue: this.textStartAfterPrevious}
                    ],
                    dataHint: '1',
                    dataHintDirection: 'top',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.cmbStart);

                this.lblStart = new Common.UI.Label({
                    el: this.$el.find('#animation-label-start'),
                    iconCls: 'toolbar__icon btn-play',
                    caption: this.strStart,
                    lock: [_set.slideDeleted, _set.noSlides, _set.noGraphic, _set.noAnimation, _set.timingLock]
                });
                this.lockedControls.push(this.lblStart);

                this.chRewind = new Common.UI.CheckBox({
                    el: this.$el.find('#animation-checkbox-rewind'),
                    labelText: this.strRewind,
                    lock: [_set.slideDeleted, _set.noSlides, _set.noGraphic, _set.noAnimation, _set.timingLock],
                    dataHint: '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chRewind);

                this.cmbRepeat = new Common.UI.ComboBox({
                    el: this.$el.find('#animation-spin-repeat'),
                    cls: 'input-group-nr',
                    menuStyle: 'min-width: 100%;',
                    editable: true,
                    lock: [_set.slideDeleted, _set.noSlides, _set.noGraphic, _set.noAnimation, _set.noAnimationRepeat, _set.timingLock],
                    data: [
                        {value: 1, displayValue: this.textNoRepeat},
                        {value: 2, displayValue: "2"},
                        {value: 3, displayValue: "3"},
                        {value: 4, displayValue: "4"},
                        {value: 5, displayValue: "5"},
                        {value: 10, displayValue: "10"},
                        {value: AscFormat.untilNextClick, displayValue: this.textUntilNextClick},
                        {value: AscFormat.untilNextSlide, displayValue: this.textUntilEndOfSlide}
                    ],
                    dataHint: '1',
                    dataHintDirection: 'top',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.cmbRepeat);

                this.lblRepeat = new Common.UI.Label({
                    el: this.$el.find('#animation-repeat'),
                    iconCls: 'toolbar__icon btn-animation-repeat',
                    caption: this.strRepeat,
                    lock: [_set.slideDeleted, _set.noSlides, _set.noGraphic, _set.noAnimation, _set.noAnimationRepeat, _set.timingLock]
                });
                this.lockedControls.push(this.lblRepeat);

                this.btnMoveEarlier = new Common.UI.Button({
                    parentEl: $('#animation-moveearlier'),
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-arrow-up',
                    style: 'min-width: 82px',
                    caption: this.textMoveEarlier,
                    lock: [_set.slideDeleted, _set.noSlides, _set.noGraphic, _set.noAnimation, _set.noTriggerObjects, _set.noMoveAnimationEarlier, _set.timingLock],
                    dataHint: '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'medium'
                });
                this.lockedControls.push(this.btnMoveEarlier);

                this.btnMoveLater = new Common.UI.Button({
                    parentEl: $('#animation-movelater'),
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-arrow-down',
                    style: 'min-width: 82px',
                    caption: this.textMoveLater,
                    lock: [_set.slideDeleted, _set.noSlides, _set.noGraphic, _set.noAnimation, _set.noTriggerObjects, _set.noMoveAnimationLater, _set.timingLock],
                    dataHint: '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'medium'
                });
                this.lockedControls.push(this.btnMoveLater);

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
                    me.btnPreview.updateHint(me.txtPreview);
                    me.btnParameters.updateHint(me.txtParameters);
                    me.btnAnimationPane.updateHint(me.txtAnimationPane);
                    me.btnAddAnimation.updateHint(me.txtAddEffect);
                    me.cmbTrigger.updateHint(me.strTrigger);
                    me.btnMoveEarlier.updateHint(me.textMoveEarlier);
                    me.btnMoveLater.updateHint(me.textMoveLater);

                    me.btnAddAnimation.setMenu( new Common.UI.Menu({
                        style: 'width: 375px;padding-top: 12px;',
                        items: [
                            {template: _.template('<div id="id-toolbar-menu-addanimation" class="menu-animation"></div>')},
                            {caption: '--'},
                            {
                                caption: me.textMoreEffects,
                                value: 'more'
                            }
                        ]
                    }));

                    var itemWidth = 88,
                        itemHeight = 40;
                    var onShowBefore = function(menu) {
                        var picker = new Common.UI.DataView({
                            el: $('#id-toolbar-menu-addanimation'),
                            parentMenu: menu,
                            outerMenu:  {menu: me.btnAddAnimation.menu, index: 0},
                            showLast: false,
                            restoreHeight: 300,
                            style: 'max-height: 300px;',
                            scrollAlwaysVisible: true,
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
                        menu.on('show:after', function () {
                            me.fireEvent('animation:addeffectshow', [picker]);
                        });
                        me.btnAddAnimation.menu.setInnerMenu([{menu: picker, index: 0}]);
                    };
                    me.btnAddAnimation.menu.on('show:before', onShowBefore);
                    me.btnParameters.setMenu( new Common.UI.Menu({items: [
                            {
                                toggleGroup: 'themecolor',
                                template: _.template('<div id="id-toolbar-menu-parameters-color" style="width: 164px; display: inline-block;"></div>')},
                            {caption: '--'}
                        ]}));
                    var onShowBeforeParameters = function(menu) {
                        var picker = new Common.UI.ThemeColorPalette({
                            el: $('#id-toolbar-menu-parameters-color'),
                            outerMenu: {menu: me.btnParameters.menu, index: 0}
                        });
                        menu.off('show:before', onShowBeforeParameters);
                        me.btnParameters.menu.setInnerMenu([{menu: picker, index: 0}]);
                        me.colorPickerParameters = picker;
                        me.updateColors();
                        me.setColor();
                        menu.on('show:after', function() {
                            (me.isColor && picker) && _.delay(function() {
                                picker.focus();
                            }, 10);
                        });

                        picker.on('select', function (picker, item){
                            var color = item && item.color ? item.color : item;
                            me.fireEvent('animation:parameterscolor',[Common.Utils.ThemeColor.getRgbColor(color)]);
                        });
                    };
                    me.btnParameters.menu.on('show:before', onShowBeforeParameters);

                    me.btnPreview.setMenu( new Common.UI.Menu({
                        style: "min-width: auto;",
                        items: [
                            {caption: me.txtPreview, value: 'preview'},
                            {caption: me.textAutoPreview, value: 'auto', checkable: true, checked: !Common.Utils.InternalSettings.get("pe-animation-no-auto-preview")}
                        ]
                    }));

                    setEvents.call(me);
                });
            },

            getPanel: function () {
                this.listEffects && this.listEffects.render(this.$el.find('#animation-field-effects'));
                this.btnPreview && this.btnPreview.render(this.$el.find('#animation-button-preview'));
                this.btnParameters && this.btnParameters.render(this.$el.find('#animation-button-parameters'));
                this.btnAnimationPane && this.btnAnimationPane.render(this.$el.find('#animation-button-pane'));
                this.btnAddAnimation && this.btnAddAnimation.render(this.$el.find('#animation-button-add-effect'));
                this.cmbStart && this.cmbStart.render(this.$el.find('#animation-start'));
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
                return this.lockedControls;
            },

            setMenuParameters: function (effectId, effectGroup, option) // option = undefined - for add new effect or when selected 2 equal effects with different option (subtype)
            {
                var arrEffectOptions,selectedElement;
                var effect = _.findWhere(this.allEffects, {group: effectGroup, value: effectId}),
                    updateFamilyEffect = true;
                if (effect) {
                    arrEffectOptions = Common.define.effectData.getEffectOptionsData(effect.group, effect.value);
                    updateFamilyEffect = this._familyEffect !== effect.familyEffect || !this._familyEffect; // family of effects are different or both of them = undefined (null)
                    this.isColor = effect.color;
                }
                if((this._effectId != effectId && updateFamilyEffect) || (this._groupName != effectGroup)) {
                    this.btnParameters.menu.removeItems(this.startIndexParam,this.btnParameters.menu.items.length-this.startIndexParam);
                }
                if (arrEffectOptions){
                    if (this.btnParameters.menu.items.length == this.startIndexParam) {
                        if (effectGroup==='menu-effect-group-path' && effectId===AscFormat.MOTION_CUSTOM_PATH) {
                            arrEffectOptions.forEach(function (opt, index) {
                                this.btnParameters.menu.addItem(opt);
                                (opt.value == option || option===undefined && !!opt.defvalue) && (selectedElement = this.btnParameters.menu.items[index + this.startIndexParam]);
                            }, this);
                        } else {
                            arrEffectOptions.forEach(function (opt, index) {
                                opt.checkable = true;
                                opt.toggleGroup = 'animateeffects';
                                this.btnParameters.menu.addItem(opt);
                                (opt.value == option || option===undefined && !!opt.defvalue) && (selectedElement = this.btnParameters.menu.items[index + this.startIndexParam]);
                            }, this);
                        }
                        (effect && effect.familyEffect) && this.btnParameters.menu.addItem({caption: '--'});
                    } else {
                        this.btnParameters.menu.clearAll();
                        this.btnParameters.menu.items.forEach(function (opt) {
                            if((opt.toggleGroup == 'animateeffects' || effectGroup==='menu-effect-group-path' && effectId===AscFormat.MOTION_CUSTOM_PATH) && (opt.value == option || option===undefined && !!opt.options.defvalue))
                                selectedElement = opt;
                        },this);
                    }
                    !(effectGroup==='menu-effect-group-path' && effectId===AscFormat.MOTION_CUSTOM_PATH) && selectedElement && selectedElement.setChecked(true);
                }
                if (effect && effect.familyEffect){
                    if (this._familyEffect != effect.familyEffect) {
                        var effectsArray = Common.define.effectData.getSimilarEffectsArray(effect.familyEffect);
                        effectsArray.forEach(function (opt) {
                            opt.checkable = true;
                            opt.toggleGroup = 'animatesimilareffects';
                            this.btnParameters.menu.addItem(opt);
                            (opt.value == effectId) && this.btnParameters.menu.items[this.btnParameters.menu.items.length - 1].setChecked(true);
                        }, this);
                    }
                    else {
                        this.btnParameters.menu.items.forEach(function (opt) {
                            if(opt.toggleGroup == 'animatesimilareffects' && opt.value == effectId)
                                opt.setChecked(true);
                        });
                    }
                }

                if(this.isColor) {
                    this.btnParameters.menu.items[0].show();
                    this.btnParameters.menu.items.length > this.startIndexParam && this.btnParameters.menu.items[1].show();
                }
                else {
                    this.btnParameters.menu.items[0].hide();
                    this.btnParameters.menu.items[1].hide();
                }

                this._effectId = effectId;
                this._groupName = effectGroup;
                this._familyEffect = effect ? effect.familyEffect : undefined;
                return selectedElement ? selectedElement.value : undefined;
            },

            setColor: function (color){
               this._effectColor = (color) ? Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()).toUpperCase(): this._effectColor;
            (!!this.colorPickerParameters && this._effectColor)  && this.colorPickerParameters.selectByRGB(this._effectColor, true);

            },

            updateColors: function (){
                this.colorPickerParameters && this.colorPickerParameters.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
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
            textMultiple: 'Multiple',
            textMoreEffects: 'Show More Effects',
            textMoveEarlier: 'Move Earlier',
            textMoveLater:  'Move Later',
            textNoRepeat: '(none)',
            textUntilNextClick: 'Until Next Click',
            textUntilEndOfSlide: 'Until End of Slide',
            str20: '20 s (Extremely Slow)',
            str5: '5 s (Very Slow)',
            str3: '3 s (Slow)',
            str2: '2 s (Medium)',
            str1: '1 s (Fast)',
            str0_5: '0.5 s (Very Fast)',
            textAutoPreview: 'AutoPreview'
        }
    }()), PE.Views.Animation || {}));

});