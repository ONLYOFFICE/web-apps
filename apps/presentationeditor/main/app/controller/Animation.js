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
    'presentationeditor/main/app/view/Animation'
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
                    'animation:preview':      _.bind(this.onPreviewClick, this),
                    'animation:parameters':   _.bind(this.onParameterClick, this),
                    'animation:duration':     _.bind(this.onDurationChange, this),
                    'animation:selecteffect': _.bind(this.onEffectSelect, this),
                    'animation:delay':        _.bind(this.onDelayChange, this),
                    'animation:animationpane':_.bind(this.onAnimationPane, this),
                    'animation:addanimation':    _.bind(this.onAddAnimation, this),
                    'animation:startselect':    _.bind(this.onStartSelect, this),
                },
                'Toolbar': {
                    'tab:active':           _.bind(this.onActiveTab, this)
                }
            });

        },

        onLaunch: function () {
            this._state = {};
         },

        setConfig: function (config) {
            this.appConfig = config.mode;

            this.view = this.createView('PE.Views.Animation', {
                toolbar: config.toolbar,
                mode: config.mode
            });
            return this;
        }, 

        setApi: function (api) {
            this.api = api;
            this.api.asc_registerCallback('asc_onFocusObject',          _.bind(this.onFocusObject, this));
            this.api.asc_registerCallback('asc_onCountPages',           _.bind(this.onApiCountPages, this));
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

        },

        onParameterClick: function (value) {
            this._state.EffectType = value;
        },

        onAnimationPane: function() {

        },

        onAddAnimation: function() {

        },

        onDurationChange: function(field, newValue, oldValue, eOpts) {
            this._state.Duration = field.getNumberValue()*1000;
        },

        onDelayChange: function(field, newValue, oldValue, eOpts) {
            this._state.Delay = field.getNumberValue()*1000;
        },

        onEffectSelect: function (combo, record) {
           var type = record.get('value');
           var parameter = this._state.EffectType;

            if (this.Effect !== type)
                parameter = this.view.setMenuParameters(type);

            this._state.Effect = type;
            this.onParameterClick(parameter);

        },

        onStartSelect: function (combo, record) {

        },

        onFocusObject: function(selectedObjects) {
            var me = this;
            for (var i = 0; i<selectedObjects.length; i++) {
                var eltype = selectedObjects[i].get_ObjectType();

                if (eltype === undefined)
                    continue;

                if (eltype == Asc.c_oAscTypeSelectElement.Slide) {

                    this.loadSettings();

                    if (this._state.onactivetab) {
                        this.setLocked();
                        this.setSettings();
                    }
                }
            }
        },

        loadSettings: function () {
            this._state.Effect = !this._state.Effect ? 2 : this._state.Effect;
            this._state.EffectType = !this._state.EffectType ? this.view.setMenuParameters(this._state.Effect): this._state.EffectType;

            var value = 1000;
            if (Math.abs(this._state.Duration - value) > 0.001 ||
                (this._state.Duration === null || value === null) && (this._state.Duration !== value) ||
                (this._state.Duration === undefined || value === undefined) && (this._state.Duration !== value)) {
                this._state.Duration = value;
            }

            value = 1000;
            if (Math.abs(this._state.Delay - value) > 0.001 ||
                (this._state.Delay === null || value === null) && (this._state.Delay !== value) ||
                (this._state.Delay === undefined || value === undefined) && (this._state.Delay !== value)) {
                this._state.Delay = value;
            }

            this._state.StartSelect = 0;
        },

        onActiveTab: function(tab) {
            if (tab == 'animate') {
                this._state.onactivetab = true;
                this.setLocked();
                this.setSettings();
            }
            else this._state.onactivetab = false;
        },

        lockToolbar: function (causes, lock, opts) {
            Common.Utils.lockControls(causes, lock, opts, this.view.lockedControls);
        },

        setLocked: function() {
            if (this._state.lockedtransition != undefined)
                this.lockToolbar(PE.enumLock.transitLock, this._state.lockedtransition);
        },

        setSettings: function () {
            var me = this.view;
            var item;
            if (this._state.Effect !== undefined) {
                item = me.listEffects.store.findWhere({value: this._state.Effect});
                me.listEffects.menuPicker.selectRecord(item ? item : me.listEffects.menuPicker.items[0]);
                this.view.btnParameters.setIconCls('toolbar__icon icon ' + item.get('imageUrl'));
            }

            if (me.btnParameters.menu.items.length > 0 && this._state.EffectType !== undefined)
                me.setMenuParameters(this._state.Effect, this._state.EffectType);

            me.numDuration.setValue((this._state.Duration !== null  && this._state.Duration !== undefined) ? this._state.Duration / 1000. : '', true);
            me.numDelay.setValue((this._state.Delay !== null && this._state.Delay !== undefined) ? this._state.Delay / 1000. : '', true);
            item = me.cmbStart.store.findWhere({value: this._state.StartSelect});
            me.cmbStart.selectRecord(item ? item : me.cmbStart.items[0]);


            this.view.setWidthRow();


        }

    }, PE.Controllers.Animation || {}));
});