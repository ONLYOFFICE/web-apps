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
define([
    'core',
    'common/main/lib/util/Shortcuts',
    'common/main/lib/view/SaveAsDlg',
    'spreadsheeteditor/main/app/view/LeftMenu',
    'spreadsheeteditor/main/app/view/FileMenu'
], function () {
    'use strict';

    SSE.Controllers.LeftMenu = Backbone.Controller.extend(_.extend({
        views: [
            'LeftMenu',
            'FileMenu'
        ],

        initialize: function() {

            this.addListeners({
                'Common.Views.Chat': {
                    'hide': _.bind(this.onHideChat, this)
                },
                'Common.Views.Plugins': {
                    'plugin:open': _.bind(this.onPluginOpen, this),
                    'hide':        _.bind(this.onHidePlugins, this)
                },
                'Common.Views.Header': {
                    'file:settings': _.bind(this.clickToolbarSettings,this),
                    'click:users': _.bind(this.clickStatusbarUsers, this)
                },
                'LeftMenu': {
                    'file:show': _.bind(this.fileShowHide, this, true),
                    'file:hide': _.bind(this.fileShowHide, this, false),
                    'comments:show': _.bind(this.commentsShowHide, this, true),
                    'comments:hide': _.bind(this.commentsShowHide, this, false)
                },
                'Common.Views.About': {
                    'show':    _.bind(this.aboutShowHide, this, true),
                    'hide':    _.bind(this.aboutShowHide, this, false)
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
                    'save:disabled' : this.changeToolbarSaveState.bind(this)
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
            Common.NotificationCenter.on('app:comment:add', _.bind(this.onAppAddComment, this));
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

            var me = this;

            this.leftMenu.$el.find('button').each(function() {
                $(this).on('keydown', function (e) {
                    if (Common.UI.Keys.RETURN === e.keyCode || Common.UI.Keys.SPACE === e.keyCode) {
                        me.leftMenu.btnAbout.toggle(false);

                        this.blur();

                        e.preventDefault();

                        me.api.asc_enableKeyEvents(true);
                    }
                });
            });
        },

        setApi: function(api) {
            this.api = api;
            this.api.asc_registerCallback('asc_onRenameCellTextEnd',    _.bind(this.onRenameText, this));
            this.api.asc_registerCallback('asc_onCoAuthoringDisconnect', _.bind(this.onApiServerDisconnect, this));
            Common.NotificationCenter.on('api:disconnect',              _.bind(this.onApiServerDisconnect, this));
            this.api.asc_registerCallback('asc_onDownloadUrl',          _.bind(this.onDownloadUrl, this));
            Common.NotificationCenter.on('download:cancel',             _.bind(this.onDownloadCancel, this));
            /** coauthoring begin **/
            if (this.mode.canCoAuthoring) {
                if (this.mode.canChat)
                    this.api.asc_registerCallback('asc_onCoAuthoringChatReceiveMessage', _.bind(this.onApiChatMessage, this));
                if (this.mode.canComments) {
                    this.api.asc_registerCallback('asc_onAddComment', _.bind(this.onApiAddComment, this));
                    this.api.asc_registerCallback('asc_onAddComments', _.bind(this.onApiAddComments, this));
                    var comments = this.getApplication().getController('Common.Controllers.Comments').groupCollection;
                    for (var name in comments) {
                        var collection = comments[name],
                            resolved = Common.Utils.InternalSettings.get("sse-settings-resolvedcomment");
                        for (var i = 0; i < collection.length; ++i) {
                            if (collection.at(i).get('userid') !== this.mode.user.id && (resolved || !collection.at(i).get('resolved'))) {
                                this.leftMenu.markCoauthOptions('comments', true);
                                break;
                            }
                        }
                    }
                }
            }
            /** coauthoring end **/
            if (!this.mode.isEditMailMerge && !this.mode.isEditDiagram)
                this.api.asc_registerCallback('asc_onEditCell', _.bind(this.onApiEditCell, this));
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
            if (!this.mode.isEditMailMerge && !this.mode.isEditDiagram)
                Common.NotificationCenter.on('cells:range',   _.bind(this.onCellsRange, this));
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
            case 'print': Common.NotificationCenter.trigger('print', this.leftMenu); break;
            case 'exit': Common.NotificationCenter.trigger('goback'); break;
            case 'edit':
//                this.getApplication().getController('Statusbar').setStatusCaption(this.requestEditRightsText);
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
            if (format == Asc.c_oAscFileType.CSV) {
                Common.UI.warning({
                    title: this.textWarning,
                    msg: this.warnDownloadAs,
                    buttons: ['ok', 'cancel'],
                    callback: _.bind(function(btn){
                        if (btn == 'ok') {
                            this.api.asc_DownloadAs(format);
                            menu.hide();
                        }
                    }, this)
                });
            } else if (format == Asc.c_oAscFileType.PDF || format == Asc.c_oAscFileType.PDFA) {
                menu.hide();
                Common.NotificationCenter.trigger('download:settings', this.leftMenu, format);
            } else {
                this.api.asc_DownloadAs(format);
                menu.hide();
            }
        },

        clickSaveCopyAsFormat: function(menu, format, ext) {
            if (format == Asc.c_oAscFileType.CSV) {
                Common.UI.warning({
                    title: this.textWarning,
                    msg: this.warnDownloadAs,
                    buttons: ['ok', 'cancel'],
                    callback: _.bind(function(btn){
                        if (btn == 'ok') {
                            this.isFromFileDownloadAs = ext;
                            this.api.asc_DownloadAs(format, true);
                            menu.hide();
                        }
                    }, this)
                });
            } else if (format == Asc.c_oAscFileType.PDF || format == Asc.c_oAscFileType.PDFA) {
                this.isFromFileDownloadAs = ext;
                menu.hide();
                Common.NotificationCenter.trigger('download:settings', this.leftMenu, format, true);
            } else {
                this.isFromFileDownloadAs = ext;
                this.api.asc_DownloadAs(format, true);
                menu.hide();
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
                        title: me.textWarning,
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

        onDownloadCancel: function() {
            this.isFromFileDownloadAs = false;
        },

        applySettings: function(menu) {
            var value = Common.localStorage.getItem("sse-settings-fontrender");
            Common.Utils.InternalSettings.set("sse-settings-fontrender", value);
            this.api.asc_setFontRenderingMode(parseInt(value));

            /** coauthoring begin **/
            value = Common.localStorage.getBool("sse-settings-livecomment", true);
            Common.Utils.InternalSettings.set("sse-settings-livecomment", value);
            var resolved = Common.localStorage.getBool("sse-settings-resolvedcomment");
            Common.Utils.InternalSettings.set("sse-settings-resolvedcomment", resolved);

            if (this.mode.canViewComments && this.leftMenu.panelComments.isVisible())
                value = resolved = true;
            (value) ? this.api.asc_showComments(resolved) : this.api.asc_hideComments();

            value = Common.localStorage.getBool("sse-settings-r1c1");
            Common.Utils.InternalSettings.set("sse-settings-r1c1", value);
            this.api.asc_setR1C1Mode(value);

            if (this.mode.isEdit && !this.mode.isOffline && this.mode.canCoAuthoring) {
                value = Common.localStorage.getBool("sse-settings-coauthmode", true);
                Common.Utils.InternalSettings.set("sse-settings-coauthmode", value);
                this.api.asc_SetFastCollaborative(value);
            }
            /** coauthoring end **/

            if (this.mode.isEdit) {
                value = parseInt(Common.localStorage.getItem("sse-settings-autosave"));
                Common.Utils.InternalSettings.set("sse-settings-autosave", value);
                this.api.asc_setAutoSaveGap(value);
            }

            value = Common.localStorage.getItem("sse-settings-func-locale");
            Common.Utils.InternalSettings.set("sse-settings-func-locale", value);
            if (value) value = SSE.Views.FormulaLang.get(value);
            if (value!==null) this.api.asc_setLocalization(value);

            value = Common.localStorage.getItem("sse-settings-reg-settings");
            if (value!==null) this.api.asc_setLocale(parseInt(value));

            menu.hide();

            this.leftMenu.fireEvent('settings:apply');
        },

        onCreateNew: function(menu, type) {
            if (this.mode.nativeApp === true) {
                this.api.asc_openNewDocument(type == 'blank' ? '' : type);
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
                var options = this.dlgSearch.findOptions;
                options.asc_setFindWhat(opts.textsearch);
                options.asc_setScanForward(d != 'back');
                options.asc_setIsMatchCase(opts.matchcase);
                options.asc_setIsWholeCell(opts.matchword);
                options.asc_setScanOnOnlySheet(this.dlgSearch.menuWithin.menu.items[0].checked);
                options.asc_setScanByRows(this.dlgSearch.menuSearch.menu.items[0].checked);
                options.asc_setLookIn(this.dlgSearch.menuLookin.menu.items[0].checked?Asc.c_oAscFindLookIn.Formulas:Asc.c_oAscFindLookIn.Value);

                if (!this.api.asc_findText(options)) {
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
                this.api.isReplaceAll = false;

                var options = this.dlgSearch.findOptions;
                options.asc_setFindWhat(opts.textsearch);
                options.asc_setReplaceWith(opts.textreplace);
                options.asc_setIsMatchCase(opts.matchcase);
                options.asc_setIsWholeCell(opts.matchword);
                options.asc_setScanOnOnlySheet(this.dlgSearch.menuWithin.menu.items[0].checked);
                options.asc_setScanByRows(this.dlgSearch.menuSearch.menu.items[0].checked);
                options.asc_setLookIn(this.dlgSearch.menuLookin.menu.items[0].checked?Asc.c_oAscFindLookIn.Formulas:Asc.c_oAscFindLookIn.Value);
                options.asc_setIsReplaceAll(false);

                this.api.asc_replaceText(options);
            }
        },

        onQueryReplaceAll: function(w, opts) {
            if (!_.isEmpty(opts.textsearch)) {
                this.api.isReplaceAll = true;

                var options = this.dlgSearch.findOptions;
                options.asc_setFindWhat(opts.textsearch);
                options.asc_setReplaceWith(opts.textreplace);
                options.asc_setIsMatchCase(opts.matchcase);
                options.asc_setIsWholeCell(opts.matchword);
                options.asc_setScanOnOnlySheet(this.dlgSearch.menuWithin.menu.items[0].checked);
                options.asc_setScanByRows(this.dlgSearch.menuSearch.menu.items[0].checked);
                options.asc_setLookIn(this.dlgSearch.menuLookin.menu.items[0].checked?Asc.c_oAscFindLookIn.Formulas:Asc.c_oAscFindLookIn.Value);
                options.asc_setIsReplaceAll(true);

                this.api.asc_replaceText(options);
            }
        },

        onSearchHighlight: function(w, highlight) {
            this.api.asc_selectSearchingResults(highlight);
        },

        showSearchDlg: function(show,action) {
            if ( !this.dlgSearch ) {
                var menuWithin = new Common.UI.MenuItem({
                    caption     : this.textWithin,
                    menu        : new Common.UI.Menu({
                        menuAlign   : 'tl-tr',
                        items       : [{
                                caption     : this.textSheet,
                                toggleGroup : 'searchWithih',
                                checkable   : true,
                                checked     : true
                            },{
                                caption     : this.textWorkbook,
                                toggleGroup : 'searchWithih',
                                checkable   : true,
                                checked     : false
                        }]
                    })
                });

                var menuSearch = new Common.UI.MenuItem({
                    caption     : this.textSearch,
                    menu        : new Common.UI.Menu({
                        menuAlign   : 'tl-tr',
                        items       : [{
                                caption     : this.textByRows,
                                toggleGroup : 'searchByrows',
                                checkable   : true,
                                checked     : true
                            },{
                                caption     : this.textByColumns,
                                toggleGroup : 'searchByrows',
                                checkable   : true,
                                checked     : false
                        }]
                    })
                });

                var menuLookin = new Common.UI.MenuItem({
                    caption     : this.textLookin,
                    menu        : new Common.UI.Menu({
                        menuAlign   : 'tl-tr',
                        items       : [{
                                caption     : this.textFormulas,
                                toggleGroup : 'searchLookin',
                                checkable   : true,
                                checked     : true
                            },{
                                caption     : this.textValues,
                                toggleGroup : 'searchLookin',
                                checkable   : true,
                                checked     : false
                        }]
                    })
                });

                this.dlgSearch = (new Common.UI.SearchDialog({
                    matchcase: true,
                    matchword: true,
                    matchwordstr: this.textItemEntireCell,
                    markresult: {applied: true},
                    extraoptions : [menuWithin,menuSearch,menuLookin]
                }));

                this.dlgSearch.menuWithin = menuWithin;
                this.dlgSearch.menuSearch = menuSearch;
                this.dlgSearch.menuLookin = menuLookin;
                this.dlgSearch.findOptions = new Asc.asc_CFindOptions();
            }

            if (show) {
                var mode = this.mode.isEdit && !this.viewmode ? (action || undefined) : 'no-replace';

                if (this.dlgSearch.isVisible()) {
                    this.dlgSearch.setMode(mode);
                    this.dlgSearch.focus();
                } else {
                    this.dlgSearch.show(mode);
                }

                this.api.asc_closeCellEditor();
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

        onRenameText: function(found, replaced) {
            var me = this;
            if (this.api.isReplaceAll) {
                Common.UI.info({
                    msg: (found) ? ((!found-replaced) ? Common.Utils.String.format(this.textReplaceSuccess,replaced) : Common.Utils.String.format(this.textReplaceSkipped,found-replaced)) : this.textNoTextFound,
                    callback: function() {
                        me.dlgSearch.focus();
                    }
                });
            } else {
                var sett = this.dlgSearch.getSettings();
                var options = this.dlgSearch.findOptions;
                options.asc_setFindWhat(sett.textsearch);
                options.asc_setScanForward(true);
                options.asc_setIsMatchCase(sett.matchcase);
                options.asc_setIsWholeCell(sett.matchword);
                options.asc_setScanOnOnlySheet(this.dlgSearch.menuWithin.menu.items[0].checked);
                options.asc_setScanByRows(this.dlgSearch.menuSearch.menu.items[0].checked);
                options.asc_setLookIn(this.dlgSearch.menuLookin.menu.items[0].checked?Asc.c_oAscFindLookIn.Formulas:Asc.c_oAscFindLookIn.Value);


                if (!me.api.asc_findText(options)) {
                    Common.UI.info({
                        msg: this.textNoTextFound,
                        callback: function() {
                            me.dlgSearch.focus();
                        }
                    });
                }
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

        /** coauthoring begin **/
        onApiChatMessage: function() {
            this.leftMenu.markCoauthOptions('chat');
        },

        onApiAddComment: function(id, data) {
            var resolved = Common.Utils.InternalSettings.get("sse-settings-resolvedcomment");
            if (data && data.asc_getUserId() !== this.mode.user.id && (resolved || !data.asc_getSolved()))
                this.leftMenu.markCoauthOptions('comments');
        },

        onApiAddComments: function(data) {
            var resolved = Common.Utils.InternalSettings.get("sse-settings-resolvedcomment");
            for (var i = 0; i < data.length; ++i) {
                if (data[i].asc_getUserId() !== this.mode.user.id && (resolved || !data[i].asc_getSolved())) {
                    this.leftMenu.markCoauthOptions('comments');
                    break;
                }
            }
        },

        onAppAddComment: function(sender, to_doc) {
            if ( to_doc ) {
                var me = this;
                (new Promise(function(resolve, reject) {
                    resolve();
                })).then(function () {
                    Common.UI.Menu.Manager.hideAll();
                    me.leftMenu.showMenu('comments');

                    var ctrl = SSE.getController('Common.Controllers.Comments');
                    ctrl.getView().showEditContainer(true);
                    ctrl.onAfterShow();
                });
            }
        },

        commentsShowHide: function(state) {
            if (this.api) {
                var value = Common.Utils.InternalSettings.get("sse-settings-livecomment"),
                    resolved = Common.Utils.InternalSettings.get("sse-settings-resolvedcomment");

                if (!value || !resolved) {
                    (state) ? this.api.asc_showComments(true) : ((value) ? this.api.asc_showComments(resolved) : this.api.asc_hideComments());
                }

                if (state) {
                    this.getApplication().getController('Common.Controllers.Comments').onAfterShow();
                }

                if (!state) $(this.leftMenu.btnComments.el).blur();
            }
        },

        fileShowHide: function(state) {
            if (this.api) {
                this.api.asc_closeCellEditor();
                this.api.asc_enableKeyEvents(!state);
            }
        },

        aboutShowHide: function(state) {
            if (this.api) {
                this.api.asc_closeCellEditor();
                this.api.asc_enableKeyEvents(!state);

                if (!state) $(this.leftMenu.btnAbout.el).blur();
                if (!state && this.leftMenu._state.pluginIsRunning) {
                    this.leftMenu.panelPlugins.show();
                    if (this.mode.canCoAuthoring) {
                        this.mode.canViewComments && this.leftMenu.panelComments['hide']();
                        this.mode.canChat && this.leftMenu.panelChat['hide']();
                    }
                }
            }
        },

        menuFilesShowHide: function(state) {
            if (this.api) {
                this.api.asc_closeCellEditor();
                this.api.asc_enableKeyEvents(!(state == 'show'));
            }

            if ( this.dlgSearch ) {
                if ( state == 'show' )
                    this.dlgSearch.suspendKeyEvents();
                else
                    Common.Utils.asyncCall(this.dlgSearch.resumeKeyEvents, this.dlgSearch);
            }
        },

        /** coauthoring end **/

        onShortcut: function(s, e) {
            if (!this.mode) return;

            if (this.mode.isEditDiagram && s!='escape') return false;
            if (this.mode.isEditMailMerge && s!='escape' && s!='search') return false;

            switch (s) {
                case 'replace':
                case 'search':
                    if (!this.leftMenu.btnSearch.isDisabled()) {
                        Common.UI.Menu.Manager.hideAll();
                        this.showSearchDlg(true,s);
                        this.leftMenu.btnSearch.toggle(true,true);
                        this.leftMenu.btnAbout.toggle(false);

                        this.leftMenu.menuFile.hide();
                    }
                    return false;
                case 'save':
                    if ( this.mode.canDownload ) {
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
                        Common.UI.Menu.Manager.hideAll();
                        this.api.asc_closeCellEditor();
                        this.leftMenu.showMenu('file:help');
                    }

                    return false;
                case 'file':
                    Common.UI.Menu.Manager.hideAll();
                    this.leftMenu.showMenu('file');

                    return false;
                case 'escape':
                    if ( this.leftMenu.menuFile.isVisible() ) {
                        this.leftMenu.menuFile.hide();
                        return false;
                    }

                    var statusbar = SSE.getController('Statusbar');
                    var menu_opened = statusbar.statusbar.$el.find('.open > [data-toggle="dropdown"]');
                    if (menu_opened.length) {
                        $.fn.dropdown.Constructor.prototype.keydown.call(menu_opened[0], e);
                        return false;
                    }
                    if (this.mode.canPlugins && this.leftMenu.panelPlugins && this.api.isCellEdited!==true) {
                        menu_opened = this.leftMenu.panelPlugins.$el.find('#menu-plugin-container.open > [data-toggle="dropdown"]');
                        if (menu_opened.length) {
                            $.fn.dropdown.Constructor.prototype.keydown.call(menu_opened[0], e);
                            return false;
                        }
                    }
                    if ( this.leftMenu.btnAbout.pressed ||
                        ($(e.target).parents('#left-menu').length || this.leftMenu.btnPlugins.pressed || this.leftMenu.btnComments.pressed) && this.api.isCellEdited!==true) {
                        this.leftMenu.close();
                        Common.NotificationCenter.trigger('layout:changed', 'leftmenu');
                        return false;
                    }
                    if (this.mode.isEditDiagram || this.mode.isEditMailMerge) {
                        menu_opened = $(document.body).find('.open > .dropdown-menu');
                        if (!this.api.isCellEdited && !menu_opened.length) {
                            Common.Gateway.internalMessage('shortcut', {key:'escape'});
                            return false;
                        }
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

        onCellsRange: function(status) {
            var isRangeSelection = (status != Asc.c_oAscSelectionDialogType.None);

            this.leftMenu.btnAbout.setDisabled(isRangeSelection);
            this.leftMenu.btnSearch.setDisabled(isRangeSelection);
            if (this.mode.canPlugins && this.leftMenu.panelPlugins) {
                this.leftMenu.panelPlugins.setLocked(isRangeSelection);
                this.leftMenu.panelPlugins.disableControls(isRangeSelection);
            }
        },

        onApiEditCell: function(state) {
            var isEditFormula = (state == Asc.c_oAscCellEditorState.editFormula);

            this.leftMenu.btnAbout.setDisabled(isEditFormula);
            this.leftMenu.btnSearch.setDisabled(isEditFormula);
            if (this.mode.canPlugins && this.leftMenu.panelPlugins) {
                this.leftMenu.panelPlugins.setLocked(isEditFormula);
                this.leftMenu.panelPlugins.disableControls(isEditFormula);
            }
        },

        onPluginOpen: function(panel, type, action) {
            if (type == 'onboard') {
                if (action == 'open') {
                    this.leftMenu.close();
                    this.leftMenu.panelPlugins.show();
                    this.leftMenu.onBtnMenuClick({pressed: true, options: {action: 'plugins'}});
                    this.leftMenu._state.pluginIsRunning = true;
                } else {
                    this.leftMenu._state.pluginIsRunning = false;
                    this.leftMenu.close();
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

        textNoTextFound        : 'Text not found',
        newDocumentTitle        : 'Unnamed document',
        textItemEntireCell      : 'Entire cell contents',
        requestEditRightsText   : 'Requesting editing rights...',
        textReplaceSuccess      : 'Search has been done. {0} occurrences have been replaced',
        textReplaceSkipped      : 'The replacement has been made. {0} occurrences were skipped.',
        warnDownloadAs          : 'If you continue saving in this format all features except the text will be lost.<br>Are you sure you want to continue?' ,
        textWarning: 'Warning',
        textSheet: 'Sheet',
        textWorkbook: 'Workbook',
        textByColumns: 'By columns',
        textByRows: 'By rows',
        textFormulas: 'Formulas',
        textValues: 'Values',
        textWithin: 'Within',
        textSearch: 'Search',
        textLookin: 'Look in',
        txtUntitled: 'Untitled'
    }, SSE.Controllers.LeftMenu || {}));
});