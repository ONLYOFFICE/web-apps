
import React, { Component, Fragment } from 'react'
import { inject } from "mobx-react";
import { f7 } from 'framework7-react';
import { withTranslation } from 'react-i18next';
import CollaborationController from '../../../../common/mobile/lib/controller/collaboration/Collaboration.jsx'
import { onAdvancedOptions } from './settings/Download.jsx';
import EditorUIController from '../lib/patch';
import {
    AddCommentController,
    CommentsController,
    EditCommentController,
    ViewCommentsController
} from "../../../../common/mobile/lib/controller/collaboration/Comments";
import {LocalStorage} from "../../../../common/mobile/utils/LocalStorage";
import LongActionsController from "./LongActions";
import ErrorController from "./Error";
import app from "../page/app";
import About from "../../../../common/mobile/lib/view/About";
import PluginsController from '../../../../common/mobile/lib/controller/Plugins.jsx';
import { StatusbarController } from "./Statusbar";

@inject(
    "users",
    "storeAppOptions",
    "storeFocusObjects",
    "storeCellSettings",
    "storeTextSettings",
    "storeChartSettings",
    "storeSpreadsheetSettings",
    "storeSpreadsheetInfo",
    "storeApplicationSettings",
    "storeToolbarSettings"
    )
class MainController extends Component {
    constructor(props) {
        super(props);
        window.editorType = 'sse';

        this.LoadingDocument = -256;
        this.ApplyEditRights = -255;
        this.InitApplication = -254;
        this.isShowOpenDialog = false;

        this._state = {
            licenseType: false,
            isDocModified: false
        };

        this.defaultTitleText = __APP_TITLE_TEXT__;

        const { t } = this.props;
        this._t = t('Controller.Main', {returnObjects:true});
    }

    initSdk() {
        const on_load_scripts = () => {
            !window.sdk_scripts && (window.sdk_scripts = ['../../../../sdkjs/common/AllFonts.js',
                                                           '../../../../sdkjs/cell/sdk-all-min.js']);
            let dep_scripts = [
                '../../../vendor/jquery/jquery.min.js',
                '../../../vendor/bootstrap/dist/js/bootstrap.min.js',
                '../../../vendor/underscore/underscore-min.js',
                '../../../vendor/xregexp/xregexp-all-min.js',
                '../../../vendor/sockjs/sockjs.min.js',
                '../../../vendor/jszip/jszip.min.js',
                '../../../vendor/jszip-utils/jszip-utils.min.js'];
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
                const _t = this._t;

                EditorUIController.isSupportEditFeature();

                this.editorConfig = Object.assign({}, this.editorConfig, data.config);
                this.appOptions.lang            = this.editorConfig.lang;

                const appOptions = this.props.storeAppOptions;
                appOptions.setConfigOptions(this.editorConfig, _t);

                let value;
                if (appOptions.canRenameAnonymous) {
                    value = LocalStorage.getItem("guest-username");
                    //Common.Utils.InternalSettings.set("guest-username", value);
                    //Common.Utils.InternalSettings.set("save-guest-username", !!value);
                }

                value = LocalStorage.getItem("sse-settings-regional");
                if (value !== null) {
                    this.api.asc_setLocale(parseInt(value));
                } else {
                     value = appOptions.region;
                     value = Common.util.LanguageInfo.getLanguages().hasOwnProperty(value) ? value : Common.util.LanguageInfo.getLocalLanguageCode(value);
                     if (value !== null) {
                         value = parseInt(value);
                     } else {
                         value = (appOptions.lang) ? parseInt(Common.util.LanguageInfo.getLocalLanguageCode(appOptions.lang)) : 0x0409;
                     }
                     this.api.asc_setLocale(value);
                }

                if (appOptions.location == 'us' || appOptions.location == 'ca') {
                    Common.Utils.Metric.setDefaultMetric(Common.Utils.Metric.c_MetricUnits.inch);
                }

                //if (!appOptions.customization || !(appOptions.customization.loaderName || appOptions.customization.loaderLogo))
                    //$('#editor_sdk').append('<div class="doc-placeholder">' + '<div class="columns"></div>'.repeat(2) + '</div>');

                value = LocalStorage.getItem("sse-mobile-macros-mode");
                if (value === null) {
                     value = appOptions.customization ? appOptions.customization.macrosMode : 'warn';
                     value = (value === 'enable') ? 1 : (value === 'disable' ? 2 : 0);
                } else {
                    value = parseInt(value);
                }
                this.props.storeApplicationSettings.changeMacrosSettings(value);
            };

            const loadDocument = data => {
                this.permissions = {};
                this.document = data.doc;

                let docInfo = {};

                if ( data.doc ) {
                    this.permissions = Object.assign(this.permissions, data.doc.permissions);

                    let _permissions = Object.assign({}, data.doc.permissions),
                        _user = new Asc.asc_CUserInfo();
                    const _userOptions = this.props.storeAppOptions.user;
                      
                    _user.put_Id(_userOptions.id);
                    _user.put_FullName(_userOptions.fullname);
                    _user.put_IsAnonymousUser(_userOptions.anonymous);

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
                    docInfo.put_EncryptedInfo(this.editorConfig.encryptionKeys);

                    const appOptions = this.props.storeAppOptions;
                    let enable = !appOptions.customization || (appOptions.customization.macros !== false);
                    docInfo.asc_putIsEnabledMacroses(!!enable);
                    enable = !appOptions.customization || (appOptions.customization.plugins!==false);
                    docInfo.asc_putIsEnabledPlugins(!!enable);
                }

                this.api.asc_registerCallback('asc_onGetEditorPermissions', onEditorPermissions);
                this.api.asc_registerCallback('asc_onLicenseChanged',       this.onLicenseChanged.bind(this));
                this.api.asc_registerCallback('asc_onRunAutostartMacroses', this.onRunAutostartMacroses.bind(this));
                this.api.asc_setDocInfo(docInfo);
                this.api.asc_getEditorPermissions(this.editorConfig.licenseUrl, this.editorConfig.customerId);
                this.api.asc_enableKeyEvents(true);

                // Common.SharedSettings.set('document', data.doc);

                // Document Info

                const storeSpreadsheetInfo = this.props.storeSpreadsheetInfo;

                storeSpreadsheetInfo.setDataDoc(this.document);
            };

            const onEditorPermissions = params => {
                const licType = params.asc_getLicenseType();
                this.appOptions.canLicense = (licType === Asc.c_oLicenseResult.Success || licType === Asc.c_oLicenseResult.SuccessLimit);

                const appOptions = this.props.storeAppOptions;
                appOptions.setPermissionOptions(this.document, licType, params, this.permissions, EditorUIController.isSupportEditFeature());

                this.applyMode(appOptions);

                this.api.asc_LoadDocument();

                //if (!me.appOptions.isEdit) {
                    //me.hidePreloader();
                    //me.onLongActionBegin(Asc.c_oAscAsyncActionType.BlockInteraction, LoadingDocument);
                //}
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
                    const {t} = this.props;
                    const _t = t('Controller.Main.SDK', {returnObjects:true})
                    const styleNames = ['Normal', 'Neutral', 'Bad', 'Good', 'Input', 'Output', 'Calculation', 'Check Cell', 'Explanatory Text', 'Note', 'Linked Cell', 'Warning Text',
                            'Heading 1', 'Heading 2', 'Heading 3', 'Heading 4', 'Title', 'Total', 'Currency', 'Percent', 'Comma'];
                    const translate = {
                        'Series': _t.txtSeries,
                        'Diagram Title': _t.txtDiagramTitle,
                        'X Axis': _t.txtXAxis,
                        'Y Axis': _t.txtYAxis,
                        'Your text here': _t.txtArt,
                        'Table': _t.txtTable,
                        'Print_Area': _t.txtPrintArea,
                        'Confidential': _t.txtConfidential,
                        'Prepared by ': _t.txtPreparedBy + ' ',
                        'Page': _t.txtPage,
                        'Page %1 of %2': _t.txtPageOf,
                        'Pages': _t.txtPages,
                        'Date': _t.txtDate,
                        'Time': _t.txtTime,
                        'Tab': _t.txtTab,
                        'File': _t.txtFile,
                        'Column': _t.txtColumn,
                        'Row': _t.txtRow,
                        '%1 of %2': _t.txtByField,
                        '(All)': _t.txtAll,
                        'Values': _t.txtValues,
                        'Grand Total': _t.txtGrandTotal,
                        'Row Labels': _t.txtRowLbls,
                        'Column Labels': _t.txtColLbls,
                        'Multi-Select (Alt+S)': _t.txtMultiSelect,
                        'Clear Filter (Alt+C)':  _t.txtClearFilter,
                        '(blank)': _t.txtBlank,
                        'Group': _t.txtGroup,
                        'Seconds': _t.txtSeconds,
                        'Minutes': _t.txtMinutes,
                        'Hours': _t.txtHours,
                        'Days': _t.txtDays,
                        'Months': _t.txtMonths,
                        'Quarters': _t.txtQuarters,
                        'Years': _t.txtYears,
                        '%1 or %2': _t.txtOr,
                        'Qtr': _t.txtQuarter
                    };
                    styleNames.forEach(function(item){
                        translate[item] = _t['txtStyle_' + item.replace(/ /g, '_')] || item;
                    });
                    translate['Currency [0]'] = _t.txtStyle_Currency + ' [0]';
                    translate['Comma [0]'] = _t.txtStyle_Comma + ' [0]';

                    for (let i=1; i<7; i++) {
                        translate['Accent'+i] = _t.txtAccent + i;
                        translate['20% - Accent'+i] = '20% - ' + _t.txtAccent + i;
                        translate['40% - Accent'+i] = '40% - ' + _t.txtAccent + i;
                        translate['60% - Accent'+i] = '60% - ' + _t.txtAccent + i;
                    }
                    this.api = new Asc.spreadsheet_api({
                        'id-view': 'editor_sdk',
                        'id-input': 'idx-cell-content',
                        'mobile': true,
                        'translate': translate
                    });

                    Common.Notifications.trigger('engineCreated', this.api);
                    Common.EditorApi = {get: () => this.api};

                    this.appOptions = {};
                    this.bindEvents();

                    let value = LocalStorage.getItem("sse-settings-fontrender");
                    if (value === null) value = window.devicePixelRatio > 1 ? '1' : '3';
                    this.api.asc_setFontRenderingMode(parseInt(value));

                    Common.Utils.Metric.setCurrentMetric(Common.Utils.Metric.c_MetricUnits.pt); // TODO: beautify c_MetricUnits

                    Common.Gateway.on('init', loadConfig);
                    Common.Gateway.on('showmessage', this.onExternalMessage.bind(this));
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
            script.src = "../../../../sdkjs/develop/sdkjs/cell/scripts.js";
            script.async = true;
            script.onload = on_load_scripts;
            script.onerror = () => {
                console.log('error load scripts');
            };

            document.body.appendChild(script);
        } else {
            on_load_scripts();
        }
    }

    bindEvents() {
        $$(window).on('resize', () => {
            this.api.asc_Resize();
        });

        this.api.asc_registerCallback('asc_onDocumentUpdateVersion',      this.onUpdateVersion.bind(this));
        this.api.asc_registerCallback('asc_onServerVersion',              this.onServerVersion.bind(this));
        this.api.asc_registerCallback('asc_onPrintUrl',                   this.onPrintUrl.bind(this));
        this.api.asc_registerCallback('asc_onPrint',                      this.onPrint.bind(this));
        this.api.asc_registerCallback('asc_onDocumentName',               this.onDocumentName.bind(this));
        this.api.asc_registerCallback('asc_onEndAction',                  this._onLongActionEnd.bind(this));

        EditorUIController.initCellInfo && EditorUIController.initCellInfo(this.props);

        EditorUIController.initEditorStyles && EditorUIController.initEditorStyles(this.props.storeCellSettings);

        EditorUIController.initFonts && EditorUIController.initFonts(this.props);

        const styleSize = this.props.storeCellSettings.styleSize;
        this.api.asc_setThumbnailStylesSizes(styleSize.width, styleSize.height);

        // Spreadsheet Settings

        this.api.asc_registerCallback('asc_onSendThemeColorSchemes', schemes => {
            this.props.storeSpreadsheetSettings.addSchemes(schemes);
        });

        // Downloaded Advanced Options
        
        this.api.asc_registerCallback('asc_onAdvancedOptions', (type, advOptions, mode, formatOptions) => {
            const {t} = this.props;
            const _t = t("View.Settings", { returnObjects: true });
            onAdvancedOptions(type, advOptions, mode, formatOptions, _t, this._isDocReady, this.props.storeAppOptions.canRequestClose,this.isDRM);
            if(type == Asc.c_oAscAdvancedOptionsID.DRM) this.isDRM = true;
        });

        // Toolbar settings

        const storeToolbarSettings = this.props.storeToolbarSettings;
        this.api.asc_registerCallback('asc_onCanUndoChanged', (can) => {
            if (this.props.users.isDisconnected) return;
            storeToolbarSettings.setCanUndo(can);
        });
        this.api.asc_registerCallback('asc_onCanRedoChanged', (can) => {
            if (this.props.users.isDisconnected) return;
            storeToolbarSettings.setCanRedo(can);
        });

        const storeFocusObjects = this.props.storeFocusObjects;
        this.api.asc_registerCallback('asc_onEditCell', (state) => {
            if (state == Asc.c_oAscCellEditorState.editStart || state == Asc.c_oAscCellEditorState.editEnd) {
                const isEditCell = state === Asc.c_oAscCellEditorState.editStart;
                if (storeFocusObjects.isEditCell !== isEditCell) {
                    storeFocusObjects.setEditCell(isEditCell);
                }
            } else {
                const isFormula = state === Asc.c_oAscCellEditorState.editFormula;
                if (storeFocusObjects.editFormulaMode !== isFormula) {
                    storeFocusObjects.setEditFormulaMode(isFormula);
                }
            }
        });
    }

    _onLongActionEnd(type, id) {
        if ( type === Asc.c_oAscAsyncActionType.BlockInteraction && id == Asc.c_oAscAsyncAction.Open ) {
            Common.Gateway.internalMessage('documentReady', {});
            Common.Notifications.trigger('document:ready');
            this.onDocumentContentReady();
        }
    }

    onDocumentContentReady() {
        if (this._isDocReady)
            return;

        const appOptions = this.props.storeAppOptions;
        const appSettings = this.props.storeApplicationSettings;

        this._isDocReady = true;

        this.api.asc_showWorksheet(this.api.asc_getActiveWorksheetIndex());
        this.api.asc_Resize();

        Common.Notifications.trigger('preloader:close');
        Common.Notifications.trigger('preloader:endAction', Asc.c_oAscAsyncActionType['BlockInteraction'], this.LoadingDocument);

        let value = (appOptions.isEditMailMerge || appOptions.isEditDiagram) ? 100 : LocalStorage.getItem("sse-settings-zoom");
        var zf = (value !== null) ? parseInt(value)/100 : (appOptions.customization && appOptions.customization.zoom ? parseInt(appOptions.customization.zoom)/100 : 1);
        this.api.asc_setZoom(zf>0 ? zf : 1);

        this.updateWindowTitle(true);

        if (appOptions.isEdit) {
            if (this.needToUpdateVersion) {
                Common.Notifications.trigger('api:disconnect');
            }
        }

        if (appOptions.canAnalytics && false) {
            Common.component.Analytics.initialize('UA-12442749-13', 'Spreadsheet Editor');
        }

        Common.Gateway.on('processsaveresult',      this.onProcessSaveResult.bind(this));
        Common.Gateway.on('processrightschange',    this.onProcessRightsChange.bind(this));
        Common.Gateway.on('downloadas',             this.onDownloadAs.bind(this));
        Common.Gateway.on('requestclose',           this.onRequestClose.bind(this));

        Common.Gateway.sendInfo({
            mode: appOptions.isEdit ? 'edit' : 'view'
        });

        this.applyLicense();

        //R1C1 reference style
        value = LocalStorage.getBool('sse-settings-r1c1', false);
        appSettings.changeRefStyle(value);
        this.api.asc_setR1C1Mode(value);

        Common.Gateway.documentReady();
        f7.emit('resize');

        appOptions.changeDocReady(true);
    }

    applyMode (appOptions) {
        this.api.asc_enableKeyEvents(appOptions.isEdit);

        if (!appOptions.isEditMailMerge && !appOptions.isEditDiagram) {
            EditorUIController.initThemeColors && EditorUIController.initThemeColors();
            this.api.asc_registerCallback('asc_onDownloadUrl', this.onDownloadUrl.bind(this));
        }

        this.api.asc_setViewMode(!appOptions.isEdit && !appOptions.isRestrictedEdit);
        (appOptions.isRestrictedEdit && appOptions.canComments) && this.api.asc_setRestriction(Asc.c_oAscRestrictionType.OnlyComments);

        let value = LocalStorage.getItem('sse-mobile-settings-unit');
        value = (value !== null) ? parseInt(value) : (appOptions.customization && appOptions.customization.unit ? Common.Utils.Metric.c_MetricUnits[appOptions.customization.unit.toLocaleLowerCase()] : Common.Utils.Metric.getDefaultMetric());
        (value === undefined) && (value = Common.Utils.Metric.getDefaultMetric());
        Common.Utils.Metric.setCurrentMetric(value);

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

    onLicenseChanged (params) {
        const appOptions = this.props.storeAppOptions;
        if (appOptions.isEditDiagram || appOptions.isEditMailMerge) return;

        const licType = params.asc_getLicenseType();
        if (licType !== undefined && appOptions.canEdit && appOptions.config.mode !== 'view' &&
            (licType === Asc.c_oLicenseResult.Connections || licType === Asc.c_oLicenseResult.UsersCount || licType === Asc.c_oLicenseResult.ConnectionsOS || licType === Asc.c_oLicenseResult.UsersCountOS
                || licType === Asc.c_oLicenseResult.SuccessLimit && (appOptions.trialMode & Asc.c_oLicenseMode.Limited) !== 0))
            this._state.licenseType = licType;

        if (this._isDocReady && this._state.licenseType)
            this.applyLicense();
    }

    applyLicense () {
        const _t = this._t;
        const warnNoLicense  = _t.warnNoLicense.replace(/%1/g, __COMPANY_NAME__);
        const warnNoLicenseUsers = _t.warnNoLicenseUsers.replace(/%1/g, __COMPANY_NAME__);
        const textNoLicenseTitle = _t.textNoLicenseTitle.replace(/%1/g, __COMPANY_NAME__);
        const warnLicenseExceeded = _t.warnLicenseExceeded.replace(/%1/g, __COMPANY_NAME__);
        const warnLicenseUsersExceeded = _t.warnLicenseUsersExceeded.replace(/%1/g, __COMPANY_NAME__);

        const appOptions = this.props.storeAppOptions;
        if (appOptions.config.mode !== 'view' && !EditorUIController.isSupportEditFeature()) {
            let value = LocalStorage.getItem("sse-opensource-warning");
            value = (value !== null) ? parseInt(value) : 0;
            const now = (new Date).getTime();
            if (now - value > 86400000) {
                LocalStorage.setItem("sse-opensource-warning", now);
                f7.dialog.create({
                    title: _t.notcriticalErrorTitle,
                    text : _t.errorOpensource,
                    buttons: [{text: 'OK'}]
                }).open();
            }
            Common.Notifications.trigger('toolbar:activatecontrols');
            return;
        }

        if (this._state.licenseType) {
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

            let value = LocalStorage.getItem("sse-license-warning");
            value = (value !== null) ? parseInt(value) : 0;
            const now = (new Date).getTime();

            if (now - value > 86400000) {
                LocalStorage.setItem("sse-license-warning", now);
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
        const appOptions = this.props.storeAppOptions;
        const enable = !appOptions.customization || (appOptions.customization.macros !== false);
        if (enable) {
            const value = this.props.storeApplicationSettings.macrosMode;
            if (value === 1) {
                this.api.asc_runAutostartMacroses();
            } else if (value === 0) {
                const _t = this._t;
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
                                LocalStorage.setItem("sse-mobile-macros-mode", 1);
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
                                    LocalStorage.setItem("sse-mobile-macros-mode", 2);
                                }
                            }
                        }]
                }).open();
            }
        }
    }

    onDownloadUrl () {
        if (this._state.isFromGatewayDownloadAs) {
            Common.Gateway.downloadAs(url);
        }

        this._state.isFromGatewayDownloadAs = false;
    }

    onBeforeUnload () {
        const _t = this._t;

        LocalStorage.save();

        const config = this.props.storeAppOptions.config;
        const isEdit = this.permissions.edit !== false && config.mode !== 'view' && config.mode !== 'editdiagram';
        if (isEdit && this.api.asc_isDocumentModified()) {
            this.api.asc_stopSaving();
            this.continueSavingTimer = window.setTimeout(() => {
                this.api.asc_continueSaving();
            }, 500);

            return _t.leavePageText;
        }
    }

    onUnload () {
        if (this.continueSavingTimer)
            clearTimeout(this.continueSavingTimer);
    }

    onUpdateVersion (callback) {
        const _t = this._t;

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

    onServerVersion (buildVersion) {
        if (this.changeServerVersion) return true;
        const _t = this._t;

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

    onDocumentName (name) {
        this.updateWindowTitle(true);
    }

    updateWindowTitle (force) {
        const isModified = this.api.asc_isDocumentModified();
        if (this._state.isDocModified !== isModified || force) {
            const title = this.defaultTitleText;

            if (window.document.title !== title) {
                window.document.title = title;
            }

            this._isDocReady && (this._state.isDocModified !== isModified) && Common.Gateway.setDocumentModified(isModified);
            this._state.isDocModified = isModified;
        }
    }

    onDocumentModifiedChanged () {
        const isModified = this.api.asc_isDocumentCanSave();
        if (this._state.isDocModified !== isModified) {
            this._isDocReady && Common.Gateway.setDocumentModified(this.api.asc_isDocumentModified());
        }

        this.updateWindowTitle();
    }

    onDocumentCanSaveChanged (isCanSave) {
        //
    }

    onPrint () {
        if (!this.props.storeAppOptions.canPrint) return;

        if (this.api)
            this.api.asc_Print();
        Common.component.Analytics.trackEvent('Print');
    }

    onProcessSaveResult (data) {
        this.api.asc_OnSaveEnd(data.result);

        if (data && data.result === false) {
            const _t = this._t;
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
                const _t = this._t;
                f7.dialog.alert(
                    (!data.message) ? _t.warnProcessRightsChange : data.message,
                    _t.notcriticalErrorTitle,
                    () => { appOptions.changeEditingRights(false); }
                );
            }
        }
    }

    onDownloadAs () {
        if ( this.props.storeAppOptions.canDownload) {
            Common.Gateway.reportError(Asc.c_oAscError.ID.AccessDeny, this._t.errorAccessDeny);
            return;
        }
        this._state.isFromGatewayDownloadAs = true;
        this.api.asc_DownloadAs(new Asc.asc_CDownloadOptions(Asc.c_oAscFileType.XLSX, true));
    }

    onRequestClose () {
        Common.Gateway.requestClose();
    }

    render() {
        return (
            <Fragment>
                <LongActionsController />
                <ErrorController LoadingDocument={this.LoadingDocument}/>
                <StatusbarController />
                <CollaborationController />
                <CommentsController />
                <AddCommentController />
                <EditCommentController />
                <ViewCommentsController />
                <PluginsController />
            </Fragment>
        )
    }

    componentDidMount() {
        this.initSdk();
    }
}

const translated = withTranslation()(MainController);
export {translated as MainController};
