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
 *    Created by Maxim Kadushkin on 10 April 2014
 *    Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'common/main/lib/util/Shortcuts',
    'common/main/lib/view/SaveAsDlg',
    'presentationeditor/main/app/view/LeftMenu',
    'presentationeditor/main/app/view/FileMenu'
], function () {
    'use strict';

    PE.Controllers.LeftMenu = Backbone.Controller.extend(_.extend({
        views: [
            'LeftMenu',
            'FileMenu'
        ],

        initialize: function() {
            this._state = { no_slides: undefined };
            this.addListeners({
                'Common.Views.Chat': {
                    'hide': _.bind(this.onHideChat, this)
                },
                'Common.Views.Header': {
                    'file:settings': _.bind(this.clickToolbarSettings,this),
                    'click:users': _.bind(this.clickStatusbarUsers, this)
                },
                'Common.Views.Plugins': {
                    'plugin:open': _.bind(this.onPluginOpen, this),
                    'hide':        _.bind(this.onHidePlugins, this)
                },
                'Common.Views.About': {
                    'show':    _.bind(this.aboutShowHide, this, false),
                    'hide':    _.bind(this.aboutShowHide, this, true)
                },
                'LeftMenu': {
                    'panel:show':    _.bind(this.menuExpand, this),
                    'comments:show': _.bind(this.commentsShowHide, this, 'show'),
                    'comments:hide': _.bind(this.commentsShowHide, this, 'hide')
                },
                'FileMenu': {
                    'menu:hide': _.bind(this.menuFilesShowHide, this, 'hide'),
                    'menu:show': _.bind(this.menuFilesShowHide, this, 'show'),
                    'filemenu:hide': _.bind(this.menuFilesHide, this),
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
                    'save:disabled' : this.changeToolbarSaveState.bind(this)
                },
                'SearchDialog': {
                    'hide': _.bind(this.onSearchDlgHide, this),
                    'search:back': _.bind(this.onQuerySearch, this, 'back'),
                    'search:next': _.bind(this.onQuerySearch, this, 'next'),
                    'search:replace': _.bind(this.onQueryReplace, this),
                    'search:replaceall': _.bind(this.onQueryReplaceAll, this)
                },
                'Common.Views.ReviewChanges': {
                    'collaboration:chat': _.bind(this.onShowHideChat, this)
                }
            });
            Common.NotificationCenter.on('leftmenu:change', _.bind(this.onMenuChange, this));
        },

        onLaunch: function() {
            this.leftMenu = this.createView('LeftMenu').render();
            this.leftMenu.btnSearch.on('toggle', _.bind(this.onMenuSearch, this));
            this.leftMenu.btnThumbs.on('toggle', _.bind(this.onShowTumbnails, this));
            this.isThumbsShown = true;

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
            this.api.asc_registerCallback('asc_onThumbnailsShow',        _.bind(this.onThumbnailsShow, this));
            this.api.asc_registerCallback('asc_onCoAuthoringDisconnect', _.bind(this.onApiServerDisconnect, this));
            Common.NotificationCenter.on('api:disconnect',               _.bind(this.onApiServerDisconnect, this));
            this.api.asc_registerCallback('asc_onDownloadUrl',           _.bind(this.onDownloadUrl, this));
            this.api.asc_registerCallback('asc_onReplaceAll', _.bind(this.onApiTextReplaced, this));
            /** coauthoring begin **/
            if (this.mode.canCoAuthoring) {
                if (this.mode.canChat)
                    this.api.asc_registerCallback('asc_onCoAuthoringChatReceiveMessage', _.bind(this.onApiChatMessage, this));
                if (this.mode.canComments) {
                    this.api.asc_registerCallback('asc_onAddComment', _.bind(this.onApiAddComment, this));
                    this.api.asc_registerCallback('asc_onAddComments', _.bind(this.onApiAddComments, this));
                    var collection = this.getApplication().getCollection('Common.Collections.Comments');
                    for (var i = 0; i < collection.length; ++i) {
                        if (collection.at(i).get('userid') !== this.mode.user.id) {
                            this.leftMenu.markCoauthOptions('comments', true);
                            break;
                        }
                    }
                }
            }
            /** coauthoring end **/
            this.api.asc_registerCallback('asc_onCountPages',            _.bind(this.onApiCountPages, this));
            this.onApiCountPages(this.api.getCountPages());
            this.leftMenu.getMenu('file').setApi(api);
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
                    this.leftMenu.setOptionsPanel('comment', this.getApplication().getController('Common.Controllers.Comments').getView('Common.Views.Comments'));

                this.leftMenu.btnChat[(this.mode.canChat && !this.mode.isLightVersion) ? 'show' : 'hide']();
                if (this.mode.canChat)
                    this.leftMenu.setOptionsPanel('chat', this.getApplication().getController('Common.Controllers.Chat').getView('Common.Views.Chat'));
            } else {
                this.leftMenu.btnChat.hide();
                this.leftMenu.btnComments.hide();
            }
            this.mode.trialMode && this.leftMenu.setDeveloperMode(this.mode.trialMode);
            /** coauthoring end **/
            Common.util.Shortcuts.resumeEvents();
            this.leftMenu.btnThumbs.toggle(true);
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
            case 'back': break;
            case 'save': this.api.asc_Save(); break;
            case 'save-desktop': this.api.asc_DownloadAs(); break;
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

            if (close_menu) {
                menu.hide();
            }
        },

        clickSaveAsFormat: function(menu, format) {
            this.api.asc_DownloadAs(format);
            menu.hide();
        },

        clickSaveCopyAsFormat: function(menu, format, ext) {
            this.isFromFileDownloadAs = ext;
            this.api.asc_DownloadAs(format, true);
            menu.hide();
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
            var value = Common.localStorage.getBool("pe-settings-inputmode");
            Common.Utils.InternalSettings.set("pe-settings-inputmode", value);
            this.api.SetTextBoxInputMode(value);

            /** coauthoring begin **/
            if (this.mode.isEdit && !this.mode.isOffline && this.mode.canCoAuthoring) {
                value = Common.localStorage.getBool("pe-settings-coauthmode", true);
                Common.Utils.InternalSettings.set("pe-settings-coauthmode", value);
                this.api.asc_SetFastCollaborative(value);
            }
            /** coauthoring end **/

            value = Common.localStorage.getItem("pe-settings-fontrender");
            Common.Utils.InternalSettings.set("pe-settings-fontrender", value);
            this.api.SetFontRenderingMode(parseInt(value));

            if (this.mode.isEdit) {
                value = parseInt(Common.localStorage.getItem("pe-settings-autosave"));
                Common.Utils.InternalSettings.set("pe-settings-autosave", value);
                this.api.asc_setAutoSaveGap(value);

                value = Common.localStorage.getBool("pe-settings-spellcheck", true);
                Common.Utils.InternalSettings.set("pe-settings-spellcheck", value);
                this.api.asc_setSpellCheck(value);
            }

            this.api.put_ShowSnapLines(Common.Utils.InternalSettings.get("pe-settings-showsnaplines"));

            menu.hide();
        },

        onCreateNew: function(menu, type) {
            if (this.mode.nativeApp === true) {
                this.api.OpenNewDocument(type == 'blank' ? '' : type);
            } else {
                var newDocumentPage = window.open(type == 'blank' ? this.mode.createUrl : type, "_blank");
                if (newDocumentPage) newDocumentPage.focus();
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
                this.leftMenu.menuFile.show(); else
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
                if (!this.api.findText(opts.textsearch, d != 'back', opts.matchcase)) {
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
                if (!this.api.asc_replaceText(opts.textsearch, opts.textreplace, false, opts.matchcase)) {
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
                this.api.asc_replaceText(opts.textsearch, opts.textreplace, true, opts.matchcase);
            }
        },

        showSearchDlg: function(show,action) {
            if ( !this.dlgSearch ) {
                this.dlgSearch = (new Common.UI.SearchDialog({
                    matchcase: true
                }));
            }

            if (show) {
                var mode = this.mode.isEdit && !this.viewmode ? (action || undefined) : 'no-replace';
                if (this.dlgSearch.isVisible()) {
                    this.dlgSearch.setMode(mode);
                    this.dlgSearch.focus();
                } else {
                    this.dlgSearch.show(mode);
                }
            } else this.dlgSearch['hide']();
        },

        onMenuSearch: function(obj, show) {
            this.showSearchDlg(show);
        },

        onShowTumbnails: function(obj, show) {
            this.api.ShowThumbnails(show);

        },

        onThumbnailsShow: function(isShow) {
            if (isShow && !this.isThumbsShown) {
                this.leftMenu.btnThumbs.toggle(true, false);
            } else if (!isShow && this.isThumbsShown)
                this.leftMenu.btnThumbs.toggle(false, false);
            this.isThumbsShown = isShow;
        },

        onSearchDlgHide: function() {
            this.leftMenu.btnSearch.toggle(false, true);
            $(this.leftMenu.btnSearch.el).blur();
            this.api.asc_enableKeyEvents(true);
//            this.api.asc_selectSearchingResults(false);
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

        setPreviewMode: function(mode) {
            if (this.viewmode === mode) return;
            this.viewmode = mode;

            this.dlgSearch && this.dlgSearch.setMode(this.viewmode ? 'no-replace' : 'search');
        },

        onApiServerDisconnect: function(enableDownload) {
            this.mode.isEdit = false;
            this.leftMenu.close();

            /** coauthoring begin **/
            this.leftMenu.btnComments.setDisabled(true);
            this.leftMenu.btnChat.setDisabled(true);
            /** coauthoring end **/
            this.leftMenu.btnPlugins.setDisabled(true);

            this.leftMenu.getMenu('file').setMode({isDisconnected: true, enableDownload: !!enableDownload});
            if ( this.dlgSearch ) {
                this.leftMenu.btnSearch.toggle(false, true);
                this.dlgSearch['hide']();
            }
        },

        onApiCountPages: function(count) {
            if (this._state.no_slides !== (count<=0)) {
                this._state.no_slides = (count<=0);
                /** coauthoring begin **/
                this.leftMenu.btnComments && this.leftMenu.btnComments.setDisabled(this._state.no_slides);
                /** coauthoring end **/
                this.leftMenu.btnSearch && this.leftMenu.btnSearch.setDisabled(this._state.no_slides);
            }
        },

        menuExpand: function(obj, panel, show) {
            if (panel == 'thumbs') {
                this.isThumbsShown = show;
            } else {
                if (!show && this.isThumbsShown && !this.leftMenu._state.pluginIsRunning) {
                    this.leftMenu.btnThumbs.toggle(true, false);
                }
            }
        },

        menuFilesHide: function(obj) {
            // $(this.leftMenu.btnFile.el).blur();
        },

        /** coauthoring begin **/
        onApiChatMessage: function() {
            this.leftMenu.markCoauthOptions('chat');
        },

        onApiAddComment: function(id, data) {
            if (data && data.asc_getUserId() !== this.mode.user.id)
                this.leftMenu.markCoauthOptions('comments');
        },

        onApiAddComments: function(data) {
            for (var i = 0; i < data.length; ++i) {
                if (data[i].asc_getUserId() !== this.mode.user.id) {
                    this.leftMenu.markCoauthOptions('comments');
                    break;
                }
            }
        },

        commentsShowHide: function(mode) {
//            var value = Common.localStorage.getItem("pe-settings-livecomment");
//            if (value!==null && parseInt(value) == 0)
//                (mode=='show') ? this.api.asc_showComments() : this.api.asc_hideComments();

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
                this.leftMenu.$el.width(Common.localStorage.getItem('pe-mainmenu-width') || MENU_SCALE_PART);
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
        },

        onShortcut: function(s, e) {
            if (!this.mode) return;

            var previewPanel = PE.getController('Viewport').getView('DocumentPreview');

            switch (s) {
                case 'replace':
                case 'search':
                    if ((!previewPanel || !previewPanel.isVisible()) && !this._state.no_slides)  {
                        Common.UI.Menu.Manager.hideAll();
                        var full_menu_pressed = this.leftMenu.btnAbout.pressed;
                        this.showSearchDlg(true,s);
                        this.leftMenu.btnSearch.toggle(true,true);
                        this.leftMenu.btnAbout.toggle(false);
                        full_menu_pressed && this.menuExpand(this.leftMenu.btnAbout, 'files', false);
                    }
                    return false;
                case 'save':
                    if (this.mode.canDownload && (!previewPanel || !previewPanel.isVisible())){
                        if (this.mode.isDesktopApp && this.mode.isOffline) {
                            this.api.asc_DownloadAs();
                        } else {
                            Common.UI.Menu.Manager.hideAll();
                            this.leftMenu.showMenu('file:saveas');
                        }
                    }
                    return false;
                case 'help':
                    if ( this.mode.isEdit && this.mode.canHelp ) {                   // TODO: unlock 'help' panel for 'view' mode

                    if (!previewPanel || !previewPanel.isVisible()){
                        Common.UI.Menu.Manager.hideAll();
                        this.leftMenu.showMenu('file:help');
                    }

                    }
                    return false;
                case 'file':
                    if (!previewPanel || !previewPanel.isVisible()) {
                        Common.UI.Menu.Manager.hideAll();
                        this.leftMenu.showMenu('file');
                    }
                    return false;
                case 'escape':
//                        if (!this.leftMenu.isOpened()) return true;
                    // TODO:
                    if ( this.leftMenu.menuFile.isVisible() ) {
                        this.leftMenu.menuFile.hide();
                        return false;
                    }

                    var statusbar = PE.getController('Statusbar');
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

                    if ( this.leftMenu.btnAbout.pressed || this.leftMenu.btnPlugins.pressed ||
                        $(e.target).parents('#left-menu').length ) {
                        this.leftMenu.close();
                        Common.NotificationCenter.trigger('layout:changed', 'leftmenu');
                        return false;
                    }
                    break;
                /** coauthoring begin **/
                case 'chat':
                    if (this.mode.canCoAuthoring && this.mode.canChat && !this.mode.isLightVersion && (!previewPanel || !previewPanel.isVisible())){
                        Common.UI.Menu.Manager.hideAll();
                        this.leftMenu.showMenu('chat');
                    }
                    return false;
                case 'comments':
                    if (this.mode.canCoAuthoring && this.mode.canViewComments && !this.mode.isLightVersion && (!previewPanel || !previewPanel.isVisible()) && !this._state.no_slides) {
                        Common.UI.Menu.Manager.hideAll();
                        this.leftMenu.showMenu('comments');
                        this.getApplication().getController('Common.Controllers.Comments').onAfterShow();
                    }
                    return false;
                /** coauthoring end **/
            }
        },

        onPluginOpen: function(panel, type, action) {
            if (type == 'onboard') {
                if (action == 'open') {
                    this.leftMenu.close();
                    this.leftMenu.btnThumbs.toggle(false, false);
                    this.leftMenu.panelPlugins.show();
                    this.leftMenu.onBtnMenuClick({pressed: true, options: {action: 'plugins'}});
                    this.leftMenu._state.pluginIsRunning = true;
                } else {
                    this.leftMenu._state.pluginIsRunning = false;
                    this.leftMenu.close();
                }
            }
        },

        onMenuChange: function (value) {
            if ('hide' === value) {
                if (this.leftMenu.btnComments.isActive() && this.api) {
                    this.leftMenu.btnComments.toggle(false);
                    this.leftMenu.onBtnMenuClick(this.leftMenu.btnComments);
                    if (this.leftMenu._state.pluginIsRunning) // hide comments panel when plugin is running
                        this.leftMenu.onCoauthOptions();

                    // focus to sdk
                    this.api.asc_enableKeyEvents(true);
                }
            }
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
        notcriticalErrorTitle: 'Warning',
        txtUntitled: 'Untitled',
        textReplaceSuccess      : 'Search has been done. {0} occurrences have been replaced',
        textReplaceSkipped      : 'The replacement has been made. {0} occurrences were skipped.'
    }, PE.Controllers.LeftMenu || {}));
});