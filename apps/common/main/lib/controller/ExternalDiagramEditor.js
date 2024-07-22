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
    'core'
], function () { 'use strict';
    Common.Controllers.ExternalDiagramEditor = Backbone.Controller.extend(_.extend((function() {
        var appLang         = '{{DEFAULT_LANG}}',
            customization   = undefined,
            targetApp       = '',
            externalEditor  = null,
            isAppFirstOpened = true;


        var createExternalEditor = function() {
            Common.UI.HintManager.setInternalEditorLoading(true);
            !!customization && (customization.uiTheme = Common.localStorage.getItem("ui-theme-id", "theme-light"));
            externalEditor = new DocsAPI.DocEditor('id-diagram-editor-placeholder', {
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
                    mode            : 'editdiagram',
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
                    'Common.Views.ExternalDiagramEditor': {
                        'setchartdata': _.bind(this.setChartData, this),
                        'drag': _.bind(function(o, state){
                            externalEditor && externalEditor.serviceCommand('window:drag', state == 'start');
                        },this),
                        'resize': _.bind(function(o, state){
                            externalEditor && externalEditor.serviceCommand('window:resize', state == 'start');
                        },this),
                        'show': _.bind(function(cmp){
                            var h = this.diagramEditorView.getHeight(),
                                innerHeight = Common.Utils.innerHeight() - Common.Utils.InternalSettings.get('window-inactive-area-top');
                            if (innerHeight<h) {
                                this.diagramEditorView.setHeight(innerHeight);
                            }

                            if (externalEditor) {
                                externalEditor.serviceCommand('setAppDisabled',false);
                                if (isAppFirstOpened && this.diagramEditorView._isExternalDocReady) {
                                    isAppFirstOpened = false;
                                    this.diagramEditorView._chartData && this.setChartData();
                                }

                                if (this.needDisableEditing && this.diagramEditorView._isExternalDocReady) {
                                    this.onDiagrammEditingDisabled();
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
                this.views = this.getApplication().getClasseRefs('view', ['Common.Views.ExternalDiagramEditor']);
                this.diagramEditorView = this.createView('Common.Views.ExternalDiagramEditor',{handler: this.handler.bind(this)});
            },

            setApi: function(api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onCloseChartEditor', _.bind(this.onDiagrammEditingDisabled, this));
                this.api.asc_registerCallback('asc_sendFromGeneralToFrameEditor', _.bind(this.onSendFromGeneralToFrameEditor, this));
                return this;
            },

            handler: function(result, value) {
                if (this.isHandlerCalled) return;
                this.isHandlerCalled = true;
                if (this.diagramEditorView._isExternalDocReady)
                    externalEditor && externalEditor.serviceCommand('queryClose',{mr:result});
                else {
                    this.diagramEditorView.hide();
                    this.isHandlerCalled = false;
                }
            },

            setChartData: function() {
                if (!isAppFirstOpened) {
                    externalEditor && externalEditor.serviceCommand('setChartData', this.diagramEditorView._chartData);
                    this.diagramEditorView._chartData = null;
                }
            },

            loadConfig: function(data) {
                if (data && data.config) {
                    if (data.config.lang) appLang = data.config.lang;
                    if (data.config.customization) customization = data.config.customization;
                    if (data.config.targetApp) targetApp = data.config.targetApp;
                }
            },

            onDiagrammEditingDisabled: function() {
                if ( !this.diagramEditorView.isVisible() || !this.diagramEditorView._isExternalDocReady ) {
                    this.needDisableEditing = true;
                    return;
                }

                this.diagramEditorView.setControlsDisabled(true);

                Common.UI.alert({
                    title: this.warningTitle,
                    msg  : this.warningText,
                    iconCls: 'warn',
                    buttons: ['ok'],
                    callback: _.bind(function(btn){
                        this.diagramEditorView.setControlsDisabled(false);
                        this.diagramEditorView.hide();
                    }, this)
                });

                this.needDisableEditing = false;
            },

            onInternalMessage: function(data) {
                var eventData  = data.data;

                if (this.diagramEditorView) {
                    if (eventData.type == 'documentReady') {
                        this.diagramEditorView._isExternalDocReady = true;
                        this.isExternalEditorVisible && (isAppFirstOpened = false);
                        this.diagramEditorView._chartData && this.setChartData();
                        if (this.needDisableEditing) {
                            this.onDiagrammEditingDisabled();
                        }
                    } else
                    if (eventData.type == 'chartDataReady') {
                        if (this.needDisableEditing===undefined)
                            this.diagramEditorView.setControlsDisabled(false);
                    } else
                    if (eventData.type == "shortcut") {
                        if (eventData.data.key == 'escape')
                            this.diagramEditorView.hide();
                    } else
                    if (eventData.type == "canClose") {
                        if (eventData.data.answer === true) {
                            if (externalEditor) {
                                externalEditor.serviceCommand('setAppDisabled',true);
                                externalEditor.serviceCommand((eventData.data.mr == 'ok') ? 'getChartData' : 'clearChartData');
                            }
                            this.diagramEditorView.hide();
                        }
                        this.isHandlerCalled = false;
                    } else
                    if (eventData.type == "processMouse") {
                        if (eventData.data.event == 'mouse:up') {
                            this.diagramEditorView.binding.dragStop();
                            if (this.diagramEditorView.binding.resizeStop)  this.diagramEditorView.binding.resizeStop();
                        } else
                        if (eventData.data.event == 'mouse:move') {
                            var x = parseInt(this.diagramEditorView.$window.css('left')) + eventData.data.pagex,
                                y = parseInt(this.diagramEditorView.$window.css('top')) + eventData.data.pagey + 34;
                            this.diagramEditorView.binding.drag({pageX:x, pageY:y});
                            if (this.diagramEditorView.binding.resize)  this.diagramEditorView.binding.resize({pageX:x, pageY:y});
                        }
                    } else
                    if (eventData.type == "resize") {
                        var w = eventData.data.width,
                            h = eventData.data.height;
                        if (w>0 && h>0)
                            this.diagramEditorView.setInnerSize(w, h);
                    } else
                    if (eventData.type == "frameToGeneralData") {
                        this.api && this.api.asc_getInformationBetweenFrameAndGeneralEditor(eventData.data);
                    } else
                        this.diagramEditorView.fireEvent('internalmessage', this.diagramEditorView, eventData);
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
    })(), Common.Controllers.ExternalDiagramEditor || {}));
});
