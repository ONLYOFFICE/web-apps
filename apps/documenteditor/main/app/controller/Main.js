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
 *
 *  Main controller
 *
 *  Created by Alexander Yuzhin on 1/15/14
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
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
    'documenteditor/main/app/collection/ShapeGroups',
    'documenteditor/main/app/collection/EquationGroups'
], function () {
    'use strict';

    DE.Controllers.Main = Backbone.Controller.extend(_.extend((function() {
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

        Common.localStorage.setId('text');
        Common.localStorage.setKeysFilter('de-,asc.text');
        Common.localStorage.sync();

        return {

            models: [],
            collections: [
                'ShapeGroups',
                'EquationGroups',
                'Common.Collections.HistoryUsers',
                'Common.Collections.TextArt'
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
                    styleNames = ['Normal', 'No Spacing', 'Heading 1', 'Heading 2', 'Heading 3', 'Heading 4', 'Heading 5',
                                  'Heading 6', 'Heading 7', 'Heading 8', 'Heading 9', 'Title', 'Subtitle', 'Quote', 'Intense Quote', 'List Paragraph', 'footnote text',
                                  'Caption', 'endnote text'],
                translate = {
                    'Series': this.txtSeries,
                    'Diagram Title': this.txtDiagramTitle,
                    'X Axis': this.txtXAxis,
                    'Y Axis': this.txtYAxis,
                    'Your text here': this.txtArt,
                    "Error! Bookmark not defined.": this.txtBookmarkError,
                    "above": this.txtAbove,
                    "below": this.txtBelow,
                    "on page ": this.txtOnPage + " ",
                    "Header": this.txtHeader,
                    "Footer": this.txtFooter,
                    " -Section ": " " + this.txtSection + " ",
                    "First Page ": this.txtFirstPage + " ",
                    "Even Page ": this.txtEvenPage + " ",
                    "Odd Page ": this.txtOddPage + " ",
                    "Same as Previous": this.txtSameAsPrev,
                    "Current Document": this.txtCurrentDocument,
                    "No table of contents entries found.": this.txtNoTableOfContents,
                    "Table of Contents": this.txtTableOfContents,
                    "Syntax Error": this.txtSyntaxError,
                    "Missing Operator": this.txtMissOperator,
                    "Missing Argument": this.txtMissArg,
                    "Number Too Large To Format": this.txtTooLarge,
                    "Zero Divide": this.txtZeroDivide,
                    "Is Not In Table": this.txtNotInTable,
                    "Index Too Large": this.txtIndTooLarge,
                    "The Formula Not In Table": this.txtFormulaNotInTable,
                    "Table Index Cannot be Zero": this.txtTableInd,
                    "Undefined Bookmark": this.txtUndefBookmark,
                    "Unexpected End of Formula": this.txtEndOfFormula,
                    "Hyperlink": this.txtHyperlink,
                    "Error! Main Document Only.": this.txtMainDocOnly,
                    "Error! Not a valid bookmark self-reference.": this.txtNotValidBookmark,
                    "Error! No text of specified style in document.": this.txtNoText,
                    "Choose an item": this.txtChoose,
                    "Enter a date": this.txtEnterDate,
                    "Type equation here": this.txtTypeEquation,
                    "Click to load image": this.txtClickToLoad,
                    "None": this.txtNone,
                    "No table of figures entries found.": this.txtNoTableOfFigures,
                    "table of figures": this.txtTableOfFigures,
                    "TOC Heading": this.txtTOCHeading
                };
                styleNames.forEach(function(item){
                    translate[item] = me['txtStyle_' + item.replace(/ /g, '_')] || item;
                });
                me.translationTable = translate;
            },

            onLaunch: function() {
                var me = this;

                this.stackLongActions = new Common.IrregularStack({
                    strongCompare   : function(obj1, obj2){return obj1.id === obj2.id && obj1.type === obj2.type;},
                    weakCompare     : function(obj1, obj2){return obj1.type === obj2.type;}
                });

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
                Common.UI.Themes.init(this.api);

                if (this.api){
                    this.api.SetDrawingFreeze(true);

                    var value = Common.localStorage.getBool("de-settings-cachemode", true);
                    Common.Utils.InternalSettings.set("de-settings-cachemode", value);
                    this.api.asc_setDefaultBlitMode(!!value);

                    value = Common.localStorage.getItem("de-settings-fontrender");
                    if (value === null)
                        value = '0';
                    Common.Utils.InternalSettings.set("de-settings-fontrender", value);
                    switch (value) {
                        case '0': this.api.SetFontRenderingMode(3); break;
                        case '1': this.api.SetFontRenderingMode(1); break;
                        case '2': this.api.SetFontRenderingMode(2); break;
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
                    this.api.asc_registerCallback('asc_onSpellCheckInit',           _.bind(this.loadLanguages, this));

                    Common.NotificationCenter.on('api:disconnect',                  _.bind(this.onCoAuthoringDisconnect, this));
                    Common.NotificationCenter.on('goback',                          _.bind(this.goBack, this));
                    Common.NotificationCenter.on('markfavorite',                    _.bind(this.markFavorite, this));
                    Common.NotificationCenter.on('download:advanced',               _.bind(this.onAdvancedOptions, this));
                    Common.NotificationCenter.on('showmessage',                     _.bind(this.onExternalMessage, this));
                    Common.NotificationCenter.on('showerror',                       _.bind(this.onError, this));


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
                                target.closest('.ribtab').length>0 || target.closest('.combo-dataview').length>0) {
                                event.preventDefault();
                            }
                        }
                    }).on('mouseup', function(e){
                        me.beforeCloseDummyComment && setTimeout(function(){ // textbox in dummy comment lost focus
                            me.dontCloseDummyComment = me.beforeCloseDummyComment = false;
                        }, 10);
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

                    this.initNames(); //for shapes

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
                this.editorConfig.user          =
                this.appOptions.user            = Common.Utils.fillUserInfo(this.editorConfig.user, this.editorConfig.lang, value ? (value + ' (' + this.appOptions.guestName + ')' ) : this.textAnonymous,
                                                                            Common.localStorage.getItem("guest-id") || ('uid-' + Date.now()));
                this.appOptions.user.anonymous && Common.localStorage.setItem("guest-id", this.appOptions.user.id);

                this.appOptions.isDesktopApp    = this.editorConfig.targetApp == 'desktop';
                this.appOptions.canCreateNew    = this.editorConfig.canRequestCreateNew || !_.isEmpty(this.editorConfig.createUrl);
                this.appOptions.canOpenRecent   = this.editorConfig.recent !== undefined && !this.appOptions.isDesktopApp;
                this.appOptions.templates       = this.editorConfig.templates;
                this.appOptions.recent          = this.editorConfig.recent;
                this.appOptions.createUrl       = this.editorConfig.createUrl;
                this.appOptions.canRequestCreateNew = this.editorConfig.canRequestCreateNew;
                this.appOptions.lang            = this.editorConfig.lang;
                this.appOptions.location        = (typeof (this.editorConfig.location) == 'string') ? this.editorConfig.location.toLowerCase() : '';
                this.appOptions.sharingSettingsUrl = this.editorConfig.sharingSettingsUrl;
                this.appOptions.fileChoiceUrl   = this.editorConfig.fileChoiceUrl;
                this.appOptions.mergeFolderUrl  = this.editorConfig.mergeFolderUrl;
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
                this.appOptions.canRequestCompareFile = this.editorConfig.canRequestCompareFile;
                this.appOptions.canRequestMailMergeRecipients = this.editorConfig.canRequestMailMergeRecipients;
                this.appOptions.canRequestSharingSettings = this.editorConfig.canRequestSharingSettings;
                this.appOptions.compatibleFeatures = (typeof (this.appOptions.customization) == 'object') && !!this.appOptions.customization.compatibleFeatures;
                this.appOptions.canFeatureComparison = !!this.api.asc_isSupportFeature("comparison");
                this.appOptions.canFeatureContentControl = !!this.api.asc_isSupportFeature("content-controls");
                this.appOptions.canFeatureForms = false;
                this.appOptions.mentionShare = !((typeof (this.appOptions.customization) == 'object') && (this.appOptions.customization.mentionShare==false));

                this.appOptions.user.guest && this.appOptions.canRenameAnonymous && Common.NotificationCenter.on('user:rename', _.bind(this.showRenameUserDialog, this));

                appHeader = this.getApplication().getController('Viewport').getView('Common.Views.Header');
                appHeader.setCanBack(this.appOptions.canBackToFolder === true, (this.appOptions.canBackToFolder) ? this.editorConfig.customization.goback.text : '');

                if (this.editorConfig.lang)
                    this.api.asc_setLocale(this.editorConfig.lang);

                if (this.appOptions.location == 'us' || this.appOptions.location == 'ca')
                    Common.Utils.Metric.setDefaultMetric(Common.Utils.Metric.c_MetricUnits.inch);

                value = Common.localStorage.getItem("de-macros-mode");
                if (value === null) {
                    value = this.editorConfig.customization ? this.editorConfig.customization.macrosMode : 'warn';
                    value = (value == 'enable') ? 1 : (value == 'disable' ? 2 : 0);
                } else
                    value = parseInt(value);
                Common.Utils.InternalSettings.set("de-macros-mode", value);

                this.appOptions.wopi = this.editorConfig.wopi;

                Common.Controllers.Desktop.init(this.appOptions);
            },

            loadDocument: function(data) {
                this.permissions = {};
                this.document = data.doc;

                var docInfo = {};

                if (data.doc) {
                    this.permissions = $.extend(this.permissions, data.doc.permissions);

                    var _permissions = $.extend({}, data.doc.permissions),
                        _options = $.extend({}, data.doc.options, this.editorConfig.actionLink || {});

                    var _user = new Asc.asc_CUserInfo();
                    _user.put_Id(this.appOptions.user.id);
                    _user.put_FullName(this.appOptions.user.fullname);
                    _user.put_IsAnonymousUser(!!this.appOptions.user.anonymous);

                    docInfo = new Asc.asc_CDocInfo();
                    docInfo.put_Id(data.doc.key);
                    docInfo.put_Url(data.doc.url);
                    docInfo.put_Title(data.doc.title);
                    docInfo.put_Format(data.doc.fileType);
                    docInfo.put_VKey(data.doc.vkey);
                    docInfo.put_Options(_options);
                    docInfo.put_UserInfo(_user);
                    docInfo.put_CallbackUrl(this.editorConfig.callbackUrl);
                    docInfo.put_Token(data.doc.token);
                    docInfo.put_Permissions(_permissions);
                    docInfo.put_EncryptedInfo(this.editorConfig.encryptionKeys);

                    var enable = !this.editorConfig.customization || (this.editorConfig.customization.macros!==false);
                    docInfo.asc_putIsEnabledMacroses(!!enable);
                    enable = !this.editorConfig.customization || (this.editorConfig.customization.plugins!==false);
                    docInfo.asc_putIsEnabledPlugins(!!enable);
//                    docInfo.put_Review(this.permissions.review);

                    var type = /^(?:(pdf|djvu|xps))$/.exec(data.doc.fileType);
                    if (type && typeof type[1] === 'string') {
                        this.permissions.edit = this.permissions.review = false;
                    }
                }

                if (!( this.editorConfig.customization && ( this.editorConfig.customization.toolbarNoTabs ||
                    (this.editorConfig.targetApp!=='desktop') && (this.editorConfig.customization.loaderName || this.editorConfig.customization.loaderLogo)))) {
                    $('#editor-container').css('overflow', 'hidden');
                    $('#editor-container').append('<div class="doc-placeholder">' + '<div class="line"></div>'.repeat(20) + '</div>');
                    if (this.editorConfig.mode == 'view' || (this.permissions.edit === false && !this.permissions.review ))
                        $('#editor-container').find('.doc-placeholder').css('margin-top', 19);
                }

                this.api.asc_registerCallback('asc_onGetEditorPermissions', _.bind(this.onEditorPermissions, this));
                this.api.asc_registerCallback('asc_onLicenseChanged',       _.bind(this.onLicenseChanged, this));
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
                if ( !this.appOptions.canDownload && !this.appOptions.canDownloadOrigin) {
                    Common.Gateway.reportError(Asc.c_oAscError.ID.AccessDeny, this.errorAccessDeny);
                    return;
                }

                this._state.isFromGatewayDownloadAs = true;
                var type = /^(?:(pdf|djvu|xps))$/.exec(this.document.fileType);
                if (type && typeof type[1] === 'string')
                    this.api.asc_DownloadOrigin(true);
                else {
                    var _format = (format && (typeof format == 'string')) ? Asc.c_oAscFileType[ format.toUpperCase() ] : null,
                        _supported = [
                            Asc.c_oAscFileType.TXT,
                            Asc.c_oAscFileType.ODT,
                            Asc.c_oAscFileType.DOCX,
                            Asc.c_oAscFileType.HTML,
                            Asc.c_oAscFileType.PDF,
                            Asc.c_oAscFileType.PDFA,
                            Asc.c_oAscFileType.DOTX,
                            Asc.c_oAscFileType.OTT,
                            Asc.c_oAscFileType.FB2,
                            Asc.c_oAscFileType.EPUB
                        ];

                    if ( !_format || _supported.indexOf(_format) < 0 )
                        _format = Asc.c_oAscFileType.DOCX;
                    this.api.asc_DownloadAs(new Asc.asc_CDownloadOptions(_format, true));
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
                    this.getApplication().getController('LeftMenu').getView('LeftMenu').showHistory();
                    this.disableEditing(true);
                    this._renameDialog && this._renameDialog.close();
                    var versions = opts.data.history,
                        historyStore = this.getApplication().getCollection('Common.Collections.HistoryVersions'),
                        currentVersion = null;
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
                                        username    : version.user.name || this.textAnonymous,
                                        colorval    : Asc.c_oAscArrUserColors[usersCnt],
                                        color       : this.generateUserColor(Asc.c_oAscArrUserColors[usersCnt++])
                                    });
                                    usersStore.add(user);
                                }

                                arrVersions.push(new Common.Models.HistoryVersion({
                                    version: version.versionGroup,
                                    revision: version.version,
                                    userid : version.user.id,
                                    username : version.user.name || this.textAnonymous,
                                    usercolor: user.get('color'),
                                    created: version.created,
                                    docId: version.key,
                                    markedAsVersion: (group!==version.versionGroup),
                                    selected: (opts.data.currentVersion == version.version),
                                    canRestore: this.appOptions.canHistoryRestore && (ver < versions.length-1),
                                    isExpanded: true,
                                    serverVersion: version.serverVersion,
                                    fileType: 'docx'
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
                                                    username    : change.user.name || this.textAnonymous,
                                                    colorval    : Asc.c_oAscArrUserColors[usersCnt],
                                                    color       : this.generateUserColor(Asc.c_oAscArrUserColors[usersCnt++])
                                                });
                                                usersStore.add(user);
                                            }

                                            arrVersions.push(new Common.Models.HistoryVersion({
                                                version: version.versionGroup,
                                                revision: version.version,
                                                changeid: i,
                                                userid : change.user.id,
                                                username : change.user.name || this.textAnonymous,
                                                usercolor: user.get('color'),
                                                created: change.created,
                                                docId: version.key,
                                                docIdPrev: docIdPrev,
                                                selected: false,
                                                canRestore: this.appOptions.canHistoryRestore && this.appOptions.canDownload,
                                                isRevision: false,
                                                isVisible: true,
                                                serverVersion: version.serverVersion,
                                                fileType: 'docx'
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
                    }
                }
            },

            generateUserColor: function(color) {
              return"#"+("000000"+color.toString(16)).substr(-6);
            },


            disableEditing: function(disable) {
                var app = this.getApplication();
                if (this.appOptions.canEdit && this.editorConfig.mode !== 'view') {
                    app.getController('RightMenu').getView('RightMenu').clearSelection();
                    app.getController('RightMenu').SetDisabled(disable, false);
                    app.getController('Statusbar').getView('Statusbar').SetDisabled(disable);
                }
                app.getController('LeftMenu').SetDisabled(disable, true);
                app.getController('Toolbar').DisableToolbar(disable, disable);
                app.getController('Common.Controllers.ReviewChanges').SetDisabled(disable);
                app.getController('Viewport').SetDisabled(disable);
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
//                this.getMainMenu().closeFullScaleMenu();
                var application = this.getApplication(),
                    toolbarController = application.getController('Toolbar'),
                    toolbarView = toolbarController.getView();

                if (this.appOptions.isEdit && toolbarView && (toolbarView.btnInsertShape.pressed || toolbarView.btnInsertText.pressed) &&
                    ( !_.isObject(arguments[1]) || arguments[1].id !== 'tlbtn-insertshape')) { // TODO: Event from api is needed to clear btnInsertShape state
                    if (this.api)
                        this.api.StartAddShape('', false);

                    toolbarView.btnInsertShape.toggle(false, false);
                    toolbarView.btnInsertText.toggle(false, false);
                }
                if (this.appOptions.isEdit && toolbarView && toolbarView.btnHighlightColor.pressed &&
                    ( !_.isObject(arguments[1]) || arguments[1].id !== 'id-toolbar-btn-highlight')) {
                    this.api.SetMarkerFormat(false);
                    toolbarView.btnHighlightColor.toggle(false, false);
                }
                application.getController('DocumentHolder').getView().focus();

                if (this.api && this.appOptions.isEdit && !toolbarView._state.previewmode) {
                    var cansave = this.api.asc_isDocumentCanSave(),
                        forcesave = this.appOptions.forcesave,
                        isSyncButton = (toolbarView.btnCollabChanges.rendered) ? toolbarView.btnCollabChanges.cmpEl.hasClass('notify') : false,
                        isDisabled = !cansave && !isSyncButton && !forcesave || this._state.isDisconnected || this._state.fastCoauth && this._state.usersCount>1 && !forcesave;
                        toolbarView.btnSave.setDisabled(isDisabled);
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

                if (this.appOptions.isEdit && (id==Asc.c_oAscAsyncAction['Save'] || id==Asc.c_oAscAsyncAction['ForceSaveButton']) && (!this._state.fastCoauth || this._state.usersCount<2 ||
                    this.getApplication().getController('Common.Controllers.ReviewChanges').isPreviewChangesMode()))
                    this.synchronizeChanges();
                else if (this.appOptions.isEdit && (id==Asc.c_oAscAsyncAction['Save'] || id==Asc.c_oAscAsyncAction['ForceSaveButton'] || id == Asc.c_oAscAsyncAction['ApplyChanges']) &&
                        this._state.fastCoauth)
                    this.getApplication().getController('Common.Controllers.ReviewChanges').synchronizeChanges();

                if ( id == Asc.c_oAscAsyncAction['Open']) {
                    Common.Utils.InternalSettings.get("de-settings-livecomment") ? this.api.asc_showComments(Common.Utils.InternalSettings.get("de-settings-resolvedcomment")) : this.api.asc_hideComments();
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

                    case Asc.c_oAscAsyncAction['PrepareToSave']:
                        title   = this.savePreparingText;
                        text    = this.savePreparingTitle;
                        break;

                    case Asc.c_oAscAsyncAction['MailMergeLoadFile']:
                        title   = this.mailMergeLoadFileText;
                        text    = this.mailMergeLoadFileTitle;
                        break;

                    case Asc.c_oAscAsyncAction['DownloadMerge']:
                        title   = this.downloadMergeTitle;
                        text    = this.downloadMergeText;
                        break;

                    case Asc.c_oAscAsyncAction['SendMailMerge']:
                        title   = this.sendMergeTitle;
                        text    = this.sendMergeText;
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

                if (this._state.openDlg)
                    this._state.openDlg.close();

                var me = this,
                    value;

                me._isDocReady = true;
                Common.NotificationCenter.trigger('app:ready', this.appOptions);

                me.api.SetDrawingFreeze(false);
                me.hidePreloader();
                me.onLongActionEnd(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);

                Common.Utils.InternalSettings.set("de-settings-datetime-default", Common.localStorage.getItem("de-settings-datetime-default"));

                /** coauthoring begin **/
                this.isLiveCommenting = Common.localStorage.getBool("de-settings-livecomment", true);
                Common.Utils.InternalSettings.set("de-settings-livecomment", this.isLiveCommenting);
                value = Common.localStorage.getBool("de-settings-resolvedcomment");
                Common.Utils.InternalSettings.set("de-settings-resolvedcomment", value);
                this.isLiveCommenting ? this.api.asc_showComments(value) : this.api.asc_hideComments();
                /** coauthoring end **/

                value = Common.localStorage.getItem("de-settings-zoom");
                Common.Utils.InternalSettings.set("de-settings-zoom", value);
                var zf = (value!==null) ? parseInt(value) : (this.appOptions.customization && this.appOptions.customization.zoom ? parseInt(this.appOptions.customization.zoom) : 100);
                (zf == -1) ? this.api.zoomFitToPage() : ((zf == -2) ? this.api.zoomFitToWidth() : this.api.zoom(zf>0 ? zf : 100));

                value = Common.localStorage.getItem("de-show-hiddenchars");
                me.api.put_ShowParaMarks((value!==null) ? eval(value) : false);

                value = Common.localStorage.getItem("de-show-tableline");
                me.api.put_ShowTableEmptyLine((value!==null) ? eval(value) : true);

                value = Common.localStorage.getBool("de-settings-spellcheck", !(this.appOptions.customization && this.appOptions.customization.spellcheck===false));
                Common.Utils.InternalSettings.set("de-settings-spellcheck", value);
                me.api.asc_setSpellCheck(value);

                value = Common.localStorage.getBool("de-settings-compatible", false);
                Common.Utils.InternalSettings.set("de-settings-compatible", value);

                Common.Utils.InternalSettings.set("de-settings-showsnaplines", me.api.get_ShowSnapLines());

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

                appHeader.setDocumentCaption(me.api.asc_getDocumentName());
                me.updateWindowTitle(true);

                value = Common.localStorage.getBool("de-settings-inputmode");
                Common.Utils.InternalSettings.set("de-settings-inputmode", value);
                me.api.SetTextBoxInputMode(value);

                /** coauthoring begin **/
                me._state.fastCoauth = Common.Utils.InternalSettings.get("de-settings-coauthmode");
                me.api.asc_SetFastCollaborative(me._state.fastCoauth);

                value = Common.Utils.InternalSettings.get((me._state.fastCoauth) ? "de-settings-showchanges-fast" : "de-settings-showchanges-strict");
                switch(value) {
                    case 'all': value = Asc.c_oAscCollaborativeMarksShowType.All; break;
                    case 'none': value = Asc.c_oAscCollaborativeMarksShowType.None; break;
                    case 'last': value = Asc.c_oAscCollaborativeMarksShowType.LastChanges; break;
                    default: value = (me._state.fastCoauth) ? Asc.c_oAscCollaborativeMarksShowType.None : Asc.c_oAscCollaborativeMarksShowType.LastChanges;
                }
                me.api.SetCollaborativeMarksShowType(value);
                me.api.asc_setAutoSaveGap(Common.Utils.InternalSettings.get("de-settings-autosave"));
                me.api.asc_SetPerformContentControlActionByClick(me.appOptions.isRestrictedEdit && me.appOptions.canFillForms);

                /** coauthoring end **/

                var application                 = me.getApplication();
                var toolbarController           = application.getController('Toolbar'),
                    statusbarController         = application.getController('Statusbar'),
                    documentHolderController    = application.getController('DocumentHolder'),
                    fontsController             = application.getController('Common.Controllers.Fonts'),
                    rightmenuController         = application.getController('RightMenu'),
                    leftmenuController          = application.getController('LeftMenu'),
                    chatController              = application.getController('Common.Controllers.Chat'),
                    pluginsController           = application.getController('Common.Controllers.Plugins'),
                    navigationController        = application.getController('Navigation');

                leftmenuController.getView('LeftMenu').getMenu('file').loadDocument({doc:me.document});
                leftmenuController.setMode(me.appOptions).createDelayedElements().setApi(me.api);

                navigationController.setApi(me.api).setMode(this.appOptions);

                chatController.setApi(this.api).setMode(this.appOptions);
                application.getController('Common.Controllers.ExternalDiagramEditor').setApi(this.api).loadConfig({config:this.editorConfig, customization: this.editorConfig.customization});
                application.getController('Common.Controllers.ExternalMergeEditor').setApi(this.api).loadConfig({config:this.editorConfig, customization: this.editorConfig.customization});

                pluginsController.setApi(me.api);

                documentHolderController.setApi(me.api);
                documentHolderController.createDelayedElements();
                statusbarController.createDelayedElements();

                leftmenuController.getView('LeftMenu').disableMenu('all',false);

                if (me.appOptions.canBranding)
                    me.getApplication().getController('LeftMenu').leftMenu.getMenu('about').setLicInfo(me.editorConfig.customization);

                documentHolderController.getView().setApi(me.api).on('editcomplete', _.bind(me.onEditComplete, me));

                if (me.appOptions.isEdit) {
                    if (me.appOptions.canForcesave) {// use asc_setIsForceSaveOnUserSave only when customization->forcesave = true
                        me.appOptions.forcesave = Common.localStorage.getBool("de-settings-forcesave", me.appOptions.canForcesave);
                        Common.Utils.InternalSettings.set("de-settings-forcesave", me.appOptions.forcesave);
                        me.api.asc_setIsForceSaveOnUserSave(me.appOptions.forcesave);
                    }

                    value = Common.localStorage.getItem("de-settings-paste-button");
                    if (value===null) value = '1';
                    Common.Utils.InternalSettings.set("de-settings-paste-button", parseInt(value));
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

                            var shapes = me.api.asc_getPropertyEditorShapes();
                            if (shapes)
                                me.fillAutoShapes(shapes[0], shapes[1]);

                            rightmenuController.createDelayedElements();

                            me.updateThemeColors();
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
                    Common.NotificationCenter.trigger('document:ready', 'main');
                    if (me.editorConfig.mode !== 'view') // if want to open editor, but viewer is loaded
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
                Common.Gateway.on('refreshhistory',         _.bind(me.onRefreshHistory, me));
                Common.Gateway.on('downloadas',             _.bind(me.onDownloadAs, me));
                Common.Gateway.on('setfavorite',            _.bind(me.onSetFavorite, me));
                Common.Gateway.on('requestclose',           _.bind(me.onRequestClose, me));

                Common.Gateway.sendInfo({mode:me.appOptions.isEdit?'edit':'view'});

                $(document).on('contextmenu', _.bind(me.onContextMenu, me));
                Common.Gateway.documentReady();

                $('#editor-container').css('overflow', '');
                $('.doc-placeholder').remove();

                this.appOptions.user.guest && this.appOptions.canRenameAnonymous && (Common.Utils.InternalSettings.get("guest-username")===null) && this.showRenameUserDialog();
            },

            onLicenseChanged: function(params) {
                var licType = params.asc_getLicenseType();
                if (licType !== undefined && this.appOptions.canEdit && this.editorConfig.mode !== 'view' &&
                   (licType===Asc.c_oLicenseResult.Connections || licType===Asc.c_oLicenseResult.UsersCount || licType===Asc.c_oLicenseResult.ConnectionsOS || licType===Asc.c_oLicenseResult.UsersCountOS
                   || licType===Asc.c_oLicenseResult.SuccessLimit && (this.appOptions.trialMode & Asc.c_oLicenseMode.Limited) !== 0))
                    this._state.licenseType = licType;

                if (this._isDocReady)
                    this.applyLicense();
            },

            applyLicense: function() {
                if (this._state.licenseType) {
                    var license = this._state.licenseType,
                        buttons = ['ok'],
                        primary = 'ok';
                    if ((this.appOptions.trialMode & Asc.c_oLicenseMode.Limited) !== 0 &&
                        (license===Asc.c_oLicenseResult.SuccessLimit || license===Asc.c_oLicenseResult.ExpiredLimited || this.appOptions.permissionsLicense===Asc.c_oLicenseResult.SuccessLimit)) {
                        (license===Asc.c_oLicenseResult.ExpiredLimited) && this.getApplication().getController('LeftMenu').leftMenu.setLimitMode();// show limited hint
                        license = (license===Asc.c_oLicenseResult.ExpiredLimited) ? this.warnLicenseLimitedNoAccess : this.warnLicenseLimitedRenewed;
                    } else if (license===Asc.c_oLicenseResult.Connections || license===Asc.c_oLicenseResult.UsersCount) {
                        license = (license===Asc.c_oLicenseResult.Connections) ? this.warnLicenseExceeded : this.warnLicenseUsersExceeded;
                    } else {
                        license = (license===Asc.c_oLicenseResult.ConnectionsOS) ? this.warnNoLicense : this.warnNoLicenseUsers;
                        buttons = [{value: 'buynow', caption: this.textBuyNow}, {value: 'contact', caption: this.textContactUs}];
                        primary = 'buynow';
                    }

                    if (this._state.licenseType!==Asc.c_oLicenseResult.SuccessLimit && this.appOptions.isEdit) {
                        this.disableEditing(true);
                        Common.NotificationCenter.trigger('api:disconnect');
                    }

                    var value = Common.localStorage.getItem("de-license-warning");
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
                                Common.localStorage.setItem("de-license-warning", now);
                                if (btn == 'buynow')
                                    window.open('{{PUBLISHER_URL}}', "_blank");
                                else if (btn == 'contact')
                                    window.open('mailto:{{SALES_EMAIL}}', "_blank");
                            }
                        });
                    }
                } else if (!this.appOptions.isDesktopApp && !this.appOptions.canBrandingExt &&
                            this.editorConfig && this.editorConfig.customization && (this.editorConfig.customization.loaderName || this.editorConfig.customization.loaderLogo)) {
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
                if (Asc.c_oLicenseResult.Expired === licType || Asc.c_oLicenseResult.Error === licType || Asc.c_oLicenseResult.ExpiredTrial === licType) {
                    Common.UI.warning({
                        title: this.titleLicenseExp,
                        msg: this.warnLicenseExp,
                        buttons: [],
                        closable: false
                    });
                    return;
                }
                if (Asc.c_oLicenseResult.ExpiredLimited === licType)
                    this._state.licenseType = licType;

                if ( this.onServerVersion(params.asc_getBuildVersion()) || !this.onLanguageLoaded()) return;

                this.permissions.review = (this.permissions.review === undefined) ? (this.permissions.edit !== false) : this.permissions.review;

                if (params.asc_getRights() !== Asc.c_oRights.Edit)
                    this.permissions.edit = this.permissions.review = false;

                this.appOptions.permissionsLicense = licType;
                this.appOptions.canAnalytics   = params.asc_getIsAnalyticsEnable();
                this.appOptions.canLicense     = (licType === Asc.c_oLicenseResult.Success || licType === Asc.c_oLicenseResult.SuccessLimit);
                this.appOptions.isLightVersion = params.asc_getIsLight();
                /** coauthoring begin **/
                this.appOptions.canCoAuthoring = !this.appOptions.isLightVersion;
                /** coauthoring end **/
                this.appOptions.isOffline      = this.api.asc_isOffline();
                this.appOptions.isCrypted      = this.api.asc_isCrypto();
                this.appOptions.isReviewOnly   = this.permissions.review === true && this.permissions.edit === false;
                this.appOptions.canRequestEditRights = this.editorConfig.canRequestEditRights;
                this.appOptions.canEdit        = (this.permissions.edit !== false || this.permissions.review === true) && // can edit or review
                                                 (this.editorConfig.canRequestEditRights || this.editorConfig.mode !== 'view') && // if mode=="view" -> canRequestEditRights must be defined
                                                 (!this.appOptions.isReviewOnly || this.appOptions.canLicense); // if isReviewOnly==true -> canLicense must be true
                this.appOptions.isEdit         = this.appOptions.canLicense && this.appOptions.canEdit && this.editorConfig.mode !== 'view';
                this.appOptions.canReview      = this.permissions.review === true && this.appOptions.canLicense && this.appOptions.isEdit;
                this.appOptions.canViewReview  = true;
                this.appOptions.canUseHistory  = this.appOptions.canLicense && this.editorConfig.canUseHistory && this.appOptions.canCoAuthoring && !this.appOptions.isOffline;
                this.appOptions.canHistoryClose  = this.editorConfig.canHistoryClose;
                this.appOptions.canHistoryRestore= this.editorConfig.canHistoryRestore;
                this.appOptions.canUseMailMerge= this.appOptions.canLicense && this.appOptions.canEdit && !this.appOptions.isOffline;
                this.appOptions.canSendEmailAddresses  = this.appOptions.canLicense && this.editorConfig.canSendEmailAddresses && this.appOptions.canEdit && this.appOptions.canCoAuthoring;
                this.appOptions.canComments    = this.appOptions.canLicense && (this.permissions.comment===undefined ? this.appOptions.isEdit : this.permissions.comment) && (this.editorConfig.mode !== 'view');
                this.appOptions.canComments    = this.appOptions.canComments && !((typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.comments===false);
                this.appOptions.canViewComments = this.appOptions.canComments || !((typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.comments===false);
                this.appOptions.canChat        = this.appOptions.canLicense && !this.appOptions.isOffline && !((typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.chat===false);
                this.appOptions.canEditStyles  = this.appOptions.canLicense && this.appOptions.canEdit;
                this.appOptions.canPrint       = (this.permissions.print !== false);
                this.appOptions.canRename      = this.editorConfig.canRename;
                this.appOptions.buildVersion   = params.asc_getBuildVersion();
                this.appOptions.canForcesave   = this.appOptions.isEdit && !this.appOptions.isOffline && (typeof (this.editorConfig.customization) == 'object' && !!this.editorConfig.customization.forcesave);
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
                this.appOptions.isSignatureSupport= this.appOptions.isEdit && this.appOptions.isDesktopApp && this.appOptions.isOffline && this.api.asc_isSignaturesSupport();
                this.appOptions.isPasswordSupport = this.appOptions.isEdit && this.api.asc_isProtectionSupport();
                this.appOptions.canProtect     = (this.appOptions.isSignatureSupport || this.appOptions.isPasswordSupport);
                this.appOptions.canEditContentControl = (this.permissions.modifyContentControl!==false);
                this.appOptions.canHelp        = !((typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.help===false);
                this.appOptions.canSubmitForms = this.appOptions.canLicense && (typeof (this.editorConfig.customization) == 'object') && !!this.editorConfig.customization.submitForm;
                this.appOptions.canFillForms   = this.appOptions.canLicense && ((this.permissions.fillForms===undefined) ? this.appOptions.isEdit : this.permissions.fillForms) && (this.editorConfig.mode !== 'view');
                this.appOptions.isRestrictedEdit = !this.appOptions.isEdit && (this.appOptions.canComments || this.appOptions.canFillForms);
                if (this.appOptions.isRestrictedEdit && this.appOptions.canComments && this.appOptions.canFillForms) // must be one restricted mode, priority for filling forms
                    this.appOptions.canComments = false;

                if ( this.appOptions.isLightVersion ) {
                    this.appOptions.canUseHistory =
                    this.appOptions.canReview =
                    this.appOptions.isReviewOnly = false;
                }

                if ( !this.appOptions.canCoAuthoring ) {
                    this.appOptions.canChat = false;
                }

                var type = /^(?:(pdf|djvu|xps))$/.exec(this.document.fileType);
                this.appOptions.canDownloadOrigin = this.permissions.download !== false && (type && typeof type[1] === 'string');
                this.appOptions.canDownload       = this.permissions.download !== false && (!type || typeof type[1] !== 'string');

                this.appOptions.fileKey = this.document.key;

                this.appOptions.canBranding  = params.asc_getCustomization();
                if (this.appOptions.canBranding)
                    appHeader.setBranding(this.editorConfig.customization);

                this.appOptions.canFavorite = this.document.info && (this.document.info.favorite!==undefined && this.document.info.favorite!==null) && !this.appOptions.isOffline;
                this.appOptions.canFavorite && appHeader.setFavorite(this.document.info.favorite);

                this.appOptions.canUseReviewPermissions = this.appOptions.canLicense && (!!this.permissions.reviewGroups ||
                                                        this.editorConfig.customization && this.editorConfig.customization.reviewPermissions && (typeof (this.editorConfig.customization.reviewPermissions) == 'object'));
                this.appOptions.canUseCommentPermissions = this.appOptions.canLicense && !!this.permissions.commentGroups;
                AscCommon.UserInfoParser.setParser(true);
                AscCommon.UserInfoParser.setCurrentName(this.appOptions.user.fullname);
                this.appOptions.canUseReviewPermissions && AscCommon.UserInfoParser.setReviewPermissions(this.permissions.reviewGroups, this.editorConfig.customization.reviewPermissions);
                this.appOptions.canUseCommentPermissions && AscCommon.UserInfoParser.setCommentPermissions(this.permissions.commentGroups);
                appHeader.setUserName(AscCommon.UserInfoParser.getParsedName(AscCommon.UserInfoParser.getCurrentName()));

                this.appOptions.canRename && appHeader.setCanRename(true);
                this.appOptions.canBrandingExt = params.asc_getCanBranding() && (typeof this.editorConfig.customization == 'object' || this.editorConfig.plugins);
                this.getApplication().getController('Common.Controllers.Plugins').setMode(this.appOptions, this.api);

                if (this.appOptions.canComments)
                    Common.NotificationCenter.on('comments:cleardummy', _.bind(this.onClearDummyComment, this));
                    Common.NotificationCenter.on('comments:showdummy', _.bind(this.onShowDummyComment, this));

                this.appOptions.canChangeCoAuthoring = this.appOptions.isEdit && this.appOptions.canCoAuthoring && !(typeof this.editorConfig.coEditing == 'object' && this.editorConfig.coEditing.change===false);

                this.loadCoAuthSettings();
                this.applyModeCommonElements();
                this.applyModeEditorElements();

                if ( !this.appOptions.isEdit ) {
                    Common.NotificationCenter.trigger('app:face', this.appOptions);

                    this.hidePreloader();
                    this.onLongActionBegin(Asc.c_oAscAsyncActionType.BlockInteraction, LoadingDocument);
                }

                this.api.asc_setViewMode(!this.appOptions.isEdit && !this.appOptions.isRestrictedEdit);
                this.appOptions.isRestrictedEdit && this.appOptions.canComments && this.api.asc_setRestriction(Asc.c_oAscRestrictionType.OnlyComments);
                this.appOptions.isRestrictedEdit && this.appOptions.canFillForms && this.api.asc_setRestriction(Asc.c_oAscRestrictionType.OnlyForms);
                this.appOptions.isRestrictedEdit && this.appOptions.canFillForms && this.api.asc_SetHighlightRequiredFields(true);
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
                        value = Common.localStorage.getItem("de-settings-coauthmode");
                        if (value===null) {
                            value = (this.editorConfig.coEditing && this.editorConfig.coEditing.mode!==undefined) ? (this.editorConfig.coEditing.mode==='strict' ? 0 : 1) : null;
                            if (value===null && !Common.localStorage.itemExists("de-settings-autosave") &&
                                this.appOptions.customization && this.appOptions.customization.autosave===false) {
                                value = 0; // use customization.autosave only when de-settings-coauthmode and de-settings-autosave are null
                            }
                        }
                    }
                    fastCoauth = (value===null || parseInt(value) == 1);

                    value = Common.localStorage.getItem((fastCoauth) ? "de-settings-showchanges-fast" : "de-settings-showchanges-strict");
                    if (value == null) value = fastCoauth ? 'none' : 'last';
                    Common.Utils.InternalSettings.set((fastCoauth) ? "de-settings-showchanges-fast" : "de-settings-showchanges-strict", value);
                } else if (!this.appOptions.isEdit && this.appOptions.isRestrictedEdit) {
                    fastCoauth = true;
                } else {
                    fastCoauth = false;
                    autosave = 0;
                }

                if (this.appOptions.isEdit) {
                    value = Common.localStorage.getItem("de-settings-autosave");
                    if (value === null && this.appOptions.customization && this.appOptions.customization.autosave === false)
                        value = 0;
                    autosave = (!fastCoauth && value !== null) ? parseInt(value) : (this.appOptions.canCoAuthoring ? 1 : 0);
                }

                Common.Utils.InternalSettings.set("de-settings-coauthmode", fastCoauth);
                Common.Utils.InternalSettings.set("de-settings-autosave", autosave);
            },

            applyModeCommonElements: function() {
                window.editor_elements_prepared = true;

                var app             = this.getApplication(),
                    viewport        = app.getController('Viewport').getView('Viewport'),
                    statusbarView   = app.getController('Statusbar').getView('Statusbar'),
                    documentHolder  = app.getController('DocumentHolder').getView(),
                    toolbarController   = app.getController('Toolbar');

                viewport && viewport.setMode(this.appOptions);
                statusbarView && statusbarView.setMode(this.appOptions);
                toolbarController.setMode(this.appOptions);
                documentHolder.setMode(this.appOptions);

                this.api.asc_registerCallback('asc_onSendThemeColors', _.bind(this.onSendThemeColors, this));
                this.api.asc_registerCallback('asc_onDownloadUrl',     _.bind(this.onDownloadUrl, this));
                this.api.asc_registerCallback('asc_onAuthParticipantsChanged', _.bind(this.onAuthParticipantsChanged, this));
                this.api.asc_registerCallback('asc_onParticipantsChanged',     _.bind(this.onAuthParticipantsChanged, this));
                this.api.asc_registerCallback('asc_onConnectionStateChanged',  _.bind(this.onUserConnection, this));
                this.api.asc_registerCallback('asc_onDocumentModifiedChanged', _.bind(this.onDocumentModifiedChanged, this));
            },

            applyModeEditorElements: function() {
                /** coauthoring begin **/
                this.contComments.setMode(this.appOptions);
                this.contComments.setConfig({config: this.editorConfig}, this.api);
                /** coauthoring end **/

                var me = this,
                    application         = this.getApplication(),
                    reviewController    = application.getController('Common.Controllers.ReviewChanges');
                reviewController.setMode(me.appOptions).setConfig({config: me.editorConfig}, me.api).loadDocument({doc:me.document});

                if (this.appOptions.isEdit || this.appOptions.isRestrictedEdit) { // set api events for toolbar in the Restricted Editing mode
                    var toolbarController   = application.getController('Toolbar');
                    toolbarController   && toolbarController.setApi(me.api);

                    if (!this.appOptions.isEdit) return;

                    var rightmenuController = application.getController('RightMenu'),
                        fontsControllers    = application.getController('Common.Controllers.Fonts');
                    fontsControllers    && fontsControllers.setApi(me.api);
                    rightmenuController && rightmenuController.setApi(me.api);

                    if (this.appOptions.canProtect)
                        application.getController('Common.Controllers.Protection').setMode(me.appOptions).setConfig({config: me.editorConfig}, me.api);

                    var viewport = this.getApplication().getController('Viewport').getView('Viewport');

                    viewport.applyEditorMode();

                    var rightmenuView = rightmenuController.getView('RightMenu');
                    if (rightmenuView) {
                        rightmenuView.setApi(me.api);
                        rightmenuView.on('editcomplete', _.bind(me.onEditComplete, me));
                        rightmenuView.setMode(me.appOptions);
                    }

                    var toolbarView = (toolbarController) ? toolbarController.getView() : null;
                    if (toolbarView) {
                        toolbarView.setApi(me.api);
                        toolbarView.on('editcomplete', _.bind(me.onEditComplete, me));
                        toolbarView.on('insertimage', _.bind(me.onInsertImage, me));
                        toolbarView.on('inserttable', _.bind(me.onInsertTable, me));
                        toolbarView.on('insertshape', _.bind(me.onInsertShape, me));
                        toolbarView.on('inserttextart', _.bind(me.onInsertTextArt, me));
                        toolbarView.on('insertchart', _.bind(me.onInsertChart, me));
                        toolbarView.on('insertcontrol', _.bind(me.onInsertControl, me));
                    }

                    var value = Common.localStorage.getItem('de-settings-unit');
                    value = (value!==null) ? parseInt(value) : (this.appOptions.customization && this.appOptions.customization.unit ? Common.Utils.Metric.c_MetricUnits[this.appOptions.customization.unit.toLocaleLowerCase()] : Common.Utils.Metric.getDefaultMetric());
                    (value===undefined) && (value = Common.Utils.Metric.getDefaultMetric());
                    Common.Utils.Metric.setCurrentMetric(value);
                    Common.Utils.InternalSettings.set("de-settings-unit", value);
                    me.api.asc_SetDocumentUnits((value==Common.Utils.Metric.c_MetricUnits.inch) ? Asc.c_oAscDocumentUnits.Inch : ((value==Common.Utils.Metric.c_MetricUnits.pt) ? Asc.c_oAscDocumentUnits.Point : Asc.c_oAscDocumentUnits.Millimeter));

                    value = Common.localStorage.itemExists('de-hidden-rulers') ? Common.localStorage.getBool('de-hidden-rulers') : (this.appOptions.customization && !!this.appOptions.customization.hideRulers);
                    Common.Utils.InternalSettings.set("de-hidden-rulers", value);
                    me.api.asc_SetViewRulers(!value);

                    me.api.asc_registerCallback('asc_onDocumentCanSaveChanged',  _.bind(me.onDocumentCanSaveChanged, me));
                    /** coauthoring begin **/
                    me.api.asc_registerCallback('asc_onCollaborativeChanges',    _.bind(me.onCollaborativeChanges, me));
                    me.api.asc_registerCallback('asc_OnTryUndoInFastCollaborative',_.bind(me.onTryUndoInFastCollaborative, me));
                    me.api.asc_registerCallback('asc_onConvertEquationToMath',_.bind(me.onConvertEquationToMath, me));
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

                    case Asc.c_oAscError.ID.MailMergeLoadFile:
                        config.msg = this.errorMailMergeLoadFile;
                        break;

                    case Asc.c_oAscError.ID.MailMergeSaveFile:
                        config.msg = this.errorMailMergeSaveFile;
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

                   case Asc.c_oAscError.ID.DirectUrl:
                        config.msg = this.errorDirectUrl;
                        break;

                   case Asc.c_oAscError.ID.CannotCompareInCoEditing:
                        config.msg = this.errorCompare;
                        break;

                    case Asc.c_oAscError.ID.ComboSeriesError:
                        config.msg = this.errorComboSeries;
                        break;

                    case Asc.c_oAscError.ID.Password:
                        config.msg = this.errorSetPassword;
                        break;

                    case Asc.c_oAscError.ID.Submit:
                        config.msg = this.errorSubmit;
                        break;

                    case Asc.c_oAscError.ID.LoadingFontError:
                        config.msg = this.errorLoadingFont;
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
                    if (id == Asc.c_oAscError.ID.DataEncrypted) {
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
                            else
                                (this.appOptions.canDownload) ? this.getApplication().getController('LeftMenu').leftMenu.showMenu('file:saveas') : this.api.asc_DownloadOrigin();
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
                this.getApplication().getController('Viewport').getView('Viewport').setMode({isDisconnected:true});
                appHeader.setCanRename(false);
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
                        owner: this.getApplication().getController('Toolbar').getView(),
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
                        isDisabled = !isModified && !isSyncButton && !forcesave || this._state.isDisconnected || this._state.fastCoauth && this._state.usersCount>1 && !forcesave;
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

            onDownloadUrl: function(url) {
                if (this._state.isFromGatewayDownloadAs)
                    Common.Gateway.downloadAs(url);
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
                this.getApplication().getController('Common.Controllers.ReviewChanges').synchronizeChanges();
                this.getApplication().getController('DocumentHolder').getView().hideTips();
                /** coauthoring begin **/
                this.getApplication().getController('Toolbar').getView().synchronizeChanges();
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
            },

            fillAutoShapes: function(groupNames, shapes){
                if (_.isEmpty(shapes) || _.isEmpty(groupNames) || shapes.length != groupNames.length)
                    return;

                var me = this,
                    shapegrouparray = [],
                    shapeStore = this.getCollection('ShapeGroups');

                shapeStore.reset();

                _.each(groupNames, function(groupName, index){
                    var store = new Backbone.Collection([], {
                        model: DE.Models.ShapeModel
                    }),
                        arr = [];

                    var cols = (shapes[index].length) > 18 ? 7 : 6,
                        height = Math.ceil(shapes[index].length/cols) * 35 + 3,
                        width = 30 * cols;

                    _.each(shapes[index], function(shape, idx){
                        arr.push({
                            data     : {shapeType: shape.Type},
                            tip      : me['txtShape_' + shape.Type] || (me.textShape + ' ' + (idx+1)),
                            allowSelected : true,
                            selected: false
                        });
                    });
                    store.add(arr);
                    shapegrouparray.push({
                        groupName   : me.shapeGroupNames[index],
                        groupStore  : store,
                        groupWidth  : width,
                        groupHeight : height
                    });
                });

                shapeStore.add(shapegrouparray);
                setTimeout(function(){
                    me.getApplication().getController('Toolbar').onApiAutoShapes();
                }, 50);
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
                    var me = this;
                    setTimeout(function(){
                        me.fillTextArt();
                    }, 1);
                }
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

            onInsertControl:  function() {
                this.getApplication().getController('RightMenu').onInsertControl();
            },

            unitsChanged: function(m) {
                var value = Common.localStorage.getItem("de-settings-unit");
                value = (value!==null) ? parseInt(value) : Common.Utils.Metric.getDefaultMetric();
                Common.Utils.Metric.setCurrentMetric(value);
                Common.Utils.InternalSettings.set("de-settings-unit", value);
                this.api.asc_SetDocumentUnits((value==Common.Utils.Metric.c_MetricUnits.inch) ? Asc.c_oAscDocumentUnits.Inch : ((value==Common.Utils.Metric.c_MetricUnits.pt) ? Asc.c_oAscDocumentUnits.Point : Asc.c_oAscDocumentUnits.Millimeter));
                this.getApplication().getController('RightMenu').updateMetricUnit();
                this.getApplication().getController('Toolbar').getView().updateMetricUnit();
            },

            onAdvancedOptions: function(type, advOptions, mode, formatOptions) {
                if (this._state.openDlg) return;

                var me = this;
                if (type == Asc.c_oAscAdvancedOptionsID.TXT) {
                    me._state.openDlg = new Common.Views.OpenDialog({
                        title: Common.Views.OpenDialog.prototype.txtTitle.replace('%1', 'TXT'),
                        closable: (mode==2), // if save settings
                        type: Common.Utils.importTextType.TXT,
                        preview: advOptions.asc_getData(),
                        codepages: advOptions.asc_getCodePages(),
                        settings: advOptions.asc_getRecommendedSettings(),
                        api: me.api,
                        handler: function (result, settings) {
                            me.isShowOpenDialog = false;
                            if (result == 'ok') {
                                if (me && me.api) {
                                    if (mode==2) {
                                        formatOptions && formatOptions.asc_setAdvancedOptions(settings.textOptions);
                                        me.api.asc_DownloadAs(formatOptions);
                                    } else
                                        me.api.asc_setAdvancedOptions(type, settings.textOptions);
                                    me.loadMask && me.loadMask.show();
                                }
                            }
                            me._state.openDlg = null;
                        }
                    });
                } else if (type == Asc.c_oAscAdvancedOptionsID.DRM) {
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
                if (!Common.localStorage.getBool("de-hide-try-undoredo"))
                    Common.UI.info({
                        width: 500,
                        msg: this.appOptions.canChangeCoAuthoring ? this.textTryUndoRedo : this.textTryUndoRedoWarn,
                        iconCls: 'info',
                        buttons: this.appOptions.canChangeCoAuthoring ? ['custom', 'cancel'] : ['ok'],
                        primary: this.appOptions.canChangeCoAuthoring ? 'custom' : 'ok',
                        customButtonText: this.textStrict,
                        dontshow: true,
                        callback: _.bind(function(btn, dontshow){
                            if (dontshow) Common.localStorage.setItem("de-hide-try-undoredo", 1);
                            if (btn == 'custom') {
                                Common.localStorage.setItem("de-settings-coauthmode", 0);
                                Common.Utils.InternalSettings.set("de-settings-coauthmode", false);
                                this.api.asc_SetFastCollaborative(false);
                                this._state.fastCoauth = false;
                                Common.localStorage.setItem("de-settings-showchanges-strict", 'last');
                                this.api.SetCollaborativeMarksShowType(Asc.c_oAscCollaborativeMarksShowType.LastChanges);
                                this.getApplication().getController('Common.Controllers.ReviewChanges').applySettings();
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
                    this._state.fastCoauth = Common.localStorage.getBool("de-settings-coauthmode", true);
                    if (this._state.fastCoauth && !oldval)
                        this.synchronizeChanges();
                }
                if (this.appOptions.canForcesave) {
                    this.appOptions.forcesave = Common.localStorage.getBool("de-settings-forcesave", this.appOptions.canForcesave);
                    Common.Utils.InternalSettings.set("de-settings-forcesave", this.appOptions.forcesave);
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
                
                if (this.api)
                    this.api.asc_Print(new Asc.asc_CDownloadOptions(null, Common.Utils.isChrome || Common.Utils.isSafari || Common.Utils.isOpera || Common.Utils.isGecko && Common.Utils.firefoxVersion>86)); // if isChrome or isSafari or isOpera == true use asc_onPrintUrl event
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

            onClearDummyComment: function() {
                this.dontCloseDummyComment = false;
            },

            onShowDummyComment: function() {
                this.beforeShowDummyComment = true;
            },

            DisableMailMerge: function() {
                this.appOptions.mergeFolderUrl = "";
                var toolbarController   = this.getApplication().getController('Toolbar');
                toolbarController && toolbarController.DisableMailMerge();
            },

            DisableVersionHistory: function() {
                this.editorConfig.canUseHistory = false;
                this.appOptions.canUseHistory = false;
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

            warningDocumentIsLocked: function() {
                var me = this;
                var _disable_ui = function (disable) {
                    me.disableEditing(disable);
                    var app = me.getApplication();
                    app.getController('DocumentHolder').getView().SetDisabled(disable);
                    app.getController('Navigation') && app.getController('Navigation').SetDisabled(disable);

                    var leftMenu = app.getController('LeftMenu');
                    leftMenu.leftMenu.getMenu('file').getButton('protect').setDisabled(disable);
                    leftMenu.setPreviewMode(disable);

                    var comments = app.getController('Common.Controllers.Comments');
                    if (comments) comments.setPreviewMode(disable);
                };

                Common.Utils.warningDocumentIsLocked({disablefunc: _disable_ui});
            },

            onRunAutostartMacroses: function() {
                var me = this,
                    enable = !this.editorConfig.customization || (this.editorConfig.customization.macros!==false);
                if (enable) {
                    var value = Common.Utils.InternalSettings.get("de-macros-mode");
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
                                    Common.Utils.InternalSettings.set("de-macros-mode", (btn == 'yes') ? 1 : 2);
                                    Common.localStorage.setItem("de-macros-mode", (btn == 'yes') ? 1 : 2);
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

            loadAutoCorrectSettings: function() {
                // autocorrection
                var me = this;
                var value = Common.localStorage.getItem("de-settings-math-correct-add");
                Common.Utils.InternalSettings.set("de-settings-math-correct-add", value);
                var arrAdd = value ? JSON.parse(value) : [];
                value = Common.localStorage.getItem("de-settings-math-correct-rem");
                Common.Utils.InternalSettings.set("de-settings-math-correct-rem", value);
                var arrRem = value ? JSON.parse(value) : [];
                value = Common.localStorage.getBool("de-settings-math-correct-replace-type", true); // replace on type
                Common.Utils.InternalSettings.set("de-settings-math-correct-replace-type", value);
                me.api.asc_refreshOnStartAutoCorrectMathSymbols(arrRem, arrAdd, value);

                value = Common.localStorage.getItem("de-settings-rec-functions-add");
                Common.Utils.InternalSettings.set("de-settings-rec-functions-add", value);
                arrAdd = value ? JSON.parse(value) : [];
                value = Common.localStorage.getItem("de-settings-rec-functions-rem");
                Common.Utils.InternalSettings.set("de-settings-rec-functions-rem", value);
                arrRem = value ? JSON.parse(value) : [];
                me.api.asc_refreshOnStartAutoCorrectMathFunctions(arrRem, arrAdd);

                value = Common.localStorage.getBool("de-settings-autoformat-bulleted", true);
                Common.Utils.InternalSettings.set("de-settings-autoformat-bulleted", value);
                me.api.asc_SetAutomaticBulletedLists(value);

                value = Common.localStorage.getBool("de-settings-autoformat-numbered", true);
                Common.Utils.InternalSettings.set("de-settings-autoformat-numbered", value);
                me.api.asc_SetAutomaticNumberedLists(value);

                value = Common.localStorage.getBool("de-settings-autoformat-smart-quotes", true);
                Common.Utils.InternalSettings.set("de-settings-autoformat-smart-quotes", value);
                me.api.asc_SetAutoCorrectSmartQuotes(value);

                value = Common.localStorage.getBool("de-settings-autoformat-hyphens", true);
                Common.Utils.InternalSettings.set("de-settings-autoformat-hyphens", value);
                me.api.asc_SetAutoCorrectHyphensWithDash(value);

                value = Common.localStorage.getBool("de-settings-autoformat-fl-sentence", true);
                Common.Utils.InternalSettings.set("de-settings-autoformat-fl-sentence", value);
                me.api.asc_SetAutoCorrectFirstLetterOfSentences(value);
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
            splitMaxRowsErrorText: 'The number of rows must be less than %1',
            splitMaxColsErrorText: 'The number of columns must be less than %1',
            splitDividerErrorText: 'The number of rows must be a divisor of %1',
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
            loadingDocumentTitleText: 'Loading document',
            loadingDocumentTextText: 'Loading document...',
            warnProcessRightsChange: 'You have been denied the right to edit the file.',
            errorProcessSaveResult: 'Saving is failed.',
            textCloseTip: 'Click to close the tip.',
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
            txtSeries: 'Seria',
            errorMailMergeLoadFile: 'Loading the document failed. Please select a different file.',
            mailMergeLoadFileText: 'Loading Data Source...',
            mailMergeLoadFileTitle: 'Loading Data Source',
            errorMailMergeSaveFile: 'Merge failed.',
            downloadMergeText: 'Downloading...',
            downloadMergeTitle: 'Downloading',
            sendMergeTitle: 'Sending Merge',
            sendMergeText: 'Sending Merge...',
            txtArt: 'Your text here',
            errorConnectToServer: 'The document could not be saved. Please check connection settings or contact your administrator.<br>When you click the \'OK\' button, you will be prompted to download the document.',
            textTryUndoRedo: 'The Undo/Redo functions are disabled for the Fast co-editing mode.<br>Click the \'Strict mode\' button to switch to the Strict co-editing mode to edit the file without other users interference and send your changes only after you save them. You can switch between the co-editing modes using the editor Advanced settings.',
            textStrict: 'Strict mode',
            txtErrorLoadHistory: 'Loading history failed',
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
            saveTextText: 'Saving document...',
            saveTitleText: 'Saving Document',
            txtBookmarkError: "Error! Bookmark not defined.",
            txtAbove: "above",
            txtBelow: "below",
            txtOnPage: "on page",
            txtHeader: "Header",
            txtFooter: "Footer",
            txtSection: "-Section",
            txtFirstPage: "First Page",
            txtEvenPage: "Even Page",
            txtOddPage: "Odd Page",
            txtSameAsPrev: "Same as Previous",
            txtCurrentDocument: "Current Document",
            txtNoTableOfContents: "There are no headings in the document. Apply a heading style to the text so that it appears in the table of contents.",
            txtTableOfContents: "Table of Contents",
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
            txtSyntaxError: 'Syntax Error',
            txtMissOperator: 'Missing Operator',
            txtMissArg: 'Missing Argument',
            txtTooLarge: 'Number Too Large To Format',
            txtZeroDivide: 'Zero Divide',
            txtNotInTable: 'Is Not In Table',
            txtIndTooLarge: 'Index Too Large',
            txtFormulaNotInTable: 'The Formula Not In Table',
            txtTableInd: 'Table Index Cannot be Zero',
            txtUndefBookmark: 'Undefined Bookmark',
            txtEndOfFormula: 'Unexpected End of Formula',
            errorEmailClient: 'No email client could be found',
            textCustomLoader: 'Please note that according to the terms of the license you are not entitled to change the loader.<br>Please contact our Sales Department to get a quote.',
            txtHyperlink: 'Hyperlink',
            waitText: 'Please, wait...',
            errorFileSizeExceed: 'The file size exceeds the limitation set for your server.<br>Please contact your Document Server administrator for details.',
            txtMainDocOnly: 'Error! Main Document Only.',
            txtNotValidBookmark: 'Error! Not a valid bookmark self-reference.',
            txtNoText: 'Error! No text of specified style in document.',
            uploadDocSizeMessage: 'Maximum document size limit exceeded.',
            uploadDocExtMessage: 'Unknown document format.',
            uploadDocFileCountMessage: 'No documents uploaded.',
            errorUpdateVersionOnDisconnect: 'Internet connection has been restored, and the file version has been changed.<br>Before you can continue working, you need to download the file or copy its content to make sure nothing is lost, and then reload this page.',
            txtChoose: 'Choose an item',
            errorDirectUrl: 'Please verify the link to the document.<br>This link must be a direct link to the file for downloading.',
            txtStyle_Caption: 'Caption',
            errorCompare: 'The Compare documents feature is not available in the co-editing mode.',
            textConvertEquation: 'This equation was created with an old version of equation editor which is no longer supported. Converting this equation to Office Math ML format will make it editable.<br>Do you want to convert this equation?',
            textApplyAll: 'Apply to all equations',
            textLearnMore: 'Learn More',
            txtEnterDate: 'Enter a date',
            txtTypeEquation: 'Type equation here',
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
            errorSubmit: 'Submit failed.',
            txtClickToLoad: 'Click to load image',
            leavePageTextOnClose: 'All unsaved changes in this document will be lost.<br> Click \'Cancel\' then \'Save\' to save them. Click \'OK\' to discard all the unsaved changes.',
            textTryUndoRedoWarn: 'The Undo/Redo functions are disabled for the Fast co-editing mode.',
            txtNone: 'None',
            txtNoTableOfFigures: "No table of figures entries found.",
            txtTableOfFigures: 'Table of figures',
            txtStyle_endnote_text: 'Endnote Text',
            txtTOCHeading: 'TOC Heading',
            errorLang: 'The interface language is not loaded.<br>Please contact your Document Server administrator.',
            errorLoadingFont: 'Fonts are not loaded.<br>Please contact your Document Server administrator.'
        }
    })(), DE.Controllers.Main || {}))
});