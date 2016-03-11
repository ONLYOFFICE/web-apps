/**
 *  ExternalDiagramEditor.js
 *
 *  Created by Julia Radzhabova on 4/08/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

if (Common === undefined)
    var Common = {};

Common.Controllers = Common.Controllers || {};

define([
    'core',
    'common/main/lib/view/ExternalDiagramEditor'
], function () { 'use strict';
    Common.Controllers.ExternalDiagramEditor = Backbone.Controller.extend(_.extend((function() {
        var appLang         = 'en',
            customization   = undefined,
            externalEditor  = null;


        var createExternalEditor = function() {
            externalEditor = new DocsAPI.DocEditor('id-diagram-editor-placeholder', {
                width       : '100%',
                height      : '100%',
                documentType: 'spreadsheet',
                document    : {
                    url         : '_offline_',
                    permissions : {
                        edit    : true,
                        download: false
                    }
                },
                editorConfig: {
                    mode            : 'editdiagram',
                    lang            : appLang,
                    canCoAuthoring  : false,
                    canBackToFolder : false,
                    canCreateNew    : false,
                    customization   : customization,
                    user            : {id: ('uid-'+Date.now())}
                },
                events: {
                    'onReady'               : function() {},
                    'onDocumentStateChange' : function() {},
                    'onError'               : function() {},
                    'onInternalMessage'     : _.bind(this.onInternalMessage, this)
                }
            });
            Common.Gateway.on('processmouse', _.bind(this.onProcessMouse, this));
        };

        return {
            views: ['Common.Views.ExternalDiagramEditor'],

            initialize: function() {
                this.addListeners({
                    'Common.Views.ExternalDiagramEditor': {
                        'setchartdata': _.bind(this.setChartData, this),
                        'drag': _.bind(function(o, state){
                            externalEditor.serviceCommand('window:drag', state == 'start');
                        },this),
                        'show': _.bind(function(cmp){
                            var h = this.diagramEditorView.getHeight();
                            if (window.innerHeight>h && h<700 || window.innerHeight<h) {
                                h = Math.min(window.innerHeight, 700);
                                this.diagramEditorView.setHeight(h);
                            }

                            if (externalEditor) {
                                externalEditor.serviceCommand('setAppDisabled',false);
                                if (this.needDisableEditing && this.diagramEditorView._isExternalDocReady) {
                                    this.onDiagrammEditingDisabled();
                                }
                                externalEditor.attachMouseEvents();
                            } else {
                                createExternalEditor.apply(this);
                            }
                            this.isExternalEditorVisible = true;
                        }, this),
                        'hide':  _.bind(function(cmp){
                            if (externalEditor) {
                                externalEditor.detachMouseEvents();
                                this.isExternalEditorVisible = false;
                            }
                        }, this)
                    }
                });


            },

            onLaunch: function() {
                this.diagramEditorView = this.createView('Common.Views.ExternalDiagramEditor', {handler: _.bind(this.handler, this)});
            },

            setApi: function(api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onCloseChartEditor', _.bind(this.onDiagrammEditingDisabled, this));
                return this;
            },

            handler: function(result, value) {
                externalEditor.serviceCommand('queryClose',{mr:result});
                return true;
            },

            setChartData: function() {
                externalEditor && externalEditor.serviceCommand('setChartData', this.diagramEditorView._chartData);
                this.diagramEditorView._chartData = null;
            },

            loadConfig: function(data) {
                if (data && data.config) {
                    if (data.config.lang) appLang = data.config.lang;
                    if (data.config.customization) customization = data.config.customization;
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
                        this.setControlsDisabled(false);
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
                        this.diagramEditorView.setControlsDisabled(false);
                        if (this.diagramEditorView._chartData) {
                            externalEditor && externalEditor.serviceCommand('setChartData', this.diagramEditorView._chartData);
                            this.diagramEditorView._chartData = null;
                        }
                        if (this.needDisableEditing) {
                            this.onDiagrammEditingDisabled();
                        }
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
                    } else
                    if (eventData.type == "processMouse") {
                        if (eventData.data.event == 'mouse:up') {
                            this.diagramEditorView.binding.dragStop();
                        } else
                        if (eventData.data.event == 'mouse:move') {
                            var x = parseInt(this.diagramEditorView.$window.css('left')) + eventData.data.pagex,
                                y = parseInt(this.diagramEditorView.$window.css('top')) + eventData.data.pagey + 34;
                            this.diagramEditorView.binding.drag({pageX:x, pageY:y});
                        }
                    } else
                        this.diagramEditorView.fireEvent('internalmessage', this.diagramEditorView, eventData);
                }
            } ,

            onProcessMouse: function(data) {
                if (data.type == 'mouseup' && this.isExternalEditorVisible) {
                    externalEditor && externalEditor.serviceCommand('processmouse', data);
                }
            },

            warningTitle: 'Warning',
            warningText: 'The object is disabled because of editing by another user.',
            textClose: 'Close',
            textAnonymous: 'Anonymous'
        }
    })(), Common.Controllers.ExternalDiagramEditor || {}));
});
