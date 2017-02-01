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
 *    Created by Maxim Kadushkin on 24 March 2014
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
    'common/main/lib/util/LanguageInfo',
    'common/main/lib/util/LocalStorage',
    'spreadsheeteditor/main/app/collection/ShapeGroups',
    'spreadsheeteditor/main/app/collection/TableTemplates',
    'spreadsheeteditor/main/app/collection/EquationGroups',
    'spreadsheeteditor/main/app/controller/FormulaDialog',
    'spreadsheeteditor/main/app/view/FormulaLang'
], function () {
    'use strict';

    SSE.Controllers.Main = Backbone.Controller.extend(_.extend((function() {
        var InitApplication = -254;
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

        Common.localStorage.setId('table');
        Common.localStorage.setKeysFilter('sse-,asc.table');
        Common.localStorage.sync();

        return {
            models: [],
            collections: [
                'ShapeGroups',
                'EquationGroups',
                'TableTemplates',
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
//                $(document.body).css('position', 'absolute');

                this._state = {isDisconnected: false, usersCount: 1, fastCoauth: true, startModifyDocument: true, lostEditingRights: false, licenseWarning: false};

                if (!Common.Utils.isBrowserSupported()){
                    Common.Utils.showBrowserRestriction();
                    Common.Gateway.reportError(undefined, this.unsupportedBrowserErrorText);
                    return;
                } else {
//                    this.getViewport().getEl().on('keypress', this.lockEscapeKey, this);
//                    viewport.applicationUI.setVisible(true);
                }

                var value = Common.localStorage.getItem("sse-settings-fontrender");
                if (value===null) value = window.devicePixelRatio > 1 ? '1' : '3';

                // Initialize api
                this.api = new Asc.spreadsheet_api({
                    'id-view'  : 'editor_sdk',
                    'id-input' : 'ce-cell-content'
                });
                this.api.asc_setFontRenderingMode(parseInt(value));

                this.api.asc_registerCallback('asc_onOpenDocumentProgress',  _.bind(this.onOpenDocument, this));
                this.api.asc_registerCallback('asc_onEndAction',             _.bind(this.onLongActionEnd, this));
                this.api.asc_registerCallback('asc_onError',                 _.bind(this.onError, this));
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect', _.bind(this.onCoAuthoringDisconnect, this));
                this.api.asc_registerCallback('asc_onAdvancedOptions',       _.bind(this.onAdvancedOptions, this));
                this.api.asc_registerCallback('asc_onDocumentUpdateVersion', _.bind(this.onUpdateVersion, this));
                this.api.asc_registerCallback('asc_onDocumentName',          _.bind(this.onDocumentName, this));
                this.api.asc_registerCallback('asc_onPrintUrl',              _.bind(this.onPrintUrl, this));
                this.api.asc_registerCallback('asc_onMeta',                  _.bind(this.onMeta, this));
                Common.NotificationCenter.on('api:disconnect',               _.bind(this.onCoAuthoringDisconnect, this));
                Common.NotificationCenter.on('goback',                       _.bind(this.goBack, this));
                Common.NotificationCenter.on('namedrange:locked',            _.bind(this.onNamedRangeLocked, this));

                this.stackLongActions = new Common.IrregularStack({
                    strongCompare   : this._compareActionStrong,
                    weakCompare     : this._compareActionWeak
                });

                this.stackLongActions.push({id: InitApplication, type: Asc.c_oAscAsyncActionType.BlockInteraction});

                this.isShowOpenDialog = false;

                // Initialize api gateway
                this.editorConfig = {};
                this.plugins = undefined;
                this.UICustomizePlugins = [];
                Common.Gateway.on('init', _.bind(this.loadConfig, this));
                Common.Gateway.on('showmessage', _.bind(this.onExternalMessage, this));
                Common.Gateway.on('opendocument', _.bind(this.loadDocument, this));
                Common.Gateway.on('internalcommand', _.bind(this.onInternalCommand, this));
                Common.Gateway.ready();

                this.getApplication().getController('Viewport').setApi(this.api);

                var me = this;
                // Syncronize focus with api
                $(document.body).on('focus', 'input, textarea:not(#ce-cell-content)', function(e) {
                    if (me.isAppDisabled === true) return;

                    if (e && e.target && !/area_id/.test(e.target.id)) {
                        if (/msg-reply/.test(e.target.className))
                            me.dontCloseDummyComment = true;
                    }
                });

                $(document.body).on('blur', 'input, textarea', function(e) {
                    if (me.isAppDisabled === true || me.isFrameClosed) return;

                    if (!me.isModalShowed && !(me.loadMask && me.loadMask.isVisible())) {
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
                    'dataview:focus': function(e){
                    },
                    'dataview:blur': function(e){
                        if (!me.isModalShowed) {
                            me.api.asc_enableKeyEvents(true);
                        }
                    },
                    'menu:show': function(e){
                    },
                    'menu:hide': function(menu){
                        if (!me.isModalShowed && (!menu || !menu.cmpEl.hasClass('from-cell-edit'))) {
                            me.api.asc_InputClearKeyboardElement();
                            me.api.asc_enableKeyEvents(true);
                        }
                    },
                    'edit:complete': _.bind(this.onEditComplete, this),
                    'settings:unitschanged':_.bind(this.unitsChanged, this)
                });

                this.initNames();
//                this.recognizeBrowser();
                Common.util.Shortcuts.delegateShortcuts({
                    shortcuts: {
                        'command+s,ctrl+s': _.bind(function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                        }, this)
                    }
                });
            },

            loadConfig: function(data) {
                this.editorConfig = $.extend(this.editorConfig, data.config);

                this.appOptions                 = {};

                this.editorConfig.user          =
                this.appOptions.user            = Common.Utils.fillUserInfo(this.editorConfig.user, this.editorConfig.lang, this.textAnonymous);
                this.appOptions.nativeApp       = this.editorConfig.nativeApp === true;
                this.appOptions.isDesktopApp    = this.editorConfig.targetApp == 'desktop';
                this.appOptions.canCreateNew    = !_.isEmpty(this.editorConfig.createUrl) && !this.appOptions.isDesktopApp;
                this.appOptions.canOpenRecent   = this.editorConfig.nativeApp !== true && this.editorConfig.recent !== undefined && !this.appOptions.isDesktopApp;
                this.appOptions.templates       = this.editorConfig.templates;
                this.appOptions.recent          = this.editorConfig.recent;
                this.appOptions.createUrl       = this.editorConfig.createUrl;
                this.appOptions.lang            = this.editorConfig.lang;
                this.appOptions.location        = (typeof (this.editorConfig.location) == 'string') ? this.editorConfig.location.toLowerCase() : '';
                this.appOptions.canAutosave     = false;
                this.appOptions.canAnalytics    = false;
                this.appOptions.sharingSettingsUrl = this.editorConfig.sharingSettingsUrl;
                this.appOptions.isEditDiagram   = this.editorConfig.mode == 'editdiagram';
                this.appOptions.isEditMailMerge = this.editorConfig.mode == 'editmerge';
                this.appOptions.customization   = this.editorConfig.customization;
                this.appOptions.canBackToFolder = (this.editorConfig.canBackToFolder!==false) && (typeof (this.editorConfig.customization) == 'object')
                                                  && (typeof (this.editorConfig.customization.goback) == 'object') && !_.isEmpty(this.editorConfig.customization.goback.url);
                this.appOptions.canBack         = this.editorConfig.nativeApp !== true && this.appOptions.canBackToFolder === true;
                this.appOptions.canPlugins      = false;
                this.plugins                    = this.editorConfig.plugins;

                this.headerView = this.getApplication().getController('Viewport').getView('Common.Views.Header');
                this.headerView.setCanBack(this.appOptions.canBackToFolder === true);

                var value = Common.localStorage.getItem("sse-settings-reg-settings");
                if (value!==null)
                    this.api.asc_setLocale(parseInt(value));
                else {
                    this.api.asc_setLocale((this.editorConfig.lang) ? parseInt(Common.util.LanguageInfo.getLocalLanguageCode(this.editorConfig.lang)) : 0x0409);
                }

                value = Common.localStorage.getItem("sse-settings-func-locale");
                if (value===null) {
                    var lang = ((this.editorConfig.lang) ? this.editorConfig.lang : 'en').split("-")[0].toLowerCase();
                    if (lang !== 'en')
                        value = SSE.Views.FormulaLang.get(lang);
                } else
                    value = SSE.Views.FormulaLang.get(value);
                if (value) this.api.asc_setLocalization(value);

                if (this.appOptions.location == 'us' || this.appOptions.location == 'ca')
                    Common.Utils.Metric.setDefaultMetric(Common.Utils.Metric.c_MetricUnits.inch);

                this.isFrameClosed = (this.appOptions.isEditDiagram || this.appOptions.isEditMailMerge);
            },

            loadDocument: function(data) {
                this.appOptions.spreadsheet = data.doc;
                this.permissions = {};
                var docInfo = {};

                if (data.doc) {
                    this.permissions = _.extend(this.permissions, data.doc.permissions);

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

                    this.headerView.setDocumentCaption(data.doc.title);
                }

                this.api.asc_registerCallback('asc_onGetEditorPermissions', _.bind(this.onEditorPermissions, this));
                this.api.asc_setDocInfo(docInfo);
                this.api.asc_getEditorPermissions(this.editorConfig.licenseUrl, this.editorConfig.customerId);
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
               this.api.asc_DownloadAs(Asc.c_oAscFileType.XLSX, true);
            },

            onProcessMouse: function(data) {
                if (data.type == 'mouseup') {
                    var editor = document.getElementById('editor_sdk');
                    if (editor) {
                        var rect = editor.getBoundingClientRect();
                        var event = window.event || arguments.callee.caller.arguments[0];
                        this.api.asc_onMouseUp(event, data.x - rect.left, data.y - rect.top);
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

            onEditComplete: function(cmp, opts) {
                if (opts && opts.restorefocus && this.api.isCEditorFocused) {
                    this.formulaInput.blur();
                    this.formulaInput.focus();
                } else {
                    this.getApplication().getController('DocumentHolder').getView('DocumentHolder').focus();
                    this.api.isCEditorFocused = false;
                }
            },

            onSelectionChanged: function(info){
                if (!this._isChartDataReady){
                    this._isChartDataReady = true;
                    Common.Gateway.internalMessage('chartDataReady');
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

                this.headerView.setDocumentCaption(this.api.asc_getDocumentName());
                this.updateWindowTitle(this.api.asc_isDocumentModified(), true);

                if (type === Asc.c_oAscAsyncActionType.BlockInteraction && id == Asc.c_oAscAsyncAction.Open) {
                    Common.Gateway.internalMessage('documentReady', {});
                    this.onDocumentReady();
                }

                action = this.stackLongActions.get({type: Asc.c_oAscAsyncActionType.Information});
                action && this.setLongActionView(action);

                if (id == Asc.c_oAscAsyncAction.Save) {
                    this.toolbarView.synchronizeChanges();
                }

                action = this.stackLongActions.get({type: Asc.c_oAscAsyncActionType.BlockInteraction});
                if (action) {
                    this.setLongActionView(action);
                } else {
                    if (this.loadMask) {
                        if (this.loadMask.isVisible() && !this.dontCloseDummyComment)
                            this.api.asc_enableKeyEvents(true);
                        this.loadMask.hide();
                    }

                    if (type == Asc.c_oAscAsyncActionType.BlockInteraction && !( (id == Asc.c_oAscAsyncAction['LoadDocumentFonts'] || id == Asc.c_oAscAsyncAction['ApplyChanges']) && this.dontCloseDummyComment ))
                        this.onEditComplete(this.loadMask, {restorefocus:true});
                }
            },

            setLongActionView: function(action) {
                var title = '';

                switch (action.id) {
                    case Asc.c_oAscAsyncAction.Open:
                        title   = this.openTitleText;
                        break;

                    case Asc.c_oAscAsyncAction.Save:
                        title   = this.saveTitleText;
                        break;

                    case Asc.c_oAscAsyncAction.LoadDocumentFonts:
                        title   = this.loadFontsTitleText;
                        break;

                    case Asc.c_oAscAsyncAction.LoadDocumentImages:
                        title   = this.loadImagesTitleText;
                        break;

                    case Asc.c_oAscAsyncAction.LoadFont:
                        title   = this.loadFontTitleText;
                        break;

                    case Asc.c_oAscAsyncAction.LoadImage:
                        title   = this.loadImageTitleText;
                        break;

                    case Asc.c_oAscAsyncAction.DownloadAs:
                        title   = this.downloadTitleText;
                        break;

                    case Asc.c_oAscAsyncAction.Print:
                        title   = this.printTitleText;
                        break;

                    case Asc.c_oAscAsyncAction.UploadImage:
                        title   = this.uploadImageTitleText;
                        break;

                    case Asc.c_oAscAsyncAction.Recalc:
                        title   = this.titleRecalcFormulas;
                        break;

                    case Asc.c_oAscAsyncAction.SlowOperation:
                        title   = this.textPleaseWait;
                        break;

                    case Asc.c_oAscAsyncAction['PrepareToSave']:
                        title   = this.savePreparingText;
                        break;

                    case ApplyEditRights:
                        title   = this.txtEditingMode;
                        break;

                    case LoadingDocument:
                        title   = this.loadingDocumentTitleText;
                        break;
                }

                if (action.type == Asc.c_oAscAsyncActionType.BlockInteraction) {
                    !this.loadMask && (this.loadMask = new Common.UI.LoadMask({owner: $('#viewport')}));
                    this.loadMask.setTitle(title);

                    if (!this.isShowOpenDialog) {
                        this.api.asc_enableKeyEvents(false);
                        this.loadMask.show();
                    }
                }
            },

            onApplyEditRights: function(data) {
                if (data) {
                    if (data.allowed) {
                        this.onLongActionBegin(Asc.c_oAscAsyncActionType['BlockInteraction'],ApplyEditRights);
                        this.appOptions.isEdit = true;

                        var me = this;
                        setTimeout(function(){
                            me.applyModeCommonElements();
                            me.applyModeEditorElements('view');
                            me.api.asc_setViewMode(false);

                            var application                 = me.getApplication();
                            var documentHolderController    = application.getController('DocumentHolder');

                            application.getController('LeftMenu').setMode(me.appOptions).createDelayedElements();
                            Common.NotificationCenter.trigger('layout:changed', 'main');

                            var timer_sl = setInterval(function(){
                                if (window.styles_loaded) {
                                    clearInterval(timer_sl);

                                    documentHolderController.getView('DocumentHolder').createDelayedElements();
                                    documentHolderController.resetApi();

                                    application.getController('Toolbar').createDelayedElements();
                                    application.getController('RightMenu').createDelayedElements();
                                    application.getController('Statusbar').getView('Statusbar').update();
                                    application.getController('CellEditor').setMode(me.appOptions);

                                    me.api.asc_registerCallback('asc_onSaveUrl', _.bind(me.onSaveUrl, me));
                                    me.api.asc_registerCallback('asc_onDocumentModifiedChanged', _.bind(me.onDocumentModifiedChanged, me));
                                    me.api.asc_registerCallback('asc_onDocumentCanSaveChanged',  _.bind(me.onDocumentCanSaveChanged, me));
                                    me.api.asc_registerCallback('asc_onDownloadUrl',             _.bind(me.onDownloadUrl, me));
                                    var shapes = me.api.asc_getPropertyEditorShapes();
                                    if (shapes)
                                        me.fillAutoShapes(shapes[0], shapes[1]);

                                    me.fillTextArt(me.api.asc_getTextArtPreviews());
                                    me.updateThemeColors();

                                    application.getController('FormulaDialog').setApi(me.api);
                                }
                            }, 50);
                        }, 50);
                    }
                    else {
                        Common.UI.info({
                            title: this.requestEditFailedTitleText,
                            msg: data.message || this.requestEditFailedMessageText
                        });
                    }
                }
            },

            onDocumentReady: function() {
                if (this._isDocReady)
                    return;

                var me = this,
                    value;

                me._isDocReady = true;

                me.hidePreloader();
                me.onLongActionEnd(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);

                value = (this.appOptions.isEditMailMerge || this.appOptions.isEditDiagram) ? 100 : Common.localStorage.getItem("sse-settings-zoom");
                var zf = (value!==null) ? parseInt(value)/100 : (this.appOptions.customization && this.appOptions.customization.zoom ? parseInt(this.appOptions.customization.zoom)/100 : 1);
                this.api.asc_setZoom(zf>0 ? zf : 1);

                /** coauthoring begin **/
                value = Common.localStorage.getItem("sse-settings-livecomment");
                this.isLiveCommenting = !(value!==null && parseInt(value) == 0);
                this.isLiveCommenting?this.api.asc_showComments():this.api.asc_hideComments();

                if (this.appOptions.isEdit && !this.appOptions.isOffline && this.appOptions.canCoAuthoring) {
                    value = Common.localStorage.getItem("sse-settings-coauthmode");
                    if (value===null && Common.localStorage.getItem("sse-settings-autosave")===null &&
                        this.appOptions.customization && this.appOptions.customization.autosave===false) {
                        value = 0; // use customization.autosave only when sse-settings-coauthmode and sse-settings-autosave are null
                    }
                    this._state.fastCoauth = (value===null || parseInt(value) == 1);
                } else
                    this._state.fastCoauth = false;
                this.api.asc_SetFastCollaborative(this._state.fastCoauth);
                /** coauthoring end **/

                me.api.asc_registerCallback('asc_onStartAction',        _.bind(me.onLongActionBegin, me));
                me.api.asc_registerCallback('asc_onConfirmAction',      _.bind(me.onConfirmAction, me));
                me.api.asc_registerCallback('asc_onActiveSheetChanged', _.bind(me.onActiveSheetChanged, me));
                me.api.asc_registerCallback('asc_onPrint',              _.bind(me.onPrint, me));

                var application = me.getApplication();

                me.headerView.setDocumentCaption(me.api.asc_getDocumentName());
                me.updateWindowTitle(me.api.asc_isDocumentModified(), true);

                var toolbarController           = application.getController('Toolbar'),
                    statusbarController         = application.getController('Statusbar'),
                    documentHolderController    = application.getController('DocumentHolder'),
//                  fontsController             = application.getController('Common.Controllers.Fonts'),
                    rightmenuController         = application.getController('RightMenu'),
                    leftmenuController          = application.getController('LeftMenu'),
                    celleditorController        = application.getController('CellEditor'),
                    statusbarView               = statusbarController.getView('Statusbar'),
                    leftMenuView                = leftmenuController.getView('LeftMenu'),
                    documentHolderView          = documentHolderController.getView('DocumentHolder'),
                    chatController              = application.getController('Common.Controllers.Chat'),
                    pluginsController           = application.getController('Common.Controllers.Plugins');

                leftMenuView.getMenu('file').loadDocument({doc:me.appOptions.spreadsheet});
                leftmenuController.setMode(me.appOptions).createDelayedElements().setApi(me.api);

                 if (!me.appOptions.isEditMailMerge && !me.appOptions.isEditDiagram) {
                    pluginsController.setApi(me.api);
                    me.updatePlugins(me.plugins, false);
                    me.api.asc_registerCallback('asc_onPluginsInit', _.bind(me.updatePluginsList, me));
                }

                leftMenuView.disableMenu('all',false);

                if (!me.appOptions.isEditMailMerge && !me.appOptions.isEditDiagram && me.appOptions.canBranding) {
                    me.getApplication().getController('LeftMenu').leftMenu.getMenu('about').setLicInfo(me.editorConfig.customization);
                }

                documentHolderController.setApi(me.api).loadConfig({config:me.editorConfig});
                chatController.setApi(this.api).setMode(this.appOptions);

                statusbarController.createDelayedElements();
                statusbarController.setApi(me.api);
                documentHolderView.setApi(me.api);

                statusbarView.update();

                this.formulaInput = celleditorController.getView('CellEditor').$el.find('textarea');

                if (me.appOptions.isEdit) {
                    if (me.appOptions.canAutosave) {
                        value = Common.localStorage.getItem("sse-settings-autosave");
                        if (value===null && me.appOptions.customization && me.appOptions.customization.autosave===false)
                            value = 0;
                        value = (!me._state.fastCoauth && value!==null) ? parseInt(value) : (me.appOptions.canCoAuthoring ? 1 : 0);
                    } else {
                        value = 0;
                    }
                    me.api.asc_setAutoSaveGap(value);

                    if (me.needToUpdateVersion) {
                        Common.NotificationCenter.trigger('api:disconnect');
                        toolbarController.onApiCoAuthoringDisconnect();
                    }

                    var timer_sl = setInterval(function(){
                        if (window.styles_loaded || me.appOptions.isEditDiagram || me.appOptions.isEditMailMerge) {
                            clearInterval(timer_sl);

                            Common.NotificationCenter.trigger('comments:updatefilter',
                                {property: 'uid',
                                    value: new RegExp('^(doc_|sheet' + me.api.asc_getActiveWorksheetId() + '_)')});

                            documentHolderView.createDelayedElements();
                            toolbarController.createDelayedElements();

                            if (!me.appOptions.isEditMailMerge && !me.appOptions.isEditDiagram) {
                                var shapes = me.api.asc_getPropertyEditorShapes();
                                if (shapes)
                                    me.fillAutoShapes(shapes[0], shapes[1]);

                                me.fillTextArt(me.api.asc_getTextArtPreviews());
                                me.updateThemeColors();
                            }

                            rightmenuController.createDelayedElements();

                            me.api.asc_registerCallback('asc_onSaveUrl', _.bind(me.onSaveUrl, me));
                            me.api.asc_registerCallback('asc_onDocumentModifiedChanged', _.bind(me.onDocumentModifiedChanged, me));
                            me.api.asc_registerCallback('asc_onDocumentCanSaveChanged',  _.bind(me.onDocumentCanSaveChanged, me));
                            me.api.asc_registerCallback('asc_onDownloadUrl',             _.bind(me.onDownloadUrl, me));
                            me.api.asc_registerCallback('asc_OnTryUndoInFastCollaborative',_.bind(me.onTryUndoInFastCollaborative, me));
                            me.onDocumentModifiedChanged(me.api.asc_isDocumentModified());

                            var formulasDlgController = application.getController('FormulaDialog');
                            if (formulasDlgController) {
                                formulasDlgController.setMode(me.appOptions).setApi(me.api);
                            }
                            if (me.needToUpdateVersion)
                                toolbarController.onApiCoAuthoringDisconnect();

                            if (me.appOptions.canBrandingExt)
                                Common.NotificationCenter.trigger('document:ready', 'main');
                        }
                    }, 50);
                } else if (me.appOptions.canBrandingExt)
                    Common.NotificationCenter.trigger('document:ready', 'main');

                if (me.appOptions.canAnalytics && false)
                    Common.component.Analytics.initialize('UA-12442749-13', 'Spreadsheet Editor');

                Common.Gateway.on('applyeditrights', _.bind(me.onApplyEditRights, me));
                Common.Gateway.on('processsaveresult', _.bind(me.onProcessSaveResult, me));
                Common.Gateway.on('processrightschange', _.bind(me.onProcessRightsChange, me));
                Common.Gateway.on('processmouse', _.bind(me.onProcessMouse, me));
                Common.Gateway.on('downloadas',   _.bind(me.onDownloadAs, me));
                Common.Gateway.sendInfo({mode:me.appOptions.isEdit?'edit':'view'});

                $(document).on('contextmenu', _.bind(me.onContextMenu, me));
//                    me.getViewport().getEl().un('keypress', me.lockEscapeKey, me);

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
                var licType = params ? params.asc_getLicenseType() : Asc.c_oLicenseResult.Error;

                if ( params && !(this.appOptions.isEditDiagram || this.appOptions.isEditMailMerge)) {
                    if (Asc.c_oLicenseResult.Expired === licType || Asc.c_oLicenseResult.Error === licType || Asc.c_oLicenseResult.ExpiredTrial === licType) {
                        Common.UI.warning({
                            title: this.titleLicenseExp,
                            msg: this.warnLicenseExp,
                            buttons: [],
                            closable: false
                        });
                        return;
                    }

                    if (params.asc_getRights() !== Asc.c_oRights.Edit)
                        this.permissions.edit = false;

                    this.appOptions.canAutosave = true;
                    this.appOptions.canAnalytics = params.asc_getIsAnalyticsEnable();

                    this.appOptions.isOffline      = this.api.asc_isOffline();
                    this.appOptions.canLicense     = (licType === Asc.c_oLicenseResult.Success || licType === Asc.c_oLicenseResult.SuccessLimit);
                    this.appOptions.isLightVersion = params.asc_getIsLight();
                    /** coauthoring begin **/
                    this.appOptions.canCoAuthoring = !this.appOptions.isLightVersion;
                    /** coauthoring end **/
                    this.appOptions.canComments    = (licType === Asc.c_oLicenseResult.Success) && !((typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.comments===false);
                    this.appOptions.canChat        = (licType === Asc.c_oLicenseResult.Success) && !this.appOptions.isOffline && !((typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.chat===false);
                    this.appOptions.canRename      = !!this.permissions.rename;

                    this.appOptions.canBranding  = (licType === Asc.c_oLicenseResult.Success) && (typeof this.editorConfig.customization == 'object');
                    if (this.appOptions.canBranding)
                        this.headerView.setBranding(this.editorConfig.customization);

                    this.appOptions.canBrandingExt = params.asc_getCanBranding() && (typeof this.editorConfig.customization == 'object' || this.editorConfig.plugins);
                    if (this.appOptions.canBrandingExt)
                        this.updatePlugins(this.plugins, true);

                    params.asc_getTrial() && this.headerView.setDeveloperMode(true);
                    this.appOptions.canRename && this.headerView.setCanRename(true);
                }

                this.appOptions.canRequestEditRights = this.editorConfig.canRequestEditRights;
                this.appOptions.canEdit        = this.permissions.edit !== false && // can edit
                                                 (this.editorConfig.canRequestEditRights || this.editorConfig.mode !== 'view'); // if mode=="view" -> canRequestEditRights must be defined
                this.appOptions.isEdit         = (this.appOptions.canLicense || this.appOptions.isEditDiagram || this.appOptions.isEditMailMerge) && this.permissions.edit !== false && this.editorConfig.mode !== 'view';
                this.appOptions.canDownload    = !this.appOptions.nativeApp && (this.permissions.download !== false);
                this.appOptions.canPrint       = (this.permissions.print !== false);

                this._state.licenseWarning = !(this.appOptions.isEditDiagram || this.appOptions.isEditMailMerge) && (licType===Asc.c_oLicenseResult.Connections) && this.appOptions.canEdit && this.editorConfig.mode !== 'view';

                this.applyModeCommonElements();
                this.applyModeEditorElements();

                this.api.asc_setViewMode(!this.appOptions.isEdit);
                (this.appOptions.isEditMailMerge || this.appOptions.isEditDiagram) ? this.api.asc_LoadEmptyDocument() : this.api.asc_LoadDocument();

                if (!this.appOptions.isEdit) {
                    this.hidePreloader();
                    this.onLongActionBegin(Asc.c_oAscAsyncActionType.BlockInteraction, LoadingDocument);
                }
            },

            applyModeCommonElements: function() {
                window.editor_elements_prepared = true;

                var value = Common.localStorage.getItem("sse-hidden-title");
                value = this.appOptions.isEdit && (value!==null && parseInt(value) == 1);

                var app             = this.getApplication(),
                    viewport        = app.getController('Viewport').getView('Viewport'),
                    statusbarView   = app.getController('Statusbar').getView('Statusbar');

                if (this.headerView) {
                    this.headerView.setHeaderCaption(this.appOptions.isEdit ? 'Spreadsheet Editor' : 'Spreadsheet Viewer');
                    this.headerView.setVisible(!this.appOptions.nativeApp && !value && !this.appOptions.isEditMailMerge && 
                            !this.appOptions.isDesktopApp && !this.appOptions.isEditDiagram);
                }

                viewport && viewport.setMode(this.appOptions, true);
                statusbarView && statusbarView.setMode(this.appOptions);
//                this.getStatusInfo().setDisabled(false);
//                this.getCellInfo().setMode(this.appOptions);

                app.getController('DocumentHolder').setMode(this.appOptions);

                if (this.appOptions.isEditMailMerge || this.appOptions.isEditDiagram) {
                    statusbarView.hide();
                    app.getController('LeftMenu').getView('LeftMenu').hide();

                    $(window)
                        .mouseup(function(e){
                            Common.Gateway.internalMessage('processMouse', {event: 'mouse:up'});
                        })
                        .mousemove($.proxy(function(e){
                            if (this.isDiagramDrag) {
                                Common.Gateway.internalMessage('processMouse', {event: 'mouse:move', pagex: e.pageX*Common.Utils.zoom(), pagey: e.pageY*Common.Utils.zoom()});
                            }
                        },this));
                }

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

                if (!this.appOptions.isEditMailMerge && !this.appOptions.isEditDiagram) {
                    this.api.asc_registerCallback('asc_onSendThemeColors', _.bind(this.onSendThemeColors, this));

                    var printController = app.getController('Print');
                    printController && this.api && printController.setApi(this.api);

                }

                var celleditorController = this.getApplication().getController('CellEditor');
                celleditorController && celleditorController.setApi(this.api).setMode(this.appOptions);
            },

            applyModeEditorElements: function(prevmode) {
                if (this.appOptions.isEdit) {
                    var me = this,
                        application         = this.getApplication(),
                        toolbarController   = application.getController('Toolbar'),
                        statusbarController = application.getController('Statusbar'),
                        rightmenuController = application.getController('RightMenu'),
                        /** coauthoring begin **/
                            commentsController  = application.getController('Common.Controllers.Comments'),
                        /** coauthoring end **/
                            fontsControllers    = application.getController('Common.Controllers.Fonts');

                    fontsControllers    && fontsControllers.setApi(me.api);
                    toolbarController   && toolbarController.setApi(me.api);
//                    statusbarController && statusbarController.setApi(me.api);

                    if (commentsController) {
                        commentsController.setMode(this.appOptions);
                        commentsController.setConfig({
                                config      : me.editorConfig,
                                sdkviewname : '#ws-canvas-outer',
                                hintmode    : true},
                            me.api);
                    }

                    rightmenuController && rightmenuController.setApi(me.api);

                    if (statusbarController) {
                        statusbarController.getView('Statusbar').changeViewMode(true);
                    }

                     /** coauthoring begin **/
                    if (prevmode=='view') {
                        if (commentsController) {
                            Common.NotificationCenter.trigger('comments:updatefilter',{
                                property : 'uid',
                                value    : new RegExp('^(doc_|sheet' + this.api.asc_getActiveWorksheetId() + '_)')});
                        }
                    }
                    /** coauthoring end **/

                    var viewport = this.getApplication().getController('Viewport').getView('Viewport');
                    viewport.applyEditorMode();

                    this.toolbarView = toolbarController.getView('Toolbar');

                    _.each([
                        this.toolbarView,
                        rightmenuController.getView('RightMenu')
                    ], function(view) {
                        if (view) {
                            view.setMode(me.appOptions);
                            view.setApi(me.api);
                        }
                    });

                    if (this.toolbarView) {
                        this.toolbarView.on('insertimage', _.bind(me.onInsertImage, me));
                        this.toolbarView.on('insertshape', _.bind(me.onInsertShape, me));
                        this.toolbarView.on('insertchart', _.bind(me.onInsertChart, me));
                        this.toolbarView.on('inserttextart', _.bind(me.onInsertTextArt, me));
                    }

                    var value = Common.localStorage.getItem('sse-settings-unit');
                    Common.Utils.Metric.setCurrentMetric((value!==null) ? parseInt(value) : Common.Utils.Metric.getDefaultMetric());

                    if (!me.appOptions.isEditMailMerge && !me.appOptions.isEditDiagram) {
                        var options = {};
                        JSON.parse(Common.localStorage.getItem('sse-hidden-title')) && (options.title = true);
                        JSON.parse(Common.localStorage.getItem('sse-hidden-formula')) && (options.formula = true);
                        application.getController('Toolbar').hideElements(options);
                    } else
                        rightmenuController.getView('RightMenu').hide();

                    /** coauthoring begin **/
                    me.api.asc_registerCallback('asc_onAuthParticipantsChanged', _.bind(me.onAuthParticipantsChanged, me));
                    me.api.asc_registerCallback('asc_onParticipantsChanged',     _.bind(me.onAuthParticipantsChanged, me));
                    /** coauthoring end **/
                    if (me.appOptions.isEditDiagram)
                        me.api.asc_registerCallback('asc_onSelectionChanged',        _.bind(me.onSelectionChanged, me));

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
                this.onLongActionEnd(Asc.c_oAscAsyncActionType.BlockInteraction, LoadingDocument);

                var config = {closable: false};

                switch (id) {
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

                    case Asc.c_oAscError.ID.PastInMergeAreaError:
                        config.msg = this.pastInMergeAreaError;
                        break;

                    case Asc.c_oAscError.ID.FrmlWrongCountParentheses:
                        config.msg = this.errorWrongBracketsCount;
                        config.closable = true;
                        break;

                    case Asc.c_oAscError.ID.FrmlWrongOperator:
                        config.msg = this.errorWrongOperator;
                        config.closable = true;
                        break;

                    case Asc.c_oAscError.ID.FrmlWrongMaxArgument:
                        config.msg = this.errorCountArgExceed;
                        config.closable = true;
                        break;

                    case Asc.c_oAscError.ID.FrmlWrongCountArgument:
                        config.msg = this.errorCountArg;
                        config.closable = true;
                        break;

                    case Asc.c_oAscError.ID.FrmlWrongFunctionName:
                        config.msg = this.errorFormulaName;
                        config.closable = true;
                        break;

                    case Asc.c_oAscError.ID.FrmlAnotherParsingError:
                        config.msg = this.errorFormulaParsing;
                        config.closable = true;
                        break;

                    case Asc.c_oAscError.ID.FrmlWrongArgumentRange:
                        config.msg = this.errorArgsRange;
                        config.closable = true;
                        break;

                    case Asc.c_oAscError.ID.UnexpectedGuid:
                        config.msg = this.errorUnexpectedGuid;
                        break;

                    case Asc.c_oAscError.ID.Database:
                        config.msg = this.errorDatabaseConnection;
                        break;

                    case Asc.c_oAscError.ID.FileRequest:
                        config.msg = this.errorFileRequest;
                        break;

                    case Asc.c_oAscError.ID.FileVKey:
                        config.msg = this.errorFileVKey;
                        break;

                    case Asc.c_oAscError.ID.StockChartError:
                        config.msg = this.errorStockChart;
                        break;

                    case Asc.c_oAscError.ID.DataRangeError:
                        config.msg = this.errorDataRange;
                        break;

                    case Asc.c_oAscError.ID.FrmlOperandExpected:
                        config.msg = this.errorOperandExpected;
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

                    case Asc.c_oAscError.ID.CannotMoveRange:
                        config.msg = this.errorMoveRange;
                        break;

                    case Asc.c_oAscError.ID.UplImageUrl:
                        config.msg = this.errorBadImageUrl;
                        break;

                    case Asc.c_oAscError.ID.CoAuthoringDisconnect:
                        config.msg = this.errorViewerDisconnect;
                        break;

                    case Asc.c_oAscError.ID.ConvertationPassword:
                        config.msg = this.errorFilePassProtect;
                        break;

                    case Asc.c_oAscError.ID.AutoFilterDataRangeError:
                        config.msg = this.errorAutoFilterDataRange;
                        break;

                    case Asc.c_oAscError.ID.AutoFilterChangeFormatTableError:
                        config.msg = this.errorAutoFilterChangeFormatTable;
                        break;

                    case Asc.c_oAscError.ID.AutoFilterChangeError:
                        config.msg = this.errorAutoFilterChange;
                        break;

                    case Asc.c_oAscError.ID.AutoFilterMoveToHiddenRangeError:
                        config.msg = this.errorAutoFilterHiddenRange;
                        break;

                    case Asc.c_oAscError.ID.CannotFillRange:
                        config.msg = this.errorFillRange;
                        break;

                    case Asc.c_oAscError.ID.UserDrop:
                        if (this._state.lostEditingRights) {
                            this._state.lostEditingRights = false;
                            return;
                        }
                        this._state.lostEditingRights = true;
                        config.msg = this.errorUserDrop;
                        break;

                    case Asc.c_oAscError.ID.InvalidReferenceOrName:
                        config.msg = this.errorInvalidRef;
                        break;

                    case Asc.c_oAscError.ID.LockCreateDefName:
                        config.msg = this.errorCreateDefName;
                        break;

                    case Asc.c_oAscError.ID.PasteMaxRangeError:
                        config.msg = this.errorPasteMaxRange;
                        break;

                    case Asc.c_oAscError.ID.LockedAllError:
                        config.msg = this.errorLockedAll;
                        break;

                    case Asc.c_oAscError.ID.Warning:
                        config.msg = this.errorConnectToServer;
                        break;

                    case Asc.c_oAscError.ID.LockedWorksheetRename:
                        config.msg = this.errorLockedWorksheetRename;
                        break;
                    
                    case Asc.c_oAscError.ID.OpenWarning:
                        config.msg = this.errorOpenWarning;
                        break;

                    case Asc.c_oAscError.ID.FrmlWrongReferences:
                        config.msg = this.errorFrmlWrongReferences;
                        break;

                    case Asc.c_oAscError.ID.CopyMultiselectAreaError:
                        config.msg = this.errorCopyMultiselectArea;
                        break;

                    case Asc.c_oAscError.ID.PrintMaxPagesCount:
                        config.msg = this.errorPrintMaxPagesCount;
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
                    Common.Gateway.reportError(id, config.msg);

                    config.title = this.criticalErrorTitle;
                    config.iconCls = 'error';

                    if (this.appOptions.canBackToFolder) {
                        config.msg += '<br/><br/>' + this.criticalErrorExtText;
                        config.callback = function(btn) {
                            if (btn == 'ok') {
                                Common.NotificationCenter.trigger('goback');
                            }
                        }
                    }
                } else {
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

                if ($('.asc-window.modal.alert:visible').length < 1) {
                    Common.UI.alert(config);
                    Common.component.Analytics.trackEvent('Internal Error', id.toString());
                }
            },

            onCoAuthoringDisconnect: function() {
                this.getApplication().getController('Viewport').getView('Viewport').setMode({isDisconnected:true});
                this.getApplication().getController('Viewport').getView('Common.Views.Header').setCanRename(false);
                this.appOptions.canRename = false;
                this._state.isDisconnected = true;
            },

            showTips: function(strings) {
                var me = this;
                if (!strings.length) return;
                if (typeof(strings)!='object') strings = [strings];

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

            updateWindowTitle: function(change, force) {
                if (this._state.isDocModified !== change || force) {
                    var title = this.defaultTitleText;

                    if (!_.isEmpty(this.headerView.getDocumentCaption()))
                        title = this.headerView.getDocumentCaption() + ' - ' + title;

                    if (change) {
                        if (!_.isUndefined(title) && (!this._state.fastCoauth || this._state.usersCount<2 )) {
                            title = '* ' + title;
                            this.headerView.setDocumentCaption(this.headerView.getDocumentCaption() + '*', true);
                        }
                    } else {
                        this.headerView.setDocumentCaption(this.headerView.getDocumentCaption());
                    }

                    if (window.document.title != title)
                        window.document.title = title;

                    if (!this._state.fastCoauth || this._state.usersCount<2 )
                        Common.Gateway.setDocumentModified(change);
                    else if ( this._state.startModifyDocument!==undefined && this._state.startModifyDocument === change){
                        Common.Gateway.setDocumentModified(change);
                        this._state.startModifyDocument = (this._state.startModifyDocument) ? !this._state.startModifyDocument : undefined;
                    }
                    
                    this._state.isDocModified = change;
                }
            },

            onDocumentChanged: function() {
            },

            onDocumentModifiedChanged: function(change) {
                if (this._state.fastCoauth && this._state.usersCount>1 && this._state.startModifyDocument===undefined ) return;

                this.updateWindowTitle(change);
                Common.Gateway.setDocumentModified(change);

                if (this.toolbarView && this.api) {
                    var isSyncButton = $('.btn-icon', this.toolbarView.btnSave.cmpEl).hasClass('btn-synch');
                    var cansave = this.api.asc_isDocumentCanSave();
                    if (this.toolbarView.btnSave.isDisabled() !== (!cansave && !isSyncButton || this._state.isDisconnected || this._state.fastCoauth && this._state.usersCount>1))
                        this.toolbarView.btnSave.setDisabled(!cansave && !isSyncButton || this._state.isDisconnected || this._state.fastCoauth && this._state.usersCount>1);
                }
            },

            onDocumentCanSaveChanged: function (isCanSave) {
                if (this.toolbarView) {
                    var isSyncButton = $('.btn-icon', this.toolbarView.btnSave.cmpEl).hasClass('btn-synch');
                    if (this.toolbarView.btnSave.isDisabled() !== (!isCanSave && !isSyncButton || this._state.isDisconnected || this._state.fastCoauth && this._state.usersCount>1))
                        this.toolbarView.btnSave.setDisabled(!isCanSave && !isSyncButton || this._state.isDisconnected || this._state.fastCoauth && this._state.usersCount>1);
                }
            },

            onBeforeUnload: function() {
                Common.localStorage.save();

                var isEdit = this.permissions.edit !== false && this.editorConfig.mode !== 'view' && this.editorConfig.mode !== 'editdiagram';
                if (isEdit && this.api.asc_isDocumentModified()) {
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
                    if (this.appOptions.customization && !this.appOptions.isDesktopApp)
                        this.appOptions.customization.about = true;
                    Common.Utils.applyCustomization(this.appOptions.customization, mapCustomizationElements);
                    if (this.appOptions.canBrandingExt) {
                        Common.Utils.applyCustomization(this.appOptions.customization, mapCustomizationExtElements);
                        Common.Utils.applyCustomizationPlugins(this.UICustomizePlugins);
                    }
                }
                
                this.stackLongActions.pop({id: InitApplication, type: Asc.c_oAscAsyncActionType.BlockInteraction});
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

            onAdvancedOptions: function(advOptions) {
                var type = advOptions.asc_getOptionId(),
                    me = this, dlg;
                if (type == Asc.c_oAscAdvancedOptionsID.CSV) {
                    dlg = new Common.Views.OpenDialog({
                        type: type,
                        codepages: advOptions.asc_getOptions().asc_getCodePages(),
                        settings: advOptions.asc_getOptions().asc_getRecommendedSettings(),
                        handler: function (encoding, delimiter) {
                            me.isShowOpenDialog = false;
                            if (me && me.api) {
                                me.api.asc_setAdvancedOptions(type, new Asc.asc_CCSVAdvancedOptions(encoding, delimiter));
                                me.loadMask && me.loadMask.show();
                            }
                        }
                    });
                } else if (type == Asc.c_oAscAdvancedOptionsID.DRM) {
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

            onActiveSheetChanged: function(index) {
                if (!this.appOptions.isEditMailMerge && !this.appOptions.isEditDiagram && window.editor_elements_prepared) {
                    this.application.getController('Statusbar').selectTab(index);

                    if (this.appOptions.isEdit && !this.dontCloseDummyComment) {
                        Common.NotificationCenter.trigger('comments:updatefilter',
                            {
                                property: 'uid',
                                value: new RegExp('^(doc_|sheet' + this.api.asc_getWorksheetId(index) + '_)')
                            },
                            false //  hide popover
                        );
                    }
                }
            },

            onConfirmAction: function(id, apiCallback) {
                var me = this;
                if (id == Asc.c_oAscConfirm.ConfirmReplaceRange) {
                    Common.UI.warning({
                        title: this.notcriticalErrorTitle,
                        msg: this.confirmMoveCellRange,
                        buttons: ['yes', 'no'],
                        primary: 'yes',
                        callback: _.bind(function(btn) {
                            if (apiCallback)  {
                                apiCallback(btn === 'yes');
                            }
                            if (btn == 'yes') {
                                me.onEditComplete(me.application.getController('DocumentHolder').getView('DocumentHolder'));
                            }
                        }, this)
                    });
                } else if (id == Asc.c_oAscConfirm.ConfirmPutMergeRange) {
                    Common.UI.warning({
                        closable: false,
                        title: this.notcriticalErrorTitle,
                        msg: this.confirmPutMergeRange,
                        buttons: ['ok'],
                        primary: 'ok',
                        callback: _.bind(function(btn) {
                            if (apiCallback)  {
                                apiCallback();
                            }
                            me.onEditComplete(me.application.getController('DocumentHolder').getView('DocumentHolder'));
                        }, this)
                    });
                }
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
                        model: SSE.Models.ShapeModel
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
            
            updateThemeColors: function() {
                var me = this;
                setTimeout(function(){
                    me.getApplication().getController('RightMenu').UpdateThemeColors();
                }, 50);

                setTimeout(function(){
                    me.getApplication().getController('Toolbar').updateThemeColors();
                }, 50);

                setTimeout(function(){
                    me.getApplication().getController('Statusbar').updateThemeColors();
                }, 50);
            },

            onSendThemeColors: function(colors, standart_colors) {
                Common.Utils.ThemeColor.setColors(colors, standart_colors);
                if (window.styles_loaded && !this.appOptions.isEditMailMerge && !this.appOptions.isEditDiagram) {
                    this.updateThemeColors();
                    this.fillTextArt(this.api.asc_getTextArtPreviews());
                }
            },

            loadLanguages: function() {
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

            onInternalCommand: function(data) {
                if (data) {
                    switch (data.command) {
                    case 'setChartData':    this.setChartData(data.data); break;
                    case 'getChartData':    this.getChartData(); break;
                    case 'clearChartData':  this.clearChartData(); break;
                    case 'setMergeData':    this.setMergeData(data.data); break;
                    case 'getMergeData':    this.getMergeData(); break;
                    case 'setAppDisabled':
                        this.isAppDisabled = data.data;
                        break;
                    case 'queryClose':
                        if ($('body .asc-window:visible').length === 0) {
                            this.isFrameClosed = true;
                            this.api.asc_closeCellEditor();
                            Common.Gateway.internalMessage('canClose', {mr:data.data.mr, answer: true});
                        }
                        break;
                    case 'window:drag':
                        this.isDiagramDrag = data.data;
                        break;
                    case 'processmouse':
                        this.onProcessMouse(data.data);
                        break;
                    }
                }
            },

            setChartData: function(chart) {
                if (typeof chart === 'object' && this.api) {
                    this.api.asc_addChartDrawingObject(chart);
                    this.isFrameClosed = false;
                }
            },

            getChartData: function() {
                if (this.api) {
                    var chartData = this.api.asc_getWordChartObject();

                    if (typeof chartData === 'object') {
                        Common.Gateway.internalMessage('chartData', {
                            data: chartData
                        });
                    }
                }
            },

            clearChartData: function() {
                this.api && this.api.asc_closeCellEditor();
            },

            setMergeData: function(merge) {
                if (typeof merge === 'object' && this.api) {
                    this.api.asc_setData(merge);
                    this.isFrameClosed = false;
                }
            },

            getMergeData: function() {
                if (this.api) {
                    var mergeData = this.api.asc_getData();

                    if (typeof mergeData === 'object') {
                        Common.Gateway.internalMessage('mergeData', {
                            data: mergeData
                        });
                    }
                }
            },

            unitsChanged: function(m) {
                var value = Common.localStorage.getItem("sse-settings-unit");
                Common.Utils.Metric.setCurrentMetric((value!==null) ? parseInt(value) : Common.Utils.Metric.getDefaultMetric());
                this.getApplication().getController('RightMenu').updateMetricUnit();
                this.getApplication().getController('Print').getView('MainSettingsPrint').updateMetricUnit();
            },

            _compareActionStrong: function(obj1, obj2){
                return obj1.id === obj2.id && obj1.type === obj2.type;
            },

            _compareActionWeak: function(obj1, obj2){
                return obj1.type === obj2.type;
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

            onNamedRangeLocked: function() {
                if ($('.asc-window.modal.alert:visible').length < 1) {
                    Common.UI.alert({
                        closable: false,
                        msg: this.errorCreateDefName,
                        title: this.notcriticalErrorTitle,
                        iconCls: 'warn',
                        buttons: ['ok'],
                        callback: _.bind(function(btn){
                            this.onEditComplete();
                        }, this)
                    });
                }
            },

            onTryUndoInFastCollaborative: function() {
                var val = window.localStorage.getItem("sse-hide-try-undoredo");
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
                            if (dontshow) window.localStorage.setItem("sse-hide-try-undoredo", 1);
                            if (btn == 'custom') {
                                Common.localStorage.setItem("sse-settings-coauthmode", 0);
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
                    var value = Common.localStorage.getItem("sse-settings-coauthmode"),
                        oldval = this._state.fastCoauth;
                    this._state.fastCoauth = (value===null || parseInt(value) == 1);
                    if (this._state.fastCoauth && !oldval)
                        this.toolbarView.synchronizeChanges();
                }
            },

            onDocumentName: function(name) {
                this.headerView.setDocumentCaption(name);
                this.updateWindowTitle(this.api.asc_isDocumentModified(), true);
            },

            onMeta: function(meta) {
                var app = this.getApplication(),
                    filemenu = app.getController('LeftMenu').getView('LeftMenu').getMenu('file');
                app.getController('Viewport').getView('Common.Views.Header').setDocumentCaption(meta.title);
                this.updateWindowTitle(this.api.asc_isDocumentModified(), true);
                this.appOptions.spreadsheet.title = meta.title;
                filemenu.loadDocument({doc:this.appOptions.spreadsheet});
                filemenu.panels['info'].updateInfo(this.appOptions.spreadsheet);
                Common.Gateway.metaChange(meta);
            },

            onPrint: function() {
                if (!this.appOptions.canPrint) return;
                Common.NotificationCenter.trigger('print', this);
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
                    baseUrl = plugins.url;
                pluginsData.forEach(function(item){
                    var url = item;
                    if (!/(^https?:\/\/)/i.test(url) && !/(^www.)/i.test(item))
                        url = baseUrl + item;
                    var value = _getPluginJson(url);
                    if (value) arr.push(value);
                });

                if (arr.length>0)
                    this.updatePluginsList({
                        autoStartGuid: plugins.autoStartGuid,
                        url: plugins.url,
                        pluginsData: arr
                    }, !!uiCustomize);
            },

            updatePluginsList: function(plugins, uiCustomize) {
                var pluginStore = this.getApplication().getCollection('Common.Collections.Plugins'),
                    isEdit = this.appOptions.isEdit;
                if (plugins) {
                    var arr = [], arrUI = [];
                    plugins.pluginsData.forEach(function(item){
                        var variations = item.variations,
                            variationsArr = [];
                        variations.forEach(function(itemVar){
                            var isSupported = false;
                            for (var i=0; i<itemVar.EditorsSupport.length; i++){
                                if (itemVar.EditorsSupport[i]=='cell') {
                                    isSupported = true; break;
                                }
                            }
                            if (isSupported && (isEdit || itemVar.isViewer)) {
                                var isRelativeUrl = !(/(^https?:\/\/)/i.test(itemVar.url) || /(^www.)/i.test(itemVar.url));
                                item.isUICustomizer ? arrUI.push((isRelativeUrl) ? ((item.baseUrl ? item.baseUrl : plugins.url) + itemVar.url) : itemVar.url) :
                                variationsArr.push(new Common.Models.PluginVariation({
                                    description: itemVar.description,
                                    index: variationsArr.length,
                                    url : itemVar.url,
                                    icons  : itemVar.icons,
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
                                    initOnSelectionChanged: itemVar.initOnSelectionChanged,
                                    isRelativeUrl: isRelativeUrl
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

                    if (!uiCustomize) {
                        if (pluginStore) pluginStore.reset(arr);
                        this.appOptions.pluginsPath = (plugins.url);
                        this.appOptions.canPlugins = (arr.length>0);
                    }
                } else if (!uiCustomize){
                    this.appOptions.pluginsPath = '';
                    this.appOptions.canPlugins = false;
                }
                if (this.appOptions.canPlugins) {
                    this.getApplication().getController('Common.Controllers.Plugins').setMode(this.appOptions);
                    if (plugins.autoStartGuid)
                        this.api.asc_pluginRun(plugins.autoStartGuid, 0, '');
                }
                if (!uiCustomize) this.getApplication().getController('LeftMenu').enablePlugins();
            },
            
            leavePageText: 'You have unsaved changes in this document. Click \'Stay on this Page\' then \'Save\' to save them. Click \'Leave this Page\' to discard all the unsaved changes.',
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
            savePreparingText: 'Preparing to save',
            savePreparingTitle: 'Preparing to save. Please wait...',
            loadingDocumentTitleText: 'Loading spreadsheet',
            uploadImageSizeMessage: 'Maximium image size limit exceeded.',
            uploadImageExtMessage: 'Unknown image format.',
            uploadImageFileCountMessage: 'No images uploaded.',
            reloadButtonText: 'Reload Page',
            unknownErrorText: 'Unknown error.',
            convertationTimeoutText: 'Convertation timeout exceeded.',
            downloadErrorText: 'Download failed.',
            unsupportedBrowserErrorText : 'Your browser is not supported.',
            requestEditFailedTitleText: 'Access denied',
            requestEditFailedMessageText: 'Someone is editing this document right now. Please try again later.',
            warnBrowserZoom: 'Your browser\'s current zoom setting is not fully supported. Please reset to the default zoom by pressing Ctrl+0.',
            warnBrowserIE9: 'The application has low capabilities on IE9. Use IE10 or higher',
            pastInMergeAreaError: 'Cannot change part of a merged cell',
            titleRecalcFormulas: 'Calculating formulas...',
            textRecalcFormulas: 'Calculating formulas...',
            textPleaseWait: 'It\'s working hard. Please wait...',
            errorWrongBracketsCount: 'Found an error in the formula entered.<br>Wrong cout of brackets.',
            errorWrongOperator: 'An error in the entered formula. Wrong operator is used.<br>Please correct the error or use the Esc button to cancel the formula editing.',
            errorCountArgExceed: 'Found an error in the formula entered.<br>Count of arguments exceeded.',
            errorCountArg: 'Found an error in the formula entered.<br>Invalid number of arguments.',
            errorFormulaName: 'Found an error in the formula entered.<br>Incorrect formula name.',
            errorFormulaParsing: 'Internal error while the formula parsing.',
            errorArgsRange: 'Found an error in the formula entered.<br>Incorrect arguments range.',
            errorUnexpectedGuid: 'External error.<br>Unexpected Guid. Please, contact support.',
            errorDatabaseConnection: 'External error.<br>Database connection error. Please, contact support.',
            errorFileRequest: 'External error.<br>File Request. Please, contact support.',
            errorFileVKey: 'External error.<br>Incorrect securety key. Please, contact support.',
            errorStockChart: 'Incorrect row order. To build a stock chart place the data on the sheet in the following order:<br> opening price, max price, min price, closing price.',
            errorDataRange: 'Incorrect data range.',
            errorOperandExpected: 'Operand expected',
            errorKeyEncrypt: 'Unknown key descriptor',
            errorKeyExpire: 'Key descriptor expired',
            errorUsersExceed: 'Count of users was exceed',
            errorMoveRange: 'Cann\'t change a part of merged cell',
            errorBadImageUrl: 'Image url is incorrect',
            errorCoAuthoringDisconnect: 'Server connection lost. You can\'t edit anymore.',
            errorFilePassProtect: 'The document is password protected.',
            errorLockedAll: 'The operation could not be done as the sheet has been locked by another user.',
            txtEditingMode: 'Set editing mode...',
            textLoadingDocument: 'Loading spreadsheet',
            textConfirm: 'Confirmation',
            confirmMoveCellRange: 'The destination cell\'s range can contain data. Continue the operation?',
            textYes: 'Yes',
            textNo: 'No',
            textAnonymous: 'Anonymous',
            txtBasicShapes: 'Basic Shapes',
            txtFiguredArrows: 'Figured Arrows',
            txtMath: 'Math',
            txtCharts: 'Charts',
            txtStarsRibbons: 'Stars & Ribbons',
            txtCallouts: 'Callouts',
            txtButtons: 'Buttons',
            txtRectangles: 'Rectangles',
            txtLines: 'Lines',
            txtDiagramTitle: 'Chart Title',
            txtXAxis: 'X Axis',
            txtYAxis: 'Y Axis',
            txtSeries: 'Seria',
            warnProcessRightsChange: 'You have been denied the right to edit the file.',
            errorProcessSaveResult: 'Saving is failed.',
            errorAutoFilterDataRange: 'The operation could not be done for the selected range of cells.<br>Select a uniform data range inside or outside the table and try again.',
            errorAutoFilterChangeFormatTable: 'The operation could not be done for the selected cells as you cannot move a part of the table.<br>Select another data range so that the whole table was shifted and try again.',
            errorAutoFilterHiddenRange: 'The operation cannot be performed because the area contains filtered cells.<br>Please unhide the filtered elements and try again.',
            errorAutoFilterChange: 'The operation is not allowed, as it is attempting to shift cells in a table on your worksheet.',
            textCloseTip: 'Click to close the tip.',
            textShape: 'Shape',
            errorFillRange: 'Could not fill the selected range of cells.<br>All the merged cells need to be the same size.',
            errorUpdateVersion: 'The file version has been changed. The page will be reloaded.',
            defaultTitleText: 'ONLYOFFICE Spreadsheet Editor',
            errorUserDrop: 'The file cannot be accessed right now.',
            txtArt: 'Your text here',
            errorInvalidRef: 'Enter a correct name for the selection or a valid reference to go to.',
            errorCreateDefName: 'The existing named ranges cannot be edited and the new ones cannot be created<br>at the moment as some of them are being edited.',
            errorPasteMaxRange: 'The copy and paste area does not match. Please select an area with the same size or click the first cell in a row to paste the copied cells.',
            errorConnectToServer: ' The document could not be saved. Please check connection settings or contact your administrator.<br>When you click the \'OK\' button, you will be prompted to download the document.<br><br>' +
                                  'Find more information about connecting Document Server <a href=\"https://api.onlyoffice.com/editors/callback\" target=\"_blank\">here</a>',
            errorLockedWorksheetRename: 'The sheet cannot be renamed at the moment as it is being renamed by another user',
            textTryUndoRedo: 'The Undo/Redo functions are disabled for the Fast co-editing mode.<br>Click the \'Strict mode\' button to switch to the Strict co-editing mode to edit the file without other users interference and send your changes only after you save them. You can switch between the co-editing modes using the editor Advanced settings.',
            textStrict: 'Strict mode',
            errorOpenWarning: 'The length of one of the formulas in the file exceeded<br>the allowed number of characters and it was removed.',
            errorFrmlWrongReferences: 'The function refers to a sheet that does not exist.<br>Please check the data and try again.',
            textBuyNow: 'Visit website',
            textNoLicenseTitle: 'ONLYOFFICE open source version',
            warnNoLicense: 'You are using an open source version of ONLYOFFICE. The version has limitations for concurrent connections to the document server (20 connections at a time).<br>If you need more please consider purchasing a commercial license.',
            textContactUs: 'Contact sales',
            confirmPutMergeRange: 'The source data contains merged cells.<br>They will be unmerged before they are pasted into the table.',
            errorViewerDisconnect: 'Connection is lost. You can still view the document,<br>but will not be able to download or print until the connection is restored.',
            warnLicenseExp: 'Your license has expired.<br>Please update your license and refresh the page.',
            titleLicenseExp: 'License expired',
            openErrorText: 'An error has occurred while opening the file',
            saveErrorText: 'An error has occurred while saving the file',
            errorCopyMultiselectArea: 'This command cannot be used with multiple selections.<br>Select a single range and try again.',
            errorPrintMaxPagesCount: 'Unfortunately, it’s not possible to print more than 1500 pages at once in the current version of the program.<br>This restriction will be eliminated in upcoming releases.',
            errorToken: 'The document security token is not correctly formed.<br>Please contact your Document Server administrator.',
            errorTokenExpire: 'The document security token has expired.<br>Please contact your Document Server administrator.',
            errorSessionAbsolute: 'The document editing session has expired. Please reload the page.',
            errorSessionIdle: 'The document has not been edited for quite a long time. Please reload the page.',
            errorSessionToken: 'The connection to the server has been interrupted. Please reload the page.',
            errorAccessDeny: 'You are trying to perform an action you do not have rights for.<br>Please contact your Document Server administrator.'
        }
    })(), SSE.Controllers.Main || {}))
});
