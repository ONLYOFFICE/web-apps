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
 *  Main.js
 *  Spreadsheet Editor
 *
 *  Created by Maxim Kadushkin on 11/15/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'jquery',
    'underscore',
    'backbone',
    'irregularstack',
    'common/main/lib/util/LocalStorage'
    ,'common/main/lib/util/LanguageInfo'
], function (core, $, _, Backbone) {
    'use strict';

    SSE.Controllers.Main = Backbone.Controller.extend(_.extend((function() {
        var ApplyEditRights = -255;
        var LoadingDocument = -256;

        Common.localStorage.setId('table');
        Common.localStorage.setKeysFilter('sse-,asc.table');
        Common.localStorage.sync();

        return {
            models: [],
            collections: [],
            views: [],

            initialize: function() {
                //
            },

            onLaunch: function() {
                var me = this;

                me.stackLongActions = new Common.IrregularStack({
                    strongCompare   : function(obj1, obj2){return obj1.id === obj2.id && obj1.type === obj2.type;},
                    weakCompare     : function(obj1, obj2){return obj1.type === obj2.type;}
                });

                this._state = {
                    isDisconnected      : false,
                    usersCount          : 1,
                    fastCoauth          : true,
                    lostEditingRights   : false,
                    licenseType         : false
                };

                // Initialize viewport

//                if (!Common.Utils.isBrowserSupported()){
//                    Common.Utils.showBrowserRestriction();
//                    Common.Gateway.reportError(undefined, this.unsupportedBrowserErrorText);
//                    return;
//                }

                // Initialize api

                // window["flat_desine"] = true;

                var styleNames = ['Normal', 'Neutral', 'Bad', 'Good', 'Input', 'Output', 'Calculation', 'Check Cell', 'Explanatory Text', 'Note', 'Linked Cell', 'Warning Text',
                        'Heading 1', 'Heading 2', 'Heading 3', 'Heading 4', 'Title', 'Total', 'Currency', 'Percent', 'Comma'],
                    translate = {
                        'Series': me.txtSeries,
                        'Diagram Title': me.txtDiagramTitle,
                        'X Axis': me.txtXAxis,
                        'Y Axis': me.txtYAxis,
                        'Your text here': me.txtArt
                    };
                styleNames.forEach(function(item){
                    translate[item] = me['txtStyle_' + item.replace(/ /g, '_')] || item;
                });
                translate['Currency [0]'] = me.txtStyle_Currency + ' [0]';
                translate['Comma [0]'] = me.txtStyle_Comma + ' [0]';

                for (var i=1; i<7; i++) {
                    translate['Accent'+i] = me.txtAccent + i;
                    translate['20% - Accent'+i] = '20% - ' + me.txtAccent + i;
                    translate['40% - Accent'+i] = '40% - ' + me.txtAccent + i;
                    translate['60% - Accent'+i] = '60% - ' + me.txtAccent + i;
                }

                me.api = new Asc.spreadsheet_api({
                    'id-view'  : 'editor_sdk',
                    'id-input' : 'ce-cell-content'
                    ,'mobile'  : true,
                    'translate': translate
                });

                // Localization uiApp params
                uiApp.params.modalButtonOk = me.textOK;
                uiApp.params.modalButtonCancel = me.textCancel;
                uiApp.params.modalPreloaderTitle = me.textPreloader;
                uiApp.params.modalUsernamePlaceholder = me.textUsername;
                uiApp.params.modalPasswordPlaceholder = me.textPassword;
                uiApp.params.smartSelectBackText = me.textBack;
                uiApp.params.smartSelectPopupCloseText = me.textClose;
                uiApp.params.smartSelectPickerCloseText = me.textDone;
                uiApp.params.notificationCloseButtonText = me.textClose;

                if (me.api){
                    var value = Common.localStorage.getItem("sse-settings-fontrender");
                    if (value===null) value = window.devicePixelRatio > 1 ? '1' : '3';
                    me.api.asc_setFontRenderingMode(parseInt(value));

                    Common.Utils.Metric.setCurrentMetric(1); //pt

                    me.api.asc_registerCallback('asc_onError',                      _.bind(me.onError, me));
                    me.api.asc_registerCallback('asc_onOpenDocumentProgress',       _.bind(me.onOpenDocument, me));
                    me.api.asc_registerCallback('asc_onAdvancedOptions',            _.bind(me.onAdvancedOptions, me));
                    me.api.asc_registerCallback('asc_onDocumentUpdateVersion',      _.bind(me.onUpdateVersion, me));
                    me.api.asc_registerCallback('asc_onServerVersion',              _.bind(me.onServerVersion, me));
                    me.api.asc_registerCallback('asc_onPrintUrl',                   _.bind(me.onPrintUrl, me));
                    me.api.asc_registerCallback('asc_onDocumentName',               _.bind(me.onDocumentName, me));
                    me.api.asc_registerCallback('asc_onEndAction',                  _.bind(me.onLongActionEnd, me));
/**/
                    // this.api.asc_registerCallback('asc_onCoAuthoringDisconnect', _.bind(this.onCoAuthoringDisconnect, this));
                    // this.api.asc_registerCallback('asc_onPrintUrl',              _.bind(this.onPrintUrl, this));
                    // this.api.asc_registerCallback('asc_onMeta',                  _.bind(this.onMeta, this));
/**/
                    Common.NotificationCenter.on('api:disconnect',                  _.bind(me.onCoAuthoringDisconnect, me));
                    Common.NotificationCenter.on('goback',                          _.bind(me.goBack, me));

                    // Initialize descendants
                    _.each(me.getApplication().controllers, function(controller) {
                        if (controller && _.isFunction(controller.setApi)) {
                            controller.setApi(me.api);
                        }
                    });

                    // Initialize api gateway
                    me.editorConfig = {};
                    me.appOptions   = {};
                    me.plugins      = undefined;

                    Common.Gateway.on('init',           _.bind(me.loadConfig, me));
                    Common.Gateway.on('showmessage',    _.bind(me.onExternalMessage, me));
                    Common.Gateway.on('opendocument',   _.bind(me.loadDocument, me));
                    Common.Gateway.appReady();

                    Common.Gateway.on('internalcommand', function(data) {
                        if (data.command=='hardBack') {
                            if ($('.modal-in').length>0) {
                                if ( !$(me.loadMask).hasClass('modal-in') )
                                    uiApp.closeModal();
                                Common.Gateway.internalMessage('hardBack', false);
                            } else
                                Common.Gateway.internalMessage('hardBack', true);
                        }
                    });
                    Common.Gateway.internalMessage('listenHardBack');
                }

                me.defaultTitleText = me.defaultTitleText || '{{APP_TITLE_TEXT}}';
                me.warnNoLicense  = me.warnNoLicense.replace('%1', '{{COMPANY_NAME}}');
                me.warnNoLicenseUsers = me.warnNoLicenseUsers.replace('%1', '{{COMPANY_NAME}}');
                me.textNoLicenseTitle = me.textNoLicenseTitle.replace('%1', '{{COMPANY_NAME}}');
            },

            loadConfig: function(data) {
                var me = this;

                me.editorConfig = $.extend(me.editorConfig, data.config);

                me.editorConfig.user          =
                me.appOptions.user            = Common.Utils.fillUserInfo(me.editorConfig.user, me.editorConfig.lang, me.textAnonymous);
                me.appOptions.nativeApp       = me.editorConfig.nativeApp === true;
                me.appOptions.isDesktopApp    = me.editorConfig.targetApp == 'desktop';
                me.appOptions.canCreateNew    = !_.isEmpty(me.editorConfig.createUrl) && !me.appOptions.isDesktopApp;
                me.appOptions.canOpenRecent   = me.editorConfig.nativeApp !== true && me.editorConfig.recent !== undefined && !me.appOptions.isDesktopApp;
                me.appOptions.templates       = me.editorConfig.templates;
                me.appOptions.recent          = me.editorConfig.recent;
                me.appOptions.createUrl       = me.editorConfig.createUrl;
                me.appOptions.lang            = me.editorConfig.lang;
                me.appOptions.location        = (typeof (me.editorConfig.location) == 'string') ? me.editorConfig.location.toLowerCase() : '';
                me.appOptions.sharingSettingsUrl = me.editorConfig.sharingSettingsUrl;
                me.appOptions.fileChoiceUrl   = me.editorConfig.fileChoiceUrl;
                me.appOptions.mergeFolderUrl  = me.editorConfig.mergeFolderUrl;
                me.appOptions.canAnalytics    = false;
                me.appOptions.customization   = me.editorConfig.customization;
                me.appOptions.canBackToFolder = (me.editorConfig.canBackToFolder!==false) && (typeof (me.editorConfig.customization) == 'object')
                    && (typeof (me.editorConfig.customization.goback) == 'object') && !_.isEmpty(me.editorConfig.customization.goback.url);
                me.appOptions.canBack         = me.editorConfig.nativeApp !== true && me.appOptions.canBackToFolder === true;
                me.appOptions.canPlugins      = false;
                me.plugins                    = me.editorConfig.plugins;

                if (me.editorConfig.lang)
                    me.api.asc_setLocale((me.editorConfig.lang) ? parseInt(Common.util.LanguageInfo.getLocalLanguageCode(me.editorConfig.lang)) : 0x0409);

               if (me.appOptions.location == 'us' || me.appOptions.location == 'ca')
                   Common.Utils.Metric.setDefaultMetric(Common.Utils.Metric.c_MetricUnits.inch);
            },

            loadDocument: function(data) {
                this.appOptions.spreadsheet = data.doc;
                this.permissions = {};
                var docInfo = {};

                if ( data.doc ) {
                    this.permissions = $.extend(this.permissions, data.doc.permissions);

                    var _permissions = $.extend({}, data.doc.permissions),
                        _user = new Asc.asc_CUserInfo();
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
                    docInfo.put_Permissions(_permissions);
                }

                this.api.asc_registerCallback('asc_onGetEditorPermissions', _.bind(this.onEditorPermissions, this));
                this.api.asc_registerCallback('asc_onLicenseChanged',       _.bind(this.onLicenseChanged, this));
                this.api.asc_setDocInfo(docInfo);
                this.api.asc_getEditorPermissions(this.editorConfig.licenseUrl, this.editorConfig.customerId);

                Common.SharedSettings.set('document', data.doc);


                if (data.doc) {
                    SSE.getController('Toolbar').setDocumentTitle(data.doc.title);
                }
            },

            setMode: function(mode){
                var me = this;

                Common.SharedSettings.set('mode', mode.isEdit ? 'edit' : 'view');

                if ( me.api ) {
                    me.api.asc_enableKeyEvents(mode.isEdit);
                    me.api.asc_setViewMode(!mode.isEdit);
                }
            },

            onProcessSaveResult: function(data) {
                this.api.asc_OnSaveEnd(data.result);

                if (data && data.result === false) {
                    uiApp.alert(
                        _.isEmpty(data.message) ? this.errorProcessSaveResult : data.message,
                        this.criticalErrorTitle
                    );
                }
            },

            onProcessRightsChange: function(data) {
                if (data && data.enabled === false) {
                    var me = this,
                        old_rights = this._state.lostEditingRights;
                    this._state.lostEditingRights = !this._state.lostEditingRights;
                    this.api.asc_coAuthoringDisconnect();
                    Common.NotificationCenter.trigger('api:disconnect');

                    if (!old_rights) {
                        uiApp.alert(
                            _.isEmpty(data.message) ? this.warnProcessRightsChange : data.message,
                            this.notcriticalErrorTitle,
                            function () {
                                me._state.lostEditingRights = false;
                            }
                        );
                    }
                }
            },

            onDownloadAs: function() {
                if ( !this.appOptions.canDownload) {
                    Common.Gateway.reportError(Asc.c_oAscError.ID.AccessDeny, this.errorAccessDeny);
                    return;
                }
                this._state.isFromGatewayDownloadAs = true;
                this.api.asc_DownloadAs(Asc.c_oAscFileType.XLSX, true);
            },

            goBack: function(current) {
                var href = this.appOptions.customization.goback.url;
                if (!current && this.appOptions.customization.goback.blank!==false) {
                    window.open(href, "_blank");
                } else {
                    parent.location.href = href;
                }
            },

            onLongActionBegin: function(type, id) {
                var action = {id: id, type: type};
                this.stackLongActions.push(action);
                this.setLongActionView(action);
            },

            onLongActionEnd: function(type, id) {
                var me = this,
                    action = {id: id, type: type};

                me.stackLongActions.pop(action);

                me.updateWindowTitle(true);

                if (type === Asc.c_oAscAsyncActionType.BlockInteraction && id == Asc.c_oAscAsyncAction.Open) {
                    Common.Gateway.internalMessage('documentReady', {});
                    Common.NotificationCenter.trigger('document:ready');
                    me.onDocumentContentReady();
                }

                action = me.stackLongActions.get({type: Asc.c_oAscAsyncActionType.Information});
                action && me.setLongActionView(action);

                action = me.stackLongActions.get({type: Asc.c_oAscAsyncActionType.BlockInteraction});

                if (action) {
                    me.setLongActionView(action)
                } else {
                    _.delay(function () {
                        $(me.loadMask).hasClass('modal-in') && uiApp.closeModal(me.loadMask);
                    }, 300);
                }

                if (id==Asc.c_oAscAsyncAction['Save'] && (!me._state.fastCoauth || me._state.usersCount<2)) {
                    this.synchronizeChanges();
                }
            },

            setLongActionView: function(action) {
                var me = this,
                    title = '',
                    text = '';

                switch (action.id) {
                    case Asc.c_oAscAsyncAction['Open']:
                        title   = me.openTitleText;
                        text    = me.openTextText;
                        break;

                    case Asc.c_oAscAsyncAction['Save']:
                        // clearTimeout(me._state.timerSave);
                        title   = me.saveTitleText;
                        text    = me.saveTextText;
                        break;

                    case Asc.c_oAscAsyncAction['LoadDocumentFonts']:
                        title   = me.loadFontsTitleText;
                        text    = me.loadFontsTextText;
                        break;

                    case Asc.c_oAscAsyncAction['LoadDocumentImages']:
                        title   = me.loadImagesTitleText;
                        text    = me.loadImagesTextText;
                        break;

                    case Asc.c_oAscAsyncAction['LoadFont']:
                        title   = me.loadFontTitleText;
                        text    = me.loadFontTextText;
                        break;

                    case Asc.c_oAscAsyncAction['LoadImage']:
                        title   = me.loadImageTitleText;
                        text    = me.loadImageTextText;
                        break;

                    case Asc.c_oAscAsyncAction['DownloadAs']:
                        title   = me.downloadTitleText;
                        text    = me.downloadTextText;
                        break;

                    case Asc.c_oAscAsyncAction['Print']:
                        title   = me.printTitleText;
                        text    = me.printTextText;
                        break;

                    case Asc.c_oAscAsyncAction['UploadImage']:
                        title   = me.uploadImageTitleText;
                        text    = me.uploadImageTextText;
                        break;

                    case Asc.c_oAscAsyncAction['ApplyChanges']:
                        title   = me.applyChangesTitleText;
                        text    = me.applyChangesTextText;
                        break;

                    case Asc.c_oAscAsyncAction['PrepareToSave']:
                        title   = me.savePreparingText;
                        text    = me.savePreparingTitle;
                        break;

                    case Asc.c_oAscAsyncAction['MailMergeLoadFile']:
                        title   = me.mailMergeLoadFileText;
                        text    = me.mailMergeLoadFileTitle;
                        break;

                    case Asc.c_oAscAsyncAction['DownloadMerge']:
                        title   = me.downloadMergeTitle;
                        text    = me.downloadMergeText;
                        break;

                    case Asc.c_oAscAsyncAction['SendMailMerge']:
                        title   = me.sendMergeTitle;
                        text    = me.sendMergeText;
                        break;

                    case Asc.c_oAscAsyncAction['Waiting']:
                        title   = me.waitText;
                        text    = me.waitText;
                        break;

                    case ApplyEditRights:
                        title   = me.txtEditingMode;
                        text    = me.txtEditingMode;
                        break;

                    case LoadingDocument:
                        title   = me.loadingDocumentTitleText;
                        text    = me.loadingDocumentTextText;
                        break;
                    default:
                        if (typeof action.id == 'string'){
                            title   = action.id;
                            text    = action.id;
                        }
                        break;
                }

                if (action.type == Asc.c_oAscAsyncActionType.BlockInteraction) {
                    if (me.loadMask && $(me.loadMask).hasClass('modal-in')) {
                        $$(me.loadMask).find('.modal-title').text(title);
                    } else if ($$('.modal.modal-in').length < 1) {
                        me.loadMask = uiApp.showPreloader(title);
                    }
                }
                else {
//                    me.getApplication().getController('Statusbar').setStatusCaption(text);
                }
            },

            onDocumentContentReady: function() {
                if (this._isDocReady)
                    return;

                if (this._state.openDlg)
                    uiApp.closeModal(this._state.openDlg);

                var me = this,
                    value;

                me._isDocReady = true;

                var worksheetsCount = this.api.asc_getWorksheetsCount();
                var i = me.api.asc_getActiveWorksheetIndex();
                me.api.asc_showWorksheet(i);
                me.api.asc_Resize();
                // me.api.asc_cleanSelection();

                me.hidePreloader();
                me.onLongActionEnd(Asc.c_oAscAsyncActionType.BlockInteraction, LoadingDocument);

                value = (this.appOptions.isEditMailMerge || this.appOptions.isEditDiagram) ? 100 : Common.localStorage.getItem("sse-settings-zoom");
                var zf = (value!==null) ? parseInt(value)/100 : (this.appOptions.customization && this.appOptions.customization.zoom ? parseInt(this.appOptions.customization.zoom)/100 : 1);
                this.api.asc_setZoom(zf>0 ? zf : 1);

                /** coauthoring begin **/
                value = Common.localStorage.getItem("sse-settings-livecomment");
                this.isLiveCommenting = !(value!==null && parseInt(value) == 0);
                this.isLiveCommenting?this.api.asc_showComments(true):this.api.asc_hideComments();

                if (this.appOptions.isEdit && this.appOptions.canLicense && !this.appOptions.isOffline && this.appOptions.canCoAuthoring) {
                    // Force ON fast co-authoring mode
                    me._state.fastCoauth = true;
                } else
                    this._state.fastCoauth = false;
                this.api.asc_SetFastCollaborative(this._state.fastCoauth);
                /** coauthoring end **/

                me.api.asc_registerCallback('asc_onStartAction',            _.bind(me.onLongActionBegin, me));
                me.api.asc_registerCallback('asc_onEndAction',              _.bind(me.onLongActionEnd, me));
                me.api.asc_registerCallback('asc_onCoAuthoringDisconnect',  _.bind(me.onCoAuthoringDisconnect, me));
                me.api.asc_registerCallback('asc_onPrint',                  _.bind(me.onPrint, me));

                me.updateWindowTitle(true);

                if (me.appOptions.isEdit) {
                    if (me.appOptions.canAutosave) {
                        value = Common.localStorage.getItem("sse-settings-autosave");
                        if (value===null && me.appOptions.customization && me.appOptions.customization.autosave===false) {
                            value = 0;
                        }
                        // value = (!me._state.fastCoauth && value!==null) ? parseInt(value) : (me.appOptions.canCoAuthoring ? 1 : 0);
                        value = 1; // FORCE AUTOSAVE
                    } else {
                        value = 0;
                    }
                    me.api.asc_setAutoSaveGap(value);

                    if (me.needToUpdateVersion) {
                        Common.NotificationCenter.trigger('api:disconnect');
                    }
                }

                if (me.appOptions.canAnalytics && false) {
                    Common.component.Analytics.initialize('UA-12442749-13', 'Spreadsheet Editor');
                }

                Common.Gateway.on('processsaveresult',      _.bind(me.onProcessSaveResult, me));
                Common.Gateway.on('processrightschange',    _.bind(me.onProcessRightsChange, me));
                Common.Gateway.on('downloadas',             _.bind(me.onDownloadAs, me));

                Common.Gateway.sendInfo({
                    mode: me.appOptions.isEdit ? 'edit' : 'view'
                });

                me.applyLicense();

                $('.view-main').on('click', function (e) {
                    uiApp.closeModal('.document-menu.modal-in');
                });

                $(document).on('contextmenu', _.bind(me.onContextMenu, me));
                Common.Gateway.documentReady();
            },

            onLicenseChanged: function(params) {
                if (this.appOptions.isEditDiagram || this.appOptions.isEditMailMerge) return;

                var licType = params.asc_getLicenseType();
                if (licType !== undefined && this.appOptions.canEdit && this.editorConfig.mode !== 'view' &&
                    (licType===Asc.c_oLicenseResult.Connections || licType===Asc.c_oLicenseResult.UsersCount || licType===Asc.c_oLicenseResult.ConnectionsOS || licType===Asc.c_oLicenseResult.UsersCountOS))
                    this._state.licenseType = licType;

                if (this._isDocReady && this._state.licenseType)
                    this.applyLicense();
            },

            applyLicense: function() {
                var me = this;
                if (this._state.licenseType) {
                    var license = this._state.licenseType,
                        buttons = [{text: 'OK'}];
                    if (license===Asc.c_oLicenseResult.Connections || license===Asc.c_oLicenseResult.UsersCount) {
                        license = (license===Asc.c_oLicenseResult.Connections) ? this.warnLicenseExceeded : this.warnLicenseUsersExceeded;
                    } else {
                        license = (license===Asc.c_oLicenseResult.ConnectionsOS) ? this.warnNoLicense : this.warnNoLicenseUsers;
                        buttons = [{
                                        text: me.textBuyNow,
                                        bold: true,
                                        onClick: function() {
                                            window.open('{{PUBLISHER_URL}}', "_blank");
                                        }
                                    },
                                    {
                                        text: me.textContactUs,
                                        onClick: function() {
                                            window.open('mailto:{{SALES_EMAIL}}', "_blank");
                                        }
                                    }];
                    }
                    SSE.getController('Toolbar').activateViewControls();
                    SSE.getController('Toolbar').deactivateEditControls();
                    Common.NotificationCenter.trigger('api:disconnect');

                    var value = Common.localStorage.getItem("sse-license-warning");
                    value = (value!==null) ? parseInt(value) : 0;
                    var now = (new Date).getTime();

                    if (now - value > 86400000) {
                        Common.localStorage.setItem("sse-license-warning", now);
                        uiApp.modal({
                            title: me.textNoLicenseTitle,
                            text : license,
                            buttons: buttons
                        });
                    }
                } else {
                    if (!me.appOptions.isDesktopApp && !me.appOptions.canBrandingExt &&
                        me.editorConfig && me.editorConfig.customization && (me.editorConfig.customization.loaderName || me.editorConfig.customization.loaderLogo)) {
                        uiApp.modal({
                            title: me.textPaidFeature,
                            text  : me.textCustomLoader,
                            buttons: [{
                                text: me.textContactUs,
                                bold: true,
                                onClick: function() {
                                    window.open('mailto:{{SALES_EMAIL}}', "_blank");
                                }
                            },
                                { text: me.textClose }]
                        });
                    }
                    SSE.getController('Toolbar').activateControls();
                }
            },

            onOpenDocument: function(progress) {
                if (this.loadMask) {
                    var $title = $$(this.loadMask).find('.modal-title'),
                        proc = (progress.asc_getCurrentFont() + progress.asc_getCurrentImage())/(progress.asc_getFontsCount() + progress.asc_getImagesCount());

                    $title.text(this.textLoadingDocument + ': ' + Math.min(Math.round(proc * 100), 100) + '%');
                }
            },

            onEditorPermissions: function(params) {
                var me = this,
                    licType = params ? params.asc_getLicenseType() : Asc.c_oLicenseResult.Error;

                if (params && !(me.appOptions.isEditDiagram || me.appOptions.isEditMailMerge)) {
                    if (Asc.c_oLicenseResult.Expired === licType ||
                        Asc.c_oLicenseResult.Error === licType ||
                        Asc.c_oLicenseResult.ExpiredTrial === licType) {
                        uiApp.modal({
                            title   : me.titleLicenseExp,
                            text    : me.warnLicenseExp
                        });
                        return;
                    }

                    if ( me.onServerVersion(params.asc_getBuildVersion()) ) return;

                    if (params.asc_getRights() !== Asc.c_oRights.Edit) {
                        me.permissions.edit = false;
                    }

                    me.appOptions.canAutosave = true;
                    me.appOptions.canAnalytics = params.asc_getIsAnalyticsEnable();

                    me.appOptions.isOffline      = me.api.asc_isOffline();
                    me.appOptions.canLicense     = (licType === Asc.c_oLicenseResult.Success || licType === Asc.c_oLicenseResult.SuccessLimit);
                    me.appOptions.isLightVersion = params.asc_getIsLight();
                    /** coauthoring begin **/
                    me.appOptions.canCoAuthoring = !me.appOptions.isLightVersion;
                    /** coauthoring end **/
                    me.appOptions.canComments    = me.appOptions.canLicense && !((typeof (me.editorConfig.customization) == 'object') && me.editorConfig.customization.comments===false);
                    me.appOptions.canChat        = me.appOptions.canLicense && !me.appOptions.isOffline && !((typeof (me.editorConfig.customization) == 'object') && me.editorConfig.customization.chat===false);
                    me.appOptions.canRename      = !!me.permissions.rename;

                    me.appOptions.canBranding  = params.asc_getCustomization();
                    me.appOptions.canBrandingExt = params.asc_getCanBranding() && (typeof me.editorConfig.customization == 'object');
                }

                me.appOptions.canRequestEditRights = me.editorConfig.canRequestEditRights;
                me.appOptions.canRequestClose = me.editorConfig.canRequestClose;
                me.appOptions.canEdit        = me.permissions.edit !== false && // can edit
                    (me.editorConfig.canRequestEditRights || me.editorConfig.mode !== 'view'); // if mode=="view" -> canRequestEditRights must be defined
                me.appOptions.isEdit         = (me.appOptions.canLicense || me.appOptions.isEditDiagram || me.appOptions.isEditMailMerge) && me.permissions.edit !== false && me.editorConfig.mode !== 'view';
                me.appOptions.canDownload    = !me.appOptions.nativeApp && (me.permissions.download !== false);
                me.appOptions.canPrint       = (me.permissions.print !== false);

                me.applyModeCommonElements();
                me.applyModeEditorElements();

                me.api.asc_setViewMode(!me.appOptions.isEdit);
                me.api.asc_LoadDocument();

                if (!me.appOptions.isEdit) {
                    me.hidePreloader();
                    me.onLongActionBegin(Asc.c_oAscAsyncActionType.BlockInteraction, LoadingDocument);
                }
            },

            applyModeCommonElements: function() {
                var me = this;

                window.editor_elements_prepared = true;

                _.each(me.getApplication().controllers, function(controller) {
                    if (controller && _.isFunction(controller.setMode)) {
                        controller.setMode(me.appOptions);
                    }
                });

                if (!me.appOptions.isEditMailMerge && !me.appOptions.isEditDiagram) {
                    me.api.asc_registerCallback('asc_onSendThemeColors', _.bind(me.onSendThemeColors, me));
                    me.api.asc_registerCallback('asc_onDownloadUrl',     _.bind(me.onDownloadUrl, me));
                }
            },

            applyModeEditorElements: function() {
                if (this.appOptions.isEdit) {
                    var me = this;

                    var value = Common.localStorage.getItem('sse-settings-unit');
                    Common.Utils.Metric.setCurrentMetric((value!==null) ? parseInt(value) : Common.Utils.Metric.getDefaultMetric());

                    me.api.asc_registerCallback('asc_onDocumentModifiedChanged', _.bind(me.onDocumentModifiedChanged, me));
                    me.api.asc_registerCallback('asc_onDocumentCanSaveChanged',  _.bind(me.onDocumentCanSaveChanged, me));
                    /** coauthoring begin **/
                    me.api.asc_registerCallback('asc_onCollaborativeChanges',    _.bind(me.onCollaborativeChanges, me));
                    me.api.asc_registerCallback('asc_OnTryUndoInFastCollaborative',_.bind(me.onTryUndoInFastCollaborative, me));
                    me.api.asc_registerCallback('asc_onAuthParticipantsChanged', _.bind(me.onAuthParticipantsChanged, me));
                    me.api.asc_registerCallback('asc_onParticipantsChanged',     _.bind(me.onAuthParticipantsChanged, me));
                    /** coauthoring end **/
                    if (me.appOptions.isEditDiagram)
                        me.api.asc_registerCallback('asc_onSelectionChanged',        _.bind(me.onSelectionChanged, me));

                    if (me.stackLongActions.exist({id: ApplyEditRights, type: Asc.c_oAscAsyncActionType.BlockInteraction})) {
                        me.onLongActionEnd(Asc.c_oAscAsyncActionType.BlockInteraction, ApplyEditRights);
                    } else if (!this._isDocReady) {
                        me.hidePreloader();
                        me.onLongActionBegin(Asc.c_oAscAsyncActionType.BlockInteraction, LoadingDocument);
                    }

                    // Message on window close
                    window.onbeforeunload = _.bind(me.onBeforeUnload, me);
                    window.onunload = _.bind(me.onUnload, me);
                }
            },

            onExternalMessage: function(msg) {
                if (msg && msg.msg) {
                    msg.msg = (msg.msg).toString();
                    uiApp.addNotification({
                        title: uiApp.params.modalTitle,
                        message: [msg.msg.charAt(0).toUpperCase() + msg.msg.substring(1)]
                    });

                    Common.component.Analytics.trackEvent('External Error');
                }
            },

            onError: function(id, level, errData) {
                if (id == Asc.c_oAscError.ID.LoadingScriptError) {
                    uiApp.addNotification({
                        title: this.criticalErrorTitle,
                        message: this.scriptLoadError
                    });
                    return;
                }

                this.hidePreloader();
                this.onLongActionEnd(Asc.c_oAscAsyncActionType.BlockInteraction, LoadingDocument);

                var config = {
                    closable: false
                };

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

                    case Asc.c_oAscError.ID.MaxDataPointsError:
                        config.msg = this.errorMaxPoints;
                        break;

                    case Asc.c_oAscError.ID.FrmlOperandExpected:
                        config.msg = this.errorOperandExpected;
                        config.closable = true;
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
                        config.msg = this.errorConnectToServer.replace('%1', '{{API_URL_EDITING_CALLBACK}}');
                        break;

                    case Asc.c_oAscError.ID.LockedWorksheetRename:
                        config.msg = this.errorLockedWorksheetRename;
                        break;

                    case Asc.c_oAscError.ID.OpenWarning:
                        config.msg = this.errorOpenWarning;
                        break;

                    case Asc.c_oAscError.ID.FrmlWrongReferences:
                        config.msg = this.errorFrmlWrongReferences;
                        config.closable = true;
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

                    case Asc.c_oAscError.ID.DataEncrypted:
                        config.msg = this.errorDataEncrypted;
                        break;

                    case Asc.c_oAscError.ID.CannotChangeFormulaArray:
                        config.msg = this.errorChangeArray;
                        break;

                    case Asc.c_oAscError.ID.EditingError:
                        config.msg = this.errorEditingDownloadas;
                        break;

                    case Asc.c_oAscError.ID.MultiCellsInTablesFormulaArray:
                        config.msg = this.errorMultiCellFormula;
                        break;

                    default:
                        config.msg = this.errorDefaultMessage.replace('%1', id);
                        break;
                }


                if (level == Asc.c_oAscError.Level.Critical) {

                    // report only critical errors
                    Common.Gateway.reportError(id, config.msg);

                    config.title = this.criticalErrorTitle;
//                    config.iconCls = 'error';

                    if (this.appOptions.canBackToFolder && !this.appOptions.isDesktopApp) {
                        config.msg += '</br></br>' + this.criticalErrorExtText;
                        config.callback = function() {
                            Common.NotificationCenter.trigger('goback', true);
                        }
                    }
                    if (id == Asc.c_oAscError.ID.DataEncrypted) {
                        this.api.asc_coAuthoringDisconnect();
                        Common.NotificationCenter.trigger('api:disconnect');
                    }
                }
                else {
                    Common.Gateway.reportWarning(id, config.msg);

                    config.title    = this.notcriticalErrorTitle;
//                    config.iconCls  = 'warn';
//                    config.buttons  = ['ok'];
                    config.callback = _.bind(function(btn){
                        if (id == Asc.c_oAscError.ID.Warning && btn == 'ok' && (this.appOptions.canDownload || this.appOptions.canDownloadOrigin)) {
                            Common.UI.Menu.Manager.hideAll();
                            if (this.appOptions.isDesktopApp && this.appOptions.isOffline)
                                this.api.asc_DownloadAs();
                            else
                                (this.appOptions.canDownload) ? this.getApplication().getController('LeftMenu').leftMenu.showMenu('file:saveas') : this.api.asc_DownloadOrigin();
                        }
                        this._state.lostEditingRights = false;
                    }, this);
                }

//                Common.UI.alert(config);
                uiApp.modal({
                    title   : config.title,
                    text    : config.msg,
                    buttons: [
                        {
                            text: 'OK',
                            onClick: config.callback
                        }
                    ]
                });

                Common.component.Analytics.trackEvent('Internal Error', id.toString());
            },

            onCoAuthoringDisconnect: function() {
                this._state.isDisconnected = true;
            },

            updateWindowTitle: function(force) {
                var isModified = this.api.asc_isDocumentModified();
                if (this._state.isDocModified !== isModified || force) {
                    var title = this.defaultTitleText;

                    if (window.document.title != title)
                        window.document.title = title;

                    Common.Gateway.setDocumentModified(isModified);
                    this._state.isDocModified = isModified;
                }
            },

            onDocumentModifiedChanged: function() {
                var isModified = this.api.asc_isDocumentCanSave();
                if (this._state.isDocModified !== isModified) {
                    Common.Gateway.setDocumentModified(this.api.asc_isDocumentModified());
                }

                this.updateWindowTitle();
            },
            onDocumentCanSaveChanged: function (isCanSave) {
                //
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
                if (this.continueSavingTimer)
                    clearTimeout(this.continueSavingTimer);
            },

            hidePreloader: function() {
                $('#loading-mask').hide().remove();
            },

            onDownloadUrl: function(url) {
                if (this._state.isFromGatewayDownloadAs) {
                    Common.Gateway.downloadAs(url);
                }

                this._state.isFromGatewayDownloadAs = false;
            },

            onUpdateVersion: function(callback) {
                var me = this;
                me.needToUpdateVersion = true;
                me.onLongActionEnd(Asc.c_oAscAsyncActionType.BlockInteraction, LoadingDocument);

                uiApp.alert(
                    me.errorUpdateVersion,
                    me.titleUpdateVersion,
                    function () {
                        _.defer(function() {
                            Common.Gateway.updateVersion();

                            if (callback) {
                                callback.call(me);
                            }

                            me.onLongActionBegin(Asc.c_oAscAsyncActionType.BlockInteraction, LoadingDocument);
                        })
                });
            },

            onServerVersion: function(buildVersion) {
                var me = this;
                if (me.changeServerVersion) return true;

                if (DocsAPI.DocEditor.version() !== buildVersion && !window.compareVersions) {
                    me.changeServerVersion = true;
                    uiApp.alert(
                        me.errorServerVersion,
                        me.titleServerVersion,
                        function () {
                            _.defer(function() {
                                Common.Gateway.updateVersion();
                            })
                        });
                    return true;
                }
                return false;
            },

            onCollaborativeChanges: function() {
                //
            },
            /** coauthoring end **/

            synchronizeChanges: function() {
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
            },

            updateThemeColors: function() {
                //
            },

            onSendThemeColors: function(colors, standart_colors) {
               Common.Utils.ThemeColor.setColors(colors, standart_colors);
            },

            onAdvancedOptions: function(advOptions) {
                if (this._state.openDlg) return;

                var type = advOptions.asc_getOptionId(),
                    me = this;
                if (type == Asc.c_oAscAdvancedOptionsID.CSV) {
                    var picker,
                        pages = [],
                        pagesName = [];

                    _.each(advOptions.asc_getOptions().asc_getCodePages(), function(page) {
                        pages.push(page.asc_getCodePage());
                        pagesName.push(page.asc_getCodePageName());
                    });

                    $(me.loadMask).hasClass('modal-in') && uiApp.closeModal(me.loadMask);

                    me.onLongActionEnd(Asc.c_oAscAsyncActionType.BlockInteraction, LoadingDocument);

                    me._state.openDlg = uiApp.modal({
                        title: me.advCSVOptions,
                        text: '',
                        afterText:
                        '<div class="content-block small-picker" style="padding: 0; margin: 20px 0 0;">' +
                            '<div class="row">' +
                                '<div class="col-50" style="text-align: left;">' + me.txtEncoding + '</div>' +
                                '<div class="col-50" style="text-align: right;">' + me.txtDelimiter + '</div>' +
                            '</div>' +
                            '<div id="txt-encoding" class="small"></div>' +
                        '</div>',
                        buttons: [
                            {
                                text: 'OK',
                                bold: true,
                                onClick: function() {
                                    var encoding  = picker.cols[0].value,
                                        delimiter = picker.cols[1].value;

                                    if (me.api) {
                                        me.api.asc_setAdvancedOptions(type, new Asc.asc_CCSVAdvancedOptions(encoding, delimiter));

                                        if (!me._isDocReady) {
                                            me.onLongActionBegin(Asc.c_oAscAsyncActionType.BlockInteraction, LoadingDocument);
                                        }
                                    }
                                    me._state.openDlg = null;
                                }
                            }
                        ]
                    });

                    var recommendedSettings = advOptions.asc_getOptions().asc_getRecommendedSettings();

                    picker = uiApp.picker({
                        container: '#txt-encoding',
                        toolbar: false,
                        rotateEffect: true,
                        value: [
                            recommendedSettings && recommendedSettings.asc_getCodePage(),
                            (recommendedSettings && recommendedSettings.asc_getDelimiter()) ? recommendedSettings.asc_getDelimiter() : 4
                        ],
                        cols: [{
                            textAlign: 'left',
                            values: pages,
                            displayValues: pagesName
                        },{
                            textAlign: 'right',
                            width: 120,
                            values: [4, 2, 3, 1, 5],
                            displayValues: [',', ';', ':', this.txtTab, this.txtSpace]
                        }]
                    });

                    // Vertical align
                    $$(me._state.openDlg).css({
                        marginTop: - Math.round($$(me._state.openDlg).outerHeight() / 2) + 'px'
                    });
                } else if (type == Asc.c_oAscAdvancedOptionsID.DRM) {
                    $(me.loadMask).hasClass('modal-in') && uiApp.closeModal(me.loadMask);

                    me.onLongActionEnd(Asc.c_oAscAsyncActionType.BlockInteraction, LoadingDocument);

                    var buttons = [{
                        text: 'OK',
                        bold: true,
                        onClick: function () {
                            var password = $(me._state.openDlg).find('.modal-text-input[name="modal-password"]').val();
                            me.api.asc_setAdvancedOptions(type, new Asc.asc_CDRMAdvancedOptions(password));

                            if (!me._isDocReady) {
                                me.onLongActionBegin(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);
                            }
                            me._state.openDlg = null;
                        }
                    }];
                    if (me.appOptions.canRequestClose)
                        buttons.push({
                            text: me.closeButtonText,
                            onClick: function () {
                                Common.Gateway.requestClose();
                                me._state.openDlg = null;
                            }
                        });

                    me._state.openDlg = uiApp.modal({
                        title: me.advDRMOptions,
                        text: me.txtProtected,
                        afterText: '<div class="input-field"><input type="password" name="modal-password" placeholder="' + me.advDRMPassword + '" class="modal-text-input"></div>',
                        buttons: buttons
                    });

                    // Vertical align
                    $$(me._state.openDlg).css({
                        marginTop: - Math.round($$(me._state.openDlg).outerHeight() / 2) + 'px'
                    });
                }
            },

            onTryUndoInFastCollaborative: function() {
                uiApp.alert(
                    this.textTryUndoRedo,
                    this.notcriticalErrorTitle
                );
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
                if (this.appOptions.isEdit && this.appOptions.canLicense && !this.appOptions.isOffline && this.appOptions.canCoAuthoring) {
                    var value = Common.localStorage.getItem("sse-settings-coauthmode"),
                        oldval = this._state.fastCoauth;
                    this._state.fastCoauth = (value===null || parseInt(value) == 1);
                    if (this._state.fastCoauth && !oldval)
                        this.synchronizeChanges();
                }
            },

            onDocumentName: function(name) {
                this.updateWindowTitle(true);
            },

            onPrint: function() {
                if (!this.appOptions.canPrint) return;

                if (this.api)
                    this.api.asc_Print();
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

            leavePageText: 'You have unsaved changes in this document. Click \'Stay on this Page\' to await the autosave of the document. Click \'Leave this Page\' to discard all the unsaved changes.',
            criticalErrorTitle: 'Error',
            notcriticalErrorTitle: 'Warning',
            errorDefaultMessage: 'Error code: %1',
            criticalErrorExtText: 'Press "OK" to back to document list.',
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
            uploadImageSizeMessage: 'Maximum image size limit exceeded.',
            uploadImageExtMessage: 'Unknown image format.',
            uploadImageFileCountMessage: 'No images uploaded.',
            reloadButtonText: 'Reload Page',
            unknownErrorText: 'Unknown error.',
            convertationTimeoutText: 'Convertation timeout exceeded.',
            downloadErrorText: 'Download failed.',
            unsupportedBrowserErrorText: 'Your browser is not supported.',
            requestEditFailedTitleText: 'Access denied',
            requestEditFailedMessageText: 'Someone is editing this document right now. Please try again later.',
            textLoadingDocument: 'Loading spreadsheet',
            applyChangesTitleText: 'Loading Data',
            applyChangesTextText: 'Loading data...',
            errorKeyEncrypt: 'Unknown key descriptor',
            errorKeyExpire: 'Key descriptor expired',
            errorUsersExceed: 'Count of users was exceed',
            errorCoAuthoringDisconnect: 'Server connection lost. You can\'t edit anymore.',
            errorFilePassProtect: 'The file is password protected and cannot be opened.',
            txtBasicShapes: 'Basic Shapes',
            txtFiguredArrows: 'Figured Arrows',
            txtMath: 'Math',
            txtCharts: 'Charts',
            txtStarsRibbons: 'Stars & Ribbons',
            txtCallouts: 'Callouts',
            txtButtons: 'Buttons',
            txtRectangles: 'Rectangles',
            txtLines: 'Lines',
            txtEditingMode: 'Set editing mode...',
            textAnonymous: 'Anonymous',
            loadingDocumentTitleText: 'Loading spreadsheet',
            loadingDocumentTextText: 'Loading spreadsheet...',
            warnProcessRightsChange: 'You have been denied the right to edit the file.',
            errorProcessSaveResult: 'Saving is failed.',
            textCloseTip: '\nClick to close the tip.',
            textShape: 'Shape',
            errorStockChart: 'Incorrect row order. To build a stock chart place the data on the sheet in the following order:<br> opening price, max price, min price, closing price.',
            errorDataRange: 'Incorrect data range.',
            errorDatabaseConnection: 'External error.<br>Database connection error. Please, contact support.',
            titleUpdateVersion: 'Version changed',
            errorUpdateVersion: 'The file version has been changed. The page will be reloaded.',
            errorUserDrop: 'The file cannot be accessed right now.',
            txtDiagramTitle: 'Chart Title',
            txtXAxis: 'X Axis',
            txtYAxis: 'Y Axis',
            txtSeries: 'Series',
            errorMailMergeLoadFile: 'Loading failed',
            mailMergeLoadFileText: 'Loading Data Source...',
            mailMergeLoadFileTitle: 'Loading Data Source',
            errorMailMergeSaveFile: 'Merge failed.',
            downloadMergeText: 'Downloading...',
            downloadMergeTitle: 'Downloading',
            sendMergeTitle: 'Sending Merge',
            sendMergeText: 'Sending Merge...',
            txtArt: 'Your text here',
            errorConnectToServer: ' The document could not be saved. Please check connection settings or contact your administrator.<br>When you click the \'OK\' button, you will be prompted to download the document.<br><br>' +
                'Find more information about connecting Document Server <a href=\"%1\" target=\"_blank\">here</a>',
            textTryUndoRedo: 'The Undo/Redo functions are disabled for the Fast co-editing mode.<br>Click the \'Strict mode\' button to switch to the Strict co-editing mode to edit the file without other users interference and send your changes only after you save them. You can switch between the co-editing modes using the editor Advanced settings.',
            textStrict: 'Strict mode',
            txtErrorLoadHistory: 'Loading history failed',
            textBuyNow: 'Visit website',
            textNoLicenseTitle: '%1 open source version',
            textContactUs: 'Contact sales',
            errorViewerDisconnect: 'Connection is lost. You can still view the document,<br>but will not be able to download until the connection is restored.',
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
            txtEncoding: 'Encoding',
            txtDelimiter: 'Delimiter',
            txtSpace: 'Space',
            txtTab: 'Tab',
            advCSVOptions: 'Choose CSV Options',
            advDRMOptions: 'Protected File',
            advDRMEnterPassword: 'You password please:',
            advDRMPassword: 'Password',
            textOK: 'OK',
            textCancel: 'Cancel',
            textPreloader: 'Loading... ',
            textUsername: 'Username',
            textPassword: 'Password',
            textBack: 'Back',
            textClose: 'Close',
            textDone: 'Done',
            titleServerVersion: 'Editor updated',
            errorServerVersion: 'The editor version has been updated. The page will be reloaded to apply the changes.',
            txtAccent: 'Accent',
            txtStyle_Normal: 'Normal',
            txtStyle_Heading_1: 'Heading 1',
            txtStyle_Heading_2: 'Heading 2',
            txtStyle_Heading_3: 'Heading 3',
            txtStyle_Heading_4: 'Heading 4',
            txtStyle_Title: 'Title',
            txtStyle_Neutral: 'Neutral',
            txtStyle_Bad: 'Bad',
            txtStyle_Good: 'Good',
            txtStyle_Input: 'Input',
            txtStyle_Output: 'Output',
            txtStyle_Calculation: 'Calculation',
            txtStyle_Check_Cell: 'Check Cell',
            txtStyle_Explanatory_Text: 'Explanatory Text',
            txtStyle_Note: 'Note',
            txtStyle_Linked_Cell: 'Linked Cell',
            txtStyle_Warning_Text: 'Warning Text',
            txtStyle_Total: 'Total',
            txtStyle_Currency: 'Currency',
            txtStyle_Percent: 'Percent',
            txtStyle_Comma: 'Comma',
            errorMaxPoints: 'The maximum number of points in series per chart is 4096.',
            txtProtected: 'Once you enter the password and open the file, the current password to the file will be reset',
            warnNoLicense: 'This version of %1 editors has certain limitations for concurrent connections to the document server.<br>If you need more please consider purchasing a commercial license.',
            warnNoLicenseUsers: 'This version of %1 editors has certain limitations for concurrent users.<br>If you need more please consider purchasing a commercial license.',
            warnLicenseExceeded: 'The number of concurrent connections to the document server has been exceeded and the document will be opened for viewing only.<br>Please contact your administrator for more information.',
            warnLicenseUsersExceeded: 'The number of concurrent users has been exceeded and the document will be opened for viewing only.<br>Please contact your administrator for more information.',
            errorDataEncrypted: 'Encrypted changes have been received, they cannot be deciphered.',
            pastInMergeAreaError: 'Cannot change part of a merged cell',
            errorWrongBracketsCount: 'Found an error in the formula entered.<br>Wrong cout of brackets.',
            errorWrongOperator: 'An error in the entered formula. Wrong operator is used.<br>Please correct the error or use the Esc button to cancel the formula editing.',
            errorCountArgExceed: 'Found an error in the formula entered.<br>Count of arguments exceeded.',
            errorCountArg: 'Found an error in the formula entered.<br>Invalid number of arguments.',
            errorFormulaName: 'Found an error in the formula entered.<br>Incorrect formula name.',
            errorFormulaParsing: 'Internal error while the formula parsing.',
            errorArgsRange: 'Found an error in the formula entered.<br>Incorrect arguments range.',
            errorUnexpectedGuid: 'External error.<br>Unexpected Guid. Please, contact support.',
            errorFileRequest: 'External error.<br>File Request. Please, contact support.',
            errorFileVKey: 'External error.<br>Incorrect securety key. Please, contact support.',
            errorOperandExpected: 'The entered function syntax is not correct. Please check if you are missing one of the parentheses - \'(\' or \')\'.',
            errorMoveRange: 'Cann\'t change a part of merged cell',
            errorBadImageUrl: 'Image url is incorrect',
            errorAutoFilterDataRange: 'The operation could not be done for the selected range of cells.<br>Select a uniform data range inside or outside the table and try again.',
            errorAutoFilterChangeFormatTable: 'The operation could not be done for the selected cells as you cannot move a part of the table.<br>Select another data range so that the whole table was shifted and try again.',
            errorAutoFilterHiddenRange: 'The operation cannot be performed because the area contains filtered cells.<br>Please unhide the filtered elements and try again.',
            errorAutoFilterChange: 'The operation is not allowed, as it is attempting to shift cells in a table on your worksheet.',
            errorFillRange: 'Could not fill the selected range of cells.<br>All the merged cells need to be the same size.',
            errorInvalidRef: 'Enter a correct name for the selection or a valid reference to go to.',
            errorCreateDefName: 'The existing named ranges cannot be edited and the new ones cannot be created<br>at the moment as some of them are being edited.',
            errorPasteMaxRange: 'The copy and paste area does not match. Please select an area with the same size or click the first cell in a row to paste the copied cells.',
            errorLockedAll: 'The operation could not be done as the sheet has been locked by another user.',
            errorLockedWorksheetRename: 'The sheet cannot be renamed at the moment as it is being renamed by another user',
            errorOpenWarning: 'The length of one of the formulas in the file exceeded<br>the allowed number of characters and it was removed.',
            errorFrmlWrongReferences: 'The function refers to a sheet that does not exist.<br>Please check the data and try again.',
            errorCopyMultiselectArea: 'This command cannot be used with multiple selections.<br>Select a single range and try again.',
            errorPrintMaxPagesCount: 'Unfortunately, it’s not possible to print more than 1500 pages at once in the current version of the program.<br>This restriction will be eliminated in upcoming releases.',
            closeButtonText: 'Close File',
            scriptLoadError: 'The connection is too slow, some of the components could not be loaded. Please reload the page.',
            errorChangeArray: 'You cannot change part of an array.',
            errorEditingDownloadas: 'An error occurred during the work with the document.<br>Use the \'Download\' option to save the file backup copy to your computer hard drive.',
            errorMultiCellFormula: 'Multi-cell array formulas are not allowed in tables.',
            textPaidFeature: 'Paid feature',
            textCustomLoader: 'Please note that according to the terms of the license you are not entitled to change the loader.<br>Please contact our Sales Department to get a quote.',
            waitText: 'Please, wait...'
        }
    })(), SSE.Controllers.Main || {}))
});