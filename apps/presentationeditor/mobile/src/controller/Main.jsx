
import React, { Component } from 'react'
import { inject } from "mobx-react";
import { f7 } from "framework7-react";
import { withTranslation } from 'react-i18next';
import CollaborationController from '../../../../common/mobile/lib/controller/collaboration/Collaboration.jsx'

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

        const storeFocusObjects = this.props.storeFocusObjects;
        const storeSlideSettings = this.props.storeSlideSettings;
        
        this.api.asc_registerCallback('asc_onFocusObject', objects => {
            // console.log(objects);
            storeFocusObjects.resetFocusObjects(objects);
        });

        this.api.asc_registerCallback('asc_onInitEditorStyles', themes => {
            // console.log(themes);
            storeSlideSettings.addArrayThemes(themes);
        });

        this.api.asc_registerCallback('asc_onUpdateThemeIndex',  themeId => {
            // console.log(themeId);
            storeSlideSettings.changeSlideThemeIndex(themeId);
        });

        this.api.asc_registerCallback('asc_onUpdateLayout', layouts => {
            // console.log(layouts);
            storeSlideSettings.addArrayLayouts(layouts);
        });

        this.api.asc_registerCallback('asc_onSendThemeColors', (colors, standart_colors) => {
            Common.Utils.ThemeColor.setColors(colors, standart_colors);
        });

        // Text settings 

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
            let type = data.get_ListType();
            let subtype = data.get_ListSubType();

            storeTextSettings.resetListType(type);

            switch (type) {
                case 0:
                    storeTextSettings.resetBullets(subtype);
                    break;
                case 1:
                    storeTextSettings.resetNumbers(subtype);
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

        const storeTableSettings = this.props.storeTableSettings;
        
        this.api.asc_registerCallback('asc_onInitTableTemplates', (templates) => {
            storeTableSettings.initTableTemplates(templates);
        });

        // Chart settings

        const storeChartSettings = this.props.storeChartSettings;

        this.api.asc_registerCallback('asc_onUpdateChartStyles', () => {
            if (storeFocusObjects.chartObject) {
                storeChartSettings.updateChartStyles(this.api.asc_getChartPreviews(storeFocusObjects.chartObject.getType()));
            }
        });
    }

    _onDocumentContentReady() {
        const me = this;
        me.api.SetDrawingFreeze(false);

        me.api.Resize();
        me.api.zoomFitToPage();
        // me.api.asc_GetDefaultTableStyles && _.defer(function () {me.api.asc_GetDefaultTableStyles()});

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
