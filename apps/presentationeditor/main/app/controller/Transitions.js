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
        sdkViewName : '#id_main',

        initialize: function () {

            this.addListeners({
                /*'FileMenu': {
                    'settings:apply': this.applySettings.bind(this),
                },*/

                'PE.Views.Transitions': {
                    'transit:preview':      _.bind(this.onPreviewClick, this),
                    'transit:parametrs':    _.bind(this.onParametrClick,this),
                    'transit:duration':     _.bind(this.onDurationChange,this),
                    'transit:applytoall':   _.bind(this.onApplyToAllClick,this),
                    'transit:selecteffect': _.bind(this.onEffectSelect, this),
                    'transit:slidenum':     _.bind(this.onHeaderChange,this)
                }
            });

        },
        onLaunch: function () {
            this._state = {};
            //this._state = {posx: -1000, posy: -1000, popoverVisible: false, previewMode: false, compareSettings: null /*new AscCommon.CComparisonPr()*/};

            //Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
         },
        setConfig: function (data, api) {
            this.setApi(api);

            if (data) {
                this.currentUserId      =   data.config.user.id;
                this.sdkViewName        =   data['sdkviewname'] || this.sdkViewName;
            }
            return this;
        },
        setApi: function (api) {
            this.api = api;
            if (api) {
                if (this.api) {
                    this.api.SetInterfaceDrawImagePlaceSlide('slide-texture-img');
                    //this.api.asc_registerCallback('asc_onInitStandartTextures', _.bind(this.onInitStandartTextures, this));
                }

            }
        },

        setMode: function(mode) {
            this.appConfig = mode;
            this.view = this.createView('PE.Views.Transitions', { mode: mode });

             return this;
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
            if ( me.view && Common.localStorage.getBool(me.view.appPrefix + "settings-spellcheck", !(config.customization && config.customization.spellcheck===false)))
                me.view.turnSpelling(true);




            if (me.view) {
                me.view.btnCommentRemove && me.view.btnCommentRemove.setDisabled(!Common.localStorage.getBool(me.view.appPrefix + "settings-livecomment", true));
                me.view.btnCommentResolve && me.view.btnCommentResolve.setDisabled(!Common.localStorage.getBool(me.view.appPrefix + "settings-livecomment", true));
            }
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
        onHeaderChange: function(type, field, newValue, oldValue, eOpts){
            if (this.api && !this._noApply)   {
                var props = this.api.asc_getHeaderFooterProperties();
                props.get_Slide()[(type=='slidenum') ? 'put_ShowSlideNum' : 'put_ShowDateTime'](field.getValue()=='checked');
                this.api.asc_setHeaderFooterProperties(props);
            }
            this.fireEvent('editcomplete', this);
        },
        onApplyToAllClick: function (){
            if (this.api) this.api.SlideTransitionApplyToAll();
        },
        onEffectSelect:function (combo, record){
            var type = record.get('value');
            if (this.Effect !== type &&
                !((this.Effect===Asc.c_oAscSlideTransitionTypes.Wipe || this.Effect===Asc.c_oAscSlideTransitionTypes.UnCover || this.Effect===Asc.c_oAscSlideTransitionTypes.Cover)&&
                    (type===Asc.c_oAscSlideTransitionTypes.Wipe || type===Asc.c_oAscSlideTransitionTypes.UnCover || type===Asc.c_oAscSlideTransitionTypes.Cover))  )
                this.view.setMenuParametrs(type);
            this.Effect = type;
            if (this.api && !this._noApply) {
                var props = new Asc.CAscSlideProps();
                var transition = new Asc.CAscSlideTransition();
                transition.put_TransitionType(type);
                transition.put_TransitionOption(this.EffectType);
                props.put_transition(transition);
                this.api.SetSlideProps(props);
            }

        }
    }, PE.Controllers.Transitions || {}));
});