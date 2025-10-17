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
/**
 *    Main.js
 *
 *    Main controller
 *
 *    Created on 24 March 2014
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
    'common/main/lib/util/LanguageInfo',
    'common/main/lib/util/LocalStorage',
    'spreadsheeteditor/main/app/collection/ShapeGroups',
    'spreadsheeteditor/main/app/collection/TableTemplates',
    'spreadsheeteditor/main/app/collection/EquationGroups',
    'spreadsheeteditor/main/app/collection/ConditionalFormatIcons',
    'spreadsheeteditor/main/app/controller/FormulaDialog',
    'common/main/lib/component/RadioBox',
    'common/main/lib/controller/FocusManager',
    'common/main/lib/controller/HintManager',
    'common/main/lib/controller/LayoutManager',
    'common/main/lib/controller/ExternalUsers',
    'common/main/lib/controller/LaunchController',
    'common/main/lib/view/OpenDialog',
    'common/main/lib/view/UserNameDialog',
], function () {
    'use strict';

    SSE.Controllers.Main = Backbone.Controller.extend(_.extend((function() {
        var InitApplication = -254;
        var ApplyEditRights = -255;
        var LoadingDocument = -256;

        var mapCustomizationElements = {
            about: 'button#left-btn-about',
            feedback: 'button#left-btn-support'
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
                'ConditionalFormatIcons',
                'ConditionalFormatIconsPresets',
                'Common.Collections.TextArt',
                'Common.Collections.HistoryUsers'
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

                var me = this,
                    styleNames = ['Normal', 'Neutral', 'Bad', 'Good', 'Input', 'Output', 'Calculation', 'Check Cell', 'Explanatory Text', 'Note', 'Linked Cell', 'Warning Text',
                        'Heading 1', 'Heading 2', 'Heading 3', 'Heading 4', 'Title', 'Total', 'Currency', 'Percent', 'Comma'],
                    schemeNames = ['Aspect', 'Blue Green', 'Blue II', 'Blue Warm', 'Blue', 'Grayscale', 'Green Yellow', 'Green', 'Marquee', 'Median', 'Office 2007 - 2010', 'Office 2013 - 2022', 'Office',
                        'Orange Red', 'Orange', 'Paper', 'Red Orange', 'Red Violet', 'Red', 'Slipstream', 'Violet II', 'Violet', 'Yellow Orange', 'Yellow'],
                    translate = {
                        'Series': this.txtSeries,
                        'Diagram Title': this.txtDiagramTitle,
                        'X Axis': this.txtXAxis,
                        'Y Axis': this.txtYAxis,
                        'Your text here': this.txtArt,
                        'Table': this.txtTable,
                        'Print_Area': this.txtPrintArea,
                        'Confidential': this.txtConfidential,
                        'Prepared by ': this.txtPreparedBy + ' ',
                        'Page': this.txtPage,
                        'Page %1 of %2': this.txtPageOf,
                        'Pages': this.txtPages,
                        'Date': this.txtDate,
                        'Time': this.txtTime,
                        'Tab': this.txtTab,
                        'File': this.txtFile,
                        'Column': this.txtColumn,
                        'Row': this.txtRow,
                        '%1 of %2': this.txtByField,
                        '(All)': this.txtAll,
                        'Values': this.txtValues,
                        'Grand Total': this.txtGrandTotal,
                        'Row Labels': this.txtRowLbls,
                        'Column Labels': this.txtColLbls,
                        'Multi-Select (Alt+S)': this.txtMultiSelect + Common.Utils.String.platformKey('Alt+S', ' (' + (Common.Utils.isMac ? Common.Utils.String.textCtrl + '+' : '') + '{0})'),
                        'Clear Filter (Alt+C)':  this.txtClearFilter + Common.Utils.String.platformKey('Alt+C', ' (' + (Common.Utils.isMac ? Common.Utils.String.textCtrl + '+' : '') + '{0})'),
                        '(blank)': this.txtBlank,
                        'Group': this.txtGroup,
                        'Seconds': this.txtSeconds,
                        'Minutes': this.txtMinutes,
                        'Hours': this.txtHours,
                        'Days': this.txtDays,
                        'Months': this.txtMonths,
                        'Quarters': this.txtQuarters,
                        'Years': this.txtYears,
                        '%1 or %2': this.txtOr,
                        'Qtr': this.txtQuarter,
                        'Text': this.textText,
                        'Sheet': this.txtSheet,
                        'None': this.txtNone,
                        'Slicer': this.txtSlicer,
                        'Info': this.txtInfo,
                        'Picture': this.txtPicture,
                        'PivotTable': this.txtPivotTable,
                        'View': this.txtView
                    };

                styleNames.forEach(function(item){
                    translate[item] = me['txtStyle_' + item.replace(/ /g, '_')] || item;
                });
                schemeNames.forEach(function(item){
                    translate[item] = me['txtScheme_' + item.replace(/[ -]/g, '_')] || item;
                });
                translate['Currency [0]'] = me.txtStyle_Currency + ' [0]';
                translate['Comma [0]'] = me.txtStyle_Comma + ' [0]';

                for (var i=1; i<7; i++) {
                    translate['Accent'+i] = me.txtAccent + i;
                    translate['20% - Accent'+i] = '20% - ' + me.txtAccent + i;
                    translate['40% - Accent'+i] = '40% - ' + me.txtAccent + i;
                    translate['60% - Accent'+i] = '60% - ' + me.txtAccent + i;
                }
                me.translationTable = translate;
            },

            onLaunch: function() {
//                $(document.body).css('position', 'absolute');
                var me = this;

                this._state = {isDisconnected: false, usersCount: 1, fastCoauth: true, lostEditingRights: false, licenseType: false, isDocModified: false, requireUserAction: true};

                if (!Common.Utils.isBrowserSupported()){
                    Common.Utils.showBrowserRestriction();
                    Common.Gateway.reportError(undefined, this.unsupportedBrowserErrorText);
                    return;
                } else {
//                    this.getViewport().getEl().on('keypress', this.lockEscapeKey, this);
//                    viewport.applicationUI.setVisible(true);
                }

                // Initialize api
                this.api = this.getApplication().getController('Viewport').getApi();

                Common.UI.FocusManager.init();
                Common.UI.HintManager.init(this.api);
                Common.UI.Themes.init(this.api);
                Common.Controllers.LaunchController.init(this.api);

                var value = Common.localStorage.getBool("sse-settings-cachemode", true);
                Common.Utils.InternalSettings.set("sse-settings-cachemode", value);
                this.api.asc_setDefaultBlitMode(!!value);

                value = Common.localStorage.getItem("sse-settings-fontrender");
                if (value===null) value = '3';
                Common.Utils.InternalSettings.set("sse-settings-fontrender", value);
                this.api.asc_setFontRenderingMode(parseInt(value));

                value = Common.localStorage.getBool("sse-settings-show-alt-hints", true);
                Common.Utils.InternalSettings.set("sse-settings-show-alt-hints", value);

                value = Common.localStorage.getBool("app-settings-screen-reader");
                Common.Utils.InternalSettings.set("app-settings-screen-reader", value);
                this.api.setSpeechEnabled(value);

                if ( !Common.Utils.isIE ) {
                    if ( /^https?:\/\//.test('{{HELP_CENTER_WEB_SSE}}') ) {
                        const _url_obj = new URL('{{HELP_CENTER_WEB_SSE}}');
                        if ( !!_url_obj.searchParams )
                            _url_obj.searchParams.set('lang', Common.Locale.getCurrentLanguage());

                        Common.Utils.InternalSettings.set("url-help-center", _url_obj.toString());
                    }
                }

                this.api.asc_registerCallback('asc_onOpenDocumentProgress',  _.bind(this.onOpenDocument, this));
                this.api.asc_registerCallback('asc_onEndAction',             _.bind(this.onLongActionEnd, this));
                this.api.asc_registerCallback('asc_onError',                 _.bind(this.onError, this));
                this.api.asc_registerCallback('asc_onDocumentContentReady',  _.bind(this.onDocumentContentReady, this));
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect', _.bind(this.onCoAuthoringDisconnect, this));
                this.api.asc_registerCallback('asc_onAdvancedOptions',       _.bind(this.onAdvancedOptions, this));
                this.api.asc_registerCallback('asc_onDocumentUpdateVersion', _.bind(this.onUpdateVersion, this));
                this.api.asc_registerCallback('asc_onServerVersion',         _.bind(this.onServerVersion, this));
                this.api.asc_registerCallback('asc_onDocumentName',          _.bind(this.onDocumentName, this));
                this.api.asc_registerCallback('asc_onPrintUrl',              _.bind(this.onPrintUrl, this));
                this.api.asc_registerCallback('asc_onMeta',                  _.bind(this.onMeta, this));
                this.api.asc_registerCallback('asc_onSpellCheckInit',        _.bind(this.loadLanguages, this));
                this.api.asc_registerCallback('asc_onFrameEditorReady',        _.bind(this.onFrameEditorReady, this));
                Common.NotificationCenter.on('api:disconnect',               _.bind(this.onCoAuthoringDisconnect, this));
                Common.NotificationCenter.on('goback',                       _.bind(this.goBack, this));
                Common.NotificationCenter.on('suggest',                         _.bind(this.onSuggest, this));
                Common.NotificationCenter.on('close',                        _.bind(this.closeEditor, this));
                Common.NotificationCenter.on('namedrange:locked',            _.bind(this.onNamedRangeLocked, this));
                Common.NotificationCenter.on('protectedrange:locked',        _.bind(this.onProtectedRangeLocked, this));
                Common.NotificationCenter.on('download:cancel',              _.bind(this.onDownloadCancel, this));
                Common.NotificationCenter.on('download:advanced',            _.bind(this.onAdvancedOptions, this));
                Common.NotificationCenter.on('showmessage',                  _.bind(this.onExternalMessage, this));
                Common.NotificationCenter.on('markfavorite',                 _.bind(this.markFavorite, this));
                Common.NotificationCenter.on('protect:check',                _.bind(this.checkProtectedRange, this));
                Common.NotificationCenter.on('editing:disable',              _.bind(this.onEditingDisable, this));
                Common.NotificationCenter.on('showerror',                    _.bind(this.onError, this));

                this.stackLongActions = new Common.IrregularStack({
                    strongCompare   : this._compareActionStrong,
                    weakCompare     : this._compareActionWeak
                });

                this.stackLongActions.push({id: InitApplication, type: Asc.c_oAscAsyncActionType.BlockInteraction});

                this.stackDisableActions = new Common.IrregularStack({
                    strongCompare   : this._compareActionWeak,
                    weakCompare     : this._compareActionWeak
                });
                this.stackMacrosRequests = [];
                this.isShowOpenDialog = false;

                // Initialize api gateway
                this.editorConfig = {};
                Common.Gateway.on('init', _.bind(this.loadConfig, this));
                Common.Gateway.on('showmessage', _.bind(this.onExternalMessage, this));
                Common.Gateway.on('opendocument', _.bind(this.loadDocument, this));
                Common.Gateway.on('opendocumentfrombinary', _.bind(this.loadBinary, this));
                Common.Gateway.on('internalcommand', _.bind(this.onInternalCommand, this));
                Common.Gateway.on('grabfocus',      _.bind(this.onGrabFocus, this));
                Common.Gateway.appReady();

                this.getApplication().getController('Viewport').setApi(this.api);

                // Syncronize focus with api
                $(document.body).on('focus', 'input, textarea:not(#ce-cell-content)', function(e) {
                    if (me.isAppDisabled === true) return;

                    if (e && e.target && !/area_id/.test(e.target.id)) {
                        if (/msg-reply/.test(e.target.className))
                            me.dontCloseDummyComment = true;
                        else if (/textarea-control/.test(e.target.className))
                            me.inTextareaControl = true;
                        else if (!Common.Utils.ModalWindow.isVisible() && /form-control/.test(e.target.className))
                            me.inFormControl = true;
                    }
                });

                $(document.body).on('blur', 'input, textarea', function(e) {
                    if (me.isAppDisabled === true || me.isFrameClosed) return;

                    if ((!Common.Utils.ModalWindow.isVisible() || $('.asc-window.enable-key-events:visible').length>0) && !(me.loadMask && me.loadMask.isVisible())) {
                        if (/form-control/.test(e.target.className))
                            me.inFormControl = false;
                        if (me.getApplication().getController('LeftMenu').getView('LeftMenu').getMenu('file').isVisible() && $('.asc-window.enable-key-events:visible').length === 0)
                            return;
                        if (!e.relatedTarget ||
                            !/area_id/.test(e.target.id)
                            && !(e.target.localName == 'input' && $(e.target).parent().find(e.relatedTarget).length>0) /* Check if focus in combobox goes from input to it's menu button or menu items, or from comment editing area to Ok/Cancel button */
                            && !(e.target.localName == 'textarea' && $(e.target).closest('.asc-window').find('.dropdown-menu').find(e.relatedTarget).length>0) /* Check if focus in comment goes from textarea to it's email menu */
                            && (e.relatedTarget.localName != 'input' || !/form-control/.test(e.relatedTarget.className)) /* Check if focus goes to text input with class "form-control" */
                            && (e.relatedTarget.localName != 'textarea' || /area_id/.test(e.relatedTarget.id))) /* Check if focus goes to textarea, but not to "area_id" */ {
                            if (Common.Utils.isIE && e.originalEvent && e.originalEvent.target && /area_id/.test(e.originalEvent.target.id) && (e.originalEvent.target === e.originalEvent.srcElement))
                                return;
                            if (Common.Utils.isLinux && me.appOptions && me.appOptions.isDesktopApp) {
                                if (e.relatedTarget || !e.originalEvent || e.originalEvent.sourceCapabilities)
                                    me.api.asc_enableKeyEvents(true);
                            } else
                                me.api.asc_enableKeyEvents(true);
                            if (/msg-reply/.test(e.target.className))
                                me.dontCloseDummyComment = false;
                            else if (/textarea-control/.test(e.target.className))
                                me.inTextareaControl = false;
                        }
                    }
                }).on('dragover', function(e) {
                    var event = e.originalEvent;
                    if (event.target && $(event.target).closest('#editor_sdk').length<1 && !($(event.target).is('#statusbar_bottom') || $.contains($('#statusbar_bottom'), $(event.target))) ) {
                        event.preventDefault();
                        event.dataTransfer.dropEffect ="none";
                        return false;
                    }
                }).on('dragstart', function(e) {
                    var event = e.originalEvent;
                    if (event.target ) {
                        var target = $(event.target);
                        if (target.closest('.combobox').length>0 || target.closest('.dropdown-menu').length>0 ||
                            target.closest('.input-field').length>0 || target.closest('.spinner').length>0 || target.closest('.textarea-field').length>0 ||
                            target.closest('.ribtab').length>0 || target.closest('.combo-dataview').length>0) {
                            event.preventDefault();
                        }
                    }
                });

                Common.Utils.isChrome && $(document.body).on('keydown', 'textarea', function(e) {// chromium bug890248 (Bug 39614)
                    if (e.keyCode===Common.UI.Keys.PAGEUP || e.keyCode===Common.UI.Keys.PAGEDOWN) {
                        setTimeout(function(){
                            $('#viewport').scrollLeft(0);
                            $('#viewport').scrollTop(0);
                        }, 0);
                    }
                });
                Common.NotificationCenter.on({
                    'modal:show': function(e){
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
                    'dataview:focus': function(e){
                    },
                    'dataview:blur': function(e){
                        if (!Common.Utils.ModalWindow.isVisible()) {
                            me.api.asc_enableKeyEvents(true);
                        }
                    },
                    'menu:show': function(e){
                    },
                    'menu:hide': function(menu, isFromInputControl){
                        if (!Common.Utils.ModalWindow.isVisible() && (!menu || !menu.cmpEl.hasClass('from-cell-edit')) && !isFromInputControl) {
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

                me.defaultTitleText = '{{APP_TITLE_TEXT}}';
                me.warnNoLicense  = (me.warnNoLicense || '').replace(/%1/g, '{{COMPANY_NAME}}');
                me.warnNoLicenseUsers = (me.warnNoLicenseUsers || '').replace(/%1/g, '{{COMPANY_NAME}}');
                me.textNoLicenseTitle = (me.textNoLicenseTitle || '').replace(/%1/g, '{{COMPANY_NAME}}');
                Common.NotificationCenter.on('script:loaded', _.bind(me.onPostLoadComplete, me));
            },

            loadConfig: function(data) {
                this.editorConfig = $.extend(this.editorConfig, data.config);

                this.appOptions                 = {};

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
                if (this.appOptions.customization.font) {
                    if (this.appOptions.customization.font.name && typeof this.appOptions.customization.font.name === 'string') {
                        var arr = this.appOptions.customization.font.name.split(',');
                        for (var i=0; i<arr.length; i++) {
                            var item = arr[i].trim();
                            if (item && (/[\s0-9\.]/).test(item)) {
                                arr[i] = "'" + item + "'";
                            }
                        }
                        document.documentElement.style.setProperty("--font-family-base-custom", arr.join(','));
                    }
                    if (this.appOptions.customization.font.size) {
                        var size = parseInt(this.appOptions.customization.font.size);
                        !isNaN(size) && document.documentElement.style.setProperty("--font-size-base-app-custom", size + "px");
                    }
                }

                this.editorConfig.user          =
                this.appOptions.user            = Common.Utils.fillUserInfo(this.editorConfig.user, this.editorConfig.lang, value ? (value + ' (' + this.appOptions.guestName + ')' ) : this.textAnonymous,
                                                  Common.localStorage.getItem("guest-id") || ('uid-' + Date.now()));
                this.appOptions.user.anonymous && Common.localStorage.setItem("guest-id", this.appOptions.user.id);

                this.appOptions.isDesktopApp    = this.editorConfig.targetApp == 'desktop' || Common.Controllers.Desktop.isActive();
                if( Common.Controllers.Desktop.isActive() ){
                    !this.editorConfig.recent && (this.editorConfig.recent = []);
                }

                this.appOptions.canCreateNew    = this.editorConfig.canRequestCreateNew || !_.isEmpty(this.editorConfig.createUrl) || this.editorConfig.templates && this.editorConfig.templates.length;
                this.appOptions.canOpenRecent   = this.editorConfig.recent !== undefined;
                this.appOptions.templates       = this.editorConfig.templates;
                this.appOptions.recent          = this.editorConfig.recent;
                this.appOptions.createUrl       = this.editorConfig.createUrl;
                this.appOptions.canRequestCreateNew = this.editorConfig.canRequestCreateNew;
                this.appOptions.lang            = this.editorConfig.lang;
                this.appOptions.location        = (typeof (this.editorConfig.location) == 'string') ? this.editorConfig.location.toLowerCase() : '';
                this.appOptions.region          = (typeof (this.editorConfig.region) == 'string') ? this.editorConfig.region.toLowerCase() : this.editorConfig.region;
                this.appOptions.canAutosave     = false;
                this.appOptions.canAnalytics    = false;
                this.appOptions.sharingSettingsUrl = this.editorConfig.sharingSettingsUrl;
                this.appOptions.saveAsUrl       = this.editorConfig.saveAsUrl;
                this.appOptions.fileChoiceUrl   = this.editorConfig.fileChoiceUrl;
                this.appOptions.isEditDiagram   = this.editorConfig.mode == 'editdiagram';
                this.appOptions.isEditMailMerge = this.editorConfig.mode == 'editmerge';
                this.appOptions.isEditOle       = this.editorConfig.mode == 'editole';
                this.appOptions.canPlugins      = false;
                this.appOptions.canRequestUsers = this.editorConfig.canRequestUsers;
                this.appOptions.canRequestSendNotify = this.editorConfig.canRequestSendNotify;
                this.appOptions.canRequestSaveAs = this.editorConfig.canRequestSaveAs;
                this.appOptions.canRequestInsertImage = this.editorConfig.canRequestInsertImage;
                this.appOptions.compatibleFeatures = (typeof (this.appOptions.customization) == 'object') && !!this.appOptions.customization.compatibleFeatures;
                this.appOptions.canRequestSharingSettings = this.editorConfig.canRequestSharingSettings;
                this.appOptions.mentionShare = !((typeof (this.appOptions.customization) == 'object') && (this.appOptions.customization.mentionShare==false));
                this.appOptions.canMakeActionLink = this.editorConfig.canMakeActionLink;
                this.appOptions.canFeaturePivot = true;
                this.appOptions.canFeatureTable = true;
                this.appOptions.canFeatureViews = true;
                this.appOptions.canRequestReferenceData = this.editorConfig.canRequestReferenceData;
                this.appOptions.canRequestOpen = this.editorConfig.canRequestOpen;
                this.appOptions.canRequestReferenceSource = this.editorConfig.canRequestReferenceSource;
                this.appOptions.canSaveDocumentToBinary = this.editorConfig.canSaveDocumentToBinary;
                if (this.appOptions.user.guest && this.appOptions.canRenameAnonymous && !this.appOptions.isEditDiagram && !this.appOptions.isEditMailMerge && !this.appOptions.isEditOle)
                    Common.NotificationCenter.on('user:rename', _.bind(this.showRenameUserDialog, this));

                this.appOptions.canRequestClose = this.editorConfig.canRequestClose;
                this.appOptions.canCloseEditor = false;
                this.appOptions.canSwitchToMobile = this.editorConfig.forceDesktop;

                var _canback = false;
                if (typeof this.appOptions.customization === 'object') {
                    if (typeof this.appOptions.customization.goback == 'object' && this.editorConfig.canBackToFolder!==false) {
                        _canback = this.appOptions.customization.close===undefined ?
                            !_.isEmpty(this.editorConfig.customization.goback.url) || this.editorConfig.customization.goback.requestClose && this.appOptions.canRequestClose :
                            !_.isEmpty(this.editorConfig.customization.goback.url) && !this.editorConfig.customization.goback.requestClose;

                        if (this.appOptions.customization.goback.requestClose)
                            console.log("Obsolete: The 'requestClose' parameter of the 'customization.goback' section is deprecated. Please use 'close' parameter in the 'customization' section instead.");
                    }
                    if (this.appOptions.customization.close && typeof this.appOptions.customization.close === 'object')
                        this.appOptions.canCloseEditor  = (this.appOptions.customization.close.visible!==false) && this.appOptions.canRequestClose && !this.appOptions.isDesktopApp;
                }
                this.appOptions.canBack = this.appOptions.canBackToFolder = !!_canback;

                this.headerView = this.getApplication().getController('Viewport').getView('Common.Views.Header');
                this.headerView.setCanBack(this.appOptions.canBack, this.appOptions.canBack ? this.editorConfig.customization.goback.text : '');

                var reg = Common.localStorage.getItem("sse-settings-reg-settings"),
                    isUseBaseSeparator = Common.localStorage.getBool("sse-settings-use-base-separator", true),
                    decimal = undefined,
                    group = undefined;
                Common.Utils.InternalSettings.set("sse-settings-use-base-separator", isUseBaseSeparator);
                if (!isUseBaseSeparator) {
                    decimal = Common.localStorage.getItem("sse-settings-decimal-separator");
                    group = Common.localStorage.getItem("sse-settings-group-separator");
                }
                if (reg!==null)
                    this.api.asc_setLocale(parseInt(reg), decimal, group);
                else {
                    reg = this.appOptions.region;
                    reg = Common.util.LanguageInfo.getLanguages().hasOwnProperty(reg) ? reg : Common.util.LanguageInfo.getLocalLanguageCode(reg);
                    if (reg!==null)
                        reg = parseInt(reg);
                    else
                        reg = (this.editorConfig.lang) ? parseInt(Common.util.LanguageInfo.getLocalLanguageCode(this.editorConfig.lang)) : 0x0409;
                    this.api.asc_setLocale(reg, decimal, group);
                }
                Common.Utils.InternalSettings.set("sse-config-lang", this.editorConfig.lang);

                value = Common.localStorage.getBool("sse-settings-r1c1");
                Common.Utils.InternalSettings.set("sse-settings-r1c1", value);
                this.api.asc_setR1C1Mode(value);

                this.loadDefaultMetricSettings();

                if (!( this.editorConfig.customization && ( this.editorConfig.customization.toolbarNoTabs ||
                    (this.editorConfig.targetApp!=='desktop') && (this.editorConfig.customization.loaderName || this.editorConfig.customization.loaderLogo)))) {
                    $('#editor_sdk').append('<div class="doc-placeholder">' + '<div class="columns"></div>'.repeat(2) + '</div>');
                }

                var value = Common.localStorage.getItem("sse-macros-mode");
                if (value === null) {
                    value = this.editorConfig.customization ? this.editorConfig.customization.macrosMode : 'warn';
                    value = (value == 'enable') ? 1 : (value == 'disable' ? 2 : 0);
                } else
                    value = parseInt(value);
                Common.Utils.InternalSettings.set("sse-macros-mode", value);

                value = Common.localStorage.getItem("sse-allow-macros-request");
                Common.Utils.InternalSettings.set("sse-allow-macros-request", (value !== null) ? parseInt(value)  : 0);

                this.appOptions.wopi = this.editorConfig.wopi;
                this.headerView.setWopi(this.appOptions.wopi);

                if (this.editorConfig.canRequestRefreshFile) {
                    Common.Gateway.on('refreshfile',                                _.bind(this.onRefreshFile, this));
                    this.api.asc_registerCallback('asc_onRequestRefreshFile',       _.bind(this.onRequestRefreshFile, this));
                }

                this.isFrameClosed = (this.appOptions.isEditDiagram || this.appOptions.isEditMailMerge || this.appOptions.isEditOle);
                Common.Controllers.Desktop.init(this.appOptions);

                //if (this.appOptions.isEditDiagram || this.appOptions.isEditMailMerge || this.appOptions.isEditOle) {
                    Common.UI.HintManager.setMode(this.appOptions);
                //}
            },

            loadDocument: function(data) {
                this.appOptions.spreadsheet = data.doc;
                this.permissions = {};
                var docInfo = {};

                if (data.doc) {
                    this.permissions = _.extend(this.permissions, data.doc.permissions);

                    var _options = $.extend({}, data.doc.options, this.editorConfig.actionLink || {});

                    var _user = new Asc.asc_CUserInfo();
                    _user.put_Id(this.appOptions.user.id);
                    _user.put_FullName(this.appOptions.user.fullname);
                    _user.put_IsAnonymousUser(!!this.appOptions.user.anonymous);

                    docInfo = new Asc.asc_CDocInfo();
                    docInfo.put_Id(data.doc.key);
                    docInfo.put_Url(data.doc.url);
                    docInfo.put_DirectUrl(data.doc.directUrl);
                    docInfo.put_Title(data.doc.title);
                    docInfo.put_Format(data.doc.fileType);
                    docInfo.put_VKey(data.doc.vkey);
                    docInfo.put_Options(_options);
                    docInfo.put_UserInfo(_user);
                    docInfo.put_CallbackUrl(this.editorConfig.callbackUrl);
                    docInfo.put_Token(data.doc.token);
                    docInfo.put_Permissions(data.doc.permissions);
                    docInfo.put_EncryptedInfo(this.editorConfig.encryptionKeys);
                    docInfo.put_Lang(this.editorConfig.lang);
                    docInfo.put_Mode(this.editorConfig.mode);
                    docInfo.put_ReferenceData(data.doc.referenceData);
                    docInfo.put_SupportsOnSaveDocument(this.editorConfig.canSaveDocumentToBinary);
                    docInfo.put_Wopi(this.editorConfig.wopi);
                    this.editorConfig.shardkey && docInfo.put_Shardkey(this.editorConfig.shardkey);
                    
                    var coEditMode = !(this.editorConfig.coEditing && typeof this.editorConfig.coEditing == 'object') ? 'fast' : // fast by default
                                     this.editorConfig.mode === 'view' && this.editorConfig.coEditing.change!==false ? 'fast' : // if can change mode in viewer - set fast for using live viewer
                                     this.editorConfig.coEditing.mode || 'fast';
                    docInfo.put_CoEditingMode(coEditMode);

                    var enable = !this.editorConfig.customization || (this.editorConfig.customization.macros!==false);
                    docInfo.asc_putIsEnabledMacroses(!!enable);
                    enable = !this.editorConfig.customization || (this.editorConfig.customization.plugins!==false);
                    docInfo.asc_putIsEnabledPlugins(!!enable);

                    if (this.editorConfig.customization) {
                        if (this.editorConfig.customization.showVerticalScroll!==undefined && this.editorConfig.customization.showVerticalScroll!==null)
                            docInfo.asc_putShowVerticalScroll(this.editorConfig.customization.showVerticalScroll);
                        if (this.editorConfig.customization.showHorizontalScroll!==undefined && this.editorConfig.customization.showHorizontalScroll!==null)
                            docInfo.asc_putShowHorizontalScroll(this.editorConfig.customization.showHorizontalScroll);
                    }

                    this.headerView && this.headerView.setDocumentCaption(data.doc.title);
                    Common.Utils.InternalSettings.set("sse-doc-info-key", data.doc.key);
                }

                this.api.asc_registerCallback('asc_onGetEditorPermissions', _.bind(this.onEditorPermissions, this));
                this.api.asc_registerCallback('asc_onLicenseChanged',       _.bind(this.onLicenseChanged, this));
                this.api.asc_registerCallback('asc_onMacrosPermissionRequest', _.bind(this.onMacrosPermissionRequest, this));
                this.api.asc_registerCallback('asc_onRunAutostartMacroses', _.bind(this.onRunAutostartMacroses, this));
                this.api.asc_setDocInfo(docInfo);
                this.api.asc_getEditorPermissions(this.editorConfig.licenseUrl, this.editorConfig.customerId);
            },

            onProcessRightsChange: function(data) {
                if (data && data.enabled === false) {
                    var me = this,
                        old_rights = this._state.lostEditingRights;
                    this._state.lostEditingRights = !this._state.lostEditingRights;
                    this.api.asc_coAuthoringDisconnect();
                    Common.NotificationCenter.trigger('collaboration:sharingdeny');
                    Common.NotificationCenter.trigger('api:disconnect');
                    !old_rights && Common.UI.TooltipManager.showTip({ step: 'changeRights', text: _.isEmpty(data.message) ? this.warnProcessRightsChange : data.message,
                        target: '#toolbar', maxwidth: 600, showButton: false, automove: true, noHighlight: true, noArrow: true, multiple: true,
                        callback: function() {
                            me._state.lostEditingRights = false;
                        }});
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
                        Asc.c_oAscFileType.OTS,
                        Asc.c_oAscFileType.XLSM,
                        Asc.c_oAscFileType.XLSB,
                        Asc.c_oAscFileType.JPG,
                        Asc.c_oAscFileType.PNG
                    ];

                if ( !_format || _supported.indexOf(_format) < 0 )
                    _format = Asc.c_oAscFileType.XLSX;
                if (_format == Asc.c_oAscFileType.PDF || _format == Asc.c_oAscFileType.PDFA)
                    Common.NotificationCenter.trigger('download:settings', this, _format, true);
                else {
                    var options = new Asc.asc_CDownloadOptions(_format, true);
                    options.asc_setIsSaveAs(true);
                    this.api.asc_DownloadAs(options);
                }
            },

            onProcessMouse: function(data) {
                if (data.type == 'mouseup') {
                    var editor = document.getElementById('editor_sdk');
                    if (editor) {
                        var rect = Common.Utils.getBoundingClientRect(editor);
                        var event = data.event || {};
                        this.api.asc_onMouseUp(event, data.x - rect.left, data.y - rect.top);
                    }
                }
            },

            onRequestClose: function() {
                var me = this;
                if (this.api.asc_isDocumentModified()) {
                    this.api.asc_stopSaving();
                    Common.UI.warning({
                        closable: false,
                        width: 500,
                        title: this.notcriticalErrorTitle,
                        msg: this.leavePageTextOnClose,
                        buttons: ['ok', 'cancel'],
                        primary: 'ok',
                        callback: function(btn) {
                            if (btn == 'ok') {
                                me.api.asc_undoAllChanges();
                                me.api.asc_continueSaving();
                                Common.Gateway.requestClose();
                                // Common.Controllers.Desktop.requestClose();
                            } else
                                me.api.asc_continueSaving();
                        }
                    });
                } else {
                    Common.Gateway.requestClose();
                    // Common.Controllers.Desktop.requestClose();
                }
            },

            goBack: function(current) {
                var me = this;
                if ( !Common.Controllers.Desktop.process('goback') ) {
                    if (me.appOptions.customization.goback.requestClose && me.appOptions.canRequestClose) {
                        me.onRequestClose();
                    } else {
                        var href = me.appOptions.customization.goback.url;
                        if (!current && me.appOptions.customization.goback.blank!==false) {
                            window.open(href, "_blank");
                        } else {
                            parent.location.href = href;
                        }
                    }
                }
            },

            onSuggest: function() {
                window.open('{{SUGGEST_URL}}', "_blank");
            },

            closeEditor: function() {
                this.appOptions.canRequestClose && this.onRequestClose();
            },

            markFavorite: function(favorite) {
                if ( !Common.Controllers.Desktop.process('markfavorite') ) {
                    Common.Gateway.metaChange({
                        favorite: favorite
                    });
                }
            },

            onSetFavorite: function(favorite) {
                this.appOptions.canFavorite && this.headerView && this.headerView.setFavorite(!!favorite);
            },

            onEditComplete: function(cmp, opts) {
                if (opts && opts.restorefocus && this.api.isCEditorFocused) {
                    var me = this;
                    setTimeout(function () {
                            me.formulaInput.blur();
                            me.formulaInput.focus();
                        }, 0);
                } else {
                    this.getApplication().getController('DocumentHolder').getView('DocumentHolder').focus();
                    this.api.isCEditorFocused = false;
                }

                var application = this.getApplication(),
                    toolbarView = application.getController('Toolbar').getView('Toolbar'),
                    rightMenu = application.getController('RightMenu').getView('RightMenu');
                if (this.appOptions.isEdit && (toolbarView && toolbarView._isEyedropperStart || rightMenu && rightMenu._isEyedropperStart)) {
                    toolbarView._isEyedropperStart ? toolbarView._isEyedropperStart = false : rightMenu._isEyedropperStart = false;
                    this.api.asc_cancelEyedropper();
                }

                Common.UI.HintManager.clearHints(true);
            },

            onLongActionBegin: function(type, id) {
                var action = {id: id, type: type};
                this.stackLongActions.push(action);
                this.setLongActionView(action);
            },

            onLongActionEnd: function(type, id) {
                var action = {id: id, type: type};
                this.stackLongActions.pop(action);

                this.headerView && this.headerView.setDocumentCaption(this.api.asc_getDocumentName());
                this.updateWindowTitle(this.api.asc_isDocumentModified(), true);

                action = this.stackLongActions.get({type: Asc.c_oAscAsyncActionType.Information});
                if (action) {
                    this.setLongActionView(action);
                } else {
                    var me = this;
                    if ((id == Asc.c_oAscAsyncAction['Save'] || id == Asc.c_oAscAsyncAction['ForceSaveButton']) && !this.appOptions.isOffline) {
                        if (this._state.fastCoauth && this._state.usersCount > 1) {
                            me._state.timerSave = setTimeout(function () {
                                me.getApplication().getController('Statusbar').setStatusCaption(me.textChangesSaved, false, 3000);
                            }, 500);
                        } else
                            me.getApplication().getController('Statusbar').setStatusCaption(me.textChangesSaved, false, 3000);
                    } else
                        this.getApplication().getController('Statusbar').setStatusCaption('');
                }

                if (id == Asc.c_oAscAsyncAction.Save) {
                    this.synchronizeChanges();
                }

                action = this.stackLongActions.get({type: Asc.c_oAscAsyncActionType.BlockInteraction});
                if (action) {
                    this.setLongActionView(action);
                } else {
                    if (this.loadMask) {
                        if (this.loadMask.isVisible() && !this.dontCloseDummyComment && !this.inTextareaControl && !Common.Utils.ModalWindow.isVisible() && !this.inFormControl) {
                            if (this.appOptions.isEditMailMerge || this.appOptions.isEditDiagram || this.appOptions.isEditOle) {
                                Common.UI.HintManager.setInternalEditorLoading(false);
                            }
                            this.api.asc_enableKeyEvents(true);
                        }
                        this.loadMask.hide();
                    }

                    if (type == Asc.c_oAscAsyncActionType.BlockInteraction && !( (id == Asc.c_oAscAsyncAction['LoadDocumentFonts'] || id == Asc.c_oAscAsyncAction['LoadFonts'] || id == Asc.c_oAscAsyncAction['ApplyChanges'] ||
                                                                                  id == Asc.c_oAscAsyncAction['LoadImage'] || id == Asc.c_oAscAsyncAction['UploadImage'])
                        /* && (this.dontCloseDummyComment || this.inTextareaControl || Common.Utils.ModalWindow.isVisible() || this.inFormControl)*/ ))
                        this.onEditComplete(this.loadMask, {restorefocus:true});
                }
                if ( id == Asc.c_oAscAsyncAction['Disconnect']) {
                    this._state.timerDisconnect && clearTimeout(this._state.timerDisconnect);
                    this.disableEditing(false, 'reconnect');
                    Common.UI.TooltipManager.closeTip('disconnect');
                    this.getApplication().getController('Statusbar').setStatusCaption(this.textReconnect);
                } else if (id === Asc.c_oAscAsyncAction['RefreshFile'])  {
                    this.disableEditing(false, 'refresh-file');
                    Common.UI.TooltipManager.closeTip('refreshFile');
                    this.getApplication().getController('Statusbar').setStatusCaption('');
                }
            },

            setLongActionView: function(action) {
                var title = '', text = '', force = false;
                var statusCallback = null; // call after showing status

                switch (action.id) {
                    case Asc.c_oAscAsyncAction.Open:
                        title   = this.openTitleText;
                        text    = this.openTextText;
                        break;

                    case Asc.c_oAscAsyncAction['Save']:
                    case Asc.c_oAscAsyncAction['ForceSaveButton']:
                    case Asc.c_oAscAsyncAction.ForceSaveTimeout:
                        clearTimeout(this._state.timerSave);
                        force   = true;
                        title   = this.saveTitleText;
                        text    = (!this.appOptions.isOffline) ? this.saveTextText : '';
                        break;

                    case Asc.c_oAscAsyncAction.LoadDocumentFonts:
                        title   = this.loadFontsTitleText;
                        text    = this.loadFontsTextText;
                        break;

                    case Asc.c_oAscAsyncAction.LoadDocumentImages:
                        title   = this.loadImagesTitleText;
                        text    = this.loadImagesTextText;
                        break;

                    case Asc.c_oAscAsyncAction.LoadFont:
                        title   = this.loadFontTitleText;
                        text    = this.loadFontTextText;
                        break;

                    case Asc.c_oAscAsyncAction.LoadImage:
                        title   = this.loadImageTitleText;
                        text    = this.loadImageTextText;
                        break;

                    case Asc.c_oAscAsyncAction.DownloadAs:
                        title   = this.downloadTitleText;
                        text    = this.downloadTextText;
                        break;

                    case Asc.c_oAscAsyncAction.Print:
                        title   = this.printTitleText;
                        text    = this.printTextText;
                        break;

                    case Asc.c_oAscAsyncAction.UploadImage:
                        title   = this.uploadImageTitleText;
                        text    = this.uploadImageTextText;
                        break;

                    case Asc.c_oAscAsyncAction.SlowOperation:
                        title   = this.textPleaseWait;
                        text    = this.textPleaseWait;
                        break;

                    case Asc.c_oAscAsyncAction['Waiting']:
                        title   = this.waitText;
                        text    = this.waitText;
                        break;

                    case ApplyEditRights:
                        title   = this.txtEditingMode;
                        text    = this.waitText;
                        break;

                    case LoadingDocument:
                        title   = this.loadingDocumentTitleText + '           ';
                        text    = this.loadingDocumentTitleText;
                        break;

                    case Asc.c_oAscAsyncAction['Disconnect']:
                        title    = this.textDisconnect;
                        text     = this.textDisconnect;
                        Common.UI.Menu.Manager.hideAll();
                        this.disableEditing(true, 'reconnect');
                        var me = this;
                        me._state.timerDisconnect = setTimeout(function(){
                            Common.UI.TooltipManager.showTip('disconnect');
                        }, me._state.unloadTimer || 0);
                        this.getApplication().getController('Statusbar').setStatusCaption(text);
                        return;

                    case Asc.c_oAscAsyncAction['RefreshFile']:
                        title    = this.textUpdating;
                        text    = this.textUpdating;
                        Common.UI.Menu.Manager.hideAll();
                        this.disableEditing(true, 'refresh-file');
                        Common.UI.TooltipManager.showTip('refreshFile');
                        this.getApplication().getController('Statusbar').setStatusCaption(text);
                        return;

                    default:
                        if (typeof action.id == 'string'){
                            title   = action.id;
                            text    = action.id;
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
                } else {
                    this.getApplication().getController('Statusbar').setStatusCaption(text, force, 0, statusCallback);
                }
            },

            onApplyEditRights: function(data) {
                this.getApplication().getController('Statusbar').setStatusCaption('');

                if (data && !data.allowed) {
                    Common.UI.info({
                        title: this.requestEditFailedTitleText,
                        msg: data.message || this.requestEditFailedMessageText
                    });
                }
            },

            onDocumentContentReady: function() {
                if (this._isDocReady)
                    return;

                Common.Gateway.internalMessage('documentReady', {});

                if (this._state.openDlg)
                    this._state.openDlg.close();

                var me = this,
                    value;

                me._isDocReady = true;
                Common.NotificationCenter.trigger('app:ready', this.appOptions);

                me.hidePreloader();
                me.onLongActionEnd(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);

                if (me.appOptions.isEdit && me.appOptions.spreadsheet.fileType.toLowerCase()==='csv')
                    Common.UI.TooltipManager.showTip({ step: 'openCsv', text: me.warnOpenCsv, target: '#toolbar', maxwidth: 350, automove: true, noHighlight: true, noArrow: true, showButton: false});

                value = (this.appOptions.isEditMailMerge || this.appOptions.isEditDiagram || this.appOptions.isEditOle) ? 100 : Common.localStorage.getItem("sse-settings-zoom");
                Common.Utils.InternalSettings.set("sse-settings-zoom", value);
                var zf = (value!==null) ? parseInt(value)/100 : (this.appOptions.customization && this.appOptions.customization.zoom ? parseInt(this.appOptions.customization.zoom)/100 : 1);
                value = Common.localStorage.getItem("sse-last-zoom");
                var lastZoom = (value!==null) ? parseInt(value)/100 : 1;
                this.api.asc_setZoom(zf>0 ? zf : (zf < 0 && lastZoom > 0) ? lastZoom : 1);

                /** coauthoring begin **/
                this.isLiveCommenting = Common.localStorage.getBool("sse-settings-livecomment", true);
                Common.Utils.InternalSettings.set("sse-settings-livecomment", this.isLiveCommenting);
                value = Common.localStorage.getBool("sse-settings-resolvedcomment");
                Common.Utils.InternalSettings.set("sse-settings-resolvedcomment", value);
                this.isLiveCommenting ? this.api.asc_showComments(value) : this.api.asc_hideComments();

                this._state.fastCoauth = Common.Utils.InternalSettings.get("sse-settings-coauthmode");
                this.api.asc_SetFastCollaborative(me._state.fastCoauth);
                this.api.asc_setAutoSaveGap(Common.Utils.InternalSettings.get("sse-settings-autosave"));
                /** coauthoring end **/

                // spellcheck
                if (Common.UI.FeaturesManager.canChange('spellcheck')) { // get from local storage
                    /** spellcheck settings begin **/
                    var ignoreUppercase = Common.localStorage.getBool("sse-spellcheck-ignore-uppercase-words", true);
                    Common.Utils.InternalSettings.set("sse-spellcheck-ignore-uppercase-words", ignoreUppercase);
                    this.api.asc_ignoreUppercase(ignoreUppercase);
                    var ignoreNumbers = Common.localStorage.getBool("sse-spellcheck-ignore-numbers-words", true);
                    Common.Utils.InternalSettings.set("sse-spellcheck-ignore-numbers-words", ignoreNumbers);
                    this.api.asc_ignoreNumbers(ignoreNumbers);
                    /** spellcheck settings end **/
                }

                value = Common.localStorage.getBool("sse-settings-smooth-scroll", true);
                Common.Utils.InternalSettings.set("sse-settings-smooth-scroll", value);
                this.api.asc_SetSmoothScrolling(value);

                value = Common.localStorage.getBool("sse-settings-def-sheet-rtl");
                Common.Utils.InternalSettings.set("sse-settings-def-sheet-rtl", value);
                this.api.asc_setDefaultDirection(value);

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
                    pluginsController           = application.getController('Common.Controllers.Plugins'),
                    spellcheckController        = application.getController('Spellcheck');
                leftMenuView.getMenu('file').loadDocument({doc:me.appOptions.spreadsheet});
                leftmenuController.setMode(me.appOptions).createDelayedElements().setApi(me.api);

                 if (!me.appOptions.isEditMailMerge && !me.appOptions.isEditDiagram && !me.appOptions.isEditOle) {
                     pluginsController.setApi(me.api);
                     this.api && this.api.asc_setFrozenPaneBorderType(Common.localStorage.getBool('sse-freeze-shadow', true) ? Asc.c_oAscFrozenPaneBorderType.shadow : Asc.c_oAscFrozenPaneBorderType.line);
                     application.getController('Common.Controllers.ExternalOleEditor').setApi(this.api).loadConfig({config:this.editorConfig, customization: this.editorConfig.customization});
                 }

                leftMenuView.disableMenu('all',false);

                if (!me.appOptions.isEditMailMerge && !me.appOptions.isEditDiagram && !me.appOptions.isEditOle && me.appOptions.canBranding) {
                    me.getApplication().getController('LeftMenu').leftMenu.getMenu('about').setLicInfo(me.editorConfig.customization);
                }

                documentHolderController.setApi(me.api).loadConfig({config:me.editorConfig});
                chatController.setApi(this.api).setMode(this.appOptions);

                statusbarController.createDelayedElements();
                statusbarController.setApi(me.api);
                documentHolderView.setApi(me.api);

                statusbarView.update();

                this.formulaInput = celleditorController.getView('CellEditor').$el.find('textarea');

                SSE.getController('Common.Controllers.Shortcuts').setApi(me.api);

                if (me.appOptions.isEdit) {
                    Common.UI.FeaturesManager.canChange('spellcheck') && spellcheckController.setApi(me.api).setMode(me.appOptions);

                    if (me.appOptions.canForcesave) {// use asc_setIsForceSaveOnUserSave only when customization->forcesave = true
                        me.appOptions.forcesave = Common.localStorage.getBool("sse-settings-forcesave", me.appOptions.canForcesave);
                        Common.Utils.InternalSettings.set("sse-settings-forcesave", me.appOptions.forcesave);
                        me.api.asc_setIsForceSaveOnUserSave(me.appOptions.forcesave);
                    }

                    value = Common.localStorage.getItem("sse-settings-paste-button");
                    if (value===null) value = '1';
                    Common.Utils.InternalSettings.set("sse-settings-paste-button", parseInt(value));
                    me.api.asc_setVisiblePasteButton(!!parseInt(value));

                    value = Common.localStorage.getItem("sse-settings-function-tooltip");
                    if (value===null) value = '1';
                    Common.Utils.InternalSettings.set("sse-settings-function-tooltip", parseInt(value));

                    me.loadAutoCorrectSettings();

                    if (me.needToUpdateVersion) {
                        Common.NotificationCenter.trigger('api:disconnect');
                        toolbarController.onApiCoAuthoringDisconnect();
                    }

                    var timer_sl = setInterval(function(){
                        if (window.styles_loaded || me.appOptions.isEditDiagram || me.appOptions.isEditMailMerge || me.appOptions.isEditOle) {
                            clearInterval(timer_sl);

                            
                            Common.NotificationCenter.trigger('comments:updatefilter', ['doc', 'sheet' + me.api.asc_getActiveWorksheetId()]);
                            documentHolderView.createDelayedElements();
                            toolbarController.createDelayedElements();
                            // me.setLanguages();

                            if (!me.appOptions.isEditMailMerge && !me.appOptions.isEditDiagram && !me.appOptions.isEditOle) {
                                var shapes = me.api.asc_getPropertyEditorShapes();
                                if (shapes)
                                    me.fillAutoShapes(shapes[0], shapes[1]);

                                me.updateThemeColors();
                                toolbarController.activateControls();
                            } else if (me.appOptions.isEditOle || me.appOptions.isEditDiagram) {
                                me.updateThemeColors();
                            }

                            rightmenuController.createDelayedElements();

                            me.api.asc_registerCallback('asc_onDocumentCanSaveChanged',  _.bind(me.onDocumentCanSaveChanged, me));
                            me.api.asc_registerCallback('asc_OnTryUndoInFastCollaborative',_.bind(me.onTryUndoInFastCollaborative, me));
                            me.onDocumentModifiedChanged(me.api.asc_isDocumentModified());

                            var formulasDlgController = application.getController('FormulaDialog');
                            formulasDlgController && formulasDlgController.setApi(me.api);
                            if (me.needToUpdateVersion)
                                toolbarController.onApiCoAuthoringDisconnect();

                            Common.NotificationCenter.trigger('document:ready', 'main');
                            me.applyLicense();
                        }
                    }, 50);
                } else {
                    var formulasDlgController = application.getController('FormulaDialog');
                    formulasDlgController && formulasDlgController.setApi(me.api);
                    documentHolderView.createDelayedElementsViewer();
                    Common.Utils.injectSvgIcons();
                    Common.NotificationCenter.trigger('document:ready', 'main');
                    me.applyLicense();
                }
                // TODO bug 43960
                if (!me.appOptions.isEditMailMerge && !me.appOptions.isEditDiagram && !me.appOptions.isEditOle) {
                    var dummyClass = ~~(1e6*Math.random());
                    $('.toolbar').prepend(Common.Utils.String.format('<div class="lazy-{0} x-huge"><div class="toolbar__icon" style="position: absolute; width: 1px; height: 1px;"></div>', dummyClass));
                    setTimeout(function() { $(Common.Utils.String.format('.toolbar .lazy-{0}', dummyClass)).remove(); }, 10);
                }

                if (me.appOptions.canAnalytics && false)
                    Common.component.Analytics.initialize('UA-12442749-13', 'Spreadsheet Editor');

                Common.Gateway.on('applyeditrights', _.bind(me.onApplyEditRights, me));
                Common.Gateway.on('processrightschange', _.bind(me.onProcessRightsChange, me));
                Common.Gateway.on('processmouse', _.bind(me.onProcessMouse, me));
                Common.Gateway.on('downloadas',   _.bind(me.onDownloadAs, me));
                Common.Gateway.on('setfavorite',  _.bind(me.onSetFavorite, me));
                Common.Gateway.on('requestclose', _.bind(me.onRequestClose, me));
                Common.Gateway.on('refreshhistory',_.bind(me.onRefreshHistory, me));
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
                this._state.requireUserAction = false;

                if (this.appOptions.user.guest && this.appOptions.canRenameAnonymous && !this.appOptions.isEditDiagram && !this.appOptions.isEditMailMerge && !this.appOptions.isEditOle && (Common.Utils.InternalSettings.get("guest-username")===null))
                    this.showRenameUserDialog();
                if (this._needToSaveAsFile) // warning received before document is ready
                    this.getApplication().getController('LeftMenu').leftMenu.showMenu('file:saveas');
            },

            onPostLoadComplete: function() {
                if (this.appOptions.isEdit) {
                    this.setLanguages();
                }
            },

            onLicenseChanged: function(params) {
                if (this.appOptions.isEditDiagram || this.appOptions.isEditMailMerge || this.appOptions.isEditOle) return;

                var licType = params.asc_getLicenseType();
                if (licType !== undefined && (this.appOptions.canEdit || this.appOptions.isRestrictedEdit) && this.editorConfig.mode !== 'view' &&
                    (licType===Asc.c_oLicenseResult.Connections || licType===Asc.c_oLicenseResult.UsersCount || licType===Asc.c_oLicenseResult.ConnectionsOS || licType===Asc.c_oLicenseResult.UsersCountOS
                    || licType===Asc.c_oLicenseResult.SuccessLimit && (this.appOptions.trialMode & Asc.c_oLicenseMode.Limited) !== 0))
                    this._state.licenseType = licType;

                if (licType !== undefined && this.appOptions.canLiveView && (licType===Asc.c_oLicenseResult.ConnectionsLive || licType===Asc.c_oLicenseResult.ConnectionsLiveOS||
                                                                             licType===Asc.c_oLicenseResult.UsersViewCount || licType===Asc.c_oLicenseResult.UsersViewCountOS))
                    this._state.licenseType = licType;

                if (this._isDocReady)
                    this.applyLicense();
            },

            applyLicense: function() {
                if (this.editorConfig.mode === 'view') {
                    if (this.appOptions.canLiveView && (this._state.licenseType===Asc.c_oLicenseResult.ConnectionsLive || this._state.licenseType===Asc.c_oLicenseResult.ConnectionsLiveOS ||
                                                        this._state.licenseType===Asc.c_oLicenseResult.UsersViewCount || this._state.licenseType===Asc.c_oLicenseResult.UsersViewCountOS ||
                                                        !this.appOptions.isAnonymousSupport && !!this.appOptions.user.anonymous)) {
                        // show warning or write to log if Common.Utils.InternalSettings.get("sse-settings-coauthmode") was true ???
                        this.disableLiveViewing(true);
                    }
                } else if (!this.appOptions.isAnonymousSupport && !!this.appOptions.user.anonymous) {
                    this.disableEditing(true);
                    this.api.asc_coAuthoringDisconnect();
                    Common.NotificationCenter.trigger('api:disconnect');
                    Common.UI.warning({
                        title: this.notcriticalErrorTitle,
                        msg  : this.warnLicenseAnonymous,
                        buttons: ['ok']
                    });
                } else if (this._state.licenseType) {
                    var license = this._state.licenseType,
                        title = this.textNoLicenseTitle,
                        buttons = ['ok'],
                        primary = 'ok',
                        modal = false;
                    if ((this.appOptions.trialMode & Asc.c_oLicenseMode.Limited) !== 0 &&
                        (license===Asc.c_oLicenseResult.SuccessLimit || this.appOptions.permissionsLicense===Asc.c_oLicenseResult.SuccessLimit)) {
                        license = this.warnLicenseLimitedRenewed;
                    } else if (license===Asc.c_oLicenseResult.Connections || license===Asc.c_oLicenseResult.UsersCount) {
                        title = this.titleReadOnly;
                        license = (license===Asc.c_oLicenseResult.Connections) ? this.tipLicenseExceeded : this.tipLicenseUsersExceeded;
                    } else {
                        license = (license===Asc.c_oLicenseResult.ConnectionsOS) ? this.warnNoLicense : this.warnNoLicenseUsers;
                        buttons = [{value: 'buynow', caption: this.textBuyNow}, {value: 'contact', caption: this.textContactUs}];
                        primary = 'buynow';
                        modal = true;
                    }

                    if (this._state.licenseType!==Asc.c_oLicenseResult.SuccessLimit && (this.appOptions.isEdit || this.appOptions.isRestrictedEdit)) {
                        this.disableEditing(true);
                        this.api.asc_coAuthoringDisconnect();
                        Common.NotificationCenter.trigger('api:disconnect');
                    }

                    !modal ? Common.UI.TooltipManager.showTip({ step: 'licenseError', text: license, header: title, target: '#toolbar', maxwidth: 430,
                                                                automove: true, noHighlight: true, noArrow: true, textButton: this.textContinue}) :
                    Common.UI.info({
                        maxwidth: 500,
                        title: title,
                        msg  : license,
                        buttons: buttons,
                        primary: primary,
                        callback: function(btn) {
                            if (btn == 'buynow')
                                window.open('{{PUBLISHER_URL}}', "_blank");
                            else if (btn == 'contact')
                                window.open('mailto:{{SALES_EMAIL}}', "_blank");
                        }
                    });
                } else if (!this.appOptions.isDesktopApp && !this.appOptions.canBrandingExt && !(this.appOptions.isEditDiagram || this.appOptions.isEditMailMerge || this.appOptions.isEditOle) &&
                    this.editorConfig && this.editorConfig.customization && (this.editorConfig.customization.loaderName || this.editorConfig.customization.loaderLogo ||
                    this.editorConfig.customization.font && (this.editorConfig.customization.font.size || this.editorConfig.customization.font.name))) {
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

            disableEditing: function(disable, type) {
                !type && (type = 'disconnect');
                var temp = type==='reconnect' || type==='refresh-file';
                Common.NotificationCenter.trigger('editing:disable', disable, {
                    viewMode: disable,
                    allowSignature: false,
                    allowProtect: false,
                    rightMenu: {clear: !temp, disable: true},
                    statusBar: true,
                    leftMenu: {disable: true, previewMode: true},
                    fileMenu: {protect: true, history: temp},
                    comments: {disable: !temp, previewMode: true},
                    chat: true,
                    review: true,
                    viewport: true,
                    documentHolder: {clear: !temp, disable: true},
                    toolbar: true,
                    celleditor: {previewMode: true},
                    header: {search: type==='not-loaded'},
                    shortcuts: type==='not-loaded'
                }, type || 'disconnect');
            },

            onEditingDisable: function(disable, options, type) {
                var app = this.getApplication();

                var action = {type: type, disable: disable, options: options};
                if (disable && !this.stackDisableActions.get({type: type}))
                    this.stackDisableActions.push(action);
                !disable && this.stackDisableActions.pop({type: type});
                var prev_options = !disable && (this.stackDisableActions.length()>0) ? this.stackDisableActions.get(this.stackDisableActions.length()-1) : null;

                if (options.rightMenu && app.getController('RightMenu')) {
                    options.rightMenu.clear && app.getController('RightMenu').getView('RightMenu').clearSelection();
                    options.rightMenu.disable && app.getController('RightMenu').SetDisabled(disable, options.allowSignature);
                }
                if (options.statusBar) {
                    app.getController('Statusbar').SetDisabled(disable);
                }
                if (options.review) {
                    app.getController('Common.Controllers.ReviewChanges').SetDisabled(disable);
                }
                if (options.viewport) {
                    app.getController('Viewport').SetDisabled(disable);
                }
                if (options.toolbar) {
                    app.getController('Toolbar').DisableToolbar(disable, options.viewMode);
                }
                if (options.documentHolder) {
                    options.documentHolder.clear && app.getController('DocumentHolder').clearSelection();
                    options.documentHolder.disable && app.getController('DocumentHolder').SetDisabled(disable, options.allowProtect);
                }
                if (options.leftMenu) {
                    if (options.leftMenu.disable)
                        app.getController('LeftMenu').SetDisabled(disable, options);
                    if (options.leftMenu.previewMode)
                        app.getController('LeftMenu').setPreviewMode(disable);
                }
                if (options.fileMenu) {
                    app.getController('LeftMenu').leftMenu.getMenu('file').SetDisabled(disable, options.fileMenu);
                    if (options.leftMenu.disable)
                        app.getController('LeftMenu').leftMenu.getMenu('file').applyMode();
                }
                if (options.comments) {
                    var comments = this.getApplication().getController('Common.Controllers.Comments');
                    if (comments && options.comments.previewMode)
                        comments.setPreviewMode(disable);
                }
                if (options.celleditor && options.celleditor.previewMode) {
                    app.getController('CellEditor').setPreviewMode(disable);
                }

                if (options.shortcuts) {
                    disable ? Common.util.Shortcuts.suspendEvents() : Common.util.Shortcuts.resumeEvents();
                }
                if (options.header) {
                    if (options.header.search)
                        this.headerView && this.headerView.lockHeaderBtns('search', disable);
                    this.headerView && this.headerView.lockHeaderBtns('undo', options.viewMode, Common.enumLock.lostConnect);
                    this.headerView && this.headerView.lockHeaderBtns('redo', options.viewMode, Common.enumLock.lostConnect);
                }

                if (prev_options) {
                    this.onEditingDisable(prev_options.disable, prev_options.options, prev_options.type);
                }
            },

            disableLiveViewing: function(disable) {
                this.appOptions.canLiveView = !disable;
                this.api.asc_SetFastCollaborative(!disable);
                Common.Utils.InternalSettings.set("sse-settings-coauthmode", !disable);
            },

            onOpenDocument: function(progress) {
                var elem = document.getElementById('loadmask-text');
                var proc = (progress.asc_getCurrentFont() + progress.asc_getCurrentImage())/(progress.asc_getFontsCount() + progress.asc_getImagesCount());
                proc = this.textLoadingDocument + ': ' + Common.Utils.String.fixedDigits(Math.min(Math.round(proc*100), 100), 3, "  ") + "%";
                elem ? elem.innerHTML = proc : this.loadMask && this.loadMask.setTitle(proc);
            },

            onEditorPermissions: function(params) {
                var licType = params ? params.asc_getLicenseType() : Asc.c_oLicenseResult.Error;
                if ( params && !(this.appOptions.isEditDiagram || this.appOptions.isEditMailMerge || this.appOptions.isEditOle)) {
                    if (Asc.c_oLicenseResult.Expired === licType || Asc.c_oLicenseResult.Error === licType || Asc.c_oLicenseResult.ExpiredTrial === licType ||
                        Asc.c_oLicenseResult.NotBefore === licType || Asc.c_oLicenseResult.ExpiredLimited === licType) {
                        Common.UI.warning({
                            title: Asc.c_oLicenseResult.NotBefore === licType ? this.titleLicenseNotActive : this.titleLicenseExp,
                            msg: Asc.c_oLicenseResult.NotBefore === licType ? this.warnLicenseBefore : this.warnLicenseExp,
                            buttons: [],
                            closable: false
                        });
                        if (this._isDocReady || this._isPermissionsInited) { // receive after refresh file
                            this.disableEditing(true);
                            Common.NotificationCenter.trigger('api:disconnect');
                        }
                        return;
                    }

                    if ( this.onServerVersion(params.asc_getBuildVersion()) || !this.onLanguageLoaded() ) return;
                    if ( this._isDocReady || this._isPermissionsInited ) {
                        this.api.asc_LoadDocument();
                        return;
                    }

                    if (params.asc_getRights() !== Asc.c_oRights.Edit)
                        this.permissions.edit = false;

                    this.appOptions.permissionsLicense = licType;
                    this.appOptions.canAutosave = true;
                    this.appOptions.canAnalytics = params.asc_getIsAnalyticsEnable();

                    this.appOptions.isOffline      = this.api.asc_isOffline();
                    this.appOptions.isCrypted      = this.api.asc_isCrypto();
                    this.appOptions.canLicense     = (licType === Asc.c_oLicenseResult.Success || licType === Asc.c_oLicenseResult.SuccessLimit);
                    this.appOptions.isLightVersion = params.asc_getIsLight();
                    /** coauthoring begin **/
                    this.appOptions.canCoAuthoring = !this.appOptions.isLightVersion;
                    /** coauthoring end **/
                    this.appOptions.canComments    = this.appOptions.canLicense && (this.permissions.comment===undefined ? (this.permissions.edit !== false) : this.permissions.comment) && (this.editorConfig.mode !== 'view');
                    this.appOptions.canComments    = this.appOptions.canComments && !((typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.comments===false);
                    this.appOptions.canViewComments = this.appOptions.canComments || !((typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.comments===false);
                    this.appOptions.canChat        = this.appOptions.canLicense && !this.appOptions.isOffline && !(this.permissions.chat===false || (this.permissions.chat===undefined) &&
                                                                                                                (typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.chat===false);
                    if ((typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.chat!==undefined) {
                        console.log("Obsolete: The 'chat' parameter of the 'customization' section is deprecated. Please use 'chat' parameter in the permissions instead.");
                    }
                    this.appOptions.canRename      = this.editorConfig.canRename;
                    this.appOptions.buildVersion   = params.asc_getBuildVersion();
                    this.appOptions.trialMode      = params.asc_getLicenseMode();
                    this.appOptions.isBeta         = params.asc_getIsBeta();
                    this.appOptions.canModifyFilter = (this.permissions.modifyFilter!==false);

                    this.appOptions.canBrandingExt = params.asc_getCanBranding() && (typeof this.editorConfig.customization == 'object' || this.editorConfig.plugins);
                    Common.UI.LayoutManager.init(this.editorConfig.customization ? this.editorConfig.customization.layout : null, this.appOptions.canBrandingExt, this.api);
                    this.editorConfig.customization && Common.UI.FeaturesManager.init(this.editorConfig.customization.features, this.appOptions.canBrandingExt);
                    Common.UI.TabStyler.init(this.editorConfig.customization); // call after Common.UI.FeaturesManager.init() !!!

                    this.appOptions.canBranding  = params.asc_getCustomization();
                    if (this.appOptions.canBranding)
                        this.headerView.setBranding(this.editorConfig.customization, this.appOptions);

                    this.appOptions.canFavorite = this.appOptions.spreadsheet.info && (this.appOptions.spreadsheet.info.favorite!==undefined && this.appOptions.spreadsheet.info.favorite!==null);
                    this.appOptions.canFavorite && this.headerView && this.headerView.setFavorite(this.appOptions.spreadsheet.info.favorite);

                    this.appOptions.canRename && this.headerView.setCanRename(true);
                    this.appOptions.canUseReviewPermissions = this.appOptions.canLicense && (!!this.permissions.reviewGroups ||
                                                            this.appOptions.canLicense && this.editorConfig.customization && this.editorConfig.customization.reviewPermissions && (typeof (this.editorConfig.customization.reviewPermissions) == 'object'));
                    this.appOptions.canUseCommentPermissions = this.appOptions.canLicense && !!this.permissions.commentGroups;
                    this.appOptions.canUseUserInfoPermissions = this.appOptions.canLicense && !!this.permissions.userInfoGroups;
                    AscCommon.UserInfoParser.setParser(true);
                    AscCommon.UserInfoParser.setCurrentName(this.appOptions.user.fullname);
                    this.appOptions.canUseReviewPermissions && AscCommon.UserInfoParser.setReviewPermissions(this.permissions.reviewGroups, this.editorConfig.customization.reviewPermissions);
                    this.appOptions.canUseCommentPermissions && AscCommon.UserInfoParser.setCommentPermissions(this.permissions.commentGroups);
                    this.appOptions.canUseUserInfoPermissions && AscCommon.UserInfoParser.setUserInfoPermissions(this.permissions.userInfoGroups);
                    this.headerView.setUserName(AscCommon.UserInfoParser.getParsedName(AscCommon.UserInfoParser.getCurrentName()));
                    this.headerView.setUserId(this.appOptions.user.id);
                    this.headerView.setUserAvatar(this.appOptions.user.image);
                } else
                    this.appOptions.canModifyFilter = true;

                this.appOptions.canRequestEditRights = this.editorConfig.canRequestEditRights;
                this.appOptions.canEdit        = this.permissions.edit !== false && // can edit
                                                 (this.editorConfig.canRequestEditRights || this.editorConfig.mode !== 'view'); // if mode=="view" -> canRequestEditRights must be defined
                this.appOptions.isEdit         = (this.appOptions.canLicense || this.appOptions.isEditDiagram || this.appOptions.isEditMailMerge || this.appOptions.isEditOle) && this.permissions.edit !== false && this.editorConfig.mode !== 'view';
                this.appOptions.canDownload    = (this.permissions.download !== false);
                this.appOptions.canPrint       = (this.permissions.print !== false) && !(this.appOptions.isEditDiagram || this.appOptions.isEditMailMerge || this.appOptions.isEditOle);
                this.appOptions.canQuickPrint = this.appOptions.canPrint && !Common.Utils.isMac && this.appOptions.isDesktopApp;
                this.appOptions.canForcesave   = this.appOptions.isEdit && !this.appOptions.isOffline && !(this.appOptions.isEditDiagram || this.appOptions.isEditMailMerge || this.appOptions.isEditOle) &&
                                                (typeof (this.editorConfig.customization) == 'object' && !!this.editorConfig.customization.forcesave);
                this.appOptions.forcesave      = this.appOptions.canForcesave;
                this.appOptions.canEditComments= this.appOptions.isOffline || !this.permissions.editCommentAuthorOnly;
                this.appOptions.canDeleteComments= this.appOptions.isOffline || !this.permissions.deleteCommentAuthorOnly;
                if ((typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.commentAuthorOnly===true) {
                    console.log("Obsolete: The 'commentAuthorOnly' parameter of the 'customization' section is deprecated. Please use 'editCommentAuthorOnly' and 'deleteCommentAuthorOnly' parameters in the permissions instead.");
                    if (this.permissions.editCommentAuthorOnly===undefined && this.permissions.deleteCommentAuthorOnly===undefined)
                        this.appOptions.canEditComments = this.appOptions.canDeleteComments = this.appOptions.isOffline;
                }
                this.appOptions.isSignatureSupport= this.appOptions.isEdit && this.appOptions.isDesktopApp && this.appOptions.isOffline && this.api.asc_isSignaturesSupport() && (this.permissions.protect!==false)
                                                    && !(this.appOptions.isEditDiagram || this.appOptions.isEditMailMerge || this.appOptions.isEditOle);
                this.appOptions.isPasswordSupport = this.appOptions.isEdit && this.api.asc_isProtectionSupport() && (this.permissions.protect!==false)
                                                    && !(this.appOptions.isEditDiagram || this.appOptions.isEditMailMerge || this.appOptions.isEditOle);
                this.appOptions.canProtect     = (this.permissions.protect!==false) && !(this.appOptions.isEditDiagram || this.appOptions.isEditMailMerge || this.appOptions.isEditOle);
                this.appOptions.canHelp        = !((typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.help===false);
                this.appOptions.isRestrictedEdit = !this.appOptions.isEdit && this.appOptions.canComments;
                this.appOptions.canSaveToFile = this.appOptions.isEdit || this.appOptions.isRestrictedEdit;
                this.appOptions.showSaveButton = this.appOptions.isEdit;
                this.appOptions.canSuggest     = !((typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.suggestFeature===false);

                this.appOptions.compactHeader = this.appOptions.customization && (typeof (this.appOptions.customization) == 'object') && !!this.appOptions.customization.compactHeader;
                this.appOptions.twoLevelHeader = this.appOptions.isEdit; // when compactHeader=true some buttons move to toolbar

                // change = true by default in editor
                this.appOptions.canLiveView = !!params.asc_getLiveViewerSupport() && (this.editorConfig.mode === 'view'); // viewer: change=false when no flag canLiveViewer (i.g. old license), change=true by default when canLiveViewer==true
                this.appOptions.canChangeCoAuthoring = this.appOptions.isEdit && !(this.appOptions.isEditDiagram || this.appOptions.isEditMailMerge || this.appOptions.isEditOle) && this.appOptions.canCoAuthoring &&
                                                       !(this.editorConfig.coEditing && typeof this.editorConfig.coEditing == 'object' && this.editorConfig.coEditing.change===false) ||
                                                       this.appOptions.canLiveView && !(this.editorConfig.coEditing && typeof this.editorConfig.coEditing == 'object' && this.editorConfig.coEditing.change===false);
                this.appOptions.isAnonymousSupport = !!this.api.asc_isAnonymousSupport();

                if (!this.appOptions.isEditDiagram && !this.appOptions.isEditMailMerge && !this.appOptions.isEditOle) {
                    this.getApplication().getController('Common.Controllers.Plugins').setMode(this.appOptions);
                    Common.UI.ExternalUsers.init(this.appOptions.canRequestUsers, this.api);
                    this.appOptions.user.image ? Common.UI.ExternalUsers.setImage(this.appOptions.user.id, this.appOptions.user.image) : Common.UI.ExternalUsers.get('info', this.appOptions.user.id);
                }

                this.appOptions.canUseHistory  = this.appOptions.canLicense && this.editorConfig.canUseHistory && this.appOptions.canCoAuthoring && !this.appOptions.isOffline;
                this.appOptions.canHistoryClose  = this.editorConfig.canHistoryClose;
                this.appOptions.canHistoryRestore= this.editorConfig.canHistoryRestore;

                if ( this.appOptions.isLightVersion ) {
                    this.appOptions.canUseHistory = false;
                }

                this.loadCoAuthSettings();
                this.applyModeCommonElements();
                this.applyModeEditorElements();

                this._isPermissionsInited = true;
                if ( !this.appOptions.isEdit ) {
                    Common.NotificationCenter.trigger('app:face', this.appOptions);

                    this.hidePreloader();
                    this.onLongActionBegin(Asc.c_oAscAsyncActionType.BlockInteraction, LoadingDocument);
                }

                this.api.asc_setViewMode(!this.appOptions.isEdit && !this.appOptions.isRestrictedEdit);
                this.api.asc_setCanSendChanges(this.appOptions.canSaveToFile);
                (this.appOptions.isRestrictedEdit && this.appOptions.canComments) && this.api.asc_setRestriction(Asc.c_oAscRestrictionType.OnlyComments);
                this.api.asc_LoadDocument();
            },

            loadCoAuthSettings: function() {
                var fastCoauth = true,
                    autosave = 1,
                    value;

                if (this.appOptions.isEdit && !this.appOptions.isOffline && this.appOptions.canCoAuthoring) {
                    if (!this.appOptions.canChangeCoAuthoring) { //can't change co-auth. mode. Use coEditing.mode or 'fast' by default
                        value = (this.editorConfig.coEditing && this.editorConfig.coEditing.mode!==undefined) ? (this.editorConfig.coEditing.mode==='strict' ? 0 : 1) : null;
                        if (value===null && this.appOptions.customization && this.appOptions.customization.autosave===false) {
                            value = 0; // use customization.autosave only when coEditing.mode is null
                        }
                    } else {
                        value = Common.localStorage.getItem("sse-settings-coauthmode");
                        if (value===null) {
                            value = (this.editorConfig.coEditing && this.editorConfig.coEditing.mode!==undefined) ? (this.editorConfig.coEditing.mode==='strict' ? 0 : 1) : null;
                            if (value===null && !Common.localStorage.itemExists("sse-settings-autosave") &&
                                this.appOptions.customization && this.appOptions.customization.autosave===false) {
                                value = 0; // use customization.autosave only when de-settings-coauthmode and de-settings-autosave are null
                            }
                        }
                    }
                    fastCoauth = (value===null || parseInt(value) == 1);
                } else if (!this.appOptions.isEdit && this.appOptions.isRestrictedEdit) {
                    fastCoauth = true;
                }  else if (this.appOptions.canLiveView && !this.appOptions.isOffline) { // viewer
                    value = Common.localStorage.getItem("sse-settings-view-coauthmode");
                    if (!this.appOptions.canChangeCoAuthoring || value===null) { // Use coEditing.mode or 'fast' by default
                        value = this.editorConfig.coEditing && this.editorConfig.coEditing.mode==='strict' ? 0 : 1;
                    }
                    fastCoauth = (parseInt(value) == 1);
                } else {
                    fastCoauth = false;
                    autosave = 0;
                }

                if (this.appOptions.isEdit && this.appOptions.canAutosave) {
                    value = Common.localStorage.getItem("sse-settings-autosave");
                    if (value === null && this.appOptions.customization && this.appOptions.customization.autosave === false)
                        value = 0;
                    autosave = (!fastCoauth && value !== null) ? parseInt(value) : (this.appOptions.canCoAuthoring ? 1 : 0);
                }

                Common.Utils.InternalSettings.set("sse-settings-coauthmode", fastCoauth);
                Common.Utils.InternalSettings.set("sse-settings-autosave", autosave);
            },

            loadDefaultMetricSettings: function() {
                var region = '';
                if (this.appOptions.location) {
                    console.log("Obsolete: The 'location' parameter of the 'editorConfig' section is deprecated. Please use 'region' parameter in the 'editorConfig' section instead.");
                    region = this.appOptions.location;
                } else if (this.appOptions.region) {
                    var val = this.appOptions.region;
                    val = Common.util.LanguageInfo.getLanguages().hasOwnProperty(val) ? Common.util.LanguageInfo.getLocalLanguageName(val)[0] : val;
                    if (val && typeof val === 'string') {
                        var arr = val.split(/[\-_]/);
                        (arr.length>1) && (region = arr[arr.length-1]);
                    }
                } else {
                    var arr = (this.appOptions.lang || 'en').split(/[\-_]/);
                    (arr.length>1) && (region = arr[arr.length-1]);
                    if (!region) {
                        arr = (navigator.language || '').split(/[\-_]/);
                        (arr.length>1) && (region = arr[arr.length-1]);
                    }
                }

                if (/^(ca|us)$/i.test(region))
                    Common.Utils.Metric.setDefaultMetric(Common.Utils.Metric.c_MetricUnits.inch);
            },

            applyModeCommonElements: function() {
                window.editor_elements_prepared = true;

                var app             = this.getApplication(),
                    viewport        = app.getController('Viewport').getView('Viewport'),
                    statusbarView   = app.getController('Statusbar').getView('Statusbar');

                if (this.headerView) {
                    this.headerView.setVisible(!this.appOptions.isEditMailMerge && !this.appOptions.isDesktopApp && !this.appOptions.isEditDiagram && !this.appOptions.isEditOle);
                }

                viewport && viewport.setMode(this.appOptions, true);
                statusbarView && statusbarView.setMode(this.appOptions);
//                this.getStatusInfo().setDisabled(false);
//                this.getCellInfo().setMode(this.appOptions);
                app.getController('Toolbar').setMode(this.appOptions);
                app.getController('DocumentHolder').setMode(this.appOptions);

                viewport && viewport.applyCommonMode();

                if (this.appOptions.isEditMailMerge) {
                    statusbarView.hide();
                }
                if (this.appOptions.isEditMailMerge || this.appOptions.isEditDiagram || this.appOptions.isEditOle) {
                    app.getController('LeftMenu').getView('LeftMenu').hide();

                    $(window)
                        .mouseup(function(e){
                            Common.Gateway.internalMessage('processMouse', {event: 'mouse:up'});
                        })
                        .mousemove($.proxy(function(e){
                            if (this.isDiagramDrag || this.isDiagramResize) {
                                Common.Gateway.internalMessage('processMouse', {event: 'mouse:move', pagex: e.pageX*Common.Utils.zoom(), pagey: e.pageY*Common.Utils.zoom()});
                            }
                        },this));
                }

                if (!this.appOptions.isEditMailMerge && !this.appOptions.isEditDiagram && !this.appOptions.isEditOle) {
                    this.api.asc_registerCallback('asc_onSendThemeColors', _.bind(this.onSendThemeColors, this));
                    this.api.asc_registerCallback('asc_onDownloadUrl',     _.bind(this.onDownloadUrl, this));
                    this.api.asc_registerCallback('asc_onDocumentModifiedChanged', _.bind(this.onDocumentModifiedChanged, this));

                    var printController = app.getController('Print');
                    printController && this.api && printController.setApi(this.api).setMode(this.appOptions);
                } else {
                    this.api.asc_registerCallback('asc_sendFromFrameToGeneralEditor', _.bind(this.onSendFromFrameToGeneralEditor, this));
                    if (this.appOptions.isEditOle || this.appOptions.isEditDiagram)
                        this.api.asc_registerCallback('asc_onSendThemeColors', _.bind(this.onSendThemeColors, this));
                    if (this.appOptions.isEditDiagram) {
                        this.api.asc_registerCallback('asc_onShowProtectedChartPopup',   _.bind(this.onShowProtectedChartPopup, this));
                    }
                }

                var celleditorController = this.getApplication().getController('CellEditor');
                celleditorController && celleditorController.setApi(this.api).setMode(this.appOptions);

                var formulasDlgController = this.getApplication().getController('FormulaDialog');
                formulasDlgController && formulasDlgController.setMode(this.appOptions).setApi(this.api, true);
            },

            applyModeEditorElements: function(prevmode) {
                /** coauthoring begin **/
                var commentsController  = this.getApplication().getController('Common.Controllers.Comments');
                if (commentsController) {
                    commentsController.setMode(this.appOptions);
                    commentsController.setConfig({
                            config      : this.editorConfig,
                            sdkviewname : '#ws-canvas-outer',
                            fullInfoHintMode : true,
                            hintmode    : true},
                        this.api);
                }
                /** coauthoring end **/
                var me = this,
                    application         = this.getApplication(),
                    reviewController    = application.getController('Common.Controllers.ReviewChanges');
                reviewController.setMode(me.appOptions).setConfig({config: me.editorConfig}, me.api).loadDocument({doc:me.appOptions.spreadsheet});

                var value = Common.localStorage.getItem('sse-settings-unit');
                value = (value!==null) ? parseInt(value) : (me.appOptions.customization && me.appOptions.customization.unit ? Common.Utils.Metric.c_MetricUnits[me.appOptions.customization.unit.toLocaleLowerCase()] : Common.Utils.Metric.getDefaultMetric());
                (value===undefined) && (value = Common.Utils.Metric.getDefaultMetric());
                Common.Utils.Metric.setCurrentMetric(value);
                Common.Utils.InternalSettings.set("sse-settings-unit", value);

                var toolbarController   = application.getController('Toolbar');
                toolbarController   && toolbarController.setApi(me.api);

                if (this.appOptions.isRestrictedEdit) {
                    application.getController('WBProtection').setMode(me.appOptions).setConfig({config: me.editorConfig}, me.api);
                } else if (this.appOptions.isEdit) { // set api events for toolbar in the Restricted Editing mode
                    var statusbarController = application.getController('Statusbar'),
                        rightmenuController = application.getController('RightMenu'),
                        fontsControllers    = application.getController('Common.Controllers.Fonts');

                    fontsControllers    && fontsControllers.setApi(me.api);
//                    statusbarController && statusbarController.setApi(me.api);
                    rightmenuController && rightmenuController.setApi(me.api);

                    application.getController('Common.Controllers.Protection').setMode(me.appOptions).setConfig({config: me.editorConfig}, me.api);
                    application.getController('WBProtection').setMode(me.appOptions).setConfig({config: me.editorConfig}, me.api);

                    if (statusbarController) {
                        statusbarController.getView('Statusbar').changeViewMode(me.appOptions);
                        (me.appOptions.isEditOle || me.appOptions.isEditDiagram) && statusbarController.onChangeViewMode(null, true, true); // set compact status bar for ole editing mode
                    }

                    if (!me.appOptions.isEditMailMerge && !me.appOptions.isEditDiagram && !me.appOptions.isEditOle && me.appOptions.canFeaturePivot)
                        application.getController('PivotTable').setMode(me.appOptions);

                    if (!me.appOptions.isEditMailMerge && !me.appOptions.isEditDiagram && !me.appOptions.isEditOle && me.appOptions.canFeatureTable)
                        application.getController('TableDesignTab').setMode(me.appOptions);

                    var viewport = this.getApplication().getController('Viewport').getView('Viewport');
                    viewport.applyEditorMode();
                    rightmenuController.getView('RightMenu').setMode(me.appOptions).setApi(me.api);

                    this.toolbarView = toolbarController.getView('Toolbar');

                    if (!me.appOptions.isEditMailMerge && !me.appOptions.isEditDiagram && !me.appOptions.isEditOle) {
                        var options = {};
                        JSON.parse(Common.localStorage.getItem('sse-hidden-formula')) && (options.formula = true);
                        application.getController('Toolbar').hideElements(options);
                    } else
                        rightmenuController.getView('RightMenu').hide();

                    /** coauthoring begin **/
                    me.api.asc_registerCallback('asc_onCollaborativeChanges',    _.bind(me.onCollaborativeChanges, me));
                    me.api.asc_registerCallback('asc_onAuthParticipantsChanged', _.bind(me.onAuthParticipantsChanged, me));
                    me.api.asc_registerCallback('asc_onParticipantsChanged',     _.bind(me.onAuthParticipantsChanged, me));
                    me.api.asc_registerCallback('asc_onConnectionStateChanged',  _.bind(me.onUserConnection, me));
                    me.api.asc_registerCallback('asc_onConvertEquationToMath',   _.bind(me.onConvertEquationToMath, me));
                    me.appOptions.canSaveDocumentToBinary && me.api.asc_registerCallback('asc_onSaveDocument',_.bind(me.onSaveDocumentBinary, me));
                    /** coauthoring end **/

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
                if (!this.appOptions.isEdit)
                    window.onbeforeunload = _.bind(me.onBeforeUnloadView, me);
            },

            onExternalMessage: function(msg, options) {
                if (msg && msg.msg) {
                    msg.msg = (msg.msg).toString();
                    this.showTips([msg.msg.charAt(0).toUpperCase() + msg.msg.substring(1)], options);

                    Common.component.Analytics.trackEvent('External Error');
                }
            },

            onError: function(id, level, errData, callback) {
                if (this.isFrameClosed) {
                    this.lastFrameError = {id: id, level: level, errData: errData, callback: callback};
                    return;
                }
                switch (id) {
                    case Asc.c_oAscError.ID.LoadingScriptError:
                        this.showTips([this.scriptLoadError]);
                        this.tooltip && this.tooltip.getBSTip().$tip.css('z-index', 10000);
                        return;
                    case Asc.c_oAscError.ID.CanNotPasteImage:
                        this.showTips([this.errorCannotPasteImg], {timeout: 7000, hideCloseTip: true});
                        return;
                    case Asc.c_oAscError.ID.DocumentAndChangeMismatch:
                        this.getApplication().getController('Common.Controllers.History').onHashError();
                        return;
                    case Asc.c_oAscError.ID.UpdateVersion:
                        Common.UI.TooltipManager.showTip('updateVersion');
                        return;
                    case Asc.c_oAscError.ID.SessionIdle:
                        Common.UI.TooltipManager.showTip('sessionIdle');
                        return;
                    case Asc.c_oAscError.ID.SessionToken:
                        Common.UI.TooltipManager.showTip('sessionToken');
                        return;
                    case Asc.c_oAscError.ID.UserDrop:
                        if (this._state.lostEditingRights) {
                            this._state.lostEditingRights = false;
                            return;
                        }
                        this._state.lostEditingRights = true;
                        Common.NotificationCenter.trigger('collaboration:sharingdeny');
                        var me = this;
                        Common.UI.TooltipManager.showTip({ step: 'userDrop', text: this.errorUserDrop,
                            target: '#toolbar', maxwidth: 600, showButton: false, automove: true, noHighlight: true, noArrow: true, multiple: true,
                            callback: function() {
                                me._state.lostEditingRights = false;
                            }});
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
                        config.msg = (this.appOptions.isDesktopApp && this.appOptions.isOffline) ? this.saveErrorTextDesktop : this.saveErrorText;
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

                    case Asc.c_oAscError.ID.MaxDataSeriesError:
                        config.msg = this.getApplication().getController('Toolbar').errorMaxRows;
                        break;

                    case Asc.c_oAscError.ID.ComboSeriesError:
                        config.msg = this.getApplication().getController('Toolbar').errorComboSeries;
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
                        config.msg = this.errorConnectToServer;
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

                    case Asc.c_oAscError.ID.AccessDeny:
                        config.msg = this.errorAccessDeny;
                        break;

                    case Asc.c_oAscError.ID.LockedCellPivot:
                        config.msg = this.errorLockedCellPivot;
                        break;

                    case Asc.c_oAscError.ID.PivotLabledColumns:
                        config.msg = this.errorLabledColumnsPivot;
                        break;

                    case Asc.c_oAscError.ID.PivotOverlap:
                        config.msg = this.errorPivotOverlap;
                        break;

                    case Asc.c_oAscError.ID.PivotFieldNameExists:
                        config.msg = this.errorPivotFieldNameExists;
                        break;

                    case Asc.c_oAscError.ID.FormulaInPivotFieldName:
                        config.msg = this.errorFormulaInPivotFieldName;
                        break;

                    case Asc.c_oAscError.ID.PasteInPivot:
                        config.msg = this.errorPasteInPivot;
                        break;

                    case Asc.c_oAscError.ID.ForceSaveButton:
                    case Asc.c_oAscError.ID.ForceSaveTimeout:
                        config.msg = this.errorForceSave;
                        config.maxwidth = 600;
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

                    case Asc.c_oAscError.ID.CannotUngroupError:
                        config.msg = this.errorCannotUngroup;
                        break;

                    case Asc.c_oAscError.ID.FrmlMaxTextLength:
                        config.msg = this.errorFrmlMaxTextLength;
                        break;

                    case Asc.c_oAscError.ID.FrmlMaxReference:
                        config.msg = this.errorFrmlMaxReference;
                        break;

                    case Asc.c_oAscError.ID.DataValidate:
                        var icon = errData ? errData.asc_getErrorStyle() : undefined;
                        if (icon!==undefined) {
                            config.iconCls = (icon==Asc.c_oAscEDataValidationErrorStyle.Stop) ? 'error' : ((icon==Asc.c_oAscEDataValidationErrorStyle.Information) ? 'info' : 'warn');
                        }
                        errData && errData.asc_getErrorTitle() && (config.title = Common.Utils.String.htmlEncode(errData.asc_getErrorTitle()));
                        config.buttons  = ['ok', 'cancel'];
                        config.msg = errData && errData.asc_getError() ? Common.Utils.String.htmlEncode(errData.asc_getError()) : this.errorDataValidate;
                        config.maxwidth = 600;
                        break;

                    case Asc.c_oAscError.ID.ConvertationOpenLimitError:
                        config.msg = this.errorFileSizeExceed;
                        break;

                    case Asc.c_oAscError.ID.FTChangeTableRangeError:
                        config.msg = this.errorFTChangeTableRangeError;
                        break;

                    case Asc.c_oAscError.ID.FTRangeIncludedOtherTables:
                        config.msg = this.errorFTRangeIncludedOtherTables;
                        break;

                    case  Asc.c_oAscError.ID.PasteSlicerError:
                        config.msg = this.errorPasteSlicerError;
                        break;

                    case Asc.c_oAscError.ID.RemoveDuplicates:
                        config.iconCls = 'info';
                        config.title = Common.UI.Window.prototype.textInformation;
                        config.buttons  = ['ok'];
                        config.msg = (errData.asc_getDuplicateValues()!==null && errData.asc_getUniqueValues()!==null) ? Common.Utils.String.format(this.errRemDuplicates, errData.asc_getDuplicateValues(), errData.asc_getUniqueValues()) : this.errNoDuplicates;
                        config.maxwidth = 600;
                        break;

                    case  Asc.c_oAscError.ID.FrmlMaxLength:
                        config.msg = this.errorFrmlMaxLength;
                        config.maxwidth = 600;
                        break;

                    case  Asc.c_oAscError.ID.MoveSlicerError:
                        config.msg = this.errorMoveSlicerError;
                        break;

                    case  Asc.c_oAscError.ID.LockedEditView:
                        config.msg = this.errorEditView;
                        break;

                    case  Asc.c_oAscError.ID.ChangeFilteredRangeError:
                        config.msg = this.errorChangeFilteredRange;
                        break;

                    case Asc.c_oAscError.ID.Password:
                        config.msg = this.errorSetPassword;
                        break;

                    case Asc.c_oAscError.ID.PivotGroup:
                        config.msg = this.errorPivotGroup;
                        break;

                    case Asc.c_oAscError.ID.PasteMultiSelectError:
                        config.msg = this.errorPasteMultiSelect;
                        break;

                    case Asc.c_oAscError.ID.PivotWithoutUnderlyingData:
                        config.msg = this.errorPivotWithoutUnderlying;
                        break;

                    case Asc.c_oAscError.ID.ChangeOnProtectedSheet:
                        config.msg = this.errorChangeOnProtectedSheet;
                        break;

                    case Asc.c_oAscError.ID.SingleColumnOrRowError:
                        config.msg = this.errorSingleColumnOrRowError;
                        break;

                    case Asc.c_oAscError.ID.LocationOrDataRangeError:
                        config.msg = this.errorLocationOrDataRangeError;
                        break;

                    case Asc.c_oAscError.ID.PasswordIsNotCorrect:
                        config.msg = this.errorPasswordIsNotCorrect;
                        break;

                    case Asc.c_oAscError.ID.UplDocumentSize:
                        config.msg = this.uploadDocSizeMessage;
                        break;

                    case Asc.c_oAscError.ID.DeleteColumnContainsLockedCell:
                        config.msg = this.errorDeleteColumnContainsLockedCell;
                        break;

                    case Asc.c_oAscError.ID.UplDocumentExt:
                        config.msg = this.uploadDocExtMessage;
                        break;

                    case Asc.c_oAscError.ID.DeleteRowContainsLockedCell:
                        config.msg = this.errorDeleteRowContainsLockedCell;
                        break;

                    case Asc.c_oAscError.ID.UplDocumentFileCount:
                        config.msg = this.uploadDocFileCountMessage;
                        break;

                    case Asc.c_oAscError.ID.LoadingFontError:
                        config.msg = this.errorLoadingFont;
                        break;

                    case Asc.c_oAscError.ID.FillAllRowsWarning:
                        var fill = errData[0],
                            have = errData[1],
                            lang = (this.appOptions.lang || 'en').replace('_', '-').toLowerCase(),
                            fillWithSeparator;
                        try {
                            fillWithSeparator = fill.toLocaleString(lang);
                        } catch (e) {
                            lang = 'en';
                            fillWithSeparator = fill.toLocaleString(lang);
                        }
                        if (this.appOptions.isDesktopApp && this.appOptions.isOffline) {
                            config.msg = fill > have ? Common.Utils.String.format(this.textFormulaFilledAllRowsWithEmpty, fillWithSeparator) : Common.Utils.String.format(this.textFormulaFilledAllRows, fillWithSeparator);
                            config.buttons = [{caption: this.textFillOtherRows, primary: true, value: 'fillOther'}, 'close'];
                        } else {
                            config.msg = fill >= have ? Common.Utils.String.format(this.textFormulaFilledFirstRowsOtherIsEmpty, fillWithSeparator) : Common.Utils.String.format(this.textFormulaFilledFirstRowsOtherHaveData, fillWithSeparator, (have - fill).toLocaleString(lang));
                            config.buttons = ['ok'];
                        }
                        config.maxwidth = 400;
                        break;

                    case Asc.c_oAscError.ID.CannotUseCommandProtectedSheet:
                        config.msg = this.errorCannotUseCommandProtectedSheet;
                        break;

                    case Asc.c_oAscError.ID.DirectUrl:
                        config.msg = this.errorDirectUrl;
                        break;

                    case Asc.c_oAscError.ID.ConvertationOpenFormat:
                        config.maxwidth = 600;
                        if (Common.Utils.InternalSettings.get('import-xml-start'))
                            config.msg = this.errorConvertXml;
                        else if (errData === 'pdf')
                            config.msg = this.errorInconsistentExtPdf.replace('%1', this.appOptions.spreadsheet.fileType || '');
                        else if  (errData === 'docx')
                            config.msg = this.errorInconsistentExtDocx.replace('%1', this.appOptions.spreadsheet.fileType || '');
                        else if  (errData === 'xlsx')
                            config.msg = this.errorInconsistentExtXlsx.replace('%1', this.appOptions.spreadsheet.fileType || '');
                        else if  (errData === 'pptx')
                            config.msg = this.errorInconsistentExtPptx.replace('%1', this.appOptions.spreadsheet.fileType || '');
                        else
                            config.msg = this.errorInconsistentExt;
                        break;

                    case Asc.c_oAscError.ID.ProtectedRangeByOtherUser:
                        config.msg = this.errorProtectedRange;
                        break;

                    case Asc.c_oAscError.ID.TraceDependentsNoFormulas:
                        config.msg = this.errorDependentsNoFormulas;
                        break;

                    case Asc.c_oAscError.ID.TracePrecedentsNoValidReference:
                        config.msg = this.errorPrecedentsNoValidRef;
                        config.maxwidth = 600;
                        break;

                    case Asc.c_oAscError.ID.LockedCellGoalSeek:
                        config.msg = this.errorLockedCellGoalSeek;
                        break;

                    case Asc.c_oAscError.ID.CircularReference:
                        config.msg = this.errorCircularReference;
                        config.maxwidth = 600;
                        break;

                    case Asc.c_oAscError.ID.CannotSaveWatermark:
                        config.maxwidth = 600;
                        config.msg = this.errorSaveWatermark;
                        break;

                    case Asc.c_oAscError.ID.CalculatedItemInPageField:
                        config.msg = this.errorCalculatedItemInPageField;
                        break;

                    case Asc.c_oAscError.ID.NotUniqueFieldWithCalculated:
                        config.msg = this.errorNotUniqueFieldWithCalculated;
                        break;

                    case Asc.c_oAscError.ID.MacroUnavailableWarning:
                        config.msg = this.errorMacroUnavailableWarning.replace('%1', errData ? "'" + errData + "'" : '');
                        config.maxwidth = 600;
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

                    if (this.appOptions.canRequestClose) {
                        config.msg += '<br><br>' + this.criticalErrorExtTextClose;
                        config.callback = function(btn) {
                            if (btn == 'ok') {
                                Common.Gateway.requestClose();
                                Common.Controllers.Desktop.requestClose();
                            }
                        }
                    } else if (this.appOptions.canBackToFolder && !this.appOptions.isDesktopApp && typeof id !== 'string' && this.appOptions.customization.goback.url && this.appOptions.customization.goback.blank===false) {
                        config.msg += '<br><br>' + this.criticalErrorExtText;
                        config.callback = function(btn) {
                            if (btn == 'ok') {
                                Common.NotificationCenter.trigger('goback', true);
                            }
                        }
                    }
                    if (id == Asc.c_oAscError.ID.DataEncrypted || id == Asc.c_oAscError.ID.ConvertationOpenLimitError) {
                        this.api.asc_coAuthoringDisconnect();
                        Common.NotificationCenter.trigger('api:disconnect');
                    }
                } else {
                    Common.Gateway.reportWarning(id, config.msg);

                    config.title    = config.title || this.notcriticalErrorTitle;
                    config.iconCls  = config.iconCls || 'warn';
                    config.buttons  = config.buttons || ['ok'];
                    config.callback = _.bind(function(btn){
                        if (id == Asc.c_oAscError.ID.Warning && btn == 'ok' && this.appOptions.canDownload) {
                            Common.UI.Menu.Manager.hideAll();
                            if (this.appOptions.isDesktopApp && this.appOptions.isOffline)
                                this.api.asc_DownloadAs();
                            else {
                                this._isDocReady ? this.getApplication().getController('LeftMenu').leftMenu.showMenu('file:saveas') : (this._needToSaveAsFile = true);
                            }
                        } else if (id == Asc.c_oAscError.ID.EditingError) {
                            this.disableEditing(true);
                            Common.NotificationCenter.trigger('api:disconnect', true); // enable download and print
                        } else if (id == Asc.c_oAscError.ID.DataValidate && btn !== 'ok') {
                            this.api.asc_closeCellEditor(true);
                        } else if (id == Asc.c_oAscError.ID.FillAllRowsWarning && btn === 'fillOther' && _.isFunction(callback)) {
                            callback();
                        }
                        this.onEditComplete();
                    }, this);
                }

                if (!Common.Utils.ModalWindow.isVisible() || $('.asc-window.modal.alert[data-value=' + id + ']').length<1)
                    setTimeout(function() {Common.UI.alert(config).$window.attr('data-value', id);}, 1);

                (id!==undefined) && Common.component.Analytics.trackEvent('Internal Error', id.toString());
            },

            onCoAuthoringDisconnect: function() {
                this.getApplication().getController('Viewport').getView('Viewport').setMode({isDisconnected:true});
                this.getApplication().getController('Viewport').getView('Common.Views.Header').setCanRename(false);
                this.appOptions.canRename = false;
                this._state.isDisconnected = true;
            },

            showTips: function(strings, options) {
                var me = this;
                if (!strings.length) return;
                if (typeof(strings)!='object') strings = [strings];

                function closeTip(cmp){
                    me.tipTimeout && clearTimeout(me.tipTimeout);
                    setTimeout(showNextTip, 300);
                }

                function showNextTip() {
                    var str_tip = strings.shift();
                    if (str_tip) {
                        if (!(options && options.hideCloseTip))
                            str_tip += '\n' + me.textCloseTip;
                        me.tooltip.setTitle(str_tip);
                        me.tooltip.show();
                        me.tipTimeout && clearTimeout(me.tipTimeout);
                        if (options && options.timeout) {
                            me.tipTimeout = setTimeout(function () {
                                me.tooltip.hide();
                                closeTip();
                            }, options.timeout);
                        }
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
                    this.tooltip.on('tooltip:hideonclick',closeTip);
                }

                showNextTip();
            },

            updateWindowTitle: function(change, force) {
                if (this._state.isDocModified !== change || force) {
                    if (this.headerView) {
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
                    }

                    this._isDocReady && (this._state.isDocModified !== change) && Common.Gateway.setDocumentModified(change);
                    if (change && (!this._state.fastCoauth || this._state.usersCount<2))
                        this.getApplication().getController('Statusbar').setStatusCaption('', true);

                    this._state.isDocModified = change;
                }
            },

            onDocumentChanged: function() {
            },

            onDocumentModifiedChanged: function(change) {
                this.updateWindowTitle(change);
                if (this._state.isDocModified !== change) {
                    this._isDocReady && Common.Gateway.setDocumentModified(change);
                }
                
                this.api && this.disableSaveButton(this.api.asc_isDocumentCanSave());
            },

            onDocumentCanSaveChanged: function (isCanSave) {
                this.disableSaveButton(isCanSave)
            },

            disableSaveButton: function (isCanSave) {
                if (!this.toolbarView || !this.toolbarView.btnCollabChanges) return;

                var forcesave = this.appOptions.forcesave || this.appOptions.canSaveDocumentToBinary,
                    isSyncButton = (this.toolbarView.btnCollabChanges.rendered) ? this.toolbarView.btnCollabChanges.cmpEl.hasClass('notify') : false,
                    isDisabled = !isCanSave && !isSyncButton && !forcesave || this._state.isDisconnected || this._state.fastCoauth && this._state.usersCount>1 && !forcesave;
                this.toolbarView.lockToolbar(Common.enumLock.cantSave, isDisabled, {array: [this.toolbarView.btnSave]});
            },

            onBeforeUnload: function() {
                Common.localStorage.save();

                var isEdit = this.permissions.edit !== false && this.editorConfig.mode !== 'view' && this.editorConfig.mode !== 'editdiagram' && this.editorConfig.mode !== 'editmerge' && this.editorConfig.mode !== 'editole';
                if (isEdit && this.api.asc_isDocumentModified()) {
                    var me = this;
                    this.api.asc_stopSaving();
                    this._state.unloadTimer = 1000;
                    this.continueSavingTimer = window.setTimeout(function() {
                        me.api.asc_continueSaving();
                        me._state.unloadTimer = 0;
                    }, 500);

                    return this.leavePageText;
                } else
                    this._state.unloadTimer = 10000;
            },

            onUnload: function() {
                if (this.continueSavingTimer) clearTimeout(this.continueSavingTimer);
            },

            onBeforeUnloadView: function() {
                Common.localStorage.save();
                this._state.unloadTimer = 10000;
            },

            hidePreloader: function() {
                var promise;
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
                        Common.UI.LayoutManager.applyCustomization();
                        if (this.appOptions.customization && (typeof (this.appOptions.customization) == 'object')) {
                            if (this.appOptions.customization.leftMenu!==undefined)
                                console.log("Obsolete: The 'leftMenu' parameter of the 'customization' section is deprecated. Please use 'leftMenu' parameter in the 'customization.layout' section instead.");
                            if (this.appOptions.customization.rightMenu!==undefined)
                                console.log("Obsolete: The 'rightMenu' parameter of the 'customization' section is deprecated. Please use 'rightMenu' parameter in the 'customization.layout' section instead.");
                            if (this.appOptions.customization.statusBar!==undefined)
                                console.log("Obsolete: The 'statusBar' parameter of the 'customization' section is deprecated. Please use 'statusBar' parameter in the 'customization.layout' section instead.");
                            if (this.appOptions.customization.toolbar!==undefined)
                                console.log("Obsolete: The 'toolbar' parameter of the 'customization' section is deprecated. Please use 'toolbar' parameter in the 'customization.layout' section instead.");
                        }
                        promise = this.getApplication().getController('Common.Controllers.Plugins').applyUICustomization();
                    }
                }
                
                this.stackLongActions.pop({id: InitApplication, type: Asc.c_oAscAsyncActionType.BlockInteraction});
                Common.NotificationCenter.trigger('layout:changed', 'main');

                (promise || (new Promise(function(resolve, reject) {
                    resolve();
                }))).then(function() {
                    $('#loading-mask').hide().remove();
                    Common.Controllers.Desktop.process('preloader:hide');
                });
            },

            onDownloadUrl: function(url, fileType) {
                if (this._state.isFromGatewayDownloadAs) {
                    Common.Gateway.downloadAs(url, fileType);
                }
                this._state.isFromGatewayDownloadAs = false;
            },

            onDownloadCancel: function() {
                this._state.isFromGatewayDownloadAs = false;
            },

            onUpdateVersion: function(callback) {
                this.editorConfig && this.editorConfig.canUpdateVersion && console.log("Obsolete: The 'onOutdatedVersion' event is deprecated. Please use 'onRequestRefreshFile' event and 'refreshFile' method instead.");

                var me = this;
                me.needToUpdateVersion = true;
                me.onLongActionEnd(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);
                Common.UI.TooltipManager.showTip({ step: 'updateVersionReload', text: this.errorUpdateVersion, header: this.titleUpdateVersion,
                    target: '#toolbar', maxwidth: 'none', closable: false, automove: true, noHighlight: true, noArrow: true,
                    callback: function() {
                        _.defer(function() {
                            Common.Gateway.updateVersion();
                            if (callback) callback.call(me);
                            me.editorConfig && me.editorConfig.canUpdateVersion && me.onLongActionBegin(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);
                        })
                    }
                });
                this.disableEditing(true, 'not-loaded');
                Common.NotificationCenter.trigger('api:disconnect');
            },

            onServerVersion: function(buildVersion) {
                if (this.changeServerVersion) return true;

                const cur_version = this.getApplication().getController('LeftMenu').leftMenu.getMenu('about').txtVersionNum;
                const cropped_version = cur_version.match(/^(\d+.\d+.\d+)/);
                if (!window.compareVersions && (!cropped_version || cropped_version[1] !== buildVersion)) {
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
                    if (this._isDocReady) { // receive after refresh file
                        this.disableEditing(true);
                        Common.NotificationCenter.trigger('api:disconnect');
                    }
                    return true;
                }
                return false;
            },

            onAdvancedOptions: function(type, advOptions, mode, formatOptions) {
                if (this._state.openDlg) return;

                var me = this;
                if (type == Asc.c_oAscAdvancedOptionsID.CSV) {
                    me._state.openDlg = new Common.Views.OpenDialog({
                        title: Common.Views.OpenDialog.prototype.txtTitle.replace('%1', 'CSV'),
                        closable: (mode==2), // if save settings
                        type: Common.Utils.importTextType.CSV,
                        preview: advOptions.asc_getData(),
                        codepages: advOptions.asc_getCodePages(),
                        settings: advOptions.asc_getRecommendedSettings(),
                        api: me.api,
                        handler: function (result, settings) {
                            me.isShowOpenDialog = false;
                            if (result == 'ok') {
                                if (me && me.api) {
                                    if (mode==2) {
                                        formatOptions && formatOptions.asc_setAdvancedOptions(settings.textOptions);
                                        me.api.asc_DownloadAs(formatOptions);
                                    } else
                                        me.api.asc_setAdvancedOptions(type, settings.textOptions);
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
                        warning: !(me.appOptions.isDesktopApp && me.appOptions.isOffline) && (typeof advOptions == 'string'),
                        warningMsg: advOptions,
                        validatePwd: !!me._state.isDRM,
                        handler: function (result, value) {
                            me.isShowOpenDialog = false;
                            if (result == 'ok') {
                                if (me && me.api) {
                                    me.api.asc_setAdvancedOptions(type, value.drmOptions);
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
                if (me._state.requireUserAction) {
                    Common.Gateway.userActionRequired();
                    me._state.requireUserAction = false;
                }
            },

            onActiveSheetChanged: function(index) {
                if (!this.appOptions.isEditMailMerge && window.editor_elements_prepared) {
                    this.application.getController('Statusbar').selectTab(index);

                    if (!this.appOptions.isEditOle && this.appOptions.canViewComments && !this.dontCloseDummyComment) {
                        Common.NotificationCenter.trigger('comments:updatefilter', ['doc', 'sheet' + this.api.asc_getWorksheetId(index)], false ); //  hide popover
                    }
                }
            },

            onConfirmAction: function(id, apiCallback, data) {
                var me = this;
                switch (id) {
                    case Asc.c_oAscConfirm.ConfirmReplaceRange:
                    case Asc.c_oAscConfirm.ConfirmReplaceFormulaInTable:
                        Common.UI.warning({
                            title: this.notcriticalErrorTitle,
                            msg: id == Asc.c_oAscConfirm.ConfirmReplaceRange ? this.confirmMoveCellRange : this.confirmReplaceFormulaInTable,
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
                        break;
                    case Asc.c_oAscConfirm.ConfirmPutMergeRange:
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
                        break;
                    case Asc.c_oAscConfirm.ConfirmChangeProtectRange:
                        var win = new Common.Views.OpenDialog({
                            title: this.txtUnlockRange,
                            closable: true,
                            type: Common.Utils.importTextType.DRM,
                            warning: true,
                            warningMsg: this.txtUnlockRangeWarning,
                            txtOpenFile: this.txtUnlockRangeDescription,
                            validatePwd: false,
                            handler: function (result, value) {
                                if (me.api && apiCallback)  {
                                    if (result == 'ok') {
                                        me.api.asc_checkProtectedRangesPassword(value.drmOptions.asc_getPassword(), data, function(res) {
                                            apiCallback(res, false);
                                        });
                                    } else
                                        apiCallback(false, true);
                                }
                                me.onEditComplete(me.application.getController('DocumentHolder').getView('DocumentHolder'));
                            }
                        });
                        win.show();
                        break;
                    case Asc.c_oAscConfirm.ConfirmAddCellWatches:
                        Common.UI.warning({
                            title: this.notcriticalErrorTitle,
                            msg: (data>Asc.c_nAscMaxAddCellWatchesCount) ? Common.Utils.String.format(this.confirmAddCellWatchesMax, Asc.c_nAscMaxAddCellWatchesCount) : Common.Utils.String.format(this.confirmAddCellWatches, data),
                            buttons: ['yes', 'no'],
                            primary: 'yes',
                            callback: _.bind(function(btn) {
                                if (apiCallback)  {
                                    apiCallback(btn === 'yes');
                                }
                            }, this)
                        });
                        break;
                    case Asc.c_oAscConfirm.ConfirmMaxChangesSize:
                        Common.UI.warning({
                            title: this.notcriticalErrorTitle,
                            msg: this.confirmMaxChangesSize,
                            buttons: [{value: 'ok', caption: this.textUndo, primary: true}, {value: 'cancel', caption: this.textContinue}],
                            maxwidth: 600,
                            callback: _.bind(function(btn) {
                                if (apiCallback)  {
                                    apiCallback(btn === 'ok');
                                }
                                me.onEditComplete(me.application.getController('DocumentHolder').getView('DocumentHolder'));
                            }, this)
                        });
                        break;
                    case Asc.c_oAscConfirm.ConfirmReplaceHeaderFooterPicture:
                        Common.UI.warning({
                            title: this.notcriticalErrorTitle,
                            msg: this.confirmReplaceHFPicture,
                            buttons: [{value: 'ok', caption: this.textReplace, primary: true}, {value: 'cancel', caption: this.textKeep}],
                            maxwidth: 600,
                            callback: _.bind(function(btn) {
                                if (apiCallback)  {
                                    apiCallback(btn === 'ok');
                                }
                            }, this)
                        });
                        break;
                }
            },

            checkProtectedRange: function(callback, scope, args) {
                var result = this.api.asc_isProtectedSheet() && this.api.asc_checkLockedCells() ? this.api.asc_checkProtectedRange() : false;
                if (result===null) {
                    this.onError(Asc.c_oAscError.ID.ChangeOnProtectedSheet, Asc.c_oAscError.Level.NoCritical);
                    return;
                }

                if (result) {
                    var me = this;
                    var win = new Common.Views.OpenDialog({
                        title: this.txtUnlockRange,
                        closable: true,
                        type: Common.Utils.importTextType.DRM,
                        warning: true,
                        warningMsg: this.txtUnlockRangeWarning,
                        txtOpenFile: this.txtUnlockRangeDescription,
                        validatePwd: false,
                        handler: function (result, value) {
                            if (result == 'ok') {
                                if (me.api) {
                                    me.api.asc_checkActiveCellPassword(value.drmOptions.asc_getPassword(), function(res) {
                                        if (res) {
                                            callback && setTimeout(function() {
                                                callback.apply(scope, args);
                                            }, 1);
                                        } else {
                                            Common.UI.warning({
                                                msg: me.errorWrongPassword,
                                                callback: function() {
                                                    Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                                                }
                                            });
                                        }
                                    });
                                }
                            }
                            Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                        }
                    });
                    win.show();
                } else {
                    callback && setTimeout(function() {
                        callback.apply(scope, args);
                    }, 1);
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
                    shapeStore = this.getCollection('ShapeGroups'),
                    name_arr = {};

                shapeStore.reset();

                _.each(groupNames, function(groupName, index){
                    var store = new Backbone.Collection([], {
                        model: SSE.Models.ShapeModel
                    }),
                        arr = [];

                    var cols = (shapes[index].length) > 18 ? 7 : 6,
                        height = Math.ceil(shapes[index].length/cols) * 35 + 3,
                        width = 30 * cols;

                    _.each(shapes[index], function(shape, idx){
                        var name = me['txtShape_' + shape.Type];
                        arr.push({
                            data     : {shapeType: shape.Type},
                            tip      : name || (me.textShape + ' ' + (idx+1)),
                            allowSelected : true,
                            selected: false
                        });
                        if (name)
                            name_arr[shape.Type] = name;
                    });
                    store.add(arr);
                    shapegrouparray.push({
                        groupName   : me.shapeGroupNames[index],
                        groupStore  : store,
                        groupWidth  : width,
                        groupHeight : height
                    });
                });

                shapeStore.add(shapegrouparray);

                setTimeout(function(){
                    me.getApplication().getController('Toolbar').onApiAutoShapes();
                }, 50);
                this.api.asc_setShapeNames(name_arr);
            },

            fillTextArt: function(shapes){
                var arr = [],
                    artStore = this.getCollection('Common.Collections.TextArt');

                if (!shapes && artStore.length>0) {// shapes == undefined when update textart collection (from asc_onSendThemeColors)
                    shapes = this.api.asc_getTextArtPreviews();
                }
                if (_.isEmpty(shapes)) return;

                _.each(shapes, function(shape, index){
                    arr.push({
                        imageUrl : shape,
                        data     : index,
                        allowSelected : true,
                        selected: false
                    });
                });
                artStore.reset(arr);
            },

            fillCondFormatIcons: function(icons){
                if (_.isEmpty(icons)) return;

                var arr = [],
                    store = this.getCollection('ConditionalFormatIcons');
                _.each(icons, function(icon, index){
                    arr.push({
                        icon : icon,
                        index  : index
                    });
                });
                store.reset(arr);
            },

            fillCondFormatIconsPresets: function(iconSets){
                if (_.isEmpty(iconSets)) return;

                var arr = [],
                    store = this.getCollection('ConditionalFormatIconsPresets');
                _.each(iconSets, function(iconSet, index){
                    arr.push({
                        icons : iconSet,
                        data  : index
                    });
                });
                store.reset(arr);
            },

            updateThemeColors: function() {
                var me = this;
                !me.appOptions.isEditOle && !me.appOptions.isEditDiagram && setTimeout(function(){
                    me.getApplication().getController('RightMenu').UpdateThemeColors();
                }, 50);

                !me.appOptions.isEditDiagram && setTimeout(function(){
                    me.getApplication().getController('Toolbar').updateThemeColors();
                }, 50);

                setTimeout(function(){
                    me.getApplication().getController('Statusbar').updateThemeColors();
                }, 50);
            },

            onSendThemeColors: function(colors, standart_colors) {
                Common.Utils.ThemeColor.setColors(colors, standart_colors);
                if (window.styles_loaded) {
                    if (!this.appOptions.isEditMailMerge)
                        this.updateThemeColors();

                    if (!this.appOptions.isEditMailMerge && !this.appOptions.isEditDiagram && !this.appOptions.isEditOle) {
                        var me = this;
                        setTimeout(function(){
                            me.fillTextArt();
                        }, 1);
                    }
                }
            },

            loadLanguages: function(apiLangs) {
                this.languages = apiLangs;
                window.styles_loaded && this.setLanguages();
            },

            setLanguages: function() {
                if (!this.languages)
                    return;
                let sLangs = Common.Controllers.Desktop.systemLangs() || {},
                    arr = [],
                    me = this;
                for (let name in sLangs) {
                    sLangs.hasOwnProperty(name) && arr.push(name);
                }
                sLangs = arr;

                arr = []; // system languages can be 'en'... (MacOs)
                sLangs.forEach(function(lang) {
                    let rec = Common.util.LanguageInfo.getLocalLanguageCode(lang);
                    rec && (rec = me.languages.indexOf(rec.toString())<0 ? null : lang);
                    if (!rec) {
                        rec = Common.util.LanguageInfo.getDefaultLanguageCode(lang);
                        rec = rec && me.languages.indexOf(rec.toString())>-1 ? rec : null;
                        rec && (rec = Common.util.LanguageInfo.getLocalLanguageName(parseInt(rec))[0]);
                    }
                    if (!rec) {
                        rec = _.find(me.languages, function(code) {
                            return (Common.util.LanguageInfo.getLocalLanguageName(parseInt(code))[0].indexOf(lang.toLowerCase())===0);
                        });
                        rec && (rec = Common.util.LanguageInfo.getLocalLanguageName(parseInt(rec))[0]);
                    }
                    rec && arr.push(rec);
                });
                sLangs = _.uniq(arr);

                let recentKey = 'app-settings-recent-langs',
                    recentCount = Math.max(5, sLangs.length + 3);
                Common.Utils.InternalSettings.set(recentKey + "-count", recentCount);
                Common.Utils.InternalSettings.set(recentKey + "-offset", sLangs.length);

                arr = Common.localStorage.getItem(recentKey);
                arr = arr ? arr.split(';') : [];
                arr = _.union(sLangs, arr);
                arr.splice(recentCount);
                Common.localStorage.setItem(recentKey, arr.join(';'));
                this.getApplication().getController('Spellcheck').setLanguages(this.languages);
            },

            onInternalCommand: function(data) {
                if (data) {
                    switch (data.command) {
                    case 'setChartData':    this.setChartData(data.data); break;
                    case 'getChartData':    this.getChartData(); break;
                    case 'setMergeData':    this.setMergeData(data.data); break;
                    case 'getMergeData':    this.getMergeData(); break;
                    case 'setOleData':      this.setOleData(data.data); break;
                    case 'getOleData':      this.getOleData(); break;
                    case 'setAppDisabled':
                        if (this.isAppDisabled===undefined && !data.data) { // first editor opening
                            Common.NotificationCenter.trigger('layout:changed', 'main');
                            this.loadMask && this.loadMask.isVisible() && this.loadMask.updatePosition();
                        }
                        this.isAppDisabled = data.data;
                        break;
                    case 'reshow': 
                        if ( Common.Utils.firefoxVersion != 0 ) {
                            Common.UI.Themes.refreshTheme(true);
                        }

                        Common.NotificationCenter.trigger('external:reshow');
                        break;
                    case 'queryClose':
                        if (!Common.Utils.ModalWindow.isVisible()) {
                            this.isFrameClosed = true;
                            this.api.asc_closeCellEditor();
                            this.appOptions.isEditOle && Common.NotificationCenter.trigger('oleedit:close');
                            if (this.appOptions.isEditDiagram) {
                                this._state.chartProtectTip && this._state.chartProtectTip.close();
                                this._state.chartProtectTip = undefined;
                            }
                            Common.UI.Menu.Manager.hideAll();
                            Common.Gateway.internalMessage('canClose', {mr:data.data.mr, answer: true});
                        } else
                            Common.Gateway.internalMessage('canClose', {answer: false});
                        break;
                    case 'window:drag':
                        this.isDiagramDrag = data.data;
                        break;
                    case 'window:resize':
                        this.isDiagramResize = data.data;
                        break;
                    case 'processmouse':
                        this.onProcessMouse(data.data);
                        break;
                    case 'theme:change':
                        document.documentElement.className =
                            document.documentElement.className.replace(/theme-\w+\s?/, data.data);
                        this.api.asc_setSkin(data.data == "theme-dark" ? 'flatDark' : "flat");
                        break;
                    case 'generalToFrameData':
                        this.api.asc_getInformationBetweenFrameAndGeneralEditor(data.data);
                        break;
                    case 'wopi:saveAsComplete':
                        this.onExternalMessage({msg: this.txtSaveCopyAsComplete});
                        break;
                    }
                }
            },

            setChartData: function(chart) {
                if (typeof chart === 'object' && this.api) {
                    this.api.asc_addChartDrawingObject(chart);
                    this.isFrameClosed = false;
                    if (this.lastFrameError) {
                        this.onError(this.lastFrameError.id, this.lastFrameError.level, this.lastFrameError.errData, this.lastFrameError.callback);
                        this.lastFrameError = undefined;
                    }
                }
            },

            getChartData: function() {
                if (this.api) {
                    this.api.asc_getBinaryFromDiagramFrame().then(function(chartData){
                        if (typeof chartData === 'object') {
                            Common.Gateway.internalMessage('chartData', {
                                data: chartData
                            });
                        }
                    });
                }
            },

            setOleData: function(obj) {
                if ((typeof obj === 'object' || obj==="empty") && this.api) {
                    this.api.asc_addTableOleObjectInOleEditor(typeof obj === 'object' ? obj : undefined);
                    this.isFrameClosed = false;
                    if (this.lastFrameError) {
                        this.onError(this.lastFrameError.id, this.lastFrameError.level, this.lastFrameError.errData, this.lastFrameError.callback);
                        this.lastFrameError = undefined;
                    }
                }
            },

            getOleData: function() {
                if (this.api) {
                    this.api.asc_getBinaryInfoOleObject().then(function(oleData){
                        if (typeof oleData === 'object') {
                            Common.Gateway.internalMessage('oleData', {
                                data: oleData
                            });
                        }
                    });
                }
            },

            onFrameEditorReady: function() {
                Common.Gateway.internalMessage('frameEditorReady', {});
            },

            setMergeData: function(merge) {
                if (typeof merge === 'object' && this.api) {
                    this.api.asc_setData(merge);
                    this.isFrameClosed = false;
                    if (this.lastFrameError) {
                        this.onError(this.lastFrameError.id, this.lastFrameError.level, this.lastFrameError.errData, this.lastFrameError.callback);
                        this.lastFrameError = undefined;
                    }
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

            onSendFromFrameToGeneralEditor: function(data) {
                Common.Gateway.internalMessage('frameToGeneralData', data);
            },

            onShowProtectedChartPopup: function(value) {
                if (value) {
                    if (!this._state.chartProtectTip) {
                        var me = this,
                            text = (value.asc_getSource() || '').replace(new RegExp("%20",'g')," "),
                            showLink = !!text && (this.appOptions.canRequestOpen || this.api.asc_isOffline());
                        this._state.chartProtectTip = new Common.UI.SynchronizeTip({
                            extCls: 'no-arrow',
                            placement: 'bottom',
                            target: $('.toolbar'),
                            text: this.warnExternalChartProtected,
                            showLink: showLink,
                            textLink: this.txtOpen + ' ' + text,
                            closable: true,
                            showButton: false
                        });
                        this._state.chartProtectTip.on('closeclick', function () {
                            this.close();
                            me._state.chartProtectTip = undefined;
                        });
                        showLink && this._state.chartProtectTip.on('dontshowclick', function () {
                            me.openExternalLink(value);
                            this.close();
                            me._state.chartProtectTip = undefined;
                        });
                    }
                    this._state.chartProtectTip.show();
                }
            },

            openExternalLink: function(externalRef) {
                if (externalRef) {
                    var data = this.api.asc_openExternalReference(externalRef);
                    if (data) {
                        switch (data.asc_getType()) {
                            case Asc.c_oAscExternalReferenceType.link:
                                data = {link: data.asc_getData()};
                                break;
                            case Asc.c_oAscExternalReferenceType.path:
                                data = {path: data.asc_getData()};
                                break;
                            case Asc.c_oAscExternalReferenceType.referenceData:
                                data = {
                                    referenceData: data.asc_getData(),
                                    path: data.asc_getPath()
                                };
                                break;
                        }
                        data.windowName = 'wname-' + Date.now();
                        window.open("", data.windowName);
                        Common.Gateway.requestOpen(data);
                    }
                }
            },

            unitsChanged: function(m) {
                var value = Common.localStorage.getItem("sse-settings-unit");
                value = (value!==null) ? parseInt(value) : Common.Utils.Metric.getDefaultMetric();
                Common.Utils.Metric.setCurrentMetric(value);
                Common.Utils.InternalSettings.set("sse-settings-unit", value);
                if (this.appOptions.isEdit) {
                    this.getApplication().getController('RightMenu').updateMetricUnit();
                    this.getApplication().getController('Toolbar').getView('Toolbar').updateMetricUnit();
                }
                this.getApplication().getController('Print').getView('PrintWithPreview').updateMetricUnit();
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

            onProtectedRangeLocked: function() {
                if ($('.asc-window.modal.alert:visible').length < 1) {
                    Common.UI.alert({
                        msg: this.errorCreateRange,
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
                var val = Common.localStorage.getItem("sse-hide-try-undoredo");
                if (!(val && parseInt(val) == 1))
                    Common.UI.info({
                        width: 500,
                        msg: this.appOptions.canChangeCoAuthoring ? this.textTryUndoRedo : this.textTryUndoRedoWarn,
                        iconCls: 'info',
                        buttons: this.appOptions.canChangeCoAuthoring ? [{value: 'custom', caption: this.textStrict}, 'cancel'] : ['ok'],
                        primary: this.appOptions.canChangeCoAuthoring ? 'custom' : 'ok',
                        dontshow: true,
                        callback: _.bind(function(btn, dontshow){
                            if (dontshow) Common.localStorage.setItem("sse-hide-try-undoredo", 1);
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

            onUserConnection: function(change){
                if (change && this.appOptions.user.guest && this.appOptions.canRenameAnonymous && (change.asc_getIdOriginal() == this.appOptions.user.id)) { // change name of the current user
                    var name = change.asc_getUserName();
                    if (name && name !== AscCommon.UserInfoParser.getCurrentName() ) {
                        this._renameDialog && this._renameDialog.close();
                        AscCommon.UserInfoParser.setCurrentName(name);
                        this.headerView.setUserName(AscCommon.UserInfoParser.getParsedName(name));

                        var idx1 = name.lastIndexOf('('),
                            idx2 = name.lastIndexOf(')'),
                            str = (idx1>0) && (idx1<idx2) ? name.substring(0, idx1-1) : '';
                        if (Common.localStorage.getItem("guest-username")!==null) {
                            Common.localStorage.setItem("guest-username", str);
                        }
                        Common.Utils.InternalSettings.set("guest-username", str);
                    }
                }
            },

            applySettings: function() {
                if (this.appOptions.isEdit && !this.appOptions.isOffline && this.appOptions.canCoAuthoring) {
                    var value = Common.localStorage.getItem("sse-settings-coauthmode"),
                        oldval = this._state.fastCoauth;
                    this._state.fastCoauth = (value===null || parseInt(value) == 1);
                    if (this._state.fastCoauth && !oldval)
                        this.synchronizeChanges();
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
                filemenu.panels && filemenu.panels['info'] && filemenu.panels['info'].updateInfo(this.appOptions.spreadsheet);
                app.getController('Common.Controllers.ReviewChanges').loadDocument({doc:this.appOptions.spreadsheet});
                Common.Gateway.metaChange(meta);

                if (this.appOptions.wopi) {
                    var idx = meta.title.lastIndexOf('.');
                    Common.Gateway.requestRename(idx>0 ? meta.title.substring(0, idx) : meta.title);
                }
            },

            onPrint: function() {
                if (!this.appOptions.canPrint || Common.Utils.ModalWindow.isVisible()) return;
                Common.NotificationCenter.trigger('file:print', this);
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
                            var opts = new Asc.asc_CDownloadOptions(Asc.c_oAscFileType.PDF);
                            opts.asc_setAdvancedOptions(me.getApplication().getController('Print').getPrintParams());
                            me.api.asc_DownloadAs(opts);
                        }
                    };
                }
                if (url) this.iframePrint.src = url;
            },

            onPrintQuick: function() {
                if (!this.appOptions.canQuickPrint) return;

                var value = Common.localStorage.getBool("sse-hide-quick-print-warning"),
                    me = this,
                    handler = function () {
                        var printopt = new Asc.asc_CAdjustPrint();
                        printopt.asc_setNativeOptions({quickPrint: true});
                        var opts = new Asc.asc_CDownloadOptions();
                        opts.asc_setAdvancedOptions(printopt);
                        me.api.asc_Print(opts);
                        Common.component.Analytics.trackEvent('Print');
                    };

                if (value) {
                    handler.call(this);
                } else {
                    Common.UI.warning({
                        msg: this.textTryQuickPrint,
                        buttons: ['yes', 'no'],
                        primary: 'yes',
                        dontshow: true,
                        maxwidth: 500,
                        callback: function(btn, dontshow){
                            dontshow && Common.localStorage.setBool("sse-hide-quick-print-warning", true);
                            if (btn === 'yes') {
                                setTimeout(handler, 1);
                            }
                        }
                    });
                }
            },

            warningDocumentIsLocked: function() {
                var me = this;
                Common.Utils.warningDocumentIsLocked({
                    disablefunc: function (disable) {
                        me.disableEditing(disable, 'reconnect');
                }});
            },

            onRunAutostartMacroses: function() {
                var me = this,
                    enable = !this.editorConfig.customization || (this.editorConfig.customization.macros!==false);
                if (enable) {
                    var value = Common.Utils.InternalSettings.get("sse-macros-mode");
                    if (value==1)
                        this.api.asc_runAutostartMacroses();
                    else if (value === 0) {
                        Common.UI.warning({
                            msg: this.textHasMacros + '<br>',
                            buttons: ['yes', 'no'],
                            primary: 'yes',
                            dontshow: true,
                            textDontShow: this.textRemember,
                            callback: function(btn, dontshow){
                                if (dontshow) {
                                    Common.Utils.InternalSettings.set("sse-macros-mode", (btn == 'yes') ? 1 : 2);
                                    Common.localStorage.setItem("sse-macros-mode", (btn == 'yes') ? 1 : 2);
                                }
                                if (btn == 'yes') {
                                    setTimeout(function() {
                                        me.api.asc_runAutostartMacroses();
                                    }, 1);
                                }
                            }
                        });
                    }
                }
            },

            onMacrosPermissionRequest: function(url, callback) {
                if (url && callback) {
                    this.stackMacrosRequests.push({url: url, callback: callback});
                    if (this.stackMacrosRequests.length>1) {
                        return;
                    }
                } else if (this.stackMacrosRequests.length>0) {
                    url = this.stackMacrosRequests[0].url;
                    callback = this.stackMacrosRequests[0].callback;
                } else
                    return;

                var me = this;
                var value = Common.Utils.InternalSettings.get("sse-allow-macros-request");
                if (value>0) {
                    callback && callback(value === 1);
                    this.stackMacrosRequests.shift();
                    this.onMacrosPermissionRequest();
                } else {
                    Common.UI.warning({
                        msg: this.textRequestMacros.replace('%1', url),
                        buttons: ['yes', 'no'],
                        primary: 'yes',
                        dontshow: true,
                        textDontShow: this.textRememberMacros,
                        maxwidth: 600,
                        callback: function(btn, dontshow){
                            if (dontshow) {
                                Common.Utils.InternalSettings.set("sse-allow-macros-request", (btn == 'yes') ? 1 : 2);
                                Common.localStorage.setItem("sse-allow-macros-request", (btn == 'yes') ? 1 : 2);
                            }
                            setTimeout(function() {
                                if (callback) callback(btn == 'yes');
                                me.stackMacrosRequests.shift();
                                me.onMacrosPermissionRequest();
                            }, 1);
                        }
                    });
                }
            },

            loadAutoCorrectSettings: function() {
                // autocorrection
                var me = this;
                var value = Common.localStorage.getItem("sse-settings-math-correct-add");
                Common.Utils.InternalSettings.set("sse-settings-math-correct-add", value);
                var arrAdd = value ? JSON.parse(value) : [];
                value = Common.localStorage.getItem("sse-settings-math-correct-rem");
                Common.Utils.InternalSettings.set("sse-settings-math-correct-rem", value);
                var arrRem = value ? JSON.parse(value) : [];
                value = Common.localStorage.getBool("sse-settings-math-correct-replace-type", true); // replace on type
                Common.Utils.InternalSettings.set("sse-settings-math-correct-replace-type", value);
                me.api.asc_refreshOnStartAutoCorrectMathSymbols(arrRem, arrAdd, value);

                value = Common.localStorage.getItem("sse-settings-rec-functions-add");
                Common.Utils.InternalSettings.set("sse-settings-rec-functions-add", value);
                arrAdd = value ? JSON.parse(value) : [];
                value = Common.localStorage.getItem("sse-settings-rec-functions-rem");
                Common.Utils.InternalSettings.set("sse-settings-rec-functions-rem", value);
                arrRem = value ? JSON.parse(value) : [];
                me.api.asc_refreshOnStartAutoCorrectMathFunctions(arrRem, arrAdd);

                value = Common.localStorage.getBool("sse-settings-autoformat-new-rows", true);
                Common.Utils.InternalSettings.set("sse-settings-autoformat-new-rows", value);
                me.api.asc_setIncludeNewRowColTable(value);

                value = Common.localStorage.getBool("sse-settings-autoformat-hyperlink", true);
                Common.Utils.InternalSettings.set("sse-settings-autoformat-hyperlink", value);
                me.api.asc_SetAutoCorrectHyperlinks(value);
            },

            showRenameUserDialog: function() {
                if (this._renameDialog) return;

                var me = this;
                this._renameDialog = new Common.Views.UserNameDialog({
                    label: this.textRenameLabel,
                    error: this.textRenameError,
                    value: Common.Utils.InternalSettings.get("guest-username") || '',
                    check: Common.Utils.InternalSettings.get("save-guest-username") || false,
                    validation: function(value) {
                        return value.length<128 ? true : me.textLongName;
                    },
                    repaintcallback: function() {
                        this.setPosition(Common.Utils.innerWidth() - this.options.width - 15, 30);
                    },
                    handler: function(result, settings) {
                        if (result == 'ok') {
                            var name = settings.input ? settings.input + ' (' + me.textGuest + ')' : me.textAnonymous;
                            var _user = new Asc.asc_CUserInfo();
                            _user.put_FullName(name);

                            var docInfo = new Asc.asc_CDocInfo();
                            docInfo.put_UserInfo(_user);
                            me.api.asc_changeDocInfo(docInfo);

                            settings.checkbox ? Common.localStorage.setItem("guest-username", settings.input) : Common.localStorage.removeItem("guest-username");
                            Common.Utils.InternalSettings.set("guest-username", settings.input);
                            Common.Utils.InternalSettings.set("save-guest-username", settings.checkbox);
                        }
                    }
                });
                this._renameDialog.on('close', function() {
                    me._renameDialog = undefined;
                });
                this._renameDialog.show(Common.Utils.innerWidth() - this._renameDialog.options.width - 15, 30);
            },

            onRefreshHistory: function(opts) {
                if (!this.appOptions.canUseHistory) return;

                this.loadMask && this.loadMask.hide();
                if (opts.data.error || !opts.data.history) {
                    var historyStore = this.getApplication().getCollection('Common.Collections.HistoryVersions');
                    if (historyStore && historyStore.size()>0) {
                        historyStore.each(function(item){
                            item.set('canRestore', false);
                        });
                    }
                    Common.UI.alert({
                        title: this.notcriticalErrorTitle,
                        msg: (opts.data.error) ? opts.data.error : this.txtErrorLoadHistory,
                        iconCls: 'warn',
                        buttons: ['ok'],
                        callback: _.bind(function(btn){
                            this.onEditComplete();
                        }, this)
                    });
                } else {
                    this.api.asc_coAuthoringDisconnect();
                    this.headerView.setCanRename(false);
                    this.headerView.getButton('users') && this.headerView.getButton('users').hide();
                    this.headerView.getButton('share') && this.headerView.getButton('share').setVisible(false);
                    this.getApplication().getController('LeftMenu').getView('LeftMenu').showHistory();
                    this.disableEditing(true);
                    this._renameDialog && this._renameDialog.close();
                    var versions = opts.data.history,
                        historyStore = this.getApplication().getCollection('Common.Collections.HistoryVersions'),
                        currentVersion = null,
                        arrIds = [];
                    if (historyStore) {
                        var arrVersions = [], ver, version, group = -1, prev_ver = -1, arrColors = [], docIdPrev = '',
                            usersStore = this.getApplication().getCollection('Common.Collections.HistoryUsers'), user = null, usersCnt = 0;

                        for (var ver=versions.length-1, index = 0; ver>=0; ver--, index++) {
                            version = versions[ver];
                            if (version.versionGroup===undefined || version.versionGroup===null)
                                version.versionGroup = version.version;
                            if (version) {
                                if (!version.user) version.user = {};
                                docIdPrev = (ver>0 && versions[ver-1]) ? versions[ver-1].key : version.key + '0';
                                user = usersStore.findUser(version.user.id);
                                if (!user) {
                                    var color = Common.UI.ExternalUsers.getColor(version.user.id || version.user.name || this.textAnonymous, true);
                                    user = new Common.Models.User({
                                        id          : version.user.id,
                                        username    : version.user.name,
                                        colorval    : color,
                                        color       : this.generateUserColor(color)
                                    });
                                    version.user.id && usersStore.add(user);
                                }
                                var avatar = Common.UI.ExternalUsers.getImage(version.user.id);
                                (avatar===undefined) && arrIds.push(version.user.id);
                                arrVersions.push(new Common.Models.HistoryVersion({
                                    version: version.versionGroup,
                                    revision: version.version,
                                    userid : version.user.id,
                                    username : version.user.name,
                                    usercolor: user.get('color'),
                                    initials : Common.Utils.getUserInitials(AscCommon.UserInfoParser.getParsedName(version.user.name || this.textAnonymous)),
                                    avatar : avatar,
                                    created: version.created,
                                    docId: version.key,
                                    markedAsVersion: (group!==version.versionGroup),
                                    selected: (opts.data.currentVersion == version.version),
                                    canRestore: this.appOptions.canHistoryRestore && (ver < versions.length-1),
                                    isExpanded: true,
                                    serverVersion: version.serverVersion,
                                    fileType: 'xslx',
                                    index: index
                                }));
                                if (opts.data.currentVersion == version.version) {
                                    currentVersion = arrVersions[arrVersions.length-1];
                                }
                                group = version.versionGroup;
                                if (prev_ver!==version.version) {
                                    prev_ver = version.version;
                                    arrColors.reverse();
                                    for (i=0; i<arrColors.length; i++) {
                                        arrVersions[arrVersions.length-i-2].set('arrColors',arrColors);
                                    }
                                    arrColors = [];
                                }
                                arrColors.push(user.get('colorval'));

                                var changes = version.changes, change, i;
                                if (changes && changes.length>0) {
                                    arrVersions[arrVersions.length-1].set('docIdPrev', docIdPrev);
                                    if (!_.isEmpty(version.serverVersion) && version.serverVersion == this.appOptions.buildVersion) {
                                        arrVersions[arrVersions.length-1].set('changeid', changes.length-1);
                                        arrVersions[arrVersions.length-1].set('hasSubItems', changes.length>1);
                                        arrVersions[arrVersions.length-1].set('documentSha256', changes[changes.length-1].documentSha256);
                                        for (i=changes.length-2; i>=0; i--, index++) {
                                            change = changes[i];

                                            user = usersStore.findUser(change.user.id);
                                            if (!user) {
                                                var color = Common.UI.ExternalUsers.getColor(change.user.id || change.user.name || this.textAnonymous, true);
                                                user = new Common.Models.User({
                                                    id          : change.user.id,
                                                    username    : change.user.name,
                                                    colorval    : color,
                                                    color       : this.generateUserColor(color)
                                                });
                                                change.user.id && usersStore.add(user);
                                            }
                                            avatar = Common.UI.ExternalUsers.getImage(change.user.id);
                                            (avatar===undefined) && arrIds.push(change.user.id);
                                            arrVersions.push(new Common.Models.HistoryVersion({
                                                version: version.versionGroup,
                                                revision: version.version,
                                                changeid: i,
                                                userid : change.user.id,
                                                username : change.user.name,
                                                usercolor: user.get('color'),
                                                initials : Common.Utils.getUserInitials(AscCommon.UserInfoParser.getParsedName(change.user.name || this.textAnonymous)),
                                                avatar : avatar,
                                                created: change.created,
                                                docId: version.key,
                                                docIdPrev: docIdPrev,
                                                selected: false,
                                                canRestore: this.appOptions.canHistoryRestore && this.appOptions.canDownload,
                                                isRevision: false,
                                                isVisible: true,
                                                serverVersion: version.serverVersion,
                                                documentSha256: change.documentSha256,
                                                fileType: 'xslx',
                                                hasParent: true,
                                                index: index,
                                                level: 1
                                            }));
                                            arrColors.push(user.get('colorval'));
                                        }
                                    }
                                } else if (ver==0 && versions.length==1) {
                                    arrVersions[arrVersions.length-1].set('docId', version.key + '1');
                                }
                            }
                        }
                        if (arrColors.length>0) {
                            arrColors.reverse();
                            for (i=0; i<arrColors.length; i++) {
                                arrVersions[arrVersions.length-i-1].set('arrColors',arrColors);
                            }
                            arrColors = [];
                        }
                        historyStore.reset(arrVersions);
                        if (currentVersion===null && historyStore.size()>0) {
                            currentVersion = historyStore.at(0);
                            currentVersion.set('selected', true);
                        }
                        if (currentVersion)
                            this.getApplication().getController('Common.Controllers.History').onSelectRevision(null, null, currentVersion);
                        arrIds.length && Common.UI.ExternalUsers.get('info', arrIds);
                    }
                }
            },

            DisableVersionHistory: function() {
                this.editorConfig.canUseHistory = false;
                this.appOptions.canUseHistory = false;
            },

            generateUserColor: function(color) {
                return"#"+("000000"+color.toString(16)).substr(-6);
            },

            onGrabFocus: function() {
                this.getApplication().getController('DocumentHolder').getView().focus();
            },

            onLanguageLoaded: function() {
                if (!Common.Locale.getCurrentLanguage()) {
                    Common.UI.warning({
                        msg: this.errorLang,
                        buttons: [],
                        closable: false
                    });
                    return false;
                }
                return true;
            },

            onCollaborativeChanges: function() {
                if (this._state.hasCollaborativeChanges) return;
                this._state.hasCollaborativeChanges = true;
                if (this.appOptions.isEdit)
                    this.getApplication().getController('Statusbar').setStatusCaption(this.textNeedSynchronize, true);
            },

            synchronizeChanges: function() {
                this.toolbarView && this.toolbarView.synchronizeChanges();
                this._state.hasCollaborativeChanges = false;
            },   
          
            onConvertEquationToMath: function(equation) {
                var me = this,
                    win;
                var msg = this.textConvertEquation + '<br><br><a id="id-equation-convert-help" style="cursor: pointer;">' + this.textLearnMore + '</a>';
                win = Common.UI.warning({
                    width: 500,
                    msg: msg,
                    buttons: ['yes', 'cancel'],
                    primary: 'yes',
                    dontshow: true,
                    textDontShow: this.textApplyAll,
                    callback: _.bind(function(btn, dontshow){
                        if (btn == 'yes') {
                            this.api.asc_ConvertEquationToMath(equation, dontshow);
                        }
                        this.onEditComplete();
                    }, this)
                });
                win.$window.find('#id-equation-convert-help').on('click', function (e) {
                    win && win.close();
                    me.getApplication().getController('LeftMenu').getView('LeftMenu').showMenu('file:help', 'UsageInstructions\/InsertEquation.htm#convertequation');
                })
            },

            onRequestRefreshFile: function() {
                Common.Gateway.requestRefreshFile();
                console.log('Trying to refresh file');
            },

            onRefreshFile: function(data) {
                if (data) {
                    var docInfo = new Asc.asc_CDocInfo();
                    if (data.document) {
                        docInfo.put_Id(data.document.key);
                        docInfo.put_Url(data.document.url);
                        docInfo.put_Title(data.document.title);
                        if (data.document.title) {
                            //Common.Gateway.metaChange({title: data.document.title});
                            this.headerView && this.headerView.setDocumentCaption(data.document.title);
                            this.updateWindowTitle(true);
                            this.appOptions.spreadsheet.title = data.document.title;
                        }
                        data.document.referenceData && docInfo.put_ReferenceData(data.document.referenceData);
                    }
                    if (data.editorConfig) {
                        docInfo.put_CallbackUrl(data.editorConfig.callbackUrl);
                    }
                    if (data.token)
                        docInfo.put_Token(data.token);

                    var _user = new Asc.asc_CUserInfo(); // change for guest!!
                    _user.put_Id(this.appOptions.user.id);
                    _user.put_FullName(this.appOptions.user.fullname);
                    _user.put_IsAnonymousUser(!!this.appOptions.user.anonymous);
                    docInfo.put_UserInfo(_user);

                    var _options = $.extend({}, this.appOptions.spreadsheet.options, this.editorConfig.actionLink || {});
                    docInfo.put_Options(_options);

                    docInfo.put_Format(this.appOptions.spreadsheet.fileType);
                    docInfo.put_Lang(this.editorConfig.lang);
                    docInfo.put_Mode(this.editorConfig.mode);
                    docInfo.put_Permissions(this.permissions);
                    docInfo.put_DirectUrl(data.document && data.document.directUrl ? data.document.directUrl : this.appOptions.spreadsheet.directUrl);
                    docInfo.put_VKey(data.document && data.document.vkey ?  data.document.vkey : this.appOptions.spreadsheet.vkey);
                    docInfo.put_EncryptedInfo(data.editorConfig && data.editorConfig.encryptionKeys ? data.editorConfig.encryptionKeys : this.editorConfig.encryptionKeys);

                    var enable = !this.editorConfig.customization || (this.editorConfig.customization.macros!==false);
                    docInfo.asc_putIsEnabledMacroses(!!enable);
                    enable = !this.editorConfig.customization || (this.editorConfig.customization.plugins!==false);
                    docInfo.asc_putIsEnabledPlugins(!!enable);

                    if (this.editorConfig.customization) {
                        if (this.editorConfig.customization.showVerticalScroll!==undefined && this.editorConfig.customization.showVerticalScroll!==null)
                            docInfo.asc_putShowVerticalScroll(this.editorConfig.customization.showVerticalScroll);
                        if (this.editorConfig.customization.showHorizontalScroll!==undefined && this.editorConfig.customization.showHorizontalScroll!==null)
                            docInfo.asc_putShowHorizontalScroll(this.editorConfig.customization.showHorizontalScroll);
                    }

                    var coEditMode = !(this.editorConfig.coEditing && typeof this.editorConfig.coEditing == 'object') ? 'fast' : // fast by default
                            this.editorConfig.mode === 'view' && this.editorConfig.coEditing.change!==false ? 'fast' : // if can change mode in viewer - set fast for using live viewer
                            this.editorConfig.coEditing.mode || 'fast';
                    docInfo.put_CoEditingMode(coEditMode);
                    this.api.asc_refreshFile(docInfo);
                }
            },

            onSaveDocumentBinary: function(data) {
                Common.Gateway.saveDocument(data);
            },

            loadBinary: function(data) {
                data && this.api.asc_openDocumentFromBytes(new Uint8Array(data));
            },

            errorLang: 'The interface language is not loaded.<br>Please contact your Document Server administrator.'
        }
    })(), SSE.Controllers.Main || {}))
});
