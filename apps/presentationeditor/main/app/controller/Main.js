/*
 *
 * (c) Copyright Ascensio System Limited 2010-2017
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
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia,
 * EU, LV-1021.
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
 *    Main.js
 *
 *    Main controller
 *
 *    Created by Julia Radzhabova on 26 March 2014
 *    Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'irregularstack',
    'common/main/lib/component/Window',
    'common/main/lib/component/LoadMask',
    'common/main/lib/component/Tooltip',
    'common/main/lib/controller/Fonts',
    'common/main/lib/collection/TextArt',
    'common/main/lib/view/OpenDialog',
    'common/main/lib/util/LocalStorage',
    'presentationeditor/main/app/collection/ShapeGroups',
    'presentationeditor/main/app/collection/SlideLayouts',
    'presentationeditor/main/app/collection/EquationGroups'
], function () { 'use strict';

    PE.Controllers.Main = Backbone.Controller.extend(_.extend((function() {
        var ApplyEditRights = -255;
        var LoadingDocument = -256;

        var mapCustomizationElements = {
            about: 'button#left-btn-about',
            feedback: 'button#left-btn-support',
            goback: '#fm-btn-back > a, #header-back > div'
        };

        var mapCustomizationExtElements = {
            toolbar: '#viewport #toolbar',
            leftMenu: '#viewport #left-menu, #viewport #id-toolbar-full-placeholder-btn-settings, #viewport #id-toolbar-short-placeholder-btn-settings',
            rightMenu: '#viewport #right-menu',
            header: '#viewport #header'
        };

        Common.localStorage.setId('presentation');
        Common.localStorage.setKeysFilter('pe-,asc.presentation');
        Common.localStorage.sync();

        return {
            models: [],
            collections: [
                'ShapeGroups',
                'SlideLayouts',
                'EquationGroups',
                'Common.Collections.TextArt'
            ],
            views: [],

            initialize: function() {
                this.addListeners({
                    'FileMenu': {
                        'settings:apply': _.bind(this.applySettings, this)
                    }
                });
            },

            onLaunch: function() {
                var me = this;

                this._state = {isDisconnected: false, usersCount: 1, fastCoauth: true, startModifyDocument: true, lostEditingRights: false, licenseWarning: false};

                window.storagename = 'presentation';

                this.stackLongActions = new Common.IrregularStack({
                    strongCompare   : function(obj1, obj2){return obj1.id === obj2.id && obj1.type === obj2.type;},
                    weakCompare     : function(obj1, obj2){return obj1.type === obj2.type;}
                });

                // Initialize viewport

                if (!Common.Utils.isBrowserSupported()){
                    Common.Utils.showBrowserRestriction();
                    Common.Gateway.reportError(undefined, this.unsupportedBrowserErrorText);
                    return;
                }

                // Initialize api

                window["flat_desine"] = true;
                this.api = new Asc.asc_docs_api({
                    'id-view'  : 'editor_sdk'
                });

                if (this.api){
                    this.api.SetDrawingFreeze(true);
                    this.api.SetThemesPath("../../../../sdkjs/slide/themes/");

                    this.api.asc_registerCallback('asc_onError',                    _.bind(this.onError, this));
                    this.api.asc_registerCallback('asc_onDocumentContentReady',     _.bind(this.onDocumentContentReady, this));
                    this.api.asc_registerCallback('asc_onOpenDocumentProgress',     _.bind(this.onOpenDocument, this));
                    this.api.asc_registerCallback('asc_onThumbnailsShow',           _.bind(this.onThumbnailsShow, this));
                    this.api.asc_registerCallback('asc_onDocumentUpdateVersion',    _.bind(this.onUpdateVersion, this));
                    this.api.asc_registerCallback('asc_onServerVersion',            _.bind(this.onServerVersion, this));
                    this.api.asc_registerCallback('asc_onDocumentName',             _.bind(this.onDocumentName, this));
                    this.api.asc_registerCallback('asc_onPrintUrl',                 _.bind(this.onPrintUrl, this));
                    this.api.asc_registerCallback('asc_onMeta',                     _.bind(this.onMeta, this));
                    this.api.asc_registerCallback('asc_onAdvancedOptions',          _.bind(this.onAdvancedOptions, this));
                    Common.NotificationCenter.on('api:disconnect',                  _.bind(this.onCoAuthoringDisconnect, this));
                    Common.NotificationCenter.on('goback',                          _.bind(this.goBack, this));

                    this.isShowOpenDialog = false;

                    // Initialize api gateway
                    this.editorConfig = {};
                    this.appOptions = {};
                    this.plugins = undefined;
                    this.UICustomizePlugins = [];
                    Common.Gateway.on('init',           _.bind(this.loadConfig, this));
                    Common.Gateway.on('showmessage',    _.bind(this.onExternalMessage, this));
                    Common.Gateway.on('opendocument',   _.bind(this.loadDocument, this));
                    Common.Gateway.ready();

                    this.getApplication().getController('Viewport').setApi(this.api);
                    this.getApplication().getController('Statusbar').setApi(me.api);

                    // Syncronize focus with api
                    $(document.body).on('focus', 'input, textarea', function(e) {
                        if (!/area_id/.test(e.target.id)) {
                            if (/msg-reply/.test(e.target.className))
                                me.dontCloseDummyComment = true;
                        }
                    });

                    $(document.body).on('blur', 'input, textarea', function(e) {
                        if (!me.isModalShowed) {
                            if (!e.relatedTarget ||
                                !/area_id/.test(e.target.id) && $(e.target).parent().find(e.relatedTarget).length<1 /* Check if focus in combobox goes from input to it's menu button or menu items */
                                && (e.relatedTarget.localName != 'input' || !/form-control/.test(e.relatedTarget.className)) /* Check if focus goes to text input with class "form-control" */
                                && (e.relatedTarget.localName != 'textarea' || /area_id/.test(e.relatedTarget.id))) /* Check if focus goes to textarea, but not to "area_id" */ {
                                me.api.asc_enableKeyEvents(true);
                                if (/msg-reply/.test(e.target.className))
                                    me.dontCloseDummyComment = false;
                            }
                        }
                    }).on('dragover', function(e) {
                        var event = e.originalEvent;
                        if (event.target && $(event.target).closest('#editor_sdk').length<1 ) {
                            event.preventDefault();
                            event.dataTransfer.dropEffect ="none";
                            return false;
                        }
                    });

                    Common.NotificationCenter.on({
                        'modal:show': function(e){
                            me.isModalShowed = true;
                            me.api.asc_enableKeyEvents(false);
                        },
                        'modal:close': function(dlg) {
                            if (dlg && dlg.$lastmodal && dlg.$lastmodal.size() < 1) {
                                me.isModalShowed = false;
                                me.api.asc_enableKeyEvents(true);
                            }
                        },
                        'modal:hide': function(dlg) {
                            if (dlg && dlg.$lastmodal && dlg.$lastmodal.size() < 1) {
                                me.isModalShowed = false;
                                me.api.asc_enableKeyEvents(true);
                            }
                        },
                        'settings:unitschanged':_.bind(this.unitsChanged, this),
                        'dataview:focus': function(e){
                        },
                        'dataview:blur': function(e){
                            if (!me.isModalShowed) {
                                me.api.asc_enableKeyEvents(true);
                            }
                        },
                        'menu:show': function(e){
                        },
                        'menu:hide': function(e){
                            if (!me.isModalShowed)
                                me.api.asc_enableKeyEvents(true);
                        },
                        'edit:complete': _.bind(me.onEditComplete, me)
                    });

                    this.initNames();
                }
            },

            loadConfig: function(data) {
                this.editorConfig = $.extend(this.editorConfig, data.config);

                this.editorConfig.user          =
                this.appOptions.user            = Common.Utils.fillUserInfo(data.config.user, this.editorConfig.lang, this.textAnonymous);
                this.appOptions.nativeApp       = this.editorConfig.nativeApp === true;
                this.appOptions.isDesktopApp    = this.editorConfig.targetApp == 'desktop';
                this.appOptions.canCreateNew    = !_.isEmpty(this.editorConfig.createUrl) && !this.appOptions.isDesktopApp;
                this.appOptions.canOpenRecent   = this.editorConfig.nativeApp !== true && this.editorConfig.recent !== undefined && !this.appOptions.isDesktopApp;
                this.appOptions.templates       = this.editorConfig.templates;
                this.appOptions.recent          = this.editorConfig.recent;
                this.appOptions.createUrl       = this.editorConfig.createUrl;
                this.appOptions.lang            = this.editorConfig.lang;
                this.appOptions.location        = (typeof (this.editorConfig.location) == 'string') ? this.editorConfig.location.toLowerCase() : '';
                this.appOptions.sharingSettingsUrl = this.editorConfig.sharingSettingsUrl;
                this.appOptions.canAnalytics    = false;
                this.appOptions.customization   = this.editorConfig.customization;
                this.appOptions.canBackToFolder = (this.editorConfig.canBackToFolder!==false) && (typeof (this.editorConfig.customization) == 'object')
                                                  && (typeof (this.editorConfig.customization.goback) == 'object') && !_.isEmpty(this.editorConfig.customization.goback.url);
                this.appOptions.canBack         = this.editorConfig.nativeApp !== true && this.appOptions.canBackToFolder === true;
                this.appOptions.canPlugins      = false;
                this.plugins                    = this.editorConfig.plugins;

                this.getApplication()
                    .getController('Viewport')
                    .getView('Common.Views.Header')
                    .setCanBack(this.appOptions.canBackToFolder === true);

                if (this.editorConfig.lang)
                    this.api.asc_setLocale(this.editorConfig.lang);

                if (this.appOptions.location == 'us' || this.appOptions.location == 'ca')
                    Common.Utils.Metric.setDefaultMetric(Common.Utils.Metric.c_MetricUnits.inch);
            },

            loadDocument: function(data) {
                this.permissions = {};
                this.document = data.doc;

                var docInfo = {};

                if (data.doc) {
                    this.permissions = $.extend(this.permissions, data.doc.permissions);

                    var _user = new Asc.asc_CUserInfo();
                    _user.put_Id(this.appOptions.user.id);
                    _user.put_FullName(this.appOptions.user.fullname);

                    docInfo = new Asc.asc_CDocInfo();
                    docInfo.put_Id(data.doc.key);
                    docInfo.put_Url(data.doc.url);
                    docInfo.put_Title(data.doc.title);
                    docInfo.put_Format(data.doc.fileType);
                    docInfo.put_VKey(data.doc.vkey);
                    docInfo.put_Options(data.doc.options);
                    docInfo.put_UserInfo(_user);
                    docInfo.put_CallbackUrl(this.editorConfig.callbackUrl);
                    docInfo.put_Token(data.doc.token);
                    //docInfo.put_OfflineApp(this.editorConfig.nativeApp === true);
                }

                this.api.asc_registerCallback('asc_onGetEditorPermissions', _.bind(this.onEditorPermissions, this));
                this.api.asc_setDocInfo(docInfo);
                this.api.asc_getEditorPermissions(this.editorConfig.licenseUrl, this.editorConfig.customerId);

                if (data.doc) {
                    this.getApplication()
                        .getController('Viewport')
                        .getView('Common.Views.Header')
                        .setDocumentCaption(data.doc.title);
                }
            },

            onProcessSaveResult: function(data) {
                this.api.asc_OnSaveEnd(data.result);
                if (data && data.result === false) {
                    Common.UI.error({
                        title: this.criticalErrorTitle,
                        msg  : _.isEmpty(data.message) ? this.errorProcessSaveResult : data.message
                    });
                }
            },

            onProcessRightsChange: function(data) {
                if (data && data.enabled === false) {
                    var me = this,
                        old_rights = this._state.lostEditingRights;
                    this._state.lostEditingRights = !this._state.lostEditingRights;
                    this.api.asc_coAuthoringDisconnect();
                    this.getApplication().getController('LeftMenu').leftMenu.getMenu('file').panels['rights'].onLostEditRights();
                    Common.NotificationCenter.trigger('api:disconnect');
                    if (!old_rights)
                        Common.UI.warning({
                            title: this.notcriticalErrorTitle,
                            maxwidth: 600,
                            msg  : _.isEmpty(data.message) ? this.warnProcessRightsChange : data.message,
                            callback: function(){
                                me._state.lostEditingRights = false;
                                me.onEditComplete();
                            }
                        });
                }
            },

            onDownloadAs: function() {
               this.api.asc_DownloadAs(Asc.c_oAscFileType.PPTX, true);
            },

            onProcessMouse: function(data) {
                if (data.type == 'mouseup') {
                    var e = document.getElementById('editor_sdk');
                    if (e) {
                        var r = e.getBoundingClientRect();
                        this.api.OnMouseUp(
                            data.x - r.left,
                            data.y - r.top
                        );
                    }
                }
            },

            goBack: function(blank) {
                 var href = this.appOptions.customization.goback.url;
                 if (blank) {
                     window.open(href, "_blank");
                 } else {
                     parent.location.href = href;
                 }
             },

            onEditComplete: function(cmp) {
                var application = this.getApplication(),
                    toolbarController = application.getController('Toolbar'),
                    toolbarView = toolbarController.getView('Toolbar');

                application.getController('DocumentHolder').getView('DocumentHolder').focus();
                if (this.api && this.api.asc_isDocumentCanSave) {
                    var cansave = this.api.asc_isDocumentCanSave(),
                        forcesave = this.appOptions.forcesave;
                    var isSyncButton = $('.btn-icon', toolbarView.btnSave.cmpEl).hasClass('btn-synch');
                    if (toolbarView.btnSave.isDisabled() !== (!cansave && !isSyncButton && !forcesave || this._state.isDisconnected || this._state.fastCoauth && this._state.usersCount>1 && !forcesave))
                        toolbarView.btnSave.setDisabled(!cansave && !isSyncButton && !forcesave || this._state.isDisconnected || this._state.fastCoauth && this._state.usersCount>1 && !forcesave);
                }
            },

            onLongActionBegin: function(type, id) {
                var action = {id: id, type: type};
                this.stackLongActions.push(action);
                this.setLongActionView(action);
            },

            onLongActionEnd: function(type, id) {
                var action = {id: id, type: type};
                this.stackLongActions.pop(action);

                this.getApplication()
                    .getController('Viewport')
                    .getView('Common.Views.Header')
                    .setDocumentCaption(this.api.asc_getDocumentName());

                this.updateWindowTitle(true);

                action = this.stackLongActions.get({type: Asc.c_oAscAsyncActionType.Information});
                if (action) {
                    this.setLongActionView(action)
                } else {
                    if (id==Asc.c_oAscAsyncAction['Save'] || id==Asc.c_oAscAsyncAction['ForceSaveButton']) {
                        if (this._state.fastCoauth && this._state.usersCount>1) {
                            var me = this;
                            if (me._state.timerSave===undefined)
                                me._state.timerSave = setInterval(function(){
                                    if ((new Date()) - me._state.isSaving>500) {
                                        clearInterval(me._state.timerSave);
                                        me.getApplication().getController('Statusbar').setStatusCaption(me.textChangesSaved, false, 3000);
                                        me._state.timerSave = undefined;
                                    }
                                }, 500);
                        } else
                            this.getApplication().getController('Statusbar').setStatusCaption(this.textChangesSaved, false, 3000);
                    } else
                        this.getApplication().getController('Statusbar').setStatusCaption('');
                }

                action = this.stackLongActions.get({type: Asc.c_oAscAsyncActionType.BlockInteraction});
                action ? this.setLongActionView(action) : this.loadMask && this.loadMask.hide();

                if ((id==Asc.c_oAscAsyncAction['Save'] || id==Asc.c_oAscAsyncAction['ForceSaveButton']) && (!this._state.fastCoauth || this._state.usersCount<2))
                    this.synchronizeChanges();

               if (type == Asc.c_oAscAsyncActionType.BlockInteraction && !((id == Asc.c_oAscAsyncAction['LoadDocumentFonts'] || id == Asc.c_oAscAsyncAction['ApplyChanges']) && this.dontCloseDummyComment )) {
                    this.onEditComplete(this.loadMask);
                    this.api.asc_enableKeyEvents(true);
                }
            },

            setLongActionView: function(action) {
                var title = '', text = '', force = false;

                switch (action.id) {
                    case Asc.c_oAscAsyncAction['Open']:
                        title   = this.openTitleText;
                        text    = this.openTextText;
                        break;

                    case Asc.c_oAscAsyncAction['Save']:
                    case Asc.c_oAscAsyncAction['ForceSaveButton']:
                        this._state.isSaving = new Date();
                        force = true;
                        title   = this.saveTitleText;
                        text    = this.saveTextText;
                        break;

                    case Asc.c_oAscAsyncAction['ForceSaveTimeout']:
                        break;

                    case Asc.c_oAscAsyncAction['LoadDocumentFonts']:
                        title   = this.loadFontsTitleText;
                        text    = this.loadFontsTextText;
                        break;

                    case Asc.c_oAscAsyncAction['LoadDocumentImages']:
                        title   = this.loadImagesTitleText;
                        text    = this.loadImagesTextText;
                        break;

                    case Asc.c_oAscAsyncAction['LoadFont']:
                        title   = this.loadFontTitleText;
                        text    = this.loadFontTextText;
                        break;

                    case Asc.c_oAscAsyncAction['LoadImage']:
                        title   = this.loadImageTitleText;
                        text    = this.loadImageTextText;
                        break;

                    case Asc.c_oAscAsyncAction['DownloadAs']:
                        title   = this.downloadTitleText;
                        text    = this.downloadTextText;
                        break;

                    case Asc.c_oAscAsyncAction['Print']:
                        title   = this.printTitleText;
                        text    = this.printTextText;
                        break;

                    case Asc.c_oAscAsyncAction['UploadImage']:
                        title   = this.uploadImageTitleText;
                        text    = this.uploadImageTextText;
                        break;

                    case Asc.c_oAscAsyncAction['LoadTheme']:
                        title   = this.loadThemeTitleText;
                        text    = this.loadThemeTextText;
                        break;

                    case Asc.c_oAscAsyncAction['ApplyChanges']:
                        title   = this.applyChangesTitleText;
                        text    = this.applyChangesTextText;
                        break;

                    case Asc.c_oAscAsyncAction['PrepareToSave']:
                        title   = this.savePreparingText;
                        text    = this.savePreparingTitle;
                        break;

                    case ApplyEditRights:
                        title   = this.txtEditingMode;
                        text    = this.txtEditingMode;
                        break;

                    case LoadingDocument:
                        title   = this.loadingDocumentTitleText;
                        text    = this.loadingDocumentTextText;
                        break;
                }

                if (action.type == Asc.c_oAscAsyncActionType['BlockInteraction']) {
                    if (!this.loadMask)
                        this.loadMask = new Common.UI.LoadMask({owner: $('#viewport')});

                    this.loadMask.setTitle(title);

                    if (!this.isShowOpenDialog)
                        this.loadMask.show();
                }
                else {
                    this.getApplication().getController('Statusbar').setStatusCaption(text, force);
                }
            },

            onApplyEditRights: function(data) {
                this.getApplication().getController('Statusbar').setStatusCaption('');

                if (data && !data.allowed) {
                    Common.UI.info({
                        title: this.requestEditFailedTitleText,
                        msg: data.message || this.requestEditFailedMessageText
                    });
                }
            },

            onDocumentContentReady: function() {
                if (this._isDocReady)
                    return;

                var me = this,
                    value;

                me._isDocReady = true;

                me.api.SetDrawingFreeze(false);
                me.hidePreloader();
                me.onLongActionEnd(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);

                value = Common.localStorage.getItem("pe-settings-zoom");
                var zf = (value!==null) ? parseInt(value) : (this.appOptions.customization && this.appOptions.customization.zoom ? parseInt(this.appOptions.customization.zoom) : -1);
                (zf == -1) ? this.api.zoomFitToPage() : ((zf == -2) ? this.api.zoomFitToWidth() : this.api.zoom(zf>0 ? zf : 100));

                function checkWarns() {
                    if (!window['AscDesktopEditor']) {
                        var tips = [];
                        Common.Utils.isIE9m && tips.push(me.warnBrowserIE9);

                        if (tips.length) me.showTips(tips);
                    }
                    document.removeEventListener('visibilitychange', checkWarns);
                }

                if (typeof document.hidden !== 'undefined' && document.hidden) {
                    document.addEventListener('visibilitychange', checkWarns);
                } else checkWarns();

                me.api.asc_registerCallback('asc_onStartAction',            _.bind(me.onLongActionBegin, me));
                me.api.asc_registerCallback('asc_onEndAction',              _.bind(me.onLongActionEnd, me));
                me.api.asc_registerCallback('asc_onCoAuthoringDisconnect',  _.bind(me.onCoAuthoringDisconnect, me));
                me.api.asc_registerCallback('asc_onPrint',                  _.bind(me.onPrint, me));

                var application = me.getApplication();
                application.getController('Viewport')
                    .getView('Common.Views.Header')
                    .setDocumentCaption(me.api.asc_getDocumentName());

                me.updateWindowTitle(true);

                value = Common.localStorage.getItem("pe-settings-inputmode");
                me.api.SetTextBoxInputMode(value!==null && parseInt(value) == 1);

                /** coauthoring begin **/
                if (me.appOptions.isEdit && !me.appOptions.isOffline && me.appOptions.canCoAuthoring) {
                    value = Common.localStorage.getItem("pe-settings-coauthmode");
                    if (value===null && Common.localStorage.getItem("pe-settings-autosave")===null &&
                        me.appOptions.customization && me.appOptions.customization.autosave===false) {
                        value = 0; // use customization.autosave only when pe-settings-coauthmode and pe-settings-autosave are null
                    }
                    me._state.fastCoauth = (value===null || parseInt(value) == 1);
                } else
                    me._state.fastCoauth = false;
                me.api.asc_SetFastCollaborative(me._state.fastCoauth);
                /** coauthoring end **/

                Common.localStorage.setItem("pe-settings-showsnaplines", me.api.get_ShowSnapLines() ? 1 : 0);

                var toolbarController           = application.getController('Toolbar'),
                    statusbarController         = application.getController('Statusbar'),
                    documentHolderController    = application.getController('DocumentHolder'),
                    fontsController             = application.getController('Common.Controllers.Fonts'),
                    rightmenuController         = application.getController('RightMenu'),
                    leftmenuController          = application.getController('LeftMenu'),
                    chatController              = application.getController('Common.Controllers.Chat'),
                    pluginsController           = application.getController('Common.Controllers.Plugins');

                leftmenuController.getView('LeftMenu').getMenu('file').loadDocument({doc:me.document});
                leftmenuController.setMode(me.appOptions).setApi(me.api).createDelayedElements();

                chatController.setApi(this.api).setMode(this.appOptions);
                application.getController('Common.Controllers.ExternalDiagramEditor').setApi(this.api).loadConfig({config:this.editorConfig, customization: this.editorConfig.customization});

                pluginsController.setApi(me.api);
                me.updatePlugins(me.plugins, false);
                me.requestPlugins('../../../../plugins.json');
                me.api.asc_registerCallback('asc_onPluginsInit', _.bind(me.updatePluginsList, me));

                documentHolderController.setApi(me.api);
                documentHolderController.createDelayedElements();
                statusbarController.createDelayedElements();

                leftmenuController.getView('LeftMenu').disableMenu('all',false);

                if (me.appOptions.canBranding)
                    me.getApplication().getController('LeftMenu').leftMenu.getMenu('about').setLicInfo(me.editorConfig.customization);

                documentHolderController.getView('DocumentHolder').setApi(me.api).on('editcomplete', _.bind(me.onEditComplete, me));
//                if (me.isThumbnailsShow) me.getMainMenu().onThumbnailsShow(me.isThumbnailsShow);
                application.getController('Viewport').getView('DocumentPreview').setApi(me.api).setMode(me.appOptions).on('editcomplete', _.bind(me.onEditComplete, me));

                if (me.appOptions.isEdit) {
                    value = Common.localStorage.getItem("pe-settings-autosave");
                    if (value===null && me.appOptions.customization && me.appOptions.customization.autosave===false)
                        value = 0;
                    value = (!me._state.fastCoauth && value!==null) ? parseInt(value) : (me.appOptions.canCoAuthoring ? 1 : 0);
                    me.api.asc_setAutoSaveGap(value);

                    if (me.appOptions.canForcesave) {// use asc_setIsForceSaveOnUserSave only when customization->forcesave = true
                        value = Common.localStorage.getItem("pe-settings-forcesave");
                        me.appOptions.forcesave = (value===null) ? me.appOptions.canForcesave : (parseInt(value)==1);
                        me.api.asc_setIsForceSaveOnUserSave(me.appOptions.forcesave);
                    }

                    if (me.needToUpdateVersion)
                        Common.NotificationCenter.trigger('api:disconnect');
                    var timer_sl = setInterval(function(){
                        if (window.styles_loaded) {
                            clearInterval(timer_sl);

                            toolbarController.createDelayedElements();

                            documentHolderController.getView('DocumentHolder').createDelayedElements();

                            me.api.asc_registerCallback('asc_onUpdateLayout',       _.bind(me.fillLayoutsStore, me)); // slide layouts loading
                            me.updateThemeColors();
                            var shapes = me.api.asc_getPropertyEditorShapes();
                            if (shapes)
                                me.fillAutoShapes(shapes[0], shapes[1]);
                            rightmenuController.createDelayedElements();

                            me.api.asc_registerCallback('asc_onFocusObject',        _.bind(me.onFocusObject, me));

                            me.fillTextArt(me.api.asc_getTextArtPreviews());
                            toolbarController.activateControls();
                            if (me.needToUpdateVersion)
                                toolbarController.onApiCoAuthoringDisconnect();
                            me.api.UpdateInterfaceState();

                            if (me.appOptions.canBrandingExt)
                                Common.NotificationCenter.trigger('document:ready', 'main');
                        }
                    }, 50);
                } else if (me.appOptions.canBrandingExt)
                    Common.NotificationCenter.trigger('document:ready', 'main');


                if (this.appOptions.canAnalytics && false)
                    Common.component.Analytics.initialize('UA-12442749-13', 'Presentation Editor');

                Common.Gateway.on('applyeditrights',        _.bind(me.onApplyEditRights, me));
                Common.Gateway.on('processsaveresult',      _.bind(me.onProcessSaveResult, me));
                Common.Gateway.on('processrightschange',    _.bind(me.onProcessRightsChange, me));
                Common.Gateway.on('processmouse',           _.bind(me.onProcessMouse, me));
                Common.Gateway.on('downloadas',             _.bind(me.onDownloadAs, me));
                
                Common.Gateway.sendInfo({mode:me.appOptions.isEdit?'edit':'view'});

                $(document).on('contextmenu', _.bind(me.onContextMenu, me));

                if (this._state.licenseWarning) {
                    value = Common.localStorage.getItem("de-license-warning");
                    value = (value!==null) ? parseInt(value) : 0;
                    var now = (new Date).getTime();
                    if (now - value > 86400000) {
                        Common.localStorage.setItem("de-license-warning", now);
                        Common.UI.info({
                            width: 500,
                            title: this.textNoLicenseTitle,
                            msg  : this.warnNoLicense,
                            buttons: [
                                {value: 'buynow', caption: this.textBuyNow},
                                {value: 'contact', caption: this.textContactUs}
                            ],
                            primary: 'buynow',
                            callback: function(btn) {
                                if (btn == 'buynow')
                                    window.open('http://www.onlyoffice.com/enterprise-edition.aspx', "_blank");
                                else if (btn == 'contact')
                                    window.open('mailto:sales@onlyoffice.com', "_blank");
                            }
                        });
                    }
                }
            },

            onOpenDocument: function(progress) {
                var elem = document.getElementById('loadmask-text');
                var proc = (progress.asc_getCurrentFont() + progress.asc_getCurrentImage())/(progress.asc_getFontsCount() + progress.asc_getImagesCount());
                proc = this.textLoadingDocument + ': ' + Math.min(Math.round(proc*100), 100) + '%';
                elem ? elem.innerHTML = proc : this.loadMask.setTitle(proc);
            },

            onEditorPermissions: function(params) {
                var licType = params.asc_getLicenseType();
                if (Asc.c_oLicenseResult.Expired === licType || Asc.c_oLicenseResult.Error === licType || Asc.c_oLicenseResult.ExpiredTrial === licType) {
                    Common.UI.warning({
                        title: this.titleLicenseExp,
                        msg: this.warnLicenseExp,
                        buttons: [],
                        closable: false
                    });
                    return;
                }

                if ( this.onServerVersion(params.asc_getBuildVersion()) ) return;

                if (params.asc_getRights() !== Asc.c_oRights.Edit)
                    this.permissions.edit = false;

                this.appOptions.isOffline      = this.api.asc_isOffline();
                this.appOptions.canLicense     = (licType === Asc.c_oLicenseResult.Success || licType === Asc.c_oLicenseResult.SuccessLimit);
                this.appOptions.isLightVersion = params.asc_getIsLight();
                /** coauthoring begin **/
                this.appOptions.canCoAuthoring = !this.appOptions.isLightVersion;
                /** coauthoring end **/
                this.appOptions.canRequestEditRights = this.editorConfig.canRequestEditRights;
                this.appOptions.canEdit        = this.permissions.edit !== false && // can edit
                                                 (this.editorConfig.canRequestEditRights || this.editorConfig.mode !== 'view'); // if mode=="view" -> canRequestEditRights must be defined
                this.appOptions.isEdit         = this.appOptions.canLicense && this.appOptions.canEdit && this.editorConfig.mode !== 'view';
                this.appOptions.canDownload    = !this.appOptions.nativeApp && this.permissions.download !== false;
                this.appOptions.canAnalytics   = params.asc_getIsAnalyticsEnable();
                this.appOptions.canComments    = (licType === Asc.c_oLicenseResult.Success || licType === Asc.c_oLicenseResult.SuccessLimit) && !((typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.comments===false);
                this.appOptions.canChat        = (licType === Asc.c_oLicenseResult.Success || licType === Asc.c_oLicenseResult.SuccessLimit) && !this.appOptions.isOffline && !((typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.chat===false);
                this.appOptions.canPrint       = (this.permissions.print !== false);
                this.appOptions.canRename      = !!this.permissions.rename;
                this.appOptions.canForcesave   = this.appOptions.isEdit && !this.appOptions.isOffline && (typeof (this.editorConfig.customization) == 'object' && !!this.editorConfig.customization.forcesave);
                this.appOptions.forcesave      = this.appOptions.canForcesave;
                this.appOptions.canEditComments= this.appOptions.isOffline || !(typeof (this.editorConfig.customization) == 'object' && this.editorConfig.customization.commentAuthorOnly);

                this._state.licenseWarning = (licType===Asc.c_oLicenseResult.Connections) && this.appOptions.canEdit && this.editorConfig.mode !== 'view';

                var headerView = this.getApplication().getController('Viewport').getView('Common.Views.Header');
                this.appOptions.canBranding  = (licType === Asc.c_oLicenseResult.Success) && (typeof this.editorConfig.customization == 'object');
                if (this.appOptions.canBranding)
                    headerView.setBranding(this.editorConfig.customization);

                params.asc_getTrial() && headerView.setDeveloperMode(true);
                this.appOptions.canRename && headerView.setCanRename(true);

                this.appOptions.canBrandingExt = params.asc_getCanBranding() && (typeof this.editorConfig.customization == 'object' || this.editorConfig.plugins);
                if (this.appOptions.canBrandingExt)
                    this.updatePlugins(this.plugins, true);

                this.applyModeCommonElements();
                this.applyModeEditorElements();

                this.api.asc_setViewMode(!this.appOptions.isEdit);

                this.api.asc_LoadDocument();

                if (!this.appOptions.isEdit) {
                    this.hidePreloader();
                    this.onLongActionBegin(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);
                }
            },

            applyModeCommonElements: function() {
                window.editor_elements_prepared = true;

                var value = Common.localStorage.getItem("pe-hidden-title");
                value = this.appOptions.isEdit && (value!==null && parseInt(value) == 1);

                var app             = this.getApplication(),
                    viewport        = app.getController('Viewport').getView('Viewport'),
                    headerView      = app.getController('Viewport').getView('Common.Views.Header'),
                    statusbarView   = app.getController('Statusbar').getView('Statusbar'),
                    documentHolder  = app.getController('DocumentHolder').getView('DocumentHolder');

                if (headerView) {
                    headerView.setHeaderCaption(this.appOptions.isEdit ? 'Presentation Editor' : 'Presentation Viewer');
                    headerView.setVisible(!this.appOptions.nativeApp && !value && !this.appOptions.isDesktopApp);
                }

                viewport && viewport.setMode(this.appOptions, true);
                statusbarView && statusbarView.setMode(this.appOptions);

                documentHolder.setMode(this.appOptions);

                this.api.asc_registerCallback('asc_onSendThemeColors', _.bind(this.onSendThemeColors, this));
                this.api.asc_registerCallback('asc_onDownloadUrl',     _.bind(this.onDownloadUrl, this));

                if (this.api) {
                    var translateChart = new Asc.asc_CChartTranslate();
                    translateChart.asc_setTitle(this.txtDiagramTitle);
                    translateChart.asc_setXAxis(this.txtXAxis);
                    translateChart.asc_setYAxis(this.txtYAxis);
                    translateChart.asc_setSeries(this.txtSeries);
                    this.api.asc_setChartTranslate(translateChart);

                    var translateArt = new Asc.asc_TextArtTranslate();
                    translateArt.asc_setDefaultText(this.txtArt);
                    this.api.asc_setTextArtTranslate(translateArt);
                }
            },

            applyModeEditorElements: function(prevmode) {
                if (this.appOptions.isEdit) {
                    var me = this,
                        application         = this.getApplication(),
                        toolbarController   = application.getController('Toolbar'),
                        rightmenuController = application.getController('RightMenu'),
                            fontsControllers    = application.getController('Common.Controllers.Fonts');

//                    me.getStore('SlideLayouts');
                    fontsControllers    && fontsControllers.setApi(me.api);
                    toolbarController   && toolbarController.setApi(me.api);

                    /** coauthoring begin **/
                    var commentsController  = application.getController('Common.Controllers.Comments');
                    if (commentsController) {
                        commentsController.setMode(this.appOptions);
                        commentsController.setConfig({config: me.editorConfig}, me.api);
                    }
                    /** coauthoring end **/
                    rightmenuController && rightmenuController.setApi(me.api);

                    var viewport = this.getApplication().getController('Viewport').getView('Viewport');

                    viewport.applyEditorMode();

                    var toolbarView = (toolbarController) ? toolbarController.getView('Toolbar') : null;

                    _.each([
                        toolbarView,
                        rightmenuController.getView('RightMenu')
                    ], function(view) {
                        if (view) {
                            view.setApi(me.api);
                            view.on('editcomplete', _.bind(me.onEditComplete, me));
                            view.setMode(me.appOptions);
                        }
                    });

                    if (toolbarView) {
                        toolbarView.on('insertimage', _.bind(me.onInsertImage, me));
                        toolbarView.on('inserttable', _.bind(me.onInsertTable, me));
                        toolbarView.on('insertshape', _.bind(me.onInsertShape, me));
                        toolbarView.on('insertchart', _.bind(me.onInsertChart, me));
                        toolbarView.on('inserttextart', _.bind(me.onInsertTextArt, me));
                    }

                    var value = Common.localStorage.getItem('pe-settings-unit');
                    value = (value!==null) ? parseInt(value) : Common.Utils.Metric.getDefaultMetric();
                    Common.Utils.Metric.setCurrentMetric(value);
                    me.api.asc_SetDocumentUnits((value==Common.Utils.Metric.c_MetricUnits.inch) ? Asc.c_oAscDocumentUnits.Inch : ((value==Common.Utils.Metric.c_MetricUnits.pt) ? Asc.c_oAscDocumentUnits.Point : Asc.c_oAscDocumentUnits.Millimeter));

                    value = Common.localStorage.getItem('pe-hidden-rulers');
                    if (me.api.asc_SetViewRulers) me.api.asc_SetViewRulers(value===null || parseInt(value) === 0);

                    me.api.asc_registerCallback('asc_onChangeObjectLock',        _.bind(me._onChangeObjectLock, me));
                    me.api.asc_registerCallback('asc_onDocumentModifiedChanged', _.bind(me.onDocumentModifiedChanged, me));
                    me.api.asc_registerCallback('asc_onDocumentCanSaveChanged',  _.bind(me.onDocumentCanSaveChanged, me));
                    me.api.asc_registerCallback('asc_onSaveUrl',                 _.bind(me.onSaveUrl, me));
                    /** coauthoring begin **/
                    me.api.asc_registerCallback('asc_onCollaborativeChanges',    _.bind(me.onCollaborativeChanges, me));
                    me.api.asc_registerCallback('asc_OnTryUndoInFastCollaborative',_.bind(me.onTryUndoInFastCollaborative, me));
                    me.api.asc_registerCallback('asc_onAuthParticipantsChanged', _.bind(me.onAuthParticipantsChanged, me));
                    me.api.asc_registerCallback('asc_onParticipantsChanged',     _.bind(me.onAuthParticipantsChanged, me));
                    /** coauthoring end **/

                    if (me.stackLongActions.exist({id: ApplyEditRights, type: Asc.c_oAscAsyncActionType['BlockInteraction']})) {
                        me.onLongActionEnd(Asc.c_oAscAsyncActionType['BlockInteraction'], ApplyEditRights);
                    } else if (!this._isDocReady) {
                        me.hidePreloader();
                        me.onLongActionBegin(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);
                    }

                    // Message on window close
                    window.onbeforeunload = _.bind(me.onBeforeUnload, me);
                    window.onunload = _.bind(me.onUnload, me);
                }
            },

            onExternalMessage: function(msg) {
                if (msg && msg.msg) {
                    msg.msg = (msg.msg).toString();
                    this.showTips([msg.msg.charAt(0).toUpperCase() + msg.msg.substring(1)]);

                    Common.component.Analytics.trackEvent('External Error', msg.title);
                }
            },

            onError: function(id, level, errData) {
                this.hidePreloader();
                this.onLongActionEnd(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);

                var config = {
                    closable: false
                };

                switch (id)
                {
                    case Asc.c_oAscError.ID.Unknown:
                        config.msg = this.unknownErrorText;
                        break;

                    case Asc.c_oAscError.ID.ConvertationTimeout:
                        config.msg = this.convertationTimeoutText;
                        break;

                    case Asc.c_oAscError.ID.ConvertationOpenError:
                        config.msg = this.openErrorText;
                        break;

                    case Asc.c_oAscError.ID.ConvertationSaveError:
                        config.msg = this.saveErrorText;
                        break;

                    case Asc.c_oAscError.ID.DownloadError:
                        config.msg = this.downloadErrorText;
                        break;

                    case Asc.c_oAscError.ID.UplImageSize:
                        config.msg = this.uploadImageSizeMessage;
                        break;

                    case Asc.c_oAscError.ID.UplImageExt:
                        config.msg = this.uploadImageExtMessage;
                        break;

                    case Asc.c_oAscError.ID.UplImageFileCount:
                        config.msg = this.uploadImageFileCountMessage;
                        break;

                    case Asc.c_oAscError.ID.SplitCellMaxRows:
                        config.msg = this.splitMaxRowsErrorText.replace('%1', errData.get_Value());
                        break;

                    case Asc.c_oAscError.ID.SplitCellMaxCols:
                        config.msg = this.splitMaxColsErrorText.replace('%1', errData.get_Value());
                        break;

                    case Asc.c_oAscError.ID.SplitCellRowsDivider:
                        config.msg = this.splitDividerErrorText.replace('%1', errData.get_Value());
                        break;

                    case Asc.c_oAscError.ID.VKeyEncrypt:
                        config.msg = this.errorToken;
                        break;

                    case Asc.c_oAscError.ID.KeyExpire:
                        config.msg = this.errorTokenExpire;
                        break;

                    case Asc.c_oAscError.ID.UserCountExceed:
                        config.msg = this.errorUsersExceed;
                        break;

                    case Asc.c_oAscError.ID.CoAuthoringDisconnect:
                        config.msg = this.errorViewerDisconnect;
                        break;

                    case Asc.c_oAscError.ID.ConvertationPassword:
                        config.msg = this.errorFilePassProtect;
                        break;

                    case Asc.c_oAscError.ID.StockChartError:
                        config.msg = this.errorStockChart;
                        break;

                    case Asc.c_oAscError.ID.DataRangeError:
                        config.msg = this.errorDataRange;
                        break;

                    case Asc.c_oAscError.ID.Database:
                        config.msg = this.errorDatabaseConnection;
                        break;

                    case Asc.c_oAscError.ID.UserDrop:
                        if (this._state.lostEditingRights) {
                            this._state.lostEditingRights = false;
                            return;
                        }
                        this._state.lostEditingRights = true;
                        config.msg = this.errorUserDrop;
                        break;

                    case Asc.c_oAscError.ID.Warning:
                        config.msg = this.errorConnectToServer;
                        break;

                    case Asc.c_oAscError.ID.SessionAbsolute:
                        config.msg = this.errorSessionAbsolute;
                        break;

                    case Asc.c_oAscError.ID.SessionIdle:
                        config.msg = this.errorSessionIdle;
                        break;

                    case Asc.c_oAscError.ID.SessionToken:
                        config.msg = this.errorSessionToken;
                        break;

                    case Asc.c_oAscError.ID.AccessDeny:
                        config.msg = this.errorAccessDeny;
                        break;

                    default:
                        config.msg = this.errorDefaultMessage.replace('%1', id);
                        break;
                }


                if (level == Asc.c_oAscError.Level.Critical) {

                    // report only critical errors
                    Common.Gateway.reportError(id, config.msg);

                    config.title = this.criticalErrorTitle;
                    config.iconCls = 'error';

                    if (this.appOptions.canBackToFolder) {
                        config.msg += '<br/><br/>' + this.criticalErrorExtText;
                        config.fn = function(btn) {
                            if (btn == 'ok') {
                                Common.NotificationCenter.trigger('goback');
                            }
                        }
                    }
                }
                else {
                    config.title    = this.notcriticalErrorTitle;
                    config.iconCls  = 'warn';
                    config.buttons  = ['ok'];
                    config.callback = _.bind(function(btn){
                        if (id == Asc.c_oAscError.ID.Warning && btn == 'ok' && this.appOptions.canDownload) {
                            Common.UI.Menu.Manager.hideAll();
                            (this.appOptions.isDesktopApp && this.appOptions.isOffline) ? this.api.asc_DownloadAs() : this.getApplication().getController('LeftMenu').leftMenu.showMenu('file:saveas');
                        }
                        this._state.lostEditingRights = false;
                        this.onEditComplete();
                    }, this);
                }

                Common.UI.alert(config);

                Common.component.Analytics.trackEvent('Internal Error', id.toString());
            },

            onCoAuthoringDisconnect: function() {
                // TODO: Disable all except 'Download As' and 'Print'
                this.getApplication().getController('Viewport').getView('Viewport').setMode({isDisconnected:true});
                this.getApplication().getController('Viewport').getView('Common.Views.Header').setCanRename(false);
                this.appOptions.canRename = false;
                this._state.isDisconnected = true;
//                this.getFileMenu().setMode({isDisconnected:true});
            },

            showTips: function(strings) {
                var me = this;
                if (!strings.length) return;
                if (typeof(strings)!='object') strings = [strings];

//                var top_elem = Ext.ComponentQuery.query('petoolbar');
//                !top_elem.length && (top_elem = Ext.select('.common-header').first()) || (top_elem = top_elem[0].getEl());
//
                function showNextTip() {
                    var str_tip = strings.shift();
                    if (str_tip) {
                        str_tip += '\n' + me.textCloseTip;
                        tooltip.setTitle(str_tip);
                        tooltip.show();
                    }
                }

                if (!this.tooltip) {
                    this.tooltip = new Common.UI.Tooltip({
                        owner: this.getApplication().getController('Toolbar').getView('Toolbar'),
                        hideonclick: true,
                        placement: 'bottom',
                        cls: 'main-info',
                        offset: 30
                    });
                }

                var tooltip = this.tooltip;
                tooltip.on('tooltip:hide', function(){
                    setTimeout(showNextTip, 300);
                });

                showNextTip();
            },

            updateWindowTitle: function(force) {
                var isModified = this.api.isDocumentModified();
                if (this._state.isDocModified !== isModified || force) {
                    var title = this.defaultTitleText;

                    var headerView = this.getApplication()
                        .getController('Viewport')
                        .getView('Common.Views.Header');

                    if (!_.isEmpty(headerView.getDocumentCaption()))
                        title = headerView.getDocumentCaption() + ' - ' + title;

                    if (isModified) {
                        if (!_.isUndefined(title) && (!this._state.fastCoauth || this._state.usersCount<2 )) {
                            title = '* ' + title;
                            headerView.setDocumentCaption(headerView.getDocumentCaption() + '*', true);
                        }
                    } else {
                        headerView.setDocumentCaption(headerView.getDocumentCaption());
                    }

                    if (window.document.title != title)
                        window.document.title = title;

                    if (!this._state.fastCoauth || this._state.usersCount<2 ) {
                        Common.Gateway.setDocumentModified(isModified);
                        if (isModified)
                            this.getApplication().getController('Statusbar').setStatusCaption('', true);
                    } else if ( this._state.startModifyDocument!==undefined && this._state.startModifyDocument === isModified){
                        Common.Gateway.setDocumentModified(isModified);
                        this._state.startModifyDocument = (this._state.startModifyDocument) ? !this._state.startModifyDocument : undefined;
                    }

                    this._state.isDocModified = isModified;
                }
            },

            onDocumentChanged: function() {
            },

            onDocumentModifiedChanged: function() {
                if (this._state.fastCoauth && this._state.usersCount>1 && this._state.startModifyDocument===undefined ) return;

                var isModified = this.api.asc_isDocumentCanSave();
                if (this._state.isDocModified !== isModified) {
                    Common.Gateway.setDocumentModified(this.api.isDocumentModified());
                }

                this.updateWindowTitle();

                var toolbarView = this.getApplication().getController('Toolbar').getView('Toolbar');
                if (toolbarView) {
                    var isSyncButton = $('.btn-icon', toolbarView.btnSave.cmpEl).hasClass('btn-synch'),
                        forcesave = this.appOptions.forcesave;
                    if (toolbarView.btnSave.isDisabled() !== (!isModified && !isSyncButton && !forcesave || this._state.isDisconnected || this._state.fastCoauth && this._state.usersCount>1 && !forcesave))
                        toolbarView.btnSave.setDisabled(!isModified && !isSyncButton && !forcesave || this._state.isDisconnected || this._state.fastCoauth && this._state.usersCount>1 && !forcesave);
                }
            },
            onDocumentCanSaveChanged: function (isCanSave) {
                var application = this.getApplication(),
                    toolbarController = application.getController('Toolbar'),
                    toolbarView = toolbarController.getView('Toolbar');
                if (toolbarView) {
                    var isSyncButton = $('.btn-icon', toolbarView.btnSave.cmpEl).hasClass('btn-synch'),
                        forcesave = this.appOptions.forcesave;
                    if (toolbarView.btnSave.isDisabled() !== (!isCanSave && !isSyncButton && !forcesave || this._state.isDisconnected || this._state.fastCoauth && this._state.usersCount>1 && !forcesave))
                        toolbarView.btnSave.setDisabled(!isCanSave && !isSyncButton && !forcesave || this._state.isDisconnected || this._state.fastCoauth && this._state.usersCount>1 && !forcesave);
                }
            },

            onContextMenu: function(event){
                var canCopyAttr = event.target.getAttribute('data-can-copy'),
                    isInputEl   = (event.target instanceof HTMLInputElement) || (event.target instanceof HTMLTextAreaElement);

                if ((isInputEl && canCopyAttr === 'false') ||
                    (!isInputEl && canCopyAttr !== 'true')) {
                    event.stopPropagation();
                    event.preventDefault();
                    return false;
                }
            },

            onBeforeUnload: function() {
                Common.localStorage.save();

                if (this.api.isDocumentModified()) {
                    var me = this;
                    this.api.asc_stopSaving();
                    this.continueSavingTimer = window.setTimeout(function() {
                        me.api.asc_continueSaving();
                    }, 500);

                    return this.leavePageText;
                }
            },

            onUnload: function() {
                if (this.continueSavingTimer) clearTimeout(this.continueSavingTimer);
            },

            hidePreloader: function() {
                if (!this._state.customizationDone) {
                    this._state.customizationDone = true;
                    if (this.appOptions.customization) {
                        if (this.appOptions.isDesktopApp)
                            this.appOptions.customization.about = false;
                        else if (!this.appOptions.canBrandingExt)
                            this.appOptions.customization.about = true;
                    }
                    Common.Utils.applyCustomization(this.appOptions.customization, mapCustomizationElements);
                    if (this.appOptions.canBrandingExt) {
                        Common.Utils.applyCustomization(this.appOptions.customization, mapCustomizationExtElements);
                        Common.Utils.applyCustomizationPlugins(this.UICustomizePlugins);
                    }
                }

                Common.NotificationCenter.trigger('layout:changed', 'main');
                $('#loading-mask').hide().remove();
            },

            onSaveUrl: function(url) {
                Common.Gateway.save(url);
            },

            onDownloadUrl: function(url) {
                Common.Gateway.downloadAs(url);
            },

            onUpdateVersion: function(callback) {
                var me = this;
                me.needToUpdateVersion = true;
                me.onLongActionEnd(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);
                Common.UI.error({
                    msg: this.errorUpdateVersion,
                    callback: function() {
                        _.defer(function() {
                            Common.Gateway.updateVersion();
                            if (callback) callback.call(me);
                            me.onLongActionBegin(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);
                        })
                    }
                });
            },

            onServerVersion: function(buildVersion) {
                if (this.changeServerVersion) return true;

                if (DocsAPI.DocEditor.version() !== buildVersion && !window.compareVersions) {
                    this.changeServerVersion = true;
                    Common.UI.warning({
                        title: this.titleServerVersion,
                        msg: this.errorServerVersion,
                        callback: function() {
                            _.defer(function() {
                                Common.Gateway.updateVersion();
                            })
                        }
                    });
                    return true;
                }
                return false;
            },

            /** coauthoring begin **/
            fillUserStore: function(users){
                if (!_.isEmpty(users)){
                    var userStore = this.getCommonStoreUsersStore();

                    if (userStore)
                        userStore.add(users);
                }
            },

            onCollaborativeChanges: function() {
                if (this._state.hasCollaborativeChanges) return;
                this._state.hasCollaborativeChanges = true;
                if (this.appOptions.isEdit)
                    this.getApplication().getController('Statusbar').setStatusCaption(this.txtNeedSynchronize, true);
            },
            /** coauthoring end **/

            synchronizeChanges: function() {
                this.getApplication().getController('Statusbar').setStatusCaption('');
                this.getApplication().getController('DocumentHolder').getView('DocumentHolder').hideTips();
                /** coauthoring begin **/
                this.getApplication().getController('Toolbar').getView('Toolbar').synchronizeChanges();
                /** coauthoring end **/
                this._state.hasCollaborativeChanges = false;
            },

            initNames: function() {
                this.shapeGroupNames = [
                    this.txtBasicShapes,
                    this.txtFiguredArrows,
                    this.txtMath,
                    this.txtCharts,
                    this.txtStarsRibbons,
                    this.txtCallouts,
                    this.txtButtons,
                    this.txtRectangles,
                    this.txtLines
                ];

                this.layoutNames = [
                    this.txtSldLtTBlank, this.txtSldLtTChart, this.txtSldLtTChartAndTx, this.txtSldLtTClipArtAndTx,
                    this.txtSldLtTClipArtAndVertTx, this.txtSldLtTCust, this.txtSldLtTDgm, this.txtSldLtTFourObj,
                    this.txtSldLtTMediaAndTx, this.txtSldLtTObj, this.txtSldLtTObjAndTwoObj, this.txtSldLtTObjAndTx,
                    this.txtSldLtTObjOnly, this.txtSldLtTObjOverTx, this.txtSldLtTObjTx, this.txtSldLtTPicTx,
                    this.txtSldLtTSecHead, this.txtSldLtTTbl, this.txtSldLtTTitle, this.txtSldLtTTitleOnly,
                    this.txtSldLtTTwoColTx, this.txtSldLtTTwoObj, this.txtSldLtTTwoObjAndObj, this.txtSldLtTTwoObjAndTx,
                    this.txtSldLtTTwoObjOverTx, this.txtSldLtTTwoTxTwoObj, this.txtSldLtTTx, this.txtSldLtTTxAndChart,
                    this.txtSldLtTTxAndClipArt, this.txtSldLtTTxAndMedia, this.txtSldLtTTxAndObj,
                    this.txtSldLtTTxAndTwoObj, this.txtSldLtTTxOverObj, this.txtSldLtTVertTitleAndTx,
                    this.txtSldLtTVertTitleAndTxOverChart, this.txtSldLtTVertTx
                ];
            },

            onInsertTable:  function() {
                this.getApplication().getController('RightMenu').onInsertTable();
            },

            onInsertImage:  function() {
                this.getApplication().getController('RightMenu').onInsertImage();
            },

            onInsertChart:  function() {
                this.getApplication().getController('RightMenu').onInsertChart();
            },

            onInsertShape:  function() {
                this.getApplication().getController('RightMenu').onInsertShape();
            },

            onInsertTextArt:  function() {
                this.getApplication().getController('RightMenu').onInsertTextArt();
            },

            unitsChanged: function(m) {
                var value = Common.localStorage.getItem("pe-settings-unit");
                value = (value!==null) ? parseInt(value) : Common.Utils.Metric.getDefaultMetric();
                Common.Utils.Metric.setCurrentMetric(value);
                this.api.asc_SetDocumentUnits((value==Common.Utils.Metric.c_MetricUnits.inch) ? Asc.c_oAscDocumentUnits.Inch : ((value==Common.Utils.Metric.c_MetricUnits.pt) ? Asc.c_oAscDocumentUnits.Point : Asc.c_oAscDocumentUnits.Millimeter));
                this.getApplication().getController('RightMenu').updateMetricUnit();
            },

            updateThemeColors: function() {
                var me = this;
                setTimeout(function(){
                    me.getApplication().getController('RightMenu').UpdateThemeColors();
                }, 50);

                setTimeout(function(){
                    me.getApplication().getController('Toolbar').updateThemeColors();
                }, 50);
            },

            onSendThemeColors: function(colors, standart_colors) {
                Common.Utils.ThemeColor.setColors(colors, standart_colors);
                if (window.styles_loaded) {
                    this.updateThemeColors();
                    this.fillTextArt(this.api.asc_getTextArtPreviews());
                }
            },

            onFocusObject: function(SelectedObjects) {
                    var rightpan = this.getApplication().getController('RightMenu');
                    if (rightpan) rightpan.onFocusObject.call(rightpan, SelectedObjects);
            },

            _onChangeObjectLock: function() {
                var elements = this.api.getSelectedElements();
                this.onFocusObject(elements);
                this.getApplication().getController('Toolbar')._onFocusObject(elements);
            },

            onThumbnailsShow: function(isShow) {
                this.isThumbnailsShow = isShow;
            },

            fillAutoShapes: function(groupNames, shapes){
                if (_.isEmpty(shapes) || _.isEmpty(groupNames) || shapes.length != groupNames.length)
                    return;

                var me = this,
                    shapegrouparray = [],
                    shapeStore = this.getCollection('ShapeGroups');

                shapeStore.reset();

                var groupscount = groupNames.length;
                _.each(groupNames, function(groupName, index){
                    var store = new Backbone.Collection([], {
                        model: PE.Models.ShapeModel
                    });

                    var cols = (shapes[index].length) > 18 ? 7 : 6,
                        height = Math.ceil(shapes[index].length/cols) * 35 + 3,
                        width = 30 * cols;

                    _.each(shapes[index], function(shape, idx){
                        store.add({
                            imageUrl : shape.Image,
                            data     : {shapeType: shape.Type},
                            tip      : me.textShape + ' ' + (idx+1),
                            allowSelected : true,
                            selected: false
                        });
                    });

                    shapegrouparray.push({
                        groupName   : me.shapeGroupNames[index],
                        groupStore  : store,
                        groupWidth  : width,
                        groupHeight : height
                    });
                });

                shapeStore.add(shapegrouparray);

                setTimeout(function(){
                    me.getApplication().getController('Toolbar').fillAutoShapes();
                }, 50);
            },

            fillLayoutsStore: function(layouts){
                var me = this;
                if (!_.isEmpty(layouts)){
                    var layoutStore = this.getCollection('SlideLayouts');
                    if (layoutStore) {
                        var layoutarray = [];
                        _.each(layouts, function(layout){
                            var name = layout.get_Name();
                            layoutarray.push({
                                imageUrl    : layout.get_Image(),
                                title       : (name !== '') ? name : me.layoutNames[layout.getType()],
                                itemWidth   : layout.get_Width(),
                                itemHeight  : layout.get_Height(),
                                data        : {
                                    type    : layout.getType(),
                                    idx     : layout.getIndex()
                                },
                                allowSelected : true,
                                selected    : false
                            });
                        });
                        layoutStore.reset(layoutarray);
                    }
                }
            },

            fillTextArt: function(shapes){
                if (_.isEmpty(shapes)) return;

                var me = this, arr = [],
                    artStore = this.getCollection('Common.Collections.TextArt');

                _.each(shapes, function(shape, index){
                    arr.push({
                        imageUrl : shape,
                        data     : index,
                        allowSelected : true,
                        selected: false
                    });
                });
                artStore.reset(arr);

                setTimeout(function(){
                    me.getApplication().getController('Toolbar').fillTextArt();
                }, 50);

                setTimeout(function(){
                    me.getApplication().getController('RightMenu').fillTextArt();
                }, 50);

            },

            onTryUndoInFastCollaborative: function() {
                var val = window.localStorage.getItem("pe-hide-try-undoredo");
                if (!(val && parseInt(val) == 1))
                    Common.UI.info({
                        width: 500,
                        msg: this.textTryUndoRedo,
                        iconCls: 'info',
                        buttons: ['custom', 'cancel'],
                        primary: 'custom',
                        customButtonText: this.textStrict,
                        dontshow: true,
                        callback: _.bind(function(btn, dontshow){
                            if (dontshow) window.localStorage.setItem("pe-hide-try-undoredo", 1);
                            if (btn == 'custom') {
                                Common.localStorage.setItem("pe-settings-coauthmode", 0);
                                this.api.asc_SetFastCollaborative(false);
                                this._state.fastCoauth = false;
                            }
                            this.onEditComplete();
                        }, this)
                    });
            },

            onAuthParticipantsChanged: function(users) {
                var length = 0;
                _.each(users, function(item){
                    if (!item.asc_getView())
                        length++;
                });
                this._state.usersCount = length;
            },

            applySettings: function() {
                if (this.appOptions.isEdit && !this.appOptions.isOffline && this.appOptions.canCoAuthoring) {
                    var value = Common.localStorage.getItem("pe-settings-coauthmode"),
                        oldval = this._state.fastCoauth;
                    this._state.fastCoauth = (value===null || parseInt(value) == 1);
                    if (this._state.fastCoauth && !oldval)
                        this.synchronizeChanges();
                }
                if (this.appOptions.canForcesave) {
                    value = Common.localStorage.getItem("pe-settings-forcesave");
                    this.appOptions.forcesave = (value===null) ? this.appOptions.canForcesave : (parseInt(value)==1);
                    this.api.asc_setIsForceSaveOnUserSave(this.appOptions.forcesave);
                }
            },

            onDocumentName: function(name) {
                this.getApplication().getController('Viewport').getView('Common.Views.Header').setDocumentCaption(name);
                this.updateWindowTitle(true);
            },

            onMeta: function(meta) {
                var app = this.getApplication(),
                    filemenu = app.getController('LeftMenu').getView('LeftMenu').getMenu('file');
                app.getController('Viewport').getView('Common.Views.Header').setDocumentCaption(meta.title);
                this.updateWindowTitle(true);
                this.document.title = meta.title;
                filemenu.loadDocument({doc:this.document});
                filemenu.panels['info'].updateInfo(this.document);
                Common.Gateway.metaChange(meta);
            },

            onPrint: function() {
                if (!this.appOptions.canPrint) return;
                
                if (this.api)
                    this.api.asc_Print(Common.Utils.isChrome || Common.Utils.isSafari || Common.Utils.isOpera); // if isChrome or isSafari or isOpera == true use asc_onPrintUrl event
                Common.component.Analytics.trackEvent('Print');
            },

            onPrintUrl: function(url) {
                if (this.iframePrint) {
                    this.iframePrint.parentNode.removeChild(this.iframePrint);
                    this.iframePrint = null;
                }
                if (!this.iframePrint) {
                    var me = this;
                    this.iframePrint = document.createElement("iframe");
                    this.iframePrint.id = "id-print-frame";
                    this.iframePrint.style.display = 'none';
                    this.iframePrint.style.visibility = "hidden";
                    this.iframePrint.style.position = "fixed";
                    this.iframePrint.style.right = "0";
                    this.iframePrint.style.bottom = "0";
                    document.body.appendChild(this.iframePrint);
                    this.iframePrint.onload = function() {
                        me.iframePrint.contentWindow.focus();
                        me.iframePrint.contentWindow.print();
                        me.iframePrint.contentWindow.blur();
                        window.focus();
                    };
                }
                if (url) this.iframePrint.src = url;
            },

            onAdvancedOptions: function(advOptions) {
                var type = advOptions.asc_getOptionId(),
                    me = this, dlg;
                if (type == Asc.c_oAscAdvancedOptionsID.DRM) {
                    dlg = new Common.Views.OpenDialog({
                        type: type,
                        handler: function (value) {
                            me.isShowOpenDialog = false;
                            if (me && me.api) {
                                me.api.asc_setAdvancedOptions(type, new Asc.asc_CDRMAdvancedOptions(value));
                                me.loadMask && me.loadMask.show();
                            }
                        }
                    });
                }
                if (dlg) {
                    this.isShowOpenDialog = true;
                    this.loadMask && this.loadMask.hide();
                    this.onLongActionEnd(Asc.c_oAscAsyncActionType.BlockInteraction, LoadingDocument);
                    dlg.show();
                }
            },

            requestPlugins: function(pluginsPath) { // request plugins
                if (!pluginsPath) return;

                var _createXMLHTTPObject = function() {
                    var xmlhttp;
                    try {
                        xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
                    }
                    catch (e) {
                        try {
                            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
                        }
                        catch (E) {
                            xmlhttp = false;
                        }
                    }
                    if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
                        xmlhttp = new XMLHttpRequest();
                    }
                    return xmlhttp;
                };

                var _getPluginJson = function(plugin) {
                    if (!plugin) return '';
                    try {
                        var xhrObj = _createXMLHTTPObject();
                        if (xhrObj && plugin) {
                            xhrObj.open('GET', plugin, false);
                            xhrObj.send('');
                            var pluginJson = eval("(" + xhrObj.responseText + ")");
                            return pluginJson;
                        }
                    }
                    catch (e) {}
                    return null;
                };

                var value = _getPluginJson(pluginsPath);
                if (value)
                    this.updatePlugins(value, false);
            },


            updatePlugins: function(plugins, uiCustomize) { // plugins from config
                if (!plugins) return;

                var pluginsData = (uiCustomize) ? plugins.UIpluginsData : plugins.pluginsData;
                if (!pluginsData || pluginsData.length<1) return;

                var _createXMLHTTPObject = function() {
                    var xmlhttp;
                    try {
                        xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
                    }
                    catch (e) {
                        try {
                            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
                        }
                        catch (E) {
                            xmlhttp = false;
                        }
                    }
                    if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
                        xmlhttp = new XMLHttpRequest();
                    }
                    return xmlhttp;
                };

                var _getPluginJson = function(plugin) {
                    if (!plugin) return '';
                    try {
                        var xhrObj = _createXMLHTTPObject();
                        if (xhrObj && plugin) {
                            xhrObj.open('GET', plugin, false);
                            xhrObj.send('');
                            var pluginJson = eval("(" + xhrObj.responseText + ")");
                            return pluginJson;
                        }
                    }
                    catch (e) {}
                    return null;
                };

                var arr = [],
                    baseUrl = _.isEmpty(plugins.url) ? "" : plugins.url;

                if (baseUrl !== "")
                    console.log("Obsolete: The url parameter is deprecated. Please check the documentation for new plugin connection configuration.");

                pluginsData.forEach(function(item){
                    item = baseUrl + item; // for compatibility with previouse version of server, where plugins.url is used.
                    var value = _getPluginJson(item);
                    if (value) {
                        value.baseUrl = item.substring(0, item.lastIndexOf("config.json"));
                        value.oldVersion = (baseUrl !== "");
                        arr.push(value);
                    }
                });

                if (arr.length>0)
                    this.updatePluginsList({
                        autoStartGuid: plugins.autoStartGuid,
                        pluginsData: arr
                    }, !!uiCustomize);
            },

            updatePluginsList: function(plugins, uiCustomize) {
                var pluginStore = this.getApplication().getCollection('Common.Collections.Plugins'),
                    isEdit = this.appOptions.isEdit;
                if (plugins) {
                    var arr = [], arrUI = [];
                    plugins.pluginsData.forEach(function(item){
                        if (uiCustomize!==undefined && (pluginStore.findWhere({baseUrl : item.baseUrl}) || pluginStore.findWhere({guid : item.guid}))) return;

                        var variations = item.variations,
                            variationsArr = [];
                        variations.forEach(function(itemVar){
                            var isSupported = false;
                            for (var i=0; i<itemVar.EditorsSupport.length; i++){
                                if (itemVar.EditorsSupport[i]=='slide') {
                                    isSupported = true; break;
                                }
                            }
                            if (isSupported && (isEdit || itemVar.isViewer)){
                                var icons = itemVar.icons;
                                if (item.oldVersion) { // for compatibility with previouse version of server, where plugins.url is used.
                                    icons = [];
                                    itemVar.icons.forEach(function(icon){
                                        icons.push(icon.substring(icon.lastIndexOf("\/")+1));
                                    });
                                }
                                item.isUICustomizer ? arrUI.push(item.baseUrl + itemVar.url) :
                                variationsArr.push(new Common.Models.PluginVariation({
                                    description: itemVar.description,
                                    index: variationsArr.length,
                                    url : (item.oldVersion) ? (itemVar.url.substring(itemVar.url.lastIndexOf("\/")+1) ) : itemVar.url,
                                    icons  : icons,
                                    isViewer: itemVar.isViewer,
                                    EditorsSupport: itemVar.EditorsSupport,
                                    isVisual: itemVar.isVisual,
                                    isModal: itemVar.isModal,
                                    isInsideMode: itemVar.isInsideMode,
                                    initDataType: itemVar.initDataType,
                                    initData: itemVar.initData,
                                    isUpdateOleOnResize : itemVar.isUpdateOleOnResize,
                                    buttons: itemVar.buttons,
                                    size: itemVar.size,
                                    initOnSelectionChanged: itemVar.initOnSelectionChanged
                                }));
                            }
                        });
                        if (variationsArr.length>0 && !item.isUICustomizer)
                            arr.push(new Common.Models.Plugin({
                                name : item.name,
                                guid: item.guid,
                                baseUrl : item.baseUrl,
                                variations: variationsArr,
                                currentVariation: 0
                            }));
                    });

                    if (uiCustomize!==false)  // from ui customizer in editor config or desktop event
                        this.UICustomizePlugins = arrUI;

                    if (uiCustomize === undefined) { // for desktop
                        if (pluginStore) pluginStore.reset(arr);
                        this.appOptions.canPlugins = (pluginStore.length>0);
                    } else if (!uiCustomize) {
                        if (pluginStore) pluginStore.add(arr);
                        this.appOptions.canPlugins = (pluginStore.length>0);
                    }
                } else if (!uiCustomize){
                    this.appOptions.canPlugins = false;
                }
                if (this.appOptions.canPlugins) {
                    this.getApplication().getController('Common.Controllers.Plugins').setMode(this.appOptions);
                    if (plugins.autoStartGuid)
                        this.api.asc_pluginRun(plugins.autoStartGuid, 0, '');
                }
                if (!uiCustomize) this.getApplication().getController('LeftMenu').enablePlugins();
            },

            // Translation
            leavePageText: 'You have unsaved changes in this document. Click \'Stay on this Page\' then \'Save\' to save them. Click \'Leave this Page\' to discard all the unsaved changes.',
            defaultTitleText: 'ONLYOFFICE Presentation Editor',
            criticalErrorTitle: 'Error',
            notcriticalErrorTitle: 'Warning',
            errorDefaultMessage: 'Error code: %1',
            criticalErrorExtText: 'Press "Ok" to to back to document list.',
            openTitleText: 'Opening Document',
            openTextText: 'Opening document...',
            saveTitleText: 'Saving Document',
            saveTextText: 'Saving document...',
            loadFontsTitleText: 'Loading Data',
            loadFontsTextText: 'Loading data...',
            loadImagesTitleText: 'Loading Images',
            loadImagesTextText: 'Loading images...',
            loadFontTitleText: 'Loading Data',
            loadFontTextText: 'Loading data...',
            loadImageTitleText: 'Loading Image',
            loadImageTextText: 'Loading image...',
            downloadTitleText: 'Downloading Document',
            downloadTextText: 'Downloading document...',
            printTitleText: 'Printing Document',
            printTextText: 'Printing document...',
            uploadImageTitleText: 'Uploading Image',
            uploadImageTextText: 'Uploading image...',
            uploadImageSizeMessage: 'Maximium image size limit exceeded.',
            uploadImageExtMessage: 'Unknown image format.',
            uploadImageFileCountMessage: 'No images uploaded.',
            reloadButtonText: 'Reload Page',
            unknownErrorText: 'Unknown error.',
            convertationTimeoutText: 'Convertation timeout exceeded.',
            downloadErrorText: 'Download failed.',
            unsupportedBrowserErrorText : 'Your browser is not supported.',
            splitMaxRowsErrorText: 'The number of rows must be less than %1',
            splitMaxColsErrorText: 'The number of columns must be less than %1',
            splitDividerErrorText: 'The number of rows must be a divisor of %1',
            requestEditFailedTitleText: 'Access denied',
            requestEditFailedMessageText: 'Someone is editing this document right now. Please try again later.',
            txtSldLtTBlank: 'Blank',
            txtSldLtTChart: 'Chart',
            txtSldLtTChartAndTx: 'Chart and Text',
            txtSldLtTClipArtAndTx: 'Clip Art and Text',
            txtSldLtTClipArtAndVertTx: 'Clip Art and Vertical Text',
            txtSldLtTCust: 'Custom',
            txtSldLtTDgm: 'Diagram',
            txtSldLtTFourObj: 'Four Objects',
            txtSldLtTMediaAndTx: 'Media and Text',
            txtSldLtTObj: 'Title and Object',
            txtSldLtTObjAndTwoObj: 'Object and Two Object',
            txtSldLtTObjAndTx: 'Object and Text',
            txtSldLtTObjOnly: 'Object',
            txtSldLtTObjOverTx: 'Object over Text',
            txtSldLtTObjTx: 'Title, Object, and Caption',
            txtSldLtTPicTx: 'Picture and Caption',
            txtSldLtTSecHead: 'Section Header',
            txtSldLtTTbl: 'Table',
            txtSldLtTTitle: 'Title',
            txtSldLtTTitleOnly: 'Title Only',
            txtSldLtTTwoColTx: 'Two Column Text',
            txtSldLtTTwoObj: 'Two Objects',
            txtSldLtTTwoObjAndObj: 'Two Objects and Object',
            txtSldLtTTwoObjAndTx: 'Two Objects and Text',
            txtSldLtTTwoObjOverTx: 'Two Objects over Text',
            txtSldLtTTwoTxTwoObj: 'Two Text and Two Objects',
            txtSldLtTTx: 'Text',
            txtSldLtTTxAndChart: 'Text and Chart',
            txtSldLtTTxAndClipArt: 'Text and Clip Art',
            txtSldLtTTxAndMedia: 'Text and Media',
            txtSldLtTTxAndObj: 'Text and Object',
            txtSldLtTTxAndTwoObj: 'Text and Two Objects',
            txtSldLtTTxOverObj: 'Text over Object',
            txtSldLtTVertTitleAndTx: 'Vertical Title and Text',
            txtSldLtTVertTitleAndTxOverChart: 'Vertical Title and Text Over Chart',
            txtSldLtTVertTx: 'Vertical Text',
            textLoadingDocument: 'Loading presentation',
            warnBrowserZoom: 'Your browser\'s current zoom setting is not fully supported. Please reset to the default zoom by pressing Ctrl+0.',
            warnBrowserIE9: 'The application has low capabilities on IE9. Use IE10 or higher',
            loadThemeTitleText: 'Loading Theme',
            loadThemeTextText: 'Loading theme...',
            txtBasicShapes: 'Basic Shapes',
            txtFiguredArrows: 'Figured Arrows',
            txtMath: 'Math',
            txtCharts: 'Charts',
            txtStarsRibbons: 'Stars & Ribbons',
            txtCallouts: 'Callouts',
            txtButtons: 'Buttons',
            txtRectangles: 'Rectangles',
            txtLines: 'Lines',
            errorKeyEncrypt: 'Unknown key descriptor',
            errorKeyExpire: 'Key descriptor expired',
            errorUsersExceed: 'Count of users was exceed',
            txtEditingMode: 'Set editing mode...',
            errorCoAuthoringDisconnect: 'Server connection lost. You can\'t edit anymore.',
            errorFilePassProtect: 'The document is password protected.',
            textAnonymous: 'Anonymous',
            txtNeedSynchronize: 'You have an updates',
            applyChangesTitleText: 'Loading Data',
            applyChangesTextText: 'Loading data...',
            savePreparingText: 'Preparing to save',
            savePreparingTitle: 'Preparing to save. Please wait...',
            loadingDocumentTitleText: 'Loading presentation',
            loadingDocumentTextText: 'Loading presentation...',
            warnProcessRightsChange: 'You have been denied the right to edit the file.',
            errorProcessSaveResult: 'Saving is failed.',
            textCloseTip: 'Click to close the tip.',
            textShape: 'Shape',
            errorStockChart: 'Incorrect row order. To build a stock chart place the data on the sheet in the following order:<br> opening price, max price, min price, closing price.',
            errorDataRange: 'Incorrect data range.',
            errorDatabaseConnection: 'External error.<br>Database connection error. Please, contact support.',
            errorUpdateVersion: 'The file version has been changed. The page will be reloaded.',
            errorUserDrop: 'The file cannot be accessed right now.',
            txtDiagramTitle: 'Chart Title',
            txtXAxis: 'X Axis',
            txtYAxis: 'Y Axis',
            txtSeries: 'Seria',
            txtArt: 'Your text here',
            errorConnectToServer: ' The document could not be saved. Please check connection settings or contact your administrator.<br>When you click the \'OK\' button, you will be prompted to download the document.<br><br>' +
                                  'Find more information about connecting Document Server <a href=\"https://api.onlyoffice.com/editors/callback\" target=\"_blank\">here</a>',
            textTryUndoRedo: 'The Undo/Redo functions are disabled for the Fast co-editing mode.<br>Click the \'Strict mode\' button to switch to the Strict co-editing mode to edit the file without other users interference and send your changes only after you save them. You can switch between the co-editing modes using the editor Advanced settings.',
            textStrict: 'Strict mode',
            textBuyNow: 'Visit website',
            textNoLicenseTitle: 'ONLYOFFICE open source version',
            warnNoLicense: 'You are using an open source version of ONLYOFFICE. The version has limitations for concurrent connections to the document server (20 connections at a time).<br>If you need more please consider purchasing a commercial license.',
            textContactUs: 'Contact sales',
            errorViewerDisconnect: 'Connection is lost. You can still view the document,<br>but will not be able to download or print until the connection is restored.',
            warnLicenseExp: 'Your license has expired.<br>Please update your license and refresh the page.',
            titleLicenseExp: 'License expired',
            openErrorText: 'An error has occurred while opening the file',
            saveErrorText: 'An error has occurred while saving the file',
            errorToken: 'The document security token is not correctly formed.<br>Please contact your Document Server administrator.',
            errorTokenExpire: 'The document security token has expired.<br>Please contact your Document Server administrator.',
            errorSessionAbsolute: 'The document editing session has expired. Please reload the page.',
            errorSessionIdle: 'The document has not been edited for quite a long time. Please reload the page.',
            errorSessionToken: 'The connection to the server has been interrupted. Please reload the page.',
            errorAccessDeny: 'You are trying to perform an action you do not have rights for.<br>Please contact your Document Server administrator.',
            titleServerVersion: 'Editor updated',
            errorServerVersion: 'The editor version has been updated. The page will be reloaded to apply the changes.',
            textChangesSaved: 'All changes saved'
        }
    })(), PE.Controllers.Main || {}))
});
