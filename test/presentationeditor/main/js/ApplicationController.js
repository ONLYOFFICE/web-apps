/*
 * (c) Copyright Ascensio System SIA 2010-2024
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
 * You can contact Ascensio System SIA at 20A-6 Ernesta Birznieka-Upish
 * street, Riga, Latvia, EU, LV-1050.
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
PE.ApplicationController = new(function(){
    var me,
        api,
        config = {},
        docConfig = {},
        permissions = {},
        appOptions = {},
        created = false;

    var LoadingDocument = -256;
    // Handlers
    // -------------------------

    function loadConfig(data) {
        config = $.extend(config, data.config);
    }

    function loadDocument(data) {
        docConfig = data.doc;

        if (docConfig) {
            permissions = $.extend(permissions, docConfig.permissions);

            var _permissions = $.extend({}, docConfig.permissions),
                docInfo = new Asc.asc_CDocInfo(),
                _user = new Asc.asc_CUserInfo();

            var user = common.utils.fillUserInfo(config.user, config.lang, me.textAnonymous, ('uid-' + Date.now()));

            _user.put_Id(user.id);
            _user.put_FullName(user.fullname);
            _user.put_IsAnonymousUser(user.anonymous);

            docInfo.put_Id(docConfig.key);
            docInfo.put_Url(docConfig.url);
            docInfo.put_Title(docConfig.title);
            docInfo.put_Format(docConfig.fileType);
            docInfo.put_VKey(docConfig.vkey);
            docInfo.put_UserInfo(_user);
            docInfo.put_Token(docConfig.token);
            docInfo.put_Permissions(_permissions);
            docInfo.put_EncryptedInfo(config.encryptionKeys);

            docInfo.asc_putIsEnabledMacroses(true);
            docInfo.asc_putIsEnabledPlugins(true);

            if (api) {
                api.asc_registerCallback('asc_onGetEditorPermissions', onEditorPermissions);
                api.asc_setDocInfo(docInfo);
                api.asc_getEditorPermissions(config.licenseUrl, config.customerId);
                api.asc_enableKeyEvents(true);

            }
        }
    }

    function onLongActionBegin(type, id) {

        if (type == Asc.c_oAscAsyncActionType['BlockInteraction']) {

            console.log('Action begin');
        }
    }

    function onLongActionEnd(){
        console.log('Action end');
    }

    function onDocumentContentReady() {
        api.ShowThumbnails(true);

        onLongActionEnd(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);

        api.asc_registerCallback('asc_onStartAction',           onLongActionBegin);
        api.asc_registerCallback('asc_onEndAction',             onLongActionEnd);

        Common.Gateway.on('processmouse',       onProcessMouse);
        Common.Gateway.on('downloadas',         onDownloadAs);
        Common.Gateway.on('requestclose',       onRequestClose);

        $('#editor_sdk').on('click', function(e) {
            if ( e.target.localName == 'canvas' ) {
                e.currentTarget.focus();
            }
        });
        Common.Gateway.documentReady();
    }

    function onEditorPermissions(params) {
        var licType = params.asc_getLicenseType();
        appOptions.canLicense     = (licType === Asc.c_oLicenseResult.Success || licType === Asc.c_oLicenseResult.SuccessLimit);
        appOptions.canBrandingExt = params.asc_getCanBranding();
        appOptions.isEdit         = appOptions.canLicense && appOptions.canBrandingExt && (permissions.edit !== false) && (config.mode !== 'view');

        api.asc_SetFastCollaborative(true);
        api.asc_setAutoSaveGap(1);

        onLongActionBegin(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);
        api.asc_setViewMode(!appOptions.isEdit);

        api.asc_LoadDocument();
        api.Resize();
    }

    function onError(id, level, errData) {
        if (id == Asc.c_oAscError.ID.LoadingScriptError) {
            console.error(me.scriptLoadError);
            return;
        }

        onLongActionEnd(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);
        
        var message;

        switch (id)
        {
            case Asc.c_oAscError.ID.Unknown:
                message = me.unknownErrorText;
                break;

            case Asc.c_oAscError.ID.ConvertationTimeout:
                message = me.convertationTimeoutText;
                break;

            case Asc.c_oAscError.ID.ConvertationError:
                message = me.convertationErrorText;
                break;

            case Asc.c_oAscError.ID.DownloadError:
                message = me.downloadErrorText;
                break;

            case Asc.c_oAscError.ID.ConvertationPassword:
                message = me.errorFilePassProtect;
                break;

            case Asc.c_oAscError.ID.UserDrop:
                message = me.errorUserDrop;
                break;

            case Asc.c_oAscError.ID.ConvertationOpenLimitError:
                message = me.errorFileSizeExceed;
                break;

            case Asc.c_oAscError.ID.UpdateVersion:
                message = me.errorUpdateVersionOnDisconnect;
                break;

            case Asc.c_oAscError.ID.AccessDeny:
                message = me.errorAccessDeny;
                break;

            case Asc.c_oAscError.ID.ForceSaveButton:
            case Asc.c_oAscError.ID.ForceSaveTimeout:
                message = me.errorForceSave;
                break;

            case Asc.c_oAscError.ID.LoadingFontError:
                message = me.errorLoadingFont;
                break;

            default:
                message = me.errorDefaultMessage.replace('%1', id);
                break;
        }

        if (level == Asc.c_oAscError.Level.Critical) {

            // report only critical errors
            console.error(id,message);
        }
        else {
            console.warn(id,message);
        }

}

    function onExternalMessage(error) {
        if (error) {
            console.error(error.msg);
        }
    }

    function onProcessMouse(data) {
        if (data.type == 'mouseup') {
            var e = document.getElementById('editor_sdk');
            if (e) {
                var r = e.getBoundingClientRect();
                api.OnMouseUp(
                    data.x - r.left,
                    data.y - r.top
                );
            }
        }
    }

    function onRequestClose() {
        Common.Gateway.requestClose();
    }

    function onDownloadAs() {
        if ( permissions.download === false) {
            console.error(Asc.c_oAscError.ID.AccessDeny, me.errorAccessDeny);
            return;
        }
        if (api) api.asc_DownloadAs(new Asc.asc_CDownloadOptions(Asc.c_oAscFileType.PPTX, false));
    }

    function onBeforeUnload () {
    }

    // Helpers
    // -------------------------

    function onDocumentResize() {
        if (api) {
            api.Resize();
        }
    }

    function createController(){
        if (created) return me;

        me = this;
        created = true;

        // popover ui handlers

        $(window).resize(function(){
        onDocumentResize();
        });
        window.onbeforeunload = onBeforeUnload;

        api = new Asc.asc_docs_api({
        'id-view'  : 'editor_sdk'
        });

        if (api){
            api.SetThemesPath("../../../../sdkjs/slide/themes/");

            api.asc_registerCallback('asc_onError',                 onError);
            api.asc_registerCallback('asc_onDocumentContentReady',  onDocumentContentReady);

            // Initialize api gateway
            Common.Gateway.on('init',               loadConfig);
            Common.Gateway.on('opendocument',       loadDocument);
            Common.Gateway.on('showmessage',        onExternalMessage);
            Common.Gateway.appReady();

        }

        return me;
        }

        return {
        create                  : createController,
        errorDefaultMessage     : 'Error code: %1',
        unknownErrorText        : 'Unknown error.',
        convertationTimeoutText : 'Conversion timeout exceeded.',
        convertationErrorText   : 'Conversion failed.',
        downloadErrorText       : 'Download failed.',
        criticalErrorTitle      : 'Error',
        notcriticalErrorTitle   : 'Warning',
        scriptLoadError: 'The connection is too slow, some of the components could not be loaded. Please reload the page.',
        errorFilePassProtect: 'The file is password protected and cannot be opened.',
        errorAccessDeny: 'You are trying to perform an action you do not have rights for.<br>Please contact your Document Server administrator.',
        errorUserDrop: 'The file cannot be accessed right now.',
        unsupportedBrowserErrorText: 'Your browser is not supported.',
        downloadTextText: 'Downloading presentation...',
        waitText: 'Please, wait...',
        textLoadingDocument: 'Loading presentation',
        txtClose: 'Close',
        errorFileSizeExceed: 'The file size exceeds the limitation set for your server.<br>Please contact your Document Server administrator for details.',
        errorUpdateVersionOnDisconnect: 'Internet connection has been restored, and the file version has been changed.<br>Before you can continue working, you need to download the file or copy its content to make sure nothing is lost, and then reload this page.',
        textGuest: 'Guest',
        textAnonymous: 'Anonymous',
        errorForceSave: "An error occurred while saving the file. Please use the 'Download as' option to save the file to your computer hard drive or try again later.",
        errorLoadingFont: 'Fonts are not loaded.<br>Please contact your Document Server administrator.'
    }
})();
