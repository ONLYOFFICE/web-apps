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
DE.ApplicationController = new(function(){
    var me,
        api,
        config = {},
        docConfig = {},
        embedConfig = {},
        permissions = {},
        maxPages = 0,
        created = false,
        ttOffset = [0, -10],
        labelDocName,
        appOptions = {},
        btnSubmit,
        _submitFail, $submitedTooltip, $requiredTooltip,
        $listControlMenu, listControlItems = [], listObj,
        bodyWidth = 0;

    var LoadingDocument = -256;

    // Initialize analytics
    // -------------------------

//    Common.Analytics.initialize('UA-12442749-13', 'Embedded Document Editor');


    // Check browser
    // -------------------------

    if (typeof isBrowserSupported !== 'undefined' && !isBrowserSupported()){
        Common.Gateway.reportError(undefined, this.unsupportedBrowserErrorText);
        return;
    }

    common.localStorage.setId('text');
    common.localStorage.setKeysFilter('de-,asc.text');
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
            $('#editor_sdk').addClass('bottom');
            $('#box-tools').removeClass('dropdown').addClass('dropup');
            ttOffset[1] = -40;
        } else {
            $('#toolbar').addClass('top');
            $('#editor_sdk').addClass('top');
            ttOffset[1] = 40;
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

            var type = /^(?:(pdf|djvu|xps|oxps))$/.exec(docConfig.fileType);
            if (type && typeof type[1] === 'string') {
                permissions.edit = permissions.review = false;
            }

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

    function onCountPages(count) {
        maxPages = count;
        $('#pages').text(me.textOf + " " + count);
    }

    function onCurrentPage(number) {
        $('#page-number').val(number + 1);
    }

    function onLongActionBegin(type, id) {
        var text = '';
        switch (id)
        {
            case Asc.c_oAscAsyncAction['Print']:
                text = me.downloadTextText;
                break;
            case Asc.c_oAscAsyncAction['Submit']:
                    _submitFail = false;
                    $submitedTooltip && $submitedTooltip.hide();
                    btnSubmit.attr({disabled: true});
                    btnSubmit.css("pointer-events", "none");
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
        if (id==Asc.c_oAscAsyncAction['Submit']) {
            btnSubmit.removeAttr('disabled');
            btnSubmit.css("pointer-events", "auto");
            if (!_submitFail) {
                if (!$submitedTooltip) {
                    $submitedTooltip = $('<div class="submit-tooltip" style="display:none;">' + me.textSubmited + '</div>');
                    $(document.body).append($submitedTooltip);
                    $submitedTooltip.on('click', function() {$submitedTooltip.hide();});
                }
                $submitedTooltip.show();
            }
        }
        me.loadMask && me.loadMask.hide();
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
            var type = data.get_Type();
            if (type == Asc.c_oAscMouseMoveDataTypes.Hyperlink || type==Asc.c_oAscMouseMoveDataTypes.Form) { // hyperlink
                me.isHideBodyTip = false;

                var str = (type == Asc.c_oAscMouseMoveDataTypes.Hyperlink) ? (me.txtPressLink.replace('%1', common.utils.isMac ? '⌘' : me.textCtrl)) : data.get_FormHelpText();
                if (str.length>500)
                    str = str.substr(0, 500) + '...';
                str = common.utils.htmlEncode(str);

                if ( !$ttEl ) {
                    $ttEl = $('.hyperlink-tooltip');
                    $ttEl.tooltip({'container':'body', 'trigger':'manual'});
                }
                $ttEl.ttpos = [data.get_X(), data.get_Y()];
                if ( !$tooltip)
                    $tooltip = $ttEl.data('bs.tooltip').tip();

                if (!$tooltip.is(':visible')) {
                    var tip = $ttEl.data('bs.tooltip');
                    tip.options.title = str;
                    tip.show([-1000, -1000]);
                } else
                    $tooltip.find('.tooltip-inner')['text'](str);

                var ttHeight = $tooltip.height(),
                    ttWidth = $tooltip.width();
                !bodyWidth && (bodyWidth = $('body').width());

                $ttEl.ttpos[1] -= (ttHeight - ttOffset[1] + 20);
                if ($ttEl.ttpos[0] + ttWidth + 10 >bodyWidth) {
                    $ttEl.ttpos[0] = bodyWidth - ttWidth - 5;
                    if ($ttEl.ttpos[1] < 0)
                        $ttEl.ttpos[1] += ttHeight + ttOffset[1] + 20;
                } else if ($ttEl.ttpos[1] < 0) {
                    $ttEl.ttpos[1] = 0;
                    $ttEl.ttpos[0] += 20;
                }
                $tooltip.css({
                    left: $ttEl.ttpos[0],
                    top: $ttEl.ttpos[1]
                });
            }
        }
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

    function onFillRequiredFields(isFilled) {
        if (isFilled) {
            btnSubmit.removeAttr('disabled');
            btnSubmit.css("pointer-events", "auto");
            // $requiredTooltip && $requiredTooltip.hide();
        } else {
            btnSubmit.attr({disabled: true});
            btnSubmit.css("pointer-events", "none");
        }
    }

    function onShowContentControlsActions(obj, x, y) {
        switch (obj.type) {
            case Asc.c_oAscContentControlSpecificType.Picture:
                if (obj.pr && obj.pr.get_Lock) {
                    var lock = obj.pr.get_Lock();
                    if (lock == Asc.c_oAscSdtLockType.SdtContentLocked || lock==Asc.c_oAscSdtLockType.ContentLocked)
                        return;
                }
                api.asc_addImage(obj);
                setTimeout(function(){
                    api.asc_UncheckContentControlButtons();
                }, 500);
                break;
            case Asc.c_oAscContentControlSpecificType.DropDownList:
            case Asc.c_oAscContentControlSpecificType.ComboBox:
                onShowListActions(obj, x, y);
                break;
        }
    }

    function onHideContentControlsActions() {
        $listControlMenu && $listControlMenu.hide();
        api.asc_UncheckContentControlButtons();
    }

    function onShowListActions(obj, x, y) {
        var type = obj.type,
            props = obj.pr,
            specProps = (type == Asc.c_oAscContentControlSpecificType.ComboBox) ? props.get_ComboBoxPr() : props.get_DropDownListPr(),
            isForm = !!props.get_FormPr();

        var menuContainer = DE.ApplicationView.getMenuForm();

        if (!$listControlMenu) {
            $listControlMenu = menuContainer.find('ul');
            $listControlMenu.on('click', 'li', function(e) {
                var value = $(e.target).attr('value');
                if (value) {
                    value = parseInt(value);
                    setTimeout(function(){
                        (value!==-1) && api.asc_SelectContentControlListItem(listControlItems[value], listObj.get_InternalId());
                    }, 1);
                }
            });
            $('#editor_sdk').on('click', function(e){
                if (e.target.localName == 'canvas') {
                    if (me._preventClick)
                        me._preventClick = false;
                    else {
                        $listControlMenu && $listControlMenu.hide();
                        api.asc_UncheckContentControlButtons();
                    }
                }
            });
        }
        $listControlMenu.find('li').remove();
        listControlItems = [];
        listObj = props;

        if (specProps) {
            var k = 0;
            if (isForm){ // for dropdown and combobox form control always add placeholder item
                var text = props.get_PlaceholderText();
                $listControlMenu.append('<li><a tabindex="-1" type="menuitem" style="opacity: 0.6" value="0">' +
                                        ((text.trim()!=='') ? text : me.txtEmpty) +
                                        '</a></li>');
                listControlItems.push('');
            }
            var count = specProps.get_ItemsCount();
            k = listControlItems.length;
            for (var i=0; i<count; i++) {
                if (specProps.get_ItemValue(i)!=='' || !isForm) {
                    $listControlMenu.append('<li><a tabindex="-1" type="menuitem" value="' + (i+k) + '">' +
                        common.utils.htmlEncode(specProps.get_ItemDisplayText(i)) +
                        '</a></li>');
                    listControlItems.push(specProps.get_ItemValue(i));
                }
            }
            if (!isForm && listControlItems.length<1) {
                $listControlMenu.append('<li><a tabindex="-1" type="menuitem" value="0">' +
                                        me.txtEmpty +
                                        '</a></li>');
                listControlItems.push(-1);
            }
        }

        menuContainer.css({left: x, top : y});
        me._preventClick = true;
        $listControlMenu.show();
    }

    function hidePreloader() {
        $('#loading-mask').fadeOut('slow');
    }

    function onDocumentContentReady() {
        hidePreloader();
        onLongActionEnd(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);

        var zf = (config.customization && config.customization.zoom ? parseInt(config.customization.zoom) : -2);
        (zf == -1) ? api.zoomFitToPage() : ((zf == -2) ? api.zoomFitToWidth() : api.zoom(zf>0 ? zf : 100));

        var dividers = $('#box-tools .divider');
        var itemsCount = $('#box-tools a').length;

        if ( permissions.print === false) {
            $('#idt-print').hide();
            itemsCount--;
        }

        if ( !embedConfig.saveUrl || permissions.download === false || appOptions.canFillForms) {
            $('#idt-download').hide();
            itemsCount--;
        }

        if ( !appOptions.canFillForms || permissions.download === false) {
            $('#idt-download-docx').hide();
            itemsCount --;
        }

        if ( !appOptions.canFillForms && !appOptions.isOForm || permissions.download === false) {
            $('#idt-download-pdf').hide();
            itemsCount --;
        }

        if ( !embedConfig.shareUrl || appOptions.canFillForms) {
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

        if ( !embedConfig.embedUrl || appOptions.canFillForms) {
            $('#idt-embed').hide();
            itemsCount--;
        }

        if ( !embedConfig.fullscreenUrl ) {
            $('#idt-fullscreen').hide();
            itemsCount--;
        }

        if (itemsCount<1)
            $('#box-tools').addClass('hidden');
        else if ((!embedConfig.embedUrl || appOptions.canFillForms) && !embedConfig.fullscreenUrl)
            $(dividers[2]).hide();

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
        api.asc_registerCallback('sync_onAllRequiredFormsFilled', onFillRequiredFields);
        if (appOptions.canFillForms) {
            api.asc_registerCallback('asc_onShowContentControlsActions', onShowContentControlsActions);
            api.asc_registerCallback('asc_onHideContentControlsActions', onHideContentControlsActions);
            api.asc_SetHighlightRequiredFields(true);
        }

        Common.Gateway.on('processmouse',       onProcessMouse);
        Common.Gateway.on('downloadas',         onDownloadAs);
        Common.Gateway.on('requestclose',       onRequestClose);

        DE.ApplicationView.tools.get('#idt-fullscreen')
            .on('click', function(){
                common.utils.openLink(embedConfig.fullscreenUrl);
            });

        DE.ApplicationView.tools.get('#idt-download')
            .on('click', function(){
                    if ( !!embedConfig.saveUrl && permissions.download !== false){
                        common.utils.openLink(embedConfig.saveUrl);
                    }

                    Common.Analytics.trackEvent('Save');
            });

        DE.ApplicationView.tools.get('#idt-print')
            .on('click', function(){
                api.asc_Print(new Asc.asc_CDownloadOptions(null, $.browser.chrome || $.browser.safari || $.browser.opera || $.browser.mozilla && $.browser.versionNumber>86));
                Common.Analytics.trackEvent('Print');
            });

        DE.ApplicationView.tools.get('#idt-close')
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

        var downloadAs =  function(format){
            api.asc_DownloadAs(new Asc.asc_CDownloadOptions(format));
            Common.Analytics.trackEvent('Save');
        };

        DE.ApplicationView.tools.get('#idt-download-docx')
            .on('click', function(){
                downloadAs(Asc.c_oAscFileType.DOCX);
            });
        DE.ApplicationView.tools.get('#idt-download-pdf')
            .on('click', function(){
                downloadAs(Asc.c_oAscFileType.PDF);
            });

        DE.ApplicationView.tools.get('#idt-search')
            .on('click', function(){
                common.controller.SearchBar.show();
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

        // TODO: add asc_hasRequiredFields to sdk

        if (appOptions.canSubmitForms && appOptions.canFillForms && !api.asc_IsAllRequiredFormsFilled()) {
            var sgroup = $('#id-submit-group');
            btnSubmit.attr({disabled: true});
            btnSubmit.css("pointer-events", "none");
            if (!common.localStorage.getItem("de-embed-hide-submittip")) {
                var offset = btnSubmit.offset();
                $requiredTooltip = $('<div class="required-tooltip bottom-left" style="display:none;"><div class="tip-arrow bottom-left"></div><div>' + me.textRequired + '</div><div class="close-div">' + me.textGotIt + '</div></div>');
                $(document.body).append($requiredTooltip);
                $requiredTooltip.css({top : offset.top + btnSubmit.height() + 'px', left: offset.left + btnSubmit.outerWidth()/2 - $requiredTooltip.outerWidth() + 'px'});
                $requiredTooltip.find('.close-div').on('click', function() {
                    $requiredTooltip.hide();
                    api.asc_MoveToFillingForm(true, true, true);
                    common.localStorage.setItem("de-embed-hide-submittip", 1);
                    sgroup.attr('data-toggle', 'tooltip');
                    sgroup.tooltip({
                        title       : me.textRequired,
                        placement   : 'bottom'
                    });
                });
                $requiredTooltip.show();
            } else {
                sgroup.attr('data-toggle', 'tooltip');
                sgroup.tooltip({
                    title       : me.textRequired,
                    placement   : 'bottom'
                });
            }
        }

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

        if (appOptions.isOForm && permissions.download!==false) {
            $('#id-critical-error-title').text(me.notcriticalErrorTitle);
            $('#id-critical-error-message').html(me.textConvertFormDownload);
            $('#id-critical-error-close').text(me.textDownloadPdf).off().on('click', function(){
                downloadAs(Asc.c_oAscFileType.PDF);
                $('#id-critical-error-dialog').modal('hide');
            });
            $('#id-critical-error-dialog').modal('show');
        }

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
            $('#id-critical-error-dialog button.close').remove();
            $('#id-critical-error-dialog').css('z-index', 20002).modal({backdrop: 'static', keyboard: false, show: true});
            return;
        }

        appOptions.canLicense     = (licType === Asc.c_oLicenseResult.Success || licType === Asc.c_oLicenseResult.SuccessLimit);
        appOptions.canFillForms   = false; // use forms editor for filling forms
        appOptions.canSubmitForms = appOptions.canLicense && (typeof (config.customization) == 'object') && !!config.customization.submitForm;
        appOptions.canBranding  = params.asc_getCustomization();
        appOptions.canBranding && setBranding(config.customization);

        var type = /^(?:(docxf|oform))$/.exec(docConfig.fileType);
        appOptions.isOForm = !!(type && typeof type[1] === 'string'); // oform and docxf

        api.asc_setViewMode(!appOptions.canFillForms);

        btnSubmit = $('#id-btn-submit');

        if (!appOptions.canFillForms) {
            $('#id-btn-prev-field').hide();
            $('#id-btn-next-field').hide();
            $('#id-btn-clear-fields').hide();
            btnSubmit.hide();
        } else {
            $('#id-btn-next-field .caption').text(me.textNext);
            $('#id-btn-clear-fields .caption').text(me.textClear);

            $('#id-btn-prev-field').on('click', function(){
                api.asc_MoveToFillingForm(false);
            });
            $('#id-btn-next-field').on('click', function(){
                api.asc_MoveToFillingForm(true);
            });
            $('#id-btn-clear-fields').on('click', function(){
                api.asc_ClearAllSpecialForms();
            });

            if (appOptions.canSubmitForms) {
                btnSubmit.find('.caption').text(me.textSubmit);
                btnSubmit.on('click', function(){
                    api.asc_SendForm();
                });
            } else
                btnSubmit.hide();

            api.asc_setRestriction(Asc.c_oAscRestrictionType.OnlyForms);
            api.asc_SetFastCollaborative(true);
            api.asc_setAutoSaveGap(1);
        }

        var $parent = labelDocName.parent();
        var _left_width = $parent.position().left,
            _right_width = $parent.next().outerWidth();

        if ( _left_width < _right_width )
            $parent.css('padding-left', parseFloat($parent.css('padding-left')) + _right_width - _left_width);
        else
            $parent.css('padding-right', parseFloat($parent.css('padding-right')) + _left_width - _right_width);

        onLongActionBegin(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);

        api.asc_LoadDocument();
        api.Resize();
    }

    function onOpenDocument(progress) {
        var proc = (progress.asc_getCurrentFont() + progress.asc_getCurrentImage())/(progress.asc_getFontsCount() + progress.asc_getImagesCount());
        me.loadMask && me.loadMask.setTitle(me.textLoadingDocument + ': ' + common.utils.fixedDigits(Math.min(Math.round(proc*100), 100), 3, "  ") + '%');
    }

    function onAdvancedOptions(type, advOptions, mode, formatOptions) {
        if (type == Asc.c_oAscAdvancedOptionsID.DRM) {
            var isCustomLoader = !!config.customization.loaderName || !!config.customization.loaderLogo;
            var submitPassword = function(val) {
                api && api.asc_setAdvancedOptions(Asc.c_oAscAdvancedOptionsID.DRM, new Asc.asc_CDRMAdvancedOptions(val)); 
                me.loadMask && me.loadMask.show();
                if(!isCustomLoader) {
                    $('#loading-mask').addClass("end-animation");
                    $('#loading-mask').removeClass("none-animation");
                }
            };
            common.controller.modals.createDlgPassword(submitPassword);
            if(isCustomLoader) {
                hidePreloader();
            } else {
                $('#loading-mask').removeClass("end-animation");
                $('#loading-mask').addClass("none-animation");
            }
            onLongActionEnd(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);
        } else if (type == Asc.c_oAscAdvancedOptionsID.TXT) {
            api && api.asc_setAdvancedOptions(Asc.c_oAscAdvancedOptionsID.TXT, advOptions.asc_getRecommendedSettings() || new Asc.asc_CTextOptions());
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
            $('#id-critical-error-dialog button.close').remove();
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

            case Asc.c_oAscError.ID.Submit:
                message = me.errorSubmit;
                _submitFail = true;
                $submitedTooltip && $submitedTooltip.hide();
                break;

            case Asc.c_oAscError.ID.EditingError:
                message = me.errorEditingDownloadas;
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
            $('#id-critical-error-dialog button.close').remove();
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
            Common.Gateway.reportError(Asc.c_oAscError.ID.AccessDeny, me.errorAccessDeny);
            return;
        }
        if (api) {
            var options = new Asc.asc_CDownloadOptions(Asc.c_oAscFileType.DOCX, true);
            options.asc_setIsSaveAs(true);
            api.asc_DownloadAs(options);
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
        api && api.Resize();
        bodyWidth = $('body').width();
    }

    function createController(){
        if (created)
            return me;

        me = this;
        created = true;

        $(window).resize(function(){
            onDocumentResize();
        });
        window.onbeforeunload = onBeforeUnload;

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
        var result = /[\?\&]fileType=\b(pdf)|(djvu|xps|oxps)\b&?/i.exec(window.location.search),
            isPDF = (!!result && result.length && typeof result[2] === 'string') || (!!result && result.length && typeof result[1] === 'string') && !window.isPDFForm;

        api = isPDF ? new Asc.PDFEditorApi({
            'id-view'  : 'editor_sdk',
            'embedded' : true
        }) : new Asc.asc_docs_api({
            'id-view'  : 'editor_sdk',
            'embedded' : true
        });

        if (api){
            api.asc_registerCallback('asc_onError',                 onError);
            api.asc_registerCallback('asc_onDocumentContentReady',  onDocumentContentReady);
            api.asc_registerCallback('asc_onOpenDocumentProgress',  onOpenDocument);
            api.asc_registerCallback('asc_onAdvancedOptions',       onAdvancedOptions);

            api.asc_registerCallback('asc_onCountPages',            onCountPages);
//            api.asc_registerCallback('OnCurrentVisiblePage',    onCurrentPage);
            api.asc_registerCallback('asc_onCurrentPage',           onCurrentPage);

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
        downloadTextText: 'Downloading document...',
        waitText: 'Please, wait...',
        textLoadingDocument: 'Loading document',
        txtClose: 'Close',
        errorFileSizeExceed: 'The file size exceeds the limitation set for your server.<br>Please contact your Document Server administrator for details.',
        errorUpdateVersionOnDisconnect: 'Internet connection has been restored, and the file version has been changed.<br>Before you can continue working, you need to download the file or copy its content to make sure nothing is lost, and then reload this page.',
        textNext: 'Next Field',
        textClear: 'Clear All Fields',
        textSubmit: 'Submit',
        textSubmited: '<b>Form submitted successfully</b><br>Click to close the tip.',
        errorSubmit: 'Submit failed.',
        errorEditingDownloadas: 'An error occurred during the work with the document.<br>Use the \'Download as...\' option to save the file backup copy to your computer hard drive.',
        textGuest: 'Guest',
        textAnonymous: 'Anonymous',
        textRequired: 'Fill all required fields to send form.',
        textGotIt: 'Got it',
        errorForceSave: "An error occurred while saving the file. Please use the 'Download as' option to save the file to your computer hard drive or try again later.",
        txtEmpty: '(Empty)',
        txtPressLink: 'Press %1 and click link',
        errorLoadingFont: 'Fonts are not loaded.<br>Please contact your Document Server administrator.',
        errorTokenExpire: 'The document security token has expired.<br>Please contact your Document Server administrator.',
        openErrorText: 'An error has occurred while opening the file',
        textCtrl: 'Ctrl',
        errorInconsistentExtDocx: 'An error has occurred while opening the file.<br>The file content corresponds to text documents (e.g. docx), but the file has the inconsistent extension: %1.',
        errorInconsistentExtXlsx: 'An error has occurred while opening the file.<br>The file content corresponds to spreadsheets (e.g. xlsx), but the file has the inconsistent extension: %1.',
        errorInconsistentExtPptx: 'An error has occurred while opening the file.<br>The file content corresponds to presentations (e.g. pptx), but the file has the inconsistent extension: %1.',
        errorInconsistentExtPdf: 'An error has occurred while opening the file.<br>The file content corresponds to one of the following formats: pdf/djvu/xps/oxps, but the file has the inconsistent extension: %1.',
        errorInconsistentExt: 'An error has occurred while opening the file.<br>The file content does not match the file extension.',
        titleLicenseExp: 'License expired',
        titleLicenseNotActive: 'License not active',
        warnLicenseBefore: 'License not active. Please contact your administrator.',
        warnLicenseExp: 'Your license has expired. Please update your license and refresh the page.',
        textConvertFormDownload: 'Download file as a fillable PDF form to be able to fill it out.',
        textDownloadPdf: 'Download pdf',
        errorToken: 'The document security token is not correctly formed.<br>Please contact your Document Server administrator.'
    }
})();