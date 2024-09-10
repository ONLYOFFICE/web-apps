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
 *    LeftMenu.js
 *
 *    Controller
 *
 *    Created on 19 February 2014
 *
 */

define([
    'core',
    'common/main/lib/util/Shortcuts',
    'documenteditor/main/app/view/LeftMenu',
    'documenteditor/main/app/view/FileMenu',
    'documenteditor/main/app/view/ViewTab'
], function () {
    'use strict';

    DE.Controllers.LeftMenu = Backbone.Controller.extend(_.extend({
        views: [
            'LeftMenu',
            'FileMenu',
            'ViewTab'
        ],

        initialize: function() {

            this.addListeners({
                'Common.Views.Chat': {
                    'hide': _.bind(this.onHideChat, this)
                },
                'Common.Views.Header': {
                    'history:show': function () {
                        if ( !this.leftMenu.panelHistory.isVisible() )
                            this.clickMenuFileItem('header', 'history');
                    }.bind(this),
                    'rename': _.bind(function (value) {
                        this.mode && this.mode.wopi && this.api ? this.api.asc_wopi_renameFile(value) : Common.Gateway.requestRename(value);
                    }, this)
                },
                'Common.Views.About': {
                    'show':    _.bind(this.aboutShowHide, this, false),
                    'hide':    _.bind(this.aboutShowHide, this, true)
                },
                'Common.Views.Plugins': {
                    'plugins:addtoleft': _.bind(this.addNewPlugin, this),
                    'pluginsleft:open': _.bind(this.openPlugin, this),
                    'pluginsleft:close': _.bind(this.closePlugin, this),
                    'pluginsleft:hide': _.bind(this.onHidePlugins, this),
                    'pluginsleft:updateicons': _.bind(this.updatePluginButtonsIcons, this)
                },
                'LeftMenu': {
                    'comments:show': _.bind(this.commentsShowHide, this, 'show'),
                    'comments:hide': _.bind(this.commentsShowHide, this, 'hide'),
                    'button:click':  _.bind(this.onBtnCategoryClick, this)
                },
                'FileMenu': {
                    'menu:hide': _.bind(this.menuFilesShowHide, this, 'hide'),
                    'menu:show': _.bind(this.menuFilesShowHide, this, 'show'),
                    'item:click': _.bind(this.clickMenuFileItem, this),
                    'saveas:format': _.bind(function(menu, format, ext) {
                        if (this.mode && this.mode.wopi && ext!==undefined) { // save copy as in wopi
                            this.saveAsInWopi(menu, format, ext);
                        } else
                            this.clickSaveAsFormat(menu, format, ext);
                    }, this),
                    'settings:apply': _.bind(this.applySettings, this),
                    'create:new': _.bind(this.onCreateNew, this),
                    'recent:open': _.bind(this.onOpenRecent, this)
                },
                'Toolbar': {
                    'file:settings': _.bind(this.clickToolbarSettings,this),
                    'file:open': this.clickToolbarTab.bind(this, 'file'),
                    'file:close': this.clickToolbarTab.bind(this, 'other'),
                    'save:disabled': this.changeToolbarSaveState.bind(this)
                },
                'Common.Views.ReviewChanges': {
                    'collaboration:chat': _.bind(this.onShowHideChat, this)
                },
                'ViewTab': {
                    'viewtab:navigation': _.bind(this.onShowHideNavigation, this),
                    'leftmenu:hide': _.bind(this.onLeftMenuHide, this)
                },
                'SearchBar': {
                    'search:show': _.bind(this.onShowHideSearch, this)
                }
            });

            Common.NotificationCenter.on('leftmenu:change', _.bind(this.onMenuChange, this));
            Common.NotificationCenter.on('app:comment:add', _.bind(this.onAppAddComment, this));
            Common.NotificationCenter.on('collaboration:history', _.bind(function () {
                if ( !this.leftMenu.panelHistory.isVisible() )
                    this.clickMenuFileItem(null, 'history');
            }, this));
            Common.NotificationCenter.on('protect:doclock', _.bind(this.onChangeProtectDocument, this));
            Common.NotificationCenter.on('file:print', _.bind(this.clickToolbarPrint, this));
            Common.NotificationCenter.on('file:help', _.bind(this.showHelp, this));
        },

        onLaunch: function() {
            this.leftMenu = this.createView('LeftMenu').render();
            this.leftMenu.btnSearchBar.on('toggle', _.bind(this.onMenuSearchBar, this));
            this._state = {
                disableEditing: false,
                docProtection: {
                    isReadOnly: false,
                    isReviewOnly: false,
                    isFormsOnly: false,
                    isCommentsOnly: false
                }
            };

            var keymap = {
                'command+shift+s,ctrl+shift+s': _.bind(this.onShortcut, this, 'save'),
                'command+f,ctrl+f': _.bind(this.onShortcut, this, 'search'),
                'ctrl+h': _.bind(this.onShortcut, this, 'replace'),
                'esc': _.bind(this.onShortcut, this, 'escape'),
                /** coauthoring begin **/
                'command+shift+h,ctrl+shift+h': _.bind(this.onShortcut, this, 'comments'),
                /** coauthoring end **/
                'f1': _.bind(this.onShortcut, this, 'help')
            };
            keymap[Common.Utils.isMac ? 'ctrl+alt+f' : 'alt+f'] = _.bind(this.onShortcut, this, 'file');
            keymap[Common.Utils.isMac ? 'ctrl+alt+q' : 'alt+q'] = _.bind(this.onShortcut, this, 'chat');
            Common.util.Shortcuts.delegateShortcuts({shortcuts:keymap});
            Common.util.Shortcuts.suspendEvents();
        },

        setApi: function(api) {
            this.api = api;
            this.api.asc_registerCallback('asc_onCoAuthoringDisconnect', _.bind(this.onApiServerDisconnect, this));
            Common.NotificationCenter.on('api:disconnect',               _.bind(this.onApiServerDisconnect, this));
            this.api.asc_registerCallback('asc_onDownloadUrl',           _.bind(this.onDownloadUrl, this));
            /** coauthoring begin **/
            if (this.mode.canCoAuthoring) {
                if (this.mode.canChat)
                    this.api.asc_registerCallback('asc_onCoAuthoringChatReceiveMessage', _.bind(this.onApiChatMessage, this));
                if (this.mode.canComments) {
                    this.api.asc_registerCallback('asc_onAddComment', _.bind(this.onApiAddComment, this));
                    this.api.asc_registerCallback('asc_onAddComments', _.bind(this.onApiAddComments, this));
                    var collection = this.getApplication().getCollection('Common.Collections.Comments'),
                        resolved = Common.Utils.InternalSettings.get("de-settings-resolvedcomment");
                    for (var i = 0; i < collection.length; ++i) {
                        var comment = collection.at(i);
                        if (!comment.get('hide') && comment.get('userid') !== this.mode.user.id && comment.get('userid') !== '' && (resolved || !comment.get('resolved'))) {
                            this.leftMenu.markCoauthOptions('comments', true);
                            break;
                        }
                    }
                }
            }
            /** coauthoring end **/
            this.leftMenu.getMenu('file').setApi(api);
            if (this.mode.canUseHistory)
                this.getApplication().getController('Common.Controllers.History').setApi(this.api).setMode(this.mode);
            this.getApplication().getController('PageThumbnails').setApi(this.api).setMode(this.mode);
            this.getApplication().getController('Search').setApi(this.api).setMode(this.mode);
            this.leftMenu.setOptionsPanel('advancedsearch', this.getApplication().getController('Search').getView('Common.Views.SearchPanel'));
            return this;
        },

        setMode: function(mode) {
            this.mode = mode;
            this.leftMenu.setMode(mode);
            this.leftMenu.getMenu('file').setMode(mode);
            return this;
        },

        createDelayedElements: function() {
            /** coauthoring begin **/
            if ( this.mode.canCoAuthoring ) {
                this.leftMenu.btnComments[(this.mode.canViewComments && !this.mode.isLightVersion) ? 'show' : 'hide']();
                if (this.mode.canViewComments)
                    this.leftMenu.setOptionsPanel('comment', this.getApplication().getController('Common.Controllers.Comments').getView());

                this.leftMenu.btnChat[(this.mode.canChat && !this.mode.isLightVersion) ? 'show' : 'hide']();
                if (this.mode.canChat)
                    this.leftMenu.setOptionsPanel('chat', this.getApplication().getController('Common.Controllers.Chat').getView('Common.Views.Chat'));
            } else {
                this.leftMenu.btnChat.hide();
                this.leftMenu.btnComments.hide();
            }
            /** coauthoring end **/

            if (this.mode.canUseHistory)
                this.leftMenu.setOptionsPanel('history', this.getApplication().getController('Common.Controllers.History').getView('Common.Views.History'));

            this.leftMenu.setOptionsPanel('navigation', this.getApplication().getController('Navigation').getView('Navigation'));

            if (this.mode.canUseThumbnails) {
                this.leftMenu.setOptionsPanel('thumbnails', this.getApplication().getController('PageThumbnails').getView('PageThumbnails'));
            } else {
                this.leftMenu.btnThumbnails.hide();
            }

            (this.mode.trialMode || this.mode.isBeta) && this.leftMenu.setDeveloperMode(this.mode.trialMode, this.mode.isBeta, this.mode.buildVersion);
            this.onChangeProtectDocument();
            Common.util.Shortcuts.resumeEvents();
            this.leftMenu.setButtons();
            this.leftMenu.setMoreButton();
            return this;
        },

        enablePlugins: function() {
            (this.mode.trialMode || this.mode.isBeta) && this.leftMenu.setDeveloperMode(this.mode.trialMode, this.mode.isBeta, this.mode.buildVersion);
        },

        clickMenuFileItem: function(menu, action, isopts) {
            var close_menu = true;
            switch (action) {
            case 'back':
                break;
            case 'save': Common.NotificationCenter.trigger('leftmenu:save'); break;
            case 'save-desktop': this.api.asc_DownloadAs(); break;
            case 'saveas':
                if ( isopts ) close_menu = false;
                else this.clickSaveAsFormat();
                break;
            case 'save-copy':
                if ( isopts ) close_menu = false;
                else this.clickSaveAsFormat(undefined, undefined, true);
                break;
            case 'print': this.api.asc_Print(new Asc.asc_CDownloadOptions(null, Common.Utils.isChrome || Common.Utils.isOpera || Common.Utils.isGecko && Common.Utils.firefoxVersion>86)); break;
            case 'exit': Common.NotificationCenter.trigger('goback'); break;
            case 'edit':
                this.getApplication().getController('Statusbar').setStatusCaption(this.requestEditRightsText);
                Common.Gateway.requestEditRights();
                break;
            case 'new':
                if ( isopts ) close_menu = false;
                else this.onCreateNew(undefined, 'blank');
                break;
            case 'history':
                if (!this.leftMenu.panelHistory.isVisible()) {
                    if (this.api.isDocumentModified()) {
                        var me = this;
                        this.api.asc_stopSaving();
                        Common.UI.warning({
                            closable: false,
                            width: 500,
                            title: this.notcriticalErrorTitle,
                            msg: this.leavePageText,
                            buttons: ['ok', 'cancel'],
                            primary: 'ok',
                            callback: function(btn) {
                                if (btn == 'ok') {
                                    me.api.asc_undoAllChanges();
                                    me.api.asc_continueSaving();
                                    me.showHistory();
                                } else
                                    me.api.asc_continueSaving();
                            }
                        });
                    } else
                        this.showHistory();
                }
                break;
            case 'rename':
                var me = this,
                    documentCaption = me.api.asc_getDocumentName();
                (new Common.Views.RenameDialog({
                    filename: documentCaption,
                    maxLength: this.mode.wopi ? this.mode.wopi.FileNameMaxLength : undefined,
                    handler: function(result, value) {
                        if (result == 'ok' && !_.isEmpty(value.trim()) && documentCaption !== value.trim()) {
                            me.mode.wopi ? me.api.asc_wopi_renameFile(value) : Common.Gateway.requestRename(value);
                        }
                        Common.NotificationCenter.trigger('edit:complete', me);
                    }
                })).show();
                break;
            case 'external-help':
                close_menu = !!isopts;
                break;
            case 'close-editor': Common.NotificationCenter.trigger('close'); break;
            default: close_menu = false;
            }

            if (close_menu && menu) {
                menu.hide();
            }
        },

        _saveAsFormat: function(menu, format, ext, textParams, wopiPath) {
            var needDownload = !!ext;
            var options = new Asc.asc_CDownloadOptions(format, needDownload);
            options.asc_setIsSaveAs(needDownload);
            wopiPath && options.asc_setWopiSaveAsPath(wopiPath);

            if (menu) {
                options.asc_setTextParams(textParams);
                if (format == Asc.c_oAscFileType.TXT || format == Asc.c_oAscFileType.RTF) {
                    Common.UI.warning({
                        title: this.notcriticalErrorTitle,
                        msg: (format == Asc.c_oAscFileType.TXT) ? this.warnDownloadAs : this.warnDownloadAsRTF,
                        buttons: ['ok', 'cancel'],
                        callback: _.bind(function(btn){
                            if (btn == 'ok') {
                                this.isFromFileDownloadAs = ext;
                                if (format == Asc.c_oAscFileType.TXT)
                                    Common.NotificationCenter.trigger('download:advanced', Asc.c_oAscAdvancedOptionsID.TXT, this.api.asc_getAdvancedOptions(), 2, options);
                                else
                                    this.api.asc_DownloadAs(options);
                                menu.hide();
                            }
                        }, this)
                    });
                } else if (format == Asc.c_oAscFileType.DOCX || format == Asc.c_oAscFileType.DOCM || format == Asc.c_oAscFileType.DOTX) {
                    if (!Common.Utils.InternalSettings.get("de-settings-compatible") && !Common.localStorage.getBool("de-hide-save-compatible") && this.api.asc_isCompatibilityMode()) {
                        Common.UI.warning({
                            closable: false,
                            width: 600,
                            title: this.notcriticalErrorTitle,
                            msg: this.txtCompatible,
                            buttons: ['ok', 'cancel'],
                            dontshow: true,
                            callback: _.bind(function(btn, dontshow){
                                if (dontshow) Common.localStorage.setItem("de-hide-save-compatible", 1);
                                if (btn == 'ok') {
                                    this.isFromFileDownloadAs = ext;
                                    options.asc_setCompatible(false);
                                    this.api.asc_DownloadAs(options);
                                    menu.hide();
                                }
                            }, this)
                        });
                    } else {
                        this.isFromFileDownloadAs = ext;
                        options.asc_setCompatible(!!Common.Utils.InternalSettings.get("de-settings-compatible"));
                        this.api.asc_DownloadAs(options);
                        menu.hide();
                    }
                } else {
                    this.isFromFileDownloadAs = ext;
                    this.api.asc_DownloadAs(options);
                    menu.hide();
                }
            } else {
                this.isFromFileDownloadAs = needDownload;
                this.api.asc_DownloadOrigin(options);
            }
        },

        clickSaveAsFormat: function(menu, format, ext, wopiPath) { // ext isn't undefined for save copy as
            var me = this,
                fileType = this.getApplication().getController('Main').document.fileType;

            if ( /^pdf|xps|oxps|djvu$/.test(fileType)) {
                if (format===undefined) {
                    this._saveAsFormat(undefined, format, ext, undefined, wopiPath); // download original
                    menu && menu.hide();
                } else if (format == Asc.c_oAscFileType.PDF || format == Asc.c_oAscFileType.PDFA || format == Asc.c_oAscFileType.JPG || format == Asc.c_oAscFileType.PNG)
                    this._saveAsFormat(menu, format, ext, undefined, wopiPath);
                else {
                    if (format == Asc.c_oAscFileType.TXT || format == Asc.c_oAscFileType.RTF) // don't show message about pdf/xps/oxps
                        me._saveAsFormat(menu, format, ext, new AscCommon.asc_CTextParams(Asc.c_oAscTextAssociation.PlainLine), wopiPath);
                    else {
                        Common.UI.warning({
                            width: 600,
                            title: this.notcriticalErrorTitle,
                            msg: Common.Utils.String.format(this.warnDownloadAsPdf, fileType.toUpperCase()),
                            buttons: ['ok', 'cancel'],
                            callback: _.bind(function(btn){
                                if (btn == 'ok') {
                                    me._saveAsFormat(menu, format, ext, new AscCommon.asc_CTextParams(Asc.c_oAscTextAssociation.PlainLine), wopiPath);
                                }
                            }, this)
                        });
                    }
                }
            } else
                this._saveAsFormat(menu, format, ext, undefined, wopiPath);
        },

        onDownloadUrl: function(url, fileType) {
            if (this.isFromFileDownloadAs) {
                var me = this,
                    defFileName = this.getApplication().getController('Viewport').getView('Common.Views.Header').getDocumentCaption();
                !defFileName && (defFileName = me.txtUntitled);

                if (typeof this.isFromFileDownloadAs == 'string') {
                    var idx = defFileName.lastIndexOf('.');
                    if (idx>0)
                        defFileName = defFileName.substring(0, idx) + this.isFromFileDownloadAs;
                }

                if (me.mode.canRequestSaveAs) {
                    Common.Gateway.requestSaveAs(url, defFileName, fileType);
                } else {
                    me._saveCopyDlg = new Common.Views.SaveAsDlg({
                        saveFolderUrl: me.mode.saveAsUrl,
                        saveFileUrl: url,
                        defFileName: defFileName
                    });
                    me._saveCopyDlg.on('saveaserror', function(obj, err){
                        var config = {
                            closable: false,
                            title: me.notcriticalErrorTitle,
                            msg: err,
                            iconCls: 'warn',
                            buttons: ['ok'],
                            callback: function(btn){
                                Common.NotificationCenter.trigger('edit:complete', me);
                            }
                        };
                        Common.UI.alert(config);
                    }).on('close', function(obj){
                        me._saveCopyDlg = undefined;
                    });
                    me._saveCopyDlg.show();
                }
            }
            this.isFromFileDownloadAs = false;
        },

        saveAsInWopi: function(menu, format, ext) {
            var me = this,
                defFileName = this.getApplication().getController('Viewport').getView('Common.Views.Header').getDocumentCaption();
            !defFileName && (defFileName = me.txtUntitled);
            if (typeof ext === 'string') {
                var idx = defFileName.lastIndexOf('.');
                if (idx>0)
                    defFileName = defFileName.substring(0, idx) + ext;
            }
            (new Common.Views.TextInputDialog({
                label: me.textSelectPath,
                value: defFileName || '',
                handler: function(result, value) {
                    if (result == 'ok') {
                        me.clickSaveAsFormat(menu, format, ext, value);
                    }
                }
            })).show();
        },

        applySettings: function(menu) {
            var value;

            var fast_coauth = Common.Utils.InternalSettings.get("de-settings-coauthmode");
            /** coauthoring begin **/
            if (this.mode.isEdit && !this.mode.isOffline && this.mode.canCoAuthoring ) {
                if (this.mode.canChangeCoAuthoring) {
                    fast_coauth = Common.localStorage.getBool("de-settings-coauthmode", true);
                    Common.Utils.InternalSettings.set("de-settings-coauthmode", fast_coauth);
                    this.api.asc_SetFastCollaborative(fast_coauth);
                }

                value = Common.localStorage.getItem((fast_coauth) ? "de-settings-showchanges-fast" : "de-settings-showchanges-strict");
                Common.Utils.InternalSettings.set((fast_coauth) ? "de-settings-showchanges-fast" : "de-settings-showchanges-strict", value);
                switch(value) {
                case 'all': value = Asc.c_oAscCollaborativeMarksShowType.All; break;
                case 'none': value = Asc.c_oAscCollaborativeMarksShowType.None; break;
                case 'last': value = Asc.c_oAscCollaborativeMarksShowType.LastChanges; break;
                default: value = (fast_coauth) ? Asc.c_oAscCollaborativeMarksShowType.None : Asc.c_oAscCollaborativeMarksShowType.LastChanges;
                }
                this.api.SetCollaborativeMarksShowType(value);
            } else if (this.mode.canLiveView && !this.mode.isOffline && this.mode.canChangeCoAuthoring) { // viewer
                fast_coauth = Common.localStorage.getBool("de-settings-view-coauthmode", false);
                Common.Utils.InternalSettings.set("de-settings-coauthmode", fast_coauth);
                this.api.asc_SetFastCollaborative(fast_coauth);
            }

            value = Common.localStorage.getBool("de-settings-livecomment", true);
            Common.Utils.InternalSettings.set("de-settings-livecomment", value);
            var resolved = Common.localStorage.getBool("de-settings-resolvedcomment");
            Common.Utils.InternalSettings.set("de-settings-resolvedcomment", resolved);
            if (this.mode.canViewComments && this.leftMenu.panelComments && this.leftMenu.panelComments.isVisible())
                value = resolved = true;
            (value) ? this.api.asc_showComments(resolved) : this.api.asc_hideComments();
            this.getApplication().getController('Common.Controllers.ReviewChanges').commentsShowHide(value ? 'show' : 'hide');
            /** coauthoring end **/

            value = Common.localStorage.getBool("de-settings-cachemode", true);
            Common.Utils.InternalSettings.set("de-settings-cachemode", value);
            this.api.asc_setDefaultBlitMode(value);

            value = Common.localStorage.getItem("de-settings-fontrender");
            Common.Utils.InternalSettings.set("de-settings-fontrender", value);
            switch (value) {
            case '1':     this.api.SetFontRenderingMode(1); break;
            case '2':     this.api.SetFontRenderingMode(2); break;
            case '0':     this.api.SetFontRenderingMode(3); break;
            }

            if (this.mode.isEdit) {
                if (this.mode.canChangeCoAuthoring || !fast_coauth) {// can change co-auth. mode or for strict mode
                    value = parseInt(Common.localStorage.getItem("de-settings-autosave"));
                    Common.Utils.InternalSettings.set("de-settings-autosave", value);
                    this.api.asc_setAutoSaveGap(value);
                }

                if (Common.UI.FeaturesManager.canChange('spellcheck')) {
                    value = Common.localStorage.getBool("de-settings-spellcheck", true);
                    Common.Utils.InternalSettings.set("de-settings-spellcheck", value);
                    this.api.asc_setSpellCheck(value);
                    var spprops = new AscCommon.CSpellCheckSettings();
                    value = Common.localStorage.getBool("de-spellcheck-ignore-uppercase-words", true);
                    Common.Utils.InternalSettings.set("de-spellcheck-ignore-uppercase-words", value);
                    spprops.put_IgnoreWordsInUppercase(value);
                    value = Common.localStorage.getBool("de-spellcheck-ignore-numbers-words", true);
                    Common.Utils.InternalSettings.set("de-spellcheck-ignore-numbers-words", value);
                    spprops.put_IgnoreWordsWithNumbers(value);
                    this.api.asc_setSpellCheckSettings(spprops);
                }

                value = parseInt(Common.localStorage.getItem("de-settings-paste-button"));
                Common.Utils.InternalSettings.set("de-settings-paste-button", value);
                this.api.asc_setVisiblePasteButton(!!value);

                value = Common.localStorage.getBool("de-settings-smart-selection");
                Common.Utils.InternalSettings.set("de-settings-smart-selection", value);
                this.api.asc_putSmartParagraphSelection(value);
            }

            this.api.put_ShowSnapLines(Common.Utils.InternalSettings.get("de-settings-showsnaplines"));

            value = Common.localStorage.getBool("app-settings-screen-reader");
            Common.Utils.InternalSettings.set("app-settings-screen-reader", value);
            this.api.setSpeechEnabled(value);

            /* update zoom */
            var newZoomValue = Common.localStorage.getItem("de-settings-zoom");
            var oldZoomValue = Common.Utils.InternalSettings.get("de-settings-zoom");
            var lastZoomValue = Common.Utils.InternalSettings.get("de-last-zoom");

            if (oldZoomValue === null || oldZoomValue == lastZoomValue || oldZoomValue == -3) {
                if (newZoomValue == -1) {
                    this.api.zoomFitToPage();
                } else if (newZoomValue == -2) {
                    this.api.zoomFitToWidth();
                } else if (newZoomValue > 0) {
                    this.api.zoom(newZoomValue);
                }
            }

            Common.Utils.InternalSettings.set("de-settings-zoom", newZoomValue);

            menu.hide();
        },

        onCreateNew: function(menu, type) {
            if ( !Common.Controllers.Desktop.process('create:new') ) {
                if (type == 'blank' && this.mode.canRequestCreateNew)
                    Common.Gateway.requestCreateNew();
                else {
                    var newDocumentPage = window.open(type == 'blank' ? this.mode.createUrl : type, "_blank");
                    if (newDocumentPage) newDocumentPage.focus();
                }
            }

            if (menu) {
                menu.hide();
            }
        },

        onOpenRecent:  function(menu, url) {
            if (menu) {
                menu.hide();
            }

            var recentDocPage = window.open(url);
            if (recentDocPage)
                recentDocPage.focus();

            Common.component.Analytics.trackEvent('Open Recent');
        },

        clickToolbarSettings: function(obj) {
            this.leftMenu.showMenu('file:opts');
        },

        clickToolbarTab: function (tab, e) {
            if (tab == 'file')
                this.leftMenu.showMenu('file'); else
                this.leftMenu.menuFile.hide();
        },

        clickToolbarPrint: function () {
            if (this.mode.canPreviewPrint)
                this.leftMenu.showMenu('file:printpreview');
            else if (this.mode.canPrint)
                this.clickMenuFileItem(null, 'print');
        },

        changeToolbarSaveState: function (state) {
            var btnSave = this.leftMenu.menuFile.getButton('save');
            btnSave && btnSave.setDisabled(state);
        },

        /** coauthoring begin **/
        onHideChat: function() {
            $(this.leftMenu.btnChat.el).blur();
            Common.NotificationCenter.trigger('layout:changed', 'leftmenu');
        },
        /** coauthoring end **/

        onHidePlugins: function() {
            Common.NotificationCenter.trigger('layout:changed', 'leftmenu');
        },

        addNewPlugin: function (button, $button, $panel) {
            this.leftMenu.insertButton(button, $button);
            this.leftMenu.insertPanel($panel);
        },

        onBtnCategoryClick: function (btn) {
            if (btn.options.type === 'plugin' && !btn.isDisabled()) {
                if (btn.pressed) {
                    this.tryToShowLeftMenu();
                    this.leftMenu.fireEvent('plugins:showpanel', [btn.options.value]); // show plugin panel
                } else {
                    this.leftMenu.fireEvent('plugins:hidepanel', [btn.options.value]);
                }
                this.leftMenu.onBtnMenuClick(btn);
            }
        },

        openPlugin: function (guid) {
            this.leftMenu.openPlugin(guid);
        },

        closePlugin: function (guid) {
            this.leftMenu.closePlugin(guid);
            Common.NotificationCenter.trigger('layout:changed', 'leftmenu');
        },

        updatePluginButtonsIcons: function (icons) {
            this.leftMenu.updatePluginButtonsIcons(icons);
        },

        onApiServerDisconnect: function(enableDownload) {
            this.mode.isEdit = false;
            this.leftMenu.close();

            /** coauthoring begin **/
            this.leftMenu.btnComments.setDisabled(true);
            this.leftMenu.btnChat.setDisabled(true);
            /** coauthoring end **/
            this.leftMenu.btnNavigation.setDisabled(true);
            this.leftMenu.setDisabledPluginButtons(true);

            this.leftMenu.getMenu('file').setMode({isDisconnected: true, enableDownload: !!enableDownload});
        },

        setPreviewMode: function(mode) {
            this._state.disableEditing = mode;
            this.updatePreviewMode();
        },

        updatePreviewMode: function() {
            var viewmode = this._state.disableEditing || this._state.docProtection.isReadOnly || this._state.docProtection.isFormsOnly || this._state.docProtection.isCommentsOnly;
            if (this.viewmode === viewmode) return;
            this.viewmode = viewmode;

            this.leftMenu.panelSearch && this.leftMenu.panelSearch.setSearchMode(this.viewmode ? 'no-replace' : 'search');
            this.leftMenu.setDisabledPluginButtons(this.viewmode);
        },

        SetDisabled: function(disable, options) {
            if (this.leftMenu._state.disabled !== disable) {
                this.leftMenu._state.disabled = disable;
                if (disable) {
                    this.previsEdit = this.mode.isEdit;
                    this.prevcanEdit = this.mode.canEdit;
                    this.mode.isEdit = this.mode.canEdit = !disable;
                } else {
                    this.mode.isEdit = this.previsEdit;
                    this.mode.canEdit = this.prevcanEdit;
                }
            }

            if (disable) this.leftMenu.close();

            if (!options || options.comments && options.comments.disable)
                this.leftMenu.btnComments.setDisabled(disable);
            if (!options || options.chat)
                this.leftMenu.btnChat.setDisabled(disable);
            if (!options || options.navigation && options.navigation.disable)
                this.leftMenu.btnNavigation.setDisabled(disable);

            this.leftMenu.setDisabledPluginButtons(disable);
        },

        /** coauthoring begin **/
        onApiChatMessage: function() {
            this.leftMenu.markCoauthOptions('chat');
        },

        onApiAddComment: function(id, data) {
            var resolved = Common.Utils.InternalSettings.get("de-settings-resolvedcomment");
            if (data && data.asc_getUserId() !== this.mode.user.id && (resolved || !data.asc_getSolved()) && AscCommon.UserInfoParser.canViewComment(data.asc_getUserName()))
                this.leftMenu.markCoauthOptions('comments');
        },

        onApiAddComments: function(data) {
            var resolved = Common.Utils.InternalSettings.get("de-settings-resolvedcomment");
            for (var i = 0; i < data.length; ++i) {
                if (data[i].asc_getUserId() !== this.mode.user.id && (resolved || !data[i].asc_getSolved()) && AscCommon.UserInfoParser.canViewComment(data.asc_getUserName())) {
                    this.leftMenu.markCoauthOptions('comments');
                    break;
                }
            }
        },

        onAppAddComment: function(sender) {
            var me = this;
            if ( this.api.can_AddQuotedComment() === false ) {
                (new Promise(function(resolve, reject) {
                    resolve();
                })).then(function () {
                    Common.UI.Menu.Manager.hideAll();
                    me.leftMenu.showMenu('comments');

                    var ctrl = DE.getController('Common.Controllers.Comments');
                    ctrl.getView().showEditContainer(true);
                    ctrl.onAfterShow();
                });
            }
        },

        commentsShowHide: function(mode) {
            var value = Common.Utils.InternalSettings.get("de-settings-livecomment"),
                resolved = Common.Utils.InternalSettings.get("de-settings-resolvedcomment");

            if (!value || !resolved) {
                (mode === 'show') ? this.api.asc_showComments(true) : ((value) ? this.api.asc_showComments(resolved) : this.api.asc_hideComments());
            }

            if (mode === 'show') {
                this.getApplication().getController('Common.Controllers.Comments').onAfterShow();
            }
                $(this.leftMenu.btnComments.el).blur();
        },
        /** coauthoring end **/

        aboutShowHide: function(value) {
            if (this.api)
                this.api.asc_enableKeyEvents(value);
            if (value) $(this.leftMenu.btnAbout.el).blur();
            if (value && this.leftMenu._state.pluginIsRunning) {
                this.leftMenu.panelPlugins.show();
                if (this.mode.canCoAuthoring) {
                    this.mode.canViewComments && this.leftMenu.panelComments['hide']();
                    this.mode.canChat && this.leftMenu.panelChat['hide']();
                }
            }
        },

        menuFilesShowHide: function(state) {
            (state === 'hide') && Common.NotificationCenter.trigger('menu:hide');
        },

        onMenuChange: function (value) {
            if ('hide' === value) {
                if (this.api) {
                    if (this.leftMenu.btnComments.isActive()) {
                        this.leftMenu.btnComments.toggle(false);
                        this.leftMenu.onBtnMenuClick(this.leftMenu.btnComments);
                        // focus to sdk
                        this.api.asc_enableKeyEvents(true);
                    } else if (this.leftMenu.btnThumbnails.isActive()) {
                        this.leftMenu.btnThumbnails.toggle(false);
                        this.leftMenu.panelThumbnails.hide();
                        this.leftMenu.onBtnMenuClick(this.leftMenu.btnThumbnails);
                    } else if (this.leftMenu.btnSearchBar.isActive()) {
                        this.leftMenu.btnSearchBar.toggle(false);
                        this.leftMenu.onBtnMenuClick(this.leftMenu.btnSearchBar);
                    }
                    else if (this.leftMenu.btnNavigation.isActive()) {
                        this.leftMenu.btnNavigation.toggle(false);
                        this.leftMenu.panelNavigation.hide();
                        this.leftMenu.onBtnMenuClick(this.leftMenu.btnNavigation);
                    }
                    else if (this.leftMenu.btnChat.isActive()) {
                        this.leftMenu.btnChat.toggle(false);
                        this.leftMenu.onBtnMenuClick(this.leftMenu.btnChat);
                    }
                }
            }
        },

        onShortcut: function(s, e) {
            if (!this.mode) return;

            switch (s) {
                case 'replace':
                case 'search':
                    this.leftMenu.btnAbout.toggle(false);
                    Common.UI.Menu.Manager.hideAll();
                    var selectedText = this.api.asc_GetSelectedText();
                    if (this.isSearchPanelVisible()) {
                        selectedText && this.leftMenu.panelSearch.setFindText(selectedText);
                        this.leftMenu.panelSearch.focus(selectedText !== '' ? s : 'search');
                        this.leftMenu.fireEvent('search:aftershow', selectedText ? [selectedText] : undefined);
                        return false;
                    } else if (this.getApplication().getController('Viewport').isSearchBarVisible()) {
                        var viewport = this.getApplication().getController('Viewport');
                        if (s === 'replace') {
                            viewport.header.btnSearch.toggle(false);
                            this.onShowHideSearch(true, viewport.searchBar.inputSearch.val());
                        } else {
                            selectedText && viewport.searchBar.setText(selectedText);
                            viewport.searchBar.focus();
                            return false;
                        }
                    } else if (s === 'search') {
                        Common.NotificationCenter.trigger('search:show');
                        return false;
                    } else {
                        this.onShowHideSearch(true, selectedText ? selectedText : undefined);
                    }
                    this.leftMenu.btnSearchBar.toggle(true,true);
                    this.leftMenu.panelSearch.focus(selectedText ? s : 'search');
                    // this.leftMenu.menuFile.hide();
                    return false;
                case 'save':
                    if (this.mode.canDownload || this.mode.canDownloadOrigin) {
                        if (this.mode.isDesktopApp && this.mode.isOffline) this.api.asc_DownloadAs();
                        else {
                            if (this.mode.canDownload) {
                                Common.UI.Menu.Manager.hideAll();
                                this.leftMenu.showMenu('file:saveas');
                            } else
                                this.api.asc_DownloadOrigin();
                        }
                    }
                    return false;
                case 'help':
                    if ( this.mode.canHelp ) {                   // TODO: unlock 'help' for 'view' mode
                        Common.UI.Menu.Manager.hideAll();
                        this.showHelp();
                    }
                    return false;
                case 'file':
                    Common.UI.Menu.Manager.hideAll();
                    this.leftMenu.showMenu('file');
                    return false;
                case 'escape':
//                        if (!this.leftMenu.isOpened()) return true;
                    var btnSearch = this.getApplication().getController('Viewport').header.btnSearch;
                    btnSearch.pressed && btnSearch.toggle(false);

                    if ( this.leftMenu.menuFile.isVisible() ) {
                        if (Common.UI.HintManager.needCloseFileMenu())
                            this.leftMenu.menuFile.hide();
                        return false;
                    }

                    var statusbar = DE.getController('Statusbar');
                    var menu_opened = statusbar.statusbar.$el.find('.open > [data-toggle="dropdown"]');
                    if (menu_opened.length) {
                        $.fn.dropdown.Constructor.prototype.keydown.call(menu_opened[0], e);
                        return false;
                    }
                    if (this.mode.canPlugins && this.leftMenu.panelPlugins) {
                        menu_opened = this.leftMenu.panelPlugins.$el.find('#menu-plugin-container.open > [data-toggle="dropdown"]');
                        if (menu_opened.length) {
                            $.fn.dropdown.Constructor.prototype.keydown.call(menu_opened[0], e);
                            return false;
                        }
                    }
                    if (this.leftMenu.btnAbout.pressed) {
                        if (!Common.UI.HintManager.isHintVisible()) {
                            this.leftMenu.close();
                            Common.NotificationCenter.trigger('layout:changed', 'leftmenu');
                        }
                        return false;
                    }
                    break;
            /** coauthoring begin **/
                case 'chat':
                    if (this.mode.canCoAuthoring && this.mode.canChat && !this.mode.isLightVersion) {
                        Common.UI.Menu.Manager.hideAll();
                        this.leftMenu.showMenu('chat');
                    }
                    return false;
                case 'comments':
                    if (this.mode.canCoAuthoring && this.mode.canViewComments && !this.mode.isLightVersion) {
                        Common.UI.Menu.Manager.hideAll();
                        this.leftMenu.showMenu('comments');
                        this.getApplication().getController('Common.Controllers.Comments').onAfterShow();
                    }
                    return false;
            /** coauthoring end **/
            }
        },

        showHistory: function() {
            if (!this.mode.wopi) {
                var maincontroller = DE.getController('Main');
                if (!maincontroller.loadMask)
                    maincontroller.loadMask = new Common.UI.LoadMask({owner: $('#viewport')});
                maincontroller.loadMask.setTitle(this.textLoadHistory);
                maincontroller.loadMask.show();
            }
            Common.Gateway.requestHistory();
        },

        onShowHideChat: function(state) {
            if (this.mode.canCoAuthoring && this.mode.canChat && !this.mode.isLightVersion) {
                if (state) {
                    Common.UI.Menu.Manager.hideAll();
                    this.tryToShowLeftMenu();
                    this.leftMenu.showMenu('chat');
                } else {
                    this.leftMenu.btnChat.toggle(false, true);
                    this.leftMenu.onBtnMenuClick(this.leftMenu.btnChat);
                }
            }
        },

        onShowHideNavigation: function(state) {
            if (state) {
                Common.UI.Menu.Manager.hideAll();
                this.tryToShowLeftMenu();
                this.leftMenu.showMenu('navigation');
            } else {
                this.leftMenu.btnNavigation.toggle(false, true);
                this.leftMenu.onBtnMenuClick(this.leftMenu.btnNavigation);
            }
        },

        onShowHideSearch: function (state, findText) {
            if (state) {
                Common.UI.Menu.Manager.hideAll();
                this.tryToShowLeftMenu();
                this.leftMenu.showMenu('advancedsearch', undefined, true);
                this.leftMenu.fireEvent('search:aftershow', [findText]);
            } else {
                this.leftMenu.btnSearchBar.toggle(false, true);
                this.leftMenu.onBtnMenuClick(this.leftMenu.btnSearchBar);
            }
        },

        onMenuSearchBar: function(obj, show) {
            if (show) {
                var mode = this.mode.isEdit && !this.viewmode ? undefined : 'no-replace';
                this.leftMenu.panelSearch.setSearchMode(mode);
            }
        },

        isSearchPanelVisible: function () {
            return this.leftMenu && this.leftMenu.panelSearch && this.leftMenu.panelSearch.isVisible();
        },

        isCommentsVisible: function() {
            return this.leftMenu && this.leftMenu.panelComments && this.leftMenu.panelComments.isVisible();
        },

        onChangeProtectDocument: function(props) {
            if (!props) {
                var docprotect = this.getApplication().getController('DocProtection');
                props = docprotect ? docprotect.getDocProps() : null;
            }
            if (props) {
                this._state.docProtection = props;
                this.updatePreviewMode();
            }
        },

        onLeftMenuHide: function (view, status) {
            if (this.leftMenu) {
                !status && this.leftMenu.close();
                status ? this.leftMenu.show() : this.leftMenu.hide();
                Common.localStorage.setBool('de-hidden-leftmenu', !status);

                !view && this.leftMenu.fireEvent('view:hide', [this, !status]);
            }

            Common.NotificationCenter.trigger('layout:changed', 'main');
            Common.NotificationCenter.trigger('edit:complete', this.leftMenu);
        },

        tryToShowLeftMenu: function() {
            if ((!this.mode.canBrandingExt || !this.mode.customization || this.mode.customization.leftMenu !== false) && Common.UI.LayoutManager.isElementVisible('leftMenu'))
                this.onLeftMenuHide(null, true);
        },

        showHelp: function(src) {
            this.leftMenu && this.leftMenu.showMenu('file:help', src);
        },

        textNoTextFound         : 'Text not found',
        newDocumentTitle        : 'Unnamed document',
        requestEditRightsText   : 'Requesting editing rights...',
        textReplaceSuccess      : 'Search has been done. {0} occurrences have been replaced',
        textReplaceSkipped      : 'The replacement has been made. {0} occurrences were skipped.',
        textLoadHistory         : 'Loading version history...',
        notcriticalErrorTitle: 'Warning',
        leavePageText: 'All unsaved changes in this document will be lost.<br> Click \'Cancel\' then \'Save\' to save them. Click \'OK\' to discard all the unsaved changes.',
        warnDownloadAs          : 'If you continue saving in this format all features except the text will be lost.<br>Are you sure you want to continue?',
        warnDownloadAsRTF       : 'If you continue saving in this format some of the formatting might be lost.<br>Are you sure you want to continue?',
        txtUntitled: 'Untitled',
        txtCompatible: 'The document will be saved to the new format. It will allow to use all the editor features, but might affect the document layout.<br>Use the \'Compatibility\' option of the advanced settings if you want to make the files compatible with older MS Word versions.',
        warnDownloadAsPdf: 'Your {0} will be converted to an editable format. This may take a while. The resulting document will be optimized to allow you to edit the text, so it might not look exactly like the original {0}, especially if the original file contained lots of graphics.',
        warnReplaceString: '{0} is not a valid special character for the Replace With box.',
        textSelectPath: 'Enter a new name for saving the file copy'

    }, DE.Controllers.LeftMenu || {}));
});