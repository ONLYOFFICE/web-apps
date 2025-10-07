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
 *  Main.js
 *
 *  Main controller
 *
 *  Created on 11/07/24
 *
 */

define([
    'core',
    'irregularstack',
    'common/main/lib/component/Window',
    'common/main/lib/component/LoadMask',
    'common/main/lib/component/Tooltip',
    'common/main/lib/util/LocalStorage',
    'common/main/lib/controller/FocusManager',
    'common/main/lib/controller/LaunchController',
    'common/main/lib/controller/HintManager',
    'common/main/lib/controller/LayoutManager',
    'common/main/lib/controller/ExternalUsers',
    'common/main/lib/view/OpenDialog',
    'common/main/lib/view/UserNameDialog'
], function () {
    'use strict';

    VE.Controllers.Main = Backbone.Controller.extend(_.extend((function() {
        var appHeader;
        var ApplyEditRights = -255;
        var LoadingDocument = -256;

        var mapCustomizationElements = {
            about: 'button#left-btn-about',
            feedback: 'button#left-btn-support'
        };

        var mapCustomizationExtElements = {
            toolbar: '#viewport #toolbar',
            leftMenu: '#viewport #left-menu, #viewport #id-toolbar-full-placeholder-btn-settings, #viewport #id-toolbar-short-placeholder-btn-settings',
            statusBar: '#statusbar'
        };

        Common.localStorage.setId('visio');
        Common.localStorage.setKeysFilter('ve-,asc.visio');
        Common.localStorage.sync();

        return {

            models: [],
            collections: [
            ],
            views: [],

            initialize: function() {
                this.addListeners({
                    'FileMenu': {
                        'settings:apply': _.bind(this.applySettings, this)
                    }
                });

                this.translationTable = {
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

                this._state = {isDisconnected: false, usersCount: 1, fastCoauth: true, lostEditingRights: false, licenseType: false, isDocModified: false, requireUserAction: true};
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
                Common.Controllers.LaunchController.init(this.api);

                if (this.api){
                    this.api.SetDrawingFreeze(true);

                    var value = Common.localStorage.getBool("ve-settings-cachemode", true);
                    Common.Utils.InternalSettings.set("ve-settings-cachemode", value);
                    this.api.asc_setDefaultBlitMode(!!value);

                    value = Common.localStorage.getItem("ve-settings-fontrender");
                    if (value === null)
                        value = '0';
                    Common.Utils.InternalSettings.set("ve-settings-fontrender", value);
                    switch (value) {
                        case '0': this.api.SetFontRenderingMode(3); break;
                        case '1': this.api.SetFontRenderingMode(1); break;
                        case '2': this.api.SetFontRenderingMode(2); break;
                    }

                    value = Common.localStorage.getBool("app-settings-screen-reader");
                    Common.Utils.InternalSettings.set("app-settings-screen-reader", value);
                    this.api.setSpeechEnabled(value);

                    if ( !Common.Utils.isIE ) {
                        if ( /^https?:\/\//.test('{{HELP_CENTER_WEB_VE}}') ) {
                            const _url_obj = new URL('{{HELP_CENTER_WEB_VE}}');
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

                    Common.NotificationCenter.on('api:disconnect',                  _.bind(this.onCoAuthoringDisconnect, this));
                    Common.NotificationCenter.on('goback',                          _.bind(this.goBack, this));
                    Common.NotificationCenter.on('suggest',                         _.bind(this.onSuggest, this));
                    Common.NotificationCenter.on('close',                           _.bind(this.closeEditor, this));
                    Common.NotificationCenter.on('markfavorite',                    _.bind(this.markFavorite, this));
                    Common.NotificationCenter.on('download:advanced',               _.bind(this.onAdvancedOptions, this));
                    Common.NotificationCenter.on('showmessage',                     _.bind(this.onExternalMessage, this));
                    Common.NotificationCenter.on('showerror',                       _.bind(this.onError, this));
                    Common.NotificationCenter.on('editing:disable',                 _.bind(this.onEditingDisable, this));

                    this.isShowOpenDialog = false;
                    
                    // Initialize api gateway
                    this.editorConfig = {};
                    this.appOptions = {};
                    Common.Gateway.on('init',           _.bind(this.loadConfig, this));
                    Common.Gateway.on('showmessage',    _.bind(this.onExternalMessage, this));
                    Common.Gateway.on('opendocument',   _.bind(this.loadDocument, this));
                    Common.Gateway.on('opendocumentfrombinary', _.bind(this.loadBinary, this));
                    Common.Gateway.on('grabfocus',      _.bind(this.onGrabFocus, this));
                    Common.Gateway.appReady();

                    this.getApplication().getController('Viewport').setApi(this.api);
                    this.getApplication().getController('Statusbar').setApi(this.api);

                        // Syncronize focus with api
                    $(document.body).on('focus', 'input, textarea', function(e) {
                        if (!/area_id/.test(e.target.id)) {
                            if (/msg-reply/.test(e.target.className)) {
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
                                if (/textarea-control/.test(e.target.className))
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
                            'command+s,ctrl+s,command+p,ctrl+p,command+d,ctrl+d': _.bind(function (e) {
                                e.preventDefault();
                                e.stopPropagation();
                            }, this)
                        }
                    });
                }

                me.defaultTitleText = '{{APP_TITLE_TEXT}}';
                me.warnNoLicense  = (me.warnNoLicense || '').replace(/%1/g, '{{COMPANY_NAME}}');
                me.warnNoLicenseUsers = (me.warnNoLicenseUsers || '').replace(/%1/g, '{{COMPANY_NAME}}');
                me.textNoLicenseTitle = (me.textNoLicenseTitle || '').replace(/%1/g, '{{COMPANY_NAME}}');
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
                this.appOptions.canCreateNew    = this.editorConfig.canRequestCreateNew || /*!_.isEmpty(this.editorConfig.createUrl) ||*/ this.editorConfig.templates && this.editorConfig.templates.length;
                this.appOptions.canOpenRecent   = this.editorConfig.recent !== undefined;
                this.appOptions.templates       = this.editorConfig.templates;
                this.appOptions.recent          = this.editorConfig.recent;
                this.appOptions.createUrl       = this.editorConfig.createUrl;
                this.appOptions.canRequestCreateNew = this.editorConfig.canRequestCreateNew;
                this.appOptions.lang            = this.editorConfig.lang;
                this.appOptions.location        = (typeof (this.editorConfig.location) == 'string') ? this.editorConfig.location.toLowerCase() : '';
                this.appOptions.region          = (typeof (this.editorConfig.region) == 'string') ? this.editorConfig.region.toLowerCase() : this.editorConfig.region;
                this.appOptions.sharingSettingsUrl = this.editorConfig.sharingSettingsUrl;
                this.appOptions.fileChoiceUrl   = this.editorConfig.fileChoiceUrl;
                this.appOptions.saveAsUrl       = this.editorConfig.saveAsUrl;
                this.appOptions.canAnalytics    = false;
                this.appOptions.canPlugins      = false;
                this.appOptions.canMakeActionLink = false;//this.editorConfig.canMakeActionLink;
                this.appOptions.canRequestUsers = this.editorConfig.canRequestUsers;
                this.appOptions.canRequestSendNotify = this.editorConfig.canRequestSendNotify;
                this.appOptions.canRequestSaveAs = this.editorConfig.canRequestSaveAs;
                this.appOptions.canRequestInsertImage = false;//this.editorConfig.canRequestInsertImage;
                this.appOptions.canRequestSharingSettings = this.editorConfig.canRequestSharingSettings;
                this.appOptions.compatibleFeatures = true;
                this.appOptions.mentionShare = !((typeof (this.appOptions.customization) == 'object') && (this.appOptions.customization.mentionShare==false));
                this.appOptions.canSaveDocumentToBinary = this.editorConfig.canSaveDocumentToBinary;
                this.appOptions.user.guest && this.appOptions.canRenameAnonymous && Common.NotificationCenter.on('user:rename', _.bind(this.showRenameUserDialog, this));

                this.appOptions.canRequestClose = this.editorConfig.canRequestClose;
                this.appOptions.canCloseEditor = false;
                this.appOptions.canSwitchToMobile = this.editorConfig.forceDesktop;

                var _canback = false;
                if (typeof this.appOptions.customization === 'object') {
                    if (typeof this.appOptions.customization.goback == 'object' && this.editorConfig.canBackToFolder!==false) {
                        _canback = this.appOptions.customization.close===undefined ?
                            !_.isEmpty(this.editorConfig.customization.goback.url) || this.editorConfig.customization.goback.requestClose && this.appOptions.canRequestClose :
                            !_.isEmpty(this.editorConfig.customization.goback.url) && !this.editorConfig.customization.goback.requestClose;

                        if (this.appOptions.customization.goback.requestClose)
                            console.log("Obsolete: The 'requestClose' parameter of the 'customization.goback' section is deprecated. Please use 'close' parameter in the 'customization' section instead.");
                    }
                    if (this.appOptions.customization.close && typeof this.appOptions.customization.close === 'object')
                        this.appOptions.canCloseEditor  = (this.appOptions.customization.close.visible!==false) && this.appOptions.canRequestClose && !this.appOptions.isDesktopApp;
                }
                this.appOptions.canBack = this.appOptions.canBackToFolder = !!_canback;

                appHeader = this.getApplication().getController('Viewport').getView('Common.Views.Header');
                appHeader.setCanBack(this.appOptions.canBack, this.appOptions.canBack ? this.editorConfig.customization.goback.text : '');

                if (this.editorConfig.lang)
                    this.api.asc_setLocale(this.editorConfig.lang);

                this.loadDefaultMetricSettings();

                this.appOptions.wopi = this.editorConfig.wopi;
                appHeader.setWopi(this.appOptions.wopi);

                if (this.editorConfig.canRequestRefreshFile) {
                    Common.Gateway.on('refreshfile',                                _.bind(this.onRefreshFile, this));
                    this.api.asc_registerCallback('asc_onRequestRefreshFile',       _.bind(this.onRequestRefreshFile, this));
                }

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
                    docInfo.put_SupportsOnSaveDocument(this.editorConfig.canSaveDocumentToBinary);
                    docInfo.put_Wopi(this.editorConfig.wopi);
                    this.editorConfig.shardkey && docInfo.put_Shardkey(this.editorConfig.shardkey);

                    var enable = !this.editorConfig.customization || (this.editorConfig.customization.macros!==false);
                    docInfo.asc_putIsEnabledMacroses(!!enable);
                    enable = !this.editorConfig.customization || (this.editorConfig.customization.plugins!==false);
                    docInfo.asc_putIsEnabledPlugins(!!enable);

                    // var coEditMode = !(this.editorConfig.coEditing && typeof this.editorConfig.coEditing == 'object') ? 'fast' : // fast by default
                    //     this.editorConfig.mode === 'view' && this.editorConfig.coEditing.change!==false ? 'fast' : // if can change mode in viewer - set fast for using live viewer
                    //     this.editorConfig.coEditing.mode || 'fast';
                    var coEditMode = 'strict';
                    docInfo.put_CoEditingMode(coEditMode);
                }

                if (!( this.editorConfig.customization && (this.editorConfig.customization.toolbarNoTabs ||
                    (this.editorConfig.targetApp!=='desktop') && (this.editorConfig.customization.loaderName || this.editorConfig.customization.loaderLogo)))) {
                    $('#editor-container').append('<div class="doc-placeholder"><div class="slide-h"><div class="slide-v"><div class="slide-container"></div></div></div></div>');
                }

                this.api.asc_registerCallback('asc_onGetEditorPermissions', _.bind(this.onEditorPermissions, this));
                this.api.asc_registerCallback('asc_onLicenseChanged',       _.bind(this.onLicenseChanged, this));
                // this.api.asc_registerCallback('asc_onRunAutostartMacroses', _.bind(this.onRunAutostartMacroses, this));
                this.api.asc_setDocInfo(docInfo);
                this.api.asc_getEditorPermissions(this.editorConfig.licenseUrl, this.editorConfig.customerId);

                if (data.doc) {
                    appHeader.setDocumentCaption(data.doc.title);
                }
            },

            onRunAutostartMacroses: function() {
                if (!this.editorConfig.customization || (this.editorConfig.customization.macros!==false)) {
                    this.api.asc_runAutostartMacroses();
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
                    !old_rights && Common.UI.TooltipManager.showTip({ step: 'changeRights', text: _.isEmpty(data.message) ? this.warnProcessRightsChange : data.message,
                        target: '#toolbar', maxwidth: 600, showButton: false, automove: true, noHighlight: true, noArrow: true, multiple: true,
                        callback: function() {
                            me._state.lostEditingRights = false;
                        }});
                }
            },

            onDownloadAs: function(format) {
                if ( !this.appOptions.canDownload && !this.appOptions.canDownloadOrigin) {
                    Common.Gateway.reportError(Asc.c_oAscError.ID.AccessDeny, this.errorAccessDeny);
                    return;
                }

                this._state.isFromGatewayDownloadAs = true;
                var _format = (format && (typeof format == 'string')) ? Asc.c_oAscFileType[ format.toUpperCase() ] : null,
                    _supported = [
                        Asc.c_oAscFileType.VSDX,
                        Asc.c_oAscFileType.PDF,
                        Asc.c_oAscFileType.PDFA,
                        Asc.c_oAscFileType.PNG,
                        Asc.c_oAscFileType.JPG
                    ];

                if ( !_format || _supported.indexOf(_format) < 0 )
                    _format = Asc.c_oAscFileType.VSDX;
                var options = new Asc.asc_CDownloadOptions(_format, true);
                options.asc_setIsSaveAs(true);
                this.api.asc_DownloadAs(options);
            },

            onProcessMouse: function(data) {
                if (data.type == 'mouseup') {
                    var e = document.getElementById('editor_sdk');
                    if (e) {
                        var r = Common.Utils.getBoundingClientRect(e);
                        this.api.OnMouseUp(
                            data.x - r.left,
                            data.y - r.top
                        );
                    }
                }
            },

            disableEditing: function(disable, type) {
                !type && (type = 'disconnect');
                var temp = type==='reconnect' || type==='refresh-file';
                Common.NotificationCenter.trigger('editing:disable', disable, {
                    viewMode: disable,
                    statusBar: true,
                    leftMenu: {disable: true, previewMode: true},
                    fileMenu: {protect: true},
                    chat: true,
                    viewport: true,
                    documentHolder: {clear: !temp, disable: true},
                    toolbar: true,
                    plugins: false,
                    header: {search: type==='not-loaded'},
                    shortcuts: type==='not-loaded'
                }, type || 'disconnect');
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
                    app.getController('Toolbar').DisableToolbar(disable, options.viewMode);
                }
                if (options.documentHolder) {
                    options.documentHolder.clear && app.getController('DocumentHolder').clearSelection();
                    options.documentHolder.disable && app.getController('DocumentHolder').SetDisabled(disable);
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
                if (options.plugins) {
                    app.getController('Common.Controllers.Plugins').getView('Common.Views.Plugins').SetDisabled(disable);
                }
                if (options.header) {
                    if (options.header.search)
                        appHeader && appHeader.lockHeaderBtns('search', disable);
                    appHeader && appHeader.lockHeaderBtns('undo', options.viewMode, Common.enumLock.lostConnect);
                    appHeader && appHeader.lockHeaderBtns('redo', options.viewMode, Common.enumLock.lostConnect);
                }

                if (options.shortcuts) {
                    disable ? Common.util.Shortcuts.suspendEvents() : Common.util.Shortcuts.resumeEvents();
                }

                if (prev_options) {
                    this.onEditingDisable(prev_options.disable, prev_options.options, prev_options.type);
                }
            },

            disableLiveViewing: function(disable) {
                this.appOptions.canLiveView = !disable;
                this.api.asc_SetFastCollaborative(!disable);
                Common.Utils.InternalSettings.set("ve-settings-coauthmode", !disable);
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

            onSuggest: function() {
                window.open('{{SUGGEST_URL}}', "_blank");
            },

            closeEditor: function() {
                this.appOptions.canRequestClose && this.onRequestClose();
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

                application.getController('DocumentHolder').getView().focus();
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

                if ( id == Asc.c_oAscAsyncAction['Disconnect']) {
                    this._state.timerDisconnect && clearTimeout(this._state.timerDisconnect);
                    this.disableEditing(false, 'reconnect');
                    Common.UI.TooltipManager.closeTip('disconnect');
                    this.getApplication().getController('Statusbar').setStatusCaption(this.textReconnect);
                } else if (id === Asc.c_oAscAsyncAction['RefreshFile'])  {
                    this.disableEditing(false, 'refresh-file');
                    Common.UI.TooltipManager.closeTip('refreshFile');
                    this.getApplication().getController('Statusbar').setStatusCaption('');
                }

                if ( type == Asc.c_oAscAsyncActionType.BlockInteraction &&
                    (!this.getApplication().getController('LeftMenu').dlgSearch || !this.getApplication().getController('LeftMenu').dlgSearch.isVisible()) &&
                    (!this.getApplication().getController('Toolbar').dlgSymbolTable || !this.getApplication().getController('Toolbar').dlgSymbolTable.isVisible()) &&
                    !((id == Asc.c_oAscAsyncAction['LoadDocumentFonts'] || id == Asc.c_oAscAsyncAction['LoadFonts'] || id == Asc.c_oAscAsyncAction['ApplyChanges'] || id == Asc.c_oAscAsyncAction['DownloadAs']) && (this.inTextareaControl || Common.Utils.ModalWindow.isVisible() || this.inFormControl)) ) {
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
                        this.disableEditing(true, 'reconnect');
                        var me = this;
                        me._state.timerDisconnect = setTimeout(function(){
                            Common.UI.TooltipManager.showTip('disconnect');
                        }, me._state.unloadTimer || 0);
                        this.getApplication().getController('Statusbar').setStatusCaption(text);
                        return;

                    case Asc.c_oAscAsyncAction['RefreshFile']:
                        title    = this.textUpdating;
                        text    = this.textUpdating;
                        Common.UI.Menu.Manager.hideAll();
                        this.disableEditing(true, 'refresh-file');
                        Common.UI.TooltipManager.showTip('refreshFile');
                        this.getApplication().getController('Statusbar').setStatusCaption(text);
                        return;

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

                value = Common.localStorage.getItem("ve-settings-zoom");
                Common.Utils.InternalSettings.set("ve-settings-zoom", value);
                var zf = (value!==null) ? parseInt(value) : (this.appOptions.customization && this.appOptions.customization.zoom ? parseInt(this.appOptions.customization.zoom) : -1);
                value = Common.localStorage.getItem("ve-last-zoom");
                var lastZoom = (value!==null) ? parseInt(value):0;

                me._isDocReady = true;
                Common.NotificationCenter.trigger('app:ready', this.appOptions);

                me.api.SetDrawingFreeze(false);
                me.hidePreloader();
                me.onLongActionEnd(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);

                if (zf == -1) {
                    this.api.zoomFitToPage();
                } else if (zf == -2) {
                    this.api.zoomFitToWidth();
                } else if (zf == -3) {
                    if (lastZoom > 0) {
                        this.api.zoom(lastZoom);
                    } else if (lastZoom == -1) {
                        this.api.zoomFitToPage();
                    } else if (lastZoom == -2) {
                        this.api.zoomFitToWidth();
                    }
                } else {
                    this.api.zoom(zf > 0 ? zf : 100);
                }


                value = Common.localStorage.getBool("ve-settings-compatible", false);
                Common.Utils.InternalSettings.set("ve-settings-compatible", value);

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

                appHeader.setDocumentCaption(me.api.asc_getDocumentName());
                me.updateWindowTitle(true);

                value = Common.localStorage.getBool("ve-settings-show-alt-hints", Common.Utils.isMac ? false : true);
                Common.Utils.InternalSettings.set("ve-settings-show-alt-hints", value);

                /** coauthoring begin **/
                me.onCoAuthApply();
                /** coauthoring end **/

                var application                 = me.getApplication();
                var toolbarController           = application.getController('Toolbar'),
                    statusbarController         = application.getController('Statusbar'),
                    documentHolderController    = application.getController('DocumentHolder'),
                    leftmenuController          = application.getController('LeftMenu'),
                    chatController              = application.getController('Common.Controllers.Chat'),
                    pluginsController           = application.getController('Common.Controllers.Plugins');


                leftmenuController.getView('LeftMenu').getMenu('file').loadDocument({doc:me.document});
                leftmenuController.createDelayedElements().setApi(me.api);

                chatController.setApi(this.api).setMode(this.appOptions);
                pluginsController.setApi(me.api);

                documentHolderController.setApi(me.api);
                statusbarController.createDelayedElements();

                leftmenuController.getView('LeftMenu').disableMenu('all',false);

                if (me.appOptions.canBranding)
                    me.getApplication().getController('LeftMenu').leftMenu.getMenu('about').setLicInfo(me.editorConfig.customization);

                documentHolderController.getView().on('editcomplete', _.bind(me.onEditComplete, me));

                // VE.getController('Common.Controllers.Shortcuts').setApi(me.api);

                if (me.appOptions.isEdit) {
                    if (me.needToUpdateVersion)
                        Common.NotificationCenter.trigger('api:disconnect');

                    var timer_sl = setTimeout(function(){

                        toolbarController.createDelayedElements();
                        toolbarController.activateControls();
                        documentHolderController.applyEditorMode();
                        if (me.needToUpdateVersion)
                            toolbarController.onApiCoAuthoringDisconnect();
                        toolbarController.onApiFocusObject([]);
                        me.api.UpdateInterfaceState();

                        Common.NotificationCenter.trigger('document:ready', 'main');
                        me.applyLicense();
                    }, 500);
                } else {
                    Common.NotificationCenter.trigger('document:ready', 'main');
                    Common.Utils.injectSvgIcons();
                    me.applyLicense();
                }

                // TODO bug 43960
                var dummyClass = ~~(1e6*Math.random());
                $('.toolbar').prepend(Common.Utils.String.format('<div class="lazy-{0} x-huge"><div class="toolbar__icon" style="position: absolute; width: 1px; height: 1px;"></div>', dummyClass));
                setTimeout(function() { $(Common.Utils.String.format('.toolbar .lazy-{0}', dummyClass)).remove(); }, 10);

                if (this.appOptions.canAnalytics && false)
                    Common.component.Analytics.initialize('UA-12442749-13', 'Visio Editor');

                Common.Gateway.on('applyeditrights',        _.bind(me.onApplyEditRights, me));
                Common.Gateway.on('processrightschange',    _.bind(me.onProcessRightsChange, me));
                Common.Gateway.on('processmouse',           _.bind(me.onProcessMouse, me));
                Common.Gateway.on('downloadas',             _.bind(me.onDownloadAs, me));
                Common.Gateway.on('setfavorite',            _.bind(me.onSetFavorite, me));
                Common.Gateway.on('requestclose',           _.bind(me.onRequestClose, me));
                this.appOptions.canRequestSaveAs && Common.Gateway.on('internalcommand', function(data) {
                    if (data.command == 'wopi:saveAsComplete') {
                        me.onExternalMessage({msg: me.txtSaveCopyAsComplete});
                    }
                });
                Common.Gateway.sendInfo({mode:me.appOptions.isEdit?'edit':'view'});

                if (!!me.appOptions.sharingSettingsUrl && me.appOptions.sharingSettingsUrl.length || me.appOptions.canRequestSharingSettings) {
                    Common.Gateway.on('showsharingsettings', _.bind(me.changeAccessRights, me));
                    Common.Gateway.on('setsharingsettings', _.bind(me.setSharingSettings, me));
                    Common.NotificationCenter.on('collaboration:sharing', _.bind(me.changeAccessRights, me));
                    Common.NotificationCenter.on('collaboration:sharingdeny', _.bind(me.setSharingSettings, me));
                }

                $(document).on('contextmenu', _.bind(me.onContextMenu, me));
                Common.Gateway.documentReady();
                this._state.requireUserAction = false;

                $('.doc-placeholder').remove();

                this.appOptions.user.guest && this.appOptions.canRenameAnonymous && (Common.Utils.InternalSettings.get("guest-username")===null) && this.showRenameUserDialog();
                if (this._needToSaveAsFile) // warning received before document is ready
                    this.getApplication().getController('LeftMenu').leftMenu.showMenu('file:saveas');
            },

            onLicenseChanged: function(params) {
                var licType = params.asc_getLicenseType();
                if (licType !== undefined && (this.appOptions.canEdit || this.appOptions.isRestrictedEdit) && this.editorConfig.mode !== 'view' &&
                    (licType===Asc.c_oLicenseResult.Connections || licType===Asc.c_oLicenseResult.UsersCount || licType===Asc.c_oLicenseResult.ConnectionsOS || licType===Asc.c_oLicenseResult.UsersCountOS
                    || licType===Asc.c_oLicenseResult.SuccessLimit && (this.appOptions.trialMode & Asc.c_oLicenseMode.Limited) !== 0))
                    this._state.licenseType = licType;

                if (licType !== undefined && this.appOptions.canLiveView && (licType===Asc.c_oLicenseResult.ConnectionsLive || licType===Asc.c_oLicenseResult.ConnectionsLiveOS||
                    licType===Asc.c_oLicenseResult.UsersViewCount || licType===Asc.c_oLicenseResult.UsersViewCountOS))
                    this._state.licenseType = licType;

                if (this._isDocReady)
                    this.applyLicense();
            },

            applyLicense: function() {
                if (this.editorConfig.mode === 'view') {
                    if (this.appOptions.canLiveView && (this._state.licenseType===Asc.c_oLicenseResult.ConnectionsLive || this._state.licenseType===Asc.c_oLicenseResult.ConnectionsLiveOS ||
                                                        this._state.licenseType===Asc.c_oLicenseResult.UsersViewCount || this._state.licenseType===Asc.c_oLicenseResult.UsersViewCountOS ||
                                                        !this.appOptions.isAnonymousSupport && !!this.appOptions.user.anonymous)) {
                        // show warning or write to log if Common.Utils.InternalSettings.get("de-settings-coauthmode") was true ???
                        this.disableLiveViewing(true);
                    }
                } else if (!this.appOptions.isAnonymousSupport && !!this.appOptions.user.anonymous) {
                    this.disableEditing(true);
                    this.api.asc_coAuthoringDisconnect();
                    Common.NotificationCenter.trigger('api:disconnect');
                    Common.UI.warning({
                        title: this.notcriticalErrorTitle,
                        msg  : this.warnLicenseAnonymous,
                        buttons: ['ok']
                    });
                } else if (this._state.licenseType) {
                    var license = this._state.licenseType,
                        title = this.textNoLicenseTitle,
                        buttons = ['ok'],
                        primary = 'ok',
                        modal = false;
                    if ((this.appOptions.trialMode & Asc.c_oLicenseMode.Limited) !== 0 &&
                        (license===Asc.c_oLicenseResult.SuccessLimit || this.appOptions.permissionsLicense===Asc.c_oLicenseResult.SuccessLimit)) {
                        license = this.warnLicenseLimitedRenewed;
                    } else if (license===Asc.c_oLicenseResult.Connections || license===Asc.c_oLicenseResult.UsersCount) {
                        title = this.titleReadOnly;
                        license = (license===Asc.c_oLicenseResult.Connections) ? this.tipLicenseExceeded : this.tipLicenseUsersExceeded;
                    } else {
                        license = (license===Asc.c_oLicenseResult.ConnectionsOS) ? this.warnNoLicense : this.warnNoLicenseUsers;
                        buttons = [{value: 'buynow', caption: this.textBuyNow}, {value: 'contact', caption: this.textContactUs}];
                        primary = 'buynow';
                        modal = true;
                    }

                    if (this._state.licenseType!==Asc.c_oLicenseResult.SuccessLimit && (this.appOptions.isEdit || this.appOptions.isRestrictedEdit)) {
                        this.disableEditing(true);
                        this.api.asc_coAuthoringDisconnect();
                        Common.NotificationCenter.trigger('api:disconnect');
                    }

                    Common.UI.info({
                        maxwidth: 500,
                        title: title,
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
                } else if (!this.appOptions.isDesktopApp && !this.appOptions.canBrandingExt &&
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
                    if (this._isDocReady || this._isPermissionsInited) { // receive after refresh file
                        this.disableEditing(true);
                        Common.NotificationCenter.trigger('api:disconnect');
                    }
                    return;
                }

                if ( this.onServerVersion(params.asc_getBuildVersion()) || !this.onLanguageLoaded()) return;
                if ( this._isDocReady || this._isPermissionsInited ) {
                    this.api.asc_LoadDocument();
                    return;
                }

                if (params.asc_getRights() !== Asc.c_oRights.Edit)
                    this.permissions.edit = this.permissions.review = false;

                this.appOptions.permissionsLicense = licType;
                this.appOptions.isOffline      = this.api.asc_isOffline();
                this.appOptions.isCrypted      = this.api.asc_isCrypto();
                this.appOptions.canLicense     = (licType === Asc.c_oLicenseResult.Success || licType === Asc.c_oLicenseResult.SuccessLimit);
                this.appOptions.isLightVersion = params.asc_getIsLight();
                /** coauthoring begin **/
                this.appOptions.canCoAuthoring = !this.appOptions.isLightVersion;
                /** coauthoring end **/
                this.appOptions.canRequestEditRights = this.editorConfig.canRequestEditRights;
                this.appOptions.canEdit        = false;//this.permissions.edit !== false && // can edit
                                                // (this.editorConfig.canRequestEditRights || this.editorConfig.mode !== 'view'); // if mode=="view" -> canRequestEditRights must be defined
                this.appOptions.isEdit         = this.appOptions.canLicense && this.appOptions.canEdit && this.editorConfig.mode !== 'view';
                this.appOptions.canDownload    = this.permissions.download !== false;
                this.appOptions.canAnalytics   = params.asc_getIsAnalyticsEnable();
                this.appOptions.canComments    = false;//this.appOptions.canLicense && (this.permissions.comment===undefined ? this.appOptions.isEdit : this.permissions.comment) && (this.editorConfig.mode !== 'view');
                this.appOptions.canComments    = false;//this.appOptions.canComments && !((typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.comments===false);
                this.appOptions.canViewComments = false;//this.appOptions.canComments || !((typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.comments===false);
                this.appOptions.canChat        = this.appOptions.canLicense && !this.appOptions.isOffline && !(this.permissions.chat===false || (this.permissions.chat===undefined) &&
                                                (typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.chat===false);
                if ((typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.chat!==undefined) {
                    console.log("Obsolete: The 'chat' parameter of the 'customization' section is deprecated. Please use 'chat' parameter in the permissions instead.");
                }
                this.appOptions.canPrint       = (this.permissions.print !== false);
                this.appOptions.canPreviewPrint = false;
                this.appOptions.canQuickPrint = this.appOptions.canPrint && !Common.Utils.isMac && this.appOptions.isDesktopApp;
                this.appOptions.canRename      = this.editorConfig.canRename;
                this.appOptions.canForcesave   = this.appOptions.isEdit && !this.appOptions.isOffline && (typeof (this.editorConfig.customization) == 'object' && !!this.editorConfig.customization.forcesave);
                this.appOptions.forcesave      = this.appOptions.canForcesave;
                this.appOptions.canEditComments= false;//this.appOptions.isOffline || !this.permissions.editCommentAuthorOnly;
                this.appOptions.canDeleteComments= false;//this.appOptions.isOffline || !this.permissions.deleteCommentAuthorOnly;
                if ((typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.commentAuthorOnly===true) {
                    console.log("Obsolete: The 'commentAuthorOnly' parameter of the 'customization' section is deprecated. Please use 'editCommentAuthorOnly' and 'deleteCommentAuthorOnly' parameters in the permissions instead.");
                    if (this.permissions.editCommentAuthorOnly===undefined && this.permissions.deleteCommentAuthorOnly===undefined)
                        this.appOptions.canEditComments = this.appOptions.canDeleteComments = false;//this.appOptions.isOffline;
                }
                this.appOptions.buildVersion   = params.asc_getBuildVersion();
                this.appOptions.trialMode      = params.asc_getLicenseMode();
                this.appOptions.isBeta         = params.asc_getIsBeta();
                this.appOptions.isSignatureSupport= this.appOptions.isEdit && this.appOptions.isDesktopApp && this.appOptions.isOffline && this.api.asc_isSignaturesSupport() && (this.permissions.protect!==false);
                this.appOptions.isPasswordSupport = this.appOptions.isEdit && this.api.asc_isProtectionSupport() && (this.permissions.protect!==false);
                this.appOptions.canProtect     = (this.permissions.protect!==false);
                this.appOptions.canHelp        = !((typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.help===false);
                this.appOptions.isRestrictedEdit = !this.appOptions.isEdit && this.appOptions.canComments;
                this.appOptions.canSaveToFile = this.appOptions.isEdit || this.appOptions.isRestrictedEdit;
                this.appOptions.showSaveButton = this.appOptions.isEdit;
                this.appOptions.canSuggest     = !((typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.suggestFeature===false);

                this.appOptions.compactHeader = this.appOptions.customization && (typeof (this.appOptions.customization) == 'object') && !!this.appOptions.customization.compactHeader;
                this.appOptions.twoLevelHeader = this.appOptions.isEdit; // when compactHeader=true some buttons move to toolbar

                this.appOptions.canUseHistory  = false;//this.appOptions.canLicense && this.editorConfig.canUseHistory && this.appOptions.canCoAuthoring && !this.appOptions.isOffline;
                this.appOptions.canHistoryClose  = this.editorConfig.canHistoryClose;
                this.appOptions.canHistoryRestore= this.editorConfig.canHistoryRestore;

                if ( this.appOptions.isLightVersion ) {
                    this.appOptions.canUseHistory = false;
                }

                this.appOptions.canBrandingExt = params.asc_getCanBranding() && (typeof this.editorConfig.customization == 'object' || this.editorConfig.plugins);
                Common.UI.LayoutManager.init(this.editorConfig.customization ? this.editorConfig.customization.layout : null, this.appOptions.canBrandingExt, this.api);
                this.editorConfig.customization && Common.UI.FeaturesManager.init(this.editorConfig.customization.features, this.appOptions.canBrandingExt);
                Common.UI.TabStyler.init(this.editorConfig.customization); // call after Common.UI.FeaturesManager.init() !!!

                this.appOptions.canBranding  = params.asc_getCustomization();
                if (this.appOptions.canBranding)
                    appHeader.setBranding(this.editorConfig.customization, this.appOptions);

                this.appOptions.canFavorite = this.document.info && (this.document.info.favorite!==undefined && this.document.info.favorite!==null) && !this.appOptions.isOffline;
                this.appOptions.canFavorite && appHeader.setFavorite(this.document.info.favorite);

                this.appOptions.canUseCommentPermissions = this.appOptions.canLicense && !!this.permissions.commentGroups;
                this.appOptions.canUseUserInfoPermissions = this.appOptions.canLicense && !!this.permissions.userInfoGroups;
                AscCommon.UserInfoParser.setParser(true);
                AscCommon.UserInfoParser.setCurrentName(this.appOptions.user.fullname);
                this.appOptions.canUseCommentPermissions && AscCommon.UserInfoParser.setCommentPermissions(this.permissions.commentGroups);
                this.appOptions.canUseUserInfoPermissions && AscCommon.UserInfoParser.setUserInfoPermissions(this.permissions.userInfoGroups);
                appHeader.setUserName(AscCommon.UserInfoParser.getParsedName(AscCommon.UserInfoParser.getCurrentName()));
                appHeader.setUserId(this.appOptions.user.id);
                appHeader.setUserAvatar(this.appOptions.user.image);

                this.appOptions.canRename && appHeader.setCanRename(true);
                this.getApplication().getController('Common.Controllers.Plugins').setMode(this.appOptions);
                Common.UI.ExternalUsers.init(this.appOptions.canRequestUsers, this.api);
                this.appOptions.user.image ? Common.UI.ExternalUsers.setImage(this.appOptions.user.id, this.appOptions.user.image) : Common.UI.ExternalUsers.get('info', this.appOptions.user.id);

                // change = true by default in editor
                this.appOptions.canLiveView = !!params.asc_getLiveViewerSupport() && (this.editorConfig.mode === 'view'); // viewer: change=false when no flag canLiveViewer (i.g. old license), change=true by default when canLiveViewer==true
                this.appOptions.canChangeCoAuthoring = this.appOptions.isEdit && this.appOptions.canCoAuthoring && !(this.editorConfig.coEditing && typeof this.editorConfig.coEditing == 'object' && this.editorConfig.coEditing.change===false) ||
                    this.appOptions.canLiveView && !(this.editorConfig.coEditing && typeof this.editorConfig.coEditing == 'object' && this.editorConfig.coEditing.change===false);
                this.appOptions.isAnonymousSupport = !!this.api.asc_isAnonymousSupport();

                this.loadCoAuthSettings();
                this.applyModeCommonElements();
                this.applyModeEditorElements();

                this._isPermissionsInited = true;
                if ( !this.appOptions.isEdit ) {
                    Common.NotificationCenter.trigger('app:face', this.appOptions);

                    this.hidePreloader();
                    this.onLongActionBegin(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);
                }

                this.api.asc_setViewMode(!this.appOptions.isEdit && !this.appOptions.isRestrictedEdit);
                this.api.asc_setCanSendChanges(this.appOptions.canSaveToFile);
                (this.appOptions.isRestrictedEdit && this.appOptions.canComments) && this.api.asc_setRestriction(Asc.c_oAscRestrictionType.OnlyComments);
                this.api.asc_LoadDocument();
            },

            loadCoAuthSettings: function() {
                Common.Utils.InternalSettings.set("ve-settings-coauthmode", false);
                Common.Utils.InternalSettings.set("ve-settings-autosave", 0);
            },

            loadDefaultMetricSettings: function() {
                var region = '';
                if (this.appOptions.location) {
                    console.log("Obsolete: The 'location' parameter of the 'editorConfig' section is deprecated. Please use 'region' parameter in the 'editorConfig' section instead.");
                    region = this.appOptions.location;
                } else if (this.appOptions.region) {
                    var val = this.appOptions.region;
                    val = Common.util.LanguageInfo.getLanguages().hasOwnProperty(val) ? Common.util.LanguageInfo.getLocalLanguageName(val)[0] : val;
                    if (val && typeof val === 'string') {
                        var arr = val.split(/[\-_]/);
                        (arr.length>1) && (region = arr[arr.length-1]);
                    }
                } else {
                    var arr = (this.appOptions.lang || 'en').split(/[\-_]/);
                    (arr.length>1) && (region = arr[arr.length-1]);
                    if (!region) {
                        arr = (navigator.language || '').split(/[\-_]/);
                        (arr.length>1) && (region = arr[arr.length-1]);
                    }
                }

                if (/^(ca|us)$/i.test(region))
                    Common.Utils.Metric.setDefaultMetric(Common.Utils.Metric.c_MetricUnits.inch);
                Common.Utils.InternalSettings.set("ve-config-region", region);
            },

            onCoAuthApply: function() {
                if (!this.api) return;

                this._state.fastCoauth = Common.Utils.InternalSettings.get("ve-settings-coauthmode");
                this.api.asc_SetFastCollaborative(this._state.fastCoauth);
                this.api.asc_setAutoSaveGap(Common.Utils.InternalSettings.get("ve-settings-autosave"));

                this.getApplication().getController('LeftMenu').leftMenu.getMenu('file').applyMode();
            },

            applyModeCommonElements: function() {
                window.editor_elements_prepared = true;

                var app             = this.getApplication(),
                    viewport        = app.getController('Viewport'),
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

                this.api.asc_registerCallback('asc_onDownloadUrl',     _.bind(this.onDownloadUrl, this));
                this.api.asc_registerCallback('asc_onAuthParticipantsChanged', _.bind(this.onAuthParticipantsChanged, this));
                this.api.asc_registerCallback('asc_onParticipantsChanged',     _.bind(this.onAuthParticipantsChanged, this));
                this.api.asc_registerCallback('asc_onConnectionStateChanged',  _.bind(this.onUserConnection, this));

                var value = Common.localStorage.getItem('ve-settings-unit');
                value = (value!==null) ? parseInt(value) : (this.appOptions.customization && this.appOptions.customization.unit ? Common.Utils.Metric.c_MetricUnits[this.appOptions.customization.unit.toLocaleLowerCase()] : Common.Utils.Metric.getDefaultMetric());
                (value===undefined) && (value = Common.Utils.Metric.getDefaultMetric());
                Common.Utils.Metric.setCurrentMetric(value);
                Common.Utils.InternalSettings.set("ve-settings-unit", value);

                toolbarController.setApi(this.api);
            },

            applyModeEditorElements: function() {
                var me = this,
                    application         = this.getApplication();

                if (this.appOptions.isEdit) {

                } else
                    window.onbeforeunload = _.bind(me.onBeforeUnloadView, me);
            },

            onExternalMessage: function(msg, options) {
                if (msg && msg.msg) {
                    msg.msg = (msg.msg).toString();
                    this.showTips([msg.msg.charAt(0).toUpperCase() + msg.msg.substring(1)], options);

                    Common.component.Analytics.trackEvent('External Error');
                }
            },

            onError: function(id, level, errData) {
                switch (id) {
                    case Asc.c_oAscError.ID.LoadingScriptError:
                        this.showTips([this.scriptLoadError]);
                        this.tooltip && this.tooltip.getBSTip().$tip.css('z-index', 10000);
                        return;
                    case Asc.c_oAscError.ID.CanNotPasteImage:
                        this.showTips([this.errorCannotPasteImg], {timeout: 7000, hideCloseTip: true});
                        return;
                    case Asc.c_oAscError.ID.UpdateVersion:
                        Common.UI.TooltipManager.showTip('updateVersion');
                        return;
                    case Asc.c_oAscError.ID.SessionIdle:
                        Common.UI.TooltipManager.showTip('sessionIdle');
                        return;
                    case Asc.c_oAscError.ID.SessionToken:
                        Common.UI.TooltipManager.showTip('sessionToken');
                        return;
                    case Asc.c_oAscError.ID.UserDrop:
                        if (this._state.lostEditingRights) {
                            this._state.lostEditingRights = false;
                            return;
                        }
                        this._state.lostEditingRights = true;
                        Common.NotificationCenter.trigger('collaboration:sharingdeny');
                        var me = this;
                        Common.UI.TooltipManager.showTip({ step: 'userDrop', text: this.errorUserDrop,
                            target: '#toolbar', maxwidth: 600, showButton: false, automove: true, noHighlight: true, noArrow: true, multiple: true,
                            callback: function() {
                                me._state.lostEditingRights = false;
                            }});
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

                    case Asc.c_oAscError.ID.Database:
                        config.msg = this.errorDatabaseConnection;
                        break;

                    case Asc.c_oAscError.ID.Warning:
                        config.msg = this.errorConnectToServer;
                        config.closable = false;
                        break;

                    case Asc.c_oAscError.ID.SessionAbsolute:
                        config.msg = this.errorSessionAbsolute;
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

                    if (this.appOptions.canRequestClose) {
                        config.msg += '<br><br>' + this.criticalErrorExtTextClose;
                        config.callback = function(btn) {
                            if (btn == 'ok') {
                                Common.Gateway.requestClose();
                                Common.Controllers.Desktop.requestClose();
                            }
                        }
                    } else if (this.appOptions.canBackToFolder && !this.appOptions.isDesktopApp && typeof id !== 'string' && this.appOptions.customization.goback.url && this.appOptions.customization.goback.blank===false) {
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
                        this.onEditComplete();
                    }, this);
                }

                if (!Common.Utils.ModalWindow.isVisible() || $('.asc-window.modal.alert[data-value=' + id + ']').length<1)
                    Common.UI.alert(config).$window.attr('data-value', id);

                (id!==undefined) && Common.component.Analytics.trackEvent('Internal Error', id.toString());
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

            onBeforeUnloadView: function() {
                Common.localStorage.save();
                this._state.unloadTimer = 10000;
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
                this.editorConfig && this.editorConfig.canUpdateVersion && console.log("Obsolete: The 'onOutdatedVersion' event is deprecated. Please use 'onRequestRefreshFile' event and 'refreshFile' method instead.");

                var me = this;
                me.needToUpdateVersion = true;
                me.onLongActionEnd(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);
                Common.UI.TooltipManager.showTip({ step: 'updateVersionReload', text: this.errorUpdateVersion, header: this.titleUpdateVersion,
                    target: '#toolbar', maxwidth: 'none', closable: false, automove: true, noHighlight: true, noArrow: true,
                    callback: function() {
                        _.defer(function() {
                            Common.Gateway.updateVersion();
                            if (callback) callback.call(me);
                            me.editorConfig && me.editorConfig.canUpdateVersion && me.onLongActionBegin(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);
                        })
                    }
                });
                this.disableEditing(true, 'not-loaded');
                Common.NotificationCenter.trigger('api:disconnect');
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
                    if (this._isDocReady) { // receive after refresh file
                        this.disableEditing(true);
                        Common.NotificationCenter.trigger('api:disconnect');
                    }
                    return true;
                }
                return false;
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
                if (me._state.requireUserAction) {
                    Common.Gateway.userActionRequired();
                    me._state.requireUserAction = false;
                }
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

                var value = Common.localStorage.getBool("ve-hide-quick-print-warning"),
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
                            dontshow && Common.localStorage.setBool("ve-hide-quick-print-warning", true);
                            if (btn === 'yes') {
                                setTimeout(handler, 1);
                            }
                        }
                    });
                }
            },

            warningDocumentIsLocked: function() {
                var me = this;
                var _disable_ui = function (disable) {
                    me.disableEditing(disable, 'reconnect');
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
                    repaintcallback: function() {
                        this.setPosition(Common.Utils.innerWidth() - this.options.width - 15, 30);
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

            onLostEditRights: function() {
                this._readonlyRights = true;
            },

            changeAccessRights: function(btn,event,opts) {
                if (this._docAccessDlg || this._readonlyRights) return;

                if (this.appOptions.canRequestSharingSettings) {
                    Common.Gateway.requestSharingSettings();
                } else {
                    var me = this;
                    me._docAccessDlg = new Common.Views.DocumentAccessDialog({
                        settingsurl: this.appOptions.sharingSettingsUrl
                    });
                    me._docAccessDlg.on('accessrights', function(obj, rights){
                        me.setSharingSettings({sharingSettings: rights});
                    }).on('close', function(obj){
                        me._docAccessDlg = undefined;
                    });

                    me._docAccessDlg.show();
                }
            },

            setSharingSettings: function(data) {
                if (data) {
                    this.document.info.sharingSettings = data.sharingSettings;
                    Common.NotificationCenter.trigger('collaboration:sharingupdate', data.sharingSettings);
                    Common.NotificationCenter.trigger('mentions:clearusers', this);
                }
            },


            onSaveDocumentBinary: function(data) {
                Common.Gateway.saveDocument(data);
            },

            loadBinary: function(data) {
                data && this.api.asc_openDocumentFromBytes(new Uint8Array(data));
            },

            onRequestRefreshFile: function() {
                Common.Gateway.requestRefreshFile();
                console.log('Trying to refresh file');
            },

            onRefreshFile: function(data) {
                if (data) {
                    var docInfo = new Asc.asc_CDocInfo();
                    if (data.document) {
                        docInfo.put_Id(data.document.key);
                        docInfo.put_Url(data.document.url);
                        docInfo.put_Title(data.document.title);
                        if (data.document.title) {
                            //Common.Gateway.metaChange({title: data.document.title});
                            appHeader.setDocumentCaption(data.document.title);
                            this.updateWindowTitle(true);
                            this.document.title = data.document.title;
                        }
                        data.document.referenceData && docInfo.put_ReferenceData(data.document.referenceData);
                    }
                    if (data.editorConfig) {
                        docInfo.put_CallbackUrl(data.editorConfig.callbackUrl);
                    }
                    if (data.token)
                        docInfo.put_Token(data.token);

                    var _user = new Asc.asc_CUserInfo(); // change for guest!!
                    _user.put_Id(this.appOptions.user.id);
                    _user.put_FullName(this.appOptions.user.fullname);
                    _user.put_IsAnonymousUser(!!this.appOptions.user.anonymous);
                    docInfo.put_UserInfo(_user);

                    var _options = $.extend({}, this.document.options, this.editorConfig.actionLink || {});
                    docInfo.put_Options(_options);

                    docInfo.put_Format(this.document.fileType);
                    docInfo.put_Lang(this.editorConfig.lang);
                    docInfo.put_Mode(this.editorConfig.mode);
                    docInfo.put_Permissions(this.permissions);
                    docInfo.put_DirectUrl(data.document && data.document.directUrl ? data.document.directUrl : this.document.directUrl);
                    docInfo.put_VKey(data.document && data.document.vkey ?  data.document.vkey : this.document.vkey);
                    docInfo.put_EncryptedInfo(data.editorConfig && data.editorConfig.encryptionKeys ? data.editorConfig.encryptionKeys : this.editorConfig.encryptionKeys);

                    var enable = !this.editorConfig.customization || (this.editorConfig.customization.macros!==false);
                    docInfo.asc_putIsEnabledMacroses(!!enable);
                    enable = !this.editorConfig.customization || (this.editorConfig.customization.plugins!==false);
                    docInfo.asc_putIsEnabledPlugins(!!enable);

                    // var coEditMode = !(this.editorConfig.coEditing && typeof this.editorConfig.coEditing == 'object') ? 'fast' : // fast by default
                    //     this.editorConfig.mode === 'view' && this.editorConfig.coEditing.change!==false ? 'fast' : // if can change mode in viewer - set fast for using live viewer
                    //     this.editorConfig.coEditing.mode || 'fast';
                    var coEditMode = 'strict';
                    docInfo.put_CoEditingMode(coEditMode);
                    this.api.asc_refreshFile(docInfo);
                }
            },

            errorLang: 'The interface language is not loaded.<br>Please contact your Document Server administrator.'
        }
    })(), VE.Controllers.Main || {}))
});