/*
 *
 * (c) Copyright Ascensio System Limited 2010-2016
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation. In accordance with
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia,
 * EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product
 * logo when distributing the program. Pursuant to Section 7(e) we decline to
 * grant you any rights under trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
*/
Ext.define('SSE.controller.Main', {
    extend: 'Ext.app.Controller',
    editMode: false,

    requires: [
        'Ext.Anim',
        'Ext.MessageBox',
        'SSE.controller.ApiEvents',
        'SSE.view.OpenCsvPanel'
    ],

    config: {
        refs: {
            mainView: 'semainview'
        }
    },

    launch: function() {
        if (!this._isSupport()){
            Common.Gateway.reportError(undefined, this.unsupportedBrowserErrorText);
            return;
        }

        // Initialize descendants

        this.initControl();

        // Initialize analytics

//        Common.component.Analytics.initialize('UA-12442749-13', 'Spreadsheet Mobile');

        var app = this.getApplication();

        // Initialize api
        this.api = new Asc.spreadsheet_api({
            'id-view'  : 'id-sdkeditor',
            'mobile'   : true
        });

        this.api.asc_registerCallback('asc_onAdvancedOptions',      Ext.bind(this.onAdvancedOptions, this));
        this.api.asc_registerCallback('asc_onOpenDocumentProgress', Ext.bind(this.onOpenDocumentProgress, this));
        this.api.asc_registerCallback('asc_onEndAction',            Ext.bind(this.onLongActionEnd, this));
        this.api.asc_registerCallback('asc_onError',                Ext.bind(this.onError, this));
        this.api.asc_registerCallback('asc_onSaveUrl',              Ext.bind(this.onSaveUrl, this));
        this.api.asc_registerCallback('asc_onGetEditorPermissions', Ext.bind(this.onEditorPermissions, this));
        this.api.asc_registerCallback('asc_onDownloadUrl',          Ext.bind(this.onDownloadUrl, this));

        // Initialize descendants
        Ext.each(app.getControllers(), function(controllerName){
            var controller = app.getController(controllerName);
            controller && Ext.isFunction(controller.setApi) && controller.setApi(this.api);
        }, this);

        this.initApi();

        // Initialize api gateway
        this.editorConfig = {};
        Common.Gateway.on('init', Ext.bind(this.loadConfig, this));
        Common.Gateway.on('opendocument', Ext.bind(this.loadDocument, this));
        Common.Gateway.on('showmessage', Ext.bind(this.onExternalMessage, this));
        Common.Gateway.on('processsaveresult', Ext.bind(this.onProcessSaveResult, this));
        Common.Gateway.on('downloadas',        Ext.bind(this.onDownloadAs, this));
        Common.Gateway.ready();
    },

    initControl: function() {
    },

    initApi: function() {
    },

    loadConfig: function(data) {
        this.editorConfig = Ext.merge(this.editorConfig, data.config);
        this.editorConfig.user = this._fillUserInfo(this.editorConfig.user, this.editorConfig.lang, this.textAnonymous);
    },

    loadDocument: function(data) {
        if (data.doc) {
            this.permissions = data.doc.permissions;

            var _user = new Asc.asc_CUserInfo();
            _user.put_Id(this.editorConfig.user.id);
            _user.put_FullName(this.editorConfig.user.fullname);

            docInfo = new Asc.asc_CDocInfo();
            docInfo.put_Id(data.doc.key);
            docInfo.put_Url(data.doc.url);
            docInfo.put_Title(data.doc.title);
            docInfo.put_Format(data.doc.fileType);
            docInfo.put_VKey(data.doc.vkey);
            docInfo.put_Options(data.doc.options);
            docInfo.put_UserInfo(_user);

            this.api.asc_setDocInfo(docInfo);
            this.api.asc_getEditorPermissions(this.editorConfig.licenseUrl, this.editorConfig.customerId);

            Common.component.Analytics.trackEvent('Load', 'Start');
        }
    },

    onEditorPermissions: function(params) {
        var modeEdit = /*this.permissions.edit === true && this.editorConfig.mode !== 'view'*/false;
        this.api.asc_setViewMode(!modeEdit);
        this.api.asc_LoadDocument();

        var profileName = this.getApplication().getCurrentProfile().getName();
//            this.getApplication().getController(profileName + '.Main').setDocumentName(data.doc.title || 'Unnamed Spreadsheet');
        this.getApplication().getController(profileName + '.Main').setMode(modeEdit);

    },

    onError: function(id, level) {
        this._hideLoadSplash();

        var config = {
            closable: false
        };

        switch (id)
        {
            case Asc.c_oAscError.ID.Unknown:
                config.message = this.unknownErrorText;
                break;

            case Asc.c_oAscError.ID.ConvertationTimeout:
                config.message = this.convertationTimeoutText;
                break;

            case Asc.c_oAscError.ID.ConvertationError:
                config.message = this.convertationErrorText;
                break;

            case Asc.c_oAscError.ID.DownloadError:
                config.message = this.downloadErrorText;
                break;

            case Asc.c_oAscError.ID.UplImageSize:
                config.message = this.uploadImageSizeMessage;
                break;

            case Asc.c_oAscError.ID.UplImageExt:
                config.message = this.uploadImageExtMessage;
                break;

            case Asc.c_oAscError.ID.UplImageFileCount:
                config.message = this.uploadImageFileCountMessage;
                break;

            case Asc.c_oAscError.ID.VKeyEncrypt:
                config.msg = this.errorKeyEncrypt;
                break;

            case Asc.c_oAscError.ID.KeyExpire:
                config.msg = this.errorKeyExpire;
                break;

            case Asc.c_oAscError.ID.UserCountExceed:
                config.msg = this.errorUsersExceed;
                break;

            default:
                config.message = this.errorDefaultMessage.replace('%1', id);
                break;
        }



        if (level == Asc.c_oAscError.Level.Critical) {

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
        }
        else {
            config.title = this.notcriticalErrorTitle;
            config.buttons = Ext.Msg.OK;
            config.fn = Ext.emptyFn;
        }

        Ext.Msg.show(config);
    },

    onSaveUrl: function(url) {
        Common.Gateway.save(url);
    },

    onDownloadUrl: function(url) {
        Common.Gateway.downloadAs(url);
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

    onAdvancedOptions: function(advOptions) {
        if (advOptions.asc_getOptionId() == Asc.c_oAscAdvancedOptionsID['CSV']){
            var preloader = Ext.get('loading-mask'),
                me = this;

            Ext.Anim.run(preloader, 'slide', {
                out         : true,
                direction   : 'up',
                duration    : 250,
                after       : function(){
                    preloader.hide();
                }
            });

            var viewAdvOptionsCsv = Ext.Viewport.add({
                xtype   : 'seopencsvpanel',
                left    : 0,
                top     : 0,
                width   : '100%',
                height  : '100%'

            });

            Ext.Anim.run(viewAdvOptionsCsv, 'slide', {
                out         : false,
                direction   : 'up',
                duration    : 1000
            });

            viewAdvOptionsCsv.on('close', Ext.bind(function(panel, result){
                preloader.show();

                Ext.Anim.run(preloader, 'slide', {
                    out         : false,
                    direction   : 'down',
                    duration    : 1000
                });

                Ext.Anim.run(viewAdvOptionsCsv, 'slide', {
                    out         : true,
                    direction   : 'down',
                    duration    : 1000,
                    after       : function(){
                        Ext.Viewport.remove(viewAdvOptionsCsv);
                        if (me.api) {
                            me.api.asc_setAdvancedOptions(Asc.c_oAscAdvancedOptionsID['CSV'], new Asc.asc_CCSVAdvancedOptions(result.encoding, result.delimiter));
                        }
                    }
                });

            }, this));
        }
    },

    onOpenDocumentProgress: function(progress) {
        var elem = document.getElementById('loadmask-text');
        if (elem) {
            var proc = (progress.asc_getCurrentFont() + progress.asc_getCurrentImage())/(progress.asc_getFontsCount() + progress.asc_getImagesCount());
            elem.innerHTML = this.textLoadingDocument + ': '+ Math.round(proc*100) + '%';
        }
    },

    onOpenDocument: function() {
        this._hideLoadSplash();
        this.api.asc_Resize();

        if (this.api)
            this.api.asc_cleanSelection();
    },

    onLongActionEnd: function(type, id) {
        if (type === Asc.c_oAscAsyncActionType['BlockInteraction']){
            switch (id) {
                case Asc.c_oAscAsyncAction['Open']:
                    this.onOpenDocument();
                    break;
            }
        }
    },

    onDownloadAs: function() {
       this.api.asc_DownloadAs(Asc.c_oAscFileType.XLSX, true);
    },

    _hideLoadSplash: function(){
        var preloader = Ext.get('loading-mask');
        if (preloader) {
            Ext.Anim.run(preloader, 'fade', {
                out     : true,
                duration: 1000,
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
        if (_.isEmpty(_user.name)) {
            _.isEmpty(_user.firstname) && _.isEmpty(_user.lastname) && (_user.firstname = defname);
            if (_.isEmpty(_user.firstname))
                _user.fullname = _user.lastname;
            else if (_.isEmpty(_user.lastname))
                _user.fullname = _user.firstname;
            else
                _user.fullname = /^ru/.test(lang) ? _user.lastname + ' ' + _user.firstname :  _user.firstname + ' ' + _user.lastname;
        } else
            _user.fullname = _user.name;

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
    unknownErrorText: 'Unknown error.',
    convertationTimeoutText: 'Convertation timeout exceeded.',
    convertationErrorText: 'Convertation failed.',
    downloadErrorText: 'Download failed.',
    unsupportedBrowserErrorText : 'Your browser is not supported.',
    errorKeyEncrypt: 'Unknown key descriptor',
    errorKeyExpire: 'Key descriptor expired',
    errorUsersExceed: 'Count of users was exceed',
    textAnonymous: 'Anonymous',
    textLoadingDocument: 'Loading document'
});