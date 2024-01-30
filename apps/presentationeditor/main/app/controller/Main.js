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
 *    Main.js
 *
 *    Main controller
 *
 *    Created by Julia Radzhabova on 26 March 2014
 *    Copyright (c) 2018 Ascensio System SIA. All rights reserved.
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
    'common/main/lib/view/UserNameDialog',
    'common/main/lib/util/LocalStorage',
    'presentationeditor/main/app/collection/ShapeGroups',
    'presentationeditor/main/app/collection/SlideLayouts',
    'presentationeditor/main/app/collection/EquationGroups',
    'common/main/lib/controller/FocusManager',
    'common/main/lib/controller/HintManager',
    'common/main/lib/controller/LayoutManager',
    'common/main/lib/controller/ExternalUsers'
], function () { 'use strict';

    PE.Controllers.Main = Backbone.Controller.extend(_.extend((function() {
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
            rightMenu: '#viewport #right-menu',
            statusBar: '#statusbar'
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
                'Common.Collections.TextArt',
                'Common.Collections.HistoryUsers'
            ],
            views: [],

            initialize: function() {
                this.addListeners({
                    'FileMenu': {
                        'settings:apply': _.bind(this.applySettings, this)
                    },
                    'Common.Views.ReviewChanges': {
                        'settings:apply': _.bind(this.applySettings, this)
                    }
                });

                var me = this,
                    themeNames = ['blank', 'pixel', 'classic', 'official', 'green', 'lines', 'office', 'safari', 'dotted', 'corner', 'turtle', 'basic', 'office theme', 'green leaf'],
                    translate = {
                        'Series': this.txtSeries,
                        'Diagram Title': this.txtDiagramTitle,
                        'X Axis': this.txtXAxis,
                        'Y Axis': this.txtYAxis,
                        'Your text here': this.txtArt,
                        'Slide text': this.txtSlideText,
                        'Chart': this.txtSldLtTChart,
                        'ClipArt': this.txtClipArt,
                        'Diagram': this.txtDiagram,
                        'Date and time': this.txtDateTime,
                        'Footer': this.txtFooter,
                        'Header': this.txtHeader,
                        'Media': this.txtMedia,
                        'Picture': this.txtPicture,
                        'Image': this.txtImage,
                        'Slide number': this.txtSlideNumber,
                        'Slide subtitle': this.txtSlideSubtitle,
                        'Table': this.txtSldLtTTbl,
                        'Slide title': this.txtSlideTitle,
                        'Loading': this.txtLoading,
                        'Click to add notes': this.txtAddNotes,
                        'Click to add first slide': this.txtAddFirstSlide,
                        'None': this.txtNone,
                        'Text': this.textText,
                        'Object': this.textObject
                    };

                themeNames.forEach(function(item){
                    translate[item] = me['txtTheme_' + item.replace(/ /g, '_')] || item;
                });
                me.translationTable = translate;
            },

            onLaunch: function() {
                var me = this;

                this._state = {isDisconnected: false, usersCount: 1, fastCoauth: true, lostEditingRights: false, licenseType: false, isDocModified: false};
                this.languages = null;

                window.storagename = 'presentation';

                this.stackLongActions = new Common.IrregularStack({
                    strongCompare   : function(obj1, obj2){return obj1.id === obj2.id && obj1.type === obj2.type;},
                    weakCompare     : function(obj1, obj2){return obj1.type === obj2.type;}
                });
                this.stackDisableActions = new Common.IrregularStack({
                    strongCompare   : function(obj1, obj2){return obj1.type === obj2.type;},
                    weakCompare     : function(obj1, obj2){return obj1.type === obj2.type;}
                });
                this.stackMacrosRequests = [];
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
                    this.api.SetThemesPath("../../../../sdkjs/slide/themes/");

                    var value = Common.localStorage.getBool("pe-settings-cachemode", true);
                    Common.Utils.InternalSettings.set("pe-settings-cachemode", value);
                    this.api.asc_setDefaultBlitMode(!!value);

                    value = Common.localStorage.getItem("pe-settings-fontrender");
                    if (value===null) value = '3';
                    Common.Utils.InternalSettings.set("pe-settings-fontrender", value);
                    this.api.SetFontRenderingMode(parseInt(value));

                    value = Common.localStorage.getBool("app-settings-screen-reader");
                    Common.Utils.InternalSettings.set("app-settings-screen-reader", value);
                    this.api.setSpeechEnabled(value);

                    if ( !Common.Utils.isIE ) {
                        if ( /^https?:\/\//.test('{{HELP_CENTER_WEB_PE}}') ) {
                            const _url_obj = new URL('{{HELP_CENTER_WEB_PE}}');
                            if ( !!_url_obj.searchParams )
                                _url_obj.searchParams.set('lang', Common.Locale.getCurrentLanguage());

                            Common.Utils.InternalSettings.set("url-help-center", _url_obj.toString());
                        }
                    }

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
                    this.api.asc_registerCallback('asc_onSpellCheckInit',           _.bind(this.loadLanguages, this));
                    Common.NotificationCenter.on('api:disconnect',                  _.bind(this.onCoAuthoringDisconnect, this));
                    Common.NotificationCenter.on('goback',                          _.bind(this.goBack, this));
                    Common.NotificationCenter.on('showmessage',                     _.bind(this.onExternalMessage, this));
                    Common.NotificationCenter.on('showerror',                       _.bind(this.onError, this));
                    Common.NotificationCenter.on('markfavorite',                    _.bind(this.markFavorite, this));
                    Common.NotificationCenter.on('editing:disable',                 _.bind(this.onEditingDisable, this));

                    this.isShowOpenDialog = false;

                    // Initialize api gateway
                    this.editorConfig = {};
                    this.appOptions = {};
                    Common.Gateway.on('init',           _.bind(this.loadConfig, this));
                    Common.Gateway.on('showmessage',    _.bind(this.onExternalMessage, this));
                    Common.Gateway.on('opendocument',   _.bind(this.loadDocument, this));
                    Common.Gateway.on('grabfocus',      _.bind(this.onGrabFocus, this));
                    Common.Gateway.appReady();

                    this.getApplication().getController('Viewport').setApi(this.api);
                    this.getApplication().getController('Statusbar').setApi(me.api);

                    // Syncronize focus with api
                    $(document.body).on('focus', 'input, textarea', function(e) {
                        if (!/area_id/.test(e.target.id)) {
                            if (/msg-reply/.test(e.target.className))
                                me.dontCloseDummyComment = true;
                            else if (/textarea-control/.test(e.target.className))
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
                                if (/msg-reply/.test(e.target.className))
                                    me.dontCloseDummyComment = false;
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
                        'modal:show': function(e){
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

                    this.initNames();
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
                this.appOptions.user            = Common.Utils.fillUserInfo(data.config.user, this.editorConfig.lang, value ? (value + ' (' + this.appOptions.guestName + ')' ) : this.textAnonymous,
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
                this.appOptions.saveAsUrl       = this.editorConfig.saveAsUrl;
                this.appOptions.fileChoiceUrl   = this.editorConfig.fileChoiceUrl;
                this.appOptions.canAnalytics    = false;
                this.appOptions.canRequestClose = this.editorConfig.canRequestClose;
                this.appOptions.canBackToFolder = (this.editorConfig.canBackToFolder!==false) && (typeof (this.editorConfig.customization) == 'object') && (typeof (this.editorConfig.customization.goback) == 'object')
                                                  && (!_.isEmpty(this.editorConfig.customization.goback.url) || this.editorConfig.customization.goback.requestClose && this.appOptions.canRequestClose);
                this.appOptions.canBack         = this.appOptions.canBackToFolder === true;
                this.appOptions.canPlugins      = false;
                this.appOptions.canRequestUsers = this.editorConfig.canRequestUsers;
                this.appOptions.canRequestSendNotify = this.editorConfig.canRequestSendNotify;
                this.appOptions.canRequestSaveAs = this.editorConfig.canRequestSaveAs;
                this.appOptions.canRequestInsertImage = this.editorConfig.canRequestInsertImage;
                this.appOptions.compatibleFeatures = (typeof (this.appOptions.customization) == 'object') && !!this.appOptions.customization.compatibleFeatures;
                this.appOptions.canRequestSharingSettings = this.editorConfig.canRequestSharingSettings;
                this.appOptions.mentionShare = !((typeof (this.appOptions.customization) == 'object') && (this.appOptions.customization.mentionShare==false));
                this.appOptions.uiRtl = !(Common.Controllers.Desktop.isActive() && Common.Controllers.Desktop.uiRtlSupported()) && !Common.Utils.isIE;

                this.appOptions.user.guest && this.appOptions.canRenameAnonymous && Common.NotificationCenter.on('user:rename', _.bind(this.showRenameUserDialog, this));

                appHeader = this.getApplication().getController('Viewport').getView('Common.Views.Header');
                appHeader.setCanBack(this.appOptions.canBackToFolder === true, (this.appOptions.canBackToFolder) ? this.editorConfig.customization.goback.text : '');

                if (this.editorConfig.lang)
                    this.api.asc_setLocale(this.editorConfig.lang);

                if (this.appOptions.location == 'us' || this.appOptions.location == 'ca')
                    Common.Utils.Metric.setDefaultMetric(Common.Utils.Metric.c_MetricUnits.inch);

                if (!( this.editorConfig.customization && ( this.editorConfig.customization.toolbarNoTabs ||
                    (this.editorConfig.targetApp!=='desktop') && (this.editorConfig.customization.loaderName || this.editorConfig.customization.loaderLogo)))) {
                    $('#editor-container').append('<div class="doc-placeholder"><div class="slide-h"><div class="slide-v"><div class="slide-container"><div class="line"></div><div class="line empty"></div><div class="line"></div></div></div></div></div>');
                }

                value = Common.localStorage.getItem("pe-macros-mode");
                if (value === null) {
                    value = this.editorConfig.customization ? this.editorConfig.customization.macrosMode : 'warn';
                    value = (value == 'enable') ? 1 : (value == 'disable' ? 2 : 0);
                } else
                    value = parseInt(value);
                Common.Utils.InternalSettings.set("pe-macros-mode", value);

                value = Common.localStorage.getItem("pe-allow-macros-request");
                Common.Utils.InternalSettings.set("pe-allow-macros-request", (value !== null) ? parseInt(value)  : 0);

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

                    var coEditMode = !(this.editorConfig.coEditing && typeof this.editorConfig.coEditing == 'object') ? 'fast' : // fast by default
                                     this.editorConfig.mode === 'view' && this.editorConfig.coEditing.change!==false ? 'fast' : // if can change mode in viewer - set fast for using live viewer
                                     this.editorConfig.coEditing.mode || 'fast';
                    docInfo.put_CoEditingMode(coEditMode);

                    var enable = !this.editorConfig.customization || (this.editorConfig.customization.macros!==false);
                    docInfo.asc_putIsEnabledMacroses(!!enable);
                    enable = !this.editorConfig.customization || (this.editorConfig.customization.plugins!==false);
                    docInfo.asc_putIsEnabledPlugins(!!enable);
                }

                this.api.asc_registerCallback('asc_onGetEditorPermissions', _.bind(this.onEditorPermissions, this));
                this.api.asc_registerCallback('asc_onLicenseChanged',       _.bind(this.onLicenseChanged, this));
                this.api.asc_registerCallback('asc_onMacrosPermissionRequest', _.bind(this.onMacrosPermissionRequest, this));
                this.api.asc_registerCallback('asc_onRunAutostartMacroses', _.bind(this.onRunAutostartMacroses, this));
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
                if ( !this.appOptions.canDownload ) {
                    Common.Gateway.reportError(Asc.c_oAscError.ID.AccessDeny, this.errorAccessDeny);
                    return;
                }

                this._state.isFromGatewayDownloadAs = true;
                var _format = (format && (typeof format == 'string')) ? Asc.c_oAscFileType[ format.toUpperCase() ] : null,
                    _supported = [
                        Asc.c_oAscFileType.PPTX,
                        Asc.c_oAscFileType.ODP,
                        Asc.c_oAscFileType.PDF,
                        Asc.c_oAscFileType.PDFA,
                        Asc.c_oAscFileType.POTX,
                        Asc.c_oAscFileType.OTP,
                        Asc.c_oAscFileType.PPTM,
                        Asc.c_oAscFileType.PNG,
                        Asc.c_oAscFileType.JPG
                    ];

                if ( !_format || _supported.indexOf(_format) < 0 )
                    _format = Asc.c_oAscFileType.PPTX;
                this.api.asc_DownloadAs(new Asc.asc_CDownloadOptions(_format, true));
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
                var me = this;
                if ( !Common.Controllers.Desktop.process('goback') ) {
                    if (me.appOptions.customization.goback.requestClose && me.appOptions.canRequestClose) {
                        me.onRequestClose();
                    } else {
                        var href = me.appOptions.customization.goback.url;
                        if (!current && me.appOptions.customization.goback.blank!==false) {
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
                    toolbarView = application.getController('Toolbar').getView('Toolbar'),
                    rightMenu = application.getController('RightMenu').getView('RightMenu');

                if (this.appOptions.isEdit && toolbarView && toolbarView.btnHighlightColor.pressed &&
                    ( !_.isObject(arguments[1]) || arguments[1].id !== 'id-toolbar-btn-highlight')) {
                    this.api.SetMarkerFormat(false);
                    toolbarView.btnHighlightColor.toggle(false, false);
                }
                
                application.getController('DocumentHolder').getView().focus();
                if (this.api && this.appOptions.isEdit && this.api.asc_isDocumentCanSave) {
                    var cansave = this.api.asc_isDocumentCanSave(),
                        forcesave = this.appOptions.forcesave,
                        isSyncButton = (toolbarView.btnCollabChanges.rendered) ? toolbarView.btnCollabChanges.cmpEl.hasClass('notify') : false,
                        isDisabled = !cansave && !isSyncButton && !forcesave || this._state.isDisconnected || this._state.fastCoauth && this._state.usersCount>1 && !forcesave;
                        toolbarView.btnSave.setDisabled(isDisabled);
                }
                if (this.appOptions.isEdit && (toolbarView && toolbarView._isEyedropperStart || rightMenu && rightMenu._isEyedropperStart)) {
                    toolbarView._isEyedropperStart ? toolbarView._isEyedropperStart = false : rightMenu._isEyedropperStart = false;
                    this.api.asc_cancelEyedropper();
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
                        me.getApplication().getController('Statusbar').setStatusCaption('');
                }

                action = this.stackLongActions.get({type: Asc.c_oAscAsyncActionType.BlockInteraction});
                action ? this.setLongActionView(action) : this.loadMask && this.loadMask.hide();

                if (this.appOptions.isEdit && (id==Asc.c_oAscAsyncAction['Save'] || id==Asc.c_oAscAsyncAction['ForceSaveButton']) && (!this._state.fastCoauth || this._state.usersCount<2))
                    this.synchronizeChanges();

                if ( id == Asc.c_oAscAsyncAction['Disconnect']) {
                    this._state.timerDisconnect && clearTimeout(this._state.timerDisconnect);
                    this.disableEditing(false, true);
                    this.getApplication().getController('Statusbar').hideDisconnectTip();
                    this.getApplication().getController('Statusbar').setStatusCaption(this.textReconnect);
                }

                if (type == Asc.c_oAscAsyncActionType.BlockInteraction && !((id == Asc.c_oAscAsyncAction['LoadDocumentFonts'] || id == Asc.c_oAscAsyncAction['ApplyChanges'] ||
                                                                             id == Asc.c_oAscAsyncAction['LoadImage'] || id == Asc.c_oAscAsyncAction['UploadImage']) &&
                    (this.dontCloseDummyComment || this.inTextareaControl || Common.Utils.ModalWindow.isVisible() || this.inFormControl))) {
                    // this.onEditComplete(this.loadMask);
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

                Common.NotificationCenter.trigger('app:ready', me.appOptions);

                me.api.SetDrawingFreeze(false);
                me.hidePreloader();
                me.onLongActionEnd(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);

                Common.Utils.InternalSettings.set("pe-settings-datetime-default", Common.localStorage.getItem("pe-settings-datetime-default"));

                value = Common.localStorage.getItem("pe-settings-zoom");
                Common.Utils.InternalSettings.set("pe-settings-zoom", value);
                var zf = (value!==null) ? parseInt(value) : (this.appOptions.customization && this.appOptions.customization.zoom ? parseInt(this.appOptions.customization.zoom) : -1);
                value = Common.localStorage.getItem("pe-last-zoom");
                var lastZoom = (value!==null) ? parseInt(value):0;
                (zf == -1) ? this.api.zoomFitToPage() : ((zf == -2) ? this.api.zoomFitToWidth() : this.api.zoom(zf>0 ? zf : (zf == -3 && lastZoom > 0) ? lastZoom : 100));

                // spellcheck
                value = Common.UI.FeaturesManager.getInitValue('spellcheck', true);
                value = (value !== undefined) ? value : !(this.appOptions.customization && this.appOptions.customization.spellcheck===false);
                if (this.appOptions.customization && this.appOptions.customization.spellcheck!==undefined)
                    console.log("Obsolete: The 'spellcheck' parameter of the 'customization' section is deprecated. Please use 'spellcheck' parameter in the 'customization.features' section instead.");
                if (Common.UI.FeaturesManager.canChange('spellcheck')) { // get from local storage
                    value = Common.localStorage.getBool("pe-settings-spellcheck", value);
                    Common.Utils.InternalSettings.set("pe-settings-spellcheck", value);
                }
                me.api.asc_setSpellCheck(value);
                Common.NotificationCenter.trigger('spelling:turn', value ? 'on' : 'off', true); // only toggle buttons

                if (Common.UI.FeaturesManager.canChange('spellcheck')) { // get settings for spellcheck from local storage
                    value = Common.localStorage.getBool("pe-spellcheck-ignore-uppercase-words", true);
                    Common.Utils.InternalSettings.set("pe-spellcheck-ignore-uppercase-words", value);
                    value = Common.localStorage.getBool("pe-spellcheck-ignore-numbers-words", true);
                    Common.Utils.InternalSettings.set("pe-spellcheck-ignore-numbers-words", value);
                    value = new AscCommon.CSpellCheckSettings();
                    value.put_IgnoreWordsInUppercase(Common.Utils.InternalSettings.get("pe-spellcheck-ignore-uppercase-words"));
                    value.put_IgnoreWordsWithNumbers(Common.Utils.InternalSettings.get("pe-spellcheck-ignore-numbers-words"));
                    this.api.asc_setSpellCheckSettings(value);
                }

                value = Common.localStorage.getBool('pe-hidden-notes', this.appOptions.customization && this.appOptions.customization.hideNotes===true);
                me.api.asc_ShowNotes(!value);

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

                appHeader.setDocumentCaption( me.api.asc_getDocumentName() );
                me.updateWindowTitle(true);

                value = Common.localStorage.getBool("pe-settings-show-alt-hints", true);
                Common.Utils.InternalSettings.set("pe-settings-show-alt-hints", value);

                /** coauthoring begin **/
                me._state.fastCoauth = Common.Utils.InternalSettings.get("pe-settings-coauthmode");
                me.api.asc_SetFastCollaborative(me._state.fastCoauth);
                me.api.asc_setAutoSaveGap(Common.Utils.InternalSettings.get("pe-settings-autosave"));
                /** coauthoring end **/

                value = Common.localStorage.getBool("pe-settings-showsnaplines", true);
                Common.Utils.InternalSettings.set("pe-settings-showsnaplines", value);
                me.api.asc_setShowSmartGuides(value);

                value = Common.localStorage.getBool("pe-settings-showguides");
                Common.Utils.InternalSettings.set("pe-settings-showguides", value);
                me.api.asc_setShowGuides(value);

                value = Common.localStorage.getBool("pe-settings-showgrid");
                Common.Utils.InternalSettings.set("pe-settings-showgrid", value);
                me.api.asc_setShowGridlines(value);

                var application = me.getApplication();
                var toolbarController           = application.getController('Toolbar'),
                    statusbarController         = application.getController('Statusbar'),
                    documentHolderController    = application.getController('DocumentHolder'),
                    fontsController             = application.getController('Common.Controllers.Fonts'),
                    rightmenuController         = application.getController('RightMenu'),
                    leftmenuController          = application.getController('LeftMenu'),
                    chatController              = application.getController('Common.Controllers.Chat'),
                    pluginsController           = application.getController('Common.Controllers.Plugins');

                leftmenuController.getView('LeftMenu').getMenu('file').loadDocument({doc:me.document});
                leftmenuController.setMode(me.appOptions).createDelayedElements().setApi(me.api);

                chatController.setApi(this.api).setMode(this.appOptions);
                application.getController('Common.Controllers.ExternalDiagramEditor').setApi(this.api).loadConfig({config:this.editorConfig, customization: this.editorConfig.customization});
                application.getController('Common.Controllers.ExternalOleEditor').setApi(this.api).loadConfig({config:this.editorConfig, customization: this.editorConfig.customization});

                pluginsController.setApi(me.api);

                documentHolderController.setApi(me.api);
                // documentHolderController.createDelayedElements();
                statusbarController.createDelayedElements();

                leftmenuController.getView('LeftMenu').disableMenu('all',false);

                if (me.appOptions.canBranding)
                    me.getApplication().getController('LeftMenu').leftMenu.getMenu('about').setLicInfo(me.editorConfig.customization);

                documentHolderController.getView().on('editcomplete', _.bind(me.onEditComplete, me));
//                if (me.isThumbnailsShow) me.getMainMenu().onThumbnailsShow(me.isThumbnailsShow);
                application.getController('Viewport').getView('DocumentPreview').setApi(me.api).setMode(me.appOptions).on('editcomplete', _.bind(me.onEditComplete, me));

                if (me.appOptions.isEdit) {
                    if (me.appOptions.canForcesave) {// use asc_setIsForceSaveOnUserSave only when customization->forcesave = true
                        me.appOptions.forcesave = Common.localStorage.getBool("pe-settings-forcesave", me.appOptions.canForcesave);
                        Common.Utils.InternalSettings.set("pe-settings-forcesave", me.appOptions.forcesave);
                        me.api.asc_setIsForceSaveOnUserSave(me.appOptions.forcesave);
                    }

                    value = Common.localStorage.getItem("pe-settings-paste-button");
                    if (value===null) value = '1';
                    Common.Utils.InternalSettings.set("pe-settings-paste-button", parseInt(value));
                    me.api.asc_setVisiblePasteButton(!!parseInt(value));

                    me.loadAutoCorrectSettings();

                    if (me.needToUpdateVersion)
                        Common.NotificationCenter.trigger('api:disconnect');
                    var timer_sl = setInterval(function(){
                        if (window.styles_loaded) {
                            clearInterval(timer_sl);

                            toolbarController.createDelayedElements();

                            documentHolderController.getView().createDelayedElements();
                            me.setLanguages();

                            me.api.asc_registerCallback('asc_onUpdateLayout',       _.bind(me.fillLayoutsStore, me)); // slide layouts loading
                            me.updateThemeColors();
                            var shapes = me.api.asc_getPropertyEditorShapes();
                            if (shapes)
                                me.fillAutoShapes(shapes[0], shapes[1]);
                            rightmenuController.createDelayedElements();

                            me.api.asc_registerCallback('asc_onFocusObject',        _.bind(me.onFocusObject, me));

                            toolbarController.activateControls();
                            if (me.needToUpdateVersion)
                                toolbarController.onApiCoAuthoringDisconnect();
                            me.api.UpdateInterfaceState();

                            Common.NotificationCenter.trigger('document:ready', 'main');
                            me.applyLicense();
                        }
                    }, 50);
                } else {
                    documentHolderController.getView().createDelayedElementsViewer();
                    Common.Utils.injectSvgIcons();
                    Common.NotificationCenter.trigger('document:ready', 'main');
                    me.applyLicense();
                }

                // TODO bug 43960
                var dummyClass = ~~(1e6*Math.random());
                $('.toolbar').prepend(Common.Utils.String.format('<div class="lazy-{0} x-huge"><div class="toolbar__icon" style="position: absolute; width: 1px; height: 1px;"></div>', dummyClass));
                setTimeout(function() { $(Common.Utils.String.format('.toolbar .lazy-{0}', dummyClass)).remove(); }, 10);

                if (this.appOptions.canAnalytics && false)
                    Common.component.Analytics.initialize('UA-12442749-13', 'Presentation Editor');

                Common.Gateway.on('applyeditrights',        _.bind(me.onApplyEditRights, me));
                Common.Gateway.on('processsaveresult',      _.bind(me.onProcessSaveResult, me));
                Common.Gateway.on('processrightschange',    _.bind(me.onProcessRightsChange, me));
                Common.Gateway.on('processmouse',           _.bind(me.onProcessMouse, me));
                Common.Gateway.on('downloadas',             _.bind(me.onDownloadAs, me));
                Common.Gateway.on('setfavorite',            _.bind(me.onSetFavorite, me));
                Common.Gateway.on('refreshhistory',         _.bind(me.onRefreshHistory, me));
                Common.Gateway.on('requestclose',           _.bind(me.onRequestClose, me));
                Common.Gateway.sendInfo({mode:me.appOptions.isEdit?'edit':'view'});

                $(document).on('contextmenu', _.bind(me.onContextMenu, me));
                Common.Gateway.documentReady();

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
                        // show warning or write to log if Common.Utils.InternalSettings.get("pe-settings-coauthmode") was true ???
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

                    if (this._state.licenseType!==Asc.c_oLicenseResult.SuccessLimit && (this.appOptions.isEdit || this.appOptions.isRestrictedEdit)) {
                        this.disableEditing(true);
                        this.api.asc_coAuthoringDisconnect();
                        Common.NotificationCenter.trigger('api:disconnect');
                    }

                    var value = Common.localStorage.getItem("pe-license-warning");
                    value = (value!==null) ? parseInt(value) : 0;
                    var now = (new Date).getTime();
                    if (now - value > 86400000) {
                        Common.UI.info({
                            maxwidth: 500,
                            title: this.textNoLicenseTitle,
                            msg  : license,
                            buttons: buttons,
                            primary: primary,
                            callback: function(btn) {
                                Common.localStorage.setItem("pe-license-warning", now);
                                if (btn == 'buynow')
                                    window.open('{{PUBLISHER_URL}}', "_blank");
                                else if (btn == 'contact')
                                    window.open('mailto:{{SALES_EMAIL}}', "_blank");
                            }
                        });
                    }
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

            disableEditing: function(disable, temp) {
                Common.NotificationCenter.trigger('editing:disable', disable, {
                    viewMode: disable,
                    allowSignature: false,
                    rightMenu: {clear: !temp, disable: true},
                    statusBar: true,
                    leftMenu: {disable: true, previewMode: true},
                    fileMenu: {protect: true, history: temp},
                    comments: {disable: !temp, previewMode: true},
                    chat: true,
                    review: true,
                    viewport: true,
                    documentHolder: {clear: !temp, disable: true},
                    toolbar: true
                }, temp ? 'reconnect' : 'disconnect');
            },

            onEditingDisable: function(disable, options, type) {
                var app = this.getApplication();

                var action = {type: type, disable: disable, options: options};
                if (disable && !this.stackDisableActions.get({type: type}))
                    this.stackDisableActions.push(action);
                !disable && this.stackDisableActions.pop({type: type});
                var prev_options = !disable && (this.stackDisableActions.length()>0) ? this.stackDisableActions.get(this.stackDisableActions.length()-1) : null;

                if (options.rightMenu && app.getController('RightMenu')) {
                    options.rightMenu.clear && app.getController('RightMenu').getView('RightMenu').clearSelection();
                    options.rightMenu.disable && app.getController('RightMenu').SetDisabled(disable, options.allowSignature);
                }
                if (options.statusBar) {
                    app.getController('Statusbar').getView('Statusbar').SetDisabled(disable);
                }
                if (options.review) {
                    app.getController('Common.Controllers.ReviewChanges').SetDisabled(disable);
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
                if (options.comments) {
                    var comments = this.getApplication().getController('Common.Controllers.Comments');
                    if (comments && options.comments.previewMode)
                        comments.setPreviewMode(disable);
                }

                if (prev_options) {
                    this.onEditingDisable(prev_options.disable, prev_options.options, prev_options.type);
                }
            },

            disableLiveViewing: function(disable) {
                this.appOptions.canLiveView = !disable;
                this.api.asc_SetFastCollaborative(!disable);
                Common.Utils.InternalSettings.set("pe-settings-coauthmode", !disable);
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

                if ( this.onServerVersion(params.asc_getBuildVersion()) || !this.onLanguageLoaded() ) return;

                if (params.asc_getRights() !== Asc.c_oRights.Edit)
                    this.permissions.edit = false;

                this.appOptions.permissionsLicense = licType;
                this.appOptions.isOffline      = this.api.asc_isOffline();
                this.appOptions.isCrypted      = this.api.asc_isCrypto();
                this.appOptions.canLicense     = (licType === Asc.c_oLicenseResult.Success || licType === Asc.c_oLicenseResult.SuccessLimit);
                this.appOptions.isLightVersion = params.asc_getIsLight();
                /** coauthoring begin **/
                this.appOptions.canCoAuthoring = !this.appOptions.isLightVersion;
                /** coauthoring end **/
                this.appOptions.canRequestEditRights = this.editorConfig.canRequestEditRights;
                this.appOptions.canEdit        = this.permissions.edit !== false && // can edit
                                                 (this.editorConfig.canRequestEditRights || this.editorConfig.mode !== 'view'); // if mode=="view" -> canRequestEditRights must be defined
                this.appOptions.isEdit         = this.appOptions.canLicense && this.appOptions.canEdit && this.editorConfig.mode !== 'view';
                this.appOptions.canDownload    = this.permissions.download !== false;
                this.appOptions.canAnalytics   = params.asc_getIsAnalyticsEnable();
                this.appOptions.canComments    = this.appOptions.canLicense && (this.permissions.comment===undefined ? this.appOptions.isEdit : this.permissions.comment) && (this.editorConfig.mode !== 'view');
                this.appOptions.canComments    = this.appOptions.canComments && !((typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.comments===false);
                this.appOptions.canViewComments = this.appOptions.canComments || !((typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.comments===false);
                this.appOptions.canChat        = this.appOptions.canLicense && !this.appOptions.isOffline && !(this.permissions.chat===false || (this.permissions.chat===undefined) &&
                                                                                                            (typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.chat===false);
                if ((typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.chat!==undefined) {
                    console.log("Obsolete: The 'chat' parameter of the 'customization' section is deprecated. Please use 'chat' parameter in the permissions instead.");
                }
                this.appOptions.canPrint       = (this.permissions.print !== false);
                this.appOptions.canPreviewPrint = this.appOptions.canPrint && !Common.Utils.isMac && this.appOptions.isDesktopApp;
                this.appOptions.canQuickPrint = this.appOptions.canPrint && !Common.Utils.isMac && this.appOptions.isDesktopApp;
                this.appOptions.canRename      = this.editorConfig.canRename;
                this.appOptions.canForcesave   = this.appOptions.isEdit && !this.appOptions.isOffline && (typeof (this.editorConfig.customization) == 'object' && !!this.editorConfig.customization.forcesave);
                this.appOptions.forcesave      = this.appOptions.canForcesave;
                this.appOptions.canEditComments= this.appOptions.isOffline || !this.permissions.editCommentAuthorOnly;
                this.appOptions.canDeleteComments= this.appOptions.isOffline || !this.permissions.deleteCommentAuthorOnly;
                if ((typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.commentAuthorOnly===true) {
                    console.log("Obsolete: The 'commentAuthorOnly' parameter of the 'customization' section is deprecated. Please use 'editCommentAuthorOnly' and 'deleteCommentAuthorOnly' parameters in the permissions instead.");
                    if (this.permissions.editCommentAuthorOnly===undefined && this.permissions.deleteCommentAuthorOnly===undefined)
                        this.appOptions.canEditComments = this.appOptions.canDeleteComments = this.appOptions.isOffline;
                }
                this.appOptions.buildVersion   = params.asc_getBuildVersion();
                this.appOptions.trialMode      = params.asc_getLicenseMode();
                this.appOptions.isBeta         = params.asc_getIsBeta();
                this.appOptions.isSignatureSupport= this.appOptions.isEdit && this.appOptions.isDesktopApp && this.appOptions.isOffline && this.api.asc_isSignaturesSupport() && (this.permissions.protect!==false);
                this.appOptions.isPasswordSupport = this.appOptions.isEdit && this.api.asc_isProtectionSupport() && (this.permissions.protect!==false);
                this.appOptions.canProtect     = (this.permissions.protect!==false);
                this.appOptions.canHelp        = !((typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.help===false);
                this.appOptions.isRestrictedEdit = !this.appOptions.isEdit && this.appOptions.canComments;

                this.appOptions.canUseHistory  = this.appOptions.canLicense && this.editorConfig.canUseHistory && this.appOptions.canCoAuthoring && !this.appOptions.isOffline;
                this.appOptions.canHistoryClose  = this.editorConfig.canHistoryClose;
                this.appOptions.canHistoryRestore= this.editorConfig.canHistoryRestore;

                if ( this.appOptions.isLightVersion ) {
                    this.appOptions.canUseHistory = false;
                }

                this.appOptions.canBranding  = params.asc_getCustomization();
                if (this.appOptions.canBranding)
                    appHeader.setBranding(this.editorConfig.customization);

                this.appOptions.canFavorite = this.document.info && (this.document.info.favorite!==undefined && this.document.info.favorite!==null) && !this.appOptions.isOffline;
                this.appOptions.canFavorite && appHeader.setFavorite(this.document.info.favorite);

                this.appOptions.canUseReviewPermissions = this.appOptions.canLicense && (!!this.permissions.reviewGroups ||
                                                         this.appOptions.canLicense && this.editorConfig.customization && this.editorConfig.customization.reviewPermissions && (typeof (this.editorConfig.customization.reviewPermissions) == 'object'));
                this.appOptions.canUseCommentPermissions = this.appOptions.canLicense && !!this.permissions.commentGroups;
                this.appOptions.canUseUserInfoPermissions = this.appOptions.canLicense && !!this.permissions.userInfoGroups;
                AscCommon.UserInfoParser.setParser(true);
                AscCommon.UserInfoParser.setCurrentName(this.appOptions.user.fullname);
                this.appOptions.canUseReviewPermissions && AscCommon.UserInfoParser.setReviewPermissions(this.permissions.reviewGroups, this.editorConfig.customization.reviewPermissions);
                this.appOptions.canUseCommentPermissions && AscCommon.UserInfoParser.setCommentPermissions(this.permissions.commentGroups);
                this.appOptions.canUseUserInfoPermissions && AscCommon.UserInfoParser.setUserInfoPermissions(this.permissions.userInfoGroups);
                appHeader.setUserName(AscCommon.UserInfoParser.getParsedName(AscCommon.UserInfoParser.getCurrentName()));
                appHeader.setUserId(this.appOptions.user.id);
                appHeader.setUserAvatar(this.appOptions.user.image);

                this.appOptions.canRename && appHeader.setCanRename(true);
                this.appOptions.canBrandingExt = params.asc_getCanBranding() && (typeof this.editorConfig.customization == 'object' || this.editorConfig.plugins);
                this.getApplication().getController('Common.Controllers.Plugins').setMode(this.appOptions);
                this.editorConfig.customization && Common.UI.LayoutManager.init(this.editorConfig.customization.layout, this.appOptions.canBrandingExt);
                this.editorConfig.customization && Common.UI.FeaturesManager.init(this.editorConfig.customization.features, this.appOptions.canBrandingExt);
                Common.UI.ExternalUsers.init(this.appOptions.canRequestUsers);
                this.appOptions.user.image && Common.UI.ExternalUsers.setImage(this.appOptions.user.id, this.appOptions.user.image);
                Common.UI.ExternalUsers.get('info', this.appOptions.user.id);

                // change = true by default in editor
                this.appOptions.canLiveView = !!params.asc_getLiveViewerSupport() && (this.editorConfig.mode === 'view'); // viewer: change=false when no flag canLiveViewer (i.g. old license), change=true by default when canLiveViewer==true
                this.appOptions.canChangeCoAuthoring = this.appOptions.isEdit && this.appOptions.canCoAuthoring && !(this.editorConfig.coEditing && typeof this.editorConfig.coEditing == 'object' && this.editorConfig.coEditing.change===false) ||
                                                       this.appOptions.canLiveView && !(this.editorConfig.coEditing && typeof this.editorConfig.coEditing == 'object' && this.editorConfig.coEditing.change===false);
                this.appOptions.isAnonymousSupport = !!this.api.asc_isAnonymousSupport();

                this.loadCoAuthSettings();
                this.applyModeCommonElements();
                this.applyModeEditorElements();

                if ( !this.appOptions.isEdit ) {
                    Common.NotificationCenter.trigger('app:face', this.appOptions);

                    this.hidePreloader();
                    this.onLongActionBegin(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);
                }

                this.api.asc_setViewMode(!this.appOptions.isEdit && !this.appOptions.isRestrictedEdit);
                (this.appOptions.isRestrictedEdit && this.appOptions.canComments) && this.api.asc_setRestriction(Asc.c_oAscRestrictionType.OnlyComments);
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
                        value = Common.localStorage.getItem("pe-settings-coauthmode");
                        if (value===null) {
                            value = (this.editorConfig.coEditing && this.editorConfig.coEditing.mode!==undefined) ? (this.editorConfig.coEditing.mode==='strict' ? 0 : 1) : null;
                            if (value===null && !Common.localStorage.itemExists("pe-settings-autosave") &&
                                this.appOptions.customization && this.appOptions.customization.autosave===false) {
                                value = 0; // use customization.autosave only when de-settings-coauthmode and pe-settings-autosave are null
                            }
                        }
                    }
                    fastCoauth = (value===null || parseInt(value) == 1);
                } else if (!this.appOptions.isEdit && this.appOptions.isRestrictedEdit) {
                    fastCoauth = true;
                } else if (this.appOptions.canLiveView && !this.appOptions.isOffline) { // viewer
                    value = Common.localStorage.getItem("pe-settings-view-coauthmode");
                    if (!this.appOptions.canChangeCoAuthoring || value===null) { // Use coEditing.mode or 'fast' by default
                        value = this.editorConfig.coEditing && this.editorConfig.coEditing.mode==='strict' ? 0 : 1;
                    }
                    fastCoauth = (parseInt(value) == 1);
                } else {
                    fastCoauth = false;
                    autosave = 0;
                }

                if (this.appOptions.isEdit) {
                    value = Common.localStorage.getItem("pe-settings-autosave");
                    if (value === null && this.appOptions.customization && this.appOptions.customization.autosave === false)
                        value = 0;
                    autosave = (!fastCoauth && value !== null) ? parseInt(value) : (this.appOptions.canCoAuthoring ? 1 : 0);
                }

                Common.Utils.InternalSettings.set("pe-settings-coauthmode", fastCoauth);
                Common.Utils.InternalSettings.set("pe-settings-autosave", autosave);
            },

            applyModeCommonElements: function() {
                window.editor_elements_prepared = true;

                var app             = this.getApplication(),
                    viewport        = app.getController('Viewport').getView('Viewport'),
                    statusbarView   = app.getController('Statusbar').getView('Statusbar'),
                    documentHolder  = app.getController('DocumentHolder'),
                    toolbarController = app.getController('Toolbar');

                viewport && viewport.setMode(this.appOptions, true);
                statusbarView && statusbarView.setMode(this.appOptions);
                toolbarController.setMode(this.appOptions);
                documentHolder.setMode(this.appOptions);
                viewport.applyCommonMode();

                var printController = app.getController('Print');
                printController && this.api && printController.setApi(this.api).setMode(this.appOptions);

                this.api.asc_registerCallback('asc_onSendThemeColors', _.bind(this.onSendThemeColors, this));
                this.api.asc_registerCallback('asc_onDownloadUrl',     _.bind(this.onDownloadUrl, this));
                this.api.asc_registerCallback('asc_onDocumentModifiedChanged', _.bind(this.onDocumentModifiedChanged, this));
            },

            applyModeEditorElements: function(prevmode) {
                /** coauthoring begin **/
                var commentsController  = this.getApplication().getController('Common.Controllers.Comments');
                if (commentsController) {
                    commentsController.setMode(this.appOptions);
                    commentsController.setConfig({config: this.editorConfig, sdkviewname: '#id_main_parent'}, this.api);
                }
                /** coauthoring end **/
                var me = this,
                    application         = this.getApplication(),
                    reviewController    = application.getController('Common.Controllers.ReviewChanges');
                reviewController.setMode(me.appOptions).setConfig({config: me.editorConfig}, me.api).loadDocument({doc:me.document});

                var toolbarController   = application.getController('Toolbar');
                toolbarController   && toolbarController.setApi(me.api);

                if (this.appOptions.isEdit) { // set api events for toolbar in the Restricted Editing mode)
                    var rightmenuController = application.getController('RightMenu'),
                        fontsControllers    = application.getController('Common.Controllers.Fonts');

//                    me.getStore('SlideLayouts');
                    fontsControllers    && fontsControllers.setApi(me.api);
                    rightmenuController && rightmenuController.setApi(me.api);

                    if (me.appOptions.isSignatureSupport || me.appOptions.isPasswordSupport)
                        application.getController('Common.Controllers.Protection').setMode(me.appOptions).setConfig({config: me.editorConfig}, me.api);

                    var viewport = this.getApplication().getController('Viewport').getView('Viewport');

                    viewport.applyEditorMode();

                    var rightmenuView = rightmenuController.getView('RightMenu');
                    if (rightmenuView) {
                        rightmenuView.setApi(me.api);
                        rightmenuView.on('editcomplete', _.bind(me.onEditComplete, me));
                        rightmenuView.setMode(me.appOptions);
                    }

                    var toolbarView = (toolbarController) ? toolbarController.getView('Toolbar') : null;
                    if (toolbarView) {
                        toolbarView.setApi(me.api);
                        toolbarView.on('editcomplete', _.bind(me.onEditComplete, me));
                        toolbarView.on('insertimage', _.bind(me.onInsertImage, me));
                        toolbarView.on('inserttable', _.bind(me.onInsertTable, me));
                        toolbarView.on('insertshape', _.bind(me.onInsertShape, me));
                        toolbarView.on('insertchart', _.bind(me.onInsertChart, me));
                        toolbarView.on('inserttextart', _.bind(me.onInsertTextArt, me));
                    }

                    var value = Common.localStorage.getItem('pe-settings-unit');
                    value = (value!==null) ? parseInt(value) : (me.appOptions.customization && me.appOptions.customization.unit ? Common.Utils.Metric.c_MetricUnits[me.appOptions.customization.unit.toLocaleLowerCase()] : Common.Utils.Metric.getDefaultMetric());
                    (value===undefined) && (value = Common.Utils.Metric.getDefaultMetric());
                    Common.Utils.Metric.setCurrentMetric(value);
                    Common.Utils.InternalSettings.set("pe-settings-unit", value);
                    me.api.asc_SetDocumentUnits((value==Common.Utils.Metric.c_MetricUnits.inch) ? Asc.c_oAscDocumentUnits.Inch : ((value==Common.Utils.Metric.c_MetricUnits.pt) ? Asc.c_oAscDocumentUnits.Point : Asc.c_oAscDocumentUnits.Millimeter));

                    value = Common.localStorage.itemExists('pe-hidden-rulers') ? Common.localStorage.getBool('pe-hidden-rulers') : (!this.appOptions.customization || this.appOptions.customization.hideRulers!==false);
                    Common.Utils.InternalSettings.set("pe-hidden-rulers", value);
                    if (me.api.asc_SetViewRulers) me.api.asc_SetViewRulers(!value);

                    me.api.asc_registerCallback('asc_onChangeObjectLock',        _.bind(me._onChangeObjectLock, me));
                    me.api.asc_registerCallback('asc_onDocumentCanSaveChanged',  _.bind(me.onDocumentCanSaveChanged, me));
                    /** coauthoring begin **/
                    me.api.asc_registerCallback('asc_onCollaborativeChanges',    _.bind(me.onCollaborativeChanges, me));
                    me.api.asc_registerCallback('asc_OnTryUndoInFastCollaborative',_.bind(me.onTryUndoInFastCollaborative, me));
                    me.api.asc_registerCallback('asc_onAuthParticipantsChanged', _.bind(me.onAuthParticipantsChanged, me));
                    me.api.asc_registerCallback('asc_onParticipantsChanged',     _.bind(me.onAuthParticipantsChanged, me));
                    me.api.asc_registerCallback('asc_onConnectionStateChanged',  _.bind(me.onUserConnection, me));
                    me.api.asc_registerCallback('asc_onConvertEquationToMath',  _.bind(me.onConvertEquationToMath, me));
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
                } else
                    window.onbeforeunload = _.bind(me.onBeforeUnloadView, me);
            },

            onExternalMessage: function(msg) {
                if (msg && msg.msg) {
                    msg.msg = (msg.msg).toString();
                    this.showTips([msg.msg.charAt(0).toUpperCase() + msg.msg.substring(1)]);

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

                    case Asc.c_oAscError.ID.MailToClientMissing:
                        config.msg = this.errorEmailClient;
                        break;

                    case Asc.c_oAscError.ID.ConvertationOpenLimitError:
                        config.msg = this.errorFileSizeExceed;
                        break;

                    case Asc.c_oAscError.ID.UpdateVersion:
                        config.msg = this.errorUpdateVersionOnDisconnect;
                        config.maxwidth = 600;
                        break;

                    case Asc.c_oAscError.ID.ComboSeriesError:
                        config.msg = this.errorComboSeries;
                        break;
                    
                    case Asc.c_oAscError.ID.Password:
                        config.msg = this.errorSetPassword;
                        break;

                    case Asc.c_oAscError.ID.LoadingFontError:
                        config.msg = this.errorLoadingFont;
                        break;

                    case Asc.c_oAscError.ID.DirectUrl:
                        config.msg = this.errorDirectUrl;
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
                            if (btn == 'ok') {
                                Common.NotificationCenter.trigger('goback', true);
                            }
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
                        if (id == Asc.c_oAscError.ID.Warning && btn == 'ok' && this.appOptions.canDownload) {
                            Common.UI.Menu.Manager.hideAll();
                            if (this.appOptions.isDesktopApp && this.appOptions.isOffline)
                                this.api.asc_DownloadAs();
                            else {
                                this._isDocReady ? this.getApplication().getController('LeftMenu').leftMenu.showMenu('file:saveas') : (this._needToSaveAsFile = true);
                            }
                        } else if (id == Asc.c_oAscError.ID.SplitCellMaxRows || id == Asc.c_oAscError.ID.SplitCellMaxCols || id == Asc.c_oAscError.ID.SplitCellRowsDivider) {
                            var me = this;
                            setTimeout(function(){
                                (new Common.Views.InsertTableDialog({
                                    split: true,
                                    handler: function(result, value) {
                                        if (result == 'ok') {
                                            if (me.api)
                                                me.api.SplitCell(value.columns, value.rows);
                                        }
                                        me.onEditComplete();
                                    }
                                })).show();
                            },10);
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

            onCoAuthoringDisconnect: function() {
                // TODO: Disable all except 'Download As' and 'Print'
                this.getApplication().getController('Viewport').getView('Viewport').setMode({isDisconnected:true});
                appHeader.setCanRename(false);
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
                tooltip.on('tooltip:hideonclick', function(){
                    setTimeout(showNextTip, 300);
                });

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

                    if ( window.document.title != title )
                        window.document.title = title;

                    this._isDocReady && (this._state.isDocModified !== isModified) && Common.Gateway.setDocumentModified(isModified);
                    if (isModified && (!this._state.fastCoauth || this._state.usersCount<2))
                        this.getApplication().getController('Statusbar').setStatusCaption('', true);

                    this._state.isDocModified = isModified;
                }
            },

            onDocumentChanged: function() {
            },

            onDocumentModifiedChanged: function() {
                var isModified = this.api.asc_isDocumentCanSave();
                if (this._state.isDocModified !== isModified) {
                    this._isDocReady && Common.Gateway.setDocumentModified(this.api.isDocumentModified());
                }

                this.updateWindowTitle();

                var toolbarView = this.getApplication().getController('Toolbar').getView('Toolbar');
                if (toolbarView && toolbarView.btnCollabChanges) {
                    var isSyncButton = toolbarView.btnCollabChanges.cmpEl.hasClass('notify'),
                        forcesave = this.appOptions.forcesave,
                        isDisabled = !isModified && !isSyncButton && !forcesave || this._state.isDisconnected || this._state.fastCoauth && this._state.usersCount>1 && !forcesave;
                        toolbarView.btnSave.setDisabled(isDisabled);
                }
            },
            onDocumentCanSaveChanged: function (isCanSave) {
                var toolbarView = this.getApplication().getController('Toolbar').getView('Toolbar');
                if ( toolbarView ) {
                    var isSyncButton = toolbarView.btnCollabChanges.cmpEl.hasClass('notify'),
                        forcesave = this.appOptions.forcesave,
                        isDisabled = !isCanSave && !isSyncButton && !forcesave || this._state.isDisconnected || this._state.fastCoauth && this._state.usersCount>1 && !forcesave;
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
                            if (this.appOptions.customization.rightMenu!==undefined)
                                console.log("Obsolete: The 'rightMenu' parameter of the 'customization' section is deprecated. Please use 'rightMenu' parameter in the 'customization.layout' section instead.");
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
                this.getApplication().getController('DocumentHolder').hideTips();
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
                Common.Utils.InternalSettings.set("pe-settings-unit", value);
                this.api.asc_SetDocumentUnits((value==Common.Utils.Metric.c_MetricUnits.inch) ? Asc.c_oAscDocumentUnits.Inch : ((value==Common.Utils.Metric.c_MetricUnits.pt) ? Asc.c_oAscDocumentUnits.Point : Asc.c_oAscDocumentUnits.Millimeter));
                this.getApplication().getController('RightMenu').updateMetricUnit();
                this.appOptions.canPreviewPrint && this.getApplication().getController('Print').getView('PrintWithPreview').updateMetricUnit();
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
                    me.getApplication().getController('Animation').updateThemeColors();
                }, 50);
            },

            onSendThemeColors: function(colors, standart_colors) {
                Common.Utils.ThemeColor.setColors(colors, standart_colors);
                if (window.styles_loaded) {
                    this.updateThemeColors();
                    var me = this;
                    setTimeout(function(){
                        me.fillTextArt();
                    }, 1);
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
                    name_arr = {};

                _.each(groupNames, function(groupName, index){
                    var store = new Backbone.Collection([], {
                        model: PE.Models.ShapeModel
                    }),
                        arr = [];

                    var cols = (shapes[index].length) > 18 ? 7 : 6,
                        height = Math.ceil(shapes[index].length/cols) * 35 + 3,
                        width = 30 * cols;

                    _.each(shapes[index], function(shape, idx){
                        var name = me['txtShape_' + shape.Type];
                        arr.push({
                            data     : {shapeType: shape.Type},
                            tip      : name || (me.textShape + ' ' + (idx+1)),
                            allowSelected : true,
                            selected: false
                        });
                        if (name)
                            name_arr[shape.Type] = name;
                    });
                    store.add(arr);
                    shapegrouparray.push({
                        groupName   : me.shapeGroupNames[index],
                        groupStore  : store,
                        groupWidth  : width,
                        groupHeight : height
                    });
                });

                this.getCollection('ShapeGroups').reset(shapegrouparray);
                this.api.asc_setShapeNames(name_arr);
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
                var arr = [],
                    artStore = this.getCollection('Common.Collections.TextArt');

                if (!shapes && artStore.length>0) {// shapes == undefined when update textart collection (from asc_onSendThemeColors)
                    shapes = this.api.asc_getTextArtPreviews();
                }
                if (_.isEmpty(shapes)) return;

                _.each(shapes, function(shape, index){
                    arr.push({
                        imageUrl : shape,
                        data     : index,
                        allowSelected : true,
                        selected: false
                    });
                });
                artStore.reset(arr);
            },

            loadLanguages: function(apiLangs) {
                var langs = [], info,
                    allLangs = Common.util.LanguageInfo.getLanguages();
                for (var code in allLangs) {
                    if (allLangs.hasOwnProperty(code)) {
                        info = allLangs[code];
                        info[2] && langs.push({
                            displayValue:   info[1],
                            value:          info[0],
                            code:           parseInt(code),
                            spellcheck:     _.indexOf(apiLangs, code)>-1
                        });
                    }
                }

                langs.sort(function(a, b){
                    if (a.value < b.value) return -1;
                    if (a.value > b.value) return 1;
                    return 0;
                });

                this.languages = langs;
                window.styles_loaded && this.setLanguages();
            },

            setLanguages: function() {
                if (!this.languages || this.languages.length<1) {
                    this.loadLanguages([]);
                }
                if (this.languages && this.languages.length>0) {
                    this.getApplication().getController('DocumentHolder').getView().setLanguages(this.languages);
                    this.getApplication().getController('Statusbar').setLanguages(this.languages);
                    this.getApplication().getController('Common.Controllers.ReviewChanges').setLanguages(this.languages);
                }
            },

            onTryUndoInFastCollaborative: function() {
                if (!Common.localStorage.getBool("pe-hide-try-undoredo"))
                    Common.UI.info({
                        width: 500,
                        msg: this.appOptions.canChangeCoAuthoring ? this.textTryUndoRedo : this.textTryUndoRedoWarn,
                        iconCls: 'info',
                        buttons: this.appOptions.canChangeCoAuthoring ? [{value: 'custom', caption: this.textStrict}, 'cancel'] : ['ok'],
                        primary: this.appOptions.canChangeCoAuthoring ? 'custom' : 'ok',
                        dontshow: true,
                        callback: _.bind(function(btn, dontshow){
                            if (dontshow) Common.localStorage.setItem("pe-hide-try-undoredo", 1);
                            if (btn == 'custom') {
                                Common.localStorage.setItem("pe-settings-coauthmode", 0);
                                this.api.asc_SetFastCollaborative(false);
                                Common.Utils.InternalSettings.set("pe-settings-coauthmode", false);
                                this.getApplication().getController('Common.Controllers.ReviewChanges').applySettings();
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
                if (this.appOptions.isEdit && !this.appOptions.isOffline && this.appOptions.canCoAuthoring) {
                    var oldval = this._state.fastCoauth;
                    this._state.fastCoauth = Common.localStorage.getBool("pe-settings-coauthmode", true);
                    if (this._state.fastCoauth && !oldval)
                        this.synchronizeChanges();
                }
                if (this.appOptions.canForcesave) {
                    this.appOptions.forcesave = Common.localStorage.getBool("pe-settings-forcesave", this.appOptions.canForcesave);
                    Common.Utils.InternalSettings.set("pe-settings-forcesave", this.appOptions.forcesave);
                    this.api.asc_setIsForceSaveOnUserSave(this.appOptions.forcesave);
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
                this.getApplication().getController('Common.Controllers.ReviewChanges').loadDocument({doc:this.document});
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

                var value = Common.localStorage.getBool("pe-hide-quick-print-warning"),
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
                            dontshow && Common.localStorage.setBool("pe-hide-quick-print-warning", true);
                            if (btn === 'yes') {
                                setTimeout(handler, 1);
                            }
                        }
                    });
                }
            },

            onAdvancedOptions: function(type, advOptions) {
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

            warningDocumentIsLocked: function() {
                var me = this;
                Common.Utils.warningDocumentIsLocked({
                    disablefunc: function (disable) {
                        me.disableEditing(disable, true);
                    }});
            },

            onRunAutostartMacroses: function() {
                var me = this,
                    enable = !this.editorConfig.customization || (this.editorConfig.customization.macros!==false);
                if (enable) {
                    var value = Common.Utils.InternalSettings.get("pe-macros-mode");
                    if (value==1)
                        this.api.asc_runAutostartMacroses();
                    else if (value === 0) {
                        Common.UI.warning({
                            msg: this.textHasMacros + '<br>',
                            buttons: ['yes', 'no'],
                            primary: 'yes',
                            dontshow: true,
                            textDontShow: this.textRemember,
                            callback: function(btn, dontshow){
                                if (dontshow) {
                                    Common.Utils.InternalSettings.set("pe-macros-mode", (btn == 'yes') ? 1 : 2);
                                    Common.localStorage.setItem("pe-macros-mode", (btn == 'yes') ? 1 : 2);
                                }
                                if (btn == 'yes') {
                                    setTimeout(function() {
                                        me.api.asc_runAutostartMacroses();
                                    }, 1);
                                }
                            }
                        });
                    }
                }
            },

            onMacrosPermissionRequest: function(url, callback) {
                if (url && callback) {
                    this.stackMacrosRequests.push({url: url, callback: callback});
                    if (this.stackMacrosRequests.length>1) {
                        return;
                    }
                } else if (this.stackMacrosRequests.length>0) {
                    url = this.stackMacrosRequests[0].url;
                    callback = this.stackMacrosRequests[0].callback;
                } else
                    return;

                var me = this;
                var value = Common.Utils.InternalSettings.get("pe-allow-macros-request");
                if (value>0) {
                    callback && callback(value === 1);
                    this.stackMacrosRequests.shift();
                    this.onMacrosPermissionRequest();
                } else {
                    Common.UI.warning({
                        msg: this.textRequestMacros.replace('%1', url),
                        buttons: ['yes', 'no'],
                        primary: 'yes',
                        dontshow: true,
                        textDontShow: this.textRememberMacros,
                        maxwidth: 600,
                        callback: function(btn, dontshow){
                            if (dontshow) {
                                Common.Utils.InternalSettings.set("pe-allow-macros-request", (btn == 'yes') ? 1 : 2);
                                Common.localStorage.setItem("pe-allow-macros-request", (btn == 'yes') ? 1 : 2);
                            }
                            setTimeout(function() {
                                if (callback) callback(btn == 'yes');
                                me.stackMacrosRequests.shift();
                                me.onMacrosPermissionRequest();
                            }, 1);
                        }
                    });
                }
            },

            loadAutoCorrectSettings: function() {
                // autocorrection
                var me = this;
                var value = Common.localStorage.getItem("pe-settings-math-correct-add");
                Common.Utils.InternalSettings.set("pe-settings-math-correct-add", value);
                var arrAdd = value ? JSON.parse(value) : [];
                value = Common.localStorage.getItem("pe-settings-math-correct-rem");
                Common.Utils.InternalSettings.set("pe-settings-math-correct-rem", value);
                var arrRem = value ? JSON.parse(value) : [];
                value = Common.localStorage.getBool("pe-settings-math-correct-replace-type", true); // replace on type
                Common.Utils.InternalSettings.set("pe-settings-math-correct-replace-type", value);
                me.api.asc_refreshOnStartAutoCorrectMathSymbols(arrRem, arrAdd, value);

                value = Common.localStorage.getItem("pe-settings-rec-functions-add");
                Common.Utils.InternalSettings.set("pe-settings-rec-functions-add", value);
                arrAdd = value ? JSON.parse(value) : [];
                value = Common.localStorage.getItem("pe-settings-rec-functions-rem");
                Common.Utils.InternalSettings.set("pe-settings-rec-functions-rem", value);
                arrRem = value ? JSON.parse(value) : [];
                me.api.asc_refreshOnStartAutoCorrectMathFunctions(arrRem, arrAdd);

                value = Common.localStorage.getBool("pe-settings-autoformat-bulleted", true);
                Common.Utils.InternalSettings.set("pe-settings-autoformat-bulleted", value);
                me.api.asc_SetAutomaticBulletedLists(value);

                value = Common.localStorage.getBool("pe-settings-autoformat-numbered", true);
                Common.Utils.InternalSettings.set("pe-settings-autoformat-numbered", value);
                me.api.asc_SetAutomaticNumberedLists(value);

                value = Common.localStorage.getBool("pe-settings-autoformat-smart-quotes", true);
                Common.Utils.InternalSettings.set("pe-settings-autoformat-smart-quotes", value);
                me.api.asc_SetAutoCorrectSmartQuotes(value);

                value = Common.localStorage.getBool("pe-settings-autoformat-hyphens", true);
                Common.Utils.InternalSettings.set("pe-settings-autoformat-hyphens", value);
                me.api.asc_SetAutoCorrectHyphensWithDash(value);

                value = Common.localStorage.getItem("pe-settings-letter-exception-sentence");
                value = value !== null ? parseInt(value) != 0 : Common.localStorage.getBool("pe-settings-autoformat-fl-sentence", true);
                Common.Utils.InternalSettings.set("pe-settings-letter-exception-sentence", value);
                me.api.asc_SetAutoCorrectFirstLetterOfSentences(value);

                value = Common.localStorage.getItem("pe-settings-letter-exceptionl-cells", true);
                value = value !== null ? parseInt(value) != 0 : Common.localStorage.getBool("pe-settings-autoformat-fl-cells", true);
                Common.Utils.InternalSettings.set("pe-settings-letter-exception-cells", value);
                me.api.asc_SetAutoCorrectFirstLetterOfCells && me.api.asc_SetAutoCorrectFirstLetterOfCells(value);
               
                [0x0409, 0x0419].forEach(function(lang) {
                    var apiFlManager = me.api.asc_GetAutoCorrectSettings().get_FirstLetterExceptionManager();
                    
                    value = Common.localStorage.getItem("pe-settings-letter-exception-add-" + lang);
                    Common.Utils.InternalSettings.set("pe-settings-letter-exception-add-" + lang, value);
                    arrAdd = value ? JSON.parse(value) : [];
    
                    value = Common.localStorage.getItem("pe-settings-letter-exception-rem-" + lang);
                    Common.Utils.InternalSettings.set("pe-settings-letter-exception-rem-" + lang, value);
                    arrRem = value ? JSON.parse(value) : [];

                    var arrRes = _.union(apiFlManager.get_Exceptions(lang), arrAdd); 
                    arrRes = _.difference(arrRes, arrRem);  
                    arrRes.sort();
                    apiFlManager.put_Exceptions(arrRes, lang);       
                });    
                
                value = Common.localStorage.getBool("pe-settings-autoformat-hyperlink", true);
                Common.Utils.InternalSettings.set("pe-settings-autoformat-hyperlink", value);
                me.api.asc_SetAutoCorrectHyperlinks(value);

                value = Common.localStorage.getBool("pe-settings-autoformat-double-space", Common.Utils.isMac); // add period with double-space in MacOs by default
                Common.Utils.InternalSettings.set("pe-settings-autoformat-double-space", value);
                me.api.asc_SetAutoCorrectDoubleSpaceWithPeriod(value);
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
                            var name = settings.input ? settings.input + ' (' + me.textGuest + ')' : me.textAnonymous;
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

            onRefreshHistory: function(opts) {
                if (!this.appOptions.canUseHistory) return;

                this.loadMask && this.loadMask.hide();
                if (opts.data.error || !opts.data.history) {
                    var historyStore = this.getApplication().getCollection('Common.Collections.HistoryVersions');
                    if (historyStore && historyStore.size()>0) {
                        historyStore.each(function(item){
                            item.set('canRestore', false);
                        });
                    }
                    Common.UI.alert({
                        title: this.notcriticalErrorTitle,
                        msg: (opts.data.error) ? opts.data.error : this.txtErrorLoadHistory,
                        iconCls: 'warn',
                        buttons: ['ok'],
                        callback: _.bind(function(btn){
                            this.onEditComplete();
                        }, this)
                    });
                } else {
                    this.api.asc_coAuthoringDisconnect();
                    appHeader.setCanRename(false);
                    appHeader.getButton('users') && appHeader.getButton('users').hide();
                    appHeader.getButton('share') && appHeader.getButton('share').setVisible(false);
                    this.getApplication().getController('LeftMenu').getView('LeftMenu').showHistory();
                    this.disableEditing(true);
                    this._renameDialog && this._renameDialog.close();
                    var versions = opts.data.history,
                        historyStore = this.getApplication().getCollection('Common.Collections.HistoryVersions'),
                        currentVersion = null,
                        arrIds = [];
                    if (historyStore) {
                        var arrVersions = [], ver, version, group = -1, prev_ver = -1, arrColors = [], docIdPrev = '',
                            usersStore = this.getApplication().getCollection('Common.Collections.HistoryUsers'), user = null, usersCnt = 0;

                        for (ver=versions.length-1; ver>=0; ver--) {
                            version = versions[ver];
                            if (version.versionGroup===undefined || version.versionGroup===null)
                                version.versionGroup = version.version;
                            if (version) {
                                if (!version.user) version.user = {};
                                docIdPrev = (ver>0 && versions[ver-1]) ? versions[ver-1].key : version.key + '0';
                                user = usersStore.findUser(version.user.id);
                                if (!user) {
                                    user = new Common.Models.User({
                                        id          : version.user.id,
                                        username    : version.user.name,
                                        colorval    : Asc.c_oAscArrUserColors[usersCnt],
                                        color       : this.generateUserColor(Asc.c_oAscArrUserColors[usersCnt++])
                                    });
                                    usersStore.add(user);
                                }
                                var avatar = Common.UI.ExternalUsers.getImage(version.user.id);
                                (avatar===undefined) && arrIds.push(version.user.id);
                                arrVersions.push(new Common.Models.HistoryVersion({
                                    version: version.versionGroup,
                                    revision: version.version,
                                    userid : version.user.id,
                                    username : version.user.name,
                                    usercolor: user.get('color'),
                                    initials : Common.Utils.getUserInitials(AscCommon.UserInfoParser.getParsedName(version.user.name || this.textAnonymous)),
                                    avatar : avatar,
                                    created: version.created,
                                    docId: version.key,
                                    markedAsVersion: (group!==version.versionGroup),
                                    selected: (opts.data.currentVersion == version.version),
                                    canRestore: this.appOptions.canHistoryRestore && (ver < versions.length-1),
                                    isExpanded: true,
                                    serverVersion: version.serverVersion,
                                    fileType: 'pptx'
                                }));
                                if (opts.data.currentVersion == version.version) {
                                    currentVersion = arrVersions[arrVersions.length-1];
                                }
                                group = version.versionGroup;
                                if (prev_ver!==version.version) {
                                    prev_ver = version.version;
                                    arrColors.reverse();
                                    for (i=0; i<arrColors.length; i++) {
                                        arrVersions[arrVersions.length-i-2].set('arrColors',arrColors);
                                    }
                                    arrColors = [];
                                }
                                arrColors.push(user.get('colorval'));

                                var changes = version.changes, change, i;
                                if (changes && changes.length>0) {
                                    arrVersions[arrVersions.length-1].set('docIdPrev', docIdPrev);
                                    if (!_.isEmpty(version.serverVersion) && version.serverVersion == this.appOptions.buildVersion) {
                                        arrVersions[arrVersions.length-1].set('changeid', changes.length-1);
                                        arrVersions[arrVersions.length-1].set('hasChanges', changes.length>1);
                                        for (i=changes.length-2; i>=0; i--) {
                                            change = changes[i];

                                            user = usersStore.findUser(change.user.id);
                                            if (!user) {
                                                user = new Common.Models.User({
                                                    id          : change.user.id,
                                                    username    : change.user.name,
                                                    colorval    : Asc.c_oAscArrUserColors[usersCnt],
                                                    color       : this.generateUserColor(Asc.c_oAscArrUserColors[usersCnt++])
                                                });
                                                usersStore.add(user);
                                            }
                                            avatar = Common.UI.ExternalUsers.getImage(change.user.id);
                                            (avatar===undefined) && arrIds.push(change.user.id);
                                            arrVersions.push(new Common.Models.HistoryVersion({
                                                version: version.versionGroup,
                                                revision: version.version,
                                                changeid: i,
                                                userid : change.user.id,
                                                username : change.user.name,
                                                usercolor: user.get('color'),
                                                initials : Common.Utils.getUserInitials(AscCommon.UserInfoParser.getParsedName(change.user.name || this.textAnonymous)),
                                                avatar : avatar,
                                                created: change.created,
                                                docId: version.key,
                                                docIdPrev: docIdPrev,
                                                selected: false,
                                                canRestore: this.appOptions.canHistoryRestore && this.appOptions.canDownload,
                                                isRevision: false,
                                                isVisible: true,
                                                serverVersion: version.serverVersion,
                                                fileType: 'pptx'
                                            }));
                                            arrColors.push(user.get('colorval'));
                                        }
                                    }
                                } else if (ver==0 && versions.length==1) {
                                    arrVersions[arrVersions.length-1].set('docId', version.key + '1');
                                }
                            }
                        }
                        if (arrColors.length>0) {
                            arrColors.reverse();
                            for (i=0; i<arrColors.length; i++) {
                                arrVersions[arrVersions.length-i-1].set('arrColors',arrColors);
                            }
                            arrColors = [];
                        }
                        historyStore.reset(arrVersions);
                        if (currentVersion===null && historyStore.size()>0) {
                            currentVersion = historyStore.at(0);
                            currentVersion.set('selected', true);
                        }
                        if (currentVersion)
                            this.getApplication().getController('Common.Controllers.History').onSelectRevision(null, null, currentVersion);
                        arrIds.length && Common.UI.ExternalUsers.get('info', arrIds);
                    }
                }
            },

            DisableVersionHistory: function() {
                this.editorConfig.canUseHistory = false;
                this.appOptions.canUseHistory = false;
            },

            generateUserColor: function(color) {
                return"#"+("000000"+color.toString(16)).substr(-6);
            },

            onGrabFocus: function() {
                this.getApplication().getController('DocumentHolder').getView().focus();
            },

            onConvertEquationToMath: function(equation) {
                var me = this,
                    win;
                var msg = this.textConvertEquation + '<br><br><a id="id-equation-convert-help" style="cursor: pointer;">' + this.textLearnMore + '</a>';
                win = Common.UI.warning({
                    width: 500,
                    msg: msg,
                    buttons: ['yes', 'cancel'],
                    primary: 'yes',
                    dontshow: true,
                    textDontShow: this.textApplyAll,
                    callback: _.bind(function(btn, dontshow){
                        if (btn == 'yes') {
                            this.api.asc_ConvertEquationToMath(equation, dontshow);
                        }
                        this.onEditComplete();
                    }, this)
                });
                win.$window.find('#id-equation-convert-help').on('click', function (e) {
                    win && win.close();
                    me.getApplication().getController('LeftMenu').getView('LeftMenu').showMenu('file:help', 'UsageInstructions\/InsertEquation.htm#convertequation');
                })
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

            // Translation
            leavePageText: 'You have unsaved changes in this document. Click \'Stay on this Page\' then \'Save\' to save them. Click \'Leave this Page\' to discard all the unsaved changes.',
            criticalErrorTitle: 'Error',
            notcriticalErrorTitle: 'Warning',
            errorDefaultMessage: 'Error code: %1',
            criticalErrorExtText: 'Press "OK" to to back to document list.',
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
            uploadImageSizeMessage: 'Maximium image size limit exceeded.',
            uploadImageExtMessage: 'Unknown image format.',
            uploadImageFileCountMessage: 'No images uploaded.',
            reloadButtonText: 'Reload Page',
            unknownErrorText: 'Unknown error.',
            convertationTimeoutText: 'Convertation timeout exceeded.',
            downloadErrorText: 'Download failed.',
            unsupportedBrowserErrorText: 'Your browser is not supported.',
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
            errorFilePassProtect: 'The file is password protected and cannot be opened.',
            textAnonymous: 'Anonymous',
            txtNeedSynchronize: 'You have an updates',
            applyChangesTitleText: 'Loading Data',
            applyChangesTextText: 'Loading data...',
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
            errorConnectToServer: ' The document could not be saved. Please check connection settings or contact your administrator.<br>When you click the \'OK\' button, you will be prompted to download the document.',
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
            errorBadImageUrl: 'Image url is incorrect',
            txtSlideText: 'Slide text',
            txtClipArt: 'Clip Art',
            txtDiagram: 'SmartArt',
            txtDateTime: 'Date and time',
            txtFooter: 'Footer',
            txtHeader: 'Header',
            txtMedia: 'Media',
            txtPicture: 'Picture',
            txtImage: 'Image',
            txtSlideNumber: 'Slide number',
            txtSlideSubtitle: 'Slide subtitle',
            txtSlideTitle: 'Slide title',
            textChangesSaved: 'All changes saved',
            saveTitleText: 'Saving Document',
            saveTextText: 'Saving document...',
            txtLoading: 'Loading...',
            txtAddNotes: 'Click to add notes',
            errorForceSave: "An error occurred while saving the file. Please use the 'Download as' option to save the file to your computer hard drive or try again later.",
            txtAddFirstSlide: 'Click to add first slide',
            txtTheme_blank: 'Blank',
            txtTheme_pixel: 'Pixel',
            txtTheme_classic: 'Classic',
            txtTheme_official: 'Official',
            txtTheme_green: 'Green',
            txtTheme_lines: 'Lines',
            txtTheme_office: 'Office',
            txtTheme_safari: 'Safari',
            txtTheme_dotted: 'Dotted',
            txtTheme_corner: 'Corner',
            txtTheme_turtle: 'Turtle',
            txtTheme_basic: 'Basic',
            txtTheme_green_leaf: 'Green leaf',
            txtTheme_office_theme: 'Office Theme',
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
            txtShape_textRect: 'Text Box',
            txtShape_rect: 'Rectangle',
            txtShape_ellipse: 'Ellipse',
            txtShape_triangle: 'Triangle',
            txtShape_rtTriangle: 'Right Triangle',
            txtShape_parallelogram: 'Parallelogram',
            txtShape_trapezoid: 'Trapezoid',
            txtShape_diamond: 'Diamond',
            txtShape_pentagon: 'Pentagon',
            txtShape_hexagon: 'Hexagon',
            txtShape_heptagon: 'Heptagon',
            txtShape_octagon: 'Octagon',
            txtShape_decagon: 'Decagon',
            txtShape_dodecagon: 'Dodecagon',
            txtShape_pie: 'Pie',
            txtShape_chord: 'Chord',
            txtShape_teardrop: 'Teardrop',
            txtShape_frame: 'Frame',
            txtShape_halfFrame: 'Half Frame',
            txtShape_corner: 'Corner',
            txtShape_diagStripe: 'Diagonal Stripe',
            txtShape_plus: 'Plus',
            txtShape_plaque: 'Sign',
            txtShape_can: 'Can',
            txtShape_cube: 'Cube',
            txtShape_bevel: 'Bevel',
            txtShape_donut: 'Donut',
            txtShape_noSmoking: '"No" Symbol',
            txtShape_blockArc: 'Block Arc',
            txtShape_foldedCorner: 'Folded Corner',
            txtShape_smileyFace: 'Smiley Face',
            txtShape_heart: 'Heart',
            txtShape_lightningBolt: 'Lightning Bolt',
            txtShape_sun: 'Sun',
            txtShape_moon: 'Moon',
            txtShape_cloud: 'Cloud',
            txtShape_arc: 'Arc',
            txtShape_bracePair: 'Double Brace',
            txtShape_leftBracket: 'Left Bracket',
            txtShape_rightBracket: 'Right Bracket',
            txtShape_leftBrace: 'Left Brace',
            txtShape_rightBrace: 'Right Brace',
            txtShape_rightArrow: 'Right Arrow',
            txtShape_leftArrow: 'Left Arrow',
            txtShape_upArrow: 'Up Arrow',
            txtShape_downArrow: 'Down Arrow',
            txtShape_leftRightArrow: 'Left Right Arrow',
            txtShape_upDownArrow: 'Up Down Arrow',
            txtShape_quadArrow: 'Quad Arrow',
            txtShape_leftRightUpArrow: 'Left Right Up Arrow',
            txtShape_bentArrow: 'Bent Arrow',
            txtShape_uturnArrow: 'U-Turn Arrow',
            txtShape_leftUpArrow: 'Left Up Arrow',
            txtShape_bentUpArrow: 'Bent Up Arrow',
            txtShape_curvedRightArrow: 'Curved Right Arrow',
            txtShape_curvedLeftArrow: 'Curved Left Arrow',
            txtShape_curvedUpArrow: 'Curved Up Arrow',
            txtShape_curvedDownArrow: 'Curved Down Arrow',
            txtShape_stripedRightArrow: 'Striped Right Arrow',
            txtShape_notchedRightArrow: 'Notched Right Arrow',
            txtShape_homePlate: 'Pentagon',
            txtShape_chevron: 'Chevron',
            txtShape_rightArrowCallout: 'Right Arrow Callout',
            txtShape_downArrowCallout: 'Down Arrow Callout',
            txtShape_leftArrowCallout: 'Left Arrow Callout',
            txtShape_upArrowCallout: 'Up Arrow Callout',
            txtShape_leftRightArrowCallout: 'Left Right Arrow Callout',
            txtShape_quadArrowCallout: 'Quad Arrow Callout',
            txtShape_circularArrow: 'Circular Arrow',
            txtShape_mathPlus: 'Plus',
            txtShape_mathMinus: 'Minus',
            txtShape_mathMultiply: 'Multiply',
            txtShape_mathDivide: 'Division',
            txtShape_mathEqual: 'Equal',
            txtShape_mathNotEqual: 'Not Equal',
            txtShape_flowChartProcess: 'Flowchart: Process',
            txtShape_flowChartAlternateProcess: 'Flowchart: Alternate Process',
            txtShape_flowChartDecision: 'Flowchart: Decision',
            txtShape_flowChartInputOutput: 'Flowchart: Data',
            txtShape_flowChartPredefinedProcess: 'Flowchart: Predefined Process',
            txtShape_flowChartInternalStorage: 'Flowchart: Internal Storage',
            txtShape_flowChartDocument: 'Flowchart: Document',
            txtShape_flowChartMultidocument: 'Flowchart: Multidocument ',
            txtShape_flowChartTerminator: 'Flowchart: Terminator',
            txtShape_flowChartPreparation: 'Flowchart: Preparation',
            txtShape_flowChartManualInput: 'Flowchart: Manual Input',
            txtShape_flowChartManualOperation: 'Flowchart: Manual Operation',
            txtShape_flowChartConnector: 'Flowchart: Connector',
            txtShape_flowChartOffpageConnector: 'Flowchart: Off-page Connector',
            txtShape_flowChartPunchedCard: 'Flowchart: Card',
            txtShape_flowChartPunchedTape: 'Flowchart: Punched Tape',
            txtShape_flowChartSummingJunction: 'Flowchart: Summing Junction',
            txtShape_flowChartOr: 'Flowchart: Or',
            txtShape_flowChartCollate: 'Flowchart: Collate',
            txtShape_flowChartSort: 'Flowchart: Sort',
            txtShape_flowChartExtract: 'Flowchart: Extract',
            txtShape_flowChartMerge: 'Flowchart: Merge',
            txtShape_flowChartOnlineStorage: 'Flowchart: Stored Data',
            txtShape_flowChartDelay: 'Flowchart: Delay',
            txtShape_flowChartMagneticTape: 'Flowchart: Sequential Access Storage',
            txtShape_flowChartMagneticDisk: 'Flowchart: Magnetic Disk',
            txtShape_flowChartMagneticDrum: 'Flowchart: Direct Access Storage',
            txtShape_flowChartDisplay: 'Flowchart: Display',
            txtShape_irregularSeal1: 'Explosion 1',
            txtShape_irregularSeal2: 'Explosion 2',
            txtShape_star4: '4-Point Star',
            txtShape_star5: '5-Point Star',
            txtShape_star6: '6-Point Star',
            txtShape_star7: '7-Point Star',
            txtShape_star8: '8-Point Star',
            txtShape_star10: '10-Point Star',
            txtShape_star12: '12-Point Star',
            txtShape_star16: '16-Point Star',
            txtShape_star24: '24-Point Star',
            txtShape_star32: '32-Point Star',
            txtShape_ribbon2: 'Up Ribbon',
            txtShape_ribbon: 'Down Ribbon',
            txtShape_ellipseRibbon2: 'Curved Up Ribbon',
            txtShape_ellipseRibbon: 'Curved Down Ribbon',
            txtShape_verticalScroll: 'Vertical Scroll',
            txtShape_horizontalScroll: 'Horizontal Scroll',
            txtShape_wave: 'Wave',
            txtShape_doubleWave: 'Double Wave',
            txtShape_wedgeRectCallout: 'Rectangular Callout',
            txtShape_wedgeRoundRectCallout: 'Rounded Rectangular Callout',
            txtShape_wedgeEllipseCallout: 'Oval Callout',
            txtShape_cloudCallout: 'Cloud Callout',
            txtShape_borderCallout1: 'Line Callout 1',
            txtShape_borderCallout2: 'Line Callout 2',
            txtShape_borderCallout3: 'Line Callout 3',
            txtShape_accentCallout1: 'Line Callout 1 (Accent Bar)',
            txtShape_accentCallout2: 'Line Callout 2 (Accent Bar)',
            txtShape_accentCallout3: 'Line Callout 3 (Accent Bar)',
            txtShape_callout1: 'Line Callout 1 (No Border)',
            txtShape_callout2: 'Line Callout 2 (No Border)',
            txtShape_callout3: 'Line Callout 3 (No Border)',
            txtShape_accentBorderCallout1: 'Line Callout 1 (Border and Accent Bar)',
            txtShape_accentBorderCallout2: 'Line Callout 2 (Border and Accent Bar)',
            txtShape_accentBorderCallout3: 'Line Callout 3 (Border and Accent Bar)',
            txtShape_actionButtonBackPrevious: 'Back or Previous Button',
            txtShape_actionButtonForwardNext: 'Forward or Next Button',
            txtShape_actionButtonBeginning: 'Beginning Button',
            txtShape_actionButtonEnd: 'End Button',
            txtShape_actionButtonHome: 'Home Button',
            txtShape_actionButtonInformation: 'Information Button',
            txtShape_actionButtonReturn: 'Return Button',
            txtShape_actionButtonMovie: 'Movie Button',
            txtShape_actionButtonDocument: 'Document Button',
            txtShape_actionButtonSound: 'Sound Button',
            txtShape_actionButtonHelp: 'Help Button',
            txtShape_actionButtonBlank: 'Blank Button',
            txtShape_roundRect: 'Round Corner Rectangle',
            txtShape_snip1Rect: 'Snip Single Corner Rectangle',
            txtShape_snip2SameRect: 'Snip Same Side Corner Rectangle',
            txtShape_snip2DiagRect: 'Snip Diagonal Corner Rectangle',
            txtShape_snipRoundRect: 'Snip and Round Single Corner Rectangle',
            txtShape_round1Rect: 'Round Single Corner Rectangle',
            txtShape_round2SameRect: 'Round Same Side Corner Rectangle',
            txtShape_round2DiagRect: 'Round Diagonal Corner Rectangle',
            txtShape_line: 'Line',
            txtShape_lineWithArrow: 'Arrow',
            txtShape_lineWithTwoArrows: 'Double Arrow',
            txtShape_bentConnector5: 'Elbow Connector',
            txtShape_bentConnector5WithArrow: 'Elbow Arrow Connector',
            txtShape_bentConnector5WithTwoArrows: 'Elbow Double-Arrow Connector',
            txtShape_curvedConnector3: 'Curved Connector',
            txtShape_curvedConnector3WithArrow: 'Curved Arrow Connector',
            txtShape_curvedConnector3WithTwoArrows: 'Curved Double-Arrow Connector',
            txtShape_spline: 'Curve',
            txtShape_polyline1: 'Scribble',
            txtShape_polyline2: 'Freeform',
            errorEmailClient: 'No email client could be found',
            textCustomLoader: 'Please note that according to the terms of the license you are not entitled to change the loader.<br>Please contact our Sales Department to get a quote.',
            waitText: 'Please, wait...',
            errorFileSizeExceed: 'The file size exceeds the limitation set for your server.<br>Please contact your Document Server administrator for details.',
            errorUpdateVersionOnDisconnect: 'Internet connection has been restored, and the file version has been changed.<br>Before you can continue working, you need to download the file or copy its content to make sure nothing is lost, and then reload this page.',
            textHasMacros: 'The file contains automatic macros.<br>Do you want to run macros?',
            textRemember: 'Remember my choice',
            warnLicenseLimitedRenewed: 'License needs to be renewed.<br>You have a limited access to document editing functionality.<br>Please contact your administrator to get full access',
            warnLicenseLimitedNoAccess: 'License expired.<br>You have no access to document editing functionality.<br>Please contact your administrator.',
            saveErrorTextDesktop: 'This file cannot be saved or created.<br>Possible reasons are: <br>1. The file is read-only. <br>2. The file is being edited by other users. <br>3. The disk is full or corrupted.',
            errorComboSeries: 'To create a combination chart, select at least two series of data.',
            errorSetPassword: 'Password could not be set.',
            textRenameLabel: 'Enter a name to be used for collaboration',
            textRenameError: 'User name must not be empty.',
            textLongName: 'Enter a name that is less than 128 characters.',
            textGuest: 'Guest',
            errorLang: 'The interface language is not loaded.<br>Please contact your Document Server administrator.',
            txtErrorLoadHistory: 'Loading history failed',
            leavePageTextOnClose: 'All unsaved changes in this document will be lost.<br> Click \'Cancel\' then \'Save\' to save them. Click \'OK\' to discard all the unsaved changes.',
            textTryUndoRedoWarn: 'The Undo/Redo functions are disabled for the Fast co-editing mode.',
            txtNone: 'None',
            textDisconnect: 'Connection is lost',
            errorLoadingFont: 'Fonts are not loaded.<br>Please contact your Document Server administrator.',
            textConvertEquation: 'This equation was created with an old version of equation editor which is no longer supported. Converting this equation to Office Math ML format will make it editable.<br>Do you want to convert this equation?',
            textApplyAll: 'Apply to all equations',
            textLearnMore: 'Learn More',
            textReconnect: 'Connection is restored',
            textRequestMacros: 'A macro makes a request to URL. Do you want to allow the request to the %1?',
            textRememberMacros: 'Remember my choice for all macros',
            confirmMaxChangesSize: 'The size of actions exceeds the limitation set for your server.<br>Press "Undo" to cancel your last action or press "Continue" to keep action locally (you need to download the file or copy its content to make sure nothing is lost).',
            textUndo: 'Undo',
            textContinue: 'Continue',
            errorInconsistentExtDocx: 'An error has occurred while opening the file.<br>The file content corresponds to text documents (e.g. docx), but the file has the inconsistent extension: %1.',
            errorInconsistentExtXlsx: 'An error has occurred while opening the file.<br>The file content corresponds to spreadsheets (e.g. xlsx), but the file has the inconsistent extension: %1.',
            errorInconsistentExtPptx: 'An error has occurred while opening the file.<br>The file content corresponds to presentations (e.g. pptx), but the file has the inconsistent extension: %1.',
            errorInconsistentExtPdf: 'An error has occurred while opening the file.<br>The file content corresponds to one of the following formats: pdf/djvu/xps/oxps, but the file has the inconsistent extension: %1.',
            errorInconsistentExt: 'An error has occurred while opening the file.<br>The file content does not match the file extension.',
            errorCannotPasteImg: 'We can\'t paste this image from the Clipboard, but you can save it to your device and \ninsert it from there, or you can copy the image without text and paste it into the presentation.',
            textTryQuickPrint: 'You have selected Quick print: the entire document will be printed on the last selected or default printer.<br>Do you want to continue?',
            textText: 'Text',
            warnLicenseBefore: 'License not active.<br>Please contact your administrator.',
            titleLicenseNotActive: 'License not active',
            warnLicenseAnonymous: 'Access denied for anonymous users. This document will be opened for viewing only.',
            textObject: 'Object'
        }
    })(), PE.Controllers.Main || {}))
});
