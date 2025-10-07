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
 *  Main.js
 *
 *  Main controller
 *
 *  Created on 1/15/14
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
    'common/main/lib/util/LocalStorage',
    'documenteditor/main/app/collection/ShapeGroups',
    'documenteditor/main/app/collection/EquationGroups',
    'common/main/lib/controller/FocusManager',
    'common/main/lib/controller/HintManager',
    'common/main/lib/controller/LayoutManager',
    'common/main/lib/controller/ExternalUsers',
    'common/main/lib/controller/LaunchController',
    'common/main/lib/view/OpenDialog',
    'common/main/lib/view/UserNameDialog',
], function () {
    'use strict';

    DE.Controllers.Main = Backbone.Controller.extend(_.extend((function() {
        var appHeader;
        var ApplyEditRights = Common.UI.blockOperations.ApplyEditRights;
        var LoadingDocument = Common.UI.blockOperations.LoadingDocument;

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

        Common.localStorage.setId('text');
        Common.localStorage.setKeysFilter('de-,asc.text');
        Common.localStorage.sync();

        return {

            models: [],
            collections: [
                'ShapeGroups',
                'EquationGroups',
                'Common.Collections.HistoryUsers',
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

                var me = this,
                    styleNames = ['Normal', 'No Spacing', 'Heading 1', 'Heading 2', 'Heading 3', 'Heading 4', 'Heading 5',
                                  'Heading 6', 'Heading 7', 'Heading 8', 'Heading 9', 'Title', 'Subtitle', 'Quote', 'Intense Quote', 'List Paragraph', 'footnote text',
                                  'Caption', 'endnote text', 'Default Paragraph Font', 'No List', 'Intense Emphasis', 'Intense Reference',  'Subtle Emphasis', 'Emphasis',
                                  'Strong', 'Subtle Reference', 'Book Title',  'footnote reference', 'endnote reference'],
                    schemeNames = ['Aspect', 'Blue Green', 'Blue II', 'Blue Warm', 'Blue', 'Grayscale', 'Green Yellow', 'Green', 'Marquee', 'Median', 'Office 2007 - 2010', 'Office 2013 - 2022', 'Office',
                                   'Orange Red', 'Orange', 'Paper', 'Red Orange', 'Red Violet', 'Red', 'Slipstream', 'Violet II', 'Violet', 'Yellow Orange', 'Yellow'],
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
                    "TOC Heading": this.txtTOCHeading,
                    "Anyone": this.textAnyone,
                    "Text": this.textText,
                    "Signature": this.textSignature
                };
                styleNames.forEach(function(item){
                    translate[item] = me['txtStyle_' + item.replace(/ /g, '_')] || item;
                });
                schemeNames.forEach(function(item){
                    translate[item] = me['txtScheme_' + item.replace(/[ -]/g, '_')] || item;
                });
                me.translationTable = translate;
            },

            onLaunch: function() {
                var me = this;

                this.stackLongActions = new Common.IrregularStack({
                    strongCompare   : function(obj1, obj2){return obj1.id === obj2.id && obj1.type === obj2.type;},
                    weakCompare     : function(obj1, obj2){return obj1.type === obj2.type;}
                });

                this.stackDisableActions = new Common.IrregularStack({
                    strongCompare   : function(obj1, obj2){return obj1.type === obj2.type;},
                    weakCompare     : function(obj1, obj2){return obj1.type === obj2.type;}
                });

                this.stackMacrosRequests = [];

                this._state = {isDisconnected: false, usersCount: 1, fastCoauth: true, lostEditingRights: false, licenseType: false, isDocModified: false, requireUserAction: true};
                this.languages = null;

                // Initialize viewport

                if (!Common.Utils.isBrowserSupported()){
                    Common.Utils.showBrowserRestriction();
                    Common.Gateway.reportError(undefined, this.unsupportedBrowserErrorText);
                    return;
                }

                // Initialize api
                window["flat_desine"] = true;
                this.api = this.getApplication().getController('Viewport').getApi();

                Common.UI.FocusManager.init();
                Common.UI.HintManager.init(this.api);
                Common.UI.Themes.init(this.api);
                Common.Controllers.LaunchController.init(this.api);

                if (this.api){
                    this.api.SetDrawingFreeze(true);

                    var value = Common.localStorage.getBool("de-settings-cachemode", true);
                    Common.Utils.InternalSettings.set("de-settings-cachemode", value);
                    this.api.asc_setDefaultBlitMode(!!value);

                    value = Common.localStorage.getItem("de-settings-fontrender");
                    if (value === null)
                        value = '0';
                    Common.Utils.InternalSettings.set("de-settings-fontrender", value);
                    switch (value) {
                        case '0': this.api.SetFontRenderingMode(3); break;
                        case '1': this.api.SetFontRenderingMode(1); break;
                        case '2': this.api.SetFontRenderingMode(2); break;
                    }

                    value = Common.localStorage.getBool("app-settings-screen-reader");
                    Common.Utils.InternalSettings.set("app-settings-screen-reader", value);
                    this.api.setSpeechEnabled(value);

                    if ( !Common.Utils.isIE ) {
                        if ( /^https?:\/\//.test('{{HELP_CENTER_WEB_DE}}') ) {
                            const _url_obj = new URL('{{HELP_CENTER_WEB_DE}}');
                            if ( !!_url_obj.searchParams )
                                _url_obj.searchParams.set('lang', Common.Locale.getCurrentLanguage());

                            Common.Utils.InternalSettings.set("url-help-center", _url_obj.toString());
                        }
                    }

                    this.api.asc_registerCallback('asc_onError',                    _.bind(this.onError, this));
                    this.api.asc_registerCallback('asc_onDocumentContentReady',     _.bind(this.onDocumentContentReady, this));
                    this.api.asc_registerCallback('asc_onOpenDocumentProgress',     _.bind(this.onOpenDocument, this));
                    this.api.asc_registerCallback('asc_onDocumentUpdateVersion',    _.bind(this.onUpdateVersion, this));
                    this.api.asc_registerCallback('asc_onServerVersion',            _.bind(this.onServerVersion, this));
                    this.api.asc_registerCallback('asc_onAdvancedOptions',          _.bind(this.onAdvancedOptions, this));
                    this.api.asc_registerCallback('asc_onDocumentName',             _.bind(this.onDocumentName, this));
                    this.api.asc_registerCallback('asc_onPrintUrl',                 _.bind(this.onPrintUrl, this));
                    this.api.asc_registerCallback('asc_onMeta',                     _.bind(this.onMeta, this));
                    this.api.asc_registerCallback('asc_onSpellCheckInit',           _.bind(this.loadLanguages, this));

                    Common.NotificationCenter.on('api:disconnect',                  _.bind(this.onCoAuthoringDisconnect, this));
                    Common.NotificationCenter.on('goback',                          _.bind(this.goBack, this));
                    Common.NotificationCenter.on('suggest',                         _.bind(this.onSuggest, this));
                    Common.NotificationCenter.on('close',                           _.bind(this.closeEditor, this));
                    Common.NotificationCenter.on('markfavorite',                    _.bind(this.markFavorite, this));
                    Common.NotificationCenter.on('download:advanced',               _.bind(this.onAdvancedOptions, this));
                    Common.NotificationCenter.on('showmessage',                     _.bind(this.onExternalMessage, this));
                    Common.NotificationCenter.on('showerror',                       _.bind(this.onError, this));
                    Common.NotificationCenter.on('editing:disable',                 _.bind(this.onEditingDisable, this));
                    Common.NotificationCenter.on('doc:mode-apply',                  _.bind(this.onDocModeApply, this));

                    this.isShowOpenDialog = false;
                    
                    // Initialize api gateway
                    this.editorConfig = {};
                    this.appOptions = {};
                    Common.Gateway.on('init',           _.bind(this.loadConfig, this));
                    Common.Gateway.on('showmessage',    _.bind(this.onExternalMessage, this));
                    Common.Gateway.on('opendocument',   _.bind(this.loadDocument, this));
                    Common.Gateway.on('opendocumentfrombinary',   _.bind(this.loadBinary, this));
                    Common.Gateway.on('grabfocus',      _.bind(this.onGrabFocus, this));
                    Common.Gateway.appReady();

//                $(window.top).resize(_.bind(this.onDocumentResize, this));
                    this.getApplication().getController('Viewport').setApi(this.api);
                    this.getApplication().getController('Statusbar').setApi(this.api);

                    /** coauthoring begin **/
                    this.contComments = this.getApplication().getController('Common.Controllers.Comments');
                    /** coauthoring end **/

                        // Syncronize focus with api
                    $(document.body).on('focus', 'input, textarea', function(e) {
                        if (!/area_id/.test(e.target.id)) {
                            if (/msg-reply/.test(e.target.className)) {
                                me.dontCloseDummyComment = true;
                                me.beforeShowDummyComment = me.beforeCloseDummyComment = false;
                            } else if (/textarea-control/.test(e.target.className))
                                me.inTextareaControl = true;
                            else if (!Common.Utils.ModalWindow.isVisible() && /form-control/.test(e.target.className))
                                me.inFormControl = true;
                        }
                    });

                    $(document.body).on('blur', 'input, textarea', function(e) {
                        if (!Common.Utils.ModalWindow.isVisible()) {
                            if (/form-control/.test(e.target.className))
                                me.inFormControl = false;
                            if (me.getApplication().getController('LeftMenu').getView('LeftMenu').getMenu('file').isVisible())
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
                                if (me.dontCloseDummyComment && /msg-reply/.test(e.target.className)) {
                                    if ($(e.target).closest('.user-comment-item').find(e.relatedTarget).length<1) /* Check if focus goes to buttons in the comment window */
                                        me.dontCloseDummyComment = me.beforeCloseDummyComment = false;
                                    else
                                        me.beforeCloseDummyComment = true;
                                }
                                else if (/textarea-control/.test(e.target.className))
                                    me.inTextareaControl = false;
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
                                target.closest('.input-field').length>0 || target.closest('.spinner').length>0 || target.closest('.textarea-field').length>0 ||
                                target.closest('.ribtab').length>0 || target.closest('.combo-dataview').length>0) {
                                event.preventDefault();
                            }
                        }
                    }).on('mouseup', function(e){
                        me.beforeCloseDummyComment && setTimeout(function(){ // textbox in dummy comment lost focus
                            me.dontCloseDummyComment = me.beforeCloseDummyComment = false;
                        }, 10);
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
                        'settings:unitschanged':_.bind(this.unitsChanged, this),
                        'dataview:focus': function(e){
                        },
                        'dataview:blur': function(e){
                            if (!Common.Utils.ModalWindow.isVisible()) {
                                me.api.asc_enableKeyEvents(true);
                            }
                        },
                        'menu:show': function(e){
                        },
                        'menu:hide': function(e, isFromInputControl){
                            if (!Common.Utils.ModalWindow.isVisible() && !isFromInputControl)
                                me.api.asc_enableKeyEvents(true);
                        },
                        'edit:complete': _.bind(me.onEditComplete, me)
                    });

                    this.initNames(); //for shapes

                    Common.util.Shortcuts.delegateShortcuts({
                        shortcuts: {
                            'command+s,ctrl+s,command+p,ctrl+p,command+k,ctrl+k,command+d,ctrl+d': _.bind(function (e) {
                                e.preventDefault();
                                e.stopPropagation();
                            }, this)
                        }
                    });
                }

                me.defaultTitleText = '{{APP_TITLE_TEXT}}';
                me.warnNoLicense  = (me.warnNoLicense || '').replace(/%1/g, '{{COMPANY_NAME}}');
                me.warnNoLicenseUsers = (me.warnNoLicenseUsers || '').replace(/%1/g, '{{COMPANY_NAME}}');
                me.textNoLicenseTitle = (me.textNoLicenseTitle || '').replace(/%1/g, '{{COMPANY_NAME}}');
            },

            loadConfig: function(data) {
                this.editorConfig = $.extend(this.editorConfig, data.config);

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
                if( Common.Controllers.Desktop.isActive() ) {
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
                this.appOptions.sharingSettingsUrl = this.editorConfig.sharingSettingsUrl;
                this.appOptions.fileChoiceUrl   = this.editorConfig.fileChoiceUrl;
                this.appOptions.mergeFolderUrl  = this.editorConfig.mergeFolderUrl;
                this.appOptions.saveAsUrl       = this.editorConfig.saveAsUrl;
                this.appOptions.canAnalytics    = false;
                this.appOptions.canPlugins      = false;
                this.appOptions.canMakeActionLink = this.editorConfig.canMakeActionLink;
                this.appOptions.canRequestUsers = this.editorConfig.canRequestUsers;
                this.appOptions.canRequestSendNotify = this.editorConfig.canRequestSendNotify;
                this.appOptions.canRequestSaveAs = this.editorConfig.canRequestSaveAs;
                this.appOptions.canRequestInsertImage = this.editorConfig.canRequestInsertImage;
                this.appOptions.canRequestCompareFile = this.editorConfig.canRequestCompareFile;
                this.appOptions.canRequestMailMergeRecipients = this.editorConfig.canRequestMailMergeRecipients;
                this.appOptions.canRequestSharingSettings = this.editorConfig.canRequestSharingSettings;
                this.appOptions.canRequestSelectDocument = this.editorConfig.canRequestSelectDocument;
                this.appOptions.canRequestSelectSpreadsheet = this.editorConfig.canRequestSelectSpreadsheet;
                this.appOptions.canRequestReferenceData = this.editorConfig.canRequestReferenceData;
                this.appOptions.canRequestOpen = this.editorConfig.canRequestOpen;
                this.appOptions.canRequestReferenceSource = this.editorConfig.canRequestReferenceSource;
                this.appOptions.compatibleFeatures = (typeof (this.appOptions.customization) == 'object') && !!this.appOptions.customization.compatibleFeatures;
                this.appOptions.canFeatureComparison = true;
                this.appOptions.canFeatureContentControl = true;
                this.appOptions.canFeatureForms = !!this.api.asc_isSupportFeature("forms");
                this.appOptions.isPDFForm = !!window.isPDFForm;
                this.appOptions.disableNetworkFunctionality = !!(window["AscDesktopEditor"] && window["AscDesktopEditor"]["isSupportNetworkFunctionality"] && false === window["AscDesktopEditor"]["isSupportNetworkFunctionality"]());
                this.appOptions.mentionShare = !((typeof (this.appOptions.customization) == 'object') && (this.appOptions.customization.mentionShare==false));
                this.appOptions.canSaveDocumentToBinary = this.editorConfig.canSaveDocumentToBinary;
                this.appOptions.user.guest && this.appOptions.canRenameAnonymous && Common.NotificationCenter.on('user:rename', _.bind(this.showRenameUserDialog, this));
                this.appOptions.canRequestFillingStatus = this.editorConfig.canRequestFillingStatus;

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
                    if (this.appOptions.customization.close && typeof this.appOptions.customization.close === 'object') // if close=null - no close button
                        this.appOptions.canCloseEditor  = (this.appOptions.customization.close.visible!==false) && this.appOptions.canRequestClose && !this.appOptions.isDesktopApp;
                }
                this.appOptions.canBack = this.appOptions.canBackToFolder = !!_canback;

                appHeader = this.getApplication().getController('Viewport').getView('Common.Views.Header');
                appHeader.setCanBack(this.appOptions.canBack, this.appOptions.canBack ? this.appOptions.customization.goback.text : '');

                if (this.editorConfig.lang)
                    this.api.asc_setLocale(this.editorConfig.lang);
                Common.Utils.InternalSettings.set("de-config-lang", this.editorConfig.lang ? parseInt(Common.util.LanguageInfo.getLocalLanguageCode(this.editorConfig.lang)) : 0x0409);

                this.loadDefaultMetricSettings();

                value = Common.localStorage.getItem("de-macros-mode");
                if (value === null) {
                    value = this.editorConfig.customization ? this.editorConfig.customization.macrosMode : 'warn';
                    value = (value == 'enable') ? 1 : (value == 'disable' ? 2 : 0);
                } else
                    value = parseInt(value);
                Common.Utils.InternalSettings.set("de-macros-mode", value);

                value = Common.localStorage.getItem("de-allow-macros-request");
                Common.Utils.InternalSettings.set("de-allow-macros-request", (value !== null) ? parseInt(value)  : 0);

                this.appOptions.wopi = this.editorConfig.wopi;
                appHeader.setWopi(this.appOptions.wopi);

                if (this.editorConfig.canRequestRefreshFile) {
                    Common.Gateway.on('refreshfile',                         _.bind(this.onRefreshFile, this));
                    this.api.asc_registerCallback('asc_onRequestRefreshFile',       _.bind(this.onRequestRefreshFile, this));
                }

                Common.Controllers.Desktop.init(this.appOptions);
                Common.UI.HintManager.setMode(this.appOptions);
            },

            loadDocument: function(data) {
                this.permissions = {};
                this.document = data.doc;

                var docInfo = {};

                if (data.doc) {
                    this.permissions = $.extend(this.permissions, data.doc.permissions);

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
                    docInfo.put_SupportsOnSaveDocument(this.editorConfig.canSaveDocumentToBinary);
                    docInfo.put_Wopi(this.editorConfig.wopi);
                    this.editorConfig.shardkey && docInfo.put_Shardkey(this.editorConfig.shardkey);

                    var enable = !this.editorConfig.customization || (this.editorConfig.customization.macros!==false);
                    docInfo.asc_putIsEnabledMacroses(!!enable);
                    enable = !this.editorConfig.customization || (this.editorConfig.customization.plugins!==false);
                    docInfo.asc_putIsEnabledPlugins(!!enable);
//                    docInfo.put_Review(this.permissions.review);

                    var type = /^(?:(pdf|djvu|xps|oxps))$/.exec(data.doc.fileType);
                    var coEditMode = (type && typeof type[1] === 'string' && !this.appOptions.isPDFForm) ? 'strict' :  // offline viewer for pdf|djvu|xps|oxps
                                    !(this.editorConfig.coEditing && typeof this.editorConfig.coEditing == 'object') ? 'fast' : // fast by default
                                    this.editorConfig.mode === 'view' && this.editorConfig.coEditing.change!==false ? 'fast' : // if can change mode in viewer - set fast for using live viewer
                                    this.editorConfig.coEditing.mode || 'fast';
                    docInfo.put_CoEditingMode(coEditMode);

                    if (type && typeof type[1] === 'string' && !this.appOptions.isPDFForm) {
                        this.permissions.edit = this.permissions.review = false;
                    }
                }

                if (!( this.editorConfig.customization && ( this.editorConfig.customization.toolbarNoTabs ||
                    (this.editorConfig.targetApp!=='desktop') && (this.editorConfig.customization.loaderName || this.editorConfig.customization.loaderLogo)))) {
                    $('#editor-container').css('overflow', 'hidden');
                    $('#editor-container').append('<div class="doc-placeholder">' + '<div class="line"></div>'.repeat(22) + '</div>');
                    if (this.editorConfig.mode == 'view' || (this.permissions.edit === false && !this.permissions.review ))
                        $('#editor-container').find('.doc-placeholder').css('margin-top', 19);
                }

                var type = data.doc ? /^(?:(docxf|oform)|(pdf))$/.exec(data.doc.fileType) : false;
                this.appOptions.isFormCreator = !!(type && (typeof type[1] === 'string' || typeof type[2] === 'string' && this.appOptions.isPDFForm)) && this.appOptions.canFeatureForms; // show forms only for docxf or oform
                this.appOptions.isOForm = !!(type && typeof type[1] === 'string'); // oform and docxf

                this.api.asc_registerCallback('asc_onGetEditorPermissions', _.bind(this.onEditorPermissions, this));
                this.api.asc_registerCallback('asc_onLicenseChanged',       _.bind(this.onLicenseChanged, this));
                this.api.asc_registerCallback('asc_onMacrosPermissionRequest', _.bind(this.onMacrosPermissionRequest, this));
                this.api.asc_registerCallback('asc_onRunAutostartMacroses', _.bind(this.onRunAutostartMacroses, this));
                this.api.asc_setDocInfo(docInfo);
                this.api.asc_getEditorPermissions(this.editorConfig.licenseUrl, this.editorConfig.customerId);

                if (data.doc) {
                    appHeader.setDocumentCaption(data.doc.title);
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
                    !old_rights && Common.UI.TooltipManager.showTip({ step: 'changeRights', text: _.isEmpty(data.message) ? this.warnProcessRightsChange : data.message,
                        target: '#toolbar', maxwidth: 600, showButton: false, automove: true, noHighlight: true, noArrow: true, multiple: true,
                        callback: function() {
                            me._state.lostEditingRights = false;
                        }});
                }
            },

            onDownloadAs: function(format) {
                if ( !this.appOptions.canDownload && !this.appOptions.canDownloadOrigin) {
                    Common.Gateway.reportError(Asc.c_oAscError.ID.AccessDeny, this.errorAccessDeny);
                    return;
                }

                this._state.isFromGatewayDownloadAs = true;
                var _format = (format && (typeof format == 'string')) ? Asc.c_oAscFileType[ format.toUpperCase() ] : null,
                    _defaultFormat = null,
                    textParams,
                    _supported = [
                        Asc.c_oAscFileType.TXT,
                        Asc.c_oAscFileType.RTF,
                        Asc.c_oAscFileType.ODT,
                        Asc.c_oAscFileType.DOCX,
                        Asc.c_oAscFileType.HTML,
                        Asc.c_oAscFileType.DOTX,
                        Asc.c_oAscFileType.OTT,
                        Asc.c_oAscFileType.FB2,
                        Asc.c_oAscFileType.EPUB,
                        Asc.c_oAscFileType.DOCM,
                        Asc.c_oAscFileType.JPG,
                        Asc.c_oAscFileType.PNG
                    ];
                var type = /^(?:(pdf|djvu|xps|oxps))$/.exec(this.document.fileType);
                if (type && typeof type[1] === 'string' && !this.appOptions.isPDFForm) {
                    if (!(format && (typeof format == 'string')) || type[1]===format.toLowerCase()) {
                        var options = new Asc.asc_CDownloadOptions();
                        options.asc_setIsDownloadEvent(true);
                        options.asc_setIsSaveAs(true);
                        this.api.asc_DownloadOrigin(options);
                        return;
                    }
                    if (/^xps|oxps$/.test(this.document.fileType))
                        _supported = _supported.concat([Asc.c_oAscFileType.PDF, Asc.c_oAscFileType.PDFA]);
                    else if (/^djvu$/.test(this.document.fileType)) {
                        _supported = [Asc.c_oAscFileType.PDF];
                    }
                    textParams = new AscCommon.asc_CTextParams(Asc.c_oAscTextAssociation.PlainLine);
                } else {
                    _supported = _supported.concat([Asc.c_oAscFileType.PDF, Asc.c_oAscFileType.PDFA]);
                    _defaultFormat = Asc.c_oAscFileType.DOCX;
                }
                if (this.appOptions.canFeatureForms && !/^djvu$/.test(this.document.fileType)) {
                    _supported = _supported.concat([Asc.c_oAscFileType.DOCXF]);
                }
                if ( !_format || _supported.indexOf(_format) < 0 )
                    _format = _defaultFormat;
                var options = new Asc.asc_CDownloadOptions(_format, true);
                options.asc_setIsSaveAs(true);
                if (_format) {
                    textParams && options.asc_setTextParams(textParams);
                    this.api.asc_DownloadAs(options);
                } else {
                    this.api.asc_DownloadOrigin(options);
                }
            },

            onProcessMouse: function(data) {
                if (data.type == 'mouseup') {
                    var e = document.getElementById('editor_sdk');
                    if (e) {
                        var r = Common.Utils.getBoundingClientRect(e);
                        this.api.OnMouseUp(
                            data.x - r.left,
                            data.y - r.top
                        );
                    }
                }
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
                    appHeader.setCanRename(false);
                    appHeader.getButton('users') && appHeader.getButton('users').hide();
                    appHeader.getButton('share') && appHeader.getButton('share').setVisible(false);
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
                                        username    : version.user.name || this.textAnonymous,
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
                                    username : version.user.name || this.textAnonymous,
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
                                    fileType: 'docx',
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
                                                    username    : change.user.name || this.textAnonymous,
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
                                                username : change.user.name || this.textAnonymous,
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
                                                fileType: 'docx',
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

            generateUserColor: function(color) {
              return"#"+("000000"+color.toString(16)).substr(-6);
            },

            disableEditing: function(disable, type) {
                !type && (type = 'disconnect');
                var temp = type==='reconnect' || type==='refresh-file';
                Common.NotificationCenter.trigger('editing:disable', disable, {
                    viewMode: disable,
                    reviewMode: false,
                    fillFormMode: false,
                    viewDocMode: false,
                    allowMerge: false,
                    allowSignature: false,
                    allowProtect: false,
                    rightMenu: {clear: !temp, disable: true},
                    statusBar: true,
                    leftMenu: {disable: true, previewMode: true},
                    fileMenu: {protect: true, history: temp},
                    navigation: {disable: !temp, previewMode: true},
                    comments: {disable: !temp, previewMode: true},
                    chat: true,
                    review: true,
                    viewport: true,
                    documentHolder: {clear: !temp, disable: true},
                    toolbar: true,
                    plugins: false,
                    protect: false,
                    header: {docmode: true, search: type==='not-loaded', startfill: false},
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
                    options.rightMenu.disable && app.getController('RightMenu').SetDisabled(disable, options.allowMerge, options.allowSignature);
                }
                if (options.statusBar) {
                    app.getController('Statusbar').getView('Statusbar').SetDisabled(disable);
                }
                if (options.review) {
                    app.getController('Common.Controllers.ReviewChanges').SetDisabled(disable, options.reviewMode, options.fillFormMode);
                }
                if (options.viewport) {
                    app.getController('Viewport').SetDisabled(disable);
                }
                if (options.toolbar) {
                    app.getController('Toolbar').DisableToolbar(disable, options.viewMode, options.reviewMode, options.fillFormMode, options.viewDocMode);
                }
                if (options.documentHolder) {
                    options.documentHolder.clear && app.getController('DocumentHolder').clearSelection();
                    options.documentHolder.disable && app.getController('DocumentHolder').SetDisabled(disable, options.allowProtect, options.fillFormMode);
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
                if (options.navigation && options.navigation.previewMode) {
                    app.getController('Navigation') && app.getController('Navigation').SetDisabled(disable);
                }
                if (options.plugins) {
                    app.getController('Common.Controllers.Plugins').getView('Common.Views.Plugins').SetDisabled(disable, options.reviewMode, options.fillFormMode);
                }
                if (options.protect) {
                    app.getController('Common.Controllers.Protection').SetDisabled(disable, false);
                }

                if (options.shortcuts) {
                    disable ? Common.util.Shortcuts.suspendEvents() : Common.util.Shortcuts.resumeEvents();
                }

                if (options.header) {
                    if (options.header.docmode)
                        app.getController('Toolbar').getView('Toolbar').fireEvent('docmode:disabled', [disable]);
                    if (options.header.search)
                        appHeader && appHeader.lockHeaderBtns('search', disable);
                    if (options.header.startfill)
                        appHeader && appHeader.lockHeaderBtns('startfill', disable);
                    appHeader && appHeader.lockHeaderBtns('undo', options.viewMode, Common.enumLock.lostConnect);
                    appHeader && appHeader.lockHeaderBtns('redo', options.viewMode, Common.enumLock.lostConnect);
                }

                if (prev_options) {
                    this.onEditingDisable(prev_options.disable, prev_options.options, prev_options.type);
                }
            },

            disableLiveViewing: function(disable) {
                this.appOptions.canLiveView = !disable;
                this.api.asc_SetFastCollaborative(!disable);
                Common.Utils.InternalSettings.set("de-settings-coauthmode", !disable);
            },

            onRequestClose: function() {
                var me = this;
                if (this.api.isDocumentModified()) {
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
                if ( !Common.Controllers.Desktop.process('goback') ) {
                    if (this.appOptions.customization.goback.requestClose && this.appOptions.canRequestClose) {
                        this.onRequestClose();
                    } else {
                        var href = this.appOptions.customization.goback.url;
                        if (!current && this.appOptions.customization.goback.blank!==false) {
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
                this.appOptions.canFavorite && appHeader.setFavorite(!!favorite);
            },

            onEditComplete: function(cmp) {
//                this.getMainMenu().closeFullScaleMenu();
                var application = this.getApplication(),
                    toolbarController = application.getController('Toolbar'),
                    toolbarView = toolbarController.getView(),
                    rightMenu = application.getController('RightMenu').getView('RightMenu');

                if (this.appOptions.isEdit && toolbarView && (toolbarView.btnInsertShape.pressed || toolbarView.btnInsertText.pressed) &&
                    ( !_.isObject(arguments[1]) || arguments[1].id !== 'tlbtn-insertshape')) { // TODO: Event from api is needed to clear btnInsertShape state
                    if (this.api)
                        this.api.StartAddShape('', false);

                    toolbarView.btnInsertShape.toggle(false, false);
                    toolbarView.btnInsertText.toggle(false, false);
                }
                if (this.appOptions.isEdit && toolbarView && toolbarView.btnHighlightColor.pressed &&
                    ( !_.isObject(arguments[1]) || arguments[1].id !== 'id-toolbar-btn-highlight')) {
                    this.api.SetMarkerFormat(false);
                    toolbarView.btnHighlightColor.toggle(false, false);
                }
                if (this.appOptions.isEdit && (toolbarView && toolbarView._isEyedropperStart || rightMenu && rightMenu._isEyedropperStart)) {
                    toolbarView._isEyedropperStart ? toolbarView._isEyedropperStart = false : rightMenu._isEyedropperStart = false;
                    this.api.asc_cancelEyedropper();
                }
                application.getController('DocumentHolder').getView().focus();

                if (this.api && this.appOptions.isEdit) {
                    this.disableSaveButton(this.api.asc_isDocumentCanSave());
                }

                Common.UI.HintManager.clearHints(true);
            },

            disableSaveButton: function (isCanSave) {
                var toolbarView = this.getApplication().getController('Toolbar').getView();
                if (!toolbarView || toolbarView._state.previewmode || !toolbarView.btnSave || !this.api) return;

                var forcesave = this.appOptions.forcesave || this.appOptions.canSaveDocumentToBinary || !this.appOptions.canSaveToFile,
                    isSyncButton = (toolbarView.btnCollabChanges && toolbarView.btnCollabChanges.rendered) ? toolbarView.btnCollabChanges.cmpEl.hasClass('notify') : false,
                    isDisabled = !isCanSave && !isSyncButton && !forcesave || this._state.isDisconnected || this._state.fastCoauth && this._state.usersCount>1 && !forcesave || !this.appOptions.showSaveButton;
                toolbarView.lockToolbar(Common.enumLock.cantSave, isDisabled, {array: [toolbarView.btnSave]});
            },

            onLongActionBegin: function(type, id) {
                var action = {id: id, type: type};
                this.stackLongActions.push(action);
                this.setLongActionView(action);
            },

            onLongActionEnd: function(type, id) {
                var action = {id: id, type: type};
                this.stackLongActions.pop(action);

                appHeader && appHeader.setDocumentCaption(this.api.asc_getDocumentName());
                this.updateWindowTitle(true);

                action = this.stackLongActions.get({type: Asc.c_oAscAsyncActionType.Information});
                if (action) {
                    this.setLongActionView(action)
                } else {
                    var me = this;
                    if ((id==Asc.c_oAscAsyncAction['Save'] || id==Asc.c_oAscAsyncAction['ForceSaveButton']) && !this.appOptions.isOffline) {
                        if (this._state.fastCoauth && this._state.usersCount>1) {
                            me._state.timerSave = setTimeout(function () {
                                me.getApplication().getController('Statusbar').setStatusCaption(me.textChangesSaved, false, 3000);
                            }, 500);
                        } else
                            me.getApplication().getController('Statusbar').setStatusCaption(me.textChangesSaved, false, 3000);
                    } else
                        this.getApplication().getController('Statusbar').setStatusCaption('');
                }

                action = this.stackLongActions.get({type: Asc.c_oAscAsyncActionType.BlockInteraction});
                action ? this.setLongActionView(action) : this.loadMask && this.loadMask.hide();

                if (this.appOptions.isEdit && (id==Asc.c_oAscAsyncAction['Save'] || id==Asc.c_oAscAsyncAction['ForceSaveButton']) && (!this._state.fastCoauth || this._state.usersCount<2 ||
                    this.getApplication().getController('Common.Controllers.ReviewChanges').isPreviewChangesMode()))
                    this.synchronizeChanges();
                else if (this.appOptions.isEdit && (id==Asc.c_oAscAsyncAction['Save'] || id==Asc.c_oAscAsyncAction['ForceSaveButton'] || id == Asc.c_oAscAsyncAction['ApplyChanges']) &&
                        this._state.fastCoauth)
                    this.getApplication().getController('Common.Controllers.ReviewChanges').synchronizeChanges();

                if ( id == Asc.c_oAscAsyncAction['Open']) {
                    Common.Utils.InternalSettings.get("de-settings-livecomment") ? this.api.asc_showComments(Common.Utils.InternalSettings.get("de-settings-resolvedcomment")) : this.api.asc_hideComments();
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

                if ( type == Asc.c_oAscAsyncActionType.BlockInteraction &&
                    (!this.getApplication().getController('LeftMenu').dlgSearch || !this.getApplication().getController('LeftMenu').dlgSearch.isVisible()) &&
                    (!this.getApplication().getController('Toolbar').dlgSymbolTable || !this.getApplication().getController('Toolbar').dlgSymbolTable.isVisible()) &&
                    !((id == Asc.c_oAscAsyncAction['LoadDocumentFonts'] || id == Asc.c_oAscAsyncAction['LoadFonts'] || id == Asc.c_oAscAsyncAction['ApplyChanges'] || id == Asc.c_oAscAsyncAction['DownloadAs'] || id == Asc.c_oAscAsyncAction['LoadImage'] || id == Asc.c_oAscAsyncAction['UploadImage']) &&
                      (this.dontCloseDummyComment || this.inTextareaControl || Common.Utils.ModalWindow.isVisible() || this.inFormControl)) ) {
//                        this.onEditComplete(this.loadMask); //если делать фокус, то при принятии чужих изменений, заканчивается свой композитный ввод
                        this.api.asc_enableKeyEvents(true);
                }
            },

            setLongActionView: function(action) {
                var title = '', text = '', force = false;
                var statusCallback = null; // call after showing status

                switch (action.id) {
                    case Asc.c_oAscAsyncAction['Open']:
                        title   = this.openTitleText;
                        text    = this.openTextText;
                        break;

                    case Asc.c_oAscAsyncAction['Save']:
                    case Asc.c_oAscAsyncAction['ForceSaveButton']:
                        clearTimeout(this._state.timerSave);
                        force = true;
                        title   = this.saveTitleText;
                        text    = (!this.appOptions.isOffline) ? this.saveTextText : '';
                        break;

                    case Asc.c_oAscAsyncAction['LoadDocumentFonts']:
                        title   = this.loadFontsTitleText;
                        text    = this.loadFontsTextText;
                        break;

                    case Asc.c_oAscAsyncAction['LoadDocumentImages']:
                        title   = this.loadImagesTitleText;
                        text    = this.loadImagesTextText;
                        break;

                    case Asc.c_oAscAsyncAction['LoadFont']:
                        title   = this.loadFontTitleText;
                        text    = this.loadFontTextText;
                        break;

                    case Asc.c_oAscAsyncAction['LoadImage']:
                        title   = this.loadImageTitleText;
                        text    = this.loadImageTextText;
                        break;

                    case Asc.c_oAscAsyncAction['DownloadAs']:
                        title   = this.downloadTitleText;
                        text    = this.downloadTextText;
                        break;

                    case Asc.c_oAscAsyncAction['Print']:
                        title   = this.printTitleText;
                        text    = this.printTextText;
                        break;

                    case Asc.c_oAscAsyncAction['UploadImage']:
                        title   = this.uploadImageTitleText;
                        text    = this.uploadImageTextText;
                        break;

                    case Asc.c_oAscAsyncAction['ApplyChanges']:
                        title   = this.applyChangesTitleText;
                        text    = this.applyChangesTextText;
                        break;

                    case Asc.c_oAscAsyncAction['MailMergeLoadFile']:
                        title   = this.mailMergeLoadFileText;
                        text    = this.mailMergeLoadFileTitle;
                        break;

                    case Asc.c_oAscAsyncAction['DownloadMerge']:
                        title   = this.downloadMergeTitle;
                        text    = this.downloadMergeText;
                        break;

                    case Asc.c_oAscAsyncAction['SendMailMerge']:
                        title   = this.sendMergeTitle;
                        text    = this.sendMergeText;
                        break;

                    case Asc.c_oAscAsyncAction['Waiting']:
                        title   = this.waitText;
                        text    = this.waitText;
                        break;

                    case ApplyEditRights:
                        title   = this.txtEditingMode;
                        text    = this.txtEditingMode;
                        break;

                    case LoadingDocument:
                        title   = this.loadingDocumentTitleText + '           ';
                        text    = this.loadingDocumentTextText;
                        break;

                    case Asc.c_oAscAsyncAction['Disconnect']:
                        text    = this.textDisconnect;
                        Common.UI.Menu.Manager.hideAll();
                        this.disableEditing(true, 'reconnect');
                        var me = this;
                        me._state.timerDisconnect = setTimeout(function(){
                            Common.UI.TooltipManager.showTip('disconnect');
                        }, me._state.unloadTimer || 0);
                        this.getApplication().getController('Statusbar').setStatusCaption(text);
                        return;

                    case Common.UI.blockOperations.UpdateChart:
                        title   = this.updateChartText;
                        text    = this.updateChartText;
                        break;

                    case Asc.c_oAscAsyncAction['RefreshFile']:
                        title    = this.textUpdating;
                        text    = this.textUpdating;
                        Common.UI.Menu.Manager.hideAll();
                        this.disableEditing(true, 'refresh-file');
                        Common.UI.TooltipManager.showTip('refreshFile');
                        this.getApplication().getController('Statusbar').setStatusCaption(text);
                        return;

                    case Asc.c_oAscAsyncAction['Submit']:
                        title   = this.savingText;
                        text    = this.savingText;
                        break;

                    default:
                        if (typeof action.id == 'string'){
                            title   = action.id;
                            text    = action.id;
                        }
                        break;
                }

                if (action.type == Asc.c_oAscAsyncActionType['BlockInteraction']) {
                    if (!this.loadMask)
                        this.loadMask = new Common.UI.LoadMask({owner: $('#viewport')});

                    this.loadMask.setTitle(title);

                    if (!this.isShowOpenDialog)
                        this.loadMask.show(action.id===Asc.c_oAscAsyncAction['Open']);
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

                if (this._state.openDlg)
                    this._state.openDlg.close();

                var me = this,
                    value;

                me._isDocReady = true;
                Common.NotificationCenter.trigger('app:ready', this.appOptions);

                me.api.SetDrawingFreeze(false);
                me.hidePreloader();
                me.onLongActionEnd(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);

                Common.Utils.InternalSettings.set("de-settings-datetime-default", Common.localStorage.getItem("de-settings-datetime-default"));

                /** coauthoring begin **/
                this.isLiveCommenting = Common.localStorage.getBool("de-settings-livecomment", true);
                Common.Utils.InternalSettings.set("de-settings-livecomment", this.isLiveCommenting);
                value = Common.localStorage.getBool("de-settings-resolvedcomment");
                Common.Utils.InternalSettings.set("de-settings-resolvedcomment", value);
                this.isLiveCommenting ? this.api.asc_showComments(value) : this.api.asc_hideComments();
                /** coauthoring end **/

                value = Common.localStorage.getItem("de-settings-zoom");
                Common.Utils.InternalSettings.set("de-settings-zoom", value);
                var zf = (value!==null) ? parseInt(value) : (this.appOptions.customization && this.appOptions.customization.zoom ? parseInt(this.appOptions.customization.zoom) : 100);
                value = Common.localStorage.getItem("de-last-zoom");
                var lastZoom = (value!==null) ? parseInt(value):0;

                if (zf == -1) {
                    this.api.zoomFitToPage();
                } else if (zf == -2) {
                    this.api.zoomFitToWidth();
                } else if (zf == -3) {
                    if (lastZoom > 0) {
                        this.api.zoom(lastZoom);
                    } else if (lastZoom == -1) {
                        this.api.zoomFitToPage();
                    } else if (lastZoom == -2) {
                        this.api.zoomFitToWidth();
                    }
                } else {
                    this.api.zoom(zf > 0 ? zf : 100);
                }

                value = Common.localStorage.getItem("de-show-hiddenchars");
                me.api.put_ShowParaMarks((value!==null) ? eval(value) : false);

                value = Common.localStorage.getItem("de-show-tableline");
                me.api.put_ShowTableEmptyLine((value!==null) ? eval(value) : true);

                // spellcheck
                value = Common.UI.FeaturesManager.getInitValue('spellcheck', true);
                value = (value !== undefined) ? value : !(this.appOptions.customization && this.appOptions.customization.spellcheck===false);
                if (this.appOptions.customization && this.appOptions.customization.spellcheck!==undefined)
                    console.log("Obsolete: The 'spellcheck' parameter of the 'customization' section is deprecated. Please use 'spellcheck' parameter in the 'customization.features' section instead.");
                if (Common.UI.FeaturesManager.canChange('spellcheck')) { // get from local storage
                    value = Common.localStorage.getBool("de-settings-spellcheck", value);
                    Common.Utils.InternalSettings.set("de-settings-spellcheck", value);
                }
                me.api.asc_setSpellCheck(value);
                Common.NotificationCenter.trigger('spelling:turn', value ? 'on' : 'off', true); // only toggle buttons

                if (Common.UI.FeaturesManager.canChange('spellcheck')) { // get settings for spellcheck from local storage
                    value = Common.localStorage.getBool("de-spellcheck-ignore-uppercase-words", true);
                    Common.Utils.InternalSettings.set("de-spellcheck-ignore-uppercase-words", value);
                    value = Common.localStorage.getBool("de-spellcheck-ignore-numbers-words", true);
                    Common.Utils.InternalSettings.set("de-spellcheck-ignore-numbers-words", value);
                    value = new AscCommon.CSpellCheckSettings();
                    value.put_IgnoreWordsInUppercase(Common.Utils.InternalSettings.get("de-spellcheck-ignore-uppercase-words"));
                    value.put_IgnoreWordsWithNumbers(Common.Utils.InternalSettings.get("de-spellcheck-ignore-numbers-words"));
                    this.api.asc_setSpellCheckSettings(value);
                }

                value = Common.localStorage.getBool("de-settings-compatible", false);
                Common.Utils.InternalSettings.set("de-settings-compatible", value);

                Common.Utils.InternalSettings.set("de-settings-showsnaplines", me.api.get_ShowSnapLines());

                value = Common.localStorage.getItem("de-settings-numeral");
                value = value === null ? Asc.c_oNumeralType.arabic : parseInt(value);
                Common.Utils.InternalSettings.set("de-settings-numeral", value);
                this.api.asc_setNumeralType(value);

                function checkWarns() {
                    if (!Common.Controllers.Desktop.isActive()) {
                        var tips = [];
                        Common.Utils.isIE9m && tips.push(me.warnBrowserIE9);

                        if (tips.length) me.showTips(tips);
                    }
                    document.removeEventListener('visibilitychange', checkWarns);
                }

                if (typeof document.hidden !== 'undefined' && document.hidden) {
                    document.addEventListener('visibilitychange', checkWarns);
                } else checkWarns();

                me.api.asc_registerCallback('asc_onStartAction',            _.bind(me.onLongActionBegin, me));
                me.api.asc_registerCallback('asc_onEndAction',              _.bind(me.onLongActionEnd, me));
                me.api.asc_registerCallback('asc_onCoAuthoringDisconnect',  _.bind(me.onCoAuthoringDisconnect, me));
                me.api.asc_registerCallback('asc_onDisconnectEveryone',     _.bind(me.onDisconnectEveryone, me));
                me.api.asc_registerCallback('asc_onCompletePreparingOForm',     _.bind(me.onCompletePreparingOForm, me));
                me.api.asc_registerCallback('asc_onPrint',                  _.bind(me.onPrint, me));
                me.api.asc_registerCallback('asc_onConfirmAction',          _.bind(me.onConfirmAction, me));
                Common.NotificationCenter.on('action:start',                _.bind(me.onLongActionBegin, me));
                Common.NotificationCenter.on('action:end',                  _.bind(me.onLongActionEnd, me));

                appHeader.setDocumentCaption(me.api.asc_getDocumentName());
                me.updateWindowTitle(true);

                value = Common.localStorage.getBool("de-settings-show-alt-hints", true);
                Common.Utils.InternalSettings.set("de-settings-show-alt-hints", value);

                /** coauthoring begin **/
                me._state.fastCoauth = Common.Utils.InternalSettings.get("de-settings-coauthmode");
                me.api.asc_SetFastCollaborative(me._state.fastCoauth);

                value = Common.Utils.InternalSettings.get((me._state.fastCoauth) ? "de-settings-showchanges-fast" : "de-settings-showchanges-strict");
                switch(value) {
                    case 'all': value = Asc.c_oAscCollaborativeMarksShowType.All; break;
                    case 'none': value = Asc.c_oAscCollaborativeMarksShowType.None; break;
                    case 'last': value = Asc.c_oAscCollaborativeMarksShowType.LastChanges; break;
                    default: value = (me._state.fastCoauth) ? Asc.c_oAscCollaborativeMarksShowType.None : Asc.c_oAscCollaborativeMarksShowType.LastChanges;
                }
                me.api.SetCollaborativeMarksShowType(value);
                me.api.asc_setAutoSaveGap(Common.Utils.InternalSettings.get("de-settings-autosave"));
                me.api.asc_SetPerformContentControlActionByClick(me.appOptions.isRestrictedEdit && me.appOptions.canFillForms);

                /** coauthoring end **/

                var application                 = me.getApplication();
                var toolbarController           = application.getController('Toolbar'),
                    statusbarController         = application.getController('Statusbar'),
                    documentHolderController    = application.getController('DocumentHolder'),
                    fontsController             = application.getController('Common.Controllers.Fonts'),
                    rightmenuController         = application.getController('RightMenu'),
                    leftmenuController          = application.getController('LeftMenu'),
                    chatController              = application.getController('Common.Controllers.Chat'),
                    pluginsController           = application.getController('Common.Controllers.Plugins'),
                    navigationController        = application.getController('Navigation');


                leftmenuController.getView('LeftMenu').getMenu('file').loadDocument({doc:me.document});
                leftmenuController.createDelayedElements().setApi(me.api);

                navigationController.setMode(me.appOptions).setApi(me.api);

                chatController.setApi(this.api).setMode(this.appOptions);
                application.getController('Common.Controllers.ExternalDiagramEditor').setApi(this.api).loadConfig({config:this.editorConfig, customization: this.editorConfig.customization});
                application.getController('Common.Controllers.ExternalMergeEditor').setApi(this.api).loadConfig({config:this.editorConfig, customization: this.editorConfig.customization});
                application.getController('Common.Controllers.ExternalOleEditor').setApi(this.api).loadConfig({config:this.editorConfig, customization: this.editorConfig.customization});

                pluginsController.setApi(me.api);

                documentHolderController.setApi(me.api);
                // documentHolderController.createDelayedElements();
                statusbarController.createDelayedElements();

                leftmenuController.getView('LeftMenu').disableMenu('all',false);

                if (me.appOptions.canBranding)
                    me.getApplication().getController('LeftMenu').leftMenu.getMenu('about').setLicInfo(me.editorConfig.customization);

                documentHolderController.getView().on('editcomplete', _.bind(me.onEditComplete, me));

                DE.getController('Common.Controllers.Shortcuts').setApi(me.api);
                
                if (me.appOptions.isEdit) {
                    if (me.appOptions.canForcesave) {// use asc_setIsForceSaveOnUserSave only when customization->forcesave = true
                        me.appOptions.forcesave = Common.localStorage.getBool("de-settings-forcesave", me.appOptions.canForcesave);
                        Common.Utils.InternalSettings.set("de-settings-forcesave", me.appOptions.forcesave);
                        me.api.asc_setIsForceSaveOnUserSave(me.appOptions.forcesave);
                    }

                    value = Common.localStorage.getItem("de-settings-paste-button");
                    if (value===null) value = '1';
                    Common.Utils.InternalSettings.set("de-settings-paste-button", parseInt(value));
                    me.api.asc_setVisiblePasteButton(!!parseInt(value));

                    value = Common.localStorage.getBool("de-settings-smart-selection", true);
                    Common.Utils.InternalSettings.set("de-settings-smart-selection", value);
                    me.api.asc_putSmartParagraphSelection(value);

                    me.loadAutoCorrectSettings();

                    if (me.needToUpdateVersion)
                        Common.NotificationCenter.trigger('api:disconnect');

                    me.appOptions.canStartFilling && Common.Gateway.on('startfilling', _.bind(me.onStartFilling, me));
                    window.document_content_ready = true;
                    var timer_sl = setInterval(function(){
                        if (window.document_content_ready) {
                            clearInterval(timer_sl);

                            toolbarController.createDelayedElements();
                            documentHolderController.getView().createDelayedElements();
                            me.setLanguages();

                            var shapes = me.api.asc_getPropertyEditorShapes();
                            if (shapes)
                                me.fillAutoShapes(shapes[0], shapes[1]);

                            rightmenuController.createDelayedElements();

                            me.updateThemeColors();
                            toolbarController.activateControls();
                            if (me.needToUpdateVersion)
                                toolbarController.onApiCoAuthoringDisconnect();
                            me.api.UpdateInterfaceState();

                            Common.NotificationCenter.trigger('document:ready', 'main');
                            me.applyLicense();
                        }
                    }, 50);
                } else {
                    if (me.appOptions.isRestrictedEdit && me.appOptions.canFillForms) {
                        me.api.asc_SetHighlightRequiredFields(true);
                        if (me.appOptions.isPDFForm) {
                            toolbarController.createDelayedElementsRestrictedEditForms();
                            toolbarController.activateControls();
                            me.api.UpdateInterfaceState();
                        }
                    }
                    documentHolderController.getView().createDelayedElementsViewer();
                    toolbarController.createDelayedElementsViewer();
                    Common.Utils.injectSvgIcons();
                    Common.NotificationCenter.trigger('document:ready', 'main');
                    me.applyLicense();
                }

                // TODO bug 43960
                var dummyClass = ~~(1e6*Math.random());
                $('.toolbar').prepend(Common.Utils.String.format('<div class="lazy-{0} x-huge"><div class="toolbar__icon" style="position: absolute; width: 1px; height: 1px;"></div>', dummyClass));
                setTimeout(function() { $(Common.Utils.String.format('.toolbar .lazy-{0}', dummyClass)).remove(); }, 10);

                if (this.appOptions.canAnalytics && false)
                    Common.component.Analytics.initialize('UA-12442749-13', 'Document Editor');

                Common.Gateway.on('applyeditrights',        _.bind(me.onApplyEditRights, me));
                Common.Gateway.on('processrightschange',    _.bind(me.onProcessRightsChange, me));
                Common.Gateway.on('processmouse',           _.bind(me.onProcessMouse, me));
                Common.Gateway.on('refreshhistory',         _.bind(me.onRefreshHistory, me));
                Common.Gateway.on('downloadas',             _.bind(me.onDownloadAs, me));
                Common.Gateway.on('setfavorite',            _.bind(me.onSetFavorite, me));
                Common.Gateway.on('requestclose',           _.bind(me.onRequestClose, me));
                this.appOptions.canRequestSaveAs && Common.Gateway.on('internalcommand', function(data) {
                    if (data.command == 'wopi:saveAsComplete') {
                        me.onExternalMessage({msg: me.txtSaveCopyAsComplete});
                    }
                });

                Common.Gateway.sendInfo({mode:me.appOptions.isEdit?'edit':'view'});

                $(document).on('contextmenu', _.bind(me.onContextMenu, me));
                Common.Gateway.documentReady();
                this._state.requireUserAction = false;

                $('#editor-container').css('overflow', '');
                $('.doc-placeholder').remove();

                this.appOptions.user.guest && this.appOptions.canRenameAnonymous && (Common.Utils.InternalSettings.get("guest-username")===null) && this.showRenameUserDialog();
                if (this._needToSaveAsFile) // warning received before document is ready
                    this.getApplication().getController('LeftMenu').leftMenu.showMenu('file:saveas');
            },

            onLicenseChanged: function(params) {
                var licType = params.asc_getLicenseType();
                if (licType !== undefined && (this.appOptions.canEdit || this.appOptions.isRestrictedEdit) && this.editorConfig.mode !== 'view' &&
                   (licType===Asc.c_oLicenseResult.Connections || licType===Asc.c_oLicenseResult.UsersCount || licType===Asc.c_oLicenseResult.ConnectionsOS || licType===Asc.c_oLicenseResult.UsersCountOS
                   || licType===Asc.c_oLicenseResult.SuccessLimit && (this.appOptions.trialMode & Asc.c_oLicenseMode.Limited) !== 0))
                    this._state.licenseType = licType;

                if (licType !== undefined && this.appOptions.canLiveView && (licType===Asc.c_oLicenseResult.ConnectionsLive || licType===Asc.c_oLicenseResult.ConnectionsLiveOS ||
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
                        // show warning or write to log if Common.Utils.InternalSettings.get("de-settings-coauthmode") was true ???
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
                } else if (!this.appOptions.isDesktopApp && !this.appOptions.canBrandingExt &&
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

            onOpenDocument: function(progress) {
                var elem = document.getElementById('loadmask-text');
                var proc = (progress.asc_getCurrentFont() + progress.asc_getCurrentImage())/(progress.asc_getFontsCount() + progress.asc_getImagesCount());
                proc = this.textLoadingDocument + ': ' + Common.Utils.String.fixedDigits(Math.min(Math.round(proc*100), 100), 3, "  ") + "%";
                elem ? elem.innerHTML = proc : this.loadMask && this.loadMask.setTitle(proc);
            },

            onEditorPermissions: function(params) {
                var licType = params.asc_getLicenseType();
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

                var isPDFViewer = /^(?:(pdf|djvu|xps|oxps))$/.test(this.document.fileType) && !this.appOptions.isPDFForm;

                this.permissions.review = (this.permissions.review === undefined) ? (this.permissions.edit !== false) : this.permissions.review;

                if (params.asc_getRights() !== Asc.c_oRights.Edit)
                    this.permissions.edit = this.permissions.review = false;

                this.appOptions.permissionsLicense = licType;
                this.appOptions.canAnalytics   = params.asc_getIsAnalyticsEnable();
                this.appOptions.canLicense     = (licType === Asc.c_oLicenseResult.Success || licType === Asc.c_oLicenseResult.SuccessLimit);
                this.appOptions.isLightVersion = params.asc_getIsLight();
                /** coauthoring begin **/
                this.appOptions.canCoAuthoring = !this.appOptions.isLightVersion;
                /** coauthoring end **/
                this.appOptions.isOffline      = this.api.asc_isOffline();
                this.appOptions.canCreateNew   = this.appOptions.canCreateNew && !(this.appOptions.isOffline && isPDFViewer);
                this.appOptions.isCrypted      = this.api.asc_isCrypto();
                this.appOptions.isReviewOnly   = this.permissions.review === true && this.permissions.edit === false;
                this.appOptions.canRequestEditRights = this.editorConfig.canRequestEditRights;
                this.appOptions.canEdit        = (this.permissions.edit !== false || this.permissions.review === true) && // can edit or review
                                                 (this.editorConfig.canRequestEditRights || this.editorConfig.mode !== 'view') && // if mode=="view" -> canRequestEditRights must be defined
                                                 (!this.appOptions.isReviewOnly || this.appOptions.canLicense); // if isReviewOnly==true -> canLicense must be true
                this.appOptions.isEdit         = this.appOptions.canLicense && this.appOptions.canEdit && this.editorConfig.mode !== 'view';
                this.appOptions.canReview      = this.permissions.review === true && this.appOptions.canLicense && this.appOptions.isEdit;
                this.appOptions.canViewReview  = true;
                this.appOptions.canUseHistory  = this.appOptions.canLicense && this.editorConfig.canUseHistory && this.appOptions.canCoAuthoring && !this.appOptions.isOffline;
                this.appOptions.canHistoryClose  = this.editorConfig.canHistoryClose;
                this.appOptions.canHistoryRestore= this.editorConfig.canHistoryRestore;
                this.appOptions.canUseMailMerge= this.appOptions.canLicense && this.appOptions.canEdit && !this.appOptions.isOffline;
                this.appOptions.canSendEmailAddresses  = this.appOptions.canLicense && this.editorConfig.canSendEmailAddresses && this.appOptions.canEdit && this.appOptions.canCoAuthoring;
                this.appOptions.canComments    = this.appOptions.canLicense && (this.permissions.comment===undefined ? this.appOptions.isEdit : this.permissions.comment) && (this.editorConfig.mode !== 'view');
                this.appOptions.canComments    = !isPDFViewer && this.appOptions.canComments && !((typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.comments===false);
                this.appOptions.canViewComments = this.appOptions.canComments || !isPDFViewer && !((typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.comments===false);
                this.appOptions.canChat        = this.appOptions.canLicense && !this.appOptions.isOffline && !(this.permissions.chat===false || (this.permissions.chat===undefined) &&
                                                                                                               (typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.chat===false);
                if ((typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.chat!==undefined) {
                    console.log("Obsolete: The 'chat' parameter of the 'customization' section is deprecated. Please use 'chat' parameter in the permissions instead.");
                }
                this.appOptions.canEditStyles  = this.appOptions.canLicense && this.appOptions.canEdit;
                this.appOptions.canPrint       = (this.permissions.print !== false);
                this.appOptions.canPreviewPrint = this.appOptions.canPrint && !Common.Utils.isMac && this.appOptions.isDesktopApp;
                this.appOptions.canQuickPrint = this.appOptions.canPrint && !Common.Utils.isMac && this.appOptions.isDesktopApp;
                this.appOptions.canRename      = this.editorConfig.canRename;
                this.appOptions.buildVersion   = params.asc_getBuildVersion();
                this.appOptions.canForcesave   = this.appOptions.isEdit && !this.appOptions.isOffline && (typeof (this.editorConfig.customization) == 'object' && !!this.editorConfig.customization.forcesave);
                this.appOptions.forcesave      = this.appOptions.canForcesave;
                this.appOptions.canEditComments= this.appOptions.isOffline || !this.permissions.editCommentAuthorOnly;
                this.appOptions.canDeleteComments= this.appOptions.isOffline || !this.permissions.deleteCommentAuthorOnly;
                if ((typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.commentAuthorOnly===true) {
                    console.log("Obsolete: The 'commentAuthorOnly' parameter of the 'customization' section is deprecated. Please use 'editCommentAuthorOnly' and 'deleteCommentAuthorOnly' parameters in the permissions instead.");
                    if (this.permissions.editCommentAuthorOnly===undefined && this.permissions.deleteCommentAuthorOnly===undefined)
                        this.appOptions.canEditComments = this.appOptions.canDeleteComments = this.appOptions.isOffline;
                }
                if (typeof (this.editorConfig.customization) == 'object') {
                    if (this.editorConfig.customization.showReviewChanges!==undefined)
                        console.log("Obsolete: The 'showReviewChanges' parameter of the 'customization' section is deprecated. Please use 'showReviewChanges' parameter in the 'customization.review' section instead.");
                    if (this.editorConfig.customization.reviewDisplay!==undefined)
                        console.log("Obsolete: The 'reviewDisplay' parameter of the 'customization' section is deprecated. Please use 'reviewDisplay' parameter in the 'customization.review' section instead.");
                    if (this.editorConfig.customization.trackChanges!==undefined)
                        console.log("Obsolete: The 'trackChanges' parameter of the 'customization' section is deprecated. Please use 'trackChanges' parameter in the 'customization.review' section instead.");
                }

                this.appOptions.trialMode      = params.asc_getLicenseMode();
                this.appOptions.isBeta         = params.asc_getIsBeta();
                this.appOptions.isSignatureSupport= this.appOptions.isEdit && this.appOptions.isDesktopApp && this.appOptions.isOffline && !this.appOptions.isPDFForm && this.api.asc_isSignaturesSupport() && (this.permissions.protect!==false);
                this.appOptions.isPDFSignatureSupport= this.appOptions.isPDFForm;
                this.appOptions.isPasswordSupport = this.appOptions.isEdit && this.api.asc_isProtectionSupport() && (this.permissions.protect!==false);
                this.appOptions.canProtect     = (this.permissions.protect!==false);
                this.appOptions.canEditContentControl = (this.permissions.modifyContentControl!==false);
                this.appOptions.canHelp        = !((typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.help===false);
                this.appOptions.canFillForms   = this.appOptions.canLicense && (this.appOptions.isEdit ? true : this.permissions.fillForms) && (this.editorConfig.mode !== 'view');
                this.appOptions.isRestrictedEdit = !this.appOptions.isEdit && (this.appOptions.canComments || this.appOptions.canFillForms);
                this.appOptions.canSaveToFile = this.appOptions.isEdit || this.appOptions.isRestrictedEdit;
                this.appOptions.canDownloadOrigin = false;
                this.appOptions.canDownload       = this.permissions.download !== false;
                this.appOptions.showSaveButton = this.appOptions.isEdit || !this.appOptions.isRestrictedEdit && this.appOptions.isPDFForm && this.appOptions.canDownload; // save to file or save to file copy (for pdf-form viewer)
                this.appOptions.canSuggest     = !((typeof (this.editorConfig.customization) == 'object') && this.editorConfig.customization.suggestFeature===false);

                if (this.appOptions.isPDFForm && !this.appOptions.isEdit && !this.appOptions.isRestrictedEdit) {
                    if (!this.appOptions.isRestrictedEdit && !this.appOptions.canEdit)
                        this.appOptions.canRequestEditRights = false; // if open form in viewer - check permissions.edit option
                    this.appOptions.canFillForms = this.appOptions.isRestrictedEdit = true; // can fill forms in viewer!
                }

                if (this.appOptions.isRestrictedEdit && this.appOptions.canComments && this.appOptions.canFillForms) // must be one restricted mode, priority for filling forms
                    this.appOptions.canComments = false;
                this.appOptions.canSwitchMode  = this.appOptions.isEdit;
                this.appOptions.canSubmitForms = this.appOptions.isRestrictedEdit && this.appOptions.canFillForms && this.appOptions.canLicense && !this.appOptions.isOffline && (typeof (this.editorConfig.customization) == 'object') &&
                                                !!this.editorConfig.customization.submitForm && (typeof this.editorConfig.customization.submitForm !== 'object' || this.editorConfig.customization.submitForm.visible!==false);
                this.appOptions.canStartFilling = this.editorConfig.canStartFilling && this.appOptions.isEdit &&  this.appOptions.isPDFForm; // show Start Filling button in the header

                this.appOptions.compactHeader = this.appOptions.customization && (typeof (this.appOptions.customization) == 'object') && !!this.appOptions.customization.compactHeader;
                this.appOptions.twoLevelHeader = this.appOptions.isEdit || this.appOptions.isPDFForm && this.appOptions.canFillForms && this.appOptions.isRestrictedEdit; // when compactHeader=true some buttons move to toolbar

                if ( this.appOptions.isLightVersion ) {
                    this.appOptions.canUseHistory =
                    this.appOptions.canReview =
                    this.appOptions.isReviewOnly = false;
                }

                if ( !this.appOptions.canCoAuthoring ) {
                    this.appOptions.canChat = false;
                }

                // var type = /^(?:(djvu))$/.exec(this.document.fileType);
                this.appOptions.canUseSelectHandTools = this.appOptions.canUseThumbnails = this.appOptions.canUseViwerNavigation = isPDFViewer;
                this.appOptions.canDownloadForms = false && this.appOptions.canLicense && this.appOptions.canDownload && this.appOptions.isRestrictedEdit && this.appOptions.canFillForms; // don't show download form button in edit mode

                this.appOptions.fileKey = this.document.key;

                this.appOptions.canBrandingExt = params.asc_getCanBranding() && (typeof this.editorConfig.customization == 'object' || this.editorConfig.plugins);
                Common.UI.LayoutManager.init(this.editorConfig.customization ? this.editorConfig.customization.layout : null, this.appOptions.canBrandingExt, this.api);
                this.editorConfig.customization && Common.UI.FeaturesManager.init(this.editorConfig.customization.features, this.appOptions.canBrandingExt);

                Common.UI.TabStyler.init(this.editorConfig.customization); // call after Common.UI.FeaturesManager.init() !!!

                this.appOptions.canBranding  = params.asc_getCustomization();
                if (this.appOptions.canBranding)
                    appHeader.setBranding(this.editorConfig.customization, this.appOptions);

                this.appOptions.canFavorite = this.document.info && (this.document.info.favorite!==undefined && this.document.info.favorite!==null) && !this.appOptions.isOffline;
                this.appOptions.canFavorite && appHeader.setFavorite(this.document.info.favorite);

                this.appOptions.canUseReviewPermissions = this.appOptions.canLicense && (!!this.permissions.reviewGroups ||
                                                        this.editorConfig.customization && this.editorConfig.customization.reviewPermissions && (typeof (this.editorConfig.customization.reviewPermissions) == 'object'));
                this.appOptions.canUseCommentPermissions = this.appOptions.canLicense && !!this.permissions.commentGroups;
                this.appOptions.canUseUserInfoPermissions = this.appOptions.canLicense && !!this.permissions.userInfoGroups;
                AscCommon.UserInfoParser.setParser(true);
                AscCommon.UserInfoParser.setCurrentName(this.appOptions.user.fullname);
                this.appOptions.canUseReviewPermissions && AscCommon.UserInfoParser.setReviewPermissions(this.permissions.reviewGroups, this.editorConfig.customization.reviewPermissions);
                this.appOptions.canUseCommentPermissions && AscCommon.UserInfoParser.setCommentPermissions(this.permissions.commentGroups);
                this.appOptions.canUseUserInfoPermissions && AscCommon.UserInfoParser.setUserInfoPermissions(this.permissions.userInfoGroups);
                appHeader.setUserName(AscCommon.UserInfoParser.getParsedName(AscCommon.UserInfoParser.getCurrentName()));
                appHeader.setUserId(this.appOptions.user.id);
                appHeader.setUserAvatar(this.appOptions.user.image);

                this.appOptions.canRename && appHeader.setCanRename(true);
                this.getApplication().getController('Common.Controllers.Plugins').setMode(this.appOptions, this.api);
                Common.UI.ExternalUsers.init(this.appOptions.canRequestUsers, this.api);
                this.appOptions.user.image ? Common.UI.ExternalUsers.setImage(this.appOptions.user.id, this.appOptions.user.image) : Common.UI.ExternalUsers.get('info', this.appOptions.user.id);

                if (this.appOptions.canComments)
                    Common.NotificationCenter.on('comments:cleardummy', _.bind(this.onClearDummyComment, this));
                    Common.NotificationCenter.on('comments:showdummy', _.bind(this.onShowDummyComment, this));

                // change = true by default in editor
                this.appOptions.canLiveView = !!params.asc_getLiveViewerSupport() && (this.editorConfig.mode === 'view') && !isPDFViewer; // viewer: change=false when no flag canLiveViewer (i.g. old license), change=true by default when canLiveViewer==true
                this.appOptions.canChangeCoAuthoring = this.appOptions.isEdit && this.appOptions.canCoAuthoring && !(this.editorConfig.coEditing && typeof this.editorConfig.coEditing == 'object' && this.editorConfig.coEditing.change===false) ||
                                                       this.appOptions.canLiveView && !(this.editorConfig.coEditing && typeof this.editorConfig.coEditing == 'object' && this.editorConfig.coEditing.change===false);
                this.appOptions.isAnonymousSupport = !!this.api.asc_isAnonymousSupport();

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
                this.appOptions.isRestrictedEdit && this.appOptions.canComments && this.api.asc_setRestriction(Asc.c_oAscRestrictionType.OnlyComments);
                if (this.appOptions.isRestrictedEdit && this.appOptions.canFillForms) {
                    this.api.asc_setRestriction(Asc.c_oAscRestrictionType.OnlyForms);
                }
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
                        value = Common.localStorage.getItem("de-settings-coauthmode");
                        if (value===null) {
                            value = (this.editorConfig.coEditing && this.editorConfig.coEditing.mode!==undefined) ? (this.editorConfig.coEditing.mode==='strict' ? 0 : 1) : null;
                            if (value===null && !Common.localStorage.itemExists("de-settings-autosave") &&
                                this.appOptions.customization && this.appOptions.customization.autosave===false) {
                                value = 0; // use customization.autosave only when de-settings-coauthmode and de-settings-autosave are null
                            }
                        }
                    }
                    fastCoauth = (value===null || parseInt(value) == 1);
                    Common.Utils.InternalSettings.set("de-settings-showchanges-fast", Common.localStorage.getItem("de-settings-showchanges-fast") || 'none');
                    Common.Utils.InternalSettings.set("de-settings-showchanges-strict", Common.localStorage.getItem("de-settings-showchanges-strict") || 'last');
                } else if (!this.appOptions.isEdit && this.appOptions.isRestrictedEdit) {
                    fastCoauth = true;
                }  else if (this.appOptions.canLiveView && !this.appOptions.isOffline) { // viewer
                    value = Common.localStorage.getItem("de-settings-view-coauthmode");
                    if (!this.appOptions.canChangeCoAuthoring || value===null) { // Use coEditing.mode or 'fast' by default
                        value = this.editorConfig.coEditing && this.editorConfig.coEditing.mode==='strict' ? 0 : 1;
                    }
                    fastCoauth = (parseInt(value) == 1);

                    // don't show collaborative marks in live viewer
                    Common.Utils.InternalSettings.set("de-settings-showchanges-fast", 'none');
                    Common.Utils.InternalSettings.set("de-settings-showchanges-strict", 'none');
                } else {
                    fastCoauth = false;
                    autosave = 0;
                }

                if (this.appOptions.isEdit) {
                    value = Common.localStorage.getItem("de-settings-autosave");
                    if (value === null && this.appOptions.customization && this.appOptions.customization.autosave === false)
                        value = 0;
                    autosave = (!fastCoauth && value !== null) ? parseInt(value) : (this.appOptions.canCoAuthoring ? 1 : 0);
                }

                Common.Utils.InternalSettings.set("de-settings-coauthmode", fastCoauth);
                Common.Utils.InternalSettings.set("de-settings-autosave", autosave);
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
                Common.Utils.InternalSettings.set("de-config-region", region);
            },

            onDocModeApply: function(mode, force, disableModeButton) {// force !== true - change mode only if not in view mode, disableModeButton: disable or not DocMode button in the header
                if (!this.appOptions.canSwitchMode && !force) return;

                var disable = mode==='view',
                    inViewMode = !!this.stackDisableActions.get({type: 'view'});

                if (force) {
                    (disable || inViewMode) && Common.NotificationCenter.trigger('editing:disable', disable, {
                        viewMode: false,
                        reviewMode: false,
                        fillFormMode: false,
                        viewDocMode: true,
                        allowMerge: false,
                        allowSignature: false,
                        allowProtect: false,
                        rightMenu: {clear: disable, disable: true},
                        statusBar: true,
                        leftMenu: {disable: true, previewMode: true},
                        fileMenu: {protect: true, history: false},
                        navigation: {disable: false, previewMode: true},
                        comments: {disable: false, previewMode: true},
                        chat: false,
                        review: true,
                        viewport: false,
                        documentHolder: {clear: true, disable: true},
                        toolbar: true,
                        plugins: true,
                        protect: true,
                        header: {docmode: !!disableModeButton, search: false, startfill: false},
                        shortcuts: false
                    }, 'view');

                    if (mode==='view-form' || !!this.stackDisableActions.get({type: 'forms'})) {
                        var forms = this.getApplication().getController('FormsTab');
                        forms && forms.changeViewFormMode(mode==='view-form', true);
                    }

                    if (mode==='edit') {
                        Common.NotificationCenter.trigger('reviewchanges:turn', false);
                    } else if (mode==='review') {
                        Common.NotificationCenter.trigger('reviewchanges:turn', true);
                    }
                    this.api.asc_setRestriction(mode==='view' ? Asc.c_oAscRestrictionType.View : mode==='view-form' ? Asc.c_oAscRestrictionType.OnlyForms : Asc.c_oAscRestrictionType.None, this.api.asc_getRestrictionSettings());
                }
                (!inViewMode || force) && Common.NotificationCenter.trigger('doc:mode-changed', mode);
            },

            onStartFilling: function(disconnect) {
                this._isFillInitiator = true;
                this.api.asc_CompletePreparingOForm(!!disconnect);
                !disconnect && this.onDisconnectEveryone(); // disable editing only for current user
            },

            onDisconnectEveryone: function() {
                Common.NotificationCenter.trigger('doc:mode-apply', 'view', true, true);
                appHeader.onStartFilling();
                !this._isFillInitiator && Common.UI.warning({
                                            msg  : this.warnStartFilling,
                                            buttons: ['ok']
                                        });
            },

            onCompletePreparingOForm: function() {
                Common.Gateway.startFilling();
            },

            applyModeCommonElements: function() {
                window.editor_elements_prepared = true;

                var app             = this.getApplication(),
                    viewport        = app.getController('Viewport').getView('Viewport'),
                    statusbarView   = app.getController('Statusbar').getView('Statusbar'),
                    documentHolder  = app.getController('DocumentHolder'),
                    toolbarController   = app.getController('Toolbar'),
                    leftMenu            = app.getController('LeftMenu');

                viewport && viewport.setMode(this.appOptions);
                statusbarView && statusbarView.setMode(this.appOptions);
                toolbarController.setMode(this.appOptions);
                documentHolder.setMode(this.appOptions);
                leftMenu.setMode(this.appOptions);

                viewport.applyCommonMode();

                if (this.appOptions.canPreviewPrint) {
                    var printController = app.getController('Print');
                    printController && this.api && printController.setApi(this.api).setMode(this.appOptions);
                }

                this.api.asc_registerCallback('asc_onSendThemeColors', _.bind(this.onSendThemeColors, this));
                this.api.asc_registerCallback('asc_onDownloadUrl',     _.bind(this.onDownloadUrl, this));
                this.api.asc_registerCallback('asc_onAuthParticipantsChanged', _.bind(this.onAuthParticipantsChanged, this));
                this.api.asc_registerCallback('asc_onParticipantsChanged',     _.bind(this.onAuthParticipantsChanged, this));
                this.api.asc_registerCallback('asc_onConnectionStateChanged',  _.bind(this.onUserConnection, this));
                this.api.asc_registerCallback('asc_onDocumentModifiedChanged', _.bind(this.onDocumentModifiedChanged, this));

                var value = Common.localStorage.getItem('de-settings-unit');
                value = (value!==null) ? parseInt(value) : (this.appOptions.customization && this.appOptions.customization.unit ? Common.Utils.Metric.c_MetricUnits[this.appOptions.customization.unit.toLocaleLowerCase()] : Common.Utils.Metric.getDefaultMetric());
                (value===undefined) && (value = Common.Utils.Metric.getDefaultMetric());
                Common.Utils.Metric.setCurrentMetric(value);
                Common.Utils.InternalSettings.set("de-settings-unit", value);
            },

            applyModeEditorElements: function() {
                /** coauthoring begin **/
                this.contComments.setMode(this.appOptions);
                this.contComments.setConfig({config: this.editorConfig}, this.api);
                /** coauthoring end **/

                var me = this,
                    application         = this.getApplication(),
                    reviewController    = application.getController('Common.Controllers.ReviewChanges');
                reviewController.setMode(me.appOptions).setConfig({config: me.editorConfig}, me.api).loadDocument({doc:me.document});

                var toolbarController   = application.getController('Toolbar');
                toolbarController   && toolbarController.setApi(me.api);

                if (this.appOptions.isRestrictedEdit)
                    application.getController('DocProtection').setMode(me.appOptions).setConfig({config: me.editorConfig}, me.api);
                else if (this.appOptions.isEdit) {
                    var rightmenuController = application.getController('RightMenu'),
                        fontsControllers    = application.getController('Common.Controllers.Fonts');
                    fontsControllers    && fontsControllers.setApi(me.api);
                    rightmenuController && rightmenuController.setApi(me.api);

                    application.getController('Common.Controllers.Protection').setMode(me.appOptions).setConfig({config: me.editorConfig}, me.api);
                    application.getController('DocProtection').setMode(me.appOptions).setConfig({config: me.editorConfig}, me.api);

                    var viewport = this.getApplication().getController('Viewport').getView('Viewport');

                    viewport.applyEditorMode();

                    var rightmenuView = rightmenuController.getView('RightMenu');
                    if (rightmenuView) {
                        rightmenuView.setApi(me.api);
                        rightmenuView.on('editcomplete', _.bind(me.onEditComplete, me));
                        rightmenuView.setMode(me.appOptions);
                    }

                    var toolbarView = (toolbarController) ? toolbarController.getView() : null;
                    if (toolbarView) {
                        toolbarView.setApi(me.api);
                        toolbarView.on('editcomplete', _.bind(me.onEditComplete, me));
                        toolbarView.on('insertimage', _.bind(me.onInsertImage, me));
                        toolbarView.on('inserttable', _.bind(me.onInsertTable, me));
                        toolbarView.on('insertshape', _.bind(me.onInsertShape, me));
                        toolbarView.on('inserttextart', _.bind(me.onInsertTextArt, me));
                        toolbarView.on('insertchart', _.bind(me.onInsertChart, me));
                        toolbarView.on('insertcontrol', _.bind(me.onInsertControl, me));
                    }

                    var value = Common.Utils.InternalSettings.get("de-settings-unit");
                    me.api.asc_SetDocumentUnits((value==Common.Utils.Metric.c_MetricUnits.inch) ? Asc.c_oAscDocumentUnits.Inch : ((value==Common.Utils.Metric.c_MetricUnits.pt) ? Asc.c_oAscDocumentUnits.Point : Asc.c_oAscDocumentUnits.Millimeter));

                    value = Common.localStorage.itemExists('de-hidden-rulers') ? Common.localStorage.getBool('de-hidden-rulers') : (this.appOptions.customization && !!this.appOptions.customization.hideRulers);
                    Common.Utils.InternalSettings.set("de-hidden-rulers", value);
                    me.api.asc_SetViewRulers(!value);

                    me.api.asc_registerCallback('asc_onDocumentCanSaveChanged',  _.bind(me.onDocumentCanSaveChanged, me));
                    /** coauthoring begin **/
                    me.api.asc_registerCallback('asc_onCollaborativeChanges',    _.bind(me.onCollaborativeChanges, me));
                    me.api.asc_registerCallback('asc_OnTryUndoInFastCollaborative',_.bind(me.onTryUndoInFastCollaborative, me));
                    me.api.asc_registerCallback('asc_onConvertEquationToMath',_.bind(me.onConvertEquationToMath, me));
                    me.appOptions.canSaveDocumentToBinary && me.api.asc_registerCallback('asc_onSaveDocument',_.bind(me.onSaveDocumentBinary, me));
                    /** coauthoring end **/

                    if (me.stackLongActions.exist({id: ApplyEditRights, type: Asc.c_oAscAsyncActionType['BlockInteraction']})) {
                        me.onLongActionEnd(Asc.c_oAscAsyncActionType['BlockInteraction'], ApplyEditRights);
                    } else if (!this._isDocReady) {
                        Common.NotificationCenter.trigger('app:face', me.appOptions);

                        me.hidePreloader();
                        me.onLongActionBegin(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);
                    }
                }
                if (this.appOptions.isEdit || this.appOptions.isRestrictedEdit && this.appOptions.isPDFForm) {
                    // Message on window close
                    window.onbeforeunload = _.bind(me.onBeforeUnload, me);
                    window.onunload = _.bind(me.onUnload, me);
                } else
                    window.onbeforeunload = _.bind(me.onBeforeUnloadView, me);
            },

            onExternalMessage: function(msg, options) {
                if (msg && msg.msg) {
                    msg.msg = (msg.msg).toString();
                    this.showTips([msg.msg.charAt(0).toUpperCase() + msg.msg.substring(1)], options);

                    Common.component.Analytics.trackEvent('External Error');
                }
            },

            onError: function(id, level, errData) {
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

                    case Asc.c_oAscError.ID.UplDocumentSize:
                        config.msg = this.uploadDocSizeMessage;
                        break;

                    case Asc.c_oAscError.ID.UplDocumentExt:
                        config.msg = this.uploadDocExtMessage;
                        break;

                    case Asc.c_oAscError.ID.UplDocumentFileCount:
                        config.msg = this.uploadDocFileCountMessage;
                        break;

                    case Asc.c_oAscError.ID.SplitCellMaxRows:
                        config.msg = this.splitMaxRowsErrorText.replace('%1', errData.get_Value());
                        break;

                    case Asc.c_oAscError.ID.SplitCellMaxCols:
                        config.msg = this.splitMaxColsErrorText.replace('%1', errData.get_Value());
                        break;

                    case Asc.c_oAscError.ID.SplitCellRowsDivider:
                        config.msg = this.splitDividerErrorText.replace('%1', errData.get_Value());
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

                    case Asc.c_oAscError.ID.CoAuthoringDisconnect:
                        config.msg = this.errorViewerDisconnect;
                        break;

                    case Asc.c_oAscError.ID.ConvertationPassword:
                        config.msg = this.errorFilePassProtect;
                        break;

                    case Asc.c_oAscError.ID.StockChartError:
                        config.msg = this.errorStockChart;
                        break;

                    case Asc.c_oAscError.ID.DataRangeError:
                        config.msg = this.errorDataRange;
                        break;

                    case Asc.c_oAscError.ID.Database:
                        config.msg = this.errorDatabaseConnection;
                        break;

                    case Asc.c_oAscError.ID.MailMergeLoadFile:
                        config.msg = this.errorMailMergeLoadFile;
                        break;

                    case Asc.c_oAscError.ID.MailMergeSaveFile:
                        config.msg = this.errorMailMergeSaveFile;
                        break;

                    case Asc.c_oAscError.ID.Warning:
                        config.msg = this.errorConnectToServer;
                        config.closable = false;
                        break;

                    case Asc.c_oAscError.ID.SessionAbsolute:
                        config.msg = this.errorSessionAbsolute;
                        break;

                    case Asc.c_oAscError.ID.AccessDeny:
                        config.msg = this.errorAccessDeny;
                        break;

                    case Asc.c_oAscError.ID.UplImageUrl:
                        config.msg = this.errorBadImageUrl;
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

                    case Asc.c_oAscError.ID.MailToClientMissing:
                        config.msg = this.errorEmailClient;
                        break;

                    case Asc.c_oAscError.ID.ConvertationOpenLimitError:
                        config.msg = this.errorFileSizeExceed;
                        break;

                    case Asc.c_oAscError.ID.DirectUrl:
                        config.msg = this.errorDirectUrl;
                        break;

                    case Asc.c_oAscError.ID.CannotCompareInCoEditing:
                        config.msg = this.errorCompare;
                        break;

                    case Asc.c_oAscError.ID.ComboSeriesError:
                        config.msg = this.errorComboSeries;
                        break;

                    case Asc.c_oAscError.ID.Password:
                        config.msg = this.errorSetPassword;
                        break;

                    case Asc.c_oAscError.ID.Submit:
                        config.msg = this.errorSubmit;
                        break;

                    case Asc.c_oAscError.ID.LoadingFontError:
                        config.msg = this.errorLoadingFont;
                        break;

                    case Asc.c_oAscError.ID.ComplexFieldEmptyTOC:
                        config.maxwidth = 600;
                        config.msg = this.errorEmptyTOC;
                        break;

                    case Asc.c_oAscError.ID.ComplexFieldNoTOC:
                        config.msg = this.errorNoTOC;
                        break;

                    case Asc.c_oAscError.ID.TextFormWrongFormat:
                        config.msg = this.errorTextFormWrongFormat;
                        break;

                    case Asc.c_oAscError.ID.PasswordIsNotCorrect:
                        config.msg = this.errorPasswordIsNotCorrect;
                        break;

                    case Asc.c_oAscError.ID.CannotSaveWatermark:
                        config.maxwidth = 600;
                        config.msg = this.errorSaveWatermark;
                        break;

                    case Asc.c_oAscError.ID.EditProtectedRange:
                        config.maxwidth = 600;
                        config.msg = this.errorEditProtectedRange;
                        break;

                    case Asc.c_oAscError.ID.ConvertationOpenFormat:
                        config.maxwidth = 600;
                        if (errData === 'pdf')
                            config.msg = this.errorInconsistentExtPdf.replace('%1', this.document.fileType || '');
                        else if  (errData === 'docx')
                            config.msg = this.errorInconsistentExtDocx.replace('%1', this.document.fileType || '');
                        else if  (errData === 'xlsx')
                            config.msg = this.errorInconsistentExtXlsx.replace('%1', this.document.fileType || '');
                        else if  (errData === 'pptx')
                            config.msg = this.errorInconsistentExtPptx.replace('%1', this.document.fileType || '');
                        else
                            config.msg = this.errorInconsistentExt;
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
                            if (btn == 'ok')
                                Common.NotificationCenter.trigger('goback', true);
                        }
                    }
                    if (id == Asc.c_oAscError.ID.DataEncrypted || id == Asc.c_oAscError.ID.ConvertationOpenLimitError) {
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
                        if (id == Asc.c_oAscError.ID.Warning && btn == 'ok' && (this.appOptions.canDownload || this.appOptions.canDownloadOrigin)) {
                            Common.UI.Menu.Manager.hideAll();
                            if (this.appOptions.isDesktopApp && this.appOptions.isOffline)
                                this.api.asc_DownloadAs();
                            else {
                                if (this.appOptions.canDownload) {
                                    this._isDocReady ? this.getApplication().getController('LeftMenu').leftMenu.showMenu('file:saveas') : (this._needToSaveAsFile = true);
                                } else
                                    this.api.asc_DownloadOrigin();
                            }
                        } else if (id == Asc.c_oAscError.ID.SplitCellMaxRows || id == Asc.c_oAscError.ID.SplitCellMaxCols || id == Asc.c_oAscError.ID.SplitCellRowsDivider) {
                            var me = this;
                            setTimeout(function(){
                                (new Common.Views.InsertTableDialog({
                                    split: true,
                                    handler: function(result, value) {
                                        if (result == 'ok') {
                                            if (me.api)
                                                me.api.SplitCell(value.columns, value.rows);
                                        }
                                        me.onEditComplete();
                                    }
                                })).show();
                            },10);
                        } else if (id == Asc.c_oAscError.ID.EditingError) {
                            this.disableEditing(true);
                            Common.NotificationCenter.trigger('api:disconnect', true); // enable download and print
                        }
                        this.onEditComplete();
                    }, this);
                }

                if (!Common.Utils.ModalWindow.isVisible() || $('.asc-window.modal.alert[data-value=' + id + ']').length<1)
                    Common.UI.alert(config).$window.attr('data-value', id);

                (id!==undefined) && Common.component.Analytics.trackEvent('Internal Error', id.toString());
            },

            onCoAuthoringDisconnect: function() {
                this.getApplication().getController('Viewport').getView('Viewport').setMode({isDisconnected:true});
                appHeader.setCanRename(false);
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
                        owner: this.getApplication().getController('Toolbar').getView(),
                        hideonclick: true,
                        placement: 'bottom',
                        cls: 'main-info',
                        offset: 30
                    });
                    this.tooltip.on('tooltip:hideonclick',closeTip);
                }

                showNextTip();
            },

            updateWindowTitle: function(force) {
                var isModified = this.api.isDocumentModified();
                if (this._state.isDocModified !== isModified || force) {
                    var title = this.defaultTitleText;

                    if (appHeader && !_.isEmpty(appHeader.getDocumentCaption()))
                        title = appHeader.getDocumentCaption() + ' - ' + title;

                    if (isModified) {
                        clearTimeout(this._state.timerCaption);
                        if (!_.isUndefined(title)) {
                            title = '* ' + title;
                        }
                    }

                    if (window.document.title != title)
                        window.document.title = title;

                    this._isDocReady && (this._state.isDocModified !== isModified) && Common.Gateway.setDocumentModified(isModified);
                    if (isModified && (!this._state.fastCoauth || this._state.usersCount<2))
                        this.getApplication().getController('Statusbar').setStatusCaption('', true);

                    this._state.isDocModified = isModified;
                }
            },

            onDocumentModifiedChanged: function() {
                var isModified = this.api.asc_isDocumentCanSave();
                if (this._state.isDocModified !== isModified) {
                    this._isDocReady && Common.Gateway.setDocumentModified(this.api.isDocumentModified());
                }

                this.updateWindowTitle();
                this.disableSaveButton(isModified);

                /** coauthoring begin **/
                if (this.contComments.isDummyComment && !this.dontCloseDummyComment && !this.beforeShowDummyComment) {
                    this.contComments.clearDummyComment();
                }
                /** coauthoring end **/
            },

            onDocumentCanSaveChanged: function (isCanSave) {
                this.disableSaveButton(isCanSave);
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

            onBeforeUnload: function() {
                Common.localStorage.save();

                if (this.api.isDocumentModified()) {
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
                        if (this.appOptions.customization && this.appOptions.customization.layout && this.appOptions.customization.layout.toolbar && (typeof this.appOptions.customization.layout.toolbar === 'object') &&
                            this.appOptions.customization.layout.toolbar.home && (typeof this.appOptions.customization.layout.toolbar.home === 'object') && this.appOptions.customization.layout.toolbar.home.mailmerge===false) {
                            console.log("Obsolete: The 'mailmerge' parameter of the 'customization.layout.toolbar.home' section is deprecated. Please use 'mailmerge' parameter in the 'customization.layout.toolbar.collaboration' section instead.");
                            if (this.appOptions.customization.layout.toolbar.collaboration!==false) {
                                if (typeof this.appOptions.customization.layout.toolbar.collaboration !== 'object')
                                    this.appOptions.customization.layout.toolbar.collaboration = {};
                                if (this.appOptions.customization.layout.toolbar.collaboration.mailmerge===undefined)
                                    this.appOptions.customization.layout.toolbar.collaboration.mailmerge = this.appOptions.customization.layout.toolbar.home.mailmerge;
                            }
                        }
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
                                                    }});
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

            /** coauthoring begin **/
//            fillUserStore: function(users){
//                if (!_.isEmpty(users)){
//                    var userStore = this.getCommonStoreUsersStore();
//
//                    if (userStore)
//                        userStore.add(users);
//                }
//            },

            onCollaborativeChanges: function() {
                if (this._state.hasCollaborativeChanges) return;
                this._state.hasCollaborativeChanges = true;
                if (this.appOptions.isEdit)
                    this.getApplication().getController('Statusbar').setStatusCaption(this.txtNeedSynchronize, true);
            },
            /** coauthoring end **/

            synchronizeChanges: function() {
                this.getApplication().getController('Statusbar').synchronizeChanges();
                this.getApplication().getController('Common.Controllers.ReviewChanges').synchronizeChanges();
                this.getApplication().getController('DocumentHolder').hideTips();
                /** coauthoring begin **/
                this.getApplication().getController('Toolbar').getView().synchronizeChanges();
                /** coauthoring end **/
                this._state.hasCollaborativeChanges = false;
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
                        model: DE.Models.ShapeModel
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

            updateThemeColors: function() {
                var me = this;
                setTimeout(function(){
                    me.getApplication().getController('RightMenu').UpdateThemeColors();
                }, 50);
                setTimeout(function(){
                    me.getApplication().getController('Toolbar').updateThemeColors();
                }, 50);
            },

            onSendThemeColors: function(colors, standart_colors) {
                Common.Utils.ThemeColor.setColors(colors, standart_colors);
                if (window.document_content_ready) {
                    this.updateThemeColors();
                    var me = this;
                    setTimeout(function(){
                        me.fillTextArt();
                    }, 1);
                }
            },

            loadLanguages: function(apiLangs) {
                var langs = [], info,
                    allLangs = Common.util.LanguageInfo.getLanguages();
                for (var code in allLangs) {
                    if (allLangs.hasOwnProperty(code)) {
                        info = allLangs[code];
                        if(info[2]) {
                            var displayName = Common.util.LanguageInfo.getLocalLanguageDisplayName(code);
                            langs.push({
                                displayValue:   displayName.native,
                                displayValueEn: displayName.english,
                                value:          info[0],
                                code:           parseInt(code),
                                spellcheck:     _.indexOf(apiLangs, code)>-1
                            });
                        }
                    }
                }

                langs.sort(function(a, b){
                    if (a.value < b.value) return -1;
                    if (a.value > b.value) return 1;
                    return 0;
                });

                this.languages = langs;
                window.document_content_ready && this.setLanguages();
            },

            setLanguages: function() {
                if (!this.languages || this.languages.length<1) {
                    this.loadLanguages([]);
                }

                let sLangs = Common.Controllers.Desktop.systemLangs() || {},
                    arr = [],
                    me = this;
                for (let name in sLangs) {
                    sLangs.hasOwnProperty(name) && arr.push(name);
                }
                sLangs = arr;

                arr = []; // system languages can be 'en'... (MacOs)
                sLangs.forEach(function(lang) {
                    let rec = _.findWhere(me.languages, {value: lang});
                    if (!rec) {
                        rec = Common.util.LanguageInfo.getDefaultLanguageCode(lang);
                        rec && (rec = _.findWhere(me.languages, {value: Common.util.LanguageInfo.getLocalLanguageName(rec)[0]}));
                    }
                    if (!rec)
                        rec = _.find(me.languages, function(item) {
                            return item.spellcheck && (item.value.indexOf(lang.toLowerCase())===0);
                        });
                    if (!rec)
                        rec = _.find(me.languages, function(item) {
                            return (item.value.indexOf(lang.toLowerCase())===0);
                        });
                    rec && arr.push(rec.value);
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
                if (this.languages && this.languages.length>0) {
                    this.getApplication().getController('DocumentHolder').getView().setLanguages(this.languages);
                    this.getApplication().getController('Statusbar').setLanguages(this.languages);
                    this.getApplication().getController('Common.Controllers.ReviewChanges').setLanguages(this.languages);
                }
            },

            onInsertTable:  function() {
                this.getApplication().getController('RightMenu').onInsertTable();
            },

            onInsertImage:  function() {
                this.getApplication().getController('RightMenu').onInsertImage();
            },

            onInsertChart:  function() {
                this.getApplication().getController('RightMenu').onInsertChart();
            },

            onInsertShape:  function() {
                this.getApplication().getController('RightMenu').onInsertShape();
            },

            onInsertTextArt:  function() {
                this.getApplication().getController('RightMenu').onInsertTextArt();
            },

            onInsertControl:  function() {
                this.getApplication().getController('RightMenu').onInsertControl();
            },

            unitsChanged: function(m) {
                var value = Common.localStorage.getItem("de-settings-unit");
                value = (value!==null) ? parseInt(value) : Common.Utils.Metric.getDefaultMetric();
                Common.Utils.Metric.setCurrentMetric(value);
                Common.Utils.InternalSettings.set("de-settings-unit", value);
                this.api.asc_SetDocumentUnits((value==Common.Utils.Metric.c_MetricUnits.inch) ? Asc.c_oAscDocumentUnits.Inch : ((value==Common.Utils.Metric.c_MetricUnits.pt) ? Asc.c_oAscDocumentUnits.Point : Asc.c_oAscDocumentUnits.Millimeter));
                this.getApplication().getController('RightMenu').updateMetricUnit();
                this.getApplication().getController('Toolbar').getView().updateMetricUnit();
                this.appOptions.canPreviewPrint && this.getApplication().getController('Print').getView('PrintWithPreview').updateMetricUnit();
            },

            onAdvancedOptions: function(type, advOptions, mode, formatOptions) {
                if (this._state.openDlg) return;

                var me = this;
                if (type == Asc.c_oAscAdvancedOptionsID.TXT) {
                    me._state.openDlg = new Common.Views.OpenDialog({
                        title: Common.Views.OpenDialog.prototype.txtTitle.replace('%1', 'TXT'),
                        closable: (mode==2), // if save settings
                        type: Common.Utils.importTextType.TXT,
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
                                if (me.api) {
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

            onTryUndoInFastCollaborative: function() {
                if (!Common.localStorage.getBool("de-hide-try-undoredo"))
                    Common.UI.info({
                        width: 500,
                        msg: this.appOptions.canChangeCoAuthoring ? this.textTryUndoRedo : this.textTryUndoRedoWarn,
                        iconCls: 'info',
                        buttons: this.appOptions.canChangeCoAuthoring ? [{value: 'custom', caption: this.textStrict}, 'cancel'] : ['ok'],
                        primary: this.appOptions.canChangeCoAuthoring ? 'custom' : 'ok',
                        dontshow: true,
                        callback: _.bind(function(btn, dontshow){
                            if (dontshow) Common.localStorage.setItem("de-hide-try-undoredo", 1);
                            if (btn == 'custom') {
                                Common.localStorage.setItem("de-settings-coauthmode", 0);
                                Common.Utils.InternalSettings.set("de-settings-coauthmode", false);
                                this.api.asc_SetFastCollaborative(false);
                                this._state.fastCoauth = false;
                                Common.localStorage.setItem("de-settings-showchanges-strict", 'last');
                                this.api.SetCollaborativeMarksShowType(Asc.c_oAscCollaborativeMarksShowType.LastChanges);
                                this.getApplication().getController('Common.Controllers.ReviewChanges').applySettings();
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
                        appHeader.setUserName(AscCommon.UserInfoParser.getParsedName(name));

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
                    var oldval = this._state.fastCoauth;
                    this._state.fastCoauth = Common.localStorage.getBool("de-settings-coauthmode", true);
                    if (this._state.fastCoauth && !oldval)
                        this.synchronizeChanges();
                }
                if (this.appOptions.canForcesave) {
                    this.appOptions.forcesave = Common.localStorage.getBool("de-settings-forcesave", this.appOptions.canForcesave);
                    Common.Utils.InternalSettings.set("de-settings-forcesave", this.appOptions.forcesave);
                    this.api.asc_setIsForceSaveOnUserSave(this.appOptions.forcesave);
                }
            },

            onDocumentName: function(name) {
                appHeader.setDocumentCaption(name);
                this.updateWindowTitle(true);
            },

            onMeta: function(meta) {
                appHeader.setDocumentCaption(meta.title);
                this.updateWindowTitle(true);
                this.document.title = meta.title;

                var filemenu = this.getApplication().getController('LeftMenu').getView('LeftMenu').getMenu('file');
                filemenu.loadDocument({doc:this.document});
                filemenu.panels && filemenu.panels['info'] && filemenu.panels['info'].updateInfo(this.document);
                this.getApplication().getController('Common.Controllers.ReviewChanges').loadDocument({doc:this.document});
                Common.Gateway.metaChange(meta);

                if (this.appOptions.wopi) {
                    var idx = meta.title.lastIndexOf('.');
                    Common.Gateway.requestRename(idx>0 ? meta.title.substring(0, idx) : meta.title);
                }
            },

            onPrint: function() {
                if (!this.appOptions.canPrint || Common.Utils.ModalWindow.isVisible()) return;
                Common.NotificationCenter.trigger('file:print');
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
                            // me.api.asc_DownloadAs(new Asc.asc_CDownloadOptions(Asc.c_oAscFileType.PDF));
                            window.open(url, "_blank"); // download by url, don't convert file again (+ fix print selection)
                        }
                    };
                }
                if (url) this.iframePrint.src = url;
            },

            onPrintQuick: function() {
                if (!this.appOptions.canQuickPrint) return;

                var value = Common.localStorage.getBool("de-hide-quick-print-warning"),
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
                            dontshow && Common.localStorage.setBool("de-hide-quick-print-warning", true);
                            if (btn === 'yes') {
                                setTimeout(handler, 1);
                            }
                        }
                    });
                }
            },

            onClearDummyComment: function() {
                this.dontCloseDummyComment = false;
            },

            onShowDummyComment: function() {
                this.beforeShowDummyComment = true;
            },

            DisableMailMerge: function() {
                this.appOptions.mergeFolderUrl = "";
                var reivewController   = this.getApplication().getController('Common.Controllers.ReviewChanges');
                reivewController && reivewController.DisableMailMerge();
            },

            DisableVersionHistory: function() {
                this.editorConfig.canUseHistory = false;
                this.appOptions.canUseHistory = false;
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
                    Common.NotificationCenter.trigger('file:help', 'UsageInstructions\/InsertEquation.htm#convertequation');
                })
            },

            warningDocumentIsLocked: function() {
                var me = this;
                var _disable_ui = function (disable) {
                    me.disableEditing(disable, 'reconnect');
                };

                Common.Utils.warningDocumentIsLocked({disablefunc: _disable_ui});
            },

            onRunAutostartMacroses: function() {
                var me = this,
                    enable = !this.editorConfig.customization || (this.editorConfig.customization.macros!==false);
                if (enable) {
                    var value = Common.Utils.InternalSettings.get("de-macros-mode");
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
                                    Common.Utils.InternalSettings.set("de-macros-mode", (btn == 'yes') ? 1 : 2);
                                    Common.localStorage.setItem("de-macros-mode", (btn == 'yes') ? 1 : 2);
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
                var value = Common.Utils.InternalSettings.get("de-allow-macros-request");
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
                                Common.Utils.InternalSettings.set("de-allow-macros-request", (btn == 'yes') ? 1 : 2);
                                Common.localStorage.setItem("de-allow-macros-request", (btn == 'yes') ? 1 : 2);
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
                var value = Common.localStorage.getItem("de-settings-math-correct-add");
                Common.Utils.InternalSettings.set("de-settings-math-correct-add", value);
                var arrAdd = value ? JSON.parse(value) : [];
                value = Common.localStorage.getItem("de-settings-math-correct-rem");
                Common.Utils.InternalSettings.set("de-settings-math-correct-rem", value);
                var arrRem = value ? JSON.parse(value) : [];
                value = Common.localStorage.getBool("de-settings-math-correct-replace-type", true); // replace on type
                Common.Utils.InternalSettings.set("de-settings-math-correct-replace-type", value);
                me.api.asc_refreshOnStartAutoCorrectMathSymbols(arrRem, arrAdd, value);

                value = Common.localStorage.getItem("de-settings-rec-functions-add");
                Common.Utils.InternalSettings.set("de-settings-rec-functions-add", value);
                arrAdd = value ? JSON.parse(value) : [];
                value = Common.localStorage.getItem("de-settings-rec-functions-rem");
                Common.Utils.InternalSettings.set("de-settings-rec-functions-rem", value);
                arrRem = value ? JSON.parse(value) : [];
                me.api.asc_refreshOnStartAutoCorrectMathFunctions(arrRem, arrAdd);

                value = Common.localStorage.getBool("de-settings-autoformat-bulleted", true);
                Common.Utils.InternalSettings.set("de-settings-autoformat-bulleted", value);
                me.api.asc_SetAutomaticBulletedLists(value);

                value = Common.localStorage.getBool("de-settings-autoformat-numbered", true);
                Common.Utils.InternalSettings.set("de-settings-autoformat-numbered", value);
                me.api.asc_SetAutomaticNumberedLists(value);

                value = Common.localStorage.getBool("de-settings-autoformat-smart-quotes", true);
                Common.Utils.InternalSettings.set("de-settings-autoformat-smart-quotes", value);
                me.api.asc_SetAutoCorrectSmartQuotes(value);

                value = Common.localStorage.getBool("de-settings-autoformat-hyphens", true);
                Common.Utils.InternalSettings.set("de-settings-autoformat-hyphens", value);
                me.api.asc_SetAutoCorrectHyphensWithDash(value);
   
                value = Common.localStorage.getItem("de-settings-letter-exception-sentence");
                value = value !== null ? parseInt(value) != 0 : Common.localStorage.getBool("de-settings-autoformat-fl-sentence", true);
                Common.Utils.InternalSettings.set("de-settings-letter-exception-sentence", value);
                me.api.asc_SetAutoCorrectFirstLetterOfSentences(value);

                value = Common.localStorage.getItem("de-settings-letter-exception-cells");
                value = value !== null ? parseInt(value) != 0 : Common.localStorage.getBool("de-settings-autoformat-fl-cells", true);
                Common.Utils.InternalSettings.set("de-settings-letter-exception-cells", value);
                me.api.asc_SetAutoCorrectFirstLetterOfCells(value);

                [0x0409, 0x0419].forEach(function(lang) {
                    var apiFlManager = me.api.asc_GetAutoCorrectSettings().get_FirstLetterExceptionManager();
                    
                    value = Common.localStorage.getItem("de-settings-letter-exception-add-" + lang);
                    Common.Utils.InternalSettings.set("de-settings-letter-exception-add-" + lang, value);
                    arrAdd = value ? JSON.parse(value) : [];
    
                    value = Common.localStorage.getItem("de-settings-letter-exception-rem-" + lang);
                    Common.Utils.InternalSettings.set("de-settings-letter-exception-rem-" + lang, value);
                    arrRem = value ? JSON.parse(value) : [];

                    var arrRes = _.union(apiFlManager.get_Exceptions(lang), arrAdd); 
                    arrRes = _.difference(arrRes, arrRem);  
                    arrRes.sort();
                    apiFlManager.put_Exceptions(arrRes, lang);       
                });                

                value = Common.localStorage.getBool("de-settings-autoformat-hyperlink", true);
                Common.Utils.InternalSettings.set("de-settings-autoformat-hyperlink", value);
                me.api.asc_SetAutoCorrectHyperlinks(value);
                
                value = Common.localStorage.getBool("de-settings-autoformat-double-space", Common.Utils.isMac); // add period with double-space in MacOs by default
                Common.Utils.InternalSettings.set("de-settings-autoformat-double-space", value);
                me.api.asc_SetAutoCorrectDoubleSpaceWithPeriod(value);
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
                            var name = settings.input ? settings.input + ' (' + me.appOptions.guestName + ')' : me.textAnonymous;
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

            onConfirmAction: function(id, apiCallback, data) {
                var me = this;
                if (id == Asc.c_oAscConfirm.ConfirmMaxChangesSize) {
                    Common.UI.warning({
                        title: this.notcriticalErrorTitle,
                        msg: this.confirmMaxChangesSize,
                        buttons: [{value: 'ok', caption: this.textUndo, primary: true}, {value: 'cancel', caption: this.textContinue}],
                        maxwidth: 600,
                        callback: _.bind(function(btn) {
                            if (apiCallback)  {
                                apiCallback(btn === 'ok');
                            }
                            me.onEditComplete();
                        }, this)
                    });
                }
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
                            appHeader.setDocumentCaption(data.document.title);
                            this.updateWindowTitle(true);
                            this.document.title = data.document.title;
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

                    var _options = $.extend({}, this.document.options, this.editorConfig.actionLink || {});
                    docInfo.put_Options(_options);

                    docInfo.put_Format(this.document.fileType);
                    docInfo.put_Lang(this.editorConfig.lang);
                    docInfo.put_Mode(this.editorConfig.mode);
                    docInfo.put_Permissions(this.permissions);
                    docInfo.put_DirectUrl(data.document && data.document.directUrl ? data.document.directUrl : this.document.directUrl);
                    docInfo.put_VKey(data.document && data.document.vkey ?  data.document.vkey : this.document.vkey);
                    docInfo.put_EncryptedInfo(data.editorConfig && data.editorConfig.encryptionKeys ? data.editorConfig.encryptionKeys : this.editorConfig.encryptionKeys);

                    var enable = !this.editorConfig.customization || (this.editorConfig.customization.macros!==false);
                    docInfo.asc_putIsEnabledMacroses(!!enable);
                    enable = !this.editorConfig.customization || (this.editorConfig.customization.plugins!==false);
                    docInfo.asc_putIsEnabledPlugins(!!enable);

                    var type = /^(?:(pdf|djvu|xps|oxps))$/.exec(this.document.fileType);
                    var coEditMode = (type && typeof type[1] === 'string') ? 'strict' :  // offline viewer for pdf|djvu|xps|oxps
                                    !(this.editorConfig.coEditing && typeof this.editorConfig.coEditing == 'object') ? 'fast' : // fast by default
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
    })(), DE.Controllers.Main || {}))
});