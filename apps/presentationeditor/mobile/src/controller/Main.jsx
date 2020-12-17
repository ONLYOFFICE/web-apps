
import React, { Component } from 'react'
import { inject } from "mobx-react";
import { withTranslation } from 'react-i18next';
import CollaborationController from '../../../../common/mobile/lib/controller/Collaboration.jsx'

@inject("storePresentationSettings")
class MainController extends Component {
    constructor(props) {
        super(props)
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
                let me = this;
                console.log('load config');

                me.editorConfig = Object.assign({}, this.editorConfig, data.config);
                me.appOptions.user = Common.Utils.fillUserInfo(me.editorConfig.user, me.editorConfig.lang, "Local.User"/*me.textAnonymous*/);
            };

            const loadDocument = data => {
                this.permissions = {};
                this.document = data.doc;

                let docInfo = {};

                if (data.doc) {
                    this.permissions = Object.assign(this.permissions, data.doc.permissions);

                    let _permissions = Object.assign({}, data.doc.permissions),
                        _user = new Asc.asc_CUserInfo();
                    _user.put_Id(this.appOptions.user.id);
                    _user.put_FullName(this.appOptions.user.fullname);

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

                // Common.SharedSettings.set('document', data.doc);

                // if (data.doc) {
                //     DE.getController('Toolbar').setDocumentTitle(data.doc.title);
                //     if (data.doc.info) {
                //         data.doc.info.author && console.log("Obsolete: The 'author' parameter of the document 'info' section is deprecated. Please use 'owner' instead.");
                //         data.doc.info.created && console.log("Obsolete: The 'created' parameter of the document 'info' section is deprecated. Please use 'uploaded' instead.");
                //     }
                // }
            };

            const onEditorPermissions = params => {
                let me = this;
                const licType = params.asc_getLicenseType();

                me.appOptions.canLicense      = (licType === Asc.c_oLicenseResult.Success || licType === Asc.c_oLicenseResult.SuccessLimit);
                // me.appOptions.canEdit         = (me.permissions.edit !== false || me.permissions.review === true) && // can edit or review
                //     (me.editorConfig.canRequestEditRights || me.editorConfig.mode !== 'view') && // if mode=="view" -> canRequestEditRights must be defined
                //     (!me.appOptions.isReviewOnly || me.appOptions.canLicense) && // if isReviewOnly==true -> canLicense must be true
                //     me.isSupportEditFeature();
                // me.appOptions.isEdit          = me.appOptions.canLicense && me.appOptions.canEdit && me.editorConfig.mode !== 'view';

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

    bindEvents() {
        const me = this;
       
        // me.api.asc_registerCallback('asc_onError',                      _.bind(me.onError, me));
        me.api.asc_registerCallback('asc_onDocumentContentReady',       me._onDocumentContentReady.bind(me));
        me.api.asc_registerCallback('asc_onOpenDocumentProgress',       me._onOpenDocumentProgress.bind(me));

        const storePresentationSettings = this.props.storePresentationSettings;

        me.api.asc_registerCallback('asc_onPresentationSize', (width, height) => {
            storePresentationSettings.changeSizeIndex(width, height);
        });

        me.api.asc_registerCallback('asc_onSendThemeColorSchemes', (arr) => {
            storePresentationSettings.addSchemes(arr);
        });

        // api.asc_registerCallback('asc_onSendThemeColorSchemes', _.bind(this.onSendThemeColorSchemes, this));
        // me.api.asc_registerCallback('asc_onDocumentUpdateVersion',      _.bind(me.onUpdateVersion, me));
        // me.api.asc_registerCallback('asc_onServerVersion',              _.bind(me.onServerVersion, me));
        // me.api.asc_registerCallback('asc_onAdvancedOptions',            _.bind(me.onAdvancedOptions, me));
        // me.api.asc_registerCallback('asc_onDocumentName',               _.bind(me.onDocumentName, me));
        // me.api.asc_registerCallback('asc_onPrintUrl',                   _.bind(me.onPrintUrl, me));
        // me.api.asc_registerCallback('asc_onThumbnailsShow',             _.bind(me.onThumbnailsShow, me));
        // me.api.asc_registerCallback('asc_onMeta',                       _.bind(me.onMeta, me));
    }

    _onDocumentContentReady() {
        const me = this;
        me.api.SetDrawingFreeze(false);

        me.api.Resize();
        me.api.zoomFitToPage();
        // me.api.asc_GetDefaultTableStyles && _.defer(function () {me.api.asc_GetDefaultTableStyles()});

        Common.Gateway.documentReady();
    }

    _onOpenDocumentProgress(progress) {
        // if (this.loadMask) {
        //     var $title = $$(this.loadMask).find('.modal-title'),
        //         const proc = (progress.asc_getCurrentFont() + progress.asc_getCurrentImage())/(progress.asc_getFontsCount() + progress.asc_getImagesCount());

            // $title.text(this.textLoadingDocument + ': ' + Math.min(Math.round(proc * 100), 100) + '%');
        // }
    }

    render() {
        return <CollaborationController />
    }

    componentDidMount() {
        this.initSdk();
    }
}

const translated = withTranslation()(MainController);
export {translated as MainController};
