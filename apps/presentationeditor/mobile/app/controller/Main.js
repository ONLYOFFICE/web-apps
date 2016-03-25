Ext.define('PE.controller.Main', {
    extend: 'Ext.app.Controller',
    editMode: false,

    requires: [
        'Ext.Anim',
        'Ext.LoadMask',
        'Ext.MessageBox'
    ],

    launch: function() {
        if (!this._isSupport()){
            Common.Gateway.reportError(undefined, this.unsupportedBrowserErrorText);
            return;
        }

        // Initialize descendants

        this.initControl();

        // Initialize analytics

//        Common.component.Analytics.initialize('UA-12442749-13', 'Presentation Editor Mobile');

        // Initialize api

        var api = this.api,
            app = this.getApplication(),
            profile = app.getCurrentProfile();

        api = new asc_docs_api("id-sdkeditor");
        api.SetMobileVersion(true);
        api.CreateComponents();
        api.asc_SetFontsPath("../../../../sdkjs/fonts/");
        api.SetThemesPath("../../../../sdkjs/slide/themes/");
        api.Init();
        api.initEvents2MobileAdvances();

        api.asc_registerCallback('asc_onStartAction', Ext.bind(this.onLongActionBegin, this));
        api.asc_registerCallback('asc_onError', Ext.bind(this.onError, this));
        api.asc_registerCallback('asc_onEndAction', Ext.bind(this.onLongActionEnd, this));
        api.asc_registerCallback('asc_onDocumentContentReady', Ext.bind(this.onDocumentContentReady, this));
        api.asc_registerCallback('asc_onOpenDocumentProgress', Ext.bind(this.onOpenDocument, this));
        api.asc_registerCallback('asc_onSaveUrl', Ext.bind(this.onSaveUrl, this));
        api.asc_registerCallback('asc_onGetEditorPermissions',  Ext.bind(this.onEditorPermissions, this));
        api.asc_registerCallback('asc_onDownloadUrl',           Ext.bind(this.onDownloadUrl, this));

        // Initialize descendants
        Ext.each(app.getControllers(), function(controllerName){
            var controller = this.getApplication().getController(controllerName);
            controller && Ext.isFunction(controller.setApi) && controller.setApi(api);
        }, this);

        this.initApi();
        // Initialize api gateway
        this.editorConfig = {};
        Common.Gateway.on('init', Ext.bind(this.loadConfig, this));
        Common.Gateway.on('opendocument', Ext.bind(this.loadDocument, this));
        Common.Gateway.on('showmessage', Ext.bind(this.onExternalMessage, this));
        Common.Gateway.on('resetfocus', Ext.bind(this.onResetFocus, this));
        Common.Gateway.on('processsaveresult', Ext.bind(this.onProcessSaveResult, this));
        Common.Gateway.on('downloadas',        Ext.bind(this.onDownloadAs, this));
        Common.Gateway.ready();
    },

    initControl: function() {
    },

    initApi: function() {
    },

    loadConfig: function(data) {
        this.editorConfig.user = this._fillUserInfo(data.config.user, this.editorConfig.lang, this.textAnonymous);
    },

    loadDocument: function(data) {
        if (data.doc) {
            this.permissions = data.doc.permissions;

            var _user = new CUserInfo();
            _user.put_Id(this.editorConfig.user.id);
            _user.put_FirstName(this.editorConfig.user.firstname);
            _user.put_LastName(this.editorConfig.user.lastname);
            _user.put_FullName(this.editorConfig.user.fullname);

            var docInfo = new CDocInfo();
            docInfo.put_Id(data.doc.key);
            docInfo.put_Url(data.doc.url);
            docInfo.put_Title(data.doc.title);
            docInfo.put_Format(data.doc.fileType);
            docInfo.put_Options(data.doc.options);
            docInfo.put_VKey(data.doc.vkey);
            docInfo.put_UserInfo(_user);

            var profileName = this.getApplication().getCurrentProfile().getName();
            this.getApplication().getController(profileName + '.Main').setPresentationName(data.doc.title || 'Unnamed Presentation');

            this.api.asc_setDocInfo(docInfo);
            this.api.asc_getEditorPermissions(this.editorConfig.licenseUrl, this.editorConfig.customerId);

            Common.component.Analytics.trackEvent('Load', 'Start');
        }
    },

    onEditorPermissions: function(params) {
        var editMode = (this.permissions.edit !== false && this.editorConfig.mode !== 'view');
        this.api.asc_setViewMode(!editMode);
        this.api.asc_LoadDocument();
        this.api.Resize();
    },

    onDocumentContentReady: function() {
        if (this.api){
//            this.api.zoomFitToWidth();
            this.api.StartDemonstration('id-presentation-preview', 0);
        }

        this._hideLoadSplash();

        Common.component.Analytics.trackEvent('Load', 'Complete');
    },

    onOpenDocument: function(progress) {
        var elem = document.getElementById('loadmask-text');
        if (elem) {
            var proc = (progress.asc_getCurrentFont() + progress.asc_getCurrentImage())/(progress.asc_getFontsCount() + progress.asc_getImagesCount());
            elem.innerHTML = this.textLoadingDocument + ': '+ Math.min(Math.round(proc*100), 100) + '%';
        }
    },

    onSaveUrl: function(url) {
        Common.Gateway.save(url);
    },

    onDownloadUrl: function(url) {
        Common.Gateway.downloadAs(url);
    },
    
    onLongActionBegin: function(type, id) {
        var text = '';

        switch (id) {
            case c_oAscAsyncAction['Print']:
                text = this.printText;
        }

        if (type == c_oAscAsyncActionType['BlockInteraction']) {
            Ext.Viewport.setMasked({
                xtype   : 'loadmask',
                message : text
            });
        }
    },

    onLongActionEnd: function(type) {
        Ext.Viewport.unmask();
    },

    onError: function(id, level, errData) {

        this._hideLoadSplash();

        var config = {
            closable: false
        };

        switch (id)
        {
            case c_oAscError.ID.Unknown:
                config.message = this.unknownErrorText;
                break;

            case c_oAscError.ID.ConvertationTimeout:
                config.message = this.convertationTimeoutText;
                break;

            case c_oAscError.ID.ConvertationError:
                config.message = this.convertationErrorText;
                break;

            case c_oAscError.ID.DownloadError:
                config.message = this.downloadErrorText;
                break;

            case c_oAscError.ID.UplImageSize:
                config.message = this.uploadImageSizeMessage;
                break;

            case c_oAscError.ID.UplImageExt:
                config.message = this.uploadImageExtMessage;
                break;

            case c_oAscError.ID.UplImageFileCount:
                config.message = this.uploadImageFileCountMessage;
                break;

            case c_oAscError.ID.SplitCellMaxRows:
                config.message = this.splitMaxRowsErrorText.replace('%1', errData.get_Value());
                break;

            case c_oAscError.ID.SplitCellMaxCols:
                config.message = this.splitMaxColsErrorText.replace('%1', errData.get_Value());
                break;

            case c_oAscError.ID.SplitCellRowsDivider:
                config.message = this.splitDividerErrorText.replace('%1', errData.get_Value());
                break;

            case c_oAscError.ID.VKeyEncrypt:
                config.msg = this.errorKeyEncrypt;
                break;

            case c_oAscError.ID.KeyExpire:
                config.msg = this.errorKeyExpire;
                break;

            case c_oAscError.ID.UserCountExceed:
                config.msg = this.errorUsersExceed;
                break;

            default:
                config.message = this.errorDefaultMessage.replace('%1', id);
                break;
        }



        if (level == c_oAscError.Level.Critical) {

            // report only critical errors
            Common.Gateway.reportError(id, config.message);

            config.title = this.criticalErrorTitle;
            config.message += '<br/>' + this.criticalErrorExtText;
            config.buttons = Ext.Msg.OK;
            config.fn = function(btn) {
                if (btn == 'ok') {
                    window.location.reload();
                }
            }
        } else {
            config.title = this.notcriticalErrorTitle;
            config.buttons = Ext.Msg.OK;
            config.fn = Ext.emptyFn;
        }

        Ext.Msg.show(config);

        Common.component.Analytics.trackEvent('Internal Error', id.toString());
    },

    onExternalMessage: function(msg) {
        if (msg) {
            this._hideLoadSplash();
            Ext.Msg.show({
                title: msg.title,
                msg: '<br/>' + msg.msg,
                icon: Ext.Msg[msg.severity.toUpperCase()],
                buttons: Ext.Msg.OK
            });

            Common.component.Analytics.trackEvent('External Error', msg.title);
        }
    },

    onResetFocus: function(data) {
        var activeElement = document.activeElement;
        activeElement.focus();
    },

    onProcessSaveResult: function(data) {
        this.api && this.api.asc_OnSaveEnd(data.result);
    },

    onDownloadAs: function() {
       this.api.asc_DownloadAs(c_oAscFileType.PPTX, true);
    },

    _hideLoadSplash: function(){
        var preloader = Ext.get('loading-mask');
        if (preloader) {
            Ext.Anim.run(preloader, 'fade', {
                out     : true,
                duration: 250,
                after   : function(){
                    preloader.destroy();
                }
            });
        }
    },

    _isSupport: function(){
        return (Ext.browser.is.WebKit && (Ext.os.is.iOS || Ext.os.is.Android || Ext.os.is.Desktop));
    },

    _fillUserInfo: function(info, lang, defname) {
        var _user = info || {};
        !_user.id && (_user.id = ('uid-' + Date.now()));
        _.isEmpty(_user.firstname) && _.isEmpty(_user.lastname)
            && (_user.firstname = defname);

        _user.fullname = /^ru/.test(lang) ?
            _user.lastname + ' ' + _user.firstname : _user.firstname + ' ' + _user.lastname;

        return _user;
    },

    printText: 'Printing...',
    criticalErrorTitle: 'Error',
    notcriticalErrorTitle: 'Warning',
    errorDefaultMessage: 'Error code: %1',
    criticalErrorExtText: 'Press "Ok" to reload view page.',
    uploadImageSizeMessage: 'Maximium image size limit exceeded.',
    uploadImageExtMessage: 'Unknown image format.',
    uploadImageFileCountMessage: 'No images uploaded.',
    reloadButtonText: 'Reload Page',
    unknownErrorText: 'Unknown error.',
    convertationTimeoutText: 'Convertation timeout exceeded.',
    convertationErrorText: 'Convertation failed.',
    downloadErrorText: 'Download failed.',
    unsupportedBrowserErrorText : 'Your browser is not supported.',
    splitMaxRowsErrorText: 'The number of rows must be less than %1',
    splitMaxColsErrorText: 'The number of columns must be less than %1',
    splitDividerErrorText: 'The number of rows must be a divisor of %1',
    requestEditRightsText: 'Requesting editing rights...',
    requestEditFailedTitleText: 'Access denied',
    requestEditFailedMessageText: 'Someone is editing this document right now. Please try again later.',
    errorKeyEncrypt: 'Unknown key descriptor',
    errorKeyExpire: 'Key descriptor expired',
    errorUsersExceed: 'Count of users was exceed',
    textAnonymous: 'Anonymous',
    textLoadingDocument: 'Loading document'
});