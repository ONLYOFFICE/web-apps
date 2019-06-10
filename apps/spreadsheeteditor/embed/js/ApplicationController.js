/*
 *
 * (c) Copyright Ascensio System SIA 2010-2019
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
 * You can contact Ascensio System SIA at 20A-12 Ernesta Birznieka-Upisha
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
var ApplicationController = new(function(){
    var me,
        api,
        config = {},
        docConfig = {},
        embedConfig = {},
        permissions = {},
        maxPages = 0,
        created = false,
        iframePrint = null;
    var $ttEl,
        $tooltip,
        ttOffset = [6, -15];

    // Initialize analytics
    // -------------------------

//    Common.Analytics.initialize('UA-12442749-13', 'Embedded Spreadsheet Editor');


    // Check browser
    // -------------------------

    if (typeof isBrowserSupported !== 'undefined' && !isBrowserSupported()){
        Common.Gateway.reportError(undefined, 'Your browser is not supported.');
        return;
    }


    // Handlers
    // -------------------------

    function loadConfig(data) {
        config = $.extend(config, data.config);
        embedConfig = $.extend(embedConfig, data.config.embedded);

        common.controller.modals.init(embedConfig);

        if (config.canBackToFolder === false || !(config.customization && config.customization.goback && config.customization.goback.url))
            $('#id-btn-close').hide();

        // Docked toolbar
        if (embedConfig.toolbarDocked === 'bottom') {
            $('#toolbar').addClass('bottom');
            $('.viewer').addClass('bottom');
            $('#box-tools').removeClass('dropdown').addClass('dropup');
            ttOffset[1] = -40;
        } else {
            $('#toolbar').addClass('top');
            $('.viewer').addClass('top');
        }
    }

    function loadDocument(data) {
        docConfig = data.doc;

        if (docConfig) {
            permissions = $.extend(permissions, docConfig.permissions);

            var _permissions = $.extend({}, docConfig.permissions),
                docInfo = new Asc.asc_CDocInfo();
            docInfo.put_Id(docConfig.key);
            docInfo.put_Url(docConfig.url);
            docInfo.put_Title(docConfig.title);
            docInfo.put_Format(docConfig.fileType);
            docInfo.put_VKey(docConfig.vkey);
            docInfo.put_Token(docConfig.token);
            docInfo.put_Permissions(_permissions);

            if (api) {
                api.asc_registerCallback('asc_onGetEditorPermissions', onEditorPermissions);
                api.asc_setDocInfo(docInfo);
                api.asc_getEditorPermissions(config.licenseUrl, config.customerId);
                api.asc_enableKeyEvents(true);

                Common.Analytics.trackEvent('Load', 'Start');
            }

            embedConfig.docTitle = docConfig.title;
            if ( !embedConfig.saveUrl && permissions.print === false)
                $('#idt-copy').hide();
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

    function onDownloadUrl(url) {
        Common.Gateway.downloadAs(url);
    }

    function onPrint() {
        if ( permissions.print!==false )
            api.asc_Print(undefined, $.browser.chrome || $.browser.safari || $.browser.opera);
    }

    function onPrintUrl(url) {
        common.utils.dialogPrint(url);
    }

    function hidePreloader() {
        $('#loading-mask').fadeOut('slow');
    }

    function onDocumentContentReady() {
        hidePreloader();

        if ( !embedConfig.shareUrl )
            $('#idt-share').hide();

        if ( !embedConfig.embedUrl )
            $('#idt-embed').hide();

        if ( !embedConfig.fullscreenUrl )
            $('#idt-fullscreen').hide();

        common.controller.modals.attach({
            share: '#idt-share',
            embed: '#idt-embed'
        });

        api.asc_registerCallback('asc_onMouseMove',             onApiMouseMove);
        api.asc_registerCallback('asc_onHyperlinkClick',        common.utils.openLink);
        api.asc_registerCallback('asc_onDownloadUrl',           onDownloadUrl);
        api.asc_registerCallback('asc_onPrint',                 onPrint);
        api.asc_registerCallback('asc_onPrintUrl',              onPrintUrl);

        Common.Gateway.on('processmouse',       onProcessMouse);
        Common.Gateway.on('downloadas',         onDownloadAs);

        ApplicationView.tools.get('#idt-fullscreen')
            .on('click', function(){
                common.utils.openLink(embedConfig.fullscreenUrl);
            });

        ApplicationView.tools.get('#idt-download')
            .on('click', function(){
                if ( !!embedConfig.saveUrl ){
                    common.utils.openLink(embedConfig.saveUrl);
                } else
                if (permissions.print!==false){
                    api.asc_Print(undefined, $.browser.chrome || $.browser.safari || $.browser.opera);
                }

                Common.Analytics.trackEvent('Save');
            });

        $('#id-btn-close').on('click', function(){
            if (config.customization && config.customization.goback && config.customization.goback.url)
                window.parent.location.href = config.customization.goback.url;
        });

        $('#id-btn-zoom-in').on('click', function () {
            if (api){
                var f = Math.floor(api.asc_getZoom() * 10)/10;
                f += .1;
                f > 0 && !(f > 2.) && api.asc_setZoom(f);
            }
        });
        $('#id-btn-zoom-out').on('click', function () {
            if (api){
                var f = Math.ceil(api.asc_getZoom() * 10)/10;
                f -= .1;
                !(f < .5) && api.asc_setZoom(f);
            }
        });

        var documentMoveTimer;
        var ismoved = false;
        $(document).mousemove(function(event) {
            $('#id-btn-zoom-in').fadeIn();
            $('#id-btn-zoom-out').fadeIn();

            ismoved = true;
            if (!documentMoveTimer) {
                documentMoveTimer = setInterval(function () {
                    if (!ismoved) {
                        $('#id-btn-zoom-in').fadeOut();
                        $('#id-btn-zoom-out').fadeOut();
                        clearInterval(documentMoveTimer);
                        documentMoveTimer = undefined;
                    }

                    ismoved = false;
                }, 2000);
            }
        });

        var ismodalshown = false;
        $(document.body).on('show.bs.modal', '.modal',
            function(e) {
                ismodalshown = true;
                api.asc_enableKeyEvents(false);
            }
        ).on('hidden.bs.modal', '.modal',
            function(e) {
                ismodalshown = false;
                api.asc_enableKeyEvents(true);
            }
        ).on('hidden.bs.dropdown', '.dropdown',
            function(e) {
                if ( !ismodalshown )
                    api.asc_enableKeyEvents(true);
            }
        ).on('blur', 'input, textarea',
            function(e) {
                if ( !ismodalshown ) {
                    if (!/area_id/.test(e.target.id) ) {
                        api.asc_enableKeyEvents(true);
                    }
                }
            }
        );

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
        Common.Analytics.trackEvent('Load', 'Complete');
    }

    function onEditorPermissions(params) {
        if ( (params.asc_getLicenseType() === Asc.c_oLicenseResult.Success) && (typeof config.customization == 'object') &&
            config.customization && config.customization.logo ) {

            var logo = $('#header-logo');
            if (config.customization.logo.imageEmbedded) {
                logo.html('<img src="'+config.customization.logo.imageEmbedded+'" style="max-width:124px; max-height:20px;"/>');
                logo.css({'background-image': 'none', width: 'auto', height: 'auto'});
            }

            if (config.customization.logo.url) {
                logo.attr('href', config.customization.logo.url);
            }
        }
        api.asc_setViewMode(true);
        api.asc_LoadDocument();
    }
    
    function showMask() {
        $('#id-loadmask').modal({
            backdrop: 'static',
            keyboard: false
        });
    }

    function hideMask() {
        $('#id-loadmask').modal('hide');
    }

    function onOpenDocument(progress) {
        var proc = (progress.asc_getCurrentFont() + progress.asc_getCurrentImage())/(progress.asc_getFontsCount() + progress.asc_getImagesCount());
        $('#loadmask-text').html('Loading document: ' + Math.min(Math.round(proc * 100), 100) + '%');
    }

    function onLongActionBegin(type, id){
        var text = '';
        switch (id)
        {
            case Asc.c_oAscAsyncAction['Print']:
                text = 'Downloading document...';
                break;
            default:
                text = 'Please wait...';
                break;
        }

        if (type == Asc.c_oAscAsyncActionType['BlockInteraction']) {
            $('#id-loadmask .cmd-loader-title').html(text);
            showMask();
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

            hideMask();
        }
    }

    function onError(id, level, errData) {
        if (id == Asc.c_oAscError.ID.LoadingScriptError) {
            $('#id-critical-error-title').text(me.criticalErrorTitle);
            $('#id-critical-error-message').text(me.scriptLoadError);
            $('#id-critical-error-close').off().on('click', function(){
                window.location.reload();
            });
            $('#id-critical-error-dialog').css('z-index', 20002).modal('show');
            return;
        }

        hidePreloader();

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

            default:
                message = me.errorDefaultMessage.replace('%1', id);
                break;
        }

        if (level == Asc.c_oAscError.Level.Critical) {

            // report only critical errors
            Common.Gateway.reportError(id, message);

            $('#id-critical-error-title').text(me.criticalErrorTitle);
            $('#id-critical-error-message').text(message);
            $('#id-critical-error-close').off();
            $('#id-critical-error-close').on('click', function(){
                window.location.reload();
            });
        }
        else {
            Common.Gateway.reportWarning(id, message);

            $('#id-critical-error-title').text(me.notcriticalErrorTitle);
            $('#id-critical-error-message').text(message);
            $('#id-critical-error-close').off();
            $('#id-critical-error-close').on('click', function(){
                $('#id-critical-error-dialog').modal('hide');
            });
        }

        $('#id-critical-error-dialog').modal('show');

        Common.Analytics.trackEvent('Internal Error', id.toString());
    }

    function onExternalMessage(error) {
        if (error) {
            hidePreloader();
            $('#id-error-mask-title').text('Error');
            $('#id-error-mask-text').text(error.msg);
            $('#id-error-mask').css('display', 'block');

            Common.Analytics.trackEvent('External Error');
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
            Common.Gateway.reportError(Asc.c_oAscError.ID.AccessDeny, me.errorAccessDeny);
            return;
        }
        api.asc_DownloadAs(Asc.c_oAscFileType.XLSX, true);
    }

    function onApiMouseMove(array) {
        if ( array.length ) {
            var ttdata;
            for (var i = array.length; i > 0; i--) {
                if (array[i-1].asc_getType() == Asc.c_oAscMouseMoveType.Hyperlink) {
                    ttdata = array[i - 1];
                    break;
                }
            }

            if ( ttdata ) {
                if (!$ttEl) {
                    $ttEl = $('.hyperlink-tooltip');
                    $ttEl.tooltip({'container': 'body', 'trigger': 'manual'});
                    $ttEl.on('shown.bs.tooltip', function(e) {
                        $tooltip = $ttEl.data('bs.tooltip').tip();

                        $tooltip.css({
                            left: $ttEl.ttpos[0] + ttOffset[0],
                            top: $ttEl.ttpos[1] + ttOffset[1]
                        });

                        $tooltip.find('.tooltip-arrow').css({left: 10});
                    });
                }

                if (!$tooltip) {
                    $ttEl.ttpos = [ttdata.asc_getX(), ttdata.asc_getY()];
                    $ttEl.tooltip('show');
                } else {
                    $tooltip.css({
                        left: ttdata.asc_getX() + ttOffset[0],
                        top: ttdata.asc_getY() + ttOffset[1]
                    });
                }
            } else {
                if ( $tooltip ) {
                    $tooltip.tooltip('hide');
                    $tooltip = false;
                }
            }
        }
    }

    // Helpers
    // -------------------------

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

        api = new Asc.spreadsheet_api({
            'id-view': 'editor_sdk'
        });

        if (api){
            api.asc_registerCallback('asc_onStartAction',           onLongActionBegin);
            api.asc_registerCallback('asc_onEndAction',             onLongActionEnd);
            api.asc_registerCallback('asc_onError',                 onError);
            api.asc_registerCallback('asc_onOpenDocumentProgress',  onOpenDocument);
            api.asc_registerCallback('asc_onSheetsChanged',         onSheetsChanged);
            api.asc_registerCallback('asc_onActiveSheetChanged',    setActiveWorkSheet);

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
        convertationTimeoutText : 'Convertation timeout exceeded.',
        convertationErrorText   : 'Convertation failed.',
        downloadErrorText       : 'Download failed.',
        criticalErrorTitle      : 'Error',
        notcriticalErrorTitle   : 'Warning',
        scriptLoadError: 'The connection is too slow, some of the components could not be loaded. Please reload the page.',
        errorFilePassProtect: 'The file is password protected and cannot be opened.',
        errorAccessDeny: 'You are trying to perform an action you do not have rights for.<br>Please contact your Document Server administrator.',
        errorUserDrop: 'The file cannot be accessed right now.'
    }
})();