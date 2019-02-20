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
 *    LeftMenu.js
 *
 *    Controller
 *
 *    Created by Maxim Kadushkin on 19 February 2014
 *    Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'common/main/lib/util/Shortcuts',
    'common/main/lib/view/SaveAsDlg',
    'documenteditor/main/app/view/LeftMenu',
    'documenteditor/main/app/view/FileMenu'
], function () {
    'use strict';

    DE.Controllers.LeftMenu = Backbone.Controller.extend(_.extend({
        views: [
            'LeftMenu',
            'FileMenu'
        ],

        initialize: function() {

            this.addListeners({
                'Common.Views.Chat': {
                    'hide': _.bind(this.onHideChat, this)
                },
                'Common.Views.Header': {
                    'click:users': _.bind(this.clickStatusbarUsers, this),
                    'file:settings': _.bind(this.clickToolbarSettings,this),
                    'history:show': function () {
                        if ( !this.leftMenu.panelHistory.isVisible() )
                            this.clickMenuFileItem('header', 'history');
                    }.bind(this)
                },
                'Common.Views.About': {
                    'show':    _.bind(this.aboutShowHide, this, false),
                    'hide':    _.bind(this.aboutShowHide, this, true)
                },
                'Common.Views.Plugins': {
                    'plugin:open': _.bind(this.onPluginOpen, this),
                    'hide':        _.bind(this.onHidePlugins, this)
                },
                'LeftMenu': {
                    'comments:show': _.bind(this.commentsShowHide, this, 'show'),
                    'comments:hide': _.bind(this.commentsShowHide, this, 'hide')
                },
                'FileMenu': {
                    'menu:hide': _.bind(this.menuFilesShowHide, this, 'hide'),
                    'menu:show': _.bind(this.menuFilesShowHide, this, 'show'),
                    'item:click': _.bind(this.clickMenuFileItem, this),
                    'saveas:format': _.bind(this.clickSaveAsFormat, this),
                    'savecopy:format': _.bind(this.clickSaveCopyAsFormat, this),
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
                'SearchDialog': {
                    'hide': _.bind(this.onSearchDlgHide, this),
                    'search:back': _.bind(this.onQuerySearch, this, 'back'),
                    'search:next': _.bind(this.onQuerySearch, this, 'next'),
                    'search:replace': _.bind(this.onQueryReplace, this),
                    'search:replaceall': _.bind(this.onQueryReplaceAll, this),
                    'search:highlight': _.bind(this.onSearchHighlight, this)
                },
                'Common.Views.ReviewChanges': {
                    'collaboration:chat': _.bind(this.onShowHideChat, this)
                }
            });

            Common.NotificationCenter.on('leftmenu:change', _.bind(this.onMenuChange, this));
            Common.NotificationCenter.on('app:comment:add', _.bind(this.onAppAddComment, this));
            Common.NotificationCenter.on('collaboration:history', _.bind(function () {
                if ( !this.leftMenu.panelHistory.isVisible() )
                    this.clickMenuFileItem(null, 'history');
            }, this));
        },

        onLaunch: function() {
            this.leftMenu = this.createView('LeftMenu').render();
            this.leftMenu.btnSearch.on('toggle', _.bind(this.onMenuSearch, this));

            Common.util.Shortcuts.delegateShortcuts({
                shortcuts: {
                    'command+shift+s,ctrl+shift+s': _.bind(this.onShortcut, this, 'save'),
                    'command+f,ctrl+f': _.bind(this.onShortcut, this, 'search'),
                    'ctrl+h': _.bind(this.onShortcut, this, 'replace'),
                    'alt+f': _.bind(this.onShortcut, this, 'file'),
                    'esc': _.bind(this.onShortcut, this, 'escape'),
                    /** coauthoring begin **/
                    'alt+q': _.bind(this.onShortcut, this, 'chat'),
                    'command+shift+h,ctrl+shift+h': _.bind(this.onShortcut, this, 'comments'),
                    /** coauthoring end **/
                    'f1': _.bind(this.onShortcut, this, 'help')
                }
            });

            Common.util.Shortcuts.suspendEvents();
        },

        setApi: function(api) {
            this.api = api;
            this.api.asc_registerCallback('asc_onReplaceAll', _.bind(this.onApiTextReplaced, this));
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
                        if (collection.at(i).get('userid') !== this.mode.user.id && (resolved || !collection.at(i).get('resolved'))) {
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
            return this;
        },

        setMode: function(mode) {
            this.mode = mode;
            this.leftMenu.setMode(mode);
            this.leftMenu.getMenu('file').setMode(mode);

            if (!mode.isEdit)  // TODO: unlock 'save as', 'open file menu' for 'view' mode
                Common.util.Shortcuts.removeShortcuts({
                    shortcuts: {
                        'command+shift+s,ctrl+shift+s': _.bind(this.onShortcut, this, 'save'),
                        'alt+f': _.bind(this.onShortcut, this, 'file')
                    }
                });

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

            this.mode.trialMode && this.leftMenu.setDeveloperMode(this.mode.trialMode);

            Common.util.Shortcuts.resumeEvents();
            return this;
        },

        enablePlugins: function() {
            if (this.mode.canPlugins) {
                // this.leftMenu.btnPlugins.show();
                this.leftMenu.setOptionsPanel('plugins', this.getApplication().getController('Common.Controllers.Plugins').getView('Common.Views.Plugins'));
            } else
                this.leftMenu.btnPlugins.hide();
            this.mode.trialMode && this.leftMenu.setDeveloperMode(this.mode.trialMode);
        },

        clickMenuFileItem: function(menu, action, isopts) {
            var close_menu = true;
            switch (action) {
            case 'back':
                break;
            case 'save': this.api.asc_Save(); break;
            case 'save-desktop': this.api.asc_DownloadAs(); break;
            case 'saveas':
                if ( isopts ) close_menu = false;
                else this.clickSaveAsFormat(undefined);
                break;
            case 'save-copy':
                if ( isopts ) close_menu = false;
                else this.clickSaveCopyAsFormat(undefined);
                break;
            case 'print': this.api.asc_Print(Common.Utils.isChrome || Common.Utils.isSafari || Common.Utils.isOpera); break;
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
                    handler: function(result, value) {
                        if (result == 'ok' && !_.isEmpty(value.trim()) && documentCaption !== value.trim()) {
                            Common.Gateway.requestRename(value);
                        }
                        Common.NotificationCenter.trigger('edit:complete', me);
                    }
                })).show();
                break;
            default: close_menu = false;
            }

            if (close_menu && menu) {
                menu.hide();
            }
        },

        clickSaveAsFormat: function(menu, format) {
            if (menu) {
                if (format == Asc.c_oAscFileType.TXT || format == Asc.c_oAscFileType.RTF) {
                    Common.UI.warning({
                        closable: false,
                        title: this.notcriticalErrorTitle,
                        msg: (format == Asc.c_oAscFileType.TXT) ? this.warnDownloadAs : this.warnDownloadAsRTF,
                        buttons: ['ok', 'cancel'],
                        callback: _.bind(function(btn){
                            if (btn == 'ok') {
                                this.api.asc_DownloadAs(format);
                                menu.hide();
                            }
                        }, this)
                    });
                } else {
                    this.api.asc_DownloadAs(format);
                    menu.hide();
                }
            } else
                this.api.asc_DownloadOrigin();
        },

        clickSaveCopyAsFormat: function(menu, format, ext) {
            if (menu) {
                if (format == Asc.c_oAscFileType.TXT || format == Asc.c_oAscFileType.RTF) {
                    Common.UI.warning({
                        closable: false,
                        title: this.notcriticalErrorTitle,
                        msg: (format == Asc.c_oAscFileType.TXT) ? this.warnDownloadAs : this.warnDownloadAsRTF,
                        buttons: ['ok', 'cancel'],
                        callback: _.bind(function(btn){
                            if (btn == 'ok') {
                                this.isFromFileDownloadAs = ext;
                                this.api.asc_DownloadAs(format, true);
                                menu.hide();
                            }
                        }, this)
                    });
                } else {
                    this.isFromFileDownloadAs = ext;
                    this.api.asc_DownloadAs(format, true);
                    menu.hide();
                }
            } else {
                this.isFromFileDownloadAs = true;
                this.api.asc_DownloadOrigin(true);
            }
        },

        onDownloadUrl: function(url) {
            if (this.isFromFileDownloadAs) {
                var me = this,
                    defFileName = this.getApplication().getController('Viewport').getView('Common.Views.Header').getDocumentCaption();
                !defFileName && (defFileName = me.txtUntitled);

                if (typeof this.isFromFileDownloadAs == 'string') {
                    var idx = defFileName.lastIndexOf('.');
                    if (idx>0)
                        defFileName = defFileName.substring(0, idx) + this.isFromFileDownloadAs;
                }

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
            this.isFromFileDownloadAs = false;
        },

        applySettings: function(menu) {
            var value;

            value = Common.localStorage.getBool("de-settings-inputmode");
            Common.Utils.InternalSettings.set("de-settings-inputmode", value);
            this.api.SetTextBoxInputMode(value);

            /** coauthoring begin **/
            if (this.mode.isEdit && !this.mode.isOffline && this.mode.canCoAuthoring) {
                var fast_coauth = Common.localStorage.getBool("de-settings-coauthmode", true);
                Common.Utils.InternalSettings.set("de-settings-coauthmode", fast_coauth);
                this.api.asc_SetFastCollaborative(fast_coauth);

                value = Common.localStorage.getItem((fast_coauth) ? "de-settings-showchanges-fast" : "de-settings-showchanges-strict");
                Common.Utils.InternalSettings.set((fast_coauth) ? "de-settings-showchanges-fast" : "de-settings-showchanges-strict", value);
                switch(value) {
                case 'all': value = Asc.c_oAscCollaborativeMarksShowType.All; break;
                case 'none': value = Asc.c_oAscCollaborativeMarksShowType.None; break;
                case 'last': value = Asc.c_oAscCollaborativeMarksShowType.LastChanges; break;
                default: value = (fast_coauth) ? Asc.c_oAscCollaborativeMarksShowType.None : Asc.c_oAscCollaborativeMarksShowType.LastChanges;
                }
                this.api.SetCollaborativeMarksShowType(value);
            }

            value = Common.localStorage.getBool("de-settings-livecomment", true);
            Common.Utils.InternalSettings.set("de-settings-livecomment", value);
            var resolved = Common.localStorage.getBool("de-settings-resolvedcomment");
            Common.Utils.InternalSettings.set("de-settings-resolvedcomment", resolved);
            if (this.mode.canViewComments && this.leftMenu.panelComments.isVisible())
                value = resolved = true;
            (value) ? this.api.asc_showComments(resolved) : this.api.asc_hideComments();
            /** coauthoring end **/

            value = Common.localStorage.getItem("de-settings-fontrender");
            Common.Utils.InternalSettings.set("de-settings-fontrender", value);
            switch (value) {
            case '1':     this.api.SetFontRenderingMode(1); break;
            case '2':     this.api.SetFontRenderingMode(2); break;
            case '0':     this.api.SetFontRenderingMode(3); break;
            }

            if (this.mode.isEdit) {
                value = parseInt(Common.localStorage.getItem("de-settings-autosave"));
                Common.Utils.InternalSettings.set("de-settings-autosave", value);
                this.api.asc_setAutoSaveGap(value);

                value = Common.localStorage.getBool("de-settings-spellcheck", true);
                Common.Utils.InternalSettings.set("de-settings-spellcheck", value);
                this.api.asc_setSpellCheck(value);
            }

            this.api.put_ShowSnapLines(Common.Utils.InternalSettings.get("de-settings-showsnaplines"));

            menu.hide();
        },

        onCreateNew: function(menu, type) {
            var newDocumentPage = window.open(type == 'blank' ? this.mode.createUrl : type, "_blank");
            if (newDocumentPage) newDocumentPage.focus();

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

        changeToolbarSaveState: function (state) {
            var btnSave = this.leftMenu.menuFile.getButton('save');
            btnSave && btnSave.setDisabled(state);
        },

        /** coauthoring begin **/
        clickStatusbarUsers: function() {
            this.leftMenu.menuFile.panels['rights'].changeAccessRights();
        },

        onHideChat: function() {
            $(this.leftMenu.btnChat.el).blur();
            Common.NotificationCenter.trigger('layout:changed', 'leftmenu');
        },

        onHidePlugins: function() {
            Common.NotificationCenter.trigger('layout:changed', 'leftmenu');
        },
        /** coauthoring end **/

        onQuerySearch: function(d, w, opts) {
            if (opts.textsearch && opts.textsearch.length) {
                if (!this.api.asc_findText(opts.textsearch, d != 'back', opts.matchcase, opts.matchword)) {
                    var me = this;
                    Common.UI.info({
                        msg: this.textNoTextFound,
                        callback: function() {
                            me.dlgSearch.focus();
                        }
                    });
                }
            }
        },

        onQueryReplace: function(w, opts) {
            if (!_.isEmpty(opts.textsearch)) {
                if (!this.api.asc_replaceText(opts.textsearch, opts.textreplace, false, opts.matchcase, opts.matchword)) {
                    var me = this;
                    Common.UI.info({
                        msg: this.textNoTextFound,
                        callback: function() {
                            me.dlgSearch.focus();
                        }
                    });
                }
            }
        },

        onQueryReplaceAll: function(w, opts) {
            if (!_.isEmpty(opts.textsearch)) {
                this.api.asc_replaceText(opts.textsearch, opts.textreplace, true, opts.matchcase, opts.matchword);
            }
        },

        onSearchHighlight: function(w, highlight) {
            this.api.asc_selectSearchingResults(highlight);
        },

        showSearchDlg: function(show,action) {
            if ( !this.dlgSearch ) {
                this.dlgSearch = (new Common.UI.SearchDialog({
                    matchcase: true,
                    markresult: {applied: true}
                }));
            }

            if (show) {
                var mode = this.mode.isEdit && !this.viewmode ? (action || undefined) : 'no-replace';
                if (this.dlgSearch.isVisible()) {
                    this.dlgSearch.setMode(mode);
                    this.dlgSearch.setSearchText(this.api.asc_GetSelectedText());
                    this.dlgSearch.focus();
                } else {
                    this.dlgSearch.show(mode, this.api.asc_GetSelectedText());
                }
            } else this.dlgSearch['hide']();
        },

        onMenuSearch: function(obj, show) {
            this.showSearchDlg(show);
        },

        onSearchDlgHide: function() {
            this.leftMenu.btnSearch.toggle(false, true);
            this.api.asc_selectSearchingResults(false);
            $(this.leftMenu.btnSearch.el).blur();
            this.api.asc_enableKeyEvents(true);
        },

        onApiTextReplaced: function(found,replaced) {
            var me = this;
            if (found) {
                !(found - replaced > 0) ?
                    Common.UI.info( {msg: Common.Utils.String.format(this.textReplaceSuccess, replaced)} ) :
                    Common.UI.warning( {msg: Common.Utils.String.format(this.textReplaceSkipped, found-replaced)} );
            } else {
                Common.UI.info({msg: this.textNoTextFound});
            }
        },

        onApiServerDisconnect: function(enableDownload) {
            this.mode.isEdit = false;
            this.leftMenu.close();

            /** coauthoring begin **/
            this.leftMenu.btnComments.setDisabled(true);
            this.leftMenu.btnChat.setDisabled(true);
            /** coauthoring end **/
            this.leftMenu.btnPlugins.setDisabled(true);
            this.leftMenu.btnNavigation.setDisabled(true);

            this.leftMenu.getMenu('file').setMode({isDisconnected: true, enableDownload: !!enableDownload});
            if ( this.dlgSearch ) {
                this.leftMenu.btnSearch.toggle(false, true);
                this.dlgSearch['hide']();
            }
        },

        setPreviewMode: function(mode) {
            if (this.viewmode === mode) return;
            this.viewmode = mode;

            this.dlgSearch && this.dlgSearch.setMode(this.viewmode ? 'no-replace' : 'search');
        },

        SetDisabled: function(disable, disableFileMenu) {
            this.mode.isEdit = !disable;
            if (disable) this.leftMenu.close();

            /** coauthoring begin **/
            this.leftMenu.btnComments.setDisabled(disable);
            var comments = this.getApplication().getController('Common.Controllers.Comments');
            if (comments)
                comments.setPreviewMode(disable);
            this.setPreviewMode(disable);
            this.leftMenu.btnChat.setDisabled(disable);
            /** coauthoring end **/
            this.leftMenu.btnPlugins.setDisabled(disable);
            this.leftMenu.btnNavigation.setDisabled(disable);
            if (disableFileMenu) this.leftMenu.getMenu('file').SetDisabled(disable);
        },

        /** coauthoring begin **/
        onApiChatMessage: function() {
            this.leftMenu.markCoauthOptions('chat');
        },

        onApiAddComment: function(id, data) {
            var resolved = Common.Utils.InternalSettings.get("de-settings-resolvedcomment");
            if (data && data.asc_getUserId() !== this.mode.user.id && (resolved || !data.asc_getSolved()))
                this.leftMenu.markCoauthOptions('comments');
        },

        onApiAddComments: function(data) {
            var resolved = Common.Utils.InternalSettings.get("de-settings-resolvedcomment");
            for (var i = 0; i < data.length; ++i) {
                if (data[i].asc_getUserId() !== this.mode.user.id && (resolved || !data[i].asc_getSolved())) {
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
            if ( this.dlgSearch ) {
                if ( state == 'show' )
                    this.dlgSearch.suspendKeyEvents();
                else
                    Common.Utils.asyncCall(this.dlgSearch.resumeKeyEvents, this.dlgSearch);
            }
            if (this.api && state == 'hide')
                this.api.asc_enableKeyEvents(true);
        },

        onMenuChange: function (value) {
            if ('hide' === value) {
                if (this.leftMenu.btnComments.isActive() && this.api) {
                    this.leftMenu.btnComments.toggle(false);
                    this.leftMenu.onBtnMenuClick(this.leftMenu.btnComments);

                    // focus to sdk
                    this.api.asc_enableKeyEvents(true);
                }
            }
        },

        onShortcut: function(s, e) {
            if (!this.mode) return;

            switch (s) {
                case 'replace':
                case 'search':
                    Common.UI.Menu.Manager.hideAll();
                    this.showSearchDlg(true,s);
                    this.leftMenu.btnSearch.toggle(true,true);
                    this.leftMenu.btnAbout.toggle(false);
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
                    if ( this.mode.isEdit && this.mode.canHelp ) {                   // TODO: unlock 'help' for 'view' mode
                        Common.UI.Menu.Manager.hideAll();
                        this.leftMenu.showMenu('file:help');
                    }
                    return false;
                case 'file':
                    Common.UI.Menu.Manager.hideAll();
                    this.leftMenu.showMenu('file');
                    return false;
                case 'escape':
//                        if (!this.leftMenu.isOpened()) return true;
                    if ( this.leftMenu.menuFile.isVisible() ) {
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
                    if (this.leftMenu.btnAbout.pressed || this.leftMenu.btnPlugins.pressed ||
                                $(e.target).parents('#left-menu').length ) {
                        this.leftMenu.close();
                        Common.NotificationCenter.trigger('layout:changed', 'leftmenu');
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

        onPluginOpen: function(panel, type, action) {
            if ( type == 'onboard' ) {
                if ( action == 'open' ) {
                    this.leftMenu.close();
                    this.leftMenu.panelPlugins.show();
                    this.leftMenu.onBtnMenuClick({pressed:true, options: {action: 'plugins'}});
                    this.leftMenu._state.pluginIsRunning = true;
                } else {
                    this.leftMenu._state.pluginIsRunning = false;
                    this.leftMenu.close();
                }
            }
        },

        showHistory: function() {
            var maincontroller = DE.getController('Main');
            if (!maincontroller.loadMask)
                maincontroller.loadMask = new Common.UI.LoadMask({owner: $('#viewport')});
            maincontroller.loadMask.setTitle(this.textLoadHistory);
            maincontroller.loadMask.show();
            Common.Gateway.requestHistory();
        },

        onShowHideChat: function(state) {
            if (this.mode.canCoAuthoring && this.mode.canChat && !this.mode.isLightVersion) {
                if (state) {
                    Common.UI.Menu.Manager.hideAll();
                    this.leftMenu.showMenu('chat');
                } else {
                    this.leftMenu.btnChat.toggle(false, true);
                    this.leftMenu.onBtnMenuClick(this.leftMenu.btnChat);
                }
            }
        },

        textNoTextFound         : 'Text not found',
        newDocumentTitle        : 'Unnamed document',
        requestEditRightsText   : 'Requesting editing rights...',
        textReplaceSuccess      : 'Search has been done. {0} occurrences have been replaced',
        textReplaceSkipped      : 'The replacement has been made. {0} occurrences were skipped.',
        textLoadHistory         : 'Loading versions history...',
        notcriticalErrorTitle: 'Warning',
        leavePageText: 'All unsaved changes in this document will be lost.<br> Click \'Cancel\' then \'Save\' to save them. Click \'OK\' to discard all the unsaved changes.',
        warnDownloadAs          : 'If you continue saving in this format all features except the text will be lost.<br>Are you sure you want to continue?',
        warnDownloadAsRTF       : 'If you continue saving in this format some of the formatting might be lost.<br>Are you sure you want to continue?',
        txtUntitled: 'Untitled'
    }, DE.Controllers.LeftMenu || {}));
});