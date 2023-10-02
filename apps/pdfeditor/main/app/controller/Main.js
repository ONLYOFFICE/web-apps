/*
 * (c) Copyright Ascensio System SIA 2010-2023
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
 *  Main.js
 *
 *  Main controller
 *
 *  Created by Julia Radzhabova on 05/03/23
 *  Copyright (c) 2023 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'irregularstack',
    'common/main/lib/component/Window',
    'common/main/lib/component/LoadMask',
    'common/main/lib/component/Tooltip',
    'common/main/lib/controller/Fonts',
    'common/main/lib/view/OpenDialog',
    'common/main/lib/view/UserNameDialog',
    'common/main/lib/util/LocalStorage',
    'pdfeditor/main/app/collection/ShapeGroups',
    'common/main/lib/controller/FocusManager',
    'common/main/lib/controller/HintManager',
    'common/main/lib/controller/LayoutManager',
    'common/main/lib/controller/ExternalUsers'
], function () {
    'use strict';

    PDFE.Controllers.Main = Backbone.Controller.extend(_.extend((function() {
        var appHeader;
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
            statusBar: '#statusbar'
        };

        Common.localStorage.setId('pdf');
        Common.localStorage.setKeysFilter('pdfe-,asc.pdf');
        Common.localStorage.sync();

        return {

            models: [],
            collections: [
                'ShapeGroups'
            ],
            views: [],

            initialize: function() {
                this.addListeners({
                    'FileMenu': {
                        'settings:apply': _.bind(this.applySettings, this)
                    },
                    // 'Common.Views.ReviewChanges': {
                    //     'settings:apply': _.bind(this.applySettings, this)
                    // }
                });

                this.translationTable = {
                    "Choose an item": this.txtChoose,
                    "Enter a date": this.txtEnterDate
                };
            },

            onLaunch: function() {
                var me = this;

                this.stackLongActions = new Common.IrregularStack({
                    strongCompare   : function(obj1, obj2){return obj1.id === obj2.id && obj1.type === obj2.type;},
                    weakCompare     : function(obj1, obj2){return obj1.type === obj2.type;}
                });

                this.stackDisableActions = new Common.IrregularStack({
                    strongCompare   : function(obj1, obj2){return obj1.type === obj2.type;},
                    weakCompare     : function(obj1, obj2){return obj1.type === obj2.type;}
                });

                this.stackMacrosRequests = [];

                this._state = {isDisconnected: false, usersCount: 1, fastCoauth: true, lostEditingRights: false, licenseType: false, isDocModified: false};
                this.languages = null;

                // Initialize viewport

                if (!Common.Utils.isBrowserSupported()){
                    Common.Utils.showBrowserRestriction();
                    Common.Gateway.reportError(undefined, this.unsupportedBrowserErrorText);
                    return;
                }

                // Initialize api
                window["flat_desine"] = true;
                this.api = this.getApplication().getController('Viewport').getApi();

                Common.UI.FocusManager.init();
                Common.UI.HintManager.init(this.api);
                Common.UI.Themes.init(this.api);

                if (this.api){
                    this.api.SetDrawingFreeze(true);

                    var value = Common.localStorage.getBool("pdfe-settings-cachemode", true);
                    Common.Utils.InternalSettings.set("pdfe-settings-cachemode", value);
                    this.api.asc_setDefaultBlitMode(!!value);

                    value = Common.localStorage.getItem("pdfe-settings-fontrender");
                    if (value === null)
                        value = '0';
                    Common.Utils.InternalSettings.set("pdfe-settings-fontrender", value);
                    switch (value) {
                        case '0': this.api.SetFontRenderingMode(3); break;
                        case '1': this.api.SetFontRenderingMode(1); break;
                        case '2': this.api.SetFontRenderingMode(2); break;
                    }

                    if ( !Common.Utils.isIE ) {
                        if ( /^https?:\/\//.test('{{HELP_CENTER_WEB_DE}}') ) {
                            const _url_obj = new URL('{{HELP_CENTER_WEB_DE}}');
                            if ( !!_url_obj.searchParams )
                                _url_obj.searchParams.set('lang', Common.Locale.getCurrentLanguage());

                            Common.Utils.InternalSettings.set("url-help-center", _url_obj.toString());
                        }
                    }

                    this.api.asc_registerCallback('asc_onError',                    _.bind(this.onError, this));
                    this.api.asc_registerCallback('asc_onDocumentContentReady',     _.bind(this.onDocumentContentReady, this));
                    this.api.asc_registerCallback('asc_onOpenDocumentProgress',     _.bind(this.onOpenDocument, this));
                    this.api.asc_registerCallback('asc_onDocumentUpdateVersion',    _.bind(this.onUpdateVersion, this));
                    this.api.asc_registerCallback('asc_onServerVersion',            _.bind(this.onServerVersion, this));
                    this.api.asc_registerCallback('asc_onAdvancedOptions',          _.bind(this.onAdvancedOptions, this));
                    this.api.asc_registerCallback('asc_onDocumentName',             _.bind(this.onDocumentName, this));
                    this.api.asc_registerCallback('asc_onPrintUrl',                 _.bind(this.onPrintUrl, this));
                    this.api.asc_registerCallback('asc_onMeta',                     _.bind(this.onMeta, this));
                    // this.api.asc_registerCallback('asc_onSpellCheckInit',           _.bind(this.loadLanguages, this));
                    this.api.asc_registerCallback('asc_onOpenLinkPdfForm',          _.bind(this.onOpenLinkPdfForm, this));
                    this.api.asc_registerCallback('asc_onOpenFilePdfForm',          _.bind(this.onOpenFilePdfForm, this));
                    this.api.asc_registerCallback('asc_onValidateErrorPdfForm',     _.bind(this.onValidateErrorPdfForm, this));
                    this.api.asc_registerCallback('asc_onFormatErrorPdfForm',       _.bind(this.onFormatErrorPdfForm, this));

                    Common.NotificationCenter.on('api:disconnect',                  _.bind(this.onCoAuthoringDisconnect, this));
                    Common.NotificationCenter.on('goback',                          _.bind(this.goBack, this));
                    Common.NotificationCenter.on('markfavorite',                    _.bind(this.markFavorite, this));
                    Common.NotificationCenter.on('download:advanced',               _.bind(this.onAdvancedOptions, this));
                    Common.NotificationCenter.on('showmessage',                     _.bind(this.onExternalMessage, this));
                    Common.NotificationCenter.on('showerror',                       _.bind(this.onError, this));
                    Common.NotificationCenter.on('editing:disable',                 _.bind(this.onEditingDisable, this));
                    Common.NotificationCenter.on('pdf:mode',                        _.bind(this.onPdfModeChange, this));

                    this.isShowOpenDialog = false;
                    
                    // Initialize api gateway
                    this.editorConfig = {};
                    this.appOptions = {};
                    Common.Gateway.on('init',           _.bind(this.loadConfig, this));
                    Common.Gateway.on('showmessage',    _.bind(this.onExternalMessage, this));
                    Common.Gateway.on('opendocument',   _.bind(this.loadDocument, this));
                    Common.Gateway.on('grabfocus',      _.bind(this.onGrabFocus, this));
                    Common.Gateway.appReady();

//                $(window.top).resize(_.bind(this.onDocumentResize, this));
                    this.getApplication().getController('Viewport').setApi(this.api);
                    this.getApplication().getController('Statusbar').setApi(this.api);

                    /** coauthoring begin **/
                    this.contComments = this.getApplication().getController('Common.Controllers.Comments');
                    /** coauthoring end **/

                        // Syncronize focus with api
                    $(document.body).on('focus', 'input, textarea', function(e) {
                        if (!/area_id/.test(e.target.id)) {
                            if (/msg-reply/.test(e.target.className)) {
                                me.dontCloseDummyComment = true;
                                me.beforeShowDummyComment = me.beforeCloseDummyComment = false;
                            } else if (/textarea-control/.test(e.target.className))
                                me.inTextareaControl = true;
                            else if (!Common.Utils.ModalWindow.isVisible() && /form-control/.test(e.target.className))
                                me.inFormControl = true;
                        }
                    });

                    $(document.body).on('blur', 'input, textarea', function(e) {
                        if (!Common.Utils.ModalWindow.isVisible()) {
                            if (/form-control/.test(e.target.className))
                                me.inFormControl = false;
                            if (me.getApplication().getController('LeftMenu').getView('LeftMenu').getMenu('file').isVisible())
                                return;
                            if (!e.relatedTarget ||
                                !/area_id/.test(e.target.id)
                                && !(e.target.localName == 'input' && $(e.target).parent().find(e.relatedTarget).length>0) /* Check if focus in combobox goes from input to it's menu button or menu items, or from comment editing area to Ok/Cancel button */
                                && !(e.target.localName == 'textarea' && $(e.target).closest('.asc-window').find('.dropdown-menu').find(e.relatedTarget).length>0) /* Check if focus in comment goes from textarea to it's email menu */
                                && (e.relatedTarget.localName != 'input' || !/form-control/.test(e.relatedTarget.className)) /* Check if focus goes to text input with class "form-control" */
                                && (e.relatedTarget.localName != 'textarea' || /area_id/.test(e.relatedTarget.id))) /* Check if focus goes to textarea, but not to "area_id" */ {
                                if (Common.Utils.isIE && e.originalEvent && e.originalEvent.target && /area_id/.test(e.originalEvent.target.id) && (e.originalEvent.target === e.originalEvent.srcElement))
                                    return;
                                if (Common.Utils.isLinux && me.appOptions && me.appOptions.isDesktopApp) {
                                    if (e.relatedTarget || !e.originalEvent || e.originalEvent.sourceCapabilities)
                                        me.api.asc_enableKeyEvents(true);
                                } else
                                    me.api.asc_enableKeyEvents(true);
                                if (me.dontCloseDummyComment && /msg-reply/.test(e.target.className)) {
                                    if ($(e.target).closest('.user-comment-item').find(e.relatedTarget).length<1) /* Check if focus goes to buttons in the comment window */
                                        me.dontCloseDummyComment = me.beforeCloseDummyComment = false;
                                    else
                                        me.beforeCloseDummyComment = true;
                                }
                                else if (/textarea-control/.test(e.target.className))
                                    me.inTextareaControl = false;
                            }
                        }
                    }).on('dragover', function(e) {
                        var event = e.originalEvent;
                        if (event.target && $(event.target).closest('#editor_sdk').length<1 ) {
                            event.preventDefault();
                            event.dataTransfer.dropEffect ="none";
                            return false;
                        }
                    }).on('dragstart', function(e) {
                        var event = e.originalEvent;
                        if (event.target ) {
                            var target = $(event.target);
                            if (target.closest('.combobox').length>0 || target.closest('.dropdown-menu').length>0 ||
                                target.closest('.input-field').length>0 || target.closest('.spinner').length>0 || target.closest('.textarea-field').length>0 ||
                                target.closest('.ribtab').length>0 || target.closest('.combo-dataview').length>0) {
                                event.preventDefault();
                            }
                        }
                    }).on('mouseup', function(e){
                        me.beforeCloseDummyComment && setTimeout(function(){ // textbox in dummy comment lost focus
                            me.dontCloseDummyComment = me.beforeCloseDummyComment = false;
                        }, 10);
                    });

                    Common.Utils.isChrome && $(document.body).on('keydown', 'textarea', function(e) {// chromium bug890248 (Bug 39614)
                        if (e.keyCode===Common.UI.Keys.PAGEUP || e.keyCode===Common.UI.Keys.PAGEDOWN) {
                            setTimeout(function(){
                                $('#viewport').scrollLeft(0);
                                $('#viewport').scrollTop(0);
                            }, 0);
                        }
                    });

                    Common.NotificationCenter.on({
                        'modal:show': function(){
                            Common.Utils.ModalWindow.show();
                            me.api.asc_enableKeyEvents(false);
                        },
                        'modal:close': function(dlg) {
                            Common.Utils.ModalWindow.close();
                            if (!Common.Utils.ModalWindow.isVisible())
                                me.api.asc_enableKeyEvents(true);
                        },
                        'modal:hide': function(dlg) {
                            Common.Utils.ModalWindow.close();
                            if (!Common.Utils.ModalWindow.isVisible())
                                me.api.asc_enableKeyEvents(true);
                        },
                        'settings:unitschanged':_.bind(this.unitsChanged, this),
                        'dataview:focus': function(e){
                        },
                        'dataview:blur': function(e){
                            if (!Common.Utils.ModalWindow.isVisible()) {
                                me.api.asc_enableKeyEvents(true);
                            }
                        },
                        'menu:show': function(e){
                        },
                        'menu:hide': function(e, isFromInputControl){
                            if (!Common.Utils.ModalWindow.isVisible() && !isFromInputControl)
                                me.api.asc_enableKeyEvents(true);
                        },
                        'edit:complete': _.bind(me.onEditComplete, me)
                    });

                    Common.util.Shortcuts.delegateShortcuts({
                        shortcuts: {
                            'command+s,ctrl+s,command+p,ctrl+p,command+k,ctrl+k,command+d,ctrl+d': _.bind(function (e) {
                                e.preventDefault();
                                e.stopPropagation();
                            }, this)
                        }
                    });
                }

                me.defaultTitleText = '{{APP_TITLE_TEXT}}';
                me.warnNoLicense  = me.warnNoLicense.replace(/%1/g, '{{COMPANY_NAME}}');
                me.warnNoLicenseUsers = me.warnNoLicenseUsers.replace(/%1/g, '{{COMPANY_NAME}}');
                me.textNoLicenseTitle = me.textNoLicenseTitle.replace(/%1/g, '{{COMPANY_NAME}}');
                me.warnLicenseExceeded = me.warnLicenseExceeded.replace(/%1/g, '{{COMPANY_NAME}}');
                me.warnLicenseUsersExceeded = me.warnLicenseUsersExceeded.replace(/%1/g, '{{COMPANY_NAME}}');
            },

            loadConfig: function(data) {
                this.editorConfig = $.extend(this.editorConfig, data.config);

                this.appOptions.customization   = this.editorConfig.customization;
                this.appOptions.canRenameAnonymous = !((typeof (this.appOptions.customization) == 'object') && (typeof (this.appOptions.customization.anonymous) == 'object') && (this.appOptions.customization.anonymous.request===false));
                this.appOptions.guestName = (typeof (this.appOptions.customization) == 'object') && (typeof (this.appOptions.customization.anonymous) == 'object') &&
                                (typeof (this.appOptions.customization.anonymous.label) == 'string') && this.appOptions.customization.anonymous.label.trim()!=='' ?
                                Common.Utils.String.htmlEncode(this.appOptions.customization.anonymous.label) : this.textGuest;
                var value;
                if (this.appOptions.canRenameAnonymous) {
                    value = Common.localStorage.getItem("guest-username");
                    Common.Utils.InternalSettings.set("guest-username", value);
                    Common.Utils.InternalSettings.set("save-guest-username", !!value);
                }
                if (this.appOptions.customization.font) {
                    if (this.appOptions.customization.font.name && typeof this.appOptions.customization.font.name === 'string') {
                        var arr = this.appOptions.customization.font.name.split(',');
                        for (var i=0; i<arr.length; i++) {
                            var item = arr[i].trim();
                            if (item && (/[\s0-9\.]/).test(item)) {
                                arr[i] = "'" + item + "'";
                            }
                        }
                        document.documentElement.style.setProperty("--font-family-base-custom", arr.join(','));
                    }

                    if (this.appOptions.customization.font.size) {
                        var size = parseInt(this.appOptions.customization.font.size);
                        !isNaN(size) && document.documentElement.style.setProperty("--font-size-base-app-custom", size + "px");
                    }
                }

                this.editorConfig.user          =
                this.appOptions.user            = Common.Utils.fillUserInfo(this.editorConfig.user, this.editorConfig.lang, value ? (value + ' (' + this.appOptions.guestName + ')' ) : this.textAnonymous,
                                                                            Common.localStorage.getItem("guest-id") || ('uid-' + Date.now()));
                this.appOptions.user.anonymous && Common.localStorage.setItem("guest-id", this.appOptions.user.id);

                this.appOptions.isDesktopApp    = this.editorConfig.targetApp == 'desktop' || Common.Controllers.Desktop.isActive();
                if( Common.Controllers.Desktop.isActive() ) {
                    !this.editorConfig.recent && (this.editorConfig.recent = []);
                }
                this.appOptions.canCreateNew    = this.editorConfig.canRequestCreateNew || !_.isEmpty(this.editorConfig.createUrl) || this.editorConfig.templates && this.editorConfig.templates.length;
                this.appOptions.canOpenRecent   = this.editorConfig.recent !== undefined;
                this.appOptions.templates       = this.editorConfig.templates;
                this.appOptions.recent          = this.editorConfig.recent;
                this.appOptions.createUrl       = this.editorConfig.createUrl;
                this.appOptions.canRequestCreateNew = this.editorConfig.canRequestCreateNew;
                this.appOptions.lang            = this.editorConfig.lang;
                this.appOptions.location        = (typeof (this.editorConfig.location) == 'string') ? this.editorConfig.location.toLowerCase() : '';
                this.appOptions.sharingSettingsUrl = this.editorConfig.sharingSettingsUrl;
                this.appOptions.fileChoiceUrl   = this.editorConfig.fileChoiceUrl;
                this.appOptions.saveAsUrl       = this.editorConfig.saveAsUrl;
                this.appOptions.canAnalytics    = false;
                this.appOptions.canRequestClose = this.editorConfig.canRequestClose;
                this.appOptions.canBackToFolder = (this.editorConfig.canBackToFolder!==false) && (typeof (this.editorConfig.customization) == 'object') && (typeof (this.editorConfig.customization.goback) == 'object')
                                                  && (!_.isEmpty(this.editorConfig.customization.goback.url) || this.editorConfig.customization.goback.requestClose && this.appOptions.canRequestClose);
                this.appOptions.canBack         = this.appOptions.canBackToFolder === true;
                this.appOptions.canPlugins      = false;
                this.appOptions.canMakeActionLink = this.editorConfig.canMakeActionLink;
                this.appOptions.canRequestUsers = this.editorConfig.canRequestUsers;
                this.appOptions.canRequestSendNotify = this.editorConfig.canRequestSendNotify;
                this.appOptions.canRequestSaveAs = this.editorConfig.canRequestSaveAs;
                this.appOptions.canRequestInsertImage = this.editorConfig.canRequestInsertImage;
                this.appOptions.canRequestSharingSettings = this.editorConfig.canRequestSharingSettings;
                this.appOptions.compatibleFeatures = true;
                this.appOptions.uiRtl = false;

                this.appOptions.mentionShare = !((typeof (this.appOptions.customization) == 'object') && (this.appOptions.customization.mentionShare==false));

                this.appOptions.user.guest && this.appOptions.canRenameAnonymous && Common.NotificationCenter.on('user:rename', _.bind(this.showRenameUserDialog, this));

                appHeader = this.getApplication().getController('Viewport').getView('Common.Views.Header');
                appHeader.setCanBack(this.appOptions.canBackToFolder === true, (this.appOptions.canBackToFolder) ? this.editorConfig.customization.goback.text : '');

                if (this.editorConfig.lang)
                    this.api.asc_setLocale(this.editorConfig.lang);

                if (this.appOptions.location == 'us' || this.appOptions.location == 'ca')
                    Common.Utils.Metric.setDefaultMetric(Common.Utils.Metric.c_MetricUnits.inch);

                this.appOptions.wopi = this.editorConfig.wopi;
                appHeader.setWopi(this.appOptions.wopi);

                Common.Controllers.Desktop.init(this.appOptions);
                Common.UI.HintManager.setMode(this.appOptions);
            },

            loadDocument: function(data) {
                this.permissions = {};
                this.document = data.doc;

                var docInfo = {};

                if (data.doc) {
                    this.permissions = $.extend(this.permissions, data.doc.permissions);

                    var _options = $.extend({}, data.doc.options, this.editorConfig.actionLink || {});

                    var _user = new Asc.asc_CUserInfo();
                    _user.put_Id(this.appOptions.user.id);
                    _user.put_FullName(this.appOptions.user.fullname);
                    _user.put_IsAnonymousUser(!!this.appOptions.user.anonymous);

                    docInfo = new Asc.asc_CDocInfo();
                    docInfo.put_Id(data.doc.key);
                    docInfo.put_Url(data.doc.url);
                    docInfo.put_DirectUrl(data.doc.directUrl);
                    docInfo.put_Title(data.doc.title);
                    docInfo.put_Format(data.doc.fileType);
                    docInfo.put_VKey(data.doc.vkey);
                    docInfo.put_Options(_options);
                    docInfo.put_UserInfo(_user);
                    docInfo.put_CallbackUrl(this.editorConfig.callbackUrl);
                    docInfo.put_Token(data.doc.token);
                    docInfo.put_Permissions(data.doc.permissions);
                    docInfo.put_EncryptedInfo(this.editorConfig.encryptionKeys);
                    docInfo.put_Lang(this.editorConfig.lang);
                    docInfo.put_Mode(this.editorConfig.mode);

                    var enable = !this.editorConfig.customization || (this.editorConfig.customization.plugins!==false);
                    docInfo.asc_putIsEnabledPlugins(!!enable);
//                    docInfo.put_Review(this.permissions.review);

                    var type = /^(?:(djvu|xps|oxps))$/.exec(data.doc.fileType);
                    var coEditMode = (type && typeof type[1] === 'string') ? 'strict' :  // offline viewer for djvu|xps|oxps
                                    !(this.editorConfig.coEditing && typeof this.editorConfig.coEditing == 'object') ? 'fast' : // fast by default
                                    this.editorConfig.mode === 'view' && this.editorConfig.coEditing.change!==false ? 'fast' : // if can change mode in viewer - set fast for using live viewer
                                    this.editorConfig.coEditing.mode || 'fast';
                    docInfo.put_CoEditingMode(coEditMode);

                    if (type && typeof type[1] === 'string') {
                        this.permissions.edit = this.permissions.review = false;
                    }
                }

                if (!( this.editorConfig.customization && (this.editorConfig.customization.toolbarNoTabs ||
                    (this.editorConfig.targetApp!=='desktop') && (this.editorConfig.customization.loaderName || this.editorConfig.customization.loaderLogo)))) {
                    $('#editor-container').css('overflow', 'hidden');
                    $('#editor-container').append('<div class="doc-placeholder">' + '<div class="line"></div>'.repeat(20) + '</div>');
                }

                this.api.asc_registerCallback('asc_onGetEditorPermissions', _.bind(this.onEditorPermissions, this));
                this.api.asc_registerCallback('asc_onLicenseChanged',       _.bind(this.onLicenseChanged, this));
                this.api.asc_setDocInfo(docInfo);
                this.api.asc_getEditorPermissions(this.editorConfig.licenseUrl, this.editorConfig.customerId);

                if (data.doc) {
                    appHeader.setDocumentCaption(data.doc.title);
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
                    Common.NotificationCenter.trigger('collaboration:sharingdeny');
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

            onDownloadAs: function(format) {
                if ( !this.appOptions.canDownload && !this.appOptions.canDownloadOrigin) {
                    Common.Gateway.reportError(Asc.c_oAscError.ID.AccessDeny, this.errorAccessDeny);
                    return;
                }

                this._state.isFromGatewayDownloadAs = true;
                var _format = (format && (typeof format == 'string')) ? Asc.c_oAscFileType[ format.toUpperCase() ] : null,
                    _defaultFormat = null,
                    textParams = new AscCommon.asc_CTextParams(Asc.c_oAscTextAssociation.PlainLine),
                    _supported = [
                        Asc.c_oAscFileType.TXT,
                        Asc.c_oAscFileType.RTF,
                        Asc.c_oAscFileType.ODT,
                        Asc.c_oAscFileType.DOCX,
                        Asc.c_oAscFileType.HTML,
                        Asc.c_oAscFileType.DOTX,
                        Asc.c_oAscFileType.OTT,
                        Asc.c_oAscFileType.FB2,
                        Asc.c_oAscFileType.EPUB,
                        Asc.c_oAscFileType.DOCM,
                        Asc.c_oAscFileType.JPG,
                        Asc.c_oAscFileType.PNG
                    ];
                var type = /^(?:(pdf|djvu|xps|oxps))$/.exec(this.document.fileType);
                if (!(format && (typeof format == 'string')) || type[1]===format.toLowerCase()) {
                    this.api.asc_DownloadOrigin(true);
                    return;
                }
                if (/^xps|oxps$/.test(this.document.fileType))
                    _supported = _supported.concat([Asc.c_oAscFileType.PDF, Asc.c_oAscFileType.PDFA]);
                else if (/^djvu$/.test(this.document.fileType)) {
                    _supported = [Asc.c_oAscFileType.PDF];
                }
                if ( !_format || _supported.indexOf(_format) < 0 )
                    _format = _defaultFormat;
                if (_format) {
                    var options = new Asc.asc_CDownloadOptions(_format, true);
                    textParams && options.asc_setTextParams(textParams);
                    this.api.asc_DownloadAs(options);
                } else {
                    this.api.asc_DownloadOrigin(true);
                }
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

            disableEditing: function(disable, temp) {
                var app = this.getApplication();
                Common.NotificationCenter.trigger('editing:disable', disable, {
                    viewMode: disable,
                    allowSignature: false,
                    statusBar: true,
                    leftMenu: {disable: true, previewMode: true},
                    fileMenu: {protect: true},
                    navigation: {disable: !temp, previewMode: true},
                    comments: {disable: !temp, previewMode: true},
                    chat: true,
                    viewport: true,
                    documentHolder: {clear: !temp, disable: true},
                    toolbar: true,
                    plugins: false
                }, temp ? 'reconnect' : 'disconnect');
            },

            onEditingDisable: function(disable, options, type) {
                var app = this.getApplication();

                var action = {type: type, disable: disable, options: options};
                if (disable && !this.stackDisableActions.get({type: type}))
                    this.stackDisableActions.push(action);
                !disable && this.stackDisableActions.pop({type: type});
                var prev_options = !disable && (this.stackDisableActions.length()>0) ? this.stackDisableActions.get(this.stackDisableActions.length()-1) : null;

                if (options.statusBar) {
                    app.getController('Statusbar').getView('Statusbar').SetDisabled(disable);
                }
                if (options.viewport) {
                    app.getController('Viewport').SetDisabled(disable);
                }
                if (options.toolbar) {
                    app.getController('Toolbar').DisableToolbar(disable, options.viewMode, options.reviewMode, options.fillFormMode);
                }
                if (options.documentHolder) {
                    options.documentHolder.disable && app.getController('DocumentHolder').SetDisabled(disable, options.allowProtect, options.fillFormMode);
                }
                if (options.leftMenu) {
                    if (options.leftMenu.disable)
                        app.getController('LeftMenu').SetDisabled(disable, options);
                    if (options.leftMenu.previewMode)
                        app.getController('LeftMenu').setPreviewMode(disable);
                }
                if (options.fileMenu) {
                    app.getController('LeftMenu').leftMenu.getMenu('file').SetDisabled(disable, options.fileMenu);
                    if (options.leftMenu.disable)
                        app.getController('LeftMenu').leftMenu.getMenu('file').applyMode();
                }
                if (options.comments) {
                    var comments = this.getApplication().getController('Common.Controllers.Comments');
                    if (comments && options.comments.previewMode)
                        comments.setPreviewMode(disable);
                }
                if (options.navigation && options.navigation.previewMode) {
                    app.getController('Navigation') && app.getController('Navigation').SetDisabled(disable);
                }
                if (options.plugins) {
                    app.getController('Common.Controllers.Plugins').getView('Common.Views.Plugins').SetDisabled(disable, options.reviewMode, options.fillFormMode);
                }

                if (prev_options) {
                    this.onEditingDisable(prev_options.disable, prev_options.options, prev_options.type);
                }
            },

            onRequestClose: function() {
                var me = this;
                if (this.api.isDocumentModified()) {
                    this.api.asc_stopSaving();
                    Common.UI.warning({
                        closable: false,
                        width: 500,
                        title: this.notcriticalErrorTitle,
                        msg: this.leavePageTextOnClose,
                        buttons: ['ok', 'cancel'],
                        primary: 'ok',
                        callback: function(btn) {
                            if (btn == 'ok') {
                                me.api.asc_undoAllChanges();
                                me.api.asc_continueSaving();
                                Common.Gateway.requestClose();
                                // Common.Controllers.Desktop.requestClose();
                            } else
                                me.api.asc_continueSaving();
                        }
                    });
                } else {
                    Common.Gateway.requestClose();
                    // Common.Controllers.Desktop.requestClose();
                }
            },

            goBack: function(current) {
                if ( !Common.Controllers.Desktop.process('goback') ) {
                    if (this.appOptions.customization.goback.requestClose && this.appOptions.canRequestClose) {
                        this.onRequestClose();
                    } else {
                        var href = this.appOptions.customization.goback.url;
                        if (!current && this.appOptions.customization.goback.blank!==false) {
                            window.open(href, "_blank");
                        } else {
                            parent.location.href = href;
                        }
                    }
                }
            },

            markFavorite: function(favorite) {
                if ( !Common.Controllers.Desktop.process('markfavorite') ) {
                    Common.Gateway.metaChange({
                        favorite: favorite
                    });
                }
            },

            onSetFavorite: function(favorite) {
                this.appOptions.canFavorite && appHeader.setFavorite(!!favorite);
            },

            onEditComplete: function(cmp) {
                var application = this.getApplication(),
                    toolbarController = application.getController('Toolbar'),
                    toolbarView = toolbarController.getView();

                if (this.appOptions.isEdit && (toolbarView && toolbarView._isEyedropperStart)) {
                    toolbarView._isEyedropperStart = false;
                    this.api.asc_cancelEyedropper();
                }
                application.getController('DocumentHolder').getView().focus();

                if (this.appOptions.isEdit && toolbarView) {
                    if (toolbarView.btnStrikeout.pressed && ( !_.isObject(arguments[1]) || arguments[1].id !== 'id-toolbar-btn-strikeout')) {
                        this.api.SetMarkerFormat(toolbarView.btnStrikeout.options.type, false);
                        toolbarView.btnStrikeout.toggle(false, false);
                    }
                    if (toolbarView.btnUnderline.pressed && ( !_.isObject(arguments[1]) || arguments[1].id !== 'id-toolbar-btn-underline')) {
                        this.api.SetMarkerFormat(toolbarView.btnUnderline.options.type, false);
                        toolbarView.btnUnderline.toggle(false, false);
                    }
                    if (toolbarView.btnHighlight.pressed && ( !_.isObject(arguments[1]) || arguments[1].id !== 'id-toolbar-btn-highlight')) {
                        this.api.SetMarkerFormat(toolbarView.btnHighlight.options.type, false);
                        toolbarView.btnHighlight.toggle(false, false);
                    }
                }

                if (this.api && this.appOptions.isEdit && !toolbarView._state.previewmode) {
                    var cansave = this.api.asc_isDocumentCanSave(),
                        forcesave = this.appOptions.forcesave,
                        isSyncButton = (toolbarView.btnCollabChanges.rendered) ? toolbarView.btnCollabChanges.cmpEl.hasClass('notify') : false,
                        isDisabled = !cansave && !isSyncButton && !forcesave || this._state.isDisconnected || this._state.fastCoauth && this._state.usersCount>1 && !forcesave || !this.appOptions.isPDFEdit && !this.appOptions.isPDFAnnotate;
                        toolbarView.btnSave.setDisabled(isDisabled);
                }

                Common.UI.HintManager.clearHints(true);
            },

            onLongActionBegin: function(type, id) {
                var action = {id: id, type: type};
                this.stackLongActions.push(action);
                this.setLongActionView(action);
            },

            onLongActionEnd: function(type, id) {
                var action = {id: id, type: type};
                this.stackLongActions.pop(action);

                appHeader && appHeader.setDocumentCaption(this.api.asc_getDocumentName());
                this.updateWindowTitle(true);

                action = this.stackLongActions.get({type: Asc.c_oAscAsyncActionType.Information});
                if (action) {
                    this.setLongActionView(action)
                } else {
                    var me = this;
                    if ((id==Asc.c_oAscAsyncAction['Save'] || id==Asc.c_oAscAsyncAction['ForceSaveButton']) && !this.appOptions.isOffline) {
                        if (this._state.fastCoauth && this._state.usersCount>1) {
                            me._state.timerSave = setTimeout(function () {
                                me.getApplication().getController('Statusbar').setStatusCaption(me.textChangesSaved, false, 3000);
                            }, 500);
                        } else
                            me.getApplication().getController('Statusbar').setStatusCaption(me.textChangesSaved, false, 3000);
                    } else
                        this.getApplication().getController('Statusbar').setStatusCaption('');
                }

                action = this.stackLongActions.get({type: Asc.c_oAscAsyncActionType.BlockInteraction});
                action ? this.setLongActionView(action) : this.loadMask && this.loadMask.hide();

                if (this.appOptions.isEdit && (id==Asc.c_oAscAsyncAction['Save'] || id==Asc.c_oAscAsyncAction['ForceSaveButton']) && (!this._state.fastCoauth || this._state.usersCount<2))
                    this.synchronizeChanges();
                // else if (this.appOptions.isEdit && (id==Asc.c_oAscAsyncAction['Save'] || id==Asc.c_oAscAsyncAction['ForceSaveButton'] || id == Asc.c_oAscAsyncAction['ApplyChanges']) &&
                //         this._state.fastCoauth)
                //     this.getApplication().getController('Common.Controllers.ReviewChanges').synchronizeChanges();

                if ( id == Asc.c_oAscAsyncAction['Open']) {
                    Common.Utils.InternalSettings.get("pdfe-settings-livecomment") ? this.api.asc_showComments(Common.Utils.InternalSettings.get("pdfe-settings-resolvedcomment")) : this.api.asc_hideComments();
                }

                if ( id == Asc.c_oAscAsyncAction['Disconnect']) {
                    this._state.timerDisconnect && clearTimeout(this._state.timerDisconnect);
                    this.disableEditing(false, true);
                    this.getApplication().getController('Statusbar').hideDisconnectTip();
                    this.getApplication().getController('Statusbar').setStatusCaption(this.textReconnect);
                }

                if ( type == Asc.c_oAscAsyncActionType.BlockInteraction &&
                    (!this.getApplication().getController('LeftMenu').dlgSearch || !this.getApplication().getController('LeftMenu').dlgSearch.isVisible()) &&
                    (!this.getApplication().getController('Toolbar').dlgSymbolTable || !this.getApplication().getController('Toolbar').dlgSymbolTable.isVisible()) &&
                    !((id == Asc.c_oAscAsyncAction['LoadDocumentFonts'] || id == Asc.c_oAscAsyncAction['ApplyChanges'] || id == Asc.c_oAscAsyncAction['DownloadAs']) && (this.dontCloseDummyComment || this.inTextareaControl || Common.Utils.ModalWindow.isVisible() || this.inFormControl)) ) {
//                        this.onEditComplete(this.loadMask); //если делать фокус, то при принятии чужих изменений, заканчивается свой композитный ввод
                        this.api.asc_enableKeyEvents(true);
                }
            },

            setLongActionView: function(action) {
                var title = '', text = '', force = false;
                var statusCallback = null; // call after showing status

                switch (action.id) {
                    case Asc.c_oAscAsyncAction['Open']:
                        title   = this.openTitleText;
                        text    = this.openTextText;
                        break;

                    case Asc.c_oAscAsyncAction['Save']:
                    case Asc.c_oAscAsyncAction['ForceSaveButton']:
                        clearTimeout(this._state.timerSave);
                        force = true;
                        title   = this.saveTitleText;
                        text    = (!this.appOptions.isOffline) ? this.saveTextText : '';
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

                    case Asc.c_oAscAsyncAction['ApplyChanges']:
                        title   = this.applyChangesTitleText;
                        text    = this.applyChangesTextText;
                        break;

                    case Asc.c_oAscAsyncAction['Waiting']:
                        title   = this.waitText;
                        text    = this.waitText;
                        break;

                    case ApplyEditRights:
                        title   = this.txtEditingMode;
                        text    = this.txtEditingMode;
                        break;

                    case LoadingDocument:
                        title   = this.loadingDocumentTitleText + '           ';
                        text    = this.loadingDocumentTextText;
                        break;

                    case Asc.c_oAscAsyncAction['Disconnect']:
                        text    = this.textDisconnect;
                        Common.UI.Menu.Manager.hideAll();
                        this.disableEditing(true, true);
                        var me = this;
                        statusCallback = function() {
                            me._state.timerDisconnect = setTimeout(function(){
                                me.getApplication().getController('Statusbar').showDisconnectTip();
                            }, me._state.unloadTimer || 0);
                        };
                        break;

                    default:
                        if (typeof action.id == 'string'){
                            title   = action.id;
                            text    = action.id;
                        }
                        break;
                }

                if (action.type == Asc.c_oAscAsyncActionType['BlockInteraction']) {
                    if (!this.loadMask)
                        this.loadMask = new Common.UI.LoadMask({owner: $('#viewport')});

                    this.loadMask.setTitle(title);

                    if (!this.isShowOpenDialog)
                        this.loadMask.show(action.id===Asc.c_oAscAsyncAction['Open']);
                } else {
                    this.getApplication().getController('Statusbar').setStatusCaption(text, force, 0, statusCallback);
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

                if (this._state.openDlg)
                    this._state.openDlg.close();

                var me = this,
                    value;

                me._isDocReady = true;
                Common.NotificationCenter.trigger('app:ready', this.appOptions);

                me.api.SetDrawingFreeze(false);
                me.hidePreloader();
                me.onLongActionEnd(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);

                /** coauthoring begin **/
                this.isLiveCommenting = Common.localStorage.getBool("pdfe-settings-livecomment", true);
                Common.Utils.InternalSettings.set("pdfe-settings-livecomment", this.isLiveCommenting);
                value = Common.localStorage.getBool("pdfe-settings-resolvedcomment");
                Common.Utils.InternalSettings.set("pdfe-settings-resolvedcomment", value);
                this.isLiveCommenting ? this.api.asc_showComments(value) : this.api.asc_hideComments();
                /** coauthoring end **/

                value = Common.localStorage.getItem("pdfe-settings-zoom");
                Common.Utils.InternalSettings.set("pdfe-settings-zoom", value);
                var zf = (value!==null) ? parseInt(value) : (this.appOptions.customization && this.appOptions.customization.zoom ? parseInt(this.appOptions.customization.zoom) : 100);
                value = Common.localStorage.getItem("pdfe-last-zoom");
                var lastZoom = (value!==null) ? parseInt(value):0;
                (zf == -1) ? this.api.zoomFitToPage() : ((zf == -2) ? this.api.zoomFitToWidth() : this.api.zoom(zf>0 ? zf : (zf == -3 && lastZoom > 0) ? lastZoom : 100));

                value = Common.localStorage.getBool("pdfe-settings-compatible", false);
                Common.Utils.InternalSettings.set("pdfe-settings-compatible", value);
                Common.Utils.InternalSettings.set("pdfe-settings-showsnaplines", me.api.get_ShowSnapLines());

                function checkWarns() {
                    if (!Common.Controllers.Desktop.isActive()) {
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
                me.api.asc_registerCallback('asc_onConfirmAction',          _.bind(me.onConfirmAction, me));

                appHeader.setDocumentCaption(me.api.asc_getDocumentName());
                me.updateWindowTitle(true);

                value = Common.localStorage.getBool("pdfe-settings-show-alt-hints", Common.Utils.isMac ? false : true);
                Common.Utils.InternalSettings.set("pdfe-settings-show-alt-hints", value);

                /** coauthoring begin **/
                me.onPdfModeApply();
                /** coauthoring end **/

                var application                 = me.getApplication();
                var toolbarController           = application.getController('Toolbar'),
                    statusbarController         = application.getController('Statusbar'),
                    documentHolderController    = application.getController('DocumentHolder'),
                    leftmenuController          = application.getController('LeftMenu'),
                    chatController              = application.getController('Common.Controllers.Chat'),
                    pluginsController           = application.getController('Common.Controllers.Plugins'),
                    navigationController        = application.getController('Navigation');


                leftmenuController.getView('LeftMenu').getMenu('file').loadDocument({doc:me.document});
                leftmenuController.createDelayedElements().setApi(me.api);

                navigationController.setMode(me.appOptions).setApi(me.api);

                chatController.setApi(this.api).setMode(this.appOptions);
                pluginsController.setApi(me.api);

                documentHolderController.setApi(me.api);
                statusbarController.createDelayedElements();

                leftmenuController.getView('LeftMenu').disableMenu('all',false);

                if (me.appOptions.canBranding)
                    me.getApplication().getController('LeftMenu').leftMenu.getMenu('about').setLicInfo(me.editorConfig.customization);

                documentHolderController.getView().on('editcomplete', _.bind(me.onEditComplete, me));

                if (me.appOptions.isEdit) {
                    if (me.appOptions.canForcesave) {// use asc_setIsForceSaveOnUserSave only when customization->forcesave = true
                        me.appOptions.forcesave = Common.localStorage.getBool("pdfe-settings-forcesave", me.appOptions.canForcesave);
                        Common.Utils.InternalSettings.set("pdfe-settings-forcesave", me.appOptions.forcesave);
                        me.api.asc_setIsForceSaveOnUserSave(me.appOptions.forcesave);
                    }

                    if (me.needToUpdateVersion)
                        Common.NotificationCenter.trigger('api:disconnect');


                    var timer_sl = setTimeout(function(){
                        toolbarController.createDelayedElements();

                        toolbarController.activateControls();
                        if (me.needToUpdateVersion)
                            toolbarController.onApiCoAuthoringDisconnect();
                        me.api.UpdateInterfaceState();

                        Common.NotificationCenter.trigger('document:ready', 'main');
                        me.applyLicense();
                    }, 500);
                } else {
                    Common.NotificationCenter.trigger('document:ready', 'main');
                    me.applyLicense();
                }

                // TODO bug 43960
                var dummyClass = ~~(1e6*Math.random());
                $('.toolbar').prepend(Common.Utils.String.format('<div class="lazy-{0} x-huge"><div class="toolbar__icon" style="position: absolute; width: 1px; height: 1px;"></div>', dummyClass));
                setTimeout(function() { $(Common.Utils.String.format('.toolbar .lazy-{0}', dummyClass)).remove(); }, 10);

                if (this.appOptions.canAnalytics && false)
                    Common.component.Analytics.initialize('UA-12442749-13', 'Document Editor');

                Common.Gateway.on('applyeditrights',        _.bind(me.onApplyEditRights, me));
                Common.Gateway.on('processsaveresult',      _.bind(me.onProcessSaveResult, me));
                Common.Gateway.on('processrightschange',    _.bind(me.onProcessRightsChange, me));
                Common.Gateway.on('processmouse',           _.bind(me.onProcessMouse, me));
                Common.Gateway.on('downloadas',             _.bind(me.onDownloadAs, me));
                Common.Gateway.on('setfavorite',            _.bind(me.onSetFavorite, me));
                Common.Gateway.on('requestclose',           _.bind(me.onRequestClose, me));

                Common.Gateway.sendInfo({mode:me.appOptions.isEdit?'edit':'view'});

                $(document).on('contextmenu', _.bind(me.onContextMenu, me));
                Common.Gateway.documentReady();

                $('#editor-container').css('overflow', '');
                $('.doc-placeholder').remove();

                this.appOptions.user.guest && this.appOptions.canRenameAnonymous && (Common.Utils.InternalSettings.get("guest-username")===null) && this.showRenameUserDialog();
                if (this._needToSaveAsFile) // warning received before document is ready
                    this.getApplication().getController('LeftMenu').leftMenu.showMenu('file:saveas');
            },

            onLicenseChanged: function(params) {
                var licType = params.asc_getLicenseType();
                if (licType !== undefined && (this.appOptions.canPDFEdit) && this.editorConfig.mode !== 'view' &&
                   (licType===Asc.c_oLicenseResult.Connections || licType===Asc.c_oLicenseResult.UsersCount || licType===Asc.c_oLicenseResult.ConnectionsOS || licType===Asc.c_oLicenseResult.UsersCountOS
                   || licType===Asc.c_oLicenseResult.SuccessLimit && (this.appOptions.trialMode & Asc.c_oLicenseMode.Limited) !== 0))
                    this._state.licenseType = licType;

                if (this._isDocReady)
                    this.applyLicense();
            },

            applyLicense: function() {
                if (this.appOptions.canSwitchMode && (this.appOptions.canPDFAnnotate || this.appOptions.canPDFEdit) &&
                    !this.appOptions.isDesktopApp && !this.appOptions.canBrandingExt &&
                    this.editorConfig && this.editorConfig.customization && (this.editorConfig.customization.loaderName || this.editorConfig.customization.loaderLogo ||
                    this.editorConfig.customization.font && (this.editorConfig.customization.font.size || this.editorConfig.customization.font.name))) {
                    Common.UI.warning({
                        title: this.textPaidFeature,
                        msg  : this.textCustomLoader,
                        buttons: [{value: 'contact', caption: this.textContactUs}, {value: 'close', caption: this.textClose}],
                        primary: 'contact',
                        callback: function(btn) {
                            if (btn == 'contact')
                                window.open('mailto:{{SALES_EMAIL}}', "_blank");
                        }
                    });
                }
            },

            onOpenDocument: function(progress) {
                var elem = document.getElementById('loadmask-text');
                var proc = (progress.asc_getCurrentFont() + progress.asc_getCurrentImage())/(progress.asc_getFontsCount() + progress.asc_getImagesCount());
                proc = this.textLoadingDocument + ': ' + Common.Utils.String.fixedDigits(Math.min(Math.round(proc*100), 100), 3, "  ") + "%";
                elem ? elem.innerHTML = proc : this.loadMask && this.loadMask.setTitle(proc);
            },

            onEditorPermissions: function(params) {
                var licType = params.asc_getLicenseType();
                if (Asc.c_oLicenseResult.Expired === licType || Asc.c_oLicenseResult.Error === licType || Asc.c_oLicenseResult.ExpiredTrial === licType ||
                    Asc.c_oLicenseResult.NotBefore === licType || Asc.c_oLicenseResult.ExpiredLimited === licType) {
                    Common.UI.warning({
                        title: Asc.c_oLicenseResult.NotBefore === licType ? this.titleLicenseNotActive : this.titleLicenseExp,
                        msg: Asc.c_oLicenseResult.NotBefore === licType ? this.warnLicenseBefore : this.warnLicenseExp,
                        buttons: [],
                        closable: false
                    });
                    return;
                }

                if ( this.onServerVersion(params.asc_getBuildVersion()) || !this.onLanguageLoaded()) return;

                if (params.asc_getRights() !== Asc.c_oRights.Edit)
                    this.permissions.edit = this.permissions.review = false;

                var isXpsViewer = /^(?:(djvu|xps|oxps))$/.test(this.document.fileType) || Common.Locale.getDefaultLanguage() === 'ru';

                this.appOptions.permissionsLicense = licType;
                this.appOptions.canAnalytics   = params.asc_getIsAnalyticsEnable();
                this.appOptions.canLicense     = (licType === Asc.c_oLicenseResult.Success || licType === Asc.c_oLicenseResult.SuccessLimit);
                this.appOptions.isLightVersion = params.asc_getIsLight();
                /** coauthoring begin **/
                this.appOptions.canCoAuthoring = !this.appOptions.isLightVersion;
                /** coauthoring end **/
                this.appOptions.isOffline      = this.api.asc_isOffline();
                this.appOptions.canCreateNew   = this.appOptions.canCreateNew && !this.appOptions.isOffline;
                this.appOptions.isCrypted      = this.api.asc_isCrypto();
                this.appOptions.canRequestEditRights = this.editorConfig.canRequestEditRights;
                this.appOptions.canEdit        = !isXpsViewer;
                this.appOptions.isEdit         = !isXpsViewer;
                this.appOptions.canPDFEdit     = false;//(this.permissions.edit !== false) && this.appOptions.canLicense;
                this.appOptions.isPDFEdit      = false; // this.appOptions.canPDFEdit && this.editorConfig.mode !== 'view'; !! always open in view mode
                this.appOptions.canPDFAnnotate = this.appOptions.canLicense && (this.permissions.comment!== false);
                this.appOptions.canPDFAnnotate = this.appOptions.canPDFAnnotate && !((typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.comments===false);
                this.appOptions.isPDFAnnotate  = false;// this.appOptions.canLicense && this.appOptions.canPDFAnnotate && !this.appOptions.isPDFEdit && this.editorConfig.mode !== 'view'; !! always open in view mode
                this.appOptions.canSwitchMode = !isXpsViewer && false; // switch between View/pdf comments/pdf edit
                this.appOptions.canComments    = !isXpsViewer;
                this.appOptions.canViewComments = this.appOptions.canComments;
                this.appOptions.canChat        = this.appOptions.canLicense && !this.appOptions.isOffline && !(this.permissions.chat===false || (this.permissions.chat===undefined) &&
                                                                                                               (typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.chat===false);
                if ((typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.chat!==undefined) {
                    console.log("Obsolete: The 'chat' parameter of the 'customization' section is deprecated. Please use 'chat' parameter in the permissions instead.");
                }
                this.appOptions.canPrint       = (this.permissions.print !== false);
                this.appOptions.canPreviewPrint = this.appOptions.canPrint && !Common.Utils.isMac && this.appOptions.isDesktopApp;
                this.appOptions.canQuickPrint = this.appOptions.canPrint && !Common.Utils.isMac && this.appOptions.isDesktopApp;
                this.appOptions.canRename      = this.editorConfig.canRename;
                this.appOptions.buildVersion   = params.asc_getBuildVersion();
                this.appOptions.canForcesave   = this.appOptions.isPDFEdit && !this.appOptions.isOffline && (typeof (this.editorConfig.customization) == 'object' && !!this.editorConfig.customization.forcesave);
                this.appOptions.forcesave      = this.appOptions.canForcesave;
                this.appOptions.canEditComments= this.appOptions.isOffline || !this.permissions.editCommentAuthorOnly;
                this.appOptions.canDeleteComments= this.appOptions.isOffline || !this.permissions.deleteCommentAuthorOnly;
                if ((typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.commentAuthorOnly===true) {
                    console.log("Obsolete: The 'commentAuthorOnly' parameter of the 'customization' section is deprecated. Please use 'editCommentAuthorOnly' and 'deleteCommentAuthorOnly' parameters in the permissions instead.");
                    if (this.permissions.editCommentAuthorOnly===undefined && this.permissions.deleteCommentAuthorOnly===undefined)
                        this.appOptions.canEditComments = this.appOptions.canDeleteComments = this.appOptions.isOffline;
                }

                this.appOptions.trialMode      = params.asc_getLicenseMode();
                this.appOptions.isBeta         = params.asc_getIsBeta();
                this.appOptions.isSignatureSupport= false;//this.appOptions.isEdit && this.appOptions.isDesktopApp && this.appOptions.isOffline && this.api.asc_isSignaturesSupport() && (this.permissions.protect!==false);
                this.appOptions.isPasswordSupport = false;//this.appOptions.isEdit && this.api.asc_isProtectionSupport() && (this.permissions.protect!==false);
                this.appOptions.canProtect     = (this.permissions.protect!==false);
                this.appOptions.canHelp        = !((typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.help===false);

                if ( !this.appOptions.canCoAuthoring ) {
                    this.appOptions.canChat = false;
                }

                this.appOptions.canDownloadOrigin = false;
                this.appOptions.canDownload       = this.permissions.download !== false;
                this.appOptions.canUseSelectHandTools = isXpsViewer;
                this.appOptions.canUseThumbnails = this.appOptions.canUseViwerNavigation = true;

                this.appOptions.fileKey = this.document.key;

                this.appOptions.canBranding  = params.asc_getCustomization();
                if (this.appOptions.canBranding)
                    appHeader.setBranding(this.editorConfig.customization);

                this.appOptions.canFavorite = this.document.info && (this.document.info.favorite!==undefined && this.document.info.favorite!==null) && !this.appOptions.isOffline;
                this.appOptions.canFavorite && appHeader.setFavorite(this.document.info.favorite);

                this.appOptions.canUseCommentPermissions = this.appOptions.canLicense && !!this.permissions.commentGroups;
                this.appOptions.canUseUserInfoPermissions = this.appOptions.canLicense && !!this.permissions.userInfoGroups;
                AscCommon.UserInfoParser.setParser(true);
                AscCommon.UserInfoParser.setCurrentName(this.appOptions.user.fullname);
                this.appOptions.canUseCommentPermissions && AscCommon.UserInfoParser.setCommentPermissions(this.permissions.commentGroups);
                this.appOptions.canUseUserInfoPermissions && AscCommon.UserInfoParser.setUserInfoPermissions(this.permissions.userInfoGroups);
                appHeader.setUserName(AscCommon.UserInfoParser.getParsedName(AscCommon.UserInfoParser.getCurrentName()));

                this.appOptions.canRename && appHeader.setCanRename(true);
                this.appOptions.canBrandingExt = params.asc_getCanBranding() && (typeof this.editorConfig.customization == 'object' || this.editorConfig.plugins);
                this.getApplication().getController('Common.Controllers.Plugins').setMode(this.appOptions, this.api);
                this.editorConfig.customization && Common.UI.LayoutManager.init(this.editorConfig.customization.layout, this.appOptions.canBrandingExt);
                this.editorConfig.customization && Common.UI.FeaturesManager.init(this.editorConfig.customization.features, this.appOptions.canBrandingExt);
                Common.UI.ExternalUsers.init(this.appOptions.canRequestUsers);

                if (this.appOptions.canComments)
                    Common.NotificationCenter.on('comments:cleardummy', _.bind(this.onClearDummyComment, this));
                    Common.NotificationCenter.on('comments:showdummy', _.bind(this.onShowDummyComment, this));

                // change = true by default in editor
                this.appOptions.canLiveView = false;
                this.appOptions.canChangeCoAuthoring = this.appOptions.isEdit && this.appOptions.canCoAuthoring && !(this.editorConfig.coEditing && typeof this.editorConfig.coEditing == 'object' && this.editorConfig.coEditing.change===false);

                this.loadCoAuthSettings();
                this.applyModeCommonElements();
                this.applyModeEditorElements();

                if ( !this.appOptions.isEdit ) {
                    Common.NotificationCenter.trigger('app:face', this.appOptions);

                    this.hidePreloader();
                    this.onLongActionBegin(Asc.c_oAscAsyncActionType.BlockInteraction, LoadingDocument);
                }

                this.api.asc_setViewMode(!this.appOptions.isEdit);
                this.api.asc_LoadDocument();
            },

            loadCoAuthSettings: function() {
                var fastCoauth = true,
                    autosave = 1,
                    value;
                if (this.appOptions.isEdit && !this.appOptions.isOffline && this.appOptions.canCoAuthoring) {
                    if (!this.appOptions.canChangeCoAuthoring) { //can't change co-auth. mode. Use coEditing.mode or 'fast' by default
                        value = (this.editorConfig.coEditing && this.editorConfig.coEditing.mode!==undefined) ? (this.editorConfig.coEditing.mode==='strict' ? 0 : 1) : null;
                        if (value===null && this.appOptions.customization && this.appOptions.customization.autosave===false) {
                            value = 0; // use customization.autosave only when coEditing.mode is null
                        }
                    } else {
                        value = Common.localStorage.getItem("pdfe-settings-coauthmode");
                        if (value===null) {
                            value = (this.editorConfig.coEditing && this.editorConfig.coEditing.mode!==undefined) ? (this.editorConfig.coEditing.mode==='strict' ? 0 : 1) : null;
                            if (value===null && !Common.localStorage.itemExists("pdfe-settings-autosave") &&
                                this.appOptions.customization && this.appOptions.customization.autosave===false) {
                                value = 0; // use customization.autosave only when pdfe-settings-coauthmode and pdfe-settings-autosave are null
                            }
                        }
                    }
                    fastCoauth = (value===null || parseInt(value) == 1);

                    value = Common.localStorage.getItem((fastCoauth) ? "pdfe-settings-showchanges-fast" : "pdfe-settings-showchanges-strict");
                    if (value == null) value = fastCoauth ? 'none' : 'last';
                    Common.Utils.InternalSettings.set((fastCoauth) ? "pdfe-settings-showchanges-fast" : "pdfe-settings-showchanges-strict", value);
                } else {
                    fastCoauth = false;
                    autosave = 0;
                }

                if (this.appOptions.isEdit) {
                    value = Common.localStorage.getItem("pdfe-settings-autosave");
                    if (value === null && this.appOptions.customization && this.appOptions.customization.autosave === false)
                        value = 0;
                    autosave = (!fastCoauth && value !== null) ? parseInt(value) : (this.appOptions.canCoAuthoring ? 1 : 0);
                }

                Common.Utils.InternalSettings.set("pdfe-settings-coauthmode", fastCoauth);
                Common.Utils.InternalSettings.set("pdfe-settings-autosave", autosave);
            },

            onPdfModeChange: function(mode, callback) {
                if (!this.appOptions.canSwitchMode) return;

                if (mode==='comment' || mode==='edit') {
                    if (!this.appOptions.isAnonymousSupport && !!this.appOptions.user.anonymous) {
                        Common.UI.warning({
                            title: this.notcriticalErrorTitle,
                            msg  : this.warnLicenseAnonymous,
                            buttons: ['ok']
                        });
                        return;
                    } else if (this._state.licenseType) {
                        var license = this._state.licenseType,
                            buttons = ['ok'],
                            primary = 'ok';
                        if ((this.appOptions.trialMode & Asc.c_oLicenseMode.Limited) !== 0 &&
                            (license===Asc.c_oLicenseResult.SuccessLimit || this.appOptions.permissionsLicense===Asc.c_oLicenseResult.SuccessLimit)) {
                            license = this.warnLicenseLimitedRenewed;
                        } else if (license===Asc.c_oLicenseResult.Connections || license===Asc.c_oLicenseResult.UsersCount) {
                            license = (license===Asc.c_oLicenseResult.Connections) ? this.warnLicenseExceeded : this.warnLicenseUsersExceeded;
                        } else {
                            license = (license===Asc.c_oLicenseResult.ConnectionsOS) ? this.warnNoLicense : this.warnNoLicenseUsers;
                            buttons = [{value: 'buynow', caption: this.textBuyNow}, {value: 'contact', caption: this.textContactUs}];
                            primary = 'buynow';
                        }

                        Common.UI.info({
                            maxwidth: 500,
                            title: this.textNoLicenseTitle,
                            msg  : license,
                            buttons: buttons,
                            primary: primary,
                            callback: function(btn) {
                                if (btn == 'buynow')
                                    window.open('{{PUBLISHER_URL}}', "_blank");
                                else if (btn == 'contact')
                                    window.open('mailto:{{SALES_EMAIL}}', "_blank");
                            }
                        });
                        return;
                    }
                }

                if (mode==='edit' && this.appOptions.canPDFEdit) {
                    this.appOptions.isPDFEdit = true;
                    this.appOptions.isPDFAnnotate = false;
                } else if (mode==='comment' && this.appOptions.canPDFAnnotate) {
                    this.appOptions.isPDFEdit = false;
                    this.appOptions.isPDFAnnotate = true;
                } else if (mode==='view') {
                    this.appOptions.isPDFEdit = this.appOptions.isPDFAnnotate = false;
                }
                callback && callback();
                this.onPdfModeApply();
            },

            onPdfModeApply: function() {
                if (!this.api) return;

                this._state.fastCoauth = (this.appOptions.isPDFAnnotate || this.appOptions.isPDFEdit) ? Common.Utils.InternalSettings.get("pdfe-settings-coauthmode") : false;
                this.api.asc_SetFastCollaborative(this._state.fastCoauth);
                this.api.asc_setAutoSaveGap(this.appOptions.isPDFAnnotate || this.appOptions.isPDFEdit ? Common.Utils.InternalSettings.get("pdfe-settings-autosave") : 0);
                if (this.appOptions.isPDFAnnotate || this.appOptions.isPDFEdit) {
                    var value = Common.Utils.InternalSettings.get((this._state.fastCoauth) ? "pdfe-settings-showchanges-fast" : "pdfe-settings-showchanges-strict");
                    switch(value) {
                        case 'all': value = Asc.c_oAscCollaborativeMarksShowType.All; break;
                        case 'none': value = Asc.c_oAscCollaborativeMarksShowType.None; break;
                        case 'last': value = Asc.c_oAscCollaborativeMarksShowType.LastChanges; break;
                        default: value = (this._state.fastCoauth) ? Asc.c_oAscCollaborativeMarksShowType.None : Asc.c_oAscCollaborativeMarksShowType.LastChanges;
                    }
                    this.api.SetCollaborativeMarksShowType(value);
                }

                this.getApplication().getController('LeftMenu').leftMenu.getMenu('file').applyMode();
            },

            applyModeCommonElements: function() {
                window.editor_elements_prepared = true;

                var app             = this.getApplication(),
                    viewport        = app.getController('Viewport').getView('Viewport'),
                    statusbarView   = app.getController('Statusbar').getView('Statusbar'),
                    documentHolder  = app.getController('DocumentHolder'),
                    toolbarController   = app.getController('Toolbar'),
                    leftMenu            = app.getController('LeftMenu');

                viewport && viewport.setMode(this.appOptions);
                statusbarView && statusbarView.setMode(this.appOptions);
                toolbarController.setMode(this.appOptions);
                documentHolder.setMode(this.appOptions);
                leftMenu.setMode(this.appOptions);

                viewport.applyCommonMode();

                var printController = app.getController('Print');
                printController && this.api && printController.setApi(this.api).setMode(this.appOptions);

                this.api.asc_registerCallback('asc_onDownloadUrl',     _.bind(this.onDownloadUrl, this));
                this.api.asc_registerCallback('asc_onAuthParticipantsChanged', _.bind(this.onAuthParticipantsChanged, this));
                this.api.asc_registerCallback('asc_onParticipantsChanged',     _.bind(this.onAuthParticipantsChanged, this));
                this.api.asc_registerCallback('asc_onConnectionStateChanged',  _.bind(this.onUserConnection, this));
                this.api.asc_registerCallback('asc_onDocumentModifiedChanged', _.bind(this.onDocumentModifiedChanged, this));

                var value = Common.localStorage.getItem('pdfe-settings-unit');
                value = (value!==null) ? parseInt(value) : (this.appOptions.customization && this.appOptions.customization.unit ? Common.Utils.Metric.c_MetricUnits[this.appOptions.customization.unit.toLocaleLowerCase()] : Common.Utils.Metric.getDefaultMetric());
                (value===undefined) && (value = Common.Utils.Metric.getDefaultMetric());
                Common.Utils.Metric.setCurrentMetric(value);
                Common.Utils.InternalSettings.set("pdfe-settings-unit", value);
            },

            applyModeEditorElements: function() {
                /** coauthoring begin **/
                this.contComments.setMode(this.appOptions);
                this.contComments.setConfig({config: this.editorConfig}, this.api);
                /** coauthoring end **/

                var me = this,
                    application         = this.getApplication();
                    // reviewController    = application.getController('Common.Controllers.ReviewChanges');
                // reviewController.setMode(me.appOptions).setConfig({config: me.editorConfig}, me.api).loadDocument({doc:me.document});

                var toolbarController   = application.getController('Toolbar');
                toolbarController   && toolbarController.setApi(me.api);

                if (this.appOptions.isEdit) {
                    // var fontsControllers    = application.getController('Common.Controllers.Fonts');
                    // fontsControllers    && fontsControllers.setApi(me.api);
                    // application.getController('Common.Controllers.Protection').setMode(me.appOptions).setConfig({config: me.editorConfig}, me.api);

                    var viewport = this.getApplication().getController('Viewport').getView('Viewport');
                    viewport.applyEditorMode();

                    var toolbarView = (toolbarController) ? toolbarController.getView() : null;
                    if (toolbarView) {
                        toolbarView.setApi(me.api);
                        toolbarView.on('editcomplete', _.bind(me.onEditComplete, me));
                    }

                    var value = Common.Utils.InternalSettings.get("pdfe-settings-unit");
                    me.api.asc_SetDocumentUnits((value==Common.Utils.Metric.c_MetricUnits.inch) ? Asc.c_oAscDocumentUnits.Inch : ((value==Common.Utils.Metric.c_MetricUnits.pt) ? Asc.c_oAscDocumentUnits.Point : Asc.c_oAscDocumentUnits.Millimeter));

                    me.api.asc_registerCallback('asc_onDocumentCanSaveChanged',  _.bind(me.onDocumentCanSaveChanged, me));
                    /** coauthoring begin **/
                    me.api.asc_registerCallback('asc_onCollaborativeChanges',    _.bind(me.onCollaborativeChanges, me));
                    me.api.asc_registerCallback('asc_OnTryUndoInFastCollaborative',_.bind(me.onTryUndoInFastCollaborative, me));
                    /** coauthoring end **/

                    if (me.stackLongActions.exist({id: ApplyEditRights, type: Asc.c_oAscAsyncActionType['BlockInteraction']})) {
                        me.onLongActionEnd(Asc.c_oAscAsyncActionType['BlockInteraction'], ApplyEditRights);
                    } else if (!this._isDocReady) {
                        Common.NotificationCenter.trigger('app:face', me.appOptions);

                        me.hidePreloader();
                        me.onLongActionBegin(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);
                    }

                    // Message on window close
                    window.onbeforeunload = _.bind(me.onBeforeUnload, me);
                    window.onunload = _.bind(me.onUnload, me);
                }
            },

            onExternalMessage: function(msg, options) {
                if (msg && msg.msg) {
                    msg.msg = (msg.msg).toString();
                    this.showTips([msg.msg.charAt(0).toUpperCase() + msg.msg.substring(1)], options);

                    Common.component.Analytics.trackEvent('External Error');
                }
            },

            onError: function(id, level, errData) {
                if (id == Asc.c_oAscError.ID.LoadingScriptError) {
                    this.showTips([this.scriptLoadError]);
                    this.tooltip && this.tooltip.getBSTip().$tip.css('z-index', 10000);
                    return;
                } else if (id == Asc.c_oAscError.ID.CanNotPasteImage) {
                    this.showTips([this.errorCannotPasteImg], {timeout: 7000, hideCloseTip: true});
                    return;
                }

                this.hidePreloader();
                this.onLongActionEnd(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);

                var config = {
                    closable: true
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
                        config.msg = (this.appOptions.isDesktopApp && this.appOptions.isOffline) ? this.saveErrorTextDesktop : this.saveErrorText;
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

                    case Asc.c_oAscError.ID.UplDocumentSize:
                        config.msg = this.uploadDocSizeMessage;
                        break;

                    case Asc.c_oAscError.ID.UplDocumentExt:
                        config.msg = this.uploadDocExtMessage;
                        break;

                    case Asc.c_oAscError.ID.UplDocumentFileCount:
                        config.msg = this.uploadDocFileCountMessage;
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

                    case Asc.c_oAscError.ID.UserDrop:
                        if (this._state.lostEditingRights) {
                            this._state.lostEditingRights = false;
                            return;
                        }
                        this._state.lostEditingRights = true;
                        config.msg = this.errorUserDrop;
                        Common.NotificationCenter.trigger('collaboration:sharingdeny');
                        break;

                    case Asc.c_oAscError.ID.Warning:
                        config.msg = this.errorConnectToServer;
                        config.closable = false;
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

                    case Asc.c_oAscError.ID.UplImageUrl:
                        config.msg = this.errorBadImageUrl;
                        break;

                    case Asc.c_oAscError.ID.ForceSaveButton:
                    case Asc.c_oAscError.ID.ForceSaveTimeout:
                        config.msg = this.errorForceSave;
                        config.maxwidth = 600;
                        break;

                    case Asc.c_oAscError.ID.DataEncrypted:
                        config.msg = this.errorDataEncrypted;
                        break;

                    case Asc.c_oAscError.ID.EditingError:
                        config.msg = (this.appOptions.isDesktopApp && this.appOptions.isOffline) ? this.errorEditingSaveas : this.errorEditingDownloadas;
                        break;

                    case Asc.c_oAscError.ID.ConvertationOpenLimitError:
                        config.msg = this.errorFileSizeExceed;
                        break;

                    case Asc.c_oAscError.ID.UpdateVersion:
                        config.msg = this.errorUpdateVersionOnDisconnect;
                        config.maxwidth = 600;
                        break;

                    case Asc.c_oAscError.ID.DirectUrl:
                        config.msg = this.errorDirectUrl;
                        break;

                    case Asc.c_oAscError.ID.Password:
                        config.msg = this.errorSetPassword;
                        break;

                    case Asc.c_oAscError.ID.LoadingFontError:
                        config.msg = this.errorLoadingFont;
                        break;

                    case Asc.c_oAscError.ID.PasswordIsNotCorrect:
                        config.msg = this.errorPasswordIsNotCorrect;
                        break;

                    case Asc.c_oAscError.ID.ConvertationOpenFormat:
                        config.maxwidth = 600;
                        if (errData === 'pdf')
                            config.msg = this.errorInconsistentExtPdf.replace('%1', this.document.fileType || '');
                        else if  (errData === 'docx')
                            config.msg = this.errorInconsistentExtDocx.replace('%1', this.document.fileType || '');
                        else if  (errData === 'xlsx')
                            config.msg = this.errorInconsistentExtXlsx.replace('%1', this.document.fileType || '');
                        else if  (errData === 'pptx')
                            config.msg = this.errorInconsistentExtPptx.replace('%1', this.document.fileType || '');
                        else
                            config.msg = this.errorInconsistentExt;
                        break;

                    default:
                        config.msg = (typeof id == 'string') ? id : this.errorDefaultMessage.replace('%1', id);
                        break;
                }

                if (level == Asc.c_oAscError.Level.Critical) {

                    // report only critical errors
                    Common.Gateway.reportError(id, config.msg);

                    config.title = this.criticalErrorTitle;
                    config.iconCls = 'error';
                    config.closable = false;

                    if (this.appOptions.canBackToFolder && !this.appOptions.isDesktopApp && typeof id !== 'string') {
                        config.msg += '<br><br>' + this.criticalErrorExtText;
                        config.callback = function(btn) {
                            if (btn == 'ok')
                                Common.NotificationCenter.trigger('goback', true);
                        }
                    }
                    if (id == Asc.c_oAscError.ID.DataEncrypted || id == Asc.c_oAscError.ID.ConvertationOpenLimitError) {
                        this.api.asc_coAuthoringDisconnect();
                        Common.NotificationCenter.trigger('api:disconnect');
                    }
                }
                else {
                    Common.Gateway.reportWarning(id, config.msg);

                    config.title    = this.notcriticalErrorTitle;
                    config.iconCls  = 'warn';
                    config.buttons  = ['ok'];
                    config.callback = _.bind(function(btn){
                        if (id == Asc.c_oAscError.ID.Warning && btn == 'ok' && (this.appOptions.canDownload || this.appOptions.canDownloadOrigin)) {
                            Common.UI.Menu.Manager.hideAll();
                            if (this.appOptions.isDesktopApp && this.appOptions.isOffline)
                                this.api.asc_DownloadAs();
                            else {
                                if (this.appOptions.canDownload) {
                                    this._isDocReady ? this.getApplication().getController('LeftMenu').leftMenu.showMenu('file:saveas') : (this._needToSaveAsFile = true);
                                } else
                                    this.api.asc_DownloadOrigin();
                            }
                        } else if (id == Asc.c_oAscError.ID.EditingError) {
                            this.disableEditing(true);
                            Common.NotificationCenter.trigger('api:disconnect', true); // enable download and print
                        }
                        this._state.lostEditingRights = false;
                        this.onEditComplete();
                    }, this);
                }

                if (!Common.Utils.ModalWindow.isVisible() || $('.asc-window.modal.alert[data-value=' + id + ']').length<1)
                    Common.UI.alert(config).$window.attr('data-value', id);

                (id!==undefined) && Common.component.Analytics.trackEvent('Internal Error', id.toString());
            },

            onOpenLinkPdfForm: function(sURI, onAllow, onCancel) {
                var id = 'pdf-link',
                    config = {
                        closable: true,
                        title: this.notcriticalErrorTitle,
                        iconCls: 'warn',
                        buttons: ['ok', 'cancel'],
                        msg: Common.Utils.String.format(this.txtSecurityWarningLink, sURI || ''),
                        callback: _.bind(function(btn){
                            if (btn == 'ok' && window.event && window.event.ctrlKey == true) {
                                onAllow();
                            }
                            else
                                onCancel();
                        }, this)
                    };

                if (!Common.Utils.ModalWindow.isVisible() || $('.asc-window.modal.alert[data-value=' + id + ']').length<1)
                    Common.UI.alert(config).$window.attr('data-value', id);
            },

            onOpenFilePdfForm: function(onAllow, onCancel) {
                var id = 'pdf-form',
                    config = {
                        closable: true,
                        title: this.notcriticalErrorTitle,
                        iconCls: 'warn',
                        buttons: ['ok', 'cancel'],
                        msg: this.txtSecurityWarningOpenFile,
                        callback: _.bind(function(btn){
                            if (btn == 'ok') {
                                onAllow();
                            }
                            else
                                onCancel();
                        }, this)
                };

                if (!Common.Utils.ModalWindow.isVisible() || $('.asc-window.modal.alert[data-value=' + id + ']').length<1)
                    Common.UI.alert(config).$window.attr('data-value', id);
            },

            onValidateErrorPdfForm: function(oInfo) {
                var id = 'pdf-validate-error',
                    config = {
                        closable: true,
                        title: this.notcriticalErrorTitle,
                        iconCls: 'warn',
                        buttons: ['ok']
                    };

                if (oInfo["greater"] != null && oInfo["less"] != null) {
                    config.msg = Common.Utils.String.format(this.txtInvalidGreaterLess, oInfo["target"]["api"]["name"], oInfo["greater"], oInfo["less"]);
                }
                else if (oInfo["greater"] != null) {
                    config.msg = Common.Utils.String.format(this.txtInvalidGreater, oInfo["target"]["api"]["name"], oInfo["greater"]);
                }
                else if (oInfo["less"] != null) {
                    config.msg = Common.Utils.String.format(this.txtInvalidLess, oInfo["target"]["api"]["name"], oInfo["less"]);
                }

                if (!Common.Utils.ModalWindow.isVisible() || $('.asc-window.modal.alert[data-value=' + id + ']').length<1)
                    Common.UI.alert(config).$window.attr('data-value', id);
            },

            onFormatErrorPdfForm: function(oInfo) {
                var id = 'pdf-format-error',
                    config = {
                        closable: true,
                        title: this.notcriticalErrorTitle,
                        iconCls: 'warn',
                        buttons: ['ok']
                    };

                config.msg = Common.Utils.String.format(this.txtInvalidPdfFormat, oInfo["target"]["api"]["name"]);
                if (oInfo["format"])
                    config.msg += '<br>' + Common.Utils.String.format(this.txtValidPdfFormat, oInfo["format"]);

                if (!Common.Utils.ModalWindow.isVisible() || $('.asc-window.modal.alert[data-value=' + id + ']').length<1)
                    Common.UI.alert(config).$window.attr('data-value', id);
            },

            onCoAuthoringDisconnect: function() {
                this.getApplication().getController('Viewport').getView('Viewport').setMode({isDisconnected:true});
                appHeader.setCanRename(false);
                this.appOptions.canRename = false;
                this._state.isDisconnected = true;
            },

            showTips: function(strings, options) {
                var me = this;
                if (!strings.length) return;
                if (typeof(strings)!='object') strings = [strings];

                function closeTip(cmp){
                    me.tipTimeout && clearTimeout(me.tipTimeout);
                    setTimeout(showNextTip, 300);
                }

                function showNextTip() {
                    var str_tip = strings.shift();
                    if (str_tip) {
                        if (!(options && options.hideCloseTip))
                            str_tip += '\n' + me.textCloseTip;
                        me.tooltip.setTitle(str_tip);
                        me.tooltip.show();
                        me.tipTimeout && clearTimeout(me.tipTimeout);
                        if (options && options.timeout) {
                            me.tipTimeout = setTimeout(function () {
                                me.tooltip.hide();
                                closeTip();
                            }, options.timeout);
                        }
                    }
                }

                if (!this.tooltip) {
                    this.tooltip = new Common.UI.Tooltip({
                        owner: this.getApplication().getController('Toolbar').getView(),
                        hideonclick: true,
                        placement: 'bottom',
                        cls: 'main-info',
                        offset: 30
                    });
                    this.tooltip.on('tooltip:hideonclick',closeTip);
                }

                showNextTip();
            },

            updateWindowTitle: function(force) {
                var isModified = this.api.isDocumentModified();
                if (this._state.isDocModified !== isModified || force) {
                    var title = this.defaultTitleText;

                    if (appHeader && !_.isEmpty(appHeader.getDocumentCaption()))
                        title = appHeader.getDocumentCaption() + ' - ' + title;

                    if (isModified) {
                        clearTimeout(this._state.timerCaption);
                        if (!_.isUndefined(title)) {
                            title = '* ' + title;
                        }
                    }

                    if (window.document.title != title)
                        window.document.title = title;

                    this._isDocReady && (this._state.isDocModified !== isModified) && Common.Gateway.setDocumentModified(isModified);
                    if (isModified && (!this._state.fastCoauth || this._state.usersCount<2))
                        this.getApplication().getController('Statusbar').setStatusCaption('', true);

                    this._state.isDocModified = isModified;
                }
            },

            onDocumentModifiedChanged: function() {
                var isModified = this.api.asc_isDocumentCanSave();
                if (this._state.isDocModified !== isModified) {
                    this._isDocReady && Common.Gateway.setDocumentModified(this.api.isDocumentModified());
                }

                this.updateWindowTitle();

                var toolbarView = this.getApplication().getController('Toolbar').getView();
                if (toolbarView && toolbarView.btnCollabChanges && !toolbarView._state.previewmode) {
                    var isSyncButton = toolbarView.btnCollabChanges.cmpEl.hasClass('notify'),
                        forcesave = this.appOptions.forcesave,
                        isDisabled = !isModified && !isSyncButton && !forcesave || this._state.isDisconnected || this._state.fastCoauth && this._state.usersCount>1 && !forcesave || !this.appOptions.isPDFEdit && !this.appOptions.isPDFAnnotate;
                        toolbarView.btnSave.setDisabled(isDisabled);
                }

                /** coauthoring begin **/
                if (this.contComments.isDummyComment && !this.dontCloseDummyComment && !this.beforeShowDummyComment) {
                    this.contComments.clearDummyComment();
                }
                /** coauthoring end **/
            },

            onDocumentCanSaveChanged: function (isCanSave) {
                var toolbarView = this.getApplication().getController('Toolbar').getView();

                if (toolbarView && this.api && !toolbarView._state.previewmode) {
                    var isSyncButton = toolbarView.btnCollabChanges.cmpEl.hasClass('notify'),
                        forcesave = this.appOptions.forcesave,
                        isDisabled = !isCanSave && !isSyncButton && !forcesave || this._state.isDisconnected || this._state.fastCoauth && this._state.usersCount>1 && !forcesave || !this.appOptions.isPDFEdit && !this.appOptions.isPDFAnnotate;
                        toolbarView.btnSave.setDisabled(isDisabled);
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
                    this._state.unloadTimer = 1000;
                    this.continueSavingTimer = window.setTimeout(function() {
                        me.api.asc_continueSaving();
                        me._state.unloadTimer = 0;
                    }, 500);

                    return this.leavePageText;
                } else
                    this._state.unloadTimer = 10000;
            },

            onUnload: function() {
                if (this.continueSavingTimer) clearTimeout(this.continueSavingTimer);
            },

            hidePreloader: function() {
                var promise;
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
                        Common.UI.LayoutManager.applyCustomization();
                        if (this.appOptions.customization && (typeof (this.appOptions.customization) == 'object')) {
                            if (this.appOptions.customization.leftMenu!==undefined)
                                console.log("Obsolete: The 'leftMenu' parameter of the 'customization' section is deprecated. Please use 'leftMenu' parameter in the 'customization.layout' section instead.");
                            if (this.appOptions.customization.statusBar!==undefined)
                                console.log("Obsolete: The 'statusBar' parameter of the 'customization' section is deprecated. Please use 'statusBar' parameter in the 'customization.layout' section instead.");
                            if (this.appOptions.customization.toolbar!==undefined)
                                console.log("Obsolete: The 'toolbar' parameter of the 'customization' section is deprecated. Please use 'toolbar' parameter in the 'customization.layout' section instead.");
                        }
                        promise = this.getApplication().getController('Common.Controllers.Plugins').applyUICustomization();
                    }
                }
                Common.NotificationCenter.trigger('layout:changed', 'main');

                (promise || (new Promise(function(resolve, reject) {
                    resolve();
                }))).then(function() {
                    $('#loading-mask').hide().remove();
                    Common.Controllers.Desktop.process('preloader:hide');
                });
            },

            onDownloadUrl: function(url, fileType) {
                if (this._state.isFromGatewayDownloadAs) {
                    Common.Gateway.downloadAs(url, fileType);
                }
                this._state.isFromGatewayDownloadAs = false;
            },

            onUpdateVersion: function(callback) {
                var me = this;
                me.needToUpdateVersion = true;
                me.onLongActionEnd(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);
                Common.UI.warning({
                    title: me.titleUpdateVersion,
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

                const cur_version = this.getApplication().getController('LeftMenu').leftMenu.getMenu('about').txtVersionNum;
                const cropped_version = cur_version.match(/^(\d+.\d+.\d+)/);
                if (!window.compareVersions && (!cropped_version || cropped_version[1] !== buildVersion)) {
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
//            fillUserStore: function(users){
//                if (!_.isEmpty(users)){
//                    var userStore = this.getCommonStoreUsersStore();
//
//                    if (userStore)
//                        userStore.add(users);
//                }
//            },

            onCollaborativeChanges: function() {
                if (this._state.hasCollaborativeChanges) return;
                this._state.hasCollaborativeChanges = true;
                if (this.appOptions.isEdit)
                    this.getApplication().getController('Statusbar').setStatusCaption(this.txtNeedSynchronize, true);
            },
            /** coauthoring end **/

            synchronizeChanges: function() {
                this.getApplication().getController('Statusbar').synchronizeChanges();
                this.getApplication().getController('DocumentHolder').hideTips();
                this.getApplication().getController('Toolbar').getView().synchronizeChanges();
                this._state.hasCollaborativeChanges = false;
            },

            unitsChanged: function(m) {
                var value = Common.localStorage.getItem("pdfe-settings-unit");
                value = (value!==null) ? parseInt(value) : Common.Utils.Metric.getDefaultMetric();
                Common.Utils.Metric.setCurrentMetric(value);
                Common.Utils.InternalSettings.set("pdfe-settings-unit", value);
                this.api.asc_SetDocumentUnits((value==Common.Utils.Metric.c_MetricUnits.inch) ? Asc.c_oAscDocumentUnits.Inch : ((value==Common.Utils.Metric.c_MetricUnits.pt) ? Asc.c_oAscDocumentUnits.Point : Asc.c_oAscDocumentUnits.Millimeter));
                this.getApplication().getController('Toolbar').getView().updateMetricUnit();
                this.appOptions.canPreviewPrint && this.getApplication().getController('Print').getView('PrintWithPreview').updateMetricUnit();
            },

            onAdvancedOptions: function(type, advOptions, mode, formatOptions) {
                if (this._state.openDlg) return;

                var me = this;
                if (type == Asc.c_oAscAdvancedOptionsID.DRM) {
                    me._state.openDlg = new Common.Views.OpenDialog({
                        title: Common.Views.OpenDialog.prototype.txtTitleProtected,
                        closeFile: me.appOptions.canRequestClose,
                        type: Common.Utils.importTextType.DRM,
                        warning: !(me.appOptions.isDesktopApp && me.appOptions.isOffline) && (typeof advOptions == 'string'),
                        warningMsg: advOptions,
                        validatePwd: !!me._state.isDRM,
                        handler: function (result, value) {
                            me.isShowOpenDialog = false;
                            if (result == 'ok') {
                                if (me.api) {
                                    me.api.asc_setAdvancedOptions(type, value.drmOptions);
                                    me.loadMask && me.loadMask.show();
                                }
                            } else {
                                Common.Gateway.requestClose();
                                Common.Controllers.Desktop.requestClose();
                            }
                            me._state.openDlg = null;
                        }
                    });
                    me._state.isDRM = true;
                }
                if (me._state.openDlg) {
                    this.isShowOpenDialog = true;
                    this.loadMask && this.loadMask.hide();
                    this.onLongActionEnd(Asc.c_oAscAsyncActionType.BlockInteraction, LoadingDocument);
                    me._state.openDlg.show();
                }
            },

            onTryUndoInFastCollaborative: function() {
                if (!Common.localStorage.getBool("pdfe-hide-try-undoredo"))
                    Common.UI.info({
                        width: 500,
                        msg: this.appOptions.canChangeCoAuthoring ? this.textTryUndoRedo : this.textTryUndoRedoWarn,
                        iconCls: 'info',
                        buttons: this.appOptions.canChangeCoAuthoring ? ['custom', 'cancel'] : ['ok'],
                        primary: this.appOptions.canChangeCoAuthoring ? 'custom' : 'ok',
                        customButtonText: this.textStrict,
                        dontshow: true,
                        callback: _.bind(function(btn, dontshow){
                            if (dontshow) Common.localStorage.setItem("pdfe-hide-try-undoredo", 1);
                            if (btn == 'custom') {
                                Common.localStorage.setItem("pdfe-settings-coauthmode", 0);
                                Common.Utils.InternalSettings.set("pdfe-settings-coauthmode", false);
                                this.api.asc_SetFastCollaborative(false);
                                this._state.fastCoauth = false;
                                Common.localStorage.setItem("pdfe-settings-showchanges-strict", 'last');
                                this.api.SetCollaborativeMarksShowType(Asc.c_oAscCollaborativeMarksShowType.LastChanges);
                                // this.getApplication().getController('Common.Controllers.ReviewChanges').applySettings();
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

            onUserConnection: function(change){
                if (change && this.appOptions.user.guest && this.appOptions.canRenameAnonymous && (change.asc_getIdOriginal() == this.appOptions.user.id)) { // change name of the current user
                    var name = change.asc_getUserName();
                    if (name && name !== AscCommon.UserInfoParser.getCurrentName() ) {
                        this._renameDialog && this._renameDialog.close();
                        AscCommon.UserInfoParser.setCurrentName(name);
                        appHeader.setUserName(AscCommon.UserInfoParser.getParsedName(name));

                        var idx1 = name.lastIndexOf('('),
                            idx2 = name.lastIndexOf(')'),
                            str = (idx1>0) && (idx1<idx2) ? name.substring(0, idx1-1) : '';
                        if (Common.localStorage.getItem("guest-username")!==null) {
                            Common.localStorage.setItem("guest-username", str);
                        }
                        Common.Utils.InternalSettings.set("guest-username", str);
                    }
                }
            },

            applySettings: function() {
                if (this.appOptions.isPDFAnnotate || this.appOptions.isPDFEdit) {
                    if (this.appOptions.isEdit && !this.appOptions.isOffline && this.appOptions.canCoAuthoring) {
                        var oldval = this._state.fastCoauth;
                        this._state.fastCoauth = Common.localStorage.getBool("pdfe-settings-coauthmode", true);
                        if (this._state.fastCoauth && !oldval)
                            this.synchronizeChanges();
                    }
                    if (this.appOptions.canForcesave) {
                        this.appOptions.forcesave = Common.localStorage.getBool("pdfe-settings-forcesave", this.appOptions.canForcesave);
                        Common.Utils.InternalSettings.set("pdfe-settings-forcesave", this.appOptions.forcesave);
                        this.api.asc_setIsForceSaveOnUserSave(this.appOptions.forcesave);
                    }
                }
            },

            onDocumentName: function(name) {
                appHeader.setDocumentCaption(name);
                this.updateWindowTitle(true);
            },

            onMeta: function(meta) {
                appHeader.setDocumentCaption(meta.title);
                this.updateWindowTitle(true);
                this.document.title = meta.title;

                var filemenu = this.getApplication().getController('LeftMenu').getView('LeftMenu').getMenu('file');
                filemenu.loadDocument({doc:this.document});
                filemenu.panels && filemenu.panels['info'] && filemenu.panels['info'].updateInfo(this.document);
                Common.Gateway.metaChange(meta);

                if (this.appOptions.wopi) {
                    var idx = meta.title.lastIndexOf('.');
                    Common.Gateway.requestRename(idx>0 ? meta.title.substring(0, idx) : meta.title);
                }
            },

            onPrint: function() {
                if (!this.appOptions.canPrint || Common.Utils.ModalWindow.isVisible()) return;
                Common.NotificationCenter.trigger('file:print');
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
                        try {
                        me.iframePrint.contentWindow.focus();
                        me.iframePrint.contentWindow.print();
                        me.iframePrint.contentWindow.blur();
                        window.focus();
                        } catch (e) {
                            me.api.asc_DownloadAs(new Asc.asc_CDownloadOptions(Asc.c_oAscFileType.PDF));
                        }
                    };
                }
                if (url) this.iframePrint.src = url;
            },

            onPrintQuick: function() {
                if (!this.appOptions.canQuickPrint) return;

                var value = Common.localStorage.getBool("pdfe-hide-quick-print-warning"),
                    me = this,
                    handler = function () {
                        var printopt = new Asc.asc_CAdjustPrint();
                        printopt.asc_setNativeOptions({quickPrint: true});
                        var opts = new Asc.asc_CDownloadOptions();
                        opts.asc_setAdvancedOptions(printopt);
                        me.api.asc_Print(opts);
                        Common.component.Analytics.trackEvent('Print');
                    };

                if (value) {
                    handler.call(this);
                } else {
                    Common.UI.warning({
                        msg: this.textTryQuickPrint,
                        buttons: ['yes', 'no'],
                        primary: 'yes',
                        dontshow: true,
                        maxwidth: 500,
                        callback: function(btn, dontshow){
                            dontshow && Common.localStorage.setBool("pdfe-hide-quick-print-warning", true);
                            if (btn === 'yes') {
                                setTimeout(handler, 1);
                            }
                        }
                    });
                }
            },

            onClearDummyComment: function() {
                this.dontCloseDummyComment = false;
            },

            onShowDummyComment: function() {
                this.beforeShowDummyComment = true;
            },

            warningDocumentIsLocked: function() {
                var me = this;
                var _disable_ui = function (disable) {
                    me.disableEditing(disable, true);
                };

                Common.Utils.warningDocumentIsLocked({disablefunc: _disable_ui});
            },

            showRenameUserDialog: function() {
                if (this._renameDialog) return;

                var me = this;
                this._renameDialog = new Common.Views.UserNameDialog({
                    label: this.textRenameLabel,
                    error: this.textRenameError,
                    value: Common.Utils.InternalSettings.get("guest-username") || '',
                    check: Common.Utils.InternalSettings.get("save-guest-username") || false,
                    validation: function(value) {
                        return value.length<128 ? true : me.textLongName;
                    },
                    handler: function(result, settings) {
                        if (result == 'ok') {
                            var name = settings.input ? settings.input + ' (' + me.appOptions.guestName + ')' : me.textAnonymous;
                            var _user = new Asc.asc_CUserInfo();
                            _user.put_FullName(name);

                            var docInfo = new Asc.asc_CDocInfo();
                            docInfo.put_UserInfo(_user);
                            me.api.asc_changeDocInfo(docInfo);

                            settings.checkbox ? Common.localStorage.setItem("guest-username", settings.input) : Common.localStorage.removeItem("guest-username");
                            Common.Utils.InternalSettings.set("guest-username", settings.input);
                            Common.Utils.InternalSettings.set("save-guest-username", settings.checkbox);
                        }
                    }
                });
                this._renameDialog.on('close', function() {
                    me._renameDialog = undefined;
                });
                this._renameDialog.show(Common.Utils.innerWidth() - this._renameDialog.options.width - 15, 30);
            },

            onGrabFocus: function() {
                this.getApplication().getController('DocumentHolder').getView().focus();
            },

            onLanguageLoaded: function() {
                if (!Common.Locale.getCurrentLanguage()) {
                    Common.UI.warning({
                        msg: this.errorLang,
                        buttons: [],
                        closable: false
                    });
                    return false;
                }
                return true;
            },

            onConfirmAction: function(id, apiCallback, data) {
                var me = this;
                if (id == Asc.c_oAscConfirm.ConfirmMaxChangesSize) {
                    Common.UI.warning({
                        title: this.notcriticalErrorTitle,
                        msg: this.confirmMaxChangesSize,
                        buttons: [{value: 'ok', caption: this.textUndo, primary: true}, {value: 'cancel', caption: this.textContinue}],
                        maxwidth: 600,
                        callback: _.bind(function(btn) {
                            if (apiCallback)  {
                                apiCallback(btn === 'ok');
                            }
                            me.onEditComplete();
                        }, this)
                    });
                }
            },

            leavePageText: 'You have unsaved changes in this document. Click \'Stay on this Page\' then \'Save\' to save them. Click \'Leave this Page\' to discard all the unsaved changes.',
            criticalErrorTitle: 'Error',
            notcriticalErrorTitle: 'Warning',
            errorDefaultMessage: 'Error code: %1',
            criticalErrorExtText: 'Press "OK" to back to document list.',
            openTitleText: 'Opening Document',
            openTextText: 'Opening document...',
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
            txtNeedSynchronize: 'You have an updates',
            textLoadingDocument: 'Loading document',
            warnBrowserZoom: 'Your browser\'s current zoom setting is not fully supported. Please reset to the default zoom by pressing Ctrl+0.',
            warnBrowserIE9: 'The application has low capabilities on IE9. Use IE10 or higher',
            applyChangesTitleText: 'Loading Data',
            applyChangesTextText: 'Loading data...',
            errorKeyEncrypt: 'Unknown key descriptor',
            errorKeyExpire: 'Key descriptor expired',
            errorUsersExceed: 'Count of users was exceed',
            errorCoAuthoringDisconnect: 'Server connection lost. You can\'t edit anymore.',
            errorFilePassProtect: 'The file is password protected and cannot be opened.',
            txtEditingMode: 'Set editing mode...',
            textAnonymous: 'Anonymous',
            loadingDocumentTitleText: 'Loading document',
            loadingDocumentTextText: 'Loading document...',
            warnProcessRightsChange: 'You have been denied the right to edit the file.',
            errorProcessSaveResult: 'Saving is failed.',
            textCloseTip: 'Click to close the tip.',
            titleUpdateVersion: 'Version changed',
            errorUpdateVersion: 'The file version has been changed. The page will be reloaded.',
            errorUserDrop: 'The file cannot be accessed right now.',
            errorConnectToServer: 'The document could not be saved. Please check connection settings or contact your administrator.<br>When you click the \'OK\' button, you will be prompted to download the document.',
            textTryUndoRedo: 'The Undo/Redo functions are disabled for the Fast co-editing mode.<br>Click the \'Strict mode\' button to switch to the Strict co-editing mode to edit the file without other users interference and send your changes only after you save them. You can switch between the co-editing modes using the editor Advanced settings.',
            textStrict: 'Strict mode',
            textBuyNow: 'Visit website',
            textNoLicenseTitle: 'License limit reached',
            textContactUs: 'Contact sales',
            errorViewerDisconnect: 'Connection is lost. You can still view the document,<br>but will not be able to download or print until the connection is restored and page is reloaded.',
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
            textChangesSaved: 'All changes saved',
            errorBadImageUrl: 'Image url is incorrect',
            saveTextText: 'Saving document...',
            saveTitleText: 'Saving Document',
            errorForceSave: "An error occurred while saving the file. Please use the 'Download as' option to save the file to your computer hard drive or try again later.",
            warnNoLicense: "You've reached the limit for simultaneous connections to %1 editors. This document will be opened for viewing only.<br>Contact %1 sales team for personal upgrade terms.",
            warnNoLicenseUsers: "You've reached the user limit for %1 editors. Contact %1 sales team for personal upgrade terms.",
            warnLicenseExceeded: "You've reached the limit for simultaneous connections to %1 editors. This document will be opened for viewing only.<br>Contact your administrator to learn more.",
            warnLicenseUsersExceeded: "You've reached the user limit for %1 editors. Contact your administrator to learn more.",
            errorDataEncrypted: 'Encrypted changes have been received, they cannot be deciphered.',
            textClose: 'Close',
            textPaidFeature: 'Paid feature',
            scriptLoadError: 'The connection is too slow, some of the components could not be loaded. Please reload the page.',
            errorEditingSaveas: 'An error occurred during the work with the document.<br>Use the \'Save as...\' option to save the file backup copy to your computer hard drive.',
            errorEditingDownloadas: 'An error occurred during the work with the document.<br>Use the \'Download as...\' option to save the file backup copy to your computer hard drive.',
            textCustomLoader: 'Please note that according to the terms of the license you are not entitled to change the loader.<br>Please contact our Sales Department to get a quote.',
            waitText: 'Please, wait...',
            errorFileSizeExceed: 'The file size exceeds the limitation set for your server.<br>Please contact your Document Server administrator for details.',
            uploadDocSizeMessage: 'Maximum document size limit exceeded.',
            uploadDocExtMessage: 'Unknown document format.',
            uploadDocFileCountMessage: 'No documents uploaded.',
            errorUpdateVersionOnDisconnect: 'Internet connection has been restored, and the file version has been changed.<br>Before you can continue working, you need to download the file or copy its content to make sure nothing is lost, and then reload this page.',
            errorDirectUrl: 'Please verify the link to the document.<br>This link must be a direct link to the file for downloading.',
            warnLicenseLimitedRenewed: 'License needs to be renewed.<br>You have a limited access to document editing functionality.<br>Please contact your administrator to get full access',
            warnLicenseLimitedNoAccess: 'License expired.<br>You have no access to document editing functionality.<br>Please contact your administrator.',
            saveErrorTextDesktop: 'This file cannot be saved or created.<br>Possible reasons are: <br>1. The file is read-only. <br>2. The file is being edited by other users. <br>3. The disk is full or corrupted.',
            errorSetPassword: 'Password could not be set.',
            textRenameLabel: 'Enter a name to be used for collaboration',
            textRenameError: 'User name must not be empty.',
            textLongName: 'Enter a name that is less than 128 characters.',
            textGuest: 'Guest',
            txtClickToLoad: 'Click to load image',
            leavePageTextOnClose: 'All unsaved changes in this document will be lost.<br> Click \'Cancel\' then \'Save\' to save them. Click \'OK\' to discard all the unsaved changes.',
            textTryUndoRedoWarn: 'The Undo/Redo functions are disabled for the Fast co-editing mode.',
            textDisconnect: 'Connection is lost',
            textReconnect: 'Connection is restored',
            errorLang: 'The interface language is not loaded.<br>Please contact your Document Server administrator.',
            errorLoadingFont: 'Fonts are not loaded.<br>Please contact your Document Server administrator.',
            errorPasswordIsNotCorrect: 'The password you supplied is not correct.<br>Verify that the CAPS LOCK key is off and be sure to use the correct capitalization.',
            confirmMaxChangesSize: 'The size of actions exceeds the limitation set for your server.<br>Press "Undo" to cancel your last action or press "Continue" to keep action locally (you need to download the file or copy its content to make sure nothing is lost).',
            textUndo: 'Undo',
            textContinue: 'Continue',
            errorInconsistentExtDocx: 'An error has occurred while opening the file.<br>The file content corresponds to text documents (e.g. docx), but the file has the inconsistent extension: %1.',
            errorInconsistentExtXlsx: 'An error has occurred while opening the file.<br>The file content corresponds to spreadsheets (e.g. xlsx), but the file has the inconsistent extension: %1.',
            errorInconsistentExtPptx: 'An error has occurred while opening the file.<br>The file content corresponds to presentations (e.g. pptx), but the file has the inconsistent extension: %1.',
            errorInconsistentExtPdf: 'An error has occurred while opening the file.<br>The file content corresponds to one of the following formats: pdf/djvu/xps/oxps, but the file has the inconsistent extension: %1.',
            errorInconsistentExt: 'An error has occurred while opening the file.<br>The file content does not match the file extension.',
            errorCannotPasteImg: 'We can\'t paste this image from the Clipboard, but you can save it to your device and \ninsert it from there, or you can copy the image without text and paste it into the document.',
            textTryQuickPrint: 'You have selected Quick print: the entire document will be printed on the last selected or default printer.<br>Do you want to continue?',
            textAnyone: 'Anyone',
            textText: 'Text',
            warnLicenseBefore: 'License not active.<br>Please contact your administrator.',
            titleLicenseNotActive: 'License not active',
            warnLicenseAnonymous: 'Access denied for anonymous users. This document will be opened for viewing only.',
            txtSecurityWarningLink: 'This document is trying to connect to {0}.<br>If you trust this site, press "OK" while holding down the ctrl key.',
            txtSecurityWarningOpenFile: 'This document is trying to open file dialog, press "OK" to open.',
            txtInvalidGreaterLess: 'Ivalid value for field "{0}": must be greater than or equal to {1} and less then or equal to {2}.',
            txtInvalidGreater: 'Ivalid value for field "{0}": must be greater than or equal to {1}.',
            txtInvalidLess: 'Ivalid value for field "{0}": must be less than or equal to {1}.',
            txtInvalidPdfFormat: 'The value entered does not match the format of the field "{0}".',
            txtValidPdfFormat: 'Field value should match format "{0}".',
            txtChoose: 'Choose an item',
            txtEnterDate: 'Enter a date'
        }
    })(), PDFE.Controllers.Main || {}))
});