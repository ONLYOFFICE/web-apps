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
 *  ExternalOleEditor.js
 *
 *  Created on 3/10/22
 *
 */

if (Common === undefined)
    var Common = {};

Common.Controllers = Common.Controllers || {};

define([
    'core'
], function () { 'use strict';
    Common.Controllers.ExternalOleEditor = Backbone.Controller.extend(_.extend((function() {
        var appLang         = '{{DEFAULT_LANG}}',
            customization   = undefined,
            targetApp       = '',
            externalEditor  = null,
            isAppFirstOpened = true;


        var createExternalEditor = function() {
            Common.UI.HintManager.setInternalEditorLoading(true);
            !!customization && (customization.uiTheme = Common.localStorage.getItem("ui-theme-id", "theme-light"));
            externalEditor = new DocsAPI.DocEditor('id-ole-editor-placeholder', {
                width       : '100%',
                height      : '100%',
                documentType: 'cell',
                document    : {
                    url         : '_ole_',
                    key         : 'xxxxxxxxxxxxxxxxxxxx'.replace(/[x]/g, c => {const r = Math.random() * 16 | 0; return r.toString(16);}),
                    permissions : {
                        edit    : true,
                        download: false
                    }
                },
                editorConfig: {
                    mode            : 'editole',
                    targetApp       : targetApp,
                    lang            : appLang,
                    canCoAuthoring  : false,
                    canBackToFolder : false,
                    canCreateNew    : false,
                    customization   : customization,
                    user            : {id: ('uid-'+Date.now())}
                },
                events: {
                    'onAppReady'            : function() {},
                    'onDocumentStateChange' : function() {},
                    'onError'               : function() {},
                    'onInternalMessage'     : _.bind(this.onInternalMessage, this)
                }
            });
            Common.Gateway.on('processmouse', _.bind(this.onProcessMouse, this));
        };

        return {
            views: [],

            initialize: function() {
                this.addListeners({
                    'Common.Views.ExternalOleEditor': {
                        'setoledata': _.bind(this.setOleData, this),
                        'drag': _.bind(function(o, state){
                            externalEditor && externalEditor.serviceCommand('window:drag', state == 'start');
                        },this),
                        'resize': _.bind(function(o, state){
                            externalEditor && externalEditor.serviceCommand('window:resize', state == 'start');
                        },this),
                        'animate:before': _.bind(function(){
                            if(!this.isAppFirstOpened) {
                                externalEditor && externalEditor.serviceCommand('reshow');
                            }
                        },this),
                        'show': _.bind(function(cmp){
                            var h = this.oleEditorView.getHeight(),
                                innerHeight = Common.Utils.innerHeight() - Common.Utils.InternalSettings.get('window-inactive-area-top');
                            if (innerHeight<h) {
                                this.oleEditorView.setHeight(innerHeight);
                            }

                            if (externalEditor) {
                                externalEditor.serviceCommand('setAppDisabled',false);
                                if (isAppFirstOpened && this.oleEditorView._isExternalDocReady) {
                                    isAppFirstOpened = false;
                                    this.oleEditorView._oleData && this.setOleData();
                                }

                                if (this.needDisableEditing && this.oleEditorView._isExternalDocReady) {
                                    this.onOleEditingDisabled();
                                }
                                externalEditor.attachMouseEvents();
                            } else {
                                require(['api'], function () {
                                    createExternalEditor.apply(this);
                                }.bind(this));
                            }
                            this.isExternalEditorVisible = true;
                            this.isHandlerCalled = false;
                        }, this),
                        'hide':  _.bind(function(cmp){
                            if (externalEditor) {
                                externalEditor.detachMouseEvents();
                                this.isExternalEditorVisible = false;
                            }
                            Common.UI.HintManager.setInternalEditorLoading(false);
                        }, this)
                    }
                });

                Common.NotificationCenter.on('script:loaded', _.bind(this.onPostLoadComplete, this));
            },

            onLaunch: function() {},

            onPostLoadComplete: function() {
                this.views = this.getApplication().getClasseRefs('view', ['Common.Views.ExternalOleEditor']);
                this.oleEditorView = this.createView('Common.Views.ExternalOleEditor',{handler: this.handler.bind(this)});
            },

            setApi: function(api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onCloseOleEditor', _.bind(this.onOleEditingDisabled, this));
                this.api.asc_registerCallback('asc_sendFromGeneralToOleEditor', _.bind(this.onSendFromGeneralToFrameEditor, this));
                return this;
            },

            handler: function(result, value) {
                if (this.isHandlerCalled) return;
                this.isHandlerCalled = true;
                if (this.oleEditorView._isExternalDocReady)
                    externalEditor && externalEditor.serviceCommand('queryClose',{mr:result});
                else {
                    this.oleEditorView.hide();
                    this.isHandlerCalled = false;
                }
            },

            setOleData: function() {
                if (!isAppFirstOpened) {
                    externalEditor && externalEditor.serviceCommand('setOleData', this.oleEditorView._oleData);
                    this.oleEditorView._oleData = null;
                }
            },

            loadConfig: function(data) {
                if (data && data.config) {
                    if (data.config.lang) appLang = data.config.lang;
                    if (data.config.customization) customization = data.config.customization;
                    if (data.config.targetApp) targetApp = data.config.targetApp;
                }
            },

            onOleEditingDisabled: function() {
                if ( !this.oleEditorView.isVisible() || !this.oleEditorView._isExternalDocReady ) {
                    this.needDisableEditing = true;
                    return;
                }

                this.oleEditorView.setControlsDisabled(true);

                Common.UI.alert({
                    title: this.warningTitle,
                    msg  : this.warningText,
                    iconCls: 'warn',
                    buttons: ['ok'],
                    callback: _.bind(function(btn){
                        this.oleEditorView.setControlsDisabled(false);
                        this.oleEditorView.hide();
                    }, this)
                });

                this.needDisableEditing = false;
            },

            onInternalMessage: function(data) {
                var eventData  = data.data;

                if (this.oleEditorView) {
                    if (eventData.type == 'documentReady') {
                        this.oleEditorView._isExternalDocReady = true;
                        this.isExternalEditorVisible && (isAppFirstOpened = false);
                        this.oleEditorView._oleData && this.setOleData();
                        if (this.needDisableEditing) {
                            this.onOleEditingDisabled();
                        }
                    } else
                    if (eventData.type == 'frameEditorReady') {
                        if (this.needDisableEditing===undefined)
                            this.oleEditorView.setControlsDisabled(false);
                    } else
                    if (eventData.type == "shortcut") {
                        if (eventData.data.key == 'escape')
                            this.oleEditorView.hide();
                    } else
                    if (eventData.type == "canClose") {
                        if (eventData.data.answer === true) {
                            if (externalEditor) {
                                externalEditor.serviceCommand('setAppDisabled',true);
                                if (eventData.data.mr == 'ok')
                                    externalEditor.serviceCommand('getOleData');
                            }
                            this.oleEditorView.hide();
                        }
                        this.isHandlerCalled = false;
                    } else
                    if (eventData.type == "processMouse") {
                        if (eventData.data.event == 'mouse:up') {
                            this.oleEditorView.binding.dragStop();
                            if (this.oleEditorView.binding.resizeStop)  this.oleEditorView.binding.resizeStop();
                        } else
                        if (eventData.data.event == 'mouse:move') {
                            var x = parseInt(this.oleEditorView.$window.css('left')) + eventData.data.pagex,
                                y = parseInt(this.oleEditorView.$window.css('top')) + eventData.data.pagey + 34;
                            this.oleEditorView.binding.drag({pageX:x, pageY:y});
                            if (this.oleEditorView.binding.resize)  this.oleEditorView.binding.resize({pageX:x, pageY:y});
                        }
                    }  else
                    if (eventData.type == "resize") {
                        var w = eventData.data.width,
                            h = eventData.data.height;
                        if (w>0 && h>0)
                            this.oleEditorView.setInnerSize(w, h);
                    } else
                    if (eventData.type == "frameToGeneralData") {
                        this.api && this.api.asc_getInformationBetweenFrameAndGeneralEditor(eventData.data);
                    } else
                        this.oleEditorView.fireEvent('internalmessage', this.oleEditorView, eventData);
                }
            } ,

            onProcessMouse: function(data) {
                if (data.type == 'mouseup' && this.isExternalEditorVisible) {
                    externalEditor && externalEditor.serviceCommand('processmouse', data);
                }
            },

            onSendFromGeneralToFrameEditor: function(data) {
                externalEditor && externalEditor.serviceCommand('generalToFrameData', data);
            },

            warningTitle: 'Warning',
            warningText: 'The object is disabled because of editing by another user.',
            textClose: 'Close',
            textAnonymous: 'Anonymous'
        }
    })(), Common.Controllers.ExternalOleEditor || {}));
});
