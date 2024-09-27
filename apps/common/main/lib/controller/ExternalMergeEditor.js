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
 *  ExternalDiagramEditor.js
 *
 *  Created on 4/08/14
 *
 */

if (Common === undefined)
    var Common = {};

Common.Controllers = Common.Controllers || {};

define([
    'core',
], function () { 'use strict';
    Common.Controllers.ExternalMergeEditor = Backbone.Controller.extend(_.extend((function() {
        var appLang         = '{{DEFAULT_LANG}}',
            customization   = undefined,
            targetApp       = '',
            externalEditor  = null,
            isAppFirstOpened = true;


        var createExternalEditor = function() {
            Common.UI.HintManager.setInternalEditorLoading(true);
            externalEditor = new DocsAPI.DocEditor('id-merge-editor-placeholder', {
                width       : '100%',
                height      : '100%',
                documentType: 'cell',
                document    : {
                    url         : '_chart_',
                    permissions : {
                        edit    : true,
                        download: false
                    }
                },
                editorConfig: {
                    mode            : 'editmerge',
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
                    'Common.Views.ExternalMergeEditor': {
                        'setmergedata': _.bind(this.setMergeData, this),
                        'drag': _.bind(function(o, state){
                            externalEditor && externalEditor.serviceCommand('window:drag', state == 'start');
                        },this),
                        'resize': _.bind(function(o, state){
                            externalEditor && externalEditor.serviceCommand('window:resize', state == 'start');
                        },this),
                        'show': _.bind(function(cmp){
                            var h = this.mergeEditorView.getHeight(),
                                innerHeight = Common.Utils.innerHeight();
                            if (innerHeight<h) {
                                this.mergeEditorView.setHeight(innerHeight);
                            }

                            if (externalEditor) {
                                externalEditor.serviceCommand('setAppDisabled',false);
                                if (isAppFirstOpened && this.mergeEditorView._isExternalDocReady) {
                                    isAppFirstOpened = false;
                                    this.mergeEditorView._mergeData && this.setMergeData();
                                }
                                if (this.needDisableEditing && this.mergeEditorView._isExternalDocReady) {
                                    this.onMergeEditingDisabled();
                                }
                                externalEditor.attachMouseEvents();
                            } else {
                                require(['api'], function () {
                                    createExternalEditor.apply(this);
                                }.bind(this))
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
                this.views = this.getApplication().getClasseRefs('view', ['Common.Views.ExternalMergeEditor']);
                this.mergeEditorView = this.createView('Common.Views.ExternalMergeEditor',{handler: this.handler.bind(this)});
            },

            setApi: function(api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onCloseMergeEditor', _.bind(this.onMergeEditingDisabled, this));
                this.api.asc_registerCallback('asc_sendFromGeneralToFrameEditor', _.bind(this.onSendFromGeneralToFrameEditor, this));
                return this;
            },

            handler: function(result, value) {
                if (this.isHandlerCalled) return;
                this.isHandlerCalled = true;
                if (this.mergeEditorView._isExternalDocReady)
                    externalEditor && externalEditor.serviceCommand('queryClose',{mr:result});
                else {
                    this.mergeEditorView.hide();
                    this.isHandlerCalled = false;
                }
            },

            setMergeData: function() {
                if (!isAppFirstOpened) {
                    externalEditor && externalEditor.serviceCommand('setMergeData', this.mergeEditorView._mergeData);
                    this.mergeEditorView.setEditMode(true);
                    this.mergeEditorView._mergeData = null;
                }
            },

            loadConfig: function(data) {
                if (data && data.config) {
                    if (data.config.lang) appLang = data.config.lang;
                    if (data.config.customization) customization = data.config.customization;
                    if (data.config.targetApp) targetApp = data.config.targetApp;
                }
            },

            onMergeEditingDisabled: function() {
                if ( !this.mergeEditorView.isVisible() || !this.mergeEditorView._isExternalDocReady ) {
                    this.needDisableEditing = true;
                    return;
                }

                this.mergeEditorView.setControlsDisabled(true);

                Common.UI.alert({
                    title: this.warningTitle,
                    msg  : this.warningText,
                    iconCls: 'warn',
                    buttons: ['ok'],
                    callback: _.bind(function(btn){
                        this.mergeEditorView.setControlsDisabled(false);
                        this.mergeEditorView.hide();
                    }, this)
                });

                this.needDisableEditing = false;
            },

            onInternalMessage: function(data) {
                var eventData  = data.data;

                if (this.mergeEditorView) {
                    if (eventData.type == 'documentReady') {
                        this.mergeEditorView._isExternalDocReady = true;
                        this.isExternalEditorVisible && (isAppFirstOpened = false);
                        this.mergeEditorView.setControlsDisabled(false);
                        if (this.mergeEditorView._mergeData) {
                            externalEditor && externalEditor.serviceCommand('setMergeData', this.mergeEditorView._mergeData);
                            this.mergeEditorView._mergeData = null;
                        }
                        if (this.needDisableEditing) {
                            this.onMergeEditingDisabled();
                        }
                    } else
                    if (eventData.type == "shortcut") {
                        if (eventData.data.key == 'escape')
                            this.mergeEditorView.hide();
                    } else
                    if (eventData.type == "canClose") {
                        if (eventData.data.answer === true) {
                            if (externalEditor) {
                                externalEditor.serviceCommand('setAppDisabled',true);
                                if (eventData.data.mr == 'ok')
                                externalEditor.serviceCommand('getMergeData');
                            }
                            this.mergeEditorView.hide();
                        }
                        this.isHandlerCalled = false;
                    } else
                    if (eventData.type == "processMouse") {
                        if (eventData.data.event == 'mouse:up') {
                            this.mergeEditorView.binding.dragStop();
                            if (this.mergeEditorView.binding.resizeStop)  this.mergeEditorView.binding.resizeStop();
                        } else
                        if (eventData.data.event == 'mouse:move') {
                            var x = parseInt(this.mergeEditorView.$window.css('left')) + eventData.data.pagex,
                                y = parseInt(this.mergeEditorView.$window.css('top')) + eventData.data.pagey + 34;
                            this.mergeEditorView.binding.drag({pageX:x, pageY:y});
                            if (this.mergeEditorView.binding.resize)  this.mergeEditorView.binding.resize({pageX:x, pageY:y});
                        }
                    } else
                    if (eventData.type == "resize") {
                        var w = eventData.data.width,
                            h = eventData.data.height;
                        if (w>0 && h>0)
                            this.mergeEditorView.setInnerSize(w, h);
                    } else
                    if (eventData.type == "frameToGeneralData") {
                        this.api && this.api.asc_getInformationBetweenFrameAndGeneralEditor(eventData.data);
                    } else
                        this.mergeEditorView.fireEvent('internalmessage', this.mergeEditorView, eventData);
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
    })(), Common.Controllers.ExternalMergeEditor || {}));
});
