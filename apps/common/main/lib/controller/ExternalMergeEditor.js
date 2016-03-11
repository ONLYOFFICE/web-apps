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
    'common/main/lib/view/ExternalMergeEditor'
], function () { 'use strict';
    Common.Controllers.ExternalMergeEditor = Backbone.Controller.extend(_.extend((function() {
        var appLang         = 'en',
            customization   = undefined,
            externalEditor  = null;


        var createExternalEditor = function() {
            externalEditor = new DocsAPI.DocEditor('id-merge-editor-placeholder', {
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
                    mode            : 'editmerge',
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
            views: ['Common.Views.ExternalMergeEditor'],

            initialize: function() {
                this.addListeners({
                    'Common.Views.ExternalMergeEditor': {
                        'setmergedata': _.bind(this.setMergeData, this),
                        'drag': _.bind(function(o, state){
                            externalEditor.serviceCommand('window:drag', state == 'start');
                        },this),
                        'show': _.bind(function(cmp){
                            var h = this.mergeEditorView.getHeight();
                            if (window.innerHeight>h && h<700 || window.innerHeight<h) {
                                h = Math.min(window.innerHeight, 700);
                                this.mergeEditorView.setHeight(h);
                            }

                            if (externalEditor) {
                                externalEditor.serviceCommand('setAppDisabled',false);
                                if (this.needDisableEditing && this.mergeEditorView._isExternalDocReady) {
                                    this.onMergeEditingDisabled();
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
                this.mergeEditorView = this.createView('Common.Views.ExternalMergeEditor', {handler: _.bind(this.handler, this)});
            },

            setApi: function(api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onCloseMergeEditor', _.bind(this.onMergeEditingDisabled, this));
                return this;
            },

            handler: function(result, value) {
                externalEditor.serviceCommand('queryClose',{mr:result});
                return true;
            },

            setMergeData: function() {
                externalEditor && externalEditor.serviceCommand('setMergeData', this.mergeEditorView._mergeData);
                this.mergeEditorView.setEditMode(true);
                this.mergeEditorView._mergeData = null;
            },

            loadConfig: function(data) {
                if (data && data.config) {
                    if (data.config.lang) appLang = data.config.lang;
                    if (data.config.customization) customization = data.config.customization;
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
                        this.setControlsDisabled(false);
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
                    } else
                    if (eventData.type == "processMouse") {
                        if (eventData.data.event == 'mouse:up') {
                            this.mergeEditorView.binding.dragStop();
                        } else
                        if (eventData.data.event == 'mouse:move') {
                            var x = parseInt(this.mergeEditorView.$window.css('left')) + eventData.data.pagex,
                                y = parseInt(this.mergeEditorView.$window.css('top')) + eventData.data.pagey + 34;
                            this.mergeEditorView.binding.drag({pageX:x, pageY:y});
                        }
                    } else
                        this.mergeEditorView.fireEvent('internalmessage', this.mergeEditorView, eventData);
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
    })(), Common.Controllers.ExternalMergeEditor || {}));
});
