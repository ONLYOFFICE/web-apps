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
 *  Created on 13.10.21
 *
 */

define([
    'core',
    'jquery',
    'underscore',
    'backbone',
    'presentationeditor/main/app/view/Animation',
], function () {
    'use strict';

    PE.Controllers.Animation = Backbone.Controller.extend(_.extend({
        models : [],
        collections : [],
        views : [
            'PE.Views.Animation'
        ],
        options: {
            alias: 'Animation'
        },
        sdkViewName : '#id_main',

        initialize: function () {

            this.addListeners({
                'PE.Views.Animation': {
                    'animation:preview':            _.bind(this.onPreviewClick, this),
                    'animation:parameters':         _.bind(this.onParameterClick, this),
                    'animation:parameterscolor':    _.bind(this.onSelectColor, this),
                    'animation:selecteffect':       _.bind(this.onEffectSelect, this),
                    'animation:delay':              _.bind(this.onDelayChange, this),
                    'animation:animationpane':      _.bind(this.onAnimationPane, this),
                    'animation:addanimation':       _.bind(this.onAddAnimation, this),
                    'animation:startselect':        _.bind(this.onStartSelect, this),
                    'animation:checkrewind':        _.bind(this.onCheckRewindChange,this),
                    'animation:additional':         _.bind(this.onAnimationAdditional, this),
                    'animation:trigger':            _.bind(this.onTriggerClick, this),
                    'animation:triggerclickof':     _.bind(this.onTriggerClickOfClick, this),
                    'animation:moveearlier':        _.bind(this.onMoveEarlier, this),
                    'animation:movelater':          _.bind(this.onMoveLater, this),
                    'animation:repeatchange':       _.bind(this.onRepeatChange, this),
                    'animation:repeatfocusin':      _.bind(this.onRepeatComboOpen, this),
                    'animation:repeatselected':     _.bind(this.onRepeatSelected, this),
                    'animation:durationchange':     _.bind(this.onDurationChange, this),
                    'animation:durationfocusin':    _.bind(this.onRepeatComboOpen, this),
                    'animation:durationselected':   _.bind(this.onDurationSelected, this),
                    'animation:addeffectshow':      _.bind(this.onAddEffectShow, this)

                },
                'Toolbar': {
                    'tab:active':               _.bind(this.onActiveTab, this)
                }
            });
        },

        onLaunch: function () {
            this._state = {};
         },

        setConfig: function (config) {
            this.appConfig = config.mode;
            this.EffectGroups = Common.define.effectData.getEffectGroupData();
            this.view = this.createView('PE.Views.Animation', {
                toolbar : config.toolbar,
                mode    : config.mode
            });
            return this;
        }, 

        setApi: function (api) {
            this.api = api;
            this.api.asc_registerCallback('asc_onFocusObject',          _.bind(this.onFocusObject, this));
            this.api.asc_registerCallback('asc_onCountPages',           _.bind(this.onApiCountPages, this));
            this.api.asc_registerCallback('asc_onAnimPreviewStarted',   _.bind(this.onAnimPreviewStarted, this));
            this.api.asc_registerCallback('asc_onAnimPreviewFinished',  _.bind(this.onAnimPreviewFinished, this));
            this.api.asc_onShowAnimTab(!!this._state.onactivetab)
            this.api.asc_registerCallback('asc_onCloseAnimPane',        _.bind(this.onApiCloseAnimPane, this));

            Common.NotificationCenter.on('animpane:close',              _.bind(this.onCloseAnimPane, this));
            return this;
        },

        onApiCountPages: function (count) {
            if (this._state.no_slides !== (count<=0)) {
                this._state.no_slides = (count<=0);
                this.lockToolbar(Common.enumLock.noSlides, this._state.no_slides);
            }
        },

        createToolbarPanel: function() {
            return this.view.getPanel();
        }, 

        getView: function(name) {
            return !name && this.view ?
                this.view : Backbone.Controller.prototype.getView.call(this, name);
        },

        onPreviewClick: function() {
            if (this._state.playPreview)
                this.api.asc_StopAnimationPreview();
            else
                this.api.asc_StartAnimationPreview();

        },

        onAnimPreviewStarted: function () {

            this._state.playPreview = true;
            this.view.btnPreview.setIconCls('toolbar__icon btn-animation-preview-stop');
        },
        onAnimPreviewFinished: function ()
        {
            this._state.playPreview = false;
            this.view.btnPreview.setIconCls('toolbar__icon btn-animation-preview-start');
        },

        onParameterClick: function (value, toggleGroup) {
            if(this.api && this.AnimationProperties) {
                if(toggleGroup == 'animateeffects') {
                    this.AnimationProperties.asc_putSubtype(value);
                    this.api.asc_SetAnimationProperties(this.AnimationProperties);
                }
                else if(toggleGroup == 'custompath') {
                    var groupName = _.findWhere(this.EffectGroups, {value: AscFormat.PRESET_CLASS_PATH}).id;
                    this.addNewEffect(AscFormat.MOTION_CUSTOM_PATH, AscFormat.PRESET_CLASS_PATH, groupName,true, value);
                }
                else if(toggleGroup != 'themecolor') {
                    var groupName = _.findWhere(this.EffectGroups, {value: this._state.EffectGroup}).id;
                    this.addNewEffect(value, this._state.EffectGroup, groupName,true, this._state.EffectOption);
                }
            }
        },

        onSelectColor: function (color){
            var groupName = _.findWhere(this.EffectGroups, {value: this._state.EffectGroup}).id;
            this.addNewEffect(this._state.Effect, this._state.EffectGroup, groupName,true, this._state.EffectOption, undefined, color);
        },

        onAnimationPane: function(btn) {
            this._state.isAnimPaneVisible = btn.pressed;
            this.api.asc_ShowAnimPane(btn.pressed);
            Common.UI.TooltipManager.closeTip('animPane');
        },

        onApiCloseAnimPane: function () {
            this._state.isAnimPaneVisible = false;
            this.view.btnAnimationPane.toggle(false, true);
        },

        onCloseAnimPane: function () {
            if (this._state.isAnimPaneVisible) {
                this._state.isAnimPaneVisible = false;
                this.api.asc_ShowAnimPane(false);
                this.view.btnAnimationPane.toggle(false, true);
            }
        },

        onAnimationAdditional: function(replace) { // replace or add new additional effect
            var me = this;
            (new PE.Views.AnimationDialog({
                api             : this.api,
                activeEffect    : this._state.Effect,
                groupValue      : this._state.EffectGroup,
                lockEmphasis    : this._state.lockEmphasis,
                handler         : function(result, value) {
                    if (result == 'ok') {
                        if (me.api) {
                            me.addNewEffect(value.activeEffect, value.activeGroupValue, value.activeGroup, replace, undefined);
                        }
                    }
                }
            })).show();
        },

        onAddAnimation: function(picker, record) {
            var type = record.get('value');
            var group = _.findWhere(this.EffectGroups, {id: record.get('group')}).value;
            this.addNewEffect(type, group, record.get('group'), false);
            if (group===AscFormat.PRESET_CLASS_PATH && type===AscFormat.MOTION_CUSTOM_PATH) {
                Common.Utils.lockControls(Common.enumLock.noAnimation, false, {array: [this.view.btnParameters]});
                Common.Utils.lockControls(Common.enumLock.noAnimationParam, false, {array: [this.view.btnParameters]});
            }
        },

        addNewEffect: function (type, group, groupName, replace, parametr, preview, color) {
            var parameter = this.view.setMenuParameters(type, groupName, parametr);
            this.api.asc_AddAnimation(group, type, (parameter != undefined)?parameter:0, color ? color : null, replace, !Common.Utils.InternalSettings.get("pe-animation-no-auto-preview"));
        },

        onDurationChange: function(before,combo, record, e) {
            var value,
                me = this;
            if(before)
            {
                var item = combo.store.findWhere({
                    displayValue: record.value
                });

                if (!item) {
                    var expr = new RegExp('^\\s*(\\d*(\\.|,)?\\d+)\\s*(' + me.view.txtSec + ')?\\s*$');
                    if (!expr.exec(record.value)) {
                        combo.setValue(this._state.Duration, this._state.Duration>=0 ? this._state.Duration + ' ' + this.view.txtSec : '');
                        e.preventDefault();
                        return false;
                    }
                }

            } else {
                value = Common.Utils.String.parseFloat(record.value);
                if(!record.displayValue)
                    value = value > 600  ? 600 :
                        value < 0 ? 0.01 : parseFloat(value.toFixed(2));

                combo.setValue(value);
                this.setDuration(value);
            }
        },

        onDurationSelected: function (combo, record) {
            this.setDuration(record.value);
        },

        setDuration: function(valueRecord) {
            if (this.api && this.AnimationProperties) {
                var value = valueRecord < 0 ? valueRecord : valueRecord * 1000;
                this.AnimationProperties.asc_putDuration(value);
                this.api.asc_SetAnimationProperties(this.AnimationProperties);
            }
        },

        onDelayChange: function(field, newValue, oldValue, eOpts) {
            if (this.api && this.AnimationProperties) {
                this.AnimationProperties.asc_putDelay(field.getNumberValue() * 1000);
                this.api.asc_SetAnimationProperties(this.AnimationProperties);
            }
        },

        onRepeatChange: function (before,combo, record, e){
            var value,
                me = this;
            if(before)
            {
                var item = combo.store.findWhere({
                    displayValue: record.value
                });

                if (!item) {
                    value = /^\+?(\d*(\.|,).?\d+)$|^\+?(\d+(\.|,)?\d*)$/.exec(record.value);
                    if (!value) {
                        combo.setValue(this._state.Repeat, this._state.Repeat>=0 ? this._state.Repeat : 1);
                        e.preventDefault();
                        return false;
                    }
                }

            } else {
                value = Common.Utils.String.parseFloat(record.value);
                if(!record.displayValue)
                    value = value > 9999  ? 9999 :
                        value < 1 ? 1 : Math.floor((value+0.4)*2)/2;

                combo.setValue(value);
                this.setRepeat(value);
            }
        },

        onRepeatSelected: function (combo, record) {
            this.setRepeat(record.value);
        },

        setRepeat: function(valueRecord) {
            if (this.api && this.AnimationProperties) {
                var value = valueRecord < 0 ? valueRecord : valueRecord * 1000;
                this.AnimationProperties.asc_putRepeatCount(value);
                this.api.asc_SetAnimationProperties(this.AnimationProperties);
            }
        },

        onRepeatComboOpen: function(needfocus, combo, e, params) {
            if (params && params.fromKeyDown) return;
            _.delay(function() {
                var input = $('input', combo.cmpEl).select();
                if (needfocus) input.focus();
                else if (!combo.isMenuOpen()) input.one('mouseup', function (e) { e.preventDefault(); });
            }, 10);
        },

        onMoveEarlier: function () {
            if(this.api) {
                this.api.asc_moveAnimationEarlier();
            }
        },

        onMoveLater: function () {
            if(this.api) {
                this.api.asc_moveAnimationLater();
            }
        },

        onTriggerClick: function (value) {
            if(this.api && this.AnimationProperties) {
                if(value.value == this.view.triggers.ClickSequence) {
                    this.AnimationProperties.asc_putTriggerClickSequence(true);
                    this.api.asc_SetAnimationProperties(this.AnimationProperties);
                }
            }
        },

        onTriggerClickOfClick: function (value)
        {
            if(this.api && this.AnimationProperties) {
                this.AnimationProperties.asc_putTriggerClickSequence(false);
                this.AnimationProperties.asc_putTriggerObjectClick(value.caption);
                this.api.asc_SetAnimationProperties(this.AnimationProperties);
            }
        },

        onEffectSelect: function (combo, record) {
            if (this.api) {
                var type = record.get('value');
                if (type===AscFormat.ANIM_PRESET_MULTIPLE) return;

                var group = _.findWhere(this.EffectGroups, {id: record.get('group')});
                group = group ? group.value : undefined;
                var prevEffect = this._state.Effect;
                this._state.Effect = undefined;
                this.addNewEffect(type, group, record.get('group'),prevEffect != AscFormat.ANIM_PRESET_NONE);
                if (group===AscFormat.PRESET_CLASS_PATH && type===AscFormat.MOTION_CUSTOM_PATH) {
                    Common.Utils.lockControls(Common.enumLock.noAnimation, false, {array: [this.view.btnParameters]});
                    Common.Utils.lockControls(Common.enumLock.noAnimationParam, false, {array: [this.view.btnParameters]});
                }
            }
            Common.NotificationCenter.trigger('edit:complete', this.view);
        },

        onStartSelect: function (combo, record) {
            if (this.api && this.AnimationProperties) {
                this.AnimationProperties.asc_putStartType(record.value);
                this.api.asc_SetAnimationProperties(this.AnimationProperties);
            }
        },

        onCheckRewindChange: function (field, newValue, oldValue, eOpts) {
            if (this.api && this.AnimationProperties) {
                this.AnimationProperties.asc_putRewind(field.getValue() == 'checked');
                this.api.asc_SetAnimationProperties(this.AnimationProperties);
            }
        },

        onFocusObject: function(selectedObjects) {
            this.AnimationProperties = null;
            this._state.lockEmphasis = false;
            var animatedObjects = this.api.asc_getAnimatedObjectsStack();
            for (var i = 0; i<animatedObjects.length; i++) {
                var type = animatedObjects[i].get_ObjectType();
                if (type === Asc.c_oAscTypeSelectElement.Animation) {
                    this.AnimationProperties = animatedObjects[i].get_ObjectValue();
                } else if (type===Asc.c_oAscTypeSelectElement.Slide) {
                    this._state.timingLock = animatedObjects[i].get_ObjectValue().get_LockTiming();
                } else if (type===Asc.c_oAscTypeSelectElement.Shape) {
                    var value = animatedObjects[i].get_ObjectValue();
                    this._state.lockEmphasis = this._state.lockEmphasis || value.get_FromGroup() || value.get_FromChart() || value.get_FromSmartArt() || value.get_FromSmartArtInternal();
                } else if (type===Asc.c_oAscTypeSelectElement.Table) {
                    this._state.lockEmphasis = true;
                }
            }
            if (this._state.onactivetab)
                this.setSettings();
        },

        setSettings: function () {
            this._state.noGraphic = this._state.noAnimation = this._state.noAnimationParam = this._state.noTriggerObjects = this._state.noMoveAnimationLater = this._state.noMoveAnimationEarlier = true;
            this._state.noAnimationPreview = !this.api.asc_canStartAnimationPreview();
            var me = this,
                view = this.view,
                store = view.listEffects.store,
                fieldStore = view.listEffects.fieldPicker.store;
            if (this.AnimationProperties) {
                this._state.noGraphic = false;
                this._state.noMoveAnimationLater = !this.api.asc_canMoveAnimationLater();
                this._state.noMoveAnimationEarlier = !this.api.asc_canMoveAnimationEarlier();
                var item,
                    value = this.AnimationProperties.asc_getType(),
                    group = this.AnimationProperties.asc_getClass();

                (value == undefined) && (value = AscFormat.ANIM_PRESET_NONE);
                this._state.noAnimation = (value === AscFormat.ANIM_PRESET_NONE);

                if (this._state.Effect !== value || this._state.EffectGroup !== group) {
                    this._state.Effect = value;
                    this._state.EffectGroup = group;
                    this.setViewRepeatAndDuration(this._state.EffectGroup, this._state.Effect);
                    group = view.listEffects.groups.findWhere({value: this._state.EffectGroup});
                    var effect =_.findWhere(view.allEffects, group ? {group: group.get('id'), value: this._state.Effect} : {value: this._state.Effect});
                    var familyEffect = (effect) ? effect.familyEffect : undefined;
                    item =   (!familyEffect) ? store.findWhere(group ? {group: group.get('id'), value: value} : {value: value})
                    : store.findWhere(group ? {group: group.get('id'), familyEffect: familyEffect} : {familyEffect: familyEffect});
                    if (item) {
                        var forceFill = false;
                        if (!item.get('isCustom')) { // remove custom effect from list if not-custom is selected
                            var rec = store.findWhere({isCustom: true});
                            forceFill = !!rec;
                            rec && store.remove(rec);
                        }
                        if (this._state.Effect!==AscFormat.ANIM_PRESET_MULTIPLE) { // remove "multiple" item if one effect is selected
                            var rec = fieldStore.findWhere({value: AscFormat.ANIM_PRESET_MULTIPLE});
                            forceFill = forceFill || !!rec;
                            rec && fieldStore.remove(rec);
                        }
                        view.listEffects.selectRecord(item);
                        view.listEffects.fillComboView(item, true, forceFill);
                    } else {
                        store.remove(store.findWhere({isCustom: true})); // remove custom effects
                        if (this._state.Effect==AscFormat.ANIM_PRESET_MULTIPLE) { // add and select "multiple" item
                            view.listEffects.fillComboView(store.at(0), false, true);
                            fieldStore.reset(fieldStore.slice(0, fieldStore.length-1));
                            view.listEffects.fieldPicker.selectRecord(fieldStore.add(new Common.UI.DataViewModel({
                                group: 'none',
                                value: AscFormat.ANIM_PRESET_MULTIPLE,
                                iconCls: 'animation-multiple',
                                displayValue: view.textMultiple
                            }), {at:1}));
                            view.listEffects.menuPicker.deselectAll();
                        } else { // add custom effect to appropriate group
                            if (group) {
                                var items = store.where({group: group.get('id')});
                                var index = (items && items.length>0) ? store.indexOf(items[items.length-1]) : store.length-1;
                                var rec = _.findWhere(Common.define.effectData.getEffectFullData(), {group: group.get('id'), value: this._state.Effect});
                                item = store.add(new Common.UI.DataViewModel({
                                    group: group.get('id'),
                                    value: this._state.Effect,
                                    iconCls: (rec && rec.iconCls) ? rec.iconCls : group.get('iconClsCustom'),
                                    displayValue: rec ? rec.displayValue : '',
                                    tip: rec ? rec.displayValue : '',
                                    isCustom: true
                                }), {at:index+1});
                                view.listEffects.selectRecord(item);
                                view.listEffects.fillComboView(item, true, true);
                            } else {
                                view.listEffects.fieldPicker.deselectAll();
                                view.listEffects.menuPicker.deselectAll();
                            }
                        }
                    }
                }

                this._state.EffectOption = this.AnimationProperties.asc_getSubtype();
                if (this._state.EffectOption !== null && this._state.Effect !== AscFormat.ANIM_PRESET_MULTIPLE && this._state.Effect !== AscFormat.ANIM_PRESET_NONE) {
                    var rec = _.findWhere(this.EffectGroups,{value: this._state.EffectGroup});
                    view.setMenuParameters(this._state.Effect, rec ? rec.id : undefined, this._state.EffectOption);

                    view.isColor  && view.setColor(this.AnimationProperties.asc_getColor());
                    this._state.noAnimationParam = view.btnParameters.menu.items.length === view.startIndexParam && !view.isColor;
                }

                value = this.AnimationProperties.asc_getDuration();
                this._state.Duration = (value>=0) ? value/1000 : value ; // undefined or <0
                if (this._state.noAnimationDuration)
                    view.cmbDuration.setValue('');
                else
                    view.cmbDuration.setValue(this._state.Duration, this._state.Duration>=0 ? this._state.Duration + ' ' + this.view.txtSec : '');

                value = this.AnimationProperties.asc_getDelay();
                if (Math.abs(this._state.Delay - value) > 0.001 ||
                    (this._state.Delay === null || value === null) && (this._state.Delay !== value) ||
                    (this._state.Delay === undefined || value === undefined) && (this._state.Delay !== value)) {
                    this._state.Delay = value;
                    view.numDelay.setValue((this._state.Delay !== null && this._state.Delay !== undefined) ? this._state.Delay / 1000. : '', true);
                }
                value =this.AnimationProperties.asc_getRepeatCount();
                this._state.Repeat = (value<0) ? value : value/1000;
                if (this._state.noAnimationRepeat)
                    view.cmbRepeat.setValue('');
                else
                    view.cmbRepeat.setValue( this._state.Repeat, this._state.Repeat>=0 ? this._state.Repeat : 1);

                this._state.StartSelect = this.AnimationProperties.asc_getStartType();
                view.cmbStart.setValue(this._state.StartSelect!==undefined ? this._state.StartSelect : AscFormat.NODE_TYPE_CLICKEFFECT);

                this._state.Rewind = this.AnimationProperties.asc_getRewind();
                view.chRewind.setValue(!!this._state.Rewind, true);

                if(this.AnimationProperties.asc_getTriggerClickSequence()) {
                    this._state.trigger = view.triggers.ClickSequence;
                    this._state.TriggerValue = true;
                } else {
                    this._state.trigger = view.triggers.ClickOf;
                    this._state.TriggerValue = this.AnimationProperties.asc_getTriggerObjectClick();
                }
                this.setTriggerList();
            } else {
                this._state.Effect = this._state.EffectGroup = this._state.EffectOption = undefined;
                if (this.view && this.view.listEffects)
                    this.view.listEffects.fieldPicker.deselectAll();
            }
            if (!this.arrEmphasis) {
                this.arrEmphasis = store.filter(function(item, index){
                    return (item.get('group') === 'menu-effect-group-emphasis') && !(item.get('value') === AscFormat.EMPHASIS_GROW_SHRINK || item.get('value') === AscFormat.EMPHASIS_SPIN ||
                                                                                    item.get('value') === AscFormat.EMPHASIS_TRANSPARENCY || item.get('value') === AscFormat.EMPHASIS_PULSE ||
                                                                                    item.get('value') === AscFormat.EMPHASIS_TEETER || item.get('value') === AscFormat.EMPHASIS_BLINK);
                });
            }
            this.arrEmphasis.forEach(function(item){
                item.set('disabled', !!me._state.lockEmphasis);
            });
            fieldStore.each(function(item){
                if (item.get('group') === 'menu-effect-group-emphasis' && !(item.get('value') === AscFormat.EMPHASIS_GROW_SHRINK || item.get('value') === AscFormat.EMPHASIS_SPIN ||
                                                                            item.get('value') === AscFormat.EMPHASIS_TRANSPARENCY || item.get('value') === AscFormat.EMPHASIS_PULSE ||
                                                                            item.get('value') === AscFormat.EMPHASIS_TEETER || item.get('value') === AscFormat.EMPHASIS_BLINK))
                item.set('disabled', !!me._state.lockEmphasis);
            });
            this.setLocked();
        },

        setTriggerList: function (){
            var me = this;
            this.objectNames = this.api.asc_getCurSlideObjectsNames();
            this._state.noTriggerObjects = !this.objectNames || this.objectNames.length<1;

            this.view.btnClickOf.menu.removeAll();
            var btnMemnu=this.view.btnClickOf.menu;
            this.objectNames.forEach(function (item){
                btnMemnu.addItem({ caption: item, checkable: true, toggleGroup: 'animtrigger', checked: item===me._state.TriggerValue});
            });
            this.view.cmbTrigger.menu.items[0].setChecked(this._state.trigger == this.view.triggers.ClickSequence);
        },

        setViewRepeatAndDuration: function(group, type) {
            if(type == AscFormat.ANIM_PRESET_NONE) return;

            this._state.noAnimationDuration = this._state.noAnimationRepeat = false;
            if((group == AscFormat.PRESET_CLASS_ENTR && type == AscFormat.ENTRANCE_APPEAR) || (group == AscFormat.PRESET_CLASS_EXIT && type == AscFormat.EXIT_DISAPPEAR)) {
                this._state.noAnimationDuration = this._state.noAnimationRepeat = true;
            }
            else if((group == AscFormat.PRESET_CLASS_EMPH) &&
                (type == AscFormat.EMPHASIS_BOLD_REVEAL || type == AscFormat.EMPHASIS_TRANSPARENCY)) {
                this._state.noAnimationRepeat = true;
                if(this.view.cmbDuration.store.length == 6) {
                    this.view.cmbDuration.store.add([{value: AscFormat.untilNextClick, displayValue: this.view.textUntilNextClick},
                                                    {value: AscFormat.untilNextSlide, displayValue: this.view.textUntilEndOfSlide}]);
                    this.view.cmbDuration.setData(this.view.cmbDuration.store.models);
                }
            }

            if((this.view.cmbDuration.store.length == 8) && ((this._state.EffectGroup !=  AscFormat.PRESET_CLASS_EMPH) ||
                ((this._state.EffectGroup == AscFormat.PRESET_CLASS_EMPH) && (this._state.Effect != AscFormat.EMPHASIS_BOLD_REVEAL) && (this._state.Effect != AscFormat.EMPHASIS_TRANSPARENCY)))) {
                this.view.cmbDuration.store.pop();
                this.view.cmbDuration.store.pop();
                this.view.cmbDuration.setData(this.view.cmbDuration.store.models);
            }

        },

        onActiveTab: function(tab) {
            if (tab == 'animate') {
                this._state.onactivetab = true;
                this.setSettings();
            }
            else this._state.onactivetab = false;
            this.api && this.api.asc_onShowAnimTab(!!this._state.onactivetab);
        },

        onAddEffectShow: function(picker) {
            var me = this;
            if (!this.arrEmphasisAddEffect) {
                this.arrEmphasisAddEffect = picker.store.filter(function(item, index){
                    return (item.get('group') === 'menu-effect-group-emphasis') && !(item.get('value') === AscFormat.EMPHASIS_GROW_SHRINK || item.get('value') === AscFormat.EMPHASIS_SPIN ||
                        item.get('value') === AscFormat.EMPHASIS_TRANSPARENCY || item.get('value') === AscFormat.EMPHASIS_PULSE ||
                        item.get('value') === AscFormat.EMPHASIS_TEETER || item.get('value') === AscFormat.EMPHASIS_BLINK);
                });
            }
            this.arrEmphasisAddEffect.forEach(function(item){
                item.set('disabled', !!me._state.lockEmphasis);
            });
            picker.scroller.update({alwaysVisibleY: true});
        },

        lockToolbar: function (causes, lock, opts) {
            Common.Utils.lockControls(causes, lock, opts, this.view.lockedControls);
        },

        setLocked: function() {
            if (this._state.noGraphic != undefined)
                this.lockToolbar(Common.enumLock.noGraphic, this._state.noGraphic);
            if (this._state.noAnimation != undefined)
                this.lockToolbar(Common.enumLock.noAnimation, this._state.noAnimation);
            if (this._state.noAnimationParam != undefined)
                this.lockToolbar(Common.enumLock.noAnimationParam, this._state.noAnimationParam);
            if (this._state.noTriggerObjects != undefined)
                this.lockToolbar(Common.enumLock.noTriggerObjects, this._state.noTriggerObjects);
            if (this._state.noMoveAnimationLater != undefined)
                this.lockToolbar(Common.enumLock.noMoveAnimationLater, this._state.noMoveAnimationLater);
            if (this._state.noMoveAnimationEarlier != undefined)
                this.lockToolbar(Common.enumLock.noMoveAnimationEarlier, this._state.noMoveAnimationEarlier);
            if (this._state.noAnimationPreview != undefined)
                this.lockToolbar(Common.enumLock.noAnimationPreview, this._state.noAnimationPreview);
            if (this._state.noAnimationRepeat != undefined)
                this.lockToolbar(Common.enumLock.noAnimationRepeat, this._state.noAnimationRepeat);
            if (this._state.noAnimationDuration != undefined)
                this.lockToolbar(Common.enumLock.noAnimationDuration, this._state.noAnimationDuration);
            if (this._state.timingLock != undefined)
                this.lockToolbar(Common.enumLock.timingLock, this._state.timingLock);
        },

        updateThemeColors: function (){
            this.view.updateColors();
        },

        getAnimationPanelTip: function (effect) {
            var result;
            if (effect) {
                var nodeType = effect[0] === AscFormat.NODE_TYPE_CLICKEFFECT ? this.view.textStartOnClick :
                    (effect[0] === AscFormat.NODE_TYPE_WITHEFFECT ? this.view.textStartWithPrevious :
                        (effect[0] === AscFormat.NODE_TYPE_AFTEREFFECT ? this.view.textStartAfterPrevious : ''));
                var presetClass = _.findWhere(Common.define.effectData.getEffectGroupData(), {value: effect[1]});
                presetClass = presetClass ? presetClass.caption : '';
                var preset = _.findWhere(Common.define.effectData.getEffectData(), {value: effect[2]});
                preset = preset ? preset.displayValue : '';
                var name = Common.Utils.String.htmlEncode(effect[3]) || '';
                result = nodeType + '\n' + presetClass + '\n' + preset + ' : ' + name;
            }
            return result;
        }

    }, PE.Controllers.Animation || {}));
});