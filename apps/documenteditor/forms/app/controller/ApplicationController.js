define([
    'core',
    'irregularstack',
    'gateway',
    'common/main/lib/component/Window',
    'common/main/lib/component/LoadMask',
    'common/main/lib/component/Tooltip',
    'common/main/lib/util/LocalStorage',
    'common/main/lib/util/Shortcuts',
    'documenteditor/forms/app/view/ApplicationView'
], function (Viewport) {
    'use strict';

    var LoadingDocument = -256,
        maxPages = 0,
        labelDocName,
        btnSubmit,
        _submitFail, $submitedTooltip, $requiredTooltip,
        $ttEl, $tooltip,
        $listControlMenu, listControlItems = [], listObj,
        bodyWidth = 0,
        ttOffset = [0, -10];

    DE.Controllers.ApplicationController = Backbone.Controller.extend(_.assign({
        views: [
            'ApplicationView'
        ],

        initialize: function() {
            var me = this,
                styleNames = ['Normal', 'No Spacing', 'Heading 1', 'Heading 2', 'Heading 3', 'Heading 4', 'Heading 5',
                    'Heading 6', 'Heading 7', 'Heading 8', 'Heading 9', 'Title', 'Subtitle', 'Quote', 'Intense Quote', 'List Paragraph', 'footnote text',
                    'Caption', 'endnote text'],
                translate = {
                    'Series': this.txtSeries,
                    'Diagram Title': this.txtDiagramTitle,
                    'X Axis': this.txtXAxis,
                    'Y Axis': this.txtYAxis,
                    'Your text here': this.txtArt,
                    "Error! Bookmark not defined.": this.txtBookmarkError,
                    "above": this.txtAbove,
                    "below": this.txtBelow,
                    "on page ": this.txtOnPage + " ",
                    "Header": this.txtHeader,
                    "Footer": this.txtFooter,
                    " -Section ": " " + this.txtSection + " ",
                    "First Page ": this.txtFirstPage + " ",
                    "Even Page ": this.txtEvenPage + " ",
                    "Odd Page ": this.txtOddPage + " ",
                    "Same as Previous": this.txtSameAsPrev,
                    "Current Document": this.txtCurrentDocument,
                    "No table of contents entries found.": this.txtNoTableOfContents,
                    "Table of Contents": this.txtTableOfContents,
                    "Syntax Error": this.txtSyntaxError,
                    "Missing Operator": this.txtMissOperator,
                    "Missing Argument": this.txtMissArg,
                    "Number Too Large To Format": this.txtTooLarge,
                    "Zero Divide": this.txtZeroDivide,
                    "Is Not In Table": this.txtNotInTable,
                    "Index Too Large": this.txtIndTooLarge,
                    "The Formula Not In Table": this.txtFormulaNotInTable,
                    "Table Index Cannot be Zero": this.txtTableInd,
                    "Undefined Bookmark": this.txtUndefBookmark,
                    "Unexpected End of Formula": this.txtEndOfFormula,
                    "Hyperlink": this.txtHyperlink,
                    "Error! Main Document Only.": this.txtMainDocOnly,
                    "Error! Not a valid bookmark self-reference.": this.txtNotValidBookmark,
                    "Error! No text of specified style in document.": this.txtNoText,
                    "Choose an item": this.txtChoose,
                    "Enter a date": this.txtEnterDate,
                    "Type equation here": this.txtTypeEquation,
                    "Click to load image": this.txtClickToLoad,
                    "None": this.txtNone,
                    "No table of figures entries found.": this.txtNoTableOfFigures,
                    "table of figures": this.txtTableOfFigures,
                    "TOC Heading": this.txtTOCHeading
                };
            styleNames.forEach(function(item){
                translate[item] = me['txtStyle_' + item.replace(/ /g, '_')] || item;
            });
            me.translationTable = translate;
        },

        onLaunch: function() {
            if (!Common.Utils.isBrowserSupported()){
                Common.Utils.showBrowserRestriction();
                Common.Gateway.reportError(undefined, this.unsupportedBrowserErrorText);
                return;
            }

            this.stackLongActions = new Common.IrregularStack({
                strongCompare   : function(obj1, obj2){return obj1.id === obj2.id && obj1.type === obj2.type;},
                weakCompare     : function(obj1, obj2){return obj1.type === obj2.type;}
            });

            this._state = {isDisconnected: false, licenseType: false};

            this.view = this.createView('ApplicationView').render();

            window["flat_desine"] = true;
            this.api = new Asc.asc_docs_api({
                'id-view'  : 'editor_sdk',
                'embedded' : true
                // ,
                // 'translate': this.translationTable
            });

            $(window).on('resize', this.onDocumentResize.bind(this));

            this.boxSdk = $('#editor_sdk');
            // this.boxSdk.css('border-left', 'none');
            this.boxSdk.on('click', function(e) {
                if ( e.target.localName == 'canvas' ) {
                    e.currentTarget.focus();
                }
            });

            this.editorConfig = {};
            this.embedConfig = {};
            this.appOptions = {};

            if (this.api){
                this.api.asc_registerCallback('asc_onError',                 this.onError.bind(this));
                this.api.asc_registerCallback('asc_onDocumentContentReady',  this.onDocumentContentReady.bind(this));
                this.api.asc_registerCallback('asc_onOpenDocumentProgress',  this.onOpenDocument.bind(this));
                this.api.asc_registerCallback('asc_onDocumentUpdateVersion', this.onUpdateVersion.bind(this));
                this.api.asc_registerCallback('asc_onServerVersion',         this.onServerVersion.bind(this));

                this.api.asc_registerCallback('asc_onCountPages',            this.onCountPages.bind(this));
                this.api.asc_registerCallback('asc_onCurrentPage',           this.onCurrentPage.bind(this));

                // Initialize api gateway
                Common.Gateway.on('init',               this.loadConfig.bind(this));
                Common.Gateway.on('opendocument',       this.loadDocument.bind(this));
                Common.Gateway.on('showmessage',        this.onExternalMessage.bind(this));
                Common.Gateway.appReady();
            }

            var me = this;
            Common.NotificationCenter.on({
                'modal:show': function(){
                    Common.Utils.ModalWindow.show();
                    me.api.asc_enableKeyEvents(false);
                },
                'modal:close': function(dlg) {
                    Common.Utils.ModalWindow.close();
                    if (!Common.Utils.ModalWindow.isVisible())
                        me.api.asc_enableKeyEvents(true);
                },
                'modal:hide': function(dlg) {
                    Common.Utils.ModalWindow.close();
                    if (!Common.Utils.ModalWindow.isVisible())
                        me.api.asc_enableKeyEvents(true);
                },
                'dataview:blur': function(e){
                    if (!Common.Utils.ModalWindow.isVisible()) {
                        me.api.asc_enableKeyEvents(true);
                    }
                },
                'menu:hide': function(e, isFromInputControl){
                    if (!Common.Utils.ModalWindow.isVisible() && !isFromInputControl)
                        me.api.asc_enableKeyEvents(true);
                }
            });

            $(document.body).on('blur', 'input, textarea', function(e) {
                if (!Common.Utils.ModalWindow.isVisible()) {
                    if (!/area_id/.test(e.target.id) ) {
                        me.api.asc_enableKeyEvents(true);
                    }
                }
            });

            window.onbeforeunload = _.bind(this.onBeforeUnload, this);
        },

        onDocumentResize: function() {
            this.api && this.api.Resize();
            bodyWidth = $('body').width();
        },

        onBeforeUnload: function() {
            Common.localStorage.save();
        },

        onError: function(id, level, errData) {
            if (id == Asc.c_oAscError.ID.LoadingScriptError) {
                this.showTips([this.scriptLoadError]);
                this.tooltip && this.tooltip.getBSTip().$tip.css('z-index', 10000);
                return;
            }

            this.hidePreloader();
            this.onLongActionEnd(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);

            var config = {
                closable: true
            };

            switch (id)
            {
                case Asc.c_oAscError.ID.Unknown:
                    config.msg = this.unknownErrorText;
                    break;

                case Asc.c_oAscError.ID.ConvertationTimeout:
                    config.msg = this.convertationTimeoutText;
                    break;

                case Asc.c_oAscError.ID.ConvertationError:
                    config.msg = this.convertationErrorText;
                    break;

                case Asc.c_oAscError.ID.DownloadError:
                    config.msg = this.downloadErrorText;
                    break;

                case Asc.c_oAscError.ID.ConvertationPassword:
                    config.msg = this.errorFilePassProtect;
                    break;

                case Asc.c_oAscError.ID.UserDrop:
                    config.msg = this.errorUserDrop;
                    break;

                case Asc.c_oAscError.ID.ConvertationOpenLimitError:
                    config.msg = this.errorFileSizeExceed;
                    break;

                case Asc.c_oAscError.ID.UpdateVersion:
                    config.msg = this.errorUpdateVersionOnDisconnect;
                    break;

                case Asc.c_oAscError.ID.AccessDeny:
                    config.msg = this.errorAccessDeny;
                    break;

                case Asc.c_oAscError.ID.Submit:
                    config.msg = this.errorSubmit;
                    // _submitFail = true;
                    // $submitedTooltip && $submitedTooltip.hide();
                    break;

                case Asc.c_oAscError.ID.EditingError:
                    config.msg = this.errorEditingDownloadas;
                    break;

                case Asc.c_oAscError.ID.ForceSaveButton:
                case Asc.c_oAscError.ID.ForceSaveTimeout:
                    config.msg = this.errorForceSave;
                    break;

                default:
                    config.msg = (typeof id == 'string') ? id : this.errorDefaultMessage.replace('%1', id);
                    break;
            }

            if (level == Asc.c_oAscError.Level.Critical) {

                // report only critical errors
                Common.Gateway.reportError(id, config.msg);

                config.title = this.criticalErrorTitle;
                config.iconCls = 'error';
                config.closable = false;
                config.callback = _.bind(function(btn){
                    window.location.reload();
                }, this);

                if (id == Asc.c_oAscError.ID.DataEncrypted) {
                    this.api.asc_coAuthoringDisconnect();
                    Common.NotificationCenter.trigger('api:disconnect');
                }
            }
            else {
                Common.Gateway.reportWarning(id, config.msg);

                config.title    = this.notcriticalErrorTitle;
                config.iconCls  = 'warn';
                config.buttons  = ['ok'];
                config.callback = _.bind(function(btn){
                    if (id == Asc.c_oAscError.ID.EditingError) {
                        Common.NotificationCenter.trigger('api:disconnect', true); // enable download and print
                    }
                    this.onEditComplete();
                }, this);
            }

            if (!Common.Utils.ModalWindow.isVisible() || $('.asc-window.modal.alert[data-value=' + id + ']').length<1)
                Common.UI.alert(config).$window.attr('data-value', id);

            (id!==undefined) && Common.component.Analytics.trackEvent('Internal Error', id.toString());
        },

        hidePreloader: function() {
            (new Promise(function(resolve, reject) {
                resolve();
            })).then(function() {
                $('#loading-mask').hide().remove();
            });
        },

        onOpenDocument: function(progress) {
            var elem = document.getElementById('loadmask-text');
            var proc = (progress.asc_getCurrentFont() + progress.asc_getCurrentImage())/(progress.asc_getFontsCount() + progress.asc_getImagesCount());
            proc = this.textLoadingDocument + ': ' + Common.Utils.String.fixedDigits(Math.min(Math.round(proc*100), 100), 3, "  ") + "%";
            elem ? elem.innerHTML = proc : this.loadMask && this.loadMask.setTitle(proc);
        },

        onCountPages: function(count) {
            maxPages = count;
            $('#pages').text(this.textOf + " " + count);
        },

        onCurrentPage: function(number) {
            $('#page-number').val(number + 1);
        },

        loadConfig: function(data) {
            this.editorConfig = $.extend(this.editorConfig, data.config);
            this.embedConfig = $.extend(this.embedConfig, data.config.embedded);

            // common.controller.modals.init(this.embedConfig);

            // Docked toolbar
            if (this.embedConfig.toolbarDocked === 'bottom') {
                $('#toolbar').addClass('bottom');
                this.boxSdk.addClass('bottom');
                ttOffset[1] = -40;
            } else {
                $('#toolbar').addClass('top');
                this.boxSdk.addClass('top');
                ttOffset[1] = 40;
            }

            this.appOptions.customization   = this.editorConfig.customization;
            this.appOptions.canRenameAnonymous = !((typeof (this.appOptions.customization) == 'object') && (typeof (this.appOptions.customization.anonymous) == 'object') && (this.appOptions.customization.anonymous.request===false));
            this.appOptions.guestName = (typeof (this.appOptions.customization) == 'object') && (typeof (this.appOptions.customization.anonymous) == 'object') &&
            (typeof (this.appOptions.customization.anonymous.label) == 'string') && this.appOptions.customization.anonymous.label.trim()!=='' ?
                Common.Utils.String.htmlEncode(this.appOptions.customization.anonymous.label) : this.textGuest;
            var value;
            if (this.appOptions.canRenameAnonymous) {
                value = Common.localStorage.getItem("guest-username");
                Common.Utils.InternalSettings.set("guest-username", value);
                Common.Utils.InternalSettings.set("save-guest-username", !!value);
            }
            this.editorConfig.user          =
            this.appOptions.user            = Common.Utils.fillUserInfo(this.editorConfig.user, this.editorConfig.lang, value ? (value + ' (' + this.appOptions.guestName + ')' ) : this.textAnonymous,
                    Common.localStorage.getItem("guest-id") || ('uid-' + Date.now()));
            this.appOptions.user.anonymous && Common.localStorage.setItem("guest-id", this.appOptions.user.id);

            this.appOptions.canRequestClose = this.editorConfig.canRequestClose;
            this.appOptions.canBackToFolder = (this.editorConfig.canBackToFolder!==false) && (typeof (this.editorConfig.customization) == 'object') && (typeof (this.editorConfig.customization.goback) == 'object')
                                                && (!_.isEmpty(this.editorConfig.customization.goback.url) || this.editorConfig.customization.goback.requestClose && this.appOptions.canRequestClose);
        },

        onExternalMessage: function(msg) {
            if (msg && msg.msg) {
                msg.msg = (msg.msg).toString();
                this.showTips([msg.msg.charAt(0).toUpperCase() + msg.msg.substring(1)]);

                Common.component.Analytics.trackEvent('External Error');
            }
        },

        showTips: function(strings) {
            var me = this;
            if (!strings.length) return;
            if (typeof(strings)!='object') strings = [strings];

            function showNextTip() {
                var str_tip = strings.shift();
                if (str_tip) {
                    str_tip += '\n' + me.textCloseTip;
                    tooltip.setTitle(str_tip);
                    tooltip.show();
                }
            }

            if (!this.tooltip) {
                this.tooltip = new Common.UI.Tooltip({
                    owner: $('#toolbar'),
                    hideonclick: true,
                    placement: 'bottom',
                    cls: 'main-info',
                    offset: 30
                });
            }

            var tooltip = this.tooltip;
            tooltip.on('tooltip:hide', function(){
                setTimeout(showNextTip, 300);
            });

            showNextTip();
        },

        loadDocument: function(data) {
            this.permissions = {};
            this.document = data.doc;

            var docInfo = {};

            if (data.doc) {
                this.permissions = $.extend(this.permissions, data.doc.permissions);

                var _permissions = $.extend({}, data.doc.permissions),
                    _options = $.extend({}, data.doc.options, this.editorConfig.actionLink || {});

                var _user = new Asc.asc_CUserInfo();
                _user.put_Id(this.appOptions.user.id);
                _user.put_FullName(this.appOptions.user.fullname);
                _user.put_IsAnonymousUser(!!this.appOptions.user.anonymous);

                docInfo = new Asc.asc_CDocInfo();
                docInfo.put_Id(data.doc.key);
                docInfo.put_Url(data.doc.url);
                docInfo.put_Title(data.doc.title);
                docInfo.put_Format(data.doc.fileType);
                docInfo.put_VKey(data.doc.vkey);
                docInfo.put_Options(_options);
                docInfo.put_UserInfo(_user);
                docInfo.put_CallbackUrl(this.editorConfig.callbackUrl);
                docInfo.put_Token(data.doc.token);
                docInfo.put_Permissions(_permissions);
                docInfo.put_EncryptedInfo(this.editorConfig.encryptionKeys);

                var enable = !this.editorConfig.customization || (this.editorConfig.customization.macros!==false);
                docInfo.asc_putIsEnabledMacroses(!!enable);
                enable = !this.editorConfig.customization || (this.editorConfig.customization.plugins!==false);
                docInfo.asc_putIsEnabledPlugins(!!enable);

                var type = /^(?:(pdf|djvu|xps))$/.exec(data.doc.fileType);
                if (type && typeof type[1] === 'string') {
                    this.permissions.edit = this.permissions.review = false;
                }
            }

            this.api.asc_registerCallback('asc_onGetEditorPermissions', _.bind(this.onEditorPermissions, this));
            // this.api.asc_registerCallback('asc_onLicenseChanged',       _.bind(this.onLicenseChanged, this));
            this.api.asc_registerCallback('asc_onRunAutostartMacroses', _.bind(this.onRunAutostartMacroses, this));
            this.api.asc_setDocInfo(docInfo);
            this.api.asc_getEditorPermissions(this.editorConfig.licenseUrl, this.editorConfig.customerId);
            this.api.asc_enableKeyEvents(true);

            Common.Analytics.trackEvent('Load', 'Start');

            labelDocName = $('#title-doc-name');
            if (data.doc) {
                labelDocName.text(data.doc.title || '')
            }
        },

        onRunAutostartMacroses: function() {
            if (!this.editorConfig.customization || (this.editorConfig.customization.macros!==false)) {
                this.api.asc_runAutostartMacroses();
            }
        },

        onEditorPermissions: function(params) {
            var licType = params.asc_getLicenseType();
            if (Asc.c_oLicenseResult.Expired === licType || Asc.c_oLicenseResult.Error === licType || Asc.c_oLicenseResult.ExpiredTrial === licType) {
                Common.UI.warning({
                    title: this.titleLicenseExp,
                    msg: this.warnLicenseExp,
                    buttons: [],
                    closable: false
                });
                return;
            }
            if (Asc.c_oLicenseResult.ExpiredLimited === licType)
                this._state.licenseType = licType;

            if ( this.onServerVersion(params.asc_getBuildVersion())) return;

            if ( (licType === Asc.c_oLicenseResult.Success) && (typeof this.appOptions.customization == 'object') &&
                this.appOptions.customization && this.appOptions.customization.logo ) {

                var logo = $('#header-logo');
                if (this.appOptions.customization.logo.imageEmbedded) {
                    logo.html('<img src="'+this.appOptions.customization.logo.imageEmbedded+'" style="max-width:124px; max-height:20px;"/>');
                    logo.css({'background-image': 'none', width: 'auto', height: 'auto'});
                }

                if (this.appOptions.customization.logo.url) {
                    logo.attr('href', this.appOptions.customization.logo.url);
                }
            }

            this.permissions.review = (this.permissions.review === undefined) ? (this.permissions.edit !== false) : this.permissions.review;
            if (params.asc_getRights() !== Asc.c_oRights.Edit)
                this.permissions.edit = this.permissions.review = false;

            this.appOptions.canLicense     = (licType === Asc.c_oLicenseResult.Success || licType === Asc.c_oLicenseResult.SuccessLimit);
            this.appOptions.canSubmitForms = this.appOptions.canLicense && (typeof (this.editorConfig.customization) == 'object') && !!this.editorConfig.customization.submitForm;
            this.appOptions.canFillForms   = this.appOptions.canLicense && (this.permissions.fillForms===true) && (this.editorConfig.mode !== 'view');
            this.api.asc_setViewMode(!this.appOptions.canFillForms);

            var type = /^(?:(pdf|djvu|xps))$/.exec(this.document.fileType);
            this.appOptions.canDownloadOrigin = this.permissions.download !== false && (type && typeof type[1] === 'string');
            this.appOptions.canDownload       = this.permissions.download !== false && (!type || typeof type[1] !== 'string');
            this.appOptions.canPrint          = (this.permissions.print !== false);

            this.appOptions.fileKey = this.document.key;

            AscCommon.UserInfoParser.setParser(true);
            AscCommon.UserInfoParser.setCurrentName(this.appOptions.user.fullname);

            btnSubmit = $('#id-btn-submit');

            var me = this;
            if (!this.appOptions.canFillForms) {
                me.view.btnPrev.setVisible(false);
                me.view.btnNext.setVisible(false);
                me.view.btnClear.setVisible(false);
                btnSubmit.hide();
            } else {
                me.view.btnPrev.on('click', function(){
                    me.api.asc_MoveToFillingForm(false);
                });
                me.view.btnNext.on('click', function(){
                    me.api.asc_MoveToFillingForm(true);
                });
                me.view.btnClear.on('click', function(){
                    me.api.asc_ClearAllSpecialForms();
                });

                if (this.appOptions.canSubmitForms) {
                    btnSubmit.find('.caption').text(this.textSubmit);
                    btnSubmit.on('click', function(){
                        me.api.asc_SendForm();
                    });
                } else
                    btnSubmit.hide();

                this.api.asc_setRestriction(Asc.c_oAscRestrictionType.OnlyForms);
                this.api.asc_SetFastCollaborative(true);
                this.api.asc_setAutoSaveGap(1);
            }

            var $parent = labelDocName.parent();
            var _left_width = $parent.position().left,
                _right_width = $parent.next().outerWidth();

            if ( _left_width < _right_width )
                $parent.css('padding-left', _right_width - _left_width);
            else
                $parent.css('padding-right', _left_width - _right_width);

            this.onLongActionBegin(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);

            this.api.asc_LoadDocument();
            this.api.Resize();
        },

        onServerVersion: function(buildVersion) {
            if (this.changeServerVersion) return true;

            if (DocsAPI.DocEditor.version() !== buildVersion && !window.compareVersions) {
                this.changeServerVersion = true;
                Common.UI.warning({
                    title: this.titleServerVersion,
                    msg: this.errorServerVersion,
                    callback: function() {
                        _.defer(function() {
                            Common.Gateway.updateVersion();
                        })
                    }
                });
                return true;
            }
            return false;
        },

        onUpdateVersion: function(callback) {
            var me = this;
            me.needToUpdateVersion = true;
            me.onLongActionEnd(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);
            Common.UI.warning({
                title: this.titleUpdateVersion,
                msg: this.errorUpdateVersion,
                callback: function() {
                    _.defer(function() {
                        Common.Gateway.updateVersion();
                        if (callback) callback.call(me);
                        me.onLongActionBegin(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);
                    })
                }
            });
        },

        onLongActionBegin: function(type, id) {
            var action = {id: id, type: type};
            this.stackLongActions.push(action);
            this.setLongActionView(action);
        },

        setLongActionView: function(action) {
            var title = '', text = '', force = false;

            var text = '';
            switch (action.id)
            {
                case Asc.c_oAscAsyncAction['Print']:
                    text = this.downloadTextText;
                    break;
                case Asc.c_oAscAsyncAction['Submit']:
                    _submitFail = false;
                    $submitedTooltip && $submitedTooltip.hide();
                    btnSubmit.attr({disabled: true});
                    btnSubmit.css("pointer-events", "none");
                    break;
                case LoadingDocument:
                    text = this.textLoadingDocument + '           ';
                    break;
                default:
                    text = this.waitText;
                    break;
            }

            if (action.type == Asc.c_oAscAsyncActionType['BlockInteraction']) {
                if (!this.loadMask)
                    this.loadMask = new Common.UI.LoadMask({owner: $(document.body)});

                this.loadMask.setTitle(text);
                this.loadMask.show();
            }
        },

         onLongActionEnd: function(type, id){
             var action = {id: id, type: type};
             this.stackLongActions.pop(action);

             action = this.stackLongActions.get({type: Asc.c_oAscAsyncActionType.Information});
             action && this.setLongActionView(action);
             action = this.stackLongActions.get({type: Asc.c_oAscAsyncActionType.BlockInteraction});
             action ? this.setLongActionView(action) : this.loadMask && this.loadMask.hide();

             if (id==Asc.c_oAscAsyncAction['Submit']) {
                btnSubmit.removeAttr('disabled');
                btnSubmit.css("pointer-events", "auto");
                if (!_submitFail) {
                    if (!$submitedTooltip) {
                        $submitedTooltip = $('<div class="submit-tooltip" style="display:none;">' + this.textSubmited + '</div>');
                        $(document.body).append($submitedTooltip);
                        $submitedTooltip.on('click', function() {$submitedTooltip.hide();});
                    }
                    $submitedTooltip.show();
                }
            }
        },

        onDocMouseMoveStart: function() {
            this.isHideBodyTip = true;
        },

        onDocMouseMoveEnd: function() {
            if (this.isHideBodyTip) {
                if ( $tooltip ) {
                    $tooltip.tooltip('hide');
                    $tooltip = false;
                }
            }
        },

        onDocMouseMove: function(data) {
            var me = this;
            if (data) {
                var type = data.get_Type();
                if (type == Asc.c_oAscMouseMoveDataTypes.Hyperlink || type==Asc.c_oAscMouseMoveDataTypes.Form) { // hyperlink
                    this.isHideBodyTip = false;

                    var str = (type == Asc.c_oAscMouseMoveDataTypes.Hyperlink) ? me.txtPressLink : data.get_FormHelpText();
                    if (str.length>500)
                        str = str.substr(0, 500) + '...';
                    str = Common.Utils.String.htmlEncode(str);

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
        },

        onDownloadUrl: function(url) {
            Common.Gateway.downloadAs(url);
        },

        onPrint: function() {
            if (!this.appOptions.canPrint || Common.Utils.ModalWindow.isVisible()) return;

            if (this.api)
                this.api.asc_Print(new Asc.asc_CDownloadOptions(null, Common.Utils.isChrome || Common.Utils.isSafari || Common.Utils.isOpera || Common.Utils.isGecko && Common.Utils.firefoxVersion>86)); // if isChrome or isSafari or isOpera == true use asc_onPrintUrl event
            Common.component.Analytics.trackEvent('Print');
        },

        onPrintUrl: function(url) {
            if (this.iframePrint) {
                this.iframePrint.parentNode.removeChild(this.iframePrint);
                this.iframePrint = null;
            }
            if (!this.iframePrint) {
                var me = this;
                this.iframePrint = document.createElement("iframe");
                this.iframePrint.id = "id-print-frame";
                this.iframePrint.style.display = 'none';
                this.iframePrint.style.visibility = "hidden";
                this.iframePrint.style.position = "fixed";
                this.iframePrint.style.right = "0";
                this.iframePrint.style.bottom = "0";
                document.body.appendChild(this.iframePrint);
                this.iframePrint.onload = function() {
                    try {
                        me.iframePrint.contentWindow.focus();
                        me.iframePrint.contentWindow.print();
                        me.iframePrint.contentWindow.blur();
                        window.focus();
                    } catch (e) {
                        me.api.asc_DownloadAs(new Asc.asc_CDownloadOptions(Asc.c_oAscFileType.PDF));
                    }
                };
            }
            if (url) this.iframePrint.src = url;
        },

        onFillRequiredFields: function(isFilled) {
            if (isFilled) {
                btnSubmit.removeAttr('disabled');
                btnSubmit.css("pointer-events", "auto");
                // $requiredTooltip && $requiredTooltip.hide();
            } else {
                btnSubmit.attr({disabled: true});
                btnSubmit.css("pointer-events", "none");
            }
        },

        onProcessMouse: function(data) {
            if (data.type == 'mouseup') {
                var e = document.getElementById('editor_sdk');
                if (e) {
                    var r = e.getBoundingClientRect();
                    this.api.OnMouseUp(
                        data.x - r.left,
                        data.y - r.top
                    );
                }
            }
        },

        onRequestClose: function() {
            Common.Gateway.requestClose();
        },

        onDownloadAs: function() {
            if ( !this.appOptions.canDownload && !this.appOptions.canDownloadOrigin ) {
                Common.Gateway.reportError(Asc.c_oAscError.ID.AccessDeny, this.errorAccessDeny);
                return;
            }
            var type = /^(?:(pdf|djvu|xps))$/.exec(this.document.fileType);
            if (type && typeof type[1] === 'string')
                this.api.asc_DownloadOrigin(true);
            else
                this.api.asc_DownloadAs(new Asc.asc_CDownloadOptions(Asc.c_oAscFileType.DOCX, true));
        },

        onHyperlinkClick: function(url) {
            if (url /*&& me.api.asc_getUrlType(url)>0*/) {
                window.open(url);
            }
        },

        onShowContentControlsActions: function(obj, x, y) {
            var me = this;
            switch (obj.type) {
                case Asc.c_oAscContentControlSpecificType.Picture:
                    if (obj.pr && obj.pr.get_Lock) {
                        var lock = obj.pr.get_Lock();
                        if (lock == Asc.c_oAscSdtLockType.SdtContentLocked || lock==Asc.c_oAscSdtLockType.ContentLocked)
                            return;
                    }
                    this.api.asc_addImage(obj);
                    setTimeout(function(){
                        me.api.asc_UncheckContentControlButtons();
                    }, 500);
                    break;
                case Asc.c_oAscContentControlSpecificType.DropDownList:
                case Asc.c_oAscContentControlSpecificType.ComboBox:
                    this.onShowListActions(obj, x, y);
                    break;
            }
        },

        onHideContentControlsActions: function() {
            $listControlMenu && $listControlMenu.hide();
            this.api.asc_UncheckContentControlButtons();
        },

        onShowListActions: function(obj, x, y) {
            var type = obj.type,
                props = obj.pr,
                specProps = (type == Asc.c_oAscContentControlSpecificType.ComboBox) ? props.get_ComboBoxPr() : props.get_DropDownListPr(),
                isForm = !!props.get_FormPr(),
                me = this;

            var menuContainer = this.view.getMenuForm();

            if (!$listControlMenu) {
                $listControlMenu = menuContainer.find('ul');
                $listControlMenu.on('click', 'li', function(e) {
                    var value = $(e.target).attr('value');
                    if (value) {
                        value = parseInt(value);
                        setTimeout(function(){
                            (value!==-1) && me.api.asc_SelectContentControlListItem(listControlItems[value], listObj.get_InternalId());
                        }, 1);
                    }
                });
                $('#editor_sdk').on('click', function(e){
                    if (e.target.localName == 'canvas') {
                        if (me._preventClick)
                            me._preventClick = false;
                        else {
                            $listControlMenu && $listControlMenu.hide();
                            me.api.asc_UncheckContentControlButtons();
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
                            Common.Utils.String.htmlEncode(specProps.get_ItemDisplayText(i)) +
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
        },

        onDocumentContentReady: function() {
            var me = this;

            this.hidePreloader();
            this.onLongActionEnd(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);

            var zf = (this.appOptions.customization && this.appOptions.customization.zoom ? parseInt(this.appOptions.customization.zoom) : -2);
            (zf == -1) ? this.api.zoomFitToPage() : ((zf == -2) ? this.api.zoomFitToWidth() : this.api.zoom(zf>0 ? zf : 100));

            var menuItems = this.view.btnOptions.menu.items;
            var itemsCount = menuItems.length-3;

            if (!this.appOptions.canPrint) {
                menuItems[0].setVisible(false);
                menuItems[1].setVisible(false);
                itemsCount--;
            }

            if ( !this.embedConfig.saveUrl && !this.appOptions.canPrint || this.appOptions.canFillForms) {
                menuItems[2].setVisible(false);
                itemsCount--;
            }

            if ( !this.appOptions.canFillForms || !this.appOptions.canDownload) {
                menuItems[3].setVisible(false);
                menuItems[4].setVisible(false);
                menuItems[1].setVisible(false);
                menuItems[5].setVisible(false);
                itemsCount -= 2;
            }

            if ( !this.embedConfig.shareUrl || this.appOptions.canFillForms) {
                menuItems[6].setVisible(false);
                itemsCount--;
            }

            if (!this.appOptions.canBackToFolder) {
                menuItems[7].setVisible(false);
                itemsCount--;
            }

            if (itemsCount<3)
                menuItems[8].setVisible(false);

            if ( !this.embedConfig.embedUrl || this.appOptions.canFillForms) {
                menuItems[9].setVisible(false);
                itemsCount--;
            }

            if ( !this.embedConfig.fullscreenUrl ) {
                menuItems[10].setVisible(false);
                itemsCount--;
            }

            if (itemsCount<1)
                this.view.btnOptions.setVisible(false);
            else if ((!this.embedConfig.embedUrl || this.appOptions.canFillForms) && !this.embedConfig.fullscreenUrl)
                menuItems[8].setVisible(false);

            // common.controller.modals.attach({
            //     share: '#idt-share',
            //     embed: '#idt-embed'
            // });

            this.api.asc_registerCallback('asc_onStartAction',           _.bind(this.onLongActionBegin, this));
            this.api.asc_registerCallback('asc_onEndAction',             _.bind(this.onLongActionEnd, this));
            this.api.asc_registerCallback('asc_onMouseMoveStart',        _.bind(this.onDocMouseMoveStart, this));
            this.api.asc_registerCallback('asc_onMouseMoveEnd',          _.bind(this.onDocMouseMoveEnd, this));
            this.api.asc_registerCallback('asc_onMouseMove',             _.bind(this.onDocMouseMove, this));
            this.api.asc_registerCallback('asc_onHyperlinkClick',        _.bind(this.onHyperlinkClick, this));
            this.api.asc_registerCallback('asc_onDownloadUrl',           _.bind(this.onDownloadUrl, this));
            this.api.asc_registerCallback('asc_onPrint',                 _.bind(this.onPrint, this));
            this.api.asc_registerCallback('asc_onPrintUrl',              _.bind(this.onPrintUrl, this));
            this.api.asc_registerCallback('sync_onAllRequiredFormsFilled', _.bind(this.onFillRequiredFields, this));
            if (this.appOptions.canFillForms) {
                this.api.asc_registerCallback('asc_onShowContentControlsActions', _.bind(this.onShowContentControlsActions, this));
                this.api.asc_registerCallback('asc_onHideContentControlsActions', _.bind(this.onHideContentControlsActions, this));
                // this.api.asc_SetHighlightRequiredFields(true);
            }

            Common.Gateway.on('processmouse',       _.bind(this.onProcessMouse, this));
            Common.Gateway.on('downloadas',         _.bind(this.onDownloadAs, this));
            Common.Gateway.on('requestclose',       _.bind(this.onRequestClose, this));

            $('#id-btn-zoom-in').on('click', this.api.zoomIn.bind(this.api));
            $('#id-btn-zoom-out').on('click', this.api.zoomOut.bind(this.api));
            this.view.btnOptions.menu.on('item:click', _.bind(this.onOptionsClick, this));

            var $pagenum = $('#page-number');
            $pagenum.on({
                'keyup': function(e){
                    if ( e.keyCode == 13 ){
                        var newPage = parseInt($('#page-number').val());

                        if ( newPage > maxPages ) newPage = maxPages;
                        if (newPage < 2 || isNaN(newPage)) newPage = 1;

                        me.api.goToPage(newPage-1);
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

            if (this.appOptions.canSubmitForms && !this.api.asc_IsAllRequiredFormsFilled()) {
                var sgroup = $('#id-submit-group');
                btnSubmit.attr({disabled: true});
                btnSubmit.css("pointer-events", "none");
                if (!Common.localStorage.getItem("de-embed-hide-submittip")) {
                    var offset = btnSubmit.offset();
                    $requiredTooltip = $('<div class="required-tooltip bottom-left" style="display:none;"><div class="tip-arrow bottom-left"></div><div>' + me.textRequired + '</div><div class="close-div">' + me.textGotIt + '</div></div>');
                    $(document.body).append($requiredTooltip);
                    $requiredTooltip.css({top : offset.top + btnSubmit.height() + 'px', left: offset.left + btnSubmit.outerWidth()/2 - $requiredTooltip.outerWidth() + 'px'});
                    $requiredTooltip.find('.close-div').on('click', function() {
                        $requiredTooltip.hide();
                        me.api.asc_MoveToFillingForm(true, true, true);
                        Common.localStorage.setItem("de-embed-hide-submittip", 1);
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
            Common.Gateway.documentReady();
            Common.Analytics.trackEvent('Load', 'Complete');
        },

        onOptionsClick: function(menu, item, e) {
            switch (item.value) {
                case 'fullscr':
                    this.onHyperlinkClick(this.embedConfig.fullscreenUrl);
                    break;
                case 'download':
                    if ( !!this.embedConfig.saveUrl ){
                        this.onHyperlinkClick(this.embedConfig.saveUrl);
                    } else if (this.api && this.appOptions.canPrint){
                        this.api.asc_Print(new Asc.asc_CDownloadOptions(null, Common.Utils.isChrome || Common.Utils.isSafari || Common.Utils.isOpera || Common.Utils.isGecko && Common.Utils.firefoxVersion>86)); // if isChrome or isSafari or isOpera == true use asc_onPrintUrl event
                    }
                    Common.Analytics.trackEvent('Save');
                    break;
                case 'print':
                    this.api.asc_Print(new Asc.asc_CDownloadOptions(null, Common.Utils.isChrome || Common.Utils.isSafari || Common.Utils.isOpera || Common.Utils.isGecko && Common.Utils.firefoxVersion>86)); // if isChrome or isSafari or isOpera == true use asc_onPrintUrl event
                    Common.Analytics.trackEvent('Print');
                    break;
                case 'close':
                    if (this.appOptions.customization && this.appOptions.customization.goback) {
                        if (this.appOptions.customization.goback.requestClose && this.appOptions.canRequestClose)
                            Common.Gateway.requestClose();
                        else if (this.appOptions.customization.goback.url)
                            window.parent.location.href = this.appOptions.customization.goback.url;
                    }
                    break;
                case 'download-docx':
                    this.api.asc_DownloadAs(new Asc.asc_CDownloadOptions(Asc.c_oAscFileType.DOCX));
                    Common.Analytics.trackEvent('Save');
                    break;
                case 'download-pdf':
                    this.api.asc_DownloadAs(new Asc.asc_CDownloadOptions(Asc.c_oAscFileType.PDF));
                    Common.Analytics.trackEvent('Save');
                    break;
                case 'share':
                    break;
                case 'embed':
                    break;
            }
        },

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
        textCloseTip: "Click to close the tip.",
        txtPressLink: 'Press Ctrl and click link',
        txtEmpty: '(Empty)'
    }, DE.Controllers.ApplicationController));
});
