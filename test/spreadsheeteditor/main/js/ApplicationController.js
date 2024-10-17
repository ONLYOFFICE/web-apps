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
SSE.ApplicationController = new(function(){
    var me,
        api,
        config = {},
        docConfig = {},
        permissions = {},
        appOptions = {},
        maxPages = 0,
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
            docInfo.put_Lang(config.lang);
            docInfo.put_Mode(config.mode);

            docInfo.asc_putIsEnabledMacroses(true);
            docInfo.asc_putIsEnabledPlugins(true);

            if (api) {
                api.asc_registerCallback('asc_onGetEditorPermissions', onEditorPermissions);
                api.asc_setDocInfo(docInfo);
                api.asc_getEditorPermissions(config.licenseUrl, config.customerId);
                api.asc_enableKeyEvents(false);
            }
        }
    }

    function setActiveWorkSheet(index) {
        var $box = $('#worksheets');
        $box.find('> li').removeClass('active');
        $box.find('#worksheet' + index).addClass('active');

        api.asc_showWorksheet(index);
    }

    function onSheetsChanged(){
        maxPages = api.asc_getWorksheetsCount();

            var handleWorksheet = function(e){
                var $worksheet = $(this);
                var index = $worksheet.attr('id').match(/\d+$/);

                if (index.length > 0) {
                    index = parseInt(index[0]);

                    if (index > -1 && index < maxPages)
                        setActiveWorkSheet(index);
                }
            };

        var $box = $('#worksheets');
        $box.find('li').off();
        $box.empty();

        var tpl = '<li id="worksheet{index}">{title}</li>';
        for (var i = 0; i < maxPages; i++) {
            var item = tpl.replace(/\{index}/, i).replace(/\{title}/,api.asc_getWorksheetName(i).replace(/\s/g,'&nbsp;'));
            $(item).appendTo($box).on('click', handleWorksheet);
        }

        setActiveWorkSheet(api.asc_getActiveWorksheetIndex());
    }

    function onDocumentContentReady() {
        onLongActionEnd(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);
        api.asc_registerCallback('asc_onStartAction',           onLongActionBegin);

        Common.Gateway.on('processmouse',       onProcessMouse);
        Common.Gateway.on('downloadas',         onDownloadAs);
        Common.Gateway.on('requestclose',       onRequestClose);


        $('#editor_sdk').on('click', function(e) {
            if ( e.target.localName == 'canvas' ) {
                e.currentTarget.focus();
            }
        });

        $(document).on('mousewheel', function (e) {
            if ((e.ctrlKey || e.metaKey) && !e.altKey) {
                e.preventDefault();
                e.stopPropagation();
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
    }

    function onLongActionBegin(type, id){
        if (type == Asc.c_oAscAsyncActionType['BlockInteraction']) {
           console.log('Action begin');
        }
    }

    function onLongActionEnd(type, id){
        if (type === Asc.c_oAscAsyncActionType.BlockInteraction) {
            switch (id) {
                case Asc.c_oAscAsyncAction.Open:
                    if (api) {
                        api.asc_Resize();
                        var zf = (config.customization && config.customization.zoom ? parseInt(config.customization.zoom)/100 : 1);
                        api.asc_setZoom(zf>0 ? zf : 1);
                    }

                    onDocumentContentReady();
                    onSheetsChanged();
                    break;
            }

            console.log('Action end');
        }
    }

    function onError(id, level, errData) {
        if (id == Asc.c_oAscError.ID.LoadingScriptError) {
            console.error(id,me.scriptLoadError);
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
            console.error(id,message);
        }
        else {
            console.warn(id,message);
        }
    }

    function onExternalMessage(error) {
        if (error) {
            $('#id-error-mask-title').text(me.criticalErrorTitle);
            $('#id-error-mask-text').text(error.msg);
            $('#id-error-mask').css('display', 'block');
        }
    }

    function onProcessMouse(data) {
        if (data.type == 'mouseup') {
            var editor = document.getElementById('editor_sdk');
            if (editor) {
                var rect = editor.getBoundingClientRect();
                var event = window.event || arguments.callee.caller.arguments[0];
                api.asc_onMouseUp(event, data.x - rect.left, data.y - rect.top);
            }
        }
    }

    function onDownloadAs() {
        if ( permissions.download === false) {
            console.error(Asc.c_oAscError.ID.AccessDeny, me.errorAccessDeny);
            return;
        }
        api.asc_DownloadAs(new Asc.asc_CDownloadOptions(Asc.c_oAscFileType.XLSX, true));
    }

    function onRequestClose() {
        Common.Gateway.requestClose();
    }

    function onBeforeUnload () {
    }

    function onDocumentResize() {
        if (api) api.asc_Resize();
    }

    function createController(){
        if (created)
            return me;

        me = this;
        created = true;

        // popover ui handlers

        $(window).resize(function(){
            onDocumentResize();
        });
        window.onbeforeunload = onBeforeUnload;
        
        api = new Asc.spreadsheet_api({
            'id-view': 'editor_sdk',
            'id-input' : 'ce-cell-content'
        });

        if (api){
            api.asc_registerCallback('asc_onEndAction',             onLongActionEnd);
            api.asc_registerCallback('asc_onError',                 onError);
            api.asc_registerCallback('asc_onSheetsChanged',         onSheetsChanged);
            api.asc_registerCallback('asc_onActiveSheetChanged',    setActiveWorkSheet);

            if(SSE.CellEditorController ) {
                SSE.CellEditorController.create();
                SSE.CellEditorController.setApi(api);
            }
            // Initialize api gateway
            Common.Gateway.on('init',               loadConfig);
            Common.Gateway.on('opendocument',       loadDocument);
            Common.Gateway.on('showmessage',        onExternalMessage);
            Common.Gateway.appReady();
        }

        api.asc_enableKeyEvents(true);
        var ismodalshown = false;
        $(document.body).on('blur', 'input, textarea',
            function(e) {
                if ( !ismodalshown ) {
                    if (!/area_id/.test(e.target.id) ) {
                        api.asc_enableKeyEvents(true);
                    }
                }
            }
        );

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
        errorFileSizeExceed: 'The file size exceeds the limitation set for your server.<br>Please contact your Document Server administrator for details.',
        errorUpdateVersionOnDisconnect: 'Internet connection has been restored, and the file version has been changed.<br>Before you can continue working, you need to download the file or copy its content to make sure nothing is lost, and then reload this page.',
        textGuest: 'Guest',
        textAnonymous: 'Anonymous',
        errorForceSave: "An error occurred while saving the file. Please use the 'Download as' option to save the file to your computer hard drive or try again later.",
        errorLoadingFont: 'Fonts are not loaded.<br>Please contact your Document Server administrator.'
    }
})();