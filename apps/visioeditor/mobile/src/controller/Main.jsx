
import React, { Component, Fragment } from 'react'
import { inject } from "mobx-react";
import { f7 } from "framework7-react";
import { withTranslation } from 'react-i18next';
import CollaborationController from '../../../../common/mobile/lib/controller/collaboration/Collaboration.jsx';
import EditorUIController from '../lib/patch';
import ErrorController from "./Error";
import LongActionsController from "./LongActions";
import {LocalStorage} from "../../../../common/mobile/utils/LocalStorage.mjs";
import About from '../../../../common/mobile/lib/view/About';
import { Device } from '../../../../common/mobile/utils/device';
import { Themes } from '../../../../common/mobile/lib/controller/Themes.jsx';
import PluginsController from '../../../../common/mobile/lib/controller/Plugins.jsx';
import { processArrayScripts } from '../../../../common/mobile/utils/processArrayScripts.js';
import '../../../../common/main/lib/util/LanguageInfo.js'

@inject(
    "users",
    "storeAppOptions",
    "storeVisioInfo",
    "storeApplicationSettings",
    "storeToolbarSettings"
    )
class MainController extends Component {
    constructor (props) {
        super(props);
        window.editorType = 've';

        this.LoadingDocument = -256;
        this.ApplyEditRights = -255;
        this.fallbackSdkTranslations = {
        };

        this._state = {
            licenseType: false,
            isDocModified: false,
            requireUserAction: true
        };

        this.defaultTitleText = __APP_TITLE_TEXT__;

        const { t } = this.props;
        this._t = t('Controller.Main', {returnObjects:true});
    }

    initSdk () {
        const on_script_load = () => {
            !window.sdk_scripts && (window.sdk_scripts = ['../../../../sdkjs/common/AllFonts.js',
                                                           '../../../../sdkjs/visio/sdk-all-min.js']);
            let dep_scripts = ['../../../vendor/xregexp/xregexp-all-min.js',
                                '../../../vendor/socketio/socket.io.min.js'];
            dep_scripts.push(...window.sdk_scripts);

            const promise_get_script = (scriptpath) => {
                return new Promise((resolve, reject) => {
                    const script = document.createElement("script");
                    script.src = scriptpath;
                    script.onload = () => {
                        resolve('ok');
                    };
                    script.onerror = () => {
                        reject('error');
                    };

                    document.body.appendChild(script);
                });
            };

            const loadConfig = data => {
                const { t } = this.props;
                const _t = t('Controller.Main', {returnObjects:true});

                EditorUIController.isSupportEditFeature();

                this.editorConfig = Object.assign({}, this.editorConfig, data.config);

                this.props.storeAppOptions.setConfigOptions(this.editorConfig, _t);

                this.editorConfig.lang && this.api.asc_setLocale(this.editorConfig.lang);

                this.loadDefaultMetricSettings();

                if (this.editorConfig.canRequestRefreshFile) {
                    Common.Gateway.on('refreshfile', this.onRefreshFile.bind(this));
                    this.api.asc_registerCallback('asc_onRequestRefreshFile', this.onRequestRefreshFile.bind(this));
                }
            };

            const loadDocument = data => {
                this.permissions = {};
                this.document = data.doc;

                let docInfo = {};

                if (data.doc) {
                    this.permissions = Object.assign(this.permissions, data.doc.permissions);

                    const _options = Object.assign({}, data.doc.options, this.editorConfig.actionLink || {});
                    const _user = new Asc.asc_CUserInfo();
                    const _userOptions = this.props.storeAppOptions.user;
                    _user.put_Id(_userOptions.id);
                    _user.put_FullName(_userOptions.fullname);
                    _user.put_IsAnonymousUser(_userOptions.anonymous);

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
                    docInfo.put_Wopi(this.editorConfig.wopi);
                    this.editorConfig.shardkey && docInfo.put_Shardkey(this.editorConfig.shardkey);

                    // let coEditMode = !(this.editorConfig.coEditing && typeof this.editorConfig.coEditing == 'object') ? 'fast' : // fast by default
                    //                 this.editorConfig.mode === 'view' && this.editorConfig.coEditing.change!==false ? 'fast' : // if can change mode in viewer - set fast for using live viewer
                    //                 this.editorConfig.coEditing.mode || 'fast';
                    // docInfo.put_CoEditingMode(coEditMode);
                    var coEditMode = 'strict';
                    docInfo.put_CoEditingMode(coEditMode);

                    let enable = false; //!this.editorConfig.customization || (this.editorConfig.customization.macros!==false);
                    docInfo.asc_putIsEnabledMacroses(!!enable);
                    enable = !this.editorConfig.customization || (this.editorConfig.customization.plugins!==false);
                    docInfo.asc_putIsEnabledPlugins(!!enable);
                }

                this.api.asc_registerCallback('asc_onGetEditorPermissions', onEditorPermissions);
                this.api.asc_registerCallback('asc_onLicenseChanged', this.onLicenseChanged.bind(this));
                this.api.asc_setDocInfo(docInfo);
                this.api.asc_getEditorPermissions(this.editorConfig.licenseUrl, this.editorConfig.customerId);

                // Visio Info

                const storeVisioInfo = this.props.storeVisioInfo;

                storeVisioInfo.setDataDoc(this.document);

                // Common.SharedSettings.set('document', data.doc);

                if (data.doc) {
                    Common.Notifications.trigger('setdoctitle', data.doc.title);
                }
            };

            const onEditorPermissions = params => {
                const licType = params.asc_getLicenseType();
                const { t } = this.props;
                // const _t = t('Controller.Main', { returnObjects:true });
               
                if (Asc.c_oLicenseResult.Expired === licType ||
                    Asc.c_oLicenseResult.Error === licType ||
                    Asc.c_oLicenseResult.ExpiredTrial === licType ||
                    Asc.c_oLicenseResult.NotBefore === licType ||
                    Asc.c_oLicenseResult.ExpiredLimited === licType) {

                    f7.dialog.create({
                        title: Asc.c_oLicenseResult.NotBefore === licType ? t('Controller.Main.titleLicenseNotActive') : t('Controller.Main.titleLicenseExp'),
                        text: Asc.c_oLicenseResult.NotBefore === licType ? t('Controller.Main.warnLicenseBefore') : t('Controller.Main.warnLicenseExp')
                    }).open();
                    if (this._isDocReady || this._isPermissionsInited) { // receive after refresh file
                        Common.Notifications.trigger('api:disconnect');
                    }
                    return;
                }

                if ( this.onServerVersion(params.asc_getBuildVersion()) ) return;
                if ( this._isDocReady || this._isPermissionsInited ) {
                    this.api.asc_LoadDocument();
                    return;
                }

                this.appOptions.canLicense = (licType === Asc.c_oLicenseResult.Success || licType === Asc.c_oLicenseResult.SuccessLimit);

                const storeAppOptions = this.props.storeAppOptions;
                storeAppOptions.setPermissionOptions(this.document, licType, params, this.permissions, EditorUIController.isSupportEditFeature());
                this.applyMode(storeAppOptions);

                this._isPermissionsInited = true;

                this.api.asc_LoadDocument();
                this.api.Resize();
            };

            processArrayScripts(dep_scripts, promise_get_script)
                .then(() => {
                    const { t } = this.props;
                    let _translate = t('Controller.Main.SDK', { returnObjects:true });

                    if (!(typeof _translate === 'object' && _translate !== null && Object.keys(_translate).length > 0)) {
                        _translate = this.fallbackSdkTranslations
                    }

                    this.api = new Asc.VisioEditorApi({
                        'id-view': 'editor_sdk',
                        'mobile': true,
                        'translate': _translate,
                        'isRtlInterface': Common.Locale.isCurrentLangRtl
                    });

                    Common.Notifications.trigger('engineCreated', this.api);

                    this.appOptions = {};
                    this.bindEvents();

                    let value = LocalStorage.getItem("ve-settings-fontrender");
                    if (value===null) value = window.devicePixelRatio > 1 ? '1' : '3';
                    this.api.SetFontRenderingMode(parseInt(value));
                    this.api.SetDrawingFreeze(true);
                    Common.Utils.Metric.setCurrentMetric(1); //pt

                    Common.Gateway.on('init',           loadConfig);
                    Common.Gateway.on('showmessage',    this.onExternalMessage.bind(this));
                    Common.Gateway.on('opendocument',   loadDocument);
                    Common.Gateway.appReady();

                    Common.Gateway.on('internalcommand', function(data) {
                        if (data.command === 'hardBack') {
                            if ($$('.modal-in').length > 0) {
                                if ( !($$('.error-dialog.modal-in').length > 0) ) {
                                    f7.dialog.close();
                                }
                                Common.Gateway.internalMessage('hardBack', false);
                            } else
                                Common.Gateway.internalMessage('hardBack', true);
                        }
                    });
                    Common.Gateway.internalMessage('listenHardBack');
                }, error => {
                    console.log('promise failed ' + error);
                });
        };

        if ( About.developVersion() ) {
            const script = document.createElement("script");
            script.src = "../../../../sdkjs/develop/sdkjs/visio/scripts.js";
            script.async = true;
            script.onload = on_script_load;
            script.onerror = () => {
                console.log('error on load script');
            };

            document.body.appendChild(script);
        } else {
            on_script_load();
        }
    }

    applyMode(appOptions) {
        this.api.asc_enableKeyEvents(appOptions.isEdit);
        this.api.asc_setViewMode(!appOptions.isEdit && !appOptions.isRestrictedEdit);
        (appOptions.isRestrictedEdit && appOptions.canComments) && this.api.asc_setRestriction(Asc.c_oAscRestrictionType.OnlyComments);

        let value = LocalStorage.getItem('ve-mobile-settings-unit');
        value = (value !== null) ?
            parseInt(value) :
            (appOptions.customization && appOptions.customization.unit ? Common.Utils.Metric.c_MetricUnits[appOptions.customization.unit.toLocaleLowerCase()] : Common.Utils.Metric.getDefaultMetric());
        (value === undefined) && (value = Common.Utils.Metric.getDefaultMetric());
        Common.Utils.Metric.setCurrentMetric(value);
        this.api.asc_SetDocumentUnits((value === Common.Utils.Metric.c_MetricUnits.inch) ?
            Asc.c_oAscDocumentUnits.Inch :
            ((value === Common.Utils.Metric.c_MetricUnits.pt) ? Asc.c_oAscDocumentUnits.Point : Asc.c_oAscDocumentUnits.Millimeter));

        Common.Notifications.trigger('preloader:close');
        Common.Notifications.trigger('preloader:endAction', Asc.c_oAscAsyncActionType['BlockInteraction'], this.ApplyEditRights);

        if (!this._isDocReady) {
            Common.Notifications.trigger('preloader:beginAction', Asc.c_oAscAsyncActionType['BlockInteraction'], this.LoadingDocument);
        }

        // Message on window close
        window.onbeforeunload = this.onBeforeUnload.bind(this);
        window.onunload = this.onUnload.bind(this);
    }

    loadDefaultMetricSettings() {
        const appOptions = this.props.storeAppOptions;
        let region = '';

        if (appOptions.location) {
            console.log("Obsolete: The 'location' parameter of the 'editorConfig' section is deprecated. Please use 'region' parameter in the 'editorConfig' section instead.");
            region = appOptions.location;
        } else if (appOptions.region) {
            let val = appOptions.region;
            val = Common.util.LanguageInfo.getLanguages().hasOwnProperty(val) ? Common.util.LanguageInfo.getLocalLanguageName(val)[0] : val;

            if (val && typeof val === 'string') {
                let arr = val.split(/[\-_]/);
                if (arr.length > 1) region = arr[arr.length - 1]
            }
        } else {
            let arr = (appOptions.lang || 'en').split(/[\-_]/);

            if (arr.length > 1) region = arr[arr.length - 1];
            if (!region) {
                arr = (navigator.language || '').split(/[\-_]/);
                if (arr.length > 1) region = arr[arr.length - 1]
            }
        }

        if (/^(ca|us)$/i.test(region)) {
            Common.Utils.Metric.setDefaultMetric(Common.Utils.Metric.c_MetricUnits.inch);
        }
    }

    onBeforeUnload () {
        LocalStorage.save();
    }

    onUnload () {
    }

    bindEvents () {
        $$(window).on('resize', () => {
            this.api.Resize();
        });

        $$(window).on('popup:open sheet:open actions:open searchbar:enable', () => {
            this.api.asc_enableKeyEvents(false);
        });

        this.api.asc_registerCallback('asc_onDocumentContentReady', this.onDocumentContentReady.bind(this));
        this.api.asc_registerCallback('asc_onDocumentUpdateVersion', this.onUpdateVersion.bind(this));
        this.api.asc_registerCallback('asc_onServerVersion', this.onServerVersion.bind(this));
        this.api.asc_registerCallback('asc_onAdvancedOptions', this.onAdvancedOptions.bind(this));
        this.api.asc_registerCallback('asc_onDocumentName', this.onDocumentName.bind(this));
        this.api.asc_registerCallback('asc_onPrintUrl', this.onPrintUrl.bind(this));
        this.api.asc_registerCallback('asc_onPrint', this.onPrint.bind(this));
        this.api.asc_registerCallback('asc_onMeta', this.onMeta.bind(this));
        this.api.asc_registerCallback('asc_onDownloadUrl', this.onDownloadUrl.bind(this));

        // Toolbar settings

        const storeToolbarSettings = this.props.storeToolbarSettings;
        this.api.asc_registerCallback('asc_onCountPages', (count) => {
            storeToolbarSettings.setCountPages(count);
        });

        // Visio Info

        const storeVisioInfo = this.props.storeVisioInfo;

        this.api.asc_registerCallback('asc_onMeta', (meta) => {
            if(meta) {
                storeVisioInfo.changeTitle(meta.title);
            }
        });
    }

    onDocumentContentReady () {
        if (this._isDocReady)
            return;

        this._isDocReady = true;

        const appOptions = this.props.storeAppOptions;

        this.api.SetDrawingFreeze(false);

        Common.Notifications.trigger('preloader:close');
        Common.Notifications.trigger('preloader:endAction', Asc.c_oAscAsyncActionType['BlockInteraction'], this.LoadingDocument);

        this.updateWindowTitle(true);

        if (appOptions.isEdit && this.needToUpdateVersion) {
            Common.Notifications.trigger('api:disconnect');
        }

        Common.Gateway.on('processrightschange', this.onProcessRightsChange.bind(this));
        Common.Gateway.on('downloadas', this.onDownloadAs.bind(this));
        Common.Gateway.on('requestclose', this.onRequestClose.bind(this));

        Common.Gateway.sendInfo({
            mode: appOptions.isEdit ? 'edit' : 'view'
        });

        this.api.Resize();
        this.api.zoomFitToPage();

        this.applyLicense();

        Common.Gateway.documentReady();
        f7.emit('resize');

        Common.Notifications.trigger('document:ready');

        appOptions.changeDocReady(true);
        this._state.requireUserAction = false;
    }

    onLicenseChanged (params) {
        const appOptions = this.props.storeAppOptions;
        const licType = params.asc_getLicenseType();
        if (licType !== undefined && (appOptions.canEdit || appOptions.isRestrictedEdit) && appOptions.config.mode !== 'view' &&
            (licType === Asc.c_oLicenseResult.Connections || licType === Asc.c_oLicenseResult.UsersCount || licType === Asc.c_oLicenseResult.ConnectionsOS || licType === Asc.c_oLicenseResult.UsersCountOS
                || licType === Asc.c_oLicenseResult.SuccessLimit && (appOptions.trialMode & Asc.c_oLicenseMode.Limited) !== 0))
            this._state.licenseType = licType;

        if (licType !== undefined && appOptions.canLiveView && (licType===Asc.c_oLicenseResult.ConnectionsLive || licType===Asc.c_oLicenseResult.ConnectionsLiveOS||
                                                                licType===Asc.c_oLicenseResult.UsersViewCount || licType===Asc.c_oLicenseResult.UsersViewCountOS))
            this._state.licenseType = licType;

        if (this._isDocReady && this._state.licenseType)
            this.applyLicense();
    }

    applyLicense () {
        const { t } = this.props;
        const _t = t('Controller.Main', {returnObjects:true});

        const warnNoLicense  = _t.warnNoLicense.replace(/%1/g, __COMPANY_NAME__);
        const warnNoLicenseUsers = _t.warnNoLicenseUsers.replace(/%1/g, __COMPANY_NAME__);
        const textNoLicenseTitle = _t.textNoLicenseTitle.replace(/%1/g, __COMPANY_NAME__);

        const appOptions = this.props.storeAppOptions;
        if (appOptions.config.mode !== 'view' && !EditorUIController.isSupportEditFeature()) {
            // let value = LocalStorage.getItem("ve-opensource-warning");
            // value = (value !== null) ? parseInt(value) : 0;
            // const now = (new Date).getTime();
            // if (now - value > 86400000) {
            //     LocalStorage.setItem("ve-opensource-warning", now);
            //     f7.dialog.create({
            //         title: _t.notcriticalErrorTitle,
            //         text : _t.errorOpensource,
            //         buttons: [{ text: _t.textOk }]
            //     }).open();
            // }
            // Common.Notifications.trigger('toolbar:activatecontrols');
            // return;
        }

        if (appOptions.config.mode === 'view') {
            if (appOptions.canLiveView && (this._state.licenseType===Asc.c_oLicenseResult.ConnectionsLive || this._state.licenseType===Asc.c_oLicenseResult.ConnectionsLiveOS ||
                                            this._state.licenseType===Asc.c_oLicenseResult.UsersViewCount || this._state.licenseType===Asc.c_oLicenseResult.UsersViewCountOS ||
                                            !appOptions.isAnonymousSupport && !!appOptions.config.user.anonymous)) {
                appOptions.canLiveView = false;
                this.api.asc_SetFastCollaborative(false);
            }
            Common.Notifications.trigger('toolbar:activatecontrols');
        } else if (!appOptions.isAnonymousSupport && !!appOptions.config.user.anonymous) {
            Common.Notifications.trigger('toolbar:activatecontrols');
            this.api.asc_coAuthoringDisconnect();
            Common.Notifications.trigger('api:disconnect');
            f7.dialog.create({
                title: _t.notcriticalErrorTitle,
                text : _t.warnLicenseAnonymous,
                buttons: [{ text: _t.textOk }]
            }).open();
        } else if (this._state.licenseType) {
            let license = this._state.licenseType;
            let buttons = [{ text: _t.textOk }];
            let title = textNoLicenseTitle;
            if ((appOptions.trialMode & Asc.c_oLicenseMode.Limited) !== 0 &&
                (license === Asc.c_oLicenseResult.SuccessLimit ||
                    appOptions.permissionsLicense === Asc.c_oLicenseResult.SuccessLimit)
            ) {
                license = _t.warnLicenseLimitedRenewed;
            } else if (license === Asc.c_oLicenseResult.Connections || license === Asc.c_oLicenseResult.UsersCount) {
                title = _t.titleReadOnly;
                license = (license===Asc.c_oLicenseResult.Connections) ? _t.tipLicenseExceeded : _t.tipLicenseUsersExceeded;
            } else {
                license = (license === Asc.c_oLicenseResult.ConnectionsOS) ? warnNoLicense : warnNoLicenseUsers;
                buttons = [{
                    text: _t.textBuyNow,
                    bold: true,
                    onClick: function() {
                        window.open(`${__PUBLISHER_URL__}`, "_blank");
                    }
                },
                    {
                        text: _t.textContactUs,
                        onClick: function() {
                            window.open(`mailto:${__SALES_EMAIL__}`, "_blank");
                        }
                    }];
            }
            if (this._state.licenseType === Asc.c_oLicenseResult.SuccessLimit) {
                Common.Notifications.trigger('toolbar:activatecontrols');
            } else {
                Common.Notifications.trigger('toolbar:activatecontrols');
                this.api.asc_coAuthoringDisconnect();
                Common.Notifications.trigger('api:disconnect');
            }

            f7.dialog.create({
                title: title,
                text : license,
                buttons: buttons
            }).open();
        } else {
            if (!appOptions.isDesktopApp && !appOptions.canBrandingExt &&
                appOptions.config && appOptions.config.customization && (appOptions.config.customization.loaderName || appOptions.config.customization.loaderLogo)) {
                f7.dialog.create({
                    title: _t.textPaidFeature,
                    text  : _t.textCustomLoader,
                    buttons: [{
                        text: _t.textContactUs,
                        bold: true,
                        onClick: () => {
                            window.open(`mailto:${__SALES_EMAIL__}`, "_blank");
                        }
                    },
                        { text: _t.textClose }]
                }).open();
            }
            Common.Notifications.trigger('toolbar:activatecontrols');
        }
    }

    onUpdateVersion (callback) {
        const { t } = this.props;
        const _t = t('Controller.Main', {returnObjects:true});

        this.needToUpdateVersion = true;
        Common.Notifications.trigger('preloader:endAction', Asc.c_oAscAsyncActionType['BlockInteraction'], this.LoadingDocument);
        Common.Notifications.trigger('preloader:endAction', Asc.c_oAscAsyncActionType['BlockInteraction'], Asc.c_oAscAsyncAction['Open']);

        f7.dialog.alert(
            _t.errorUpdateVersion,
            _t.titleUpdateVersion,
            () => {
                Common.Gateway.updateVersion();
                if (callback) {
                    callback.call(this);
                }
                this.editorConfig && this.editorConfig.canUpdateVersion && Common.Notifications.trigger('preloader:beginAction', Asc.c_oAscAsyncActionType['BlockInteraction'], this.LoadingDocument);
            });
        Common.Notifications.trigger('api:disconnect');
    }

    onServerVersion (buildVersion) {
        if (this.changeServerVersion) return true;
        const { t } = this.props;
        const _t = t('Controller.Main', {returnObjects:true});

        if (About.appVersion() !== buildVersion && !About.compareVersions()) {
            this.changeServerVersion = true;
            f7.dialog.alert(
                _t.errorServerVersion,
                _t.titleServerVersion,
                () => {
                    setTimeout(() => {Common.Gateway.updateVersion()}, 0);
                });
            if (this._isDocReady) { // receive after refresh file
                Common.Notifications.trigger('api:disconnect');
            }
            return true;
        }
        return false;
    }

    onAdvancedOptions (type, advOptions) {
        const { t } = this.props;
        const _t = t('Controller.Main', {returnObjects:true});
        
        if ($$('.dlg-adv-options.modal-in').length > 0) return;

        if (type == Asc.c_oAscAdvancedOptionsID.DRM) {
            Common.Notifications.trigger('preloader:close');
            Common.Notifications.trigger('preloader:endAction', Asc.c_oAscAsyncActionType['BlockInteraction'], this.LoadingDocument, true);

            const buttons = [{
                text: _t.textOk,
                bold: true,
                onClick: () => {
                    const password = document.getElementById('modal-password').value;
                    this.api.asc_setAdvancedOptions(type, new Asc.asc_CDRMAdvancedOptions(password));

                    if (!this._isDocReady) {
                        Common.Notifications.trigger('preloader:beginAction', Asc.c_oAscAsyncActionType['BlockInteraction'], this.LoadingDocument);
                    }
                }
            }];

            if(this.isDRM) {
                f7.dialog.create({
                    text: _t.txtIncorrectPwd,
                    buttons : [{
                        text: _t.textOk,
                        bold: true,
                    }]
                }).open();
            }

            if (this.props.storeAppOptions.canRequestClose)
                buttons.push({
                    text: _t.closeButtonText,
                    onClick: () => {
                        Common.Gateway.requestClose();
                    }
                });

            f7.dialog.create({
                title: _t.advDRMOptions,
                text: _t.textOpenFile,
                content: Device.ios ?
                '<div class="input-field"><input type="password" class="modal-text-input" name="modal-password" placeholder="' + _t.advDRMPassword + '" id="modal-password"></div>' : '<div class="input-field"><div class="inputs-list list inline-labels"><ul><li><div class="item-content item-input"><div class="item-inner"><div class="item-input-wrap"><input type="password" name="modal-password" id="modal-password" placeholder=' + _t.advDRMPassword + '></div></div></div></li></ul></div></div>',
                buttons: buttons,
                cssClass: 'dlg-adv-options'
            }).open();
            this.isDRM = true;
        }
        if (this._state.requireUserAction) {
            Common.Gateway.userActionRequired();
            this._state.requireUserAction = false;
        }
    }

    onDocumentName () {
        this.updateWindowTitle(true);
    }

    updateWindowTitle (force) {
        const isModified = this.api.isDocumentModified();
        if (this._state.isDocModified !== isModified || force) {
            const title = this.defaultTitleText;

            if (window.document.title !== title) {
                window.document.title = title;
            }

            this._isDocReady && (this._state.isDocModified !== isModified) && Common.Gateway.setDocumentModified(isModified);
            this._state.isDocModified = isModified;
        }
    }

    onPrint () {
        if (!this.props.storeAppOptions.canPrint) return;

        if (this.api)
            this.api.asc_Print();
        Common.component.Analytics.trackEvent('Print');
    }

    onPrintUrl (url) {
        if (this.iframePrint) {
            this.iframePrint.parentNode.removeChild(this.iframePrint);
            this.iframePrint = null;
        }

        if (!this.iframePrint) {
            this.iframePrint = document.createElement("iframe");
            this.iframePrint.id = "id-print-frame";
            this.iframePrint.style.display = 'none';
            this.iframePrint.style.visibility = "hidden";
            this.iframePrint.style.position = "fixed";
            this.iframePrint.style.right = "0";
            this.iframePrint.style.bottom = "0";
            document.body.appendChild(this.iframePrint);
            this.iframePrint.onload = function() {
                this.iframePrint.contentWindow.focus();
                this.iframePrint.contentWindow.print();
                this.iframePrint.contentWindow.blur();
                window.focus();
            };
        }

        if (url) {
            this.iframePrint.src = url;
        }
    }

    onMeta (meta) {
        this.updateWindowTitle(true);
        Common.Gateway.metaChange(meta);
    }

    onExternalMessage (msg) {
        if (msg && msg.msg) {
            msg.msg = (msg.msg).toString();
            f7.notification.create({
                //title: uiApp.params.modalTitle,
                text: [msg.msg.charAt(0).toUpperCase() + msg.msg.substring(1)],
                closeButton: true
            }).open();

            Common.component.Analytics.trackEvent('External Error');
        }
    }

    onProcessRightsChange (data) {
        if (data && data.enabled === false) {
            const appOptions = this.props.storeAppOptions;
            const old_rights = appOptions.lostEditingRights;
            appOptions.changeEditingRights(!old_rights);
            this.api.asc_coAuthoringDisconnect();
            Common.Notifications.trigger('api:disconnect');

            if (!old_rights) {
                const { t } = this.props;
                const _t = t('Controller.Main', {returnObjects:true});
                f7.dialog.alert(
                    (!data.message) ? _t.warnProcessRightsChange : data.message,
                    _t.notcriticalErrorTitle,
                    () => { appOptions.changeEditingRights(false); }
                );
            }
        }
    }

    onDownloadUrl(url, fileType) {
        if (this._state.isFromGatewayDownloadAs) {
            Common.Gateway.downloadAs(url, fileType);
        }

        this._state.isFromGatewayDownloadAs = false;
    }

    onDownloadAs(format) {
        const appOptions = this.props.storeAppOptions;

        if (!appOptions.canDownload) {
            const { t } = this.props;
            const _t = t('Controller.Main', { returnObjects:true });
            Common.Gateway.reportError(Asc.c_oAscError.ID.AccessDeny, _t.errorAccessDeny);
            return;
        }

        this._state.isFromGatewayDownloadAs = true;

        let _format = (format && (typeof format == 'string')) ? Asc.c_oAscFileType[format.toUpperCase()] : null,
            _supported = [
                Asc.c_oAscFileType.VSDX,
                Asc.c_oAscFileType.PDF,
                Asc.c_oAscFileType.PDFA,
                Asc.c_oAscFileType.PNG,
                Asc.c_oAscFileType.JPG
            ];

        if (!_format || _supported.indexOf(_format) < 0)
            _format = Asc.c_oAscFileType.VSDX;

        const options = new Asc.asc_CDownloadOptions(_format, true);
        options.asc_setIsSaveAs(true);
        this.api.asc_DownloadAs(options);
    }

    onRequestClose () {
        const { t } = this.props;
        const _t = t("Toolbar", { returnObjects: true });

        if (this.api.isDocumentModified()) {
            this.api.asc_stopSaving();

            f7.dialog.create({
                title: _t.dlgLeaveTitleText,
                text: _t.dlgLeaveMsgText,
                verticalButtons: true,
                buttons : [
                    {
                        text: _t.leaveButtonText,
                        onClick: () => {
                            this.api.asc_undoAllChanges();
                            this.api.asc_continueSaving();
                            Common.Gateway.requestClose();
                        }
                    },
                    {
                        text: _t.stayButtonText,
                        bold: true,
                        onClick: () => {
                            this.api.asc_continueSaving();
                        }
                    }
                ]
            }).open();
        } else {
            Common.Gateway.requestClose();
        }
    }

    onRequestRefreshFile () {
        Common.Gateway.requestRefreshFile();
    }

    onRefreshFile (data) {
        if (data) {
            let docInfo = new Asc.asc_CDocInfo();
            if (data.document) {
                docInfo.put_Id(data.document.key);
                docInfo.put_Url(data.document.url);
                docInfo.put_Title(data.document.title);
                if (data.document.title) {
                    const storeVisioInfo = this.props.storeVisioInfo;
                    storeVisioInfo.changeTitle(data.document.title);
                    this.document.title = data.document.title;
                    Common.Notifications.trigger('setdoctitle', data.document.title);
                }
                data.document.referenceData && docInfo.put_ReferenceData(data.document.referenceData);
            }
            if (data.editorConfig) {
                docInfo.put_CallbackUrl(data.editorConfig.callbackUrl);
            }
            if (data.token)
                docInfo.put_Token(data.token);

            const _userOptions = this.props.storeAppOptions.user;
            const _user = new Asc.asc_CUserInfo();
            _user.put_Id(_userOptions.id);
            _user.put_FullName(_userOptions.fullname);
            _user.put_IsAnonymousUser(_userOptions.anonymous);
            docInfo.put_UserInfo(_user);

            const _options = Object.assign({}, this.document.options, this.editorConfig.actionLink || {});
            docInfo.put_Options(_options);

            docInfo.put_Format(this.document.fileType);
            docInfo.put_Lang(this.editorConfig.lang);
            docInfo.put_Mode(this.editorConfig.mode);
            docInfo.put_Permissions(this.permissions);
            docInfo.put_DirectUrl(data.document && data.document.directUrl ? data.document.directUrl : this.document.directUrl);
            docInfo.put_VKey(data.document && data.document.vkey ?  data.document.vkey : this.document.vkey);
            docInfo.put_EncryptedInfo(data.editorConfig && data.editorConfig.encryptionKeys ? data.editorConfig.encryptionKeys : this.editorConfig.encryptionKeys);

            let enable = false; //!this.editorConfig.customization || (this.editorConfig.customization.macros!==false);
            docInfo.asc_putIsEnabledMacroses(!!enable);
            enable = !this.editorConfig.customization || (this.editorConfig.customization.plugins!==false);
            docInfo.asc_putIsEnabledPlugins(!!enable);

            // let coEditMode = !(this.editorConfig.coEditing && typeof this.editorConfig.coEditing == 'object') ? 'fast' : // fast by default
            //     this.editorConfig.mode === 'view' && this.editorConfig.coEditing.change!==false ? 'fast' : // if can change mode in viewer - set fast for using live viewer
            //     this.editorConfig.coEditing.mode || 'fast';
            var coEditMode = 'strict';
            docInfo.put_CoEditingMode(coEditMode);
            this.api.asc_refreshFile(docInfo);
        }
    }

    render () {
        return (
            <Fragment>
                <LongActionsController />
                <ErrorController LoadingDocument={this.LoadingDocument}/>
                <CollaborationController />
                <PluginsController />
                <Themes />
            </Fragment>
            )
    }

    componentDidMount () {
        Common.EditorApi = {get: () => this.api};
        this.initSdk();
    }
}

const translated = withTranslation()(MainController);
export {translated as MainController};
