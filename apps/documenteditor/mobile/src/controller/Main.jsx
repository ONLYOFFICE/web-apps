
import React, {Component} from 'react'
import {inject} from "mobx-react";
import CollaborationController from '../../../../common/mobile/lib/controller/Collaboration.jsx'

@inject("storeDocumentSettings", "storeFocusObjects", "storeTextSettings", "storeParagraphSettings", "storeTableSettings", "storeDocumentInfo")
class MainController extends Component {
    constructor(props) {
        super(props)
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

                    // let type = /^(?:(pdf|djvu|xps))$/.exec(data.doc.fileType);
                    // if (type && typeof type[1] === 'string') {
                    //     this.permissions.edit = this.permissions.review = false;
                    // }
                }

                this.api.asc_registerCallback('asc_onGetEditorPermissions', onEditorPermissions);
                // this.api.asc_registerCallback('asc_onLicenseChanged',       _.bind(this.onLicenseChanged, this));
                // this.api.asc_registerCallback('asc_onRunAutostartMacroses', _.bind(this.onRunAutostartMacroses, this));
                this.api.asc_setDocInfo(docInfo);
                this.api.asc_getEditorPermissions(this.editorConfig.licenseUrl, this.editorConfig.customerId);

                // Document Info

                const storeDocumentInfo = this.props.storeDocumentInfo;

                storeDocumentInfo.setDataDoc(data.doc);

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
                me.api.Resize();
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
                    this.api = new Asc.asc_docs_api({
                        'id-view'  : 'editor_sdk',
                        'mobile'   : true,
                        // 'translate': translate
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

    bindEvents() {
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

        // Document Info

        const storeDocumentInfo = this.props.storeDocumentInfo;

        this.api.asc_registerCallback("asc_onGetDocInfoStart", () => {
          console.log("Start");
          storeDocumentInfo.switchIsLoaded(false);
        });

        this.api.asc_registerCallback("asc_onGetDocInfoStop", () => {
          console.log("End");
          storeDocumentInfo.switchIsLoaded(true);
        });

        this.api.asc_registerCallback("asc_onDocInfo", (obj) => {
          storeDocumentInfo.changeCount(obj);
        });

        // me.api.asc_registerCallback('asc_onGetDocInfoEnd',      _.bind(me.onApiGetDocInfoEnd, me));
        // me.api.asc_registerCallback('asc_onDocumentName',       _.bind(me.onApiDocumentName, me));

    }

    render() {
        return <CollaborationController />
    }
}

export default MainController;
