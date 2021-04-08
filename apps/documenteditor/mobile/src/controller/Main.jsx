
import React, {Component, Fragment} from 'react';
import {inject} from "mobx-react";
import { f7 } from "framework7-react";
import { withTranslation } from 'react-i18next';
import { LocalStorage } from '../../../../common/mobile/utils/LocalStorage';
import IrregularStack from '../../../../common/mobile/utils/IrregularStack';
import CollaborationController from '../../../../common/mobile/lib/controller/collaboration/Collaboration.jsx';
import {InitReviewController as ReviewController} from '../../../../common/mobile/lib/controller/collaboration/Review.jsx';
import { onAdvancedOptions } from './settings/Download.jsx';
import {
    CommentsController,
    AddCommentController,
    EditCommentController,
    ViewCommentsController
} from "../../../../common/mobile/lib/controller/collaboration/Comments";
import About from '../../../../common/mobile/lib/view/About';
import EditorUIController from '../lib/patch';
import ErrorController from "./Error";

@inject(
    "storeAppOptions",
    "storeDocumentSettings",
    "storeFocusObjects",
    "storeTextSettings",
    "storeParagraphSettings",
    "storeTableSettings",
    "storeDocumentInfo",
    "storeChartSettings"
    )
class MainController extends Component {
    constructor(props) {
        super(props);
        window.editorType = 'de';

        this._state = {
            licenseType: false,
            isFromGatewayDownloadAs: false
        };

        this.stackLongActions = new IrregularStack({
            strongCompare   : function(obj1, obj2){return obj1.id === obj2.id && obj1.type === obj2.type;},
            weakCompare     : function(obj1, obj2){return obj1.type === obj2.type;}
        });

        const { t } = this.props;
        this._t = t('Main', {returnObjects:true});

        this.LoadingDocument = -256;
    }

    initSdk() {
        const script = document.createElement("script");
        script.src = "../../../../sdkjs/develop/sdkjs/word/scripts.js";
        script.async = true;
        script.onload = () => {
            let dep_scripts = ['../../../vendor/xregexp/xregexp-all-min.js',
                '../../../vendor/sockjs/sockjs.min.js',
                '../../../vendor/jszip/jszip.min.js',
                '../../../vendor/jszip-utils/jszip-utils.min.js'];
            dep_scripts.push(...sdk_scripts);

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
                EditorUIController.isSupportEditFeature();
                console.log('load config');

                this.editorConfig = Object.assign({}, this.editorConfig, data.config);

                this.props.storeAppOptions.setConfigOptions(this.editorConfig);

                this.editorConfig.lang && this.api.asc_setLocale(this.editorConfig.lang);

                Common.Notifications.trigger('configOptionsFill');
            };

            const loadDocument = data => {
                this.permissions = {};
                this.document = data.doc;

                let docInfo = {};

                if (data.doc) {
                    this.permissions = Object.assign(this.permissions, data.doc.permissions);

                    const _permissions = Object.assign({}, data.doc.permissions);
                    const _userOptions = this.props.storeAppOptions.user;
                    const _user = new Asc.asc_CUserInfo();
                    _user.put_Id(_userOptions.id);
                    _user.put_FullName(_userOptions.fullname);

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

                    // var enable = !this.editorConfig.customization || (this.editorConfig.customization.macros!==false);
                    // docInfo.asc_putIsEnabledMacroses(!!enable);
                    // enable = !this.editorConfig.customization || (this.editorConfig.customization.plugins!==false);
                    // docInfo.asc_putIsEnabledPlugins(!!enable);

                    // let type = /^(?:(pdf|djvu|xps))$/.exec(data.doc.fileType);
                    // if (type && typeof type[1] === 'string') {
                    //     this.permissions.edit = this.permissions.review = false;
                    // }
                }

                this.api.asc_registerCallback('asc_onGetEditorPermissions', onEditorPermissions);
                this.api.asc_registerCallback('asc_onDocumentContentReady', onDocumentContentReady);
                this.api.asc_registerCallback('asc_onLicenseChanged', this.onLicenseChanged.bind(this));
                // this.api.asc_registerCallback('asc_onRunAutostartMacroses', _.bind(this.onRunAutostartMacroses, this));
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

                // check licType
                if (Asc.c_oLicenseResult.Expired === licType ||
                    Asc.c_oLicenseResult.Error === licType ||
                    Asc.c_oLicenseResult.ExpiredTrial === licType) {
                    f7.dialog.create({
                        title   : this._t.titleLicenseExp,
                        text    : this._t.warnLicenseExp
                    }).open();
                    return;
                }
                if (Asc.c_oLicenseResult.ExpiredLimited === licType) {
                    this._state.licenseType = licType;
                }

                if ( this.onServerVersion(params.asc_getBuildVersion()) ) return;

                this.appOptions.canLicense = (licType === Asc.c_oLicenseResult.Success || licType === Asc.c_oLicenseResult.SuccessLimit);

                const storeAppOptions = this.props.storeAppOptions;

                storeAppOptions.setPermissionOptions(this.document, licType, params, this.permissions);

                this.applyMode(storeAppOptions);

                this.api.asc_LoadDocument();
                this.api.Resize();
            };

            const onDocumentContentReady = () => {
                this.applyLicense();

                Common.Gateway.documentReady();
                f7.emit('resize');

                Common.Notifications.trigger('document:ready');

                this._isDocReady = true;

                f7.dialog.close(this.loadMask.el);
                this.onLongActionEnd(Asc.c_oAscAsyncActionType['BlockInteraction'], this.LoadingDocument);

                Common.Gateway.on('processsaveresult', this.onProcessSaveResult.bind(this));
                Common.Gateway.on('processrightschange', this.onProcessRightsChange.bind(this));
                Common.Gateway.on('downloadas', this.onDownloadAs.bind(this));
                Common.Gateway.on('requestclose', this.onRequestClose.bind(this));
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
                    this.api = new Asc.asc_docs_api({
                        'id-view'  : 'editor_sdk',
                        'mobile'   : true,
                        'translate': t('Main.SDK', {returnObjects:true})
                    });

                    this.appOptions   = {};
                    this.bindEvents();

                    Common.Gateway.on('init',           loadConfig);
                    // Common.Gateway.on('showmessage',    _.bind(me.onExternalMessage, me));
                    Common.Gateway.on('opendocument',   loadDocument);
                    Common.Gateway.appReady();

                    Common.Notifications.trigger('engineCreated', this.api);
                    Common.EditorApi = {get: () => this.api};
                }, error => {
                    console.log('promise failed ' + error);
                });
        };

        script.onerror = () => {
            console.log('error');
        };

        document.body.appendChild(script);
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

        //me.api.asc_registerCallback('asc_onDocumentModifiedChanged', _.bind(me.onDocumentModifiedChanged, me));
        //me.api.asc_registerCallback('asc_onDocumentCanSaveChanged',  _.bind(me.onDocumentCanSaveChanged, me));

        //if (me.stackLongActions.exist({id: ApplyEditRights, type: Asc.c_oAscAsyncActionType['BlockInteraction']})) {
        //    me.onLongActionEnd(Asc.c_oAscAsyncActionType['BlockInteraction'], ApplyEditRights);
        //} else if (!this._isDocReady) {
        //    me.hidePreloader();
        //    me.onLongActionBegin(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);
        //}

        // Message on window close
        window.onbeforeunload = this.onBeforeUnload.bind(this);
        window.onunload = this.onUnload.bind(this);
    }

    onBeforeUnload () {
        LocalStorage.save();

        if (this.api.isDocumentModified()) {
            this.api.asc_stopSaving();
            this.continueSavingTimer = window.setTimeout(() => {
                this.api.asc_continueSaving();
            }, 500);

            return this._t.leavePageText;
        }
    }

    onUnload () {
        if (this.continueSavingTimer)
            clearTimeout(this.continueSavingTimer);
    }

    onLicenseChanged (params) {
        const appOptions = this.props.storeAppOptions;
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
                license = (license===Asc.c_oLicenseResult.Connections) ? _t.warnLicenseExceeded : _t.warnLicenseUsersExceeded;
            } else {
                license = (license === Asc.c_oLicenseResult.ConnectionsOS) ? _t.warnNoLicense : _t.warnNoLicenseUsers;
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
                    title: _t.textNoLicenseTitle,
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
        const _t = this._t;

        if (About.appVersion() !== buildVersion && !window.compareVersions) {
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
        this.api.asc_registerCallback('asc_onStartAction', this.onLongActionBegin.bind(this));
        this.api.asc_registerCallback('asc_onEndAction', this.onLongActionEnd.bind(this));
        this.api.asc_registerCallback('asc_onOpenDocumentProgress', this.onOpenDocument.bind(this));

        this.api.asc_registerCallback('asc_onSendThemeColors', (colors, standart_colors) => {
            Common.Utils.ThemeColor.setColors(colors, standart_colors);
        });

        this.api.asc_registerCallback('asc_onDownloadUrl', this.onDownloadUrl.bind(this));

        const storeDocumentSettings = this.props.storeDocumentSettings;
        this.api.asc_registerCallback('asc_onPageOrient', isPortrait => {
            storeDocumentSettings.resetPortrait(isPortrait);
        });
        this.api.asc_registerCallback('asc_onDocSize', (w, h) => {
            storeDocumentSettings.changeDocSize(w, h);
        });
        const storeFocusObjects = this.props.storeFocusObjects;
        this.api.asc_registerCallback('asc_onFocusObject', objects => {
            storeFocusObjects.resetFocusObjects(objects);
        });

        //text settings
        const storeTextSettings = this.props.storeTextSettings;
        this.api.asc_registerCallback('asc_onInitEditorFonts', (fonts, select) => {
            storeTextSettings.initEditorFonts(fonts, select);
        });
        this.api.asc_registerCallback('asc_onFontFamily', (font) => {
            storeTextSettings.resetFontName(font);
        });
        this.api.asc_registerCallback('asc_onFontSize', (size) => {
            storeTextSettings.resetFontSize(size);
        });
        this.api.asc_registerCallback('asc_onBold', (isBold) => {
            storeTextSettings.resetIsBold(isBold);
        });
        this.api.asc_registerCallback('asc_onItalic', (isItalic) => {
            storeTextSettings.resetIsItalic(isItalic);
        });
        this.api.asc_registerCallback('asc_onUnderline', (isUnderline) => {
            storeTextSettings.resetIsUnderline(isUnderline);
        });
        this.api.asc_registerCallback('asc_onStrikeout', (isStrikeout) => {
            storeTextSettings.resetIsStrikeout(isStrikeout);
        });
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
                    break;
                case 1:
                    storeTextSettings.resetNumbers(subtype);
                    break;
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
        this.api.asc_registerCallback('asc_onTextShd', (shd) => {
            let color = shd.get_Color();
            storeTextSettings.resetBackgroundColor(color);
        });

        //paragraph settings
        this.api.asc_setParagraphStylesSizes(330, 38);
        const storeParagraphSettings = this.props.storeParagraphSettings;
        this.api.asc_registerCallback('asc_onInitEditorStyles', (styles) => {
            storeParagraphSettings.initEditorStyles(styles);
        });
        this.api.asc_registerCallback('asc_onParaStyleName', (name) => {
            storeParagraphSettings.changeParaStyleName(name);
        });

        //table settings
        const storeTableSettings = this.props.storeTableSettings;
        this.api.asc_registerCallback('asc_onInitTableTemplates', (templates) => {
            storeTableSettings.initTableTemplates(templates);
        });

        //chart settings
        const storeChartSettings = this.props.storeChartSettings;
        this.api.asc_registerCallback('asc_onUpdateChartStyles', () => {
            if (storeFocusObjects.chartObject && storeFocusObjects.chartObject.get_ChartProperties()) {
                storeChartSettings.updateChartStyles(this.api.asc_getChartPreviews(storeFocusObjects.chartObject.get_ChartProperties().getType()));
            }
        });

        // Document Info

        const storeDocumentInfo = this.props.storeDocumentInfo;

        this.api.asc_registerCallback("asc_onGetDocInfoStart", () => {
            storeDocumentInfo.switchIsLoaded(false);
        });

        this.api.asc_registerCallback("asc_onGetDocInfoStop", () => {
            storeDocumentInfo.switchIsLoaded(true);
        });

        this.api.asc_registerCallback("asc_onDocInfo", (obj) => {
            storeDocumentInfo.changeCount(obj);
        });

        this.api.asc_registerCallback('asc_onGetDocInfoEnd', () => {
          storeDocumentInfo.switchIsLoaded(true);
        });

        this.api.asc_registerCallback('asc_onDocumentName', (name) => {
            // console.log(name);
        });

        // Color Schemes

        this.api.asc_registerCallback('asc_onSendThemeColorSchemes', (arr) => {
            storeDocumentSettings.addSchemes(arr);
        });

        // Downloaded Advanced Options
        this.api.asc_registerCallback('asc_onAdvancedOptions', (type, advOptions, mode, formatOptions) => {
            const {t} = this.props;
            const _t = t("Settings", { returnObjects: true });
            onAdvancedOptions(type, advOptions, mode, formatOptions, _t, this.props.storeAppOptions.canRequestClose);
        });
    }

    onLongActionBegin (type, id) {
        const action = {id: id, type: type};
        this.stackLongActions.push(action);
        this.setLongActionView(action);
    }

    onLongActionEnd (type, id) {
        let action = {id: id, type: type};
        this.stackLongActions.pop(action);

        //this.updateWindowTitle(true);

        action = this.stackLongActions.get({type: Asc.c_oAscAsyncActionType.Information});

        if (action) {
            this.setLongActionView(action)
        }

        action = this.stackLongActions.get({type: Asc.c_oAscAsyncActionType.BlockInteraction});

        if (action) {
            this.setLongActionView(action)
        } else {
            this.loadMask.el && this.loadMask.el.classList.contains('modal-in') && f7.dialog.close(this.loadMask.el);
        }
    }

    setLongActionView (action) {
        const _t = this._t;
        let title = '';
        let text = '';
        switch (action.id) {
            case Asc.c_oAscAsyncAction['Open']:
                title   = _t.openTitleText;
                text    = _t.openTextText;
                break;

            case Asc.c_oAscAsyncAction['Save']:
                title   = _t.saveTitleText;
                text    = _t.saveTextText;
                break;

            case Asc.c_oAscAsyncAction['LoadDocumentFonts']:
                title   = _t.loadFontsTitleText;
                text    = _t.loadFontsTextText;
                break;

            case Asc.c_oAscAsyncAction['LoadDocumentImages']:
                title   = _t.loadImagesTitleText;
                text    = _t.loadImagesTextText;
                break;

            case Asc.c_oAscAsyncAction['LoadFont']:
                title   = _t.loadFontTitleText;
                text    = _t.loadFontTextText;
                break;

            case Asc.c_oAscAsyncAction['LoadImage']:
                title   = _t.loadImageTitleText;
                text    = _t.loadImageTextText;
                break;

            case Asc.c_oAscAsyncAction['DownloadAs']:
                title   = _t.downloadTitleText;
                text    = _t.downloadTextText;
                break;

            case Asc.c_oAscAsyncAction['Print']:
                title   = _t.printTitleText;
                text    = _t.printTextText;
                break;

            case Asc.c_oAscAsyncAction['UploadImage']:
                title   = _t.uploadImageTitleText;
                text    = _t.uploadImageTextText;
                break;

            case Asc.c_oAscAsyncAction['ApplyChanges']:
                title   = _t.applyChangesTitleText;
                text    = _t.applyChangesTextText;
                break;

            case Asc.c_oAscAsyncAction['PrepareToSave']:
                title   = _t.savePreparingText;
                text    = _t.savePreparingTitle;
                break;

            case Asc.c_oAscAsyncAction['MailMergeLoadFile']:
                title   = _t.mailMergeLoadFileText;
                text    = _t.mailMergeLoadFileTitle;
                break;

            case Asc.c_oAscAsyncAction['DownloadMerge']:
                title   = _t.downloadMergeTitle;
                text    = _t.downloadMergeText;
                break;

            case Asc.c_oAscAsyncAction['SendMailMerge']:
                title   = _t.sendMergeTitle;
                text    = _t.sendMergeText;
                break;

            case Asc.c_oAscAsyncAction['Waiting']:
                title   = _t.waitText;
                text    = _t.waitText;
                break;

            case ApplyEditRights:
                title   = _t.txtEditingMode;
                text    = _t.txtEditingMode;
                break;

            case LoadingDocument:
                title   = _t.loadingDocumentTitleText;
                text    = _t.loadingDocumentTextText;
                break;
            default:
                if (typeof action.id == 'string'){
                    title   = action.id;
                    text    = action.id;
                }
                break;
        }

        if (action.type === Asc.c_oAscAsyncActionType['BlockInteraction']) {
            if (action.id === Asc.c_oAscAsyncAction['ApplyChanges']) {
                return;
            }

            if (this.loadMask && this.loadMask.el && this.loadMask.el.classList.contains('modal-in')) {
                this.loadMask.el.getElementsByClassName('dialog-title')[0].innerHTML = title;
            } else {
                this.loadMask = f7.dialog.preloader(title);
            }
        }

    }

    onOpenDocument (progress) {
        if (this.loadMask && this.loadMask.el) {
            const $title = this.loadMask.el.getElementsByClassName('dialog-title')[0];
            const proc = (progress.asc_getCurrentFont() + progress.asc_getCurrentImage())/(progress.asc_getFontsCount() + progress.asc_getImagesCount());

            $title.innerHTML = `${this._t.textLoadingDocument}: ${Math.min(Math.round(proc * 100), 100)}%`;
        }
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
        const appOptions = this.props.storeAppOptions;
        if ( !appOptions.canDownload && !appOptions.canDownloadOrigin) {
            Common.Gateway.reportError(Asc.c_oAscError.ID.AccessDeny, this._t.errorAccessDeny);
            return;
        }

        this._state.isFromGatewayDownloadAs = true;
        const type = /^(?:(pdf|djvu|xps))$/.exec(this.document.fileType);

        if (type && typeof type[1] === 'string') {
            this.api.asc_DownloadOrigin(true);
        } else {
            this.api.asc_DownloadAs(new Asc.asc_CDownloadOptions(Asc.c_oAscFileType.DOCX, true));
        }
    }

    onDownloadUrl () {
        if (this._state.isFromGatewayDownloadAs) {
            Common.Gateway.downloadAs(url);
        }

        this._state.isFromGatewayDownloadAs = false;
    }

    onRequestClose () {
        Common.Gateway.requestClose();
    }

    render() {
        return (
            <Fragment>
                <ErrorController />
                <CollaborationController />
                <ReviewController />
                <CommentsController />
                <AddCommentController />
                <EditCommentController />
                <ViewCommentsController />
            </Fragment>
            )
    }

    componentDidMount() {
        this.initSdk();
    }
}

const translated = withTranslation()(MainController);
export {translated as MainController};
