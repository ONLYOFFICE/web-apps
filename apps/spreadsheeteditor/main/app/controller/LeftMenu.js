/*
 *
 * (c) Copyright Ascensio System Limited 2010-2017
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
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia,
 * EU, LV-1021.
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
                /** coauthoring begin **/
                'Common.Views.Chat': {
                    'hide': _.bind(this.onHideChat, this)
                },
                'Statusbar': {
                    'click:users': _.bind(this.clickStatusbarUsers, this)
                },
                'LeftMenu': {
                    'file:show': _.bind(this.fileShowHide, this, true),
                    'file:hide': _.bind(this.fileShowHide, this, false),
                    'comments:show': _.bind(this.commentsShowHide, this, true),
                    'comments:hide': _.bind(this.commentsShowHide, this, false)
                },
                /** coauthoring end **/
                'Common.Views.About': {
                    'show':    _.bind(this.aboutShowHide, this, true),
                    'hide':    _.bind(this.aboutShowHide, this, false)
                },
                'FileMenu': {
                    'item:click': _.bind(this.clickMenuFileItem, this),
                    'saveas:format': _.bind(this.clickSaveAsFormat, this),
                    'settings:apply': _.bind(this.applySettings, this),
                    'create:new': _.bind(this.onCreateNew, this),
                    'recent:open': _.bind(this.onOpenRecent, this)
                },
                'Toolbar': {
                    'file:settings': _.bind(this.clickToolbarSettings,this)
                },
                'SearchDialog': {
                    'hide': _.bind(this.onSearchDlgHide, this),
                    'search:back': _.bind(this.onQuerySearch, this, 'back'),
                    'search:next': _.bind(this.onQuerySearch, this, 'next'),
                    'search:replace': _.bind(this.onQueryReplace, this),
                    'search:replaceall': _.bind(this.onQueryReplaceAll, this)
                }
            });
        },

        onLaunch: function() {
            this.leftMenu = this.createView('LeftMenu').render();
            this.leftMenu.btnSearch.on('toggle', _.bind(this.onMenuSearch, this));

            Common.util.Shortcuts.delegateShortcuts({
                shortcuts: {
                    'command+shift+s,ctrl+shift+s': _.bind(this.onShortcut, this, 'save'),
                    'command+f,ctrl+f': _.bind(this.onShortcut, this, 'search'),
                    'command+h,ctrl+h': _.bind(this.onShortcut, this, 'replace'),
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
                        me.leftMenu.btnFile.toggle(false);
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
            this.api.asc_registerCallback('asc_onCoAuthoringDisconnect', _.bind(this.onApiServerDisconnect, this, true));
            Common.NotificationCenter.on('api:disconnect',              _.bind(this.onApiServerDisconnect, this));
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
            if (!this.mode.isEditMailMerge && !this.mode.isEditDiagram)
                this.api.asc_registerCallback('asc_onEditCell', _.bind(this.onApiEditCell, this));
            this.leftMenu.getMenu('file').setApi(api);
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
                this.leftMenu.btnComments[(this.mode.isEdit&&this.mode.canComments && !this.mode.isLightVersion) ? 'show' : 'hide']();
                if (this.mode.canComments)
                    this.leftMenu.setOptionsPanel('comment', this.getApplication().getController('Common.Controllers.Comments').getView('Common.Views.Comments'));

                this.leftMenu.btnChat[(this.mode.canChat && !this.mode.isLightVersion) ? 'show' : 'hide']();
                if (this.mode.canChat)
                    this.leftMenu.setOptionsPanel('chat', this.getApplication().getController('Common.Controllers.Chat').getView('Common.Views.Chat'));
            } else {
                this.leftMenu.btnChat.hide();
                this.leftMenu.btnComments.hide();
            }
            /** coauthoring end **/
            Common.util.Shortcuts.resumeEvents();
            if (!this.mode.isEditMailMerge && !this.mode.isEditDiagram)
                Common.NotificationCenter.on('cells:range',   _.bind(this.onCellsRange, this));
            return this;
        },

        enablePlugins: function() {
            if (this.mode.canPlugins) {
                this.leftMenu.btnPlugins.show();
                this.leftMenu.setOptionsPanel('plugins', this.getApplication().getController('Common.Controllers.Plugins').getView('Common.Views.Plugins'));
            } else
                this.leftMenu.btnPlugins.hide();
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
                this.leftMenu.btnFile.toggle(false, true);
            }
        },

        clickSaveAsFormat: function(menu, format) {
            if (format == Asc.c_oAscFileType.CSV) {
                Common.UI.warning({
                    closable: false,
                    title: this.textWarning,
                    msg: this.warnDownloadAs,
                    buttons: ['ok', 'cancel'],
                    callback: _.bind(function(btn){
                        if (btn == 'ok') {
                            this.api.asc_DownloadAs(format);
                            menu.hide();
                            this.leftMenu.btnFile.toggle(false, true);
                        }
                    }, this)
                });
            } else {
                this.api.asc_DownloadAs(format);
                menu.hide();
                this.leftMenu.btnFile.toggle(false, true);
            }
        },

        applySettings: function(menu) {
            this.api.asc_setFontRenderingMode(parseInt(Common.localStorage.getItem("sse-settings-fontrender")));

            /** coauthoring begin **/
            var value = Common.localStorage.getItem("sse-settings-livecomment");
            (!(value!==null && parseInt(value) == 0)) ? this.api.asc_showComments() : this.api.asc_hideComments();
//            this.getApplication().getController('DocumentHolder').setLiveCommenting(!(value!==null && parseInt(value) == 0));

            if (this.mode.isEdit && !this.mode.isOffline && this.mode.canCoAuthoring) {
                value = Common.localStorage.getItem("sse-settings-coauthmode");
                this.api.asc_SetFastCollaborative(value===null || parseInt(value) == 1);
            }
            /** coauthoring end **/

            value = Common.localStorage.getItem("sse-settings-autosave");
            this.api.asc_setAutoSaveGap(parseInt(value));

            value = Common.localStorage.getItem("sse-settings-func-locale");
            if (value) value = SSE.Views.FormulaLang.get(value);
            if (value!==null) this.api.asc_setLocalization(value);

            value = Common.localStorage.getItem("sse-settings-reg-settings");
            if (value!==null) this.api.asc_setLocale(parseInt(value));

            menu.hide();
            this.leftMenu.btnFile.toggle(false, true);

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
                this.leftMenu.btnFile.toggle(false, true);
            }
        },

        onOpenRecent:  function(menu, url) {
            if (menu) {
                menu.hide();
                this.leftMenu.btnFile.toggle(false, true);
            }

            var recentDocPage = window.open(url);
            if (recentDocPage)
                recentDocPage.focus();

            Common.component.Analytics.trackEvent('Open Recent');
        },

        clickToolbarSettings: function(obj) {
            if (this.leftMenu.btnFile.pressed && this.leftMenu.btnFile.panel.active == 'opts')
                this.leftMenu.close();
            else
                this.leftMenu.showMenu('file:opts');
        },

        /** coauthoring begin **/
        clickStatusbarUsers: function() {
            this.leftMenu.btnFile.panel.panels['rights'].changeAccessRights();
        },

        onHideChat: function() {
            $(this.leftMenu.btnChat.el).blur();
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
                    markresult: false,
                    extraoptions : [menuWithin,menuSearch,menuLookin]
                }));

                this.dlgSearch.menuWithin = menuWithin;
                this.dlgSearch.menuSearch = menuSearch;
                this.dlgSearch.menuLookin = menuLookin;
                this.dlgSearch.findOptions = new Asc.asc_CFindOptions();
            }

            if (show) {
                var mode = this.mode.isEdit ? (action || undefined) : 'no-replace';

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

        onApiServerDisconnect: function(disableDownload) {
            this.mode.isEdit = false;
            this.leftMenu.close();

            /** coauthoring begin **/
            this.leftMenu.btnComments.setDisabled(true);
            this.leftMenu.btnChat.setDisabled(true);
            /** coauthoring end **/
            this.leftMenu.btnPlugins.setDisabled(true);

            this.leftMenu.getMenu('file').setMode({isDisconnected: true, disableDownload: !!disableDownload});
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

        commentsShowHide: function(state) {
            if (this.api) {
                var value = Common.localStorage.getItem("sse-settings-livecomment");
                if (value !== null && parseInt(value) == 0) {
                    (state) ? this.api.asc_showComments() : this.api.asc_hideComments();
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

                if (!state) $(this.leftMenu.btnFile.el).blur();
            }
        },

        aboutShowHide: function(state) {
            if (this.api) {
                this.api.asc_closeCellEditor();
                this.api.asc_enableKeyEvents(!state);

                if (!state) $(this.leftMenu.btnAbout.el).blur();
            }
        },

        /** coauthoring end **/

        onShortcut: function(s, e) {
            if (this.mode.isEditDiagram && s!='escape') return false;
            if (this.mode.isEditMailMerge && s!='escape' && s!='search') return false;

            switch (s) {
                case 'replace':
                case 'search':
                    if (!this.leftMenu.btnSearch.isDisabled()) {
                        Common.UI.Menu.Manager.hideAll();
                        this.showSearchDlg(true,s);
                        this.leftMenu.btnSearch.toggle(true,true);
                        this.leftMenu.btnFile.toggle(false);
                        this.leftMenu.btnAbout.toggle(false);
                    }
                    return false;
                case 'save':
                    if (this.mode.canDownload && !this.leftMenu.btnFile.isDisabled()) {
                        if (this.mode.isDesktopApp && this.mode.isOffline) {
                            this.api.asc_DownloadAs();
                        } else {
                            Common.UI.Menu.Manager.hideAll();
                            this.leftMenu.showMenu('file:saveas');
                        }
                    }
                    return false;
                case 'help':
                    if (!this.leftMenu.btnFile.isDisabled()) {
                        Common.UI.Menu.Manager.hideAll();
                        this.api.asc_closeCellEditor();
                        this.leftMenu.showMenu('file:help');
                    }
                    return false;
                case 'file':
                    if (!this.leftMenu.btnFile.isDisabled()) {
                        Common.UI.Menu.Manager.hideAll();
                        this.leftMenu.showMenu('file');
                    }
                    return false;
                case 'escape':
//                        if (!this.leftMenu.isOpened()) return true;
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
                    if (this.leftMenu.btnFile.pressed ||  this.leftMenu.btnAbout.pressed ||
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
                    if (this.mode.canCoAuthoring && this.mode.isEdit && this.mode.canComments && !this.mode.isLightVersion) {
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

            this.leftMenu.btnFile.setDisabled(isRangeSelection);
            this.leftMenu.btnAbout.setDisabled(isRangeSelection);
            this.leftMenu.btnSearch.setDisabled(isRangeSelection);
            if (this.mode.canPlugins && this.leftMenu.panelPlugins) {
                this.leftMenu.panelPlugins.setLocked(isRangeSelection);
                this.leftMenu.panelPlugins.disableControls(isRangeSelection);
            }
        },

        onApiEditCell: function(state) {

            var isEditFormula = (state == Asc.c_oAscCellEditorState.editFormula);

            this.leftMenu.btnFile.setDisabled(isEditFormula);
            this.leftMenu.btnAbout.setDisabled(isEditFormula);
            this.leftMenu.btnSearch.setDisabled(isEditFormula);
            if (this.mode.canPlugins && this.leftMenu.panelPlugins) {
                this.leftMenu.panelPlugins.setLocked(isEditFormula);
                this.leftMenu.panelPlugins.disableControls(isEditFormula);
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
        textLookin: 'Look in'
    }, SSE.Controllers.LeftMenu || {}));
});