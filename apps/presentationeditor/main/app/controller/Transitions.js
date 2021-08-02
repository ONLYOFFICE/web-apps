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
 *  Transitions.js
 *
 *  Created by Olga.Transitions on 15.07.21
 *  Copyright (c) 2021 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'jquery',
    'underscore',
    'backbone',
    'presentationeditor/main/app/view/Transitions'
], function () {
    'use strict';

    PE.Controllers.Transitions = Backbone.Controller.extend(_.extend({
        models : [],
        collections : [
        ],
        views : [
            'PE.Views.Transitions'
        ],
        options: {
            alias: 'Transitions'
        },
        sdkViewName : '#id_main',

        initialize: function () {

            this.addListeners({

                'PE.Views.Transitions': {
                    'transit:preview':      _.bind(this.onPreviewClick, this),
                    'transit:parametrs':    _.bind(this.onParametrClick,this),
                    'transit:duration':     _.bind(this.onDurationChange,this),
                    'transit:applytoall':   _.bind(this.onApplyToAllClick,this),
                    'transit:selecteffect': _.bind(this.onEffectSelect, this),
                    'transit:startonclick': _.bind(this.onStartOnClickChange,this),
                    'transit:delay':        _.bind(this.onDelayChange,this),
                    'transit:checkdelay':   _.bind(this.onCheckDelayChange,this)
                }
            });

        },
        onLaunch: function () {
            this._state = {};
            //Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
         },
        setConfig: function (config) {
            this.appConfig = config.mode;

            this.view = this.createView('PE.Views.Transitions', {
                toolbar: config.toolbar,
                mode: config.mode
            });
            return this;
        },

        setApi: function (api) {
            this.api = api;
            this.api.asc_registerCallback('asc_onFocusObject',          _.bind(this.onFocusObject, this));
            this.api.asc_registerCallback('asc_onCountPages',           _.bind(this.onApiCountPagesRestricted, this));
            return this;
        },
        onApiCountPagesRestricted: function (count){
            if (this._state.no_slides !== (count<=0)) {
                this._state.no_slides = (count<=0);
                this.lockToolbar(PE.enumLock.noSlides, this._state.no_slides);
            }
        },

        loadDocument: function(data) {
            this.document = data.doc;
        },

        SetDisabled: function(state) {
            /*if (this.dlgChanges)
                this.dlgChanges.close();
            this.view && this.view.SetDisabled(state, this.langs);*/
            //this.setPreviewMode(state);
        },

        createToolbarPanel: function() {
            return this.view.getPanel();
        },

        getView: function(name) {
            return !name && this.view ?
                this.view : Backbone.Controller.prototype.getView.call(this, name);
        },

        onAppReady: function (config) {
            var me = this;

        },
        onPreviewClick: function(){
            if (this.api) {
                this.api.SlideTransitionPlay();
            }
        },
        onParametrClick: function (item){
            this.EffectType = item.value;
            if (this.api && !this._noApply) {
                var props = new Asc.CAscSlideProps();
                var transition = new Asc.CAscSlideTransition();
                transition.put_TransitionType(this.Effect);
                transition.put_TransitionOption(this.EffectType);
                props.put_transition(transition);
                this.api.SetSlideProps(props);
            }
        },
        onDurationChange: function(field, newValue, oldValue, eOpts){
            if (this.api && !this._noApply)   {
                var props = new Asc.CAscSlideProps();
                var transition = new Asc.CAscSlideTransition();
                transition.put_TransitionDuration(field.getNumberValue()*1000);
                props.put_transition(transition);
                this.api.SetSlideProps(props);
            }
        },
        onStartOnClickChange: function(field, newValue, oldValue, eOpts){
            if (this.api && !this._noApply)   {
                var props = new Asc.CAscSlideProps();
                var transition = new Asc.CAscSlideTransition();
                transition.put_SlideAdvanceOnMouseClick(field.getValue()=='checked');
                props.put_transition(transition);
                this.api.SetSlideProps(props);
            }
        },
        onDelayChange: function(field, newValue, oldValue, eOpts){
            if (this.api && !this._noApply)   {
                var props = new Asc.CAscSlideProps();
                var transition = new Asc.CAscSlideTransition();
                transition.put_SlideAdvanceDuration(field.getNumberValue()*1000);
                props.put_transition(transition);
                this.api.SetSlideProps(props);
            }
        },
        onCheckDelayChange: function(field, newValue, oldValue, eOpts){
            this.view.numDelay.setDisabled(field.getValue()!=='checked');
            if (this.api && !this._noApply)   {
                var props = new Asc.CAscSlideProps();
                var transition = new Asc.CAscSlideTransition();
                transition.put_SlideAdvanceAfter(field.getValue()=='checked');
                props.put_transition(transition);
                this.api.SetSlideProps(props);
            }
        },
        onApplyToAllClick: function (){
            if (this.api) this.api.SlideTransitionApplyToAll();
        },
        onEffectSelect:function (combo, record){
            var type = record.get('value');
            if (this.Effect !== type &&
                !((this.Effect===Asc.c_oAscSlideTransitionTypes.Wipe || this.Effect===Asc.c_oAscSlideTransitionTypes.UnCover || this.Effect===Asc.c_oAscSlideTransitionTypes.Cover)&&
                    (type===Asc.c_oAscSlideTransitionTypes.Wipe || type===Asc.c_oAscSlideTransitionTypes.UnCover || type===Asc.c_oAscSlideTransitionTypes.Cover))  )
            {
                var  parametr=this.view.setMenuParametrs(type);
                if(parametr)
                this.onParametrClick(parametr);
            }
            this.Effect = type;
            if (this.api && !this._noApply) {
                var props = new Asc.CAscSlideProps();
                var transition = new Asc.CAscSlideTransition();
                transition.put_TransitionType(type);
                transition.put_TransitionOption(this.EffectType);
                props.put_transition(transition);
                this.api.SetSlideProps(props);
            }
        },
        onFocusObject:function(selectedObjects){
            var me = this;
            for (var i=0; i<selectedObjects.length; i++) {


                var eltype = selectedObjects[i].get_ObjectType();

                if (eltype === undefined)
                    continue;

                if (eltype == Asc.c_oAscTypeSelectElement.Slide) {

                    var slide_deleted = undefined,
                        locked_transition=undefined,
                        pr;
                    me._state.activated=me.view.toolbar.activated;
                    pr=selectedObjects[i].get_ObjectValue();
                    slide_deleted = pr.get_LockDelete();
                    locked_transition = pr.get_LockTransition();

                   if (slide_deleted !== undefined && me._state.slidecontrolsdisable !== slide_deleted) {
                        if (me._state.activated) me._state.slidecontrolsdisable = slide_deleted;
                        me.lockToolbar(PE.enumLock.slideDeleted, slide_deleted);
                   }
                   if (locked_transition !== undefined && me._state.lockedtransition !== locked_transition ) {
                        if (me._state.activated) me._state.lockedtransition = locked_transition;
                        me.lockToolbar(PE.enumLock.transitLock, locked_transition);
                   }

                }
                this.changeSettings(pr);
            }

        },
        lockToolbar: function (causes, lock, opts) {
            Common.Utils.lockControls(causes, lock, opts, this.view.lockedControls);
        },
        changeSettings:function (props){
            var me=this.view;

            var transition = props.get_transition();
            if (transition) {
                var value = transition.get_TransitionType();
                var found = false;
                if (this._state.Effect !== value) {
                    var item = me.listEffects.store.findWhere({value: value});
                    if (item) {
                        found = true;
                        me.listEffects.menuPicker.selectRecord(item);
                        this._state.Effect = value;
                    } else
                        me.listEffects.menuPicker.selectRecord(me.listEffects.menuPicker.items[0]);
                }

                if (me.btnParametrs.menu.items.length>0) {
                    value = transition.get_TransitionOption();
                        me.setMenuParametrs(this._state.Effect, value);
                        this._state.EffectType = value;
                }

                value = transition.get_TransitionDuration();
                if (Math.abs(this._state.Duration - value) > 0.001 ||
                    (this._state.Duration === null || value === null) && (this._state.Duration !== value) ||
                    (this._state.Duration === undefined || value === undefined) && (this._state.Duration !== value)) {
                    me.numDuration.setValue((value !== null && value !== undefined) ? value / 1000. : '', true);
                    this._state.Duration = value;
                }

                value = transition.get_SlideAdvanceDuration();
                if (Math.abs(this._state.Delay - value) > 0.001 ||
                    (this._state.Delay === null || value === null) && (this._state.Delay !== value) ||
                    (this._state.Delay === undefined || value === undefined) && (this._state.Delay !== value)) {
                    me.numDelay.setValue((value !== null && value !== undefined) ? value / 1000. : '', true);
                    this._state.Delay = value;
                }

                value = transition.get_SlideAdvanceOnMouseClick();
                if (this._state.OnMouseClick !== value) {
                    me.chStartOnClick.setValue((value !== null && value !== undefined) ? value : 'indeterminate', true);
                    this._state.OnMouseClick = value;
                }
                value = transition.get_SlideAdvanceAfter();
                if (this._state.AdvanceAfter !== value) {
                    me.chDelay.setValue((value !== null && value !== undefined) ? value : 'indeterminate', true);
                    me.numDelay.setDisabled(me.chDelay.getValue() !== 'checked');
                    this._state.AdvanceAfter = value;
                }
            }
        }
    }, PE.Controllers.Transitions || {}));
});