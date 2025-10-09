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
 *  Toolbar.js
 *
 *  Toolbar Controller
 *
 *  Created on 11/07/24
 *
 */

define([
    'core',
    'common/main/lib/component/Window',
    'visioeditor/main/app/view/Toolbar'
], function () {
    'use strict';

    VE.Controllers.Toolbar = Backbone.Controller.extend(_.extend({
        models: [],
        collections: [],
        controllers: [],
        views: [
            'Toolbar'
        ],

        initialize: function() {
            this._state = {
                activated: false,
                initEditing: true
            };
            this.editMode = true;
            this.binding = {};

            this.addListeners({
                'Toolbar': {
                    'change:compact'    : this.onClickChangeCompact,
                    'tab:collapse'      : this.onTabCollapse
                },
                'FileMenu': {
                    'menu:hide': this.onFileMenu.bind(this, 'hide'),
                    'menu:show': this.onFileMenu.bind(this, 'show'),
                },
                'Common.Views.Header': {
                    'print': function (opts) {
                        var _main = this.getApplication().getController('Main');
                        _main.onPrint();
                    },
                    'print-quick': function (opts) {
                        var _main = this.getApplication().getController('Main');
                        _main.onPrintQuick();
                    },
                    'downloadas': function (opts) {
                        var _main = this.getApplication().getController('Main');
                        var _file_type = _main.document.fileType,
                            _format;
                        if ( !!_file_type ) {
                            _format = Asc.c_oAscFileType[ _file_type.toUpperCase() ];
                        }

                        var _supported = [
                            Asc.c_oAscFileType.VSDX,
                            Asc.c_oAscFileType.PDFA,
                            Asc.c_oAscFileType.PNG,
                            Asc.c_oAscFileType.JPG
                        ];

                        if ( !_format || _supported.indexOf(_format) < 0 )
                            _format = Asc.c_oAscFileType.PDF;

                        _main.api.asc_DownloadAs(new Asc.asc_CDownloadOptions(_format));
                    },
                    'go:editor': function() {
                        // Common.Gateway.requestEditRights();
                    }
                },
                'ViewTab': {
                    'toolbar:setcompact': this.onChangeCompactView.bind(this)
                }
            });

            Common.NotificationCenter.on('toolbar:collapse', _.bind(function () {
                this.toolbar.collapse();
            }, this));
            Common.NotificationCenter.on('tab:set-active', _.bind(function(action){
                this.toolbar.setTab(action);
                this.onChangeCompactView(null, false, true);
            }, this));
        },

        onLaunch: function() {
            // Create toolbar view
            this.toolbar = this.createView('Toolbar');
            this.toolbar.on('render:before', function (cmp) {
            });

            Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            Common.NotificationCenter.on('app:face', this.onAppShowed.bind(this));
        },

        setMode: function(mode) {
            var _main = this.getApplication().getController('Main');
            this.mode = mode;
            this.toolbar.applyLayout(mode);
            Common.UI.TooltipManager.addTips({
                'refreshFile' : {text: _main.textUpdateVersion, header: _main.textUpdating, target: '#toolbar', maxwidth: 'none', showButton: false, automove: true, noHighlight: true, noArrow: true, multiple: true},
                'disconnect' : {text: _main.textConnectionLost, header: _main.textDisconnect, target: '#toolbar', maxwidth: 'none', showButton: false, automove: true, noHighlight: true, noArrow: true, multiple: true},
                'updateVersion' : {text: _main.errorUpdateVersionOnDisconnect, header: _main.titleUpdateVersion, target: '#toolbar', maxwidth: 600, showButton: false, automove: true, noHighlight: true, noArrow: true, multiple: true},
                'sessionIdle' : {text: _main.errorSessionIdle, target: '#toolbar', maxwidth: 600, showButton: false, automove: true, noHighlight: true, noArrow: true, multiple: true},
                'sessionToken' : {text: _main.errorSessionToken, target: '#toolbar', maxwidth: 600, showButton: false, automove: true, noHighlight: true, noArrow: true, multiple: true}
            });
        },

        attachCommonUIEvents: function(toolbar) {
        },

        attachEditUIEvents: function(toolbar) {
            if (!this.mode || !this.mode.isEdit) return;
        },

        attachUIEvents: function(toolbar) {
            /**
             * UI Events
             */
            this.attachCommonUIEvents(toolbar);
            if (this.mode.isEdit) {
                this.attachEditUIEvents(toolbar);
            }
        },

        attachCommonApiEvents: function() {
            this.api.asc_registerCallback('asc_onDownloadUrl',  _.bind(this.onDownloadUrl, this));
            this.api.asc_registerCallback('onPluginToolbarMenu', _.bind(this.onPluginToolbarMenu, this));
            this.api.asc_registerCallback('onPluginToolbarCustomMenuItems', _.bind(this.onPluginToolbarCustomMenuItems, this));
            this.api.asc_registerCallback('onPluginUpdateToolbarMenu', _.bind(this.onPluginUpdateToolbarMenu, this));
            Common.NotificationCenter.on('document:ready', _.bind(this.onDocumentReady, this));
        },

        attachEditApiEvents: function() {
            if (!this.mode.isEdit) return;

            // this.api.asc_registerCallback('asc_onFocusObject',          _.bind(this.onApiFocusObject, this));
        },

        setApi: function(api) {
            this.api = api;
            this.attachCommonApiEvents();

            if (this.mode.isEdit) {
                this.attachEditApiEvents();
            }
        },

        onChangeCompactView: function(view, compact, suppressSave) {
            this.toolbar.setFolded(compact);
            this.toolbar.fireEvent('view:compact', [this, compact]);

            compact && this.onTabCollapse();

            !suppressSave && Common.localStorage.setBool(this.mode.isEdit ? "ve-compact-toolbar" : "ve-view-compact-toolbar", compact);

            Common.NotificationCenter.trigger('layout:changed', 'toolbar');
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onClickChangeCompact: function (from) {
            if ( from != 'file' ) {
                var me = this;
                setTimeout(function () {
                    me.onChangeCompactView(null, !me.toolbar.isCompact());
                }, 0);
            }
        },

        onNewDocument: function(btn, e) {
            if (this.api)
                this.api.OpenNewDocument();

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'New Document');
        },

        onOpenDocument: function(btn, e) {
            if (this.api)
                this.api.LoadDocumentFromDisk();

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            Common.component.Analytics.trackEvent('ToolBar', 'Open Document');
        },

        onDownloadUrl: function(url, fileType) {
            if (this._state.isFromToolbarDownloadAs) {
                var me = this,
                    defFileName = this.getApplication().getController('Viewport').getView('Common.Views.Header').getDocumentCaption();
                !defFileName && (defFileName = me.txtUntitled);

                if (me.toolbar.mode.canRequestSaveAs) {
                    Common.Gateway.requestSaveAs(url, defFileName, fileType);
                } else {
                    me._saveCopyDlg = new Common.Views.SaveAsDlg({
                        saveFolderUrl: me.toolbar.mode.saveAsUrl,
                        saveFileUrl: url,
                        defFileName: defFileName
                    });
                    me._saveCopyDlg.on('saveaserror', function(obj, err){
                        Common.UI.warning({
                            closable: false,
                            msg: err,
                            callback: function(btn){
                                Common.NotificationCenter.trigger('edit:complete', me);
                            }
                        });
                    }).on('close', function(obj){
                        me._saveCopyDlg = undefined;
                    });
                    me._saveCopyDlg.show();
                }
            }
            this._state.isFromToolbarDownloadAs = false;
        },

        activateControls: function() {
            this.toolbar.lockToolbar(Common.enumLock.disableOnStart, false);
            this._state.activated = true;
        },

        onHideMenus: function(e){
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onApiCoAuthoringDisconnect: function(enableDownload) {
            (this.mode.isEdit) && this.toolbar.setMode({isDisconnected:true, enableDownload: !!enableDownload});
            this.editMode = false;
            this.DisableToolbar(true, true);
        },

        DisableToolbar: function(disable, viewMode) {
            if (viewMode!==undefined) this.editMode = !viewMode;
            disable = disable || !this.editMode;

            var mask = $('.toolbar-mask');
            if (disable && mask.length>0 || !disable && mask.length==0) return;

            var toolbar = this.toolbar;
            toolbar.hideMoreBtns();
            toolbar.$el.find('.toolbar').toggleClass('masked', disable);

            if(disable) {
                mask = $("<div class='toolbar-mask'>").appendTo(toolbar.$el.find('.toolbar'));
            } else {
                mask.remove();
            }
        },

        createDelayedElements: function() {
            this.toolbar.createDelayedElements();
            this.attachUIEvents(this.toolbar);
            Common.Utils.injectSvgIcons();
        },

        onAppShowed: function (config) {
            var me = this;

            var editmode = config.isEdit,
                compactview = !editmode;
            if ( Common.localStorage.itemExists(editmode ? "ve-compact-toolbar" : "ve-view-compact-toolbar") ) {
                compactview = Common.localStorage.getBool(editmode ? "ve-compact-toolbar" : "ve-view-compact-toolbar");
            } else if (config.customization) {
                compactview = editmode ? !!config.customization.compactToolbar : config.customization.compactToolbar!==false;
            }
            Common.Utils.InternalSettings.set('toolbar-active-tab', !editmode && !compactview);

            me.toolbar.render(_.extend({compactview: editmode ? compactview : true}, config));

            if ( config.isEdit) {
                me.toolbar.setMode(config);
                if (!config.compactHeader) {
                    me.toolbar.processPanelVisible(null, true);
                }
            }
            var tab = {caption: me.toolbar.textTabView, action: 'view', extcls: config.isEdit ? 'canedit' : '', layoutname: 'toolbar-view', dataHintTitle: 'W'};
            var viewtab = me.getApplication().getController('ViewTab');
            viewtab.setApi(me.api).setConfig({toolbar: me, mode: config});
            var $panel = viewtab.createToolbarPanel();
            if ($panel) {
                var visible = Common.UI.LayoutManager.isElementVisible('toolbar-view');
                me.toolbar.addTab(tab, $panel, 8);
                me.toolbar.setVisible('view', visible);
                !editmode && !compactview && visible && Common.Utils.InternalSettings.set('toolbar-active-tab', 'view'); // need to activate later
            }
        },

        onAppReady: function (config) {
            var me = this;
            me.appOptions = config;

            (new Promise(function(accept) {
                accept();
            })).then(function () {
            });
        },

        getView: function (name) {
            return !name ? this.toolbar : Backbone.Controller.prototype.getView.apply(this, arguments);
        },

        onFileMenu: function (opts) {
            if ( opts == 'show' ) {
                if ( !this.toolbar.isTabActive('file') )
                    this.toolbar.setTab('file');
            } else {
                if ( this.toolbar.isTabActive('file') )
                    this.toolbar.setTab();
            }
        },

        onTabCollapse: function(tab) {
        },

        onPluginToolbarMenu: function(data) {
            var api = this.api;
            this.toolbar && Array.prototype.push.apply(this.toolbar.lockControls, Common.UI.LayoutManager.addCustomControls(this.toolbar, data, function(guid, value, pressed) {
                api && api.onPluginToolbarMenuItemClick(guid, value, pressed);
            }));
        },

        onPluginToolbarCustomMenuItems: function(action, data) {
            if (!this._isDocReady) {
                this._state.customPluginData = (this._state.customPluginData || []).concat([{action: action, data: data}]);
                return;
            }
            var api = this.api;
            this.toolbar && Common.UI.LayoutManager.addCustomMenuItems(action, data, function(guid, value) {
                api && api.onPluginContextMenuItemClick(guid, value);
            });
        },

        onPluginUpdateToolbarMenu: function(data) {
            var api = this.api;
            this.toolbar && Array.prototype.push.apply(this.toolbar.lockControls, Common.UI.LayoutManager.addCustomControls(this.toolbar, data, function(guid, value, pressed) {
                api && api.onPluginToolbarMenuItemClick(guid, value, pressed);
            }, true));
        },

        onDocumentReady: function() {
            this._isDocReady = true;
            var me = this;
            this._state.customPluginData && this._state.customPluginData.forEach(function(plugin) {
                me.onPluginToolbarCustomMenuItems(plugin.action, plugin.data);
            });
            this._state.customPluginData = null;
        },

        txtUntitled: 'Untitled'

    }, VE.Controllers.Toolbar || {}));
});
