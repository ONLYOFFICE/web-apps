
import React, {Component, Fragment} from 'react';
import {inject} from "mobx-react";
import { f7 } from "framework7-react";
import { withTranslation } from 'react-i18next';
import { LocalStorage } from '../../../../common/mobile/utils/LocalStorage';
import CollaborationController from '../../../../common/mobile/lib/controller/collaboration/Collaboration.jsx';
import {InitReviewController as ReviewController} from '../../../../common/mobile/lib/controller/collaboration/Review.jsx';
import { onAdvancedOptions } from './settings/Download.jsx';
import {
    CommentsController,
    ViewCommentsController
} from "../../../../common/mobile/lib/controller/collaboration/Comments";
import About from '../../../../common/mobile/lib/view/About';
import EditorUIController from '../lib/patch';
import ErrorController from "./Error";
import LongActionsController from "./LongActions";
import PluginsController from '../../../../common/mobile/lib/controller/Plugins.jsx';
import EncodingController from "./Encoding";
import DropdownListController from "./DropdownList";
import { Device } from '../../../../common/mobile/utils/device';
@inject(
    "users",
    "storeAppOptions",
    "storeDocumentSettings",
    "storeFocusObjects",
    "storeTextSettings",
    "storeParagraphSettings",
    "storeTableSettings",
    "storeDocumentInfo",
    "storeChartSettings",
    "storeApplicationSettings",
    "storeLinkSettings",
    "storeToolbarSettings",
    "storeNavigation"
    )
class MainController extends Component {
    constructor(props) {
        super(props);
        window.editorType = 'de';

        this.LoadingDocument = -256;
        this.ApplyEditRights = -255;
        this.boxSdk = $$('#editor_sdk');

        this._state = {
            licenseType: false,
            isFromGatewayDownloadAs: false,
            isDocModified: false
        };

        this.defaultTitleText = __APP_TITLE_TEXT__;
        this.stackMacrosRequests = [];

        const { t } = this.props;
        this._t = t('Main', {returnObjects:true});
    }

    initSdk() {
        const on_script_load = () => {
            !window.sdk_scripts && (window.sdk_scripts = ['../../../../sdkjs/common/AllFonts.js',
                                                            '../../../../sdkjs/word/sdk-all-min.js']);
            let dep_scripts = ['../../../vendor/xregexp/xregexp-all-min.js',
                                '../../../vendor/sockjs/sockjs.min.js'];
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
                const _t = t('Main', {returnObjects:true});
                EditorUIController.isSupportEditFeature();

                this.editorConfig = Object.assign({}, this.editorConfig, data.config);

                this.props.storeAppOptions.setConfigOptions(this.editorConfig, _t);

                this.editorConfig.lang && this.api.asc_setLocale(this.editorConfig.lang);

                let value = LocalStorage.getItem("de-mobile-macros-mode");
                if (value === null) {
                    value = this.editorConfig.customization ? this.editorConfig.customization.macrosMode : 'warn';
                    value = (value === 'enable') ? 1 : (value === 'disable' ? 2 : 0);
                } else {
                    value = parseInt(value);
                }
                this.props.storeApplicationSettings.changeMacrosSettings(value);

                value = localStorage.getItem("de-mobile-allow-macros-request");
                this.props.storeApplicationSettings.changeMacrosRequest((value !== null) ? parseInt(value)  : 0);

                Common.Notifications.trigger('configOptionsFill');
            };

            const loadDocument = data => {
                this.permissions = {};
                this.document = data.doc;

                let docInfo = {};

                if (data.doc) {
                    this.permissions = Object.assign(this.permissions, data.doc.permissions);

                    const _options = Object.assign({}, data.doc.options, this.editorConfig.actionLink || {});
                    const _userOptions = this.props.storeAppOptions.user;
                    const _user = new Asc.asc_CUserInfo();
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

                    let type = /^(?:(pdf|djvu|xps|oxps))$/.exec(data.doc.fileType);
                    let coEditMode = (type && typeof type[1] === 'string') ? 'strict' :  // offline viewer for pdf|djvu|xps|oxps
                                    !(this.editorConfig.coEditing && typeof this.editorConfig.coEditing == 'object') ? 'fast' : // fast by default
                                    this.editorConfig.mode === 'view' && this.editorConfig.coEditing.change!==false ? 'fast' : // if can change mode in viewer - set fast for using live viewer
                                    this.editorConfig.coEditing.mode || 'fast';
                    docInfo.put_CoEditingMode(coEditMode);

                    let enable = !this.editorConfig.customization || (this.editorConfig.customization.macros !== false);
                    docInfo.asc_putIsEnabledMacroses(!!enable);
                    enable = !this.editorConfig.customization || (this.editorConfig.customization.plugins !== false);
                    docInfo.asc_putIsEnabledPlugins(!!enable);

                    if (type && typeof type[1] === 'string') {
                        this.permissions.edit = this.permissions.review = false;
                    }
                }

                let type = data.doc ? /^(?:(oform))$/.exec(data.doc.fileType) : false;
                if (type && typeof type[1] === 'string') {
                    (this.permissions.fillForms===undefined) && (this.permissions.fillForms = (this.permissions.edit!==false));
                    this.permissions.edit = this.permissions.review = this.permissions.comment = false;
                }

                this.api.asc_registerCallback('asc_onGetEditorPermissions', onEditorPermissions);
                this.api.asc_registerCallback('asc_onDocumentContentReady', onDocumentContentReady);
                this.api.asc_registerCallback('asc_onLicenseChanged', this.onLicenseChanged.bind(this));
                this.api.asc_registerCallback('asc_onMacrosPermissionRequest', this.onMacrosPermissionRequest.bind(this));
                this.api.asc_registerCallback('asc_onRunAutostartMacroses', this.onRunAutostartMacroses.bind(this));
                this.api.asc_setDocInfo(docInfo);
                this.api.asc_getEditorPermissions(this.editorConfig.licenseUrl, this.editorConfig.customerId);

                // Document Info

                const storeDocumentInfo = this.props.storeDocumentInfo;

                storeDocumentInfo.setDataDoc(this.document);

                // Common.SharedSettings.set('document', data.doc);

                if (data.doc) {
                    Common.Notifications.trigger('setdoctitle', data.doc.title);
                    if (data.doc.info) {
                       data.doc.info.author && console.log("Obsolete: The 'author' parameter of the document 'info' section is deprecated. Please use 'owner' instead.");
                       data.doc.info.created && console.log("Obsolete: The 'created' parameter of the document 'info' section is deprecated. Please use 'uploaded' instead.");
                   }
                }
            };

            const onEditorPermissions = params => {
                const licType = params.asc_getLicenseType();

                const { t } = this.props;
                const _t = t('Main', {returnObjects:true});
                // check licType
                if (Asc.c_oLicenseResult.Expired === licType ||
                    Asc.c_oLicenseResult.Error === licType ||
                    Asc.c_oLicenseResult.ExpiredTrial === licType) {
                    f7.dialog.create({
                        title   : _t.titleLicenseExp,
                        text    : _t.warnLicenseExp
                    }).open();
                    return;
                }
                if (Asc.c_oLicenseResult.ExpiredLimited === licType) {
                    this._state.licenseType = licType;
                }

                if ( this.onServerVersion(params.asc_getBuildVersion()) ) return;

                this.appOptions.canLicense = (licType === Asc.c_oLicenseResult.Success || licType === Asc.c_oLicenseResult.SuccessLimit);

                const storeAppOptions = this.props.storeAppOptions;

                storeAppOptions.setPermissionOptions(this.document, licType, params, this.permissions, EditorUIController.isSupportEditFeature());

                this.applyMode(storeAppOptions);

                const storeDocumentInfo = this.props.storeDocumentInfo;
                const dataDoc = storeDocumentInfo.dataDoc;
                const isExtRestriction = dataDoc.fileType !== 'oform';

                if(isExtRestriction) {
                    this.api.asc_addRestriction(Asc.c_oAscRestrictionType.View);
                } else {
                    this.api.asc_addRestriction(Asc.c_oAscRestrictionType.OnlyForms)
                }

                this.api.asc_LoadDocument();
                this.api.Resize();
            };

            const onDocumentContentReady = () => {
                if (this._isDocReady)
                    return;

                const appOptions = this.props.storeAppOptions;
                const appSettings = this.props.storeApplicationSettings;

                f7.emit('resize');

                this._isDocReady = true;

                this.api.SetDrawingFreeze(false);

                Common.Notifications.trigger('preloader:close');
                Common.Notifications.trigger('preloader:endAction', Asc.c_oAscAsyncActionType['BlockInteraction'], this.LoadingDocument);

                appOptions.isRestrictedEdit && appOptions.canFillForms && this.api.asc_SetHighlightRequiredFields(true);

                let value = LocalStorage.getItem("de-settings-zoom");
                const zf = (value !== null) ? parseInt(value) : (appOptions.customization && appOptions.customization.zoom ? parseInt(appOptions.customization.zoom) : 100);
                (zf === -1) ? this.api.zoomFitToPage() : ((zf === -2) ? this.api.zoomFitToWidth() : this.api.zoom(zf>0 ? zf : 100));

                value = LocalStorage.getBool("de-mobile-spellcheck", !(appOptions.customization && appOptions.customization.spellcheck === false));
                appSettings.changeSpellCheck(value);
                this.api.asc_setSpellCheck(value);

                this.updateWindowTitle(true);

                this.api.SetTextBoxInputMode(LocalStorage.getBool("de-settings-inputmode"));

                value = LocalStorage.getBool("de-mobile-no-characters");
                appSettings.changeNoCharacters(value);
                this.api.put_ShowParaMarks(value);

                value = LocalStorage.getBool("de-mobile-hidden-borders");
                appSettings.changeShowTableEmptyLine(value);
                this.api.put_ShowTableEmptyLine(value);

                value = LocalStorage.getBool('mobile-view', true);

                if(value) {
                    this.api.ChangeReaderMode();
                } else {
                    appOptions.changeMobileView();
                }

                if (appOptions.isEdit && this.needToUpdateVersion) {
                    Common.Notifications.trigger('api:disconnect');
                }

                Common.Gateway.on('processsaveresult', this.onProcessSaveResult.bind(this));
                Common.Gateway.on('processrightschange', this.onProcessRightsChange.bind(this));
                Common.Gateway.on('downloadas', this.onDownloadAs.bind(this));
                Common.Gateway.on('requestclose', this.onRequestClose.bind(this));

                Common.Gateway.sendInfo({
                    mode: appOptions.isEdit ? 'edit' : 'view'
                });

                this.api.Resize();
                this.api.zoomFitToWidth();
                this.api.asc_GetDefaultTableStyles && setTimeout(() => {this.api.asc_GetDefaultTableStyles()}, 1);
                this.applyLicense();

                Common.Notifications.trigger('document:ready');
                Common.Gateway.documentReady();
                appOptions.changeDocReady(true);
            };

            const _process_array = (array, fn) => {
                let results = [];
                return array.reduce(function(p, item) {
                    return p.then(function() {
                        return fn(item).then(function(data) {
                            results.push(data);
                            return results;
                        });
                    });
                }, Promise.resolve());
            };

            _process_array(dep_scripts, promise_get_script)
                .then ( result => {
                    window["flat_desine"] = true;
                    const {t} = this.props;
                    let _translate = t('Main.SDK', {returnObjects:true});
                    for (let item in _translate) {
                        if (_translate.hasOwnProperty(item)) {
                            const str = _translate[item];
                            if (item[item.length-1]===' ' && str[str.length-1]!==' ')
                                _translate[item] += ' ';
                        }
                    }
                    ["Error! Bookmark not defined",
                     "No table of contents entries found",
                     "No table of figures entries found",
                     "Error! Main Document Only",
                     "Error! Not a valid bookmark self-reference",
                     "Error! No text of specified style in document"].forEach(item => {
                        _translate[item + '.'] = _translate[item];
                        delete _translate[item];
                    });

                    this.api = new Asc.asc_docs_api({
                        'id-view'  : 'editor_sdk',
                        'mobile'   : true,
                        'translate': _translate
                    });

                    Common.Notifications.trigger('engineCreated', this.api);
                    // Common.EditorApi = {get: () => this.api};

                    // Set font rendering mode
                    let value = LocalStorage.getItem("de-settings-fontrender");
                    if (value === null) {
                        value = window.devicePixelRatio > 1 ? '1' : '0';
                    }
                    switch (value) {
                        case '0': this.api.SetFontRenderingMode(3); break;
                        case '1': this.api.SetFontRenderingMode(1); break;
                        case '2': this.api.SetFontRenderingMode(2); break;
                    }

                    Common.Utils.Metric.setCurrentMetric(1); //pt

                    this.appOptions   = {};
                    this.bindEvents();

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
            script.src = "../../../../sdkjs/develop/sdkjs/word/scripts.js";
            script.async = true;
            script.onload = on_script_load;
            script.onerror = () => {
                console.log('error on load scripts');
            };

            document.body.appendChild(script);
        } else {
            on_script_load();
        }
    }

    applyMode (appOptions) {
        this.api.asc_enableKeyEvents(appOptions.isEdit);
        this.api.asc_setViewMode(!appOptions.isEdit && !appOptions.isRestrictedEdit);
        appOptions.isRestrictedEdit && appOptions.canComments && this.api.asc_setRestriction(Asc.c_oAscRestrictionType.OnlyComments);
        appOptions.isRestrictedEdit && appOptions.canFillForms && this.api.asc_setRestriction(Asc.c_oAscRestrictionType.OnlyForms);

        // Set units
        let value = LocalStorage.getItem('de-mobile-settings-unit');
        value = (value !== null) ? parseInt(value) : (appOptions.customization && appOptions.customization.unit ? Common.Utils.Metric.c_MetricUnits[appOptions.customization.unit.toLocaleLowerCase()] : Common.Utils.Metric.getDefaultMetric());
        (value === undefined) && (value = Common.Utils.Metric.getDefaultMetric());
        Common.Utils.Metric.setCurrentMetric(value);
        this.api.asc_SetDocumentUnits((value === Common.Utils.Metric.c_MetricUnits.inch) ? Asc.c_oAscDocumentUnits.Inch : ((value===Common.Utils.Metric.c_MetricUnits.pt) ? Asc.c_oAscDocumentUnits.Point : Asc.c_oAscDocumentUnits.Millimeter));

        this.api.asc_registerCallback('asc_onDocumentModifiedChanged', this.onDocumentModifiedChanged.bind(this));
        this.api.asc_registerCallback('asc_onDocumentCanSaveChanged',  this.onDocumentCanSaveChanged.bind(this));

        Common.Notifications.trigger('preloader:close');
        Common.Notifications.trigger('preloader:endAction', Asc.c_oAscAsyncActionType['BlockInteraction'], this.ApplyEditRights);

        if (!this._isDocReady) {
            Common.Notifications.trigger('preloader:beginAction', Asc.c_oAscAsyncActionType['BlockInteraction'], this.LoadingDocument);
        }

        // Message on window close
        window.onbeforeunload = this.onBeforeUnload.bind(this);
        window.onunload = this.onUnload.bind(this);
    }

    onDocumentModifiedChanged () {
        const isModified = this.api.asc_isDocumentCanSave();
        if (this._state.isDocModified !== isModified) {
            this._isDocReady && Common.Gateway.setDocumentModified(this.api.isDocumentModified());
        }

        this.updateWindowTitle();
    }

    onDocumentCanSaveChanged (isCanSave) {
        //
    }

    onBeforeUnload () {
        LocalStorage.save();

        if (this.api.isDocumentModified()) {
            this.api.asc_stopSaving();
            this.continueSavingTimer = window.setTimeout(() => {
                this.api.asc_continueSaving();
            }, 500);

            const { t } = this.props;
            const _t = t('Main', {returnObjects:true});
            return _t.leavePageText;
        }
    }

    onUnload () {
        if (this.continueSavingTimer)
            clearTimeout(this.continueSavingTimer);
    }

    onLicenseChanged (params) {
        const appOptions = this.props.storeAppOptions;
        const licType = params.asc_getLicenseType();
    
        if (licType !== undefined && (appOptions.canEdit || appOptions.isRestrictedEdit) && appOptions.config.mode !== 'view' &&
            (licType === Asc.c_oLicenseResult.Connections || licType === Asc.c_oLicenseResult.UsersCount || licType === Asc.c_oLicenseResult.ConnectionsOS || licType === Asc.c_oLicenseResult.UsersCountOS
                || licType === Asc.c_oLicenseResult.SuccessLimit && (appOptions.trialMode & Asc.c_oLicenseMode.Limited) !== 0))
            this._state.licenseType = licType;

        if (licType !== undefined && appOptions.canLiveView && (licType===Asc.c_oLicenseResult.ConnectionsLive || licType===Asc.c_oLicenseResult.ConnectionsLiveOS ||
                                                                licType===Asc.c_oLicenseResult.UsersViewCount || licType===Asc.c_oLicenseResult.UsersViewCountOS))
            this._state.licenseType = licType;

        if (this._isDocReady && this._state.licenseType)
            this.applyLicense();
    }

    applyLicense () {
        const { t } = this.props;
        const _t = t('Main', {returnObjects:true});

        const warnNoLicense  = _t.warnNoLicense.replace(/%1/g, __COMPANY_NAME__);
        const warnNoLicenseUsers = _t.warnNoLicenseUsers.replace(/%1/g, __COMPANY_NAME__);
        const textNoLicenseTitle = _t.textNoLicenseTitle.replace(/%1/g, __COMPANY_NAME__);
        const warnLicenseExceeded = _t.warnLicenseExceeded.replace(/%1/g, __COMPANY_NAME__);
        const warnLicenseUsersExceeded = _t.warnLicenseUsersExceeded.replace(/%1/g, __COMPANY_NAME__);

        const appOptions = this.props.storeAppOptions;
        if (appOptions.config.mode !== 'view' && !EditorUIController.isSupportEditFeature()) {
            let value = LocalStorage.getItem("de-opensource-warning");
            value = (value !== null) ? parseInt(value) : 0;
            const now = (new Date).getTime();
            if (now - value > 86400000) {
                LocalStorage.setItem("de-opensource-warning", now);
                f7.dialog.create({
                    title: _t.notcriticalErrorTitle,
                    text : _t.errorOpensource,
                    buttons: [{text: 'OK'}]
                }).open();
            }
            Common.Notifications.trigger('toolbar:activatecontrols');
            return;
        }

        if (appOptions.config.mode === 'view') {
            if (appOptions.canLiveView && (this._state.licenseType===Asc.c_oLicenseResult.ConnectionsLive || this._state.licenseType===Asc.c_oLicenseResult.ConnectionsLiveOS ||
                                            this._state.licenseType===Asc.c_oLicenseResult.UsersViewCount || this._state.licenseType===Asc.c_oLicenseResult.UsersViewCountOS)) {
                appOptions.canLiveView = false;
                this.api.asc_SetFastCollaborative(false);
            }
            Common.Notifications.trigger('toolbar:activatecontrols');
        } else if (this._state.licenseType) {
            let license = this._state.licenseType;
            let buttons = [{text: 'OK'}];
            if ((appOptions.trialMode & Asc.c_oLicenseMode.Limited) !== 0 &&
                (license === Asc.c_oLicenseResult.SuccessLimit ||
                    license === Asc.c_oLicenseResult.ExpiredLimited ||
                    appOptions.permissionsLicense === Asc.c_oLicenseResult.SuccessLimit)
            ) {
                license = (license === Asc.c_oLicenseResult.ExpiredLimited) ? _t.warnLicenseLimitedNoAccess : _t.warnLicenseLimitedRenewed;
            } else if (license === Asc.c_oLicenseResult.Connections || license === Asc.c_oLicenseResult.UsersCount) {
                license = (license===Asc.c_oLicenseResult.Connections) ? warnLicenseExceeded : warnLicenseUsersExceeded;
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
                Common.Notifications.trigger('toolbar:deactivateeditcontrols');
                Common.Notifications.trigger('api:disconnect');
            }

            let value = LocalStorage.getItem("de-license-warning");
            value = (value !== null) ? parseInt(value) : 0;
            const now = (new Date).getTime();

            if (now - value > 86400000) {
                LocalStorage.setItem("de-license-warning", now);
                f7.dialog.create({
                    title: textNoLicenseTitle,
                    text : license,
                    buttons: buttons
                }).open();
            }
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

    onServerVersion (buildVersion) {
        if (this.changeServerVersion) return true;
        const { t } = this.props;
        const _t = t('Main', {returnObjects:true});

        if (About.appVersion() !== buildVersion && !About.compareVersions()) {
            this.changeServerVersion = true;
            f7.dialog.alert(
                _t.errorServerVersion,
                _t.titleServerVersion,
                () => {
                    setTimeout(() => {Common.Gateway.updateVersion()}, 0);
                });
            return true;
        }
        return false;
    }

    bindEvents() {
        $$(window).on('resize', () => {
            this.api.Resize();
        });

        $$(window).on('popover:open popup:open sheet:open actions:open dialog:open', () => {
            this.api.asc_enableKeyEvents(false);
        });

        $$(window).on('popover:close popup:close sheet:close actions:close dialog:close', () => {
            this.api.asc_enableKeyEvents(true);
        });

        this.api.asc_registerCallback('asc_onDocumentUpdateVersion', this.onUpdateVersion.bind(this));
        this.api.asc_registerCallback('asc_onServerVersion', this.onServerVersion.bind(this));
        this.api.asc_registerCallback('asc_onDocumentName', this.onDocumentName.bind(this));
        this.api.asc_registerCallback('asc_onPrintUrl', this.onPrintUrl.bind(this));
        this.api.asc_registerCallback('asc_onPrint', this.onPrint.bind(this));

        EditorUIController.initThemeColors && EditorUIController.initThemeColors();

        this.api.asc_registerCallback('asc_onDownloadUrl', this.onDownloadUrl.bind(this));

        const storeDocumentSettings = this.props.storeDocumentSettings;
        this.api.asc_registerCallback('asc_onPageOrient', isPortrait => {
            storeDocumentSettings.resetPortrait(isPortrait);
        });
        this.api.asc_registerCallback('asc_onDocSize', (w, h) => {
            storeDocumentSettings.changeDocSize(w, h);
        });

        this.api.asc_registerCallback('asc_onShowContentControlsActions', (obj, x, y) => {
            const storeAppOptions = this.props.storeAppOptions;
            if (!storeAppOptions.isEdit && !(storeAppOptions.isRestrictedEdit && storeAppOptions.canFillForms) || this.props.users.isDisconnected) return;

            switch (obj.type) {
                case Asc.c_oAscContentControlSpecificType.DateTime:
                    this.onShowDateActions(obj, x, y);
                    break;
                case Asc.c_oAscContentControlSpecificType.Picture:
                    if (obj.pr && obj.pr.get_Lock) {
                        let lock = obj.pr.get_Lock();
                        if (lock == Asc.c_oAscSdtLockType.SdtContentLocked || lock == Asc.c_oAscSdtLockType.ContentLocked)
                            return;
                    }
                    this.api.asc_addImage(obj);
                    setTimeout(() => {
                        this.api.asc_UncheckContentControlButtons();
                    }, 500);
                    break;
                case Asc.c_oAscContentControlSpecificType.DropDownList:
                case Asc.c_oAscContentControlSpecificType.ComboBox:
                    this.onShowListActions(obj, x, y);
                    break;
            }
        });

        const storeTextSettings = this.props.storeTextSettings;
        storeTextSettings.resetFontsRecent(LocalStorage.getItem('dde-settings-recent-fonts'));

        EditorUIController.initFonts && EditorUIController.initFonts(storeTextSettings);
        EditorUIController.initFocusObjects && EditorUIController.initFocusObjects(this.props.storeFocusObjects);

        this.api.asc_registerCallback('asc_onVerticalAlign', (typeBaseline) => {
            storeTextSettings.resetTypeBaseline(typeBaseline);
        });
        this.api.asc_registerCallback('asc_onListType', (data) => {
            let type    = data.get_ListType();
            let subtype = data.get_ListSubType();
            storeTextSettings.resetListType(type);
            switch (type) {
                case 0:
                    storeTextSettings.resetBullets(subtype);
                    storeTextSettings.resetNumbers(-1);
                    break;
                case 1:
                    storeTextSettings.resetNumbers(subtype);
                    storeTextSettings.resetBullets(-1);
                    break;
                default: 
                    storeTextSettings.resetBullets(-1);
                    storeTextSettings.resetNumbers(-1);
                    storeTextSettings.resetMultiLevel(-1);
            }
        });
        this.api.asc_registerCallback('asc_onPrAlign', (align) => {
            storeTextSettings.resetParagraphAlign(align);
        });
        this.api.asc_registerCallback('asc_onTextColor', (color) => {
            storeTextSettings.resetTextColor(color);
        });
        this.api.asc_registerCallback('asc_onParaSpacingLine', (vc) => {
            storeTextSettings.resetLineSpacing(vc);
        });

        this.api.asc_registerCallback('asc_onTextHighLight', color => {
            let textPr = this.api.get_TextProps().get_TextPr();

            if(textPr) {
                color = textPr.get_HighLight();
                storeTextSettings.resetHighlightColor(color);
            }
        });

        // link settings
        const storeLinkSettings = this.props.storeLinkSettings;
        this.api.asc_registerCallback('asc_onCanAddHyperlink', (value) => {
            storeLinkSettings.canAddHyperlink(value);
        });

        //paragraph settings
        EditorUIController.initEditorStyles && EditorUIController.initEditorStyles(this.props.storeParagraphSettings);

        //table settings
        EditorUIController.initTableTemplates && EditorUIController.initTableTemplates(this.props.storeTableSettings);

        //chart settings
        EditorUIController.updateChartStyles && EditorUIController.updateChartStyles(this.props.storeChartSettings, this.props.storeFocusObjects);

        // Document Info

        const storeDocumentInfo = this.props.storeDocumentInfo;

        this.api.asc_registerCallback("asc_onGetDocInfoStart", () => {
            this.timerLoading = setTimeout(() => {
                storeDocumentInfo.switchIsLoaded(false);
            }, 2000);
        });

        this.api.asc_registerCallback("asc_onGetDocInfoStop", () => {
            storeDocumentInfo.switchIsLoaded(true);
        });

        this.api.asc_registerCallback("asc_onDocInfo", (obj) => {
            clearTimeout(this.timerLoading);

            this.objectInfo = obj;
            if(!this.timerDocInfo) {
                this.timerDocInfo = setInterval(() => {
                    storeDocumentInfo.changeCount(this.objectInfo);
                }, 300);
                storeDocumentInfo.changeCount(this.objectInfo);
            }
        });

        this.api.asc_registerCallback('asc_onGetDocInfoEnd', () => {
          clearTimeout(this.timerLoading);
          clearInterval(this.timerDocInfo);
          storeDocumentInfo.changeCount(this.objectInfo);
        });

        this.api.asc_registerCallback('asc_onMeta', (meta) => {
            if(meta) {
                storeDocumentInfo.changeTitle(meta.title);
            }
        });

        // Color Schemes

        this.api.asc_registerCallback('asc_onSendThemeColorSchemes', (arr) => {
            storeDocumentSettings.addSchemes(arr);
        });

        // Downloaded Advanced Options
        
        this.api.asc_registerCallback('asc_onAdvancedOptions', (type, advOptions, mode, formatOptions) => {
            const {t} = this.props;
            const _t = t("Settings", { returnObjects: true });
            if(type == Asc.c_oAscAdvancedOptionsID.DRM) {
                onAdvancedOptions(type, _t, this._isDocReady, this.props.storeAppOptions.canRequestClose, this.isDRM);
                this.isDRM = true;
            }
        });

        // Toolbar settings

        const storeToolbarSettings = this.props.storeToolbarSettings;
        this.api.asc_registerCallback('asc_onCanUndo', (can) => {
            if (this.props.users.isDisconnected) return;
            storeToolbarSettings.setCanUndo(can);
        });
        this.api.asc_registerCallback('asc_onCanRedo', (can) => {
            if (this.props.users.isDisconnected) return;
            storeToolbarSettings.setCanRedo(can);
        });

        this.api.asc_registerCallback('asc_onReplaceAll', this.onApiTextReplaced.bind(this));

        const storeNavigation = this.props.storeNavigation;

        this.api.asc_registerCallback('asc_onViewerBookmarksUpdate', (bookmarks) => {
            storeNavigation.initBookmarks(bookmarks);
        });
    }

    onApiTextReplaced(found, replaced) {
        const { t } = this.props;

        if (found) { 
            f7.dialog.alert(null, !(found - replaced > 0) ? t('Main.textReplaceSuccess').replace(/\{0\}/, `${replaced}`) : t('Main.textReplaceSkipped').replace(/\{0\}/, `${found - replaced}`));
        } else {
            f7.dialog.alert(null, t('Main.textNoTextFound'));
        }
    }

    onShowDateActions(obj, x, y) {
        const { t } = this.props;
        const boxSdk = $$('#editor_sdk');

        let props = obj.pr,
            specProps = props.get_DateTimePr(),
            isPhone = Device.isPhone,
            controlsContainer = boxSdk.find('#calendar-target-element'),
            _dateObj = props;

        if (controlsContainer.length < 1) {
            controlsContainer = $$('<div id="calendar-target-element" style="position: absolute;"></div>');
            boxSdk.append(controlsContainer);
        }

        controlsContainer.css({left: `${x}px`, top: `${y}px`});

        this.cmpCalendar = f7.calendar.create({
            inputEl: '#calendar-target-element',
            dayNamesShort: [t('Edit.textSu'), t('Edit.textMo'), t('Edit.textTu'), t('Edit.textWe'), t('Edit.textTh'), t('Edit.textFr'), t('Edit.textSa')],
            monthNames: [t('Edit.textJanuary'), t('Edit.textFebruary'), t('Edit.textMarch'), t('Edit.textApril'), t('Edit.textMay'), t('Edit.textJune'), t('Edit.textJuly'), t('Edit.textAugust'), t('Edit.textSeptember'), t('Edit.textOctober'), t('Edit.textNovember'), t('Edit.textDecember')],
            backdrop: isPhone ? false : true,
            closeByBackdropClick: isPhone ? false : true,
            value: [new Date(specProps ? specProps.get_FullDate() : undefined)],
            openIn: isPhone ? 'sheet' : 'popover',
            on: {
                change: (calendar, value) => {
                    if(calendar.initialized && value[0]) {
                        let specProps = _dateObj.get_DateTimePr();
                        specProps.put_FullDate(new Date(value[0]));
                        this.api.asc_SetContentControlDatePickerDate(specProps);
                        calendar.close();
                        this.api.asc_UncheckContentControlButtons();
                    }
                }
            }
        });

        setTimeout(() => {
            this.cmpCalendar.open();
        }, 100)
    }

    onShowListActions(obj, x, y) {
        if(!Device.isPhone) {
            const boxSdk = $$('#editor_sdk');
            let dropdownListTarget = boxSdk.find('#dropdown-list-target');
        
            if (dropdownListTarget.length < 1) {
                dropdownListTarget = $$('<div id="dropdown-list-target" style="position: absolute;"></div>');
                boxSdk.append(dropdownListTarget);
            }
        
            dropdownListTarget.css({left: `${x}px`, top: `${y}px`});
        }

        Common.Notifications.trigger('openDropdownList', obj);
    }

    onProcessSaveResult (data) {
        this.api.asc_OnSaveEnd(data.result);

        if (data && data.result === false) {
            const { t } = this.props;
            const _t = t('Main', {returnObjects:true});

            f7.dialog.alert(
                (!data.message) ? _t.errorProcessSaveResult : data.message,
                _t.criticalErrorTitle
            );
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
                const _t = t('Main', {returnObjects:true});

                f7.dialog.alert(
                    (!data.message) ? _t.warnProcessRightsChange : data.message,
                    _t.notcriticalErrorTitle,
                    () => { appOptions.changeEditingRights(false); }
                );
            }
        }
    }

    onDownloadAs () {
        const appOptions = this.props.storeAppOptions;
        if ( !appOptions.canDownload && !appOptions.canDownloadOrigin) {
            const { t } = this.props;
            const _t = t('Main', {returnObjects:true});
            Common.Gateway.reportError(Asc.c_oAscError.ID.AccessDeny, _t.errorAccessDeny);
            return;
        }

        this._state.isFromGatewayDownloadAs = true;
        const type = /^(?:(pdf|djvu|xps|oxps))$/.exec(this.document.fileType);

        if (type && typeof type[1] === 'string') {
            this.api.asc_DownloadOrigin(true);
        } else {
            this.api.asc_DownloadAs(new Asc.asc_CDownloadOptions(Asc.c_oAscFileType.DOCX, true));
        }
    }

    onDownloadUrl (url, fileType) {
        if (this._state.isFromGatewayDownloadAs) {
            Common.Gateway.downloadAs(url, fileType);
        }

        this._state.isFromGatewayDownloadAs = false;
    }

    onRequestClose () {
        Common.Gateway.requestClose();
    }

    onUpdateVersion (callback) {
        const { t } = this.props;
        const _t = t('Main', {returnObjects:true});

        this.needToUpdateVersion = true;
        Common.Notifications.trigger('preloader:endAction', Asc.c_oAscAsyncActionType['BlockInteraction'], this.LoadingDocument);

        f7.dialog.alert(
            _t.errorUpdateVersion,
            _t.titleUpdateVersion,
            () => {
                Common.Gateway.updateVersion();
                if (callback) {
                    callback.call(this);
                }
                Common.Notifications.trigger('preloader:beginAction', Asc.c_oAscAsyncActionType['BlockInteraction'], this.LoadingDocument);
            });
    }

    onDocumentName () {
        this.updateWindowTitle(true);
    }

    updateWindowTitle (force) {
        const isModified = this.api.isDocumentModified();
        if (this._state.isDocModified !== isModified || force) {
            const title = this.defaultTitleText;

            if (window.document.title != title) {
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

    onRunAutostartMacroses () {
        const config = this.props.storeAppOptions.config;
        const enable = !config.customization || (config.customization.macros !== false);
        if (enable) {
            const value = this.props.storeApplicationSettings.macrosMode;
            if (value === 1) {
                this.api.asc_runAutostartMacroses();
            } else if (value === 0) {
                const { t } = this.props;
                const _t = t('Main', {returnObjects:true});
                f7.dialog.create({
                    title: _t.notcriticalErrorTitle,
                    text: _t.textHasMacros,
                    content: `<div class="checkbox-in-modal">
                      <label class="checkbox">
                        <input type="checkbox" name="checkbox-show-macros" />
                        <i class="icon-checkbox"></i>
                      </label>
                      <span class="right-text">${_t.textRemember}</span>
                      </div>`,
                    buttons: [{
                        text: _t.textYes,
                        onClick: () => {
                            const dontshow = $$('input[name="checkbox-show-macros"]').prop('checked');
                            if (dontshow) {
                                this.props.storeApplicationSettings.changeMacrosSettings(1);
                                LocalStorage.setItem("de-mobile-macros-mode", 1);
                            }
                            setTimeout(() => {
                                this.api.asc_runAutostartMacroses();
                            }, 1);
                        }},
                        {
                            text: _t.textNo,
                            onClick: () => {
                                const dontshow = $$('input[name="checkbox-show-macros"]').prop('checked');
                                if (dontshow) {
                                    this.props.storeApplicationSettings.changeMacrosSettings(2);
                                    LocalStorage.setItem("de-mobile-macros-mode", 2);
                                }
                            }
                        }]
                }).open();
            }
        }
    }

    onMacrosPermissionRequest (url, callback) {
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

        const value = this.props.storeApplicationSettings.macrosRequest;
        if (value>0) {
            callback && callback(value === 1);
            this.stackMacrosRequests.shift();
            this.onMacrosPermissionRequest();
        } else {
            const { t } = this.props;
            const _t = t('Main', {returnObjects:true});
            f7.dialog.create({
                title: _t.notcriticalErrorTitle,
                text: _t.textRequestMacros.replace('%1', url),
                cssClass: 'dlg-macros-request',
                content: `<div class="checkbox-in-modal">
                      <label class="checkbox">
                        <input type="checkbox" name="checkbox-show-macros" />
                        <i class="icon-checkbox"></i>
                      </label>
                      <span class="right-text">${_t.textRemember}</span>
                      </div>`,
                buttons: [{
                    text: _t.textYes,
                    onClick: () => {
                        const dontshow = $$('input[name="checkbox-show-macros"]').prop('checked');
                        if (dontshow) {
                            this.props.storeApplicationSettings.changeMacrosRequest(1);
                            LocalStorage.setItem("de-mobile-allow-macros-request", 1);
                        }
                        setTimeout(() => {
                            if (callback) callback(true);
                            this.stackMacrosRequests.shift();
                            this.onMacrosPermissionRequest();
                        }, 1);
                    }},
                    {
                        text: _t.textNo,
                        onClick: () => {
                            const dontshow = $$('input[name="checkbox-show-macros"]').prop('checked');
                            if (dontshow) {
                                this.props.storeApplicationSettings.changeMacrosRequest(2);
                                LocalStorage.setItem("de-mobile-allow-macros-request", 2);
                            }
                            setTimeout(() => {
                                if (callback) callback(false);
                                this.stackMacrosRequests.shift();
                                this.onMacrosPermissionRequest();
                            }, 1);
                        }
                    }]
            }).open();
        }
    }

    render() {
        return (
            <Fragment>
                <LongActionsController />
                <ErrorController LoadingDocument={this.LoadingDocument}/>
                <CollaborationController />
                <ReviewController />
                <CommentsController />
                {EditorUIController.getEditCommentControllers && EditorUIController.getEditCommentControllers()}
                <ViewCommentsController />
                <PluginsController />
                <EncodingController />
                <DropdownListController />
            </Fragment>
            )
    }

    componentDidMount() {
        Common.EditorApi = {get: () => this.api};
        this.initSdk();
    }
}

const translated = withTranslation()(MainController);
export {translated as MainController};
