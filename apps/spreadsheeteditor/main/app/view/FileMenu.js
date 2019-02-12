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
    'text!spreadsheeteditor/main/app/template/FileMenu.template',
    'underscore',
    'common/main/lib/component/BaseView'
], function (tpl, _) {
    'use strict';

    SSE.Views.FileMenu = Common.UI.BaseView.extend(_.extend({
        el: '#file-menu-panel',
        options: {alias:'FileMenu'},

        template: _.template(tpl),

        events: function() {
            return {
                'click .fm-btn': _.bind(function(event){
                    var $item = $(event.currentTarget);
                    if (!$item.hasClass('active')) {
                        $('.fm-btn',this.el).removeClass('active');
                        $item.addClass('active');
                    }

                    var item = _.findWhere(this.items, {el: event.currentTarget});
                    if (item) {
                        var panel = this.panels[item.options.action];
                        this.fireEvent('item:click', [this, item.options.action, !!panel]);

                        if (panel) {
                            this.$el.find('.content-box:visible').hide();
                            this.active = item.options.action;
                            panel.show();
                        }
                    }
                }, this)
            };
        },

        initialize: function () {
        },

        render: function () {
            this.$el = $(this.el);
            this.$el.html(this.template());

            this.miSave = new Common.UI.MenuItem({
                el      : $('#fm-btn-save',this.el),
                action  : 'save',
                caption : this.btnSaveCaption,
                canFocused: false,
                disabled: true
            });

            this.miEdit = new Common.UI.MenuItem({
                el      : $('#fm-btn-edit',this.el),
                action  : 'edit',
                caption : this.btnToEditCaption,
                canFocused: false
            });

            this.miDownload = new Common.UI.MenuItem({
                el      : $('#fm-btn-download',this.el),
                action  : 'saveas',
                caption : this.btnDownloadCaption,
                canFocused: false
            });

            this.miSaveCopyAs = new Common.UI.MenuItem({
                el      : $('#fm-btn-save-copy',this.el),
                action  : 'save-copy',
                caption : this.btnSaveCopyAsCaption,
                canFocused: false
            });

            this.miSaveAs = new Common.UI.MenuItem({
                el      : $('#fm-btn-save-desktop',this.el),
                action  : 'save-desktop',
                caption : this.btnSaveAsCaption,
                canFocused: false
            });

            this.miPrint = new Common.UI.MenuItem({
                el      : $('#fm-btn-print',this.el),
                action  : 'print',
                caption : this.btnPrintCaption,
                canFocused: false
            });

            this.miRename = new Common.UI.MenuItem({
                el      : $('#fm-btn-rename',this.el),
                action  : 'rename',
                caption : this.btnRenameCaption,
                canFocused: false
            });

            this.miProtect = new Common.UI.MenuItem({
                el      : $('#fm-btn-protect',this.el),
                action  : 'protect',
                caption : this.btnProtectCaption,
                canFocused: false
            });

            this.miRecent = new Common.UI.MenuItem({
                el      : $('#fm-btn-recent',this.el),
                action  : 'recent',
                caption : this.btnRecentFilesCaption,
                canFocused: false
            });

            this.miNew = new Common.UI.MenuItem({
                el      : $('#fm-btn-create',this.el),
                action  : 'new',
                caption : this.btnCreateNewCaption,
                canFocused: false
            });

            this.miAccess = new Common.UI.MenuItem({
                el      : $('#fm-btn-rights',this.el),
                action  : 'rights',
                caption : this.btnRightsCaption,
                canFocused: false
            });

            this.miSettings = new Common.UI.MenuItem({
                el      : $('#fm-btn-settings',this.el),
                action  : 'opts',
                caption : this.btnSettingsCaption,
                canFocused: false
            });

            this.miHelp = new Common.UI.MenuItem({
                el      : $('#fm-btn-help',this.el),
                action  : 'help',
                caption : this.btnHelpCaption,
                canFocused: false
            });

            this.items = [];
            this.items.push(
                new Common.UI.MenuItem({
                    el      : $('#fm-btn-return',this.el),
                    action  : 'back',
                    caption : this.btnCloseMenuCaption,
                    canFocused: false
                }),
                this.miSave,
                this.miEdit,
                this.miDownload,
                this.miSaveCopyAs,
                this.miSaveAs,
                this.miPrint,
                this.miRename,
                this.miProtect,
                this.miRecent,
                this.miNew,
                new Common.UI.MenuItem({
                    el      : $('#fm-btn-info',this.el),
                    action  : 'info',
                    caption : this.btnInfoCaption,
                    canFocused: false
                }),
                this.miAccess,
                this.miSettings,
                this.miHelp,
                new Common.UI.MenuItem({
                    el      : $('#fm-btn-back',this.el),
                    action  : 'exit',
                    caption : this.btnBackCaption,
                    canFocused: false
                })
            );

            var me = this;
            me.panels = {
                'saveas'    : (new SSE.Views.FileMenuPanels.ViewSaveAs({menu:me})).render(),
                'save-copy' : (new SSE.Views.FileMenuPanels.ViewSaveCopy({menu:me})).render(),
                'opts'      : (new SSE.Views.FileMenuPanels.Settings({menu:me})).render(),
                'info'      : (new SSE.Views.FileMenuPanels.DocumentInfo({menu:me})).render(),
                'rights'    : (new SSE.Views.FileMenuPanels.DocumentRights({menu:me})).render()
            };

            me.$el.find('.content-box').hide();

            return this;
        },

        show: function(panel) {
            if (this.isVisible() && panel===undefined || !this.mode) return;

            var defPanel = (this.mode.canDownload && (!this.mode.isDesktopApp || !this.mode.isOffline)) ? 'saveas' : 'info';
            if (!panel)
                panel = this.active || defPanel;
            this.$el.show();
            this.selectMenu(panel, defPanel);

            this.api.asc_enableKeyEvents(false);

            this.fireEvent('menu:show', [this]);
        },

        hide: function() {
            this.$el.hide();
            this.api && this.api.asc_enableKeyEvents(true);
            this.fireEvent('menu:hide', [this]);
        },

        applyMode: function() {
            this.miPrint[this.mode.canPrint?'show':'hide']();
            this.miRename[(this.mode.canRename && !this.mode.isDesktopApp) ?'show':'hide']();
            this.miProtect[this.mode.canProtect ?'show':'hide']();
            this.miProtect.$el.find('+.devider')[!this.mode.isDisconnected?'show':'hide']();
            this.miRecent[this.mode.canOpenRecent?'show':'hide']();
            this.miNew[this.mode.canCreateNew?'show':'hide']();
            this.miNew.$el.find('+.devider')[this.mode.canCreateNew?'show':'hide']();

            this.miDownload[(this.mode.canDownload && (!this.mode.isDesktopApp || !this.mode.isOffline))?'show':'hide']();
            this.miSaveCopyAs[((this.mode.canDownload || this.mode.canDownloadOrigin) && (!this.mode.isDesktopApp || !this.mode.isOffline)) && this.mode.saveAsUrl ?'show':'hide']();
            this.miSaveAs[(this.mode.canDownload && this.mode.isDesktopApp && this.mode.isOffline)?'show':'hide']();
//            this.hkSaveAs[this.mode.canDownload?'enable':'disable']();

            this.miSave[this.mode.isEdit?'show':'hide']();
            this.miEdit[!this.mode.isEdit && this.mode.canEdit && this.mode.canRequestEditRights ?'show':'hide']();

            this.miAccess[(!this.mode.isOffline && this.document&&this.document.info&&(this.document.info.sharingSettings&&this.document.info.sharingSettings.length>0 ||
                                                                                       this.mode.sharingSettingsUrl&&this.mode.sharingSettingsUrl.length))?'show':'hide']();

            // this.miSettings[(this.mode.isEdit || this.mode.canViewComments)?'show':'hide']();
            // this.miSettings.$el.prev()[(this.mode.isEdit || this.mode.canViewComments)?'show':'hide']();

            this.mode.canBack ? this.$el.find('#fm-btn-back').show().prev().show() :
                                    this.$el.find('#fm-btn-back').hide().prev().hide();

            this.miHelp[this.mode.canHelp ?'show':'hide']();
            this.miHelp.$el.prev()[this.mode.canHelp ?'show':'hide']();

            this.panels['opts'].setMode(this.mode);
            this.panels['info'].setMode(this.mode);
            !this.mode.isDisconnected && this.panels['info'].updateInfo(this.document);
            this.panels['rights'].setMode(this.mode);
            !this.mode.isDisconnected && this.panels['rights'].updateInfo(this.document);

            if ( this.mode.canCreateNew ) {
                if (this.mode.templates && this.mode.templates.length) {
                    $('a',this.miNew.$el).text(this.btnCreateNewCaption + '...');
                    this.panels['new'] = ((new SSE.Views.FileMenuPanels.CreateNew({menu: this, docs: this.mode.templates})).render());
                }
            }

            if ( this.mode.canOpenRecent ) {
                if (this.mode.recent){
                    this.panels['recent'] = (new SSE.Views.FileMenuPanels.RecentFiles({menu:this, recent: this.mode.recent})).render();
                }
            }

            if (this.mode.canProtect) {
                this.panels['protect'] = (new SSE.Views.FileMenuPanels.ProtectDoc({menu:this})).render();
                this.panels['protect'].setMode(this.mode);
            }

            if (this.mode.canHelp) {
                this.panels['help'] = ((new SSE.Views.FileMenuPanels.Help({menu: this})).render());
                this.panels['help'].setLangConfig(this.mode.lang);
            }
        },

        setMode: function(mode, delay) {
            if (mode.isDisconnected) {
                this.mode.canEdit = this.mode.isEdit = false;
                this.mode.canOpenRecent = this.mode.canCreateNew = false;
                this.mode.isDisconnected = mode.isDisconnected;
                this.mode.canRename = false;
                if (!mode.enableDownload)
                    this.mode.canPrint = this.mode.canDownload = false;
            } else {
                this.mode = mode;
            }

            if (!delay) this.applyMode();
        },

        setApi: function(api) {
            this.api = api;
            this.panels['info'].setApi(api);
            if (this.panels['opts']) this.panels['opts'].setApi(api);
            if (this.panels['protect']) this.panels['protect'].setApi(api);
            this.api.asc_registerCallback('asc_onDocumentName',  _.bind(this.onDocumentName, this));
        },

        loadDocument: function(data) {
            this.document = data.doc;
        },

        selectMenu: function(menu, defMenu) {
            if ( menu ) {
                var item = this._getMenuItem(menu),
                    panel   = this.panels[menu];
                if ( item.isDisabled() || !item.isVisible()) {
                    item = this._getMenuItem(defMenu);
                    panel   = this.panels[defMenu];
                }
                if ( item && panel ) {
                    $('.fm-btn',this.el).removeClass('active');
                    item.$el.addClass('active');

                    this.$el.find('.content-box:visible').hide();
                    panel.show();

                    this.active = menu;
                }
            }
        },

        _getMenuItem: function(action) {
            return _.find(this.items, function(item) {
                return item.options.action == action;
            });
        },

        onDocumentName: function(name) {
            this.document.title = name;
            this.panels['info'].updateInfo(this.document);
        },

        isVisible: function () {
            return !this.$el.is(':hidden');
        },

        getButton: function(type) {
            if (type == 'save')
                return this.miSave;
        },

        btnSaveCaption          : 'Save',
        btnDownloadCaption      : 'Download as...',
        btnInfoCaption          : 'Document Info...',
        btnRightsCaption        : 'Access Rights...',
        btnCreateNewCaption     : 'Create New',
        btnRecentFilesCaption   : 'Open Recent...',
        btnPrintCaption         : 'Print',
        btnHelpCaption          : 'Help...',
        btnReturnCaption        : 'Back to Document',
        btnToEditCaption        : 'Edit Document',
        btnBackCaption          : 'Go to Documents',
        btnSettingsCaption      : 'Advanced Settings...',
        btnSaveAsCaption        : 'Save as',
        btnRenameCaption        : 'Rename...',
        btnCloseMenuCaption     : 'Close Menu',
        btnProtectCaption: 'Protect',
        btnSaveCopyAsCaption    : 'Save Copy as...'
    }, SSE.Views.FileMenu || {}));
});
