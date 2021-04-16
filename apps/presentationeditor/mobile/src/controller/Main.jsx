
import React, { Component, Fragment } from 'react'
import { inject } from "mobx-react";
import { f7 } from "framework7-react";
import { withTranslation } from 'react-i18next';
import CollaborationController from '../../../../common/mobile/lib/controller/collaboration/Collaboration.jsx';
import EditorUIController from '../lib/patch';
import {
    CommentsController,
    AddCommentController,
    EditCommentController,
    ViewCommentsController
} from "../../../../common/mobile/lib/controller/collaboration/Comments";

@inject("storeFocusObjects", "storeAppOptions", "storePresentationInfo", "storePresentationSettings", "storeSlideSettings", "storeTextSettings", "storeTableSettings", "storeChartSettings", "storeLinkSettings")
class MainController extends Component {
    constructor(props) {
        super(props)
        window.editorType = 'pe';
    }

    initSdk() {
        const script = document.createElement("script");
        script.src = "../../../../sdkjs/develop/sdkjs/slide/scripts.js";
        script.async = true;
        script.onload = () => {
            let dep_scripts = [
                '../../../vendor/xregexp/xregexp-all-min.js',
                '../../../vendor/sockjs/sockjs.min.js'];
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
                // console.log(this.editorConfig);
            };

            const loadDocument = data => {
                this.permissions = {};
                this.document = data.doc;

                let docInfo = {};

                if (data.doc) {
                    this.permissions = Object.assign(this.permissions, data.doc.permissions);

                    const _permissions = Object.assign({}, data.doc.permissions);
                    const _user = new Asc.asc_CUserInfo();
                    const _userOptions = this.props.storeAppOptions.user;
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
                }

                this.api.asc_registerCallback('asc_onGetEditorPermissions', onEditorPermissions);
                // this.api.asc_registerCallback('asc_onLicenseChanged',       _.bind(this.onLicenseChanged, this));
                // this.api.asc_registerCallback('asc_onRunAutostartMacroses', _.bind(this.onRunAutostartMacroses, this));
                this.api.asc_setDocInfo(docInfo);
                this.api.asc_getEditorPermissions(this.editorConfig.licenseUrl, this.editorConfig.customerId);

                // Presentation Info

                const storePresentationInfo = this.props.storePresentationInfo;

                storePresentationInfo.setDataDoc(this.document);

                // Common.SharedSettings.set('document', data.doc);

                if (data.doc) {
                    Common.Notifications.trigger('setdoctitle', data.doc.title);
                }
            };

            const onEditorPermissions = params => {
                let me = this;
                const licType = params.asc_getLicenseType();

                me.appOptions.canLicense      = (licType === Asc.c_oLicenseResult.Success || licType === Asc.c_oLicenseResult.SuccessLimit);

                this.props.storeAppOptions.setPermissionOptions(this.document, licType, params, this.permissions);

                // me.api.asc_setViewMode(!me.appOptions.isEdit);
                me.api.asc_setViewMode(false);
                me.api.asc_LoadDocument();
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
                    this.api = new Asc.asc_docs_api({
                        'id-view': 'editor_sdk',
                        'mobile': true,
                        'translate': t('Controller.Main.SDK', {returnObjects:true})
                    });

                    Common.EditorApi = {get: () => this.api};

                    this.appOptions   = {};
                    this.bindEvents();

                    let value = null /*Common.localStorage.getItem("pe-settings-fontrender")*/;
                    if (value===null) value = window.devicePixelRatio > 1 ? '1' : '3';
                    this.api.SetFontRenderingMode(parseInt(value));
                    this.api.SetDrawingFreeze(true);
                    this.api.SetThemesPath("../../../../sdkjs/slide/themes/");
                    // Common.Utils.Metric.setCurrentMetric(1); //pt

                    Common.Gateway.on('init',           loadConfig);
                    // Common.Gateway.on('showmessage',    _.bind(me.onExternalMessage, me));
                    Common.Gateway.on('opendocument',   loadDocument);
                    Common.Gateway.appReady();

                    Common.Notifications.trigger('engineCreated', this.api);
                }, error => {
                    console.log('promise failed ' + error);
                });
        };

        script.onerror = () => {
            console.log('error');
        };

        document.body.appendChild(script);
    }

    bindEvents() {
       
        // me.api.asc_registerCallback('asc_onError',                      _.bind(me.onError, me));
        this.api.asc_registerCallback('asc_onDocumentContentReady', this._onDocumentContentReady.bind(this));
        this.api.asc_registerCallback('asc_onOpenDocumentProgress', this._onOpenDocumentProgress.bind(this));

        const storePresentationSettings = this.props.storePresentationSettings;

        this.api.asc_registerCallback('asc_onPresentationSize', (width, height) => {
            storePresentationSettings.changeSizeIndex(width, height);
        });

        this.api.asc_registerCallback('asc_onSendThemeColorSchemes', (arr) => {
            storePresentationSettings.addSchemes(arr);
        });

        EditorUIController.initFocusObjects(this.props.storeFocusObjects);

        EditorUIController.initEditorStyles(this.props.storeSlideSettings);

        // Text settings 

        const storeTextSettings = this.props.storeTextSettings;

        EditorUIController.initFonts(storeTextSettings);

        this.api.asc_registerCallback('asc_onVerticalAlign', (typeBaseline) => {
            storeTextSettings.resetTypeBaseline(typeBaseline);
        });

        this.api.asc_registerCallback('asc_onListType', (data) => {
            let type = data.get_ListType();
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
            }
        });

        this.api.asc_registerCallback('asc_onPrAlign', (align) => {
            storeTextSettings.resetParagraphAlign(align);
        });

        this.api.asc_registerCallback('asc_onVerticalTextAlign', valign => {
            storeTextSettings.resetParagraphValign(valign);
        });

        this.api.asc_registerCallback('asc_canIncreaseIndent', value => {
            storeTextSettings.resetIncreaseIndent(value);
        });

        this.api.asc_registerCallback('asc_canDecreaseIndent', value => {
            storeTextSettings.resetDecreaseIndent(value);
        });

        this.api.asc_registerCallback('asc_onTextColor', (color) => {
            storeTextSettings.resetTextColor(color);
        });

        this.api.asc_registerCallback('asc_onParaSpacingLine', (vc) => {
            storeTextSettings.resetLineSpacing(vc);
        });

        //link settings
        const storeLinkSettings = this.props.storeLinkSettings;
        this.api.asc_registerCallback('asc_onCanAddHyperlink', (value) => {
            storeLinkSettings.canAddHyperlink(value);
        });

        // Table settings

        EditorUIController.initTableTemplates(this.props.storeTableSettings);

        // Chart settings

        const storeChartSettings = this.props.storeChartSettings;

        this.api.asc_registerCallback('asc_onUpdateChartStyles', () => {
            if (storeFocusObjects.chartObject) {
                storeChartSettings.updateChartStyles(this.api.asc_getChartPreviews(storeFocusObjects.chartObject.getType()));
            }
        });
    }

    _onDocumentContentReady() {
        this.api.SetDrawingFreeze(false);

        this.api.Resize();
        this.api.zoomFitToPage();
        // me.api.asc_GetDefaultTableStyles && _.defer(function () {me.api.asc_GetDefaultTableStyles()});

        this.applyLicense();

        Common.Gateway.documentReady();
        f7.emit('resize');

        Common.Notifications.trigger('document:ready');
    }

    _onOpenDocumentProgress(progress) {
        // if (this.loadMask) {
        //     var $title = $$(this.loadMask).find('.modal-title'),
        //         const proc = (progress.asc_getCurrentFont() + progress.asc_getCurrentImage())/(progress.asc_getFontsCount() + progress.asc_getImagesCount());

            // $title.text(this.textLoadingDocument + ': ' + Math.min(Math.round(proc * 100), 100) + '%');
        // }
    }

    applyLicense() {
        /* TO DO */
        Common.Notifications.trigger('toolbar:activatecontrols');
    }

    render() {
        return (
            <Fragment>
                <CollaborationController />
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
