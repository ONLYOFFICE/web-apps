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
                    'transit:preview':      _.bind(this.onPreviewClick, this)
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
            this.popoverChanges = new Common.Collections.ReviewChanges();
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

            /*if ( config.canReview ) {
                (new Promise(function (resolve) {
                    resolve();
                })).then(function () {
                    // function _setReviewStatus(state, global) {
                    //     me.view.turnChanges(state, global);
                    //     !global && me.api.asc_SetLocalTrackRevisions(state);
                    //     Common.Utils.InternalSettings.set(me.view.appPrefix + "track-changes", (state ? 0 : 1) + (global ? 2 : 0));
                    // };

                    /*var trackChanges = typeof (me.appConfig.customization) == 'object' ? me.appConfig.customization.trackChanges : undefined;
                    if (config.isReviewOnly || trackChanges!==undefined)
                        me.api.asc_SetLocalTrackRevisions(config.isReviewOnly || trackChanges===true);
                    else
                        me.onApiTrackRevisionsChange(me.api.asc_GetLocalTrackRevisions(), me.api.asc_GetGlobalTrackRevisions());
                    me.api.asc_HaveRevisionsChanges() && me.view.markChanges(true);

                    // _setReviewStatus(state, global);

                    if ( typeof (me.appConfig.customization) == 'object' && (me.appConfig.customization.showReviewChanges==true) ) {
                        me.dlgChanges = (new Common.Views.ReviewChangesDialog({
                            popoverChanges  : me.popoverChanges,
                            mode            : me.appConfig
                        }));
                        var sdk = $('#editor_sdk'),
                            offset = sdk.offset();
                        me.dlgChanges.show(Math.max(10, offset.left + sdk.width() - 300), Math.max(10, offset.top + sdk.height() - 150));
                    }
                });
            }*/ /*else if (config.canViewReview) {
                config.canViewReview = (config.isEdit || me.api.asc_HaveRevisionsChanges(true)); // check revisions from all users
                if (config.canViewReview) {
                    var val = Common.localStorage.getItem(me.view.appPrefix + "review-mode");
                    if (val===null)
                        val = me.appConfig.customization && /^(original|final|markup)$/i.test(me.appConfig.customization.reviewDisplay) ? me.appConfig.customization.reviewDisplay.toLocaleLowerCase() : 'original';
                    me.turnDisplayMode((config.isEdit || config.isRestrictedEdit) ? 'markup' : val); // load display mode only in viewer
                    me.view.turnDisplayMode((config.isEdit || config.isRestrictedEdit) ? 'markup' : val);
                }
            }*/

           /* if (me.view && me.view.btnChat) {
                me.getApplication().getController('LeftMenu').leftMenu.btnChat.on('toggle', function(btn, state){
                    if (state !== me.view.btnChat.pressed)
                        me.view.turnChat(state);
                });
            }*/
            if (me.view) {
                me.view.btnCommentRemove && me.view.btnCommentRemove.setDisabled(!Common.localStorage.getBool(me.view.appPrefix + "settings-livecomment", true));
                me.view.btnCommentResolve && me.view.btnCommentResolve.setDisabled(!Common.localStorage.getBool(me.view.appPrefix + "settings-livecomment", true));
            }
        },
        onPreviewClick: function()
        {
            alert("hf,jnftn");
            if (this.api) {
                alert("api");
                this.api.SlideTransitionPlay();
            }
        }
    }, PE.Controllers.Transitions || {}));
});