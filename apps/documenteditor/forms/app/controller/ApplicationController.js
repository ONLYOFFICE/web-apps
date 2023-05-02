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
define([
    'core',
    'irregularstack',
    'gateway',
    'common/main/lib/component/Window',
    'common/main/lib/component/LoadMask',
    'common/main/lib/component/Tooltip',
    'common/main/lib/component/SynchronizeTip',
    'common/main/lib/component/DataView',
    'common/main/lib/component/Calendar',
    'common/main/lib/util/LocalStorage',
    'common/main/lib/util/Shortcuts',
    'common/main/lib/view/CopyWarningDialog',
    'common/main/lib/view/ImageFromUrlDialog',
    'common/main/lib/view/SelectFileDlg',
    'common/main/lib/view/SaveAsDlg',
    'common/main/lib/view/OpenDialog',
    'common/forms/lib/view/modals',
    'documenteditor/forms/app/view/ApplicationView'
], function (Viewport) {
    'use strict';

    var LoadingDocument = -256,
        maxPages = 0,
        labelDocName,
        _submitFail,
        screenTip,
        mouseMoveData = null,
        isTooltipHiding = false,
        bodyWidth = 0,
        ttOffset = [0, -10];

    DE.Controllers.ApplicationController = Backbone.Controller.extend(_.assign({
        views: [
            'ApplicationView'
        ],

        initialize: function() {
        },

        onLaunch: function() {
            var me = this;
            if (!Common.Utils.isBrowserSupported()){
                Common.Utils.showBrowserRestriction();
                $('#editor_sdk').hide().remove();
                $('#toolbar').hide().remove();
                Common.Gateway.reportError(undefined, this.unsupportedBrowserErrorText);
                return;
            }

            this.stackLongActions = new Common.IrregularStack({
                strongCompare   : function(obj1, obj2){return obj1.id === obj2.id && obj1.type === obj2.type;},
                weakCompare     : function(obj1, obj2){return obj1.type === obj2.type;}
            });

            this._state = {isDisconnected: false, licenseType: false, isDocModified: false};

            this.view = this.createView('ApplicationView').render();

            window["flat_desine"] = true;
            var translationTable = {
                'Your text here': this.txtArt,
                "Choose an item": this.txtChoose,
                "Enter a date": this.txtEnterDate,
                "Click to load image": this.txtClickToLoad
            }
            this.api = new Asc.asc_docs_api({
                'id-view'  : 'editor_sdk',
                'embedded' : true,
                'translate': translationTable
            });

            Common.UI.Themes.init(this.api);

            $(window).on('resize', this.onDocumentResize.bind(this));

            this.boxSdk = $('#editor_sdk');
            this.boxSdk.on('click', function(e) {
                if (e.target.localName == 'canvas') {
                    if (me._preventClick)
                        me._preventClick = false;
                    else
                        me.boxSdk.focus();
                }
            });
            this.boxSdk.on('mousedown', function(e){
                if (e.target.localName == 'canvas')
                    Common.UI.Menu.Manager.hideAll();
            });

            this.editorConfig = {};
            this.embedConfig = {};
            this.appOptions = {};
            this.internalFormObj = null;

            if (this.api){
                this.api.asc_registerCallback('asc_onError',                 this.onError.bind(this));
                this.api.asc_registerCallback('asc_onDocumentContentReady',  this.onDocumentContentReady.bind(this));
                this.api.asc_registerCallback('asc_onOpenDocumentProgress',  this.onOpenDocument.bind(this));
                this.api.asc_registerCallback('asc_onDocumentUpdateVersion', this.onUpdateVersion.bind(this));
                this.api.asc_registerCallback('asc_onServerVersion',         this.onServerVersion.bind(this));
                this.api.asc_registerCallback('asc_onAdvancedOptions',       this.onAdvancedOptions.bind(this));
                this.api.asc_registerCallback('asc_onCountPages',            this.onCountPages.bind(this));
                this.api.asc_registerCallback('asc_onCurrentPage',           this.onCurrentPage.bind(this));
                this.api.asc_registerCallback('asc_onDocumentModifiedChanged', _.bind(this.onDocumentModifiedChanged, this));
                this.api.asc_registerCallback('asc_onZoomChange',           this.onApiZoomChange.bind(this));
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect', _.bind(this.onApiServerDisconnect, this));
                Common.NotificationCenter.on('api:disconnect',               _.bind(this.onApiServerDisconnect, this));

                // Initialize api gateway
                Common.Gateway.on('init',               this.loadConfig.bind(this));
                Common.Gateway.on('opendocument',       this.loadDocument.bind(this));
                Common.Gateway.on('showmessage',        this.onExternalMessage.bind(this));
                Common.NotificationCenter.on('showmessage',   this.onExternalMessage.bind(this));
                Common.Gateway.appReady();
            }

            Common.NotificationCenter.on({
                'modal:show': function(){
                    if (screenTip) {
                        screenTip.toolTip.hide();
                        screenTip.isVisible = false;
                    }
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
                'dataview:blur': function(e){
                    if (!Common.Utils.ModalWindow.isVisible()) {
                        me.api.asc_enableKeyEvents(true);
                    }
                },
                'menu:hide': function(e, isFromInputControl){
                    if (!Common.Utils.ModalWindow.isVisible() && !isFromInputControl)
                        me.api.asc_enableKeyEvents(true);
                }
            });

            $(document.body).on('blur', 'input, textarea', function(e) {
                if (!Common.Utils.ModalWindow.isVisible()) {
                    if (!/area_id/.test(e.target.id) ) {
                        me.api.asc_enableKeyEvents(true);
                    }
                }
            });

            window.onbeforeunload = _.bind(this.onBeforeUnload, this);

            this.warnNoLicense  = this.warnNoLicense.replace(/%1/g, '{{COMPANY_NAME}}');
            this.warnNoLicenseUsers = this.warnNoLicenseUsers.replace(/%1/g, '{{COMPANY_NAME}}');
            this.textNoLicenseTitle = this.textNoLicenseTitle.replace(/%1/g, '{{COMPANY_NAME}}');
            this.warnLicenseExceeded = this.warnLicenseExceeded.replace(/%1/g, '{{COMPANY_NAME}}');
            this.warnLicenseUsersExceeded = this.warnLicenseUsersExceeded.replace(/%1/g, '{{COMPANY_NAME}}');
        },

        onDocumentResize: function() {
            this.api && this.api.Resize();
            bodyWidth = $('body').width();
        },

        onBeforeUnload: function() {
            Common.localStorage.save();
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

                case Asc.c_oAscError.ID.ConvertationError:
                    config.msg = this.convertationErrorText;
                    break;

                case Asc.c_oAscError.ID.ConvertationOpenError:
                    config.msg = this.openErrorText;
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

                case Asc.c_oAscError.ID.ConvertationPassword:
                    config.msg = this.errorFilePassProtect;
                    break;

                case Asc.c_oAscError.ID.UserDrop:
                    config.msg = this.errorUserDrop;
                    break;

                case Asc.c_oAscError.ID.ConvertationOpenLimitError:
                    config.msg = this.errorFileSizeExceed;
                    break;

                case Asc.c_oAscError.ID.UpdateVersion:
                    config.msg = this.errorUpdateVersionOnDisconnect;
                    config.maxwidth = 600;
                    break;

                case Asc.c_oAscError.ID.AccessDeny:
                    config.msg = this.errorAccessDeny;
                    break;

                case Asc.c_oAscError.ID.Submit:
                    config.msg = this.errorSubmit;
                    _submitFail = true;
                    this.submitedTooltip && this.submitedTooltip.hide();
                    break;

                case Asc.c_oAscError.ID.EditingError:
                    config.msg = (this.appOptions.isDesktopApp && this.appOptions.isOffline) ? this.errorEditingSaveas : this.errorEditingDownloadas;
                    break;

                case Asc.c_oAscError.ID.ForceSaveButton:
                case Asc.c_oAscError.ID.ForceSaveTimeout:
                    config.msg = this.errorForceSave;
                    config.maxwidth = 600;
                    break;

                case Asc.c_oAscError.ID.LoadingFontError:
                    config.msg = this.errorLoadingFont;
                    break;

                case Asc.c_oAscError.ID.Warning:
                    config.msg = this.errorConnectToServer;
                    config.closable = false;
                    break;

                case Asc.c_oAscError.ID.VKeyEncrypt:
                    config.msg = this.errorToken;
                    break;

                case Asc.c_oAscError.ID.KeyExpire:
                    config.msg = this.errorTokenExpire;
                    break;

                case Asc.c_oAscError.ID.CoAuthoringDisconnect:
                    config.msg = this.errorViewerDisconnect;
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

                case Asc.c_oAscError.ID.UplImageUrl:
                    config.msg = this.errorBadImageUrl;
                    break;

                case Asc.c_oAscError.ID.DataEncrypted:
                    config.msg = this.errorDataEncrypted;
                    break;

                case Asc.c_oAscError.ID.ConvertationSaveError:
                    config.msg = (this.appOptions.isDesktopApp && this.appOptions.isOffline) ? this.saveErrorTextDesktop : this.saveErrorText;
                    break;

                case Asc.c_oAscError.ID.TextFormWrongFormat:
                    config.msg = this.errorTextFormWrongFormat;
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
                config.callback = _.bind(function(btn){
                    window.location.reload();
                }, this);

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
                    if (id == Asc.c_oAscError.ID.Warning && btn == 'ok' && this.appOptions.canDownload) {
                        Common.UI.Menu.Manager.hideAll();
                        if (this.appOptions.isDesktopApp && this.appOptions.isOffline)
                            this.api.asc_DownloadAs();
                        else {
                            var me = this;
                            setTimeout(function() {
                                $('button', me.view.btnOptions.cmpEl).click();
                            }, 10);
                        }
                    } else if (id == Asc.c_oAscError.ID.EditingError) {
                        Common.NotificationCenter.trigger('api:disconnect', true); // enable download and print
                    }
                }, this);
            }

            if (!Common.Utils.ModalWindow.isVisible() || $('.asc-window.modal.alert[data-value=' + id + ']').length<1)
                Common.UI.alert(config).$window.attr('data-value', id);

            (id!==undefined) && Common.component.Analytics.trackEvent('Internal Error', id.toString());
        },

        hidePreloader: function() {
            $('#loading-mask').fadeOut('slow');
        },

        onOpenDocument: function(progress) {
            var elem = document.getElementById('loadmask-text');
            var proc = (progress.asc_getCurrentFont() + progress.asc_getCurrentImage())/(progress.asc_getFontsCount() + progress.asc_getImagesCount());
            proc = this.textLoadingDocument + ': ' + Common.Utils.String.fixedDigits(Math.min(Math.round(proc*100), 100), 3, "  ") + "%";
            elem ? elem.innerHTML = proc : this.loadMask && this.loadMask.setTitle(proc);
        },

        onCountPages: function(count) {
            if (maxPages !== count) {
                maxPages = count;
                $('#pages').text(this.textOf + " " + count);
            }
        },

        onCurrentPage: function(number) {
            this.view.txtGoToPage.setValue(number + 1);
        },

        updateWindowTitle: function(force) {
            var isModified = this.api.isDocumentModified();
            if (this._state.isDocModified !== isModified || force) {
                this._isDocReady && (this._state.isDocModified !== isModified) && Common.Gateway.setDocumentModified(isModified);
                this._state.isDocModified = isModified;
            }
        },

        onDocumentModifiedChanged: function() {
            var isModified = this.api.asc_isDocumentCanSave();
            if (this._state.isDocModified !== isModified) {
                this._isDocReady && Common.Gateway.setDocumentModified(this.api.isDocumentModified());
            }

            this.updateWindowTitle();
        },

        loadConfig: function(data) {
            this.editorConfig = $.extend(this.editorConfig, data.config);
            this.embedConfig = $.extend(this.embedConfig, data.config.embedded);

            $('#toolbar').addClass('top');
            this.boxSdk.addClass('top');
            ttOffset[1] = 40;

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

            this.appOptions.canRequestClose = this.editorConfig.canRequestClose;
            this.appOptions.canBackToFolder = (this.editorConfig.canBackToFolder!==false) && (typeof (this.editorConfig.customization) == 'object') && (typeof (this.editorConfig.customization.goback) == 'object')
                                                && (!_.isEmpty(this.editorConfig.customization.goback.url) || this.editorConfig.customization.goback.requestClose && this.appOptions.canRequestClose);

            this.appOptions.canRequestInsertImage = this.editorConfig.canRequestInsertImage;
            this.appOptions.fileChoiceUrl   = this.editorConfig.fileChoiceUrl;
            this.appOptions.saveAsUrl       = this.editorConfig.saveAsUrl;
            this.appOptions.canRequestSaveAs = this.editorConfig.canRequestSaveAs;
            this.appOptions.isDesktopApp    = this.editorConfig.targetApp == 'desktop';
            this.appOptions.lang            = this.editorConfig.lang;
            this.appOptions.canPlugins      = false;

            Common.Controllers.Desktop.init(this.appOptions);
        },

        onExternalMessage: function(msg) {
            if (msg && msg.msg) {
                msg.msg = (msg.msg).toString();
                this.showTips([msg.msg.charAt(0).toUpperCase() + msg.msg.substring(1)]);

                Common.component.Analytics.trackEvent('External Error');
            }
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
                    owner: $('#toolbar'),
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
                
                var enable = !this.editorConfig.customization || (this.editorConfig.customization.macros!==false);
                docInfo.asc_putIsEnabledMacroses(!!enable);
                enable = !this.editorConfig.customization || (this.editorConfig.customization.plugins!==false);
                docInfo.asc_putIsEnabledPlugins(!!enable);

                var type = /^(?:(pdf|djvu|xps|oxps))$/.exec(data.doc.fileType);
                if (type && typeof type[1] === 'string') {
                    this.permissions.edit = this.permissions.review = false;
                }
            }

            labelDocName = $('#title-doc-name');
            if (data.doc) {
                labelDocName.text(data.doc.title || '');
                this.embedConfig.docTitle = data.doc.title;
            }

            this.api.asc_registerCallback('asc_onGetEditorPermissions', _.bind(this.onEditorPermissions, this));
            this.api.asc_registerCallback('asc_onRunAutostartMacroses', _.bind(this.onRunAutostartMacroses, this));
            this.api.asc_registerCallback('asc_onLicenseChanged',       _.bind(this.onLicenseChanged, this));
            this.api.asc_setDocInfo(docInfo);
            this.api.asc_getEditorPermissions(this.editorConfig.licenseUrl, this.editorConfig.customerId);
            this.api.asc_enableKeyEvents(true);

            Common.Analytics.trackEvent('Load', 'Start');
        },

        onRunAutostartMacroses: function() {
            if (!this.editorConfig.customization || (this.editorConfig.customization.macros!==false)) {
                this.api.asc_runAutostartMacroses();
            }
        },

        onEditorPermissions: function(params) {
            var licType = params.asc_getLicenseType();
            if (Asc.c_oLicenseResult.Expired === licType || Asc.c_oLicenseResult.Error === licType || Asc.c_oLicenseResult.ExpiredTrial === licType || Asc.c_oLicenseResult.NotBefore === licType) {
                Common.UI.warning({
                    title: Asc.c_oLicenseResult.NotBefore === licType ? this.titleLicenseNotActive : this.titleLicenseExp,
                    msg: Asc.c_oLicenseResult.NotBefore === licType ? this.warnLicenseBefore : this.warnLicenseExp,
                    buttons: [],
                    closable: false
                });
                return;
            }
            if (Asc.c_oLicenseResult.ExpiredLimited === licType)
                this._state.licenseType = licType;

            if ( this.onServerVersion(params.asc_getBuildVersion())) return;

            this.permissions.review = (this.permissions.review === undefined) ? (this.permissions.edit !== false) : this.permissions.review;
            if (params.asc_getRights() !== Asc.c_oRights.Edit)
                this.permissions.edit = this.permissions.review = false;

            this.appOptions.isOffline      = this.api.asc_isOffline();
            this.appOptions.trialMode      = params.asc_getLicenseMode();
            this.appOptions.isBeta         = params.asc_getIsBeta();
            this.appOptions.canLicense     = (licType === Asc.c_oLicenseResult.Success || licType === Asc.c_oLicenseResult.SuccessLimit);
            this.appOptions.canSubmitForms = this.appOptions.canLicense && (typeof (this.editorConfig.customization) == 'object') && !!this.editorConfig.customization.submitForm && !this.appOptions.isOffline;

            var type = /^(?:(oform))$/.exec(this.document.fileType); // can fill forms only in oform format
            this.appOptions.isOFORM = !!(type && typeof type[1] === 'string');
            this.appOptions.canFillForms   = this.appOptions.canLicense && this.appOptions.isOFORM && ((this.permissions.fillForms===undefined) ? (this.permissions.edit !== false) : this.permissions.fillForms) && (this.editorConfig.mode !== 'view');
            this.api.asc_setViewMode(!this.appOptions.canFillForms);

            this.appOptions.canBranding  = params.asc_getCustomization();
            this.appOptions.canBranding && this.setBranding(this.appOptions.customization);

            this.appOptions.canDownload       = this.permissions.download !== false;
            this.appOptions.canPrint          = (this.permissions.print !== false);

            this.appOptions.fileKey = this.document.key;

            AscCommon.UserInfoParser.setParser(true);
            AscCommon.UserInfoParser.setCurrentName(this.appOptions.user.fullname);

            DE.getController('Plugins').setMode(this.appOptions, this.api);

            var me = this;
            me.view.btnSubmit.setVisible(this.appOptions.canFillForms && this.appOptions.canSubmitForms);
            me.view.btnDownload.setVisible(this.appOptions.canDownload && this.appOptions.canFillForms && !this.appOptions.canSubmitForms);
            if (me.appOptions.isOffline || me.appOptions.canRequestSaveAs || !!me.appOptions.saveAsUrl) {
                me.view.btnDownload.setCaption(me.appOptions.isOffline ? me.textSaveAsDesktop : me.textSaveAs);
                me.view.btnDownload.updateHint('');
            }
            if (!this.appOptions.canFillForms) {
                me.view.btnPrev.setVisible(false);
                me.view.btnNext.setVisible(false);
                me.view.btnClear.setVisible(false);
                me.view.btnUndo.setVisible(false);
                me.view.btnRedo.setVisible(false);
                me.view.btnRedo.$el.next().hide();
            } else {
                me.view.btnPrev.on('click', function(){
                    me.api.asc_MoveToFillingForm(false);
                });
                me.view.btnNext.on('click', function(){
                    me.api.asc_MoveToFillingForm(true);
                });
                me.view.btnClear.on('click', function(){
                    me.api.asc_ClearAllSpecialForms();
                });
                me.view.btnSubmit.on('click', function(){
                    me.api.asc_SendForm();
                });
                me.view.btnDownload.on('click', function(){
                    if (me.appOptions.canDownload) {
                        if (me.appOptions.isOffline)
                            me.api.asc_DownloadAs(new Asc.asc_CDownloadOptions(Asc.c_oAscFileType.PDF));
                        else {
                            me.isFromBtnDownload = me.appOptions.canRequestSaveAs || !!me.appOptions.saveAsUrl;
                            me.api.asc_DownloadAs(new Asc.asc_CDownloadOptions(Asc.c_oAscFileType.PDF, me.isFromBtnDownload));
                        }
                    }
                });
                me.view.btnUndo.on('click', function(){
                    me.api.Undo(false);
                });
                me.view.btnRedo.on('click', function(){
                    me.api.Redo(false);
                });

                this.api.asc_setRestriction(Asc.c_oAscRestrictionType.OnlyForms);
                this.api.asc_SetFastCollaborative(true);
                this.api.asc_setAutoSaveGap(1);
                this.api.SetCollaborativeMarksShowType(Asc.c_oAscCollaborativeMarksShowType.None);
            }

            this.onLongActionBegin(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);
            this.api.asc_LoadDocument();
            this.api.Resize();
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

        onUpdateVersion: function(callback) {
            var me = this;
            me.needToUpdateVersion = true;
            me.onLongActionEnd(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);
            Common.UI.warning({
                title: this.titleUpdateVersion,
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

        onLicenseChanged: function(params) {
            var licType = params.asc_getLicenseType();
            if (licType !== undefined && this.appOptions.canFillForms &&
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
                    license = (license===Asc.c_oLicenseResult.ExpiredLimited) ? this.warnLicenseLimitedNoAccess : this.warnLicenseLimitedRenewed;
                } else if (license===Asc.c_oLicenseResult.Connections || license===Asc.c_oLicenseResult.UsersCount) {
                    license = (license===Asc.c_oLicenseResult.Connections) ? this.warnLicenseExceeded : this.warnLicenseUsersExceeded;
                } else {
                    license = (license===Asc.c_oLicenseResult.ConnectionsOS) ? this.warnNoLicense : this.warnNoLicenseUsers;
                    buttons = [{value: 'buynow', caption: this.textBuyNow}, {value: 'contact', caption: this.textContactUs}];
                    primary = 'buynow';
                }

                if (this._state.licenseType!==Asc.c_oLicenseResult.SuccessLimit && this.appOptions.canFillForms) {
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
            }
        },

        setBranding: function (value) {
            if ( value && value.logo) {
                var logo = $('#header-logo');
                if (value.logo.image || value.logo.imageDark) {
                    var image = Common.UI.Themes.isDarkTheme() ? (value.logo.imageDark || value.logo.image) : (value.logo.image || value.logo.imageDark);
                    logo.html('<img src="' + image + '" style="max-width:100px; max-height:20px;"/>');
                    logo.css({'background-image': 'none', width: 'auto', height: 'auto'});
                }

                if (value.logo.url) {
                    logo.attr('href', value.logo.url);
                } else if (value.logo.url!==undefined) {
                    logo.removeAttr('href');logo.removeAttr('target');
                }
            }
        },

        onLongActionBegin: function(type, id) {
            var action = {id: id, type: type};
            this.stackLongActions.push(action);
            this.setLongActionView(action);
        },

        setLongActionView: function(action) {
            var title = '', text = '', force = false;
            switch (action.id)
            {
                case Asc.c_oAscAsyncAction['Print']:
                    text = this.downloadTextText;
                    break;
                case Asc.c_oAscAsyncAction['Submit']:
                    _submitFail = false;
                    this.submitedTooltip && this.submitedTooltip.hide();
                    this.view.btnSubmit.setDisabled(true);
                    this.view.btnSubmit.cmpEl.css("pointer-events", "none");
                    break;
                case LoadingDocument:
                    text = this.textLoadingDocument + '           ';
                    break;
                default:
                    text = this.waitText;
                    break;
            }

            if (action.type == Asc.c_oAscAsyncActionType['BlockInteraction']) {
                if (!this.loadMask)
                    this.loadMask = new Common.UI.LoadMask({owner: $(document.body)});

                this.loadMask.setTitle(text);
                this.loadMask.show();
            }
        },

        onLongActionEnd: function(type, id){
             var action = {id: id, type: type};
             this.stackLongActions.pop(action);

            this.updateWindowTitle(true);

             action = this.stackLongActions.get({type: Asc.c_oAscAsyncActionType.Information});
             action && this.setLongActionView(action);
             action = this.stackLongActions.get({type: Asc.c_oAscAsyncActionType.BlockInteraction});
             action ? this.setLongActionView(action) : this.loadMask && this.loadMask.hide();

             if (id==Asc.c_oAscAsyncAction['Submit']) {
                 this.view.btnSubmit.setDisabled(false);
                 this.view.btnSubmit.cmpEl.css("pointer-events", "auto");
                if (!_submitFail) {
                    if (!this.submitedTooltip) {
                        var me = this;
                        this.submitedTooltip = $('<div class="submit-tooltip" style="display:none;">' + this.textSubmited + '</div>');
                        $(document.body).append(this.submitedTooltip);
                        this.submitedTooltip.on('click', function() {me.submitedTooltip.hide();});
                    }
                    this.submitedTooltip.show();
                }
            }
             if ( type == Asc.c_oAscAsyncActionType.BlockInteraction &&
                 !((id == Asc.c_oAscAsyncAction['LoadDocumentFonts'] || id == Asc.c_oAscAsyncAction['ApplyChanges'] || id == Asc.c_oAscAsyncAction['DownloadAs']) && Common.Utils.ModalWindow.isVisible()) ) {
                 this.api.asc_enableKeyEvents(true);
             }
        },

        onAdvancedOptions: function(type, advOptions, mode, formatOptions) {
            if (this._openDlg) return;

            var me = this;
            if (type == Asc.c_oAscAdvancedOptionsID.DRM) {
                me._openDlg = new Common.Views.OpenDialog({
                    title: Common.Views.OpenDialog.prototype.txtTitleProtected,
                    closeFile: me.appOptions.canRequestClose,
                    type: Common.Utils.importTextType.DRM,
                    warning: !(me.appOptions.isDesktopApp && me.appOptions.isOffline) && (typeof advOptions == 'string'),
                    warningMsg: advOptions,
                    validatePwd: !!me._isDRM,
                    iconType: 'svg',
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
                        me._openDlg = null;
                    }
                });
                me._isDRM = true;
            }
            if (me._openDlg) {
                this.isShowOpenDialog = true;
                this.loadMask && this.loadMask.hide();
                this.onLongActionEnd(Asc.c_oAscAsyncActionType.BlockInteraction, LoadingDocument);
                me._openDlg.show();
            }
        },

        onDocMouseMoveStart: function() {
            screenTip.isHidden = true;
        },

        onDocMouseMoveEnd: function() {
            var me = this;
            if (screenTip.isHidden && screenTip.isVisible) {
                screenTip.isVisible = false;
                isTooltipHiding = true;
                screenTip.toolTip.hide(function(){
                    isTooltipHiding = false;
                    if (mouseMoveData) me.onDocMouseMove(mouseMoveData);
                    mouseMoveData = null;
                });
            }
        },

        onDocMouseMove: function(data) {
            var me = this;
            if (data) {
                var type = data.get_Type();
                if (type == Asc.c_oAscMouseMoveDataTypes.Hyperlink || type==Asc.c_oAscMouseMoveDataTypes.Form) { // hyperlink
                    if (isTooltipHiding) {
                        mouseMoveData = data;
                        return;
                    }

                    var str = (type == Asc.c_oAscMouseMoveDataTypes.Hyperlink) ? me.txtPressLink : data.get_FormHelpText();
                    if (str.length>500)
                        str = str.substr(0, 500) + '...';
                    str = Common.Utils.String.htmlEncode(str);

                    var recalc = false;
                    screenTip.isHidden = false;

                    if (screenTip.tipType !== type || screenTip.tipLength !== str.length || screenTip.strTip.indexOf(str)<0 ) {
                        screenTip.toolTip.setTitle(str);
                        screenTip.tipLength = str.length;
                        screenTip.strTip = str;
                        screenTip.tipType = type;
                        recalc = true;
                    }

                    var showPoint = [data.get_X()+5, data.get_Y() + ttOffset[1]-15];

                    if (!screenTip.isVisible || recalc) {
                        screenTip.isVisible = true;
                        screenTip.toolTip.show([-10000, -10000]);
                    }

                    if ( recalc ) {
                        screenTip.tipHeight = screenTip.toolTip.getBSTip().$tip.height();
                        screenTip.tipWidth = screenTip.toolTip.getBSTip().$tip.width();
                    }

                    !bodyWidth && (bodyWidth = $('body').width());

                    recalc = false;
                    if (showPoint[0] + screenTip.tipWidth > bodyWidth ) {
                        showPoint[0] = bodyWidth - screenTip.tipWidth;
                        recalc = true;
                    }
                    if (showPoint[1] - screenTip.tipHeight < 0) {
                        showPoint[1] = (recalc) ? showPoint[1]+30 : 0;
                    } else
                        showPoint[1] -= screenTip.tipHeight;

                    screenTip.toolTip.getBSTip().$tip.css({top: showPoint[1] + 'px', left: showPoint[0] + 'px'});
                }
            }
        },

        onDownloadUrl: function(url, fileType) {
            if (this.isFromBtnDownload) { // download as pdf
                var me = this,
                    defFileName = this.embedConfig.docTitle;
                !defFileName && (defFileName = me.txtUntitled);

                var idx = defFileName.lastIndexOf('.');
                if (idx>0)
                    defFileName = defFileName.substring(0, idx) + '.pdf';

                if (me.appOptions.canRequestSaveAs) {
                    Common.Gateway.requestSaveAs(url, defFileName, fileType);
                } else {
                    me._saveCopyDlg = new Common.Views.SaveAsDlg({
                        saveFolderUrl: me.appOptions.saveAsUrl,
                        saveFileUrl: url,
                        defFileName: defFileName
                    });
                    me._saveCopyDlg.on('saveaserror', function(obj, err){
                        Common.UI.warning({
                            closable: false,
                            msg: err,
                            callback: function(btn){
                                Common.NotificationCenter.trigger('edit:complete', me);
                            }
                        });
                    }).on('close', function(obj){
                        me._saveCopyDlg = undefined;
                    });
                    me._saveCopyDlg.show();
                }
            } else {
                Common.Gateway.downloadAs(url);
            }
            this.isFromBtnDownload = false;
        },

        onPrint: function() {
            if (!this.appOptions.canPrint || Common.Utils.ModalWindow.isVisible()) return;

            if (this.api)
                this.api.asc_Print(new Asc.asc_CDownloadOptions(null, Common.Utils.isChrome || Common.Utils.isOpera || Common.Utils.isGecko && Common.Utils.firefoxVersion>86)); // if isChrome or isOpera == true use asc_onPrintUrl event
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

        onFillRequiredFields: function(isFilled) {
            this.view.btnSubmit.setDisabled(!isFilled);
            this.view.btnSubmit.cmpEl.css("pointer-events", isFilled ? "auto" : "none");
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
            Common.Gateway.requestClose();
        },

        onDownloadAs: function() {
            if ( !this.appOptions.canDownload ) {
                Common.Gateway.reportError(Asc.c_oAscError.ID.AccessDeny, this.errorAccessDeny);
                return;
            }
            var type = /^(?:(pdf|djvu|xps|oxps))$/.exec(this.document.fileType);
            if (type && typeof type[1] === 'string')
                this.api.asc_DownloadOrigin(true);
            else
                this.api.asc_DownloadAs(new Asc.asc_CDownloadOptions(Asc.c_oAscFileType.DOCX, true));
        },

        onHyperlinkClick: function(url) {
            if (url /*&& me.api.asc_getUrlType(url)>0*/) {
                window.open(url);
            }
        },

        onShowContentControlsActions: function(obj, x, y) {
            if (this._isDisabled) return;

            var me = this;
            switch (obj.type) {
                case Asc.c_oAscContentControlSpecificType.DateTime:
                    this.onShowDateActions(obj, x, y);
                    break;
                case Asc.c_oAscContentControlSpecificType.Picture:
                    if (obj.pr && obj.pr.get_Lock) {
                        var lock = obj.pr.get_Lock();
                        if (lock == Asc.c_oAscSdtLockType.SdtContentLocked || lock==Asc.c_oAscSdtLockType.ContentLocked)
                            return;
                    }
                    this.onShowImageActions(obj, x, y);
                    break;
                case Asc.c_oAscContentControlSpecificType.DropDownList:
                case Asc.c_oAscContentControlSpecificType.ComboBox:
                    this.onShowListActions(obj, x, y);
                    break;
            }
        },

        onHideContentControlsActions: function() {
            this.listControlMenu && this.listControlMenu.isVisible() && this.listControlMenu.hide();
            var controlsContainer = this.boxSdk.find('#calendar-control-container');
            if (controlsContainer.is(':visible'))
                controlsContainer.hide();
        },

        onShowImageActions: function(obj, x, y) {
            var menu = this.imageControlMenu,
                menuContainer = menu ? this.boxSdk.find(Common.Utils.String.format('#menu-container-{0}', menu.id)) : null,
                me = this;

            this.internalFormObj = obj && obj.pr ? obj.pr.get_InternalId() : null;
            this._fromShowContentControls = true;
            Common.UI.Menu.Manager.hideAll();

            if (!menu) {
                this.imageControlMenu = menu = new Common.UI.Menu({
                    maxHeight: 207,
                    menuAlign: 'tl-bl',
                    items: [
                        {caption: this.mniImageFromFile, value: 'file'},
                        {caption: this.mniImageFromUrl, value: 'url'},
                        {caption: this.mniImageFromStorage, value: 'storage', visible: this.appOptions.canRequestInsertImage || this.appOptions.fileChoiceUrl && this.appOptions.fileChoiceUrl.indexOf("{documentType}")>-1}
                    ]
                });
                menu.on('item:click', function(menu, item) {
                    setTimeout(function(){
                        me.onImageSelect(menu, item);
                    }, 1);
                    setTimeout(function(){
                        me.api.asc_UncheckContentControlButtons();
                    }, 500);
                });

                // Prepare menu container
                if (!menuContainer || menuContainer.length < 1) {
                    menuContainer = $(Common.Utils.String.format('<div id="menu-container-{0}" style="position: absolute; z-index: 10000;"><div class="dropdown-toggle" data-toggle="dropdown"></div></div>', menu.id));
                    this.boxSdk.append(menuContainer);
                }

                menu.render(menuContainer);
                menu.cmpEl.attr({tabindex: "-1"});
                menu.on('hide:after', function(){
                    if (!me._fromShowContentControls)
                        me.api.asc_UncheckContentControlButtons();
                });
            }
            menuContainer.css({left: x, top : y});
            menuContainer.attr('data-value', 'prevent-canvas-click');
            this._preventClick = true;
            menu.show();

            _.delay(function() {
                menu.cmpEl.focus();
            }, 10);
            this._fromShowContentControls = false;
        },

        onImageSelect: function(menu, item) {
            if (item.value=='url') {
                var me = this;
                (new Common.Views.ImageFromUrlDialog({
                    handler: function(result, value) {
                        if (result == 'ok') {
                            if (me.api) {
                                var checkUrl = value.replace(/ /g, '');
                                if (!_.isEmpty(checkUrl)) {
                                    me.setImageUrl(checkUrl);
                                }
                            }
                        }
                    }
                })).show();
            } else if (item.value=='storage') {
                Common.NotificationCenter.trigger('storage:image-load', 'control');
            } else {
                if (this._isFromFile) return;
                this._isFromFile = true;
                this.api.asc_addImage(this.internalFormObj);
                this._isFromFile = false;
            }
        },

        openImageFromStorage: function(type) {
            var me = this;
            if (this.appOptions.canRequestInsertImage) {
                Common.Gateway.requestInsertImage(type);
            } else {
                (new Common.Views.SelectFileDlg({
                    fileChoiceUrl: this.appOptions.fileChoiceUrl.replace("{fileExt}", "").replace("{documentType}", "ImagesOnly")
                })).on('selectfile', function(obj, file){
                    file && (file.c = type);
                    !file.images && (file.images = [{fileType: file.fileType, url: file.url}]); // SelectFileDlg uses old format for inserting image
                    file.url = null;
                    me.insertImage(file);
                }).show();
            }
        },

        setImageUrl: function(url, token) {
            this.api.asc_SetContentControlPictureUrl(url, this.internalFormObj && this.internalFormObj.pr ? this.internalFormObj.pr.get_InternalId() : null, token);
        },

        insertImage: function(data) { // gateway
            if (data && (data.url || data.images)) {
                data.url && console.log("Obsolete: The 'url' parameter of the 'insertImage' method is deprecated. Please use 'images' parameter instead.");

                var arr = [];
                if (data.images && data.images.length>0) {
                    for (var i=0; i<data.images.length; i++) {
                        data.images[i] && data.images[i].url && arr.push( data.images[i].url);
                    }
                } else
                    data.url && arr.push(data.url);
                data._urls = arr;
            }
            Common.NotificationCenter.trigger('storage:image-insert', data);
        },

        insertImageFromStorage: function(data) {
            if (data && data._urls && data.c=='control') {
                this.setImageUrl(data._urls[0], data.token);
            }
        },

        onShowListActions: function(obj, x, y) {
            var type = obj.type,
                props = obj.pr,
                specProps = (type == Asc.c_oAscContentControlSpecificType.ComboBox) ? props.get_ComboBoxPr() : props.get_DropDownListPr(),
                isForm = !!props.get_FormPr(),
                menu = this.listControlMenu,
                menuContainer = menu ? this.boxSdk.find(Common.Utils.String.format('#menu-container-{0}', menu.id)) : null,
                me = this;

            this._listObj = props;

            this._fromShowContentControls = true;
            Common.UI.Menu.Manager.hideAll();

            if (!menu) {
                this.listControlMenu = menu = new Common.UI.Menu({
                    maxHeight: 207,
                    menuAlign: 'tr-bl',
                    items: []
                });
                menu.on('item:click', function(menu, item) {
                    setTimeout(function(){
                        (item.value!==-1) && me.api.asc_SelectContentControlListItem(item.value, me._listObj.get_InternalId());
                    }, 1);
                });

                // Prepare menu container
                if (!menuContainer || menuContainer.length < 1) {
                    menuContainer = $(Common.Utils.String.format('<div id="menu-container-{0}" style="position: absolute; z-index: 10000;"><div class="dropdown-toggle" data-toggle="dropdown"></div></div>', menu.id));
                    this.boxSdk.append(menuContainer);
                }

                menu.render(menuContainer);
                menu.cmpEl.attr({tabindex: "-1"});
                menu.on('hide:after', function(){
                    me.listControlMenu.removeAll();
                    if (!me._fromShowContentControls)
                        me.api.asc_UncheckContentControlButtons();
                });
            }
            if (specProps) {
                if (isForm){ // for dropdown and combobox form control always add placeholder item
                    var text = props.get_PlaceholderText();
                    menu.addItem(new Common.UI.MenuItem({
                        caption     : (text.trim()!=='') ? text : this.txtEmpty,
                        value       : '',
                        template    : _.template([
                            '<a id="<%= id %>" tabindex="-1" type="menuitem" style="<% if (options.value=="") { %> opacity: 0.6 <% } %>">',
                            '<%= caption %>',
                            '</a>'
                        ].join(''))
                    }));
                }
                var count = specProps.get_ItemsCount();
                for (var i=0; i<count; i++) {
                    (specProps.get_ItemValue(i)!=='' || !isForm) && menu.addItem(new Common.UI.MenuItem({
                        caption     : specProps.get_ItemDisplayText(i),
                        value       : specProps.get_ItemValue(i),
                        template    : _.template([
                            '<a id="<%= id %>" style="<%= style %>" tabindex="-1" type="menuitem">',
                            '<%= Common.Utils.String.htmlEncode(caption) %>',
                            '</a>'
                        ].join(''))
                    }));
                }
                if (!isForm && menu.items.length<1) {
                    menu.addItem(new Common.UI.MenuItem({
                        caption     : this.txtEmpty,
                        value       : -1
                    }));
                }
            }

            menuContainer.css({left: x, top : y});
            menuContainer.attr('data-value', 'prevent-canvas-click');
            this._preventClick = true;
            menu.show();

            _.delay(function() {
                menu.cmpEl.focus();
            }, 10);
            this._fromShowContentControls = false;
        },

        onShowDateActions: function(obj, x, y) {
            var props = obj.pr,
                specProps = props.get_DateTimePr(),
                controlsContainer = this.boxSdk.find('#calendar-control-container'),
                me = this;

            this._dateObj = props;

            if (controlsContainer.length < 1) {
                controlsContainer = $('<div id="calendar-control-container" style="position: absolute;z-index: 1000;"><div id="id-document-calendar-control" style="position: fixed; left: -1000px; top: -1000px;"></div></div>');
                this.boxSdk.append(controlsContainer);
            }

            Common.UI.Menu.Manager.hideAll();

            controlsContainer.css({left: x, top : y});
            controlsContainer.show();

            if (!this.cmpCalendar) {
                this.cmpCalendar = new Common.UI.Calendar({
                    el: this.boxSdk.find('#id-document-calendar-control'),
                    enableKeyEvents: true,
                    firstday: 1
                });
                this.cmpCalendar.on('date:click', function (cmp, date) {
                    var specProps = me._dateObj.get_DateTimePr();
                    specProps.put_FullDate(new  Date(date));
                    me.api.asc_SetContentControlDatePickerDate(specProps);
                    controlsContainer.hide();
                    me.api.asc_UncheckContentControlButtons();
                });
                this.cmpCalendar.on('calendar:keydown', function (cmp, e) {
                    if (e.keyCode==Common.UI.Keys.ESC) {
                        controlsContainer.hide();
                        me.api.asc_UncheckContentControlButtons();
                    }
                });
                $(document).on('mousedown', function(e) {
                    if (e.target.localName !== 'canvas' && controlsContainer.is(':visible') && controlsContainer.find(e.target).length==0) {
                        controlsContainer.hide();
                        me.api.asc_UncheckContentControlButtons();
                    }
                });

            }
            var val = specProps ? specProps.get_FullDate() : undefined;
            this.cmpCalendar.setDate(val ? new Date(val) : new Date());

            // align
            var offset  = controlsContainer.offset(),
                docW    = Common.Utils.innerWidth(),
                docH    = Common.Utils.innerHeight() - 10, // Yep, it's magic number
                menuW   = this.cmpCalendar.cmpEl.outerWidth(),
                menuH   = this.cmpCalendar.cmpEl.outerHeight(),
                buttonOffset = 22,
                left = offset.left - menuW,
                top  = offset.top;
            if (top + menuH > docH) {
                top = docH - menuH;
                left -= buttonOffset;
            }
            if (top < 0)
                top = 0;
            if (left + menuW > docW)
                left = docW - menuW;
            this.cmpCalendar.cmpEl.css({left: left, top : top});

            this._preventClick = true;
        },

        onDocumentContentReady: function() {
            if (this._isDocReady)
                return;

            var me = this;
            me._isDocReady = true;
            this.hidePreloader();
            this.onLongActionEnd(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);

            var zf = (this.appOptions.customization && this.appOptions.customization.zoom ? parseInt(this.appOptions.customization.zoom) : 100);
            (zf == -1) ? this.api.zoomFitToPage() : ((zf == -2) ? this.api.zoomFitToWidth() : this.api.zoom(zf>0 ? zf : 100));

            this.createDelayedElements();

            this.api.asc_registerCallback('asc_onStartAction',           _.bind(this.onLongActionBegin, this));
            this.api.asc_registerCallback('asc_onEndAction',             _.bind(this.onLongActionEnd, this));
            this.api.asc_registerCallback('asc_onMouseMoveStart',        _.bind(this.onDocMouseMoveStart, this));
            this.api.asc_registerCallback('asc_onMouseMoveEnd',          _.bind(this.onDocMouseMoveEnd, this));
            this.api.asc_registerCallback('asc_onMouseMove',             _.bind(this.onDocMouseMove, this));
            this.api.asc_registerCallback('asc_onHyperlinkClick',        _.bind(this.onHyperlinkClick, this));
            this.api.asc_registerCallback('asc_onDownloadUrl',           _.bind(this.onDownloadUrl, this));
            this.api.asc_registerCallback('asc_onPrint',                 _.bind(this.onPrint, this));
            this.api.asc_registerCallback('asc_onPrintUrl',              _.bind(this.onPrintUrl, this));
            this.api.asc_registerCallback('sync_onAllRequiredFormsFilled', _.bind(this.onFillRequiredFields, this));
            this.api.asc_registerCallback('asc_onContextMenu',           _.bind(this.onContextMenu, this));
            if (this.appOptions.canFillForms) {
                this.api.asc_registerCallback('asc_onShowContentControlsActions', _.bind(this.onShowContentControlsActions, this));
                this.api.asc_registerCallback('asc_onHideContentControlsActions', _.bind(this.onHideContentControlsActions, this));
                this.api.asc_registerCallback('asc_onCanUndo', _.bind(this.onApiCanRevert, this, 'undo'));
                this.api.asc_registerCallback('asc_onCanRedo', _.bind(this.onApiCanRevert, this, 'redo'));
                this.api.asc_SetHighlightRequiredFields(true);
                Common.Gateway.on('insertimage',        _.bind(this.insertImage, this));
                Common.NotificationCenter.on('storage:image-load', _.bind(this.openImageFromStorage, this)); // try to load image from storage
                Common.NotificationCenter.on('storage:image-insert', _.bind(this.insertImageFromStorage, this)); // set loaded image to control
            }
            DE.getController('Plugins').setApi(this.api);
            DE.getController('SearchBar').setApi(this.api);

            this.updateWindowTitle(true);

            if (this.editorConfig.mode !== 'view') // if want to open editor, but viewer is loaded
                this.applyLicense();

            Common.Gateway.on('processmouse',       _.bind(this.onProcessMouse, this));
            Common.Gateway.on('downloadas',         _.bind(this.onDownloadAs, this));
            Common.Gateway.on('requestclose',       _.bind(this.onRequestClose, this));

            this.attachUIEvents();

            Common.Gateway.documentReady();
            Common.Analytics.trackEvent('Load', 'Complete');
        },

        onOptionsClick: function(menu, item, e) {
            switch (item.value) {
                case 'fullscr':
                    this.onHyperlinkClick(this.embedConfig.fullscreenUrl);
                    break;
                case 'download':
                    if ( !!this.embedConfig.saveUrl ){
                        this.onHyperlinkClick(this.embedConfig.saveUrl);
                    } else if (this.api && this.appOptions.canPrint){
                        this.api.asc_Print(new Asc.asc_CDownloadOptions(null, Common.Utils.isChrome || Common.Utils.isOpera || Common.Utils.isGecko && Common.Utils.firefoxVersion>86)); // if isChrome or isOpera == true use asc_onPrintUrl event
                    }
                    Common.Analytics.trackEvent('Save');
                    break;
                case 'print':
                    this.api.asc_Print(new Asc.asc_CDownloadOptions(null, Common.Utils.isChrome || Common.Utils.isOpera || Common.Utils.isGecko && Common.Utils.firefoxVersion>86)); // if isChrome or isOpera == true use asc_onPrintUrl event
                    Common.Analytics.trackEvent('Print');
                    break;
                case 'close':
                    if (!Common.Controllers.Desktop.process('goback') &&
                            this.appOptions.customization && this.appOptions.customization.goback)
                    {
                        if (this.appOptions.customization.goback.requestClose && this.appOptions.canRequestClose)
                            Common.Gateway.requestClose();
                        else if (this.appOptions.customization.goback.url) {
                            if (this.appOptions.customization.goback.blank!==false) {
                                window.open(this.appOptions.customization.goback.url, "_blank");
                            } else {
                                window.parent.location.href = this.appOptions.customization.goback.url;
                            }
                        }
                    }
                    break;
                case 'download-docx':
                    this.api.asc_DownloadAs(new Asc.asc_CDownloadOptions(Asc.c_oAscFileType.DOCX));
                    Common.Analytics.trackEvent('Save');
                    break;
                case 'download-pdf':
                    this.api.asc_DownloadAs(new Asc.asc_CDownloadOptions(Asc.c_oAscFileType.PDF));
                    Common.Analytics.trackEvent('Save');
                    break;
                case 'share':
                    (new Common.Views.ShareDialog({
                        embedConfig: this.embedConfig
                    })).show();
                    break;
                case 'embed':
                    (new Common.Views.EmbedDialog({
                        embedConfig: this.embedConfig
                    })).show();
                    break;
                case 'search':
                    Common.NotificationCenter.trigger('search:show');
                    break;
            }
        },

        onThemeClick: function(menu, item) {
            (item.value!==null) && Common.UI.Themes.setTheme(item.value);
        },
        onApiZoomChange: function(percent, type) {
            this.view.mnuZoom.items[0].setChecked(type == 2, true);
            this.view.mnuZoom.items[1].setChecked(type == 1, true);
            this.view.mnuZoom.options.value = percent;

            if ( this.view.mnuZoom.$el )
                $('.menu-zoom label.zoom', this.view.mnuZoom.$el).html(percent + '%');
        },

        onMenuZoomClick: function(menu, item, e){
            switch ( item.value ) {
                case 'zoom:page':
                    item.isChecked() ? this.api.zoomFitToPage() : this.api.zoomCustomMode();
                    break;
                case 'zoom:width':
                    item.isChecked() ? this.api.zoomFitToWidth() : this.api.zoomCustomMode();
                    break;
            }

        },
        onBtnZoom: function (btn, e) {
            btn == 'up' ? this.api.zoomIn() : this.api.zoomOut();
            e.stopPropagation();
        },

        onDarkModeClick: function(item) {
            Common.UI.Themes.toggleContentTheme();
        },

        onThemeChange: function() {
            var current = Common.UI.Themes.currentThemeId();
            _.each(this.view.mnuThemes.items, function(item){
                item.setChecked(current===item.value, true);
            });
            if (this.view.menuItemsDarkMode) {
                this.view.menuItemsDarkMode.setDisabled(!Common.UI.Themes.isDarkTheme());
                this.view.menuItemsDarkMode.setChecked(Common.UI.Themes.isContentThemeDark());
            }

            if (this.appOptions.canBranding) {
                var value = this.appOptions.customization;
                if ( value && value.logo && (value.logo.image || value.logo.imageDark) && (value.logo.image !== value.logo.imageDark)) {
                    var image = Common.UI.Themes.isDarkTheme() ? (value.logo.imageDark || value.logo.image) : (value.logo.image || value.logo.imageDark);
                    $('#header-logo img').attr('src', image);
                }
            }
        },

        onContentThemeChangedToDark: function (isdark) {
            this.view.menuItemsDarkMode.setChecked(isdark, true);
        },

        createDelayedElements: function() {
            var me = this,
                menuItems = this.view.btnOptions.menu.items,
                itemsCount = menuItems.length-4;
            var initMenu = function(menu) {
                var last; // divider item

                // download and print
                if (!menuItems[0].isVisible() && !menuItems[1].isVisible() && !menuItems[2].isVisible() && !menuItems[3].isVisible())
                    menuItems[4].setVisible(false);
                else
                    last = menuItems[4];

                // theme and zoom
                if (!menuItems[7].isVisible() && !menuItems[8].isVisible())
                    menuItems[9].setVisible(false);
                else
                    last = menuItems[9];

                // share, location
                if (!menuItems[10].isVisible() && !menuItems[11].isVisible())
                    menuItems[12].setVisible(false);
                else
                    last = menuItems[12];

                // embed, fullscreen
                if (!menuItems[13].isVisible() && !menuItems[14].isVisible())
                    last && last.setVisible(false);

                menu.off('show:after', initMenu);
            };

            if (!this.appOptions.canPrint) {
                menuItems[3].setVisible(false);
                itemsCount--;
            }

            if ( !this.embedConfig.saveUrl || !this.appOptions.canDownload || this.appOptions.isOFORM) {
                menuItems[0].setVisible(false);
                itemsCount--;
            }

            if ( !this.appOptions.isOFORM || !this.appOptions.canDownload || this.appOptions.isOffline) {
                menuItems[1].setVisible(false);
                menuItems[2].setVisible(false);
                itemsCount -= 2;
            }

            if (Common.UI.Themes.available()) {
                var current = Common.UI.Themes.currentThemeId();
                for (var t in Common.UI.Themes.map()) {
                    this.view.mnuThemes.addItem(new Common.UI.MenuItem({
                        caption     : Common.UI.Themes.get(t).text,
                        value       : t,
                        toggleGroup : 'themes',
                        checkable   : true,
                        checked     : t===current
                    }));
                }
            }
            if (this.view.mnuThemes.items.length<1) {
                menuItems[7].setVisible(false);
                itemsCount--;
            } else {
                this.view.menuItemsDarkMode = new Common.UI.MenuItem({
                    caption: this.view.txtDarkMode,
                    checkable: true,
                    checked: Common.UI.Themes.isContentThemeDark(),
                    disabled: !Common.UI.Themes.isDarkTheme()
                });
                this.view.mnuThemes.addItem(new Common.UI.MenuItem({caption     :  '--'}));
                this.view.mnuThemes.addItem(this.view.menuItemsDarkMode);
                this.view.mnuThemes.on('item:click', _.bind(this.onThemeClick, this));
                this.view.menuItemsDarkMode.on('click', _.bind(this.onDarkModeClick, this));
                Common.NotificationCenter.on('uitheme:changed', this.onThemeChange.bind(this));
                Common.NotificationCenter.on('contenttheme:dark', this.onContentThemeChangedToDark.bind(this));
            }

            if ( !this.embedConfig.shareUrl || this.appOptions.isOFORM) {
                menuItems[10].setVisible(false);
                itemsCount--;
            }

            if (!this.appOptions.canBackToFolder) {
                menuItems[11].setVisible(false);
                itemsCount--;
            } else {
                var text = this.appOptions.customization.goback.text;
                text && (typeof text == 'string') && menuItems[11].setCaption(text);
            }

            if ( !this.embedConfig.embedUrl || this.appOptions.isOFORM) {
                menuItems[13].setVisible(false);
                itemsCount--;
            }

            if ( !this.embedConfig.fullscreenUrl || this.appOptions.isOFORM) {
                menuItems[14].setVisible(false);
                itemsCount--;
            }
            if (itemsCount<1)
                this.view.btnOptions.setVisible(false);

            this.view.btnOptions.menu.on('show:after', initMenu);

            screenTip = {
                toolTip: new Common.UI.Tooltip({
                    owner: this,
                    html: true,
                    title: this.txtPressLink,
                    cls: 'link-tooltip'
                }),
                strTip: '',
                isHidden: true,
                isVisible: false
            };
        },

        attachUIEvents: function() {
            var me = this;

            // zoom
            $('#id-btn-zoom-in').on('click', this.api.zoomIn.bind(this.api));
            $('#id-btn-zoom-out').on('click', this.api.zoomOut.bind(this.api));
            $('#id-menu-zoom-in').on('click', _.bind(this.onBtnZoom, this,'up'));
            $('#id-menu-zoom-out').on('click', _.bind(this.onBtnZoom, this,'down'));
            this.view.btnOptions.menu.on('item:click', _.bind(this.onOptionsClick, this));
            this.view.mnuZoom.on('item:click', _.bind(this.onMenuZoomClick, this));


            // pages
            var $pagenum = this.view.txtGoToPage._input;
            this.view.txtGoToPage.on({
                'changed:after': function(input, newValue, oldValue){
                    var newPage = parseInt(newValue);

                    if ( newPage > maxPages ) newPage = maxPages;
                    if (newPage < 2 || isNaN(newPage)) newPage = 1;

                    me.api.goToPage(newPage-1);
                },
                'inputleave': function(){ $pagenum.blur();}
            });
            $pagenum.on({
                'focusin' : function(e) {
                    $pagenum.removeClass('masked');
                    $pagenum.select();
                },
                'focusout': function(e){
                    !$pagenum.hasClass('masked') && $pagenum.addClass('masked');
                }
            });
            $('#pages').on('click', function(e) {
                setTimeout(function() {$pagenum.focus().select();}, 10);
            });

            // TODO: add asc_hasRequiredFields to sdk

            if (this.appOptions.canSubmitForms && !this.api.asc_IsAllRequiredFormsFilled()) {
                this.view.btnSubmit.setDisabled(true);
                this.view.btnSubmit.cmpEl.css("pointer-events", "none");
                var sgroup = $('#id-submit-group');
                if (!Common.localStorage.getItem("de-embed-hide-submittip")) {
                    var requiredTooltip = new Common.UI.SynchronizeTip({
                        extCls: 'colored',
                        placement: 'bottom-left',
                        target: this.view.btnSubmit.$el,
                        text: this.textRequired,
                        showLink: false,
                        closable: false,
                        showButton: true,
                        textButton: this.textGotIt
                    });
                    var onclose = function () {
                        requiredTooltip.hide();
                        me.api.asc_MoveToFillingForm(true, true, true);
                        sgroup.attr('data-toggle', 'tooltip');
                        sgroup.tooltip({
                            title       : me.textRequired,
                            placement   : 'bottom'
                        });
                    };
                    requiredTooltip.on('buttonclick', function () {
                        onclose();
                        Common.localStorage.setItem("de-embed-hide-submittip", 1);
                    });
                    requiredTooltip.on('closeclick', onclose);
                    requiredTooltip.show();
                } else {
                    sgroup.attr('data-toggle', 'tooltip');
                    sgroup.tooltip({
                        title       : me.textRequired,
                        placement   : 'bottom'
                    });
                }
            }

            var documentMoveTimer;
            var ismoved = false;
            $(document).mousemove(function(event){
                $('#id-btn-zoom-in').fadeIn();
                $('#id-btn-zoom-out').fadeIn();

                ismoved = true;
                if ( !documentMoveTimer ) {
                    documentMoveTimer = setInterval(function(){
                        if ( !ismoved ) {
                            $('#id-btn-zoom-in').fadeOut();
                            $('#id-btn-zoom-out').fadeOut();
                            clearInterval(documentMoveTimer);
                            documentMoveTimer = undefined;
                        }

                        ismoved = false;
                    }, 2000);
                }
            });
        },

        onContextMenu: function(event){
            var me = this;
            _.delay(function(){
                if (event.get_Type() == 0) {
                    me.api && me.appOptions.canFillForms && me.fillMenuProps(me.api.getSelectedElements(), event);
                }
            },10);
        },

        showPopupMenu: function(menu, value, event){
            if (!_.isUndefined(menu)  && menu !== null){
                Common.UI.Menu.Manager.hideAll();

                var showPoint = [event.get_X(), event.get_Y()],
                    menuContainer = this.boxSdk.find(Common.Utils.String.format('#menu-container-{0}', menu.id));

                if (!menu.rendered) {
                    // Prepare menu container
                    if (menuContainer.length < 1) {
                        menuContainer = $(Common.Utils.String.format('<div id="menu-container-{0}" style="position: absolute; z-index: 10000;"><div class="dropdown-toggle" data-toggle="dropdown"></div></div>', menu.id));
                        this.boxSdk.append(menuContainer);
                    }

                    menu.render(menuContainer);
                    menu.cmpEl.attr({tabindex: "-1"});
                }

                menuContainer.css({
                    left: showPoint[0],
                    top : showPoint[1]
                });

                menu.show();

                if (_.isFunction(menu.options.initMenu)) {
                    menu.options.initMenu(value);
                    menu.alignPosition();
                }
                _.delay(function() {
                    menu.cmpEl.focus();
                }, 10);

                this.currentMenu = menu;
            }
        },

        fillMenuProps: function(selectedElements, event) {
            if (!selectedElements || !_.isArray(selectedElements)) return;

            if (!this.textMenu) {
                this.textMenu = this.view.getContextMenu();
                this.textMenu.on('item:click', _.bind(this.onContextMenuClick, this));
            }

            var menu_props = {},
                noobject = true;
            for (var i = 0; i <selectedElements.length; i++) {
                var elType = selectedElements[i].get_ObjectType();
                var elValue = selectedElements[i].get_ObjectValue();
                if (Asc.c_oAscTypeSelectElement.Image == elType) {
                    //image
                    menu_props.imgProps = {};
                    menu_props.imgProps.value = elValue;
                    menu_props.imgProps.locked = (elValue) ? elValue.get_Locked() : false;

                    var control_props = this.api.asc_IsContentControl() ? this.api.asc_GetContentControlProperties() : null,
                        lock_type = (control_props) ? control_props.get_Lock() : Asc.c_oAscSdtLockType.Unlocked;
                    menu_props.imgProps.content_locked = lock_type==Asc.c_oAscSdtLockType.SdtContentLocked || lock_type==Asc.c_oAscSdtLockType.ContentLocked;

                    noobject = false;
                } else if (Asc.c_oAscTypeSelectElement.Paragraph == elType) {
                    menu_props.paraProps = {};
                    menu_props.paraProps.value = elValue;
                    menu_props.paraProps.locked = (elValue) ? elValue.get_Locked() : false;
                    noobject = false;
                } else if (Asc.c_oAscTypeSelectElement.Header == elType) {
                    menu_props.headerProps = {};
                    menu_props.headerProps.locked = (elValue) ? elValue.get_Locked() : false;
                }
            }
            if (this.textMenu && !noobject) {
                var cancopy = this.api.can_CopyCut(),
                    disabled = menu_props.paraProps && menu_props.paraProps.locked || menu_props.headerProps && menu_props.headerProps.locked ||
                               menu_props.imgProps && (menu_props.imgProps.locked || menu_props.imgProps.content_locked) || this._isDisabled;
                this.textMenu.items[0].setDisabled(disabled || !this.api.asc_getCanUndo()); // undo
                this.textMenu.items[1].setDisabled(disabled || !this.api.asc_getCanRedo()); // redo

                this.textMenu.items[3].setDisabled(disabled); // clear
                this.textMenu.items[5].setDisabled(disabled || !cancopy); // cut
                this.textMenu.items[6].setDisabled(!cancopy); // copy
                this.textMenu.items[7].setDisabled(disabled) // paste;

                this.showPopupMenu(this.textMenu, {}, event);
            }
        },

        onContextMenuClick: function(menu, item, e) {
            switch (item.value) {
                case 'undo':
                    this.api && this.api.Undo();
                    break;
                case 'redo':
                    this.api && this.api.Redo();
                    break;
                case 'copy':
                case 'cut':
                case 'paste':
                    if (this.api) {
                        var res =  (item.value == 'cut') ? this.api.Cut() : ((item.value == 'copy') ? this.api.Copy() : this.api.Paste());
                        if (!res) {
                            if (!Common.localStorage.getBool("de-forms-hide-copywarning")) {
                                (new Common.Views.CopyWarningDialog({
                                    handler: function(dontshow) {
                                        if (dontshow) Common.localStorage.setItem("de-forms-hide-copywarning", 1);
                                    }
                                })).show();
                            }
                        }
                    }
                    break;
                case 'clear':
                    if (this.api) {
                        var props = this.api.asc_IsContentControl() ? this.api.asc_GetContentControlProperties() : null;
                        if (props) {
                            this.api.asc_ClearContentControl(props.get_InternalId());
                        }
                    }
                    break;
            }
        },

        onApiServerDisconnect: function(enableDownload) {
            this._state.isDisconnected = true;
            this._isDisabled = true;
            this.view && this.view.btnClear && this.view.btnClear.setDisabled(true);
            this.view && this.view.btnUndo && this.view.btnUndo.setDisabled(true);
            this.view && this.view.btnRedo && this.view.btnRedo.setDisabled(true);
            if (!enableDownload) {
                this.appOptions.canPrint = this.appOptions.canDownload = false;
                this.view && this.view.btnDownload.setDisabled(true);
                this.view && this.view.btnSubmit.setDisabled(true);
                if (this.view && this.view.btnOptions && this.view.btnOptions.menu) {
                    this.view.btnOptions.menu.items[3].setDisabled(true); // print
                    this.view.btnOptions.menu.items[0].setDisabled(true); // download
                    this.view.btnOptions.menu.items[1].setDisabled(true); // download docx
                    this.view.btnOptions.menu.items[2].setDisabled(true); // download pdf
                }
            }
        },

        onApiCanRevert: function(which, can) {
            if (!this.view) return;

            (which=='undo') ? this.view.btnUndo.setDisabled(!can) : this.view.btnRedo.setDisabled(!can);
        },

        errorDefaultMessage     : 'Error code: %1',
        unknownErrorText        : 'Unknown error.',
        convertationTimeoutText : 'Conversion timeout exceeded.',
        convertationErrorText   : 'Conversion failed.',
        downloadErrorText       : 'Download failed.',
        criticalErrorTitle      : 'Error',
        notcriticalErrorTitle   : 'Warning',
        scriptLoadError: 'The connection is too slow, some of the components could not be loaded. Please reload the page.',
        errorFilePassProtect: 'The file is password protected and cannot be opened.',
        errorAccessDeny: 'You are trying to perform an action you do not have rights for.<br>Please contact your Document Server administrator.',
        errorUserDrop: 'The file cannot be accessed right now.',
        unsupportedBrowserErrorText: 'Your browser is not supported.',
        textOf: 'of',
        downloadTextText: 'Downloading document...',
        waitText: 'Please, wait...',
        textLoadingDocument: 'Loading document',
        txtClose: 'Close',
        errorFileSizeExceed: 'The file size exceeds the limitation set for your server.<br>Please contact your Document Server administrator for details.',
        errorUpdateVersionOnDisconnect: 'Internet connection has been restored, and the file version has been changed.<br>Before you can continue working, you need to download the file or copy its content to make sure nothing is lost, and then reload this page.',
        textSubmited: '<b>Form submitted successfully</b><br>Click to close the tip.',
        errorSubmit: 'Submit failed.',
        errorEditingDownloadas: 'An error occurred during the work with the document.<br>Use the \'Download as...\' option to save the file backup copy to your computer hard drive.',
        textGuest: 'Guest',
        textAnonymous: 'Anonymous',
        textRequired: 'Fill all required fields to send form.',
        textGotIt: 'Got it',
        errorForceSave: "An error occurred while saving the file. Please use the 'Download as' option to save the file to your computer hard drive or try again later.",
        textCloseTip: "Click to close the tip.",
        txtPressLink: 'Press Ctrl and click link',
        txtEmpty: '(Empty)',
        titleServerVersion: 'Editor updated',
        errorServerVersion: 'The editor version has been updated. The page will be reloaded to apply the changes.',
        titleUpdateVersion: 'Version changed',
        errorUpdateVersion: 'The file version has been changed. The page will be reloaded.',
        warnLicenseLimitedRenewed: 'License needs to be renewed.<br>You have a limited access to document editing functionality.<br>Please contact your administrator to get full access',
        warnLicenseLimitedNoAccess: 'License expired.<br>You have no access to document editing functionality.<br>Please contact your administrator.',
        warnLicenseExceeded: "You've reached the limit for simultaneous connections to %1 editors. This document will be opened for viewing only.<br>Contact your administrator to learn more.",
        warnLicenseUsersExceeded: "You've reached the user limit for %1 editors. Contact your administrator to learn more.",
        warnNoLicense: "You've reached the limit for simultaneous connections to %1 editors. This document will be opened for viewing only.<br>Contact %1 sales team for personal upgrade terms.",
        warnNoLicenseUsers: "You've reached the user limit for %1 editors. Contact %1 sales team for personal upgrade terms.",
        textBuyNow: 'Visit website',
        textNoLicenseTitle: 'License limit reached',
        textContactUs: 'Contact sales',
        errorLoadingFont: 'Fonts are not loaded.<br>Please contact your Document Server administrator.',
        errorConnectToServer: 'The document could not be saved. Please check connection settings or contact your administrator.<br>When you click the \'OK\' button, you will be prompted to download the document.',
        errorTokenExpire: 'The document security token has expired.<br>Please contact your Document Server administrator.',
        errorViewerDisconnect: 'Connection is lost. You can still view the document,<br>but will not be able to download or print until the connection is restored and page is reloaded.',
        uploadImageSizeMessage: 'Maximum image size limit exceeded.',
        uploadImageExtMessage: 'Unknown image format.',
        txtArt: 'Your text here',
        txtChoose: 'Choose an item',
        txtEnterDate: 'Enter a date',
        txtClickToLoad: 'Click to load image',
        openErrorText: 'An error has occurred while opening the file',
        mniImageFromFile: 'Image from File',
        mniImageFromUrl: 'Image from URL',
        mniImageFromStorage: 'Image from Storage',
        txtUntitled: 'Untitled',
        errorToken: 'The document security token is not correctly formed.<br>Please contact your Document Server administrator.',
        errorSessionAbsolute: 'The document editing session has expired. Please reload the page.',
        errorSessionIdle: 'The document has not been edited for quite a long time. Please reload the page.',
        errorSessionToken: 'The connection to the server has been interrupted. Please reload the page.',
        errorBadImageUrl: 'Image url is incorrect',
        errorDataEncrypted: 'Encrypted changes have been received, they cannot be deciphered.',
        saveErrorText: 'An error has occurred while saving the file',
        saveErrorTextDesktop: 'This file cannot be saved or created.<br>Possible reasons are: <br>1. The file is read-only. <br>2. The file is being edited by other users. <br>3. The disk is full or corrupted.',
        errorEditingSaveas: 'An error occurred during the work with the document.<br>Use the \'Save as...\' option to save the file backup copy to your computer hard drive.',
        textSaveAs: 'Save as PDF',
        textSaveAsDesktop: 'Save as...',
        warnLicenseExp: 'Your license has expired.<br>Please update your license and refresh the page.',
        titleLicenseExp: 'License expired',
        errorTextFormWrongFormat: 'The value entered does not match the format of the field.',
        errorInconsistentExtDocx: 'An error has occurred while opening the file.<br>The file content corresponds to text documents (e.g. docx), but the file has the inconsistent extension: %1.',
        errorInconsistentExtXlsx: 'An error has occurred while opening the file.<br>The file content corresponds to spreadsheets (e.g. xlsx), but the file has the inconsistent extension: %1.',
        errorInconsistentExtPptx: 'An error has occurred while opening the file.<br>The file content corresponds to presentations (e.g. pptx), but the file has the inconsistent extension: %1.',
        errorInconsistentExtPdf: 'An error has occurred while opening the file.<br>The file content corresponds to one of the following formats: pdf/djvu/xps/oxps, but the file has the inconsistent extension: %1.',
        errorInconsistentExt: 'An error has occurred while opening the file.<br>The file content does not match the file extension.',
        warnLicenseBefore: 'License not active.<br>Please contact your administrator.',
        titleLicenseNotActive: 'License not active'

    }, DE.Controllers.ApplicationController));

/*    var Desktop = function () {
        var features = {
            version: '{{PRODUCT_VERSION}}',
            // eventloading: true,
            uitype: 'fillform',
            uithemes: true
        };
        var api, nativevars;

        var native = window.desktop || window.AscDesktopEditor;
        !!native && native.execCommand('webapps:features', JSON.stringify(features));

        if ( !!native ) {
            $('#header-logo, .brand-logo').hide();

            nativevars = window.RendererProcessVariable;

            window.on_native_message = function (cmd, param) {
                if (/theme:changed/.test(cmd)) {
                    if ( Common.UI.Themes && !!Common.UI.Themes.setTheme )
                        Common.UI.Themes.setTheme(param);
                } else
                if (/window:features/.test(cmd)) {
                    var obj = JSON.parse(param);
                    if ( obj.singlewindow !== undefined ) {
                        native.features.singlewindow = obj.singlewindow;
                        $("#title-doc-name")[obj.singlewindow ? 'hide' : 'show']();
                    }
                }
            };

            if ( !!window.native_message_cmd ) {
                for ( var c in window.native_message_cmd ) {
                    window.on_native_message(c, window.native_message_cmd[c]);
                }
            }

            Common.NotificationCenter.on({
                'uitheme:changed' : function (name) {
                    if (Common.localStorage.getBool('ui-theme-use-system', false)) {
                        native.execCommand("uitheme:changed", JSON.stringify({name:'theme-system'}));
                    } else {
                        const theme = Common.UI.Themes.get(name);
                        if ( theme )
                            native.execCommand("uitheme:changed", JSON.stringify({name:name, type:theme.type}));
                    }
                },
            });

            Common.Gateway.on('opendocument', function () {
                api = DE.getController('ApplicationController').api;

                $("#title-doc-name")[native.features.singlewindow ? 'hide' : 'show']();

                var is_win_xp = window.RendererProcessVariable && window.RendererProcessVariable.os === 'winxp';
                Common.UI.Themes.setAvailable(!is_win_xp);
            });
        }

        return {
            isActive: function () {
                return !!native;
            },
            isOffline: function () {
                return api && api.asc_isOffline();
            },
            process: function (opts) {
                if ( !!native && !!api ) {
                    if ( opts == 'goback' ) {
                        var config = DE.getController('ApplicationController').editorConfig;
                        native.execCommand('go:folder',
                            api.asc_isOffline() ? 'offline' : config.customization.goback.url);
                        return true;
                    }
                }

                return false;
            },
            systemThemeType: function () {
                return nativevars.theme && !!nativevars.theme.system ? nativevars.theme.system :
                    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            },
        }
    };
 */
    // DE.Controllers.Desktop = new Desktop();
    // Common.Controllers = Common.Controllers || {};
    // Common.Controllers.Desktop = DE.Controllers.Desktop;
});
