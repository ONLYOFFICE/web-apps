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
define([
    'core',
    'common/main/lib/util/Shortcuts',
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
                    'plugins:addtoleft': _.bind(this.addNewPlugin, this),
                    'pluginsleft:open': _.bind(this.openPlugin, this),
                    'pluginsleft:close': _.bind(this.closePlugin, this),
                    'pluginsleft:hide': _.bind(this.onHidePlugins, this),
                    'pluginsleft:updateicons': _.bind(this.updatePluginButtonsIcons, this)
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
                'LeftMenu': {
                    'file:show': _.bind(this.fileShowHide, this, true),
                    'file:hide': _.bind(this.fileShowHide, this, false),
                    'comments:show': _.bind(this.commentsShowHide, this, true),
                    'comments:hide': _.bind(this.commentsShowHide, this, false),
                    'button:click':  _.bind(this.onBtnCategoryClick, this)
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
                    'savecopy:format': _.bind(function(menu, format, ext) {
                        if (this.mode && this.mode.wopi && ext!==undefined) { // save copy as in wopi
                            this.saveAsInWopi(menu, format, ext);
                        } else
                            this.clickSaveCopyAsFormat(menu, format, ext);
                    }, this),
                    'settings:apply': _.bind(this.applySettings, this),
                    'spellcheck:apply': _.bind(this.applySpellcheckSettings, this),
                    'create:new': _.bind(this.onCreateNew, this),
                    'recent:open': _.bind(this.onOpenRecent, this)
                },
                'Toolbar': {
                    'file:settings': _.bind(this.clickToolbarSettings,this),
                    'file:open': this.clickToolbarTab.bind(this, 'file'),
                    'file:close': this.clickToolbarTab.bind(this, 'other'),
                    'save:disabled' : this.changeToolbarSaveState.bind(this)
                },
                'Common.Views.ReviewChanges': {
                    'collaboration:chat': _.bind(this.onShowHideChat, this)
                },
                'SearchBar': {
                    'search:show': _.bind(this.onShowHideSearch, this)
                },
                'ViewTab': {
                    'leftmenu:hide': _.bind(this.onLeftMenuHide, this)
                }
            });
            Common.NotificationCenter.on('app:comment:add', _.bind(this.onAppAddComment, this));
            Common.NotificationCenter.on('leftmenu:change', _.bind(this.onMenuChange, this));
            Common.NotificationCenter.on('collaboration:history', _.bind(function () {
                if ( !this.leftMenu.panelHistory.isVisible() )
                    this.clickMenuFileItem(null, 'history');
            }, this));
            Common.NotificationCenter.on('file:print', _.bind(this.clickToolbarPrint, this));
            Common.NotificationCenter.on('script:loaded', _.bind(this.createPostLoadElements, this));
            Common.NotificationCenter.on('script:loaded:spellcheck', _.bind(this.initializeSpellcheck, this));
        },

        onLaunch: function() {
            this.leftMenu = this.createView('LeftMenu').render();
            this.leftMenu.btnSearchBar.on('toggle', _.bind(this.onMenuSearchBar, this));

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
                            var comment = collection.at(i);
                            if (!comment.get('hide') && comment.get('userid') !== this.mode.user.id && comment.get('userid') !== '' && (resolved || !comment.get('resolved'))) {
                                this.leftMenu.markCoauthOptions('comments', true);
                                break;
                            }
                        }
                    }
                }
            }
            /** coauthoring end **/
            if (!this.mode.isEditMailMerge && !this.mode.isEditDiagram && !this.mode.isEditOle)
                this.api.asc_registerCallback('asc_onEditCell', _.bind(this.onApiEditCell, this));
            this.leftMenu.getMenu('file').setApi(api);
            if (this.mode.canUseHistory)
                this.getApplication().getController('Common.Controllers.History').setApi(this.api).setMode(this.mode);
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

            this.leftMenu.btnSpellcheck.setDisabled(disable);
            this.leftMenu.setDisabledPluginButtons(disable);
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

            if (this.mode.canUseHistory)
                this.leftMenu.setOptionsPanel('history', this.getApplication().getController('Common.Controllers.History').getView('Common.Views.History'));

            (this.mode.trialMode || this.mode.isBeta) && this.leftMenu.setDeveloperMode(this.mode.trialMode, this.mode.isBeta, this.mode.buildVersion);
            /** coauthoring end **/
            Common.util.Shortcuts.resumeEvents();
            if (!this.mode.isEditMailMerge && !this.mode.isEditDiagram && !this.mode.isEditOle)
                Common.NotificationCenter.on('cells:range',   _.bind(this.onCellsRange, this));
            this.leftMenu.setButtons();
            this.leftMenu.setMoreButton();
            return this;
        },

        createPostLoadElements: function() {

        },

        initializeSpellcheck: function () {
            if (this.mode.isEdit && Common.UI.FeaturesManager.canChange('spellcheck')) {
                Common.UI.LayoutManager.isElementVisible('leftMenu-spellcheck') && this.leftMenu.btnSpellcheck.show();
                this.leftMenu.setOptionsPanel('spellcheck', this.getApplication().getController('Spellcheck').getView('Spellcheck'));
            }
        },

        enablePlugins: function() {
            (this.mode.trialMode || this.mode.isBeta) && this.leftMenu.setDeveloperMode(this.mode.trialMode, this.mode.isBeta, this.mode.buildVersion);
        },

        clickMenuFileItem: function(menu, action, isopts) {
            var close_menu = true;
            switch (action) {
            case 'back': break;
            case 'save': this.api.asc_Save(); break;
            case 'save-desktop': this.api.asc_DownloadAs(); break;
            case 'export-pdf':
                Common.NotificationCenter.trigger('export:to', this.leftMenu, Asc.c_oAscFileType.PDF);
                break;
            case 'print': Common.NotificationCenter.trigger('print', this.leftMenu); break;
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
                    maxLength: this.mode.wopi ? this.mode.wopi.FileNameMaxLength : undefined,
                    handler: function(result, value) {
                        if (result == 'ok' && !_.isEmpty(value.trim()) && documentCaption !== value.trim()) {
                            me.mode.wopi ? me.api.asc_wopi_renameFile(value) : Common.Gateway.requestRename(value);
                        }
                        Common.NotificationCenter.trigger('edit:complete', me);
                    }
                })).show();
                break;
            case 'history':
                if (!this.leftMenu.panelHistory.isVisible()) {
                    if (this.api.asc_isDocumentModified()) {
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
            case 'external-help': close_menu = true; break;
            case 'close-editor': Common.NotificationCenter.trigger('close'); break;
            default: close_menu = false;
            }

            if (close_menu && menu) {
                menu.hide();
            }
        },

        showLostDataWarning: function(callback) {
            Common.UI.warning({
                title: this.textWarning,
                msg: this.warnDownloadAs,
                buttons: ['ok', 'cancel'],
                callback: _.bind(function (btn) {
                    if (btn == 'ok') {
                        callback.call();
                    }
                }, this)
            });
        },

        clickSaveAsFormat: function(menu, format) {
            if (format == Asc.c_oAscFileType.CSV) {
                var me = this;
                if (this.api.asc_getWorksheetsCount()>1) {
                    Common.UI.warning({
                        title: this.textWarning,
                        msg: this.warnDownloadCsvSheets,
                        buttons: [{value: 'ok', caption: this.textSave}, 'cancel'],
                        callback: _.bind(function (btn) {
                            if (btn == 'ok') {
                                me.showLostDataWarning(function () {
                                    Common.NotificationCenter.trigger('download:advanced', Asc.c_oAscAdvancedOptionsID.CSV, me.api.asc_getAdvancedOptions(), 2, new Asc.asc_CDownloadOptions(format));
                                    menu.hide();
                                });
                            }
                        }, this)
                    });
                } else
                    this.showLostDataWarning(function () {
                        Common.NotificationCenter.trigger('download:advanced', Asc.c_oAscAdvancedOptionsID.CSV, me.api.asc_getAdvancedOptions(), 2, new Asc.asc_CDownloadOptions(format));
                        menu.hide();
                    });
            } else if (format == Asc.c_oAscFileType.PDF || format == Asc.c_oAscFileType.PDFA) {
                menu.hide();
                Common.NotificationCenter.trigger('download:settings', this.leftMenu, format);
            } else {
                this.api.asc_DownloadAs(new Asc.asc_CDownloadOptions(format));
                menu.hide();
            }
        },

        clickSaveCopyAsFormat: function(menu, format, ext, wopiPath) {
            if (format == Asc.c_oAscFileType.CSV) {
                var me = this;
                if (this.api.asc_getWorksheetsCount()>1) {
                    Common.UI.warning({
                        title: this.textWarning,
                        msg: this.warnDownloadCsvSheets,
                        buttons: [{value: 'ok', caption: this.textSave}, 'cancel'],
                        callback: _.bind(function (btn) {
                            if (btn == 'ok') {
                                me.showLostDataWarning(function () {
                                    me.isFromFileDownloadAs = ext;
                                    var options = new Asc.asc_CDownloadOptions(format, true);
                                    options.asc_setIsSaveAs(true);
                                    wopiPath && options.asc_setWopiSaveAsPath(wopiPath);
                                    Common.NotificationCenter.trigger('download:advanced', Asc.c_oAscAdvancedOptionsID.CSV, me.api.asc_getAdvancedOptions(), 2, options);
                                    menu.hide();
                                });
                            }
                        }, this)
                    });
                } else
                    me.showLostDataWarning(function () {
                        me.isFromFileDownloadAs = ext;
                        var options = new Asc.asc_CDownloadOptions(format, true);
                        options.asc_setIsSaveAs(true);
                        wopiPath && options.asc_setWopiSaveAsPath(wopiPath);
                        Common.NotificationCenter.trigger('download:advanced', Asc.c_oAscAdvancedOptionsID.CSV, me.api.asc_getAdvancedOptions(), 2, options);
                        menu.hide();
                    });
            } else if (format == Asc.c_oAscFileType.PDF || format == Asc.c_oAscFileType.PDFA) {
                this.isFromFileDownloadAs = ext;
                menu.hide();
                Common.NotificationCenter.trigger('download:settings', this.leftMenu, format, true, wopiPath);
            } else {
                this.isFromFileDownloadAs = ext;
                var options = new Asc.asc_CDownloadOptions(format, true);
                options.asc_setIsSaveAs(true);
                wopiPath && options.asc_setWopiSaveAsPath(wopiPath);
                this.api.asc_DownloadAs(options);
                menu.hide();
            }
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
                        me.clickSaveCopyAsFormat(menu, format, ext, value);
                    }
                }
            })).show();
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
            }
            this.isFromFileDownloadAs = false;
        },

        onDownloadCancel: function() {
            this.isFromFileDownloadAs = false;
        },

        applySettings: function(menu) {
            var value = Common.localStorage.getBool("sse-settings-cachemode", true);
            Common.Utils.InternalSettings.set("sse-settings-cachemode", value);
            this.api.asc_setDefaultBlitMode(value);

            value = Common.localStorage.getItem("sse-settings-fontrender");
            Common.Utils.InternalSettings.set("sse-settings-fontrender", value);
            this.api.asc_setFontRenderingMode(parseInt(value));

            /** coauthoring begin **/
            value = Common.localStorage.getBool("sse-settings-livecomment", true);
            Common.Utils.InternalSettings.set("sse-settings-livecomment", value);
            var resolved = Common.localStorage.getBool("sse-settings-resolvedcomment");
            Common.Utils.InternalSettings.set("sse-settings-resolvedcomment", resolved);

            if (this.mode.canViewComments && this.leftMenu.panelComments && this.leftMenu.panelComments.isVisible())
                value = resolved = true;
            (value) ? this.api.asc_showComments(resolved) : this.api.asc_hideComments();
            this.getApplication().getController('Common.Controllers.ReviewChanges').commentsShowHide(value ? 'show' : 'hide');

            value = Common.localStorage.getBool("sse-settings-r1c1");
            Common.Utils.InternalSettings.set("sse-settings-r1c1", value);
            this.api.asc_setR1C1Mode(value);

            var fast_coauth = Common.Utils.InternalSettings.get("sse-settings-coauthmode");
            if (this.mode.isEdit && !this.mode.isOffline && this.mode.canCoAuthoring) {
                if (this.mode.canChangeCoAuthoring) {
                    fast_coauth = Common.localStorage.getBool("sse-settings-coauthmode", true);
                    Common.Utils.InternalSettings.set("sse-settings-coauthmode", fast_coauth);
                    this.api.asc_SetFastCollaborative(fast_coauth);
                }
            } else if (this.mode.canLiveView && !this.mode.isOffline && this.mode.canChangeCoAuthoring) { // viewer
                fast_coauth = Common.localStorage.getBool("sse-settings-view-coauthmode", false);
                Common.Utils.InternalSettings.set("sse-settings-coauthmode", fast_coauth);
                this.api.asc_SetFastCollaborative(fast_coauth);
            }
            /** coauthoring end **/

            if (this.mode.isEdit) {
                if (this.mode.canChangeCoAuthoring || !fast_coauth) {// can change co-auth. mode or for strict mode
                    value = parseInt(Common.localStorage.getItem("sse-settings-autosave"));
                    Common.Utils.InternalSettings.set("sse-settings-autosave", value);
                    this.api.asc_setAutoSaveGap(value);
                }

                value = parseInt(Common.localStorage.getItem("sse-settings-paste-button"));
                Common.Utils.InternalSettings.set("sse-settings-paste-button", value);
                this.api.asc_setVisiblePasteButton(!!value);
            }

            var reg = Common.localStorage.getItem("sse-settings-reg-settings"),
                baseRegSettings = Common.Utils.InternalSettings.get("sse-settings-use-base-separator");
            if (reg === null) {
                reg = this.api.asc_getLocale();
            }
            if (baseRegSettings) {
                this.api.asc_setLocale(parseInt(reg), undefined, undefined);
            }
            else {
                this.api.asc_setLocale(parseInt(reg), Common.localStorage.getItem("sse-settings-decimal-separator"), Common.localStorage.getItem("sse-settings-group-separator"));
            }

            value = Common.localStorage.getBool("app-settings-screen-reader");
            Common.Utils.InternalSettings.set("app-settings-screen-reader", value);
            this.api.setSpeechEnabled(value);

            /* update zoom */
            var newZoomValue = Common.localStorage.getItem("sse-settings-zoom");
            if (newZoomValue > 0) {
                var oldZoomValue = Common.Utils.InternalSettings.get("sse-settings-zoom");
                if (oldZoomValue === null || (oldZoomValue == -3) || (oldZoomValue / 100 == this.api.asc_getZoom())) {
                    this.api.asc_setZoom(newZoomValue / 100);
                }
            }

            Common.Utils.InternalSettings.set("sse-settings-zoom", newZoomValue);

            menu.hide();

            this.leftMenu.fireEvent('settings:apply');
        },

        applySpellcheckSettings: function(menu) {
            if (this.mode.isEdit && this.api && Common.UI.FeaturesManager.canChange('spellcheck')) {
                var value = Common.localStorage.getBool("sse-spellcheck-ignore-uppercase-words");
                this.api.asc_ignoreUppercase(value);
                value = Common.localStorage.getBool("sse-spellcheck-ignore-numbers-words");
                this.api.asc_ignoreNumbers(value);
                value = Common.localStorage.getItem("sse-spellcheck-locale");
                if (value) {
                    this.api.asc_setDefaultLanguage(parseInt(value));
                }
            }

            menu.hide();

            this.leftMenu.fireEvent('spellcheck:update');
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
            this.leftMenu.showMenu('file:printpreview');
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

        setPreviewMode: function(mode) {
            if (this.viewmode === mode) return;
            this.viewmode = mode;

            this.leftMenu.panelSearch && this.leftMenu.panelSearch.setSearchMode(this.viewmode ? 'no-replace' : 'search');
            this.leftMenu.setDisabledPluginButtons(this.viewmode);
        },

        onApiServerDisconnect: function(enableDownload) {
            this.mode.isEdit = false;
            this.leftMenu.close();

            /** coauthoring begin **/
            this.leftMenu.btnComments.setDisabled(true);
            this.leftMenu.btnChat.setDisabled(true);
            /** coauthoring end **/
            this.leftMenu.btnSpellcheck.setDisabled(true);
            this.leftMenu.setDisabledPluginButtons(true);

            this.leftMenu.getMenu('file').setMode({isDisconnected: true, enableDownload: !!enableDownload});
        },

        /** coauthoring begin **/
        onApiChatMessage: function() {
            this.leftMenu.markCoauthOptions('chat');
        },

        onApiAddComment: function(id, data) {
            var resolved = Common.Utils.InternalSettings.get("sse-settings-resolvedcomment");
            if (data && data.asc_getUserId() !== this.mode.user.id && (resolved || !data.asc_getSolved()) && AscCommon.UserInfoParser.canViewComment(data.asc_getUserName()))
                this.leftMenu.markCoauthOptions('comments');
        },

        onApiAddComments: function(data) {
            var resolved = Common.Utils.InternalSettings.get("sse-settings-resolvedcomment");
            for (var i = 0; i < data.length; ++i) {
                if (data[i].asc_getUserId() !== this.mode.user.id && (resolved || !data[i].asc_getSolved()) && AscCommon.UserInfoParser.canViewComment(data[i].asc_getUserName())) {
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
                (state == 'show') ? this.api.asc_enableKeyEvents(false) : Common.NotificationCenter.trigger('menu:hide');
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
            if (this.mode.isEditOle && s!='escape' && s!='search') return false;

            switch (s) {
                case 'replace':
                case 'search':
                    if (this.mode.isEditMailMerge || this.mode.isEditOle) {
                        this.leftMenu.fireEvent('search:show');
                        return false;
                    }
                    if (!this.leftMenu.btnSearchBar.isDisabled()) {
                        Common.UI.Menu.Manager.hideAll();
                        this.leftMenu.btnAbout.toggle(false);
                        if ( this.leftMenu.menuFile.isVisible() )
                            this.leftMenu.menuFile.hide();

                        var selectedText = this.api.asc_GetSelectedText();
                        if (this.isSearchPanelVisible()) {
                            selectedText && this.leftMenu.panelSearch.setFindText(selectedText);
                            this.leftMenu.panelSearch.focus(selectedText !== '' ? s : 'search');
                            this.leftMenu.fireEvent('search:aftershow', [selectedText ? selectedText : undefined]);
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
                    if ( this.mode.canHelp ) {                   // TODO: unlock 'help' panel for 'view' mode
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
                    var btnSearch = this.getApplication().getController('Viewport').header.btnSearch;
                    btnSearch.pressed && btnSearch.toggle(false);

                    if ( this.leftMenu.menuFile.isVisible() ) {
                        if (Common.UI.HintManager.needCloseFileMenu())
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
                    if ( this.leftMenu.btnAbout.pressed) {
                        if (!Common.UI.HintManager.isHintVisible()) {
                            this.leftMenu.close();
                            Common.NotificationCenter.trigger('layout:changed', 'leftmenu');
                        }
                        return false;
                    }
                    if (this.mode.isEditDiagram || this.mode.isEditMailMerge || this.mode.isEditOle) {
                        var searchBarBtn = (this.mode.isEditMailMerge || this.mode.isEditOle) && this.getApplication().getController('Toolbar').toolbar.btnSearch,
                            isSearchOpen = searchBarBtn && searchBarBtn.pressed;
                        menu_opened = $(document.body).find('.open > .dropdown-menu');
                        if (!this.api.isCellEdited && !menu_opened.length && !isSearchOpen) {
                            this.mode.isEditOle && Common.NotificationCenter.trigger('oleedit:close');
                            Common.Gateway.internalMessage('shortcut', {key:'escape'});
                            return false;
                        }
                        isSearchOpen && searchBarBtn.toggle(false);
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
            this.leftMenu.btnSearchBar.setDisabled(isRangeSelection);
            this.leftMenu.btnSpellcheck.setDisabled(isRangeSelection);
            if (this.mode.canPlugins && this.leftMenu.panelPlugins) {
                Common.Utils.lockControls(Common.enumLock.selRangeEdit, isRangeSelection, {array: this.leftMenu.panelPlugins.lockedControls});
                this.leftMenu.panelPlugins.setLocked(isRangeSelection);
            }
        },

        onApiEditCell: function(state) {
            var isEditFormula = (state == Asc.c_oAscCellEditorState.editFormula);

            this.leftMenu.btnAbout.setDisabled(isEditFormula);
            this.leftMenu.btnSearchBar.setDisabled(isEditFormula);
            this.leftMenu.btnSpellcheck.setDisabled(isEditFormula);
            if (this.mode.canPlugins && this.leftMenu.panelPlugins) {
                Common.Utils.lockControls(Common.enumLock.editFormula, isEditFormula, {array: this.leftMenu.panelPlugins.lockedControls});
                this.leftMenu.panelPlugins.setLocked(isEditFormula);
            }
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

        onShowHideSearch: function (state, findText) {
            if (state) {
                Common.UI.Menu.Manager.hideAll();
                this.tryToShowLeftMenu();
                this.leftMenu.showMenu('advancedsearch');
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

        onMenuChange: function (value) {
            if ('hide' === value) {
                if (this.leftMenu.btnComments.isActive() && this.api) {
                    this.leftMenu.btnComments.toggle(false);
                    this.leftMenu.onBtnMenuClick(this.leftMenu.btnComments);

                    // focus to sdk
                    this.api.asc_enableKeyEvents(true);
                } else if (this.leftMenu.btnSearchBar.isActive() && this.api) {
                    this.leftMenu.btnSearchBar.toggle(false);
                    this.leftMenu.onBtnMenuClick(this.leftMenu.btnSearchBar);
                } else if (this.leftMenu.btnSpellcheck.isActive() && this.api) {
                    this.leftMenu.btnSpellcheck.toggle(false);
                    this.leftMenu.onBtnMenuClick(this.leftMenu.btnSpellcheck);
                }
                else if (this.leftMenu.btnChat.isActive()) {
                    this.leftMenu.btnChat.toggle(false);
                    this.leftMenu.onBtnMenuClick(this.leftMenu.btnChat);
                }
            }
        },

        showHistory: function() {
            if (!this.mode.wopi) {
                var maincontroller = this.getApplication().getController('Main');
                if (!maincontroller.loadMask)
                    maincontroller.loadMask = new Common.UI.LoadMask({owner: $('#viewport')});
                maincontroller.loadMask.setTitle(this.textLoadHistory);
                maincontroller.loadMask.show();
            }
            Common.Gateway.requestHistory();
        },

        isCommentsVisible: function() {
            return this.leftMenu && this.leftMenu.panelComments && this.leftMenu.panelComments.isVisible();
        },

        onLeftMenuHide: function (view, status) {
            if (this.leftMenu) {
                !status && this.leftMenu.close();
                status ? this.leftMenu.show() : this.leftMenu.hide();
                Common.localStorage.setBool('sse-hidden-leftmenu', !status);

                !view && this.leftMenu.fireEvent('view:hide', [this, !status]);
            }

            Common.NotificationCenter.trigger('layout:changed', 'main');
            Common.NotificationCenter.trigger('edit:complete', this.leftMenu);
        },

        tryToShowLeftMenu: function() {
            if ((!this.mode.canBrandingExt || !this.mode.customization || this.mode.customization.leftMenu !== false) && Common.UI.LayoutManager.isElementVisible('leftMenu'))
                this.onLeftMenuHide(null, true);
        },

        textNoTextFound        : 'Text not found',
        newDocumentTitle        : 'Unnamed document',
        textItemEntireCell      : 'Entire cell contents',
        requestEditRightsText   : 'Requesting editing rights...',
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
        txtUntitled: 'Untitled',
        textLoadHistory         : 'Loading version history...',
        leavePageText: 'All unsaved changes in this document will be lost.<br> Click \'Cancel\' then \'Save\' to save them. Click \'OK\' to discard all the unsaved changes.',
        warnDownloadCsvSheets: 'The CSV format does not support saving a multi-sheet file.<br>To keep the selected format and save only the current sheet, press Save.<br>To save the current spreadsheet, click Cancel and save it in a different format.',
        textSave: 'Save',
        textSelectPath: 'Enter a new name for saving the file copy'
    }, SSE.Controllers.LeftMenu || {}));
});