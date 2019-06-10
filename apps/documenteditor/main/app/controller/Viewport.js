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
 *  Viewport.js
 *
 *  This is out main controller which will do most of job
 *  It will listen for view and collection events and manage all data-related operations
 *
 *  Created by Alexander Yuzhin on 1/15/14
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'common/main/lib/view/Header',
    'documenteditor/main/app/view/Viewport',
    'documenteditor/main/app/view/LeftMenu'
], function (Viewport) {
    'use strict';

    DE.Controllers.Viewport = Backbone.Controller.extend(_.assign({
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
            // This most important part when we will tell our controller what events should be handled

            var me = this;
            this.addListeners({
                'FileMenu': {
                    'menu:hide': me.onFileMenu.bind(me, 'hide'),
                    'menu:show': me.onFileMenu.bind(me, 'show')
                },
                'Toolbar': {
                    'render:before' : function (toolbar) {
                        var config = DE.getController('Main').appOptions;
                        toolbar.setExtra('right', me.header.getPanel('right', config));
                        if (!config.isEdit || config.customization && !!config.customization.compactHeader)
                            toolbar.setExtra('left', me.header.getPanel('left', config));
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
                        if ( me.header.btnRedo )
                            if ( me.header.btnRedo.keepState )
                                me.header.btnRedo.keepState.disabled = state;
                            else me.header.btnRedo.setDisabled(state);
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
        },

        setApi: function(api) {
            this.api = api;
            this.api.asc_registerCallback('asc_onZoomChange', this.onApiZoomChange.bind(this));
            this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',this.onApiCoAuthoringDisconnect.bind(this));
            Common.NotificationCenter.on('api:disconnect',              this.onApiCoAuthoringDisconnect.bind(this));
        },


        // When our application is ready, lets get started
        onLaunch: function() {
            // Create and render main view
            this.viewport = this.createView('Viewport').render();
            this.header   = this.createView('Common.Views.Header', {
                headerCaption: 'Document Editor',
                storeUsers: DE.getCollection('Common.Collections.Users')
            });

            Common.NotificationCenter.on('layout:changed', _.bind(this.onLayoutChanged, this));
            $(window).on('resize', _.bind(this.onWindowResize, this));

            var leftPanel = $('#left-menu'),
                histPanel = $('#left-panel-history');
            this.viewport.hlayout.on('layout:resizedrag', function() {
                this.api.Resize();
                Common.localStorage.setItem('de-mainmenu-width', histPanel.is(':visible') ? (histPanel.width()+SCALE_MIN) : leftPanel.width() );
            }, this);

            this.boxSdk = $('#editor_sdk');
            this.boxSdk.css('border-left', 'none');

            this.header.mnuitemFitPage = this.header.fakeMenuItem();
            this.header.mnuitemFitWidth = this.header.fakeMenuItem();

            Common.NotificationCenter.on('app:face', this.onAppShowed.bind(this));
            Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
        },

        onAppShowed: function (config) {
            var me = this;
            me.appConfig = config;

            var _intvars = Common.Utils.InternalSettings;
            var $filemenu = $('.toolbar-fullview-panel');
            $filemenu.css('top', _intvars.get('toolbar-height-tabs'));

            if ( !config.isEdit ||
                ( !Common.localStorage.itemExists("de-compact-toolbar") &&
                config.customization && config.customization.compactToolbar )) {

                var panel = me.viewport.vlayout.getItem('toolbar');
                if ( panel ) panel.height = _intvars.get('toolbar-height-tabs');
            }

            if ( config.customization ) {
                if ( config.customization.toolbarNoTabs )
                    me.viewport.vlayout.getItem('toolbar').el.addClass('style-off-tabs');

                if ( config.customization.toolbarHideFileName )
                    me.viewport.vlayout.getItem('toolbar').el.addClass('style-skip-docname');
            }

            if ( config.isEdit && (!(config.customization && config.customization.compactHeader))) {
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

                toolbar = me.getApplication().getController('Toolbar').getView();
                toolbar.btnCollabChanges = me.header.btnSave;
            }
        },

        onAppReady: function (config) {
            var me = this;
            if ( me.header.btnOptions ) {
                var compactview = !config.isEdit;
                if ( config.isEdit ) {
                    if ( Common.localStorage.itemExists("de-compact-toolbar") ) {
                        compactview = Common.localStorage.getBool("de-compact-toolbar");
                    } else
                    if ( config.customization && config.customization.compactToolbar )
                        compactview = true;
                }

                me.header.mnuitemCompactToolbar = new Common.UI.MenuItem({
                    caption: me.header.textCompactView,
                    checked: compactview,
                    checkable: true,
                    value: 'toolbar'
                });
                if (!config.isEdit) {
                    me.header.mnuitemCompactToolbar.hide();
                    Common.NotificationCenter.on('tab:visible', _.bind(function(action, visible){
                        if ((action=='plugins' || action=='review') && visible) {
                            me.header.mnuitemCompactToolbar.show();
                        }
                    }, this));
                }

                var mnuitemHideStatusBar = new Common.UI.MenuItem({
                    caption: me.header.textHideStatusBar,
                    checked: Common.localStorage.getBool("de-hidden-status"),
                    checkable: true,
                    value: 'statusbar'
                });

                if ( config.canBrandingExt && config.customization && config.customization.statusBar === false )
                    mnuitemHideStatusBar.hide();

                var mnuitemHideRulers = new Common.UI.MenuItem({
                    caption: me.header.textHideLines,
                    checked: Common.localStorage.getBool("de-hidden-rulers"),
                    checkable: true,
                    value: 'rulers'
                });
                if (!config.isEdit)
                    mnuitemHideRulers.hide();

                me.header.mnuitemFitPage = new Common.UI.MenuItem({
                    caption: me.textFitPage,
                    checkable: true,
                    checked: me.header.mnuitemFitPage.isChecked(),
                    value: 'zoom:page'
                });

                me.header.mnuitemFitWidth = new Common.UI.MenuItem({
                    caption: me.textFitWidth,
                    checkable: true,
                    checked: me.header.mnuitemFitWidth.isChecked(),
                    value: 'zoom:width'
                });

                me.header.mnuZoom = new Common.UI.MenuItem({
                    template: _.template([
                        '<div id="hdr-menu-zoom" class="menu-zoom" style="height: 25px;" ',
                            '<% if(!_.isUndefined(options.stopPropagation)) { %>',
                                'data-stopPropagation="true"',
                            '<% } %>', '>',
                            '<label class="title">' + me.header.textZoom + '</label>',
                            '<button id="hdr-menu-zoom-in" type="button" style="float:right; margin: 2px 5px 0 0;" class="btn small btn-toolbar"><i class="icon btn-zoomup">&nbsp;</i></button>',
                            '<label class="zoom"><%= options.value %>%</label>',
                            '<button id="hdr-menu-zoom-out" type="button" style="float:right; margin-top: 2px;" class="btn small btn-toolbar"><i class="icon btn-zoomdown">&nbsp;</i></button>',
                        '</div>'
                    ].join('')),
                    stopPropagation: true,
                    value: me.header.mnuZoom.options.value
                });

                me.header.btnOptions.setMenu(new Common.UI.Menu({
                        cls: 'pull-right',
                        style: 'min-width: 180px;',
                        items: [
                            me.header.mnuitemCompactToolbar,
                            mnuitemHideStatusBar,
                            mnuitemHideRulers,
                            {caption:'--'},
                            me.header.mnuitemFitPage,
                            me.header.mnuitemFitWidth,
                            me.header.mnuZoom,
                            {caption:'--'},
                            new Common.UI.MenuItem({
                                caption: me.header.textAdvSettings,
                                value: 'advanced'
                            })
                        ]
                    })
                );

                var _on_btn_zoom = function (btn) {
                    btn == 'up' ? me.api.zoomIn() : me.api.zoomOut();
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

        onLayoutChanged: function(area) {
            switch (area) {
            default:
                this.viewport.vlayout.doLayout();
            case 'rightmenu':
                this.viewport.hlayout.doLayout();
                break;
            case 'history':
                var panel = this.viewport.hlayout.items[1];
                if (panel.resize.el) {
                    this.boxSdk.css('border-left', '');
                    panel.resize.el.show();
                }
                this.viewport.hlayout.doLayout();
                break;
            case 'leftmenu':
                var panel = this.viewport.hlayout.items[0];
                if (panel.resize.el) {
                    if (panel.el.width() > 40) {
                        this.boxSdk.css('border-left', '');
                        panel.resize.el.show();
                    } else {
                        panel.resize.el.hide();
                        this.boxSdk.css('border-left', '0 none');
                    }
                }
                this.viewport.hlayout.doLayout();
                break;
            case 'header':
            case 'toolbar':
            case 'status':
                this.viewport.vlayout.doLayout();
                break;
            }
            this.api.Resize();
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

        onApiZoomChange: function(percent, type) {
            this.header.mnuitemFitPage.setChecked(type == 2, true);
            this.header.mnuitemFitWidth.setChecked(type == 1, true);
            this.header.mnuZoom.options.value = percent;

            if ( this.header.mnuZoom.$el )
                $('.menu-zoom label.zoom', this.header.mnuZoom.$el).html(percent + '%');
        },

        onOptionsItemClick: function (menu, item, e) {
            var me = this;

            switch ( item.value ) {
            case 'toolbar': me.header.fireEvent('toolbar:setcompact', [menu, item.isChecked()]); break;
            case 'statusbar': me.header.fireEvent('statusbar:hide', [item, item.isChecked()]); break;
            case 'rulers':
                me.api.asc_SetViewRulers(!item.isChecked());
                Common.localStorage.setBool('de-hidden-rulers', item.isChecked());
                Common.NotificationCenter.trigger('layout:changed', 'rulers');
                Common.NotificationCenter.trigger('edit:complete', me.header);
                break;
            case 'zoom:page':
                item.isChecked() ? me.api.zoomFitToPage() : me.api.zoomCustomMode();
                Common.NotificationCenter.trigger('edit:complete', me.header);
                break;
            case 'zoom:width':
                item.isChecked() ? me.api.zoomFitToWidth() : me.api.zoomCustomMode();
                Common.NotificationCenter.trigger('edit:complete', me.header);
                break;
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

        textFitPage: 'Fit to Page',
        textFitWidth: 'Fit to Width'
    }, DE.Controllers.Viewport));
});
