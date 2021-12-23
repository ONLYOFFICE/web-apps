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
 *  Created by Olga.Animation on 13.10.21
 *  Copyright (c) 2021 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'jquery',
    'underscore',
    'backbone',
    'presentationeditor/main/app/view/Animation',
    'presentationeditor/main/app/view/AnimationDialog'
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
                    'animation:preview':        _.bind(this.onPreviewClick, this),
                    'animation:parameters':     _.bind(this.onParameterClick, this),
                    'animation:duration':       _.bind(this.onDurationChange, this),
                    'animation:selecteffect':   _.bind(this.onEffectSelect, this),
                    'animation:delay':          _.bind(this.onDelayChange, this),
                    'animation:animationpane':  _.bind(this.onAnimationPane, this),
                    'animation:addanimation':   _.bind(this.onAddAnimation, this),
                    'animation:startselect':    _.bind(this.onStartSelect, this),
                    'animation:checkrewind':    _.bind(this.onCheckRewindChange,this),
                    'animation:repeat':         _.bind(this.onRepeatChange, this),
                    'animation:additional':     _.bind(this.onAnimationAdditional, this),
                    'animation:trigger':        _.bind(this.onTriggerClick, this),
                    'animation:triggerclickof': _.bind(this.onTriggerClickOfClick, this),
                    'animation:moveearlier':    _.bind(this.onMoveEarlier, this),
                    'animation:movelater':      _.bind(this.onMoveLater, this)
                },
                'Toolbar': {
                    'tab:active':               _.bind(this.onActiveTab, this)
                }
            });
            this.EffectGroups = Common.define.effectData.getEffectGroupData();
        },

        onLaunch: function () {
            this._state = {};
         },

        setConfig: function (config) {
            this.appConfig = config.mode;
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
            return this;
        },

        onApiCountPages: function (count) {
            if (this._state.no_slides !== (count<=0)) {
                this._state.no_slides = (count<=0);
                this.lockToolbar(PE.enumLock.noSlides, this._state.no_slides);
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
            this.view.btnPreview.setIconCls('toolbar__icon transition-zoom');
        },
        onAnimPreviewFinished: function ()
        {
            this._state.playPreview = false;
            this.view.btnPreview.setIconCls('toolbar__icon transition-fade');
        },

        onParameterClick: function (value) {
            if(this.api && this.AnimationProperties) {
                this.AnimationProperties.asc_putSubtype(value);
                this.api.asc_SetAnimationProperties(this.AnimationProperties);
            }
        },

        onAnimationPane: function() {
        },

        onAnimationAdditional: function(replace) { // replace or add new additional effect
            var me = this;
            (new PE.Views.AnimationDialog({
                api             : this.api,
                activeEffect    : this._state.Effect,
                groupValue       : this._state.EffectGroup,
                handler         : function(result, value) {
                    if (result == 'ok') {
                        if (me.api) {
                            me.addNewEffect(value.activeEffect, value.activeGroupValue, value.activeGroup, replace);
                        }
                    }
                }
            })).show();
        },

        onAddAnimation: function(picker, record) {
            var type = record.get('value');
            var group = _.findWhere(this.EffectGroups, {id: record.get('group')}).value;
            this.addNewEffect(type, group, record.get('group'), false);
        },

        addNewEffect: function (type, group, groupName, replace) {
            if (this._state.Effect == type) return;
            var parameter = this.view.setMenuParameters(type, groupName, undefined);
            this.api.asc_AddAnimation(group, type, (parameter != undefined)?parameter:0, replace);
            this._state.EffectGroups = group;
            this._state.Effect = type;
        },

        onDurationChange: function(field, newValue, oldValue, eOpts) {
            if (this.api) {
                this.AnimationProperties.asc_putDuration(field.getNumberValue() * 1000);
                this.api.asc_SetAnimationProperties(this.AnimationProperties);
            }
        },

        onDelayChange: function(field, newValue, oldValue, eOpts) {
            if (this.api) {
                this.AnimationProperties.asc_putDelay(field.getNumberValue() * 1000);
                this.api.asc_SetAnimationProperties(this.AnimationProperties);
            }
        },

        onRepeatChange: function (field, newValue, oldValue, eOpts){
            if (this.api) {
                this.AnimationProperties.asc_putRepeatCount(field.getNumberValue() * 1000);
                this.api.asc_SetAnimationProperties(this.AnimationProperties);
            }
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
            if(this.api) {
                if(value.value == this.view.triggers.ClickSequence) {
                    this.AnimationProperties.asc_putTriggerClickSequence(true);
                    this.api.asc_SetAnimationProperties(this.AnimationProperties);
                }
            }
        },

        onTriggerClickOfClick: function (value)
        {
            if(this.api) {
                this.AnimationProperties.asc_putTriggerClickSequence(false);
                this.AnimationProperties.asc_putTriggerObjectClick(value.caption);
                this.api.asc_SetAnimationProperties(this.AnimationProperties);
            }
        },

        onEffectSelect: function (combo, record) {
            if (this.api) {
                var type = record.get('value');
                var group = (type != AscFormat.ANIM_PRESET_NONE) ? _.findWhere(this.EffectGroups, {id: record.get('group')}).value : undefined;
                this.addNewEffect(type, group, record.get('group'),this._state.Effect != AscFormat.ANIM_PRESET_NONE);
            }
        },

        onStartSelect: function (combo, record) {
            if (this.api) {
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
            for (var i = 0; i<selectedObjects.length; i++) {
                if (selectedObjects[i].get_ObjectType() == Asc.c_oAscTypeSelectElement.Animation) {
                    this.AnimationProperties = selectedObjects[i].get_ObjectValue();
                }
            }
            if (this._state.onactivetab)
                this.setSettings();
        },

        setSettings: function () {
            this._state.noGraphic = this._state.noAnimation = this._state.noAnimationParam = this._state.noTriggerObjects = this._state.noMoveAnimationLater = this._state.noMoveAnimationEarlier = true;
            this._state.noAnimationPreview = !this.api.asc_canStartAnimationPreview();
            if (this.AnimationProperties) {
                this._state.noGraphic = false;
                this._state.noMoveAnimationLater = !this.api.asc_canMoveAnimationLater();
                this._state.noMoveAnimationEarlier = !this.api.asc_canMoveAnimationEarlier();
                var item,
                    view = this.view,
                    store = view.listEffects.store,
                    fieldStore = view.listEffects.fieldPicker.store,
                    value = this.AnimationProperties.asc_getType(),
                    group = this.AnimationProperties.asc_getClass();

                (value == undefined) && (value = AscFormat.ANIM_PRESET_NONE);
                this._state.noAnimation = (value === AscFormat.ANIM_PRESET_NONE);

                if (this._state.Effect !== value || this._state.EffectGroup !== group) {
                    this._state.Effect = value;
                    this._state.EffectGroup = group;

                    group = view.listEffects.groups.findWhere({value: this._state.EffectGroup});
                    item = store.findWhere(group ? {group: group.get('id'), value: this._state.Effect} : {value: this._state.Effect});
                    if (item) {
                        var forceFill = false;
                        if (!item.get('isCustom')) { // remove custom effect from list if not-custom is selected
                            var rec = store.findWhere({isCustom: true});
                            forceFill = !!rec;
                            store.remove(rec);
                        }
                        if (this._state.Effect!==AscFormat.ANIM_PRESET_MULTIPLE) { // remove "multiple" item if one effect is selected
                            var rec = fieldStore.findWhere({value: AscFormat.ANIM_PRESET_MULTIPLE});
                            forceFill = forceFill || !!rec;
                            fieldStore.remove(rec);
                        }
                        view.listEffects.selectRecord(item);
                        view.listEffects.fillComboView(item, true, forceFill);
                        view.btnParameters.setIconCls('toolbar__icon icon ' + item.get('iconCls'));
                    } else {
                        store.remove(store.findWhere({isCustom: true})); // remove custom effects
                        if (this._state.Effect==AscFormat.ANIM_PRESET_MULTIPLE) { // add and select "multiple" item
                            view.listEffects.fillComboView(store.at(0), false, true);
                            fieldStore.remove(fieldStore.at(fieldStore.length-1));
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
                                var index = (items && items.length>0) ? store.indexOf(items.at(items.length-1)) : store.length-1;
                                var rec = _.findWhere(Common.define.effectData.getEffectFullData(), {group: group.get('id'), value: this._state.Effect});
                                item = store.add(new Common.UI.DataViewModel({
                                    group: group.get('id'),
                                    value: this._state.Effect,
                                    iconCls: group.get('iconClsCustom'),
                                    displayValue: rec ? rec.displayValue : '',
                                    isCustom: true
                                }), {at:index+1});
                                view.listEffects.selectRecord(item);
                                view.listEffects.fillComboView(item, true, true);
                                view.btnParameters.setIconCls('toolbar__icon icon ' + item.get('iconCls'));
                            } else {
                                view.listEffects.fieldPicker.deselectAll();
                                view.listEffects.menuPicker.deselectAll();
                            }
                        }
                    }
                }

                this._state.EffectOption = this.AnimationProperties.asc_getSubtype();
                if (this._state.EffectOption !== undefined && this._state.EffectOption !== null)
                    this._state.noAnimationParam = view.setMenuParameters(this._state.Effect, _.findWhere(this.EffectGroups,{value: this._state.EffectGroup}).id, this._state.EffectOption)===undefined;

                value = this.AnimationProperties.asc_getDuration();
                if (Math.abs(this._state.Duration - value) > 0.001 ||
                    (this._state.Duration === null || value === null) && (this._state.Duration !== value) ||
                    (this._state.Duration === undefined || value === undefined) && (this._state.Duration !== value)) {
                    this._state.Duration = value;
                    view.numDuration.setValue((this._state.Duration !== null  && this._state.Duration !== undefined) ? this._state.Duration / 1000. : '', true);
                }
                value = this.AnimationProperties.asc_getDelay();
                if (Math.abs(this._state.Delay - value) > 0.001 ||
                    (this._state.Delay === null || value === null) && (this._state.Delay !== value) ||
                    (this._state.Delay === undefined || value === undefined) && (this._state.Delay !== value)) {
                    this._state.Delay = value;
                    view.numDelay.setValue((this._state.Delay !== null && this._state.Delay !== undefined) ? this._state.Delay / 1000. : '', true);
                }
                value = this.AnimationProperties.asc_getRepeatCount();
                if (Math.abs(this._state.Repeat - value) > 0.001 ||
                    (this._state.Repeat === null || value === null) && (this._state.Repeat !== value) ||
                    (this._state.Repeat === undefined || value === undefined) && (this._state.Repeat !== value)) {
                    this._state.Repeat = value;
                    view.numRepeat.setValue((this._state.Repeat !== null && this._state.Repeat !== undefined) ? this._state.Repeat / 1000. : '', true);
                }

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
            }
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

        onActiveTab: function(tab) {
            if (tab == 'animate') {
                this._state.onactivetab = true;
                this.setSettings();
            }
            else this._state.onactivetab = false;
            this.api && this.api.asc_onShowAnimTab(!!this._state.onactivetab);
        },

        lockToolbar: function (causes, lock, opts) {
            Common.Utils.lockControls(causes, lock, opts, this.view.lockedControls);
        },

        setLocked: function() {
            if (this._state.noGraphic != undefined)
                this.lockToolbar(PE.enumLock.noGraphic, this._state.noGraphic);
            if (this._state.noAnimation != undefined)
                this.lockToolbar(PE.enumLock.noAnimation, this._state.noAnimation);
            if (this._state.noAnimationParam != undefined)
                this.lockToolbar(PE.enumLock.noAnimationParam, this._state.noAnimationParam);
            if (this._state.noTriggerObjects != undefined)
                this.lockToolbar(PE.enumLock.noTriggerObjects, this._state.noTriggerObjects);
            if (this._state.noMoveAnimationLater != undefined)
                this.lockToolbar(PE.enumLock.noMoveAnimationLater, this._state.noMoveAnimationLater);
            if (this._state.noMoveAnimationEarlier != undefined)
                this.lockToolbar(PE.enumLock.noMoveAnimationEarlier, this._state.noMoveAnimationEarlier);
            if (PE.enumLock.noAnimationPreview != undefined)
                this.lockToolbar(PE.enumLock.noAnimationPreview, this._state.noAnimationPreview);

        }

    }, PE.Controllers.Animation || {}));
});