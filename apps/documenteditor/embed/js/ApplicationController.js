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
        ttOffset = [0, -10];

    // Initialize analytics
    // -------------------------

//    Common.Analytics.initialize('UA-12442749-13', 'Embedded Document Editor');


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

        // Docked toolbar
        if (embedConfig.toolbarDocked === 'bottom') {
            $('#toolbar').addClass('bottom');
            $('#editor_sdk').addClass('bottom');
            $('#box-tools').removeClass('dropdown').addClass('dropup');
            ttOffset[1] = -40;
        } else {
            $('#toolbar').addClass('top');
            $('#editor_sdk').addClass('top');
        }

        if (config.canBackToFolder === false || !(config.customization && config.customization.goback && config.customization.goback.url)) {
            $('#id-btn-close').hide();

            // Hide last separator
            $('#toolbar .right .separator').hide();
            $('#pages').css('margin-right', '12px');
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

            var type = /^(?:(pdf|djvu|xps))$/.exec(docConfig.fileType);
            if (type && typeof type[1] === 'string') {
                permissions.edit = permissions.review = false;
            }

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

    function onCountPages(count) {
        maxPages = count;
        $('#pages').text('of ' + count);
    }

    function onCurrentPage(number) {
        $('#page-number').val(number + 1);
    }

    function onLongActionBegin(type, id) {
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

    function onLongActionEnd(){
        hideMask();
    }

    function onDocMouseMoveStart() {
        me.isHideBodyTip = true;
    }

    function onDocMouseMoveEnd() {
        if (me.isHideBodyTip) {
            if ( $tooltip ) {
                $tooltip.tooltip('hide');
                $tooltip = false;
            }
        }
    }

    var $ttEl, $tooltip;
    function onDocMouseMove(data) {
        if (data) {
            if (data.get_Type() == 1) { // hyperlink
                me.isHideBodyTip = false;

                if ( !$ttEl ) {
                    $ttEl = $('.hyperlink-tooltip');
                    $ttEl.tooltip({'container':'body', 'trigger':'manual'});
                    $ttEl.on('shown.bs.tooltip', function(e) {
                        $tooltip = $ttEl.data('bs.tooltip').tip();

                        $tooltip.css({
                            left: $ttEl.ttpos[0] + ttOffset[0],
                            top: $ttEl.ttpos[1] + ttOffset[1]
                        });

                        $tooltip.find('.tooltip-arrow').css({left: 10});
                    });
                }

                if ( !$tooltip ) {
                    $ttEl.ttpos = [data.get_X(), data.get_Y()];
                    $ttEl.tooltip('show');
                } else {
                    $tooltip.css({
                        left:data.get_X() + ttOffset[0],
                        top:data.get_Y() + ttOffset[1]
                    });
                }
            }
        }
    }

    function onDownloadUrl(url) {
        Common.Gateway.downloadAs(url);
    }

    function onPrint() {
        if ( permissions.print!==false )
            api.asc_Print($.browser.chrome || $.browser.safari || $.browser.opera);
    }

    function onPrintUrl(url) {
        common.utils.dialogPrint(url);
    }

    function hidePreloader() {
        $('#loading-mask').fadeOut('slow');
    }

    function onDocumentContentReady() {
        hidePreloader();

        var zf = (config.customization && config.customization.zoom ? parseInt(config.customization.zoom) : -2);
        (zf == -1) ? api.zoomFitToPage() : ((zf == -2) ? api.zoomFitToWidth() : api.zoom(zf>0 ? zf : 100));

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

        api.asc_registerCallback('asc_onStartAction',           onLongActionBegin);
        api.asc_registerCallback('asc_onEndAction',             onLongActionEnd);
        api.asc_registerCallback('asc_onMouseMoveStart',        onDocMouseMoveStart);
        api.asc_registerCallback('asc_onMouseMoveEnd',          onDocMouseMoveEnd);
        api.asc_registerCallback('asc_onMouseMove',             onDocMouseMove);
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
                    if (api && permissions.print!==false){
                        api.asc_Print($.browser.chrome || $.browser.safari || $.browser.opera);
                    }

                    Common.Analytics.trackEvent('Save');
            });

        $('#id-btn-close').on('click', function(){
            if (config.customization && config.customization.goback && config.customization.goback.url)
                window.parent.location.href = config.customization.goback.url;
        });

        $('#id-btn-zoom-in').on('click', api.zoomIn.bind(this));
        $('#id-btn-zoom-out').on('click', api.zoomOut.bind(this));

        var $pagenum = $('#page-number');
        $pagenum.on({
            'keyup': function(e){
                if ( e.keyCode == 13 ){
                    var newPage = parseInt($('#page-number').val());

                    if ( newPage > maxPages ) newPage = maxPages;
                    if (newPage < 2 || isNaN(newPage)) newPage = 1;

                    api.goToPage(newPage-1);
                    $pagenum.blur();
                }
            }
            , 'focusin' : function(e) {
                $pagenum.removeClass('masked');
            }
            , 'focusout': function(e){
                !$pagenum.hasClass('masked') && $pagenum.addClass('masked');
            }
        });

        $('#pages').on('click', function(e) {
            $pagenum.focus();
        });

        var documentMoveTimer;
        var ismoved = false;
        $(document).mousemove(function(event){
            $('#id-btn-zoom-in').fadeIn();
            $('#id-btn-zoom-out').fadeIn();

            ismoved = true;
            if ( !documentMoveTimer ) {
                documentMoveTimer = setInterval(function(){
                    if ( !ismoved ) {
                        $('#id-btn-zoom-in').fadeOut();
                        $('#id-btn-zoom-out').fadeOut();
                        clearInterval(documentMoveTimer);
                        documentMoveTimer = undefined;
                    }

                    ismoved = false;
                }, 2000);
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
        api.Resize();
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

    function onDownloadAs() {
        if ( permissions.download === false) {
            Common.Gateway.reportError(Asc.c_oAscError.ID.AccessDeny, me.errorAccessDeny);
            return;
        }
        if (api) api.asc_DownloadAs(Asc.c_oAscFileType.DOCX, true);
    }

    // Helpers
    // -------------------------

    function onDocumentResize() {
        api && api.Resize();
    }

    function createController(){
        if (created)
            return me;

        me = this;
        created = true;

        $(window).resize(function(){
            onDocumentResize();
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

        window["flat_desine"] = true;
        api = new Asc.asc_docs_api({
            'id-view'  : 'editor_sdk'
        });

        if (api){
            api.asc_registerCallback('asc_onError',                 onError);
            api.asc_registerCallback('asc_onDocumentContentReady',  onDocumentContentReady);
            api.asc_registerCallback('asc_onOpenDocumentProgress',  onOpenDocument);

            api.asc_registerCallback('asc_onCountPages',            onCountPages);
//            api.asc_registerCallback('OnCurrentVisiblePage',    onCurrentPage);
            api.asc_registerCallback('asc_onCurrentPage',           onCurrentPage);

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