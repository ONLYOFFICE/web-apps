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
 *  Document Editor
 *
 *  Created by Alexander Yuzhin on 9/22/16
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
], function (core, $, _, Backbone) {
    'use strict';

    DE.Controllers.Main = Backbone.Controller.extend(_.extend((function() {
        var ApplyEditRights = -255;
        var LoadingDocument = -256;

        Common.localStorage.setId('text');
        Common.localStorage.setKeysFilter('de-,asc.text');
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

                var value = Common.localStorage.getItem("de-settings-fontrender");

                if (value === null) {
                    window.devicePixelRatio > 1 ? value = '1' : '0';
                }

                // Initialize api

                window["flat_desine"] = true;

                var styleNames = ['Normal', 'No Spacing', 'Heading 1', 'Heading 2', 'Heading 3', 'Heading 4', 'Heading 5',
                        'Heading 6', 'Heading 7', 'Heading 8', 'Heading 9', 'Title', 'Subtitle', 'Quote', 'Intense Quote', 'List Paragraph', 'footnote text'],
                    translate = {
                        'Series': this.txtSeries,
                        'Diagram Title': this.txtDiagramTitle,
                        'X Axis': this.txtXAxis,
                        'Y Axis': this.txtYAxis,
                        'Your text here': this.txtArt,
                        'Header': this.txtHeader,
                        'Footer': this.txtFooter
                    };
                styleNames.forEach(function(item){
                    translate[item] = me['txtStyle_' + item.replace(/ /g, '_')] || item;
                });

                me.api = new Asc.asc_docs_api({
                    'id-view'  : 'editor_sdk',
                    'mobile'   : true,
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
                    switch (value) {
                        case '0': me.api.SetFontRenderingMode(3); break;
                        case '1': me.api.SetFontRenderingMode(1); break;
                        case '2': me.api.SetFontRenderingMode(2); break;
                    }

                    Common.Utils.Metric.setCurrentMetric(1); //pt

                    me.api.asc_registerCallback('asc_onError',                      _.bind(me.onError, me));
                    me.api.asc_registerCallback('asc_onDocumentContentReady',       _.bind(me.onDocumentContentReady, me));
                    me.api.asc_registerCallback('asc_onOpenDocumentProgress',       _.bind(me.onOpenDocument, me));
                    me.api.asc_registerCallback('asc_onDocumentUpdateVersion',      _.bind(me.onUpdateVersion, me));
                    me.api.asc_registerCallback('asc_onServerVersion',              _.bind(me.onServerVersion, me));
                    me.api.asc_registerCallback('asc_onAdvancedOptions',            _.bind(me.onAdvancedOptions, me));
                    me.api.asc_registerCallback('asc_onDocumentName',               _.bind(me.onDocumentName, me));
                    me.api.asc_registerCallback('asc_onPrintUrl',                   _.bind(me.onPrintUrl, me));

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
                me.appOptions.isDesktopApp    = me.editorConfig.targetApp == 'desktop';
                me.appOptions.canCreateNew    = !_.isEmpty(me.editorConfig.createUrl) && !me.appOptions.isDesktopApp;
                me.appOptions.canOpenRecent   = me.editorConfig.recent !== undefined && !me.appOptions.isDesktopApp;
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
                me.appOptions.canBack         = me.appOptions.canBackToFolder === true;
                me.appOptions.canPlugins      = false;
                me.plugins                    = me.editorConfig.plugins;

                if (me.editorConfig.lang)
                    me.api.asc_setLocale(me.editorConfig.lang);

//                if (this.appOptions.location == 'us' || this.appOptions.location == 'ca')
//                    Common.Utils.Metric.setDefaultMetric(Common.Utils.Metric.c_MetricUnits.inch);
            },

            loadDocument: function(data) {
                this.permissions = {};
                this.document = data.doc;

                var docInfo = {};

                if (data.doc) {
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

                    var type = /^(?:(pdf|djvu|xps))$/.exec(data.doc.fileType);
                    if (type && typeof type[1] === 'string') {
                        this.permissions.edit = this.permissions.review = false;
                    }
                }

                this.api.asc_registerCallback('asc_onGetEditorPermissions', _.bind(this.onEditorPermissions, this));
                this.api.asc_registerCallback('asc_onLicenseChanged',       _.bind(this.onLicenseChanged, this));
                this.api.asc_setDocInfo(docInfo);
                this.api.asc_getEditorPermissions(this.editorConfig.licenseUrl, this.editorConfig.customerId);

                Common.SharedSettings.set('document', data.doc);

                if (data.doc) {
                    DE.getController('Toolbar').setDocumentTitle(data.doc.title);
                }
            },

            setMode: function(mode){
                var me = this;

                Common.SharedSettings.set('mode', mode.isEdit ? 'edit' : 'view');

                if (me.api) {
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
                                me.onEditComplete();
                            }
                        );
                    }
                }
            },

            onDownloadAs: function() {
                if ( !this.appOptions.canDownload && !this.appOptions.canDownloadOrigin) {
                    Common.Gateway.reportError(Asc.c_oAscError.ID.AccessDeny, this.errorAccessDeny);
                    return;
                }

               this._state.isFromGatewayDownloadAs = true;
               var type = /^(?:(pdf|djvu|xps))$/.exec(this.document.fileType);

                if (type && typeof type[1] === 'string') {
                    this.api.asc_DownloadOrigin(true)
                } else {
                    this.api.asc_DownloadAs(Asc.c_oAscFileType.DOCX, true);
                }
            },

            goBack: function(current) {
                var href = this.appOptions.customization.goback.url;
                if (!current && this.appOptions.customization.goback.blank!==false) {
                    window.open(href, "_blank");
                } else {
                    parent.location.href = href;
                }
            },

            onEditComplete: function(cmp) {
                //
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

                action = me.stackLongActions.get({type: Asc.c_oAscAsyncActionType.Information});

                if (action) {
                    me.setLongActionView(action)
                } else {
                    if (me._state.fastCoauth && me._state.usersCount>1 && id==Asc.c_oAscAsyncAction['Save']) {
                        // me._state.timerSave = setTimeout(function () {
                            //console.debug('End long action');
                        // }, 500);
                    } else {
                        // console.debug('End long action');
                    }
                }

                action = me.stackLongActions.get({type: Asc.c_oAscAsyncActionType.BlockInteraction});

                if (action) {
                    me.setLongActionView(action)
                } else {
                    _.delay(function () {
                        $(me.loadMask).hasClass('modal-in') && uiApp.closeModal(me.loadMask);
                    }, 300);
                }

                if (id==Asc.c_oAscAsyncAction['Save'] && (!me._state.fastCoauth || me._state.usersCount<2)) {
                    // me.synchronizeChanges();
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
                        // clearTimeout(this._state.timerSave);
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

                if (action.type == Asc.c_oAscAsyncActionType['BlockInteraction']) {
                    if (action.id == Asc.c_oAscAsyncAction['ApplyChanges']) {
                        return;
                    }

                    if (me.loadMask && $(me.loadMask).hasClass('modal-in')) {
                        $$(me.loadMask).find('.modal-title').text(title);
                    } else {
                        me.loadMask = uiApp.showPreloader(title);
                    }
                }
                else {
//                    this.getApplication().getController('Statusbar').setStatusCaption(text);
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

                me.api.SetDrawingFreeze(false);
                me.hidePreloader();
                me.onLongActionEnd(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);

                me.api.asc_SetTrackRevisions(me.appOptions.isReviewOnly || Common.localStorage.getBool("de-mobile-track-changes-" + (me.appOptions.fileKey || '')));

                /** coauthoring begin **/
                this.isLiveCommenting = Common.localStorage.getBool("de-settings-livecomment", true);
                this.isLiveCommenting ? this.api.asc_showComments(true) : this.api.asc_hideComments();
                /** coauthoring end **/

                value = Common.localStorage.getItem("de-settings-zoom");
                var zf = (value!==null) ? parseInt(value) : (this.appOptions.customization && this.appOptions.customization.zoom ? parseInt(this.appOptions.customization.zoom) : 100);
                (zf == -1) ? this.api.zoomFitToPage() : ((zf == -2) ? this.api.zoomFitToWidth() : this.api.zoom(zf>0 ? zf : 100));

                value = Common.localStorage.getItem("de-show-hiddenchars");
                me.api.put_ShowParaMarks((value!==null) ? eval(value) : false);

                value = Common.localStorage.getItem("de-show-tableline");
                me.api.put_ShowTableEmptyLine((value!==null) ? eval(value) : true);

                value = Common.localStorage.getBool("de-mobile-spellcheck", false);
                me.api.asc_setSpellCheck(value);

                me.api.asc_registerCallback('asc_onStartAction',            _.bind(me.onLongActionBegin, me));
                me.api.asc_registerCallback('asc_onEndAction',              _.bind(me.onLongActionEnd, me));
                me.api.asc_registerCallback('asc_onCoAuthoringDisconnect',  _.bind(me.onCoAuthoringDisconnect, me));
                me.api.asc_registerCallback('asc_onPrint',                  _.bind(me.onPrint, me));

                me.updateWindowTitle(true);

                me.api.SetTextBoxInputMode(Common.localStorage.getBool("de-settings-inputmode"));

                /** coauthoring begin **/
                if (me.appOptions.isEdit && me.appOptions.canLicense && !me.appOptions.isOffline && me.appOptions.canCoAuthoring) {
                    // Force ON fast co-authoring mode
                    me._state.fastCoauth = true;
                    me.api.asc_SetFastCollaborative(me._state.fastCoauth);

                    value = Common.localStorage.getItem((me._state.fastCoauth) ? "de-settings-showchanges-fast" : "de-settings-showchanges-strict");
                    if (value !== null) {
                        me.api.SetCollaborativeMarksShowType(
                            value == 'all' ? Asc.c_oAscCollaborativeMarksShowType.All :
                            value == 'none' ? Asc.c_oAscCollaborativeMarksShowType.None : Asc.c_oAscCollaborativeMarksShowType.LastChanges);
                    } else {
                        me.api.SetCollaborativeMarksShowType(me._state.fastCoauth ? Asc.c_oAscCollaborativeMarksShowType.None : Asc.c_oAscCollaborativeMarksShowType.LastChanges);
                    }
                } else {
                    me._state.fastCoauth = false;
                    me.api.asc_SetFastCollaborative(me._state.fastCoauth);
                    me.api.SetCollaborativeMarksShowType(Asc.c_oAscCollaborativeMarksShowType.None);
                }
                /** coauthoring end **/

               if (me.appOptions.isEdit) {
                   value = me._state.fastCoauth; // Common.localStorage.getItem("de-settings-autosave");
                   value = (!me._state.fastCoauth && value!==null) ? parseInt(value) : (me.appOptions.canCoAuthoring ? 1 : 0);

                   me.api.asc_setAutoSaveGap(value);

                   if (me.needToUpdateVersion) {
                       Common.NotificationCenter.trigger('api:disconnect');
                   }
               }

//                if (this.appOptions.canAnalytics && false)
//                    Common.component.Analytics.initialize('UA-12442749-13', 'Document Editor');

                Common.Gateway.on('processsaveresult',      _.bind(me.onProcessSaveResult, me));
                Common.Gateway.on('processrightschange',    _.bind(me.onProcessRightsChange, me));
                Common.Gateway.on('downloadas',             _.bind(me.onDownloadAs, me));

                Common.Gateway.sendInfo({
                    mode: me.appOptions.isEdit ? 'edit' : 'view'
                });

                if (me.api) {
                    me.api.Resize();
                    me.api.zoomFitToWidth();
                }

                me.applyLicense();

                $(document).on('contextmenu', _.bind(me.onContextMenu, me));
                Common.Gateway.documentReady();
            },

            onLicenseChanged: function(params) {
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
                    DE.getController('Toolbar').activateViewControls();
                    DE.getController('Toolbar').deactivateEditControls();
                    Common.NotificationCenter.trigger('api:disconnect');

                    var value = Common.localStorage.getItem("de-license-warning");
                    value = (value!==null) ? parseInt(value) : 0;
                    var now = (new Date).getTime();

                    if (now - value > 86400000) {
                        Common.localStorage.setItem("de-license-warning", now);
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
                    DE.getController('Toolbar').activateControls();
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
                    licType = params.asc_getLicenseType();

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

                me.permissions.review         = (me.permissions.review === undefined) ? (me.permissions.edit !== false) : me.permissions.review;
                me.appOptions.canAnalytics    = params.asc_getIsAnalyticsEnable();
                me.appOptions.canLicense      = (licType === Asc.c_oLicenseResult.Success || licType === Asc.c_oLicenseResult.SuccessLimit);
                me.appOptions.isLightVersion  = params.asc_getIsLight();
                /** coauthoring begin **/
                me.appOptions.canCoAuthoring  = !me.appOptions.isLightVersion;
                /** coauthoring end **/
                me.appOptions.isOffline       = me.api.asc_isOffline();
                me.appOptions.isReviewOnly    = (me.permissions.review === true) && (me.permissions.edit === false);
                me.appOptions.canRequestEditRights = me.editorConfig.canRequestEditRights;
                me.appOptions.canRequestClose = me.editorConfig.canRequestClose;
                me.appOptions.canEdit         = (me.permissions.edit !== false || me.permissions.review === true) && // can edit or review
                    (me.editorConfig.canRequestEditRights || me.editorConfig.mode !== 'view') && // if mode=="view" -> canRequestEditRights must be defined
                    (!me.appOptions.isReviewOnly || me.appOptions.canLicense); // if isReviewOnly==true -> canLicense must be true
                me.appOptions.isEdit          = me.appOptions.canLicense && me.appOptions.canEdit && me.editorConfig.mode !== 'view';
                me.appOptions.canReview       = me.appOptions.canLicense && me.appOptions.isEdit && (me.permissions.review===true);
                me.appOptions.canUseHistory   = me.appOptions.canLicense && !me.appOptions.isLightVersion && me.editorConfig.canUseHistory && me.appOptions.canCoAuthoring && !me.appOptions.isDesktopApp;
                me.appOptions.canHistoryClose = me.editorConfig.canHistoryClose;
                me.appOptions.canHistoryRestore= me.editorConfig.canHistoryRestore && !!me.permissions.changeHistory;
                me.appOptions.canUseMailMerge = me.appOptions.canLicense && me.appOptions.canEdit && !me.appOptions.isDesktopApp;
                me.appOptions.canSendEmailAddresses  = me.appOptions.canLicense && me.editorConfig.canSendEmailAddresses && me.appOptions.canEdit && me.appOptions.canCoAuthoring;
                me.appOptions.canComments     = me.appOptions.canLicense && !((typeof (me.editorConfig.customization) == 'object') && me.editorConfig.customization.comments===false);
                me.appOptions.canChat         = me.appOptions.canLicense && !me.appOptions.isOffline && !((typeof (me.editorConfig.customization) == 'object') && me.editorConfig.customization.chat===false);
                me.appOptions.canEditStyles   = me.appOptions.canLicense && me.appOptions.canEdit;
                me.appOptions.canPrint        = (me.permissions.print !== false);
                me.appOptions.fileKey = me.document.key;

                var type = /^(?:(pdf|djvu|xps))$/.exec(me.document.fileType);
                me.appOptions.canDownloadOrigin = me.permissions.download !== false && (type && typeof type[1] === 'string');
                me.appOptions.canDownload       = me.permissions.download !== false && (!type || typeof type[1] !== 'string');
                me.appOptions.canReader         = (!type || typeof type[1] !== 'string');

                me.appOptions.canBranding  = params.asc_getCustomization();
                me.appOptions.canBrandingExt = params.asc_getCanBranding() && (typeof me.editorConfig.customization == 'object');

                if ( me.appOptions.isLightVersion ) {
                    me.appOptions.canUseHistory = me.appOptions.canReview = me.appOptions.isReviewOnly = false;
                }

                me.applyModeCommonElements();
                me.applyModeEditorElements();

                me.api.asc_setViewMode(!me.appOptions.isEdit);
                me.api.asc_LoadDocument();
                me.api.Resize();

                if (!me.appOptions.isEdit) {
                    me.hidePreloader();
                    me.onLongActionBegin(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);
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

                if (me.api) {
                    me.api.asc_registerCallback('asc_onSendThemeColors', _.bind(me.onSendThemeColors, me));
                    me.api.asc_registerCallback('asc_onDownloadUrl',     _.bind(me.onDownloadUrl, me));
                }
            },

            applyModeEditorElements: function() {
                if (this.appOptions.isEdit) {
                    var me = this;
//
//                    var value = Common.localStorage.getItem('de-settings-unit');
//                    value = (value!==null) ? parseInt(value) : Common.Utils.Metric.getDefaultMetric();
//                    Common.Utils.Metric.setCurrentMetric(value);
//                    me.api.asc_SetDocumentUnits((value==Common.Utils.Metric.c_MetricUnits.inch) ? Asc.c_oAscDocumentUnits.Inch : ((value==Common.Utils.Metric.c_MetricUnits.pt) ? Asc.c_oAscDocumentUnits.Point : Asc.c_oAscDocumentUnits.Millimeter));

                    me.api.asc_registerCallback('asc_onDocumentModifiedChanged', _.bind(me.onDocumentModifiedChanged, me));
                    me.api.asc_registerCallback('asc_onDocumentCanSaveChanged',  _.bind(me.onDocumentCanSaveChanged, me));
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
                        config.msg = this.errorKeyEncrypt;
                        break;

                    case Asc.c_oAscError.ID.KeyExpire:
                        config.msg = this.errorKeyExpire;
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

                    case Asc.c_oAscError.ID.MailMergeLoadFile:
                        config.msg = this.errorMailMergeLoadFile;
                        break;

                    case Asc.c_oAscError.ID.MailMergeSaveFile:
                        config.msg = this.errorMailMergeSaveFile;
                        break;

                    case Asc.c_oAscError.ID.Warning:
                        config.msg = this.errorConnectToServer.replace('%1', '{{API_URL_EDITING_CALLBACK}}');
                        break;

                    case Asc.c_oAscError.ID.UplImageUrl:
                        config.msg = this.errorBadImageUrl;
                        break;

                    case Asc.c_oAscError.ID.DataEncrypted:
                        config.msg = this.errorDataEncrypted;
                        break;

                    case Asc.c_oAscError.ID.AccessDeny:
                        config.msg = this.errorAccessDeny;
                        break;

                    case Asc.c_oAscError.ID.EditingError:
                        config.msg = this.errorEditingDownloadas;
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
                    config.callback = _.bind(function(btn){
                        if (id == Asc.c_oAscError.ID.Warning && btn == 'ok' && (this.appOptions.canDownload || this.appOptions.canDownloadOrigin)) {
                            Common.UI.Menu.Manager.hideAll();
                            if (this.appOptions.isDesktopApp && this.appOptions.isOffline)
                                this.api.asc_DownloadAs();
                            else
                                (this.appOptions.canDownload) ? this.getApplication().getController('LeftMenu').leftMenu.showMenu('file:saveas') : this.api.asc_DownloadOrigin();
                        }
                        this._state.lostEditingRights = false;
                        this.onEditComplete();
                    }, this);
                }

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
                var isModified = this.api.isDocumentModified();
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
                    Common.Gateway.setDocumentModified(this.api.isDocumentModified());
                }

                this.updateWindowTitle();
            },

            onDocumentCanSaveChanged: function (isCanSave) {
                //
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
                me.onLongActionEnd(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);

                uiApp.alert(
                    me.errorUpdateVersion,
                    me.titleUpdateVersion,
                    function () {
                        _.defer(function() {
                            Common.Gateway.updateVersion();

                            if (callback) {
                                callback.call(me);
                            }

                            me.onLongActionBegin(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);
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
                if (type == Asc.c_oAscAdvancedOptionsID.TXT) {
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
                        title: me.advTxtOptions,
                        text: '',
                        afterText:
                        '<div class="content-block">' +
                            '<div class="row">' +
                                '<div class="col-100">Encoding</div>' +
                            '</div>' +
                            '<div id="txt-encoding"></div>' +
                        '</div>',
                        buttons: [
                            {
                                text: 'OK',
                                bold: true,
                                onClick: function() {
                                    var encoding = picker.value;

                                    if (me.api) {
                                        me.api.asc_setAdvancedOptions(type, new Asc.asc_CTXTAdvancedOptions(encoding));

                                        if (!me._isDocReady) {
                                            me.onLongActionBegin(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);
                                        }
                                    }
                                    me._state.openDlg = null;
                                }
                            }
                        ]
                    });

                    picker = uiApp.picker({
                        container: '#txt-encoding',
                        toolbar: false,
                        rotateEffect: true,
                        value: [advOptions.asc_getOptions().asc_getRecommendedSettings().asc_getCodePage()],
                        cols: [{
                            values: pages,
                            displayValues: pagesName
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

            onDocumentName: function(name) {
//                this.getApplication().getController('Viewport').getView('Common.Views.Header').setDocumentCaption(name);
                this.updateWindowTitle(true);
            },

            onPrint: function() {
                if (!this.appOptions.canPrint) return;

                if (this.api)
                    this.api.asc_Print();
                Common.component.Analytics.trackEvent('Print');
            },

            onPrintUrl: function(url) {
                var me = this;

                if (me.iframePrint) {
                    me.iframePrint.parentNode.removeChild(me.iframePrint);
                    me.iframePrint = null;
                }

                if (!me.iframePrint) {
                    me.iframePrint = document.createElement("iframe");
                    me.iframePrint.id = "id-print-frame";
                    me.iframePrint.style.display = 'none';
                    me.iframePrint.style.visibility = "hidden";
                    me.iframePrint.style.position = "fixed";
                    me.iframePrint.style.right = "0";
                    me.iframePrint.style.bottom = "0";
                    document.body.appendChild(me.iframePrint);
                    me.iframePrint.onload = function() {
                        me.iframePrint.contentWindow.focus();
                        me.iframePrint.contentWindow.print();
                        me.iframePrint.contentWindow.blur();
                        window.focus();
                    };
                }

                if (url) {
                    me.iframePrint.src = url;
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
            uploadImageSizeMessage: 'Maximium image size limit exceeded.',
            uploadImageExtMessage: 'Unknown image format.',
            uploadImageFileCountMessage: 'No images uploaded.',
            unknownErrorText: 'Unknown error.',
            convertationTimeoutText: 'Convertation timeout exceeded.',
            downloadErrorText: 'Download failed.',
            unsupportedBrowserErrorText: 'Your browser is not supported.',
            splitMaxRowsErrorText: 'The number of rows must be less than %1',
            splitMaxColsErrorText: 'The number of columns must be less than %1',
            splitDividerErrorText: 'The number of rows must be a divisor of %1',
            textLoadingDocument: 'Loading document',
            applyChangesTitleText: 'Loading Data',
            applyChangesTextText: 'Loading data...',
            errorKeyEncrypt: 'Unknown key descriptor',
            errorKeyExpire: 'Key descriptor expired',
            errorUsersExceed: 'Count of users was exceed',
            errorCoAuthoringDisconnect: 'Server connection lost. You can\'t edit anymore.',
            errorFilePassProtect: 'The file is password protected and could not be opened.',
            txtEditingMode: 'Set editing mode...',
            textAnonymous: 'Anonymous',
            loadingDocumentTitleText: 'Loading document',
            loadingDocumentTextText: 'Loading document...',
            warnProcessRightsChange: 'You have been denied the right to edit the file.',
            errorProcessSaveResult: 'Saving is failed.',
            errorStockChart: 'Incorrect row order. To build a stock chart place the data on the sheet in the following order:<br> opening price, max price, min price, closing price.',
            errorDataRange: 'Incorrect data range.',
            errorDatabaseConnection: 'External error.<br>Database connection error. Please, contact support.',
            titleUpdateVersion: 'Version changed',
            errorUpdateVersion: 'The file version has been changed. The page will be reloaded.',
            errorUserDrop: 'The file cannot be accessed right now.',
            txtDiagramTitle: 'Chart Title',
            txtXAxis: 'X Axis',
            txtYAxis: 'Y Axis',
            txtSeries: 'Seria',
            errorMailMergeLoadFile: 'Loading failed',
            mailMergeLoadFileText: 'Loading Data Source...',
            mailMergeLoadFileTitle: 'Loading Data Source',
            errorMailMergeSaveFile: 'Merge failed.',
            downloadMergeText: 'Downloading...',
            downloadMergeTitle: 'Downloading',
            sendMergeTitle: 'Sending Merge',
            sendMergeText: 'Sending Merge...',
            txtArt: 'Your text here',
            errorConnectToServer: ' The document could not be saved. Please check connection settings or contact your administrator.<br>When you click the \'OK\' button, you will be prompted to download the document.<br><br>Find more information about connecting Document Server <a href=\"%1\" target=\"_blank\">here</a>',
            textTryUndoRedo: 'The Undo/Redo functions are disabled for the Fast co-editing mode.',
            textBuyNow: 'Visit website',
            textNoLicenseTitle: '%1 open source version',
            textContactUs: 'Contact sales',
            errorViewerDisconnect: 'Connection is lost. You can still view the document,<br>but will not be able to download until the connection is restored.',
            warnLicenseExp: 'Your license has expired.<br>Please update your license and refresh the page.',
            titleLicenseExp: 'License expired',
            openErrorText: 'An error has occurred while opening the file',
            saveErrorText: 'An error has occurred while saving the file',
            advTxtOptions: 'Choose TXT Options',
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
            errorBadImageUrl: 'Image url is incorrect',
            txtStyle_Normal: 'Normal',
            txtStyle_No_Spacing: 'No Spacing',
            txtStyle_Heading_1: 'Heading 1',
            txtStyle_Heading_2: 'Heading 2',
            txtStyle_Heading_3: 'Heading 3',
            txtStyle_Heading_4: 'Heading 4',
            txtStyle_Heading_5: 'Heading 5',
            txtStyle_Heading_6: 'Heading 6',
            txtStyle_Heading_7: 'Heading 7',
            txtStyle_Heading_8: 'Heading 8',
            txtStyle_Heading_9: 'Heading 9',
            txtStyle_Title: 'Title',
            txtStyle_Subtitle: 'Subtitle',
            txtStyle_Quote: 'Quote',
            txtStyle_Intense_Quote: 'Intense Quote',
            txtStyle_List_Paragraph: 'List Paragraph',
            txtStyle_footnote_text: 'Footnote Text',
            txtHeader: "Header",
            txtFooter: "Footer",
            txtProtected: 'Once you enter the password and open the file, the current password to the file will be reset',
            warnNoLicense: 'This version of %1 editors has certain limitations for concurrent connections to the document server.<br>If you need more please consider purchasing a commercial license.',
            warnNoLicenseUsers: 'This version of %1 editors has certain limitations for concurrent users.<br>If you need more please consider purchasing a commercial license.',
            warnLicenseExceeded: 'The number of concurrent connections to the document server has been exceeded and the document will be opened for viewing only.<br>Please contact your administrator for more information.',
            warnLicenseUsersExceeded: 'The number of concurrent users has been exceeded and the document will be opened for viewing only.<br>Please contact your administrator for more information.',
            errorDataEncrypted: 'Encrypted changes have been received, they cannot be deciphered.',
            closeButtonText: 'Close File',
            scriptLoadError: 'The connection is too slow, some of the components could not be loaded. Please reload the page.',
            errorAccessDeny: 'You are trying to perform an action you do not have rights for.<br>Please contact your Document Server administrator.',
            errorEditingDownloadas: 'An error occurred during the work with the document.<br>Use the \'Download\' option to save the file backup copy to your computer hard drive.',
            textPaidFeature: 'Paid feature',
            textCustomLoader: 'Please note that according to the terms of the license you are not entitled to change the loader.<br>Please contact our Sales Department to get a quote.',
            waitText: 'Please, wait...'
        }
    })(), DE.Controllers.Main || {}))
});