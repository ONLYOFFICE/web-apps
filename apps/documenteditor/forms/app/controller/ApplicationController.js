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

            this._state = {isDisconnected: false, licenseType: false};

            this.view = this.createView('ApplicationView').render();

            window["flat_desine"] = true;
            this.api = new Asc.asc_docs_api({
                'id-view'  : 'editor_sdk',
                'embedded' : true
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

            if (this.api){
                this.api.asc_registerCallback('asc_onError',                 this.onError.bind(this));
                this.api.asc_registerCallback('asc_onDocumentContentReady',  this.onDocumentContentReady.bind(this));
                this.api.asc_registerCallback('asc_onOpenDocumentProgress',  this.onOpenDocument.bind(this));
                this.api.asc_registerCallback('asc_onDocumentUpdateVersion', this.onUpdateVersion.bind(this));
                this.api.asc_registerCallback('asc_onServerVersion',         this.onServerVersion.bind(this));

                this.api.asc_registerCallback('asc_onCountPages',            this.onCountPages.bind(this));
                this.api.asc_registerCallback('asc_onCurrentPage',           this.onCurrentPage.bind(this));

                // Initialize api gateway
                Common.Gateway.on('init',               this.loadConfig.bind(this));
                Common.Gateway.on('opendocument',       this.loadDocument.bind(this));
                Common.Gateway.on('showmessage',        this.onExternalMessage.bind(this));
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

                case Asc.c_oAscError.ID.DownloadError:
                    config.msg = this.downloadErrorText;
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
                    config.msg = this.errorEditingDownloadas;
                    break;

                case Asc.c_oAscError.ID.ForceSaveButton:
                case Asc.c_oAscError.ID.ForceSaveTimeout:
                    config.msg = this.errorForceSave;
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
                    if (id == Asc.c_oAscError.ID.EditingError) {
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
            maxPages = count;
            $('#pages').text(this.textOf + " " + count);
        },

        onCurrentPage: function(number) {
            this.view.txtGoToPage.setValue(number + 1);
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

                var type = /^(?:(pdf|djvu|xps))$/.exec(data.doc.fileType);
                if (type && typeof type[1] === 'string') {
                    this.permissions.edit = this.permissions.review = false;
                }
            }

            this.api.asc_registerCallback('asc_onGetEditorPermissions', _.bind(this.onEditorPermissions, this));
            this.api.asc_registerCallback('asc_onRunAutostartMacroses', _.bind(this.onRunAutostartMacroses, this));
            this.api.asc_setDocInfo(docInfo);
            this.api.asc_getEditorPermissions(this.editorConfig.licenseUrl, this.editorConfig.customerId);
            this.api.asc_enableKeyEvents(true);

            Common.Analytics.trackEvent('Load', 'Start');

            labelDocName = $('#title-doc-name');
            if (data.doc) {
                labelDocName.text(data.doc.title || '');
                this.embedConfig.docTitle = data.doc.title;
            }
        },

        onRunAutostartMacroses: function() {
            if (!this.editorConfig.customization || (this.editorConfig.customization.macros!==false)) {
                this.api.asc_runAutostartMacroses();
            }
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

            if ( this.onServerVersion(params.asc_getBuildVersion())) return;

            this.permissions.review = (this.permissions.review === undefined) ? (this.permissions.edit !== false) : this.permissions.review;
            if (params.asc_getRights() !== Asc.c_oRights.Edit)
                this.permissions.edit = this.permissions.review = false;

            this.appOptions.trialMode      = params.asc_getLicenseMode();
            this.appOptions.isBeta         = params.asc_getIsBeta();
            this.appOptions.canLicense     = (licType === Asc.c_oLicenseResult.Success || licType === Asc.c_oLicenseResult.SuccessLimit);
            this.appOptions.canSubmitForms = this.appOptions.canLicense && (typeof (this.editorConfig.customization) == 'object') && !!this.editorConfig.customization.submitForm;
            this.appOptions.canFillForms   = this.appOptions.canLicense && (this.permissions.fillForms===true) && (this.editorConfig.mode !== 'view');
            this.api.asc_setViewMode(!this.appOptions.canFillForms);

            this.appOptions.canBranding  = params.asc_getCustomization();
            this.appOptions.canBranding && this.setBranding(this.appOptions.customization);

            this.appOptions.canDownload       = this.permissions.download !== false;
            this.appOptions.canPrint          = (this.permissions.print !== false);

            this.appOptions.fileKey = this.document.key;

            AscCommon.UserInfoParser.setParser(true);
            AscCommon.UserInfoParser.setCurrentName(this.appOptions.user.fullname);

            var me = this;
            me.view.btnSubmit.setVisible(this.appOptions.canFillForms && this.appOptions.canSubmitForms);
            if (!this.appOptions.canFillForms) {
                me.view.btnPrev.setVisible(false);
                me.view.btnNext.setVisible(false);
                me.view.btnClear.setVisible(false);
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

                this.api.asc_setRestriction(Asc.c_oAscRestrictionType.OnlyForms);
                this.api.asc_SetFastCollaborative(true);
                this.api.asc_setAutoSaveGap(1);
            }

            var $parent = labelDocName.parent();
            var _left_width = $parent.position().left,
                _right_width = $parent.next().outerWidth();

            if ( _left_width < _right_width )
                $parent.css('padding-left', _right_width - _left_width);
            else
                $parent.css('padding-right', _left_width - _right_width);

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

        onDownloadUrl: function(url) {
            Common.Gateway.downloadAs(url);
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
                    this.api.asc_addImage(obj);
                    setTimeout(function(){
                        me.api.asc_UncheckContentControlButtons();
                    }, 500);
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
            this.cmpCalendar.setDate(new Date(specProps ? specProps.get_FullDate() : undefined));

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
            var me = this;

            this.hidePreloader();
            this.onLongActionEnd(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);

            var zf = (this.appOptions.customization && this.appOptions.customization.zoom ? parseInt(this.appOptions.customization.zoom) : -2);
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
            if (this.appOptions.canFillForms) {
                this.api.asc_registerCallback('asc_onShowContentControlsActions', _.bind(this.onShowContentControlsActions, this));
                this.api.asc_registerCallback('asc_onHideContentControlsActions', _.bind(this.onHideContentControlsActions, this));
                this.api.asc_SetHighlightRequiredFields(true);
            }

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
                        this.api.asc_Print(new Asc.asc_CDownloadOptions(null, Common.Utils.isChrome || Common.Utils.isSafari || Common.Utils.isOpera || Common.Utils.isGecko && Common.Utils.firefoxVersion>86)); // if isChrome or isSafari or isOpera == true use asc_onPrintUrl event
                    }
                    Common.Analytics.trackEvent('Save');
                    break;
                case 'print':
                    this.api.asc_Print(new Asc.asc_CDownloadOptions(null, Common.Utils.isChrome || Common.Utils.isSafari || Common.Utils.isOpera || Common.Utils.isGecko && Common.Utils.firefoxVersion>86)); // if isChrome or isSafari or isOpera == true use asc_onPrintUrl event
                    Common.Analytics.trackEvent('Print');
                    break;
                case 'close':
                    if (this.appOptions.customization && this.appOptions.customization.goback) {
                        if (this.appOptions.customization.goback.requestClose && this.appOptions.canRequestClose)
                            Common.Gateway.requestClose();
                        else if (this.appOptions.customization.goback.url)
                            window.parent.location.href = this.appOptions.customization.goback.url;
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
            }
        },

        onThemeClick: function(menu, item) {
            Common.UI.Themes.setTheme(item.value);
        },

        onThemeChange: function() {
            var current = Common.UI.Themes.currentThemeId();
            _.each(this.view.mnuThemes.items, function(item){
                item.setChecked(current===item.value, true);
            });
            if (this.appOptions.canBranding) {
                var value = this.appOptions.customization;
                if ( value && value.logo && (value.logo.image || value.logo.imageDark) && (value.logo.image !== value.logo.imageDark)) {
                    var image = Common.UI.Themes.isDarkTheme() ? (value.logo.imageDark || value.logo.image) : (value.logo.image || value.logo.imageDark);
                    $('#header-logo img').attr('src', image);
                }
            }
        },

        createDelayedElements: function() {
            var me = this,
                menuItems = this.view.btnOptions.menu.items,
                itemsCount = menuItems.length-4;
            var initMenu = function(menu) {
                var last;
                // print
                if (!menuItems[0].isVisible())
                    menuItems[1].setVisible(false);
                else
                    last = menuItems[1];

                // download
                if (!menuItems[2].isVisible() && !menuItems[3].isVisible() && !menuItems[4].isVisible())
                    menuItems[5].setVisible(false);
                else
                    last = menuItems[5];

                // theme
                if (!menuItems[6].isVisible())
                    menuItems[7].setVisible(false);
                else
                    last = menuItems[7];

                // share, location
                if (!menuItems[8].isVisible() && !menuItems[9].isVisible())
                    menuItems[10].setVisible(false);
                else
                    last = menuItems[10];

                // embed, fullscreen
                if (!menuItems[11].isVisible() && !menuItems[12].isVisible())
                    last && last.setVisible(false);

                menu.off('show:after', initMenu);
            };

            if (!this.appOptions.canPrint) {
                menuItems[0].setVisible(false);
                itemsCount--;
            }

            if ( !this.embedConfig.saveUrl || !this.appOptions.canDownload || this.appOptions.canFillForms) {
                menuItems[2].setVisible(false);
                itemsCount--;
            }

            if ( !this.appOptions.canFillForms || !this.appOptions.canDownload) {
                menuItems[3].setVisible(false);
                menuItems[4].setVisible(false);
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
                menuItems[6].setVisible(false);
                itemsCount--;
            } else {
                this.view.mnuThemes.on('item:click', _.bind(this.onThemeClick, this));
                Common.NotificationCenter.on('uitheme:changed', this.onThemeChange.bind(this));
            }

            if ( !this.embedConfig.shareUrl || this.appOptions.canFillForms) {
                menuItems[8].setVisible(false);
                itemsCount--;
            }

            if (!this.appOptions.canBackToFolder) {
                menuItems[9].setVisible(false);
                itemsCount--;
            }

            if ( !this.embedConfig.embedUrl || this.appOptions.canFillForms) {
                menuItems[11].setVisible(false);
                itemsCount--;
            }

            if ( !this.embedConfig.fullscreenUrl ) {
                menuItems[12].setVisible(false);
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
            this.view.btnOptions.menu.on('item:click', _.bind(this.onOptionsClick, this));

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
        errorLoadingFont: 'Fonts are not loaded.<br>Please contact your Document Server administrator.'

    }, DE.Controllers.ApplicationController));
});
