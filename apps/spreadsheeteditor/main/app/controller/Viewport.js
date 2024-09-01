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
 *    Viewport.js
 *
 *    Controller for the viewport
 *
 *    Created on 24 March 2014
 *
 */

define([
    'core',
    'common/main/lib/view/Header',
    'common/main/lib/view/SearchBar',
    'spreadsheeteditor/main/app/view/Viewport'
//    ,'spreadsheeteditor/main/app/view/LeftMenu'
], function (Viewport) {
    'use strict';

    SSE.Controllers.Viewport = Backbone.Controller.extend(_.assign({
        // Specifying a Viewport model
        models: [],

        // Specifying a collection of out Viewport
        collections: [],

        // Specifying application views
        views: [
            'Viewport',   // is main application layout
            'Common.Views.Header'
        ],

        // When controller is created let's setup view event listeners
        initialize: function() {
            var me = this;

            // This most important part when we will tell our controller what events should be handled
            this.addListeners({
                'FileMenu': {
                    'menu:hide': me.onFileMenu.bind(me, 'hide'),
                    'menu:show': me.onFileMenu.bind(me, 'show'),
                    'settings:apply': me.applySettings.bind(me)
                },
                'Statusbar': {
                    'view:compact': function (statusbar, state) {
                        me.viewport.vlayout.getItem('statusbar').height = state ? 25 : 50;
                    }
                },
                'Toolbar': {
                    'render:before' : function (toolbar) {
                        var config = SSE.getController('Main').appOptions;
                        if (!config.isEditDiagram && !config.isEditMailMerge && !config.isEditOle)
                            toolbar.setExtra('right', me.header.getPanel('right', config));

                        if (!config.twoLevelHeader || config.compactHeader)
                            toolbar.setExtra('left', me.header.getPanel('left', config));

                        if ( me.appConfig && me.appConfig.isEdit && !config.compactHeader && toolbar.btnCollabChanges )
                            toolbar.btnCollabChanges = me.header.btnSave;

                        /*var value = Common.localStorage.getBool("sse-settings-quick-print-button", true);
                        Common.Utils.InternalSettings.set("sse-settings-quick-print-button", value);
                        if (me.header && me.header.btnPrintQuick)
                            me.header.btnPrintQuick[value ? 'show' : 'hide']();*/
                    },
                    'view:compact'  : function (toolbar, state) {
                        me.viewport.vlayout.getItem('toolbar').height = state ?
                            Common.Utils.InternalSettings.get('toolbar-height-compact') : Common.Utils.InternalSettings.get('toolbar-height-normal');
                    },
                    'undo:disabled' : function (state) {
                        me.header.lockHeaderBtns( 'undo', state, Common.enumLock.undoLock );
                    },
                    'redo:disabled' : function (state) {
                        me.header.lockHeaderBtns( 'redo', state, Common.enumLock.redoLock );
                    },
                    'print:disabled' : function (state) {
                        if ( me.header.btnPrint )
                            me.header.btnPrint.setDisabled(state);
                        if ( me.header.btnPrintQuick )
                            me.header.btnPrintQuick.setDisabled(state);
                    },
                    'save:disabled' : function (state) {
                        if ( me.header.btnSave )
                            me.header.btnSave.setDisabled(state);
                    }
                }
            });

            Common.NotificationCenter.on('app:face', this.onAppShowed.bind(this));
            Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            Common.NotificationCenter.on('tabstyle:changed', this.onTabStyleChange.bind(this));
            Common.NotificationCenter.on('tabbackground:changed', this.onTabBackgroundChange.bind(this));
        },

        setApi: function(api) {
            this.api = api;
            this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',this.onApiCoAuthoringDisconnect.bind(this));
            Common.NotificationCenter.on('api:disconnect',              this.onApiCoAuthoringDisconnect.bind(this));
        },

        getApi: function() {
            return this.api;
        },

        onAppShowed: function (config) {
            var me = this;
            me.appConfig = config;

            var _intvars = Common.Utils.InternalSettings;
            var $filemenu = $('.toolbar-fullview-panel');
            $filemenu.css('top', Common.UI.LayoutManager.isElementVisible('toolbar') ? _intvars.get('toolbar-height-tabs') : 0);

            me.viewport.$el.attr('applang', me.appConfig.lang.split(/[\-_]/)[0]);

            if ( !config.isEdit ||
                    ( !Common.localStorage.itemExists("sse-compact-toolbar") &&
                        config.customization && config.customization.compactToolbar ))
            {
                me.viewport.vlayout.getItem('toolbar').height = _intvars.get('toolbar-height-compact');
            } else
            if ( config.isEditDiagram || config.isEditMailMerge || config.isEditOle ) {
                me.viewport.vlayout.getItem('toolbar').height = 41;
            }

            if ( config.twoLevelHeader && !config.isEditDiagram && !config.isEditMailMerge && !config.isEditOle && !config.compactHeader) {
                var $title = me.viewport.vlayout.getItem('title').el;
                $title.html(me.header.getPanel('title', config)).show();
                $title.find('.extra').html(me.header.getPanel('left', config));

                var toolbar = me.viewport.vlayout.getItem('toolbar');
                toolbar.el.addClass('top-title');
                toolbar.height -= _intvars.get('toolbar-height-tabs') - _intvars.get('toolbar-height-tabs-top-title');

                var _tabs_new_height = _intvars.get('toolbar-height-tabs-top-title');
                _intvars.set('toolbar-height-tabs', _tabs_new_height);
                _intvars.set('toolbar-height-compact', _tabs_new_height);
                _intvars.set('toolbar-height-normal', _tabs_new_height + _intvars.get('toolbar-height-controls'));

                $filemenu.css('top', (Common.UI.LayoutManager.isElementVisible('toolbar') ? _tabs_new_height : 0) + _intvars.get('document-title-height'));
            }

            me.onTabStyleChange();
            me.onTabBackgroundChange();
            if ( config.customization && config.customization.toolbarHideFileName )
                me.viewport.vlayout.getItem('toolbar').el.addClass('style-skip-docname');

            me.header.btnSearch.on('toggle', me.onSearchToggle.bind(this));
        },

        onAppReady: function (config) {
        },

        // When our application is ready, lets get started
        onLaunch: function() {
            // Create and render main view
            this.viewport = this.createView('Viewport').render();
            this.getApplication().getController('CellEditor').createView('CellEditor',{ el: '#cell-editing-box' }).render();

            this.api = new Asc.spreadsheet_api({
                'id-view'  : 'editor_sdk',
                'id-input' : 'ce-cell-content',
                'translate': this.getApplication().getController('Main').translationTable
            });

            this.header   = this.createView('Common.Views.Header', {
                headerCaption: 'Spreadsheet Editor',
                storeUsers: SSE.getCollection('Common.Collections.Users')
            });

            Common.NotificationCenter.on('layout:changed', _.bind(this.onLayoutChanged, this));
            $(window).on('resize', _.bind(this.onWindowResize, this));

            this.viewport.celayout.on('layout:resizedrag', function() {
                this.viewport.fireEvent('layout:resizedrag', [this, 'cell:edit']);
                this.api.asc_Resize();
            }, this);

            var leftPanel = $('#left-menu'),
                histPanel = $('#left-panel-history');
            this.viewport.hlayout.on('layout:resizedrag', function() {
                this.api.asc_Resize();
                Common.localStorage.setItem('sse-mainmenu-width',histPanel.is(':visible') ? (histPanel.width()+SCALE_MIN) : leftPanel.width());
            }, this);

            this.boxSdk = $('#editor_sdk');
            this.boxFormula = $('#cell-editing-box');
            this.boxSdk.css('border-left', 'none');
            this.boxFormula.css('border-left', 'none');

            Common.NotificationCenter.on('search:show', _.bind(this.onSearchShow, this));
        },

        onLayoutChanged: function(area) {
            switch (area) {
            default:
                this.viewport.vlayout.doLayout();
                this.viewport.celayout.doLayout();
            case 'rightmenu':
                this.viewport.hlayout.doLayout();
                break;
            case 'history':
                var panel = this.viewport.hlayout.getItem('history');
                if (panel.resize.el) {
                    this.boxSdk.css('border-left', '');
                    panel.resize.el.show();
                }
                this.viewport.hlayout.doLayout();
                break;
            case 'leftmenu':
                var panel = this.viewport.hlayout.getItem('left');
                if (panel.resize.el) {
                    if (panel.el.width() > 40) {
                        this.boxSdk.css('border-left', '');
                        this.boxFormula.css('border-left', '');
                        panel.resize.el.show();
                    } else {
                        panel.resize.el.hide();
                        this.boxSdk.css('border-left', 'none');
                        this.boxFormula.css('border-left', 'none');
                    }
                }
                this.viewport.hlayout.doLayout();
                break;
            case 'header':
            case 'toolbar':
            case 'status':
                this.viewport.vlayout.doLayout();
                this.viewport.celayout.doLayout();
                break;
            case 'celleditor':
                if (arguments[1]) {
                    this.boxSdk.css('border-top', arguments[1]=='hidden'?'none':'');
                }
                this.viewport.celayout.doLayout();
                break;
            }
            this.api.asc_Resize();
        },

        onWindowResize: function(e) {
            this.onLayoutChanged('window');
            Common.NotificationCenter.trigger('window:resize');
        },

        onFileMenu: function (opts) {
            var me = this;
            var _need_disable =  opts == 'show';

            me.header.lockHeaderBtns( 'undo', _need_disable, Common.enumLock.fileMenuOpened );
            me.header.lockHeaderBtns( 'redo', _need_disable, Common.enumLock.fileMenuOpened );
            me.header.lockHeaderBtns( 'users', _need_disable );
        },

        applySettings: function () {
            // var value = Common.localStorage.getBool("sse-settings-quick-print-button", true);
            // Common.Utils.InternalSettings.set("sse-settings-quick-print-button", value);
            // if (this.header && this.header.btnPrintQuick)
            //     this.header.btnPrintQuick[value ? 'show' : 'hide']();
        },

        onApiCoAuthoringDisconnect: function(enableDownload) {
            if (this.header) {
                if (this.header.btnDownload && !enableDownload)
                    this.header.btnDownload.hide();
                if (this.header.btnPrint && !enableDownload)
                    this.header.btnPrint.hide();
                if (this.header.btnEdit)
                    this.header.btnEdit.hide();
                if (this.header.btnPrintQuick && !enableDownload)
                    this.header.btnPrintQuick.hide();
            }
        },

        SetDisabled: function (disabled) {
        },

        onSearchShow: function () {
            this.header.btnSearch && this.header.btnSearch.toggle(true);
        },

        onSearchToggle: function () {
            var leftMenu = this.getApplication().getController('LeftMenu');
            if (leftMenu.isSearchPanelVisible()) {
                this.header.btnSearch.toggle(false, true);
                leftMenu.getView('LeftMenu').panelSearch.focus();
                return;
            }
            if (!this.searchBar) {
                var hideLeftPanel = this.appConfig.canBrandingExt &&
                    (!Common.UI.LayoutManager.isElementVisible('leftMenu') || this.appConfig.customization && this.appConfig.customization.leftMenu === false);
                this.searchBar = new Common.UI.SearchBar( hideLeftPanel ? {
                    showOpenPanel: false,
                    width: 303
                } : {});
                this.searchBar.on('hide', _.bind(function () {
                    this.header.btnSearch.toggle(false, true);
                    Common.NotificationCenter.trigger('edit:complete');
                }, this));
            }
            if (this.header.btnSearch.pressed) {
                var selectedText = this.api.asc_GetSelectedText(),
                    searchController = this.getApplication().getController('Search'),
                    resultsNumber = searchController.getResultsNumber();
                this.searchBar.show(selectedText && selectedText.trim() || searchController.getSearchText());
                this.searchBar.updateResultsNumber(resultsNumber[0], resultsNumber[1]);
            } else {
                this.searchBar.hide();
            }
        },

        isSearchBarVisible: function () {
            return this.searchBar && this.searchBar.isVisible();
        },

        onTabStyleChange: function (style) {
            style = style || Common.Utils.InternalSettings.get("settings-tab-style");
            this.viewport.vlayout.getItem('toolbar').el.toggleClass('lined-tabs', style==='line');
        },

        onTabBackgroundChange: function (background) {
            background = background || Common.Utils.InternalSettings.get("settings-tab-background");
            this.viewport.vlayout.getItem('toolbar').el.toggleClass('style-off-tabs', background==='toolbar');
        },

        textHideFBar: 'Hide Formula Bar',
        textHideHeadings: 'Hide Headings',
        textHideGridlines: 'Hide Gridlines',
        textFreezePanes: 'Freeze Panes',
        textFreezePanesShadow: 'Show Freezed Panes Shadow'
    }, SSE.Controllers.Viewport));
});
