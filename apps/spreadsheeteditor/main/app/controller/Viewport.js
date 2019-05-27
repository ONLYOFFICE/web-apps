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
 *    Viewport.js
 *
 *    Controller for the viewport
 *
 *    Created by Maxim Kadushkin on 24 March 2014
 *    Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'common/main/lib/view/Header',
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
                    'menu:show': me.onFileMenu.bind(me, 'show')
                },
                'Statusbar': {
                    'sheet:changed': me.onApiSheetChanged.bind(me)
                },
                'Toolbar': {
                    'render:before' : function (toolbar) {
                        var config = SSE.getController('Main').appOptions;
                        toolbar.setExtra('right', me.header.getPanel('right', config));
                        if (!config.isEdit || config.customization && !!config.customization.compactHeader)
                            toolbar.setExtra('left', me.header.getPanel('left', config));

                        if ( me.appConfig && me.appConfig.isEdit && !(config.customization && config.customization.compactHeader) && toolbar.btnCollabChanges )
                            toolbar.btnCollabChanges = me.header.btnSave;

                    },
                    'view:compact'  : function (toolbar, state) {
                        me.header.mnuitemCompactToolbar.setChecked(state, true);
                        me.viewport.vlayout.getItem('toolbar').height = state ?
                            Common.Utils.InternalSettings.get('toolbar-height-compact') : Common.Utils.InternalSettings.get('toolbar-height-normal');
                    },
                    'undo:disabled' : function (state) {
                        if ( me.header.btnUndo ) {
                            if ( me.header.btnUndo.keepState )
                                me.header.btnUndo.keepState.disabled = state;
                            else me.header.btnUndo.setDisabled(state);
                        }
                    },
                    'redo:disabled' : function (state) {
                        if ( me.header.btnRedo ) {
                            if ( me.header.btnRedo.keepState )
                                me.header.btnRedo.keepState.disabled = state;
                            else me.header.btnRedo.setDisabled(state);
                        }
                    },
                    'print:disabled' : function (state) {
                        if ( me.header.btnPrint )
                            me.header.btnPrint.setDisabled(state);
                    },
                    'save:disabled' : function (state) {
                        if ( me.header.btnSave )
                            me.header.btnSave.setDisabled(state);
                    }
                }
            });

            Common.NotificationCenter.on('app:face', this.onAppShowed.bind(this));
            Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            Common.NotificationCenter.on('cells:range', this.onCellsRange.bind(this));
        },

        setApi: function(api) {
            this.api = api;
            this.api.asc_registerCallback('asc_onZoomChanged',              this.onApiZoomChange.bind(this));
            this.api.asc_registerCallback('asc_onSheetsChanged',            this.onApiSheetChanged.bind(this));
            this.api.asc_registerCallback('asc_onUpdateSheetViewSettings',  this.onApiSheetChanged.bind(this));
            this.api.asc_registerCallback('asc_onEditCell',                 this.onApiEditCell.bind(this));
            this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',this.onApiCoAuthoringDisconnect.bind(this));
            Common.NotificationCenter.on('api:disconnect',              this.onApiCoAuthoringDisconnect.bind(this));
        },

        onAppShowed: function (config) {
            var me = this;
            me.appConfig = config;

            var _intvars = Common.Utils.InternalSettings;
            var $filemenu = $('.toolbar-fullview-panel');
            $filemenu.css('top', _intvars.get('toolbar-height-tabs'));

            if ( !config.isEdit ||
                    ( !Common.localStorage.itemExists("sse-compact-toolbar") &&
                        config.customization && config.customization.compactToolbar ))
            {
                me.viewport.vlayout.getItem('toolbar').height = _intvars.get('toolbar-height-compact');
            } else
            if ( config.isEditDiagram || config.isEditMailMerge ) {
                me.viewport.vlayout.getItem('toolbar').height = 41;
            }

            if ( config.isEdit && !config.isEditDiagram && !config.isEditMailMerge && !(config.customization && config.customization.compactHeader)) {
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

                $filemenu.css('top', _tabs_new_height + _intvars.get('document-title-height'));
            }

            if ( config.customization ) {
                if ( config.customization.toolbarNoTabs )
                    me.viewport.vlayout.getItem('toolbar').el.addClass('style-off-tabs');

                if ( config.customization.toolbarHideFileName )
                    me.viewport.vlayout.getItem('toolbar').el.addClass('style-skip-docname');
            }
        },

        onAppReady: function (config) {
            var me = this;
            if ( me.header.btnOptions ) {
                var compactview = !config.isEdit;
                if ( config.isEdit && !config.isEditDiagram && !config.isEditMailMerge ) {
                    if ( Common.localStorage.itemExists("sse-compact-toolbar") ) {
                        compactview = Common.localStorage.getBool("sse-compact-toolbar");
                    } else
                    if ( config.customization && config.customization.compactToolbar )
                        compactview = true;
                }

                me.header.mnuitemCompactToolbar = new Common.UI.MenuItem({
                    caption     : me.header.textCompactView,
                    checked     : compactview,
                    checkable   : true,
                    value       : 'toolbar'
                });
                if (!config.isEdit && !config.isEditDiagram && !config.isEditMailMerge) {
                    me.header.mnuitemCompactToolbar.hide();
                    Common.NotificationCenter.on('tab:visible', _.bind(function(action, visible){
                        if (action=='plugins' && visible) {
                            me.header.mnuitemCompactToolbar.show();
                        }
                    }, this));
                }

                var mnuitemHideFormulaBar = new Common.UI.MenuItem({
                    caption     : me.textHideFBar,
                    checked     : Common.localStorage.getBool('sse-hidden-formula'),
                    checkable   : true,
                    value       : 'formula'
                });

                me.header.mnuitemHideHeadings = new Common.UI.MenuItem({
                    caption     : me.textHideHeadings,
                    checkable   : true,
                    checked     : me.header.mnuitemHideHeadings.isChecked(),
                    value       : 'headings'
                });

                me.header.mnuitemHideGridlines = new Common.UI.MenuItem({
                    caption     : me.textHideGridlines,
                    checkable   : true,
                    checked     : me.header.mnuitemHideGridlines.isChecked(),
                    value       : 'gridlines'
                });

                me.header.mnuitemFreezePanes = new Common.UI.MenuItem({
                    caption     : me.textFreezePanes,
                    checkable   : true,
                    checked     : me.header.mnuitemFreezePanes.isChecked(),
                    value       : 'freezepanes'
                });

                me.header.mnuZoom = new Common.UI.MenuItem({
                    template: _.template([
                        '<div id="hdr-menu-zoom" class="menu-zoom" style="height: 25px;" ',
                            '<% if(!_.isUndefined(options.stopPropagation)) { %>',
                            'data-stopPropagation="true"',
                            '<% } %>', '>',
                            '<label class="title">' + me.header.textZoom + '</label>',
                            '<button id="hdr-menu-zoom-in" type="button" style="float:right; margin: 2px 5px 0 0;" class="btn small btn-toolbar"><i class="icon btn-zoomin">&nbsp;</i></button>',
                            '<label class="zoom"><%= options.value %>%</label>',
                            '<button id="hdr-menu-zoom-out" type="button" style="float:right; margin-top: 2px;" class="btn small btn-toolbar"><i class="icon btn-zoomout">&nbsp;</i></button>',
                        '</div>'
                    ].join('')),
                    stopPropagation: true,
                    value: me.header.mnuZoom.options.value
                });

                var mnuitemAdvSettings = new Common.UI.MenuItem({
                    caption: me.header.textAdvSettings,
                    value: 'advanced'
                });

                me.header.btnOptions.setMenu(new Common.UI.Menu({
                        cls: 'pull-right',
                        style: 'min-width: 180px;',
                        items: [
                            me.header.mnuitemCompactToolbar,
                            mnuitemHideFormulaBar,
                            {caption:'--'},
                            me.header.mnuitemHideHeadings,
                            me.header.mnuitemHideGridlines,
                            {caption:'--'},
                            me.header.mnuitemFreezePanes,
                            {caption:'--'},
                            me.header.mnuZoom,
                            {caption:'--'},
                            mnuitemAdvSettings
                        ]
                    })
                );

                if (!config.isEdit) {
                    var menu = me.header.btnOptions.menu;
                    me.header.mnuitemHideHeadings.hide();
                    me.header.mnuitemHideGridlines.hide();
                    me.header.mnuitemFreezePanes.hide();
                    menu.items[5].hide();
                    menu.items[7].hide();
                    if (!config.canViewComments) { // show advanced settings for editing and commenting mode
                        // mnuitemAdvSettings.hide();
                        // menu.items[9].hide();
                    }
                }

                var _on_btn_zoom = function (btn) {
                    if ( btn == 'up' ) {
                        var _f = Math.floor(this.api.asc_getZoom() * 10)/10;
                        _f += .1;
                        if (_f > 0 && !(_f > 2.))
                            this.api.asc_setZoom(_f);
                    } else {
                        _f = Math.ceil(this.api.asc_getZoom() * 10)/10;
                        _f -= .1;
                        if (!(_f < .5))
                            this.api.asc_setZoom(_f);
                    }

                    Common.NotificationCenter.trigger('edit:complete', me.header);
                };

                (new Common.UI.Button({
                    el      : $('#hdr-menu-zoom-out', me.header.mnuZoom.$el),
                    cls     : 'btn-toolbar'
                })).on('click', _on_btn_zoom.bind(me, 'down'));

                (new Common.UI.Button({
                    el      : $('#hdr-menu-zoom-in', me.header.mnuZoom.$el),
                    cls     : 'btn-toolbar'
                })).on('click', _on_btn_zoom.bind(me, 'up'));

                me.header.btnOptions.menu.on('item:click', me.onOptionsItemClick.bind(this));
            }
        },

        // When our application is ready, lets get started
        onLaunch: function() {
            // Create and render main view
            this.viewport = this.createView('Viewport').render();
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

            var leftPanel = $('#left-menu');
            this.viewport.hlayout.on('layout:resizedrag', function() {
                this.api.asc_Resize();
                Common.localStorage.setItem('sse-mainmenu-width',leftPanel.width());
            }, this);

            this.boxSdk = $('#editor_sdk');
            this.boxFormula = $('#cell-editing-box');
            this.boxSdk.css('border-left', 'none');
            this.boxFormula.css('border-left', 'none');

            this.header.mnuitemHideHeadings = this.header.fakeMenuItem();
            this.header.mnuitemHideGridlines = this.header.fakeMenuItem();
            this.header.mnuitemFreezePanes = this.header.fakeMenuItem();
        },

        onLayoutChanged: function(area) {
            switch (area) {
            default:
                this.viewport.vlayout.doLayout();
                this.viewport.celayout.doLayout();
            case 'rightmenu':
                this.viewport.hlayout.doLayout();
                break;
            case 'leftmenu':
                var panel = this.viewport.hlayout.items[0];
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

            me.header.lockHeaderBtns( 'undo', _need_disable );
            me.header.lockHeaderBtns( 'redo', _need_disable );
            me.header.lockHeaderBtns( 'opts', _need_disable );
            me.header.lockHeaderBtns( 'users', _need_disable );
        },

        onApiZoomChange: function(zf, type){
            switch (type) {
                case 1: // FitWidth
                case 2: // FitPage
                case 0:
                default: {
                    this.header.mnuZoom.options.value = Math.floor((zf + .005) * 100);
                    $('.menu-zoom .zoom', this.header.mnuZoom.$el).html(Math.floor((zf + .005) * 100) + '%');
                }
            }
        },

        onApiSheetChanged: function() {
            var me = this;
            var appConfig = me.viewport.mode;
            if ( !!appConfig && !appConfig.isEditDiagram && !appConfig.isEditMailMerge ) {
                var params  = me.api.asc_getSheetViewSettings();
                me.header.mnuitemHideHeadings.setChecked(!params.asc_getShowRowColHeaders());
                me.header.mnuitemHideGridlines.setChecked(!params.asc_getShowGridLines());
                me.header.mnuitemFreezePanes.setChecked(params.asc_getIsFreezePane());
            }
        },

        onApiEditCell: function(state) {
            if ( state == Asc.c_oAscCellEditorState.editStart )
                this.header.lockHeaderBtns('opts', true); else
            if ( state == Asc.c_oAscCellEditorState.editEnd )
                this.header.lockHeaderBtns('opts', false);
        },

        onCellsRange: function(status) {
            this.onApiEditCell(status != Asc.c_oAscSelectionDialogType.None ? Asc.c_oAscCellEditorState.editStart : Asc.c_oAscCellEditorState.editEnd);
        },

        onOptionsItemClick: function (menu, item, e) {
            var me = this;

            switch ( item.value ) {
            case 'toolbar': me.header.fireEvent('toolbar:setcompact', [menu, item.isChecked()]); break;
            case 'formula': me.header.fireEvent('formulabar:hide', [item.isChecked()]); break;
            case 'headings': me.api.asc_setDisplayHeadings(!item.isChecked()); break;
            case 'gridlines': me.api.asc_setDisplayGridlines(!item.isChecked()); break;
            case 'freezepanes': me.api.asc_freezePane(); break;
            case 'advanced': me.header.fireEvent('file:settings', me.header); break;
            }
        },

        onApiCoAuthoringDisconnect: function(enableDownload) {
            if (this.header) {
                if (this.header.btnDownload && !enableDownload)
                    this.header.btnDownload.hide();
                if (this.header.btnPrint && !enableDownload)
                    this.header.btnPrint.hide();
                if (this.header.btnEdit)
                    this.header.btnEdit.hide();
            }
        },

        textHideFBar: 'Hide Formula Bar',
        textHideHeadings: 'Hide Headings',
        textHideGridlines: 'Hide Gridlines',
        textFreezePanes: 'Freeze Panes'
    }, SSE.Controllers.Viewport));
});
