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
/**
 *    Main.js
 *
 *    Main controller
 *
 *    Created by Maxim Kadushkin on 24 March 2014
 *    Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'irregularstack',
    'common/main/lib/component/Window',
    'common/main/lib/component/LoadMask',
    'common/main/lib/component/Tooltip',
    'common/main/lib/controller/Fonts',
    'common/main/lib/collection/TextArt',
    'common/main/lib/view/OpenDialog',
    'common/main/lib/util/LanguageInfo',
    'common/main/lib/util/LocalStorage',
    'spreadsheeteditor/main/app/collection/ShapeGroups',
    'spreadsheeteditor/main/app/collection/TableTemplates',
    'spreadsheeteditor/main/app/collection/EquationGroups',
    'spreadsheeteditor/main/app/controller/FormulaDialog',
    'spreadsheeteditor/main/app/view/FormulaLang'
], function () {
    'use strict';

    SSE.Controllers.Main = Backbone.Controller.extend(_.extend((function() {
        var InitApplication = -254;
        var ApplyEditRights = -255;
        var LoadingDocument = -256;

        var mapCustomizationElements = {
            about: 'button#left-btn-about',
            feedback: 'button#left-btn-support',
            goback: '#fm-btn-back > a, #header-back > div'
        };

        var mapCustomizationExtElements = {
            toolbar: '#viewport #toolbar',
            leftMenu: '#viewport #left-menu, #viewport #id-toolbar-full-placeholder-btn-settings, #viewport #id-toolbar-short-placeholder-btn-settings',
            rightMenu: '#viewport #right-menu',
            statusBar: '#statusbar'
        };

        Common.localStorage.setId('table');
        Common.localStorage.setKeysFilter('sse-,asc.table');
        Common.localStorage.sync();

        return {
            models: [],
            collections: [
                'ShapeGroups',
                'EquationGroups',
                'TableTemplates',
                'Common.Collections.TextArt'
            ],
            views: [],

            initialize: function() {
                this.addListeners({
                    'FileMenu': {
                        'settings:apply': _.bind(this.applySettings, this)
                    },
                    'Common.Views.ReviewChanges': {
                        'settings:apply': _.bind(this.applySettings, this)
                    }
                });
            },

            onLaunch: function() {
//                $(document.body).css('position', 'absolute');
                var me = this;

                this._state = {isDisconnected: false, usersCount: 1, fastCoauth: true, lostEditingRights: false, licenseType: false};
                this.translationTable = [];
                this.isModalShowed = 0;

                if (!Common.Utils.isBrowserSupported()){
                    Common.Utils.showBrowserRestriction();
                    Common.Gateway.reportError(undefined, this.unsupportedBrowserErrorText);
                    return;
                } else {
//                    this.getViewport().getEl().on('keypress', this.lockEscapeKey, this);
//                    viewport.applicationUI.setVisible(true);
                }

                var value = Common.localStorage.getItem("sse-settings-fontrender");
                if (value===null) value = window.devicePixelRatio > 1 ? '1' : '3';
                Common.Utils.InternalSettings.set("sse-settings-fontrender", value);

                // Initialize api
                var styleNames = ['Normal', 'Neutral', 'Bad', 'Good', 'Input', 'Output', 'Calculation', 'Check Cell', 'Explanatory Text', 'Note', 'Linked Cell', 'Warning Text',
                                'Heading 1', 'Heading 2', 'Heading 3', 'Heading 4', 'Title', 'Total', 'Currency', 'Percent', 'Comma'],
                    translate = {
                        'Series': this.txtSeries,
                        'Diagram Title': this.txtDiagramTitle,
                        'X Axis': this.txtXAxis,
                        'Y Axis': this.txtYAxis,
                        'Your text here': this.txtArt,
                        'Table': this.txtTable,
                        'Print_Area': this.txtPrintArea
                    };
                styleNames.forEach(function(item){
                    translate[item] = me.translationTable[item] = me['txtStyle_' + item.replace(/ /g, '_')] || item;
                });
                translate['Currency [0]'] = me.translationTable['Currency [0]'] = me.txtStyle_Currency + ' [0]';
                translate['Comma [0]'] = me.translationTable['Comma [0]'] = me.txtStyle_Comma + ' [0]';

                for (var i=1; i<7; i++) {
                    translate['Accent'+i] = me.translationTable['Accent'+i] = me.txtAccent + i;
                    translate['20% - Accent'+i] = me.translationTable['20% - Accent'+i] = '20% - ' + me.txtAccent + i;
                    translate['40% - Accent'+i] = me.translationTable['40% - Accent'+i] = '40% - ' + me.txtAccent + i;
                    translate['60% - Accent'+i] = me.translationTable['60% - Accent'+i] = '60% - ' + me.txtAccent + i;
                }

                this.api = new Asc.spreadsheet_api({
                    'id-view'  : 'editor_sdk',
                    'id-input' : 'ce-cell-content',
                    'translate': translate
                });
                this.api.asc_setFontRenderingMode(parseInt(value));

                this.api.asc_registerCallback('asc_onOpenDocumentProgress',  _.bind(this.onOpenDocument, this));
                this.api.asc_registerCallback('asc_onEndAction',             _.bind(this.onLongActionEnd, this));
                this.api.asc_registerCallback('asc_onError',                 _.bind(this.onError, this));
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect', _.bind(this.onCoAuthoringDisconnect, this));
                this.api.asc_registerCallback('asc_onAdvancedOptions',       _.bind(this.onAdvancedOptions, this));
                this.api.asc_registerCallback('asc_onDocumentUpdateVersion', _.bind(this.onUpdateVersion, this));
                this.api.asc_registerCallback('asc_onServerVersion',         _.bind(this.onServerVersion, this));
                this.api.asc_registerCallback('asc_onDocumentName',          _.bind(this.onDocumentName, this));
                this.api.asc_registerCallback('asc_onPrintUrl',              _.bind(this.onPrintUrl, this));
                this.api.asc_registerCallback('asc_onMeta',                  _.bind(this.onMeta, this));
                Common.NotificationCenter.on('api:disconnect',               _.bind(this.onCoAuthoringDisconnect, this));
                Common.NotificationCenter.on('goback',                       _.bind(this.goBack, this));
                Common.NotificationCenter.on('namedrange:locked',            _.bind(this.onNamedRangeLocked, this));
                Common.NotificationCenter.on('download:cancel',              _.bind(this.onDownloadCancel, this));

                this.stackLongActions = new Common.IrregularStack({
                    strongCompare   : this._compareActionStrong,
                    weakCompare     : this._compareActionWeak
                });

                this.stackLongActions.push({id: InitApplication, type: Asc.c_oAscAsyncActionType.BlockInteraction});

                this.isShowOpenDialog = false;

                // Initialize api gateway
                this.editorConfig = {};
                this.plugins = undefined;
                this.UICustomizePlugins = [];
                Common.Gateway.on('init', _.bind(this.loadConfig, this));
                Common.Gateway.on('showmessage', _.bind(this.onExternalMessage, this));
                Common.Gateway.on('opendocument', _.bind(this.loadDocument, this));
                Common.Gateway.on('internalcommand', _.bind(this.onInternalCommand, this));
                Common.Gateway.appReady();

                this.getApplication().getController('Viewport').setApi(this.api);

                // Syncronize focus with api
                $(document.body).on('focus', 'input, textarea:not(#ce-cell-content)', function(e) {
                    if (me.isAppDisabled === true) return;

                    if (e && e.target && !/area_id/.test(e.target.id)) {
                        if (/msg-reply/.test(e.target.className))
                            me.dontCloseDummyComment = true;
                        else if (/chat-msg-text/.test(e.target.id))
                            me.dontCloseChat = true;
                        else if (!me.isModalShowed && /form-control/.test(e.target.className))
                            me.inFormControl = true;
                    }
                });

                $(document.body).on('blur', 'input, textarea', function(e) {
                    if (me.isAppDisabled === true || me.isFrameClosed) return;

                    if (!me.isModalShowed && !(me.loadMask && me.loadMask.isVisible())) {
                        if (/form-control/.test(e.target.className))
                            me.inFormControl = false;
                        if (!e.relatedTarget ||
                            !/area_id/.test(e.target.id) && ($(e.target).parent().find(e.relatedTarget).length<1 || e.target.localName == 'textarea') /* Check if focus in combobox goes from input to it's menu button or menu items, or from comment editing area to Ok/Cancel button */
                            && (e.relatedTarget.localName != 'input' || !/form-control/.test(e.relatedTarget.className)) /* Check if focus goes to text input with class "form-control" */
                            && (e.relatedTarget.localName != 'textarea' || /area_id/.test(e.relatedTarget.id))) /* Check if focus goes to textarea, but not to "area_id" */ {
                            if (Common.Utils.isIE && e.originalEvent && e.originalEvent.target && /area_id/.test(e.originalEvent.target.id) && (e.originalEvent.target === e.originalEvent.srcElement))
                                return;
                            me.api.asc_enableKeyEvents(true);
                            if (/msg-reply/.test(e.target.className))
                                me.dontCloseDummyComment = false;
                            else if (/chat-msg-text/.test(e.target.id))
                                me.dontCloseChat = false;
                        }
                    }
                }).on('dragover', function(e) {
                    var event = e.originalEvent;
                    if (event.target && $(event.target).closest('#editor_sdk').length<1 ) {
                        event.preventDefault();
                        event.dataTransfer.dropEffect ="none";
                        return false;
                    }
                }).on('dragstart', function(e) {
                    var event = e.originalEvent;
                    if (event.target ) {
                        var target = $(event.target);
                        if (target.closest('.combobox').length>0 || target.closest('.dropdown-menu').length>0 ||
                            target.closest('.ribtab').length>0 || target.closest('.combo-dataview').length>0) {
                            event.preventDefault();
                        }
                    }
                });

                Common.NotificationCenter.on({
                    'modal:show': function(e){
                        me.isModalShowed++;
                        me.api.asc_enableKeyEvents(false);
                    },
                    'modal:close': function(dlg) {
                        me.isModalShowed--;
                        if (!me.isModalShowed)
                            me.api.asc_enableKeyEvents(true);
                    },
                    'modal:hide': function(dlg) {
                        me.isModalShowed--;
                        if (!me.isModalShowed)
                            me.api.asc_enableKeyEvents(true);
                    },
                    'dataview:focus': function(e){
                    },
                    'dataview:blur': function(e){
                        if (!me.isModalShowed) {
                            me.api.asc_enableKeyEvents(true);
                        }
                    },
                    'menu:show': function(e){
                    },
                    'menu:hide': function(menu, isFromInputControl){
                        if (!me.isModalShowed && (!menu || !menu.cmpEl.hasClass('from-cell-edit')) && !isFromInputControl) {
                            me.api.asc_InputClearKeyboardElement();
                            me.api.asc_enableKeyEvents(true);
                        }
                    },
                    'edit:complete': _.bind(this.onEditComplete, this),
                    'settings:unitschanged':_.bind(this.unitsChanged, this)
                });

                this.initNames();
//                this.recognizeBrowser();
                Common.util.Shortcuts.delegateShortcuts({
                    shortcuts: {
                        'command+s,ctrl+s,command+p,ctrl+p,command+k,ctrl+k,command+d,ctrl+d': _.bind(function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                        }, this)
                    }
                });

                me.defaultTitleText = me.defaultTitleText || '{{APP_TITLE_TEXT}}';
                me.warnNoLicense  = me.warnNoLicense.replace('%1', '{{COMPANY_NAME}}');
                me.warnNoLicenseUsers = me.warnNoLicenseUsers.replace('%1', '{{COMPANY_NAME}}');
                me.textNoLicenseTitle = me.textNoLicenseTitle.replace('%1', '{{COMPANY_NAME}}');
            },

            loadConfig: function(data) {
                this.editorConfig = $.extend(this.editorConfig, data.config);

                this.appOptions                 = {};

                this.editorConfig.user          =
                this.appOptions.user            = Common.Utils.fillUserInfo(this.editorConfig.user, this.editorConfig.lang, this.textAnonymous);
                this.appOptions.nativeApp       = this.editorConfig.nativeApp === true;
                this.appOptions.isDesktopApp    = this.editorConfig.targetApp == 'desktop';
                this.appOptions.canCreateNew    = !_.isEmpty(this.editorConfig.createUrl) && !this.appOptions.isDesktopApp;
                this.appOptions.canOpenRecent   = this.editorConfig.nativeApp !== true && this.editorConfig.recent !== undefined && !this.appOptions.isDesktopApp;
                this.appOptions.templates       = this.editorConfig.templates;
                this.appOptions.recent          = this.editorConfig.recent;
                this.appOptions.createUrl       = this.editorConfig.createUrl;
                this.appOptions.lang            = this.editorConfig.lang;
                this.appOptions.location        = (typeof (this.editorConfig.location) == 'string') ? this.editorConfig.location.toLowerCase() : '';
                this.appOptions.canAutosave     = false;
                this.appOptions.canAnalytics    = false;
                this.appOptions.sharingSettingsUrl = this.editorConfig.sharingSettingsUrl;
                this.appOptions.saveAsUrl       = this.editorConfig.saveAsUrl;
                this.appOptions.fileChoiceUrl   = this.editorConfig.fileChoiceUrl;
                this.appOptions.isEditDiagram   = this.editorConfig.mode == 'editdiagram';
                this.appOptions.isEditMailMerge = this.editorConfig.mode == 'editmerge';
                this.appOptions.customization   = this.editorConfig.customization;
                this.appOptions.canBackToFolder = (this.editorConfig.canBackToFolder!==false) && (typeof (this.editorConfig.customization) == 'object')
                                                  && (typeof (this.editorConfig.customization.goback) == 'object') && !_.isEmpty(this.editorConfig.customization.goback.url);
                this.appOptions.canBack         = this.editorConfig.nativeApp !== true && this.appOptions.canBackToFolder === true;
                this.appOptions.canPlugins      = false;
                this.plugins                    = this.editorConfig.plugins;

                this.headerView = this.getApplication().getController('Viewport').getView('Common.Views.Header');
                this.headerView.setCanBack(this.appOptions.canBackToFolder === true, (this.appOptions.canBackToFolder) ? this.editorConfig.customization.goback.text : '')
                                .setUserName(this.appOptions.user.fullname);

                var value = Common.localStorage.getItem("sse-settings-reg-settings");
                if (value!==null)
                    this.api.asc_setLocale(parseInt(value));
                else {
                    this.api.asc_setLocale((this.editorConfig.lang) ? parseInt(Common.util.LanguageInfo.getLocalLanguageCode(this.editorConfig.lang)) : 0x0409);
                }

                value = Common.localStorage.getItem("sse-settings-func-locale");
                if (value===null) {
                    var lang = ((this.editorConfig.lang) ? this.editorConfig.lang : 'en').split(/[\-\_]/)[0].toLowerCase();
                    Common.Utils.InternalSettings.set("sse-settings-func-locale", lang);
                    if (lang !== 'en')
                        value = SSE.Views.FormulaLang.get(lang);
                } else {
                    Common.Utils.InternalSettings.set("sse-settings-func-locale", value);
                    value = SSE.Views.FormulaLang.get(value);
                }
                if (value) this.api.asc_setLocalization(value);

                value = Common.localStorage.getBool("sse-settings-r1c1");
                Common.Utils.InternalSettings.set("sse-settings-r1c1", value);
                this.api.asc_setR1C1Mode(value);

                if (this.appOptions.location == 'us' || this.appOptions.location == 'ca')
                    Common.Utils.Metric.setDefaultMetric(Common.Utils.Metric.c_MetricUnits.inch);

                this.isFrameClosed = (this.appOptions.isEditDiagram || this.appOptions.isEditMailMerge);
                Common.Controllers.Desktop.init(this.appOptions);
            },

            loadDocument: function(data) {
                this.appOptions.spreadsheet = data.doc;
                this.permissions = {};
                var docInfo = {};

                if (data.doc) {
                    this.permissions = _.extend(this.permissions, data.doc.permissions);

                    var _permissions = $.extend({}, data.doc.permissions),
                        _options = $.extend({}, data.doc.options, {actions: this.editorConfig.actionLink || {}});

                    var _user = new Asc.asc_CUserInfo();
                    _user.put_Id(this.appOptions.user.id);
                    _user.put_FullName(this.appOptions.user.fullname);

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

                    this.headerView.setDocumentCaption(data.doc.title);
                }

                this.api.asc_registerCallback('asc_onGetEditorPermissions', _.bind(this.onEditorPermissions, this));
                this.api.asc_registerCallback('asc_onLicenseChanged',       _.bind(this.onLicenseChanged, this));
                this.api.asc_setDocInfo(docInfo);
                this.api.asc_getEditorPermissions(this.editorConfig.licenseUrl, this.editorConfig.customerId);
            },

            onProcessSaveResult: function(data) {
                this.api.asc_OnSaveEnd(data.result);
                if (data && data.result === false) {
                    Common.UI.error({
                        title: this.criticalErrorTitle,
                        msg  : _.isEmpty(data.message) ? this.errorProcessSaveResult : data.message
                    });
                }
            },

            onProcessRightsChange: function(data) {
                if (data && data.enabled === false) {
                    var me = this,
                        old_rights = this._state.lostEditingRights;
                    this._state.lostEditingRights = !this._state.lostEditingRights;
                    this.api.asc_coAuthoringDisconnect();
                    Common.NotificationCenter.trigger('collaboration:sharingdeny');
                    Common.NotificationCenter.trigger('api:disconnect');
                    if (!old_rights)
                        Common.UI.warning({
                            title: this.notcriticalErrorTitle,
                            maxwidth: 600,
                            msg  : _.isEmpty(data.message) ? this.warnProcessRightsChange : data.message,
                            callback: function(){
                                me._state.lostEditingRights = false;
                                me.onEditComplete();
                            }
                        });
                }
            },

            onDownloadAs: function(format) {
                if ( !this.appOptions.canDownload) {
                    Common.Gateway.reportError(Asc.c_oAscError.ID.AccessDeny, this.errorAccessDeny);
                    return;
                }

                this._state.isFromGatewayDownloadAs = true;
                var _format = (format && (typeof format == 'string')) ? Asc.c_oAscFileType[ format.toUpperCase() ] : null,
                    _supported = [
                        Asc.c_oAscFileType.XLSX,
                        Asc.c_oAscFileType.ODS,
                        Asc.c_oAscFileType.CSV,
                        Asc.c_oAscFileType.PDF,
                        Asc.c_oAscFileType.PDFA,
                        Asc.c_oAscFileType.XLTX,
                        Asc.c_oAscFileType.OTS
                    ];

                if ( !_format || _supported.indexOf(_format) < 0 )
                    _format = Asc.c_oAscFileType.XLSX;
                if (_format == Asc.c_oAscFileType.PDF || _format == Asc.c_oAscFileType.PDFA)
                    Common.NotificationCenter.trigger('download:settings', this, _format, true);
                else
                    this.api.asc_DownloadAs(_format, true);
            },

            onProcessMouse: function(data) {
                if (data.type == 'mouseup') {
                    var editor = document.getElementById('editor_sdk');
                    if (editor) {
                        var rect = editor.getBoundingClientRect();
                        var event = data.event || {};
                        this.api.asc_onMouseUp(event, data.x - rect.left, data.y - rect.top);
                    }
                }
            },

            goBack: function(current) {
                var me = this;
                if ( !Common.Controllers.Desktop.process('goback') ) {
                    var href = me.appOptions.customization.goback.url;
                    if (!current && me.appOptions.customization.goback.blank!==false) {
                        window.open(href, "_blank");
                    } else {
                        parent.location.href = href;
                    }
                }
            },

            onEditComplete: function(cmp, opts) {
                if (opts && opts.restorefocus && this.api.isCEditorFocused) {
                    this.formulaInput.blur();
                    this.formulaInput.focus();
                } else {
                    this.getApplication().getController('DocumentHolder').getView('DocumentHolder').focus();
                    this.api.isCEditorFocused = false;
                }
            },

            onSelectionChanged: function(info){
                if (!this._isChartDataReady && info.asc_getFlags().asc_getSelectionType() == Asc.c_oAscSelectionType.RangeChart) {
                    this._isChartDataReady = true;
                    Common.Gateway.internalMessage('chartDataReady');
                }
            },

            onLongActionBegin: function(type, id) {
                var action = {id: id, type: type};
                this.stackLongActions.push(action);
                this.setLongActionView(action);
            },

            onLongActionEnd: function(type, id) {
                var action = {id: id, type: type};
                this.stackLongActions.pop(action);

                this.headerView.setDocumentCaption(this.api.asc_getDocumentName());
                this.updateWindowTitle(this.api.asc_isDocumentModified(), true);

                if (type === Asc.c_oAscAsyncActionType.BlockInteraction && id == Asc.c_oAscAsyncAction.Open) {
                    Common.Gateway.internalMessage('documentReady', {});
                    this.onDocumentReady();
                }

                action = this.stackLongActions.get({type: Asc.c_oAscAsyncActionType.Information});
                action && this.setLongActionView(action);

                if (id == Asc.c_oAscAsyncAction.Save) {
                    this.toolbarView && this.toolbarView.synchronizeChanges();
                }

                action = this.stackLongActions.get({type: Asc.c_oAscAsyncActionType.BlockInteraction});
                if (action) {
                    this.setLongActionView(action);
                } else {
                    if (this.loadMask) {
                        if (this.loadMask.isVisible() && !this.dontCloseDummyComment && !this.dontCloseChat && !this.isModalShowed && !this.inFormControl)
                            this.api.asc_enableKeyEvents(true);
                        this.loadMask.hide();
                    }

                    if (type == Asc.c_oAscAsyncActionType.BlockInteraction && !( (id == Asc.c_oAscAsyncAction['LoadDocumentFonts'] || id == Asc.c_oAscAsyncAction['ApplyChanges']) && (this.dontCloseDummyComment || this.dontCloseChat || this.isModalShowed || this.inFormControl) ))
                        this.onEditComplete(this.loadMask, {restorefocus:true});
                }
            },

            setLongActionView: function(action) {
                var title = '';

                switch (action.id) {
                    case Asc.c_oAscAsyncAction.Open:
                        title   = this.openTitleText;
                        break;

                    case Asc.c_oAscAsyncAction.Save:
                        title   = this.saveTitleText;
                        break;

                    case Asc.c_oAscAsyncAction.ForceSaveTimeout:
                        break;

                    case Asc.c_oAscAsyncAction.ForceSaveButton:
                        break;

                    case Asc.c_oAscAsyncAction.LoadDocumentFonts:
                        title   = this.loadFontsTitleText;
                        break;

                    case Asc.c_oAscAsyncAction.LoadDocumentImages:
                        title   = this.loadImagesTitleText;
                        break;

                    case Asc.c_oAscAsyncAction.LoadFont:
                        title   = this.loadFontTitleText;
                        break;

                    case Asc.c_oAscAsyncAction.LoadImage:
                        title   = this.loadImageTitleText;
                        break;

                    case Asc.c_oAscAsyncAction.DownloadAs:
                        title   = this.downloadTitleText;
                        break;

                    case Asc.c_oAscAsyncAction.Print:
                        title   = this.printTitleText;
                        break;

                    case Asc.c_oAscAsyncAction.UploadImage:
                        title   = this.uploadImageTitleText;
                        break;

                    case Asc.c_oAscAsyncAction.Recalc:
                        title   = this.titleRecalcFormulas;
                        break;

                    case Asc.c_oAscAsyncAction.SlowOperation:
                        title   = this.textPleaseWait;
                        break;

                    case Asc.c_oAscAsyncAction['PrepareToSave']:
                        title   = this.savePreparingText;
                        break;

                    case Asc.c_oAscAsyncAction['Waiting']:
                        title   = this.waitText;
                        break;

                    case ApplyEditRights:
                        title   = this.txtEditingMode;
                        break;

                    case LoadingDocument:
                        title   = this.loadingDocumentTitleText;
                        break;
                    default:
                        if (typeof action.id == 'string'){
                            title   = action.id;
                        }
                        break;
                }

                if (action.type == Asc.c_oAscAsyncActionType.BlockInteraction) {
                    !this.loadMask && (this.loadMask = new Common.UI.LoadMask({owner: $('#viewport')}));
                    this.loadMask.setTitle(title);

                    if (!this.isShowOpenDialog) {
                        this.api.asc_enableKeyEvents(false);
                        this.loadMask.show();
                    }
                }
            },

            onApplyEditRights: function(data) {
                if (data && !data.allowed) {
                    Common.UI.info({
                        title: this.requestEditFailedTitleText,
                        msg: data.message || this.requestEditFailedMessageText
                    });
                }
            },

            onDocumentReady: function() {
                if (this._isDocReady)
                    return;

                if (this._state.openDlg)
                    this._state.openDlg.close();

                var me = this,
                    value;

                me._isDocReady = true;
                Common.NotificationCenter.trigger('app:ready', this.appOptions);

                me.hidePreloader();
                me.onLongActionEnd(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);

                value = (this.appOptions.isEditMailMerge || this.appOptions.isEditDiagram) ? 100 : Common.localStorage.getItem("sse-settings-zoom");
                Common.Utils.InternalSettings.set("sse-settings-zoom", value);
                var zf = (value!==null) ? parseInt(value)/100 : (this.appOptions.customization && this.appOptions.customization.zoom ? parseInt(this.appOptions.customization.zoom)/100 : 1);
                this.api.asc_setZoom(zf>0 ? zf : 1);

                /** coauthoring begin **/
                this.isLiveCommenting = Common.localStorage.getBool("sse-settings-livecomment", true);
                Common.Utils.InternalSettings.set("sse-settings-livecomment", this.isLiveCommenting);
                value = Common.localStorage.getBool("sse-settings-resolvedcomment");
                Common.Utils.InternalSettings.set("sse-settings-resolvedcomment", value);
                this.isLiveCommenting ? this.api.asc_showComments(value) : this.api.asc_hideComments();

                if (this.appOptions.isEdit && !this.appOptions.isOffline && this.appOptions.canCoAuthoring) {
                    value = Common.localStorage.getItem("sse-settings-coauthmode");
                    if (value===null && Common.localStorage.getItem("sse-settings-autosave")===null &&
                        this.appOptions.customization && this.appOptions.customization.autosave===false) {
                        value = 0; // use customization.autosave only when sse-settings-coauthmode and sse-settings-autosave are null
                    }
                    this._state.fastCoauth = (value===null || parseInt(value) == 1);
                } else {
                    this._state.fastCoauth = (!this.appOptions.isEdit && this.appOptions.isRestrictedEdit);
                    if (this._state.fastCoauth) {
                        this.api.asc_setAutoSaveGap(1);
                        Common.Utils.InternalSettings.set("sse-settings-autosave", 1);
                    }
                }
                this.api.asc_SetFastCollaborative(this._state.fastCoauth);
                Common.Utils.InternalSettings.set("sse-settings-coauthmode", me._state.fastCoauth);
                /** coauthoring end **/

                me.api.asc_registerCallback('asc_onStartAction',        _.bind(me.onLongActionBegin, me));
                me.api.asc_registerCallback('asc_onConfirmAction',      _.bind(me.onConfirmAction, me));
                me.api.asc_registerCallback('asc_onActiveSheetChanged', _.bind(me.onActiveSheetChanged, me));
                me.api.asc_registerCallback('asc_onPrint',              _.bind(me.onPrint, me));

                var application = me.getApplication();

                me.headerView.setDocumentCaption(me.api.asc_getDocumentName());
                me.updateWindowTitle(me.api.asc_isDocumentModified(), true);

                var toolbarController           = application.getController('Toolbar'),
                    statusbarController         = application.getController('Statusbar'),
                    documentHolderController    = application.getController('DocumentHolder'),
//                  fontsController             = application.getController('Common.Controllers.Fonts'),
                    rightmenuController         = application.getController('RightMenu'),
                    leftmenuController          = application.getController('LeftMenu'),
                    celleditorController        = application.getController('CellEditor'),
                    statusbarView               = statusbarController.getView('Statusbar'),
                    leftMenuView                = leftmenuController.getView('LeftMenu'),
                    documentHolderView          = documentHolderController.getView('DocumentHolder'),
                    chatController              = application.getController('Common.Controllers.Chat'),
                    pluginsController           = application.getController('Common.Controllers.Plugins');

                leftMenuView.getMenu('file').loadDocument({doc:me.appOptions.spreadsheet});
                leftmenuController.setMode(me.appOptions).createDelayedElements().setApi(me.api);

                 if (!me.appOptions.isEditMailMerge && !me.appOptions.isEditDiagram) {
                    pluginsController.setApi(me.api);
                    me.requestPlugins('../../../../plugins.json');
                    me.api.asc_registerCallback('asc_onPluginsInit', _.bind(me.updatePluginsList, me));
                    me.api.asc_registerCallback('asc_onPluginsReset', _.bind(me.resetPluginsList, me));
                 }

                leftMenuView.disableMenu('all',false);

                if (!me.appOptions.isEditMailMerge && !me.appOptions.isEditDiagram && me.appOptions.canBranding) {
                    me.getApplication().getController('LeftMenu').leftMenu.getMenu('about').setLicInfo(me.editorConfig.customization);
                }

                documentHolderController.setApi(me.api).loadConfig({config:me.editorConfig});
                chatController.setApi(this.api).setMode(this.appOptions);

                statusbarController.createDelayedElements();
                statusbarController.setApi(me.api);
                documentHolderView.setApi(me.api);

                statusbarView.update();

                this.formulaInput = celleditorController.getView('CellEditor').$el.find('textarea');

                if (me.appOptions.isEdit) {
                    if (me.appOptions.canAutosave) {
                        value = Common.localStorage.getItem("sse-settings-autosave");
                        if (value===null && me.appOptions.customization && me.appOptions.customization.autosave===false)
                            value = 0;
                        value = (!me._state.fastCoauth && value!==null) ? parseInt(value) : (me.appOptions.canCoAuthoring ? 1 : 0);
                    } else {
                        value = 0;
                    }
                    me.api.asc_setAutoSaveGap(value);
                    Common.Utils.InternalSettings.set("sse-settings-autosave", value);

                    if (me.appOptions.canForcesave) {// use asc_setIsForceSaveOnUserSave only when customization->forcesave = true
                        me.appOptions.forcesave = Common.localStorage.getBool("sse-settings-forcesave", me.appOptions.canForcesave);
                        Common.Utils.InternalSettings.set("sse-settings-forcesave", me.appOptions.forcesave);
                        me.api.asc_setIsForceSaveOnUserSave(me.appOptions.forcesave);
                    }

                    if (me.needToUpdateVersion) {
                        Common.NotificationCenter.trigger('api:disconnect');
                        toolbarController.onApiCoAuthoringDisconnect();
                    }

                    var timer_sl = setInterval(function(){
                        if (window.styles_loaded || me.appOptions.isEditDiagram || me.appOptions.isEditMailMerge) {
                            clearInterval(timer_sl);

                            Common.NotificationCenter.trigger('comments:updatefilter', ['doc', 'sheet' + me.api.asc_getActiveWorksheetId()]);

                            documentHolderView.createDelayedElements();
                            toolbarController.createDelayedElements();

                            if (!me.appOptions.isEditMailMerge && !me.appOptions.isEditDiagram) {
                                var shapes = me.api.asc_getPropertyEditorShapes();
                                if (shapes)
                                    me.fillAutoShapes(shapes[0], shapes[1]);

                                me.fillTextArt(me.api.asc_getTextArtPreviews());
                                me.updateThemeColors();
                                toolbarController.activateControls();
                            }

                            rightmenuController.createDelayedElements();

                            me.api.asc_registerCallback('asc_onDocumentCanSaveChanged',  _.bind(me.onDocumentCanSaveChanged, me));
                            me.api.asc_registerCallback('asc_OnTryUndoInFastCollaborative',_.bind(me.onTryUndoInFastCollaborative, me));
                            me.onDocumentModifiedChanged(me.api.asc_isDocumentModified());

                            var formulasDlgController = application.getController('FormulaDialog');
                            if (formulasDlgController) {
                                formulasDlgController.setMode(me.appOptions).setApi(me.api);
                            }
                            if (me.needToUpdateVersion)
                                toolbarController.onApiCoAuthoringDisconnect();

                            Common.NotificationCenter.trigger('document:ready', 'main');
                            me.applyLicense();
                        }
                    }, 50);
                } else {
                    documentHolderView.createDelayedElementsViewer();
                    Common.NotificationCenter.trigger('document:ready', 'main');
                }

                if (me.appOptions.canAnalytics && false)
                    Common.component.Analytics.initialize('UA-12442749-13', 'Spreadsheet Editor');

                Common.Gateway.on('applyeditrights', _.bind(me.onApplyEditRights, me));
                Common.Gateway.on('processsaveresult', _.bind(me.onProcessSaveResult, me));
                Common.Gateway.on('processrightschange', _.bind(me.onProcessRightsChange, me));
                Common.Gateway.on('processmouse', _.bind(me.onProcessMouse, me));
                Common.Gateway.on('downloadas',   _.bind(me.onDownloadAs, me));
                Common.Gateway.sendInfo({mode:me.appOptions.isEdit?'edit':'view'});

                $(document).on('contextmenu', _.bind(me.onContextMenu, me));
//                    me.getViewport().getEl().un('keypress', me.lockEscapeKey, me);

                function checkWarns() {
                    if (!window['AscDesktopEditor']) {
                        var tips = [];
                        Common.Utils.isIE9m && tips.push(me.warnBrowserIE9);

                        if (tips.length) me.showTips(tips);
                    }
                    document.removeEventListener('visibilitychange', checkWarns);
                }

                if (typeof document.hidden !== 'undefined' && document.hidden) {
                    document.addEventListener('visibilitychange', checkWarns);
                } else checkWarns();

                Common.Gateway.documentReady();
            },

            onLicenseChanged: function(params) {
                if (this.appOptions.isEditDiagram || this.appOptions.isEditMailMerge) return;

                var licType = params.asc_getLicenseType();
                if (licType !== undefined && this.appOptions.canEdit && this.editorConfig.mode !== 'view' &&
                    (licType===Asc.c_oLicenseResult.Connections || licType===Asc.c_oLicenseResult.UsersCount || licType===Asc.c_oLicenseResult.ConnectionsOS || licType===Asc.c_oLicenseResult.UsersCountOS))
                    this._state.licenseType = licType;

                if (this._isDocReady)
                    this.applyLicense();
            },

            applyLicense: function() {
                if (this._state.licenseType) {
                    var license = this._state.licenseType,
                        buttons = ['ok'],
                        primary = 'ok';
                    if (license===Asc.c_oLicenseResult.Connections || license===Asc.c_oLicenseResult.UsersCount) {
                        license = (license===Asc.c_oLicenseResult.Connections) ? this.warnLicenseExceeded : this.warnLicenseUsersExceeded;
                    } else {
                        license = (license===Asc.c_oLicenseResult.ConnectionsOS) ? this.warnNoLicense : this.warnNoLicenseUsers;
                        buttons = [{value: 'buynow', caption: this.textBuyNow}, {value: 'contact', caption: this.textContactUs}];
                        primary = 'buynow';
                    }

                    this.disableEditing(true);
                    Common.NotificationCenter.trigger('api:disconnect');

                    var value = Common.localStorage.getItem("sse-license-warning");
                    value = (value!==null) ? parseInt(value) : 0;
                    var now = (new Date).getTime();
                    if (now - value > 86400000) {
                        Common.UI.info({
                            width: 500,
                            title: this.textNoLicenseTitle,
                            msg  : license,
                            buttons: buttons,
                            primary: primary,
                            callback: function(btn) {
                                Common.localStorage.setItem("sse-license-warning", now);
                                if (btn == 'buynow')
                                    window.open('{{PUBLISHER_URL}}', "_blank");
                                else if (btn == 'contact')
                                    window.open('mailto:{{SALES_EMAIL}}', "_blank");
                            }
                        });
                    }
                } else if (!this.appOptions.isDesktopApp && !this.appOptions.canBrandingExt &&
                    this.editorConfig && this.editorConfig.customization && (this.editorConfig.customization.loaderName || this.editorConfig.customization.loaderLogo)) {
                    Common.UI.warning({
                        title: this.textPaidFeature,
                        msg  : this.textCustomLoader,
                        buttons: [{value: 'contact', caption: this.textContactUs}, {value: 'close', caption: this.textClose}],
                        primary: 'contact',
                        callback: function(btn) {
                            if (btn == 'contact')
                                window.open('mailto:{{SALES_EMAIL}}', "_blank");
                        }
                    });
                }
            },

            disableEditing: function(disable) {
                var app = this.getApplication();
                if (this.appOptions.canEdit && this.editorConfig.mode !== 'view') {
                    app.getController('RightMenu').getView('RightMenu').clearSelection();
                    app.getController('Toolbar').DisableToolbar(disable);
                }
            },

            onOpenDocument: function(progress) {
                var elem = document.getElementById('loadmask-text');
                var proc = (progress.asc_getCurrentFont() + progress.asc_getCurrentImage())/(progress.asc_getFontsCount() + progress.asc_getImagesCount());
                proc = this.textLoadingDocument + ': ' + Math.min(Math.round(proc*100), 100) + '%';
                elem ? elem.innerHTML = proc : this.loadMask && this.loadMask.setTitle(proc);
            },

            onEditorPermissions: function(params) {
                var licType = params ? params.asc_getLicenseType() : Asc.c_oLicenseResult.Error;

                if ( params && !(this.appOptions.isEditDiagram || this.appOptions.isEditMailMerge)) {
                    if (Asc.c_oLicenseResult.Expired === licType || Asc.c_oLicenseResult.Error === licType || Asc.c_oLicenseResult.ExpiredTrial === licType) {
                        Common.UI.warning({
                            title: this.titleLicenseExp,
                            msg: this.warnLicenseExp,
                            buttons: [],
                            closable: false
                        });
                        return;
                    }

                    if ( this.onServerVersion(params.asc_getBuildVersion()) ) return;

                    if (params.asc_getRights() !== Asc.c_oRights.Edit)
                        this.permissions.edit = false;

                    this.appOptions.canAutosave = true;
                    this.appOptions.canAnalytics = params.asc_getIsAnalyticsEnable();

                    this.appOptions.isOffline      = this.api.asc_isOffline();
                    this.appOptions.canLicense     = (licType === Asc.c_oLicenseResult.Success || licType === Asc.c_oLicenseResult.SuccessLimit);
                    this.appOptions.isLightVersion = params.asc_getIsLight();
                    /** coauthoring begin **/
                    this.appOptions.canCoAuthoring = !this.appOptions.isLightVersion;
                    /** coauthoring end **/
                    this.appOptions.canComments    = this.appOptions.canLicense && (this.permissions.comment===undefined ? (this.permissions.edit !== false) : this.permissions.comment) && (this.editorConfig.mode !== 'view');
                    this.appOptions.canComments    = this.appOptions.canComments && !((typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.comments===false);
                    this.appOptions.canViewComments = this.appOptions.canComments || !((typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.comments===false);
                    this.appOptions.canChat        = this.appOptions.canLicense && !this.appOptions.isOffline && !((typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.chat===false);
                    this.appOptions.canRename      = this.editorConfig.canRename && !!this.permissions.rename;
                    this.appOptions.trialMode      = params.asc_getLicenseMode();
                    this.appOptions.canModifyFilter = (this.permissions.modifyFilter!==false);
                    this.appOptions.canBranding  = params.asc_getCustomization();
                    if (this.appOptions.canBranding)
                        this.headerView.setBranding(this.editorConfig.customization);

                    this.appOptions.canRename && this.headerView.setCanRename(true);
                } else
                    this.appOptions.canModifyFilter = true;

                this.appOptions.canRequestEditRights = this.editorConfig.canRequestEditRights;
                this.appOptions.canRequestClose = this.editorConfig.canRequestClose;
                this.appOptions.canEdit        = this.permissions.edit !== false && // can edit
                                                 (this.editorConfig.canRequestEditRights || this.editorConfig.mode !== 'view'); // if mode=="view" -> canRequestEditRights must be defined
                this.appOptions.isEdit         = (this.appOptions.canLicense || this.appOptions.isEditDiagram || this.appOptions.isEditMailMerge) && this.permissions.edit !== false && this.editorConfig.mode !== 'view';
                this.appOptions.canDownload    = !this.appOptions.nativeApp && (this.permissions.download !== false);
                this.appOptions.canPrint       = (this.permissions.print !== false);
                this.appOptions.canForcesave   = this.appOptions.isEdit && !this.appOptions.isOffline && !(this.appOptions.isEditDiagram || this.appOptions.isEditMailMerge) &&
                                                (typeof (this.editorConfig.customization) == 'object' && !!this.editorConfig.customization.forcesave);
                this.appOptions.forcesave      = this.appOptions.canForcesave;
                this.appOptions.canEditComments= this.appOptions.isOffline || !(typeof (this.editorConfig.customization) == 'object' && this.editorConfig.customization.commentAuthorOnly);
                this.appOptions.isSignatureSupport= this.appOptions.isEdit && this.appOptions.isDesktopApp && this.appOptions.isOffline && this.api.asc_isSignaturesSupport() && !(this.appOptions.isEditDiagram || this.appOptions.isEditMailMerge);
                this.appOptions.isPasswordSupport = this.appOptions.isEdit && this.appOptions.isDesktopApp && this.appOptions.isOffline && this.api.asc_isProtectionSupport() && !(this.appOptions.isEditDiagram || this.appOptions.isEditMailMerge);
                this.appOptions.canProtect     = (this.appOptions.isSignatureSupport || this.appOptions.isPasswordSupport);
                this.appOptions.canHelp        = !((typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.help===false);
                this.appOptions.isRestrictedEdit = !this.appOptions.isEdit && this.appOptions.canComments;

                if (!this.appOptions.isEditDiagram && !this.appOptions.isEditMailMerge) {
                    this.appOptions.canBrandingExt = params.asc_getCanBranding() && (typeof this.editorConfig.customization == 'object' || this.editorConfig.plugins);
                    if (this.appOptions.canBrandingExt)
                        this.updatePlugins(this.plugins, true);
                }

                this.applyModeCommonElements();
                this.applyModeEditorElements();

                if ( !this.appOptions.isEdit ) {
                    Common.NotificationCenter.trigger('app:face', this.appOptions);

                    this.hidePreloader();
                    this.onLongActionBegin(Asc.c_oAscAsyncActionType.BlockInteraction, LoadingDocument);
                }

                this.api.asc_setViewMode(!this.appOptions.isEdit && !this.appOptions.isRestrictedEdit);
                (this.appOptions.isRestrictedEdit && this.appOptions.canComments) && this.api.asc_setRestriction(Asc.c_oAscRestrictionType.OnlyComments);
                this.api.asc_LoadDocument();
            },

            applyModeCommonElements: function() {
                window.editor_elements_prepared = true;

                var app             = this.getApplication(),
                    viewport        = app.getController('Viewport').getView('Viewport'),
                    statusbarView   = app.getController('Statusbar').getView('Statusbar');

                if (this.headerView) {
                    this.headerView.setVisible(!this.appOptions.nativeApp && !this.appOptions.isEditMailMerge &&
                            !this.appOptions.isDesktopApp && !this.appOptions.isEditDiagram);
                }

                viewport && viewport.setMode(this.appOptions, true);
                statusbarView && statusbarView.setMode(this.appOptions);
//                this.getStatusInfo().setDisabled(false);
//                this.getCellInfo().setMode(this.appOptions);
                app.getController('Toolbar').setMode(this.appOptions);
                app.getController('DocumentHolder').setMode(this.appOptions);

                if (this.appOptions.isEditMailMerge || this.appOptions.isEditDiagram) {
                    statusbarView.hide();
                    app.getController('LeftMenu').getView('LeftMenu').hide();

                    $(window)
                        .mouseup(function(e){
                            Common.Gateway.internalMessage('processMouse', {event: 'mouse:up'});
                        })
                        .mousemove($.proxy(function(e){
                            if (this.isDiagramDrag) {
                                Common.Gateway.internalMessage('processMouse', {event: 'mouse:move', pagex: e.pageX*Common.Utils.zoom(), pagey: e.pageY*Common.Utils.zoom()});
                            }
                        },this));
                }

                if (!this.appOptions.isEditMailMerge && !this.appOptions.isEditDiagram) {
                    this.api.asc_registerCallback('asc_onSendThemeColors', _.bind(this.onSendThemeColors, this));
                    this.api.asc_registerCallback('asc_onDownloadUrl',     _.bind(this.onDownloadUrl, this));
                    this.api.asc_registerCallback('asc_onDocumentModifiedChanged', _.bind(this.onDocumentModifiedChanged, this));

                    var printController = app.getController('Print');
                    printController && this.api && printController.setApi(this.api);

                }

                var celleditorController = this.getApplication().getController('CellEditor');
                celleditorController && celleditorController.setApi(this.api).setMode(this.appOptions);
            },

            applyModeEditorElements: function(prevmode) {
                /** coauthoring begin **/
                var commentsController  = this.getApplication().getController('Common.Controllers.Comments');
                if (commentsController) {
                    commentsController.setMode(this.appOptions);
                    commentsController.setConfig({
                            config      : this.editorConfig,
                            sdkviewname : '#ws-canvas-outer',
                            hintmode    : true},
                        this.api);
                }
                /** coauthoring end **/

                if (this.appOptions.isEdit) {
                    var me = this,
                        application         = this.getApplication(),
                        toolbarController   = application.getController('Toolbar'),
                        statusbarController = application.getController('Statusbar'),
                        rightmenuController = application.getController('RightMenu'),
                        fontsControllers    = application.getController('Common.Controllers.Fonts'),
                        reviewController    = application.getController('Common.Controllers.ReviewChanges');

                    fontsControllers    && fontsControllers.setApi(me.api);
                    toolbarController   && toolbarController.setApi(me.api);
//                    statusbarController && statusbarController.setApi(me.api);

                    rightmenuController && rightmenuController.setApi(me.api);

                    reviewController.setMode(me.appOptions).setConfig({config: me.editorConfig}, me.api);

                    if (me.appOptions.canProtect)
                        application.getController('Common.Controllers.Protection').setMode(me.appOptions).setConfig({config: me.editorConfig}, me.api);

                    if (statusbarController) {
                        statusbarController.getView('Statusbar').changeViewMode(true);
                    }

                    if (!me.appOptions.isEditMailMerge && !me.appOptions.isEditDiagram && !me.appOptions.isOffline)
                        application.getController('PivotTable').setMode(me.appOptions).setConfig({config: me.editorConfig}, me.api);

                    var viewport = this.getApplication().getController('Viewport').getView('Viewport');
                    viewport.applyEditorMode();
                    rightmenuController.getView('RightMenu').setMode(me.appOptions).setApi(me.api);

                    this.toolbarView = toolbarController.getView('Toolbar');

                    var value = Common.localStorage.getItem('sse-settings-unit');
                    value = (value!==null) ? parseInt(value) : Common.Utils.Metric.getDefaultMetric();
                    Common.Utils.Metric.setCurrentMetric(value);
                    Common.Utils.InternalSettings.set("sse-settings-unit", value);

                    if (!me.appOptions.isEditMailMerge && !me.appOptions.isEditDiagram) {
                        var options = {};
                        JSON.parse(Common.localStorage.getItem('sse-hidden-formula')) && (options.formula = true);
                        application.getController('Toolbar').hideElements(options);
                    } else
                        rightmenuController.getView('RightMenu').hide();

                    /** coauthoring begin **/
                    me.api.asc_registerCallback('asc_onAuthParticipantsChanged', _.bind(me.onAuthParticipantsChanged, me));
                    me.api.asc_registerCallback('asc_onParticipantsChanged',     _.bind(me.onAuthParticipantsChanged, me));
                    /** coauthoring end **/
                    if (me.appOptions.isEditDiagram)
                        me.api.asc_registerCallback('asc_onSelectionChanged',        _.bind(me.onSelectionChanged, me));

                    me.api.asc_setFilteringMode && me.api.asc_setFilteringMode(me.appOptions.canModifyFilter);

                    if (me.stackLongActions.exist({id: ApplyEditRights, type: Asc.c_oAscAsyncActionType['BlockInteraction']})) {
                        me.onLongActionEnd(Asc.c_oAscAsyncActionType['BlockInteraction'], ApplyEditRights);
                    } else if (!this._isDocReady) {
                        Common.NotificationCenter.trigger('app:face', this.appOptions);

                        me.hidePreloader();
                        me.onLongActionBegin(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);
                    }

                    // Message on window close
                    window.onbeforeunload = _.bind(me.onBeforeUnload, me);
                    window.onunload = _.bind(me.onUnload, me);
                }
            },

            onExternalMessage: function(msg) {
                if (msg && msg.msg) {
                    msg.msg = (msg.msg).toString();
                    this.showTips([msg.msg.charAt(0).toUpperCase() + msg.msg.substring(1)]);

                    Common.component.Analytics.trackEvent('External Error');
                }
            },

            onError: function(id, level, errData) {
                if (id == Asc.c_oAscError.ID.LoadingScriptError) {
                    this.showTips([this.scriptLoadError]);
                    this.tooltip && this.tooltip.getBSTip().$tip.css('z-index', 10000);
                    return;
                }

                this.hidePreloader();
                this.onLongActionEnd(Asc.c_oAscAsyncActionType.BlockInteraction, LoadingDocument);

                var config = {closable: true};

                switch (id) {
                    case Asc.c_oAscError.ID.Unknown:
                        config.msg = this.unknownErrorText;
                        break;

                    case Asc.c_oAscError.ID.ConvertationTimeout:
                        config.msg = this.convertationTimeoutText;
                        break;

                    case Asc.c_oAscError.ID.ConvertationOpenError:
                        config.msg = this.openErrorText;
                        break;

                    case Asc.c_oAscError.ID.ConvertationSaveError:
                        config.msg = this.saveErrorText;
                        break;

                    case Asc.c_oAscError.ID.DownloadError:
                        config.msg = this.downloadErrorText;
                        break;

                    case Asc.c_oAscError.ID.UplImageSize:
                        config.msg = this.uploadImageSizeMessage;
                        break;

                    case Asc.c_oAscError.ID.UplImageExt:
                        config.msg = this.uploadImageExtMessage;
                        break;

                    case Asc.c_oAscError.ID.UplImageFileCount:
                        config.msg = this.uploadImageFileCountMessage;
                        break;

                    case Asc.c_oAscError.ID.PastInMergeAreaError:
                        config.msg = this.pastInMergeAreaError;
                        break;

                    case Asc.c_oAscError.ID.FrmlWrongCountParentheses:
                        config.msg = this.errorWrongBracketsCount;
                        break;

                    case Asc.c_oAscError.ID.FrmlWrongOperator:
                        config.msg = this.errorWrongOperator;
                        break;

                    case Asc.c_oAscError.ID.FrmlWrongMaxArgument:
                        config.msg = this.errorCountArgExceed;
                        break;

                    case Asc.c_oAscError.ID.FrmlWrongCountArgument:
                        config.msg = this.errorCountArg;
                        break;

                    case Asc.c_oAscError.ID.FrmlWrongFunctionName:
                        config.msg = this.errorFormulaName;
                        break;

                    case Asc.c_oAscError.ID.FrmlAnotherParsingError:
                        config.msg = this.errorFormulaParsing;
                        break;

                    case Asc.c_oAscError.ID.FrmlWrongArgumentRange:
                        config.msg = this.errorArgsRange;
                        break;

                    case Asc.c_oAscError.ID.FrmlOperandExpected:
                        config.msg = this.errorOperandExpected;
                        break;

                    case Asc.c_oAscError.ID.FrmlWrongReferences:
                        config.msg = this.errorFrmlWrongReferences;
                        break;

                    case Asc.c_oAscError.ID.UnexpectedGuid:
                        config.msg = this.errorUnexpectedGuid;
                        break;

                    case Asc.c_oAscError.ID.Database:
                        config.msg = this.errorDatabaseConnection;
                        break;

                    case Asc.c_oAscError.ID.FileRequest:
                        config.msg = this.errorFileRequest;
                        break;

                    case Asc.c_oAscError.ID.FileVKey:
                        config.msg = this.errorFileVKey;
                        break;

                    case Asc.c_oAscError.ID.StockChartError:
                        config.msg = this.errorStockChart;
                        break;

                    case Asc.c_oAscError.ID.DataRangeError:
                        config.msg = this.errorDataRange;
                        break;

                    case Asc.c_oAscError.ID.MaxDataPointsError:
                        config.msg = this.errorMaxPoints;
                        break;

                    case Asc.c_oAscError.ID.VKeyEncrypt:
                        config.msg = this.errorToken;
                        break;

                    case Asc.c_oAscError.ID.KeyExpire:
                        config.msg = this.errorTokenExpire;
                        break;

                    case Asc.c_oAscError.ID.UserCountExceed:
                        config.msg = this.errorUsersExceed;
                        break;

                    case Asc.c_oAscError.ID.CannotMoveRange:
                        config.msg = this.errorMoveRange;
                        break;

                    case Asc.c_oAscError.ID.UplImageUrl:
                        config.msg = this.errorBadImageUrl;
                        break;

                    case Asc.c_oAscError.ID.CoAuthoringDisconnect:
                        config.msg = this.errorViewerDisconnect;
                        break;

                    case Asc.c_oAscError.ID.ConvertationPassword:
                        config.msg = this.errorFilePassProtect;
                        break;

                    case Asc.c_oAscError.ID.AutoFilterDataRangeError:
                        config.msg = this.errorAutoFilterDataRange;
                        break;

                    case Asc.c_oAscError.ID.AutoFilterChangeFormatTableError:
                        config.msg = this.errorAutoFilterChangeFormatTable;
                        break;

                    case Asc.c_oAscError.ID.AutoFilterChangeError:
                        config.msg = this.errorAutoFilterChange;
                        break;

                    case Asc.c_oAscError.ID.AutoFilterMoveToHiddenRangeError:
                        config.msg = this.errorAutoFilterHiddenRange;
                        break;

                    case Asc.c_oAscError.ID.CannotFillRange:
                        config.msg = this.errorFillRange;
                        break;

                    case Asc.c_oAscError.ID.UserDrop:
                        if (this._state.lostEditingRights) {
                            this._state.lostEditingRights = false;
                            return;
                        }
                        this._state.lostEditingRights = true;
                        config.msg = this.errorUserDrop;
                        Common.NotificationCenter.trigger('collaboration:sharingdeny');
                        break;

                    case Asc.c_oAscError.ID.InvalidReferenceOrName:
                        config.msg = this.errorInvalidRef;
                        break;

                    case Asc.c_oAscError.ID.LockCreateDefName:
                        config.msg = this.errorCreateDefName;
                        break;

                    case Asc.c_oAscError.ID.PasteMaxRangeError:
                        config.msg = this.errorPasteMaxRange;
                        break;

                    case Asc.c_oAscError.ID.LockedAllError:
                        config.msg = this.errorLockedAll;
                        break;

                    case Asc.c_oAscError.ID.Warning:
                        config.msg = this.errorConnectToServer.replace('%1', '{{API_URL_EDITING_CALLBACK}}');
                        config.closable = false;
                        break;

                    case Asc.c_oAscError.ID.LockedWorksheetRename:
                        config.msg = this.errorLockedWorksheetRename;
                        break;
                    
                    case Asc.c_oAscError.ID.OpenWarning:
                        config.msg = this.errorOpenWarning;
                        break;

                    case Asc.c_oAscError.ID.CopyMultiselectAreaError:
                        config.msg = this.errorCopyMultiselectArea;
                        break;

                    case Asc.c_oAscError.ID.PrintMaxPagesCount:
                        config.msg = this.errorPrintMaxPagesCount;
                        break;

                    case Asc.c_oAscError.ID.SessionAbsolute:
                        config.msg = this.errorSessionAbsolute;
                        break;

                    case Asc.c_oAscError.ID.SessionIdle:
                        config.msg = this.errorSessionIdle;
                        break;

                    case Asc.c_oAscError.ID.SessionToken:
                        config.msg = this.errorSessionToken;
                        break;

                    case Asc.c_oAscError.ID.AccessDeny:
                        config.msg = this.errorAccessDeny;
                        break;

                    case Asc.c_oAscError.ID.LockedCellPivot:
                        config.msg = this.errorLockedCellPivot;
                        break;

                    case Asc.c_oAscError.ID.ForceSaveButton:
                        config.msg = this.errorForceSave;
                        break;

                    case Asc.c_oAscError.ID.ForceSaveTimeout:
                        config.msg = this.errorForceSave;
                        console.warn(config.msg);
                        break;

                    case Asc.c_oAscError.ID.DataEncrypted:
                        config.msg = this.errorDataEncrypted;
                        break;

                    case Asc.c_oAscError.ID.EditingError:
                        config.msg = (this.appOptions.isDesktopApp && this.appOptions.isOffline) ? this.errorEditingSaveas : this.errorEditingDownloadas;
                        break;

                    case Asc.c_oAscError.ID.CannotChangeFormulaArray:
                        config.msg = this.errorChangeArray;
                        break;

                    case Asc.c_oAscError.ID.MultiCellsInTablesFormulaArray:
                        config.msg = this.errorMultiCellFormula;
                        break;

                    case Asc.c_oAscError.ID.MailToClientMissing:
                        config.msg = this.errorEmailClient;
                        break;

                    case Asc.c_oAscError.ID.NoDataToParse:
                        config.msg = this.errorNoDataToParse;
                        break;

                    default:
                        config.msg = (typeof id == 'string') ? id : this.errorDefaultMessage.replace('%1', id);
                        break;
                }


                if (level == Asc.c_oAscError.Level.Critical) {
                    Common.Gateway.reportError(id, config.msg);

                    config.title = this.criticalErrorTitle;
                    config.iconCls = 'error';
                    config.closable = false;

                    if (this.appOptions.canBackToFolder && !this.appOptions.isDesktopApp && typeof id !== 'string') {
                        config.msg += '<br/><br/>' + this.criticalErrorExtText;
                        config.callback = function(btn) {
                            if (btn == 'ok') {
                                Common.NotificationCenter.trigger('goback', true);
                            }
                        }
                    }
                    if (id == Asc.c_oAscError.ID.DataEncrypted) {
                        this.api.asc_coAuthoringDisconnect();
                        Common.NotificationCenter.trigger('api:disconnect');
                    }
                } else {
                    Common.Gateway.reportWarning(id, config.msg);

                    config.title    = this.notcriticalErrorTitle;
                    config.iconCls  = 'warn';
                    config.buttons  = ['ok'];
                    config.callback = _.bind(function(btn){
                        if (id == Asc.c_oAscError.ID.Warning && btn == 'ok' && this.appOptions.canDownload) {
                            Common.UI.Menu.Manager.hideAll();
                            (this.appOptions.isDesktopApp && this.appOptions.isOffline) ? this.api.asc_DownloadAs() : this.getApplication().getController('LeftMenu').leftMenu.showMenu('file:saveas');
                        } else if (id == Asc.c_oAscError.ID.EditingError) {
                            this.disableEditing(true);
                            Common.NotificationCenter.trigger('api:disconnect', true); // enable download and print
                        }
                        this._state.lostEditingRights = false;
                        this.onEditComplete();
                    }, this);
                }

                if ($('.asc-window.modal.alert:visible').length < 1 && (id !== Asc.c_oAscError.ID.ForceSaveTimeout)) {
                    Common.UI.alert(config);
                    Common.component.Analytics.trackEvent('Internal Error', id.toString());
                }
            },

            onCoAuthoringDisconnect: function() {
                this.getApplication().getController('Viewport').getView('Viewport').setMode({isDisconnected:true});
                this.getApplication().getController('Viewport').getView('Common.Views.Header').setCanRename(false);
                this.appOptions.canRename = false;
                this._state.isDisconnected = true;
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
                        owner: this.getApplication().getController('Toolbar').getView('Toolbar'),
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

            updateWindowTitle: function(change, force) {
                if (this._state.isDocModified !== change || force) {
                    var title = this.defaultTitleText;

                    if (!_.isEmpty(this.headerView.getDocumentCaption()))
                        title = this.headerView.getDocumentCaption() + ' - ' + title;

                    if (change) {
                        clearTimeout(this._state.timerCaption);
                        if (!_.isUndefined(title)) {
                            title = '* ' + title;
                            this.headerView.setDocumentCaption(this.headerView.getDocumentCaption(), true);
                        }
                    } else {
                        if (this._state.fastCoauth && this._state.usersCount>1) {
                            var me = this;
                            this._state.timerCaption = setTimeout(function () {
                                me.headerView.setDocumentCaption(me.headerView.getDocumentCaption(), false);
                            }, 500);
                        } else
                            this.headerView.setDocumentCaption(this.headerView.getDocumentCaption(), false);
                    }

                    if (window.document.title != title)
                        window.document.title = title;

                    Common.Gateway.setDocumentModified(change);

                    this._state.isDocModified = change;
                }
            },

            onDocumentChanged: function() {
            },

            onDocumentModifiedChanged: function(change) {
                this.updateWindowTitle(change);
                Common.Gateway.setDocumentModified(change);

                if (this.toolbarView && this.toolbarView.btnCollabChanges && this.api) {
                    var isSyncButton = this.toolbarView.btnCollabChanges.$icon.hasClass('btn-synch'),
                        forcesave = this.appOptions.forcesave,
                        cansave = this.api.asc_isDocumentCanSave(),
                        isDisabled = !cansave && !isSyncButton && !forcesave || this._state.isDisconnected || this._state.fastCoauth && this._state.usersCount>1 && !forcesave;
                        this.toolbarView.btnSave.setDisabled(isDisabled);
                }
            },

            onDocumentCanSaveChanged: function (isCanSave) {
                if (this.toolbarView && this.toolbarView.btnCollabChanges) {
                    var isSyncButton = this.toolbarView.btnCollabChanges.$icon.hasClass('btn-synch'),
                        forcesave = this.appOptions.forcesave,
                        isDisabled = !isCanSave && !isSyncButton && !forcesave || this._state.isDisconnected || this._state.fastCoauth && this._state.usersCount>1 && !forcesave;
                    this.toolbarView.btnSave.setDisabled(isDisabled);
                }
            },

            onBeforeUnload: function() {
                Common.localStorage.save();

                var isEdit = this.permissions.edit !== false && this.editorConfig.mode !== 'view' && this.editorConfig.mode !== 'editdiagram' && this.editorConfig.mode !== 'editmerge';
                if (isEdit && this.api.asc_isDocumentModified()) {
                    var me = this;
                    this.api.asc_stopSaving();
                    this.continueSavingTimer = window.setTimeout(function() {
                        me.api.asc_continueSaving();
                    }, 500);

                    return this.leavePageText;
                }
            },

            onUnload: function() {
                if (this.continueSavingTimer) clearTimeout(this.continueSavingTimer);
            },

            hidePreloader: function() {
                if (!this._state.customizationDone) {
                    this._state.customizationDone = true;
                    if (this.appOptions.customization) {
                        if (this.appOptions.isDesktopApp)
                            this.appOptions.customization.about = false;
                        else if (!this.appOptions.canBrandingExt)
                            this.appOptions.customization.about = true;
                    }
                    Common.Utils.applyCustomization(this.appOptions.customization, mapCustomizationElements);
                    if (this.appOptions.canBrandingExt) {
                        Common.Utils.applyCustomization(this.appOptions.customization, mapCustomizationExtElements);
                        Common.Utils.applyCustomizationPlugins(this.UICustomizePlugins);
                    }
                }
                
                this.stackLongActions.pop({id: InitApplication, type: Asc.c_oAscAsyncActionType.BlockInteraction});
                Common.NotificationCenter.trigger('layout:changed', 'main');
                $('#loading-mask').hide().remove();

                Common.Controllers.Desktop.process('preloader:hide');
            },

            onDownloadUrl: function(url) {
                if (this._state.isFromGatewayDownloadAs)
                    Common.Gateway.downloadAs(url);
                this._state.isFromGatewayDownloadAs = false;
            },

            onDownloadCancel: function() {
                this._state.isFromGatewayDownloadAs = false;
            },

            onUpdateVersion: function(callback) {
                var me = this;
                me.needToUpdateVersion = true;
                me.onLongActionEnd(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);
                Common.UI.error({
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

            onAdvancedOptions: function(advOptions, mode) {
                if (this._state.openDlg) return;

                var type = advOptions.asc_getOptionId(),
                    me = this;
                if (type == Asc.c_oAscAdvancedOptionsID.CSV) {
                    me._state.openDlg = new Common.Views.OpenDialog({
                        title: Common.Views.OpenDialog.prototype.txtTitle.replace('%1', 'CSV'),
                        closable: (mode==2), // if save settings
                        type: Common.Utils.importTextType.CSV,
                        preview: advOptions.asc_getOptions().asc_getData(),
                        codepages: advOptions.asc_getOptions().asc_getCodePages(),
                        settings: advOptions.asc_getOptions().asc_getRecommendedSettings(),
                        api: me.api,
                        handler: function (result, encoding, delimiter, delimiterChar) {
                            me.isShowOpenDialog = false;
                            if (result == 'ok') {
                                if (me && me.api) {
                                    me.api.asc_setAdvancedOptions(type, new Asc.asc_CCSVAdvancedOptions(encoding, delimiter, delimiterChar));
                                    me.loadMask && me.loadMask.show();
                                }
                            }
                            me._state.openDlg = null;
                        }
                    });
                } else if (type == Asc.c_oAscAdvancedOptionsID.DRM) {
                    me._state.openDlg = new Common.Views.OpenDialog({
                        title: Common.Views.OpenDialog.prototype.txtTitleProtected,
                        closeFile: me.appOptions.canRequestClose,
                        type: Common.Utils.importTextType.DRM,
                        warning: !(me.appOptions.isDesktopApp && me.appOptions.isOffline),
                        validatePwd: !!me._state.isDRM,
                        handler: function (result, value) {
                            me.isShowOpenDialog = false;
                            if (result == 'ok') {
                                if (me && me.api) {
                                    me.api.asc_setAdvancedOptions(type, new Asc.asc_CDRMAdvancedOptions(value));
                                    me.loadMask && me.loadMask.show();
                                }
                            } else {
                                Common.Gateway.requestClose();
                                Common.Controllers.Desktop.requestClose();
                            }
                            me._state.openDlg = null;
                        }
                    });
                    me._state.isDRM = true;
                }
                if (me._state.openDlg) {
                    this.isShowOpenDialog = true;
                    this.loadMask && this.loadMask.hide();
                    this.onLongActionEnd(Asc.c_oAscAsyncActionType.BlockInteraction, LoadingDocument);
                    me._state.openDlg.show();
                }
            },

            onActiveSheetChanged: function(index) {
                if (!this.appOptions.isEditMailMerge && !this.appOptions.isEditDiagram && window.editor_elements_prepared) {
                    this.application.getController('Statusbar').selectTab(index);

                    if (this.appOptions.canViewComments && !this.dontCloseDummyComment) {
                        Common.NotificationCenter.trigger('comments:updatefilter', ['doc', 'sheet' + this.api.asc_getWorksheetId(index)], false ); //  hide popover
                    }
                }
            },

            onConfirmAction: function(id, apiCallback) {
                var me = this;
                if (id == Asc.c_oAscConfirm.ConfirmReplaceRange) {
                    Common.UI.warning({
                        title: this.notcriticalErrorTitle,
                        msg: this.confirmMoveCellRange,
                        buttons: ['yes', 'no'],
                        primary: 'yes',
                        callback: _.bind(function(btn) {
                            if (apiCallback)  {
                                apiCallback(btn === 'yes');
                            }
                            if (btn == 'yes') {
                                me.onEditComplete(me.application.getController('DocumentHolder').getView('DocumentHolder'));
                            }
                        }, this)
                    });
                } else if (id == Asc.c_oAscConfirm.ConfirmPutMergeRange) {
                    Common.UI.warning({
                        closable: false,
                        title: this.notcriticalErrorTitle,
                        msg: this.confirmPutMergeRange,
                        buttons: ['ok'],
                        primary: 'ok',
                        callback: _.bind(function(btn) {
                            if (apiCallback)  {
                                apiCallback();
                            }
                            me.onEditComplete(me.application.getController('DocumentHolder').getView('DocumentHolder'));
                        }, this)
                    });
                }
            },

            initNames: function() {
                this.shapeGroupNames = [
                    this.txtBasicShapes,
                    this.txtFiguredArrows,
                    this.txtMath,
                    this.txtCharts,
                    this.txtStarsRibbons,
                    this.txtCallouts,
                    this.txtButtons,
                    this.txtRectangles,
                    this.txtLines
                ];
            },

            fillAutoShapes: function(groupNames, shapes){
                if (_.isEmpty(shapes) || _.isEmpty(groupNames) || shapes.length != groupNames.length)
                    return;

                var me = this,
                    shapegrouparray = [],
                    shapeStore = this.getCollection('ShapeGroups');

                shapeStore.reset();

                var groupscount = groupNames.length;
                _.each(groupNames, function(groupName, index){
                    var store = new Backbone.Collection([], {
                        model: SSE.Models.ShapeModel
                    });

                    var cols = (shapes[index].length) > 18 ? 7 : 6,
                        height = Math.ceil(shapes[index].length/cols) * 35 + 3,
                        width = 30 * cols;

                    _.each(shapes[index], function(shape, idx){
                        store.add({
                            imageUrl : shape.Image,
                            data     : {shapeType: shape.Type},
                            tip      : me['txtShape_' + shape.Type] || (me.textShape + ' ' + (idx+1)),
                            allowSelected : true,
                            selected: false
                        });
                    });

                    shapegrouparray.push({
                        groupName   : me.shapeGroupNames[index],
                        groupStore  : store,
                        groupWidth  : width,
                        groupHeight : height
                    });
                });

                shapeStore.add(shapegrouparray);

                setTimeout(function(){
                    me.getApplication().getController('Toolbar').fillAutoShapes();
                }, 50);
            },

            fillTextArt: function(shapes){
                if (_.isEmpty(shapes)) return;

                var me = this, arr = [],
                    artStore = this.getCollection('Common.Collections.TextArt');

                _.each(shapes, function(shape, index){
                    arr.push({
                        imageUrl : shape,
                        data     : index,
                        allowSelected : true,
                        selected: false
                    });
                });
                artStore.reset(arr);

                setTimeout(function(){
                    me.getApplication().getController('Toolbar').fillTextArt();
                }, 50);

                setTimeout(function(){
                    me.getApplication().getController('RightMenu').fillTextArt();
                }, 50);

            },
            
            updateThemeColors: function() {
                var me = this;
                setTimeout(function(){
                    me.getApplication().getController('RightMenu').UpdateThemeColors();
                }, 50);

                setTimeout(function(){
                    me.getApplication().getController('Toolbar').updateThemeColors();
                }, 50);

                setTimeout(function(){
                    me.getApplication().getController('Statusbar').updateThemeColors();
                }, 50);
            },

            onSendThemeColors: function(colors, standart_colors) {
                Common.Utils.ThemeColor.setColors(colors, standart_colors);
                if (window.styles_loaded && !this.appOptions.isEditMailMerge && !this.appOptions.isEditDiagram) {
                    this.updateThemeColors();
                    this.fillTextArt(this.api.asc_getTextArtPreviews());
                }
            },

            onInternalCommand: function(data) {
                if (data) {
                    switch (data.command) {
                    case 'setChartData':    this.setChartData(data.data); break;
                    case 'getChartData':    this.getChartData(); break;
                    case 'clearChartData':  this.clearChartData(); break;
                    case 'setMergeData':    this.setMergeData(data.data); break;
                    case 'getMergeData':    this.getMergeData(); break;
                    case 'setAppDisabled':
                        if (this.isAppDisabled===undefined && !data.data) { // first editor opening
                            Common.NotificationCenter.trigger('layout:changed', 'main');
                            this.loadMask && this.loadMask.isVisible() && this.loadMask.updatePosition();
                        }
                        this.isAppDisabled = data.data;
                        break;
                    case 'queryClose':
                        if ($('body .asc-window:visible').length === 0) {
                            this.isFrameClosed = true;
                            this.api.asc_closeCellEditor();
                            Common.UI.Menu.Manager.hideAll();
                            Common.Gateway.internalMessage('canClose', {mr:data.data.mr, answer: true});
                        } else
                            Common.Gateway.internalMessage('canClose', {answer: false});
                        break;
                    case 'window:drag':
                        this.isDiagramDrag = data.data;
                        break;
                    case 'processmouse':
                        this.onProcessMouse(data.data);
                        break;
                    }
                }
            },

            setChartData: function(chart) {
                if (typeof chart === 'object' && this.api) {
                    this.api.asc_addChartDrawingObject(chart);
                    this.isFrameClosed = false;
                }
            },

            getChartData: function() {
                if (this.api) {
                    var chartData = this.api.asc_getWordChartObject();

                    if (typeof chartData === 'object') {
                        Common.Gateway.internalMessage('chartData', {
                            data: chartData
                        });
                    }
                }
            },

            clearChartData: function() {
                this.api && this.api.asc_closeCellEditor();
            },

            setMergeData: function(merge) {
                if (typeof merge === 'object' && this.api) {
                    this.api.asc_setData(merge);
                    this.isFrameClosed = false;
                }
            },

            getMergeData: function() {
                if (this.api) {
                    var mergeData = this.api.asc_getData();

                    if (typeof mergeData === 'object') {
                        Common.Gateway.internalMessage('mergeData', {
                            data: mergeData
                        });
                    }
                }
            },

            unitsChanged: function(m) {
                var value = Common.localStorage.getItem("sse-settings-unit");
                value = (value!==null) ? parseInt(value) : Common.Utils.Metric.getDefaultMetric();
                Common.Utils.Metric.setCurrentMetric(value);
                Common.Utils.InternalSettings.set("sse-settings-unit", value);
                this.getApplication().getController('RightMenu').updateMetricUnit();
                this.getApplication().getController('Print').getView('MainSettingsPrint').updateMetricUnit();
                this.getApplication().getController('Toolbar').getView('Toolbar').updateMetricUnit();
            },

            _compareActionStrong: function(obj1, obj2){
                return obj1.id === obj2.id && obj1.type === obj2.type;
            },

            _compareActionWeak: function(obj1, obj2){
                return obj1.type === obj2.type;
            },

            onContextMenu: function(event){
                var canCopyAttr = event.target.getAttribute('data-can-copy'),
                    isInputEl   = (event.target instanceof HTMLInputElement) || (event.target instanceof HTMLTextAreaElement);

                if ((isInputEl && canCopyAttr === 'false') ||
                   (!isInputEl && canCopyAttr !== 'true')) {
                    event.stopPropagation();
                    event.preventDefault();
                    return false;
                }
            },

            onNamedRangeLocked: function() {
                if ($('.asc-window.modal.alert:visible').length < 1) {
                    Common.UI.alert({
                        msg: this.errorCreateDefName,
                        title: this.notcriticalErrorTitle,
                        iconCls: 'warn',
                        buttons: ['ok'],
                        callback: _.bind(function(btn){
                            this.onEditComplete();
                        }, this)
                    });
                }
            },

            onTryUndoInFastCollaborative: function() {
                var val = window.localStorage.getItem("sse-hide-try-undoredo");
                if (!(val && parseInt(val) == 1))
                    Common.UI.info({
                        width: 500,
                        msg: this.textTryUndoRedo,
                        iconCls: 'info',
                        buttons: ['custom', 'cancel'],
                        primary: 'custom',
                        customButtonText: this.textStrict,
                        dontshow: true,
                        callback: _.bind(function(btn, dontshow){
                            if (dontshow) window.localStorage.setItem("sse-hide-try-undoredo", 1);
                            if (btn == 'custom') {
                                Common.localStorage.setItem("sse-settings-coauthmode", 0);
                                this.api.asc_SetFastCollaborative(false);
                                Common.Utils.InternalSettings.set("sse-settings-coauthmode", false);
                                this.getApplication().getController('Common.Controllers.ReviewChanges').applySettings();
                                this._state.fastCoauth = false;
                            }
                            this.onEditComplete();
                        }, this)
                    });
            },

            onAuthParticipantsChanged: function(users) {
                var length = 0;
                _.each(users, function(item){
                    if (!item.asc_getView())
                        length++;
                });
                this._state.usersCount = length;
            },

            applySettings: function() {
                if (this.appOptions.isEdit && !this.appOptions.isOffline && this.appOptions.canCoAuthoring) {
                    var value = Common.localStorage.getItem("sse-settings-coauthmode"),
                        oldval = this._state.fastCoauth;
                    this._state.fastCoauth = (value===null || parseInt(value) == 1);
                    if (this._state.fastCoauth && !oldval)
                        this.toolbarView.synchronizeChanges();
                }
                if (this.appOptions.canForcesave) {
                    this.appOptions.forcesave = Common.localStorage.getBool("sse-settings-forcesave", this.appOptions.canForcesave);
                    Common.Utils.InternalSettings.set("sse-settings-forcesave", this.appOptions.forcesave);
                    this.api.asc_setIsForceSaveOnUserSave(this.appOptions.forcesave);
                }
            },

            onDocumentName: function(name) {
                this.headerView.setDocumentCaption(name);
                this.updateWindowTitle(this.api.asc_isDocumentModified(), true);
            },

            onMeta: function(meta) {
                var app = this.getApplication(),
                    filemenu = app.getController('LeftMenu').getView('LeftMenu').getMenu('file');
                app.getController('Viewport').getView('Common.Views.Header').setDocumentCaption(meta.title);
                this.updateWindowTitle(this.api.asc_isDocumentModified(), true);
                this.appOptions.spreadsheet.title = meta.title;
                filemenu.loadDocument({doc:this.appOptions.spreadsheet});
                filemenu.panels['info'].updateInfo(this.appOptions.spreadsheet);
                Common.Gateway.metaChange(meta);
            },

            onPrint: function() {
                if (!this.appOptions.canPrint || this.isModalShowed) return;
                Common.NotificationCenter.trigger('print', this);
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
                        me.iframePrint.contentWindow.focus();
                        me.iframePrint.contentWindow.print();
                        me.iframePrint.contentWindow.blur();
                        window.focus();
                    };
                }
                if (url) this.iframePrint.src = url;
            },

            requestPlugins: function(pluginsPath) { // request plugins
                if (!pluginsPath) return;

                var config_plugins = (this.plugins && this.plugins.pluginsData && this.plugins.pluginsData.length>0) ? this.updatePlugins(this.plugins, false) : null, // return plugins object
                    request_plugins = this.updatePlugins( Common.Utils.getConfigJson(pluginsPath), false );

                this.updatePluginsList({
                    autostart: (config_plugins&&config_plugins.autostart ? config_plugins.autostart : []).concat(request_plugins&&request_plugins.autostart ? request_plugins.autostart : []),
                    pluginsData: (config_plugins ? config_plugins.pluginsData : []).concat(request_plugins ? request_plugins.pluginsData : [])
                }, false);
            },

            updatePlugins: function(plugins, uiCustomize) { // plugins from config
                if (!plugins) return;

                var pluginsData = (uiCustomize) ? plugins.UIpluginsData : plugins.pluginsData;
                if (!pluginsData || pluginsData.length<1) return;

                var arr = [];
                pluginsData.forEach(function(item){
                    var value = Common.Utils.getConfigJson(item);
                    if (value) {
                        value.baseUrl = item.substring(0, item.lastIndexOf("config.json"));
                        arr.push(value);
                    }
                });

                if (arr.length>0) {
                    var autostart = plugins.autostart || plugins.autoStartGuid;
                    if (typeof (autostart) == 'string')
                        autostart = [autostart];
                    plugins.autoStartGuid && console.warn("Obsolete: The autoStartGuid parameter is deprecated. Please check the documentation for new plugin connection configuration.");

                    if (uiCustomize)
                        this.updatePluginsList({
                            autostart: autostart,
                            pluginsData: arr
                        }, !!uiCustomize);
                    else return {
                        autostart: autostart,
                        pluginsData: arr
                    };
                }
            },

            updatePluginsList: function(plugins, uiCustomize) {
                var pluginStore = this.getApplication().getCollection('Common.Collections.Plugins'),
                    isEdit = this.appOptions.isEdit;
                if (plugins) {
                    var arr = [], arrUI = [],
                        lang = this.appOptions.lang.split(/[\-\_]/)[0];
                    plugins.pluginsData.forEach(function(item){
                        if (_.find(arr, function(arritem) {
                                return (arritem.get('baseUrl') == item.baseUrl || arritem.get('guid') == item.guid);
                            }) || pluginStore.findWhere({baseUrl: item.baseUrl}) || pluginStore.findWhere({guid: item.guid}))
                            return;

                        var variationsArr = [],
                            pluginVisible = false;
                        item.variations.forEach(function(itemVar){
                            var visible = (isEdit || itemVar.isViewer && (itemVar.isDisplayedInViewer!==false)) && _.contains(itemVar.EditorsSupport, 'cell') && !itemVar.isSystem;
                            if ( visible ) pluginVisible = true;

                            if ( item.isUICustomizer ) {
                                visible && arrUI.push(item.baseUrl + itemVar.url);
                            } else {
                                var model = new Common.Models.PluginVariation(itemVar);
                                var description = itemVar.description;
                                if (typeof itemVar.descriptionLocale == 'object')
                                    description = itemVar.descriptionLocale[lang] || itemVar.descriptionLocale['en'] || description || '';

                                _.each(itemVar.buttons, function(b, index){
                                    if (typeof b.textLocale == 'object')
                                        b.text = b.textLocale[lang] || b.textLocale['en'] || b.text || '';
                                    b.visible = (isEdit || b.isViewer !== false);
                                });

                                model.set({
                                    description: description,
                                    index: variationsArr.length,
                                    url: itemVar.url,
                                    icons: itemVar.icons,
                                    buttons: itemVar.buttons,
                                    visible: visible
                                });

                                variationsArr.push(model);
                            }
                        });
                        if (variationsArr.length>0 && !item.isUICustomizer) {
                            var name = item.name;
                            if (typeof item.nameLocale == 'object')
                                name = item.nameLocale[lang] || item.nameLocale['en'] || name || '';

                            arr.push(new Common.Models.Plugin({
                                name : name,
                                guid: item.guid,
                                baseUrl : item.baseUrl,
                                variations: variationsArr,
                                currentVariation: 0,
                                visible: pluginVisible,
                                groupName: (item.group) ? item.group.name : '',
                                groupRank: (item.group) ? item.group.rank : 0
                            }));
                        }
                    });

                    if (uiCustomize!==false)  // from ui customizer in editor config or desktop event
                        this.UICustomizePlugins = arrUI;

                    if ( !uiCustomize && pluginStore) {
                        arr = pluginStore.models.concat(arr);
                        arr.sort(function(a, b){
                            var rank_a = a.get('groupRank'),
                                rank_b = b.get('groupRank');
                            if (rank_a < rank_b)
                                return (rank_a==0) ? 1 : -1;
                            if (rank_a > rank_b)
                                return (rank_b==0) ? -1 : 1;
                            return 0;
                        });
                        pluginStore.reset(arr);
                        this.appOptions.canPlugins = !pluginStore.isEmpty();
                    }
                } else if (!uiCustomize){
                    this.appOptions.canPlugins = false;
                }
                if (!uiCustomize) this.getApplication().getController('LeftMenu').enablePlugins();
                if (this.appOptions.canPlugins) {
                    this.getApplication().getController('Common.Controllers.Plugins').setMode(this.appOptions).runAutoStartPlugins(plugins.autostart);
                }
            },

            resetPluginsList: function() {
                this.getApplication().getCollection('Common.Collections.Plugins').reset();
            },

            leavePageText: 'You have unsaved changes in this document. Click \'Stay on this Page\' then \'Save\' to save them. Click \'Leave this Page\' to discard all the unsaved changes.',
            criticalErrorTitle: 'Error',
            notcriticalErrorTitle: 'Warning',
            errorDefaultMessage: 'Error code: %1',
            criticalErrorExtText: 'Press "OK" to to back to document list.',
            openTitleText: 'Opening Document',
            openTextText: 'Opening document...',
            saveTitleText: 'Saving Document',
            saveTextText: 'Saving document...',
            loadFontsTitleText: 'Loading Data',
            loadFontsTextText: 'Loading data...',
            loadImagesTitleText: 'Loading Images',
            loadImagesTextText: 'Loading images...',
            loadFontTitleText: 'Loading Data',
            loadFontTextText: 'Loading data...',
            loadImageTitleText: 'Loading Image',
            loadImageTextText: 'Loading image...',
            downloadTitleText: 'Downloading Document',
            downloadTextText: 'Downloading document...',
            printTitleText: 'Printing Document',
            printTextText: 'Printing document...',
            uploadImageTitleText: 'Uploading Image',
            uploadImageTextText: 'Uploading image...',
            savePreparingText: 'Preparing to save',
            savePreparingTitle: 'Preparing to save. Please wait...',
            loadingDocumentTitleText: 'Loading spreadsheet',
            uploadImageSizeMessage: 'Maximium image size limit exceeded.',
            uploadImageExtMessage: 'Unknown image format.',
            uploadImageFileCountMessage: 'No images uploaded.',
            reloadButtonText: 'Reload Page',
            unknownErrorText: 'Unknown error.',
            convertationTimeoutText: 'Convertation timeout exceeded.',
            downloadErrorText: 'Download failed.',
            unsupportedBrowserErrorText: 'Your browser is not supported.',
            requestEditFailedTitleText: 'Access denied',
            requestEditFailedMessageText: 'Someone is editing this document right now. Please try again later.',
            warnBrowserZoom: 'Your browser\'s current zoom setting is not fully supported. Please reset to the default zoom by pressing Ctrl+0.',
            warnBrowserIE9: 'The application has low capabilities on IE9. Use IE10 or higher',
            pastInMergeAreaError: 'Cannot change part of a merged cell',
            titleRecalcFormulas: 'Calculating formulas...',
            textRecalcFormulas: 'Calculating formulas...',
            textPleaseWait: 'It\'s working hard. Please wait...',
            errorWrongBracketsCount: 'Found an error in the formula entered.<br>Wrong cout of brackets.',
            errorWrongOperator: 'An error in the entered formula. Wrong operator is used.<br>Please correct the error or use the Esc button to cancel the formula editing.',
            errorCountArgExceed: 'Found an error in the formula entered.<br>Count of arguments exceeded.',
            errorCountArg: 'Found an error in the formula entered.<br>Invalid number of arguments.',
            errorFormulaName: 'Found an error in the formula entered.<br>Incorrect formula name.',
            errorFormulaParsing: 'Internal error while the formula parsing.',
            errorArgsRange: 'Found an error in the formula entered.<br>Incorrect arguments range.',
            errorUnexpectedGuid: 'External error.<br>Unexpected Guid. Please, contact support.',
            errorDatabaseConnection: 'External error.<br>Database connection error. Please, contact support.',
            errorFileRequest: 'External error.<br>File Request. Please, contact support.',
            errorFileVKey: 'External error.<br>Incorrect securety key. Please, contact support.',
            errorStockChart: 'Incorrect row order. To build a stock chart place the data on the sheet in the following order:<br> opening price, max price, min price, closing price.',
            errorDataRange: 'Incorrect data range.',
            errorOperandExpected: 'The entered function syntax is not correct. Please check if you are missing one of the parentheses - \'(\' or \')\'.',
            errorKeyEncrypt: 'Unknown key descriptor',
            errorKeyExpire: 'Key descriptor expired',
            errorUsersExceed: 'Count of users was exceed',
            errorMoveRange: 'Cann\'t change a part of merged cell',
            errorBadImageUrl: 'Image url is incorrect',
            errorCoAuthoringDisconnect: 'Server connection lost. You can\'t edit anymore.',
            errorFilePassProtect: 'The file is password protected and cannot be opened.',
            errorLockedAll: 'The operation could not be done as the sheet has been locked by another user.',
            txtEditingMode: 'Set editing mode...',
            textLoadingDocument: 'Loading spreadsheet',
            textConfirm: 'Confirmation',
            confirmMoveCellRange: 'The destination cell\'s range can contain data. Continue the operation?',
            textYes: 'Yes',
            textNo: 'No',
            textAnonymous: 'Anonymous',
            txtBasicShapes: 'Basic Shapes',
            txtFiguredArrows: 'Figured Arrows',
            txtMath: 'Math',
            txtCharts: 'Charts',
            txtStarsRibbons: 'Stars & Ribbons',
            txtCallouts: 'Callouts',
            txtButtons: 'Buttons',
            txtRectangles: 'Rectangles',
            txtLines: 'Lines',
            txtDiagramTitle: 'Chart Title',
            txtXAxis: 'X Axis',
            txtYAxis: 'Y Axis',
            txtSeries: 'Seria',
            warnProcessRightsChange: 'You have been denied the right to edit the file.',
            errorProcessSaveResult: 'Saving is failed.',
            errorAutoFilterDataRange: 'The operation could not be done for the selected range of cells.<br>Select a uniform data range inside or outside the table and try again.',
            errorAutoFilterChangeFormatTable: 'The operation could not be done for the selected cells as you cannot move a part of the table.<br>Select another data range so that the whole table was shifted and try again.',
            errorAutoFilterHiddenRange: 'The operation cannot be performed because the area contains filtered cells.<br>Please unhide the filtered elements and try again.',
            errorAutoFilterChange: 'The operation is not allowed, as it is attempting to shift cells in a table on your worksheet.',
            textCloseTip: 'Click to close the tip.',
            textShape: 'Shape',
            errorFillRange: 'Could not fill the selected range of cells.<br>All the merged cells need to be the same size.',
            errorUpdateVersion: 'The file version has been changed. The page will be reloaded.',
            errorUserDrop: 'The file cannot be accessed right now.',
            txtArt: 'Your text here',
            errorInvalidRef: 'Enter a correct name for the selection or a valid reference to go to.',
            errorCreateDefName: 'The existing named ranges cannot be edited and the new ones cannot be created<br>at the moment as some of them are being edited.',
            errorPasteMaxRange: 'The copy and paste area does not match. Please select an area with the same size or click the first cell in a row to paste the copied cells.',
            errorConnectToServer: ' The document could not be saved. Please check connection settings or contact your administrator.<br>When you click the \'OK\' button, you will be prompted to download the document.<br><br>' +
                                  'Find more information about connecting Document Server <a href=\"%1\" target=\"_blank\">here</a>',
            errorLockedWorksheetRename: 'The sheet cannot be renamed at the moment as it is being renamed by another user',
            textTryUndoRedo: 'The Undo/Redo functions are disabled for the Fast co-editing mode.<br>Click the \'Strict mode\' button to switch to the Strict co-editing mode to edit the file without other users interference and send your changes only after you save them. You can switch between the co-editing modes using the editor Advanced settings.',
            textStrict: 'Strict mode',
            errorOpenWarning: 'The length of one of the formulas in the file exceeded<br>the allowed number of characters and it was removed.',
            errorFrmlWrongReferences: 'The function refers to a sheet that does not exist.<br>Please check the data and try again.',
            textBuyNow: 'Visit website',
            textNoLicenseTitle: '%1 open source version',
            textContactUs: 'Contact sales',
            confirmPutMergeRange: 'The source data contains merged cells.<br>They will be unmerged before they are pasted into the table.',
            errorViewerDisconnect: 'Connection is lost. You can still view the document,<br>but will not be able to download or print until the connection is restored.',
            warnLicenseExp: 'Your license has expired.<br>Please update your license and refresh the page.',
            titleLicenseExp: 'License expired',
            openErrorText: 'An error has occurred while opening the file',
            saveErrorText: 'An error has occurred while saving the file',
            errorCopyMultiselectArea: 'This command cannot be used with multiple selections.<br>Select a single range and try again.',
            errorPrintMaxPagesCount: 'Unfortunately, it’s not possible to print more than 1500 pages at once in the current version of the program.<br>This restriction will be eliminated in upcoming releases.',
            errorToken: 'The document security token is not correctly formed.<br>Please contact your Document Server administrator.',
            errorTokenExpire: 'The document security token has expired.<br>Please contact your Document Server administrator.',
            errorSessionAbsolute: 'The document editing session has expired. Please reload the page.',
            errorSessionIdle: 'The document has not been edited for quite a long time. Please reload the page.',
            errorSessionToken: 'The connection to the server has been interrupted. Please reload the page.',
            errorAccessDeny: 'You are trying to perform an action you do not have rights for.<br>Please contact your Document Server administrator.',
            titleServerVersion: 'Editor updated',
            errorServerVersion: 'The editor version has been updated. The page will be reloaded to apply the changes.',
            errorLockedCellPivot: 'You cannot change data inside a pivot table.',
            txtAccent: 'Accent',
            txtStyle_Normal: 'Normal',
            txtStyle_Heading_1: 'Heading 1',
            txtStyle_Heading_2: 'Heading 2',
            txtStyle_Heading_3: 'Heading 3',
            txtStyle_Heading_4: 'Heading 4',
            txtStyle_Title: 'Title',
            txtStyle_Neutral: 'Neutral',
            txtStyle_Bad: 'Bad',
            txtStyle_Good: 'Good',
            txtStyle_Input: 'Input',
            txtStyle_Output: 'Output',
            txtStyle_Calculation: 'Calculation',
            txtStyle_Check_Cell: 'Check Cell',
            txtStyle_Explanatory_Text: 'Explanatory Text',
            txtStyle_Note: 'Note',
            txtStyle_Linked_Cell: 'Linked Cell',
            txtStyle_Warning_Text: 'Warning Text',
            txtStyle_Total: 'Total',
            txtStyle_Currency: 'Currency',
            txtStyle_Percent: 'Percent',
            txtStyle_Comma: 'Comma',
            errorForceSave: "An error occurred while saving the file. Please use the 'Download as' option to save the file to your computer hard drive or try again later.",
            errorMaxPoints: "The maximum number of points in series per chart is 4096.",
            warnNoLicense: 'This version of %1 editors has certain limitations for concurrent connections to the document server.<br>If you need more please consider purchasing a commercial license.',
            warnNoLicenseUsers: 'This version of %1 Editors has certain limitations for concurrent users.<br>If you need more please consider purchasing a commercial license.',
            warnLicenseExceeded: 'The number of concurrent connections to the document server has been exceeded and the document will be opened for viewing only.<br>Please contact your administrator for more information.',
            warnLicenseUsersExceeded: 'The number of concurrent users has been exceeded and the document will be opened for viewing only.<br>Please contact your administrator for more information.',
            errorDataEncrypted: 'Encrypted changes have been received, they cannot be deciphered.',
            textClose: 'Close',
            textPaidFeature: 'Paid feature',
            scriptLoadError: 'The connection is too slow, some of the components could not be loaded. Please reload the page.',
            errorEditingSaveas: 'An error occurred during the work with the document.<br>Use the \'Save as...\' option to save the file backup copy to your computer hard drive.',
            errorEditingDownloadas: 'An error occurred during the work with the document.<br>Use the \'Download as...\' option to save the file backup copy to your computer hard drive.',
            txtShape_textRect: 'Text Box',
            txtShape_rect: 'Rectangle',
            txtShape_ellipse: 'Ellipse',
            txtShape_triangle: 'Triangle',
            txtShape_rtTriangle: 'Right Triangle',
            txtShape_parallelogram: 'Parallelogram',
            txtShape_trapezoid: 'Trapezoid',
            txtShape_diamond: 'Diamond',
            txtShape_pentagon: 'Pentagon',
            txtShape_hexagon: 'Hexagon',
            txtShape_heptagon: 'Heptagon',
            txtShape_octagon: 'Octagon',
            txtShape_decagon: 'Decagon',
            txtShape_dodecagon: 'Dodecagon',
            txtShape_pie: 'Pie',
            txtShape_chord: 'Chord',
            txtShape_teardrop: 'Teardrop',
            txtShape_frame: 'Frame',
            txtShape_halfFrame: 'Half Frame',
            txtShape_corner: 'Corner',
            txtShape_diagStripe: 'Diagonal Stripe',
            txtShape_plus: 'Plus',
            txtShape_plaque: 'Sign',
            txtShape_can: 'Can',
            txtShape_cube: 'Cube',
            txtShape_bevel: 'Bevel',
            txtShape_donut: 'Donut',
            txtShape_noSmoking: '"No" Symbol',
            txtShape_blockArc: 'Block Arc',
            txtShape_foldedCorner: 'Folded Corner',
            txtShape_smileyFace: 'Smiley Face',
            txtShape_heart: 'Heart',
            txtShape_lightningBolt: 'Lightning Bolt',
            txtShape_sun: 'Sun',
            txtShape_moon: 'Moon',
            txtShape_cloud: 'Cloud',
            txtShape_arc: 'Arc',
            txtShape_bracePair: 'Double Brace',
            txtShape_leftBracket: 'Left Bracket',
            txtShape_rightBracket: 'Right Bracket',
            txtShape_leftBrace: 'Left Brace',
            txtShape_rightBrace: 'Right Brace',
            txtShape_rightArrow: 'Right Arrow',
            txtShape_leftArrow: 'Left Arrow',
            txtShape_upArrow: 'Up Arrow',
            txtShape_downArrow: 'Down Arrow',
            txtShape_leftRightArrow: 'Left Right Arrow',
            txtShape_upDownArrow: 'Up Down Arrow',
            txtShape_quadArrow: 'Quad Arrow',
            txtShape_leftRightUpArrow: 'Left Right Up Arrow',
            txtShape_bentArrow: 'Bent Arrow',
            txtShape_uturnArrow: 'U-Turn Arrow',
            txtShape_leftUpArrow: 'Left Up Arrow',
            txtShape_bentUpArrow: 'Bent Up Arrow',
            txtShape_curvedRightArrow: 'Curved Right Arrow',
            txtShape_curvedLeftArrow: 'Curved Left Arrow',
            txtShape_curvedUpArrow: 'Curved Up Arrow',
            txtShape_curvedDownArrow: 'Curved Down Arrow',
            txtShape_stripedRightArrow: 'Striped Right Arrow',
            txtShape_notchedRightArrow: 'Notched Right Arrow',
            txtShape_homePlate: 'Pentagon',
            txtShape_chevron: 'Chevron',
            txtShape_rightArrowCallout: 'Right Arrow Callout',
            txtShape_downArrowCallout: 'Down Arrow Callout',
            txtShape_leftArrowCallout: 'Left Arrow Callout',
            txtShape_upArrowCallout: 'Up Arrow Callout',
            txtShape_leftRightArrowCallout: 'Left Right Arrow Callout',
            txtShape_quadArrowCallout: 'Quad Arrow Callout',
            txtShape_circularArrow: 'Circular Arrow',
            txtShape_mathPlus: 'Plus',
            txtShape_mathMinus: 'Minus',
            txtShape_mathMultiply: 'Multiply',
            txtShape_mathDivide: 'Division',
            txtShape_mathEqual: 'Equal',
            txtShape_mathNotEqual: 'Not Equal',
            txtShape_flowChartProcess: 'Flowchart: Process',
            txtShape_flowChartAlternateProcess: 'Flowchart: Alternate Process',
            txtShape_flowChartDecision: 'Flowchart: Decision',
            txtShape_flowChartInputOutput: 'Flowchart: Data',
            txtShape_flowChartPredefinedProcess: 'Flowchart: Predefined Process',
            txtShape_flowChartInternalStorage: 'Flowchart: Internal Storage',
            txtShape_flowChartDocument: 'Flowchart: Document',
            txtShape_flowChartMultidocument: 'Flowchart: Multidocument ',
            txtShape_flowChartTerminator: 'Flowchart: Terminator',
            txtShape_flowChartPreparation: 'Flowchart: Preparation',
            txtShape_flowChartManualInput: 'Flowchart: Manual Input',
            txtShape_flowChartManualOperation: 'Flowchart: Manual Operation',
            txtShape_flowChartConnector: 'Flowchart: Connector',
            txtShape_flowChartOffpageConnector: 'Flowchart: Off-page Connector',
            txtShape_flowChartPunchedCard: 'Flowchart: Card',
            txtShape_flowChartPunchedTape: 'Flowchart: Punched Tape',
            txtShape_flowChartSummingJunction: 'Flowchart: Summing Junction',
            txtShape_flowChartOr: 'Flowchart: Or',
            txtShape_flowChartCollate: 'Flowchart: Collate',
            txtShape_flowChartSort: 'Flowchart: Sort',
            txtShape_flowChartExtract: 'Flowchart: Extract',
            txtShape_flowChartMerge: 'Flowchart: Merge',
            txtShape_flowChartOnlineStorage: 'Flowchart: Stored Data',
            txtShape_flowChartDelay: 'Flowchart: Delay',
            txtShape_flowChartMagneticTape: 'Flowchart: Sequential Access Storage',
            txtShape_flowChartMagneticDisk: 'Flowchart: Magnetic Disk',
            txtShape_flowChartMagneticDrum: 'Flowchart: Direct Access Storage',
            txtShape_flowChartDisplay: 'Flowchart: Display',
            txtShape_irregularSeal1: 'Explosion 1',
            txtShape_irregularSeal2: 'Explosion 2',
            txtShape_star4: '4-Point Star',
            txtShape_star5: '5-Point Star',
            txtShape_star6: '6-Point Star',
            txtShape_star7: '7-Point Star',
            txtShape_star8: '8-Point Star',
            txtShape_star10: '10-Point Star',
            txtShape_star12: '12-Point Star',
            txtShape_star16: '16-Point Star',
            txtShape_star24: '24-Point Star',
            txtShape_star32: '32-Point Star',
            txtShape_ribbon2: 'Up Ribbon',
            txtShape_ribbon: 'Down Ribbon',
            txtShape_ellipseRibbon2: 'Curved Up Ribbon',
            txtShape_ellipseRibbon: 'Curved Down Ribbon',
            txtShape_verticalScroll: 'Vertical Scroll',
            txtShape_horizontalScroll: 'Horizontal Scroll',
            txtShape_wave: 'Wave',
            txtShape_doubleWave: 'Double Wave',
            txtShape_wedgeRectCallout: 'Rectangular Callout',
            txtShape_wedgeRoundRectCallout: 'Rounded Rectangular Callout',
            txtShape_wedgeEllipseCallout: 'Oval Callout',
            txtShape_cloudCallout: 'Cloud Callout',
            txtShape_borderCallout1: 'Line Callout 1',
            txtShape_borderCallout2: 'Line Callout 2',
            txtShape_borderCallout3: 'Line Callout 3',
            txtShape_accentCallout1: 'Line Callout 1 (Accent Bar)',
            txtShape_accentCallout2: 'Line Callout 2 (Accent Bar)',
            txtShape_accentCallout3: 'Line Callout 3 (Accent Bar)',
            txtShape_callout1: 'Line Callout 1 (No Border)',
            txtShape_callout2: 'Line Callout 2 (No Border)',
            txtShape_callout3: 'Line Callout 3 (No Border)',
            txtShape_accentBorderCallout1: 'Line Callout 1 (Border and Accent Bar)',
            txtShape_accentBorderCallout2: 'Line Callout 2 (Border and Accent Bar)',
            txtShape_accentBorderCallout3: 'Line Callout 3 (Border and Accent Bar)',
            txtShape_actionButtonBackPrevious: 'Back or Previous Button',
            txtShape_actionButtonForwardNext: 'Forward or Next Button',
            txtShape_actionButtonBeginning: 'Beginning Button',
            txtShape_actionButtonEnd: 'End Button',
            txtShape_actionButtonHome: 'Home Button',
            txtShape_actionButtonInformation: 'Information Button',
            txtShape_actionButtonReturn: 'Return Button',
            txtShape_actionButtonMovie: 'Movie Button',
            txtShape_actionButtonDocument: 'Document Button',
            txtShape_actionButtonSound: 'Sound Button',
            txtShape_actionButtonHelp: 'Help Button',
            txtShape_actionButtonBlank: 'Blank Button',
            txtShape_roundRect: 'Round Corner Rectangle',
            txtShape_snip1Rect: 'Snip Single Corner Rectangle',
            txtShape_snip2SameRect: 'Snip Same Side Corner Rectangle',
            txtShape_snip2DiagRect: 'Snip Diagonal Corner Rectangle',
            txtShape_snipRoundRect: 'Snip and Round Single Corner Rectangle',
            txtShape_round1Rect: 'Round Single Corner Rectangle',
            txtShape_round2SameRect: 'Round Same Side Corner Rectangle',
            txtShape_round2DiagRect: 'Round Diagonal Corner Rectangle',
            txtShape_line: 'Line',
            txtShape_lineWithArrow: 'Arrow',
            txtShape_lineWithTwoArrows: 'Double Arrow',
            txtShape_bentConnector5: 'Elbow Connector',
            txtShape_bentConnector5WithArrow: 'Elbow Arrow Connector',
            txtShape_bentConnector5WithTwoArrows: 'Elbow Double-Arrow Connector',
            txtShape_curvedConnector3: 'Curved Connector',
            txtShape_curvedConnector3WithArrow: 'Curved Arrow Connector',
            txtShape_curvedConnector3WithTwoArrows: 'Curved Double-Arrow Connector',
            txtShape_spline: 'Curve',
            txtShape_polyline1: 'Scribble',
            txtShape_polyline2: 'Freeform',
            errorChangeArray: 'You cannot change part of an array.',
            errorMultiCellFormula: 'Multi-cell array formulas are not allowed in tables.',
            errorEmailClient: 'No email client could be found',
            txtPrintArea: 'Print_Area',
            txtTable: 'Table',
            textCustomLoader: 'Please note that according to the terms of the license you are not entitled to change the loader.<br>Please contact our Sales Department to get a quote.',
            errorNoDataToParse: 'No data was selected to parse.',
            waitText: 'Please, wait...'
        }
    })(), SSE.Controllers.Main || {}))
});
