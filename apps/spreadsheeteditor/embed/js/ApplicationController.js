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
        embedConfig = {},
        permissions = {},
        appOptions = {},
        maxPages = 0,
        created = false,
        iframePrint = null;
    var $ttEl,
        $tooltip,
        ttOffset = [6, -15],
        labelDocName;

    var LoadingDocument = -256;

    // Initialize analytics
    // -------------------------

//    Common.Analytics.initialize('UA-12442749-13', 'Embedded Spreadsheet Editor');


    // Check browser
    // -------------------------

    if (typeof isBrowserSupported !== 'undefined' && !isBrowserSupported()){
        Common.Gateway.reportError(undefined, this.unsupportedBrowserErrorText);
        return;
    }

    common.localStorage.setId('text');
    common.localStorage.setKeysFilter('sse-,asc.table');
    common.localStorage.sync();

    // Handlers
    // -------------------------

    function loadConfig(data) {
        config = $.extend(config, data.config);
        embedConfig = $.extend(embedConfig, data.config.embedded);

        common.controller.modals.init(embedConfig);
        common.controller.SearchBar.init(embedConfig);

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

        config.canCloseEditor = false;
        var _canback = false;
        if (typeof config.customization === 'object') {
            if (typeof config.customization.goback == 'object' && config.canBackToFolder!==false) {
                _canback = config.customization.close===undefined ?
                    config.customization.goback.url || config.customization.goback.requestClose && config.canRequestClose :
                    config.customization.goback.url && !config.customization.goback.requestClose;

                if (config.customization.goback.requestClose)
                    console.log("Obsolete: The 'requestClose' parameter of the 'customization.goback' section is deprecated. Please use 'close' parameter in the 'customization' section instead.");
            }
            if (config.customization.close && typeof config.customization.close === 'object')
                config.canCloseEditor  = (config.customization.close.visible!==false) && config.canRequestClose && !config.isDesktopApp;
        }
        config.canBackToFolder = !!_canback;

        var reg = (typeof (config.region) == 'string') ? config.region.toLowerCase() : config.region;
        reg = Common.util.LanguageInfo.getLanguages().hasOwnProperty(reg) ? reg : Common.util.LanguageInfo.getLocalLanguageCode(reg);
        if (reg!==null)
            reg = parseInt(reg);
        else
            reg = (config.lang) ? parseInt(Common.util.LanguageInfo.getLocalLanguageCode(config.lang)) : 0x0409;
        api.asc_setLocale(reg);
    }

    function loadDocument(data) {
        docConfig = data.doc;

        if (docConfig) {
            permissions = $.extend(permissions, docConfig.permissions);

            var docInfo = new Asc.asc_CDocInfo(),
                _user = new Asc.asc_CUserInfo();

            var canRenameAnonymous = !((typeof (config.customization) == 'object') && (typeof (config.customization.anonymous) == 'object') && (config.customization.anonymous.request===false)),
                guestName = (typeof (config.customization) == 'object') && (typeof (config.customization.anonymous) == 'object') &&
                (typeof (config.customization.anonymous.label) == 'string') && config.customization.anonymous.label.trim()!=='' ?
                    common.utils.htmlEncode(config.customization.anonymous.label) : me.textGuest,
                value = canRenameAnonymous ? common.localStorage.getItem("guest-username") : null,
                user = common.utils.fillUserInfo(config.user, config.lang, value ? (value + ' (' + guestName + ')' ) : me.textAnonymous,
                    common.localStorage.getItem("guest-id") || ('uid-' + Date.now()));
            user.anonymous && common.localStorage.setItem("guest-id", user.id);

            _user.put_Id(user.id);
            _user.put_FullName(user.fullname);
            _user.put_IsAnonymousUser(user.anonymous);

            docInfo.put_Id(docConfig.key);
            docInfo.put_Url(docConfig.url);
            docInfo.put_DirectUrl(docConfig.directUrl);
            docInfo.put_Title(docConfig.title);
            docInfo.put_Format(docConfig.fileType);
            docInfo.put_VKey(docConfig.vkey);
            docInfo.put_UserInfo(_user);
            docInfo.put_CallbackUrl(config.callbackUrl);
            docInfo.put_Token(docConfig.token);
            docInfo.put_Permissions(docConfig.permissions);
            docInfo.put_EncryptedInfo(config.encryptionKeys);
            docInfo.put_Lang(config.lang);
            docInfo.put_Mode(config.mode);
            docInfo.put_Wopi(config.wopi);
            config.shardkey && docInfo.put_Shardkey(config.shardkey);

            var enable = !config.customization || (config.customization.macros!==false);
            docInfo.asc_putIsEnabledMacroses(!!enable);
            enable = !config.customization || (config.customization.plugins!==false);
            docInfo.asc_putIsEnabledPlugins(!!enable);

            if (api) {
                api.asc_registerCallback('asc_onGetEditorPermissions', onEditorPermissions);
                api.asc_registerCallback('asc_onRunAutostartMacroses', onRunAutostartMacroses);
                api.asc_setDocInfo(docInfo);
                api.asc_getEditorPermissions(config.licenseUrl, config.customerId);
                api.asc_enableKeyEvents(true);

                Common.Analytics.trackEvent('Load', 'Start');
            }

            embedConfig.docTitle = docConfig.title;
            labelDocName = $('#title-doc-name');
            labelDocName.text(embedConfig.docTitle || '')
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

        var tpl = '<li id="worksheet{index}" tabtitle="{tabtitle}" {style}>{title}</li>';
        for (var i = 0; i < maxPages; i++) {
            if (api.asc_isWorksheetHidden(i)) continue;

            var styleAttr = "";
            var color = api.asc_getWorksheetTabColor(i);

            if (color) {
                styleAttr = 'style="box-shadow: inset 0 4px 0 rgb({r}, {g}, {b})"'
                    .replace(/\{r}/, color.get_r())
                    .replace(/\{g}/, color.get_g())
                    .replace(/\{b}/, color.get_b());
            }

            // escape html
            var name = api.asc_getWorksheetName(i).replace(/[&<>"']/g, function (match) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;'
                }[match];
            });

            var item = tpl
                .replace(/\{index}/, i)
                .replace(/\{tabtitle}/, name)
                .replace(/\{title}/, name)
                .replace(/\{style}/, styleAttr);

            $(item).appendTo($box).on('click', handleWorksheet);
        }

        setActiveWorkSheet(api.asc_getActiveWorksheetIndex());
    }

    function setupScrollButtons() {
        var $container = $('#worksheet-container');
        var $prevButton = $('#worksheet-list-button-prev');
        var $nextButton = $('#worksheet-list-button-next');
        var $box = $('#worksheets');

        var handleScrollButtonsState = function() {
            if ($container[0].scrollWidth > $container[0].clientWidth) {
                var scrollLeft = $container.scrollLeft();
                var scrollWidth = $container[0].scrollWidth;
                var containerWidth = $container.innerWidth();

                if (scrollLeft === 0) {
                    $prevButton.prop('disabled', true);
                    $nextButton.prop('disabled', false);
                } else if (scrollLeft + containerWidth >= scrollWidth) {
                    $prevButton.prop('disabled', false);
                    $nextButton.prop('disabled', true);
                } else {
                    $prevButton.prop('disabled', false);
                    $nextButton.prop('disabled', false);
                }
            } else {
                $prevButton.prop('disabled', true);
                $nextButton.prop('disabled', true);
            }
        };

        $container.on('scroll', handleScrollButtonsState);
        $(window).on('resize', handleScrollButtonsState);

        handleScrollButtonsState();

        var buttonWidth = $('.worksheet-list-buttons').outerWidth();

        $prevButton.on('click', function() {
            $($box.children().get().reverse()).each(function () {
                var $tab = $(this);
                var left = $tab.position().left - buttonWidth;

                if (left < 0) {
                    $container.scrollLeft($container.scrollLeft() + left - 26);
                    return false;
                }
            });
        });

        $nextButton.on('click', function() {
            var rightBound = $container.width();
            $box.children().each(function () {
                var $tab = $(this);
                var right = $tab.position().left + $tab.outerWidth();

                if (right > rightBound) {
                    $container.scrollLeft($container.scrollLeft() + right - rightBound + ($container.width() > 400 ? 20 : 5));
                    return false;
                }
            });
        });
    }

    function onDownloadUrl(url, fileType) {
        Common.Gateway.downloadAs(url, fileType);
    }

    function onPrint() {
        if ( permissions.print!==false )
            api.asc_Print(new Asc.asc_CDownloadOptions(null, $.browser.chrome || $.browser.safari || $.browser.opera || $.browser.mozilla && $.browser.versionNumber>86));
    }

    function onPrintUrl(url) {
        common.utils.dialogPrint(url, api);
    }

    function hidePreloader() {
        $('#loading-mask').fadeOut('slow');
    }

    function onDocumentContentReady() {
        hidePreloader();
        onLongActionEnd(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);

        var dividers = $('#box-tools .divider');
        var itemsCount = $('#box-tools a').length;

        if ( permissions.print === false) {
            $('#idt-print').hide();
            itemsCount--;
        }

        if ( !embedConfig.saveUrl || permissions.download === false) {
            $('#idt-download').hide();
            itemsCount--;
        }

        if ( !embedConfig.shareUrl ) {
            $('#idt-share').hide();
            itemsCount--;
        }

        if (!config.canBackToFolder) {
            $('#idt-close').hide();
            itemsCount--;
        } else {
            var text = config.customization.goback.text;
            text && (typeof text == 'string') && $('#idt-close .caption').text(text);
        }

        if (config.canCloseEditor) {
            $('#id-btn-close-editor').removeClass('hidden');
        }

        if (itemsCount < 7) {
            $(dividers[0]).hide();
            $(dividers[1]).hide();
        }

        if ( !embedConfig.embedUrl ) {
            $('#idt-embed').hide();
            itemsCount--;
        }

        if ( !embedConfig.fullscreenUrl ) {
            $('#idt-fullscreen').hide();
            itemsCount--;
        }

        if (itemsCount < 1)
            $('#box-tools').addClass('hidden');
        else if (!embedConfig.embedUrl && !embedConfig.fullscreenUrl)
            $(dividers[2]).hide();

        common.controller.modals.attach({
            share: '#idt-share',
            embed: '#idt-embed'
        });

        api.asc_registerCallback('asc_onMouseMove',             onApiMouseMove);
        api.asc_registerCallback('asc_onHyperlinkClick',        common.utils.openLink);
        api.asc_registerCallback('asc_onDownloadUrl',           onDownloadUrl);
        api.asc_registerCallback('asc_onPrint',                 onPrint);
        api.asc_registerCallback('asc_onPrintUrl',              onPrintUrl);
        api.asc_registerCallback('asc_onStartAction',           onLongActionBegin);

        Common.Gateway.on('processmouse',       onProcessMouse);
        Common.Gateway.on('downloadas',         onDownloadAs);
        Common.Gateway.on('requestclose',       onRequestClose);

        SSE.ApplicationView.tools.get('#idt-fullscreen')
            .on('click', function(){
                common.utils.openLink(embedConfig.fullscreenUrl);
            });

        SSE.ApplicationView.tools.get('#idt-download')
            .on('click', function(){
                if ( !!embedConfig.saveUrl && permissions.download !== false){
                    common.utils.openLink(embedConfig.saveUrl);
                }

                Common.Analytics.trackEvent('Save');
            });

        SSE.ApplicationView.tools.get('#idt-print')
            .on('click', function(){
                api.asc_Print(new Asc.asc_CDownloadOptions(null, $.browser.chrome || $.browser.safari || $.browser.opera || $.browser.mozilla && $.browser.versionNumber>86));
                Common.Analytics.trackEvent('Print');
            });

        SSE.ApplicationView.tools.get('#idt-close')
            .on('click', function(){
                if (config.customization && config.customization.goback) {
                    if (config.customization.goback.requestClose && config.canRequestClose)
                        Common.Gateway.requestClose();
                    else if (config.customization.goback.url) {
                        if (config.customization.goback.blank!==false) {
                            window.open(config.customization.goback.url, "_blank");
                        } else {
                            window.parent.location.href = config.customization.goback.url;
                        }
                    }
                }
            });

        $('#id-btn-close-editor').on('click', function(){
            config.canRequestClose && Common.Gateway.requestClose();
        });

        SSE.ApplicationView.tools.get('#idt-search')
            .on('click', function(){
                common.controller.SearchBar.show();
            });

        $('#id-btn-zoom-in').on('click', function () {
            if (api){
                var f = Math.floor(api.asc_getZoom() * 10)/10;
                f += .1;
                f > 0 && !(f > 5.) && api.asc_setZoom(f);
            }
        });
        $('#id-btn-zoom-out').on('click', function () {
            if (api){
                var f = Math.ceil(api.asc_getZoom() * 10)/10;
                f -= .1;
                !(f < .1) && api.asc_setZoom(f);
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
        var licType = params.asc_getLicenseType();
        if (Asc.c_oLicenseResult.Expired === licType || Asc.c_oLicenseResult.Error === licType || Asc.c_oLicenseResult.ExpiredTrial === licType ||
            Asc.c_oLicenseResult.NotBefore === licType || Asc.c_oLicenseResult.ExpiredLimited === licType) {
            $('#id-critical-error-title').text(Asc.c_oLicenseResult.NotBefore === licType ? me.titleLicenseNotActive : me.titleLicenseExp);
            $('#id-critical-error-message').html(Asc.c_oLicenseResult.NotBefore === licType ? me.warnLicenseBefore : me.warnLicenseExp);
            $('#id-critical-error-close').parent().remove();
            $('#id-critical-error-dialog').css('z-index', 20002).modal({backdrop: 'static', keyboard: false, show: true});
            return;
        }

        appOptions.canBranding  = params.asc_getCustomization();
        appOptions.canBranding && setBranding(config.customization);

        var $parent = labelDocName.parent();
        var _left_width = $parent.position().left,
            _right_width = $parent.next().outerWidth();

        if ( _left_width < _right_width )
            $parent.css('padding-left', parseFloat($parent.css('padding-left')) + _right_width - _left_width);
        else
            $parent.css('padding-right', parseFloat($parent.css('padding-right')) + _left_width - _right_width);

        onLongActionBegin(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);
        api.asc_setViewMode(true);
        api.asc_LoadDocument();
    }
    
    function onOpenDocument(progress) {
        var proc = (progress.asc_getCurrentFont() + progress.asc_getCurrentImage())/(progress.asc_getFontsCount() + progress.asc_getImagesCount());
        me.loadMask && me.loadMask.setTitle(me.textLoadingDocument + ': ' + common.utils.fixedDigits(Math.min(Math.round(proc*100), 100), 3, "  ") + '%');
    }

    function onLongActionBegin(type, id){
        var text = '';
        switch (id)
        {
            case Asc.c_oAscAsyncAction['Print']:
                text = me.downloadTextText;
                break;
            case LoadingDocument:
                text = me.textLoadingDocument + '           ';
                break;
            default:
                text = me.waitText;
                break;
        }

        if (type == Asc.c_oAscAsyncActionType['BlockInteraction']) {
            if (!me.loadMask)
                me.loadMask = new common.view.LoadMask();
            me.loadMask.setTitle(text);
            me.loadMask.show();
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
                    setupScrollButtons();
                    break;
            }

            me.loadMask && me.loadMask.hide();
        }
    }

    function onAdvancedOptions(type, advOptions, mode, formatOptions) {
        if (type == Asc.c_oAscAdvancedOptionsID.DRM) {
            var isCustomLoader = !!config.customization.loaderName || !!config.customization.loaderLogo;
            var submitPassword = function(val) {
                api && api.asc_setAdvancedOptions(Asc.c_oAscAdvancedOptionsID.DRM, new Asc.asc_CDRMAdvancedOptions(val)); 
                me.loadMask && me.loadMask.show();
                if(!isCustomLoader) $('#loading-mask').removeClass("none-animation");
            };
            common.controller.modals.createDlgPassword(submitPassword);
            if(isCustomLoader) hidePreloader();
            else $('#loading-mask').addClass("none-animation");
            onLongActionEnd(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);
        } else if (type == Asc.c_oAscAdvancedOptionsID.CSV) {
            api && api.asc_setAdvancedOptions(Asc.c_oAscAdvancedOptionsID.CSV, advOptions.asc_getRecommendedSettings() || new Asc.asc_CTextOptions());
            onLongActionEnd(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);
        }
    }

    function onError(id, level, errData) {
        if (id == Asc.c_oAscError.ID.LoadingScriptError) {
            $('#id-critical-error-title').text(me.criticalErrorTitle);
            $('#id-critical-error-message').text(me.scriptLoadError);
            $('#id-critical-error-close').text(me.txtClose).off().on('click', function(){
                window.location.reload();
            });
            $('#id-critical-error-dialog').css('z-index', 20002).modal('show');
            return;
        }

        hidePreloader();
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

            case Asc.c_oAscError.ID.ConvertationOpenError:
                message = me.openErrorText;
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

            case Asc.c_oAscError.ID.KeyExpire:
                message = me.errorTokenExpire;
                break;

            case Asc.c_oAscError.ID.VKeyEncrypt:
                message= me.errorToken;
                break;

            case Asc.c_oAscError.ID.ConvertationOpenFormat:
                if (errData === 'pdf')
                    message = me.errorInconsistentExtPdf.replace('%1', docConfig.fileType || '');
                else if  (errData === 'docx')
                    message = me.errorInconsistentExtDocx.replace('%1', docConfig.fileType || '');
                else if  (errData === 'xlsx')
                    message = me.errorInconsistentExtXlsx.replace('%1', docConfig.fileType || '');
                else if  (errData === 'pptx')
                    message = me.errorInconsistentExtPptx.replace('%1', docConfig.fileType || '');
                else
                    message = me.errorInconsistentExt;
                break;

            case Asc.c_oAscError.ID.SessionToken: // don't show error message
                return;

            case Asc.c_oAscError.ID.EditingError:
                message = me.errorEditingDownloadas;
                break;

            default:
                // message = me.errorDefaultMessage.replace('%1', id);
                // break;
                return;
        }

        if (level == Asc.c_oAscError.Level.Critical) {

            // report only critical errors
            Common.Gateway.reportError(id, message);

            $('#id-critical-error-title').text(me.criticalErrorTitle);
            $('#id-critical-error-message').html(message);
            $('#id-critical-error-close').text(me.txtClose).off().on('click', function(){
                window.location.reload();
            });
        }
        else {
            Common.Gateway.reportWarning(id, message);

            $('#id-critical-error-title').text(me.notcriticalErrorTitle);
            $('#id-critical-error-message').html(message);
            $('#id-critical-error-close').text(me.txtClose).off().on('click', function(){
                $('#id-critical-error-dialog').modal('hide');
            });
        }

        $('#id-critical-error-dialog').modal('show');

        Common.Analytics.trackEvent('Internal Error', id.toString());
    }

    function onExternalMessage(error) {
        if (error) {
            hidePreloader();
            $('#id-error-mask-title').text(me.criticalErrorTitle);
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

    function onRequestClose() {
        Common.Gateway.requestClose();
    }

    function onDownloadAs() {
        if ( permissions.download === false) {
            Common.Gateway.reportError(Asc.c_oAscError.ID.AccessDeny, me.errorAccessDeny);
            return;
        }
        if (api) {
            var options = new Asc.asc_CDownloadOptions(Asc.c_oAscFileType.XLSX, true);
            options.asc_setIsSaveAs(true);
            api.asc_DownloadAs(options);
        }
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

    function onRunAutostartMacroses() {
        if (!config.customization || (config.customization.macros!==false))
            if (api) api.asc_runAutostartMacroses();
    }

    function onBeforeUnload () {
        common.localStorage.save();
    }

    function setBranding(value) {
        if ( value && value.logo) {
            var logo = $('#header-logo');
            if (value.logo.visible===false) {
                logo.addClass('hidden');
                return;
            }

            if (value.logo.image || value.logo.imageEmbedded) {
                logo.html('<img src="'+(value.logo.image || value.logo.imageEmbedded)+'" style="max-width:100px; max-height:20px;"/>');
                logo.css({'background-image': 'none', width: 'auto', height: 'auto'});

                value.logo.imageEmbedded && console.log("Obsolete: The 'imageEmbedded' parameter of the 'customization.logo' section is deprecated. Please use 'image' parameter instead.");
            }

            if (value.logo.url) {
                logo.attr('href', value.logo.url);
            } else if (value.logo.url!==undefined) {
                logo.removeAttr('href');logo.removeAttr('target');
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
        window.onbeforeunload = onBeforeUnload;
        
        api = new Asc.spreadsheet_api({
            'id-view': 'editor_sdk',
            'embedded' : true
        });

        if (api){
            api.asc_registerCallback('asc_onEndAction',             onLongActionEnd);
            api.asc_registerCallback('asc_onError',                 onError);
            api.asc_registerCallback('asc_onOpenDocumentProgress',  onOpenDocument);
            api.asc_registerCallback('asc_onAdvancedOptions',       onAdvancedOptions);
            api.asc_registerCallback('asc_onSheetsChanged',         onSheetsChanged);
            api.asc_registerCallback('asc_onActiveSheetChanged',    setActiveWorkSheet);

            // Initialize api gateway
            Common.Gateway.on('init',               loadConfig);
            Common.Gateway.on('opendocument',       loadDocument);
            Common.Gateway.on('showmessage',        onExternalMessage);
            Common.Gateway.appReady();

            common.controller.SearchBar.setApi(api);
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
        textOf: 'of',
        downloadTextText: 'Downloading spreadsheet...',
        waitText: 'Please, wait...',
        textLoadingDocument: 'Loading spreadsheet',
        txtClose: 'Close',
        errorFileSizeExceed: 'The file size exceeds the limitation set for your server.<br>Please contact your Document Server administrator for details.',
        errorUpdateVersionOnDisconnect: 'Internet connection has been restored, and the file version has been changed.<br>Before you can continue working, you need to download the file or copy its content to make sure nothing is lost, and then reload this page.',
        textGuest: 'Guest',
        textAnonymous: 'Anonymous',
        errorForceSave: "An error occurred while saving the file. Please use the 'Download as' option to save the file to your computer hard drive or try again later.",
        errorLoadingFont: 'Fonts are not loaded.<br>Please contact your Document Server administrator.',
        errorTokenExpire: 'The document security token has expired.<br>Please contact your Document Server administrator.',
        openErrorText: 'An error has occurred while opening the file',
        errorInconsistentExtDocx: 'An error has occurred while opening the file.<br>The file content corresponds to text documents (e.g. docx), but the file has the inconsistent extension: %1.',
        errorInconsistentExtXlsx: 'An error has occurred while opening the file.<br>The file content corresponds to spreadsheets (e.g. xlsx), but the file has the inconsistent extension: %1.',
        errorInconsistentExtPptx: 'An error has occurred while opening the file.<br>The file content corresponds to presentations (e.g. pptx), but the file has the inconsistent extension: %1.',
        errorInconsistentExtPdf: 'An error has occurred while opening the file.<br>The file content corresponds to one of the following formats: pdf/djvu/xps/oxps, but the file has the inconsistent extension: %1.',
        errorInconsistentExt: 'An error has occurred while opening the file.<br>The file content does not match the file extension.',
        titleLicenseExp: 'License expired',
        titleLicenseNotActive: 'License not active',
        warnLicenseBefore: 'License not active. Please contact your administrator.',
        warnLicenseExp: 'Your license has expired. Please update your license and refresh the page.',
        errorEditingDownloadas: 'An error occurred during the work with the document.<br>Use the \'Download as...\' option to save the file backup copy to your computer hard drive.',
        errorToken: 'The document security token is not correctly formed.<br>Please contact your Document Server administrator.'
    }
})();