
import React, { Component } from 'react'
import { inject } from "mobx-react";
import { f7 } from 'framework7-react';
import { withTranslation } from 'react-i18next';
import CollaborationController from '../../../../common/mobile/lib/controller/Collaboration.jsx'

@inject("storeFocusObjects", "storeCellSettings")
class MainController extends Component {
    constructor(props) {
        super(props)
    }

    initSdk() {
        const script = document.createElement("script");
        script.src = "../../../../sdkjs/develop/sdkjs/cell/scripts.js";
        script.async = true;
        script.onload = () => {
            let dep_scripts = [
                '../../../vendor/jquery/jquery.min.js',
                '../../../vendor/jquery.browser/dist/jquery.browser.min.js',
                '../../../vendor/bootstrap/dist/js/bootstrap.js',
                '../../../vendor/underscore/underscore-min.js',
                '../../../vendor/xregexp/xregexp-all-min.js',
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
                let me = this;

                me.editorConfig = Object.assign({}, this.editorConfig, data.config);
                me.appOptions.user = Common.Utils.fillUserInfo(me.editorConfig.user, me.editorConfig.lang, "Local.User"/*me.textAnonymous*/);
/**/
                me.editorConfig.user          =
                me.appOptions.user            = Common.Utils.fillUserInfo(me.editorConfig.user, me.editorConfig.lang, me.textAnonymous);
                me.appOptions.lang            = me.editorConfig.lang;

                // var value = Common.localStorage.getItem("sse-settings-regional");
                // if (value!==null)
                //     this.api.asc_setLocale(parseInt(value));
                // else {
                //     value = me.appOptions.region;
                //     value = Common.util.LanguageInfo.getLanguages().hasOwnProperty(value) ? value : Common.util.LanguageInfo.getLocalLanguageCode(value);
                //     if (value!==null)
                //         value = parseInt(value);
                //     else
                //         value = (this.editorConfig.lang) ? parseInt(Common.util.LanguageInfo.getLocalLanguageCode(me.editorConfig.lang)) : 0x0409;
                //     this.api.asc_setLocale(value);
                // }

                // if (me.appOptions.location == 'us' || me.appOptions.location == 'ca')
                //     Common.Utils.Metric.setDefaultMetric(Common.Utils.Metric.c_MetricUnits.inch);
                //
                // if (!me.editorConfig.customization || !(me.editorConfig.customization.loaderName || me.editorConfig.customization.loaderLogo))
                //     $('#editor_sdk').append('<div class="doc-placeholder">' + '<div class="columns"></div>'.repeat(2) + '</div>');
                //
                // var value = Common.localStorage.getItem("sse-mobile-macros-mode");
                // if (value === null) {
                //     value = this.editorConfig.customization ? this.editorConfig.customization.macrosMode : 'warn';
                //     value = (value == 'enable') ? 1 : (value == 'disable' ? 2 : 0);
                // } else
                //     value = parseInt(value);
                // Common.Utils.InternalSettings.set("sse-mobile-macros-mode", value);

            };

            const loadDocument = data => {
                this.permissions = {};
                this.document = data.doc;

                let docInfo = {};

                if ( data.doc ) {
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

                    // SSE.getController('Toolbar').setDocumentTitle(data.doc.title);
                }

                this.api.asc_registerCallback('asc_onGetEditorPermissions', onEditorPermissions);
                // this.api.asc_registerCallback('asc_onLicenseChanged',       _.bind(this.onLicenseChanged, this));
                // this.api.asc_registerCallback('asc_onRunAutostartMacroses', _.bind(this.onRunAutostartMacroses, this));
                this.api.asc_setDocInfo(docInfo);
                this.api.asc_getEditorPermissions(this.editorConfig.licenseUrl, this.editorConfig.customerId);
                this.api.asc_enableKeyEvents(true);

                // Common.SharedSettings.set('document', data.doc);
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
                    this.api = new Asc.spreadsheet_api({
                        'id-view': 'editor_sdk',
                        'id-input': 'idx-cell-content',
                        'mobile': true
                        // 'translate': translate
                    });

                    this.appOptions = {};
                    this.bindEvents();

                    let value = null /*Common.localStorage.getItem("sse-settings-fontrender")*/;
                    if (value===null) value = window.devicePixelRatio > 1 ? '1' : '3';
                    this.api.asc_setFontRenderingMode(parseInt(value));

                    Common.Utils.Metric.setCurrentMetric(Common.Utils.Metric.c_MetricUnits.pt); // TODO: beautify c_MetricUnits

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
        me.api.asc_registerCallback('asc_onOpenDocumentProgress',       me._onOpenDocumentProgress.bind(me));
        // me.api.asc_registerCallback('asc_onAdvancedOptions',            _.bind(me.onAdvancedOptions, me));
        // me.api.asc_registerCallback('asc_onDocumentUpdateVersion',      _.bind(me.onUpdateVersion, me));
        // me.api.asc_registerCallback('asc_onServerVersion',              _.bind(me.onServerVersion, me));
        // me.api.asc_registerCallback('asc_onPrintUrl',                   _.bind(me.onPrintUrl, me));
        // me.api.asc_registerCallback('asc_onDocumentName',               _.bind(me.onDocumentName, me));
        me.api.asc_registerCallback('asc_onEndAction',                  me._onLongActionEnd.bind(me));

        const storeFocusObjects = this.props.storeFocusObjects;
        const storeCellSettings = this.props.storeCellSettings;
        const styleSize = storeCellSettings.styleSize;
       
        this.api.asc_registerCallback('asc_onSelectionChanged', cellInfo => {
            console.log(cellInfo);
            storeFocusObjects.resetCellInfo(cellInfo);
            storeCellSettings.initCellSettings(cellInfo);
            let selectedObjects = Common.EditorApi.get().asc_getGraphicObjectProps();

            if(selectedObjects.length) {
                storeFocusObjects.resetFocusObjects(selectedObjects);
            }

        });

        this.api.asc_setThumbnailStylesSizes(styleSize.width, styleSize.height);

        this.api.asc_registerCallback('asc_onInitEditorFonts', (fonts, select) => {
            storeCellSettings.initEditorFonts(fonts, select);
        });

        this.api.asc_registerCallback('asc_onEditorSelectionChanged', fontObj => {
            console.log(fontObj)
            storeCellSettings.initFontInfo(fontObj);
        });

        this.api.asc_registerCallback('asc_onInitEditorStyles', styles => {
            storeCellSettings.initCellStyles(styles);
        });

        this.api.asc_registerCallback('asc_onSendThemeColors', (colors, standart_colors) => {
            Common.Utils.ThemeColor.setColors(colors, standart_colors);
        });
    }

    _onLongActionEnd(type, id) {
        if ( type === Asc.c_oAscAsyncActionType.BlockInteraction && id == Asc.c_oAscAsyncAction.Open ) {
            Common.Gateway.internalMessage('documentReady', {});
            Common.Notifications.trigger('document:ready');
            this._onDocumentContentReady();
        }
    }

    _onDocumentContentReady() {
        const me = this;

        me.api.asc_Resize();

        let value = null /*(this.appOptions.isEditMailMerge || this.appOptions.isEditDiagram) ? 100 : Common.localStorage.getItem("sse-settings-zoom")*/;
        var zf = (value !== null) ? parseInt(value)/100 : (this.appOptions.customization && this.appOptions.customization.zoom ? parseInt(this.appOptions.customization.zoom)/100 : 1);
        this.api.asc_setZoom(zf>0 ? zf : 1);

        // this.api.asc_SetFastCollaborative(false);

        me.api.asc_enableKeyEvents(true);
        me.api.asc_getWorksheetsCount();
        me.api.asc_showWorksheet(me.api.asc_getActiveWorksheetIndex());

        Common.Gateway.documentReady();
        f7.emit('resize');
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
